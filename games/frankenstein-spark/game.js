/* ============================================================================
 * FRANKENSTEIN — A CREATURE'S TALE IN FIVE CHAPTERS
 *   1. THE LABORATORY  — lightning-rod rhythm: channel the storm to birth life
 *   2. INTO THE WORLD  — dodge-and-collect: the Creature faces a frightened world
 *   3. THE DE LACEYS   — stealth timing: watch and learn unseen
 *   4. THE ARCTIC CHASE — navigate ice floes across the frozen waste
 *   5. INTO DARKNESS   — precision leaps: the Creature's final journey
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const U = Retro.util;

  /* -------------------------------------------------------------------------- */
  /* Emblem — the Creature's silhouette with raised arms + lightning crown       */
  /* -------------------------------------------------------------------------- */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // lightning arcs above
    for (let i = 0; i < 3; i++) {
      const lx = cx + (i - 1) * 22;
      g.line(lx, cy - 70, lx + 5, cy - 58, '#9b5cff', 1);
      g.line(lx + 5, cy - 58, lx - 3, cy - 48, '#9b5cff', 1);
      g.line(lx - 3, cy - 48, lx + 4, cy - 38, '#5dff8f', 2);
    }
    // arms raised
    g.rect(cx - 36, cy - 28, 14, 6, '#4a6a4a');
    g.rect(cx + 22, cy - 28, 14, 6, '#4a6a4a');
    // body
    g.rect(cx - 18, cy - 32, 36, 46, '#3a5a3a');
    g.rect(cx - 18, cy - 32, 36, 4, '#2a4a2a');
    // neck bolts
    g.rect(cx - 22, cy - 24, 5, 8, '#c8a050');
    g.rect(cx + 17, cy - 24, 5, 8, '#c8a050');
    // head
    g.rect(cx - 14, cy - 54, 28, 24, '#4a6a4a');
    g.rect(cx - 14, cy - 58, 28, 6, '#2a3a2a');
    // eyes (glowing green)
    g.rect(cx - 9, cy - 48, 6, 5, '#5dff8f');
    g.rect(cx + 3, cy - 48, 6, 5, '#5dff8f');
    g.rect(cx - 7, cy - 47, 4, 3, '#afffcf');
    g.rect(cx + 5, cy - 47, 4, 3, '#afffcf');
    // stitches
    g.rect(cx - 5, cy - 38, 10, 1, '#2a4a2a');
    g.rect(cx - 12, cy - 20, 24, 1, '#2a4a2a');
    // legs
    g.rect(cx - 14, cy + 14, 12, 20, '#3a5a3a');
    g.rect(cx + 2, cy + 14, 12, 20, '#3a5a3a');
  }

  /* -------------------------------------------------------------------------- */
  /* Scenery — gothic lab / dark wasteland backdrop                              */
  /* -------------------------------------------------------------------------- */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Lab workbench background
      const bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0c0718'); bg.addColorStop(1, '#060310');
      c.fillStyle = bg; c.fillRect(0, 0, W, H);

      // stone wall tiles
      for (let y = 0; y < H - 100; y += 20) {
        for (let x = 0; x < W; x += 36) {
          const ox = (Math.floor(y / 20) % 2) ? 18 : 0;
          c.fillStyle = y < 40 ? 'rgba(60,40,80,.15)' : 'rgba(50,35,70,.12)';
          c.fillRect(x + ox, y, 34, 18);
        }
      }
      // window with lightning glow
      const wx = W / 2 - 22, wy = 8;
      c.fillStyle = 'rgba(155,92,255,0.08)'; c.fillRect(wx, wy, 44, 52);
      c.strokeStyle = '#3a2a5a'; c.lineWidth = 2; c.strokeRect(wx, wy, 44, 52);
      if (Math.sin(t * 3.7) > 0.6) {
        c.fillStyle = 'rgba(155,92,255,0.25)'; c.fillRect(wx, wy, 44, 52);
      }
      // shelf
      c.fillStyle = '#2a1a08'; c.fillRect(0, H - 100, W, 12);
      c.fillStyle = '#3a2510'; c.fillRect(0, H - 102, W, 4);
      // lab bench
      c.fillStyle = '#1a1008'; c.fillRect(0, H - 50, W, 50);
      c.fillStyle = '#2a1810'; c.fillRect(0, H - 52, W, 5);
      // bubbling liquid in corner beakers
      for (let i = 0; i < 2; i++) {
        const bx = 8 + i * (W - 36), by = H - 80;
        drawSmallBeaker(c, g, bx, by, i === 0 ? '#9b5cff' : '#5dff8f', t + i * 2);
      }
      // electric arcs along ceiling
      for (let i = 0; i < 3; i++) {
        const ax = 30 + i * 90;
        c.globalAlpha = 0.3 + 0.2 * Math.sin(t * 8 + i);
        g.line(ax, 0, ax + U.rand(-6, 6), 14, '#9b5cff', 1);
        c.globalAlpha = 1;
      }
      return;
    }

    // Boot / intro / result / finale — gothic storm backdrop
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a0520'); sky.addColorStop(0.6, '#150b28'); sky.addColorStop(1, '#060210');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // stars (sparse)
    for (let i = 0; i < 30; i++) {
      const sx = (i * 79 + 13) % W, sy = (i * 113 + 7) % Math.floor(H * 0.45);
      c.globalAlpha = 0.15 + 0.25 * Math.sin(t * 1.5 + i * 0.8);
      g.rect(sx, sy, 1, 1, '#c0b0e0');
    }
    c.globalAlpha = 1;

    // storm lightning flicker
    if (Math.sin(t * 6.3) > 0.7) {
      c.fillStyle = 'rgba(155,92,255,0.06)'; c.fillRect(0, 0, W, H);
      g.line(U.rand(20, W - 20), 0, U.rand(20, W - 20), U.rand(30, 70), 'rgba(200,180,255,.4)', 1);
    }

    // distant castle silhouette
    const baseY = H - 80;
    c.fillStyle = '#080515';
    c.beginPath(); c.moveTo(0, baseY);
    for (let x = 0; x <= W; x += 22) c.lineTo(x, baseY - 4 - ((x * 5) % 12));
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();

    // towers
    const tw = [[28, 54], [88, 76], [148, 60], [208, 82]];
    for (const [tx, th] of tw) {
      c.fillStyle = '#060412'; c.fillRect(tx, baseY - th, 18, th);
      for (let b = 0; b < 18; b += 7) c.fillRect(tx + b, baseY - th - 5, 4, 5);
      g.rect(tx + 5, baseY - th + 16, 8, 11, '#c8a050');
    }

    // bats
    for (let i = 0; i < 4; i++) {
      const bx = ((t * 20 + i * 68) % (W + 30)) - 15, by = 90 + Math.sin(t * 2 + i) * 14 + i * 9;
      const flap = Math.sin(t * 10 + i) > 0;
      g.sprite(flap ? ['k.kk.k', '.kkkk.'] : ['.k..k.', 'kkkkkk'], bx, by, { k: '#100818' }, 2);
    }

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(4,2,12,.70)'; c.fillRect(0, 0, W, H);
    }
  }

  function drawSmallBeaker(c, g, x, y, col, t) {
    c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x, y, 18, 32);
    c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1; c.strokeRect(x, y, 18, 32);
    const fill = 0.55 + 0.1 * Math.sin(t * 2.3);
    c.fillStyle = col + '55'; c.fillRect(x + 1, y + 32 - 32 * fill, 16, 32 * fill);
    // bubble
    if (Math.sin(t * 4 + x) > 0.5) {
      c.globalAlpha = 0.5;
      c.fillStyle = col; c.beginPath(); c.arc(x + 9, y + 6, 3, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    }
    g.line(x + 5, y, x + 13, y, 'rgba(255,255,255,0.2)', 2);
  }

  /* -------------------------------------------------------------------------- */
  /* RetroSaga configuration                                                     */
  /* -------------------------------------------------------------------------- */
  RetroSaga.create({
    id: 'frankenstein',
    title: "FRANKENSTEIN",
    subtitle: "A CREATURE'S TALE",
    currency: 'VITALITY',
    accent: '#5dff8f',
    credit: 'AFTER MARY SHELLEY, 1818',
    bootCta: 'TAP TO ENTER THE LAB',
    bootLine: 'FIVE CHAPTERS · ONE CURSED CREATION',
    menuLabel: "VICTOR'S JOURNAL",
    menuHint: 'CHOOSE A CHAPTER',
    menuDone: 'THE CREATURE IS FREE AT LAST',
    finale: [
      "THE CREATURE VANISHES",
      "INTO THE ARCTIC DARK.",
      "",
      "VICTOR IS GONE.",
      "THE EXPERIMENT ENDS."
    ],

    screens: {
      win: '#5dff8f',
      lose: '#9b5cff',
      chapterLabel: '#6a5a8a',
      name: '#c0f0d0',
      sub: '#9b5cff',
      intro: '#c8c0e0',
      quote: '#6a5a8a',
      help: '#5dff8f',
      score: '#c0f0d0',
      cur: '#5dff8f',
      cta: '#c0f0d0',
      overlay: 'rgba(4,2,12,.84)',
    },
    labels: {
      chapter: 'CHAPTER',
      score: 'VITALITY',
      win: 'LIFE STIRS',
      lose: 'THE SPARK FADES',
      cont: 'TAP TO PRESS ON',
      finale: 'TAP FOR THE ENDING',
      toMenu: "RETURN TO JOURNAL",
      play: 'TAP TO BEGIN',
    },

    width: 270, height: 480, parent: '#game',
    palette: { gold: '#5dff8f', blood: '#9b5cff' },
    emblem,
    scenery,

    menu: {
      colors: {
        title: '#5dff8f',
        label: '#6a5a8a',
        cur: '#c0f0d0',
      },

      // five specimen jars on a lab shelf — each holds a scene from the chapter
      layout(api) {
        // top row: 3 jars; bottom row: 2 jars centered
        const jW = 72, jH = 88;
        const row1y = 108, row2y = 218;
        return [
          { x: 8,       y: row1y, w: jW, h: jH },   // ch1
          { x: 98,      y: row1y, w: jW, h: jH },   // ch2
          { x: 188,     y: row1y, w: jW, h: jH },   // ch3
          { x: 53,      y: row2y, w: jW, h: jH },   // ch4
          { x: 143,     y: row2y, w: jW, h: jH },   // ch5
        ];
      },

      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2, cy = y + h / 2;

        // jar shape (rounded bottom rectangle)
        c.fillStyle = sel ? 'rgba(93,255,143,0.10)' : 'rgba(93,255,143,0.04)';
        c.beginPath();
        c.moveTo(x + 8, y); c.lineTo(x + w - 8, y);
        c.lineTo(x + w - 4, y + 6); c.lineTo(x + w - 4, y + h - 8);
        c.quadraticCurveTo(x + w - 4, y + h, x + w - 12, y + h);
        c.lineTo(x + 12, y + h);
        c.quadraticCurveTo(x + 4, y + h, x + 4, y + h - 8);
        c.lineTo(x + 4, y + 6); c.closePath(); c.fill();

        c.strokeStyle = sel ? '#5dff8f' : (done ? '#3a7a4a' : '#2a3a3a');
        c.lineWidth = sel ? 2 : 1; c.stroke();

        // jar neck
        c.fillStyle = sel ? 'rgba(93,255,143,0.15)' : 'rgba(93,255,143,0.05)';
        c.fillRect(x + 14, y - 8, w - 28, 10);
        c.strokeStyle = sel ? '#5dff8f' : '#2a3a3a'; c.lineWidth = 1;
        c.strokeRect(x + 14, y - 8, w - 28, 10);

        // liquid fill (done = green glow, else purple)
        const fillCol = done ? 'rgba(93,255,143,0.22)' : 'rgba(155,92,255,0.14)';
        const fillH = done ? h * 0.7 : h * 0.3;
        c.fillStyle = fillCol; c.fillRect(x + 5, y + h - fillH - 8, w - 10, fillH);

        // tiny scene inside the jar (per chapter)
        c.save(); c.beginPath();
        c.rect(x + 5, y + 2, w - 10, h - 10); c.clip();
        drawJarScene(api, i, cx, cy, info.best > 0);
        c.restore();

        // label strip
        c.fillStyle = sel ? 'rgba(93,255,143,0.25)' : 'rgba(10,6,20,0.85)';
        c.fillRect(x + 4, y + h - 22, w - 8, 18);
        api.txtCFit((i + 1) + '. ' + ch.name, cx, y + h - 17, 6, done ? '#5dff8f' : '#a090c0', false, w - 10);

        if (done) {
          api.txtC('✦', cx, y + 6, 8, '#5dff8f');
        }
      },
    },

    chapters: [

      /* ================================================================ */
      /* CHAPTER 1: THE LABORATORY — rhythm / timing                       */
      /* ================================================================ */
      {
        id: 'lab',
        name: 'THE LABORATORY',
        sub: 'THE BIRTH OF THE CREATURE',
        icon(api, x, y) {
          const g = api.gfx;
          // lightning bolt
          g.line(x, y - 8, x + 4, y - 1, '#9b5cff', 2);
          g.line(x + 4, y - 1, x - 2, y + 2, '#9b5cff', 1);
          g.line(x - 2, y + 2, x + 3, y + 9, '#5dff8f', 2);
        },
        intro: [
          'VICTOR FRANKENSTEIN',
          'STANDS BEFORE THE SLAB.',
          'A STORM RAGES ABOVE.',
          'The moment of creation is here.',
        ],
        quote: "It was on a dreary night of November that I beheld the accomplishment of my toils.",
        help: 'TAP each bolt the instant it hits the glowing rod · 4 lanes',
        winText: "A convulsive motion agitates its limbs. Its dull yellow eye opens.",
        loseText: "The storm passes. The Creature lies still, unawakened.",

        init(api) {
          this.notes = []; this.charge = 20; this.combo = 0;
          this.bpm = 88; this.nextBeat = 1.4; this.lastLane = -1;
          this.judgeT = 0; this.judgeText = ''; this.judgeColor = '#fff';
          this.creature = { awake: 0, twitch: 0 };
          this.pops = [];
          this.LANES = [
            { key: 'left', col: '#9b5cff' },
            { key: 'up', col: '#5dff8f' },
            { key: 'down', col: '#c8a050' },
            { key: 'right', col: '#ff3060' },
          ];
          this.LANE_W = 48;
          this.FIELD_X = (api.W - this.LANE_W * 4) / 2;
          this.HIT_Y = api.H - 72;
          this.APPROACH = 1.3;
          this.HIT_WIN = 0.13;
          this.PERF_WIN = 0.052;
        },

        update(api, dt) {
          const f = dt * 60;
          const intensity = U.clamp(this.charge / 100, 0, 1);
          this.bpm = 88 + intensity * 72;
          const beatLen = 60 / this.bpm;
          this.nextBeat -= dt;
          if (this.nextBeat <= 0) {
            const count = Math.random() < 0.15 + intensity * 0.22 ? 2 : 1;
            const used = [];
            for (let n = 0; n < count; n++) {
              let li; do { li = U.randInt(0, 3); } while (used.includes(li));
              used.push(li);
              this.notes.push({ lane: li, hitTime: api.t + this.APPROACH, y: 28, judged: false });
            }
            this.lastLane = used[used.length - 1];
            this.nextBeat = beatLen * (Math.random() < 0.22 ? 0.5 : 1);
          }

          // advance notes
          for (const n of this.notes) {
            const tLeft = n.hitTime - api.t;
            n.y = this.HIT_Y - (tLeft / this.APPROACH) * (this.HIT_Y - 28);
            if (!n.judged && api.t - n.hitTime > this.HIT_WIN) {
              n.judged = true; this.combo = 0;
              this.charge = U.clamp(this.charge - 5, 0, 100);
              this.judge('MISS', '#ff3060'); api.audio.sfx('hurt');
            }
          }

          // input
          for (let i = 0; i < 4; i++) {
            if (api.keyPressed(this.LANES[i].key)) {
              const near = this.nearestNote(i, api.t);
              if (near) {
                const err = Math.abs(api.t - near.hitTime);
                near.judged = true;
                if (err <= this.PERF_WIN) {
                  this.combo++; this.charge = U.clamp(this.charge + 4.2, 0, 100);
                  api.score += Math.round(55 * (1 + Math.min(this.combo, 20) * 0.05));
                  this.judge('PERFECT', this.LANES[i].col);
                  api.audio.tone(880, 0.06, 'square', 0.25);
                  api.audio.tone(1320, 0.05, 'square', 0.18, 0.04);
                  api.burst(this.laneX(i), this.HIT_Y, this.LANES[i].col, 8);
                  api.shake(3, 0.14);
                } else {
                  this.combo++; this.charge = U.clamp(this.charge + 2.4, 0, 100);
                  api.score += Math.round(28 * (1 + Math.min(this.combo, 20) * 0.04));
                  this.judge('GOOD', '#cfe0ff');
                  api.audio.tone(660, 0.06, 'square', 0.2);
                  for (let p = 0; p < 4; p++) this.pops.push({ x: this.laneX(i), y: this.HIT_Y, vx: U.rand(-1.5, 1.5), vy: U.rand(-2.5, -0.5), life: 0.4, c: this.LANES[i].col });
                }
              } else {
                this.charge = U.clamp(this.charge - 1.5, 0, 100);
                api.audio.sfx('blip');
              }
            }
          }

          // passive drain
          this.charge = U.clamp(this.charge - dt * 1.6, 0, 100);

          this.notes = this.notes.filter((n) => !(n.judged && n.y > this.HIT_Y + 16));
          this.creature.awake = this.charge / 100;
          if (this.charge > 60 && this.combo % 6 === 0 && this.combo > 0) this.creature.twitch = 0.25;
          if (this.creature.twitch > 0) this.creature.twitch -= dt;

          if (this.judgeT > 0) this.judgeT -= dt;
          this.pops.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life -= dt; });
          this.pops = this.pops.filter((p) => p.life > 0);

          if (this.charge >= 100) { api.score += 100; api.win(); }
          if (this.charge <= 0 && api.t > 2) api.lose();
        },

        nearestNote(lane, t) {
          let best = null, bestErr = 0.14;
          for (const n of this.notes) {
            if (n.lane !== lane || n.judged) continue;
            const err = Math.abs(t - n.hitTime);
            if (err < bestErr) { bestErr = err; best = n; }
          }
          return best;
        },

        laneX(i) { return this.FIELD_X + i * this.LANE_W + this.LANE_W / 2; },
        judge(t, c) { this.judgeText = t; this.judgeColor = c; this.judgeT = 0.5; },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // lab background
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#100820'); bg.addColorStop(1, '#060310');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // stone walls
          for (let y = 16; y < H - 90; y += 18) {
            for (let x = 0; x < W; x += 32) {
              const ox = (Math.floor(y / 18) % 2) ? 16 : 0;
              c.fillStyle = 'rgba(60,40,80,.13)';
              c.fillRect(x + ox, y, 30, 16);
            }
          }

          // storm flashes at ceiling
          if (this.charge > 60 && Math.sin(api.t * 7) > 0.55) {
            c.fillStyle = 'rgba(155,92,255,' + (this.charge / 100 * 0.18) + ')';
            c.fillRect(0, 0, W, 36);
          }

          // lanes
          for (let i = 0; i < 4; i++) {
            const lx = this.FIELD_X + i * this.LANE_W;
            c.fillStyle = i % 2 ? 'rgba(93,255,143,.04)' : 'rgba(155,92,255,.07)';
            c.fillRect(lx, 28, this.LANE_W, this.HIT_Y - 28 + 20);
            // conducting rod
            g.rect(this.laneX(i) - 1, 28, 2, this.HIT_Y - 28, 'rgba(155,92,255,.20)');
            // hit target
            const near = this.nearestNote(i, api.t);
            const lit = near && Math.abs(api.t - near.hitTime) < 0.11;
            g.circle(this.laneX(i), this.HIT_Y, 13, lit ? this.LANES[i].col : 'rgba(255,255,255,.08)');
            g.circle(this.laneX(i), this.HIT_Y, 9, '#06020e');
            api.txtC(['◀','▲','▼','▶'][i], this.laneX(i), this.HIT_Y - 5, 8, lit ? '#fff' : 'rgba(255,255,255,.35)');
          }

          // notes (lightning orbs)
          for (const n of this.notes) {
            if (n.judged) continue;
            const lx = this.laneX(n.lane), col = this.LANES[n.lane].col;
            const r = 7 + Math.sin(api.t * 6 + n.lane) * 1;
            c.globalAlpha = 0.28; g.circle(lx, n.y - 9, r * 0.6, col); c.globalAlpha = 1;
            g.circle(lx, n.y, r, col);
            g.circle(lx, n.y, r - 3, '#fff');
            g.rect(lx - 1, n.y - r - 4, 2, 4, col);
          }

          // Creature on slab
          this.drawCreature(api);

          // particles
          for (const p of this.pops) { c.globalAlpha = p.life * 2; g.rect(p.x, p.y, 2, 2, p.c); } c.globalAlpha = 1;

          // judge text
          if (this.judgeT > 0) api.txtC(this.judgeText, W / 2, this.HIT_Y - 34, 11, this.judgeColor);

          // LIFE meter
          const mx = 6, my = 32, mh = H - 130;
          g.rect(mx, my, 10, mh, '#1a0d28');
          const fill = Math.round(mh * (this.charge / 100));
          const mc = this.charge > 70 ? '#5dff8f' : this.charge > 40 ? '#9b5cff' : '#ff3060';
          g.rect(mx, my + mh - fill, 10, fill, mc);
          g.rect(mx, my + mh - fill, 10, 2, '#fff');
          api.txtC('LIFE', mx + 5, my - 11, 6, '#6a5a8a');
          api.txt('COMBO ' + this.combo, 22, 20, 8, '#c0f0d0');
          api.txt('BPM ' + Math.round(this.bpm), W - 74, 20, 7, '#5dff8f');
          api.topBar('THE LABORATORY');
          api.vignette(); api.scanlines();
        },

        drawCreature(api) {
          const g = api.gfx, W = api.W, H = api.H;
          const cx = W / 2, baseY = H - 16;
          const a = this.creature.awake;
          const rise = a * 6 + (this.creature.twitch > 0 ? 2 : 0);
          // slab
          g.rect(cx - 50, baseY - 4, 100, 10, '#1e1628');
          g.rect(cx - 50, baseY - 4, 100, 3, '#2e2040');
          // straps
          g.rect(cx - 46, baseY - 10, 8, 4, '#3a2010');
          g.rect(cx + 38, baseY - 10, 8, 4, '#3a2010');
          // body
          const skin = a > 0.5 ? '#4a6a4a' : '#3a5040';
          g.rect(cx - 28, baseY - 18 - rise, 56, 14, skin);
          // head
          g.rect(cx - 12, baseY - 32 - rise, 24, 16, skin);
          g.rect(cx - 12, baseY - 34 - rise, 24, 4, '#202820');
          // neck bolts
          g.rect(cx - 16, baseY - 24 - rise, 4, 6, '#c8a050');
          g.rect(cx + 12, baseY - 24 - rise, 4, 6, '#c8a050');
          // eyes
          if (a > 0.55) {
            const ew = 3 + a * 3;
            g.rect(cx - 8, baseY - 27 - rise, ew, ew, '#5dff8f');
            g.rect(cx + 5 - (ew > 5 ? 1 : 0), baseY - 27 - rise, ew, ew, '#5dff8f');
          } else {
            g.rect(cx - 7, baseY - 26 - rise, 5, 1, '#1a2a1a');
            g.rect(cx + 3, baseY - 26 - rise, 5, 1, '#1a2a1a');
          }
          // lightning arcs when nearly full
          if (a > 0.75 && Math.sin(api.t * 12) > 0.3) {
            g.line(cx - 16, baseY - 24 - rise, cx - 30, baseY - 36 - rise, '#9b5cff', 1);
            g.line(cx + 16, baseY - 24 - rise, cx + 30, baseY - 36 - rise, '#5dff8f', 1);
          }
        },
      },

      /* ================================================================ */
      /* CHAPTER 2: INTO THE WORLD — dodge and collect                     */
      /* ================================================================ */
      {
        id: 'world',
        name: 'INTO THE WORLD',
        sub: 'FLEE THE FRIGHTENED VILLAGE',
        icon(api, x, y) {
          const g = api.gfx;
          // torch
          g.rect(x - 1, y - 6, 3, 10, '#8a5a2a');
          g.circle(x + 1, y - 7, 4, '#ff8a3d');
          g.circle(x + 1, y - 7, 2, '#ffe14d');
        },
        intro: [
          'THE CREATURE WALKS',
          'INTO A VILLAGE AT DAWN.',
          'TORCHES AND STONES FLY.',
          'Flee before the mob.',
        ],
        quote: "I, the miserable and the abandoned, am an abortion, to be spurned at, and kicked, and trampled on.",
        help: 'STEER left/right to avoid torches · collect provisions to survive',
        winText: "Under cover of night, the Creature escapes into the wilderness.",
        loseText: "The mob's torches find him. He retreats, broken.",

        init(api) {
          this.x = api.W / 2;
          this.y = api.H - 80;
          this.vy = 0;
          this.hp = 3;
          this.timer = 28;
          this.score0 = 0;
          this.items = [];
          this.spawnT = 0;
          this.hitFlash = 0;
          this.pops = [];
          this.msgT = 0; this.msg = '';
        },

        update(api, dt) {
          const f = dt * 60;
          const W = api.W;
          this.timer -= dt;
          if (this.timer <= 0) { api.score += 60; api.win(); return; }

          // steer
          if (api.keyDown('left') || (api.pointer.down && api.pointer.x < W / 2)) this.x -= 3.2 * f;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W / 2)) this.x += 3.2 * f;
          this.x = U.clamp(this.x, 18, W - 18);

          // spawn items (torches fall, some provisions)
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = U.rand(0.28, 0.58);
            const isProv = Math.random() < 0.22;
            this.items.push({
              x: U.rand(14, W - 14),
              y: -12,
              vy: isProv ? U.rand(1.4, 2.0) : U.rand(2.2, 3.6 + (28 - this.timer) / 14),
              kind: isProv ? 'prov' : 'torch',
              angle: Math.random() * Math.PI * 2,
              spin: U.rand(-0.12, 0.12),
            });
          }

          // move items
          for (const it of this.items) {
            it.y += it.vy * f;
            it.angle += it.spin * f;
          }

          // collisions (Creature hitbox: 18×28)
          if (this.hitFlash <= 0) {
            for (const it of this.items) {
              if (it.gone) continue;
              const dx = Math.abs(this.x - it.x), dy = Math.abs(this.y + 4 - it.y);
              if (dx < 14 && dy < 18) {
                it.gone = true;
                if (it.kind === 'torch') {
                  this.hp--; api.shake(6, 0.3); api.flash('#ff3a00', 0.2); api.audio.sfx('hurt');
                  this.hitFlash = 0.8;
                  api.burst(it.x, it.y, '#ff8a3d', 10);
                  if (this.hp <= 0) { api.lose(); return; }
                } else {
                  api.score += 15; api.audio.sfx('coin');
                  api.burst(it.x, it.y, '#5dff8f', 6);
                  this.msg = '+PROVISIONS'; this.msgT = 0.7;
                }
              }
            }
          }
          this.items = this.items.filter((it) => !it.gone && it.y < api.H + 20);
          if (this.hitFlash > 0) this.hitFlash -= dt;
          if (this.msgT > 0) this.msgT -= dt;
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // night forest backdrop
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#08060e'); bg.addColorStop(1, '#10080c');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // distant fire glow (the mob approaching)
          const mg = c.createRadialGradient(W / 2, H, 8, W / 2, H, 160);
          mg.addColorStop(0, 'rgba(255,100,20,0.22)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = mg; c.fillRect(0, 0, W, H);

          // trees (silhouettes)
          for (let i = 0; i < 7; i++) {
            const tx = 14 + i * 38, th = 70 + (i * 23) % 50;
            c.fillStyle = '#0a0810';
            c.beginPath(); c.moveTo(tx, H - 28); c.lineTo(tx - 14, H - 28 - th * 0.5);
            c.lineTo(tx - 8, H - 28 - th * 0.5); c.lineTo(tx, H - 28 - th);
            c.lineTo(tx + 8, H - 28 - th * 0.5); c.lineTo(tx + 14, H - 28 - th * 0.5);
            c.closePath(); c.fill();
          }

          // ground
          g.rect(0, H - 28, W, 28, '#1a1010');
          g.rect(0, H - 30, W, 4, '#2a1818');

          // items
          for (const it of this.items) {
            if (it.gone) continue;
            c.save(); c.translate(it.x, it.y); c.rotate(it.angle);
            if (it.kind === 'torch') {
              g.rect(-1, -8, 3, 14, '#6a3a14');
              g.circle(0, -9, 5, '#ff6020');
              g.circle(0, -9, 3, '#ffb030');
            } else {
              // bread / provision
              g.sprite(['.bb.', 'bbbb', '.bb.'], -6, -6, { b: '#c8a050' }, 4);
            }
            c.restore();
          }

          // Creature (the player)
          const bob = Math.sin(api.t * 8) * 1;
          if (this.hitFlash > 0 && Math.floor(api.t * 10) % 2 === 0) {
            c.globalAlpha = 0.4;
          }
          g.sprite([
            '..ghh..',
            '.ghhhg.',
            '.ghhhg.',
            '..ghh..',
            '.gbbhg.',
            'ggbbbgg',
            'ggbbbgg',
            '..g.g..',
            '..g.g..',
          ], this.x - 14, this.y - 28 + bob,
          { g: '#3a5a3a', h: '#4a6a4a', b: '#2a3a28' }, 4);
          c.globalAlpha = 1;

          // HP
          for (let i = 0; i < 3; i++) {
            g.rect(W - 26 - i * 14, 20, 10, 10, i < this.hp ? '#5dff8f' : '#1a1a2a');
          }
          // timer bar
          g.rect(6, H - 12, W - 12, 5, '#1a1028');
          g.rect(6, H - 12, Math.round((W - 12) * (this.timer / 28)), 5, '#5dff8f');
          if (this.msgT > 0) api.txtCFit(this.msg, W / 2, 50, 9, '#5dff8f');
          api.topBar('INTO THE WORLD');
          api.vignette();
        },
      },

      /* ================================================================ */
      /* CHAPTER 3: THE DE LACEYS — stealth / observation                  */
      /* ================================================================ */
      {
        id: 'delaceys',
        name: 'THE DE LACEYS',
        sub: 'WATCH AND LEARN UNSEEN',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 4, 16, 10, '#3a2810');
          g.rect(x - 6, y - 8, 4, 8, '#5a3a18');
          g.rect(x + 2, y - 8, 4, 8, '#5a3a18');
          g.rect(x - 10, y - 2, 2, 6, '#3a2810');
          g.rect(x + 8, y - 2, 2, 6, '#3a2810');
          g.circle(x, y + 8, 3, '#ff8a3d');
        },
        intro: [
          'THE CREATURE SHELTERS',
          'BESIDE A COTTAGE.',
          'A KIND FAMILY LIVES WITHIN.',
          'Watch, and learn what love is.',
        ],
        quote: "I learned the names of the cottagers themselves... the youth, Felix, who daily collected wood for the family's fire.",
        help: 'HOLD TAP to lean in and collect words · release when they look',
        winText: "Through the window, the Creature has learned more than language. He has learned longing.",
        loseText: "Felix sees the shadow at the window. The family scatters in terror.",

        init(api) {
          this.words = 0;
          this.need = 12;
          this.detected = 0;
          this.maxDetect = 3;
          this.family = [
            { x: 80,  y: 220, dir: 1, looking: false, lookT: 0, moveT: U.rand(1,2.5) },
            { x: 160, y: 260, dir: -1, looking: false, lookT: 0, moveT: U.rand(1,2) },
            { x: 120, y: 300, dir: 1, looking: false, lookT: 0, moveT: U.rand(1.5,3) },
          ];
          this.leaning = false;
          this.leanAmt = 0;
          this.spawnWord = 0;
          this.floatWords = [];
          this.pops = [];
        },

        update(api, dt) {
          const f = dt * 60;
          const W = api.W;

          // family members wander and occasionally look toward window
          for (const fm of this.family) {
            fm.moveT -= dt;
            if (fm.moveT <= 0) {
              fm.moveT = U.rand(0.8, 2.2);
              fm.looking = Math.random() < 0.28;
              fm.lookT = fm.looking ? U.rand(0.6, 1.4) : 0;
              if (!fm.looking) fm.x += (Math.random() < 0.5 ? 1 : -1) * U.rand(14, 32);
              fm.x = U.clamp(fm.x, 48, W - 48);
            }
            if (fm.looking) {
              fm.lookT -= dt;
              if (fm.lookT <= 0) fm.looking = false;
            }
          }

          // leaning
          const wasLeaning = this.leaning;
          this.leaning = api.pointer.down || api.keyDown('a') || api.keyDown('up');
          this.leanAmt = U.clamp(this.leanAmt + (this.leaning ? dt * 2.5 : -dt * 4), 0, 1);

          // anyone looking while leaning = detected
          const anyLooking = this.family.some((f) => f.looking);
          if (this.leaning && anyLooking && this.leanAmt > 0.3) {
            this.detected++;
            api.shake(5, 0.3); api.flash('#ff3060', 0.2); api.audio.sfx('hurt');
            this.leaning = false; this.leanAmt = 0;
            if (this.detected >= this.maxDetect) { api.lose(); return; }
          }

          // collect words when leaning and safe
          if (this.leaning && !anyLooking && this.leanAmt > 0.5) {
            this.spawnWord -= dt;
            if (this.spawnWord <= 0) {
              this.spawnWord = U.rand(0.45, 0.8);
              this.words++;
              api.score += 8;
              api.audio.sfx('coin');
              const wordList = ['love','fire','kind','word','song','hope','name','read','learn'];
              this.floatWords.push({ x: api.W - 50, y: 148, word: U.choice(wordList), life: 1.2, vy: -0.8 });
              if (this.words >= this.need) { api.score += 60; api.win(); return; }
            }
          }

          this.floatWords.forEach((w) => { w.y += w.vy; w.life -= dt; });
          this.floatWords = this.floatWords.filter((w) => w.life > 0);
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // outdoor night + cottage
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#06050e'); bg.addColorStop(1, '#0c0810');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // stars
          for (let i = 0; i < 20; i++) {
            const sx = (i * 87 + 11) % W, sy = (i * 63 + 5) % 80;
            g.rect(sx, sy, 1, 1, 'rgba(200,190,240,0.4)');
          }

          // cottage wall
          c.fillStyle = '#1c140e'; c.fillRect(30, 110, W - 60, H - 140);
          // cottage roof
          c.fillStyle = '#160e08';
          c.beginPath(); c.moveTo(14, 110); c.lineTo(W / 2, 46); c.lineTo(W - 14, 110); c.closePath(); c.fill();
          // thatch detail
          c.fillStyle = '#201408';
          for (let i = 0; i < 5; i++) c.fillRect(14 + i * (W - 28) / 4, 80 + i * 4, (W - 28) / 4, 3);

          // window (warm amber glow inside)
          const wgl = c.createRadialGradient(W / 2, 230, 10, W / 2, 230, 80);
          wgl.addColorStop(0, 'rgba(200,140,40,0.35)'); wgl.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = wgl; c.fillRect(0, 0, W, H);

          // window frame
          c.fillStyle = '#c8a050'; c.fillRect(W / 2 - 42, 138, 84, 72);
          c.fillStyle = '#f0c060'; c.fillRect(W / 2 - 40, 140, 80, 68);
          c.fillStyle = '#f8e090'; c.fillRect(W / 2 - 38, 142, 76, 64);

          // inside scene
          c.save(); c.beginPath(); c.rect(W / 2 - 38, 142, 76, 64); c.clip();
          c.fillStyle = '#f8d88040'; c.fillRect(W / 2 - 38, 142, 76, 64);

          // family members inside
          for (const fm of this.family) {
            const fc = fm.looking ? '#ff8a60' : '#a87040';
            g.circle(fm.x, fm.y, 6, fc);
            if (fm.looking) {
              // directional eyes (looking toward window = toward player)
              g.rect(fm.x - 4, fm.y - 2, 3, 2, '#fff');
              g.rect(fm.x + 1, fm.y - 2, 3, 2, '#fff');
            }
          }
          c.restore();

          // Creature crouching outside window
          const leanY = this.leanAmt * 18;
          // ground/snow
          g.rect(0, H - 32, W, 32, '#100810');
          g.rect(0, H - 34, W, 5, '#181218');

          // Creature (large hunched figure, left side)
          const cr = { x: 30, y: H - 70 - leanY };
          g.sprite([
            '.ggg.',
            'ggggg',
            '.ggg.',
            '.gbg.',
            'gbbgg',
            '.b.b.',
          ], cr.x, cr.y, { g: '#3a5a3a', b: '#2a3a28' }, 5);

          // lean indicator
          if (this.leaning) {
            const anyLooking = this.family.some((f) => f.looking);
            g.rect(W - 22, H - 20 - Math.round(60 * this.leanAmt), 12, Math.round(60 * this.leanAmt),
              anyLooking ? '#ff3060' : '#5dff8f');
          }

          // floating words
          for (const w of this.floatWords) {
            c.globalAlpha = w.life;
            api.txtCFit('"' + w.word + '"', W - 50, w.y, 9, '#c8a050', false, 92);
            c.globalAlpha = 1;
          }

          // knowledge jar progress
          const jx = W - 26, jy = 36, jh = 80;
          g.rect(jx, jy, 16, jh, 'rgba(200,160,80,.12)');
          g.rectO(jx, jy, 16, jh, '#6a5030', 1);
          const fill = Math.round(jh * (this.words / this.need));
          g.rect(jx + 1, jy + jh - fill, 14, fill, 'rgba(200,160,60,.55)');
          api.txtC(this.words + '/' + this.need, jx + 8, jy + jh + 4, 6, '#c8a050');

          // detection warnings
          for (let i = 0; i < this.maxDetect; i++) {
            g.rect(8 + i * 14, 20, 10, 10, i < this.detected ? '#ff3060' : '#1a1028');
          }

          api.topBar('THE DE LACEYS');
          api.vignette();
        },
      },

      /* ================================================================ */
      /* CHAPTER 4: THE ARCTIC CHASE — dodge ice floes                     */
      /* ================================================================ */
      {
        id: 'arctic',
        name: 'THE ARCTIC CHASE',
        sub: 'ACROSS THE FROZEN WASTE',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y + 2, 16, 4, '#8af0ff');
          g.rect(x - 5, y - 2, 10, 6, '#c0f8ff');
          g.rect(x - 2, y - 6, 5, 4, '#e8fcff');
        },
        intro: [
          'VICTOR CHASES THE',
          'CREATURE NORTHWARD.',
          'THE CREATURE TAUNTS HIM',
          'across the endless ice.',
        ],
        quote: "I, the true murderer, felt the never-dying worm alive in my bosom.",
        help: 'STEER left/right to dodge cracks · follow the Creature\'s trail',
        winText: "The Creature leaps from floe to floe, always just beyond reach.",
        loseText: "The ice gives way. Victor plunges into the Arctic deep.",

        init(api) {
          this.x = api.W / 2;
          this.speed = 2.4;
          this.dist = 0;
          this.goal = 2200;
          this.floes = [];
          this.cracks = [];
          this.spawnY = -30;
          this.hp = 4;
          this.hitFlash = 0;
          this.spawnT = 0;
          this.creature = { x: api.W / 2 + U.rand(-30, 30), y: 100 };
          this.pops = [];
          this.windT = 0;
          this.windDir = 0;
          // seed initial floes
          for (let i = 0; i < 8; i++) {
            this.floes.push(this.makeFloe(api, -i * 60 - 20));
          }
        },

        makeFloe(api, y) {
          const W = api.W;
          const isCrack = Math.random() < 0.3;
          return {
            x: U.rand(8, W - 8),
            y: y || 0,
            w: U.rand(32, 64),
            h: U.rand(10, 20),
            isCrack,
            crackT: isCrack ? U.rand(0.4, 0.9) : 99,
            broken: false,
          };
        },

        update(api, dt) {
          const f = dt * 60;
          const W = api.W, H = api.H;

          // steer
          if (api.keyDown('left') || (api.pointer.down && api.pointer.x < W / 2)) this.x -= 3.0 * f;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W / 2)) this.x += 3.0 * f;
          this.x = U.clamp(this.x, 14, W - 14);

          // wind gusts
          this.windT -= dt;
          if (this.windT <= 0) { this.windDir = U.rand(-1, 1); this.windT = U.rand(1.5, 3); }
          this.x = U.clamp(this.x + this.windDir * 0.7 * f, 14, W - 14);

          this.speed = Math.min(4.2, 2.4 + this.dist / 800);
          this.dist += this.speed * f;

          // scroll floes
          for (const fl of this.floes) {
            fl.y += this.speed * f;
            if (fl.isCrack) fl.crackT -= dt;
          }

          // spawn
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = U.rand(0.22, 0.5);
            this.floes.push(this.makeFloe(api, -20));
          }
          this.floes = this.floes.filter((fl) => fl.y < H + 30);

          // collision: player on safe floe, or standing on cracked one
          let onSafe = false;
          const py = H - 60;
          for (const fl of this.floes) {
            if (fl.broken) continue;
            const onX = Math.abs(this.x - fl.x) < fl.w / 2 + 6;
            const onY = Math.abs(py - fl.y) < 18;
            if (onX && onY) {
              if (fl.isCrack && fl.crackT <= 0) {
                if (!fl.broken) {
                  fl.broken = true;
                  if (this.hitFlash <= 0) {
                    this.hp--;
                    this.hitFlash = 0.7;
                    api.shake(5, 0.3); api.flash('#88ccff', 0.2); api.audio.sfx('hurt');
                    api.burst(this.x, py, '#88ccff', 8);
                    if (this.hp <= 0) { api.lose(); return; }
                  }
                }
              } else {
                onSafe = true;
              }
            }
          }

          if (this.hitFlash > 0) this.hitFlash -= dt;

          // creature drifts ahead
          this.creature.x += (this.x - this.creature.x) * 0.015 * f + U.rand(-1, 1);
          this.creature.x = U.clamp(this.creature.x, 20, W - 20);

          // particles
          this.pops.forEach((p) => { p.x += p.vx; p.y += p.vy; p.life -= dt; });
          this.pops = this.pops.filter((p) => p.life > 0);

          if (this.dist >= this.goal) { api.score += 80; api.win(); }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const py = H - 60;

          // arctic sky
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#060c1a'); bg.addColorStop(0.5, '#0a1428'); bg.addColorStop(1, '#141c30');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // aurora shimmer
          c.globalAlpha = 0.07 + 0.05 * Math.sin(api.t * 0.8);
          const aur = c.createLinearGradient(0, 0, W, 0);
          aur.addColorStop(0, '#5dff8f'); aur.addColorStop(0.5, '#21e6ff'); aur.addColorStop(1, '#9b5cff');
          c.fillStyle = aur; c.fillRect(0, 40, W, 120);
          c.globalAlpha = 1;

          // stars
          for (let i = 0; i < 35; i++) {
            const sx = (i * 73) % W, sy = (i * 51) % 100;
            c.globalAlpha = 0.3 + 0.3 * Math.sin(api.t * 2 + i);
            g.rect(sx, sy, 1, 1, '#c8d8ff');
          }
          c.globalAlpha = 1;

          // frozen sea surface
          g.rect(0, H - 20, W, 20, '#0a1828');

          // floes
          for (const fl of this.floes) {
            if (fl.broken) continue;
            const col = fl.isCrack
              ? (fl.crackT > 0.1 ? '#b0e0f0' : '#88aacc')
              : '#c8eeff';
            g.rect(fl.x - fl.w / 2, fl.y - fl.h / 2, fl.w, fl.h, col);
            g.rect(fl.x - fl.w / 2, fl.y - fl.h / 2, fl.w, 2, '#e8f8ff');
            if (fl.isCrack && fl.crackT < 0.6) {
              // crack line
              g.line(fl.x - 6, fl.y - 2, fl.x + 8, fl.y + 4, '#0a1428', 2);
            }
          }

          // Creature (ahead, escaping)
          g.sprite([
            '..g..',
            '.ggg.',
            'ggggg',
            '.gbg.',
            '.b.b.',
          ], this.creature.x - 10, this.creature.y - 20, { g: '#3a5a3a', b: '#2a3a28' }, 4);
          // motion trail
          c.globalAlpha = 0.2;
          g.rect(this.creature.x - 2, this.creature.y + 5, 4, 12, '#5dff8f');
          c.globalAlpha = 1;

          // Player (Victor on skis)
          if (!(this.hitFlash > 0 && Math.floor(api.t * 10) % 2 === 0)) {
            g.sprite([
              '.hh.',
              'hffh',
              '.cc.',
              'cccc',
              '.c.c',
            ], this.x - 8, py - 20, { h: '#5a3a2a', f: '#f0d0a0', c: '#6080c0' }, 4);
          }

          // HP dots
          for (let i = 0; i < 4; i++) {
            g.rect(8 + i * 14, 20, 10, 10, i < this.hp ? '#88ccff' : '#1a1828');
          }
          // distance bar
          g.rect(6, H - 10, W - 12, 4, '#1a2040');
          g.rect(6, H - 10, Math.round((W - 12) * U.clamp(this.dist / this.goal, 0, 1)), 4, '#88ccff');

          api.topBar('THE ARCTIC CHASE');
          api.vignette();
        },
      },

      /* ================================================================ */
      /* CHAPTER 5: INTO DARKNESS — precision leaps                        */
      /* ================================================================ */
      {
        id: 'darkness',
        name: 'INTO DARKNESS',
        sub: "THE CREATURE'S FAREWELL",
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 7, '#0a0820');
          g.rect(x - 1, y - 8, 3, 16, '#5dff8f');
          g.rect(x - 8, y - 1, 16, 3, '#5dff8f');
        },
        intro: [
          'WALTON FINDS THE CREATURE',
          'MOURNING VICTOR\'S BODY.',
          'THE CREATURE VOWS TO',
          'end himself — and leaps away.',
        ],
        quote: "I shall ascend my funeral pile triumphantly, and exult in the agony of the torturing flames.",
        help: 'TAP to leap — time it just right as the floe aligns',
        winText: "The Creature is carried away on a raft of ice, borne by dark waves into the night.",
        loseText: "The ice breaks beneath him. The Arctic sea swallows all trace of the Creature.",

        init(api) {
          this.x = 60;
          this.y = api.H - 80;
          this.vy = 0;
          this.vx = 0;
          this.onGround = true;
          this.floes = [];
          this.leaps = 0;
          this.need = 7;
          this.meter = 0;
          this.mDir = 1;
          this.mSpd = 1.2;
          this.pops = [];
          this.phase = 'aim';
          this.flashT = 0;
          // build floe runway
          this.floes.push({ x: 30, y: api.H - 80, w: 60, h: 12, fixed: true });
          for (let i = 0; i < 9; i++) {
            this.floes.push({
              x: 100 + i * 64 + U.rand(-12, 12),
              y: api.H - 80 + U.rand(-20, 30),
              w: U.rand(28, 44),
              h: 10,
              fixed: true,
              reached: false,
            });
          }
        },

        update(api, dt) {
          const f = dt * 60;
          const W = api.W, H = api.H;

          // scroll world left as Creature progresses
          const scroll = this.leaps > 0 ? this.leaps * 0 : 0;

          // aim meter oscillates
          if (this.phase === 'aim') {
            this.meter += this.mDir * this.mSpd * 0.03 * f;
            if (this.meter > 1) { this.meter = 1; this.mDir = -1; }
            if (this.meter < 0) { this.meter = 0; this.mDir = 1; }
            this.mSpd = Math.min(2.4, 1.2 + this.leaps * 0.18);

            if (api.confirm()) {
              this.phase = 'jump';
              const power = this.meter;
              this.vx = 2.0 + power * 4.5;
              this.vy = -(5 + power * 4);
              this.onGround = false;
              api.audio.sfx('jump');
              api.burst(this.x, this.y, '#5dff8f', 6);
            }
          }

          if (this.phase === 'jump') {
            this.vy += 0.22 * f;
            this.x += this.vx * f;
            this.y += this.vy * f;

            // check landing on any floe
            for (const fl of this.floes) {
              if (fl.reached) continue;
              const onX = Math.abs(this.x - fl.x) < fl.w / 2 + 4;
              const nearY = Math.abs(this.y - fl.y) < 16 && this.vy > 0;
              if (onX && nearY) {
                this.y = fl.y;
                this.vy = 0; this.vx = 0;
                this.onGround = true;
                fl.reached = true;
                this.leaps++;
                api.score += Math.round(20 + this.meter * 40);
                api.audio.sfx('coin');
                api.burst(this.x, this.y, '#8af0ff', 8);
                this.phase = 'aim';
                this.meter = 0;
                if (this.leaps >= this.need) { api.score += 80; api.win(); return; }
                break;
              }
            }

            // fell off screen
            if (this.y > api.H + 20 || this.x > api.W + 20) {
              api.lose();
            }
          }

          this.pops.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= dt; });
          this.pops = this.pops.filter((p) => p.life > 0);
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // deep arctic night
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#02010a'); bg.addColorStop(0.6, '#060410'); bg.addColorStop(1, '#080816');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // aurora (muted)
          c.globalAlpha = 0.05 + 0.04 * Math.sin(api.t * 0.6);
          const aur = c.createLinearGradient(0, 0, 0, H * 0.5);
          aur.addColorStop(0, '#5dff8f40'); aur.addColorStop(1, '#9b5cff00');
          c.fillStyle = aur; c.fillRect(0, 0, W, H * 0.5);
          c.globalAlpha = 1;

          // stars
          for (let i = 0; i < 50; i++) {
            const sx = (i * 67 + 9) % W, sy = (i * 43 + 3) % (H * 0.55);
            c.globalAlpha = 0.2 + 0.4 * Math.sin(api.t * 1.8 + i * 0.7);
            g.rect(sx, sy, 1, 1, i % 3 === 0 ? '#9b5cff' : '#c0c8e0');
          }
          c.globalAlpha = 1;

          // Walton's ship silhouette (distant right)
          const ship = { x: W - 48, y: H - 68 };
          c.fillStyle = '#08060e';
          c.fillRect(ship.x, ship.y + 16, 56, 22);
          g.line(ship.x + 28, ship.y + 16, ship.x + 28, ship.y - 20, '#08060e', 2);
          g.sprite(['.ww', 'www'], ship.x + 24, ship.y - 14, { w: '#0e0a18' }, 4);

          // dark sea
          g.rect(0, H - 18, W, 18, '#04080e');
          for (let wx = 0; wx < W; wx += 18) {
            const wy = H - 18 + Math.sin(api.t * 1.4 + wx * 0.12) * 2;
            g.rect(wx, wy, 14, 3, '#080c16');
          }

          // floes
          for (const fl of this.floes) {
            if (fl.reached && fl !== this.floes[0]) continue;
            const col = fl.reached ? '#405870' : '#a8d8f0';
            g.rect(fl.x - fl.w / 2, fl.y, fl.w, fl.h, col);
            g.rect(fl.x - fl.w / 2, fl.y, fl.w, 2, fl.reached ? '#506880' : '#d0f0ff');
          }

          // Creature
          const bob = this.onGround ? Math.sin(api.t * 5) * 1 : 0;
          g.sprite([
            '.ggg.',
            'ggggg',
            '.ggg.',
            '.gbg.',
            '.b.b.',
          ], this.x - 10, this.y - 22 + bob, { g: '#3a5a3a', b: '#2a3a28' }, 4);

          // aim meter (only in aim phase)
          if (this.phase === 'aim') {
            const mx = 14, my = H - 22, mw = W - 28;
            g.rect(mx, my, mw, 8, '#0e0a1c');
            const col = this.meter > 0.7 ? '#5dff8f' : this.meter > 0.4 ? '#c8a050' : '#6a4888';
            g.rect(mx, my, Math.round(mw * this.meter), 8, col);
            g.rect(mx + Math.round(mw * 0.65), my - 2, 2, 12, 'rgba(255,255,255,0.4)');
            api.txtC('LEAP', W / 2, my - 12, 8, '#8070a0');
          }

          // leap count
          for (let i = 0; i < this.need; i++) {
            g.rect(8 + i * 16, 20, 12, 8, i < this.leaps ? '#5dff8f' : '#1a1028');
          }

          api.topBar('INTO DARKNESS');
          api.vignette();
        },
      },
    ], // end chapters
  }); // end RetroSaga.create

  /* -------------------------------------------------------------------------- */
  /* Jar scene drawings for the menu cards                                       */
  /* -------------------------------------------------------------------------- */
  function drawJarScene(api, i, cx, cy, done) {
    const g = api.gfx;
    switch (i) {
      case 0: // lab lightning
        g.line(cx - 4, cy - 20, cx + 2, cy - 10, done ? '#9b5cff' : '#4a3a6a', 1);
        g.line(cx + 2, cy - 10, cx - 3, cy - 4, done ? '#5dff8f' : '#3a4a3a', 1);
        g.rect(cx - 6, cy + 4, 12, 6, done ? '#3a5a3a' : '#2a3a2a');
        break;
      case 1: // torch
        g.rect(cx - 1, cy - 8, 3, 14, '#6a3a14');
        g.circle(cx, cy - 9, 5, done ? '#ff8a3d' : '#4a3a2a');
        break;
      case 2: // cottage window
        g.rect(cx - 10, cy - 12, 20, 16, done ? '#c8a050' : '#4a3a2a');
        g.rect(cx - 8, cy - 10, 16, 12, done ? '#f8e090' : '#2a2018');
        break;
      case 3: // ice floe
        g.rect(cx - 12, cy + 2, 24, 8, done ? '#c8eeff' : '#3a4a5a');
        g.rect(cx - 12, cy + 2, 24, 2, done ? '#e8f8ff' : '#4a5a6a');
        break;
      case 4: // stars
        g.rect(cx, cy - 14, 2, 2, done ? '#5dff8f' : '#3a4a3a');
        g.rect(cx - 10, cy - 6, 2, 2, done ? '#9b5cff' : '#2a2a3a');
        g.rect(cx + 8, cy - 2, 2, 2, done ? '#88ccff' : '#2a3a4a');
        g.rect(cx - 4, cy + 6, 2, 2, done ? '#5dff8f' : '#2a3a2a');
        break;
    }
  }

})();
