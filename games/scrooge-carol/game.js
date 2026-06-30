/* ============================================================================
 * A CHRISTMAS CAROL — SCROOGE'S LONG NIGHT
 * Five chapters through Dickens' 1843 novella, each a distinct mini-game:
 *   1. MARLEY'S CHAINS    — dodge flying chains, collect shillings (vertical dodge)
 *   2. CHRISTMAS PAST     — tap glowing memory wisps before they fade (tap-collect)
 *   3. CHRISTMAS PRESENT  — catch the Cratchit feast on a sliding table (catch)
 *   4. YET TO COME        — dodge the Shadow's lane-pointing finger (lane dodge)
 *   5. CHRISTMAS MORNING  — run & jump through London on a changed Christmas day
 * Built on RetroSaga (js/saga.js).
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ----------------------------- EMBLEM: candle ----------------------------- */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    c.globalAlpha = 0.18;
    g.circle(cx, cy - 20, 34, '#f8d068');
    c.globalAlpha = 1;
    // flame
    g.sprite([
      '.ff.',
      'fyff',
      '.ff.',
    ], cx - 6, cy - 44, { f: '#f09020', y: '#fff890' }, 4);
    // candle body
    g.rect(cx - 9, cy - 32, 18, 44, '#e8d8b8');
    g.rect(cx - 9, cy - 32, 18, 5, '#d0c0a0');
    // wax drips
    g.rect(cx - 9, cy + 7, 3, 5, '#e8d8b8');
    g.rect(cx + 6, cy + 4, 3, 8, '#e8d8b8');
    // holder plate
    g.rect(cx - 17, cy + 12, 34, 5, '#c8a040');
    g.rect(cx - 23, cy + 15, 46, 3, '#a07820');
  }

  /* ------------------- SCENERY: Victorian London winter night --------------- */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Night sky gradient
    const sky = c.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, '#040810');
    sky.addColorStop(0.5, '#080e1c');
    sky.addColorStop(1, '#0c1428');
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 28; i++) {
      const sx = (i * 73 + 11) % W;
      const sy = (i * 57 + 9) % Math.floor(H * 0.44);
      c.globalAlpha = 0.22 + 0.18 * Math.sin(t * 1.1 + i * 0.8);
      g.rect(sx, sy, 1, 1, '#c8d8f0');
    }
    c.globalAlpha = 1;

    // Moon
    if (scene !== 'menu') {
      g.circle(W - 46, 38, 15, '#d0e0f0');
      g.circle(W - 40, 32, 12, '#080e1c');
    }

    // Falling snow
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 51 + t * 14 + i * 9) % (W + 12)) - 6;
      const sy = ((i * 73 + t * 22 + i * 28) % (H * 0.82));
      c.globalAlpha = 0.32;
      g.rect(sx, sy, 2, 2, '#d8ecff');
    }
    c.globalAlpha = 1;

    // Victorian rooftop silhouettes
    const baseY = H - 96;
    const bldgs = [
      { x: 0,   w: 44, h: 80 },
      { x: 42,  w: 28, h: 52 },
      { x: 68,  w: 48, h: 96 },
      { x: 114, w: 34, h: 66 },
      { x: 146, w: 42, h: 88 },
      { x: 186, w: 46, h: 62 },
      { x: 230, w: 40, h: 78 },
    ];
    for (const b of bldgs) {
      c.fillStyle = '#050710';
      c.fillRect(b.x, baseY - b.h, b.w, b.h + 100);
      // chimneys
      c.fillRect(b.x + 7,       baseY - b.h - 14, 7, 16);
      c.fillRect(b.x + b.w - 14, baseY - b.h - 10, 7, 12);
      // amber gaslit windows
      const glo = 0.28 + 0.1 * Math.sin(t * 1.6 + b.x * 0.05);
      c.globalAlpha = glo;
      g.rect(b.x + 7,       baseY - b.h + 12, 9, 11, '#e8a028');
      g.rect(b.x + b.w - 16, baseY - b.h + 12, 9, 11, '#e8a028');
      c.globalAlpha = 1;
    }

    // Snowy ground
    g.rect(0, H - 98, W, 5, '#b0c0d0');
    g.rect(0, H - 95, W, 95, '#c8d8e8');

    // Gaslight posts
    for (let i = 0; i < 3; i++) {
      const lx = 30 + i * 104;
      g.rect(lx, H - 138, 3, 46, '#3a4858');
      g.rect(lx - 7, H - 146, 17, 10, '#3a4858');
      c.globalAlpha = 0.3 + 0.1 * Math.sin(t * 1.8 + i);
      g.circle(lx + 1, H - 141, 13, '#f8d068');
      c.globalAlpha = 1;
      g.rect(lx - 1, H - 143, 5, 5, '#f0c038');
    }

    // Scene-dependent overlay
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(4,8,18,.72)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(4,8,18,.46)';
      c.fillRect(0, 0, W, H);
    }
  }

  /* ====================================================================
   * RETROSAGA CONFIGURATION
   * ==================================================================== */
  RetroSaga.create({
    id: 'scrooge',
    title: "SCROOGE'S LONG NIGHT",
    subtitle: 'A TALE OF THREE SPIRITS',
    currency: 'GOODWILL',

    screens: {
      win:          '#d4a020',
      lose:         '#4a6090',
      chapterLabel: '#7a9090',
      name:         '#f0e8cc',
      sub:          '#e8b84a',
      intro:        '#d8c8a0',
      quote:        '#7a8898',
      help:         '#d4a020',
      score:        '#f0e8cc',
      cur:          '#e8b84a',
      cta:          '#f0e8cc',
      overlay:      'rgba(4,8,20,.86)',
    },
    labels: {
      chapter: 'CHAPTER',
      score:   'GOODWILL EARNED',
      win:     'THE SPIRIT APPROVES',
      lose:    'THE NIGHT GROWS COLDER',
      cont:    'TAP TO PRESS ON',
      finale:  'TAP TO SEE THE DAWN',
      toMenu:  'RETURN TO LONDON',
      play:    'TAP TO BEGIN',
    },

    accent:    '#d4a020',
    credit:    'AN 8-BIT TRIBUTE · CHARLES DICKENS, 1843',
    emblem,
    scenery,
    bootCta:   'TAP TO OPEN THE DOOR',
    menuLabel: 'A CHRISTMAS CAROL',
    menuHint:  'CHOOSE A CHAPTER TO BEGIN',
    menuDone:  'GOD BLESS US, EVERY ONE!',

    /* ------------ MENU: five glowing windows on Victorian terraced houses ---- */
    menu: {
      colors: { title: '#d4a020', label: '#7a9090', cur: '#f0e8cc' },

      // Scattered street-scene layout — windows at different heights on a row of houses
      layout(api) {
        return [
          { x: 12,  y: 96,  w: 74, h: 82 }, // ch1: left, upper
          { x: 184, y: 78,  w: 74, h: 82 }, // ch2: right, top
          { x: 96,  y: 158, w: 74, h: 82 }, // ch3: centre
          { x: 8,   y: 262, w: 74, h: 82 }, // ch4: left, lower
          { x: 184, y: 232, w: 74, h: 82 }, // ch5: right, mid-low
        ];
      },

      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;

        // Brick facade
        c.fillStyle = sel ? '#241810' : '#160e08';
        c.fillRect(x, y, w, h);
        c.fillStyle = sel ? '#2c1e12' : '#1c1208';
        for (let row = 0; row < Math.ceil(h / 9); row++) {
          for (let col = 0; col < Math.ceil(w / 15); col++) {
            const bx = x + col * 15 + (row % 2 ? 7 : 0);
            const by = y + row * 9;
            c.fillRect(bx, by, 13, 7);
          }
        }

        // Window frame
        const wx = x + w / 2 - 17, wy = y + 14, ww = 34, wh = 38;
        c.fillStyle = '#2a1c10';
        c.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);

        // Window glass (amber glow, fixed intensity per-window so no Date.now needed)
        const glowBase = done ? 0.28 : (sel ? 0.9 : 0.48 + 0.18 * Math.sin(i * 2.1));
        c.globalAlpha = glowBase;
        c.fillStyle = done ? '#3a2810' : '#e8a028';
        c.fillRect(wx, wy, ww, wh);
        c.globalAlpha = 1;

        // Window cross-pane dividers
        c.fillStyle = '#2a1c10';
        c.fillRect(wx + ww / 2 - 1, wy, 2, wh);
        c.fillRect(wx, wy + wh / 2 - 1, ww, 2);

        // Window border
        c.strokeStyle = sel ? '#d4a020' : '#4a3418';
        c.lineWidth = sel ? 2 : 1;
        c.strokeRect(wx - 4, wy - 4, ww + 8, wh + 8);

        // Chapter label
        api.txtCFit((i + 1) + '. ' + ch.name, x + w / 2, y + h - 28, 6,
          done ? '#d4a020' : '#c8a868', false, w - 6);
        if (ch.sub) {
          api.txtCFit(ch.sub, x + w / 2, y + h - 16, 5,
            sel ? '#e8b84a' : '#6a7858', false, w - 6);
        }
        if (done) api.txtC('★', x + w / 2, y + 4, 8, '#d4a020');

        // Selection glow border
        if (sel) {
          c.strokeStyle = '#d4a020';
          c.lineWidth = 2;
          c.globalAlpha = 0.45 + 0.3 * Math.sin((api.t || 0) * 3);
          c.strokeRect(x + 1, y + 1, w - 2, h - 2);
          c.globalAlpha = 1;
        }
      },
    },

    finale: [
      '"GOD BLESS US,',
      'EVERY ONE!"',
      '',
      'SCROOGE KEPT CHRISTMAS',
      'BETTER THAN ANY MAN.',
    ],

    width: 270, height: 480, parent: '#game',
    palette: { gold: '#d4a020', blood: '#8a2030' },

    chapters: [

      /* ========================== 1. MARLEY'S CHAINS ========================= */
      {
        id: 'marley',
        name: "MARLEY'S CHAINS",
        sub: "JACOB'S WARNING",

        icon(api, x, y) {
          const c = api.ctx;
          c.strokeStyle = '#8a9898'; c.lineWidth = 2;
          c.beginPath(); c.arc(x - 4, y, 4, 0, Math.PI * 2); c.stroke();
          c.beginPath(); c.arc(x + 4, y, 4, 0, Math.PI * 2); c.stroke();
        },

        intro: [
          'JACOB MARLEY APPEARS,',
          'BOUND IN HEAVY CHAINS',
          'FORGED THROUGH A LIFE',
          'of greed. Dodge the links!',
        ],
        quote: 'I wear the chain I forged in life. I made it link by link.',
        help: 'DRAG up/down to dodge chains · catch the shillings',
        winText: 'The spectre fades with a mournful wail. Scrooge sits, trembling.',
        loseText: "The chains wind tight. Marley howls: 'Hear me, Ebenezer!'",

        init(api) {
          this.scrY   = api.H / 2;
          this.tgtY   = api.H / 2;
          this.lives  = 3;
          this.timer  = 28;
          this.chains = [];
          this.spawnT = 1.2;
          this.coins  = [];
          this.coinT  = 1.6;
          this.hitCool = 0;
          this.spd    = 1.0;
        },

        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.hitCool = Math.max(0, this.hitCool - dt);
          this.spd = 1 + (28 - Math.max(0, this.timer)) / 40;

          // Scrooge moves vertically
          if (api.pointer.down) this.tgtY = api.pointer.y;
          if (api.keyDown('up'))   this.tgtY -= 4 * f;
          if (api.keyDown('down')) this.tgtY += 4 * f;
          this.tgtY = clamp(this.tgtY, 58, api.H - 55);
          this.scrY += (this.tgtY - this.scrY) * 0.2 * f;

          // Spawn chains (horizontal bands at fixed Y, moving L or R)
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.45, 1.2 - (28 - Math.max(0, this.timer)) / 56);
            const fromLeft = Math.random() < 0.5;
            const cy = 70 + Math.random() * (api.H - 156);
            const spd = (2.8 + Math.random() * 1.5) * this.spd;
            const cw  = 44 + Math.random() * 28;
            this.chains.push({
              x:  fromLeft ? -cw / 2 - 12 : api.W + cw / 2 + 12,
              y:  cy,
              vx: fromLeft ? spd : -spd,
              w:  cw,
              hit: false,
            });
          }

          // Move chains
          for (const ch of this.chains) ch.x += ch.vx * f;
          this.chains = this.chains.filter(ch => ch.x > -140 && ch.x < api.W + 140);

          // Spawn shilling coins
          this.coinT -= dt;
          if (this.coinT <= 0) {
            this.coinT = 0.8 + Math.random() * 0.8;
            this.coins.push({ x: 22 + Math.random() * (api.W - 44), y: -8, vy: 1.4 });
          }
          for (const co of this.coins) co.y += co.vy * f;

          // Collect coins
          const scrX = api.W / 2;
          for (const co of this.coins) {
            if (!co.gone && Math.hypot(co.x - scrX, co.y - this.scrY) < 20) {
              co.gone = true;
              api.addScore(12);
              api.audio.sfx('coin');
              api.burst(co.x, co.y, '#d4a020', 5);
            }
          }
          this.coins = this.coins.filter(co => co.y < api.H + 22 && !co.gone);

          // Chain collision (only if not invincible)
          if (this.hitCool <= 0) {
            for (const ch of this.chains) {
              if (ch.hit) continue;
              const cx1 = ch.x - ch.w / 2, cx2 = ch.x + ch.w / 2;
              if (cx1 < scrX + 8 && cx2 > scrX - 8) {
                if (Math.abs(ch.y - this.scrY) < 18) {
                  ch.hit = true;
                  this.lives--;
                  this.hitCool = 0.85;
                  api.shake(6, 0.3);
                  api.flash('#1a2848', 0.22);
                  api.audio.sfx('hurt');
                  if (this.lives <= 0) { api.lose(); return; }
                }
              }
            }
          }

          if (this.timer <= 0) { api.addScore(40 + this.lives * 30); api.win(); }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#060810'; c.fillRect(0, 0, W, H);

          // Fireplace glow (bottom)
          c.globalAlpha = 0.14;
          g.circle(W / 2, H + 10, 70, '#e07020');
          c.globalAlpha = 1;
          g.rect(W / 2 - 26, H - 38, 52, 34, '#18100a');
          g.rect(W / 2 - 21, H - 32, 42, 24, '#241808');
          c.globalAlpha = 0.55 + 0.2 * Math.sin(api.t * 9);
          g.sprite(['.ff.', 'ffff', 'f..f'], W / 2 - 8, H - 28, { f: '#e05810' }, 4);
          c.globalAlpha = 1;

          // Wall panelling
          c.globalAlpha = 0.07;
          for (let y = 60; y < H - 40; y += 38) g.rect(0, y, W, 1, '#8090a0');
          c.globalAlpha = 1;

          // Marley ghost (floating, translucent, oscillating)
          const gx = W / 2 + Math.sin(api.t * 1.3) * 18;
          const gy = 50 + Math.sin(api.t * 0.7) * 10;
          c.globalAlpha = 0.42 + 0.15 * Math.sin(api.t * 2.2);
          g.sprite([
            '..ggg..',
            '.ggggg.',
            'ggwwwgg',
            'ggwwwgg',
            '.ggggg.',
            '...g...',
          ], gx - 14, gy - 14, { g: '#8090b8', w: '#c0d0e8' }, 4);
          c.globalAlpha = 1;

          // Chains (horizontal bands)
          for (const ch of this.chains) {
            const x1 = ch.x - ch.w / 2, x2 = ch.x + ch.w / 2;
            for (let lx = x1; lx < x2; lx += 10) {
              const even = Math.floor((lx - x1) / 10) % 2 === 0;
              g.rect(Math.round(lx), ch.y - 4, 8, 8, even ? '#6a7888' : '#8a9aa8');
            }
            c.strokeStyle = '#4a5868'; c.lineWidth = 1;
            c.strokeRect(x1, ch.y - 5, ch.w, 10);
          }

          // Coins (shillings)
          for (const co of this.coins) {
            g.circle(co.x, co.y, 6, '#c89020');
            g.circle(co.x, co.y, 3, '#f0d040');
          }

          // Scrooge sprite (nightcap + robe)
          const scrX = W / 2;
          const hitFl = this.hitCool > 0 && Math.floor(this.hitCool * 8) % 2 === 1;
          if (!hitFl) {
            g.sprite([
              '.hh.',
              'hbbh',
              '.bb.',
              'b..b',
            ], scrX - 8, this.scrY - 14, { h: '#c0a870', b: '#2a2838' }, 4);
          }

          // HUD
          api.topBar("MARLEY'S CHAINS");
          api.txt('TIME ' + Math.ceil(Math.max(0, this.timer)), 6, 20, 9, '#d4a020');
          for (let i = 0; i < 3; i++) {
            api.gfx.rect(W - 18 - i * 16, 4, 12, 12, i < this.lives ? '#d4a020' : '#1a1a28');
          }
          api.vignette();
        },
      },

      /* ==================== 2. THE GHOST OF CHRISTMAS PAST ================== */
      {
        id: 'past',
        name: 'CHRISTMAS PAST',
        sub: 'MEMORIES IN THE LIGHT',

        icon(api, x, y) {
          api.gfx.circle(x, y, 7, '#f0e070');
          api.gfx.circle(x, y, 4, '#fff8c0');
        },

        intro: [
          'A RADIANT SPIRIT TAKES',
          "SCROOGE BACK TO HIS",
          'FORGOTTEN CHILDHOOD.',
          'Catch the warm memories!',
        ],
        quote: 'A solitary child, neglected by his friends, is left there still.',
        help: 'TAP golden wisps · avoid the dark ones',
        winText: 'The warm glow of memory floods the room. Scrooge weeps.',
        loseText: 'Too many memories fade into the cold dark.',

        init(api) {
          this.wisps   = [];
          this.caught  = 0;
          this.need    = 18;
          this.missed  = 0;
          this.maxMiss = 6;
          this.timer   = 32;
          this.spawnT  = 0.7;
        },

        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;

          // Spawn wisps
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.32, 0.7 - (32 - Math.max(0, this.timer)) / 80);
            const dark = Math.random() < 0.22;
            this.wisps.push({
              x: 22 + Math.random() * (api.W - 44),
              y: api.H - 28,
              vy: -(0.7 + Math.random() * 0.7),
              vx: (Math.random() - 0.5) * 0.85,
              dark,
              life: 1.0,
              r: dark ? 10 : 9,
            });
          }

          // Drift
          for (const w of this.wisps) {
            w.x += w.vx * f;
            w.y += w.vy * f;
            w.x = clamp(w.x, 12, api.W - 12);
            w.life -= dt * 0.17;
          }

          // Escaped golden wisps cost a life
          for (const w of this.wisps) {
            if (!w.gone && w.life <= 0) {
              if (!w.dark) {
                this.missed++;
                if (this.missed >= this.maxMiss) { api.lose(); return; }
              }
              w.gone = true;
            }
          }
          this.wisps = this.wisps.filter(w => !w.gone);

          // Tap detection
          if (api.pointer.justDown) {
            let hit = false;
            for (const w of this.wisps) {
              if (!w.gone && Math.hypot(api.pointer.x - w.x, api.pointer.y - w.y) < w.r + 10) {
                w.gone = true; hit = true;
                if (w.dark) {
                  this.missed++;
                  api.shake(4, 0.2); api.flash('#1a2040', 0.2); api.audio.sfx('hurt');
                  if (this.missed >= this.maxMiss) { api.lose(); return; }
                } else {
                  this.caught++;
                  api.addScore(18);
                  api.audio.sfx('coin');
                  api.burst(w.x, w.y, '#f0d060', 8);
                  if (this.caught >= this.need) {
                    api.addScore(60 + Math.floor(Math.max(0, this.timer) * 3));
                    api.win(); return;
                  }
                }
                break;
              }
            }
            if (!hit) api.audio.sfx('blip');
          }

          if (this.timer <= 0 && this.caught < this.need) api.lose();
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#080c14'; c.fillRect(0, 0, W, H);

          // Warm sepia memory glow
          c.globalAlpha = 0.1;
          g.circle(W / 2, H * 0.45, 130, '#f8c050');
          c.globalAlpha = 1;

          // Old schoolroom benches (bottom)
          g.rect(0, H - 70, W, 70, '#100e08');
          for (let i = 0; i < 4; i++) {
            g.rect(i * 66 + 6, H - 56, 54, 38, '#1e1808');
            g.rect(i * 66 + 6, H - 52, 54, 2, '#2a2208');
          }

          // Ghost of Christmas Past (glowing child, floating)
          const gx = W / 2, gy = 70 + Math.sin(api.t * 0.65) * 12;
          c.globalAlpha = 0.35 + 0.14 * Math.sin(api.t * 2.1);
          g.sprite([
            '..ww..',
            '.wwww.',
            'wwllww',
            'wwllww',
            '.wwww.',
            '..ww..',
          ], gx - 12, gy - 12, { w: '#c8e0ff', l: '#f0f8ff' }, 4);
          c.globalAlpha = 1;

          // Wisps
          for (const w of this.wisps) {
            c.globalAlpha = clamp(w.life, 0.15, 1);
            const col  = w.dark ? '#3a4868' : '#f0d858';
            const col2 = w.dark ? '#202e48' : '#fff8c0';
            g.circle(w.x, w.y, w.r, col);
            g.circle(w.x, w.y, w.r - 3, col2);
            c.globalAlpha = 1;
          }

          // HUD
          api.topBar('CHRISTMAS PAST');
          api.txt('CAUGHT ' + this.caught + '/' + this.need, 6, 20, 9, '#d4a020');
          api.txt('LOST ' + this.missed + '/' + this.maxMiss, W - 80, 20, 9,
            this.missed >= 4 ? '#c84040' : '#7a8898');
          api.vignette();
        },
      },

      /* =================== 3. THE GHOST OF CHRISTMAS PRESENT ================= */
      {
        id: 'present',
        name: 'CHRISTMAS PRESENT',
        sub: "THE CRATCHIT FEAST",

        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 1, 7, '#8a4818');
          g.circle(x, y - 7, 4, '#b06020');
          g.rect(x - 1, y - 12, 2, 5, '#c0a060');
        },

        intro: [
          'THE JOLLY GIANT SPIRIT',
          'SHOWS THE CRATCHIT HOME.',
          "TINY TIM BEAMS:",
          "'God bless us, every one!'",
        ],
        quote: 'God bless us, every one! said Tiny Tim, the last of all.',
        help: 'DRAG the table to catch the feast!',
        winText: "The Cratchit table groans with plenty. Tiny Tim beams with delight.",
        loseText: 'Too many treats tumble to the floor. The family looks downcast.',

        init(api) {
          this.tableX   = api.W / 2;
          this.items    = [];
          this.caught   = 0;
          this.dropped  = 0;
          this.need     = 22;
          this.maxDrop  = 5;
          this.spawnT   = 0.55;
          this.timer    = 32;
          this.types    = [
            { col: '#c07030', col2: '#e09040', r: 9 },  // goose
            { col: '#8a5020', col2: '#a06830', r: 8 },  // plum pudding
            { col: '#9a9040', col2: '#c0b858', r: 7 },  // potato
            { col: '#2a8038', col2: '#50a050', r: 7 },  // holly
          ];
        },

        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;

          // Slide table
          if (api.pointer.down) this.tableX = api.pointer.x;
          if (api.keyDown('left'))  this.tableX -= 4.5 * f;
          if (api.keyDown('right')) this.tableX += 4.5 * f;
          this.tableX = clamp(this.tableX, 42, api.W - 42);

          // Spawn food
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.28, 0.55 - (32 - Math.max(0, this.timer)) / 80);
            const tp = this.types[Math.floor(Math.random() * this.types.length)];
            this.items.push({
              x: 22 + Math.random() * (api.W - 44),
              y: -10,
              vy: 2.2 + Math.random() * 1.4,
              col: tp.col, col2: tp.col2, r: tp.r,
            });
          }

          // Move + catch
          const tableY = api.H - 54, tableW = 84;
          for (const it of this.items) {
            if (it.done) continue;
            it.y += it.vy * f;
            if (it.y >= tableY - 4) {
              it.done = true;
              if (Math.abs(it.x - this.tableX) < tableW / 2 + 6) {
                this.caught++;
                api.addScore(12);
                api.audio.sfx('coin');
                api.burst(it.x, tableY, '#d4a020', 6);
                if (this.caught >= this.need) { api.addScore(90); api.win(); return; }
              } else {
                this.dropped++;
                api.shake(3, 0.15); api.audio.sfx('blip');
                if (this.dropped >= this.maxDrop) { api.lose(); return; }
              }
            }
          }
          this.items = this.items.filter(it => !it.done);
          if (this.timer <= 0 && this.caught < this.need) api.lose();
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#0e0c08'; c.fillRect(0, 0, W, H);

          // Warm fireplace glow (right)
          c.globalAlpha = 0.14;
          g.circle(W - 20, H - 20, 90, '#f07020');
          c.globalAlpha = 1;

          // Frost window (left)
          g.rect(W / 2 - 28, 26, 56, 48, '#0a1420');
          g.rect(W / 2 - 26, 28, 52, 44, '#0c1c30');
          g.rect(W / 2 - 1, 26, 2, 48, '#1e1208');
          g.rect(W / 2 - 28, 50, 56, 2, '#1e1208');
          g.rect(W / 2 - 30, 72, 60, 5, '#c8d8e8'); // snow sill

          // Ghost of Christmas Present (giant, jolly, partial)
          c.globalAlpha = 0.28;
          g.sprite([
            '.gggg.',
            'gggggg',
            'ggwwgg',
            'ggwwgg',
          ], W / 2 - 12, 18, { g: '#3a8838', w: '#d0eec8' }, 4);
          c.globalAlpha = 1;

          // Falling items
          for (const it of this.items) {
            g.circle(it.x, it.y, it.r, it.col);
            g.circle(it.x - 2, it.y - 2, Math.max(2, it.r / 2), it.col2);
          }

          // Sliding table
          const tY = H - 54, tW = 84, tX = this.tableX;
          g.rect(tX - tW / 2, tY, tW, 10, '#6a3a10');
          g.rect(tX - tW / 2 + 4, tY, tW - 8, 4, '#8a5020');
          g.rect(tX - tW / 2 + 5, tY + 10, 8, 22, '#522e08');
          g.rect(tX + tW / 2 - 13, tY + 10, 8, 22, '#522e08');

          // Tiny Tim figure (left side)
          g.sprite(['.h.', 'hbh', '.b.', 'b.b'], 16, H - 90, { h: '#c0a870', b: '#384060' }, 3);
          g.rect(18, H - 78, 2, 20, '#7a5820'); // crutch

          // HUD
          api.topBar('CHRISTMAS PRESENT');
          api.txt('CAUGHT ' + this.caught + '/' + this.need, 6, 20, 9, '#d4a020');
          api.txt('DROPPED ' + this.dropped + '/' + this.maxDrop, W - 108, 20, 9,
            this.dropped >= 3 ? '#c84040' : '#7a8898');
          api.vignette();
        },
      },

      /* ================ 4. THE GHOST OF CHRISTMAS YET TO COME ================ */
      {
        id: 'future',
        name: 'YET TO COME',
        sub: 'THE SHADOW POINTS',

        icon(api, x, y) {
          const c = api.ctx;
          c.fillStyle = '#1e2838';
          c.beginPath();
          c.moveTo(x, y - 8); c.lineTo(x - 4, y); c.lineTo(x - 2, y + 6);
          c.lineTo(x + 2, y + 6); c.lineTo(x + 4, y); c.closePath(); c.fill();
        },

        intro: [
          'A DARK, HOODED PHANTOM',
          'POINTS ITS FINGER AT',
          "SCROOGE'S GRAVESTONE.",
          "Dodge the Shadow's gaze!",
        ],
        quote: 'Before I draw nearer to that stone to which you point...',
        help: 'TAP left / right to change lanes',
        winText: 'Scrooge clutches the bedpost. He is alive — and it is Christmas!',
        loseText: 'The phantom finger finds you. The darkness closes in.',

        init(api) {
          this.lane     = 1;
          this.tgtLane  = 1;
          this.scrX     = 135;
          this.laneX    = [44, 135, 226];
          this.lives    = 3;
          this.timer    = 28;
          this.beams    = [];
          this.beamT    = 1.6;
          this.hitCool  = 0;
        },

        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.hitCool = Math.max(0, this.hitCool - dt);

          // Tap left/right thirds, or arrow keys, to change lane
          if (api.pointer.justDown) {
            if (api.pointer.x < api.W / 3) {
              this.tgtLane = Math.max(0, this.lane - 1);
            } else if (api.pointer.x > api.W * 2 / 3) {
              this.tgtLane = Math.min(2, this.lane + 1);
            }
          }
          if (api.keyPressed('left'))  this.tgtLane = Math.max(0, this.lane - 1);
          if (api.keyPressed('right')) this.tgtLane = Math.min(2, this.lane + 1);

          // Slide to target lane
          const tX = this.laneX[this.tgtLane];
          this.scrX += (tX - this.scrX) * 0.18 * f;
          if (Math.abs(this.scrX - tX) < 3) { this.scrX = tX; this.lane = this.tgtLane; }

          // Spawn pointing beams
          this.beamT -= dt;
          if (this.beamT <= 0) {
            this.beamT = Math.max(0.72, 1.6 - (28 - Math.max(0, this.timer)) / 48);
            const lane = Math.floor(Math.random() * 3);
            this.beams.push({ lane, x: this.laneX[lane], t: 1.5, fired: false });
            api.audio.sfx('blip');
          }

          // Fire and check
          for (const b of this.beams) {
            b.t -= dt;
            if (b.t <= 0 && !b.fired) {
              b.fired = true;
              if (this.lane === b.lane && this.hitCool <= 0) {
                this.lives--;
                this.hitCool = 1.0;
                api.shake(7, 0.35); api.flash('#0a1428', 0.25); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          }
          this.beams = this.beams.filter(b => b.t > -0.65);

          if (this.timer <= 0) { api.addScore(50 + this.lives * 40); api.win(); }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#040508'; c.fillRect(0, 0, W, H);

          // Graveyard ground
          g.rect(0, H - 72, W, 72, '#0a0c10');
          for (let i = 0; i < 8; i++) g.rect(i * 35 + 4, H - 60, 27, 10, '#12151a');

          // Tombstones (three lanes)
          const lX = [44, 135, 226];
          for (let l = 0; l < 3; l++) {
            const tx = lX[l] - 18, ty = H - 154;
            c.fillStyle = '#181c22';
            c.beginPath();
            c.moveTo(tx, ty + 22);
            c.quadraticCurveTo(tx, ty, tx + 18, ty);
            c.quadraticCurveTo(tx + 36, ty, tx + 36, ty + 22);
            c.lineTo(tx + 36, ty + 60); c.lineTo(tx, ty + 60); c.closePath(); c.fill();
            c.strokeStyle = '#252c34'; c.lineWidth = 1; c.stroke();
            api.txtC('R.I.P.', lX[l], ty + 28, 5, '#303840');
          }

          // Ghost of Christmas Yet to Come (looming, almost invisible)
          const gx = W / 2 + Math.sin(api.t * 0.6) * 6;
          c.globalAlpha = 0.62 + 0.12 * Math.sin(api.t * 1.6);
          g.sprite([
            '..ddd..',
            '.ddddd.',
            'ddddddd',
            'ddddddd',
            '..ddd..',
            '...d...',
            '...d...',
          ], gx - 14, 12, { d: '#181e2c' }, 4);
          c.globalAlpha = 1;

          // Beam warnings and strikes
          for (const b of this.beams) {
            if (b.t > 0) {
              const warn = 1 - b.t / 1.5;
              c.globalAlpha = warn * 0.44;
              c.strokeStyle = '#3a5080'; c.lineWidth = 2;
              c.beginPath(); c.moveTo(gx + 8, 56); c.lineTo(b.x, H - 152); c.stroke();
              c.globalAlpha = warn * 0.3;
              c.fillStyle = '#283860';
              c.fillRect(b.x - 18, H - 175, 36, 115);
              c.globalAlpha = 1;
            }
            if (b.fired && b.t > -0.38) {
              c.globalAlpha = Math.max(0, (b.t + 0.38) / 0.38) * 0.72;
              c.fillStyle = '#2a3c62';
              c.fillRect(b.x - 18, H - 200, 36, 145);
              c.globalAlpha = 1;
            }
          }

          // Scrooge
          const hitF = this.hitCool > 0 && Math.floor(this.hitCool * 8) % 2 === 1;
          if (!hitF) {
            g.sprite(['.hh.', 'hbbh', '.bb.', 'b..b'],
              this.scrX - 8, H - 147, { h: '#c0a870', b: '#2a2838' }, 4);
          }

          // HUD — lane indicator arrows
          api.topBar('YET TO COME');
          api.txt('TIME ' + Math.ceil(Math.max(0, this.timer)), 6, 20, 9, '#3a4868');
          for (let i = 0; i < 3; i++) {
            g.circle(W - 14 - i * 18, 11, 6, i < this.lives ? '#d4a020' : '#181c28');
          }
          // Tiny lane arrows at bottom
          api.txtC('◀ TAP ▶', W / 2, H - 18, 7, '#3a4868');
          api.vignette();
        },
      },

      /* ========================= 5. CHRISTMAS MORNING ======================== */
      {
        id: 'morning',
        name: 'CHRISTMAS MORNING',
        sub: 'A CHANGED MAN',

        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x - 5, y + 2, 5, '#256a25');
          g.circle(x + 5, y + 2, 5, '#256a25');
          g.circle(x,     y - 2, 4, '#c82020');
          g.circle(x + 3, y - 1, 3, '#c82020');
        },

        intro: [
          "SCROOGE LEAPS FROM BED,",
          'LAUGHING, ON CHRISTMAS',
          "MORNING — A NEW MAN!",
          "Race to the Cratchits!",
        ],
        quote: 'I will honour Christmas in my heart, and try to keep it all the year.',
        help: 'TAP to jump over obstacles!',
        winText: "Scrooge arrives at the Cratchits' door, turkey in hand, beaming.",
        loseText: 'Scrooge stumbles in the snow — but Christmas morning is still young!',

        init(api) {
          this.vy       = 0;
          this.y        = api.H - 88;
          this.onGround = true;
          this.scrX     = 52;
          this.obstacles = [];
          this.obstT    = 1.6;
          this.coins    = [];
          this.coinT    = 0.7;
          this.dist     = 0;
          this.need     = 200;
          this.lives    = 3;
          this.hitCool  = 0;
          this.scrollX  = 0;
          this.spd      = 3.0;
        },

        update(api, dt) {
          const f = dt * 60;
          this.hitCool = Math.max(0, this.hitCool - dt);
          const groundY = api.H - 88;

          // Jump on tap or up/A
          if (this.onGround &&
              (api.pointer.justDown || api.keyPressed('a') || api.keyPressed('up'))) {
            this.vy = -9.5;
            this.onGround = false;
            api.audio.sfx('jump');
          }

          // Gravity
          this.vy += 0.44 * f;
          this.y = Math.min(groundY, this.y + this.vy * dt * 30);
          if (this.y >= groundY) { this.y = groundY; this.vy = 0; this.onGround = true; }

          // Scrolling speed
          this.spd = 3.0 + this.dist / 150;
          const dx = this.spd * f;
          this.dist  += dx / 30;
          this.scrollX = (this.scrollX + dx) % (api.W + 62);

          // Obstacles
          this.obstT -= dt;
          if (this.obstT <= 0) {
            this.obstT = Math.max(0.75, 1.6 - this.dist / 340);
            const h = 14 + Math.floor(Math.random() * 3) * 8;
            this.obstacles.push({ x: api.W + 14, h, type: Math.random() < 0.5 ? 'snow' : 'post' });
          }
          for (const o of this.obstacles) o.x -= dx;
          this.obstacles = this.obstacles.filter(o => o.x > -26);

          // Coins
          this.coinT -= dt;
          if (this.coinT <= 0) {
            this.coinT = 0.5 + Math.random() * 0.55;
            this.coins.push({ x: api.W + 8, y: groundY - 28 - Math.random() * 38 });
          }
          for (const co of this.coins) co.x -= dx;

          // Collect coins
          for (const co of this.coins) {
            if (!co.gone && Math.hypot(co.x - this.scrX, co.y - (this.y + 8)) < 22) {
              co.gone = true; api.addScore(10); api.audio.sfx('coin');
              api.burst(co.x, co.y, '#d4a020', 5);
            }
          }
          this.coins = this.coins.filter(co => co.x > -22 && !co.gone);

          // Obstacle collision (forgiving: only if on or very near ground)
          if (this.hitCool <= 0) {
            for (const o of this.obstacles) {
              const oy = groundY - o.h;
              if (Math.abs(o.x - this.scrX) < 16 && this.y + 2 > oy + 2) {
                this.lives--;
                this.hitCool = 1.5;
                api.shake(5, 0.3); api.flash('#1a2438', 0.15); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          }

          if (this.dist >= this.need) {
            api.addScore(120 + this.lives * 35);
            api.audio.sfx('win');
            api.win();
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Bright Christmas morning sky
          const sky = c.createLinearGradient(0, 0, 0, H * 0.7);
          sky.addColorStop(0, '#1a3860');
          sky.addColorStop(0.3, '#2a5888');
          sky.addColorStop(0.7, '#5890b8');
          sky.addColorStop(1, '#90b8d8');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);

          // Rising sun
          c.globalAlpha = 0.45;
          g.circle(38, 56, 28, '#f8e068');
          c.globalAlpha = 0.82;
          g.circle(38, 56, 16, '#ffffc0');
          c.globalAlpha = 1;

          // Scrolling London silhouette (parallax)
          for (let i = 0; i < 7; i++) {
            const bx = ((i * 50 - this.scrollX * 0.25 + W * 4) % (W + 62)) - 10;
            const bh = 56 + (i % 3) * 26;
            c.fillStyle = '#0d1828';
            c.fillRect(bx, H - 130 - bh, 38, bh);
            c.fillRect(bx + 6, H - 134 - bh, 7, 16); // chimney
            c.globalAlpha = 0.2;
            g.circle(bx + 9, H - 138 - bh + Math.sin(api.t * 1.2 + i) * 4, 7, '#9898a8');
            c.globalAlpha = 1;
          }

          // Snowy ground
          g.rect(0, H - 90, W, 90, '#c8d8e8');
          g.rect(0, H - 90, W, 5, '#b0c0d0');
          // Snow mounds (scrolling)
          for (let i = 0; i < 5; i++) {
            const sx = ((i * 57 - this.scrollX * 0.5 + W * 4) % W);
            g.circle(sx, H - 90, 9, '#d8e8f8');
          }

          // Coins
          for (const co of this.coins) {
            g.circle(co.x, co.y, 6, '#c89020');
            g.circle(co.x, co.y, 3, '#f0d038');
          }

          // Obstacles
          for (const o of this.obstacles) {
            const oy = H - 90 - o.h;
            if (o.type === 'snow') {
              g.circle(o.x, oy + o.h * 0.6, o.h * 0.6 + 4, '#c8d8ec');
              g.circle(o.x + 6, oy + o.h * 0.5, o.h * 0.4, '#d8eaff');
            } else {
              // Festive lamppost (holly-green)
              g.rect(o.x - 3, oy, 6, o.h, '#285828');
              g.circle(o.x, oy, 7, '#48b848');
              g.circle(o.x - 3, oy - 2, 3, '#c82020');
              g.circle(o.x + 3, oy - 2, 3, '#c82020');
            }
          }

          // Scrooge (red festive coat — new man!)
          const bounce = this.onGround ? Math.abs(Math.sin(api.t * 8)) * 2 : 0;
          const hitFl  = this.hitCool > 0 && Math.floor(this.hitCool * 8) % 2 === 1;
          if (!hitFl) {
            g.sprite(['.hh.', 'hrrh', '.rr.', 'r..r'],
              this.scrX - 8, this.y - 14 - bounce, { h: '#c0a870', r: '#c83020' }, 4);
          }

          // Progress bar
          const prog = Math.min(1, this.dist / this.need);
          g.rect(6, H - 14, W - 50, 6, '#8090a8');
          g.rect(6, H - 14, (W - 50) * prog, 6, '#d4a020');
          api.txtC('HOME', W - 26, H - 15, 6, '#d4a020');

          // HUD
          api.topBar('CHRISTMAS MORNING');
          for (let i = 0; i < 3; i++) {
            g.circle(W - 14 - i * 18, 10, 6, i < this.lives ? '#c83020' : '#1a1a28');
          }
          api.vignette();
        },
      },
    ],
  });
})();
