/* ============================================================================
 * A CHRISTMAS CAROL — SCROOGE'S LONG NIGHT
 * Five chapters through Dickens' 1843 novella, each a distinct mini-game:
 *   1. MARLEY'S CHAINS    — watch the chain reform link by link, tap it back (memory)
 *   2. CHRISTMAS PAST     — tap glowing memory wisps before they fade (tap-collect)
 *   3. CHRISTMAS PRESENT  — grab & sort gifts to Tiny Tim / the table / the hearth (route)
 *   4. YET TO COME        — sift stolen goods from junk at Old Joe's den (deduction)
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
          'BOUND IN A CHAIN HE',
          'FORGED LINK BY LINK.',
          'Watch it, then relive it.',
        ],
        quote: 'I wear the chain I forged in life. I made it link by link.',
        help: 'WATCH the chain light up, then TAP the links back in order',
        winText: 'The spectre fades, its long chain finally recounted and understood.',
        loseText: "The chain rattles louder. Marley howls: 'Hear me, Ebenezer!'",

        stepDur: 0.62, // total time one link is shown during 'watch' (on + gap)
        onDur:   0.42, // portion of stepDur the link is actually lit

        linkDefs: [
          { key: 'box',    label: 'CASH-BOX' },
          { key: 'ledger', label: 'LEDGER'   },
          { key: 'lock',   label: 'PADLOCK'  },
          { key: 'purse',  label: 'PURSE'    },
        ],

        btnRect(i) {
          const col = i % 2, row = Math.floor(i / 2);
          const w = 120, h = 95, gapX = 8, gapY = 10, left = 11, top = 170;
          return { x: left + col * (w + gapX), y: top + row * (h + gapY), w, h };
        },

        hitButton(x, y) {
          for (let i = 0; i < 4; i++) {
            const r = this.btnRect(i);
            if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
          }
          return -1;
        },

        drawLinkIcon(api, key, cx, cy) {
          const c = api.ctx, g = api.gfx;
          if (key === 'box') {
            g.rect(cx - 12, cy - 8, 24, 16, '#8a6828');
            g.rect(cx - 12, cy - 8, 24, 4, '#a8824a');
            c.fillStyle = '#3a2810'; c.fillRect(cx - 2, cy - 3, 4, 6);
          } else if (key === 'ledger') {
            g.rect(cx - 10, cy - 10, 20, 20, '#5a4838');
            c.strokeStyle = '#2a2018'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(cx, cy - 10); c.lineTo(cx, cy + 10); c.stroke();
            c.strokeStyle = '#8a7858';
            for (let i = -6; i <= 6; i += 4) {
              c.beginPath(); c.moveTo(cx - 8, cy + i); c.lineTo(cx - 2, cy + i); c.stroke();
            }
          } else if (key === 'lock') {
            c.strokeStyle = '#8a9898'; c.lineWidth = 3;
            c.beginPath(); c.arc(cx, cy - 6, 7, Math.PI, 0); c.stroke();
            g.rect(cx - 10, cy - 4, 20, 16, '#6a7878');
          } else {
            c.fillStyle = '#5a3050';
            c.beginPath(); c.arc(cx, cy + 2, 11, 0, Math.PI * 2); c.fill();
            g.rect(cx - 4, cy - 12, 8, 8, '#7a4868');
          }
        },

        init(api) {
          this.seq = [];
          for (let i = 0; i < 3; i++) this.seq.push(Math.floor(Math.random() * 4));
          this.round      = 0;
          this.needRounds = 4;
          this.lives      = 3;
          this.phase      = 'watch';
          this.phaseT     = 0;
          this.inputIdx   = 0;
          this.lit        = -1;
          this.litOk      = null;
        },

        update(api, dt) {
          this.phaseT += dt;

          if (this.phase === 'roundClear') {
            if (this.phaseT > 0.5) { this.phase = 'watch'; this.phaseT = 0; }
            return;
          }

          if (this.phase === 'watch') {
            const i = Math.floor(this.phaseT / this.stepDur);
            if (i < this.seq.length) {
              const within = this.phaseT - i * this.stepDur;
              this.lit = within < this.onDur ? this.seq[i] : -1;
              this.litOk = null;
            } else {
              this.lit = -1;
              if (this.phaseT > this.seq.length * this.stepDur + 0.3) {
                this.phase = 'input'; this.phaseT = 0; this.inputIdx = 0;
              }
            }
            return;
          }

          // phase === 'input'
          if (api.pointer.justDown) {
            const idx = this.hitButton(api.pointer.x, api.pointer.y);
            if (idx >= 0) {
              if (idx === this.seq[this.inputIdx]) {
                this.lit = idx; this.litOk = true;
                api.audio.sfx('coin');
                const r = this.btnRect(idx);
                api.burst(r.x + r.w / 2, r.y + r.h / 2, '#d4a020', 5);
                this.inputIdx++;
                if (this.inputIdx >= this.seq.length) {
                  this.round++;
                  api.addScore(20 + this.seq.length * 4);
                  if (this.round >= this.needRounds) { api.addScore(60); api.win(); return; }
                  this.seq.push(Math.floor(Math.random() * 4));
                  this.phase = 'roundClear'; this.phaseT = 0;
                }
              } else {
                this.lit = idx; this.litOk = false;
                this.lives--;
                api.shake(6, 0.25); api.flash('#1a2848', 0.2); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
                this.phase = 'watch'; this.phaseT = 0; this.inputIdx = 0;
              }
            }
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#060810'; c.fillRect(0, 0, W, H);

          // Fireplace glow (corner ambience)
          c.globalAlpha = 0.1;
          g.circle(28, H - 18, 50, '#e07020');
          c.globalAlpha = 1;

          // Marley ghost (floating, translucent, oscillating)
          const gx = W / 2 + Math.sin(api.t * 1.3) * 14;
          const gy = 46 + Math.sin(api.t * 0.7) * 8;
          c.globalAlpha = 0.4 + 0.15 * Math.sin(api.t * 2.2);
          g.sprite([
            '..ggg..',
            '.ggggg.',
            'ggwwwgg',
            'ggwwwgg',
            '.ggggg.',
            '...g...',
          ], gx - 14, gy - 14, { g: '#8090b8', w: '#c0d0e8' }, 4);
          c.globalAlpha = 1;

          api.topBar("MARLEY'S CHAINS");
          let label = 'WATCH THE CHAIN...';
          if (this.phase === 'input') label = 'NOW TAP IT BACK';
          else if (this.phase === 'roundClear') label = 'ANOTHER LINK FORMS...';
          api.txtC(label, W / 2, 92, 8, this.phase === 'input' ? '#d4a020' : '#7a8898', true);

          // Progress dots (how far through the current chain)
          const total = this.seq.length;
          const dotW = 10, dotGap = 4, rowW = total * dotW + (total - 1) * dotGap;
          const dx0 = W / 2 - rowW / 2;
          for (let i = 0; i < total; i++) {
            let filled;
            if (this.phase === 'watch') filled = i <= Math.min(total - 1, Math.floor(this.phaseT / this.stepDur));
            else if (this.phase === 'input') filled = i < this.inputIdx;
            else filled = true;
            g.circle(dx0 + i * (dotW + dotGap) + dotW / 2, 112, dotW / 2, filled ? '#d4a020' : '#2a2438');
          }

          api.txt('ROUND ' + (this.round + 1) + '/' + this.needRounds, 6, 128, 8, '#7a8898');
          for (let i = 0; i < 3; i++) {
            g.rect(W - 18 - i * 16, 124, 12, 12, i < this.lives ? '#d4a020' : '#1a1a28');
          }

          // The four links
          for (let i = 0; i < 4; i++) {
            const r = this.btnRect(i);
            const link = this.linkDefs[i];
            let bg = '#120d16', border = '#3a3248';
            if (this.lit === i) {
              if (this.litOk === true) { bg = '#284018'; border = '#6ab848'; }
              else if (this.litOk === false) { bg = '#401818'; border = '#c84040'; }
              else { bg = '#3a3020'; border = '#d4a020'; }
            }
            g.rect(r.x, r.y, r.w, r.h, bg);
            c.strokeStyle = border; c.lineWidth = 2; c.strokeRect(r.x, r.y, r.w, r.h);
            this.drawLinkIcon(api, link.key, r.x + r.w / 2, r.y + r.h / 2 - 8);
            api.txtCFit(link.label, r.x + r.w / 2, r.y + r.h - 20, 7, '#c8b888', false, r.w - 10);
          }

          api.txt('TAP THE LINKS IN ORDER', 6, H - 16, 6, '#4a5060');
          api.vignette();
        },
      },

      /* ==================== 2. THE GHOST OF CHRISTMAS PAST ================== */
      {
        id: 'past',
        name: 'CHRISTMAS PAST',
        sub: 'THE REDEMPTION LEDGER',

        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.rect(x - 9, y - 6, 18, 12, '#e8d8b0');
          c.strokeStyle = '#8a7850'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x, y + 6); c.stroke();
        },

        intro: [
          'THE SPIRIT SHOWS SIX',
          "SCENES FROM SCROOGE'S",
          'OWN PAST. FOR EACH,',
          'CHOOSE WARMTH OR GOLD.',
        ],
        quote: 'I was a boy here! Poor Fan! She had a large heart!',
        help: 'READ the scene · TAP the WARM memory before the cold ledger claims it',
        winText: 'The ledger glows warm at last. Scrooge weeps for the boy he was.',
        loseText: 'The ledger fills with cold black ink. The old habits hold fast.',

        scenes: [
          { label: 'THE LONELY SCHOOLROOM',   warm: 'REMEMBER LITTLE FAN',        cold: 'TURN AWAY, AS ALWAYS' },
          { label: "FEZZIWIG'S BALL",         warm: 'DANCE TILL THE FIDDLES STOP', cold: 'COUNT THE COST OF IT' },
          { label: 'BELLE BY THE FIRE',       warm: "REACH FOR BELLE'S HAND",      cold: 'CLUTCH THE GOLDEN IDOL' },
          { label: 'THE PARTING WORDS',       warm: 'BEG HER TO STAY',            cold: 'LET AMBITION SPEAK' },
          { label: 'THE OLD COUNTING-HOUSE',  warm: "REMEMBER MARLEY'S KINDNESS", cold: 'BURY IT IN LEDGERS' },
          { label: 'ONE LAST GLANCE',         warm: "WATCH BELLE'S HAPPY HOME",   cold: 'LOOK AWAY, UNMOVED' },
        ],

        sideRect(side) {
          const w = 112, h = 150, y = 190;
          return side === 'L' ? { x: 14, y, w, h } : { x: 270 - 14 - w, y, w, h };
        },

        hitSide(x, y) {
          for (const side of ['L', 'R']) {
            const r = this.sideRect(side);
            if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return side;
          }
          return null;
        },

        resolve(api, chosenWarm) {
          if (chosenWarm) {
            this.warmCount++;
            this.lastOk = true;
            api.addScore(22);
            api.audio.sfx('coin');
            const r = this.sideRect(this.warmSide);
            api.burst(r.x + r.w / 2, r.y + r.h / 2, '#e8b84a', 8);
          } else {
            this.lastOk = false;
            this.lives--;
            api.shake(5, 0.22); api.flash('#1a2038', 0.18); api.audio.sfx('hurt');
          }
          this.phase = 'result';
          this.resultT = 1.0;
        },

        init(api) {
          this.idx       = 0;
          this.need      = this.scenes.length;
          this.warmCount = 0;
          this.lives     = 3;
          this.sceneDur  = 4.2;
          this.timer     = this.sceneDur;
          this.phase     = 'choose';
          this.resultT   = 0;
          this.lastOk    = null;
          this.warmSide  = Math.random() < 0.5 ? 'L' : 'R';
        },

        update(api, dt) {
          if (this.phase === 'choose') {
            this.timer -= dt;
            if (api.pointer.justDown) {
              const side = this.hitSide(api.pointer.x, api.pointer.y);
              if (side) { this.resolve(api, side === this.warmSide); return; }
            }
            if (this.timer <= 0) { this.resolve(api, false); return; }
            return;
          }

          // phase === 'result'
          this.resultT -= dt;
          if (this.resultT <= 0) {
            if (this.lives <= 0) { api.lose(); return; }
            this.idx++;
            if (this.idx >= this.need) {
              api.addScore(50 + this.warmCount * 8);
              api.win(); return;
            }
            this.timer    = this.sceneDur;
            this.phase    = 'choose';
            this.lastOk   = null;
            this.warmSide = Math.random() < 0.5 ? 'L' : 'R';
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#0a0c14'; c.fillRect(0, 0, W, H);

          // Warm sepia memory glow
          c.globalAlpha = 0.1;
          g.circle(W / 2, H * 0.3, 120, '#f8c050');
          c.globalAlpha = 1;

          // Ghost of Christmas Past (glowing child, floating)
          const gx = W / 2, gy = 62 + Math.sin(api.t * 0.65) * 10;
          c.globalAlpha = 0.32 + 0.12 * Math.sin(api.t * 2.1);
          g.sprite([
            '..ww..',
            '.wwww.',
            'wwllww',
            'wwllww',
            '.wwww.',
            '..ww..',
          ], gx - 12, gy - 12, { w: '#c8e0ff', l: '#f0f8ff' }, 4);
          c.globalAlpha = 1;

          api.topBar('CHRISTMAS PAST');

          const scene = this.scenes[Math.min(this.idx, this.need - 1)];
          api.txtCFit(scene.label, W / 2, 100, 9, '#e8b84a', true, W - 24);

          // Progress dots (scenes completed)
          const dotW = 10, dotGap = 5, rowW = this.need * dotW + (this.need - 1) * dotGap;
          const dx0 = W / 2 - rowW / 2;
          for (let i = 0; i < this.need; i++) {
            let col = '#241e30';
            if (i < this.idx) col = '#e8b84a';
            else if (i === this.idx && this.phase === 'result') col = this.lastOk ? '#6ab848' : '#c84040';
            g.circle(dx0 + i * (dotW + dotGap) + dotW / 2, 122, dotW / 2, col);
          }

          for (let i = 0; i < 3; i++) {
            g.rect(W - 20 - i * 16, 130, 12, 12, i < this.lives ? '#e8b84a' : '#1a1a28');
          }

          if (this.phase === 'choose') {
            const pct = clamp(this.timer / this.sceneDur, 0, 1);
            g.rect(20, 148, W - 40, 6, '#241e30');
            g.rect(20, 148, (W - 40) * pct, 6, pct < 0.3 ? '#c84040' : '#e8b84a');
            api.txtC('CHOOSE...', W / 2, 172, 7, '#7a8898');
          } else {
            api.txtC(this.lastOk ? 'THE LEDGER WARMS' : 'THE LEDGER COOLS', W / 2, 172, 7,
              this.lastOk ? '#6ab848' : '#c84040');
          }

          // Two memory panels
          for (const side of ['L', 'R']) {
            const r = this.sideRect(side);
            const isWarm = side === this.warmSide;
            let bg = isWarm ? '#241e0c' : '#141824';
            let border = isWarm ? '#8a6828' : '#3a4458';
            if (this.phase === 'result') c.globalAlpha = isWarm ? 1 : 0.4;
            g.rect(r.x, r.y, r.w, r.h, bg);
            c.strokeStyle = border; c.lineWidth = 2; c.strokeRect(r.x, r.y, r.w, r.h);
            c.globalAlpha = 1;

            const cx = r.x + r.w / 2, cy = r.y + 40;
            if (isWarm) { g.circle(cx, cy, 12, '#f0d060'); g.circle(cx, cy, 6, '#fff8c0'); }
            else { g.rect(cx - 12, cy - 9, 24, 18, '#5a4838'); g.rect(cx - 12, cy - 9, 24, 5, '#7a6248'); }

            api.txtCHead(isWarm ? scene.warm : scene.cold, cx, r.y + 78, 7,
              isWarm ? '#e8b84a' : '#a0b0c8', false, 11, r.w - 12);
          }

          api.txt('TAP A MEMORY', 6, H - 16, 6, '#4a5060');
          api.vignette();
        },
      },

      /* =================== 3. THE GHOST OF CHRISTMAS PRESENT ================= */
      {
        id: 'present',
        name: 'CHRISTMAS PRESENT',
        sub: 'THE CRATCHIT LEDGER',

        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 1, 7, '#8a4818');
          g.circle(x, y - 7, 4, '#b06020');
          g.rect(x - 1, y - 12, 2, 5, '#c0a060');
        },

        intro: [
          'THE JOLLY GIANT SPIRIT',
          'SHOWS THE CRATCHIT HOME.',
          'GRAB EACH GIFT AND CARRY',
          'IT WHERE IT IS NEEDED.',
        ],
        quote: 'God bless us, every one! said Tiny Tim, the last of all.',
        help: 'DRAG each gift to TINY TIM, THE TABLE, or THE HEARTH — sort them right!',
        winText: 'The Cratchit table groans with plenty. Tiny Tim beams with delight.',
        loseText: "Too much drifts into Scrooge's old counting-house habits. The family goes without.",

        init(api) {
          const bw = api.W / 3;
          this.bins = [
            { key: 'tim',    label: 'TINY TIM',  x: bw * 0 + bw / 2, col: '#5ac0d8' },
            { key: 'table',  label: 'THE TABLE', x: bw * 1 + bw / 2, col: '#c07030' },
            { key: 'hearth', label: 'THE HEARTH', x: bw * 2 + bw / 2, col: '#e0a028' },
          ];
          this.binY   = api.H - 46;
          this.binW   = bw - 8;
          this.kinds  = [
            { kind: 'tim',    col: '#8adcf0', col2: '#d0f4ff' },
            { kind: 'table',  col: '#c07030', col2: '#e8a860' },
            { kind: 'hearth', col: '#3a2818', col2: '#e07020' },
          ];
          this.items    = [];
          this.held     = null;
          this.sorted   = 0;
          this.need     = 14;
          this.hoarded  = 0;
          this.maxHoard = 5;
          this.spawnT   = 0.9;
          this.timer    = 42;
        },

        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;
          this.timer -= dt;

          // Spawn a drifting gift
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.62, 0.95 - (42 - Math.max(0, this.timer)) / 90);
            const k = this.kinds[Math.floor(Math.random() * this.kinds.length)];
            this.items.push({
              x: 26 + Math.random() * (W - 52), y: -12,
              vy: 14 + Math.random() * 8, sway: Math.random() * Math.PI * 2,
              kind: k.kind, col: k.col, col2: k.col2, held: false,
            });
          }

          // Grab the nearest ungrabbed item on tap
          if (api.pointer.justDown && !this.held) {
            let best = null, bestD = 26;
            for (const it of this.items) {
              const d = Math.hypot(it.x - api.pointer.x, it.y - api.pointer.y);
              if (d < bestD) { bestD = d; best = it; }
            }
            if (best) { best.held = true; this.held = best; }
          }

          // Carry the held item to the pointer
          if (this.held) {
            if (api.pointer.down) {
              this.held.x += (api.pointer.x - this.held.x) * 0.4 * f;
              this.held.y += (api.pointer.y - this.held.y) * 0.4 * f;
            }
            if (api.pointer.justUp) {
              const it = this.held;
              let bin = null;
              if (it.y > this.binY - 30) {
                for (const b of this.bins) {
                  if (Math.abs(it.x - b.x) < this.binW / 2) { bin = b; break; }
                }
              }
              if (bin) {
                it.gone = true;
                if (bin.key === it.kind) {
                  this.sorted++;
                  api.addScore(14);
                  api.audio.sfx('coin');
                  api.burst(bin.x, this.binY, bin.col, 8);
                  if (this.sorted >= this.need) { api.addScore(90); api.win(); return; }
                } else {
                  this.hoarded++;
                  api.shake(4, 0.18); api.audio.sfx('blip'); api.flash('#3a2818', 0.16);
                  if (this.hoarded >= this.maxHoard) { api.lose(); return; }
                }
              } else {
                it.held = false; // dropped mid-air — keeps drifting
              }
              this.held = null;
            }
          }

          // Drift ungrabbed items down; missing the bin row hoards them
          for (const it of this.items) {
            if (it.gone || it.held) continue;
            it.y += it.vy * dt;
            it.x += Math.sin(api.t * 1.4 + it.sway) * 0.35 * f;
            if (it.y > this.binY + 16) {
              it.gone = true;
              this.hoarded++;
              api.audio.sfx('blip');
              if (this.hoarded >= this.maxHoard) { api.lose(); return; }
            }
          }
          this.items = this.items.filter(it => !it.gone);
          if (this.timer <= 0 && this.sorted < this.need) api.lose();
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#0e0c08'; c.fillRect(0, 0, W, H);

          // Warm fireplace glow (right)
          c.globalAlpha = 0.14;
          g.circle(W - 20, H - 20, 90, '#f07020');
          c.globalAlpha = 1;

          // Frost window (top)
          g.rect(W / 2 - 28, 20, 56, 44, '#0a1420');
          g.rect(W / 2 - 26, 22, 52, 40, '#0c1c30');
          g.rect(W / 2 - 1, 20, 2, 44, '#1e1208');
          g.rect(W / 2 - 28, 42, 56, 2, '#1e1208');
          g.rect(W / 2 - 30, 62, 60, 5, '#c8d8e8'); // snow sill

          // Ghost of Christmas Present (giant, jolly, partial)
          c.globalAlpha = 0.24;
          g.sprite([
            '.gggg.',
            'gggggg',
            'ggwwgg',
            'ggwwgg',
          ], W / 2 - 12, 14, { g: '#3a8838', w: '#d0eec8' }, 4);
          c.globalAlpha = 1;

          // Three bins along the bottom
          for (const b of this.bins) {
            const bx = b.x - this.binW / 2, by = this.binY, bw = this.binW, bh = 30;
            const active = this.held && Math.abs(this.held.x - b.x) < this.binW / 2 && this.held.y > this.binY - 30;
            c.fillStyle = active ? b.col : '#241a10';
            c.globalAlpha = active ? 0.55 : 1;
            g.rect(bx, by, bw, bh, c.fillStyle);
            c.globalAlpha = 1;
            c.strokeStyle = b.col; c.lineWidth = active ? 2 : 1;
            c.strokeRect(bx, by, bw, bh);
            // Bin glyphs
            if (b.key === 'tim') {
              g.rect(b.x - 1, by + 6, 2, 16, '#c0a870');   // crutch
              g.circle(b.x, by + 6, 3, '#c0a870');
            } else if (b.key === 'table') {
              g.circle(b.x, by + 14, 8, '#c07030');
              g.circle(b.x - 2, by + 12, 4, '#e09040');
            } else {
              g.sprite(['.f.', 'fff'], b.x - 4, by + 6, { f: '#e07020' }, 3);
              g.rect(b.x - 6, by + 16, 12, 6, '#2a2018');
            }
            api.txtCFit(b.label, b.x, by + bh + 9, 6, active ? b.col : '#7a8898', false, bw + 6);
          }

          // Falling / carried gifts
          for (const it of this.items) {
            const held = it === this.held;
            if (held) { c.globalAlpha = 0.9; }
            g.circle(it.x, it.y, held ? 10 : 8, it.col);
            g.circle(it.x - 2, it.y - 2, held ? 5 : 4, it.col2);
            c.globalAlpha = 1;
            if (held) {
              c.strokeStyle = '#f0e8cc'; c.lineWidth = 1;
              c.globalAlpha = 0.6 + 0.3 * Math.sin(api.t * 8);
              c.beginPath(); c.arc(it.x, it.y, 13, 0, Math.PI * 2); c.stroke();
              c.globalAlpha = 1;
            }
          }

          // HUD
          api.topBar('CHRISTMAS PRESENT');
          api.txt('SORTED ' + this.sorted + '/' + this.need, 6, 20, 9, '#d4a020');
          api.txt('HOARDED ' + this.hoarded + '/' + this.maxHoard, W - 106, 20, 9,
            this.hoarded >= 3 ? '#c84040' : '#7a8898');
          api.vignette();
        },
      },

      /* ================ 4. THE GHOST OF CHRISTMAS YET TO COME ================ */
      {
        id: 'future',
        name: 'YET TO COME',
        sub: "OLD JOE'S DEN",

        icon(api, x, y) {
          const c = api.ctx, g = api.gfx;
          g.rect(x - 7, y - 3, 14, 10, '#7a6248');
          c.strokeStyle = '#3a2c1c'; c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(x - 7, y - 3); c.lineTo(x + 7, y + 7); c.stroke();
          c.beginPath(); c.moveTo(x + 7, y - 3); c.lineTo(x - 7, y + 7); c.stroke();
          g.circle(x, y - 6, 2, '#3a2c1c');
        },

        intro: [
          'A DARK, HOODED PHANTOM',
          'LEADS SCROOGE TO A DEN',
          'WHERE HIS OWN THINGS',
          'ARE SOLD BY CANDLELIGHT.',
        ],
        quote: 'Every person has a right to take care of themselves. He always did!',
        help: "TAP Scrooge's own things · leave the junk be",
        winText: 'Scrooge clutches the bedpost. He is alive — and it is Christmas!',
        loseText: 'The candle gutters out. Old Joe pockets the last of it, unseen.',

        targetDefs: [
          { key: 'curtains', label: 'CURTAINS' },
          { key: 'shirt',    label: 'HIS SHIRT' },
          { key: 'seals',    label: 'THE SEALS' },
          { key: 'pencase',  label: 'PEN-CASE' },
          { key: 'buttons',  label: 'BUTTONS' },
        ],
        decoyDefs: [
          { key: 'boot',   label: 'OLD BOOT' },
          { key: 'key',    label: 'RUSTY KEY' },
          { key: 'cup',    label: 'CRACKED CUP' },
          { key: 'spoon',  label: 'BENT SPOON' },
          { key: 'rope',   label: 'FRAYED ROPE' },
          { key: 'plate',  label: 'TIN PLATE' },
          { key: 'comb',   label: 'BROKEN COMB' },
        ],
        foundFlavor: {
          curtains: 'THE BED-CURTAINS!',
          shirt:    'HIS OWN SHIRT!',
          seals:    'THE SEALS FROM HIS WATCH!',
          pencase:  'HIS PENCIL-CASE!',
          buttons:  'HIS SLEEVE-BUTTONS!',
        },

        slotRect(i) {
          const col = i % 3, row = Math.floor(i / 3);
          const w = 78, h = 56, gapX = 6, gapY = 8, left = 12, top = 146;
          return { x: left + col * (w + gapX), y: top + row * (h + gapY), w, h };
        },

        hitSlot(x, y) {
          for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].gone) continue;
            const r = this.slotRect(i);
            if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
          }
          return -1;
        },

        init(api) {
          const targets = this.targetDefs.map(d => ({ ...d, isTarget: true }));
          const decoys  = this.decoyDefs.map(d => ({ ...d, isTarget: false }));
          const all = targets.concat(decoys);
          for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [all[i], all[j]] = [all[j], all[i]];
          }
          this.items     = all.map(d => ({ ...d, gone: false, flash: 0, flashOk: null }));
          this.found     = 0;
          this.need      = targets.length;
          this.mistakes  = 0;
          this.maxMiss   = 3;
          this.timer     = 34;
          this.flavorT   = 0;
          this.flavorTxt = '';
        },

        update(api, dt) {
          this.timer -= dt;
          this.flavorT = Math.max(0, this.flavorT - dt);
          for (const it of this.items) if (it.flash > 0) it.flash -= dt;

          if (api.pointer.justDown) {
            const idx = this.hitSlot(api.pointer.x, api.pointer.y);
            if (idx >= 0) {
              const it = this.items[idx];
              it.flash = 0.35;
              if (it.isTarget) {
                it.flashOk = true; it.gone = true;
                this.found++;
                api.addScore(20);
                api.audio.sfx('coin');
                const r = this.slotRect(idx);
                api.burst(r.x + r.w / 2, r.y + r.h / 2, '#d4a020', 7);
                this.flavorT = 1.1; this.flavorTxt = this.foundFlavor[it.key] || it.label;
                if (this.found >= this.need) {
                  api.addScore(60 + Math.ceil(Math.max(0, this.timer)));
                  api.win(); return;
                }
              } else {
                it.flashOk = false; it.gone = true;
                this.mistakes++;
                api.shake(5, 0.22); api.flash('#1a1408', 0.18); api.audio.sfx('hurt');
                this.flavorT = 1.0; this.flavorTxt = 'JUST JUNK — OLD JOE SNORTS';
                if (this.mistakes >= this.maxMiss) { api.lose(); return; }
              }
            }
          }

          if (this.timer <= 0 && this.found < this.need) api.lose();
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#0c0906'; c.fillRect(0, 0, W, H);

          // Guttering candlelight pool
          const flick = 0.14 + 0.05 * Math.sin(api.t * 9) + 0.03 * Math.sin(api.t * 3.3);
          c.globalAlpha = flick;
          g.circle(W / 2, 60, 100, '#e0a028');
          c.globalAlpha = 1;

          // Old Joe, hunched over his counter
          c.globalAlpha = 0.7;
          g.sprite([
            '.hh.',
            'hshh',
            '.ss.',
            'ss.s',
          ], W / 2 - 8, 26, { h: '#4a3a28', s: '#241a10' }, 4);
          c.globalAlpha = 1;
          api.txtC('OLD JOE WEIGHS HIS TAKE...', W / 2, 74, 6, '#7a6248');

          // The candle stub, burning down with the timer
          const pct = clamp(this.timer / 34, 0, 1);
          g.rect(W - 20, 12, 6, 22, '#5a4838');
          g.rect(W - 21, 10 + (1 - pct) * 20, 8, 2 + pct * 20, '#e8d8a8');
          c.globalAlpha = 0.5 + 0.3 * Math.sin(api.t * 10);
          g.circle(W - 17, 9 + (1 - pct) * 20, 3, '#f8d068');
          c.globalAlpha = 1;

          // Item slots — bundled goods on the shop floor
          for (let i = 0; i < this.items.length; i++) {
            const it = this.items[i];
            if (it.gone && it.flash <= 0) continue;
            const r = this.slotRect(i);
            let bg = '#1a140c', border = '#4a3a28';
            if (it.flash > 0) {
              if (it.flashOk === true)      { bg = '#284018'; border = '#6ab848'; }
              else if (it.flashOk === false) { bg = '#401818'; border = '#c84040'; }
            }
            g.rect(r.x, r.y, r.w, r.h, bg);
            c.strokeStyle = border; c.lineWidth = 1.5; c.strokeRect(r.x, r.y, r.w, r.h);
            // wrapped-bundle glyph
            const bx = r.x + r.w / 2, by = r.y + 18;
            g.rect(bx - 12, by - 7, 24, 16, '#7a6248');
            c.strokeStyle = '#3a2c1c'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(bx - 12, by - 7); c.lineTo(bx + 12, by + 9); c.stroke();
            c.beginPath(); c.moveTo(bx + 12, by - 7); c.lineTo(bx - 12, by + 9); c.stroke();
            api.txtCFit(it.label, r.x + r.w / 2, r.y + r.h - 8, 6, '#c8b898', false, r.w - 6);
          }

          // Flavor banner
          if (this.flavorT > 0) {
            c.globalAlpha = Math.min(1, this.flavorT * 2);
            api.txtC(this.flavorTxt, W / 2, H - 58, 7, '#e8b84a', true);
            c.globalAlpha = 1;
          }

          // HUD
          api.topBar('YET TO COME');
          api.txt('FOUND ' + this.found + '/' + this.need, 6, 20, 9, '#d4a020');
          api.txt('TIME ' + Math.ceil(Math.max(0, this.timer)), W - 74, 20, 9,
            this.timer < 10 ? '#c84040' : '#7a8898');
          for (let i = 0; i < this.maxMiss; i++) {
            g.rect(6 + i * 14, H - 32, 10, 10, i < this.maxMiss - this.mistakes ? '#d4a020' : '#1a1a28');
          }
          api.txt('MISTAKES LEFT', 46, H - 24, 6, '#4a5060');
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
