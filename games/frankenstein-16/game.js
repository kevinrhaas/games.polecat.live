/* ============================================================================
 * FRANKENSTEIN — THE LABORATORY WALL   (Gen 2 / 16-bit)
 * Mary Shelley's novel on RetroSaga2: HUB is Victor's own laboratory wall, its
 * mounted instruments the map — the Leyden jar of creation, a cracked shutter
 * on the frightened village, a brass spyglass on the De Laceys' cottage, an
 * altimeter for the Alpine reckoning, and a frost-rimed compass pointed at
 * the Pole. A choice at the cottage window (step into the light, or stay in
 * shadow) shapes the Creature's temperament and which ending closes the tale.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    violet: '#8a4fe0', violetLight: '#c8a8ff', violetDeep: '#1a0a2e',
    green: '#5dff8f', greenBright: '#a6ffce', greenDim: '#2a6a44', greenDark: '#123018',
    ink: '#07040d', night: '#100a1e', nightDeep: '#05030a',
    brass: '#c8a050', brassDark: '#6a4e20', brassLight: '#ecd090', copper: '#b0703a',
    frost: '#8fd8ff', frostDim: '#3a5a78',
    blood: '#c8283a', bloodDark: '#4a0f18',
    cream: '#e6ddc8', dim: '#6a6480', danger: '#ff4a5a',
    wood: '#2a1c10', woodDark: '#160e08',
  };
  // a modular, circuit-board pixel face — fresh for the fleet, and thematically
  // right for a galvanic laboratory (fresh use; not reused from any other game).
  const TITLE = "'Bitcount Prop Single','Press Start 2P',monospace";
  const UI = "'Pixelify Sans','Press Start 2P',monospace";

  const shuffled = (arr, api) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = api.rint(0, i); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };

  const CREATURE_ROWS = [
    '..ehhe..',
    '.ehhhhe.',
    '.ehhhhe.',
    '..hhhh..',
    'b.hhhh.b',
    '.hhhhhh.',
    'ghhhhhhg',
    'ghhhhhhg',
    '..h..h..',
    '..h..h..',
  ];
  const CREATURE_PAL = { h: '#3a5a3a', g: '#26401f', b: C.brass, e: C.greenBright };

  /* ─── emblem: a bell jar holding the spark itself ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(cx, cy - 4, 30, C.green, 0.32);
    c.fillStyle = C.nightDeep;
    c.beginPath(); c.moveTo(cx - 16, cy + 18); c.lineTo(cx - 16, cy - 6);
    c.quadraticCurveTo(cx - 16, cy - 22, cx, cy - 22);
    c.quadraticCurveTo(cx + 16, cy - 22, cx + 16, cy - 6);
    c.lineTo(cx + 16, cy + 18); c.closePath(); c.fill();
    c.strokeStyle = C.brass; c.lineWidth = 2.4; c.stroke();
    c.fillStyle = C.brassDark; c.fillRect(cx - 18, cy + 16, 36, 6);
    // the spark inside
    const f = Math.sin(api.t ? api.t : cy) ;
    c.strokeStyle = C.greenBright; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(cx - 4, cy - 6); c.lineTo(cx + 3, cy + 2); c.lineTo(cx - 2, cy + 4); c.lineTo(cx + 5, cy + 12); c.stroke();
    c.fillStyle = C.brass;
    c.beginPath(); c.arc(cx - 12, cy + 6, 2, 0, 7); c.fill();
    c.beginPath(); c.arc(cx + 12, cy + 6, 2, 0, 7); c.fill();
  }

  /* ─── gothic storm backdrop (intro/result/finale/choice) ─── */
  function gothicNight(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, C.nightDeep], [0.55, C.night], [1, '#140a22']], H);
    const flash = g2.lightning(t, 7.2);
    if (flash > 0) { c.fillStyle = 'rgba(180,150,255,' + (flash * 0.22) + ')'; c.fillRect(0, 0, W, H); }
    for (let i = 0; i < 7; i++) {
      const bx = (i * 41) % W, bh = 36 + (i * 29) % 90;
      c.fillStyle = '#0a0714'; c.fillRect(bx, H * 0.7 - bh, 32, bh + H * 0.32);
      if (i % 3 === 0) { c.fillStyle = C.brassLight; c.globalAlpha = 0.5; c.fillRect(bx + 10, H * 0.7 - bh + 14, 4, 5); c.globalAlpha = 1; }
    }
    c.strokeStyle = 'rgba(180,190,230,.16)'; c.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const rx = (i * 53 + (t * 140)) % W, ry = (i * 37 + t * 300) % H;
      c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 4, ry + 14); c.stroke();
    }
    g2.glow(W * 0.5, H * 0.74, 26, C.green, 0.08);
    if (dim) { c.fillStyle = 'rgba(6,4,12,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }

  function drawBeaker(c, g2, x, y, col, t) {
    c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x, y, 16, 28);
    c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1; c.strokeRect(x, y, 16, 28);
    const fill = 0.5 + 0.1 * Math.sin(t * 2.1);
    c.fillStyle = col + '55'; c.fillRect(x + 1, y + 28 - 28 * fill, 14, 28 * fill);
    if (Math.sin(t * 3.6 + x) > 0.55) { c.globalAlpha = 0.5; c.fillStyle = col; c.beginPath(); c.arc(x + 8, y + 6, 2.4, 0, 7); c.fill(); c.globalAlpha = 1; }
  }

  /* ─── hub backdrop: Victor's own instrument wall ─── */
  const NODE_XY = { spark: [70, 118], village: [200, 92], delaceys: [222, 212], alps: [56, 250], arctic: [135, 366] };
  const ORDER = ['spark', 'village', 'delaceys', 'alps', 'arctic'];
  const DIMS = { spark: [60, 50], village: [58, 50], delaceys: [54, 54], alps: [58, 50], arctic: [72, 58] };

  function labWall(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.verticalGradient(0, 0, W, H, [[0, '#170f28'], [0.62, '#0c0818'], [1, C.woodDark]]);
    g2.verticalGradient(0, H * 0.74, W, H * 0.26, [[0, C.wood], [1, C.woodDark]]);
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1;
    for (let x = 6; x < W; x += 26) { c.beginPath(); c.moveTo(x, H * 0.74); c.lineTo(x, H); c.stroke(); }
    // arched storm window, top-center
    const wx = W / 2, wy = 44, ww = 62, wh = 48;
    c.save();
    c.beginPath();
    c.moveTo(wx - ww / 2, wy + wh); c.lineTo(wx - ww / 2, wy + 14);
    c.quadraticCurveTo(wx - ww / 2, wy, wx, wy);
    c.quadraticCurveTo(wx + ww / 2, wy, wx + ww / 2, wy + 14);
    c.lineTo(wx + ww / 2, wy + wh); c.closePath();
    c.fillStyle = '#100a1e'; c.fill();
    const flash = g2.lightning(t, 5.4);
    if (flash > 0) { c.fillStyle = 'rgba(190,160,255,' + (0.14 + flash * 0.5) + ')'; c.fill(); }
    c.clip();
    c.strokeStyle = 'rgba(180,190,230,.14)'; c.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const rx = (i * 19 + t * 40) % ww + wx - ww / 2; c.beginPath(); c.moveTo(rx, wy); c.lineTo(rx - 3, wy + wh); c.stroke(); }
    c.restore();
    c.strokeStyle = C.brassDark; c.lineWidth = 3;
    c.beginPath();
    c.moveTo(wx - ww / 2, wy + wh); c.lineTo(wx - ww / 2, wy + 14);
    c.quadraticCurveTo(wx - ww / 2, wy, wx, wy);
    c.quadraticCurveTo(wx + ww / 2, wy, wx + ww / 2, wy + 14);
    c.lineTo(wx + ww / 2, wy + wh); c.stroke();
    // copper wire linking the instruments, current flowing along it
    c.strokeStyle = C.copper; c.lineWidth = 2; c.globalAlpha = 0.55;
    c.beginPath();
    ORDER.forEach((id, i) => { const p = NODE_XY[id]; if (i === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); });
    c.stroke(); c.globalAlpha = 1;
    for (let s = 0; s < ORDER.length - 1; s++) {
      const a = NODE_XY[ORDER[s]], b = NODE_XY[ORDER[s + 1]];
      const ph = ((t * 0.16) + s / (ORDER.length - 1)) % 1;
      g2.glow(a[0] + (b[0] - a[0]) * ph, a[1] + (b[1] - a[1]) * ph, 5, C.green, 0.45);
    }
    drawBeaker(c, g2, 12, H - 44, C.violetLight, t);
    drawBeaker(c, g2, W - 28, H - 44, C.green, t + 1.7);
  }

  function scenery(api, scene, t) {
    if (scene === 'hub') { labWall(api, t); return; }
    gothicNight(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale' || scene === 'choice') ? 0.28 : 0);
  }

  /* ─── tiny vignettes painted inside each instrument's face ─── */
  const ART = {
    spark(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = C.nightDeep; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      const jw = w * 0.4, jh = h * 0.6, jx = cx - jw / 2, jy = cy - jh / 2 + h * 0.08;
      c.fillStyle = 'rgba(93,255,143,.22)'; c.fillRect(jx, jy, jw, jh);
      c.strokeStyle = C.brass; c.lineWidth = 1.4; c.strokeRect(jx, jy, jw, jh);
      c.fillStyle = C.brassDark; c.fillRect(jx - 2, jy - 5, jw + 4, 5);
      const flick = Math.sin(t * 9) > 0.4;
      if (flick) {
        c.strokeStyle = C.greenBright; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 3, cy - 6); c.lineTo(cx + 4, cy); c.lineTo(cx - 2, cy + 3); c.lineTo(cx + 5, cy + 10); c.stroke();
      }
    },
    village(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = '#0e0810'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.fillStyle = '#1a1010';
      c.beginPath(); c.moveTo(cx - w / 2, cy + h / 2); c.lineTo(cx - w / 4, cy - h * 0.1); c.lineTo(cx, cy + h * 0.1);
      c.lineTo(cx + w / 4, cy - h * 0.16); c.lineTo(cx + w / 2, cy + h / 2); c.closePath(); c.fill();
      const flick = 0.5 + 0.5 * Math.sin(t * 7 + 2);
      c.fillStyle = '#ff8a3d'; c.globalAlpha = 0.6 + 0.3 * flick;
      c.beginPath(); c.arc(cx - w * 0.18, cy + h * 0.14, 3.2, 0, 7); c.fill();
      c.beginPath(); c.arc(cx + w * 0.22, cy + h * 0.08, 2.6, 0, 7); c.fill();
      c.globalAlpha = 1;
    },
    delaceys(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = '#0a0810'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      const gl = c.createRadialGradient(cx, cy, 2, cx, cy, w * 0.5);
      gl.addColorStop(0, 'rgba(240,200,90,.55)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gl; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.fillStyle = '#f0c060'; c.fillRect(cx - w * 0.22, cy - h * 0.22, w * 0.44, h * 0.44);
      c.strokeStyle = C.brassDark; c.lineWidth = 1.4; c.strokeRect(cx - w * 0.22, cy - h * 0.22, w * 0.44, h * 0.44);
    },
    alps(api, cx, cy, w, h, t) {
      const c = api.ctx;
      const g = c.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
      g.addColorStop(0, '#2a3a58'); g.addColorStop(1, '#0e1424');
      c.fillStyle = g; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.fillStyle = '#c8e6ff';
      c.beginPath(); c.moveTo(cx - w / 2, cy + h * 0.3); c.lineTo(cx - w * 0.1, cy - h * 0.3);
      c.lineTo(cx + w * 0.1, cy - h * 0.05); c.lineTo(cx + w * 0.5, cy + h * 0.3); c.closePath(); c.fill();
      c.strokeStyle = C.brass; c.lineWidth = 1;
      c.beginPath(); c.moveTo(cx - w * 0.4, cy); c.lineTo(cx + w * 0.4, cy - Math.sin(t * 0.6) * 4); c.stroke();
    },
    arctic(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = '#060a14'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.strokeStyle = C.frost; c.lineWidth = 1.4;
      const ang = Math.sin(t * 0.5) * 0.5 + Math.PI * 1.5;
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ang) * w * 0.3, cy + Math.sin(ang) * w * 0.3); c.stroke();
      c.strokeStyle = 'rgba(143,216,255,.4)'; c.beginPath(); c.arc(cx, cy, w * 0.32, 0, 7); c.stroke();
      c.fillStyle = '#0a1420'; c.fillRect(cx - w * 0.3, cy + h * 0.24, w * 0.4, h * 0.14);
    },
  };

  const menu = {
    title(api, save, t) {
      const g2 = api.g2, W = api.W;
      g2.ornateFrame(14, 6, W - 28, 32, 8, 'rgba(8,6,16,.88)', C.brass);
      const ti = 'FRANKENSTEIN';
      g2.gleamText(ti, W / 2, 12, api.fitSize(ti, 11, W - 48, 'title'), C.green, t, { shadow: 'rgba(0,0,0,.6)', gleamSpeed: 55, font: TITLE });
      api.txtCFit('VITALITY  ' + (save.cur || 0), W / 2, 28, 8, C.cream);
    },
    layout() {
      return ORDER.map((id) => { const p = NODE_XY[id], d = DIMS[id]; return { x: p[0] - d[0] / 2, y: p[1] - d[1] / 2, w: d[0], h: d[1] }; });
    },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, locked, t, i } = info;
      const cx = x + w / 2, cy = y + h / 2;
      if (i === 0) menu._labelQueue = [];
      if (sel && !locked) g2.glow(cx, cy, Math.max(w, h) * 0.75, C.green, 0.28 + 0.1 * Math.sin(t * 4));
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      if (!locked && ART[node.id]) ART[node.id](api, cx, cy, w, h, t); else { c.fillStyle = '#0a0a12'; c.fillRect(x, y, w, h); }
      c.restore();
      g2.roundRect(x - 3, y - 3, w + 6, h + 6, 5, null, C.woodDark, 3);
      g2.roundRect(x, y, w, h, 3, null, locked ? '#3a3a3a' : (done ? C.green : C.brass), sel ? 2.4 : 1.6);
      if (locked) { c.fillStyle = 'rgba(6,6,10,.6)'; c.fillRect(x, y, w, h); api.txtC('🔒', cx, cy - 6, 11, '#8a8a8a'); }
      if (done) { g2.roundRect(x + w - 15, y - 2, 13, 11, 3, C.nightDeep, C.green, 1); api.txtC('✓', x + w - 9, y - 1, 8, C.green); }
      menu._labelQueue.push({ id: node.id, name: node.name, cx, ly: y + h + 4, w, locked, done });
      if (i === ORDER.length - 1) {
        for (const L of menu._labelQueue) {
          const maxW = Math.min(L.w + 16, 2 * Math.min(L.cx - 3, api.W - 3 - L.cx));
          g2.roundRect(L.cx - maxW / 2 - 2, L.ly - 2, maxW + 4, 13, 4, '#0a0a12', L.locked ? '#3a3a3a' : C.woodDark, 1);
          api.txtCFit(HUB_LABEL[L.id] || L.name, L.cx, L.ly, 6.5, L.locked ? '#7a7a7a' : (L.done ? C.green : C.cream), false, maxW);
        }
      }
    },
  };
  const HUB_LABEL = { spark: 'THE SPARK', village: 'THE VILLAGE', delaceys: 'DE LACEYS', alps: 'THE GLACIER', arctic: 'THE POLE' };

  /* ─── animated title screen: a storm breaking over the laboratory tower ─── */
  function renderBoot(api, info) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    gothicNight(api, t, 0);
    emblem(api, W / 2, H * 0.24);
    const title = 'FRANKENSTEIN';
    const ts = api.fitSize(title, 15, W - 20, 'title');
    g2.gleamText(title, W / 2, H * 0.38, ts, C.green, t, { shadow: 'rgba(0,0,0,.5)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('A GALVANIC ROMANCE', W / 2, H * 0.38 + ts + 12, 10, C.violetLight, true);
    if (info.blink) api.txtCFit('▸ TAP TO WAKE THE DEAD ◂', W / 2, H * 0.66, 11, C.cream);
    api.txtCFit('AFTER MARY SHELLEY, 1818', W / 2, H - 28, 8, C.dim);
    api.vignette(); api.scanlines();
  }

  /* ============================ mini-game phases ============================ */

  /* --- THE SPARK p1: THE ANATOMY TABLE (assembly puzzle, diagram-guided) --- */
  const PARTS = [
    { id: 'heart', col: C.blood }, { id: 'hand', col: '#c8a878' }, { id: 'eye', col: C.frost },
    { id: 'brain', col: '#d8b8e8' }, { id: 'spine', col: C.brassLight },
  ];
  const SLAB_SPOT = { heart: [0, -6], hand: [-15, 4], eye: [-4, -20], brain: [4, -24], spine: [0, 12] };
  function drawPartIcon(c, id, x, y, s, col) {
    c.fillStyle = col;
    if (id === 'heart') {
      c.beginPath(); c.moveTo(x, y + s * 0.3);
      c.bezierCurveTo(x - s, y - s * 0.5, x - s * 1.3, y + s * 0.3, x, y + s * 1.1);
      c.bezierCurveTo(x + s * 1.3, y + s * 0.3, x + s, y - s * 0.5, x, y + s * 0.3);
      c.fill();
    } else if (id === 'hand') {
      c.fillRect(x - s * 0.5, y - s * 0.1, s, s * 0.7);
      for (let i = 0; i < 3; i++) c.fillRect(x - s * 0.4 + i * s * 0.32, y - s * 0.6, s * 0.22, s * 0.55);
    } else if (id === 'eye') {
      c.beginPath(); c.ellipse(x, y, s, s * 0.6, 0, 0, 7); c.fillStyle = '#f0f0f0'; c.fill();
      c.fillStyle = col; c.beginPath(); c.arc(x, y, s * 0.34, 0, 7); c.fill();
    } else if (id === 'brain') {
      c.beginPath(); c.arc(x - s * 0.35, y, s * 0.55, 0, 7); c.fill();
      c.beginPath(); c.arc(x + s * 0.35, y, s * 0.55, 0, 7); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - s * 0.6, y); c.lineTo(x + s * 0.6, y); c.stroke();
    } else if (id === 'spine') {
      for (let i = 0; i < 4; i++) c.fillRect(x - s * 0.3, y - s * 0.9 + i * s * 0.55, s * 0.6, s * 0.4);
    }
  }
  function assemblyPuzzle() {
    return {
      name: 'THE ANATOMY TABLE', boss: false,
      help: "FOLLOW VICTOR'S DIAGRAM — tap each part on the shelf in order",
      winText: "Stitch by stitch, the frame takes its shape upon the slab. All that remains is the spark.",
      loseText: "The pieces will not hold. Victor's hands shake too badly to go on tonight.",
      init(api) {
        this.order = shuffled(PARTS.map((p) => p.id), api);
        this.shelf = shuffled(PARTS.map((p) => p.id), api);
        this.progress = 0; this.mistakes = 0; this.maxMistakes = 4;
        this.placed = {}; this.slotW = (api.W - 40) / 5;
        this.flashT = 0; this.flashOk = true;
      },
      slotRect(i) { return { x: 20 + i * this.slotW, y: 0, w: this.slotW - 8 }; },
      update(api, dt) {
        if (this.flashT > 0) this.flashT -= dt;
        if (!api.pointer.justDown) return;
        const H = api.H, sy = H - 66;
        if (Math.abs(api.pointer.y - sy) > 26) return;
        for (let i = 0; i < this.shelf.length; i++) {
          const r = this.slotRect(i), cx2 = r.x + r.w / 2;
          if (Math.abs(api.pointer.x - cx2) > r.w / 2) continue;
          const id = this.shelf[i];
          if (this.placed[id]) return;
          if (id === this.order[this.progress]) {
            this.placed[id] = true; this.progress++;
            api.addScore(24); api.audio.sfx('coin'); api.burst(cx2, sy, PARTS.find((p) => p.id === id).col, 8);
            this.flashT = 0.3; this.flashOk = true;
            if (this.progress >= this.order.length) { api.addScore(60); api.win(); return; }
          } else {
            this.mistakes++; api.shake(4, 0.2); api.flash('#2a0810', 0.15); api.audio.sfx('hurt');
            this.flashT = 0.3; this.flashOk = false;
            if (this.mistakes >= this.maxMistakes) { api.lose(); return; }
          }
          return;
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        gothicNight(api, t, 0.42);
        // diagram panel — always visible, top-left
        g2.roundRect(8, 24, 78, 118, 5, 'rgba(6,6,14,.82)', C.brassDark, 1);
        api.txtCFit('DIAGRAM', 8 + 39, 30, 6.5, C.brass);
        this.order.forEach((id, i) => {
          const ry = 46 + i * 20, cur = i === this.progress, done = i < this.progress;
          if (cur) g2.roundRect(12, ry - 8, 70, 17, 3, 'rgba(93,255,143,.14)', C.green, 1);
          drawPartIcon(c, id, 26, ry, 6, done ? C.greenDim : PARTS.find((p) => p.id === id).col);
          api.txtCFit(id.toUpperCase(), 58, ry - 4, 6.5, done ? C.greenDim : (cur ? C.cream : C.dim), false, 40);
        });
        // slab with parts assembling
        const scx = W - 66, scy = H * 0.36;
        c.strokeStyle = 'rgba(200,200,220,.18)'; c.lineWidth = 1.4;
        c.strokeRect(scx - 26, scy - 34, 52, 66);
        for (const id in SLAB_SPOT) {
          if (!this.placed[id]) continue;
          const sp = SLAB_SPOT[id];
          drawPartIcon(c, id, scx + sp[0], scy + sp[1], 6.5, PARTS.find((p) => p.id === id).col);
        }
        g2.glow(scx, scy, 40, C.green, 0.06 + 0.08 * (this.progress / this.order.length));
        // shelf
        const sy = H - 66;
        g2.roundRect(6, sy - 28, W - 12, 56, 6, 'rgba(20,14,10,.6)', C.woodDark, 1);
        this.shelf.forEach((id, i) => {
          const r = this.slotRect(i), cx2 = r.x + r.w / 2;
          const done = !!this.placed[id];
          g2.roundRect(r.x, sy - 18, r.w, 36, 4, done ? 'rgba(93,255,143,.08)' : 'rgba(93,255,143,.05)', done ? C.greenDim : C.brassDark, 1);
          drawPartIcon(c, id, cx2, sy, 7, done ? '#2a3a2a' : PARTS.find((p) => p.id === id).col);
          if (done) api.txtC('✓', cx2, sy + 12, 7, C.green);
        });
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,12,.7)', C.woodDark, 1);
        api.txt('ASSEMBLED ' + this.progress + '/' + this.order.length, 10, 8, 8, C.green);
        api.txtCFit('MISTAKES ' + this.mistakes + '/' + this.maxMistakes, W - 62, 8, 8, C.danger, false, 100);
        api.vignette();
      },
    };
  }

  /* --- THE SPARK p2 (boss): THE STORM'S GIFT (lightning-timing revival) --- */
  function revivalStorm() {
    return {
      name: "THE STORM'S GIFT", boss: true,
      help: 'TAP the rod the instant the bolt strikes it',
      winText: 'A convulsive shudder — the dull yellow eye opens. It breathes. It lives.',
      loseText: 'The storm passes overhead. The slab lies cold and still.',
      init(api) {
        this.LANES = [api.W * 0.22, api.W * 0.5, api.W * 0.78];
        this.HIT_Y = api.H - 96;
        this.notes = []; this.spawnT = 0.9; this.need = 14; this.hits = 0; this.miss = 0; this.maxMiss = 5;
      },
      update(api, dt) {
        const H = api.H;
        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          this.notes.push({ lane: api.rint(0, 2), y: -10, speed: 130 + this.hits * 5 });
          this.spawnT = Math.max(0.42, api.rnd(0.55, 0.85) - this.hits * 0.012);
        }
        for (const n of this.notes) n.y += n.speed * dt;
        if (api.pointer.justDown) {
          let best = null, bestD = 30;
          for (const n of this.notes) {
            if (n.hit) continue;
            const lx = this.LANES[n.lane], d = Math.abs(api.pointer.x - lx) + Math.abs(n.y - this.HIT_Y);
            if (Math.abs(api.pointer.x - lx) < 30 && Math.abs(n.y - this.HIT_Y) < 34 && d < bestD) { best = n; bestD = d; }
          }
          if (best) {
            best.hit = true; this.hits++; api.addScore(22); api.audio.tone(880, 0.06, 'square', 0.22);
            api.burst(this.LANES[best.lane], this.HIT_Y, C.green, 8); api.shake(2.4, 0.1);
            if (this.hits >= this.need) { api.addScore(70); api.win(); return; }
          }
        }
        for (const n of this.notes) {
          if (!n.hit && !n.gone && n.y > this.HIT_Y + 20) {
            n.gone = true; this.miss++; api.shake(4, 0.2); api.flash('#1a0830', 0.14); api.audio.sfx('hurt');
            if (this.miss >= this.maxMiss) { api.lose(); return; }
          }
        }
        this.notes = this.notes.filter((n) => !n.gone && n.y < H + 20 && !(n.hit && n.y > this.HIT_Y + 4));
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        gothicNight(api, t, 0.3);
        for (const lx of this.LANES) {
          c.strokeStyle = 'rgba(93,255,143,.18)'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(lx, 26); c.lineTo(lx, this.HIT_Y); c.stroke();
          g2.roundRect(lx - 13, this.HIT_Y - 13, 26, 26, 6, 'rgba(20,10,30,.6)', C.brass, 1.6);
        }
        for (const n of this.notes) {
          if (n.hit) continue;
          const lx = this.LANES[n.lane];
          g2.glow(lx, n.y, 9, C.green, 0.5);
          c.fillStyle = C.greenBright; c.beginPath(); c.arc(lx, n.y, 5, 0, 7); c.fill();
        }
        g2.bigSprite(CREATURE_ROWS, W / 2 - 24, H - 70, CREATURE_PAL, 5, { outline: true, shadow: true });
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,12,.7)', C.woodDark, 1);
        api.txt('CHARGE ' + this.hits + '/' + this.need, 10, 8, 8, C.green);
        api.txtCFit('LOST ' + this.miss + '/' + this.maxMiss, W - 56, 8, 8, C.danger, false, 96);
        api.vignette(); api.scanlines();
      },
    };
  }

  /* --- INTO THE WORLD: FLIGHT FROM THE VILLAGE (dodge + collect) --- */
  function mobFlight() {
    return {
      name: 'FLIGHT FROM THE VILLAGE', boss: false,
      help: 'DRAG / ARROW KEYS to steer — dodge torches, catch provisions',
      winText: 'Under cover of night, the Creature slips into the wilderness.',
      loseText: "The mob's torches find him. He retreats into the dark, burned and alone.",
      init(api) {
        this.x = api.W / 2; this.y = api.H - 92; this.hp = 3 + (api.has('steadyspark') ? 1 : 0);
        this.timer = 24; this.items = []; this.spawnT = 0; this.hitFlash = 0; this.msgT = 0; this.msg = '';
      },
      update(api, dt) {
        const W = api.W;
        this.timer -= dt;
        if (this.timer <= 0) { api.addScore(70); api.win(); return; }
        let dir = 0; if (api.keyDown('left')) dir -= 1; if (api.keyDown('right')) dir += 1;
        if (dir) this.x += dir * 150 * dt;
        else if (api.pointer.down) this.x += clamp(api.pointer.x - this.x, -150 * dt, 150 * dt);
        this.x = clamp(this.x, 18, W - 18);
        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          this.spawnT = api.rnd(0.26, 0.5);
          const isProv = api.chance(0.24);
          this.items.push({ x: api.rnd(14, W - 14), y: -12, speed: isProv ? api.rnd(58, 78) : api.rnd(90, 150 + (24 - this.timer) * 3), kind: isProv ? 'prov' : 'torch' });
        }
        for (const it of this.items) it.y += it.speed * dt;
        if (this.hitFlash <= 0) {
          for (const it of this.items) {
            if (it.gone) continue;
            if (Math.abs(this.x - it.x) < 15 && Math.abs(this.y + 4 - it.y) < 18) {
              it.gone = true;
              if (it.kind === 'torch') {
                this.hp--; api.shake(6, 0.3); api.flash('#ff3a00', 0.2); api.audio.sfx('hurt'); this.hitFlash = 0.7;
                api.burst(it.x, it.y, '#ff8a3d', 10);
                if (this.hp <= 0) { api.lose(); return; }
              } else {
                api.addScore(16); api.audio.sfx('coin'); api.burst(it.x, it.y, C.green, 6);
                this.msg = '+PROVISIONS'; this.msgT = 0.7;
              }
            }
          }
        }
        this.items = this.items.filter((it) => !it.gone && it.y < api.H + 20);
        if (this.hitFlash > 0) this.hitFlash -= dt;
        if (this.msgT > 0) this.msgT -= dt;
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#08060e'], [1, '#100810']]);
        g2.glow(W / 2, H, 170, 'rgba(255,100,20,.9)', 0.16);
        for (let i = 0; i < 7; i++) {
          const tx = 14 + i * 38, th = 70 + (i * 23) % 50;
          c.fillStyle = '#0a0810';
          c.beginPath(); c.moveTo(tx, H - 28); c.lineTo(tx - 14, H - 28 - th * 0.5); c.lineTo(tx - 8, H - 28 - th * 0.5);
          c.lineTo(tx, H - 28 - th); c.lineTo(tx + 8, H - 28 - th * 0.5); c.lineTo(tx + 14, H - 28 - th * 0.5);
          c.closePath(); c.fill();
        }
        c.fillStyle = '#1a1010'; c.fillRect(0, H - 28, W, 28);
        for (const it of this.items) {
          if (it.gone) continue;
          if (it.kind === 'torch') { c.fillStyle = '#6a3a14'; c.fillRect(it.x - 1, it.y - 8, 3, 14); g2.flame(it.x, it.y - 9, t + it.x, 0.5, { outer: '#ff6020', inner: '#ffb030' }); }
          else { c.fillStyle = C.brassLight; c.beginPath(); c.ellipse(it.x, it.y, 6, 5, 0, 0, 7); c.fill(); }
        }
        if (this.hitFlash > 0 && Math.floor(t * 10) % 2 === 0) c.globalAlpha = 0.4;
        g2.bigSprite(CREATURE_ROWS, this.x - 16, this.y - 34 + Math.sin(t * 8) * 1, CREATURE_PAL, 4, { outline: true });
        c.globalAlpha = 1;
        for (let i = 0; i < this.hp; i++) g2.roundRect(W - 20 - i * 14, 20, 10, 10, 3, C.green, null);
        g2.roundRect(6, H - 12, W - 12, 5, 3, '#1a1028', null);
        g2.roundRect(6, H - 12, Math.round((W - 12) * (this.timer / 24)), 5, 3, C.green, null);
        if (this.msgT > 0) api.txtCFit(this.msg, W / 2, 50, 9, C.green);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,12,.7)', C.woodDark, 1);
        api.txtCFit(Math.ceil(this.timer) + 's', W / 2, 8, 8, C.cream, false, 60);
        api.vignette();
      },
    };
  }

  /* --- THE DE LACEYS: WATCH AND LEARN (hold-lean stealth) --- */
  function cottageWatch() {
    return {
      name: 'WATCH AND LEARN', boss: false,
      help: 'HOLD to lean toward the window · release when the family looks',
      winText: 'Through the glass, the Creature has learned more than language — he has learned longing.',
      loseText: 'Felix sees the shadow at the window. The family scatters in terror.',
      init(api) {
        this.words = 0; this.need = api.has('provisions') ? 10 : 12;
        this.detected = 0; this.maxDetect = api.flags.sympathy ? 4 : 3;
        this.family = [
          { x: 80, y: 220, looking: false, lookT: 0, moveT: api.rnd(1, 2.5) },
          { x: 160, y: 254, looking: false, lookT: 0, moveT: api.rnd(1, 2) },
          { x: 120, y: 288, looking: false, lookT: 0, moveT: api.rnd(1.5, 3) },
        ];
        this.leaning = false; this.leanAmt = 0; this.spawnWord = 0; this.floatWords = [];
      },
      update(api, dt) {
        const W = api.W;
        for (const fm of this.family) {
          fm.moveT -= dt;
          if (fm.moveT <= 0) {
            fm.moveT = api.rnd(0.8, 2.2);
            fm.looking = api.chance(0.28);
            fm.lookT = fm.looking ? api.rnd(0.6, 1.4) : 0;
            if (!fm.looking) fm.x = clamp(fm.x + (api.chance(0.5) ? 1 : -1) * api.rnd(14, 32), 48, W - 48);
          }
          if (fm.looking) { fm.lookT -= dt; if (fm.lookT <= 0) fm.looking = false; }
        }
        this.leaning = api.pointer.down || api.keyDown('up');
        this.leanAmt = clamp(this.leanAmt + (this.leaning ? dt * 2.5 : -dt * 4), 0, 1);
        const anyLooking = this.family.some((f) => f.looking);
        if (this.leaning && anyLooking && this.leanAmt > 0.3) {
          this.detected++; api.shake(5, 0.3); api.flash('#ff3060', 0.2); api.audio.sfx('hurt');
          this.leaning = false; this.leanAmt = 0;
          if (this.detected >= this.maxDetect) { api.lose(); return; }
        }
        if (this.leaning && !anyLooking && this.leanAmt > 0.5) {
          this.spawnWord -= dt;
          if (this.spawnWord <= 0) {
            this.spawnWord = api.rnd(0.42, 0.75); this.words++; api.addScore(9); api.audio.sfx('coin');
            const wl = ['love', 'fire', 'kind', 'word', 'song', 'hope', 'name', 'read'];
            this.floatWords.push({ x: api.W - 50, y: 148, word: api.choice(wl), life: 1.2, vy: -22 });
            if (this.words >= this.need) { api.addScore(65); api.win(); return; }
          }
        }
        this.floatWords.forEach((w) => { w.y += w.vy * dt; w.life -= dt; });
        this.floatWords = this.floatWords.filter((w) => w.life > 0);
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#06050e'], [1, '#0c0810']], H);
        g2.stars(t, 20, 80, 'rgba(200,190,240,0.4)');
        c.fillStyle = '#1c140e'; c.fillRect(30, 110, W - 60, H - 140);
        c.fillStyle = '#160e08';
        c.beginPath(); c.moveTo(14, 110); c.lineTo(W / 2, 46); c.lineTo(W - 14, 110); c.closePath(); c.fill();
        g2.glow(W / 2, 230, 60, C.brassLight, 0.22);
        c.fillStyle = C.brass; c.fillRect(W / 2 - 42, 138, 84, 72);
        c.fillStyle = '#f8e090'; c.fillRect(W / 2 - 38, 142, 76, 64);
        c.save(); c.beginPath(); c.rect(W / 2 - 38, 142, 76, 64); c.clip();
        for (const fm of this.family) {
          c.fillStyle = fm.looking ? '#ff8a60' : '#a87040';
          c.beginPath(); c.arc(fm.x, fm.y, 6, 0, 7); c.fill();
          if (fm.looking) { c.fillStyle = '#fff'; c.fillRect(fm.x - 4, fm.y - 2, 3, 2); c.fillRect(fm.x + 1, fm.y - 2, 3, 2); }
        }
        c.restore();
        c.fillStyle = '#100810'; c.fillRect(0, H - 32, W, 32);
        const leanY = this.leanAmt * 16;
        g2.bigSprite(CREATURE_ROWS, 18, H - 74 - leanY, CREATURE_PAL, 5, { outline: true, shadow: true });
        if (this.leaning) {
          const anyLooking = this.family.some((f) => f.looking);
          g2.roundRect(W - 22, H - 20 - Math.round(60 * this.leanAmt), 12, Math.round(60 * this.leanAmt), 3, anyLooking ? C.danger : C.green, null);
        }
        for (const w of this.floatWords) { c.globalAlpha = clamp(w.life, 0, 1); api.txtCFit('"' + w.word + '"', W - 50, w.y, 9, C.brass, false, 92); c.globalAlpha = 1; }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,12,.7)', C.woodDark, 1);
        api.txt('LEARNED ' + this.words + '/' + this.need, 10, 8, 8, C.brass);
        api.txtCFit('SEEN ' + this.detected + '/' + this.maxDetect, W - 56, 8, 8, C.danger, false, 96);
        api.vignette();
      },
    };
  }

  /* --- THE ALPS: THE ASCENT (precision leap climb) --- */
  function glacierAscent() {
    return {
      name: 'THE ASCENT', boss: false,
      help: 'TAP when the needle sits in the gold band — leap to the next ledge',
      winText: "Face to face at last on the ice, the Creature makes his demand: a companion, or eternal war.",
      loseText: 'The crevasse swallows one attempt too many. Victor climbs down, shaken, to try again another day.',
      init(api) {
        this.need = 8;
        this.spots = [{ x: api.W / 2, y: api.H - 64 }];
        for (let i = 1; i <= this.need; i++) {
          const x = clamp(40 + ((i * 71) % (api.W - 80)), 40, api.W - 40);
          this.spots.push({ x, y: (i % 2 === 0) ? api.H - 64 : api.H - 128 });
        }
        this.cur = 0; this.pos = { x: this.spots[0].x, y: this.spots[0].y };
        this.meter = 0; this.mDir = 1; this.mSpd = 1.1; this.jumping = false; this.jumpT = 0;
        this.mistakes = 0; this.maxMistakes = 4;
        this.halfBand = api.has('warmwords') ? 0.26 : 0.18;
      },
      update(api, dt) {
        if (!this.jumping) {
          this.meter += this.mDir * this.mSpd * dt;
          if (this.meter > 1) { this.meter = 1; this.mDir = -1; } if (this.meter < 0) { this.meter = 0; this.mDir = 1; }
          this.mSpd = Math.min(2.2, 1.1 + this.cur * 0.1);
          if (api.confirm()) {
            if (Math.abs(this.meter - 0.5) <= this.halfBand) {
              this.jumping = true; this.jumpT = 0;
              this.from = { x: this.pos.x, y: this.pos.y }; this.to = this.spots[this.cur + 1];
              api.audio.sfx('jump');
            } else {
              this.mistakes++; api.shake(4, 0.2); api.flash('#0a1830', 0.15); api.audio.sfx('hurt');
              if (this.mistakes >= this.maxMistakes) { api.lose(); return; }
            }
          }
        } else {
          this.jumpT += dt / 0.4;
          if (this.jumpT >= 1) {
            this.jumpT = 1; this.jumping = false; this.cur++;
            this.pos = { x: this.to.x, y: this.to.y };
            api.addScore(20); api.audio.sfx('coin'); api.burst(this.pos.x, this.pos.y, C.frost, 8);
            if (this.cur >= this.need) { api.addScore(80); api.win(); return; }
            this.meter = 0; this.mDir = 1;
          } else {
            this.pos.x = this.from.x + (this.to.x - this.from.x) * this.jumpT;
            this.pos.y = this.from.y + (this.to.y - this.from.y) * this.jumpT - Math.sin(this.jumpT * Math.PI) * 30;
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#182238'], [0.6, '#0e1830'], [1, '#050810']]);
        for (let i = 0; i < 5; i++) {
          const mx = ((i * 60 - t * 6) % (W + 60) + W + 60) % (W + 60) - 30, mh = 60 + (i * 37) % 60;
          c.fillStyle = 'rgba(200,220,255,.10)';
          c.beginPath(); c.moveTo(mx - 30, H * 0.5); c.lineTo(mx, H * 0.5 - mh); c.lineTo(mx + 30, H * 0.5); c.closePath(); c.fill();
        }
        g2.fog(t, { y0: H * 0.44, y1: H * 0.56, color: '#c8e6ff', alpha: 0.06 });
        for (let i = 0; i <= this.need; i++) {
          const sp = this.spots[i], reached = i <= this.cur;
          c.fillStyle = reached ? '#5a7898' : '#c8eeff';
          c.fillRect(sp.x - 22, sp.y - 6, 44, 12);
          c.fillStyle = reached ? '#6a88a8' : '#e8f8ff'; c.fillRect(sp.x - 22, sp.y - 6, 44, 2);
        }
        g2.bigSprite(CREATURE_ROWS, this.pos.x - 12, this.pos.y - 30, CREATURE_PAL, 3, { outline: true });
        if (!this.jumping) {
          const mx = 14, my = H - 22, mw = W - 28;
          g2.roundRect(mx, my, mw, 8, 3, '#0e0a1c', null);
          c.fillStyle = C.brass; c.globalAlpha = 0.6; c.fillRect(mx + (0.5 - this.halfBand) * mw, my, this.halfBand * 2 * mw, 8); c.globalAlpha = 1;
          c.fillStyle = C.cream; c.fillRect(mx + this.meter * mw - 1.5, my - 3, 3, 14);
          api.txtC('LEAP', W / 2, my - 14, 8, C.dim);
        }
        for (let i = 0; i < this.need; i++) g2.roundRect(8 + i * 16, 20, 12, 8, 2, i < this.cur ? C.green : '#1a1028', null);
        api.txtCFit('MISTAKES ' + this.mistakes + '/' + this.maxMistakes, W - 66, 20, 8, C.danger, false, 110);
        api.vignette();
      },
    };
  }

  /* --- THE POLE (boss/finale): THE LONG CHASE NORTH --- */
  function iceChase() {
    return {
      name: 'THE LONG CHASE NORTH', boss: true,
      help: 'DRAG / ARROW KEYS to dodge the cracking ice',
      winText: "Walton's ship rises from the fog. Victor is carried aboard, spent — the Creature vanishes into the white.",
      loseText: 'The ice gives way beneath Victor. He is pulled from the Arctic sea, but the trail is lost.',
      init(api) {
        this.x = api.W / 2; this.dist = 0; this.goal = 2400; this.speed = 90;
        this.hp = 4 + (api.has('steadyfoot') ? 1 : 0); this.floes = []; this.spawnT = 0; this.hitFlash = 0;
        for (let i = 0; i < 8; i++) this.floes.push(this.makeFloe(api, -i * 60 - 20));
      },
      makeFloe(api, y) {
        const isCrack = api.chance(0.3);
        return { x: api.rnd(10, api.W - 10), y: y || -20, w: api.rnd(30, 60), isCrack, crackT: isCrack ? api.rnd(0.5, 1) : 99, broken: false };
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        let dir = 0; if (api.keyDown('left')) dir -= 1; if (api.keyDown('right')) dir += 1;
        if (dir) this.x += dir * 150 * dt;
        else if (api.pointer.down) this.x += clamp(api.pointer.x - this.x, -150 * dt, 150 * dt);
        this.x = clamp(this.x, 14, W - 14);
        this.speed = Math.min(190, 90 + this.dist / 22);
        this.dist += this.speed * dt;
        for (const fl of this.floes) { fl.y += this.speed * dt; if (fl.isCrack) fl.crackT -= dt; }
        this.spawnT -= dt;
        if (this.spawnT <= 0) { this.spawnT = api.rnd(0.3, 0.55); this.floes.push(this.makeFloe(api, -20)); }
        this.floes = this.floes.filter((fl) => fl.y < H + 30);
        const py = H - 66;
        for (const fl of this.floes) {
          if (fl.broken) continue;
          if (Math.abs(this.x - fl.x) < fl.w / 2 + 6 && Math.abs(py - fl.y) < 18) {
            if (fl.isCrack && fl.crackT <= 0 && !fl.broken) {
              fl.broken = true;
              if (this.hitFlash <= 0) {
                this.hp--; this.hitFlash = 0.7; api.shake(5, 0.3); api.flash('#88ccff', 0.2); api.audio.sfx('hurt');
                api.burst(this.x, py, '#88ccff', 8);
                if (this.hp <= 0) { api.lose(); return; }
              }
            }
          }
        }
        if (this.hitFlash > 0) this.hitFlash -= dt;
        if (this.dist >= this.goal) { api.addScore(90); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#060c1a'], [0.5, '#0a1428'], [1, '#141c30']]);
        c.globalAlpha = 0.08 + 0.05 * Math.sin(t * 0.8);
        const aur = c.createLinearGradient(0, 0, W, 0);
        aur.addColorStop(0, C.green); aur.addColorStop(0.5, C.frost); aur.addColorStop(1, C.violet);
        c.fillStyle = aur; c.fillRect(0, 40, W, 120); c.globalAlpha = 1;
        g2.stars(t, 30, 90, '#c8d8ff');
        c.fillStyle = '#0a1828'; c.fillRect(0, H - 20, W, 20);
        for (const fl of this.floes) {
          if (fl.broken) continue;
          const col = fl.isCrack ? (fl.crackT > 0.1 ? '#b0e0f0' : '#88aacc') : '#c8eeff';
          c.fillStyle = col; c.fillRect(fl.x - fl.w / 2, fl.y - 6, fl.w, 12);
          c.fillStyle = '#e8f8ff'; c.fillRect(fl.x - fl.w / 2, fl.y - 6, fl.w, 2);
        }
        if (this.dist > this.goal * 0.72) {
          const shipX = W - 40, shipY = H - 100 - (this.dist - this.goal * 0.72) * 0.15;
          c.fillStyle = '#0e0a18'; c.fillRect(shipX, shipY + 12, 46, 18);
          c.strokeStyle = '#0e0a18'; c.lineWidth = 2; c.beginPath(); c.moveTo(shipX + 23, shipY + 12); c.lineTo(shipX + 23, shipY - 16); c.stroke();
        }
        if (!(this.hitFlash > 0 && Math.floor(t * 10) % 2 === 0)) {
          c.fillStyle = '#5a3a2a'; c.fillRect(this.x - 7, H - 66 - 16, 14, 14);
          c.fillStyle = '#6080c0'; c.fillRect(this.x - 8, H - 66, 16, 14);
        }
        for (let i = 0; i < this.hp; i++) g2.roundRect(8 + i * 14, 20, 10, 10, 3, C.frost, null);
        g2.roundRect(6, H - 10, W - 12, 4, 2, '#1a2040', null);
        g2.roundRect(6, H - 10, Math.round((W - 12) * clamp(this.dist / this.goal, 0, 1)), 4, 2, C.frost, null);
        api.vignette();
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'frankenstein16', title: 'Frankenstein', subtitle: 'THE LABORATORY WALL',
    currency: 'VITALITY', accent: C.green, ownPhaseHud: true,
    titleFont: TITLE, uiFont: UI, superSample: 3,
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.green, blood: C.danger, cream: C.cream, dim: C.dim, ink: C.ink },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'CHOOSE AN INSTRUMENT', mapDone: 'THE CREATURE IS FREE AT LAST',
    screens: {
      overlay: 'rgba(8,6,16,.86)', win: C.green, lose: C.violetLight, chapterLabel: C.dim,
      name: C.cream, sub: C.violetLight, intro: '#e0d8ec', quote: '#5a5670', help: C.green,
      score: C.cream, cur: C.green, cta: C.cream,
    },
    labels: {
      chapter: 'INSTRUMENT', phase: 'STAGE', boss: 'THE RECKONING', score: 'VITALITY',
      win: 'LIFE STIRS', lose: 'THE SPARK FADES', nextPhaseWin: 'HELD FAST',
      cont: 'TAP TO PRESS ON', toMap: 'TAP FOR THE WALL', play: 'TAP TO BEGIN',
      nextPhase: 'TAP TO PRESS ON', toFinale: 'TAP FOR THE DARK',
    },
    upgrades: {
      steadyspark: { name: 'A STEADY SPARK', desc: 'the mob\'s torches find him a little less often' },
      provisions: { name: "TRAVELER'S PROVISIONS", desc: 'less coaxing needed at the cottage window' },
      warmwords: { name: 'WORDS OF WARMTH', desc: 'a surer footing on the glacier ascent' },
      steadyfoot: { name: 'A STEADY FOOT', desc: 'the ice holds a little longer on the long chase north' },
    },
    nodes: [
      {
        id: 'spark', name: 'THE SPARK', sub: 'INGOLSTADT', reward: 60, grant: 'steadyspark',
        intro: ['A DREARY NIGHT OF NOVEMBER.', 'VICTOR STANDS BEFORE THE SLAB', 'HE HAS BUILT FROM STOLEN PARTS.', 'The storm outside is nearly here.'],
        quote: 'It was on a dreary night of November that I beheld the accomplishment of my toils.',
        winText: 'A convulsive shudder — the dull yellow eye opens. It breathes. It lives.',
        phases: [assemblyPuzzle(), revivalStorm()],
      },
      {
        id: 'village', name: 'INTO THE WORLD', sub: 'A FRIGHTENED VILLAGE', needs: ['spark'], reward: 55, grant: 'provisions',
        intro: ['THE CREATURE WALKS INTO A', 'VILLAGE AT DAWN. TORCHES AND', 'STONES FLY AT THE SIGHT OF HIM.', 'Flee before the mob closes in.'],
        quote: 'I, the miserable and the abandoned, am an abortion, to be spurned at, and kicked, and trampled on.',
        winText: 'Under cover of night, the Creature slips into the wilderness.',
        phases: [mobFlight()],
      },
      {
        id: 'delaceys', name: 'THE DE LACEYS', sub: 'A COTTAGE WINDOW', needs: ['village'], reward: 65, grant: 'warmwords',
        intro: ['THE CREATURE SHELTERS BESIDE', 'A COTTAGE. A KIND FAMILY LIVES', 'WITHIN, UNAWARE THEY ARE WATCHED.', 'Learn what love and language are.'],
        quote: "I learned the names of the cottagers themselves... the youth, Felix, who daily collected wood for the family's fire.",
        winText: 'Through the glass, the Creature has learned more than language — he has learned longing.',
        choice: {
          prompt: 'A choice, unseen at the glass: how does the Creature carry what he has learned?',
          hint: 'YOUR ANSWER SHAPES HOW THE TALE ENDS',
          options: [
            { label: 'Step into the light', sub: "Risk the family's fear, hoping for kindness", flag: 'sympathy',
              icon(api, x, y) { const c = api.ctx; c.fillStyle = C.brassLight; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); } },
            { label: 'Stay in the shadow', sub: 'Trust no one — carry the hurt alone', flag: 'vengeance',
              icon(api, x, y) { const c = api.ctx; c.strokeStyle = C.violetLight; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 6, 0.6, 2.6); c.stroke(); } },
          ],
        },
        phases: [cottageWatch()],
      },
      {
        id: 'alps', name: 'THE GLACIER', sub: 'MER DE GLACE', needs: ['delaceys'], reward: 75, grant: 'steadyfoot',
        intro: ['VICTOR CLIMBS INTO THE ALPS,', 'DRAWN BY A FIGURE HE DARES NOT', 'NAME. THE ICE HAS ITS OWN WILL.', 'Reach the reckoning above the fog.'],
        quote: 'I, the true murderer, felt the never-dying worm alive in my bosom.',
        winText: "Face to face at last on the ice, the Creature makes his demand: a companion, or eternal war.",
        phases: [glacierAscent()],
      },
      {
        id: 'arctic', name: 'THE POLE', sub: 'TO THE NORTH', needs: ['alps'], reward: 130,
        intro: ['THE CHASE HAS NO END BUT ONE.', "WALTON'S SHIP WAITS SOMEWHERE", 'IN THE WHITE — IF IT CAN BE FOUND.', 'Cross the last of the breaking ice.'],
        quote: "I shall ascend my funeral pile triumphantly, and exult in the agony of the torturing flames.",
        winText: "Walton's ship rises from the fog. Victor is carried aboard, spent — the Creature vanishes into the white.",
        phases: [iceChase()],
      },
    ],
    endings: [
      { when: (f) => f.sympathy, title: 'THE GRIEVING SILENCE', lines: ['The Creature kneels over Victor\'s body,', 'and Walton hears no boast — only sorrow.', '', 'He vanishes over the ice, borne away', 'to a funeral pyre no one will ever find.'] },
      { when: (f) => f.vengeance, title: 'THE LAST WORD', lines: ['The Creature speaks to Walton only once —', 'a warning, not a confession —', 'then turns from the ship without a', 'backward glance.', '', 'The dark closes over him like water.'] },
      { when: () => true, title: 'INTO THE DARK', lines: ['The Creature is borne away on the ice,', 'farther and farther, until the waves', 'and the darkness close over him.'] },
    ],
    finale: ['THE CREATURE VANISHES INTO THE ARCTIC NIGHT.'],
  });
})();
