/* ============================================================================
 * ROMEO AND JULIET — STAR-CROSS'D
 * Five scenes from Shakespeare's tragedy (c.1594–96):
 *   1. THE FEAST     — dodge Capulet guests, collect roses at the ball
 *   2. THE BALCONY   — pendulum-timing climb to reach Juliet above
 *   3. THE DUEL      — parry Tybalt's blade, counter-strike five times
 *   4. FRIAR'S CELL  — catch sleeping herbs, avoid poison vials
 *   5. THE TOMB      — sprint through Verona past watchmen to the vault
 * Built on RetroSaga (js/saga.js) · NES-honest palette throughout.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ======================== NES PALETTE ======================== */
  const C = {
    black:    '#000000',
    night:    '#000078',   // deep Verona midnight
    blue:     '#0000BC',
    sky:      '#1854A0',   // night sky blue
    skyMid:   '#3078C8',
    crimson:  '#A80020',   // Capulet red
    redBrt:   '#F83800',   // danger / Tybalt flash
    gold:     '#F8B800',   // Montague gold
    amber:    '#AC7C00',   // warm amber
    orange:   '#FC7460',   // torch glow
    skin:     '#FCA044',
    rose:     '#F878F8',   // Juliet pink
    magenta:  '#D800CC',   // deep Juliet magenta
    ivory:    '#F8D8B0',   // parchment
    cream:    '#FCE0A8',
    white:    '#F8F8F8',
    grey:     '#7C7C7C',   // Verona stone
    silver:   '#BCBCBC',
    green:    '#007800',   // garden ivy
    greenBrt: '#58D854',
    purple:   '#4428BC',
    lavender: '#9878F8',
    stoneDk:  '#484038',   // dark stone wall
    stoneMid: '#706858',
    stoneLt:  '#A89878',
  };

  /* ======================== HELPERS ======================== */
  // Draw a simple Italianate arch window (flat fills, NES-honest)
  function archWindow(g, c, cx, cy, w, h, fill, border, glow) {
    const hw = Math.floor(w / 2);
    const aH = Math.floor(hw * 0.9);  // arch top height
    if (glow) {
      c.globalAlpha = 0.28;
      c.fillStyle = C.gold;
      c.fillRect(cx - hw - 4, cy - h - aH - 4, w + 8, h + aH + 8);
      c.globalAlpha = 1;
    }
    c.fillStyle = fill;
    c.fillRect(cx - hw, cy - h, w, h);          // rect body
    c.fillRect(cx - hw, cy - h - aH, w, aH);    // arch block
    // Corner cutouts to suggest curve
    c.fillStyle = border;
    c.fillRect(cx - hw, cy - h - aH, 4, 4);
    c.fillRect(cx + hw - 4, cy - h - aH, 4, 4);
    // Border lines
    c.fillStyle = border;
    c.fillRect(cx - hw - 2, cy - h - aH - 2, 2, h + aH + 4); // left
    c.fillRect(cx + hw,     cy - h - aH - 2, 2, h + aH + 4); // right
    c.fillRect(cx - hw - 2, cy,               w + 4,  2);      // bottom
    c.fillRect(cx - hw - 2, cy - h - aH - 2, w + 4,  2);      // top
  }

  function drawStar(g, cx, cy, r, col) {
    g.rect(cx - r, cy - 1, r * 2, 3, col);
    g.rect(cx - 1, cy - r, 3, r * 2, col);
    g.rect(cx - 2, cy - 2, 5, 5, col);
  }

  /* ======================== EMBLEM ========================= */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Two interlocked hearts (Romeo = gold, Juliet = rose)
    // Heart left (Romeo)
    const lx = cx - 10;
    g.circle(lx, cy - 6, 7, C.gold);
    g.circle(lx + 8, cy - 6, 7, C.gold);
    g.rect(lx - 6, cy - 2, 22, 14, C.gold);
    // Triangle bottom
    for (let i = 0; i < 10; i++) {
      g.rect(lx - 6 + i, cy + 12 - i, 22 - i * 2, 2, C.gold);
    }
    // Heart right (Juliet) overlapping
    const rx = cx + 10;
    g.circle(rx, cy - 6, 7, C.rose);
    g.circle(rx + 8, cy - 6, 7, C.rose);
    g.rect(rx - 6, cy - 2, 22, 14, C.rose);
    for (let i = 0; i < 10; i++) {
      g.rect(rx - 6 + i, cy + 12 - i, 22 - i * 2, 2, C.rose);
    }
    // Center overlap
    g.circle(cx + 2, cy - 5, 6, C.magenta);
    g.rect(cx - 3, cy - 1, 12, 10, C.magenta);
    // Stars
    drawStar(g, cx - 24, cy - 18, 3, C.gold);
    drawStar(g, cx + 24, cy - 22, 3, C.rose);
    drawStar(g, cx,      cy - 30, 2, C.cream);
  }

  /* ======================== SCENERY ========================= */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Night sky — deep Verona blue bands
    c.fillStyle = C.night;    c.fillRect(0, 0, W, H);
    c.fillStyle = C.sky;      c.fillRect(0, 0, W, H * 0.44);
    c.fillStyle = C.skyMid;   c.fillRect(0, 0, W, H * 0.18);

    // Stars (static scatter, NES-honest dots)
    const STARS = [
      [22,18],[58,12],[95,8],[140,15],[178,9],[220,20],[246,14],
      [12,36],[70,34],[110,28],[152,40],[195,32],[238,44],
      [40,55],[88,50],[130,62],[170,48],[210,58],[255,52],
    ];
    for (const [sx, sy] of STARS) {
      const twinkle = Math.floor(t * 1.8 + sx * 0.3 + sy * 0.2) % 3;
      if (twinkle !== 0) g.rect(sx, sy, 2, 2, C.cream);
    }

    // Moon (crescent)
    const mx = 220 + Math.sin(t * 0.05) * 2, my = 35;
    g.circle(mx, my, 16, C.ivory);
    g.circle(mx + 7, my - 4, 13, C.sky);  // bite out

    // Verona building silhouettes
    // Left palazzo
    c.fillStyle = C.stoneDk;
    c.fillRect(0, H * 0.30, 62, H * 0.70);
    c.fillRect(0, H * 0.22, 50, H * 0.10);   // upper section
    // Crenellations on left
    for (let i = 0; i < 4; i++) c.fillRect(i * 14, H * 0.22 - 10, 9, 11, C.stoneDk);
    // Right palazzo
    c.fillStyle = C.stoneDk;
    c.fillRect(W - 62, H * 0.30, 62, H * 0.70);
    c.fillRect(W - 50, H * 0.22, 50, H * 0.10);
    for (let i = 0; i < 4; i++) c.fillRect(W - 50 + i * 14, H * 0.22 - 10, 9, 11, C.stoneDk);

    // Arch windows glowing in buildings
    archWindow(g, c, 28, H * 0.48, 30, 36, C.amber + '88', C.amber, false);
    archWindow(g, c, W - 28, H * 0.48, 30, 36, C.amber + '88', C.amber, false);

    // Center archway (Verona piazza arch)
    c.fillStyle = C.stoneMid;
    c.fillRect(90, H * 0.52, 90, H * 0.48);  // center building
    archWindow(g, c, W / 2, H * 0.72, 36, 52, C.orange + 'AA', C.stoneLt, false);
    // Arch over piazza
    c.fillStyle = C.stoneDk;
    c.fillRect(72, H * 0.38, 28, H * 0.16);  // left arch leg
    c.fillRect(W - 100, H * 0.38, 28, H * 0.16); // right arch leg
    c.fillRect(72, H * 0.38, W - 144, 18);   // arch lintel

    // Cobblestone ground
    c.fillStyle = C.stoneMid;
    c.fillRect(0, H * 0.84, W, H * 0.16);
    c.globalAlpha = 0.18;
    c.fillStyle = C.black;
    for (let cx2 = 0; cx2 < W; cx2 += 22)
      c.fillRect(cx2, H * 0.84, 1, H * 0.16);
    for (let cy2 = H * 0.86; cy2 < H; cy2 += 16)
      c.fillRect(0, cy2, W, 1);
    c.globalAlpha = 1;

    // Torches on buildings (animated flicker)
    const flicker = Math.sin(t * 7.4) * 2;
    for (const tx of [54, W - 54]) {
      g.rect(tx - 3, H * 0.36, 6, 12, C.stoneLt);
      g.rect(tx - 4, H * 0.32 + flicker, 8, 8, C.redBrt);
      g.rect(tx - 3, H * 0.30 + flicker, 6, 6, C.gold);
      c.globalAlpha = 0.22;
      c.fillStyle = C.orange;
      c.fillRect(tx - 12, H * 0.28 + flicker, 24, 20);
      c.globalAlpha = 1;
    }

    // Ivy vines on walls
    c.fillStyle = C.green;
    for (let i = 0; i < 5; i++) {
      c.fillRect(4 + i * 10, H * 0.30 + i * 14, 6, 8);
      c.fillRect(W - 10 - i * 10, H * 0.32 + i * 12, 6, 8);
    }

    // Dim overlay for result/finale screens
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(0,0,16,.82)';
      c.fillRect(0, 0, W, H);
    }
  }

  /* ============ MENU LAYOUT — Verona building facade =========== */
  // Five lit windows arranged on a Verona palazzo facade (non-list)
  //   [0] upper-left  [1] upper-right  [2] center  [3] lower-left  [4] lower-right
  const WINDOW_POSITIONS = [
    { x: 16,  y: 108, w: 90, h: 76 },
    { x: 164, y: 108, w: 90, h: 76 },
    { x: 90,  y: 210, w: 90, h: 76 },
    { x: 16,  y: 322, w: 90, h: 76 },
    { x: 164, y: 322, w: 90, h: 76 },
  ];

  const SCENE_NAMES = ['THE FEAST', 'THE BALCONY', 'THE DUEL', "FRIAR'S CELL", 'THE TOMB'];

  function drawMenuTitle(api, respect) {
    const g = api.gfx, c = api.ctx, W = api.W;
    // Stone cartouche at top
    c.fillStyle = C.stoneMid;
    c.fillRect(8, 8, W - 16, 74);
    c.fillStyle = C.stoneDk;
    c.fillRect(8, 8, W - 16, 2);
    c.fillRect(8, 80, W - 16, 2);
    c.fillRect(8, 8, 2, 74);
    c.fillRect(W - 10, 8, 2, 74);
    // Inner line
    c.fillStyle = C.amber;
    c.fillRect(14, 14, W - 28, 1);
    c.fillRect(14, 76, W - 28, 1);
    // Corner stars
    drawStar(g, 14, 14, 3, C.gold);
    drawStar(g, W - 14, 14, 3, C.gold);
    drawStar(g, 14, 76, 3, C.gold);
    drawStar(g, W - 14, 76, 3, C.gold);
    // Text
    api.txtCFit('ROMEO & JULIET', W / 2, 20, 11, C.gold, true);
    api.txtC('STAR-CROSS\'D', W / 2, 40, 8, C.rose, false);
    api.txtC('W. SHAKESPEARE', W / 2, 54, 7, C.ivory, false);
    api.txtC('HEARTS  ' + respect, W / 2, 68, 8, C.gold, false);
  }

  function drawMenuCard(api, info) {
    const { ch, i, x, y, w, h, sel, done, best } = info;
    const g = api.gfx, c = api.ctx;
    const cx = x + w / 2, cy = y + h / 2;
    const t = api.t;

    // Window frame — stone surround
    c.fillStyle = sel ? C.stoneLt : C.stoneMid;
    c.fillRect(x - 4, y - 4, w + 8, h + 8);
    // Corner stones
    c.fillStyle = C.stoneDk;
    c.fillRect(x - 4, y - 4, 10, 10);
    c.fillRect(x + w - 6, y - 4, 10, 10);
    c.fillRect(x - 4, y + h - 6, 10, 10);
    c.fillRect(x + w - 6, y + h - 6, 10, 10);
    // Arch top
    const archH = Math.floor(w / 2 * 0.7);
    c.fillStyle = sel ? C.stoneLt : C.stoneMid;
    c.fillRect(x - 4, y - 4 - archH, w + 8, archH + 6);
    c.fillStyle = C.stoneDk;
    c.fillRect(x - 4, y - 4 - archH, w + 8, 3);

    // Window interior (warm candlelight glow when selected, dim otherwise)
    const winFill = done ? C.amber : (sel ? C.orange : C.stoneDk);
    c.fillStyle = winFill;
    c.fillRect(x, y, w, h);
    // Arch interior
    c.fillStyle = winFill;
    c.fillRect(x, y - archH, w, archH);
    // Glow overlay when selected
    if (sel) {
      c.globalAlpha = 0.18 + Math.abs(Math.sin(t * 3.2)) * 0.14;
      c.fillStyle = C.gold;
      c.fillRect(x - 6, y - archH - 6, w + 12, h + archH + 12);
      c.globalAlpha = 1;
    }

    // Chapter icon centered in window
    if (ch.icon) ch.icon(api, cx, cy - 8);

    // Scene label at bottom of window
    api.txtCFit(SCENE_NAMES[i], cx, y + h - 22, 7, sel ? C.gold : (done ? C.gold : C.ivory), false, w - 6);
    if (ch.sub) api.txtCFit(ch.sub, cx, y + h - 10, 6, done ? C.amber : C.grey, false, w - 6);

    // Done: golden seal
    if (done) {
      g.circle(x + w - 10, y + 10, 8, C.gold);
      api.txtC('✓', x + w - 10, y + 4, 9, C.black, false);
    }

    // Selection shimmer
    if (sel) {
      c.globalAlpha = 0.25;
      c.fillStyle = C.rose;
      c.fillRect(x - 4, y - 4 - archH, w + 8, 2);
      c.fillRect(x - 4, y + h + 4, w + 8, 2);
      c.globalAlpha = 1;
    }
  }

  function drawMenuConnectors(api) {
    const c = api.ctx;
    c.fillStyle = C.stoneDk;
    // Rose-vine connectors between windows
    const connections = [
      [0, 2], [1, 2], [2, 3], [2, 4],
    ];
    for (const [a, b] of connections) {
      const pa = WINDOW_POSITIONS[a], pb = WINDOW_POSITIONS[b];
      const ax = pa.x + pa.w / 2, ay = pa.y + pa.h / 2;
      const bx = pb.x + pb.w / 2, by = pb.y + pb.h / 2;
      c.globalAlpha = 0.22;
      c.fillStyle = C.rose;
      // Dotted rose vine
      const dx = bx - ax, dy = by - ay;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len, ny = dy / len;
      for (let d = 14; d < len - 14; d += 12) {
        c.fillRect(ax + nx * d - 2, ay + ny * d - 2, 4, 4);
      }
      c.globalAlpha = 1;
    }
  }

  /* ======================== CHAPTER 1: THE FEAST ======================== */
  // Romeo dodges Capulet guests (left/right movers) and catches falling roses.
  // Collect 12 roses; 3 guest-collisions = lose. Timer 24s.
  const chFeast = {
    id: 'feast',
    name: 'THE FEAST',
    sub: 'Crash the Capulet ball',
    intro: [
      'Romeo, a Montague,',
      'dons a mask and slips',
      'into the Capulet feast.',
      'Catch Juliet\'s roses',
      'before Tybalt sees you!'
    ],
    quote: '"Did my heart love till now? Forswear it, sight! For I ne\'er saw true beauty till this night." — Act I',
    help: 'STEER left/right to CATCH roses. Dodge Capulet guests or lose a life. Collect 12 roses to win!',
    icon(api, x, y) {
      const g = api.gfx;
      // Masked Romeo head
      g.circle(x, y - 8, 6, C.skin);
      g.rect(x - 6, y - 11, 12, 5, C.purple);  // mask
      g.rect(x - 4, y - 2, 9, 10, C.blue);     // doublet
      // Rose
      g.circle(x + 10, y - 5, 4, C.rose);
      g.rect(x + 9, y - 2, 2, 7, C.green);
    },
    init(api) {
      this.px = api.W / 2;
      this.lives = 3;
      this.roses = 0;
      this.need = 12;
      this.timer = 24;
      this.guests = [];
      this.drops = [];
      this.guestT = 0;
      this.dropT = 0;
      this.iframes = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.timer -= dt;
      if (this.timer <= 0 && this.roses < this.need) { api.lose(); return; }
      if (this.iframes > 0) this.iframes -= dt;

      // Steer Romeo
      const spd = 105;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.pointer.down)     this.px += api.pointer.dx * 1.1;
      this.px = clamp(this.px, 12, W - 12);

      // Spawn guests (left/right movers across 3 row-lanes)
      this.guestT -= dt;
      const gRate = Math.max(0.55, 1.4 - (24 - Math.max(0, this.timer)) * 0.025);
      if (this.guestT <= 0) {
        this.guestT = gRate + Math.random() * 0.3;
        const lane = Math.floor(Math.random() * 3);
        const fromLeft = Math.random() < 0.5;
        this.guests.push({
          x: fromLeft ? -24 : W + 24,
          lane,
          vx: (fromLeft ? 1 : -1) * (52 + Math.random() * 36),
          col: [C.crimson, C.purple, C.stoneMid, C.blue, C.amber][Math.floor(Math.random() * 5)],
        });
      }

      // Spawn falling roses
      this.dropT -= dt;
      if (this.dropT <= 0) {
        this.dropT = 0.65 + Math.random() * 0.4;
        this.drops.push({
          x: 16 + Math.random() * (W - 32),
          y: -14,
          vy: 68 + Math.random() * 44,
        });
      }

      // Move guests
      for (const g2 of this.guests) g2.x += g2.vx * dt;
      this.guests = this.guests.filter(g2 => g2.x > -40 && g2.x < W + 40);

      // Move drops
      for (const d of this.drops) d.y += d.vy * dt;

      // Collect roses
      const py = H - 52;
      for (let i = this.drops.length - 1; i >= 0; i--) {
        const d = this.drops[i];
        if (d.y > H + 20) { this.drops.splice(i, 1); continue; }
        if (Math.abs(d.x - this.px) < 20 && d.y > py - 14 && d.y < py + 20) {
          this.drops.splice(i, 1);
          this.roses++;
          api.addScore(30);
          api.audio.sfx('coin');
          api.burst(this.px, py, C.rose, 8);
          if (this.roses >= this.need) { api.addScore(300); api.win(); return; }
        }
      }

      // Guest collision
      if (this.iframes <= 0) {
        const LANES_Y = [H * 0.42, H * 0.56, H * 0.70];
        for (const g2 of this.guests) {
          const gy = LANES_Y[g2.lane];
          if (Math.abs(g2.x - this.px) < 22 && Math.abs(gy - py) < 28) {
            this.lives--;
            this.iframes = 1.0;
            api.shake(4, 0.28); api.flash(C.crimson, 0.18); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
        }
      }

      api.addScore(dt * 8);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Banquet hall interior — warm candlelight
      c.fillStyle = C.stoneMid; c.fillRect(0, 0, W, H);
      c.fillStyle = C.amber;    c.fillRect(0, 0, W, H * 0.22);
      c.fillStyle = C.stoneDk;  c.fillRect(0, H * 0.22, W, H * 0.06);

      // Decorative tapestry strips
      c.fillStyle = C.crimson;
      for (let tx = 0; tx < W; tx += 40) {
        c.fillRect(tx, 0, 8, H * 0.28);
        c.fillStyle = C.gold; c.fillRect(tx + 2, 4, 4, 18); c.fillStyle = C.crimson;
      }

      // Floor tiles
      c.fillStyle = C.stoneLt;
      for (let fx = 0; fx < W; fx += 30) c.fillRect(fx, H * 0.28, 1, H * 0.72);
      c.fillStyle = C.stoneDk;
      for (let fy = H * 0.35; fy < H; fy += 30) c.fillRect(0, fy, W, 1);

      // Candles on tables
      for (let tx = 28; tx < W; tx += 54) {
        g.rect(tx - 3, H * 0.78, 6, 16, C.ivory);
        g.rect(tx - 1, H * 0.74, 3, 5, C.gold);
        c.globalAlpha = 0.18;
        c.fillStyle = C.gold;
        c.fillRect(tx - 10, H * 0.68, 20, 14);
        c.globalAlpha = 1;
      }

      // Guests (3 row-lanes)
      const LANES_Y = [H * 0.42, H * 0.56, H * 0.70];
      for (const g2 of this.guests) {
        const gy = LANES_Y[g2.lane];
        const step = Math.floor(api.t * 5 + g2.x * 0.2) % 2;
        g.circle(g2.x, gy - 14, 6, C.skin);
        g.rect(g2.x - 5, gy - 8, 11, 14, g2.col);
        if (step) {
          g.rect(g2.x - 4, gy + 6, 4, 8, g2.col);
          g.rect(g2.x + 1, gy + 6, 4, 9, g2.col);
        } else {
          g.rect(g2.x - 4, gy + 6, 4, 9, g2.col);
          g.rect(g2.x + 1, gy + 6, 4, 8, g2.col);
        }
      }

      // Falling roses
      for (const d of this.drops) {
        g.circle(d.x, d.y, 6, C.rose);
        g.rect(d.x - 1, d.y + 4, 2, 7, C.green);
        g.rect(d.x - 4, d.y + 6, 8, 3, C.green);
      }

      // Romeo (mask, doublet)
      const py = H - 52;
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        g.circle(this.px, py - 14, 7, C.skin);
        g.rect(this.px - 7, py - 18, 14, 6, C.purple); // mask
        g.rect(this.px - 6, py - 7, 13, 16, C.blue);   // doublet
        g.rect(this.px - 8, py - 4, 5, 12, C.blue);
        g.rect(this.px + 4, py - 4, 5, 12, C.blue);
        g.rect(this.px - 6, py + 9, 12, 6, C.stoneDk); // hose
      }

      // HUD
      api.topBar('FEAST  ROSES: ' + this.roses + '/' + this.need + '  ⧗ ' + Math.ceil(this.timer));
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.rose : C.night);
      }
    },
  };

  /* ======================== CHAPTER 2: THE BALCONY ======================== */
  // Pendulum timing: tap when angle is in gold zone to boost Romeo up the wall.
  // 8 climbs to reach Juliet, zone narrows each time, 4 misses lose.
  const chBalcony = {
    id: 'balcony',
    name: 'THE BALCONY',
    sub: 'Reach Juliet above',
    intro: [
      'Romeo stands beneath',
      'Juliet\'s balcony and',
      'must climb the garden',
      'wall. Tap when the',
      'ring hits gold!'
    ],
    quote: '"What light through yonder window breaks? It is the East, and Juliet is the sun." — Act II',
    help: 'TAP or press A when the swinging ring hits the GOLD ZONE. 8 climbs to reach the balcony. 4 misses lose!',
    icon(api, x, y) {
      const g = api.gfx;
      // Balcony ledge
      g.rect(x - 12, y - 2, 24, 6, C.stoneMid);
      g.rect(x - 10, y - 14, 4, 13, C.stoneLt);
      g.rect(x - 3,  y - 14, 4, 13, C.stoneLt);
      g.rect(x + 4,  y - 14, 4, 13, C.stoneLt);
      // Juliet silhouette above
      g.circle(x, y - 20, 4, C.skin);
      g.rect(x - 3, y - 17, 7, 8, C.rose);
      // Romeo climbing below
      g.circle(x + 10, y + 12, 4, C.skin);
      g.rect(x + 7, y + 15, 7, 8, C.blue);
    },
    init(api) {
      this.climbs = 8;
      this.done = 0;
      this.misses = 0;
      this.maxMiss = 4;
      this.angle = 0;
      this.speed = 1.1;
      this.zoneW = 0.55;
      this.flashT = 0;
      this.missT = 0;
      this.rHeight = api.H * 0.72; // Romeo y pos
    },
    update(api, dt) {
      const maxA = Math.PI * 0.70;
      this.angle += this.speed * dt;
      if (this.angle > maxA || this.angle < -maxA) {
        this.speed = -this.speed;
        this.angle = clamp(this.angle, -maxA, maxA);
      }
      if (this.flashT > 0) this.flashT -= dt;
      if (this.missT > 0) this.missT -= dt;

      if (api.pointer.justDown || api.keyPressed('a')) {
        if (Math.abs(this.angle) < this.zoneW / 2) {
          // Success — climb!
          this.done++;
          this.flashT = 0.5;
          this.rHeight = api.H * 0.72 - (this.done / this.climbs) * api.H * 0.44;
          api.audio.sfx('coin');
          api.burst(api.W / 2, api.H * 0.60, C.gold, 10);
          api.addScore(50);
          if (this.done >= this.climbs) { api.addScore(300); api.win(); return; }
          this.speed *= 1.12;
          this.zoneW = Math.max(0.12, this.zoneW - 0.045);
        } else {
          // Miss
          this.misses++;
          this.missT = 0.32;
          api.shake(2, 0.14); api.audio.sfx('hurt');
          if (this.misses >= this.maxMiss) { api.lose(); return; }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Night garden wall
      c.fillStyle = C.night;  c.fillRect(0, 0, W, H);
      c.fillStyle = C.sky;    c.fillRect(0, 0, W, H * 0.45);

      // Stars
      const STRS = [[20,22],[55,15],[90,28],[130,10],[170,24],[215,18],[248,30]];
      for (const [sx, sy] of STRS) g.rect(sx, sy, 2, 2, C.cream);
      // Moon
      g.circle(210, 38, 14, C.ivory);
      g.circle(218, 34, 11, C.sky);

      // Building wall (tall stone face)
      c.fillStyle = C.stoneDk;
      c.fillRect(0, H * 0.12, W, H * 0.88);
      // Stone courses
      c.globalAlpha = 0.18;
      c.fillStyle = C.black;
      for (let sy = H * 0.14; sy < H; sy += 20) c.fillRect(0, sy, W, 2);
      for (let sx2 = 0; sx2 < W; sx2 += 36) c.fillRect(sx2, H * 0.12, 1, H);
      c.globalAlpha = 1;

      // Balcony platform
      g.rect(54, H * 0.15, W - 108, 12, C.stoneLt);
      g.rect(50, H * 0.14, W - 100, 5, C.stoneLt);
      // Balcony rail posts
      for (let bx = 64; bx < W - 60; bx += 18) {
        g.rect(bx, H * 0.14 - 32, 5, 32, C.stoneMid);
      }
      g.rect(54, H * 0.14 - 32, W - 108, 5, C.stoneMid);

      // Juliet on balcony (center top)
      const jx = W / 2;
      g.circle(jx, H * 0.12 - 16, 7, C.skin);
      g.rect(jx - 5, H * 0.12 - 10, 11, 18, C.rose);
      g.rect(jx - 8, H * 0.12 - 8, 5, 14, C.rose);
      g.rect(jx + 4, H * 0.12 - 8, 5, 14, C.rose);
      // Hair
      g.rect(jx - 8, H * 0.12 - 22, 16, 8, C.amber);
      // Candlelight glow from balcony window
      c.globalAlpha = 0.22;
      c.fillStyle = C.gold;
      c.fillRect(jx - 30, H * 0.04, 60, H * 0.14);
      c.globalAlpha = 1;

      // Vine/trellis on wall
      c.fillStyle = C.green;
      for (let vy = H * 0.15; vy < H * 0.85; vy += 28) {
        c.fillRect(10 + Math.sin(vy * 0.08) * 8, vy, 6, 10);
        c.fillRect(W - 16 + Math.sin(vy * 0.07 + 1) * 6, vy, 6, 10);
      }

      // Romeo climbing (position driven by done count)
      const rx = W / 2 + 30;
      const ry = this.rHeight;
      const hide = this.missT > 0 && Math.floor(api.t * 9) % 2;
      if (!hide) {
        g.circle(rx, ry - 14, 6, C.skin);
        g.rect(rx - 5, ry - 8, 11, 14, C.blue);
        // Arms gripping wall
        g.rect(rx - 14, ry - 6, 10, 4, C.blue);
        g.rect(rx + 5, ry - 10, 10, 4, C.blue);
        g.rect(rx - 6, ry + 6, 12, 6, C.stoneDk);
      }

      // Pendulum meter at bottom
      const mx = W / 2, my = H * 0.84;
      const pendR = 50;
      c.beginPath();
      c.arc(mx, my, pendR, Math.PI * 1.02, Math.PI * 1.98);
      c.lineWidth = 10; c.strokeStyle = C.night; c.stroke();
      // Gold zone
      c.beginPath();
      c.arc(mx, my, pendR, Math.PI * 1.5 - this.zoneW / 2, Math.PI * 1.5 + this.zoneW / 2);
      c.lineWidth = 10; c.strokeStyle = this.flashT > 0 ? C.greenBrt : C.gold; c.stroke();
      c.lineWidth = 1;
      // Needle
      const ang = Math.PI * 1.5 + this.angle;
      const nx = mx + Math.cos(ang) * pendR;
      const ny = my + Math.sin(ang) * pendR;
      c.beginPath(); c.moveTo(mx, my); c.lineTo(nx, ny);
      c.strokeStyle = this.flashT > 0 ? C.gold : C.silver;
      c.lineWidth = 3; c.stroke(); c.lineWidth = 1;
      g.circle(nx, ny, 5, this.flashT > 0 ? C.gold : C.rose);

      // Progress stones (rungs climbed)
      for (let i = 0; i < this.climbs; i++) {
        g.rect(mx - this.climbs * 8 + i * 16 - 4, my - 64, 10, 10,
          i < this.done ? C.gold : C.night);
      }

      // Miss indicators
      api.topBar('BALCONY  CLIMB: ' + this.done + '/' + this.climbs);
      for (let i = 0; i < this.maxMiss; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < (this.maxMiss - this.misses) ? C.gold : C.night);
      }
    },
  };

  /* ======================== CHAPTER 3: THE DUEL ======================== */
  // Tybalt telegraphs left/right attacks; dodge and counter-strike 5 times.
  const chDuel = {
    id: 'duel',
    name: 'THE DUEL',
    sub: 'Face Tybalt at noon',
    intro: [
      'Tybalt, the Prince',
      'of Cats, draws steel.',
      'Mercutio falls—',
      'Romeo must avenge',
      'him. Dodge and strike!'
    ],
    quote: '"Romeo, the love I bear thee can afford no better term than this: thou art a villain." — Act III',
    help: 'Watch Tybalt telegraph LEFT or RIGHT. DODGE the correct way, then TAP to counter-strike! 5 hits to win.',
    icon(api, x, y) {
      const g = api.gfx;
      // Two swords crossing
      g.rect(x - 12, y - 12, 3, 22, C.silver);
      g.rect(x - 12, y - 12, 8, 3, C.amber);
      g.rect(x + 9, y - 10, 3, 22, C.silver);
      g.rect(x + 4, y - 10, 8, 3, C.amber);
      // Spark
      g.circle(x, y, 4, C.gold);
    },
    init(api) {
      this.hp = 5;
      this.lives = 3;
      this.iframes = 0;
      this.phase = 'idle';  // idle, telegraph, dodge, counter, hit
      this.phaseT = 1.2;
      this.attackDir = 0;   // -1 = left, 1 = right
      this.romeoX = api.W / 2;  // -1 = left, 0 = center, 1 = right
      this.counterT = 0;
      this.hitFlash = 0;
      this.missFlash = 0;
    },
    update(api, dt) {
      const W = api.W;
      if (this.iframes > 0) this.iframes -= dt;
      if (this.hitFlash > 0) this.hitFlash -= dt;
      if (this.missFlash > 0) this.missFlash -= dt;
      this.phaseT -= dt;

      if (this.phase === 'idle') {
        if (this.phaseT <= 0) {
          this.phase = 'telegraph';
          this.attackDir = Math.random() < 0.5 ? -1 : 1;
          this.phaseT = 0.85;
        }
      } else if (this.phase === 'telegraph') {
        if (this.phaseT <= 0) {
          this.phase = 'swing';
          this.phaseT = 0.4;
          api.audio.sfx('shoot');
        }
      } else if (this.phase === 'swing') {
        // Check if Romeo dodged
        const safeDir = -this.attackDir; // dodge away from attack
        const rpos = this.romeoX < W * 0.38 ? -1 : (this.romeoX > W * 0.62 ? 1 : 0);
        if (this.iframes <= 0) {
          if (rpos === safeDir || rpos === 0) {
            // Romeo safe — open counter window
            this.phase = 'counter';
            this.counterT = 0.55;
          } else {
            // Hit!
            this.lives--;
            this.iframes = 1.1;
            this.missFlash = 0.3;
            api.shake(5, 0.3); api.flash(C.crimson, 0.2); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
            this.phase = 'idle';
            this.phaseT = 0.9;
          }
        } else {
          this.phase = 'counter';
          this.counterT = 0.50;
        }
      } else if (this.phase === 'counter') {
        this.counterT -= dt;
        // Tap to strike
        if (api.pointer.justDown || api.keyPressed('a')) {
          this.hp--;
          this.hitFlash = 0.4;
          api.audio.sfx('coin');
          api.burst(W * 0.35, api.H * 0.40, C.gold, 10);
          api.addScore(60);
          if (this.hp <= 0) { api.addScore(350); api.win(); return; }
          this.phase = 'idle';
          this.phaseT = 0.9;
        } else if (this.counterT <= 0) {
          this.phase = 'idle';
          this.phaseT = 0.8;
        }
      }

      // Romeo movement
      const spd = 160;
      if (api.keyDown('left'))  this.romeoX -= spd * dt;
      if (api.keyDown('right')) this.romeoX += spd * dt;
      if (api.pointer.down)     this.romeoX += api.pointer.dx * 1.2;
      this.romeoX = clamp(this.romeoX, 14, W - 14);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Noon Verona piazza — warm golden light
      c.fillStyle = C.skyMid; c.fillRect(0, 0, W, H * 0.40);
      c.fillStyle = '#A88830'; c.fillRect(0, H * 0.40, W, H * 0.60); // warm cobblestone

      // Arch shadow
      c.fillStyle = C.stoneDk;
      c.fillRect(0, H * 0.35, 40, H * 0.65);
      c.fillRect(W - 40, H * 0.35, 40, H * 0.65);
      c.fillRect(0, H * 0.35, W, 18);

      // Cobble lines
      c.globalAlpha = 0.14;
      c.fillStyle = C.black;
      for (let fx = 0; fx < W; fx += 28) c.fillRect(fx, H * 0.40, 1, H * 0.60);
      for (let fy = H * 0.44; fy < H; fy += 24) c.fillRect(0, fy, W, 1);
      c.globalAlpha = 1;

      // Tybalt (upper center)
      const tx = W * 0.36, ty = H * 0.42;
      // Tybalt body
      g.circle(tx, ty - 16, 8, C.skin);
      g.rect(tx - 8, ty - 8, 16, 20, C.crimson);
      g.rect(tx - 14, ty - 4, 10, 5, C.crimson); // arm L
      g.rect(tx + 4, ty - 4, 10, 5, C.crimson);  // arm R
      g.rect(tx - 7, ty + 12, 14, 10, C.stoneDk);
      // Sword (direction based on phase)
      const swordDir = this.phase === 'telegraph' || this.phase === 'swing' ? this.attackDir : 1;
      if (swordDir > 0) {
        g.rect(tx + 8,  ty - 6, 28, 3, C.silver);
        g.rect(tx + 34, ty - 10, 3, 12, C.amber);
      } else {
        g.rect(tx - 36, ty - 6, 28, 3, C.silver);
        g.rect(tx - 38, ty - 10, 3, 12, C.amber);
      }

      // Telegraph flash
      if (this.phase === 'telegraph') {
        const flash = Math.floor(api.t * 8) % 2;
        if (flash) {
          const dir = this.attackDir;
          c.globalAlpha = 0.35;
          c.fillStyle = C.crimson;
          c.fillRect(dir > 0 ? W / 2 : 0, H * 0.34, W / 2, H * 0.50);
          c.globalAlpha = 1;
          api.txtCFit(dir > 0 ? '⚡ ATTACK RIGHT' : '⚡ ATTACK LEFT',
            W / 2, H * 0.86, 9, C.crimson, true);
        }
      }

      // Counter window
      if (this.phase === 'counter') {
        const pulse = Math.floor(api.t * 7) % 2;
        if (pulse) {
          c.globalAlpha = 0.3;
          c.fillStyle = C.gold;
          c.fillRect(0, H * 0.34, W, H * 0.50);
          c.globalAlpha = 1;
        }
        api.txtCFit('TAP! STRIKE!', W / 2, H * 0.86, 10, C.gold, true);
      }

      // Hit flash
      if (this.hitFlash > 0) {
        c.globalAlpha = Math.min(1, this.hitFlash * 2);
        c.fillStyle = C.gold; c.fillRect(tx - 20, ty - 20, 40, 40);
        c.globalAlpha = 1;
      }

      // Romeo (player)
      const rx = this.romeoX;
      const ry = H * 0.64;
      const rfade = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!rfade) {
        g.circle(rx, ry - 16, 7, C.skin);
        g.rect(rx - 6, ry - 9, 13, 18, C.blue);
        g.rect(rx - 12, ry - 6, 8, 4, C.blue);
        g.rect(rx + 4, ry - 6, 8, 4, C.blue);
        g.rect(rx - 6, ry + 9, 12, 8, C.stoneDk);
        // Sword
        g.rect(rx + 6, ry - 12, 22, 3, C.silver);
        g.rect(rx + 26, ry - 16, 3, 10, C.amber);
      }

      // Tybalt HP hearts
      api.topBar("DUEL  TYBALT: " + this.hp + " HP");
      for (let i = 0; i < 5; i++) {
        g.rect(14 + i * 18, 3, 12, 10, i < this.hp ? C.crimson : C.night);
      }
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.rose : C.night);
      }
    },
  };

  /* ======================== CHAPTER 4: FRIAR'S CELL ======================== */
  // Juliet catches sleeping herbs falling from above; avoid red poison vials.
  // Collect 12 herbs, 3 bad catches = lose. 26s timer.
  const chFriar = {
    id: 'friar',
    name: "FRIAR'S CELL",
    sub: 'Gather the sleeping herbs',
    intro: [
      'Friar Lawrence gives',
      'Juliet a plan: drink',
      'a potion to sleep',
      'like death. Catch the',
      'herbs — not the poison!'
    ],
    quote: '"Take thou this vial, being then in bed, and this distilled liquor drink thou off." — Act IV',
    help: 'STEER left/right. CATCH gold herb vials. AVOID red poison bottles! Collect 12 herbs to brew the potion.',
    icon(api, x, y) {
      const g = api.gfx;
      // Vial (herb)
      g.rect(x - 4, y - 14, 8, 20, C.greenBrt);
      g.rect(x - 2, y - 18, 5, 5, C.grey);
      g.rect(x - 6, y - 12, 12, 3, C.green);
      // Poison vial (small, red)
      g.rect(x + 8, y - 8, 6, 14, C.redBrt);
      g.rect(x + 9, y - 11, 4, 4, C.grey);
      // X
      g.rect(x + 8, y - 4, 6, 2, C.black);
      g.rect(x + 10, y - 6, 2, 6, C.black);
    },
    init(api) {
      this.px = api.W / 2;
      this.herbs = 0;
      this.need = 12;
      this.lives = 3;
      this.timer = 26;
      this.drops = [];
      this.dropT = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.timer -= dt;
      if (this.timer <= 0 && this.herbs < this.need) { api.lose(); return; }

      // Steer
      const spd = 108;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.pointer.down)     this.px += api.pointer.dx * 1.1;
      this.px = clamp(this.px, 12, W - 12);

      // Spawn vials (herbs or poison)
      this.dropT -= dt;
      const rate = Math.max(0.4, 0.90 - (26 - Math.max(0, this.timer)) * 0.018);
      if (this.dropT <= 0) {
        this.dropT = rate + Math.random() * 0.2;
        const poison = Math.random() < 0.38;
        this.drops.push({
          x: 14 + Math.random() * (W - 28),
          y: -18,
          vy: 72 + Math.random() * 52,
          poison,
        });
      }

      // Move vials
      for (const d of this.drops) d.y += d.vy * dt;

      // Catch / hit
      const py = H - 50;
      for (let i = this.drops.length - 1; i >= 0; i--) {
        const d = this.drops[i];
        if (d.y > H + 20) { this.drops.splice(i, 1); continue; }
        if (Math.abs(d.x - this.px) < 22 && d.y > py - 16 && d.y < py + 20) {
          this.drops.splice(i, 1);
          if (!d.poison) {
            this.herbs++;
            api.addScore(30);
            api.audio.sfx('coin');
            api.burst(this.px, py, C.greenBrt, 8);
            if (this.herbs >= this.need) { api.addScore(300); api.win(); return; }
          } else {
            this.lives--;
            api.shake(4, 0.28); api.flash(C.redBrt, 0.18); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
        }
      }
      api.addScore(dt * 8);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Friar's cell — warm stone, candlelit
      c.fillStyle = C.stoneDk; c.fillRect(0, 0, W, H);
      c.fillStyle = C.amber;   c.fillRect(0, 0, W, H * 0.18); // stone arch ceiling

      // Stone wall texture
      c.globalAlpha = 0.12;
      c.fillStyle = C.black;
      for (let sy = H * 0.22; sy < H * 0.85; sy += 18) c.fillRect(0, sy, W, 2);
      for (let sx = 0; sx < W; sx += 28) c.fillRect(sx, 0, 1, H * 0.85);
      c.globalAlpha = 1;

      // Shelves with bottles
      c.fillStyle = C.stoneMid;
      c.fillRect(0, H * 0.18, W, 8);
      c.fillRect(0, H * 0.35, W, 6);
      // Bottle decorations on shelves
      for (let bx = 12; bx < W; bx += 22) {
        g.rect(bx, H * 0.19, 6, 14, C.greenBrt);
        g.rect(bx - 2, H * 0.27, 10, 8, C.redBrt);
        g.rect(bx + 12, H * 0.36, 5, 12, C.lavender);
      }

      // Candles
      for (let cx2 = 28; cx2 < W; cx2 += 70) {
        g.rect(cx2 - 3, H * 0.74, 6, 18, C.ivory);
        g.rect(cx2 - 1, H * 0.70, 3, 6, C.gold);
        c.globalAlpha = 0.16;
        c.fillStyle = C.gold;
        c.fillRect(cx2 - 12, H * 0.64, 24, 16);
        c.globalAlpha = 1;
      }

      // Bench / table
      c.fillStyle = C.stoneDk;
      c.fillRect(24, H * 0.82, W - 48, 10);

      // Falling vials
      for (const d of this.drops) {
        if (!d.poison) {
          // Herb vial — green/gold
          g.rect(d.x - 5, d.y - 14, 10, 22, C.greenBrt);
          g.rect(d.x - 3, d.y - 18, 6, 5, C.grey);
          g.rect(d.x - 6, d.y - 12, 12, 3, C.green);
          g.circle(d.x, d.y - 4, 3, C.gold);
        } else {
          // Poison — red with skull mark
          g.rect(d.x - 4, d.y - 12, 8, 18, C.crimson);
          g.rect(d.x - 2, d.y - 15, 4, 4, C.grey);
          g.rect(d.x - 5, d.y - 10, 10, 3, C.redBrt);
          g.rect(d.x - 2, d.y - 4, 4, 5, C.redBrt);
        }
      }

      // Juliet (player)
      const py = H - 50;
      g.circle(this.px, py - 14, 7, C.skin);
      g.rect(this.px - 6, py - 7, 12, 16, C.rose);
      g.rect(this.px - 10, py - 4, 6, 12, C.rose);
      g.rect(this.px + 4, py - 4, 6, 12, C.rose);
      // Hair
      g.rect(this.px - 8, py - 20, 16, 8, C.amber);
      // Arms out (basket)
      g.rect(this.px - 16, py - 2, 32, 4, C.ivory);

      // HUD
      api.topBar("FRIAR'S CELL  HERBS: " + this.herbs + '/' + this.need + '  ⧗ ' + Math.ceil(this.timer));
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.greenBrt : C.night);
      }
    },
  };

  /* ======================== CHAPTER 5: THE TOMB ======================== */
  // Romeo races through Verona streets at night. Dodge watchmen's lantern cones.
  // Survive 28s of sprinting (auto-advance distance bar), 3 lives.
  const chTomb = {
    id: 'tomb',
    name: 'THE TOMB',
    sub: 'Race to Juliet',
    intro: [
      'Romeo, banished,',
      'races back to Verona.',
      'Juliet sleeps, not',
      'dead! Dodge the watch',
      'and reach the tomb!'
    ],
    quote: '"O, she is rich in beauty; only poor that, when she dies with beauty dies her store." — Act I',
    help: 'STEER left/right to dodge watchmen\'s sweeping lanterns! Reach the Capulet tomb in 28 seconds.',
    icon(api, x, y) {
      const g = api.gfx;
      // Tomb doorway
      g.rect(x - 10, y - 8, 20, 16, C.stoneMid);
      g.rect(x - 7, y - 2, 14, 10, C.night);   // dark entrance
      g.rect(x - 10, y - 14, 20, 8, C.stoneMid); // arch header
      g.circle(x, y - 10, 6, C.stoneLt);        // arch
      g.circle(x, y - 10, 4, C.night);
      // Running Romeo
      g.circle(x + 14, y + 6, 4, C.skin);
      g.rect(x + 11, y + 9, 7, 8, C.blue);
    },
    init(api) {
      this.px = api.W / 2;
      this.lives = 3;
      this.dist = 0;       // distance covered 0..1
      this.need = 1.0;
      this.watchmen = [];
      this.watchT = 0;
      this.iframes = 0;
      this.runT = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      if (this.iframes > 0) this.iframes -= dt;
      this.runT += dt;

      // Auto-advance distance (~28 seconds to cover full run)
      this.dist += dt / 28;
      if (this.dist >= this.need) { api.addScore(350); api.win(); return; }

      // Steer
      const spd = 100;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.pointer.down)     this.px += api.pointer.dx * 1.1;
      this.px = clamp(this.px, 14, W - 14);

      // Spawn watchmen (lantern sweepers)
      this.watchT -= dt;
      const wRate = Math.max(2.0, 5.0 - this.dist * 4.0);
      if (this.watchT <= 0) {
        this.watchT = wRate;
        const fromLeft = Math.random() < 0.5;
        this.watchmen.push({
          x: fromLeft ? 0 : W,
          y: H * 0.28 + Math.random() * H * 0.36,
          dir: fromLeft ? 1 : -1,
          sweepAngle: Math.PI * 0.25,
          angle: fromLeft ? -0.2 : Math.PI + 0.2,
          sweepSpd: (0.8 + Math.random() * 0.6) * (fromLeft ? 1 : -1),
        });
      }

      // Update watchmen
      for (const w of this.watchmen) {
        w.angle += w.sweepSpd * dt;
        // Bounce sweep
        const sweepMax = Math.PI * 0.5;
        const center = w.dir > 0 ? -0.2 : Math.PI + 0.2;
        if (w.dir > 0) {
          if (w.angle > sweepMax) w.sweepSpd = -Math.abs(w.sweepSpd);
          if (w.angle < -sweepMax) w.sweepSpd = Math.abs(w.sweepSpd);
        }
      }

      // Collision: Romeo inside a watchman's cone?
      const ry = H * 0.72;
      if (this.iframes <= 0) {
        for (const w of this.watchmen) {
          const dx = this.px - w.x, dy = ry - w.y;
          const dist2 = Math.sqrt(dx * dx + dy * dy);
          if (dist2 < 90) {
            const angleToRomeo = Math.atan2(dy, dx);
            let diff = angleToRomeo - w.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            if (Math.abs(diff) < 0.28) {
              this.lives--;
              this.iframes = 1.2;
              api.shake(4, 0.3); api.flash(C.gold, 0.2); api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        }
      }

      // Clean up off-screen watchmen
      this.watchmen = this.watchmen.filter(w => w.x > -10 && w.x < W + 10);
      api.addScore(dt * 12);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Verona night — deep blue
      c.fillStyle = C.night;  c.fillRect(0, 0, W, H);
      c.fillStyle = C.sky;    c.fillRect(0, 0, W, H * 0.38);

      // Stars
      for (let i = 0; i < 18; i++) {
        const sx = (i * 53 + 11) % (W - 8) + 4;
        const sy = (i * 37 + 7) % (H * 0.34) + 4;
        g.rect(sx, sy, 2, 2, C.cream);
      }
      // Moon
      g.circle(W - 36, 28, 12, C.ivory);
      g.circle(W - 30, 24, 9, C.sky);

      // Scrolling street (building silhouettes)
      const scroll = (this.runT * 38) % 270;
      c.fillStyle = C.stoneDk;
      for (let bx = -scroll; bx < W + 80; bx += 88) {
        c.fillRect(bx, H * 0.24, 50, H * 0.76);
        c.fillRect(bx + 55, H * 0.30, 28, H * 0.70);
        // Window light
        c.fillStyle = C.amber;
        c.fillRect(bx + 10, H * 0.28, 10, 12);
        c.fillRect(bx + 28, H * 0.26, 10, 12);
        c.fillStyle = C.stoneDk;
      }

      // Cobblestone street
      c.fillStyle = C.stoneMid;
      c.fillRect(0, H * 0.78, W, H * 0.22);
      c.globalAlpha = 0.16;
      c.fillStyle = C.black;
      for (let cx2 = scroll % 24; cx2 < W; cx2 += 24)
        c.fillRect(cx2, H * 0.78, 1, H * 0.22);
      for (let cy2 = H * 0.80; cy2 < H; cy2 += 18)
        c.fillRect(0, cy2, W, 1);
      c.globalAlpha = 1;

      // Distant Capulet tomb (at top end of progress bar)
      const tombX = W * (0.5 + this.dist * 0.4);
      if (this.dist > 0.7) {
        const ts = clamp((this.dist - 0.7) / 0.3, 0, 1);
        g.rect(tombX - 18, H * 0.42, 36, H * 0.38, C.stoneLt);
        g.rect(tombX - 14, H * 0.54, 28, H * 0.26, C.night);  // entrance
        g.rect(tombX - 18, H * 0.38, 36, 10, C.stoneMid);    // header
        // Glow pulsing
        c.globalAlpha = 0.22 * ts * (0.8 + Math.sin(api.t * 4) * 0.2);
        c.fillStyle = C.rose;
        c.fillRect(tombX - 28, H * 0.34, 56, H * 0.46);
        c.globalAlpha = 1;
      }

      // Watchmen + lanterns
      for (const w of this.watchmen) {
        // Watchman body
        g.circle(w.x, w.y - 14, 6, C.skin);
        g.rect(w.x - 5, w.y - 8, 11, 16, C.stoneMid);
        g.rect(w.x - 8, w.y - 4, 6, 10, C.stoneMid);
        g.rect(w.x + 3, w.y - 4, 6, 10, C.stoneMid);
        g.rect(w.x - 5, w.y + 8, 10, 8, C.stoneDk);
        // Lantern
        const lx = w.x + Math.cos(w.angle) * 22;
        const ly = w.y + Math.sin(w.angle) * 22;
        g.rect(lx - 5, ly - 5, 10, 10, C.gold);
        g.rect(lx - 3, ly - 3, 6, 6, C.cream);
        // Lantern beam (cone)
        c.globalAlpha = 0.20;
        c.fillStyle = C.gold;
        c.beginPath();
        c.moveTo(w.x, w.y);
        c.lineTo(
          w.x + Math.cos(w.angle - 0.28) * 90,
          w.y + Math.sin(w.angle - 0.28) * 90
        );
        c.lineTo(
          w.x + Math.cos(w.angle + 0.28) * 90,
          w.y + Math.sin(w.angle + 0.28) * 90
        );
        c.closePath(); c.fill();
        c.globalAlpha = 1;
      }

      // Romeo
      const ry = H * 0.72;
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        const step = Math.floor(this.runT * 9) % 2;
        g.circle(this.px, ry - 16, 7, C.skin);
        g.rect(this.px - 6, ry - 9, 13, 18, C.blue);
        g.rect(this.px - 12, ry - 6, 8, 4, C.blue);
        g.rect(this.px + 4, ry - 6, 8, 4, C.blue);
        if (step) {
          g.rect(this.px - 6, ry + 9, 6, 9, C.stoneDk);
          g.rect(this.px + 1, ry + 9, 6, 8, C.stoneDk);
        } else {
          g.rect(this.px - 6, ry + 9, 6, 8, C.stoneDk);
          g.rect(this.px + 1, ry + 9, 6, 9, C.stoneDk);
        }
      }

      // Distance progress bar
      const bx = 8, bw = W - 16, bh = 8;
      const by = H - 16;
      g.rect(bx, by, bw, bh, C.stoneDk);
      g.rect(bx, by, Math.floor(bw * this.dist), bh, C.rose);
      // Tomb icon at right
      g.rect(bx + bw - 6, by - 2, 12, 12, C.stoneLt);

      api.topBar('THE TOMB  RUN: ' + Math.floor(this.dist * 100) + '%');
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.rose : C.night);
      }
    },
  };

  /* ========================= CREATE SAGA ========================= */
  RetroSaga.create({
    id: 'romeo-juliet',
    title: 'ROMEO & JULIET',
    subtitle: 'STAR-CROSS\'D',
    accent: '#F878F8',
    credit: 'WILLIAM SHAKESPEARE · c.1594',
    currency: 'HEARTS',
    bootCta: 'TAP TO BEGIN',
    menuLabel: 'CHOOSE YOUR SCENE',
    menuHint: 'TAP A WINDOW',
    menuDone: 'ALL SCENES PLAYED',
    bootLine: 'FIVE SCENES · ONE TRAGEDY',
    finale: '"For never was a story of more woe than this of Juliet and her Romeo." — W. Shakespeare',

    emblem,
    scenery,

    palette: {
      ink:    C.black,
      dark:   C.night,
      panel:  'rgba(8,0,28,.84)',
      gold:   C.gold,
      cream:  C.ivory,
      dim:    C.purple,
      blood:  C.crimson,
      white:  C.white,
      shadow: 'rgba(0,0,24,.60)',
    },

    screens: {
      overlay:      'rgba(0,0,20,.86)',
      win:          C.gold,
      lose:         C.crimson,
      chapterLabel: C.rose,
      name:         C.ivory,
      sub:          C.lavender,
      intro:        C.ivory,
      quote:        C.rose,
      help:         C.gold,
      score:        C.ivory,
      cur:          C.gold,
      cta:          C.cream,
    },

    labels: {
      chapter:  'SCENE',
      score:    'HEARTS',
      win:      'THE NIGHT IS YOURS',
      lose:     'PARTED TOO SOON',
      cont:     'TAP TO CONTINUE',
      finale:   'TAP FOR THE FINALE',
      toMenu:   'TAP TO RETURN TO VERONA',
      play:     'BEGIN SCENE',
    },

    menu: {
      colors: {
        panel:    'rgba(16,0,40,.72)',
        panelSel: 'rgba(40,0,80,.90)',
        border:   C.rose,
        name:     C.ivory,
        nameDone: C.gold,
        sub:      C.lavender,
        title:    C.gold,
        label:    C.rose,
        cur:      C.ivory,
        hint:     C.lavender,
      },
      title(api, respect) { drawMenuTitle(api, respect); },
      layout(api) { return WINDOW_POSITIONS; },
      card(api, info) {
        // Draw building facade before first card
        if (info.i === 0) {
          const c = api.ctx, W = api.W, H = api.H, g = api.gfx;
          // Stone facade
          c.fillStyle = C.stoneDk;
          c.fillRect(0, 92, W, H - 92);
          // Stone courses
          c.globalAlpha = 0.14;
          c.fillStyle = C.black;
          for (let sy = 100; sy < H; sy += 20) c.fillRect(0, sy, W, 2);
          for (let sx = 0; sx < W; sx += 32) c.fillRect(sx, 92, 1, H - 92);
          c.globalAlpha = 1;
          // Ivy
          c.fillStyle = C.green;
          for (let iy = 92; iy < H; iy += 26) {
            c.fillRect(0 + Math.sin(iy * 0.09) * 6, iy, 8, 10);
            c.fillRect(W - 8 + Math.sin(iy * 0.07) * 4, iy, 8, 10);
          }
          // Rose connectors between window positions
          drawMenuConnectors(api);
          // Central balcony detail between top two windows
          g.rect(106, 180, 58, 6, C.stoneLt);
          g.rect(102, 179, 66, 4, C.stoneLt);
          for (let px2 = 112; px2 < 162; px2 += 14) g.rect(px2, 150, 5, 30, C.stoneMid);
          g.rect(106, 148, 58, 5, C.stoneMid);
        }
        drawMenuCard(api, info);
      },
    },

    width: 270, height: 480, parent: '#game',

    chapters: [chFeast, chBalcony, chDuel, chFriar, chTomb],
  });
})();
