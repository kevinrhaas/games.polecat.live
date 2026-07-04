/* ============================================================================
 * BAH, HUMBUG! — A CHRISTMAS CAROL
 * Five chapters of Ebenezer Scrooge's ghostly transformation:
 *   1. THE COUNTINGHOUSE   — catch gold shillings, dodge grey farthings
 *   2. MARLEY'S WARNING    — dodge horizontal cash-box chains, up/down
 *   3. CHRISTMAS PAST      — tap candle memories in the shrinking gold ring
 *   4. CHRISTMAS PRESENT   — tap glowing gift boxes before they fade (grid)
 *   5. YET TO COME         — free movement dodge + collect tombstone echoes
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * NES-honest: flat fills + dithered shading, no smooth gradients or alpha glows.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;
  const rand  = Retro.util.rand;
  const rint  = Retro.util.randInt;

  /* ---- NES-honest palette ---- */
  const P = {
    ink:      '#000000',
    dark:     '#281408',
    coal:     '#181000',
    parch:    '#F0C878',
    parchOld: '#D4A848',
    gold:     '#F8B800',
    goldDk:   '#AC7C00',
    amber:    '#D8A020',
    leather:  '#503018',
    leatherDk:'#281408',
    red:      '#D82800',
    redBrt:   '#F83800',
    ghost:    '#6888FC',
    ghostDk:  '#0000BC',
    blueM:    '#0078F8',
    white:    '#F8F8F8',
    grey:     '#7C7C7C',
    greyDk:   '#3C3C3C',
    green:    '#00A800',
    greenDk:  '#007800',
    candle:   '#FCE890',
    chain:    '#747474',
    chainDk:  '#3C3C3C',
    skyNight: '#000088',
    snow:     '#BCECF8',
  };

  /* ========================= EMBLEM: open ledger book ========================= */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // Back page (left)
    g.rect(cx - 34, cy - 22, 32, 44, P.leatherDk);
    g.rect(cx - 32, cy - 20, 28, 40, P.leather);
    // Right page (parchment)
    g.rect(cx + 2,  cy - 22, 32, 44, P.parch);
    // Spine
    g.rect(cx - 2,  cy - 22, 4,  44, P.leatherDk);
    // Outer border
    g.rectO(cx - 34, cy - 22, 66, 44, P.goldDk, 1);
    // Ruled lines on right page
    for (let r = 0; r < 4; r++) g.rect(cx + 5, cy - 10 + r * 9, 22, 1, P.goldDk);
    // Quill pen
    g.rect(cx + 21, cy - 30, 2, 22, P.parchOld);
    g.rect(cx + 20, cy - 32, 4,  4, P.parchOld);
    g.rect(cx + 22, cy - 26, 1, 18, P.dark);
    // Three coins
    g.circle(cx - 26, cy + 18, 5, P.gold);
    g.circle(cx - 26, cy + 18, 3, P.goldDk);
    g.circle(cx - 18, cy + 20, 5, P.gold);
    g.circle(cx - 18, cy + 20, 3, P.goldDk);
    g.circle(cx - 10, cy + 18, 5, P.gold);
    g.circle(cx - 10, cy + 18, 3, P.goldDk);
    // Candle
    g.rect(cx - 14, cy - 18, 6, 26, P.parch);
    g.rect(cx - 13, cy - 24, 4,  8, P.candle);
    g.rect(cx - 12, cy - 28, 2,  6, P.gold);
  }

  /* ========================= SCENERY ========================= */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu' || scene === 'boot') {
      // Scrooge's cold counting house interior — dark plaster walls
      c.fillStyle = P.dark; c.fillRect(0, 0, W, H);
      // Stone floor — flat tiles with separator lines
      c.fillStyle = P.coal; c.fillRect(0, H - 56, W, 56);
      for (let tx = 0; tx < W; tx += 24) g.rect(tx, H - 56, 1, 56, P.leatherDk);
      for (let ty = H - 56; ty < H; ty += 18)  g.rect(0, ty, W, 1, P.leatherDk);
      // Fireplace (far left) — barely lit, Scrooge hates spending on coal
      g.rect(8,  H - 98, 52, 42, P.leatherDk);
      g.rect(12, H - 94, 44, 36, P.coal);
      g.rect(4,  H - 100, 60, 6, P.leather);  // mantle
      // ember glow — dithered pixel art (no alpha)
      if ((Math.floor(t * 2)) % 2 === 0) {
        g.rect(18, H - 64, 4, 3, P.red);
        g.rect(24, H - 67, 3, 4, P.redBrt);
        g.rect(32, H - 65, 4, 3, P.red);
        g.rect(38, H - 63, 3, 2, P.redBrt);
      } else {
        g.rect(16, H - 65, 3, 3, P.redBrt);
        g.rect(22, H - 68, 4, 3, P.red);
        g.rect(30, H - 64, 3, 3, P.redBrt);
        g.rect(36, H - 66, 4, 2, P.red);
      }
      // Bookshelves (right wall)
      g.rect(W - 64, 28, 56, 3, P.leather);
      g.rect(W - 64, 92, 56, 3, P.leather);
      g.rect(W - 64, 156, 56, 3, P.leather);
      const bkCol = [P.red, P.leatherDk, P.leather, P.greenDk, P.goldDk, P.dark, P.red, P.leather];
      for (let bi = 0; bi < 4; bi++) {
        g.rect(W - 60 + bi * 13, 31,  11, 59, bkCol[bi]);
        g.rect(W - 61 + bi * 13, 35,  9,  2,  P.parchOld);
        g.rect(W - 60 + bi * 13, 95,  11, 59, bkCol[bi + 4 < bkCol.length ? bi + 4 : bi]);
        g.rect(W - 61 + bi * 13, 99,  9,  2,  P.parchOld);
      }
      // Counting desk (centre lower)
      g.rect(W/2 - 48, H - 78, 96, 22, P.leather);
      g.rect(W/2 - 48, H - 80, 96, 4,  P.parchOld);
      // Ledger on desk
      g.rect(W/2 - 30, H - 80, 60, 34, P.parchOld);
      g.rect(W/2 - 30, H - 80, 6,  34, P.leatherDk);
      for (let lr = 0; lr < 5; lr++) g.rect(W/2 - 22, H - 72 + lr * 6, 44, 1, P.goldDk);
      // Candle on desk — flicker pixel art
      const fl = (Math.floor(t * 7)) % 2;
      g.rect(W/2 + 30, H - 98, 5, 28, P.parch);
      g.rect(W/2 + 30, H - 102, 5, 6, P.candle);
      g.rect(W/2 + fl ? 31 : 30, H - 108, fl ? 3 : 4, 8, P.gold);
      // Cold window (left wall, frosted)
      g.rect(14, 38, 46, 58, P.skyNight);
      g.rectO(14, 38, 46, 58, P.leather, 2);
      g.rect(14, 65, 46, 2, P.leather);
      g.rect(37, 38, 2,  58, P.leather);
      // Snowflake dots on window
      for (let si = 0; si < 8; si++) {
        const sx = 16 + ((si * 29 + Math.floor(t * 3)) % 40);
        const sy = 40 + ((si * 23 + Math.floor(t * 5)) % 52);
        g.rect(sx, sy, 2, 2, P.snow);
      }
      return;
    }

    // Other scenes — Victorian winter street at night
    c.fillStyle = P.skyNight; c.fillRect(0, 0, W, H);
    // Stars — fixed positions, no alpha
    for (let si = 0; si < 22; si++) {
      if (((Math.floor(t * 1.4) + si) % 3) > 0) {
        g.rect((si * 71 + 13) % W, (si * 53 + 7) % Math.floor(H * 0.45), 1, 1, P.white);
      }
    }
    // Falling snow
    for (let si = 0; si < 14; si++) {
      const sx = Math.round(((si * 57 + t * 16 + si * 13) % (W + 8)) - 4);
      const sy = Math.round(((si * 79 + t * 24 + si * 27) % (H * 0.82)));
      g.rect(sx, sy, 2, 2, P.snow);
    }
    // Victorian rooftop silhouettes
    const roofs = [[0,36,58],[38,26,40],[76,42,52],[126,30,46],[170,38,58],[206,26,36],[230,44,50]];
    for (const [rx, rh, rw] of roofs) {
      g.rect(rx, H - rh - 26, rw, rh + 26, P.coal);
      g.rect(rx + rw - 10, H - rh - 46, 7, 22, P.dark); // chimney
      g.rect(rx + rw - 12, H - rh - 48, 11, 4, P.dark);
      if (rh > 32) {
        g.rect(rx + 8, H - rh + 4, 14, 12, P.candle);
        g.rect(rx + 14, H - rh + 4, 2, 12, P.coal);
        g.rect(rx + 8, H - rh + 10, 14, 2, P.coal);
      }
    }
    // Snow on ground
    g.rect(0, H - 28, W, 28, P.snow);
    g.rect(0, H - 32, W, 6, '#D0E8F8');
  }

  /* ========================= CHAPTER ICONS ========================= */
  function iconCounting(api, x, y) {
    const g = api.gfx;
    g.rect(x - 10, y - 10, 20, 18, P.parchOld);
    g.rect(x - 10, y - 10, 3,  18, P.leatherDk);
    for (let r = 0; r < 3; r++) g.rect(x - 5, y - 3 + r * 5, 12, 1, P.goldDk);
    g.circle(x + 5, y + 11, 5, P.gold);
    g.circle(x + 5, y + 11, 3, P.goldDk);
  }
  function iconChains(api, x, y) {
    const g = api.gfx;
    for (let i = 0; i < 5; i++) g.rectO(x - 15 + i * 7, y - 5, 5, 10, P.chain, 1);
    g.rect(x - 17, y - 1, 36, 2, P.chain);
  }
  function iconCandle(api, x, y) {
    const g = api.gfx;
    g.rect(x - 3, y - 14, 6, 20, P.parch);
    g.rect(x - 3, y - 20, 6, 8,  P.candle);
    g.rect(x - 1, y - 24, 2, 6,  P.gold);
  }
  function iconGift(api, x, y) {
    const g = api.gfx;
    g.rect(x - 10, y - 8,  20, 16, P.red);
    g.rect(x - 2,  y - 8,  4,  16, P.gold);
    g.rect(x - 10, y - 2,  20, 4,  P.gold);
    g.rect(x - 2,  y - 14, 4,  8,  P.redBrt);
    g.rect(x - 6,  y - 16, 12, 6,  P.redBrt);
  }
  function iconGrave(api, x, y) {
    const g = api.gfx;
    g.rect(x - 8, y - 18, 16, 26, P.greyDk);
    g.circle(x, y - 16, 6, P.greyDk);
    g.rect(x - 10, y + 8, 20, 4, P.dark);
    for (let r = 0; r < 2; r++) g.rect(x - 5, y - 10 + r * 6, 10, 1, P.grey);
  }

  /* ========================= MENU: OPEN LEDGER BOOK ========================= */
  const MENU = {
    colors: {
      title: P.goldDk, label: P.leather, cur: P.red,
      panel: P.parchOld, panelSel: P.parch, border: P.goldDk,
      name: P.dark, nameDone: P.greenDk, sub: P.leather,
      done: P.greenDk, hint: P.leather,
    },
    layout() {
      // Five horizontal ledger rows
      return [
        { x: 26, y: 102, w: 218, h: 54 },
        { x: 26, y: 160, w: 218, h: 54 },
        { x: 26, y: 218, w: 218, h: 54 },
        { x: 26, y: 276, w: 218, h: 54 },
        { x: 26, y: 334, w: 218, h: 54 },
      ];
    },
    title(api, respect) {
      const g = api.gfx, W = api.W;
      // Ledger page background
      g.rect(14, 70, W - 28, 332, P.parchOld);
      g.rectO(14, 70, W - 28, 332, P.goldDk, 2);
      // Binding holes on left margin
      for (let h2 = 0; h2 < 4; h2++) g.circle(22, 118 + h2 * 88, 4, P.leather);
      // Red ruling line (left margin)
      g.rect(36, 70, 2, 332, P.red);
      // Header band
      g.rect(14, 70, W - 28, 28, P.amber);
      g.rectO(14, 70, W - 28, 28, P.goldDk, 1);
      // Header text
      api.txtCFit('LEDGER — A CHRISTMAS CAROL', W/2 + 8, 80, 7, P.dark, true, 190);
      api.txt('£' + respect, W - 66, 80, 7, P.dark);
      // Horizontal rules between rows
      for (let r = 0; r < 6; r++) {
        g.rect(14, 98 + r * 58, W - 28, 1, P.goldDk);
      }
      // Column rules
      g.rect(40,  98, 2, 290, P.parch);
      g.rect(76,  98, 1, 290, '#E8B820');
    },
    card(api, info) {
      const g = api.gfx;
      const { ch, i, x, y, w, h, sel, done } = info;
      const cx = x + w / 2;
      // Row fill
      g.rect(x, y, w, h, sel ? P.candle : P.parchOld);
      if (sel) g.rectO(x, y, w, h, P.gold, 1);
      // Row rule lines inside
      g.rect(x + 52, y + 18, w - 56, 1, '#E8C840');
      g.rect(x + 52, y + 36, w - 56, 1, '#E8C840');
      // Roman numeral in left column
      const nums = ['I', 'II', 'III', 'IV', 'V'];
      api.txtCFit(nums[i], x + 18, y + h/2 - 5, 8, sel ? P.dark : P.goldDk, true, 24);
      // Chapter icon
      const icons = [iconCounting, iconChains, iconCandle, iconGift, iconGrave];
      if (icons[i]) icons[i](api, x + 62, y + h/2 - 2);
      // Chapter name
      api.txtCFit(ch.name, cx + 42, y + 10, 7, done ? P.greenDk : P.dark, true, 118);
      // Sub text
      api.txtCFit(ch.sub || '', cx + 42, y + 32, 6, done ? P.greenDk : P.leather, true, 126);
      // Status
      if (done) {
        api.txt('SETTLED', x + w - 62, y + 14, 6, P.greenDk);
        api.txt('✓', x + w - 14, y + 13, 9, P.greenDk);
      } else if (sel) {
        // Quill cursor
        api.txt('✎', x - 16, y + h/2 - 6, 11, P.goldDk);
      }
    },
  };

  /* ========================= SCREENS & LABELS ========================= */
  const SCREENS = {
    win:          P.gold,
    lose:         P.red,
    chapterLabel: P.goldDk,
    name:         P.parch,
    sub:          P.parchOld,
    intro:        P.parch,
    quote:        P.goldDk,
    help:         P.white,
    score:        P.gold,
    cur:          P.amber,
    cta:          P.candle,
    overlay:      'rgba(16,8,0,.88)',
  };

  const LABELS = {
    chapter: 'CHAPTER',
    score:   'SHILLINGS COUNTED',
    win:     'BAH! Well done.',
    lose:    'HUMBUG! Wasted.',
    cont:    'COUNT AGAIN',
    finale:  'GOD BLESS US',
    toMenu:  'BACK TO LEDGER',
    play:    'TURN THE PAGE',
  };

  /* ========== CH 1 — THE COUNTINGHOUSE — coin catch left/right ========== */
  const ch1 = {
    id: 'counting', name: 'THE COUNTINGHOUSE', sub: 'Count every last shilling',
    icon: iconCounting,
    intro: [
      'FOG OVER LONDON.',
      'Scrooge at his desk.',
      'Shillings fall like snow.',
      'Not one farthing wasted.',
    ],
    quote: '"What right have you to be merry? You\'re poor enough." — Scrooge',
    help: 'SLIDE LEFT/RIGHT. Catch gold SHILLINGS (14). Dodge grey FARTHINGS!',
    winText: 'Every shilling tallied. The books balance. Humbug indeed.',
    loseText: 'Farthings cloud the account. The audit has failed.',
    init(api) {
      this.bx   = api.W / 2;
      this.bvx  = 0;
      this.coins = [];
      this.hp   = 3;
      this.got  = 0;
      this.need = 14;
      this.spT  = 0.9;
      this.invT = 0;
      this.done = false;
    },
    update(api, dt) {
      if (this.done) return;
      const W = api.W, H = api.H;
      if (api.keyDown('left'))  this.bvx -= 270 * dt;
      if (api.keyDown('right')) this.bvx += 270 * dt;
      if (api.pointer.down) this.bvx += (api.pointer.x - this.bx) * 5.2 * dt;
      this.bvx  *= 0.80;
      this.bx    = clamp(this.bx + this.bvx * dt, 28, W - 28);
      const bY   = H - 52;
      this.spT  -= dt;
      if (this.spT <= 0) {
        this.spT = Math.max(0.44, 0.9 - api.t * 0.016);
        const gold = Math.random() < 0.62;
        this.coins.push({
          x: rand(16, W - 16),
          y: -14,
          vy: rand(80, 144) + api.t * 3.5,
          gold, hit: false,
        });
      }
      this.invT = Math.max(0, this.invT - dt);
      this.coins = this.coins.filter(co => {
        co.y += co.vy * dt;
        if (co.y > H + 20) return false;
        if (!co.hit && co.y > bY - 10 && co.y < bY + 18 && Math.abs(co.x - this.bx) < 28) {
          co.hit = true;
          if (co.gold) {
            this.got++;
            api.addScore(10);
            api.audio.sfx('coin');
            api.burst(co.x, bY, P.gold, 5);
            if (this.got >= this.need) { this.done = true; api.win(); }
          } else if (this.invT <= 0) {
            this.hp--;
            this.invT = 0.9;
            api.shake(5, 0.25);
            api.flash(P.greyDk, 0.18);
            api.burst(co.x, bY, P.grey, 4);
            if (this.hp <= 0) { this.done = true; api.lose(); }
          }
        }
        return !co.hit;
      });
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
      // Dark plank floor
      c.fillStyle = P.coal; c.fillRect(0, 0, W, H);
      for (let fb = 0; fb < W; fb += 26) {
        g.rect(fb, H - 20, 24, 20, P.dark);
        g.rect(fb + 24, H - 20, 2, 20, P.leatherDk);
      }
      // Ceiling beam
      g.rect(0, 0, W, 14, P.dark);
      g.rect(0, 12, W, 4, P.leatherDk);
      // Candle sconces on wall — static flicker using frame parity
      const fl = Math.floor(t * 6) % 2;
      for (const sx of [40, W - 40]) {
        g.rect(sx - 2, 22, 4, 18, P.parch);
        g.rect(sx - 2, 14 + fl, 4, 10, P.candle);
        g.rect(sx - 1, 10 + fl, 2, 6, P.gold);
        g.rect(sx - 7, 38, 14, 3, P.leather);
      }
      // Coins
      for (const co of this.coins) {
        const cy = Math.round(co.y);
        if (co.gold) {
          g.circle(co.x, cy, 7, P.gold);
          g.circle(co.x, cy, 4, P.goldDk);
          g.rect(co.x - 1, cy - 2, 1, 4, P.gold);   // £ hint
        } else {
          g.circle(co.x, cy, 7, P.grey);
          g.circle(co.x, cy, 4, P.greyDk);
        }
      }
      // Basket
      const blink = this.invT > 0 && Math.floor(t * 8) % 2 === 0;
      if (!blink) {
        const bx = Math.round(this.bx);
        g.rect(bx - 26, H - 52, 52, 12, P.leather);
        g.rect(bx - 23, H - 56, 46, 6,  P.leatherDk);
        g.rectO(bx - 26, H - 52, 52, 12, P.goldDk, 1);
        api.txtCFit('£', bx, H - 50, 8, P.parch, true, 18);
      }
      // HUD
      api.txtCFit(this.got + '/' + this.need + ' SHILLINGS', W/2, 16, 7, P.gold, true);
      for (let hi = 0; hi < 3; hi++)
        g.circle(8 + hi * 16, H - 14, 5, hi < this.hp ? P.gold : P.greyDk);
      api.vignette(); api.scanlines();
    },
  };

  /* ========== CH 2 — MARLEY'S WARNING — dodge horizontal chains ========== */
  const ch2 = {
    id: 'marley', name: "MARLEY'S WARNING", sub: 'The chain I forged in life',
    icon: iconChains,
    intro: [
      'THE BELL TOLLS ONE.',
      'The air grows icy cold.',
      'Cash-box chains fly like fury.',
      'Dodge them, Scrooge!',
    ],
    quote: '"No space of regret can make amends for one life\'s opportunity misused!" — Marley',
    help: 'Move UP / DOWN. Dodge the chains Marley flings across the room!',
    winText: 'The vision fades. You still have a chance, Ebenezer.',
    loseText: 'The chains wrap you in cold iron. Marley\'s warning unheeded.',
    init(api) {
      this.sy   = api.H / 2;
      this.svy  = 0;
      this.chains = [];
      this.hp   = 3;
      this.timer = 24;
      this.spT  = 2.2;
      this.invT = 0;
      this.done = false;
    },
    update(api, dt) {
      if (this.done) return;
      const W = api.W, H = api.H;
      if (api.keyDown('up'))   this.svy -= 250 * dt;
      if (api.keyDown('down')) this.svy += 250 * dt;
      if (api.pointer.down)
        this.svy += (api.pointer.y < H / 2 ? -220 : 220) * dt;
      this.svy *= 0.78;
      this.sy   = clamp(this.sy + this.svy * dt, 38, H - 68);
      this.timer -= dt;
      if (this.timer <= 0) { this.done = true; api.win(); return; }
      const elapsed = 24 - this.timer;
      this.spT -= dt;
      if (this.spT <= 0) {
        this.spT = Math.max(0.68, 2.2 - elapsed * 0.06);
        const left = Math.random() < 0.5;
        const spd  = rand(90, 168) + elapsed * 3.5;
        this.chains.push({
          x: left ? -90 : W + 90,
          y: rand(32, H - 68),
          vx: left ? spd : -spd,
          len: rint(58, 102),
          left, passed: false,
        });
      }
      this.invT = Math.max(0, this.invT - dt);
      const scrX = 52;
      this.chains = this.chains.filter(ch => {
        ch.x += ch.vx * dt;
        if (ch.x > W + 130 || ch.x < -130) return false;
        if (!ch.passed && this.invT <= 0) {
          // Chain occupies [ch.x, ch.x + ch.len] if going right
          const chainL = ch.left ? ch.x : ch.x - ch.len;
          const chainR = ch.left ? ch.x + ch.len : ch.x;
          if (scrX + 12 > chainL && scrX - 12 < chainR &&
              Math.abs(ch.y - this.sy) < 22) {
            this.hp--;
            this.invT = 1.1;
            ch.passed = true;
            api.shake(6, 0.28);
            api.flash(P.ghost, 0.20);
            api.burst(scrX, this.sy, P.chain, 7);
            if (this.hp <= 0) { this.done = true; api.lose(); }
          }
        }
        return true;
      });
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
      // Ghostly dark room — dithered blue-black
      c.fillStyle = P.ghostDk; c.fillRect(0, 0, W, H);
      for (let dy = 0; dy < H; dy += 8)
        for (let dx = 0; dx < W; dx += 8)
          if ((dx + dy) % 16 === 0) g.rect(dx, dy, 4, 4, '#000044');
      // Floor line
      g.rect(0, H - 28, W, 28, '#000066');
      g.rect(0, H - 32, W, 4,  P.ghostDk);
      // Marley's ghost (right side)
      const mgy = Math.round(H/2 + Math.sin(t * 1.1) * 18);
      const mgx = W - 40;
      // Robe
      g.rect(mgx - 16, mgy - 30, 32, 52, P.ghost);
      g.rect(mgx - 12, mgy - 44, 24, 20, P.ghost); // head
      // Glowing eyes
      g.rect(mgx - 7,  mgy - 38, 4, 4, P.ghostDk);
      g.rect(mgx + 3,  mgy - 38, 4, 4, P.ghostDk);
      g.rect(mgx - 6,  mgy - 37, 2, 2, P.white);
      g.rect(mgx + 4,  mgy - 37, 2, 2, P.white);
      // Bandage around head
      g.rect(mgx - 14, mgy - 44, 28, 6, P.white);
      // Attached chains on ghost
      for (let ci = 0; ci < 4; ci++) {
        g.rectO(mgx - 16 + ci * 10, mgy + 12 + ci * 3, 7, 12, P.chainDk, 1);
      }
      // Chains in play
      for (const ch of this.chains) {
        const cy2 = Math.round(ch.y);
        const startX = Math.round(ch.left ? ch.x : ch.x - ch.len);
        const links  = Math.floor(ch.len / 9);
        for (let li = 0; li < links; li++) {
          const lx = startX + li * 9;
          if (li % 2 === 0) g.rectO(lx, cy2 - 5, 7, 10, P.chain, 1);
          else              g.rectO(lx, cy2 - 3, 9,  6, P.chain, 1);
        }
        // Cash box at trailing end
        const boxX = Math.round(ch.left ? ch.x : ch.x - ch.len);
        g.rect(boxX - 7, cy2 - 9, 14, 14, P.leatherDk);
        g.rectO(boxX - 7, cy2 - 9, 14, 14, P.chain, 1);
        g.circle(boxX, cy2 - 2, 2, P.gold);
      }
      // Scrooge in nightgown
      const blink = this.invT > 0 && Math.floor(t * 8) % 2 === 0;
      if (!blink) {
        const sy2 = Math.round(this.sy);
        g.rect(44, sy2 - 36, 16, 8,  P.white); // nightcap
        g.rect(48, sy2 - 42, 8,  8,  P.white);
        g.rect(50, sy2 - 47, 4,  7,  P.white);
        g.rect(42, sy2 - 28, 18, 20, P.parch); // head
        g.rect(43, sy2 - 24, 4,  4,  P.dark);  // eyes
        g.rect(51, sy2 - 24, 4,  4,  P.dark);
        g.rect(46, sy2 - 18, 6,  4,  P.parchOld); // nose
        g.rect(36, sy2 - 8,  30, 36, P.white); // gown
        g.rect(44, sy2 + 28, 14, 16, P.white);
        g.rect(36, sy2 + 42, 14, 6,  P.parchOld); // slippers
        g.rect(50, sy2 + 42, 14, 6,  P.parchOld);
      }
      // Timer bar
      const tb = this.timer / 24;
      g.rect(W - 84, 10, 74, 8, P.ghostDk);
      g.rect(W - 84, 10, Math.round(74 * tb), 8, tb > 0.34 ? P.ghost : P.red);
      api.txtCFit('SURVIVE', W - 46, 22, 6, P.ghost, true, 74);
      for (let hi = 0; hi < 3; hi++)
        g.circle(12 + hi * 16, 16, 5, hi < this.hp ? P.ghost : P.ghostDk);
      api.vignette(); api.scanlines();
    },
  };

  /* ========== CH 3 — CHRISTMAS PAST — timing ring / candle memories ========== */
  const ch3 = {
    id: 'past', name: 'CHRISTMAS PAST', sub: 'Rise, and walk with me',
    icon: iconCandle,
    intro: [
      'A CHILD\'S LIGHT FILLS THE ROOM.',
      'The Ghost of Christmas Past.',
      'Eight candles. Eight memories.',
      'Tap when the ring turns gold!',
    ],
    quote: '"These are but shadows of the things that have been." — The Spirit',
    help: 'TAP each candle when the ring is GOLD. Miss 3 and the light is snuffed out!',
    winText: 'Eight memories acknowledged. The past is clear. Now look ahead.',
    loseText: 'Three candles snuffed. The Spirit turns away, disappointed.',
    init(api) {
      this.count  = 0;
      this.need   = 8;
      this.misses = 0;
      this.maxM   = 3;
      this.phase  = 'wait'; // wait | show | fb
      this.nextT  = 0.5;
      this.ringX  = api.W / 2;
      this.ringY  = api.H / 2;
      this.ringR  = 52;
      this.ringTgt = 12;
      this.speed  = 24;
      this.ringAge = 0;
      this.maxAge = 3.6;
      this.fbGood = false;
      this.fbT    = 0;
      this.done   = false;
    },
    update(api, dt) {
      if (this.done) return;
      if (this.phase === 'wait') {
        this.nextT -= dt;
        if (this.nextT <= 0) {
          this.phase  = 'show';
          this.ringX  = rand(42, api.W - 42);
          this.ringY  = rand(68, api.H - 80);
          this.ringR  = 52;
          this.speed  = 24 + this.count * 3.2;
          this.ringAge = 0;
        }
        return;
      }
      if (this.phase === 'fb') {
        this.fbT -= dt;
        if (this.fbT <= 0) { this.phase = 'wait'; }
        return;
      }
      // phase === 'show'
      this.ringR  = Math.max(this.ringTgt, this.ringR - this.speed * dt);
      this.ringAge += dt;
      if (this.ringAge >= this.maxAge) {
        this.misses++;
        this.fbGood = false;
        this.fbT    = 0.65;
        this.phase  = 'fb';
        api.flash(P.red, 0.20);
        api.shake(4, 0.18);
        if (this.misses >= this.maxM) { this.done = true; api.lose(); }
        else this.nextT = 0.5;
        return;
      }
      // Tap detection
      const tapped = api.pointer.justDown || api.keyPressed('a');
      if (tapped) {
        const goldZone = this.ringR <= 24;
        if (goldZone) {
          this.count++;
          api.addScore(15);
          this.fbGood = true;
          api.burst(this.ringX, this.ringY, P.candle, 7);
          api.audio.sfx('coin');
          if (this.count >= this.need) { this.done = true; api.win(); }
          else this.nextT = 0.55;
        } else {
          this.misses++;
          this.fbGood = false;
          api.flash(P.red, 0.16);
          if (this.misses >= this.maxM) { this.done = true; api.lose(); }
          else this.nextT = 0.4;
        }
        this.fbT   = 0.55;
        this.phase = 'fb';
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
      // Misty ethereal scene — dark with floating light specks
      c.fillStyle = '#040818'; c.fillRect(0, 0, W, H);
      // Floating wisps — dithered pixel art
      for (let wi = 0; wi < 14; wi++) {
        const wx = Math.round(((wi * 73 + t * 9 + wi * 19) % (W + 10)) - 5);
        const wy = Math.round(((wi * 61 + t * 5 + wi * 31) % H));
        g.rect(wx, wy, 2, 2, wi % 3 === 0 ? P.candle : P.ghost);
      }
      // Ghost of Christmas Past (top, gently floating)
      const ghostY = Math.round(36 + Math.sin(t * 0.9) * 6);
      g.rect(W/2 - 18, ghostY - 8,  36, 44, P.white);
      g.circle(W/2,    ghostY - 10, 16, P.white);
      // Light emanating from ghost's crown (flat brightness lines)
      g.rect(W/2 - 38, ghostY - 16, 76, 3, P.candle);
      g.rect(W/2 - 28, ghostY - 20, 56, 2, P.candle);
      // Candle crown on ghost
      for (let i = -1; i <= 1; i++) {
        g.rect(W/2 + i * 10 - 1, ghostY - 26, 2, 10, P.parch);
        g.rect(W/2 + i * 10 - 1, ghostY - 32, 2, 7,  P.candle);
        g.rect(W/2 + i * 10,     ghostY - 35, 1, 4,  P.gold);
      }
      // Show ring + candle
      if (this.phase === 'show') {
        const rx = Math.round(this.ringX), ry = Math.round(this.ringY);
        const rr = Math.round(this.ringR);
        const pct = (rr - this.ringTgt) / (52 - this.ringTgt);
        // Candle
        g.rect(rx - 3, ry - 16, 6, 22, P.parch);
        g.rect(rx - 3, ry - 26, 6, 12, P.candle);
        g.rect(rx - 1, ry - 32, 2, 7,  P.gold);
        // Outer ring — color transitions white → candle → gold as it shrinks
        const col = pct < 0.4 ? P.gold : pct < 0.7 ? P.candle : P.white;
        for (let rd = rr; rd >= rr - 3 && rd > 0; rd--) {
          g.rectO(rx - rd, ry - rd, rd * 2, rd * 2, col, 1);
        }
      }
      // Feedback text
      if (this.phase === 'fb') {
        const col = this.fbGood ? P.gold : P.red;
        const msg = this.fbGood ? 'REMEMBERED' : 'SNUFFED';
        api.txtCFit(msg, W/2, H/2 - 4, 12, col, true);
      }
      // Progress
      api.txtCFit(this.count + '/' + this.need + ' MEMORIES', W/2, H - 34, 7, P.candle, true);
      for (let mi = 0; mi < this.maxM; mi++)
        api.txt('✗', 10 + mi * 18, H - 26, 10, mi < this.misses ? P.red : P.greyDk);
      api.vignette(); api.scanlines();
    },
  };

  /* ========== CH 4 — CHRISTMAS PRESENT — gift box whack grid ========== */
  const ch4 = {
    id: 'present', name: 'CHRISTMAS PRESENT', sub: 'Come in and know me better!',
    icon: iconGift,
    intro: [
      'A GIANT IN GREEN AND GOLD.',
      'The Ghost of Christmas Present!',
      'He shows Scrooge gifts for the poor.',
      'Tap the boxes before they vanish!',
    ],
    quote: '"Come in, and know me better, man!" — Ghost of Christmas Present',
    help: 'TAP glowing gift boxes before they fade! Let 3 go dark and Christmas is lost.',
    winText: 'Twelve gifts delivered. Even Tiny Tim can smile today.',
    loseText: 'Three gifts go undelivered. Tiny Tim grows quiet.',
    init(api) {
      const W = api.W, H = api.H;
      this.grid = [];
      // 5 cols × 2 rows
      const cols = 5, rows = 2;
      const cw = Math.floor((W - 28) / cols);
      const ch = 72;
      const sy = 130;
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          this.grid.push({
            x: 14 + col * cw + cw/2,
            y: sy + r * ch + ch/2,
            state: 'idle',  // idle | active | opened
            timer: 0, maxT: 2.6,
            oTimer: 0,
            col, row: r,
          });
        }
      }
      this.active = [];
      this.opened = 0;
      this.need   = 12;
      this.exp    = 0;
      this.maxExp = 3;
      this.spawnT = 0.8;
      this.cursorI = 0;
      this.done   = false;
    },
    update(api, dt) {
      if (this.done) return;
      const elapsed = this.opened + this.exp;
      // Keyboard cursor
      if (api.keyPressed('left'))  this.cursorI = Math.max(0, this.cursorI - 1);
      if (api.keyPressed('right')) this.cursorI = Math.min(9, this.cursorI + 1);
      if (api.keyPressed('up'))    this.cursorI = Math.max(0, this.cursorI - 5);
      if (api.keyPressed('down'))  this.cursorI = Math.min(9, this.cursorI + 5);
      if (api.keyPressed('a') || api.keyPressed('start')) {
        // activate cursor cell
        const cell = this.grid[this.cursorI];
        if (cell.state === 'active') this._tapCell(api, this.cursorI);
      }
      // Spawn
      this.spawnT -= dt;
      if (this.spawnT <= 0 && this.active.length < 3) {
        const idle = this.grid.reduce((acc, gc, i) => { if (gc.state === 'idle') acc.push(i); return acc; }, []);
        if (idle.length > 0) {
          const idx = idle[rint(0, idle.length - 1)];
          const cell = this.grid[idx];
          cell.state  = 'active';
          cell.timer  = 0;
          cell.maxT   = Math.max(1.38, 2.6 - elapsed * 0.055);
          cell.oTimer = 0;
          this.active.push(idx);
          this.spawnT = Math.max(0.38, 0.8 - elapsed * 0.022);
        } else {
          this.spawnT = 0.3;
        }
      }
      // Update active
      for (let i = this.active.length - 1; i >= 0; i--) {
        const idx = this.active[i];
        const cell = this.grid[idx];
        cell.timer += dt;
        if (cell.timer >= cell.maxT) {
          cell.state = 'idle';
          this.active.splice(i, 1);
          this.exp++;
          api.flash(P.red, 0.14);
          if (this.exp >= this.maxExp) { this.done = true; api.lose(); }
        }
      }
      // Update opened (visual reset)
      for (const cell of this.grid) {
        if (cell.state === 'opened') {
          cell.oTimer += dt;
          if (cell.oTimer >= 0.42) cell.state = 'idle';
        }
      }
      // Tap detection
      if (api.pointer.justDown) {
        const px = api.pointer.x, py = api.pointer.y;
        for (let i = this.active.length - 1; i >= 0; i--) {
          const idx  = this.active[i];
          const cell = this.grid[idx];
          if (Math.abs(px - cell.x) < 24 && Math.abs(py - cell.y) < 24) {
            this._tapCell(api, idx);
            break;
          }
        }
      }
    },
    _tapCell(api, idx) {
      const pos = this.active.indexOf(idx);
      if (pos < 0) return;
      const cell = this.grid[idx];
      cell.state  = 'opened';
      cell.oTimer = 0;
      this.active.splice(pos, 1);
      this.opened++;
      api.addScore(10);
      api.burst(cell.x, cell.y, P.gold, 6);
      api.audio.sfx('coin');
      if (this.opened >= this.need) { this.done = true; api.win(); }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
      // Warm Cratchit hearth
      c.fillStyle = '#2C1008'; c.fillRect(0, 0, W, H);
      // Floor boards
      g.rect(0, H - 24, W, 24, P.leather);
      g.rect(0, H - 28, W, 5,  P.dark);
      for (let fb = 0; fb < W; fb += 30) g.rect(fb, H - 24, 1, 24, P.dark);
      // Fireplace glow
      g.rect(W/2 - 26, H - 68, 52, 44, P.dark);
      g.rect(W/2 - 22, H - 64, 44, 38, P.coal);
      // Flat fire pixels
      const fl2 = Math.floor(t * 5) % 2;
      for (let fi = 0; fi < 5; fi++) {
        const fw2 = 6 + fi * 2, fh2 = 12 + fi * 3 + fl2 * 2;
        const fx2 = W/2 - 12 + fi * 8;
        g.rect(fx2 - fw2/2, H - 64 - fh2, fw2, fh2, fi % 2 === 0 ? P.red : P.gold);
      }
      // Ghost of Christmas Present (upper centre, large)
      const ghostY = Math.round(60 + Math.sin(t * 0.7) * 4);
      g.rect(W/2 - 26, ghostY - 22, 52, 56, P.green);
      g.circle(W/2, ghostY - 24, 20, P.parch); // head
      g.rect(W/2 - 28, ghostY - 30, 56, 12, P.gold); // holly crown
      // Ghost torch (right hand)
      g.rect(W/2 + 22, ghostY - 18, 6, 38, P.leather);
      g.rect(W/2 + 20, ghostY - 26, 10, 10, P.candle);
      const fl3 = Math.floor(t * 5) % 2;
      g.rect(W/2 + 21, ghostY - 32 + fl3, 8, 8, P.gold);
      // Gift grid
      for (let ci = 0; ci < this.grid.length; ci++) {
        const cell = this.grid[ci];
        const cx2 = Math.round(cell.x), cy2 = Math.round(cell.y);
        const isCursor = ci === this.cursorI;
        if (cell.state === 'idle') {
          g.rectO(cx2 - 18, cy2 - 18, 36, 36, P.greyDk, 1);
          if (isCursor) g.rectO(cx2 - 18, cy2 - 18, 36, 36, P.goldDk, 1);
        } else if (cell.state === 'active') {
          const prog = cell.timer / cell.maxT;
          const pulse = Math.floor(t * 6) % 2 === 0;
          const boxC = prog > 0.7 ? P.red : P.redBrt;
          g.rect(cx2 - 18, cy2 - 18, 36, 36, boxC);
          g.rect(cx2 - 4,  cy2 - 18, 8,  36, P.gold);   // ribbon v
          g.rect(cx2 - 18, cy2 - 4,  36, 8,  P.gold);   // ribbon h
          g.rect(cx2 - 5,  cy2 - 26, 10, 10, P.redBrt); // bow
          if (pulse) g.rectO(cx2 - 18, cy2 - 18, 36, 36, P.candle, 2);
          // Drain bar
          const bw2 = Math.round(30 * (1 - prog));
          g.rect(cx2 - 15, cy2 + 22, 30, 3, P.greyDk);
          g.rect(cx2 - 15, cy2 + 22, bw2, 3, prog > 0.7 ? P.red : P.gold);
        } else if (cell.state === 'opened') {
          g.circle(cx2, cy2, 16, P.gold);
          api.txtCFit('★', cx2, cy2 - 7, 12, P.dark, true, 22);
        }
      }
      // HUD
      api.txtCFit(this.opened + '/' + this.need + ' GIFTS', W/2, H - 50, 7, P.gold, true);
      for (let ei = 0; ei < this.maxExp; ei++)
        api.txt('✗', W - 52 + ei * 18, H - 36, 10, ei < this.exp ? P.red : P.greyDk);
      api.vignette(); api.scanlines();
    },
  };

  /* ========== CH 5 — YET TO COME — dodge cloaked ghost, collect echoes ========== */
  const ch5 = {
    id: 'yettocome', name: 'YET TO COME', sub: 'Are these the shadows of things that will be?',
    icon: iconGrave,
    intro: [
      'THE DARKEST PHANTOM OF ALL.',
      'Draped in black. It will not speak.',
      'It only points.',
      'Escape the graveyard — collect 5 echoes!',
    ],
    quote: '"Before I draw nearer to that stone, answer me one question!" — Scrooge',
    help: 'DRAG / ARROWS. Dodge the Ghost\'s pointing beam. Collect 5 grave echoes to escape!',
    winText: '"I will live in the Past, Present, and Future!" The phantom vanishes.',
    loseText: 'The pointing finger holds you. The stone reads: EBENEZER SCROOGE.',
    init(api) {
      this.sx    = api.W / 2;
      this.sy    = api.H * 0.72;
      this.svx   = 0;
      this.svy   = 0;
      this.hp    = 3;
      this.ghostX = api.W / 2;
      this.ghostY = api.H * 0.26;
      this.angle  = Math.PI / 2;  // starts pointing down
      this.timer  = 30;
      this.invT   = 0;
      // Five tokens at fixed positions spread around the canvas
      const W = api.W, H = api.H;
      this.tokens = [
        { x: 40,      y: H * 0.38, col: false },
        { x: W - 40,  y: H * 0.42, col: false },
        { x: 40,      y: H * 0.78, col: false },
        { x: W - 40,  y: H * 0.72, col: false },
        { x: W / 2,   y: H * 0.86, col: false },
      ];
      this.colCount = 0;
      this.done = false;
    },
    update(api, dt) {
      if (this.done) return;
      const W = api.W, H = api.H;
      if (api.keyDown('left'))  this.svx -= 230 * dt;
      if (api.keyDown('right')) this.svx += 230 * dt;
      if (api.keyDown('up'))    this.svy -= 230 * dt;
      if (api.keyDown('down'))  this.svy += 230 * dt;
      if (api.pointer.down) {
        this.svx += (api.pointer.x - this.sx) * 4.2 * dt;
        this.svy += (api.pointer.y - this.sy) * 4.2 * dt;
      }
      this.svx *= 0.76; this.svy *= 0.76;
      this.sx = clamp(this.sx + this.svx * dt, 10, W - 10);
      this.sy = clamp(this.sy + this.svy * dt, 10, H - 10);
      this.timer -= dt;
      if (this.timer <= 0) { this.done = true; api.lose(); return; }
      // Ghost rotates toward Scrooge (speed increases over time)
      const tgt = Math.atan2(this.sy - this.ghostY, this.sx - this.ghostX);
      let diff = tgt - this.angle;
      while (diff >  Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      const spd = Math.min(0.88 + (30 - this.timer) * 0.022, 1.7);
      this.angle += Math.sign(diff) * Math.min(Math.abs(diff), spd * dt);
      // Damage check — cone in front of ghost
      this.invT = Math.max(0, this.invT - dt);
      if (this.invT <= 0) {
        const sa = Math.atan2(this.sy - this.ghostY, this.sx - this.ghostX);
        let ad = sa - this.angle;
        while (ad >  Math.PI) ad -= 2 * Math.PI;
        while (ad < -Math.PI) ad += 2 * Math.PI;
        const dist = Math.hypot(this.sx - this.ghostX, this.sy - this.ghostY);
        if (Math.abs(ad) < 0.28 && dist < 148) {
          this.hp--;
          this.invT = 1.2;
          api.shake(6, 0.28);
          api.flash(P.ghostDk, 0.20);
          api.burst(this.sx, this.sy, P.ghost, 6);
          if (this.hp <= 0) { this.done = true; api.lose(); }
        }
      }
      // Collect tokens
      for (const tok of this.tokens) {
        if (!tok.col && Math.abs(this.sx - tok.x) < 16 && Math.abs(this.sy - tok.y) < 16) {
          tok.col = true;
          this.colCount++;
          api.addScore(20);
          api.audio.sfx('coin');
          api.burst(tok.x, tok.y, P.parchOld, 5);
          if (this.colCount >= 5) { this.done = true; api.win(); }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
      // Dark graveyard
      c.fillStyle = P.ghostDk; c.fillRect(0, 0, W, H);
      // Stars
      for (let si = 0; si < 18; si++) {
        if (((Math.floor(t * 1.3) + si) % 3) !== 0)
          g.rect((si * 67 + 5) % W, (si * 53 + 3) % Math.floor(H * 0.38), 1, 1, P.ghost);
      }
      // Ground
      g.rect(0, H - 26, W, 26, '#001008');
      g.rect(0, H - 30, W, 6,  '#002814');
      // Background gravestones
      const graves = [[22,H-56,18,28],[72,H-64,20,32],[148,H-52,16,26],[198,H-60,22,30],[238,H-54,18,26]];
      for (const [gx, gy, gw, gh] of graves) {
        g.rect(gx, gy, gw, gh, P.greyDk);
        g.circle(gx + gw/2, gy, gw/2, P.greyDk);
      }
      // Tokens
      for (const tok of this.tokens) {
        if (tok.col) continue;
        const tx = Math.round(tok.x), ty = Math.round(tok.y);
        g.rect(tx - 10, ty - 14, 20, 28, P.greyDk);
        g.circle(tx, ty - 12, 7, P.greyDk);
        // Pulse glow using frame parity
        if (Math.floor(t * 2.8 + tok.x * 0.07) % 2 === 0) {
          g.rectO(tx - 12, ty - 16, 24, 32, P.ghost, 1);
          g.circle(tx, ty - 12, 9, P.ghost);
        }
        for (let r = 0; r < 2; r++) g.rect(tx - 5, ty - 6 + r * 6, 10, 1, P.grey);
      }
      // Ghost (cloaked shape)
      const gx2 = Math.round(this.ghostX), gy2 = Math.round(this.ghostY);
      g.rect(gx2 - 20, gy2 - 16, 40, 54, P.dark);
      g.rect(gx2 - 16, gy2 - 30, 32, 20, P.dark);
      g.circle(gx2, gy2 - 28, 12, P.dark);
      // Pointing arm (direction of angle)
      const cos = Math.cos(this.angle), sin2 = Math.sin(this.angle);
      for (let s = 1; s <= 9; s++) {
        const fx = Math.round(gx2 + cos * s * 13);
        const fy = Math.round(gy2 + sin2 * s * 13);
        g.rect(fx - 2, fy - 2, 4, 4, P.dark);
      }
      // Danger beam dots along arm direction (warn player)
      const dist2 = Math.hypot(this.sx - this.ghostX, this.sy - this.ghostY);
      const sa = Math.atan2(this.sy - this.ghostY, this.sx - this.ghostX);
      let angD = sa - this.angle;
      while (angD >  Math.PI) angD -= 2 * Math.PI;
      while (angD < -Math.PI) angD += 2 * Math.PI;
      const inDanger = Math.abs(angD) < 0.28 && dist2 < 148;
      const beamCol = inDanger ? P.red : P.ghostDk;
      for (let d = 14; d < 140; d += 10) {
        const bx = Math.round(gx2 + cos * d);
        const by = Math.round(gy2 + sin2 * d);
        g.rect(bx - 1, by - 1, 3, 3, beamCol);
      }
      // Scrooge
      const blink = this.invT > 0 && Math.floor(t * 8) % 2 === 0;
      if (!blink) {
        const sx = Math.round(this.sx), sy = Math.round(this.sy);
        g.rect(sx - 8, sy - 30, 16, 8,  P.white);
        g.rect(sx - 4, sy - 36, 8,  8,  P.white);
        g.rect(sx - 8, sy - 22, 16, 18, P.parch);
        g.rect(sx - 5, sy - 18, 4,  4,  P.dark);
        g.rect(sx + 1, sy - 18, 4,  4,  P.dark);
        g.rect(sx - 10, sy - 4, 20, 26, P.white);
        g.rect(sx - 6,  sy + 22, 12, 12, P.white);
      }
      // HUD
      const tb = this.timer / 30;
      g.rect(W - 84, 10, 74, 8, P.ghostDk);
      g.rect(W - 84, 10, Math.round(74 * tb), 8, tb > 0.34 ? P.ghost : P.red);
      api.txtCFit(this.colCount + '/5 ECHOES', W/2, H - 50, 7, P.ghost, true);
      for (let hi = 0; hi < 3; hi++)
        g.circle(12 + hi * 16, 16, 5, hi < this.hp ? P.ghost : P.ghostDk);
      api.vignette(); api.scanlines();
    },
  };

  /* ========================= CREATE SAGA ========================= */
  RetroSaga.create({
    id:       'scrooge-ledger',
    title:    'Bah, Humbug!',
    subtitle: 'A Christmas Carol',
    accent:   '#D4A020',
    credit:   'AN 8-BIT TRIBUTE · CHARLES DICKENS, 1843',
    currency: 'SHILLINGS',
    bootCta:  'OPEN THE LEDGER',
    menuLabel:'THE LEDGER OF ACCOUNTS',
    menuHint: 'TAP AN ENTRY TO BEGIN',
    menuDone: 'ALL DEBTS SETTLED — GOD BLESS US!',
    finale: [
      '"I will honour Christmas in my heart,',
      'and try to keep it all the year."',
      '— Ebenezer Scrooge',
    ],
    emblem,
    scenery,
    menu:    MENU,
    screens: SCREENS,
    labels:  LABELS,
    chapters: [ch1, ch2, ch3, ch4, ch5],
  });
})();
