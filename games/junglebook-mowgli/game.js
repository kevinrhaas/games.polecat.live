/* ============================================================================
 * THE JUNGLE BOOK — MOWGLI'S LAW
 * Five tales through Kipling's 1894 classic:
 *   1. THE WOLF PACK   — dodge jungle obstacles in the night run
 *   2. BALOO'S VINES   — grab the swinging vine on timing to learn the Master Words
 *   3. THE BANDAR-LOG  — hypnotize the monkey people with Kaa's ring
 *   4. THE RED FLOWER  — steal fire from the man-village without waking the guards
 *   5. SHERE KHAN      — drive the tiger away with blazing torches
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  // menu layout node centers (hardcoded to match layout() below)
  // used by scenery to draw the jungle path connecting nodes
  const NODE_CENTERS = [
    [70, 406], [200, 316], [70, 226], [200, 136], [135, 56]
  ];

  function emblem(api, cx, cy) {
    const g = api.gfx;
    // wolf head silhouette
    g.sprite([
      '..ggg..',
      '.ggggg.',
      'ggwwggg',
      'ggggggg',
      '.ggggg.',
      '..g.g..',
    ], cx - 14, cy - 18, { g: '#3d8c2a', w: '#c8e8b0' }, 4);
  }

  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    // deep jungle sky
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#050e04');
    sky.addColorStop(0.45, '#0a1a08');
    sky.addColorStop(1, '#1a3a14');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // stars through canopy
    for (let i = 0; i < 28; i++) {
      const sx = (i * 67 + 13) % W, sy = (i * 43 + 5) % Math.floor(H * 0.42);
      c.globalAlpha = 0.25 + 0.2 * Math.sin(t * 1.5 + i);
      g.rect(sx, sy, 1, 1, '#c8e8b0');
    }
    c.globalAlpha = 1;

    // crescent moon
    if (scene !== 'menu') {
      g.circle(W - 50, 48, 18, '#d4ebc0');
      g.circle(W - 43, 43, 15, '#0a1a08');
    }

    // tree trunks + canopy
    const trunks = [18, 72, 134, 196, 252];
    for (const tx of trunks) {
      c.fillStyle = '#1e0f06'; c.fillRect(tx - 5, H - 160, 10, 130);
    }
    const leafCols = ['#2d5a20', '#3d8c2a', '#1a4010', '#4ab040'];
    for (let i = 0; i < 20; i++) {
      const lx = (i * 71 + 8) % W, ly = 30 + (i * 47) % (H - 180);
      const lw = 18 + (i * 13) % 28;
      c.globalAlpha = 0.45 + 0.2 * Math.sin(t * 0.7 + i * 0.6);
      c.fillStyle = leafCols[i % 4];
      c.beginPath();
      c.ellipse(lx, ly, lw, lw * 0.55, (i * 0.38) % Math.PI, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;

    // fireflies
    for (let i = 0; i < 10; i++) {
      const fx = ((t * 22 * (i % 3 === 0 ? 1 : -0.6)) + i * 47 + 400) % (W + 20) - 10;
      const fy = H - 190 + Math.sin(t * 1.1 + i * 1.2) * 38 + (i * 33) % 90;
      c.globalAlpha = 0.4 + 0.45 * Math.sin(t * 3.2 + i);
      g.rect(fx, fy, 2, 2, '#b0e890');
    }
    c.globalAlpha = 1;

    // jungle floor strip
    g.rect(0, H - 46, W, 46, '#1a3a14');
    g.rect(0, H - 48, W, 3, '#2d5a20');

    if (scene === 'menu') {
      // draw winding jungle path connecting the 5 chapter nodes
      c.globalAlpha = 0.5; c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
      // dirt path between nodes
      c.strokeStyle = '#5a3a1a'; c.lineWidth = 6;
      c.setLineDash([8, 6]);
      c.beginPath();
      c.moveTo(NODE_CENTERS[0][0], NODE_CENTERS[0][1]);
      for (let i = 1; i < NODE_CENTERS.length; i++) {
        const px = (NODE_CENTERS[i - 1][0] + NODE_CENTERS[i][0]) / 2;
        const py = (NODE_CENTERS[i - 1][1] + NODE_CENTERS[i][1]) / 2;
        c.quadraticCurveTo(px + 20 * (i % 2 === 0 ? 1 : -1), py, NODE_CENTERS[i][0], NODE_CENTERS[i][1]);
      }
      c.stroke(); c.setLineDash([]);
      // vine tendrils along path
      c.strokeStyle = '#3d8c2a'; c.lineWidth = 2;
      for (let i = 0; i < NODE_CENTERS.length - 1; i++) {
        const x0 = NODE_CENTERS[i][0], y0 = NODE_CENTERS[i][1];
        const x1 = NODE_CENTERS[i + 1][0], y1 = NODE_CENTERS[i + 1][1];
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        c.beginPath();
        c.moveTo(x0, y0 - 14);
        c.quadraticCurveTo(mx + 15, my, x1, y1 - 14);
        c.stroke();
        // small leaf nodes
        g.circle(mx + 6, my - 6, 5, '#3d8c2a');
      }
    } else if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(5,10,4,.68)'; c.fillRect(0, 0, W, H);
    }
  }

  RetroSaga.create({
    id: 'junglebook',
    title: 'THE JUNGLE BOOK',
    subtitle: "MOWGLI'S LAW",
    currency: 'HONOUR',
    screens: {
      win:          '#5dff8f',
      lose:         '#8b2a14',
      chapterLabel: '#6aab50',
      name:         '#c8e8b0',
      sub:          '#3d8c2a',
      intro:        '#a0d880',
      quote:        '#6aab50',
      help:         '#5dff8f',
      score:        '#c8e8b0',
      cur:          '#5dff8f',
      cta:          '#c8e8b0',
      overlay:      'rgba(5,10,4,.84)',
    },
    labels: {
      chapter: 'TALE',
      score:   'HONOUR EARNED',
      win:     'THE LAW IS KEPT',
      lose:    'THE JUNGLE TAKES YOU',
      cont:    'TAP TO RUN ON',
      finale:  'TAP FOR THE FINAL TALE',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO BEGIN',
    },
    accent: '#5dff8f',
    credit: 'AFTER RUDYARD KIPLING · 1894',
    emblem,
    scenery,
    bootCta:   'TAP TO ENTER THE JUNGLE',
    menuLabel: "MOWGLI'S PATH",
    menuHint:  'CHOOSE A TALE',
    menuDone:  'THE JUNGLE IS FREE',

    menu: {
      colors: { title: '#5dff8f', label: '#6aab50', cur: '#c8e8b0' },
      // winding jungle path — 5 bamboo signposts along an S-curve
      layout(api) {
        return [
          { x: 20,  y: 372, w: 100, h: 68 },
          { x: 150, y: 282, w: 100, h: 68 },
          { x: 20,  y: 192, w: 100, h: 68 },
          { x: 150, y: 102, w: 100, h: 68 },
          { x: 60,  y: 22,  w: 150, h: 68 },
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        // bamboo signpost background
        const r = 7;
        c.fillStyle = sel ? '#2d5a20' : '#152a10';
        c.strokeStyle = sel ? '#5dff8f' : '#3d8c2a';
        c.lineWidth = sel ? 2 : 1;
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.arcTo(x + w, y, x + w, y + r, r);
        c.lineTo(x + w, y + h - r);
        c.arcTo(x + w, y + h, x + w - r, y + h, r);
        c.lineTo(x + r, y + h);
        c.arcTo(x, y + h, x, y + h - r, r);
        c.lineTo(x, y + r);
        c.arcTo(x, y, x + r, y, r);
        c.closePath(); c.fill(); c.stroke();

        // bamboo post on left edge
        c.fillStyle = '#c8a84b';
        c.fillRect(x + 4, y + 4, 7, h - 8);
        for (let n = 0; n < 3; n++) {
          c.fillStyle = '#8a7030';
          c.fillRect(x + 3, y + 12 + n * 19, 9, 2);
        }
        // small leaf on top of post
        g.circle(x + 8, y + 4, 5, '#3d8c2a');

        // tale label + name
        const cx2 = x + 14 + (w - 14) / 2;
        api.txtC('TALE ' + (i + 1), cx2, y + 16, 7, done ? '#5dff8f' : '#c8a84b');
        api.txtCFit(ch.name, cx2, y + 33, 7, done ? '#5dff8f' : '#c8e8b0', false, w - 20);
        if (ch.sub) api.txtCFit(ch.sub, cx2, y + 50, 6, '#6aab50', false, w - 20);
        if (done) api.txtC('✦', x + w - 12, y + h - 13, 9, '#5dff8f');
      },
    },

    finale: [
      'THE LAW IS KEPT.',
      'MOWGLI STANDS',
      'AT THE COUNCIL ROCK.',
      '',
      'THE JUNGLE IS FREE.',
    ],

    width: 270, height: 480, parent: '#game',
    palette: { jungle: '#3d8c2a', bright: '#5dff8f', earth: '#8b5e2a', tiger: '#ff6b35', bamboo: '#c8a84b' },

    chapters: [

      /* ========================================================= 1. WOLF PACK */
      {
        id: 'wolfpack', name: 'THE WOLF PACK', sub: 'RUN, MOWGLI, RUN',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y + 2, 5, '#5dff8f');
          g.circle(x - 5, y - 3, 3, '#5dff8f');
          g.circle(x + 5, y - 3, 3, '#5dff8f');
          g.circle(x - 2, y - 7, 2, '#5dff8f');
          g.circle(x + 2, y - 7, 2, '#5dff8f');
        },
        intro: [
          'FATHER WOLF RUNS WITH',
          'MOWGLI THROUGH THE NIGHT.',
          'THE JUNGLE IS ALIVE',
          'with roots and stones.',
        ],
        quote: 'The Law of the Jungle — which is by far the oldest law in the world.',
        help: 'DRAG left & right · dodge roots and rocks for 22 seconds',
        winText: 'Mowgli reaches the Council Rock, breathless and unscratched.',
        loseText: 'A root catches his foot. The pack runs on without him.',
        init(api) {
          this.x = api.W / 2;
          this.timer = 22; this.lives = 3;
          this.obs = []; this.spawnT = 0.7;
          this.speed = 190; // px/s for obstacles falling down
          this.hurt = 0;
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;
          this.timer -= dt;

          // move player
          if (api.pointer.down) {
            const dx = api.pointer.x - this.x;
            this.x += Math.sign(dx) * Math.min(Math.abs(dx), 220 * dt);
          }
          if (api.keyDown('left'))  this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 18, W - 18);

          // spawn obstacles
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = 0.38 + Math.random() * 0.45;
            const kind = Math.random() < 0.5 ? 'root' : 'stone';
            this.obs.push({ x: 22 + Math.random() * (W - 44), y: -18, kind, hit: false });
          }

          // move obstacles
          const spd = this.speed * dt;
          for (const o of this.obs) o.y += spd;
          this.speed = Math.min(280, 190 + (22 - Math.max(0, this.timer)) * 4);

          // collision (only near Mowgli's feet)
          this.hurt -= dt;
          if (this.hurt <= 0) {
            for (const o of this.obs) {
              if (!o.hit && Math.abs(o.x - this.x) < 18 && o.y > H - 94 && o.y < H - 46) {
                o.hit = true; this.lives--;
                api.shake(6, 0.28); api.flash('#ff3b3b', 0.18); api.audio.sfx('hurt');
                this.hurt = 0.9;
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
          this.obs = this.obs.filter(o => o.y < H + 10);

          api.score = Math.floor((22 - Math.max(0, this.timer)) * 7);
          if (this.timer <= 0) { api.score += 100; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a1a08');

          // scrolling ground stripes
          const sc = (api.t * this.speed) % 36;
          for (let y = -36 + sc; y < H - 56; y += 36) g.rect(0, y, W, 1, '#1a3a14');

          // jungle floor
          g.rect(0, H - 58, W, 58, '#1a3a14');
          g.rect(0, H - 60, W, 3, '#2d5a20');

          // scrolling trees on sides
          const tp = (api.t * 65) % 130;
          for (let i = 0; i < 5; i++) {
            const tx = (i * 130 - tp + 650) % 650 - 30;
            g.rect(tx - 5, H - 170, 10, 112, '#1e0f06');
            c.globalAlpha = 0.65;
            g.circle(tx, H - 172, 30, '#2d5a20');
            g.circle(tx - 10, H - 158, 20, '#3d8c2a');
            c.globalAlpha = 1;
          }

          // obstacles
          for (const o of this.obs) {
            if (o.hit) continue;
            if (o.kind === 'root') {
              g.rect(o.x - 14, o.y - 5, 28, 10, '#5a3a1a');
              g.rect(o.x - 8, o.y + 5, 16, 6, '#3a2010');
            } else {
              g.circle(o.x, o.y, 11, '#4a4a4a');
              g.circle(o.x - 2, o.y - 2, 3, '#6a6a6a');
            }
          }

          // wolf companion (left of mowgli)
          const wx = this.x - 30 + Math.sin(api.t * 9) * 3;
          g.sprite([
            'gg.','ggg','ggg','.gg',
          ], wx, H - 78, { g: '#8a8080' }, 4);

          // Mowgli
          g.sprite([
            '.bb.', 'bssb', '.bb.', 'b..b',
          ], this.x - 8, H - 88, { b: '#c8a060', s: '#8b5e2a' }, 4);

          api.topBar('THE WOLF PACK');
          api.txt('TIME ' + Math.ceil(Math.max(0, this.timer)), 6, 20, 9, '#5dff8f');
          for (let i = 0; i < 3; i++) g.rect(W - 56 + i * 18, 14, 14, 12, i < this.lives ? '#ff6b35' : '#2a1a0a');
          api.vignette();
        },
      },

      /* ======================================================= 2. BALOO'S VINES */
      {
        id: 'baloo', name: "BALOO'S VINES", sub: 'LEARN THE MASTER WORDS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 1, y - 8, 2, 16, '#5a3a1a');
          g.circle(x, y - 9, 5, '#3d8c2a');
          g.circle(x + 5, y - 2, 3, '#3d8c2a');
        },
        intro: [
          'BALOO THE BEAR TEACHES',
          'MOWGLI THE MASTER WORDS',
          'THAT PROTECT HIM',
          'among all the peoples.',
        ],
        quote: '"Now I will teach you the Master Words of the Jungle for all the Hunting Peoples."',
        help: 'TAP when the vine swings into the green zone · 4 misses = fail',
        winText: 'Mowgli speaks every word true. Even the Cobra bows his head.',
        loseText: 'The words tangle in his mouth. Baloo sighs and shakes his great head.',
        init(api) {
          this.m = 0; this.dir = 1; this.spd = 0.88;
          this.done = 0; this.need = 8; this.miss = 0;
          this.band = 0.22;
        },
        update(api, dt) {
          const f = dt * 60;
          this.m += this.dir * this.spd * 0.028 * f;
          if (this.m > 1) { this.m = 1; this.dir = -1; }
          if (this.m < 0) { this.m = 0; this.dir = 1; }

          if (api.confirm()) {
            if (Math.abs(this.m - 0.5) < this.band) {
              this.done++;
              api.score += 30;
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H * 0.45, '#5dff8f', 8);
              this.spd  = Math.min(2.1, this.spd + 0.1);
              this.band = Math.max(0.1, this.band - 0.012);
              if (this.done >= this.need) { api.score += 80; api.win(); }
            } else {
              this.miss++;
              api.shake(4, 0.22); api.audio.sfx('hurt');
              if (this.miss >= 4) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0f2a0a');

          // bamboo grove
          const bCols = ['#1a3a14', '#2d5a20', '#1a4010'];
          for (let i = 0; i < 9; i++) {
            const bx = 8 + i * 30;
            c.fillStyle = bCols[i % 3]; c.fillRect(bx - 4, 0, 8, H);
            g.rect(bx - 4, 55 + (i * 45) % 115, 8, 4, '#c8a84b');
          }

          // vine pivot
          const pivX = W / 2, pivY = 26;
          const angle = (this.m - 0.5) * 2.3;
          const vLen = 136;
          const vx = pivX + Math.sin(angle) * vLen;
          const vy = pivY + Math.cos(angle) * vLen;

          // vine rope
          c.strokeStyle = '#5a3a1a'; c.lineWidth = 3;
          c.beginPath(); c.moveTo(pivX, pivY); c.lineTo(vx, vy); c.stroke();
          g.circle(pivX, pivY, 5, '#3d8c2a');
          g.circle(vx, vy, 9, '#3d8c2a');

          // Mowgli on vine
          g.sprite(['.bb.', 'bssb', '.bb.'], vx - 6, vy + 7, { b: '#c8a060', s: '#8b5e2a' }, 4);

          // Baloo below left
          g.sprite([
            '.bbb.', 'bbbbb', 'b.b.b', 'bbbbb', '.bbb.',
          ], 44, H - 66, { b: '#8a7060' }, 4);
          api.txtC('"Good!"', 80, H - 74, 7, '#c8a84b');

          // meter
          const mY = H - 44, mX = 24, mW = W - 48;
          g.rect(mX, mY, mW, 12, '#1a2a14');
          g.rect(mX + mW * (0.5 - this.band), mY, mW * this.band * 2, 12, 'rgba(93,255,143,.42)');
          g.rect(mX + mW * 0.5 - 1, mY - 3, 2, 18, '#5dff8f');
          g.rect(mX + mW * this.m - 2, mY - 4, 4, 20, '#c8a84b');

          api.topBar("BALOO'S VINES");
          api.txt('WORDS ' + this.done + '/' + this.need, 6, 20, 9, '#5dff8f');
          api.txt('SLIP ' + this.miss + '/4', W - 72, 20, 9, this.miss > 2 ? '#ff6b35' : '#6aab50');
          api.vignette();
        },
      },

      /* ====================================================== 3. THE BANDAR-LOG */
      {
        id: 'bandars', name: 'THE BANDAR-LOG', sub: "KAA'S HYPNOSIS",
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 8, '#c8a84b');
          g.circle(x, y, 5, '#8b5e2a');
          g.circle(x - 1, y - 1, 2, '#c8e8b0');
        },
        intro: [
          'THE MONKEY PEOPLE',
          'HAVE STOLEN MOWGLI.',
          'KAA THE PYTHON MUST',
          'hypnotize them all.',
        ],
        quote: '"Come to the Dance — the Dance of the Hunger of Kaa!"',
        help: 'TAP when the spinning ring meets the glowing monkey',
        winText: 'One by one the Bandar-log sway and sleep. Mowgli is freed.',
        loseText: 'The monkeys shriek and scatter. Kaa hisses in shame.',
        init(api) {
          this.monkeys = [
            { x: 68,  y: 148 },
            { x: 202, y: 122 },
            { x: 75,  y: 268 },
            { x: 195, y: 252 },
            { x: 138, y: 196 },
            { x: 145, y: 335 },
          ].map(m => ({ ...m, done: false }));
          this.cur  = 0;
          this.r    = 58; this.rDir = -1; this.rSpd = 0.75;
          this.done = 0; this.miss = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          if (this.cur >= this.monkeys.length) { api.score += 80; api.win(); return; }
          const mk = this.monkeys[this.cur];

          this.r += this.rDir * this.rSpd * f;
          if (this.r < 8)  { this.r = 8;  this.rDir = 1; }
          if (this.r > 62) { this.r = 62; this.rDir = -1; }

          if (api.pointer.justDown) {
            const d = Math.hypot(api.pointer.x - mk.x, api.pointer.y - mk.y);
            if (Math.abs(d - this.r) < 14) {
              mk.done = true; this.done++; this.cur++;
              api.score += 25;
              api.audio.sfx('power');
              api.burst(mk.x, mk.y, '#c8a84b', 10);
              this.r    = 60;
              this.rSpd = Math.min(1.85, this.rSpd + 0.15);
            } else {
              this.miss++;
              api.shake(3, 0.15); api.audio.sfx('hurt');
              if (this.miss >= 4) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#1a1a08');

          // ruined city
          for (let col = 0; col < 5; col++) {
            const bx = 18 + col * 52, bh = 80 + (col % 3) * 42;
            g.rect(bx - 12, H - bh, 24, bh, '#2a2a14');
            for (let wy = 10; wy < bh - 10; wy += 20) {
              g.rect(bx - 8, H - bh + wy, 6, 8, '#14140a');
              g.rect(bx + 2, H - bh + wy, 6, 8, '#14140a');
            }
          }
          // vines over ruins
          c.strokeStyle = '#2d5a20'; c.lineWidth = 1;
          for (let i = 0; i < 7; i++) {
            c.beginPath();
            c.moveTo(30 + i * 38, 0);
            c.quadraticCurveTo(20 + i * 38 + 10, H / 2, 30 + i * 38, H);
            c.stroke();
          }

          // Kaa the python
          g.sprite([
            '.kk.', 'kekk', '.kk.', '.kk', '..k',
          ], 16, H / 2 - 34, { k: '#c8a84b', e: '#ff2a2a' }, 4);

          // all monkeys
          for (let mi = 0; mi < this.monkeys.length; mi++) {
            const mk = this.monkeys[mi];
            const isCur = mi === this.cur;
            const col = mk.done ? '#4a4a2a' : (isCur ? '#c8a060' : '#7a6030');
            g.sprite(['.mm.', 'meem', '.mm.', '.m.m'], mk.x - 6, mk.y - 14, { m: col, e: '#c8e8b0' }, 3);
            if (mk.done) api.txtC('z', mk.x + 9, mk.y - 18, 7, '#6a6a4a');
          }

          // spinning ring on current monkey
          if (this.cur < this.monkeys.length) {
            const mk = this.monkeys[this.cur];
            c.strokeStyle = '#5dff8f'; c.lineWidth = 2;
            c.beginPath(); c.arc(mk.x, mk.y, this.r, 0, Math.PI * 2); c.stroke();
            c.strokeStyle = 'rgba(93,255,143,0.28)'; c.lineWidth = 1;
            c.beginPath(); c.arc(mk.x, mk.y, this.r * 0.55, 0, Math.PI * 2); c.stroke();
            // target radius band
            c.strokeStyle = 'rgba(93,255,143,0.15)'; c.lineWidth = 26;
            c.beginPath(); c.arc(mk.x, mk.y, mk.kind === 'large' ? 16 : 12, 0, Math.PI * 2); c.stroke();
          }

          api.topBar('THE BANDAR-LOG');
          api.txt('HYPNO ' + this.done + '/' + this.monkeys.length, 6, 20, 9, '#c8a84b');
          api.txt('SLIP ' + this.miss + '/4', W - 72, 20, 9, this.miss > 2 ? '#ff6b35' : '#6aab50');
          api.vignette();
        },
      },

      /* ====================================================== 4. THE RED FLOWER */
      {
        id: 'redflower', name: 'THE RED FLOWER', sub: "MAN'S FIRE",
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 1, y + 2, 2, 7, '#c8a84b');
          g.circle(x, y, 5, '#ff6b35');
          g.circle(x, y - 4, 3, '#ffe03d');
          g.circle(x, y - 7, 2, '#ffffff');
        },
        intro: [
          'MOWGLI MUST BRING THE',
          '"RED FLOWER" — FIRE —',
          'TO PROVE HIS POWER',
          'before the Council.',
        ],
        quote: '"Get me the Red Flower," said Akela. "It is the only thing that will save thee."',
        help: 'DRAG to move · avoid the watchmen\'s lanterns · grab fire then escape south',
        winText: 'Mowgli snatches the fire-pot and sprints for the jungle.',
        loseText: 'A lantern swings over him. The village erupts in alarm.',
        init(api) {
          this.px = api.W / 2; this.py = api.H - 38;
          this.timer = 26; this.lives = 3; this.hurt = 0;
          this.guards = [
            { x: 85,  y: 178, dir: 1, spd: 50 },
            { x: 185, y: 288, dir: -1, spd: 62 },
          ];
          this.fireX = 92; this.fireY = 168;
          this.collected = false;
        },
        update(api, dt) {
          const W = api.W, H = api.H;

          // player moves toward pointer (capped speed)
          if (api.pointer.down) {
            const dx = api.pointer.x - this.px, dy = api.pointer.y - this.py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 3) {
              const spd = Math.min(dist, 115 * dt);
              this.px += (dx / dist) * spd;
              this.py += (dy / dist) * spd;
            }
          }
          if (api.keyDown('left'))  this.px -= 110 * dt;
          if (api.keyDown('right')) this.px += 110 * dt;
          if (api.keyDown('up'))    this.py -= 110 * dt;
          if (api.keyDown('down'))  this.py += 110 * dt;
          this.px = clamp(this.px, 12, W - 12);
          this.py = clamp(this.py, 40, H - 18);

          // guards patrol horizontally
          for (const gd of this.guards) {
            gd.x += gd.dir * gd.spd * dt;
            if (gd.x > W - 28) { gd.x = W - 28; gd.dir = -1; }
            if (gd.x < 28)     { gd.x = 28;     gd.dir = 1; }
          }

          // collect fire
          if (!this.collected && Math.hypot(this.px - this.fireX, this.py - this.fireY) < 20) {
            this.collected = true;
            api.audio.sfx('power');
            api.burst(this.fireX, this.fireY, '#ff6b35', 14);
            api.flash('#ff6b35', 0.18);
          }

          // guard collision
          this.hurt -= dt;
          if (this.hurt <= 0) {
            for (const gd of this.guards) {
              if (Math.hypot(this.px - gd.x, this.py - gd.y) < 42) {
                this.lives--;
                api.shake(7, 0.3); api.flash('#ffe03d', 0.22); api.audio.sfx('hurt');
                this.hurt = 1.1;
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }

          this.timer -= dt;
          api.score = (this.collected ? 60 : 0) + Math.floor((26 - Math.max(0, this.timer)) * 3);

          if (this.collected && this.py > H - 24) { api.score += 120; api.win(); }
          else if (!this.collected && this.timer <= 0) { api.lose(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#120806');

          // village ground
          g.rect(0, H - 52, W, 52, '#2a1a0a');

          // huts
          const huts = [[22, 130, 60], [112, 152, 55], [196, 125, 62]];
          for (const [hx, hy, hw] of huts) {
            c.fillStyle = '#3a2010'; c.fillRect(hx, hy + 34, hw, 55);
            c.fillStyle = '#5a3a18';
            c.beginPath(); c.moveTo(hx - 4, hy + 34); c.lineTo(hx + hw / 2, hy); c.lineTo(hx + hw + 4, hy + 34); c.closePath(); c.fill();
            g.rect(hx + hw / 2 - 8, hy + 54, 16, 22, '#1a0a04');
          }

          // fire pot
          if (!this.collected) {
            g.circle(this.fireX, this.fireY, 10, '#c8a84b');
            g.circle(this.fireX, this.fireY - 7, 7, '#ff6b35');
            g.circle(this.fireX, this.fireY - 12, 5, '#ffe03d');
            const fp = Math.sin(api.t * 9) * 2;
            g.circle(this.fireX, this.fireY - 17 + fp, 3, '#fff');
          }

          // guards + lantern glow
          for (const gd of this.guards) {
            c.globalAlpha = 0.14;
            c.fillStyle = '#ffe03d';
            c.beginPath(); c.arc(gd.x, gd.y, 44, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            g.sprite(['.gg.', 'gggg', '.gg.', 'g..g'], gd.x - 8, gd.y - 18, { g: '#a08060' }, 4);
            g.circle(gd.x + (gd.dir > 0 ? 11 : -11), gd.y - 5, 5, '#ffe03d');
          }

          // Mowgli (orange tint when carrying fire)
          const mc = this.collected ? '#ff9050' : '#c8a060';
          g.sprite(['.bb.', 'bssb', '.bb.', 'b..b'], this.px - 8, this.py - 20, { b: mc, s: '#8b5e2a' }, 4);
          if (this.collected) {
            // flame on torch
            g.circle(this.px + 8, this.py - 26, 5, '#ff6b35');
            g.circle(this.px + 8, this.py - 30, 3, '#ffe03d');
          }

          api.topBar('THE RED FLOWER');
          api.txt('TIME ' + Math.ceil(Math.max(0, this.timer)), 6, 20, 9, '#ff6b35');
          for (let i = 0; i < 3; i++) g.rect(W - 56 + i * 18, 14, 14, 12, i < this.lives ? '#ff6b35' : '#2a1a0a');
          if (this.collected) api.txtC('ESCAPE TO JUNGLE!', W / 2, 36, 8, '#ff6b35', true);
          api.vignette();
        },
      },

      /* ========================================================= 5. SHERE KHAN */
      {
        id: 'sherekhan', name: 'SHERE KHAN', sub: 'FACE THE TIGER',
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite([
            'oo.oo', 'ooooo', '.ooo.',
          ], x - 10, y - 6, { o: '#ff6b35' }, 4);
          g.rect(x - 4, y - 2, 2, 8, '#1a0a0a');
          g.rect(x + 2, y - 2, 2, 8, '#1a0a0a');
        },
        intro: [
          'SHERE KHAN CIRCLES',
          'THE STAMPEDING HERD.',
          'MOWGLI RAISES',
          'the Red Flower.',
        ],
        quote: '"Art thou not afraid?" Mowgli swung the fire-pot. "No — and I will not be."',
        help: 'DRAG torch to block the tiger · TAP torch to stoke the fire',
        winText: 'Shere Khan bolts into the night, howling. The Pack cheers Mowgli.',
        loseText: 'The fire gutters out. Shere Khan\'s roar fills the dark jungle.',
        init(api) {
          this.torchX  = api.W * 0.55;
          this.tigerX  = api.W + 80;
          this.mowgliX = 48;
          this.heat    = 85;
          this.timer   = 28; this.lives = 3;
          this.hurt    = 0;
          this.tigerSpd = 48;
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer -= dt;
          this.heat = clamp(this.heat - dt * 7, 0, 100);

          // drag torch
          if (api.pointer.down) {
            const dx = api.pointer.x - this.torchX;
            this.torchX += Math.sign(dx) * Math.min(Math.abs(dx), 170 * dt);
          }
          if (api.keyDown('left'))  this.torchX -= 3.5 * dt * 60;
          if (api.keyDown('right')) this.torchX += 3.5 * dt * 60;
          this.torchX = clamp(this.torchX, 24, W - 24);

          // tap to stoke fire
          if (api.pointer.justDown && Math.abs(api.pointer.x - this.torchX) < 40) {
            this.heat = clamp(this.heat + 28, 0, 100);
            api.audio.sfx('coin');
            api.burst(this.torchX, H - 148, '#ff6b35', 5);
          }

          // tiger movement
          const fireDist = this.tigerX - this.torchX;
          const fireBlocks = fireDist > -10 && fireDist < 80 && this.heat > 15;
          if (fireBlocks) {
            this.tigerX += 22 * dt; // backs away
          } else {
            this.tigerX -= this.tigerSpd * dt;
            this.tigerSpd = Math.min(80, 48 + (28 - Math.max(0, this.timer)) * 1.2);
          }

          // tiger catches Mowgli
          this.hurt -= dt;
          if (this.hurt <= 0 && this.tigerX < this.mowgliX + 36) {
            this.lives--;
            api.shake(9, 0.4); api.flash('#ff6b35', 0.28); api.audio.sfx('hurt');
            this.tigerX = this.mowgliX + 130;
            this.torchX = this.mowgliX + 90;
            this.hurt = 1.2;
            if (this.lives <= 0) { api.lose(); return; }
          }

          api.score = Math.floor((28 - Math.max(0, this.timer)) * 8);
          if (this.timer <= 0) { api.score += 160; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // night plain
          api.clear('#080e06');
          g.rect(0, 0, W, H - 136, '#05080f');
          g.rect(0, H - 136, W, 136, '#1a2a14');
          g.rect(0, H - 138, W, 3, '#2d5a20');

          // stars
          for (let i = 0; i < 22; i++) {
            const sx = (i * 71 + 5) % W, sy = (i * 43 + 3) % (H - 148);
            c.globalAlpha = 0.45 + 0.3 * Math.sin(api.t * 2 + i);
            g.rect(sx, sy, 1, 1, '#c8e8b0');
          }
          c.globalAlpha = 1;

          // buffalo stampede silhouettes
          const bfSc = (api.t * 88) % W;
          for (let i = 0; i < 5; i++) {
            const bfx = (bfSc + i * 58) % W;
            const bfy = H - 118 - (i % 2) * 12;
            c.fillStyle = '#1e1208';
            c.fillRect(bfx, bfy - 10, 24, 18);
            g.circle(bfx + 24, bfy - 4, 9, '#1e1208');
            g.rect(bfx + 3, bfy + 8, 5, 10, '#140c06');
            g.rect(bfx + 12, bfy + 8, 5, 10, '#140c06');
          }

          // torch stick
          g.rect(this.torchX - 2, H - 170, 4, 32, '#5a3a1a');

          // fire glow
          const flk = Math.sin(api.t * 13) * 3;
          const fs = 10 + this.heat * 0.18;
          c.globalAlpha = 0.14 * (this.heat / 100);
          c.fillStyle = '#ff6b35';
          c.beginPath(); c.arc(this.torchX, H - 178, 62, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 0.6 + this.heat / 240;
          g.circle(this.torchX, H - 178, fs + flk, '#ff6b35');
          g.circle(this.torchX, H - 184, (fs + flk) * 0.7, '#ffe03d');
          c.globalAlpha = 1;

          // fire heat bar
          g.rect(6, H - 13, W - 12, 6, '#1a1a0a');
          g.rect(6, H - 13, (W - 12) * this.heat / 100, 6, '#ff6b35');

          // Mowgli
          g.sprite(['.bb.', 'bssb', '.bb.', 'b..b'], this.mowgliX - 8, H - 176, { b: '#c8a060', s: '#8b5e2a' }, 4);

          // Shere Khan tiger
          if (this.tigerX < W + 36) {
            const tkx = Math.floor(clamp(this.tigerX, -20, W + 20));
            g.sprite([
              '..ooo.', '.ooooo', 'ookkooo', 'ooooooo', '..o.o..',
            ], tkx - 28, H - 178, { o: '#ff6b35', k: '#1a0a0a' }, 5);
          }

          api.topBar('SHERE KHAN');
          api.txt('TIME ' + Math.ceil(Math.max(0, this.timer)), 6, 20, 9, '#ff6b35');
          for (let i = 0; i < 3; i++) g.rect(W - 56 + i * 18, 14, 14, 12, i < this.lives ? '#ff6b35' : '#2a1a0a');
          api.txtC('FIRE', W / 2, H - 3, 7, '#ff6b35');
          api.vignette();
        },
      },
    ],
  });
})();
