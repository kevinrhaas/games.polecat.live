/* ============================================================================
 * WINNIE-THE-POOH — HUNNY HUNT
 * Five adventures through A. A. Milne's Hundred Acre Wood (1926):
 *   1. BALLOON HEIST   — hold to float, collect honey pots, dodge bees
 *   2. WOOZLE HUNT     — quick-tap left or right to follow the tracks
 *   3. EEYORE'S PARTY  — move Pooh to catch birthday gifts, avoid thistles
 *   4. BLUSTERY DAY    — Piglet floats upward; steer through tree-branch gaps
 *   5. STUCK!          — alternate left/right taps to wiggle Pooh free
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Emblem: a honey pot with a bee ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // pot neck
    g.rect(cx - 9, cy - 26, 18, 10, '#e08018');
    // pot rim (wider)
    g.rect(cx - 16, cy - 18, 32, 8, '#f0a030');
    // pot body
    g.rect(cx - 14, cy - 10, 28, 26, '#e08018');
    // pot base shadow
    g.rect(cx - 12, cy + 14, 24, 5, '#c06010');
    // shine stripe
    g.rect(cx - 8, cy - 5, 10, 2, '#f8d880');
    // HUNNY label
    api.txtC('HUNNY', cx, cy + 1, 7, '#3a1808');
    // bee (top-right of pot)
    const bx = cx + 26, by = cy - 32;
    g.rect(bx, by, 10, 6, '#f0c820');
    g.rect(bx + 2, by, 2, 6, '#101010');
    g.rect(bx + 6, by, 2, 6, '#101010');
    g.rect(bx - 5, by - 3, 5, 3, 'rgba(210,230,255,.8)');
    g.rect(bx - 5, by + 3, 5, 3, 'rgba(210,230,255,.8)');
  }

  /* ─── Scenery: sunny Hundred Acre Wood / parchment map ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Parchment map of the Hundred Acre Wood
      c.fillStyle = '#f0dfa0'; c.fillRect(0, 0, W, H);
      // paper texture lines
      c.globalAlpha = 0.07;
      c.fillStyle = '#a07810';
      for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 1);
      c.globalAlpha = 1;
      // double-line map border
      c.strokeStyle = '#8a6808'; c.lineWidth = 3; c.strokeRect(5, 5, W - 10, H - 10);
      c.strokeStyle = '#c09828'; c.lineWidth = 1; c.strokeRect(9, 9, W - 18, H - 18);

      // Dashed path lines between chapter locations
      // ch1 centre (65,116) ch2 (204,138) ch3 (65,260) ch4 (204,260) ch5 (134,402)
      c.strokeStyle = '#b09040'; c.lineWidth = 1.5; c.setLineDash([4, 4]);
      c.beginPath(); c.moveTo(116, 116); c.lineTo(152, 136); c.stroke(); // ch1→ch2
      c.beginPath(); c.moveTo(65, 144); c.lineTo(65, 232); c.stroke();  // ch1→ch3
      c.beginPath(); c.moveTo(204, 166); c.lineTo(204, 232); c.stroke(); // ch2→ch4
      c.beginPath(); c.moveTo(72, 288); c.lineTo(110, 374); c.stroke();  // ch3→ch5
      c.beginPath(); c.moveTo(202, 288); c.lineTo(168, 374); c.stroke(); // ch4→ch5
      c.setLineDash([]);

      // Pooh's oak tree near ch1 (top-left background)
      c.fillStyle = '#7a4810'; c.fillRect(20, 150, 8, 52);
      c.fillStyle = '#4a8a22'; c.beginPath(); c.arc(24, 150, 18, 0, 7); c.fill();
      c.fillStyle = '#5aaa28'; c.beginPath(); c.arc(30, 140, 12, 0, 7); c.fill();
      g.rect(12, 156, 22, 8, '#e8c870');
      api.txtC('SND', 23, 158, 5, '#4a2808');

      // Snowy hill near ch2 (top-right)
      c.fillStyle = '#d8eef8';
      c.beginPath(); c.arc(248, 118, 16, Math.PI, 0); c.fill();
      c.beginPath(); c.arc(260, 122, 10, Math.PI, 0); c.fill();

      // Droopy willow near ch3 (Eeyore's gloomy place)
      c.fillStyle = '#6a8018'; c.fillRect(16, 292, 5, 36);
      c.fillStyle = '#9aaa20'; c.beginPath(); c.arc(18, 292, 11, 0, 7); c.fill();
      c.strokeStyle = '#909820'; c.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        c.beginPath(); c.moveTo(13 + i * 4, 292); c.quadraticCurveTo(10 + i * 4, 306, 8 + i * 5, 316); c.stroke();
      }

      // Kanga's hillside near ch4 (right)
      c.fillStyle = '#7a9a38'; c.beginPath(); c.arc(248, 262, 20, Math.PI, 0); c.fill();
      c.fillStyle = '#f8e8c0'; c.fillRect(242, 254, 10, 8);

      // Rabbit's hole near ch5 (bottom center)
      c.fillStyle = '#8a6020'; c.beginPath(); c.ellipse(134, 376, 12, 7, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#5a3810'; c.fillRect(122, 376, 24, 10);
      c.fillStyle = '#6a4818'; c.beginPath(); c.ellipse(134, 376, 10, 5, 0, Math.PI, 0); c.fill();

      // Compass rose (bottom-right corner)
      const crx = W - 22, cry = H - 22;
      g.circle(crx, cry, 10, '#c09828');
      g.rect(crx - 1, cry - 10, 2, 20, '#8a6808');
      g.rect(crx - 10, cry - 1, 20, 2, '#8a6808');
      api.txtC('N', crx, cry - 13, 5, '#6a4a10');
      return;
    }

    // Sunny Hundred Acre Wood (boot, intro, result, finale)
    const sky = c.createLinearGradient(0, 0, 0, H * 0.60);
    sky.addColorStop(0, '#5ab8f0');
    sky.addColorStop(0.65, '#90d8fc');
    sky.addColorStop(1, '#c0eafc');
    c.fillStyle = sky; c.fillRect(0, 0, W, Math.ceil(H * 0.64));

    // Sun
    const sx = W - 46, sy = 48;
    c.globalAlpha = 0.18 + 0.06 * Math.sin(t * 0.7);
    c.fillStyle = '#fff8a0'; c.beginPath(); c.arc(sx, sy, 34, 0, 7); c.fill();
    c.globalAlpha = 1;
    c.fillStyle = '#fff460'; c.beginPath(); c.arc(sx, sy, 22, 0, 7); c.fill();

    // Puffy clouds
    c.fillStyle = '#ffffff';
    [[30, 62], [118, 44], [192, 74]].forEach(([cx2, cy2]) => {
      const ox = Math.sin(t * 0.11 + cx2 * 0.04) * 5;
      c.beginPath(); c.arc(cx2 + ox, cy2, 17, 0, 7); c.fill();
      c.beginPath(); c.arc(cx2 + 13 + ox, cy2 + 5, 13, 0, 7); c.fill();
      c.beginPath(); c.arc(cx2 - 8 + ox, cy2 + 6, 11, 0, 7); c.fill();
    });

    // Far hills
    const hillY = Math.floor(H * 0.54);
    c.fillStyle = '#5aaa2a';
    c.beginPath(); c.moveTo(0, hillY);
    for (let x = 0; x <= W; x += 20) c.lineTo(x, hillY - 8 - ((x * 7 + 3) % 20));
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();

    // Ground
    c.fillStyle = '#68c038'; c.fillRect(0, Math.floor(H * 0.60), W, H);
    c.fillStyle = '#5aaa28'; c.fillRect(0, Math.floor(H * 0.60), W, 5);

    // Wildflowers
    for (let i = 0; i < 14; i++) {
      const fx = (i * 23 + 7) % W, fy = Math.floor(H * 0.66) + (i * 17) % 28;
      g.rect(fx, fy, 2, 7, '#4a9a20');
      g.circle(fx + 1, fy, 4, ['#ff6878', '#ffe878', '#ff70d8', '#78e8ff'][i % 4]);
    }

    // Pooh's oak (Sanders tree)
    const tlx = 28, tly = Math.floor(H * 0.60);
    c.fillStyle = '#7a4810'; c.fillRect(tlx + 10, tly - 66, 12, 66);
    c.fillStyle = '#4a8a22'; c.beginPath(); c.arc(tlx + 16, tly - 62, 28, 0, 7); c.fill();
    c.fillStyle = '#5aaa28'; c.beginPath(); c.arc(tlx + 22, tly - 72, 20, 0, 7); c.fill();
    c.fillStyle = '#3a2008'; c.fillRect(tlx + 11, tly - 22, 10, 22);
    c.fillStyle = '#2e1806';
    c.beginPath(); c.arc(tlx + 16, tly - 22, 5, Math.PI, 0); c.fill();
    g.rect(tlx + 2, tly - 46, 28, 12, '#e8c870');
    g.rectO(tlx + 2, tly - 46, 28, 12, '#c09820', 1);
    api.txtC('SANDERS', tlx + 16, tly - 42, 5, '#3a1808');

    // Right-side tree
    const trx = W - 36, try_ = Math.floor(H * 0.60);
    c.fillStyle = '#6a4010'; c.fillRect(trx + 8, try_ - 52, 10, 52);
    c.fillStyle = '#3a7a1a'; c.beginPath(); c.arc(trx + 13, try_ - 50, 22, 0, 7); c.fill();
    c.fillStyle = '#4a9a22'; c.beginPath(); c.arc(trx + 18, try_ - 60, 16, 0, 7); c.fill();

    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(28, 14, 4, 0.62)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ════════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id: 'pooh',
    title: 'Winnie-the-Pooh',
    subtitle: 'ADVENTURES IN THE HUNDRED ACRE WOOD',
    currency: 'HUNNY',
    accent: '#f0c820',
    credit: 'A PIXEL TRIBUTE · A. A. MILNE, 1926',
    emblem,
    scenery,
    bootCta: 'TAP TO EXPLORE',
    bootLine: '5 CHAPTERS · ONE VERY SMALL BEAR',
    menuLabel: 'THE HUNDRED ACRE WOOD',
    menuHint: 'WHERE TO, POOH BEAR?',
    menuDone: 'OH, BOTHER. ALL DONE!',

    menu: {
      // chapters as locations on a hand-drawn parchment map
      title(api, hunny) {
        // parchment band across the top
        api.gfx.rect(0, 0, api.W, 74, 'rgba(240,223,160,.95)');
        api.gfx.rect(0, 72, api.W, 2, '#8a6808');
        api.gfx.rect(0, 75, api.W, 1, '#c09828');
        api.txtC('THE HUNDRED ACRE WOOD', api.W / 2, 14, 8, '#6a4a10', true);
        api.txtC('HUNNY  ' + hunny, api.W / 2, 46, 9, '#e87820');
      },
      layout() {
        return [
          { x: 14,  y: 88,  w: 102, h: 56 }, // Pooh's House  – Balloon Heist
          { x: 152, y: 110, w: 104, h: 56 }, // Woozle Country – Woozle Hunt
          { x: 14,  y: 232, w: 102, h: 56 }, // Eeyore's Place – Eeyore's Party
          { x: 152, y: 232, w: 104, h: 56 }, // Kanga's House  – Blustery Day
          { x: 70,  y: 374, w: 128, h: 56 }, // Rabbit's Hole  – Stuck!
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2, cy = y + h / 2;
        // wooden sign plank
        c.fillStyle = sel ? '#c8920a' : '#a07418';
        c.fillRect(x + 2, y + 2, w - 4, h - 4);
        c.strokeStyle = sel ? '#f0e020' : '#786010';
        c.lineWidth = sel ? 2 : 1.5;
        c.strokeRect(x + 2, y + 2, w - 4, h - 4);
        // wood grain
        c.globalAlpha = 0.10;
        c.fillStyle = '#3a2008';
        for (let gy = y + 9; gy < y + h - 4; gy += 7) c.fillRect(x + 5, gy, w - 10, 1);
        c.globalAlpha = 1;
        // nail holes
        g.circle(x + 10, cy, 3, '#786010');
        g.circle(x + w - 10, cy, 3, '#786010');
        // chapter icon
        if (ch.icon) ch.icon(api, cx, cy - 5);
        // name
        api.txtC((i + 1) + '. ' + ch.name, cx, cy + 13, 7, done ? '#fff460' : '#f8e8b0');
        // done star
        if (done) g.circle(x + w - 16, y + 14, 5, '#f0c820');
      },
    },

    finale: [
      'OH, BOTHER.',
      'EVERY POT OF HUNNY',
      'HAS BEEN FOUND.',
      '',
      'A VERY SMALL BEAR,',
      'WITH A VERY LITTLE BRAIN,',
      'DID A VERY BIG THING.',
    ],
    width: 270, height: 480, parent: '#game',
    palette: {
      honey: '#f0c820', orange: '#f09020', green: '#5aaa28',
      brown: '#8a5a20', sky: '#5ab8f0', cream: '#f8e8c0',
    },

    chapters: [

      /* ══════════════════════════════════════════════════════════
       * CHAPTER 1 — BALLOON HEIST
       * Hold to rise, release to fall. Collect falling honey pots,
       * dodge bees. 8 pots = win, 3 stings = lose.
       * ══════════════════════════════════════════════════════════ */
      {
        id: 'balloon', name: 'BALLOON HEIST', sub: 'FLY HIGH FOR HUNNY',
        icon(api, x, y) {
          api.gfx.circle(x, y - 7, 7, '#e02828');
          api.gfx.rect(x, y, 1, 7, '#8a6030');
        },
        intro: [
          '"I SHALL FLOAT UP BY',
          'BALLOON AND THE BEES',
          'WILL THINK I AM',
          'A SMALL BLACK CLOUD."',
          '',
          'Pooh had thought',
          'of a very clever plan.',
        ],
        quote: "You never can tell with bees. Nobody can tell with bees.",
        help: 'HOLD to rise · release to fall · grab the HUNNY pots',
        winText: 'Eight pots! Pooh floats down considerably rounder than before.',
        loseText: 'Three stings later, the small-cloud idea is reconsidered.',
        init(api) {
          this.py = api.H * 0.5;
          this.pvy = 0;
          this.hunny = [];
          this.got = 0; this.need = 8;
          this.stings = 0;
          this.spawnH = 0.6;
          this.invuln = 0;
          this.bees = [
            { x: 60,  y: api.H * 0.27, vx: 1.3, ot: 0 },
            { x: 200, y: api.H * 0.50, vx: -1.1, ot: 1.2 },
            { x: 90,  y: api.H * 0.72, vx: 1.5, ot: 2.4 },
          ];
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H, cx = W / 2;
          const rising = api.pointer.down || api.keyDown('up') || api.keyDown('a');
          this.pvy += rising ? -0.18 * f : 0.22 * f;
          this.pvy = clamp(this.pvy, -5, 5);
          this.py = clamp(this.py + this.pvy, 48, H - 50);

          // spawn honey pots
          this.spawnH -= dt;
          if (this.spawnH <= 0) {
            this.spawnH = api.rnd(0.7, 1.4);
            this.hunny.push({ x: api.rnd(28, W - 28), y: -14, vy: api.rnd(0.35, 0.65) });
          }
          for (const h of this.hunny) h.y += h.vy * f;
          this.hunny = this.hunny.filter(h => h.y < H + 18);

          // bees patrol left/right, wobble vertically
          for (const b of this.bees) {
            b.ot += dt;
            b.x += b.vx * f;
            if (b.x > W - 12) { b.x = W - 12; b.vx = -Math.abs(b.vx); }
            if (b.x < 12)      { b.x = 12;     b.vx =  Math.abs(b.vx); }
            b.y += Math.sin(b.ot * 3.5) * 0.8;
          }

          // collect honey
          for (const h of this.hunny) {
            if (!h.got && Math.abs(h.x - cx) < 22 && Math.abs(h.y - this.py) < 22) {
              h.got = true; this.got++;
              api.score += 15; api.audio.sfx('coin');
              api.burst(h.x, h.y, '#f0c820', 10);
              if (this.got >= this.need) { api.score += 60; api.win(); return; }
            }
          }
          this.hunny = this.hunny.filter(h => !h.got);

          // bee stings
          if (this.invuln > 0) { this.invuln -= dt; }
          else {
            for (const b of this.bees) {
              if (Math.abs(b.x - cx) < 24 && Math.abs(b.y - this.py) < 22) {
                this.stings++;
                api.shake(6, 0.3); api.flash('#ff8800', 0.2); api.audio.sfx('hurt');
                this.invuln = 1.2;
                if (this.stings >= 3) { api.lose(); return; }
                break;
              }
            }
          }
          api.score = this.got * 15 + Math.floor(api.t * 2);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H, cx = W / 2;
          // sky
          const sk = c.createLinearGradient(0, 0, 0, H);
          sk.addColorStop(0, '#4ab0e8'); sk.addColorStop(1, '#90d8fc');
          c.fillStyle = sk; c.fillRect(0, 0, W, H);
          // clouds
          c.fillStyle = 'rgba(255,255,255,.88)';
          [[38,60],[142,38],[222,80]].forEach(([lx, ly]) => {
            c.beginPath(); c.arc(lx, ly, 15, 0, 7); c.fill();
            c.beginPath(); c.arc(lx + 11, ly + 5, 11, 0, 7); c.fill();
            c.beginPath(); c.arc(lx - 7, ly + 6, 9, 0, 7); c.fill();
          });
          // beehive (top right)
          g.rect(W - 38, 26, 26, 20, '#d89820'); g.rect(W - 38, 20, 26, 8, '#e8b430');
          api.txtC('HIVE', W - 25, 32, 6, '#3a1808');
          // ground
          g.rect(0, H - 38, W, 38, '#68c038'); g.rect(0, H - 38, W, 4, '#5aaa28');
          for (let i = 0; i < 7; i++) {
            const fx = i * 42 + 6; g.rect(fx, H - 38, 2, 8, '#4a9a20'); g.circle(fx + 1, H - 39, 4, '#ff6878');
          }

          // honey pots
          for (const h of this.hunny) {
            g.rect(h.x - 9, h.y - 8, 18, 16, '#e08018');
            g.rect(h.x - 10, h.y - 12, 20, 6, '#f0a030');
            g.rect(h.x - 4, h.y - 5, 8, 2, '#f8d880');
          }

          // bees
          for (const b of this.bees) {
            const fl = Math.floor(api.t * 14 + b.ot * 5) % 2;
            g.rect(b.x - 5, b.y - 2, 10, 6, '#f0c820');
            g.rect(b.x - 1, b.y - 2, 2, 6, '#101010');
            g.rect(b.x + 3, b.y - 2, 2, 6, '#101010');
            const wy = fl ? b.y - 5 : b.y - 4;
            g.rect(b.x - 7, wy, 5, 3, 'rgba(200,230,255,.85)');
            g.rect(b.x - 7, wy + 4, 5, 3, 'rgba(200,230,255,.85)');
          }

          // balloon string
          c.strokeStyle = '#8a6a30'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(cx, this.py - 14); c.lineTo(cx, this.py - 44); c.stroke();
          // balloon
          const blink = this.invuln > 0 && Math.floor(api.t * 10) % 2;
          if (!blink) {
            c.fillStyle = '#e02030';
            c.beginPath(); c.ellipse(cx, this.py - 54, 18, 22, 0, 0, 7); c.fill();
            c.fillStyle = 'rgba(255,255,255,.38)';
            c.beginPath(); c.ellipse(cx - 5, this.py - 60, 5, 8, -0.4, 0, 7); c.fill();
            g.rect(cx - 2, this.py - 32, 4, 4, '#c02028');
          }
          // Pooh hanging (simple orange bear)
          if (!blink) {
            g.rect(cx - 10, this.py - 14, 20, 22, '#f09020');
            g.rect(cx - 8,  this.py - 24, 16, 14, '#f09020');
            g.circle(cx - 6, this.py - 22, 3, '#e08018');
            g.circle(cx + 6, this.py - 22, 3, '#e08018');
            g.rect(cx - 4, this.py - 18, 8, 3, '#3a1808');
            g.circle(cx, this.py - 12, 4, '#e08018');
          }

          api.topBar('BALLOON HEIST');
          api.txt('HUNNY ' + this.got + '/' + this.need, 6, 20, 9, '#f0c820');
          for (let i = 0; i < 3; i++) g.rect(W - 46 + i * 15, 3, 11, 9, i < this.stings ? '#e02030' : '#f0c820');
          if (api.t < 3) api.txtC('HOLD TO RISE', cx, H - 56, 9, '#f8e8c0');
          api.vignette();
        },
      },

      /* ══════════════════════════════════════════════════════════
       * CHAPTER 2 — WOOZLE HUNT
       * A big arrow shows a direction (left/right). Tap matching
       * side of screen (or press arrow key) before the timer bar
       * empties. 8 correct = win, 3 wrong = lose.
       * ══════════════════════════════════════════════════════════ */
      {
        id: 'woozle', name: 'WOOZLE HUNT', sub: 'FOLLOW THE TRACKS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 10, y + 1, 7, 5, '#8a5a20');
          g.rect(x + 3, y - 2, 7, 5, '#8a5a20');
          g.rect(x - 11, y - 2, 2, 3, '#8a5a20');
          g.rect(x + 3, y + 5, 2, 3, '#8a5a20');
        },
        intro: [
          'POOH AND PIGLET',
          'GO ON A WOOZLE HUNT.',
          'THE TRACKS MULTIPLY.',
          'SOMETHING IS ODD.',
          '',
          'Where did they all',
          'come from?',
        ],
        quote: "Hallo! How very odd. There's another set of footprints now.",
        help: 'Tap ← LEFT or RIGHT → to follow the woozle tracks',
        winText: 'Of course! We were following our own tracks. How sensible.',
        loseText: 'Three wrong turns. The Woozle remains a mystery.',
        init(api) {
          this.correct = 0; this.need = 8; this.wrong = 0;
          this.dir = null; this.tLeft = 0; this.answered = false;
          this.flashCol = null; this.flashT = 0;
          this.snow = Array.from({ length: 28 }, (_, i) => ({
            x: (i * 73 + 5) % api.W, y: (i * 53 + 11) % api.H, r: 1 + i % 2,
          }));
          this._newPrompt(api);
        },
        _newPrompt(api) {
          this.dir = Math.random() < 0.5 ? 'left' : 'right';
          this.tLeft = Math.max(1.0, 2.4 - this.correct * 0.14);
          this.answered = false;
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          // drift snow
          for (const s of this.snow) {
            s.y += 0.5; s.x += Math.sin(api.t + s.y * 0.08) * 0.3;
            if (s.y > H) { s.y = 0; s.x = api.rnd(0, W); }
          }

          // flash cooldown
          if (this.flashT > 0) {
            this.flashT -= dt;
            if (this.flashT <= 0) {
              if (this.correct >= this.need) { api.score += 60; api.win(); return; }
              if (this.wrong < 3) this._newPrompt(api);
            }
            return;
          }

          this.tLeft -= dt;
          if (this.tLeft <= 0 && !this.answered) {
            // timed out = wrong
            this.wrong++;
            api.shake(5, 0.25); api.audio.sfx('hurt');
            this.flashCol = '#e85858'; this.flashT = 0.55;
            this.answered = true;
            if (this.wrong >= 3) { api.lose(); return; }
            return;
          }

          const tapL = (api.pointer.justDown && api.pointer.x < W / 2) || api.keyPressed('left');
          const tapR = (api.pointer.justDown && api.pointer.x >= W / 2) || api.keyPressed('right');
          if ((tapL || tapR) && !this.answered) {
            const tapDir = tapL ? 'left' : 'right';
            if (tapDir === this.dir) {
              this.correct++; api.score += 20; api.audio.sfx('coin');
              api.burst(W / 2, H * 0.48, '#f0c820', 8);
              this.flashCol = '#78e888'; this.flashT = 0.45; this.answered = true;
            } else {
              this.wrong++;
              api.shake(5, 0.25); api.audio.sfx('hurt');
              this.flashCol = '#e85858'; this.flashT = 0.55; this.answered = true;
              if (this.wrong >= 3) { api.lose(); return; }
            }
          }
          api.score = this.correct * 20;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // snowy ground and overcast sky
          g.rect(0, 0, W, H * 0.45, '#a8c4de');
          g.rect(0, H * 0.45, W, H * 0.55, '#e0eff8');
          // snow mounds
          c.fillStyle = '#d0e8f4';
          c.beginPath(); c.moveTo(0, H * 0.45);
          for (let x = 0; x <= W; x += 18) c.lineTo(x, H * 0.45 - 4 - ((x * 5 + 3) % 10));
          c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
          // bare winter trees
          [[14, H * 0.44], [82, H * 0.44], [W - 50, H * 0.44], [W - 18, H * 0.44]].forEach(([tx, ty]) => {
            c.fillStyle = '#7a6a60'; c.fillRect(tx + 3, ty - 42, 5, 42);
            c.strokeStyle = '#7a6a60'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(tx + 5, ty - 30); c.lineTo(tx - 8, ty - 48); c.stroke();
            c.beginPath(); c.moveTo(tx + 5, ty - 30); c.lineTo(tx + 18, ty - 48); c.stroke();
            g.rect(tx - 10, ty - 50, 10, 3, '#d8ecf8');
            g.rect(tx + 16, ty - 50, 10, 3, '#d8ecf8');
          });
          // snow particles
          c.globalAlpha = 0.7;
          this.snow.forEach(s => { c.fillStyle = '#fff'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); });
          c.globalAlpha = 1;

          // footprints trail
          const fpy = H * 0.58, fc = '#a8bec8';
          if (this.dir === 'left') {
            for (let i = 0; i < 6; i++) g.rect(W * 0.68 - i * 22, fpy + (i % 2) * 8, 10, 6, fc);
          } else {
            for (let i = 0; i < 6; i++) g.rect(W * 0.32 + i * 22, fpy + (i % 2) * 8, 10, 6, fc);
          }

          // Big direction arrow (fades as timer runs)
          const arrowAlpha = this.answered ? 0 : clamp(this.tLeft / 2.4 * 0.55 + 0.3, 0, 0.9);
          if (!this.answered && this.tLeft > 0) {
            c.globalAlpha = arrowAlpha;
            const ay = H * 0.33;
            if (this.dir === 'left') {
              // left-pointing arrow
              g.rect(W / 2 - 44, ay - 10, 48, 20, '#3a6a9a');
              g.rect(W / 2 - 66, ay - 22, 26, 44, '#3a6a9a');
            } else {
              g.rect(W / 2 - 4, ay - 10, 48, 20, '#3a6a9a');
              g.rect(W / 2 + 40, ay - 22, 26, 44, '#3a6a9a');
            }
            c.globalAlpha = 1;
          }

          // Pooh + Piglet figures at bottom
          g.rect(W * 0.28, H * 0.70, 18, 24, '#f09020'); // Pooh body
          g.rect(W * 0.30, H * 0.63, 14, 12, '#f09020'); // head
          g.rect(W * 0.50, H * 0.73, 11, 17, '#f0a8b0'); // Piglet body
          g.rect(W * 0.51, H * 0.68, 9, 10, '#f0a8b0');  // head

          // Flash response feedback
          if (this.flashT > 0 && this.flashCol) {
            api.txtC(this.flashCol === '#78e888' ? 'CORRECT!' : 'WRONG!',
              W / 2, H * 0.22, 14, this.flashCol);
          }

          // Timer bar
          const tFrac = clamp(this.tLeft / 2.4, 0, 1);
          g.rect(14, H - 22, W - 28, 10, '#2a3a4a');
          g.rect(14, H - 22, (W - 28) * tFrac, 10, '#4a8aaa');

          // Side tap hints (first 3 rounds)
          if (this.correct < 3 && !this.answered) {
            api.txtC('◄', W * 0.18, H * 0.33 + 8, 16, '#2a5a8a');
            api.txtC('►', W * 0.82, H * 0.33 + 8, 16, '#2a5a8a');
          }

          api.topBar('WOOZLE HUNT');
          api.txt('TRACKS ' + this.correct + '/' + this.need, 6, 20, 9, '#4ab0e0');
          api.txt('LOST ' + this.wrong + '/3', W - 74, 20, 9, this.wrong > 1 ? '#e05050' : '#b0b8c8');
          api.vignette();
        },
      },

      /* ══════════════════════════════════════════════════════════
       * CHAPTER 3 — EEYORE'S PARTY
       * Move Pooh left/right to catch birthday gifts. Honey pots
       * and balloons = good. Thistles = bad. 10 gifts = win.
       * ══════════════════════════════════════════════════════════ */
      {
        id: 'eeyore', name: "EEYORE'S PARTY", sub: "MANY HAPPY RETURNS",
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 7, y - 2, 14, 10, '#e82890');
          g.rect(x - 7, y - 5, 14, 4, '#f060a8');
          g.rect(x - 1, y - 8, 2, 15, '#ffe820');
          g.rect(x - 6, y - 4, 12, 2, '#ffe820');
        },
        intro: [
          'TODAY IS EEYORE\'S BIRTHDAY',
          'AND NOBODY REMEMBERED.',
          'POOH WANTS TO BRING',
          'A POT OF HONEY AND',
          'A NICE BLUE BALLOON.',
          '',
          'But first, he must catch them.',
        ],
        quote: "A little Consideration, a little Thought for Others makes all the difference.",
        help: 'Move Pooh LEFT / RIGHT to catch gifts · avoid the THISTLES',
        winText: 'Ten gifts gathered! Eeyore looks up. "For me? Well. Thank you. Bothered."',
        loseText: 'Too many thistles. Pooh sits down to think about it.',
        init(api) {
          this.px = api.W / 2; this.pvx = 0;
          this.items = []; this.spawnT = 0.5;
          this.got = 0; this.need = 10;
          this.stings = 0; this.invuln = 0;
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;
          // move Pooh
          if (api.pointer.down) { this.pvx = (api.pointer.x - this.px) * 0.22; }
          else {
            if (api.keyDown('left'))  this.pvx -= 0.5 * f;
            if (api.keyDown('right')) this.pvx += 0.5 * f;
            this.pvx *= Math.pow(0.78, f);
          }
          this.pvx = clamp(this.pvx, -6, 6);
          this.px = clamp(this.px + this.pvx, 18, W - 18);

          // spawn items
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.55, 1.0);
            const r = Math.random();
            const type = r < 0.48 ? 'honey' : r < 0.74 ? 'balloon' : 'thistle';
            this.items.push({ x: api.rnd(20, W - 20), y: -14, vy: api.rnd(0.9, 1.5) + this.got * 0.04, type });
          }
          // update items
          for (const it of this.items) it.y += it.vy * f;
          this.items = this.items.filter(it => it.y < H + 18);

          // catch / hit
          const catchY = H - 52;
          if (this.invuln > 0) this.invuln -= dt;
          for (const it of this.items) {
            if (!it.hit && it.y > catchY && it.y < catchY + 28 && Math.abs(it.x - this.px) < 26) {
              it.hit = true;
              if (it.type === 'thistle' && this.invuln <= 0) {
                this.stings++;
                api.shake(5, 0.25); api.flash('#e06080', 0.2); api.audio.sfx('hurt');
                this.invuln = 1.0;
                if (this.stings >= 3) { api.lose(); return; }
              } else if (it.type !== 'thistle') {
                this.got++;
                api.score += it.type === 'honey' ? 15 : 10;
                api.audio.sfx('coin');
                api.burst(it.x, it.y, it.type === 'honey' ? '#f0c820' : '#78c8ff', 8);
                if (this.got >= this.need) { api.score += 50; api.win(); return; }
              }
            }
          }
          this.items = this.items.filter(it => !it.hit);
          api.score = this.got * 12 + Math.floor(api.t * 2);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // warm grassy scene
          const sk = c.createLinearGradient(0, 0, 0, H * 0.5);
          sk.addColorStop(0, '#68b8f0'); sk.addColorStop(1, '#a8d8f8');
          c.fillStyle = sk; c.fillRect(0, 0, W, H);
          g.rect(0, H * 0.58, W, H, '#68c038');
          g.rect(0, H * 0.58, W, 5, '#5aaa28');
          // Eeyore (sad grey donkey, right side)
          const ex = W - 50, ey = H - 48;
          g.rect(ex, ey - 22, 30, 22, '#8a8a98');       // body
          g.rect(ex + 2, ey - 36, 14, 16, '#8a8a98');   // head
          g.rect(ex + 4, ey - 40, 4, 6, '#9a9aa8');     // ear
          g.rect(ex + 10, ey - 28, 3, 3, '#101010');    // eye
          g.rect(ex - 4, ey - 4, 5, 18, '#7a7a88');     // front legs
          g.rect(ex + 26, ey - 4, 5, 18, '#7a7a88');    // back leg
          // tail with bow
          g.rect(ex + 30, ey - 8, 8, 2, '#9a9aa8');
          g.circle(ex + 40, ey - 8, 4, '#e82890');
          // ground baseline
          g.rect(0, H - 40, W, 40, '#5aaa28');
          // items falling
          for (const it of this.items) {
            if (it.type === 'honey') {
              g.rect(it.x - 9, it.y - 8, 18, 16, '#e08018');
              g.rect(it.x - 10, it.y - 12, 20, 6, '#f0a030');
              g.rect(it.x - 4, it.y - 5, 8, 2, '#f8d880');
            } else if (it.type === 'balloon') {
              c.fillStyle = ['#e02030','#2890e0','#e8c020','#e030c0'][Math.floor(it.x / 50) % 4];
              c.beginPath(); c.ellipse(it.x, it.y - 8, 11, 14, 0, 0, 7); c.fill();
              g.rect(it.x, it.y + 6, 1, 8, '#8a6030');
            } else {
              // thistle (spiky purple)
              g.circle(it.x, it.y, 8, '#9060b0');
              for (let a = 0; a < 6; a++) {
                const ang = a / 6 * Math.PI * 2;
                g.rect(it.x + Math.cos(ang) * 9 - 1, it.y + Math.sin(ang) * 9 - 1, 2, 2, '#b878d8');
              }
            }
          }
          // Pooh (at bottom)
          g.rect(this.px - 12, H - 52, 24, 28, '#f09020');
          g.rect(this.px - 10, H - 64, 20, 16, '#f09020');
          g.circle(this.px - 7, H - 62, 3, '#e08018');
          g.circle(this.px + 7, H - 62, 3, '#e08018');
          g.rect(this.px - 5, H - 56, 10, 3, '#3a1808');
          g.circle(this.px, H - 50, 5, '#e08018');

          api.topBar("EEYORE'S PARTY");
          api.txt('GIFTS ' + this.got + '/' + this.need, 6, 20, 9, '#f0c820');
          for (let i = 0; i < 3; i++) g.rect(W - 46 + i * 15, 3, 11, 9, i < this.stings ? '#e02090' : '#f0c820');
          api.vignette();
        },
      },

      /* ══════════════════════════════════════════════════════════
       * CHAPTER 4 — BLUSTERY DAY
       * Piglet rises upward, blown by the wind. Steer LEFT/RIGHT
       * to slip through gaps in tree branches. 8 gaps = win.
       * ══════════════════════════════════════════════════════════ */
      {
        id: 'blustery', name: 'BLUSTERY DAY', sub: 'PIGLET BLOWS AWAY',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x - 2, y - 2, 6, '#c8d8ea');
          g.circle(x + 4, y, 5, '#c8d8ea');
          g.rect(x - 8, y + 5, 12, 2, '#a0b8d0');
          g.rect(x - 12, y + 9, 16, 2, '#a0b8d0');
        },
        intro: [
          'IT IS A VERY BLUSTERY DAY',
          'IN THE HUNDRED ACRE WOOD.',
          'PIGLET IS BLOWN',
          'HIGH INTO THE AIR.',
          '',
          'The only question is,',
          'where he\'ll land.',
        ],
        quote: "It's a little anxious to be a Very Small Animal in a Very Large Wood.",
        help: 'STEER Piglet LEFT / RIGHT through the gaps in the branches',
        winText: 'Piglet lands safely in Christopher Robin\'s arms. "Oh, Piglet!" "Oh, CR!"',
        loseText: 'Three branches. Piglet drifts sadly back to earth.',
        init(api) {
          this.px = api.W / 2;
          this.py = api.H - 50;
          this.pvx = 0;
          this.walls = [];
          this.wallSpd = 1.1;
          this.spawnT = 0.5;
          this.cleared = 0; this.need = 8;
          this.hits = 0; this.invuln = 0;
          this.leafs = Array.from({ length: 12 }, (_, i) => ({
            x: api.rnd(0, api.W), y: api.rnd(0, api.H),
            vx: api.rnd(-1, -0.3), vy: api.rnd(-0.5, 0.5), col: i % 2 ? '#5aaa28' : '#c8a030',
          }));
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;

          // steer Piglet
          if (api.pointer.down) { this.pvx += (api.pointer.x - this.px) * 0.15; }
          else {
            if (api.keyDown('left'))  this.pvx -= 0.4 * f;
            if (api.keyDown('right')) this.pvx += 0.4 * f;
          }
          this.pvx = clamp(this.pvx * Math.pow(0.82, f), -5, 5);
          this.px = clamp(this.px + this.pvx, 14, W - 14);
          // Piglet rises upward
          this.py -= this.wallSpd * 0.8 * f;
          if (this.py < -20) this.py = H + 20; // wrap: effectively resets

          // leaves drift left
          for (const lf of this.leafs) {
            lf.x += lf.vx * f; lf.y += lf.vy * f;
            if (lf.x < -6) { lf.x = W + 4; lf.y = api.rnd(0, H); }
          }

          // spawn branch walls (in world space below camera)
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(1.1, 1.7);
            const gapX = api.rnd(30, W - 90), gapW = 74;
            // walls move upward (py space) - use wallY in screen coords
            this.walls.push({ sy: H + 28, gapX, gapW, passed: false });
          }

          // walls rise upward
          for (const w of this.walls) w.sy -= this.wallSpd * f;
          this.wallSpd = Math.min(2.0, this.wallSpd + 0.0005 * f);
          this.walls = this.walls.filter(w => w.sy > -24);

          // collision / passage check at Piglet's y
          const pigY = H * 0.4; // Piglet visual position (fixed on screen)
          if (this.invuln > 0) this.invuln -= dt;
          for (const w of this.walls) {
            if (!w.passed && w.sy < pigY + 16 && w.sy > pigY - 14) {
              const inGap = this.px > w.gapX && this.px < w.gapX + w.gapW;
              w.passed = true;
              if (!inGap && this.invuln <= 0) {
                this.hits++;
                api.shake(6, 0.3); api.flash('#88c8f0', 0.2); api.audio.sfx('hurt');
                this.invuln = 1.0;
                if (this.hits >= 3) { api.lose(); return; }
              } else if (inGap) {
                this.cleared++;
                api.score += 18;
                api.audio.sfx('coin');
                api.burst(this.px, H * 0.4, '#f0a8b0', 7);
                if (this.cleared >= this.need) { api.score += 60; api.win(); return; }
              }
            }
          }
          api.score = this.cleared * 18;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // stormy sky
          const sk = c.createLinearGradient(0, 0, 0, H);
          sk.addColorStop(0, '#7898b0'); sk.addColorStop(1, '#a8b8c8');
          c.fillStyle = sk; c.fillRect(0, 0, W, H);
          // dark roiling clouds
          c.fillStyle = '#606878';
          [[30,50],[110,36],[200,56],[240,44]].forEach(([lx, ly]) => {
            c.beginPath(); c.arc(lx, ly, 26, 0, 7); c.fill();
            c.beginPath(); c.arc(lx + 20, ly + 8, 20, 0, 7); c.fill();
          });
          // wind streaks
          c.strokeStyle = 'rgba(200,220,240,.28)'; c.lineWidth = 1.5;
          for (let i = 0; i < 7; i++) {
            const wy = 80 + i * 56, wt = (api.t * 0.8 + i * 0.4) % 1;
            c.beginPath(); c.moveTo(-W * wt, wy); c.lineTo(-W * wt + 60, wy + 4); c.stroke();
          }
          // animated leaves
          for (const lf of this.leafs) {
            const a = Math.sin(api.t * 3 + lf.x * 0.1) * 0.5;
            c.globalAlpha = 0.7;
            c.fillStyle = lf.col;
            c.save(); c.translate(lf.x, lf.y); c.rotate(a);
            c.fillRect(-4, -3, 8, 5); c.restore();
          }
          c.globalAlpha = 1;
          // Christopher Robin's house at top (goal)
          if (this.cleared >= this.need - 2) {
            g.rect(W / 2 - 26, 10, 52, 34, '#f0e8c0');
            g.rect(W / 2 - 30, 6, 60, 8, '#e02030');
            api.txtC('C.R.', W / 2, 20, 7, '#5a3808');
          }

          // branch walls (draw as tree-branch pairs)
          const wallColor = '#4a3018', wallColor2 = '#6a4a28';
          for (const w of this.walls) {
            const wy = Math.round(w.sy);
            // left branch wall
            g.rect(0, wy - 14, w.gapX, 28, wallColor);
            g.rect(0, wy - 14, w.gapX, 3, wallColor2);
            g.rect(0, wy + 11, w.gapX, 3, wallColor2);
            // right branch wall
            const rx = w.gapX + w.gapW;
            g.rect(rx, wy - 14, W - rx, 28, wallColor);
            g.rect(rx, wy - 14, W - rx, 3, wallColor2);
            g.rect(rx, wy + 11, W - rx, 3, wallColor2);
            // leaves on branch ends
            g.circle(w.gapX, wy, 7, '#3a6a20');
            g.circle(rx, wy, 7, '#3a6a20');
          }

          // Piglet (fixed position, ~40% down screen)
          const pigX = this.px, pigY = H * 0.40;
          const blink = this.invuln > 0 && Math.floor(api.t * 10) % 2;
          if (!blink) {
            g.rect(pigX - 7, pigY - 10, 14, 18, '#f0a8b8'); // body
            g.rect(pigX - 5, pigY - 20, 10, 12, '#f0a8b8'); // head
            g.circle(pigX - 3, pigY - 22, 2, '#e89090');    // ear
            g.circle(pigX + 3, pigY - 22, 2, '#e89090');    // ear
            g.rect(pigX - 3, pigY - 14, 6, 2, '#101010');   // eyes
            g.circle(pigX, pigY - 10, 3, '#e89090');        // nose
            // scarf (blown back)
            g.rect(pigX + 6, pigY - 12, 10, 2, '#e82030');
            g.rect(pigX + 14, pigY - 12, 2, 8, '#e82030');
          }

          api.topBar('BLUSTERY DAY');
          api.txt('GAPS ' + this.cleared + '/' + this.need, 6, 20, 9, '#88c8e8');
          for (let i = 0; i < 3; i++) g.rect(W - 46 + i * 15, 3, 11, 9, i < this.hits ? '#e02030' : '#88c8e8');
          api.vignette();
        },
      },

      /* ══════════════════════════════════════════════════════════
       * CHAPTER 5 — STUCK!
       * Pooh is stuck in Rabbit's door. Alternate left/right taps
       * to wiggle him free. 12 correct alternations = win.
       * Wrong tap (same side twice) = one of 4 chances gone.
       * ══════════════════════════════════════════════════════════ */
      {
        id: 'stuck', name: 'STUCK!', sub: "OH, BOTHER.",
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 4, y - 8, 8, 18, '#7a4810');
          g.circle(x, y - 8, 7, '#8a5a18');
          g.circle(x, y - 8, 5, '#6a4010');
          g.circle(x + 2, y - 7, 2, '#3a1808');
        },
        intro: [
          'POOH ATE TOO MUCH',
          'AND IS STUCK IN',
          'RABBIT\'S FRONT DOOR.',
          '',
          '"It all comes of',
          'eating too much,"',
          'said Rabbit sternly.',
        ],
        quote: "He ate and ate and ate and ate until at last... he was stuck.",
        help: 'Alternate TAP ← LEFT and RIGHT → to wiggle Pooh free',
        winText: 'POP! Pooh sails out like a cork. "And that," said Rabbit, "is that."',
        loseText: 'Pooh is firmly fixed. Rabbit uses the North entrance from now on.',
        init(api) {
          this.meter = 0; this.need = 12;
          this.lastSide = null; this.wrong = 0;
          this.wobble = 0; this.wobbleDir = 1;
          this.justWrong = 0;
          this.justRight = 0;
        },
        update(api, dt) {
          const W = api.W;
          // meter very slowly drains for pressure
          if (this.meter > 0 && this.lastSide !== null) this.meter -= 0.15 * dt;
          this.meter = clamp(this.meter, 0, this.need);

          // wobble animation
          this.wobble += this.wobbleDir * dt * 6;
          if (this.wobble > 1) { this.wobble = 1; this.wobbleDir = -1; }
          if (this.wobble < -1) { this.wobble = -1; this.wobbleDir = 1; }

          this.justWrong -= dt; this.justRight -= dt;

          const tapL = (api.pointer.justDown && api.pointer.x < W / 2) || api.keyPressed('left');
          const tapR = (api.pointer.justDown && api.pointer.x >= W / 2) || api.keyPressed('right');
          if (tapL || tapR) {
            const side = tapL ? 'left' : 'right';
            const correct = this.lastSide === null || this.lastSide !== side;
            if (correct) {
              this.meter = Math.min(this.need, this.meter + 1.5);
              this.lastSide = side;
              api.score += 10;
              api.audio.sfx('coin');
              api.shake(2, 0.10);
              this.justRight = 0.4;
              if (this.meter >= this.need) { api.score += 80; api.win(); }
            } else {
              this.wrong++;
              api.shake(5, 0.3); api.flash('#f09020', 0.2); api.audio.sfx('hurt');
              this.meter = Math.max(0, this.meter - 0.5);
              this.justWrong = 0.5;
              if (this.wrong >= 4) { api.lose(); }
            }
          }
          api.score = Math.floor(this.meter * 10 + api.t * 2);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // underground/burrow background
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#c8a048'); bg.addColorStop(0.35, '#a07828'); bg.addColorStop(1, '#6a5018');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);
          // soil texture
          c.globalAlpha = 0.08;
          for (let y = 0; y < H; y += 5) { c.fillStyle = '#3a1808'; c.fillRect(0, y, W, 2); }
          c.globalAlpha = 1;
          // grass strip at top
          g.rect(0, 0, W, 54, '#68c038');
          g.rect(0, 52, W, 6, '#5aaa28');
          for (let i = 0; i < 12; i++) {
            const gx = i * 26 + 5; g.rect(gx, 48, 3, 10, '#4a9a20'); g.rect(gx + 8, 50, 3, 8, '#5aaa28');
          }
          // sky seen from below
          g.rect(0, 0, W, 30, '#5ab8f0');
          g.circle(W - 50, 18, 10, '#fff460');

          // round door hole (seen from inside)
          const doorX = W / 2, doorY = 56;
          c.fillStyle = '#3a2008'; c.beginPath(); c.ellipse(doorX, doorY, 34, 28, 0, 0, 7); c.fill();
          c.strokeStyle = '#c07810'; c.lineWidth = 3; c.beginPath(); c.ellipse(doorX, doorY, 34, 28, 0, 0, 7); c.stroke();
          // sky through door
          c.save(); c.beginPath(); c.ellipse(doorX, doorY, 31, 24, 0, 0, 7); c.clip();
          g.rect(doorX - 32, doorY - 26, 63, 52, '#5ab8f0');
          g.rect(doorX - 32, doorY, 63, 26, '#68c038');
          c.restore();

          // Pooh stuck: lower half visible from below (orange bottom + legs)
          const wo = Math.round(this.wobble * 3);
          const py = doorY + 14;
          g.rect(doorX - 16 + wo, py, 32, 30, '#f09020'); // rump
          g.rect(doorX - 14 + wo, py + 8, 10, 22, '#e08018'); // left leg
          g.rect(doorX + 4 + wo, py + 8, 10, 22, '#e08018');  // right leg
          g.rect(doorX - 12 + wo, py + 28, 9, 7, '#c06010'); // left foot
          g.rect(doorX + 3 + wo, py + 28, 9, 7, '#c06010');  // right foot
          // Pooh's upper half peeking (head tilted out of door above)
          g.rect(doorX - 11 + wo, doorY - 28, 22, 18, '#f09020');
          g.rect(doorX - 9 + wo, doorY - 40, 18, 15, '#f09020');
          g.circle(doorX - 8 + wo, doorY - 40, 3, '#e08018');
          g.circle(doorX + 5 + wo, doorY - 40, 3, '#e08018');
          g.rect(doorX - 5 + wo, doorY - 33, 10, 3, '#3a1808');
          g.circle(doorX + wo, doorY - 28, 5, '#e08018');

          // Rabbit peeking from side (annoyed)
          g.rect(W - 38, doorY - 10, 20, 24, '#f0f0e0');
          g.rect(W - 36, doorY - 24, 16, 18, '#f0f0e0');
          g.rect(W - 34, doorY - 36, 4, 14, '#f0c0c0');
          g.rect(W - 28, doorY - 36, 4, 14, '#f0c0c0');
          g.rect(W - 34, doorY - 18, 3, 2, '#101010');
          g.rect(W - 28, doorY - 18, 3, 2, '#101010');

          // wiggle meter
          const mFrac = clamp(this.meter / this.need, 0, 1);
          const mx = 20, my = H - 52, mw = W - 40;
          g.rect(mx, my, mw, 16, '#3a2808');
          g.rect(mx, my, Math.round(mw * mFrac), 16, '#f0c820');
          g.rectO(mx, my, mw, 16, '#e8a820', 1);
          api.txtC('WIGGLE!', W / 2, my + 22, 9, '#f8e8b0');

          // feedback flash
          if (this.justRight > 0) api.txtC('GOOD!', W / 2, H * 0.72, 12, '#78e888');
          if (this.justWrong > 0) api.txtC('OTHER SIDE!', W / 2, H * 0.72, 9, '#e85858');

          // side tap hints
          api.txtC('◄ TAP', W * 0.2, H * 0.80, 9, '#c8a040');
          api.txtC('TAP ►', W * 0.8, H * 0.80, 9, '#c8a040');

          api.topBar('STUCK!');
          api.txt('WIGGLES ' + Math.floor(this.meter) + '/' + this.need, 6, 20, 9, '#f0c820');
          api.txt('SLIP ' + this.wrong + '/4', W - 74, 20, 9, this.wrong > 2 ? '#e85858' : '#c8a040');
          api.vignette();
        },
      },

    ], // end chapters
  }); // end RetroSaga.create
})();
