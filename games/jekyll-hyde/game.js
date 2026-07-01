/* ============================================================================
 * DR. JEKYLL & MR. HYDE — TWO MINDS
 * Five chapters through Stevenson's 1886 novella:
 *   1. THE FORMULA      — pendulum timing, brew the transformation compound
 *   2. HYDE'S NIGHT     — dodge chapter, prowl foggy London streets
 *   3. THE CAREW NIGHT  — tap witnesses in windows before they raise the alarm
 *   4. THE LAST DOSE    — catch falling vials before Jekyll's supply runs dry
 *   5. THE LOCKED DOOR  — dual-form QTE, Jekyll vs Hyde racing to escape
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  // Jekyll's coat-of-arms / potion flask emblem
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // flask body
    g.rect(cx - 10, cy - 4, 20, 18, '#2a1640');
    g.rect(cx - 6, cy - 12, 12, 10, '#2a1640');
    g.rect(cx - 4, cy - 16, 8, 6, '#1a0d28');
    // liquid glow
    c.globalAlpha = 0.7;
    g.rect(cx - 9, cy + 2, 18, 14, '#44cc66');
    c.globalAlpha = 0.4;
    g.rect(cx - 9, cy + 2, 18, 6, '#88ffaa');
    c.globalAlpha = 1;
    // bubbles
    g.circle(cx - 3, cy + 6, 2, '#aaffc8');
    g.circle(cx + 4, cy + 10, 1, '#aaffc8');
    // outline
    g.rectO(cx - 10, cy - 4, 20, 18, '#9b5cff', 1);
    g.rectO(cx - 6, cy - 12, 12, 10, '#9b5cff', 1);
  }

  // Victorian study backdrop for all framed screens
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    // dark study background
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a0518'); sky.addColorStop(0.5, '#14092a'); sky.addColorStop(1, '#0a0514');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // gaslit window on left wall
    const glow = 0.18 + 0.06 * Math.sin(t * 1.3);
    c.globalAlpha = glow;
    g.rect(18, 60, 52, 72, '#cc8833');
    c.globalAlpha = glow * 0.5;
    g.rect(0, 50, 80, 100, '#cc8833');
    c.globalAlpha = 1;
    g.rect(18, 60, 52, 72, 'rgba(0,0,0,0)');
    g.rectO(18, 60, 52, 72, '#4a3020', 2);
    // window panes
    g.rect(43, 60, 2, 72, '#4a3020');
    g.rect(18, 96, 52, 2, '#4a3020');

    // bookshelf on right
    for (let row = 0; row < 3; row++) {
      const by = 70 + row * 40;
      g.rect(196, by, 68, 34, '#2a1a0e');
      g.rectO(196, by, 68, 34, '#3a2a1a', 1);
      const bookW = [8, 10, 7, 9, 10, 8, 11];
      const bookC = ['#8a2020', '#2a4a8a', '#6a5a20', '#3a6a3a', '#7a3a6a', '#8a5020', '#4a2a6a'];
      let bx = 198;
      for (let b = 0; b < bookW.length; b++) { g.rect(bx, by + 2, bookW[b] - 1, 28, bookC[b]); bx += bookW[b]; }
    }

    // laboratory bench at bottom
    g.rect(0, H - 80, W, 80, '#1a120a');
    g.rect(0, H - 82, W, 4, '#2a1e0e');
    // beakers
    const beakers = [[40, H - 72, '#44cc66', 0.6], [80, H - 68, '#cc4466', 0.5], [120, H - 64, '#cc8833', 0.7], [160, H - 70, '#4466cc', 0.55]];
    for (const [bx, by, bc, ba] of beakers) {
      g.rect(bx - 8, by, 16, 24, '#1a1428');
      g.rectO(bx - 8, by, 16, 24, '#5a4a6a', 1);
      c.globalAlpha = ba;
      g.rect(bx - 7, by + 16, 14, 7, bc);
      c.globalAlpha = 0.25;
      g.rect(bx - 7, by + 16, 14, 3, '#ffffff');
      c.globalAlpha = 1;
    }
    // candle
    g.rect(200, H - 78, 6, 26, '#f0e8c0');
    c.globalAlpha = 0.4 + 0.15 * Math.sin(t * 7); g.circle(203, H - 80, 7, '#cc8833'); c.globalAlpha = 1;
    g.rect(203, H - 82, 2, 6, '#e8a020');

    // fog wisps drifting across
    for (let i = 0; i < 3; i++) {
      c.globalAlpha = 0.04;
      const fx = ((t * 14 + i * 110) % (W + 100)) - 50;
      g.rect(fx, 160 + i * 60, 100, 20, '#a090d0');
      c.globalAlpha = 1;
    }

    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(8,4,16,.7)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // dim the study, draw a leather-topped desk
      c.fillStyle = 'rgba(8,4,16,.5)'; c.fillRect(0, 0, W, H);
      // desk surface
      g.rect(0, H - 100, W, 100, '#1a120e');
      g.rect(0, H - 102, W, 4, '#2e1e12');
      // desk accessories: ink pot, pen
      g.rect(W - 40, H - 90, 18, 18, '#1a1428');
      g.rectO(W - 40, H - 90, 18, 18, '#4a3a5a', 1);
      g.rect(W - 20, H - 94, 3, 22, '#3a2a1a');
    }
  }

  // journal page menu card — each chapter is a torn page from Jekyll's diary
  const PAGE_POSITIONS = [
    [12, 108, 110, 90],
    [148, 96, 104, 88],
    [20, 224, 108, 88],
    [152, 216, 106, 88],
    [60, 344, 150, 82],
  ];

  const PAGE_TINTS = ['#1a0d28', '#14091e', '#1e1030', '#160a24', '#12081c'];
  const PAGE_INK = ['#cc8833', '#9b5cff', '#cc8833', '#9b5cff', '#cc8833'];

  RetroSaga.create({
    id: 'jekyll',
    title: 'Two Minds',
    subtitle: 'A TALE OF ONE MAN DIVIDED',
    currency: 'DOSES',
    screens: {
      win: '#44cc66', lose: '#8a1040',
      chapterLabel: '#7a6a9a', name: '#e0d0f0',
      sub: '#9b5cff', intro: '#c8b8e0', quote: '#7a6a9a',
      help: '#cc8833', score: '#e0d0f0', cur: '#9b5cff',
      cta: '#e0d0f0', overlay: 'rgba(8,4,18,.86)'
    },
    labels: {
      chapter: 'PHASE',
      score: 'DOSES HELD',
      win: 'THE MIND HOLDS',
      lose: 'THE BEAST TAKES OVER',
      cont: 'TAP TO PRESS ON',
      finale: 'TAP FOR THE FINAL ACT',
      toMenu: 'TAP TO RETURN',
      play: 'TAP TO BEGIN'
    },
    accent: '#9b5cff',
    credit: 'STRANGE CASE OF DR JEKYLL · R. L. STEVENSON, 1886',
    bootLine: 'FIVE PHASES · TWO SOULS',
    emblem,
    scenery,
    bootCta: 'TAP TO ENTER THE STUDY',
    menuLabel: "JEKYLL'S JOURNAL",
    menuHint: 'OPEN A PHASE TO CONTINUE',
    menuDone: 'THE SECRET DIES WITH HIM',
    menu: {
      colors: { title: '#cc8833', label: '#7a6a9a', cur: '#e0d0f0' },
      layout() {
        return PAGE_POSITIONS.map(function(p) { return { x: p[0], y: p[1], w: p[2], h: p[3] }; });
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        // journal page background with slight torn-paper look
        const tint = sel ? '#2a1844' : PAGE_TINTS[i] || '#1a0d28';
        g.rect(x, y, w, h, tint);
        g.rectO(x, y, w, h, sel ? '#9b5cff' : (PAGE_INK[i] || '#4a2a6a'), sel ? 2 : 1);
        // torn edge at top
        for (let tx = x; tx < x + w; tx += 4) {
          const tear = (tx * 7 + i * 13) % 5;
          if (tear < 2) g.rect(tx, y, 3, tear + 1, '#0a0514');
        }
        // ruled lines
        for (let line = 0; line < 4; line++) {
          const ly = y + 18 + line * 14;
          if (ly < y + h - 10) g.rect(x + 6, ly, w - 12, 1, 'rgba(150,120,200,.15)');
        }
        // chapter icon area
        if (ch.icon) ch.icon(api, x + 14, y + h / 2 - 4);
        // chapter name — in-voice handwriting style
        const ink = done ? '#44cc66' : (sel ? '#e0d0f0' : (PAGE_INK[i] || '#cc8833'));
        api.txtCFit('Ph.' + (i + 1) + ' ' + ch.name, x + w / 2 + 4, y + 14, 7, ink, false, w - 28);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2 + 4, y + 28, 6, '#7a6a9a', false, w - 28);
        // wax seal in corner
        const sx = x + w - 14, sy = y + h - 14;
        g.circle(sx, sy, 8, done ? '#2a6a2a' : '#4a1a1a');
        api.txtC(done ? '✦' : (i + 1).toString(), sx, sy - 5, 7, done ? '#44cc66' : '#cc8833');
      },
    },
    finale: [
      'JEKYLL WRITES HIS LAST',
      'CONFESSION BY MORNING LIGHT.',
      'HYDE WILL NEVER WALK AGAIN.',
      '',
      'THE STUDY DOOR IS LOCKED.',
      'THE FORMULA BURNS.'
    ],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#cc8833', blood: '#cc1144' },

    chapters: [

      /* ===================== 1. THE FORMULA ======================== */
      {
        id: 'formula', name: 'THE FORMULA', sub: "JEKYLL'S LABORATORY",
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 5, y - 2, 10, 10, '#1a1428');
          g.rectO(x - 5, y - 2, 10, 10, '#9b5cff', 1);
          g.rect(x - 3, y - 6, 6, 6, '#1a1428');
          g.rectO(x - 3, y - 6, 6, 6, '#9b5cff', 1);
          const g2 = api.gfx;
          g2.rect(x - 4, y + 2, 8, 5, '#44cc66');
        },
        intro: [
          'IN THE DEAD OF NIGHT',
          'JEKYLL STIRS THE POWDERS.',
          'Five precise additions',
          'and the compound is born.'
        ],
        quote: 'I had learned to dwell with pleasure on the thought of the other me.',
        help: 'TAP when the needle centres — 5 times',
        winText: 'The liquid seethes green and settles. The formula is complete.',
        loseText: 'A shaking hand — the compound curdles black. Begin again.',
        init(api) {
          this.brews = 0; this.need = 5;
          this.misses = 0; this.maxMiss = 4;
          this.needle = 0.5; this.dir = 1;
          this.spd = 1.0;
          this.zone = 0.16;
          this.flash = 0;
          this.bubbles = [];
        },
        update(api, dt) {
          const f = dt * 60;
          this.needle += this.dir * this.spd * 0.025 * f;
          if (this.needle >= 1) { this.needle = 1; this.dir = -1; }
          if (this.needle <= 0) { this.needle = 0; this.dir = 1; }
          if (this.flash > 0) this.flash -= dt;

          // spawn bubbles in liquid
          if (Math.random() < 0.06 * f) {
            this.bubbles.push({ x: 80 + Math.random() * 110, y: api.H - 120, life: 0.8 + Math.random() * 0.6 });
          }
          for (const b of this.bubbles) { b.y -= 0.8 * f; b.life -= dt; }
          this.bubbles = this.bubbles.filter(function(b) { return b.life > 0; });

          if (api.confirm()) {
            const dist = Math.abs(this.needle - 0.5);
            if (dist < this.zone) {
              this.brews++;
              api.addScore(30);
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H - 160, '#44cc66', 8);
              this.flash = 0.3;
              this.spd = Math.min(2.4, this.spd + 0.18);
              this.zone = Math.max(0.08, this.zone - 0.01);
              if (this.brews >= this.need) { api.addScore(80); api.win(); }
            } else {
              this.misses++;
              api.shake(5, 0.22);
              api.audio.sfx('hurt');
              if (this.misses >= this.maxMiss) api.lose();
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#08040f');

          // stone lab floor
          for (let ty = 0; ty < H; ty += 20)
            for (let tx = 0; tx < W; tx += 24)
              g.rect(tx + (Math.floor(ty / 20) % 2 ? 12 : 0), ty, 22, 18, '#100a1c');

          // central beaker / flask
          const fx = W / 2 - 18, fy = H - 220;
          g.rect(fx - 4, fy - 20, 8, 22, '#2a1e3a'); // neck
          g.rect(fx + 26, fy - 20, 8, 22, '#2a1e3a');
          g.rect(fx - 2, fy - 24, 40, 6, '#2a1e3a'); // rim
          g.rect(fx - 8, fy, 52, 90, '#1a1430'); // body
          g.rectO(fx - 8, fy, 52, 90, '#5a3a8a', 2);

          // liquid level (fills as brews increase)
          const liq = this.brews / this.need;
          const liqH = Math.floor(80 * liq);
          if (liqH > 0) {
            if (this.flash > 0) {
              g.rect(fx - 7, fy + 88 - liqH, 50, liqH, '#aaffcc');
            } else {
              g.rect(fx - 7, fy + 88 - liqH, 50, liqH, '#1a6a3a');
              g.rect(fx - 7, fy + 88 - liqH, 50, 4, '#44cc66');
            }
          }

          // bubbles in liquid
          c.globalAlpha = 0.6;
          for (const b of this.bubbles) {
            if (b.y > fy + 90 - liqH) {
              g.circle(b.x, b.y, 2, '#88ffaa');
            }
          }
          c.globalAlpha = 1;

          // glow from flask
          c.globalAlpha = 0.12 + 0.05 * Math.sin(api.t * 3);
          g.rect(fx - 30, fy - 10, 110, 110, '#44cc66');
          c.globalAlpha = 1;

          // pendulum mechanism above
          const mechY = 80;
          g.rect(W / 2 - 1, mechY, 2, 60, '#3a2a4a');
          const angle = (this.needle - 0.5) * Math.PI * 0.6;
          const pLen = 56;
          const px = W / 2 + Math.sin(angle) * pLen;
          const py = mechY + Math.cos(angle) * pLen;
          g.line(W / 2, mechY, px, py, '#6a5a7a', 1);
          g.circle(px, py, 6, this.flash > 0 ? '#44cc66' : '#cc8833');

          // gauge bar
          const gx = 24, gw = W - 48, gy = H - 60;
          g.rect(gx, gy, gw, 12, '#1a1030');
          g.rect(gx + gw * (0.5 - this.zone), gy, gw * this.zone * 2, 12, 'rgba(68,204,102,.3)');
          g.rect(gx + gw * 0.5 - 1, gy - 4, 2, 20, '#44cc66');
          g.rect(gx + gw * this.needle - 3, gy - 5, 6, 22, '#cc8833');

          api.topBar('THE FORMULA');
          api.txt('BREW ' + this.brews + '/' + this.need, 6, 20, 9, '#44cc66');
          api.txt('SLIP ' + this.misses + '/' + this.maxMiss, W - 80, 20, 9,
            this.misses > 2 ? '#cc1144' : '#7a6a9a');
          api.vignette();
        },
      },

      /* ===================== 2. HYDE'S NIGHT ======================= */
      {
        id: 'hydenight', name: "HYDE'S NIGHT", sub: 'SOHO, LONDON, 1885',
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite(['.bb.', 'bbbb', 'b..b', '.bb.'], x - 5, y - 6, { b: '#2a1040' }, 2);
          g.rect(x - 1, y + 2, 2, 6, '#4a3020');
        },
        intro: [
          'HYDE PROWLS THE SOHO STREETS',
          'faceless, fearless, formless.',
          'Police lanterns sweep the fog.',
          'Do not be seen.'
        ],
        quote: 'Mr. Hyde was pale and dwarfish; he gave an impression of deformity without any nameable malformation.',
        help: 'DRAG or arrow keys to move · avoid the lanterns',
        winText: 'The fog swallows Hyde whole. Not a constable saw his face.',
        loseText: 'A lantern catches the hunched shape. Whistles fill the night.',
        init(api) {
          this.x = api.W / 2;
          this.y = api.H - 60;
          this.timer = 22;
          this.lives = 3;
          this.hurtCool = 0;
          this.lanterns = [];
          this.spawn = 0.8;
          this.canes = 0;
          this.collectibles = [];
          this.cspawn = 1.2;
          this.fog = [];
          for (let i = 0; i < 6; i++) {
            this.fog.push({ x: Math.random() * api.W, y: Math.random() * api.H, spd: 6 + Math.random() * 8 });
          }
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.hurtCool -= dt;

          // move Hyde
          const p = api.pointer;
          if (p.down) this.x = p.x;
          if (api.keyDown('left')) this.x -= 3.2 * f;
          if (api.keyDown('right')) this.x += 3.2 * f;
          this.x = clamp(this.x, 20, api.W - 20);

          // spawn police lanterns
          this.spawn -= dt;
          if (this.spawn <= 0) {
            this.spawn = Math.max(0.3, 0.9 - (22 - this.timer) * 0.025);
            this.lanterns.push({
              x: 20 + Math.random() * (api.W - 40),
              y: -14,
              vy: 1.8 + Math.random() * 1.4 + (22 - this.timer) * 0.06
            });
          }
          for (const l of this.lanterns) l.y += l.vy * f;
          this.lanterns = this.lanterns.filter(function(l) { return l.y < api.H + 20; });

          // collision
          if (this.hurtCool <= 0) {
            for (const l of this.lanterns) {
              if (Math.abs(l.x - this.x) < 18 && Math.abs(l.y - this.y) < 18) {
                this.lives--;
                this.hurtCool = 1.2;
                api.shake(6, 0.3);
                api.flash('#cc8833', 0.2);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }

          // walking cane collectibles
          this.cspawn -= dt;
          if (this.cspawn <= 0) {
            this.cspawn = 1.8 + Math.random() * 1.2;
            this.collectibles.push({ x: 20 + Math.random() * (api.W - 40), y: -10, vy: 1.2 + Math.random() * 0.8 });
          }
          for (const cc of this.collectibles) cc.y += cc.vy * f;
          for (const cc of this.collectibles) {
            if (!cc.got && Math.abs(cc.x - this.x) < 16 && Math.abs(cc.y - this.y) < 16) {
              cc.got = true;
              this.canes++;
              api.addScore(15);
              api.audio.sfx('coin');
              api.burst(cc.x, cc.y, '#cc8833', 6);
            }
          }
          this.collectibles = this.collectibles.filter(function(cc) { return cc.y < api.H + 20 && !cc.got; });

          // fog drift
          for (const f2 of this.fog) { f2.x += f2.spd * dt; if (f2.x > api.W + 80) f2.x = -80; }

          api.addScore(Math.round(dt * 5));
          if (this.timer <= 0) { api.addScore(60); api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a0818');

          // cobblestone street
          for (let ty = 0; ty < H; ty += 14)
            for (let tx = 0; tx < W; tx += 18)
              g.rect(tx + (Math.floor(ty / 14) % 2 ? 9 : 0), ty, 16, 12, '#12101c');

          // gaslit buildings on sides
          for (let i = 0; i < 3; i++) {
            g.rect(0, 50 + i * 100, 30, 90, '#150d20');
            g.rect(W - 30, 70 + i * 90, 30, 80, '#130c1e');
            // windows
            c.globalAlpha = 0.3 + 0.2 * Math.sin(api.t * 1.5 + i);
            g.rect(6, 65 + i * 100, 14, 10, '#cc8833');
            g.rect(W - 24, 85 + i * 90, 14, 10, '#cc8833');
            c.globalAlpha = 1;
          }

          // fog layers
          c.globalAlpha = 0.06;
          for (const f2 of this.fog) g.rect(f2.x - 40, f2.y - 20, 100, 30, '#a0b0c0');
          c.globalAlpha = 1;

          // lanterns (police)
          for (const l of this.lanterns) {
            c.globalAlpha = 0.25;
            g.circle(l.x, l.y, 20, '#cc8833');
            c.globalAlpha = 1;
            g.rect(l.x - 7, l.y - 10, 14, 20, '#2a1e10');
            g.rectO(l.x - 7, l.y - 10, 14, 20, '#cc8833', 1);
            g.rect(l.x - 2, l.y - 14, 4, 6, '#3a2a1a');
            g.circle(l.x, l.y, 4, '#ffdd88');
          }

          // collectible canes
          for (const cc of this.collectibles) {
            g.rect(cc.x - 1, cc.y - 8, 2, 14, '#6a4a20');
            g.circle(cc.x, cc.y - 10, 3, '#9a7a3a');
          }

          // Hyde figure (hurtCool flickers)
          if (this.hurtCool <= 0 || Math.floor(this.hurtCool * 10) % 2 === 0) {
            g.sprite(
              ['.bb.', 'b..b', '.bb.', '..b.', '.bb.', 'b..b'],
              this.x - 8, this.y - 22,
              { b: '#1a0d2a' }, 4
            );
            g.rect(this.x - 4, this.y - 22, 8, 3, '#cc8833'); // hat brim
          }

          api.topBar("HYDE'S NIGHT");
          api.txt('CANES ' + this.canes, 6, 20, 9, '#cc8833');
          for (let i = 0; i < 3; i++)
            g.rect(W - 48 + i * 14, 20, 10, 8, i < this.lives ? '#9b5cff' : '#2a1a3a');
          g.rect(6, H - 12, W - 12, 5, '#1a1030');
          g.rect(6, H - 12, (W - 12) * clamp(1 - this.timer / 22, 0, 1), 5, '#9b5cff');
          api.vignette();
        },
      },

      /* ===================== 3. THE CAREW NIGHT ==================== */
      {
        id: 'carew', name: 'THE CAREW NIGHT', sub: 'PARLIAMENT STREET',
        icon(api, x, y) {
          const g = api.gfx;
          // eye in window
          g.rect(x - 7, y - 5, 14, 10, '#1a1020');
          g.rectO(x - 7, y - 5, 14, 10, '#5a3a6a', 1);
          g.circle(x, y, 3, '#cc1144');
        },
        intro: [
          'HYDE BEATS CAREW TO DEATH.',
          'A MAID WATCHES FROM A WINDOW.',
          'Silence every witness',
          'before they raise the alarm.'
        ],
        quote: 'She was horrified to see the old gentleman… and then Mr. Hyde broke out of all bounds.',
        help: 'TAP lit windows before witnesses shout',
        winText: 'Every curtain falls before a word escapes. The street is quiet.',
        loseText: 'A scream tears the fog. The whole street is awake.',
        init(api) {
          this.silenced = 0;
          this.need = 14;
          this.timer = 24;
          this.cries = 0;
          this.maxCries = 3;
          this.windows = [];
          this.wSpawn = 0.9;
          this.active = [];
          // grid of windows on two buildings
          this.grid = [];
          const cols = 3, rows = 4;
          for (let r = 0; r < rows; r++) {
            for (let col = 0; col < cols; col++) {
              this.grid.push({ x: 18 + col * 46, y: 80 + r * 72, side: 'L' });
              this.grid.push({ x: W - 58 + col * 46, y: 80 + r * 72, side: 'R' });
            }
          }
          // use only left building windows (right side overflow)
          this.grid = [];
          for (let r = 0; r < 4; r++) for (let col = 0; col < 2; col++)
            this.grid.push({ x: 16 + col * 52, y: 78 + r * 72 });
          for (let r = 0; r < 4; r++) for (let col = 0; col < 2; col++)
            this.grid.push({ x: W - 68 + col * 52, y: 78 + r * 72 });
        },
        update(api, dt) {
          const W = api.W;
          this.timer -= dt;
          this.wSpawn -= dt;
          if (this.wSpawn <= 0 && this.active.length < 3) {
            this.wSpawn = Math.max(0.35, 0.9 - (24 - this.timer) * 0.024);
            const free = this.grid.filter(function(g) {
              return !this.active.find(function(a) { return a.gx === g.x && a.gy === g.y; });
            }, this);
            if (free.length > 0) {
              const pick = free[Math.floor(Math.random() * free.length)];
              this.active.push({
                gx: pick.x, gy: pick.y,
                t: Math.max(0.7, 1.6 - (24 - this.timer) * 0.03),
                phase: 'appear'
              });
              api.audio.sfx('blip');
            }
          }

          for (const a of this.active) a.t -= dt;

          if (api.pointer.justDown) {
            let hit = false;
            for (const a of this.active) {
              if (Math.abs(api.pointer.x - (a.gx + 20)) < 26 && Math.abs(api.pointer.y - (a.gy + 16)) < 22) {
                a.done = true; hit = true;
                this.silenced++;
                api.addScore(20);
                api.audio.sfx('coin');
                api.burst(a.gx + 20, a.gy + 16, '#44cc66', 8);
                break;
              }
            }
            if (!hit) api.audio.sfx('blip');
          }

          for (const a of this.active) {
            if (a.t <= 0 && !a.done) {
              a.done = true;
              this.cries++;
              api.shake(5, 0.25);
              api.flash('#cc1144', 0.2);
              api.audio.sfx('hurt');
            }
          }
          this.active = this.active.filter(function(a) { return !a.done; });

          if (this.cries >= this.maxCries) { api.lose(); return; }
          if (this.silenced >= this.need) { api.addScore(60); api.win(); return; }
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#080614');

          // two Victorian buildings
          g.rect(0, 60, 130, H - 60, '#100c1a');
          g.rect(W - 130, 60, 130, H - 60, '#0e0a18');
          // dark alley in middle
          g.rect(0, 0, W, 60, '#0c0a14');
          // rooftop crenellations
          for (let tx = 0; tx < 130; tx += 16) g.rect(tx, 56, 12, 10, '#14101e');
          for (let tx = W - 130; tx < W; tx += 16) g.rect(tx, 56, 12, 10, '#12101c');

          // all windows
          for (const win of this.grid) {
            const active = this.active.find(function(a) { return a.gx === win.x && a.gy === win.y; });
            const wc = active ? '#3a1520' : '#160d24';
            const bc = active ? '#cc1144' : '#2a1a3a';
            g.rect(win.x, win.y, 40, 32, wc);
            g.rectO(win.x, win.y, 40, 32, bc, 1);
            // window pane cross
            g.rect(win.x + 19, win.y, 2, 32, bc);
            g.rect(win.x, win.y + 15, 40, 2, bc);
            if (active) {
              // pulsing alarm glow
              const pr = 1 - clamp(active.t / 1.6, 0, 1);
              c.globalAlpha = 0.15 + pr * 0.25;
              g.rect(win.x - 4, win.y - 4, 48, 40, '#cc1144');
              c.globalAlpha = 1;
              // silhouetted figure
              g.sprite(['.b.', 'bbb', '.b.'], win.x + 15, win.y + 6, { b: '#cc1144' }, 3);
              // countdown ring around window
              c.strokeStyle = '#cc1144';
              c.lineWidth = 1.5;
              c.globalAlpha = 0.6;
              const frac = clamp(active.t / 1.6, 0, 1);
              c.beginPath();
              c.arc(win.x + 20, win.y + 16, 22, -Math.PI / 2, -Math.PI / 2 + (1 - frac) * Math.PI * 2);
              c.stroke();
              c.globalAlpha = 1;
            }
          }

          // foggy ground
          c.globalAlpha = 0.08;
          for (let i = 0; i < 3; i++)
            g.rect(0, H - 80 + i * 20, W, 16, '#a0b0c0');
          c.globalAlpha = 1;
          g.rect(0, H - 44, W, 44, '#0a0812');

          api.topBar('THE CAREW NIGHT');
          api.txt('SILENCED ' + this.silenced + '/' + this.need, 6, 20, 9, '#44cc66');
          for (let i = 0; i < this.maxCries; i++)
            g.rect(W - 50 + i * 14, 20, 10, 8, i < this.maxCries - this.cries ? '#9b5cff' : '#3a1a2a');
          g.rect(6, H - 12, W - 12, 5, '#1a1030');
          g.rect(6, H - 12, (W - 12) * clamp(1 - this.timer / 24, 0, 1), 5, '#9b5cff');
          api.vignette();
        },
      },

      /* ===================== 4. THE LAST DOSE ====================== */
      {
        id: 'lastdose', name: 'THE LAST DOSE', sub: "JEKYLL'S DISPENSARY",
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 3, y - 8, 6, 12, '#1a1428');
          g.rectO(x - 3, y - 8, 6, 12, '#9b5cff', 1);
          g.rect(x - 2, y - 4, 4, 6, '#44cc66');
          g.rect(x - 2, y - 12, 4, 5, '#2a1e38');
        },
        intro: [
          'THE SALT IS EXHAUSTED.',
          'THE SUPPLY RUNS SHORT.',
          'Catch every vial that falls',
          'or the beast wakes forever.'
        ],
        quote: 'I was slowly losing hold of my original and better self.',
        help: 'TAP to move the tray and catch falling vials',
        winText: 'Twelve vials safe. One more night as himself.',
        loseText: 'The tray tips. Green glass shatters. Hyde is coming.',
        init(api) {
          this.trayX = api.W / 2;
          this.caught = 0;
          this.need = 12;
          this.dropped = 0;
          this.maxDrop = 4;
          this.vials = [];
          this.spawn = 0.9;
          this.timer = 26;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;

          // move tray
          const p = api.pointer;
          if (p.down) this.trayX = p.x;
          if (api.keyDown('left')) this.trayX -= 3.5 * f;
          if (api.keyDown('right')) this.trayX += 3.5 * f;
          this.trayX = clamp(this.trayX, 30, api.W - 30);

          // spawn vials
          this.spawn -= dt;
          if (this.spawn <= 0) {
            this.spawn = Math.max(0.35, 0.9 - (26 - this.timer) * 0.022);
            this.vials.push({
              x: 20 + Math.random() * (api.W - 40),
              y: -10,
              vy: 1.6 + Math.random() * 1.2 + (26 - this.timer) * 0.05,
              spin: (Math.random() - 0.5) * 0.04
            });
          }

          const trayY = api.H - 44;
          const trayW = 54;
          for (const v of this.vials) {
            v.y += v.vy * f;
            if (!v.done && v.y > trayY - 6 && Math.abs(v.x - this.trayX) < trayW / 2) {
              v.done = true;
              this.caught++;
              api.addScore(25);
              api.audio.sfx('coin');
              api.burst(v.x, trayY, '#44cc66', 8);
              if (this.caught >= this.need) { api.addScore(80); api.win(); return; }
            } else if (!v.done && v.y > api.H + 10) {
              v.done = true;
              this.dropped++;
              api.shake(4, 0.2);
              api.audio.sfx('hurt');
              if (this.dropped >= this.maxDrop) { api.lose(); return; }
            }
          }
          this.vials = this.vials.filter(function(v) { return !v.done; });

          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#060410');

          // dispensary shelves
          for (let row = 0; row < 3; row++) {
            g.rect(0, 60 + row * 70, W, 8, '#2a1e0e');
            // bottles on shelves
            for (let b = 0; b < 7; b++) {
              const bx = 10 + b * 36, by = 38 + row * 70;
              const bc = ['#44cc66', '#cc4466', '#cc8833', '#4466cc', '#9b5cff', '#44cc66', '#cc8833'][b];
              g.rect(bx, by, 10, 24, '#1a1428');
              g.rectO(bx, by, 10, 24, '#3a2a4a', 1);
              c.globalAlpha = 0.6;
              g.rect(bx + 1, by + 14, 8, 8, bc);
              c.globalAlpha = 0.25;
              g.rect(bx + 1, by + 14, 8, 3, '#ffffff');
              c.globalAlpha = 1;
              g.rect(bx + 2, by - 4, 6, 6, '#2a1e38');
            }
          }

          // vials falling
          for (const v of this.vials) {
            g.rect(v.x - 4, v.y - 10, 8, 14, '#1a1428');
            g.rectO(v.x - 4, v.y - 10, 8, 14, '#9b5cff', 1);
            g.rect(v.x - 3, v.y - 4, 6, 6, '#44cc66');
            g.rect(v.x - 2, v.y - 12, 4, 4, '#2a1e38');
          }

          // tray
          const trayY = H - 44;
          const trayW = 54;
          g.rect(this.trayX - trayW / 2, trayY, trayW, 8, '#2a1e10');
          g.rectO(this.trayX - trayW / 2, trayY, trayW, 8, '#cc8833', 1);
          // vials caught on tray (decorative)
          for (let i = 0; i < Math.min(this.caught, 6); i++) {
            const vx = this.trayX - trayW / 2 + 6 + i * 8;
            g.rect(vx, trayY - 8, 5, 8, '#44cc66');
          }

          api.topBar('THE LAST DOSE');
          api.txt('CAUGHT ' + this.caught + '/' + this.need, 6, 20, 9, '#44cc66');
          for (let i = 0; i < this.maxDrop; i++)
            g.rect(W - 56 + i * 12, 20, 9, 8, i < this.maxDrop - this.dropped ? '#9b5cff' : '#3a1a2a');
          g.rect(6, H - 12, W - 12, 5, '#1a1030');
          g.rect(6, H - 12, (W - 12) * clamp(1 - this.timer / 26, 0, 1), 5, '#9b5cff');
          api.vignette();
        },
      },

      /* ===================== 5. THE LOCKED DOOR ==================== */
      {
        id: 'lockeddoor', name: 'THE LOCKED DOOR', sub: "JEKYLL'S CABINET",
        icon(api, x, y) {
          const g = api.gfx;
          // door with Jekyll left / Hyde right
          g.rect(x - 8, y - 8, 8, 14, '#1a1428');
          g.rectO(x - 8, y - 8, 8, 14, '#44cc66', 1);
          g.rect(x, y - 8, 8, 14, '#1a0818');
          g.rectO(x, y - 8, 8, 14, '#9b5cff', 1);
        },
        intro: [
          'JEKYLL LOCKS THE CABINET.',
          'HYDE BEATS THE DOOR.',
          'Each dose buys seconds.',
          'Hold the transformation.'
        ],
        quote: '"This is my true hour of death… that other Hyde will be studying… and there shall be no more Henry Jekyll."',
        help: 'TAP JEKYLL or HYDE prompt at the right moment',
        winText: 'The last dawn filters under the door. Jekyll writes his confession.',
        loseText: 'Hyde tears the door from its hinges. Jekyll is gone.',
        init(api) {
          this.tasks = 0;
          this.need = 8;
          this.misses = 0;
          this.maxMiss = 4;
          this.current = null;
          this.nextT = 0.6;
          this.meter = 0;
          this.side = 'jekyll'; // alternates
          this.ringR = 50;
          this.ringDir = -1;
          this.ringSpd = 0.9;
          this.targetR = 14;
        },
        update(api, dt) {
          const f = dt * 60;
          // meter fills = transformation urge (losing condition tracked via misses)
          this.meter = Math.min(1, this.meter + dt * 0.018);

          if (!this.current) {
            this.nextT -= dt;
            if (this.nextT <= 0) {
              // alternate Jekyll/Hyde
              this.side = this.tasks % 2 === 0 ? 'jekyll' : 'hyde';
              this.ringR = 50;
              this.ringDir = -1;
              this.ringSpd = 0.9 + this.tasks * 0.1;
              this.current = { t: 3.5 - this.tasks * 0.2, side: this.side };
              api.audio.sfx('blip');
            }
          } else {
            this.ringR += this.ringDir * this.ringSpd * f;
            if (this.ringR < 8) { this.ringR = 8; this.ringDir = 1; }
            if (this.ringR > 52) { this.ringR = 52; this.ringDir = -1; }
            this.current.t -= dt;

            if (api.confirm()) {
              if (Math.abs(this.ringR - this.targetR) < 7) {
                this.tasks++;
                this.meter = Math.max(0, this.meter - 0.2);
                api.addScore(40);
                api.audio.sfx('power');
                api.shake(4, 0.2);
                const col = this.current.side === 'jekyll' ? '#44cc66' : '#9b5cff';
                api.burst(api.W / 2, api.H / 2, col, 10);
                this.current = null;
                this.nextT = 0.5 + Math.random() * 0.3;
                if (this.tasks >= this.need) { api.addScore(100); api.win(); }
              } else {
                this.misses++;
                api.shake(5, 0.25);
                api.audio.sfx('hurt');
                this.meter = Math.min(1, this.meter + 0.15);
                if (this.misses >= this.maxMiss || this.meter >= 1) { api.lose(); }
              }
            } else if (this.current.t <= 0) {
              this.misses++;
              this.meter = Math.min(1, this.meter + 0.2);
              api.audio.sfx('hurt');
              this.current = null;
              this.nextT = 0.4;
              if (this.misses >= this.maxMiss || this.meter >= 1) api.lose();
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const isHyde = this.current && this.current.side === 'hyde';
          const bgC = isHyde ? '#100818' : '#080614';
          api.clear(bgC);

          // cabinet room — split down middle
          g.rect(0, 0, W / 2, H, '#0c0a18');
          g.rect(W / 2, 0, W / 2, H, '#0f0614');
          g.rect(W / 2 - 1, 0, 2, H, '#2a1a4a');

          // labels for each side
          api.txtC('JEKYLL', W / 4, 30, 9, '#44cc66');
          api.txtC('HYDE', 3 * W / 4, 30, 9, '#9b5cff');

          // Jekyll figure (left)
          g.sprite(['.cc.', 'cffc', '.bb.', 'b..b'],
            W / 4 - 8, H / 2 - 30, { c: '#2a3a1a', f: '#c0a07a', b: '#1a3a2a' }, 4);
          // Hyde figure (right)
          g.sprite(['.dd.', 'd..d', '.dd.', 'd..d', '.dd.'],
            3 * W / 4 - 8, H / 2 - 34, { d: '#1a0d28' }, 4);

          // transformation ring in centre
          const cx = W / 2, cy = H / 2;
          if (this.current) {
            const ringCol = this.current.side === 'jekyll' ? '#44cc66' : '#9b5cff';
            const hitCol = Math.abs(this.ringR - this.targetR) < 7 ? '#ffffff' : ringCol;
            // target circle
            g.circle(cx, cy, this.targetR, '#1a1030');
            c.strokeStyle = hitCol;
            c.lineWidth = 3;
            c.beginPath(); c.arc(cx, cy, this.targetR, 0, Math.PI * 2); c.stroke();
            // moving ring
            c.strokeStyle = ringCol;
            c.lineWidth = 2;
            c.globalAlpha = 0.85;
            c.beginPath(); c.arc(cx, cy, this.ringR, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
            // side label
            const lbl = this.current.side === 'jekyll' ? 'HOLD!' : 'BREAK!';
            api.txtC(lbl, cx, cy + 64, 11, this.current.side === 'jekyll' ? '#44cc66' : '#9b5cff', true);
          } else {
            g.circle(cx, cy, this.targetR, '#1a1030');
            c.strokeStyle = '#3a2a4a';
            c.lineWidth = 2;
            c.beginPath(); c.arc(cx, cy, 30, 0, Math.PI * 2); c.stroke();
          }

          // transformation meter at bottom
          api.topBar('THE LOCKED DOOR');
          api.txt('ACTS ' + this.tasks + '/' + this.need, 6, 20, 9, '#cc8833');
          api.txt('SLIP ' + this.misses, W - 70, 20, 9, this.misses > 2 ? '#cc1144' : '#7a6a9a');

          // transformation bar
          const bx = 6, by = H - 14, bw = W - 12;
          g.rect(bx, by, bw, 6, '#1a1030');
          const barCol = this.meter > 0.7 ? '#cc1144' : this.meter > 0.4 ? '#cc8833' : '#9b5cff';
          g.rect(bx, by, bw * this.meter, 6, barCol);
          api.vignette();
        },
      },

    ],
  });
})();
