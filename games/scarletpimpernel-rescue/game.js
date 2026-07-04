/* ============================================================================
 * THE SCARLET PIMPERNEL — THEY SEEK HIM HERE
 * Five escapades through revolutionary France (Baroness Orczy, 1905):
 *   1. THE CODED DISPATCH — catch the code letters falling from above
 *   2. ROAD TO CALAIS     — dodge patrols in the night carriage run
 *   3. THE GUILLOTINE     — launch three diversions with perfect timing
 *   4. SHADOWS OF THE INN — stealth past three guard patrols
 *   5. DOVER CLIFFS       — dodge lanterns and counter-strike Chauvelin
 * Built on RetroSaga (js/saga.js). NES-honest palette — flat fills, no gradients.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ======================== NES-HONEST PALETTE ======================== */
  const C = {
    black:   '#000000',
    void2:   '#100008',
    bg:      '#280010',
    scarlet: '#A80000',
    scarBrt: '#D82800',
    blood:   '#680000',
    gold:    '#C8A020',
    goldBrt: '#F8B800',
    parch:   '#C8A060',
    cream:   '#F8E8C8',
    navyDk:  '#000040',
    navy:    '#0000BC',
    blue:    '#2850D0',
    grey:    '#787878',
    stoneLt: '#A09080',
    stone:   '#705840',
    white:   '#F8F8F8',
    dkGreen: '#004400',
    brown:   '#804020',
    tan:     '#A07040',
    rose:    '#C84870',
    velvet:  '#1C0010',
    candle:  '#F8D840',
    orange:  '#F87020',
    coatBlu: '#2040A0',
    silver:  '#C0C0C0',
    purple:  '#601880',
  };

  /* ======================== EMBLEM ========================= */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Scarlet pimpernel flower — 5 petals radiating from center
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(a) * 11;
      const py = cy + Math.sin(a) * 11;
      c.fillStyle = C.scarBrt;
      c.fillRect(px - 4, py - 6, 8, 12);
      c.fillRect(px - 6, py - 4, 12, 8);
    }
    // Center disc
    g.circle(cx, cy, 6, C.goldBrt);
    g.circle(cx, cy, 3, C.candle);
    // Stem
    c.fillStyle = C.dkGreen;
    c.fillRect(cx - 1, cy + 12, 3, 12);
    // Leaf
    c.fillRect(cx + 2, cy + 18, 9, 3);
  }

  /* ======================== SCENERY ========================= */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    c.fillStyle = C.void2; c.fillRect(0, 0, W, H);

    if (scene === 'menu') {
      // Grand Parisian ballroom — stone floor, crimson curtains, chandelier
      // Arched stone ceiling
      c.fillStyle = '#200018'; c.fillRect(0, 0, W, H * 0.38);
      c.fillStyle = '#300020'; c.fillRect(0, H * 0.38, W, H * 0.18);
      // Parquet floor
      c.fillStyle = C.stone; c.fillRect(0, H * 0.56, W, H * 0.44);
      c.globalAlpha = 0.12;
      c.fillStyle = C.brown;
      for (let lx = 0; lx < W; lx += 20) c.fillRect(lx, H * 0.56, 1, H * 0.44);
      for (let ly = H * 0.56; ly < H; ly += 20) c.fillRect(0, ly, W, 1);
      c.globalAlpha = 1;
      // Crimson drape pillars — left
      c.fillStyle = C.blood;  c.fillRect(0, 0, 26, H * 0.54);
      c.fillStyle = C.scarlet; c.fillRect(0, 0, 16, H * 0.54);
      c.fillStyle = C.scarBrt;
      for (let dy = 0; dy < H * 0.54; dy += 24) c.fillRect(10, dy, 6, 14);
      // Right pillar
      c.fillStyle = C.blood;  c.fillRect(W - 26, 0, 26, H * 0.54);
      c.fillStyle = C.scarlet; c.fillRect(W - 16, 0, 16, H * 0.54);
      c.fillStyle = C.scarBrt;
      for (let dy = 0; dy < H * 0.54; dy += 24) c.fillRect(W - 16, dy, 6, 14);
      // Gold trim on curtains
      c.fillStyle = C.gold;
      c.fillRect(26, 0, 3, H * 0.54);
      c.fillRect(W - 29, 0, 3, H * 0.54);
      // Chandelier (flat gold oval with candle dots)
      c.fillStyle = C.gold;
      c.fillRect(W / 2 - 38, 12, 76, 10);
      c.fillRect(W / 2 - 28, 8, 56, 8);
      c.fillRect(W / 2 - 16, 4, 32, 8);
      // Chandelier arm drips
      for (let ai = 0; ai < 6; ai++) {
        const ax = W / 2 - 35 + ai * 14;
        c.fillStyle = C.gold; c.fillRect(ax, 22, 3, 14);
        // Candle flame (flickers with t)
        const flk = Math.floor(t * 6 + ai) % 3;
        c.fillStyle = C.candle; c.fillRect(ax - 1, 22 + 14 - 6, 5, 8);
        c.fillStyle = flk === 0 ? C.orange : flk === 1 ? C.goldBrt : C.candle;
        c.fillRect(ax, 22 + 14 - 10, 3, 6);
      }
      // Chandelier glow (flat colored band, no alpha)
      c.fillStyle = '#382010'; c.fillRect(W / 2 - 50, 36, 100, 8);
    } else {
      // Dark night / stone inn / cliffside — for non-menu scenes
      c.fillStyle = '#1C0014'; c.fillRect(0, H * 0.44, W, H * 0.56);
      c.fillStyle = '#280018'; c.fillRect(0, H * 0.62, W, H * 0.38);
      // Stone floor tiles
      c.globalAlpha = 0.14;
      c.fillStyle = C.stoneLt;
      for (let lx = 0; lx < W; lx += 30) c.fillRect(lx, H * 0.66, 1, H * 0.34);
      for (let ly = H * 0.66; ly < H; ly += 24) c.fillRect(0, ly, W, 1);
      c.globalAlpha = 1;
      // Torchlight glow on side walls (flat bands)
      c.fillStyle = '#382010'; c.fillRect(0, H * 0.24, 16, H * 0.32);
      c.fillStyle = '#382010'; c.fillRect(W - 16, H * 0.24, 16, H * 0.32);
      // Left torch
      c.fillStyle = C.stone; c.fillRect(14, H * 0.20, 7, 24);
      c.fillStyle = C.candle; c.fillRect(15, H * 0.16, 5, 8);
      const flk = Math.floor(t * 8) % 2;
      c.fillStyle = flk ? C.orange : C.scarBrt;
      c.fillRect(16, H * 0.12, 3, 8);
      // Right torch
      c.fillStyle = C.stone; c.fillRect(W - 21, H * 0.20, 7, 24);
      c.fillStyle = C.candle; c.fillRect(W - 20, H * 0.16, 5, 8);
      c.fillStyle = flk ? C.scarBrt : C.orange;
      c.fillRect(W - 19, H * 0.12, 3, 8);
    }

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(16,0,8,.84)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ======================== MENU ========================= */
  // Five masquerade masks arranged in a diamond: two top, one center, two bottom
  const MASK_RECTS = [
    { x:   6, y: 110, w: 120, h: 82 },  // ch 0 — top-left
    { x: 144, y: 110, w: 120, h: 82 },  // ch 1 — top-right
    { x:  75, y: 210, w: 120, h: 82 },  // ch 2 — center
    { x:   6, y: 310, w: 120, h: 82 },  // ch 3 — bottom-left
    { x: 144, y: 310, w: 120, h: 82 },  // ch 4 — bottom-right
  ];

  // Diamond connectors between the 5 mask positions
  const CONN_PAIRS = [[0,2],[1,2],[2,3],[2,4]];

  // Mask face colors per chapter
  const MASK_COLS = [C.scarBrt, C.gold, C.blue, C.silver, C.purple];
  const ROMAN = ['I','II','III','IV','V'];

  function drawMenuTitle(api, respect) {
    const g = api.gfx, c = api.ctx, W = api.W;
    // Ornate header panel
    c.fillStyle = C.blood; c.fillRect(0, 0, W, 104);
    c.fillStyle = C.scarlet; c.fillRect(0, 100, W, 4);
    // Gold top border
    c.fillStyle = C.gold; c.fillRect(0, 0, W, 3);
    // Corner ornaments
    for (const [ox] of [[4],[W - 14]]) {
      c.fillStyle = C.gold;
      c.fillRect(ox, 4, 10, 3); c.fillRect(ox, 4, 3, 10);
      c.fillRect(ox, 96, 10, 3); c.fillRect(ox, 88, 3, 10);
    }
    // Tiny pimpernel flowers at left and right of title
    for (const fx of [22, W - 22]) {
      for (let p = 0; p < 5; p++) {
        const a2 = (p / 5) * Math.PI * 2;
        c.fillStyle = C.scarBrt;
        c.fillRect(fx + Math.cos(a2) * 7 - 2, 50 + Math.sin(a2) * 7 - 2, 4, 4);
      }
      c.fillStyle = C.goldBrt; c.fillRect(fx - 2, 48, 4, 4);
    }
    api.txtCFit('THE SCARLET PIMPERNEL', W / 2, 10, 10, C.cream, true);
    api.txtC('THEY SEEK HIM HERE', W / 2, 30, 8, C.scarBrt, false);
    api.txtC('BARONESS ORCZY  1905', W / 2, 48, 7, C.stoneLt, false);
    api.txtC('GLORY  ' + respect, W / 2, 66, 8, C.goldBrt, false);
    api.txtC('CHOOSE YOUR ESCAPADE', W / 2, 84, 7, C.parch, false);
  }

  function drawMenuConnectors(api) {
    const c = api.ctx;
    for (const [ai, bi] of CONN_PAIRS) {
      const pa = MASK_RECTS[ai], pb = MASK_RECTS[bi];
      const ax = pa.x + pa.w / 2, ay = pa.y + pa.h / 2;
      const bx = pb.x + pb.w / 2, by = pb.y + pb.h / 2;
      const dx = bx - ax, dy = by - ay;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len, ny = dy / len;
      c.globalAlpha = 0.45;
      for (let d = 28; d < len - 28; d += 8) {
        c.fillStyle = d % 16 < 8 ? C.gold : C.scarlet;
        c.fillRect(ax + nx * d - 2, ay + ny * d - 2, 4, 4);
      }
      c.globalAlpha = 1;
    }
  }

  function drawMaskCard(api, info) {
    const { ch, i, x, y, w, h, sel, done } = info;
    const g = api.gfx, c = api.ctx;
    const cx = x + w / 2, cy = y + h / 2 - 4;
    const t = api.t;
    const mc = MASK_COLS[i];

    // Card velvet background
    c.fillStyle = sel ? '#3C0018' : C.velvet;
    c.fillRect(x, y, w, h);

    // Ornate gold border
    c.fillStyle = sel ? C.goldBrt : C.gold;
    c.fillRect(x, y, w, 3); c.fillRect(x, y + h - 3, w, 3);
    c.fillRect(x, y, 3, h); c.fillRect(x + w - 3, y, 3, h);
    // Corner flourishes
    c.fillRect(x + 3, y + 3, 6, 2); c.fillRect(x + 3, y + 3, 2, 6);
    c.fillRect(x + w - 9, y + 3, 6, 2); c.fillRect(x + w - 5, y + 3, 2, 6);
    c.fillRect(x + 3, y + h - 5, 6, 2); c.fillRect(x + 3, y + h - 9, 2, 6);
    c.fillRect(x + w - 9, y + h - 5, 6, 2); c.fillRect(x + w - 5, y + h - 9, 2, 6);

    // Masquerade mask face (pixel art, flat fills)
    // Mask body (wide, slightly rounded — approximated with overlapping rects)
    c.fillStyle = mc;
    c.fillRect(cx - 28, cy - 6,  56, 12);  // main body
    c.fillRect(cx - 24, cy - 10, 48,  5);  // top arch
    c.fillRect(cx - 24, cy +  6, 48,  5);  // bottom arch
    c.fillRect(cx - 20, cy - 12, 40,  4);  // crown top
    // Eye holes (dark cutouts)
    c.fillStyle = C.void2;
    c.fillRect(cx - 22, cy - 8, 14, 10);
    c.fillRect(cx +  8, cy - 8, 14, 10);
    // Nose bridge divider
    c.fillStyle = mc;
    c.fillRect(cx - 4, cy - 8, 8, 10);

    // Decorative feathers on outer side per chapter
    c.fillStyle = done ? C.goldBrt : mc;
    if (i === 0) {
      // Left side plume (top-left mask)
      c.fillRect(cx - 36, cy - 24, 4, 30); c.fillRect(cx - 32, cy - 26, 4, 28); c.fillRect(cx - 28, cy - 20, 4, 22);
    } else if (i === 1) {
      // Right side plume (top-right mask)
      c.fillRect(cx + 28, cy - 24, 4, 30); c.fillRect(cx + 24, cy - 26, 4, 28); c.fillRect(cx + 20, cy - 20, 4, 22);
    } else if (i === 2) {
      // Both sides (center — most elaborate)
      c.fillRect(cx - 36, cy - 22, 4, 28); c.fillRect(cx - 32, cy - 24, 4, 26);
      c.fillRect(cx + 28, cy - 22, 4, 28); c.fillRect(cx + 24, cy - 24, 4, 26);
    } else if (i === 3) {
      // Left plume
      c.fillRect(cx - 36, cy - 18, 4, 26); c.fillRect(cx - 32, cy - 20, 4, 24);
    } else {
      // Right plume
      c.fillRect(cx + 28, cy - 18, 4, 26); c.fillRect(cx + 24, cy - 20, 4, 24);
    }

    // Chapter icon at center of mask
    if (ch.icon) ch.icon(api, cx, cy - 2);

    // Roman numeral
    api.txtCFit(ROMAN[i], cx, y + 6, 8, C.goldBrt, true);

    // Chapter name below mask
    api.txtCFit(ch.name || '', cx, y + h - 22, 7, sel ? C.cream : C.parch, true, w - 10);
    if (ch.sub) api.txtCFit(ch.sub, cx, y + h - 10, 6, sel ? C.gold : C.grey, true, w - 10);

    // Done mark — scarlet pimpernel flower
    if (done) {
      g.circle(x + w - 11, y + 11, 8, C.scarBrt);
      g.circle(x + w - 11, y + 11, 5, C.goldBrt);
      api.txtC('✓', x + w - 11, y + 5, 7, C.cream, false);
    }

    // Selection glow pulse — flat blink instead of alpha blend
    if (sel) {
      const pulse = Math.floor(t * 4) % 2;
      if (pulse) {
        c.fillStyle = C.scarBrt;
        c.fillRect(x - 2, y - 2, w + 4, 3);
        c.fillRect(x - 2, y + h - 1, w + 4, 3);
        c.fillRect(x - 2, y - 2, 3, h + 4);
        c.fillRect(x + w - 1, y - 2, 3, h + 4);
      }
    }
  }

  /* ========================== CHAPTERS ========================== */

  /* ---------- CHAPTER 1: THE CODED DISPATCH ----------
   * Letters fall from the top. The code word BLAKENEY must be spelled.
   * Catch only the next target letter; wrong letter = lose a heart. 8 catches win.
   */
  const CODE_WORD = ['B','L','A','K','E','N','E','Y'];
  const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const chCodedDispatch = {
    id: 'dispatch',
    name: 'THE CODED DISPATCH',
    sub: 'Decode the secret route',
    intro: [
      '"Sink me! The route',
      'to Calais is hidden',
      'in plain sight.',
      'Catch each letter of',
      'the code-word in',
      'the correct order!"',
    ],
    quote: '"We seek him here, we seek him there, those Frenchies seek him everywhere!" — Baroness Orczy, 1905',
    help: 'MOVE left/right to catch the GOLD letter shown at the top! Avoid all others. Spell B-L-A-K-E-N-E-Y to win.',
    winText: 'The dispatch is decoded!',
    loseText: 'The message is lost!',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Rolled parchment scroll
      c.fillStyle = C.parch;
      c.fillRect(x - 8, y - 10, 16, 18);
      c.fillStyle = C.tan;
      c.fillRect(x - 9, y - 10, 3, 18);
      c.fillRect(x +  6, y - 10, 3, 18);
      // Red seal
      g.circle(x, y + 2, 5, C.scarBrt);
      // Tiny 'P' glyph on seal
      c.fillStyle = C.cream; c.fillRect(x - 2, y - 2, 4, 7); c.fillStyle = C.scarBrt; c.fillRect(x - 2, y - 2, 4, 3);
    },
    init(api) {
      this.px = api.W / 2;
      this.lives = 3;
      this.targetIdx = 0;
      this.letters = [];
      this.spawnT = 0;
      this.runT = 0;
      this.iframes = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      if (this.iframes > 0) this.iframes -= dt;

      // Move player
      const spd = 148;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.pointer.down)     this.px += (api.pointer.dx || 0) * 1.2;
      this.px = clamp(this.px, 14, W - 14);

      // Spawn letters
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = 1.4 + Math.random() * 0.6;
        // Decide char: 50% chance of target letter, else random decoy
        const target = CODE_WORD[this.targetIdx];
        const spawnTarget = Math.random() < 0.48 ||
          !this.letters.some(l => l.char === target);
        const char = spawnTarget ? target
          : ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
        this.letters.push({
          x: 20 + Math.random() * (W - 40),
          y: -20,
          vy: 78 + Math.random() * 30,
          char,
          correct: char === target,
        });
      }

      // Move letters
      for (const l of this.letters) l.y += l.vy * dt;
      this.letters = this.letters.filter(l => l.y < H + 20);

      // Collision with player (at bottom of screen)
      const playerY = H - 54;
      if (this.iframes <= 0) {
        for (let j = this.letters.length - 1; j >= 0; j--) {
          const l = this.letters[j];
          if (Math.abs(l.x - this.px) < 20 && Math.abs(l.y - playerY) < 20) {
            if (l.correct) {
              this.letters.splice(j, 1);
              this.targetIdx++;
              api.addScore(60);
              api.audio.sfx('coin');
              api.burst(l.x, l.y, C.goldBrt, 10);
              if (this.targetIdx >= CODE_WORD.length) { api.addScore(300); api.win(); return; }
            } else {
              this.letters.splice(j, 1);
              this.lives--;
              this.iframes = 0.9;
              api.shake(4, 0.22); api.flash(C.scarBrt, 0.18); api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Night sky — dark indigo bands
      c.fillStyle = '#0C000C'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#180014'; c.fillRect(0, H * 0.55, W, H * 0.45);

      // Stars (static, keyed off position)
      c.fillStyle = C.cream;
      for (let s = 0; s < 22; s++) {
        c.fillRect((s * 43 + 7) % W, (s * 29 + 5) % (H * 0.50), 2, 2);
      }

      // Code word display strip at top
      c.fillStyle = C.blood; c.fillRect(0, 0, W, 34);
      c.fillStyle = C.scarlet; c.fillRect(0, 32, W, 2);
      const letterW = 24, startX = W / 2 - (CODE_WORD.length * letterW) / 2;
      for (let i = 0; i < CODE_WORD.length; i++) {
        const lx = startX + i * letterW + 4;
        if (i < this.targetIdx) {
          api.txtC(CODE_WORD[i], lx, 10, 10, C.goldBrt, true);
        } else if (i === this.targetIdx) {
          const blink = Math.floor(this.runT * 4) % 2;
          api.txtC(CODE_WORD[i], lx, 10, 10, blink ? C.cream : C.scarBrt, true);
        } else {
          api.txtC('·', lx, 10, 10, C.grey, true);
        }
      }
      // "CATCH:" label
      api.txtC('CATCH:', W / 2 - (CODE_WORD.length * letterW) / 2 - 44, 17, 7, C.parch, false);

      // Falling letters
      for (const l of this.letters) {
        const isTarget = l.char === CODE_WORD[this.targetIdx];
        const col = isTarget ? C.goldBrt : C.scarlet;
        const sz = isTarget ? 14 : 12;
        g.rect(l.x - sz / 2 - 2, l.y - sz / 2 - 2, sz + 4, sz + 4, isTarget ? C.blood : C.void2);
        g.rectO(l.x - sz / 2 - 2, l.y - sz / 2 - 2, sz + 4, sz + 4, col, 1);
        api.txtC(l.char, l.x, l.y - sz / 2 + 2, sz, col, true);
      }

      // Player — Sir Percy (elegant figure in a coat)
      const py = H - 54;
      const step = Math.floor(this.runT * 8) % 2;
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        g.circle(this.px, py - 22, 8, C.cream);        // head
        c.fillStyle = C.coatBlu;
        c.fillRect(this.px - 10, py - 14, 20, 22);    // coat
        c.fillStyle = C.cream;
        c.fillRect(this.px - 6, py - 14, 12, 6);      // cravat
        c.fillStyle = C.gold;
        c.fillRect(this.px - 12, py - 9, 4, 14);      // coat sleeve L
        c.fillRect(this.px +  8, py - 9, 4, 14);      // coat sleeve R
        c.fillStyle = C.navyDk;
        if (step) {
          c.fillRect(this.px - 5, py + 8, 5, 10);
          c.fillRect(this.px + 1, py + 8, 5, 11);
        } else {
          c.fillRect(this.px - 5, py + 8, 5, 11);
          c.fillRect(this.px + 1, py + 8, 5, 10);
        }
        // Tricorn hat
        c.fillStyle = C.navyDk;
        c.fillRect(this.px - 12, py - 30, 24, 8);
        c.fillRect(this.px - 8,  py - 36, 16, 8);
      }

      // Lives and score topbar
      api.topBar('DISPATCH  CODE ' + this.targetIdx + '/8');
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i < this.lives ? C.scarBrt : C.void2;
        c.fillRect(W - 14 - i * 16, 3, 12, 10);
      }
    },
  };

  /* ---------- CHAPTER 2: ROAD TO CALAIS ----------
   * Vertical runner — steer the carriage left/right, dodge patrols for 22 s.
   */
  const chCalaisRoad = {
    id: 'calais',
    name: 'ROAD TO CALAIS',
    sub: 'Race past the patrols',
    intro: [
      '"The carriage must',
      'reach Calais before',
      'dawn, or all is lost.',
      'Dodge the patrol',
      'soldiers and their',
      'lanterns on the road!"',
    ],
    quote: '"Speed, Sir Percy! Every minute\'s delay brings the soldiers closer." — Baroness Orczy, 1905',
    help: 'STEER left/right to dodge patrols and barriers! Survive 22 seconds to reach Calais.',
    winText: 'Calais reached before dawn!',
    loseText: 'The carriage is stopped!',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Carriage silhouette
      c.fillStyle = C.navyDk;
      c.fillRect(x - 10, y - 8, 20, 12);
      c.fillRect(x - 12, y - 4, 24, 6);
      g.circle(x - 8, y + 6, 5, C.stone);
      g.circle(x + 8, y + 6, 5, C.stone);
      c.fillStyle = C.candle;
      c.fillRect(x - 13, y - 2, 3, 8);
      c.fillRect(x + 10, y - 2, 3, 8);
    },
    init(api) {
      this.cx = api.W / 2;
      this.timer = 22;
      this.lives = 3;
      this.obstacles = [];
      this.spawnT = 0;
      this.scroll = 0;
      this.iframes = 0;
      this.runT = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      this.timer -= dt;
      this.scroll += 180 * dt;
      if (this.iframes > 0) this.iframes -= dt;

      if (this.timer <= 0) { api.addScore(400); api.win(); return; }

      // Steer
      const spd = 154;
      if (api.keyDown('left'))  this.cx -= spd * dt;
      if (api.keyDown('right')) this.cx += spd * dt;
      if (api.pointer.down)     this.cx += (api.pointer.dx || 0) * 1.2;
      this.cx = clamp(this.cx, 36, W - 36);

      // Spawn obstacles
      this.spawnT -= dt;
      const baseRate = Math.max(0.7, 1.8 - (22 - this.timer) * 0.032);
      if (this.spawnT <= 0) {
        this.spawnT = baseRate + Math.random() * 0.4;
        const kind = Math.floor(Math.random() * 3); // 0=soldier, 1=barrier, 2=lantern
        const lane = Math.floor(Math.random() * 3);
        const LANE_X = [W * 0.28, W * 0.50, W * 0.72];
        this.obstacles.push({
          x: LANE_X[lane] + (Math.random() - 0.5) * 30,
          y: -30,
          kind,
          vy: 150 + Math.random() * 50,
        });
      }

      for (const o of this.obstacles) o.y += o.vy * dt;
      this.obstacles = this.obstacles.filter(o => o.y < H + 40);

      // Collision
      const carY = H - 70;
      if (this.iframes <= 0) {
        for (const o of this.obstacles) {
          if (Math.abs(o.x - this.cx) < 28 && Math.abs(o.y - carY) < 24) {
            this.lives--;
            this.iframes = 0.9;
            api.shake(5, 0.25); api.flash(C.scarBrt, 0.18); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
        }
      }
      api.addScore(dt * 8);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Night sky
      c.fillStyle = '#080018'; c.fillRect(0, 0, W, H * 0.36);
      // Moon
      g.circle(W - 44, 38, 16, C.cream);
      g.circle(W - 38, 32, 13, '#080018'); // moon crescent shadow

      // Road (dark grey bands scrolling)
      c.fillStyle = '#302828'; c.fillRect(W * 0.18, 0, W * 0.64, H);
      // Road edge markings
      c.fillStyle = '#504040';
      c.fillRect(W * 0.18, 0, 3, H); c.fillRect(W * 0.18 + W * 0.64 - 3, 0, 3, H);
      // Center dashes (scroll)
      c.fillStyle = C.parch;
      for (let dy = (this.scroll % 40) - 40; dy < H + 40; dy += 40) {
        c.fillRect(W / 2 - 2, dy, 4, 22);
      }

      // Fields (dark green sides)
      c.fillStyle = C.dkGreen;
      c.fillRect(0, H * 0.30, W * 0.20, H * 0.70);
      c.fillRect(W * 0.80, H * 0.30, W * 0.20, H * 0.70);
      c.fillStyle = '#003600';
      c.fillRect(0, H * 0.36, W * 0.18, H * 0.64);
      c.fillRect(W * 0.82, H * 0.36, W * 0.18, H * 0.64);

      // Obstacles
      for (const o of this.obstacles) {
        if (o.kind === 0) {
          // Soldier — red coat, musket
          g.circle(o.x, o.y - 16, 7, C.cream);
          c.fillStyle = C.scarBrt; c.fillRect(o.x - 7, o.y - 9, 14, 20);
          c.fillStyle = C.navyDk; c.fillRect(o.x - 5, o.y - 9, 10, 8);
          c.fillStyle = C.stoneLt; c.fillRect(o.x + 6, o.y - 18, 2, 22);
          // Lantern
          c.fillStyle = C.candle; c.fillRect(o.x - 12, o.y, 5, 8);
          c.fillStyle = C.orange; c.fillRect(o.x - 11, o.y - 3, 3, 5);
        } else if (o.kind === 1) {
          // Barrier — horizontal wooden plank
          c.fillStyle = C.brown; c.fillRect(o.x - 28, o.y - 4, 56, 8);
          c.fillStyle = C.tan; c.fillRect(o.x - 26, o.y - 2, 52, 4);
          g.circle(o.x - 24, o.y, 4, C.scarBrt);
          g.circle(o.x + 24, o.y, 4, C.scarBrt);
        } else {
          // Lantern post — bright spotlight
          c.fillStyle = C.stone; c.fillRect(o.x - 2, o.y - 28, 4, 30);
          c.fillStyle = C.candle; c.fillRect(o.x - 6, o.y - 36, 12, 12);
          c.fillStyle = C.orange; c.fillRect(o.x - 4, o.y - 34, 8, 8);
          // Glow patch (flat bright area, no alpha)
          c.fillStyle = '#403010';
          c.fillRect(o.x - 18, o.y - 30, 36, 20);
        }
      }

      // Carriage at bottom
      const carY = H - 70;
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        // Body
        c.fillStyle = C.navyDk;
        c.fillRect(this.cx - 22, carY - 20, 44, 26);
        c.fillStyle = '#101030';
        c.fillRect(this.cx - 18, carY - 16, 36, 18);
        // Door window
        c.fillStyle = C.candle; c.fillRect(this.cx - 8, carY - 14, 16, 10);
        // Wheels
        g.circle(this.cx - 16, carY + 8, 11, C.stone);
        g.circle(this.cx - 16, carY + 8, 7,  C.tan);
        g.circle(this.cx + 16, carY + 8, 11, C.stone);
        g.circle(this.cx + 16, carY + 8, 7,  C.tan);
        // Lanterns
        c.fillStyle = C.candle; c.fillRect(this.cx - 26, carY - 12, 5, 8);
        c.fillStyle = C.orange; c.fillRect(this.cx - 25, carY - 14, 3, 5);
        c.fillStyle = C.candle; c.fillRect(this.cx + 21, carY - 12, 5, 8);
        c.fillStyle = C.orange; c.fillRect(this.cx + 22, carY - 14, 3, 5);
      }

      api.topBar('CALAIS   ⧗ ' + Math.ceil(this.timer) + 's');
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i < this.lives ? C.scarBrt : C.void2;
        c.fillRect(W - 14 - i * 16, 3, 12, 10);
      }
    },
  };

  /* ---------- CHAPTER 3: THE GUILLOTINE ----------
   * Pendulum timing — tap in the gold zone 3 times to launch diversions.
   * 4 misses lose. Zone narrows after each success.
   */
  const chGuillotine = {
    id: 'guillotine',
    name: 'THE GUILLOTINE',
    sub: 'Launch three diversions',
    intro: [
      '"Three aristocrats',
      'await the blade.',
      'Launch a diversion',
      'at exactly the right',
      'moment to save',
      'each one — now!"',
    ],
    quote: '"The Scarlet Pimpernel appeared from nowhere and spirited them away, right under the noses of their guards." — Baroness Orczy, 1905',
    help: 'TAP or press A when the NEEDLE hits the GOLD ZONE. 3 perfect diversions save the aristocrats! 4 misses lose.',
    winText: 'Three lives snatched from the blade!',
    loseText: 'The diversions failed!',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Guillotine silhouette (simplified)
      c.fillStyle = C.stone;
      c.fillRect(x - 10, y - 18, 4, 22); c.fillRect(x + 6, y - 18, 4, 22); // posts
      c.fillRect(x - 10, y - 18, 20, 4);                                     // cross bar
      c.fillStyle = C.scarBrt;
      c.fillRect(x - 7, y - 10, 14, 3); // blade
      // Crowd below (tiny heads)
      for (let h = 0; h < 3; h++) {
        g.circle(x - 8 + h * 8, y + 8, 3, C.parch);
      }
    },
    init(api) {
      this.done = 0;
      this.misses = 0;
      this.maxMiss = 4;
      this.angle = 0;
      this.speed = 0.95;
      this.zoneW = 0.54;
      this.flashT = 0;
      this.missT = 0;
      this.bladeY = 0;    // 0=up, 1=near victim
      this.runT = 0;
    },
    update(api, dt) {
      const maxA = Math.PI * 0.70;
      this.runT += dt;
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
          this.flashT = 0.55;
          api.audio.sfx('coin');
          api.burst(api.W / 2, api.H * 0.68, C.goldBrt, 12);
          api.addScore(80);
          if (this.done >= 3) { api.addScore(300); api.win(); return; }
          this.speed *= 1.12;
          this.zoneW = Math.max(0.12, this.zoneW - 0.10);
        } else {
          this.misses++;
          this.missT = 0.35;
          api.shake(3, 0.15); api.audio.sfx('hurt');
          if (this.misses >= this.maxMiss) { api.lose(); return; }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Grim plaza background
      c.fillStyle = '#060010'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#120028'; c.fillRect(0, H * 0.48, W, H * 0.52);
      // Cobblestone ground
      c.globalAlpha = 0.18;
      c.fillStyle = C.stoneLt;
      for (let lx = 0; lx < W; lx += 26) c.fillRect(lx, H * 0.56, 1, H * 0.44);
      for (let ly = H * 0.56; ly < H; ly += 18) c.fillRect(0, ly, W, 1);
      c.globalAlpha = 1;

      // Crowd (flat colored silhouettes)
      c.fillStyle = '#1C0018';
      for (let ci = 0; ci < 14; ci++) {
        const cx2 = 12 + ci * 18;
        c.fillRect(cx2 - 5, H * 0.62, 10, H * 0.38);
        g.circle(cx2, H * 0.62, 7, '#1C0018');
      }

      // Guillotine structure
      const gx = W / 2, gy = H * 0.18;
      const postH = H * 0.38;
      c.fillStyle = C.stone;
      c.fillRect(gx - 28, gy, 10, postH);   // left post
      c.fillRect(gx + 18, gy, 10, postH);   // right post
      c.fillRect(gx - 28, gy, 56, 10);      // cross-bar
      // Blade (red diagonal + edge)
      const bladeY2 = gy + 16 + this.bladeY * (postH - 60);
      c.fillStyle = C.silver;
      c.fillRect(gx - 20, bladeY2, 40, 7);
      c.fillStyle = C.scarBrt;
      c.fillRect(gx - 24, bladeY2 - 2, 12, 4);  // blade shine angle
      c.fillStyle = C.cream; c.fillRect(gx - 24, bladeY2 + 1, 48, 2); // blade edge

      // Victim at base (aristocrat silhouette)
      const vicY = gy + postH - 16;
      c.fillStyle = C.parch;
      c.fillRect(gx - 12, vicY, 24, 12);   // figure
      g.circle(gx, vicY - 7, 7, C.cream);  // head

      // Pendulum arm
      const pCx = W / 2, pCy = H * 0.56;
      const pLen = 100;
      const px2 = pCx + Math.sin(this.angle) * pLen;
      const py2 = pCy + Math.cos(this.angle) * pLen;
      c.fillStyle = C.stoneLt;
      c.beginPath(); c.moveTo(pCx, pCy - 5); c.lineTo(px2, py2); c.lineWidth = 3; c.strokeStyle = C.stoneLt; c.stroke();
      c.fillStyle = C.stoneLt; c.beginPath(); c.arc(pCx, pCy - 5, 6, 0, Math.PI * 2); c.fill();

      // Gold zone arc on pendulum arc
      const arcR = pLen, arcs = -this.zoneW / 2, arce = this.zoneW / 2;
      c.strokeStyle = C.goldBrt; c.lineWidth = 6;
      c.beginPath();
      c.arc(pCx, pCy - 5, arcR, Math.PI / 2 - arce, Math.PI / 2 - arcs);
      c.stroke();
      c.lineWidth = 1;

      // Pendulum bob (needle end)
      const bobCol = this.flashT > 0 ? C.goldBrt
        : this.missT > 0 ? C.scarBrt : C.cream;
      g.circle(px2, py2, 9, bobCol);
      g.circle(px2, py2, 5, C.void2);

      // Progress hearts (diversions launched)
      for (let d = 0; d < 3; d++) {
        c.fillStyle = d < this.done ? C.goldBrt : C.stone;
        c.fillRect(W / 2 - 24 + d * 18, 4, 14, 10);
      }
      // Miss counter
      api.topBar('DIVERSION   ' + this.done + '/3   MISS ' + this.misses + '/4');
    },
  };

  /* ---------- CHAPTER 4: SHADOWS OF THE INN ----------
   * Stealth: navigate from top to bottom past 3 guard patrol rows.
   * Guards sweep left/right; their torch cone (wide rectangle) = detection.
   */
  const chShadows = {
    id: 'shadows',
    name: 'SHADOWS OF THE INN',
    sub: 'Slip past the agents',
    intro: [
      '"Chauvelin\'s agents',
      'are everywhere.',
      'Slip past their',
      'lantern cones in',
      'the dark and reach',
      'the exit below!"',
    ],
    quote: '"The Pimpernel\'s disguise was perfect — they never saw him pass." — Baroness Orczy, 1905',
    help: 'MOVE to avoid the guard\'s lantern cones! Reach the exit at the bottom. Avoid light — 3 lives.',
    winText: 'You slipped past them unseen!',
    loseText: 'Caught by the agents!',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Cloaked figure / shadow silhouette
      c.fillStyle = C.navyDk;
      g.circle(x, y - 10, 6, C.navyDk);
      c.fillRect(x - 8, y - 4, 16, 18);
      c.fillRect(x - 10, y - 2, 4, 12);
      c.fillRect(x + 6, y - 2, 4, 12);
    },
    init(api) {
      this.px = api.W / 2;
      this.py = 48;
      this.lives = 3;
      this.caught = false;
      this.catchT = 0;
      // 3 guards in horizontal strips, y-positions
      const H = api.H;
      this.guards = [
        { cx: api.W * 0.4, gx: api.W * 0.4, gy: H * 0.30, dir: 1, spd: 52, stripY: H * 0.23, stripH: H * 0.16 },
        { cx: api.W * 0.6, gx: api.W * 0.6, gy: H * 0.52, dir: -1, spd: 62, stripY: H * 0.44, stripH: H * 0.16 },
        { cx: api.W * 0.3, gx: api.W * 0.3, gy: H * 0.74, dir: 1, spd: 70, stripY: H * 0.66, stripH: H * 0.16 },
      ];
      this.exitY = H - 38;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      if (this.catchT > 0) { this.catchT -= dt; return; }

      // Player movement
      const spd = 90;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.keyDown('up'))    this.py -= spd * dt;
      if (api.keyDown('down'))  this.py += spd * dt;
      if (api.pointer.down) {
        this.px += (api.pointer.dx || 0) * 1.1;
        this.py += (api.pointer.dy || 0) * 1.1;
      }
      this.px = clamp(this.px, 14, W - 14);
      this.py = clamp(this.py, 40, H - 30);

      // Move guards (oscillate within screen)
      for (const gd of this.guards) {
        gd.gx += gd.dir * gd.spd * dt;
        if (gd.gx > W - 26) { gd.gx = W - 26; gd.dir = -1; }
        if (gd.gx <      26) { gd.gx = 26;     gd.dir =  1; }
      }

      // Check win
      if (this.py > this.exitY) { api.addScore(400); api.win(); return; }

      // Detection — guard cone = 80px forward in dir, 28px half-width
      for (const gd of this.guards) {
        const coneX1 = gd.dir > 0 ? gd.gx : gd.gx - 80;
        const coneX2 = gd.dir > 0 ? gd.gx + 80 : gd.gx;
        const coneY1 = gd.gy - 20, coneY2 = gd.gy + 20;
        if (this.px > coneX1 && this.px < coneX2 &&
            this.py > coneY1 && this.py < coneY2) {
          this.lives--;
          this.catchT = 0.8;
          api.shake(5, 0.28); api.flash(C.candle, 0.22); api.audio.sfx('hurt');
          // Reset player to top
          this.px = api.W / 2;
          this.py = 48;
          if (this.lives <= 0) { api.lose(); return; }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Dark inn interior — stone walls
      c.fillStyle = '#080010'; c.fillRect(0, 0, W, H);
      // Wall texture bands
      for (let wy = 0; wy < H; wy += 30) {
        c.fillStyle = wy % 60 < 30 ? '#10001A' : '#0C0014';
        c.fillRect(0, wy, W, 30);
      }
      // Outer walls
      c.fillStyle = '#1C0018'; c.fillRect(0, 0, 12, H); c.fillRect(W - 12, 0, 12, H);
      // Floor indicator strips for guard zones
      for (const gd of this.guards) {
        c.fillStyle = '#200020';
        c.fillRect(12, gd.stripY, W - 24, gd.stripH);
        c.fillStyle = '#340030';
        c.fillRect(12, gd.stripY, W - 24, 2);
        c.fillRect(12, gd.stripY + gd.stripH - 2, W - 24, 2);
      }

      // Exit door at bottom
      c.fillStyle = C.dkGreen; c.fillRect(W / 2 - 18, H - 50, 36, 40);
      c.fillStyle = '#006000'; c.fillRect(W / 2 - 14, H - 46, 28, 32);
      // Exit marker
      api.txtC('EXIT', W / 2, H - 28, 7, C.goldBrt, true);

      // Guard light cones + guard figures
      for (const gd of this.guards) {
        const coneX1 = gd.dir > 0 ? gd.gx : gd.gx - 80;
        const coneW2 = 80;
        // Lantern cone (flat highlight strip, no alpha blend for NES)
        c.fillStyle = '#302820';
        c.fillRect(coneX1, gd.gy - 18, coneW2, 36);
        // Bright inner cone
        c.fillStyle = '#402C10';
        const innerX = gd.dir > 0 ? gd.gx + 2 : gd.gx - 50;
        c.fillRect(innerX, gd.gy - 12, 48, 24);

        // Guard figure
        g.circle(gd.gx, gd.gy - 18, 7, C.cream);
        c.fillStyle = C.scarBrt;
        c.fillRect(gd.gx - 8, gd.gy - 11, 16, 20); // red coat
        c.fillStyle = C.navyDk;
        c.fillRect(gd.gx - 7, gd.gy - 11, 14, 8);  // lapels
        // Musket
        c.fillStyle = C.stoneLt;
        if (gd.dir > 0) c.fillRect(gd.gx + 7, gd.gy - 22, 2, 26);
        else            c.fillRect(gd.gx - 9, gd.gy - 22, 2, 26);
        // Lantern hand
        c.fillStyle = C.candle;
        if (gd.dir > 0) c.fillRect(gd.gx + 9, gd.gy - 2, 6, 9);
        else            c.fillRect(gd.gx - 15, gd.gy - 2, 6, 9);
        const flk = Math.floor(api.t * 7) % 2;
        c.fillStyle = flk ? C.orange : C.goldBrt;
        if (gd.dir > 0) c.fillRect(gd.gx + 10, gd.gy - 5, 4, 5);
        else            c.fillRect(gd.gx - 14, gd.gy - 5, 4, 5);
      }

      // Player — cloaked figure
      const hide = this.catchT > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        // Long cloak
        c.fillStyle = C.coatBlu;
        c.fillRect(this.px - 8, this.py - 14, 16, 24);
        c.fillRect(this.px - 10, this.py - 6, 20, 14);
        g.circle(this.px, this.py - 20, 7, C.cream);
        // Hood
        c.fillStyle = C.navyDk;
        c.fillRect(this.px - 10, this.py - 22, 20, 10);
      }

      // Lives
      api.topBar('SHADOWS   LIVES');
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i < this.lives ? C.scarBrt : C.void2;
        c.fillRect(W - 14 - i * 16, 3, 12, 10);
      }
    },
  };

  /* ---------- CHAPTER 5: DOVER CLIFFS ----------
   * Dodge Chauvelin's thrown lanterns. When he reloads (glows gold), tap to strike.
   * 4 counter-strikes defeat Chauvelin. 3 lives.
   */
  const chDover = {
    id: 'dover',
    name: 'DOVER CLIFFS',
    sub: 'Defeat Chauvelin',
    intro: [
      '"At last we face each',
      'other on the Dover',
      'cliffs, Monsieur Percy.',
      'Dodge my men\'s',
      'lanterns — and strike',
      'when I stand exposed!"',
    ],
    quote: '"There\'ll always be an England — and no Frenchman\'s dungeon shall hold you." — Baroness Orczy, 1905',
    help: 'DODGE the thrown lanterns! When Chauvelin GLOWS GOLD and pauses — TAP or press A to counter-strike! 4 strikes win.',
    winText: 'Chauvelin is vanquished — England is safe!',
    loseText: 'Captured by Chauvelin!',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Crossed swords
      c.fillStyle = C.silver;
      c.fillRect(x - 12, y - 2, 24, 3);
      c.fillRect(x - 2, y - 12, 3, 24);
      c.fillStyle = C.gold; c.fillRect(x - 6, y - 1, 12, 5); // crossguard h
      c.fillStyle = C.gold; c.fillRect(x - 1, y - 6, 5, 12); // crossguard v
      g.circle(x, y, 4, C.goldBrt);
    },
    init(api) {
      this.px = api.W * 0.72;
      this.py = api.H * 0.60;
      this.lives = 3;
      this.strikes = 0;
      this.phase = 'dodge'; // 'dodge' | 'reload'
      this.phaseT = 5.5;
      this.lanterns = [];
      this.throwT = 0;
      this.reloadT = 0;
      this.iframes = 0;
      this.runT = 0;
      this.strikeFlash = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      if (this.iframes > 0) this.iframes -= dt;
      if (this.strikeFlash > 0) this.strikeFlash -= dt;

      // Player movement (right 60% of screen)
      const spd = 130;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.keyDown('up'))    this.py -= spd * dt;
      if (api.keyDown('down'))  this.py += spd * dt;
      if (api.pointer.down) {
        this.px += (api.pointer.dx || 0) * 1.1;
        this.py += (api.pointer.dy || 0) * 1.1;
      }
      this.px = clamp(this.px, W * 0.32, W - 16);
      this.py = clamp(this.py, 30, H - 30);

      if (this.phase === 'dodge') {
        this.phaseT -= dt;
        // Throw lanterns
        this.throwT -= dt;
        const rate = Math.max(1.0, 2.8 - this.strikes * 0.35);
        if (this.throwT <= 0) {
          this.throwT = rate + Math.random() * 0.5;
          const targetY = this.py + (Math.random() - 0.5) * 80;
          const startX = W * 0.22, startY = H * 0.55;
          const dx2 = W * 0.75 - startX, dy2 = targetY - startY;
          const len = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          this.lanterns.push({
            x: startX, y: startY,
            vx: (dx2 / len) * 180,
            vy: (dy2 / len) * 180,
          });
        }

        // Move lanterns
        for (const l of this.lanterns) { l.x += l.vx * dt; l.y += l.vy * dt; }
        this.lanterns = this.lanterns.filter(l => l.x < W + 20 && l.x > -20 && l.y > -20 && l.y < H + 20);

        // Collision
        if (this.iframes <= 0) {
          for (const l of this.lanterns) {
            if (Math.abs(l.x - this.px) < 18 && Math.abs(l.y - this.py) < 18) {
              this.lives--;
              this.iframes = 0.85;
              api.shake(5, 0.25); api.flash(C.orange, 0.18); api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
              break;
            }
          }
        }

        // Transition to reload phase
        if (this.phaseT <= 0) {
          this.phase = 'reload';
          this.reloadT = 2.8;
          this.lanterns = [];
          this.phaseT = 5.5 - this.strikes * 0.3;
          api.audio.sfx('blip');
        }
      } else {
        // Reload / strike window
        this.reloadT -= dt;
        if (api.pointer.justDown || api.keyPressed('a')) {
          this.strikes++;
          this.strikeFlash = 0.5;
          api.audio.sfx('shoot');
          api.burst(W * 0.18, H * 0.54, C.goldBrt, 12);
          api.addScore(100);
          if (this.strikes >= 4) { api.addScore(400); api.win(); return; }
        }
        if (this.reloadT <= 0) {
          this.phase = 'dodge';
          this.throwT = 1.2;
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Night cliffside — dark sky, white chalk cliffs
      c.fillStyle = '#040018'; c.fillRect(0, 0, W, H);
      // Stars
      c.fillStyle = C.cream;
      for (let s = 0; s < 18; s++) c.fillRect((s * 53 + 11) % W, (s * 37 + 3) % (H * 0.42), 2, 2);

      // Moon
      g.circle(W - 36, 36, 18, C.cream);
      g.circle(W - 30, 30, 14, '#040018');

      // Sea (dark stripes far below)
      c.fillStyle = '#040028'; c.fillRect(0, H * 0.78, W, H * 0.22);
      c.fillStyle = '#08003C'; c.fillRect(0, H * 0.82, W, H * 0.18);
      for (let wx = 0; wx < W; wx += 28) {
        c.fillStyle = C.cream; c.fillRect(wx, H * 0.82, 14, 2);
      }

      // White chalk cliff edge (right side where player stands)
      c.fillStyle = C.cream; c.fillRect(W * 0.35, H * 0.75, W * 0.65, H * 0.25);
      c.fillStyle = C.stoneLt; c.fillRect(W * 0.35, H * 0.75, W * 0.65, 6);
      // Left cliff where Chauvelin stands
      c.fillStyle = C.stone; c.fillRect(0, H * 0.68, W * 0.30, H * 0.32);
      c.fillStyle = C.stoneLt; c.fillRect(0, H * 0.68, W * 0.30, 5);
      // Chasm between cliffs
      c.fillStyle = '#040018'; c.fillRect(W * 0.30, H * 0.68, W * 0.05, H * 0.32);

      // Chauvelin figure (left side)
      const chY = H * 0.60;
      const chX = W * 0.18;
      const isReload = this.phase === 'reload';
      c.fillStyle = isReload && this.strikeFlash > 0 ? C.goldBrt
        : isReload ? C.gold : C.black;
      // Figure
      g.circle(chX, chY - 22, 9, isReload ? (this.strikeFlash > 0 ? C.goldBrt : C.gold) : C.cream);
      c.fillStyle = C.black; c.fillRect(chX - 10, chY - 13, 20, 24);
      c.fillStyle = isReload ? C.gold : C.grey;
      c.fillRect(chX - 8, chY - 13, 16, 8);
      // Arm throwing (in dodge phase)
      if (this.phase === 'dodge') {
        c.fillStyle = C.black;
        c.fillRect(chX + 8, chY - 12, 4, 16);
        c.fillRect(chX + 12, chY - 14, 8, 4);
      } else {
        // Arms raised in reload
        c.fillStyle = C.gold;
        c.fillRect(chX - 14, chY - 18, 4, 16);
        c.fillRect(chX + 10, chY - 18, 4, 16);
      }
      // Reload glow halo (flat band)
      if (isReload) {
        c.fillStyle = '#403000';
        c.fillRect(chX - 22, chY - 38, 44, 6);
        c.fillStyle = C.goldBrt;
        api.txtC('STRIKE!', chX, chY - 48, 9, C.goldBrt, true);
      }

      // Lanterns in flight
      for (const l of this.lanterns) {
        c.fillStyle = C.candle; c.fillRect(l.x - 7, l.y - 7, 14, 14);
        c.fillStyle = C.orange; c.fillRect(l.x - 5, l.y - 5, 10, 10);
        g.circle(l.x, l.y, 4, C.goldBrt);
      }

      // Player — Percy (elegant fencer)
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        g.circle(this.px, this.py - 22, 8, C.cream);
        c.fillStyle = C.coatBlu;
        c.fillRect(this.px - 10, this.py - 14, 20, 22);
        c.fillStyle = C.cream; c.fillRect(this.px - 6, this.py - 14, 12, 6);
        c.fillStyle = C.gold;
        c.fillRect(this.px - 12, this.py - 9, 4, 14);
        // Sword arm extended
        c.fillStyle = C.silver;
        c.fillRect(this.px + 8, this.py - 12, 24, 3);
        g.circle(this.px + 30, this.py - 10, 5, C.goldBrt);
        // Tricorn
        c.fillStyle = C.navyDk;
        c.fillRect(this.px - 12, this.py - 30, 24, 8);
        c.fillRect(this.px - 8,  this.py - 36, 16, 8);
      }

      // Strike health bar (Chauvelin's remaining lives)
      api.topBar('DOVER DUEL   STRIKES ' + this.strikes + '/4');
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i < this.lives ? C.scarBrt : C.void2;
        c.fillRect(W - 14 - i * 16, 3, 12, 10);
      }
    },
  };

  /* ======================== RETTROSAGA INIT ======================== */
  RetroSaga.create({
    id: 'scarletpimpernel',
    title: 'The Scarlet Pimpernel',
    subtitle: 'FIVE DARING ESCAPADES',
    credit: 'Baroness Orczy · 1905',
    currency: 'GLORY',
    bootCta: 'TAP TO BEGIN THE CHASE',
    menuLabel: 'CHOOSE YOUR ESCAPADE',
    menuHint: 'TAP A MASK TO BEGIN',
    menuDone: 'ALL ESCAPADES COMPLETE',
    finale: 'Sir Percy bows. The Scarlet Pimpernel will strike again.',

    screens: {
      win:          '#F8B800',
      lose:         '#A80000',
      chapterLabel: '#C8A060',
      name:         '#F8E8C8',
      sub:          '#D82800',
      intro:        '#E8D8B0',
      quote:        '#A08040',
      help:         '#C8A828',
      score:        '#E8D8C0',
      cur:          '#C8A020',
      cta:          '#F8B800',
      overlay:      'rgba(16,0,8,.85)',
    },
    labels: {
      chapter: 'ESCAPADE',
      score:   'LIVES SAVED',
      win:     'Sink me — a triumph!',
      lose:    'Zounds! They\'ve caught you!',
      cont:    'TAP TO PRESS ON',
      finale:  'TAP FOR THE FINAL BOW',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO BEGIN',
    },

    emblem,
    scenery,

    menu: {
      colors: {
        title:    '#F8B800',
        label:    '#C8A060',
        cur:      '#C8A020',
        hint:     '#A08040',
        panel:    '#1C0010',
        panelSel: '#3C0018',
        border:   '#C8A020',
        name:     '#F8E8C8',
        nameDone: '#F8B800',
        sub:      '#A08050',
      },
      layout(api, chapters) { return MASK_RECTS; },
      title(api, respect) { drawMenuTitle(api, respect); },
      card(api, info) {
        drawMenuConnectors(api);
        drawMaskCard(api, info);
      },
    },

    chapters: [
      chCodedDispatch,
      chCalaisRoad,
      chGuillotine,
      chShadows,
      chDover,
    ],
  });

}());
