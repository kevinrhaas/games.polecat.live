/* ============================================================================
 * JOURNEY TO THE CENTER OF THE EARTH — Jules Verne (1864)
 * Five chapters into the depths:
 *   1. THE CRATER       — descend Snæfellsjökull dodging falling rocks
 *   2. LIDENBROCK SEA   — steer the raft through the underground ocean
 *   3. THE GIANTS       — dodge battling prehistoric sea-beasts
 *   4. ELECTRIC STORM   — survive the magnetic thunderstorm on a raft
 *   5. THE ERUPTION     — ride the volcanic vent, time the pressure surges
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Palette ─── */
  const C = {
    ink:    '#0a0602',
    earth:  '#1c0e04',
    rock:   '#3a2010',
    stone:  '#5a3c1c',
    sand:   '#8a6030',
    amber:  '#c87a20',
    gold:   '#f0d080',
    lava:   '#ff5000',
    magma:  '#ff8020',
    sea:    '#0a4858',
    seaLt:  '#20a0b8',
    seaGl:  '#40c8d8',
    moss:   '#44aa44',
    glow:   '#88ffaa',
    bone:   '#d8c8a8',
    danger: '#cc2200',
    cream:  '#f0e8c8',
  };

  /* ─── Emblem: Verne's notebook compass ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Compass circle
    g.circle(cx, cy, 28, C.stone);
    g.circle(cx, cy, 26, C.earth);
    c.strokeStyle = C.amber; c.lineWidth = 2;
    c.beginPath(); c.arc(cx, cy, 26, 0, Math.PI * 2); c.stroke();
    // Cross hairs
    g.rect(cx - 1, cy - 22, 2, 44, C.rock);
    g.rect(cx - 22, cy - 1, 44, 2, C.rock);
    // Needle
    g.rect(cx - 1, cy - 20, 2, 20, C.danger);
    g.rect(cx - 1, cy, 2, 20, C.bone);
    g.circle(cx, cy, 4, C.amber);
    // N/S marks
    api.txtC('N', cx, cy - 24, 6, C.gold, true);
    api.txtC('S', cx, cy + 16, 6, C.bone, true);
    // Geological layers ring
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const lc = i % 2 === 0 ? C.amber : C.stone;
      g.rect(cx + Math.cos(a) * 22 - 2, cy + Math.sin(a) * 22 - 2, 4, 4, lc);
    }
  }

  /* ─── Scenery: cave cross-section ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Deep earth gradient background
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a0602');
    bg.addColorStop(0.4, '#140a04');
    bg.addColorStop(1, '#200808');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);

    // Geological strata bands
    const bands = [
      { y: 0.12, h: 0.06, col: '#1a1408' },
      { y: 0.22, h: 0.05, col: '#221408' },
      { y: 0.38, h: 0.07, col: '#2a1a0a' },
      { y: 0.55, h: 0.06, col: '#1a1020' },
      { y: 0.72, h: 0.08, col: '#2a0c06' },
    ];
    for (const b of bands) {
      c.fillStyle = b.col;
      c.fillRect(0, b.y * H, W, b.h * H);
      // Stratum border shimmer
      c.globalAlpha = 0.15 + 0.07 * Math.sin(t * 0.7);
      c.fillStyle = C.amber;
      c.fillRect(0, b.y * H, W, 1);
      c.globalAlpha = 1;
    }

    // Cave stalactites (top)
    c.fillStyle = '#241408';
    for (let i = 0; i < 9; i++) {
      const sx = (i * 32 + 8) % W;
      const sh = 16 + (i * 17 + 5) % 22;
      c.beginPath();
      c.moveTo(sx, 0); c.lineTo(sx + 14, 0); c.lineTo(sx + 7, sh); c.closePath();
      c.fill();
    }
    // Cave stalagmites (bottom)
    c.fillStyle = '#1e1006';
    for (let i = 0; i < 7; i++) {
      const sx = (i * 38 + 16) % W;
      const sh = 14 + (i * 23 + 7) % 20;
      c.beginPath();
      c.moveTo(sx, H); c.lineTo(sx + 16, H); c.lineTo(sx + 8, H - sh); c.closePath();
      c.fill();
    }

    // Glowing ore veins
    for (let i = 0; i < 6; i++) {
      const vx = (i * 44 + 20) % (W - 30);
      const vy = 80 + (i * 60 + 30) % (H - 160);
      c.globalAlpha = 0.12 + 0.08 * Math.sin(t * 1.2 + i * 1.1);
      g.rect(vx, vy, 2 + (i % 3), 18 + (i % 4) * 8, C.amber);
      c.globalAlpha = 1;
    }

    // Lava glow at the bottom (more intense at boot/menu)
    const lavaAlpha = scene === 'boot' || scene === 'menu' ? 0.22 : 0.12;
    const lavaGrad = c.createLinearGradient(0, H * 0.80, 0, H);
    lavaGrad.addColorStop(0, 'rgba(255,80,0,0)');
    lavaGrad.addColorStop(1, 'rgba(255,80,0,' + lavaAlpha + ')');
    c.fillStyle = lavaGrad;
    c.fillRect(0, Math.floor(H * 0.80), W, Math.floor(H * 0.20));

    // Animated ember sparks floating up
    for (let i = 0; i < 5; i++) {
      const ex = (i * 57 + 22) % W;
      const ey = H - ((t * 18 + i * 80) % (H * 0.5));
      c.globalAlpha = Math.max(0, 0.5 - ((H - ey) / (H * 0.5)));
      g.rect(ex, Math.round(ey), 2, 2, C.magma);
      c.globalAlpha = 1;
    }

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(10,6,2,.72)';
      c.fillRect(0, 0, W, H);
    }
  }

  /* ======================================================================
   * SAGA
   * ====================================================================== */
  RetroSaga.create({
    id: 'journeycenter',
    title: 'To the Center',
    subtitle: 'A JOURNEY TO THE CENTER OF THE EARTH',
    currency: 'FATHOMS',
    accent: '#c87a20',
    credit: 'A PIXEL TRIBUTE · JULES VERNE 1864',
    emblem,
    scenery,
    bootCta: 'TAP TO DESCEND',
    bootLine: '5 CHAPTERS · ONE EXPEDITION',
    menuLabel: 'CHOOSE YOUR DESCENT',
    menuHint: 'TAP A STAGE TO CONTINUE',
    menuDone: 'THE EARTH YIELDS ITS SECRETS',
    screens: {
      overlay:      'rgba(10,6,2,.84)',
      win:          '#f0d080',
      lose:         '#cc5500',
      chapterLabel: '#8a6030',
      name:         '#f0d080',
      sub:          '#c87a20',
      intro:        '#d8c8a0',
      quote:        '#8a7050',
      help:         '#c87a20',
      score:        '#d8c8a0',
      cur:          '#f0d080',
      cta:          '#d8c8a0',
    },
    labels: {
      chapter:  'DEPTH',
      score:    'METRES',
      win:      'DESCENDED FURTHER',
      lose:     'RETREAT TO THE SURFACE',
      cont:     'TAP TO PRESS DEEPER',
      finale:   'TAP FOR THE ERUPTION',
      toMenu:   'TAP TO RESURFACE',
      play:     'TAP TO BEGIN',
    },
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.gold, amber: C.amber, lava: C.lava, sea: C.sea, rock: C.rock },

    // Chapter-select: geological cross-section with 5 depth markers
    menu: {
      title(api, fathoms) {
        const W = api.W;
        api.txtC('TO THE CENTER', W / 2, 18, 12, C.gold, true);
        api.txtC('JULES VERNE · 1864', W / 2, 42, 8, C.sand);
        api.txtC('FATHOMS  ' + fathoms, W / 2, 58, 9, C.amber);
      },
      layout(api) {
        // Five depth stations down the left-center of a cross-section
        // Non-list: staggered left/right at increasing depth positions
        const positions = [
          { x: 22, y: 94,  w: 106, h: 44 },   // ch1 – left
          { x: 142, y: 148, w: 106, h: 44 },  // ch2 – right
          { x: 22, y: 202, w: 106, h: 44 },   // ch3 – left
          { x: 142, y: 256, w: 106, h: 44 },  // ch4 – right
          { x: 60, y: 316,  w: 150, h: 50 },  // ch5 – center (finale)
        ];
        return positions;
      },
      card(api, info) {
        const { ch, i, x, y, w, h, sel, done, best } = info;
        const g = api.gfx, c = api.ctx;
        const cx = x + w / 2, cy = y + h / 2;

        // Rock layer card
        const colors = ['#1a1408','#221808','#201008','#1a0e18','#280808'];
        const borders = [C.stone, C.sand, '#6a8040', '#4040a8', C.lava];
        c.fillStyle = sel ? '#2a1c08' : colors[i];
        c.fillRect(x, y, w, h);
        c.strokeStyle = sel ? C.gold : (done ? C.amber : borders[i]);
        c.lineWidth = sel ? 2 : 1;
        c.strokeRect(x, y, w, h);

        // Rock texture dots
        c.fillStyle = sel ? 'rgba(240,208,128,.08)' : 'rgba(255,255,255,.04)';
        for (let d = 0; d < 6; d++) {
          c.fillRect(x + 4 + (d * 17) % (w - 8), y + 6 + (d * 11) % (h - 12), 2, 2);
        }

        // Depth marker line on left edge
        const depthColors = [C.stone, C.amber, '#6a8040', '#4050a0', C.lava];
        g.rect(x, y, 4, h, done ? C.amber : depthColors[i]);

        // Chapter icon
        if (ch.icon) ch.icon(api, x + 20, cy - 2);

        // Name & depth label
        const nameX = x + 34;
        const nameW = w - 38;
        api.txtCFit(ch.name, x + nameW / 2 + 34, y + 10, 8, done ? C.gold : C.cream, false, nameW - 8);
        api.txtCFit(ch.sub || '', x + nameW / 2 + 34, y + 24, 7, done ? C.amber : C.sand, false, nameW - 8);

        if (done) {
          api.txtC('✓ ' + best + 'm', x + w - 28, y + 10, 7, C.gold);
        } else if (sel) {
          api.txtC('▶', x + w - 12, cy - 5, 11, C.cream);
        }

        // Depth number badge
        const depths = ['2km','20km','160km','200km','6400km'];
        api.txtC(depths[i], x + 20, cy + 12, 7, done ? C.amber : C.stone);
      },
    },

    finale: [
      'THE EARTH HAS NO MORE SECRETS.',
      'PROFESSOR LIDENBROCK',
      'HAS REACHED THE CENTER',
      '— AND RETURNED TO TELL IT.',
      '',
      'SCIENCE TRIUMPHS.',
    ],
    tagline: 'A POLECAT ARCADE TRIBUTE',

    chapters: [

      /* ============================
       * CHAPTER 1 — THE CRATER
       * Descend Snæfellsjökull dodging falling rocks
       * Dodge/steer: drag or arrow keys to move left/right
       * Win: survive 24 seconds. Lose: 3 hits.
       * ============================ */
      {
        id: 'crater',
        name: 'THE CRATER',
        sub: 'INTO SNÆFELLSJÖKULL',
        icon(api, x, y) {
          const g = api.gfx;
          // Triangle mountain with crack
          g.rect(x - 9, y + 2, 18, 8, C.stone);
          g.rect(x - 6, y - 4, 12, 8, C.sand);
          g.rect(x - 3, y - 9, 6, 6, C.bone);
          // Crater opening
          g.rect(x - 4, y + 2, 8, 3, C.ink);
          g.rect(x - 1, y + 4, 2, 6, C.lava);
        },
        intro: [
          'JUNE, 1863.',
          'PROFESSOR LIDENBROCK',
          'FINDS THE ANCIENT RUNE.',
          'The crater of Snæfells',
          'opens its mouth to',
          'the bowels of the Earth.',
        ],
        quote: 'Descend into the crater of Snæfells, bold traveller, and you will reach the centre of the Earth.',
        help: 'DRAG or use ARROWS to dodge falling rocks · survive the descent',
        winText: 'The passage holds. Deeper into the living Earth you go.',
        loseText: 'The falling rocks drive you back. The mountain keeps its secret.',
        init(api) {
          this.px = api.W / 2;
          this.py = Math.floor(api.H * 0.70);
          this.timer = 24;
          this.rocks = [];
          this.spawnT = 0.6;
          this.hits = 0;
          this.maxHits = 3;
          this.iframes = 0;
          this.scrollY = 0;
          this.coins = [];
          this.coinT = 1.5;
          this.depth = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.iframes = Math.max(0, this.iframes - dt);
          this.spawnT -= dt;
          this.coinT -= dt;
          this.depth += dt * 40;

          // Move explorer
          let moving = false;
          if (api.pointer.down) {
            this.px += (api.pointer.x - this.px) * 0.20 * f;
            this.py += (api.pointer.y - this.py) * 0.20 * f;
            moving = true;
          }
          if (api.keyDown('left'))  { this.px -= 3.2 * f; moving = true; }
          if (api.keyDown('right')) { this.px += 3.2 * f; moving = true; }
          if (api.keyDown('up'))    { this.py -= 2.4 * f; moving = true; }
          if (api.keyDown('down'))  { this.py += 2.4 * f; moving = true; }
          this.px = clamp(this.px, 14, api.W - 14);
          this.py = clamp(this.py, 30, api.H - 30);

          // Spawn rocks (falling down)
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.42, 0.80);
            const big = api.chance(0.28);
            this.rocks.push({
              x: api.rnd(12, api.W - 12),
              y: -18,
              vy: api.rnd(1.8, 2.8) * (1 + (24 - Math.max(0, this.timer)) * 0.025),
              r: big ? 13 : 8,
            });
          }

          // Spawn gems to collect
          if (this.coinT <= 0) {
            this.coinT = api.rnd(1.2, 2.2);
            this.coins.push({ x: api.rnd(16, api.W - 16), y: -10, vy: 1.1, taken: false });
          }

          // Move rocks
          for (const r of this.rocks) r.y += r.vy * f;
          this.rocks = this.rocks.filter(r => r.y < api.H + 24);

          // Move gems
          for (const coin of this.coins) coin.y += coin.vy * f;
          this.coins = this.coins.filter(c => c.y < api.H + 16 && !c.taken);

          // Collect gems
          for (const coin of this.coins) {
            if (!coin.taken && Math.hypot(coin.x - this.px, coin.y - this.py) < 18) {
              coin.taken = true;
              api.score += 18;
              api.audio.sfx('coin');
              api.burst(coin.x, coin.y, C.gold, 7);
            }
          }

          // Hit by rocks
          if (this.iframes <= 0) {
            for (const r of this.rocks) {
              if (Math.hypot(r.x - this.px, r.y - this.py) < r.r + 9) {
                this.hits++;
                r.y = api.H + 100;
                this.iframes = 1.3;
                api.shake(5, 0.25);
                api.flash('#ff5000', 0.14);
                api.audio.sfx('hurt');
                if (this.hits >= this.maxHits) { api.lose(); return; }
              }
            }
          }

          api.score = Math.max(api.score, Math.floor(this.depth));
          if (this.timer <= 0) { api.score += 100; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          // Dark volcanic shaft
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#14100c');
          bg.addColorStop(1, '#1a0c06');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // Shaft walls
          g.rect(0, 0, 18, H, '#1c1208');
          g.rect(W - 18, 0, 18, H, '#1c1208');
          g.rect(0, 0, 4, H, '#2e1e0c');
          g.rect(W - 4, 0, 4, H, '#2e1e0c');

          // Scrolling rock texture on walls
          const scrollOff = (api.t * 22) % 48;
          for (let i = 0; i < 7; i++) {
            const yy = (i * 48 - scrollOff + 48) % (H + 48) - 48;
            g.rect(4, Math.round(yy), 10, 6, '#261a0e');
            g.rect(W - 14, Math.round(yy + 22), 10, 6, '#261a0e');
          }

          // Glowing moss patches on walls
          for (let i = 0; i < 4; i++) {
            const my = ((i * 90 + api.t * 8) % (H + 30)) - 15;
            c.globalAlpha = 0.28;
            g.rect(3, Math.round(my), 8, 4, C.moss);
            g.rect(W - 11, Math.round(my + 45), 8, 4, C.moss);
            c.globalAlpha = 1;
          }

          // Rocks
          for (const r of this.rocks) {
            const rx = Math.round(r.x), ry = Math.round(r.y);
            g.circle(rx, ry, r.r, C.rock);
            g.circle(rx - 2, ry - 2, Math.max(2, r.r - 4), C.stone);
          }

          // Gems (ore crystals)
          for (const coin of this.coins) {
            if (coin.taken) continue;
            const cx2 = Math.round(coin.x), cy2 = Math.round(coin.y);
            const pulse = 0.6 + 0.4 * Math.sin(api.t * 3 + coin.x * 0.1);
            c.globalAlpha = pulse;
            g.rect(cx2 - 5, cy2 - 6, 10, 10, C.amber);
            g.rect(cx2 - 3, cy2 - 4, 6, 6, C.gold);
            c.globalAlpha = 1;
          }

          // Explorer (Axel)
          const px = Math.round(this.px), py = Math.round(this.py);
          const blink = this.iframes > 0 && Math.floor(api.t * 8) % 2 === 0;
          if (!blink) {
            g.rect(px - 5, py - 20, 10, 20, '#4a6090');
            g.circle(px, py - 24, 7, '#c8a07a');
            g.rect(px - 5, py - 28, 10, 6, '#6a5030');
            // Lantern
            g.rect(px + 4, py - 16, 6, 8, C.gold);
            c.globalAlpha = 0.22;
            g.circle(px + 7, py - 12, 12, C.gold);
            c.globalAlpha = 1;
          }

          // Lives
          for (let i = 0; i < this.maxHits; i++) {
            g.circle(W - 12 - i * 16, 22, 5, i < (this.maxHits - this.hits) ? C.moss : '#2a1008');
          }

          // Timer bar
          g.rect(6, H - 11, W - 12, 5, '#1a1208');
          g.rect(6, H - 11, (W - 12) * clamp(this.timer / 24, 0, 1), 5, C.amber);

          api.topBar('THE CRATER');
          api.txt('DEPTH  ' + Math.floor(this.depth) + 'm', 6, 20, 9, C.amber);
          api.vignette(); api.scanlines();
        },
      },

      /* ============================
       * CHAPTER 2 — LIDENBROCK SEA
       * Steer the raft left/right dodging sea hazards for 26 seconds
       * ============================ */
      {
        id: 'sea',
        name: 'LIDENBROCK SEA',
        sub: 'THE UNDERGROUND OCEAN',
        icon(api, x, y) {
          const g = api.gfx;
          // Simple raft on water
          g.rect(x - 8, y + 2, 16, 4, '#8a5020');
          g.rect(x - 1, y - 6, 2, 10, '#c87a20');
          g.rect(x - 6, y - 6, 12, 6, '#d8c8a0');
          // Water
          g.rect(x - 10, y + 6, 20, 3, C.seaLt);
        },
        intro: [
          'BEYOND THE LAVA TUNNELS',
          'LIES A VAST OCEAN',
          'INSIDE THE EARTH.',
          'Mushroom forests on the',
          'shore, pale light from',
          'the cave ceiling above.',
        ],
        quote: 'The sea called Lidenbrock, of which no navigator has yet taken the soundings.',
        help: 'DRAG or ARROWS left/right to steer the raft · dodge rocks and sea creatures',
        winText: 'The far shore! The raft holds. You push deeper into the abyss.',
        loseText: 'The raft is wrecked. You swim to shore and try again.',
        init(api) {
          this.rx = api.W / 2;
          this.ry = Math.floor(api.H * 0.68);
          this.timer = 26;
          this.obs = [];
          this.spawnT = 0.7;
          this.hits = 0;
          this.maxHits = 3;
          this.iframes = 0;
          this.waveOff = 0;
          this.dist = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.iframes = Math.max(0, this.iframes - dt);
          this.spawnT -= dt;
          this.waveOff += dt * 0.9;
          this.dist += dt * 55;

          // Steer raft
          if (api.pointer.down) {
            this.rx += (api.pointer.x - this.rx) * 0.16 * f;
          }
          if (api.keyDown('left'))  this.rx -= 3.0 * f;
          if (api.keyDown('right')) this.rx += 3.0 * f;
          this.rx = clamp(this.rx, 22, api.W - 22);

          // Spawn obstacles scrolling upward from the bottom
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.45, 0.82);
            const type = api.rint(0, 2); // 0=rock, 1=tentacle, 2=log
            this.obs.push({
              x: api.rnd(20, api.W - 20),
              y: api.H + 20,
              vy: -(api.rnd(1.6, 2.6) * (1 + (26 - Math.max(0, this.timer)) * 0.022)),
              type,
              w: type === 1 ? 8 : 14,
            });
          }

          // Move obstacles upward (world scrolling toward player)
          for (const o of this.obs) o.y += o.vy * f;
          this.obs = this.obs.filter(o => o.y > -30);

          // Hit detection
          if (this.iframes <= 0) {
            for (const o of this.obs) {
              if (Math.hypot(o.x - this.rx, o.y - this.ry) < o.w + 12) {
                this.hits++;
                o.y = -100;
                this.iframes = 1.2;
                api.shake(5, 0.22);
                api.flash(C.sea, 0.15);
                api.audio.sfx('hurt');
                if (this.hits >= this.maxHits) { api.lose(); return; }
              }
            }
          }

          api.score = Math.max(api.score, Math.floor(this.dist));
          if (this.timer <= 0) { api.score += 100; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          // Underground sky/ceiling
          const ceiling = c.createLinearGradient(0, 0, 0, H * 0.35);
          ceiling.addColorStop(0, '#0a1420');
          ceiling.addColorStop(1, '#06101a');
          c.fillStyle = ceiling; c.fillRect(0, 0, W, Math.floor(H * 0.35));

          // Bioluminescent ceiling crystals
          for (let i = 0; i < 12; i++) {
            const cx2 = (i * 24 + 10) % W;
            const cr = 2 + (i % 3);
            const pulse = 0.5 + 0.5 * Math.sin(api.t * 1.1 + i * 0.8);
            c.globalAlpha = 0.2 + 0.2 * pulse;
            g.circle(cx2, 6 + (i % 4) * 4, cr, C.seaGl);
            c.globalAlpha = 1;
          }

          // Ocean surface
          const seaTop = Math.floor(H * 0.35);
          const seaBot = H;
          const seaGrad = c.createLinearGradient(0, seaTop, 0, seaBot);
          seaGrad.addColorStop(0, '#0a3040');
          seaGrad.addColorStop(0.6, '#061828');
          seaGrad.addColorStop(1, '#040c18');
          c.fillStyle = seaGrad; c.fillRect(0, seaTop, W, seaBot - seaTop);

          // Wave lines
          for (let i = 0; i < 8; i++) {
            const wy = seaTop + 8 + i * 18;
            const off = Math.sin(api.t * 1.4 + i * 0.7) * 6;
            c.globalAlpha = 0.12 + 0.06 * Math.sin(api.t + i);
            g.rect(Math.round(off), wy, W - 6, 2, C.seaGl);
            c.globalAlpha = 1;
          }

          // Mushroom forest on left shore hint
          for (let i = 0; i < 3; i++) {
            const mx = 2 + i * 8;
            const mh = 24 + i * 12;
            g.rect(mx, H - mh, 5, mh, '#4a2a50');
            g.circle(mx + 2, H - mh - 6, 8 + i * 2, '#7a3a90');
          }

          // Obstacles
          for (const o of this.obs) {
            const ox = Math.round(o.x), oy = Math.round(o.y);
            if (o.type === 0) {
              // Rock
              g.circle(ox, oy, 10, C.rock);
              g.circle(ox - 2, oy - 2, 6, C.stone);
            } else if (o.type === 1) {
              // Tentacle
              g.rect(ox - 4, oy - 20, 8, 26, '#2a1040');
              g.rect(ox - 6, oy - 4, 12, 8, '#3a1858');
            } else {
              // Floating log
              g.rect(ox - 16, oy - 4, 32, 8, '#5a3010');
              g.rect(ox - 14, oy - 2, 28, 4, '#7a4820');
            }
          }

          // Raft
          const rx = Math.round(this.rx), ry = Math.round(this.ry);
          const blink = this.iframes > 0 && Math.floor(api.t * 8) % 2 === 0;
          if (!blink) {
            g.rect(rx - 18, ry + 4, 36, 8, '#7a4820');
            g.rect(rx - 14, ry + 2, 28, 6, '#9a6030');
            // Mast & sail
            g.rect(rx - 1, ry - 20, 2, 26, '#5a3010');
            g.rect(rx - 8, ry - 20, 16, 14, '#d0c8a0');
            // Professor silhouette
            g.rect(rx - 5, ry - 10, 10, 16, '#1a2840');
            g.circle(rx, ry - 14, 6, '#c0a080');
          }

          // Lives
          for (let i = 0; i < this.maxHits; i++) {
            g.rect(W - 14 - i * 14, 20, 10, 7, i < (this.maxHits - this.hits) ? C.seaLt : '#0a1828');
          }

          // Timer bar
          g.rect(6, H - 11, W - 12, 5, '#060e18');
          g.rect(6, H - 11, (W - 12) * clamp(this.timer / 26, 0, 1), 5, C.seaGl);

          api.topBar('LIDENBROCK SEA');
          api.txt('LEAGUES  ' + Math.floor(this.dist / 50), 6, 20, 9, C.seaGl);
          api.vignette(); api.scanlines();
        },
      },

      /* ============================
       * CHAPTER 3 — THE GIANTS
       * Dodge the battling prehistoric sea-beasts
       * Free-move (drag/arrows), collect bones for score
       * Survive 22 seconds, 3 lives
       * ============================ */
      {
        id: 'giants',
        name: 'THE GIANTS',
        sub: 'PREHISTORIC BEASTS',
        icon(api, x, y) {
          const g = api.gfx;
          // Simple sea serpent
          g.rect(x - 10, y - 2, 20, 8, '#2a5030');
          g.circle(x + 10, y, 6, '#2a5030');
          g.rect(x + 14, y - 1, 4, 2, '#cc2200');
          // Teeth
          for (let t = 0; t < 3; t++) g.rect(x - 8 + t * 8, y - 5, 3, 3, C.bone);
        },
        intro: [
          'ON THE PREHISTORIC SEA',
          'TWO MONSTERS BATTLE:',
          'ICHTHYOSAURUS VS PLESIOSAURUS.',
          'The blows shake the ocean.',
          'Their bodies sweep the',
          'water — and your raft.',
        ],
        quote: 'The combat of these two monsters of the deep was most terrible to behold.',
        help: 'DRAG or ARROWS to dodge the battling beasts · collect fossil bones',
        winText: 'The beasts exhaust each other and sink. The sea is yours again.',
        loseText: 'A sweeping tail capsizes the raft. You cling to wreckage.',
        init(api) {
          this.px = api.W / 2;
          this.py = Math.floor(api.H * 0.55);
          this.timer = 22;
          this.iframes = 0;
          this.hits = 0;
          this.maxHits = 3;
          // Ichthyosaurus: horizontal sweep
          this.ichy = {
            x: -60, y: api.H * 0.40, vy: 0,
            spd: 1.5, dir: 1, swingT: 0,
          };
          // Plesiosaurus: oval patrol
          this.plesi = {
            angle: 0, cx: api.W / 2, cy: api.H * 0.28, rx: 80, ry: 40,
            spd: 0.55,
          };
          this.bones = [];
          this.boneT = 1.4;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.iframes = Math.max(0, this.iframes - dt);
          this.boneT -= dt;

          // Move player
          if (api.pointer.down) {
            this.px += (api.pointer.x - this.px) * 0.18 * f;
            this.py += (api.pointer.y - this.py) * 0.18 * f;
          }
          if (api.keyDown('left'))  this.px -= 2.8 * f;
          if (api.keyDown('right')) this.px += 2.8 * f;
          if (api.keyDown('up'))    this.py -= 2.8 * f;
          if (api.keyDown('down'))  this.py += 2.8 * f;
          this.px = clamp(this.px, 14, api.W - 14);
          this.py = clamp(this.py, 36, api.H - 28);

          // Move Ichthyosaurus (charges across)
          this.ichy.x += this.ichy.dir * this.ichy.spd * f;
          this.ichy.swingT += dt;
          this.ichy.y = api.H * 0.40 + Math.sin(this.ichy.swingT * 0.8) * 44;
          if (this.ichy.x > api.W + 80) { this.ichy.dir = -1; this.ichy.spd = Math.min(2.8, this.ichy.spd + 0.10); }
          if (this.ichy.x < -80) { this.ichy.dir = 1; this.ichy.spd = Math.min(2.8, this.ichy.spd + 0.10); }

          // Move Plesiosaurus (oval)
          this.plesi.angle += this.plesi.spd * dt;
          this.plesi.spd = Math.min(1.2, this.plesi.spd + dt * 0.006);
          const px2 = this.plesi.cx + Math.cos(this.plesi.angle) * this.plesi.rx;
          const py2 = this.plesi.cy + Math.sin(this.plesi.angle) * this.plesi.ry;

          // Spawn bone collectibles
          if (this.boneT <= 0) {
            this.boneT = api.rnd(1.2, 2.4);
            this.bones.push({ x: api.rnd(20, api.W - 20), y: api.rnd(60, api.H - 60), taken: false, life: 3.5 });
          }
          for (const b of this.bones) b.life -= dt;
          this.bones = this.bones.filter(b => b.life > 0 && !b.taken);
          for (const b of this.bones) {
            if (!b.taken && Math.hypot(b.x - this.px, b.y - this.py) < 18) {
              b.taken = true;
              api.score += 20;
              api.audio.sfx('coin');
              api.burst(b.x, b.y, C.bone, 8);
            }
          }

          // Collision with Ichthyosaurus body
          if (this.iframes <= 0) {
            const ix = this.ichy.x, iy = Math.round(this.ichy.y);
            if (Math.abs(this.px - ix) < 44 && Math.abs(this.py - iy) < 18) {
              this.hits++;
              this.iframes = 1.4;
              api.shake(6, 0.28); api.flash('#2a5030', 0.15); api.audio.sfx('hurt');
              if (this.hits >= this.maxHits) { api.lose(); return; }
            }
            // Collision with Plesiosaurus
            if (Math.hypot(px2 - this.px, py2 - this.py) < 30) {
              this.hits++;
              this.iframes = 1.4;
              api.shake(6, 0.28); api.flash('#2a5030', 0.15); api.audio.sfx('hurt');
              if (this.hits >= this.maxHits) { api.lose(); return; }
            }
          }

          api.score = Math.max(api.score, Math.floor((22 - Math.max(0, this.timer)) * 8));
          if (this.timer <= 0) { api.score += 100; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          // Dark underground sea
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#060e18');
          bg.addColorStop(1, '#04080e');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // Subtle wave lines
          for (let i = 0; i < 6; i++) {
            const wy = 36 + i * 28;
            c.globalAlpha = 0.07 + 0.04 * Math.sin(api.t * 0.8 + i);
            g.rect(0, wy, W, 1, C.seaLt);
            c.globalAlpha = 1;
          }

          // Bones collectibles
          for (const b of this.bones) {
            if (b.taken) continue;
            const pulse = 0.6 + 0.4 * Math.sin(api.t * 2.5 + b.x * 0.1);
            c.globalAlpha = pulse;
            g.rect(b.x - 6, b.y - 2, 12, 4, C.bone);
            g.circle(b.x - 7, b.y, 4, C.bone);
            g.circle(b.x + 7, b.y, 4, C.bone);
            c.globalAlpha = 1;
          }

          // Ichthyosaurus (dolphin/fish-like)
          const ix = Math.round(this.ichy.x), iy = Math.round(this.ichy.y);
          const iDir = this.ichy.dir;
          if (ix > -90 && ix < W + 90) {
            // Body
            g.rect(ix - 44 * iDir, iy - 12, 88, 24, '#1a4028');
            // Head
            g.circle(ix + 46 * iDir, iy, 16, '#1e4a30');
            // Eye
            g.circle(ix + 50 * iDir, iy - 4, 3, C.bone);
            // Tail fin
            c.fillStyle = '#162e1e';
            c.beginPath();
            c.moveTo(ix - 46 * iDir, iy - 4);
            c.lineTo(ix - 64 * iDir, iy - 20);
            c.lineTo(ix - 64 * iDir, iy + 20);
            c.closePath();
            c.fill();
            // Dorsal fin
            c.fillStyle = '#1a3822';
            c.beginPath();
            c.moveTo(ix, iy - 12);
            c.lineTo(ix + 12 * iDir, iy - 30);
            c.lineTo(ix + 24 * iDir, iy - 12);
            c.closePath();
            c.fill();
          }

          // Plesiosaurus (long neck)
          const px2 = Math.round(this.plesi.cx + Math.cos(this.plesi.angle) * this.plesi.rx);
          const py2 = Math.round(this.plesi.cy + Math.sin(this.plesi.angle) * this.plesi.ry);
          // Body
          g.circle(px2, py2, 22, '#2a3820');
          // Long neck to head
          const neckEnd = { x: px2 + Math.cos(this.plesi.angle + 0.8) * 36, y: py2 + Math.sin(this.plesi.angle + 0.8) * 36 };
          g.rect(
            Math.round(Math.min(px2, neckEnd.x)) - 4,
            Math.round(Math.min(py2, neckEnd.y)) - 4,
            Math.abs(neckEnd.x - px2) + 8,
            Math.abs(neckEnd.y - py2) + 8,
            '#233020'
          );
          g.circle(Math.round(neckEnd.x), Math.round(neckEnd.y), 10, '#2a4028');
          // Flippers
          g.rect(px2 - 30, py2 - 6, 16, 10, '#1a2a18');
          g.rect(px2 + 14, py2 - 6, 16, 10, '#1a2a18');

          // Player (explorer)
          const blink = this.iframes > 0 && Math.floor(api.t * 8) % 2 === 0;
          if (!blink) {
            const ppx = Math.round(this.px), ppy = Math.round(this.py);
            g.rect(ppx - 18, ppy, 36, 8, '#7a4820');
            g.rect(ppx - 14, ppy - 2, 28, 6, '#9a6030');
            g.rect(ppx - 5, ppy - 18, 10, 20, '#1a2840');
            g.circle(ppx, ppy - 22, 6, '#c0a080');
          }

          // Lives
          for (let i = 0; i < this.maxHits; i++) {
            g.circle(W - 12 - i * 16, 22, 5, i < (this.maxHits - this.hits) ? '#6aaa60' : '#0a1808');
          }

          // Timer bar
          g.rect(6, H - 11, W - 12, 5, '#060e18');
          g.rect(6, H - 11, (W - 12) * clamp(this.timer / 22, 0, 1), 5, '#44aa44');

          api.topBar('THE GIANTS');
          api.txt('SURVIVED ' + Math.floor(22 - Math.max(0, this.timer)) + 's', 6, 20, 9, '#6aaa60');
          api.vignette(); api.scanlines();
        },
      },

      /* ============================
       * CHAPTER 4 — ELECTRIC STORM
       * Underground electromagnetic storm — lightning strikes in columns
       * Dodge left/right; survive 26 seconds; 3 lives
       * ============================ */
      {
        id: 'storm',
        name: 'ELECTRIC STORM',
        sub: 'THE MAGNETIC TEMPEST',
        icon(api, x, y) {
          const g = api.gfx;
          // Lightning bolt
          g.rect(x + 2, y - 10, 4, 8, '#ffe040');
          g.rect(x - 2, y - 2, 4, 8, '#ffe040');
          g.rect(x - 5, y + 6, 8, 4, '#ffe040');
          c2(api.ctx, x - 1, y - 3, 3, '#ff8020');
          function c2(ctx, cx, cy, r, col) { g.circle(cx, cy, r, col); }
        },
        intro: [
          'A MAGNETIC STORM',
          'STRIKES THE CAVERN.',
          'LIGHTNING IGNITES THE GAS.',
          'The compass spins mad.',
          'Hans lashes the raft.',
          'Survive until the calm.',
        ],
        quote: 'The electric ball played over the mast, whilst the sea glowed and sparkled like a bed of flame.',
        help: 'DRAG or ARROWS left/right to dodge lightning columns',
        winText: 'The storm passes. The compass settles. You sail on.',
        loseText: 'The lightning finds you. Rest, and the sea will calm.',
        init(api) {
          this.px = api.W / 2;
          this.py = Math.floor(api.H * 0.65);
          this.timer = 26;
          this.hits = 0;
          this.maxHits = 3;
          this.iframes = 0;
          this.bolts = [];
          this.boltT = 1.0;
          this.sparks = [];
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.iframes = Math.max(0, this.iframes - dt);
          this.boltT -= dt;

          // Move raft
          if (api.pointer.down) {
            this.px += (api.pointer.x - this.px) * 0.22 * f;
          }
          if (api.keyDown('left'))  this.px -= 3.4 * f;
          if (api.keyDown('right')) this.px += 3.4 * f;
          this.px = clamp(this.px, 22, api.W - 22);

          // Spawn lightning (telegraphed warning, then strike)
          if (this.boltT <= 0) {
            const intensity = 1 + (26 - Math.max(0, this.timer)) * 0.03;
            this.boltT = Math.max(0.42, api.rnd(0.7, 1.2) / intensity);
            const count = api.chance(0.30) ? 2 : 1;
            for (let b = 0; b < count; b++) {
              this.bolts.push({
                x: api.rnd(18, api.W - 18),
                phase: 'warn',
                warnT: 0.55,
                strikeT: 0,
              });
            }
            api.audio.sfx('blip');
          }

          // Update bolts
          for (const bolt of this.bolts) {
            if (bolt.phase === 'warn') {
              bolt.warnT -= dt;
              if (bolt.warnT <= 0) {
                bolt.phase = 'strike';
                bolt.strikeT = 0.22;
                // Spawn sparks
                for (let s = 0; s < 8; s++) {
                  this.sparks.push({ x: bolt.x, y: api.rnd(20, this.py - 10), vx: api.rnd(-2, 2), vy: api.rnd(-3, 1), life: 0.5 });
                }
                api.audio.sfx('power');
              }
            } else {
              bolt.strikeT -= dt;
            }
          }
          // Update sparks
          for (const s of this.sparks) {
            s.x += s.vx; s.y += s.vy; s.vy += 0.12; s.life -= dt;
          }
          this.sparks = this.sparks.filter(s => s.life > 0);
          this.bolts = this.bolts.filter(b => !(b.phase === 'strike' && b.strikeT <= 0));

          // Hit by lightning
          if (this.iframes <= 0) {
            for (const bolt of this.bolts) {
              if (bolt.phase === 'strike') {
                if (Math.abs(bolt.x - this.px) < 22) {
                  this.hits++;
                  this.iframes = 1.2;
                  api.shake(8, 0.3);
                  api.flash('#ffe040', 0.2);
                  api.audio.sfx('hurt');
                  if (this.hits >= this.maxHits) { api.lose(); return; }
                }
              }
            }
          }

          api.score = Math.max(api.score, Math.floor((26 - Math.max(0, this.timer)) * 10));
          if (this.timer <= 0) { api.score += 100; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          // Storm sky
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#0c0a10');
          bg.addColorStop(0.5, '#080810');
          bg.addColorStop(1, '#0a0610');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // Cave walls
          g.rect(0, 0, 14, H, '#14100a');
          g.rect(W - 14, 0, 14, H, '#14100a');

          // Swirling electrical clouds
          for (let i = 0; i < 5; i++) {
            const cxc = (i * 56 + api.t * 11 * (i % 2 ? 1 : -1)) % W;
            const cyc = 40 + i * 28;
            c.globalAlpha = 0.10 + 0.06 * Math.sin(api.t * 2 + i);
            g.circle(Math.round(cxc), cyc, 28, '#3030c0');
            c.globalAlpha = 1;
          }

          // Warn columns (red glow where bolt will hit)
          for (const bolt of this.bolts) {
            if (bolt.phase === 'warn') {
              const alpha = (0.55 - bolt.warnT) / 0.55;
              c.globalAlpha = alpha * 0.35;
              g.rect(bolt.x - 16, 0, 32, H, '#ff4000');
              c.globalAlpha = alpha * 0.6;
              g.rect(bolt.x - 4, 0, 8, H, '#ff8020');
              c.globalAlpha = 1;
            }
          }

          // Lightning strikes
          for (const bolt of this.bolts) {
            if (bolt.phase === 'strike') {
              // Full bolt from top to raft
              const segments = 10;
              let lx = bolt.x, ly = 0;
              c.strokeStyle = '#ffffa0';
              c.lineWidth = 3;
              c.beginPath(); c.moveTo(lx, ly);
              for (let s = 0; s < segments; s++) {
                lx += api.rnd(-8, 8);
                ly += (this.py / segments);
                c.lineTo(Math.round(lx), Math.round(ly));
              }
              c.stroke();
              // Core flash
              c.strokeStyle = '#ffffff';
              c.lineWidth = 1;
              c.stroke();
              c.globalAlpha = 0.4;
              g.rect(bolt.x - 20, 0, 40, H, '#ffffa0');
              c.globalAlpha = 1;
            }
          }

          // Sparks
          for (const s of this.sparks) {
            c.globalAlpha = Math.max(0, s.life / 0.5);
            g.rect(Math.round(s.x), Math.round(s.y), 2, 2, '#ffe040');
            c.globalAlpha = 1;
          }

          // Underground sea (bottom)
          const seaY = Math.floor(H * 0.72);
          const seaGrad = c.createLinearGradient(0, seaY, 0, H);
          seaGrad.addColorStop(0, '#0a2838');
          seaGrad.addColorStop(1, '#051018');
          c.fillStyle = seaGrad;
          c.fillRect(0, seaY, W, H - seaY);
          // Phosphorescent waves (excited by the electricity)
          for (let i = 0; i < 4; i++) {
            const wy = seaY + 4 + i * 8;
            const off = Math.sin(api.t * 2.4 + i * 1.1) * 8;
            c.globalAlpha = 0.2;
            g.rect(Math.round(off), wy, W - 6, 2, '#60e8ff');
            c.globalAlpha = 1;
          }

          // Raft
          const rpx = Math.round(this.px), rpy = Math.round(this.py);
          const blink = this.iframes > 0 && Math.floor(api.t * 8) % 2 === 0;
          if (!blink) {
            g.rect(rpx - 20, rpy + 4, 40, 8, '#5a3010');
            g.rect(rpx - 16, rpy + 2, 32, 6, '#7a4820');
            g.rect(rpx - 5, rpy - 16, 10, 20, '#1a2840');
            g.circle(rpx, rpy - 20, 6, '#c0a080');
            // St. Elmo's fire glow on mast
            c.globalAlpha = 0.6 + 0.4 * Math.sin(api.t * 8);
            g.circle(rpx, rpy - 18, 4, '#80a0ff');
            c.globalAlpha = 1;
          }

          // Lives
          for (let i = 0; i < this.maxHits; i++) {
            g.rect(W - 14 - i * 14, 20, 10, 7, i < (this.maxHits - this.hits) ? '#ffe040' : '#18161e');
          }

          // Timer
          g.rect(6, H - 11, W - 12, 5, '#0a0814');
          g.rect(6, H - 11, (W - 12) * clamp(this.timer / 26, 0, 1), 5, '#8080ff');

          api.topBar('ELECTRIC STORM');
          api.txt('SURVIVED ' + Math.floor(26 - Math.max(0, this.timer)) + 's', 6, 20, 9, '#ffe040');
          api.vignette(); api.scanlines();
        },
      },

      /* ============================
       * CHAPTER 5 — THE ERUPTION
       * Ride the volcanic vent upward — tap to steer into pressure surges
       * Tap/hold to rise, dodge magma jets from the walls
       * Collect 8 ore crystals while ascending; reach the top
       * ============================ */
      {
        id: 'eruption',
        name: 'THE ERUPTION',
        sub: 'STROMBOLI AWAKES',
        icon(api, x, y) {
          const g = api.gfx;
          // Upward arrow / vent
          g.rect(x - 2, y + 6, 4, 10, C.lava);
          g.rect(x - 7, y, 14, 6, C.lava);
          g.rect(x - 4, y - 6, 8, 6, C.magma);
          g.rect(x - 1, y - 10, 2, 5, '#ffff40');
        },
        intro: [
          'THE EARTH DECIDES.',
          'STROMBOLI ERUPTS.',
          'A VENT OF LAVA',
          'BLASTS UPWARD.',
          'Ride it or burn.',
          'The surface awaits!',
        ],
        quote: 'We were being projected through the air in a vertical direction at a prodigious speed.',
        help: 'DRAG left/right to dodge magma jets · collect 8 ore crystals to win',
        winText: 'You burst from Stromboli into Sicilian sunlight! The expedition ends in triumph.',
        loseText: 'The magma overwhelms you. Rest in the crater\'s mouth before the next surge.',
        init(api) {
          this.px = api.W / 2;
          this.py = Math.floor(api.H * 0.68);
          this.jets = [];
          this.jetT = 0.8;
          this.crystals = [];
          this.crystalT = 1.2;
          this.collected = 0;
          this.need = 8;
          this.hits = 0;
          this.maxHits = 3;
          this.iframes = 0;
          this.ascent = 0;  // scroll progress
          this.intensity = 1.0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.iframes = Math.max(0, this.iframes - dt);
          this.jetT -= dt;
          this.crystalT -= dt;
          this.ascent += dt * 28;
          this.intensity = 1 + this.collected * 0.08;

          // Move player
          if (api.pointer.down) {
            this.px += (api.pointer.x - this.px) * 0.20 * f;
          }
          if (api.keyDown('left'))  this.px -= 3.0 * f;
          if (api.keyDown('right')) this.px += 3.0 * f;
          this.px = clamp(this.px, 18, api.W - 18);

          // Spawn magma jets from sides (come from left or right wall)
          if (this.jetT <= 0) {
            this.jetT = Math.max(0.38, api.rnd(0.5, 0.9) / this.intensity);
            const fromLeft = api.chance(0.5);
            this.jets.push({
              x: fromLeft ? 0 : api.W,
              y: api.rnd(api.H * 0.25, api.H * 0.75),
              vx: fromLeft ? api.rnd(2.0, 3.5) * this.intensity : -api.rnd(2.0, 3.5) * this.intensity,
              len: api.rnd(28, 56),
              life: api.rnd(0.5, 0.9),
              maxLife: 0.8,
            });
          }

          // Spawn crystals falling upward (world scrolling down)
          if (this.crystalT <= 0) {
            this.crystalT = api.rnd(1.0, 2.0);
            this.crystals.push({ x: api.rnd(20, api.W - 20), y: api.H + 16, vy: -(api.rnd(1.8, 2.8)), taken: false });
          }

          // Move jets (horizontal)
          for (const j of this.jets) { j.x += j.vx * f; j.life -= dt; }
          this.jets = this.jets.filter(j => j.life > 0 && j.x > -60 && j.x < api.W + 60);

          // Move crystals upward
          for (const cr of this.crystals) cr.y += cr.vy * f;
          this.crystals = this.crystals.filter(cr => cr.y > -20 && !cr.taken);

          // Collect crystals
          for (const cr of this.crystals) {
            if (!cr.taken && Math.hypot(cr.x - this.px, cr.y - this.py) < 20) {
              cr.taken = true;
              this.collected++;
              api.score += 25;
              api.audio.sfx('coin');
              api.burst(cr.x, cr.y, C.gold, 10);
              if (this.collected >= this.need) { api.score += 120; api.win(); return; }
            }
          }

          // Hit by jet
          if (this.iframes <= 0) {
            for (const j of this.jets) {
              if (Math.abs(j.y - this.py) < 14 && Math.abs(j.x - this.px) < 18) {
                this.hits++;
                this.iframes = 1.1;
                api.shake(7, 0.28);
                api.flash(C.lava, 0.18);
                api.audio.sfx('hurt');
                if (this.hits >= this.maxHits) { api.lose(); return; }
              }
            }
          }

          api.score = Math.max(api.score, this.collected * 25 + Math.floor(this.ascent * 0.4));
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          // Volcanic vent — red/orange inferno
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#200800');
          bg.addColorStop(0.5, '#180600');
          bg.addColorStop(1, '#2c0a00');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // Scrolling rock walls
          const scrollOff2 = (this.ascent * 1.5) % 40;
          for (let i = 0; i < 8; i++) {
            const yy = (i * 40 + scrollOff2) % (H + 40) - 40;
            g.rect(0, Math.round(yy), 14, 14, '#1c0c04');
            g.rect(W - 14, Math.round(yy + 18), 14, 14, '#1c0c04');
          }
          g.rect(0, 0, 8, H, '#2a1006');
          g.rect(W - 8, 0, 8, H, '#2a1006');

          // Lava glow pulse on walls
          c.globalAlpha = 0.12 + 0.06 * Math.sin(api.t * 3);
          g.rect(0, 0, 8, H, C.lava);
          g.rect(W - 8, 0, 8, H, C.lava);
          c.globalAlpha = 1;

          // Rising magma blobs (upward scroll)
          for (let i = 0; i < 4; i++) {
            const by = (H - ((this.ascent * 0.8 + i * 90) % (H + 40)));
            c.globalAlpha = 0.15;
            g.circle(10, Math.round(by), 12, C.magma);
            g.circle(W - 10, Math.round(by + 40), 10, C.magma);
            c.globalAlpha = 1;
          }

          // Crystals
          for (const cr of this.crystals) {
            if (cr.taken) continue;
            const pulse = 0.6 + 0.4 * Math.sin(api.t * 4 + cr.x * 0.1);
            c.globalAlpha = pulse;
            g.rect(cr.x - 5, cr.y - 7, 10, 14, C.amber);
            g.rect(cr.x - 3, cr.y - 5, 6, 10, C.gold);
            c.globalAlpha = 1;
          }

          // Magma jets
          for (const j of this.jets) {
            const jx = Math.round(j.x), jy = Math.round(j.y);
            const alpha = Math.min(1, j.life / (j.maxLife * 0.4));
            c.globalAlpha = alpha;
            // Jet body
            const jetLen = j.len * (j.vx > 0 ? 1 : -1);
            const grad = c.createLinearGradient(jx, jy, jx + jetLen, jy);
            grad.addColorStop(0, '#ff8000');
            grad.addColorStop(0.5, '#ff3000');
            grad.addColorStop(1, 'rgba(255,80,0,0)');
            c.fillStyle = grad;
            c.fillRect(Math.min(jx, jx + jetLen), jy - 7, Math.abs(jetLen), 14);
            c.globalAlpha = 1;
          }

          // Player (explorer riding eruption)
          const blink = this.iframes > 0 && Math.floor(api.t * 8) % 2 === 0;
          const ppx = Math.round(this.px), ppy = Math.round(this.py);
          if (!blink) {
            // Eruption column glow under player
            c.globalAlpha = 0.35;
            g.rect(ppx - 10, ppy + 8, 20, H - ppy, C.lava);
            c.globalAlpha = 1;
            g.rect(ppx - 5, ppy - 18, 10, 20, '#1a2840');
            g.circle(ppx, ppy - 22, 6, '#c0a080');
            g.rect(ppx - 5, ppy - 26, 10, 6, '#6a5030');
            // Upward momentum particles
            for (let i = 0; i < 4; i++) {
              const py3 = ppy + 4 + i * 6;
              c.globalAlpha = 0.5 - i * 0.1;
              g.rect(ppx - 2 + api.rint(-2, 2), Math.round(py3), 4, 4, C.magma);
              c.globalAlpha = 1;
            }
          }

          // Crystal counter
          for (let i = 0; i < this.need; i++) {
            g.rect(W / 2 - this.need * 6 + i * 12, H - 16, 10, 8,
              i < this.collected ? C.amber : '#1c0c04');
          }

          // Lives
          for (let i = 0; i < this.maxHits; i++) {
            g.circle(W - 12 - i * 16, 22, 5, i < (this.maxHits - this.hits) ? C.magma : '#200800');
          }

          api.topBar('THE ERUPTION');
          api.txt('ORE ' + this.collected + '/' + this.need, 6, 20, 9, C.amber);
          api.vignette(); api.scanlines();
        },
      },

    ],
  });
})();
