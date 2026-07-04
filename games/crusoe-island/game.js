/* ============================================================================
 * ROBINSON CRUSOE — ISLAND OF FATE
 * Five trials of survival on a deserted island:
 *   1. THE STORM      — steer/dodge debris on the ship deck
 *   2. SALVAGE        — swim to collect supplies, dodge sharks
 *   3. THE WILD       — stealth: avoid cannibal torch-cones in the jungle
 *   4. FRIDAY         — defend: tap attackers before they reach Friday
 *   5. THE SIGNAL     — timing: pump the bellows to keep the signal fire bright
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ========================== EMBLEM ========================== */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Sandy island mound
    g.rect(cx - 22, cy + 12, 44, 12, '#b89838');
    g.rect(cx - 16, cy + 8, 32, 6, '#c4a840');
    g.rect(cx - 10, cy + 4, 20, 6, '#d4b860');
    // Flag pole
    g.rect(cx - 1, cy - 26, 2, 32, '#8a6030');
    // Flag (cross of St. George — castaway's signal)
    g.rect(cx + 1, cy - 26, 18, 13, '#f0f0e0');
    g.rect(cx + 1, cy - 26, 18, 2, '#cc1010');
    g.rect(cx + 1, cy - 21, 18, 2, '#cc1010');
    g.rect(cx + 7, cy - 26, 2, 13, '#cc1010');
    // Palm tree (left of mound)
    g.rect(cx - 24, cy - 2, 3, 16, '#7a5020');
    g.rect(cx - 30, cy - 6, 7, 3, '#1e6a18');
    g.rect(cx - 34, cy - 4, 6, 3, '#1e6a18');
    g.rect(cx - 22, cy - 8, 8, 3, '#1e6a18');
    g.rect(cx - 28, cy - 2, 5, 3, '#1e6a18');
    // Small coconut
    g.rect(cx - 24, cy + 2, 4, 4, '#6a3a10');
    // Ocean glimmer (bottom)
    c.globalAlpha = 0.35;
    g.rect(cx - 28, cy + 22, 56, 4, '#3a8aaa');
    c.globalAlpha = 1;
  }

  /* ========================= SCENERY ========================== */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Deep ocean sky — NES-flat colour bands
    c.fillStyle = '#06101e'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#0a1828'; c.fillRect(0, 0, W, H * 0.55);
    c.fillStyle = '#0e2238'; c.fillRect(0, H * 0.28, W, H * 0.27);

    // Stars (twinkle)
    for (let i = 0; i < 36; i++) {
      const sx = (i * 71 + 13) % W;
      const sy = (i * 43 + 5) % Math.floor(H * 0.38);
      c.globalAlpha = 0.18 + 0.28 * Math.sin(t * 1.8 + i * 1.1);
      g.rect(sx, sy, 1, 1, '#d8eaff');
    }
    c.globalAlpha = 1;

    // Moon
    const mx = W * 0.80, my = H * 0.13;
    g.circle(mx, my, 18, '#f0e8b0');
    c.globalAlpha = 0.18;
    g.circle(mx - 4, my - 2, 5, '#c0aa30');
    g.circle(mx + 6, my + 5, 3, '#c0aa30');
    c.globalAlpha = 1;

    // Ocean surface
    c.fillStyle = '#0a1e34'; c.fillRect(0, H * 0.5, W, H * 0.5);
    c.fillStyle = '#081828'; c.fillRect(0, H * 0.5, W, 4);

    // Animated wave lines
    for (let i = 0; i < 7; i++) {
      const wy = H * 0.5 + 6 + i * 22;
      const woff = ((t * 16 + i * 44) % (W + 32)) - 16;
      c.globalAlpha = 0.10 + 0.05 * Math.sin(t * 0.9 + i);
      c.fillStyle = '#2a6090';
      c.fillRect(woff, wy, 38, 2);
      c.fillRect(woff + 70, wy + 1, 28, 2);
      c.fillRect(woff + 130, wy, 20, 2);
      c.fillRect(woff + 185, wy + 1, 32, 2);
    }
    c.globalAlpha = 1;

    // Sandy beach strip
    c.fillStyle = '#d4b860'; c.fillRect(0, H - 48, W, 48);
    c.fillStyle = '#c4a840'; c.fillRect(0, H - 50, W, 4);
    // Beach texture dashes
    for (let i = 0; i < 14; i++) {
      c.fillStyle = '#b89838';
      c.fillRect((i * 19 + 5) % W, H - 32 + (i % 3) * 8, 5, 1);
    }

    // Palm trees
    function palm(px) {
      g.rect(px - 2, H - 58, 4, 22, '#7a5020');
      g.rect(px - 1, H - 72, 2, 16, '#7a5020');
      // leaves
      g.rect(px - 16, H - 78, 14, 3, '#1e6a18');
      g.rect(px - 12, H - 82, 10, 3, '#1e6a18');
      g.rect(px - 6, H - 85, 8, 3, '#1e6a18');
      g.rect(px + 1, H - 83, 12, 3, '#1e6a18');
      g.rect(px + 5, H - 79, 10, 3, '#1e6a18');
      g.rect(px - 1, H - 85, 3, 8, '#1e6a18');
      g.rect(px - 2, H - 74, 4, 4, '#6a3a10'); // coconut
    }
    palm(28);
    palm(W - 32);

    // Island on horizon
    if (scene === 'boot' || scene === 'menu') {
      c.fillStyle = '#1a3a18';
      c.beginPath();
      c.ellipse(W * 0.4, H * 0.5, 48, 10, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#1e4a1e';
      c.beginPath();
      c.ellipse(W * 0.4, H * 0.49, 30, 6, 0, 0, Math.PI * 2);
      c.fill();
      // tiny tree silhouette on island
      g.rect(W * 0.4 - 2, H * 0.49 - 12, 4, 12, '#0e2a0e');
      g.circle(W * 0.4, H * 0.49 - 12, 6, '#0e2a0e');
    }

    // Dark overlay for story/result screens
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(6,14,24,.78)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // Parchment tint for the island map
      c.fillStyle = 'rgba(20,12,4,.60)';
      c.fillRect(0, 0, W, H);
      // Faint dotted trail connecting chapter nodes
      c.strokeStyle = 'rgba(180,150,60,.25)';
      c.lineWidth = 1;
      c.setLineDash([3, 5]);
      c.beginPath();
      c.moveTo(57, 141);
      c.lineTo(203, 188);
      c.lineTo(67, 283);
      c.lineTo(203, 348);
      c.lineTo(123, 433);
      c.stroke();
      c.setLineDash([]);
      c.lineWidth = 1;
    }
  }

  /* ========================= SAGA ========================== */
  RetroSaga.create({
    id: 'crusoe-island',
    title: 'Robinson Crusoe',
    subtitle: 'ISLAND OF FATE',
    currency: 'DAYS',

    screens: {
      win:          '#d4b860',
      lose:         '#1a3a5c',
      chapterLabel: '#7a6040',
      name:         '#f0d890',
      sub:          '#e8a040',
      intro:        '#c8b060',
      quote:        '#8a7840',
      help:         '#d4b860',
      score:        '#f0d890',
      cur:          '#d4b860',
      cta:          '#f0d890',
      overlay:      'rgba(6,14,24,.85)',
    },

    labels: {
      chapter:  'TRIAL',
      score:    'DAYS SURVIVED',
      win:      'PROVIDENCE SMILES',
      lose:     'THE ISLAND CLAIMS YOU',
      cont:     'TAP TO PRESS ON',
      finale:   'TAP FOR THE RESCUE',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO BEGIN',
    },

    accent:    '#d4b860',
    credit:    'ROBINSON CRUSOE · DANIEL DEFOE, 1719',
    bootCta:   'TAP TO BEGIN',
    bootLine:  'FIVE TRIALS · ONE CASTAWAY',
    menuLabel: 'THE ISLAND OF DESPAIR',
    menuHint:  'CHOOSE YOUR NEXT TRIAL',
    menuDone:  'RESCUED AT LAST',
    emblem,
    scenery,

    finale: [
      'THE SHIP SEES YOUR SIGNAL.',
      '',
      'AFTER TWENTY-EIGHT YEARS',
      'ON THE ISLAND OF DESPAIR,',
      'ROBINSON CRUSOE',
      'SAILS HOME TO ENGLAND.',
      '',
      'A CASTAWAY NO MORE.',
    ],

    /* =================== CHAPTER-SELECT MENU =================== */
    menu: {
      colors: { title: '#d4b860', label: '#7a6040', cur: '#f0d890' },

      // 5 locations on a hand-drawn island map — S-curve scatter
      layout(api) {
        return [
          { x: 14,  y: 108, w: 86, h: 66 },  // THE STORM   — sea / upper-left
          { x: 160, y: 155, w: 86, h: 66 },  // SALVAGE     — beach / upper-right
          { x: 24,  y: 250, w: 86, h: 66 },  // THE WILD    — jungle / mid-left
          { x: 160, y: 315, w: 86, h: 66 },  // FRIDAY      — clearing / mid-right
          { x: 80,  y: 398, w: 86, h: 66 },  // THE SIGNAL  — hilltop / bottom-center
        ];
      },

      title(api, score) {
        const g = api.gfx, c = api.ctx, W = api.W;
        // Parchment map header
        c.fillStyle = '#100c04';
        c.fillRect(8, 14, W - 16, 84);
        c.strokeStyle = '#6a4a14';
        c.lineWidth = 1;
        c.strokeRect(8, 14, W - 16, 84);
        c.strokeStyle = '#3a2a08';
        c.strokeRect(12, 18, W - 24, 76);
        // Compass rose (small, top-right corner)
        const crx = W - 26, cry = 40;
        g.rect(crx - 1, cry - 8, 2, 16, '#7a5a20');
        g.rect(crx - 8, cry - 1, 16, 2, '#7a5a20');
        g.rect(crx - 1, cry - 6, 2, 4, '#c4a020');  // N point
        // Header text
        api.txtC('ISLAND OF DESPAIR', W / 2, 30, 8, '#d4b860', true);
        api.txtC('DAYS: ' + score, W / 2, 54, 8, '#f0d890', true);
        api.txtC('D. DEFOE · 1719', W / 2, 76, 6, '#6a4a14', true);
      },

      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;

        // Parchment map card with location X mark
        c.fillStyle = sel ? '#1e1408' : '#120c04';
        c.fillRect(x, y, w, h);
        // Outer border
        c.strokeStyle = sel ? '#d4b860' : '#4a3010';
        c.lineWidth = sel ? 2 : 1;
        c.strokeRect(x, y, w, h);
        // Inner frame
        c.strokeStyle = sel ? '#a08030' : '#2a1c08';
        c.lineWidth = 1;
        c.strokeRect(x + 4, y + 4, w - 8, h - 8);

        // X mark (treasure-map style) — top center of card
        const mx = x + w / 2, my = y + 20;
        const xc = done ? '#d4b860' : (sel ? '#f0d890' : '#6a4a18');
        g.rect(mx - 8, my - 1, 16, 2, xc);
        g.rect(mx - 1, my - 8, 2, 16, xc);
        if (done) {
          // Circle around completed X
          c.strokeStyle = '#d4b860';
          c.lineWidth = 1;
          c.beginPath(); c.arc(mx, my, 10, 0, Math.PI * 2); c.stroke();
        } else if (sel) {
          // Selection glow
          c.globalAlpha = 0.15;
          g.circle(mx, my, 14, '#d4b860');
          c.globalAlpha = 1;
        }

        // Chapter name
        api.txtCFit((i + 1) + '. ' + ch.name, x + w / 2, y + h - 30, 7,
          done ? '#d4b860' : (sel ? '#f0d890' : '#b89838'), true, w - 8);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2, y + h - 16, 6,
          done ? '#a08030' : '#5a3810', true, w - 8);
      },
    },

    width: 270, height: 480, parent: '#game',

    /* ===================== CHAPTERS ========================= */
    chapters: [

      /* ========== 1. THE STORM ========== */
      {
        id: 'storm', name: 'THE STORM', sub: 'BATTLE FOR THE HELM',

        icon(api, x, y) {
          const g = api.gfx;
          // Ship wheel
          g.circle(x, y, 8, '#7a5020');
          g.circle(x, y, 5, '#080e14');
          g.rect(x - 8, y - 1, 16, 2, '#7a5020');
          g.rect(x - 1, y - 8, 2, 16, '#7a5020');
          g.rect(x - 6, y - 6, 2, 2, '#7a5020');
          g.rect(x + 4, y - 6, 2, 2, '#7a5020');
          g.rect(x - 6, y + 4, 2, 2, '#7a5020');
          g.rect(x + 4, y + 4, 2, 2, '#7a5020');
        },

        intro: [
          'A VIOLENT SQUALL STRIKES',
          'CRUSOE\'S SHIP OFF HULL.',
          'WAVES CRASH THE DECK.',
          'HOLD THE HELM!',
        ],
        quote: 'I was surprised with a violent squall of wind; it was a very dark night, with the sea breaking shore with great violence.',
        help: 'STEER left/right · dodge falling mast debris · survive 22 seconds',
        winText: 'The ship founders on the reef — but Crusoe reaches shore alive, battered and breathless.',
        loseText: 'A great wave sweeps him overboard. The sea gives no quarter.',

        init(api) {
          this.px = api.W / 2;
          this.lives = 3;
          this.timer = 0;
          this.goal = 22;
          this.debris = [];
          this.nextDebris = 0.6;
          this.iframes = 0;
          this.rain = [];
          for (let i = 0; i < 55; i++) {
            this.rain.push({
              x: api.rnd(0, api.W),
              y: api.rnd(0, api.H),
              dy: api.rnd(2.5, 4.5),
            });
          }
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          const spd = 140;

          // Steer
          if (api.keyDown('left'))  this.px -= spd * dt;
          if (api.keyDown('right')) this.px += spd * dt;
          if (api.pointer.down) {
            const dx = api.pointer.x - this.px;
            this.px += clamp(dx, -spd * dt * 2, spd * dt * 2);
          }
          this.px = clamp(this.px, 14, W - 14);

          // Rain
          for (const r of this.rain) {
            r.y += r.dy * 60 * dt;
            if (r.y > H) { r.y = 0; r.x = api.rnd(0, W); }
          }

          // Timer & difficulty
          this.timer += dt;
          const diff = 1 + this.timer / this.goal * 1.6;

          // Spawn debris
          this.nextDebris -= dt;
          if (this.nextDebris <= 0) {
            this.nextDebris = (0.52 / diff) + 0.08;
            const types = ['mast', 'barrel', 'rope'];
            const tp = types[api.rint(0, 2)];
            const w = tp === 'rope' ? api.rint(14, 28) : api.rint(10, 20);
            const h = tp === 'rope' ? 4 : api.rint(6, 16);
            this.debris.push({
              x: api.rnd(12, W - 12),
              y: -20,
              w, h,
              dy: api.rnd(80, 140) * diff,
              dx: api.rnd(-24, 24),
              tp,
            });
          }

          // Move debris & collision
          const py = H - 62;
          if (this.iframes > 0) this.iframes -= dt;
          this.debris = this.debris.filter(d => {
            d.x += d.dx * dt;
            d.y += d.dy * dt;
            if (this.iframes <= 0) {
              if (d.x < this.px + 14 && d.x + d.w > this.px - 14 &&
                  d.y < py + 14 && d.y + d.h > py - 14) {
                this.lives--;
                this.iframes = 1.1;
                api.shake(5, 0.35);
                api.flash('#330000', 0.22);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return false; }
              }
            }
            return d.y < H + 24;
          });

          if (this.timer >= this.goal) api.win();
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Stormy sky
          c.fillStyle = '#06090e'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#060c16'; c.fillRect(0, 0, W, H * 0.48);
          // Lightning flash
          if (this.timer > 4 && Math.sin(this.timer * 4.1) > 0.94) {
            c.globalAlpha = 0.08;
            c.fillStyle = '#c0d0ff'; c.fillRect(0, 0, W, H * 0.45);
            c.globalAlpha = 1;
          }

          // Ocean
          c.fillStyle = '#08162a'; c.fillRect(0, H * 0.44, W, H);
          // Wave bands
          for (let i = 0; i < 5; i++) {
            const wy = H * 0.44 + 6 + i * 14;
            const wo = ((this.timer * 32 + i * 55) % (W + 36)) - 18;
            c.fillStyle = i % 2 === 0 ? '#122640' : '#0c1c30';
            c.fillRect(wo, wy, 44, 4);
            c.fillRect(wo + 90, wy, 30, 4);
            c.fillRect(wo + 155, wy, 40, 4);
          }

          // Ship deck
          const deckY = H - 72;
          c.fillStyle = '#2e1808'; c.fillRect(0, deckY, W, 72);
          c.fillStyle = '#3c2010'; c.fillRect(0, deckY + 2, W, 6);
          // Planks
          for (let i = 0; i < W; i += 20) {
            c.fillStyle = '#200e04'; c.fillRect(i, deckY, 2, 72);
          }
          // Railing
          c.fillStyle = '#503020'; c.fillRect(0, deckY, W, 4);
          for (let i = 0; i < W; i += 24) {
            c.fillStyle = '#40200c'; c.fillRect(i, deckY - 10, 4, 12);
          }
          // Rigging ropes
          c.strokeStyle = '#a07030';
          c.lineWidth = 1;
          c.beginPath(); c.moveTo(0, 30); c.lineTo(W * 0.6, deckY); c.stroke();
          c.beginPath(); c.moveTo(W, 20); c.lineTo(W * 0.38, deckY); c.stroke();

          // Rain
          c.globalAlpha = 0.42;
          c.fillStyle = '#6090b8';
          for (const r of this.rain) { c.fillRect(r.x, r.y, 1, 5); }
          c.globalAlpha = 1;

          // Debris
          for (const d of this.debris) {
            if (d.tp === 'rope') {
              c.fillStyle = '#b89838'; c.fillRect(d.x, d.y, d.w, d.h);
            } else if (d.tp === 'barrel') {
              c.fillStyle = '#4a2810'; c.fillRect(d.x, d.y, d.w, d.h);
              c.fillStyle = '#8a6030';
              c.fillRect(d.x, d.y + 2, d.w, 2);
              c.fillRect(d.x, d.y + d.h - 4, d.w, 2);
            } else {
              c.fillStyle = '#3a1c08'; c.fillRect(d.x, d.y, d.w, d.h);
              c.fillStyle = '#200e04'; c.fillRect(d.x, d.y, d.w, 2);
            }
          }

          // Crusoe on deck
          const px = this.px, py = H - 62;
          const flicker = this.iframes > 0 && Math.floor(this.iframes * 10) % 2 === 1;
          if (!flicker) {
            // Body (coat)
            c.fillStyle = '#704828'; c.fillRect(px - 6, py - 22, 12, 22);
            // Head
            c.fillStyle = '#c07840'; c.fillRect(px - 5, py - 30, 10, 8);
            // Tricorn hat
            c.fillStyle = '#281408'; c.fillRect(px - 7, py - 36, 14, 5);
            c.fillStyle = '#200e04'; c.fillRect(px - 5, py - 40, 10, 5);
            // Arms on railing
            c.fillStyle = '#704828';
            c.fillRect(px - 14, py - 18, 8, 4);
            c.fillRect(px + 6, py - 18, 8, 4);
          }

          // HUD
          const rem = Math.ceil(Math.max(0, this.goal - this.timer));
          api.topBar('♥ '.repeat(this.lives) + '  HOLD: ' + rem + 's');
        },
      },

      /* ========== 2. SALVAGE ========== */
      {
        id: 'salvage', name: 'SALVAGE', sub: 'RESCUE THE SUPPLIES',

        icon(api, x, y) {
          const g = api.gfx;
          // Barrel with bands
          g.rect(x - 6, y - 7, 12, 14, '#5a3418');
          g.rect(x - 7, y - 2, 14, 3, '#c8a060');
          g.rect(x - 7, y + 3, 14, 2, '#c8a060');
          g.rect(x - 5, y - 9, 10, 2, '#3a1e08');
          g.rect(x - 5, y + 7, 10, 2, '#3a1e08');
        },

        intro: [
          'THE WRECK LIES ON THE REEF.',
          'CRUSOE SWIMS BACK',
          'AGAIN AND AGAIN',
          'TO SAVE WHAT HE CAN.',
        ],
        quote: 'I made eleven voyages to the ship; the first time I brought away as much provision as I could well carry.',
        help: 'MOVE anywhere · collect floating crates · avoid sharks · collect 12',
        winText: 'Enough tools, food and weapons. Now the hard work of building begins.',
        loseText: 'Sharks and exhaustion defeat him. The supplies sink into the deep.',

        init(api) {
          this.px = api.W / 2;
          this.py = api.H * 0.48;
          this.lives = 3;
          this.collected = 0;
          this.goal = 12;
          this.timer = 0;
          this.limit = 28;
          this.crates = [];
          this.nextCrate = 0.6;
          this.iframes = 0;
          this.sharks = [
            { x: 30,        y: api.H * 0.32, dx:  55, speed: 55 },
            { x: api.W - 30, y: api.H * 0.52, dx: -65, speed: 65 },
            { x: api.W * 0.5, y: api.H * 0.68, dx: 48, speed: 48 },
          ];
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          const spd = 120;

          if (api.keyDown('left'))  this.px -= spd * dt;
          if (api.keyDown('right')) this.px += spd * dt;
          if (api.keyDown('up'))    this.py -= spd * dt;
          if (api.keyDown('down'))  this.py += spd * dt;
          if (api.pointer.down) {
            const dx = api.pointer.x - this.px, dy = api.pointer.y - this.py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
              const f = Math.min(1, dist / 40) * 7 * dt;
              this.px += dx * f; this.py += dy * f;
            }
          }
          this.px = clamp(this.px, 10, W - 10);
          this.py = clamp(this.py, H * 0.06, H - 88);

          this.timer += dt;

          // Spawn crates
          this.nextCrate -= dt;
          if (this.nextCrate <= 0) {
            this.nextCrate = api.rnd(1.0, 2.0);
            const side = api.chance(0.5);
            this.crates.push({
              x: side ? -14 : W + 14,
              y: api.rnd(H * 0.1, H * 0.72),
              dx: side ? api.rnd(28, 44) : api.rnd(-44, -28),
              tp: api.rint(0, 2),
            });
          }

          // Move and collect crates
          this.crates = this.crates.filter(cr => {
            cr.x += cr.dx * dt;
            if (Math.abs(cr.x - this.px) < 16 && Math.abs(cr.y - this.py) < 16) {
              this.collected++;
              api.addScore(10);
              api.audio.sfx('coin');
              api.burst(cr.x, cr.y, '#d4b860', 6);
              if (this.collected >= this.goal) { api.win(); return false; }
              return false;
            }
            return cr.x > -30 && cr.x < W + 30;
          });

          // Move sharks
          for (const sh of this.sharks) {
            sh.x += sh.dx * dt;
            if (sh.x > W + 22 || sh.x < -22) sh.dx *= -1;
          }

          // Shark collision
          if (this.iframes > 0) { this.iframes -= dt; } else {
            for (const sh of this.sharks) {
              if (Math.abs(sh.x - this.px) < 22 && Math.abs(sh.y - this.py) < 14) {
                this.lives--;
                this.iframes = 1.2;
                api.shake(4, 0.3);
                api.flash('#330000', 0.2);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }

          if (this.timer >= this.limit) api.lose();
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Ocean depth bands
          c.fillStyle = '#060e1a'; c.fillRect(0, 0, W, H - 82);
          c.fillStyle = '#081428'; c.fillRect(0, H * 0.15, W, H * 0.25);
          c.fillStyle = '#0a1830'; c.fillRect(0, H * 0.4, W, H * 0.32);

          // Ripple lines
          for (let i = 0; i < 9; i++) {
            const ry = 14 + i * 36;
            const rx = ((this.timer * 18 + i * 53) % (W + 28)) - 14;
            c.globalAlpha = 0.09;
            c.fillStyle = '#2a6090';
            c.fillRect(rx, ry, 32, 2);
          }
          c.globalAlpha = 1;

          // Beach at bottom
          c.fillStyle = '#d4b860'; c.fillRect(0, H - 82, W, 82);
          c.fillStyle = '#c4a840'; c.fillRect(0, H - 84, W, 4);

          // Wreck silhouette at surface
          const wx = W * 0.65, wy = H * 0.28;
          c.fillStyle = '#160806';
          c.fillRect(wx - 38, wy + 6, 76, 14);  // hull
          c.fillRect(wx - 22, wy - 20, 8, 26);  // mast 1
          c.fillRect(wx + 12, wy - 12, 6, 18);  // mast 2
          c.fillRect(wx - 22, wy - 14, 32, 4);  // yard

          // Crates
          for (const cr of this.crates) {
            if (cr.tp === 1) {
              // Barrel
              c.fillStyle = '#4a2810'; c.fillRect(cr.x - 8, cr.y - 8, 16, 16);
              c.fillStyle = '#8a6030';
              c.fillRect(cr.x - 8, cr.y - 2, 16, 2);
              c.fillRect(cr.x - 8, cr.y + 4, 16, 2);
            } else if (cr.tp === 2) {
              // Chest
              c.fillStyle = '#7a4a1a'; c.fillRect(cr.x - 8, cr.y - 8, 16, 16);
              c.fillStyle = '#c8a050';
              c.fillRect(cr.x - 8, cr.y - 8, 16, 2);
              c.fillRect(cr.x - 8, cr.y + 6, 16, 2);
              c.fillRect(cr.x - 2, cr.y - 2, 4, 4);
            } else {
              // Crate
              c.fillStyle = '#5a3418'; c.fillRect(cr.x - 8, cr.y - 8, 16, 16);
              c.fillStyle = '#3a1c08';
              c.fillRect(cr.x - 8, cr.y - 8, 16, 2);
              c.fillRect(cr.x - 8, cr.y + 6, 16, 2);
              c.fillRect(cr.x - 8, cr.y - 8, 2, 16);
              c.fillRect(cr.x + 6, cr.y - 8, 2, 16);
            }
          }

          // Sharks
          for (const sh of this.sharks) {
            const facing = sh.dx > 0 ? 1 : -1;
            c.fillStyle = '#183650';
            c.fillRect(sh.x - 22 * facing, sh.y - 6, 44, 10);
            c.fillRect(sh.x - 4, sh.y - 14, 8, 10);           // dorsal fin
            c.fillRect(sh.x + 18 * facing, sh.y - 5, 8, 4);   // upper tail
            c.fillRect(sh.x + 18 * facing, sh.y + 3, 8, 4);   // lower tail
            c.fillStyle = '#d0e8ff'; // eye
            c.fillRect(sh.x + 14 * facing - (facing > 0 ? 2 : 0), sh.y - 2, 2, 2);
          }

          // Crusoe swimming
          const flicker = this.iframes > 0 && Math.floor(this.iframes * 10) % 2 === 1;
          if (!flicker) {
            c.fillStyle = '#704828'; c.fillRect(this.px - 6, this.py - 10, 12, 14);
            c.fillStyle = '#c07840'; c.fillRect(this.px - 4, this.py - 18, 8, 8);
            c.fillStyle = '#704828';
            c.fillRect(this.px - 16, this.py - 8, 10, 4);   // left arm
            c.fillRect(this.px + 6,  this.py - 8, 10, 4);   // right arm
          }

          // HUD
          const rem = Math.ceil(Math.max(0, this.limit - this.timer));
          api.topBar('♥ '.repeat(this.lives) + '  ' + this.collected + '/' + this.goal + ' CRATES  ' + rem + 's');
        },
      },

      /* ========== 3. THE WILD ========== */
      {
        id: 'wild', name: 'THE WILD', sub: 'ESCAPE THE CANNIBALS',

        icon(api, x, y) {
          const g = api.gfx;
          // Torch
          g.rect(x - 2, y + 2, 4, 10, '#7a4a20');
          g.rect(x - 3, y - 1, 6, 5, '#c04000');
          g.rect(x - 2, y - 4, 4, 4, '#e87010');
          g.rect(x - 1, y - 7, 2, 3, '#f0c030');
        },

        intro: [
          'THE ISLAND IS NOT EMPTY.',
          'CANNIBAL BANDS ARRIVE',
          'FROM THE SEA TO FEAST.',
          'CRUSOE MUST HIDE.',
        ],
        quote: 'I had a dreadful thought — that if the savages found me, they would certainly devour me.',
        help: 'MOVE in the shadows · avoid the torch-light cones · survive 25 seconds',
        winText: 'Crusoe vanishes into the trees. The cannibals find nothing but jungle silence.',
        loseText: 'The torchlight falls on him. Terror in the dark.',

        init(api) {
          this.px = api.W / 2;
          this.py = api.H * 0.72;
          this.lives = 3;
          this.timer = 0;
          this.goal = 25;
          this.iframes = 0;
          this.scouts = [
            { x: api.W * 0.25, y: api.H * 0.28, dx:  58, range: 82 },
            { x: api.W * 0.78, y: api.H * 0.48, dx: -50, range: 76 },
            { x: api.W * 0.50, y: api.H * 0.65, dx:  46, range: 70 },
          ];
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          const spd = 105;

          if (api.keyDown('left'))  this.px -= spd * dt;
          if (api.keyDown('right')) this.px += spd * dt;
          if (api.keyDown('up'))    this.py -= spd * dt;
          if (api.keyDown('down'))  this.py += spd * dt;
          if (api.pointer.down) {
            const dx = api.pointer.x - this.px, dy = api.pointer.y - this.py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
              const f = Math.min(1, dist / 40) * 6.5 * dt;
              this.px += dx * f; this.py += dy * f;
            }
          }
          this.px = clamp(this.px, 8, W - 8);
          this.py = clamp(this.py, H * 0.06, H - 88);

          this.timer += dt;
          const diff = 1 + this.timer / this.goal * 0.55;

          // Move scouts
          for (const sc of this.scouts) {
            sc.x += sc.dx * diff * dt;
            if (sc.x > W + 24 || sc.x < -24) sc.dx *= -1;
          }

          // Detect player in torch cone
          if (this.iframes > 0) { this.iframes -= dt; } else {
            for (const sc of this.scouts) {
              const dx = this.px - sc.x, dy = this.py - sc.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < sc.range) {
                const toPlayer = Math.atan2(dy, dx);
                const scFacing = sc.dx > 0 ? 0 : Math.PI;
                let diff2 = toPlayer - scFacing;
                while (diff2 > Math.PI) diff2 -= Math.PI * 2;
                while (diff2 < -Math.PI) diff2 += Math.PI * 2;
                if (Math.abs(diff2) < 0.58) {
                  this.lives--;
                  this.iframes = 1.4;
                  api.shake(4, 0.3);
                  api.flash('#331a00', 0.25);
                  api.audio.sfx('hurt');
                  if (this.lives <= 0) { api.lose(); return; }
                }
              }
            }
          }

          if (this.timer >= this.goal) api.win();
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Dense jungle night
          c.fillStyle = '#040a04'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#060c06'; c.fillRect(0, H * 0.68, W, H * 0.32);
          // Sandy ground
          c.fillStyle = '#d4b860'; c.fillRect(0, H - 48, W, 48);
          c.fillStyle = '#c4a840'; c.fillRect(0, H - 50, W, 4);

          // Background tree silhouettes
          const treesBack = [
            [10, H - 118], [46, H - 108], [95, H - 128], [148, H - 112],
            [200, H - 122], [240, H - 106],
          ];
          c.fillStyle = '#060a06';
          for (const [tx, ty] of treesBack) {
            c.fillRect(tx - 5, ty - 26, 10, 28);
            c.beginPath(); c.arc(tx, ty - 26, 18, 0, Math.PI * 2); c.fill();
          }

          // Torch cones (warm glow — NES-honest: layered flat circles, not smooth gradient)
          for (const sc of this.scouts) {
            const facing = sc.dx > 0 ? 0 : Math.PI;
            const fx = sc.x + Math.cos(facing) * 8;
            const fy = sc.y + Math.sin(facing) * 8;
            // Layer 3 (outermost, faintest)
            c.globalAlpha = 0.05;
            c.fillStyle = '#e08030';
            c.beginPath();
            c.moveTo(sc.x, sc.y);
            c.arc(sc.x, sc.y, sc.range, facing - 0.62, facing + 0.62);
            c.closePath(); c.fill();
            // Layer 2
            c.globalAlpha = 0.09;
            c.beginPath();
            c.moveTo(sc.x, sc.y);
            c.arc(sc.x, sc.y, sc.range * 0.6, facing - 0.48, facing + 0.48);
            c.closePath(); c.fill();
            // Layer 1 (inner, brightest)
            c.globalAlpha = 0.14;
            c.beginPath();
            c.moveTo(sc.x, sc.y);
            c.arc(sc.x, sc.y, sc.range * 0.3, facing - 0.34, facing + 0.34);
            c.closePath(); c.fill();
            c.globalAlpha = 1;
          }

          // Scouts (cannibal torchbearers)
          for (const sc of this.scouts) {
            const facing = sc.dx > 0 ? 1 : -1;
            c.fillStyle = '#3a1e0a'; c.fillRect(sc.x - 5, sc.y - 16, 10, 16);
            c.fillStyle = '#6a3818'; c.fillRect(sc.x - 4, sc.y - 24, 8, 8);
            // Torch arm
            c.fillStyle = '#6a4010';
            c.fillRect(sc.x + 5 * facing, sc.y - 20, facing * 4, 4);
            // Flame
            c.fillStyle = '#d04000';
            c.fillRect(sc.x + (facing > 0 ? 10 : -14), sc.y - 26, 4, 6);
            c.fillStyle = '#f09020';
            c.fillRect(sc.x + (facing > 0 ? 11 : -13), sc.y - 30, 2, 4);
          }

          // Foreground trees (cover)
          const treesFront = [
            [18, H - 98], [70, H - 88], [128, H - 102], [178, H - 90], [235, H - 96],
          ];
          c.fillStyle = '#040804';
          for (const [tx, ty] of treesFront) {
            c.fillRect(tx - 6, ty - 30, 12, 32);
            c.beginPath(); c.arc(tx, ty - 30, 22, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.arc(tx - 10, ty - 18, 15, 0, Math.PI * 2); c.fill();
          }

          // Crusoe
          const flicker = this.iframes > 0 && Math.floor(this.iframes * 10) % 2 === 1;
          if (!flicker) {
            c.fillStyle = '#503018'; c.fillRect(this.px - 5, this.py - 18, 10, 18);
            c.fillStyle = '#b06830'; c.fillRect(this.px - 4, this.py - 26, 8, 8);
            c.fillStyle = '#201008'; c.fillRect(this.px - 6, this.py - 32, 12, 5); // hat
          }

          const rem = Math.ceil(Math.max(0, this.goal - this.timer));
          api.topBar('♥ '.repeat(this.lives) + '  HIDE: ' + rem + 's');
        },
      },

      /* ========== 4. FRIDAY ========== */
      {
        id: 'friday', name: 'FRIDAY', sub: 'THE RESCUE',

        icon(api, x, y) {
          const g = api.gfx;
          // Two figures side by side
          g.rect(x - 8, y - 8, 6, 10, '#7a3a10');
          g.rect(x + 2, y - 8, 6, 10, '#7a5828');
          g.rect(x - 7, y - 14, 5, 6, '#b85830');
          g.rect(x + 3, y - 14, 5, 6, '#c07840');
        },

        intro: [
          'A PRISONER BREAKS FREE,',
          'FLEEING THE CANNIBALS.',
          'CRUSOE WATCHES —',
          'THEN ACTS!',
        ],
        quote: 'I call him Friday, which was the day I saved his life; I call him my man Friday.',
        help: 'TAP attackers before they reach Friday! · defeat 10',
        winText: 'The attackers scatter into the jungle. Friday kneels at Crusoe\'s feet. A friendship for life.',
        loseText: 'Overwhelmed by numbers. Friday is dragged back.',

        init(api) {
          this.lives = 3;
          this.defeated = 0;
          this.goal = 10;
          this.attackers = [];
          this.nextSpawn = 0.9;
          this.timer = 0;
          this.fridayX = api.W / 2;
          this.fridayY = api.H * 0.52;
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer += dt;
          const diff = 1 + this.timer / 24 * 0.85;

          // Spawn attackers
          this.nextSpawn -= dt;
          if (this.nextSpawn <= 0) {
            this.nextSpawn = (1.4 / diff) + api.rnd(0.1, 0.4);
            const side = api.chance(0.5);
            this.attackers.push({
              x: side ? -18 : W + 18,
              y: api.rnd(H * 0.18, H * 0.72),
              dx: (side ? 52 : -52) * diff,
              hp: 1,
            });
          }

          // Move attackers
          for (const att of this.attackers) {
            att.x += att.dx * dt;
          }

          // Tap to defeat
          if (api.pointer.justDown) {
            const tx = api.pointer.x, ty = api.pointer.y;
            for (const att of this.attackers) {
              if (att.hp > 0 &&
                  Math.abs(att.x - tx) < 20 && Math.abs(att.y - ty) < 20) {
                att.hp = 0;
                this.defeated++;
                api.addScore(10);
                api.audio.sfx('shoot');
                api.burst(att.x, att.y, '#d4b860', 6);
                if (this.defeated >= this.goal) { api.win(); return; }
                break;
              }
            }
          }

          // Filter: remove defeated or those that reached Friday
          this.attackers = this.attackers.filter(att => {
            if (att.hp <= 0) return false;
            const dist = Math.sqrt(
              (att.x - this.fridayX) ** 2 + (att.y - this.fridayY) ** 2
            );
            if (dist < 24) {
              this.lives--;
              api.shake(5, 0.3);
              api.flash('#330000', 0.2);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return false; }
              return false;
            }
            return att.x > -32 && att.x < api.W + 32;
          });
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Bright tropical beach scene
          c.fillStyle = '#1a4a6c'; c.fillRect(0, 0, W, H * 0.32);
          c.fillStyle = '#d4b860'; c.fillRect(0, H * 0.28, W, H * 0.72);
          c.fillStyle = '#c4a840'; c.fillRect(0, H * 0.28, W, 4);
          // Wave bands at top
          for (let i = 0; i < 4; i++) {
            const wy = H * 0.28 - 10 + i * 12;
            c.fillStyle = i % 2 ? '#1a4a6c' : '#0e2a44';
            c.fillRect(0, wy, W, 12);
          }

          // Jungle tree line in background
          c.fillStyle = '#1a3a18';
          for (let i = 0; i < W; i += 28) {
            const th = 26 + (i * 7) % 18;
            c.fillRect(i, H * 0.3, 22, th);
            c.beginPath(); c.arc(i + 11, H * 0.3, 13, 0, Math.PI * 2); c.fill();
          }

          // Friday (center)
          c.fillStyle = '#6a2e08'; c.fillRect(this.fridayX - 6, this.fridayY - 18, 12, 18);
          c.fillStyle = '#c07040'; c.fillRect(this.fridayX - 5, this.fridayY - 26, 10, 8);
          // Arms up (grateful)
          c.fillStyle = '#6a2e08';
          c.fillRect(this.fridayX - 14, this.fridayY - 20, 8, 4);
          c.fillRect(this.fridayX + 6,  this.fridayY - 20, 8, 4);
          // Cross-glow around Friday (target area indicator)
          c.globalAlpha = 0.12;
          g.circle(this.fridayX, this.fridayY - 10, 24, '#f0d890');
          c.globalAlpha = 1;

          // Attackers (cannibals)
          for (const att of this.attackers) {
            const facing = att.dx > 0 ? 1 : -1;
            c.fillStyle = '#3a1a06'; c.fillRect(att.x - 6, att.y - 16, 12, 16);
            c.fillStyle = '#7a3818'; c.fillRect(att.x - 5, att.y - 24, 10, 8);
            // Spear
            c.fillStyle = '#8a6030';
            c.fillRect(att.x + 6 * facing, att.y - 22, facing * 16, 2);
            c.fillStyle = '#c8a020';
            c.fillRect(att.x + (facing > 0 ? 20 : -22), att.y - 26, 2, 5);
          }

          api.topBar('♥ '.repeat(this.lives) + '  DEFEATED: ' + this.defeated + '/' + this.goal);
        },
      },

      /* ========== 5. THE SIGNAL ========== */
      {
        id: 'signal', name: 'THE SIGNAL', sub: 'LIGHT THE FIRE',

        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y + 4, 12, 6, '#5a3010');  // log
          g.rect(x - 4, y - 2, 8, 8, '#c04000');    // fire body
          g.rect(x - 2, y - 6, 4, 5, '#e08020');    // flame mid
          g.rect(x - 1, y - 10, 2, 4, '#f0d030');   // flame tip
        },

        intro: [
          'YEARS PASS ON THE ISLAND.',
          'ONE DAY A SHIP APPEARS',
          'ON THE HORIZON.',
          'ONE CHANCE — LIGHT THE FIRE!',
        ],
        quote: 'I went and set fire to a heap of fresh wood, which sent up so great a smoke that the ship bore down directly towards it.',
        help: 'TAP / A when the BELLOWS reach the GOLDEN ZONE · keep the fire bright · 8 hits',
        winText: 'The ship turns toward the island. After twenty-eight years, Crusoe goes home.',
        loseText: 'The fire gutters out. The ship sails on. The island keeps its prisoner.',

        init(api) {
          this.hits = 0;
          this.goal = 8;
          this.misses = 0;
          this.maxMisses = 4;
          this.angle = 0;
          this.speed = 1.9;  // pendulum speed (radians/sec)
          this.zoneW = 0.50; // half-width of zone as fraction of needle range
          this.hitFlash = 0;
          this.missFlash = 0;
          this.fireLevel = 0;
        },

        update(api, dt) {
          this.angle += this.speed * dt;
          if (this.hitFlash > 0) this.hitFlash -= dt;
          if (this.missFlash > 0) this.missFlash -= dt;

          const tryHit = api.pointer.justDown ||
                         api.keyPressed('a') || api.keyPressed('start');
          if (tryHit) {
            const needlePos = Math.sin(this.angle); // -1 to 1
            if (Math.abs(needlePos) < this.zoneW) {
              this.hits++;
              this.hitFlash = 0.4;
              this.fireLevel = this.hits / this.goal;
              this.speed += 0.16;
              this.zoneW = Math.max(0.13, this.zoneW * 0.87);
              api.addScore(15);
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H * 0.4, '#e86010', 8);
              if (this.hits >= this.goal) api.win();
            } else {
              this.misses++;
              this.missFlash = 0.4;
              api.audio.sfx('hurt');
              api.shake(2, 0.18);
              if (this.misses >= this.maxMisses) api.lose();
            }
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Night hilltop looking out to sea
          c.fillStyle = '#040c14'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#060e1a'; c.fillRect(0, 0, W, H * 0.6);

          // Stars
          for (let i = 0; i < 42; i++) {
            const sx = (i * 67 + 17) % W;
            const sy = (i * 43 + 7) % Math.floor(H * 0.52);
            c.globalAlpha = 0.18 + 0.28 * Math.sin(this.angle * 1.6 + i * 1.1);
            g.rect(sx, sy, 1, 1, '#d0e0ff');
          }
          c.globalAlpha = 1;

          // Moon
          g.circle(W * 0.82, H * 0.12, 18, '#f0e8b0');

          // Ocean
          c.fillStyle = '#08162a'; c.fillRect(0, H * 0.56, W, H * 0.44);
          // Horizon band
          c.fillStyle = '#0c1e38'; c.fillRect(0, H * 0.56, W, 6);

          // Ship on horizon (growing with fire level)
          const shAlpha = 0.35 + this.fireLevel * 0.45;
          c.globalAlpha = shAlpha;
          c.fillStyle = '#1a1006';
          const shx = W * 0.73, shy = H * 0.58;
          c.fillRect(shx - 22, shy, 44, 9);
          c.fillRect(shx - 3, shy - 30, 4, 30);
          c.fillRect(shx + 2, shy - 22, 16, 12);
          c.fillRect(shx + 2, shy - 8, 14, 8);
          c.fillRect(shx - 26, shy + 5, 52, 6); // waterline shadow
          c.globalAlpha = 1;

          // Hilltop silhouette
          c.fillStyle = '#0c1608'; c.fillRect(0, H * 0.64, W, H * 0.36);
          // Rocky edge
          c.fillStyle = '#081004';
          for (let i = 0; i < W; i += 30) {
            const rh = 8 + (i * 3) % 14;
            c.fillRect(i, H * 0.64 - rh, 26, rh + 4);
          }

          // Signal fire (grows with hits)
          const fx = W / 2, fy = H * 0.67;
          const fh = 14 + this.fireLevel * 44;
          const fw = 26 + this.fireLevel * 12;
          // Log base
          c.fillStyle = '#4a2808'; c.fillRect(fx - fw / 2 - 4, fy, fw + 8, 10);
          c.fillStyle = '#3a1c04'; c.fillRect(fx - fw / 2, fy - 6, fw, 8);
          // Fire layers (flat NES-style blocks)
          if (this.fireLevel > 0) {
            c.fillStyle = '#3a1200'; c.fillRect(fx - fw / 2, fy - fh * 0.1, fw, fh * 0.12);
            c.fillStyle = '#cc3800'; c.fillRect(fx - fw / 2 + 4, fy - fh * 0.42, fw - 8, fh * 0.38);
            c.fillStyle = '#e06010'; c.fillRect(fx - fw / 2 + 8, fy - fh * 0.68, fw - 16, fh * 0.3);
            c.fillStyle = '#f09020'; c.fillRect(fx - fw / 2 + 12, fy - fh * 0.88, fw - 24, fh * 0.24);
            c.fillStyle = '#f8d050'; c.fillRect(fx - fw / 2 + 16, fy - fh * 1.0, fw - 32, fh * 0.16);
            // Smoke
            c.globalAlpha = 0.22;
            c.fillStyle = '#606060';
            for (let i = 0; i < 5; i++) {
              const sw = 8 + i * 6;
              const sy2 = fy - fh - 8 - i * 18;
              const sxoff = Math.sin(this.angle * 0.5 + i) * 5;
              c.fillRect(fx - sw / 2 + sxoff, sy2, sw, 10);
            }
            c.globalAlpha = 1;
            // Fire glow (flat circle overlay)
            c.globalAlpha = 0.08 * this.fireLevel;
            g.circle(fx, fy - fh / 2, 55, '#e06010');
            c.globalAlpha = 1;
          }

          // Pendulum apparatus (bellows)
          const pCX = W / 2, pCY = H * 0.28;
          const pLen = 58;
          const swingAngle = Math.sin(this.angle) * 1.0;
          const tipX = pCX + Math.sin(swingAngle) * pLen;
          const tipY = pCY + Math.cos(swingAngle) * pLen;

          // Pivot frame
          c.fillStyle = '#7a5020'; c.fillRect(pCX - 16, pCY - 8, 32, 10);
          c.fillStyle = '#5a3810'; c.fillRect(pCX - 18, pCY - 10, 36, 4);

          // Zone arc (drawn as a thick arc on the pendulum's swing circle)
          const zoneArcHalf = Math.asin(this.zoneW);
          const zoneColor = this.hitFlash > 0 ? '#20cc40' :
                            this.missFlash > 0 ? '#cc2020' : '#d4b860';
          c.strokeStyle = zoneColor;
          c.lineWidth = 7;
          c.globalAlpha = 0.55;
          c.beginPath();
          c.arc(pCX, pCY, pLen,
            Math.PI / 2 - zoneArcHalf,
            Math.PI / 2 + zoneArcHalf);
          c.stroke();
          c.globalAlpha = 1;
          c.lineWidth = 1;

          // Pendulum arm
          c.strokeStyle = '#8a5a20';
          c.lineWidth = 3;
          c.beginPath(); c.moveTo(pCX, pCY + 2); c.lineTo(tipX, tipY); c.stroke();
          c.lineWidth = 1;

          // Bellows handle (needle tip)
          const nc = this.hitFlash > 0 ? '#20cc40' :
                     this.missFlash > 0 ? '#cc2020' : '#e86010';
          c.fillStyle = nc; c.fillRect(tipX - 7, tipY - 7, 14, 14);
          c.fillStyle = '#5a3010'; c.fillRect(tipX - 5, tipY - 5, 10, 10);
          c.fillStyle = nc; c.fillRect(tipX - 3, tipY - 3, 6, 6);

          // Feedback text
          if (this.hitFlash > 0) api.txtC('PUMP!', W/2, pCY - 22, 9, '#20cc40', true);
          else if (this.missFlash > 0) api.txtC('MISS!', W/2, pCY - 22, 9, '#cc2020', true);

          // Progress dots (hits)
          for (let i = 0; i < this.goal; i++) {
            const sx = W / 2 - (this.goal * 13) / 2 + i * 13 + 6;
            c.fillStyle = i < this.hits ? '#f0d890' : '#2a1808';
            c.fillRect(sx - 4, 6, 8, 8);
          }

          // Miss indicators (red slots, left side)
          for (let i = 0; i < this.maxMisses; i++) {
            c.fillStyle = i < this.misses ? '#cc2020' : '#2a0808';
            c.fillRect(6 + i * 14, 6, 8, 8);
          }
        },
      },

    ], // end chapters
  }); // end RetroSaga.create
})(); // end IIFE
