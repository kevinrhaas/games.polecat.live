/* ============================================================================
 * 20,000 LEAGUES — CAPTAIN NEMO   (Gen 2 / 16-bit)
 * A richer take on Jules Verne's novel, built on RetroSaga2:
 *   HUB is the Nautilus's own brass CAPTAIN'S CONSOLE — five glass portholes
 *   set in a riveted instrument panel, each a run of escalating phases ending
 *   in a mini-boss; relics (a whaler's eye, the diving-suit, Ned's axe, the
 *   electric hull) carry between them; a console choice at the Nautilus sets
 *   the ending.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    brass: '#d9ad51', brassDark: '#8a6a2a', brassLight: '#f2d98a',
    steel: '#2a3038', steelDark: '#12161a', rivet: '#565f66',
    glass: '#0e3a44', glassLight: '#1c5a68', glow: '#7dd8e8',
    deep: '#04141c', deepMid: '#0a2530', surf: '#123a44', foam: '#cdeef2',
    ink: '#0a0f14', pearl: '#f7ecd0', coral: '#ff6a4d',
    ice: '#cfeaf5', iceDeep: '#6fa8bf', danger: '#ff5a4d', violet: '#7a4a9c',
  };
  // digital/techy pixel face — justified for Verne's futuristic submarine
  // (the queue's "techy look #2": brass + glass, never green CRT phosphor).
  const TITLE = "'Sixtyfour','Press Start 2P',monospace";

  /* ─── emblem: a brass porthole ring around a nautilus-shell spiral ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(cx, cy, 34, C.glow, 0.4);
    c.fillStyle = C.glass; c.beginPath(); c.arc(cx, cy, 22, 0, 7); c.fill();
    c.strokeStyle = C.brass; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, 24, 0, 7); c.stroke();
    c.strokeStyle = C.brassDark; c.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.arc(cx, cy, 27, a, a + 0.28); c.stroke(); }
    c.strokeStyle = C.glow; c.lineWidth = 2;
    c.beginPath();
    for (let a = 0; a < 5.2; a += 0.12) { const r = 2 + a * 3; const x = cx + Math.cos(a * 2) * r, y = cy + Math.sin(a * 2) * r; a ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
  }

  /* ─── deep-sea backdrop: light shafts, drifting bubbles, distant hull ─── */
  function deepSea(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, C.surf], [0.5, C.deepMid], [1, C.deep]], H);
    for (let i = 0; i < 3; i++) { const x = W * (0.2 + i * 0.32) + Math.sin(t * 0.3 + i) * 14; c.save(); c.globalAlpha = 0.10; c.fillStyle = C.glow; c.beginPath(); c.moveTo(x - 20, 0); c.lineTo(x + 20, 0); c.lineTo(x + 60, H * 0.6); c.lineTo(x - 60, H * 0.6); c.closePath(); c.fill(); c.restore(); }
    g2.parallax(t * 10, [
      { speed: 0.3, draw: (ox) => { c.save(); c.globalAlpha = 0.25; c.fillStyle = C.glassLight; g2.tiled(ox, 220, (x) => { c.fillRect(x, H * 0.5, 70, 14); c.beginPath(); c.arc(x + 66, H * 0.5 + 7, 8, 0, 7); c.fill(); }); c.restore(); } },
    ]);
    for (let i = 0; i < 12; i++) { const seed = i * 137; const x = (seed % (W - 20)) + 10 + Math.sin(t * 0.6 + i) * 6; const y = H - ((t * 18 + seed) % (H + 20)); c.globalAlpha = 0.35; c.fillStyle = C.foam; c.beginPath(); c.arc(x, y, 1.5 + (i % 3), 0, 7); c.fill(); c.globalAlpha = 1; }
    if (dim) { c.fillStyle = 'rgba(4,16,24,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }

  /* ─── hub: the captain's brass console, riveted panel + connecting pipes ─── */
  function consolePanel(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.verticalGradient(0, 0, W, H, [[0, C.steelDark], [1, '#080b0e']]);
    for (let y = 10; y < H; y += 22) for (let x = 10; x < W; x += 22) { c.globalAlpha = 0.5; c.fillStyle = C.rivet; c.beginPath(); c.arc(x, y, 1.1, 0, 7); c.fill(); }
    c.globalAlpha = 1;
    g2.glow(W * 0.5, H * 0.5, 160, '#1c3a44', 0.25);
  }
  function pipes(api, t, order, xy) {
    const c = api.ctx;
    c.save(); c.strokeStyle = C.brassDark; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); order.forEach((id, i) => { const p = xy[id]; i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.stroke();
    c.strokeStyle = C.brass; c.lineWidth = 2; c.globalAlpha = 0.7;
    c.beginPath(); order.forEach((id, i) => { const p = xy[id]; i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.stroke();
    c.restore();
  }

  function scenery(api, scene, t) {
    if (scene === 'hub') { consolePanel(api, t); return; }
    deepSea(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale') ? 0.30 : 0);
  }

  /* ─── tiny vignettes painted inside each porthole's glass ─── */
  const ART = {
    lincoln(api, cx, cy, rad, t) {
      const c = api.ctx, g2 = api.g2;
      c.fillStyle = '#08131a'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      const ex = cx + Math.sin(t * 1.3) * rad * 0.3, ey = cy + rad * 0.2;
      g2.glow(ex, ey, rad * 0.4, '#ffcf7a', 0.5 + 0.15 * Math.sin(t * 5));
      c.fillStyle = '#ffcf7a'; c.beginPath(); c.ellipse(ex, ey, 3, 2, 0, 0, 7); c.fill();
    },
    nautilus(api, cx, cy, rad, t) {
      const c = api.ctx;
      c.fillStyle = C.glassLight; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      for (let i = 0; i < 3; i++) { const vx = cx - rad * 0.5 + i * rad * 0.5; const on = Math.floor(t * 2 + i) % 3 === 0; c.fillStyle = on ? C.glow : C.brassDark; c.beginPath(); c.arc(vx, cy, 3.4, 0, 7); c.fill(); }
    },
    coral(api, cx, cy, rad, t) {
      const c = api.ctx;
      c.fillStyle = '#0a3a34'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      c.fillStyle = C.pearl; c.beginPath(); c.arc(cx + Math.sin(t) * 4, cy + 2, 4, 0, 7); c.fill();
      c.strokeStyle = C.coral; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 8, cy + rad * 0.5); c.quadraticCurveTo(cx, cy - 2, cx + 8, cy + rad * 0.5); c.stroke();
    },
    kraken(api, cx, cy, rad, t) {
      const c = api.ctx;
      c.fillStyle = '#160a1c'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      c.strokeStyle = C.violet; c.lineWidth = 3;
      for (let i = -1; i <= 1; i += 2) { c.beginPath(); c.moveTo(cx + i * 6, cy + rad); c.quadraticCurveTo(cx + i * (10 + Math.sin(t * 3) * 3), cy, cx + i * 4, cy - rad * 0.4); c.stroke(); }
    },
    maelstrom(api, cx, cy, rad, t) {
      const c = api.ctx;
      c.fillStyle = '#02181c'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      c.strokeStyle = C.ice; c.lineWidth = 2;
      for (let a = 0; a < 5; a += 0.3) { const r = rad * (1 - a / 5.4); const ang = a * 2.2 + t; c.beginPath(); c.arc(cx, cy, Math.max(1, r), ang, ang + 1.4); c.stroke(); }
    },
  };

  /* ─── HUB: the console's five portholes ─── */
  const NODES_XY = { lincoln: [62, 148], nautilus: [208, 148], coral: [62, 268], kraken: [208, 268], maelstrom: [135, 388] };
  const ORDER = ['lincoln', 'nautilus', 'coral', 'kraken', 'maelstrom'];
  const menu = {
    title(api, save, t) {
      const g2 = api.g2, W = api.W;
      g2.ornateFrame(18, 8, W - 36, 34, 8, 'rgba(10,14,18,.88)', C.brass);
      g2.gleamText("CAPTAIN'S CONSOLE", W / 2, 14, api.fitSize("CAPTAIN'S CONSOLE", 11, W - 52, 'title'), C.brass, t, { shadow: 'rgba(0,0,0,.6)', gleamSpeed: 55, font: TITLE });
      api.txtCFit('PEARLS  ' + (save.cur || 0), W / 2, 30, 8, C.glow);
    },
    layout() {
      return ORDER.map((id) => { const p = NODES_XY[id], big = id === 'maelstrom'; const s = big ? 46 : 44; return { x: p[0] - s, y: p[1] - s, w: s * 2, h: s * 2 }; });
    },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, locked, t } = info;
      const cx = x + w / 2, cy = y + h / 2, rad = w / 2;
      if (sel && !locked) g2.glow(cx, cy, rad * 1.5, C.glow, 0.28 + 0.12 * Math.sin(t * 4));
      c.save();
      c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.clip();
      if (!locked && ART[node.id]) ART[node.id](api, cx, cy, rad, t); else { c.fillStyle = '#0a0f14'; c.fillRect(x, y, w, h); }
      c.restore();
      c.strokeStyle = C.brassDark; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, rad + 3, 0, 7); c.stroke();
      c.strokeStyle = locked ? '#3a3a3a' : (done ? C.brassLight : C.brass); c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.stroke();
      c.strokeStyle = sel ? C.glow : 'rgba(0,0,0,0)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, rad - 4, 0, 7); c.stroke();
      // rivets around the rim
      c.fillStyle = C.rivet; for (let i = 0; i < 6; i++) { const a = t * 0.2 + i * Math.PI / 3; c.beginPath(); c.arc(cx + Math.cos(a) * (rad + 3), cy + Math.sin(a) * (rad + 3), 1.6, 0, 7); c.fill(); }
      if (locked) { c.fillStyle = 'rgba(6,8,10,.6)'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill(); api.txtC('🔒', cx, cy - 6, 12, '#8a8a8a'); }
      if (done) api.txtC('✓', cx + rad - 4, cy - rad + 2, 9, C.brassLight);
      g2.roundRect(cx - w * 0.46, y + h + 2, w * 0.92, 15, 4, '#0a1014', locked ? '#3a3a3a' : C.brassDark, 1);
      api.txtCFit((node.optional ? '◆ ' : '') + node.name, cx, y + h + 5, 7, locked ? '#7a7a7a' : (done ? C.brassLight : C.glow), false, w - 4);
    },
  };

  /* ─── animated title screen: a periscope/sonar reveal (cold open) ─── */
  function renderBoot(api, info) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    deepSea(api, t, 0);
    const ringT = t % 3;
    for (let i = 0; i < 3; i++) { const rt = (ringT + i) % 3; const r = rt * 70; c.globalAlpha = Math.max(0, 0.35 - rt * 0.11); c.strokeStyle = C.glow; c.lineWidth = 2; c.beginPath(); c.arc(W / 2, H * 0.32, r, 0, 7); c.stroke(); }
    c.globalAlpha = 1;
    emblem(api, W / 2, H * 0.22);
    const title = '20,000 LEAGUES';
    const ts = api.fitSize(title, 20, W - 20, 'title');
    g2.gleamText(title, W / 2, H * 0.40, ts, C.brass, t, { shadow: 'rgba(0,0,0,.5)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('CAPTAIN NEMO', W / 2, H * 0.40 + ts + 12, 11, C.glow, true);
    if (info.blink) api.txtCFit('▸ TAP TO DIVE ◂', W / 2, H * 0.68, 12, C.foam);
    api.txtCFit('A 16-BIT TRIBUTE · JULES VERNE, 1870', W / 2, H - 28, 8, '#3a5a60');
    api.vignette(); api.scanlines();
  }

  /* ============================ mini-game phases ============================ */
  const DIVER = ['..hhhh..', '.hIIIIh.', '.hIssIh.', '..IssI..', '.kCCCCk.', 'kCCLLCCk', 'kCL..LCk', '.b.CC.b.'];
  const DIVERPAL = { h: '#8a9aa0', I: '#cfeaf5', s: '#12232a', k: '#0a0f14', C: '#a0522d', L: '#c9824a', b: '#12161a' };
  const SUB = ['..kkkkkkkkkk..', '.kbbbbbbbbbbk.', 'kbbOObbbbOObbk', 'kbbbbbbbbbbbbk', '.kbbbbbbbbbbk.', '..kkkkkkkkkk..'];
  const SUBPAL = { k: '#12161a', b: '#8a6a2a', O: '#7dd8e8' };

  /* --- LINCOLN: THE HUNT (aim & harpoon) --- */
  function huntTheMonster() {
    return {
      name: 'THE HUNT', boss: false, help: 'DRAG the crosshair, TAP to throw when the eye surfaces',
      winText: 'The hull shudders under three good strikes — it is no monster. It is a machine.',
      loseText: 'The harpoons run out. The creature dives, unscathed.',
      init(api) { this.hits = 0; this.need = 4; this.harpoons = 7; this.reticle = api.W / 2; this.target = null; this.spawnT = 1.0; this.thrown = null; },
      update(api, dt) {
        const W = api.W;
        if (api.pointer.down) this.reticle = api.pointer.x;
        this.reticle = clamp(this.reticle, 16, W - 16);
        if (this.target) {
          this.target.life -= dt;
          if (this.target.life <= 0) this.target = null;
        } else {
          this.spawnT -= dt;
          if (this.spawnT <= 0) { this.target = { x: api.rnd(30, W - 30), life: Math.max(0.65, 1.25 - this.hits * 0.08) }; this.spawnT = api.rnd(1.0, 1.7); }
        }
        if (this.thrown) { this.thrown.t += dt; if (this.thrown.t > 0.15) this.thrown = null; }
        if (api.pointer.justDown && this.harpoons > 0) {
          this.harpoons--; this.thrown = { x: this.reticle, t: 0 };
          if (this.target && Math.abs(this.target.x - this.reticle) < 16) {
            this.hits++; api.addScore(30); api.audio.sfx('shoot'); api.burst(this.reticle, api.H * 0.5, C.glow, 10); this.target = null; this.spawnT = api.rnd(0.5, 1.0);
            if (this.hits >= this.need) { api.addScore(60); api.win(); return; }
          } else { api.audio.sfx('blip'); }
          if (this.harpoons <= 0) { api.lose(); return; }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#0a1a24'], [0.55, '#071018'], [1, '#03080c']]);
        g2.stars(t, 22, H * 0.4, '#dfe6ff');
        g2.dither(H * 0.55, H, C.deepMid, C.deep, 3);
        for (let i = 0; i < 5; i++) { const wy = H * 0.55 + 18 + i * 34 + Math.sin(t * 1.4 + i) * 3; c.strokeStyle = 'rgba(180,220,230,.15)'; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= W; x += 10) c.lineTo(x, wy + Math.sin(x * 0.08 + t * 2 + i) * 3); c.stroke(); }
        c.fillStyle = C.steelDark; c.fillRect(0, H - 30, W, 30); c.fillStyle = C.brassDark; c.fillRect(0, H - 32, W, 4);
        g2.glow(W * 0.2, H - 40, 16, '#ffcf7a', 0.4 + 0.1 * Math.sin(t * 4));
        if (this.target) { g2.glow(this.target.x, H * 0.56, 14 * this.target.life + 6, '#ffcf7a', 0.55); c.fillStyle = '#ffcf7a'; c.beginPath(); c.ellipse(this.target.x, H * 0.56, 5, 3, 0, 0, 7); c.fill(); }
        c.strokeStyle = this.target ? '#2effa0' : C.foam; c.lineWidth = 2; const rx = this.reticle;
        c.beginPath(); c.moveTo(rx - 10, H * 0.56); c.lineTo(rx + 10, H * 0.56); c.moveTo(rx, H * 0.56 - 10); c.lineTo(rx, H * 0.56 + 10); c.stroke();
        if (this.thrown) { c.strokeStyle = C.brass; c.lineWidth = 3; c.beginPath(); c.moveTo(this.thrown.x, H - 30); c.lineTo(this.thrown.x, H * 0.56); c.stroke(); }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,10,16,.7)', C.brassDark, 1);
        api.txt('HARPOONS ' + this.harpoons, 10, 8, 8, C.brass);
        api.txtCFit('HITS ' + this.hits + '/' + this.need, W - 46, 8, 8, C.glow, false, 82);
        api.vignette();
      },
    };
  }

  /* --- NAUTILUS: THE OATH (valve simon-says memory) --- */
  function valvePanel() {
    return {
      name: 'THE OATH', boss: false, help: 'WATCH the valves glow in order, then TAP them back',
      winText: 'Three sequences, letter-perfect — Nemo nods. "You have the hands of a sailor."',
      loseText: 'A wrong valve — steam hisses. Nemo\'s patience thins.',
      init(api) {
        this.n = 4; this.round = 0; this.need = 3; this.lives = 3;
        this.vw = 50; this.gap = 10; this.x0 = (api.W - (this.n * this.vw + (this.n - 1) * this.gap)) / 2; this.y0 = api.H * 0.5;
        this.seq = []; this.step = 0; this.sub = 'show'; this.showI = 0; this.showT = 0.6;
        this.nextRound(api);
      },
      nextRound(api) { this.seq = []; for (let i = 0; i < 3 + this.round; i++) this.seq.push(api.rint(0, this.n - 1)); this.step = 0; this.sub = 'show'; this.showI = 0; this.showT = 0.55; },
      update(api, dt) {
        if (this.sub === 'show') {
          this.showT -= dt;
          if (this.showT <= 0) { this.showI++; this.showT = 0.5; if (this.showI >= this.seq.length) { this.sub = 'guess'; this.showI = -1; } }
        } else if (this.sub === 'guess') {
          if (api.pointer.justDown) {
            const i = Math.floor((api.pointer.x - this.x0) / (this.vw + this.gap));
            if (i >= 0 && i < this.n) {
              if (i === this.seq[this.step]) {
                this.step++; api.audio.sfx('blip'); api.burst(this.x0 + i * (this.vw + this.gap) + this.vw / 2, this.y0 + 25, C.glow, 6);
                if (this.step >= this.seq.length) {
                  this.round++; api.addScore(25);
                  if (this.round >= this.need) { api.addScore(50); api.win(); return; }
                  this.nextRound(api);
                }
              } else {
                this.lives--; api.shake(5, 0.25); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
                this.nextRound(api);
              }
            }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#182028'], [1, '#0a1014']]);
        g2.glow(W * 0.5, H * 0.28, 40, C.glow, 0.18);
        for (let x = 10; x < W; x += 24) { c.fillStyle = C.rivet; c.globalAlpha = 0.4; c.beginPath(); c.arc(x, H * 0.24, 1.4, 0, 7); c.fill(); c.globalAlpha = 1; }
        g2.ornateFrame(16, H * 0.16, W - 32, 34, 6, 'rgba(10,14,18,.85)', C.brass);
        api.txtCFit(this.sub === 'show' ? 'WATCH THE VALVES' : 'YOUR TURN', W / 2, H * 0.16 + 10, 10, C.foam);
        for (let i = 0; i < this.n; i++) {
          const vx = this.x0 + i * (this.vw + this.gap), lit = this.sub === 'show' && this.showI === i && this.seq[this.showI] === i;
          const litG = this.sub === 'show' && this.seq[this.showI] === i && this.showI >= 0;
          if (litG) g2.glow(vx + this.vw / 2, this.y0 + 25, 30, C.glow, 0.5);
          g2.roundRect(vx, this.y0, this.vw, 50, 6, litG ? 'rgba(125,216,232,.35)' : 'rgba(20,26,30,.9)', litG ? C.glow : C.brassDark, litG ? 3 : 2);
          c.strokeStyle = C.brass; c.lineWidth = 1.5; c.beginPath(); c.arc(vx + this.vw / 2, this.y0 + 25, 12, 0, 7); c.stroke();
          c.strokeStyle = C.brass; c.lineWidth = 3; const spin = t * 2 + i; c.beginPath(); c.moveTo(vx + this.vw / 2 - 8 * Math.cos(spin), this.y0 + 25 - 8 * Math.sin(spin)); c.lineTo(vx + this.vw / 2 + 8 * Math.cos(spin), this.y0 + 25 + 8 * Math.sin(spin)); c.stroke();
          api.txtCFit(String.fromCharCode(65 + i), vx + this.vw / 2, this.y0 + 54, 8, C.brassLight);
        }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,10,16,.7)', C.brassDark, 1);
        api.txt('ROUND ' + this.round + '/' + this.need, 10, 8, 8, C.brass);
        api.txtCFit('LIVES ' + this.lives, W - 46, 8, 8, C.foam, false, 82);
        api.vignette();
      },
    };
  }

  /* --- CORAL FOREST p1: THE PEARL BANKS (depth + collect) --- */
  function pearlDive() {
    return {
      name: 'THE PEARL BANKS', boss: false, help: 'DRAG up/down — collect pearls, don\'t linger too deep',
      winText: 'The satchel is full — pearls enough to ransom a kingdom.',
      loseText: 'The pressure gauge redlines. Surface, now.',
      init(api) {
        this.need = api.has('suit') ? 7 : 9; this.got = 0; this.time = 22; this.psi = 0.2;
        this.y = api.H * 0.5; this.pearls = []; for (let i = 0; i < 4; i++) this.spawn(api);
      },
      spawn(api) { this.pearls.push({ x: api.rnd(24, api.W - 24), y: api.rnd(90, api.H - 90) }); },
      update(api, dt) {
        const H = api.H;
        this.time -= dt;
        if (api.pointer.down) this.y += (api.pointer.y - this.y) * 0.15;
        this.y = clamp(this.y, 70, H - 70);
        const deepBand = this.y > H * 0.62;
        this.psi += (deepBand ? 0.11 : -0.09) * (api.has('suit') ? 0.75 : 1) * dt;
        this.psi = clamp(this.psi, 0, 1);
        if (this.psi >= 1) { api.shake(6, 0.3); api.flash(C.danger, 0.2); api.audio.sfx('hurt'); api.lose(); return; }
        for (const p of this.pearls) if (!p.dead && Math.abs(this.y - p.y) < 22) { p.dead = true; this.got++; api.addScore(14); api.audio.sfx('coin'); api.burst(p.x, p.y, C.pearl, 8); this.spawn(api); if (this.got >= this.need) { api.addScore(50); api.win(); return; } }
        this.pearls = this.pearls.filter((p) => !p.dead);
        if (this.time <= 0) { if (this.got >= this.need * 0.6) api.win(); else api.lose(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#0e5a54'], [0.5, '#0a3a34'], [1, C.deep]], H);
        g2.embers(t, 8, { yBottom: H, yTop: 0, color: C.foam, speed: 0.05, size: 1, alpha: 0.25 });
        for (const p of this.pearls) { g2.glow(p.x, p.y, 12, C.pearl, 0.4 + 0.15 * Math.sin(t * 4 + p.x)); c.fillStyle = C.pearl; c.beginPath(); c.arc(p.x, p.y, 4, 0, 7); c.fill(); }
        g2.bigSprite(DIVER, W / 2 - 16, this.y - 16, DIVERPAL, 4, { shadow: true, outline: '#0a0604' });
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,20,18,.7)', C.brassDark, 1);
        api.txt('PEARLS ' + this.got + '/' + this.need, 10, 8, 8, C.pearl);
        api.txtCFit(Math.ceil(this.time) + 's', W - 30, 8, 8, C.foam, false, 50);
        g2.roundRect(W / 2 - 40, H - 24, 80, 10, 3, 'rgba(6,10,16,.85)', C.brassDark, 1);
        c.fillStyle = this.psi > 0.75 ? C.danger : C.glow; c.fillRect(W / 2 - 38, H - 22, 76 * this.psi, 6);
        api.txtCFit('PSI', W / 2, H - 36, 7, C.foam);
        api.vignette();
      },
    };
  }
  /* --- CORAL FOREST p2 (optional boss): THE HUNTING SHARK --- */
  function sharkDefense() {
    return {
      name: 'THE HUNTING SHARK', boss: true, help: 'TAP the shark when it charges to fend it off',
      winText: 'The shark breaks off into the murk — Ned\'s axe earns its keep.',
      loseText: 'The shark\'s jaws close first.',
      init(api) { this.fends = 0; this.need = 5; this.lives = 3; this.side = 1; this.x = -30; this.charging = false; this.resolved = false; this.pause = 1.2; },
      update(api, dt) {
        const W = api.W;
        if (!this.charging) {
          this.pause -= dt;
          if (this.pause <= 0) { this.charging = true; this.resolved = false; this.side = api.chance(0.5) ? 1 : -1; this.x = this.side > 0 ? -30 : W + 30; }
        } else {
          this.x += this.side * (api.has('axe') ? 210 : 170) * dt;
          const mid = W / 2;
          if (!this.resolved && Math.abs(this.x - mid) < 22) {
            if (api.pointer.justDown) {
              this.resolved = true; this.fends++; api.addScore(24); api.audio.sfx('coin'); api.burst(this.x, api.H * 0.55, C.glow, 8);
              if (this.fends >= this.need) { api.addScore(50); api.win(); return; }
            } else if (Math.abs(this.x - mid) < 6) {
              this.resolved = true; this.lives--; api.shake(6, 0.3); api.flash(C.danger, 0.2); api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          if ((this.side > 0 && this.x > W + 30) || (this.side < 0 && this.x < -30)) { this.charging = false; this.pause = api.rnd(0.8, 1.4); }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#0a3a34'], [1, C.deep]], H);
        g2.fog(t, { y0: H * 0.3, y1: H, bands: 3, color: '#0a4a44', alpha: 0.08 });
        const sy = H * 0.55 + Math.sin(t * 2) * 6;
        c.save(); c.translate(this.x, sy); if (this.side < 0) c.scale(-1, 1);
        c.fillStyle = '#5a7a80'; c.beginPath(); c.ellipse(0, 0, 24, 9, 0, 0, 7); c.fill();
        c.beginPath(); c.moveTo(-24, 0); c.lineTo(-34, -6); c.lineTo(-34, 6); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(0, -9); c.lineTo(6, -20); c.lineTo(10, -8); c.closePath(); c.fill();
        c.fillStyle = '#0a0f14'; c.beginPath(); c.arc(14, -2, 1.6, 0, 7); c.fill();
        c.restore();
        g2.bigSprite(DIVER, W / 2 - 16, H * 0.6, DIVERPAL, 4, { shadow: true, outline: '#0a0604' });
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,20,18,.7)', C.brassDark, 1);
        api.txt('FENDS ' + this.fends + '/' + this.need, 10, 8, 8, C.glow);
        api.txtCFit('LIVES ' + this.lives, W - 46, 8, 8, C.foam, false, 82);
        api.vignette();
      },
    };
  }

  /* --- KRAKEN p1: SEAL THE PORTHOLES (defend) --- */
  function sealPortholes() {
    return {
      name: 'SEAL THE PORTHOLES', boss: false, help: 'TAP a smashed porthole to seal it before three breach',
      winText: 'Every gasket holds — the hull stays dry.',
      loseText: 'Three portholes give at once — the sea pours in.',
      init(api) {
        this.time = 18; this.breaches = 0; this.max = 3; this.sealed = 0;
        this.holes = [{ x: 60, y: 130, open: false, t: 0 }, { x: 210, y: 130, open: false, t: 0 }, { x: 60, y: 260, open: false, t: 0 }, { x: 210, y: 260, open: false, t: 0 }];
        this.spawnT = api.has('harpoon') ? 1.1 : 0.85;
      },
      update(api, dt) {
        this.time -= dt;
        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          const closed = this.holes.filter((h) => !h.open);
          if (closed.length) { const h = api.choice(closed); h.open = true; h.t = 2.0; }
          this.spawnT = api.rnd(0.8, 1.3);
        }
        for (const h of this.holes) if (h.open) { h.t -= dt; if (h.t <= 0) { h.open = false; this.breaches++; api.shake(6, 0.3); api.flash(C.danger, 0.18); api.audio.sfx('hurt'); if (this.breaches >= this.max) { api.lose(); return; } } }
        if (api.pointer.justDown) for (const h of this.holes) if (h.open && Math.hypot(api.pointer.x - h.x, api.pointer.y - h.y) < 30) { h.open = false; this.sealed++; api.addScore(18); api.audio.sfx('coin'); api.burst(h.x, h.y, C.glow, 8); break; }
        if (this.time <= 0) { api.addScore(50); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        c.fillStyle = C.steelDark; c.fillRect(0, 0, W, H);
        for (let y = 10; y < H; y += 22) for (let x = 10; x < W; x += 22) { c.globalAlpha = 0.35; c.fillStyle = C.rivet; c.beginPath(); c.arc(x, y, 1.2, 0, 7); c.fill(); }
        c.globalAlpha = 1;
        for (const h of this.holes) {
          c.strokeStyle = C.brassDark; c.lineWidth = 5; c.beginPath(); c.arc(h.x, h.y, 32, 0, 7); c.stroke();
          if (h.open) { g2.glow(h.x, h.y, 30, C.violet, 0.4); c.fillStyle = C.violet; c.beginPath(); c.arc(h.x, h.y, 26, 0, 7); c.fill(); c.strokeStyle = C.danger; c.lineWidth = 2; c.beginPath(); c.moveTo(h.x - 12, h.y - 10); c.quadraticCurveTo(h.x, h.y + 14, h.x + 14, h.y + 4); c.stroke(); }
          else { c.fillStyle = C.glass; c.beginPath(); c.arc(h.x, h.y, 26, 0, 7); c.fill(); }
          c.strokeStyle = C.brass; c.lineWidth = 2; c.beginPath(); c.arc(h.x, h.y, 26, 0, 7); c.stroke();
        }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,10,16,.7)', C.brassDark, 1);
        api.txt('BREACHES ' + this.breaches + '/' + this.max, 10, 8, 8, C.danger);
        api.txtCFit(Math.ceil(this.time) + 's', W - 30, 8, 8, C.foam, false, 50);
        api.vignette();
      },
    };
  }
  /* --- KRAKEN p2 (boss): THE BEAK (timing duel) --- */
  function beakDuel() {
    return {
      name: 'THE BEAK', boss: true, help: 'TAP when the beak glows to strike with the harpoon',
      winText: 'The last strike lands — the kraken releases the hull and sinks into the dark.',
      loseText: 'A tentacle slams the viewport — the strike goes wide.',
      init(api) { this.hp = 4; this.taken = 0; this.max = 3; this.glowT = 1.3; this.strike = false; this.tentacleT = 1.6; this.warn = null; },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.glowT -= dt; if (this.glowT <= 0) { this.strike = !this.strike; this.glowT = this.strike ? (api.has('current') ? 1.1 : 0.85) : 1.2; }
        this.tentacleT -= dt;
        if (this.tentacleT <= 0) { this.warn = { x: api.rnd(30, W - 30), t: 0.7 }; this.tentacleT = api.rnd(1.6, 2.4); }
        if (this.warn) { this.warn.t -= dt; if (this.warn.t <= 0) { if (Math.abs(this.warn.x - W / 2) < 40) { this.taken++; api.shake(6, 0.3); api.flash(C.danger, 0.2); api.audio.sfx('hurt'); if (this.taken >= this.max) { api.lose(); return; } } this.warn = null; } }
        if (api.pointer.justDown) {
          if (this.strike && api.pointer.y < H * 0.55) { this.hp--; api.addScore(35); api.audio.sfx('shoot'); api.burst(W / 2, H * 0.32, C.glow, 12); this.strike = false; this.glowT = 1.0; if (this.hp <= 0) { api.addScore(70); api.win(); return; } }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#160a1c'], [1, '#04060a']]);
        g2.glow(W / 2, H * 0.32, this.strike ? 46 : 30, this.strike ? C.glow : C.violet, this.strike ? 0.6 : 0.35);
        c.fillStyle = '#1c0e26'; c.beginPath(); c.arc(W / 2, H * 0.32, 34, 0, 7); c.fill();
        c.fillStyle = this.strike ? '#ffe27a' : '#c8a4d8'; c.beginPath(); c.ellipse(W / 2, H * 0.32, 12, this.strike ? 12 : 3, 0, 0, 7); c.fill();
        c.strokeStyle = C.violet; c.lineWidth = 3;
        for (let i = -1; i <= 1; i += 2) { c.beginPath(); c.moveTo(W / 2 + i * 30, H); c.quadraticCurveTo(W / 2 + i * (50 + Math.sin(t * 2) * 8), H * 0.6, W / 2 + i * 10, H * 0.45); c.stroke(); }
        if (this.warn) { const a = clamp(this.warn.t / 0.7, 0, 1); g2.glow(this.warn.x, H * 0.7, 26, C.danger, 0.3 + (1 - a) * 0.4); c.strokeStyle = C.danger; c.lineWidth = 2; c.beginPath(); c.arc(this.warn.x, H * 0.7, 26 * a, 0, 7); c.stroke(); }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(10,6,16,.7)', C.violet, 1);
        api.txt('KRAKEN ' + this.hp + ' HITS', 10, 8, 8, C.foam);
        api.txtCFit('HULL ' + '♥'.repeat(Math.max(0, this.max - this.taken)), W - 52, 8, 8, C.danger, false, 96);
        if (this.strike) api.txtCFit('▸ STRIKE! ◂', W / 2, H * 0.32 - 46, 9, C.glow);
        api.vignette();
      },
    };
  }

  /* --- MAELSTROM p1: THE ICE FIELD (mode7 racing/dodge) --- */
  function iceRace() {
    return {
      name: 'THE ICE FIELD', boss: false, help: 'DRAG left/right to steer clear of the floes',
      winText: 'The last floe slides past — open water, and the pole behind us.',
      loseText: 'The hull grinds against pack ice — the engines fail.',
      init(api) { this.x = api.W / 2; this.dist = 0; this.need = 900; this.lives = 3; this.floes = []; this.spawnT = 0.6; },
      update(api, dt) {
        const W = api.W, H = api.H;
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.22;
        this.x = clamp(this.x, 20, W - 20);
        const spd = 46 + Math.min(40, this.dist * 0.03);
        this.dist += spd * dt; api.addScore(0);
        if (this.dist >= this.need) { api.addScore(60); api.win(); return; }
        this.spawnT -= dt; if (this.spawnT <= 0) { this.floes.push({ x: api.rnd(24, W - 24), y: -20, s: api.rnd(1.8, 2.6) }); this.spawnT = api.rnd(0.45, 0.8); }
        for (const f of this.floes) f.y += f.s * dt * 60;
        this.floes = this.floes.filter((f) => f.y < H + 30);
        for (const f of this.floes) if (!f.dead && Math.abs(f.x - this.x) < 22 && Math.abs(f.y - (H - 90)) < 20) { f.dead = true; this.lives--; api.shake(6, 0.3); api.flash(C.danger, 0.2); api.audio.sfx('hurt'); if (this.lives <= 0) { api.lose(); return; } }
        this.floes = this.floes.filter((f) => !f.dead);
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#0a2530'], [1, '#123a44']], H * 0.4);
        g2.mode7({ horizon: H * 0.4, camZ: t * 60, angle: 0, height: 1.1, fog: C.deep, tex: (wx, wz) => ((Math.floor(wx / 40) + Math.floor(wz / 40)) & 1) ? C.iceDeep : C.ice });
        for (const f of this.floes) { g2.glow(f.x, f.y, 16, C.ice, 0.3); c.fillStyle = C.ice; c.beginPath(); c.ellipse(f.x, f.y, 16, 9, 0, 0, 7); c.fill(); c.strokeStyle = C.iceDeep; c.lineWidth = 2; c.stroke(); }
        g2.bigSprite(SUB, this.x - 21, H - 108, SUBPAL, 3, { shadow: true, outline: '#0a0604' });
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,20,.7)', C.brassDark, 1);
        api.txt('HULL ' + '♥'.repeat(Math.max(0, this.lives)), 10, 8, 8, C.danger);
        api.txtCFit(Math.min(100, Math.round(this.dist / this.need * 100)) + '%', W - 30, 8, 8, C.foam, false, 50);
        api.vignette();
      },
    };
  }
  /* --- MAELSTROM p2 (boss/finale): THE VORTEX (survive + dodge) --- */
  function vortexEscape() {
    return {
      name: 'THE VORTEX', boss: true, help: 'DRAG away from the vortex\'s center — dodge the rocks near the rim',
      winText: 'The Nautilus breaks the whirlpool\'s grip — the sea goes calm astern.',
      loseText: 'The maelstrom\'s pull wins. The Nautilus spirals down into legend.',
      init(api) {
        this.cx = api.W / 2; this.cy = api.H * 0.52; this.ang = 0; this.r = api.H * 0.34;
        this.hold = 0; this.need = 20; this.pull = api.has('current') ? 0.55 : 1; this.rocks = []; this.spawnT = 1.2;
      },
      update(api, dt) {
        const H = api.H;
        this.ang += dt * 0.6;
        this.r -= this.pull * 10 * dt;
        if (api.pointer.down) { const dx = api.pointer.x - this.cx, dy = api.pointer.y - this.cy; const d = Math.hypot(dx, dy); if (d > 4) this.r += Math.min(30, d) * 0.06 * (60 * dt); }
        this.r = clamp(this.r, 14, H * 0.42);
        if (this.r <= 16) { api.shake(8, 0.4); api.flash(C.danger, 0.3); api.audio.sfx('hurt'); api.lose(); return; }
        this.spawnT -= dt; if (this.spawnT <= 0) { this.rocks.push({ a: api.rnd(0, 6.28), life: 3.5 }); this.spawnT = api.rnd(1.0, 1.7); }
        for (const rk of this.rocks) rk.life -= dt;
        this.rocks = this.rocks.filter((rk) => rk.life > 0);
        const px = this.cx + Math.cos(this.ang) * this.r, py = this.cy + Math.sin(this.ang) * this.r;
        for (const rk of this.rocks) if (!rk.hit) { const rx = this.cx + Math.cos(rk.a) * (H * 0.4), ry = this.cy + Math.sin(rk.a) * (H * 0.4); if (Math.hypot(px - rx, py - ry) < 22) { rk.hit = true; this.r -= 20; api.shake(6, 0.3); api.flash(C.danger, 0.18); api.audio.sfx('hurt'); } }
        if (this.r > H * 0.3) { this.hold += dt; api.addScore(Math.round(dt * 6)); if (this.hold >= this.need) { api.addScore(60); api.win(); return; } } else this.hold = Math.max(0, this.hold - dt * 0.5);
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#0a2a30'], [1, '#02080a']]);
        for (let a = 0; a < 6; a += 0.35) { const rr = H * 0.42 * (1 - a / 6.3); const ang = a * 2 + t * 0.6; c.strokeStyle = C.ice; c.globalAlpha = 0.25; c.lineWidth = 2; c.beginPath(); c.arc(this.cx, this.cy, Math.max(2, rr), ang, ang + 1.6); c.stroke(); }
        c.globalAlpha = 1;
        g2.glow(this.cx, this.cy, 30, '#02181c', 0.6);
        for (const rk of this.rocks) { const rx = this.cx + Math.cos(rk.a) * (H * 0.4), ry = this.cy + Math.sin(rk.a) * (H * 0.4); c.fillStyle = rk.hit ? '#3a3a3a' : '#5a5048'; c.beginPath(); c.arc(rx, ry, 10, 0, 7); c.fill(); }
        const px = this.cx + Math.cos(this.ang) * this.r, py = this.cy + Math.sin(this.ang) * this.r;
        g2.bigSprite(SUB, px - 21, py - 9, SUBPAL, 3, { shadow: true, outline: '#0a0604', flip: Math.cos(this.ang) < 0 });
        c.strokeStyle = this.r > H * 0.3 ? '#2effa0' : C.danger; c.lineWidth = 2; c.setLineDash([3, 3]); c.beginPath(); c.arc(this.cx, this.cy, H * 0.3, 0, 7); c.stroke(); c.setLineDash([]);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,20,.7)', C.brassDark, 1);
        api.txt('CLEAR ' + Math.round(this.hold) + '/' + this.need + 's', 10, 8, 8, C.glow);
        api.txtCFit(this.r > H * 0.3 ? 'SAFE' : 'PULLED IN', W - 40, 8, 8, this.r > H * 0.3 ? '#2effa0' : C.danger, false, 70);
        api.vignette();
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'nemo16', title: '20,000 Leagues', subtitle: 'CAPTAIN NEMO',
    currency: 'PEARLS', accent: C.glow, ownPhaseHud: true,
    titleFont: TITLE, uiFont: "'Pixelify Sans','Press Start 2P',monospace",
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.brass, blood: C.danger, cream: C.foam, dim: '#3a5a60', ink: C.ink },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'CHOOSE A PORTHOLE', mapDone: 'THE VOYAGE IS COMPLETE',
    screens: {
      overlay: 'rgba(4,16,20,.86)', win: C.brassLight, lose: '#ff8a70', chapterLabel: C.dim,
      name: C.foam, sub: C.glow, intro: '#cdeef2', quote: '#4a8090', help: C.glow,
      score: C.foam, cur: C.glow, cta: C.foam,
    },
    labels: {
      chapter: 'PORTHOLE', phase: 'DEPTH', boss: 'THE RECKONING', score: 'CATCH',
      win: 'HATCH SECURED', lose: 'THE SEA TAKES ITS DUE', nextPhaseWin: 'GROUND HELD',
      cont: 'TAP TO PRESS ON', toMap: 'TAP FOR THE CONSOLE', play: 'TAP TO BEGIN',
      nextPhase: 'TAP TO PRESS ON', toFinale: 'TAP FOR THE SURFACE',
    },
    upgrades: {
      harpoon: { name: "THE WHALER'S EYE", desc: 'a steadier aim under pressure' },
      suit: { name: 'THE DIVING SUIT', desc: 'better endurance at depth' },
      axe: { name: "NED LAND'S AXE", desc: 'a harder-hitting strike' },
      current: { name: 'THE ELECTRIC HULL', desc: 'the vortex\'s pull weakens' },
    },
    nodes: [
      {
        id: 'lincoln', name: 'THE HUNT', sub: 'ABOARD THE ABRAHAM LINCOLN', reward: 60, grant: 'harpoon',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 1, y - 8, 2, 14, C.brassDark); api.g2.glow(x, y - 8, 5, '#ffcf7a', 0.5); },
        intro: ['By night the frigate hunts a', 'monster that has haunted every', 'sea — Aronnax at the rail.'],
        quote: 'I confess I had come, like everyone else, to believe in the monster.',
        winText: 'The hull shudders under three good strikes — it is no monster. It is a machine.',
        phases: [huntTheMonster()],
      },
      {
        id: 'nautilus', name: 'THE NAUTILUS', sub: "CAPTAIN NEMO'S DOMINION", needs: ['lincoln'], reward: 60, grant: 'suit',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 9, y - 5, 18, 9, C.brassDark); api.g2.glow(x, y, 6, C.glow, 0.5); },
        intro: ['Thrown from the wreck, Aronnax', 'wakes aboard a ship of brass', 'and glass — Nemo\'s Nautilus.'],
        quote: 'The sea does not belong to despots... I am not what you call a civilized man!',
        winText: 'Three sequences, letter-perfect — Nemo nods. "You have the hands of a sailor."',
        choice: {
          prompt: 'Nemo asks: will you make the sea your home?',
          hint: 'YOUR ANSWER SHAPES HOW THE VOYAGE ENDS',
          options: [
            { label: 'Embrace the depths', sub: 'Cast your lot with Nemo, forever below', flag: 'devoted',
              icon(api, x, y) { const g = api.gfx; g.rect(x - 6, y - 6, 12, 12, C.glass); api.txtC('◆', x, y - 5, 8, C.glow); } },
            { label: 'Still dream of the surface', sub: 'Keep faith that you\'ll see the sky again', flag: 'yearning',
              icon(api, x, y) { const g = api.gfx; g.rect(x - 1, y - 8, 2, 16, C.brassDark); api.g2.glow(x, y - 8, 5, '#fff2c0', 0.5); } },
          ],
        },
        phases: [valvePanel()],
      },
      {
        id: 'coral', name: 'THE CORAL FOREST', sub: 'THE PEARL FISHERY', needs: ['nautilus'], optional: true, reward: 40, grant: 'axe',
        icon(api, x, y) { const g = api.gfx; api.txtC('❀', x, y - 6, 12, C.coral); },
        intro: ['At Ceylon, Nemo dives for the', 'pearl banks — and Ned Land\'s', 'axe finds a hungrier hunter.'],
        quote: 'The sea is only for the strong.',
        winText: 'The shark breaks off into the murk — Ned\'s axe earns its keep.',
        phases: [pearlDive(), sharkDefense()],
      },
      {
        id: 'kraken', name: 'THE KRAKEN', sub: 'ATTACK OF THE POULPES', needs: ['nautilus'], reward: 70, grant: 'current',
        icon(api, x, y) { const g = api.gfx; api.txtC('🐙', x, y - 6, 12, C.violet); },
        intro: ['A forest of arms breaks the', 'hull\'s calm — the giant squid', 'has found the Nautilus.'],
        quote: 'Nemo, revolver in hand, faced one of the monsters and stared into its enormous eye.',
        winText: 'The last strike lands — the kraken releases the hull and sinks into the dark.',
        phases: [sealPortholes(), beakDuel()],
      },
      {
        id: 'maelstrom', name: 'THE MAELSTROM', sub: 'THE NORWAY WHIRLPOOL', needs: ['kraken'], reward: 120,
        icon(api, x, y) { const g = api.gfx; api.txtC('◉', x, y - 6, 12, C.ice); },
        intro: ['South to north, the Nautilus', 'runs the pack ice — then the', 'Norway coast, and its whirlpool.'],
        quote: 'The Maelstrom! Could a more dreaded word, in a more dreaded situation, ring in our ears?',
        winText: 'The Nautilus breaks the whirlpool\'s grip — the sea goes calm astern.',
        phases: [iceRace(), vortexEscape()],
      },
    ],
    endings: [
      { when: (f) => f.devoted, title: 'KEEPER OF THE ABYSS', lines: ['Aronnax lets the Nautilus carry', 'him on, captain and crew bound', 'to the deep\'s last free country.', '', 'The console falls dark.'] },
      { when: (f) => f.yearning, title: "THE FISHERMAN'S BOAT", lines: ['Aronnax, Conseil, and Ned surface', 'in a fisherman\'s skiff off Norway —', 'free, with a story none will believe.', '', 'The console falls dark.'] },
      { when: () => true, title: 'THE VOYAGE HOME', lines: ['The sea keeps Captain Nemo\'s', 'secret, twenty thousand leagues', 'deep.'] },
    ],
    finale: ['THE CONSOLE FALLS DARK.'],
  });
})();
