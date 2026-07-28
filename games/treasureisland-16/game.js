/* ============================================================================
 * X MARKS THE SPOT — TREASURE ISLAND   (Gen 2 / 16-bit)
 * A richer, more dynamic take on R. L. Stevenson's novel, built on RetroSaga2:
 *   HUB is Jim's own treasure CHART (parchment, dotted rope trail, X marks),
 *   each stop a run of escalating phases ending in a mini-boss/reckoning;
 *   persistent relics (compass, cutlass, Flint the parrot, Flint's chart)
 *   carry across the run; a chart-choice at the Inn sets the ending.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    sky: '#bfe8ea', sea: '#2f8b9a', seaDeep: '#123a4a', foam: '#eafcf4',
    parchment: '#e8d9a8', parchDark: '#c9a866', ink: '#2a1c10',
    gold: '#ffd25c', wood: '#5a3c1e', woodDark: '#2e1c0c',
    blood: '#c8342a', jungle: '#2f6b3a', shadow: '#04121c',
  };
  // bold pixel banner face, legible at title size — the blackletter-bug lesson
  // (UX-sweep #34/#37 finding 1) means every new 16-bit title stays a clean,
  // chunky pixel face, never a decorative/script one.
  const TITLE = "'Jersey 20','Press Start 2P',serif";

  /* ─── skull-and-crossbones crest (title + finale) ─── */
  function emblem(api, cx, cy) {
    const g2 = api.g2, c = api.ctx;
    g2.glow(cx, cy, 36, C.gold, 0.5);
    c.fillStyle = '#1c140a';
    c.beginPath(); c.moveTo(cx - 24, cy - 16); c.lineTo(cx + 24, cy - 16); c.lineTo(cx + 24, cy + 4);
    c.quadraticCurveTo(cx + 24, cy + 24, cx, cy + 28); c.quadraticCurveTo(cx - 24, cy + 24, cx - 24, cy + 4); c.closePath(); c.fill();
    c.strokeStyle = C.gold; c.lineWidth = 2; c.stroke();
    api.gfx.sprite([
      '.wwwwww.',
      'w.wwww.w',
      'wwwwwwww',
      'w.wwww.w',
      '..w..w..',
      '.wwwwww.',
    ], cx - 16, cy - 16, { w: '#e8d9a8' }, 4);
    c.strokeStyle = '#e8d9a8'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx - 20, cy + 16); c.lineTo(cx + 20, cy + 28); c.moveTo(cx - 20, cy + 28); c.lineTo(cx + 20, cy + 16); c.stroke();
  }

  /* ─── open-sea backdrop: gulls, distant island, dithered waves ─── */
  function seaScene(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, C.sky], [0.55, '#eadfb0'], [1, '#f3e6b8']], H * 0.52);
    g2.glow(W * 0.78, H * 0.16, 28, '#fff2c0', 0.5);
    c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(W * 0.78, H * 0.16, 12, 0, 7); c.fill();
    for (let i = 0; i < 4; i++) {
      const gx = (t * 14 + i * 70) % (W + 40) - 20, gy = 40 + Math.sin(t * 2 + i) * 10 + i * 8;
      const up = Math.sin(t * 6 + i) > 0;
      c.strokeStyle = '#2a2a2a'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(gx - 4, gy); c.lineTo(gx, gy - (up ? 3 : 1)); c.lineTo(gx + 4, gy); c.stroke();
    }
    g2.parallax(t * 18, [
      { speed: 0.25, draw: (ox) => { c.fillStyle = '#3a6b52'; g2.tiled(ox, 140, (x) => { c.beginPath(); c.moveTo(x, H * 0.52); c.quadraticCurveTo(x + 40, H * 0.40, x + 80, H * 0.52); c.fill(); }); } },
      { speed: 0.6, draw: (ox) => { g2.tiled(ox, 60, (x) => { c.fillStyle = '#2f8b9a'; c.fillRect(x, H * 0.5, 50, 3); }); } },
    ]);
    g2.dither(H * 0.5, H, C.sea, C.seaDeep, 3);
    for (let i = 0; i < 6; i++) {
      const wy = H * 0.5 + 18 + i * 38 + Math.sin(t * 1.5 + i) * 4;
      c.strokeStyle = 'rgba(230,250,240,.22)'; c.lineWidth = 2; c.beginPath();
      for (let x = 0; x <= W; x += 10) c.lineTo(x, wy + Math.sin(x * 0.08 + t * 2 + i) * 3);
      c.stroke();
    }
    if (dim) { c.fillStyle = 'rgba(4,16,24,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }
  function chartTable(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    c.fillStyle = '#3a2410'; c.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 26) { c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(0, y, W, 2); }
    g2.roundRect(14, 60, W - 28, H - 96, 10, C.parchment, '#8a6a3a', 2);
    c.fillStyle = 'rgba(60,30,10,.3)';
    [[20, 66], [W - 30, 68], [22, H - 42], [W - 34, H - 40]].forEach((p) => { c.beginPath(); c.arc(p[0], p[1], 9, 0, 7); c.fill(); });
    const cx = W / 2, cy = H * 0.48;
    c.save(); c.translate(cx, cy); c.rotate(t * 0.05);
    c.strokeStyle = 'rgba(60,40,10,.35)'; c.lineWidth = 1;
    for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * Math.PI / 4) * 24, Math.sin(i * Math.PI / 4) * 24); c.stroke(); }
    c.restore();
    g2.glow(W * 0.85, 42, 18, C.gold, 0.4);
  }
  function scenery(api, scene, t) {
    if (scene === 'hub') { chartTable(api, t); return; }
    seaScene(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale') ? 0.32 : 0);
  }

  /* ─── tiny per-location vignettes shown inside each menu medallion ─── */
  const ART = {
    inn(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#241608'; c.fillRect(x, y, w, h); g2.glow(x + w * 0.7, y + h * 0.4, 12, '#ffcf7a', 0.5 + 0.1 * Math.sin(t * 5)); c.fillStyle = '#3a2410'; c.fillRect(x + w * 0.6, y + h * 0.55, 10, 8); c.fillStyle = '#8a6a3a'; c.fillRect(x + w * 0.2, y + h * 0.6, 12, 10); },
    hispaniola(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; g2.verticalGradient(x, y, w, h, [[0, '#bfe8ea'], [1, C.sea]]); c.fillStyle = C.woodDark; c.fillRect(x + w / 2 - 2, y + 4, 4, h - 10); c.fillStyle = C.parchment; c.beginPath(); c.moveTo(x + w / 2, y + 8); c.lineTo(x + w / 2 + 16, y + h * 0.4); c.lineTo(x + w / 2, y + h * 0.4); c.fill(); c.fillStyle = C.woodDark; c.fillRect(x + w * 0.15, y + h - 10, w * 0.7, 6); },
    barrel(api, x, y, w, h, t) { const c = api.ctx; c.fillStyle = '#1c1608'; c.fillRect(x, y, w, h); c.fillStyle = '#5a3c1e'; c.fillRect(x + w * 0.25, y + 4, w * 0.5, h - 8); c.strokeStyle = '#2e1c0c'; c.lineWidth = 2; c.strokeRect(x + w * 0.25, y + 4, w * 0.5, h - 8); const bx = x + w / 2 + Math.sin(t * 2) * 4, by = y + h * 0.4; c.fillStyle = '#0a0a0a'; c.fillRect(bx, by, 2, 2); },
    stockade(api, x, y, w, h, t) { const c = api.ctx; c.fillStyle = '#2f6b3a'; c.fillRect(x, y, w, h); c.fillStyle = '#4a3018'; for (let i = 0; i < 5; i++) c.fillRect(x + 4 + i * (w - 8) / 5, y + h * 0.3, (w - 8) / 5 - 2, h * 0.6); const fl = 0.5 + 0.5 * Math.sin(t * 6); c.fillStyle = api.g2.mix('#3a2008', '#ffb050', fl); c.fillRect(x + w * 0.5 - 2, y + h * 0.5, 4, 5); },
    treasure(api, x, y, w, h, t) { const c = api.ctx; c.fillStyle = '#c9a866'; c.fillRect(x, y, w, h); c.strokeStyle = C.blood; c.lineWidth = 3; const cx = x + w / 2, cy = y + h / 2; c.beginPath(); c.moveTo(cx - 9, cy - 9); c.lineTo(cx + 9, cy + 9); c.moveTo(cx + 9, cy - 9); c.lineTo(cx - 9, cy + 9); c.stroke(); },
  };

  /* ─── HUB: Jim's own treasure chart, dotted rope trail, X marks each stop ─── */
  const NODES_XY = { inn: [36, 90], hispaniola: [146, 140], barrel: [26, 228], stockade: [146, 300], treasure: [80, 384] };
  const ORDER = ['inn', 'hispaniola', 'stockade', 'treasure'];
  const menu = {
    title(api, save, t) {
      const c = api.ctx, g2 = api.g2, W = api.W;
      c.save(); c.setLineDash([4, 6]); c.lineDashOffset = -(t * 18) % 1000;
      c.strokeStyle = C.woodDark; c.lineWidth = 2; c.globalAlpha = 0.6;
      c.beginPath(); ORDER.forEach((id, i) => { const p = NODES_XY[id], px = p[0] + 46, py = p[1] + 30; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke(); c.restore();
      g2.ornateFrame(20, 10, W - 40, 36, 8, 'rgba(30,18,6,.85)', C.gold);
      g2.gleamText("JIM'S CHART", W / 2, 16, api.fitSize("JIM'S CHART", 12, W - 56, 'title'), C.gold, t, { shadow: 'rgba(0,0,0,.6)', gleamSpeed: 60, font: TITLE });
      api.txtCFit('DOUBLOONS  ' + (save.cur || 0), W / 2, 34, 8, C.woodDark);
    },
    layout() { return ['inn', 'hispaniola', 'barrel', 'stockade', 'treasure'].map((id) => { const p = NODES_XY[id], big = id === 'treasure'; return { x: p[0], y: p[1], w: big ? 100 : 92, h: big ? 72 : 66 }; }); },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, locked, t } = info;
      const cx = x + w / 2;
      if (sel && !locked) g2.glow(cx, y + (h - 14) / 2, 44, C.gold, 0.3 + 0.15 * Math.sin(t * 4));
      g2.roundRect(x, y, w, h - 14, 7, locked ? 'rgba(40,30,16,.75)' : 'rgba(232,217,168,.92)', done ? C.gold : (sel ? C.woodDark : '#8a6a3a'), sel ? 2 : 1);
      c.save(); g2.roundRect(x + 5, y + 5, w - 10, h - 30, 5, null, null); c.clip();
      if (!locked && ART[node.id]) ART[node.id](api, x + 5, y + 5, w - 10, h - 30, t); else { c.fillStyle = '#c9b276'; c.fillRect(x + 5, y + 5, w - 10, h - 30); }
      c.restore();
      if (locked) { g2.roundRect(x + 5, y + 5, w - 10, h - 30, 5, 'rgba(20,14,8,.6)', null); api.txtC('🔒', cx, y + (h - 30) / 2 - 3, 12, '#c9b276'); }
      if (done) api.txtC('✓', x + w - 12, y + 9, 10, C.gold);
      g2.roundRect(x + 6, y + h - 22, w - 12, 16, 4, done ? '#3a2410' : '#1c4a5c', done ? C.gold : '#8a6a3a', 1);
      api.txtCFit((node.optional ? '◆ ' : '') + node.name, cx, y + h - 19, 7, locked ? '#8a7a5a' : (done ? '#ffe9a0' : '#e8d9a8'), false, w - 16);
    },
  };

  /* ─── animated title screen ─── */
  function renderBoot(api, info) {
    const g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    seaScene(api, t, 0);
    emblem(api, W / 2, H * 0.24);
    const title = 'X MARKS THE SPOT';
    const ts = api.fitSize(title, 22, W - 20, 'title');
    g2.gleamText(title, W / 2, H * 0.40, ts, C.ink, t, { shadow: 'rgba(0,0,0,.5)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('TREASURE ISLAND', W / 2, H * 0.40 + ts + 12, 11, C.woodDark, true);
    if (info.blink) api.txtCFit('▸ TAP TO SET SAIL ◂', W / 2, H * 0.68, 12, '#1c140a');
    api.txtCFit('A 16-BIT TRIBUTE · R. L. STEVENSON, 1883', W / 2, H - 28, 8, '#3a2410');
    api.vignette(); api.scanlines();
  }

  /* ============================ mini-game phases ============================ */
  const HUNTER = ['..hhhh..', '.hHssHh.', '.hsffsh.', '..ffff..', '.kCCCCk.', 'kCCLLCCk', 'kCL..LCk', '.b.CC.b.', '.bb..bb.'];
  const HUNTERPAL = { h: '#1a0f08', H: '#3a2416', s: '#5a3a20', f: '#d8b088', k: '#241608', C: '#1c4a5c', L: '#2f6b8a', b: '#0e0a06' };
  const SHIP = ['...ss...', '..ssss..', '.s.mm.s.', '.s.mm.s.', 'HHHHHHHH', 'hHHHHHHh', 'hhHHHHhh', '.hhhhhh.'];
  const SHIPPAL = { s: '#e0d8c0', m: '#2a1c0e', H: '#7a4a22', h: '#4a2c14' };
  const SLOOP_BIG = ['...kkkk...', '..kssssk..', '.kssssssk.', 'kBBBBBBBBk', 'kB.BB.BBBk', '.kBBBBBBk.', '..kwwwwk..'];
  const SLOOPPAL = { k: '#0a0604', s: '#d8d0b8', B: '#4a2c14', w: '#1c3a4a' };

  /* --- INN: THE BLACK SPOT (card table, track-the-marked-card) --- */
  function blackSpot() {
    return {
      name: 'THE BLACK SPOT', boss: false, help: 'Watch where the marked card lands, then TAP it',
      winText: 'Pew\'s cane taps away empty — you have the spot, and the map.',
      loseText: 'Blind Pew\'s cane finds the table before you do.',
      init(api) {
        this.n = 4; this.need = 3; this.round = 0; this.lives = 3;
        this.cw = 50; this.gap = 8;
        this.x0 = (api.W - (this.n * this.cw + (this.n - 1) * this.gap)) / 2;
        this.order = [0, 1, 2, 3]; this.black = 0;
        this.sub = 'show'; this.subT = 1.3; this.swap = null; this.toSwap = 0;
      },
      baseX(api, i) { return this.x0 + i * (this.cw + this.gap); },
      scheduleSwap(api) {
        let a = api.rint(0, this.n - 1), b = api.rint(0, this.n - 1);
        while (b === a) b = api.rint(0, this.n - 1);
        this.swap = { a, b, t: 0, dur: Math.max(0.14, 0.32 - this.round * 0.03) };
      },
      update(api, dt) {
        if (this.sub === 'show') {
          this.subT -= dt;
          if (this.subT <= 0) { this.sub = 'shuffle'; this.toSwap = 3 + this.round * 2; this.scheduleSwap(api); }
        } else if (this.sub === 'shuffle') {
          if (this.swap) {
            this.swap.t += dt;
            if (this.swap.t >= this.swap.dur) {
              const a = this.swap.a, b = this.swap.b, tmp = this.order[a]; this.order[a] = this.order[b]; this.order[b] = tmp;
              this.swap = null; this.toSwap--;
              if (this.toSwap <= 0) this.sub = 'guess'; else this.scheduleSwap(api);
            }
          }
        } else if (this.sub === 'guess') {
          if (api.pointer.justDown) {
            const slot = Math.floor((api.pointer.x - this.x0) / (this.cw + this.gap));
            if (slot >= 0 && slot < this.n) {
              const card = this.order[slot];
              if (card === this.black) {
                api.addScore(30); api.audio.sfx('coin'); api.burst(this.baseX(api, slot) + this.cw / 2, api.H * 0.5, C.gold, 10);
                this.round++;
                if (this.round >= this.need) { api.addScore(60); api.win(); return; }
                this.order = [0, 1, 2, 3]; this.black = api.rint(0, 3); this.sub = 'show'; this.subT = 1.1;
              } else {
                this.lives--; api.shake(5, 0.25); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
                this.sub = 'show'; this.subT = 0.9;
              }
            }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#1c1006'], [0.55, '#241608'], [1, '#0e0804']]);
        g2.glow(W * 0.82, 66, 26, '#ffcf7a', 0.5); c.fillStyle = '#3a2410'; c.fillRect(W * 0.78, 50, 8, 22);
        g2.verticalGradient(0, H * 0.58, W, H * 0.42, [[0, C.wood], [1, C.woodDark]]);
        const cy0 = H * 0.62;
        for (let i = 0; i < this.n; i++) {
          let x = this.baseX(api, i);
          if (this.swap && (i === this.swap.a || i === this.swap.b)) {
            const other = i === this.swap.a ? this.swap.b : this.swap.a;
            x = this.baseX(api, i) + (this.baseX(api, other) - this.baseX(api, i)) * (this.swap.t / this.swap.dur);
          }
          const faceUp = this.sub === 'show' && this.order[i] === this.black;
          g2.roundRect(x, cy0, this.cw, 64, 5, faceUp ? '#1c1008' : C.parchDark, faceUp ? C.gold : '#5a3c1e', faceUp ? 2 : 1);
          if (faceUp) { g2.glow(x + this.cw / 2, cy0 + 32, 20, C.gold, 0.4 + 0.15 * Math.sin(t * 5)); api.txtC('☠', x + this.cw / 2, cy0 + 20, 16, C.blood); }
          else { c.strokeStyle = '#8a6a3a'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 8, cy0 + 8); c.lineTo(x + this.cw - 8, cy0 + 56); c.moveTo(x + this.cw - 8, cy0 + 8); c.lineTo(x + 8, cy0 + 56); c.stroke(); }
        }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(20,12,4,.7)', '#5a3c1e', 1);
        api.txt('ROUND ' + this.round + '/' + this.need, 10, 8, 8, C.gold);
        api.txtCFit('LIVES ' + this.lives, W - 46, 8, 8, C.parchment, false, 82);
        api.vignette();
      },
    };
  }

  /* --- HISPANIOLA p1: THE RIGGING (timing climb) --- */
  function riggingClimb() {
    return {
      name: 'THE RIGGING', boss: false, help: 'TAP when the marker meets the green',
      winText: 'Jim gains the crow\'s nest — and the mast-head view.',
      loseText: 'His grip slips; the deck rushes up.',
      init(api) { this.h = 0; this.need = 10; this.m = 0; this.dir = 1; this.spd = 0.9; this.band = api.has('compass') ? 0.20 : 0.16; this.miss = 0; },
      update(api) {
        this.m += this.dir * this.spd * 0.02; if (this.m > 1) { this.m = 1; this.dir = -1; } if (this.m < 0) { this.m = 0; this.dir = 1; }
        if (api.confirm()) {
          if (Math.abs(this.m - 0.5) < this.band) { this.h++; api.addScore(20); api.audio.sfx('coin'); api.burst(api.W / 2, api.H - 60, C.gold, 6); this.spd = Math.min(1.8, this.spd + 0.08); this.band = Math.max(0.09, this.band - 0.006); if (this.h >= this.need) { api.addScore(50); api.win(); } }
          else { this.miss++; api.shake(5, 0.25); api.audio.sfx('hurt'); if (this.miss >= 4) api.lose(); }
        }
      },
      draw(api) {
        const c = api.ctx, g = api.gfx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        const prog = this.h / this.need;
        g2.skyGradient([[0, C.sky], [1, '#eadfb0']]);
        g2.embers(t, 6, { yBottom: H * 0.5, yTop: 0, color: '#ffffff', speed: 0.05, size: 1, alpha: 0.3 });
        c.fillStyle = C.woodDark; c.fillRect(W / 2 - 4, 0, 8, H);
        for (let i = 0; i < 6; i++) { const ry = H * 0.15 + i * 44 - prog * 30; c.strokeStyle = '#8a6a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(W / 2 - 40, ry); c.lineTo(W / 2 + 40, ry - 6); c.stroke(); c.beginPath(); c.moveTo(W / 2 - 40, ry); c.lineTo(W / 2 - 4, 0); c.moveTo(W / 2 + 40, ry - 6); c.lineTo(W / 2 + 4, 0); c.stroke(); }
        g2.glow(W / 2, 30, 22, '#fff2c0', 0.45 + 0.1 * Math.sin(t * 3));
        c.fillStyle = C.woodDark; c.fillRect(W / 2 - 16, 18, 32, 10);
        const cy = H - 78 - (H - 170) * prog;
        g2.bigSprite(HUNTER, W / 2 - 16, cy, HUNTERPAL, 4, { shadow: true, outline: '#0a0604' });
        const mx = 26, mw = W - 52, my = H - 26;
        g2.roundRect(mx - 4, my - 5, mw + 8, 16, 4, 'rgba(20,12,4,.85)', '#8a6a3a', 1);
        g.rect(mx, my, mw, 6, '#5a3c1e');
        const gz = mx + mw * (0.5 - this.band); g2.glow(gz + mw * this.band, my + 3, 10, '#2effa0', 0.4);
        g.rect(gz, my, mw * this.band * 2, 6, '#1e7a3a');
        g.rect(mx + mw * this.m - 2, my - 3, 4, 12, C.blood);
        api.txtCFit('THE RIGGING', W / 2, 8, 9, C.woodDark);
        api.txtCFit('CLIMB  ' + this.h + '/' + this.need, W / 2, H - 44, 9, C.gold);
        api.vignette();
      },
    };
  }
  /* --- HISPANIOLA p2 (boss): BROADSIDE (aim & fire vs the shadowing sloop) --- */
  function cannonDuel() {
    return {
      name: 'BROADSIDE', boss: true, help: 'DRAG to line up · TAP when the gunport glows',
      winText: 'The shadowing sloop breaks off, smoking, into the swell.',
      loseText: 'Their shot holes the hull below the waterline.',
      init(api) { this.x = api.W / 2; this.hp = 4; this.taken = 0; this.maxTaken = 3; this.shots = []; this.spawnT = 0.7; this.glowT = 1.6; this.strike = false; this.bx = api.W / 2; this.bdir = 1; },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.bx += this.bdir * 22 * dt; if (this.bx < 40 || this.bx > W - 40) this.bdir *= -1;
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.3;
        this.x = clamp(this.x, 16, W - 16);
        this.glowT -= dt; if (this.glowT <= 0) { this.strike = !this.strike; this.glowT = this.strike ? 1.0 : 1.3; }
        this.spawnT -= dt; if (this.spawnT <= 0) { this.shots.push({ x: api.rnd(16, W - 16), y: 96, s: api.rnd(2.3, 3.4) }); this.spawnT = api.rnd(0.5, 0.95); }
        for (const s of this.shots) s.y += s.s * dt * 60;
        this.shots = this.shots.filter((s) => s.y < H + 10);
        const py = H - 70;
        for (const s of this.shots) if (Math.abs(s.x - this.x) < 13 && Math.abs(s.y - py) < 14) { s.y = H + 99; this.taken++; api.shake(6, 0.3); api.flash(C.blood, 0.2); api.audio.sfx('hurt'); if (this.taken >= this.maxTaken) return api.lose(); }
        if (api.pointer.justDown && this.strike && Math.abs(api.pointer.x - this.bx) < 30 && api.pointer.y < 150) { this.hp--; api.addScore(40); api.audio.sfx('shoot'); api.burst(this.bx, 120, C.gold, 12); this.strike = false; this.glowT = 1.1; if (this.hp <= 0) { api.addScore(80); api.win(); } }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#7ec4d8'], [1, '#bfe8ea']], H * 0.42);
        g2.parallax(t * 26, [{ speed: 0.4, draw: (ox) => { c.fillStyle = 'rgba(255,255,255,.5)'; g2.tiled(ox, 90, (x) => { c.beginPath(); c.arc(x + 45, 30, 20, Math.PI, 0); c.fill(); }); } }]);
        g2.mode7({ horizon: H * 0.42, camZ: t * 40, angle: Math.sin(t * 0.4) * 0.15, height: 1.2, fog: '#123a4a', tex: (wx, wz) => ((Math.floor(wx / 46) + Math.floor(wz / 46)) & 1) ? '#2f8b9a' : '#246a78' });
        const cy = 92 + Math.sin(t * 1.4) * 4;
        if (this.strike) g2.glow(this.bx, cy + 20, 36, '#ffcf7a', 0.65); else g2.glow(this.bx, cy + 20, 22, '#2a2018', 0.35);
        g2.bigSprite(SLOOP_BIG, this.bx - 22, cy, SLOOPPAL, 4, { shadow: true, outline: '#0a0604' });
        for (const s of this.shots) { g2.glow(s.x, s.y, 7, '#2a2018', 0.5); c.fillStyle = '#0a0a0a'; c.beginPath(); c.arc(s.x, s.y, 4, 0, 7); c.fill(); }
        g2.bigSprite(SHIP, this.x - 24, H - 108 + Math.sin(t * 3) * 3, SHIPPAL, 6, { shadow: true, outline: '#160a08' });
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,10,16,.7)', '#1c4a5c', 1);
        api.txt('HULL ' + '♥'.repeat(Math.max(0, this.maxTaken - this.taken)), 10, 8, 8, C.blood);
        api.txtCFit('SLOOP ' + this.hp + ' HITS', W - 46, 8, 8, C.parchment, false, 84);
        if (this.strike) api.txtCFit('▸ FIRE! ◂', this.bx, cy - 14, 9, C.gold);
        api.vignette();
      },
    };
  }

  /* --- APPLE BARREL (optional): eavesdrop stealth --- */
  function eavesdrop() {
    return {
      name: 'THE APPLE BARREL', boss: false, help: 'TAP-and-hold to peek — catch their words, duck when they look',
      winText: 'Silver\'s plot is yours — mutiny, and a warning worth its weight.',
      loseText: 'A shadow falls across the barrel-lid — too close.',
      init(api) {
        this.need = api.has('cutlass') ? 9 : 11; this.caught = 0; this.lives = 3; this.time = 22; this.cooldown = 0;
        this.words = []; this.pirates = [{ x: 60, dir: 1, look: 0, lookT: 0 }, { x: 180, dir: -1, look: 1, lookT: 0.6 }];
        for (let i = 0; i < 3; i++) this.spawn(api);
      },
      spawn(api) { this.words.push({ x: api.rnd(24, api.W - 24), y: api.rnd(80, api.H - 110), vx: api.rnd(-0.6, 0.6), vy: api.rnd(-0.6, 0.6) }); },
      update(api, dt) {
        const W = api.W, H = api.H; this.time -= dt; this.cooldown = Math.max(0, this.cooldown - dt);
        const peeking = api.pointer.down;
        for (const p of this.pirates) { p.x += p.dir * 22 * dt; if (p.x < 20 || p.x > W - 20) p.dir *= -1; p.lookT += dt; if (p.lookT > 1.5) { p.look = p.look ? 0 : 1; p.lookT = 0; } }
        const spotted = peeking && this.cooldown <= 0 && this.pirates.some((p) => p.look === 1);
        if (spotted) { this.lives--; this.cooldown = 1.2; api.shake(6, 0.3); api.flash(C.blood, 0.18); api.audio.sfx('hurt'); if (this.lives <= 0) { api.lose(); return; } }
        if (peeking) for (const w of this.words) { w.x += w.vx * 40 * dt; w.y += w.vy * 40 * dt; if (w.x < 16 || w.x > W - 16) w.vx *= -1; if (w.y < 60 || w.y > H - 90) w.vy *= -1; }
        if (peeking && api.pointer.justDown) for (const w of this.words) if (!w.dead && Math.hypot(api.pointer.x - w.x, api.pointer.y - w.y) < 18) { w.dead = true; this.caught++; api.addScore(12); api.audio.sfx('coin'); api.burst(w.x, w.y, '#7dffb0', 6); this.spawn(api); if (this.caught >= this.need) { api.addScore(50); api.win(); return; } break; }
        this.words = this.words.filter((w) => !w.dead);
        if (this.time <= 0) { if (this.caught >= this.need * 0.6) api.win(); else api.lose(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        c.fillStyle = '#4a3018'; c.fillRect(0, 0, W, H);
        for (let x = 10; x < W; x += 26) { c.fillStyle = '#3a2410'; c.fillRect(x, 0, 4, H); }
        c.fillStyle = 'rgba(10,6,2,.35)'; c.fillRect(0, 0, W, H);
        for (const p of this.pirates) { c.fillStyle = p.look ? '#c8342a' : '#1c1006'; c.fillRect(p.x - 8, H * 0.42, 16, 26); c.fillStyle = '#d8b088'; c.fillRect(p.x - 4, H * 0.40, 8, 6); }
        if (api.pointer.down) {
          c.save(); g2.roundRect(30, 60, W - 60, H - 160, 12, null, null); c.clip();
          c.fillStyle = '#8fd8e8'; c.fillRect(30, 60, W - 60, H - 160);
          for (const w of this.words) { c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(w.x, w.y, 4, 0, 7); c.fill(); c.fillStyle = '#1c1006'; c.fillRect(w.x - 1, w.y - 3, 2, 6); }
          c.restore();
          c.strokeStyle = '#5a3c1e'; c.lineWidth = 6; c.strokeRect(30, 60, W - 60, H - 160);
        } else {
          g2.roundRect(30, 60, W - 60, H - 160, 12, '#241608', '#5a3c1e', 4);
          api.txtCFit('HOLD TO PEEK', W / 2, H / 2 - 6, 9, C.parchment);
        }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(20,12,4,.7)', '#5a3c1e', 1);
        api.txt('HEARD ' + this.caught + '/' + this.need, 10, 8, 8, C.gold);
        api.txtCFit('LIVES ' + this.lives + ' · ' + Math.ceil(this.time) + 's', W - 62, 8, 8, C.parchment, false, 96);
        api.vignette();
      },
    };
  }

  /* --- STOCKADE p1: MAN THE WALLS (resource deploy/distribute) --- */
  function deployDefenders() {
    return {
      name: 'MAN THE WALLS', boss: false, help: 'TAP a breach to post a defender there',
      winText: 'The line holds where it matters — the stockade is ready.',
      loseText: 'A breach stands wide open — they are already inside.',
      init(api) {
        this.time = 14; this.done = false;
        this.breaches = [{ label: 'GATE', danger: 3, def: 0 }, { label: 'NORTH WALL', danger: 2, def: 0 }, { label: 'EAST WALL', danger: 2, def: 0 }, { label: 'STOCKHOUSE', danger: 1, def: 0 }];
        this.pool = api.flags.allies ? 6 : 5;
      },
      rects(api) {
        const n = this.breaches.length, bw = (api.W - 40 - 10) / 2, bh = 74, gap = 10, out = [];
        for (let i = 0; i < n; i++) { const col = i % 2, row = Math.floor(i / 2); out.push({ x: 20 + col * (bw + gap), y: 130 + row * (bh + gap), w: bw, h: bh }); }
        return out;
      },
      submit(api) {
        this.done = true;
        let weak = false, cov = 0, danger = 0;
        for (const b of this.breaches) { danger += b.danger; cov += Math.min(b.def, b.danger); if (b.danger >= 2 && b.def === 0) weak = true; }
        api.__prepCoverage = danger ? cov / danger : 0;
        api.addScore(Math.round(api.__prepCoverage * 60));
        if (weak) api.lose(); else api.win();
      },
      update(api, dt) {
        if (this.done) return;
        this.time -= dt;
        if (api.pointer.justDown) {
          const rs = this.rects(api);
          for (let i = 0; i < rs.length; i++) { const r = rs[i]; if (api.pointer.x >= r.x && api.pointer.x <= r.x + r.w && api.pointer.y >= r.y && api.pointer.y <= r.y + r.h) { if (this.pool > 0 && this.breaches[i].def < 3) { this.breaches[i].def++; this.pool--; api.audio.sfx('blip'); } break; } }
        }
        if (this.time <= 0 || this.pool <= 0) this.submit(api);
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
        c.fillStyle = '#1c2a1c'; c.fillRect(0, 0, W, H);
        g2.roundRect(14, 60, W - 28, 56, 8, 'rgba(20,30,16,.7)', '#4a3018', 1);
        api.txtCHead('POST YOUR ' + this.pool + ' DEFENDERS BEFORE THEY LAND', W / 2, 68, 9, C.parchment, false, 12, W - 40);
        const rs = this.rects(api);
        for (let i = 0; i < this.breaches.length; i++) {
          const b = this.breaches[i], r = rs[i], ok = b.def >= b.danger;
          g2.roundRect(r.x, r.y, r.w, r.h, 6, 'rgba(20,16,10,.85)', ok ? '#2effa0' : (b.def > 0 ? C.gold : '#8a3020'), 2);
          api.txtCFit(b.label, r.x + r.w / 2, r.y + 8, 8, C.parchment, false, r.w - 8);
          api.txtCFit('DANGER ' + '▲'.repeat(b.danger), r.x + r.w / 2, r.y + 26, 8, C.blood, false, r.w - 8);
          api.txtCFit('DEFENDERS ' + b.def, r.x + r.w / 2, r.y + 46, 9, ok ? '#2effa0' : C.gold, false, r.w - 8);
        }
        api.txtCFit(Math.ceil(this.time) + 's', W / 2, H - 30, 10, C.parchment);
        api.vignette();
      },
    };
  }
  /* --- STOCKADE p2 (boss): defend the log wall --- */
  function stockadeDefense() {
    return {
      name: 'THE STOCKADE', boss: true, help: 'TAP the breach before they reach the wall',
      winText: 'Dawn breaks over the log wall — the stockade holds.',
      loseText: 'The wall gives, and the yard is overrun.',
      init(api) {
        const cov = api.__prepCoverage == null ? 0.5 : api.__prepCoverage;
        this.warded = 0; this.breaches = 0; this.max = 3 + (api.has('cutlass') ? 1 : 0);
        this.time = 24; this.figs = []; this.spawnT = Math.max(0.4, 0.9 - cov * 0.4); this.cov = cov;
      },
      update(api, dt) {
        const W = api.W, H = api.H; this.time -= dt;
        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          const edge = api.rint(0, 3);
          const p = { x: edge === 0 ? 8 : edge === 1 ? W - 8 : api.rnd(20, W - 20), y: edge < 2 ? api.rnd(60, H - 60) : (edge === 2 ? 40 : H - 40) };
          this.figs.push(p); this.spawnT = api.rnd(0.45, 1.0) * (1 - this.cov * 0.3) * (this.time < 10 ? 0.7 : 1);
        }
        const cx = W / 2, cy = H / 2;
        for (const f of this.figs) { const dx = cx - f.x, dy = cy - f.y, d = Math.hypot(dx, dy) || 1; f.x += dx / d * 24 * dt; f.y += dy / d * 24 * dt; if (Math.hypot(cx - f.x, cy - f.y) < 22) { f.dead = 2; this.breaches++; api.shake(6, 0.3); api.flash(C.blood, 0.2); api.audio.sfx('hurt'); if (this.breaches >= this.max) return api.lose(); } }
        if (api.pointer.justDown) for (const f of this.figs) if (!f.dead && Math.hypot(api.pointer.x - f.x, api.pointer.y - f.y) < 20) { f.dead = 1; this.warded++; api.addScore(15); api.audio.sfx('shoot'); api.burst(f.x, f.y, C.gold, 8); break; }
        this.figs = this.figs.filter((f) => !f.dead);
        if (this.time <= 0) { api.addScore(70); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        c.fillStyle = '#1c2a1c'; c.fillRect(0, 0, W, H);
        for (let x = -20; x < W + 20; x += 34) { c.fillStyle = '#3a2410'; c.fillRect(x, 0, 22, H); c.fillStyle = '#5a3c1e'; c.fillRect(x, 0, 4, H); }
        g2.glow(W / 2, H / 2, 130, '#c88028', 0.22);
        g2.fog(t, { y0: H * 0.5, y1: H, bands: 3, color: '#2a3a20', alpha: 0.08 });
        for (const f of this.figs) { g2.glow(f.x, f.y, 12, C.blood, 0.5); c.fillStyle = '#1c1006'; c.fillRect(f.x - 5, f.y - 6, 10, 12); c.fillStyle = C.blood; c.fillRect(f.x - 2, f.y - 3, 2, 2); c.fillRect(f.x + 1, f.y - 3, 2, 2); }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,10,6,.7)', '#4a3018', 1);
        api.txt('HOLD · ' + Math.ceil(this.time) + 's', 10, 8, 8, C.parchment);
        api.txtCFit('BREACHES ' + this.breaches + '/' + this.max, W - 52, 8, 8, C.blood, false, 96);
        api.vignette();
      },
    };
  }

  /* --- TREASURE p1: BEN GUNN (feed him in order) --- */
  function benGunnBarter() {
    return {
      name: 'BEN GUNN', boss: false, help: 'TAP the food he\'s craving next, in order',
      winText: 'Ben Gunn grins — and points the way to his boat, and the cache.',
      loseText: 'Ben Gunn shies back into the trees, spooked.',
      init(api) {
        this.names = ['CHEESE', 'BISCUIT', 'GOAT'];
        this.want = [0, 1, 2];
        for (let i = 2; i > 0; i--) { const j = api.rint(0, i), tmp = this.want[i]; this.want[i] = this.want[j]; this.want[j] = tmp; }
        this.step = 0; this.lives = api.has('parrot') ? 4 : 3; this.time = 24; this.items = []; this.spawnT = 0.4;
      },
      update(api, dt) {
        const W = api.W, H = api.H; this.time -= dt;
        this.spawnT -= dt; if (this.spawnT <= 0) { this.items.push({ type: api.rint(0, 2), x: -20, y: H * 0.55 + (api.rint(0, 2) - 1) * 34 }); this.spawnT = api.rnd(0.7, 1.1); }
        for (const it of this.items) it.x += 46 * dt;
        this.items = this.items.filter((it) => it.x < W + 24);
        if (api.pointer.justDown) {
          for (const it of this.items) {
            if (!it.dead && Math.hypot(api.pointer.x - it.x, api.pointer.y - it.y) < 20) {
              it.dead = true;
              if (it.type === this.want[this.step]) { this.step++; api.addScore(20); api.audio.sfx('coin'); api.burst(it.x, it.y, C.gold, 8); if (this.step >= this.want.length) { api.addScore(50); api.win(); return; } }
              else { this.lives--; api.shake(5, 0.25); api.audio.sfx('hurt'); if (this.lives <= 0) { api.lose(); return; } }
              break;
            }
          }
        }
        this.items = this.items.filter((it) => !it.dead);
        if (this.time <= 0) api.lose();
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#bfe8ea'], [1, '#e8dca0']], H * 0.6);
        c.fillStyle = C.jungle; c.fillRect(0, H * 0.55, W, H * 0.45);
        for (let x = 0; x < W; x += 24) { c.fillStyle = '#245030'; c.beginPath(); c.arc(x + 12, H * 0.55, 16, Math.PI, 0); c.fill(); }
        g2.bigSprite(['..hh..', '.hffh.', '.hffh.', 'kCCCCk', 'kC..Ck'], 8, H * 0.6, { h: '#3a2818', f: '#c8a878', C: '#5a3c1e', k: '#241608' }, 4, { outline: '#0a0604', shadow: true });
        for (const it of this.items) { const col = it.type === 0 ? '#f0e070' : it.type === 1 ? '#c89050' : '#a86838'; g2.glow(it.x, it.y, 10, col, 0.4); c.fillStyle = col; c.beginPath(); c.arc(it.x, it.y, 8, 0, 7); c.fill(); }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(10,20,12,.7)', '#4a3018', 1);
        api.txt('LIVES ' + this.lives, 10, 8, 8, C.blood);
        api.txtCFit('WANTS ' + this.names[this.want[this.step]], W / 2, H - 34, 10, C.gold);
        api.vignette();
      },
    };
  }
  /* --- TREASURE p2 (boss/final): THE HOARD (hold to dig, drag to dodge) --- */
  function digRace() {
    return {
      name: 'THE HOARD', boss: true, help: 'HOLD at the X to dig · DRAG away to dodge the shots',
      winText: 'The chest breaks open — doubloons enough for ten lifetimes.',
      loseText: 'A shot finds you before the chest is clear.',
      init(api) { this.x = api.W / 2; this.dug = api.has('chart') ? 0.15 : 0; this.lives = api.has('parrot') ? 4 : 3; this.shots = []; this.spawnT = 0.6; },
      update(api, dt) {
        const W = api.W, H = api.H;
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.3;
        this.x = clamp(this.x, 16, W - 16);
        const atSpot = Math.abs(this.x - W / 2) < 22;
        if (api.pointer.down && atSpot) { this.dug += (api.has('cutlass') ? 0.10 : 0.07) * dt; if (this.dug >= 1) { api.addScore(100); api.win(); return; } }
        this.spawnT -= dt; if (this.spawnT <= 0) { this.shots.push({ x: api.rnd(16, W - 16), y: 96, s: api.rnd(2.2, 3.2) }); this.spawnT = api.rnd(0.5, 0.9); }
        for (const s of this.shots) s.y += s.s * dt * 60;
        this.shots = this.shots.filter((s) => s.y < H + 10);
        const py = H - 72;
        for (const s of this.shots) if (Math.abs(s.x - this.x) < 13 && Math.abs(s.y - py) < 14) { s.y = H + 99; this.lives--; api.shake(6, 0.3); api.flash(C.blood, 0.2); api.audio.sfx('hurt'); if (this.lives <= 0) return api.lose(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#f3e6b8'], [1, '#e0c880']], H * 0.4);
        c.fillStyle = '#c9a866'; c.fillRect(0, H * 0.35, W, H * 0.65);
        const pitR = 30 + this.dug * 20;
        c.fillStyle = '#3a2410'; c.beginPath(); c.ellipse(W / 2, H - 74, pitR, pitR * 0.4, 0, 0, 7); c.fill();
        if (this.dug > 0.4) { g2.glow(W / 2, H - 74, 20 + this.dug * 10, C.gold, 0.3 + this.dug * 0.4); c.fillStyle = C.gold; c.fillRect(W / 2 - 8, H - 78, 16, 8); }
        for (const s of this.shots) { g2.glow(s.x, s.y, 7, '#2a2018', 0.5); c.fillStyle = '#0a0a0a'; c.beginPath(); c.arc(s.x, s.y, 4, 0, 7); c.fill(); }
        g2.bigSprite(HUNTER, this.x - 16, H - 108, HUNTERPAL, 4, { shadow: true, outline: '#0a0604' });
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(20,12,4,.7)', '#5a3c1e', 1);
        api.txt('LIVES ' + '♥'.repeat(Math.max(0, this.lives)), 10, 8, 8, C.blood);
        api.txtCFit('DUG ' + Math.round(this.dug * 100) + '%', W - 46, 8, 8, C.gold, false, 84);
        api.vignette();
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'treasureisland16', title: 'X Marks the Spot', subtitle: 'TREASURE ISLAND',
    currency: 'DOUBLOONS', accent: C.gold, ownPhaseHud: true,
    titleFont: TITLE, // bold pixel banner — legible at title size, period 16-bit
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.gold, blood: C.blood, cream: C.parchment, dim: C.woodDark, ink: C.ink },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'CHOOSE THE NEXT COURSE', mapDone: 'THE HOARD IS CLAIMED',
    screens: {
      overlay: 'rgba(8,20,26,.84)', win: '#ffe9a0', lose: '#ff8a70', chapterLabel: '#9fc4c9',
      name: '#f0e6c8', sub: '#ffd25c', intro: '#dcefe6', quote: '#9fc4c9', help: '#ffe9a0',
      score: '#f0e6c8', cur: '#ffd25c', cta: '#f0e6c8',
    },
    labels: {
      chapter: 'STOP', phase: 'PART', boss: 'THE RECKONING', score: 'PLUNDER',
      win: 'CHART CLEARED', lose: 'THE TIDE TAKES YOU', nextPhaseWin: 'GROUND GAINED',
      cont: 'TAP TO PRESS ON', toMap: 'TAP FOR THE CHART', play: 'TAP TO BEGIN',
      nextPhase: 'TAP TO PRESS ON', toFinale: 'TAP FOR THE VOYAGE HOME',
    },
    upgrades: {
      compass: { name: 'THE COMPASS', desc: 'a steadier hand aloft' },
      cutlass: { name: "BILLY BONES' CUTLASS", desc: 'holds the line better' },
      parrot: { name: 'CAPTAIN FLINT', desc: 'one more life' },
      chart: { name: "FLINT'S CHART", desc: 'a head start on the dig' },
    },
    nodes: [
      {
        id: 'inn', name: 'THE INN', sub: 'BLACK HILL COVE', reward: 50, grant: 'compass',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 8, y - 4, 16, 10, C.wood); g.rect(x - 2, y - 10, 1, 6, C.woodDark); api.g2.glow(x + 6, y - 6, 5, '#ffcf7a', 0.5); },
        intro: ['Jim finds Billy Bones\' sea-chest', 'and a folded chart — before', 'Blind Pew\'s cane taps at the door.'],
        quote: 'Ten men dead that I know of are lying under the sod because of that chart.',
        winText: 'Pew\'s cane taps away empty — the map is yours, and the course is set.',
        choice: {
          prompt: 'The map is yours, Jim — what now?',
          hint: 'YOUR COURSE SHAPES HOW THE TALE ENDS',
          options: [
            { label: 'Slip away alone, chart in hand', sub: 'Keep the secret — but earn no one\'s trust', flag: 'alone',
              icon(api, x, y) { const g = api.gfx; g.rect(x - 6, y - 6, 12, 12, C.woodDark); api.txtC('◆', x, y - 5, 8, C.gold); } },
            { label: 'Fetch the Squire and the Doctor', sub: 'Share the secret — and gain steady friends', flag: 'allies',
              icon(api, x, y) { const g = api.gfx; g.rect(x - 8, y - 6, 7, 12, '#1c4a5c'); g.rect(x + 1, y - 6, 7, 12, C.wood); } },
          ],
        },
        phases: [blackSpot()],
      },
      {
        id: 'hispaniola', name: 'THE HISPANIOLA', sub: 'THE VOYAGE', needs: ['inn'], reward: 60, grant: 'cutlass',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 1, y - 10, 2, 14, C.woodDark); g.rect(x + 1, y - 8, 8, 5, C.parchment); },
        intro: ['Southward the schooner runs —', 'but Silver\'s crew have other', 'plans once land is sighted.'],
        quote: 'Them that die\'ll be the lucky ones.',
        winText: 'The crow\'s nest lookout, and a broadside won — Treasure Island rises on the bow.',
        phases: [riggingClimb(), cannonDuel()],
      },
      {
        id: 'barrel', name: 'APPLE BARREL', sub: "SILVER'S PLOT", needs: ['hispaniola'], optional: true, reward: 40, grant: 'parrot',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 7, y - 8, 14, 16, C.wood); g.rect(x - 7, y - 2, 14, 2, C.woodDark); },
        intro: ['Jim hides among the apples', 'and hears Long John Silver', 'plot bloody mutiny.'],
        quote: 'Dead men don\'t bite.',
        winText: 'Silver\'s plot is yours — mutiny, and a warning worth its weight.',
        phases: [eavesdrop()],
      },
      {
        id: 'stockade', name: 'THE STOCKADE', sub: 'SIEGE', needs: ['hispaniola'], reward: 70, grant: 'chart',
        icon(api, x, y) { const g = api.gfx; for (let i = 0; i < 3; i++) g.rect(x - 9 + i * 7, y - 8, 4, 16, '#4a3018'); },
        intro: ['Ashore, the honest few dig in', 'behind a log stockade as', 'Silver\'s men close in.'],
        quote: 'Silver himself led the party that scaled the fence.',
        winText: 'Dawn breaks over the log wall — the stockade holds.',
        phases: [deployDefenders(), stockadeDefense()],
      },
      {
        id: 'treasure', name: "FLINT'S HOARD", sub: 'THE DIG', needs: ['stockade'], reward: 120,
        icon(api, x, y) { api.txtC('X', x, y - 7, 12, C.blood); },
        intro: ['Ben Gunn knows the island\'s', 'secrets. Together they follow', 'the skeleton\'s bony finger.'],
        quote: 'Two hundred years they were leaving that man alone, and they might leave him for two hundred more.',
        winText: 'The chest breaks open — doubloons enough for ten lifetimes.',
        phases: [benGunnBarter(), digRace()],
      },
    ],
    endings: [
      { when: (f) => f.alone, title: 'HOME ALONE, RICH', lines: ['Jim slips away with his share,', 'the secret his and his alone —', 'trusted by no one, needed by none.', '', 'The chart is closed.'] },
      { when: (f) => f.allies, title: 'HOME, AMONG FRIENDS', lines: ['The Squire, the Doctor, and Jim', 'split the hoard three ways —', 'and the tale, told over and over.', '', 'The chart is closed.'] },
      { when: () => true, title: 'THE VOYAGE HOME', lines: ['The Hispaniola turns for England,', 'her hold heavy with doubloons.'] },
    ],
    finale: ['THE CHART IS CLOSED.'],
  });
})();
