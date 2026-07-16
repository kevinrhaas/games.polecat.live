/* ============================================================================
 * THE WAR OF THE WORLDS   (Gen 4 / 16-bit)
 * Wells' invasion as a war-room dispatch map of Surrey and London: red
 * Martian zones spread across the chart, each dispatch a run of trials ending
 * in an ordeal. The field-glass, shrapnel shells, a still nerve and the
 * Thunder Child's cheer carry through the war; one message sent from Horsell
 * decides whose story the ending tells. Built on RetroEngine + RetroGfx2 +
 * RetroSaga2. CRT/phosphor styling is deliberate — this is 1898 sci-fi.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    ink: '#060a08', field: '#0a1410', panel: '#0c1810',
    mars: '#e83820', marsD: '#8a1a10', beam: '#ff6a4a',
    phos: '#5aff8a', phosD: '#1a7a3a', amber: '#ffb24a',
    smoke: '#2a2a32', sepia: '#c8b890', cream: '#e8f0e0', dim: '#7a9a80',
    sky1: '#1a2a2a', brass: '#c9a14a',
  };
  // techy terminal pixel face — sanctioned CRT look for genuine 1898 sci-fi.
  const TITLE = "'Workbench','Press Start 2P',monospace";

  /* ─── emblem: a tripod hood, red eye burning ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(cx, cy - 4, 34, C.mars, 0.4);
    api.gfx.sprite([
      '..gggggg..',
      '.gGGGGGGg.',
      'gGGGGGGGGg',
      'gGGreeeGGg',
      '.gGGGGGGg.',
      '..gguugg..',
    ], cx - 30, cy - 22, { g: '#2a3a30', G: '#3e5646', r: '#ff8a6a', e: C.mars, u: '#1a2a20' }, 6);
    // three jointed legs
    c.strokeStyle = '#2a3a30'; c.lineWidth = 4;
    [[-1, -18], [0, 0], [1, 18]].forEach((L) => {
      c.beginPath(); c.moveTo(cx + L[1] * 0.6, cy + 12);
      c.lineTo(cx + L[1], cy + 26); c.lineTo(cx + L[1] * 1.3, cy + 38); c.stroke();
    });
    const p = 0.5 + 0.5 * Math.sin((api.t || 0) * 3);
    g2.glow(cx, cy - 4, 10, C.mars, 0.5 + 0.3 * p);
  }

  /* ─── shared scene: burning Surrey skyline, striding tripods, green flares ─ */
  function warScene(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, '#0c1414'], [0.45, '#2a2018'], [0.8, '#6a2a14'], [1, '#8a3418']]);
    g2.stars(t, 20, H * 0.3, '#a8c8b0');
    // green Martian flare rising and falling
    const fp = (t * 0.23) % 1;
    if (fp < 0.5) { const fy = H * 0.5 - fp * 140; g2.glow(W * 0.78, fy, 12, C.phos, 0.6 * (1 - fp * 2)); c.fillStyle = C.phos; c.fillRect(W * 0.78 - 1, fy, 3, 8); }
    // burning horizon towns
    for (const bx of [30, 110, 210]) {
      g2.glow(bx, H * 0.62, 26, '#ff7030', 0.3 + 0.08 * Math.sin(t * 6 + bx));
      g2.flame(bx, H * 0.63, t, 0.9 + (bx % 3) * 0.2);
    }
    c.fillStyle = '#0a0e0a';
    c.beginPath(); c.moveTo(0, H * 0.66);
    for (let x = 0; x <= W; x += 12) c.lineTo(x, H * 0.66 - Math.abs(Math.sin(x * 0.05 + 2)) * 10);
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    // two distant tripods striding
    for (const [tx, sc, ph] of [[W * 0.24, 1, 0], [W * 0.7, 0.7, 2]]) {
      const ty = H * 0.60, step = Math.sin(t * 1.8 + ph);
      c.fillStyle = '#101a14';
      c.beginPath(); c.ellipse(tx, ty - 46 * sc, 16 * sc, 10 * sc, 0, 0, 7); c.fill();
      c.strokeStyle = '#101a14'; c.lineWidth = 3 * sc;
      [[-14 - step * 5, 0], [0, step * 6], [14 + step * 5, 0]].forEach((L) => {
        c.beginPath(); c.moveTo(tx, ty - 40 * sc); c.lineTo(tx + L[0], ty - 14 * sc + L[1]); c.lineTo(tx + L[0] * 1.4, ty + 6); c.stroke();
      });
      const e = 0.5 + 0.5 * Math.sin(t * 4 + ph);
      g2.glow(tx, ty - 46 * sc, 8 * sc, C.mars, 0.5 * e);
      c.fillStyle = C.mars; c.fillRect(tx - 2 * sc, ty - 48 * sc, 4 * sc, 3 * sc);
    }
    // drifting black smoke
    g2.fog(t * 0.7, { y0: H * 0.62, y1: H, bands: 5, color: '#181820', alpha: 0.16 });
    g2.embers(t, 14, { yBottom: H, yTop: H * 0.3, color: '#ff8040', speed: 0.12, size: 2, alpha: 0.4 });
    if (dim) { c.fillStyle = 'rgba(4,8,6,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }
  function scenery(api, scene, t) {
    if (scene === 'hub') { drawWarMap(api, t); return; }
    warScene(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale') ? 0.58 : 0);
  }

  /* ─── HUB: the dispatch map — phosphor chart of Surrey & London ─── */
  const NODES_XY = { horsell: [28, 96], artillery: [156, 148], curate: [24, 232], thames: [152, 288], london: [78, 388] };
  const ORDER = ['horsell', 'artillery', 'thames', 'london'];
  function drawWarMap(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.verticalGradient(0, 0, W, H, [[0, '#08120c'], [1, '#050a06']]);
    // phosphor grid
    c.strokeStyle = 'rgba(90,255,138,.06)'; c.lineWidth = 1;
    for (let x = 0; x < W; x += 24) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    for (let y = 0; y < H; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    // the Thames — a phosphor trace winding down the chart
    c.strokeStyle = 'rgba(90,255,138,.3)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(W - 20, 120);
    c.bezierCurveTo(W - 70, 200, W - 30, 280, W - 90, 330);
    c.bezierCurveTo(W - 150, 380, 60, 380, 30, 440);
    c.stroke();
    // contamination zones spreading from each fallen cylinder (pulsing)
    Object.keys(NODES_XY).forEach((id, i) => {
      const p = NODES_XY[id], cx = p[0] + 48, cy = p[1] + 34;
      const r = 34 + 8 * Math.sin(t * 1.2 + i * 1.7);
      c.strokeStyle = 'rgba(232,56,32,.22)'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke();
      c.strokeStyle = 'rgba(232,56,32,.10)';
      c.beginPath(); c.arc(cx, cy, r + 12, 0, 7); c.stroke();
    });
    // heliograph dashes along the route
    c.save(); c.setLineDash([2, 9]); c.lineDashOffset = -(t * 26) % 1000;
    c.strokeStyle = 'rgba(90,255,138,.7)'; c.lineWidth = 2;
    c.beginPath(); ORDER.forEach((id, i) => { const p = NODES_XY[id], px = p[0] + 48, py = p[1] + 34; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke();
    c.restore();
    // sweeping radar arm from London
    const lp = NODES_XY.london;
    const ang = (t * 0.8) % (Math.PI * 2);
    const grd = c.createRadialGradient(lp[0] + 48, lp[1] + 34, 4, lp[0] + 48, lp[1] + 34, 130);
    grd.addColorStop(0, 'rgba(90,255,138,.14)'); grd.addColorStop(1, 'rgba(90,255,138,0)');
    c.fillStyle = grd;
    c.beginPath(); c.moveTo(lp[0] + 48, lp[1] + 34); c.arc(lp[0] + 48, lp[1] + 34, 130, ang, ang + 0.5); c.closePath(); c.fill();
    // scanline shimmer
    c.fillStyle = 'rgba(90,255,138,.03)';
    const sy = (t * 60) % H; c.fillRect(0, sy, W, 3);
  }
  const ART = {
    horsell(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#141a10'; c.fillRect(x, y, w, h); c.fillStyle = '#0a0e08'; c.beginPath(); c.ellipse(x + w / 2, y + h * 0.7, w * 0.34, h * 0.22, 0, 0, 7); c.fill(); g2.glow(x + w / 2, y + h * 0.7, 16, C.phos, 0.3 + 0.15 * Math.sin(t * 2.6)); c.fillStyle = '#2a3a2a'; c.beginPath(); c.ellipse(x + w / 2, y + h * 0.62, w * 0.2, h * 0.1, 0, 0, 7); c.fill(); },
    artillery(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#101408'; c.fillRect(x, y, w, h); c.fillStyle = '#242a12'; c.fillRect(x, y + h - 10, w, 10); c.fillStyle = '#3a3020'; c.save(); c.translate(x + w * 0.3, y + h - 12); c.rotate(-0.5); c.fillRect(0, -3, 26, 6); c.restore(); c.fillStyle = '#2a2418'; c.beginPath(); c.arc(x + w * 0.3, y + h - 10, 7, 0, 7); c.fill(); const fp = (t * 0.9) % 1; if (fp < 0.3) { g2.glow(x + w * 0.3 + 24, y + h - 26, 10, '#ffd060', 0.6 * (1 - fp / 0.3)); } },
    curate(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#181008'; c.fillRect(x, y, w, h); c.fillStyle = '#241a10'; c.fillRect(x + 4, y + 4, w - 8, h - 8); c.fillStyle = '#0a0604'; c.beginPath(); c.arc(x + w * 0.7, y + h * 0.3, 12, 0, 7); c.fill(); const a = t * 2; c.strokeStyle = '#3a4a34'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w * 0.7, y + h * 0.3); c.quadraticCurveTo(x + w * 0.5 + Math.sin(a) * 8, y + h * 0.6, x + w * 0.36 + Math.cos(a * 0.7) * 6, y + h * 0.75); c.stroke(); g2.glow(x + w * 0.36 + Math.cos(a * 0.7) * 6, y + h * 0.75, 5, C.phos, 0.4); },
    thames(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#0a141c'; c.fillRect(x, y, w, h); c.strokeStyle = 'rgba(140,190,210,.4)'; for (let i = 0; i < 3; i++) { c.beginPath(); const yy = y + h * 0.5 + i * 6; c.moveTo(x, yy); for (let xx = 0; xx <= w; xx += 6) c.lineTo(x + xx, yy + Math.sin(t * 3 + xx * 0.4 + i) * 1.5); c.stroke(); } c.fillStyle = '#101418'; c.fillRect(x + w * 0.44, y + h * 0.2, 12, h * 0.4); g2.glow(x + w * 0.5, y + h * 0.25, 8, C.mars, 0.4 + 0.2 * Math.sin(t * 4)); c.fillStyle = '#1a1408'; c.fillRect(x + 6, y + h * 0.62, 22, 8); c.fillStyle = '#3a2c14'; c.fillRect(x + 10, y + h * 0.56, 4, 6); },
    london(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#100a0a'; c.fillRect(x, y, w, h); c.fillStyle = '#1a1210'; for (let i = 0; i < 5; i++) c.fillRect(x + 4 + i * (w / 5), y + h * 0.4 + (i % 2) * 8, w / 6, h * 0.6); c.fillStyle = 'rgba(232,56,32,.5)'; for (let i = 0; i < 8; i++) { const vx = x + ((i * 37) % (w - 8)) + 4, vy = y + h * 0.5 + ((i * 53) % (h * 0.4)); c.fillRect(vx, vy, 5, 2); c.fillRect(vx + 2, vy - 2, 2, 6); } const cp = (t * 0.6 + 0.3) % 1; c.fillStyle = '#0a0808'; c.fillRect(x + w * 0.2 + cp * w * 0.5, y + 8, 3, 2); },
  };
  const menu = {
    title(api, save, t) {
      const c = api.ctx, g2 = api.g2, W = api.W;
      g2.roundRect(18, 10, W - 36, 42, 3, 'rgba(8,20,12,.95)', C.phosD, 2);
      c.fillStyle = 'rgba(90,255,138,.08)'; c.fillRect(18, 10, W - 36, 12);
      g2.gleamText('THE DISPATCH MAP', W / 2, 16, api.fitSize('THE DISPATCH MAP', 13, W - 56, 'title'), C.phos, t, { shadow: 'rgba(0,0,0,.8)', gleam: 'rgba(220,255,230,.9)', gleamSpeed: 70, font: TITLE });
      const bl = Math.floor(t * 2) % 2;
      api.txtCFit((bl ? '▮ ' : '  ') + 'DISPATCHES  ' + (save.cur || 0), W / 2, 37, 9, C.amber);
    },
    layout() { return ['horsell', 'artillery', 'curate', 'thames', 'london'].map((id) => ({ x: NODES_XY[id][0], y: NODES_XY[id][1], w: 96, h: 72 })); },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, t } = info;
      const cx = x + w / 2, ih = h - 16;
      if (sel) g2.glow(cx, y + ih / 2, 52, C.phos, 0.25 + 0.12 * Math.sin(t * 4));
      // a field-telegram card pinned to the chart
      g2.softShadow(x + 2, y + 3, w, ih, 5, 'rgba(0,0,0,.6)');
      g2.roundRect(x, y, w, ih, 3, 'rgba(10,18,12,.96)', done ? C.brass : (sel ? C.phos : '#2a4a34'), sel ? 2 : 1);
      c.save(); c.beginPath(); c.rect(x + 4, y + 4, w - 8, ih - 22); c.clip();
      if (ART[node.id]) ART[node.id](api, x + 4, y + 4, w - 8, ih - 22, t);
      c.restore();
      // punched-tape name strip
      c.fillStyle = 'rgba(90,255,138,.10)'; c.fillRect(x + 4, y + ih - 16, w - 8, 12);
      api.txtCFit((node.optional ? '◆ ' : '▸ ') + node.name, cx, y + ih - 14, 7, sel ? C.phos : '#9adfae', false, w - 12);
      if (done) {
        c.save(); c.translate(cx, y + ih / 2); c.rotate(-0.18); c.globalAlpha = 0.9;
        c.strokeStyle = C.amber; c.lineWidth = 2; c.strokeRect(-32, -8, 64, 16);
        api.txtC('CLEARED', 0, -6, 9, C.amber); c.restore();
      }
      if (sel) { const bl = Math.floor(t * 3) % 2; if (bl) api.txtC('▮', x + w - 10, y + 4, 9, C.phos); }
    },
  };

  /* ─── animated title: red planet rising over a burning common ─── */
  function renderBoot(api, info) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    warScene(api, t, 0.1);
    // Mars, baleful, above
    g2.glow(W / 2, H * 0.15, 34, C.mars, 0.5);
    c.fillStyle = '#c83018'; c.beginPath(); c.arc(W / 2, H * 0.15, 15, 0, 7); c.fill();
    c.fillStyle = '#a82810'; c.beginPath(); c.arc(W / 2 - 4, H * 0.13, 6, 0, 7); c.arc(W / 2 + 6, H * 0.18, 4, 0, 7); c.fill();
    const ts = api.fitSize('THE WAR OF', 26, W - 30, 'title');
    const ts2 = api.fitSize('THE WORLDS', 30, W - 24, 'title');
    g2.gleamText('THE WAR OF', W / 2, H * 0.26, ts, C.cream, t, { bevel: '#fff', shadow: 'rgba(0,0,0,.8)', gleamSpeed: 65, font: TITLE });
    g2.gleamText('THE WORLDS', W / 2, H * 0.26 + ts + 6, ts2, C.mars, t + 0.4, { bevel: '#ff9a80', shadow: 'rgba(0,0,0,.85)', gleamSpeed: 65, font: TITLE });
    api.txtCFit('NO ONE WOULD HAVE BELIEVED…', W / 2, H * 0.26 + ts + ts2 + 16, 9, C.phos, true);
    if (info.blink) api.txtCFit('▸ TAP TO SOUND THE ALARM ◂', W / 2, H * 0.72, 11, C.cream);
    api.txtCFit('A 16-BIT INVASION · H. G. WELLS, 1898', W / 2, H - 28, 8, C.dim);
    api.vignette(); api.scanlines();
  }

  /* ============================ 16-bit sprites ============================ */
  const NARRATOR_A = [
    '..hhhh..', '.hHHHHh.', '.hsffsh.', '..ffff..', '.kJJJJk.',
    'kJJwwJJk', 'kJw..wJk', '.kJ..Jk.', '.tt..tt.', 'oo....oo',
  ];
  const NARRATOR_B = [
    '..hhhh..', '.hHHHHh.', '.hsffsh.', '..ffff..', '.kJJJJk.',
    'kJJwwJJk', '.kJwwJk.', 'tkJ..Jkt', 'o.t..t.o', '.o....o.',
  ];
  const NPAL = { h: '#2a2018', H: '#4a3a28', s: '#1a140c', f: '#d8b088', k: '#141210', J: '#3a3e46', w: '#5a6068', t: '#2a2420', o: '#181410' };
  const GUNNER = ['..cc..', '.cffc.', '.cffc.', 'rRRRRr', 'rR..Rr', '.o..o.'];
  const GUNPAL = { c: '#3a4a2a', f: '#d8a878', r: '#2a3418', R: '#3e4a24', o: '#1a2010' };
  const TRIPOD_HOOD = ['..gggg..', '.gGGGGg.', 'gGGGGGGg', 'gGreerGg', 'gGGGGGGg', '.gguugg.'];
  const HOODPAL = { g: '#26362c', G: '#3e5646', r: '#ff8a6a', e: '#e83820', u: '#141f18' };
  const TENTACLE_TIP = ['..gg..', '.gGGg.', 'gGeeGg', '.gGGg.', '..gg..'];
  const TENTPAL = { g: '#26362c', G: '#3e5646', e: C.phos };

  function drawTripod(api, x, y, sc, t, opts) {
    const c = api.ctx, g2 = api.g2, o = opts || {};
    const step = Math.sin(t * (o.stride || 2));
    c.strokeStyle = o.leg || '#1a2a20'; c.lineWidth = 3.5 * sc;
    [[-16 - step * 6, 0], [0, step * 7], [16 + step * 6, 0]].forEach((L) => {
      c.beginPath(); c.moveTo(x, y);
      c.lineTo(x + L[0] * sc, y + 18 * sc + L[1] * sc); c.lineTo(x + L[0] * 1.5 * sc, y + 40 * sc); c.stroke();
    });
    g2.bigSprite(TRIPOD_HOOD, x - 16 * sc, y - 12 * sc, HOODPAL, 4 * sc, { outline: '#0a120c', shadow: false });
    const e = 0.5 + 0.5 * Math.sin(t * 5);
    g2.glow(x, y - 4 * sc, 12 * sc, C.mars, (o.eye == null ? 0.5 : o.eye) * e);
  }

  /* ================ HORSELL p1: the pit (push-your-luck watch) ============ */
  function pit() {
    return {
      name: 'THE PIT', boss: false, help: 'HOLD to watch the pit — RELEASE when the mirror flashes',
      winText: 'You have seen enough: it is no meteor. Wire everyone. Everything.',
      loseText: 'A pale hiss of light — the watchers by the pit are no more.',
      init(api) {
        this.watch = 0; this.need = 100; this.burns = 0; this.max = 3;
        this.state = 'calm'; this.stT = api.rnd(1.6, 2.6); this.warnLen = api.has('fieldglass') ? 0.9 : 0.7;
      },
      update(api, dt) {
        this.stT -= dt;
        if (this.state === 'calm' && this.stT <= 0) { this.state = 'warn'; this.stT = this.warnLen; api.audio.sfx('blip'); }
        else if (this.state === 'warn' && this.stT <= 0) { this.state = 'fire'; this.stT = 0.8; api.audio.sfx('power'); }
        else if (this.state === 'fire' && this.stT <= 0) { this.state = 'calm'; this.stT = api.rnd(1.4, 2.4); }
        const watching = api.pointer.down || api.keyDown('a');
        if (watching) {
          if (this.state === 'fire') {
            this.burns++; this.state = 'calm'; this.stT = api.rnd(1.6, 2.6);
            api.shake(8, 0.4); api.flash('#ffe8d0', 0.3); api.audio.sfx('explode');
            if (this.burns >= this.max) return api.lose();
          } else {
            this.watch += 12 * dt; api.addScore(9 * dt);
            if (this.watch >= this.need) { api.addScore(60); return api.win(); }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // twilight on Horsell Common — the sandpit, the cylinder, the crowd
        g2.skyGradient([[0, '#1c2430'], [0.55, '#4a3428'], [1, '#6a4224']], H * 0.5);
        g2.stars(t, 16, H * 0.3, '#c8d0c0');
        // heat shimmer pines
        c.fillStyle = '#141a10';
        for (const px of [20, 52, W - 40, W - 70]) { c.beginPath(); c.moveTo(px - 10, H * 0.5); c.lineTo(px, H * 0.30); c.lineTo(px + 10, H * 0.5); c.fill(); }
        g2.verticalGradient(0, H * 0.5, W, H * 0.5, [[0, '#3a3020'], [1, '#181408']]);
        // the pit
        c.fillStyle = '#241c10'; c.beginPath(); c.ellipse(W / 2, H * 0.56, 96, 30, 0, 0, 7); c.fill();
        c.fillStyle = '#0e0a06'; c.beginPath(); c.ellipse(W / 2, H * 0.57, 78, 22, 0, 0, 7); c.fill();
        // the half-buried cylinder, its top unscrewing (rotating seam glyphs)
        const warn = this.state === 'warn', firing = this.state === 'fire';
        g2.glow(W / 2, H * 0.55, 44, firing ? '#ffe0c0' : C.phos, firing ? 0.75 : 0.3 + 0.1 * Math.sin(t * 2.4));
        c.fillStyle = '#2e3a30'; c.beginPath(); c.ellipse(W / 2, H * 0.55, 52, 15, 0, 0, 7); c.fill();
        c.fillStyle = '#3e5646'; c.beginPath(); c.ellipse(W / 2, H * 0.53, 46, 12, 0, 0, 7); c.fill();
        c.save(); c.beginPath(); c.ellipse(W / 2, H * 0.53, 46, 12, 0, 0, 7); c.clip();
        for (let i = 0; i < 6; i++) { const gx = W / 2 - 46 + (((t * 14) + i * 17) % 92); c.fillStyle = 'rgba(20,30,24,.8)'; c.fillRect(gx, H * 0.53 - 12, 3, 24); }
        c.restore();
        // the mirror rising — flashes before it fires
        const my = H * 0.53 - 18;
        if (warn && Math.floor(t * 10) % 2) { g2.glow(W / 2, my, 18, '#fff0d0', 0.8); c.fillStyle = '#fff0d0'; }
        else c.fillStyle = firing ? '#ffe0c0' : '#8a9a8e';
        c.beginPath(); c.arc(W / 2, my, 7, 0, 7); c.fill();
        // the heat-ray, when it comes: a white-hot fan over the crowd line
        if (firing) {
          c.save(); c.globalAlpha = 0.5 + 0.2 * Math.sin(t * 30);
          const bg = c.createLinearGradient(0, my, 0, H);
          bg.addColorStop(0, '#fff4e0'); bg.addColorStop(1, 'rgba(255,110,60,0)');
          c.fillStyle = bg;
          c.beginPath(); c.moveTo(W / 2, my); c.lineTo(20, H - 30); c.lineTo(W - 20, H - 30); c.closePath(); c.fill();
          c.restore();
        }
        // crowd silhouettes at the rim (you among them)
        for (let i = 0; i < 7; i++) {
          const px = 30 + i * 36, wob = Math.sin(t * 2 + i * 2) * 1.5;
          c.fillStyle = i === 3 ? '#3a3e46' : '#181410';
          c.fillRect(px - 4, H - 74 + wob, 8, 22); c.beginPath(); c.arc(px, H - 78 + wob, 5, 0, 7); c.fill();
        }
        const watching = api.pointer.down || api.keyDown('a');
        if (watching && !firing) { c.strokeStyle = 'rgba(90,255,138,.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(W / 2 - 110 + 3 * 36, H - 78); c.lineTo(W / 2, H * 0.55); c.stroke(); }
        g2.embers(t, 8, { yBottom: H, yTop: H * 0.4, color: '#8adf9a', speed: 0.05, size: 2, alpha: 0.3 });
        // HUD
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(6,10,8,.85)', C.phosD, 1);
        const stCol = firing ? '#ff6a4a' : warn ? C.amber : C.phos;
        g.rect(11, 8, 8, 8, stCol);
        api.txt(firing ? 'THE RAY!' : warn ? 'IT STIRS…' : 'OBSERVE', 24, 8, 8, stCol);
        g.rect(W - 76, 9, 66, 6, '#12241a'); g.rect(W - 76, 9, 66 * clamp(this.watch / this.need, 0, 1), 6, C.phos);
        for (let i = 0; i < this.max; i++) g.rect(W - 76 + i * 13, 26, 9, 8, i < this.max - this.burns ? C.phos : '#1a2a1a');
        api.vignette(); api.scanlines();
      },
    };
  }
  /* =============== HORSELL p2 (boss): flight from the heat-ray ============ */
  function heatray() {
    return {
      name: 'THE HEAT-RAY', boss: true, help: 'DRAG to flee · stay out of the sweeping ray',
      winText: 'You fall into a ditch as the beam passes — singed, alive, believing.',
      loseText: 'Where you stood, the heather smoulders in a neat black line.',
      init(api) {
        this.x = api.W / 2; this.z = 0; this.need = 320; this.burns = 0; this.max = 3; this.imm = 0;
        this.sweep = null; this.sweepT = api.rnd(1.2, 1.8); this.warnLen = api.has('fieldglass') ? 1.0 : 0.8;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.z += 0.36 * dt * 60; this.imm = Math.max(0, this.imm - dt);
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.25; this.x = clamp(this.x, 20, W - 20);
        this.sweepT -= dt;
        if (!this.sweep && this.sweepT <= 0) {
          const from = Math.random() < 0.5 ? 0 : 1;
          this.sweep = { warn: this.warnLen, fire: 0.9, from, x: from ? W + 20 : -20, band: api.rnd(70, 120) };
          api.audio.sfx('blip');
        }
        if (this.sweep) {
          const s = this.sweep;
          if (s.warn > 0) s.warn -= dt;
          else {
            s.fire -= dt;
            const speed = (W + 40) / 0.9;
            s.x += (s.from ? -1 : 1) * speed * dt;
            const py = H - 74;
            if (this.imm <= 0 && Math.abs(s.x - this.x) < 14) {
              this.burns++; this.imm = 1.2; api.shake(9, 0.4); api.flash('#ffe8d0', 0.3); api.audio.sfx('explode');
              if (this.burns >= this.max) return api.lose();
            }
            if (s.fire <= 0) { this.sweep = null; this.sweepT = api.rnd(1.1, 1.9); }
          }
        }
        api.score = Math.floor(this.z);
        if (this.z >= this.need) { api.addScore(80); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        const hz = H * 0.4;
        // night common burning behind, the tripod striding after you
        g2.skyGradient([[0, '#0a0e14'], [0.6, '#3a1a10'], [1, '#6a2c14']], hz);
        for (const bx of [40, 150, 230]) { g2.glow(bx, hz - 8, 22, '#ff7030', 0.35); g2.flame(bx, hz - 6, t, 1.1); }
        drawTripod(api, W * 0.5 + Math.sin(t * 0.6) * 40, hz - 60, 1.1, t, { stride: 2.4 });
        // mode-7 heath racing under you
        g2.mode7({ horizon: hz, camZ: this.z * 2, angle: Math.sin(t * 0.5) * 0.14, height: 1.15, fog: '#2a1a12', tex: (wx, wz) => { const burnt = ((Math.floor(wx / 52) * 5 + Math.floor(wz / 52) * 3) % 7) === 0; if (burnt) return '#1a1210'; return ((Math.floor(wx / 30) + Math.floor(wz / 30)) & 1) ? '#2a2c16' : '#222410'; } });
        // the sweep: warning line then the white-hot bar
        if (this.sweep) {
          const s = this.sweep, py = H - 74;
          if (s.warn > 0) {
            if (Math.floor(t * 12) % 2) { c.fillStyle = 'rgba(255,110,60,.5)'; c.fillRect(0, py - 2, W, 4); }
            api.txtCFit(s.from ? '◀ THE RAY' : 'THE RAY ▶', W / 2, py - 22, 9, '#ff9a70');
          } else {
            g2.glow(s.x, py, 30, '#fff0d0', 0.8);
            c.fillStyle = '#fff4e0'; c.fillRect(s.x - 5, py - 26, 10, 52);
            c.fillStyle = 'rgba(255,140,70,.6)'; c.fillRect(s.x - 12, py - 20, 24, 40);
            // scorch trail
            c.fillStyle = 'rgba(20,12,8,.55)'; if (s.from) c.fillRect(s.x + 8, py - 3, W - s.x, 6); else c.fillRect(0, py - 3, s.x - 8, 6);
          }
        }
        // fleeing crowd around you
        for (let i = 0; i < 3; i++) {
          const fx = (this.z * 3 + i * 90) % (W + 40) - 20, fy = H - 60 - i * 16;
          g2.bigSprite(['.k.', 'kkk', 'k.k'], fx, fy, { k: '#181410' }, 3);
        }
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) g2.bigSprite(Math.floor(t * 9) % 2 ? NARRATOR_B : NARRATOR_A, this.x - 16, H - 88, NPAL, 4, { shadow: true, outline: '#0a0806' });
        g2.embers(t, 14, { yBottom: H, yTop: hz, color: '#ff9050', speed: 0.16, size: 2, alpha: 0.45 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,6,4,.85)', '#6a2c14', 1);
        api.txt('BURNS ' + this.burns + '/' + this.max, 11, 8, 8, '#ff9a70');
        api.txtCFit('THE WOODS ' + Math.floor(this.z / this.need * 100) + '%', W - 54, 8, 8, C.cream, false, 98);
        api.vignette(); api.scanlines();
      },
    };
  }
  /* ================= ARTILLERY p1: the guns (arc shots) =================== */
  function guns() {
    return {
      name: 'THE GUNS AT WEYBRIDGE', boss: false,
      help: 'DRAG up/down to lay the gun · TAP to fire · lead the stride',
      winText: 'One hood shatters like glass — they can die. The battery cheers.',
      loseText: 'The battery is a row of small fires. The tripods walk on.',
      init(api) {
        this.angle = 0.5; this.shots = []; this.reload = 0;
        this.tripods = [{ x: api.W + 30, sp: 26, hp: 1 }, { x: api.W + 130, sp: 22, hp: 1 }, { x: api.W + 240, sp: 30, hp: 1 }, { x: api.W + 330, sp: 24, hp: 1 }];
        this.killed = 0; this.need = 4; this.lineX = 74;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.reload = Math.max(0, this.reload - dt);
        if (api.pointer.down) this.angle = clamp(1 - (api.pointer.y - 120) / (H - 240), 0.1, 1);
        if (api.pointer.justDown && this.reload <= 0) {
          const a = 0.45 + this.angle * 0.9; // radians above horizontal
          const v = 230;
          this.shots.push({ x: 56, y: H - 116, vx: Math.cos(a) * v, vy: -Math.sin(a) * v });
          this.reload = 0.8; api.audio.sfx('shoot'); api.shake(3, 0.15); api.burst(64, H - 122, '#ffd060', 6);
        }
        for (const s of this.shots) { s.vy += 170 * dt; s.x += s.vx * dt; s.y += s.vy * dt; }
        for (const tp of this.tripods) {
          tp.x -= tp.sp * dt;
          if (tp.x < this.lineX) return api.lose();
          for (const s of this.shots) {
            if (!s.dead && Math.abs(s.x - tp.x) < 20 && Math.abs(s.y - (H - 210)) < 26) {
              s.dead = true; tp.hp--; api.burst(tp.x, H - 210, '#ffd060', 14); api.shake(6, 0.3); api.audio.sfx('explode');
              if (tp.hp <= 0) { tp.dead = true; this.killed++; api.addScore(60); if (this.killed >= this.need) { api.addScore(80); return api.win(); } }
            }
          }
        }
        this.shots = this.shots.filter((s) => !s.dead && s.y < api.H + 10 && s.x < api.W + 20);
        this.tripods = this.tripods.filter((tp) => !tp.dead);
        while (this.tripods.length < this.need - this.killed) this.tripods.push({ x: api.W + api.rnd(30, 120), sp: api.rnd(22, 32), hp: 1 });
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // grey dawn over the Wey meadows
        g2.skyGradient([[0, '#2a3038'], [0.6, '#4a4438'], [1, '#6a5a3a']], H * 0.55);
        g2.glow(W * 0.2, 60, 26, '#d8d0b0', 0.3); c.fillStyle = '#d8d4c0'; c.beginPath(); c.arc(W * 0.2, 60, 11, 0, 7); c.fill();
        g2.parallax(t * 8, [
          { speed: 0.3, draw: (ox) => { c.fillStyle = '#3a3e30'; g2.tiled(ox, 140, (x) => { c.beginPath(); c.moveTo(x, H * 0.55); c.quadraticCurveTo(x + 70, H * 0.48, x + 140, H * 0.55); c.fill(); }); } },
        ]);
        g2.verticalGradient(0, H * 0.55, W, H * 0.45, [[0, '#4a5230'], [1, '#242a14']]);
        // hedgerows
        for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(30,40,18,.8)'; const hy = H * 0.6 + i * 44; c.fillRect(0, hy, W, 7); for (let x = 8; x < W; x += 22) c.beginPath(), c.arc(x, hy + 2, 6, Math.PI, 0), c.fill(); }
        // approaching tripods
        for (const tp of this.tripods) drawTripod(api, tp.x, H - 220, 0.9, t + tp.x, { stride: 3 });
        // the last-stand line
        c.strokeStyle = 'rgba(255,178,74,.4)'; c.setLineDash([4, 6]); c.beginPath(); c.moveTo(this.lineX, H * 0.52); c.lineTo(this.lineX, H - 60); c.stroke(); c.setLineDash([]);
        // the gun emplacement
        c.fillStyle = '#242a14'; c.beginPath(); c.ellipse(56, H - 104, 42, 16, 0, 0, 7); c.fill();
        c.fillStyle = '#3a3020';
        c.save(); c.translate(56, H - 116); c.rotate(-(0.45 + this.angle * 0.9)); c.fillRect(0, -4, 42, 9); c.fillStyle = '#54462c'; c.fillRect(0, -4, 42, 3); c.restore();
        c.fillStyle = '#2a2418'; c.beginPath(); c.arc(56, H - 112, 11, 0, 7); c.fill();
        g2.bigSprite(GUNNER, 22, H - 132, GUNPAL, 4, { shadow: true, outline: '#101408' });
        g2.bigSprite(GUNNER, 84, H - 126, GUNPAL, 4, { shadow: true, outline: '#101408' });
        // shells in flight with tracer arcs
        for (const s of this.shots) {
          g2.glow(s.x, s.y, 8, '#ffd060', 0.6);
          c.fillStyle = '#ffe8a0'; c.beginPath(); c.arc(s.x, s.y, 3, 0, 7); c.fill();
          c.globalAlpha = 0.3; c.fillStyle = '#ffd060'; c.fillRect(s.x - s.vx * 0.02, s.y - s.vy * 0.02, 2, 2); c.globalAlpha = 1;
        }
        // aim arc preview
        c.globalAlpha = 0.25; c.strokeStyle = C.amber; c.beginPath();
        let px = 56, py = H - 116, vx = Math.cos(0.45 + this.angle * 0.9) * 230, vy = -Math.sin(0.45 + this.angle * 0.9) * 230;
        c.moveTo(px, py);
        for (let i = 0; i < 22; i++) { vy += 170 * 0.05; px += vx * 0.05; py += vy * 0.05; c.lineTo(px, py); }
        c.stroke(); c.globalAlpha = 1;
        g2.fog(t, { y0: H * 0.7, y1: H, bands: 3, color: '#8a9a80', alpha: 0.06 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,12,6,.85)', '#4a5230', 1);
        api.txt('FELLED ' + this.killed + '/' + this.need, 11, 8, 8, C.amber);
        api.txtCFit(this.reload > 0 ? 'LOADING…' : 'READY', W - 44, 8, 8, this.reload > 0 ? C.dim : C.phos, false, 80);
        api.vignette(); api.scanlines();
      },
    };
  }
  /* ============== ARTILLERY p2 (boss): the black smoke ==================== */
  function blacksmoke() {
    return {
      name: 'THE BLACK SMOKE', boss: true,
      help: 'DRAG to wheel the gun uphill · TAP to fire when it clears',
      winText: 'One more hood falls before the guns drown. You go with the land.',
      loseText: 'The black vapour pours into the pit like ink into water.',
      init(api) {
        this.x = api.W / 2; this.hp = api.has('shrapnel') ? 2 : 3; this.taken = 0; this.max = 3;
        this.clouds = []; this.spawnT = 0.9; this.reload = 0; this.tx = api.W / 2; this.td = 1;
        this.exposed = false; this.expT = 2.0;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.reload = Math.max(0, this.reload - dt);
        this.tx += this.td * 20 * dt; if (this.tx < 60 || this.tx > W - 60) this.td *= -1;
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.22; this.x = clamp(this.x, 26, W - 26);
        // hood exposure cycles (smoke canisters block your shot otherwise)
        this.expT -= dt;
        if (this.expT <= 0) { this.exposed = !this.exposed; this.expT = this.exposed ? 1.3 : api.rnd(1.2, 1.8); if (this.exposed) api.audio.sfx('blip'); }
        // rolling smoke banks drift down at you
        this.spawnT -= dt;
        if (this.spawnT <= 0) { this.clouds.push({ x: api.rnd(24, W - 24), y: H * 0.36, r: api.rnd(16, 24), s: api.rnd(24, 40) }); this.spawnT = api.rnd(0.7, 1.1); }
        for (const cl of this.clouds) cl.y += cl.s * dt;
        const py = H - 86;
        for (const cl of this.clouds) {
          if (!cl.hit && Math.abs(cl.x - this.x) < cl.r + 10 && Math.abs(cl.y - py) < cl.r + 12) {
            cl.hit = true; this.taken++; api.shake(7, 0.35); api.flash('#181820', 0.4); api.audio.sfx('hurt');
            if (this.taken >= this.max) return api.lose();
          }
        }
        this.clouds = this.clouds.filter((cl) => cl.y < H + 30);
        if (api.pointer.justDown && this.reload <= 0) {
          this.reload = 0.9; api.audio.sfx('shoot'); api.shake(3, 0.12);
          if (this.exposed && Math.abs(api.pointer.x - this.tx) < 34 && api.pointer.y < H * 0.5) {
            this.hp--; api.addScore(70); api.burst(this.tx, H * 0.3, '#ffd060', 16); api.audio.sfx('explode');
            if (this.hp <= 0) { api.addScore(100); return api.win(); }
          }
        }
        api.addScore(4 * dt);
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // a poisoned valley at dusk
        g2.skyGradient([[0, '#1a141c'], [0.6, '#3a2418'], [1, '#4a2c16']], H * 0.4);
        g2.verticalGradient(0, H * 0.4, W, H * 0.6, [[0, '#2e2a1a'], [1, '#14120a']]);
        for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(20,18,10,.6)'; const hy = H * 0.46 + i * 60; c.fillRect(0, hy, W, 5); }
        // the tripod walking the ridge, hood shielded/exposed
        drawTripod(api, this.tx, H * 0.30, 1.2, t, { eye: this.exposed ? 0.8 : 0.2 });
        if (!this.exposed) {
          c.fillStyle = 'rgba(24,24,32,.85)';
          c.beginPath(); c.ellipse(this.tx, H * 0.28, 40, 26, 0, 0, 7); c.fill();
          c.beginPath(); c.ellipse(this.tx - 22, H * 0.31, 22, 15, 0, 0, 7); c.fill();
          c.beginPath(); c.ellipse(this.tx + 24, H * 0.30, 24, 16, 0, 0, 7); c.fill();
        } else if (Math.floor(t * 8) % 2) { c.strokeStyle = 'rgba(255,178,74,.7)'; c.lineWidth = 2; c.beginPath(); c.arc(this.tx, H * 0.28, 40, 0, 7); c.stroke(); api.txtCFit('▸ FIRE! ◂', this.tx, H * 0.28 - 58, 9, C.amber); }
        // smoke banks rolling downhill
        for (const cl of this.clouds) {
          c.fillStyle = 'rgba(22,22,30,.9)';
          c.beginPath(); c.ellipse(cl.x, cl.y, cl.r + 6 + Math.sin(t * 3 + cl.x) * 2, cl.r * 0.7, 0, 0, 7); c.fill();
          c.fillStyle = 'rgba(40,40,52,.8)';
          c.beginPath(); c.ellipse(cl.x - cl.r * 0.4, cl.y - 4, cl.r * 0.6, cl.r * 0.4, 0, 0, 7); c.fill();
          g2.glow(cl.x, cl.y, cl.r, '#181824', 0.3);
        }
        // your gun team, wheeling uphill
        c.fillStyle = '#242a14'; c.beginPath(); c.ellipse(this.x, H - 74, 40, 14, 0, 0, 7); c.fill();
        c.fillStyle = '#3a3020'; c.save(); c.translate(this.x, H - 86); c.rotate(-0.9); c.fillRect(0, -4, 36, 8); c.restore();
        c.fillStyle = '#2a2418'; c.beginPath(); c.arc(this.x, H - 82, 10, 0, 7); c.fill();
        g2.bigSprite(GUNNER, this.x - 34, H - 102, GUNPAL, 4, { shadow: true, outline: '#101408' });
        g2.bigSprite(NARRATOR_A, this.x + 16, H - 106, NPAL, 4, { shadow: true, outline: '#101408' });
        g2.fog(t * 1.2, { y0: H * 0.5, y1: H, bands: 6, color: '#1c1c26', alpha: 0.13 });
        g2.embers(t, 10, { yBottom: H, yTop: H * 0.3, color: '#8a8aa0', speed: 0.07, size: 2, alpha: 0.35 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,8,12,.85)', '#3a3a4a', 1);
        api.txt('HOOD', 11, 8, 8, C.amber);
        for (let i = 0; i < (api.has('shrapnel') ? 2 : 3); i++) g.rect(50 + i * 11, 8, 8, 8, i < this.hp ? C.mars : '#2a1a1a');
        api.txtCFit('SMOKE ' + this.taken + '/' + this.max, W - 48, 8, 8, C.dim, false, 88);
        api.vignette(); api.scanlines();
      },
    };
  }
  /* ============ CURATE'S HOUSE (optional): the searching tentacle ========= */
  function tentacle() {
    return {
      name: 'THE RUINED HOUSE', boss: false,
      help: 'TAP another hiding place BEFORE the tentacle probes yours',
      winText: 'The tentacle withdraws. You breathe again, quiet as dust.',
      loseText: 'Cold metal closes on your ankle and the pantry light goes out.',
      init(api) {
        this.spots = [[46, 210], [138, 186], [226, 214], [70, 330], [196, 330]];
        this.me = 0; this.probes = 0; this.need = 6; this.probe = null; this.gapT = 1.4;
      },
      update(api, dt) {
        if (!this.probe) {
          this.gapT -= dt;
          if (this.gapT <= 0) {
            // it hunts YOUR spot half the time, else a random one
            const target = Math.random() < 0.55 ? this.me : api.rint(0, this.spots.length - 1);
            this.probe = { i: target, warn: api.has('quiet') ? 1.5 : 1.15, strike: 0.55 };
            api.audio.sfx('blip');
          }
        } else {
          const p = this.probe;
          if (p.warn > 0) p.warn -= dt;
          else {
            p.strike -= dt;
            if (p.strike <= 0) {
              if (p.i === this.me) { api.shake(8, 0.4); api.flash('#3a4a34', 0.3); api.audio.sfx('explode'); return api.lose(); }
              this.probes++; api.addScore(25); api.audio.sfx('coin');
              this.probe = null; this.gapT = Math.max(0.8, 1.5 - this.probes * 0.1);
              if (this.probes >= this.need) { api.addScore(70); return api.win(); }
            }
          }
        }
        if (api.pointer.justDown) {
          for (let i = 0; i < this.spots.length; i++) {
            if (i === this.me) continue;
            const s = this.spots[i];
            if (Math.hypot(api.pointer.x - s[0], api.pointer.y - s[1]) < 34) { this.me = i; api.audio.sfx('jump'); break; }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the wrecked kitchen — one wall gone, the machine outside
        g2.verticalGradient(0, 0, W, H, [[0, '#241810'], [1, '#120c06']]);
        // hole in the wall, green Martian light beyond
        g2.glow(W / 2, 70, 90, C.phos, 0.28);
        g2.glow(W / 2, H * 0.6, 150, '#8a5a20', 0.14); // spilled lamp-oil glow
        c.fillStyle = '#0a1208'; c.beginPath();
        c.moveTo(40, 130); c.lineTo(70, 44); c.lineTo(150, 30); c.lineTo(230, 60); c.lineTo(220, 130); c.closePath(); c.fill();
        c.strokeStyle = '#2a2014'; c.lineWidth = 4; c.stroke();
        // the handling-machine silhouette beyond the hole
        c.fillStyle = '#101a12'; c.beginPath(); c.ellipse(150, 84, 30, 16, 0.2, 0, 7); c.fill();
        const e = 0.5 + 0.5 * Math.sin(t * 3.4); g2.glow(150, 80, 10, C.mars, 0.4 * e);
        c.fillStyle = C.mars; c.fillRect(146, 78, 8, 4);
        // wrecked kitchen furniture = the hiding spots
        const FURN = ['dresser', 'table', 'range', 'barrel', 'pantry'];
        for (let i = 0; i < this.spots.length; i++) {
          const s = this.spots[i], mine = i === this.me;
          const hot = this.probe && this.probe.i === i;
          if (hot && Math.floor(t * 10) % 2) g2.glow(s[0], s[1], 34, C.phos, 0.4);
          c.fillStyle = '#3a2812'; c.fillRect(s[0] - 30, s[1] - 22, 60, 44);
          c.fillStyle = '#54381c'; c.fillRect(s[0] - 30, s[1] - 22, 60, 6);
          c.fillStyle = '#241608'; c.fillRect(s[0] - 24, s[1] - 10, 20, 26); c.fillRect(s[0] + 4, s[1] - 10, 20, 26);
          c.fillStyle = '#6a4a24'; c.fillRect(s[0] - 26, s[1] - 12, 2, 30); c.fillRect(s[0] + 24, s[1] - 12, 2, 30);
          if (mine) { g2.bigSprite(['.hh.', 'hffh', '.kk.'], s[0] - 8, s[1] - 4, { h: '#2a2018', f: '#d8b088', k: '#141210' }, 3, { outline: '#080604' }); }
          if (hot) api.txtC('!', s[0], s[1] - 38, 12, '#ff6a4a');
        }
        // THE TENTACLE — segmented, snaking from the hole toward the probed spot
        let tipX = 150 + Math.sin(t * 1.4) * 30, tipY = 140 + Math.cos(t * 1.1) * 10;
        if (this.probe) {
          const p = this.probe, s = this.spots[p.i];
          const prog = p.warn > 0 ? 1 - p.warn / (api.has('quiet') ? 1.5 : 1.15) : 1;
          tipX = 150 + (s[0] - 150) * prog; tipY = 120 + (s[1] - 120) * prog;
        }
        c.strokeStyle = '#26362c'; c.lineWidth = 7; c.lineCap = 'round';
        c.beginPath(); c.moveTo(150, 100);
        c.bezierCurveTo(150 + Math.sin(t * 2) * 30, 150, tipX - 30, tipY - 40, tipX, tipY); c.stroke();
        c.strokeStyle = '#3e5646'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(150, 100);
        c.bezierCurveTo(150 + Math.sin(t * 2) * 30, 150, tipX - 30, tipY - 40, tipX, tipY); c.stroke();
        g2.bigSprite(TENTACLE_TIP, tipX - 9, tipY - 8, TENTPAL, 3, { outline: '#0a120c' });
        g2.glow(tipX, tipY, 10, C.phos, 0.4);
        // dust motes in the green light
        g2.embers(t, 10, { yBottom: H, yTop: 40, color: '#8a9a80', speed: 0.03, size: 1, alpha: 0.4 });
        g2.fog(t * 0.5, { y0: H * 0.7, y1: H, bands: 3, color: '#2a2418', alpha: 0.1 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,6,4,.85)', '#3a2c14', 1);
        api.txt('PROBES ' + this.probes + '/' + this.need, 11, 8, 8, C.phos);
        api.txtCFit('STAY HIDDEN', W - 44, 8, 8, C.dim, false, 80);
        api.vignette(); api.scanlines();
      },
    };
  }
  /* ================= THAMES p1: the exodus (river runner) ================= */
  function exodus() {
    return {
      name: 'THE EXODUS', boss: false, help: 'DRAG to steer the skiff · thread the wreckage and the legs',
      winText: 'Shepperton burns astern. Ahead, smoke on the estuary — and a warship.',
      loseText: 'The skiff splinters; the brown water takes its share of the fleeing.',
      init(api) { this.x = api.W / 2; this.z = 0; this.need = 320; this.lives = api.has('quiet') ? 4 : 3; this.imm = 0; this.obs = []; this.spawnT = 0.7; this.legT = 3.5; },
      update(api, dt) {
        const W = api.W, H = api.H; this.z += 0.36 * dt * 60; this.imm = Math.max(0, this.imm - dt);
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.25; this.x = clamp(this.x, 24, W - 24);
        this.spawnT -= dt;
        if (this.spawnT <= 0) { this.obs.push({ x: api.rnd(24, W - 24), y: H * 0.36, s: api.rnd(2.0, 2.9), kind: api.rint(0, 2) }); this.spawnT = api.rnd(0.55, 1.0); }
        // periodically a tripod leg stamps down a whole lane
        this.legT -= dt;
        if (this.legT <= 0) { this.obs.push({ x: api.rnd(50, W - 50), y: H * 0.36, s: 2.4, kind: 9, w: 26 }); this.legT = api.rnd(3.2, 4.6); api.audio.sfx('power'); }
        for (const o of this.obs) o.y += o.s * dt * 60;
        this.obs = this.obs.filter((o) => o.y < H + 16);
        const py = H - 76;
        if (this.imm <= 0) for (const o of this.obs) {
          const hw = o.kind === 9 ? (o.w || 26) : 15;
          if (Math.abs(o.x - this.x) < hw && Math.abs(o.y - py) < 16) {
            o.y = H + 99; this.lives--; this.imm = 1.3; api.shake(7, 0.35); api.flash('#4a5a6a', 0.25); api.audio.sfx('hurt');
            if (this.lives <= 0) return api.lose();
          }
        }
        api.score = Math.floor(this.z); if (this.z >= this.need) { api.addScore(70); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        const hz = H * 0.36;
        // burning banks, brown river
        g2.skyGradient([[0, '#2a1c14'], [0.7, '#5a2c18'], [1, '#7a3c1c']], hz);
        g2.parallax(this.z, [
          { speed: 0.4, draw: (ox) => { c.fillStyle = '#180f0a'; g2.tiled(ox, 120, (x) => { c.fillRect(x + 8, hz - 34, 26, 34); c.fillRect(x + 44, hz - 24, 30, 24); c.fillStyle = 'rgba(255,120,50,.8)'; c.fillRect(x + 14, hz - 26, 5, 7); c.fillStyle = '#180f0a'; }); } },
        ]);
        for (const bx of [60, 190]) { const fx = (bx - this.z * 0.4 % 240 + 240) % 240 + 15; g2.flame(fx, hz - 30, t, 1.0); }
        // the river
        g2.mode7({ horizon: hz, camZ: this.z * 2, angle: Math.sin(t * 0.4) * 0.1, height: 1.2, fog: '#3a2418', tex: (wx, wz) => { const ch = ((Math.floor(wx / 34) + Math.floor(wz / 34)) & 1); return ch ? '#3a3222' : '#302a1c'; } });
        // drifting smoke on the water
        g2.fog(t, { y0: hz, y1: H, bands: 5, color: '#3a3230', alpha: 0.1 });
        // obstacles
        for (const o of this.obs) {
          if (o.kind === 9) {
            // the stamping leg: shadow column + metal shaft
            c.fillStyle = 'rgba(10,14,10,.35)'; c.fillRect(o.x - (o.w || 26), hz, (o.w || 26) * 2, H);
            c.fillStyle = '#1a2a20'; c.fillRect(o.x - 7, 0, 14, o.y);
            c.fillStyle = '#2e4636'; c.fillRect(o.x - 7, 0, 4, o.y);
            c.fillStyle = '#0e1810'; c.beginPath(); c.ellipse(o.x, o.y, o.w || 26, 9, 0, 0, 7); c.fill();
            c.fillStyle = 'rgba(200,230,255,.5)'; c.beginPath(); c.ellipse(o.x, o.y + 2, (o.w || 26) + 8, 6, 0, 0, 7); c.fill();
          } else if (o.kind === 0) { c.fillStyle = '#2a1c10'; c.fillRect(o.x - 14, o.y - 5, 28, 10); c.fillStyle = '#4a3418'; c.fillRect(o.x - 14, o.y - 5, 28, 3); }
          else { c.fillStyle = '#242e2a'; c.beginPath(); c.arc(o.x, o.y, 8, 0, 7); c.fill(); c.fillStyle = 'rgba(200,220,230,.4)'; c.fillRect(o.x - 9, o.y - 8, 18, 3); }
        }
        // your skiff, low in the water with refugees
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) {
          c.fillStyle = 'rgba(200,220,230,.35)'; c.beginPath(); c.ellipse(this.x, H - 56, 22, 6, 0, 0, 7); c.fill();
          g2.bigSprite(['.mm.', 'smms', 'hhhh', '.hh.'], this.x - 12, H - 96, { m: '#3a3e46', s: '#d8b088', h: '#241812' }, 6, { shadow: true, outline: '#0a0d10' });
        }
        g2.embers(t, 12, { yBottom: H, yTop: hz, color: '#ff9050', speed: 0.14, size: 2, alpha: 0.4 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(12,8,6,.85)', '#5a2c18', 1);
        api.txt('❤'.repeat(Math.max(0, this.lives)), 11, 8, 9, C.mars);
        api.txtCFit('THE SEA ' + Math.floor(this.z / this.need * 100) + '%', W - 48, 8, 8, C.cream, false, 90);
        api.vignette(); api.scanlines();
      },
    };
  }
  /* ============== THAMES p2 (boss): HMS Thunder Child ===================== */
  function thunderchild() {
    return {
      name: 'THUNDER CHILD', boss: true,
      help: 'TAP a hood when its shutter opens · DRAG clear of the wake surges',
      winText: 'Two tripods down, and the ram still driving — the sea gives you the coast.',
      loseText: 'The steamer founders in the churning brown water.',
      init(api) {
        this.x = api.W * 0.5; this.time = 24; this.taken = 0; this.max = 3;
        this.trips = [{ x: 60, open: 0, hp: api.has('shrapnel') ? 1 : 2, cd: api.rnd(1, 2) }, { x: api.W - 60, open: 0, hp: api.has('shrapnel') ? 1 : 2, cd: api.rnd(1.5, 2.5) }];
        this.ironX = -60; this.surge = null; this.surgeT = 4;
        this.slain = 0;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.time -= dt;
        this.ironX += 9 * dt;
        if (api.pointer.down && api.pointer.y > H * 0.55) this.x += (api.pointer.x - this.x) * 0.22;
        this.x = clamp(this.x, 26, W - 26);
        for (const tp of this.trips) {
          if (tp.hp <= 0) continue;
          tp.cd -= dt;
          if (tp.cd <= 0) { tp.open = tp.open > 0 ? 0 : 1.1; tp.cd = tp.open ? 1.1 : api.rnd(1.2, 2.0); if (tp.open) api.audio.sfx('blip'); }
          if (tp.open > 0) tp.open -= dt;
        }
        if (api.pointer.justDown && api.pointer.y < H * 0.55) {
          for (const tp of this.trips) {
            if (tp.hp <= 0) continue;
            if (tp.open > 0 && Math.abs(api.pointer.x - tp.x) < 32 && Math.abs(api.pointer.y - 150) < 60) {
              tp.hp--; api.addScore(60); api.burst(tp.x, 150, '#ffd060', 14); api.shake(6, 0.3); api.audio.sfx('explode');
              if (tp.hp <= 0) { this.slain++; api.addScore(60); }
              break;
            }
          }
        }
        // wake surges from the charging ironclad
        this.surgeT -= dt;
        if (!this.surge && this.surgeT <= 0) { this.surge = { x: api.rnd(40, W - 40), warn: 0.9, w: 60 }; api.audio.sfx('power'); }
        if (this.surge) {
          const s = this.surge;
          if (s.warn > 0) s.warn -= dt;
          else {
            s.w += 220 * dt;
            if (Math.abs(s.x - this.x) < 30 && s.w > 40 && s.w < 160) {
              this.taken++; this.surge = null; this.surgeT = api.rnd(3.5, 5);
              api.shake(9, 0.5); api.flash('#4a6a7a', 0.3); api.audio.sfx('hurt');
              if (this.taken >= this.max) return api.lose();
            } else if (s.w > 300) { this.surge = null; this.surgeT = api.rnd(3.5, 5); }
          }
        }
        if (this.slain >= 2 || this.time <= 0) { api.addScore(110); return api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the grey estuary under a bruised sky
        g2.skyGradient([[0, '#2a2430'], [0.6, '#4a3a34'], [1, '#6a5240']], H * 0.44);
        g2.fog(t, { y0: 0, y1: H * 0.44, bands: 4, color: '#5a5a60', alpha: 0.1 });
        g2.verticalGradient(0, H * 0.44, W, H * 0.56, [[0, '#3a4238'], [1, '#1a221c']]);
        c.strokeStyle = 'rgba(200,220,210,.12)';
        for (let i = 0; i < 6; i++) { const sy = H * 0.5 + i * 34; c.beginPath(); for (let x = 0; x <= W; x += 8) c.lineTo(x, sy + Math.sin(t * 2.6 + x * 0.06 + i) * 3); c.stroke(); }
        // the two wading tripods
        for (const tp of this.trips) {
          if (tp.hp <= 0) {
            c.fillStyle = '#1a2a20'; c.save(); c.translate(tp.x, H * 0.42); c.rotate(0.6); c.fillRect(-30, -6, 60, 12); c.restore();
            g2.flame(tp.x, H * 0.40, t, 1.2); continue;
          }
          drawTripod(api, tp.x, 150, 1.15, t + tp.x, { eye: tp.open > 0 ? 0.9 : 0.3 });
          if (tp.open > 0 && Math.floor(t * 8) % 2) { c.strokeStyle = 'rgba(255,178,74,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(tp.x, 150, 34, 0, 7); c.stroke(); }
          // wading legs churn
          c.fillStyle = 'rgba(220,235,230,.4)'; c.beginPath(); c.ellipse(tp.x, H * 0.46, 30, 7, 0, 0, 7); c.fill();
        }
        // HMS THUNDER CHILD — driving in from the left, low black hull, twin funnels streaming
        const ix = this.ironX;
        c.fillStyle = 'rgba(220,235,230,.5)'; c.beginPath(); c.ellipse(ix + 20, H * 0.47, 50, 8, 0, 0, 7); c.fill();
        c.fillStyle = '#141a1c'; c.beginPath();
        c.moveTo(ix - 50, H * 0.46); c.lineTo(ix + 54, H * 0.46); c.lineTo(ix + 66, H * 0.43); c.lineTo(ix - 44, H * 0.42); c.closePath(); c.fill();
        c.fillStyle = '#20282a'; c.fillRect(ix - 20, H * 0.40, 44, 10);
        c.fillStyle = '#0e1416'; c.fillRect(ix - 8, H * 0.36, 8, 16); c.fillRect(ix + 10, H * 0.36, 8, 16);
        for (let i = 0; i < 2; i++) {
          const sx = ix - 4 + i * 18;
          for (let s = 0; s < 4; s++) { const sp = (t * 0.8 + s * 0.25 + i * 0.4) % 1; c.globalAlpha = (1 - sp) * 0.5; c.fillStyle = '#2a2a30'; c.beginPath(); c.arc(sx - sp * 30, H * 0.36 - 4 - sp * 18, 4 + sp * 6, 0, 7); c.fill(); c.globalAlpha = 1; }
        }
        // wake surge rings
        if (this.surge) {
          const s = this.surge;
          if (s.warn > 0) { if (Math.floor(t * 12) % 2) { c.fillStyle = 'rgba(160,220,230,.4)'; c.beginPath(); c.ellipse(s.x, H - 70, 30, 9, 0, 0, 7); c.fill(); api.txtC('SURGE!', s.x, H - 96, 8, '#aee0e8'); } }
          else { c.strokeStyle = 'rgba(200,235,240,.7)'; c.lineWidth = 4; c.beginPath(); c.ellipse(s.x, H - 70, s.w, s.w * 0.26, 0, 0, 7); c.stroke(); }
        }
        // your paddle steamer (player)
        c.fillStyle = 'rgba(200,220,230,.3)'; c.beginPath(); c.ellipse(this.x, H - 56, 24, 6, 0, 0, 7); c.fill();
        g2.bigSprite(['..m...', '.mm.s.', 'hhhhhh', '.hhhh.'], this.x - 15, H - 92, { m: '#3a3e46', s: '#5a3c1c', h: '#2a1c12' }, 5, { shadow: true, outline: '#0a0d10' });
        const pw = Math.floor(t * 10) % 2;
        c.fillStyle = 'rgba(220,235,230,.5)'; c.beginPath(); c.arc(this.x - 18, H - 66, pw ? 7 : 5, 0, 7); c.fill();
        g2.embers(t, 8, { yBottom: H * 0.44, yTop: 60, color: '#8a8a90', speed: 0.06, size: 2, alpha: 0.3 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,12,12,.85)', '#3a4a4a', 1);
        api.txt('TRIPODS ' + this.slain + '/2 · ' + Math.max(0, Math.ceil(this.time)) + 's', 11, 8, 8, C.amber);
        api.txtCFit('HULL ' + '❤'.repeat(Math.max(0, this.max - this.taken)), W - 44, 8, 8, C.mars, false, 80);
        api.vignette(); api.scanlines();
      },
    };
  }
  /* ================ LONDON p1: the red weed (clearing) ==================== */
  function redweed() {
    return {
      name: 'THE RED WEED', boss: false, help: 'TAP the weed before it chokes the road — clear a path',
      winText: 'The way is open. The weed is already blackening at the edges — dying.',
      loseText: 'The crimson creeper closes over the road like a red tide.',
      init(api) {
        this.cleared = 0; this.need = 18; this.choke = 0; this.maxChoke = 100;
        this.weeds = []; this.spawnT = 0.4;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.spawnT -= dt;
        if (this.spawnT <= 0 && this.weeds.length < 7) {
          this.weeds.push({ x: api.rnd(28, W - 28), y: api.rnd(150, H - 90), r: 8, grow: api.rnd(9, 13) });
          this.spawnT = api.rnd(0.5, 0.9);
        }
        for (const w of this.weeds) w.r += w.grow * dt;
        this.choke = clamp(this.choke + this.weeds.reduce((a, w) => a + (w.r > 30 ? 4.5 : 1.2), 0) * dt - 3.5 * dt, 0, this.maxChoke);
        if (this.choke >= this.maxChoke) return api.lose();
        if (api.pointer.justDown) {
          for (const w of this.weeds) {
            if (!w.dead && Math.hypot(api.pointer.x - w.x, api.pointer.y - w.y) < Math.max(18, w.r)) {
              w.dead = true; this.cleared++; api.addScore(16); api.audio.sfx('hurt'); api.burst(w.x, w.y, '#e83820', 10);
              if (this.cleared >= this.need) { api.addScore(70); return api.win(); }
              break;
            }
          }
        }
        this.weeds = this.weeds.filter((w) => !w.dead);
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // a London street drowned in crimson
        g2.skyGradient([[0, '#241016'], [0.6, '#4a1a1a'], [1, '#6a2018']], H * 0.32);
        // ruined terrace silhouettes
        c.fillStyle = '#140a0c';
        for (let i = 0; i < 5; i++) { const bx = i * 56 - 8; c.fillRect(bx, H * 0.14 + (i % 2) * 14, 48, H * 0.18 - (i % 2) * 14); c.fillStyle = 'rgba(232,56,32,.35)'; c.fillRect(bx + 10, H * 0.2, 6, 8); c.fillStyle = '#140a0c'; }
        // the road
        g2.verticalGradient(0, H * 0.32, W, H * 0.68, [[0, '#2a2226'], [1, '#141014']]);
        for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(10,8,10,.6)'; c.fillRect(0, H * 0.4 + i * 70, W, 4); }
        c.fillStyle = 'rgba(200,190,180,.08)'; c.fillRect(W / 2 - 3, H * 0.32, 6, H * 0.68);
        // creeping vines along the gutters (ambient)
        c.strokeStyle = 'rgba(180,30,20,.5)'; c.lineWidth = 3;
        for (const gx of [10, W - 10]) { c.beginPath(); c.moveTo(gx, H * 0.32); for (let y = H * 0.32; y < H; y += 16) c.lineTo(gx + Math.sin(y * 0.08 + t * 1.4) * 6, y); c.stroke(); }
        // the weed clumps — pulsing crimson hearts with tendrils
        for (const w of this.weeds) {
          const pu = 1 + 0.08 * Math.sin(t * 3 + w.x);
          g2.glow(w.x, w.y, w.r * pu, '#c82818', 0.35);
          c.fillStyle = '#8a1a10'; c.beginPath(); c.arc(w.x, w.y, w.r * 0.8 * pu, 0, 7); c.fill();
          c.fillStyle = '#c83020'; c.beginPath(); c.arc(w.x - w.r * 0.2, w.y - w.r * 0.2, w.r * 0.5 * pu, 0, 7); c.fill();
          c.strokeStyle = '#a82818'; c.lineWidth = 2.5;
          for (let a = 0; a < 5; a++) {
            const ang = a * 1.26 + w.x;
            c.beginPath(); c.moveTo(w.x, w.y);
            c.quadraticCurveTo(w.x + Math.cos(ang) * w.r * 0.9, w.y + Math.sin(ang) * w.r * 0.9, w.x + Math.cos(ang + 0.5) * w.r * 1.3 * pu, w.y + Math.sin(ang + 0.5) * w.r * 1.3 * pu);
            c.stroke();
          }
          if (w.r > 30) api.txtC('!', w.x, w.y - w.r - 12, 10, '#ff6a4a');
        }
        // the narrator pushing through, foreground
        g2.bigSprite(NARRATOR_A, W / 2 - 16, H - 74, NPAL, 4, { shadow: true, outline: '#0a0806' });
        g2.fog(t, { y0: H * 0.6, y1: H, bands: 4, color: '#4a1a1a', alpha: 0.1 });
        g2.embers(t, 12, { yBottom: H, yTop: H * 0.3, color: '#e85040', speed: 0.06, size: 2, alpha: 0.35 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(14,6,6,.85)', '#6a2018', 1);
        api.txt('CLEARED ' + this.cleared + '/' + this.need, 11, 8, 8, '#ff8a70');
        g.rect(W - 76, 9, 66, 6, '#241014'); g.rect(W - 76, 9, 66 * (this.choke / this.maxChoke), 6, this.choke > 70 ? '#ff4a30' : '#8a2a1a');
        api.txtCFit('CHOKE', W - 92, 8, 7, C.dim, false, 30);
        api.vignette(); api.scanlines();
      },
    };
  }
  /* ============ LONDON p2 (boss): dead London (cover creep) =============== */
  function deadlondon() {
    return {
      name: 'DEAD LONDON', boss: true,
      help: 'TAP the next cover while the red eye looks away',
      winText: 'The hood hangs slack. Crows wheel above a dead thing from Mars.',
      loseText: 'The red eye finds you in the open, and the silence takes the street.',
      init(api) {
        // covers ascend the street toward Primrose Hill
        this.covers = [[api.W / 2, api.H - 70], [60, api.H - 150], [200, api.H - 220], [80, api.H - 300], [190, api.H - 370], [52, api.H - 418]];
        this.me = 0; this.eye = 'away'; this.eyeT = api.rnd(1.6, 2.4);
        this.warnLen = api.has('fieldglass') ? 0.8 : 0.6; this.caught = 0; this.max = api.has('cheer') ? 3 : 2;
        this.moving = null;
      },
      update(api, dt) {
        this.eyeT -= dt;
        if (this.eye === 'away' && this.eyeT <= 0) { this.eye = 'turning'; this.eyeT = this.warnLen; api.audio.sfx('blip'); }
        else if (this.eye === 'turning' && this.eyeT <= 0) { this.eye = 'watching'; this.eyeT = api.rnd(1.2, 1.9); }
        else if (this.eye === 'watching' && this.eyeT <= 0) { this.eye = 'away'; this.eyeT = api.rnd(1.5, 2.4); }
        if (this.moving) {
          this.moving.p += dt / 0.5;
          if (this.eye === 'watching') {
            this.caught++; this.moving = null; api.shake(8, 0.4); api.flash('#e83820', 0.3); api.audio.sfx('explode');
            if (this.caught >= this.max) return api.lose();
          } else if (this.moving.p >= 1) {
            this.me = this.moving.to; this.moving = null; api.addScore(35); api.audio.sfx('coin');
            if (this.me >= this.covers.length - 1) { api.addScore(120); return api.win(); }
          }
        } else if (api.pointer.justDown) {
          const next = this.me + 1;
          if (next < this.covers.length) {
            const s = this.covers[next];
            if (Math.hypot(api.pointer.x - s[0], api.pointer.y - s[1]) < 40) { this.moving = { to: next, p: 0 }; api.audio.sfx('jump'); }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // grey-red dead city, utterly still
        g2.skyGradient([[0, '#1a1418'], [0.5, '#2e2226'], [1, '#3a2a24']], H * 0.24);
        // crows wheeling
        for (let i = 0; i < 5; i++) {
          const cx = W / 2 + Math.cos(t * 0.5 + i * 1.3) * (40 + i * 12), cy2 = 60 + Math.sin(t * 0.7 + i * 2) * 18;
          const f = Math.sin(t * 6 + i * 2) > 0;
          c.strokeStyle = '#0a0808'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(cx - 4, cy2 + (f ? 2 : -2)); c.lineTo(cx, cy2); c.lineTo(cx + 4, cy2 + (f ? 2 : -2)); c.stroke();
        }
        // ruined terraces flanking the climbing street
        c.fillStyle = '#181014';
        c.beginPath(); c.moveTo(0, H); c.lineTo(0, H * 0.2); c.lineTo(50, H * 0.24); c.lineTo(34, H); c.fill();
        c.beginPath(); c.moveTo(W, H); c.lineTo(W, H * 0.2); c.lineTo(W - 50, H * 0.26); c.lineTo(W - 30, H); c.fill();
        c.fillStyle = 'rgba(232,56,32,.14)'; c.fillRect(6, H * 0.3, 8, 10); c.fillRect(W - 16, H * 0.36, 8, 10);
        // the street rising to the hill
        g2.verticalGradient(0, H * 0.24, W, H * 0.76, [[0, '#2a2428'], [1, '#141014']]);
        // red weed dead & blackening in drifts
        for (let i = 0; i < 12; i++) { const wx = (i * 47 + 23) % (W - 40) + 20, wy = H * 0.3 + ((i * 83) % (H * 0.6)); c.fillStyle = i % 3 ? 'rgba(90,20,14,.6)' : 'rgba(40,14,10,.7)'; c.beginPath(); c.arc(wx, wy, 5 + (i % 4) * 2, 0, 7); c.fill(); }
        // THE LAST TRIPOD on the hill crest, hood drooping, red eye sweeping
        const watching = this.eye === 'watching', turning = this.eye === 'turning';
        const hx = W / 2, hy = 96;
        drawTripod(api, hx, hy, 1.3, t * 0.3, { eye: watching ? 0.9 : 0.15, stride: 0.4 });
        if (watching) {
          const swing = Math.sin(t * 2.2);
          c.save(); c.globalAlpha = 0.15 + 0.05 * Math.sin(t * 12);
          const bg = c.createRadialGradient(hx, hy, 10, hx, hy, H);
          bg.addColorStop(0, '#ff6a4a'); bg.addColorStop(1, 'rgba(255,60,30,0)');
          c.fillStyle = bg;
          const ang = Math.PI / 2 + swing * 0.4;
          c.beginPath(); c.moveTo(hx, hy); c.arc(hx, hy, H, ang - 0.28, ang + 0.28); c.closePath(); c.fill(); c.restore();
        }
        // the wail — concentric fading rings ("ulla… ulla…")
        const wp = (t * 0.5) % 1;
        c.globalAlpha = (1 - wp) * 0.3; c.strokeStyle = '#8a6a5a'; c.lineWidth = 1.5;
        c.beginPath(); c.arc(hx, hy, 30 + wp * 90, 0, 7); c.stroke(); c.globalAlpha = 1;
        // covers: wrecked cabs, barricades, a dead horse-tram
        for (let i = 0; i < this.covers.length; i++) {
          const s = this.covers[i], nxt = i === this.me + 1;
          if (i === this.covers.length - 1) { // the crest marker
            c.fillStyle = 'rgba(90,255,138,.15)'; c.beginPath(); c.arc(s[0], s[1], 24, 0, 7); c.fill();
            api.txtC('THE HILL', s[0], s[1] - 6, 7, C.phos);
          } else {
            c.fillStyle = '#221a1c'; c.fillRect(s[0] - 30, s[1] - 12, 60, 22);
            c.fillStyle = '#332428'; c.fillRect(s[0] - 30, s[1] - 12, 60, 6);
            c.fillStyle = '#120e10'; c.beginPath(); c.arc(s[0] - 18, s[1] + 12, 7, 0, 7); c.arc(s[0] + 18, s[1] + 12, 7, 0, 7); c.fill();
          }
          if (nxt && !this.moving && Math.floor(t * 3) % 2) { c.strokeStyle = C.phos; c.lineWidth = 1.5; c.strokeRect(s[0] - 34, s[1] - 16, 68, 30); }
        }
        // the narrator: at cover, or scurrying between
        let px = this.covers[this.me][0], py = this.covers[this.me][1];
        if (this.moving) {
          const a = this.covers[this.me], b = this.covers[this.moving.to], p = clamp(this.moving.p, 0, 1);
          px = a[0] + (b[0] - a[0]) * p; py = a[1] + (b[1] - a[1]) * p;
        }
        g2.bigSprite(this.moving && Math.floor(t * 10) % 2 ? NARRATOR_B : NARRATOR_A, px - 16, py - 30, NPAL, 4, { shadow: true, outline: '#0a0806' });
        g2.fog(t * 0.4, { y0: H * 0.5, y1: H, bands: 4, color: '#3a2a28', alpha: 0.08 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,8,8,.85)', '#3a2a28', 1);
        const stCol = watching ? '#ff6a4a' : turning ? C.amber : C.phos;
        g.rect(11, 8, 8, 8, stCol);
        api.txt(watching ? 'THE EYE!' : turning ? 'IT TURNS…' : 'MOVE UP', 24, 8, 8, stCol);
        for (let i = 0; i < this.max; i++) g.rect(W - 46 + i * 13, 8, 9, 8, i < this.max - this.caught ? C.phos : '#2a1a1a');
        api.vignette(); api.scanlines();
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'warworlds16', title: 'The War of the Worlds', subtitle: 'THE COMING OF THE MARTIANS',
    currency: 'DISPATCHES', accent: C.phos, ownPhaseHud: true,
    titleFont: TITLE, uiFont: "'Pixelify Sans','Press Start 2P',monospace",
    credit: 'A 16-BIT INVASION · H. G. WELLS, 1898',
    bootCta: 'TAP TO SOUND THE ALARM', bootLine: 'FIVE DISPATCHES · ONE INVASION',
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.amber, blood: C.mars, cream: C.cream, dim: C.dim },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'ANSWER A DISPATCH', mapDone: 'THE EARTH IS OURS AGAIN',
    screens: {
      overlay: 'rgba(4,10,6,.88)', win: C.phos, lose: '#ff5a40', chapterLabel: '#7a9a80',
      name: '#e8f0e0', sub: C.mars, intro: '#b8d0c0', quote: '#7a9a80', help: C.amber,
      score: '#e8f0e0', cur: C.phos, cta: '#e8f0e0',
    },
    labels: {
      chapter: 'DISPATCH', phase: 'REPORT', boss: 'THE ORDEAL', score: 'INTELLIGENCE',
      win: 'THE LINE HOLDS', lose: 'THE LINE IS LOST', nextPhaseWin: 'REPORT FILED',
      cont: 'TAP FOR THE NEXT REPORT', toMap: 'TAP FOR THE MAP', play: 'TAP TO GO IN',
      nextPhase: 'TAP TO PRESS FORWARD', toFinale: 'TAP FOR THE LAST DISPATCH',
    },
    upgrades: {
      fieldglass: { name: 'THE FIELD-GLASS', desc: 'danger telegraphs longer' },
      shrapnel: { name: 'SHRAPNEL SHELLS', desc: 'hoods fall to fewer hits' },
      quiet: { name: 'THE STILL NERVE', desc: 'one more chance when hunted' },
      cheer: { name: "THE CREW'S CHEER", desc: 'one more chance in dead London' },
    },
    nodes: [
      {
        id: 'horsell', name: 'HORSELL COMMON', sub: 'THE FALLING STAR', reward: 60, grant: 'fieldglass',
        icon(api, x, y) { const g = api.gfx; g.circle(x, y, 7, '#3e5646'); g.circle(x, y, 3, C.phos); },
        intro: ['A green streak over Winchester;', 'a thing half-buried in the sand', 'pits, its top turning. The crowd', 'leans in. Something looks back.'],
        quote: 'No one would have believed that this world was being watched keenly and closely.',
        choice: { prompt: 'Before you run — one message. To whom?', options: [{ label: 'Wire your wife: LEAVE WOKING NOW', flag: 'wife' }, { label: 'Wire the garrison: BRING THE GUNS', flag: 'soldier' }] },
        winText: 'It is no meteor. And the ray has shown what it thinks of parley.',
        phases: [pit(), heatray()],
      },
      {
        id: 'artillery', name: 'THE GUNS', sub: 'WEYBRIDGE & SHEPPERTON', needs: ['horsell'], reward: 60, grant: 'shrapnel',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 8, y + 2, 16, 4, '#3a3020'); g.rect(x - 2, y - 6, 10, 3, '#54462c'); },
        intro: ['The batteries dig in along the', 'Wey. Twelve-pounders against', 'walking towers a hundred feet', 'high. The gunners stand to.'],
        quote: 'It was the first time I realised that the Martians might have any other purpose than destruction.',
        winText: 'A hood shatters — they CAN die. Then the black smoke comes.',
        phases: [guns(), blacksmoke()],
      },
      {
        id: 'curate', name: "THE RUINED HOUSE", sub: 'FIFTEEN DAYS IN THE DARK', needs: ['artillery'], optional: true, reward: 40, grant: 'quiet',
        icon(api, x, y) { const c = api.ctx; c.strokeStyle = '#3e5646'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 8, y - 6); c.quadraticCurveTo(x + 2, y, x - 2, y + 7); c.stroke(); api.gfx.circle(x - 2, y + 7, 2, C.phos); },
        intro: ['The fifth cylinder falls ON the', 'house where you shelter. Through', 'a chink: the pit, the machines —', 'and a tentacle, searching rooms.'],
        quote: 'I saw it coming towards me — a limbless, glistening thing, feeling its slow way.',
        winText: 'It takes the curate\'s boot, a bottle, nothing more. It never finds you.',
        phases: [tentacle()],
      },
      {
        id: 'thames', name: 'THE THAMES', sub: 'THE EXODUS & THE IRONCLAD', needs: ['artillery'], reward: 70, grant: 'cheer',
        icon(api, x, y) { const c = api.ctx; c.strokeStyle = '#8ac0d0'; c.lineWidth = 2; for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(x - 8, y - 2 + i * 5); c.quadraticCurveTo(x - 3, y - 5 + i * 5, x, y - 2 + i * 5); c.quadraticCurveTo(x + 3, y + 1 + i * 5, x + 8, y - 2 + i * 5); c.stroke(); } },
        intro: ['Six million people, moving.', 'The river is the only road left.', 'And where the estuary widens,', 'one old ironclad waits.'],
        quote: 'Never before in the history of warfare had destruction been so indiscriminate and so universal.',
        winText: 'The Thunder Child buys the shoal of boats their sea-room, and pays for it.',
        phases: [exodus(), thunderchild()],
      },
      {
        id: 'london', name: 'DEAD LONDON', sub: 'ULLA, ULLA, ULLA', needs: ['thames'], reward: 100,
        icon(api, x, y) { const c = api.ctx; c.strokeStyle = '#8a6a5a'; c.lineWidth = 1.5; for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(x, y, 4 + i * 4, 0, 7); c.stroke(); } },
        intro: ['A city without a sound but one:', 'a great wailing from Primrose', 'Hill, over and over, like a', 'sobbing. Then it, too, stops.'],
        quote: 'Ulla, ulla, ulla, ulla — the desolating cry of the last Martian.',
        winText: 'Slain, after all man\'s devices had failed, by the humblest things upon the earth.',
        phases: [redweed(), deadlondon()],
      },
    ],
    endings: [
      { when: (f) => f.wife, title: 'THE HOUSE AT WOKING', lines: ['The wire reached Leatherhead.', 'In the wrecked house at Woking', 'you find her standing in the', 'doorway you left by.', '', 'The earth heals. So, slowly, do you.'] },
      { when: (f) => f.soldier, title: "THE GUNNERS' TOAST", lines: ['Your wire brought the guns that', 'shattered the first hood, and the', 'survivors of the battery drink', 'to the civilian who sent it.', '', 'The earth is ours again — earned.'] },
      { when: () => true, title: 'THE SILENT EARTH', lines: ['Slain by the putrefactive bacteria', 'against which their systems were', 'unprepared — by the humblest things', 'upon this earth.'] },
    ],
    finale: ['THE EARTH IS OURS AGAIN.'],
  });
})();
