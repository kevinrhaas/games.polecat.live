/* ============================================================================
 * SNOW WHITE — SEVEN FOR THE MINE
 * Five chapters through Brothers Grimm:
 *   1. THE MAGIC MIRROR  — observe & tap who is fairest (tap/observation)
 *   2. FOREST FLIGHT     — dodge grabbing tree-claws (dodge/run)
 *   3. HI-HO MINE        — cart collect: catch gems, avoid boulders
 *   4. POISONED APPLE    — dodge the Evil Queen's apples (dodge/survive)
 *   5. TRUE LOVE'S KISS  — mash to fill the heart meter (mash/timing)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;
  const rand  = Retro.util.rand;
  const randInt = Retro.util.randInt;

  // Mine-tunnel chapter nodes (gem hexagons at 5 waypoints in the mountain)
  const GEM_NODES = [
    [24,  92,  102, 70],
    [144, 162, 102, 70],
    [18,  248, 102, 70],
    [148, 318, 102, 70],
    [68,  396, 134, 64],
  ];
  const GEM_COLS  = ['#e23b4a', '#ff8a3d', '#5dff8f', '#9b5cff', '#ff2e97'];
  const GEM_DARKS = ['#6a1018', '#7a3808', '#1a5a28', '#3c1870', '#6a1050'];
  const GEM_NAMES = ['RUBY', 'AMBER', 'EMERALD', 'AMETHYST', 'ROSE'];

  /* ─────────── emblem: bitten apple ─────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    g.circle(cx - 6, cy + 4, 18, '#c8102e');
    g.circle(cx + 6, cy + 4, 18, '#c8102e');
    g.circle(cx,     cy + 2, 20, '#c8102e');
    g.circle(cx + 7, cy - 5,  5, '#ff7090');
    g.rect(cx - 1, cy - 20, 3, 10, '#3a2006');
    c.fillStyle = '#2aaa2a';
    c.beginPath(); c.ellipse(cx + 8, cy - 22, 9, 4, -0.6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f0d0d8';
    c.beginPath(); c.arc(cx + 14, cy + 8, 8, 0, Math.PI * 2); c.fill();
  }

  /* ─────────── scenery ─────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Mine cross-section with winding tunnel, wooden pit-props, glowing gems
      c.fillStyle = '#180e04'; c.fillRect(0, 0, W, H);
      // rock texture
      for (let i = 0; i < 30; i++) {
        c.globalAlpha = 0.3;
        c.fillStyle = '#0c0802';
        c.fillRect((i * 83 + 17) % W, (i * 67 + 11) % H, 10 + (i % 6) * 5, 5 + (i % 4) * 3);
        c.globalAlpha = 1;
      }
      // winding mine shaft tunnel between chapter nodes
      c.strokeStyle = '#2a1a08'; c.lineWidth = 16;
      c.lineJoin = 'round'; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(GEM_NODES[0][0] + 51, GEM_NODES[0][1] + 35);
      for (let i = 1; i < GEM_NODES.length; i++) {
        c.lineTo(GEM_NODES[i][0] + 51, GEM_NODES[i][1] + 35);
      }
      c.stroke();
      c.strokeStyle = '#3a2510'; c.lineWidth = 5;
      c.beginPath();
      c.moveTo(GEM_NODES[0][0] + 51, GEM_NODES[0][1] + 35);
      for (let i = 1; i < GEM_NODES.length; i++) {
        c.lineTo(GEM_NODES[i][0] + 51, GEM_NODES[i][1] + 35);
      }
      c.stroke();
      // wooden pit-prop beams at intervals
      const beamYs = [80, 185, 295, 385];
      for (const by of beamYs) {
        g.rect(0, by, W, 5, '#3a2010');
        g.rect(0, by, 7, 90, '#2a1808');
        g.rect(W - 7, by, 7, 90, '#2a1808');
      }
      // gem veins twinkling in the rock walls
      for (let i = 0; i < 14; i++) {
        const gx = (i * 73 + 23) % W, gy = (i * 53 + 30) % H;
        c.globalAlpha = 0.45 + 0.4 * Math.sin(t * 3 + i * 0.8);
        g.circle(gx, gy, 2, GEM_COLS[i % GEM_COLS.length]);
        c.globalAlpha = 0.12 + 0.08 * Math.sin(t * 3 + i);
        g.circle(gx, gy, 7, GEM_COLS[i % GEM_COLS.length]);
        c.globalAlpha = 1;
      }
      // hanging lanterns
      for (let i = 0; i < 3; i++) {
        const lx = 55 + i * 80, ly = beamYs[i];
        const gr = c.createRadialGradient(lx, ly + 22, 0, lx, ly + 22, 38);
        gr.addColorStop(0, 'rgba(255,190,60,.18)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = gr; c.fillRect(0, 0, W, H);
        g.rect(lx - 1, ly, 2, 10, '#6a4010');
        g.rect(lx - 5, ly + 10, 10, 14, '#4a2c0c');
        g.rect(lx - 3, ly + 12, 6, 10, '#ffd060');
      }
      return;
    }

    // Enchanted forest / royal castle at night
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a0420'); sky.addColorStop(0.6, '#160828'); sky.addColorStop(1, '#060214');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // twinkling stars
    for (let i = 0; i < 40; i++) {
      const sx = (i * 67 + 11) % W, sy = (i * 43 + 7) % Math.floor(H * 0.5);
      c.globalAlpha = 0.3 + 0.45 * Math.sin(t * 2.2 + i * 0.9);
      g.rect(sx, sy, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1, '#f0e0ff');
      c.globalAlpha = 1;
    }
    // full moon
    g.circle(W - 48, 52, 24, '#f0e8d8');
    g.circle(W - 42, 46, 20, '#ece4d0');
    c.globalAlpha = 0.13; g.circle(W - 48, 52, 40, '#f0e8d8'); c.globalAlpha = 1;

    // castle silhouette
    const castX = W - 92;
    c.fillStyle = '#0e0620';
    c.fillRect(castX, Math.floor(H * 0.13), 80, Math.floor(H * 0.38));
    for (let ti = 0; ti < 5; ti++) {
      c.fillRect(castX + ti * 16, Math.floor(H * 0.07), 10, Math.floor(H * 0.08));
      g.rect(castX + ti * 16 + 1, Math.floor(H * 0.07) - 3, 8, 3, '#0e0620');
    }
    for (let wy = 0; wy < 3; wy++) for (let wx = 0; wx < 3; wx++) {
      c.globalAlpha = 0.5 + 0.3 * Math.sin(t * 1.2 + wx * 1.3 + wy);
      g.rect(castX + 8 + wx * 24, Math.floor(H * 0.17) + wy * 26, 10, 12, '#e8c050');
      c.globalAlpha = 1;
    }

    // foreground forest trees
    const TREES = [
      { x: -4,  h: 90,  sway: 1.1, dk: '#081008' },
      { x: 42,  h: 110, sway: 0.9, dk: '#0a1808' },
      { x: 88,  h: 80,  sway: 1.4, dk: '#061006' },
      { x: 132, h: 96,  sway: 0.7, dk: '#081408' },
      { x: 182, h: 72,  sway: 1.2, dk: '#0a1208' },
      { x: 224, h: 100, sway: 1.0, dk: '#061008' },
    ];
    for (const tr of TREES) {
      const sw = Math.sin(t * tr.sway + tr.x * 0.05) * 1.5;
      g.rect(tr.x + 6 + sw * 0.2, H - 26 - tr.h * 0.35, 5, tr.h * 0.35 + 26, '#1a0c04');
      c.fillStyle = tr.dk;
      c.beginPath(); c.moveTo(tr.x + sw, H - 26 - tr.h); c.lineTo(tr.x + 18 + sw, H - 26 - tr.h * 0.45); c.lineTo(tr.x - 4 + sw, H - 26 - tr.h * 0.45); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(tr.x + 3 + sw * 0.6, H - 26 - tr.h * 0.5); c.lineTo(tr.x + 20 + sw * 0.6, H - 26 - tr.h * 0.18); c.lineTo(tr.x - 3 + sw * 0.6, H - 26 - tr.h * 0.18); c.closePath(); c.fill();
    }
    // ground
    c.fillStyle = '#0a1206'; c.fillRect(0, H - 26, W, 26);
    for (let gx = 0; gx < W; gx += 18) g.rect(gx, H - 26, 14, 2, '#0e1808');

    // glowing gems in the soil
    for (let i = 0; i < 3; i++) {
      const gx = 30 + i * 80, gy = H - 18;
      c.globalAlpha = 0.7 + 0.25 * Math.sin(t * 3 + i);
      g.circle(gx, gy, 3, GEM_COLS[i]);
      c.globalAlpha = 0.15 + 0.1 * Math.sin(t * 3 + i);
      g.circle(gx, gy, 9, GEM_COLS[i]);
      c.globalAlpha = 1;
    }

    // dwarfs' cottage (warm window)
    g.rect(2, H - 56, 44, 56, '#1e1004');
    c.fillStyle = '#2a1808';
    c.beginPath(); c.moveTo(-2, H - 56); c.lineTo(24, H - 80); c.lineTo(50, H - 56); c.closePath(); c.fill();
    c.globalAlpha = 0.7 + 0.2 * Math.sin(t * 2.2);
    g.rect(12, H - 46, 12, 12, '#ffd060');
    c.globalAlpha = 1;
    g.rect(30, H - 44, 8, 18, '#1e1004');

    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(4,2,10,.62)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─────────── helper: draw Snow White sprite ─────────── */
  function drawSW(api, sx, sy, hitFlash, t2) {
    const g = api.gfx, c = api.ctx;
    if (hitFlash && Math.floor(hitFlash * 8) % 2 === 0) return;
    // dress (blue + yellow collar)
    g.rect(sx - 10, sy - 2, 20, 28, '#1848c8');
    g.rect(sx - 6, sy - 2, 12, 6, '#e8c050');
    // skin
    g.rect(sx - 5, sy - 18, 10, 14, '#f8d8d0');
    // black hair
    c.fillStyle = '#100c10';
    c.beginPath(); c.arc(sx, sy - 18, 7, Math.PI, 0); c.fill();
    g.rect(sx - 8, sy - 16, 4, 10, '#100c10');
    g.rect(sx + 4, sy - 16, 4, 10, '#100c10');
    // red bow
    g.rect(sx - 4, sy - 28, 8, 4, '#c8102e');
    // running legs
    const lp = Math.sin((t2 || 0) * 10);
    g.rect(sx - 6, sy + 26, 4, 10 + lp * 4, '#1848c8');
    g.rect(sx + 2, sy + 26, 4, 10 - lp * 4, '#1848c8');
  }

  /* ═══════════════════════════════════════════════════════ */
  RetroSaga.create({
    id:       'snowwhite',
    title:    'Snow White',
    subtitle: 'SEVEN FOR THE MINE',
    currency: 'GEMS',
    screens: {
      win:          '#5dff8f',
      lose:         '#e23b4a',
      chapterLabel: '#c8a0d8',
      name:         '#f8e4ff',
      sub:          '#c060e0',
      intro:        '#e8d0f8',
      quote:        '#a080c0',
      help:         '#5dff8f',
      score:        '#f8e4ff',
      cur:          '#5dff8f',
      cta:          '#f8e4ff',
      overlay:      'rgba(6,2,14,.85)',
    },
    labels: {
      chapter:  'TALE',
      score:    'GEMS FOUND',
      win:      'THE FOREST SMILES',
      lose:     'THE QUEEN LAUGHS',
      cont:     'TAP TO PRESS ON',
      finale:   'TAP TO WAKE HER',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO BEGIN',
    },
    accent:     '#5dff8f',
    credit:     'SNOW WHITE · BROTHERS GRIMM, 1812',
    bootCta:    'TAP TO ENTER',
    menuLabel:  "THE DWARFS' MOUNTAIN",
    menuHint:   'CHOOSE A TALE TO PLAY',
    menuDone:   'THE SPELL IS BROKEN',
    emblem,
    scenery,
    finale: ["THE QUEEN'S SPELL IS BROKEN.", 'SNOW WHITE WAKES.', '', 'AND THE SEVEN DWARFS', 'DANCE ALL NIGHT LONG.'],
    width: 270, height: 480, parent: '#game',

    menu: {
      colors: { title: '#5dff8f', label: '#c8a0d8', cur: '#f8e4ff' },
      layout(api) {
        return GEM_NODES.map(function(n) { return { x: n[0], y: n[1], w: n[2], h: n[3] }; });
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const ch = info.ch, i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        const sel = info.sel, done = info.done;
        const col  = GEM_COLS[i];
        const dark = GEM_DARKS[i];
        const cx2 = x + w / 2, cy2 = y + h / 2;

        // gem hexagon card
        c.fillStyle = sel ? dark : '#0e0808';
        c.strokeStyle = sel ? col : '#3a2010';
        c.lineWidth = sel ? 2 : 1;
        const pts = [];
        for (let a = 0; a < 6; a++) {
          const ang = (a / 6) * Math.PI * 2 - Math.PI / 2;
          pts.push([cx2 + Math.cos(ang) * (w * 0.45), cy2 + Math.sin(ang) * (h * 0.44)]);
        }
        c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
        for (let p = 1; p < pts.length; p++) c.lineTo(pts[p][0], pts[p][1]);
        c.closePath(); c.fill(); c.stroke();

        // gem facet (sparkle overlay)
        c.globalAlpha = sel ? 0.28 : 0.12;
        c.fillStyle = col;
        c.beginPath();
        c.moveTo(cx2 - w * 0.16, cy2 - h * 0.28);
        c.lineTo(cx2 + w * 0.18, cy2 - h * 0.06);
        c.lineTo(cx2, cy2 + h * 0.26);
        c.lineTo(cx2 - w * 0.20, cy2 + h * 0.04);
        c.closePath(); c.fill();
        c.globalAlpha = 1;

        // gem type label
        api.txtCFit(GEM_NAMES[i], cx2, cy2 - h * 0.27, 7, done ? col : '#6a5060', true);
        // chapter name
        api.txtCFit((i + 1) + '. ' + ch.name, cx2, cy2 - h * 0.08, 7, sel ? '#f8e4ff' : '#c8b0c8', false, w - 10);
        if (ch.sub) api.txtCFit(ch.sub, cx2, cy2 + h * 0.11, 6, sel ? '#c0a0d8' : '#806070', false, w - 10);
        if (done) { c.globalAlpha = 0.9; g.circle(cx2, cy2 + h * 0.32, 5, col); c.globalAlpha = 1; }
      },
    },

    chapters: [

      /* ═══════════════════════════════════════════════════
       * TALE 1 · THE MAGIC MIRROR — tap Snow White
       * ═══════════════════════════════════════════════════ */
      {
        id: 'mirror', name: 'THE MAGIC MIRROR', sub: 'WHO IS FAIREST?',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 7, '#6840a0');
          g.circle(x, y, 5, '#c8a0e8');
          g.rect(x - 2, y + 6, 4, 5, '#4a3060');
        },
        intro: ['THE EVIL QUEEN ASKS', 'THE ENCHANTED MIRROR:', '"Who is the FAIREST?"', '', 'The mirror shows', 'THREE faces.', 'Tap SNOW WHITE!'],
        quote: '"Mirror, mirror on the wall, who in this land is fairest of all?" — Brothers Grimm',
        help: 'TAP THE FACE OF SNOW WHITE · 5 ROUNDS · GETS FASTER!',
        winText:  'THE MIRROR SPEAKS TRUTH!',
        loseText: 'THE QUEEN LAUGHS DARKLY.',
        init(api) {
          this.round     = 0;
          this.maxRound  = 5;
          this.faceTypes = [0, 1, 2];
          this.correct   = 0;
          this.chosen    = -1;
          this.timer     = 0;
          this.timeLimit = 4.0;
          this.feedback  = 0;
          this.startRound(api);
        },
        startRound(api) {
          this.round++;
          this.chosen   = -1;
          this.feedback = 0;
          this.timer    = 0;
          this.timeLimit = Math.max(1.6, 4.2 - this.round * 0.4);
          // shuffle face positions; 0=Snow White, 1=Queen, 2=Villager
          const pos = [0, 1, 2];
          for (let i = pos.length - 1; i > 0; i--) {
            const j = randInt(0, i);
            const tmp = pos[i]; pos[i] = pos[j]; pos[j] = tmp;
          }
          this.faceTypes = pos;
          this.correct   = pos.indexOf(0);
        },
        drawFace(api, slot, fx, fy, r) {
          const g = api.gfx, c = api.ctx;
          const ft = this.faceTypes[slot];
          g.circle(fx, fy, r, ft === 0 ? '#f8e8e8' : ft === 1 ? '#d8c8d8' : '#f8d8c8');
          if (ft === 0) {
            // Snow White: pale, black hair, red lips, bow
            c.fillStyle = '#100c10';
            c.beginPath(); c.arc(fx, fy - r * 0.38, r * 0.88, Math.PI, 0); c.fill();
            g.rect(fx - r, fy - r * 0.28, r * 0.28, r, '#100c10');
            g.rect(fx + r * 0.72, fy - r * 0.28, r * 0.28, r, '#100c10');
            g.circle(fx - r * 0.3, fy - r * 0.08, 2, '#1a0c10');
            g.circle(fx + r * 0.3, fy - r * 0.08, 2, '#1a0c10');
            g.circle(fx - r * 0.28, fy - r * 0.10, 1, '#f8f8f8');
            c.fillStyle = '#e04060';
            c.beginPath(); c.arc(fx, fy + r * 0.26, 4, 0, Math.PI); c.fill();
            g.rect(fx - 4, fy - r + 4, 8, 4, '#c8102e');
          } else if (ft === 1) {
            // Evil Queen: angular dark hair, crown, stern eyes
            c.fillStyle = '#0a0808';
            c.beginPath(); c.moveTo(fx - r, fy); c.lineTo(fx - r * 0.65, fy - r); c.lineTo(fx, fy - r * 0.5); c.lineTo(fx + r * 0.65, fy - r); c.lineTo(fx + r, fy); c.closePath(); c.fill();
            g.circle(fx, fy, r * 0.78, '#d8c8d8');
            g.circle(fx - r * 0.3, fy - r * 0.06, 2, '#1a0820');
            g.circle(fx + r * 0.3, fy - r * 0.06, 2, '#1a0820');
            g.rect(fx - 5, fy + r * 0.26, 10, 2, '#8a1840');
            for (let p = 0; p < 5; p++) {
              g.rect(fx - 10 + p * 5, fy - r * 0.86 - (p % 2 === 0 ? 0 : 5), 3, 7 + (p % 2 === 0 ? 0 : 5), '#d4a010');
            }
          } else {
            // Villager: rosy, brown hair, smile
            c.fillStyle = '#6a3810';
            c.beginPath(); c.arc(fx, fy - r * 0.28, r * 0.82, Math.PI, 0); c.fill();
            g.circle(fx, fy, r * 0.82, '#f8d8c8');
            g.circle(fx - r * 0.3, fy, 2, '#4a2c10');
            g.circle(fx + r * 0.3, fy, 2, '#4a2c10');
            c.strokeStyle = '#a06040'; c.lineWidth = 1.5;
            c.beginPath(); c.arc(fx, fy + r * 0.18, 5, 0, Math.PI); c.stroke();
            c.globalAlpha = 0.3;
            g.circle(fx - r * 0.48, fy + r * 0.12, 4, '#ff8080');
            g.circle(fx + r * 0.48, fy + r * 0.12, 4, '#ff8080');
            c.globalAlpha = 1;
          }
        },
        update(api, dt) {
          if (this.feedback > 0) {
            this.feedback -= dt;
            if (this.feedback <= 0) {
              if (this.chosen !== this.correct) { api.lose(); return; }
              if (this.round >= this.maxRound) { api.win(); return; }
              this.startRound(api);
            }
            return;
          }
          this.timer += dt;
          if (this.timer >= this.timeLimit) {
            this.chosen = -1; this.feedback = 1.0;
            api.shake(4, 0.3); api.flash('#c8102e', 0.3); api.audio.sfx('hurt');
            return;
          }
          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            const FY = 220, FR = 36;
            for (let s = 0; s < 3; s++) {
              const fx2 = (s * 2 + 1) / 6 * api.W;
              if ((px - fx2) * (px - fx2) + (py - FY) * (py - FY) < (FR + 8) * (FR + 8)) {
                this.chosen = s;
                if (s === this.correct) {
                  api.addScore(Math.round((1 - this.timer / this.timeLimit) * 100 + 50));
                  this.feedback = 0.7;
                  api.flash('#5dff8f', 0.25); api.audio.sfx('coin');
                  api.burst(fx2, FY, '#5dff8f', 12);
                } else {
                  this.feedback = 0.9;
                  api.shake(5, 0.4); api.flash('#c8102e', 0.4); api.audio.sfx('hurt');
                }
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#180830'); bg.addColorStop(1, '#0c0420');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // mirror frame (oval)
          g.circle(W / 2, 218, 112, '#2a1840');
          g.circle(W / 2, 218, 108, '#c8a0e8');
          g.circle(W / 2, 218, 102, '#180830');
          const mg = c.createRadialGradient(W / 2, 218, 20, W / 2, 218, 102);
          mg.addColorStop(0, 'rgba(160,100,220,.18)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = mg; c.fillRect(0, 0, W, H);
          g.rect(W / 2 - 8, 320, 16, 28, '#c8a0e8');
          g.rect(W / 2 - 18, 344, 36, 8, '#c8a0e8');

          api.topBar('TALE 1: THE MAGIC MIRROR');
          api.txt('ROUND ' + this.round + '/' + this.maxRound, 6, 20, 8, '#c8a0e8');

          const FY = 218, FR = 36;
          for (let s = 0; s < 3; s++) {
            const fx2 = (s * 2 + 1) / 6 * W;
            this.drawFace(api, s, fx2, FY, FR);
            if (this.feedback > 0 && s === this.chosen) {
              c.strokeStyle = s === this.correct ? '#5dff8f' : '#e23b4a';
              c.lineWidth = 3;
              c.beginPath(); c.arc(fx2, FY, FR + 4, 0, Math.PI * 2); c.stroke();
            }
          }

          if (this.feedback <= 0) {
            api.txtCFit('TAP SNOW WHITE', W / 2, 278, 9, '#e8d0ff');
          } else {
            api.txtCFit(this.chosen === this.correct ? 'CORRECT!' : 'WRONG!', W / 2, 278, 11,
              this.chosen === this.correct ? '#5dff8f' : '#e23b4a');
          }
          // timer bar
          const pct = this.feedback > 0 ? 1 : 1 - this.timer / this.timeLimit;
          g.rect(20, 306, 230, 6, '#2a1840');
          g.rect(20, 306, Math.round(230 * pct), 6, pct > 0.5 ? '#5dff8f' : pct > 0.25 ? '#ff8a3d' : '#e23b4a');
          api.vignette();
        },
      },

      /* ═══════════════════════════════════════════════════
       * TALE 2 · FOREST FLIGHT — dodge grabbing tree-claws
       * ═══════════════════════════════════════════════════ */
      {
        id: 'forest', name: 'FOREST FLIGHT', sub: 'RUN FROM THE QUEEN',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 2, y - 8, 4, 14, '#1e0e04');
          g.circle(x, y - 10, 7, '#0a2006');
        },
        intro: ['THE QUEEN ORDERS', 'THE HUNTSMAN TO', 'KILL SNOW WHITE.', '', 'She flees into the', 'ENCHANTED FOREST!', 'The trees grab at her!'],
        quote: '"She ran as fast as her feet would carry her over sharp stones and through thorns." — Grimm',
        help: 'TAP LEFT / RIGHT SIDE · DODGE THE GRABBING CLAWS · SURVIVE!',
        winText:  'SNOW WHITE ESCAPES!',
        loseText: 'THE FOREST HOLDS HER.',
        init(api) {
          this.swX       = api.W / 2;
          this.swY       = api.H - 82;
          this.obstacles = [];
          this.spawnT    = 0;
          this.spawnRate = 1.4;
          this.survived  = 0;
          this.goal      = 22;
          this.lives     = 3;
          this.hitFlash  = 0;
          this.speed     = 95;
        },
        update(api, dt) {
          if (this.lives <= 0) { api.lose(); return; }
          if (this.survived >= this.goal) { api.win(); return; }

          this.survived += dt;
          this.hitFlash  = Math.max(0, this.hitFlash - dt);
          this.spawnT   += dt;
          if (this.spawnT >= this.spawnRate) {
            this.spawnT -= this.spawnRate;
            this.spawnRate = Math.max(0.55, this.spawnRate - 0.04);
            const lane = randInt(0, 2);
            const lx   = [55, api.W / 2, api.W - 55][lane];
            this.obstacles.push({ x: lx, y: -20, vy: 90 + this.survived * 5, hit: false });
          }
          // movement
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < api.W / 2))
            this.swX = clamp(this.swX - this.speed * dt, 28, api.W - 28);
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= api.W / 2))
            this.swX = clamp(this.swX + this.speed * dt, 28, api.W - 28);

          for (const ob of this.obstacles) ob.y += ob.vy * dt;
          this.obstacles = this.obstacles.filter(function(ob) { return ob.y < api.H + 30; });

          for (const ob of this.obstacles) {
            if (ob.hit) continue;
            if (Math.abs(ob.x - this.swX) < 22 && Math.abs(ob.y - this.swY) < 22) {
              ob.hit = true; this.lives--;
              this.hitFlash = 0.5;
              api.shake(6, 0.4); api.flash('#c8102e', 0.4); api.audio.sfx('hurt');
              api.burst(this.swX, this.swY, '#e23b4a', 10);
            }
          }
          api.addScore(dt * 10);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const bg2 = c.createLinearGradient(0, 0, 0, H);
          bg2.addColorStop(0, '#040c04'); bg2.addColorStop(1, '#0a1808');
          c.fillStyle = bg2; c.fillRect(0, 0, W, H);

          // scrolling background trees
          const scroll = (api.t * 40) % 180;
          for (let ti = 0; ti < 6; ti++) {
            const tx = (ti * 46 + scroll) % W;
            g.rect(tx - 2, H - 120, 5, 120, '#1a0e04');
            c.fillStyle = ti % 2 === 0 ? '#061006' : '#081408';
            c.beginPath(); c.moveTo(tx - 20, H - 120); c.lineTo(tx, H - 175); c.lineTo(tx + 20, H - 120); c.closePath(); c.fill();
          }
          g.rect(0, H - 52, W, 52, '#0c1806');
          for (let gx = 0; gx < W; gx += 18) g.rect(gx, H - 52, 14, 3, '#0e1c08');

          // falling tree-claw obstacles
          for (const ob of this.obstacles) {
            c.fillStyle = '#1a0e04';
            c.beginPath(); c.moveTo(ob.x - 6, ob.y); c.lineTo(ob.x + 6, ob.y); c.lineTo(ob.x + 4, ob.y + 22); c.lineTo(ob.x - 4, ob.y + 22); c.closePath(); c.fill();
            for (let cl = -2; cl <= 2; cl++) {
              c.fillStyle = '#240e04';
              c.beginPath(); c.moveTo(ob.x + cl * 5, ob.y + 18); c.lineTo(ob.x + cl * 5 - 3, ob.y + 36); c.lineTo(ob.x + cl * 5 + 3, ob.y + 36); c.closePath(); c.fill();
            }
          }

          drawSW(api, this.swX, this.swY, this.hitFlash, api.t);

          api.topBar('TALE 2: FOREST FLIGHT');
          api.txt('SURVIVE: ' + Math.round(this.goal - this.survived) + 's', 6, 20, 8, '#5dff8f');
          for (let lf = 0; lf < this.lives; lf++) g.circle(W - 14 - lf * 16, 24, 5, '#e23b4a');
          if (api.t < 3) { c.globalAlpha = 0.6; api.txtC('← TAP LEFT  RIGHT →', W / 2, H - 18, 7, '#e8d0ff'); c.globalAlpha = 1; }
          api.vignette();
        },
      },

      /* ═══════════════════════════════════════════════════
       * TALE 3 · HI-HO MINE — catch gems in the mine cart
       * ═══════════════════════════════════════════════════ */
      {
        id: 'mine', name: 'HI-HO MINE', sub: 'THE DWARFS AT WORK',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 2, 16, 8, '#6a4010');
          g.rect(x - 6, y + 6, 4, 4, '#3a2008');
          g.rect(x + 2, y + 6, 4, 4, '#3a2008');
          g.circle(x + 9, y - 6, 4, '#5dff8f');
        },
        intro: ['DEEP IN THE MOUNTAIN,', 'THE SEVEN DWARFS', 'ARE AT THEIR WORK.', '', 'Snow White joins them!', 'Catch GEMS in the cart!', 'Avoid the BOULDERS!'],
        quote: '"Hi-ho, hi-ho, it\'s off to work we go!" — traditional dwarf song',
        help: 'TAP LEFT / RIGHT · CATCH GEMS · AVOID BOULDERS · GET 15!',
        winText:  'HI-HO! WHAT A HAUL!',
        loseText: 'CRUSHED BY A BOULDER.',
        init(api) {
          this.cartX     = api.W / 2;
          this.cartY     = api.H - 58;
          this.cartW     = 42;
          this.items     = [];
          this.spawnT    = 0;
          this.spawnRate = 1.2;
          this.caught    = 0;
          this.goal      = 15;
          this.lives     = 3;
          this.hitFlash  = 0;
          this.speed     = 120;
        },
        update(api, dt) {
          if (this.lives <= 0) { api.lose(); return; }
          if (this.caught >= this.goal) { api.win(); return; }

          this.hitFlash = Math.max(0, this.hitFlash - dt);
          this.spawnT  += dt;
          if (this.spawnT >= this.spawnRate) {
            this.spawnT -= this.spawnRate;
            this.spawnRate = Math.max(0.48, this.spawnRate - 0.025);
            const isGem = Math.random() < 0.65;
            const gidx  = randInt(0, 4);
            this.items.push({
              x: randInt(22, api.W - 22),
              y: -10,
              vy: 70 + this.caught * 5,
              gem: isGem,
              col: isGem ? GEM_COLS[gidx] : '#7a5828',
              r: isGem ? 6 : 9,
              hit: false,
            });
          }
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < api.W / 2))
            this.cartX = clamp(this.cartX - this.speed * dt, this.cartW / 2 + 8, api.W - this.cartW / 2 - 8);
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= api.W / 2))
            this.cartX = clamp(this.cartX + this.speed * dt, this.cartW / 2 + 8, api.W - this.cartW / 2 - 8);

          for (const it of this.items) it.y += it.vy * dt;
          this.items = this.items.filter(function(it) { return it.y < api.H + 20; });

          for (const it of this.items) {
            if (it.hit) continue;
            if (Math.abs(it.x - this.cartX) < this.cartW / 2 + it.r - 4 &&
                Math.abs(it.y - this.cartY) < 18) {
              it.hit = true;
              if (it.gem) {
                this.caught++;
                api.addScore(50);
                api.burst(it.x, it.y, it.col, 8);
                api.audio.sfx('coin');
              } else {
                this.lives--;
                this.hitFlash = 0.5;
                api.shake(7, 0.4); api.flash('#c8102e', 0.3); api.audio.sfx('hurt');
                api.burst(it.x, it.y, '#c8102e', 10);
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const bg3 = c.createLinearGradient(0, 0, 0, H);
          bg3.addColorStop(0, '#0e0a04'); bg3.addColorStop(1, '#1a1208');
          c.fillStyle = bg3; c.fillRect(0, 0, W, H);

          // rock texture
          for (let i = 0; i < 25; i++) {
            c.globalAlpha = 0.22;
            c.fillStyle = '#2a1808';
            c.fillRect((i * 79 + 13) % W, (i * 61 + 9) % (H - 60), 8 + (i % 5) * 4, 4 + (i % 3) * 2);
            c.globalAlpha = 1;
          }

          // mine rails
          const ry = H - 42;
          g.rect(0, ry, W, 6, '#4a3010');
          g.rect(0, ry, W, 2, '#6a4818');
          for (let rx = 0; rx < W; rx += 24) g.rect(rx, ry - 2, 18, 4, '#3a2008');

          // falling items
          for (const it of this.items) {
            if (it.gem) {
              c.fillStyle = it.col;
              c.beginPath();
              c.moveTo(it.x, it.y - it.r);
              c.lineTo(it.x + it.r * 0.7, it.y);
              c.lineTo(it.x, it.y + it.r);
              c.lineTo(it.x - it.r * 0.7, it.y);
              c.closePath(); c.fill();
              c.globalAlpha = 0.4; c.fillStyle = '#ffffff';
              c.beginPath(); c.moveTo(it.x - it.r * 0.3, it.y - it.r * 0.5); c.lineTo(it.x + it.r * 0.2, it.y - it.r * 0.1); c.lineTo(it.x, it.y - it.r * 0.1); c.closePath(); c.fill();
              c.globalAlpha = 1;
            } else {
              g.circle(it.x, it.y, it.r, '#5a4020');
              g.circle(it.x - 2, it.y - 2, it.r * 0.5, '#6a5028');
            }
          }

          // mine cart
          const cx3 = this.cartX, cy3 = this.cartY, cw = this.cartW;
          if (!(this.hitFlash > 0 && Math.floor(this.hitFlash * 8) % 2 === 0)) {
            g.rect(cx3 - cw / 2, cy3 - 20, cw, 20, '#6a4010');
            g.rect(cx3 - cw / 2 + 2, cy3 - 18, cw - 4, 16, '#4a2c08');
            g.circle(cx3 - cw / 2 + 7, cy3, 6, '#3a2008');
            g.circle(cx3 + cw / 2 - 7, cy3, 6, '#3a2008');
            g.circle(cx3 - cw / 2 + 7, cy3, 3, '#6a4010');
            g.circle(cx3 + cw / 2 - 7, cy3, 3, '#6a4010');
          }

          // small decorative dwarfs
          for (let d = 0; d < 3; d++) {
            const dx = 22 + d * 82, dy = H - 100;
            g.circle(dx, dy, 10, '#f8d8c0');
            g.rect(dx - 10, dy - 18, 20, 8, d % 2 === 0 ? '#4a3010' : '#c8102e');
            g.rect(dx + 10, dy - 3, 12, 2, '#6a4010');
            g.rect(dx + 20, dy - 7, 3, 8, '#8a6010');
          }

          api.topBar('TALE 3: HI-HO MINE');
          api.txt('GEMS: ' + this.caught + '/' + this.goal, 6, 20, 8, '#5dff8f');
          for (let lf = 0; lf < this.lives; lf++) g.circle(W - 14 - lf * 16, 24, 5, '#e23b4a');
          if (api.t < 3) { c.globalAlpha = 0.6; api.txtC('← TAP LEFT  RIGHT →', W / 2, H - 14, 7, '#e8d0b0'); c.globalAlpha = 1; }
          api.vignette();
        },
      },

      /* ═══════════════════════════════════════════════════
       * TALE 4 · THE POISONED APPLE — dodge the hag's apples
       * ═══════════════════════════════════════════════════ */
      {
        id: 'apple', name: 'THE POISONED APPLE', sub: 'BEWARE THE HAG',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 6, '#c8102e');
          g.rect(x - 1, y - 7, 2, 5, '#3a2006');
          g.circle(x + 4, y + 2, 3, '#f8f0f0');
        },
        intro: ['THE EVIL QUEEN,', 'DISGUISED AS AN OLD HAG,', 'OFFERS APPLES.', '', 'DODGE the RED ones!', 'Catch the GOLDEN ones!', 'Survive 20 seconds!'],
        quote: '"She disguised herself so cunningly that no one could have told who she was." — Grimm',
        help: 'TAP LEFT / RIGHT · DODGE RED APPLES · CATCH GOLDEN · 20s',
        winText:  'NOT THIS TIME, QUEEN!',
        loseText: 'THE APPLE TOOK HER.',
        init(api) {
          this.swX      = api.W / 2;
          this.swY      = api.H - 72;
          this.apples   = [];
          this.spawnT   = 0;
          this.spawnRate= 1.2;
          this.survived = 0;
          this.goal     = 20;
          this.lives    = 3;
          this.hitFlash = 0;
          this.speed    = 100;
          this.queenT   = 0;
          this.queenX   = api.W / 2;
        },
        update(api, dt) {
          if (this.lives <= 0) { api.lose(); return; }
          if (this.survived >= this.goal) { api.win(); return; }

          this.survived += dt;
          this.hitFlash  = Math.max(0, this.hitFlash - dt);
          this.queenT   += dt;
          this.queenX    = api.W / 2 + Math.sin(this.queenT * 0.9) * (api.W / 2 - 40);

          this.spawnT += dt;
          if (this.spawnT >= this.spawnRate) {
            this.spawnT -= this.spawnRate;
            this.spawnRate = Math.max(0.55, this.spawnRate - 0.025);
            const poisoned = Math.random() < 0.6;
            this.apples.push({
              x: this.queenX + rand(-20, 20),
              y: 70, vy: 72 + this.survived * 3,
              poisoned,
              col: poisoned ? '#c8102e' : '#e8c010',
              hit: false,
            });
          }

          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < api.W / 2))
            this.swX = clamp(this.swX - this.speed * dt, 24, api.W - 24);
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= api.W / 2))
            this.swX = clamp(this.swX + this.speed * dt, 24, api.W - 24);

          for (const ap of this.apples) ap.y += ap.vy * dt;
          this.apples = this.apples.filter(function(ap) { return ap.y < api.H + 10; });

          for (const ap of this.apples) {
            if (ap.hit) continue;
            if (Math.abs(ap.x - this.swX) < 22 && Math.abs(ap.y - this.swY) < 22) {
              ap.hit = true;
              if (ap.poisoned) {
                this.lives--;
                this.hitFlash = 0.6;
                api.shake(7, 0.4); api.flash('#c8102e', 0.4); api.audio.sfx('hurt');
                api.burst(ap.x, ap.y, '#c8102e', 10);
              } else {
                api.addScore(80);
                api.flash('#5dff8f', 0.2); api.audio.sfx('coin');
                api.burst(ap.x, ap.y, '#e8c010', 8);
              }
            }
          }
          api.addScore(dt * 8);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const bg4 = c.createLinearGradient(0, 0, 0, H);
          bg4.addColorStop(0, '#0c0a04'); bg4.addColorStop(1, '#160e08');
          c.fillStyle = bg4; c.fillRect(0, 0, W, H);

          // apple tree in bg
          g.rect(W / 2 - 4, 60, 8, 80, '#2a1408');
          g.circle(W / 2, 50, 36, '#0e2808');
          g.circle(W / 2 - 14, 42, 22, '#0a2006');
          g.circle(W / 2 + 16, 44, 18, '#0c2408');
          for (let ai = 0; ai < 5; ai++) g.circle(W / 2 - 20 + ai * 11, 36 + (ai % 2) * 12, 5, '#c8102e');

          // evil queen disguised as hag
          const qx = Math.round(this.queenX);
          c.fillStyle = '#180610';
          c.beginPath(); c.moveTo(qx - 14, 34); c.lineTo(qx + 14, 34); c.lineTo(qx + 20, 84); c.lineTo(qx - 20, 84); c.closePath(); c.fill();
          g.circle(qx, 24, 11, '#d8b890');
          c.fillStyle = '#180610';
          c.beginPath(); c.moveTo(qx - 14, 24); c.lineTo(qx + 14, 24); c.lineTo(qx, -2); c.closePath(); c.fill();
          c.fillRect(qx - 16, 22, 32, 4);
          g.circle(qx - 4, 24, 2, '#d4a010');
          g.circle(qx + 4, 24, 2, '#d4a010');

          // falling apples
          for (const ap of this.apples) {
            g.circle(ap.x, ap.y, 8, ap.col);
            g.rect(ap.x - 1, ap.y - 9, 2, 5, '#3a2006');
            c.globalAlpha = 0.4; g.circle(ap.x + 2, ap.y - 2, 3, '#ffffff'); c.globalAlpha = 1;
            if (!ap.poisoned) { c.globalAlpha = 0.6; g.circle(ap.x + 2, ap.y - 2, 2, '#ffffaa'); c.globalAlpha = 1; }
          }

          g.rect(0, H - 50, W, 50, '#0c1806');
          drawSW(api, this.swX, this.swY, this.hitFlash, api.t);

          api.topBar('TALE 4: POISONED APPLE');
          api.txt('SURVIVE: ' + Math.round(this.goal - this.survived) + 's', 6, 20, 8, '#5dff8f');
          for (let lf = 0; lf < this.lives; lf++) g.circle(W - 14 - lf * 16, 24, 5, '#e23b4a');
          if (api.t < 3) { c.globalAlpha = 0.6; api.txtC('← TAP LEFT  RIGHT →', W / 2, H - 14, 7, '#e8d0b0'); c.globalAlpha = 1; }
          api.vignette();
        },
      },

      /* ═══════════════════════════════════════════════════
       * TALE 5 · TRUE LOVE'S KISS — fill the heart meter
       * ═══════════════════════════════════════════════════ */
      {
        id: 'kiss', name: "TRUE LOVE'S KISS", sub: 'BREAK THE SPELL',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.fillStyle = '#e23b4a';
          c.beginPath();
          c.moveTo(x, y + 6); c.bezierCurveTo(x - 8, y - 4, x - 14, y, x, y + 10);
          c.bezierCurveTo(x + 14, y, x + 8, y - 4, x, y + 6);
          c.closePath(); c.fill();
        },
        intro: ['THE SEVEN DWARFS', 'FIND SNOW WHITE', 'IN HER GLASS COFFIN.', '', 'A PRINCE sees her', 'and cannot leave...', 'Fill the heart with love!'],
        quote: '"He could not take his eyes from her and said: Let me have the glass coffin." — Grimm',
        help: 'TAP RAPIDLY TO FILL THE HEART · BEFORE DARKNESS FALLS!',
        winText:  'THE SPELL IS BROKEN!',
        loseText: 'DARKNESS WINS.',
        init(api) {
          this.love      = 30;
          this.decay     = 12;
          this.timer     = 26;
          this.heartPulse= 0;
          this.tapFlash  = 0;
          this.princeX   = -24;
          this.won       = false;
        },
        update(api, dt) {
          if (this.won) return;
          this.timer      = Math.max(0, this.timer - dt);
          this.love       = clamp(this.love - this.decay * dt, 0, 100);
          this.heartPulse = Math.max(0, this.heartPulse - dt * 3);
          this.tapFlash   = Math.max(0, this.tapFlash - dt);
          this.princeX    = clamp(this.princeX + (this.love / 8) * dt * 20, -24, api.W - 44);

          const pressed = api.pointer.justDown || api.keyPressed('a') || api.keyPressed('start') || api.keyPressed('up');
          if (pressed) {
            this.love = Math.min(100, this.love + 8 + (100 - this.love) * 0.04);
            this.heartPulse = 1;
            this.tapFlash   = 0.15;
            api.addScore(10);
            api.audio.sfx('blip');
            api.burst(api.W / 2, api.H / 2 - 20, '#e23b4a', 4);
          }
          if (this.love >= 100 || (this.timer <= 0 && this.love >= 70)) {
            this.won = true; api.win();
          } else if (this.timer <= 0 || this.love <= 0) {
            api.lose();
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const bg5 = c.createLinearGradient(0, 0, 0, H);
          bg5.addColorStop(0, '#14082a'); bg5.addColorStop(1, '#0a0418');
          c.fillStyle = bg5; c.fillRect(0, 0, W, H);

          // stars
          for (let i = 0; i < 30; i++) {
            const sx = (i * 67 + 11) % W, sy = (i * 43 + 7) % Math.floor(H * 0.4);
            c.globalAlpha = 0.3 + 0.4 * Math.sin(api.t * 2 + i);
            g.rect(sx, sy, 1, 1, '#f8e8ff');
            c.globalAlpha = 1;
          }

          // glass coffin
          const cofX = W / 2 - 62, cofY = H - 148;
          c.fillStyle = 'rgba(180,220,255,.10)';
          c.strokeStyle = 'rgba(180,220,255,.5)'; c.lineWidth = 2;
          c.fillRect(cofX, cofY, 124, 52);
          c.strokeRect(cofX, cofY, 124, 52);
          // Snow White sleeping inside
          g.rect(cofX + 10, cofY + 14, 104, 26, '#1848c8');
          g.rect(cofX + 8, cofY + 12, 32, 18, '#f8d8d0');
          c.fillStyle = '#100c10';
          c.beginPath(); c.arc(cofX + 23, cofY + 17, 9, Math.PI, 0); c.fill();
          g.rect(cofX + 16, cofY + 7, 14, 4, '#c8102e');
          g.rect(cofX + 17, cofY + 20, 5, 1, '#8a6060');
          g.rect(cofX + 27, cofY + 20, 5, 1, '#8a6060');

          // dwarfs watching (L side)
          for (let d = 0; d < 4; d++) {
            const dx2 = cofX - 28 + d * 8, dy2 = H - 98;
            g.circle(dx2, dy2 - 10, 5, '#f8d8c0');
            g.rect(dx2 - 4, dy2 - 5, 8, 14, d % 2 === 0 ? '#4a3010' : '#c8102e');
          }
          // dwarfs watching (R side)
          for (let d = 0; d < 3; d++) {
            const dx2 = cofX + 130 + d * 9, dy2 = H - 98;
            g.circle(dx2, dy2 - 10, 5, '#f8d8c0');
            g.rect(dx2 - 4, dy2 - 5, 8, 14, d % 2 === 0 ? '#4a3010' : '#e8c010');
          }

          // prince riding
          const px = Math.round(this.princeX);
          g.rect(px + 8, H - 74, 28, 20, '#a07040');
          g.circle(px + 8, H - 64, 10, '#a07040');
          g.rect(px + 16, H - 52, 4, 18, '#a07040');
          g.rect(px + 28, H - 52, 4, 18, '#a07040');
          g.rect(px + 10, H - 96, 12, 24, '#c8102e');
          g.circle(px + 16, H - 98, 8, '#f8d8c0');
          c.fillStyle = '#d4a010'; c.fillRect(px + 9, H - 106, 14, 6);

          // ground
          g.rect(0, H - 52, W, 52, '#0c1004');

          // BIG heart meter
          const hcx = W / 2, hcy = H / 2 - 38;
          const pulse = 1 + this.heartPulse * 0.14;
          c.save(); c.translate(hcx, hcy); c.scale(pulse, pulse);
          // heart outline (dark)
          c.fillStyle = '#3a1028';
          c.beginPath();
          c.moveTo(0, 10); c.bezierCurveTo(-38, -12, -54, 12, -30, 34); c.lineTo(0, 58); c.lineTo(30, 34); c.bezierCurveTo(54, 12, 38, -12, 0, 10); c.closePath(); c.fill();
          // filled portion (clipped)
          const fillH = 58 * (this.love / 100);
          c.save(); c.beginPath(); c.rect(-56, 58 - fillH, 112, fillH); c.clip();
          c.fillStyle = '#e23b4a';
          c.beginPath();
          c.moveTo(0, 10); c.bezierCurveTo(-38, -12, -54, 12, -30, 34); c.lineTo(0, 58); c.lineTo(30, 34); c.bezierCurveTo(54, 12, 38, -12, 0, 10); c.closePath(); c.fill();
          c.restore();
          // shine
          c.globalAlpha = 0.28; c.fillStyle = '#ffaacc';
          c.beginPath(); c.ellipse(-12, -2, 14, 8, -0.5, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          c.restore();

          api.txtCFit(Math.round(this.love) + '%', W / 2, hcy + 68, 14, '#f8e8ff', true);

          // darkness creeps in as love drops
          const darkA = (1 - this.love / 100) * 0.52;
          const dg = c.createRadialGradient(W / 2, H / 2, H * 0.14, W / 2, H / 2, H * 0.6);
          dg.addColorStop(0, 'rgba(0,0,0,0)'); dg.addColorStop(1, 'rgba(0,0,0,' + darkA + ')');
          c.fillStyle = dg; c.fillRect(0, 0, W, H);

          if (this.tapFlash > 0) {
            c.globalAlpha = Math.min(1, this.tapFlash / 0.15);
            api.txtCFit('TAP!', W / 2, hcy + 92, 16, '#ff80a0', true);
            c.globalAlpha = 1;
          } else {
            api.txtCFit('TAP TO FILL THE HEART', W / 2, hcy + 92, 9, '#c080a0');
          }

          api.topBar("TALE 5: TRUE LOVE'S KISS");
          api.txt('TIME: ' + Math.ceil(this.timer) + 's', 6, 20, 8, this.timer < 8 ? '#e23b4a' : '#5dff8f');
          api.vignette();
        },
      },

    ], // end chapters
  }); // end RetroSaga.create
})();
