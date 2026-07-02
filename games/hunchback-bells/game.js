/* ============================================================================
 * THE HUNCHBACK OF NOTRE-DAME — THE BELLS OF NOTRE-DAME
 * Five chapters through Victor Hugo's Notre-Dame de Paris (1831):
 *   1. FESTIVAL OF FOOLS   — dodge the angry crowd for 20 seconds
 *   2. THE GREAT BELLS     — tap the glowing bell before it fades (14 rings)
 *   3. SANCTUARY!          — lane-switch climb with Esmeralda on your back
 *   4. DEFEND NOTRE-DAME   — drop stones on Frollo's climbing soldiers (24s)
 *   5. THE LAST BELL       — swing the pendulum into the green zone (5 times)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── Emblem: Quasimodo silhouette in the bell-tower arch ─────────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Gothic arch frame
    c.fillStyle = '#1a0e32';
    c.beginPath();
    c.moveTo(cx - 28, cy + 30);
    c.lineTo(cx - 28, cy - 10);
    c.quadraticCurveTo(cx - 28, cy - 34, cx, cy - 34);
    c.quadraticCurveTo(cx + 28, cy - 34, cx + 28, cy - 10);
    c.lineTo(cx + 28, cy + 30);
    c.closePath(); c.fill();
    // Stained-glass interior glow
    c.globalAlpha = 0.22; g.circle(cx, cy - 4, 17, '#d4a017'); c.globalAlpha = 1;
    c.fillStyle = '#200a3a';
    c.beginPath();
    c.moveTo(cx - 20, cy + 28);
    c.lineTo(cx - 20, cy - 6);
    c.quadraticCurveTo(cx - 20, cy - 26, cx, cy - 26);
    c.quadraticCurveTo(cx + 20, cy - 26, cx + 20, cy - 6);
    c.lineTo(cx + 20, cy + 28);
    c.closePath(); c.fill();
    // Leading cross on window
    g.rect(cx - 1, cy - 26, 2, 38, '#2a0a50');
    g.rect(cx - 20, cy - 4, 40, 3, '#2a0a50');
    // Quasimodo silhouette (hunchback)
    g.circle(cx + 1, cy - 18, 5, '#08041a');
    g.rect(cx - 5, cy - 14, 11, 14, '#08041a');
    g.rect(cx + 4, cy - 12, 8, 6, '#08041a'); // hunch
    g.rect(cx - 4, cy, 4, 10, '#08041a');
    g.rect(cx + 2, cy, 4, 10, '#08041a');
    // Bell below
    g.sprite([
      '..bb..',
      '.bbbb.',
      'bbbbbb',
      '.bbbb.',
      '..bb..',
      '...b..',
    ], cx - 12, cy + 12, { b: '#c8941a' }, 4);
  }

  /* ── Scenery: cathedral interior / rose-window menu ──────────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Dark cathedral stone with rose-window backdrop
      const bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#060310'); bg.addColorStop(0.45, '#0c0624'); bg.addColorStop(1, '#080414');
      c.fillStyle = bg; c.fillRect(0, 0, W, H);

      // Rose window background halo (behind chapter cards)
      const rwx = 135, rwy = 252;
      c.globalAlpha = 0.09; c.strokeStyle = '#9b5cff'; c.lineWidth = 14;
      c.beginPath(); c.arc(rwx, rwy, 108, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
      for (let sp = 0; sp < 12; sp++) {
        const ang = sp * Math.PI / 6;
        c.globalAlpha = 0.05 + 0.03 * Math.sin(t * 0.7 + sp * 0.4);
        c.strokeStyle = '#9b5cff'; c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(rwx, rwy);
        c.lineTo(rwx + 100 * Math.cos(ang), rwy + 100 * Math.sin(ang));
        c.stroke(); c.globalAlpha = 1;
      }
      c.globalAlpha = 0.07; g.circle(rwx, rwy, 30, '#d4a017'); c.globalAlpha = 1;
      c.globalAlpha = 0.04; g.circle(rwx, rwy, 16, '#9b5cff'); c.globalAlpha = 1;

      // Stone pillar rails on sides
      c.fillStyle = '#0c0820'; c.fillRect(0, 0, 15, H); c.fillRect(W - 15, 0, 15, H);
      for (let pi = 0; pi < 7; pi++) {
        g.rect(0, 52 + pi * 62, 15, 8, '#120a26');
        g.rect(W - 15, 52 + pi * 62, 15, 8, '#120a26');
      }
      // Gothic arch at very top
      c.fillStyle = '#060310';
      c.beginPath();
      c.moveTo(0, 0); c.lineTo(0, 38);
      c.quadraticCurveTo(W / 2, 6, W, 38);
      c.lineTo(W, 0); c.closePath(); c.fill();

    } else {
      // Cathedral nave: dark stone + stained-glass light beams
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#04020c'); sky.addColorStop(0.6, '#0a061e'); sky.addColorStop(1, '#060312');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);

      // Three colored light beams from stained-glass windows above
      const beams = [[30, '#9b5cff', 0.06], [W / 2, '#d4a017', 0.05], [W - 30, '#9b102e', 0.06]];
      for (const [bx, bc, ba] of beams) {
        c.globalAlpha = ba + 0.025 * Math.sin(t * 0.9 + bx * 0.01);
        c.fillStyle = bc;
        c.beginPath();
        c.moveTo(bx - 7, 0); c.lineTo(bx - 44, H * 0.9);
        c.lineTo(bx + 44, H * 0.9); c.lineTo(bx + 7, 0);
        c.closePath(); c.fill(); c.globalAlpha = 1;
      }
      // Stone floor tiles
      for (let ty = H - 56; ty < H; ty += 18) {
        for (let tx = 0; tx < W; tx += 22) {
          g.rect(tx, ty, 21, 17, '#12101c');
          g.rect(tx, ty, 21, 1, '#1c1a2c');
        }
      }
      // Floating dust motes
      for (let di = 0; di < 10; di++) {
        const dmx = ((di * 73 + t * 11) % (W + 20)) - 10;
        const dmy = 36 + ((di * 47 + t * 7.3) % (H - 90));
        c.globalAlpha = 0.07 + 0.06 * Math.sin(t * 1.7 + di * 0.9);
        g.rect(Math.floor(dmx), Math.floor(dmy), 2, 2, '#c8b0ee');
        c.globalAlpha = 1;
      }
      if (scene === 'intro' || scene === 'result' || scene === 'finale') {
        c.fillStyle = 'rgba(4,2,12,.80)'; c.fillRect(0, 0, W, H);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
   * RETROSAGA CONFIG
   * ══════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id: 'hunchback',
    title: 'THE BELLS OF NOTRE-DAME',
    subtitle: 'FIVE CHAPTERS OF HUGO\'S CATHEDRAL',
    currency: 'GRACE',
    screens: {
      win: '#9b5cff', lose: '#6a102e',
      chapterLabel: '#8a7a5a', name: '#e8d8ff', sub: '#9b5cff',
      intro: '#d0c0e8', quote: '#8a7a5a', help: '#b8a0d8',
      score: '#e8d8ff', cur: '#d4a017', cta: '#e8d8ff',
      overlay: 'rgba(6,3,14,.88)',
    },
    labels: {
      chapter: 'CHAPTER', score: 'GRACE EARNED',
      win: 'THE BELLS RING TRUE',
      lose: 'THE CATHEDRAL FALLS SILENT',
      cont: 'TAP TO PRESS ON',
      finale: 'TAP FOR THE FINAL CHAPTER',
      toMenu: 'TAP TO RETURN',
      play: 'TAP TO ENTER',
    },
    accent: '#d4a017',
    credit: 'AFTER VICTOR HUGO · NOTRE-DAME DE PARIS, 1831',
    emblem,
    scenery,
    bootCta: 'ENTER THE CATHEDRAL',
    menuLabel: 'THE FIVE CHAPTERS OF HUGO',
    menuHint: 'TAP A PANEL TO PLAY',
    menuDone: '✦ THE CATHEDRAL IS SAVED ✦',
    menu: {
      colors: { title: '#9b5cff', label: '#8a7a5a', cur: '#d4a017', hint: '#b8a0d8' },
      // Rose-window layout: 5 pointed-arch panels in a pentagon arrangement
      layout(api) {
        return [
          { x: 85,  y:  98, w: 100, h: 68 }, // top-centre
          { x: 10,  y: 192, w: 100, h: 68 }, // upper-left
          { x: 160, y: 192, w: 100, h: 68 }, // upper-right
          { x: 8,   y: 306, w: 122, h: 72 }, // lower-left
          { x: 140, y: 306, w: 122, h: 72 }, // lower-right
        ];
      },
      card(api, { ch, i, x, y, w, h, sel, done }) {
        const g = api.gfx, c = api.ctx, cx = x + w / 2;
        const ar = w * 0.44;
        // Pointed-arch stained-glass window shape
        c.fillStyle = sel ? '#1e1250' : '#100a2c';
        c.strokeStyle = sel ? '#9b5cff' : '#3a1a6a';
        c.lineWidth = sel ? 2 : 1;
        c.beginPath();
        c.moveTo(x, y + ar + 8);
        c.quadraticCurveTo(x, y + 10, cx, y + 5);
        c.quadraticCurveTo(x + w, y + 10, x + w, y + ar + 8);
        c.lineTo(x + w, y + h);
        c.lineTo(x, y + h);
        c.closePath();
        c.fill(); c.stroke();
        // Stained-glass colour fill
        const glassC = ['#3a0a18', '#18083a', '#2a0c18', '#0a1838', '#380a28'];
        c.globalAlpha = done ? 0.60 : 0.24;
        c.fillStyle = glassC[i];
        c.fillRect(x + 4, y + 22, w - 8, h - 30);
        c.globalAlpha = 1;
        // Lead lines (cross)
        c.globalAlpha = 0.32;
        g.rect(cx - 1, y + 18, 2, h - 22, '#180a3a');
        g.rect(x + 6, y + (h + 18) / 2 - 1, w - 12, 2, '#180a3a');
        c.globalAlpha = 1;
        // Chapter icon
        if (ch.icon) ch.icon(api, cx, y + 28);
        // Text
        api.txtCFit(ch.name, cx, y + 49, 7, done ? '#d4a017' : '#e8d8ff', false, w - 8);
        if (ch.sub) api.txtCFit(ch.sub, cx, y + 62, 6, done ? '#9b5cff' : '#8a7a9a', false, w - 8);
        if (done) { c.globalAlpha = 0.9; api.txtC('✶', cx, y + h - 11, 10, '#d4a017'); c.globalAlpha = 1; }
        if (sel) {
          c.strokeStyle = '#b87aff'; c.lineWidth = 2;
          c.strokeRect(x + 4, y + 4, w - 8, h - 8);
        }
      },
    },
    finale: [
      'THE GREAT BELL TOLLS.',
      'ALL PARIS HEARS IT.',
      '',
      'ESMERALDA STEPS FREE',
      'INTO THE MORNING LIGHT.',
      '',
      'HIGH ABOVE,',
      'QUASIMODO WATCHES.',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ════════════════════════════════════════════════════════════════
       * CHAPTER 1 — FESTIVAL OF FOOLS: dodge flying debris for 20s
       * ════════════════════════════════════════════════════════════════ */
      {
        id: 'festival', name: 'FESTIVAL OF FOOLS', sub: 'THE CROWD TURNS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 1, 16, 8, '#9b102e');
          g.rect(x - 10, y + 6, 20, 4, '#1238a0');
          g.rect(x - 3, y - 9, 6, 10, '#9b5cff');
          g.circle(x + 7, y - 2, 3, '#d4a017');
          g.circle(x - 7, y - 2, 3, '#d4a017');
        },
        intro: [
          'THE ARCHDEACON FROLLO',
          'HAS QUASIMODO CROWNED',
          'KING OF FOOLS AT',
          'the Festival.',
        ],
        quote: '"He had ceased to hear... but he saw their open mouths, and he knew they were laughing."',
        help: 'MOVE left & right — dodge the mob\'s fury for 20 seconds',
        winText: 'He endures it all. When the mob tires, he is still standing on the platform.',
        loseText: 'Three blows — the mob drags him from the platform. He closes his eyes.',
        init(api) {
          this.qx = api.W / 2;
          this.lives = 3;
          this.timer = 20;
          this.projs = [];
          this.spawnT = 0.72;
          this.iframes = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          api.score = Math.floor(Math.max(0, 20 - this.timer) * 5);

          // Movement — keyboard or touch
          let dx = 0;
          if (api.keyDown('left')) dx -= 2.2;
          if (api.keyDown('right')) dx += 2.2;
          if (api.pointer.down) {
            if (api.pointer.x < this.qx - 12) dx -= 2.2;
            else if (api.pointer.x > this.qx + 12) dx += 2.2;
          }
          this.qx = clamp(this.qx + dx * f, 18, api.W - 18);

          // Spawn projectiles — from left and right sides
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            const fromLeft = api.chance(0.5);
            const spd = 2.4 + Math.max(0, 20 - this.timer) * 0.075;
            this.projs.push({
              x: fromLeft ? -14 : api.W + 14,
              y: 358 + api.rnd(-16, 8),
              vx: fromLeft ? spd : -spd,
              vy: api.rnd(-0.18, 0.18),
              kind: api.chance(0.55) ? 'veg' : 'stone',
            });
            this.spawnT = Math.max(0.19, 0.72 - Math.max(0, 20 - this.timer) * 0.022);
          }

          for (const p of this.projs) { p.x += p.vx * f; p.y += p.vy * f; }
          this.projs = this.projs.filter(p => p.x > -22 && p.x < api.W + 22);

          // Hit detection — iframes protect after each hit
          const qy = 368;
          if (this.iframes <= 0) {
            for (let j = this.projs.length - 1; j >= 0; j--) {
              const p = this.projs[j];
              if (Math.abs(p.x - this.qx) < 15 && Math.abs(p.y - qy) < 15) {
                this.lives--;
                this.iframes = 1.5;
                api.shake(6, 0.28); api.flash('#9b102e', 0.22); api.audio.sfx('hurt');
                this.projs.splice(j, 1);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          } else { this.iframes -= dt; }

          if (this.timer <= 0) { api.score += 60; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#0c0a1e');

          // Cobblestone square
          for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 11; col++) {
              g.rect(col * 26 + (row % 2) * 13, H - 48 + row * 12, 24, 11, '#1a1630');
              g.rect(col * 26 + (row % 2) * 13, H - 48 + row * 12, 24, 1, '#221e3c');
            }
          }
          // Stage platform
          g.rect(10, H - 98, W - 20, 12, '#3a3050');
          g.rect(10, H - 100, W - 20, 3, '#5a4870');
          g.rect(10, H - 98, W - 20, 1, '#6a5880');

          // Crowd silhouettes — jeering on both sides
          for (let ci = 0; ci < 9; ci++) {
            const cpx = 4 + ci * 30, cpy = H - 100;
            g.rect(cpx, cpy - 18, 14, 20, '#0e0a1c');
            g.circle(cpx + 7, cpy - 24, 7, '#0e0a1c');
            if (ci % 3 === 0) g.rect(cpx + 9, cpy - 24, 4, 9, '#0e0a1c'); // raised arm
          }

          // Notre-Dame facade silhouette in background
          g.rect(30, 18, 14, 76, '#060412');
          g.rect(226, 18, 14, 76, '#060412');
          g.rect(16, 94, 238, 36, '#060412');
          g.rect(98, 10, 74, 86, '#060412');
          c.globalAlpha = 0.22; g.circle(W / 2, 43, 17, '#9b5cff'); c.globalAlpha = 1;

          // Projectiles
          for (const p of this.projs) {
            if (p.kind === 'veg') {
              g.circle(p.x, p.y, 6, '#8b2222'); g.rect(p.x - 1, p.y - 9, 2, 4, '#2a6a18');
            } else {
              g.rect(p.x - 4, p.y - 3, 9, 6, '#5a4a5a'); g.rect(p.x - 2, p.y - 1, 5, 3, '#4a3a4a');
            }
          }

          // Quasimodo — flashes during iframes
          const qy = H - 98;
          const vis = this.iframes <= 0 || Math.floor(this.iframes * 8) % 2 === 0;
          if (vis) {
            g.sprite(['.hh.', 'hffh', '.Hh.', 'h..h'],
              this.qx - 10, qy - 22, { h: '#3a2818', f: '#c89058', H: '#4a3060' }, 5);
          }

          api.topBar('FESTIVAL OF FOOLS');
          api.txt('SURVIVE ' + Math.ceil(Math.max(0, this.timer)) + 's', 6, 20, 9, '#9b5cff');
          for (let li = 0; li < 3; li++) g.rect(W - 50 + li * 17, 4, 12, 9, li < this.lives ? '#d4a017' : '#1c0e2a');
          g.rect(6, H - 11, W - 12, 5, '#1a1530');
          g.rect(6, H - 11, Math.round((W - 12) * Math.max(0, this.timer / 20)), 5, '#9b5cff');
          api.vignette();
        },
      },

      /* ════════════════════════════════════════════════════════════════
       * CHAPTER 2 — THE GREAT BELLS: tap the glowing bell (14 rings)
       * ════════════════════════════════════════════════════════════════ */
      {
        id: 'bells', name: 'THE GREAT BELLS', sub: 'RING THE CARILLON',
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite(['..b..', '.bbb.', 'bbbbb', '.bbb.', '..b..', '...b.'],
            x - 12, y - 14, { b: '#c8941a' }, 5);
        },
        intro: [
          'QUASIMODO LIVES AMONG',
          'THE GREAT BELLS.',
          'He swings on their ropes',
          'and sings with them.',
        ],
        quote: '"He had given them names. He loved them as mothers love their children — he loved their voices."',
        help: 'TAP the GLOWING BELL before it fades — 4 misses and the tower goes dark',
        winText: 'The full carillon rings out over Paris. Heads turn in the streets below.',
        loseText: 'Too many misses. Frollo has sent soldiers to the tower stairs.',
        init(api) {
          this.caught = 0;
          this.need = 14;
          this.misses = 0;
          this.maxMiss = 4;
          this.lit = -1;
          this.litT = 0;
          this.litDur = 1.5;
          this.nextT = 0.65;
          this.bells = [{ x: 66, y: 154 }, { x: 200, y: 154 }, { x: 66, y: 288 }, { x: 200, y: 288 }];
        },
        update(api, dt) {
          api.score = this.caught * 10;

          if (this.lit >= 0) {
            this.litT -= dt;
            if (this.litT <= 0) {
              // Timed out → miss
              this.lit = -1;
              this.misses++;
              api.shake(4, 0.2); api.audio.sfx('hurt');
              if (this.misses >= this.maxMiss) { api.lose(); return; }
              this.nextT = 0.36;
            }
          } else {
            this.nextT -= dt;
            if (this.nextT <= 0) {
              this.lit = api.rint(0, 3);
              const prog = Math.min(1, this.caught / this.need);
              this.litDur = Math.max(0.58, 1.5 - prog * 0.68);
              this.litT = this.litDur;
              api.audio.sfx('blip');
            }
          }

          // Tap — hit or miss
          if (api.pointer.justDown) {
            if (this.lit >= 0) {
              const b = this.bells[this.lit];
              if (Math.hypot(api.pointer.x - b.x, api.pointer.y - b.y) < 40) {
                this.caught++;
                api.burst(b.x, b.y, '#d4a017', 12); api.audio.sfx('coin');
                this.lit = -1;
                this.nextT = Math.max(0.13, 0.42 - (this.caught / this.need) * 0.14);
                if (this.caught >= this.need) { api.score += 70; api.win(); }
              } else {
                this.misses++;
                api.shake(3, 0.14); api.audio.sfx('blip');
                if (this.misses >= this.maxMiss) { api.lose(); }
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#06031a');

          // Brickwork tower walls
          for (let by = 0; by < H; by += 22) {
            for (let bx = 0; bx < W; bx += 28) {
              g.rect(bx + (Math.floor(by / 22) % 2) * 14, by, 26, 20, '#0e0c1e');
              g.rect(bx + (Math.floor(by / 22) % 2) * 14, by, 26, 1, '#18162e');
            }
          }

          // Four bells
          for (let bi = 0; bi < this.bells.length; bi++) {
            const b = this.bells[bi];
            const isLit = this.lit === bi;
            const prog = isLit ? this.litT / this.litDur : 0;

            // Bell rope
            g.rect(b.x - 1, b.y - 58, 2, 58, '#6a5028');

            // Glow ring
            if (isLit) {
              c.globalAlpha = 0.28 * prog;
              g.circle(b.x, b.y, 48, '#d4a017');
              c.globalAlpha = 1;
              c.globalAlpha = 0.55 + 0.30 * Math.sin(api.t * 11);
              c.strokeStyle = '#e8c050'; c.lineWidth = 2;
              c.strokeRect(b.x - 35, b.y - 44, 70, 60); c.globalAlpha = 1;
            }

            // Bell sprite — brighter when lit
            const bc = isLit ? '#e8c050' : '#7a5e14';
            g.sprite(['..bbb..', '.bbbbb.', 'bbbbbbb', 'bbbbbbb', '.bbbbb.', '...b...'],
              b.x - 21, b.y - 36, { b: bc }, 6);
          }

          api.topBar('THE GREAT BELLS');
          api.txt('RUNG ' + this.caught + '/' + this.need, 6, 20, 9, '#d4a017');
          for (let mi = 0; mi < this.maxMiss; mi++) {
            g.rect(W - 58 + mi * 14, 4, 10, 8, mi >= this.misses ? '#9b5cff' : '#1a0c28');
          }
          api.vignette();
        },
      },

      /* ════════════════════════════════════════════════════════════════
       * CHAPTER 3 — SANCTUARY!: lane-switch climb (22s, 10 grabs)
       * ════════════════════════════════════════════════════════════════ */
      {
        id: 'sanctuary', name: 'SANCTUARY!', sub: 'CLAIM THE SACRED WALLS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 5, y - 14, 10, 22, '#3a2858');
          g.rect(x - 8, y - 16, 16, 5, '#3a2858');
          for (let ti = 0; ti < 3; ti++) g.rect(x - 5 + ti * 4, y - 21, 3, 6, '#9b5cff');
        },
        intro: [
          'FROLLO ORDERS ESMERALDA',
          'SEIZED FROM THE SQUARE.',
          'QUASIMODO LIFTS HER',
          'and races up the cathedral.',
        ],
        quote: '"Sanctuary!" — the word swept through the crowd like a wave, and they stood hushed.',
        help: 'TAP LEFT · CENTER · RIGHT to grab gargoyle ledges — avoid the soldiers',
        winText: '"Sanctuary!" The great doors close behind them. They are safe inside.',
        loseText: 'The soldiers catch them before the top. They are dragged back down.',
        init(api) {
          this.qlane = 1;
          this.qx = api.W / 2;
          this.grabbed = 0;
          this.need = 10;
          this.lives = 3;
          this.iframes = 0;
          this.timer = 22;
          this.ledges = [];
          this.spawnT = 0.45;
          this.laneXs = [48, 135, 222];
          const grabY = api.H - 118;
          // Pre-seed ledges above grab zone
          for (let pi = 0; pi < 4; pi++) {
            this.ledges.push({ lane: pi % 3, y: grabY - 65 - pi * 66, kind: 'ledge' });
          }
        },
        update(api, dt) {
          this.timer -= dt;
          api.score = this.grabbed * 12;
          const laneXs = this.laneXs;
          const grabY = api.H - 118;
          const scrollSpd = 60 + this.grabbed * 4;

          // Lane switching
          if (api.keyPressed('left') && this.qlane > 0) this.qlane--;
          if (api.keyPressed('right') && this.qlane < 2) this.qlane++;
          if (api.pointer.justDown) {
            if (api.pointer.x < api.W / 3) this.qlane = 0;
            else if (api.pointer.x > (api.W * 2) / 3) this.qlane = 2;
            else this.qlane = 1;
          }
          // Smooth horizontal movement
          this.qx += (laneXs[this.qlane] - this.qx) * Math.min(1, dt * 14);

          // Scroll ledges downward
          for (const led of this.ledges) led.y += scrollSpd * dt;
          this.ledges = this.ledges.filter(led => led.y < api.H + 34);

          // Spawn new ledges from top
          this.spawnT -= dt;
          if (this.spawnT <= 0 || this.ledges.length < 3) {
            let topY = grabY - 44;
            for (const led of this.ledges) if (led.y < topY) topY = led.y;
            const isGuard = api.chance(0.28) && this.grabbed >= 2;
            this.ledges.push({
              lane: api.rint(0, 2),
              y: Math.min(topY - 52, grabY - 82),
              kind: isGuard ? 'guard' : 'ledge',
            });
            this.spawnT = api.rnd(0.52, 0.80);
          }

          // Collisions in grab zone
          if (this.iframes <= 0) {
            for (let li = this.ledges.length - 1; li >= 0; li--) {
              const led = this.ledges[li];
              const lx = laneXs[led.lane];
              if (Math.abs(led.y - grabY) < 22 && Math.abs(lx - this.qx) < 30) {
                if (led.kind === 'ledge') {
                  this.grabbed++;
                  api.audio.sfx('coin');
                  api.burst(lx, grabY, '#9b5cff', 8);
                  this.ledges.splice(li, 1);
                  if (this.grabbed >= this.need) { api.score += 70; api.win(); return; }
                } else {
                  this.lives--;
                  this.iframes = 1.4;
                  api.shake(7, 0.28); api.flash('#9b102e', 0.22); api.audio.sfx('hurt');
                  this.ledges.splice(li, 1);
                  if (this.lives <= 0) { api.lose(); return; }
                }
                break;
              }
            }
          } else { this.iframes -= dt; }

          if (this.timer <= 0 && this.grabbed < this.need) { api.lose(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#060310');

          // Cathedral exterior stonework
          for (let by = 0; by < H; by += 24) {
            for (let bx = 0; bx < W; bx += 32) {
              g.rect(bx + (Math.floor(by / 24) % 2) * 16, by, 30, 22, '#120e22');
              g.rect(bx + (Math.floor(by / 24) % 2) * 16, by, 30, 1, '#1c1a30');
            }
          }

          // Lane guide lines (very subtle)
          const laneXs = this.laneXs;
          for (let lgi = 0; lgi < 3; lgi++) {
            c.globalAlpha = 0.07;
            g.rect(laneXs[lgi] - 1, 0, 2, H, '#9b5cff');
            c.globalAlpha = 1;
          }

          // Paris silhouette at top
          g.rect(0, 0, W, 22, '#02010a');
          for (let bi = 0; bi < 7; bi++) {
            const bh = 8 + (bi * 31) % 10;
            g.rect(bi * 40 - 2, 22 - bh, 34, bh, '#06041a');
          }

          // Gargoyle ledges and soldier guards
          for (const led of this.ledges) {
            const lx = laneXs[led.lane];
            if (led.kind === 'ledge') {
              g.rect(lx - 26, led.y - 7, 52, 12, '#382658');
              g.rect(lx - 26, led.y - 9, 52, 3, '#5a4080');
              g.circle(lx, led.y - 14, 10, '#48366a');
              g.rect(lx - 4, led.y - 17, 3, 3, '#d4a017');
              g.rect(lx + 1, led.y - 17, 3, 3, '#d4a017');
              g.rect(lx - 3, led.y - 9, 6, 4, '#9b102e');
            } else {
              // Soldier — flash to warn player
              g.rect(lx - 9, led.y - 24, 18, 24, '#1a1428');
              g.circle(lx, led.y - 28, 7, '#1a1428');
              if (Math.floor(api.t * 7) % 2 === 0) {
                c.globalAlpha = 0.40; g.circle(lx, led.y - 14, 24, '#9b102e'); c.globalAlpha = 1;
              }
            }
          }

          // Grab zone glow
          const grabY = H - 118;
          c.globalAlpha = 0.10 + 0.06 * Math.sin(api.t * 5);
          g.rect(0, grabY - 14, W, 28, '#9b5cff'); c.globalAlpha = 1;

          // Quasimodo carrying Esmeralda
          const vis = this.iframes <= 0 || Math.floor(this.iframes * 8) % 2 === 0;
          if (vis) {
            g.sprite(['.e.', 'eEe'], this.qx - 8, grabY - 38, { e: '#2a1a38', E: '#c8a060' }, 5);
            g.sprite(['.hh.', 'hffh', '.Hh.', 'h..h'],
              this.qx - 10, grabY - 24, { h: '#3a2818', f: '#c89058', H: '#482e5a' }, 5);
          }

          // Lane tap zone indicators at bottom
          for (let i = 0; i < 3; i++) {
            const lx2 = laneXs[i];
            c.globalAlpha = this.qlane === i ? 0.20 : 0.06;
            g.rect(lx2 - 42, H - 24, 84, 24, '#9b5cff'); c.globalAlpha = 1;
            api.txtC(['L', 'C', 'R'][i], lx2, H - 14, 8, '#b890f0');
          }

          api.topBar('SANCTUARY!');
          api.txt('GRABBED ' + this.grabbed + '/' + this.need, 6, 20, 9, '#9b5cff');
          for (let li = 0; li < 3; li++) g.rect(W - 50 + li * 17, 4, 12, 9, li < this.lives ? '#d4a017' : '#1a0e2a');
          g.rect(6, H - 32, W - 12, 4, '#1a1430');
          g.rect(6, H - 32, Math.round((W - 12) * Math.max(0, this.timer / 22)), 4, '#9b5cff');
          api.vignette();
        },
      },

      /* ════════════════════════════════════════════════════════════════
       * CHAPTER 4 — DEFEND NOTRE-DAME: drop stones on soldiers (24s)
       * ════════════════════════════════════════════════════════════════ */
      {
        id: 'defend', name: 'DEFEND NOTRE-DAME', sub: 'HOLD THE WALLS',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 3, 9, '#5a4868');
          g.rect(x - 3, y - 8, 3, 4, '#9b5cff');
          g.rect(x + 1, y - 8, 3, 4, '#9b5cff');
          g.rect(x - 3, y - 1, 6, 5, '#9b102e');
        },
        intro: [
          'FROLLO SENDS HIS SOLDIERS',
          'TO STORM THE CATHEDRAL.',
          'QUASIMODO HEAVES STONES',
          'from the high parapet.',
        ],
        quote: '"Notre-Dame fought like herself. She hurled her defenders at the assailants like a giant."',
        help: 'TAP a column to drop stones on the soldiers climbing below',
        winText: 'The soldiers break and flee. Paris, watching from the bridges, begins to murmur.',
        loseText: 'A soldier breaches the parapet. Quasimodo cannot hold them alone.',
        init(api) {
          this.lives = 3;
          this.timer = 24;
          this.cols = [54, 135, 216];
          this.soldiers = [];
          this.stones = [];
          this.spawnT = 1.1;
          this.repelled = 0;
        },
        update(api, dt) {
          this.timer -= dt;
          api.score = this.repelled * 10 + Math.floor(Math.max(0, 24 - this.timer) * 3);

          // Spawn soldiers climbing upward
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.soldiers.push({
              col: api.rint(0, 2),
              y: api.H - 28,
              speed: 21 + Math.max(0, 24 - this.timer) * 1.5,
            });
            this.spawnT = Math.max(0.46, 1.2 - Math.max(0, 24 - this.timer) * 0.034);
            api.audio.sfx('blip');
          }

          // Move soldiers up
          for (const sol of this.soldiers) sol.y -= sol.speed * dt;
          // Move stones down
          for (const st of this.stones) st.y += 275 * dt;

          // Collisions
          for (let si = this.soldiers.length - 1; si >= 0; si--) {
            const sol = this.soldiers[si];
            const sx = this.cols[sol.col];
            let hit = false;
            for (let sti = this.stones.length - 1; sti >= 0; sti--) {
              const st = this.stones[sti];
              if (st.col === sol.col && Math.abs(st.y - sol.y) < 24) {
                hit = true; this.stones.splice(sti, 1); break;
              }
            }
            if (hit) {
              this.repelled++;
              api.burst(sx, sol.y, '#d4a017', 8); api.audio.sfx('coin');
              this.soldiers.splice(si, 1);
            } else if (sol.y < 70) {
              this.lives--;
              api.shake(8, 0.30); api.flash('#9b102e', 0.25); api.audio.sfx('hurt');
              this.soldiers.splice(si, 1);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          this.stones = this.stones.filter(st => st.y < api.H + 28);

          // Tap to drop stone
          if (api.pointer.justDown) {
            let bestCol = 0, bestDist = 9999;
            for (let ci = 0; ci < this.cols.length; ci++) {
              const d = Math.abs(api.pointer.x - this.cols[ci]);
              if (d < bestDist) { bestDist = d; bestCol = ci; }
            }
            this.stones.push({ col: bestCol, x: this.cols[bestCol], y: 74 });
            api.audio.sfx('shoot');
          }

          if (this.timer <= 0) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#04020e');

          // Night sky
          g.rect(0, 0, W, 68, '#020108');
          for (let si = 0; si < 28; si++) {
            const sx = (si * 71 + 9) % W, sy = (si * 43 + 5) % 60;
            c.globalAlpha = 0.18 + 0.14 * Math.sin(api.t * 1.9 + si * 0.7);
            g.rect(sx, sy, 1, 1, '#c8b8e8'); c.globalAlpha = 1;
          }
          for (let bi = 0; bi < 8; bi++) {
            const bh = 10 + (bi * 27) % 12;
            g.rect(bi * 36 - 4, 68 - bh, 32, bh, '#04021a');
            if ((bi * 5) % 4 === 0) g.rect(bi * 36 + 4, 62 - bh, 8, 6, '#c8941a');
          }

          // Parapet
          g.rect(0, 68, W, 12, '#201636');
          for (let bni = 0; bni < 8; bni++) g.rect(bni * 36 - 2, 60, 24, 10, '#2c1e44');

          // Ladders + column guides
          for (let ci = 0; ci < this.cols.length; ci++) {
            const cx = this.cols[ci];
            c.globalAlpha = 0.10; g.rect(cx - 22, 80, 44, H - 80, '#9b5cff'); c.globalAlpha = 1;
            g.rect(cx - 3, 80, 6, H - 80, '#28183c');
            for (let ri = 80; ri < H; ri += 20) g.rect(cx - 18, ri, 36, 3, '#1c1028');
          }

          // Column tap hint
          for (let ci = 0; ci < this.cols.length; ci++) {
            const cx = this.cols[ci];
            c.globalAlpha = 0.08;
            g.rect(cx - 40, H - 22, 80, 22, '#9b5cff'); c.globalAlpha = 1;
            api.txtC('TAP', cx, H - 13, 7, '#9b5cff');
          }

          // Soldiers climbing
          for (const sol of this.soldiers) {
            const sx = this.cols[sol.col];
            g.sprite(['.ss.', 'sGGs', '.bb.', 'b..b'],
              sx - 10, sol.y - 18, { s: '#281c3a', G: '#9a6228', b: '#182814' }, 5);
          }

          // Falling stones
          for (const st of this.stones) {
            g.circle(st.x, st.y, 9, '#7a6888');
            g.circle(st.x - 2, st.y - 2, 4, '#9a88aa');
          }

          // Quasimodo on the parapet
          g.sprite(['.hh.', 'hffh', '.Hh.'],
            W / 2 - 10, 62, { h: '#3a2818', f: '#c89058', H: '#482e5a' }, 5);

          api.topBar('DEFEND NOTRE-DAME');
          api.txt('REPELLED ' + this.repelled, 6, 20, 9, '#d4a017');
          for (let li = 0; li < 3; li++) g.rect(W - 50 + li * 17, 4, 12, 9, li < this.lives ? '#9b5cff' : '#1a0c28');
          g.rect(6, H - 11, W - 12, 5, '#1a1430');
          g.rect(6, H - 11, Math.round((W - 12) * Math.max(0, this.timer / 24)), 5, '#d4a017');
          api.vignette();
        },
      },

      /* ════════════════════════════════════════════════════════════════
       * CHAPTER 5 — THE LAST BELL: pendulum timing (5 swings, 4 misses)
       * ════════════════════════════════════════════════════════════════ */
      {
        id: 'lastbell', name: 'THE LAST BELL', sub: 'SAVE ESMERALDA',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 1, y - 14, 2, 14, '#8a6028');
          g.circle(x, y + 3, 8, '#c8941a');
          g.circle(x - 2, y + 1, 3, '#e8c050');
        },
        intro: [
          'FROLLO HAS ESMERALDA',
          'AT THE GALLOWS.',
          'ONE MIGHTY SWING OF',
          'the great bell can free her.',
        ],
        quote: '"The enormous bell swung free and his great voice rang out like a trumpet over all Paris."',
        help: 'TAP when the pendulum is inside the GREEN ZONE — 5 strikes to save her',
        winText: 'The bell sweeps the scaffold away in an arc of gold. She is free. He weeps.',
        loseText: 'The bell swings wide again and again. The rope holds. All is lost.',
        init(api) {
          this.swings = 0;
          this.need = 5;
          this.misses = 0;
          this.maxMiss = 4;
          this.angle = -1.0;
          this.angVel = 1.25;
          this.angDir = 1;
          this.targetBand = 0.31;
          this.phase = 'swing';
          this.hitT = 0;
          this.hitGood = false;
        },
        update(api, dt) {
          api.score = this.swings * 20;

          if (this.phase === 'swing') {
            // Pendulum swings left-right
            this.angle += this.angDir * this.angVel * dt;
            if (this.angle > 1.08) { this.angle = 1.08; this.angDir = -1; }
            if (this.angle < -1.08) { this.angle = -1.08; this.angDir = 1; }

            if (api.confirm()) {
              if (Math.abs(this.angle) < this.targetBand) {
                // Hit — in the green zone
                this.swings++;
                api.score += 20;
                api.audio.sfx('coin');
                api.burst(api.W / 2 + Math.sin(this.angle) * 118,
                  80 + Math.cos(this.angle) * 118, '#d4a017', 14);
                api.flash('#d4a017', 0.32);
                this.hitGood = true;
                this.phase = 'pause'; this.hitT = 0.55;
                this.angVel = Math.min(3.0, this.angVel + 0.28);
                this.targetBand = Math.max(0.11, this.targetBand - 0.026);
                if (this.swings >= this.need) { api.score += 80; api.win(); }
              } else {
                // Miss — outside green zone
                this.misses++;
                api.shake(5, 0.24); api.flash('#9b102e', 0.22); api.audio.sfx('hurt');
                this.hitGood = false;
                this.phase = 'pause'; this.hitT = 0.44;
                if (this.misses >= this.maxMiss) { api.lose(); }
              }
            }
          } else {
            this.hitT -= dt;
            if (this.hitT <= 0) this.phase = 'swing';
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#04020c');

          // Bell tower brickwork
          for (let by = 0; by < H; by += 26) {
            for (let bx = 0; bx < W; bx += 32) {
              g.rect(bx + (Math.floor(by / 26) % 2) * 16, by, 30, 24, '#0c0a1c');
              g.rect(bx + (Math.floor(by / 26) % 2) * 16, by, 30, 1, '#16142a');
            }
          }

          // Arch window — stained glass
          const wx = W / 2;
          g.rect(wx - 34, 6, 68, 64, '#180e3a');
          c.fillStyle = '#180e3a';
          c.beginPath(); c.arc(wx, 38, 34, Math.PI, 0); c.fill();
          g.rect(wx - 26, 10, 52, 56, '#0a063e');
          c.fillStyle = '#0a063e';
          c.beginPath(); c.arc(wx, 36, 26, Math.PI, 0); c.fill();
          g.rect(wx - 2, 10, 4, 56, '#22085a');
          g.rect(wx - 26, 36, 52, 4, '#22085a');
          c.globalAlpha = 0.10 + 0.05 * Math.sin(api.t * 0.9);
          g.circle(wx, 32, 20, '#d4a017'); c.globalAlpha = 1;

          // Pendulum setup
          const pivX = W / 2, pivY = 84;
          const ropeLen = 118;
          const bellX = pivX + Math.sin(this.angle) * ropeLen;
          const bellY = pivY + Math.cos(this.angle) * ropeLen;

          // Green target zone arc
          c.save();
          c.beginPath();
          c.arc(pivX, pivY, ropeLen, -Math.PI / 2 - this.targetBand, -Math.PI / 2 + this.targetBand);
          c.lineWidth = 24; c.strokeStyle = 'rgba(60,200,60,.14)'; c.stroke();
          c.lineWidth = 2.5; c.strokeStyle = '#5dff8f'; c.stroke();
          c.restore();

          // Rope
          c.strokeStyle = '#7a6030'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(pivX, pivY); c.lineTo(bellX, bellY); c.stroke();

          // Bell
          const bc2 = this.phase === 'pause' ? (this.hitGood ? '#fff8a0' : '#ff6060') : '#d4a017';
          g.sprite(['..bbb..', '.bbbbb.', 'bbbbbbb', 'bbbbbbb', '.bbbbb.', '...b...'],
            bellX - 21, bellY - 10, { b: bc2 }, 6);

          // Pivot bracket
          g.rect(pivX - 7, pivY - 5, 14, 9, '#5a4820');
          g.circle(pivX, pivY, 4, '#8a6828');

          // Gallows (right side) — rescue target
          g.rect(W - 34, H - 108, 4, 62, '#4a3828');
          g.rect(W - 48, H - 108, 24, 4, '#4a3828');
          g.rect(W - 32, H - 108, 2, 10, '#7a5a38');
          g.circle(W - 31, H - 116, 6, '#c8a060');
          g.rect(W - 36, H - 110, 10, 16, '#7a3a7a');

          // Feedback overlay
          if (this.phase === 'pause') {
            api.txtC(this.hitGood ? 'PERFECT!' : 'TOO WIDE!', W / 2, H * 0.62,
              12, this.hitGood ? '#d4a017' : '#9b102e');
          } else {
            c.globalAlpha = 0.28 + 0.16 * Math.sin(api.t * 5.5);
            api.txtC('TAP!', W / 2, H * 0.74, 10, '#e8d8ff'); c.globalAlpha = 1;
          }

          api.topBar('THE LAST BELL');
          api.txt('STRIKES ' + this.swings + '/' + this.need, 6, 20, 9, '#d4a017');
          for (let mi = 0; mi < this.maxMiss; mi++) {
            g.rect(W - 58 + mi * 14, 4, 10, 8, mi >= this.misses ? '#9b5cff' : '#1a0a28');
          }
          api.vignette();
        },
      },

    ], // chapters
  }); // RetroSaga.create
})();
