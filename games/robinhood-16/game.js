/* ============================================================================
 * ROBIN HOOD — THE OUTLAW OF SHERWOOD   (Gen 4 / 16-bit)
 * A richer, sun-dappled take on the Robin Hood legend, built on RetroSaga2:
 *   a SHERWOOD hub-map of the tale (Nottingham fair -> the greenwood -> the
 *   castle), every stop playable from the start; each node is multiple
 *   escalating phases ending in a mini-boss (Gisborne, the Bishop's guard,
 *   Little John, the gallows, the Sheriff); persistent gear (longbow, horn,
 *   quarterstaff) carries across the run; a tournament CHOICE sets the ending.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2.  Keeps the 8-bit game's
 * split-the-shaft archery, but expands to a hub + phases + bosses + endings.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const G = {
    sky1: '#bfe89a', sky2: '#7ec24a', sky3: '#3e7a26',
    leaf: '#2f7a2a', leafL: '#5fbf3a', leafD: '#173d14', canopy: '#1c4a18',
    grass: '#3f8a2c', grassD: '#245018',
    gold: '#e3c567', goldL: '#ffe14d', bark: '#6a4a28', barkD: '#3a2814',
    green: '#5dff8f', cloth: '#2f6b2a', clothD: '#1a3d16',
    blood: '#c8102e', cream: '#f0e6c0', dim: '#93a86a', shadow: '#0a1606',
    stone: '#8a8478', stoneD: '#4a4640', torch: '#ffb040',
  };
  // bold pixel display face for every hero title — period-correct 16-bit.
  const TITLE = "'Jersey 25','Press Start 2P',sans-serif";

  /* ─── heraldic crest: crossed arrow over a longbow on a green shield ─── */
  function emblem(api, cx, cy) {
    const g2 = api.g2, c = api.ctx;
    g2.glow(cx, cy, 40, '#3a8a2a', 0.6);
    c.fillStyle = '#173d14';
    c.beginPath(); c.moveTo(cx - 26, cy - 18); c.lineTo(cx + 26, cy - 18); c.lineTo(cx + 26, cy + 6);
    c.quadraticCurveTo(cx + 26, cy + 26, cx, cy + 30); c.quadraticCurveTo(cx - 26, cy + 26, cx - 26, cy + 6); c.closePath(); c.fill();
    c.strokeStyle = G.gold; c.lineWidth = 2; c.stroke();
    // longbow (curve) + arrow across it
    c.strokeStyle = '#c8a24a'; c.lineWidth = 3;
    c.beginPath(); c.arc(cx + 8, cy + 4, 20, Math.PI * 0.62, Math.PI * 1.38); c.stroke();
    c.strokeStyle = '#e8dcc0'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(cx + 12, cy - 14); c.lineTo(cx + 12, cy + 22); c.stroke(); // string
    c.strokeStyle = G.cream; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 20, cy + 10); c.lineTo(cx + 20, cy - 8); c.stroke(); // arrow shaft
    c.fillStyle = '#d8d0b0'; c.beginPath(); c.moveTo(cx + 20, cy - 8); c.lineTo(cx + 13, cy - 9); c.lineTo(cx + 15, cy - 2); c.closePath(); c.fill(); // head
    c.fillStyle = G.blood; api.gfx.sprite(['f.', 'ff', 'f.'], cx - 22, cy + 8, { f: G.blood }, 2); // fletch
  }

  /* ─── animated sunlit greenwood: layered canopy, sunbeams, drifting motes,
   *     birds. Shared by boot/intro/result/finale/hub. ─── */
  function treeRow(c, W, baseY, step, h, seed, color) {
    c.fillStyle = color;
    for (let x = -step; x <= W + step; x += step) {
      const tx = x + Math.sin(seed + x) * 4, r = h * (0.7 + 0.3 * Math.abs(Math.sin(seed * 2 + x)));
      c.beginPath(); c.arc(tx, baseY, r, 0, 7); c.fill();
    }
  }
  function greenwood(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, '#cdeaa0'], [0.4, '#8fce5e'], [1, '#4d8a2e']]);
    // hazy sun
    g2.glow(W - 46, 50, 42 + 4 * Math.sin(t * 0.8), '#fff6c0', 0.7);
    c.fillStyle = '#fff8d0'; c.beginPath(); c.arc(W - 46, 50, 18, 0, 7); c.fill();
    // slanting sunbeams
    c.save(); c.globalAlpha = 0.10;
    for (let i = 0; i < 4; i++) { c.fillStyle = '#fbffd0'; c.beginPath(); const bx = W - 90 + i * 30; c.moveTo(bx, 0); c.lineTo(bx + 34, 0); c.lineTo(bx - 60, H); c.lineTo(bx - 94, H); c.closePath(); c.fill(); }
    c.restore();
    // layered canopy (far -> near)
    treeRow(c, W, H * 0.30, 44, 22, 1.3, '#3f7a2c');
    treeRow(c, W, H * 0.42, 56, 30, 2.7, '#2f6322');
    treeRow(c, W, H * 0.56, 70, 40, 4.1, '#1f4a18');
    // ground
    c.fillStyle = '#2f6320'; c.fillRect(0, H * 0.6, W, H * 0.4);
    c.fillStyle = '#26521a'; c.fillRect(0, H * 0.6, W, 5);
    // grass blades + wildflowers
    for (let i = 0; i < 60; i++) { const gx = (i * 41) % W, gy = H * 0.62 + (i * 53) % (H * 0.36); c.fillStyle = (i % 7 === 0) ? '#e8c84a' : '#3f8a2c'; c.fillRect(gx, gy, 1, (i % 5 === 0) ? 4 : 3); }
    // drifting light motes
    for (let i = 0; i < 14; i++) { const mx = (i * 71 + t * 12) % W, my = (i * 47 + Math.sin(t + i) * 10) % (H * 0.55) + 12; c.fillStyle = 'rgba(255,250,200,.5)'; c.fillRect(mx, my, 2, 2); }
    // a bird or two
    for (let i = 0; i < 2; i++) { const bx = ((t * 20) + i * 130) % (W + 40) - 20, by = 40 + i * 22 + Math.sin(t * 2 + i) * 6; const up = Math.sin(t * 9 + i) > 0; api.gfx.sprite(up ? ['k..k', '.kk.'] : ['....', 'kkkk'], bx, by, { k: '#2a3a1e' }, 2); }
    if (dim) { c.fillStyle = 'rgba(6,16,4,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }
  function scenery(api, scene, t) {
    if (scene === 'hub') { greenwood(api, t, 0.42); return; }
    greenwood(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale') ? 0.5 : 0);
  }

  /* ─── per-location vignettes inside each map signpost ─── */
  const ART = {
    tournament(api, x, y, w, h) { const c = api.ctx; c.fillStyle = '#6b8f3a'; c.fillRect(x, y, w, h); c.fillStyle = '#f6f0dc'; c.beginPath(); c.arc(x + w / 2, y + h / 2, 9, 0, 7); c.fill(); c.fillStyle = '#3a6abf'; c.beginPath(); c.arc(x + w / 2, y + h / 2, 6, 0, 7); c.fill(); c.fillStyle = '#e03030'; c.beginPath(); c.arc(x + w / 2, y + h / 2, 3, 0, 7); c.fill(); c.strokeStyle = '#e3c567'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 4, y + h - 4); c.lineTo(x + w / 2, y + h / 2); c.stroke(); },
    greenwood(api, x, y, w, h, t) { const c = api.ctx; c.fillStyle = '#2f6322'; c.fillRect(x, y, w, h); c.fillStyle = '#1f4a18'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x + 10 + i * 16, y + 10, 9, 0, 7); c.fill(); } c.fillStyle = '#5a3a1a'; const rx = x + w / 2 + Math.sin(t) * 3; c.fillRect(rx - 1, y + h - 14, 2, 12); c.fillStyle = G.cream; c.fillRect(rx - 6, y + h - 12, 12, 2); },
    bridge(api, x, y, w, h, t) { const c = api.ctx; c.fillStyle = '#25506a'; c.fillRect(x, y, w, h); c.strokeStyle = '#3a7a9a'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); const yy = y + h - 4 - i * 5; c.moveTo(x, yy); for (let xx = 0; xx <= w; xx += 6) c.lineTo(x + xx, yy + Math.sin(t * 3 + xx * 0.4 + i) * 1.5); c.stroke(); } c.fillStyle = '#5a3f22'; c.fillRect(x + 4, y + h / 2 - 2, w - 8, 5); },
    barnsdale(api, x, y, w, h, t) { const c = api.ctx; c.fillStyle = '#3a2a14'; c.fillRect(x, y, w, h); const fl = 0.5 + 0.5 * Math.sin(t * 6); api.g2.glow(x + w / 2, y + h / 2, 12, G.torch, 0.5 * fl); c.fillStyle = '#e8c84a'; c.beginPath(); c.arc(x + w / 2, y + h / 2, 4, 0, 7); c.fill(); c.fillStyle = '#c8a24a'; for (let i = 0; i < 5; i++) c.fillRect(x + 8 + i * 12, y + h - 8, 4, 4); },
    reckoning(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#2a2b3a'; c.fillRect(x, y, w, h); g2.stoneWall(x, y, w, h, { base: '#3a3a44', light: '#50505e', dark: '#22222c', mortar: '#151519', moss: '#2a3a24' }, 0); c.fillStyle = '#14141c'; c.fillRect(x + w / 2 - 5, y + 6, 10, h); const fl = 0.5 + 0.5 * Math.sin(t * 5); c.fillStyle = g2.mix('#3a2a10', G.torch, fl); c.fillRect(x + 8, y + 8, 3, 5); c.fillRect(x + w - 11, y + 8, 3, 5); },
  };

  /* ─── HUB: a hand-inked Sherwood map with a winding trail + wooden signposts ─ */
  const NODES_XY = { tournament: [40, 96], greenwood: [150, 150], bridge: [30, 250], barnsdale: [150, 292], reckoning: [80, 388] };
  const ORDER = ['tournament', 'greenwood', 'barnsdale', 'reckoning'];
  const menu = {
    title(api, save, t) {
      const c = api.ctx, g2 = api.g2, W = api.W;
      // winding footpath (dashed) between the main stops
      c.save(); c.setLineDash([5, 8]); c.lineDashOffset = -(t * 20) % 1000;
      c.strokeStyle = '#d8c07a'; c.lineWidth = 3; c.globalAlpha = 0.6 + 0.15 * Math.sin(t * 3);
      c.beginPath(); ORDER.forEach((id, i) => { const p = NODES_XY[id], px = p[0] + 46, py = p[1] + 30; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke(); c.restore();
      // ornate header plaque — a carved wooden board
      g2.ornateFrame(24, 12, W - 48, 38, 8, 'rgba(30,22,10,.92)', '#8a6a2a');
      g2.gleamText('LEGENDS OF SHERWOOD', W / 2, 18, api.fitSize('LEGENDS OF SHERWOOD', 12, W - 60, 'title'), G.goldL, t, { shadow: 'rgba(0,0,0,.7)', gleamSpeed: 55, font: TITLE });
      api.txtCFit('GLORY  ' + (save.cur || 0), W / 2, 36, 9, G.cream);
    },
    layout() { return ['tournament', 'greenwood', 'bridge', 'barnsdale', 'reckoning'].map((id) => ({ x: NODES_XY[id][0], y: NODES_XY[id][1], w: 92, h: 66 })); },
    node(api, info) {
      const g = api.gfx, c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, t } = info;
      const cx = x + w / 2;
      if (sel) g2.glow(cx, y + (h - 14) / 2, 48, G.green, 0.32 + 0.2 * Math.sin(t * 4));
      // signpost post
      c.fillStyle = G.barkD; c.fillRect(cx - 3, y + 2, 6, h);
      // carved wooden sign board
      g2.roundRect(x, y, w, h - 16, 6, '#4a3418', done ? G.gold : (sel ? G.goldL : '#7a5a2a'), 2);
      // art vignette clipped inside
      c.save(); g2.roundRect(x + 5, y + 5, w - 10, h - 32, 5, null, null); c.clip();
      if (ART[node.id]) ART[node.id](api, x + 5, y + 5, w - 10, h - 32, t); else { c.fillStyle = '#2f6322'; c.fillRect(x + 5, y + 5, w - 10, h - 32); }
      c.restore();
      if (done) api.txtC('✔', x + w - 12, y + 8, 10, G.goldL);
      // burned-in nameplate
      api.txtCFit((node.optional ? '◆ ' : '') + node.name, cx, y + h - 25, 8, done ? G.goldL : G.cream, false, w - 12);
      // hovering arrow cursor over the selected node
      if (sel) { const ax = x - 14 + Math.sin(t * 5) * 3; c.strokeStyle = G.cream; c.lineWidth = 2; c.beginPath(); c.moveTo(ax, y + 14); c.lineTo(ax + 16, y + 14); c.stroke(); c.fillStyle = '#d8d0b0'; c.beginPath(); c.moveTo(ax + 16, y + 11); c.lineTo(ax + 22, y + 14); c.lineTo(ax + 16, y + 17); c.fill(); g.sprite(['f.', 'ff', 'f.'], ax - 4, y + 12, { f: G.blood }, 2); }
    },
  };

  /* ─── cinematic animated title screen ─── */
  function renderBoot(api, info) {
    const g2 = api.g2, c = api.ctx, W = api.W, H = api.H, t = info.sceneT;
    greenwood(api, t, 0);
    emblem(api, W / 2, H * 0.22);
    const ts = api.fitSize('ROBIN HOOD', 30, W - 20, 'title');
    g2.gleamText('ROBIN HOOD', W / 2, H * 0.37, ts, G.goldL, t, { bevel: '#fff4c0', shadow: 'rgba(20,30,6,.85)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('THE OUTLAW OF SHERWOOD', W / 2, H * 0.37 + ts + 14, 11, G.cream, true);
    // an arrow thunks in under the title, quivering
    const ax = W / 2 - 60 + ((t * 260) % (W)) ;
    if ((t % 3) < 0.6) { const q = Math.sin(t * 40) * 1.5 * Math.max(0, 0.6 - (t % 3)) / 0.6; c.strokeStyle = '#e8dcc0'; c.lineWidth = 2; c.beginPath(); c.moveTo(W / 2 - 30, H * 0.52 + q); c.lineTo(W / 2 + 24, H * 0.52 + q); c.stroke(); c.fillStyle = G.blood; api.gfx.sprite(['f.', 'ff', 'f.'], W / 2 - 34, H * 0.52 - 3 + q, { f: G.blood }, 2); }
    if (info.blink) api.txtCFit('▸ TAP TO RIDE ◂', W / 2, H * 0.70, 12, G.goldL);
    api.txtCFit('A 16-BIT TRIBUTE · HOWARD PYLE, 1883', W / 2, H - 28, 8, G.dim);
    api.vignette();
  }

  /* ============================ 16-bit sprites ============================ */
  // Robin — bigger, shaded, outlined; 2 frames (bow relaxed / bow drawn)
  const ROBIN_A = [
    '...cccc...', '..cGccF...', '...ffff...', '..kffffk..', '.kgGGGGgk.',
    'kgGGssGGgk', 'kgGb..bGgk', '.kGb..bGk.', '.kk....kk.', '.LL....LL.',
  ];
  const ROBIN_B = [ // drawn: arm forward, bow bent
    '...cccc...', '..cGccF...', '...ffff...', '..kffffk.w', '.kgGGGGgkw',
    'kgGGssGGgw', 'kgGb..bGgw', '.kGb..bGk.', '.kk....kk.', '.LL....LL.',
  ];
  const RPAL = { c: '#1f4a18', G: '#3f8a2c', g: '#2f6322', s: '#d8b088', f: '#e8c49a', k: '#0e2208', b: '#4a3418', L: '#3a2814', F: G.blood, w: '#c8a24a' };
  // Guy of Gisborne — horse-hide brute
  const GISBORNE = [
    '..HHHHHH..', '.HkkkkkkH.', '.HkRRRRkH.', '.HkR..RkH.', 'HHHRRRRHHH',
    'HbbBBBBbbH', 'HbBB..BBbH', 'HbB.BB.BBH', '.bB.BB.Bb.', '.k..BB..k.', '.b..BB..b.',
  ];
  const GPAL = { H: '#5a4a2a', k: '#0d0a06', R: '#7a1418', B: '#2a2018', b: '#3a2e18' };
  // Little John — tall, staff
  const JOHN = [
    '...bbbb...', '..bfffffb.', '..bf..fb..', '.BBBBBBBB.', 'BBBrrrBBBs',
    'BBBrrrBBBs', '.BB...BB.s', '.k.....k.s', '.b.....b.s',
  ];
  const JPAL = { b: '#3a2814', f: '#d8b088', B: '#6a5a2a', r: '#8a2a1a', k: '#1a1208', s: '#8a6a3a' };
  // Sheriff — black & silver, plumed
  const SHERIFF = [
    '....PP....', '..kkkkkk..', '.kSSSSSSk.', '.kS.rr.Sk.', 'kkSSSSSSkk',
    'kMMMMMMMMk', 'kMMsssMMMk', 'kMM...MMMk', '.M.....M..', '.k.....k..', '.b.....b..',
  ];
  const SPAL = { P: '#c81028', k: '#08060a', S: '#c0c4cc', s: '#e8e0a0', M: '#1a1a26', r: '#ff5040', b: '#141018' };
  const GUARD = ['..mmmm..', '.mssssm.', '.ms..sm.', 'mMMMMMMm', 'mM.mm.Mm', '.k....k.', '.b....b.'];
  const GUARDPAL = { m: '#2a2a34', s: '#c8a86a', M: '#44445a', k: '#12121a', b: '#0e0e16' };

  /* ============================ mini-game phases ============================ */

  /* --- TOURNAMENT p1: split the shaft (aim/timing) --- */
  function archery() {
    return {
      name: 'THE TOURNAMENT', help: 'TAP when the sight crosses the gold',
      winText: 'Your shaft splits your rival\'s clean down the middle. The crowd roars.',
      loseText: 'Your arrows fly wide. The crowd jeers you from the field.',
      init(api) { this.hits = 0; this.need = 5; this.miss = 0; this.max = 3; this.m = 0; this.dir = 1; this.spd = 0.85; this.band = api.has('longbow') ? 0.16 : 0.12; this.arrows = []; },
      update(api, dt) {
        this.m += this.dir * this.spd * dt; if (this.m > 1) { this.m = 1; this.dir = -1; } if (this.m < 0) { this.m = 0; this.dir = 1; }
        if (api.pointer.justDown) {
          if (Math.abs(this.m - 0.5) < this.band) {
            this.hits++; api.addScore(25); api.audio.sfx('coin'); api.flash('#fff6c0', 0.1); api.burst(api.W / 2, api.H * 0.34, G.gold, 12);
            this.arrows.push({ x: api.W / 2 + api.rnd(-3, 3), y: api.H * 0.34 }); this.spd = Math.min(1.7, this.spd + 0.07); this.band = Math.max(0.09, this.band - 0.006);
            if (this.hits >= this.need) { api.addScore(60); api.win(); }
          } else { this.miss++; api.audio.sfx('hurt'); api.shake(4, 0.2); if (this.miss >= this.max) api.lose(); }
        }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#cdeaa0'], [0.5, '#9ad066'], [1, '#5a9a34']]);
        // tourney field + crowd stands on both sides
        c.fillStyle = '#4d8a2e'; c.fillRect(0, H * 0.58, W, H * 0.42);
        for (const sx of [0, W - 40]) { c.fillStyle = '#6a4a28'; c.fillRect(sx, 60, 40, H * 0.5); for (let r = 0; r < 5; r++) for (let i = 0; i < 4; i++) { c.fillStyle = ['#c83030', '#3a6abf', '#e8c84a', '#e0e0e0'][(r + i) % 4]; c.beginPath(); c.arc(sx + 8 + i * 9, 74 + r * 20, 3, 0, 7); c.fill(); } }
        // fluttering banners
        for (let i = 0; i < 3; i++) { const bx = 52 + i * 60, sw = Math.sin(t * 3 + i) * 3; c.fillStyle = ['#c8102e', '#2f6b2a', '#e3c567'][i]; c.beginPath(); c.moveTo(bx, 58); c.lineTo(bx + 16, 58); c.lineTo(bx + 16 + sw, 74); c.lineTo(bx + sw, 74); c.closePath(); c.fill(); }
        // the target on a stand
        const tx = W / 2, ty = H * 0.34;
        c.fillStyle = G.barkD; c.fillRect(tx - 2, ty, 4, H * 0.24);
        g2.glow(tx, ty, 24, '#fff2c0', 0.25);
        const rings = [[16, '#f6f0dc'], [12, '#3a6abf'], [8, '#f6f0dc'], [4, '#e03030']];
        rings.forEach((r) => { c.fillStyle = r[1]; c.beginPath(); c.arc(tx, ty, r[0], 0, 7); c.fill(); });
        // arrows already stuck
        for (const a of this.arrows) { c.strokeStyle = '#e8dcc0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(a.x - 12, a.y - 8); c.lineTo(a.x, a.y); c.stroke(); g.sprite(['f.', 'ff', 'f.'], a.x - 16, a.y - 12, { f: G.blood }, 2); }
        // moving sight (a reticle sweeping across the target)
        const sxp = tx - 30 + this.m * 60;
        c.strokeStyle = Math.abs(this.m - 0.5) < this.band ? G.goldL : '#f0f0f0'; c.lineWidth = 2;
        c.beginPath(); c.arc(sxp, ty, 6, 0, 7); c.stroke(); c.beginPath(); c.moveTo(sxp - 9, ty); c.lineTo(sxp + 9, ty); c.moveTo(sxp, ty - 9); c.lineTo(sxp, ty + 9); c.stroke();
        // Robin drawing the bow
        const frame = api.pointer.down ? ROBIN_B : ROBIN_A;
        g2.bigSprite(frame, W / 2 - 20, H - 88, RPAL, 4, { shadow: true, outline: '#0a1a06' });
        // HUD
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(14,20,8,.7)', '#5a6a2a', 1);
        api.txt('ARROWS ' + this.hits + '/' + this.need, 11, 8, 8, G.goldL);
        api.txtCFit('MISS ' + this.miss + '/' + this.max, W - 42, 8, 8, G.cream, false, 74);
        api.vignette();
      },
    };
  }

  /* --- shared duel-boss (Gisborne, Sheriff): dodge shots, loose when exposed --- */
  function duelBoss(cfg) {
    return {
      name: cfg.name, boss: true, help: cfg.help,
      winText: cfg.winText, loseText: cfg.loseText,
      init(api) { this.x = api.W / 2; this.hp = cfg.hp; this.taken = 0; this.maxTaken = api.has('horn') ? 4 : 3; this.shots = []; this.spawnT = 0.8; this.bx = api.W / 2; this.bdir = 1; this.expose = false; this.expT = 1.4; this.sun = 0; },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.bx += this.bdir * 26 * dt; if (this.bx < 40 || this.bx > W - 40) this.bdir *= -1;
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.3; this.x = clamp(this.x, 16, W - 16);
        if (cfg.timed) this.sun += dt / 42;
        this.expT -= dt; if (this.expT <= 0) { this.expose = !this.expose; this.expT = this.expose ? 1.1 : 1.5; }
        this.spawnT -= dt; if (this.spawnT <= 0 && !this.expose) { this.shots.push({ x: this.bx, y: 104, s: api.rnd(2.4, 3.4) }); this.spawnT = api.rnd(0.4, 0.8); }
        for (const s of this.shots) s.y += s.s * dt * 60; this.shots = this.shots.filter((s) => s.y < H + 10);
        const py = H - 74;
        for (const s of this.shots) if (Math.abs(s.x - this.x) < 12 && Math.abs(s.y - py) < 14) { s.y = H + 99; this.taken++; api.shake(6, 0.3); api.flash(G.blood, 0.2); api.audio.sfx('hurt'); if (this.taken >= this.maxTaken) return api.lose(); }
        if (api.pointer.justDown && this.expose && Math.abs(api.pointer.x - this.bx) < 30 && api.pointer.y < 150) { this.hp--; api.addScore(45); api.audio.sfx('shoot'); api.flash('#fff6c0', 0.12); api.burst(this.bx, 116, G.gold, 12); this.expose = false; this.expT = 1.3; if (this.hp <= 0) { api.addScore(80); api.win(); } }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        cfg.bg(api, t, this.sun);
        // boss
        const cy = 88 + Math.sin(t * 1.6) * 4;
        if (this.expose) g2.glow(this.bx, cy + 20, 34, '#ffe06a', 0.6); else g2.glow(this.bx, cy + 20, 22, cfg.aura || '#3a2a12', 0.4);
        g2.bigSprite(cfg.sprite, this.bx - (cfg.sprite[0].length * cfg.sc) / 2, cy, cfg.pal, cfg.sc, { shadow: true, outline: '#08060a' });
        // shots
        for (const s of this.shots) { c.strokeStyle = '#e8dcc0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(s.x, s.y - 8); c.lineTo(s.x, s.y + 4); c.stroke(); c.fillStyle = cfg.shotHead || '#c0c0c0'; c.beginPath(); c.moveTo(s.x, s.y + 6); c.lineTo(s.x - 3, s.y); c.lineTo(s.x + 3, s.y); c.fill(); }
        // Robin at the foot
        g2.bigSprite(ROBIN_A, this.x - 20, H - 90, RPAL, 4, { shadow: true, outline: '#0a1a06' });
        if (this.expose) api.txtCFit('▸ LOOSE! ◂', this.bx, cy - 16, 9, G.goldL);
        // HUD
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(14,12,8,.7)', '#5a4a2a', 1);
        api.txt(cfg.hpLabel + ' ' + '➤'.repeat(Math.max(0, this.hp)), 11, 8, 8, G.goldL);
        api.txtCFit('WOUNDS ' + this.taken + '/' + this.maxTaken, W - 46, 8, 8, G.cream, false, 78);
        if (cfg.timed) { g.rect(6, H - 10, W - 12, 4, '#1a2410'); g.rect(6, H - 10, (W - 12) * clamp(this.sun, 0, 1), 4, '#e8a030'); }
        api.vignette();
      },
    };
  }

  /* --- GREENWOOD p1: the forest ride (dodge-runner) --- */
  function ride() {
    return {
      name: 'SHERWOOD RIDE', help: 'DRAG to steer · dodge the trees',
      winText: 'You thunder deep into the greenwood, lost to the Sheriff\'s men.',
      loseText: 'A low branch takes you from the saddle.',
      init(api) { this.x = api.W / 2; this.z = 0; this.need = 340; this.lives = api.has('horn') ? 4 : 3; this.imm = 0; this.obs = []; this.spawnT = 0.7; this.coins = 0; },
      update(api, dt) {
        const W = api.W, H = api.H; this.z += 62 * dt; api.score = Math.floor(this.z) + this.coins * 10;
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.3; this.x = clamp(this.x, 22, W - 22);
        this.imm -= dt;
        this.spawnT -= dt; if (this.spawnT <= 0) { const gold = api.chance(0.28); this.obs.push({ x: api.rnd(24, W - 24), y: -10, s: api.rnd(2.6, 3.6), gold }); this.spawnT = Math.max(0.32, 0.75 - this.z * 0.0006); }
        for (const o of this.obs) o.y += o.s * dt * 60; this.obs = this.obs.filter((o) => o.y < H + 12);
        const py = H - 70;
        for (const o of this.obs) if (Math.abs(o.x - this.x) < 16 && Math.abs(o.y - py) < 16) {
          if (o.gold) { o.y = H + 99; this.coins++; api.audio.sfx('coin'); api.burst(o.x, o.y, G.gold, 8); }
          else if (this.imm <= 0) { o.y = H + 99; this.lives--; this.imm = 1.1; api.shake(6, 0.3); api.flash(G.blood, 0.2); api.audio.sfx('hurt'); if (this.lives <= 0) return api.lose(); }
        }
        if (this.z >= this.need) { api.addScore(60); api.win(); }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#8fce5e'], [0.5, '#4d8a2e'], [1, '#26521a']]);
        // mode-7 forest path rushing toward camera
        g2.mode7({
          horizon: H * 0.3, camZ: this.z * 0.5, height: 1.1, fog: '#22491a',
          tex: (wx, wz) => {
            if (Math.abs(wx) < 1.4) return (Math.floor(wz * 0.35) & 1) ? '#6a5630' : '#544323'; // dirt path stripes
            const gg = (Math.floor(wz * 0.4) & 1);
            return wx < 0 ? (gg ? '#357a26' : '#2c661e') : (gg ? '#2f7222' : '#28611c');
          },
        });
        // parallax tree trunks whipping past on both edges
        for (let i = 0; i < 6; i++) { const ty = ((this.z * 3 + i * 90) % (H + 60)) - 30; const sc = 0.4 + ty / H; c.fillStyle = '#2a1c0e'; c.fillRect(6, ty, 10 * sc + 4, 40 * sc); c.fillRect(W - 20, ty + 30, 10 * sc + 4, 40 * sc); c.fillStyle = '#1f4a18'; c.beginPath(); c.arc(11, ty, 14 * sc, 0, 7); c.fill(); c.beginPath(); c.arc(W - 15, ty + 30, 14 * sc, 0, 7); c.fill(); }
        // obstacles: gold pouches or fallen logs/branches
        for (const o of this.obs) {
          if (o.gold) { g2.glow(o.x, o.y, 8, G.gold, 0.5); c.fillStyle = '#8a5a2a'; c.beginPath(); c.arc(o.x, o.y, 6, 0, 7); c.fill(); c.fillStyle = G.goldL; c.fillRect(o.x - 2, o.y - 5, 4, 3); }
          else { c.fillStyle = '#5a3f1e'; c.fillRect(o.x - 14, o.y - 4, 28, 8); c.fillStyle = '#3a2814'; c.fillRect(o.x - 14, o.y - 4, 28, 2); c.fillStyle = '#7a5a30'; c.beginPath(); c.arc(o.x - 14, o.y, 4, 0, 7); c.fill(); }
        }
        // Robin on horseback (galloping) — Robin sprite + a simple steed under him
        const bob = Math.sin(t * 14) * 2;
        c.fillStyle = '#4a3418'; g2.roundRect(this.x - 16, H - 58 + bob, 32, 14, 4, '#4a3418', '#2a1c0e', 1); // horse body
        c.fillStyle = '#2a1c0e'; c.fillRect(this.x - 14, H - 46 + bob, 4, 10); c.fillRect(this.x + 10, H - 46 + bob, 4, 10);
        g2.bigSprite(this.imm > 0 && Math.floor(t * 12) % 2 ? ROBIN_B : ROBIN_A, this.x - 16, H - 92 + bob, RPAL, 3.4, { shadow: false, outline: '#0a1a06' });
        // HUD
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(14,20,8,.7)', '#5a6a2a', 1);
        api.txt('♥'.repeat(Math.max(0, this.lives)), 11, 8, 9, G.blood);
        api.txtCFit('GOLD ' + this.coins + ' · ' + Math.floor(this.z / this.need * 100) + '%', W - 52, 8, 8, G.goldL, false, 96);
        api.vignette();
      },
    };
  }

  /* --- GREENWOOD p2 (boss): the ambush (tap defense) --- */
  function ambush() {
    return {
      name: "THE BISHOP'S GUARD", boss: true, help: 'TAP each guard before he reaches the cart',
      winText: 'The Bishop\'s gold is Sherwood\'s now — and the poor will eat well.',
      loseText: 'The guards break through and haul the gold away.',
      init(api) { this.time = 22; this.routed = 0; this.need = 12; this.breaches = 0; this.max = 3; this.guards = []; this.spawnT = 0.7; },
      spawn(api) { const side = api.chance(0.5) ? 0 : 1; this.guards.push({ x: side ? api.W + 12 : -12, dir: side ? -1 : 1, y: api.rnd(140, api.H - 150), spd: api.rnd(20, 34) + (22 - this.time) * 1.2 }); },
      update(api, dt) {
        this.time -= dt; if (this.time <= 0) { api.addScore(70); return api.win(); }
        this.spawnT -= dt; if (this.spawnT <= 0 && this.guards.length < 4) { this.spawn(api); this.spawnT = Math.max(0.5, 1.1 - (22 - this.time) * 0.03); }
        const cxp = api.W / 2;
        for (const gd of this.guards) { gd.x += gd.dir * gd.spd * dt; if (!gd.dead && Math.abs(gd.x - cxp) < 20) { gd.dead = true; this.breaches++; api.shake(5, 0.25); api.flash(G.blood, 0.18); api.audio.sfx('hurt'); if (this.breaches >= this.max) return api.lose(); } }
        if (api.pointer.justDown) for (const gd of this.guards) if (!gd.dead && Math.abs(api.pointer.x - gd.x) < 20 && Math.abs(api.pointer.y - gd.y) < 22) { gd.dead = true; this.routed++; api.addScore(15); api.audio.sfx('shoot'); api.burst(gd.x, gd.y, G.goldL, 8); break; }
        this.guards = this.guards.filter((gd) => !gd.dead);
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#5a8a3a'], [0.5, '#2f5a20'], [1, '#16300f']]);
        greenGloom(api, t);
        // the treasure cart in the centre (defend this)
        const cxp = W / 2, cyp = H / 2;
        g2.glow(cxp, cyp, 26, G.gold, 0.28 + 0.08 * Math.sin(t * 3));
        c.fillStyle = '#4a3418'; g2.roundRect(cxp - 20, cyp - 8, 40, 20, 4, '#4a3418', '#2a1c0e', 1);
        c.fillStyle = G.goldL; for (let i = 0; i < 4; i++) c.fillRect(cxp - 14 + i * 8, cyp - 4, 5, 5);
        c.fillStyle = '#2a1c0e'; c.beginPath(); c.arc(cxp - 14, cyp + 12, 5, 0, 7); c.fill(); c.beginPath(); c.arc(cxp + 14, cyp + 12, 5, 0, 7); c.fill();
        // guards closing in
        for (const gd of this.guards) { const fr = Math.floor(t * 8 + gd.x) % 2; g2.bigSprite(GUARD, gd.x - 8, gd.y - 8 + (fr ? 1 : 0), GUARDPAL, 2, { outline: '#08080e' }); }
        g2.embers(t, 8, { yBottom: H, yTop: 0, color: '#8fce5e', speed: 0.06, size: 2, alpha: 0.22 });
        // HUD
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(10,16,6,.7)', '#4a5a24', 1);
        api.txt('HOLD · ' + Math.ceil(this.time) + 's', 11, 8, 8, G.goldL);
        api.txtCFit('BREACH ' + this.breaches + '/' + this.max, W - 44, 8, 8, G.cream, false, 78);
        api.vignette();
      },
    };
  }
  function greenGloom(api, t) { const c = api.ctx, W = api.W, H = api.H; c.fillStyle = '#1f4a18'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc((i * 52) % W, 40 + (i % 2) * 24, 26, 0, 7); c.fill(); } c.fillStyle = '#16300f'; c.fillRect(0, H - 40, W, 40); }

  /* --- THE LOG BRIDGE (optional boss): Little John, quarterstaff duel --- */
  function littlejohn() {
    return {
      name: 'THE LOG BRIDGE', boss: true, help: 'TAP the flashing side to block · then STRIKE',
      winText: 'You both tumble in — and rise laughing. Little John joins the Merry Men.',
      loseText: 'John\'s staff sweeps your legs; the cold water takes you.',
      init(api) { this.hp = 3; this.taken = 0; this.max = 3; this.side = 0; this.tel = 0; this.telT = 1.1; this.window = 0; this.jx = api.W * 0.62; this.strike = false; this.strikeT = 0; },
      update(api, dt) {
        this.telT -= dt;
        if (this.telT <= 0 && !this.strike) { this.side = api.chance(0.5) ? -1 : 1; this.tel = 0.85; this.telT = api.rnd(1.0, 1.6); this.window = 0.85; }
        if (this.tel > 0) this.tel -= dt;
        if (this.window > 0) { this.window -= dt; if (this.window <= 0) { /* missed block */ this.taken++; api.shake(6, 0.3); api.flash(G.blood, 0.2); api.audio.sfx('hurt'); this.side = 0; if (this.taken >= this.max) return api.lose(); } }
        if (this.strike) { this.strikeT -= dt; if (this.strikeT <= 0) this.strike = false; }
        if (api.pointer.justDown && this.window > 0 && this.side) {
          const tapSide = api.pointer.x < api.W / 2 ? -1 : 1;
          if (tapSide === this.side) { api.audio.sfx('blip'); api.flash('#cfe8ff', 0.1); this.window = 0; this.side = 0; this.strike = true; this.strikeT = 0.5; this.hp--; api.addScore(40); api.burst(this.jx, api.H / 2, '#cfe8ff', 10); if (this.hp <= 0) { api.addScore(80); api.win(); } }
          else { this.taken++; api.audio.sfx('hurt'); api.shake(6, 0.3); this.window = 0; this.side = 0; if (this.taken >= this.max) return api.lose(); }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#aee07a'], [0.5, '#7ec24a'], [1, '#3e7a26']]);
        // river below
        c.fillStyle = '#2a5a7a'; c.fillRect(0, H * 0.6, W, H * 0.4);
        c.strokeStyle = '#3a7a9a'; c.lineWidth = 1; for (let i = 0; i < 5; i++) { c.beginPath(); const yy = H * 0.62 + i * 12; c.moveTo(0, yy); for (let x = 0; x <= W; x += 8) c.lineTo(x, yy + Math.sin(t * 3 + x * 0.3 + i) * 2); c.stroke(); }
        // the log bridge
        c.fillStyle = '#5a3f22'; c.fillRect(0, H * 0.56, W, 16); c.fillStyle = '#3a2814'; c.fillRect(0, H * 0.56 + 12, W, 4);
        for (let x = 6; x < W; x += 22) { c.fillStyle = '#43301a'; c.fillRect(x, H * 0.56 + 2, 3, 12); }
        // Little John (right), Robin (left), on the bridge
        g2.bigSprite(JOHN, this.jx - 18, H * 0.32, JPAL, 3.6, { shadow: true, outline: '#0a0a06' });
        g2.bigSprite(this.strike ? ROBIN_B : ROBIN_A, W * 0.22, H * 0.34, RPAL, 3.6, { shadow: true, outline: '#0a1a06' });
        // telegraph: a glowing arc on the side John will swing
        if (this.tel > 0 && this.side) { const gx = this.side < 0 ? W * 0.30 : W * 0.70; g2.glow(gx, H * 0.42, 30, this.side < 0 ? '#ff6a3a' : '#ffd24a', 0.5 + 0.3 * Math.sin(t * 12)); api.txtCFit(this.side < 0 ? '◀ BLOCK' : 'BLOCK ▶', gx, H * 0.42 - 6, 9, G.goldL); }
        // HUD
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(14,20,8,.7)', '#5a6a2a', 1);
        api.txt('JOHN ' + '➤'.repeat(Math.max(0, this.hp)), 11, 8, 8, G.goldL);
        api.txtCFit('KNOCKS ' + this.taken + '/' + this.max, W - 46, 8, 8, G.cream, false, 78);
        api.vignette();
      },
    };
  }

  /* --- BARNSDALE p1: rob the rich (stealth collect) --- */
  function robrich() {
    return {
      name: 'ROB THE RICH', help: 'DRAG to gather coins · keep out of the torchlight',
      winText: 'You lift twelve score gold pieces from under their noses.',
      loseText: 'The torch finds you — the hall erupts in shouts.',
      init(api) { this.x = api.W / 2; this.y = api.H * 0.7; this.got = 0; this.need = 12; this.caught = 0; this.max = 3; this.coins = []; this.lx = api.W / 2; this.ldir = 1; for (let i = 0; i < 5; i++) this.spawn(api); },
      spawn(api) { this.coins.push({ x: api.rnd(24, api.W - 24), y: api.rnd(120, api.H - 90), ph: api.rnd(0, 6) }); },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.lx += this.ldir * 46 * dt; if (this.lx < 40 || this.lx > W - 40) this.ldir *= -1;
        if (api.pointer.down) { this.x += (api.pointer.x - this.x) * 0.3; this.y += (api.pointer.y - this.y) * 0.3; }
        this.x = clamp(this.x, 16, W - 16); this.y = clamp(this.y, 100, H - 60);
        for (const cn of this.coins) cn.ph += dt * 5;
        if (api.pointer.down || api.pointer.justDown) for (const cn of this.coins) if (!cn.dead && Math.hypot(this.x - cn.x, this.y - cn.y) < 18) { cn.dead = true; this.got++; api.addScore(15); api.audio.sfx('coin'); api.burst(cn.x, cn.y, G.goldL, 6); this.spawn(api); if (this.got >= this.need) { api.addScore(60); return api.win(); } break; }
        this.coins = this.coins.filter((cn) => !cn.dead);
        // caught if standing in the sweeping torch cone
        if (Math.abs(this.x - this.lx) < 26 && this.y < H * 0.72) { this.lit = (this.lit || 0) + dt; if (this.lit > 0.5) { this.lit = 0; this.caught++; api.shake(6, 0.3); api.flash('#ffdca0', 0.2); api.audio.sfx('hurt'); if (this.caught >= this.max) return api.lose(); } } else this.lit = 0;
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        // the Bishop's feast-hall at night
        g2.verticalGradient(0, 0, W, H, [[0, '#2a2012'], [1, '#120c06']]);
        g2.stoneWall(0, 0, W, H * 0.34, { base: '#3a2e1c', light: '#4e3e26', dark: '#221a10', mortar: '#140e08', moss: '#2a2a14' }, 0);
        // long banquet table
        c.fillStyle = '#4a3418'; c.fillRect(20, H * 0.42, W - 40, 18); c.fillStyle = '#3a2814'; c.fillRect(20, H * 0.42 + 14, W - 40, 4);
        // torch on a sweeping guard
        g2.glow(this.lx, H * 0.5, 40, '#ffcf70', 0.4);
        c.save(); c.globalAlpha = 0.16; c.fillStyle = '#ffe6a0'; c.beginPath(); c.moveTo(this.lx, 60); c.lineTo(this.lx - 26, H * 0.72); c.lineTo(this.lx + 26, H * 0.72); c.closePath(); c.fill(); c.restore();
        g2.flame(this.lx, 60, t, 1.0);
        // coins on the table & floor
        for (const cn of this.coins) { const b = 1 + Math.sin(cn.ph) * 0.3; g2.glow(cn.x, cn.y, 6, G.gold, 0.4); c.fillStyle = G.goldL; c.beginPath(); c.arc(cn.x, cn.y, 4 * b, 0, 7); c.fill(); c.fillStyle = '#b8901e'; c.fillRect(cn.x - 1, cn.y - 1, 2, 2); }
        // Robin sneaking (crouched)
        g2.bigSprite(ROBIN_A, this.x - 16, this.y - 20, RPAL, 3.2, { shadow: true, outline: '#0a1a06' });
        // HUD
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(14,12,6,.7)', '#5a4a24', 1);
        api.txt('GOLD ' + this.got + '/' + this.need, 11, 8, 8, G.goldL);
        api.txtCFit('SEEN ' + this.caught + '/' + this.max, W - 42, 8, 8, G.cream, false, 74);
        api.vignette();
      },
    };
  }

  /* --- BARNSDALE p2 (boss): rescue Will from the gallows (precision) --- */
  function rescue() {
    return {
      name: 'THE GALLOWS', boss: true, help: 'TAP when the sight is on the rope — before the drop',
      winText: 'Your arrow parts the rope. Will Stutely runs free into the crowd.',
      loseText: 'The trap falls. You are too late.',
      init(api) { this.frays = 0; this.need = 3; this.miss = 0; this.max = 4; this.m = 0; this.dir = 1; this.spd = 1.0; this.band = api.has('longbow') ? 0.14 : 0.1; this.drop = 20; this.arrows = []; },
      update(api, dt) {
        this.drop -= dt; if (this.drop <= 0) return api.lose();
        this.m += this.dir * this.spd * dt; if (this.m > 1) { this.m = 1; this.dir = -1; } if (this.m < 0) { this.m = 0; this.dir = 1; }
        if (api.pointer.justDown) {
          if (Math.abs(this.m - 0.5) < this.band) { this.frays++; api.addScore(45); api.audio.sfx('shoot'); api.flash('#fff6c0', 0.12); api.burst(api.W / 2, api.H * 0.3, G.gold, 12); this.spd += 0.08; if (this.frays >= this.need) { api.addScore(90); return api.win(); } }
          else { this.miss++; api.audio.sfx('hurt'); api.shake(4, 0.2); if (this.miss >= this.max) return api.lose(); }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#c8b46a'], [0.5, '#8a7a4a'], [1, '#4a3a24']]);
        greenGloom(api, t);
        // gallows frame
        c.fillStyle = '#3a2814'; c.fillRect(W / 2 - 40, H * 0.18, 8, H * 0.4); c.fillRect(W / 2 + 32, H * 0.18, 8, H * 0.4); c.fillRect(W / 2 - 40, H * 0.18, 80, 8);
        // the rope (frays as you hit) + Will hanging beneath
        const ry = H * 0.24 + (1 - clamp(this.drop / 20, 0, 1)) * 6;
        c.strokeStyle = this.frays >= 2 ? '#c89060' : '#8a6a3a'; c.lineWidth = 3 - this.frays; c.beginPath(); c.moveTo(W / 2, H * 0.26); c.lineTo(W / 2, ry + 26); c.stroke();
        g2.bigSprite(['.ffff.', 'fk..kf', '.ffff.', 'kBBBBk', 'kB..Bk', '.b..b.'], W / 2 - 12, ry + 24, { f: '#d8b088', k: '#2a1c14', B: '#6a3a24', b: '#3a2418' }, 4, { outline: '#100a08' });
        // sweeping sight over the rope
        const sy = H * 0.26 + this.m * (ry - H * 0.26 + 6);
        c.strokeStyle = Math.abs(this.m - 0.5) < this.band ? G.goldL : '#f0f0f0'; c.lineWidth = 2; c.beginPath(); c.arc(W / 2, sy, 6, 0, 7); c.stroke(); c.beginPath(); c.moveTo(W / 2 - 9, sy); c.lineTo(W / 2 + 9, sy); c.stroke();
        // Robin aiming from the crowd
        g2.bigSprite(api.pointer.down ? ROBIN_B : ROBIN_A, 20, H - 84, RPAL, 3.4, { shadow: true, outline: '#0a1a06' });
        // HUD
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(16,12,6,.7)', '#5a4a24', 1);
        api.txt('FRAY ' + this.frays + '/' + this.need, 11, 8, 8, G.goldL);
        api.txtCFit('DROP ' + Math.ceil(this.drop) + 's', W - 40, 8, 8, this.drop < 6 ? G.blood : G.cream, false, 70);
        api.vignette();
      },
    };
  }

  /* --- RECKONING p1: infiltrate the castle (stealth crossing) --- */
  function infiltrate() {
    return {
      name: 'INTO NOTTINGHAM', help: 'TAP to dash when the guard looks away',
      winText: 'You slip past the watch and into the Sheriff\'s keep.',
      loseText: 'A guard turns — the alarm bell rings.',
      init(api) { this.z = 0; this.need = 100; this.look = false; this.lookT = 1.4; this.dash = 0; this.caught = 0; this.max = 3; this.gy = api.H * 0.28; },
      update(api, dt) {
        this.lookT -= dt; if (this.lookT <= 0) { this.look = !this.look; this.lookT = this.look ? api.rnd(0.8, 1.4) : api.rnd(1.0, 1.8); }
        if (this.dash > 0) { this.dash -= dt; this.z += 46 * dt; if (this.look) { /* moving while watched */ this.caught++; this.dash = 0; api.shake(6, 0.3); api.flash(G.blood, 0.2); api.audio.sfx('hurt'); if (this.caught >= this.max) return api.lose(); } }
        if (api.pointer.justDown && this.dash <= 0) { this.dash = 0.5; api.audio.sfx('blip'); }
        api.score = Math.floor(this.z);
        if (this.z >= this.need) { api.addScore(60); return api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#1a1c2a'], [1, '#0a0b12']]);
        g2.stars(t, 30, H * 0.4, '#c8d0f0');
        // castle wall + gate at the top, torches
        g2.stoneWall(0, 0, W, H * 0.42, { base: '#33333e', light: '#484852', dark: '#20202a', mortar: '#14141a', moss: '#243a20' }, 0);
        c.fillStyle = '#0c0c14'; c.fillRect(W / 2 - 16, H * 0.18, 32, H * 0.24);
        for (const fx of [24, W - 24]) g2.flame(fx, H * 0.2, t, 1.0);
        // the guard on the wall — turns to look (glowing cone when watching)
        const gx = W / 2 + Math.sin(t * 0.7) * 30;
        g2.bigSprite(GUARD, gx - 8, this.gy, GUARDPAL, 2, { outline: '#08080e' });
        if (this.look) { c.save(); c.globalAlpha = 0.14; c.fillStyle = '#ffe6a0'; c.beginPath(); c.moveTo(gx, this.gy + 14); c.lineTo(gx - 40, H * 0.7); c.lineTo(gx + 40, H * 0.7); c.closePath(); c.fill(); c.restore(); api.txtCFit('! WATCHING !', gx, this.gy - 14, 8, G.blood); }
        else api.txtCFit('· clear ·', gx, this.gy - 14, 8, G.green);
        // Robin advancing across the courtyard (y maps to progress)
        const ry = H - 60 - (this.z / this.need) * (H * 0.36);
        g2.bigSprite(this.dash > 0 ? ROBIN_B : ROBIN_A, W / 2 - 14, ry, RPAL, 3.2, { shadow: true, outline: '#0a1a06' });
        // HUD
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(10,10,16,.7)', '#3a3a52', 1);
        api.txt('CREEP ' + Math.floor(this.z / this.need * 100) + '%', 11, 8, 8, G.green);
        api.txtCFit('SEEN ' + this.caught + '/' + this.max, W - 42, 8, 8, G.cream, false, 74);
        api.vignette();
      },
    };
  }

  /* ============================ backgrounds for the duel bosses ============ */
  function forestClearingBg(api, t) {
    const g2 = api.g2, c = api.ctx, W = api.W, H = api.H;
    g2.skyGradient([[0, '#8fce5e'], [0.5, '#4d8a2e'], [1, '#22491a']]);
    greenGloom(api, t);
    g2.fog(t, { y0: H * 0.5, y1: H, bands: 4, color: '#3a5a2a', alpha: 0.08 });
    c.fillStyle = '#16300f'; c.fillRect(0, H * 0.62, W, H * 0.38);
    g2.embers(t, 8, { yBottom: H, yTop: H * 0.3, color: '#a8e06a', speed: 0.06, size: 2, alpha: 0.25 });
  }
  function castleHallBg(api, t, sun) {
    const g2 = api.g2, c = api.ctx, W = api.W, H = api.H;
    g2.verticalGradient(0, 0, W, H, [[0, sun > 0 ? '#5a3a2a' : '#241a2a'], [1, '#0e0a14']]);
    g2.stoneWall(0, 0, W, H * 0.6, { base: '#33313e', light: '#484652', dark: '#201e2a', mortar: '#131218', moss: '#2a3420' }, 0);
    for (const px of [26, W - 26]) { c.fillStyle = '#161420'; c.fillRect(px - 10, 0, 20, H * 0.7); g2.flame(px, 60, t, 1.0); }
    c.fillStyle = '#14101c'; c.fillRect(0, H * 0.6, W, H * 0.4);
    g2.fog(t, { y0: H * 0.5, y1: H, bands: 4, color: '#3a2a44', alpha: 0.08 });
    if (sun > 0) g2.glow(W / 2, H * (1 - sun) - 10, 60, '#ffb040', 0.3 + sun * 0.4);
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'robinhood', title: 'Robin Hood', subtitle: 'THE OUTLAW OF SHERWOOD',
    currency: 'GLORY', accent: G.gold, ownPhaseHud: true,
    titleFont: TITLE, // bold pixel display — heroic + period-correct 16-bit
    uiFont: "'Pixelify Sans','Press Start 2P',monospace",
    credit: 'A 16-BIT TRIBUTE · HOWARD PYLE, 1883',
    bootCta: 'TAP TO RIDE', bootLine: 'FIVE TALES OF SHERWOOD',
    width: 270, height: 480, parent: '#game',
    palette: { gold: G.gold, blood: G.blood, cream: G.cream, dim: G.dim, green: G.green },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'CHOOSE THE NEXT TALE', mapDone: 'SHERWOOD IS FREE',
    screens: {
      overlay: 'rgba(10,20,8,.84)', win: G.green, lose: '#8b3a1a', chapterLabel: '#b8a86a',
      name: G.goldL, sub: G.green, intro: '#dfeabf', quote: '#9db06a', help: G.green,
      score: G.cream, cur: G.green, cta: G.goldL,
    },
    labels: {
      chapter: 'TALE', phase: 'PART', boss: 'THE RECKONING', score: 'PURSE WON',
      win: 'A CLEAN SHOT', lose: 'OUTLAWED', nextPhaseWin: 'GROUND WON',
      cont: 'TAP TO PRESS ON', toMap: 'TAP FOR THE MAP', play: 'TAP TO BEGIN',
      nextPhase: 'TAP TO PRESS ON', toFinale: 'TAP FOR THE RECKONING',
    },
    upgrades: {
      longbow: { name: 'THE LONGBOW', desc: 'a truer, wider aim' },
      horn: { name: 'HORN OF SHERWOOD', desc: 'rally the Merry Men — one more life' },
      staff: { name: "JOHN'S QUARTERSTAFF", desc: 'a friend at your back' },
    },
    nodes: [
      {
        id: 'tournament', name: 'THE TOURNAMENT', sub: 'NOTTINGHAM FAIR', reward: 60, grant: 'longbow',
        icon(api, x, y) { const g = api.gfx; g.circle(x, y, 7, '#f6f0dc'); g.circle(x, y, 4, '#3a6abf'); g.circle(x, y, 2, '#e03030'); },
        intro: ['The Sheriff sets a golden arrow', 'for the finest bow in England —', 'a trap to snare Robin Hood.'],
        quote: 'He notched his shaft and loosed — and split his rival\'s arrow clean down the middle.',
        choice: {
          prompt: 'The Sheriff\'s contest is a snare. How do you enter the lists?',
          hint: 'HOW SHERWOOD\'S HERO IS MADE',
          options: [
            { label: 'Openly, as Robin Hood', sub: 'Bold — the whole shire will know your face', flag: 'bold',
              icon(api, x, y) { const g = api.gfx, c = api.ctx; c.fillStyle = G.barkD; c.fillRect(x - 1, y - 10, 2, 20); c.fillStyle = G.blood; c.beginPath(); c.moveTo(x + 1, y - 10); c.lineTo(x + 11, y - 6); c.lineTo(x + 1, y - 2); c.closePath(); c.fill(); g.sprite(['f.', 'ff', 'f.'], x - 6, y - 9, { f: G.gold }, 2); } },
            { label: 'Disguised as a tattered beggar', sub: 'Cunning — strike from among the crowd', flag: 'disguise',
              icon(api, x, y) { const c = api.ctx; c.fillStyle = '#5a5240'; c.beginPath(); c.moveTo(x, y - 10); c.lineTo(x + 9, y + 8); c.lineTo(x - 9, y + 8); c.closePath(); c.fill(); c.fillStyle = '#2a2620'; c.beginPath(); c.arc(x, y - 3, 4, 0, 7); c.fill(); c.fillStyle = '#d8b088'; c.fillRect(x - 2, y - 1, 4, 3); } },
          ],
        },
        winText: 'The golden arrow is yours — and the Sheriff knows he has been mocked.',
        phases: [archery(), duelBoss({ name: 'SIR GUY OF GISBORNE', help: 'DRAG to dodge · LOOSE when he lowers his shield', hp: 3, hpLabel: 'GUY', winText: 'Gisborne yields the field, his horse-hide cloak in the mud.', loseText: 'Gisborne\'s bolt finds its mark.', sprite: GISBORNE, pal: GPAL, sc: 3, aura: '#5a1418', bg: forestClearingBg })],
      },
      {
        id: 'greenwood', name: 'THE GREENWOOD', sub: "SHERWOOD'S HEART", needs: ['tournament'], reward: 55, grant: 'horn',
        icon(api, x, y) { const g = api.gfx, c = api.ctx; c.fillStyle = '#1f4a18'; c.beginPath(); c.arc(x, y - 2, 7, 0, 7); c.fill(); g.rect(x - 1, y + 3, 2, 5, '#5a3a1a'); },
        intro: ['Deep in the greenwood the poor', 'come to Robin for justice —', 'and the Bishop\'s gold rides near.'],
        quote: 'Come, Merry Men! Ride swift as the north wind through the good trees of Sherwood!',
        winText: 'The Bishop rides home lighter — and Sherwood eats for a month.',
        phases: [ride(), ambush()],
      },
      {
        id: 'bridge', name: 'THE LOG BRIDGE', sub: 'HONOUR AMONG OUTLAWS', needs: ['tournament'], optional: true, reward: 40, grant: 'staff',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 8, y, 16, 3, '#5a3f22'); g.rect(x - 1, y - 8, 2, 12, '#8a6a3a'); },
        intro: ['A stranger blocks the log bridge', 'and will not yield an inch.', 'Staff to staff, then — for honour.'],
        quote: 'He fell with such a crash into the cold water that the sound made Robin\'s heart merry.',
        winText: 'Little John rises from the river laughing — and swears to Sherwood.',
        phases: [littlejohn()],
      },
      {
        id: 'barnsdale', name: 'BARNSDALE', sub: "THE BISHOP'S FEAST", needs: ['greenwood'], reward: 70,
        icon(api, x, y) { const g = api.gfx; g.circle(x, y, 4, '#e8c84a'); g.rect(x - 6, y + 4, 12, 3, '#8a6a3a'); },
        intro: ['At the Bishop\'s feast the gold', 'lies heaped — and in his gaol,', 'Will Stutely waits to hang.'],
        quote: 'Twelve score gold pieces — every groat wrung from the poor of Nottinghamshire.',
        winText: 'The gold is Sherwood\'s and Will runs free. Now — the Sheriff himself.',
        phases: [robrich(), rescue()],
      },
      {
        id: 'reckoning', name: 'THE RECKONING', sub: 'DOWN WITH THE SHERIFF', needs: ['barnsdale'], reward: 100,
        icon(api, x, y) { const g = api.gfx; g.rect(x - 6, y - 6, 12, 12, '#2a2b3a'); api.txtC('⚔', x, y - 5, 8, '#c0c4cc'); },
        intro: ['Into Nottingham Castle at last —', 'past the watch, up the keep, to', 'the Sheriff who has hunted you.'],
        quote: 'I am the law of Nottinghamshire — and you, Hood, are nothing but an outlaw and a thief.',
        winText: 'The Sheriff falls. The greenwood is free, and the king shall hear of it.',
        phases: [infiltrate(), duelBoss({ name: 'THE SHERIFF', help: 'DRAG to dodge his archers · LOOSE when he steps out', hp: 4, hpLabel: 'SHERIFF', timed: false, winText: 'Your last arrow ends the Sheriff\'s reign of taxes.', loseText: 'The Sheriff\'s guard overwhelms you.', sprite: SHERIFF, pal: SPAL, sc: 3, aura: '#3a2a44', shotHead: '#c0c0c0', bg: castleHallBg })],
      },
    ],
    endings: [
      { when: (f, s) => f.bold && s.done.bridge, title: 'THE MERRY BAND', lines: ['You never hid your face — and', 'Little John, Will, and all Sherwood', 'stood at your back to the end.', '', 'The greenwood is free.'] },
      { when: (f) => f.disguise, title: 'THE HOODED STRANGER', lines: ['They never knew the beggar', 'was the outlaw they hunted —', 'until the golden arrow flew.', '', 'The greenwood is free.'] },
      { when: (f) => f.bold, title: 'THE OUTLAW KING', lines: ['You bowed to no lord but the true', 'king — and Nottingham learned to', 'fear the sound of a bowstring.', '', 'The greenwood is free.'] },
      { when: () => true, title: 'SHERWOOD FREE', lines: ['The Sheriff is thrown down and', 'the poor eat well tonight.', 'Sing of Robin Hood.'] },
    ],
    finale: ['SHERWOOD IS FREE.'],
  });
})();
