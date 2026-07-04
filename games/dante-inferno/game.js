/* ============================================================================
 * DANTE'S INFERNO — THE LONG DESCENT
 * Five circles from Dante Alighieri's Inferno (c.1308–1321):
 *   1. THE DARK WOOD    — dodge three wild beasts in the dark forest (survive/dodge)
 *   2. CHARON'S FERRY   — pendulum timing to row across the river Acheron (timing)
 *   3. RIVER OF BLOOD   — dodge centaur arrows & blood eruptions in Phlegethon (dodge)
 *   4. MALEBOLGE        — stealth past demon guards, collect 8 soul-flames (stealth)
 *   5. COCYTUS          — pendulum timing to climb past Lucifer's frozen form (timing)
 * Built on RetroSaga (js/saga.js) · NES-honest palette — flat fills, no gradients.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ======================== NES-HONEST PALETTE ======================== */
  const C = {
    black:    '#000000',
    void2:    '#180000',    // near-black void (deep hell)
    hellDk:   '#3C0800',    // very dark stone
    hell:     '#680C00',    // dark rock
    hellMid:  '#A83800',    // mid rock / ember stone
    embers:   '#D82800',    // glowing embers
    fire:     '#FC6000',    // hellfire orange
    fireBrt:  '#FC9840',    // bright flame tip
    gold:     '#F8B800',    // sulfur gold
    cream:    '#FCEEE4',    // pale soul white
    white:    '#F8F8F8',
    iceBlue:  '#6888FC',    // Cocytus ice
    iceLt:    '#A8C8FC',    // light ice highlight
    iceDeep:  '#0000BC',    // deep frozen dark
    stone:    '#584030',    // rock
    stoneLt:  '#887060',    // lighter rock
    dkGreen:  '#004000',    // dark sulphurous forest
    blood:    '#A80020',    // blood red
    purple:   '#6828B4',    // infernal purple
    grey:     '#787878',
    silver:   '#B8B8B8',
    riverDk:  '#3C0008',    // boiling blood river dark
  };

  /* ======================== EMBLEM ========================= */
  // Five concentric infernal rings narrowing to a void + Dante's laureled silhouette
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Five descending circles (the descent into Hell)
    const RING_COLS = [C.hellDk, C.hell, C.hellMid, C.embers, C.fire];
    for (let i = 0; i < 5; i++) {
      const r = 20 - i * 3;
      const yo = cy - 20 + i * 9;
      c.fillStyle = RING_COLS[i];
      c.fillRect(cx - r, yo, r * 2, 8);
    }
    // Dark void at bottom of circles
    g.circle(cx, cy + 26, 5, C.black);
    // Dante's silhouette (head + laurel wreath above rings)
    g.circle(cx, cy - 28, 8, C.cream);           // head
    c.fillStyle = C.gold;
    c.fillRect(cx - 10, cy - 36, 20, 4);         // wreath top
    c.fillRect(cx - 12, cy - 33, 4, 7);          // wreath side L
    c.fillRect(cx + 8,  cy - 33, 4, 7);          // wreath side R
    g.rect(cx - 6, cy - 20, 12, 18, C.blood);    // robe
    g.rect(cx - 10, cy - 17, 6, 10, C.blood);    // arm L
    g.rect(cx + 4,  cy - 17, 6, 10, C.blood);    // arm R
    // Downward arrow
    c.fillStyle = C.gold;
    c.fillRect(cx - 1, cy + 2, 3, 12);
    c.fillRect(cx - 5, cy + 9,  11, 3);
    c.fillRect(cx - 3, cy + 12, 7, 3);
    c.fillRect(cx - 1, cy + 15, 3, 3);
  }

  /* ======================== SCENERY ========================= */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Near-black void base
    c.fillStyle = C.void2; c.fillRect(0, 0, W, H);

    // Infernal glow rising from below — flat NES bands
    c.fillStyle = C.hellDk;  c.fillRect(0, H * 0.52, W, H * 0.48);
    c.fillStyle = C.hell;    c.fillRect(0, H * 0.64, W, H * 0.36);
    c.fillStyle = C.hellMid; c.fillRect(0, H * 0.76, W, H * 0.24);
    c.fillStyle = C.embers;  c.fillRect(0, H * 0.88, W, H * 0.12);
    c.fillStyle = C.fire;    c.fillRect(0, H * 0.94, W, H * 0.06);

    // Rocky walls — left and right
    c.fillStyle = C.hellDk;
    c.fillRect(0, H * 0.20, 42, H * 0.80);
    c.fillRect(W - 42, H * 0.20, 42, H * 0.80);
    // Craggy top notches
    for (let i = 0; i < 3; i++) {
      c.fillRect(i * 15, H * 0.16, 11, H * 0.06, C.hellDk);
      c.fillRect(W - 11 - i * 15, H * 0.16, 11, H * 0.06, C.hellDk);
    }

    // Flame columns at base (animated, flat)
    const flk = Math.floor(t * 7) % 4;
    for (let fx = 22; fx < W - 22; fx += 46) {
      const fh = 16 + ((fx * 3 + flk) % 8);
      c.fillStyle = C.embers;  c.fillRect(fx - 5, H - fh - 4, 10, fh + 4);
      c.fillStyle = C.fire;    c.fillRect(fx - 3, H - fh + 2, 6, fh - 2);
      c.fillStyle = C.fireBrt; c.fillRect(fx - 1, H - fh + 6, 3, fh - 8);
    }

    // Drifting ember sparks (keyed off t for animation)
    for (let i = 0; i < 14; i++) {
      const ex = ((i * 47 + Math.floor(t * 20) * 3) % (W - 12)) + 6;
      const ey = ((i * 31 + Math.floor(t * 12)) % (H - 70)) + 20;
      const col = (i % 3 === 0) ? C.gold : (i % 3 === 1) ? C.fire : C.embers;
      g.rect(ex, ey, 2, 2, col);
    }

    // Overlay for text screens
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(0,0,0,.84)';
      c.fillRect(0, 0, W, H);
    }
  }

  /* ======================== MENU ========================= */
  // Zigzag descent: five stone tablets staggered left-right going deeper into Hell
  const TABLET_POS = [
    { x: 8,   y: 94,  w: 108, h: 68 },   // I — top, left
    { x: 154, y: 167, w: 108, h: 68 },   // II — mid-upper, right
    { x: 8,   y: 240, w: 108, h: 68 },   // III — center, left
    { x: 154, y: 313, w: 108, h: 68 },   // IV — lower, right
    { x: 76,  y: 388, w: 118, h: 72 },   // V — bottom center (widest)
  ];
  const CIRCLE_NAMES = ['DARK WOOD', 'ACHERON', 'PHLEGETHON', 'MALEBOLGE', 'COCYTUS'];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

  function drawMenuTitle(api, respect) {
    const g = api.gfx, c = api.ctx, W = api.W;
    // Stone arch header
    c.fillStyle = C.hellDk;
    c.fillRect(0, 0, W, 88);
    // Crenellated top
    for (let i = 0; i < 6; i++) c.fillRect(i * 46, 0, 34, 8, C.void2);
    // Bottom border line (embers)
    c.fillStyle = C.embers;
    c.fillRect(0, 86, W, 2);
    // Flame decorations
    g.rect(12, 66, 4, 16, C.embers);
    g.rect(13, 62, 3, 6, C.fire);
    g.rect(W - 16, 66, 4, 16, C.embers);
    g.rect(W - 16, 62, 3, 6, C.fire);
    // Title text
    api.txtCFit("DANTE'S INFERNO", W / 2, 10, 10, C.gold, true);
    api.txtC('THE LONG DESCENT', W / 2, 30, 8, C.fire, false);
    api.txtC('DANTE ALIGHIERI  c.1320', W / 2, 48, 7, C.stoneLt, false);
    api.txtC('SOULS  ' + respect, W / 2, 66, 8, C.gold, false);
  }

  function drawMenuConnectors(api) {
    const c = api.ctx;
    // Ember-trail connectors between consecutive tablets (zigzag path downward)
    for (let i = 0; i < TABLET_POS.length - 1; i++) {
      const pa = TABLET_POS[i], pb = TABLET_POS[i + 1];
      const ax = pa.x + pa.w / 2, ay = pa.y + pa.h;
      const bx = pb.x + pb.w / 2, by = pb.y;
      const dx = bx - ax, dy = by - ay;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len, ny = dy / len;
      c.globalAlpha = 0.55;
      for (let d = 6; d < len - 6; d += 7) {
        const px2 = ax + nx * d, py2 = ay + ny * d;
        c.fillStyle = d % 14 < 7 ? C.embers : C.fire;
        c.fillRect(px2 - 2, py2 - 2, 4, 4);
      }
      c.globalAlpha = 1;
    }
  }

  function drawMenuCard(api, info) {
    const { ch, i, x, y, w, h, sel, done } = info;
    const g = api.gfx, c = api.ctx;
    const cx = x + w / 2, cy = y + h / 2;
    const t = api.t;

    // Stone tablet fill
    c.fillStyle = sel ? C.hell : C.hellDk;
    c.fillRect(x, y, w, h);

    // Carved border
    c.fillStyle = sel ? C.embers : C.hell;
    c.fillRect(x, y, w, 3);
    c.fillRect(x, y + h - 3, w, 3);
    c.fillRect(x, y, 3, h);
    c.fillRect(x + w - 3, y, 3, h);
    // Inner bevel
    c.fillStyle = done ? C.embers : (sel ? C.hellMid : C.hell);
    c.fillRect(x + 3, y + 3, w - 6, 2);
    c.fillRect(x + 3, y + h - 5, w - 6, 2);
    c.fillRect(x + 3, y + 3, 2, h - 6);
    c.fillRect(x + w - 5, y + 3, 2, h - 6);

    // Roman numeral
    api.txtCFit('— ' + ROMAN[i] + ' —', cx, y + 8, 8,
      done ? C.gold : (sel ? C.fireBrt : C.hellMid), true);

    // Circle name
    api.txtCFit(CIRCLE_NAMES[i], cx, y + 26, 7,
      sel ? C.gold : (done ? C.gold : C.stoneLt), true, w - 10);

    // Chapter icon
    if (ch.icon) ch.icon(api, cx, y + 48);

    // Sub-title
    if (ch.sub) api.txtCFit(ch.sub, cx, y + h - 12, 6,
      done ? C.embers : C.grey, false, w - 10);

    // Done mark: ember seal
    if (done) {
      g.circle(x + w - 12, y + 12, 9, C.embers);
      g.circle(x + w - 12, y + 12, 6, C.fire);
      api.txtC('✓', x + w - 12, y + 6, 8, C.gold, false);
    }

    // Selection glow pulse
    if (sel) {
      const pulse = Math.abs(Math.sin(t * 3.8)) * 0.30;
      c.globalAlpha = pulse;
      c.fillStyle = C.fire;
      c.fillRect(x - 2, y - 2, w + 4, h + 4);
      c.globalAlpha = 1;
    }
  }

  /* ===================== CHAPTER 1: THE DARK WOOD ===================== */
  // Dante is lost in the Selva Oscura. Three beasts (panther, lion, wolf) rush
  // across the screen in 3 lanes. Survive 24 seconds with 3 lives.
  const chDarkWood = {
    id: 'darkwood',
    name: 'THE DARK WOOD',
    sub: 'Escape the three beasts',
    intro: [
      '"In the middle of',
      'the journey of life',
      'I came upon a dark',
      'wood. Three fierce',
      'beasts barred my way.',
      'Dodge them to escape!'
    ],
    quote: '"Nel mezzo del cammin di nostra vita / mi ritrovai per una selva oscura." — Inferno, Canto I',
    help: 'STEER left/right to DODGE the wild beasts! 3 lives · 24 seconds · reach the light!',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Dark tree
      c.fillStyle = C.dkGreen;
      c.fillRect(x - 8, y - 14, 16, 10);
      c.fillRect(x - 6, y - 10, 12, 8);
      c.fillStyle = C.stone; c.fillRect(x - 2, y - 4, 5, 14);
      // Beast eyes (glowing red pair)
      c.fillStyle = C.embers;
      c.fillRect(x + 8, y - 6, 3, 3);
      c.fillRect(x + 13, y - 6, 3, 3);
    },
    init(api) {
      this.px = api.W / 2;
      this.lives = 3;
      this.timer = 24;
      this.beasts = [];
      this.beastT = 0;
      this.iframes = 0;
      this.runT = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.timer -= dt;
      this.runT += dt;
      if (this.timer <= 0) { api.addScore(300); api.win(); return; }
      if (this.iframes > 0) this.iframes -= dt;

      const spd = 100;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.pointer.down)     this.px += api.pointer.dx * 1.1;
      this.px = clamp(this.px, 14, W - 14);

      // Spawn beasts — spawn rate rises as timer drops
      this.beastT -= dt;
      const rate = Math.max(0.65, 2.2 - (24 - Math.max(0, this.timer)) * 0.064);
      if (this.beastT <= 0) {
        this.beastT = rate + Math.random() * 0.4;
        const fromLeft = Math.random() < 0.5;
        const lane = Math.floor(Math.random() * 3);
        const kind = Math.floor(Math.random() * 3); // 0=panther 1=lion 2=wolf
        this.beasts.push({
          x: fromLeft ? -30 : W + 30,
          lane,
          vx: (fromLeft ? 1 : -1) * (58 + Math.random() * 48),
          kind,
        });
      }

      for (const b of this.beasts) b.x += b.vx * dt;
      this.beasts = this.beasts.filter(b => b.x > -54 && b.x < W + 54);

      // Collision (3 lane y-positions)
      const LANE_Y = [H * 0.42, H * 0.57, H * 0.71];
      const py = H - 52;
      if (this.iframes <= 0) {
        for (const b of this.beasts) {
          const by = LANE_Y[b.lane];
          if (Math.abs(b.x - this.px) < 26 && Math.abs(by - py) < 24) {
            this.lives--;
            this.iframes = 1.0;
            api.shake(5, 0.30); api.flash(C.blood, 0.20); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
        }
      }
      api.addScore(dt * 10);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Dark forest night
      c.fillStyle = C.void2;  c.fillRect(0, 0, W, H);
      c.fillStyle = C.hellDk; c.fillRect(0, H * 0.56, W, H * 0.44);

      // Scrolling tree silhouettes
      const scroll = (this.runT * 26) % 80;
      c.fillStyle = C.black;
      for (let tx = -scroll; tx < W + 42; tx += 46) {
        c.fillRect(tx + 18, H * 0.20, 7, H * 0.80);  // trunk
        for (let layer = 0; layer < 4; layer++) {
          const lw = 22 - layer * 4, ly = H * 0.08 + layer * 10;
          c.fillRect(tx + 18 - lw, ly, lw * 2, 12);
        }
      }
      // Ground
      c.fillStyle = C.stone;
      c.fillRect(0, H * 0.88, W, H * 0.12);
      c.globalAlpha = 0.20;
      c.fillStyle = C.black;
      for (let gx = 0; gx < W; gx += 20) c.fillRect(gx, H * 0.88, 1, H * 0.12);
      c.globalAlpha = 1;

      // Beasts in 3 height lanes
      const LANE_Y = [H * 0.42, H * 0.57, H * 0.71];
      const BEAST_COLS = [C.purple, C.gold, C.grey];  // panther, lion, wolf
      for (const b of this.beasts) {
        const by = LANE_Y[b.lane];
        const step = Math.floor(api.t * 7 + b.x * 0.05) % 2;
        const bc = BEAST_COLS[b.kind];
        g.rect(b.x - 14, by - 6, 28, 12, bc);               // body
        g.circle(b.vx > 0 ? b.x + 14 : b.x - 14, by - 8, 7, bc);  // head
        // Glowing eyes
        const ex = b.vx > 0 ? b.x + 11 : b.x - 16;
        g.rect(ex,     by - 10, 3, 3, C.embers);
        g.rect(ex + 4, by - 10, 3, 3, C.embers);
        // Legs
        if (step) {
          g.rect(b.x - 10, by + 6, 5, 8, bc);
          g.rect(b.x + 6,  by + 6, 5, 9, bc);
        } else {
          g.rect(b.x - 10, by + 6, 5, 9, bc);
          g.rect(b.x + 6,  by + 6, 5, 8, bc);
        }
      }

      // Dante
      const py = H - 52;
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        const step = Math.floor(this.runT * 8) % 2;
        g.circle(this.px, py - 16, 7, C.cream);
        g.rect(this.px - 8, py - 21, 16, 5, C.gold);          // laurel
        g.rect(this.px - 5, py - 9, 11, 18, C.blood);         // robe
        g.rect(this.px - 11, py - 6, 8, 4, C.blood);
        g.rect(this.px + 3,  py - 6, 8, 4, C.blood);
        if (step) {
          g.rect(this.px - 5, py + 9, 5, 8, C.stone);
          g.rect(this.px + 1, py + 9, 5, 9, C.stone);
        } else {
          g.rect(this.px - 5, py + 9, 5, 9, C.stone);
          g.rect(this.px + 1, py + 9, 5, 8, C.stone);
        }
      }

      api.topBar('DARK WOOD   ⧗ ' + Math.ceil(this.timer) + 's');
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.fire : C.void2);
      }
    },
  };

  /* ===================== CHAPTER 2: CHARON'S FERRY ===================== */
  // Pendulum timing: tap when needle enters gold zone to make an oar stroke.
  // 8 strokes cross the Acheron. Zone narrows each success. 4 misses = swept away.
  const chCharon = {
    id: 'charon',
    name: "CHARON'S FERRY",
    sub: 'Cross the river Acheron',
    intro: [
      'Charon the ferryman',
      'rows the dead across',
      'the dark river.',
      'Pull the oar in the',
      'gold zone to move',
      'the boat forward!'
    ],
    quote: '"Charon the demon, with eyes like embers, beckons them and strikes with his oar." — Inferno, Canto III',
    help: 'TAP or press A when the NEEDLE hits the GOLD ZONE. 8 strokes to cross! 4 misses lose.',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Boat hull
      c.fillStyle = C.stone;
      c.fillRect(x - 12, y, 24, 7);
      c.fillRect(x - 14, y + 2, 3, 5);
      c.fillRect(x + 11,  y + 2, 3, 5);
      // Oar
      c.fillStyle = C.stoneLt;
      c.fillRect(x - 2, y - 12, 3, 22);
      c.fillRect(x - 6, y + 8, 11, 4);
      // Charon (dark ember eyes)
      g.circle(x + 8, y - 8, 5, C.black);
      c.fillStyle = C.embers;
      c.fillRect(x + 5, y - 10, 2, 2);
      c.fillRect(x + 9, y - 10, 2, 2);
      g.rect(x + 5, y - 3, 8, 10, C.black);
    },
    init(api) {
      this.strokes = 8;
      this.done = 0;
      this.misses = 0;
      this.maxMiss = 4;
      this.angle = 0;
      this.speed = 1.0;
      this.zoneW = 0.58;
      this.flashT = 0;
      this.missT = 0;
      this.boatPct = 0;   // 0=near shore, 1=far shore
    },
    update(api, dt) {
      const maxA = Math.PI * 0.72;
      this.angle += this.speed * dt;
      if (this.angle > maxA || this.angle < -maxA) {
        this.speed = -this.speed;
        this.angle = clamp(this.angle, -maxA, maxA);
      }
      if (this.flashT > 0) this.flashT -= dt;
      if (this.missT  > 0) this.missT  -= dt;

      if (api.pointer.justDown || api.keyPressed('a')) {
        if (Math.abs(this.angle) < this.zoneW / 2) {
          this.done++;
          this.flashT = 0.5;
          this.boatPct = this.done / this.strokes;
          api.audio.sfx('coin');
          api.burst(api.W / 2, api.H * 0.62, C.gold, 10);
          api.addScore(50);
          if (this.done >= this.strokes) { api.addScore(300); api.win(); return; }
          this.speed *= 1.10;
          this.zoneW = Math.max(0.10, this.zoneW - 0.044);
        } else {
          this.misses++;
          this.missT = 0.32;
          api.shake(3, 0.14); api.audio.sfx('hurt');
          if (this.misses >= this.maxMiss) { api.lose(); return; }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Dark Acheron sky
      c.fillStyle = C.void2;  c.fillRect(0, 0, W, H);
      c.fillStyle = C.hellDk; c.fillRect(0, H * 0.32, W, H * 0.68);

      // River — black/dark water (flat NES fill)
      c.fillStyle = '#14000A'; c.fillRect(0, H * 0.44, W, H * 0.56);
      c.fillStyle = C.riverDk; c.fillRect(0, H * 0.48, W, H * 0.52);

      // River ripples (dark, flat)
      c.globalAlpha = 0.20;
      c.fillStyle = C.blood;
      for (let ry = H * 0.50; ry < H * 0.88; ry += 12) {
        for (let rx2 = (Math.floor(ry) % 24); rx2 < W; rx2 += 46)
          c.fillRect(rx2, ry, 26, 2);
      }
      c.globalAlpha = 1;

      // Far shore (dark silhouette top)
      c.fillStyle = C.black;
      c.fillRect(0, H * 0.24, W, H * 0.12);
      for (let rx2 = 8; rx2 < W; rx2 += 46) {
        c.fillRect(rx2, H * 0.22, 14, 8);
        c.fillRect(rx2 + 22, H * 0.24, 9, 6);
      }

      // Damned souls in the water (silhouettes)
      for (let i = 0; i < 6; i++) {
        const sx = (i * 42 + 16) % (W - 20) + 10;
        const sy = H * 0.54 + (i % 3) * 14;
        g.circle(sx, sy - 6, 4, C.black);
        g.rect(sx - 3, sy - 2, 7, 8, C.black);
      }

      // Near shore
      c.fillStyle = C.stone;
      c.fillRect(0, H * 0.82, W, H * 0.18);

      // Boat (position based on stroke progress)
      const bx = 32 + this.boatPct * (W - 64);
      const by = H * 0.68;
      c.fillStyle = C.stone;
      c.fillRect(bx - 24, by, 48, 10);
      c.fillRect(bx - 26, by + 3, 5, 7);
      c.fillRect(bx + 21, by + 3, 5, 7);

      // Charon (dark ferryman with ember eyes)
      g.circle(bx + 10, by - 22, 7, C.black);
      g.rect(bx + 6, by - 15, 10, 14, C.black);
      g.rect(bx + 3, by - 12, 8, 4, C.black);
      g.rect(bx + 7, by - 24, 3, 3, C.embers);
      g.rect(bx + 12, by - 24, 3, 3, C.embers);
      // Oar
      g.rect(bx - 4, by - 14, 3, 26, C.stoneLt);
      g.rect(bx - 12, by + 8, 18, 4, C.stoneLt);

      // Dante in boat
      g.circle(bx - 10, by - 16, 6, C.cream);
      g.rect(bx - 14, by - 9, 10, 12, C.blood);
      g.rect(bx - 16, by - 21, 12, 4, C.gold);  // wreath

      // Flash on success
      if (this.flashT > 0) {
        c.globalAlpha = Math.min(1, this.flashT * 1.5) * 0.28;
        c.fillStyle = C.gold; c.fillRect(0, 0, W, H);
        c.globalAlpha = 1;
      }

      // Pendulum meter
      const mx = W / 2, my = H * 0.88;
      const pendR = 52;
      c.beginPath();
      c.arc(mx, my, pendR, Math.PI * 1.02, Math.PI * 1.98);
      c.lineWidth = 10; c.strokeStyle = C.hellDk; c.stroke();
      c.beginPath();
      c.arc(mx, my, pendR,
        Math.PI * 1.5 - this.zoneW / 2,
        Math.PI * 1.5 + this.zoneW / 2);
      c.lineWidth = 10;
      c.strokeStyle = this.flashT > 0 ? C.fireBrt : C.gold;
      c.stroke(); c.lineWidth = 1;

      const ang = Math.PI * 1.5 + this.angle;
      const nx = mx + Math.cos(ang) * pendR;
      const ny = my + Math.sin(ang) * pendR;
      c.beginPath(); c.moveTo(mx, my); c.lineTo(nx, ny);
      c.strokeStyle = this.flashT > 0 ? C.gold : C.silver;
      c.lineWidth = 3; c.stroke(); c.lineWidth = 1;
      g.circle(nx, ny, 5, this.flashT > 0 ? C.gold : C.embers);

      // Stroke progress pips
      for (let i = 0; i < this.strokes; i++) {
        g.rect(mx - this.strokes * 7 + i * 14, my - 68, 10, 10,
          i < this.done ? C.gold : C.hellDk);
      }

      api.topBar("ACHERON  STROKE: " + this.done + '/' + this.strokes);
      for (let i = 0; i < this.maxMiss; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10,
          i < (this.maxMiss - this.misses) ? C.gold : C.void2);
      }
    },
  };

  /* ===================== CHAPTER 3: RIVER OF BLOOD ===================== */
  // Circle 7 — the Violent. Centaurs shoot arrows from above; blood erupts from
  // the river below. Survive 26 seconds with 3 lives.
  const chPhlegethon = {
    id: 'phlegethon',
    name: 'RIVER OF BLOOD',
    sub: 'Survive the boiling flood',
    intro: [
      'The Centaurs guard',
      'Phlegethon — a river',
      'of boiling blood.',
      'They rain arrows on',
      'those who sinned',
      'through violence!'
    ],
    quote: '"A river of blood there seethed, in which seethed those who by violence had injured others." — Inf. XII',
    help: 'STEER left/right to dodge CENTAUR ARROWS and BLOOD ERUPTIONS! 3 lives · 26 seconds.',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Arrow (falling)
      c.fillStyle = C.stoneLt; c.fillRect(x - 14, y - 2, 22, 4);
      c.fillStyle = C.embers;  c.fillRect(x + 6, y - 6, 6, 12);
      // Blood wave
      c.fillStyle = C.blood; c.fillRect(x - 12, y + 8, 24, 6);
      c.fillRect(x - 10, y + 6, 5, 4);
      c.fillRect(x + 5,  y + 6, 5, 4);
    },
    init(api) {
      this.px = api.W / 2;
      this.lives = 3;
      this.timer = 26;
      this.arrows = [];
      this.eruptions = [];
      this.arrowT = 0;
      this.eruptT = 0;
      this.iframes = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.timer -= dt;
      if (this.timer <= 0) { api.addScore(300); api.win(); return; }
      if (this.iframes > 0) this.iframes -= dt;

      const spd = 108;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.pointer.down)     this.px += api.pointer.dx * 1.1;
      this.px = clamp(this.px, 14, W - 14);

      // Arrows from centaurs above (spawn rate rises)
      this.arrowT -= dt;
      const aRate = Math.max(0.48, 1.6 - (26 - Math.max(0, this.timer)) * 0.042);
      if (this.arrowT <= 0) {
        this.arrowT = aRate + Math.random() * 0.38;
        this.arrows.push({
          x: 16 + Math.random() * (W - 32),
          y: -18,
          vy: 92 + Math.random() * 64,
        });
      }

      // Blood eruptions from the river (spawn rate rises)
      this.eruptT -= dt;
      const eRate = Math.max(1.1, 3.5 - (26 - Math.max(0, this.timer)) * 0.082);
      if (this.eruptT <= 0) {
        this.eruptT = eRate + Math.random() * 0.5;
        this.eruptions.push({
          x: 20 + Math.random() * (W - 40),
          y: H + 8,
          vy: -(114 + Math.random() * 60),
        });
      }

      for (const a of this.arrows)    a.y += a.vy * dt;
      for (const e of this.eruptions) e.y += e.vy * dt;
      this.arrows    = this.arrows.filter(a => a.y < H + 24);
      this.eruptions = this.eruptions.filter(e => e.y > -50);

      const py = H - 52;
      if (this.iframes <= 0) {
        for (const a of this.arrows) {
          if (Math.abs(a.x - this.px) < 18 && a.y > py - 22 && a.y < py + 14) {
            this.lives--;
            this.iframes = 1.0;
            api.shake(4, 0.28); api.flash(C.blood, 0.20); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
        }
        for (const e of this.eruptions) {
          if (Math.abs(e.x - this.px) < 22 && e.y > py - 34 && e.y < py + 16) {
            this.lives--;
            this.iframes = 1.0;
            api.shake(5, 0.32); api.flash(C.fire, 0.22); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
        }
      }
      api.addScore(dt * 10);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Hellish red sky
      c.fillStyle = C.hellDk; c.fillRect(0, 0, W, H * 0.28);
      c.fillStyle = C.hell;   c.fillRect(0, H * 0.28, W, H * 0.22);

      // Centaurs on ledge at top (patrolling above)
      for (let cx2 = 18; cx2 < W; cx2 += 78) {
        c.fillStyle = C.stone;   c.fillRect(cx2, H * 0.06, 28, 14);   // horse body
        g.circle(cx2 + 28, H * 0.04, 5, C.cream);                      // head
        c.fillStyle = C.stoneLt; c.fillRect(cx2 + 24, H * 0.08, 8, 12); // torso
        c.fillStyle = C.gold;
        c.fillRect(cx2 + 30, H * 0.04, 2, 14);  // bow vertical
        c.fillRect(cx2 + 28, H * 0.04, 6, 2);   // bow arm top
        c.fillRect(cx2 + 28, H * 0.14, 6, 2);   // bow arm bottom
      }

      // Stone ledge (Dante walks here)
      c.fillStyle = C.stone;
      c.fillRect(0, H * 0.44, W, H * 0.04);

      // Boiling Phlegethon — flat blood-red bands
      c.fillStyle = C.riverDk; c.fillRect(0, H * 0.48, W, H * 0.52);
      c.fillStyle = C.blood;   c.fillRect(0, H * 0.50, W, H * 0.50);
      c.fillStyle = '#680010'; c.fillRect(0, H * 0.54, W, H * 0.46);

      // Boil bubbles (flat)
      c.globalAlpha = 0.32;
      c.fillStyle = C.embers;
      for (let i = 0; i < 8; i++) {
        const bx = ((i * 39 + Math.floor(api.t * 6) * 4) % (W - 12)) + 6;
        const byo = H * 0.50 + ((i * 23 + Math.floor(api.t * 4)) % Math.floor(H * 0.32));
        c.fillRect(bx, byo, 8, 4);
      }
      c.globalAlpha = 1;

      // Arrows (falling down)
      for (const a of this.arrows) {
        g.rect(a.x - 1, a.y - 14, 3, 20, C.stoneLt);
        g.rect(a.x - 5, a.y - 16, 10, 5, C.embers);  // arrowhead
      }

      // Blood eruptions (shooting up from river)
      for (const e of this.eruptions) {
        c.fillStyle = C.blood;
        c.fillRect(e.x - 6, e.y - 28, 12, 28);
        c.fillStyle = C.embers;
        c.fillRect(e.x - 4, e.y - 34, 8, 8);
        c.fillStyle = C.fire;
        c.fillRect(e.x - 2, e.y - 38, 4, 6);
      }

      // Dante
      const py = H - 52;
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        g.circle(this.px, py - 16, 7, C.cream);
        g.rect(this.px - 8, py - 22, 16, 5, C.gold);         // laurel
        g.rect(this.px - 5, py - 9, 11, 18, C.blood);        // robe
        g.rect(this.px - 11, py - 6, 8, 4, C.blood);
        g.rect(this.px + 3,  py - 6, 8, 4, C.blood);
        g.rect(this.px - 5, py + 9, 10, 8, C.stone);         // legs
      }

      api.topBar('PHLEGETHON  ⧗ ' + Math.ceil(this.timer) + 's');
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.fire : C.void2);
      }
    },
  };

  /* ===================== CHAPTER 4: MALEBOLGE ===================== */
  // Circle 8. Stealth: Dante moves freely (drag + arrows). Avoid demon guards'
  // sweeping torch-cones. Collect 8 soul-flames. 28-second timer. 3 lives.
  const chMalebolge = {
    id: 'malebolge',
    name: 'MALEBOLGE',
    sub: 'Slip past the demons',
    intro: [
      'Malebolge: the eighth',
      'circle, ten dark pits.',
      'Malebranche demons',
      'sweep their torches.',
      'Stay in shadow and',
      'collect 8 soul-flames!'
    ],
    quote: '"There is a place in Hell called Malebolge, all stone and of iron colour..." — Inferno, Canto XVIII',
    help: 'DRAG or use ARROWS to sneak past torch-cones! Collect 8 gold soul-flames. 3 lives · 28 seconds.',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Demon with torch
      g.circle(x - 6, y - 10, 5, C.embers);
      g.rect(x - 9, y - 5, 9, 10, C.embers);
      // Horns
      c.fillStyle = C.blood;
      c.fillRect(x - 10, y - 16, 3, 7);
      c.fillRect(x - 3,  y - 16, 3, 7);
      // Torch cone
      c.globalAlpha = 0.50;
      c.fillStyle = C.gold;
      c.fillRect(x - 2, y - 8, 14, 4);
      c.globalAlpha = 1;
      // Soul flame (collect)
      g.circle(x + 11, y + 8, 5, C.gold);
      g.circle(x + 11, y + 5, 3, C.fireBrt);
    },
    init(api) {
      this.px = api.W / 2;
      this.py = api.H * 0.72;
      this.lives = 3;
      this.timer = 28;
      this.souls = 0;
      this.need = 8;
      this.iframes = 0;
      this.flames = [];
      this.guards = [];
      this._spawnLevel(api);
    },
    _spawnLevel(api) {
      const W = api.W, H = api.H;
      this.flames = [];
      for (let i = 0; i < this.need; i++) {
        this.flames.push({
          x: 24 + Math.random() * (W - 48),
          y: H * 0.14 + Math.random() * H * 0.60,
          collected: false,
        });
      }
      this.guards = [
        { x: 40,    y: H * 0.28, angle: 0.0,            sweepSpd: 1.10, range: 82 },
        { x: 230,   y: H * 0.28, angle: Math.PI,         sweepSpd: -0.95, range: 78 },
        { x: 135,   y: H * 0.48, angle: Math.PI * 0.5,   sweepSpd: 1.28, range: 72 },
        { x: 55,    y: H * 0.68, angle: Math.PI * 1.5,   sweepSpd: -1.05, range: 74 },
        { x: 215,   y: H * 0.68, angle: Math.PI * 0.35,  sweepSpd: 0.98, range: 70 },
      ];
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.timer -= dt;
      if (this.timer <= 0 && this.souls < this.need) { api.lose(); return; }
      if (this.iframes > 0) this.iframes -= dt;

      const spd = 88;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.keyDown('up'))    this.py -= spd * dt;
      if (api.keyDown('down'))  this.py += spd * dt;
      if (api.pointer.down) {
        this.px += api.pointer.dx * 1.0;
        this.py += api.pointer.dy * 1.0;
      }
      this.px = clamp(this.px, 12, W - 12);
      this.py = clamp(this.py, H * 0.10, H - 26);

      for (const grd of this.guards) {
        grd.angle += grd.sweepSpd * dt;
      }

      // Collect soul-flames
      for (const fl of this.flames) {
        if (!fl.collected &&
            Math.abs(fl.x - this.px) < 16 && Math.abs(fl.y - this.py) < 16) {
          fl.collected = true;
          this.souls++;
          api.addScore(40);
          api.audio.sfx('coin');
          api.burst(this.px, this.py, C.gold, 8);
          if (this.souls >= this.need) { api.addScore(300); api.win(); return; }
        }
      }

      // Guard detection
      if (this.iframes <= 0) {
        for (const grd of this.guards) {
          const dx = this.px - grd.x, dy = this.py - grd.y;
          const dist2 = Math.sqrt(dx * dx + dy * dy);
          if (dist2 < grd.range) {
            const ang2 = Math.atan2(dy, dx);
            let diff = ang2 - grd.angle;
            while (diff > Math.PI)  diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            if (Math.abs(diff) < 0.32) {
              this.lives--;
              this.iframes = 1.2;
              api.shake(4, 0.30); api.flash(C.fire, 0.22); api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Dark stone ditches — flat fills
      c.fillStyle = '#100400'; c.fillRect(0, 0, W, H);
      c.fillStyle = C.hellDk;
      for (let dy = 0; dy < H; dy += 58) c.fillRect(0, dy, W, 10);
      // Pit fissures
      c.globalAlpha = 0.14;
      c.fillStyle = C.fire;
      for (let dy = 28; dy < H; dy += 58) c.fillRect(0, dy, W, 8);
      c.globalAlpha = 1;
      // Vertical wall cracks
      c.globalAlpha = 0.10;
      c.fillStyle = C.hell;
      for (let dx = 0; dx < W; dx += 42) c.fillRect(dx, 0, 2, H);
      c.globalAlpha = 1;

      // Soul-flames (collectibles)
      for (const fl of this.flames) {
        if (fl.collected) continue;
        const flk = Math.floor(api.t * 8 + fl.x * 0.1) % 2;
        g.circle(fl.x, fl.y, 6, C.gold);
        g.circle(fl.x, fl.y - 4 - flk * 2, 3, C.fireBrt);
        c.globalAlpha = 0.28;
        c.fillStyle = C.gold;
        c.fillRect(fl.x - 10, fl.y - 10, 20, 20);
        c.globalAlpha = 1;
      }

      // Demon guards + torch cones
      for (const grd of this.guards) {
        // Cone
        c.globalAlpha = 0.24;
        c.fillStyle = C.gold;
        c.beginPath();
        c.moveTo(grd.x, grd.y);
        c.lineTo(grd.x + Math.cos(grd.angle - 0.32) * grd.range,
                 grd.y + Math.sin(grd.angle - 0.32) * grd.range);
        c.lineTo(grd.x + Math.cos(grd.angle + 0.32) * grd.range,
                 grd.y + Math.sin(grd.angle + 0.32) * grd.range);
        c.closePath(); c.fill();
        c.globalAlpha = 1;
        // Body
        g.circle(grd.x, grd.y - 12, 7, C.embers);
        g.rect(grd.x - 6, grd.y - 5, 12, 12, C.embers);
        g.rect(grd.x - 14, grd.y - 8, 10, 6, C.blood);  // wing L
        g.rect(grd.x + 4,  grd.y - 8, 10, 6, C.blood);  // wing R
        g.rect(grd.x - 6, grd.y - 21, 3, 10, C.fire);   // horn L
        g.rect(grd.x + 3, grd.y - 21, 3, 10, C.fire);   // horn R
        g.rect(grd.x - 3, grd.y - 14, 2, 2, C.fireBrt); // eye L
        g.rect(grd.x + 1, grd.y - 14, 2, 2, C.fireBrt); // eye R
        // Torch
        const tx = grd.x + Math.cos(grd.angle) * 16;
        const ty = grd.y + Math.sin(grd.angle) * 16;
        g.rect(tx - 2, ty - 8, 4, 14, C.stone);
        g.rect(tx - 3, ty - 12, 6, 6, C.fire);
        g.rect(tx - 2, ty - 14, 4, 4, C.gold);
      }

      // Dante
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        g.circle(this.px, this.py - 14, 6, C.cream);
        g.rect(this.px - 7, this.py - 19, 14, 4, C.gold);    // laurel
        g.rect(this.px - 5, this.py - 8, 10, 16, C.blood);   // robe
        g.rect(this.px - 9, this.py - 5, 6, 10, C.blood);
        g.rect(this.px + 3, this.py - 5, 6, 10, C.blood);
      }

      api.topBar('MALEBOLGE  SOULS: ' + this.souls + '/' + this.need + '  ⧗ ' + Math.ceil(this.timer));
      for (let i = 0; i < 3; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10, i < this.lives ? C.fire : C.void2);
      }
    },
  };

  /* ===================== CHAPTER 5: COCYTUS ===================== */
  // The frozen 9th circle. Pendulum timing: tap when needle enters gold zone to
  // ascend one step past Lucifer's frozen body. 8 ascents to freedom.
  const chCocytus = {
    id: 'cocytus',
    name: 'COCYTUS',
    sub: 'Climb past Lucifer',
    intro: [
      'Cocytus — the frozen',
      'lake at the bottom',
      'of Hell. Lucifer is',
      'sealed in ice.',
      'Tap the gold zone',
      '8 times to escape!'
    ],
    quote: '"I saw him who was once so fair, frozen in the ice from the chest upward." — Inferno, Canto XXXIV',
    help: 'TAP when the NEEDLE hits the GOLD ZONE! 8 perfect ascents past Lucifer to escape. 4 misses lose.',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Ice slab
      c.globalAlpha = 0.65;
      c.fillStyle = C.iceBlue;
      c.fillRect(x - 10, y - 12, 20, 24);
      c.globalAlpha = 1;
      // Lucifer — three heads visible through ice
      g.circle(x - 5, y - 8, 4, C.blood);
      g.circle(x + 5, y - 8, 4, C.blood);
      g.circle(x,     y - 14, 5, C.purple);
      // Upward arrow (escape)
      c.fillStyle = C.gold;
      c.fillRect(x - 1, y + 12, 3, 10);
      c.fillRect(x - 5, y + 12,  11, 3);
      c.fillRect(x - 3, y + 15,  7, 3);
      c.fillRect(x - 1, y + 18,  3, 3);
    },
    init(api) {
      this.ascents  = 8;
      this.done     = 0;
      this.misses   = 0;
      this.maxMiss  = 4;
      this.angle    = 0;
      this.speed    = 1.0;
      this.zoneW    = 0.55;
      this.flashT   = 0;
      this.missT    = 0;
      this.dantePct = 0;   // 0=bottom, 1=escaped
    },
    update(api, dt) {
      const maxA = Math.PI * 0.72;
      this.angle += this.speed * dt;
      if (this.angle > maxA || this.angle < -maxA) {
        this.speed = -this.speed;
        this.angle = clamp(this.angle, -maxA, maxA);
      }
      if (this.flashT > 0) this.flashT -= dt;
      if (this.missT  > 0) this.missT  -= dt;

      if (api.pointer.justDown || api.keyPressed('a')) {
        if (Math.abs(this.angle) < this.zoneW / 2) {
          this.done++;
          this.flashT = 0.5;
          this.dantePct = this.done / this.ascents;
          api.audio.sfx('coin');
          api.burst(api.W / 2, api.H * 0.50, C.iceLt, 10);
          api.addScore(55);
          if (this.done >= this.ascents) { api.addScore(400); api.win(); return; }
          this.speed *= 1.10;
          this.zoneW = Math.max(0.10, this.zoneW - 0.044);
        } else {
          this.misses++;
          this.missT = 0.32;
          api.shake(3, 0.16); api.audio.sfx('hurt');
          if (this.misses >= this.maxMiss) { api.lose(); return; }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Deep frozen void
      c.fillStyle = C.iceDeep; c.fillRect(0, 0, W, H);
      c.fillStyle = '#00006C'; c.fillRect(0, 0, W, H * 0.42);
      c.fillStyle = '#001080'; c.fillRect(0, H * 0.42, W, H * 0.58);

      // Ice cracks (flat lines, NES style)
      c.globalAlpha = 0.24;
      c.fillStyle = C.iceLt;
      for (let i = 0; i < 9; i++) {
        const ix = (i * 51 + 12) % (W - 20);
        const iy = (i * 47 + 18) % (H - 38);
        c.fillRect(ix, iy, 2, 28 + (i % 4) * 18);
        c.fillRect(ix, iy, 18 + (i % 3) * 12, 2);
      }
      c.globalAlpha = 1;

      // Lucifer — frozen in ice center-stage
      const lx = W / 2, ly = H * 0.44;
      c.globalAlpha = 0.50;
      c.fillStyle = C.iceBlue;
      c.fillRect(lx - 30, ly - 64, 60, 94);  // ice slab encasing him
      c.globalAlpha = 0.80;
      // Three heads
      g.circle(lx - 14, ly - 54, 12, C.blood);
      g.circle(lx + 14, ly - 54, 12, C.blood);
      g.circle(lx,      ly - 66, 14, C.purple);
      // Bat wings (dark, flat)
      c.fillStyle = C.void2;
      c.fillRect(lx - 54, ly - 48, 26, 22);
      c.fillRect(lx + 28, ly - 48, 26, 22);
      c.globalAlpha = 1;
      // Ice overlay (makes him look trapped)
      c.globalAlpha = 0.36;
      c.fillStyle = C.iceBlue;
      c.fillRect(lx - 32, ly - 68, 64, 98);
      c.globalAlpha = 1;

      // Frozen souls in ice
      for (let i = 0; i < 6; i++) {
        const sx = (i * 44 + 14) % (W - 30) + 15;
        const sy = H * 0.10 + (i * 37) % Math.floor(H * 0.68);
        c.globalAlpha = 0.32;
        c.fillStyle = C.iceLt;
        c.fillRect(sx - 5, sy - 8, 10, 16);
        c.globalAlpha = 1;
        g.circle(sx, sy - 6, 3, C.iceLt);
      }

      // Dante — climbing upward along ice wall
      const dx = W / 2 + 30;
      const dy = H * 0.82 - this.dantePct * H * 0.56;
      const hide = this.missT > 0 && Math.floor(api.t * 9) % 2;
      if (!hide) {
        g.circle(dx, dy - 14, 7, C.cream);
        g.rect(dx - 7, dy - 19, 14, 5, C.gold);   // laurel
        g.rect(dx - 5, dy - 7, 11, 16, C.blood);  // robe
        g.rect(dx - 11, dy - 4, 8, 4, C.blood);
        g.rect(dx + 3,  dy - 4, 8, 4, C.blood);
        // Climbing hands gripping the ice wall
        g.rect(dx - 18, dy - 8, 9, 3, C.blood);
        g.rect(dx + 9,  dy - 12, 9, 3, C.blood);
      }

      // Flash on success
      if (this.flashT > 0) {
        c.globalAlpha = Math.min(1, this.flashT * 1.5) * 0.22;
        c.fillStyle = C.iceLt; c.fillRect(0, 0, W, H);
        c.globalAlpha = 1;
      }

      // Pendulum meter
      const mx = W / 2, my = H * 0.88;
      const pendR = 52;
      c.beginPath();
      c.arc(mx, my, pendR, Math.PI * 1.02, Math.PI * 1.98);
      c.lineWidth = 10; c.strokeStyle = C.iceDeep; c.stroke();
      c.beginPath();
      c.arc(mx, my, pendR,
        Math.PI * 1.5 - this.zoneW / 2,
        Math.PI * 1.5 + this.zoneW / 2);
      c.lineWidth = 10;
      c.strokeStyle = this.flashT > 0 ? C.iceLt : C.gold;
      c.stroke(); c.lineWidth = 1;

      const ang = Math.PI * 1.5 + this.angle;
      const nx = mx + Math.cos(ang) * pendR;
      const ny = my + Math.sin(ang) * pendR;
      c.beginPath(); c.moveTo(mx, my); c.lineTo(nx, ny);
      c.strokeStyle = this.missT > 0 ? C.blood : C.silver;
      c.lineWidth = 3; c.stroke(); c.lineWidth = 1;
      g.circle(nx, ny, 5, this.flashT > 0 ? C.iceLt : C.iceBlue);

      // Ascent progress pips
      for (let i = 0; i < this.ascents; i++) {
        g.rect(mx - this.ascents * 7 + i * 14, my - 68, 10, 10,
          i < this.done ? C.iceBlue : C.iceDeep);
      }

      api.topBar('COCYTUS  ASCENT: ' + this.done + '/' + this.ascents);
      for (let i = 0; i < this.maxMiss; i++) {
        g.rect(W - 14 - i * 18, 3, 12, 10,
          i < (this.maxMiss - this.misses) ? C.iceBlue : C.iceDeep);
      }
    },
  };

  /* ========================= CREATE SAGA ========================= */
  RetroSaga.create({
    id: 'dante-inferno',
    title: "DANTE'S INFERNO",
    subtitle: 'THE LONG DESCENT',
    accent: '#FC6000',
    credit: 'DANTE ALIGHIERI · c.1320',
    currency: 'SOULS',
    bootCta: 'TAP TO DESCEND',
    menuLabel: 'CHOOSE YOUR CIRCLE',
    menuHint: 'TAP A STONE TABLET',
    menuDone: 'ALL CIRCLES CROSSED',
    bootLine: 'FIVE CIRCLES · ONE DESCENT',
    finale: '"And thence we came forth, to behold the stars." — Dante Alighieri, Inferno, Canto XXXIV',

    emblem,
    scenery,

    palette: {
      ink:    C.black,
      dark:   C.void2,
      panel:  'rgba(18,2,0,.88)',
      gold:   C.gold,
      cream:  C.cream,
      dim:    C.hell,
      blood:  C.blood,
      white:  C.white,
      shadow: 'rgba(0,0,0,.72)',
    },

    screens: {
      overlay:      'rgba(0,0,0,.88)',
      win:          C.gold,
      lose:         C.fire,
      chapterLabel: C.embers,
      name:         C.cream,
      sub:          C.stoneLt,
      intro:        C.cream,
      quote:        C.fire,
      help:         C.gold,
      score:        C.cream,
      cur:          C.gold,
      cta:          C.fireBrt,
    },

    labels: {
      chapter:  'CIRCLE',
      score:    'SOULS',
      win:      'THE WAY IS OPEN',
      lose:     'THE DARK TAKES YOU',
      cont:     'TAP TO CONTINUE',
      finale:   'TAP FOR THE FINALE',
      toMenu:   'RETURN TO THE CIRCLES',
      play:     'DESCEND',
    },

    menu: {
      colors: {
        panel:    'rgba(18,2,0,.76)',
        panelSel: 'rgba(48,8,0,.92)',
        border:   C.embers,
        name:     C.cream,
        nameDone: C.gold,
        sub:      C.stoneLt,
        title:    C.gold,
        label:    C.fire,
        cur:      C.cream,
        hint:     C.embers,
      },
      title(api, respect) { drawMenuTitle(api, respect); },
      layout(api) { return TABLET_POS; },
      card(api, info) {
        if (info.i === 0) {
          // Infernal stone cavern background
          const c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#0E0200';
          c.fillRect(0, 88, W, H - 88);
          // Horizontal rock strata
          c.globalAlpha = 0.14;
          c.fillStyle = C.hell;
          for (let by = 100; by < H; by += 42) c.fillRect(0, by, W, 16);
          c.globalAlpha = 1;
          // Vertical crack lines
          c.globalAlpha = 0.08;
          c.fillStyle = C.embers;
          for (let bx = 38; bx < W; bx += 54) c.fillRect(bx, 88, 2, H - 88);
          c.globalAlpha = 1;
          // Fire glow at bottom (bottom of the descent)
          c.globalAlpha = 0.22;
          c.fillStyle = C.fire;
          c.fillRect(0, H - 28, W, 28);
          c.globalAlpha = 0.10;
          c.fillStyle = C.fire;
          c.fillRect(0, H - 56, W, 28);
          c.globalAlpha = 1;
          // Draw ember connectors
          drawMenuConnectors(api);
        }
        drawMenuCard(api, info);
      },
    },

    width: 270, height: 480, parent: '#game',

    chapters: [chDarkWood, chCharon, chPhlegethon, chMalebolge, chCocytus],
  });
})();
