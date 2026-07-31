/* ============================================================================
 * THE JUNGLE BOOK — MOWGLI   (Gen 2 / 16-bit)
 * A richer take on Kipling's stories, built on RetroSaga2:
 *   HUB is a canopy-to-floor CROSS-SECTION of the jungle — Council Rock near
 *   the top, the Bandar-log's treetops, Kaa's coiled branch, the Red Flower at
 *   the man-village's edge, and Shere Khan's dry gorge at the very bottom —
 *   each a run of escalating phases; a Council Rock choice sets the ending.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    leaf: '#1f6b3f', leafLight: '#4ad17a', leafDark: '#0d2e1a',
    canopyTop: '#123a22', canopyMid: '#0c2818', canopyDeep: '#061a0f',
    gold: '#ffcf4d', goldDark: '#c8961e', sun: '#fff2b0',
    bark: '#6b4423', barkDark: '#3a2513',
    vine: '#5a8f3a', vineDark: '#2e4a1f',
    fire: '#ff6a2d', fireDark: '#a83010', fireGlow: '#ffb347',
    tiger: '#ff8a2d', tigerDark: '#1a1108', tigerStripe: '#0d0805',
    night: '#0a1a12', moon: '#d8e8d0',
    danger: '#e0303a', ink: '#07160d', cream: '#eaf5e0', dim: '#5a7a62',
  };
  // bold pixel banner face for the title, clean and legible — the jungle's
  // own myth deserves a hero title, not a horror-blackletter face.
  const TITLE = "'Jersey 10','Press Start 2P',monospace";

  /* ─── emblem: a leaf-ring around the jungle's watching amber eye ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(cx, cy, 30, C.gold, 0.35);
    c.fillStyle = C.canopyDeep; c.beginPath(); c.arc(cx, cy, 20, 0, 7); c.fill();
    c.strokeStyle = C.leaf; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, 23, 0, 7); c.stroke();
    c.fillStyle = C.leafLight;
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; const x = cx + Math.cos(a) * 23, y = cy + Math.sin(a) * 23; c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(0, 0, 3, 5, 0, 0, 7); c.fill(); c.restore(); }
    c.fillStyle = C.gold; c.beginPath(); c.ellipse(cx, cy, 9, 5, 0, 0, 7); c.fill();
    c.fillStyle = C.ink; c.beginPath(); c.arc(cx, cy, 2.4, 0, 7); c.fill();
  }

  /* ─── canopy backdrop: light shafts, drifting leaves, fireflies ─── */
  function canopyBackdrop(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, C.canopyTop], [0.55, C.canopyMid], [1, C.canopyDeep]], H);
    for (let i = 0; i < 3; i++) { const x = W * (0.18 + i * 0.34) + Math.sin(t * 0.25 + i) * 10; c.save(); c.globalAlpha = 0.10; c.fillStyle = C.sun; c.beginPath(); c.moveTo(x - 16, 0); c.lineTo(x + 16, 0); c.lineTo(x + 52, H * 0.7); c.lineTo(x - 52, H * 0.7); c.closePath(); c.fill(); c.restore(); }
    g2.parallax(t * 10, [
      { speed: 0.3, draw: (ox) => { c.save(); c.globalAlpha = 0.5; c.fillStyle = C.leafDark; g2.tiled(ox, 140, (x) => { c.beginPath(); c.ellipse(x + 40, 26, 50, 20, 0, 0, 7); c.fill(); }); c.restore(); } },
    ]);
    for (let i = 0; i < 10; i++) { const seed = i * 97; const x = (seed % (W - 20)) + 10 + Math.sin(t * 0.7 + i) * 8; const y = (H * 0.3) + ((seed * 7) % (H * 0.5)); c.globalAlpha = 0.4 + 0.3 * Math.sin(t * 3 + i); c.fillStyle = C.gold; c.beginPath(); c.arc(x, y, 1.4, 0, 7); c.fill(); c.globalAlpha = 1; }
    if (dim) { c.fillStyle = 'rgba(7,22,13,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }

  /* ─── hub backdrop: the canopy-to-floor cross section + a vine trail ─── */
  function crossSection(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.verticalGradient(0, 0, W, H, [[0, C.canopyTop], [0.45, C.canopyMid], [0.75, C.barkDark], [1, '#1a0f08']]);
    c.save(); c.globalAlpha = 0.5; c.fillStyle = C.barkDark; c.fillRect(6, 0, 14, H); c.fillRect(W - 20, 0, 14, H); c.restore();
    g2.embers(t, 10, { yBottom: H * 0.6, yTop: 0, color: C.gold, speed: 0.05, size: 1, alpha: 0.3 });
    vineTrail(api, ORDER, NODES_XY);
  }
  function vineTrail(api, order, xy) {
    const c = api.ctx;
    c.save(); c.strokeStyle = C.vineDark; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); order.forEach((id, i) => { const p = xy[id]; i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.stroke();
    c.strokeStyle = C.vine; c.lineWidth = 2; c.globalAlpha = 0.8;
    c.beginPath(); order.forEach((id, i) => { const p = xy[id]; i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.stroke();
    c.restore();
  }

  function scenery(api, scene, t) {
    if (scene === 'hub') { crossSection(api, t); return; }
    canopyBackdrop(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale') ? 0.30 : 0);
  }

  /* ─── tiny vignettes painted inside each hub node's leaf medallion ─── */
  const ART = {
    council(api, cx, cy, rad, t) {
      const c = api.ctx;
      c.fillStyle = C.night; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      c.fillStyle = C.moon; c.beginPath(); c.arc(cx + rad * 0.3, cy - rad * 0.35, rad * 0.22, 0, 7); c.fill();
      c.fillStyle = C.barkDark; c.beginPath(); c.ellipse(cx, cy + rad * 0.35, rad * 0.7, rad * 0.32, 0, 0, 7); c.fill();
    },
    bandarlog(api, cx, cy, rad, t) {
      const c = api.ctx;
      c.fillStyle = C.canopyDeep; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      c.fillStyle = C.barkDark;
      for (let i = -1; i <= 1; i += 2) c.fillRect(cx + i * rad * 0.5 - 2, cy - rad, 4, rad * 2);
      const bob = Math.sin(t * 4) * 3;
      c.fillStyle = '#3a2a1a'; c.beginPath(); c.arc(cx, cy + bob, rad * 0.24, 0, 7); c.fill();
    },
    kaa(api, cx, cy, rad, t) {
      const c = api.ctx;
      c.fillStyle = '#0e2a16'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      c.strokeStyle = C.leafLight; c.lineWidth = 3;
      c.beginPath();
      for (let a = 0; a < 4.5; a += 0.2) { const r = (2 + a * 3.2) * 0.5; const x = cx + Math.cos(a * 2 + t) * r, y = cy + Math.sin(a * 2 + t) * r; a ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
      c.fillStyle = C.gold; c.beginPath(); c.arc(cx + 4, cy - 2, 1.6, 0, 7); c.fill();
    },
    redflower(api, cx, cy, rad, t) {
      const c = api.ctx, g2 = api.g2;
      c.fillStyle = '#1a1008'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      g2.flame(cx, cy + rad * 0.4, t, 0.8, { outer: C.fire, inner: C.fireGlow, glow: 'rgba(255,120,40,.7)' });
    },
    sherekhan(api, cx, cy, rad, t) {
      const c = api.ctx;
      c.fillStyle = C.tigerDark; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      c.fillStyle = C.tiger;
      for (let i = 0; i < 3; i++) { c.save(); c.translate(cx - rad * 0.4 + i * rad * 0.4, cy); c.rotate(0.3); c.beginPath(); c.ellipse(0, 0, rad * 0.14, rad * 0.5, 0, 0, 7); c.fill(); c.restore(); }
      const blink = Math.floor(t * 1.5) % 3 === 0;
      c.fillStyle = blink ? C.gold : '#8a5010'; c.beginPath(); c.arc(cx - 4, cy - 2, 1.8, 0, 7); c.fill(); c.beginPath(); c.arc(cx + 4, cy - 2, 1.8, 0, 7); c.fill();
    },
  };

  /* ─── HUB: the cross-section's five stops, top (canopy) to bottom (gorge) ─── */
  const NODES_XY = { council: [135, 68], bandarlog: [90, 150], kaa: [180, 232], redflower: [100, 320], sherekhan: [170, 410] };
  const ORDER = ['council', 'bandarlog', 'kaa', 'redflower', 'sherekhan'];
  const menu = {
    title(api, save, t) {
      const g2 = api.g2, W = api.W;
      g2.ornateFrame(16, 8, W - 32, 34, 8, 'rgba(8,20,12,.88)', C.leaf);
      const ti = 'THE JUNGLE BOOK';
      g2.gleamText(ti, W / 2, 14, api.fitSize(ti, 11, W - 52, 'title'), C.gold, t, { shadow: 'rgba(0,0,0,.6)', gleamSpeed: 55, font: TITLE });
      api.txtCFit('TRUST  ' + (save.cur || 0), W / 2, 30, 8, C.leafLight);
    },
    layout() {
      return ORDER.map((id) => { const p = NODES_XY[id], s = 40; return { x: p[0] - s, y: p[1] - s, w: s * 2, h: s * 2 }; });
    },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, locked, t } = info;
      const cx = x + w / 2, cy = y + h / 2, rad = w / 2;
      if (sel && !locked) g2.glow(cx, cy, rad * 1.5, C.gold, 0.28 + 0.12 * Math.sin(t * 4));
      c.save(); c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.clip();
      if (!locked && ART[node.id]) ART[node.id](api, cx, cy, rad, t); else { c.fillStyle = '#0a140c'; c.fillRect(x, y, w, h); }
      c.restore();
      c.strokeStyle = C.barkDark; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy, rad + 2, 0, 7); c.stroke();
      c.strokeStyle = locked ? '#3a3a3a' : (done ? C.gold : C.leafLight); c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.stroke();
      if (locked) { c.fillStyle = 'rgba(6,10,8,.6)'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill(); api.txtC('🔒', cx, cy - 6, 12, '#8a8a8a'); }
      if (done) api.txtC('✓', cx + rad - 4, cy - rad + 2, 9, C.gold);
      g2.roundRect(cx - w * 0.5, y + h + 2, w, 15, 4, '#0a1208', locked ? '#3a3a3a' : C.barkDark, 1);
      api.txtCFit(node.name, cx, y + h + 5, 7, locked ? '#7a7a7a' : (done ? C.gold : C.cream), false, w + 6);
    },
  };

  /* ─── animated title screen: a cold-open into the canopy ─── */
  function renderBoot(api, info) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    canopyBackdrop(api, t, 0);
    emblem(api, W / 2, H * 0.24);
    const title = 'THE JUNGLE BOOK';
    const ts = api.fitSize(title, 20, W - 20, 'title');
    g2.gleamText(title, W / 2, H * 0.38, ts, C.gold, t, { shadow: 'rgba(0,0,0,.5)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('MOWGLI', W / 2, H * 0.38 + ts + 12, 12, C.leafLight, true);
    if (info.blink) api.txtCFit('▸ TAP TO ENTER THE JUNGLE ◂', W / 2, H * 0.66, 11, C.cream);
    api.txtCFit('A 16-BIT TRIBUTE · RUDYARD KIPLING, 1894', W / 2, H - 28, 8, C.dim);
    api.vignette(); api.scanlines();
  }

  /* ============================ mini-game phases ============================ */

  /* --- COUNCIL ROCK: THE COUNCIL SPEAKS (spot-the-swayed / social defend) --- */
  function holdCouncil() {
    return {
      name: 'THE COUNCIL SPEAKS', boss: false,
      help: 'TAP the wolf whose eyes flash red before it turns against you',
      winText: "Akela's howl steadies the Pack — the man-cub is one of the Free People.",
      loseText: 'Too many eyes turn red. The Council falls silent, and Shere Khan smiles from the shadows.',
      init(api) {
        this.need = 10; this.calmed = 0; this.turned = 0; this.maxTurned = 4;
        this.n = 6; this.slots = [];
        const cx = api.W / 2, cy = api.H * 0.5, r = 78;
        for (let i = 0; i < this.n; i++) { const a = -Math.PI / 2 + i * (Math.PI * 2 / this.n); this.slots.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.62, lit: false, t: 0 }); }
        this.spawnT = 1.0;
      },
      update(api, dt) {
        this.spawnT -= dt;
        if (this.spawnT <= 0 && !this.slots.some((s) => s.lit)) {
          const s = api.choice(this.slots); s.lit = true; s.t = Math.max(0.8, 1.5 - this.calmed * 0.04);
          this.spawnT = api.rnd(0.55, 0.95);
        }
        for (const s of this.slots) if (s.lit) {
          s.t -= dt;
          if (s.t <= 0) { s.lit = false; this.turned++; api.shake(4, 0.2); api.flash('#8a1020', 0.15); api.audio.sfx('hurt'); if (this.turned >= this.maxTurned) { api.lose(); return; } }
        }
        if (api.pointer.justDown) {
          for (const s of this.slots) if (s.lit && Math.hypot(api.pointer.x - s.x, api.pointer.y - s.y) < 26) {
            s.lit = false; this.calmed++; api.addScore(16); api.audio.sfx('coin'); api.burst(s.x, s.y, C.gold, 8);
            if (this.calmed >= this.need) { api.addScore(50); api.win(); return; }
            break;
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        canopyBackdrop(api, t, 0.15);
        for (const s of this.slots) {
          g2.glow(s.x, s.y, s.lit ? 18 : 10, s.lit ? C.danger : C.leafLight, s.lit ? 0.5 : 0.2);
          c.fillStyle = s.lit ? '#3a0a10' : '#12240a';
          c.beginPath(); c.arc(s.x, s.y, 13, 0, 7); c.fill();
          c.strokeStyle = s.lit ? C.danger : C.leaf; c.lineWidth = 2; c.beginPath(); c.arc(s.x, s.y, 13, 0, 7); c.stroke();
          c.fillStyle = s.lit ? '#ff5060' : C.gold; c.beginPath(); c.arc(s.x - 3, s.y - 2, 1.6, 0, 7); c.fill(); c.beginPath(); c.arc(s.x + 3, s.y - 2, 1.6, 0, 7); c.fill();
        }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,10,.7)', C.barkDark, 1);
        api.txt('CALMED ' + this.calmed + '/' + this.need, 10, 8, 8, C.leafLight);
        api.txtCFit('TURNED ' + this.turned + '/' + this.maxTurned, W - 56, 8, 8, C.danger, false, 96);
        api.vignette();
      },
    };
  }

  /* --- BANDAR-LOG: THROUGH THE TREETOPS (timed vine-grab traversal) --- */
  function canopyChase() {
    return {
      name: 'THROUGH THE TREETOPS', boss: false,
      help: 'TAP the vine while it glows — grab it before it swings away',
      winText: 'Branch to branch, hand to hand — Mowgli outpaces the Bandar-log.',
      loseText: 'A grip slips. The monkeys close in, chattering in triumph.',
      init(api) { this.need = 10; this.got = 0; this.lives = api.has('packbond') ? 4 : 3; this.vine = null; this.spawnT = 0.7; },
      update(api, dt) {
        const W = api.W;
        if (this.vine) {
          this.vine.life -= dt;
          if (this.vine.life <= 0) { this.vine = null; this.lives--; api.shake(5, 0.25); api.audio.sfx('hurt'); if (this.lives <= 0) { api.lose(); return; } this.spawnT = api.rnd(0.4, 0.7); }
        } else {
          this.spawnT -= dt;
          if (this.spawnT <= 0) this.vine = { x: api.rnd(40, W - 40), life: Math.max(0.55, 1.05 - this.got * 0.03) };
        }
        if (api.pointer.justDown && this.vine && Math.abs(api.pointer.x - this.vine.x) < 34) {
          this.got++; api.addScore(18); api.audio.sfx('blip'); api.burst(this.vine.x, api.H * 0.42, C.leafLight, 8);
          this.vine = null; this.spawnT = api.rnd(0.35, 0.6);
          if (this.got >= this.need) { api.addScore(55); api.win(); return; }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        canopyBackdrop(api, t, 0);
        for (let i = 0; i < 3; i++) { const mx = (W * 0.2 + i * W * 0.3 + Math.sin(t * 1.4 + i) * 10); c.fillStyle = C.barkDark; c.beginPath(); c.arc(mx, H * 0.18 + Math.sin(t * 3 + i) * 4, 6, 0, 7); c.fill(); }
        if (this.vine) {
          g2.glow(this.vine.x, H * 0.42, 16, C.leafLight, 0.5);
          c.strokeStyle = C.vine; c.lineWidth = 4; c.beginPath(); c.moveTo(this.vine.x, 0); c.lineTo(this.vine.x, H * 0.42); c.stroke();
          c.fillStyle = C.leafLight; c.beginPath(); c.arc(this.vine.x, H * 0.42, 6, 0, 7); c.fill();
        }
        c.fillStyle = '#c88450'; c.beginPath(); c.arc(W / 2, H * 0.62, 10, 0, 7); c.fill();
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,10,.7)', C.barkDark, 1);
        api.txt('CAUGHT ' + this.got + '/' + this.need, 10, 8, 8, C.leafLight);
        api.txtCFit('LIVES ' + '♥'.repeat(Math.max(0, this.lives)), W - 52, 8, 8, C.danger, false, 96);
        api.vignette();
      },
    };
  }

  /* --- KAA'S COILS: THE HUNGER DANCE (resist-the-pull inhibition) --- */
  function resistTheDance() {
    return {
      name: 'THE HUNGER DANCE', boss: false,
      help: "DON'T watch too long — TAP to look away when the coils begin to turn",
      winText: 'The dance ends. Kaa uncoils, unhurried, and Mowgli is still his own.',
      loseText: 'The swaying coils fill Mowgli\'s sight, and the world goes soft and far away.',
      init(api) {
        this.time = 20; this.meter = 0; this.state = 'safe'; this.stateT = 1.3;
        this.resistPower = api.has('agility') ? 0.34 : 0.24;
      },
      update(api, dt) {
        this.time -= dt; this.stateT -= dt;
        if (this.stateT <= 0) { this.state = this.state === 'safe' ? 'dance' : 'safe'; this.stateT = this.state === 'dance' ? api.rnd(1.4, 2.1) : api.rnd(0.9, 1.5); }
        if (this.state === 'dance') this.meter += 0.14 * dt;
        if (api.pointer.justDown && this.state === 'dance') { this.meter -= this.resistPower; api.audio.sfx('blip'); api.burst(api.W / 2, api.H * 0.42, C.leafLight, 6); }
        this.meter = clamp(this.meter, 0, 1);
        if (this.meter >= 1) { api.shake(6, 0.3); api.flash(C.leafLight, 0.25); api.audio.sfx('hurt'); api.lose(); return; }
        if (this.time <= 0) { api.addScore(60); api.win(); return; }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        canopyBackdrop(api, t, 0.2);
        const dancing = this.state === 'dance';
        g2.glow(W / 2, H * 0.42, dancing ? 50 : 26, dancing ? C.leafLight : '#264a2e', dancing ? 0.5 : 0.2);
        c.strokeStyle = dancing ? C.gold : C.leaf; c.lineWidth = 3;
        c.beginPath();
        for (let a = 0; a < 6.3; a += 0.15) { const r = (dancing ? 40 : 18) * (a / 6.3); const ang = a * 2 + t * (dancing ? 2.2 : 0.4); const x = W / 2 + Math.cos(ang) * r, y = H * 0.42 + Math.sin(ang) * r * 0.6; a ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.stroke();
        g2.roundRect(W / 2 - 42, H * 0.66, 84, 12, 4, 'rgba(6,16,10,.8)', C.barkDark, 1);
        c.fillStyle = this.meter > 0.7 ? C.danger : C.gold; c.fillRect(W / 2 - 40, H * 0.66 + 2, 80 * this.meter, 8);
        api.txtCFit('TRANCE', W / 2, H * 0.66 - 12, 8, C.cream);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,10,.7)', C.barkDark, 1);
        api.txtCFit(dancing ? 'RESIST!' : 'watch...', W / 2, 8, 8, dancing ? C.danger : C.dim);
        api.txtCFit(Math.ceil(this.time) + 's', W - 30, 8, 8, C.cream, false, 50);
        api.vignette();
      },
    };
  }

  /* --- RED FLOWER: THE THIEF'S CREEP (hold-to-creep, freeze when watched) --- */
  function stealFire() {
    return {
      name: "THE THIEF'S CREEP", boss: false,
      help: 'HOLD to creep toward the fire-pot — let go when the lanterns sweep',
      winText: 'The fire-pot is his. Even the boldest hunters give it a wide, wary path.',
      loseText: 'A dog barks. Torches swing round. Mowgli flees empty-handed.',
      init(api) {
        this.x = 24; this.goal = api.W - 34; this.time = 26; this.caught = 0;
        this.max = api.has('clearsight') ? 4 : 3; this.state = 'clear'; this.stateT = api.rnd(1.3, 1.9);
      },
      update(api, dt) {
        this.time -= dt; this.stateT -= dt;
        if (this.stateT <= 0) {
          if (this.state === 'clear') { this.state = 'warn'; this.stateT = 0.4; }
          else if (this.state === 'warn') { this.state = 'watch'; this.stateT = api.rnd(0.6, 0.9); }
          else { this.state = 'clear'; this.stateT = api.rnd(1.3, 1.9); }
        }
        const moving = api.pointer.down;
        if (moving) this.x += 70 * dt;
        this.x = clamp(this.x, 24, this.goal);
        if (this.state === 'watch' && moving) {
          this.caught++; api.shake(4, 0.2); api.flash('#ffd98a', 0.15); api.audio.sfx('hurt');
          this.state = 'clear'; this.stateT = api.rnd(1.3, 1.9);
          if (this.caught >= this.max) { api.lose(); return; }
        }
        if (this.x >= this.goal) { api.addScore(60); api.win(); return; }
        if (this.time <= 0) { api.lose(); return; }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, C.night], [1, '#1a0f08']], H);
        for (let i = 0; i < 4; i++) { const hx = 30 + i * (W - 60) / 3; c.fillStyle = C.barkDark; c.fillRect(hx - 14, H * 0.5, 28, 20); c.fillStyle = C.bark; c.beginPath(); c.moveTo(hx - 18, H * 0.5); c.lineTo(hx, H * 0.5 - 14); c.lineTo(hx + 18, H * 0.5); c.closePath(); c.fill(); }
        const watching = this.state === 'watch', warning = this.state === 'warn';
        if (watching) g2.glow(W * 0.5, H * 0.46, 60, '#ffd98a', 0.25);
        else if (warning) g2.glow(W * 0.5, H * 0.46, 34, '#ffd98a', 0.14);
        const py = H * 0.56;
        c.fillStyle = '#c88450'; c.beginPath(); c.arc(this.x, py, 8, 0, 7); c.fill();
        g2.flame(this.goal, py - 2, t, 0.9, { outer: C.fire, inner: C.fireGlow });
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,10,6,.7)', C.barkDark, 1);
        api.txtCFit(watching ? 'THEY ARE WATCHING' : (warning ? 'a lantern turns...' : 'creep...'), W / 2, 8, 8, watching ? C.danger : (warning ? C.gold : C.dim));
        api.txt('SPOTTED ' + this.caught + '/' + this.max, 10, H - 18, 8, C.danger);
        api.txtCFit(Math.ceil(this.time) + 's', W - 30, H - 18, 8, C.cream, false, 50);
        api.vignette();
      },
    };
  }

  /* --- SHERE KHAN p1: THE BUFFALO RUN (watch & pick a flank) --- */
  function approachGorge() {
    return {
      name: 'THE BUFFALO RUN', boss: false,
      help: 'WATCH where Shere Khan slips into the dust, then TAP that side of the gorge',
      winText: "Rama's herd thunders down both flanks — there is no way out of the gorge now.",
      loseText: 'The herd bunches the wrong way. Shere Khan slips the trap.',
      init(api) { this.need = 6; this.correct = 0; this.miss = 0; this.maxMiss = 3; this.nextRound(api); },
      nextRound(api) { this.side = api.chance(0.5) ? 'L' : 'R'; this.sub = 'show'; this.showT = 0.6; this.guessT = 1.15; },
      update(api, dt) {
        if (this.sub === 'show') { this.showT -= dt; if (this.showT <= 0) this.sub = 'guess'; return; }
        this.guessT -= dt;
        if (api.pointer.justDown) {
          const pick = api.pointer.x < api.W / 2 ? 'L' : 'R';
          if (pick === this.side) {
            this.correct++; api.addScore(20); api.audio.sfx('coin'); api.burst(pick === 'L' ? 60 : api.W - 60, api.H * 0.5, C.gold, 8);
            if (this.correct >= this.need) { api.addScore(50); api.win(); return; }
          } else {
            this.miss++; api.shake(5, 0.25); api.flash(C.danger, 0.18); api.audio.sfx('hurt');
            if (this.miss >= this.maxMiss) { api.lose(); return; }
          }
          this.nextRound(api); return;
        }
        if (this.guessT <= 0) {
          this.miss++; api.shake(4, 0.2); api.audio.sfx('hurt');
          if (this.miss >= this.maxMiss) { api.lose(); return; }
          this.nextRound(api);
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#2a1a0e'], [1, '#100a06']]);
        g2.dither(H * 0.55, H, '#3a2412', '#1a0f08', 3);
        for (let i = 0; i < 3; i++) { const bx = W * (0.25 + i * 0.25); c.fillStyle = '#3a2818'; c.beginPath(); c.ellipse(bx, H * 0.2 + ((t * 80 + i * 40) % (H * 0.3)), 12, 8, 0, 0, 7); c.fill(); }
        c.strokeStyle = 'rgba(255,255,255,.15)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(W / 2, H * 0.3); c.lineTo(W / 2, H * 0.85); c.stroke(); c.setLineDash([]);
        if (this.sub === 'show') {
          const tx = this.side === 'L' ? W * 0.28 : W * 0.72;
          c.fillStyle = C.tigerDark; c.beginPath(); c.ellipse(tx, H * 0.58, 14, 8, 0, 0, 7); c.fill();
          c.fillStyle = C.tiger; c.fillRect(tx - 10, H * 0.58 - 4, 20, 8);
        } else {
          api.txtCFit('WHERE DID HE GO?', W / 2, H * 0.4, 10, C.cream);
        }
        api.txtCFit('◄ L', W * 0.22, H * 0.8, 12, C.gold);
        api.txtCFit('R ►', W * 0.78, H * 0.8, 12, C.gold);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(10,6,4,.7)', C.barkDark, 1);
        api.txt('DRIVEN ' + this.correct + '/' + this.need, 10, 8, 8, C.gold);
        api.txtCFit('MISS ' + this.miss + '/' + this.maxMiss, W - 56, 8, 8, C.danger, false, 96);
        api.vignette();
      },
    };
  }
  /* --- SHERE KHAN p2 (boss): TIGER! TIGER! (reaction duel) --- */
  function duelInGorge() {
    return {
      name: 'TIGER! TIGER!', boss: true,
      help: 'TAP when Shere Khan lunges from the dust — the firebrand buys a heartbeat',
      winText: 'The lame tiger who preached that a man-cub was easy meat lies still under the sky he hunted.',
      loseText: 'A claw finds Mowgli first. The gorge falls quiet.',
      init(api) {
        this.need = 4; this.hits = 0; this.lives = 3; this.lungeOn = false; this.waitT = api.rnd(1.0, 1.6);
        this.reactWin = api.has('firebrand') ? 0.62 : 0.42; this.reactT = 0;
      },
      update(api, dt) {
        if (!this.lungeOn) {
          this.waitT -= dt;
          if (this.waitT <= 0) { this.lungeOn = true; this.reactT = this.reactWin; }
        } else {
          this.reactT -= dt;
          if (api.pointer.justDown) {
            this.lungeOn = false; this.hits++; api.addScore(30); api.audio.sfx('shoot'); api.burst(api.W / 2, api.H * 0.55, C.fire, 12);
            if (this.hits >= this.need) { api.addScore(70); api.win(); return; }
            this.waitT = api.rnd(1.0, 1.6);
          } else if (this.reactT <= 0) {
            this.lungeOn = false; this.lives--; api.shake(7, 0.3); api.flash(C.danger, 0.2); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
            this.waitT = api.rnd(1.0, 1.6);
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#1a0f08'], [1, '#060402']]);
        g2.embers(t, 10, { yBottom: H, yTop: 0, color: C.fireGlow, speed: 0.08, size: 2, alpha: 0.5 });
        g2.flame(W * 0.22, H * 0.7, t, 1, { outer: C.fire, inner: C.fireGlow });
        const lunging = this.lungeOn;
        g2.glow(W / 2, H * 0.45, lunging ? 46 : 24, lunging ? C.tiger : C.tigerDark, lunging ? 0.6 : 0.25);
        c.fillStyle = lunging ? C.tiger : '#3a2010';
        c.beginPath(); c.ellipse(W / 2, H * 0.45, lunging ? 30 : 20, lunging ? 16 : 10, 0, 0, 7); c.fill();
        c.fillStyle = C.tigerStripe;
        for (let i = -1; i <= 1; i++) c.fillRect(W / 2 + i * 10 - 2, H * 0.45 - 14, 3, 20);
        if (lunging) api.txtCFit('▸ STRIKE! ◂', W / 2, H * 0.45 - 40, 10, C.gold);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(10,6,4,.7)', C.barkDark, 1);
        api.txt('HITS ' + this.hits + '/' + this.need, 10, 8, 8, C.gold);
        api.txtCFit('♥'.repeat(Math.max(0, this.lives)), W - 40, 8, 8, C.danger, false, 70);
        api.vignette();
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'junglebook16', title: 'The Jungle Book', subtitle: 'MOWGLI',
    currency: 'TRUST', accent: C.gold, ownPhaseHud: true,
    titleFont: TITLE, uiFont: "'Pixelify Sans','Press Start 2P',monospace",
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.gold, blood: C.danger, cream: C.cream, dim: C.dim, ink: C.ink },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'CHOOSE YOUR PATH THROUGH THE JUNGLE', mapDone: 'THE LAW IS KEPT',
    screens: {
      overlay: 'rgba(7,22,13,.86)', win: C.gold, lose: '#ff8a70', chapterLabel: C.dim,
      name: C.cream, sub: C.leafLight, intro: '#d8e8d0', quote: '#4a6a52', help: C.leafLight,
      score: C.cream, cur: C.gold, cta: C.cream,
    },
    labels: {
      chapter: 'TALE', phase: 'TRIAL', boss: 'THE RECKONING', score: 'DEEDS',
      win: 'THE JUNGLE REMEMBERS', lose: 'THE JUNGLE CLAIMS ITS DUE', nextPhaseWin: 'GROUND HELD',
      cont: 'TAP TO PRESS ON', toMap: 'TAP FOR THE TRAIL', play: 'TAP TO BEGIN',
      nextPhase: 'TAP TO PRESS ON', toFinale: 'TAP FOR THE COUNCIL',
    },
    upgrades: {
      packbond: { name: "THE PACK'S TRUST", desc: 'the wolves stand ready — an extra life aloft' },
      agility: { name: 'JUNGLE AGILITY', desc: 'a surer grip resisting the dance' },
      clearsight: { name: 'CLEAR SIGHT', desc: "the lanterns' sweep is easier to read" },
      firebrand: { name: 'THE FIREBRAND', desc: 'Shere Khan hesitates a heartbeat longer' },
    },
    nodes: [
      {
        id: 'council', name: 'COUNCIL ROCK', sub: 'THE FREE PEOPLE', reward: 60, grant: 'packbond',
        intro: ['A wolf cub curls among the pack', 'until Shere Khan comes hunting —', 'Akela calls the Council to decide.'],
        quote: 'The strength of the Pack is the Wolf, and the strength of the Wolf is the Pack.',
        winText: "Akela's howl steadies the Pack — the man-cub is one of the Free People.",
        choice: {
          prompt: 'Akela puts it to you: does the jungle claim you, or does the man-village call?',
          hint: 'YOUR ANSWER SHAPES HOW THE TALE ENDS',
          options: [
            { label: 'Run with the Pack', sub: 'The jungle is yours to master', flag: 'wolf',
              icon(api, x, y) { api.txtC('🐺', x, y - 6, 12, C.leafLight); } },
            { label: 'Remember the fire', sub: 'Some part of you still dreams of men', flag: 'man',
              icon(api, x, y) { api.g2.flame(x, y + 4, api.t, 0.5, { outer: C.fire, inner: C.fireGlow }); } },
          ],
        },
        phases: [holdCouncil()],
      },
      {
        id: 'bandarlog', name: 'THE BANDAR-LOG', sub: 'THE MONKEY PEOPLE', needs: ['council'], reward: 55, grant: 'agility',
        intro: ['The Monkey-People snatch Mowgli', 'up into the treetops — a game to', 'them, with no Law to bind it.'],
        quote: 'They have no Law... they boast and chatter and pretend that they are a great people.',
        winText: 'Branch to branch, hand to hand — Mowgli outpaces the Bandar-log.',
        phases: [canopyChase()],
      },
      {
        id: 'kaa', name: "KAA'S COILS", sub: 'THE ROCK PYTHON', needs: ['bandarlog'], reward: 65, grant: 'clearsight',
        intro: ['Kaa the python offers Baloo and', 'Bagheera safe passage — for a', 'dance the Bandar-log cannot refuse.'],
        quote: 'Now, Bandar-log, come one step nearer.',
        help: "DON'T watch too long — look away when the coils begin to turn",
        winText: 'The dance ends. Kaa uncoils, unhurried, and Mowgli is still his own.',
        phases: [resistTheDance()],
      },
      {
        id: 'redflower', name: 'THE RED FLOWER', sub: 'FIRE OF THE MAN-VILLAGE', needs: ['kaa'], reward: 60, grant: 'firebrand',
        intro: ['No jungle creature will carry fire.', 'Mowgli creeps to the herdsman\'s hut', 'for the one thing Shere Khan fears.'],
        quote: 'I carry the Red Flower... none in the jungle may face me.',
        winText: 'The fire-pot is his. Even the boldest hunters give it a wide, wary path.',
        phases: [stealFire()],
      },
      {
        id: 'sherekhan', name: 'SHERE KHAN', sub: 'THE LAME TIGER', needs: ['redflower'], reward: 130,
        intro: ['The buffalo herd waits at the', "ravine's head. Below, in the dry", 'gorge, Shere Khan sleeps off a kill.'],
        quote: 'Now, Rama, if thou canst turn one, we shall do all that is to be done.',
        winText: 'The lame tiger who preached that a man-cub was easy meat lies still under the sky he hunted.',
        phases: [approachGorge(), duelInGorge()],
      },
    ],
    endings: [
      { when: (f) => f.wolf, title: 'LORD OF THE JUNGLE', lines: ['Mowgli runs with the Pack for', 'years after, master of every law', 'the jungle keeps.', '', 'The Council Rock remembers.'] },
      { when: (f) => f.man, title: 'THE MAN-CUB GOES TO MEN', lines: ['One day Mowgli will walk into the', 'man-village and not look back —', 'but not today.', '', 'The Council Rock remembers.'] },
      { when: () => true, title: 'THE LAW OF THE JUNGLE', lines: ['As old and as true as the sky,', 'the Law runs on, with or without', 'a man-cub to keep it.'] },
    ],
    finale: ['THE COUNCIL ROCK FALLS SILENT.'],
  });
})();
