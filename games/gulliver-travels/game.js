/* ============================================================================
 * GULLIVER'S TRAVELS — INTO SEVERAL REMOTE NATIONS
 * Five voyages across Jonathan Swift's satirical world (1726):
 *   1. THE STORM        — steer Gulliver on deck, dodge falling debris
 *   2. LILLIPUT         — tap Lilliputians crossing the path before they trip you
 *   3. BROBDINGNAG      — free-move tiny Gulliver, dodge giant boots & the cat
 *   4. LAPUTA            — catch magnets falling from the flying island
 *   5. THE HOUYHNHNMS   — pendulum timing: prove your reason to the horse-folk
 * Built on RetroSaga (js/saga.js) + NES-honest palette.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ========================== NES PALETTE ========================== */
  // All colors drawn from the actual NES (2C02) palette for period-honest 8-bit.
  const C = {
    black:    '#000000',
    navy:     '#0000BC',
    blue:     '#0000FC',
    deepSea:  '#004058',
    sea:      '#0058F8',
    seaMid:   '#0078F8',
    seaLight: '#3CBCFC',
    seaPale:  '#A4E4FC',
    white:    '#F8F8F8',
    pureW:    '#FCFCFC',
    grey:     '#7C7C7C',
    greyMid:  '#BCBCBC',
    parch:    '#FCE0A8',  // parchment cream
    parchW:   '#F0D0B0',  // warm parchment
    amber:    '#AC7C00',  // amber-brown (map ink)
    inkBrown: '#503000',  // dark ink brown
    gold:     '#F8B800',  // bright gold
    land:     '#007800',  // deep green
    landMid:  '#00B800',  // mid green
    landBrt:  '#58D854',  // bright grass green
    red:      '#A80020',  // dark red
    redBrt:   '#F83800',  // bright red
    skin:     '#FCA044',  // skin tone
    purple:   '#4428BC',  // deep purple
    teal:     '#008888',  // teal
  };

  /* ========================== HELPERS ========================== */
  function dashedLine(c, x1, y1, x2, y2, dotW, gap) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;
    const nx = dx / len, ny = dy / len;
    for (let d = 0; d < len; d += dotW + gap) {
      const px = x1 + nx * d, py = y1 + ny * d;
      c.fillRect(Math.round(px - dotW / 2), Math.round(py - dotW / 2), dotW, dotW);
    }
  }

  /* ========================== EMBLEM ========================== */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // Compass rose arms
    g.rect(cx - 1, cy - 30, 3, 60, C.parchW);
    g.rect(cx - 30, cy - 1, 60, 3, C.parchW);
    // Diagonal ticks
    g.rect(cx - 17, cy - 17, 3, 3, C.amber);
    g.rect(cx + 14, cy - 17, 3, 3, C.amber);
    g.rect(cx - 17, cy + 14, 3, 3, C.amber);
    g.rect(cx + 14, cy + 14, 3, 3, C.amber);
    // North pointer (red)
    g.rect(cx - 2, cy - 30, 5, 14, C.redBrt);
    // Center rose circle
    g.circle(cx, cy, 10, C.gold);
    g.circle(cx, cy, 7, C.parch);
    g.circle(cx, cy, 4, C.amber);
    // Ship hull in center
    g.rect(cx - 8, cy - 2, 16, 5, C.inkBrown);
    g.rect(cx - 6, cy - 7, 12, 6, C.inkBrown);
    g.rect(cx - 4, cy - 11, 2, 5, C.inkBrown); // mast
    g.rect(cx - 4, cy - 11, 8, 4, C.parch);    // sail
  }

  /* ========================= SCENERY ========================== */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Base parchment
    c.fillStyle = C.parchW; c.fillRect(0, 0, W, H);
    c.fillStyle = C.parch;  c.fillRect(12, 12, W - 24, H - 24);

    // Ocean areas — flat NES blue bands (no gradient!)
    c.fillStyle = C.sea;
    c.fillRect(0, 0, W, 60);              // top ocean band
    c.fillRect(0, H - 55, W, 55);         // bottom ocean band
    c.fillRect(0, 0, 22, H);              // left strip
    c.fillRect(W - 22, 0, 22, H);         // right strip

    // Land masses — flat green fills (fictional nations)
    // British Isles (top center) — small rounded island cluster
    c.fillStyle = C.land;
    c.fillRect(90, 16, 60, 22);
    c.fillRect(100, 10, 40, 10);
    c.fillStyle = C.landMid;
    c.fillRect(96, 16, 50, 18);

    // Brobdingnag (large continent, right side)
    c.fillStyle = C.land;
    c.fillRect(170, 90, 70, 50);
    c.fillRect(184, 80, 50, 14);
    c.fillStyle = C.landMid;
    c.fillRect(176, 94, 58, 42);

    // Lilliput (small island, center-left)
    c.fillStyle = C.land;
    c.fillRect(18, 170, 48, 26);
    c.fillRect(24, 162, 32, 12);
    c.fillStyle = C.landMid;
    c.fillRect(22, 172, 40, 20);

    // Laputa shown as an oval (floating island cloud outline)
    c.fillStyle = C.seaLight;
    c.fillRect(80, 258, 90, 28);
    c.fillRect(88, 250, 74, 10);
    c.fillStyle = C.landMid;
    c.fillRect(88, 260, 72, 20);

    // Houyhnhnms (bottom center-left)
    c.fillStyle = C.land;
    c.fillRect(20, H - 94, 80, 40);
    c.fillRect(28, H - 104, 60, 14);
    c.fillStyle = C.landBrt;
    c.fillRect(26, H - 90, 68, 32);

    // Tiny decorative buildings on land masses
    g.rect(110, 18, 6, 8, C.amber);   // British building
    g.rect(120, 18, 6, 8, C.amber);
    g.rect(195, 96, 8, 10, C.amber);  // Brobdingnag tower
    g.rect(207, 94, 6, 12, C.amber);  // taller
    g.rect(34, 168, 5, 7, C.amber);   // Lilliput (tiny)
    g.rect(43, 168, 5, 7, C.amber);

    // Animated tiny ships (drift)
    const s1x = 50 + Math.sin(t * 0.4) * 5;
    const s2x = W - 60 + Math.sin(t * 0.3 + 1.2) * 4;
    drawTinyShip(g, s1x, 42, t);
    drawTinyShip(g, s2x, H - 40, t * 0.8);

    // Sea serpent (bottom-right ocean)
    const serpWobble = Math.sin(t * 1.3) * 4;
    g.rect(W - 20, H - 58 + serpWobble, 18, 8, C.landMid);
    g.rect(W - 18, H - 64 + serpWobble, 10, 8, C.landMid);
    g.rect(W - 24, H - 52 + serpWobble, 6, 4, C.landMid);
    g.rect(W - 16, H - 60 + serpWobble, 2, 2, C.gold);    // eye

    // Compass rose (bottom-right inset ocean)
    drawSmallCompass(g, c, W - 34, H - 36);

    // Map border (double rule in ink)
    c.fillStyle = C.inkBrown;
    c.fillRect(0, 0, W, 3);
    c.fillRect(0, H - 3, W, 3);
    c.fillRect(0, 0, 3, H);
    c.fillRect(W - 3, 0, 3, H);
    c.globalAlpha = 0.45;
    c.fillRect(5, 5, W - 10, 1);
    c.fillRect(5, H - 6, W - 10, 1);
    c.fillRect(5, 5, 1, H - 10);
    c.fillRect(W - 6, 5, 1, H - 10);
    c.globalAlpha = 1;

    // Voyage route lines (menu scene only — drawn under cards)
    if (scene === 'menu') {
      c.fillStyle = C.red;
      // England → Lilliput
      dashedLine(c, 135, 118, 51, 228, 3, 5);
      // England → Brobdingnag
      dashedLine(c, 135, 118, 219, 193, 3, 5);
      // Lilliput → Laputa
      dashedLine(c, 51, 228, 135, 328, 3, 5);
      // Brobdingnag → Laputa
      dashedLine(c, 219, 193, 135, 328, 3, 5);
      // Laputa → Houyhnhnms
      dashedLine(c, 135, 328, 103, 423, 3, 5);
    }

    // Dark overlay for intro/result/finale to dim the map
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(4,2,0,.80)';
      c.fillRect(0, 0, W, H);
    }
  }

  function drawTinyShip(g, x, y, t) {
    g.rect(x - 9, y, 18, 5, C.inkBrown);  // hull
    g.rect(x - 7, y - 5, 14, 6, C.inkBrown);
    g.rect(x - 1, y - 16, 2, 12, C.inkBrown); // mast
    g.rect(x - 7, y - 14, 12, 7, C.parch);    // sail
  }

  function drawSmallCompass(g, c, cx, cy) {
    g.rect(cx - 1, cy - 14, 2, 28, C.inkBrown);
    g.rect(cx - 14, cy - 1, 28, 2, C.inkBrown);
    g.rect(cx - 2, cy - 14, 4, 8, C.red);  // north (red)
    g.circle(cx, cy, 5, C.gold);
    g.circle(cx, cy, 3, C.parch);
  }

  /* =================== MENU DRAWING =================== */

  // Chapter card centers (for route lines and card positioning)
  // Cards are 86×66; centers are x+43, y+33
  const LAYOUT = [
    { x: 92,  y: 85,  w: 86, h: 66 },  // Storm / England
    { x: 8,   y: 195, w: 86, h: 66 },  // Lilliput
    { x: 176, y: 160, w: 86, h: 66 },  // Brobdingnag
    { x: 92,  y: 295, w: 86, h: 66 },  // Laputa
    { x: 60,  y: 390, w: 86, h: 66 },  // Houyhnhnms
  ];

  const LAND_LABELS = ['ENGLAND', 'LILLIPUT', 'BROBDINGNAG', 'LAPUTA', "HOUYHNHNMS"];

  function drawMenuTitle(api, respect) {
    const g = api.gfx, c = api.ctx, W = api.W;
    // Ornate cartouche
    c.fillStyle = C.parch;
    c.fillRect(14, 8, W - 28, 68);
    c.strokeStyle = C.inkBrown; c.lineWidth = 2;
    c.strokeRect(14, 8, W - 28, 68);
    c.strokeStyle = C.amber; c.lineWidth = 1;
    c.strokeRect(18, 12, W - 36, 60);
    c.lineWidth = 1;
    // Corner rosettes
    g.circle(14, 8, 5, C.gold);
    g.circle(W - 14, 8, 5, C.gold);
    g.circle(14, 76, 5, C.gold);
    g.circle(W - 14, 76, 5, C.gold);
    // Text
    api.txtCFit("GULLIVER'S TRAVELS", W / 2, 18, 11, C.inkBrown, true);
    api.txtC('INTO SEVERAL REMOTE NATIONS', W / 2, 38, 7, C.amber, false);
    api.txtC('J. SWIFT · MDCCXXVI', W / 2, 52, 7, C.amber, false);
    api.txtC('LEAGUES  ' + respect, W / 2, 64, 8, C.gold, false);
  }

  function drawMenuCard(api, info) {
    const { ch, i, x, y, w, h, sel, done, best } = info;
    const g = api.gfx, c = api.ctx;
    const cx = x + w / 2, cy = y + h / 2;

    // Card background — parchment swatch with ink border
    c.fillStyle = sel ? C.parchW : C.parch;
    c.fillRect(x, y, w, h);
    c.strokeStyle = sel ? C.inkBrown : C.amber;
    c.lineWidth = sel ? 2 : 1;
    c.strokeRect(x, y, w, h);
    c.strokeStyle = sel ? C.amber : C.parchW;
    c.lineWidth = 1;
    c.strokeRect(x + 3, y + 3, w - 6, h - 6);
    c.lineWidth = 1;

    // Chapter icon (centered top half of card)
    if (ch.icon) ch.icon(api, cx, cy - 10);

    // Land label (bottom of card)
    api.txtCFit(LAND_LABELS[i], cx, y + h - 22, 7, sel ? C.inkBrown : C.amber, false, w - 6);
    api.txtCFit(ch.sub || '', cx, y + h - 11, 6, done ? C.gold : C.amber, false, w - 6);

    // Done checkmark
    if (done) {
      g.circle(x + w - 12, y + 12, 8, C.gold);
      c.fillStyle = C.inkBrown;
      api.txtC('✓', x + w - 12, y + 6, 9, C.inkBrown, false);
    }

    // Selection pulse ring
    if (sel) {
      c.globalAlpha = 0.18 + Math.abs(Math.sin(api.t * 3.5)) * 0.14;
      g.rect(x - 2, y - 2, w + 4, h + 4, C.gold);
      c.globalAlpha = 1;
    }
  }

  /* ========================= CHAPTERS ========================= */

  /* ---------- 1. THE STORM ---------- */
  const chStorm = {
    id: 'storm',
    name: 'THE STORM',
    sub: 'Survive the tempest',
    intro: [
      'The ship Antelope',
      'sets sail for the',
      'South Seas. A squall',
      'drives her onto',
      'the rocks!'
    ],
    quote: '"I had not been long at sea, before there arose a violent storm in the Indian Ocean." — J. Swift',
    help: 'STEER left/right to dodge falling mast debris and barrels. Survive 22 seconds.',
    icon(api, x, y) {
      const g = api.gfx;
      g.rect(x - 9, y + 2, 18, 5, C.inkBrown);   // hull
      g.rect(x - 1, y - 8, 2, 11, C.inkBrown);   // mast
      g.rect(x - 7, y - 7, 12, 7, C.parch);       // sail
      // Wave
      g.rect(x - 12, y + 6, 6, 3, C.seaMid);
      g.rect(x + 6, y + 7, 6, 3, C.seaMid);
      // Lightning
      g.rect(x + 5, y - 14, 2, 8, C.gold);
      g.rect(x + 3, y - 7, 2, 6, C.gold);
    },
    init(api) {
      this.px = api.W / 2;
      this.lives = 3;
      this.timer = 22;
      this.debris = [];
      this.spawnT = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.timer -= dt;
      if (this.timer <= 0) { api.addScore(300); api.win(); return; }

      // Steer
      const spd = 100;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.pointer.down)     this.px += api.pointer.dx;
      this.px = clamp(this.px, 12, W - 12);

      // Spawn debris
      this.spawnT -= dt;
      const spawnRate = Math.max(0.32, 0.90 - (22 - this.timer) * 0.022);
      if (this.spawnT <= 0) {
        this.spawnT = spawnRate + Math.random() * 0.15;
        const barrel = Math.random() < 0.5;
        this.debris.push({
          x: 14 + Math.random() * (W - 28),
          y: -18,
          vy: 78 + Math.random() * 60,
          barrel,
        });
      }

      // Move debris
      for (const d of this.debris) d.y += d.vy * dt;

      // Hit test
      const py = H - 44;
      for (let i = this.debris.length - 1; i >= 0; i--) {
        const d = this.debris[i];
        if (Math.abs(d.x - this.px) < 18 && d.y > py - 12 && d.y < py + 16) {
          this.debris.splice(i, 1);
          this.lives--;
          api.shake(4, 0.3); api.flash(C.redBrt, 0.18); api.audio.sfx('hurt');
          if (this.lives <= 0) { api.lose(); return; }
        }
      }
      this.debris = this.debris.filter(d => d.y < H + 30);
      api.addScore(dt * 10);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      // Stormy sky — flat NES colour bands
      c.fillStyle = C.navy;    c.fillRect(0, 0, W, H);
      c.fillStyle = '#0000FC'; c.fillRect(0, H * 0.12, W, H * 0.28);
      c.fillStyle = C.deepSea; c.fillRect(0, H * 0.38, W, H * 0.22);

      // Rain streaks
      c.fillStyle = C.seaLight;
      c.globalAlpha = 0.16;
      for (let i = 0; i < 28; i++) {
        const rx = (i * 43 + api.t * 90) % (W + 30) - 15;
        const ry = (i * 37 + api.t * 130) % H;
        c.fillRect(rx, ry, 1, 9);
      }
      c.globalAlpha = 1;

      // Lightning flash
      if (Math.sin(api.t * 4.1 + 1.3) > 0.92) {
        c.globalAlpha = 0.25;
        c.fillStyle = C.parch; c.fillRect(0, 0, W, H * 0.5);
        c.globalAlpha = 1;
      }

      // Sea
      c.fillStyle = C.sea;     c.fillRect(0, H * 0.55, W, H * 0.45);
      c.fillStyle = C.deepSea; c.fillRect(0, H * 0.62, W, H * 0.38);
      // Wave crests
      c.globalAlpha = 0.22;
      c.fillStyle = C.seaLight;
      for (let i = 0; i < 5; i++) {
        const wy = H * 0.57 + i * 15;
        const woff = ((api.t * 22 + i * 58) % (W + 44)) - 22;
        c.fillRect(woff, wy, 34, 3);
        c.fillRect(woff + 80, wy + 1, 22, 2);
      }
      c.globalAlpha = 1;

      // Ship deck plank
      g.rect(0, H - 36, W, 10, C.inkBrown);
      g.rect(0, H - 26, W, 3, C.amber);
      // Broken mast stump
      g.rect(W * 0.6, H - 50, 4, 16, C.inkBrown);

      // Falling debris
      for (const d of this.debris) {
        if (d.barrel) {
          g.rect(d.x - 7, d.y - 7, 14, 14, C.inkBrown);
          g.rect(d.x - 7, d.y - 1, 14, 3, C.amber); // hoop
        } else {
          g.rect(d.x - 11, d.y - 3, 22, 7, C.inkBrown); // mast section
          g.rect(d.x - 13, d.y - 5, 5, 4, C.parchW);    // rope end
        }
      }

      // Player (Gulliver on deck)
      const py = H - 44;
      g.circle(this.px, py - 12, 6, C.skin);
      g.rect(this.px - 5, py - 7, 10, 14, C.redBrt);
      g.rect(this.px - 7, py - 5, 4, 10, C.redBrt);
      g.rect(this.px + 3, py - 5, 4, 10, C.redBrt);
      g.rect(this.px - 4, py + 6, 8, 5, C.blue);    // trousers

      // HUD
      api.topBar('STORM  ⧗ ' + Math.ceil(this.timer) + 's');
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.redBrt : C.deepSea);
      }
    },
  };

  /* ---------- 2. LILLIPUT ---------- */
  const chLilliput = {
    id: 'lilliput',
    name: 'LILLIPUT',
    sub: 'Shoo the tiny folk',
    intro: [
      'Gulliver wakes',
      'tied to the ground.',
      'Lilliputians swarm',
      'his feet — shoo them',
      'before you trip!'
    ],
    quote: '"I attempted to rise, but found my arms and legs strongly fastened on each side to the ground." — J. Swift',
    help: 'TAP each Lilliputian before it crosses your path. 14 to shoo, 3 misses allowed.',
    icon(api, x, y) {
      const g = api.gfx;
      // Gulliver's foot
      g.rect(x - 10, y + 4, 20, 9, C.inkBrown);
      g.rect(x - 8,  y,     14, 6, C.redBrt);
      // Tiny figures
      g.circle(x - 14, y + 2, 3, C.skin);
      g.rect(x - 16, y + 4, 4, 5, C.blue);
      g.circle(x + 10, y, 3, C.skin);
      g.rect(x + 8, y + 2, 4, 5, C.red);
    },
    init(api) {
      this.lives = 3;
      this.shooed = 0;
      this.need = 14;
      this.timer = 30;
      this.folk = [];
      this.spawnT = 0;
      this.flashT = 0;
      this.missT = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.timer -= dt;
      if (this.timer <= 0 && this.shooed < this.need) { api.lose(); return; }
      if (this.flashT > 0) this.flashT -= dt;
      if (this.missT > 0) this.missT -= dt;

      // Spawn Lilliputians
      this.spawnT -= dt;
      const rate = Math.max(0.8, 1.8 - (30 - Math.max(0, this.timer)) * 0.02);
      if (this.spawnT <= 0) {
        this.spawnT = rate + Math.random() * 0.4;
        const lane = Math.floor(Math.random() * 3); // 0=top, 1=mid, 2=bot
        const fromLeft = Math.random() < 0.5;
        const spd = 55 + Math.random() * 35;
        this.folk.push({
          x: fromLeft ? -14 : W + 14,
          lane,
          vx: fromLeft ? spd : -spd,
          color: [C.blue, C.red, C.redBrt, C.navy, C.purple][Math.floor(Math.random() * 5)],
          alive: true,
          flashT: 0,
        });
      }

      // Move folk
      for (const f of this.folk) {
        if (!f.alive) continue;
        f.x += f.vx * dt;
        if (f.flashT > 0) f.flashT -= dt;
      }

      // Check for crossings (missed folk)
      const LANES_Y = [H * 0.50, H * 0.60, H * 0.70];
      for (let i = this.folk.length - 1; i >= 0; i--) {
        const f = this.folk[i];
        if (!f.alive) { this.folk.splice(i, 1); continue; }
        const passed = (f.vx > 0 && f.x > W + 10) || (f.vx < 0 && f.x < -10);
        if (passed) {
          this.folk.splice(i, 1);
          this.lives--;
          this.missT = 0.4;
          api.shake(3, 0.2); api.audio.sfx('hurt');
          if (this.lives <= 0) { api.lose(); return; }
        }
      }

      // Tap detection
      if (api.pointer.justDown) {
        const px = api.pointer.x, py = api.pointer.y;
        for (const f of this.folk) {
          if (!f.alive) continue;
          const fy = LANES_Y[f.lane];
          if (Math.abs(f.x - px) < 22 && Math.abs(fy - py) < 22) {
            f.alive = false;
            f.flashT = 0.3;
            this.shooed++;
            this.flashT = 0.3;
            api.audio.sfx('coin');
            api.burst(f.x, fy, C.gold, 8);
            api.addScore(25);
            if (this.shooed >= this.need) { api.addScore(250); api.win(); return; }
            break;
          }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      // Bright sunny Lilliput — NES flat palette
      c.fillStyle = C.seaPale;  c.fillRect(0, 0, W, H * 0.46);  // sky
      c.fillStyle = C.landBrt;  c.fillRect(0, H * 0.46, W, H * 0.54); // ground

      // Tiny Lilliputian buildings and walls (pixel-art)
      for (let i = 0; i < 5; i++) {
        const bx = 8 + i * 52;
        c.fillStyle = C.parchW; c.fillRect(bx, H * 0.28, 20, 22);
        c.fillStyle = C.red;    c.fillRect(bx - 2, H * 0.24, 24, 6); // roof
        c.fillStyle = C.inkBrown; c.fillRect(bx + 7, H * 0.38, 6, 8); // door
      }
      // Tiny wall across center
      c.fillStyle = C.parchW;
      c.fillRect(0, H * 0.46 - 4, W, 4);
      c.fillStyle = C.amber;
      for (let bx = 0; bx < W; bx += 14) c.fillRect(bx, H * 0.46 - 4, 10, 1);

      // Gulliver's giant body (horizontal) — just feet visible
      // Giant trouser-legs at bottom
      g.rect(20, H * 0.48, 60, H * 0.52, C.blue);
      g.rect(W - 80, H * 0.48, 60, H * 0.52, C.blue);
      // Boot tops
      g.rect(18, H * 0.68, 64, H * 0.32, C.inkBrown);
      g.rect(W - 82, H * 0.68, 64, H * 0.32, C.inkBrown);

      // Lane guides (subtle)
      const LANES_Y = [H * 0.50, H * 0.60, H * 0.70];
      c.globalAlpha = 0.10;
      for (const ly of LANES_Y) {
        c.fillStyle = C.black; c.fillRect(0, ly - 1, W, 2);
      }
      c.globalAlpha = 1;

      // Tiny Lilliputian folk
      for (const f of this.folk) {
        if (!f.alive) continue;
        const fy = LANES_Y[f.lane];
        const running = Math.floor(api.t * 8 + f.x * 0.1) % 2;
        // Head
        g.circle(f.x, fy - 8, 4, C.skin);
        // Body
        g.rect(f.x - 3, fy - 4, 7, 8, f.color);
        // Legs (animated)
        if (running) {
          g.rect(f.x - 3, fy + 4, 3, 5, C.inkBrown);
          g.rect(f.x + 1, fy + 4, 3, 6, C.inkBrown);
        } else {
          g.rect(f.x - 3, fy + 4, 3, 6, C.inkBrown);
          g.rect(f.x + 1, fy + 4, 3, 5, C.inkBrown);
        }
        // Tiny spear/sword
        if (f.vx > 0) g.rect(f.x + 3, fy - 4, 1, 8, C.greyMid);
        else          g.rect(f.x - 4, fy - 4, 1, 8, C.greyMid);

        // Tap hit flash
        if (f.flashT > 0) {
          c.globalAlpha = f.flashT * 2.5;
          g.circle(f.x, fy, 14, C.gold);
          c.globalAlpha = 1;
        }
      }

      // Miss flash
      if (this.missT > 0) {
        c.globalAlpha = this.missT * 1.8;
        c.fillStyle = C.red; c.fillRect(0, 0, W, H);
        c.globalAlpha = 1;
      }

      // HUD
      api.topBar('LILLIPUT  SHOOED: ' + this.shooed + '/' + this.need);
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.redBrt : C.deepSea);
      }
    },
  };

  /* ---------- 3. BROBDINGNAG ---------- */
  const chBrob = {
    id: 'brobdingnag',
    name: 'BROBDINGNAG',
    sub: 'The Land of Giants',
    intro: [
      'Gulliver is tiny',
      'in a land of giants.',
      'Dodge the enormous',
      'boots and the',
      'farmer\'s ravenous cat!'
    ],
    quote: '"Every step the servant made, I expected to be squashed to death." — J. Swift',
    help: 'DRAG or TAP to move tiny Gulliver. Dodge giant boots and the prowling cat!',
    icon(api, x, y) {
      const g = api.gfx;
      // Giant boot from above
      g.rect(x - 12, y - 4, 22, 14, C.inkBrown);
      g.rect(x - 10, y - 12, 16, 10, C.inkBrown);
      g.rect(x - 14, y + 9, 26, 5, C.inkBrown); // sole
      // Tiny Gulliver underneath
      g.circle(x + 4, y + 14, 3, C.skin);
      g.rect(x + 2, y + 16, 5, 6, C.redBrt);
    },
    init(api) {
      this.px = api.W / 2;
      this.py = api.H * 0.70;
      this.lives = 3;
      this.timer = 24;
      this.boots = [];
      this.bootT = 0;
      this.cat = { x: -50, y: 0, phase: 'wait', waitT: 1.8, spd: 0 };
      this.iframes = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.timer -= dt;
      if (this.timer <= 0) { api.addScore(300); api.win(); return; }
      if (this.iframes > 0) this.iframes -= dt;

      // Move player
      const spd = 88;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.keyDown('up'))    this.py -= spd * dt;
      if (api.keyDown('down'))  this.py += spd * dt;
      if (api.pointer.down) {
        this.px += api.pointer.dx;
        this.py += api.pointer.dy;
      }
      this.px = clamp(this.px, 8, W - 8);
      this.py = clamp(this.py, H * 0.38, H - 24);

      // Spawn giant boots
      this.bootT -= dt;
      const rate = Math.max(1.0, 2.2 - (24 - this.timer) * 0.05);
      if (this.bootT <= 0) {
        this.bootT = rate;
        this.boots.push({
          x: 24 + Math.random() * (W - 48),
          y: -8,
          phase: 'warn', warnT: 0.55, stompT: 0.35, liftT: 0.50,
        });
        api.audio.sfx('blip');
      }

      // Update boots
      for (const b of this.boots) {
        if (b.phase === 'warn') {
          b.warnT -= dt;
          if (b.warnT <= 0) b.phase = 'stomp';
        } else if (b.phase === 'stomp') {
          b.y = Math.min(H * 0.76, b.y + 200 * dt);
          b.stompT -= dt;
          if (b.stompT <= 0) { b.phase = 'lift'; api.shake(3, 0.2); api.audio.sfx('power'); }
          // collision
          if (this.iframes <= 0 && Math.abs(b.x - this.px) < 24 && Math.abs(b.y - this.py) < 22) {
            this.lives--;
            this.iframes = 1.2;
            api.shake(5, 0.3); api.flash(C.redBrt, 0.18); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
        } else if (b.phase === 'lift') {
          b.y -= 130 * dt;
          b.liftT -= dt;
          if (b.liftT <= 0) b.phase = 'done';
        }
      }
      this.boots = this.boots.filter(b => b.phase !== 'done');

      // Cat prowl
      const cat = this.cat;
      cat.waitT -= dt;
      if (cat.phase === 'wait' && cat.waitT <= 0) {
        cat.phase = 'prowl';
        cat.spd = 68 + Math.random() * 38;
        cat.y = H * 0.48 + Math.random() * (H * 0.26);
        cat.x = -50;
      }
      if (cat.phase === 'prowl') {
        cat.x += cat.spd * dt;
        cat.y += Math.sin(api.t * 2.0) * 18 * dt;
        cat.y = clamp(cat.y, H * 0.44, H - 28);
        if (cat.x > W + 60) {
          cat.phase = 'wait';
          cat.waitT = 1.8 + Math.random() * 1.4;
        }
        if (this.iframes <= 0 && Math.abs(cat.x - this.px) < 24 && Math.abs(cat.y - this.py) < 22) {
          this.lives--;
          this.iframes = 1.2;
          api.shake(5, 0.3); api.flash(C.redBrt, 0.18); api.audio.sfx('hurt');
          if (this.lives <= 0) { api.lose(); return; }
        }
      }
      api.addScore(dt * 12);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      // Giant hall — warm amber light, stone floor
      c.fillStyle = C.amber;   c.fillRect(0, 0, W, H * 0.38);   // wood ceiling
      c.fillStyle = C.parchW;  c.fillRect(0, H * 0.38, W, H * 0.62); // flagstone floor

      // Floor tiles
      c.globalAlpha = 0.14;
      c.fillStyle = C.amber;
      for (let fx = 0; fx < W; fx += 38) c.fillRect(fx, H * 0.38, 1, H * 0.62);
      for (let fy = H * 0.42; fy < H; fy += 38) c.fillRect(0, fy, W, 1);
      c.globalAlpha = 1;

      // Giant table leg (right edge)
      g.rect(W - 20, H * 0.38, 20, H * 0.62, C.inkBrown);
      // Chair leg (left)
      g.rect(0, H * 0.50, 12, H * 0.50, C.inkBrown);

      // Boot warning shadows
      for (const b of this.boots) {
        if (b.phase === 'warn') {
          c.globalAlpha = 0.30 + Math.sin(api.t * 9) * 0.12;
          g.rect(b.x - 24, H * 0.72, 48, 12, C.black);
          c.globalAlpha = 1;
        }
      }

      // Giant boots
      for (const b of this.boots) {
        if (b.phase === 'stomp' || b.phase === 'lift') {
          g.rect(b.x - 26, b.y - 32, 52, 36, C.inkBrown); // boot body
          g.rect(b.x - 30, b.y + 2,  60, 16, C.inkBrown); // sole
          g.rect(b.x - 24, b.y - 40, 40, 10, C.inkBrown); // top
          // lace dots
          g.rect(b.x - 10, b.y - 28, 4, 4, C.parchW);
          g.rect(b.x + 6,  b.y - 28, 4, 4, C.parchW);
          g.rect(b.x - 10, b.y - 18, 4, 4, C.parchW);
          g.rect(b.x + 6,  b.y - 18, 4, 4, C.parchW);
        }
      }

      // Cat
      const cat = this.cat;
      if (cat.phase === 'prowl') {
        g.rect(cat.x - 22, cat.y - 8, 44, 20, C.grey);    // body
        g.rect(cat.x - 16, cat.y - 22, 14, 16, C.grey);   // head
        g.rect(cat.x - 20, cat.y - 28, 6, 8, C.grey);     // ear L
        g.rect(cat.x - 11, cat.y - 28, 6, 8, C.grey);     // ear R
        g.rect(cat.x - 14, cat.y - 20, 3, 3, C.gold);     // eye L
        g.rect(cat.x - 8,  cat.y - 20, 3, 3, C.gold);     // eye R
        g.rect(cat.x + 20, cat.y - 18, 14, 4, C.grey);    // tail base
        g.rect(cat.x + 28, cat.y - 28, 4, 12, C.grey);    // tail tip
      }

      // Tiny Gulliver (flicker when invincible)
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        g.circle(this.px, this.py - 6, 3, C.skin);
        g.rect(this.px - 3, this.py - 3, 7, 9, C.redBrt);
        g.rect(this.px - 5, this.py + 6, 4, 5, C.blue);
        g.rect(this.px + 1, this.py + 6, 4, 5, C.blue);
      }

      api.topBar('BROBDINGNAG  ⧗ ' + Math.ceil(this.timer) + 's');
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.redBrt : C.deepSea);
      }
    },
  };

  /* ---------- 4. LAPUTA ---------- */
  const chLaputa = {
    id: 'laputa',
    name: 'LAPUTA',
    sub: 'Catch the magnets',
    intro: [
      'The flying island',
      'of Laputa hovers',
      'above. Its mad',
      'scholars drop their',
      'magnetic lodestones!'
    ],
    quote: '"The island of Laputa is exactly circular; its diameter 7837 yards." — J. Swift',
    help: 'MOVE left/right to catch MAGNETS (grey) falling from Laputa. Dodge the books!',
    icon(api, x, y) {
      const g = api.gfx;
      // Floating island chunk
      g.rect(x - 14, y - 2, 28, 8, C.land);
      g.rect(x - 10, y - 8, 20, 7, C.landMid);
      // Hanging magnets
      g.rect(x - 5, y + 6, 3, 8, C.greyMid);
      g.rect(x + 2, y + 6, 3, 8, C.greyMid);
      g.rect(x - 7, y + 12, 4, 4, C.red);
      g.rect(x + 3, y + 12, 4, 4, C.blue);
    },
    init(api) {
      this.px = api.W / 2;
      this.lives = 3;
      this.caught = 0;
      this.need = 12;
      this.timer = 30;
      this.items = [];
      this.spawnT = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.timer -= dt;
      if (this.timer <= 0 && this.caught < this.need) { api.lose(); return; }

      // Move
      const spd = 112;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.pointer.down)     this.px += api.pointer.dx;
      this.px = clamp(this.px, 14, W - 14);

      // Spawn items
      this.spawnT -= dt;
      const rate = Math.max(0.38, 0.90 - (30 - Math.max(0, this.timer)) * 0.017);
      if (this.spawnT <= 0) {
        this.spawnT = rate + Math.random() * 0.12;
        const magnet = Math.random() < 0.56;
        this.items.push({
          x: 16 + Math.random() * (W - 32),
          y: 55,
          vy: 74 + Math.random() * 52,
          magnet,
        });
      }

      for (const it of this.items) it.y += it.vy * dt;

      // Catch check
      const py = H - 48;
      for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i];
        if (it.y > py - 14 && it.y < py + 14 && Math.abs(it.x - this.px) < 22) {
          this.items.splice(i, 1);
          if (it.magnet) {
            this.caught++;
            api.addScore(30);
            api.audio.sfx('coin');
            api.burst(it.x, py, C.seaLight, 8);
            if (this.caught >= this.need) { api.addScore(200); api.win(); return; }
          } else {
            this.lives--;
            api.shake(3, 0.2); api.flash(C.redBrt, 0.16); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
        }
      }
      this.items = this.items.filter(it => it.y < H + 36);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      // Sky — flat NES layers
      c.fillStyle = C.seaPale;  c.fillRect(0, 0, W, H * 0.38);
      c.fillStyle = C.seaLight; c.fillRect(0, H * 0.38, W, H * 0.22);
      c.fillStyle = C.seaMid;   c.fillRect(0, H * 0.60, W, H * 0.40);

      // Floating Laputa island (top)
      g.rect(W * 0.08, 34, W * 0.84, 28, C.land);
      g.rect(W * 0.16, 20, W * 0.68, 16, C.landMid);
      // Rock bottom of island (layered)
      g.rect(W * 0.06, 60, W * 0.14, 9, C.inkBrown);
      g.rect(W * 0.24, 58, W * 0.18, 11, C.inkBrown);
      g.rect(W * 0.46, 60, W * 0.22, 9, C.inkBrown);
      g.rect(W * 0.72, 58, W * 0.22, 11, C.inkBrown);
      // Buildings on island
      g.rect(W * 0.22, 16, 18, 18, C.parch);
      g.rect(W * 0.54, 14, 22, 22, C.parch);
      g.rect(W * 0.68, 18, 14, 16, C.parch);
      // Observatory dome (Laputans study the sky)
      g.circle(W * 0.38, 18, 9, C.parchW);
      g.rect(W * 0.38 - 9, 24, 18, 6, C.parch);

      // Floating clouds
      for (let i = 0; i < 3; i++) {
        const cx = (30 + i * 95 + api.t * 7) % (W + 60) - 30;
        const cy = H * 0.28 + i * 18;
        g.rect(cx - 18, cy, 36, 12, C.pureW);
        g.rect(cx - 10, cy - 8, 20, 10, C.pureW);
      }

      // Animated magnetic chains (3 from island)
      for (let i = 0; i < 3; i++) {
        const lx = W * (0.22 + i * 0.28);
        const bob = Math.sin(api.t * 1.4 + i * 1.2) * 5;
        for (let j = 0; j < 4; j++) g.rect(lx - 1, 68 + j * 6 + bob, 2, 4, C.greyMid);
        g.rect(lx - 5, 92 + bob, 10, 7, C.grey);    // lodestone
        g.rect(lx - 4, 94 + bob, 3, 3, C.red);       // red pole
        g.rect(lx + 1, 94 + bob, 3, 3, C.blue);      // blue pole
      }

      // Falling items
      for (const it of this.items) {
        if (it.magnet) {
          g.rect(it.x - 5, it.y - 9, 10, 9, C.grey);   // horseshoe top
          g.rect(it.x - 7, it.y, 4, 7, C.grey);         // left arm
          g.rect(it.x + 3, it.y, 4, 7, C.grey);         // right arm
          g.rect(it.x - 8, it.y + 5, 4, 3, C.red);      // red tip
          g.rect(it.x + 4, it.y + 5, 4, 3, C.blue);     // blue tip
        } else {
          // Philosophical book
          g.rect(it.x - 7, it.y - 10, 14, 17, C.parch);
          g.rect(it.x - 6, it.y - 9, 12, 15, C.parchW);
          g.rect(it.x - 4, it.y - 4, 8, 2, C.amber);   // text line
          g.rect(it.x - 4, it.y + 1, 8, 2, C.amber);
        }
      }

      // Gulliver (catcher)
      const py = H - 48;
      g.circle(this.px, py - 9, 5, C.skin);
      g.rect(this.px - 5, py - 4, 11, 14, C.redBrt);
      // Outstretched arms (catching tray)
      g.rect(this.px - 16, py + 7, 32, 5, C.inkBrown);
      g.rect(this.px - 18, py + 9, 5, 8, C.inkBrown);
      g.rect(this.px + 13, py + 9, 5, 8, C.inkBrown);

      api.topBar('LAPUTA  MAGNETS: ' + this.caught + '/' + this.need + '  ⧗' + Math.ceil(this.timer));
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.redBrt : C.deepSea);
      }
    },
  };

  /* ---------- 5. THE HOUYHNHNMS ---------- */
  const chHorse = {
    id: 'houyhnhnms',
    name: 'HOUYHNHNMS',
    sub: 'Prove your reason',
    intro: [
      'The noble horse-folk',
      'doubt Gulliver\'s',
      'reason. As a Yahoo',
      'charges, show calm',
      'logic — tap the zone!'
    ],
    quote: '"He agreed entirely with the sentiments I had delivered." — J. Swift',
    help: 'TAP when the pendulum enters the GOLD REASON zone. 6 proofs; Yahoos interrupt!',
    icon(api, x, y) {
      const g = api.gfx;
      // Horse head
      g.rect(x - 8, y - 3, 14, 10, C.parchW);
      g.rect(x - 4, y - 12, 8, 10, C.parchW);
      g.rect(x - 8, y - 16, 12, 5, C.amber);  // mane
      g.rect(x + 4, y - 6, 5, 4, C.parchW);   // nose
      g.rect(x - 7, y - 1, 2, 2, C.black);    // eye
      // Small Gulliver bowing
      g.circle(x - 12, y + 6, 3, C.skin);
      g.rect(x - 14, y + 8, 4, 6, C.redBrt);
    },
    init(api) {
      this.proofs = 6;
      this.done = 0;
      this.lives = 3;
      this.angle = 0;
      this.speed = 1.0;    // initial pendulum speed rad/s
      this.zoneW = 0.50;   // initial gold zone width rad
      this.flashT = 0;
      this.missT = 0;
      this.yahooT = 3.8;   // countdown to next Yahoo
    },
    update(api, dt) {
      const maxA = Math.PI * 0.65;
      this.angle += this.speed * dt;
      if (this.angle > maxA || this.angle < -maxA) {
        this.speed = -this.speed;
        this.angle = clamp(this.angle, -maxA, maxA);
      }
      if (this.flashT > 0) this.flashT -= dt;
      if (this.missT > 0)  this.missT -= dt;

      // Yahoo charges
      this.yahooT -= dt;
      if (this.yahooT <= 0) {
        this.lives--;
        this.yahooT = 3.0 + Math.random() * 1.5;
        this.missT = 0.6;
        api.shake(4, 0.28); api.flash(C.redBrt, 0.22); api.audio.sfx('hurt');
        if (this.lives <= 0) { api.lose(); return; }
      }

      // Tap to prove reason
      if (api.pointer.justDown || api.keyPressed('a')) {
        if (Math.abs(this.angle) < this.zoneW / 2) {
          this.done++;
          this.flashT = 0.55;
          this.yahooT += 1.6;  // delay next Yahoo
          api.audio.sfx('coin');
          api.burst(api.W / 2, api.H * 0.55, C.gold, 12);
          api.addScore(50);
          if (this.done >= this.proofs) { api.addScore(300); api.win(); return; }
          this.speed *= 1.10;
          this.zoneW = Math.max(0.14, this.zoneW - 0.02);
        } else {
          this.missT = 0.28;
          api.shake(2, 0.12); api.audio.sfx('hurt');
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      // Rolling Houyhnhnm hills
      c.fillStyle = C.seaPale;  c.fillRect(0, 0, W, H * 0.42); // sky
      c.fillStyle = C.landBrt;  c.fillRect(0, H * 0.42, W, H * 0.58);
      // Hills (flat blocks)
      c.fillStyle = C.landMid;
      c.fillRect(0, H * 0.38, W * 0.38, H * 0.08);
      c.fillRect(W * 0.62, H * 0.36, W * 0.38, H * 0.10);
      c.fillRect(W * 0.22, H * 0.40, W * 0.32, H * 0.06);
      c.fillStyle = C.land;
      c.fillRect(0, H * 0.40, W * 0.22, H * 0.06);
      c.fillRect(W * 0.78, H * 0.38, W * 0.22, H * 0.08);

      // Trees
      for (let i = 0; i < 3; i++) {
        const tx = 14 + i * 72;
        g.rect(tx, H * 0.50, 6, 18, C.inkBrown);
        g.rect(tx - 8, H * 0.36, 22, 16, C.land);
        g.rect(tx - 5, H * 0.30, 16, 10, C.landMid);
      }

      // Houyhnhnm horse (right side)
      const hx = W * 0.80, hy = H * 0.38;
      g.rect(hx - 20, hy, 42, 22, C.parchW);     // body
      g.rect(hx - 26, hy - 20, 18, 22, C.parchW); // neck + head
      g.rect(hx - 22, hy - 26, 12, 8, C.parchW);  // nose
      g.rect(hx - 28, hy - 30, 6, 9, C.amber);    // ear
      g.rect(hx - 20, hy - 30, 6, 7, C.amber);
      g.rect(hx - 31, hy - 24, 4, 4, C.black);    // eye
      g.rect(hx - 28, hy - 22, 8, 22, C.amber);   // mane
      // Legs
      g.rect(hx - 16, hy + 22, 7, 14, C.parchW);
      g.rect(hx - 5,  hy + 22, 7, 14, C.parchW);
      g.rect(hx + 6,  hy + 22, 7, 14, C.parchW);
      g.rect(hx + 17, hy + 22, 7, 14, C.parchW);
      // Tail
      g.rect(hx + 20, hy + 4, 12, 5, C.amber);
      g.rect(hx + 26, hy + 6, 5, 16, C.amber);

      // Gulliver bowing (center-left)
      const gx = W * 0.30, gy = H * 0.60;
      g.circle(gx, gy - 16, 6, C.skin);
      g.rect(gx - 5, gy - 10, 11, 16, C.redBrt);
      g.rect(gx - 14, gy - 4, 10, 4, C.redBrt);  // arm out
      g.rect(gx + 5, gy - 4, 10, 4, C.redBrt);
      g.rect(gx - 6, gy + 6, 12, 5, C.blue);     // trousers

      // Yahoo warning (when close)
      if (this.yahooT < 1.2) {
        const yFlash = Math.floor(api.t * 6) % 2;
        if (yFlash) {
          api.txtCFit('⚡ YAHOO!', W / 2, H * 0.72, 11, C.redBrt, true);
        }
      }
      // Yahoo attack flash
      if (this.missT > 0) {
        c.globalAlpha = Math.min(1, this.missT * 1.5);
        c.fillStyle = C.red; c.fillRect(0, 0, W, H);
        c.globalAlpha = 1;
      }

      // Pendulum meter
      const mx = W / 2, my = H * 0.82;
      const pendR = 46;
      // Background arc
      c.beginPath();
      c.arc(mx, my, pendR, Math.PI * 1.05, Math.PI * 1.95);
      c.lineWidth = 9; c.strokeStyle = C.deepSea; c.stroke();
      // Gold zone
      c.beginPath();
      c.arc(mx, my, pendR, Math.PI * 1.5 - this.zoneW / 2, Math.PI * 1.5 + this.zoneW / 2);
      c.lineWidth = 9; c.strokeStyle = this.flashT > 0 ? C.landBrt : C.gold; c.stroke();
      c.lineWidth = 1;
      // Needle
      const ang = Math.PI * 1.5 + this.angle;
      const nx = mx + Math.cos(ang) * pendR;
      const ny = my + Math.sin(ang) * pendR;
      c.beginPath(); c.moveTo(mx, my); c.lineTo(nx, ny);
      c.strokeStyle = this.flashT > 0 ? C.gold : C.greyMid;
      c.lineWidth = 3; c.stroke(); c.lineWidth = 1;
      g.circle(nx, ny, 5, this.flashT > 0 ? C.landBrt : C.redBrt);

      // Proof dots
      for (let i = 0; i < this.proofs; i++) {
        g.rect(mx - this.proofs * 7 + i * 14, my - 58, 10, 10,
          i < this.done ? C.gold : C.deepSea);
      }

      api.topBar("HOUYHNHNMS  PROOFS: " + this.done + '/' + this.proofs);
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.redBrt : C.deepSea);
      }
    },
  };

  /* ========================= CREATE SAGA ========================= */
  RetroSaga.create({
    id: 'gulliver-travels',
    title: "GULLIVER'S TRAVELS",
    subtitle: 'INTO SEVERAL REMOTE NATIONS',
    accent: '#F8B800',
    credit: 'JONATHAN SWIFT · 1726',
    currency: 'LEAGUES',
    bootCta: 'TAP TO SET SAIL',
    menuLabel: 'CHART YOUR VOYAGE',
    menuHint: 'TAP A DESTINATION',
    menuDone: 'ALL VOYAGES CHARTED',
    finale: '"Beyond every horizon lies another world. Set sail, Lemuel Gulliver." — J. Swift',
    bootLine: 'FIVE VOYAGES · ONE CHRONICLE',

    emblem,
    scenery,

    palette: {
      ink:    C.black,
      dark:   C.inkBrown,
      panel:  'rgba(10,5,0,.80)',
      gold:   C.gold,
      cream:  C.parch,
      dim:    C.amber,
      blood:  C.red,
      white:  C.white,
      shadow: 'rgba(0,0,0,.55)',
    },

    screens: {
      overlay:      'rgba(4,2,0,.86)',
      win:          C.gold,
      lose:         C.red,
      chapterLabel: C.amber,
      name:         C.parch,
      sub:          C.redBrt,
      intro:        C.parch,
      quote:        C.amber,
      help:         C.gold,
      score:        C.parch,
      cur:          C.gold,
      cta:          C.parch,
    },

    labels: {
      chapter:  'VOYAGE',
      score:    'LEAGUES',
      win:      'THE CHRONICLE HOLDS',
      lose:     'THE TALE RUNS AGROUND',
      cont:     'TAP TO CONTINUE',
      finale:   'TAP FOR THE FINALE',
      toMenu:   'TAP TO RETURN TO MAP',
      play:     'SET SAIL',
    },

    menu: {
      colors: {
        panel:    'rgba(40,20,4,.65)',
        panelSel: 'rgba(80,42,8,.88)',
        border:   C.gold,
        name:     C.parch,
        nameDone: C.gold,
        sub:      C.amber,
        title:    C.gold,
        label:    C.amber,
        cur:      C.parch,
        hint:     C.amber,
      },
      title:  drawMenuTitle,
      layout(api) { return LAYOUT; },
      card:   drawMenuCard,
    },

    width: 270, height: 480, parent: '#game',

    chapters: [chStorm, chLilliput, chBrob, chLaputa, chHorse],
  });
})();
