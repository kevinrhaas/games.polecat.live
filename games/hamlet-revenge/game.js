/* ============================================================================
 * HAMLET — THE PRINCE OF DENMARK
 * Five acts of Shakespeare's tragedy (William Shakespeare, c.1600):
 *   1. THE GHOST'S OATH   — dodge spectral sweeps, collect 5 message tokens
 *   2. THE MOUSETRAP      — timing meter, 6 beats to expose Claudius
 *   3. BEHIND THE ARRAS   — stealth past guard cones, collect 6 royal seals
 *   4. OPHELIA'S FLOWERS  — catch rosemary & pansies, avoid fennel & rue
 *   5. THE FINAL DUEL     — dodge Laertes' lane attacks, counter-strike 5 times
 * Built on RetroSaga (js/saga.js). NES-honest palette — flat fills, no gradients.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ======================== NES-HONEST PALETTE ======================== */
  const C = {
    black:   '#000000',
    void2:   '#080010',
    night:   '#0C0820',
    castle:  '#14103C',
    royal:   '#1C3090',
    royDk:   '#0C1848',
    purple:  '#4C1880',
    purpLt:  '#7828C8',
    gold:    '#C8A020',
    goldBrt: '#F8C800',
    amber:   '#D8880C',
    crimson: '#A00020',
    crimBrt: '#D82040',
    blood:   '#680014',
    ghostWh: '#C8E0F8',
    ghostDm: '#6080A8',
    parch:   '#C8B080',
    cream:   '#F0E8C8',
    stone:   '#707888',
    stoneDk: '#404858',
    fog:     '#9098B0',
    green:   '#186020',
    greenBr: '#28A030',
    teal:    '#108068',
    white:   '#F8F8F8',
    grey:    '#787888',
    candle:  '#F8D840',
    orange:  '#F87020',
    navy:    '#000048',
    navyBrt: '#0000BC',
    velvet:  '#1C0840',
    rose:    '#C04080',
    flax:    '#E8C870',
    tan:     '#A07848',
    brown:   '#604820',
    silver:  '#B8B8C8',
  };

  /* ======================== EMBLEM (Yorick's skull + crown) ========================= */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Crown (above skull)
    c.fillStyle = C.gold;
    c.fillRect(cx - 14, cy - 38, 28, 8);
    c.fillRect(cx - 10, cy - 46, 7, 10);
    c.fillRect(cx - 2,  cy - 50, 6, 14);
    c.fillRect(cx + 5,  cy - 46, 7, 10);
    // Crown jewels
    g.circle(cx - 7,  cy - 48, 3, C.crimBrt);
    g.circle(cx + 1,  cy - 52, 3, C.goldBrt);
    g.circle(cx + 8,  cy - 48, 3, C.purpLt);
    // Skull cranium
    g.circle(cx, cy - 16, 16, C.ghostWh);
    // Skull jaw
    c.fillStyle = C.ghostWh;
    c.fillRect(cx - 12, cy - 4, 24, 12);
    // Eye sockets
    c.fillStyle = C.night;
    g.circle(cx - 6, cy - 18, 5, C.night);
    g.circle(cx + 6, cy - 18, 5, C.night);
    // Nasal cavity
    c.fillRect(cx - 2, cy - 12, 5, 5);
    // Teeth
    c.fillStyle = C.night;
    for (let t = 0; t < 5; t++) c.fillRect(cx - 10 + t * 5, cy + 4, 4, 5);
    // Jaw line
    c.fillStyle = C.ghostDm;
    c.fillRect(cx - 12, cy + 6, 24, 2);
  }

  /* ======================== SCENERY ========================= */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    c.fillStyle = C.night; c.fillRect(0, 0, W, H);

    if (scene === 'menu') {
      // Elsinore great hall — stone walls, Gothic arches, torchlight
      c.fillStyle = '#101828'; c.fillRect(0, 0, W, H);
      // Back wall
      c.fillStyle = '#0C1420'; c.fillRect(0, 0, W, H * 0.62);
      // Stone courses (horizontal lines)
      c.fillStyle = '#16202E';
      for (let wy = 16; wy < H * 0.62; wy += 20) c.fillRect(0, wy, W, 2);
      // Vertical stone joints (offset per row)
      c.fillStyle = '#0A1018';
      for (let wy = 0; wy < H * 0.62; wy += 20) {
        const off = Math.floor(wy / 20) % 2 === 0 ? 0 : 18;
        for (let wx = off; wx < W; wx += 36) c.fillRect(wx, wy, 2, 18);
      }
      // Gothic arches on back wall (three arched alcoves)
      const archCols = [W * 0.18, W * 0.50, W * 0.82];
      for (const ax of archCols) {
        c.fillStyle = '#060E18';
        c.fillRect(ax - 22, H * 0.08, 44, H * 0.52);
        // Arch top (stacked rects to fake a pointed arch)
        c.fillRect(ax - 20, H * 0.05, 40, 8);
        c.fillRect(ax - 16, H * 0.02, 32, 6);
        c.fillRect(ax - 10, 0, 20, 5);
        // Arch border (gold trim)
        c.fillStyle = C.gold;
        c.fillRect(ax - 22, H * 0.08, 2, H * 0.52);
        c.fillRect(ax + 20, H * 0.08, 2, H * 0.52);
        c.fillRect(ax - 20, H * 0.08, 40, 2);
      }
      // Stone floor
      c.fillStyle = C.stoneDk; c.fillRect(0, H * 0.60, W, H * 0.40);
      c.fillStyle = C.stone;
      for (let lx = 0; lx < W; lx += 28) c.fillRect(lx, H * 0.60, 1, H * 0.40);
      for (let ly = H * 0.60; ly < H; ly += 22) c.fillRect(0, ly, W, 1);
      // Torchlight glow bands on side walls
      const flk = Math.floor(t * 8) % 2;
      c.fillStyle = '#2C1A08'; c.fillRect(0, H * 0.18, 16, H * 0.28);
      c.fillStyle = '#2C1A08'; c.fillRect(W - 16, H * 0.18, 16, H * 0.28);
      // Left torch
      c.fillStyle = C.tan;   c.fillRect(12, H * 0.15, 7, 20);
      c.fillStyle = C.candle; c.fillRect(13, H * 0.10, 5, 8);
      c.fillStyle = flk ? C.orange : C.gold;
      c.fillRect(14, H * 0.06, 3, 7);
      // Right torch
      c.fillStyle = C.tan;   c.fillRect(W - 19, H * 0.15, 7, 20);
      c.fillStyle = C.candle; c.fillRect(W - 18, H * 0.10, 5, 8);
      c.fillStyle = flk ? C.gold : C.orange;
      c.fillRect(W - 17, H * 0.06, 3, 7);
    } else {
      // Generic castle exterior — night sky, battlements
      c.fillStyle = '#040810'; c.fillRect(0, 0, W, H * 0.58);
      // Stars
      c.fillStyle = C.ghostWh;
      for (let s = 0; s < 22; s++) {
        c.fillRect((s * 53 + 11) % W, (s * 37 + 7) % (H * 0.50), 2, 2);
      }
      // Crescent moon
      g.circle(W - 40, 26, 18, C.ghostDm);
      g.circle(W - 32, 20, 14, '#040810');
      // Battlements
      c.fillStyle = C.stoneDk; c.fillRect(0, H * 0.58, W, H * 0.42);
      c.fillStyle = C.stone;
      for (let bx = 0; bx < W; bx += 32) {
        c.fillRect(bx, H * 0.58, 22, 14);
      }
    }

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      // Opaque dark overlay (no alpha blend — use dark panel)
      c.fillStyle = '#080618'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#0C0820'; c.fillRect(6, 6, W - 12, H - 12);
    }
  }

  /* ======================== MENU ========================= */
  // Five folio manuscript pages in a pentagon arrangement on Elsinore's hall
  const PAGE_RECTS = [
    { x:   4, y: 108, w: 124, h: 88 },  // Act I   — top-left
    { x: 142, y: 108, w: 124, h: 88 },  // Act II  — top-right
    { x:  73, y: 210, w: 124, h: 88 },  // Act III — center
    { x:   4, y: 314, w: 124, h: 88 },  // Act IV  — bottom-left
    { x: 142, y: 314, w: 124, h: 88 },  // Act V   — bottom-right
  ];

  const ACT_NAMES = ['ACT I','ACT II','ACT III','ACT IV','ACT V'];
  const PAGE_TINTS = ['#C8B880','#C4B47A','#CCB882','#C0AC78','#C8B47C'];

  // Draw connector quill-lines between pages (call from menu.title before cards)
  function drawMenuConnectors(api) {
    const c = api.ctx;
    const pairs = [[0,2],[1,2],[2,3],[2,4]];
    for (const [ai, bi] of pairs) {
      const pa = PAGE_RECTS[ai], pb = PAGE_RECTS[bi];
      const ax = pa.x + pa.w / 2, ay = pa.y + pa.h / 2;
      const bx = pb.x + pb.w / 2, by = pb.y + pb.h / 2;
      const dx = bx - ax, dy = by - ay;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len, ny = dy / len;
      // Dotted ink path
      for (let d = 32; d < len - 32; d += 10) {
        const even = Math.floor(d / 10) % 2 === 0;
        c.fillStyle = even ? C.brown : C.gold;
        c.fillRect(ax + nx * d - 1, ay + ny * d - 1, even ? 4 : 3, even ? 4 : 3);
      }
    }
  }

  function drawPageHeader(api, respectVal) {
    const g = api.gfx, c = api.ctx, W = api.W;
    // Dark velvet header panel
    c.fillStyle = C.velvet; c.fillRect(0, 0, W, 102);
    c.fillStyle = C.purple; c.fillRect(0, 98, W, 4);
    c.fillStyle = C.gold;   c.fillRect(0, 0, W, 3);
    // Corner flourishes
    for (const [ox, sw] of [[4, 1], [W - 14, -1]]) {
      c.fillStyle = C.gold;
      c.fillRect(ox, 4,  sw > 0 ? 10 : -10, 2); c.fillRect(ox, 4, 2, 10);
      c.fillRect(ox, 92, sw > 0 ? 10 : -10, 2); c.fillRect(ox, 84, 2, 10);
    }
    // Crown ornament
    const ccx = W / 2;
    c.fillStyle = C.gold;
    c.fillRect(ccx - 14, 8, 28, 6); // base
    c.fillRect(ccx - 10, 3, 6, 8);  // left prong
    c.fillRect(ccx - 3,  0, 7, 12); // center prong
    c.fillRect(ccx + 4,  3, 6, 8);  // right prong
    g.circle(ccx - 7,  2, 2, C.crimBrt);
    g.circle(ccx + 1,  -1, 2, C.goldBrt);
    g.circle(ccx + 7,  2, 2, C.purpLt);
    // Titles
    api.txtCFit('HAMLET', W / 2, 18, 14, C.goldBrt, true);
    api.txtC('THE PRINCE OF DENMARK', W / 2, 38, 8, C.ghostWh, false);
    api.txtC('WILLIAM SHAKESPEARE  c.1600', W / 2, 54, 7, C.fog, false);
    api.txtC('HONOUR  ' + respectVal, W / 2, 70, 8, C.gold, false);
    api.txtC('CHOOSE YOUR ACT', W / 2, 86, 7, C.parch, false);
    // Draw connectors behind cards
    drawMenuConnectors(api);
  }

  function drawFolioCard(api, info) {
    const { ch, i, x, y, w, h, sel, done } = info;
    const g = api.gfx, c = api.ctx;
    const cx = x + w / 2, cy = y + h / 2;
    const t = api.t;
    const parchCol = PAGE_TINTS[i];

    // Aged parchment background
    c.fillStyle = sel ? '#E8D8A8' : parchCol;
    c.fillRect(x + 2, y + 2, w - 4, h - 4);
    // Ink-smear texture hints (corner triangles via small dots)
    c.fillStyle = '#A09060';
    c.fillRect(x + 3, y + 3, 4, 1); c.fillRect(x + 3, y + 3, 1, 4);
    c.fillRect(x + w - 7, y + 3, 4, 1); c.fillRect(x + w - 4, y + 3, 1, 4);
    c.fillRect(x + 3, y + h - 4, 4, 1); c.fillRect(x + 3, y + h - 8, 1, 5);
    c.fillRect(x + w - 7, y + h - 4, 4, 1); c.fillRect(x + w - 4, y + h - 8, 1, 5);

    // Dark ink border
    c.fillStyle = sel ? C.crimson : '#302010';
    c.fillRect(x, y, w, 3);
    c.fillRect(x, y + h - 3, w, 3);
    c.fillRect(x, y, 3, h);
    c.fillRect(x + w - 3, y, 3, h);
    // Inner rule
    c.fillStyle = sel ? C.crimBrt : C.gold;
    c.fillRect(x + 6, y + 6, w - 12, 1);
    c.fillRect(x + 6, y + h - 7, w - 12, 1);

    // Act heading
    api.txtCFit(ACT_NAMES[i], cx, y + 9, 7, sel ? C.crimBrt : '#302010', true);
    // Rule under act
    c.fillStyle = '#504030'; c.fillRect(x + 8, y + 21, w - 16, 1);

    // Chapter icon
    if (ch.icon) ch.icon(api, cx, cy - 4);

    // Chapter name
    api.txtCFit(ch.name || '', cx, y + h - 22, 7, sel ? '#200010' : '#402810', true, w - 12);
    if (ch.sub) api.txtCFit(ch.sub, cx, y + h - 11, 6, sel ? C.crimson : '#604020', true, w - 12);

    // Done wax seal
    if (done) {
      g.circle(x + w - 13, y + 13, 10, C.crimBrt);
      g.circle(x + w - 13, y + 13, 7, C.crimson);
      api.txtC('✓', x + w - 13, y + 7, 8, C.cream, false);
    }

    // Selection blink border
    if (sel) {
      const pulse = Math.floor(t * 4) % 2;
      if (pulse) {
        c.fillStyle = C.crimBrt;
        c.fillRect(x, y, w, 3);
        c.fillRect(x, y + h - 3, w, 3);
        c.fillRect(x, y, 3, h);
        c.fillRect(x + w - 3, y, 3, h);
      }
    }
  }

  /* ========================== CHAPTERS ========================== */

  /* ---------- CHAPTER 1: THE GHOST'S OATH ----------
   * Dodge spectral sweeps on the battlements; collect 5 golden message tokens.
   * Tokens spawn one at a time every ~3.5s. Pacing: ~18-25s.
   */
  const chGhost = {
    id: 'ghost',
    name: "THE GHOST'S OATH",
    sub: 'Battlements at midnight',
    intro: [
      '"I am thy father\'s spirit,',
      'doomed to walk the night.',
      'Hear me! Revenge my',
      'foul and unnatural',
      'murder..."',
      '',
      'Dodge the ghost\'s sweeps.',
      'Collect his 5 messages.',
    ],
    quote: '"Revenge his foul and most unnatural murder." — The Ghost, Act I',
    help: 'Move LEFT/RIGHT to dodge the spectral sweeps. Catch GOLD message tokens — collect 5 to hear the oath. 3 lives.',
    winText: "The Ghost's full oath is heard!",
    loseText: 'The spirit vanishes into dawn...',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Ghost wisp with crown
      c.fillStyle = C.ghostWh;
      c.fillRect(x - 9, y - 12, 18, 18);
      c.fillRect(x - 7, y - 16, 14, 6);
      c.fillRect(x - 9, y + 6, 5, 7);
      c.fillRect(x - 2, y + 4, 5, 9);
      c.fillRect(x + 4, y + 6, 5, 7);
      c.fillStyle = C.night;
      c.fillRect(x - 6, y - 8, 4, 4);
      c.fillRect(x + 2, y - 8, 4, 4);
      // Crown
      c.fillStyle = C.gold;
      c.fillRect(x - 7, y - 20, 14, 4);
      c.fillRect(x - 5, y - 24, 4, 5);
      c.fillRect(x + 1, y - 24, 4, 5);
    },
    init(api) {
      this.px = api.W / 2;
      this.lives = 3;
      this.tokens = 0;
      this.runT = 0;
      this.iframes = 0;
      this.sweeps = [];
      this.spawnSweepT = 1.4;
      this.activeToken = null;
      this.nextTokenT = 1.0; // first token appears quickly
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      if (this.iframes > 0) this.iframes -= dt;

      // Move player left/right
      const spd = 158;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.pointer.down) {
        const dx = api.pointer.x - this.px;
        this.px += Math.sign(dx) * Math.min(Math.abs(dx) * 3.5 * dt, spd * dt);
      }
      this.px = clamp(this.px, 14, W - 14);

      // Spawn ghost sweeps
      this.spawnSweepT -= dt;
      if (this.spawnSweepT <= 0) {
        const lanes = [H * 0.32, H * 0.48, H * 0.62];
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        const fromLeft = Math.random() < 0.5;
        const baseSpd = 130 + this.runT * 3;
        this.sweeps.push({
          x: fromLeft ? -70 : W + 70,
          y: lane,
          vx: fromLeft ? baseSpd : -baseSpd,
          phase: Math.random() * 6.28,
        });
        this.spawnSweepT = 1.1 + Math.random() * 0.7;
      }

      // Move sweeps
      for (const s of this.sweeps) {
        s.x += s.vx * dt;
        // Subtle vertical wobble via discrete steps (NES-like)
        s.y += (Math.sin(this.runT * 2.2 + s.phase) > 0 ? 0.3 : -0.3);
      }
      this.sweeps = this.sweeps.filter(s => s.x > -130 && s.x < W + 130);

      // Spawn next token (one at a time; next appears after collect or 8s timeout)
      if (!this.activeToken) {
        this.nextTokenT -= dt;
        if (this.nextTokenT <= 0) {
          this.activeToken = {
            x: 20 + Math.random() * (W - 40),
            y: H * 0.28 + Math.random() * H * 0.28,
            life: 0,
            timeout: 9.0,
          };
        }
      } else {
        this.activeToken.life += dt;
        this.activeToken.timeout -= dt;
        if (this.activeToken.timeout <= 0) {
          // Token expired — respawn after a pause
          this.activeToken = null;
          this.nextTokenT = 2.0;
        }
      }

      // Detect ghost sweep collision with player
      const playerY = H - 60;
      if (this.iframes <= 0) {
        for (const s of this.sweeps) {
          if (Math.abs(s.x - this.px) < 30 && Math.abs(s.y - playerY) < 24) {
            this.lives--;
            this.iframes = 1.0;
            api.shake(5, 0.25);
            api.flash(C.ghostWh, 0.22);
            api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
        }
      }

      // Collect token
      if (this.activeToken) {
        const tk = this.activeToken;
        if (Math.abs(tk.x - this.px) < 22 && Math.abs(tk.y - playerY) < 22) {
          this.activeToken = null;
          this.tokens++;
          this.nextTokenT = 3.2 + Math.random() * 0.6;
          api.addScore(80);
          api.audio.sfx('coin');
          api.burst(tk.x, tk.y, C.goldBrt, 10);
          if (this.tokens >= 5) { api.addScore(300); api.win(); return; }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Night sky
      c.fillStyle = '#040810'; c.fillRect(0, 0, W, H);
      // Stars
      c.fillStyle = C.ghostWh;
      for (let s = 0; s < 24; s++) {
        c.fillRect((s * 53 + 11) % W, (s * 37 + 7) % (H * 0.52), 2, 2);
      }
      // Crescent moon
      g.circle(W - 40, 28, 18, C.ghostDm);
      g.circle(W - 32, 22, 14, '#040810');

      // Castle walls flanking
      c.fillStyle = C.stoneDk;
      c.fillRect(0, H * 0.18, 18, H * 0.82);
      c.fillRect(W - 18, H * 0.18, 18, H * 0.82);
      c.fillStyle = C.stone;
      c.fillRect(0, H * 0.20, 18, 2); c.fillRect(0, H * 0.30, 18, 2);
      c.fillRect(W - 18, H * 0.20, 18, 2); c.fillRect(W - 18, H * 0.30, 18, 2);

      // Battlement floor
      c.fillStyle = C.stoneDk; c.fillRect(0, H * 0.68, W, H * 0.32);
      c.fillStyle = C.stone;
      for (let bx = 18; bx < W - 18; bx += 32) {
        c.fillRect(bx, H * 0.60, 22, 14);
      }
      // Floor stone cracks
      c.fillStyle = C.stoneDk;
      for (let lx = 18; lx < W - 18; lx += 30) c.fillRect(lx, H * 0.72, 1, H * 0.28);
      for (let ly = H * 0.70; ly < H; ly += 24) c.fillRect(18, ly, W - 36, 1);

      // Ghost sweeps
      for (const s of this.sweeps) {
        const blink = Math.floor(this.runT * 8) % 2;
        const col = blink ? C.ghostWh : C.ghostDm;
        c.fillStyle = col;
        // Main ghost body
        c.fillRect(s.x - 30, s.y - 16, 60, 32);
        c.fillRect(s.x - 24, s.y - 22, 48, 10);
        c.fillRect(s.x - 18, s.y - 28, 36, 8);
        // Wispy trails at bottom
        c.fillRect(s.x - 30, s.y + 16, 14, 10);
        c.fillRect(s.x - 12, s.y + 14, 14, 12);
        c.fillRect(s.x +  4, s.y + 16, 14, 10);
        c.fillRect(s.x + 18, s.y + 14, 14, 12);
        // Dark eye sockets
        c.fillStyle = '#040810';
        c.fillRect(s.x - 20, s.y - 10, 12, 9);
        c.fillRect(s.x +  8, s.y - 10, 12, 9);
        // Glowing eyes
        c.fillStyle = C.ghostWh;
        c.fillRect(s.x - 18, s.y - 8, 8, 5);
        c.fillRect(s.x + 10, s.y - 8, 8, 5);
        // Crown on ghost
        c.fillStyle = C.gold;
        c.fillRect(s.x - 14, s.y - 34, 28, 6);
        c.fillRect(s.x - 10, s.y - 40, 5, 7);
        c.fillRect(s.x - 3,  s.y - 42, 7, 9);
        c.fillRect(s.x + 5,  s.y - 40, 5, 7);
      }

      // Active token (golden floating scroll)
      if (this.activeToken) {
        const tk = this.activeToken;
        const bob = Math.floor(tk.life * 3) % 2;
        const ty = tk.y + (bob ? 2 : 0);
        // Parchment scroll
        c.fillStyle = C.parch;
        c.fillRect(tk.x - 9, ty - 10, 18, 18);
        c.fillStyle = C.tan;
        c.fillRect(tk.x - 10, ty - 10, 3, 18);
        c.fillRect(tk.x +  7, ty - 10, 3, 18);
        // Gold seal dot
        c.fillStyle = C.goldBrt;
        g.circle(tk.x, ty + 2, 4, C.goldBrt);
        // Outline
        c.fillStyle = C.gold;
        c.fillRect(tk.x - 9, ty - 10, 18, 2);
        c.fillRect(tk.x - 9, ty + 6, 18, 2);
      }

      // Player (Hamlet — dark cloak, moving on battlements)
      const py = H - 60;
      const step = Math.floor(this.runT * 7) % 2;
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        // Cape
        c.fillStyle = C.royDk;
        c.fillRect(this.px - 14, py - 8, 28, 24);
        c.fillRect(this.px - 16, py,  32, 16);
        // Body
        c.fillStyle = C.castle;
        c.fillRect(this.px - 8, py - 6, 16, 20);
        // Head
        g.circle(this.px, py - 18, 9, C.parch);
        c.fillStyle = C.night;
        c.fillRect(this.px - 9, py - 26, 18, 10); // dark hair
        // Sword
        c.fillStyle = C.silver;
        c.fillRect(this.px + 10, py - 3, 2, 20);
        c.fillStyle = C.gold;
        c.fillRect(this.px + 7, py + 4, 8, 3);
        // Legs
        c.fillStyle = C.castle;
        if (step) {
          c.fillRect(this.px - 5, py + 14, 5, 12);
          c.fillRect(this.px + 1, py + 14, 5, 14);
        } else {
          c.fillRect(this.px - 5, py + 14, 5, 14);
          c.fillRect(this.px + 1, py + 14, 5, 12);
        }
        // Boots
        c.fillStyle = C.brown;
        c.fillRect(this.px - 6, py + 22, 6, 6);
        c.fillRect(this.px + 1, py + 22, 6, 6);
      }

      // Top bar
      api.topBar("GHOST'S OATH  TOKENS " + this.tokens + '/5');
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i < this.lives ? C.ghostWh : C.stoneDk;
        c.fillRect(W - 14 - i * 16, 3, 12, 10);
      }
    },
  };

  /* ---------- CHAPTER 2: THE MOUSETRAP ----------
   * Timing meter — tap in the gold zone 6 times to expose Claudius.
   * Needle starts at 0.40 cycles/s (slow); zone 36–64%. Pacing: ~15-20s.
   */
  const chMousetrap = {
    id: 'mousetrap',
    name: 'THE MOUSETRAP',
    sub: "Catch the King's conscience",
    intro: [
      '"The play\'s the thing',
      'wherein I\'ll catch',
      'the conscience',
      'of the King!"',
      '',
      'Signal the actors at',
      'the perfect moment to',
      'expose Claudius.',
    ],
    quote: '"The lady doth protest too much, methinks." — Act III',
    help: 'TAP or press A when the needle hits the GOLD zone! 6 perfect cues expose the King. 4 misses = curtain falls.',
    winText: 'Claudius starts from his seat — guilty!',
    loseText: "The King suspects nothing. Hamlet's plan fails.",
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Comedy / tragedy mask pair
      g.circle(x - 8, y - 2, 7, C.parch);
      c.fillStyle = C.night;
      c.fillRect(x - 12, y + 3, 9, 2); c.fillRect(x - 12, y + 5, 2, 3); c.fillRect(x - 4, y + 5, 2, 3);
      g.circle(x + 8, y - 2, 7, C.crimBrt);
      c.fillStyle = C.night;
      c.fillRect(x + 2, y + 5, 9, 2); c.fillRect(x + 2, y + 3, 2, 3); c.fillRect(x + 9, y + 3, 2, 3);
      // Stage curtain bar
      c.fillStyle = C.crimson; c.fillRect(x - 12, y - 12, 24, 4);
    },
    init(api) {
      this.beats = 0;
      this.misses = 0;
      this.needle = 0;
      this.needleDir = 1;
      this.speed = 0.40;
      this.runT = 0;
      this.hitFeedback = 0;
      this.suspicion = 0;
      this.beatCooldown = 0;  // must wait between valid beats
    },
    update(api, dt) {
      this.runT += dt;
      this.needle += this.needleDir * this.speed * dt;
      if (this.needle >= 1) { this.needle = 1; this.needleDir = -1; }
      if (this.needle <= 0) { this.needle = 0; this.needleDir =  1; }
      if (this.hitFeedback > 0) this.hitFeedback -= dt;
      if (this.hitFeedback < 0) this.hitFeedback += dt;
      if (this.beatCooldown > 0) this.beatCooldown -= dt;

      const tapped = api.keyPressed('a') || api.keyPressed('up') || api.pointer.justDown;
      if (tapped) {
        if (this.beatCooldown > 0) {
          // Too soon — minor penalty flash but no miss counted
          api.flash(C.fog, 0.10);
          return;
        }
        // Zone: 36%–64% (tightens to 38-62% after 3 beats)
        const zoneHalf = this.beats < 3 ? 0.14 : 0.12;
        const inZone = this.needle >= 0.50 - zoneHalf && this.needle <= 0.50 + zoneHalf;
        if (inZone) {
          this.beats++;
          this.hitFeedback = 0.55;
          this.beatCooldown = 1.4;  // minimum 1.4s between valid beats → 6 beats = ~8.4s min
          this.suspicion = Math.min(1, this.suspicion + 0.17);
          api.addScore(90);
          api.audio.sfx('coin');
          api.burst(api.W / 2, api.H * 0.56, C.goldBrt, 10);
          this.speed = 0.40 + this.beats * 0.045;
          if (this.beats >= 6) { api.addScore(400); api.win(); return; }
        } else {
          this.misses++;
          this.beatCooldown = 0.5;  // small cooldown even on miss
          this.hitFeedback = -0.45;
          api.shake(3, 0.2);
          api.flash(C.crimBrt, 0.18);
          api.audio.sfx('hurt');
          if (this.misses >= 4) { api.lose(); return; }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Theater interior — dark velvet hall
      c.fillStyle = '#120010'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#201020'; c.fillRect(0, H * 0.42, W, H * 0.58);
      c.fillStyle = '#2A1828'; c.fillRect(0, H * 0.42, W, 8);
      // Velvet curtains
      c.fillStyle = C.crimson;
      c.fillRect(0, 0, 22, H * 0.44);
      c.fillRect(W - 22, 0, 22, H * 0.44);
      c.fillStyle = C.blood;
      for (let cy = 0; cy < H * 0.44; cy += 22) {
        c.fillRect(9, cy, 7, 16);
        c.fillRect(W - 16, cy, 7, 16);
      }
      // Gold curtain rod
      c.fillStyle = C.gold;
      c.fillRect(0, 0, W, 4);
      c.fillRect(0, H * 0.42, W, 4);

      // Stage actors (three figures mid-stage)
      const actorData = [
        { x: W * 0.22, col: C.gold,    lbl: 'PLAYER-KING' },
        { x: W * 0.50, col: C.ghostWh, lbl: 'GHOST'       },
        { x: W * 0.78, col: C.rose,    lbl: 'QUEEN'       },
      ];
      for (const a of actorData) {
        g.circle(a.x, H * 0.54, 8, a.col);
        c.fillStyle = a.col;
        c.fillRect(a.x - 7, H * 0.62, 14, 18);
        api.txtC(a.lbl, a.x, H * 0.81, 6, a.col, false);
      }

      // Claudius watching from upper right box
      const susFlash = this.suspicion > 0.55 && Math.floor(this.runT * 5) % 2;
      const kCol = susFlash ? C.crimBrt : C.royal;
      g.circle(W * 0.88, H * 0.26, 10, kCol);
      c.fillStyle = kCol; c.fillRect(W * 0.88 - 8, H * 0.36, 16, 18);
      // Crown
      c.fillStyle = C.gold;
      c.fillRect(W * 0.88 - 7, H * 0.20, 14, 5);
      c.fillRect(W * 0.88 - 5, H * 0.15, 4, 7);
      c.fillRect(W * 0.88 - 1, H * 0.13, 4, 9);
      c.fillRect(W * 0.88 + 3, H * 0.15, 4, 7);
      api.txtC('CLAUDIUS', W * 0.88, H * 0.56, 6, C.fog, false);

      // Suspicion meter (top right mini)
      api.txtC('GUILT', W - 50, 5, 7, C.parch, false);
      c.fillStyle = C.stoneDk; c.fillRect(W - 50, 16, 40, 7);
      c.fillStyle = C.crimBrt; c.fillRect(W - 50, 16, Math.round(40 * this.suspicion), 7);

      // Timing meter
      const mX = W / 2 - 88, mY = H * 0.68, mW = 176, mH = 30;
      c.fillStyle = C.velvet; c.fillRect(mX - 3, mY - 3, mW + 6, mH + 6);
      c.fillStyle = C.stoneDk; c.fillRect(mX, mY, mW, mH);
      // Red zones
      c.fillStyle = C.blood;
      c.fillRect(mX, mY, mW * 0.36, mH);
      c.fillRect(mX + mW * 0.64, mY, mW * 0.36, mH);
      // Gold zone
      c.fillStyle = this.hitFeedback > 0 ? C.goldBrt : C.gold;
      c.fillRect(mX + mW * 0.36, mY, mW * 0.28, mH);
      if (this.hitFeedback < 0) {
        c.fillStyle = C.crimBrt;
        c.fillRect(mX + mW * 0.36, mY, mW * 0.28, mH);
      }
      // Meter border
      c.fillStyle = C.goldBrt;
      c.fillRect(mX - 3, mY - 3, mW + 6, 3);
      c.fillRect(mX - 3, mY + mH, mW + 6, 3);
      // Needle
      const nx = mX + this.needle * mW;
      c.fillStyle = C.white;
      c.fillRect(nx - 2, mY - 5, 4, mH + 10);

      // Instruction
      api.txtC('TAP IN THE GOLD ZONE!', W / 2, H * 0.62, 8, C.parch, false);

      // Beats progress (gold dots)
      const dotX = W / 2 - (6 * 14) / 2;
      for (let i = 0; i < 6; i++) {
        c.fillStyle = i < this.beats ? C.goldBrt : C.stoneDk;
        c.fillRect(dotX + i * 14, H * 0.86, 10, 10);
      }

      api.topBar('MOUSETRAP  CUES ' + this.beats + '/6');
      for (let mi = 0; mi < 4; mi++) {
        c.fillStyle = mi < this.misses ? C.crimBrt : C.stoneDk;
        c.fillRect(W - 14 - mi * 14, 3, 10, 10);
      }
    },
  };

  /* ---------- CHAPTER 3: BEHIND THE ARRAS ----------
   * Free-movement stealth: collect 6 royal seals, avoid 3 guard torch-cones.
   * Guards scan back and forth. Pacing: ~20-30s.
   */
  const chArras = {
    id: 'arras',
    name: 'BEHIND THE ARRAS',
    sub: "Spy on Gertrude's chamber",
    intro: [
      '"How now! A rat? Dead',
      'for a ducat, dead!"',
      '',
      'Polonius hides behind',
      'the arras. Guard cones',
      'sweep the chamber.',
      'Collect 6 royal seals',
      'without being caught!',
    ],
    quote: '"O, I am slain!" — Polonius, Act III',
    help: 'Move freely (drag/arrows). Collect GOLD wax seals. Stay out of the guard LIGHT CONES — caught 3 times = discovered. 6 seals to win.',
    winText: 'All royal secrets gathered!',
    loseText: 'Discovered! Polonius raises the alarm.',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Tapestry arras (red drape with gold pattern)
      c.fillStyle = C.crimson;
      c.fillRect(x - 10, y - 14, 20, 26);
      c.fillStyle = C.gold;
      for (let gy = y - 10; gy < y + 10; gy += 6) c.fillRect(x - 8, gy, 16, 2);
      c.fillStyle = C.stoneDk; c.fillRect(x - 12, y - 16, 24, 3); // rod
      // Peering eye behind arras
      g.circle(x + 6, y - 2, 4, C.parch);
      c.fillStyle = C.night; g.circle(x + 6, y - 2, 2, C.night);
    },
    _makeSecrets(W, H) {
      return [
        { x: W * 0.15, y: H * 0.28, collected: false },
        { x: W * 0.85, y: H * 0.28, collected: false },
        { x: W * 0.50, y: H * 0.20, collected: false },
        { x: W * 0.20, y: H * 0.70, collected: false },
        { x: W * 0.80, y: H * 0.70, collected: false },
        { x: W * 0.50, y: H * 0.78, collected: false },
      ];
    },
    init(api) {
      const W = api.W, H = api.H;
      this.px = W / 2;
      this.py = H * 0.55;
      this.lives = 3;
      this.secrets = 0;
      this.runT = 0;
      this.iframes = 0;
      this.bobT = 0;
      this.secretList = this._makeSecrets(W, H);
      this.guards = [
        { x: W * 0.14, y: H * 0.38, angle: 0,           dir: 1,  speed: 0.85, arc: 0.35 },
        { x: W * 0.86, y: H * 0.38, angle: Math.PI,      dir: -1, speed: 0.70, arc: 0.35 },
        { x: W * 0.50, y: H * 0.54, angle: Math.PI * 1.5, dir: 1, speed: 1.0,  arc: 0.30 },
      ];
      this.baseAngles = this.guards.map(g => g.angle);
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      this.bobT  += dt;
      if (this.iframes > 0) this.iframes -= dt;

      // Player movement
      const spd = 126;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.keyDown('up'))    this.py -= spd * dt;
      if (api.keyDown('down'))  this.py += spd * dt;
      if (api.pointer.down) {
        const dx = api.pointer.x - this.px, dy = api.pointer.y - this.py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 8) {
          this.px += (dx / dist) * spd * dt;
          this.py += (dy / dist) * spd * dt;
        }
      }
      this.px = clamp(this.px, 14, W - 14);
      this.py = clamp(this.py, 28, H - 24);

      // Update guard angles
      for (let gi = 0; gi < this.guards.length; gi++) {
        const guard = this.guards[gi];
        const base = this.baseAngles[gi];
        guard.angle += guard.dir * guard.speed * dt;
        if (Math.abs(guard.angle - base) > guard.arc * Math.PI) guard.dir *= -1;
      }

      // Collect secrets
      for (const s of this.secretList) {
        if (s.collected) continue;
        if (Math.abs(s.x - this.px) < 20 && Math.abs(s.y - this.py) < 20) {
          s.collected = true;
          this.secrets++;
          api.addScore(80);
          api.audio.sfx('coin');
          api.burst(s.x, s.y, C.goldBrt, 8);
          if (this.secrets >= 6) { api.addScore(300); api.win(); return; }
        }
      }

      // Guard cone detection (pixel-exact: check if player is within cone)
      if (this.iframes <= 0) {
        for (const guard of this.guards) {
          const dx = this.px - guard.x, dy = this.py - guard.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 4) { dist; }
          if (dist > 0 && dist < 96) {
            const toAngle = Math.atan2(dy, dx);
            const diff = Math.abs(((toAngle - guard.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2));
            const normDiff = diff > Math.PI ? Math.PI * 2 - diff : diff;
            if (normDiff < 0.40) {
              this.lives--;
              this.iframes = 1.2;
              api.shake(5, 0.28);
              api.flash(C.candle, 0.22);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Gertrude's chamber — rich tapestries, candlelit
      c.fillStyle = '#180C20'; c.fillRect(0, 0, W, H);
      // Tapestry back wall
      c.fillStyle = '#1A0C28'; c.fillRect(0, 0, W, H * 0.78);
      // Three tapestry panels
      const tapCols = [C.royal, C.crimson, C.purple];
      for (let ti = 0; ti < 3; ti++) {
        const tx = W * 0.14 + ti * W * 0.33;
        c.fillStyle = tapCols[ti];
        c.fillRect(tx - 18, 0, 36, H * 0.76);
        c.fillStyle = C.gold;
        c.fillRect(tx - 19, 0, 2, H * 0.76);
        c.fillRect(tx + 17, 0, 2, H * 0.76);
        // Pattern stripes
        c.fillStyle = tapCols[(ti + 1) % 3];
        for (let ty = 16; ty < H * 0.76; ty += 28) c.fillRect(tx - 14, ty, 28, 6);
      }
      // Gold rod at top of tapestries
      c.fillStyle = C.gold; c.fillRect(0, 0, W, 4);
      // Stone floor
      c.fillStyle = C.stoneDk; c.fillRect(0, H * 0.78, W, H * 0.22);
      c.fillStyle = C.stone;
      for (let lx = 0; lx < W; lx += 28) c.fillRect(lx, H * 0.78, 1, H * 0.22);
      for (let ly = H * 0.78; ly < H; ly += 22) c.fillRect(0, ly, W, 1);
      // Carpet
      c.fillStyle = C.velvet; c.fillRect(W * 0.14, H * 0.80, W * 0.72, H * 0.14);
      c.fillStyle = C.purple;
      c.fillRect(W * 0.16, H * 0.81, W * 0.68, H * 0.12);
      // Carpet pattern
      c.fillStyle = C.gold;
      for (let cx = W * 0.22; cx < W * 0.78; cx += 18) c.fillRect(cx, H * 0.84, 4, 4);

      // Guard cones — pixel-art spotlight (dithered dots without alpha)
      for (const guard of this.guards) {
        const CONE = 94, HALF = 0.40;
        // Draw dithered cone as a grid of dots
        const ca = Math.cos(guard.angle), sa = Math.sin(guard.angle);
        const cx2 = Math.cos(guard.angle + Math.PI / 2), sy2 = Math.sin(guard.angle + Math.PI / 2);
        for (let d = 10; d < CONE; d += 8) {
          const spread = d * Math.tan(HALF);
          const density = d < 40 ? 6 : 10; // more sparse further out
          for (let w = -spread; w <= spread; w += density) {
            const dot = Math.floor(d / 8 + w / density) % 2 === 0;
            if (!dot) continue;
            const px2 = guard.x + ca * d + cx2 * w;
            const py2 = guard.y + sa * d + sy2 * w;
            if (px2 < 0 || px2 > W || py2 < 0 || py2 > H) continue;
            c.fillStyle = d < 40 ? C.candle : C.amber;
            c.fillRect(px2 - 1, py2 - 1, 3, 3);
          }
        }

        // Guard sprite
        g.circle(guard.x, guard.y - 12, 7, C.parch);
        c.fillStyle = '#302840';
        c.fillRect(guard.x - 6, guard.y - 5, 12, 16);
        // Lantern in hand
        const lx = guard.x + Math.cos(guard.angle) * 16;
        const ly = guard.y + Math.sin(guard.angle) * 16;
        c.fillStyle = C.tan;  c.fillRect(lx - 4, ly - 5, 8, 9);
        c.fillStyle = C.candle; c.fillRect(lx - 2, ly - 8, 4, 4);
        const flk2 = Math.floor(this.runT * 7) % 2;
        c.fillStyle = flk2 ? C.orange : C.gold;
        c.fillRect(lx - 1, ly - 11, 2, 4);
      }

      // Secrets (wax seals — circular with S stamp)
      for (const s of this.secretList) {
        if (s.collected) continue;
        const bob = Math.floor(this.bobT * 2.8 + s.x) % 2;
        const sy = s.y + (bob ? 2 : 0);
        g.circle(s.x, sy, 9, C.crimBrt);
        g.circle(s.x, sy, 6, C.crimson);
        api.txtC('S', s.x, sy - 4, 7, C.gold, false);
      }

      // Player (Hamlet sneaking — crouched, dark cloak)
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        const px = this.px, py = this.py;
        c.fillStyle = C.royDk;
        c.fillRect(px - 12, py - 8, 24, 20);
        g.circle(px, py - 16, 8, C.parch);
        c.fillStyle = C.night;
        c.fillRect(px - 9, py - 22, 18, 8);
      }

      api.topBar('ARRAS  SEALS ' + this.secrets + '/6');
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i < this.lives ? C.parch : C.stoneDk;
        c.fillRect(W - 14 - i * 16, 3, 12, 10);
      }
    },
  };

  /* ---------- CHAPTER 4: OPHELIA'S FLOWERS ----------
   * Catch rosemary (gold) & pansies (purple). Avoid fennel (green) & rue (red).
   * Need 8 good flowers. Pacing: ~14-20s.
   */
  const FLOWER_TYPES = [
    { name: 'rosemary', col: '#D8D040', bad: false },
    { name: 'pansy',    col: '#6040C0', bad: false },
    { name: 'fennel',   col: '#28A030', bad: true  },
    { name: 'rue',      col: '#C83020', bad: true  },
  ];

  const chOphelia = {
    id: 'ophelia',
    name: "OPHELIA'S FLOWERS",
    sub: 'Gather the true blossoms',
    intro: [
      '"There\'s rosemary,',
      'that\'s for remembrance;',
      'and there is pansies,',
      'that\'s for thoughts.',
      '"There\'s rue for you..."',
      '',
      'Catch GOLD & PURPLE',
      'flowers. Avoid GREEN & RED.',
    ],
    quote: '"There\'s rue for you; and here\'s some for me." — Ophelia, Act IV',
    help: 'Move LEFT/RIGHT. Catch GOLD (rosemary) and PURPLE (pansies) flowers. Avoid GREEN (fennel) and RED (rue). Collect 8 to win. 3 lives.',
    winText: "Ophelia's true gifts received!",
    loseText: 'The flowers are lost to the stream...',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Bouquet of 4 colored flowers
      for (let fi = 0; fi < 4; fi++) {
        const a = (fi / 4) * Math.PI * 2;
        const fx = x + Math.cos(a) * 9;
        const fy = y - 2 + Math.sin(a) * 9;
        g.circle(fx, fy, 4, FLOWER_TYPES[fi].col);
      }
      g.circle(x, y - 2, 4, C.parch);
      c.fillStyle = C.green;
      c.fillRect(x - 1, y + 6, 3, 10);
    },
    init(api) {
      this.px = api.W / 2;
      this.lives = 3;
      this.caught = 0;
      this.flowers = [];
      this.spawnT = 0.6;
      this.runT = 0;
      this.iframes = 0;
      this.opX = api.W * 0.5;
      this.opDir = 1;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      if (this.iframes > 0) this.iframes -= dt;

      // Player
      const spd = 152;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.pointer.down) {
        const dx = api.pointer.x - this.px;
        this.px += Math.sign(dx) * Math.min(Math.abs(dx) * 3.5 * dt, spd * dt);
      }
      this.px = clamp(this.px, 14, W - 14);

      // Ophelia drifts
      this.opX += this.opDir * 46 * dt;
      if (this.opX > W - 28) this.opDir = -1;
      if (this.opX < 28) this.opDir = 1;

      // Spawn flowers
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        const f = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
        this.flowers.push({
          x: this.opX + (Math.random() - 0.5) * 28,
          y: H * 0.20,
          vy: 76 + Math.random() * 32,
          vx: (Math.random() - 0.5) * 24,
          flower: f,
          spin: 0,
        });
        this.spawnT = 0.88 + Math.random() * 0.44;
      }

      // Update flowers
      for (const f of this.flowers) {
        f.y += f.vy * dt;
        f.x += f.vx * dt;
        f.spin += dt;
      }
      this.flowers = this.flowers.filter(f => f.y < H + 20 && f.x > -20 && f.x < W + 20);

      // Catch collision
      const catchY = H - 58;
      if (this.iframes <= 0) {
        for (let j = this.flowers.length - 1; j >= 0; j--) {
          const f = this.flowers[j];
          if (Math.abs(f.x - this.px) < 24 && Math.abs(f.y - catchY) < 22) {
            this.flowers.splice(j, 1);
            if (!f.flower.bad) {
              this.caught++;
              api.addScore(70);
              api.audio.sfx('coin');
              api.burst(f.x, f.y, f.flower.col, 8);
              if (this.caught >= 8) { api.addScore(300); api.win(); return; }
            } else {
              this.lives--;
              this.iframes = 0.8;
              api.shake(4, 0.22);
              api.flash(C.crimBrt, 0.18);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Riverside at dusk
      c.fillStyle = '#181028'; c.fillRect(0, 0, W, H);
      // Sky bands (flat, NES-honest — stacked solid strips)
      c.fillStyle = '#1C1030'; c.fillRect(0, 0, W, H * 0.22);
      c.fillStyle = '#201420'; c.fillRect(0, H * 0.22, W, H * 0.12);
      c.fillStyle = '#241018'; c.fillRect(0, H * 0.34, W, H * 0.08);
      c.fillStyle = '#1A0C14'; c.fillRect(0, H * 0.42, W, H * 0.10);
      // Pale moon
      g.circle(W * 0.16, H * 0.14, 13, '#C8B8A0');
      g.circle(W * 0.20, H * 0.10, 9, '#181028'); // crescent cut
      // Stars
      c.fillStyle = C.ghostWh;
      for (let s = 0; s < 14; s++) c.fillRect((s * 47 + 9) % W, (s * 31 + 5) % (H * 0.20), 2, 2);

      // River (flat blue stripes)
      c.fillStyle = '#102038'; c.fillRect(0, H * 0.52, W, H * 0.22);
      c.fillStyle = '#183050'; c.fillRect(0, H * 0.60, W, H * 0.08);
      // Ripples
      c.fillStyle = '#1C3860';
      for (let rx = 0; rx < W; rx += 20) {
        c.fillRect(rx, H * 0.56, 12, 2);
        c.fillRect(rx + 5, H * 0.64, 10, 2);
      }
      // Floating flowers on water
      const flowPhase = Math.floor(this.runT * 1.4) % 2;
      for (let fw = 0; fw < 4; fw++) {
        const fwx = (fw * 56 + this.runT * 12) % W;
        g.circle(fwx, H * 0.58 + (flowPhase ? 1 : 0), 4, C.rose);
        g.circle(fwx + 18, H * 0.64, 3, '#D8D040');
      }

      // Grassy bank
      c.fillStyle = '#143018'; c.fillRect(0, H * 0.74, W, H * 0.26);
      c.fillStyle = '#1C4020';
      for (let gx = 0; gx < W; gx += 8) {
        const gh = ((gx * 7) % 6) + 4;
        c.fillRect(gx, H * 0.74, 4, gh);
      }

      // Willow tree (right side)
      c.fillStyle = '#183018'; c.fillRect(W - 26, H * 0.36, 6, H * 0.40);
      c.fillStyle = '#205028';
      for (let wb = 0; wb < 9; wb++) {
        c.fillRect(W - 32 + wb * 5, H * 0.30 + wb * 5, 3, H * 0.30);
      }

      // Ophelia (flowing white dress, flowers in hair)
      const ox = this.opX, oy = H * 0.16;
      c.fillStyle = '#D0D8E8';
      c.fillRect(ox - 10, oy, 20, 22);
      c.fillRect(ox - 14, oy + 12, 28, 14);
      g.circle(ox, oy - 8, 9, C.parch);
      // Long flowing hair
      c.fillStyle = '#D8C860';
      c.fillRect(ox - 9, oy - 14, 18, 9);
      for (let hh = 0; hh < 4; hh++) c.fillRect(ox - 9 + hh * 5, oy - 7, 3, 18 + hh * 2);
      // Flower wreath
      for (let fi = 0; fi < 5; fi++) {
        const a = (fi / 5) * Math.PI - Math.PI / 2;
        g.circle(ox + Math.cos(a) * 10, oy - 8 + Math.sin(a) * 7, 3, FLOWER_TYPES[fi % 4].col);
      }

      // Key: what to catch / avoid
      api.txtC('CATCH:', 50, 5, 7, C.parch, false);
      g.circle(88, 9, 5, FLOWER_TYPES[0].col); g.circle(100, 9, 5, FLOWER_TYPES[1].col);
      api.txtC('AVOID:', 128, 5, 7, C.crimBrt, false);
      g.circle(168, 9, 5, FLOWER_TYPES[2].col); g.circle(180, 9, 5, FLOWER_TYPES[3].col);

      // Falling flowers
      for (const f of this.flowers) {
        const sp = Math.floor(f.spin * 4) % 4;
        g.circle(f.x, f.y, 6, f.flower.col);
        g.circle(f.x, f.y, 3, f.flower.bad ? C.stoneDk : C.parch);
        for (let p = 0; p < 4; p++) {
          const a = (p / 4) * Math.PI * 2 + sp * 0.18;
          g.circle(f.x + Math.cos(a) * 7, f.y + Math.sin(a) * 7, 3, f.flower.col);
        }
      }

      // Player basket
      const catchY = H - 58;
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        c.fillStyle = C.royDk;
        c.fillRect(this.px - 9, catchY - 10, 18, 20);
        g.circle(this.px, catchY - 20, 8, C.parch);
        c.fillStyle = C.tan;
        c.fillRect(this.px - 16, catchY - 3, 32, 8);
        c.fillStyle = C.parch; c.fillRect(this.px - 15, catchY - 6, 30, 4);
      }

      api.topBar('FLOWERS  ' + this.caught + '/8 CAUGHT');
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i < this.lives ? C.rose : C.stoneDk;
        c.fillRect(W - 14 - i * 16, 3, 12, 10);
      }
    },
  };

  /* ---------- CHAPTER 5: THE FINAL DUEL ----------
   * Laertes aims at a lane (top/mid/low), then lunges. Player must be in a
   * different lane. After lunge, counter-strike window (tap A or screen).
   * Need 5 counter-strikes. Pacing: ~12-18s.
   */
  const chDuel = {
    id: 'duel',
    name: 'THE FINAL DUEL',
    sub: 'A poisoned blade awaits',
    intro: [
      '"Come, Hamlet, come,',
      'and take this hand',
      'from me..."',
      '',
      'Laertes holds a',
      'POISONED RAPIER.',
      'Watch his AIM then',
      'DODGE — then STRIKE BACK!',
    ],
    quote: '"The rest is silence." — Hamlet, Act V',
    help: 'Watch which lane Laertes aims (HIGH/MID/LOW). Move there with UP/DOWN or TAP the safe zone. After his LUNGE tap STRIKE to counter! 5 hits win. 3 lives.',
    winText: 'Justice is done. The rest is silence.',
    loseText: 'The poisoned blade finds its mark...',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      // Two crossed rapiers
      c.fillStyle = C.silver;
      c.fillRect(x - 14, y - 2, 28, 3); // horizontal blade
      c.fillRect(x - 2, y - 14, 3, 28); // vertical blade
      c.fillStyle = C.gold;
      c.fillRect(x - 9, y - 1, 5, 5); // left crossguard
      c.fillRect(x + 4, y - 1, 5, 5); // right crossguard
      g.circle(x, y - 10, 3, C.greenBr); // poison drop
    },
    _nextRound(api) {
      this.phase = 'aim';
      this.aimT = Math.max(0.8, 1.5 - this.hits * 0.08);
      this.targetLane = Math.floor(Math.random() * 3);
      this.counterWindow = false;
      this.lungeT = 0;
      this.recoverT = 0;
    },
    init(api) {
      this.lives = 3;
      this.hits = 0;
      this.runT = 0;
      this.iframes = 0;
      this.playerLane = 1;
      this.hitFeedback = 0;
      this.strikeBlink = 0;
      this._nextRound(api);
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      if (this.iframes > 0) this.iframes -= dt;
      if (this.hitFeedback > 0) this.hitFeedback -= dt;
      if (this.strikeBlink > 0) this.strikeBlink -= dt;

      // Lane selection — UP/DOWN keys or touch y-position
      if (api.keyPressed('up')   && this.playerLane > 0) this.playerLane--;
      if (api.keyPressed('down') && this.playerLane < 2) this.playerLane++;

      // Phase logic
      if (this.phase === 'aim') {
        // Player can change lane during aim phase
        if (api.pointer.justDown) {
          const frac = api.pointer.y / H;
          if (frac < 0.40) this.playerLane = 0;
          else if (frac > 0.60) this.playerLane = 2;
          else this.playerLane = 1;
        }
        this.aimT -= dt;
        if (this.aimT <= 0) {
          this.phase = 'lunge';
          this.lungeT = 0.28;
          api.audio.sfx('shoot');
        }

      } else if (this.phase === 'lunge') {
        this.lungeT -= dt;
        if (this.lungeT <= 0) {
          // Check if hit
          if (this.playerLane === this.targetLane && this.iframes <= 0) {
            this.lives--;
            this.iframes = 0.9;
            api.shake(6, 0.3);
            api.flash(C.greenBr, 0.28);
            api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
          this.phase = 'recover';
          this.recoverT = 0.55;
          this.counterWindow = true;
          this.strikeBlink = 0.55;
        }

      } else if (this.phase === 'recover') {
        this.recoverT -= dt;
        // Counter-strike: during recover window tap A or tap the STRIKE zone
        const tapped = api.keyPressed('a') || api.keyPressed('start');
        // Touch: tap in top-center strike zone (or anywhere outside lane indicators)
        const touchStrike = api.pointer.justDown && api.pointer.y < H * 0.35;
        if ((tapped || touchStrike) && this.counterWindow) {
          this.counterWindow = false;
          this.hits++;
          this.hitFeedback = 0.5;
          api.addScore(120);
          api.audio.sfx('coin');
          api.burst(W - 60, H * 0.50, C.crimBrt, 12);
          if (this.hits >= 5) { api.addScore(400); api.win(); return; }
        }
        if (this.recoverT <= 0) {
          this.counterWindow = false;
          this._nextRound(api);
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Royal court — dark stone, royal banners, torchlit
      c.fillStyle = '#0C1020'; c.fillRect(0, 0, W, H);
      // Marble floor
      c.fillStyle = C.stoneDk; c.fillRect(0, H * 0.80, W, H * 0.20);
      c.fillStyle = C.stone;
      for (let fx = 0; fx < W; fx += 28) c.fillRect(fx, H * 0.80, 1, H * 0.20);
      for (let fy = H * 0.80; fy < H; fy += 22) c.fillRect(0, fy, W, 1);
      // Stone back wall
      c.fillStyle = '#10182C'; c.fillRect(0, 0, W, H * 0.82);
      // Royal banners
      for (const bx of [W * 0.12, W * 0.50, W * 0.88]) {
        c.fillStyle = C.royDk;
        c.fillRect(bx - 13, 0, 26, H * 0.46);
        c.fillStyle = C.gold;
        c.fillRect(bx - 8, H * 0.10, 16, 14);
        g.circle(bx, H * 0.22, 7, C.gold);
        // Lion body (simplified)
        c.fillStyle = C.amber;
        c.fillRect(bx - 5, H * 0.12, 10, 10);
        c.fillRect(bx - 7, H * 0.14, 5, 6);
        c.fillRect(bx + 2, H * 0.14, 5, 6);
      }
      // Torches
      const flk3 = Math.floor(this.runT * 8) % 2;
      for (const tx of [24, W - 24]) {
        c.fillStyle = C.tan;   c.fillRect(tx - 3, H * 0.38, 6, 18);
        c.fillStyle = C.candle; c.fillRect(tx - 2, H * 0.32, 5, 8);
        c.fillStyle = flk3 ? C.orange : C.gold;
        c.fillRect(tx - 1, H * 0.26, 3, 8);
      }

      // Lane indicator strips on player side (left)
      const LANE_Y = [H * 0.34, H * 0.52, H * 0.70];
      const LANE_NAMES = ['HIGH', 'MID', 'LOW'];
      for (let li = 0; li < 3; li++) {
        const sel = li === this.playerLane;
        c.fillStyle = sel ? C.royal : C.stoneDk;
        c.fillRect(2, LANE_Y[li] - 12, 22, 22);
        api.txtC(LANE_NAMES[li].slice(0, 1), 13, LANE_Y[li] - 8, 8, sel ? C.goldBrt : C.stone, false);
      }

      // Target lane indicator on Laertes' side
      const targetY = LANE_Y[this.targetLane];
      if (this.phase === 'aim') {
        const blink = Math.floor(this.runT * 6) % 2;
        if (blink) {
          c.fillStyle = C.crimBrt;
          c.fillRect(W - 48, targetY - 4, 16, 8);
          // Arrow pointing left
          c.fillRect(W - 56, targetY - 2, 8, 4);
          c.fillRect(W - 64, targetY - 6, 6, 6);
          c.fillRect(W - 64, targetY, 6, 6);
        }
        api.txtC('!', W - 50, targetY - 14, 12, C.crimBrt, false);
      }

      // Laertes (right side — blue and gold outfit)
      const laertesX = W - 46;
      const lunge = this.phase === 'lunge';
      const laertesBodyX = laertesX - (lunge ? 32 : 0);
      // Body
      c.fillStyle = '#304090';
      c.fillRect(laertesBodyX - 10, targetY - 20, 20, 32);
      // Head
      g.circle(laertesBodyX, targetY - 26, 10, C.parch);
      c.fillStyle = '#D8B840'; // blond
      c.fillRect(laertesBodyX - 9, targetY - 34, 18, 10);
      // Rapier
      c.fillStyle = C.silver;
      const swordTip = lunge ? laertesX - 86 : laertesX - 46;
      c.fillRect(swordTip, targetY - 2, laertesBodyX - swordTip - 10, 3);
      c.fillStyle = C.gold;
      c.fillRect(laertesBodyX - 6, targetY - 7, 6, 12); // crossguard
      // Poison tip
      c.fillStyle = C.greenBr;
      c.fillRect(swordTip, targetY - 1, 8, 1);

      // STRIKE prompt
      if (this.phase === 'recover' && this.counterWindow) {
        const bp = Math.floor(this.strikeBlink * 6) % 2;
        if (bp) {
          c.fillStyle = C.goldBrt;
          c.fillRect(W / 2 - 44, H * 0.08, 88, 24);
          api.txtC('STRIKE!', W / 2, H * 0.09, 10, C.night, true);
        }
        // Tap zone cue text (for mobile)
        api.txtC('TAP HERE', W / 2, H * 0.16, 7, C.fog, false);
      }

      // Hamlet (left side — dark cloak)
      const hamletX = 52;
      const hamletY = LANE_Y[this.playerLane];
      const hide = this.iframes > 0 && Math.floor(api.t * 10) % 2;
      if (!hide) {
        // Dark cloak
        c.fillStyle = C.royDk;
        c.fillRect(hamletX - 12, hamletY - 20, 24, 34);
        // Head
        g.circle(hamletX, hamletY - 27, 10, C.parch);
        c.fillStyle = C.night; c.fillRect(hamletX - 9, hamletY - 36, 18, 10);
        // Hamlet's rapier pointing right
        c.fillStyle = C.silver;
        c.fillRect(hamletX + 12, hamletY - 2, 38, 3);
        c.fillStyle = C.gold; c.fillRect(hamletX + 10, hamletY - 7, 4, 12);
        // Counter-strike flash effect
        if (this.hitFeedback > 0 && Math.floor(this.hitFeedback * 8) % 2) {
          c.fillStyle = C.goldBrt;
          c.fillRect(hamletX + 44, hamletY - 8, 16, 16);
        }
      }

      api.topBar('DUEL  HITS ' + this.hits + '/5');
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i < this.lives ? C.ghostWh : C.stoneDk;
        c.fillRect(W - 14 - i * 16, 3, 12, 10);
      }
    },
  };

  /* ========================== RETROSAGA CREATE ========================== */
  RetroSaga.create({
    id: 'hamlet-revenge',
    title: 'HAMLET',
    subtitle: 'THE PRINCE OF DENMARK',
    credit: 'WILLIAM SHAKESPEARE · c.1600',
    currency: 'HONOUR',
    bootCta: 'TAP TO BEGIN',
    menuLabel: 'ACT',
    menuHint: 'CHOOSE YOUR ACT',
    menuDone: 'ALL ACTS COMPLETE',
    bootLine: 'Vengeance awaits the Prince of Denmark...',
    finale: [
      'The rest is silence.',
      'Prince Hamlet has fulfilled',
      'his tragic oath, and all of',
      'Elsinore is changed forever.',
    ],

    emblem,
    scenery,

    screens: {
      win:          C.royal,
      lose:         C.crimson,
      chapterLabel: C.fog,
      name:         C.cream,
      sub:          C.crimBrt,
      intro:        C.ghostWh,
      quote:        C.parch,
      help:         C.fog,
      score:        C.goldBrt,
      cur:          C.gold,
      cta:          C.cream,
      overlay:      '#080618',
    },

    labels: {
      chapter:  'ACT',
      score:    'HONOUR',
      win:      'THE OATH IS KEPT',
      lose:     'THE FATES CONSPIRE',
      cont:     'TAP TO CONTINUE',
      finale:   'TAP FOR THE FINALE',
      toMenu:   'RETURN TO ELSINORE',
      play:     'TAKE THE STAGE',
    },

    menu: {
      colors: {
        title:    C.goldBrt,
        label:    C.parch,
        cur:      C.cream,
        border:   C.gold,
        bg:       C.velvet,
        hint:     C.fog,
        panelSel: '#2A0C3C',
      },
      layout(api, chapters) {
        return PAGE_RECTS;
      },
      title: drawPageHeader,
      card:  drawFolioCard,
    },

    chapters: [chGhost, chMousetrap, chArras, chOphelia, chDuel],
  });
})();
