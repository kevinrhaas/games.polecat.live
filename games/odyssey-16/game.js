/* ============================================================================
 * THE ODYSSEY — THE LONG WAY HOME   (Gen 4 / 16-bit)
 * Homer's epic as an open sea-chart: the wine-dark Aegean seen from above,
 * five islands to make for in any order, each a run of trials ending in an
 * ordeal; Maron's wine, the bag of winds, the moly herb and a loyal crew
 * carry across the voyage; one shout at the Cyclops decides how the tale ends.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    sea1: '#0b2036', sea2: '#123a5c', deep: '#071523', wine: '#1a2a4a',
    sky: '#7ac8e8', sun: '#ffd76a', gold: '#f0c860', bronze: '#c88a3a',
    terra: '#c86a3a', clay: '#8a4a2a', marble: '#eae2d0', ink: '#1a140c',
    cream: '#f4e8d0', dim: '#8aa8b8', teal: '#4ac8d4', blood: '#c85040',
    olive: '#6a8a3a', night: '#0a1220',
  };
  // tall condensed pixel face — stele-cut capitals, period-correct 16-bit.
  const TITLE = "'Jersey 15','Press Start 2P',sans-serif";

  /* ─── emblem: a bronze Corinthian helmet ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(cx, cy, 34, C.gold, 0.3);
    api.gfx.sprite([
      '..bbbbbb..',
      '.bBBBBBBb.',
      'bBBBBBBBBb',
      'bBBrBBrBBb',
      'bBB.BB.BBb',
      'bBB.BB.BBb',
      '.bB.BB.Bb.',
      '.bB....Bb.',
      '..b....b..',
    ], cx - 30, cy - 26, { b: '#6a4a1a', B: '#c88a3a', r: '#3a2410' }, 6);
    // horsehair crest
    c.fillStyle = '#a83028';
    c.beginPath(); c.moveTo(cx - 22, cy - 26); c.quadraticCurveTo(cx, cy - 50, cx + 22, cy - 26); c.quadraticCurveTo(cx, cy - 34, cx - 22, cy - 26); c.fill();
  }

  /* ─── shared open-sea scene: sun-path, swells, gulls, the black ship ─── */
  function gulls(api, t) {
    const c = api.ctx;
    for (let i = 0; i < 4; i++) {
      const gx = ((t * (12 + i * 4)) + i * 90) % (api.W + 60) - 30, gy = 60 + i * 22 + Math.sin(t * 2 + i) * 8;
      const f = Math.sin(t * 8 + i * 2) > 0;
      c.strokeStyle = '#e8ecf0'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(gx - 5, gy + (f ? 2 : -2)); c.lineTo(gx, gy); c.lineTo(gx + 5, gy + (f ? 2 : -2)); c.stroke();
    }
  }
  function drawShip(api, x, y, t, scale) {
    const g2 = api.g2, c = api.ctx, s = scale || 4;
    const bob = Math.sin(t * 2.2) * 2;
    // black-figure galley: dark hull, curled stern, single sail, oar rows
    g2.bigSprite([
      '.....m....',
      '.....mss..',
      '..sssmsss.',
      '..sssmsss.',
      'h....m...h',
      'hhhhhhhhhh',
      '.hhhhhhhh.',
    ], x - 5 * s, y - 4 * s + bob, { m: '#3a2a14', s: '#e8dcc0', h: '#241812' }, s, { shadow: true, outline: '#0a0d14' });
    const dip = Math.sin(t * 5) > 0 ? 2 : 4;
    c.strokeStyle = '#241812'; c.lineWidth = Math.max(1, s / 2);
    for (let i = 0; i < 4; i++) { const ox = x - 3 * s + i * 2 * s; c.beginPath(); c.moveTo(ox, y + 2 * s + bob); c.lineTo(ox - s, y + 2 * s + dip + bob + 2); c.stroke(); }
  }
  function seaScene(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, '#8ad0ec'], [0.5, '#b8e0e8'], [1, '#e8d8a8']], H * 0.42);
    // low sun + glitter path
    g2.glow(W / 2, H * 0.30, 40, '#fff0b0', 0.55);
    c.fillStyle = '#ffe9a0'; c.beginPath(); c.arc(W / 2, H * 0.30, 18, 0, 7); c.fill();
    g2.verticalGradient(0, H * 0.42, W, H * 0.58, [[0, '#2a6a8a'], [0.4, '#123a5c'], [1, '#0b2036']]);
    for (let i = 0; i < 26; i++) {
      const gy = H * 0.44 + i * 8, amp = 4 + i * 0.5;
      const gx = W / 2 + Math.sin(t * 1.6 + i * 1.3) * amp * 2;
      c.fillStyle = 'rgba(255,225,140,' + (0.24 - i * 0.007) + ')';
      c.fillRect(gx - (5 + i), gy, 10 + i * 2, 2);
    }
    // swell lines
    c.strokeStyle = 'rgba(180,220,235,.16)';
    for (let i = 0; i < 7; i++) {
      const sy = H * 0.5 + i * 32; c.beginPath();
      for (let x = 0; x <= W; x += 9) c.lineTo(x, sy + Math.sin(t * 2 + x * 0.06 + i * 2) * 3);
      c.stroke();
    }
    // far island (Ithaca on the horizon)
    c.fillStyle = '#4a7a8a'; c.beginPath(); c.moveTo(W - 74, H * 0.42); c.quadraticCurveTo(W - 52, H * 0.36, W - 26, H * 0.42); c.closePath(); c.fill();
    gulls(api, t);
    drawShip(api, W * 0.32, H * 0.62, t, 4);
    g2.embers(t, 8, { yBottom: H * 0.42, yTop: 40, color: '#ffffff', speed: 0.05, size: 1, alpha: 0.3 });
    if (dim) { c.fillStyle = 'rgba(5,10,20,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }
  function scenery(api, scene, t) {
    if (scene === 'hub') { drawChart(api, t); return; }
    seaScene(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale') ? 0.62 : 0);
  }

  /* ─── HUB: the wine-dark sea from above — islands, wake, meander border ─── */
  const NODES_XY = { cyclops: [26, 88], aeolus: [158, 128], circe: [34, 196], strait: [152, 262], ithaca: [78, 372] };
  const ORDER = ['cyclops', 'circe', 'strait', 'ithaca'];
  function meander(c, x, y, w, cell) {
    // Greek key border strip
    c.save(); c.strokeStyle = 'rgba(240,200,96,.75)'; c.lineWidth = 2;
    for (let gx = x; gx < x + w - cell; gx += cell) {
      c.beginPath();
      c.moveTo(gx, y + cell); c.lineTo(gx, y); c.lineTo(gx + cell * 0.75, y); c.lineTo(gx + cell * 0.75, y + cell * 0.6);
      c.lineTo(gx + cell * 0.35, y + cell * 0.6); c.stroke();
    }
    c.restore();
  }
  function drawChart(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    // the deep from above
    g2.verticalGradient(0, 0, W, H, [[0, '#0e2a44'], [0.5, '#0b2036'], [1, '#071523']]);
    // drifting wave glyphs (rows of painted curls)
    for (let r = 0; r < 12; r++) {
      const wy = 34 + r * 38, off = (t * (6 + (r % 3) * 3)) % 28;
      c.strokeStyle = 'rgba(122,180,210,' + (0.10 + (r % 2) * 0.05) + ')'; c.lineWidth = 1.5;
      for (let x = -28; x < W; x += 28) {
        c.beginPath(); c.arc(x + off + 8, wy, 6, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      }
    }
    // sun glints
    for (let i = 0; i < 14; i++) { const gx = (i * 73 + 19) % W, gy = (i * 131 + 47) % H; c.fillStyle = 'rgba(240,220,150,' + (0.06 + 0.05 * Math.sin(t * 2 + i)) + ')'; c.fillRect(gx, gy, 3, 2); }
    // meander borders top & bottom
    meander(c, 10, 58, W - 20, 8);
    meander(c, 10, H - 30, W - 20, 8);
    // the ship's golden wake between the main islands
    c.save(); c.setLineDash([3, 8]); c.lineDashOffset = -(t * 16) % 1000;
    c.strokeStyle = 'rgba(240,200,96,.7)'; c.lineWidth = 2;
    c.beginPath(); ORDER.forEach((id, i) => { const p = NODES_XY[id], px = p[0] + 48, py = p[1] + 34; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke();
    c.restore();
    // Charybdis swirl near the strait
    const sw = NODES_XY.strait;
    c.save(); c.translate(sw[0] - 14, sw[1] + 74);
    c.strokeStyle = 'rgba(140,200,220,.35)'; c.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, 4 + i * 4, t * 2 + i, t * 2 + i + 4.6); c.stroke(); }
    c.restore();
  }
  // island vignettes drawn INTO the island blob
  const ISLE = {
    cyclops(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#6a5a42'; c.beginPath(); c.moveTo(x + w * 0.2, y + h); c.lineTo(x + w * 0.45, y + h * 0.14); c.lineTo(x + w * 0.72, y + h); c.fill(); c.fillStyle = '#141210'; c.beginPath(); c.ellipse(x + w * 0.56, y + h * 0.72, 9, 7, 0, Math.PI, 0); c.fill(); const e = 0.5 + 0.5 * Math.sin(t * 1.4); g2.glow(x + w * 0.56, y + h * 0.66, 7, '#ffb040', 0.4 * e); },
    aeolus(api, x, y, w, h, t) { const c = api.ctx; c.fillStyle = '#b8a878'; c.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.7); c.fillStyle = '#d8c898'; c.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, 4); for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.1; c.strokeStyle = 'rgba(220,240,250,.6)'; c.lineWidth = 2; c.beginPath(); c.arc(x + w * 0.5 + Math.cos(a) * 14, y + h * 0.4 + Math.sin(a * 0.7) * 8, 5, a, a + 4); c.stroke(); } },
    circe(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#3a5a34'; for (let i = 0; i < 5; i++) { const px = x + w * 0.18 + i * w * 0.16; c.fillRect(px, y + h * 0.4, 3, h * 0.6); c.beginPath(); c.arc(px + 1, y + h * 0.38, 6, 0, 7); c.fill(); } g2.glow(x + w * 0.5, y + h * 0.5, 16, '#c060e0', 0.25 + 0.12 * Math.sin(t * 2.6)); c.fillStyle = '#e8d8f0'; c.fillRect(x + w * 0.44, y + h * 0.5, 10, h * 0.5); },
    strait(api, x, y, w, h, t) { const c = api.ctx; c.fillStyle = '#4a4436'; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x + w * 0.30, y); c.lineTo(x + w * 0.38, y + h); c.fill(); c.beginPath(); c.moveTo(x + w * 0.62, y + h); c.lineTo(x + w * 0.72, y); c.lineTo(x + w, y + h); c.fill(); c.strokeStyle = 'rgba(140,200,220,.7)'; c.lineWidth = 1.5; for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(x + w * 0.5, y + h * 0.7, 3 + i * 4, t * 3, t * 3 + 4.4); c.stroke(); } },
    ithaca(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#7a9a5a'; c.beginPath(); c.moveTo(x, y + h); c.quadraticCurveTo(x + w * 0.5, y - h * 0.25, x + w, y + h); c.fill(); c.fillStyle = '#eae2d0'; c.fillRect(x + w * 0.42, y + h * 0.3, 16, 10); c.fillStyle = '#c86a3a'; c.fillRect(x + w * 0.40, y + h * 0.24, 20, 4); const f = 0.5 + 0.5 * Math.sin(t * 5); g2.glow(x + w * 0.5, y + h * 0.28, 8, '#ffd060', 0.4 * f); },
  };
  const menu = {
    title(api, save, t) {
      const c = api.ctx, g2 = api.g2, W = api.W;
      // marble header slab
      g2.roundRect(22, 10, W - 44, 42, 3, '#e8e0cc', '#a89468', 2);
      c.fillStyle = '#f6f0e0'; c.fillRect(22, 10, W - 44, 4);
      c.fillStyle = '#c8bca0'; c.fillRect(22, 48, W - 44, 4);
      g2.gleamText('THE VOYAGE HOME', W / 2, 15, api.fitSize('THE VOYAGE HOME', 15, W - 64, 'title'), '#2a3a5a', t, { shadow: 'rgba(255,255,255,.6)', gleam: 'rgba(200,150,40,.85)', gleamSpeed: 55, font: TITLE });
      api.txtCFit('GLORY  ' + (save.cur || 0), W / 2, 38, 9, '#8a6a1a');
    },
    layout() { return ['cyclops', 'aeolus', 'circe', 'strait', 'ithaca'].map((id) => ({ x: NODES_XY[id][0], y: NODES_XY[id][1], w: 96, h: 72 })); },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, t } = info;
      const cx = x + w / 2, ih = h - 18;
      if (sel) g2.glow(cx, y + ih / 2, 52, C.gold, 0.3 + 0.14 * Math.sin(t * 4));
      // the island: sand ring + terracotta land, vignette inside
      c.fillStyle = 'rgba(240,220,160,.9)';
      c.beginPath(); c.ellipse(cx, y + ih / 2, w * 0.5, ih * 0.52, 0, 0, 7); c.fill();
      c.fillStyle = sel ? '#caa06a' : '#b8905e';
      c.beginPath(); c.ellipse(cx, y + ih / 2, w * 0.46, ih * 0.47, 0, 0, 7); c.fill();
      c.save(); c.beginPath(); c.ellipse(cx, y + ih / 2, w * 0.42, ih * 0.42, 0, 0, 7); c.clip();
      if (ISLE[node.id]) ISLE[node.id](api, x + 8, y + 5, w - 16, ih - 10, t);
      c.restore();
      if (sel) { c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, y + ih / 2, w * 0.5, ih * 0.52, 0, 0, 7); c.stroke(); }
      // stone name tablet
      g2.roundRect(x + 6, y + h - 17, w - 12, 15, 2, done ? '#caa54a' : '#e0d6bc', done ? '#8a6a1a' : '#8a7a58', 1);
      api.txtCFit((node.optional ? '◆ ' : '') + node.name, cx, y + h - 14, 7, done ? '#4a3208' : '#3a2e18', false, w - 16);
      if (done) { // laurel mark
        c.strokeStyle = '#4a6a1a'; c.lineWidth = 2;
        c.beginPath(); c.arc(x + w - 12, y + 10, 6, 0.6, Math.PI * 2 - 0.6); c.stroke();
        api.txtC('✓', x + w - 15, y + 4, 8, '#3a5a12');
      }
      // the black ship rides beside the chosen island
      if (sel) drawShip(api, x - 8, y + ih / 2 + 6, t, 2);
    },
  };

  /* ─── animated title: the sun-path, the ship under sail, the great name ─── */
  function renderBoot(api, info) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    seaScene(api, t, 0);
    emblem(api, W / 2, H * 0.165);
    const ts = api.fitSize('THE ODYSSEY', 34, W - 20, 'title');
    g2.gleamText('THE ODYSSEY', W / 2, H * 0.245, ts, C.gold, t, { bevel: '#fff0c0', shadow: 'rgba(10,20,40,.8)', gleamSpeed: 60, font: TITLE });
    api.txtCFit('THE LONG WAY HOME', W / 2, H * 0.245 + ts + 8, 10, '#2a4a6a', true);
    if (info.blink) api.txtCFit('▸ TAP TO SET SAIL ◂', W / 2, H * 0.74, 12, C.cream);
    api.txtCFit('A 16-BIT EPIC · HOMER, c. 700 BC', W / 2, H - 28, 8, '#9ab8c8');
    api.vignette(); api.scanlines();
  }

  /* ============================ 16-bit sprites ============================ */
  const ODY_A = [ // bronze cuirass, crested helm — 2 stride frames
    '..rrrr..', '.rbbbbr.', '.bffffb.', '..ffff..', '.kBBBBk.',
    'kBBggBBk', 'kBg..gBk', '.kB..Bk.', '.tt..tt.', 'oo....oo',
  ];
  const ODY_B = [
    '..rrrr..', '.rbbbbr.', '.bffffb.', '..ffff..', '.kBBBBk.',
    'kBBggBBk', '.kBggBk.', 'tkB..Bkt', 'o.t..t.o', '.o....o.',
  ];
  const ODYPAL = { r: '#a83028', b: '#c88a3a', f: '#e0b088', k: '#241a10', B: '#b87a2a', g: '#e8c880', t: '#6a4a2a', o: '#3a2a18' };
  const CREW = ['..kk..', '.kffk.', '.tfft.', 'ttTTtt', 'tT..Tt', '.o..o.'];
  const CREWPAL = { k: '#2a1c10', f: '#d8a878', t: '#8a6a4a', T: '#a8845a', o: '#3a2a18' };
  const POLY_HEAD = [ // the one eye, huge
    '..gggggg..', '.gGGGGGGg.', 'gGGGGGGGGg', 'gGG.ee.GGg', 'gGG.ee.GGg',
    '.gGGGGGGg.', '.gGmmmmGg.', '..gGGGGg..', '...gggg...',
  ];
  const POLYPAL = { g: '#5a5238', G: '#7a6e4a', e: '#ffd040', m: '#3a2a1a' };
  const CIRCE = ['..pppp..', '.pWWWWp.', '.pWffWp.', '.pffffp.', '..PPPP..', '.pPPPPp.', 'pPP..PPp', '.pP..Pp.'];
  const CIRCEPAL = { p: '#7a3aa0', W: '#3a2450', f: '#e8c8a0', P: '#9a5ac0' };
  const SCYLLA_HEAD = ['..kkk..', '.kGGGk.', 'kGGeGGk', 'kGGGGGk', '.kGWGk.', '..kkk..'];
  const SCYLLAPAL = { k: '#1a2a24', G: '#3a5a4a', e: '#ffd040', W: '#e8ecf0' };
  const SUITOR = ['..hh..', '.hffh.', '.hffh.', 'hRRRRh', 'hR..Rh', '.o..o.'];
  const SUITORPAL = { h: '#3a3020', f: '#d8a878', R: '#7a3040', o: '#2a2018' };
  const ALLY = ['..hh..', '.hffh.', '.hffh.', 'hWWWWh', 'hW..Wh', '.o..o.'];
  const ALLYPAL = { h: '#5a4a2a', f: '#e0b890', W: '#d8d0b8', o: '#2a2018' };

  /* =================== CYCLOPS p1: the olive stake (charge) =============== */
  function stake() {
    return {
      name: 'THE OLIVE STAKE', boss: false, help: 'HOLD to drive — RELEASE in the embers',
      winText: '“Nobody is killing me!” he roars — and none come.',
      loseText: 'The giant stirs. The cave mouth is still stopped with stone.',
      init(api) { this.hits = 0; this.need = 5; this.miss = 0; this.p = 0; this.dir = 1; this.spd = 1.5; this.band = 0.20; this.holding = false; },
      update(api, dt) {
        if (api.pointer.down || api.keyDown('a')) { this.holding = true; this.p += this.dir * this.spd * dt; if (this.p > 1) { this.p = 1; this.dir = -1; } if (this.p < 0) { this.p = 0; this.dir = 1; } }
        else if (this.holding) {
          this.holding = false;
          if (Math.abs(this.p - 0.78) < this.band / 2) {
            this.hits++; api.addScore(30); api.audio.sfx('shoot'); api.shake(6, 0.3); api.flash('#ffb040', 0.15); api.burst(api.W / 2, api.H * 0.42, '#ffb040', 12);
            this.spd += 0.22; this.band = Math.max(0.11, this.band - 0.02);
            if (this.hits >= this.need) { api.addScore(60); return api.win(); }
          } else { this.miss++; api.shake(4, 0.2); api.audio.sfx('hurt'); if (this.miss >= 4) return api.lose(); }
          this.p = 0; this.dir = 1;
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // firelit cave — rough stone, the fire, sheep, the sleeping giant
        g2.verticalGradient(0, 0, W, H, [[0, '#141008'], [1, '#241408']]);
        g2.stoneWall(0, 0, W, H * 0.7, { base: '#3a3226', light: '#544838', dark: '#241f16', mortar: '#141008', moss: '#3a3a20' }, 0);
        // fire pit
        g2.flame(52, H - 90, t, 2.2, { glow: 'rgba(255,150,40,.9)' });
        g2.glow(52, H - 96, 70, '#e08030', 0.4 + 0.06 * Math.sin(t * 8));
        c.fillStyle = '#241206'; c.beginPath(); c.ellipse(52, H - 82, 26, 8, 0, 0, 7); c.fill();
        // Polyphemus asleep against the far wall (breathing)
        const br = Math.sin(t * 1.1) * 3;
        g2.bigSprite(POLY_HEAD, W - 118, 44 + br, POLYPAL, 6, { shadow: true, outline: '#0c0a06' });
        c.fillStyle = '#4a4230'; c.beginPath(); c.ellipse(W - 88, 148 + br * 0.5, 66, 34, 0, Math.PI, 0); c.fill(); // shoulders
        // closed eye lid while asleep (covers the whole eye, with a lash line)
        c.fillStyle = '#6a5e40'; c.fillRect(W - 118 + 16, 44 + br + 17, 30, 14);
        c.fillStyle = '#4a4230'; c.fillRect(W - 118 + 16, 44 + br + 28, 30, 3);
        // sheep huddled
        [[24, H - 56], [70, H - 48], [116, H - 58]].forEach((sh, i) => { g2.bigSprite(['.www.', 'wwwww', '.k.k.'], sh[0], sh[1] + Math.sin(t * 2 + i) * 1, { w: '#d8d0c0', k: '#2a2018' }, 3, { outline: '#141008' }); });
        // the stake — heating in the fire, aimed up at the eye
        c.save(); c.translate(70, H - 110); c.rotate(-0.9);
        c.fillStyle = '#5a3a14'; c.fillRect(0, -4, 120, 8);
        const heat = 0.4 + 0.6 * this.p;
        c.fillStyle = g2.mix('#5a3a14', '#ff8030', heat); c.fillRect(84, -4, 36, 8);
        g2.glow(110, 0, 14, '#ff8030', 0.5 * heat);
        c.restore();
        // crew straining (Odysseus at the stake)
        g2.bigSprite(this.holding && Math.floor(t * 8) % 2 ? ODY_B : ODY_A, 96, H - 130, ODYPAL, 4, { shadow: true, outline: '#0c0a06' });
        g2.bigSprite(CREW, 132, H - 116, CREWPAL, 4, { shadow: true, outline: '#0c0a06' });
        // charge meter — a vertical brand from grey to ember, band near the top
        const mx = W - 34, my = 64, mh = H - 170;
        g2.roundRect(mx - 8, my - 8, 26, mh + 16, 5, 'rgba(14,10,6,.8)', '#6a4a24', 1);
        g.rect(mx, my, 10, mh, '#241a10');
        const bandY = my + mh * (1 - 0.78) - mh * this.band / 2;
        g2.glow(mx + 5, bandY + mh * this.band / 2, 14, '#ff9030', 0.5);
        g.rect(mx, bandY, 10, mh * this.band, '#a84a10');
        g.rect(mx - 2, my + mh * (1 - this.p) - 2, 14, 4, this.holding ? '#ffd060' : '#c8b090');
        g2.fog(t, { y0: H * 0.6, y1: H, bands: 3, color: '#5a3a20', alpha: 0.07 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(14,10,6,.8)', '#6a4a24', 1);
        api.txt('DRIVES ' + this.hits + '/' + this.need, 11, 8, 8, C.gold);
        for (let i = 0; i < 4; i++) g.rect(W - 58 + i * 13, 8, 9, 8, i < 4 - this.miss ? '#e8a030' : '#3a2a1a');
        api.vignette();
      },
    };
  }
  /* ============ CYCLOPS p2 (boss): flight from the cyclops ================ */
  function boulders() {
    return {
      name: 'FLIGHT FROM THE CYCLOPS', boss: true,
      help: 'DRAG to row clear of the boulders · TAP the horn to TAUNT for glory',
      winText: 'The blind giant howls to his father Poseidon. You are away.',
      loseText: 'A mountain of stone finds the little black ship.',
      init(api) {
        this.x = api.W / 2; this.z = 0; this.need = 340; this.lives = api.has('winds') ? 4 : 3; this.imm = 0;
        this.marks = []; this.spawnT = 1.0; this.taunts = 0; this.tauntCd = 0;
        this.named = !!api.flags.named;
      },
      spawnMark(api, n) { for (let i = 0; i < n; i++) this.marks.push({ x: api.rnd(24, api.W - 24), y: api.rnd(api.H * 0.5, api.H - 60), t: 1.2, r: 16 }); },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.z += 0.36 * dt * 60; this.imm = Math.max(0, this.imm - dt); this.tauntCd = Math.max(0, this.tauntCd - dt);
        if (api.pointer.down && api.pointer.y > 60) this.x += (api.pointer.x - this.x) * 0.25;
        this.x = clamp(this.x, 22, W - 22);
        this.spawnT -= dt; if (this.spawnT <= 0) { this.spawnMark(api, 1); this.spawnT = api.rnd(0.7, 1.2); }
        // taunt horn: top strip tap
        if (api.pointer.justDown && api.pointer.y < 56 && api.pointer.x > W - 76 && this.tauntCd <= 0) {
          this.taunts++; this.tauntCd = 2.2; api.addScore(this.named ? 45 : 30); api.audio.sfx('power');
          this.spawnMark(api, this.named ? 4 : 3);
        }
        const py = H - 74;
        for (const m of this.marks) {
          m.t -= dt;
          if (m.t <= 0) {
            m.dead = true; api.shake(5, 0.2); api.audio.sfx('explode'); api.burst(m.x, m.y, '#bfe0ee', 10);
            if (this.imm <= 0 && Math.abs(m.x - this.x) < m.r + 10 && Math.abs(m.y - py) < m.r + 12) {
              this.lives--; this.imm = 1.3; api.flash(C.blood, 0.25); api.audio.sfx('hurt');
              if (this.lives <= 0) return api.lose();
            }
          }
        }
        this.marks = this.marks.filter((m) => !m.dead);
        api.score = Math.floor(this.z) + this.taunts * (this.named ? 45 : 30);
        if (this.z >= this.need) { api.addScore(80); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        const hz = H * 0.4;
        // dusk flight — the cyclops' isle burning behind
        g2.skyGradient([[0, '#2a1a3a'], [0.6, '#c8583a'], [1, '#f0a050']], hz);
        g2.glow(56, hz - 30, 40, '#ff9040', 0.4);
        // the island + Polyphemus silhouette hurling
        c.fillStyle = '#241a14'; c.beginPath(); c.moveTo(0, hz); c.quadraticCurveTo(50, hz - 60, 120, hz); c.closePath(); c.fill();
        const wind = Math.sin(t * 1.6);
        c.fillStyle = '#1a120e';
        c.fillRect(40, hz - 74, 22, 44); // torso
        c.beginPath(); c.arc(51, hz - 80, 12, 0, 7); c.fill(); // head
        c.save(); c.translate(58, hz - 68); c.rotate(-0.6 + wind * 0.5); c.fillRect(0, -5, 30, 9); c.restore(); // hurling arm
        const e = 0.5 + 0.5 * Math.sin(t * 3); g2.glow(51, hz - 82, 8, '#ff5030', 0.5 * e);
        // mode-7 open water
        g2.mode7({ horizon: hz, camZ: this.z * 2, angle: Math.sin(t * 0.5) * 0.16, height: 1.2, fog: '#3a2a3a', tex: (wx, wz) => ((Math.floor(wx / 40) + Math.floor(wz / 40)) & 1) ? '#16385c' : '#102c4a' });
        // splash markers -> falling boulders
        for (const m of this.marks) {
          const p = clamp(m.t / 1.2, 0, 1);
          c.strokeStyle = 'rgba(255,120,60,' + (0.7 - p * 0.4) + ')'; c.lineWidth = 2;
          c.beginPath(); c.arc(m.x, m.y, m.r * (0.4 + p * 0.8), 0, 7); c.stroke();
          // the boulder falling in
          const by = m.y - p * p * 260;
          c.fillStyle = '#3a3228'; c.beginPath(); c.arc(m.x, by, 8 + (1 - p) * 4, 0, 7); c.fill();
          c.fillStyle = '#544836'; c.beginPath(); c.arc(m.x - 3, by - 3, 4, 0, 7); c.fill();
        }
        // the ship (player)
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) drawShip(api, this.x, H - 74, t, 4);
        c.globalAlpha = 0.5; c.fillStyle = '#bfe8f0'; c.beginPath(); c.ellipse(this.x, H - 52, 24, 6, 0, 0, 7); c.fill(); c.globalAlpha = 1;
        g2.embers(t, 10, { yBottom: H, yTop: hz, color: '#ffb060', speed: 0.15, size: 2, alpha: 0.4 });
        // HUD + horn
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(20,10,10,.75)', '#7a4a2a', 1);
        api.txt('❤'.repeat(Math.max(0, this.lives)), 11, 8, 9, C.blood);
        api.txtCFit('AWAY ' + Math.floor(this.z / this.need * 100) + '%', W / 2 + 10, 8, 8, C.cream, false, 70);
        g2.roundRect(W - 72, 24, 64, 26, 5, this.tauntCd <= 0 ? 'rgba(200,140,40,.9)' : 'rgba(60,40,20,.8)', '#f0c860', 1);
        api.txtCFit('📯 TAUNT', W - 40, 32, 8, this.tauntCd <= 0 ? '#241404' : '#8a6a3a');
        api.vignette();
      },
    };
  }
  /* ============== AEOLUS (optional): the bag of winds ===================== */
  function windbag() {
    return {
      name: 'THE BAG OF WINDS', boss: false, help: 'TAP a crewman before he reaches the bag',
      winText: 'Ithaca in sight — and this time the bag stays bound.',
      loseText: 'The winds burst free and hurl the ship back the way it came.',
      init(api) {
        this.time = 22; this.opened = 0; this.max = 3; this.stopped = 0;
        this.spots = [[38, 240], [118, 300], [212, 236], [166, 356], [64, 372]];
        this.reachers = []; this.spawnT = 1.0;
      },
      update(api, dt) {
        this.time -= dt;
        this.spawnT -= dt;
        if (this.spawnT <= 0 && this.reachers.length < 3) {
          const free = this.spots.map((_, i) => i).filter((i) => !this.reachers.some((r) => r.i === i));
          if (free.length) { this.reachers.push({ i: api.choice(free), t: 0, need: Math.max(0.9, 1.5 - this.time * 0.02) }); }
          this.spawnT = api.rnd(0.6, 1.2) * (this.time < 10 ? 0.72 : 1);
        }
        for (const r of this.reachers) {
          r.t += dt;
          if (r.t >= r.need) {
            r.dead = true; this.opened++; api.shake(6, 0.3); api.flash('#a8d8e8', 0.2); api.audio.sfx('hurt');
            if (this.opened >= this.max) return api.lose();
          }
        }
        if (api.pointer.justDown) {
          for (const r of this.reachers) {
            const s = this.spots[r.i];
            if (!r.dead && Math.hypot(api.pointer.x - s[0], api.pointer.y - s[1]) < 26) {
              r.dead = true; this.stopped++; api.addScore(18); api.audio.sfx('coin'); api.burst(s[0], s[1], C.gold, 6); break;
            }
          }
        }
        this.reachers = this.reachers.filter((r) => !r.dead);
        if (this.time <= 0) { api.addScore(60); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // night deck under stars, the silver bag lashed to the mast
        g2.skyGradient([[0, '#0a1220'], [0.6, '#12203a'], [1, '#0a1524']], H * 0.34);
        g2.stars(t, 40, H * 0.3, '#d8e4f0');
        g2.glow(W - 50, 46, 26, '#c8d6e8', 0.3); c.fillStyle = '#e0e8f0'; c.beginPath(); c.arc(W - 50, 46, 13, 0, 7); c.fill();
        // deck planks (warm timber against the night)
        g2.verticalGradient(0, H * 0.34, W, H * 0.66, [[0, '#4a3218'], [1, '#241608']]);
        for (let yy = H * 0.34; yy < H; yy += 18) { c.fillStyle = 'rgba(20,12,6,.5)'; c.fillRect(0, yy, W, 2); }
        for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(90,62,34,.5)'; c.fillRect(0, H * 0.34 + 40 + i * 64 + Math.sin(t + i) * 2, W, 4); }
        // rail + rigging
        c.fillStyle = '#1a1008'; c.fillRect(0, H * 0.34 - 8, W, 10);
        c.strokeStyle = 'rgba(200,180,140,.2)'; c.lineWidth = 1;
        [[30, 60], [W - 30, 60]].forEach((p) => { c.beginPath(); c.moveTo(W / 2, H * 0.36); c.lineTo(p[0], p[1]); c.stroke(); });
        // mast + the gleaming bag
        c.fillStyle = '#3a2812'; c.fillRect(W / 2 - 5, 96, 10, H * 0.5);
        const bp = 1 + 0.04 * Math.sin(t * 2.4);
        g2.glow(W / 2, 190, 34 * bp, '#b8d8e8', 0.4);
        c.fillStyle = '#c8b8a0'; c.beginPath(); c.ellipse(W / 2, 196, 22 * bp, 28 * bp, 0, 0, 7); c.fill();
        c.fillStyle = '#e8dcc8'; c.beginPath(); c.ellipse(W / 2 - 6, 188, 8, 12, 0, 0, 7); c.fill();
        c.strokeStyle = '#8a6a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(W / 2 - 12, 172); c.lineTo(W / 2 + 12, 168); c.stroke(); // silver cord
        // Odysseus asleep at the stern
        g2.bigSprite(['.rr.', 'rffr', 'BBBB', 'BBBB'], W / 2 - 8, H - 60, { r: '#a83028', f: '#e0b088', B: '#b87a2a' }, 4, { outline: '#140c04' });
        c.fillStyle = 'rgba(230,230,240,.5)'; api.txtC('z z', W / 2 + 20, H - 76, 8, 'rgba(230,230,240,.5)');
        // crew — idle at spots; reaching ones lean toward the bag with a growing ring
        for (let i = 0; i < this.spots.length; i++) {
          const s = this.spots[i], r = this.reachers.find((q) => q.i === i);
          const lean = r ? clamp(r.t / r.need, 0, 1) : 0;
          const lx = s[0] + (W / 2 - s[0]) * lean * 0.24, ly = s[1] + (196 - s[1]) * lean * 0.24;
          g2.bigSprite(CREW, lx - 12, ly - 12, CREWPAL, 4, { shadow: true, outline: '#0c0804' });
          if (r) {
            c.strokeStyle = lean > 0.7 ? '#ff6a4a' : '#f0c860'; c.lineWidth = 2;
            c.beginPath(); c.arc(s[0], s[1], 26 * (1 - lean * 0.5), 0, 7); c.stroke();
            if (lean > 0.7) api.txtC('!', s[0], s[1] - 38, 11, '#ff6a4a');
          }
        }
        g2.fog(t, { y0: H * 0.7, y1: H, bands: 3, color: '#3a4a6a', alpha: 0.07 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,12,20,.8)', '#3a4a6a', 1);
        api.txt('WATCH · ' + Math.ceil(this.time) + 's', 11, 8, 8, C.cream);
        for (let i = 0; i < this.max; i++) g.rect(W - 46 + i * 13, 8, 9, 8, i < this.max - this.opened ? C.teal : '#26301a');
        api.vignette();
      },
    };
  }
  /* ================= CIRCE p1: the potion rite (memory) =================== */
  function potions() {
    const GLYPHS = [
      { id: 0, col: '#e07040', draw(c, x, y) { c.fillStyle = this.col; c.beginPath(); c.arc(x, y + 2, 8, 0, 7); c.fill(); c.fillRect(x - 10, y - 2, 4, 3); c.fillRect(x + 6, y - 2, 4, 3); c.fillStyle = '#3a1c10'; c.fillRect(x - 3, y, 2, 2); c.fillRect(x + 1, y, 2, 2); } }, // swine
      { id: 1, col: '#8ab0c8', draw(c, x, y) { c.fillStyle = this.col; c.beginPath(); c.moveTo(x - 9, y + 8); c.lineTo(x, y - 8); c.lineTo(x + 9, y + 8); c.closePath(); c.fill(); c.fillStyle = '#20303a'; c.fillRect(x - 2, y - 1, 4, 4); } }, // wolf
      { id: 2, col: '#e0b040', draw(c, x, y) { c.fillStyle = this.col; c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill(); c.strokeStyle = this.col; c.lineWidth = 2; for (let a = 0; a < 8; a++) { c.beginPath(); c.moveTo(x + Math.cos(a * 0.785) * 9, y + Math.sin(a * 0.785) * 9); c.lineTo(x + Math.cos(a * 0.785) * 13, y + Math.sin(a * 0.785) * 13); c.stroke(); } } }, // lion
      { id: 3, col: '#a0d8b0', draw(c, x, y) { c.strokeStyle = this.col; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 9, y + 6); c.quadraticCurveTo(x, y - 10, x + 9, y + 6); c.stroke(); c.fillStyle = this.col; c.beginPath(); c.arc(x + 9, y + 5, 3, 0, 7); c.fill(); } }, // serpent
    ];
    return {
      name: 'THE POTION RITE', boss: false, help: 'WATCH the rite — then repeat it, sign for sign',
      winText: 'The cup passes; the spell finds no purchase. The swine are men again.',
      loseText: 'Bristles, hooves, a snout — the sty gains another guest.',
      init(api) {
        this.round = 0; this.rounds = [3, 4, 5]; this.err = 0; this.maxErr = 3;
        this.seq = []; this.idx = 0; this.showT = 0; this.mode = 'watch'; this.flashI = -1;
        this.spots = [[70, 250], [200, 250], [70, 360], [200, 360]];
        this.newRound(api);
      },
      newRound(api) {
        const len = this.rounds[this.round];
        this.seq = []; for (let i = 0; i < len; i++) this.seq.push(api.rint(0, 3));
        this.idx = 0; this.mode = 'watch'; this.showT = 0.8; this.showI = 0;
      },
      update(api, dt) {
        if (this.mode === 'watch') {
          this.showT -= dt;
          if (this.showT <= 0) {
            if (this.showI >= this.seq.length) { this.mode = 'input'; this.flashI = -1; }
            else { this.flashI = this.seq[this.showI]; api.audio.sfx('blip'); this.showI++; this.showT = 0.62; }
          }
          if (this.showT < 0.2) this.flashI = -1;
        } else if (this.mode === 'input' && api.pointer.justDown) {
          for (let i = 0; i < 4; i++) {
            const s = this.spots[i];
            if (Math.hypot(api.pointer.x - s[0], api.pointer.y - s[1]) < 34) {
              if (i === this.seq[this.idx]) {
                this.idx++; api.addScore(15); api.audio.sfx('coin'); api.burst(s[0], s[1], '#c060e0', 6);
                if (this.idx >= this.seq.length) {
                  this.round++;
                  if (this.round >= this.rounds.length) { api.addScore(70); return api.win(); }
                  this.newRound(api);
                }
              } else { this.err++; api.shake(5, 0.25); api.flash('#6a2a8a', 0.2); api.audio.sfx('hurt'); if (this.err >= this.maxErr) return api.lose(); }
              break;
            }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // Circe's marble hall in an enchanted wood — violet light
        g2.verticalGradient(0, 0, W, H, [[0, '#1a1030'], [0.5, '#2a1a44'], [1, '#140c24']]);
        // columns
        for (const px of [26, W - 26]) {
          c.fillStyle = '#c8bca8'; c.fillRect(px - 10, 40, 20, H - 120);
          c.fillStyle = '#e8dcc8'; c.fillRect(px - 10, 40, 5, H - 120);
          c.fillStyle = '#8a7e6a'; c.fillRect(px + 5, 40, 5, H - 120);
          c.fillStyle = '#d8ccb8'; c.fillRect(px - 14, 34, 28, 8); c.fillRect(px - 14, H - 84, 28, 8);
        }
        g2.glow(W / 2, 120, 90, '#a050d0', 0.22 + 0.05 * Math.sin(t * 2));
        // Circe with her wand
        g2.bigSprite(CIRCE, W / 2 - 16, 84, CIRCEPAL, 4, { shadow: true, outline: '#0c0614' });
        const wandTip = { x: W / 2 + 22, y: 96 + Math.sin(t * 2.4) * 3 };
        c.strokeStyle = '#e8c860'; c.lineWidth = 2; c.beginPath(); c.moveTo(W / 2 + 12, 108); c.lineTo(wandTip.x, wandTip.y); c.stroke();
        g2.glow(wandTip.x, wandTip.y, 8, '#e8a0ff', 0.6);
        // the loom behind her (Circe at her weaving)
        c.strokeStyle = 'rgba(200,180,220,.25)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(W / 2 - 40 + i * 16, 60); c.lineTo(W / 2 - 40 + i * 16, 84); c.stroke(); }
        // swine snuffling at the edges
        [[30, H - 66], [W - 44, H - 60]].forEach((s, i) => { g2.bigSprite(['.pp..', 'pppp.', 'pPPpn', '.o.o.'], s[0], s[1] + Math.sin(t * 3 + i) * 1.5, { p: '#e08858', P: '#c86a3a', n: '#8a4a2a', o: '#3a2018' }, 3, { outline: '#140a08' }); });
        // the four sign-bowls
        for (let i = 0; i < 4; i++) {
          const s = this.spots[i], lit = this.flashI === i;
          if (lit) g2.glow(s[0], s[1], 40, GLYPHS[i].col, 0.65);
          g2.roundRect(s[0] - 32, s[1] - 30, 64, 60, 8, lit ? 'rgba(60,40,90,.95)' : 'rgba(28,18,48,.9)', lit ? '#e8c860' : '#6a4a8a', lit ? 2 : 1);
          GLYPHS[i].draw(c, s[0], s[1] - 4);
          c.fillStyle = '#3a2a5a'; c.beginPath(); c.ellipse(s[0], s[1] + 20, 18, 5, 0, 0, 7); c.fill();
        }
        // progress pips for this round
        for (let i = 0; i < this.seq.length; i++) g.rect(W / 2 - this.seq.length * 7 + i * 14, 196, 9, 8, i < this.idx ? '#e8a0ff' : 'rgba(255,255,255,.18)');
        api.txtCFit(this.mode === 'watch' ? '— WATCH THE RITE —' : 'REPEAT THE RITE', W / 2, 174, 9, this.mode === 'watch' ? '#e8a0ff' : C.cream);
        g2.embers(t, 12, { yBottom: H, yTop: 0, color: '#c080e0', speed: 0.07, size: 2, alpha: 0.35 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(14,8,24,.8)', '#5a3a7a', 1);
        api.txt('RITE ' + (this.round + 1) + '/3', 11, 8, 8, '#e8a0ff');
        for (let i = 0; i < this.maxErr; i++) g.rect(W - 46 + i * 13, 8, 9, 8, i < this.maxErr - this.err ? '#c060e0' : '#2a1a3a');
        api.vignette();
      },
    };
  }
  /* ================ CIRCE p2 (boss): the sorceress (lanes) ================ */
  function sorceress() {
    return {
      name: 'THE SORCERESS', boss: true, help: 'TAP LEFT / RIGHT thirds to sidestep her bolts',
      winText: 'Blade at her throat, moly at your breast — Circe yields, and smiles.',
      loseText: 'The hall spins; your hands are hooves before you fall.',
      init(api) {
        this.lane = 1; this.time = 20; this.hits = 0; this.max = api.has('moly') ? 3 : 2;
        this.slow = api.has('wine') ? 0.85 : 1;
        this.bolts = []; this.spawnT = 0.8; this.imm = 0;
      },
      laneX(api, l) { return api.W * (0.25 + l * 0.25); },
      update(api, dt) {
        const H = api.H;
        this.time -= dt; this.imm = Math.max(0, this.imm - dt);
        if (api.pointer.justDown) {
          if (api.pointer.x < api.W * 0.38) this.lane = Math.max(0, this.lane - 1);
          else if (api.pointer.x > api.W * 0.62) this.lane = Math.min(2, this.lane + 1);
        }
        if (api.keyPressed('left')) this.lane = Math.max(0, this.lane - 1);
        if (api.keyPressed('right')) this.lane = Math.min(2, this.lane + 1);
        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          const n = this.time < 8 ? 2 : 1;
          const open = api.rint(0, 2);
          const lanes = [0, 1, 2].filter(() => true);
          let cast = 0;
          for (const l of lanes) { if (l !== open && cast < n) { this.bolts.push({ l, y: 130, s: api.rnd(2.2, 2.9) * this.slow }); cast++; } }
          this.spawnT = api.rnd(0.85, 1.25) * (this.time < 8 ? 0.8 : 1);
          api.audio.sfx('blip');
        }
        for (const b of this.bolts) b.y += b.s * dt * 60;
        const py = H - 84;
        if (this.imm <= 0) for (const b of this.bolts) {
          if (b.l === this.lane && Math.abs(b.y - py) < 16) {
            b.dead = true; this.hits++; this.imm = 1.1; api.shake(6, 0.3); api.flash('#a050d0', 0.25); api.audio.sfx('hurt');
            if (this.hits > this.max) return api.lose();
          }
        }
        this.bolts = this.bolts.filter((b) => !b.dead && b.y < H + 12);
        api.addScore(8 * dt);
        if (this.time <= 0) { api.addScore(80); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        g2.verticalGradient(0, 0, W, H, [[0, '#241444'], [0.6, '#1a1030'], [1, '#100a1e']]);
        // checkered marble floor in perspective
        g2.mode7({ horizon: H * 0.36, camZ: t * 12, angle: 0, height: 1.0, fog: '#241444', tex: (wx, wz) => ((Math.floor(wx / 34) + Math.floor(wz / 34)) & 1) ? '#c8bca8' : '#4a3a5a' });
        for (const px of [22, W - 22]) { c.fillStyle = '#b8ac98'; c.fillRect(px - 8, 0, 16, H * 0.36); c.fillStyle = '#8a7e6a'; c.fillRect(px + 3, 0, 5, H * 0.36); }
        // Circe grown terrible — hovering, wand blazing
        const cy = 70 + Math.sin(t * 1.8) * 5;
        g2.glow(W / 2, cy + 20, 44, '#c060e0', 0.5 + 0.1 * Math.sin(t * 5));
        g2.bigSprite(CIRCE, W / 2 - 20, cy, CIRCEPAL, 5, { shadow: true, outline: '#0c0614' });
        // her bolts
        for (const b of this.bolts) {
          const bx = this.laneX(api, b.l);
          g2.glow(bx, b.y, 12, '#e8a0ff', 0.6);
          c.fillStyle = '#e8a0ff'; c.fillRect(bx - 2, b.y - 9, 4, 18);
          c.fillStyle = '#fff0ff'; c.fillRect(bx - 1, b.y - 6, 2, 8);
        }
        // lane guides
        for (let l = 0; l < 3; l++) { const lx = this.laneX(api, l); c.fillStyle = 'rgba(200,160,240,' + (l === this.lane ? 0.20 : 0.06) + ')'; c.fillRect(lx - 24, H * 0.4, 48, H * 0.6); }
        // Odysseus, sword drawn, in his lane
        const px = this.laneX(api, this.lane);
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) {
          g2.bigSprite(Math.floor(t * 6) % 2 ? ODY_B : ODY_A, px - 16, H - 104, ODYPAL, 4, { shadow: true, outline: '#0c0614' });
          c.strokeStyle = '#d8dce0'; c.lineWidth = 3; c.beginPath(); c.moveTo(px + 14, H - 84); c.lineTo(px + 26, H - 102); c.stroke();
        }
        g2.embers(t, 14, { yBottom: H, yTop: 0, color: '#c080e0', speed: 0.1, size: 2, alpha: 0.4 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(14,8,24,.8)', '#5a3a7a', 1);
        api.txt('HOLD OUT · ' + Math.ceil(this.time) + 's', 11, 8, 8, '#e8a0ff');
        for (let i = 0; i <= this.max; i++) g.rect(W - 59 + i * 13, 8, 9, 8, i <= this.max - this.hits ? '#c060e0' : '#2a1a3a');
        api.vignette();
      },
    };
  }
  /* ================ STRAIT p1: the sirens (rowing rhythm) ================= */
  function sirens() {
    return {
      name: 'THE SIRENS', boss: false, help: 'TAP LEFT and RIGHT as each beat crosses the oar line',
      winText: 'The song fades astern. Odysseus strains at the mast, weeping — alive.',
      loseText: 'The rhythm breaks; the current carries you onto singing rocks.',
      init(api) {
        this.strokes = 0; this.need = 22; this.miss = 0; this.maxMiss = 6;
        this.beats = []; this.spawnT = 0.4; this.side = 0; this.window = api.has('moly') ? 22 : 16;
        this.lineY = api.H - 120; this.sway = 0;
      },
      update(api, dt) {
        const H = api.H;
        this.sway = Math.sin(api.t * 0.9) * 12;
        this.spawnT -= dt;
        if (this.spawnT <= 0) { this.beats.push({ side: this.side, y: 150, hit: false }); this.side = 1 - this.side; this.spawnT = 0.75; }
        for (const b of this.beats) b.y += 96 * dt;
        for (const b of this.beats) {
          if (!b.hit && !b.missed && b.y > this.lineY + this.window) {
            b.missed = true; this.miss++; api.audio.sfx('hurt'); api.shake(3, 0.15);
            if (this.miss >= this.maxMiss) return api.lose();
          }
        }
        if (api.pointer.justDown) {
          const side = api.pointer.x < api.W / 2 ? 0 : 1;
          const b = this.beats.find((q) => !q.hit && !q.missed && q.side === side && Math.abs(q.y - this.lineY) <= this.window);
          if (b) {
            b.hit = true; this.strokes++; api.addScore(16); api.audio.sfx('jump');
            api.burst(side === 0 ? 60 : api.W - 60, this.lineY, '#7ad0e0', 6);
            if (this.strokes >= this.need) { api.addScore(70); return api.win(); }
          } else { this.miss++; api.shake(3, 0.15); api.audio.sfx('hurt'); if (this.miss >= this.maxMiss) return api.lose(); }
        }
        this.beats = this.beats.filter((b) => b.y < H + 10);
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // from the stern: deck below, siren rocks off the bow
        g2.skyGradient([[0, '#c8d8b8'], [0.5, '#8ab8a8'], [1, '#5a8a8a']], H * 0.3);
        // haze sun
        g2.glow(W * 0.3, 54, 30, '#fff0c0', 0.5); c.fillStyle = '#f8ecc0'; c.beginPath(); c.arc(W * 0.3, 54, 13, 0, 7); c.fill();
        g2.verticalGradient(0, H * 0.3, W, H * 0.2, [[0, '#3a7a8a'], [1, '#1c4a5c']]);
        // siren rocks with singers, notes drifting
        [[40, H * 0.30], [W - 60, H * 0.28]].forEach((r, i) => {
          c.fillStyle = '#4a4436'; c.beginPath(); c.moveTo(r[0] - 22, r[1] + 14); c.lineTo(r[0], r[1] - 20); c.lineTo(r[0] + 22, r[1] + 14); c.fill();
          g2.bigSprite(['.ww.', 'wffw', '.ww.', 'gggg'], r[0] - 8, r[1] - 34, { w: '#e8d0a8', f: '#e0b088', g: '#7a9a8a' }, 3, { outline: '#20302a' });
          const np = (t * 0.7 + i * 0.4) % 1;
          c.globalAlpha = (1 - np) * 0.8; api.txtC('♪', r[0] + Math.sin(t * 2 + i * 3) * 10, r[1] - 44 - np * 30, 10 + np * 4, '#f0e0a0'); c.globalAlpha = 1;
        });
        // the deck (bottom half), swaying with the song
        c.save(); c.translate(this.sway * 0.4, 0);
        g2.verticalGradient(-20, H * 0.5, W + 40, H * 0.5, [[0, '#5a3c1c'], [1, '#2a1a0c']]);
        for (let yy = H * 0.5; yy < H; yy += 20) { c.fillStyle = 'rgba(20,12,6,.5)'; c.fillRect(-20, yy, W + 40, 2); }
        // the mast with Odysseus lashed
        c.fillStyle = '#3a2812'; c.fillRect(W / 2 - 6, H * 0.34, 12, H * 0.4);
        g2.bigSprite(ODY_A, W / 2 - 16, H * 0.44, ODYPAL, 4, { outline: '#140c04' });
        c.strokeStyle = '#c8a870'; c.lineWidth = 3;
        for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(W / 2 - 15, H * 0.46 + i * 12); c.lineTo(W / 2 + 15, H * 0.48 + i * 12); c.stroke(); }
        // rowing crew (wax-eared), pulling with the hit flashes
        [[52, H - 84], [W - 52, H - 84]].forEach((p, side) => {
          g2.bigSprite(CREW, p[0] - 12, p[1] - 12, CREWPAL, 4, { shadow: true, outline: '#140c04' });
          c.fillStyle = '#e8d060'; c.fillRect(p[0] - 8, p[1] - 9, 3, 3); c.fillRect(p[0] + 5, p[1] - 9, 3, 3); // wax plugs
        });
        c.restore();
        // beat lanes
        for (const side of [0, 1]) {
          const bx = side === 0 ? 60 : W - 60;
          c.fillStyle = 'rgba(122,208,224,.08)'; c.fillRect(bx - 20, 150, 40, this.lineY - 130);
        }
        g.rect(24, this.lineY, W - 48, 3, '#7ad0e0');
        api.txtC('◀ OAR', 60, this.lineY + 10, 8, '#7ad0e0'); api.txtC('OAR ▶', W - 60, this.lineY + 10, 8, '#7ad0e0');
        // the beats — oar-blade tokens falling to the line
        for (const b of this.beats) {
          if (b.hit) continue;
          const bx = b.side === 0 ? 60 : W - 60;
          const near = Math.abs(b.y - this.lineY) <= this.window;
          if (near) g2.glow(bx, b.y, 16, '#7ad0e0', 0.5);
          c.fillStyle = b.missed ? '#5a4a3a' : near ? '#bfe8f0' : '#7ab8c8';
          c.fillRect(bx - 12, b.y - 4, 24, 8);
          c.fillStyle = b.missed ? '#3a2e24' : '#4a8a9a'; c.fillRect(bx - 12, b.y + 2, 24, 2);
        }
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,20,24,.8)', '#3a6a7a', 1);
        api.txt('STROKES ' + this.strokes + '/' + this.need, 11, 8, 8, '#7ad0e0');
        api.txtCFit('SLIPS ' + this.miss + '/' + this.maxMiss, W - 44, 8, 8, C.dim, false, 80);
        api.vignette();
      },
    };
  }
  /* ============ STRAIT p2 (boss): Scylla and Charybdis ==================== */
  function scylla() {
    return {
      name: 'SCYLLA & CHARYBDIS', boss: true,
      help: 'TAP the striking heads · DRAG LEFT when the whirlpool pulls',
      winText: 'Six heads scream, cheated. The little ship threads the strait.',
      loseText: 'The sea folds over what the heads left behind.',
      init(api) {
        this.time = 22; this.taken = 0; this.max = 4; this.heads = []; this.spawnT = 0.8;
        this.pull = 0; this.pullT = 0; this.nextPull = 6; this.shipX = api.W * 0.42;
        this.crew = [[-40, 0], [-14, 6], [12, 0], [38, 6]];
        this.slow = api.has('wine') ? 1.2 : 1; // Maron's wine: the ordeal strikes more slowly
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.time -= dt;
        // Scylla strikes
        this.spawnT -= dt;
        if (this.spawnT <= 0 && this.heads.length < 3) {
          const target = api.rint(0, this.crew.length - 1);
          this.heads.push({ target, t: 0, tele: 0.7 * this.slow, lunge: 0.55 * this.slow, x: W - 30 - api.rnd(0, 30), y: 90 + api.rnd(0, 50) });
          this.spawnT = api.rnd(0.8, 1.4) * (this.time < 10 ? 0.75 : 1);
        }
        const deckY = H - 96;
        for (const h of this.heads) {
          h.t += dt;
          const cx = this.shipX + this.crew[h.target][0];
          if (h.t > h.tele + h.lunge) {
            h.dead = true; this.taken++; api.shake(8, 0.4); api.flash(C.blood, 0.25); api.audio.sfx('explode');
            if (this.taken >= this.max) return api.lose();
          }
        }
        if (api.pointer.justDown) {
          for (const h of this.heads) {
            const p = h.t <= h.tele ? 0 : (h.t - h.tele) / h.lunge;
            const cx = this.shipX + this.crew[h.target][0];
            const hx = h.x + (cx - h.x) * p, hy = h.y + (deckY - h.y) * p;
            if (!h.dead && Math.hypot(api.pointer.x - hx, api.pointer.y - hy) < 26) {
              h.dead = true; api.addScore(35); api.audio.sfx('shoot'); api.burst(hx, hy, '#7ad0a0', 10); break;
            }
          }
        }
        this.heads = this.heads.filter((h) => !h.dead);
        // Charybdis pulls
        this.nextPull -= dt;
        if (this.nextPull <= 0) { this.pull = 1; this.pullT = 1.6; this.nextPull = api.rnd(5.5, 7.5); api.audio.sfx('power'); }
        if (this.pull) {
          this.pullT -= dt;
          this.shipX += 26 * dt; // dragged toward the maw
          if (api.pointer.down && api.pointer.x < this.shipX) this.shipX -= 62 * dt;
          if (this.shipX > W * 0.72) { this.pull = 0; this.taken++; api.shake(9, 0.5); api.flash('#2a6a7a', 0.3); api.audio.sfx('explode'); this.shipX = W * 0.5; if (this.taken >= this.max) return api.lose(); }
          if (this.pullT <= 0) this.pull = 0;
        } else { this.shipX += (W * 0.42 - this.shipX) * 0.8 * dt; }
        api.addScore(7 * dt);
        if (this.time <= 0) { api.addScore(90); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the strait: sheer cliffs both sides, sickly green water
        g2.skyGradient([[0, '#2a3a3a'], [0.7, '#3a5a52'], [1, '#2a4a44']], H * 0.4);
        g2.fog(t, { y0: 0, y1: H * 0.42, bands: 4, color: '#7a9a8a', alpha: 0.1 });
        // water
        g2.verticalGradient(0, H * 0.4, W, H * 0.6, [[0, '#1e4a44'], [1, '#0c2624']]);
        c.strokeStyle = 'rgba(150,220,200,.14)';
        for (let i = 0; i < 6; i++) { const sy = H * 0.46 + i * 36; c.beginPath(); for (let x = 0; x <= W; x += 8) c.lineTo(x, sy + Math.sin(t * 3 + x * 0.07 + i) * 3); c.stroke(); }
        // left cliff (Charybdis side) + the whirlpool
        c.fillStyle = '#242e26'; c.beginPath(); c.moveTo(0, H); c.lineTo(0, 30); c.lineTo(34, 60); c.lineTo(22, H * 0.5); c.lineTo(44, H); c.fill();
        const wx = 54, wy = H - 60;
        c.save(); c.translate(wx, wy);
        for (let i = 0; i < 4; i++) { c.strokeStyle = 'rgba(160,230,220,' + (0.5 - i * 0.1) + ')'; c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, 6 + i * 8, -t * (3 - i * 0.4), -t * (3 - i * 0.4) + 4.6); c.stroke(); }
        c.restore();
        if (this.pull) { g2.glow(wx, wy, 40, '#7ae0d0', 0.4 + 0.2 * Math.sin(t * 9)); api.txtC('◀ PULL AWAY!', W / 2, H * 0.44, 10, '#aef0e0'); }
        // right cliff — Scylla's lair, six necks coiling from the cave
        c.fillStyle = '#1e2820'; c.beginPath(); c.moveTo(W, H); c.lineTo(W, 20); c.lineTo(W - 60, 44); c.lineTo(W - 40, 130); c.lineTo(W - 66, H * 0.6); c.lineTo(W - 30, H); c.fill();
        c.fillStyle = '#0a120c'; c.beginPath(); c.ellipse(W - 44, 96, 26, 34, 0.3, 0, 7); c.fill();
        // idle necks writhing at the cave mouth
        for (let i = 0; i < 3; i++) {
          c.strokeStyle = '#2e4a3a'; c.lineWidth = 5;
          c.beginPath(); c.moveTo(W - 44, 96 + i * 8);
          c.quadraticCurveTo(W - 70 - Math.sin(t * 2 + i * 2) * 12, 80 + i * 16, W - 60 - Math.sin(t * 1.6 + i) * 16, 60 + i * 22); c.stroke();
        }
        // striking heads: neck + head from lair to target
        const deckY = H - 96;
        for (const h of this.heads) {
          const p = h.t <= h.tele ? 0 : clamp((h.t - h.tele) / h.lunge, 0, 1);
          const cx = this.shipX + this.crew[h.target][0];
          const hx = h.x + (cx - h.x) * p, hy = h.y + (deckY - h.y) * p;
          c.strokeStyle = '#2e4a3a'; c.lineWidth = 6;
          c.beginPath(); c.moveTo(W - 44, 96); c.quadraticCurveTo((W - 44 + hx) / 2 + 20, hy - 60, hx, hy); c.stroke();
          if (h.t <= h.tele) { const bl = Math.floor(t * 10) % 2; if (bl) g2.glow(hx, hy, 18, '#ffd040', 0.5); }
          g2.bigSprite(SCYLLA_HEAD, hx - 14, hy - 12, SCYLLAPAL, 4, { outline: '#0a120c' });
        }
        // the ship with crew
        drawShip(api, this.shipX, deckY + 22, t, 4);
        for (const cw of this.crew) g2.bigSprite(CREW, this.shipX + cw[0] - 9, deckY - 20 + cw[1], CREWPAL, 3, { outline: '#0c0a06' });
        g2.embers(t, 8, { yBottom: H, yTop: H * 0.4, color: '#9ae0c0', speed: 0.12, size: 2, alpha: 0.3 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,16,14,.8)', '#2e5a4a', 1);
        api.txt('THREAD · ' + Math.ceil(this.time) + 's', 11, 8, 8, '#9ae0c0');
        api.txtCFit('LOST ' + this.taken + '/' + this.max, W - 44, 8, 8, C.dim, false, 80);
        api.vignette();
      },
    };
  }
  /* =================== ITHACA p1: the great bow =========================== */
  function greatbow() {
    return {
      name: 'THE GREAT BOW', boss: false,
      help: 'TAP to brace as the marker crosses gold — then loose through the axes',
      winText: 'The arrow sings through all twelve rings. The hall goes silent.',
      loseText: 'The bow bests you, as it bested every suitor.',
      init(api) { this.stage = 0; this.braces = 0; this.needB = 3; this.miss = 0; this.m = 0; this.dir = 1; this.spd = 1.1; this.band = 0.16; this.aim = 0; this.aimDir = 1; },
      update(api, dt) {
        if (this.stage === 0) {
          this.m += this.dir * this.spd * dt; if (this.m > 1) { this.m = 1; this.dir = -1; } if (this.m < 0) { this.m = 0; this.dir = 1; }
          if (api.confirm()) {
            if (Math.abs(this.m - 0.5) < this.band) {
              this.braces++; api.addScore(25); api.audio.sfx('coin'); api.shake(3, 0.15);
              this.spd += 0.3; this.band = Math.max(0.09, this.band - 0.025);
              if (this.braces >= this.needB) { this.stage = 1; api.audio.sfx('power'); }
            } else { this.miss++; api.shake(4, 0.2); api.audio.sfx('hurt'); if (this.miss >= 4) return api.lose(); }
          }
        } else {
          this.aim += this.aimDir * 1.4 * dt; if (this.aim > 1) { this.aim = 1; this.aimDir = -1; } if (this.aim < 0) { this.aim = 0; this.aimDir = 1; }
          if (api.confirm()) {
            if (Math.abs(this.aim - 0.5) < 0.09) { api.addScore(120); api.flash('#fff0c0', 0.3); api.audio.sfx('win'); return api.win(); }
            else { this.miss++; api.shake(5, 0.25); api.audio.sfx('hurt'); if (this.miss >= 4) return api.lose(); }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the hall at Ithaca — torchlit columns, the axe row
        g2.verticalGradient(0, 0, W, H, [[0, '#241608'], [0.5, '#3a2410'], [1, '#180e06']]);
        g2.stoneWall(0, 0, W, H * 0.3, { base: '#4a3a24', light: '#6a5434', dark: '#2a2012', mortar: '#180e06', moss: '#4a4424' }, 0);
        for (const px of [30, W - 30]) { g2.flame(px, 76, t, 1.3); g2.glow(px, 76, 34, 'rgba(255,150,40,.5)', 0.4); c.fillStyle = '#2a1c0e'; c.fillRect(px - 4, 82, 8, H * 0.2); }
        // floor
        g2.verticalGradient(0, H * 0.3, W, H * 0.7, [[0, '#3a2814'], [1, '#1a1008']]);
        for (let i = 0; i < 5; i++) { c.strokeStyle = 'rgba(200,150,80,.1)'; c.beginPath(); c.moveTo(W / 2 + (i - 2) * 30, H * 0.3); c.lineTo(W / 2 + (i - 2) * 110, H); c.stroke(); }
        // the twelve axes receding up the hall
        for (let i = 0; i < 12; i++) {
          const p = i / 11, ax = W / 2 + (p - 0.5) * 8, ay = H * 0.32 + p * 4;
          const s = 1.3 - p * 0.9, ringY = ay - 40 * s + (H * 0.34 - ay) * 0 + 130 - i * 9;
          const axx = W / 2, axy = H * 0.60 - i * 26 * 0.9 + 60;
          if (axy < H * 0.30) continue;
          c.fillStyle = '#3a2c18'; c.fillRect(axx - 2 * s, axy, 4 * s, 30 * s);
          c.fillStyle = '#8a9098'; c.beginPath(); c.arc(axx, axy - 4 * s, 9 * s, Math.PI * 0.2, Math.PI * 0.8, true); c.fill();
          c.strokeStyle = '#c8ccd4'; c.lineWidth = Math.max(1, 2 * s);
          c.beginPath(); c.arc(axx, axy - 8 * s, 6 * s, 0, 7); c.stroke();
        }
        // Odysseus (still the beggar, hood back) with the bow
        const px = W / 2 - 60;
        g2.bigSprite(Math.floor(t * 4) % 2 && this.stage === 0 ? ODY_B : ODY_A, px - 16, H - 130, ODYPAL, 4, { shadow: true, outline: '#0c0804' });
        // the bow — bends with braces
        const bend = this.stage === 1 ? 1 : this.braces / this.needB;
        c.strokeStyle = '#c89858'; c.lineWidth = 4;
        c.beginPath(); c.moveTo(px + 18, H - 150); c.quadraticCurveTo(px + 34 + bend * 12, H - 110, px + 18, H - 70); c.stroke();
        c.strokeStyle = '#e8e0c8'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(px + 18, H - 150); c.lineTo(px + 18 - bend * 10, H - 110); c.lineTo(px + 18, H - 70); c.stroke();
        // suitors jeering at the sides
        [[26, H - 60], [W - 40, H - 66]].forEach((s, i) => { g2.bigSprite(SUITOR, s[0], s[1] + Math.sin(t * 3 + i * 2) * 1.5, SUITORPAL, 3, { outline: '#0c0804' }); });
        if (this.stage === 0) {
          // brace meter
          const mx = 26, mw = W - 52, my = H - 30;
          g2.roundRect(mx - 5, my - 6, mw + 10, 18, 4, 'rgba(14,8,4,.85)', '#6a4a24', 1);
          g.rect(mx, my, mw, 6, '#241a10');
          const gz = mx + mw * (0.5 - this.band); g2.glow(gz + mw * this.band, my + 3, 12, C.gold, 0.4);
          g.rect(gz, my, mw * this.band * 2, 6, '#8a6a1a');
          g.rect(mx + mw * this.m - 2, my - 3, 4, 12, '#f0e0b0');
          api.txtCFit('BRACE ' + this.braces + '/' + this.needB, W / 2, H - 46, 9, C.gold);
        } else {
          // aim line up the axe rings
          const ay = H * 0.56 - this.aim * (H * 0.24);
          c.strokeStyle = 'rgba(240,200,96,.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(40, H * 0.56); c.lineTo(40, H * 0.32); c.stroke();
          const near = Math.abs(this.aim - 0.5) < 0.09;
          if (near) g2.glow(40, ay, 12, C.gold, 0.7);
          c.fillStyle = near ? C.gold : '#c8b890'; c.beginPath(); c.moveTo(34, ay); c.lineTo(46, ay - 4); c.lineTo(46, ay + 4); c.fill();
          api.txtCFit(near ? '▸ LOOSE! ◂' : 'WAIT FOR THE LINE…', W / 2, H - 46, 9, near ? C.gold : C.dim);
        }
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(14,8,4,.8)', '#6a4a24', 1);
        api.txt(this.stage === 0 ? 'STRING THE BOW' : 'THE TWELVE AXES', 11, 8, 8, C.gold);
        for (let i = 0; i < 4; i++) g.rect(W - 58 + i * 13, 8, 9, 8, i < 4 - this.miss ? '#e8a030' : '#3a2a1a');
        api.vignette();
      },
    };
  }
  /* ============== ITHACA p2 (boss): the hall of suitors =================== */
  function suitors() {
    return {
      name: 'THE HALL OF SUITORS', boss: true,
      help: 'TAP the suitors as they break cover — SPARE the servants in white',
      winText: 'The hall is swept clean. Penelope descends the stair at last.',
      loseText: 'Overrun at the threshold — twenty years, undone at the door.',
      init(api) {
        this.slain = 0; this.need = 10; this.breach = 0; this.maxB = api.has('crew') ? 4 : 3; this.sparedFail = 0;
        this.spots = [[46, 150], [136, 128], [224, 150], [66, 250], [204, 250], [136, 320]];
        this.pops = []; this.spawnT = 0.6;
      },
      update(api, dt) {
        this.spawnT -= dt;
        if (this.spawnT <= 0 && this.pops.length < 3) {
          const free = this.spots.map((_, i) => i).filter((i) => !this.pops.some((p) => p.i === i));
          if (free.length) this.pops.push({ i: api.choice(free), t: 0, hold: api.rnd(1.0, 1.4) * (api.has('wine') ? 1.15 : 1), ally: Math.random() < 0.22 });
          this.spawnT = api.rnd(0.45, 0.85);
        }
        for (const p of this.pops) {
          p.t += dt;
          if (p.t >= p.hold) {
            p.dead = true;
            if (!p.ally) { this.breach++; api.shake(6, 0.3); api.flash(C.blood, 0.2); api.audio.sfx('hurt'); if (this.breach >= this.maxB) return api.lose(); }
          }
        }
        if (api.pointer.justDown) {
          for (const p of this.pops) {
            const s = this.spots[p.i];
            if (!p.dead && Math.hypot(api.pointer.x - s[0], api.pointer.y - s[1]) < 30) {
              p.dead = true;
              if (p.ally) { this.sparedFail++; api.shake(5, 0.3); api.flash('#e8e0d0', 0.25); api.audio.sfx('hurt'); if (this.sparedFail >= 2) return api.lose(); }
              else {
                this.slain++; api.addScore(30); api.audio.sfx('shoot'); api.burst(s[0], s[1], C.gold, 8);
                if (this.slain >= this.need) { api.addScore(110); return api.win(); }
              }
              break;
            }
          }
        }
        this.pops = this.pops.filter((p) => !p.dead);
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the great hall: columns, long tables, torchlight
        g2.verticalGradient(0, 0, W, H, [[0, '#2a1a0c'], [0.5, '#3a2410'], [1, '#1a1008']]);
        g2.stoneWall(0, 0, W, H * 0.26, { base: '#4a3a24', light: '#6a5434', dark: '#2a2012', mortar: '#180e06', moss: '#44401e' }, 0);
        for (const px of [24, 136, W - 24]) { c.fillStyle = '#c8b088'; c.fillRect(px - 9, H * 0.26 - 60, 18, 60); c.fillStyle = '#8a7452'; c.fillRect(px + 4, H * 0.26 - 60, 5, 60); }
        g2.flame(80, 60, t, 1.2); g2.flame(W - 80, 60, t, 1.2);
        g2.glow(W / 2, H * 0.4, 120, '#e08030', 0.16);
        // overturned tables (the cover spots)
        for (const s of this.spots) {
          c.fillStyle = '#5a3c1c'; c.fillRect(s[0] - 34, s[1] + 8, 68, 14);
          c.fillStyle = '#7a5428'; c.fillRect(s[0] - 34, s[1] + 8, 68, 4);
          c.fillStyle = '#3a2810'; c.fillRect(s[0] - 30, s[1] + 22, 8, 6); c.fillRect(s[0] + 22, s[1] + 22, 8, 6);
        }
        // pop-ups rising behind cover
        for (const p of this.pops) {
          const s = this.spots[p.i];
          const up = Math.min(1, p.t / 0.18) * (p.t > p.hold - 0.15 ? (p.hold - p.t) / 0.15 : 1);
          const py = s[1] + 10 - up * 26;
          if (!p.ally && p.t > p.hold - 0.4 && Math.floor(t * 10) % 2) g2.glow(s[0], py, 20, C.blood, 0.4);
          g2.bigSprite(p.ally ? ALLY : SUITOR, s[0] - 12, py - 14, p.ally ? ALLYPAL : SUITORPAL, 4, { outline: '#0c0804' });
          if (p.ally) api.txtC('SPARE', s[0], py - 30, 7, '#e8e0d0');
        }
        // Odysseus at the threshold with the great bow (foreground, bottom)
        g2.bigSprite(ODY_A, W / 2 - 20, H - 84, ODYPAL, 5, { shadow: true, outline: '#0c0804' });
        c.strokeStyle = '#c89858'; c.lineWidth = 3; c.beginPath(); c.moveTo(W / 2 + 16, H - 84); c.quadraticCurveTo(W / 2 + 30, H - 58, W / 2 + 16, H - 32); c.stroke();
        g2.embers(t, 10, { yBottom: H, yTop: 0, color: '#e0a040', speed: 0.08, size: 2, alpha: 0.35 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(14,8,4,.8)', '#6a4a24', 1);
        api.txt('SUITORS ' + this.slain + '/' + this.need, 11, 8, 8, C.gold);
        for (let i = 0; i < this.maxB; i++) g.rect(W - 46 + i * 13, 8, 9, 8, i < this.maxB - this.breach ? '#e8a030' : '#3a2a1a');
        api.vignette();
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'odyssey', title: 'The Odyssey', subtitle: 'THE LONG WAY HOME',
    currency: 'GLORY', accent: C.gold, ownPhaseHud: true,
    titleFont: TITLE, // stele-cut condensed pixel capitals
    uiFont: "'Pixelify Sans','Press Start 2P',monospace",
    credit: 'A 16-BIT EPIC · HOMER, c. 700 BC',
    bootCta: 'TAP TO SET SAIL', bootLine: 'FIVE ISLANDS · ONE HOME',
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.gold, blood: C.blood, cream: C.cream, dim: C.dim },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'MAKE FOR AN ISLAND', mapDone: 'ITHACA IS WON',
    screens: {
      overlay: 'rgba(5,12,22,.85)', win: '#f0c860', lose: '#c85040', chapterLabel: '#8aa8b8',
      name: '#f4e8d0', sub: '#4ac8d4', intro: '#d8e8f0', quote: '#8aa8b8', help: '#f0c860',
      score: '#f4e8d0', cur: '#f0c860', cta: '#f4e8d0',
    },
    labels: {
      chapter: 'BOOK', phase: 'TRIAL', boss: 'THE ORDEAL', score: 'GLORY WON',
      win: 'THE GODS SMILE', lose: 'POSEIDON PREVAILS', nextPhaseWin: 'THE TRIAL IS PASSED',
      cont: 'TAP TO SAIL ON', toMap: 'TAP FOR THE CHART', play: 'TAP TO SET SAIL',
      nextPhase: 'TAP TO SAIL ON', toFinale: 'TAP FOR ITHACA',
    },
    upgrades: {
      wine: { name: "MARON'S WINE", desc: 'ordeals strike more slowly' },
      winds: { name: 'THE BAG OF WINDS', desc: 'one more hull on the open sea' },
      moly: { name: 'THE MOLY HERB', desc: 'charms and rhythms come easier' },
      crew: { name: 'THE LOYAL CREW', desc: 'Telemachus holds one more breach' },
    },
    nodes: [
      {
        id: 'cyclops', name: 'THE CYCLOPS', sub: 'THE CAVE OF POLYPHEMUS', reward: 60, grant: 'wine',
        icon(api, x, y) { const g = api.gfx; g.circle(x, y, 7, '#7a6e4a'); g.circle(x, y, 3, '#ffd040'); },
        intro: ['Trapped in the cave of the', 'one-eyed shepherd giant, who', 'eats two men a night. The way', 'out must be carved in the dark.'],
        quote: 'Nobody — that is my name. Nobody, so my mother and father call me.',
        choice: { prompt: 'Clear of the shore, do you shout your true name?', options: [{ label: 'Shout it — let the giant curse ODYSSEUS', flag: 'named' }, { label: 'Stay Nobody. Slip away in silence', flag: 'nobody' }] },
        winText: 'The flock carries you out beneath the giant\'s blind hands.',
        phases: [stake(), boulders()],
      },
      {
        id: 'aeolus', name: 'AEOLUS', sub: 'THE BAG OF WINDS', needs: ['cyclops'], optional: true, reward: 40, grant: 'winds',
        icon(api, x, y) { const c = api.ctx; c.strokeStyle = '#bfe0ee'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 6, 0.5, 5); c.stroke(); },
        intro: ['The wind-king sews every gale', 'into an ox-hide bag. Nine days', 'home — if the crew\'s curious', 'fingers can be kept off it.'],
        quote: 'He flayed a bag of nine-year ox-hide, and bound the roaring winds inside.',
        winText: 'The bag stays bound. The west wind alone carries you on.',
        phases: [windbag()],
      },
      {
        id: 'circe', name: 'CIRCE', sub: 'THE ISLE OF AIAIA', needs: ['cyclops'], reward: 60, grant: 'moly',
        icon(api, x, y) { const g = api.gfx; g.circle(x, y, 6, '#c060e0'); g.rect(x - 1, y - 9, 2, 6, '#e8c860'); },
        intro: ['The sorceress turns sailors to', 'swine with a cup and a word.', 'Hermes offers a black-rooted', 'herb — and a warning.'],
        quote: 'They had the heads and voices and bristles of swine, but their minds were unchanged.',
        winText: 'Circe breaks the spell — and tells you the way past the Sirens.',
        phases: [potions(), sorceress()],
      },
      {
        id: 'strait', name: 'THE STRAIT', sub: 'SONG AND SIX HEADS', needs: ['circe'], reward: 70, grant: 'crew',
        icon(api, x, y) { api.txtC('♪', x, y - 7, 11, '#f0e0a0'); },
        intro: ['Wax for the crew, ropes for', 'the captain — the Sirens first,', 'then the narrow water between', 'the whirlpool and the six heads.'],
        quote: 'Row past, and if you would hear the Sirens, be bound hand and foot to the mast.',
        winText: 'Sung at, snapped at, all but swallowed — and through.',
        phases: [sirens(), scylla()],
      },
      {
        id: 'ithaca', name: 'ITHACA', sub: 'THE BEGGAR AT THE DOOR', needs: ['strait'], reward: 100,
        icon(api, x, y) { const c = api.ctx; c.strokeStyle = '#c89858'; c.lineWidth = 2; c.beginPath(); c.arc(x - 2, y, 8, -1.2, 1.2); c.stroke(); api.gfx.rect(x - 3, y - 1, 10, 2, '#e8e0c8'); },
        intro: ['Twenty years gone. A beggar', 'in his own hall watches the', 'suitors eat his house bare.', 'Only one man can string the bow.'],
        quote: 'There will be killing till the score is paid.',
        winText: 'The wanderer is home, the hall is his, the long tale is told.',
        phases: [greatbow(), suitors()],
      },
    ],
    endings: [
      { when: (f) => f.named, title: 'THE WRATH OUTLASTED', lines: ['You shouted your name at the sea,', 'and the sea made you pay for it —', 'ten years, every ship, every man.', '', 'But Poseidon\'s grudge broke first.', 'Odysseus of Ithaca came home.'] },
      { when: (f) => f.nobody, title: 'THE CUNNING ONE', lines: ['You left the giant cursing', 'Nobody, and no god ever knew', 'whose sail to sink.', '', 'The clever way home is quieter —', 'but it is still home.'] },
      { when: () => true, title: 'HOME AT LAST', lines: ['The bow is strung, the hall is', 'swept, the olive-tree bed stands.', 'The long way home is done.'] },
    ],
    finale: ['ITHACA IS WON.'],
  });
})();
