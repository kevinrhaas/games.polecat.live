/* ============================================================================
 * ALICE IN WONDERLAND — A DEALT HAND   (Gen 4 / 16-bit)
 * Lewis Carroll's novel on RetroSaga2: HUB is a fanned hand of five playing
 * cards dealt across the felt — the Rabbit Hole, the Hall of Doors, the Mad
 * Tea Party, the Queen's Croquet Ground, and the Trial. A bite of the
 * Caterpillar's mushroom at the Hall of Doors (shrink or grow) shapes both
 * that chapter's pacing and which ending closes the tale.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    heart: '#ff2e5f', heartDeep: '#7a0a24', heartDark: '#4a0616',
    ink: '#150a28', night: '#1c1040', nightDeep: '#0a0518',
    felt: '#0f6b3a', feltDark: '#073d20', feltLight: '#1c9a55',
    gold: '#ffd23f', goldDark: '#c98a10', goldLight: '#fff0b0',
    cyan: '#33e0ff', cyanDeep: '#0a6a86',
    violet: '#b46bff', violetDeep: '#3a1a5c', violetLight: '#dcc0ff',
    pink: '#ff8fd0', pinkDeep: '#8a2a5c',
    cream: '#fff6e0', dim: '#a89bd0', club: '#241a3a',
    grass: '#3ddc73', danger: '#ff4a4a',
  };
  // a tall CRT-terminal pixel face, fresh for the fleet — chosen over the
  // graph-paper "Micro 5 Charted" after that one rendered as illegible
  // hatching at hero-title size (same failure mode as the retired Jacquard
  // blackletter faces).
  const TITLE = "'VT323','Press Start 2P',monospace";
  const UI = "'Pixelify Sans','Press Start 2P',monospace";

  const shuffled = (arr, api) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = api.rint(0, i); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };

  const ALICE_ROWS = ['.yyyy.', 'yyyyyy', '.ffff.', 'b.bb.b', 'bbbbbb', '.bwwb.', '.b..b.', '.k..k.'];
  const ALICE_PAL = { y: '#ffe98a', f: '#ffdcb0', b: '#3aa8ff', w: '#ffffff', k: '#241a3a' };
  const SIZE_SCALE = { small: 1.6, normal: 3, big: 5.2 };

  function drawAliceBig(api, x, y, scale, opts) {
    api.g2.bigSprite(ALICE_ROWS, x, y, ALICE_PAL, scale, opts || { outline: true, shadow: true });
  }

  /* ─── emblem: the White Rabbit's own watch, and a grin that lingers ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2, t = api.t || cy;
    g2.glow(cx, cy, 30, C.gold, 0.28);
    c.fillStyle = C.cream; c.beginPath(); c.arc(cx, cy, 20, 0, 7); c.fill();
    c.strokeStyle = C.goldDark; c.lineWidth = 3; c.stroke();
    c.strokeStyle = C.gold; c.lineWidth = 1.4;
    c.beginPath(); c.arc(cx, cy, 16, 0, 7); c.stroke();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); c.lineTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16); c.stroke(); }
    const ha = t * 1.4, hb = t * 0.18;
    c.strokeStyle = C.club; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(hb) * 10, cy + Math.sin(hb) * 10); c.stroke();
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ha) * 7, cy + Math.sin(ha) * 7); c.stroke();
    // a floating Cheshire grin, off to one side
    const gx = cx + 30, gy = cy - 6 + Math.sin(t * 1.2) * 3;
    c.globalAlpha = 0.55 + 0.25 * Math.sin(t * 2);
    c.strokeStyle = C.violetLight; c.lineWidth = 2.4;
    c.beginPath(); c.arc(gx, gy, 9, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
    c.globalAlpha = 1;
  }

  /* ─── bright Wonderland sky (intro/result/finale/choice) ─── */
  function wonderlandSky(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, '#3ac8ff'], [0.5, '#8fdfff'], [1, C.violetLight]], H * 0.62);
    g2.verticalGradient(0, H * 0.58, W, H * 0.42, [[0, C.grass], [1, '#0f7a34']]);
    for (let i = 0; i < 4; i++) {
      const bx = ((t * 8 + i * 82) % (W + 60)) - 30, by = 30 + i * 26;
      c.fillStyle = 'rgba(255,255,255,0.9)';
      c.beginPath(); c.arc(bx, by, 15, 0, 7); c.arc(bx + 15, by - 5, 11, 0, 7); c.arc(bx + 27, by, 10, 0, 7); c.fill();
    }
    const fcol = [C.pink, C.gold, C.cyan, C.violet, C.heart];
    for (let i = 0; i < 6; i++) {
      const fx = 16 + i * 44, fy = H * 0.6 + 6;
      c.fillStyle = C.grass; c.fillRect(fx - 1, fy - 12, 2, 14);
      c.fillStyle = fcol[i % fcol.length]; c.beginPath(); c.arc(fx, fy - 14, 5, 0, 7); c.fill();
      c.fillStyle = C.cream; c.beginPath(); c.arc(fx, fy - 14, 2, 0, 7); c.fill();
    }
    g2.glow(W * 0.82, H * 0.6, 20, C.violetDeep, 0.5);
    c.fillStyle = C.nightDeep; c.beginPath(); c.ellipse(W * 0.82, H * 0.6, 16, 10, 0, 0, 7); c.fill();
    if (dim) { c.fillStyle = 'rgba(10,4,20,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }

  /* ─── hub backdrop: green felt with drifting suit motifs ─── */
  function cardTable(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.verticalGradient(0, 0, W, H, [[0, C.feltLight], [0.5, C.felt], [1, C.feltDark]]);
    c.strokeStyle = 'rgba(255,255,255,.06)'; c.lineWidth = 1;
    for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(W / 2, H * 0.6, 30 + i * 24, 0, 7); c.stroke(); }
    const pips = ['♥', '♦', '♣', '♠'], pcol = [C.heart, C.gold, C.club, C.club];
    for (let i = 0; i < 10; i++) {
      const px = (i * 53 + 20) % W, py = H - ((t * 16 + i * 61) % (H + 30));
      c.globalAlpha = 0.16; c.fillStyle = pcol[i % 4]; c.font = '12px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(pips[i % 4], px, py); c.globalAlpha = 1;
    }
    c.fillStyle = C.goldDark; c.fillRect(0, H - 14, W, 14);
    c.fillStyle = C.gold; c.fillRect(0, H - 14, W, 2);
  }

  function scenery(api, scene, t) {
    if (scene === 'hub') { cardTable(api, t); return; }
    wonderlandSky(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale' || scene === 'choice') ? 0.4 : 0);
  }

  /* ─── card-hand hub layout ─── */
  const ORDER = ['hole', 'doors', 'teaparty', 'croquet', 'trial'];
  const CARD_W = 56, CARD_H = 78;
  const NODE_XY = { hole: [32, 286], doors: [84, 297], teaparty: [136, 300], croquet: [188, 297], trial: [240, 286] };
  const ROT = { hole: -0.28, doors: -0.14, teaparty: 0, croquet: 0.14, trial: 0.28 };
  const SUIT = { hole: '♠', doors: '♦', teaparty: '♣', croquet: '♥', trial: '♛' };
  const SUIT_COL = { hole: C.club, doors: C.heart, teaparty: C.club, croquet: C.heart, trial: C.gold };
  const HUB_LABEL = { hole: 'RABBIT HOLE', doors: 'HALL OF DOORS', teaparty: 'TEA PARTY', croquet: 'CROQUET GROUND', trial: 'THE TRIAL' };

  /* ─── tiny vignettes painted inside each card's window ─── */
  const ART = {
    hole(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = C.nightDeep; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.save(); c.beginPath(); c.rect(cx - w / 2, cy - h / 2, w, h); c.clip();
      c.strokeStyle = 'rgba(180,140,255,.5)'; c.lineWidth = 1.4;
      for (let i = 0; i < 4; i++) { const r = ((t * 10 + i * 9) % 24) + 2; c.beginPath(); c.arc(cx, cy - 4, r, 0, 7); c.stroke(); }
      c.restore();
      c.fillStyle = C.cream; c.beginPath(); c.arc(cx + Math.sin(t) * 4, cy - 6 + (t * 6) % (h * 0.7), 3, 0, 7); c.fill();
    },
    doors(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = '#241436'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.fillStyle = C.goldDark; c.fillRect(cx - 8, cy - 16, 16, 30);
      c.fillStyle = C.gold; c.fillRect(cx - 8, cy - 16, 16, 3);
      c.fillStyle = C.club; c.beginPath(); c.arc(cx + 4, cy - 2, 1.6, 0, 7); c.fill();
      const flick = 0.5 + 0.5 * Math.sin(t * 3);
      c.fillStyle = C.cyan; c.globalAlpha = 0.7; c.fillRect(cx - w / 2 + 5, cy + h / 2 - 16, 6, 10 * flick);
      c.fillStyle = C.pink; c.fillRect(cx + w / 2 - 12, cy + h / 2 - 14, 8, 6);
      c.globalAlpha = 1;
    },
    teaparty(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = '#2a1240'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.fillStyle = C.cream; c.fillRect(cx - 10, cy + 2, 20, 12);
      c.fillStyle = C.pink; c.fillRect(cx - 10, cy + 2, 20, 3);
      c.fillStyle = C.cream; c.fillRect(cx + 9, cy + 4, 5, 6);
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1;
      const r = 4 + ((t * 12) % 14);
      c.globalAlpha = clamp(1 - r / 18, 0, 1); c.beginPath(); c.arc(cx, cy + 2, r, 0, 7); c.stroke(); c.globalAlpha = 1;
      c.fillStyle = C.club; c.fillRect(cx - 8, cy - h / 2 + 6, 16, 8); c.fillRect(cx - 5, cy - h / 2 - 2, 10, 10);
    },
    croquet(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = '#123a1c'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.strokeStyle = C.heart; c.lineWidth = 2.4;
      c.beginPath(); c.moveTo(cx - 10, cy + 14); c.lineTo(cx - 10, cy - 6); c.stroke();
      c.beginPath(); c.moveTo(cx + 10, cy + 14); c.lineTo(cx + 10, cy - 6); c.stroke();
      c.fillStyle = C.pink;
      const bob = Math.sin(t * 2) * 2;
      c.save(); c.translate(cx + 8, cy - 12 + bob); c.rotate(-0.4);
      c.beginPath(); c.ellipse(0, 0, 6, 4, 0, 0, 7); c.fill(); c.restore();
      c.fillStyle = '#8a6a4a'; c.beginPath(); c.arc(cx - 2, cy + h / 2 - 10, 6, 0, 7); c.fill();
    },
    trial(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = C.heartDark; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.fillStyle = C.gold;
      for (let j = 0; j < 3; j++) c.fillRect(cx - 9 + j * 8, cy - 18, 5, 10);
      c.fillRect(cx - 11, cy - 10, 22, 4);
      c.fillStyle = C.heart; c.font = '16px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('♥', cx, cy + 10);
      const flick = 0.6 + 0.4 * Math.sin(t * 6);
      c.globalAlpha = flick * 0.5; c.strokeStyle = C.gold; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, w * 0.42, 0, 7); c.stroke(); c.globalAlpha = 1;
    },
  };

  const menu = {
    title(api, save, t) {
      const g2 = api.g2, W = api.W;
      g2.ornateFrame(14, 6, W - 28, 32, 8, 'rgba(20,8,30,.85)', C.gold);
      const ti = 'ALICE IN WONDERLAND';
      g2.gleamText(ti, W / 2, 12, api.fitSize(ti, 10, W - 48, 'title'), C.gold, t, { shadow: 'rgba(0,0,0,.6)', gleamSpeed: 55, font: TITLE });
      api.txtCFit('CURIOSITY  ' + (save.cur || 0), W / 2, 28, 8, C.cream);
    },
    layout() {
      return ORDER.map((id) => { const p = NODE_XY[id]; return { x: p[0] - CARD_W / 2, y: p[1] - CARD_H / 2, w: CARD_W, h: CARD_H }; });
    },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, t, i } = info;
      const cx = x + w / 2, cy = y + h / 2, rot = ROT[node.id];
      if (i === 0) menu._labelQueue = [];
      if (sel) g2.glow(cx, cy, Math.max(w, h) * 0.8, C.gold, 0.26 + 0.1 * Math.sin(t * 4));
      c.save();
      c.translate(cx, cy); c.rotate(rot); c.translate(-w / 2, -h / 2);
      // shadow + face
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(3, 4, w, h);
      c.fillStyle = sel ? '#fffdf4' : C.cream;
      const r = 5;
      c.beginPath(); c.moveTo(r, 0); c.lineTo(w - r, 0); c.arcTo(w, 0, w, r, r);
      c.lineTo(w, h - r); c.arcTo(w, h, w - r, h, r);
      c.lineTo(r, h); c.arcTo(0, h, 0, h - r, r);
      c.lineTo(0, r); c.arcTo(0, 0, r, 0, r); c.closePath(); c.fill();
      c.strokeStyle = sel ? C.gold : '#c8bca0'; c.lineWidth = sel ? 2.2 : 1; c.stroke();
      // suit corners
      c.fillStyle = SUIT_COL[node.id]; c.font = 'bold 10px serif'; c.textAlign = 'left'; c.textBaseline = 'top';
      c.fillText(SUIT[node.id], 4, 3);
      c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText(SUIT[node.id], w - 4, h - 3);
      // vignette window
      c.save(); c.beginPath(); c.rect(6, 14, w - 12, h - 30); c.clip();
      ART[node.id](api, w / 2, 14 + (h - 30) / 2, w - 12, h - 30, t);
      c.restore();
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.strokeRect(6, 14, w - 12, h - 30);
      if (done) { c.fillStyle = C.grass; c.beginPath(); c.arc(w - 11, h - 10, 6, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = 'bold 8px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('✓', w - 11, h - 9); }
      c.restore();
      menu._labelQueue.push({ id: node.id, cx, ly: y + h + 4, w, done });
      if (i === ORDER.length - 1) {
        for (const L of menu._labelQueue) {
          const maxW = Math.min(L.w + 18, 2 * Math.min(L.cx - 3, api.W - 3 - L.cx));
          g2.roundRect(L.cx - maxW / 2 - 2, L.ly - 2, maxW + 4, 13, 4, 'rgba(6,20,10,.7)', L.done ? C.grass : C.goldDark, 1);
          api.txtCFit(HUB_LABEL[L.id] || L.id, L.cx, L.ly, 6.5, L.done ? C.grass : C.cream, false, maxW);
        }
      }
    },
  };

  /* ─── animated title screen: a card comes fanning out of the burrow ─── */
  function renderBoot(api, info) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    wonderlandSky(api, t, 0);
    emblem(api, W / 2, H * 0.22);
    const title = 'ALICE IN WONDERLAND';
    const ts = api.fitSize(title, 13, W - 20, 'title');
    g2.gleamText(title, W / 2, H * 0.36, ts, C.heart, t, { shadow: 'rgba(0,0,0,.5)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('A DEALT HAND OF FIVE TALES', W / 2, H * 0.36 + ts + 12, 10, C.violetDeep, true);
    if (info.blink) api.txtCFit('▸ TAP TO TUMBLE IN ◂', W / 2, H * 0.64, 11, C.cream);
    api.txtCFit('AFTER LEWIS CARROLL, 1865', W / 2, H - 28, 8, C.dim);
    api.vignette(); api.scanlines();
  }

  /* ============================ mini-game phases ============================ */

  /* --- THE RABBIT HOLE: DOWN, DOWN, DOWN (fall + dodge + size pickups) --- */
  function rabbitFall() {
    return {
      name: 'DOWN, DOWN, DOWN', boss: false,
      help: 'STEER through the gaps! DRINK ME to shrink, EAT ME to smash!',
      winText: 'The bottom at last! A tiny door, and a golden key on a glass table.',
      loseText: 'The walls rush past too fast. She tumbles, lost in the dark.',
      init(api) {
        const W = api.W;
        this.alice = { x: W / 2, vx: 0 };
        this.walls = []; this.items = []; this.bg = [];
        this.depth = 0; this.speed = 1.4; this.sizeState = 'normal'; this.sizeT = 0;
        this.spawnT = 0; this.msg = ''; this.msgT = 0; this.lives = 3; this.flashT = 0;
        for (let i = 0; i < 8; i++) this.bg.push({ x: api.rnd(0, W), y: api.rnd(0, api.H), spin: api.rnd(0, 6.28) });
      },
      update(api, dt) {
        const W = api.W, H = api.H, aliceY = H * 0.34;
        const aw = this.sizeState === 'small' ? 9 : this.sizeState === 'big' ? 26 : 16;
        const ah = this.sizeState === 'small' ? 11 : this.sizeState === 'big' ? 30 : 18;
        if (api.keyDown('left')) this.alice.vx -= 0.7;
        if (api.keyDown('right')) this.alice.vx += 0.7;
        if (api.pointer.down) { const dx = api.pointer.x - this.alice.x; if (Math.abs(dx) > 8) this.alice.vx += clamp(dx * 0.08, -0.7, 0.7); }
        if (!api.keyDown('left') && !api.keyDown('right') && !api.pointer.down) this.alice.vx *= 0.84;
        this.alice.vx = clamp(this.alice.vx, -3.5, 3.5);
        this.alice.x = clamp(this.alice.x + this.alice.vx, aw / 2, W - aw / 2);
        this.speed = clamp(1.4 + this.depth / 900, 1.4, 4.2);
        this.depth += this.speed * 0.6;
        api.score = Math.floor(this.depth);
        if (this.sizeState !== 'normal') { this.sizeT -= dt; if (this.sizeT <= 0) { this.sizeState = 'normal'; this.msg = 'BACK TO NORMAL'; this.msgT = 1; } }
        this.spawnT -= this.speed;
        if (this.spawnT <= 0) {
          this.spawnT = api.rint(54, 78);
          const gapW = clamp(64 - Math.floor(this.depth / 120) * 3, 34, 64);
          const gapX = api.rint(10, W - gapW - 10);
          this.walls.push({ y: H + 10, gapX, gapW, fragile: api.chance(0.25), hit: false });
          if (api.chance(0.8)) {
            const r = Math.random();
            const kind = r < 0.34 ? 'key' : r < 0.6 ? 'drink' : r < 0.78 ? 'cake' : 'hazard';
            this.items.push({ x: api.rnd(20, W - 20), y: H + api.rint(30, 70), kind, got: false, vx: kind === 'hazard' ? api.rnd(-0.6, 0.6) : 0 });
          }
        }
        for (const b of this.bg) { b.y -= this.speed * 0.5; b.spin += 0.02; if (b.y < -10) { b.y = H + 10; b.x = api.rnd(0, W); } }
        const ab = { x: this.alice.x - aw / 2, y: aliceY - ah / 2, w: aw, h: ah };
        for (const wl of this.walls) {
          wl.y -= this.speed;
          if (wl.hit) continue;
          if (aliceY + ah / 2 > wl.y && aliceY - ah / 2 < wl.y + 8) {
            const inGap = ab.x > wl.gapX && ab.x + ab.w < wl.gapX + wl.gapW;
            if (!inGap) {
              if (this.sizeState === 'big' && wl.fragile) { wl.hit = true; api.audio.sfx('explode'); api.burst(this.alice.x, wl.y, C.pink, 8); this.msg = 'SMASH!'; this.msgT = 1; }
              else {
                this.lives--; this.flashT = 0.4; api.audio.sfx('hurt'); api.shake(5, 0.25); wl.hit = true;
                this.msg = 'OUCH! ' + this.lives + ' LEFT'; this.msgT = 1.2;
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          }
        }
        for (const it of this.items) {
          it.y -= this.speed;
          if (it.kind === 'hazard') it.x = clamp(it.x + it.vx, 10, W - 10);
          if (it.got) continue;
          if (ab.x < it.x + 7 && ab.x + ab.w > it.x - 7 && ab.y < it.y + 7 && ab.y + ab.h > it.y - 7) {
            if (it.kind === 'key') { it.got = true; api.addScore(30); api.audio.sfx('coin'); api.burst(it.x, it.y, C.gold, 8); this.msg = '+KEY!'; this.msgT = 1; }
            else if (it.kind === 'drink') { it.got = true; this.sizeState = 'small'; this.sizeT = 5.5; api.audio.sfx('power'); this.msg = 'DRINK ME!'; this.msgT = 1; }
            else if (it.kind === 'cake') { it.got = true; this.sizeState = 'big'; this.sizeT = 5.5; api.audio.sfx('power'); this.msg = 'EAT ME!'; this.msgT = 1; }
            else {
              if (this.sizeState !== 'big') { this.lives--; this.flashT = 0.4; api.audio.sfx('hurt'); api.shake(4, 0.2); it.got = true; if (this.lives <= 0) { api.lose(); return; } }
              else { it.got = true; api.burst(it.x, it.y, C.violet, 6); }
            }
          }
        }
        this.walls = this.walls.filter((w) => w.y > -14);
        this.items = this.items.filter((i) => i.y > -14 && !i.got);
        if (this.msgT > 0) this.msgT -= dt;
        if (this.flashT > 0) this.flashT -= dt;
        if (this.depth >= 500) { api.addScore(100); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, aliceY = H * 0.34;
        g2.verticalGradient(0, 0, W, H, [[0, C.violetDeep], [0.55, C.nightDeep], [1, '#03010a']]);
        c.strokeStyle = 'rgba(180,140,255,.2)'; c.lineWidth = 2;
        for (let i = 0; i < 6; i++) { const r = (this.depth * 0.6 + i * 40) % 240; c.beginPath(); c.arc(W / 2, aliceY, r, 0, 7); c.stroke(); }
        c.globalAlpha = 0.4;
        for (const b of this.bg) { c.fillStyle = C.gold; c.fillRect(b.x - 2, b.y - 2, 4, 4); }
        c.globalAlpha = 1;
        for (const wl of this.walls) {
          if (wl.hit) continue;
          const col = wl.fragile ? C.pinkDeep : C.violetDeep, top = wl.fragile ? C.pink : C.violetLight;
          c.fillStyle = col; c.fillRect(0, wl.y, wl.gapX, 8); c.fillStyle = top; c.fillRect(0, wl.y, wl.gapX, 2);
          c.fillStyle = col; c.fillRect(wl.gapX + wl.gapW, wl.y, W - (wl.gapX + wl.gapW), 8);
          c.fillStyle = top; c.fillRect(wl.gapX + wl.gapW, wl.y, W - (wl.gapX + wl.gapW), 2);
        }
        for (const it of this.items) {
          if (it.got) continue;
          if (it.kind === 'key') { c.fillStyle = C.gold; c.fillRect(it.x - 1, it.y - 5, 2, 8); c.fillRect(it.x - 4, it.y + 1, 8, 2); c.beginPath(); c.arc(it.x, it.y - 5, 3, 0, 7); c.fill(); }
          else if (it.kind === 'drink') { c.fillStyle = C.cyan; c.fillRect(it.x - 4, it.y - 6, 8, 12); c.fillStyle = '#cfeeff'; c.fillRect(it.x - 2, it.y - 9, 4, 3); }
          else if (it.kind === 'cake') { c.fillStyle = C.pink; c.fillRect(it.x - 6, it.y - 4, 12, 8); c.fillStyle = '#ffe0f0'; c.fillRect(it.x - 6, it.y - 6, 12, 3); }
          else { c.fillStyle = C.cream; c.fillRect(it.x - 5, it.y - 7, 10, 14); c.fillStyle = C.heart; c.fillRect(it.x - 5, it.y - 7, 10, 2); }
        }
        const s = SIZE_SCALE[this.sizeState] * 0.5;
        if (!(this.flashT > 0 && Math.floor(t * 12) % 2 === 0)) drawAliceBig(api, this.alice.x - 3 * s, aliceY - 4 * s, s, { outline: true });
        const pct = Math.min(1, this.depth / 500);
        g2.roundRect(W - 12, 22, 6, H - 44, 3, 'rgba(0,0,0,.5)', null);
        g2.roundRect(W - 12, 22 + (1 - pct) * (H - 44), 6, pct * (H - 44), 3, C.grass, null);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,4,16,.7)', C.violetDeep, 1);
        api.txt('DEPTH ' + Math.floor(this.depth) + 'm', 10, 8, 8, C.cyan);
        let hearts = ''; for (let i = 0; i < this.lives; i++) hearts += '♥';
        api.txtCFit(hearts, W - 46, 8, 8, C.heart, false, 40);
        if (this.sizeState !== 'normal') api.txtCFit(this.sizeState === 'small' ? 'TINY!' : 'HUGE!', W / 2, 8, 8, this.sizeState === 'small' ? C.cyan : C.pink, false, 60);
        if (this.flashT > 0) { c.globalAlpha = this.flashT * 0.8; c.fillStyle = C.heart; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
        if (this.msgT > 0 && this.msg) api.txtCFit(this.msg, W / 2, aliceY - 38, 9, C.gold);
        api.vignette(); api.scanlines();
      },
    };
  }

  /* --- THE HALL OF DOORS: match your size before the door shuts --- */
  function sizeDoors() {
    const SIZES = ['small', 'normal', 'big'];
    return {
      name: 'THE HALL OF DOORS', boss: false,
      help: 'TAP DRINK ME · WAIT · EAT ME — match the size before the door shuts',
      winText: 'The last door swings open onto a garden of bright flowers.',
      loseText: 'Wrong size, wrong door — the hall spins and swallows every key.',
      init(api) {
        this.need = 10;
        this.queue = []; for (let i = 0; i < this.need; i++) this.queue.push(SIZES[api.rint(0, 2)]);
        this.idx = 0; this.cur = 'normal';
        this.timeLimit = 2.4; this.timeLeft = this.timeLimit;
        this.mistakes = 0; this.maxMistakes = 4 + (api.flags.bold ? 1 : 0);
        this.graceBonus = (api.flags.curious ? 0.4 : 0) + (api.has('goldenkey') ? 0.3 : 0);
        this.flashT = 0; this.msg = ''; this.msgT = 0; this.puffT = 0;
        this.roundTime = () => Math.max(1.1, this.timeLimit - this.idx * 0.08) + this.graceBonus;
        this.timeLeft = this.roundTime();
      },
      resolve(api, ok) {
        if (ok) { this.idx++; api.addScore(24); api.audio.sfx('coin'); api.burst(api.W / 2, api.H * 0.42, C.gold, 8); this.msg = 'THROUGH!'; this.msgT = 0.6; }
        else {
          this.mistakes++; api.shake(4, 0.2); api.flash('#3a0a20', 0.15); api.audio.sfx('hurt');
          this.msg = ok === false ? 'WRONG SIZE!' : 'TOO SLOW!'; this.msgT = 0.7; this.idx++;
        }
        if (this.mistakes >= this.maxMistakes) { api.lose(); return; }
        if (this.idx >= this.need) { api.addScore(70); api.win(); return; }
        this.timeLeft = this.roundTime(); this.cur = 'normal';
      },
      update(api, dt) {
        if (this.msgT > 0) this.msgT -= dt;
        if (this.flashT > 0) this.flashT -= dt;
        this.puffT += dt;
        const W = api.W, H = api.H, by = H - 70;
        this.timeLeft -= dt;
        if (api.pointer.justDown && api.pointer.y > by - 34) {
          const third = api.pointer.x < W / 3 ? 0 : api.pointer.x < (2 * W) / 3 ? 1 : 2;
          this.cur = SIZES[third];
          const need = this.queue[this.idx];
          this.resolve(api, this.cur === need);
        } else if (this.timeLeft <= 0) {
          this.resolve(api, null);
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#241234'], [1, '#120a20']]);
        // caterpillar on a mushroom, upper-left, puffing rings
        const mx = 36, my = 74;
        c.fillStyle = C.grass; c.beginPath(); c.ellipse(mx, my, 16, 6, 0, 0, 7); c.fill();
        c.fillStyle = C.violet; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(mx - 12 + i * 8, my - 4, 5, 0, 7); c.fill(); }
        c.fillStyle = C.violetLight; c.beginPath(); c.arc(mx + 20, my - 6, 4, 0, 7); c.fill();
        const pr = (this.puffT * 8) % 18;
        c.globalAlpha = clamp(1 - pr / 18, 0, 0.6); c.strokeStyle = C.cream; c.lineWidth = 1;
        c.beginPath(); c.arc(mx + 26, my - 10 - pr, 3 + pr * 0.3, 0, 7); c.stroke(); c.globalAlpha = 1;
        // upcoming queue preview
        for (let i = 0; i < 4; i++) {
          const qi = this.idx + i; if (qi >= this.need) break;
          const s = this.queue[qi], qx = W - 40 - i * 26, qy = 30;
          g2.roundRect(qx - 10, qy - 10, 20, 20, 4, i === 0 ? 'rgba(255,210,63,.22)' : 'rgba(255,255,255,.06)', i === 0 ? C.gold : C.dim, 1);
          api.txtCFit(s === 'small' ? 'S' : s === 'big' ? 'B' : 'N', qx, qy - 5, 9, i === 0 ? C.gold : C.dim);
        }
        // the door
        const need = this.queue[this.idx];
        const dw = need === 'small' ? 20 : need === 'big' ? 56 : 34, dh = need === 'small' ? 30 : need === 'big' ? 78 : 50;
        const dx = W / 2, dy = H * 0.4;
        c.fillStyle = C.goldDark; c.fillRect(dx - dw / 2 - 4, dy - dh / 2 - 4, dw + 8, dh + 8);
        c.fillStyle = '#3a2414'; c.fillRect(dx - dw / 2, dy - dh / 2, dw, dh);
        c.fillStyle = C.gold; c.beginPath(); c.arc(dx + dw / 2 - 5, dy, 1.6, 0, 7); c.fill();
        // countdown ring around the door
        const frac = clamp(this.timeLeft / this.roundTime(), 0, 1);
        c.strokeStyle = frac < 0.3 ? C.danger : C.cyan; c.lineWidth = 3;
        c.beginPath(); c.arc(dx, dy, Math.max(dw, dh) * 0.62, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); c.stroke();
        // Alice at current size, beside the door
        const s = SIZE_SCALE[this.cur] * 0.6;
        drawAliceBig(api, dx - 60 - 3 * s, dy + dh / 2 - 8 * s, s, { outline: true });
        // three buttons
        const by = H - 70, bw = W / 3;
        const labels = [['DRINK ME', C.cyan], ['WAIT', C.dim], ['EAT ME', C.pink]];
        labels.forEach((L, i) => {
          g2.roundRect(i * bw + 3, by - 34, bw - 6, 60, 6, 'rgba(255,255,255,.06)', L[1], 1.4);
          api.txtCFit(L[0], i * bw + bw / 2, by - 18, 8, L[1], false, bw - 12);
        });
        if (this.msgT > 0) api.txtCFit(this.msg, W / 2, H * 0.6, 11, C.gold);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,4,16,.7)', C.violetDeep, 1);
        api.txt('DOORS ' + this.idx + '/' + this.need, 10, 8, 8, C.cream);
        api.txtCFit('MISTAKES ' + this.mistakes + '/' + this.maxMistakes, W - 62, 8, 8, C.danger, false, 100);
        api.vignette();
      },
    };
  }

  /* --- THE MAD TEA PARTY: pour a perfect cup on the closing ring --- */
  function teaRhythm() {
    return {
      name: 'NO ROOM! NO ROOM!', boss: false,
      help: 'TAP when the ripple fills the rim — perfect pours win RESPECT',
      winText: 'Splendid catching! The Hatter winks and pours another round.',
      loseText: 'Crash! The cups clatter to the grass. The Hatter scowls.',
      init(api) {
        this.need = api.has('invitation') ? 11 : 14;
        this.maxMiss = 5; this.caught = 0; this.miss = 0;
        this.targetR = 24; this.tol = 6.5; this.ringR = 68; this.speed = 46;
        this.flashT = 0; this.msg = ''; this.msgT = 0;
      },
      update(api, dt) {
        this.ringR -= this.speed * dt;
        if (api.confirm()) {
          if (Math.abs(this.ringR - this.targetR) <= this.tol) {
            this.caught++; api.addScore(this.caught > 8 ? 20 : 12); api.audio.sfx('coin');
            api.burst(api.W / 2, api.H * 0.42, C.gold, 8); this.msg = 'PERFECT POUR!'; this.msgT = 0.5;
            if (this.caught >= this.need) { api.addScore(65); api.win(); return; }
          } else {
            this.miss++; api.shake(3, 0.14); api.audio.sfx('hurt'); this.msg = 'SPILLED!'; this.msgT = 0.5;
            if (this.miss >= this.maxMiss) { api.lose(); return; }
          }
          this.ringR = 68; this.speed = Math.min(96, 46 + this.caught * 3);
        } else if (this.ringR <= 0) {
          this.miss++; api.shake(3, 0.14); api.audio.sfx('hurt'); this.msg = 'TOO LATE!'; this.msgT = 0.5;
          if (this.miss >= this.maxMiss) { api.lose(); return; }
          this.ringR = 68; this.speed = Math.min(96, 46 + this.caught * 3);
        }
        if (this.msgT > 0) this.msgT -= dt;
        if (this.flashT > 0) this.flashT -= dt;
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#5ac8f0'], [0.5, '#b0e8f5'], [1, C.grass]]);
        // Hatter (left) + March Hare (right) silhouettes
        c.fillStyle = C.violetDeep; c.beginPath(); c.arc(24, H * 0.3, 10, 0, 7); c.fill();
        c.fillRect(12, H * 0.33, 24, 30); c.fillRect(12, H * 0.18, 24, 4); c.fillRect(15, H * 0.08, 18, 22);
        c.fillStyle = C.heart; c.fillRect(15, H * 0.16, 18, 3);
        c.fillStyle = '#c8a06a'; c.beginPath(); c.arc(W - 26, H * 0.34, 9, 0, 7); c.fill();
        c.fillRect(W - 38, H * 0.37, 24, 26);
        c.fillStyle = '#c8a06a'; c.fillRect(W - 30, H * 0.24, 5, 12); c.fillRect(W - 20, H * 0.24, 5, 12);
        // table + cup
        const cx = W / 2, cy = H * 0.6;
        c.fillStyle = C.goldDark; c.fillRect(16, cy + 30, W - 32, 60);
        c.fillStyle = C.gold; c.fillRect(16, cy + 30, W - 32, 4);
        c.fillStyle = C.cream; c.fillRect(cx - 14, cy + 6, 28, 18); c.fillStyle = C.pink; c.fillRect(cx - 14, cy + 6, 28, 4);
        c.fillStyle = C.cream; c.fillRect(cx + 12, cy + 10, 8, 8);
        // target ring + closing ring
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.4; c.setLineDash([3, 3]);
        c.beginPath(); c.arc(cx, cy, this.targetR, 0, 7); c.stroke(); c.setLineDash([]);
        const near = Math.abs(this.ringR - this.targetR) <= this.tol;
        c.strokeStyle = near ? C.grass : C.cyanDeep; c.lineWidth = 2.4;
        c.beginPath(); c.arc(cx, cy, Math.max(2, this.ringR), 0, 7); c.stroke();
        if (this.msgT > 0) api.txtCFit(this.msg, W / 2, H * 0.24, 10, C.gold);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(8,4,2,.55)', C.goldDark, 1);
        api.txt('CUPS ' + this.caught + '/' + this.need, 10, 8, 8, C.cream);
        api.txtCFit('SPILL ' + this.miss + '/' + this.maxMiss, W - 62, 8, 8, this.miss > 3 ? C.danger : C.cream, false, 100);
        api.vignette(); api.scanlines();
      },
    };
  }

  /* --- THE QUEEN'S CROQUET GROUND: flamingo swing + hedgehog arc --- */
  function croquetGround() {
    return {
      name: 'FLAMINGO MALLETS', boss: false,
      help: 'WATCH the flamingo swing — TAP to stop it and fire the hedgehog',
      winText: 'Five wickets clean! The Queen almost, almost smiles.',
      loseText: '"OFF WITH HER HEAD!" The card guards close in.',
      init(api) {
        this.swing = 0; this.swingDir = 1; this.swingSpeed = 1.8;
        this.ball = null; this.teeX = api.W * 0.16; this.teeY = api.H * 0.74;
        this.hoopTol = api.has('ridiculousriddle') ? 9 : 6;
        this.hoop = this.newHoop(api);
        this.scored = 0; this.need = 5; this.miss = 0; this.maxMiss = 5;
        this.soldiers = [];
        for (let i = 0; i < 3; i++) this.soldiers.push({ x: api.W * 0.3 + i * 46, y: api.H * 0.5, vx: 0.5 + i * 0.2, dir: i % 2 === 0 ? 1 : -1 });
        this.result = null; this.resultT = 0;
      },
      newHoop(api) { return { x: api.rnd(api.W * 0.5, api.W * 0.86), y: api.rnd(api.H * 0.32, api.H * 0.56), bob: api.rnd(0, 6.28) }; },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.hoop.bob += dt;
        const hoopY = this.hoop.y + Math.sin(this.hoop.bob * 1.4) * 18;
        for (const s of this.soldiers) { s.x += s.vx * s.dir; if (s.x > W - 18) s.dir = -1; if (s.x < 18) s.dir = 1; }
        if (!this.ball) {
          this.swing += this.swingDir * this.swingSpeed * dt;
          if (this.swing > Math.PI * 0.88) { this.swing = Math.PI * 0.88; this.swingDir = -1; }
          if (this.swing < -Math.PI * 0.08) { this.swing = -Math.PI * 0.08; this.swingDir = 1; }
          if (api.confirm()) {
            const angle = this.swing - Math.PI * 0.5, spd = 5.9;
            this.ball = { x: this.teeX, y: this.teeY, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd };
            api.audio.sfx('shoot');
          }
        } else {
          this.ball.x += this.ball.vx; this.ball.y += this.ball.vy;
          this.ball.vx *= 0.992; this.ball.vy += 0.055;
          const dx = this.ball.x - this.hoop.x, dy = this.ball.y - hoopY;
          if (Math.abs(dx) < this.hoopTol + 8 && Math.abs(dy) < 14 && this.ball.vy > 0) {
            if (Math.abs(dx) < this.hoopTol) {
              this.scored++; api.addScore(28); api.audio.sfx('coin'); api.burst(this.hoop.x, hoopY, C.gold, 12);
              this.result = 'THROUGH!'; this.resultT = 1.1; api.shake(4, 0.16); this.swingSpeed = Math.min(3.4, this.swingSpeed + 0.2);
              if (this.scored >= this.need) { api.addScore(60); api.win(); return; }
              this.hoop = this.newHoop(api);
            } else { this.miss++; api.audio.sfx('hurt'); this.result = 'MISS!'; this.resultT = 1; if (this.miss >= this.maxMiss) { api.lose(); return; } }
            this.ball = null;
          }
          for (const s of this.soldiers) {
            if (this.ball && Math.hypot(this.ball.x - s.x, this.ball.y - (s.y + 14)) < 15) { this.ball.vx *= -0.5; this.ball.vy = Math.abs(this.ball.vy) * -0.7 - 0.3; api.audio.sfx('blip'); }
          }
          if (this.ball && (this.ball.x > W + 30 || this.ball.y > H + 30 || this.ball.x < -30)) {
            this.miss++; api.audio.sfx('hurt'); this.result = 'OUT!'; this.resultT = 1; if (this.miss >= this.maxMiss) { api.lose(); return; } this.ball = null;
          }
        }
        if (this.resultT > 0) this.resultT -= dt;
        api.score = this.scored * 28;
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        const hoopY = this.hoop.y + Math.sin(this.hoop.bob * 1.4) * 18;
        g2.verticalGradient(0, 0, W, H * 0.42, [[0, '#5ac8f0'], [1, '#8fdfff']]);
        g2.verticalGradient(0, H * 0.42, W, H * 0.58, [[0, C.grass], [1, '#0f5a24']]);
        for (let i = 0; i < 6; i++) {
          const rx = 12 + i * 44, ry = H * 0.44;
          c.fillStyle = C.grass; c.fillRect(rx - 3, ry - 18, 6, 18);
          c.fillStyle = C.heart; c.beginPath(); c.arc(rx - 4, ry - 18, 6, 0, 7); c.arc(rx + 4, ry - 18, 6, 0, 7); c.arc(rx, ry - 24, 6, 0, 7); c.fill();
        }
        c.fillStyle = C.heart; c.fillRect(this.hoop.x - 3 - 2, hoopY - 16, 4, 32); c.fillRect(this.hoop.x + this.hoopTol - 2 + 2, hoopY - 16, 4, 32);
        c.fillStyle = C.pink; c.fillRect(this.hoop.x - this.hoopTol - 4, hoopY - 3, this.hoopTol * 2 + 8, 5);
        for (const s of this.soldiers) {
          c.fillStyle = C.cream; c.fillRect(s.x - 8, s.y, 16, 26); c.fillStyle = C.heart; c.fillRect(s.x - 8, s.y, 16, 5);
          c.fillStyle = '#f2d2a8'; c.beginPath(); c.arc(s.x, s.y - 8, 7, 0, 7); c.fill();
        }
        c.fillStyle = C.heart; c.fillRect(W / 2 - 18, 18, 36, 38); c.fillStyle = C.gold;
        for (let j = 0; j < 3; j++) c.fillRect(W / 2 - 12 + j * 10, 8, 6, 12);
        c.fillStyle = '#f2d2a8'; c.beginPath(); c.arc(W / 2, 28, 10, 0, 7); c.fill();
        if (!this.ball) {
          const angle = this.swing - Math.PI * 0.5;
          const lx = this.teeX + Math.cos(angle) * 34, ly = this.teeY + Math.sin(angle) * 34;
          c.strokeStyle = C.pink; c.lineWidth = 3; c.beginPath(); c.moveTo(this.teeX, this.teeY); c.lineTo(lx, ly); c.stroke();
          c.fillStyle = C.pink; c.beginPath(); c.arc(lx, ly, 8, 0, 7); c.fill();
          const gx = this.teeX + Math.cos(angle) * 80, gy = this.teeY + Math.sin(angle) * 80;
          c.strokeStyle = 'rgba(255,255,255,.3)'; c.setLineDash([5, 6]); c.lineWidth = 1;
          c.beginPath(); c.moveTo(this.teeX, this.teeY); c.lineTo(gx, gy); c.stroke(); c.setLineDash([]);
          c.fillStyle = '#8a6a4a'; c.beginPath(); c.arc(this.teeX, this.teeY, 8, 0, 7); c.fill();
        } else { c.fillStyle = '#8a6a4a'; c.beginPath(); c.arc(this.ball.x, this.ball.y, 8, 0, 7); c.fill(); }
        if (this.resultT > 0) { c.globalAlpha = Math.min(1, this.resultT * 2); api.txtCFit(this.result, W / 2, H * 0.3, 16, this.result === 'THROUGH!' ? C.grass : C.heart, true); c.globalAlpha = 1; }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(20,0,10,.6)', C.heartDark, 1);
        api.txt('WICKETS ' + this.scored + '/' + this.need, 10, 8, 8, C.cream);
        api.txtCFit('MISS ' + this.miss + '/' + this.maxMiss, W - 62, 8, 8, this.miss > 3 ? C.danger : C.cream, false, 100);
        api.vignette(); api.scanlines();
      },
    };
  }

  /* --- THE TRIAL p1: THE COURT ASSEMBLES (dodge + collect) --- */
  function courtAssembles() {
    return {
      name: 'THE COURT ASSEMBLES', boss: false,
      help: 'DODGE the flying tarts! Collect the jury\'s hearts',
      winText: 'The jury is seated. Now for the verdict — sentence first, of course.',
      loseText: 'A tart finds its mark. The court dissolves into shouting.',
      init(api) {
        this.alice = { x: api.W / 2, y: api.H * 0.68, vx: 0, vy: 0 };
        this.cards = []; this.hearts = []; this.timer = 18; this.lives = 3; this.flashT = 0;
        this.cardSpawnT = 0; this.heartSpawnT = 0; this.collected = 0;
        for (let i = 0; i < 4; i++) this.hearts.push({ x: api.rnd(20, api.W - 20), y: api.rnd(60, api.H - 60), bob: api.rnd(0, 6.28), got: false });
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.timer -= dt;
        let ax = 0, ay = 0;
        if (api.keyDown('left')) ax = -1; if (api.keyDown('right')) ax = 1;
        if (api.keyDown('up')) ay = -1; if (api.keyDown('down')) ay = 1;
        if (api.pointer.down) { const dx = api.pointer.x - this.alice.x, dy = api.pointer.y - this.alice.y; const d = Math.sqrt(dx * dx + dy * dy) || 1; if (d > 10) { ax = dx / d; ay = dy / d; } }
        this.alice.vx = clamp(this.alice.vx + ax * 0.4, -3.2, 3.2); this.alice.vy = clamp(this.alice.vy + ay * 0.4, -3.2, 3.2);
        this.alice.vx *= 0.85; this.alice.vy *= 0.85;
        this.alice.x = clamp(this.alice.x + this.alice.vx, 12, W - 12); this.alice.y = clamp(this.alice.y + this.alice.vy, 38, H - 16);
        this.cardSpawnT -= dt;
        if (this.cardSpawnT <= 0) {
          const elapsed = 18 - this.timer, speed = 90 + elapsed * 5;
          const side = api.chance(0.5); const ox = side ? -22 : W + 22, oy = api.rnd(44, H - 36);
          const ang = Math.atan2(this.alice.y - oy, this.alice.x - ox) + api.rnd(-0.45, 0.45);
          this.cards.push({ x: ox, y: oy, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, rot: 0, rotV: api.rnd(-6, 6) });
          this.cardSpawnT = Math.max(0.3, 0.9 - elapsed * 0.02);
        }
        this.heartSpawnT -= dt;
        if (this.heartSpawnT <= 0 && this.hearts.filter((h) => !h.got).length < 6) { this.hearts.push({ x: api.rnd(20, W - 20), y: api.rnd(56, H - 56), bob: api.rnd(0, 6.28), got: false }); this.heartSpawnT = 2.6; }
        for (const card of this.cards) {
          card.x += card.vx * dt; card.y += card.vy * dt; card.rot += card.rotV * dt;
          if (this.flashT <= 0 && Math.abs(card.x - this.alice.x) < 13 && Math.abs(card.y - this.alice.y) < 18) {
            this.lives--; this.flashT = 1.4; api.audio.sfx('hurt'); api.shake(5, 0.25);
            if (this.lives <= 0) { api.lose(); return; }
          }
        }
        this.cards = this.cards.filter((c) => c.x > -30 && c.x < W + 30 && c.y > -30 && c.y < H + 30);
        for (const h of this.hearts) { if (h.got) continue; h.bob += dt * 2; if (Math.hypot(this.alice.x - h.x, this.alice.y - h.y) < 16) { h.got = true; this.collected++; api.addScore(18); api.audio.sfx('coin'); api.burst(h.x, h.y, C.heart, 8); } }
        if (this.flashT > 0) this.flashT -= dt;
        if (this.timer <= 0) { api.addScore(this.collected * 8 + 60); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, C.heartDark], [1, '#1a0404']]);
        for (let fy = H * 0.52; fy < H; fy += 24) for (let fx = 0; fx < W; fx += 24) { c.fillStyle = (Math.floor(fx / 24) + Math.floor((fy - Math.floor(H * 0.52)) / 24)) % 2 === 0 ? C.heart : '#1a0404'; c.fillRect(fx, fy, 24, 24); }
        c.fillStyle = C.heartDark; c.fillRect(0, 0, 18, H); c.fillRect(W - 18, 0, 18, H);
        for (let i = 0; i < 5; i++) { const cx = 30 + i * 44, cy = H * 0.52 - 24; c.fillStyle = C.cream; c.fillRect(cx - 8, cy, 16, 24); c.fillStyle = C.heart; c.fillRect(cx - 8, cy, 16, 4); c.fillStyle = '#f2d2a8'; c.beginPath(); c.arc(cx, cy - 8, 7, 0, 7); c.fill(); }
        c.fillStyle = C.heart; c.fillRect(W / 2 - 20, 16, 40, 42); c.fillStyle = C.gold; for (let j = 0; j < 4; j++) c.fillRect(W / 2 - 15 + j * 10, 6, 6, 12);
        c.fillStyle = '#f2d2a8'; c.beginPath(); c.arc(W / 2, 28, 11, 0, 7); c.fill();
        for (const h of this.hearts) { if (h.got) continue; const hy = h.y + Math.sin(h.bob) * 3; c.fillStyle = C.heart; c.font = '16px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('♥', h.x, hy); }
        for (const card of this.cards) { c.save(); c.translate(card.x, card.y); c.rotate(card.rot); c.fillStyle = C.cream; c.fillRect(-9, -13, 18, 26); c.strokeStyle = '#ddd'; c.lineWidth = 1; c.strokeRect(-9, -13, 18, 26); c.fillStyle = C.heart; c.font = 'bold 10px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('♥', 0, 0); c.restore(); }
        const blink = this.flashT > 0 && Math.floor(t * 9) % 2 === 0;
        if (!blink) drawAliceBig(api, this.alice.x - 9, this.alice.y - 16, 3, { outline: true });
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(30,0,0,.7)', C.heartDark, 1);
        api.txt('♥ ' + this.collected, 10, 8, 8, C.heart);
        api.txtCFit(Math.ceil(Math.max(0, this.timer)) + 's', W / 2, 8, 8, this.timer < 5 ? C.danger : C.gold, false, 60);
        let hearts = ''; for (let i = 0; i < this.lives; i++) hearts += '♥'; api.txtCFit(hearts, W - 46, 8, 8, C.heart, false, 40);
        if (this.flashT > 0 && Math.floor(t * 6) % 2 === 0) { c.globalAlpha = 0.32; c.fillStyle = C.heart; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
        api.vignette();
      },
    };
  }

  /* --- THE TRIAL p2 (boss): OFF WITH HER HEAD! (card-soldier defense) --- */
  function cardDefense() {
    return {
      name: 'OFF WITH HER HEAD!', boss: true,
      help: 'TAP the advancing cards before they reach the dock — never the grin!',
      winText: '"You\'re nothing but a pack of cards!" They scatter into the wind. Alice wakes.',
      loseText: 'The deck piles on! The Queen\'s wrath buries the dock.',
      init(api) {
        this.standHP = 5 + (api.has('stoutmallet') ? 1 : 0); this.maxHP = this.standHP;
        this.duration = 28; this.t = 0; this.spawnT = 1; this.soldiers = []; this.stopped = 0;
        this.standX = api.W / 2; this.standY = api.H - 66;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.t += dt; this.spawnT -= dt;
        if (this.spawnT <= 0) {
          this.spawnT = Math.max(0.55, 1.3 - this.t * 0.02);
          const isDecoy = api.chance(0.16);
          const side = api.choice(['left', 'top', 'right']);
          const start = side === 'left' ? { x: -16, y: api.rnd(60, H - 100) } : side === 'right' ? { x: W + 16, y: api.rnd(60, H - 100) } : { x: api.rnd(20, W - 20), y: -16 };
          this.soldiers.push({ x: start.x, y: start.y, decoy: isDecoy, dead: false, spd: 34 + this.t * 0.7 });
        }
        for (const s of this.soldiers) {
          if (s.dead) continue;
          const dx = this.standX - s.x, dy = this.standY - s.y, d = Math.hypot(dx, dy) || 1;
          if (s.decoy) { s.x += Math.sin(this.t * 1.4 + s.y) * 20 * dt; s.y += 6 * dt; }
          else { s.x += (dx / d) * s.spd * dt; s.y += (dy / d) * s.spd * dt; }
          if (!s.decoy && d < 20) {
            s.dead = true; this.standHP--; api.shake(5, 0.25); api.flash('#4a0616', 0.16); api.audio.sfx('hurt');
            if (this.standHP <= 0) { api.lose(); return; }
          }
        }
        if (api.pointer.justDown) {
          let best = null, bestD = 22;
          for (const s of this.soldiers) { if (s.dead) continue; const d = Math.hypot(api.pointer.x - s.x, api.pointer.y - s.y); if (d < bestD) { best = s; bestD = d; } }
          if (best) {
            best.dead = true;
            if (best.decoy) { api.shake(3, 0.15); api.flash('#3a1a5c', 0.14); api.audio.sfx('hurt'); }
            else { this.stopped++; api.addScore(14); api.audio.sfx('coin'); api.burst(best.x, best.y, C.gold, 8); }
          }
        }
        this.soldiers = this.soldiers.filter((s) => !s.dead && s.x > -30 && s.x < W + 30 && s.y > -30 && s.y < H + 30);
        if (this.t >= this.duration) { api.addScore(this.stopped * 4 + 90); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, C.heartDark], [0.6, '#2a0a1c'], [1, '#0a0212']]);
        c.fillStyle = C.heartDark; c.fillRect(0, 0, 16, H); c.fillRect(W - 16, 0, 16, H);
        for (let cy2 = 0; cy2 < H; cy2 += 30) { c.fillStyle = '#3a0f22'; c.fillRect(0, cy2, 16, 16); c.fillRect(W - 16, cy2, 16, 16); }
        c.globalAlpha = 0.5; c.fillStyle = C.heart; c.font = '14px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        for (let i = 0; i < 6; i++) { const hx = 30 + (i * 61 + t * 5) % (W - 60), hy = 40 + (i * 71) % (H - 90); c.fillText('♥', hx, hy); }
        c.globalAlpha = 1;
        g2.embers(t, 14, { x0: 20, x1: W - 20, yBottom: H, yTop: H * 0.3, color: C.gold, speed: 0.1, alpha: 0.5 });
        for (let i = 0; i < 5; i++) { c.globalAlpha = 0.1; c.fillStyle = C.gold; c.fillRect(0, H * 0.5 + i * 22, W, 1); c.globalAlpha = 1; }
        g2.glow(this.standX, this.standY - 4, 44, C.gold, 0.18 + 0.06 * Math.sin(t * 2));
        g2.roundRect(this.standX - 26, this.standY - 10, 52, 26, 5, 'rgba(255,255,255,.08)', C.gold, 1.4);
        drawAliceBig(api, this.standX - 9, this.standY - 24, 2.4, { outline: true });
        for (const s of this.soldiers) {
          if (s.decoy) {
            c.globalAlpha = 0.7; c.strokeStyle = C.violetLight; c.lineWidth = 2;
            c.beginPath(); c.arc(s.x, s.y, 9, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); c.globalAlpha = 1;
          } else {
            c.save(); c.translate(s.x, s.y);
            c.fillStyle = C.cream; c.fillRect(-8, -12, 16, 24); c.fillStyle = C.heart; c.fillRect(-8, -12, 16, 4);
            c.fillStyle = '#f2d2a8'; c.beginPath(); c.arc(0, -18, 6, 0, 7); c.fill();
            c.restore();
          }
        }
        const pct = Math.max(0, this.standHP / this.maxHP);
        g2.roundRect(6, H - 12, W - 12, 5, 3, 'rgba(0,0,0,.5)', null);
        g2.roundRect(6, H - 12, Math.round((W - 12) * pct), 5, 3, pct < 0.34 ? C.danger : C.grass, null);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(20,0,10,.6)', C.heartDark, 1);
        api.txt('STOPPED ' + this.stopped, 10, 8, 8, C.gold);
        api.txtCFit(Math.max(0, Math.ceil(this.duration - this.t)) + 's', W / 2, 8, 8, C.cream, false, 60);
        api.vignette(); api.scanlines();
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'alice16', title: 'Alice in Wonderland', subtitle: 'A DEALT HAND',
    currency: 'CURIOSITY', accent: C.heart, ownPhaseHud: true,
    titleFont: TITLE, uiFont: UI, superSample: 3,
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.heart, blood: C.danger, cream: C.cream, dim: C.dim, ink: C.ink },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'CHOOSE A CARD', mapDone: 'WONDERLAND IS WON',
    screens: {
      overlay: 'rgba(20,10,40,.86)', win: C.gold, lose: C.heart, chapterLabel: C.violetLight,
      name: C.cream, sub: C.pink, intro: '#f5e6ff', quote: C.dim, help: C.gold,
      score: C.cream, cur: C.gold, cta: C.cream,
    },
    labels: {
      chapter: 'CARD', phase: 'ROUND', boss: 'THE VERDICT', score: 'CURIOSITY',
      win: 'CURIOUSER AND CURIOUSER!', lose: 'OH DEAR, OH DEAR!', nextPhaseWin: 'THROUGH!',
      cont: 'TAP TO CONTINUE', toMap: 'TAP FOR THE TABLE', play: 'TAP TO BEGIN',
      nextPhase: 'TAP TO PRESS ON', toFinale: 'TAP FOR THE WAKING',
    },
    upgrades: {
      goldenkey: { name: 'THE GOLDEN KEY', desc: 'a spare beat of grace at every door' },
      invitation: { name: 'AN EDGEWISE INVITATION', desc: 'fewer perfect pours needed at the Tea Party' },
      ridiculousriddle: { name: 'A RIDICULOUS RIDDLE', desc: 'a wider wicket at the croquet ground' },
      stoutmallet: { name: 'A STOUT MALLET', desc: 'the dock holds one hit longer at the trial' },
    },
    nodes: [
      {
        id: 'hole', name: 'THE RABBIT HOLE', sub: 'DOWN AND DOWN', reward: 55, grant: 'goldenkey',
        intro: ['THE WHITE RABBIT darts by,', 'late for something important.', 'Alice follows — and falls', 'down, down, down...'],
        quote: 'Down, down, down. Would the fall never come to an end?',
        winText: 'The bottom at last! A tiny door, and a golden key on a glass table.',
        phases: [rabbitFall()],
      },
      {
        id: 'doors', name: 'THE HALL OF DOORS', sub: 'WHICH SIZE, WHICH DOOR', needs: ['hole'], reward: 60, grant: 'invitation',
        intro: ['A HALL LINED WITH LOCKED DOORS', 'of every size. A blue Caterpillar', 'on a mushroom offers advice —', 'one side shrinks, one side grows.'],
        quote: 'One side will make you grow taller, and the other side will make you grow shorter.',
        winText: 'The last door swings open onto a garden of bright flowers.',
        choice: {
          prompt: 'The mushroom has two sides. Which does Alice keep for the road ahead?',
          hint: 'YOUR BITE SHAPES HOW ALICE MEETS WONDERLAND',
          options: [
            { label: 'Nibble the left', sub: 'Shrink small — careful, curious of every corner', flag: 'curious',
              icon(api, x, y) { const c = api.ctx; c.strokeStyle = C.cyan; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x, y + 6); c.lineTo(x - 4, y + 2); c.moveTo(x, y + 6); c.lineTo(x + 4, y + 2); c.stroke(); } },
            { label: 'Nibble the right', sub: 'Grow bold — standing tall against tyrants', flag: 'bold',
              icon(api, x, y) { const c = api.ctx; c.strokeStyle = C.pink; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x, y - 6); c.lineTo(x - 4, y - 2); c.moveTo(x, y - 6); c.lineTo(x + 4, y - 2); c.stroke(); } },
          ],
        },
        phases: [sizeDoors()],
      },
      {
        id: 'teaparty', name: 'THE MAD TEA PARTY', sub: 'NO ROOM! NO ROOM!', needs: ['doors'], reward: 65, grant: 'ridiculousriddle',
        intro: ['"NO ROOM! NO ROOM!" cried', 'the Hatter and the Hare. But the', 'table was enormous — pour a', 'perfect cup and earn your seat.'],
        quote: 'Have some wine. There is no wine. Then it wasn\'t very civil of you to offer it.',
        winText: 'Splendid catching! The Hatter winks and pours another round.',
        phases: [teaRhythm()],
      },
      {
        id: 'croquet', name: "THE QUEEN'S CROQUET", sub: 'FLAMINGO MALLETS', needs: ['teaparty'], reward: 70, grant: 'stoutmallet',
        intro: ['THE QUEEN plays croquet with', 'flamingos as mallets and hedgehogs', 'as balls. "Your turn, child —', 'and mind the wickets move!"'],
        quote: 'Off with their heads! Off with their heads!',
        winText: 'Five wickets clean! The Queen almost, almost smiles.',
        phases: [croquetGround()],
      },
      {
        id: 'trial', name: 'THE TRIAL', sub: 'SENTENCE FIRST!', needs: ['croquet'], reward: 140,
        intro: ['"THE TRIAL OF ALICE!" the Queen', 'declares. The court assembles —', 'then the whole pack of cards', 'rises up as one against her.'],
        quote: '"Sentence first — verdict afterwards!" screamed the Queen of Hearts.',
        winText: '"You\'re nothing but a pack of cards!" They scatter into the wind. Alice wakes.',
        phases: [courtAssembles(), cardDefense()],
      },
    ],
    endings: [
      { when: (f) => f.curious, title: 'THE QUIET WONDER', lines: ['Alice wakes beneath the old tree,', 'gentler for the fall — the world', 'still full of curious corners', 'she\'ll take her time to know.'] },
      { when: (f) => f.bold, title: 'THE UNSHAKEN GUEST', lines: ['Alice wakes with her chin held high —', '"You\'re nothing but a pack of cards"', 'rings on, unafraid of any', 'tyrant, big or small.'] },
      { when: () => true, title: 'JUST A DREAM', lines: ['"It was all a dream," said Alice,', 'waking under the old tree.', '', 'But somewhere down below, a White', 'Rabbit checks his watch.'] },
    ],
    finale: ['ALICE WAKES BENEATH THE OLD TREE.'],
  });
})();
