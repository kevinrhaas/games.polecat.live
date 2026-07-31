/* ============================================================================
 * MOBY-DICK — THE THREE DAYS' CHASE   (Gen 4 / 16-bit)
 * Melville's epic as an open ship's log: a chart-and-journal spread laid on
 * the Pequod's table. Stow the hold at Nantucket, stand the masthead watch,
 * lower away for the first strike, tend the try-works through the night —
 * then the three days' chase against the White Whale, where Starbuck's plea
 * decides how the tale is told. Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    deep: '#050b12', sea1: '#0d1f30', sea2: '#163049', foam: '#c8dce4',
    ink: '#080c14', dark: '#0f151e', panel: '#0e1720',
    oil: '#e8b04a', gold: '#e8b04a', bone: '#e8ddc4', cream: '#e8ddc4',
    wood: '#3a2818', woodLight: '#5a3f24', iron: '#6a6a72',
    blood: '#8a1a1a', storm: '#2a3a4a', dim: '#7a94a0',
    whale: '#eef0ee', whaleShade: '#c8ccc8', night: '#0a1420',
    shadow: 'rgba(0,0,0,.55)',
  };
  // blocky pixel-grid display face, legible at title size — a fresh pairing,
  // no blackletter risk (UX-sweep #34/#37 finding 1 stays fixed for this build).
  const TITLE = "'Tiny5','Press Start 2P',monospace";

  /* ─── emblem: Ahab's gold doubloon, nailed to the mast ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(cx, cy, 30, C.gold, 0.35);
    c.save();
    c.fillStyle = '#caa03a'; c.beginPath(); c.arc(cx, cy, 20, 0, 7); c.fill();
    c.fillStyle = '#f0c860'; c.beginPath(); c.arc(cx, cy, 17, 0, 7); c.fill();
    c.strokeStyle = '#8a6a1a'; c.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); c.lineTo(cx + Math.cos(a) * 17, cy + Math.sin(a) * 17); c.stroke(); }
    // sun / mountain / tower device, faint
    c.strokeStyle = '#8a6a1a'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx - 8, cy + 6); c.lineTo(cx, cy - 5); c.lineTo(cx + 8, cy + 6); c.stroke();
    c.beginPath(); c.arc(cx, cy - 3, 3, 0, 7); c.stroke();
    // the nail
    c.fillStyle = '#3a2a14'; c.beginPath(); c.arc(cx, cy, 2, 0, 7); c.fill();
    c.restore();
  }

  /* ─── shared: 16-bit sprites ─── */
  const CREW = ['..kk..', '.kffk.', '.tfft.', 'ttTTtt', 'tT..Tt', '.o..o.'];
  const CREWPAL = { k: '#241a10', f: '#c89068', t: '#3a4a54', T: '#4a5c68', o: '#1a1410' };
  const AHAB = ['..hh..', '.hgfg.', '.gffg.', 'gBBBBg', 'gB..Bg', '.p....'];
  const AHABPAL = { h: '#1a1410', g: '#3a2c1c', f: '#c89068', B: '#1c2530', p: '#e8ddc4' };
  const QQEG = ['..hh..', '.hmfmh', '.mfffm', 'mBBBBm', 'mB..Bm', '.o..o.'];
  const QQEGPAL = { h: '#241a10', m: '#4a2e1a', f: '#9a6a48', B: '#6a4a2a', o: '#2a1c10' };

  function drawBoat(api, x, y, t, scale, opts) {
    const g2 = api.g2, c = api.ctx, s = scale || 4, o = opts || {};
    const bob = Math.sin(t * 2.4 + (o.phase || 0)) * 2;
    g2.bigSprite([
      '..mmmmmm..',
      '.hhhhhhhh.',
      'hhhhhhhhhh',
      '.hhhhhhhh.',
    ], x - 5 * s, y - 2 * s + bob, { m: '#4a3018', h: '#2a1c0e' }, s, { shadow: true, outline: '#0a0603' });
    if (!o.noCrew) {
      const rows = o.crew || 3;
      for (let i = 0; i < rows; i++) g2.bigSprite(CREW, x - 3.4 * s + i * 2.4 * s, y - 4.6 * s + bob, CREWPAL, s * 0.62, { outline: '#0a0603' });
    }
    const dip = Math.sin(t * 6) > 0 ? 2 : 4;
    c.strokeStyle = '#1a1008'; c.lineWidth = Math.max(1, s / 2.4);
    for (let i = 0; i < 3; i++) { const ox = x - 3 * s + i * 3 * s; c.beginPath(); c.moveTo(ox, y + bob); c.lineTo(ox - s * 0.8, y + s + dip + bob); c.stroke(); }
  }

  // procedural sperm whale — blunt head, low hump, broad flukes.
  // rise: 0 (submerged) .. 1 (fully surfaced/breaching). white: Moby Dick's pallor.
  function drawWhale(api, x, y, s, t, rise, opts) {
    const c = api.ctx, g2 = api.g2, o = opts || {};
    const body = o.white ? C.whale : (o.color || '#3a4448');
    const shade = o.white ? C.whaleShade : g2.mix(body, '#000', 0.35);
    const flip = o.flip ? -1 : 1;
    c.save();
    c.translate(x, y - rise * 26 * s / 6);
    c.scale(flip, 1);
    // body
    c.fillStyle = shade;
    c.beginPath();
    c.moveTo(-30 * s, 2 * s);
    c.quadraticCurveTo(-30 * s, -14 * s, -6 * s, -16 * s);
    c.quadraticCurveTo(20 * s, -14 * s, 30 * s, 0);
    c.quadraticCurveTo(20 * s, 8 * s, -6 * s, 8 * s);
    c.quadraticCurveTo(-24 * s, 8 * s, -30 * s, 2 * s);
    c.closePath(); c.fill();
    c.fillStyle = body;
    c.beginPath();
    c.moveTo(-30 * s, 0);
    c.quadraticCurveTo(-30 * s, -13 * s, -6 * s, -15 * s);
    c.quadraticCurveTo(18 * s, -13 * s, 28 * s, -1 * s);
    c.quadraticCurveTo(18 * s, 4 * s, -6 * s, 4 * s);
    c.quadraticCurveTo(-24 * s, 5 * s, -30 * s, 0);
    c.closePath(); c.fill();
    // scars (Moby Dick only)
    if (o.white) {
      c.strokeStyle = 'rgba(120,80,60,.5)'; c.lineWidth = s * 0.4;
      c.beginPath(); c.moveTo(-2 * s, -9 * s); c.lineTo(6 * s, -2 * s); c.stroke();
      c.beginPath(); c.moveTo(10 * s, -8 * s); c.lineTo(16 * s, -3 * s); c.stroke();
    }
    // eye
    c.fillStyle = '#1a1410'; c.beginPath(); c.arc(-20 * s, -3 * s, s * 0.9, 0, 7); c.fill();
    // hump/dorsal ridge
    c.fillStyle = shade;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-2 * s + i * 6 * s, -14 * s, 2.4 * s, Math.PI, 0); c.fill(); }
    // tail stock + flukes
    c.fillStyle = body;
    c.save(); c.translate(-30 * s, 1 * s); c.rotate(Math.sin(t * 3) * 0.18 * rise);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-8 * s, -12 * s, -20 * s, -8 * s); c.quadraticCurveTo(-10 * s, -2 * s, -6 * s, 2 * s); c.quadraticCurveTo(-10 * s, 6 * s, -20 * s, 10 * s); c.quadraticCurveTo(-8 * s, 14 * s, 0, 2 * s); c.closePath(); c.fill();
    c.restore();
    c.restore();
  }

  function spout(api, x, y, t) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(x, y - 10, 10, '#dfe8ec', 0.4);
    c.strokeStyle = 'rgba(230,240,244,.85)'; c.lineWidth = 2;
    for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(t * 30 + i) * 5, y - 8 - i * 3); c.stroke(); }
  }

  /* ─── shared night-ocean backdrop (boot/intro/result/finale) ─── */
  function seaScene(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, '#0a1424'], [0.55, '#16283c'], [1, '#2a3a48']], H * 0.4);
    g2.stars(t, 26, H * 0.28, '#d8e4ee');
    g2.glow(W * 0.78, H * 0.16, 22, '#e8ecf0', 0.3); c.fillStyle = '#dfe6ec'; c.beginPath(); c.arc(W * 0.78, H * 0.16, 11, 0, 7); c.fill();
    g2.verticalGradient(0, H * 0.4, W, H * 0.6, [[0, C.sea2], [0.5, C.sea1], [1, C.deep]]);
    c.strokeStyle = 'rgba(170,200,214,.14)';
    for (let i = 0; i < 8; i++) { const sy = H * 0.44 + i * 26; c.beginPath(); for (let x = 0; x <= W; x += 9) c.lineTo(x, sy + Math.sin(t * 1.8 + x * 0.06 + i * 2) * 3); c.stroke(); }
    drawBoat(api, W * 0.34, H * 0.6, t, 5, { noCrew: false, crew: 2 });
    // the Pequod, distant
    api.ctx.fillStyle = '#0e1720';
    api.ctx.fillRect(W * 0.62, H * 0.5, 40, 10);
    api.ctx.fillRect(W * 0.66, H * 0.42, 3, 20);
    api.ctx.fillRect(W * 0.75, H * 0.44, 3, 18);
    g2.embers(t, 8, { yBottom: H * 0.4, yTop: 30, color: '#dfe6ec', speed: 0.05, size: 1, alpha: 0.3 });
    if (dim) { c.fillStyle = 'rgba(4,8,14,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }
  function scenery(api, scene, t) {
    if (scene === 'hub') { drawLog(api, t); return; }
    seaScene(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale') ? 0.6 : 0);
  }

  /* ─── HUB: the ship's log — chart strip up top, dated entries below ─── */
  const ORDER = ['nantucket', 'masthead', 'lowering', 'tryworks', 'chase'];
  function drawLog(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.verticalGradient(0, 0, W, H, [[0, '#20180e'], [1, '#140f08']]);
    // parchment page
    g2.roundRect(8, 6, W - 16, H - 12, 6, '#e6dcc0', '#8a7248', 2);
    c.save(); c.beginPath(); c.roundRect ? c.roundRect(10, 8, W - 20, H - 16, 4) : c.rect(10, 8, W - 20, H - 16); c.clip();
    for (let i = 0; i < 60; i++) { const sx = (i * 53 + 7) % (W - 20) + 10, sy = (i * 97 + 13) % (H - 16) + 8; c.fillStyle = 'rgba(120,96,56,' + (0.04 + 0.03 * ((i * 7) % 3)) + ')'; c.fillRect(sx, sy, 6, 6); }
    c.restore();
    // header: mini chart strip with the voyage line + numbered flags
    g2.roundRect(16, 14, W - 32, 60, 4, 'rgba(230,222,196,.6)', '#a8925e', 1);
    c.save(); c.strokeStyle = 'rgba(120,92,50,.55)'; c.lineWidth = 1.5; c.setLineDash([2, 4]);
    c.beginPath();
    const cx0 = 30, cy0 = 60, cx1 = W - 30, cy1 = 26;
    c.moveTo(cx0, cy0);
    c.bezierCurveTo(70, 24, 150, 56, cx1, cy1);
    c.stroke(); c.restore();
    for (let i = 0; i < 5; i++) {
      const fx = 30 + (W - 60) * (i / 4), fy = 60 - (i / 4) * 34 + Math.sin(i * 1.3) * 4;
      c.fillStyle = i < ORDER.length ? '#8a1a1a' : '#a8925e';
      c.fillRect(fx - 1, fy - 8, 2, 8);
      c.beginPath(); c.moveTo(fx - 1, fy - 8); c.lineTo(fx + 5, fy - 6); c.lineTo(fx - 1, fy - 4); c.closePath(); c.fill();
    }
    api.txt('LOG — THE PEQUOD', 22, 18, 8, '#5a4020');
    api.vignette();
  }
  const menu = {
    title(api, save, t) {
      const g2 = api.g2, W = api.W;
      g2.gleamText('THE LOG', W / 2, 78, api.fitSize('THE LOG', 16, W - 60, 'title'), '#3a2a12', t, { shadow: 'rgba(255,255,255,.35)', gleam: 'rgba(232,176,74,.8)', gleamSpeed: 50, font: TITLE });
      api.txtCFit('OIL BANKED · ' + (save.cur || 0), W / 2, 100, 8, '#6a5230');
    },
    layout() {
      const rows = [
        { id: 'nantucket', y: 118, h: 56 },
        { id: 'masthead', y: 180, h: 56 },
        { id: 'lowering', y: 242, h: 56 },
        { id: 'tryworks', y: 304, h: 56 },
        { id: 'chase', y: 366, h: 74 },
      ];
      return rows.map((r) => ({ x: 16, y: r.y, w: 238, h: r.h }));
    },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, t } = info;
      const wax = node.id === 'chase' ? '#8a1a1a' : '#6a5230';
      g2.roundRect(x, y, w, h, 4, sel ? 'rgba(255,250,230,.9)' : 'rgba(240,232,206,.72)', done ? '#8a1a1a' : (sel ? '#5a4020' : '#a8925e'), sel ? 2 : 1);
      if (sel) g2.glow(x + 26, y + h / 2, 30, C.gold, 0.22 + 0.1 * Math.sin(t * 4));
      // wax seal date-stamp on the left
      c.fillStyle = wax; c.beginPath(); c.arc(x + 24, y + h / 2, 15, 0, 7); c.fill();
      c.save(); c.beginPath(); c.arc(x + 24, y + h / 2, 15, 0, 7); c.clip();
      if (node.icon) node.icon(api, x + 24, y + h / 2);
      c.restore();
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.beginPath(); c.arc(x + 24, y + h / 2, 15, 0, 7); c.stroke();
      api.txtCFit(node.name, x + 26 + (w - 26) / 2 + 20, y + (node.sub ? 12 : h / 2 - 6), 9, '#2a2010', false, w - 66);
      if (node.sub) api.txtCHead(node.sub, x + 46 + (w - 26) / 2 + 20, y + 28, 7, '#6a5838', false, 9, w - 70);
      if (done) { api.txtC('✓', x + w - 16, y + h - 16, 11, '#3a5a12'); }
      if (node.id === 'chase') api.txtCFit(node.optional ? '' : '★ FINAL ENTRY ★', x + w / 2, y + h - 14, 7, sel ? '#8a1a1a' : '#a8552a');
    },
  };

  /* ─── animated title: dusk sea, the ship, the great name ─── */
  function renderBoot(api, info) {
    const g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    seaScene(api, t, 0);
    emblem(api, W / 2, H * 0.17);
    const ts = api.fitSize('MOBY-DICK', 30, W - 20, 'title');
    g2.gleamText('MOBY-DICK', W / 2, H * 0.25, ts, C.gold, t, { bevel: '#fff4d8', shadow: 'rgba(4,8,14,.85)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('THE WHITE WHALE', W / 2, H * 0.25 + ts + 8, 10, '#cfe0e8', true);
    if (info.blink) api.txtCFit('▸ TAP TO SIGN THE ARTICLES ◂', W / 2, H * 0.74, 11, C.cream);
    api.txtCFit('A 16-BIT EPIC · HERMAN MELVILLE, 1851', W / 2, H - 28, 8, '#8aa0ac');
    api.vignette(); api.scanlines();
  }

  /* ============================================================================
   * NODE 1 — NANTUCKET: "STOW THE HOLD"  (sorting: drag falling casks to bay)
   * ========================================================================= */
  function stowHold() {
    const BAYS = [
      { x: 0.22, label: 'STORES', kind: 0, col: '#c8a868' },
      { x: 0.5, label: 'WATER', kind: 1, col: '#4a8ab0' },
      { x: 0.78, label: 'CASKS', kind: 2, col: '#8a6030' },
    ];
    function drawCask(c, x, y, kind, s) {
      const cols = ['#c8a868', '#4a8ab0', '#8a6030'];
      c.fillStyle = cols[kind]; c.fillRect(x - 7 * s, y - 9 * s, 14 * s, 18 * s);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - 7 * s, y - 9 * s, 14 * s, 2 * s); c.fillRect(x - 7 * s, y + 7 * s, 14 * s, 2 * s);
      c.strokeStyle = '#241a10'; c.lineWidth = s; c.strokeRect(x - 7 * s, y - 9 * s, 14 * s, 18 * s);
    }
    return {
      name: 'STOW THE HOLD', help: 'DRAG the cask into its matching bay before it reaches the line',
      winText: 'The manifest is squared away — Queequeg’s tomahawk-pipe seals the bargain.',
      loseText: 'Half the hold is stowed wrong. The mate curses and starts the tally again.',
      init(api) {
        this.need = 8; this.hits = 0; this.miss = 0; this.maxMiss = 4;
        this.sortY = api.H * 0.72; this.item = null; this.spawnT = 0.4; this.grabDx = 0;
      },
      spawnItem(api) { this.item = { kind: api.rint(0, 2), x: api.W / 2, y: 60, vy: 46, grabbed: false }; },
      update(api, dt) {
        const W = api.W;
        if (!this.item) { this.spawnT -= dt; if (this.spawnT <= 0) this.spawnItem(api); return; }
        const it = this.item;
        if (api.pointer.justDown && Math.abs(api.pointer.x - it.x) < 22 && Math.abs(api.pointer.y - it.y) < 22) { it.grabbed = true; }
        if (it.grabbed && api.pointer.down) it.x = clamp(api.pointer.x, 20, W - 20);
        if (api.pointer.justUp) it.grabbed = false;
        it.y += it.vy * dt;
        if (it.y >= this.sortY) {
          const bay = BAYS.reduce((a, b) => (Math.abs(it.x - b.x * W) < Math.abs(it.x - a.x * W) ? b : a));
          if (bay.kind === it.kind && Math.abs(it.x - bay.x * W) < 46) {
            this.hits++; api.addScore(20); api.audio.sfx('coin'); api.burst(it.x, this.sortY, bay.col, 8); api.shake(2, 0.12);
          } else {
            this.miss++; api.audio.sfx('hurt'); api.flash('#8a1a1a', 0.12); api.burst(it.x, this.sortY, '#3a5a7a', 6);
            if (this.miss >= this.maxMiss) return api.lose();
          }
          this.item = null; this.spawnT = 0.15;
          if (this.hits >= this.need) { api.addScore(60); return api.win(); }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        g2.verticalGradient(0, 0, W, H, [[0, '#241a10'], [1, '#0e0a06']]);
        g2.stoneWall(0, H * 0.78, W, H * 0.22, { base: '#241a10', light: '#3a2a18', dark: '#140e08', mortar: '#0a0704', moss: '#241a10' }, 0);
        // gangplank chute
        c.fillStyle = '#3a2a18'; c.fillRect(W / 2 - 30, 30, 60, this.sortY - 30);
        c.strokeStyle = '#1a1208'; c.lineWidth = 2; c.strokeRect(W / 2 - 30, 30, 60, this.sortY - 30);
        // sort line
        c.strokeStyle = 'rgba(232,176,74,.6)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(0, this.sortY); c.lineTo(W, this.sortY); c.stroke(); c.setLineDash([]);
        // bays
        BAYS.forEach((b) => {
          const bx = b.x * W;
          g2.roundRect(bx - 42, this.sortY + 14, 84, H - this.sortY - 30, 6, 'rgba(20,14,8,.7)', b.col, 2);
          api.txtCFit(b.label, bx, this.sortY + 20, 8, b.col);
          drawCask(c, bx, this.sortY + 46, b.kind, 1.6);
        });
        // crew (Queequeg at the rail)
        g2.bigSprite(QQEG, 14, H - 74, QQEGPAL, 4, { shadow: true, outline: '#0a0603' });
        g2.bigSprite(AHAB, W - 40, H - 78, AHABPAL, 4, { shadow: true, outline: '#0a0603' });
        if (this.item) drawCask(c, this.item.x, this.item.y, this.item.kind, this.item.grabbed ? 2.1 : 1.8);
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,7,4,.8)', '#5a4020', 1);
        api.txt('STOWED ' + this.hits + '/' + this.need, 11, 8, 8, C.gold);
        for (let i = 0; i < this.maxMiss; i++) g.rect(W - 46 + i * 13, 8, 9, 8, i < this.maxMiss - this.miss ? '#c84a3a' : '#3a1a14');
        api.vignette();
      },
    };
  }

  /* ============================================================================
   * NODE 2 — THE MASTHEAD  (pan-scan: drag to pan a wide horizon, tap true spouts)
   * ========================================================================= */
  function masthead() {
    return {
      name: 'THE MASTHEAD', help: 'DRAG to pan the glass along the horizon — TAP a true spout before it sinks',
      winText: '"Thar she blows!" Your cry carries to every boat on deck.',
      loseText: 'Your eyes blur with salt and glare. The watch calls you down.',
      init(api) {
        this.worldW = api.W * 3.4; this.camX = this.worldW / 2 - api.W / 2;
        this.need = 6; this.hits = 0; this.miss = 0; this.maxMiss = 5;
        this.sights = []; this.spawnT = 0.6;
      },
      spawn(api) {
        const kind = api.chance(0.42) ? 'whale' : 'decoy';
        this.sights.push({ wx: api.rnd(20, this.worldW - 20), y: api.rnd(api.H * 0.5, api.H * 0.62), kind, t: 0, life: kind === 'whale' ? api.rnd(1.6, 2.2) : api.rnd(1.2, 2.0), hit: false });
      },
      update(api, dt) {
        const W = api.W;
        if (api.pointer.down) this.camX -= api.pointer.dx * 2.1;
        this.camX = clamp(this.camX, 0, this.worldW - W);
        this.spawnT -= dt; if (this.spawnT <= 0 && this.sights.length < 5) { this.spawn(api); this.spawnT = api.rnd(0.55, 0.95); }
        for (const s of this.sights) {
          s.t += dt;
          if (!s.hit && s.t >= s.life) {
            s.dead = true;
            if (s.kind === 'whale') { this.miss++; api.audio.sfx('hurt'); api.flash('#3a5a7a', 0.1); if (this.miss >= this.maxMiss) return api.lose(); }
          }
        }
        if (api.pointer.justDown) {
          const rx = api.pointer.x - W / 2;
          for (const s of this.sights) {
            if (s.dead || s.hit) continue;
            const sx = s.wx - this.camX;
            if (Math.abs(sx - api.pointer.x) < 20 && Math.abs(s.y - api.pointer.y) < 20) {
              s.hit = true; s.dead = true;
              if (s.kind === 'whale') { this.hits++; api.addScore(24); api.audio.sfx('power'); api.burst(sx, s.y, '#dfe8ec', 10); api.shake(3, 0.15); }
              else { this.miss++; api.audio.sfx('hurt'); api.flash('#8a1a1a', 0.1); if (this.miss >= this.maxMiss) return api.lose(); }
              break;
            }
          }
        }
        this.sights = this.sights.filter((s) => !s.dead);
        if (this.hits >= this.need) { api.addScore(70); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        g2.skyGradient([[0, '#7ec4dc'], [0.55, '#bcdce4'], [1, '#e8dcae']], H * 0.42);
        for (let i = 0; i < 3; i++) { const gx = ((t * (10 + i * 5) - this.camX * 0.3) % (W + 40)) - 20 + i * 60; const f = Math.sin(t * 8 + i) > 0; c.strokeStyle = '#2a3a44'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(gx - 5, H * 0.14 + (f ? 2 : -2)); c.lineTo(gx, H * 0.14); c.lineTo(gx + 5, H * 0.14 + (f ? 2 : -2)); c.stroke(); }
        g2.verticalGradient(0, H * 0.42, W, H * 0.58, [[0, C.sea2], [1, C.sea1]]);
        for (const s of this.sights) {
          const sx = s.wx - this.camX; if (sx < -30 || sx > W + 30) continue;
          const p = s.t / s.life;
          if (s.kind === 'whale') {
            g2.glow(sx, s.y, 14 * (1 - p * 0.3), '#dfe8ec', 0.28);
            spout(api, sx, s.y, t);
            c.fillStyle = 'rgba(60,74,80,.9)'; c.beginPath(); c.ellipse(sx, s.y + 8, 12, 4, 0, 0, 7); c.fill();
          } else {
            c.strokeStyle = 'rgba(220,230,236,.5)'; c.lineWidth = 1.5; c.beginPath(); c.arc(sx, s.y, 6 + p * 3, 0, Math.PI); c.stroke();
          }
        }
        // reticle (fixed to screen center)
        c.save(); c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.arc(W / 2, H * 0.5, 22, 0, 7); c.stroke();
        c.beginPath(); c.moveTo(W / 2 - 30, H * 0.5); c.lineTo(W / 2 - 24, H * 0.5); c.moveTo(W / 2 + 24, H * 0.5); c.lineTo(W / 2 + 30, H * 0.5); c.stroke();
        c.beginPath(); c.moveTo(W / 2, H * 0.5 - 30); c.lineTo(W / 2, H * 0.5 - 24); c.moveTo(W / 2, H * 0.5 + 24); c.lineTo(W / 2, H * 0.5 + 30); c.stroke();
        c.restore();
        // crow's-nest rim
        c.fillStyle = '#241a10'; c.beginPath(); c.arc(W / 2, H * 0.92, W * 0.6, Math.PI, 0); c.fill();
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,14,18,.75)', '#3a4a54', 1);
        api.txt('SPOTTED ' + this.hits + '/' + this.need, 11, 8, 8, C.gold);
        for (let i = 0; i < this.maxMiss; i++) g.rect(W - 62 + i * 11, 8, 8, 8, i < this.maxMiss - this.miss ? '#5a7a8a' : '#1e2a30');
        api.vignette();
      },
    };
  }

  /* ============================================================================
   * NODE 3 — LOWER AWAY!  (p1 steer/close-distance, p2 sling-fling harpoon)
   * ========================================================================= */
  function giveChase() {
    return {
      name: 'GIVE CHASE', help: 'DRAG to steer the boat — stay in the wake, dodge the swells',
      winText: 'The whale is within an oar’s length. Stand and ready the iron!',
      loseText: 'The boat ships water and falls off the pace. The whale sounds.',
      init(api) { this.x = api.W / 2; this.z = 0; this.need = 260; this.lives = 3; this.imm = 0; this.marks = []; this.spawnT = 1.0; },
      spawnMark(api) { this.marks.push({ x: api.rnd(26, api.W - 26), y: api.rnd(api.H * 0.5, api.H - 60), t: 1.1, r: 15 }); },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.z += 0.34 * dt * 60; this.imm = Math.max(0, this.imm - dt);
        if (api.pointer.down && api.pointer.y > 60) this.x += (api.pointer.x - this.x) * 0.25;
        this.x = clamp(this.x, 24, W - 24);
        this.spawnT -= dt; if (this.spawnT <= 0) { this.spawnMark(api); this.spawnT = api.rnd(0.65, 1.05); }
        const py = H - 70;
        for (const m of this.marks) {
          m.t -= dt;
          if (m.t <= 0) {
            m.dead = true; api.shake(4, 0.18); api.audio.sfx('explode'); api.burst(m.x, m.y, C.foam, 8);
            if (this.imm <= 0 && Math.abs(m.x - this.x) < m.r + 10 && Math.abs(m.y - py) < m.r + 12) {
              this.lives--; this.imm = 1.2; api.flash(C.blood, 0.22); api.audio.sfx('hurt');
              if (this.lives <= 0) return api.lose();
            }
          }
        }
        this.marks = this.marks.filter((m) => !m.dead);
        api.score = Math.floor(this.z);
        if (this.z >= this.need) { api.addScore(60); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        const hz = H * 0.38;
        g2.skyGradient([[0, '#4a7a94'], [0.6, '#8ac0cc'], [1, '#cfe4dc']], hz);
        drawWhale(api, W - 70, hz - 6, 0.7, t, 0.15, { color: '#3a4448' });
        spout(api, W - 70, hz - 16, t);
        g2.mode7({ horizon: hz, camZ: this.z * 2, angle: Math.sin(t * 0.5) * 0.12, height: 1.2, fog: '#3a5a6a', tex: (wx, wz) => ((Math.floor(wx / 40) + Math.floor(wz / 40)) & 1) ? '#1c4056' : '#153048' });
        for (const m of this.marks) {
          const p = clamp(m.t / 1.1, 0, 1);
          c.strokeStyle = 'rgba(200,230,236,' + (0.7 - p * 0.4) + ')'; c.lineWidth = 2;
          c.beginPath(); c.arc(m.x, m.y, m.r * (0.4 + p * 0.8), 0, 7); c.stroke();
        }
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) drawBoat(api, this.x, H - 70, t, 4, { crew: 3 });
        g2.embers(t, 8, { yBottom: H, yTop: hz, color: '#dfe8ec', speed: 0.12, size: 2, alpha: 0.35 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,14,20,.75)', '#2a4a56', 1);
        api.txt('❤'.repeat(Math.max(0, this.lives)), 11, 8, 9, C.blood);
        api.txtCFit('CLOSING ' + Math.floor(this.z / this.need * 100) + '%', W / 2 + 10, 8, 8, C.cream, false, 76);
        api.vignette();
      },
    };
  }
  function theStrike() {
    return {
      name: 'THE STRIKE', help: 'DRAG BACK from the iron, then RELEASE to fling it at the whale',
      winText: 'Iron finds flank. "Stern all!" — the line runs out smoking.',
      loseText: 'The irons are spent. The whale sounds for open water.',
      init(api) {
        this.need = 3; this.hits = 0; this.throws = 0; this.maxThrows = 7;
        this.wx = api.W * 0.7; this.wy = api.H * 0.42; this.wDir = -1; this.wSpeed = 34;
        this.harpoon = { x: api.W * 0.28, y: api.H * 0.76, dragging: false, dx: 0, dy: 0, flying: false, vx: 0, vy: 0 };
        this.origin = { x: api.W * 0.28, y: api.H * 0.76 };
      },
      update(api, dt) {
        const W = api.W, H = api.H, h = this.harpoon;
        this.wx += this.wDir * this.wSpeed * dt; if (this.wx < W * 0.42 || this.wx > W * 0.88) this.wDir *= -1;
        this.wy = H * 0.4 + Math.sin(api.t * 1.6) * 10;
        if (!h.flying) {
          if (api.pointer.justDown && Math.hypot(api.pointer.x - this.origin.x, api.pointer.y - this.origin.y) < 40) h.dragging = true;
          if (h.dragging && api.pointer.down) { h.dx = clamp(api.pointer.x - this.origin.x, -50, 50); h.dy = clamp(api.pointer.y - this.origin.y, -10, 60); }
          if (h.dragging && api.pointer.justUp) {
            h.dragging = false;
            const pull = Math.hypot(h.dx, h.dy);
            if (pull > 14) {
              h.flying = true; h.x = this.origin.x; h.y = this.origin.y;
              h.vx = -h.dx * 4.4; h.vy = -h.dy * 4.4 - 30;
              this.throws++; api.audio.sfx('shoot');
            } else { h.dx = 0; h.dy = 0; }
          }
        } else {
          h.x += h.vx * dt; h.y += h.vy * dt; h.vy += 46 * dt;
          const dw = Math.hypot(h.x - this.wx, h.y - this.wy);
          if (dw < (api.has('gear') ? 30 : 24)) {
            this.hits++; api.addScore(40); api.audio.sfx('power'); api.shake(6, 0.25); api.flash('#dfe8ec', 0.12); api.burst(h.x, h.y, C.blood, 10);
            h.flying = false; h.dx = 0; h.dy = 0;
            if (this.hits >= this.need) { api.addScore(90); return api.win(); }
          } else if (h.y > H || h.x < 0 || h.x > W) {
            h.flying = false; h.dx = 0; h.dy = 0;
            if (this.throws >= this.maxThrows) return api.lose();
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        g2.skyGradient([[0, '#4a7a94'], [0.6, '#8ac0cc'], [1, '#cfe4dc']], H * 0.32);
        g2.verticalGradient(0, H * 0.32, W, H * 0.68, [[0, C.sea2], [1, C.sea1]]);
        drawWhale(api, this.wx, this.wy, 1.1, t, 0.6, { color: '#3a4448' });
        spout(api, this.wx, this.wy - 24, t);
        drawBoat(api, this.origin.x, this.origin.y + 8, t, 4, { crew: 2 });
        const h = this.harpoon;
        c.save(); c.strokeStyle = '#e8ddc4'; c.lineWidth = 2;
        if (h.dragging) { c.beginPath(); c.moveTo(this.origin.x, this.origin.y); c.lineTo(this.origin.x + h.dx, this.origin.y + h.dy); c.stroke(); }
        const hx = h.flying ? h.x : this.origin.x + h.dx, hy = h.flying ? h.y : this.origin.y + h.dy;
        c.translate(hx, hy);
        const ang = h.flying ? Math.atan2(h.vy, h.vx) : Math.atan2(-h.dy, -h.dx);
        c.rotate(ang);
        c.fillStyle = '#8a8890'; c.fillRect(-14, -1.5, 24, 3);
        c.fillStyle = '#c8c4b8'; c.beginPath(); c.moveTo(10, 0); c.lineTo(2, -4); c.lineTo(2, 4); c.closePath(); c.fill();
        c.restore();
        g2.embers(t, 8, { yBottom: H, yTop: H * 0.32, color: '#dfe8ec', speed: 0.1, size: 2, alpha: 0.3 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,14,20,.75)', '#2a4a56', 1);
        api.txt('IRONS HOME ' + this.hits + '/' + this.need, 11, 8, 8, C.gold);
        for (let i = 0; i < this.maxThrows; i++) g.rect(W - 92 + i * 12, 8, 8, 8, i < this.maxThrows - this.throws ? '#c8c4b8' : '#3a3830');
        api.vignette();
      },
    };
  }

  /* ============================================================================
   * NODE 4 — THE TRY-WORKS  (management: keep the fire banded, skim on cue)
   * ========================================================================= */
  function tryWorks() {
    return {
      name: 'THE TRY-WORKS', help: 'TAP STOKE to keep the flame in the band · TAP SKIM the instant it flashes',
      winText: 'Casks lashed, deck holystoned — the try-works goes cold at last.',
      loseText: 'The flame gutters — or flares too high. The mate calls the watch off.',
      init(api) {
        this.fire = 0.5; this.band = [0.4, 0.76]; this.stokeCd = 0; this.strikes = 0; this.maxStrikes = 3;
        this.overT = 0; this.underT = 0; this.pending = 0; this.banked = 0; this.need = 140;
        this.skim = null; this.skimCd = 0;
      },
      update(api, dt) {
        this.stokeCd = Math.max(0, this.stokeCd - dt);
        this.fire = clamp(this.fire - 0.05 * dt, 0, 1);
        const stokeHit = api.pointer.justDown && api.pointer.y > api.H * 0.62 && api.pointer.x < api.W * 0.5 && this.stokeCd <= 0;
        if (stokeHit) { this.fire = clamp(this.fire + 0.16, 0, 1); this.stokeCd = 0.32; api.audio.sfx('blip'); api.burst(api.W * 0.24, api.H * 0.7, '#ff8030', 5); }
        const inBand = this.fire >= this.band[0] && this.fire <= this.band[1];
        if (inBand) { this.pending += 11 * dt; this.overT = 0; this.underT = 0; }
        else if (this.fire > this.band[1]) { this.overT += dt; if (this.overT > (api.has('nerve') ? 1.6 : 1.1)) { this.strikes++; this.overT = 0; api.flash('#c84a2a', 0.2); api.shake(5, 0.2); api.audio.sfx('hurt'); if (this.strikes >= this.maxStrikes) return api.lose(); } }
        else { this.underT += dt; if (this.underT > (api.has('nerve') ? 2.2 : 1.6)) { this.strikes++; this.underT = 0; api.flash('#2a3a54', 0.2); api.audio.sfx('hurt'); if (this.strikes >= this.maxStrikes) return api.lose(); } }
        if (!this.skim && this.pending >= 22) { this.skim = { t: 0, life: api.has('nerve') ? 1.7 : 1.25 }; }
        if (this.skim) {
          this.skim.t += dt;
          const tapped = api.pointer.justDown && api.pointer.x > api.W * 0.5 && api.pointer.y > api.H * 0.62;
          if (tapped) {
            this.banked += 22; this.pending -= 22; api.addScore(22); api.audio.sfx('coin'); api.burst(api.W * 0.76, api.H * 0.7, C.gold, 10); this.skim = null;
            if (this.banked >= this.need) { api.addScore(50); return api.win(); }
          } else if (this.skim.t >= this.skim.life) { this.pending = Math.max(0, this.pending - 22); this.skim = null; api.flash('#3a2a1a', 0.12); }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        g2.skyGradient([[0, '#0a0e18'], [1, '#141018']], H * 0.36);
        g2.stars(t, 20, H * 0.3, '#d8e0f0');
        g2.verticalGradient(0, H * 0.36, W, H * 0.62, [[0, '#241a10'], [1, '#140e08']]);
        g2.flame(W * 0.24, H * 0.72, t, 3.2 * (0.6 + this.fire * 0.8), { glow: 'rgba(255,140,40,.9)' });
        g2.glow(W * 0.24, H * 0.66, 60 * (0.5 + this.fire), '#e08030', 0.35 + 0.1 * Math.sin(t * 8));
        // try-pot
        g2.roundRect(W * 0.24 - 34, H * 0.6, 68, 26, 6, '#241a10', '#0a0704', 2);
        // fire gauge (left)
        const fx = 24, fy = H * 0.4, fh = H * 0.24;
        g2.roundRect(fx - 8, fy - 6, 26, fh + 12, 5, 'rgba(14,10,6,.8)', '#6a4a24', 1);
        g.rect(fx, fy, 10, fh, '#241a10');
        const bandTop = fy + fh * (1 - this.band[1]), bandH = fh * (this.band[1] - this.band[0]);
        g.rect(fx, bandTop, 10, bandH, 'rgba(120,200,120,.5)');
        g.rect(fx, fy + fh * (1 - this.fire) - 2, 10, 4, this.fire > this.band[1] ? '#ff5030' : this.fire < this.band[0] ? '#4a6a90' : '#ffd060');
        g2.roundRect(W * 0.12, H * 0.66, W * 0.28, 30, 6, this.stokeCd <= 0 ? 'rgba(200,110,40,.9)' : 'rgba(60,40,20,.8)', '#f0c860', 1);
        api.txtCFit('STOKE', W * 0.26, H * 0.675, 9, this.stokeCd <= 0 ? '#241404' : '#8a6a3a');
        // skim button (right)
        const lit = !!this.skim;
        if (lit) g2.glow(W * 0.76, H * 0.68, 34, C.gold, 0.4 + 0.15 * Math.sin(t * 10));
        g2.roundRect(W * 0.6, H * 0.66, W * 0.32, 30, 6, lit ? 'rgba(232,176,74,.95)' : 'rgba(40,34,20,.7)', '#e8b04a', lit ? 2 : 1);
        api.txtCFit(lit ? 'SKIM!' : 'skim', W * 0.76, H * 0.675, lit ? 10 : 9, lit ? '#241404' : '#6a5a3a');
        // deck crew tending
        g2.bigSprite(CREW, W * 0.5, H * 0.78, CREWPAL, 3.4, { outline: '#0a0603' });
        g2.bigSprite(AHAB, W * 0.62, H * 0.76, AHABPAL, 3.6, { shadow: true, outline: '#0a0603' });
        g2.embers(t, 16, { x0: W * 0.1, x1: W * 0.4, yBottom: H * 0.6, yTop: H * 0.1, color: '#ffae4a', speed: 0.16, size: 2, alpha: 0.6 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,7,4,.8)', '#5a4020', 1);
        api.txt('OIL ' + this.banked + '/' + this.need, 11, 8, 8, C.gold);
        for (let i = 0; i < this.maxStrikes; i++) g.rect(W - 46 + i * 13, 8, 9, 8, i < this.maxStrikes - this.strikes ? '#c84a3a' : '#3a1a14');
        api.vignette();
      },
    };
  }

  /* ============================================================================
   * NODE 5 — THE CHASE  (choice, then p1 dodge/spot, p2 boss: the White Whale)
   * ========================================================================= */
  function firstDay() {
    return {
      name: 'THE FIRST DAY', help: 'DRAG to steer clear of the ripple’s line — he rams where the ripple points',
      winText: 'The boats are stove, but the crews swim clear. He sounds — the chase is on.',
      loseText: 'A white flank rises beneath the boat before you can turn.',
      init(api) {
        this.x = api.W / 2; this.time = 22; this.lives = 3 + (api.has('gear') ? 1 : 0); this.imm = 0;
        this.warnLead = api.has('eagle-eye') ? 1.7 : 1.0;
        this.attacks = []; this.spawnT = 1.4;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.time -= dt; this.imm = Math.max(0, this.imm - dt);
        if (api.pointer.down && api.pointer.y > 60) this.x += (api.pointer.x - this.x) * 0.28;
        this.x = clamp(this.x, 24, W - 24);
        this.spawnT -= dt;
        if (this.spawnT <= 0) { this.attacks.push({ x: api.rnd(30, W - 30), warn: this.warnLead, hit: false }); this.spawnT = api.rnd(1.3, 1.9); }
        for (const a of this.attacks) {
          a.warn -= dt;
          if (a.warn <= 0 && !a.resolved) {
            a.resolved = true; api.shake(6, 0.25); api.audio.sfx('explode'); api.burst(a.x, H - 70, C.foam, 10);
            if (this.imm <= 0 && Math.abs(a.x - this.x) < 26) {
              this.lives--; this.imm = 1.2; api.flash(C.blood, 0.22); api.audio.sfx('hurt');
              if (this.lives <= 0) return api.lose();
            }
          }
        }
        this.attacks = this.attacks.filter((a) => !a.resolved || a.warn > -0.4);
        api.addScore(6 * dt);
        if (this.time <= 0) { api.addScore(70); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        g2.skyGradient([[0, '#2a3a48'], [0.5, '#4a6070'], [1, '#8aa4a8']], H * 0.36);
        g2.mode7({ horizon: H * 0.36, camZ: t * 10, angle: Math.sin(t * 0.4) * 0.14, height: 1.2, fog: '#3a4a54', tex: (wx, wz) => ((Math.floor(wx / 40) + Math.floor(wz / 40)) & 1) ? '#1c3040' : '#142838' });
        for (const a of this.attacks) {
          const p = clamp(1 - a.warn / (api.has('eagle-eye') ? 1.7 : 1.0), 0, 1);
          c.strokeStyle = 'rgba(238,240,238,' + (0.3 + p * 0.5) + ')'; c.lineWidth = 2;
          c.beginPath(); c.arc(a.x, H - 90, 8 + p * 20, 0, 7); c.stroke();
          if (a.warn <= 0.35 && a.warn > -0.4) drawWhale(api, a.x, H - 100, 1, t, 0.8, { white: true, flip: a.x > W / 2 });
        }
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) drawBoat(api, this.x, H - 70, t, 4, { crew: 3 });
        g2.embers(t, 10, { yBottom: H, yTop: H * 0.36, color: '#dfe8ec', speed: 0.13, size: 2, alpha: 0.35 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,10,14,.75)', '#3a4a54', 1);
        api.txt('❤'.repeat(Math.max(0, this.lives)), 11, 8, 9, C.blood);
        api.txtCFit('DAY ONE · ' + Math.ceil(this.time) + 's', W / 2 + 12, 8, 8, C.cream, false, 80);
        api.vignette();
      },
    };
  }
  function thirdDay() {
    return {
      name: 'THE THIRD DAY', boss: true, help: 'DRAG BACK the iron & RELEASE at his flank · DRAG to dodge his charge',
      winText: 'The White Whale rolls, spent — and the sea closes over the tale forever.',
      loseText: 'The line snarls. The whale turns, and the boat is matchwood.',
      init(api) {
        this.need = api.has('harpoon') ? 4 : 5;
        this.hits = 0; this.lives = 3 + (api.has('gear') ? 1 : 0); this.imm = 0;
        this.aggro = api.flags.defiant ? 1.35 : 1;
        this.mult = api.flags.defiant ? 1.5 : 1;
        this.x = api.W / 2; this.wx = api.W * 0.66; this.wy = api.H * 0.4; this.wDir = -1;
        this.origin = { x: api.W / 2, y: api.H * 0.8 };
        this.harpoon = { x: 0, y: 0, dragging: false, dx: 0, dy: 0, flying: false, vx: 0, vy: 0 };
        this.attackT = api.rnd(1.6, 2.2) / this.aggro; this.attacks = [];
      },
      update(api, dt) {
        const W = api.W, H = api.H, h = this.harpoon;
        this.imm = Math.max(0, this.imm - dt);
        this.wx += this.wDir * 24 * dt; if (this.wx < W * 0.4 || this.wx > W * 0.9) this.wDir *= -1;
        this.wy = H * 0.36 + Math.sin(api.t * 1.4) * 10;
        this.origin.x = this.x;
        if (api.pointer.down && api.pointer.y > H * 0.6 && !h.dragging) this.x += (api.pointer.x - this.x) * 0.22;
        this.x = clamp(this.x, 30, W - 30);
        this.attackT -= dt;
        if (this.attackT <= 0) { this.attacks.push({ x: api.rnd(30, W - 30), warn: (api.has('nerve') ? 1.3 : 0.9) }); this.attackT = api.rnd(1.7, 2.3) / this.aggro; }
        for (const a of this.attacks) {
          a.warn -= dt;
          if (a.warn <= 0 && !a.resolved) {
            a.resolved = true; api.shake(7, 0.28); api.audio.sfx('explode'); api.burst(a.x, this.origin.y, C.foam, 12);
            if (this.imm <= 0 && Math.abs(a.x - this.x) < 28) {
              this.lives--; this.imm = 1.3; api.flash(C.blood, 0.25); api.audio.sfx('hurt');
              if (this.lives <= 0) return api.lose();
            }
          }
        }
        this.attacks = this.attacks.filter((a) => !a.resolved || a.warn > -0.4);
        if (!h.flying) {
          if (api.pointer.justDown && Math.hypot(api.pointer.x - this.origin.x, api.pointer.y - this.origin.y) < 40) h.dragging = true;
          if (h.dragging && api.pointer.down) { h.dx = clamp(api.pointer.x - this.origin.x, -50, 50); h.dy = clamp(api.pointer.y - this.origin.y, -10, 60); }
          if (h.dragging && api.pointer.justUp) {
            h.dragging = false;
            const pull = Math.hypot(h.dx, h.dy);
            if (pull > 14) { h.flying = true; h.x = this.origin.x; h.y = this.origin.y; h.vx = -h.dx * 4.4; h.vy = -h.dy * 4.4 - 30; api.audio.sfx('shoot'); }
            else { h.dx = 0; h.dy = 0; }
          }
        } else {
          h.x += h.vx * dt; h.y += h.vy * dt; h.vy += 46 * dt;
          const dw = Math.hypot(h.x - this.wx, h.y - this.wy);
          if (dw < (api.has('harpoon') ? 32 : 25)) {
            this.hits++; api.addScore(60 * this.mult); api.audio.sfx('power'); api.shake(8, 0.3); api.flash('#dfe8ec', 0.15); api.burst(h.x, h.y, C.blood, 14);
            h.flying = false; h.dx = 0; h.dy = 0;
            if (this.hits >= this.need) { api.addScore(160 * this.mult); return api.win(); }
          } else if (h.y > H || h.x < 0 || h.x > W) { h.flying = false; h.dx = 0; h.dy = 0; }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        g2.skyGradient([[0, '#1a2430'], [0.5, '#3a4a54'], [1, '#6a7c80']], H * 0.34);
        g2.mode7({ horizon: H * 0.34, camZ: t * 14, angle: Math.sin(t * 0.5) * 0.16, height: 1.25, fog: '#2a3a44', tex: (wx, wz) => ((Math.floor(wx / 38) + Math.floor(wz / 38)) & 1) ? '#182838' : '#122030' });
        drawWhale(api, this.wx, this.wy, 1.25, t, 0.65, { white: true });
        spout(api, this.wx, this.wy - 26, t);
        for (const a of this.attacks) {
          const p = clamp(1 - a.warn / (api.has('nerve') ? 1.3 : 0.9), 0, 1);
          c.strokeStyle = 'rgba(238,240,238,' + (0.3 + p * 0.5) + ')'; c.lineWidth = 2;
          c.beginPath(); c.arc(a.x, this.origin.y, 8 + p * 22, 0, 7); c.stroke();
        }
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) drawBoat(api, this.x, this.origin.y, t, 4, { crew: 2 });
        const h = this.harpoon;
        c.save(); c.strokeStyle = '#e8ddc4'; c.lineWidth = 2;
        if (h.dragging) { c.beginPath(); c.moveTo(this.origin.x, this.origin.y); c.lineTo(this.origin.x + h.dx, this.origin.y + h.dy); c.stroke(); }
        const hx = h.flying ? h.x : this.origin.x + h.dx, hy = h.flying ? h.y : this.origin.y + h.dy;
        c.translate(hx, hy); c.rotate(h.flying ? Math.atan2(h.vy, h.vx) : Math.atan2(-h.dy, -h.dx));
        c.fillStyle = '#8a8890'; c.fillRect(-14, -1.5, 24, 3);
        c.fillStyle = '#c8c4b8'; c.beginPath(); c.moveTo(10, 0); c.lineTo(2, -4); c.lineTo(2, 4); c.closePath(); c.fill();
        c.restore();
        g2.embers(t, 12, { yBottom: H, yTop: H * 0.34, color: '#dfe8ec', speed: 0.14, size: 2, alpha: 0.35 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,10,14,.75)', '#3a4a54', 1);
        api.txt('❤'.repeat(Math.max(0, this.lives)), 11, 8, 9, C.blood);
        api.txtCFit('IRONS HOME ' + this.hits + '/' + this.need, W / 2 + 6, 8, 8, C.gold, false, 100);
        api.vignette();
      },
    };
  }

  /* ================================ assemble =============================== */
  RetroSaga2.create({
    id: 'mobydick-16', title: 'MOBY-DICK', subtitle: 'THE WHITE WHALE', accent: C.gold,
    palette: { ink: C.ink, dark: C.dark, panel: C.panel, gold: C.gold, cream: C.cream, dim: C.dim, blood: C.blood, white: '#f4f0ea', shadow: C.shadow },
    currency: 'OIL', accent: C.gold, ownPhaseHud: true, titleFont: TITLE, uiFont: "'Pixelify Sans','Press Start 2P',monospace", superSample: 3,
    emblem, scenery, map: menu, renderBoot,
    bootCta: 'TAP TO SIGN THE ARTICLES', bootLine: '5 LOG ENTRIES · ONE VOYAGE', credit: 'A 16-BIT TRIBUTE',
    mapHint: 'CHOOSE THE NEXT ENTRY', mapDone: 'THE LOG IS CLOSED',
    upgrades: {
      gear: { name: 'A Well-Found Ship', icon: null, desc: 'The hold stowed true — an extra life at sea.' },
      'eagle-eye': { name: 'The Masthead Eye', icon: null, desc: 'Longer warning before every charge.' },
      harpoon: { name: 'A Steady Iron', icon: null, desc: 'Bigger, surer harpoon strikes.' },
      nerve: { name: 'A Steady Hand', icon: null, desc: 'Wider timing windows under pressure.' },
    },
    nodes: [
      {
        id: 'nantucket', name: 'STOW THE HOLD', sub: 'Nantucket', grant: 'gear', reward: 20,
        icon(api, x, y) { const c = api.ctx; c.fillStyle = '#c8a868'; c.fillRect(x - 5, y - 6, 10, 12); c.strokeStyle = '#3a2a14'; c.lineWidth = 1; c.strokeRect(x - 5, y - 6, 10, 12); },
        intro: ['The Pequod takes on stores at the Nantucket wharf. A tattooed harpooneer named Queequeg signs on beside you — his tomahawk-pipe passed hand to hand seals the bargain.'],
        quote: 'Call me Ishmael.',
        phases: [stowHold()],
      },
      {
        id: 'masthead', name: 'THE MASTHEAD', sub: 'The open Atlantic', grant: 'eagle-eye', reward: 20,
        icon(api, x, y) { const c = api.ctx; c.strokeStyle = '#c8a868'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 5, 0, 7); c.stroke(); },
        intro: ['A hundred feet up, lashed to the swaying crow’s-nest, you scan the horizon for the telltale plume — a puff of white against the blue that means eighty barrels of sperm oil.'],
        quote: 'There she blows! — there she blows! A hump like a snow-hill!',
        phases: [masthead()],
      },
      {
        id: 'lowering', name: 'LOWER AWAY!', sub: 'The first strike', grant: 'harpoon', reward: 30,
        icon(api, x, y) { const c = api.ctx; c.strokeStyle = '#8a8890'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 6, y + 6); c.lineTo(x + 6, y - 6); c.stroke(); c.beginPath(); c.moveTo(x + 6, y - 6); c.lineTo(x + 2, y - 8); c.lineTo(x + 8, y - 2); c.closePath(); c.fillStyle = '#c8c4b8'; c.fill(); },
        intro: ['"Lower away!" The boats hit the water at a run. Somewhere ahead, a broad grey back rolls at the surface — close the gap, then stand and throw true.'],
        quote: 'A dead whale or a stove boat!',
        phases: [giveChase(), theStrike()],
      },
      {
        id: 'tryworks', name: 'THE TRY-WORKS', sub: 'Night watch, mid-ocean', grant: 'nerve', reward: 30,
        icon(api, x, y) { const c = api.ctx; c.fillStyle = '#e08030'; c.beginPath(); c.moveTo(x, y - 6); c.quadraticCurveTo(x + 4, y, x, y + 6); c.quadraticCurveTo(x - 4, y, x, y - 6); c.fill(); },
        intro: ['Flames rise from the brick try-works, the only light for a thousand miles. The deck runs slick with oil and smoke — tend the fire, skim the pots, and never let either get away from you.'],
        quote: 'The rushing Pequod, freighted with savages, and laden with fire, and burning a corpse, and plunging into that blackness of darkness.',
        phases: [tryWorks()],
      },
      {
        id: 'chase', name: "THE THREE DAYS' CHASE", sub: 'The White Whale himself', reward: 40,
        icon(api, x, y) { const c = api.ctx; c.fillStyle = '#eef0ee'; c.beginPath(); c.ellipse(x, y, 7, 4, 0, 0, 7); c.fill(); c.fillStyle = '#8a1a1a'; c.fillRect(x - 1, y - 7, 2, 6); },
        intro: ['A white hump breaks the swell at last — the very whale that took Ahab’s leg. Starbuck lays a hand on the captain’s arm before the boats are called away.'],
        quote: 'From Hell’s heart I stab at thee; for hate’s sake I spit my last breath at thee.',
        choice: {
          prompt: 'Starbuck begs one last time to turn for home.', hint: 'YOUR CHOICE CHANGES THE HUNT ITSELF',
          options: [
            { label: 'PRESS ON', sub: "Ahab’s fury — a harder hunt, greater glory", flag: 'defiant',
              icon(api, x, y) { const c = api.ctx; c.fillStyle = '#8a1a1a'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); } },
            { label: 'HEED STARBUCK', sub: 'A steadier boat, a gentler telling', flag: 'mercy',
              icon(api, x, y) { const c = api.ctx; c.fillStyle = '#4a8ab0'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); } },
          ],
        },
        phases: [firstDay(), thirdDay()],
      },
    ],
    endings: [
      {
        when(flags) { return !!flags.defiant; },
        title: 'THE WHALE, THE WHITE WHALE', lines: [
          'The line runs foul; Ahab, lashed to the very flank he hated, vanishes with the whale beneath the sea.',
          'The Pequod circles once and is gone. Only the sharks, and the sky, roll over the spot as they rolled five thousand years ago.',
          'One man floats free on Queequeg’s carved coffin — the orphan the sea would not keep — until the Rachel, still hunting her own lost sons, turns and picks him up.',
        ],
      },
      {
        when(flags) { return !!flags.mercy; },
        title: 'A GRIMMER MERCY', lines: [
          'Starbuck’s caution buys nothing from the whale, but it buys the boats a moment — more hands find the wreckage, more voices answer when the Rachel calls across the water.',
          'Ahab goes down all the same; the sea keeps what it is owed. But the telling is gentler, and fewer names are read into the log’s last, water-stained page.',
        ],
      },
    ],
    labels: { chapter: 'ENTRY', phase: 'PART', score: 'CATCH', win: 'ENTRY LOGGED', lose: 'THE WATCH IS LOST', boss: 'THE CHASE', cont: 'TAP TO CONTINUE', toMap: 'TAP FOR THE LOG', play: 'TAP TO BEGIN', nextPhase: 'TAP TO PRESS ON', toFinale: 'TAP FOR THE LAST PAGE' },
    screens: { win: C.gold, lose: C.blood, chapterLabel: C.dim, name: C.gold, sub: '#a8552a', intro: C.cream, quote: C.dim, help: C.gold, score: C.cream, cur: C.gold, cta: C.cream, overlay: 'rgba(6,10,14,.84)' },
  });
})();
