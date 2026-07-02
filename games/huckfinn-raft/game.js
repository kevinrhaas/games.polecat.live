/* ============================================================================
 * HUCKLEBERRY FINN — DOWN THE MISSISSIPPI
 * Five tales of Twain's classic:
 *   1. DUSK ESCAPE    — dodge Pap's swinging lanterns (stealth, 20 s)
 *   2. THE RIVER      — steer the raft past logs & sandbars (runner, 22 s)
 *   3. ROYAL NONESUCH — catch gold coins, dodge tomatoes (catch/dodge)
 *   4. THE TUNNEL     — tap the timing meter to dig 4 rocks (timing)
 *   5. STORM'S END    — survive lightning & debris (dodge, 25 s)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;
  const rand  = Retro.util.rand;

  /* ─── Mississippi palette ─── */
  const C = {
    river:  '#3a6888',
    riverL: '#5898b8',
    riverD: '#1a3848',
    mud:    '#7a5a28',
    sky:    '#e89020',
    skyD:   '#b06010',
    land:   '#4a7a28',
    landD:  '#2a5018',
    log:    '#8a5c28',
    logD:   '#5a3810',
    gold:   '#f0c020',
    goldL:  '#ffd84a',
    tomato: '#c02010',
    tomL:   '#e03020',
    cabin:  '#7a4820',
    lantern:'#f0a020',
    raft:   '#9a6a30',
    raftD:  '#6a4818',
    huck:   '#d09050',
    huckH:  '#7a4018',
    jim:    '#5a3818',
    jimH:   '#3a2010',
    guard:  '#6a8840',
    guardF: '#c89060',
    torch:  '#f08020',
    night:  '#0a1018',
    storm:  '#1a2830',
    bolt:   '#f8f060',
    cream:  '#f4e8cc',
    dark:   '#0c1008',
    amber:  '#e09030',
    grass:  '#5a8820',
    barn:   '#8a3020',
    stone:  '#484840',
    stoneL: '#606060',
  };

  /* ─── Life dots helper ─── */
  function drawLives(api, lives, max) {
    for (let i = 0; i < max; i++) {
      api.gfx.circle(api.W - 18 - (max - 1 - i) * 14, 8, 5,
        i < lives ? C.gold : '#2a1808');
    }
  }

  /* ─── Emblem: Huck & Jim on a raft at sunset ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // River ripple behind raft
    c.strokeStyle = C.riverL; c.lineWidth = 1.5; c.globalAlpha = 0.55;
    c.beginPath(); c.ellipse(cx, cy + 20, 30, 9, 0, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = 1;
    // Raft planks
    g.rect(cx - 22, cy + 6,  44, 8, C.raft);
    g.rect(cx - 20, cy + 4,  40, 5, C.raftD);
    // Pole (Huck pushing)
    c.strokeStyle = C.log; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 8, cy + 6); c.lineTo(cx - 20, cy - 18); c.stroke();
    // Huck (standing, left)
    g.rect(cx - 12, cy - 9,  7, 17, C.huck);
    g.rect(cx - 13, cy - 18, 9,  8, C.huckH);
    // Jim (sitting, right)
    g.rect(cx + 5,  cy - 2,  7, 10, C.jim);
    g.rect(cx + 4,  cy - 9,  9,  7, C.jimH);
    // Star above
    c.globalAlpha = 0.7 + 0.3 * Math.sin(api.t * 2);
    g.rect(cx - 1, cy - 28, 2, 2, '#fffce8');
    c.globalAlpha = 1;
  }

  /* ─── Scenery ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Aerial view: green farmland with winding river
      c.fillStyle = C.land; c.fillRect(0, 0, W, H);
      // Land texture dots
      for (let i = 0; i < 100; i++) {
        c.fillStyle = C.landD; c.globalAlpha = 0.09;
        c.fillRect((i * 43 + 9) % W, (i * 61 + 13) % H, 3, 2);
      }
      c.globalAlpha = 1;
      // Winding river — fills the 90-160 x channel, snaking gently
      c.fillStyle = C.river;
      c.beginPath();
      c.moveTo(94, 0);
      c.bezierCurveTo(100, 50,  120, 90,  118, 115);
      c.bezierCurveTo(116, 140, 148, 162, 148, 198);
      c.bezierCurveTo(148, 234, 116, 252, 116, 280);
      c.bezierCurveTo(116, 308, 150, 330, 150, 360);
      c.bezierCurveTo(150, 390, 128, 420, 118, H);
      c.lineTo(136, H);
      c.bezierCurveTo(142, 420, 164, 390, 164, 360);
      c.bezierCurveTo(164, 330, 132, 308, 132, 280);
      c.bezierCurveTo(132, 252, 162, 234, 162, 198);
      c.bezierCurveTo(162, 162, 132, 140, 130, 115);
      c.bezierCurveTo(128, 90,  108, 50,  112, 0);
      c.closePath(); c.fill();
      // River shimmer (animated)
      c.fillStyle = C.riverL; c.globalAlpha = 0.35 + 0.1 * Math.sin(t * 1.2);
      for (let i = 0; i < 8; i++) {
        const rx = 100 + (i * 19) % 42;
        const ry = 15 + (i * 58) % (H - 30);
        c.fillRect(rx, ry, 4, 1);
      }
      c.globalAlpha = 1;
      // Tree clusters on banks
      const trees = [[6,28],[196,44],[6,200],[195,218],[4,380],[196,362]];
      for (const [tx, ty] of trees) {
        c.fillStyle = C.landD;
        c.beginPath(); c.arc(tx + 12, ty + 12, 13, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(tx + 22, ty + 7,   9, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(tx + 4,  ty + 7,   8, 0, Math.PI * 2); c.fill();
      }
      // Tiny steamboat animated along river
      const bx = 114 + Math.sin(t * 0.15) * 8;
      const by = 60 + (t * 9 % 360);
      g.rect(bx - 10, by - 4, 20, 8, C.cabin);
      g.rect(bx - 3,  by - 9,  6, 5, '#a8a8a0');
      c.fillStyle = '#c0c0b8'; c.globalAlpha = 0.45;
      c.beginPath(); c.arc(bx, by - 13, 4 + Math.sin(t * 2) * 1, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      // River path connector (dotted amber lines between chapter stops)
      c.strokeStyle = C.amber; c.lineWidth = 1.5; c.setLineDash([4, 4]);
      // Ch1(64,91) → Ch2(196,198)
      c.beginPath(); c.moveTo(115, 91);  c.lineTo(148, 198); c.stroke();
      // Ch2(196,198) → Ch3(64,280)
      c.beginPath(); c.moveTo(148, 224); c.lineTo(118, 280); c.stroke();
      // Ch3(64,280) → Ch4(196,385)
      c.beginPath(); c.moveTo(118, 306); c.lineTo(148, 360); c.stroke();
      // Ch4(196,385) → Ch5(133,430)
      c.beginPath(); c.moveTo(155, 412); c.lineTo(140, 415); c.stroke();
      c.setLineDash([]);
      // Map border
      c.strokeStyle = C.mud; c.lineWidth = 4; c.strokeRect(5, 5, W - 10, H - 10);
      c.strokeStyle = C.goldL; c.lineWidth = 1; c.strokeRect(8, 8, W - 16, H - 16);
      return;
    }

    if (scene === 'boot' || scene === 'intro' || scene === 'result' || scene === 'finale') {
      // Sunset river: warm dusk sky above, blue river below
      const sky = c.createLinearGradient(0, 0, 0, H * 0.58);
      sky.addColorStop(0, '#a84010'); sky.addColorStop(0.55, '#e08818'); sky.addColorStop(1, '#f0bf58');
      c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.58);
      // Setting sun
      c.fillStyle = '#ffb800'; c.globalAlpha = 0.88;
      c.beginPath(); c.arc(W * 0.5, H * 0.56, 20, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      // River
      const riv = c.createLinearGradient(0, H * 0.54, 0, H);
      riv.addColorStop(0, '#6898b8'); riv.addColorStop(1, '#2a5878');
      c.fillStyle = riv; c.fillRect(0, H * 0.54, W, H * 0.46);
      // Sun reflection
      c.fillStyle = '#ffc040'; c.globalAlpha = 0.38 + 0.06 * Math.sin(t * 1.5);
      c.fillRect(W * 0.38, H * 0.54, W * 0.24, H * 0.08);
      c.globalAlpha = 1;
      // Banks
      c.fillStyle = C.landD; c.fillRect(0, H * 0.50, W * 0.22, H * 0.1);
      c.fillStyle = C.land;  c.fillRect(0, H * 0.52, W * 0.18, H * 0.08);
      c.fillStyle = C.landD; c.fillRect(W * 0.80, H * 0.50, W * 0.2, H * 0.1);
      c.fillStyle = C.land;  c.fillRect(W * 0.82, H * 0.52, W * 0.18, H * 0.08);
      // Raft silhouette
      const rx = W * 0.5 + Math.sin(t * 0.4) * 8;
      const ry = H * 0.68;
      g.rect(rx - 20, ry - 4, 40, 8, C.raft);
      g.rect(rx - 10, ry - 15, 6, 12, C.dark);
      g.rect(rx + 5,  ry - 10, 6, 10, C.dark);
      // River sparkles
      for (let i = 0; i < 8; i++) {
        const sx = ((t * 18 + i * 44) % (W * 0.68)) + W * 0.16;
        const sy = H * 0.62 + (i * 21) % (H * 0.2);
        c.globalAlpha = 0.28 + 0.2 * Math.sin(t * 2 + i);
        g.rect(sx, sy, 3, 1, C.riverL);
      }
      c.globalAlpha = 1;
      return;
    }

    // Default (in-game): scrolling river
    c.fillStyle = C.river; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) {
      const wy = ((t * 45 + i * 62) % (H + 10)) - 10;
      c.fillStyle = C.riverL; c.globalAlpha = 0.06;
      c.fillRect(0, wy, W, 2);
    }
    c.globalAlpha = 1;
  }

  /* ─── Menu: winding-river MAP with wooden dock signs ─── */
  const MAP_LAYOUT = [
    { x: 8,   y: 38,  w: 106, h: 52 }, // Ch1 LEFT bank
    { x: 156, y: 146, w: 106, h: 52 }, // Ch2 RIGHT bank
    { x: 8,   y: 252, w: 106, h: 52 }, // Ch3 LEFT bank
    { x: 156, y: 358, w: 106, h: 52 }, // Ch4 RIGHT bank
    { x: 82,  y: 414, w: 106, h: 52 }, // Ch5 BOTTOM center
  ];

  const menu = {
    colors: { title: C.goldL, label: C.amber, cur: C.gold },
    layout() { return MAP_LAYOUT; },
    title(api, miles) {
      const g = api.gfx, W = api.W;
      // Parchment ribbon at top
      g.rect(12, 10, W - 24, 26, C.mud);
      g.rect(14, 12, W - 28, 22, '#5a3010');
      api.txtCFit('DOWN THE MISSISSIPPI', W / 2, 14, 8, C.goldL, true, W - 32);
      api.txtCFit('MILES · ' + miles, W / 2, 26, 7, C.amber, true, W - 32);
    },
    card(api, { ch, i, x, y, w, h, sel, done, best }) {
      const g = api.gfx, c = api.ctx;
      const cx = x + w / 2, cy = y + h / 2;
      // Post
      g.rect(cx - 2, y + h - 6, 4, 14, C.logD);
      // Board shadow
      c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x + 3, y + 4, w - 1, h - 8);
      // Weathered-wood board face
      const bCol = sel ? '#c89040' : (done ? '#a07830' : '#8a5c28');
      g.rect(x, y, w, h - 8, bCol);
      // Wood grain lines
      c.strokeStyle = sel ? '#f0b060' : '#5a3010';
      c.lineWidth = 1; c.globalAlpha = 0.22;
      for (let k = 0; k < 3; k++) {
        c.beginPath();
        c.moveTo(x + 4, y + 9 + k * 12);
        c.lineTo(x + w - 4, y + 9 + k * 12);
        c.stroke();
      }
      c.globalAlpha = 1;
      // Border
      c.strokeStyle = sel ? C.gold : (done ? C.amber : C.logD);
      c.lineWidth = sel ? 2.5 : 1.5;
      c.strokeRect(x + 2, y + 2, w - 4, h - 12);
      // Chapter name
      api.txtCFit(ch.name, cx, y + 7,  7, sel ? C.goldL : C.cream, true, w - 8);
      api.txtCFit(ch.sub,  cx, y + 21, 6, sel ? C.gold  : '#c8aa78', true, w - 8);
      // Done star
      if (done) {
        g.circle(x + w - 12, y + 5, 6, '#3a8018');
        api.txtC('★', x + w - 12, y + 1, 8, C.goldL, true);
      }
      // Best score
      if (best > 0) api.txtC(String(best), cx, y + 34, 6, '#d8c880', true);
      // Selection glow
      if (sel) {
        c.strokeStyle = C.goldL; c.lineWidth = 2;
        c.globalAlpha = 0.5 + 0.4 * Math.sin(api.t * 3);
        c.strokeRect(x - 1, y - 1, w + 2, h - 6);
        c.globalAlpha = 1;
      }
    },
  };

  /* ─── Screens & Labels ─── */
  const screens = {
    win:          '#60d880',
    lose:         '#6888a8',
    chapterLabel: C.amber,
    name:         C.goldL,
    sub:          C.gold,
    intro:        C.cream,
    quote:        '#d0c890',
    help:         '#b8cca0',
    score:        C.goldL,
    cur:          C.gold,
    cta:          C.riverL,
    overlay:      'rgba(6,10,8,.88)',
  };
  const labels = {
    chapter: 'TALE',
    score:   'MILES',
    win:     'The river carries you on',
    lose:    'The raft runs aground',
    cont:    'TAP TO PUSH ON',
    finale:  'TAP FOR THE FINALE',
    toMenu:  'BACK TO THE RIVER',
    play:    'TAP TO PUSH OFF',
  };

  /* ============================================================
   *  C H A P T E R S
   * ============================================================ */

  RetroSaga.create({
    id:        'huckfinn-raft',
    title:     'DOWN THE MISSISSIPPI',
    subtitle:  'Huckleberry Finn',
    currency:  'MILES',
    bootLine:  'MARK TWAIN · 1884',
    bootCta:   'TAP TO LIGHT OUT',
    menuLabel: 'THE MISSISSIPPI',
    menuHint:  'CHOOSE YOUR TALE',
    menuDone:  'FREEDOM FOUND!',
    accent:    '#f0c020',
    credit:    'AN 8-BIT TRIBUTE · MARK TWAIN 1884',
    emblem,
    scenery,
    menu,
    screens,
    labels,
    finale: [
      'THE RAFT DRIFTS ON.',
      '',
      '"Wherever you go,',
      'the river knows your name."',
      '',
      'HUCK AND JIM',
      'FREE AT LAST.',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ==================================================================
       * 1. DUSK ESCAPE — sneak out of Pap's cabin, dodge swinging lanterns
       * ================================================================== */
      {
        id: 'escape', name: 'DUSK ESCAPE', sub: "Out of Pap's",
        icon(api, x, y) {
          const g = api.gfx;
          // Lantern
          g.circle(x, y, 7, C.lantern);
          g.circle(x, y, 4, C.goldL);
          g.rect(x - 1, y - 10, 2, 4, C.amber);
        },
        intro: [
          "PAP'S DRUNK AND SNORING.",
          'His lanterns swing slow.',
          'One wrong step — caught.',
          'Stay in the SHADOWS',
          'for 20 seconds.',
        ],
        quote: 'I lit out for the territory ahead of the rest.',
        help:  'DRAG or ARROW LEFT/RIGHT. Stay OUT of the lantern light for 20 seconds.',
        winText:  'You slipped out clean! The night air tastes like freedom.',
        loseText: 'Pap grabbed you! Try staying in the shadows.',

        init(api) {
          this.hx    = api.W / 2;
          this.timer = 20;
          this.lives = 5;   // generous — allows learning
          this.t1    = 0;
          this.t2    = 1.2;
          // Lamps sweep the LEFT half and RIGHT half respectively,
          // so there is always a clear corridor on the opposite side.
          this.lx1   = api.W * 0.28;   // initialized before first update
          this.lx2   = api.W * 0.72;
          this.invT  = 0;
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          // Huck left/right
          const spd = 92;
          if (api.keyDown('left'))  this.hx -= spd * dt;
          if (api.keyDown('right')) this.hx += spd * dt;
          if (api.pointer.down) {
            this.hx += clamp(api.pointer.x - this.hx, -spd * dt * 2.5, spd * dt * 2.5);
          }
          this.hx = clamp(this.hx, 14, W - 14);

          // Each lamp patrols its own half so there is always a safe corridor.
          // Lamp1 sweeps the LEFT half (x ≈ 28..132); Lamp2 sweeps RIGHT half (x ≈ 138..242).
          this.t1 += dt * 0.62;
          this.t2 += dt * 0.46;
          this.lx1 = W * 0.30 + Math.sin(this.t1) * W * 0.19; // 0.11..0.49
          this.lx2 = W * 0.70 + Math.cos(this.t2 + 0.4) * W * 0.19; // 0.51..0.89

          // Countdown
          this.timer -= dt;
          if (this.timer <= 0) { api.win(); return; }

          // Collision check
          if (this.invT > 0) { this.invT -= dt; return; }
          const HY = H * 0.76;
          if (Math.abs(this.hx - this.lx1) < 22 || Math.abs(this.hx - this.lx2) < 22) {
            this.lives--;
            this.invT = 1.8;   // generous invincibility so players have time to react
            api.flash(C.lantern, 0.35);
            api.shake(5, 0.3);
            api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
          api.addScore(Math.floor(dt * 20));
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dark cabin interior
          c.fillStyle = '#150d06'; c.fillRect(0, 0, W, H);
          // Floorboards
          const FL = H * 0.68;
          for (let i = 0; i < 6; i++) {
            c.fillStyle = i % 2 ? '#200e06' : '#1a0c04';
            c.fillRect(0, FL + i * 12, W, 12);
          }
          // Fireplace glow top-right (Pap's fire)
          c.globalAlpha = 0.22 + 0.08 * Math.sin(api.t * 4.5);
          c.fillStyle = '#c04010';
          c.beginPath(); c.arc(W - 28, 72, 38, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          // Pap silhouette (top-left in chair)
          g.rect(12, 20, 22, 38, '#0e0804');
          g.circle(23, 18, 11, '#0e0804');

          // Lanterns and cones of light
          const lamps = [this.lx1, this.lx2];
          const lampY = [44, 38];
          for (let li = 0; li < 2; li++) {
            const lx = lamps[li], ly = lampY[li];
            const HY = H * 0.76;
            // Light cone (gradient triangle)
            c.save();
            c.globalAlpha = this.invT > 0 ? 0.12 : 0.22 + 0.04 * Math.sin(api.t * 2.5 + li);
            const grad = c.createLinearGradient(lx, ly, lx, HY + 12);
            grad.addColorStop(0, C.lantern); grad.addColorStop(1, 'rgba(240,160,32,0)');
            c.fillStyle = grad;
            const coneW = 34;
            c.beginPath();
            c.moveTo(lx, ly);
            c.lineTo(lx - coneW, HY + 12);
            c.lineTo(lx + coneW, HY + 12);
            c.closePath(); c.fill();
            c.restore();
            // Floor glow ellipse
            c.globalAlpha = this.invT > 0 ? 0.08 : 0.18;
            c.fillStyle = C.lantern;
            c.beginPath(); c.ellipse(lx, HY + 4, 30, 10, 0, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            // Lantern body
            g.circle(lx, ly, 7, C.lantern);
            g.circle(lx, ly, 4, C.goldL);
            g.rect(lx - 1, ly - 12, 2, 6, C.amber);
          }

          // Wall and door
          c.fillStyle = '#2a1808'; c.fillRect(0, 0, W, FL);
          // Redraw floor on top of wall base
          for (let i = 0; i < 6; i++) {
            c.fillStyle = i % 2 ? '#200e06' : '#1a0c04';
            c.fillRect(0, FL + i * 12, W, 12);
          }
          // Door (right wall)
          g.rect(W - 22, FL - 72, 20, 72, '#4a2810');
          g.rect(W - 20, FL - 68, 7, H * 0.1, '#2a1808');
          g.circle(W - 17, FL - 30, 3, C.gold);

          // Re-draw lamp glow on top of wall
          for (let li = 0; li < 2; li++) {
            const lx = lamps[li], ly = lampY[li];
            c.globalAlpha = this.invT > 0 ? 0.05 : 0.14 + 0.04 * Math.sin(api.t * 2.5 + li);
            c.fillStyle = C.lantern;
            c.beginPath(); c.arc(lx, ly, 20, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            g.circle(lx, ly, 7, C.lantern);
            g.circle(lx, ly, 4, C.goldL);
          }

          // Huck
          const HY = H * 0.76;
          const flicker = this.invT > 0 && Math.floor(api.t * 8) % 2 === 0;
          if (!flicker) {
            g.rect(this.hx - 5, HY - 15, 10, 16, C.huck);
            g.rect(this.hx - 6, HY - 23, 12,  8, C.huckH);
          }

          // HUD
          api.topBar('SHADOW · ' + Math.ceil(this.timer) + 's');
          drawLives(api, this.lives, 5);
          api.vignette();
        },
      },

      /* ==================================================================
       * 2. THE RIVER — steer raft past logs, sandbars and wakes (22 s)
       * ================================================================== */
      {
        id: 'river', name: 'THE RIVER', sub: 'Ride the current',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Raft plank
          g.rect(x - 9, y + 1, 18, 5, C.raft);
          // Pole
          c.strokeStyle = C.log; c.lineWidth = 2;
          c.beginPath(); c.moveTo(x - 3, y + 1); c.lineTo(x - 10, y - 8); c.stroke();
        },
        intro: [
          'THE RAFT GLIDES OUT',
          'onto the dark Mississippi.',
          'Logs and sandbars loom',
          'from the river mist.',
          'Steer clear for 22 seconds.',
        ],
        quote: 'We said there warn\'t no home like a raft, after all.',
        help:  'DRAG or ARROW LEFT/RIGHT to steer the raft. Avoid logs, sandbars and wakes.',
        winText:  'You cleared the bend! Stars wheel overhead.',
        loseText: 'The raft grounded hard. Push off and try again.',

        init(api) {
          this.rx       = api.W / 2;
          this.timer    = 22;
          this.lives    = 3;
          this.obs      = [];
          this.spawnT   = 1.4;
          this.elapsed  = 0;
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          const spd = 92;
          if (api.keyDown('left'))  this.rx -= spd * dt;
          if (api.keyDown('right')) this.rx += spd * dt;
          if (api.pointer.down) {
            this.rx += clamp(api.pointer.x - this.rx, -spd * dt * 2.5, spd * dt * 2.5);
          }
          this.rx = clamp(this.rx, 20, W - 20);

          this.timer   -= dt;
          this.elapsed += dt;
          if (this.timer <= 0) { api.win(); return; }

          // Difficulty ramp
          const rate = Math.max(0.65, 1.4 - this.elapsed * 0.04);
          const scrollSpd = 100 + this.elapsed * 5;

          // Spawn
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = rate;
            const r = Math.random();
            const type = r < 0.45 ? 'log' : r < 0.75 ? 'sand' : 'wake';
            this.obs.push({
              x: 22 + Math.random() * (W - 44),
              y: -22,
              type,
              w: type === 'sand' ? 58 : type === 'log' ? 30 : 50,
              h: type === 'sand' ? 14 : type === 'log' ? 10 :  8,
            });
          }

          // Move obstacles
          for (const o of this.obs) o.y += scrollSpd * dt;
          this.obs = this.obs.filter(o => o.y < H + 30);

          // Collision
          const RY = H * 0.72, RW = 18, RH = 6;
          for (const o of this.obs) {
            if (!o.hit &&
                Math.abs(o.x - this.rx) < o.w / 2 + RW - 4 &&
                Math.abs(o.y - RY) < o.h / 2 + RH) {
              o.hit = true;
              this.lives--;
              api.shake(5, 0.28); api.flash('#7a5020', 0.3); api.audio.sfx('hurt');
              api.burst(this.rx, RY, C.log, 8);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          api.addScore(Math.floor(dt * 25));
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Night river
          const riv = c.createLinearGradient(0, 0, 0, H);
          riv.addColorStop(0, C.riverD); riv.addColorStop(1, C.river);
          c.fillStyle = riv; c.fillRect(0, 0, W, H);
          // Moving ripples
          for (let i = 0; i < 8; i++) {
            const wy = ((api.t * 60 + i * 60) % (H + 8)) - 8;
            c.fillStyle = C.riverL; c.globalAlpha = 0.06;
            c.fillRect(0, wy, W, 2);
          }
          c.globalAlpha = 1;
          // Bank strips
          c.fillStyle = C.landD; c.fillRect(0, 0, 20, H);
          c.fillStyle = C.land;  c.fillRect(0, 0, 16, H);
          c.fillStyle = C.landD; c.fillRect(W - 20, 0, 20, H);
          c.fillStyle = C.land;  c.fillRect(W - 16, 0, 16, H);
          // Stars
          for (let i = 0; i < 14; i++) {
            const sx = 22 + (i * 23) % (W - 44);
            const sy = (i * 37) % (H * 0.42);
            c.globalAlpha = 0.45 + 0.35 * Math.sin(api.t * 1.5 + i);
            g.rect(sx, sy, 2, 2, '#fff8e0');
          }
          c.globalAlpha = 1;
          // Obstacles
          for (const o of this.obs) {
            if (o.type === 'log') {
              g.rect(o.x - 15, o.y - 5, 30, 10, C.log);
              g.rect(o.x - 12, o.y - 3, 24,  6, C.logD);
            } else if (o.type === 'sand') {
              g.rect(o.x - 29, o.y - 7, 58, 14, C.mud);
              g.rect(o.x - 24, o.y - 4, 48,  8, '#9a7a48');
            } else {
              // wake lines
              c.strokeStyle = C.riverL; c.lineWidth = 1.5; c.globalAlpha = 0.7;
              for (let k = -1; k <= 1; k++) {
                c.beginPath();
                c.moveTo(o.x - 25, o.y + k * 4);
                c.quadraticCurveTo(o.x, o.y + k * 4 - 5, o.x + 25, o.y + k * 4);
                c.stroke();
              }
              c.globalAlpha = 1;
            }
          }
          // Raft + characters
          const RY = H * 0.72;
          g.rect(this.rx - 18, RY - 5, 36, 9, C.raft);
          g.rect(this.rx - 16, RY - 3, 32, 5, C.raftD);
          // Huck with pole
          g.rect(this.rx - 9, RY - 15, 6, 13, C.huck);
          g.rect(this.rx - 10, RY - 22, 8, 7, C.huckH);
          c.strokeStyle = C.log; c.lineWidth = 2;
          c.beginPath(); c.moveTo(this.rx - 6, RY - 15); c.lineTo(this.rx - 15, RY - 27); c.stroke();
          // Jim sitting
          g.rect(this.rx + 5, RY - 9, 7, 9, C.jim);
          g.rect(this.rx + 4, RY - 15, 9, 7, C.jimH);

          api.topBar('RIVER · ' + Math.ceil(this.timer) + 's');
          drawLives(api, this.lives, 3);
          api.vignette();
        },
      },

      /* ==================================================================
       * 3. ROYAL NONESUCH — catch gold coins, dodge rotten tomatoes
       * ================================================================== */
      {
        id: 'nonesuch', name: 'ROYAL NONESUCH', sub: 'The con man\'s trick',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 7, C.gold);
          g.circle(x, y, 4, C.goldL);
        },
        intro: [
          'THE DUKE AND KING',
          'have the whole town fooled.',
          'Coins RAIN from the crowd.',
          'Catch 12 before the angry',
          'TOMATOES start flying!',
        ],
        quote: 'It was enough to make a body ashamed of the human race.',
        help:  'DRAG or ARROWS left/right. Catch 12 GOLD COINS. Dodge RED TOMATOES.',
        winText:  'Pockets jingling! The Duke tips his hat. Time to run.',
        loseText: 'Pelted off the stage! The crowd ain\'t fooled no more.',

        init(api) {
          this.px     = api.W / 2;
          this.coins  = [];
          this.toms   = [];
          this.caught = 0;
          this.lives  = 3;
          this.spawnC = 0.5;
          this.spawnT = 2.2;
          this.invT   = 0;
          this.elapsed = 0;
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          const spd = 100;
          if (api.keyDown('left'))  this.px -= spd * dt;
          if (api.keyDown('right')) this.px += spd * dt;
          if (api.pointer.down) {
            this.px += clamp(api.pointer.x - this.px, -spd * dt * 2.5, spd * dt * 2.5);
          }
          this.px = clamp(this.px, 16, W - 16);
          this.elapsed += dt;

          // Spawn coins
          this.spawnC -= dt;
          if (this.spawnC <= 0) {
            this.spawnC = Math.max(0.7, 1.4 - this.caught * 0.04);
            this.coins.push({
              x: 14 + Math.random() * (W - 28),
              y: -8,
              vy: 90 + Math.random() * 40,
            });
          }
          // Spawn tomatoes (increasing frequency)
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(1.1, 2.2 - this.elapsed * 0.06);
            this.toms.push({
              x: 14 + Math.random() * (W - 28),
              y: -8,
              vy: 80 + Math.random() * 60,
            });
          }

          // Move
          for (const co of this.coins) co.y += co.vy * dt;
          for (const to of this.toms)  to.y += to.vy * dt;

          const PY = H * 0.80;
          // Catch coins
          for (const co of this.coins) {
            if (!co.caught && co.y > PY - 12 && co.y < PY + 20 && Math.abs(co.x - this.px) < 24) {
              co.caught = true;
              this.caught++;
              api.audio.sfx('coin'); api.burst(co.x, co.y, C.gold, 6); api.addScore(15);
              if (this.caught >= 12) { api.win(); return; }
            }
          }
          // Tomato hits
          if (this.invT > 0) { this.invT -= dt; }
          else {
            for (const to of this.toms) {
              if (!to.hit && to.y > PY - 14 && to.y < PY + 22 && Math.abs(to.x - this.px) < 18) {
                to.hit = true;
                this.lives--;
                this.invT = 0.8;
                api.flash(C.tomato, 0.3); api.shake(5, 0.3); api.audio.sfx('hurt');
                api.burst(to.x, to.y, C.tomato, 8);
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          }

          // Cleanup
          this.coins = this.coins.filter(co => co.y < H + 16 && !co.caught);
          this.toms  = this.toms.filter(to => to.y < H + 16 && !to.hit);
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Saloon interior
          c.fillStyle = '#1a1008'; c.fillRect(0, 0, W, H);
          // Stage floorboards
          c.fillStyle = '#3a2408'; c.fillRect(0, H * 0.72, W, H * 0.28);
          c.strokeStyle = '#2a1c06'; c.lineWidth = 1;
          for (let i = 0; i < 5; i++) {
            c.beginPath(); c.moveTo(0, H * 0.72 + i * 9 + 5); c.lineTo(W, H * 0.72 + i * 9 + 5); c.stroke();
          }
          // Red curtains
          c.fillStyle = '#8a1818'; c.fillRect(0, 0, 22, H * 0.72);
          c.fillStyle = '#8a1818'; c.fillRect(W - 22, 0, 22, H * 0.72);
          c.fillStyle = '#c02020';
          for (let fold = 0; fold < 4; fold++) {
            const foldX = 11 + Math.sin(fold * 1.9) * 5;
            g.rect(foldX - 4, fold * H * 0.18, 8, H * 0.2, '#c02020');
            g.rect(W - foldX - 4, fold * H * 0.18, 8, H * 0.2, '#c02020');
          }
          // Banner
          g.rect(28, 12, W - 56, 22, '#6a1010');
          api.txtCFit('ROYAL NONESUCH', W / 2, 16, 8, C.goldL, true, W - 60);
          // Duke & King silhouettes on stage back
          g.rect(W * 0.25 - 9, H * 0.45, 18, 28, '#1e1008');
          g.circle(W * 0.25, H * 0.42, 10, '#1e1008');
          g.rect(W * 0.75 - 9, H * 0.45, 18, 28, '#1e1008');
          g.circle(W * 0.75, H * 0.42, 10, '#1e1008');
          // Coins
          for (const co of this.coins) {
            g.circle(co.x, co.y, 7, C.gold);
            g.circle(co.x, co.y, 4, C.goldL);
            api.txtC('$', co.x, co.y - 3, 5, '#1a1008', true);
          }
          // Tomatoes
          for (const to of this.toms) {
            g.circle(to.x, to.y, 7, C.tomato);
            g.circle(to.x - 2, to.y - 2, 3, C.tomL);
            c.strokeStyle = '#408020'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(to.x, to.y - 7); c.lineTo(to.x, to.y - 11); c.stroke();
          }
          // Huck (catching)
          const PY = H * 0.80;
          const flicker = this.invT > 0 && Math.floor(api.t * 8) % 2 === 0;
          if (!flicker) {
            g.rect(this.px - 8, PY - 10, 16, 18, C.huck);
            g.rect(this.px - 9, PY - 19, 18,  9, C.huckH);
            g.rect(this.px - 18, PY - 7,  10,  4, C.huck);  // arms out
            g.rect(this.px + 8,  PY - 7,  10,  4, C.huck);
          }

          api.topBar('GOLD ' + this.caught + '/12');
          drawLives(api, this.lives, 3);
          api.vignette();
        },
      },

      /* ==================================================================
       * 4. THE TUNNEL — timing meter: dig 4 rocks to free Jim
       * ================================================================== */
      {
        id: 'tunnel', name: 'THE TUNNEL', sub: 'Tom\'s crazy plan',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Shovel
          c.strokeStyle = C.log; c.lineWidth = 2;
          c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x + 5, y + 6); c.stroke();
          g.rect(x + 2, y + 4, 8, 6, C.stone);
        },
        intro: [
          "TOM'S GOT A PLAN.",
          "It ain't the simplest,",
          'but it\'s the noblest.',
          'Dig through 4 ROCKS',
          'to reach Jim\'s cell.',
        ],
        quote: 'There warn\'t anything in the world Tom Sawyer wouldn\'t do to make a plan look just right.',
        help:  'TAP or press A when the NEEDLE is in the GOLD ZONE. Break 4 rocks!',
        winText:  "Jim's cell floor gives way! He's free!",
        loseText: 'The noise wakes the household! Scatter!',

        init(api) {
          this.rock    = 0;    // current rock 0-3
          this.hits    = 0;    // hits on current rock
          this.misses  = 0;
          this.needle  = 0.5;  // 0..1
          this.dir     = 1;
          this.speed   = 0.38;
          this.pause   = 0;
          this.hitAnim = 0;
          this.result  = null; // 'hit' | 'miss'
        },

        update(api, dt) {
          if (this.pause > 0) {
            this.pause -= dt;
            if (this.pause <= 0) this.result = null;
            return;
          }
          // Oscillate needle
          this.needle += this.dir * this.speed * dt;
          if (this.needle >= 1) { this.needle = 1; this.dir = -1; }
          if (this.needle <= 0) { this.needle = 0; this.dir = 1; }

          // Check tap
          if (api.confirm()) {
            const zone = Math.max(0.10, 0.18 - this.rock * 0.02);
            if (Math.abs(this.needle - 0.5) < zone) {
              // Hit!
              this.hits++;
              this.result = 'hit';
              this.hitAnim = 0.25;
              this.pause = 0.3;
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H * 0.52, '#a07040', 8);
              api.addScore(25);
              if (this.hits >= 3) {
                // Rock broken!
                this.rock++;
                this.hits = 0;
                this.speed += 0.09; // needle speeds up each rock
                api.audio.sfx('power');
                api.flash('#a07040', 0.28);
                if (this.rock >= 4) { api.win(); return; }
              }
            } else {
              // Miss!
              this.misses++;
              this.result = 'miss';
              this.pause = 0.45;
              api.audio.sfx('hurt');
              api.shake(6, 0.28);
              if (this.misses >= 3) { api.lose(); return; }
            }
          }
          if (this.hitAnim > 0) this.hitAnim -= dt;
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Underground: layered earth
          c.fillStyle = '#180e06'; c.fillRect(0, 0, W, H);
          for (let i = 0; i < 6; i++) {
            c.fillStyle = i % 2 ? '#1e0e06' : '#160c04';
            c.fillRect(0, i * 82, W, 82);
          }
          // Rock face (center)
          const rockX = W / 2, rockY = H * 0.48;
          const rockBroken = this.hits;
          g.rect(rockX - 26, rockY - 26, 52, 50, C.stone);
          g.rect(rockX - 22, rockY - 22, 44, 42, C.stoneL);
          // Crack lines based on hits
          c.strokeStyle = '#201c18'; c.lineWidth = 1.5;
          if (rockBroken >= 1) {
            c.beginPath(); c.moveTo(rockX - 8, rockY - 18); c.lineTo(rockX + 4, rockY + 4); c.stroke();
          }
          if (rockBroken >= 2) {
            c.beginPath(); c.moveTo(rockX + 10, rockY - 12); c.lineTo(rockX - 6, rockY + 10); c.stroke();
          }
          // Hit flash
          if (this.hitAnim > 0) {
            c.fillStyle = '#fff8e0'; c.globalAlpha = this.hitAnim * 2.5;
            c.fillRect(rockX - 26, rockY - 26, 52, 50);
            c.globalAlpha = 1;
          }

          // Tunnel entrance (where Huck digs from, left side)
          const tunY = rockY + 2;
          c.fillStyle = '#2a1608';
          c.beginPath(); c.ellipse(W * 0.18, tunY, 30, 22, 0, 0, Math.PI * 2); c.fill();
          // Huck digging
          const hx = W * 0.18, hy = tunY;
          g.rect(hx - 9, hy - 13, 12, 18, C.huck);
          g.rect(hx - 10, hy - 20, 14, 8, C.huckH);
          // Pickaxe swing
          const swing = this.result === 'hit' ? 6 : 0;
          c.strokeStyle = C.log; c.lineWidth = 2;
          c.beginPath(); c.moveTo(hx + 4, hy - 6); c.lineTo(hx + 26, hy - 20 + swing); c.stroke();
          g.rect(hx + 20, hy - 26 + swing, 14, 5, '#808088');

          // Jim's cell (right side)
          g.rect(W * 0.82 - 14, tunY - 22, 28, 44, C.barn);
          g.rect(W * 0.82 - 10, tunY - 18, 20, 36, '#1e0e06');
          // Jim
          const jy = tunY + 2;
          g.circle(W * 0.82, jy - 2, 8, C.jim);
          g.rect(W * 0.82 - 4, jy + 6, 8, 10, C.jim);
          api.txtC('JIM', W * 0.82, jy + 18, 6, C.gold, true);

          // Rock progress dots
          for (let i = 0; i < 4; i++) {
            const dx = W / 2 - 33 + i * 22;
            g.circle(dx, H * 0.25, 8, i < this.rock ? '#5a9830' : C.stone);
            if (i < this.rock) api.txtC('✓', dx, H * 0.25 - 4, 7, '#f4e8cc', true);
            else if (i === this.rock) {
              // current rock: show hit dots
              for (let h = 0; h < 3; h++) {
                g.circle(dx - 6 + h * 6, H * 0.25 + 14, 4,
                  h < this.hits ? C.gold : '#383028');
              }
            }
          }

          // Timing meter
          const mw = 200, mh = 22, mx = W / 2 - mw / 2, my = H - 90;
          g.rect(mx, my, mw, mh, '#201808');
          c.strokeStyle = C.logD; c.lineWidth = 1; c.strokeRect(mx, my, mw, mh);
          // Zone (green center, shrinks each rock)
          const zone = Math.max(0.10, 0.18 - this.rock * 0.02);
          const gz = mw * (0.5 - zone), gzw = mw * zone * 2;
          g.rect(mx + gz, my, gzw, mh, '#1a5010');
          c.fillStyle = 'rgba(60,200,40,.22)'; c.fillRect(mx + gz, my, gzw, mh);
          // Needle
          const needleCol = this.result === 'hit' ? C.goldL
            : this.result === 'miss' ? '#c02010' : C.cream;
          g.rect(mx + this.needle * mw - 2, my - 5, 4, mh + 10, needleCol);
          api.txtCFit('TAP THE GOLD ZONE', W / 2, my - 18, 7, C.amber, false, W - 20);

          // Rock label
          api.txtC('ROCK ' + (this.rock + 1) + ' OF 4', W / 2, H - 58, 8, C.mud, true);

          api.topBar('THE TUNNEL · rock ' + (this.rock + 1));
          // Misses as red dots
          for (let i = 0; i < 3; i++) {
            g.circle(W - 18 - (2 - i) * 14, 8, 5, i < this.misses ? '#c02010' : '#2a1808');
          }
          api.vignette();
        },
      },

      /* ==================================================================
       * 5. STORM'S END — lightning columns + debris, survive 25 s
       * ================================================================== */
      {
        id: 'storm', name: "STORM'S END", sub: 'Ride the thunder',
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite(['.l.', 'lll', '.l.'], x - 3, y - 3, { l: C.bolt }, 2);
        },
        intro: [
          'THE SKY TURNS BLACK.',
          'Thunder shakes the river.',
          'Lightning splits the darkness.',
          'Dodge the bolts and debris',
          'for 25 seconds.',
        ],
        quote: 'The river was very wide, and was walled with solid timber on both sides.',
        help:  'DRAG or ARROWS left/right. Dodge lightning COLUMNS and river DEBRIS.',
        winText:  'The storm breaks! Dawn colors the Mississippi gold.',
        loseText: 'Lightning struck the raft! Push off and try again.',

        init(api) {
          this.rx       = api.W / 2;
          this.timer    = 25;
          this.lives    = 3;
          this.debris   = [];
          this.bolts    = [];   // {x, state:'warn'|'strike'|'done', t}
          this.spawnD   = 1.0;
          this.spawnB   = 3.5;
          this.elapsed  = 0;
          this.invT     = 0;
          // Rain drops
          this.rain = Array.from({ length: 40 }, () => ({
            x: Math.random() * api.W,
            y: Math.random() * api.H,
          }));
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          const spd = 100;
          if (api.keyDown('left'))  this.rx -= spd * dt;
          if (api.keyDown('right')) this.rx += spd * dt;
          if (api.pointer.down) {
            this.rx += clamp(api.pointer.x - this.rx, -spd * dt * 2.5, spd * dt * 2.5);
          }
          this.rx = clamp(this.rx, 20, W - 20);

          this.timer   -= dt;
          this.elapsed += dt;
          if (this.timer <= 0) { api.win(); return; }

          // Spawn debris
          this.spawnD -= dt;
          if (this.spawnD <= 0) {
            this.spawnD = Math.max(0.45, 1.0 - this.elapsed * 0.022);
            this.debris.push({
              x: 20 + Math.random() * (W - 40),
              y: -22,
              vy: 110 + this.elapsed * 4 + Math.random() * 40,
              w: 10 + Math.random() * 30,
              type: Math.random() < 0.55 ? 'log' : 'barrel',
            });
          }
          // Spawn lightning warnings
          this.spawnB -= dt;
          if (this.spawnB <= 0) {
            this.spawnB = Math.max(1.8, 3.5 - this.elapsed * 0.07);
            this.bolts.push({ x: 22 + Math.random() * (W - 44), t: 0, state: 'warn' });
          }

          // Move debris
          for (const d of this.debris) d.y += d.vy * dt;
          this.debris = this.debris.filter(d => d.y < H + 30);

          // Update bolts
          for (const b of this.bolts) {
            b.t += dt;
            if (b.state === 'warn' && b.t > 1.1) {
              b.state = 'strike'; b.t = 0;
              api.audio.sfx('shoot');
            }
            if (b.state === 'strike' && b.t > 0.32) b.state = 'done';
          }
          this.bolts = this.bolts.filter(b => b.state !== 'done');

          // Rain
          for (const r of this.rain) {
            r.y += (180 + this.elapsed * 1.5) * dt;
            r.x -= 28 * dt;
            if (r.y > H) { r.y = -4; r.x = Math.random() * W; }
            if (r.x < 0) { r.x = W; r.y = Math.random() * H; }
          }

          const RY = H * 0.72;
          if (this.invT > 0) { this.invT -= dt; return; }

          // Debris collision
          for (const d of this.debris) {
            if (!d.hit &&
                Math.abs(d.x - this.rx) < d.w / 2 + 18 &&
                Math.abs(d.y - RY) < 13) {
              d.hit = true;
              this.lives--;
              this.invT = 0.6;
              api.flash('#7a5020', 0.28); api.shake(5, 0.28); api.audio.sfx('hurt');
              api.burst(this.rx, RY, C.log, 6);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          // Lightning collision
          for (const b of this.bolts) {
            if (b.state === 'strike' && Math.abs(b.x - this.rx) < 20) {
              this.lives--;
              this.invT = 0.8;
              api.flash(C.bolt, 0.45); api.shake(10, 0.45); api.audio.sfx('explode');
              b.state = 'done';
              if (this.lives <= 0) { api.lose(); return; }
            }
          }

          api.addScore(Math.floor(dt * 30));
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Storm sky
          c.fillStyle = C.storm; c.fillRect(0, 0, W, H);
          // Dark river
          const riv = c.createLinearGradient(0, H * 0.45, 0, H);
          riv.addColorStop(0, '#1a2838'); riv.addColorStop(1, '#0a1820');
          c.fillStyle = riv; c.fillRect(0, H * 0.45, W, H * 0.55);
          // Storm clouds at top
          c.fillStyle = '#101820'; c.globalAlpha = 0.7;
          for (let i = 0; i < 5; i++) {
            const cx = (i * 62 + 20) % (W + 30) - 15;
            const cy = 18 + (i * 17) % 38;
            c.beginPath(); c.ellipse(cx, cy, 40 + i * 5, 18, 0, 0, Math.PI * 2); c.fill();
          }
          c.globalAlpha = 1;
          // Banks (dark)
          c.fillStyle = '#1a2a10'; c.fillRect(0, 0, 18, H);
          c.fillStyle = '#1a2a10'; c.fillRect(W - 18, 0, 18, H);
          // Lightning bolts
          for (const b of this.bolts) {
            if (b.state === 'warn') {
              c.fillStyle = C.bolt; c.globalAlpha = 0.07 + 0.05 * Math.sin(api.t * 12);
              c.fillRect(b.x - 16, 0, 32, H);
              c.globalAlpha = 1;
              api.txtC('!', b.x, 20, 9, C.bolt, true);
            } else if (b.state === 'strike') {
              c.fillStyle = C.bolt; c.globalAlpha = 0.85;
              c.fillRect(b.x - 5, 0, 10, H);
              c.globalAlpha = 1;
              // Jagged bolt
              c.strokeStyle = '#fff'; c.lineWidth = 3; c.globalAlpha = 0.75;
              c.beginPath();
              let by2 = 0; c.moveTo(b.x, 0);
              while (by2 < H) {
                by2 += 30 + Math.random() * 25;
                c.lineTo(b.x + (Math.random() - 0.5) * 18, Math.min(by2, H));
              }
              c.stroke(); c.globalAlpha = 1;
            }
          }
          // Rain
          c.strokeStyle = '#7ab8d8'; c.lineWidth = 1; c.globalAlpha = 0.45;
          for (const r of this.rain) {
            c.beginPath(); c.moveTo(r.x, r.y); c.lineTo(r.x + 3, r.y + 9); c.stroke();
          }
          c.globalAlpha = 1;
          // Debris
          for (const d of this.debris) {
            if (d.type === 'log') {
              g.rect(d.x - d.w / 2, d.y - 5, d.w, 10, C.log);
              g.rect(d.x - d.w / 2 + 2, d.y - 3, d.w - 4, 6, C.logD);
            } else {
              g.circle(d.x, d.y, 9, C.mud);
              g.circle(d.x, d.y, 5, '#6a4820');
              c.strokeStyle = '#5a3810'; c.lineWidth = 1;
              for (let i = 0; i < 4; i++) {
                const a = i * Math.PI / 2;
                c.beginPath();
                c.moveTo(d.x + Math.cos(a) * 5, d.y + Math.sin(a) * 5);
                c.lineTo(d.x + Math.cos(a) * 9, d.y + Math.sin(a) * 9);
                c.stroke();
              }
            }
          }
          // Raft + Huck
          const RY = H * 0.72;
          g.rect(this.rx - 18, RY - 4, 36, 8, C.raft);
          g.rect(this.rx - 16, RY - 2, 32, 5, C.raftD);
          // Huck crouching
          const flicker = this.invT > 0 && Math.floor(api.t * 8) % 2 === 0;
          if (!flicker) {
            g.rect(this.rx - 7, RY - 9, 12, 8, C.huck);
            g.rect(this.rx - 8, RY - 16, 14, 8, C.huckH);
            // Jim cowering right
            g.rect(this.rx + 5, RY - 7, 8, 6, C.jim);
          }

          api.topBar('STORM · ' + Math.ceil(this.timer) + 's');
          drawLives(api, this.lives, 3);
          api.vignette();
        },
      },

    ], // end chapters
  }); // end RetroSaga.create

})();
