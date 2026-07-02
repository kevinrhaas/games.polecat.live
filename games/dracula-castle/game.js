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

  /* ─── bat emblem ─── */
  function emblem(api, cx, cy) {
    api.g2.glow(cx, cy, 34, '#5a1020', 0.7);
    api.gfx.sprite([
      'r..........r',
      'rr...rr...rr',
      'rrr.rrrr.rrr',
      '.rrrrrrrrrr.',
      '..rr.rr.rr..',
      '...r....r...',
    ], cx - 36, cy - 18, { r: C.blood }, 6);
  }

  /* ─── gothic night scenery (parallax castle + blood moon + bats) ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, '#0a0612'], [0.5, '#180a18'], [1, '#050308']]);
    // stars
    for (let i = 0; i < 40; i++) { const x = (i * 53 + 11) % W, y = (i * 97 + 7) % Math.floor(H * 0.5); c.globalAlpha = 0.25 + 0.3 * Math.sin(t * 2 + i); g.rect(x, y, 1, 1, C.bone); }
    c.globalAlpha = 1;
    // blood moon (not on hub)
    if (scene !== 'hub') { g2.glow(W - 54, 62, 40, '#7a1420', 0.6); g.circle(W - 54, 62, 22, '#b03038'); g.circle(W - 47, 56, 19, '#180a14'); }
    // parallax ridgeline + castle towers
    const baseY = H - 92;
    c.fillStyle = '#0a0610';
    c.beginPath(); c.moveTo(0, baseY);
    for (let x = 0; x <= W; x += 16) c.lineTo(x, baseY - 8 - ((x * 7) % 16));
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    const towers = [[36, 46], [92, 68], [150, 54], [204, 74]];
    for (const tw of towers) { g.rect(tw[0], baseY - tw[1], 20, tw[1], '#0a0610'); for (let bx = 0; bx < 20; bx += 8) g.rect(tw[0] + bx, baseY - tw[1] - 5, 5, 5, '#0a0610'); g.rect(tw[0] + 7, baseY - tw[1] + 12, 6, 9, '#e3a030'); }
    // drifting bats
    for (let i = 0; i < 5; i++) { const bx = (t * 26 + i * 64) % (W + 40) - 20, by = 108 + Math.sin(t * 2 + i) * 16 + i * 10; const flap = Math.sin(t * 12 + i) > 0; g.sprite(flap ? ['k.kk.k', '.kkkk.'] : ['.k..k.', 'kkkkkk'], bx, by, { k: '#120814' }, 2); }
    if (scene === 'intro' || scene === 'result' || scene === 'finale') { c.fillStyle = 'rgba(6,3,9,.6)'; c.fillRect(0, 0, W, H); }
    else if (scene === 'hub') { c.fillStyle = 'rgba(6,3,9,.35)'; c.fillRect(0, 0, W, H); g2.dither(H - 120, H, '#1b0a18', '#0a0612', 3); }
  }

  /* ─── HUB: a gothic route-map from Transylvania to England ─── */
  const NODES_XY = { castle: [46, 96], demeter: [156, 150], renfield: [28, 226], whitby: [158, 288], reckoning: [86, 372] };
  const ORDER = ['castle', 'demeter', 'whitby', 'reckoning']; // main blood-trail order
  const menu = {
    title(api, save) {
      const c = api.ctx;
      // blood trail between the main stops
      c.setLineDash([3, 5]); c.strokeStyle = C.blood; c.lineWidth = 2; c.globalAlpha = 0.8;
      c.beginPath();
      ORDER.forEach((id, i) => { const p = NODES_XY[id]; const x = p[0] + 46, y = p[1] + 33; if (i === 0) c.moveTo(x, y); else c.lineTo(x, y); });
      c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
      api.txtCFit("THE COUNT'S CHRONICLE", api.W / 2, 20, 12, C.bloodL, true);
      api.txtCFit('BLOOD  ' + (save.cur || 0), api.W / 2, 42, 9, C.rose);
    },
    layout() { return ['castle', 'demeter', 'renfield', 'whitby', 'reckoning'].map((id) => ({ x: NODES_XY[id][0], y: NODES_XY[id][1], w: 92, h: 66 })); },
    node(api, info) {
      const g = api.gfx, c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, locked } = info;
      // stone plaque headstone
      c.fillStyle = locked ? '#150f1c' : (sel ? '#33223f' : '#201828');
      c.beginPath(); c.moveTo(x, y + 20); c.quadraticCurveTo(x, y, x + w / 2, y); c.quadraticCurveTo(x + w, y, x + w, y + 20); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); c.fill();
      c.strokeStyle = done ? C.gold : (sel ? C.bloodL : C.stone); c.lineWidth = sel ? 2 : 1; c.stroke();
      if (sel && !locked) g2.glow(x + w / 2, y + h / 2, 40, '#5a1020', 0.4);
      if (node.icon && !locked) node.icon(api, x + w / 2, y + 20);
      api.txtCFit((locked ? '🔒 ' : '') + node.name, x + w / 2, y + 30, 8, locked ? C.stone : (done ? C.gold : C.rose), false, w - 10);
      api.txtCFit(locked ? '' : (node.optional ? '◆ ' + node.sub : node.sub), x + w / 2, y + 46, 6, C.mist === node ? C.rose : '#8a6a8a', false, w - 10);
      if (done) api.txtC('✝', x + w / 2, y + h - 15, 10, C.gold);
    },
  };

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
    emblem, scenery, menu, map: menu,
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
