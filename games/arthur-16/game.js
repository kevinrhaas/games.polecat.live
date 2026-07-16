/* ============================================================================
 * KING ARTHUR — THE ONCE AND FUTURE KING   (Gen 4 / 16-bit)
 * The Matter of Britain as a Round Table: five quests seated in a ring of
 * shields, each a run of trials ending in an ordeal. The true king's name,
 * Excalibur, Lancelot's oath and the Grail's grace carry across the reign;
 * how the boy claims the throne decides how the legend is remembered.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2. Bright heraldic pageantry —
 * royal blue, gold leaf, banner crimson.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    royal: '#16307a', royalD: '#0c1c4a', sky: '#7ab8e8', night: '#0a1230',
    gold: '#f0c860', goldHi: '#ffe9a8', leaf: '#c8981a',
    crimson: '#b02030', banner: '#8a1626', stone: '#8a8ca0', stoneD: '#4a4c62',
    grass: '#3a7a34', cream: '#f4ecd8', ink: '#1a1408', dim: '#8a96b8',
    mist: '#b8cce0', steel: '#c8d0dc',
  };
  // pixel-blackletter display face, distinct from Dracula's Jacquard 24.
  const TITLE = "'Jacquarda Bastarda 9','Press Start 2P',serif";

  /* ─── emblem: Excalibur upright through a gold crown ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(cx, cy, 36, C.gold, 0.4);
    // blade
    c.fillStyle = C.steel; c.beginPath(); c.moveTo(cx - 3, cy - 30); c.lineTo(cx, cy - 38); c.lineTo(cx + 3, cy - 30); c.lineTo(cx + 3, cy + 18); c.lineTo(cx - 3, cy + 18); c.closePath(); c.fill();
    c.fillStyle = '#eef4fa'; c.fillRect(cx - 1, cy - 34, 1, 50);
    // crossguard + grip
    c.fillStyle = C.gold; c.fillRect(cx - 14, cy + 6, 28, 5);
    c.fillStyle = '#6a4a12'; c.fillRect(cx - 2, cy + 11, 4, 12);
    c.fillStyle = C.gold; c.beginPath(); c.arc(cx, cy + 26, 4, 0, 7); c.fill();
    // the crown it passes through
    c.fillStyle = C.gold;
    c.beginPath(); c.moveTo(cx - 20, cy + 2); c.lineTo(cx - 20, cy - 12); c.lineTo(cx - 12, cy - 4);
    c.lineTo(cx - 6, cy - 14); c.lineTo(cx, cy - 6); c.lineTo(cx + 6, cy - 14); c.lineTo(cx + 12, cy - 4);
    c.lineTo(cx + 20, cy - 12); c.lineTo(cx + 20, cy + 2); c.closePath(); c.fill();
    c.fillStyle = C.crimson; c.beginPath(); c.arc(cx - 12, cy - 2, 2, 0, 7); c.arc(cx + 12, cy - 2, 2, 0, 7); c.fill();
  }

  /* ─── shared scene: Camelot on its hill, banners, dawn rays ─── */
  function camelotScene(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, '#28448a'], [0.5, '#5a86c8'], [1, '#a8c8e8']], H * 0.62);
    // god-rays from behind the castle
    c.save(); c.globalAlpha = 0.14 + 0.05 * Math.sin(t * 0.8);
    for (let i = -3; i <= 3; i++) {
      c.fillStyle = '#ffe9a8';
      c.beginPath(); c.moveTo(W / 2, H * 0.36);
      c.lineTo(W / 2 + i * 60 - 14, 0); c.lineTo(W / 2 + i * 60 + 14, 0); c.closePath(); c.fill();
    }
    c.restore();
    g2.glow(W / 2, H * 0.30, 60, '#ffe9a8', 0.3);
    // Camelot silhouette — towers + banners
    const baseY = H * 0.62;
    c.fillStyle = '#22366a';
    c.fillRect(W / 2 - 60, baseY - 60, 120, 60);
    for (let x = W / 2 - 58; x < W / 2 + 58; x += 14) c.fillRect(x, baseY - 68, 8, 8);
    [[-70, 96], [-30, 120], [20, 130], [58, 100]].forEach((tw) => {
      const tx = W / 2 + tw[0];
      c.fillStyle = '#22366a'; c.fillRect(tx, baseY - tw[1], 20, tw[1]);
      c.beginPath(); c.moveTo(tx - 3, baseY - tw[1]); c.lineTo(tx + 10, baseY - tw[1] - 18); c.lineTo(tx + 23, baseY - tw[1]); c.closePath(); c.fill();
      // banner streaming
      const wav = Math.sin(t * 4 + tx) * 4;
      c.fillStyle = C.crimson; c.beginPath();
      c.moveTo(tx + 10, baseY - tw[1] - 18); c.lineTo(tx + 26 + wav, baseY - tw[1] - 12); c.lineTo(tx + 10, baseY - tw[1] - 6); c.closePath(); c.fill();
      c.fillStyle = '#e8c060'; c.fillRect(tx + 6, baseY - tw[1] * 0.5, 7, 9);
    });
    // meadow + tourney tents
    g2.verticalGradient(0, baseY, W, H - baseY, [[0, '#4a8a3c'], [1, '#26541e']]);
    [[36, 0], [W - 60, 1]].forEach((tt) => {
      const tx = tt[0], col = tt[1] ? C.royal : C.crimson;
      c.fillStyle = col; c.beginPath(); c.moveTo(tx, baseY + 34); c.lineTo(tx + 16, baseY + 8); c.lineTo(tx + 32, baseY + 34); c.closePath(); c.fill();
      c.fillStyle = C.cream; c.fillRect(tx + 14, baseY + 4, 3, 10);
    });
    for (let i = 0; i < 12; i++) { const fx = (i * 53 + 17) % W, fy = baseY + 14 + ((i * 37) % (H - baseY - 26)); c.fillStyle = i % 2 ? '#e8e070' : '#e8f0f8'; c.fillRect(fx, fy, 2, 2); }
    g2.embers(t, 8, { yBottom: H, yTop: H * 0.3, color: '#fff0c0', speed: 0.05, size: 2, alpha: 0.35 });
    if (dim) { c.fillStyle = 'rgba(6,10,26,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }
  function scenery(api, scene, t) {
    if (scene === 'hub') { drawTable(api, t); return; }
    camelotScene(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale') ? 0.6 : 0);
  }

  /* ─── HUB: the Round Table from above — shields in a ring ─── */
  const TCX = 135, TCY = 252, TR = 118;
  const SEATS = { sword: -Math.PI / 2, lake: -Math.PI / 2 + 1.256, lancelot: -Math.PI / 2 + 2.513, grail: -Math.PI / 2 + 3.769, camlann: -Math.PI / 2 + 5.026 };
  function drawTable(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    // hall floor
    g2.verticalGradient(0, 0, W, H, [[0, '#101c40'], [1, '#0a1228']]);
    for (let y = 0; y < H; y += 26) for (let x = (y / 26 % 2) * 26; x < W; x += 52) { c.fillStyle = 'rgba(255,255,255,.025)'; c.fillRect(x, y, 26, 26); }
    // torch glow corners
    g2.flame(14, 96, t, 1.0); g2.flame(W - 14, 96, t, 1.0);
    g2.glow(14, 92, 30, '#ffb050', 0.35); g2.glow(W - 14, 92, 30, '#ffb050', 0.35);
    // THE TABLE — oak ring with gold band
    g2.glow(TCX, TCY, TR + 10, '#3a2a10', 0.6);
    c.fillStyle = '#4a3414'; c.beginPath(); c.arc(TCX, TCY, TR + 4, 0, 7); c.fill();
    c.fillStyle = '#5e4420'; c.beginPath(); c.arc(TCX, TCY, TR - 4, 0, 7); c.fill();
    // wood grain rings
    c.strokeStyle = 'rgba(30,20,8,.4)'; c.lineWidth = 1.5;
    for (let r = 20; r < TR - 8; r += 13) { c.beginPath(); c.arc(TCX, TCY, r, 0.2 + r, 5.6 + r); c.stroke(); }
    c.strokeStyle = C.gold; c.lineWidth = 2.5; c.beginPath(); c.arc(TCX, TCY, TR - 1, 0, 7); c.stroke();
    // radial seat divisions
    c.strokeStyle = 'rgba(30,20,8,.5)';
    Object.values(SEATS).forEach((a) => { c.beginPath(); c.moveTo(TCX + Math.cos(a + 0.628) * 30, TCY + Math.sin(a + 0.628) * 30); c.lineTo(TCX + Math.cos(a + 0.628) * (TR - 4), TCY + Math.sin(a + 0.628) * (TR - 4)); c.stroke(); });
    // Excalibur at the centre, slowly gleaming, pointing at the selection
    g2.glow(TCX, TCY, 26, C.gold, 0.35 + 0.12 * Math.sin(t * 2));
    c.fillStyle = '#2a1e0a'; c.beginPath(); c.arc(TCX, TCY, 20, 0, 7); c.fill();
    c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.arc(TCX, TCY, 20, 0, 7); c.stroke();
    emblemSmall(api, TCX, TCY, t);
  }
  function emblemSmall(api, cx, cy, t) {
    const c = api.ctx;
    c.save(); c.translate(cx, cy); c.scale(0.5, 0.5);
    emblem(api, 0, 2);
    c.restore();
  }
  // heraldic shield vignettes per quest
  const BLAZON = {
    sword(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#3a5aa0'; c.fillRect(x, y, w, h); c.fillStyle = '#8a8ca0'; c.fillRect(x + w / 2 - 8, y + h - 16, 16, 10); c.fillStyle = C.steel; c.fillRect(x + w / 2 - 2, y + 8, 4, h - 22); c.fillStyle = C.gold; c.fillRect(x + w / 2 - 8, y + 16, 16, 3); g2.glow(x + w / 2, y + 12, 10, '#fff', 0.3 + 0.2 * Math.sin(t * 3)); },
    lake(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#1a3a5a'; c.fillRect(x, y, w, h); c.strokeStyle = 'rgba(180,220,240,.5)'; for (let i = 0; i < 3; i++) { c.beginPath(); const yy = y + h * 0.55 + i * 6; c.moveTo(x, yy); for (let xx = 0; xx <= w; xx += 5) c.lineTo(x + xx, yy + Math.sin(t * 2.4 + xx * 0.4 + i) * 1.5); c.stroke(); } const ay = y + h * 0.55 - 10 + Math.sin(t * 1.6) * 2; c.fillStyle = '#e8ecf4'; c.fillRect(x + w / 2 - 1, ay - 10, 3, 14); c.fillStyle = C.gold; c.fillRect(x + w / 2 - 5, ay, 11, 2); g2.glow(x + w / 2, ay - 4, 9, '#bfe0f0', 0.5); },
    lancelot(api, x, y, w, h, t) { const c = api.ctx; c.fillStyle = C.banner; c.fillRect(x, y, w, h); c.fillStyle = '#e8e8f0'; for (let i = 0; i < 3; i++) { c.save(); c.translate(x + w / 2, y + h / 2 + 2); c.rotate(-0.7 + i * 0.7 + Math.sin(t * 2) * 0.04); c.fillRect(-2, -h / 2 + 6, 4, h - 16); c.restore(); } },
    grail(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#2a2050'; c.fillRect(x, y, w, h); const gy = y + h / 2 + Math.sin(t * 1.8) * 3; g2.glow(x + w / 2, gy, 16, '#ffe9a8', 0.5 + 0.2 * Math.sin(t * 3)); c.fillStyle = C.gold; c.beginPath(); c.moveTo(x + w / 2 - 8, gy - 8); c.quadraticCurveTo(x + w / 2, gy + 4, x + w / 2 + 8, gy - 8); c.lineTo(x + w / 2 + 6, gy - 8); c.closePath(); c.fill(); c.fillRect(x + w / 2 - 1, gy - 2, 3, 8); c.fillRect(x + w / 2 - 5, gy + 6, 11, 2); },
    camlann(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#4a1a1a'); gr.addColorStop(1, '#1a0c0c'); c.fillStyle = gr; c.fillRect(x, y, w, h); g2.glow(x + w * 0.7, y + 8, 10, '#ff6030', 0.4); c.fillStyle = '#0e0808'; for (let i = 0; i < 3; i++) { c.save(); c.translate(x + 12 + i * 14, y + h - 4); c.rotate(-0.2 + i * 0.2); c.fillRect(-1, -14 - (i % 2) * 5, 2, 14 + (i % 2) * 5); c.restore(); } },
  };
  const menu = {
    title(api, save, t) {
      const c = api.ctx, g2 = api.g2, W = api.W;
      // hanging banner header
      c.fillStyle = C.banner; c.beginPath();
      c.moveTo(30, 8); c.lineTo(W - 30, 8); c.lineTo(W - 30, 44); c.lineTo(W / 2, 56); c.lineTo(30, 44); c.closePath(); c.fill();
      c.fillStyle = '#6a1018'; c.fillRect(30, 8, W - 60, 5);
      c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.moveTo(34, 12); c.lineTo(W - 34, 12); c.stroke();
      g2.gleamText('THE ROUND TABLE', W / 2, 17, api.fitSize('THE ROUND TABLE', 14, W - 76, 'title'), C.goldHi, t, { shadow: 'rgba(0,0,0,.7)', gleamSpeed: 55, font: TITLE });
      api.txtCFit('RENOWN  ' + (save.cur || 0), W / 2, 36, 9, '#ffd8a0');
    },
    layout() {
      // seats ring the table on an ellipse (narrower in x so no shield clips
      // the 270px screen edge)
      return ['sword', 'lake', 'lancelot', 'grail', 'camlann'].map((id) => {
        const a = SEATS[id];
        return { x: TCX + Math.cos(a) * 86 - 44, y: TCY + Math.sin(a) * TR - 40, w: 88, h: 80 };
      });
    },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, t } = info;
      const cx = x + w / 2, sy = y + 6;
      if (sel) g2.glow(cx, y + h / 2, 50, C.gold, 0.35 + 0.15 * Math.sin(t * 4));
      // heraldic shield
      g2.softShadow(x + 8, sy + 4, w - 16, h - 22, 6, 'rgba(0,0,0,.5)');
      c.beginPath();
      c.moveTo(cx - (w / 2 - 10), sy); c.lineTo(cx + (w / 2 - 10), sy);
      c.lineTo(cx + (w / 2 - 10), sy + (h - 42));
      c.quadraticCurveTo(cx + (w / 2 - 10), sy + (h - 22), cx, sy + (h - 14));
      c.quadraticCurveTo(cx - (w / 2 - 10), sy + (h - 22), cx - (w / 2 - 10), sy + (h - 42));
      c.closePath();
      c.save(); c.clip();
      if (BLAZON[node.id]) BLAZON[node.id](api, cx - (w / 2 - 10), sy, w - 20, h - 14, t);
      c.restore();
      c.strokeStyle = done ? C.gold : sel ? C.goldHi : '#3a4a7a'; c.lineWidth = sel ? 3 : 2; c.stroke();
      // name scroll below
      c.fillStyle = C.cream; c.fillRect(x + 4, y + h - 13, w - 8, 13);
      c.fillStyle = '#d8ccb0'; c.fillRect(x + 4, y + h - 13, w - 8, 3);
      api.txtCFit((node.optional ? '◆ ' : '') + node.name, cx, y + h - 11, 7, '#3a2c10', false, w - 12);
      if (done) { g2.glow(cx, sy + 10, 10, C.gold, 0.5); api.txtC('♛', cx, sy + 2, 11, C.gold); }
      if (sel) { const by = y - 8 + Math.sin(t * 5) * 2; api.txtC('▼', cx, by, 10, C.goldHi); }
    },
  };

  /* ─── animated title: the sword on the hill at dawn ─── */
  function renderBoot(api, info) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    camelotScene(api, t, 0);
    // the stone + sword, foreground
    c.fillStyle = '#6a6c80'; c.beginPath(); c.ellipse(W / 2, H - 78, 44, 18, 0, 0, 7); c.fill();
    c.fillStyle = '#8a8ca0'; c.beginPath(); c.ellipse(W / 2, H - 84, 38, 14, 0, 0, 7); c.fill();
    g2.glow(W / 2, H - 128, 30, '#fff', 0.3 + 0.15 * Math.sin(t * 2.4));
    c.fillStyle = C.steel; c.fillRect(W / 2 - 2, H - 128, 5, 44);
    c.fillStyle = '#eef4fa'; c.fillRect(W / 2 - 1, H - 126, 2, 40);
    c.fillStyle = C.gold; c.fillRect(W / 2 - 11, H - 132, 23, 4); c.fillRect(W / 2 - 2, H - 144, 5, 12);
    c.fillStyle = C.gold; c.beginPath(); c.arc(W / 2 + 0.5, H - 147, 4, 0, 7); c.fill();
    const ts = api.fitSize('KING ARTHUR', 30, W - 22, 'title');
    g2.gleamText('KING ARTHUR', W / 2, H * 0.10, ts, C.goldHi, t, { bevel: '#fff8e0', shadow: 'rgba(6,10,30,.85)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('THE ONCE AND FUTURE KING', W / 2, H * 0.10 + ts + 8, 10, C.cream, true);
    if (info.blink) api.txtCFit('▸ TAP TO CLAIM THE SWORD ◂', W / 2, H * 0.56, 11, C.cream);
    api.txtCFit('A 16-BIT LEGEND · THE MATTER OF BRITAIN', W / 2, H - 24, 8, '#a8b8d8');
    api.vignette(); api.scanlines();
  }

  /* ============================ 16-bit sprites ============================ */
  const ARTHUR_A = [
    '..gggg..', '.gGGGGg.', '.gffffg.', '..ffff..', '.kRRRRk.',
    'kRRggRRk', 'kRg..gRk', '.kR..Rk.', '.mm..mm.', 'oo....oo',
  ];
  const ARTHUR_B = [
    '..gggg..', '.gGGGGg.', '.gffffg.', '..ffff..', '.kRRRRk.',
    'kRRggRRk', '.kRggRk.', 'mkR..Rkm', 'o.m..m.o', '.o....o.',
  ];
  const APAL = { g: '#c8981a', G: '#f0c860', f: '#e0b088', k: '#1a2040', R: '#2a4a9a', m: '#25335c', o: '#141c36' };
  const KNIGHT = ['..ss..', '.sSSs.', '.s..s.', 'sSSSSs', 'sS..Ss', '.m..m.'];
  const KNIGHTPAL = { s: '#7a8296', S: '#a8b0c4', m: '#3a4054' };
  const MORDRED = ['..kk..', '.kKKk.', '.krrk.', 'kKKKKk', 'kK..Kk', '.m..m.'];
  const MORDREDPAL = { k: '#1a1420', K: '#2e2438', r: '#e83848', m: '#120c18' };
  const LADY = ['..ww..', '.wWWw.', '.wffw.', '..ww..', '.wWWw.', 'wW..Ww', '.w..w.'];
  const LADYPAL = { w: '#9ab8d0', W: '#d8ecf8', f: '#e8d0c0' };

  function knightDuel(cfg) {
    /* shared high/low parry-duel core: foe telegraphs HIGH or LOW, you tap the
       matching half to parry, then a strike window opens — tap the foe. */
    return {
      name: cfg.name, boss: !!cfg.boss, help: cfg.help || 'PARRY: tap TOP or BOTTOM half · then STRIKE him',
      winText: cfg.winText, loseText: cfg.loseText,
      init(api) {
        this.hp = cfg.hp - (cfg.shrink && api.has('excalibur') ? 1 : 0);
        this.maxHp = this.hp;
        this.wounds = 0; this.maxW = cfg.lives + (cfg.grace && api.has('grail') ? 1 : 0);
        this.state = 'idle'; this.stT = 1.2; this.attack = 0; this.strikeT = 0;
        this.tele = (api.has('excalibur') ? 1.0 : 0.8) * (cfg.teleMul || 1);
        this.feint = cfg.feint || 0;
      },
      update(api, dt) {
        this.stT -= dt;
        if (this.state === 'idle' && this.stT <= 0) {
          this.attack = api.rint(0, 1); // 0 high, 1 low
          this.isFeint = Math.random() < this.feint;
          this.state = 'tele'; this.stT = this.tele; api.audio.sfx('blip');
        } else if (this.state === 'tele' && this.stT <= 0) {
          if (this.isFeint) { this.state = 'idle'; this.stT = api.rnd(0.5, 0.9); }
          else {
            // unparried strike lands
            this.wounds++; this.state = 'idle'; this.stT = api.rnd(0.9, 1.4);
            api.shake(7, 0.35); api.flash(C.crimson, 0.25); api.audio.sfx('hurt');
            if (this.wounds >= this.maxW) return api.lose();
          }
        } else if (this.state === 'open' && this.stT <= 0) { this.state = 'idle'; this.stT = api.rnd(0.8, 1.3); }
        if (api.pointer.justDown) {
          const half = api.pointer.y < api.H / 2 ? 0 : 1;
          if (this.state === 'tele') {
            if (this.isFeint) { /* swinging at a feint costs nothing but time */ api.audio.sfx('blip'); }
            else if (half === this.attack) {
              this.state = 'open'; this.stT = 0.9; api.addScore(15); api.audio.sfx('shoot'); api.burst(api.W / 2, api.H / 2, C.steel, 8); api.flash('#e8f0ff', 0.1);
            } else {
              this.wounds++; this.state = 'idle'; this.stT = api.rnd(0.9, 1.4);
              api.shake(7, 0.35); api.flash(C.crimson, 0.25); api.audio.sfx('hurt');
              if (this.wounds >= this.maxW) return api.lose();
            }
          } else if (this.state === 'open') {
            this.hp--; this.state = 'idle'; this.stT = api.rnd(1.0, 1.5);
            api.addScore(40); api.audio.sfx('explode'); api.shake(5, 0.25); api.burst(api.W / 2, api.H * 0.4, C.gold, 12);
            if (this.hp <= 0) { api.addScore(cfg.bounty || 80); return api.win(); }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        cfg.arena(api, t);
        // the foe — large, centered, animated by state
        const fy = H * 0.34 + Math.sin(t * 1.6) * 3;
        const foe = cfg.foe || KNIGHT, pal = cfg.foePal || KNIGHTPAL;
        if (this.state === 'tele' && Math.floor(t * 10) % 2) g2.glow(W / 2, fy + 20, 40, this.isFeint ? '#8a96b8' : C.crimson, 0.5);
        if (this.state === 'open') g2.glow(W / 2, fy + 20, 44, C.gold, 0.6);
        g2.bigSprite(foe, W / 2 - 18, fy, pal, 6, { shadow: true, outline: '#0a0c14' });
        // his blade, raised high or swept low during telegraph
        if (this.state === 'tele') {
          c.strokeStyle = C.steel; c.lineWidth = 4;
          c.beginPath();
          if (this.attack === 0) { c.moveTo(W / 2 + 20, fy + 6); c.lineTo(W / 2 + 44, fy - 18); }
          else { c.moveTo(W / 2 + 20, fy + 30); c.lineTo(W / 2 + 46, fy + 44); }
          c.stroke();
          api.txtCFit(this.attack === 0 ? '⚔ HIGH!' : '⚔ LOW!', W / 2, fy - 26, 10, this.isFeint ? '#a8b0c4' : '#ff9a70');
        }
        if (this.state === 'open') api.txtCFit('▸ STRIKE! ◂', W / 2, fy - 26, 11, C.goldHi);
        // parry halves guide
        c.fillStyle = 'rgba(240,200,96,.05)'; c.fillRect(0, 0, W, H / 2);
        c.strokeStyle = 'rgba(240,200,96,.2)'; c.setLineDash([4, 8]); c.beginPath(); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke(); c.setLineDash([]);
        api.txtC('HIGH GUARD', W / 2, 26, 7, 'rgba(240,220,160,.5)');
        api.txtC('LOW GUARD', W / 2, H - 60, 7, 'rgba(240,220,160,.5)');
        // your sword arm, foreground
        g2.bigSprite(ARTHUR_A, W / 2 - 60, H - 96, APAL, 4, { shadow: true, outline: '#0a0c14' });
        c.strokeStyle = C.steel; c.lineWidth = 3; c.beginPath(); c.moveTo(W / 2 - 34, H - 78); c.lineTo(W / 2 - 12, H - 104); c.stroke();
        // HUD
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,10,24,.85)', '#2a3a6a', 1);
        api.txt(cfg.hudName || 'FOE', 11, 8, 8, C.crimson);
        for (let i = 0; i < this.maxHp; i++) g.rect(52 + i * 11, 8, 8, 8, i < this.hp ? C.crimson : '#241a2a');
        api.txtCFit('WOUNDS ' + this.wounds + '/' + this.maxW, W - 50, 8, 8, C.dim, false, 92);
        api.vignette();
      },
    };
  }

  /* ================== SWORD p1: the sword in the stone ==================== */
  function pull() {
    return {
      name: 'THE SWORD IN THE STONE', boss: false,
      help: 'TAP LEFT and RIGHT by turns — heave when the light burns gold',
      winText: 'The blade slides free as if from butter. The churchyard goes silent.',
      loseText: 'The sword holds fast. The lords laugh, and the squire goes red.',
      init(api) { this.grip = 0; this.need = 100; this.last = -1; this.slack = 0; this.pulse = 0; },
      update(api, dt) {
        this.pulse = 0.5 + 0.5 * Math.sin(api.t * 2.2);
        const hot = this.pulse > 0.62;
        this.grip = Math.max(0, this.grip - (hot ? 2.5 : 7) * dt);
        if (api.pointer.justDown) {
          const side = api.pointer.x < api.W / 2 ? 0 : 1;
          if (side !== this.last) {
            this.last = side;
            this.grip += hot ? 4.2 : 1.4;
            api.addScore(hot ? 6 : 2); api.audio.sfx(hot ? 'coin' : 'blip');
            if (hot) api.burst(api.W / 2, api.H - 150, C.gold, 4);
            if (this.grip >= this.need) { api.addScore(80); return api.win(); }
          } else { this.grip = Math.max(0, this.grip - 3); api.audio.sfx('hurt'); }
        }
        this.slack += dt; if (api.pointer.justDown) this.slack = 0;
        if (this.slack > 14) return api.lose();
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // London churchyard, New Year's morn — frost, onlookers, the stone
        g2.skyGradient([[0, '#28448a'], [0.6, '#7aa0d0'], [1, '#c8d8ec']], H * 0.5);
        // church silhouette
        c.fillStyle = '#22366a'; c.fillRect(20, H * 0.2, 70, H * 0.3); c.beginPath(); c.moveTo(20, H * 0.2); c.lineTo(55, H * 0.08); c.lineTo(90, H * 0.2); c.fill();
        c.fillStyle = '#e8c060'; c.fillRect(48, H * 0.28, 12, 18);
        g2.verticalGradient(0, H * 0.5, W, H * 0.5, [[0, '#a8b8c8'], [1, '#68788a']]); // frosted ground
        for (let i = 0; i < 20; i++) { const fx = (i * 47 + 13) % W, fy = H * 0.52 + ((i * 71) % (H * 0.42)); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(fx, fy, 2, 1); }
        // ring of doubtful lords
        for (let i = 0; i < 5; i++) {
          const lx = 26 + i * 54, ly = H * 0.42 + (i % 2) * 8;
          g2.bigSprite(['.hh.', 'hffh', 'cccc', 'c..c'], lx, ly, { h: ['#6a2a2a', '#2a4a6a', '#4a3a6a', '#2a5a3a', '#5a4a2a'][i], f: '#e0c0a0', c: '#3a3448' }, 3, { outline: '#141a2a' });
        }
        // the anvil-stone with the sword
        const hot = this.pulse > 0.62;
        c.fillStyle = '#5a5c74'; c.beginPath(); c.ellipse(W / 2, H - 96, 52, 20, 0, 0, 7); c.fill();
        c.fillStyle = '#7a7c94'; c.beginPath(); c.ellipse(W / 2, H - 102, 44, 16, 0, 0, 7); c.fill();
        c.fillStyle = '#3a3c50'; c.fillRect(W / 2 - 20, H - 130, 40, 22);
        // the sword, quivering with grip
        const quiver = Math.sin(t * 30) * (this.grip / this.need) * 2;
        const rise = (this.grip / this.need) * 16;
        g2.glow(W / 2, H - 170 - rise, 26 + this.pulse * 14, hot ? '#ffe9a8' : '#bfd0e8', hot ? 0.65 : 0.3);
        c.save(); c.translate(W / 2 + quiver, -rise);
        c.fillStyle = C.steel; c.fillRect(-2, H - 196, 5, 68);
        c.fillStyle = '#eef4fa'; c.fillRect(-1, H - 194, 2, 64);
        c.fillStyle = C.gold; c.fillRect(-12, H - 202, 25, 5); c.fillRect(-2, H - 216, 5, 14);
        c.beginPath(); c.arc(0.5, H - 219, 4.5, 0, 7); c.fill();
        c.restore();
        // young Arthur straining at the hilt
        g2.bigSprite(this.last === 0 ? ARTHUR_A : ARTHUR_B, W / 2 - 52, H - 176, APAL, 4, { shadow: true, outline: '#101426' });
        // tap zones
        c.fillStyle = 'rgba(240,200,96,' + (this.last === 1 ? 0.08 : 0.03) + ')'; c.fillRect(0, 0, W / 2, H);
        c.fillStyle = 'rgba(240,200,96,' + (this.last === 0 ? 0.08 : 0.03) + ')'; c.fillRect(W / 2, 0, W / 2, H);
        api.txtC('◀ HEAVE', 56, H - 40, 9, this.last === 1 ? C.goldHi : 'rgba(240,220,160,.5)');
        api.txtC('HEAVE ▶', W - 56, H - 40, 9, this.last === 0 ? C.goldHi : 'rgba(240,220,160,.5)');
        if (hot) api.txtCFit('— NOW! —', W / 2, H - 250, 11, C.goldHi);
        // grip meter
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,10,24,.85)', '#2a3a6a', 1);
        api.txt('GRIP', 11, 8, 8, C.gold);
        g.rect(48, 9, W - 62, 6, '#1a2040'); g.rect(48, 9, (W - 62) * clamp(this.grip / this.need, 0, 1), 6, hot ? C.goldHi : C.gold);
        api.vignette();
      },
    };
  }
  /* ============ SWORD p2 (boss): Sir Kay's tournament duel ================ */
  function kay() {
    return knightDuel({
      name: "THE DOUBTERS' CHAMPION", boss: true, hp: 3, lives: 3,
      hudName: 'CHAMPION',
      winText: 'The champion yields. The lords kneel — some slower than others.',
      loseText: 'The crowd roars for the champion. The boy king waits another year.',
      arena(api, t) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
        // tourney ground: stands, pennants
        g2.skyGradient([[0, '#3a60b0'], [1, '#8ab0e0']], H * 0.3);
        c.fillStyle = '#5a3c1c'; c.fillRect(0, H * 0.3, W, 40);
        for (let x = 6; x < W; x += 24) { c.fillStyle = ['#b02030', '#16307a', '#c8981a'][Math.floor(x / 24) % 3]; c.beginPath(); c.moveTo(x, H * 0.3 - 12); c.lineTo(x + 8, H * 0.3 - 12); c.lineTo(x + 4, H * 0.3); c.fill(); }
        // crowd dots
        for (let i = 0; i < 40; i++) { const cx2 = (i * 29 + 7) % W, cy2 = H * 0.31 + ((i * 13) % 30); c.fillStyle = 'rgba(240,220,190,' + (0.3 + (i % 3) * 0.15) + ')'; c.fillRect(cx2, cy2, 3, 3); }
        g2.verticalGradient(0, H * 0.3 + 40, W, H, [[0, '#7a9a4a'], [1, '#3a5a24']]);
        g2.fog(t, { y0: H * 0.8, y1: H, bands: 2, color: '#c8d8b0', alpha: 0.06 });
      },
    });
  }
  /* ============ LAKE (optional): the Lady of the Lake ===================== */
  function lady() {
    return {
      name: 'THE LADY OF THE LAKE', boss: false,
      help: 'HOLD the skiff inside the calm water as it drifts',
      winText: 'A hand clothed in white samite. The blade is yours — for a while.',
      loseText: 'The mists close, and the arm sinks back beneath the mere.',
      init(api) { this.time = 20; this.cx = api.W / 2; this.cy = api.H * 0.62; this.r = 52; this.x = api.W / 2; this.y = api.H * 0.62; this.out = 0; this.wanderT = 0; },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.time -= dt;
        // the calm zone drifts on slow currents, shrinking over time
        this.wanderT += dt;
        this.cx = W / 2 + Math.sin(this.wanderT * 0.5) * 60 + Math.sin(this.wanderT * 1.3) * 18;
        this.cy = H * 0.60 + Math.cos(this.wanderT * 0.4) * 60;
        this.r = 52 - (20 - this.time) * 1.1;
        if (api.pointer.down) { this.x += (api.pointer.x - this.x) * 0.18; this.y += (api.pointer.y - this.y) * 0.18; }
        this.x = clamp(this.x, 20, W - 20); this.y = clamp(this.y, H * 0.34, H - 40);
        const inside = Math.hypot(this.x - this.cx, this.y - this.cy) < this.r;
        if (inside) { this.out = 0; api.addScore(8 * dt); }
        else { this.out += dt; if (this.out > 2.2) return api.lose(); }
        if (this.time <= 0) { api.addScore(80); return api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the mere at dusk — utter stillness, mist banks
        g2.skyGradient([[0, '#2a3a6a'], [0.6, '#4a6a9a'], [1, '#7a9ac0']], H * 0.32);
        c.fillStyle = '#16233a'; c.beginPath(); c.moveTo(0, H * 0.32);
        for (let x = 0; x <= W; x += 14) c.lineTo(x, H * 0.32 - Math.abs(Math.sin(x * 0.06 + 3)) * 12);
        c.lineTo(W, H * 0.32); c.fill();
        g2.verticalGradient(0, H * 0.32, W, H * 0.68, [[0, '#38558a'], [1, '#16233a']]);
        // moonpath shimmer
        for (let i = 0; i < 16; i++) { const gy = H * 0.36 + i * 16; c.fillStyle = 'rgba(210,230,250,' + (0.12 - i * 0.006) + ')'; c.fillRect(W * 0.6 + Math.sin(t * 1.8 + i) * 8 - 10, gy, 20 + i, 2); }
        // THE CALM — a luminous ring on the water
        const inside = Math.hypot(this.x - this.cx, this.y - this.cy) < this.r;
        g2.glow(this.cx, this.cy, this.r, '#bfe0f0', inside ? 0.3 : 0.18);
        c.strokeStyle = inside ? 'rgba(200,240,255,.8)' : 'rgba(200,240,255,.4)'; c.lineWidth = 2;
        c.beginPath(); c.ellipse(this.cx, this.cy, this.r, this.r * 0.6, 0, 0, 7); c.stroke();
        // the arm, rising at the calm's centre
        const ay = this.cy - 14 + Math.sin(t * 1.4) * 2;
        c.fillStyle = '#e8ecf4'; c.fillRect(this.cx - 2, ay - 16, 5, 20);
        c.fillStyle = C.steel; c.fillRect(this.cx - 1, ay - 44, 3, 28);
        c.fillStyle = C.gold; c.fillRect(this.cx - 7, ay - 46, 15, 3);
        g2.glow(this.cx, ay - 34, 14, '#e8f4ff', 0.5 + 0.2 * Math.sin(t * 3));
        // your skiff
        c.fillStyle = 'rgba(200,220,240,.3)'; c.beginPath(); c.ellipse(this.x, this.y + 12, 20, 5, 0, 0, 7); c.fill();
        g2.bigSprite(['.gg.', 'gffg', 'hhhh', '.hh.'], this.x - 10, this.y - 14, { g: '#c8981a', f: '#e0b088', h: '#3a2814' }, 5, { outline: '#101426' });
        if (!inside && Math.floor(t * 6) % 2) api.txtCFit('BACK TO THE CALM!', W / 2, H - 44, 9, '#ffd0a0');
        // mist rolling over everything
        g2.fog(t, { y0: H * 0.32, y1: H, bands: 6, color: '#b8cce0', alpha: 0.09 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,10,24,.85)', '#2a3a6a', 1);
        api.txt('COMMUNION · ' + Math.ceil(this.time) + 's', 11, 8, 8, '#bfe0f0');
        g.rect(W - 60, 9, 50, 6, '#1a2040'); g.rect(W - 60, 9, 50 * clamp(1 - this.out / 2.2, 0, 1), 6, this.out > 1.2 ? C.crimson : '#bfe0f0');
        api.vignette();
      },
    };
  }
  /* ================= LANCELOT p1: the joust ============================== */
  function joust() {
    return {
      name: 'THE JOUST', boss: false,
      help: 'DRAG to aim your lance as you close — strike the shield square',
      winText: 'Three lances shattered fair. The stranger knight salutes.',
      loseText: 'Unhorsed twice — the marshal waves you from the lists.',
      init(api) { this.pass = 0; this.passes = 0; this.hits = 0; this.need = 3; this.falls = 0; this.maxF = 2; this.z = 0; this.aim = api.H * 0.5; this.foeAim = 0; this.running = true; this.msg = ''; this.msgT = 0; },
      startPass(api) { this.z = 0; this.running = true; this.foeAim = api.rnd(-30, 30); },
      update(api, dt) {
        const H = api.H;
        if (this.msgT > 0) { this.msgT -= dt; if (this.msgT <= 0 && !this.running) this.startPass(api); return; }
        this.z += dt / 2.6; // one pass ≈ 2.6s
        if (api.pointer.down) this.aim += (api.pointer.y - this.aim) * 0.2;
        this.aim = clamp(this.aim, H * 0.3, H * 0.72);
        if (this.z >= 1) {
          this.passes++;
          const target = H * 0.5 + this.foeAim;
          const off = Math.abs(this.aim - target);
          if (off < 26) {
            this.hits++; api.addScore(50); api.audio.sfx('explode'); api.shake(8, 0.4); api.flash('#fff0d0', 0.2);
            this.msg = 'A FAIR STRIKE! (' + this.hits + '/' + this.need + ')'; this.msgT = 1.4; this.running = false;
            if (this.hits >= this.need) { api.addScore(70); return api.win(); }
          } else {
            this.falls++; api.shake(9, 0.5); api.flash(C.crimson, 0.25); api.audio.sfx('hurt');
            this.msg = 'UNHORSED!'; this.msgT = 1.4; this.running = false;
            if (this.falls >= this.maxF) return api.lose();
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the lists: barrier rail, stands, closing knight
        g2.skyGradient([[0, '#3a60b0'], [1, '#9ac0e8']], H * 0.26);
        c.fillStyle = '#5a3c1c'; c.fillRect(0, H * 0.26, W, 34);
        for (let i = 0; i < 30; i++) { const cx2 = (i * 31 + 11) % W, cy2 = H * 0.27 + ((i * 17) % 24); c.fillStyle = 'rgba(240,220,190,' + (0.3 + (i % 3) * 0.15) + ')'; c.fillRect(cx2, cy2, 3, 3); }
        for (let x = 8; x < W; x += 30) { c.fillStyle = ['#b02030', '#16307a'][Math.floor(x / 30) % 2]; c.beginPath(); c.moveTo(x, H * 0.26 - 10); c.lineTo(x + 8, H * 0.26 - 10); c.lineTo(x + 4, H * 0.26); c.fill(); }
        g2.verticalGradient(0, H * 0.26 + 34, W, H, [[0, '#7a9a4a'], [1, '#3a5a24']]);
        // the tilt barrier — perspective rail down the centre
        c.fillStyle = '#6a4a24'; c.beginPath(); c.moveTo(W / 2 - 4, H * 0.30); c.lineTo(W / 2 + 4, H * 0.30); c.lineTo(W / 2 + 26, H); c.lineTo(W / 2 - 26, H); c.closePath(); c.fill();
        c.fillStyle = '#8a6434'; c.beginPath(); c.moveTo(W / 2 - 4, H * 0.30); c.lineTo(W / 2, H * 0.30); c.lineTo(W / 2 - 14, H); c.lineTo(W / 2 - 26, H); c.closePath(); c.fill();
        // the oncoming knight grows with z
        const kz = this.running || this.msgT <= 0 ? this.z : 1;
        const ks = 1.5 + kz * 4.5, kx = W / 2 + 40 + kz * 26, ky = H * 0.34 + kz * H * 0.28 + this.foeAim * kz;
        // horse
        c.fillStyle = '#3a2c1c'; c.beginPath(); c.ellipse(kx, ky + 12 * (ks / 5), 12 * ks / 3, 6 * ks / 3, 0, 0, 7); c.fill();
        g2.bigSprite(KNIGHT, kx - 3 * ks, ky - 6 * ks, KNIGHTPAL, ks, { shadow: true, outline: '#141a2a' });
        // his shield — the target
        const shx = kx - 8 * ks / 3, shy = ky + this.foeAim * 0.2;
        c.fillStyle = C.banner; c.beginPath(); c.moveTo(shx - 5 * ks / 3, shy - 6 * ks / 3); c.lineTo(shx + 5 * ks / 3, shy - 6 * ks / 3); c.lineTo(shx, shy + 7 * ks / 3); c.closePath(); c.fill();
        c.strokeStyle = C.gold; c.lineWidth = 1.5; c.stroke();
        // your lance from bottom-left, aimed at this.aim
        const la = this.aim;
        c.strokeStyle = '#8a6434'; c.lineWidth = 7; c.beginPath(); c.moveTo(30, H - 20); c.lineTo(W / 2 + 10, la); c.stroke();
        c.strokeStyle = '#af8248'; c.lineWidth = 3; c.beginPath(); c.moveTo(30, H - 20); c.lineTo(W / 2 + 10, la); c.stroke();
        c.fillStyle = C.steel; c.beginPath(); c.arc(W / 2 + 12, la, 4, 0, 7); c.fill();
        // aim reticle vs target hint
        const target = H * 0.5 + this.foeAim;
        c.strokeStyle = 'rgba(240,200,96,.5)'; c.lineWidth = 1.5; c.beginPath(); c.arc(W / 2 + 12, la, 9, 0, 7); c.stroke();
        if (Math.abs(la - target) < 26) { g2.glow(W / 2 + 12, la, 14, C.gold, 0.5); }
        // your horse's head bobbing at frame bottom
        const bob = Math.sin(t * 10) * 3;
        c.fillStyle = '#4a3418'; c.beginPath(); c.ellipse(56, H - 28 + bob, 26, 12, -0.3, 0, 7); c.fill();
        c.fillStyle = '#2a1c0c'; c.fillRect(70, H - 44 + bob, 8, 14);
        g2.embers(t, 6, { yBottom: H, yTop: H * 0.6, color: '#d8c8a0', speed: 0.15, size: 2, alpha: 0.3 });
        if (this.msgT > 0) api.txtCFit(this.msg, W / 2, H * 0.14, 12, this.msg.includes('FAIR') ? C.goldHi : '#ff9a80');
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,10,24,.85)', '#2a3a6a', 1);
        api.txt('LANCES ' + this.hits + '/' + this.need, 11, 8, 8, C.gold);
        for (let i = 0; i < this.maxF; i++) g.rect(W - 33 + i * 13, 8, 9, 8, i < this.maxF - this.falls ? C.gold : '#241a2a');
        api.vignette();
      },
    };
  }
  /* ============ LANCELOT p2 (boss): the stranger knight =================== */
  function lancelot() {
    return knightDuel({
      name: 'THE STRANGER KNIGHT', boss: true, hp: 4, lives: 3, shrink: true, feint: 0.25,
      hudName: 'LANCELOT',
      winText: 'He raises his visor, laughing. "My king." Camelot gains its champion.',
      loseText: 'You wake by the ford with a ringing skull and a new respect.',
      teleMul: 0.9,
      arena(api, t) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
        // a ford in the greenwood
        g2.skyGradient([[0, '#2a5a3a'], [0.7, '#4a8a4a'], [1, '#7ab060']], H * 0.4);
        for (const px of [24, W - 30, 60, W - 70]) {
          c.fillStyle = '#1c3a24'; c.fillRect(px - 3, H * 0.1, 7, H * 0.34);
          c.fillStyle = '#2a5434'; c.beginPath(); c.arc(px, H * 0.12, 18, 0, 7); c.fill();
        }
        g2.verticalGradient(0, H * 0.4, W, H * 0.2, [[0, '#4a7a9a'], [1, '#2a4a6a']]);
        c.strokeStyle = 'rgba(200,230,240,.3)'; for (let i = 0; i < 3; i++) { const sy = H * 0.44 + i * 12; c.beginPath(); for (let x = 0; x <= W; x += 8) c.lineTo(x, sy + Math.sin(t * 2.4 + x * 0.08 + i) * 2); c.stroke(); }
        g2.verticalGradient(0, H * 0.6, W, H * 0.4, [[0, '#4a6a34'], [1, '#243c1c']]);
        g2.embers(t, 8, { yBottom: H * 0.5, yTop: 30, color: '#c8e890', speed: 0.04, size: 2, alpha: 0.35 });
      },
    });
  }
  /* ================== GRAIL p1: the trial of virtue ======================= */
  function virtues() {
    return {
      name: 'THE TRIAL OF VIRTUE', boss: false,
      help: 'CATCH the grail-light · let gold and crowns fall past',
      winText: 'The light fills the chapel. The pure of heart may look upon it.',
      loseText: 'Your hands close on treasure, and the vision goes out like a candle.',
      init(api) { this.x = api.W / 2; this.caught = 0; this.need = 14; this.sins = 0; this.maxS = 3; this.drops = []; this.spawnT = 0.5; },
      update(api, dt) {
        const W = api.W, H = api.H;
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.28; this.x = clamp(this.x, 20, W - 20);
        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          this.drops.push({ x: api.rnd(20, W - 20), y: 100, s: api.rnd(1.7, 2.5), kind: Math.random() < 0.55 ? 0 : api.rint(1, 2) });
          this.spawnT = api.rnd(0.4, 0.75);
        }
        for (const d of this.drops) d.y += d.s * dt * 60;
        const py = H - 78;
        for (const d of this.drops) {
          if (!d.dead && Math.abs(d.x - this.x) < 17 && Math.abs(d.y - py) < 16) {
            d.dead = true;
            if (d.kind === 0) { this.caught++; api.addScore(20); api.audio.sfx('coin'); api.burst(d.x, d.y, '#ffe9a8', 8); if (this.caught >= this.need) { api.addScore(70); return api.win(); } }
            else { this.sins++; api.shake(6, 0.3); api.flash('#6a4a10', 0.25); api.audio.sfx('hurt'); if (this.sins >= this.maxS) return api.lose(); }
          }
        }
        this.drops = this.drops.filter((d) => !d.dead && d.y < H + 14);
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the Chapel Perilous — candlelit nave, rose window
        g2.verticalGradient(0, 0, W, H, [[0, '#1a1430'], [0.6, '#241a3c'], [1, '#120c20']]);
        g2.stoneWall(0, 0, W, H * 0.4, { base: '#2a2444', light: '#3c3458', dark: '#1a162e', mortar: '#100c1e', moss: '#2a2a44' }, 0);
        // rose window bleeding coloured light
        g2.glow(W / 2, 78, 44, '#c86a8a', 0.3);
        c.fillStyle = '#180e22'; c.beginPath(); c.arc(W / 2, 78, 30, 0, 7); c.fill();
        for (let i = 0; i < 6; i++) { const a = i * 1.047 + t * 0.1; c.fillStyle = ['#b04060', '#4060b0', '#c8981a'][i % 3]; c.beginPath(); c.moveTo(W / 2, 78); c.arc(W / 2, 78, 26, a, a + 0.42); c.closePath(); c.fill(); }
        c.fillStyle = '#100a18'; c.beginPath(); c.arc(W / 2, 78, 8, 0, 7); c.fill();
        // candle rows
        for (const px of [26, W - 26]) { for (let i = 0; i < 3; i++) { const cy2 = 150 + i * 90; g2.flame(px, cy2, t, 0.7); c.fillStyle = '#d8d0b8'; c.fillRect(px - 2, cy2 + 2, 4, 12); } }
        g2.verticalGradient(0, H * 0.4, W, H * 0.6, [[0, '#241c38'], [1, '#100c1c']]);
        for (let i = 0; i < 4; i++) { c.strokeStyle = 'rgba(200,170,220,.08)'; c.beginPath(); c.moveTo(W / 2 + (i - 1.5) * 40, H * 0.4); c.lineTo(W / 2 + (i - 1.5) * 130, H); c.stroke(); }
        // the falling trials
        for (const d of this.drops) {
          if (d.kind === 0) { // grail-light — a soft golden mote
            g2.glow(d.x, d.y, 12, '#ffe9a8', 0.6);
            c.fillStyle = '#fff4d0'; c.beginPath(); c.arc(d.x, d.y, 4, 0, 7); c.fill();
            c.fillStyle = 'rgba(255,233,168,.6)'; c.fillRect(d.x - 1, d.y - 9, 2, 18); c.fillRect(d.x - 9, d.y - 1, 18, 2);
          } else if (d.kind === 1) { // coin
            c.fillStyle = '#c8981a'; c.beginPath(); c.arc(d.x, d.y, 7, 0, 7); c.fill();
            c.fillStyle = '#f0c860'; c.beginPath(); c.arc(d.x - 2, d.y - 2, 4, 0, 7); c.fill();
          } else { // crown
            c.fillStyle = '#c8981a'; c.beginPath(); c.moveTo(d.x - 8, d.y + 4); c.lineTo(d.x - 8, d.y - 4); c.lineTo(d.x - 3, d.y); c.lineTo(d.x, d.y - 6); c.lineTo(d.x + 3, d.y); c.lineTo(d.x + 8, d.y - 4); c.lineTo(d.x + 8, d.y + 4); c.closePath(); c.fill();
          }
        }
        // Galahad-hearted Arthur with open hands
        g2.bigSprite(ARTHUR_A, this.x - 16, H - 92, APAL, 4, { shadow: true, outline: '#0c0a18' });
        g2.glow(this.x, H - 74, 18, '#ffe9a8', 0.2);
        g2.embers(t, 10, { yBottom: H, yTop: 0, color: '#c8a8e0', speed: 0.05, size: 2, alpha: 0.3 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,8,20,.85)', '#3a2a5a', 1);
        api.txt('LIGHT ' + this.caught + '/' + this.need, 11, 8, 8, '#ffe9a8');
        for (let i = 0; i < this.maxS; i++) g.rect(W - 46 + i * 13, 8, 9, 8, i < this.maxS - this.sins ? '#c8a8e0' : '#241a2a');
        api.vignette();
      },
    };
  }
  /* ============= GRAIL p2 (boss): the vision and the veils ================ */
  function vision() {
    return {
      name: 'THE GRAIL VISION', boss: true,
      help: 'TAP only the TRUE grail — the phantoms ring hollow',
      winText: 'For one heartbeat you hold it, and it holds you. It is enough.',
      loseText: 'A phantom crumbles to ash in your hands. The quest goes on.',
      init(api) {
        this.round = 0; this.need = 5; this.fails = 0; this.maxF = api.has('grail') ? 4 : 3;
        this.spots = []; this.true = 0; this.showT = 0; this.state = 'spawn'; this.gapT = 0.6;
      },
      spawn(api) {
        const n = Math.min(3 + Math.floor(this.round / 2), 5);
        this.spots = [];
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2 + this.round;
          this.spots.push({ x: api.W / 2 + Math.cos(a) * 82, y: api.H * 0.48 + Math.sin(a) * 110 });
        }
        this.true = api.rint(0, n - 1);
        this.state = 'show'; this.showT = api.has('excalibur') ? 1.6 : 1.3;
      },
      update(api, dt) {
        if (this.state === 'spawn') { this.gapT -= dt; if (this.gapT <= 0) this.spawn(api); return; }
        this.showT -= dt;
        if (this.showT <= 0) { // vanished unchosen — no penalty, re-deal
          this.state = 'spawn'; this.gapT = 0.5; api.audio.sfx('blip'); return;
        }
        if (api.pointer.justDown) {
          for (let i = 0; i < this.spots.length; i++) {
            const s = this.spots[i];
            if (Math.hypot(api.pointer.x - s.x, api.pointer.y - s.y) < 30) {
              if (i === this.true) {
                this.round++; api.addScore(45); api.audio.sfx('win'); api.burst(s.x, s.y, '#ffe9a8', 14); api.flash('#fff4d0', 0.15);
                if (this.round >= this.need) { api.addScore(100); return api.win(); }
              } else {
                this.fails++; api.shake(6, 0.3); api.flash('#3a2a4a', 0.3); api.audio.sfx('hurt');
                if (this.fails >= this.maxF) return api.lose();
              }
              this.state = 'spawn'; this.gapT = 0.55;
              break;
            }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the wasteland chapel at midnight — starfield through a broken roof
        g2.verticalGradient(0, 0, W, H, [[0, '#0c0a20'], [0.5, '#181030'], [1, '#0a0818']]);
        g2.stars(t, 40, H * 0.4, '#c8c8f0');
        c.fillStyle = '#0a0814';
        c.beginPath(); c.moveTo(0, 0); c.lineTo(W * 0.3, 0); c.lineTo(0, H * 0.3); c.fill();
        c.beginPath(); c.moveTo(W, 0); c.lineTo(W * 0.7, 0); c.lineTo(W, H * 0.34); c.fill();
        // broken arches
        for (const px of [30, W - 30]) { c.strokeStyle = '#241c3a'; c.lineWidth = 9; c.beginPath(); c.arc(px, H * 0.5, 60, Math.PI, Math.PI * 1.5 + (px > W / 2 ? 0.4 : 0)); c.stroke(); }
        g2.fog(t * 0.6, { y0: H * 0.6, y1: H, bands: 4, color: '#4a3a6a', alpha: 0.1 });
        // the grails — true one hums gold, phantoms ring grey-violet
        if (this.state === 'show') {
          for (let i = 0; i < this.spots.length; i++) {
            const s = this.spots[i], isTrue = i === this.true;
            const pu = 0.5 + 0.5 * Math.sin(t * (isTrue ? 3 : 5) + i * 2);
            g2.glow(s.x, s.y, 24, isTrue ? '#ffe9a8' : '#8a7ab8', isTrue ? 0.5 + 0.2 * pu : 0.35);
            // cup
            c.fillStyle = isTrue ? C.gold : '#6a6288';
            c.beginPath(); c.moveTo(s.x - 11, s.y - 10); c.quadraticCurveTo(s.x, s.y + 7, s.x + 11, s.y - 10); c.closePath(); c.fill();
            c.fillRect(s.x - 1.5, s.y - 2, 4, 11); c.fillRect(s.x - 7, s.y + 9, 15, 3);
            if (isTrue) { c.fillStyle = '#fff4d0'; c.beginPath(); c.arc(s.x, s.y - 12, 3 + pu * 2, 0, 7); c.fill(); }
            else { c.globalAlpha = 0.5 + 0.3 * Math.sin(t * 7 + i * 3); c.fillStyle = '#0c0a20'; c.fillRect(s.x - 11, s.y - 10 + ((t * 40 + i * 9) % 18), 22, 2); c.globalAlpha = 1; }
          }
          api.txtCFit('WHICH RINGS TRUE?', W / 2, H - 52, 9, '#c8b8e8');
        } else api.txtCFit('the veils shift…', W / 2, H * 0.48, 10, '#6a5a8a');
        // round pips
        for (let i = 0; i < this.need; i++) g.rect(W / 2 - this.need * 7 + i * 14, H - 30, 9, 8, i < this.round ? '#ffe9a8' : 'rgba(255,255,255,.15)');
        g2.embers(t, 12, { yBottom: H, yTop: 0, color: '#a89ae0', speed: 0.06, size: 2, alpha: 0.35 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,8,20,.85)', '#3a2a5a', 1);
        api.txt('VISIONS ' + this.round + '/' + this.need, 11, 8, 8, '#ffe9a8');
        for (let i = 0; i < this.maxF; i++) g.rect(W - 59 + i * 13, 8, 9, 8, i < this.maxF - this.fails ? '#c8a8e0' : '#241a2a');
        api.vignette();
      },
    };
  }
  /* ================ CAMLANN p1: the last battle (lanes) =================== */
  function lastbattle() {
    return {
      name: 'THE LAST BATTLE', boss: false,
      help: "TAP Mordred's knights before they reach the standard",
      winText: 'The line holds until dusk — and then the field is only two men.',
      loseText: 'The dragon standard goes down into the mud of Camlann.',
      init(api) {
        this.time = 24; this.through = 0; this.max = api.has('rightful') ? 4 : 3;
        this.foes = []; this.spawnT = 0.8; this.slain = 0;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.time -= dt;
        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          this.foes.push({ lane: api.rint(0, 2), y: 116, s: api.rnd(46, 66) * (this.time < 10 ? 1.25 : 1) });
          this.spawnT = api.rnd(0.55, 1.0) * (this.time < 10 ? 0.75 : 1);
        }
        for (const f of this.foes) {
          f.y += f.s * dt;
          if (!f.dead && f.y > H - 96) {
            f.dead = true; this.through++; api.shake(7, 0.35); api.flash(C.crimson, 0.25); api.audio.sfx('hurt');
            if (this.through >= this.max) return api.lose();
          }
        }
        if (api.pointer.justDown) {
          for (const f of this.foes) {
            const fx = api.W * (0.25 + f.lane * 0.25);
            if (!f.dead && Math.hypot(api.pointer.x - fx, api.pointer.y - f.y) < 26) {
              f.dead = true; this.slain++; api.addScore(18); api.audio.sfx('shoot'); api.burst(fx, f.y, C.steel, 8);
              break;
            }
          }
        }
        this.foes = this.foes.filter((f) => !f.dead);
        if (this.time <= 0) { api.addScore(90); return api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // Camlann at dusk — a bruised sky, smoke, the dragon standard behind you
        g2.skyGradient([[0, '#3a1a2a'], [0.5, '#7a3428'], [1, '#b0682a']], H * 0.28);
        g2.glow(W * 0.7, H * 0.16, 30, '#ff9a50', 0.4); c.fillStyle = '#e88a40'; c.beginPath(); c.arc(W * 0.7, H * 0.16, 13, 0, 7); c.fill();
        // battle smoke columns
        for (const sx of [40, 200]) { for (let i = 0; i < 4; i++) { const sp = (t * 0.4 + i * 0.25 + sx) % 1; c.globalAlpha = (1 - sp) * 0.3; c.fillStyle = '#2a2028'; c.beginPath(); c.arc(sx + Math.sin(sp * 5) * 8, H * 0.28 - sp * 60, 8 + sp * 10, 0, 7); c.fill(); c.globalAlpha = 1; } }
        // churned field
        g2.verticalGradient(0, H * 0.28, W, H * 0.72, [[0, '#4a3a24'], [1, '#241a10']]);
        for (let i = 0; i < 24; i++) { const mx = (i * 47 + 13) % W, my = H * 0.32 + ((i * 61) % (H * 0.55)); c.fillStyle = 'rgba(16,10,6,.5)'; c.beginPath(); c.ellipse(mx, my, 8, 3, 0, 0, 7); c.fill(); }
        // fallen spears
        for (let i = 0; i < 5; i++) { const px = 20 + i * 56; c.strokeStyle = '#3a2c18'; c.lineWidth = 2.5; c.save(); c.translate(px, H * 0.4 + (i % 3) * 60); c.rotate(-0.4 + (i % 2) * 0.9); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 26); c.stroke(); c.restore(); }
        // lanes
        for (let l = 0; l < 3; l++) { const lx = W * (0.25 + l * 0.25); c.fillStyle = 'rgba(240,200,96,.05)'; c.fillRect(lx - 26, 110, 52, H - 190); }
        // charging knights
        for (const f of this.foes) {
          const fx = W * (0.25 + f.lane * 0.25);
          const sc = 2.5 + (f.y - 116) / (H - 200) * 2.2;
          c.fillStyle = 'rgba(10,6,4,.4)'; c.beginPath(); c.ellipse(fx, f.y + 7 * sc / 3, 8 * sc / 3, 3 * sc / 3, 0, 0, 7); c.fill();
          g2.bigSprite(MORDRED, fx - 3 * sc, f.y - 5 * sc, MORDREDPAL, sc, { outline: '#0c0810' });
        }
        // your line: the dragon standard + two loyal knights at the foot
        const stX = W / 2;
        c.fillStyle = '#3a2c18'; c.fillRect(stX - 2, H - 148, 5, 70);
        const wv = Math.sin(t * 5) * 5;
        c.fillStyle = C.crimson; c.beginPath(); c.moveTo(stX + 3, H - 148); c.lineTo(stX + 46 + wv, H - 138); c.lineTo(stX + 3, H - 122); c.closePath(); c.fill();
        c.fillStyle = C.gold; c.beginPath(); c.arc(stX + 18 + wv * 0.3, H - 136, 4, 0, 7); c.fill();
        g2.bigSprite(ARTHUR_A, stX - 46, H - 88, APAL, 4, { shadow: true, outline: '#100c08' });
        g2.bigSprite(KNIGHT, stX + 18, H - 82, KNIGHTPAL, 4, { shadow: true, outline: '#100c08' });
        g2.fog(t, { y0: H * 0.7, y1: H, bands: 3, color: '#4a3828', alpha: 0.09 });
        g2.embers(t, 14, { yBottom: H, yTop: H * 0.2, color: '#ff9050', speed: 0.1, size: 2, alpha: 0.4 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(12,8,6,.85)', '#5a3424', 1);
        api.txt('HOLD · ' + Math.ceil(Math.max(0, this.time)) + 's', 11, 8, 8, C.gold);
        api.txtCFit('BREACHES ' + this.through + '/' + this.max, W - 50, 8, 8, C.dim, false, 92);
        api.vignette();
      },
    };
  }
  /* ============== CAMLANN p2 (boss): Mordred ============================== */
  function mordred() {
    return knightDuel({
      name: 'MORDRED', boss: true, hp: 5, lives: 3, shrink: true, feint: 0.35, grace: true,
      hudName: 'MORDRED', bounty: 130, teleMul: 0.85,
      winText: 'Father and son wound each other past mending. The rest is the barge.',
      loseText: 'The traitor stands over you as the sun goes out.',
      arena(api, t) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
        // the field at day's end — everyone else is dead
        g2.skyGradient([[0, '#241026'], [0.5, '#6a2428'], [1, '#c86a2a']], H * 0.36);
        g2.glow(W / 2, H * 0.34, 50, '#ff9a50', 0.5);
        c.fillStyle = '#f0a850'; c.beginPath(); c.arc(W / 2, H * 0.35, 20, 0, 7); c.fill();
        c.fillStyle = '#0e0a08';
        c.beginPath(); c.moveTo(0, H * 0.38); for (let x = 0; x <= W; x += 10) c.lineTo(x, H * 0.38 - Math.abs(Math.sin(x * 0.07)) * 6); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        g2.verticalGradient(0, H * 0.4, W, H * 0.6, [[0, '#2a1c14'], [1, '#120c08']]);
        // broken standards against the sunset
        for (const px of [30, 70, W - 40, W - 90]) { c.strokeStyle = '#0e0a08'; c.lineWidth = 3; c.save(); c.translate(px, H * 0.38); c.rotate(-0.3 + (px % 5) * 0.15); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -34); c.stroke(); c.fillStyle = 'rgba(80,20,24,.8)'; c.fillRect(-1, -34, 12, 8); c.restore(); }
        // crows
        for (let i = 0; i < 4; i++) { const cx2 = (t * 9 + i * 70) % (W + 40) - 20, cy2 = 60 + Math.sin(t * 1.4 + i) * 12; const f = Math.sin(t * 7 + i) > 0; c.strokeStyle = '#0a0808'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx2 - 4, cy2 + (f ? 2 : -2)); c.lineTo(cx2, cy2); c.lineTo(cx2 + 4, cy2 + (f ? 2 : -2)); c.stroke(); }
        g2.fog(t, { y0: H * 0.5, y1: H, bands: 4, color: '#3a241c', alpha: 0.1 });
        g2.embers(t, 10, { yBottom: H, yTop: H * 0.3, color: '#ff8040', speed: 0.08, size: 2, alpha: 0.4 });
      },
      foe: MORDRED, foePal: MORDREDPAL,
    });
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'arthur16', title: 'King Arthur', subtitle: 'THE ONCE AND FUTURE KING',
    currency: 'RENOWN', accent: C.gold, ownPhaseHud: true,
    titleFont: TITLE, uiFont: "'Pixelify Sans','Press Start 2P',monospace",
    credit: 'A 16-BIT LEGEND · THE MATTER OF BRITAIN',
    bootCta: 'TAP TO CLAIM THE SWORD', bootLine: 'FIVE QUESTS · ONE CROWN',
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.gold, blood: C.crimson, cream: C.cream, dim: C.dim },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'TAKE A SEAT AT THE TABLE', mapDone: 'THE LEGEND IS WRITTEN',
    screens: {
      overlay: 'rgba(6,10,26,.86)', win: C.goldHi, lose: '#d05a4a', chapterLabel: '#8a96b8',
      name: '#f4ecd8', sub: '#e8a050', intro: '#d0d8ec', quote: '#8a96b8', help: C.gold,
      score: '#f4ecd8', cur: C.goldHi, cta: '#f4ecd8',
    },
    labels: {
      chapter: 'QUEST', phase: 'TRIAL', boss: 'THE ORDEAL', score: 'RENOWN WON',
      win: 'THE LEGEND GROWS', lose: 'THE LEGEND WAITS', nextPhaseWin: 'THE TRIAL IS PASSED',
      cont: 'TAP TO RIDE ON', toMap: 'TAP FOR THE TABLE', play: 'TAP TO RIDE OUT',
      nextPhase: 'TAP TO RIDE ON', toFinale: 'TAP FOR AVALON',
    },
    upgrades: {
      rightful: { name: 'THE TRUE NAME', desc: 'the line holds one more breach' },
      excalibur: { name: 'EXCALIBUR', desc: 'foes telegraph longer, and fall faster' },
      lancelot: { name: "LANCELOT'S OATH", desc: 'renown flows more freely' },
      grail: { name: "THE GRAIL'S GRACE", desc: 'one wound forgiven at Camlann' },
    },
    nodes: [
      {
        id: 'sword', name: 'THE SWORD', sub: 'NEW YEAR IN LONDON', reward: 60, grant: 'rightful',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 1, y - 8, 3, 14, '#c8d0dc'); g.rect(x - 6, y - 3, 13, 2, '#f0c860'); },
        intro: ['A sword stands in an anvil of', 'stone in the churchyard, and', 'under it, letters of gold:', 'WHOSO PULLETH OUT THIS SWORD…'],
        quote: '…is rightwise king born of all England.',
        choice: { prompt: 'The sword is out. How does the boy speak?', options: [{ label: 'Boldly: "I am your king."', flag: 'bold' }, { label: 'Humbly: "If God wills it, I will serve."', flag: 'humble' }] },
        winText: 'Twice the lords demand it be tried again. Twice the boy obliges.',
        phases: [pull(), kay()],
      },
      {
        id: 'lake', name: 'THE LAKE', sub: 'AN ARM IN WHITE SAMITE', needs: ['sword'], optional: true, reward: 40, grant: 'excalibur',
        icon(api, x, y) { const c = api.ctx; c.strokeStyle = '#8ac0d0'; c.lineWidth = 2; for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(x - 8, y + i * 5 - 2); c.quadraticCurveTo(x, y + i * 5 - 6, x + 8, y + i * 5 - 2); c.stroke(); } api.gfx.rect(x - 1, y - 9, 2, 8, '#e8ecf4'); },
        intro: ['The sword of the stone broke', 'in battle. Merlin knows of', 'another — held above the water', 'of a still and misted mere.'],
        quote: 'Take it, and its scabbard too — for the scabbard is worth ten of the sword.',
        winText: 'Excalibur. The blade takes the light like a living thing.',
        phases: [lady()],
      },
      {
        id: 'lancelot', name: 'THE STRANGER', sub: 'A KNIGHT AT THE FORD', needs: ['sword'], reward: 60, grant: 'lancelot',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 7, y - 6, 3, 13, '#e8e8f0'); g.rect(x + 4, y - 6, 3, 13, '#e8e8f0'); g.rect(x - 2, y - 8, 3, 15, '#e8e8f0'); },
        intro: ['A knight in white holds the', 'ford against all comers and', 'has unhorsed forty men. The', 'king rides out himself.'],
        quote: 'And therewith they lashed together as two boars.',
        winText: 'His name is Lancelot du Lac — the best knight in the world, sworn.',
        phases: [joust(), lancelot()],
      },
      {
        id: 'grail', name: 'THE GRAIL', sub: 'THE CHAPEL PERILOUS', needs: ['lancelot'], reward: 70, grant: 'grail',
        icon(api, x, y) { const c = api.ctx; c.fillStyle = '#f0c860'; c.beginPath(); c.moveTo(x - 6, y - 5); c.quadraticCurveTo(x, y + 3, x + 6, y - 5); c.closePath(); c.fill(); c.fillRect(x - 1, y + 1, 2, 6); c.fillRect(x - 4, y + 7, 8, 2); },
        intro: ['At Pentecost the Grail passes', 'through the hall, veiled, and', 'every knight swears the quest.', 'Most will not come home.'],
        quote: 'I shall labour in the quest of the Sangreal a twelvemonth and a day.',
        winText: 'Not won — glimpsed. But a glimpse is more than most kings get.',
        phases: [virtues(), vision()],
      },
      {
        id: 'camlann', name: 'CAMLANN', sub: 'THE LAST BATTLE', needs: ['grail'], reward: 100,
        icon(api, x, y) { const c = api.ctx; c.strokeStyle = '#c8d0dc'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 6, y - 6); c.lineTo(x + 6, y + 6); c.moveTo(x + 6, y - 6); c.lineTo(x - 6, y + 6); c.stroke(); },
        intro: ['An adder, a drawn sword, and', 'two armies too frightened to', 'wait. By dusk, of all that', 'host, two men stand.'],
        quote: 'They fought till it was near night, and by then was there an hundred thousand laid dead.',
        winText: 'Bear Excalibur to the water, Bedivere. And tell no lies about it.',
        phases: [lastbattle(), mordred()],
      },
    ],
    endings: [
      { when: (f) => f.humble, title: 'THE ONCE AND FUTURE KING', lines: ['He asked to serve, and so was', 'loved; and being loved, is only', 'sleeping — in Avalon, till', 'Britain needs her king again.', '', 'HIC IACET ARTHURUS,', 'REX QUONDAM REXQUE FUTURUS.'] },
      { when: (f) => f.bold, title: 'THE HIGH KING', lines: ['He claimed the crown like thunder', 'and wore it like a blade. They', 'feared him, followed him, and', 'never once forgot his name.', '', 'The barge bears him out regardless.'] },
      { when: () => true, title: 'AVALON', lines: ['Three queens in black take the', 'wounded king across the water.', 'The legend does not end.', 'It waits.'] },
    ],
    finale: ['THE LEGEND IS WRITTEN.'],
  });
})();
