/* ============================================================================
 * STEAMBOAT WILLIE (1928)
 * Five scenes from the iconic Mickey Mouse short, each a different mini-game:
 *   1. THE RIVER       — steer the steamboat past logs and barrels
 *   2. WHISTLE TUNE    — tap the beat at the right moment
 *   3. ANIMAL BAND     — tap each glowing animal before the note fades
 *   4. MINNIE ARRIVES  — catch Minnie's falling parcels on the deck
 *   5. CAPTAIN PETE    — dodge Pete's warning swings and escape!
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * Vintage black-and-white film aesthetic: warm amber/sepia accents.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── Mickey Mouse head emblem ─────────────────────────────────────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // ears
    g.circle(cx - 15, cy - 13, 12, '#101010');
    g.circle(cx + 15, cy - 13, 12, '#101010');
    // head
    g.circle(cx, cy + 4, 20, '#101010');
    // eyes (white dots)
    g.circle(cx - 5, cy + 2, 4, '#f0e8d0');
    g.circle(cx + 5, cy + 2, 4, '#f0e8d0');
    // nose
    g.circle(cx + 1, cy + 10, 3, '#282018');
    // gloves (two cream circles below)
    g.circle(cx - 12, cy + 22, 7, '#f0e8d0');
    g.circle(cx + 12, cy + 22, 7, '#f0e8d0');
  }

  /* ── Mississippi river night scenery ──────────────────────────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // base sky gradient
    const sky = c.createLinearGradient(0, 0, 0, H * 0.52);
    sky.addColorStop(0, '#060a14');
    sky.addColorStop(1, '#0c1622');
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);

    // stars
    for (let si = 0; si < 32; si++) {
      const sx = (si * 67 + 17) % W;
      const sy = (si * 43 + 9) % Math.floor(H * 0.43);
      c.globalAlpha = 0.18 + 0.22 * Math.abs(Math.sin(t * 0.9 + si * 1.1));
      g.rect(sx, sy, 1, 1, '#d0c8a8');
    }
    c.globalAlpha = 1;

    // crescent moon
    g.circle(38, 44, 19, '#d8cca0');
    g.circle(48, 36, 17, '#060a14');

    if (scene === 'menu') {
      // film strip edges — the whole menu background is a cinema frame
      c.fillStyle = '#1a1510';
      c.fillRect(0, 0, 15, H);
      c.fillRect(W - 15, 0, 15, H);
      c.fillStyle = '#0e0c08';
      for (let hi = 0; hi < 14; hi++) {
        const hy = 14 + hi * 32;
        c.fillRect(1, hy, 13, 15);
        c.fillRect(W - 14, hy, 13, 15);
      }
      // dark river at bottom of menu
      c.fillStyle = '#0a1620';
      c.fillRect(15, H - 58, W - 30, 58);
      for (let ri = 0; ri < 3; ri++) {
        c.globalAlpha = 0.13;
        c.strokeStyle = '#2060a0';
        c.lineWidth = 1;
        c.beginPath();
        for (let rx = 15; rx <= W - 15; rx += 8) {
          const ry = H - 44 + ri * 16 + Math.sin(t * 1.4 + rx * 0.07 + ri) * 2.5;
          rx === 15 ? c.moveTo(rx, ry) : c.lineTo(rx, ry);
        }
        c.stroke();
        c.globalAlpha = 1;
      }
      // slight overlay
      c.fillStyle = 'rgba(6,10,20,.48)';
      c.fillRect(0, 0, W, H);
      return;
    }

    // river (lower half)
    c.fillStyle = '#0a1620';
    c.fillRect(0, H * 0.48, W, H);
    for (let wi = 0; wi < 5; wi++) {
      const wy = H * 0.5 + wi * 22;
      c.globalAlpha = 0.11;
      c.strokeStyle = '#1d4878';
      c.lineWidth = 1;
      c.beginPath();
      for (let rx = 0; rx <= W; rx += 8) {
        const ry = wy + Math.sin(t * 1.4 + rx * 0.06 + wi * 0.9) * 2.5;
        rx === 0 ? c.moveTo(rx, ry) : c.lineTo(rx, ry);
      }
      c.stroke();
      c.globalAlpha = 1;
    }

    // far bank
    c.fillStyle = '#080c10';
    c.fillRect(0, H * 0.44, W, H * 0.07);

    // steamboat silhouette (title / intro / finale only)
    if (scene === 'boot' || scene === 'intro' || scene === 'finale') {
      const bx = W * 0.64, by = H * 0.6;
      c.fillStyle = '#0a0e14';
      c.beginPath();
      c.moveTo(bx - 52, by);
      c.lineTo(bx - 62, by + 32);
      c.lineTo(bx + 62, by + 32);
      c.lineTo(bx + 52, by);
      c.closePath();
      c.fill();
      c.fillRect(bx - 22, by - 34, 44, 36);
      c.fillRect(bx - 5, by - 70, 12, 38);
      // paddlewheel spokes
      c.fillRect(bx + 52, by, 22, 26);
      for (let ri2 = 0; ri2 < 4; ri2++) {
        const wa = ri2 / 4 * Math.PI * 2 + t * 1.8;
        g.rect(bx + 63 + Math.cos(wa) * 9, by + 13 + Math.sin(wa) * 9, 3, 3, '#12161e');
      }
      // smoke
      for (let pi = 0; pi < 5; pi++) {
        const pAge = ((t * 0.5 + pi * 0.2) % 1.0);
        c.globalAlpha = 0.32 * (1 - pAge);
        g.circle(bx + Math.sin(t + pi * 1.2) * 5, by - 74 - pAge * 30, 6 + pAge * 10, '#2a2820');
        c.globalAlpha = 1;
      }
    }

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(6,10,20,.72)';
      c.fillRect(0, 0, W, H);
    }
  }

  /* ── helper: draw Mickey silhouette ──────────────────────────────────── */
  function drawMickey(g, mx, my, eyeColor) {
    g.circle(mx, my, 13, '#101010');
    g.circle(mx - 9, my - 10, 7, '#101010');
    g.circle(mx + 9, my - 10, 7, '#101010');
    g.circle(mx - 3, my - 1, 3, eyeColor || '#f0e8d0');
    g.circle(mx + 3, my - 1, 3, eyeColor || '#f0e8d0');
  }

  /* ════════════════════════ SAGA ════════════════════════ */
  RetroSaga.create({
    id: 'mickey-steamboat',
    title: 'STEAMBOAT WILLIE',
    subtitle: 'FIVE SCENES ON THE MISSISSIPPI',
    currency: 'NOTES',
    accent: '#e8c050',
    credit: 'STEAMBOAT WILLIE · 1928',
    emblem,
    scenery,
    bootCta: 'TOOT TOOT!',
    menuLabel: 'FIVE SCENES ON THE MISSISSIPPI',
    menuHint: 'TAP A SCENE TO PLAY',
    menuDone: "THAT'S ALL, FOLKS!",

    screens: {
      win:          '#e8c050',
      lose:         '#705820',
      chapterLabel: '#9a7840',
      name:         '#f0e0b0',
      sub:          '#c8a030',
      intro:        '#e8d8a0',
      quote:        '#9a7a40',
      help:         '#e8c050',
      score:        '#f0e0b0',
      cur:          '#e8c050',
      cta:          '#f0e0b0',
      overlay:      'rgba(10,8,4,.86)',
    },
    labels: {
      chapter: 'SCENE',
      score:   'NOTES HIT',
      win:     'TOOT TOOT!',
      lose:    'OH BOY...',
      cont:    'TAP TO SAIL ON',
      finale:  'TAP FOR THE FINALE',
      toMenu:  'BACK TO THE BOAT',
      play:    'TAP TO PLAY',
    },

    finale: ['WILLIE WHISTLES', 'ALL THE WAY HOME.', '', 'HA-HA!'],
    palette: { gold: '#e8c050', cream: '#f0e8d0' },
    width: 270, height: 480, parent: '#game',

    /* ── film-strip storyboard menu (2 – 1 – 2) ──────────────────────── */
    menu: {
      colors: { title: '#e8c050', label: '#9a7840', cur: '#f0e0b0' },
      layout() {
        // Five film frames in a 2-1-2 storyboard arrangement
        return [
          { x: 18,  y: 96,  w: 108, h: 72 },
          { x: 144, y: 96,  w: 108, h: 72 },
          { x: 81,  y: 193, w: 108, h: 72 },
          { x: 18,  y: 299, w: 108, h: 72 },
          { x: 144, y: 299, w: 108, h: 72 },
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;

        // film frame outer
        c.fillStyle = sel ? '#2c2214' : '#1a1408';
        c.fillRect(x, y, w, h);
        c.strokeStyle = sel ? '#e8c050' : '#5a4018';
        c.lineWidth = sel ? 2 : 1;
        c.strokeRect(x, y, w, h);

        // sprocket holes (3 top, 3 bottom)
        c.fillStyle = '#0a0806';
        for (let hi = 0; hi < 3; hi++) {
          const hx = x + 10 + hi * ((w - 20) / 2);
          c.fillRect(hx, y + 2, 8, 5);
          c.fillRect(hx, y + h - 7, 8, 5);
        }

        // inner image area
        c.fillStyle = sel ? '#201a0e' : '#14100a';
        c.fillRect(x + 2, y + 9, w - 4, h - 18);

        // chapter icon
        if (ch.icon) ch.icon(api, x + 20, y + h / 2 - 2);

        // title at bottom of frame
        api.txtCFit((i + 1) + '. ' + ch.name, x + w / 2, y + h - 14, 7,
          done ? '#e8c050' : '#c0a870', false, w - 8);

        // done star
        if (done) api.txtC('★', x + w - 10, y + 12, 9, '#e8c050');
      },
    },

    chapters: [

      /* ══════════════ SCENE 1: THE RIVER ══════════════ */
      {
        id: 'river', name: 'THE RIVER', sub: 'STEER CLEAR',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 9, '#8a6030');
          g.circle(x, y, 5, '#c0a060');
          for (let a = 0; a < 8; a++) {
            const ang = a / 8 * Math.PI * 2;
            g.rect(x + Math.cos(ang) * 6 - 1, y + Math.sin(ang) * 6 - 1, 2, 2, '#c0a060');
          }
        },
        intro: ['MICKEY GRABS THE WHEEL', 'AS THE MISSISSIPPI', 'TWISTS AHEAD —', 'dodge logs and barrels!'],
        quote: '"Steamboat Bill, steaming down the Mississippi..." — traditional, c. 1910',
        help: 'DRAG or tap LEFT/RIGHT to steer · dodge the debris',
        winText: 'Mickey whistles and steers clear! Open water stretches ahead.',
        loseText: 'The boat clips a log and spins! Pete stomps over to grab the wheel.',
        init(api) {
          this.x = api.W / 2;
          this.life = 3;
          this.dist = 0;
          this.need = 44;
          this.obs = [];
          this.spawnT = 1.2;
          this.hitCD = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.dist += dt;
          api.score = Math.floor(this.dist * 6);

          if (api.pointer.down) this.x = api.pointer.x;
          if (api.keyDown('left'))  this.x -= 4 * f;
          if (api.keyDown('right')) this.x += 4 * f;
          this.x = clamp(this.x, 20, api.W - 20);

          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.5, 1.4 - this.dist * 0.018);
            this.obs.push({
              x: api.rnd(22, api.W - 22),
              y: -24,
              vy: 1.6 + this.dist * 0.036,
              isLog: api.chance(0.45),
            });
          }

          for (const o of this.obs) o.y += o.vy * f;
          this.obs = this.obs.filter(o => o.y < api.H + 30);

          if (this.hitCD > 0) { this.hitCD -= dt; }
          else {
            const boatY = api.H - 66;
            for (let j = 0; j < this.obs.length; j++) {
              const o = this.obs[j];
              const r = o.isLog ? 20 : 13;
              if (Math.hypot(this.x - o.x, boatY - o.y) < r + 14) {
                this.life--;
                this.hitCD = 1.2;
                api.shake(7, 0.35);
                api.flash('#ff5030', 0.25);
                api.audio.sfx('hurt');
                this.obs.splice(j, 1);
                if (this.life <= 0) { api.lose(); return; }
                break;
              }
            }
          }

          if (this.dist >= this.need) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          // river
          c.fillStyle = '#0a1820';
          c.fillRect(0, 0, W, H);

          // river banks (narrow strips)
          c.fillStyle = '#12100a';
          c.fillRect(0, 0, 14, H);
          c.fillRect(W - 14, 0, 14, H);

          // animated water lines
          for (let i = 0; i < 6; i++) {
            const wy = ((api.t * 38 + i * 70) % (H + 10)) - 5;
            c.globalAlpha = 0.12;
            g.rect(14, wy, W - 28, 2, '#1e5090');
            c.globalAlpha = 1;
          }

          // obstacles
          for (const o of this.obs) {
            if (o.isLog) {
              g.rect(o.x - 21, o.y - 5, 42, 10, '#3a2810');
              g.rect(o.x - 19, o.y - 3, 38, 2, '#5a3e18');
              g.rect(o.x - 19, o.y + 1, 38, 2, '#5a3e18');
            } else {
              g.circle(o.x, o.y, 13, '#6a4818');
              g.rect(o.x - 9, o.y - 15, 18, 4, '#5a3810');
            }
          }

          // boat
          const bx = this.x, by = H - 66;
          c.fillStyle = '#c0a870';
          c.beginPath();
          c.moveTo(bx - 26, by + 6); c.lineTo(bx - 22, by + 24);
          c.lineTo(bx + 22, by + 24); c.lineTo(bx + 26, by + 6);
          c.closePath(); c.fill();
          g.rect(bx - 17, by - 14, 34, 22, '#d0b880');
          // smokestack
          g.rect(bx - 4, by - 36, 8, 24, '#3a2e18');
          // smoke puffs
          for (let pi = 0; pi < 3; pi++) {
            const pA = ((api.t * 0.7 + pi * 0.33) % 1.0);
            c.globalAlpha = 0.28 * (1 - pA);
            g.circle(bx + Math.sin(api.t + pi) * 3, by - 38 - pA * 20, 5 + pA * 7, '#2a2820');
            c.globalAlpha = 1;
          }
          // paddle wheel side
          g.rect(bx + 26, by + 4, 14, 16, '#8a6030');
          // Mickey at the wheel
          drawMickey(g, bx, by - 24);
          // ship wheel
          g.circle(bx, by - 6, 9, '#8a6030');
          g.circle(bx, by - 6, 4, '#c0a060');

          api.topBar('THE RIVER');
          for (let li = 0; li < 3; li++)
            g.circle(8 + li * 20, 18, 6, li < this.life ? '#e8c050' : '#2a1808');
          g.rect(W - 80, 8, 74, 8, '#1e1608');
          g.rect(W - 80, 8, 74 * Math.min(1, this.dist / this.need), 8, '#e8c050');
        },
      },

      /* ══════════════ SCENE 2: WHISTLE TUNE ══════════════ */
      {
        id: 'whistle', name: 'WHISTLE TUNE', sub: 'KEEP THE BEAT',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 1, y - 9, 3, 14, '#e8c050');
          g.circle(x - 4, y + 5, 5, '#e8c050');
          g.rect(x + 2, y - 9, 10, 3, '#e8c050');
          g.rect(x + 2, y - 6, 10, 3, '#b89030');
        },
        intro: ['MICKEY FINDS A WHISTLE', 'AND PLAYS "STEAMBOAT', 'BILL" — TAP IN TIME!', 'The whole river hums along.'],
        quote: '"He whistled and sang with his whole heart." — paraphrase, 1928',
        help: 'TAP when the marker reaches the green beat zone',
        winText: '"Ha-ha!" Mickey grins ear to ear. The tune echoes down the river.',
        loseText: 'Mickey misses too many beats. The animals drift away in silence.',
        init(api) {
          this.beats = 0;
          this.need = 16;
          this.miss = 0;
          this.m = 0;
          this.dir = 1;
          this.spd = 1.1;
          this.band = 0.17;
          this.notePhase = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.m += this.dir * this.spd * 0.026 * f;
          if (this.m >= 1) { this.m = 1; this.dir = -1; }
          if (this.m <= 0) { this.m = 0; this.dir = 1; }
          this.notePhase += dt;

          if (api.confirm()) {
            if (Math.abs(this.m - 0.5) < this.band) {
              this.beats++;
              api.score += 22;
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H - 52, '#e8c050', 10);
              this.spd  = Math.min(2.4, this.spd + 0.1);
              this.band = Math.max(0.08, this.band - 0.007);
              if (this.beats >= this.need) { api.score += 80; api.win(); }
            } else {
              this.miss++;
              api.audio.sfx('hurt');
              api.shake(4, 0.2);
              if (this.miss >= 4) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          c.fillStyle = '#12100a';
          c.fillRect(0, 0, W, H);

          // stage curtains
          c.fillStyle = '#320a0e'; c.fillRect(0, 0, 22, H);
          c.fillStyle = '#200608'; c.fillRect(0, 0, 10, H);
          c.fillStyle = '#320a0e'; c.fillRect(W - 22, 0, 22, H);
          c.fillStyle = '#200608'; c.fillRect(W - 10, 0, 10, H);

          // floating musical notes
          for (let ni = 0; ni < 8; ni++) {
            const nx = 30 + ni * 28 + Math.sin(api.t * 1.2 + ni * 0.9) * 7;
            const ny = 55 + Math.sin(this.notePhase * 2.1 + ni * 1.7) * 28;
            c.globalAlpha = 0.3 + 0.25 * Math.sin(api.t * 3 + ni * 1.4);
            g.rect(nx, ny, 2, 10, '#e8c050');
            g.circle(nx - 3, ny + 10, 4, '#e8c050');
            c.globalAlpha = 1;
          }

          // Mickey with whistle raised
          const mx = W / 2, my = H - 115;
          g.rect(mx - 10, my + 14, 20, 28, '#101010');
          drawMickey(g, mx, my);
          // arm up + whistle
          g.rect(mx + 10, my + 5, 4, 12, '#101010');
          g.rect(mx + 14, my + 2, 18, 5, '#e8c050');
          g.rect(mx + 30, my, 4, 9, '#b89030');

          // beat meter
          const bx = 24, bw = W - 48, by = H - 42;
          g.rect(bx, by, bw, 14, '#1e1a0e');
          g.rect(bx + bw * (0.5 - this.band), by, bw * this.band * 2, 14, 'rgba(80,200,80,.3)');
          g.rect(bx + bw * 0.5 - 1, by - 3, 2, 20, '#5dff8f');
          g.rect(bx + bw * this.m - 3, by - 4, 6, 22, '#e8c050');

          api.topBar('WHISTLE TUNE');
          api.txt('BEATS ' + this.beats + '/' + this.need, 6, 20, 9, '#e8c050');
          api.txt('MISS ' + this.miss + '/4', W - 88, 20, 9, this.miss > 2 ? '#ff5030' : '#6a5020');
        },
      },

      /* ══════════════ SCENE 3: ANIMAL BAND ══════════════ */
      {
        id: 'band', name: 'ANIMAL BAND', sub: 'PLAY THE MELODY',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x - 8, y + 2, 7, '#101010');
          g.circle(x, y - 3, 7, '#c8b070');
          g.circle(x + 8, y + 2, 7, '#e87020');
        },
        intro: ['MICKEY DISCOVERS THE', 'SHIP\'S ANIMALS CAN PLAY', 'BEAUTIFUL MUSIC —', 'tap the glowing one!'],
        quote: '"Each animal in turn was seized and forced to play." — paraphrase, 1928',
        help: 'TAP the glowing animal when the note appears above it',
        winText: 'The animals play in perfect harmony! Mickey takes a deep bow.',
        loseText: 'Too many wrong notes. The animals scatter offstage in a huff.',
        init(api) {
          this.caught = 0;
          this.need = 14;
          this.miss = 0;
          this.timer = 30;
          this.active = null;
          this.nextT = 0.9;
          this.animals = [
            { x: 62,  y: 244, kind: 'cat'  },
            { x: 135, y: 230, kind: 'goat' },
            { x: 208, y: 244, kind: 'duck' },
          ];
        },
        update(api, dt) {
          this.timer -= dt;
          api.score = this.caught * 8 + Math.floor(30 - this.timer);

          if (this.active) {
            this.active.t -= dt;
            if (this.active.t <= 0) {
              this.miss++;
              api.audio.sfx('hurt');
              api.shake(3, 0.15);
              this.active = null;
              this.nextT = 0.4;
              if (this.miss >= 4) { api.lose(); return; }
            }
          } else {
            this.nextT -= dt;
            if (this.nextT <= 0) {
              const maxT = Math.max(0.65, 1.4 - this.caught * 0.04);
              this.active = { idx: api.rint(0, 2), t: maxT, maxT };
              api.audio.sfx('blip');
            }
          }

          if (api.pointer.justDown && this.active) {
            const an = this.animals[this.active.idx];
            if (Math.hypot(api.pointer.x - an.x, api.pointer.y - an.y) < 30) {
              this.caught++;
              api.burst(an.x, an.y, '#e8c050', 10);
              api.audio.sfx('coin');
              this.active = null;
              this.nextT = api.rnd(0.35, 0.7);
              if (this.caught >= this.need) { api.score += 80; api.win(); }
            } else {
              api.audio.sfx('blip');
            }
          }

          if (this.timer <= 0) { api.lose(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          c.fillStyle = '#12100a';
          c.fillRect(0, 0, W, H);

          // wooden stage floor
          c.fillStyle = '#2a1e10';
          c.fillRect(0, H - 68, W, 68);
          for (let si = 0; si < 9; si++) g.rect(si * 31, H - 68, 30, 1, '#1e1608');

          // curtains
          c.fillStyle = '#320a0e'; c.fillRect(0, 0, 20, H);
          c.fillStyle = '#200608'; c.fillRect(0, 0, 9, H);
          c.fillStyle = '#320a0e'; c.fillRect(W - 20, 0, 20, H);
          c.fillStyle = '#200608'; c.fillRect(W - 9, 0, 9, H);

          // spotlight from above
          c.globalAlpha = 0.06;
          c.fillStyle = '#e8d090';
          c.beginPath();
          c.moveTo(W / 2, 0); c.lineTo(W / 2 - 70, H - 68); c.lineTo(W / 2 + 70, H - 68); c.closePath();
          c.fill();
          c.globalAlpha = 1;

          // draw animals
          for (let ai = 0; ai < this.animals.length; ai++) {
            const an = this.animals[ai];
            const isAct = this.active && this.active.idx === ai;

            if (an.kind === 'cat') {
              g.circle(an.x, an.y, 15, isAct ? '#a08040' : '#101010');
              g.circle(an.x - 11, an.y - 11, 9, isAct ? '#a08040' : '#101010');
              g.circle(an.x + 11, an.y - 11, 9, isAct ? '#a08040' : '#101010');
              if (!isAct) { g.circle(an.x - 3, an.y - 2, 3, '#f0e8d0'); g.circle(an.x + 3, an.y - 2, 3, '#f0e8d0'); }
            } else if (an.kind === 'goat') {
              g.circle(an.x, an.y, 15, isAct ? '#d0cc88' : '#c0b870');
              g.rect(an.x - 7, an.y - 28, 4, 16, isAct ? '#d0cc88' : '#c0b870');
              g.rect(an.x + 3, an.y - 28, 4, 16, isAct ? '#d0cc88' : '#c0b870');
              g.circle(an.x, an.y + 18, 6, isAct ? '#b8b060' : '#a09040');
            } else {
              g.circle(an.x, an.y, 12, isAct ? '#f0e040' : '#c0b020');
              g.rect(an.x + 8, an.y - 5, 14, 8, isAct ? '#f08030' : '#a05010');
              g.circle(an.x - 6, an.y - 2, 5, isAct ? '#d0c020' : '#9a8810');
            }

            if (isAct) {
              // musical note above
              g.rect(an.x - 1, an.y - 42, 3, 14, '#e8c050');
              g.circle(an.x - 5, an.y - 28, 6, '#e8c050');
              g.rect(an.x + 2, an.y - 42, 10, 3, '#e8c050');
              // shrinking tap ring
              const prog = this.active.t / this.active.maxT;
              c.strokeStyle = '#e8c050';
              c.lineWidth = 2;
              c.globalAlpha = 0.55 + 0.45 * prog;
              c.beginPath();
              c.arc(an.x, an.y, 28 + (1 - prog) * 18, 0, Math.PI * 2);
              c.stroke();
              c.globalAlpha = 1;
            }
          }

          // Mickey conducting
          const cy = H - 132;
          g.rect(W / 2 - 10, cy + 14, 20, 26, '#101010');
          drawMickey(g, W / 2, cy);
          // baton
          g.rect(W / 2 + 13, cy - 6, 2, 22, '#f0e8d0');

          api.topBar('ANIMAL BAND');
          api.txt('NOTES ' + this.caught + '/' + this.need, 6, 20, 9, '#e8c050');
          g.rect(W - 70, 21, 64, 6, '#1a1608');
          g.rect(W - 70, 21, 64 * (1 - clamp(this.timer / 30, 0, 1)), 6, '#e8c050');
        },
      },

      /* ══════════════ SCENE 4: MINNIE ARRIVES ══════════════ */
      {
        id: 'minnie', name: 'MINNIE ARRIVES', sub: 'CATCH THE PARCELS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 6, 16, 12, '#d06080');
          g.rect(x - 1, y - 8, 3, 16, '#e870a0');
          g.rect(x - 10, y - 1, 20, 3, '#e870a0');
        },
        intro: ['MINNIE MISSES THE BOAT', 'AND GETS HOISTED ABOARD', 'BY CRANE — HER PARCELS', 'fly everywhere! Catch them!'],
        quote: '"Oh, Mickey!" she cried. — Steamboat Willie (1928)',
        help: 'DRAG or tap to move Mickey · catch the falling parcels',
        winText: 'Every parcel safe! Minnie giggles and waves her polka-dot bow.',
        loseText: 'Too many parcels splash in the river. Minnie hides her face.',
        init(api) {
          this.x = api.W / 2;
          this.caught = 0;
          this.need = 14;
          this.dropped = 0;
          this.items = [];
          this.spawnT = 1.1;
          this.timer = 32;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          api.score = this.caught * 10;

          if (api.pointer.down) this.x = api.pointer.x;
          if (api.keyDown('left'))  this.x -= 4 * f;
          if (api.keyDown('right')) this.x += 4 * f;
          this.x = clamp(this.x, 24, api.W - 24);

          this.spawnT -= dt;
          if (this.spawnT <= 0 && this.items.length < 5) {
            this.spawnT = api.rnd(0.55, 1.1);
            this.items.push({
              x:    api.rnd(28, api.W - 28),
              y:    62,
              vy:   1.4 + this.caught * 0.04,
              kind: api.rint(0, 2),
            });
          }

          for (const it of this.items) it.y += it.vy * f;

          const catchY = api.H - 58;
          const keep = [];
          for (const it of this.items) {
            if (it.y >= catchY - 10 && it.y < catchY + 18) {
              if (Math.abs(it.x - this.x) < 28) {
                this.caught++;
                api.burst(it.x, it.y, '#e8c050', 8);
                api.audio.sfx('coin');
                if (this.caught >= this.need) { api.score += 80; api.win(); return; }
                continue;
              }
            }
            if (it.y > api.H + 10) {
              this.dropped++;
              api.audio.sfx('hurt');
              api.shake(3, 0.15);
              if (this.dropped >= 4) { api.lose(); return; }
              continue;
            }
            keep.push(it);
          }
          this.items = keep;

          if (this.timer <= 0 && this.caught < this.need) api.lose();
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          c.fillStyle = '#0a1628';
          c.fillRect(0, 0, W, H);
          // river below deck
          c.fillStyle = '#0a1820';
          c.fillRect(0, H - 80, W, 42);
          // deck boards
          c.fillStyle = '#2a1e10';
          c.fillRect(0, H - 42, W, 42);
          c.fillStyle = '#3a2e18';
          c.fillRect(0, H - 44, W, 6);

          // crane
          const crX = W - 38;
          g.rect(crX, 36, 8, 130, '#6a5828');
          g.rect(crX - 44, 36, 50, 8, '#6a5828');
          g.rect(crX - 22, 44, 3, 54, '#5a4820');

          // Minnie on rope (slight sway)
          const mY = 98 + Math.sin(api.t * 1.2) * 4;
          g.circle(crX - 20, mY + 12, 10, '#101010');
          g.circle(crX - 25, mY + 2, 7, '#101010');
          g.circle(crX - 15, mY + 2, 7, '#101010');
          // Minnie's bow
          g.rect(crX - 30, mY - 4, 7, 4, '#d060a0');
          g.rect(crX - 16, mY - 4, 7, 4, '#d060a0');

          // falling items
          for (const it of this.items) {
            if (it.kind === 0) {
              // gift parcel
              g.rect(it.x - 9, it.y - 9, 18, 18, '#d06080');
              g.rect(it.x - 1, it.y - 11, 3, 22, '#e870a0');
              g.rect(it.x - 11, it.y - 1, 22, 3, '#e870a0');
            } else if (it.kind === 1) {
              // hat
              g.circle(it.x, it.y, 11, '#8a6030');
              g.rect(it.x - 10, it.y - 17, 20, 5, '#8a6030');
            } else {
              // pie
              g.circle(it.x, it.y, 10, '#c0b8a0');
              g.rect(it.x - 8, it.y - 10, 16, 7, '#d0c8b0');
            }
          }

          // Mickey (catcher)
          const mx = this.x, my = H - 64;
          g.rect(mx - 9, my + 12, 18, 22, '#101010');
          drawMickey(g, mx, my);
          // arms outstretched
          g.rect(mx - 30, my + 4, 20, 5, '#101010');
          g.rect(mx + 10, my + 4, 20, 5, '#101010');
          // basket
          g.rect(mx - 22, my + 9, 44, 14, '#8a6030');
          g.rect(mx - 20, my + 11, 40, 10, '#6a4820');

          api.topBar('MINNIE ARRIVES');
          api.txt('CAUGHT ' + this.caught + '/' + this.need, 6, 20, 9, '#e8c050');
          for (let li = 0; li < 4; li++)
            g.rect(W - 78 + li * 18, 11, 14, 10, li < (4 - this.dropped) ? '#5dff8f' : '#2a1608');
        },
      },

      /* ══════════════ SCENE 5: CAPTAIN PETE ══════════════ */
      {
        id: 'pete', name: 'CAPTAIN PETE', sub: 'OUTWIT THE CAPTAIN',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x + 2, y - 2, 13, '#c09060');
          g.rect(x - 6, y - 18, 18, 5, '#201408');
          g.rect(x - 4, y - 28, 14, 14, '#201408');
          g.rect(x - 4, y + 4, 4, 4, '#101010');
          g.rect(x + 4, y + 4, 4, 4, '#101010');
        },
        intro: ['PETE THE CAPTAIN IS', 'FURIOUS! HIS GIANT FIST', 'SWINGS LEFT AND RIGHT', '— dodge every blow!'],
        quote: '"Get below, you!" — Captain Pete, Steamboat Willie (1928)',
        help: 'MOVE away from the warning circle before Pete strikes!',
        winText: 'Mickey ducks Pete\'s final swing and grabs the steam whistle — TOOT TOOT!',
        loseText: 'Pete catches Mickey by the ears. Back to peeling potatoes!',
        init(api) {
          this.x = api.W / 2;
          this.dist = 0;
          this.need = 40;
          this.hits = 0;
          this.warning = null;
          this.swing = null;
          this.nextSwing = 1.8;
          this.hitCD = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.dist += dt;
          api.score = Math.floor(this.dist * 10);

          if (api.pointer.down) this.x = api.pointer.x;
          if (api.keyDown('left'))  this.x -= 4 * f;
          if (api.keyDown('right')) this.x += 4 * f;
          this.x = clamp(this.x, 16, api.W - 16);

          // swing cycle
          if (!this.warning && !this.swing) {
            this.nextSwing -= dt;
            if (this.nextSwing <= 0) {
              const swX = api.rnd(30, api.W - 30);
              this.warning = { x: swX, t: 0.85 };
            }
          }
          if (this.warning) {
            this.warning.t -= dt;
            if (this.warning.t <= 0) {
              this.swing = { x: this.warning.x, t: 0.45 };
              this.warning = null;
              api.audio.sfx('shoot');
            }
          }
          if (this.swing) {
            this.swing.t -= dt;
            if (this.hitCD <= 0 && Math.abs(this.x - this.swing.x) < 26) {
              this.hits++;
              this.hitCD = 1.2;
              api.shake(7, 0.3);
              api.flash('#ff4020', 0.25);
              api.audio.sfx('hurt');
              if (this.hits >= 3) { api.lose(); return; }
            }
            if (this.swing.t <= 0) {
              this.swing = null;
              const interval = Math.max(0.7, 1.6 - this.dist * 0.018);
              this.nextSwing = api.rnd(interval, interval + 0.6);
            }
          }
          if (this.hitCD > 0) this.hitCD -= dt;

          if (this.dist >= this.need) { api.score += 100; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          // ship corridor interior
          c.fillStyle = '#1a1208';
          c.fillRect(0, 0, W, H);

          // wood plank walls
          for (let pi = 0; pi < 8; pi++) {
            g.rect(pi * 34, 44, 33, H - 84, '#241a0c');
            g.rect(pi * 34, 44, 1, H - 84, '#1a1208');
          }

          // porthole with night sky
          g.circle(W / 2, 86, 20, '#0a1a28');
          g.circle(W / 2, 86, 18, '#122030');
          g.rectO(W / 2 - 21, 65, 42, 42, '#6a5828', 3);
          // stars in porthole
          for (let si = 0; si < 5; si++) {
            c.globalAlpha = 0.5;
            g.rect(W / 2 - 10 + si * 5, 78 + si * 4, 1, 1, '#d0c8a0');
            c.globalAlpha = 1;
          }

          // floor planks
          c.fillStyle = '#3a2c18';
          c.fillRect(0, H - 40, W, 40);
          for (let fi = 0; fi < 8; fi++) g.rect(fi * 34, H - 40, 33, 1, '#2a1e10');

          // Pete looming on left
          const pY = H - 82;
          g.circle(-4, pY - 8, 30, '#c09060');
          g.circle(12, pY - 46, 20, '#c09060');
          g.rect(4, pY - 64, 24, 6, '#201408');
          g.rect(6, pY - 78, 20, 20, '#201408');
          g.circle(20, pY - 28, 15, '#a07848');
          g.rect(4, pY - 38, 5, 4, '#101010');
          g.rect(16, pY - 38, 5, 4, '#101010');
          // Pete's mouth (frown)
          g.rect(8, pY - 16, 16, 3, '#101010');

          // warning circle
          if (this.warning) {
            const pulse = 0.4 + 0.3 * Math.sin(api.t * 14);
            c.globalAlpha = pulse;
            g.circle(this.warning.x, H - 92, 30, '#ff6030');
            c.globalAlpha = 1;
            api.txtC('!', this.warning.x, H - 108, 14, '#ff6030');
          }

          // active swing fist
          if (this.swing) {
            const sx = this.swing.x, sy = H - 90;
            g.circle(sx, sy, 22, '#c09060');
            g.rect(sx - 18, sy - 10, 36, 18, '#c09060');
            g.rect(sx - 16, sy + 6, 32, 10, '#a07848');
          }

          // Mickey running (bouncing)
          const bounce = Math.sin(api.t * 14) * 3;
          const mx = this.x, my = H - 72 + bounce;
          g.rect(mx - 9, my + 12, 18, 22, '#101010');
          drawMickey(g, mx, my);
          // running legs
          const lp = Math.sin(api.t * 14) * 6;
          g.rect(mx - 5 + lp, my + 12, 4, 13, '#101010');
          g.rect(mx + 1 - lp, my + 12, 4, 13, '#101010');

          api.topBar('CAPTAIN PETE');
          for (let li = 0; li < 3; li++)
            g.circle(8 + li * 20, 18, 6, li < (3 - this.hits) ? '#e8c050' : '#2a1608');
          g.rect(W - 80, 8, 74, 8, '#1e1608');
          g.rect(W - 80, 8, 74 * Math.min(1, this.dist / this.need), 8, '#e8c050');
          api.txt('ESCAPE', W - 76, 20, 7, '#9a7840');
        },
      },
    ],
  });
})();
