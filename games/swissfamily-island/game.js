/* ============================================================================
 * SWISS FAMILY ROBINSON — ISLAND BOUND
 * Five island adventures from Johann David Wyss's 1812 novel:
 *   1. THE WRECK        — dodge falling cargo on the storm-struck ship (~22s)
 *   2. TREEHOUSE        — catch building materials, avoid hornets (~24s)
 *   3. THE HUNT         — move crosshair, tap animals before they flee (6 of 9)
 *   4. PIRATE ATTACK    — tap pirates to fire cannon before they breach (20s)
 *   5. SAIL FOR HOME    — steer the raft through rocks to the rescue ship (~22s)
 * Built on RetroSaga (js/saga.js). NES-honest palette — flat fills, no gradients.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ===================== NES-HONEST PALETTE ===================== */
  const C = {
    black:   '#000000',
    nearBk:  '#080808',
    ocean:   '#0058F8',
    oceanDk: '#0020A8',
    oceanLt: '#3CBCFC',
    sky:     '#3CBCFC',
    skyLt:   '#88DCFC',
    sand:    '#F8B800',
    sandLt:  '#FCDC00',
    sandDk:  '#AC7C00',
    jungle:  '#007800',
    jungLt:  '#00A800',
    jungDk:  '#003800',
    wood:    '#884800',
    woodDk:  '#503000',
    woodLt:  '#AC8C30',
    red:     '#D82800',
    orange:  '#FC7460',
    white:   '#FCFCFC',
    grey:    '#BCBCBC',
    greyDk:  '#7C7C7C',
    yellow:  '#F8D018',
    rope:    '#D8A840',
    ropeDk:  '#A07820',
    pirate:  '#200800',
    pirDk:   '#100400',
    leaf:    '#00A800',
    leafDk:  '#006000',
    water:   '#3CBCFC',
    waterDk: '#0058F8',
    storm:   '#183050',
    stormDk: '#0C1C30',
    stormLt: '#2850A0',
  };

  /* ========================== EMBLEM ========================== */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Sandy island base
    g.rect(cx - 26, cy + 14, 52, 14, C.sandDk);
    g.rect(cx - 20, cy + 10, 40, 6, C.sand);
    g.rect(cx - 12, cy + 6, 24, 6, C.sandLt);
    // Tree trunk
    g.rect(cx - 3, cy - 20, 6, 30, C.woodDk);
    // Treehouse platform
    g.rect(cx - 16, cy - 24, 32, 6, C.wood);
    g.rect(cx - 14, cy - 22, 28, 4, C.woodLt);
    // Roof
    g.rect(cx - 14, cy - 32, 28, 10, C.red);
    g.rect(cx - 10, cy - 28, 20, 8, '#E82020');
    // Palm fronds
    g.rect(cx - 22, cy - 14, 16, 3, C.leaf);
    g.rect(cx - 18, cy - 18, 12, 3, C.jungLt);
    g.rect(cx + 6, cy - 16, 16, 3, C.leaf);
    g.rect(cx + 8, cy - 20, 12, 3, C.jungLt);
    g.rect(cx - 5, cy - 24, 10, 3, C.leaf);
    // Swiss flag (tiny, on roof)
    g.rect(cx - 5, cy - 42, 10, 10, C.red);
    g.rect(cx - 1, cy - 42, 2, 10, C.white);
    g.rect(cx - 5, cy - 38, 10, 2, C.white);
    // Ocean glimmer
    c.globalAlpha = 0.30;
    g.rect(cx - 30, cy + 26, 60, 4, C.oceanLt);
    c.globalAlpha = 1;
  }

  /* ========================= SCENERY ========================== */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Bright tropical sky — NES flat bands
    c.fillStyle = C.sky;    c.fillRect(0, 0, W, H * 0.52);
    c.fillStyle = C.skyLt;  c.fillRect(0, 0, W, H * 0.22);
    c.fillStyle = '#60C8F8'; c.fillRect(0, H * 0.18, W, H * 0.16);

    // Sun
    g.circle(W * 0.82, H * 0.12, 22, C.yellow);
    g.circle(W * 0.82, H * 0.12, 18, C.sandLt);
    // Sun rays (dashed lines, NES-style)
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + t * 0.4;
      const x1 = W * 0.82 + Math.cos(ang) * 26;
      const y1 = H * 0.12 + Math.sin(ang) * 26;
      const x2 = W * 0.82 + Math.cos(ang) * 34;
      const y2 = H * 0.12 + Math.sin(ang) * 34;
      g.line(x1, y1, x2, y2, 2, C.yellow);
    }

    // Ocean surface
    c.fillStyle = C.ocean;    c.fillRect(0, H * 0.50, W, H * 0.50);
    c.fillStyle = C.oceanDk;  c.fillRect(0, H * 0.50, W, 4);

    // Animated wave stripes
    for (let i = 0; i < 8; i++) {
      const wy = H * 0.50 + 8 + i * 24;
      const wo = ((t * 20 + i * 50) % (W + 36)) - 18;
      c.fillStyle = i % 2 === 0 ? '#3C70F8' : '#0040D0';
      c.fillRect(wo, wy, 42, 3);
      c.fillRect(wo + 80, wy + 1, 30, 3);
      c.fillRect(wo + 145, wy, 36, 3);
      c.fillRect(wo + 210, wy + 1, 24, 3);
    }

    // Sandy beach strip
    c.fillStyle = C.sand;    c.fillRect(0, H - 44, W, 44);
    c.fillStyle = C.sandDk;  c.fillRect(0, H - 46, W, 4);
    // Beach pebbles
    for (let i = 0; i < 12; i++) {
      c.fillStyle = C.sandLt;
      c.fillRect((i * 23 + 6) % W, H - 26 + (i % 3) * 7, 4, 2);
    }

    // Palm trees
    function palm(px, tall) {
      const h = tall ? 70 : 52;
      g.rect(px - 3, H - 44 - h, 6, h, C.woodDk);
      g.rect(px - 2, H - 44 - h, 4, h, C.wood);
      // Fronds
      const fy = H - 44 - h;
      g.rect(px - 20, fy + 2, 18, 4, C.leaf);
      g.rect(px - 16, fy - 2, 14, 4, C.jungLt);
      g.rect(px + 2,  fy + 2, 18, 4, C.leaf);
      g.rect(px + 4,  fy - 2, 14, 4, C.jungLt);
      g.rect(px - 6,  fy - 6, 12, 4, C.jungLt);
      g.rect(px - 3,  fy,     4, 4, C.woodDk); // coconut
    }
    palm(22, false);
    palm(W - 26, true);
    palm(W * 0.48, false);

    // Treehouse visible in boot/menu
    if (scene === 'boot' || scene === 'menu') {
      const tx = W * 0.48, ty = H - 44 - 52;
      g.rect(tx - 20, ty - 20, 40, 8, C.wood);
      g.rect(tx - 16, ty - 28, 32, 10, C.red);
      g.rect(tx - 18, ty - 20, 4, 20, C.woodDk);
      g.rect(tx + 14, ty - 20, 4, 20, C.woodDk);
      // Swiss cross flag
      g.rect(tx + 20, ty - 36, 8, 8, C.red);
      g.rect(tx + 22, ty - 36, 4, 8, C.white);
      g.rect(tx + 20, ty - 33, 8, 3, C.white);
    }

    // Dark overlay for story/result screens
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(0,20,8,.80)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // Jungle map tint
      c.fillStyle = 'rgba(0,16,6,.55)';
      c.fillRect(0, 0, W, H);
      // Dotted trail between chapter nodes
      c.strokeStyle = 'rgba(248,184,0,.30)';
      c.lineWidth = 1;
      c.setLineDash([3, 4]);
      c.beginPath();
      // Wreck (bot-left) → Treehouse (top-center) → Hunt (top-right) → Pirates (bot-right) → Sail (bot-center)
      c.moveTo(57, 380);
      c.lineTo(135, 130);
      c.lineTo(210, 155);
      c.lineTo(213, 340);
      c.lineTo(135, 420);
      c.stroke();
      c.setLineDash([]);
    }
  }

  /* ========================= SAGA ========================== */
  RetroSaga.create({
    id: 'swissfamily-island',
    title: 'Swiss Family Robinson',
    subtitle: 'ISLAND BOUND',
    currency: 'PROVISIONS',

    screens: {
      win:          '#00A800',
      lose:         '#0058F8',
      chapterLabel: '#AC7C00',
      name:         '#FCDC00',
      sub:          '#F8B800',
      intro:        '#A8D870',
      quote:        '#608840',
      help:         '#A8D870',
      score:        '#FCDC00',
      cur:          '#F8B800',
      cta:          '#FCFCFC',
      overlay:      'rgba(0,18,6,.86)',
    },

    labels: {
      chapter:  'ADVENTURE',
      score:    'PROVISIONS',
      win:      'THE ISLAND PROVIDES',
      lose:     'THE WILDS CLAIM YOU',
      cont:     'TAP TO PRESS ON',
      finale:   'TAP TO SET SAIL',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO BEGIN',
    },

    accent:    '#F8B800',
    credit:    'SWISS FAMILY ROBINSON · J. D. WYSS, 1812',
    bootCta:   'TAP TO BEGIN',
    bootLine:  'FIVE TRIALS · ONE ISLAND FAMILY',
    menuLabel: 'THE ISLAND MAP',
    menuHint:  'CHOOSE YOUR NEXT ADVENTURE',
    menuDone:  'THE FAMILY IS READY TO SAIL',
    emblem,
    scenery,

    finale: [
      'A SHIP APPEARS ON THE HORIZON.',
      '',
      'AFTER YEARS ON THE ISLAND,',
      'THE ROBINSON FAMILY',
      'MAKES ITS CHOICE:',
      'WHO SAILS FOR HOME,',
      'AND WHO STAYS',
      'IN NEW SWITZERLAND.',
    ],

    /* =================== CHAPTER-SELECT MENU =================== */
    menu: {
      colors: { title: '#F8B800', label: '#AC7C00', cur: '#FCDC00' },

      // 5 island locations scattered in a rough ring
      layout(api) {
        return [
          { x: 14,  y: 340, w: 86, h: 62 }, // THE WRECK    — sea/lower-left
          { x: 92,  y: 95,  w: 86, h: 62 }, // TREEHOUSE    — jungle/upper-center
          { x: 170, y: 120, w: 86, h: 62 }, // THE HUNT     — forest/upper-right
          { x: 170, y: 305, w: 86, h: 62 }, // PIRATE ATK   — bay/lower-right
          { x: 92,  y: 390, w: 86, h: 62 }, // SAIL HOME    — harbour/bottom-center
        ];
      },

      title(api, score) {
        const g = api.gfx, c = api.ctx, W = api.W;
        // Map header — aged parchment banner
        c.fillStyle = '#0C1A08';
        c.fillRect(8, 12, W - 16, 72);
        c.strokeStyle = '#608840';
        c.lineWidth = 1;
        c.strokeRect(8, 12, W - 16, 72);
        c.strokeStyle = '#2A4010';
        c.strokeRect(12, 16, W - 24, 64);
        // Compass rose
        const crx = W - 28, cry = 36;
        g.rect(crx - 1, cry - 9, 2, 18, C.sandDk);
        g.rect(crx - 9, cry - 1, 18, 2, C.sandDk);
        g.rect(crx - 1, cry - 7, 2, 5, C.yellow); // N
        api.txtC('N', crx, cry - 12, 6, C.yellow, true);
        // Header
        api.txtC('NEW SWITZERLAND', W / 2, 26, 7, '#F8B800', true);
        api.txtC('PROVISIONS: ' + score, W / 2, 48, 7, '#FCDC00', true);
        api.txtC('J. D. WYSS · 1812', W / 2, 68, 6, '#608840', true);
      },

      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;

        // Bamboo/wooden plank sign
        const bg = sel ? '#0C2808' : '#081A04';
        c.fillStyle = bg;
        c.fillRect(x, y, w, h);

        // Outer border — bamboo yellow-green
        c.strokeStyle = sel ? '#F8B800' : '#408030';
        c.lineWidth = sel ? 2 : 1;
        c.strokeRect(x, y, w, h);
        c.strokeStyle = sel ? '#A8D040' : '#204018';
        c.lineWidth = 1;
        c.strokeRect(x + 3, y + 3, w - 6, h - 6);

        // Bamboo joint marks (top & bottom)
        c.fillStyle = sel ? '#608830' : '#2A4018';
        c.fillRect(x, y + 6, w, 2);
        c.fillRect(x, y + h - 8, w, 2);

        // Small chapter icon area (top strip)
        const icx = x + w / 2, icy = y + 20;
        if (done) {
          // Checkmark / coconut badge
          g.circle(icx, icy, 8, '#F8B800');
          g.rect(icx - 4, icy - 1, 3, 5, C.black);
          g.rect(icx - 1, icy + 1, 5, 3, C.black);
        } else {
          ch.icon && ch.icon(api, icx, icy);
        }

        // Selection glow strip
        if (sel && !done) {
          c.globalAlpha = 0.14;
          c.fillStyle = '#F8B800';
          c.fillRect(x + 4, y + 4, w - 8, h - 8);
          c.globalAlpha = 1;
        }

        // Chapter name
        api.txtCFit((i + 1) + '. ' + ch.name, x + w / 2, y + h - 28, 7,
          done ? '#F8B800' : (sel ? '#FCDC00' : '#A8D040'), true, w - 8);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2, y + h - 14, 6,
          done ? '#AC7C00' : '#406020', true, w - 8);
      },
    },

    width: 270, height: 480, parent: '#game',

    /* ===================== CHAPTERS ========================= */
    chapters: [

      /* ========== 1. THE WRECK ========== */
      {
        id: 'wreck', name: 'THE WRECK', sub: 'MAN THE HELM',

        icon(api, x, y) {
          const g = api.gfx;
          // Ship wheel
          g.circle(x, y, 8, C.woodDk);
          g.circle(x, y, 5, C.black);
          g.rect(x - 8, y - 1, 16, 2, C.woodDk);
          g.rect(x - 1, y - 8, 2, 16, C.woodDk);
          g.rect(x - 6, y - 6, 2, 2, C.woodDk);
          g.rect(x + 4, y - 6, 2, 2, C.woodDk);
        },

        intro: [
          'A HOWLING SQUALL STRIKES',
          'THE SHIP OFF THE COAST.',
          'THE FAMILY LASHES',
          'THEMSELVES TO THE MAST.',
          'THEN THE SHIP RUNS',
          'AGROUND — ALIVE!',
        ],
        quote: 'The tempest raged with unabating fury. The ship struck with a tremendous crash that threw us all off our feet.',
        help:  'STEER left/right · dodge falling cargo · survive 22 seconds!',
        winText:  'The gale subsides. Battered but alive, you sight a green island shore.',
        loseText: 'Crates crush the deck. The sea swallows all hope.',

        init(api) {
          this.px = api.W / 2;
          this.lives = 3;
          this.timer = 0;
          this.goal  = 22;
          this.crates = [];
          this.nextCrate = 0.7;
          this.iframes = 0;
          this.rain = [];
          for (let i = 0; i < 60; i++) {
            this.rain.push({ x: Retro.util.rand(0, api.W), y: Retro.util.rand(0, api.H), dy: Retro.util.rand(3, 5) });
          }
        },

        update(api, dt) {
          const W = api.W, H = api.H, spd = 150;

          // Steer
          if (api.keyDown('left'))  this.px -= spd * dt;
          if (api.keyDown('right')) this.px += spd * dt;
          if (api.pointer.down) {
            const dx = api.pointer.x - this.px;
            this.px += clamp(dx, -spd * dt * 2.5, spd * dt * 2.5);
          }
          this.px = clamp(this.px, 18, W - 18);

          // Rain
          for (const r of this.rain) {
            r.y += r.dy * 60 * dt;
            if (r.y > H) { r.y = 0; r.x = Retro.util.rand(0, W); }
          }

          // Difficulty ramp
          this.timer += dt;
          const diff = 1 + this.timer / this.goal * 2.2;

          // Spawn cargo
          this.nextCrate -= dt;
          if (this.nextCrate <= 0) {
            this.nextCrate = (0.60 / diff) + 0.10;
            const wr = Retro.util.randInt(10, 22);
            const hr = Retro.util.randInt(8, 18);
            this.crates.push({
              x: Retro.util.rand(14, W - 14),
              y: -24,
              w: wr, h: hr,
              dy: Retro.util.rand(75, 130) * diff,
            });
          }

          // Move crates + collision
          const py = H - 68;
          if (this.iframes > 0) this.iframes -= dt;
          this.crates = this.crates.filter(cr => {
            cr.y += cr.dy * dt;
            if (this.iframes <= 0) {
              if (Math.abs(cr.x - this.px) < 16 + cr.w / 2 &&
                  Math.abs(cr.y - py) < 12 + cr.h / 2) {
                this.lives--;
                this.iframes = 1.1;
                api.shake(5, 0.35);
                api.flash('#330000', 0.22);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return false; }
              }
            }
            return cr.y < H + 24;
          });

          if (this.timer >= this.goal) api.win();
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Stormy sky
          c.fillStyle = C.stormDk; c.fillRect(0, 0, W, H);
          c.fillStyle = C.storm;   c.fillRect(0, 0, W, H * 0.45);
          c.fillStyle = C.stormLt; c.fillRect(0, 0, W, H * 0.18);

          // Lightning
          if (this.timer > 3 && Math.sin(this.timer * 5.3) > 0.92) {
            c.globalAlpha = 0.12;
            c.fillStyle = '#A0B8FF'; c.fillRect(0, 0, W, H * 0.45);
            c.globalAlpha = 1;
          }

          // Ocean
          c.fillStyle = '#060E24'; c.fillRect(0, H * 0.42, W, H);
          for (let i = 0; i < 5; i++) {
            const wy = H * 0.42 + 6 + i * 14;
            const wo = ((this.timer * 36 + i * 60) % (W + 40)) - 20;
            c.fillStyle = i % 2 === 0 ? '#0C2040' : '#081828';
            c.fillRect(wo, wy, 50, 4);
            c.fillRect(wo + 90, wy, 34, 4);
            c.fillRect(wo + 160, wy, 40, 4);
          }

          // Ship deck
          const dk = H - 80;
          c.fillStyle = '#281408'; c.fillRect(0, dk, W, 80);
          c.fillStyle = '#381C0C'; c.fillRect(0, dk + 2, W, 6);
          for (let i = 0; i < W; i += 22) {
            c.fillStyle = '#180A04'; c.fillRect(i, dk, 2, 80);
          }
          // Railing
          c.fillStyle = '#482810'; c.fillRect(0, dk, W, 5);
          for (let i = 0; i < W; i += 26) {
            c.fillStyle = '#382010'; c.fillRect(i, dk - 12, 4, 14);
          }
          // Rigging
          c.strokeStyle = '#906820'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(0, 28); c.lineTo(W * 0.58, dk); c.stroke();
          c.beginPath(); c.moveTo(W, 22); c.lineTo(W * 0.40, dk); c.stroke();

          // Rain
          c.globalAlpha = 0.40;
          c.fillStyle = '#5888B8';
          for (const r of this.rain) { c.fillRect(r.x, r.y, 1, 6); }
          c.globalAlpha = 1;

          // Cargo crates
          for (const cr of this.crates) {
            c.fillStyle = C.wood;  c.fillRect(cr.x - cr.w / 2, cr.y - cr.h / 2, cr.w, cr.h);
            c.fillStyle = C.woodDk; c.fillRect(cr.x - cr.w / 2 + 2, cr.y - cr.h / 2 + 2, cr.w - 4, 2);
            c.strokeStyle = C.woodDk; c.lineWidth = 1;
            c.strokeRect(cr.x - cr.w / 2, cr.y - cr.h / 2, cr.w, cr.h);
          }

          // Player (sailor silhouette)
          const py = H - 68;
          if (this.iframes > 0 && Math.floor(this.iframes * 8) % 2 === 0) {
            // Flash on hit
          } else {
            c.fillStyle = '#102050'; c.fillRect(this.px - 8, py - 22, 16, 22);
            c.fillStyle = '#0C1A40'; c.fillRect(this.px - 6, py - 22, 12, 14);
            g.circle(this.px, py - 28, 8, '#F0C898');
            c.fillStyle = '#1A3070'; c.fillRect(this.px - 5, py - 34, 10, 6); // hat
          }

          // Hearts (lives)
          for (let i = 0; i < 3; i++) {
            c.fillStyle = i < this.lives ? C.red : '#303030';
            c.fillRect(6 + i * 20, 8, 14, 12);
          }

          // Timer bar
          const pct = Math.min(this.timer / this.goal, 1);
          c.fillStyle = '#101010'; c.fillRect(6, 26, W - 12, 6);
          c.fillStyle = '#00A800'; c.fillRect(6, 26, (W - 12) * pct, 6);
          api.txtC('SURVIVE: ' + Math.ceil(Math.max(0, this.goal - this.timer)) + 's',
            W / 2, 38, 7, '#A8D040', true);
        },
      },

      /* ========== 2. TREEHOUSE ========== */
      {
        id: 'treehouse', name: 'TREEHOUSE', sub: 'BUILD & SURVIVE',

        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 6, 16, 8, C.wood);
          g.rect(x - 6, y - 12, 12, 8, C.red);
          g.rect(x - 2, y - 2, 4, 8, C.woodDk);
        },

        intro: [
          'THE FAMILY BUILDS A HOME',
          'HIGH IN A GREAT FIG TREE.',
          'FRITZ AND ERNEST HOIST',
          'UP THE PLANKS AND ROPE.',
          'WATCH FOR HORNETS!',
        ],
        quote: 'We determined to build our dwelling in the great tree, that we might be safe from wild beasts and floods.',
        help:  'MOVE left/right · catch planks & rope · AVOID hornets! · collect 20 materials',
        winText:  'The treehouse stands! Safe above the jungle floor, the family cheers.',
        loseText: 'The hornets drive you away. The boards fall into the brush.',

        init(api) {
          this.px = api.W / 2;
          this.collected = 0;
          this.goal = 20;
          this.items = [];
          this.hornets = [];
          this.nextItem = 0.5;
          this.nextHornet = 3.0;
          this.timer = 0;
          this.lives = 3;
          this.iframes = 0;
          this.particles = [];
        },

        update(api, dt) {
          const W = api.W, H = api.H, spd = 145;
          this.timer += dt;

          // Steer
          if (api.keyDown('left'))  this.px -= spd * dt;
          if (api.keyDown('right')) this.px += spd * dt;
          if (api.pointer.down) {
            const dx = api.pointer.x - this.px;
            this.px += clamp(dx, -spd * dt * 2.5, spd * dt * 2.5);
          }
          this.px = clamp(this.px, 16, W - 16);

          const py = H - 72;

          // Spawn materials
          this.nextItem -= dt;
          if (this.nextItem <= 0) {
            const types = ['plank', 'rope', 'nail', 'plank', 'rope'];
            const tp = types[Retro.util.randInt(0, 4)];
            this.nextItem = Retro.util.rand(0.55, 0.90);
            this.items.push({
              x: Retro.util.rand(14, W - 14), y: -16,
              dy: Retro.util.rand(80, 120), tp,
              w: tp === 'plank' ? 22 : tp === 'rope' ? 12 : 6,
              h: tp === 'plank' ? 6  : tp === 'rope' ? 14 : 6,
            });
          }

          // Spawn hornets
          this.nextHornet -= dt;
          if (this.nextHornet <= 0) {
            this.nextHornet = Retro.util.rand(2.2, 3.8);
            const fromRight = Retro.util.rand(0, 1) > 0.5;
            this.hornets.push({
              x: fromRight ? W + 16 : -16,
              y: Retro.util.rand(H * 0.35, H - 80),
              dx: fromRight ? -Retro.util.rand(70, 110) : Retro.util.rand(70, 110),
              dy: Math.sin(this.timer) * 18,
            });
          }

          // Move items + collect
          this.items = this.items.filter(it => {
            it.y += it.dy * dt;
            if (Math.abs(it.x - this.px) < 14 + it.w / 2 && Math.abs(it.y - py) < 12) {
              this.collected++;
              api.audio.sfx('coin');
              for (let p = 0; p < 5; p++) {
                this.particles.push({
                  x: it.x, y: py,
                  vx: Retro.util.rand(-40, 40), vy: Retro.util.rand(-50, -20),
                  life: 0.5, col: it.tp === 'plank' ? C.wood : it.tp === 'rope' ? C.rope : C.grey,
                });
              }
              if (this.collected >= this.goal) { api.win(); return false; }
              return false;
            }
            return it.y < H + 20;
          });

          // Move hornets + sting
          if (this.iframes > 0) this.iframes -= dt;
          this.hornets = this.hornets.filter(h => {
            h.x += h.dx * dt;
            h.y += Math.sin(this.timer * 5 + h.x * 0.1) * 18 * dt;
            h.y = clamp(h.y, H * 0.3, H - 70);
            if (this.iframes <= 0) {
              if (Math.abs(h.x - this.px) < 16 && Math.abs(h.y - py) < 16) {
                this.lives--;
                this.iframes = 1.2;
                api.shake(4, 0.28);
                api.flash('#FF8800', 0.18);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return false; }
              }
            }
            return h.x > -24 && h.x < W + 24;
          });

          // Particles
          this.particles = this.particles.filter(p => {
            p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 80 * dt;
            p.life -= dt;
            return p.life > 0;
          });
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Jungle backdrop
          c.fillStyle = '#0C2008'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#142C0C'; c.fillRect(0, H * 0.14, W, H);
          // Canopy layers (flat NES bands)
          for (let l = 0; l < 4; l++) {
            const cy = H * 0.12 + l * 32;
            const lc = l % 2 === 0 ? C.jungDk : C.jungle;
            c.fillStyle = lc;
            for (let lx = 0; lx < W; lx += 36) {
              const bx = lx + (l * 11) % 22;
              c.fillRect(bx, cy, 32, 20);
              c.fillRect(bx + 8, cy - 6, 18, 8);
            }
          }
          // Sky glimpse at top
          c.fillStyle = '#1860A0'; c.fillRect(0, 0, W, H * 0.14);

          // Tree trunk
          c.fillStyle = C.woodDk; c.fillRect(W / 2 - 6, H * 0.30, 12, H * 0.70);
          c.fillStyle = C.wood;   c.fillRect(W / 2 - 4, H * 0.30, 8,  H * 0.70);

          // Treehouse platform (in progress — grows with collections)
          const pct = this.collected / this.goal;
          const py = H - 72;
          const treePlatY = py - 30;
          const pWidth = Math.floor(14 + pct * 26);
          c.fillStyle = C.wood;   c.fillRect(W / 2 - pWidth, treePlatY, pWidth * 2, 8);
          c.fillStyle = C.woodDk; c.fillRect(W / 2 - pWidth, treePlatY, pWidth * 2, 2);
          if (pct > 0.5) {
            c.fillStyle = C.red;  c.fillRect(W / 2 - pWidth + 2, treePlatY - 12, pWidth * 2 - 4, 14);
          }

          // Ground floor
          c.fillStyle = '#1A3010'; c.fillRect(0, H - 56, W, 56);
          c.fillStyle = '#0C1C08'; c.fillRect(0, H - 58, W, 4);
          // Roots
          for (let r = 0; r < 5; r++) {
            c.fillStyle = C.woodDk;
            c.fillRect(W / 2 - 16 + r * 6, H - 56, 4, 30);
          }

          // Items
          for (const it of this.items) {
            if (it.tp === 'plank') {
              c.fillStyle = C.wood;  c.fillRect(it.x - 11, it.y - 3, 22, 6);
              c.fillStyle = C.woodLt; c.fillRect(it.x - 11, it.y - 3, 22, 2);
            } else if (it.tp === 'rope') {
              c.fillStyle = C.rope;   c.fillRect(it.x - 3, it.y - 7, 6, 14);
              c.fillStyle = C.ropeDk; c.fillRect(it.x - 3, it.y - 7, 6, 3);
              c.fillRect(it.x - 3, it.y + 2, 6, 3);
            } else {
              // nail
              c.fillStyle = C.grey; c.fillRect(it.x - 3, it.y - 3, 6, 6);
              c.fillStyle = C.greyDk; c.fillRect(it.x - 2, it.y - 4, 4, 2);
            }
          }

          // Hornets
          for (const h of this.hornets) {
            const wf = Math.floor(this.timer * 12 + h.x * 0.1) % 2;
            c.fillStyle = C.yellow; c.fillRect(h.x - 6, h.y - 3, 12, 6);
            c.fillStyle = C.black;  c.fillRect(h.x - 6, h.y - 1, 12, 2); // stripe
            c.fillStyle = C.black;  c.fillRect(h.x - 6, h.y + 2, 12, 2);
            // Wings
            if (wf === 0) {
              c.globalAlpha = 0.55;
              c.fillStyle = '#88CCFF';
              c.fillRect(h.x - 8, h.y - 7, 7, 4);
              c.fillRect(h.x + 1, h.y - 7, 7, 4);
              c.globalAlpha = 1;
            } else {
              c.globalAlpha = 0.30;
              c.fillStyle = '#88CCFF';
              c.fillRect(h.x - 6, h.y - 5, 5, 3);
              c.fillRect(h.x + 1, h.y - 5, 5, 3);
              c.globalAlpha = 1;
            }
          }

          // Particles
          for (const p of this.particles) {
            c.globalAlpha = p.life * 2;
            c.fillStyle = p.col;
            c.fillRect(p.x - 2, p.y - 2, 4, 4);
            c.globalAlpha = 1;
          }

          // Player (kid with basket)
          if (!(this.iframes > 0 && Math.floor(this.iframes * 8) % 2 === 0)) {
            c.fillStyle = '#E06020'; c.fillRect(this.px - 8, py - 22, 16, 22);
            g.circle(this.px, py - 28, 8, '#F0C898');
            c.fillStyle = C.sandDk; c.fillRect(this.px - 5, py - 34, 10, 6);
            // Basket
            c.fillStyle = C.ropeDk; c.fillRect(this.px - 10, py - 8, 20, 12);
            c.fillStyle = C.rope;   c.fillRect(this.px - 8, py - 6, 16, 8);
          }

          // Hearts
          for (let i = 0; i < 3; i++) {
            c.fillStyle = i < this.lives ? C.red : '#202020';
            c.fillRect(6 + i * 20, 8, 14, 12);
          }

          // Progress
          c.fillStyle = '#101010'; c.fillRect(6, 26, W - 12, 6);
          c.fillStyle = C.wood; c.fillRect(6, 26, (W - 12) * (this.collected / this.goal), 6);
          api.txtC(this.collected + '/' + this.goal + ' MATERIALS', W / 2, 38, 7, '#AC8C30', true);
        },
      },

      /* ========== 3. THE HUNT ========== */
      {
        id: 'hunt', name: 'THE HUNT', sub: 'FEED THE FAMILY',

        icon(api, x, y) {
          const g = api.gfx;
          // Crosshair
          g.circle(x, y, 7, C.black);
          g.circle(x, y, 7, C.jungle, false, true);
          g.rect(x - 9, y - 1, 18, 2, C.jungle);
          g.rect(x - 1, y - 9, 2, 18, C.jungle);
          g.circle(x, y, 2, C.red);
        },

        intro: [
          'THE FAMILY MUST EAT.',
          'FRITZ TAKES HIS RIFLE',
          'INTO THE JUNGLE.',
          'MOVE THE CROSSHAIR,',
          'FIRE WHEN READY!',
        ],
        quote: 'In this new and extraordinary situation, we were under the necessity of hunting for our food.',
        help:  'MOVE crosshair · TAP / SPACE to fire · hunt 6 animals before they flee!',
        winText:  'The larder is full! The family sits down to a fine island feast.',
        loseText: 'The animals vanish into the brush. The family goes hungry tonight.',

        init(api) {
          this.cx = api.W / 2;
          this.cy = api.H / 2;
          this.hunted = 0;
          this.goal   = 6;
          this.animals = [];
          this.nextAnimal = 1.0;
          this.spawnPool = 9; // total animals in chapter
          this.spawned   = 0;
          this.timer     = 0;
          this.shots     = [];
          this.flash     = 0;
          this.lastFire  = 0;
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer += dt;

          // Move crosshair
          const spd = 160;
          if (api.keyDown('up'))    this.cy -= spd * dt;
          if (api.keyDown('down'))  this.cy += spd * dt;
          if (api.keyDown('left'))  this.cx -= spd * dt;
          if (api.keyDown('right')) this.cx += spd * dt;
          if (api.pointer.down) {
            this.cx += clamp(api.pointer.x - this.cx, -spd * dt * 3, spd * dt * 3);
            this.cy += clamp(api.pointer.y - this.cy, -spd * dt * 3, spd * dt * 3);
          }
          this.cx = clamp(this.cx, 12, W - 12);
          this.cy = clamp(this.cy, 12, H - 12);

          // Fire
          const canFire = (this.timer - this.lastFire) > 0.35;
          if (canFire && (api.keyPressed('a') || api.pointer.justDown)) {
            this.lastFire = this.timer;
            this.shots.push({ x: this.cx, y: this.cy, life: 0.22 });
            api.audio.sfx('shoot');
            // Check hits
            for (let i = this.animals.length - 1; i >= 0; i--) {
              const a = this.animals[i];
              if (Math.abs(a.x - this.cx) < 18 && Math.abs(a.y - this.cy) < 18) {
                this.animals.splice(i, 1);
                this.hunted++;
                api.audio.sfx('power');
                api.burst(a.x, a.y, C.red, 6);
                if (this.hunted >= this.goal) { api.win(); return; }
              }
            }
          }

          // Spawn animals
          this.nextAnimal -= dt;
          if (this.nextAnimal <= 0 && this.spawned < this.spawnPool) {
            this.nextAnimal = Retro.util.rand(1.8, 3.2);
            this.spawned++;
            const types = ['deer', 'turkey', 'fish', 'deer', 'turkey'];
            this.animals.push({
              x: Retro.util.rand(28, W - 28),
              y: Retro.util.rand(H * 0.30, H - 80),
              life: Retro.util.rand(3.0, 5.0),
              tp:   types[Retro.util.randInt(0, 4)],
              dx: Retro.util.rand(-30, 30),
              dy: Retro.util.rand(-20, 20),
            });
          }

          // Move & age animals
          this.animals = this.animals.filter(a => {
            a.x += a.dx * dt;
            a.y += a.dy * dt;
            a.x = clamp(a.x, 20, W - 20);
            a.y = clamp(a.y, H * 0.25, H - 70);
            a.life -= dt;
            return a.life > 0;
          });

          // Shot life
          this.shots = this.shots.filter(s => { s.life -= dt; return s.life > 0; });

          // Fail if no animals left and not enough hunted
          if (this.spawned >= this.spawnPool && this.animals.length === 0 && this.hunted < this.goal) {
            api.lose();
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Jungle
          c.fillStyle = '#0A1C06'; c.fillRect(0, 0, W, H);
          // Sky strip
          c.fillStyle = '#2050A0'; c.fillRect(0, 0, W, H * 0.18);
          // Foliage bands
          const foliageCols = [C.jungDk, C.jungle, '#004A00', C.jungLt];
          for (let row = 0; row < 3; row++) {
            c.fillStyle = foliageCols[row % foliageCols.length];
            c.fillRect(0, H * 0.16 + row * 30, W, 24);
          }
          // Floor
          c.fillStyle = '#1A3010'; c.fillRect(0, H - 50, W, 50);
          c.fillStyle = '#0C1C08'; c.fillRect(0, H - 52, W, 4);
          // Tree trunks in background
          const trunks = [30, 80, 150, 200, 250];
          for (const tx of trunks) {
            c.fillStyle = C.woodDk;
            c.fillRect(tx - 5, H * 0.18, 10, H - H * 0.18 - 50);
          }

          // Animals
          for (const a of this.animals) {
            // Pulse when life is low
            const urgency = a.life < 1.0 ? Math.floor(a.life * 8) % 2 === 0 : true;
            if (!urgency) continue;
            if (a.tp === 'deer') {
              // Simple deer shape
              c.fillStyle = '#C87840'; c.fillRect(a.x - 10, a.y - 8, 20, 12);
              c.fillStyle = '#E09050'; c.fillRect(a.x - 8, a.y - 6, 16, 8);
              g.circle(a.x + 10, a.y - 8, 6, '#D08848');
              // Antlers
              g.rect(a.x + 6, a.y - 16, 2, 8, C.woodDk);
              g.rect(a.x + 4, a.y - 16, 4, 2, C.woodDk);
              g.rect(a.x + 12, a.y - 16, 2, 8, C.woodDk);
              g.rect(a.x + 10, a.y - 16, 4, 2, C.woodDk);
              // Legs
              for (let leg = 0; leg < 4; leg++) {
                c.fillStyle = C.woodDk;
                c.fillRect(a.x - 8 + leg * 5, a.y + 4, 3, 8);
              }
            } else if (a.tp === 'turkey') {
              c.fillStyle = '#8C4020'; c.fillRect(a.x - 8, a.y - 6, 16, 12);
              g.circle(a.x + 8, a.y - 8, 5, '#8C4020');
              // Tail fan
              c.fillStyle = C.red;    c.fillRect(a.x - 12, a.y - 10, 6, 16);
              c.fillStyle = C.orange; c.fillRect(a.x - 10, a.y - 8, 4, 12);
              g.rect(a.x + 10, a.y - 6, 2, 4, '#F88800'); // beak
              // Legs
              c.fillStyle = '#F88800'; c.fillRect(a.x - 4, a.y + 6, 3, 8);
              c.fillRect(a.x + 1, a.y + 6, 3, 8);
            } else {
              // Fish (leaping)
              c.fillStyle = C.oceanLt; c.fillRect(a.x - 10, a.y - 4, 20, 8);
              c.fillStyle = C.ocean;   c.fillRect(a.x + 6, a.y - 6, 6, 12); // tail
              c.fillStyle = C.black;   c.fillRect(a.x - 8, a.y - 2, 2, 2);  // eye
            }
          }

          // Shots
          for (const s of this.shots) {
            c.globalAlpha = s.life / 0.22;
            c.fillStyle = C.yellow;
            g.circle(s.x, s.y, 4, C.yellow);
            c.globalAlpha = 1;
          }

          // Crosshair
          c.strokeStyle = C.red; c.lineWidth = 2;
          c.beginPath(); c.arc(this.cx, this.cy, 12, 0, Math.PI * 2); c.stroke();
          c.strokeStyle = '#FCFCFC'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(this.cx - 18, this.cy); c.lineTo(this.cx - 13, this.cy); c.stroke();
          c.beginPath(); c.moveTo(this.cx + 13, this.cy); c.lineTo(this.cx + 18, this.cy); c.stroke();
          c.beginPath(); c.moveTo(this.cx, this.cy - 18); c.lineTo(this.cx, this.cy - 13); c.stroke();
          c.beginPath(); c.moveTo(this.cx, this.cy + 13); c.lineTo(this.cx, this.cy + 18); c.stroke();

          // Score
          api.txtC(this.hunted + '/' + this.goal + ' HUNTED', W / 2, 10, 7, '#FCDC00', true);
        },
      },

      /* ========== 4. PIRATE ATTACK ========== */
      {
        id: 'pirates', name: 'PIRATE ATTACK', sub: 'DEFEND THE SHORE',

        icon(api, x, y) {
          const g = api.gfx;
          // Cannon
          g.rect(x - 9, y - 3, 18, 7, C.greyDk);
          g.circle(x - 9, y, 4, C.greyDk);
          g.rect(x - 12, y + 2, 24, 4, C.woodDk);
        },

        intro: [
          'A PIRATE SHIP APPEARS',
          'IN THE LAGOON!',
          'THE FAMILY LOADS',
          'EVERY CANNON.',
          'DEFEND NEW SWITZERLAND!',
        ],
        quote: 'We perceived with alarm that it was a piratical vessel... the dread of falling into their hands was terrible.',
        help:  'TAP pirates to fire the cannon · 3 breaches = defeat · survive 22 seconds!',
        winText:  'The pirate ship retreats! New Switzerland holds — for now.',
        loseText: 'Overrun! The pirates breach the beach.',

        init(api) {
          this.timer    = 0;
          this.goal     = 22;
          this.breaches = 0;
          this.maxBreaches = 3;
          this.pirates  = [];
          this.nextPirate = 1.0;
          this.shots    = [];
          this.explosions = [];
          this.cannon   = { x: api.W / 2, angle: -Math.PI / 2 };
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer += dt;
          const diff = 1 + this.timer / this.goal * 1.8;

          // Spawn pirates (boats approaching from top, moving down)
          this.nextPirate -= dt;
          if (this.nextPirate <= 0) {
            this.nextPirate = Retro.util.rand(0.9, 1.6) / diff;
            const lanes = [W * 0.18, W * 0.40, W * 0.62, W * 0.84];
            const lx = lanes[Retro.util.randInt(0, 3)];
            this.pirates.push({
              x: lx + Retro.util.rand(-12, 12),
              y: -30,
              dy: Retro.util.rand(45, 65) * diff,
              hp: 1,
              hit: 0,
            });
          }

          // Tap to shoot pirate
          if (api.pointer.justDown) {
            const tx = api.pointer.x, ty = api.pointer.y;
            for (let i = this.pirates.length - 1; i >= 0; i--) {
              const p = this.pirates[i];
              if (Math.abs(p.x - tx) < 24 && Math.abs(p.y - ty) < 24) {
                p.hp--;
                api.audio.sfx('shoot');
                if (p.hp <= 0) {
                  this.explosions.push({ x: p.x, y: p.y, life: 0.5 });
                  api.burst(p.x, p.y, C.orange, 8);
                  api.audio.sfx('explode');
                  this.pirates.splice(i, 1);
                }
                break;
              }
            }
          }

          // Move pirates
          this.pirates = this.pirates.filter(p => {
            p.y += p.dy * dt;
            if (p.hit > 0) p.hit -= dt;
            if (p.y > H - 50) {
              this.breaches++;
              api.shake(6, 0.40);
              api.flash('#CC0000', 0.24);
              api.audio.sfx('hurt');
              if (this.breaches >= this.maxBreaches) { api.lose(); return false; }
              return false;
            }
            return true;
          });

          // Explosions
          this.explosions = this.explosions.filter(e => { e.life -= dt; return e.life > 0; });

          if (this.timer >= this.goal) api.win();
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Sky + lagoon
          c.fillStyle = '#1848A8'; c.fillRect(0, 0, W, H);
          c.fillStyle = C.ocean;   c.fillRect(0, H * 0.12, W, H - H * 0.12 - 60);
          // Wave bands on lagoon
          for (let i = 0; i < 10; i++) {
            const wy = H * 0.14 + i * 22;
            const wo = ((this.timer * 18 + i * 48) % (W + 36)) - 18;
            c.fillStyle = i % 2 === 0 ? '#0048D8' : '#0038B8';
            c.fillRect(wo, wy, 40, 3);
            c.fillRect(wo + 88, wy, 28, 3);
          }

          // Beach at bottom
          c.fillStyle = C.sand;   c.fillRect(0, H - 60, W, 60);
          c.fillStyle = C.sandDk; c.fillRect(0, H - 62, W, 4);

          // Cannon (bottom-center on beach)
          const cx = W / 2, cy = H - 40;
          c.fillStyle = C.woodDk; c.fillRect(cx - 18, cy + 4, 36, 8);
          c.fillStyle = C.greyDk; c.fillRect(cx - 12, cy - 6, 24, 12);
          c.fillStyle = '#505050'; c.fillRect(cx - 10, cy - 4, 20, 8);
          g.circle(cx - 12, cy + 4, 8, C.greyDk);
          g.circle(cx + 12, cy + 4, 8, C.greyDk);
          // Barrel
          c.fillStyle = C.greyDk; c.fillRect(cx - 6, cy - 16, 12, 14);
          c.fillStyle = '#404040'; c.fillRect(cx - 4, cy - 14, 8, 10);

          // Pirates (boats)
          for (const p of this.pirates) {
            const blink = p.hit > 0 && Math.floor(p.hit * 10) % 2 === 0;
            if (!blink) {
              // Hull
              c.fillStyle = C.pirDk; c.fillRect(p.x - 20, p.y - 8, 40, 14);
              c.fillStyle = C.pirate; c.fillRect(p.x - 18, p.y - 6, 36, 10);
              // Mast
              g.rect(p.x - 1, p.y - 26, 2, 22, C.woodDk);
              // Skull flag
              c.fillStyle = C.black; c.fillRect(p.x + 1, p.y - 26, 12, 8);
              g.circle(p.x + 7, p.y - 22, 4, C.white);
              c.fillStyle = C.black; c.fillRect(p.x + 4, p.y - 22, 2, 2);
              c.fillRect(p.x + 9, p.y - 22, 2, 2);
              g.rect(p.x + 4, p.y - 18, 7, 2, C.black);
            }
            // Tap target hint
            c.strokeStyle = 'rgba(248,248,0,.35)';
            c.lineWidth = 1;
            c.beginPath(); c.arc(p.x, p.y, 22, 0, Math.PI * 2); c.stroke();
          }

          // Explosions
          for (const e of this.explosions) {
            const r = (1 - e.life / 0.5) * 22;
            c.globalAlpha = e.life / 0.5;
            g.circle(e.x, e.y, r, C.orange);
            g.circle(e.x, e.y, r * 0.6, C.yellow);
            c.globalAlpha = 1;
          }

          // Breach indicators
          api.txtC('BREACHES: ' + this.breaches + '/' + this.maxBreaches, W / 2, 10, 7, '#FF4040', true);

          // Timer bar
          const pct = Math.min(this.timer / this.goal, 1);
          c.fillStyle = '#101010'; c.fillRect(6, 24, W - 12, 6);
          c.fillStyle = '#00A800'; c.fillRect(6, 24, (W - 12) * pct, 6);
          api.txtC(Math.ceil(Math.max(0, this.goal - this.timer)) + 's LEFT', W / 2, 36, 7, '#A8D040', true);
        },
      },

      /* ========== 5. SAIL FOR HOME ========== */
      {
        id: 'sail', name: 'SAIL FOR HOME', sub: 'THE RESCUE SHIP',

        icon(api, x, y) {
          const g = api.gfx;
          // Sail
          g.rect(x - 1, y - 10, 2, 16, C.woodDk);
          g.rect(x - 1, y - 10, 10, 8, C.white);
          // Hull
          g.rect(x - 8, y + 6, 16, 6, C.ocean);
        },

        intro: [
          'A GREAT SHIP APPROACHES!',
          'THE FAMILY LAUNCHES',
          'THEIR RAFT TO MEET IT.',
          'STEER THROUGH THE',
          'REEFS AND REACH SAFETY!',
        ],
        quote: 'A ship from Europe hove in sight! My heart leaped, yet anguish mingled with joy — who would leave, and who would stay?',
        help:  'STEER left/right · dodge rocks & whirlpools · reach the rescue ship!',
        winText:  'The family grabs the rope ladder! New Switzerland waits for those who chose to stay.',
        loseText: 'The raft is shattered on the reef. So close — yet so far.',

        init(api) {
          this.px     = api.W / 2;
          this.dist   = 0;
          this.goal   = 360;
          this.timer  = 0;
          this.speed  = 16;
          this.obstacles = [];
          this.nextObs   = 0.6;
          this.lives  = 3;
          this.iframes = 0;
          this.wake   = [];
        },

        update(api, dt) {
          const W = api.W, H = api.H, spd = 145;
          this.timer += dt;

          // Steer
          if (api.keyDown('left'))  this.px -= spd * dt;
          if (api.keyDown('right')) this.px += spd * dt;
          if (api.pointer.down) {
            const dx = api.pointer.x - this.px;
            this.px += clamp(dx, -spd * dt * 2.5, spd * dt * 2.5);
          }
          this.px = clamp(this.px, 18, W - 18);

          // Progress
          const vspd = this.speed + this.timer * 0.8;
          this.dist += vspd * dt;

          // Wake particles
          this.wake.push({ x: this.px, y: H - 72, vx: Retro.util.rand(-14, 14), life: 0.5 });
          this.wake = this.wake.filter(w => {
            w.y += 18 * dt; w.x += w.vx * dt; w.life -= dt; return w.life > 0;
          });

          // Spawn obstacles
          this.nextObs -= dt;
          if (this.nextObs <= 0) {
            const diff = 1 + this.dist / this.goal;
            this.nextObs = Retro.util.rand(0.55, 0.90) / diff;
            const types = ['rock', 'rock', 'swirl'];
            const tp = types[Retro.util.randInt(0, 2)];
            this.obstacles.push({
              x: Retro.util.rand(20, W - 20),
              y: -24,
              dy: Retro.util.rand(85, 125),
              tp, r: tp === 'swirl' ? 16 : 14,
            });
          }

          // Move obstacles + collision
          const py = H - 72;
          if (this.iframes > 0) this.iframes -= dt;
          this.obstacles = this.obstacles.filter(ob => {
            ob.y += ob.dy * dt;
            if (this.iframes <= 0) {
              if (Retro.util.dist(ob.x, ob.y, this.px, py) < ob.r + 12) {
                this.lives--;
                this.iframes = 1.1;
                api.shake(5, 0.35);
                api.flash('#0044CC', 0.22);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return false; }
              }
            }
            return ob.y < H + 30;
          });

          if (this.dist >= this.goal) api.win();
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Open ocean
          c.fillStyle = C.oceanDk; c.fillRect(0, 0, W, H);
          c.fillStyle = C.ocean;   c.fillRect(0, 0, W, H * 0.50);
          c.fillStyle = '#3860E0'; c.fillRect(0, 0, W, H * 0.20);

          // Wave bands (scrolling with distance)
          const scroll = this.dist * 1.8;
          for (let i = 0; i < 12; i++) {
            const wy = ((i * 38 + scroll) % (H + 38)) - 20;
            const wo = ((this.timer * 12 + i * 44) % (W + 30)) - 15;
            c.fillStyle = i % 3 === 0 ? '#3060D8' : i % 3 === 1 ? '#2050C8' : '#1840B0';
            c.fillRect(wo, wy, 44, 4);
            c.fillRect(wo + 90, wy, 30, 4);
            c.fillRect(wo + 155, wy, 40, 4);
          }

          // Rescue ship visible at top when close
          const progress = this.dist / this.goal;
          if (progress > 0.5) {
            const shipAlpha = (progress - 0.5) * 2;
            c.globalAlpha = shipAlpha;
            const sx = W / 2, sy = 40;
            // Hull
            c.fillStyle = '#281808'; c.fillRect(sx - 36, sy + 8, 72, 20);
            c.fillStyle = '#382010'; c.fillRect(sx - 32, sy + 6, 64, 14);
            // Masts
            for (let m = -1; m <= 1; m++) {
              g.rect(sx + m * 22 - 2, sy - 40, 4, 52, C.woodDk);
              c.fillStyle = '#F0E8D0';
              c.fillRect(sx + m * 22 - 1, sy - 38, 18, 20);
            }
            c.globalAlpha = 1;
          }

          // Obstacles
          for (const ob of this.obstacles) {
            if (ob.tp === 'rock') {
              c.fillStyle = C.greyDk; c.fillRect(ob.x - 14, ob.y - 10, 28, 20);
              c.fillStyle = '#505050'; c.fillRect(ob.x - 12, ob.y - 8, 24, 16);
              c.fillStyle = C.grey;   c.fillRect(ob.x - 10, ob.y - 12, 20, 6);
            } else {
              // Whirlpool (rings)
              for (let r = 3; r >= 1; r--) {
                const angle = this.timer * (r % 2 === 0 ? 2 : -2);
                c.globalAlpha = 0.20 + r * 0.12;
                c.strokeStyle = C.oceanLt;
                c.lineWidth = 2;
                c.beginPath();
                c.arc(ob.x, ob.y, ob.r * r / 3, angle, angle + Math.PI * 1.4);
                c.stroke();
              }
              c.globalAlpha = 1;
              g.circle(ob.x, ob.y, 5, C.oceanDk);
            }
          }

          // Wake
          for (const w of this.wake) {
            c.globalAlpha = w.life * 0.8;
            c.fillStyle = C.white;
            c.fillRect(w.x - 2, w.y - 2, 4, 4);
            c.globalAlpha = 1;
          }

          // Raft + family
          const py = H - 72;
          if (!(this.iframes > 0 && Math.floor(this.iframes * 8) % 2 === 0)) {
            // Raft planks
            c.fillStyle = C.wood;   c.fillRect(this.px - 20, py, 40, 8);
            c.fillStyle = C.woodDk; c.fillRect(this.px - 20, py + 1, 40, 2);
            for (let pl = 0; pl < 5; pl++) {
              c.fillStyle = C.woodDk;
              c.fillRect(this.px - 18 + pl * 8, py, 2, 8);
            }
            // Sail
            g.rect(this.px - 1, py - 24, 2, 24, C.woodDk);
            c.fillStyle = '#F0E8D0'; c.fillRect(this.px + 1, py - 22, 14, 16);
            c.fillStyle = C.red;     c.fillRect(this.px + 1, py - 22, 14, 4);
            // Family silhouettes (3 tiny people)
            for (let i = 0; i < 3; i++) {
              c.fillStyle = '#202020';
              c.fillRect(this.px - 10 + i * 10, py - 14, 6, 14);
              g.circle(this.px - 7 + i * 10, py - 18, 5, '#E0B888');
            }
          }

          // Lives
          for (let i = 0; i < 3; i++) {
            c.fillStyle = i < this.lives ? C.red : '#303030';
            c.fillRect(6 + i * 20, 8, 14, 12);
          }

          // Distance bar
          const pct = Math.min(this.dist / this.goal, 1);
          c.fillStyle = '#101010'; c.fillRect(6, 26, W - 12, 6);
          c.fillStyle = C.ocean;   c.fillRect(6, 26, (W - 12) * pct, 6);
          api.txtC('TO SHIP: ' + Math.floor((1 - pct) * 100) + '%', W / 2, 38, 7, C.oceanLt, true);
        },
      },

    ], // end chapters
  }); // end RetroSaga.create
})();
