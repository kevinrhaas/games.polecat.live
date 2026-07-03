/* ============================================================================
 * DRACULA — NIGHTS OF BLOOD   (Gen 2 / 16-bit)
 * A richer, more dynamic take on Bram Stoker's novel, built on RetroSaga2:
 *   HUB MAP of the journey (Transylvania -> England), nodes unlock in sequence
 *   with an optional Renfield side-node; each node is multiple escalating
 *   phases ending in a mini-boss; persistent upgrades (silver blade, garlic,
 *   holy water) carry across the run; an escape-route CHOICE sets the ending.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    night1: '#0a0612', night2: '#1b0a18', mist: '#2a1830',
    blood: '#c8102e', bloodL: '#e23b4a', rose: '#e8c0c0',
    gold: '#e3c567', bone: '#cdbfe0', stone: '#3a2f44', shadow: '#080410',
  };

  /* ─── heraldic bat crest (title + finale) ─── */
  function emblem(api, cx, cy) {
    const g2 = api.g2, c = api.ctx;
    g2.glow(cx, cy, 40, '#7a1020', 0.7);
    // shield backdrop
    c.fillStyle = '#160a1a';
    c.beginPath(); c.moveTo(cx - 26, cy - 18); c.lineTo(cx + 26, cy - 18); c.lineTo(cx + 26, cy + 6);
    c.quadraticCurveTo(cx + 26, cy + 26, cx, cy + 30); c.quadraticCurveTo(cx - 26, cy + 26, cx - 26, cy + 6); c.closePath(); c.fill();
    c.strokeStyle = '#e3c567'; c.lineWidth = 2; c.stroke();
    api.gfx.sprite([
      'r..........r',
      'rr...rr...rr',
      'rrr.rrrr.rrr',
      '.rrrrrrrrrr.',
      '..rr.rr.rr..',
      '...r....r...',
    ], cx - 30, cy - 14, { r: C.blood }, 5);
  }

  /* ─── cinematic animated night: parallax castle, blood moon, bats, fog,
   *     embers, occasional lightning. Shared by boot/intro/result/finale/hub. ─ */
  function ridge(c, W, y, step, amp, seed, color) {
    c.fillStyle = color; c.beginPath(); c.moveTo(0, y);
    for (let x = 0; x <= W; x += step) c.lineTo(x, y - amp * (0.35 + 0.65 * Math.abs(Math.sin(x * 0.11 + seed))));
    c.lineTo(W, y + 260); c.lineTo(0, y + 260); c.closePath(); c.fill();
  }
  function drawCastle(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, baseY = H - 96;
    c.fillStyle = '#08040e';
    c.fillRect(28, baseY - 66, W - 56, 66);
    for (let x = 30; x < W - 30; x += 13) c.fillRect(x, baseY - 72, 7, 7); // battlements
    const towers = [[20, 84], [64, 60], [148, 70], [206, 54], [W - 42, 78]];
    for (const tw of towers) {
      const tx = tw[0], th = tw[1];
      c.fillStyle = '#08040e'; c.fillRect(tx, baseY - th, 22, th);
      c.beginPath(); c.moveTo(tx - 2, baseY - th); c.lineTo(tx + 11, baseY - th - 16); c.lineTo(tx + 24, baseY - th); c.closePath(); c.fill(); // spire
      const fl = 0.45 + 0.55 * Math.sin(t * (5 + tx * 0.04) + tx);
      if (fl > 0.45) g2.glow(tx + 11, baseY - th + 18, 7, '#e3a030', 0.5 * fl);
      c.fillStyle = g2.mix('#2a1a06', '#ffcf5a', Math.max(0, fl)); c.fillRect(tx + 8, baseY - th + 14, 6, 9);
    }
    c.fillStyle = '#05030a'; c.fillRect(W / 2 - 13, baseY - 30, 26, 30);
    g2.glow(W / 2, baseY - 12, 11, '#7a1420', 0.4);
  }
  function batSwarm(api, t) {
    const g = api.gfx, defs = [[10, 108, 2, '#140a16'], [15, 140, 2, '#1a0c1c'], [8, 90, 3, '#0e0712'], [18, 168, 1, '#120814'], [12, 124, 2, '#160a18']];
    defs.forEach((d, i) => {
      const bx = ((t * d[0]) + i * 70) % (api.W + 50) - 25, y = d[1] + Math.sin(t * 2 + i) * 18;
      const flap = Math.sin(t * 12 + i) > 0;
      g.sprite(flap ? ['k.kk.k', '.kkkk.'] : ['.k..k.', 'kkkkkk'], bx, y, { k: d[3] }, d[2]);
    });
  }
  function nightScene(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, '#0a0612'], [0.45, '#1a0a1c'], [1, '#050308']]);
    g2.stars(t, 48, H * 0.5, '#d8c8f0');
    // blood moon with pulse + bloom + crescent shadow
    const mp = 1 + 0.05 * Math.sin(t * 0.8);
    g2.glow(W - 56, 60, 46 * mp, '#7a1420', 0.5);
    c.fillStyle = '#b03038'; c.beginPath(); c.arc(W - 56, 60, 22, 0, 7); c.fill();
    c.fillStyle = '#8a2028'; [[6, -4, 4], [-5, 5, 3], [3, 8, 2]].forEach((cr) => { c.beginPath(); c.arc(W - 56 + cr[0], 60 + cr[1], cr[2], 0, 7); c.fill(); });
    c.fillStyle = '#150a12'; c.beginPath(); c.arc(W - 48, 53, 19, 0, 7); c.fill();
    ridge(c, W, H * 0.54, 12, 22, 1.7, '#0c0814');
    drawCastle(api, t);
    g2.fog(t, { y0: H * 0.55, y1: H, bands: 5, color: '#3a2540', alpha: 0.09 });
    g2.embers(t, 16, { yBottom: H, yTop: H * 0.28, color: '#c85a6a', speed: 0.09, size: 2, alpha: 0.45 });
    batSwarm(api, t);
    const L = g2.lightning(t, 7.5);
    if (L > 0) { c.fillStyle = 'rgba(178,188,255,' + (L * 0.32) + ')'; c.fillRect(0, 0, W, H); }
    if (dim) { c.fillStyle = 'rgba(6,3,9,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }
  function scenery(api, scene, t) {
    if (scene === 'hub') { nightScene(api, t, 0.5); return; }
    nightScene(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale') ? 0.55 : 0);
  }

  /* ─── tiny per-location vignettes shown inside each menu medallion ─── */
  const ART = {
    castle(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#120a1e'; c.fillRect(x, y, w, h); g2.glow(x + w * 0.7, y + 6, 10, '#7a1420', 0.5); c.fillStyle = '#b03038'; c.beginPath(); c.arc(x + w * 0.7, y + 6, 5, 0, 7); c.fill(); c.fillStyle = '#05030a'; c.fillRect(x + w / 2 - 6, y + 6, 12, h); const fl = 0.5 + 0.5 * Math.sin(t * 6); c.fillStyle = g2.mix('#2a1a06', '#ffcf5a', fl); c.fillRect(x + w / 2 - 2, y + 12, 4, 5); },
    demeter(api, x, y, w, h, t) { const c = api.ctx; c.fillStyle = '#0a1826'; c.fillRect(x, y, w, h); c.strokeStyle = '#1c3a52'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); const yy = y + h - 4 - i * 5; c.moveTo(x, yy); for (let xx = 0; xx <= w; xx += 6) c.lineTo(x + xx, yy + Math.sin(t * 3 + xx * 0.4 + i) * 1.6); c.stroke(); } const sx = x + w / 2 + Math.sin(t) * 6; c.fillStyle = '#3a2410'; c.fillRect(sx - 7, y + h - 12, 14, 5); c.fillStyle = '#d8d0b0'; c.fillRect(sx - 1, y + h - 22, 2, 10); c.beginPath(); c.moveTo(sx + 1, y + h - 21); c.lineTo(sx + 7, y + h - 15); c.lineTo(sx + 1, y + h - 13); c.fill(); },
    renfield(api, x, y, w, h, t) { const c = api.ctx; c.fillStyle = '#161018'; c.fillRect(x, y, w, h); c.fillStyle = '#0a0810'; c.fillRect(x + w / 2 - 12, y + 3, 24, h - 6); c.strokeStyle = '#3a2a20'; c.lineWidth = 1; for (let i = -1; i < 2; i++) { c.beginPath(); c.moveTo(x + w / 2 + i * 8, y + 3); c.lineTo(x + w / 2 + i * 8, y + h - 3); c.stroke(); } const fx = x + w / 2 + Math.sin(t * 4) * 9, fy = y + h / 2 + Math.cos(t * 5) * 6; c.fillStyle = '#101010'; c.fillRect(fx, fy, 2, 2); },
    whitby(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#101422'; c.fillRect(x, y, w, h); g2.fog(t, { y0: y + h - 10, y1: y + h, bands: 2, color: '#8a9ac0', alpha: 0.12 }); c.fillStyle = '#2a2f3a'; [10, 26, 44, 62].forEach((dx) => { c.fillRect(x + dx, y + h - 10, 6, 10); }); c.fillStyle = '#4a4f5c'; c.fillRect(x + w / 2 - 1, y + 6, 3, 16); c.fillRect(x + w / 2 - 5, y + 10, 11, 3); },
    reckoning(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#e08040'); gr.addColorStop(1, '#3a1a20'); c.fillStyle = gr; c.fillRect(x, y, w, h); g2.glow(x + w / 2, y + h, 22, '#ffb060', 0.5); c.fillStyle = '#1a0e12'; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x + w * 0.4, y + h * 0.5); c.lineTo(x + w * 0.6, y + h * 0.5); c.lineTo(x + w, y + h); c.fill(); const cx = x + w / 2 + Math.sin(t) * 4; c.fillStyle = '#120810'; c.fillRect(cx - 5, y + h - 12, 10, 5); },
  };

  /* ─── HUB: an illuminated gothic route-map, Transylvania → England ─── */
  const NODES_XY = { castle: [40, 92], demeter: [150, 150], renfield: [26, 250], whitby: [152, 288], reckoning: [84, 388] };
  const ORDER = ['castle', 'demeter', 'whitby', 'reckoning'];
  const menu = {
    title(api, save, t) {
      const c = api.ctx, g2 = api.g2, W = api.W;
      // flowing blood trail between the main stops
      c.save(); c.setLineDash([4, 7]); c.lineDashOffset = -(t * 22) % 1000;
      c.strokeStyle = C.blood; c.lineWidth = 2.5; c.globalAlpha = 0.55 + 0.2 * Math.sin(t * 3);
      c.beginPath(); ORDER.forEach((id, i) => { const p = NODES_XY[id], px = p[0] + 46, py = p[1] + 30; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke(); c.restore();
      // corner torches
      g2.flame(16, 74, t, 1.2, { glow: 'rgba(255,140,40,.9)' });
      g2.flame(W - 16, 74, t, 1.2, { glow: 'rgba(255,140,40,.9)' });
      // ornate header plaque
      g2.ornateFrame(24, 12, W - 48, 38, 8, 'rgba(12,4,10,.92)', '#8a1824');
      g2.gleamText("THE COUNT'S CHRONICLE", W / 2, 18, api.fitSize("THE COUNT'S CHRONICLE", 10, W - 70, true), C.bloodL, t, { shadow: 'rgba(0,0,0,.7)', gleamSpeed: 60 });
      g2.glow(W / 2 - 34, 40, 6, C.blood, 0.7); c.fillStyle = C.blood; c.beginPath(); c.arc(W / 2 - 34, 40, 3, 0, 7); c.fill();
      api.txtCFit('BLOOD  ' + (save.cur || 0), W / 2 + 6, 36, 9, C.rose);
    },
    layout() { return ['castle', 'demeter', 'renfield', 'whitby', 'reckoning'].map((id) => ({ x: NODES_XY[id][0], y: NODES_XY[id][1], w: 92, h: 66 })); },
    node(api, info) {
      const g = api.gfx, c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, locked, t } = info;
      const cx = x + w / 2;
      if (sel && !locked) g2.glow(cx, y + (h - 14) / 2, 48, C.blood, 0.35 + 0.2 * Math.sin(t * 4));
      g2.ornateFrame(x, y, w, h - 14, 7, locked ? 'rgba(14,10,20,.92)' : 'rgba(20,12,26,.95)', done ? C.gold : (sel ? C.bloodL : '#5a3a4a'));
      // art vignette clipped inside the frame
      c.save(); g2.roundRect(x + 5, y + 5, w - 10, h - 30, 5, null, null); c.clip();
      if (!locked && ART[node.id]) ART[node.id](api, x + 5, y + 5, w - 10, h - 30, t); else { c.fillStyle = '#0e0812'; c.fillRect(x + 5, y + 5, w - 10, h - 30); }
      c.restore();
      if (locked) { c.fillStyle = 'rgba(8,4,10,.6)'; g2.roundRect(x + 5, y + 5, w - 10, h - 30, 5, 'rgba(8,4,10,.6)', null); api.txtC('🔒', cx, y + (h - 30) / 2 - 3, 12, '#7a6a7a'); }
      if (done) api.txtC('✝', x + w - 12, y + 9, 10, C.gold);
      // ribbon nameplate
      g2.roundRect(x + 6, y + h - 22, w - 12, 16, 4, done ? '#3a2a10' : '#2a0e16', done ? C.gold : '#7a2030', 1);
      api.txtCFit((node.optional ? '◆ ' : '') + node.name, cx, y + h - 19, 7, locked ? '#5a4a5a' : (done ? '#f0d878' : C.rose), false, w - 16);
      // hovering bat cursor over the selected node
      if (sel && !locked) { const by = y - 9 + Math.sin(t * 5) * 2; g.sprite(Math.sin(t * 10) > 0 ? ['k.kk.k', '.kkkk.'] : ['.k..k.', 'kkkkkk'], cx - 6, by, { k: C.bloodL }, 2); }
    },
  };

  /* ─── cinematic animated title screen ─── */
  function bloodDrips(api, yTop, t) {
    const c = api.ctx, W = api.W;
    for (let i = 0; i < 6; i++) {
      const bx = W / 2 - 70 + i * 28, ph = (t * 0.4 + i * 0.33) % 1;
      const y = yTop + ph * 26, a = Math.sin(ph * Math.PI);
      c.globalAlpha = a; c.fillStyle = C.blood;
      c.beginPath(); c.arc(bx, y, 2.4, 0, 7); c.fill(); c.fillRect(bx - 1, yTop, 2, y - yTop);
    }
    c.globalAlpha = 1;
  }
  function renderBoot(api, info) {
    const g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    nightScene(api, t, 0);
    emblem(api, W / 2, H * 0.22);
    const ts = api.fitSize('DRACULA', 30, W - 20, true);
    g2.gleamText('DRACULA', W / 2, H * 0.37, ts, C.bloodL, t, { bevel: '#ff9aa6', shadow: 'rgba(0,0,0,.8)', gleamSpeed: 55 });
    bloodDrips(api, H * 0.37 + ts, t);
    api.txtCFit('NIGHTS OF BLOOD', W / 2, H * 0.37 + ts + 16, 11, C.rose, true);
    if (info.blink) api.txtCFit('▸ TAP TO ENTER ◂', W / 2, H * 0.70, 12, '#f0d6d6');
    api.txtCFit('A 16-BIT TRIBUTE · B. STOKER, 1897', W / 2, H - 28, 8, '#8a6a8a');
    api.vignette(); api.scanlines();
  }

  /* ============================ mini-game phases ============================ */
  // Shared: a chunky vampire figure sprite
  const COUNT = ['..kk..', '.kwwk.', 'kwrwrk', 'krwwrk', '.kwwk.', 'kk..kk'];
  const COUNTPAL = { k: '#0a0610', w: '#d8c8e0', r: C.blood };

  /* --- CASTLE p1: the climb (timing) --- */
  function climb() {
    return {
      name: 'THE CASTLE WALL', boss: false, help: 'TAP when the grip meets the green',
      winText: 'Hand over hand, Harker gains the black window.',
      loseText: 'His grip fails; the stones rush up.',
      init(api) { this.h = 0; this.need = 10; this.m = 0; this.dir = 1; this.spd = 0.9; this.band = 0.16; this.miss = 0; },
      update(api) {
        this.m += this.dir * this.spd * 0.02; if (this.m > 1) { this.m = 1; this.dir = -1; } if (this.m < 0) { this.m = 0; this.dir = 1; }
        if (api.confirm()) {
          if (Math.abs(this.m - 0.5) < this.band) { this.h++; api.addScore(20); api.audio.sfx('coin'); api.burst(api.W / 2, api.H - 60, C.gold, 6); this.spd = Math.min(1.8, this.spd + 0.08); this.band = Math.max(0.1, this.band - 0.006); if (this.h >= this.need) { api.addScore(50); api.win(); } }
          else { this.miss++; api.shake(5, 0.25); api.audio.sfx('hurt'); if (this.miss >= 4) api.lose(); }
        }
      },
      draw(api) {
        const g = api.gfx, W = api.W, H = api.H;
        api.clear('#0c0a12');
        for (let y = 0; y < H; y += 18) for (let x = 0; x < W; x += 30) g.rect(x + ((Math.floor(y / 18) % 2) ? 15 : 0), y, 28, 16, '#1b1424');
        api.g2.glow(W / 2, 40, 30, '#e3a030', 0.5); g.rect(W / 2 - 12, 24, 24, 30, '#e3c567');
        const cy = H - 70 - (H - 150) * (this.h / this.need);
        api.g2.bigSprite(['.hh.', 'hffh', '.cc.', 'c..c'], W / 2 - 8, cy, { h: '#3a2f1a', f: '#caa07a', c: '#6a2a2a' }, 4, { shadow: true });
        // grip meter
        const mx = 30, mw = W - 60, my = H - 30;
        g.rect(mx, my, mw, 8, '#241a2e'); g.rect(mx + mw * (0.5 - this.band), my, mw * this.band * 2, 8, '#1e5a2a');
        g.rect(mx + mw * this.m - 2, my - 3, 4, 14, C.bloodL);
        api.txtCFit('CLIMB  ' + this.h + '/' + this.need, W / 2, 8, 9, C.rose);
      },
    };
  }
  /* --- CASTLE p2 (boss): the Count descends --- */
  function countBoss(finalSun) {
    return {
      name: finalSun ? 'THE COUNT AT SUNSET' : 'THE COUNT', boss: true,
      help: 'DRAG to dodge · TAP the Count when he glows',
      winText: finalSun ? 'The blade finds his heart as the sun crests. Dust.' : 'You break past the Count into the night.',
      loseText: 'His cold hands find you.',
      init(api) {
        this.x = api.W / 2; this.hp = api.has('blade') ? 3 : 4; this.taken = 0; this.maxTaken = api.has('garlic') ? 4 : 3;
        this.shards = []; this.spawnT = 0.7; this.glow = 0; this.glowT = 1.6; this.strike = false; this.bx = api.W / 2; this.bdir = 1; this.sun = 0;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.bx += this.bdir * 24 * dt; if (this.bx < 40 || this.bx > W - 40) this.bdir *= -1;
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.3;
        this.x = clamp(this.x, 16, W - 16);
        if (finalSun) this.sun += dt / 40;
        // strike window pulses
        this.glowT -= dt; if (this.glowT <= 0) { this.strike = !this.strike; this.glowT = this.strike ? 1.1 : 1.4; }
        // shards
        this.spawnT -= dt; if (this.spawnT <= 0) { this.shards.push({ x: api.rnd(16, W - 16), y: 96, s: api.rnd(2.4, 3.6) }); this.spawnT = api.rnd(0.45, 0.9); }
        for (const s of this.shards) s.y += s.s * dt * 60;
        this.shards = this.shards.filter((s) => s.y < H + 10);
        const py = H - 70;
        for (const s of this.shards) if (Math.abs(s.x - this.x) < 12 && Math.abs(s.y - py) < 14) { s.y = H + 99; this.taken++; api.shake(6, 0.3); api.flash(C.blood, 0.2); api.audio.sfx('hurt'); if (this.taken >= this.maxTaken) return api.lose(); }
        if (api.pointer.justDown && this.strike && Math.abs(api.pointer.x - this.bx) < 30 && api.pointer.y < 150) {
          this.hp--; api.addScore(40); api.audio.sfx('shoot'); api.burst(this.bx, 120, C.blood, 12); this.strike = false; this.glowT = 1.2;
          if (this.hp <= 0) { api.addScore(80); api.win(); }
        }
      },
      draw(api) {
        const g = api.gfx, W = api.W, H = api.H;
        api.clear('#120818');
        if (finalSun) { api.g2.verticalGradient(0, 0, W, H, [[0, '#3a1020'], [1, '#120818']]); api.g2.glow(W / 2, H * (1 - this.sun) - 20, 60, '#e8a030', 0.4 + this.sun * 0.4); }
        // the Count
        if (this.strike) api.g2.glow(this.bx, 118, 34, C.bloodL, 0.7);
        api.g2.bigSprite(COUNT, this.bx - 18, 96, COUNTPAL, 6, { shadow: true, outline: true });
        // shards
        for (const s of this.shards) { g.rect(s.x - 2, s.y - 5, 4, 10, C.bloodL); }
        // player
        api.g2.bigSprite(['.ww.', 'wwww', '.ww.'], this.x - 8, H - 78, { w: '#caa07a' }, 4, { shadow: true });
        api.txtCFit('THE COUNT  ' + '♥'.repeat(this.hp), W / 2, 8, 9, C.rose);
        api.txtCFit('WOUNDS ' + this.taken + '/' + this.maxTaken, W / 2, 24, 8, C.mist);
        if (this.strike) api.txtCFit('STRIKE!', this.bx, 150, 9, C.gold);
      },
    };
  }
  /* --- DEMETER p1: storm at sea (Mode-7 + dodge) --- */
  function storm() {
    return {
      name: 'THE DEMETER', boss: false, help: 'DRAG to steer · dodge the reefs',
      winText: 'The ship drives on through the black water.',
      loseText: 'The Demeter founders on the rocks.',
      init(api) { this.x = api.W / 2; this.z = 0; this.need = 300; this.lives = api.has('garlic') ? 4 : 3; this.imm = 0; this.obs = []; this.sp = 0.9; this.spawnT = 0.8; },
      update(api, dt) {
        const W = api.W, H = api.H; this.z += this.sp * dt * 60; this.imm = Math.max(0, this.imm - dt);
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.25;
        this.x = clamp(this.x, 24, W - 24);
        this.spawnT -= dt; if (this.spawnT <= 0) { this.obs.push({ x: api.rnd(24, W - 24), y: H * 0.44, s: api.rnd(1.9, 2.8) }); this.spawnT = api.rnd(0.55, 1.0); }
        for (const o of this.obs) o.y += o.s * dt * 60;
        this.obs = this.obs.filter((o) => o.y < H + 12);
        const py = H - 74;
        if (this.imm <= 0) for (const o of this.obs) if (Math.abs(o.x - this.x) < 16 && Math.abs(o.y - py) < 18) { o.y = H + 99; this.lives--; this.imm = 1.4; api.shake(7, 0.3); api.flash(C.blood, 0.25); api.audio.sfx('hurt'); if (this.lives <= 0) return api.lose(); }
        api.score = Math.floor(this.z); if (this.z >= this.need) { api.addScore(60); api.win(); }
      },
      draw(api) {
        const W = api.W, H = api.H, g = api.gfx;
        api.g2.skyGradient([[0, '#0a0818'], [1, '#1a2038']], H * 0.44);
        api.g2.glow(W - 50, 44, 30, '#7a1420', 0.5);
        api.g2.mode7({ horizon: H * 0.44, camZ: this.z * 2, angle: Math.sin(api.t * 0.4) * 0.15, height: 1.2, fog: '#12203a', tex: (wx, wz) => ((Math.floor(wx / 46) + Math.floor(wz / 46)) & 1) ? '#123152' : '#0e2844' });
        for (const o of this.obs) { g.rect(o.x - 10, o.y - 6, 20, 12, '#3a586a'); g.rect(o.x - 6, o.y - 3, 12, 6, '#5a9aaa'); }
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) api.g2.bigSprite(['.ww.', 'wwww', 'wwww', '.ww.'], this.x - 16, H - 92, { w: '#6a4018' }, 8, { shadow: true, outline: '#2a1608' });
        api.txtCFit('❤'.repeat(Math.max(0, this.lives)), 40, 8, 10, C.blood);
        api.txtCFit('LANDFALL ' + Math.floor(this.z / this.need * 100) + '%', W / 2, 8, 9, C.rose);
      },
    };
  }
  /* --- DEMETER p2 (boss): the thing in the hold (defend) --- */
  function hold() {
    return {
      name: 'THE HOLD', boss: true, help: 'TAP the shadows before they reach the mast',
      winText: 'Dawn — the crew still breathes. Barely.',
      loseText: 'One by one, the crew vanish.',
      init(api) { this.warded = 0; this.need = 14; this.breaches = 0; this.max = 3; this.shadows = []; this.spawnT = 0.6; this.time = 22; },
      update(api, dt) {
        const W = api.W, H = api.H; this.time -= dt;
        this.spawnT -= dt; if (this.spawnT <= 0) { const edge = api.rint(0, 3); const p = { x: edge === 0 ? 8 : edge === 1 ? W - 8 : api.rnd(20, W - 20), y: edge < 2 ? api.rnd(60, H - 60) : (edge === 2 ? 40 : H - 40), t: 0 }; this.shadows.push(p); this.spawnT = api.rnd(0.5, 1.1) * (this.time < 10 ? 0.7 : 1); }
        const cx = W / 2, cy = H / 2;
        for (const s of this.shadows) { const dx = cx - s.x, dy = cy - s.y, d = Math.hypot(dx, dy) || 1; s.x += dx / d * 22 * dt; s.y += dy / d * 22 * dt; if (Math.hypot(cx - s.x, cy - s.y) < 22) { s.dead = 2; this.breaches++; api.shake(6, 0.3); api.flash(C.blood, 0.2); api.audio.sfx('hurt'); if (this.breaches >= this.max) return api.lose(); } }
        if (api.pointer.justDown) for (const s of this.shadows) if (!s.dead && Math.hypot(api.pointer.x - s.x, api.pointer.y - s.y) < 20) { s.dead = 1; this.warded++; api.addScore(15); api.audio.sfx('shoot'); api.burst(s.x, s.y, C.gold, 8); break; }
        this.shadows = this.shadows.filter((s) => !s.dead);
        if (this.time <= 0) { api.addScore(70); api.win(); }
      },
      draw(api) {
        const W = api.W, H = api.H, g = api.gfx;
        api.clear('#0b0714'); api.g2.dither(0, H, '#160a18', '#0b0714', 3);
        // mast / crew heart at center
        api.g2.glow(W / 2, H / 2, 26, '#e3a030', 0.5); g.rect(W / 2 - 3, H / 2 - 20, 6, 40, '#3a2a16'); g.rect(W / 2 - 14, H / 2 - 14, 28, 4, '#3a2a16');
        for (const s of this.shadows) { api.g2.glow(s.x, s.y, 12, '#5a1020', 0.6); g.sprite(['.kk.', 'kkkk', 'k.kk', 'kk.k'], s.x - 4, s.y - 4, { k: '#1a0a1e' }, 2); }
        api.txtCFit('WARD OFF · ' + Math.ceil(this.time) + 's', W / 2, 8, 9, C.rose);
        api.txtCFit('BREACHES ' + this.breaches + '/' + this.max, W / 2, 24, 8, C.mist);
      },
    };
  }
  /* --- RENFIELD (optional): catch the flies --- */
  function flies() {
    return {
      name: 'RENFIELD', boss: false, help: 'TAP the flies — feed the master',
      winText: 'The blood is the life! Renfield cackles, sated.',
      loseText: 'The flies scatter into the dark.',
      init(api) { this.caught = 0; this.need = 16; this.time = 20; this.flies = []; for (let i = 0; i < 6; i++) this.spawn(api); },
      spawn(api) { this.flies.push({ x: api.rnd(20, api.W - 20), y: api.rnd(60, api.H - 80), vx: api.rnd(-1, 1), vy: api.rnd(-1, 1), ph: api.rnd(0, 6) }); },
      update(api, dt) {
        const W = api.W, H = api.H; this.time -= dt;
        for (const f of this.flies) { f.ph += dt * 6; f.x += (f.vx + Math.sin(f.ph) * 0.6) * 40 * dt; f.y += (f.vy + Math.cos(f.ph * 1.3) * 0.6) * 40 * dt; if (f.x < 14 || f.x > W - 14) f.vx *= -1; if (f.y < 50 || f.y > H - 60) f.vy *= -1; f.x = clamp(f.x, 14, W - 14); f.y = clamp(f.y, 50, H - 60); }
        if (api.pointer.justDown) for (const f of this.flies) if (!f.dead && Math.hypot(api.pointer.x - f.x, api.pointer.y - f.y) < 18) { f.dead = true; this.caught++; api.addScore(12); api.audio.sfx('coin'); api.burst(f.x, f.y, '#7adaee', 6); setTimeout(() => {}, 0); this.spawn(api); if (this.caught >= this.need) { api.addScore(50); api.win(); } break; }
        this.flies = this.flies.filter((f) => !f.dead);
        if (this.time <= 0) { if (this.caught >= this.need * 0.6) { api.win(); } else api.lose(); }
      },
      draw(api) {
        const W = api.W, H = api.H, g = api.gfx;
        api.clear('#12100a'); api.g2.dither(0, H, '#1a1510', '#0c0a06', 3);
        g.rect(0, H - 40, W, 40, '#241a10');
        for (const f of this.flies) { g.rect(f.x - 2, f.y - 2, 4, 4, '#101010'); g.rect(f.x - 3, f.y - 1, 2, 2, 'rgba(200,220,255,.6)'); }
        api.txtCFit('CAUGHT ' + this.caught + '/' + this.need + ' · ' + Math.ceil(this.time) + 's', W / 2, 8, 9, C.rose);
      },
    };
  }
  /* --- WHITBY p1: Lucy's chase (dodge runner) --- */
  function moor() {
    return {
      name: "LUCY'S TRAIL", boss: false, help: 'DRAG to follow the bat · dodge the stones',
      winText: 'The trail leads to the churchyard, and to her tomb.',
      loseText: 'You lose the pale shape in the fog.',
      init(api) { this.x = api.W / 2; this.z = 0; this.need = 260; this.lives = api.has('garlic') ? 4 : 3; this.imm = 0; this.rocks = []; this.spawnT = 0.7; this.bat = api.W / 2; this.bd = 1; },
      update(api, dt) {
        const W = api.W, H = api.H; this.z += 1.0 * dt * 60; this.imm = Math.max(0, this.imm - dt);
        this.bat += this.bd * 30 * dt; if (this.bat < 30 || this.bat > W - 30) this.bd *= -1;
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.25; this.x = clamp(this.x, 18, W - 18);
        this.spawnT -= dt; if (this.spawnT <= 0) { this.rocks.push({ x: api.rnd(18, W - 18), y: -10, s: api.rnd(2.0, 3.0) }); this.spawnT = api.rnd(0.5, 0.95); }
        for (const r of this.rocks) r.y += r.s * dt * 60; this.rocks = this.rocks.filter((r) => r.y < H + 12);
        const py = H - 70;
        if (this.imm <= 0) for (const r of this.rocks) if (Math.abs(r.x - this.x) < 13 && Math.abs(r.y - py) < 16) { r.y = H + 99; this.lives--; this.imm = 1.3; api.shake(6, 0.3); api.audio.sfx('hurt'); if (this.lives <= 0) return api.lose(); }
        api.score = Math.floor(this.z); if (this.z >= this.need) { api.addScore(60); api.win(); }
      },
      draw(api) {
        const W = api.W, H = api.H, g = api.gfx;
        api.g2.skyGradient([[0, '#0a0816'], [1, '#241830']]);
        api.g2.glow(this.bat, 70, 16, '#5a1020', 0.6); g.sprite(['k.kk.k', '.kkkk.'], this.bat - 6, 66, { k: '#1a0a1e' }, 2);
        // fog bands
        for (let i = 0; i < 4; i++) { api.ctx.globalAlpha = 0.08; g.rect(0, 150 + i * 70 + Math.sin(api.t + i) * 6, W, 20, '#9b7bbf'); } api.ctx.globalAlpha = 1;
        g.rect(0, H - 44, W, 44, '#14101c');
        for (const r of this.rocks) g.circle(r.x, r.y, 7, '#4a4258');
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) api.g2.bigSprite(['.ww.', 'wwww', '.ww.', 'w..w'], this.x - 8, H - 78, { w: '#caa07a' }, 4, { shadow: true });
        api.txtCFit('❤'.repeat(Math.max(0, this.lives)), 40, 8, 10, C.blood);
        api.txtCFit('FOLLOW ' + Math.floor(this.z / this.need * 100) + '%', W / 2, 8, 9, C.rose);
      },
    };
  }
  /* --- WHITBY p2 (boss): the Bloofer Lady (precision stake) --- */
  function stake() {
    return {
      name: 'THE BLOOFER LADY', boss: true, help: 'TAP when the ring closes on her heart',
      winText: 'Lucy is at peace. The horror leaves her face.',
      loseText: 'She slips back into the crypt, hissing.',
      init(api) { this.hits = 0; this.need = 3; this.miss = 0; this.r = 1; this.dir = -1; this.spd = 0.5; this.band = api.has('holywater') ? 0.16 : 0.11; },
      update(api, dt) {
        this.r += this.dir * this.spd * dt; if (this.r < 0.12) { this.r = 0.12; this.dir = 1; } if (this.r > 1) { this.r = 1; this.dir = -1; }
        if (api.confirm()) {
          if (this.r < 0.12 + this.band) { this.hits++; api.addScore(45); api.audio.sfx('shoot'); api.flash('#fff', 0.15); api.burst(api.W / 2, api.H / 2, C.gold, 14); this.spd += 0.08; if (this.hits >= this.need) { api.addScore(80); api.win(); } }
          else { this.miss++; api.shake(6, 0.3); api.audio.sfx('hurt'); if (this.miss >= 4) api.lose(); }
        }
      },
      draw(api) {
        const W = api.W, H = api.H, cx = W / 2, cy = H / 2 + 10, c = api.ctx;
        api.clear('#0c0714'); api.g2.dither(0, H, '#1a0a1e', '#0c0714', 3);
        // Lucy
        api.g2.glow(cx, cy, 30, '#5a1020', 0.5);
        api.g2.bigSprite(['.ww.', 'wwww', 'wrrw', '.ww.'], cx - 16, cy - 40, { w: '#e0d0e8', r: C.blood }, 8, { shadow: true });
        // heart target
        api.g2.glow(cx, cy, 8, C.blood, 0.9); c.fillStyle = C.blood; c.beginPath(); c.arc(cx, cy, 6, 0, 7); c.fill();
        // closing ring
        const rr = 14 + this.r * 90; c.strokeStyle = this.r < 0.12 + this.band ? C.gold : C.bone; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, rr, 0, Math.PI * 2); c.stroke();
        api.txtCFit('STAKES ' + this.hits + '/' + this.need, W / 2, 8, 9, C.rose);
        api.txtCFit('MISS ' + this.miss + '/4', W / 2, 24, 8, C.mist);
      },
    };
  }
  /* --- RECKONING p1: the chase to the castle (Mode-7 road) --- */
  function chase() {
    return {
      name: 'RACE THE SUNSET', boss: false, help: 'DRAG to steer · catch the box-cart',
      winText: 'The gypsy cart is in sight as the sun dips low.',
      loseText: 'The cart escapes into the mountain dark.',
      init(api) { this.x = api.W / 2; this.z = 0; this.need = 300; this.lives = api.has('garlic') ? 4 : 3; this.imm = 0; this.obs = []; this.spawnT = 0.7; this.cart = api.W / 2; this.cd = 1; },
      update(api, dt) {
        const W = api.W, H = api.H; this.z += 1.0 * dt * 60; this.imm = Math.max(0, this.imm - dt);
        this.cart += this.cd * 26 * dt; if (this.cart < 50 || this.cart > W - 50) this.cd *= -1;
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.25; this.x = clamp(this.x, 22, W - 22);
        this.spawnT -= dt; if (this.spawnT <= 0) { this.obs.push({ x: api.rnd(22, W - 22), y: H * 0.42, s: api.rnd(2.0, 2.9) }); this.spawnT = api.rnd(0.55, 1.0); }
        for (const o of this.obs) o.y += o.s * dt * 60; this.obs = this.obs.filter((o) => o.y < H + 12);
        const py = H - 72;
        if (this.imm <= 0) for (const o of this.obs) if (Math.abs(o.x - this.x) < 15 && Math.abs(o.y - py) < 16) { o.y = H + 99; this.lives--; this.imm = 1.3; api.shake(7, 0.3); api.audio.sfx('hurt'); if (this.lives <= 0) return api.lose(); }
        api.score = Math.floor(this.z); if (this.z >= this.need) { api.addScore(60); api.win(); }
      },
      draw(api) {
        const W = api.W, H = api.H, g = api.gfx;
        api.g2.verticalGradient(0, 0, W, H * 0.42, [[0, '#3a1a20'], [1, '#e08040']]); // sunset
        api.g2.glow(W / 2, H * 0.42, 50, '#ffb060', 0.5);
        api.g2.mode7({ horizon: H * 0.42, camZ: this.z * 2, angle: Math.sin(api.t * 0.5) * 0.2, height: 1.1, fog: '#2a1810', tex: (wx, wz) => ((Math.floor(wx / 44) + Math.floor(wz / 44)) & 1) ? '#3a2a18' : '#2e2012' });
        // the fleeing cart near horizon
        g.rect(this.cart - 8, H * 0.42 + 8, 16, 8, '#3a2410');
        for (const o of this.obs) { g.rect(o.x - 9, o.y - 5, 18, 10, '#4a3520'); }
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) api.g2.bigSprite(['.hh.', 'hhhh', '.hh.'], this.x - 8, H - 80, { h: '#5a3a1a' }, 4, { shadow: true });
        api.txtCFit('❤'.repeat(Math.max(0, this.lives)), 40, 8, 10, C.blood);
        api.txtCFit('CLOSING ' + Math.floor(this.z / this.need * 100) + '%', W / 2, 8, 9, C.rose);
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'dracula', title: 'Dracula', subtitle: 'NIGHTS OF BLOOD',
    currency: 'BLOOD', accent: C.gold,
    credit: 'A 16-BIT TRIBUTE · B. STOKER, 1897',
    bootCta: 'TAP TO ENTER', bootLine: 'A CHRONICLE IN BLOOD',
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.gold, blood: C.blood, cream: C.rose, dim: '#8a6a8a' },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'CHOOSE THE NEXT NIGHT', mapDone: 'THE COUNT IS DUST',
    screens: {
      overlay: 'rgba(10,3,6,.84)', win: C.bloodL, lose: '#7a1018', chapterLabel: '#8a6a8a',
      name: C.rose, sub: C.blood, intro: '#d8b0b0', quote: '#8a6a8a', help: C.bloodL,
      score: C.rose, cur: C.bloodL, cta: C.rose,
    },
    labels: {
      chapter: 'NIGHT', phase: 'PART', boss: 'THE RECKONING', score: 'BLOOD SPILLED',
      win: 'THE NIGHT IS HELD', lose: 'DAWN FINDS YOU FALLEN', nextPhaseWin: 'GROUND GAINED',
      cont: 'TAP TO PRESS ON', toMap: 'TAP FOR THE MAP', play: 'TAP TO BEGIN',
      nextPhase: 'TAP TO PRESS ON', toFinale: 'TAP FOR THE RECKONING',
    },
    upgrades: {
      blade: { name: 'THE KUKRI BLADE', desc: 'strikes bite deeper' },
      garlic: { name: 'GARLIC WREATH', desc: 'one more life' },
      holywater: { name: 'SACRED WAFER', desc: 'a wider strike window' },
    },
    nodes: [
      {
        id: 'castle', name: 'THE CASTLE', sub: 'TRANSYLVANIA', reward: 60, grant: 'blade',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 8, y - 6, 16, 12, '#4a3f5a'); g.rect(x - 2, y - 6, 1, 12, '#1b1726'); },
        intro: ['Harker is a prisoner in the', "Count's crumbling castle.", 'He must escape by nightfall.'],
        quote: 'Welcome to my house. Enter freely and of your own will.',
        choice: { prompt: 'How will you flee the castle?', options: [{ label: 'Scale the sheer outer wall', flag: 'wall' }, { label: 'Steal through the chapel crypt', flag: 'chapel' }] },
        winText: 'Harker is free — and the Count is bound for England.',
        phases: [climb(), countBoss(false)],
      },
      {
        id: 'demeter', name: 'THE DEMETER', sub: 'THE VOYAGE', needs: ['castle'], reward: 50, grant: 'holywater',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 9, y, 18, 6, '#5a3814'); g.rect(x - 1, y - 10, 2, 12, '#3a2008'); g.rect(x + 1, y - 8, 8, 5, '#dcd8c0'); },
        intro: ['A derelict ship drives for', 'Whitby — her crew vanishing', 'one by one, night by night.'],
        quote: 'God seems to have deserted us. We are being drawn on to our doom.',
        winText: 'The Demeter runs aground at Whitby. Something leaps ashore.',
        phases: [storm(), hold()],
      },
      {
        id: 'renfield', name: 'RENFIELD', sub: 'THE ASYLUM', needs: ['castle'], optional: true, reward: 40, grant: 'garlic',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 6, y - 6, 12, 12, '#2a3a2a'); g.rect(x - 2, y - 2, 4, 4, '#7adaee'); },
        intro: ['In Seward\'s asylum, Renfield', 'devours flies and spiders —', 'awaiting his dark master.'],
        quote: 'The blood is the life! The blood is the life!',
        winText: 'Renfield is sated — and lets slip the master\'s plans.',
        phases: [flies()],
      },
      {
        id: 'whitby', name: 'WHITBY', sub: "LUCY'S FATE", needs: ['demeter'], reward: 70,
        icon(api, x, y) { const g = api.gfx; g.rect(x - 6, y - 6, 12, 12, '#2a1f30'); api.txtC('✝', x, y - 5, 8, C.rose); },
        intro: ['Lucy wastes away by night.', 'Now a pale shape stalks the', 'moor — the Bloofer Lady.'],
        quote: 'The sweetness was turned to adamantine, heartless cruelty.',
        winText: 'Lucy is freed. The hunters turn to the Count himself.',
        phases: [moor(), stake()],
      },
      {
        id: 'reckoning', name: 'THE RECKONING', sub: 'RACE THE SUN', needs: ['whitby'], reward: 100,
        icon(api, x, y) { api.txtC('☀', x, y - 6, 10, '#e8a030'); },
        intro: ['The Count flees home in his', 'box of earth. If the sun sets', 'before you strike — he wakes.'],
        quote: 'If we are not in time, he will wake — and never sleep again.',
        winText: 'The blade falls as the sun crests the peaks. The Count is dust.',
        phases: [chase(), countBoss(true)],
      },
    ],
    endings: [
      { when: (f) => f.wall, title: 'DOWN THE WALL', lines: ['You fled like the Count himself,', 'crawling down the black stones —', 'and hunted him to dust at dawn.', '', 'The night is held.'] },
      { when: (f) => f.chapel, title: 'THROUGH THE CRYPT', lines: ['You stole out through the chapel', 'where his coffins lay in earth —', 'and repaid him there at the last.', '', 'The night is held.'] },
      { when: () => true, title: 'DAWN OVER THE PEAKS', lines: ['The Count is dust upon the wind.', 'Harker goes home.'] },
    ],
    finale: ['THE COUNT IS DUST.'],
  });
})();
