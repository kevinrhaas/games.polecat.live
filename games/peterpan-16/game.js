/* ============================================================================
 * PETER PAN — THE CONSTELLATION CHART   (Gen 2 / 16-bit)
 * J. M. Barrie's novel on RetroSaga2: HUB is a night-sky star chart — five
 * constellations (the nursery window, London's rooftops, the Mermaid Lagoon,
 * the Jolly Roger, the final duel) linked by a dashed silver flight path —
 * "second star to the right, and straight on till morning" made literal. A
 * choice on the Jolly Roger (crow in triumph, or slip away quiet) sets Peter's
 * temperament for the final duel and how the tale ends.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    night: '#0a0a2e', nightDeep: '#050516', indigo: '#1a1450', indigoLight: '#2a2470',
    silver: '#e8f0ff', silverDim: '#c8d8ff',
    gold: '#ffe066', goldBright: '#fff4b8', goldDark: '#8a6a10',
    crimson: '#c81436', crimsonDark: '#5a0818',
    teal: '#2ec4b6', tealDark: '#124a44', tealBright: '#7fe8dc',
    wood: '#5a3a20', woodDark: '#2a1c10',
    croc: '#3a8a3a',
    cream: '#eef0ff', dim: '#7a7aa8', danger: '#ff4a5a',
    ink: '#050516',
  };
  // Press Start 2P — the classic arcade pixel face, used here as an actual
  // titleFont for the first time in the fleet (every other Gen-4 game so far
  // only ever used it as a font-stack fallback). Known-legible, fresh pick.
  const TITLE = "'Press Start 2P',monospace";
  const UI = "'Pixelify Sans','Press Start 2P',monospace";

  const shuffled = (arr, api) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = api.rint(0, i); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };

  const PETER_ROWS = [
    '..rpp...',
    '.pffffp.',
    '.pffffp.',
    '..ffff..',
    '.gggggg.',
    '.gggggg.',
    'ggggggg.',
    '.gggggg.',
    '..b..b..',
    '..b..b..',
  ];
  const PETER_PAL = { p: '#2a8a54', r: C.crimson, f: '#f0c090', g: '#3aa864', b: '#5a3a20' };
  const HOOK_ROWS = [
    '..hhhh..',
    '.hbbbbh.',
    '.hbbbbh.',
    '..ffff..',
    '.cccccc.',
    '.cccccc.',
    'cccccccc',
    '.cccccc.',
    '..k..k..',
    '..k..k..',
  ];
  const HOOK_PAL = { h: '#141018', b: '#3a2a1a', f: '#e0b090', c: C.crimson, k: '#141018' };

  /* ─── a five-pointed wishing star with orbiting pixie dust ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(cx, cy, 26, C.gold, 0.3);
    g2.roundRect(cx - 20, cy - 20, 40, 40, 4, 'rgba(6,6,26,.85)', C.gold, 2);
    c.fillStyle = C.silver;
    c.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
      const a2 = a + Math.PI / 5;
      const ox = cx + Math.cos(a) * 12, oy = cy + Math.sin(a) * 12;
      const ix = cx + Math.cos(a2) * 5, iy = cy + Math.sin(a2) * 5;
      if (i === 0) c.moveTo(ox, oy); else c.lineTo(ox, oy);
      c.lineTo(ix, iy);
    }
    c.closePath(); c.fill();
    const spA = api.t ? api.t : cy;
    for (let i = 0; i < 3; i++) { const a = spA * 1.6 + i * 2.1; g2.glow(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20, 3, C.gold, 0.7); }
  }

  /* ─── night-sky backdrop (boot/intro/result/finale/choice) ─── */
  function nightSky(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, C.nightDeep], [0.5, C.night], [1, C.indigo]], H);
    g2.stars(t, 46, H, 'rgba(232,240,255,.55)');
    g2.glow(W * 0.78, H * 0.16, 60, C.gold, 0.09);
    g2.embers(t, 8, { color: C.gold, speed: 0.05, size: 2, alpha: 0.55, yTop: 0, yBottom: H * 0.5 });
    if (dim) { c.fillStyle = 'rgba(4,4,20,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }

  /* ─── hub backdrop: the constellation chart, a dashed flight path linking
   * five star-clusters ─── */
  const NODE_XY = { nursery: [64, 120], flight: [200, 104], lagoon: [224, 246], ship: [182, 366], duel: [68, 378] };
  const ORDER = ['nursery', 'flight', 'lagoon', 'ship', 'duel'];
  const DIMS = { nursery: [60, 52], flight: [58, 50], lagoon: [62, 54], ship: [66, 54], duel: [70, 58] };

  function starChart(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.verticalGradient(0, 0, W, H, [[0, '#0d0d38'], [0.55, '#0a0a2e'], [1, '#05051a']]);
    g2.stars(t, 64, H, 'rgba(232,240,255,.55)');
    c.strokeStyle = C.silver; c.lineWidth = 1.4; c.setLineDash([3, 4]); c.globalAlpha = 0.5;
    c.beginPath();
    ORDER.forEach((id, i) => { const p = NODE_XY[id]; if (i === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); });
    c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
    for (let s = 0; s < ORDER.length - 1; s++) {
      const a = NODE_XY[ORDER[s]], b = NODE_XY[ORDER[s + 1]];
      const ph = ((t * 0.12) + s / (ORDER.length - 1)) % 1;
      g2.glow(a[0] + (b[0] - a[0]) * ph, a[1] + (b[1] - a[1]) * ph, 5, C.gold, 0.55);
    }
    g2.glow(24, H - 30, 34, C.gold, 0.12);
  }

  function scenery(api, scene, t) {
    if (scene === 'hub') { starChart(api, t); return; }
    nightSky(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale' || scene === 'choice') ? 0.26 : 0);
  }

  /* ─── constellation line-figure helper: connect-the-dots over segments ─── */
  function constline(api, cx, cy, segs, s, col) {
    const c = api.ctx;
    c.strokeStyle = col; c.lineWidth = 1.1; c.globalAlpha = 0.75;
    segs.forEach((seg) => { c.beginPath(); c.moveTo(cx + seg[0][0] * s, cy + seg[0][1] * s); c.lineTo(cx + seg[1][0] * s, cy + seg[1][1] * s); c.stroke(); });
    c.globalAlpha = 1;
    c.fillStyle = col;
    const seen = {};
    segs.forEach((seg) => { seg.forEach((p) => { const k = p[0] + ',' + p[1]; if (!seen[k]) { seen[k] = 1; c.beginPath(); c.arc(cx + p[0] * s, cy + p[1] * s, 1.7, 0, 7); c.fill(); } }); });
  }

  /* ─── tiny vignettes painted inside each constellation patch ─── */
  const ART = {
    nursery(api, cx, cy, w, h, t) {
      const c = api.ctx, s = Math.min(w, h) * 0.32;
      c.fillStyle = '#0c0c34'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      constline(api, cx, cy, [
        [[0, -1.6], [0, -0.7]], [[0, -0.7], [-0.55, 0.05]], [[0, -0.7], [0.55, -0.1]],
        [[0, -0.7], [0, 0.75]], [[0, 0.75], [-0.5, 1.5]], [[0, 0.75], [0.5, 1.5]],
      ], s, C.silver);
      c.fillStyle = C.gold; c.beginPath(); c.arc(cx, cy - 1.6 * s, 2.2, 0, 7); c.fill();
      if (Math.sin(t * 3) > 0.5) { c.fillStyle = C.goldBright; c.fillRect(cx - 1, cy - 0.7 * s - 1, 2, 2); }
    },
    flight(api, cx, cy, w, h, t) {
      const c = api.ctx, s = Math.min(w, h) * 0.3;
      c.fillStyle = '#0a0a2e'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.fillStyle = '#141040';
      for (let i = 0; i < 4; i++) { const rx = cx - w / 2 + i * (w / 4), rh = h * 0.16 + (i % 2) * h * 0.08; c.fillRect(rx, cy + h / 2 - rh, w / 4 - 2, rh); }
      constline(api, cx, cy - h * 0.12, [[[-1, 0], [0.55, 0]], [[0.55, 0], [0.15, -0.4]], [[0.55, 0], [0.15, 0.4]]], s, C.gold);
    },
    lagoon(api, cx, cy, w, h, t) {
      const c = api.ctx, s = Math.min(w, h) * 0.28;
      c.fillStyle = '#0a1c34'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.fillStyle = 'rgba(232,240,255,.5)'; c.beginPath(); c.arc(cx + w * 0.28, cy - h * 0.28, 6, 0, 7); c.fill();
      c.strokeStyle = C.teal; c.lineWidth = 1; c.globalAlpha = 0.6;
      c.beginPath();
      for (let x = -w / 2; x <= w / 2; x += 4) { const yy = cy + h * 0.14 + Math.sin(t * 1.2 + x * 0.2) * 2; if (x === -w / 2) c.moveTo(cx + x, yy); else c.lineTo(cx + x, yy); }
      c.stroke(); c.globalAlpha = 1;
      constline(api, cx, cy + h * 0.18, [[[-0.8, 0], [0.35, -0.5]], [[-0.8, 0], [0.35, 0.5]], [[0.35, -0.5], [0.85, 0]], [[0.35, 0.5], [0.85, 0]]], s, C.silver);
    },
    ship(api, cx, cy, w, h, t) {
      const c = api.ctx, s = Math.min(w, h) * 0.22;
      c.fillStyle = '#0a0a24'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.fillStyle = C.woodDark;
      c.beginPath(); c.moveTo(cx - w * 0.4, cy + h * 0.36); c.lineTo(cx + w * 0.4, cy + h * 0.36); c.lineTo(cx + w * 0.3, cy + h * 0.5); c.lineTo(cx - w * 0.3, cy + h * 0.5); c.closePath(); c.fill();
      c.strokeStyle = C.woodDark; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy + h * 0.36); c.lineTo(cx, cy - h * 0.3); c.stroke();
      constline(api, cx, cy - h * 0.06, [[[-0.7, -0.7], [0.7, 0.7]], [[-0.7, 0.7], [0.7, -0.7]]], s, C.crimson);
      c.strokeStyle = 'rgba(232,240,255,.5)'; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy - h * 0.06 - s * 1.1, s * 0.55, 0, 7); c.stroke();
    },
    duel(api, cx, cy, w, h, t) {
      const c = api.ctx, s = Math.min(w, h) * 0.3;
      c.fillStyle = '#100a2e'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      constline(api, cx, cy, [[[-0.8, 0.8], [0.8, -0.8]], [[-0.8, -0.8], [0.8, 0.8]]], s, C.silver);
      const tickOn = Math.floor(t * 1.4) % 2 === 0;
      c.fillStyle = tickOn ? C.gold : C.dim; c.beginPath(); c.arc(cx, cy + h * 0.32, 3, 0, 7); c.fill();
    },
  };

  const HUB_LABEL = { nursery: 'THE NURSERY', flight: 'NEVERLAND SKY', lagoon: 'MERMAID LAGOON', ship: 'THE JOLLY ROGER', duel: 'THE DUEL' };

  const menu = {
    title(api, save, t) {
      const g2 = api.g2, W = api.W;
      g2.ornateFrame(14, 6, W - 28, 32, 8, 'rgba(6,6,26,.88)', C.gold);
      const ti = 'PETER PAN';
      g2.gleamText(ti, W / 2, 12, api.fitSize(ti, 12, W - 48, 'title'), C.gold, t, { shadow: 'rgba(0,0,0,.6)', gleamSpeed: 55, font: TITLE });
      api.txtCFit('STARDUST  ' + (save.cur || 0), W / 2, 28, 8, C.cream);
    },
    layout() {
      return ORDER.map((id) => { const p = NODE_XY[id], d = DIMS[id]; return { x: p[0] - d[0] / 2, y: p[1] - d[1] / 2, w: d[0], h: d[1] }; });
    },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, locked, t, i } = info;
      const cx = x + w / 2, cy = y + h / 2;
      if (i === 0) menu._labelQueue = [];
      if (sel && !locked) g2.glow(cx, cy, Math.max(w, h) * 0.75, C.gold, 0.28 + 0.1 * Math.sin(t * 4));
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      if (!locked && ART[node.id]) ART[node.id](api, cx, cy, w, h, t); else { c.fillStyle = '#0a0a12'; c.fillRect(x, y, w, h); }
      c.restore();
      g2.roundRect(x - 3, y - 3, w + 6, h + 6, 5, null, C.nightDeep, 3);
      g2.roundRect(x, y, w, h, 3, null, locked ? '#3a3a3a' : (done ? C.gold : C.silverDim), sel ? 2.4 : 1.6);
      if (locked) { c.fillStyle = 'rgba(6,6,10,.6)'; c.fillRect(x, y, w, h); api.txtC('🔒', cx, cy - 6, 11, '#8a8a8a'); }
      if (done) { g2.roundRect(x + w - 15, y - 2, 13, 11, 3, C.nightDeep, C.gold, 1); api.txtC('✓', x + w - 9, y - 1, 8, C.gold); }
      menu._labelQueue.push({ id: node.id, name: node.name, cx, ly: y + h + 4, w, locked, done });
      if (i === ORDER.length - 1) {
        for (const L of menu._labelQueue) {
          const maxW = Math.min(L.w + 18, 2 * Math.min(L.cx - 3, api.W - 3 - L.cx));
          g2.roundRect(L.cx - maxW / 2 - 2, L.ly - 2, maxW + 4, 13, 4, '#0a0a12', L.locked ? '#3a3a3a' : C.nightDeep, 1);
          api.txtCFit(HUB_LABEL[L.id] || L.name, L.cx, L.ly, 6.5, L.locked ? '#7a7a7a' : (L.done ? C.gold : C.cream), false, maxW);
        }
      }
    },
  };

  /* ─── animated title screen ─── */
  function renderBoot(api, info) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    nightSky(api, t, 0);
    emblem(api, W / 2, H * 0.24);
    const title = 'PETER PAN';
    const ts = api.fitSize(title, 20, W - 20, 'title');
    g2.gleamText(title, W / 2, H * 0.40, ts, C.gold, t, { shadow: 'rgba(0,0,0,.5)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('SECOND STAR TO THE RIGHT', W / 2, H * 0.40 + ts + 12, 10, C.silver, true);
    if (info.blink) api.txtCFit('▸ TAP FOR NEVERLAND ◂', W / 2, H * 0.66, 11, C.cream);
    api.txtCFit('AFTER J. M. BARRIE, 1911', W / 2, H - 28, 8, C.dim);
    api.vignette(); api.scanlines();
  }

  /* ============================ mini-game phases ============================ */

  /* --- THE NURSERY: THE SHADOW SEWN BACK ON (trace-path precision) --- */
  function shadowStitch() {
    return {
      name: 'THE SHADOW SEWN BACK ON', boss: false,
      help: 'HOLD & DRAG the needle along the glowing thread — mind Nana\'s barking',
      winText: 'The last stitch pulls tight. The shadow twitches, then settles — sewn on for good.',
      loseText: 'The thread snaps loose. The shadow slips free again, restless as ever.',
      init(api) {
        const W = api.W, H = api.H, cx = W / 2, cy = H * 0.5, s = 70;
        this.path = [
          [cx, cy - 1.5 * s], [cx - 0.15 * s, cy - 1.2 * s], [cx - 0.3 * s, cy - 0.9 * s],
          [cx - 0.6 * s, cy - 0.5 * s], [cx - 0.75 * s, cy - 0.1 * s], [cx - 0.6 * s, cy + 0.1 * s],
          [cx - 0.3 * s, cy - 0.2 * s], [cx - 0.15 * s, cy + 0.1 * s], [cx, cy + 0.3 * s],
          [cx + 0.15 * s, cy + 0.1 * s], [cx + 0.3 * s, cy - 0.2 * s], [cx + 0.6 * s, cy + 0.1 * s],
          [cx + 0.75 * s, cy - 0.1 * s], [cx + 0.6 * s, cy - 0.5 * s], [cx + 0.3 * s, cy - 0.9 * s],
          [cx + 0.15 * s, cy - 1.2 * s], [cx, cy - 1.5 * s],
          [cx, cy + 0.3 * s], [cx - 0.2 * s, cy + 0.7 * s], [cx - 0.35 * s, cy + 1.3 * s],
          [cx, cy + 0.9 * s], [cx + 0.35 * s, cy + 1.3 * s], [cx + 0.2 * s, cy + 0.7 * s], [cx, cy + 0.3 * s],
        ];
        this.idx = 1; this.dwell = 0; this.DWELL = 0.42; this.tol = 15;
        this.strikes = 0; this.maxStrikes = 3; this.offT = 0; this.OFF_LIMIT = 0.9;
        this.timer = 27; this.needle = { x: this.path[0][0], y: this.path[0][1] };
        this.startleT = api.rnd(3.5, 5.5); this.startling = false; this.startleDur = 0; this.nudge = { x: 0, y: 0 };
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.timer -= dt;
        if (this.timer <= 0) { api.lose(); return; }
        this.startleT -= dt;
        if (!this.startling && this.startleT <= 0) { this.startling = true; this.startleDur = 0.7; api.audio.sfx('blip'); this.nudge = { x: api.rnd(-6, 6), y: api.rnd(-6, 6) }; }
        if (this.startling) { this.startleDur -= dt; if (this.startleDur <= 0) { this.startling = false; this.startleT = api.rnd(4, 6.5); this.nudge = { x: 0, y: 0 }; } }
        const tol = this.tol * (this.startling ? 0.55 : 1) + (api.has('threadneedle') ? 3 : 0);
        if (api.pointer.down) { this.needle.x = api.pointer.x; this.needle.y = api.pointer.y; }
        let dx = 0, dy = 0;
        if (api.keyDown('left')) dx -= 1; if (api.keyDown('right')) dx += 1;
        if (api.keyDown('up')) dy -= 1; if (api.keyDown('down')) dy += 1;
        if (dx || dy) { this.needle.x += dx * 120 * dt; this.needle.y += dy * 120 * dt; }
        this.needle.x = clamp(this.needle.x, 6, W - 6); this.needle.y = clamp(this.needle.y, 30, H - 30);
        const target = this.path[this.idx];
        const tx = target[0] + this.nudge.x, ty = target[1] + this.nudge.y;
        const dist = Math.hypot(this.needle.x - tx, this.needle.y - ty);
        if (dist <= tol) {
          this.offT = Math.max(0, this.offT - dt * 2);
          this.dwell += dt;
          if (this.dwell >= this.DWELL) {
            this.dwell = 0; this.idx++;
            api.addScore(8); api.audio.sfx('blip'); api.burst(tx, ty, C.gold, 6);
            if (this.idx >= this.path.length) { api.addScore(70); api.win(); return; }
          }
        } else if (dist > tol * 2.4 && (api.pointer.down || dx || dy)) {
          this.offT += dt;
          if (this.offT >= this.OFF_LIMIT) {
            this.offT = 0; this.strikes++; api.shake(4, 0.2); api.flash('#3a1a1a', 0.14); api.audio.sfx('hurt');
            if (this.strikes >= this.maxStrikes) { api.lose(); return; }
          }
        } else { this.dwell = Math.max(0, this.dwell - dt * 0.6); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#141048'], [1, '#0a0a2e']]);
        g2.stars(t, 16, H * 0.4, 'rgba(200,200,255,.25)');
        g2.roundRect(W - 58, 20, 40, 50, 4, 'rgba(10,10,40,.6)', C.silverDim, 1);
        for (let i = 0; i < this.path.length; i++) {
          const p = this.path[i];
          c.fillStyle = i < this.idx ? C.gold : 'rgba(232,240,255,.35)';
          c.beginPath(); c.arc(p[0], p[1], i === this.idx ? 3 : 2, 0, 7); c.fill();
          if (i > 0) {
            c.strokeStyle = i <= this.idx ? 'rgba(255,224,102,.5)' : 'rgba(232,240,255,.18)'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(this.path[i - 1][0], this.path[i - 1][1]); c.lineTo(p[0], p[1]); c.stroke();
          }
        }
        const target = this.path[this.idx];
        if (target) g2.glow(target[0] + this.nudge.x, target[1] + this.nudge.y, 10, this.startling ? C.danger : C.gold, 0.5 + 0.2 * Math.sin(t * 6));
        c.fillStyle = C.silver; c.beginPath(); c.arc(this.needle.x, this.needle.y, 3, 0, 7); c.fill();
        if (this.startling) api.txtCFit('NANA BARKS!', W / 2, 54, 9, C.danger);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,24,.7)', C.indigo, 1);
        api.txt('STITCHED ' + this.idx + '/' + (this.path.length - 1), 9, 8, 8, C.gold);
        api.txtCFit('MISS ' + this.strikes + '/' + this.maxStrikes, W - 46, 8, 7, C.danger, false, 80);
        api.vignette();
      },
    };
  }

  /* --- NEVERLAND SKY: altitude-band flight, dodging chimneys/clouds/spires --- */
  function skyFlight() {
    return {
      name: 'SECOND STAR TO THE RIGHT', boss: false,
      help: 'DRAG / ARROW KEYS to hold your altitude — clear of chimneys, spires and storm clouds',
      winText: 'London falls away below. Ahead, the second star to the right glimmers — straight on till morning.',
      loseText: 'A chimney catches a wingtip. Down you tumble, back toward the rooftops.',
      init(api) {
        const H = api.H;
        this.x = api.W * 0.26; this.y = H / 2;
        this.bandHalf = 58 + (api.has('threadneedle') ? 20 : 0);
        this.hp = 3; this.timer = 23; this.spawnT = 0; this.obs = []; this.motes = []; this.moteT = 0;
        this.hitFlash = 0; this.msgT = 0; this.msg = ''; this.bandY = H / 2;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.timer -= dt;
        if (this.timer <= 0) { api.addScore(70); api.win(); return; }
        let dir = 0; if (api.keyDown('up')) dir -= 1; if (api.keyDown('down')) dir += 1;
        if (dir) this.y += dir * 150 * dt;
        else if (api.pointer.down) this.y += clamp(api.pointer.y - this.y, -150 * dt, 150 * dt);
        this.y = clamp(this.y, 20, H - 20);
        this.bandY = H / 2 + Math.sin(api.t * 0.35) * H * 0.14;
        const speed = 108 + (23 - this.timer) * 4;
        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          this.spawnT = Math.max(0.5, api.rnd(0.75, 1.15) - (23 - this.timer) * 0.012);
          const kind = api.choice(['chimney', 'spire', 'cloud']);
          let oy, oh;
          if (kind === 'chimney') { oh = api.rnd(40, 80); oy = H - oh / 2; }
          else if (kind === 'spire') { oh = api.rnd(40, 80); oy = oh / 2; }
          else { const side = api.chance(0.5); oh = api.rnd(26, 42); oy = side ? (this.bandY - this.bandHalf - oh / 2 - 6) : (this.bandY + this.bandHalf + oh / 2 + 6); }
          this.obs.push({ x: W + 20, y: oy, h: oh, kind, gone: false });
        }
        for (const o of this.obs) o.x -= speed * dt;
        this.obs = this.obs.filter((o) => !o.gone && o.x > -30);
        this.moteT -= dt;
        if (this.moteT <= 0) { this.moteT = api.rnd(0.5, 0.9); this.motes.push({ x: W + 16, y: this.bandY + api.rnd(-this.bandHalf * 0.6, this.bandHalf * 0.6) }); }
        for (const m of this.motes) m.x -= 130 * dt;
        this.motes = this.motes.filter((m) => {
          if (Math.abs(m.x - this.x) < 12 && Math.abs(m.y - this.y) < 12) { api.addScore(12); api.audio.sfx('coin'); api.burst(m.x, m.y, C.gold, 6); return false; }
          return m.x > -20;
        });
        if (this.hitFlash <= 0) {
          for (const o of this.obs) {
            if (o.gone) continue;
            if (Math.abs(this.x - o.x) < 16 && Math.abs(this.y - o.y) < o.h / 2 + 8) {
              o.gone = true; this.hp--; this.hitFlash = 0.7; api.shake(6, 0.3); api.flash('#c81436', 0.2); api.audio.sfx('hurt');
              api.burst(o.x, o.y, C.crimson, 8);
              if (this.hp <= 0) { api.lose(); return; }
            }
          }
        }
        if (this.hitFlash > 0) this.hitFlash -= dt;
        if (this.msgT > 0) this.msgT -= dt;
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, C.nightDeep], [1, C.indigo]]);
        g2.stars(t, 30, H, 'rgba(232,240,255,.4)');
        g2.roundRect(6, this.bandY - this.bandHalf, W - 12, this.bandHalf * 2, 6, 'rgba(255,224,102,.06)', 'rgba(255,224,102,.3)', 1);
        for (const o of this.obs) {
          if (o.gone) continue;
          if (o.kind === 'chimney') { c.fillStyle = C.wood; c.fillRect(o.x - 8, o.y - o.h / 2, 16, o.h); c.fillStyle = C.woodDark; c.fillRect(o.x - 8, o.y - o.h / 2, 16, 4); }
          else if (o.kind === 'spire') { c.fillStyle = '#161230'; c.beginPath(); c.moveTo(o.x - 10, o.y + o.h / 2); c.lineTo(o.x, o.y - o.h / 2); c.lineTo(o.x + 10, o.y + o.h / 2); c.closePath(); c.fill(); }
          else { c.fillStyle = 'rgba(200,210,230,.5)'; c.beginPath(); c.ellipse(o.x, o.y, 16, o.h / 2, 0, 0, 7); c.fill(); }
        }
        for (const m of this.motes) { g2.glow(m.x, m.y, 6, C.gold, 0.5); c.fillStyle = C.goldBright; c.beginPath(); c.arc(m.x, m.y, 2.4, 0, 7); c.fill(); }
        if (!(this.hitFlash > 0 && Math.floor(t * 10) % 2 === 0)) g2.bigSprite(PETER_ROWS, this.x - 12, this.y - 20, PETER_PAL, 3, { outline: true, shadow: true });
        for (let i = 0; i < this.hp; i++) g2.roundRect(W - 20 - i * 14, 20, 10, 10, 3, C.gold, null);
        g2.roundRect(6, H - 12, W - 12, 5, 3, C.indigo, null);
        g2.roundRect(6, H - 12, Math.round((W - 12) * (this.timer / 23)), 5, 3, C.gold, null);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,24,.7)', C.indigo, 1);
        api.txtCFit(Math.ceil(this.timer) + 's', W / 2, 8, 8, C.cream, false, 60);
        api.vignette();
      },
    };
  }

  /* --- MERMAID LAGOON: cast-and-reel (pull-back cast, tension-band reel) --- */
  function lagoonCast() {
    return {
      name: 'MERMAID LAGOON', boss: false,
      help: 'DRAG BACK & RELEASE to cast at the ribbon · TAP RHYTHMICALLY to keep the line taut',
      winText: "The ribbon comes free of the rock — and with it, Wendy, safe above the rising tide.",
      loseText: "The tide swallows Marooners' Rock before the line ever goes taut.",
      init(api) {
        const W = api.W, H = api.H;
        this.rod = { x: W * 0.2, y: H - 46 };
        this.target = { x: W * 0.7, y: H * 0.42 };
        this.state = 'aim'; this.hook = { x: this.rod.x, y: this.rod.y }; this.drag = null; this.aimVec = null;
        this.tide = 0; this.tideMax = 100; this.tideRate = 100 / 25;
        this.tension = 0.5; this.reel = 0; this.reelMax = 100;
        this.attempts = 0; this.maxAttempts = 5; this.flyT = 0;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.tide += this.tideRate * dt;
        if (this.tide >= this.tideMax) { api.lose(); return; }
        const bob = Math.sin(api.t * 1.4) * 6;
        if (this.state === 'aim') {
          if (api.pointer.justDown) this.drag = { x: api.pointer.x, y: api.pointer.y };
          if (this.drag && api.pointer.down) this.aimVec = { x: this.drag.x - api.pointer.x, y: this.drag.y - api.pointer.y };
          if (this.drag && api.pointer.justUp) {
            const v = this.aimVec || { x: 0, y: -40 };
            const power = clamp(Math.hypot(v.x, v.y) / 40, 0.4, 2.2);
            this.castTo = { x: clamp(this.rod.x + v.x * power, 10, W - 10), y: clamp(this.rod.y + v.y * power, 20, H - 20) };
            this.state = 'flying'; this.flyT = 0; this.drag = null; this.aimVec = null; api.audio.sfx('shoot');
          }
        } else if (this.state === 'flying') {
          this.flyT += dt / 0.45;
          if (this.flyT >= 1) {
            this.flyT = 1; this.hook.x = this.castTo.x; this.hook.y = this.castTo.y;
            const dist = Math.hypot(this.hook.x - this.target.x, this.hook.y - (this.target.y + bob));
            if (dist < 20) { this.state = 'reel'; this.tension = 0.5; api.audio.sfx('coin'); api.burst(this.hook.x, this.hook.y, C.teal, 10); }
            else {
              this.attempts++; api.shake(2, 0.1); api.audio.sfx('hurt');
              if (this.attempts >= this.maxAttempts) { api.lose(); return; }
              this.state = 'aim'; this.hook = { x: this.rod.x, y: this.rod.y };
            }
          } else {
            this.hook.x = this.rod.x + (this.castTo.x - this.rod.x) * this.flyT;
            this.hook.y = this.rod.y + (this.castTo.y - this.rod.y) * this.flyT - Math.sin(this.flyT * Math.PI) * 30;
          }
        } else if (this.state === 'reel') {
          const band = 0.14 + (api.has('starlight') ? 0.05 : 0);
          this.tension -= 0.32 * dt;
          if (api.pointer.justDown || (api.keyPressed('a') || api.keyPressed('start'))) { this.tension = clamp(this.tension + 0.16, 0, 1.2); api.audio.sfx('blip'); }
          if (this.tension <= 0.12) { api.lose(); return; }
          if (this.tension >= 1.0) { api.lose(); return; }
          if (Math.abs(this.tension - 0.5) <= band) { this.reel += (100 / 11) * dt; api.addScore(0.3); }
          if (this.reel >= this.reelMax) { api.addScore(80); api.win(); return; }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#0a1c34'], [0.6, '#0e2438'], [1, '#123018']]);
        g2.stars(t, 16, H * 0.4, 'rgba(232,240,255,.35)');
        c.fillStyle = 'rgba(232,240,255,.5)'; c.beginPath(); c.arc(W * 0.78, H * 0.14, 14, 0, 7); c.fill();
        c.fillStyle = 'rgba(20,50,40,.6)'; c.beginPath(); c.ellipse(this.target.x, H * 0.7, 40, 14, 0, 0, 7); c.fill();
        const bob = Math.sin(t * 1.4) * 6;
        c.fillStyle = C.teal; c.fillRect(this.target.x - 5, this.target.y + bob - 4, 10, 8);
        c.fillStyle = C.wood; c.fillRect(this.rod.x - 2, this.rod.y - 40, 4, 40);
        if (this.state === 'aim' && this.drag) {
          c.strokeStyle = C.silverDim; c.lineWidth = 1.5; c.setLineDash([3, 3]);
          c.beginPath(); c.moveTo(this.rod.x, this.rod.y - 38); c.lineTo(api.pointer.x, api.pointer.y); c.stroke(); c.setLineDash([]);
        }
        if (this.state === 'flying' || this.state === 'reel') {
          c.strokeStyle = C.silverDim; c.lineWidth = 1; c.beginPath(); c.moveTo(this.rod.x, this.rod.y - 38); c.lineTo(this.hook.x, this.hook.y); c.stroke();
          c.fillStyle = C.silver; c.beginPath(); c.arc(this.hook.x, this.hook.y, 3, 0, 7); c.fill();
        }
        g2.roundRect(6, H - 24, W - 12, 8, 3, C.indigo, null);
        g2.roundRect(6, H - 24, Math.round((W - 12) * (this.tide / this.tideMax)), 8, 3, C.danger, null);
        api.txtCFit('TIDE', W / 2, H - 38, 8, C.danger);
        if (this.state === 'reel') {
          const band = 0.14 + (api.has('starlight') ? 0.05 : 0);
          const mx = 14, my = H - 60, mw = W - 28;
          g2.roundRect(mx, my, mw, 8, 3, C.indigo, null);
          if (api.has('starlight')) g2.glow(mx + 0.5 * mw, my + 4, 10, C.gold, 0.35 + 0.15 * Math.sin(t * 5));
          c.fillStyle = C.teal; c.globalAlpha = 0.6; c.fillRect(mx + (0.5 - band) * mw, my, band * 2 * mw, 8); c.globalAlpha = 1;
          c.fillStyle = C.cream; c.fillRect(mx + clamp(this.tension, 0, 1) * mw - 2, my - 4, 4, 16);
          api.txtCFit('REELED ' + Math.floor(this.reel) + '%', W / 2, my - 14, 8, C.teal, false, 120);
        } else {
          api.txtCFit('ATTEMPTS ' + this.attempts + '/' + this.maxAttempts, W / 2, H - 60, 8, C.dim);
        }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,24,.7)', C.indigo, 1);
        api.txtCFit('THE RIBBON', W / 2, 8, 8, C.teal, false, 110);
        api.vignette();
      },
    };
  }

  /* --- THE JOLLY ROGER: disguise/bluff, decoy-tap under a shrinking window --- */
  function shipBluff() {
    return {
      name: 'THE JOLLY ROGER', boss: false,
      help: 'TAP the response that matches the prompt before suspicion catches you',
      winText: "Six Lost Boys slip free of their ropes — and Hook never once sees Peter's face.",
      loseText: 'A raised eyebrow, a beat too slow — the disguise slips, and the alarm goes up.',
      init(api) {
        this.need = 6; this.freed = 0;
        this.suspicion = 0; this.suspMax = 100; this.hitAmt = 20;
        this.window = 1.8 + (api.has('silverline') ? 0.4 : 0);
        this.icons = ['growl', 'salute', 'spit', 'shrug', 'wink'];
        this.pause = 0;
        this.newRound(api);
      },
      newRound(api) {
        const pool = this.icons.slice();
        this.correct = api.choice(pool);
        const decoys = pool.filter((x) => x !== this.correct);
        const n = api.chance(0.5) ? 2 : 3;
        const chosen = shuffled(decoys, api).slice(0, n - 1);
        this.options = shuffled([this.correct].concat(chosen), api);
        this.roundT = this.window; this.pause = 0;
      },
      rects(api) {
        const n = this.options.length, W = api.W, bw = 74, gap = 10;
        const total = n * bw + (n - 1) * gap, x0 = W / 2 - total / 2, y = api.H - 76;
        return this.options.map((_, i) => ({ x: x0 + i * (bw + gap), y, w: bw, h: 52 }));
      },
      update(api, dt) {
        if (this.pause > 0) { this.pause -= dt; if (this.pause <= 0) this.newRound(api); return; }
        this.roundT -= dt;
        const rects = this.rects(api);
        let picked = -1;
        if (api.pointer.justDown) {
          for (let i = 0; i < rects.length; i++) { const r = rects[i]; if (api.pointer.x >= r.x && api.pointer.x <= r.x + r.w && api.pointer.y >= r.y && api.pointer.y <= r.y + r.h) { picked = i; break; } }
        }
        if (picked >= 0) {
          const r = rects[picked];
          if (this.options[picked] === this.correct) {
            this.freed++; api.addScore(20); api.audio.sfx('coin'); api.burst(r.x + r.w / 2, r.y + r.h / 2, C.teal, 8);
            if (this.freed >= this.need) { api.addScore(70); api.win(); return; }
          } else {
            this.suspicion += this.hitAmt; api.shake(4, 0.2); api.flash('#c81436', 0.15); api.audio.sfx('hurt');
            if (this.suspicion >= this.suspMax) { api.lose(); return; }
          }
          this.pause = 0.55;
        } else if (this.roundT <= 0) {
          this.suspicion += this.hitAmt; api.shake(4, 0.2); api.flash('#c81436', 0.15); api.audio.sfx('hurt');
          if (this.suspicion >= this.suspMax) { api.lose(); return; }
          this.pause = 0.55;
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#0a0a24'], [1, '#141020']]);
        g2.stars(t, 14, H * 0.35, 'rgba(232,240,255,.3)');
        c.fillStyle = C.woodDark; c.fillRect(0, H * 0.6, W, H * 0.4);
        g2.bigSprite(HOOK_ROWS, W / 2 - 20, H * 0.28, HOOK_PAL, 3, { outline: true, shadow: true });
        const ringR = 22 * clamp(this.roundT / this.window, 0, 1);
        c.strokeStyle = this.roundT < this.window * 0.3 ? C.danger : C.silverDim; c.lineWidth = 2;
        c.beginPath(); c.arc(W / 2, H * 0.28 + 4, ringR, 0, 7); c.stroke();
        api.txtCFit('PROMPT: ' + this.correct.toUpperCase(), W / 2, H * 0.5, 9, C.gold, false, W - 40);
        const rects = this.rects(api);
        rects.forEach((r, i) => {
          g2.roundRect(r.x, r.y, r.w, r.h, 6, 'rgba(14,11,24,.9)', C.silverDim, 1);
          api.txtCFit(this.options[i].toUpperCase(), r.x + r.w / 2, r.y + r.h / 2 - 6, 8, C.cream, false, r.w - 8);
        });
        g2.roundRect(14, H - 20, W - 28, 8, 3, C.indigo, null);
        g2.roundRect(14, H - 20, Math.round((W - 28) * (this.suspicion / this.suspMax)), 8, 3, C.danger, null);
        api.txtCFit('SUSPICION', W / 2, H - 34, 8, C.danger);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,24,.7)', C.indigo, 1);
        api.txtCFit('FREED ' + this.freed + '/' + this.need, W / 2, 8, 8, C.teal, false, 110);
        api.vignette();
      },
    };
  }

  /* --- THE DUEL p1: STEEL ON STEEL (reaction-timing parry, escalating tempo) --- */
  function duelParry() {
    return {
      name: 'STEEL ON STEEL', boss: true,
      help: 'TAP the instant the cutlass flashes white — Hook swings faster with every clash',
      winText: 'Hook staggers back, blade knocked wide. One duel won — one left to lose.',
      loseText: "A cutlass finds its mark. Hook's grin widens as the deck tilts toward the sea.",
      init(api) {
        this.need = 9; this.hits = 0;
        this.maxMiss = 3 + (api.has('lostboys') ? 1 : 0); this.miss = 0;
        this.cocky = !!api.flags.cocky;
        this.ramp = this.cocky ? 0.075 : 0.05;
        this.strikeWinBase = this.cocky ? 0.22 : 0.27;
        this.setWindup();
      },
      setWindup() { this.windup = Math.max(0.42, 1.1 - this.hits * this.ramp); this.t = 0; this.phase = 'wind'; },
      update(api, dt) {
        this.t += dt;
        const hint = api.has('starlight');
        if (this.phase === 'wind') {
          if (api.confirm() && this.t < this.windup * 0.55) { this.onMiss(api); return; }
          if (this.t >= this.windup) { this.phase = 'strike'; this.t = 0; }
        } else {
          const win = this.strikeWinBase + (hint ? 0.03 : 0);
          if (api.confirm()) { this.onHit(api); return; }
          if (this.t >= win) { this.onMiss(api); }
        }
      },
      onHit(api) {
        this.hits++; api.addScore(18); api.audio.sfx('coin'); api.shake(2, 0.1); api.burst(api.W / 2, api.H * 0.5, C.silver, 8);
        if (this.hits >= this.need) { api.addScore(90); api.win(); return; }
        this.setWindup();
      },
      onMiss(api) {
        this.miss++; api.shake(5, 0.25); api.flash('#c81436', 0.16); api.audio.sfx('hurt');
        if (this.miss >= this.maxMiss) { api.lose(); return; }
        this.setWindup();
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#141020'], [1, '#0a0a1c']]);
        g2.stars(t, 20, H * 0.4, 'rgba(232,240,255,.3)');
        c.fillStyle = C.woodDark; c.fillRect(0, H * 0.72, W, H * 0.28);
        const hint = api.has('starlight');
        const flashPhase = this.phase === 'strike';
        if (flashPhase && hint) g2.glow(W * 0.62, H * 0.5, 40, C.gold, 0.25);
        g2.bigSprite(HOOK_ROWS, W * 0.58, H * 0.4, HOOK_PAL, 4, { outline: true, shadow: true });
        g2.bigSprite(PETER_ROWS, W * 0.16, H * 0.44, PETER_PAL, 3, { outline: true, shadow: true });
        const bright = flashPhase ? (0.5 + 0.5 * Math.sin(t * 30)) : this.t / this.windup;
        c.strokeStyle = flashPhase ? ('rgba(255,255,255,' + bright + ')') : ('rgba(200,200,220,' + (0.2 + bright * 0.4) + ')');
        c.lineWidth = 3;
        c.beginPath(); c.moveTo(W * 0.5, H * 0.3); c.lineTo(W * 0.68, H * 0.5); c.stroke();
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,24,.7)', C.indigo, 1);
        api.txt('CLASH ' + this.hits + '/' + this.need, 9, 8, 8, C.gold);
        api.txtCFit('MISS ' + this.miss + '/' + this.maxMiss, W - 46, 8, 7, C.danger, false, 80);
        api.vignette();
      },
    };
  }

  /* --- THE DUEL p2 (finale): TICK...TICK...TOCK (alternating rhythm QTE) --- */
  function duelTickTock() {
    return {
      name: 'TICK...TICK...TOCK', boss: true,
      help: "TAP in rhythm with the crocodile's tick, tick, TOCK — shove Hook off the plank",
      winText: 'On the TOCK, Hook goes over backward with a splash — and a very satisfied crocodile.',
      loseText: 'The rhythm slips. Hook plants his boots and does not go over.',
      init(api) {
        this.pattern = ['tick', 'tick', 'TOCK'];
        this.need = 9; this.hits = 0;
        this.maxMiss = 3 + (api.has('lostboys') ? 1 : 0); this.miss = 0;
        this.beatDur = 0.62; this.beatT = 0; this.windowHalf = 0.16;
      },
      update(api, dt) {
        this.beatT += dt;
        const idx = this.hits % this.pattern.length;
        const isTock = this.pattern[idx] === 'TOCK';
        const win = this.windowHalf * (isTock ? 1.3 : 1);
        if (api.confirm()) {
          if (Math.abs(this.beatT - this.beatDur) <= win) {
            this.hits++; api.addScore(18); api.audio.sfx(isTock ? 'win' : 'coin');
            api.burst(api.W / 2, api.H * 0.6, isTock ? C.crimson : C.teal, isTock ? 12 : 6); api.shake(isTock ? 4 : 1, 0.15);
            this.beatT = 0;
            if (this.hits >= this.need) { api.addScore(100); api.win(); return; }
          } else { this.registerMiss(api); }
        } else if (this.beatT > this.beatDur + win) { this.registerMiss(api); }
      },
      registerMiss(api) {
        this.miss++; api.shake(4, 0.2); api.flash('#2a1450', 0.15); api.audio.sfx('hurt'); this.beatT = 0;
        if (this.miss >= this.maxMiss) { api.lose(); return; }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#0a0a1c'], [1, '#12300a']]);
        g2.stars(t, 16, H * 0.35, 'rgba(232,240,255,.3)');
        c.fillStyle = C.woodDark; c.fillRect(W * 0.3, H * 0.5, W * 0.4, 10);
        c.fillStyle = C.croc; c.beginPath(); c.ellipse(W * 0.5, H * 0.66 + Math.sin(t * 2) * 4, 26, 12, 0, 0, 7); c.fill();
        const idx = this.hits % this.pattern.length, isTock = this.pattern[idx] === 'TOCK';
        const frac = clamp(this.beatT / this.beatDur, 0, 1.3);
        const mx = 24, my = H * 0.32, mw = W - 48;
        g2.roundRect(mx, my, mw, 10, 3, C.indigo, null);
        const win = this.windowHalf * (isTock ? 1.3 : 1);
        c.fillStyle = isTock ? C.crimson : C.teal; c.globalAlpha = 0.55;
        c.fillRect(mx + (1 - win / this.beatDur) * mw, my, (win / this.beatDur) * mw, 10); c.globalAlpha = 1;
        c.fillStyle = C.cream; c.fillRect(mx + clamp(frac, 0, 1) * mw - 2, my - 4, 4, 18);
        api.txtCFit(isTock ? 'TOCK!' : 'tick', W / 2, my - 20, isTock ? 13 : 10, isTock ? C.crimson : C.teal);
        g2.bigSprite(PETER_ROWS, W * 0.16, H * 0.5, PETER_PAL, 3, { outline: true, shadow: true });
        g2.bigSprite(HOOK_ROWS, W * 0.62, H * 0.46, HOOK_PAL, 3, { outline: true, shadow: true });
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,24,.7)', C.indigo, 1);
        api.txt('BEAT ' + this.hits + '/' + this.need, 9, 8, 8, C.gold);
        api.txtCFit('MISS ' + this.miss + '/' + this.maxMiss, W - 46, 8, 7, C.danger, false, 80);
        api.vignette(); api.scanlines();
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'peterpan16', title: 'Peter Pan', subtitle: 'SECOND STAR TO THE RIGHT',
    currency: 'STARDUST', accent: C.teal, ownPhaseHud: true,
    titleFont: TITLE, uiFont: UI, superSample: 3,
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.gold, blood: C.crimson, cream: C.cream, dim: C.dim, ink: C.ink },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'CHOOSE A STAR', mapDone: 'THE FLIGHT PATH IS COMPLETE',
    screens: {
      overlay: 'rgba(6,6,24,.86)', win: C.gold, lose: C.crimson, chapterLabel: C.dim,
      name: C.cream, sub: C.teal, intro: '#e6ecff', quote: '#7a7aa8', help: C.gold,
      score: C.cream, cur: C.gold, cta: C.cream,
    },
    labels: {
      chapter: 'STAR', phase: 'STAGE', boss: 'THE RECKONING', score: 'STARDUST',
      win: 'THE STARS HOLD', lose: 'THE THREAD SLIPS', nextPhaseWin: 'HELD FAST',
      cont: 'TAP TO PRESS ON', toMap: 'TAP FOR THE CHART', play: 'TAP TO BEGIN',
      nextPhase: 'TAP TO PRESS ON', toFinale: 'TAP FOR THE DAWN',
    },
    upgrades: {
      threadneedle: { name: 'STEADY HANDS', desc: 'a wider safe band while holding your altitude over London' },
      starlight: { name: "TINKER BELL'S LIGHT", desc: "a glimmer marks the safe tension band — and Hook's telegraphed strikes" },
      silverline: { name: 'A SILVER LINE', desc: 'a longer beat to answer before suspicion catches you' },
      lostboys: { name: 'THE LOST BOYS', desc: 'one extra miss forgiven in the final duel' },
    },
    nodes: [
      {
        id: 'nursery', name: 'THE SHADOW SEWN BACK ON', sub: 'THE DARLING NURSERY', reward: 55, grant: 'threadneedle',
        intro: ['A NURSERY WINDOW STANDS OPEN', 'TO THE LONDON NIGHT. A SHADOW', 'LIES CRUMPLED ON THE FLOOR,', 'WAITING TO BE SEWN BACK ON.'],
        quote: 'All children, except one, grow up.',
        winText: 'The last stitch pulls tight. The shadow twitches, then settles — sewn on for good.',
        phases: [shadowStitch()],
      },
      {
        id: 'flight', name: 'SECOND STAR TO THE RIGHT', sub: 'OVER THE ROOFTOPS', needs: ['nursery'], reward: 60, grant: 'starlight',
        intro: ['OFF THE SILL AND INTO THE SKY —', "LONDON'S CHIMNEY-POTS SLIDE BY", 'BELOW, ITS SPIRES CLOSE ABOVE.', 'Hold your course for Neverland.'],
        quote: 'Second star to the right, and straight on till morning.',
        winText: 'London falls away below. Ahead, the second star to the right glimmers — straight on till morning.',
        phases: [skyFlight()],
      },
      {
        id: 'lagoon', name: 'MERMAID LAGOON', sub: "MAROONERS' ROCK", needs: ['flight'], reward: 70, grant: 'silverline',
        intro: ["MAROONERS' ROCK IS SINKING FAST.", "WENDY'S RIBBON IS SNAGGED ON THE", 'STONE, AND THE RISING TIDE HAS', 'NO PATIENCE LEFT TO GIVE.'],
        quote: 'All the world is made of faith, and trust, and pixie dust.',
        winText: "The ribbon comes free of the rock — and with it, Wendy, safe above the rising tide.",
        phases: [lagoonCast()],
      },
      {
        id: 'ship', name: 'THE JOLLY ROGER', sub: "HOOK'S OWN DECK", needs: ['lagoon'], reward: 85, grant: 'lostboys',
        intro: ['THE LOST BOYS ARE TIED TO THE MAST', 'OF THE JOLLY ROGER. ONE WRONG', 'LOOK FROM SMEE, AND THE WHOLE', 'CREW COMES RUNNING.'],
        quote: 'Never say goodbye, because goodbye means going away, and going away means forgetting.',
        winText: "Six Lost Boys slip free of their ropes — and Hook never once sees Peter's face.",
        choice: {
          prompt: 'Hook very nearly catches you at the rail. What does Peter do?',
          hint: 'YOUR ANSWER SHAPES THE FINAL DUEL',
          options: [
            { label: 'Crow in triumph', sub: 'Let Hook hear exactly who bested him', flag: 'cocky',
              icon(api, x, y) { const c = api.ctx; c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 6, -0.6, 0.6); c.stroke(); c.beginPath(); c.arc(x, y, 6, 2.5, 3.7); c.stroke(); } },
            { label: 'Slip away quiet', sub: 'No glory — just the boys safe belowdecks', flag: 'humble',
              icon(api, x, y) { const c = api.ctx; c.strokeStyle = C.teal; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + 6, y); c.stroke(); c.beginPath(); c.arc(x, y - 4, 2, 0, 7); c.fill(); } },
          ],
        },
        phases: [shipBluff()],
      },
      {
        id: 'duel', name: 'THE DUEL FOR NEVERLAND', sub: 'THE JOLLY ROGER, DAWN', needs: ['ship'], reward: 140,
        intro: ['ON DECK AT LAST, BLADE TO BLADE —', "HOOK'S EYES FLICK PAST PETER'S", 'SHOULDER TO THE WATER, WHERE', 'SOMETHING PATIENT IS TICKING.'],
        quote: 'To die will be an awfully big adventure.',
        winText: 'On the TOCK, Hook goes over backward with a splash — and a very satisfied crocodile below.',
        phases: [duelParry(), duelTickTock()],
      },
    ],
    endings: [
      { when: (f) => f.humble, title: 'THE BOY WHO STAYED KIND', lines: ['No crowing this time — just the Lost Boys', 'safe, and Hook left blustering at an', 'empty rail.', '', 'Peter still cannot grow up. But for one', 'quiet moment, flying home, something', 'in him almost does.'] },
      { when: (f) => f.cocky, title: 'ONE LAST CROW', lines: ['Hook goes over the side to a crow of', 'triumph that carries clear across the', 'lagoon.', '', 'The boy who never grows up wins the', 'same way he always does — loudly,', 'and wouldn\'t have it any other way.'] },
      { when: () => true, title: 'STRAIGHT ON TILL MORNING', lines: ['The Jolly Roger sails on without her', 'captain. Peter turns for the window', 'left open on Cloud End Lane,', 'second star to the right, and', 'straight on till morning.'] },
    ],
    finale: ['NEVERLAND SLEEPS UNDER ITS OWN CONSTELLATIONS.'],
  });
})();
