/* ============================================================================
 * TREASURE ISLAND — X MARKS THE SPOT
 * Five chapters through R. L. Stevenson's classic:
 *   1. THE ADMIRAL BENBOW INN — tap map pieces before pirates break in
 *   2. THE HISPANIOLA         — crew social-deduction: from the apple barrel,
 *                               watch the hands' tells and out Silver's men
 *   3. THE STOCKADE           — aim & fire: drag-aim the salvaged ship's gun,
 *                               tap to fire on a reload timer as they charge
 *   4. THE JUNGLE             — steer Jim past lantern beams to find Ben Gunn
 *   5. X MARKS THE SPOT       — dig the hoard, then fight free to the ship
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── shared map-node positions (used by scenery menu path & layout) ── */
  const NODES = [
    { cx: 66,  cy: 388 }, // ch1  Admiral Benbow Inn
    { cx: 196, cy: 312 }, // ch2  The Hispaniola
    { cx: 128, cy: 222 }, // ch3  The Stockade
    { cx: 52,  cy: 148 }, // ch4  The Jungle
    { cx: 170, cy: 78  }, // ch5  X Marks the Spot
  ];

  /* ── colour names ── */
  const PARCH  = '#c8a462';
  const DPARCH = '#9a7438';
  const SEA    = '#1a608c';
  const DSEA   = '#0d2e4a';
  const SAND   = '#d4b47a';
  const GREEN  = '#2a5c18';
  const PIRATE = '#c43030';
  const GOLD   = '#f0c030';

  /* ──────────────────────────────────────────────────────────────────────────
   * EMBLEM — treasure chest with X mark and spilling doubloons
   * ────────────────────────────────────────────────────────────────────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // glow
    c.globalAlpha = 0.18; c.fillStyle = GOLD;
    c.beginPath(); c.arc(cx, cy + 4, 36, 0, 7); c.fill(); c.globalAlpha = 1;
    // chest body
    g.rect(cx - 24, cy - 8, 48, 26, '#6a4018');
    g.rect(cx - 24, cy - 8, 48, 7,  '#4a2c0c');
    g.rect(cx - 24, cy - 2, 48, 2,  '#3a2008');
    // lock
    g.rect(cx - 6, cy - 4, 12, 10, '#d4a830');
    g.rect(cx - 4, cy - 1, 8,  6,  '#c43030');
    // X mark on lid
    g.rect(cx - 14, cy - 7, 2, 6, '#c43030');
    g.rect(cx - 10, cy - 7, 6, 2, '#c43030');
    // straps
    g.rect(cx - 24, cy + 2, 48, 2, '#3a2008');
    g.rect(cx - 24, cy + 8, 48, 2, '#3a2008');
    // doubloons spilling below
    for (let i = 0; i < 5; i++) {
      g.circle(cx - 16 + i * 8, cy + 24, 4, GOLD);
      g.circle(cx - 14 + i * 8, cy + 23, 2, '#f8e050');
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * SCENERY — aged parchment map (menu) / tropical island coast (other)
   * ────────────────────────────────────────────────────────────────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      /* ── AGED PARCHMENT TREASURE MAP ── */
      c.fillStyle = '#c0994a'; c.fillRect(0, 0, W, H);
      // parchment tone variation
      c.globalAlpha = 0.22;
      for (let i = 0; i < 6; i++) {
        c.fillStyle = i % 2 === 0 ? '#9a7020' : '#e8c870';
        c.beginPath();
        c.ellipse(40 + i * 38, 60 + i * 55, 44 + i * 8, 34 + i * 7, i * 0.3, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
      // parchment border (aged dark edge)
      c.fillStyle = '#7a5018';
      const bw = 14;
      c.fillRect(0, 0, W, bw); c.fillRect(0, H - bw, W, bw);
      c.fillRect(0, 0, bw, H); c.fillRect(W - bw, 0, bw, H);
      // inner ruled lines (map detail)
      c.strokeStyle = '#9a7030'; c.lineWidth = 0.5; c.globalAlpha = 0.28;
      for (let y2 = 28; y2 < H - 20; y2 += 22) {
        c.beginPath(); c.moveTo(18, y2); c.lineTo(W - 18, y2); c.stroke();
      }
      c.globalAlpha = 1;
      // torn inner border
      c.strokeStyle = '#7a5018'; c.lineWidth = 1.5;
      c.strokeRect(20, 20, W - 40, H - 40);

      // Sea patch (bottom portion)
      c.fillStyle = '#6a9aaa'; c.globalAlpha = 0.45;
      c.fillRect(18, H - 110, W - 36, 90);
      c.globalAlpha = 1;
      // little waves in sea
      c.strokeStyle = '#4a7a8a'; c.lineWidth = 1; c.globalAlpha = 0.4;
      for (let wy = H - 100; wy < H - 26; wy += 12) {
        c.beginPath(); c.moveTo(22, wy);
        for (let wx = 22; wx < W - 22; wx += 14) c.quadraticCurveTo(wx + 7, wy - 3, wx + 14, wy);
        c.stroke();
      }
      c.globalAlpha = 1;

      // Island silhouette (center of map)
      c.fillStyle = '#5a8830'; c.globalAlpha = 0.55;
      c.beginPath();
      c.moveTo(90, 320); c.quadraticCurveTo(60, 270, 68, 200);
      c.quadraticCurveTo(72, 120, 110, 100);
      c.quadraticCurveTo(150, 80, 180, 110);
      c.quadraticCurveTo(215, 140, 210, 200);
      c.quadraticCurveTo(210, 270, 185, 320);
      c.quadraticCurveTo(140, 350, 90, 320);
      c.closePath(); c.fill(); c.globalAlpha = 1;
      // sandy beach accent
      c.fillStyle = '#d4b470'; c.globalAlpha = 0.4;
      c.beginPath();
      c.moveTo(95, 318); c.quadraticCurveTo(140, 340, 182, 318);
      c.quadraticCurveTo(180, 300, 140, 310); c.quadraticCurveTo(100, 302, 95, 318);
      c.closePath(); c.fill(); c.globalAlpha = 1;

      // Dotted trail connecting chapter nodes
      c.setLineDash([5, 6]); c.strokeStyle = '#8a3010'; c.lineWidth = 1.8; c.globalAlpha = 0.55;
      c.beginPath();
      NODES.forEach((n, i) => { if (i === 0) c.moveTo(n.cx, n.cy); else c.lineTo(n.cx, n.cy); });
      c.stroke(); c.setLineDash([]); c.globalAlpha = 1;

      // Small ship in sea area (animated)
      const shipX = 30 + ((t * 10) % (W - 60));
      const shipY = H - 60;
      c.fillStyle = '#5a3a14'; c.globalAlpha = 0.7;
      c.fillRect(shipX - 12, shipY - 6, 24, 10);
      c.fillRect(shipX - 1, shipY - 18, 2, 14);
      c.fillRect(shipX + 1, shipY - 16, 10, 7);
      c.globalAlpha = 1;

      // Compass rose (lower right)
      const crx = W - 36, cry = H - 38;
      c.strokeStyle = '#7a5018'; c.lineWidth = 1; c.globalAlpha = 0.55;
      c.beginPath(); c.arc(crx, cry, 12, 0, Math.PI * 2); c.stroke();
      for (let a2 = 0; a2 < 8; a2++) {
        const ang = a2 * Math.PI / 4;
        const r1 = a2 % 2 === 0 ? 12 : 8;
        c.beginPath();
        c.moveTo(crx, cry);
        c.lineTo(crx + Math.cos(ang) * r1, cry + Math.sin(ang) * r1);
        c.stroke();
      }
      c.fillStyle = '#c43030'; c.globalAlpha = 0.55;
      c.beginPath();
      c.moveTo(crx, cry - 12); c.lineTo(crx - 3, cry); c.lineTo(crx, cry - 4); c.closePath(); c.fill();
      c.globalAlpha = 1;
      return;
    }

    /* ── TROPICAL ISLAND BACKDROP for boot / intro / result / finale ── */
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1a4878'); sky.addColorStop(0.5, '#2a82b8'); sky.addColorStop(1, '#1a5070');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // clouds
    for (let i = 0; i < 4; i++) {
      const cx2 = ((t * 14 + i * 68) % (W + 50)) - 25;
      const cy2 = 28 + i * 22;
      c.globalAlpha = 0.75; c.fillStyle = '#e8f4ff';
      c.beginPath(); c.arc(cx2,     cy2,     13, 0, 7); c.fill();
      c.beginPath(); c.arc(cx2 + 16, cy2 + 4, 10, 0, 7); c.fill();
      c.beginPath(); c.arc(cx2 - 12, cy2 + 5, 9,  0, 7); c.fill();
    }
    c.globalAlpha = 1;

    // sea horizon
    const seaY = Math.floor(H * 0.56);
    const seaG = c.createLinearGradient(0, seaY, 0, H);
    seaG.addColorStop(0, '#1a608c'); seaG.addColorStop(1, '#0d2e4a');
    c.fillStyle = seaG; c.fillRect(0, seaY, W, H - seaY);

    // wave shimmer
    c.globalAlpha = 0.14;
    for (let i = 0; i < 5; i++) {
      const wy = seaY + 10 + i * 22 + Math.sin(t * 1.4 + i) * 4;
      c.fillStyle = '#7adaee'; c.fillRect(0, wy, W, 2);
    }
    c.globalAlpha = 1;

    // island silhouette on horizon
    c.fillStyle = '#2a5c18';
    c.beginPath();
    c.moveTo(W * 0.22, seaY + 2);
    c.quadraticCurveTo(W * 0.28, seaY - 40, W * 0.35, seaY - 58);
    c.quadraticCurveTo(W * 0.44, seaY - 66, W * 0.5,  seaY - 60);
    c.quadraticCurveTo(W * 0.6,  seaY - 50, W * 0.65, seaY - 36);
    c.quadraticCurveTo(W * 0.72, seaY - 18, W * 0.78, seaY + 2);
    c.closePath(); c.fill();
    // spyglass hill peak
    c.fillStyle = '#3a7020';
    c.beginPath();
    c.moveTo(W * 0.44, seaY - 52);
    c.quadraticCurveTo(W * 0.47, seaY - 84, W * 0.5, seaY - 94);
    c.quadraticCurveTo(W * 0.53, seaY - 84, W * 0.56, seaY - 52);
    c.closePath(); c.fill();
    // beach
    c.fillStyle = '#d4b47a';
    c.beginPath();
    c.moveTo(W * 0.25, seaY + 2); c.quadraticCurveTo(W * 0.5, seaY - 16, W * 0.75, seaY + 2);
    c.closePath(); c.fill();
    // palm
    const px = W * 0.42, py = seaY - 52;
    c.fillStyle = '#5a3a14'; c.fillRect(px - 3, py, 5, 44);
    c.fillStyle = '#2a6c14';
    c.beginPath(); c.ellipse(px - 14, py - 4, 16, 6, -0.5, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(px + 13, py - 6, 16, 6,  0.5, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(px,      py - 10, 12, 5,  0,   0, Math.PI * 2); c.fill();

    // Hispaniola on horizon (animated)
    const shX = W * 0.72 + Math.sin(t * 0.5) * 5;
    const shY = seaY + 4;
    c.fillStyle = '#5a3814';
    c.fillRect(shX - 14, shY - 10, 28, 12);
    c.fillRect(shX - 1, shY - 26, 2, 18);
    c.fillStyle = '#e8dcc0'; c.fillRect(shX + 1, shY - 24, 13, 12);
    c.fillStyle = '#c43030'; c.fillRect(shX - 1, shY - 32, 8, 6);
    c.fillStyle = '#1a1008'; c.fillRect(shX - 1, shY - 38, 6, 5);

    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(6,16,28,.65)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * GAME
   * ══════════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id: 'treasure-island',
    title: 'Treasure Island',
    subtitle: 'IN FIVE CHAPTERS',
    currency: 'DOUBLOONS',
    accent: GOLD,
    credit: 'AFTER R. L. STEVENSON, 1883',
    emblem,
    scenery,
    bootCta:   'TAP TO SET SAIL',
    menuLabel: "FLINT'S TREASURE MAP",
    menuHint:  'CHART YOUR COURSE',
    menuDone:  'THE GOLD IS WON — YOUNG JIM SAILS HOME',

    screens: {
      win:          '#d4a830',
      lose:         '#4a7aa0',
      chapterLabel: '#7a5a28',
      name:         '#f0e0a8',
      sub:          '#d4a830',
      intro:        '#c8a860',
      quote:        '#7a6038',
      help:         '#d4a830',
      score:        '#f0e0a8',
      cur:          GOLD,
      cta:          '#f0e0a8',
      overlay:      'rgba(8,16,30,.84)',
    },
    labels: {
      chapter:  'CHAPTER',
      score:    'DOUBLOONS',
      win:      'PIECES OF EIGHT!',
      lose:     'DAVY JONES CLAIMS YOU',
      cont:     'TAP TO PRESS ON',
      finale:   'TAP FOR THE TREASURE',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO BEGIN',
    },

    menu: {
      colors: { title: '#d4a830', label: '#7a5028', cur: '#f0e0a8' },

      layout(api) {
        const W2 = 88, H2 = 60;
        return NODES.map(n => ({ x: n.cx - W2 / 2, y: n.cy - H2 / 2, w: W2, h: H2 }));
      },

      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        // torn parchment fragment
        c.save();
        c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = sel ? 10 : 5;
        c.fillStyle = sel ? '#ddc070' : '#c8a850';
        c.beginPath();
        c.moveTo(x + 5, y);
        c.lineTo(x + w - 3, y + 2);
        c.lineTo(x + w + 1, y + 3);
        c.lineTo(x + w, y + h - 4);
        c.lineTo(x + w - 2, y + h);
        c.lineTo(x + 2, y + h - 2);
        c.lineTo(x, y + h - 6);
        c.lineTo(x - 1, y + 3);
        c.closePath(); c.fill();
        c.shadowBlur = 0;
        // parchment ruled lines
        c.globalAlpha = 0.15; c.strokeStyle = '#6a4010'; c.lineWidth = 0.8;
        for (let li = 1; li < 4; li++) {
          c.beginPath(); c.moveTo(x + 4, y + li * (h / 4));
          c.lineTo(x + w - 4, y + li * (h / 4)); c.stroke();
        }
        c.globalAlpha = 1;
        // border
        c.strokeStyle = sel ? '#b87820' : '#8a6028'; c.lineWidth = sel ? 2 : 1;
        c.beginPath();
        c.moveTo(x + 5, y); c.lineTo(x + w - 3, y + 2);
        c.lineTo(x + w, y + h - 4); c.lineTo(x + 2, y + h - 2);
        c.lineTo(x, y + 3); c.closePath(); c.stroke();
        // X mark (top-right)
        const xmx = x + w - 14, xmy = y + 14;
        c.strokeStyle = done ? PIRATE : '#9a6a28'; c.lineWidth = done ? 2.5 : 1.5;
        c.beginPath();
        c.moveTo(xmx - 5, xmy - 5); c.lineTo(xmx + 5, xmy + 5);
        c.moveTo(xmx + 5, xmy - 5); c.lineTo(xmx - 5, xmy + 5);
        c.stroke();
        // text
        c.restore();
        api.txtCFit((i + 1) + '. ' + ch.name, x + w / 2, y + 16, 6,   done ? '#7a3010' : '#2e1204', false, w - 8);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2, y + 30, 5.5, '#7a5028', false, w - 8);
        if (done) api.txtCFit('★ CLEARED', x + w / 2, y + h - 13, 5.5, PIRATE, false, w - 8);
      },
    },

    finale: [
      "THE GOLD IS ABOARD.",
      "LONG JOHN SILVER",
      "SLIPS AWAY INTO THE DARK.",
      "",
      "YOUNG JIM HAWKINS SAILS HOME — RICH.",
    ],

    width: 270, height: 480, parent: '#game',
    palette: { gold: GOLD, sea: SEA, sand: SAND },

    chapters: [

      /* ================================================================
       *  1. THE ADMIRAL BENBOW INN
       *  Mechanic: tap-collect — snatch glowing map pieces off the floor
       *  before the pirates break in (timer).
       * ================================================================ */
      {
        id: 'inn', name: 'THE INN', sub: "THE BLACK SPOT",

        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 7, 16, 13, PARCH);
          g.rect(x - 6, y - 4, 12, 7,  '#e0c070');
          g.rect(x - 3, y - 1, 4, 1, '#8a6020');
          g.rect(x - 2, y + 2, 6, 1, '#8a6020');
          // tiny X
          g.rect(x + 2, y - 4, 1, 4, PIRATE);
          g.rect(x,     y - 4, 4, 1, PIRATE);
        },

        intro: [
          "BLIND PEW DELIVERS",
          "THE BLACK SPOT.",
          "JIM MUST FIND",
          "the map and run.",
        ],
        quote: 'I found the oilskin packet with the map inside. My hands shook.',
        help: 'TAP the glowing map pieces before pirates break in!',
        winText:  'Jim dashes out the back. The pirates crash through a heartbeat too late.',
        loseText: 'Pew finds you in the dark. The map — and your chance — is gone.',

        init(api) {
          this.found = 0; this.need = 8;
          this.timer = 22; this.items = [];
          this.spawnT = 0.4; this.warns = 0;
        },

        _spawnItem(api) {
          const isMap = api.chance(0.5);
          this.items.push({
            x: api.rnd(26, api.W - 26),
            y: api.rnd(70, api.H - 60),
            map: isMap,
            life: isMap ? api.rnd(2.6, 4.2) : api.rnd(1.8, 3.0),
            age: 0, gone: false,
          });
        },

        update(api, dt) {
          this.timer -= dt;
          this.spawnT -= dt;
          if (this.spawnT <= 0 && this.items.length < 9) {
            this._spawnItem(api);
            this.spawnT = api.rnd(0.55, 1.1);
          }
          for (const it of this.items) { it.age += dt; it.life -= dt; }
          this.items = this.items.filter(it => !it.gone && it.life > 0);

          if (api.pointer.justDown) {
            let hit = false;
            for (const it of this.items) {
              if (!it.gone && Math.hypot(api.pointer.x - it.x, api.pointer.y - it.y) < 20) {
                it.gone = true; hit = true;
                if (it.map) {
                  this.found++;
                  api.score += 20;
                  api.audio.sfx('coin');
                  api.burst(it.x, it.y, GOLD, 8);
                  if (this.found >= this.need) { api.score += Math.floor(this.timer) * 6; api.win(); }
                } else {
                  this.warns++;
                  api.audio.sfx('hurt'); api.shake(3, 0.15);
                  if (this.warns >= 4) { api.lose(); }
                }
                break;
              }
            }
            if (!hit) {
              this.warns++;
              api.audio.sfx('blip');
              if (this.warns >= 4) api.lose();
            }
          }
          if (this.timer <= 0) api.lose();
          api.score = this.found * 20 + Math.floor(22 - this.timer);
        },

        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          // inn interior: warm firelit planks
          api.clear('#150a04');
          // floorboards
          for (let row = 0; row < 14; row++) {
            const fy = 58 + row * 30;
            g.rect(0, fy, W, 29, row % 2 === 0 ? '#1e1006' : '#180d04');
            g.rect(0, fy, W, 1, '#100804');
          }
          // back wall
          g.rect(0, 0, W, 58, '#120d06');
          // fireplace
          g.rect(W / 2 - 24, 8, 48, 44, '#0e0802');
          g.rect(W / 2 - 20, 12, 40, 36, '#c84a0e');
          g.rect(W / 2 - 16, 14, 32, 28, '#ff8828');
          g.rect(W / 2 - 10, 16, 20, 16, '#ffbb58');
          // table
          g.rect(W / 2 - 52, H / 2 - 14, 104, 9, '#5a3210');
          g.rect(W / 2 - 48, H / 2 - 5,  12, 36, '#3a200a');
          g.rect(W / 2 + 36, H / 2 - 5,  12, 36, '#3a200a');
          // door (shaking with knocking)
          const knock = Math.sin(this.timer < 10 ? api.t * 22 : api.t * 12) *
                        (this.timer < 14 ? 2.0 : 0.8);
          g.rect(8 + knock, 80, 30, 64, '#3a2010');
          g.rectO(8 + knock, 80, 30, 64, '#5a3018', 2);
          g.rect(16 + knock, 106, 10, 14, '#1e0e06');
          if (this.timer < 12 && Math.floor(api.t * 4) % 2 === 0) {
            api.txtC('BANG!', 48, 76, 8, PIRATE);
          }
          // warn flash
          if (this.warns > 0) {
            const wa = (this.warns / 4) * 0.15;
            c.globalAlpha = wa; c.fillStyle = PIRATE;
            c.fillRect(0, 0, W, H); c.globalAlpha = 1;
          }

          // items on the floor
          for (const it of this.items) {
            const fade = clamp(it.age * 3, 0, 1) * clamp(it.life * 2, 0, 1);
            c.globalAlpha = fade;
            if (it.map) {
              // pulsing golden scroll
              const pulse = 0.7 + 0.3 * Math.sin(api.t * 5 + it.x);
              c.globalAlpha = fade * pulse;
              g.rect(it.x - 10, it.y - 8, 20, 16, PARCH);
              g.rect(it.x - 8,  it.y - 5, 16, 10, '#e0c870');
              g.rect(it.x - 1,  it.y - 2, 1,  4,  '#8a6020');
              // X
              c.strokeStyle = PIRATE; c.lineWidth = 1.5;
              c.beginPath();
              c.moveTo(it.x + 2, it.y - 5); c.lineTo(it.x + 8, it.y + 1);
              c.moveTo(it.x + 8, it.y - 5); c.lineTo(it.x + 2, it.y + 1);
              c.stroke();
            } else {
              // coin or candle (junk)
              g.circle(it.x, it.y, 6, '#8a6020');
              g.circle(it.x - 1, it.y - 1, 3, '#b08030');
            }
            c.globalAlpha = 1;
          }

          api.topBar('THE ADMIRAL BENBOW INN');
          api.txt('MAP ' + this.found + '/' + this.need, 6, 20, 9, GOLD);
          g.rect(W - 76, 22, 66, 4, '#2a1008');
          g.rect(W - 76, 22, 66 * clamp(this.timer / 22, 0, 1), 4,
                 this.timer < 8 ? PIRATE : GOLD);
          if (this.warns > 0) {
            for (let wi = 0; wi < 4; wi++) {
              g.rect(W - 76 + wi * 17, 28, 13, 8, wi < this.warns ? PIRATE : '#2a1008');
            }
          }
        },
      },

      /* ================================================================
       *  2. THE HISPANIOLA
       *  Mechanic: crew social-deduction — from the apple barrel, watch
       *  each hand's tells and tap out Silver's secret men before landfall
       *  (Clue-style; GRAY/HUNTER/JOYCE loyal, HANDS/MERRY/ANDERSON his men
       *  — per the novel's own crew split).
       * ================================================================ */
      {
        id: 'hispaniola', name: 'THE HISPANIOLA', sub: 'THE APPLE BARREL',

        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 7, y - 2, 14, 11, '#6a4018');
          g.rect(x - 7, y - 2, 14, 2,  '#8a5820');
          g.rect(x - 7, y + 7, 14, 2,  '#4a2c0c');
          g.circle(x, y - 6, 4, '#e8dcc0');
          g.circle(x, y - 6, 2, '#1a1008');
        },

        intro: [
          "SENT BELOW FOR AN APPLE,",
          "JIM HIDES IN THE BARREL —",
          "AND HEARS SILVER'S MEN",
          "plotting in whispers.",
        ],
        quote: 'From inside the barrel I dared not breathe. Some of these hands meant murder.',
        help: "WATCH each hand for shifty tells, then TAP Silver's secret men!",
        winText:  "Jim slips up to warn the Captain. Now they know which hands to watch.",
        loseText: "An accusation too many — the crew turns ugly before you're sure.",

        init(api) {
          const ROSTER = [
            { name: 'GRAY',     mutineer: false },
            { name: 'HUNTER',   mutineer: false },
            { name: 'JOYCE',    mutineer: false },
            { name: 'HANDS',    mutineer: true  },
            { name: 'MERRY',    mutineer: true  },
            { name: 'ANDERSON', mutineer: true  },
          ];
          const order = [0, 1, 2, 3, 4, 5];
          for (let i = order.length - 1; i > 0; i--) {
            const j = api.rint(0, i);
            const t = order[i]; order[i] = order[j]; order[j] = t;
          }
          const COLS = [api.W * 0.22, api.W * 0.5, api.W * 0.78];
          const ROWS = [190, 300];
          this.crew = order.map((slot, i) => {
            const src = ROSTER[slot];
            return {
              name: src.name, mutineer: src.mutineer,
              x: COLS[i % 3], y: ROWS[Math.floor(i / 3)],
              tellT: api.rnd(0.6, 1.8), tell: 'calm', tellShow: 0,
              sus: 0, caught: false, wrongT: 0,
            };
          });
          this.timer = 30; this.strikes = 0; this.maxStrikes = 2;
          this.caughtN = 0; this.needCatch = 3;
        },

        update(api, dt) {
          this.timer -= dt;
          for (const cr of this.crew) {
            if (cr.caught) continue;
            cr.wrongT = Math.max(0, cr.wrongT - dt);
            cr.tellShow = Math.max(0, cr.tellShow - dt);
            cr.tellT -= dt;
            if (cr.tellT <= 0) {
              const suspicious = api.chance(cr.mutineer ? 0.65 : 0.14);
              cr.tell = suspicious ? 'shifty' : 'calm';
              cr.tellShow = 0.7;
              if (suspicious) cr.sus = Math.min(3, cr.sus + 1);
              cr.tellT = api.rnd(1.4, 2.6);
            }
          }

          if (api.pointer.justDown) {
            let hit = null;
            for (const cr of this.crew) {
              if (!cr.caught && Math.hypot(api.pointer.x - cr.x, api.pointer.y - cr.y) < 26) { hit = cr; break; }
            }
            if (hit) {
              if (hit.mutineer) {
                hit.caught = true; this.caughtN++;
                api.score += 30; api.audio.sfx('coin');
                api.burst(hit.x, hit.y, GOLD, 10); api.shake(2, 0.1);
                if (this.caughtN >= this.needCatch) { api.score += Math.floor(this.timer) * 4; api.win(); }
              } else {
                hit.wrongT = 0.6; this.strikes++;
                api.audio.sfx('hurt'); api.shake(4, 0.2); api.flash(PIRATE, 0.16);
                if (this.strikes > this.maxStrikes) api.lose();
              }
            } else {
              api.audio.sfx('blip');
            }
          }
          if (this.timer <= 0) api.lose();
          api.score = this.caughtN * 30;
        },

        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          // below-decks: warm lamplight over rough planking
          api.clear('#160f08');
          for (let row = 0; row < 16; row++) {
            g.rect(0, row * 30, W, 29, row % 2 === 0 ? '#1c130a' : '#170f08');
          }
          for (let i = 0; i < 4; i++) g.rect(i * 74 + 10, 0, 8, H, 'rgba(0,0,0,.25)');
          c.globalAlpha = 0.16; c.fillStyle = '#f0c860';
          c.beginPath(); c.arc(W / 2, 240, 130, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;

          // Jim's barrel (bottom corner, watching)
          g.rect(10, H - 46, 34, 34, '#5a3814');
          g.rect(10, H - 46, 34, 6,  '#3a2008');
          g.circle(27, H - 40, 4, '#e8dcc0'); g.circle(27, H - 40, 2, '#1a1008');

          for (const cr of this.crew) {
            if (cr.caught) {
              c.globalAlpha = 0.35;
              g.rect(cr.x - 6, cr.y - 12, 12, 22, '#3a3028');
              c.globalAlpha = 1;
              api.txtCFit('BOUND', cr.x, cr.y + 14, 5.5, '#8a8070');
            } else {
              const flinch = cr.wrongT > 0;
              const fc = flinch ? PIRATE : '#c8a050';
              g.rect(cr.x - 5, cr.y - 12, 10, 7,  fc);
              g.rect(cr.x - 6, cr.y - 5,  12, 20, flinch ? '#8a2010' : '#5a4020');
              g.rect(cr.x - 6, cr.y - 16, 12, 4,  '#1a1008');
              for (let i = 0; i < 3; i++) g.rect(cr.x - 11 + i * 8, cr.y - 24, 6, 4, i < cr.sus ? PIRATE : '#3a2c1c');
              if (cr.tellShow > 0) {
                if (cr.tell === 'shifty') {
                  c.strokeStyle = PIRATE; c.lineWidth = 1.6;
                  c.beginPath(); c.moveTo(cr.x - 4, cr.y - 30); c.lineTo(cr.x + 4, cr.y - 30);
                  c.moveTo(cr.x, cr.y - 33); c.lineTo(cr.x, cr.y - 27); c.stroke();
                } else {
                  c.strokeStyle = '#5dff8f'; c.lineWidth = 1.6;
                  c.beginPath(); c.arc(cr.x, cr.y - 30, 4, 0.2, Math.PI - 0.2); c.stroke();
                }
              }
              api.txtCFit(cr.name, cr.x, cr.y + 12, 5.5, '#e8d8b0', false, 60);
            }
          }

          api.topBar('THE APPLE BARREL');
          api.txt('MUTINEERS ' + this.caughtN + '/' + this.needCatch, 6, 20, 8, GOLD);
          for (let i = 0; i < this.maxStrikes + 1; i++) g.rect(W - 16 - i * 14, 4, 10, 10, i < this.strikes ? PIRATE : '#2a1008');
          g.rect(6, H - 12, W - 12, 5, '#2a1008');
          g.rect(6, H - 12, (W - 12) * clamp(this.timer / 30, 0, 1), 5, GOLD);
        },
      },

      /* ================================================================
       *  3. THE STOCKADE
       *  Mechanic: aim & fire — drag to aim the salvaged ship's gun, tap
       *  to fire on a reload timer as Silver's men charge the wall.
       * ================================================================ */
      {
        id: 'stockade', name: 'THE STOCKADE', sub: 'THE OLD GUN SPEAKS',

        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 9, y + 2, 18, 6, '#5a3814');
          g.rect(x - 3, y - 8, 12, 8, '#3a3428');
          g.circle(x + 8, y - 4, 3, '#1a1008');
        },

        intro: [
          "CAPTAIN SMOLLETT HAULED",
          "THE HISPANIOLA'S OWN GUN",
          "ashore. NOW JIM MANS IT",
          "against the charge.",
        ],
        quote: "Fire, and fire quickly — let the old gun answer for the six of us.",
        help: "DRAG to aim the gun · TAP to fire once it's READY!",
        winText:  "The old gun holds the line. Silver's crew breaks off at dawn.",
        loseText: 'The gun falls silent too long. They breach the wall.',

        init(api) {
          this.hp = 5; this.repelled = 0;
          this.timer = 32;
          this.rx = api.W / 2; this.reload = 0; this.reloadMax = 1.05;
          this.pirates = []; this.spawnT = 1.0;
          this.balls = [];
        },

        _spawnPirate(api) {
          this.pirates.push({
            x: api.rnd(24, api.W - 24), y: 76,
            spd: api.rnd(24, 34) + (32 - this.timer) * 0.6,
            hit: false,
          });
        },

        update(api, dt) {
          this.timer -= dt;
          this.reload = Math.max(0, this.reload - dt);

          // aim
          if (api.pointer.down) this.rx = api.pointer.x;
          if (api.keyDown('left'))  this.rx -= 90 * dt;
          if (api.keyDown('right')) this.rx += 90 * dt;
          this.rx = clamp(this.rx, 16, api.W - 16);

          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this._spawnPirate(api);
            this.spawnT = Math.max(0.7, 1.7 - (32 - this.timer) * 0.02);
          }
          const breachY = api.H - 74;
          for (const p of this.pirates) p.y += p.spd * dt;
          const breached = this.pirates.filter(p => !p.hit && p.y >= breachY);
          for (const p of breached) {
            p.hit = true; this.hp--;
            api.shake(6, 0.25); api.flash(PIRATE, 0.15); api.audio.sfx('hurt');
            if (this.hp <= 0) { api.lose(); return; }
          }
          this.pirates = this.pirates.filter(p => !p.hit);

          if (api.pointer.justDown && this.reload <= 0) {
            api.audio.sfx('shoot'); api.shake(4, 0.15);
            this.balls.push({ x: this.rx, t: 0.3 });
            let got = 0;
            for (const p of this.pirates) {
              if (!p.hit && Math.abs(p.x - this.rx) < 30) { p.hit = true; got++; api.burst(p.x, p.y, GOLD, 8); }
            }
            this.pirates = this.pirates.filter(p => !p.hit);
            if (got > 0) { this.repelled += got; api.score += got * 15 + (got > 1 ? 20 : 0); }
            this.reload = this.reloadMax;
          }
          for (const b of this.balls) b.t -= dt;
          this.balls = this.balls.filter(b => b.t > 0);

          api.score = this.repelled * 15 + Math.floor(32 - this.timer);
          if (this.timer <= 0) { api.score += 80; api.win(); }
        },

        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#060e04');
          c.fillStyle = '#0a1606'; c.fillRect(0, 0, W, H);
          for (let i = 0; i < 10; i++) {
            const tx = (i * 28 + 4) % W;
            const th = 40 + (i * 19) % 60;
            g.rect(tx, H - th - 60, 6, th, '#2a1808');
            g.circle(tx + 3, H - th - 60, 14 + (i % 3) * 3, '#0a1e06');
          }
          for (let i = 0; i < 22; i++) g.rect((i * 43 + 7) % W, (i * 29 + 3) % 60, 1, 1, '#c0cca0');

          // stockade wall (near bottom)
          const wallY = H - 74;
          g.rect(0, wallY, W, 10, '#5a3814');
          g.rectO(0, wallY, W, 10, '#3a2008', 1);

          // pirates advancing
          for (const p of this.pirates) {
            const danger = p.y > wallY - 60;
            const fc = danger ? PIRATE : '#c8a050';
            g.rect(p.x - 4, p.y - 9, 8, 6,  fc);
            g.rect(p.x - 5, p.y - 3, 10, 10, danger ? '#8a2010' : '#7a5028');
            g.rect(p.x - 5, p.y - 13, 10, 4, '#1a1008');
          }

          // cannonball impacts
          for (const b of this.balls) {
            c.globalAlpha = clamp(b.t / 0.3, 0, 1);
            g.circle(b.x, wallY - 30, 14, '#c8c8c0');
            c.globalAlpha = 1;
          }

          // the gun (bottom center, tracks aim)
          const gy = H - 40;
          g.rect(this.rx - 10, gy - 6, 20, 12, '#3a3428');
          g.rect(this.rx - 4,  gy - 22, 8, 20, '#2a2620');
          g.circle(this.rx, gy - 22, 5, '#1a1814');
          c.globalAlpha = 0.22; c.strokeStyle = GOLD; c.lineWidth = 1;
          c.beginPath(); c.moveTo(this.rx, gy - 22); c.lineTo(this.rx, wallY - 40); c.stroke();
          c.globalAlpha = 1;

          api.topBar('THE STOCKADE');
          api.txt('REPELLED ' + this.repelled, 6, 20, 9, GOLD);
          for (let i = 0; i < 5; i++) g.rect(W - 14 - i * 14, 4, 10, 10, i < this.hp ? '#5dff8f' : '#1a0804');
          g.rect(6, H - 58, W - 12, 6, '#1a0804');
          g.rect(6, H - 58, (W - 12) * (1 - clamp(this.reload / this.reloadMax, 0, 1)), 6,
                 this.reload <= 0 ? '#5dff8f' : GOLD);
          api.txtCFit(this.reload <= 0 ? 'READY — TAP TO FIRE' : 'RELOADING…', W / 2, H - 68, 6.5,
                      this.reload <= 0 ? '#5dff8f' : '#d4a830');
          g.rect(6, H - 12, W - 12, 5, '#1a0804');
          g.rect(6, H - 12, (W - 12) * clamp(this.timer / 32, 0, 1), 5, GOLD);
        },
      },

      /* ================================================================
       *  4. THE JUNGLE
       *  Mechanic: stealth-dodge — steer Jim past sweeping lantern cones.
       * ================================================================ */
      {
        id: 'jungle', name: 'THE JUNGLE', sub: 'FIND BEN GUNN',

        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 1, y - 2, 2, 10, '#5a3810');
          g.circle(x, y - 5, 7, '#2a6014');
          g.circle(x - 6, y - 3, 4, '#387c18');
          g.circle(x + 6, y - 3, 4, '#387c18');
        },

        intro: [
          "JIM SLIPS AWAY",
          "FROM THE STOCKADE.",
          "HE MUST FIND",
          "the marooned Ben Gunn.",
        ],
        quote: 'I crept through the dark woods, keeping low, avoiding every sound.',
        help: 'DRAG Jim to dodge the lantern beams · reach Ben Gunn!',
        winText:  'Ben Gunn! The castaway grins — and points to where he moved the gold.',
        loseText: 'A pirate lantern catches you in the undergrowth. Prisoner.',

        init(api) {
          this.jx = api.W / 2; this.jy = api.H - 55;
          this.stealth = 3; this.hurtT = 0;
          this.lans = [
            { x: api.W * 0.25, y: 160, ang: 0.3,       spd:  0.65, rng: 72, sw: 0.7 },
            { x: api.W * 0.75, y: 255, ang: Math.PI,    spd: -0.85, rng: 68, sw: 0.65 },
            { x: api.W * 0.5,  y: 340, ang: 1.2,        spd:  1.0,  rng: 60, sw: 0.6  },
          ];
          this.dist = 0; this.done = false; this.newLanT = 0;
        },

        update(api, dt) {
          const f = dt * 60;
          if (this.done) return;

          // Steer Jim
          if (api.pointer.down) {
            const d = api.pointer.x - this.jx;
            this.jx += clamp(d * 0.26 * f, -7 * f, 7 * f);
          }
          if (api.keyDown('left'))  this.jx -= 3.5 * f;
          if (api.keyDown('right')) this.jx += 3.5 * f;
          if (api.keyDown('up'))    this.jy -= 2.0 * f;
          if (api.keyDown('down'))  this.jy += 2.0 * f;
          this.jx = clamp(this.jx, 14, api.W - 14);
          this.jy = clamp(this.jy, 68, api.H - 38);

          // Scroll lanterns toward Jim (jungle moving past)
          for (const ln of this.lans) {
            ln.y  += 1.4 * f;
            ln.ang += ln.spd * dt;
          }
          this.lans = this.lans.filter(ln => ln.y < api.H + 50);

          // Spawn new lanterns from top
          this.newLanT -= dt;
          if (this.newLanT <= 0 && this.lans.length < 4) {
            this.lans.push({
              x: api.rnd(38, api.W - 38), y: -30,
              ang: api.rnd(0, Math.PI * 2), spd: api.rnd(-1.2, 1.2),
              rng: 55 + api.rnd(0, 20), sw: 0.55 + api.rnd(0, 0.3),
            });
            this.newLanT = api.rnd(1.2, 2.4);
          }

          // Hurt cooldown
          this.hurtT = Math.max(0, this.hurtT - dt);

          // Cone detection
          if (this.hurtT <= 0) {
            for (const ln of this.lans) {
              const dx = this.jx - ln.x, dy = this.jy - ln.y;
              const d  = Math.hypot(dx, dy);
              if (d < ln.rng) {
                const ang2 = Math.atan2(dy, dx);
                const diff = Math.abs(((ang2 - ln.ang) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
                if (diff < ln.sw * 0.55) {
                  this.stealth--;
                  api.flash('#f0c830', 0.3); api.shake(4, 0.2); api.audio.sfx('hurt');
                  this.hurtT = 1.2;
                  if (this.stealth <= 0) { this.done = true; api.lose(); return; }
                  break;
                }
              }
            }
          }

          // forward progress is REAL-TIME slow (~16s) so the stealth actually
          // matters — the old 1.5/frame crossed the jungle in ~4.9s untouched.
          this.dist += 0.45 * f;
          api.score = Math.floor(this.dist / 4) + this.stealth * 20;
          if (this.dist >= 440 || this.jy < 90) { api.score += 80; this.done = true; api.win(); }
        },

        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#040a02');
          c.fillStyle = '#060e04'; c.fillRect(0, 0, W, H);

          // trees
          for (let i = 0; i < 13; i++) {
            const tx = (i * 22 + 3) % W;
            const th = 45 + (i * 17) % 65;
            g.rect(tx, H - th, 6, th, '#2a1408');
            g.circle(tx + 3, H - th, 13 + (i % 4) * 3, '#0a1c06');
            g.circle(tx + 3, H - th - 9, 9, '#122a08');
          }

          // moon patch through canopy
          c.globalAlpha = 0.07;
          for (let i = 0; i < 4; i++) {
            c.fillStyle = '#c8e0e8';
            c.beginPath(); c.ellipse((i * 68 + 20) % W, (i * 91 + 50) % H, 20, 9, i * 0.4, 0, Math.PI * 2); c.fill();
          }
          c.globalAlpha = 1;

          // Ben Gunn marker at top
          if (!this.done) {
            const bg = 0.5 + 0.5 * Math.sin(api.t * 3);
            c.globalAlpha = bg * 0.8;
            g.circle(W / 2, 78, 14, '#2a5c18');
            c.globalAlpha = 1;
            api.txtC('B.G.', W / 2, 72, 7, GOLD);
          }

          // lantern beams
          for (const ln of this.lans) {
            c.save(); c.translate(ln.x, ln.y); c.rotate(ln.ang);
            const bGrad = c.createRadialGradient(0, 0, 2, 0, 0, ln.rng);
            bGrad.addColorStop(0, 'rgba(240,200,50,.62)');
            bGrad.addColorStop(1, 'rgba(240,200,50,0)');
            c.fillStyle = bGrad;
            c.beginPath(); c.moveTo(0, 0);
            c.arc(0, 0, ln.rng, -ln.sw * 0.5, ln.sw * 0.5); c.closePath(); c.fill();
            c.restore();
            g.circle(ln.x, ln.y, 5, '#f0c830');
            g.circle(ln.x, ln.y, 3, '#fff0a0');
          }

          // Jim
          const caught = this.hurtT > 0;
          const jc     = caught ? PIRATE : '#c8a050';
          g.rect(this.jx - 3, this.jy - 10, 6, 5, jc);
          g.rect(this.jx - 4, this.jy - 5,  8, 9, caught ? '#8a2010' : '#3a5820');
          if (caught) { c.globalAlpha = 0.5; c.fillStyle = '#f0c830'; c.beginPath(); c.arc(this.jx, this.jy - 5, 18, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }

          api.topBar('THE JUNGLE');
          // stealth pips
          for (let i = 0; i < 3; i++) g.rect(W - 16 - i * 14, 5, 10, 10, i < this.stealth ? '#5dff8f' : '#1a0804');
          api.txt('STEALTH', W - 100, 20, 7, '#5aaa40');
          const prog = clamp(this.dist / 440, 0, 1);
          g.rect(6, H - 12, W - 12, 5, '#0a1806');
          g.rect(6, H - 12, (W - 12) * prog, 5, '#5aaa40');
        },
      },

      /* ================================================================
       *  5. X MARKS THE SPOT
       *  Two phases:
       *   Phase 'dig':    tap X marks on the ground to excavate (8 hits)
       *   Phase 'reveal': brief cutscene — the pit is empty!
       *   Phase 'escape': pirates charge; tap to blast them (8 repelled to win)
       * ================================================================ */
      {
        id: 'treasure', name: 'X MARKS THE SPOT', sub: "FLINT'S HOARD",

        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 5, 16, 12, '#6a4010');
          g.rect(x - 8, y - 5, 16, 4,  '#4a2c08');
          g.rect(x - 3, y - 1, 6,  5,  '#d4a030');
          // X
          g.rect(x - 5, y + 10, 2, 6, PIRATE);
          g.rect(x - 2, y + 10, 5, 2, PIRATE);
        },

        intro: [
          "SILVER LEADS THE DIG.",
          "THE PIT IS EMPTY!",
          "BEN GUNN MOVED IT.",
          "Jim must escape!",
        ],
        quote: "Not a doubloon! Flint's hoard was not there. Fury blazed in Silver's eyes.",
        help: 'DIG the X marks · then BLAST Silver\'s men to reach the ship!',
        winText:  'The gold is aboard. Silver slinks away. Jim sails for home — rich!',
        loseText: "Silver's crew blocks every path. There's no escape.",

        init(api) {
          this.phase  = 'dig';
          this.digs   = 0; this.needDigs = 8;
          this.xs     = []; this.spawnXt  = 0;
          this.revealT = 0;
          this.pirates  = []; this.spawnPt = 0;
          this.hp      = 4; this.cleared  = 0; this.needClear = 8;
          // pre-spawn a few X marks
          for (let i = 0; i < 3; i++) this._spawnX(api);
        },

        _spawnX(api) {
          this.xs.push({
            x: api.rnd(28, api.W - 28),
            y: api.rnd(90, api.H - 60),
            life: api.rnd(2.8, 4.4), age: 0, gone: false,
          });
        },

        _spawnPirate(api) {
          const side = api.rint(0, 2);
          let px, py;
          if (side === 0) { px = 10;          py = api.rnd(90, api.H - 60); }
          else if (side === 1) { px = api.W - 10; py = api.rnd(90, api.H - 60); }
          else { px = api.rnd(28, api.W - 28); py = 72; }
          this.pirates.push({ x: px, y: py, life: 1.1, maxLife: 1.1, done: false });
        },

        update(api, dt) {
          if (this.phase === 'dig') {
            this.spawnXt -= dt;
            if (this.spawnXt <= 0 && this.xs.length < 7) {
              this._spawnX(api);
              this.spawnXt = api.rnd(0.7, 1.4);
            }
            for (const x of this.xs) { x.age += dt; x.life -= dt; }
            this.xs = this.xs.filter(x => !x.gone && x.life > 0);

            if (api.pointer.justDown) {
              let hit = false;
              for (const x of this.xs) {
                if (!x.gone && Math.hypot(api.pointer.x - x.x, api.pointer.y - x.y) < 22) {
                  x.gone = true; hit = true; this.digs++;
                  api.score += 20; api.audio.sfx('coin');
                  api.burst(x.x, x.y, '#c8a040', 10); api.shake(3, 0.12);
                  if (this.digs >= this.needDigs) {
                    this.phase = 'reveal'; this.revealT = 1.6;
                    api.flash(PIRATE, 0.45); api.shake(9, 0.45); api.audio.sfx('hurt');
                  }
                  break;
                }
              }
              if (!hit) api.audio.sfx('blip');
            }

          } else if (this.phase === 'reveal') {
            this.revealT -= dt;
            if (this.revealT <= 0) {
              this.phase = 'escape';
              this.spawnPt = 0.4;
            }

          } else { // escape
            this.spawnPt -= dt;
            if (this.spawnPt <= 0 && this.pirates.length < 8) {
              this._spawnPirate(api);
              this.spawnPt = api.rnd(0.4, 0.9);
            }
            for (const p of this.pirates) p.life -= dt * 0.42;
            const reached = this.pirates.filter(p => !p.done && p.life <= 0);
            for (const p of reached) {
              p.done = true; this.hp--;
              api.shake(5, 0.22); api.flash(PIRATE, 0.14); api.audio.sfx('hurt');
              if (this.hp <= 0) { api.lose(); return; }
            }
            this.pirates = this.pirates.filter(p => !p.done);

            if (api.pointer.justDown) {
              for (const p of this.pirates) {
                if (!p.done && Math.hypot(api.pointer.x - p.x, api.pointer.y - p.y) < 24) {
                  p.done = true; this.cleared++;
                  api.score += 18; api.audio.sfx('shoot');
                  api.burst(p.x, p.y, GOLD, 10);
                  if (this.cleared >= this.needClear) { api.score += 100; api.win(); }
                  break;
                }
              }
            }
            api.score = this.digs * 20 + this.cleared * 18;
          }
        },

        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          if (this.phase === 'dig') {
            api.clear('#1a0e04');
            // jungle clearing
            c.fillStyle = '#1a3a10'; c.fillRect(0, 0, W, 70);
            c.fillStyle = '#c8a040';
            c.beginPath();
            c.moveTo(0, 70);
            c.quadraticCurveTo(W / 2, 58, W, 70);
            c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
            // dirt patches
            c.globalAlpha = 0.18;
            for (let i = 0; i < 14; i++) g.circle((i * 39) % W, 90 + (i * 33) % (H - 120), 4, '#6a3808');
            c.globalAlpha = 1;
            // prior dig holes
            for (let i = 0; i < this.digs; i++) {
              const hx = 28 + (i * 42 + 8) % (W - 56);
              const hy = 100 + (i * 57 + 14) % (H - 160);
              g.circle(hx, hy, 12, '#3a1c04');
              g.circle(hx, hy, 8,  '#1a0c02');
            }
            // X marks
            for (const x of this.xs) {
              const fade = clamp(x.age * 3, 0, 1) * clamp(x.life * 2, 0, 1);
              c.globalAlpha = fade;
              const glow = 0.6 + 0.4 * Math.sin(x.age * 7 + x.x);
              c.globalAlpha = fade * glow;
              c.strokeStyle = PIRATE; c.lineWidth = 3.5;
              c.beginPath();
              c.moveTo(x.x - 12, x.y - 12); c.lineTo(x.x + 12, x.y + 12);
              c.moveTo(x.x + 12, x.y - 12); c.lineTo(x.x - 12, x.y + 12);
              c.stroke();
              c.globalAlpha = fade * (1 - glow) * 0.25;
              c.fillStyle = GOLD;
              c.beginPath(); c.arc(x.x, x.y, 18, 0, Math.PI * 2); c.fill();
              c.globalAlpha = 1;
            }
            api.topBar('X MARKS THE SPOT');
            api.txt('DIGS ' + this.digs + '/' + this.needDigs, 6, 20, 9, GOLD);
            api.txtCFit('DIG WHERE X MARKS!', W / 2, H - 22, 7, DPARCH);

          } else if (this.phase === 'reveal') {
            api.clear('#100404');
            api.txtCFit('THE PIT IS EMPTY!',      W / 2, H / 2 - 30, 10, PIRATE);
            api.txtCFit('Ben Gunn moved the gold.', W / 2, H / 2 + 6,  7,  '#d4a830');
            api.txtCFit("SILVER'S FURY!",           W / 2, H / 2 + 28, 8,  '#ff4020');
            api.topBar('X MARKS THE SPOT');

          } else { // escape
            api.clear('#060e04');
            c.fillStyle = '#0a1806'; c.fillRect(0, 0, W, H);
            // jungle edge
            for (let i = 0; i < 7; i++) {
              const tx = (i * 40 + 5) % W;
              const th = 44 + (i % 3) * 28;
              g.rect(tx, H - th, 7, th, '#2a1408');
              g.circle(tx + 3, H - th, 12, '#0e2008');
            }
            // Hispaniola beacon
            g.rect(W / 2 - 20, 42, 40, 20, '#6a4018');
            g.rect(W / 2 - 1,  28, 2,  20, '#3a2008');
            g.rect(W / 2 + 1,  30, 14, 12, '#dcd8c0');
            const beaconA = 0.5 + 0.5 * Math.sin(api.t * 4);
            c.globalAlpha = beaconA * 0.55; c.fillStyle = GOLD;
            c.beginPath(); c.arc(W / 2, 52, 26, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
            api.txtCFit('REACH THE SHIP!', W / 2, 24, 7, GOLD);

            // pirates
            for (const p of this.pirates) {
              if (p.done) continue;
              g.rect(p.x - 5, p.y - 10, 10, 7,  '#c8a050');
              g.rect(p.x - 6, p.y - 3,  12, 11, '#7a5028');
              g.rect(p.x + 6, p.y - 5,  9,  2,  '#b0b0b0');
              g.rect(p.x - 6, p.y - 14, 12, 4,  '#1a1008');
              const lw3 = 22 * clamp(p.life / p.maxLife, 0, 1);
              g.rect(p.x - 11, p.y - 20, 22, 3, '#1a0804');
              g.rect(p.x - 11, p.y - 20, lw3, 3, PIRATE);
            }

            api.topBar('ESCAPE!');
            api.txt('CLEARED ' + this.cleared + '/' + this.needClear, 6, 20, 9, GOLD);
            for (let i = 0; i < 4; i++) g.rect(W - 16 - i * 14, 5, 10, 10, i < this.hp ? '#5dff8f' : '#1a0804');
          }
        },
      },
    ],
  });
})();
