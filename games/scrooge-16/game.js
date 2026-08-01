/* ============================================================================
 * A CHRISTMAS CAROL — SCROOGE'S CLOCK   (Gen 2 / 16-bit)
 * Dickens' redemption tale on RetroSaga2: HUB is Scrooge's own bracket clock,
 * its face the map — the midnight/1/2/3 o'clock visitations mounted at their
 * true hour positions around the dial, with dawn breaking below the case for
 * Christmas Morning. A choice at Christmas Present shapes both the finale's
 * difficulty and which ending closes the tale.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    gold: '#e8b84a', goldLight: '#ffe0a0', goldDark: '#a87418',
    ink: '#0a0e18', night: '#101830', nightDeep: '#070a14',
    frost: '#8fd8ff', frostDim: '#3a5a78', spectral: '#c8ecff',
    holly: '#2f7d4a', hollyDark: '#153a22', berry: '#c8283a',
    brass: '#c8a468', brassDark: '#6a5228', wood: '#3a2413', woodDark: '#1c1008',
    cream: '#f0e6cc', dim: '#6a7088', danger: '#e0303a', sun: '#ffcf6a',
  };
  // a warm, blocky pixel display face — fresh for the fleet, legible and just
  // formal enough for a Victorian ghost story without tipping into blackletter.
  const TITLE = "'Rubik Pixels','Press Start 2P',monospace";

  /* ─── emblem: Scrooge's own pocket watch, gold rim + still hands ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(cx, cy, 30, C.gold, 0.3);
    c.fillStyle = C.nightDeep; c.beginPath(); c.arc(cx, cy, 21, 0, 7); c.fill();
    c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, 21, 0, 7); c.stroke();
    c.strokeStyle = C.brass; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, 17, 0, 7); c.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; const x1 = cx + Math.cos(a) * 15, y1 = cy + Math.sin(a) * 15, x2 = cx + Math.cos(a) * 17.5, y2 = cy + Math.sin(a) * 17.5; c.strokeStyle = C.goldLight; c.lineWidth = 1; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
    c.strokeStyle = C.cream; c.lineWidth = 1.6; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - 10); c.stroke();
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + 7, cy - 3); c.stroke();
    c.fillStyle = C.brass; c.beginPath(); c.arc(cx, cy - 24, 2.4, 0, 7); c.fill();
  }

  /* ─── ambient drifting snow ─── */
  function snow(api, t, alpha) {
    const c = api.ctx, W = api.W, H = api.H;
    c.globalAlpha = alpha == null ? 0.55 : alpha;
    for (let i = 0; i < 26; i++) { const seed = i * 53; const x = (seed % W + Math.sin(t * 0.4 + i) * 10 + W) % W; const y = ((t * (12 + (i % 5) * 3) + seed) % (H + 20)) - 10; c.fillStyle = C.cream; c.fillRect(x, y, (i % 4 === 0) ? 2 : 1, (i % 4 === 0) ? 2 : 1); }
    c.globalAlpha = 1;
  }

  /* ─── London night backdrop (intro/result/finale/choice) ─── */
  function londonNight(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, C.nightDeep], [0.6, C.night], [1, '#1a1408']], H);
    for (let i = 0; i < 6; i++) { const bx = (i * 47) % W; const bh = 40 + (i * 29) % 90; c.fillStyle = '#0c0d1a'; c.fillRect(bx, H * 0.72 - bh, 34, bh + H * 0.3); const lit = (i * 7) % 3 === 0; if (lit) { c.fillStyle = C.sun; c.globalAlpha = 0.55; c.fillRect(bx + 10, H * 0.72 - bh + 12, 5, 6); c.globalAlpha = 1; } }
    g2.glow(W * 0.5, H * 0.7, 30, C.gold, 0.12);
    snow(api, t, 0.5);
    if (dim) { c.fillStyle = 'rgba(7,10,20,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }

  /* ─── hub backdrop: Scrooge's bracket clock mounted on the counting-house wall ─── */
  const CLOCK_CX = 135, CLOCK_CY = 215, CLOCK_R = 100;
  function clockFace(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.verticalGradient(0, 0, W, H, [[0, '#151022'], [0.55, '#0c0a16'], [1, C.woodDark]]);
    // faint wallpaper damask
    c.save(); c.globalAlpha = 0.08; c.strokeStyle = C.gold;
    for (let y = 20; y < H; y += 34) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y - 10); c.stroke(); }
    c.restore();
    // the wooden case
    g2.roundRect(CLOCK_CX - CLOCK_R - 14, CLOCK_CY - CLOCK_R - 16, (CLOCK_R + 14) * 2, (CLOCK_R + 16) * 2 + 30, 18, C.wood, C.woodDark, 3);
    g2.roundRect(CLOCK_CX - CLOCK_R - 6, CLOCK_CY - CLOCK_R - 8, (CLOCK_R + 6) * 2, (CLOCK_R + 8) * 2 + 14, 12, C.woodDark, C.brass, 2);
    // the dial
    g2.glow(CLOCK_CX, CLOCK_CY, CLOCK_R + 10, C.gold, 0.1);
    c.fillStyle = '#e9dfc0'; c.beginPath(); c.arc(CLOCK_CX, CLOCK_CY, CLOCK_R, 0, 7); c.fill();
    c.strokeStyle = C.brass; c.lineWidth = 4; c.beginPath(); c.arc(CLOCK_CX, CLOCK_CY, CLOCK_R, 0, 7); c.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 - Math.PI / 2; const x1 = CLOCK_CX + Math.cos(a) * (CLOCK_R - 8), y1 = CLOCK_CY + Math.sin(a) * (CLOCK_R - 8); const x2 = CLOCK_CX + Math.cos(a) * (CLOCK_R - 16), y2 = CLOCK_CY + Math.sin(a) * (CLOCK_R - 16); c.strokeStyle = C.woodDark; c.lineWidth = i % 3 === 0 ? 3 : 1.4; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
    // slow hands (ambient — not a real clock)
    const ha = -Math.PI / 2 + Math.sin(t * 0.06) * 0.4, ma = -Math.PI / 2 + t * 0.1;
    c.strokeStyle = C.woodDark; c.lineCap = 'round';
    c.lineWidth = 4; c.beginPath(); c.moveTo(CLOCK_CX, CLOCK_CY); c.lineTo(CLOCK_CX + Math.cos(ha) * (CLOCK_R * 0.42), CLOCK_CY + Math.sin(ha) * (CLOCK_R * 0.42)); c.stroke();
    c.lineWidth = 2.4; c.beginPath(); c.moveTo(CLOCK_CX, CLOCK_CY); c.lineTo(CLOCK_CX + Math.cos(ma) * (CLOCK_R * 0.62), CLOCK_CY + Math.sin(ma) * (CLOCK_R * 0.62)); c.stroke();
    c.fillStyle = C.gold; c.beginPath(); c.arc(CLOCK_CX, CLOCK_CY, 3, 0, 7); c.fill();
    // the rim track from XII to III (the story's true hours) in gold
    c.strokeStyle = C.goldLight; c.lineWidth = 3; c.globalAlpha = 0.7;
    c.beginPath(); c.arc(CLOCK_CX, CLOCK_CY, CLOCK_R + 3, -Math.PI / 2, 0); c.stroke();
    c.globalAlpha = 1;
    // dawn glow beneath the case, spilling toward the Morning node
    g2.verticalGradient(0, CLOCK_CY + CLOCK_R + 20, W, H - (CLOCK_CY + CLOCK_R + 20), [[0, 'rgba(255,207,106,0)'], [1, 'rgba(255,207,106,.18)']]);
    c.strokeStyle = C.sun; c.lineWidth = 2; c.globalAlpha = 0.35 + 0.1 * Math.sin(t * 1.5);
    c.beginPath(); c.moveTo(CLOCK_NODES_XY.future[0], CLOCK_NODES_XY.future[1]); c.lineTo(CLOCK_NODES_XY.morning[0], CLOCK_NODES_XY.morning[1] - 30); c.stroke();
    c.globalAlpha = 1;
    snow(api, t, 0.3);
  }

  function scenery(api, scene, t) {
    if (scene === 'hub') { clockFace(api, t); return; }
    londonNight(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale' || scene === 'choice') ? 0.28 : 0);
  }

  /* ─── tiny vignettes painted inside each hub node's medallion ─── */
  const ART = {
    marley(api, cx, cy, rad, t) {
      const c = api.ctx;
      c.fillStyle = C.nightDeep; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      c.strokeStyle = C.frost; c.lineWidth = 2;
      const wob = Math.sin(t * 3) * 2;
      c.beginPath(); c.moveTo(cx - rad * 0.5, cy - rad * 0.1 + wob); for (let i = 0; i < 4; i++) c.lineTo(cx - rad * 0.5 + i * rad * 0.28, cy + rad * 0.2 - (i % 2) * 6 + wob); c.stroke();
      c.fillStyle = C.spectral; c.beginPath(); c.arc(cx, cy - rad * 0.25, rad * 0.22, 0, 7); c.fill();
    },
    past(api, cx, cy, rad, t) {
      const c = api.ctx, g2 = api.g2;
      c.fillStyle = '#241a10'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      g2.flame(cx, cy + rad * 0.4, t, 0.7, { outer: '#ffb347', inner: '#ffe0a0' });
      g2.flame(cx - rad * 0.4, cy + rad * 0.45, t + 1, 0.5, { outer: '#ffb347', inner: '#ffe0a0' });
    },
    present(api, cx, cy, rad, t) {
      const c = api.ctx;
      c.fillStyle = C.hollyDark; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      c.fillStyle = C.holly; c.beginPath(); c.ellipse(cx, cy + rad * 0.2, rad * 0.6, rad * 0.28, 0, 0, 7); c.fill();
      c.fillStyle = C.berry; for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(cx + i * rad * 0.28, cy + rad * 0.1, 2.2, 0, 7); c.fill(); }
    },
    future(api, cx, cy, rad, t) {
      const c = api.ctx;
      c.fillStyle = '#050608'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      c.fillStyle = '#1a1f28'; c.beginPath(); c.moveTo(cx - rad * 0.5, cy + rad * 0.5); c.lineTo(cx, cy - rad * 0.4); c.lineTo(cx + rad * 0.5, cy + rad * 0.5); c.closePath(); c.fill();
      const blink = Math.floor(t * 1.2) % 3 === 0;
      c.fillStyle = blink ? C.frost : '#1a2a34'; c.beginPath(); c.arc(cx, cy - rad * 0.05, 2, 0, 7); c.fill();
    },
    morning(api, cx, cy, rad, t) {
      const c = api.ctx, g2 = api.g2;
      g2.glow(cx, cy, rad * 1.1, C.sun, 0.4);
      c.fillStyle = '#3a2a10'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
      c.fillStyle = C.sun; c.beginPath(); c.arc(cx, cy + rad * 0.3, rad * 0.5, Math.PI, 0); c.fill();
      for (let i = 0; i < 6; i++) { const a = Math.PI + i * (Math.PI / 5); c.strokeStyle = C.sun; c.lineWidth = 1.6; c.globalAlpha = 0.7; c.beginPath(); c.moveTo(cx + Math.cos(a) * rad * 0.55, cy + rad * 0.3 + Math.sin(a) * rad * 0.55); c.lineTo(cx + Math.cos(a) * rad * 0.85, cy + rad * 0.3 + Math.sin(a) * rad * 0.85); c.stroke(); }
      c.globalAlpha = 1;
    },
  };

  /* ─── HUB: the clock's true hours, XII → III, then dawn below the case ─── */
  const CLOCK_NODES_XY = {
    marley: [135, 110], past: [188, 124], present: [226, 163], future: [240, 215], morning: [135, 385],
  };
  const ORDER = ['marley', 'past', 'present', 'future', 'morning'];
  const menu = {
    title(api, save, t) {
      const g2 = api.g2, W = api.W;
      g2.ornateFrame(14, 6, W - 28, 32, 8, 'rgba(10,8,18,.88)', C.gold);
      const ti = 'A CHRISTMAS CAROL';
      g2.gleamText(ti, W / 2, 12, api.fitSize(ti, 10, W - 48, 'title'), C.gold, t, { shadow: 'rgba(0,0,0,.6)', gleamSpeed: 55, font: TITLE });
      api.txtCFit('LEDGER  ' + (save.cur || 0), W / 2, 28, 8, C.cream);
    },
    layout() {
      return ORDER.map((id) => { const p = CLOCK_NODES_XY[id], s = id === 'morning' ? 26 : 22; return { x: p[0] - s, y: p[1] - s, w: s * 2, h: s * 2 }; });
    },
    // Labels are drawn in a SEPARATE pass after every medallion (buffered here,
    // flushed on the last node) so a later hour's medallion never paints over an
    // earlier hour's label — the clock face packs hours closer than a grid would.
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, locked, t, i } = info;
      const cx = x + w / 2, cy = y + h / 2, rad = w / 2;
      if (i === 0) menu._labelQueue = [];
      if (sel && !locked) g2.glow(cx, cy, rad * 1.6, C.gold, 0.3 + 0.12 * Math.sin(t * 4));
      c.save(); c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.clip();
      if (!locked && ART[node.id]) ART[node.id](api, cx, cy, rad, t); else { c.fillStyle = '#0a0a12'; c.fillRect(x, y, w, h); }
      c.restore();
      c.strokeStyle = C.woodDark; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, rad + 2, 0, 7); c.stroke();
      c.strokeStyle = locked ? '#3a3a3a' : (done ? C.gold : C.brass); c.lineWidth = 2.4; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.stroke();
      if (locked) { c.fillStyle = 'rgba(6,6,10,.6)'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill(); api.txtC('🔒', cx, cy - 6, 11, '#8a8a8a'); }
      if (done) api.txtC('✓', cx + rad - 3, cy - rad + 1, 9, C.gold);
      menu._labelQueue.push({ id: node.id, name: node.name, cx, ly: y + h + 4, w, locked, done });
      if (i === ORDER.length - 1) {
        for (const L of menu._labelQueue) {
          const maxW = Math.min(L.w + 14, 2 * Math.min(L.cx - 3, api.W - 3 - L.cx));
          g2.roundRect(L.cx - maxW / 2 - 2, L.ly - 2, maxW + 4, 13, 4, '#0a0a12', L.locked ? '#3a3a3a' : C.woodDark, 1);
          api.txtCFit(HUB_LABEL[L.id] || L.name, L.cx, L.ly, 6.5, L.locked ? '#7a7a7a' : (L.done ? C.gold : C.cream), false, maxW);
        }
      }
    },
  };
  const HUB_LABEL = { marley: 'MARLEY', past: 'PAST', present: 'PRESENT', future: 'YET TO COME', morning: 'MORNING' };

  /* ─── animated title screen: a cold London rooftop opening onto the watch ─── */
  function renderBoot(api, info) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    londonNight(api, t, 0);
    emblem(api, W / 2, H * 0.24);
    const title = 'A CHRISTMAS CAROL';
    const ts = api.fitSize(title, 15, W - 20, 'title');
    g2.gleamText(title, W / 2, H * 0.38, ts, C.gold, t, { shadow: 'rgba(0,0,0,.5)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('THREE SPIRITS, ONE NIGHT', W / 2, H * 0.38 + ts + 12, 10, C.frost, true);
    if (info.blink) api.txtCFit('▸ TAP TO ANSWER THE BELL ◂', W / 2, H * 0.66, 11, C.cream);
    api.txtCFit('A 16-BIT TRIBUTE · CHARLES DICKENS, 1843', W / 2, H - 28, 8, C.dim);
    api.vignette(); api.scanlines();
  }

  /* ============================ mini-game phases ============================ */

  /* --- MARLEY'S WARNING: THE GRIP (timing-bar tap against the swinging chain) --- */
  function marleyGrip() {
    return {
      name: 'THE GRIP', boss: false,
      help: 'TAP when the needle sits in the gold band — brace against the chain',
      winText: "Marley's chain rattles once more and falls still. The warning is heard.",
      loseText: 'The chain finds Scrooge unbraced, and the counting-house rings with cold iron.',
      init(api) { this.need = 8; this.hits = 0; this.miss = 0; this.maxMiss = 3; this.pos = 0; this.dir = 1; this.speed = 0.62; },
      update(api, dt) {
        this.pos += this.dir * this.speed * dt;
        if (this.pos >= 1) { this.pos = 1; this.dir = -1; } else if (this.pos <= 0) { this.pos = 0; this.dir = 1; }
        const half = Math.max(0.09, 0.22 - this.hits * 0.013);
        this.zoneHalf = half;
        if (api.pointer.justDown) {
          if (Math.abs(this.pos - 0.5) <= half) {
            this.hits++; api.addScore(18); api.audio.sfx('coin'); api.burst(api.W / 2, api.H * 0.62, C.gold, 8);
            if (this.hits >= this.need) { api.addScore(50); api.win(); return; }
          } else {
            this.miss++; api.shake(5, 0.22); api.flash('#3a1020', 0.15); api.audio.sfx('hurt');
            if (this.miss >= this.maxMiss) { api.lose(); return; }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        londonNight(api, t, 0.35);
        g2.glow(W / 2, H * 0.34, 40 + Math.sin(t * 3) * 6, C.frost, 0.35);
        c.strokeStyle = C.frost; c.lineWidth = 3;
        const wob = Math.sin(t * 4) * 10;
        c.beginPath(); c.moveTo(W * 0.3 + wob, H * 0.3); c.lineTo(W * 0.7 - wob, H * 0.3); c.lineTo(W * 0.6 + wob, H * 0.42); c.stroke();
        c.fillStyle = C.spectral; c.beginPath(); c.arc(W / 2, H * 0.26, 20, 0, 7); c.fill();
        c.fillStyle = C.ink; c.beginPath(); c.arc(W / 2 - 6, H * 0.25, 2, 0, 7); c.fill(); c.beginPath(); c.arc(W / 2 + 6, H * 0.25, 2, 0, 7); c.fill();
        const bx = W / 2 - 60, bw = 120, by = H * 0.68;
        g2.roundRect(bx, by, bw, 16, 5, 'rgba(6,6,12,.8)', C.brass, 1);
        c.fillStyle = C.gold; c.globalAlpha = 0.6; c.fillRect(bx + (0.5 - this.zoneHalf) * bw, by, this.zoneHalf * 2 * bw, 16); c.globalAlpha = 1;
        c.fillStyle = C.cream; c.fillRect(bx + this.pos * bw - 1.5, by - 3, 3, 22);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,12,.7)', C.woodDark, 1);
        api.txt('BRACED ' + this.hits + '/' + this.need, 10, 8, 8, C.gold);
        api.txtCFit('STRUCK ' + this.miss + '/' + this.maxMiss, W - 56, 8, 8, C.danger, false, 96);
        api.vignette();
      },
    };
  }

  /* --- CHRISTMAS PAST: THE CANDLE-KEEP (juggle / defend three memories) --- */
  function candleKeep() {
    return {
      name: 'THE CANDLE-KEEP', boss: false,
      help: 'TAP a guttering candle to relight it before a memory goes dark',
      winText: 'The candles burn steady till dawn threatens — the memories hold their warmth.',
      loseText: 'Too many candles gutter out. The old schoolroom fades back into shadow.',
      init(api) {
        this.time = 22; this.lost = 0; this.maxLost = 2;
        this.candles = [0, 1, 2].map((i) => ({ x: api.W * (0.24 + i * 0.26), fuel: 1, gone: false, gustT: api.rnd(2.2, 4) }));
      },
      update(api, dt) {
        this.time -= dt;
        for (const cd of this.candles) {
          if (cd.gone) continue;
          cd.fuel -= 0.028 * dt;
          cd.gustT -= dt;
          if (cd.gustT <= 0) { cd.fuel -= 0.22; cd.gustT = api.rnd(2.4, 4.2); api.audio.sfx('blip'); }
          if (cd.fuel <= 0) { cd.fuel = 0; cd.gone = true; this.lost++; api.shake(4, 0.2); api.flash('#20304a', 0.15); api.audio.sfx('hurt'); if (this.lost >= this.maxLost) { api.lose(); return; } }
        }
        if (api.pointer.justDown) {
          for (const cd of this.candles) if (!cd.gone && Math.abs(api.pointer.x - cd.x) < 22 && Math.abs(api.pointer.y - api.H * 0.5) < 60) { cd.fuel = 1; api.addScore(6); api.audio.sfx('coin'); api.burst(cd.x, api.H * 0.42, C.gold, 6); break; }
        }
        if (this.time <= 0) { api.addScore(55); api.win(); return; }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        londonNight(api, t, 0.4);
        for (const cd of this.candles) {
          const y = H * 0.5;
          c.fillStyle = C.woodDark; c.fillRect(cd.x - 4, y + 6, 8, 14);
          if (!cd.gone) g2.flame(cd.x, y, t + cd.x, 0.55 + cd.fuel * 0.4, { outer: '#ffb347', inner: '#ffe0a0' });
          else { c.fillStyle = '#3a3a3a'; c.beginPath(); c.arc(cd.x, y, 2, 0, 7); c.fill(); }
          g2.roundRect(cd.x - 16, y + 22, 32, 5, 2, 'rgba(6,6,12,.7)', null);
          c.fillStyle = cd.fuel < 0.3 ? C.danger : C.gold; c.fillRect(cd.x - 15, y + 23, 30 * clamp(cd.fuel, 0, 1), 3);
        }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,12,.7)', C.woodDark, 1);
        api.txt('MEMORIES LOST ' + this.lost + '/' + this.maxLost, 10, 8, 8, C.frost);
        api.txtCFit(Math.ceil(this.time) + 's', W - 30, 8, 8, C.cream, false, 50);
        api.vignette();
      },
    };
  }

  /* --- CHRISTMAS PRESENT: THE CRATCHITS' TABLE (catch/sort deploy) --- */
  function cratchitsTable() {
    return {
      name: "THE CRATCHITS' TABLE", boss: false,
      help: 'TAP a falling gift as it nears the table — let the coal pass by untouched',
      winText: 'The table is set full. Even Tiny Tim laughs, high on his father\'s shoulder.',
      loseText: 'Too many places sit empty — or the coal lands where a gift should be.',
      init(api) {
        this.need = 10; this.got = 0; this.miss = 0; this.maxMiss = 4;
        this.time = api.has('warmth') ? 27 : 22;
        this.lanes = [api.W * 0.22, api.W * 0.5, api.W * 0.78];
        this.items = []; this.spawnT = 0.7;
      },
      update(api, dt) {
        this.time -= dt; this.spawnT -= dt;
        const H = api.H;
        if (this.spawnT <= 0) {
          const bad = api.chance(0.28);
          this.items.push({ x: api.choice(this.lanes), y: -10, type: bad ? 'coal' : 'gift', speed: api.rnd(46, 62) });
          this.spawnT = api.rnd(0.55, 0.85);
        }
        for (const it of this.items) it.y += it.speed * dt;
        if (api.pointer.justDown) {
          for (const it of this.items) {
            if (it.hit) continue;
            if (Math.abs(api.pointer.x - it.x) < 24 && Math.abs(api.pointer.y - it.y) < 90) {
              it.hit = true;
              if (it.type === 'gift') { this.got++; api.addScore(14); api.audio.sfx('coin'); api.burst(it.x, it.y, C.holly, 8); if (this.got >= this.need) { api.addScore(50); api.win(); return; } }
              else { this.miss++; api.shake(4, 0.2); api.flash('#2a1810', 0.14); api.audio.sfx('hurt'); if (this.miss >= this.maxMiss) { api.lose(); return; } }
              break;
            }
          }
        }
        for (const it of this.items) {
          if (it.hit || it.landed) continue;
          if (it.y > H - 34) {
            it.landed = true;
            if (it.type === 'gift') { this.miss++; api.shake(3, 0.15); api.audio.sfx('hurt'); if (this.miss >= this.maxMiss) { api.lose(); return; } }
          }
        }
        this.items = this.items.filter((it) => !it.hit && it.y < H + 20);
        if (this.time <= 0 && this.got < this.need) { api.lose(); return; }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, C.hollyDark], [1, '#0a1a10']]);
        g2.glow(W / 2, H - 30, 60, C.gold, 0.15);
        for (const lx of this.lanes) { c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(lx - 26, 0, 52, H); }
        c.fillStyle = C.wood; c.fillRect(20, H - 30, W - 40, 10);
        for (const it of this.items) {
          if (it.hit) continue;
          if (it.type === 'gift') { c.fillStyle = C.berry; c.beginPath(); c.arc(it.x, it.y, 8, 0, 7); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(it.x - 8, it.y); c.lineTo(it.x + 8, it.y); c.moveTo(it.x, it.y - 8); c.lineTo(it.x, it.y + 8); c.stroke(); }
          else { c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(it.x, it.y, 7, 0, 7); c.fill(); }
        }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,10,.7)', C.woodDark, 1);
        api.txt('GIVEN ' + this.got + '/' + this.need, 10, 8, 8, C.holly);
        api.txtCFit(Math.ceil(this.time) + 's', W - 30, 8, 8, C.cream, false, 50);
        api.vignette();
      },
    };
  }

  /* --- CHRISTMAS YET TO COME p1: THE PHANTOM'S SHADOW (hold-to-creep stealth) --- */
  function phantomShadow() {
    return {
      name: "THE PHANTOM'S SHADOW", boss: false,
      help: 'HOLD to creep toward the far headstone — let go when the pointing hand sweeps near',
      winText: 'The churchyard gate is reached. The Phantom only points on, silent.',
      loseText: 'The sweeping hand finds him. Scrooge freezes under its dreadful point.',
      init(api) {
        this.x = 20; this.goal = api.W - 34; this.time = 26; this.caught = 0;
        this.max = api.has('goodwill') ? 4 : 3; this.state = 'clear'; this.stateT = api.rnd(1.3, 1.9);
      },
      update(api, dt) {
        this.time -= dt; this.stateT -= dt;
        if (this.stateT <= 0) {
          if (this.state === 'clear') { this.state = 'warn'; this.stateT = 0.4; }
          else if (this.state === 'warn') { this.state = 'watch'; this.stateT = api.rnd(0.6, 0.9); }
          else { this.state = 'clear'; this.stateT = api.rnd(1.3, 1.9); }
        }
        const moving = api.pointer.down;
        if (moving) this.x += 66 * dt;
        this.x = clamp(this.x, 20, this.goal);
        if (this.state === 'watch' && moving) {
          this.caught++; api.shake(4, 0.2); api.flash('#0a1830', 0.15); api.audio.sfx('hurt');
          this.state = 'clear'; this.stateT = api.rnd(1.3, 1.9);
          if (this.caught >= this.max) { api.lose(); return; }
        }
        if (this.x >= this.goal) { api.addScore(55); api.win(); return; }
        if (this.time <= 0) { api.lose(); return; }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.skyGradient([[0, '#0a0a14'], [1, '#141420']], H);
        for (let i = 0; i < 5; i++) { const hx = 24 + i * (W - 48) / 4; c.fillStyle = '#1a1a26'; c.fillRect(hx - 8, H * 0.55, 16, 22); c.beginPath(); c.arc(hx, H * 0.55, 8, Math.PI, 0); c.fill(); }
        const watching = this.state === 'watch', warning = this.state === 'warn';
        if (watching) g2.glow(W * 0.7, H * 0.3, 60, C.spectral, 0.22);
        else if (warning) g2.glow(W * 0.7, H * 0.3, 32, C.spectral, 0.12);
        c.fillStyle = watching ? '#2a3a48' : '#1a222c'; c.beginPath(); c.moveTo(W * 0.7 - 14, H * 0.44); c.lineTo(W * 0.7, H * 0.16); c.lineTo(W * 0.7 + 14, H * 0.44); c.closePath(); c.fill();
        const py = H * 0.62;
        c.fillStyle = '#c88450'; c.beginPath(); c.arc(this.x, py, 8, 0, 7); c.fill();
        c.fillStyle = C.woodDark; c.fillRect(this.goal - 6, py - 24, 12, 28);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,12,.7)', C.woodDark, 1);
        api.txtCFit(watching ? 'IT SEES' : (warning ? 'it turns...' : 'creep...'), W / 2, 8, 8, watching ? C.danger : (warning ? C.gold : C.dim));
        api.txt('CAUGHT ' + this.caught + '/' + this.max, 10, H - 18, 8, C.danger);
        api.txtCFit(Math.ceil(this.time) + 's', W - 30, H - 18, 8, C.cream, false, 50);
        api.vignette();
      },
    };
  }

  /* --- CHRISTMAS YET TO COME p2 (boss): THE STONE ITSELF (drag-scrub reveal) --- */
  function stoneItself() {
    return {
      name: 'THE STONE ITSELF', boss: true,
      help: 'DRAG across the frost to scrub the name clear before it creeps back',
      winText: 'The name stands bare in the moonlight. Scrooge has seen enough — he WILL change.',
      loseText: 'The frost thickens faster than it can be cleared. The name stays hidden.',
      init(api) {
        this.clear = 0; this.time = 24; this.scrubRate = api.has('steadyhand') ? 0.62 : 0.44; this.regrow = 0.028;
      },
      update(api, dt) {
        this.time -= dt;
        this.clear = clamp(this.clear - this.regrow * dt, 0, 1);
        if (api.pointer.down && Math.abs(api.pointer.dx) + Math.abs(api.pointer.dy) > 0.2) {
          this.clear = clamp(this.clear + this.scrubRate * dt, 0, 1);
          if (Math.random() < 0.3) api.burst(api.pointer.x, api.pointer.y, C.frost, 2);
        }
        if (this.clear >= 1) { api.addScore(70); api.win(); return; }
        if (this.time <= 0) { api.lose(); return; }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#0a0a14'], [1, '#050508']]);
        g2.glow(W / 2, H * 0.28, 40, C.spectral, 0.15 + 0.05 * Math.sin(t * 1.4));
        const sx = W / 2 - 46, sy = H * 0.36, sw = 92, sh = 130;
        c.fillStyle = '#2a2a30'; c.beginPath(); c.moveTo(sx, sy + sh); c.lineTo(sx, sy + 20); c.arc(sx + sw / 2, sy + 20, sw / 2, Math.PI, 0); c.lineTo(sx + sw, sy + sh); c.closePath(); c.fill();
        c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip();
        const name = 'EBENEZER SCROOGE';
        c.font = "bold 11px 'Pixelify Sans'"; c.textAlign = 'center'; c.textBaseline = 'top';
        c.fillStyle = C.cream;
        const words = name.split(' ');
        words.forEach((w, i) => c.fillText(w, sx + sw / 2, sy + 44 + i * 16));
        c.restore();
        // frost overlay recedes with this.clear
        c.save(); c.beginPath(); c.rect(sx, sy, sw, sh * (1 - this.clear)); c.clip();
        c.fillStyle = 'rgba(200,230,255,.9)'; c.fillRect(sx, sy, sw, sh);
        for (let i = 0; i < 30; i++) { const fx = sx + (i * 37) % sw, fy = sy + (i * 53) % sh; c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(fx, fy, 3, 3); }
        c.restore();
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,6,12,.7)', C.woodDark, 1);
        api.txt('CLEARED ' + Math.round(this.clear * 100) + '%', 10, 8, 8, C.frost);
        api.txtCFit(Math.ceil(this.time) + 's', W - 30, 8, 8, C.cream, false, 50);
        api.vignette();
      },
    };
  }

  /* --- CHRISTMAS MORNING: THE REDEMPTION DASH (3-station timed sequence) --- */
  function redemptionDash() {
    const STATIONS = ['turkey', 'coin', 'greet'];
    return {
      name: 'A CHANGED MAN', boss: false,
      help: 'TAP the instant each window opens — buy the turkey, toss the coin, greet the street',
      winText: 'The turkey is sent ahead, the coin rings in the box, and Fred\'s door stands open at last.',
      loseText: 'The morning slips by half-lived — there is always another Christmas, Scrooge tells himself.',
      init(api) {
        this.station = 0; this.lives = api.has('resolve') ? 2 : 1;
        this.sub = 'wait'; this.t0 = api.rnd(0.6, 1.3);
        this.barPos = 0; this.barDir = 1;
        this.beats = 0; this.beatWin = 0;
      },
      nextStation(api) { this.station++; if (this.station >= STATIONS.length) { api.addScore(70); api.win(); return true; } this.sub = 'wait'; this.t0 = api.rnd(0.5, 1.0); this.barPos = 0; this.barDir = 1; this.beats = 0; return false; },
      fail(api) { this.lives--; api.shake(5, 0.22); api.flash('#2a2010', 0.15); api.audio.sfx('hurt'); if (this.lives <= 0) { api.lose(); return true; } this.sub = 'wait'; this.t0 = api.rnd(0.5, 1.0); this.barPos = 0; this.barDir = 1; this.beats = 0; return false; },
      update(api, dt) {
        const kind = STATIONS[this.station];
        if (kind === 'turkey') {
          if (this.sub === 'wait') { this.t0 -= dt; if (this.t0 <= 0) { this.sub = 'go'; this.t0 = 0.5; } }
          else { this.t0 -= dt; if (api.pointer.justDown) { api.addScore(20); api.audio.sfx('coin'); api.burst(api.W / 2, api.H * 0.5, C.gold, 10); if (this.nextStation(api)) return; } else if (this.t0 <= 0) { if (this.fail(api)) return; } }
        } else if (kind === 'coin') {
          this.barPos += this.barDir * 0.75 * dt; if (this.barPos >= 1) { this.barPos = 1; this.barDir = -1; } else if (this.barPos <= 0) { this.barPos = 0; this.barDir = 1; }
          if (api.pointer.justDown) { if (Math.abs(this.barPos - 0.5) <= 0.16) { api.addScore(20); api.audio.sfx('coin'); api.burst(api.W / 2, api.H * 0.5, C.holly, 10); if (this.nextStation(api)) return; } else { if (this.fail(api)) return; } }
        } else {
          this.t0 -= dt;
          if (this.t0 <= 0) { this.beats++; this.t0 = 0.55; this.beatWin = 0.3; api.audio.sfx('blip'); }
          if (this.beatWin > 0) { this.beatWin -= dt; if (api.pointer.justDown) { this.beatWin = 0; api.addScore(15); api.audio.sfx('select'); api.burst(api.W / 2, api.H * 0.5, C.frost, 6); if (this.beats >= 3) { if (this.nextStation(api)) return; } } }
          if (this.beats >= 5) { if (this.fail(api)) return; }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#ffe0a0'], [0.5, '#ffcf6a'], [1, '#c8961e']]);
        for (let i = 0; i < 5; i++) { const bx = 20 + i * 48; c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(bx, H * 0.5, 30, H * 0.5); }
        const kind = STATIONS[this.station];
        const label = kind === 'turkey' ? 'THE POULTERER' : kind === 'coin' ? 'THE CHARITY BOX' : 'THE STREET';
        api.txtCFit(label, W / 2, H * 0.16, 12, C.wood, 'title');
        if (kind === 'turkey') {
          const go = this.sub === 'go';
          g2.glow(W / 2, H * 0.5, go ? 40 : 22, go ? C.gold : C.brass, go ? 0.5 : 0.2);
          c.fillStyle = go ? C.gold : C.brassDark; c.beginPath(); c.ellipse(W / 2, H * 0.5, 24, 18, 0, 0, 7); c.fill();
          api.txtCFit(go ? 'TAP NOW!' : 'wait for it...', W / 2, H * 0.66, 10, C.wood);
        } else if (kind === 'coin') {
          const bx = W / 2 - 60, bw = 120, by = H * 0.5;
          g2.roundRect(bx, by, bw, 16, 5, 'rgba(60,40,10,.5)', C.woodDark, 1);
          c.fillStyle = C.holly; c.globalAlpha = 0.7; c.fillRect(bx + 0.34 * bw, by, 0.32 * bw, 16); c.globalAlpha = 1;
          c.fillStyle = C.wood; c.fillRect(bx + this.barPos * bw - 1.5, by - 3, 3, 22);
        } else {
          for (let i = 0; i < 3; i++) { const on = i < this.beats; c.fillStyle = on ? C.holly : 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(W / 2 - 24 + i * 24, H * 0.5, 8, 0, 7); c.fill(); }
          api.txtCFit(this.beatWin > 0 ? 'TAP!' : 'greet the street...', W / 2, H * 0.62, 10, C.wood);
        }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(60,40,10,.4)', C.woodDark, 1);
        api.txt('STATION ' + (this.station + 1) + '/3', 10, 8, 8, C.wood);
        api.txtCFit('♥'.repeat(Math.max(0, this.lives)), W - 40, 8, 8, C.berry, false, 70);
        api.vignette();
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'scrooge16', title: 'A Christmas Carol', subtitle: 'THREE SPIRITS',
    currency: 'LEDGER', accent: C.gold, ownPhaseHud: true,
    titleFont: TITLE, uiFont: "'Pixelify Sans','Press Start 2P',monospace",
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.gold, blood: C.danger, cream: C.cream, dim: C.dim, ink: C.ink },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'CHOOSE THE HOUR', mapDone: 'THE NIGHT IS SPENT',
    screens: {
      overlay: 'rgba(10,8,18,.86)', win: C.gold, lose: '#ff9a8a', chapterLabel: C.dim,
      name: C.cream, sub: C.frost, intro: '#e8e0d0', quote: '#5a6078', help: C.frost,
      score: C.cream, cur: C.gold, cta: C.cream,
    },
    labels: {
      chapter: 'WATCH', phase: 'TRIAL', boss: 'THE RECKONING', score: 'DEEDS',
      win: 'THE HOUR IS PAST', lose: 'THE HOUR CLAIMS ITS DUE', nextPhaseWin: 'GROUND HELD',
      cont: 'TAP TO PRESS ON', toMap: 'TAP FOR THE CLOCK', play: 'TAP TO BEGIN',
      nextPhase: 'TAP TO PRESS ON', toFinale: 'TAP FOR THE DAWN',
    },
    upgrades: {
      steadyhand: { name: "MARLEY'S WARNING", desc: 'a steadier hand for what the frost will hide' },
      warmth: { name: 'A CANDLE\'S WARMTH', desc: 'the Cratchits\' table allows a little more time' },
      goodwill: { name: 'GOODWILL EARNED', desc: 'the Phantom\'s sweeping hand is easier to read' },
      resolve: { name: "SCROOGE'S RESOLVE", desc: 'one more chance, come Christmas morning' },
    },
    nodes: [
      {
        id: 'marley', name: "MARLEY'S WARNING", sub: 'MIDNIGHT', reward: 50, grant: 'steadyhand',
        intro: ['The bell tolls, and Marley\'s ghost', 'drags its cash-box chains across', 'the counting-house floor.'],
        quote: 'I wear the chain I forged in life... I made it link by link.',
        winText: "Marley's chain rattles once more and falls still. The warning is heard.",
        phases: [marleyGrip()],
      },
      {
        id: 'past', name: 'CHRISTMAS PAST', sub: 'ONE O\'CLOCK', needs: ['marley'], reward: 55, grant: 'warmth',
        intro: ['A gentle spirit, lit like a candle', 'itself, leads Scrooge back through', 'schoolroom and Fezziwig\'s dance.'],
        quote: 'These are but shadows of the things that have been.',
        winText: 'The candles burn steady till dawn threatens — the memories hold their warmth.',
        phases: [candleKeep()],
      },
      {
        id: 'present', name: 'CHRISTMAS PRESENT', sub: "TWO O'CLOCK", needs: ['past'], reward: 60, grant: 'goodwill',
        intro: ['A great, jolly giant flings open', 'a feast Scrooge cannot buy — and', 'shows him Tiny Tim\'s empty stool.'],
        quote: 'If these shadows remain unaltered by the future, the child will die.',
        winText: 'The table is set full. Even Tiny Tim laughs, high on his father\'s shoulder.',
        choice: {
          prompt: 'The Spirit asks it plainly: when the stool sits empty, what will Scrooge become?',
          hint: 'YOUR ANSWER SHAPES THE HOUR TO COME — AND HOW THE TALE ENDS',
          options: [
            { label: 'Guard the ledger', sub: 'The counting-house is warm enough', flag: 'miser',
              icon(api, x, y) { api.txtC('📒', x, y - 6, 12, C.dim); } },
            { label: 'Open your hand', sub: 'Let the feast make room for one more', flag: 'redeemed',
              icon(api, x, y) { api.g2.flame(x, y + 4, api.t, 0.5, { outer: '#ffb347', inner: '#ffe0a0' }); } },
          ],
        },
        phases: [cratchitsTable()],
      },
      {
        id: 'future', name: 'CHRISTMAS YET TO COME', sub: "THREE O'CLOCK", needs: ['present'], reward: 130, grant: 'resolve',
        intro: ['A silent Phantom, black and pointing,', 'leads Scrooge to a churchyard and', 'a stone he dares not read.'],
        quote: 'Are these the shadows of things that Will be, or that May be, only?',
        winText: 'The name stands bare in the moonlight. Scrooge has seen enough — he WILL change.',
        phases: [phantomShadow(), stoneItself()],
      },
      {
        id: 'morning', name: 'CHRISTMAS MORNING', sub: 'A CHANGED MAN', needs: ['future'], reward: 80,
        intro: ['Scrooge wakes in his own bed, in', 'his own time — and flings the', 'window wide on a laughing city.'],
        quote: 'I will live in the Past, the Present, and the Future... I will not shut out the lessons.',
        winText: 'The turkey is sent ahead, the coin rings in the box, and Fred\'s door stands open at last.',
        phases: [redemptionDash()],
      },
    ],
    endings: [
      { when: (f) => f.redeemed, title: 'A CHANGED MAN', lines: ['Scrooge becomes as good a friend,', 'as good a master, and as good a', 'man as the good old city knew.', '', 'And it was always said of him that', 'he knew how to keep Christmas well.'] },
      { when: (f) => f.miser, title: 'THE LEDGER, RECONCILED', lines: ['The ledger stays open on his desk —', 'but a line is crossed out, and a', 'better one written beneath it.', '', 'Some habits die harder than ghosts,', 'but even Scrooge can change the sum.'] },
      { when: () => true, title: 'GOD BLESS US, EVERY ONE', lines: ['The bells of London ring the story', 'out, year after year, to anyone', 'still counting coins by candlelight.'] },
    ],
    finale: ['THE CLOCK ON THE WALL FALLS SILENT.'],
  });
})();
