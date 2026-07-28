/* ============================================================================
 * SNOW WHITE — SEVEN FOR THE MINE
 * Five chapters through Brothers Grimm:
 *   1. THE MAGIC MIRROR  — observe & tap who is fairest (tap/observation)
 *   2. FOREST FLIGHT     — hide from the Huntsman's sweeping lantern (stealth)
 *   3. HI-HO MINE        — foreman 3 shafts: send/pull dwarfs, don't cave in
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

  // Poison-potion ingredients for the Queen's cauldron (TALE 4)
  const POTION_ITEMS = [
    { key: 'nightshade', label: 'NIGHTSHADE',  col: '#9b5cff' },
    { key: 'raven',      label: "RAVEN'S EYE", col: '#7a8aa8' },
    { key: 'hemlock',    label: 'HEMLOCK',     col: '#8ec83a' },
    { key: 'wolfsbane',  label: 'WOLFSBANE',   col: '#e2483a' },
  ];
  // weighted average of {col:'#rrggbb', w:number}[] -> 'rgb(r,g,b)' (null if no weight)
  function blendColors(entries) {
    let tw = 0, r = 0, g = 0, b = 0;
    for (const e of entries) {
      const p = parseInt(e.col.slice(1), 16);
      r += ((p >> 16) & 255) * e.w; g += ((p >> 8) & 255) * e.w; b += (p & 255) * e.w; tw += e.w;
    }
    if (tw <= 0) return null;
    return 'rgb(' + Math.round(r / tw) + ',' + Math.round(g / tw) + ',' + Math.round(b / tw) + ')';
  }

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

  /* ─────────── helper: draw a potion-ingredient glyph ─────────── */
  function potionIcon(api, key, x, y, s) {
    const g = api.gfx, c = api.ctx;
    s = s || 1;
    if (key === 'nightshade') {
      g.circle(x - 4 * s, y + 2 * s, 3.2 * s, '#9b5cff');
      g.circle(x + 3 * s, y + 3 * s, 3.2 * s, '#7a3ad8');
      g.circle(x, y - 3 * s, 3.2 * s, '#b878ff');
      c.strokeStyle = '#2a6a1a'; c.lineWidth = 1.4 * s;
      c.beginPath(); c.moveTo(x, y - 6 * s); c.lineTo(x - 6 * s, y - 10 * s); c.stroke();
      c.beginPath(); c.moveTo(x, y - 6 * s); c.lineTo(x + 6 * s, y - 10 * s); c.stroke();
    } else if (key === 'raven') {
      c.fillStyle = '#1c1c28';
      c.beginPath();
      c.moveTo(x, y - 9 * s); c.quadraticCurveTo(x + 7 * s, y, x, y + 9 * s);
      c.quadraticCurveTo(x - 7 * s, y, x, y - 9 * s);
      c.fill();
      g.circle(x, y, 2.6 * s, '#e8e0d0');
      g.circle(x, y, 1.1 * s, '#0a0a0e');
    } else if (key === 'hemlock') {
      c.strokeStyle = '#3a6a18'; c.lineWidth = 1.6 * s;
      c.beginPath(); c.moveTo(x, y + 9 * s); c.lineTo(x, y - 4 * s); c.stroke();
      for (let i = 0; i < 5; i++) {
        const a = (i / 4 - 0.5) * 1.6;
        g.circle(x + Math.sin(a) * 7 * s, y - 4 * s - Math.cos(a) * 4 * s, 2 * s, '#c8e07a');
      }
    } else { // wolfsbane
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        c.fillStyle = '#e2483a';
        c.beginPath();
        c.ellipse(x + Math.cos(a) * 5 * s, y + Math.sin(a) * 5 * s, 3.4 * s, 2 * s, a, 0, Math.PI * 2);
        c.fill();
      }
      g.circle(x, y, 2.6 * s, '#f8d060');
    }
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
       * TALE 2 · FOREST FLIGHT — hide from the Huntsman's
       * sweeping lantern among three hiding spots (stealth)
       * ═══════════════════════════════════════════════════ */
      {
        id: 'forest', name: 'FOREST FLIGHT', sub: 'HIDE FROM THE HUNTSMAN',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.rect(x - 2, y - 4, 4, 10, '#5a3c10');
          g.rect(x - 6, y - 10, 12, 8, '#3a2608');
          c.fillStyle = '#ffd060';
          c.beginPath(); c.moveTo(x - 3, y - 8); c.lineTo(x + 3, y - 8); c.lineTo(x, y - 2); c.closePath(); c.fill();
        },
        intro: ['THE QUEEN ORDERS', 'THE HUNTSMAN TO', 'KILL SNOW WHITE.', '', 'She flees into the', 'ENCHANTED FOREST and', 'HIDES from his lantern!'],
        quote: '"She ran as fast as her feet would carry her over sharp stones and through thorns." — Grimm',
        help: 'TAP A HIDING SPOT · STAY OUT OF THE LANTERN’S SWEEP · REACH THE COTTAGE!',
        winText:  'SNOW WHITE REACHES THE COTTAGE!',
        loseText: "THE HUNTSMAN'S LANTERN FINDS HER.",
        SPOT_X: [50, 135, 220], SPOT_Y: 300, SPOT_KIND: ['bush', 'tree', 'rock'],
        LANTERN_X: 236, LANTERN_Y: 178,
        init(api) {
          this.spot     = 1;
          this.target   = [];
          this.warnT    = 0;
          this.warnDur  = 1.6;
          this.cycleT   = 1.3;
          this.sweepFlashT = 0;
          this.caughtT  = 0;
          this.moveFlash = 0;
          this.dodges   = 0;
          this.goal     = 9;
          this.lives    = 3;
        },
        startSweep(api) {
          const doubleChance = clamp(0.1 + this.dodges * 0.05, 0, 0.55);
          const isDouble = this.dodges >= 4 && rand(0, 1) < doubleChance;
          const t1 = randInt(0, 2);
          this.target = [t1];
          if (isDouble) {
            let t2 = randInt(0, 2);
            while (t2 === t1) t2 = randInt(0, 2);
            this.target.push(t2);
          }
          this.warnDur = Math.max(0.85, 1.7 - this.dodges * 0.06);
          this.warnT   = this.warnDur;
        },
        resolveSweep(api) {
          const caught = this.target.indexOf(this.spot) !== -1;
          this.sweepFlashT = 0.35;
          if (caught) {
            this.lives--; this.caughtT = 0.5;
            api.shake(7, 0.4); api.flash('#c8102e', 0.4); api.audio.sfx('hurt');
            api.burst(this.SPOT_X[this.spot], this.SPOT_Y, '#ffcf6a', 12);
          } else {
            this.dodges++;
            api.addScore(60);
            api.audio.sfx('coin');
            api.burst(this.SPOT_X[this.spot], this.SPOT_Y, '#5dff8f', 8);
          }
          this.target = [];
          this.cycleT = Math.max(0.5, 1.35 - this.dodges * 0.03) + rand(0, 0.4);
        },
        update(api, dt) {
          if (this.lives <= 0) { api.lose(); return; }
          if (this.dodges >= this.goal) { api.win(); return; }

          this.sweepFlashT = Math.max(0, this.sweepFlashT - dt);
          this.caughtT     = Math.max(0, this.caughtT - dt);
          this.moveFlash   = Math.max(0, this.moveFlash - dt);

          if (this.target.length === 0) {
            this.cycleT -= dt;
            if (this.cycleT <= 0) this.startSweep(api);
          } else {
            this.warnT -= dt;
            if (this.warnT <= 0) this.resolveSweep(api);
          }

          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (let s = 0; s < 3; s++) {
              if (Math.abs(px - this.SPOT_X[s]) < 32 && Math.abs(py - this.SPOT_Y) < 44) {
                if (s !== this.spot) { this.spot = s; this.moveFlash = 0.2; api.audio.sfx('select'); }
                break;
              }
            }
          }
        },
        drawSpot(api, kind, x, y, danger) {
          const g = api.gfx, c = api.ctx;
          if (kind === 'bush') {
            g.circle(x, y + 4, 16, danger ? '#2a1004' : '#0e2a08');
            g.circle(x - 10, y + 8, 12, danger ? '#3a1808' : '#123a0c');
            g.circle(x + 10, y + 8, 12, danger ? '#3a1808' : '#123a0c');
          } else if (kind === 'tree') {
            g.rect(x - 5, y - 2, 10, 26, '#241206');
            c.fillStyle = danger ? '#3a1808' : '#0c2408';
            c.beginPath(); c.arc(x, y - 14, 20, Math.PI, 0); c.fill();
            g.rect(x - 20, y - 14, 40, 12, danger ? '#3a1808' : '#0c2408');
          } else {
            c.fillStyle = danger ? '#4a2410' : '#3a3438';
            c.beginPath();
            c.moveTo(x - 20, y + 16); c.lineTo(x - 16, y - 8); c.lineTo(x, y - 16);
            c.lineTo(x + 16, y - 6); c.lineTo(x + 20, y + 16); c.closePath(); c.fill();
            c.globalAlpha = 0.35; c.fillStyle = danger ? '#e8823a' : '#8a949c';
            c.beginPath(); c.moveTo(x - 4, y - 6); c.lineTo(x + 8, y - 10); c.lineTo(x + 12, y + 10); c.lineTo(x - 2, y + 12); c.closePath(); c.fill();
            c.globalAlpha = 1;
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const bg2 = c.createLinearGradient(0, 0, 0, H);
          bg2.addColorStop(0, '#03060e'); bg2.addColorStop(1, '#0a1808');
          c.fillStyle = bg2; c.fillRect(0, 0, W, H);

          // distant stars
          for (let i = 0; i < 22; i++) {
            const sx = (i * 61 + 9) % W, sy = (i * 31 + 5) % 100;
            c.globalAlpha = 0.25 + 0.35 * Math.sin(api.t * 2 + i);
            g.rect(sx, sy, 1, 1, '#e0e8ff');
            c.globalAlpha = 1;
          }

          // the cottage, warm and waiting, in the clearing beyond the trees
          const cotX = W / 2, cotY = 96;
          g.rect(cotX - 26, cotY, 52, 40, '#1e1004');
          c.fillStyle = '#2a1808';
          c.beginPath(); c.moveTo(cotX - 32, cotY); c.lineTo(cotX, cotY - 22); c.lineTo(cotX + 32, cotY); c.closePath(); c.fill();
          c.globalAlpha = 0.65 + 0.25 * Math.sin(api.t * 2.4);
          g.rect(cotX - 9, cotY + 12, 12, 12, '#ffd060');
          c.globalAlpha = 1;
          g.rect(cotX + 10, cotY + 16, 8, 24, '#1e1004');

          // background treeline
          for (let ti = 0; ti < 7; ti++) {
            const tx = (ti * 41 + 6) % W;
            c.fillStyle = ti % 2 === 0 ? '#061006' : '#081408';
            c.beginPath(); c.moveTo(tx - 16, 168); c.lineTo(tx, 118); c.lineTo(tx + 16, 168); c.closePath(); c.fill();
          }

          // the Huntsman on his post, lantern raised, cloak stirring
          const hx = this.LANTERN_X, hy = this.LANTERN_Y;
          c.fillStyle = '#0a0a10';
          c.beginPath();
          c.moveTo(hx - 12, hy + 46); c.lineTo(hx - 16, hy + 6); c.quadraticCurveTo(hx, hy - 8, hx + 16, hy + 6); c.lineTo(hx + 12, hy + 46);
          c.closePath(); c.fill();
          g.circle(hx, hy - 6, 8, '#caa88a');
          g.rect(hx - 9, hy - 16, 18, 8, '#1a1a24');
          g.rect(hx + 10, hy + 4, 4, 16, '#5a4020');
          const lgr = c.createRadialGradient(hx + 12, hy + 22, 0, hx + 12, hy + 22, 10);
          lgr.addColorStop(0, '#ffd060'); lgr.addColorStop(1, '#5a3808');
          c.fillStyle = lgr;
          c.beginPath(); c.arc(hx + 12, hy + 22, 6, 0, Math.PI * 2); c.fill();

          // lantern beam(s) telegraphing the sweep, brightening as it lands
          for (const ti of this.target) {
            const tx = this.SPOT_X[ti];
            const prog = 1 - clamp(this.warnT / this.warnDur, 0, 1);
            // thin aim line, always visible, brightening as the beam swings in
            c.strokeStyle = 'rgba(255,208,96,' + (0.3 + 0.5 * prog).toFixed(2) + ')';
            c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(hx + 12, hy + 22); c.lineTo(tx, this.SPOT_Y + 6); c.stroke();
            // a narrow cone of light only glows in on final approach (no full-screen wash)
            if (prog > 0.4) {
              const spread = 14 - (prog - 0.4) * 10;
              c.globalAlpha = (prog - 0.4) / 0.6 * 0.4;
              const grad = c.createLinearGradient(hx + 12, hy + 22, tx, this.SPOT_Y);
              grad.addColorStop(0, 'rgba(255,208,96,.7)'); grad.addColorStop(1, 'rgba(255,208,96,0)');
              c.fillStyle = grad;
              c.beginPath();
              c.moveTo(hx + 12, hy + 22);
              c.lineTo(tx - spread, this.SPOT_Y + 20);
              c.lineTo(tx + spread, this.SPOT_Y + 20);
              c.closePath(); c.fill();
              c.globalAlpha = 1;
            }
            // ground warning ring, pulsing faster as it nears landing
            c.strokeStyle = '#ff5a3a';
            c.lineWidth = 2;
            c.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(api.t * (6 + prog * 14)));
            c.beginPath(); c.arc(tx, this.SPOT_Y + 6, 26 + prog * 4, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }
          if (this.sweepFlashT > 0) {
            c.globalAlpha = Math.min(1, this.sweepFlashT / 0.35) * 0.55;
            c.fillStyle = '#ffd060'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          // three hiding spots, with Snow White peeking from the current one
          for (let s = 0; s < 3; s++) {
            const danger = this.target.indexOf(s) !== -1;
            this.drawSpot(api, this.SPOT_KIND[s], this.SPOT_X[s], this.SPOT_Y, danger);
            if (s === this.spot) {
              drawSW(api, this.SPOT_X[s], this.SPOT_Y + 6, this.caughtT, api.t);
            }
          }

          // forest floor
          g.rect(0, H - 44, W, 44, '#0a1206');
          for (let gx = 0; gx < W; gx += 18) g.rect(gx, H - 44, 14, 2, '#0e1808');

          // steps-to-cottage progress trail
          const trailW = 200;
          g.rect(35, H - 20, trailW, 4, '#1a2810');
          g.rect(35, H - 20, Math.round(trailW * this.dodges / this.goal), 4, '#5dff8f');

          api.topBar('TALE 2: FOREST FLIGHT');
          api.txt('STEPS TO COTTAGE: ' + this.dodges + '/' + this.goal, 6, 20, 8, '#5dff8f');
          for (let lf = 0; lf < this.lives; lf++) g.circle(W - 14 - lf * 16, 24, 5, '#e23b4a');
          if (this.moveFlash > 0) { c.globalAlpha = this.moveFlash / 0.2 * 0.5; g.circle(this.SPOT_X[this.spot], this.SPOT_Y, 30, '#5dff8f'); c.globalAlpha = 1; }
          if (api.t < 3.5) { c.globalAlpha = 0.6; api.txtC('TAP A SPOT TO DUCK AWAY FROM THE LANTERN', W / 2, H - 6, 7, '#e8d0ff'); c.globalAlpha = 1; }
          api.vignette();
        },
      },

      /* ═══════════════════════════════════════════════════
       * TALE 3 · HI-HO MINE — foreman 3 shafts, pull the
       * dwarfs before a vein caves in (resource management)
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
        intro: ['DEEP IN THE MOUNTAIN,', 'THREE WEARY DWARFS', 'NEED A FOREMAN.', '', 'Send them into the shafts —', 'but PULL them out before', 'a vein CAVES IN!'],
        quote: '"Hi-ho, hi-ho, it\'s off to work we go!" — traditional dwarf song',
        help: 'TAP A SHAFT TO SEND A DWARF IN · TAP AGAIN TO PULL HIM OUT · WATCH THE CRACKS!',
        winText:  'HI-HO! A RICH HAUL!',
        loseText: 'THE MOUNTAIN WON.',
        init(api) {
          this.SHAFT_X   = [api.W * 0.2, api.W * 0.5, api.W * 0.8];
          this.SHAFT_TOP = 64;
          this.SHAFT_H   = 130;
          this.SHAFT_W   = 62;
          this.shafts    = [0, 1, 2].map(function() { return { richness: 100, instability: 0, collapseFlash: 0 }; });
          this.dwarfs    = [0, 1, 2].map(function() { return { hurtT: 0 }; });
          this.shaftDwarf= [-1, -1, -1];
          this.gems      = 0;
          this.goal      = 140;
          this.timer     = 50;
          this.lives     = 3;
        },
        tapShaft(api, s) {
          const sh = this.shafts[s];
          if (this.shaftDwarf[s] !== -1) {
            this.shaftDwarf[s] = -1;
            api.audio.sfx('select');
          } else if (sh.richness > 0) {
            const idle = this.dwarfs.findIndex((d, i) => d.hurtT <= 0 && this.shaftDwarf.indexOf(i) === -1);
            if (idle !== -1) { this.shaftDwarf[s] = idle; api.audio.sfx('select'); }
            else { api.flash('#e8c010', 0.15); }
          }
        },
        update(api, dt) {
          if (this.lives <= 0) { api.lose(); return; }
          if (this.gems >= this.goal) { api.win(); return; }
          this.timer -= dt;
          if (this.timer <= 0) { api.lose(); return; }

          for (const dw of this.dwarfs) if (dw.hurtT > 0) dw.hurtT = Math.max(0, dw.hurtT - dt);

          for (let s = 0; s < this.shafts.length; s++) {
            const sh = this.shafts[s];
            sh.collapseFlash = Math.max(0, sh.collapseFlash - dt);
            const worked = this.shaftDwarf[s] !== -1;
            if (worked && sh.richness > 0) {
              this.gems += 3.2 * dt;
              sh.richness = Math.max(0, sh.richness - 4 * dt);
              const instabRate = 10 + (100 - sh.richness) * 0.15;
              sh.instability = Math.min(100, sh.instability + instabRate * dt);
              if (sh.instability >= 100) {
                const dwi = this.shaftDwarf[s];
                this.dwarfs[dwi].hurtT = 3.2;
                this.shaftDwarf[s] = -1;
                sh.instability = 0;
                sh.richness = Math.max(0, sh.richness - 15);
                sh.collapseFlash = 0.6;
                this.lives--;
                api.shake(8, 0.45); api.flash('#c8102e', 0.4); api.audio.sfx('explode');
                api.burst(this.SHAFT_X[s], this.SHAFT_TOP + 40, '#8a6010', 14);
              } else if (sh.richness <= 0) {
                this.shaftDwarf[s] = -1;
              }
            } else {
              sh.instability = Math.max(0, sh.instability - 26 * dt);
            }
          }

          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (let s = 0; s < this.shafts.length; s++) {
              if (Math.abs(px - this.SHAFT_X[s]) < this.SHAFT_W / 2 + 6 &&
                  py > this.SHAFT_TOP - 10 && py < this.SHAFT_TOP + this.SHAFT_H + 10) {
                this.tapShaft(api, s);
                break;
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

          const SX = this.SHAFT_X, ST = this.SHAFT_TOP, SH = this.SHAFT_H, SW = this.SHAFT_W;
          for (let s = 0; s < 3; s++) {
            const sh = this.shafts[s], x = SX[s];

            // tunnel mouth (dark arch in the rock)
            c.fillStyle = '#100a04';
            c.beginPath();
            c.moveTo(x - SW / 2, ST + SH);
            c.lineTo(x - SW / 2, ST + 14);
            c.quadraticCurveTo(x - SW / 2, ST, x, ST);
            c.quadraticCurveTo(x + SW / 2, ST, x + SW / 2, ST + 14);
            c.lineTo(x + SW / 2, ST + SH);
            c.closePath(); c.fill();
            c.strokeStyle = '#5a3a14'; c.lineWidth = 4; c.stroke();

            // remaining vein, glowing up from the tunnel floor
            const veinH = (sh.richness / 100) * (SH - 20);
            if (veinH > 0) {
              c.save();
              c.beginPath(); c.rect(x - SW / 2 + 6, ST + SH - veinH - 6, SW - 12, veinH); c.clip();
              c.globalAlpha = 0.55 + 0.15 * Math.sin(api.t * 3 + s);
              c.fillStyle = GEM_COLS[s % GEM_COLS.length];
              c.fillRect(x - SW / 2, ST, SW, SH);
              c.globalAlpha = 1;
              c.restore();
            }

            // instability cracks
            if (sh.instability > 15) {
              const jitter = sh.instability > 70 ? Math.sin(api.t * 30 + s) * 1.5 : 0;
              c.strokeStyle = 'rgba(255,60,60,' + Math.min(0.9, sh.instability / 110) + ')';
              c.lineWidth = 1.5;
              c.beginPath();
              c.moveTo(x - SW / 2 + 10 + jitter, ST + 30);
              c.lineTo(x + jitter, ST + 60);
              c.lineTo(x - SW / 2 + 18 + jitter, ST + 95);
              c.stroke();
            }
            if (sh.collapseFlash > 0) {
              c.globalAlpha = Math.min(1, sh.collapseFlash / 0.6) * 0.6;
              c.fillStyle = '#c8102e'; c.fillRect(x - SW / 2, ST, SW, SH);
              c.globalAlpha = 1;
            }

            // dwarf at work
            const dwi = this.shaftDwarf[s];
            if (dwi !== -1) {
              const by = ST + SH - 24 + Math.sin(api.t * 6 + s) * 2;
              g.circle(x, by - 10, 7, '#f8d8c0');
              g.rect(x - 7, by - 3, 14, 16, s % 2 === 0 ? '#4a3010' : '#c8102e');
              g.rect(x - 9, by - 16, 18, 5, '#8a6010');
            }

            // instability meter
            g.rect(x - SW / 2, ST + SH + 10, SW, 5, '#2a1808');
            g.rect(x - SW / 2, ST + SH + 10, Math.round(SW * sh.instability / 100), 5,
              sh.instability > 70 ? '#e23b4a' : sh.instability > 35 ? '#ff8a3d' : '#5dff8f');
            api.txtCFit(sh.richness > 0 ? Math.round(sh.richness) + '%' : 'TAPPED', x, ST - 12, 7,
              sh.richness > 0 ? '#e8d0b0' : '#806050');
          }

          // camp — idle & resting dwarfs
          const campY = ST + SH + 60;
          g.rect(0, campY, W, H - campY, '#0c1004');
          api.txt('CAMP', 8, campY + 4, 7, '#8a6010');
          let slot = 0;
          for (let i = 0; i < this.dwarfs.length; i++) {
            if (this.shaftDwarf.indexOf(i) !== -1) continue;
            const dw = this.dwarfs[i];
            const cx3 = 40 + slot * 90, cy3 = campY + 34;
            slot++;
            if (dw.hurtT > 0) {
              g.rect(cx3 - 10, cy3 + 4, 20, 8, '#4a3010');
              g.circle(cx3 - 12, cy3 + 4, 6, '#f8d8c0');
              api.txtCFit('RESTING', cx3, cy3 + 22, 6, '#e23b4a');
            } else {
              g.circle(cx3, cy3 - 8, 7, '#f8d8c0');
              g.rect(cx3 - 7, cy3, 14, 16, i % 2 === 0 ? '#4a3010' : '#c8102e');
              api.txtCFit('READY', cx3, cy3 + 22, 6, '#5dff8f');
            }
          }

          api.topBar('TALE 3: HI-HO MINE');
          api.txt('GEMS: ' + Math.floor(this.gems) + '/' + this.goal, 6, 20, 8, '#5dff8f');
          api.txt('TIME: ' + Math.ceil(this.timer) + 's', 6, 32, 8, this.timer < 10 ? '#e23b4a' : '#c8a0e8');
          for (let lf = 0; lf < this.lives; lf++) g.circle(W - 14 - lf * 16, 24, 5, '#e23b4a');
          if (api.t < 3.5) { c.globalAlpha = 0.6; api.txtC('TAP A SHAFT TO SEND / PULL A DWARF', W / 2, H - 8, 7, '#e8d0b0'); c.globalAlpha = 1; }
          api.vignette();
        },
      },

      /* ═══════════════════════════════════════════════════
       * TALE 4 · THE POISONED APPLE — brew the Queen's poison
       * ═══════════════════════════════════════════════════ */
      {
        id: 'apple', name: 'THE POISONED APPLE', sub: 'BEWARE THE HAG',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 6, '#c8102e');
          g.rect(x - 1, y - 7, 2, 5, '#3a2006');
          g.circle(x + 4, y + 2, 3, '#f8f0f0');
        },
        intro: ['IN HER TOWER,', 'THE QUEEN BREWS', 'A POISON FOR THE APPLE.', '', 'Tap the jars to add the', 'EXACT recipe to the pot —', 'too much SPOILS THE BREW!'],
        quote: '"She took an apple, and painted it herself: white with a red cheek." — Grimm',
        help: 'TAP THE JARS ABOVE THE POT · MATCH EACH RECIPE EXACTLY · 3 BREWS TO FINISH',
        winText:  'THE APPLE GLEAMS, DEADLY RED.',
        loseText: 'THE BREW CURDLES TO ASH.',
        JAR_X: [38, 106, 174, 242], JAR_Y: 350, JAR_W: 56, JAR_H: 82,
        init(api) {
          this.goal   = 3;
          this.brewed = 0;
          this.lives  = 3;
          this.timer  = 50;
          this.round  = 0;
          this.mistakeT = 0;
          this.brewT    = 0;
          this.stirT    = 0;
          this.have   = [0, 0, 0, 0];
          this.target = [0, 0, 0, 0];
          this.active = [];
          this.newRecipe(api);
        },
        newRecipe(api) {
          const count = Math.min(2 + this.round, POTION_ITEMS.length);
          const idxs = [];
          while (idxs.length < count) {
            const r = randInt(0, POTION_ITEMS.length - 1);
            if (idxs.indexOf(r) === -1) idxs.push(r);
          }
          idxs.sort();
          this.active = idxs;
          this.have   = [0, 0, 0, 0];
          this.target = [0, 0, 0, 0];
          for (const i of idxs) this.target[i] = randInt(1, 2);
          this.round++;
        },
        mistake(api) {
          this.lives--;
          this.mistakeT = 0.5;
          this.have = [0, 0, 0, 0];
          api.shake(7, 0.4); api.flash('#c8102e', 0.35); api.audio.sfx('hurt');
        },
        brew(api) {
          this.brewed++;
          this.brewT = 0.7;
          api.addScore(120);
          api.flash('#5dff8f', 0.25); api.audio.sfx('coin');
          api.burst(api.W / 2, 210, '#5dff8f', 18);
          if (this.brewed >= this.goal) { api.win(); return; }
          this.newRecipe(api);
        },
        tapJar(api, i) {
          if (this.active.indexOf(i) === -1 || this.have[i] >= this.target[i]) { this.mistake(api); return; }
          this.have[i]++;
          api.audio.sfx('select');
          api.burst(this.JAR_X[i], this.JAR_Y, POTION_ITEMS[i].col, 6);
          if (this.active.every((idx) => this.have[idx] === this.target[idx])) this.brew(api);
        },
        update(api, dt) {
          if (this.lives <= 0) { api.lose(); return; }
          this.timer -= dt;
          if (this.timer <= 0) { api.lose(); return; }
          this.mistakeT = Math.max(0, this.mistakeT - dt);
          this.brewT    = Math.max(0, this.brewT - dt);
          this.stirT   += dt;

          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (let i = 0; i < 4; i++) {
              if (Math.abs(px - this.JAR_X[i]) < this.JAR_W / 2 &&
                  py > this.JAR_Y - this.JAR_H / 2 && py < this.JAR_Y + this.JAR_H / 2) {
                this.tapJar(api, i);
                break;
              }
            }
          }
        },
        drawCauldron(api, cx, cy) {
          const g = api.gfx, c = api.ctx;
          const mixIn = this.active.map((i) => ({ col: POTION_ITEMS[i].col, w: this.have[i] || 0.001 }));
          const brewCol = blendColors([{ col: '#2a0e3a', w: 1.6 }].concat(mixIn)) || '#2a0e3a';

          c.fillStyle = '#0e0a10';
          c.beginPath();
          c.moveTo(cx - 58, cy - 10); c.lineTo(cx - 46, cy + 46); c.lineTo(cx + 46, cy + 46); c.lineTo(cx + 58, cy - 10);
          c.closePath(); c.fill();
          c.strokeStyle = '#3a2848'; c.lineWidth = 3; c.stroke();
          g.rect(cx - 48, cy + 44, 8, 14, '#0e0a10');
          g.rect(cx + 40, cy + 44, 8, 14, '#0e0a10');

          c.fillStyle = '#241830';
          c.beginPath(); c.ellipse(cx, cy - 10, 60, 14, 0, 0, Math.PI * 2); c.fill();

          c.save();
          c.beginPath(); c.ellipse(cx, cy - 10, 52, 10, 0, 0, Math.PI * 2); c.clip();
          c.fillStyle = brewCol; c.fillRect(cx - 60, cy - 26, 120, 32);
          for (let i = 0; i < 6; i++) {
            const bx = cx + Math.sin(this.stirT * 1.7 + i * 1.3) * 40;
            const by = cy - 10 + Math.cos(this.stirT * 2.1 + i) * 6;
            c.globalAlpha = 0.45 + 0.3 * Math.sin(this.stirT * 4 + i);
            g.circle(bx, by, 3 + (i % 3), '#ffffff');
            c.globalAlpha = 1;
          }
          c.restore();
          c.strokeStyle = '#4a3860'; c.lineWidth = 2;
          c.beginPath(); c.ellipse(cx, cy - 10, 52, 10, 0, 0, Math.PI * 2); c.stroke();

          for (let i = 0; i < 3; i++) {
            const sx = cx - 20 + i * 20, sy = cy - 16 - ((this.stirT * 20 + i * 14) % 60);
            c.globalAlpha = Math.max(0, 0.3 - ((this.stirT * 20 + i * 14) % 60) / 200);
            g.circle(sx, sy, 4, '#e8d0f8');
            c.globalAlpha = 1;
          }
          if (this.brewT > 0) {
            c.globalAlpha = Math.min(1, this.brewT / 0.7) * 0.7;
            g.circle(cx, cy - 10, 60, '#5dff8f');
            c.globalAlpha = 1;
          }
        },
        drawJar(api, i) {
          const g = api.gfx, c = api.ctx;
          const x = this.JAR_X[i], y = this.JAR_Y, w = this.JAR_W, h = this.JAR_H;
          const isActive = this.active.indexOf(i) !== -1;
          const item = POTION_ITEMS[i];
          const fillLvl = isActive && this.target[i] > 0 ? this.have[i] / this.target[i] : 0;

          c.globalAlpha = isActive ? 1 : 0.35;
          const bodyPath = function() {
            c.beginPath();
            c.moveTo(x - w / 2 + 6, y - h / 2 + 10); c.lineTo(x - w / 2, y + h / 2 - 8);
            c.quadraticCurveTo(x - w / 2, y + h / 2, x - w / 2 + 8, y + h / 2);
            c.lineTo(x + w / 2 - 8, y + h / 2);
            c.quadraticCurveTo(x + w / 2, y + h / 2, x + w / 2, y + h / 2 - 8);
            c.lineTo(x + w / 2 - 6, y - h / 2 + 10); c.closePath();
          };
          c.fillStyle = 'rgba(30,20,40,.55)';
          bodyPath(); c.fill();
          c.strokeStyle = isActive ? item.col : '#4a3a58'; c.lineWidth = 1.4; c.stroke();
          g.rect(x - w / 2 + 8, y - h / 2, w - 16, 8, '#5a3a20');

          if (fillLvl > 0) {
            const fh = (h - 22) * Math.min(1, fillLvl);
            c.save();
            bodyPath(); c.clip();
            c.globalAlpha *= 0.6; c.fillStyle = item.col;
            c.fillRect(x - w / 2, y + h / 2 - fh, w, fh);
            c.restore();
          }
          potionIcon(api, item.key, x, y - h / 2 + 22, 1.1);
          api.txtCFit(item.label, x, y + h / 2 + 4, 6, isActive ? item.col : '#5a4a58', false, w + 8);
          c.globalAlpha = 1;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const bg4 = c.createLinearGradient(0, 0, 0, H);
          bg4.addColorStop(0, '#100612'); bg4.addColorStop(1, '#1c0a1a');
          c.fillStyle = bg4; c.fillRect(0, 0, W, H);

          c.globalAlpha = 0.5;
          g.circle(W - 40, 46, 20, '#2a1a3a');
          c.globalAlpha = 1;

          const rn = this.active.length;
          for (let k = 0; k < rn; k++) {
            const i = this.active[k];
            const rx = (W / (rn + 1)) * (k + 1), ry = 58;
            const met = this.have[i] >= this.target[i];
            g.rectO(rx - 22, ry - 20, 44, 40, met ? POTION_ITEMS[i].col : '#5a4a68', 1);
            potionIcon(api, POTION_ITEMS[i].key, rx, ry - 6, 1);
            api.txtCFit(this.have[i] + '/' + this.target[i], rx, ry + 10, 7, met ? '#5dff8f' : '#e8d0f8');
          }

          const cx = W / 2, cy = 220;
          this.drawCauldron(api, cx, cy);

          const stir = Math.sin(this.stirT * 2.4) * 6;
          c.fillStyle = '#140616';
          c.beginPath();
          c.moveTo(cx - 16, cy - 78); c.lineTo(cx + 16, cy - 78); c.lineTo(cx + 22, cy - 40); c.lineTo(cx - 22, cy - 40);
          c.closePath(); c.fill();
          g.circle(cx + 6, cy - 92, 10, '#c8a880');
          c.fillStyle = '#140616';
          c.beginPath(); c.moveTo(cx - 8, cy - 96); c.lineTo(cx + 20, cy - 96); c.lineTo(cx + 10, cy - 116); c.closePath(); c.fill();
          c.strokeStyle = '#2a1420'; c.lineWidth = 4;
          c.beginPath(); c.moveTo(cx + 14, cy - 80); c.lineTo(cx + 30 + stir, cy - 44); c.stroke();

          for (let i = 0; i < 4; i++) this.drawJar(api, i);

          api.topBar('TALE 4: POISONED APPLE');
          api.txt('BREWED: ' + this.brewed + '/' + this.goal, 6, 20, 8, '#5dff8f');
          api.txt('TIME: ' + Math.ceil(this.timer) + 's', 6, 32, 8, this.timer < 10 ? '#e23b4a' : '#c8a0e8');
          for (let lf = 0; lf < this.lives; lf++) g.circle(W - 14 - lf * 16, 24, 5, '#e23b4a');
          if (this.mistakeT > 0) { c.globalAlpha = Math.min(1, this.mistakeT / 0.5) * 0.4; c.fillStyle = '#c8102e'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
          if (api.t < 3) { c.globalAlpha = 0.6; api.txtC('TAP THE JARS TO MATCH THE RECIPE', W / 2, H - 8, 7, '#e8d0f8'); c.globalAlpha = 1; }
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
            // flat, modest gain vs the 12/s decay → a sustained ~15s finale
            // (the old front-loaded +8+(100-love)*.04 let a masher hit 100 in ~1.6s)
            this.love = Math.min(100, this.love + 4);
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
