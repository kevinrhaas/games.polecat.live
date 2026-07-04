/* ============================================================================
 * IVANHOE — THE TOURNAMENT AT ASHBY
 * Five chapters from Sir Walter Scott's 1819 medieval epic:
 *   1. THE LANCE          — joust timing bar: hit sweet spot 4 passes (~20s)
 *   2. INTO TORQUILSTONE  — top-down stealth: slip past 3 torch-guards (~22s)
 *   3. TRIAL BY COMBAT    — parry duel: match swing, riposte 5 times (~22s)
 *   4. THE STORM          — wall climb: reach the parapet, dodge storm of arrows (~22s)
 *   5. THE RECKONING      — wave brawler: strike Norman knights at Richard's side (~22s)
 * Built on RetroSaga (js/saga.js). NES-honest palette — flat fills, dithering.
 * Menu: tournament bracket (NOT a list). Opening: sunlit tournament field.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ====================================================================
   * NES-HONEST HERALDIC PALETTE
   * Bright daylight tournament — completely unlike the dark moody arenas
   * of Arthur / Hamlet. Crimson, gold, sunlit sky, green grass.
   * ==================================================================== */
  const C = {
    black:   '#000000',
    nearBk:  '#0C0800',
    navy:    '#000050',
    royal:   '#0000BC',
    sky:     '#3CBCFC',
    skyDk:   '#0058F8',
    grass:   '#00A800',
    grassLt: '#38B838',
    stone:   '#787878',
    stoneDk: '#585858',
    stoneLt: '#B0B0B0',
    white:   '#FCFCFC',
    gold:    '#F8D018',
    goldDk:  '#C8A020',
    goldDkr: '#906010',
    orange:  '#FC7460',
    crimson: '#D82800',
    blood:   '#A80000',
    brown:   '#884000',
    brownDk: '#503800',
    rope:    '#C8A060',
    silver:  '#B8B8B8',
    tunic:   '#FCFCFC',
    armour:  '#A8A8A8',
    armDk:   '#787878',
    helmet:  '#787878',
    visor:   '#484848',
    pennRed: '#D82800',
    pennBlu: '#0000BC',
    pennGld: '#F8D018',
    normTbn: '#F8D018',
    normArm: '#585858',
    saxTbn:  '#FCFCFC',
    woodBrn: '#703800',
    woodDk:  '#3C1800',
    earth:   '#A07040',
    sand:    '#E8C880',
    dirt:    '#C09050',
    tileA:   '#686060',
    tileB:   '#504848',
    danger:  '#FF2020',
    safe:    '#20C020',
    torchYl: '#F8D018',
    torchOr: '#FC7460',
  };

  /* ====================================================================
   * EMBLEM: Lance crossed with heraldic shield
   * Ivanhoe's device — the "Disinherited Knight" (no heraldry, plain)
   * ==================================================================== */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Lance (diagonal, behind shield)
    for (let i = 0; i < 52; i++) {
      g.rect(cx - 34 + i, cy + 22 - Math.floor(i * 0.65), 3, 3, C.armour);
    }
    // Lance tip
    g.rect(cx + 14, cy - 12, 8, 3, C.gold);
    g.rect(cx + 20, cy - 14, 4, 7, C.gold);

    // Shield body (pointed bottom — heraldic shape)
    c.fillStyle = C.blood;
    c.beginPath();
    c.moveTo(cx - 22, cy - 28);
    c.lineTo(cx + 22, cy - 28);
    c.lineTo(cx + 22, cy + 8);
    c.quadraticCurveTo(cx + 22, cy + 28, cx, cy + 34);
    c.quadraticCurveTo(cx - 22, cy + 28, cx - 22, cy + 8);
    c.closePath();
    c.fill();
    // Gold per-fess divider
    g.rect(cx - 22, cy - 6, 44, 5, C.gold);
    // Top half: plain (the disinherited device is blank — he has no arms)
    g.rect(cx - 20, cy - 26, 40, 18, C.blood);
    // Bottom half: a small sprig of oak leaves (Saxon token)
    g.rect(cx - 6, cy + 4, 12, 3, C.grassLt);
    g.rect(cx - 10, cy + 2, 8, 3, C.grassLt);
    g.rect(cx + 2, cy + 2, 8, 3, C.grassLt);
    g.rect(cx - 4, cy, 8, 4, C.grass);
    // Shield border
    c.strokeStyle = C.gold;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx - 22, cy - 28);
    c.lineTo(cx + 22, cy - 28);
    c.lineTo(cx + 22, cy + 8);
    c.quadraticCurveTo(cx + 22, cy + 28, cx, cy + 34);
    c.quadraticCurveTo(cx - 22, cy + 28, cx - 22, cy + 8);
    c.closePath();
    c.stroke();
  }

  /* ====================================================================
   * SCENERY: Tournament field backdrop (NES-honest, flat fills only)
   * Bright DAYLIGHT — completely distinct from dark castle/graveyard games
   * ==================================================================== */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // --- Flat sky (tournament day) ---
    g.rect(0, 0, W, Math.floor(H * 0.50), C.sky);

    // --- Clouds (flat white blobs) ---
    const clouds = [
      { x: 20, y: 28, w: 50, h: 13 },
      { x: 140, y: 44, w: 38, h: 10 },
      { x: 210, y: 22, w: 44, h: 12 },
    ];
    for (const cl of clouds) {
      g.rect(cl.x, cl.y, cl.w, cl.h, C.white);
      g.rect(cl.x + 5, cl.y - 5, cl.w - 10, 7, C.white);
    }

    // --- Sun (top-right) ---
    g.rect(W - 38, 10, 20, 20, C.gold);
    g.rect(W - 40, 14, 24, 12, C.gold);
    g.rect(W - 36, 8, 16, 24, C.gold);

    // --- Castle walls in background ---
    const wallBase = Math.floor(H * 0.50);
    g.rect(0, wallBase - 26, W, 26, C.stoneDk);
    // Battlements
    for (let x = 2; x < W - 6; x += 14) {
      g.rect(x, wallBase - 38, 8, 14, C.stoneDk);
    }
    // Left tower
    g.rect(0, wallBase - 64, 34, 64 + 26, C.stone);
    for (let x = 2; x < 32; x += 8) g.rect(x, wallBase - 74, 6, 12, C.stone);
    g.rect(6, wallBase - 52, 16, 14, C.navy);
    // Right tower
    g.rect(W - 34, wallBase - 64, 34, 64 + 26, C.stone);
    for (let x = W - 32; x < W - 4; x += 8) g.rect(x, wallBase - 74, 6, 12, C.stone);
    g.rect(W - 22, wallBase - 52, 16, 14, C.navy);
    // Gate arch
    g.rect(W / 2 - 20, wallBase - 38, 40, 40, C.stoneDk);
    g.rect(W / 2 - 14, wallBase - 46, 28, 22, C.navy);
    g.rect(W / 2 - 6, wallBase - 52, 12, 8, C.navy);

    // --- Animated pennants ---
    const pennants = [
      { bx: 4, by: wallBase - 74, col: C.pennRed },
      { bx: W / 2 - 3, by: wallBase - 50, col: C.pennGld },
      { bx: W - 30, by: wallBase - 74, col: C.pennBlu },
    ];
    for (let i = 0; i < pennants.length; i++) {
      const p = pennants[i];
      const wave = Math.sin(t * 2.8 + i * 1.4);
      // Pole
      g.rect(p.bx + 1, p.by, 2, 22, C.stoneLt);
      // Flag
      const fw = 12 + Math.floor(wave * 2);
      g.rect(p.bx + 3, p.by + 2, fw, 8, p.col);
      if (fw > 6) g.rect(p.bx + 3, p.by + 2, Math.floor(fw * 0.4), 4, C.white);
    }

    // --- Tournament lists fence ---
    const fenceY = Math.floor(H * 0.50);
    g.rect(0, fenceY, W, 7, C.white);
    for (let x = 0; x < W; x += 18) g.rect(x, fenceY - 10, 4, 18, C.white);

    // --- Ground ---
    g.rect(0, fenceY + 7, W, H - fenceY - 7, C.grass);
    g.rect(0, fenceY + 7, W, 5, C.grassLt);

    // --- Per-scene variations ---
    if (scene === 'menu') {
      // Overpaint lower area with stone courtyard tiles for bracket backdrop
      const stY = fenceY + 7;
      for (let yy = stY; yy < H; yy += 10) {
        for (let xx = 0; xx < W; xx += 16) {
          const col = ((Math.floor(yy / 10) + Math.floor(xx / 16)) % 2) ? C.tileA : C.tileB;
          g.rect(xx, yy, 16, 10, col);
        }
      }
      // Bracket lines behind cards (gold)
      _drawBracketLines(g, W);
      // Dim overlay so cards are readable
      c.fillStyle = 'rgba(0,0,20,0.44)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'boot') {
      // Darker tint so title reads clearly over the bright scene
      c.fillStyle = 'rgba(0,0,0,0.22)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(0,0,10,0.62)';
      c.fillRect(0, 0, W, H);
    }
  }

  // Gold bracket lines (drawn behind the menu cards in the scenery)
  function _drawBracketLines(g, W) {
    const gold = C.goldDk;
    // These y values match the menu.layout positions defined below
    const c1cx = 93, c2cx = 177;   // centers of row-1 cards
    const row1bot = 88 + 68;        // = 156 (bottom edge of row-1 cards)
    const row2top = 200;            // top edge of row-2 cards
    const row2bot = 200 + 68;       // = 268 (bottom edge of row-2 cards)
    const midY    = 290;            // horizontal connector
    const row3top = 312;            // top edge of row-3 card
    const c5cx    = 135;            // center of row-3 card

    // Verticals: row 1 → row 2
    g.rect(c1cx - 1, row1bot, 2, row2top - row1bot, gold);
    g.rect(c2cx - 1, row1bot, 2, row2top - row1bot, gold);
    // Verticals: row 2 → connector
    g.rect(c1cx - 1, row2bot, 2, midY - row2bot, gold);
    g.rect(c2cx - 1, row2bot, 2, midY - row2bot, gold);
    // Horizontal connector
    g.rect(c1cx, midY - 1, c2cx - c1cx, 2, gold);
    // Vertical: connector → row 3
    g.rect(c5cx - 1, midY, 2, row3top - midY, gold);
  }

  /* ====================================================================
   * CHAPTER ICONS (small glyphs for menu shields)
   * ==================================================================== */
  function iconLance(api, x, y) {
    const g = api.gfx;
    for (let i = 0; i < 24; i++) g.rect(x - 12 + i, y + 4 - Math.floor(i * 0.4), 2, 2, C.armour);
    g.rect(x + 10, y - 5, 5, 3, C.gold);
  }
  function iconStealth(api, x, y) {
    const g = api.gfx;
    g.rect(x - 6, y - 8, 12, 10, C.stoneDk);
    g.rect(x - 4, y - 6, 8, 6, C.nearBk);
    g.rect(x - 1, y - 4, 2, 2, C.torchYl);
  }
  function iconSword(api, x, y) {
    const g = api.gfx;
    g.rect(x - 1, y - 12, 2, 18, C.silver);
    g.rect(x - 8, y + 2, 16, 3, C.goldDk);
    g.rect(x - 1, y + 5, 2, 5, C.brown);
  }
  function iconClimb(api, x, y) {
    const g = api.gfx;
    // Rope
    g.rect(x, y - 10, 2, 20, C.rope);
    // Small figure
    g.rect(x - 4, y - 4, 8, 6, C.saxTbn);
    g.rect(x - 1, y - 10, 2, 8, C.helmet);
  }
  function iconBrawl(api, x, y) {
    const g = api.gfx;
    // Two swords clashing
    for (let i = 0; i < 12; i++) g.rect(x - 8 + i, y - 6 + Math.floor(i * 0.5), 2, 2, C.silver);
    for (let i = 0; i < 12; i++) g.rect(x + 2 - i, y - 6 + Math.floor(i * 0.5), 2, 2, C.normArm);
    g.rect(x - 2, y - 2, 4, 4, C.gold); // spark
  }

  /* ====================================================================
   * MENU: Tournament Bracket (NOT a vertical list)
   * Each chapter card = a heraldic shield with icon + roman numeral
   * The bracket connecting lines are drawn by the scenery function (above)
   * ==================================================================== */
  const menu = {
    colors: {
      panel:    'rgba(10,4,0,.78)',
      panelSel: 'rgba(48,18,0,.92)',
      border:   C.goldDk,
      name:     C.white,
      nameDone: C.gold,
      sub:      C.silver,
      title:    C.gold,
      label:    C.stoneLt,
      cur:      C.gold,
      hint:     C.stoneLt,
    },
    title(api, honour) {
      api.txtC('IVANHOE', api.W / 2, 20, 18, C.gold, true);
      api.txtC('THE TOURNAMENT AT ASHBY', api.W / 2, 48, 8, C.silver);
      api.txtC('HONOUR  ' + honour, api.W / 2, 66, 9, C.goldDk);
    },
    layout(api) {
      // Bracket: two on top, two in middle, one at bottom-center
      return [
        { x: 61,  y: 88,  w: 64, h: 68 }, // Ch1: top-left
        { x: 145, y: 88,  w: 64, h: 68 }, // Ch2: top-right
        { x: 61,  y: 200, w: 64, h: 68 }, // Ch3: mid-left
        { x: 145, y: 200, w: 64, h: 68 }, // Ch4: mid-right
        { x: 103, y: 312, w: 64, h: 68 }, // Ch5: bottom-center
      ];
    },
    card(api, info) {
      const g = api.gfx, c = api.ctx;
      const { ch, i, x, y, w, h, sel, done, best } = info;
      const cx = x + w / 2;
      const shCol   = sel ? C.crimson : C.blood;
      const bdrCol  = done ? C.gold : (sel ? C.gold : C.goldDk);

      // Shield silhouette (pointed bottom — heraldic)
      c.fillStyle = shCol;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + w, y);
      c.lineTo(x + w, y + h * 0.62);
      c.quadraticCurveTo(x + w, y + h, cx, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h * 0.62);
      c.closePath();
      c.fill();

      // Shield border
      c.strokeStyle = bdrCol;
      c.lineWidth = sel ? 2.5 : 1.5;
      c.stroke();

      // Per-fess divider
      const divY = y + h * 0.44;
      g.rect(x + 1, divY, w - 2, 3, done ? C.gold : C.goldDk);

      // Selection shimmer
      if (sel) {
        c.fillStyle = 'rgba(255,210,0,0.12)';
        c.fill();
      }

      // Icon (upper half of shield)
      if (ch.icon) ch.icon(api, cx, y + 22);

      // Roman numeral (lower half)
      const nums = ['I', 'II', 'III', 'IV', 'V'];
      api.txtC(nums[i], cx, divY + 7, 9, done ? C.gold : C.silver, true);

      // Name label below shield tip
      api.txtCFit(ch.name, cx, y + h + 3, 6, done ? C.gold : C.silver, false, w + 24);
      if (done && best) api.txtC('★' + best, cx, y + h + 14, 6, C.goldDk);
    },
  };

  /* ====================================================================
   * HELPER: Draw a simple knight sprite (facing left or right)
   * ==================================================================== */
  function drawKnight(g, cx, cy, facing, tunicCol, armourCol) {
    const d = facing < 0 ? -1 : 1;
    // Helmet
    g.rect(cx - 6, cy - 30, 12, 10, armourCol);
    g.rect(cx - 7, cy - 22, 14, 7, armourCol);
    g.rect(cx - 5, cy - 19, 10, 3, '#2C2C2C'); // visor slit
    // Plume
    g.rect(cx - 2, cy - 38, 4, 10, C.pennRed);
    // Body tabard
    g.rect(cx - 8, cy - 15, 16, 18, tunicCol);
    // Arms (armour)
    g.rect(cx - 12, cy - 14, 5, 16, armourCol);
    g.rect(cx + 7, cy - 14, 5, 16, armourCol);
    // Legs
    g.rect(cx - 7, cy + 3, 7, 14, armourCol);
    g.rect(cx, cy + 3, 7, 14, armourCol);
    // Boots
    g.rect(cx - 9, cy + 15, 9, 4, C.brownDk);
    g.rect(cx, cy + 15, 9, 4, C.brownDk);
    // Shield (on left arm)
    const shx = cx + (d > 0 ? -18 : 8);
    g.rect(shx, cy - 12, 8, 14, C.blood);
    g.rect(shx, cy - 12, 8, 3, C.gold);
    g.rect(shx + 1, cy - 10, 6, 12, C.blood);
  }

  /* ====================================================================
   * CHAPTER 1 — THE LANCE
   * Joust timing bar: oscillating needle, press A in gold sweet-spot.
   * Need 4 successful strikes in up to 6 tilts. ~20s play.
   * ==================================================================== */
  const chapLance = {
    id: 'lance',
    name: 'THE LANCE',
    sub: 'Joust at Ashby-de-la-Zouche',
    icon: iconLance,
    intro: [
      'THE TOURNAMENT AT ASHBY.',
      'Ivanhoe rides incognito —',
      'the Disinherited Knight.',
      'He must unhorse the Norman',
      'champion in the lists.',
    ],
    quote: 'He spurred his horse to full career against his antagonist.',
    help: 'Press A / TAP when the lance enters the GOLD zone!',
    winText: 'He is unhorsed! Ivanhoe stands champion of the lists.',
    loseText: 'The Norman lance shatters your visor. Regroup!',
    init(api) {
      this.phase = 'approach'; // approach | tilt | pause
      this.timer = 0;
      this.approachDur = 2.8;
      this.barVal = 0.5;
      this.barDir = 1;
      this.barSpeed = 0.38;
      this.zone = 0.22;
      this.strikes = 0;
      this.need = 4;
      this.misses = 0;
      this.maxMiss = 3;
      this.hitFlash = 0;
      this.missFlash = 0;
      // Horse positions
      this.px = 18;    // player horse x
      this.bx = api.W - 18; // brian horse x
    },
    update(api, dt) {
      this.timer += dt;
      this.hitFlash = Math.max(0, this.hitFlash - dt);
      this.missFlash = Math.max(0, this.missFlash - dt);
      const W = api.W;

      if (this.phase === 'approach') {
        // Horses charge toward each other
        const prog = Math.min(1, this.timer / this.approachDur);
        this.px = 18 + prog * (W * 0.35 - 18);
        this.bx = W - 18 - prog * (W * 0.35 - 18);
        if (this.timer >= this.approachDur) {
          this.phase = 'tilt';
          this.timer = 0;
          this.barVal = 0.5;
          this.barDir = 1;
        }
      } else if (this.phase === 'tilt') {
        // Oscillating bar
        this.barVal += this.barDir * this.barSpeed * dt * 60 * 0.016;
        if (this.barVal >= 1) { this.barVal = 1; this.barDir = -1; }
        if (this.barVal <= 0) { this.barVal = 0; this.barDir = 1; }

        if (api.confirm()) {
          const center = 0.5;
          if (Math.abs(this.barVal - center) < this.zone) {
            // HIT
            this.strikes++;
            this.hitFlash = 0.6;
            api.score += 30;
            api.burst(W / 2, Math.floor(api.H * 0.40), C.gold, 10);
            api.audio.sfx('coin');
            this.barSpeed = Math.min(this.barSpeed + 0.04, 0.72);
            this.zone = Math.max(this.zone - 0.022, 0.08);
            if (this.strikes >= this.need) {
              api.score += 80;
              api.win();
              return;
            }
          } else {
            // MISS
            this.misses++;
            this.missFlash = 0.5;
            api.shake(5, 0.25);
            api.audio.sfx('hurt');
            if (this.misses >= this.maxMiss) { api.lose(); return; }
          }
          this.phase = 'pause';
          this.timer = 0;
        }
      } else if (this.phase === 'pause') {
        if (this.timer >= 0.9) {
          this.phase = 'approach';
          this.timer = 0;
          this.approachDur = Math.max(1.8, this.approachDur - 0.08);
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Sky
      g.rect(0, 0, W, Math.floor(H * 0.48), C.sky);
      // Background castle
      g.rect(0, Math.floor(H * 0.30), W, Math.floor(H * 0.18), C.stoneDk);
      for (let x = 2; x < W - 6; x += 12) g.rect(x, Math.floor(H * 0.30) - 10, 8, 12, C.stoneDk);
      // Tournament fence
      const fY = Math.floor(H * 0.48);
      g.rect(0, fY, W, 6, C.white);
      for (let x = 0; x < W; x += 16) g.rect(x, fY - 8, 4, 14, C.white);
      // Ground
      g.rect(0, fY + 6, W, H - fY - 6, C.grass);
      g.rect(0, fY + 6, W, 5, C.grassLt);

      // Crowd
      for (let i = 0; i < 12; i++) {
        const hx = 6 + i * 22;
        const ht = 12 + (i % 4) * 6;
        const hy = Math.floor(H * 0.38);
        g.rect(hx - 4, hy - ht, 8, ht, C.stoneDk);
        g.circle(hx, hy - ht - 5, 5, C.stoneDk);
        if (i % 3 === 0) g.rect(hx - 4, hy - ht - 2, 8, 4, C.pennRed);
      }

      // ---- Player horse (left, riding right) ----
      const py = Math.floor(H * 0.60);
      const px = Math.floor(this.px);
      // Horse body
      g.rect(px - 14, py - 8, 28, 14, C.brownDk);
      g.rect(px - 12, py - 12, 24, 6, C.brown);
      // Horse legs (running animation)
      const legOff = Math.floor(Math.sin(api.t * 14) * 3);
      g.rect(px - 10, py + 6, 6, 10 + legOff, C.brownDk);
      g.rect(px - 2, py + 6, 6, 10 - legOff, C.brownDk);
      g.rect(px + 6, py + 6, 6, 10 + legOff, C.brownDk);
      // Horse head
      g.rect(px + 12, py - 16, 10, 12, C.brown);
      g.rect(px + 18, py - 20, 6, 8, C.brown);
      g.rect(px + 20, py - 22, 4, 4, C.brownDk);
      // Rider
      drawKnight(g, px, py - 28, 1, C.saxTbn, C.armour);
      // Lance (pointing right)
      for (let i = 0; i < 38; i++) g.rect(px + 8 + i, py - 30 - Math.floor(i * 0.1), 3, 3, C.woodBrn);
      g.rect(px + 44, py - 34, 6, 3, C.gold);

      // ---- Brian horse (right, riding left) ----
      const bx = Math.floor(this.bx);
      g.rect(bx - 14, py - 8, 28, 14, C.stone);
      g.rect(bx - 12, py - 12, 24, 6, C.stoneDk);
      const legOff2 = Math.floor(Math.sin(api.t * 14 + Math.PI) * 3);
      g.rect(bx - 12, py + 6, 6, 10 + legOff2, C.stoneDk);
      g.rect(bx - 4, py + 6, 6, 10 - legOff2, C.stoneDk);
      g.rect(bx + 4, py + 6, 6, 10 + legOff2, C.stoneDk);
      g.rect(bx - 22, py - 16, 10, 12, C.stone);
      g.rect(bx - 24, py - 20, 6, 8, C.stone);
      drawKnight(g, bx, py - 28, -1, C.normTbn, C.normArm);
      for (let i = 0; i < 38; i++) g.rect(bx - 10 - i, py - 30 - Math.floor(i * 0.1), 3, 3, C.woodDk);
      g.rect(bx - 48, py - 34, 6, 3, C.stoneLt);

      // Hit flash
      if (this.hitFlash > 0) {
        c.globalAlpha = this.hitFlash / 0.6 * 0.5;
        g.rect(W / 2 - 30, py - 50, 60, 40, C.gold);
        c.globalAlpha = 1;
      }

      // ---- Timing bar (during tilt phase) ----
      if (this.phase === 'tilt') {
        const bx2 = 28, bw = W - 56, by = H - 50, bh = 14;
        g.rect(bx2, by, bw, bh, C.nearBk);
        g.rect(bx2 + 1, by + 1, bw - 2, bh - 2, '#1C1008');
        // Sweet zone (gold, centered)
        const zw = Math.floor(bw * this.zone * 2);
        const zx = bx2 + Math.floor(bw / 2) - Math.floor(zw / 2);
        g.rect(zx, by + 1, zw, bh - 2, C.goldDk);
        g.rect(zx + 1, by + 1, Math.floor(zw / 3), bh - 2, C.gold); // brighter center
        // Center mark
        g.rect(bx2 + Math.floor(bw / 2) - 1, by - 4, 2, bh + 8, C.white);
        // Needle (indicator)
        const nX = bx2 + Math.floor(this.barVal * bw);
        g.rect(nX - 3, by - 5, 6, bh + 10, C.crimson);
        g.rect(nX - 1, by - 3, 2, bh + 6, C.orange);
        // Label
        api.txtC('STRIKE!', W / 2, H - 70, 9, C.gold, true);
      }

      // HUD
      api.topBar('THE LANCE');
      api.txt('STRIKES ' + this.strikes + '/' + this.need, 6, 20, 9, C.gold);
      api.txt('MISS ' + this.misses + '/' + this.maxMiss, W - 82, 20, 9, this.misses > 1 ? C.crimson : C.stoneLt);
      api.vignette();
      api.scanlines();
    },
  };

  /* ====================================================================
   * CHAPTER 2 — INTO TORQUILSTONE
   * Top-down stealth: navigate 3 guard zones from top to bottom cell door.
   * Player moves in 2D; guards patrol left/right with torch-sight rectangles.
   * 2 detections = lose; reach cell = win. ~22s play.
   * ==================================================================== */
  const chapStealth = {
    id: 'torquilstone',
    name: 'INTO TORQUILSTONE',
    sub: 'Rescue Rowena from the Normans',
    icon: iconStealth,
    intro: [
      'TORQUILSTONE CASTLE.',
      'Rowena is held captive',
      'in the keep below.',
      'Norman guards patrol the',
      'torchlit corridors.',
      'One wrong step and all is lost.',
    ],
    quote: 'The sounds and sights of battle were around him — yet he thought not of them.',
    help: 'ARROWS / DRAG to move. Stay out of the torch light!',
    winText: 'Lady Rowena is free! Ivanhoe leads her through the breach.',
    loseText: 'Caught in the torchlight! The alarm is raised.',
    init(api) {
      this.px = api.W / 2;
      this.py = 38;
      this.detections = 0;
      this.iframes = 0;
      this.flashTimer = 0;
      this.won = false;
      this.guards = [
        { x: 20, y: 145, dx: 1, speed: 38, patrolL: 14, patrolR: api.W - 20, facing: 1 },
        { x: api.W - 30, y: 265, dx: -1, speed: 44, patrolL: 14, patrolR: api.W - 20, facing: -1 },
        { x: 80, y: 385, dx: 1, speed: 34, patrolL: 14, patrolR: api.W - 20, facing: 1 },
      ];
    },
    update(api, dt) {
      if (this.won) return;
      this.iframes = Math.max(0, this.iframes - dt);
      this.flashTimer = Math.max(0, this.flashTimer - dt);

      // Move guards
      for (const gd of this.guards) {
        gd.x += gd.dx * gd.speed * dt;
        if (gd.x <= gd.patrolL) { gd.x = gd.patrolL; gd.dx = 1; gd.facing = 1; }
        if (gd.x >= gd.patrolR) { gd.x = gd.patrolR; gd.dx = -1; gd.facing = -1; }
      }

      // Move player
      const spd = 60;
      let moved = false;
      if (api.keyDown('left'))  { this.px -= spd * dt; moved = true; }
      if (api.keyDown('right')) { this.px += spd * dt; moved = true; }
      if (api.keyDown('up'))    { this.py -= spd * dt; moved = true; }
      if (api.keyDown('down'))  { this.py += spd * dt; moved = true; }
      if (api.pointer.down) {
        const dx = api.pointer.x - this.px;
        const dy = api.pointer.y - this.py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 8) {
          this.px += (dx / dist) * spd * dt;
          this.py += (dy / dist) * spd * dt;
          moved = true;
        }
      }
      this.px = clamp(this.px, 8, api.W - 8);
      this.py = clamp(this.py, 28, api.H - 20);

      // Detection check
      if (this.iframes <= 0) {
        for (const gd of this.guards) {
          // Sight rectangle extends forward from guard
          const sW = 78, sH = 26;
          let sx;
          if (gd.facing > 0) { sx = gd.x + 8; }
          else                { sx = gd.x - sW - 8; }
          const sy = gd.y - sH / 2;
          if (this.px >= sx && this.px <= sx + sW &&
              this.py >= sy && this.py <= sy + sH + 12) {
            this.detections++;
            this.iframes = 2.2;
            this.flashTimer = 0.5;
            api.shake(6, 0.3);
            api.flash(C.crimson, 0.2);
            api.audio.sfx('hurt');
            if (this.detections >= 2) { api.lose(); return; }
          }
        }
      }

      // Win: reach cell door at bottom
      if (Math.abs(this.px - api.W / 2) < 22 && this.py >= api.H - 28) {
        this.won = true;
        api.score += 120;
        api.audio.sfx('win');
        api.burst(api.W / 2, api.H - 20, C.gold, 12);
        api.win();
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Dark stone floor
      for (let yy = 0; yy < H; yy += 12) {
        for (let xx = 0; xx < W; xx += 18) {
          const col = ((Math.floor(yy / 12) + Math.floor(xx / 18)) % 2) ? C.tileA : C.tileB;
          g.rect(xx, yy, 18, 12, col);
        }
      }

      // Walls on sides
      g.rect(0, 0, 12, H, C.stoneDk);
      g.rect(W - 12, 0, 12, H, C.stoneDk);
      // Stone pillar posts
      for (let y = 40; y < H - 40; y += 90) {
        g.rect(0, y, 16, 20, C.stone);
        g.rect(W - 16, y, 16, 20, C.stone);
      }

      // Cell door (goal) at bottom-center
      g.rect(W / 2 - 18, H - 22, 36, 22, C.woodBrn);
      g.rect(W / 2 - 16, H - 20, 32, 18, C.woodDk);
      g.circle(W / 2 + 8, H - 12, 4, C.gold); // lock ring
      // Flicker if player near
      if (Math.abs(this.px - W / 2) < 30 && this.py > H - 60) {
        g.rect(W / 2 - 18, H - 22, 36, 2, C.gold);
      }

      // Player start marker (faint, top)
      g.rect(W / 2 - 12, 24, 24, 4, C.grassLt);

      // Draw guards + sight zones
      for (let gi = 0; gi < this.guards.length; gi++) {
        const gd = this.guards[gi];
        const sW = 78, sH = 26;
        let sx;
        if (gd.facing > 0) { sx = gd.x + 8; }
        else                { sx = gd.x - sW - 8; }
        const sy = gd.y - sH / 2;

        // Torch glow / sight zone
        const alpha = 0.22 + 0.10 * Math.sin(api.t * 5 + gi);
        c.globalAlpha = alpha;
        g.rect(sx, sy, sW, sH + 12, C.torchYl);
        c.globalAlpha = 1;
        // Inner brighter zone
        c.globalAlpha = alpha * 0.6;
        g.rect(sx + 4, sy + 4, sW - 8, sH, C.gold);
        c.globalAlpha = 1;

        // Guard body
        const gx = Math.floor(gd.x), gy = Math.floor(gd.y);
        g.rect(gx - 6, gy - 20, 12, 14, C.normArm);
        g.rect(gx - 5, gy - 18, 10, 3, '#1C1C1C');
        g.rect(gx - 5, gy - 6, 10, 14, C.normTbn);
        g.rect(gx - 7, gy - 6, 3, 12, C.normArm);
        g.rect(gx + 4, gy - 6, 3, 12, C.normArm);
        // Torch (held forward)
        const tx = gd.facing > 0 ? gx + 8 : gx - 12;
        g.rect(tx, gy - 14, 3, 12, C.woodBrn);
        g.rect(tx - 1, gy - 18, 5, 6, C.torchOr);
        // Torch flicker
        const flick = Math.floor(Math.sin(api.t * 12 + gi) * 2);
        g.rect(tx, gy - 22 + flick, 3, 6, C.torchYl);
      }

      // Player knight (small, top-down)
      const px = Math.floor(this.px), py = Math.floor(this.py);
      // Detection flash
      if (this.flashTimer > 0 && Math.floor(this.flashTimer * 8) % 2 === 0) {
        g.rect(px - 8, py - 8, 16, 16, C.danger);
      } else {
        g.rect(px - 5, py - 12, 10, 10, C.armour);
        g.rect(px - 7, py - 2, 14, 12, C.saxTbn);
        g.rect(px - 3, py + 2, 6, 4, C.blood);
      }

      // HUD
      api.topBar('TORQUILSTONE');
      api.txt('CAUGHT ' + this.detections + '/2', 6, 20, 9, this.detections > 0 ? C.crimson : C.stoneLt);
      // Arrow key hint (bottom)
      if (api.t < 3) api.txtC('ARROWS / DRAG TO MOVE', W / 2, H - 34, 7, C.stoneLt);
      api.vignette();
      api.scanlines();
    },
  };

  /* ====================================================================
   * CHAPTER 3 — TRIAL BY COMBAT
   * Directional parry duel: Brian attacks in L/R/U direction,
   * player presses matching arrow to parry, then A to riposte.
   * 5 successful ripostes = win; take 3 hits = lose. ~22s play.
   * ==================================================================== */
  const chapDuel = {
    id: 'duel',
    name: 'TRIAL BY COMBAT',
    sub: 'Defend Rebecca — Champion her honour',
    icon: iconSword,
    intro: [
      'REBECCA IS CONDEMNED.',
      'Brian de Bois-Guilbert',
      'will fight as accuser.',
      'Ivanhoe rides forth as',
      'her champion against',
      'all odds.',
    ],
    quote: 'The combat was of brief duration.',
    help: 'Match Brian\'s swing! Arrow key = parry · then A to riposte!',
    winText: "Brian falls! Rebecca is free! Ivanhoe's honour is proven.",
    loseText: "Brian's blade finds its mark. The trial goes against you.",
    init(api) {
      this.phase = 'ready';   // ready | windup | swing | parry_win | riposte | pause
      this.timer = 0;
      this.brianHP = 5;
      this.playerHP = 3;
      this.attackDir = 'R';   // 'L' | 'R' | 'U'
      this.parried = false;
      this.riposted = false;
      this.hitPlayer = false;
      this.flashOk = 0;
      this.flashBad = 0;
      this.clashX = api.W / 2;
    },
    update(api, dt) {
      this.timer += dt;
      this.flashOk  = Math.max(0, this.flashOk - dt);
      this.flashBad = Math.max(0, this.flashBad - dt);

      if (this.phase === 'ready') {
        if (this.timer > 0.9) {
          const dirs = ['L', 'R', 'U'];
          this.attackDir = dirs[Math.floor(Math.random() * 3)];
          this.parried = false;
          this.riposted = false;
          this.hitPlayer = false;
          this.phase = 'windup';
          this.timer = 0;
        }
      } else if (this.phase === 'windup') {
        if (this.timer > 0.75) {
          this.phase = 'swing';
          this.timer = 0;
        }
      } else if (this.phase === 'swing') {
        // Parry window
        const key = this.attackDir === 'L' ? 'left' :
                    this.attackDir === 'R' ? 'right' : 'up';
        if (api.keyPressed(key) || (api.pointer.justDown && this._parryHit(api))) {
          this.parried = true;
          this.phase = 'parry_win';
          this.timer = 0;
          api.audio.sfx('blip');
          api.burst(api.W / 2, api.H / 2 - 40, C.silver, 8);
        } else if (this.timer > 0.55) {
          // Too slow — player takes hit
          this.playerHP--;
          this.hitPlayer = true;
          this.flashBad = 0.7;
          api.shake(6, 0.3);
          api.flash(C.crimson, 0.15);
          api.audio.sfx('hurt');
          if (this.playerHP <= 0) { api.lose(); return; }
          this.phase = 'pause';
          this.timer = 0;
        }
      } else if (this.phase === 'parry_win') {
        // Riposte window
        if (api.confirm()) {
          this.riposted = true;
          this.brianHP--;
          this.flashOk = 0.7;
          api.score += 20;
          api.audio.sfx('shoot');
          api.burst(api.W / 2 + 42, api.H / 2 - 20, C.gold, 10);
          if (this.brianHP <= 0) {
            api.score += 100;
            api.win();
            return;
          }
          this.phase = 'pause';
          this.timer = 0;
        } else if (this.timer > 0.55) {
          // Missed riposte window — no damage either way
          this.phase = 'pause';
          this.timer = 0;
        }
      } else if (this.phase === 'pause') {
        if (this.timer > 0.7) {
          this.phase = 'ready';
          this.timer = 0;
        }
      }
    },
    _parryHit(api) {
      // Touch parry: tap left/right/top-center of canvas
      const px = api.pointer.x, py = api.pointer.y;
      const W = api.W, H = api.H;
      if (this.attackDir === 'L' && px < W / 2) return true;
      if (this.attackDir === 'R' && px >= W / 2) return true;
      if (this.attackDir === 'U' && py < H / 2) return true;
      return false;
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Arena floor
      for (let yy = 0; yy < H; yy += 14) {
        for (let xx = 0; xx < W; xx += 20) {
          const col = ((Math.floor(yy / 14) + Math.floor(xx / 20)) % 2) ? '#403428' : '#302820';
          g.rect(xx, yy, 20, 14, col);
        }
      }
      // Crowd silhouettes
      for (let i = 0; i < 14; i++) {
        const hx = 8 + i * 18;
        const ht = 16 + (i % 3) * 8;
        g.rect(hx - 5, 6, 10, ht, C.stoneDk);
        g.circle(hx, 4, 5, C.stoneDk);
      }
      // Banners overhead
      for (let i = 0; i < 4; i++) {
        const bx = 20 + i * 70;
        g.rect(bx, 14, 40, 20, i % 2 ? C.blood : C.royal);
        g.rect(bx + 4, 14, 32, 3, C.gold);
      }

      const ky = Math.floor(H * 0.55); // knight feet y

      // Brian de Bois-Guilbert (right, black & gold Norman)
      const bCX = Math.floor(W * 0.72);
      drawKnight(g, bCX, ky, -1, C.normTbn, C.normArm);
      // Brian's attack sword direction indicator
      if (this.phase === 'windup' || this.phase === 'swing') {
        const arrowColor = this.phase === 'swing' ? C.danger : C.orange;
        if (this.attackDir === 'R') {
          // Sword pointing right (toward player)
          for (let i = 0; i < 24; i++) g.rect(bCX - 32 + i, ky - 28, 3, 3, arrowColor);
          g.rect(bCX - 10, ky - 36, 8, 18, arrowColor);
        } else if (this.attackDir === 'L') {
          // Overhead left swing
          for (let i = 0; i < 22; i++) g.rect(bCX - 22 + i, ky - 40 + Math.floor(i * 0.7), 3, 3, arrowColor);
          g.rect(bCX - 24, ky - 42, 8, 18, arrowColor);
        } else { // UP
          // Thrust upward
          g.rect(bCX - 2, ky - 50, 4, 30, arrowColor);
          g.rect(bCX - 8, ky - 52, 16, 4, arrowColor);
        }
      }

      // Ivanhoe (player, left, white Saxon)
      const pCX = Math.floor(W * 0.28);
      drawKnight(g, pCX, ky, 1, C.saxTbn, C.armour);
      // Ivanhoe's sword (at ready)
      g.rect(pCX + 4, ky - 42, 3, 24, C.silver);
      g.rect(pCX, ky - 20, 12, 3, C.goldDk);

      // Parry window prompt
      if (this.phase === 'swing') {
        const elapsed = this.timer;
        const frac = elapsed / 0.55;
        // Urgency bar
        g.rect(60, H - 38, 150, 10, C.nearBk);
        g.rect(60, H - 38, Math.floor(150 * (1 - frac)), 10, frac > 0.7 ? C.danger : C.gold);
        const dirTxt = this.attackDir === 'L' ? '◀ PARRY LEFT' :
                       this.attackDir === 'R' ? 'PARRY RIGHT ▶' : '▲ PARRY UP';
        api.txtC(dirTxt, W / 2, H - 56, 9, C.gold, true);
      }

      // Riposte prompt
      if (this.phase === 'parry_win') {
        const frac = this.timer / 0.55;
        g.rect(80, H - 38, 110, 10, C.nearBk);
        g.rect(80, H - 38, Math.floor(110 * (1 - frac)), 10, C.safe);
        api.txtC('RIPOSTE! PRESS A', W / 2, H - 56, 9, C.gold, true);
      }

      // OK flash (riposte landed)
      if (this.flashOk > 0) {
        c.globalAlpha = this.flashOk / 0.7 * 0.45;
        g.rect(bCX - 30, ky - 50, 60, 50, C.gold);
        c.globalAlpha = 1;
      }
      // Bad flash (hit)
      if (this.flashBad > 0) {
        c.globalAlpha = this.flashBad / 0.7 * 0.45;
        g.rect(pCX - 30, ky - 50, 60, 50, C.crimson);
        c.globalAlpha = 1;
      }

      // HP bars
      api.topBar('TRIAL BY COMBAT');
      // Ivanhoe HP (left)
      api.txt('DEFENCE', 6, 20, 7, C.stoneLt);
      for (let i = 0; i < 3; i++) {
        g.rect(6 + i * 16, 30, 13, 7, i < this.playerHP ? C.grassLt : C.stoneDk);
      }
      // Brian HP (right)
      api.txt('BRIAN', W - 68, 20, 7, C.stoneLt);
      for (let i = 0; i < 5; i++) {
        g.rect(W - 90 + i * 16, 30, 13, 7, i < this.brianHP ? C.crimson : C.stoneDk);
      }

      // Touch hints
      if (api.t < 3.5) {
        api.txtC('LEFT · RIGHT · UP = PARRY', W / 2, H - 72, 7, C.stoneLt);
      }

      api.vignette();
      api.scanlines();
    },
  };

  /* ====================================================================
   * CHAPTER 4 — THE STORM OF ARROWS
   * Wall climb: player on 3 rope-lanes, arrows fly from windows.
   * Dodge to safe lane. Auto-climb; win when height reached. ~22s play.
   * ==================================================================== */
  const chapClimb = {
    id: 'storm',
    name: 'THE STORM',
    sub: 'Scale the walls of Torquilstone',
    icon: iconClimb,
    intro: [
      'THE CASTLE WALLS.',
      'Richard and Robin Hood',
      'hold the outer gate.',
      'Ivanhoe must scale the',
      'inner keep to open it',
      'from within — through a storm of arrows.',
    ],
    quote: 'Like an eagle whose pinions are clipped, he braced himself to the effort.',
    help: 'LEFT / RIGHT to switch rope · dodge the arrows from the windows!',
    winText: "The parapet! Ivanhoe hauls himself over — the gate swings wide!",
    loseText: 'An arrow finds its mark — the climb fails.',
    init(api) {
      this.lane = 1;          // 0 = left, 1 = center, 2 = right
      this.laneX = [68, 135, 202]; // x centers of 3 rope lanes
      this.px = this.laneX[1];
      this.climb = 0;         // progress 0..400
      this.climbSpeed = 18;   // px/s auto-climb
      this.arrows = [];
      this.arrowTimer = 1.4;
      this.hits = 0;
      this.maxHits = 3;
      this.iframes = 0;
      this.ropeAnim = 0;
      this.won = false;
    },
    update(api, dt) {
      if (this.won) return;
      this.iframes = Math.max(0, this.iframes - dt);
      this.ropeAnim += dt;

      // Auto-climb (press UP for small boost)
      const boost = api.keyDown('up') ? 12 : 0;
      this.climb += (this.climbSpeed + boost) * dt;
      // Gradually increase climb speed
      this.climbSpeed = Math.min(24, 18 + this.climb * 0.02);

      // Lane switching
      if (api.keyPressed('left')  && this.lane > 0) { this.lane--; api.audio.sfx('blip'); }
      if (api.keyPressed('right') && this.lane < 2) { this.lane++; api.audio.sfx('blip'); }
      // Touch: tap left third = left lane, middle = center, right third = right lane
      if (api.pointer.justDown) {
        if      (api.pointer.x < api.W / 3)       this.lane = 0;
        else if (api.pointer.x < api.W * 2 / 3)   this.lane = 1;
        else                                       this.lane = 2;
        api.audio.sfx('blip');
      }
      this.px = this.laneX[this.lane];

      // Spawn arrows
      this.arrowTimer -= dt;
      if (this.arrowTimer <= 0) {
        this.arrowTimer = 0.9 + Math.random() * 0.8;
        // Arrow from left window (targets right two lanes) or right window (targets left two)
        const fromRight = Math.random() > 0.5;
        // Target lane: 0..2, but biased toward occupied lane sometimes
        const targetLane = Math.floor(Math.random() * 3);
        this.arrows.push({
          lane: targetLane,
          fromRight,
          x: fromRight ? api.W + 10 : -10,
          vx: fromRight ? -(90 + Math.random() * 30) : (90 + Math.random() * 30),
          // y is relative to current climb progress in the game space
          climbY: this.climb + 100 + Math.random() * 80, // slightly ahead
        });
      }

      // Move arrows
      for (const arr of this.arrows) arr.x += arr.vx * dt;
      this.arrows = this.arrows.filter(arr => arr.x > -30 && arr.x < api.W + 30);

      // Check arrow hits
      if (this.iframes <= 0) {
        for (const arr of this.arrows) {
          // Arrow is at this.climb if arr.climbY ≈ this.climb
          const climbDiff = Math.abs(arr.climbY - this.climb);
          if (climbDiff < 28 && arr.lane === this.lane) {
            // Hit!
            this.hits++;
            this.iframes = 1.5;
            api.flash(C.crimson, 0.15);
            api.shake(5, 0.25);
            api.audio.sfx('hurt');
            arr.climbY = -9999; // remove
            if (this.hits >= this.maxHits) { api.lose(); return; }
          }
        }
      }

      // Win
      if (this.climb >= 380) {
        this.won = true;
        api.score += 120;
        api.audio.sfx('win');
        api.burst(api.W / 2, 60, C.gold, 14);
        api.win();
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      const WALL_TOP = 50;
      const PLAYER_Y = Math.floor(H * 0.66);
      // The player is always drawn at PLAYER_Y; the "world" scrolls upward

      // Wall background (stone tiles)
      for (let yy = 0; yy < H; yy += 14) {
        for (let xx = 0; xx < W; xx += 20) {
          const col = ((Math.floor(yy / 14) + Math.floor(xx / 20)) % 2) ? C.tileA : C.tileB;
          g.rect(xx, yy, 20, 14, col);
        }
      }
      // Stone wall sides (darker)
      g.rect(0, 0, 14, H, C.stoneDk);
      g.rect(W - 14, 0, 14, H, C.stoneDk);

      // Parapet at top (reward zone)
      g.rect(0, WALL_TOP - 14, W, 14, C.stone);
      g.rect(0, WALL_TOP - 14, W, 5, C.stoneLt);
      for (let x = 0; x < W; x += 16) g.rect(x, WALL_TOP - 26, 10, 14, C.stone);

      // === DRAW WINDOWS at fixed screen positions, based on climb progress ===
      // Windows exist at climb heights: 80, 160, 240, 320
      const windowHeights = [80, 160, 240, 320];
      for (const wh of windowHeights) {
        // Convert: window's screen y = PLAYER_Y - (wh - this.climb)
        const wy = PLAYER_Y - (wh - this.climb);
        if (wy < WALL_TOP || wy > H + 20) continue;
        // Left window
        g.rect(14, Math.floor(wy) - 12, 30, 24, C.stoneDk);
        g.rect(16, Math.floor(wy) - 10, 26, 20, C.navy);
        // Right window
        g.rect(W - 44, Math.floor(wy) - 12, 30, 24, C.stoneDk);
        g.rect(W - 42, Math.floor(wy) - 10, 26, 20, C.navy);
        // Guards in windows
        g.rect(20, Math.floor(wy) - 8, 10, 8, C.normArm);
        g.rect(W - 30, Math.floor(wy) - 8, 10, 8, C.normArm);
      }

      // === DRAW ROPES ===
      for (let li = 0; li < 3; li++) {
        const rx = this.laneX[li];
        // Rope dashes (scrolling animation)
        for (let rsy = 0; rsy < H; rsy += 12) {
          const off = (Math.floor(this.ropeAnim * 18) % 12);
          g.rect(rx - 1, rsy - off, 2, 7, C.rope);
        }
      }

      // === DRAW ARROWS ===
      for (const arr of this.arrows) {
        const ay = PLAYER_Y - (arr.climbY - this.climb);
        if (ay < WALL_TOP || ay > H + 10) continue;
        const ax = Math.floor(arr.x);
        // Arrow shaft
        g.rect(ax - 14, Math.floor(ay) - 1, 28, 3, C.brown);
        // Arrowhead
        if (arr.fromRight) {
          g.rect(ax - 18, Math.floor(ay) - 3, 6, 7, C.gold);
        } else {
          g.rect(ax + 12, Math.floor(ay) - 3, 6, 7, C.gold);
        }
        // Fletch
        if (arr.fromRight) {
          g.rect(ax + 12, Math.floor(ay) - 4, 4, 3, C.pennRed);
          g.rect(ax + 12, Math.floor(ay) + 2, 4, 3, C.pennRed);
        } else {
          g.rect(ax - 16, Math.floor(ay) - 4, 4, 3, C.pennBlu);
          g.rect(ax - 16, Math.floor(ay) + 2, 4, 3, C.pennBlu);
        }
      }

      // === PLAYER ===
      const ppx = Math.floor(this.px);
      const ppy = PLAYER_Y;
      // iframe blink
      if (this.iframes <= 0 || Math.floor(this.iframes * 8) % 2 === 0) {
        drawKnight(g, ppx, ppy, 1, C.saxTbn, C.armour);
        // Hands on rope
        g.rect(ppx - 2, ppy - 30, 4, 6, C.armour);
      }

      // === Progress bar ===
      const prog = Math.min(1, this.climb / 380);
      g.rect(W - 12, WALL_TOP, 8, H - WALL_TOP - 8, C.stoneDk);
      g.rect(W - 11, WALL_TOP + Math.floor((H - WALL_TOP - 8) * (1 - prog)),
             6, Math.floor((H - WALL_TOP - 8) * prog), C.gold);

      // HUD
      api.topBar('THE STORM');
      api.txt('ARROWS ' + this.hits + '/' + this.maxHits, 6, 20, 9, this.hits > 1 ? C.crimson : C.stoneLt);
      // Lane hint
      if (api.t < 3) api.txtC('TAP LEFT · MID · RIGHT', W / 2, H - 28, 7, C.stoneLt);
      api.vignette();
      api.scanlines();
    },
  };

  /* ====================================================================
   * CHAPTER 5 — THE RECKONING
   * Wave brawler: Norman knights march left, press A in the strike zone.
   * Strike 10 knights before taking 3 hits. Richard fights alongside.
   * ~22s play.
   * ==================================================================== */
  const chapBrawl = {
    id: 'reckoning',
    name: 'THE RECKONING',
    sub: 'Fight at Richard\'s side',
    icon: iconBrawl,
    intro: [
      'THE KING REVEALS HIMSELF.',
      '"I am Richard Coeur-de-Lion!"',
      'Norman knights advance.',
      'Ivanhoe takes his place',
      'at the king\'s right hand.',
      'England will be free!',
    ],
    quote: '"The lion-hearted king sprang from horseback upon the defender."',
    help: 'Press A / TAP when a knight enters the STRIKE ZONE!',
    winText: 'The last knight falls! England stands — the Saxons are free!',
    loseText: 'Overwhelmed by numbers. Stand firm!',
    init(api) {
      this.knights = [];
      this.spawnTimer = 1.0;
      this.spawnInterval = 2.2;
      this.defeated = 0;
      this.need = 10;
      this.hits = 0;
      this.maxHits = 3;
      this.swingTimer = 0;     // player sword swing anim
      this.richardSwing = 0;  // richard sword swing anim
      this.flashOk = 0;
      this.flashBad = 0;
      this.wave = 0;
    },
    update(api, dt) {
      this.swingTimer   = Math.max(0, this.swingTimer - dt);
      this.richardSwing = Math.max(0, this.richardSwing - dt);
      this.flashOk  = Math.max(0, this.flashOk - dt);
      this.flashBad = Math.max(0, this.flashBad - dt);

      // Spawn knights
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.defeated + this.knights.length < this.need + 4) {
        this.spawnTimer = Math.max(1.5, this.spawnInterval - this.wave * 0.08);
        this.knights.push({
          x: api.W + 20,
          speed: 30 + this.wave * 2 + Math.random() * 10,
          alive: true,
          flash: 0,
        });
        this.wave++;
      }

      // Move knights
      for (const kn of this.knights) {
        if (!kn.alive) continue;
        kn.x -= kn.speed * dt;
        kn.flash = Math.max(0, kn.flash - dt);
        // Knight reaches the left — player takes hit
        if (kn.x < 30) {
          kn.alive = false;
          this.hits++;
          this.flashBad = 0.7;
          api.shake(6, 0.3);
          api.flash(C.crimson, 0.15);
          api.audio.sfx('hurt');
          if (this.hits >= this.maxHits) { api.lose(); return; }
        }
      }
      this.knights = this.knights.filter(kn => kn.alive);

      // Player attack
      if (api.confirm()) {
        this.swingTimer = 0.4;
        // Check if any knight is in the strike zone (x = 80..170)
        let hit = false;
        for (const kn of this.knights) {
          if (kn.x >= 80 && kn.x <= 170) {
            kn.alive = false;
            kn.flash = 0.4;
            this.defeated++;
            this.flashOk = 0.5;
            api.score += 12;
            api.audio.sfx('shoot');
            api.burst(Math.floor(kn.x), Math.floor(api.H * 0.55), C.gold, 8);
            hit = true;
            break;
          }
        }
        if (!hit) {
          // Miss swing — no penalty, just sound
          api.audio.sfx('blip');
        }
        // Richard occasionally helps too
        if (Math.random() < 0.35 && this.knights.length > 0) {
          const farthest = this.knights.reduce((a, b) => a.x > b.x ? a : b);
          if (farthest.x > api.W * 0.6) {
            farthest.alive = false;
            this.defeated++;
            this.richardSwing = 0.5;
            api.score += 6;
            api.burst(Math.floor(farthest.x), Math.floor(api.H * 0.55), C.crimson, 5);
          }
        }
      }

      // Win
      if (this.defeated >= this.need) {
        api.score += 100;
        api.win();
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Open field (bright day — final victory scene)
      g.rect(0, 0, W, Math.floor(H * 0.50), C.sky);
      g.rect(0, Math.floor(H * 0.50), W, Math.floor(H * 0.50), C.grass);
      g.rect(0, Math.floor(H * 0.50), W, 5, C.grassLt);

      // Castle gates in background (thrown open)
      g.rect(W / 2 - 30, Math.floor(H * 0.16), 60, Math.floor(H * 0.34), C.stoneDk);
      g.rect(W / 2 - 22, Math.floor(H * 0.18), 44, Math.floor(H * 0.32), C.goldDk); // open gate glow
      g.rect(W / 2 - 44, Math.floor(H * 0.12), 18, Math.floor(H * 0.38), C.stone);
      g.rect(W / 2 + 26, Math.floor(H * 0.12), 18, Math.floor(H * 0.38), C.stone);

      // Background sun rays (flat gold stripes, not a gradient)
      for (let i = 0; i < 5; i++) {
        const rx = W / 2 - 10 + i * 6;
        c.globalAlpha = 0.08;
        g.rect(rx, 0, 4, H, C.gold);
        c.globalAlpha = 1;
      }

      // Strike zone indicator
      g.rect(78, Math.floor(H * 0.40), 94, Math.floor(H * 0.30), C.stoneDk);
      g.rect(79, Math.floor(H * 0.41), 92, Math.floor(H * 0.28), '#1A1200');
      g.rect(78, Math.floor(H * 0.40), 94, 2, C.goldDk);
      g.rect(78, Math.floor(H * 0.70) - 2, 94, 2, C.goldDk);
      api.txtC('STRIKE ZONE', 125, Math.floor(H * 0.72) + 2, 7, C.goldDk);

      // Norman knights (approaching from right)
      const ky = Math.floor(H * 0.55);
      for (const kn of this.knights) {
        if (!kn.alive) continue;
        const kx = Math.floor(kn.x);
        if (kn.flash > 0 && Math.floor(kn.flash * 8) % 2 === 0) continue;
        drawKnight(g, kx, ky, -1, C.normTbn, C.normArm);
        // Norman sword
        for (let i = 0; i < 18; i++) g.rect(kx - 10 - i, ky - 28 + Math.floor(i * 0.3), 2, 2, C.normArm);
      }

      // Richard Coeur-de-Lion (far right background, larger)
      const rX = Math.floor(W * 0.88);
      drawKnight(g, rX, ky, -1, C.crimson, C.armour);
      // Richard's crown
      g.rect(rX - 8, ky - 42, 16, 6, C.gold);
      g.rect(rX - 6, ky - 48, 4, 8, C.gold);
      g.rect(rX - 1, ky - 50, 4, 10, C.gold);
      g.rect(rX + 3, ky - 48, 4, 8, C.gold);
      if (this.richardSwing > 0) {
        for (let i = 0; i < 20; i++) g.rect(rX - 20 - i, ky - 28 + Math.floor(i * 0.4), 3, 3, C.silver);
      }

      // Ivanhoe (player, left)
      const px = 54;
      drawKnight(g, px, ky, 1, C.saxTbn, C.armour);
      if (this.swingTimer > 0) {
        // Sword swing animation
        const prog = 1 - this.swingTimer / 0.4;
        for (let i = 0; i < 28; i++) g.rect(px + 8 + i, ky - 40 + Math.floor(i * prog * 0.6), 3, 3, C.silver);
      } else {
        // Sword at rest (pointing right)
        for (let i = 0; i < 20; i++) g.rect(px + 8 + i, ky - 28, 3, 3, C.silver);
      }

      // Flashes
      if (this.flashOk > 0) {
        c.globalAlpha = this.flashOk / 0.5 * 0.30;
        g.rect(80, Math.floor(H * 0.38), 94, Math.floor(H * 0.34), C.gold);
        c.globalAlpha = 1;
      }
      if (this.flashBad > 0) {
        c.globalAlpha = this.flashBad / 0.7 * 0.35;
        g.rect(0, Math.floor(H * 0.38), 80, Math.floor(H * 0.34), C.crimson);
        c.globalAlpha = 1;
      }

      // HUD
      api.topBar('THE RECKONING');
      api.txt('STRUCK ' + this.defeated + '/' + this.need, 6, 20, 9, C.gold);
      api.txt('HITS ' + this.hits + '/' + this.maxHits, W - 80, 20, 9, this.hits > 1 ? C.crimson : C.stoneLt);
      if (api.t < 3) api.txtC('PRESS A / TAP IN ZONE', W / 2, H - 28, 7, C.stoneLt);
      api.vignette();
      api.scanlines();
    },
  };

  /* ====================================================================
   * RETROSAGA CONFIG
   * ==================================================================== */
  RetroSaga.create({
    id: 'ivanhoe-joust',
    title: 'IVANHOE',
    subtitle: 'THE TOURNAMENT AT ASHBY',
    source: 'Sir Walter Scott — 1819',
    currency: 'HONOUR',
    accent: C.gold,
    credit: 'A PIXEL TRIBUTE · SIR WALTER SCOTT · 1819',
    emblem,
    scenery,
    menu,

    bootCta: 'ENTER THE LISTS',
    bootLine: '5 CHAPTERS · ONE LEGEND · HONOUR ABOVE ALL',

    menuLabel: 'THE TOURNAMENT',
    menuHint: 'TAP A TRIAL TO BEGIN',
    menuDone: 'SAXON ENGLAND IS FREE!',

    // In-property framed-screen palette (sunlit heraldic, NOT gold-on-black default)
    screens: {
      overlay:      'rgba(4,2,0,.80)',
      win:          C.gold,
      lose:         C.crimson,
      chapterLabel: C.stoneLt,
      name:         C.gold,
      sub:          C.orange,
      intro:        '#F0E8C8',
      quote:        C.goldDk,
      help:         C.silver,
      score:        '#F0E8C8',
      cur:          C.gold,
      cta:          C.grassLt,
    },
    labels: {
      chapter: 'CHAPTER',
      score:   'HONOUR WON',
      win:     'THE LISTS ARE YOURS',
      lose:    'UNHORSED — BUT NOT BROKEN',
      cont:    'REMOUNT',
      finale:  'THE FINAL RECKONING',
      toMenu:  'RETURN TO TOURNAMENT',
      play:    'ENTER THE LISTS',
    },

    finale: [
      'ENGLAND BREATHES FREE.',
      'IVANHOE AND ROWENA',
      'STAND AT RICHARD\'S SIDE.',
      '',
      'THE SAXON CROWN RESTORED.',
    ],
    tagline: 'A POLECAT ARCADE TRIBUTE',

    width: 270, height: 480, parent: '#game',

    chapters: [chapLance, chapStealth, chapDuel, chapClimb, chapBrawl],
  });

}());
