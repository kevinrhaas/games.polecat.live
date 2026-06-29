/* ============================================================================
 * THE WIZARD OF OZ — FOLLOW THE YELLOW BRICK ROAD
 * Five chapters through Baum's Oz:
 *   1. THE TWISTER       — dodge flying debris (vertical movement)
 *   2. THE YELLOW BRICK ROAD — auto-runner (keeps the original mechanic)
 *   3. THE POPPY FIELD   — tap sleeping friends awake before they're lost
 *   4. THE GREAT OZ      — dodge fireballs left-right, then grab the curtain
 *   5. THERE'S NO PLACE LIKE HOME — heel-click rhythm (3-beat timing)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const U = Retro.util;

  /* ── palette ── */
  const YEL  = '#ffe14d';
  const GRN  = '#00c860';
  const DGRN = '#007a38';
  const RED  = '#e02050';
  const SKY  = '#40b8e8';
  const PUR  = '#8840c0';
  const CRM  = '#fff8d0';
  const BRN  = '#8b5c2a';

  /* ── node centers (used by map road in scenery AND by menu rects) ── */
  const NODES = [
    { cx: 65,  cy: 400 }, // ch1 Kansas/Twister
    { cx: 185, cy: 328 }, // ch2 Yellow Brick Road
    { cx: 200, cy: 240 }, // ch3 Poppy Field
    { cx: 155, cy: 152 }, // ch4 Emerald City / Wizard
    { cx: 65,  cy: 152 }, // ch5 Home
  ];

  /* ──────────────────────────────────────────────────────────────────────────
   * EMBLEM — ruby slippers with orbiting sparkles
   * ────────────────────────────────────────────────────────────────────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // left slipper
    g.rect(cx - 26, cy,     18, 9,  RED);
    g.rect(cx - 26, cy + 7, 7,  5,  RED);
    g.rect(cx - 22, cy - 5, 13, 7,  RED);
    g.rect(cx - 20, cy - 2, 5,  3,  '#ff8090');
    // right slipper (mirrored)
    g.rect(cx + 8,  cy,     18, 9,  RED);
    g.rect(cx + 19, cy + 7, 7,  5,  RED);
    g.rect(cx + 9,  cy - 5, 13, 7,  RED);
    g.rect(cx + 10, cy - 2, 5,  3,  '#ff8090');
    // orbiting sparkles
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const sx = cx + Math.cos(a) * 32, sy = cy + 4 + Math.sin(a) * 20;
      g.rect(sx - 1, sy - 1, 2, 2, i % 2 === 0 ? YEL : '#ffaacc');
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * SCENERY — bright Oz landscape
   * ────────────────────────────────────────────────────────────────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Sky
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, SKY); sky.addColorStop(1, '#b8eeff');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // Clouds
    for (let i = 0; i < 5; i++) {
      const cx2 = ((t * 10 * (1 + i * 0.15) + i * 70) % (W + 60)) - 30;
      const cy2 = 24 + i * 20;
      c.globalAlpha = 0.85; c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(cx2,      cy2,     11, 0, 7); c.fill();
      c.beginPath(); c.arc(cx2 + 14, cy2 + 3, 8,  0, 7); c.fill();
      c.beginPath(); c.arc(cx2 - 11, cy2 + 4, 7,  0, 7); c.fill();
    }
    c.globalAlpha = 1;

    // Green rolling hills
    c.fillStyle = GRN;
    c.beginPath(); c.moveTo(0, H);
    c.quadraticCurveTo(50,  H * 0.52, 100, H * 0.56);
    c.quadraticCurveTo(160, H * 0.60, 220, H * 0.50);
    c.quadraticCurveTo(255, H * 0.44, W,   H * 0.56);
    c.lineTo(W, H); c.closePath(); c.fill();

    // Emerald City silhouette on horizon
    const ecx = W - 48, ecy = H * 0.38;
    c.fillStyle = DGRN;
    for (let i = 0; i < 5; i++) {
      const tx = ecx + (i - 2) * 10, th = 22 + (i % 2) * 13;
      c.fillRect(tx - 4, ecy - th, 8, th);
      // spire
      c.beginPath(); c.moveTo(tx - 4, ecy - th);
      c.lineTo(tx + 4, ecy - th); c.lineTo(tx, ecy - th - 7); c.fill();
    }
    c.fillStyle = GRN;
    for (let i = 0; i < 5; i++) {
      const tx = ecx + (i - 2) * 10, th = 22 + (i % 2) * 13;
      c.fillRect(tx - 4, ecy - th, 8, 3);
    }

    if (scene === 'menu') {
      // Map overlay — winding yellow brick road connecting all 5 nodes
      c.globalAlpha = 0.18;
      c.fillStyle = '#004a10';
      c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;

      // Draw the road as a thick bezier connecting node centers
      c.strokeStyle = YEL; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(NODES[0].cx, NODES[0].cy);
      c.bezierCurveTo(
        NODES[0].cx + 60, NODES[0].cy - 30,
        NODES[1].cx - 40, NODES[1].cy + 20,
        NODES[1].cx, NODES[1].cy
      );
      c.stroke();
      c.beginPath();
      c.moveTo(NODES[1].cx, NODES[1].cy);
      c.bezierCurveTo(
        NODES[1].cx + 20, NODES[1].cy - 40,
        NODES[2].cx + 20, NODES[2].cy + 30,
        NODES[2].cx, NODES[2].cy
      );
      c.stroke();
      c.beginPath();
      c.moveTo(NODES[2].cx, NODES[2].cy);
      c.bezierCurveTo(
        NODES[2].cx - 20, NODES[2].cy - 40,
        NODES[3].cx + 30, NODES[3].cy + 30,
        NODES[3].cx, NODES[3].cy
      );
      c.stroke();
      c.beginPath();
      c.moveTo(NODES[3].cx, NODES[3].cy);
      c.bezierCurveTo(
        NODES[3].cx - 30, NODES[3].cy - 20,
        NODES[4].cx + 30, NODES[4].cy - 20,
        NODES[4].cx, NODES[4].cy
      );
      c.stroke();

      // Animated brick texture on road (subtle)
      c.strokeStyle = '#c8a820'; c.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const bx = ((t * 8 + i * 24) % (W + 20)) - 10;
        c.beginPath(); c.moveTo(bx, 0); c.lineTo(bx, H); c.stroke();
      }

    } else if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(0,40,8,.72)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ── per-chapter icons ── */
  function iconTwister(api, x, y) {
    const c = api.ctx;
    c.strokeStyle = PUR; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(x, y - 11);
    c.quadraticCurveTo(x + 13, y, x, y + 9); c.stroke();
    c.beginPath(); c.moveTo(x, y - 11);
    c.quadraticCurveTo(x - 13, y, x, y + 9); c.stroke();
    api.gfx.rect(x - 3, y + 7, 6, 4, PUR);
  }
  function iconBrick(api, x, y) {
    const g = api.gfx;
    for (let r = 0; r < 3; r++) {
      for (let col = 0; col < 2; col++) {
        const ox = col * 9 + (r % 2) * 4;
        g.rect(x - 9 + ox, y - 7 + r * 6, 8, 5, YEL);
        g.rect(x - 9 + ox, y - 7 + r * 6, 8, 1, '#fff0a0');
      }
    }
  }
  function iconPoppy(api, x, y) {
    const g = api.gfx;
    g.rect(x - 1, y - 11, 2, 15, DGRN);
    g.circle(x, y - 13, 6, RED);
    g.circle(x, y - 13, 2, YEL);
  }
  function iconWizard(api, x, y) {
    const g = api.gfx;
    g.rect(x - 7, y + 1, 14, 5, PUR);
    g.rect(x - 3, y - 10, 6, 12, PUR);
    g.rect(x - 2, y - 14, 4, 5, PUR);
    g.rect(x - 8, y + 1, 2, 2, YEL);
    g.rect(x + 6, y + 1, 2, 2, YEL);
  }
  function iconSlippers(api, x, y) {
    const g = api.gfx;
    g.rect(x - 10, y - 2, 9, 6,  RED);
    g.rect(x + 1,  y - 2, 9, 6,  RED);
    g.rect(x - 3,  y + 3, 6, 4,  RED);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5, r = 11;
      g.rect(x + Math.cos(a) * r - 1, y + 2 + Math.sin(a) * r - 1, 2, 2, '#ffaacc');
    }
  }

  /* ── menu layout: 5 map nodes on winding road ── */
  function menuLayout() {
    return NODES.map(n => ({ x: n.cx - 35, y: n.cy - 30, w: 70, h: 60 }));
  }

  /* ── menu card: circular map badge ── */
  function menuCard(api, info) {
    const g = api.gfx, c = api.ctx;
    const { ch, i, x, y, w, h, sel, done } = info;
    const mx = x + w / 2, my = y + h / 2;

    // Shadow
    c.globalAlpha = 0.3; c.fillStyle = '#001a06';
    c.beginPath(); c.arc(mx + 2, my + 2, 26, 0, 7); c.fill(); c.globalAlpha = 1;

    // Node circle
    c.fillStyle = sel ? '#006030' : '#003a18';
    c.beginPath(); c.arc(mx, my, 26, 0, 7); c.fill();
    c.strokeStyle = sel ? YEL : GRN;
    c.lineWidth = sel ? 3 : 1.5;
    c.beginPath(); c.arc(mx, my, 26, 0, 7); c.stroke();

    if (done) {
      // Subtle gold fill behind
      c.globalAlpha = 0.22; c.fillStyle = YEL;
      c.beginPath(); c.arc(mx, my, 22, 0, 7); c.fill(); c.globalAlpha = 1;
    }

    // Icon centered
    if (ch.icon) ch.icon(api, mx, my - 4);

    // Number badge (top-right)
    c.fillStyle = sel ? YEL : GRN;
    c.beginPath(); c.arc(mx + 18, my - 18, 8, 0, 7); c.fill();
    c.fillStyle = '#001a06';
    c.font = "bold 7px 'Press Start 2P'";
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(i + 1, mx + 18, my - 18);

    // Short name below badge
    c.fillStyle = sel ? YEL : CRM;
    c.font = "6px 'Press Start 2P'";
    c.textBaseline = 'top';
    c.fillText(ch.menuLabel || ch.name.split(' ')[0], mx, my + 28);
    c.textAlign = 'left';

    // Done check
    if (done) {
      c.fillStyle = YEL; c.font = "9px 'Press Start 2P'";
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('✓', mx - 18, my - 18); c.textAlign = 'left';
    }
  }

  /* ════════════════════════════════════════════════════════════════════════════
   * CHAPTER 1 — THE TWISTER
   * Move up/down to dodge flying debris. Survive 18 seconds.
   * ════════════════════════════════════════════════════════════════════════════ */
  const ch1 = {
    id: 'twister', name: 'THE TWISTER', menuLabel: 'KANSAS',
    sub: 'Kansas, 1900',
    intro: ['A great black cloud tears', 'toward the farm!', 'Dodge flying debris', 'and survive the twister!'],
    quote: 'It\'s a twister! It\'s a twister!',
    help: 'DRAG or ARROW UP/DOWN',
    winText: "The house lands... somewhere very colorful.",
    loseText: "The twister sweeps Dorothy away.",
    icon: iconTwister,
    init(api) {
      this.dy  = api.H / 2;
      this.debris = [];
      this.lived = 0;
      this.goal  = 18;
      this.speed = 85;
      this.dragY = null;
    },
    update(api, dt) {
      const { W, H, input, pointer } = api;
      this.lived += dt;
      const d = this;

      // vertical movement
      if (pointer.justDown) d.dragY = pointer.y;
      if (pointer.down && d.dragY !== null) { d.dy += (pointer.y - d.dragY) * 0.85; d.dragY = pointer.y; }
      if (!pointer.down) d.dragY = null;
      if (input.down('up'))   d.dy -= 170 * dt;
      if (input.down('down')) d.dy += 170 * dt;
      d.dy = U.clamp(d.dy, 18, H - 18);

      // spawn debris
      d.speed = Math.min(220, 85 + d.lived * 6);
      if (Math.random() < (0.9 + d.lived * 0.04) * dt * 3) {
        const types = ['house', 'cow', 'barrel', 'tree'];
        d.debris.push({
          x: W + 20, y: U.rand(18, H - 18),
          type: U.choice(types),
          spd: d.speed * U.rand(0.8, 1.3),
          rot: U.rand(0, 6.28), rspd: U.rand(-3, 3),
        });
      }
      for (const db of d.debris) { db.x -= db.spd * dt; db.rot += db.rspd * dt; }
      d.debris = d.debris.filter(db => db.x > -40);

      // collision (generous 10px radius)
      const dx = 60;
      for (const db of d.debris) {
        const ddx = db.x - dx, ddy = db.y - d.dy;
        if (Math.abs(ddx) < 16 && Math.abs(ddy) < 14) {
          api.shake(7, 0.35); api.flash(PUR, 0.25); api.lose(); return;
        }
      }

      api.addScore(Math.floor(dt * 12));
      if (d.lived >= d.goal) { api.burst(api.W / 2, api.H / 2, YEL, 22); api.win(); }
    },
    draw(api) {
      const { gfx: g, ctx: c, W, H, t } = api;
      const d = this;

      // Stormy sky
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#140630'); sky.addColorStop(0.5, '#2a0848'); sky.addColorStop(1, '#1e0640');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);

      // Background swirling bits
      c.globalAlpha = 0.2;
      for (let i = 0; i < 10; i++) {
        const bx = ((t * 35 + i * 100) % (W + 80)) - 40;
        const by = (i * 61 + t * 18) % H;
        c.fillStyle = PUR; c.fillRect(bx - 3, by - 3, 6, 6);
      }
      c.globalAlpha = 1;

      // Twister funnel on right half
      for (let row = 0; row < 14; row++) {
        const tw = (14 - row) * 9 + Math.sin(t * 5 + row * 0.4) * 6;
        const light = 12 + row * 2;
        c.fillStyle = `hsl(270,55%,${light}%)`;
        c.fillRect(W * 0.65 - tw / 2, row * (H / 14), tw, H / 14 + 1);
      }

      // Debris
      for (const db of d.debris) {
        c.save(); c.translate(db.x, db.y); c.rotate(db.rot);
        if (db.type === 'house') {
          g.rect(-10, -7, 20, 13, BRN);
          c.fillStyle = '#6a4020';
          c.beginPath(); c.moveTo(-13, -7); c.lineTo(0, -19); c.lineTo(13, -7); c.fill();
        } else if (db.type === 'cow') {
          g.rect(-10, -5, 20, 9, '#d8c8a0');
          g.rect(-12, -3, 4, 7, '#d8c8a0'); g.rect(8, -3, 4, 7, '#d8c8a0');
        } else if (db.type === 'barrel') {
          c.fillStyle = BRN;
          c.beginPath(); c.ellipse(0, 0, 7, 10, 0, 0, 7); c.fill();
          g.rect(-7, -2, 14, 2, '#5a3010');
        } else {
          g.rect(-2, -13, 4, 16, '#3a5a1a');
          g.circle(0, -15, 7, '#2a7828');
        }
        c.restore();
      }

      // Dorothy (stationary x=60)
      const bob = Math.sin(t * 5) * 2;
      g.sprite(['.hhhh.','hhffhh','.ffff.','.bwwb.','bbbbbb','bbbbbb','.b..b.','.r..r.'],
        54, d.dy - 10 + bob,
        { h:'#6a4a2a', f:'#f2d2a8', b:'#5a9ad8', w:'#ffffff', r: RED }, 2);

      // Progress bar
      const prog = Math.min(1, d.lived / d.goal);
      g.rect(0, 0, W, 13, 'rgba(0,0,0,.75)');
      g.rect(2, 2, Math.floor((W - 4) * prog), 9, PUR);
      g.rectO(2, 2, W - 4, 9, '#6620a0', 1);
      c.fillStyle = YEL; c.font = "7px 'Press Start 2P'";
      c.textAlign = 'center'; c.fillText('SURVIVE THE TWISTER', W / 2, 10); c.textAlign = 'left';
    },
  };

  /* ════════════════════════════════════════════════════════════════════════════
   * CHAPTER 2 — THE YELLOW BRICK ROAD
   * Auto-runner: jump gaps/crows/rocks, collect emeralds, rescue companions.
   * ════════════════════════════════════════════════════════════════════════════ */
  const ch2 = {
    id: 'yellowbrick', name: 'YELLOW BRICK ROAD', menuLabel: 'THE ROAD',
    sub: 'Follow the road to Oz',
    intro: ['Follow the yellow brick road!', 'Jump over rocks, poppies', 'and crows. Rescue', 'your friends!'],
    quote: 'Follow the Yellow Brick Road!',
    help: 'TAP / ARROW UP to JUMP (×2)',
    winText: "The companions join Dorothy on the road to Oz!",
    loseText: "Dorothy lost her way on the road.",
    icon: iconBrick,
    init(api) {
      const { W, H } = api;
      this.GR   = H - 44;
      this.p    = { x: 50, y: this.GR - 20, vy: 0, onGround: true, run: 0 };
      this.obs  = []; this.coins = []; this.comps = []; this.clouds = [];
      this.dist = 0; this.sx = 0; this.spd = 68; this.spawnX = W + 40;
      this.ci   = 0; this.jumps = 0; this.GOAL = 2600;
      for (let i = 0; i < 4; i++)
        this.clouds.push({ x: U.rand(0, W), y: U.rand(14, 80), s: U.rand(0.5, 1.1), spd: U.rand(14, 28) });
    },
    update(api, dt) {
      const { W, H, input, pointer } = api;
      const GRAV = 820, JV = -290;
      const p = this.p;

      const jp = input.pressed('up') || input.pressed('a') || input.pressed('b') || pointer.justDown;
      if (jp) {
        if (p.onGround) { p.vy = JV; p.onGround = false; this.jumps = 1; api.audio.sfx('jump'); }
        else if (this.jumps < 2) { p.vy = JV * 0.84; this.jumps = 2; api.audio.sfx('jump'); }
      }
      p.vy += GRAV * dt; p.y += p.vy * dt;
      const gr = this.GR;
      if (p.y >= gr - 20) {
        if (!this._gap(p.x + 8)) { p.y = gr - 20; p.vy = 0; p.onGround = true; this.jumps = 0; }
        else if (p.y > H + 20) { api.lose(); return; }
      } else p.onGround = false;
      p.run += this.spd * dt;
      this.spd = Math.min(165, 68 + this.dist / 28);
      this.dist += this.spd * dt; this.sx += this.spd * dt;
      this.spawnX -= this.spd * dt;
      while (this.spawnX < W + 40) this._chunk(W);
      const mv = this.spd * dt;
      this.obs.forEach(o => { o.x -= mv; if (o.k === 'crow') o.y += Math.sin(api.t * 3.5 + o.ph) * 0.6; });
      this.coins.forEach(c => c.x -= mv);
      this.comps.forEach(c => c.x -= mv);
      this.clouds.forEach(c => { c.x -= c.spd * dt; if (c.x < -40) c.x = W + 30; });
      this.obs   = this.obs.filter(o => o.x > -50);
      this.coins = this.coins.filter(c => c.x > -20 && !c.got);
      this.comps = this.comps.filter(c => c.x > -40 && !c.got);
      const pb = { x: p.x, y: p.y, w: 16, h: 20 };
      for (const o of this.obs) {
        if (o.k === 'gap') continue;
        const ob = this._obox(o); if (ob && this._hit(pb, ob)) { api.shake(5, 0.3); api.lose(); return; }
      }
      for (const cn of this.coins) {
        if (!cn.got && this._hit(pb, { x: cn.x - 6, y: cn.y - 6, w: 12, h: 12 })) {
          cn.got = true; api.addScore(10); api.audio.sfx('coin'); api.burst(cn.x, cn.y, GRN, 6);
        }
      }
      for (const cp of this.comps) {
        if (!cp.got && this._hit(pb, { x: cp.x - 10, y: cp.y - 24, w: 20, h: 28 })) {
          cp.got = true; api.addScore(50); api.audio.sfx('power'); api.burst(cp.x, cp.y, YEL, 12);
        }
      }
      if (this.dist >= this.GOAL) { api.burst(W / 2, api.H / 2, GRN, 22); api.win(); }
    },
    _gap(px) { return this.obs.some(o => o.k === 'gap' && px > o.x && px < o.x + o.w); },
    _obox(o) {
      const gr = this.GR;
      if (o.k === 'rock')  return { x: o.x, y: gr - 14, w: 16, h: 14 };
      if (o.k === 'poppy') return { x: o.x, y: gr - 12, w: 14, h: 12 };
      if (o.k === 'crow')  return { x: o.x, y: o.y,     w: 14, h:  8 };
      return null;
    },
    _hit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; },
    _chunk(W) {
      const base = this.spawnX, r = Math.random(), prog = this.dist / this.GOAL, gr = this.GR;
      if (r < 0.20 && prog > 0.05) {
        const gw = U.randInt(28, 44);
        this.obs.push({ k: 'gap', x: base, w: gw });
        for (let i = 0; i < 3; i++) this.coins.push({ x: base + gw / 2 + (i - 1) * 14, y: gr - 46, got: false });
        this.spawnX = base + gw + U.randInt(58, 100);
      } else if (r < 0.45) {
        this.obs.push({ k: Math.random() < 0.5 ? 'rock' : 'poppy', x: base });
        this.spawnX = base + U.randInt(68, 118);
      } else if (r < 0.62) {
        this.obs.push({ k: 'crow', x: base, y: gr - 52 - U.randInt(0, 22), ph: U.rand(0, 6.28) });
        this.spawnX = base + U.randInt(78, 128);
      } else {
        const n = U.randInt(3, 5);
        for (let i = 0; i < n; i++) this.coins.push({ x: base + i * 16, y: gr - 28, got: false });
        this.spawnX = base + n * 16 + U.randInt(48, 88);
      }
      if (this.ci < 3 && this.dist + (base - 50) > (this.ci + 1) * (this.GOAL / 4)) {
        this.comps.push({ x: base + 28, y: this.GR, type: this.ci, got: false });
        this.ci++;
      }
    },
    draw(api) {
      const { gfx: g, ctx: c, W, H, t } = api;
      const p = this.p, gr = this.GR;

      // Sky
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, SKY); sky.addColorStop(1, '#c8eef8');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);

      // Emerald City (grows)
      const prog = this.dist / this.GOAL;
      const ecx = W - 38 + (1 - prog) * 58, ecy = gr - 14, esc = 0.4 + prog * 0.8;
      c.globalAlpha = 0.9; c.fillStyle = DGRN;
      for (let i = 0; i < 5; i++) {
        const tx = ecx + (i - 2) * 9 * esc, th = (18 + (i % 2) * 12) * esc;
        c.fillRect(tx - 4 * esc, ecy - th, 8 * esc, th);
        c.fillStyle = GRN; c.fillRect(tx - 4 * esc, ecy - th, 8 * esc, 2); c.fillStyle = DGRN;
      }
      c.globalAlpha = 1;

      // Clouds
      for (const cl of this.clouds) {
        c.globalAlpha = 0.82; c.fillStyle = '#fff';
        c.beginPath(); c.arc(cl.x, cl.y, 10 * cl.s, 0, 7); c.fill();
        c.beginPath(); c.arc(cl.x + 12 * cl.s, cl.y + 3, 8 * cl.s, 0, 7); c.fill();
        c.beginPath(); c.arc(cl.x - 10 * cl.s, cl.y + 3, 7 * cl.s, 0, 7); c.fill();
        c.globalAlpha = 1;
      }

      // Hills
      c.fillStyle = GRN;
      const ho = this.sx * 0.3 % 80;
      c.beginPath(); c.moveTo(-ho, H);
      for (let x = -ho; x <= W + 80; x += 80) c.quadraticCurveTo(x + 40, gr - 26, x + 80, gr - 6);
      c.lineTo(W, H); c.closePath(); c.fill();
      g.rect(0, gr, W, H - gr, DGRN);
      g.rect(0, gr, W, 3, GRN);

      // Brick road
      for (let x = -(this.sx % 16) - 16; x < W + 16; x += 16) {
        if (this.obs.some(o => o.k === 'gap' && x + 8 > o.x && x + 8 < o.x + o.w)) continue;
        const row = Math.floor((x + this.sx) / 16);
        g.rect(x, gr, 14, 10, (row & 1) ? '#f0c93a' : YEL);
        g.rect(x, gr, 14, 2, '#fff8a0');
      }
      for (const o of this.obs) if (o.k === 'gap') g.rect(o.x, gr, o.w, H - gr, '#004020');

      // Obstacles
      for (const o of this.obs) {
        if (o.k === 'rock') { g.sprite(['.kk.','kkkk','kkkk'], o.x, gr - 12, { k:'#7a6a55' }, 3.5); }
        else if (o.k === 'poppy') {
          for (let i = 0; i < 3; i++) {
            g.rect(o.x + i * 5, gr - 10, 1, 10, DGRN);
            g.circle(o.x + i * 5 + 1, gr - 12, 4, RED);
            g.circle(o.x + i * 5 + 1, gr - 12, 1, YEL);
          }
        } else if (o.k === 'crow') {
          const f = Math.sin(t * 4) > 0;
          g.sprite(f ? ['k.k','kkk'] : ['.k.','kkk'], o.x, o.y, { k:'#241a33' }, 4);
          g.rect(o.x + 11, o.y + 4, 3, 1, '#ff8a3d');
        }
      }

      // Emeralds
      for (const cn of this.coins) {
        if (cn.got) continue;
        const yb = Math.sin(t * 4 + cn.x) * 2;
        g.sprite(['.g.','.g.','ggg','.g.'], cn.x - 4, cn.y - 4 + yb, { g: GRN }, 3);
      }

      // Companions waiting
      const CP = [
        { s: ['XXX','XOOX','XXX','XXXX','X.X'], p: { X:'#e0c050', O:'#caa15a' } },
        { s: ['XXX','XOOX','XXX','XXXX','X.X'], p: { X:'#a8c0d0', O:'#cfe0ec' } },
        { s: ['XXX','XOOX','XXXX','XXXX','X.X'], p: { X:'#d49a4a', O:'#f0c878' } },
      ];
      for (const cp of this.comps) {
        if (cp.got) continue;
        const def = CP[cp.type];
        g.sprite(def.s, cp.x - 4, cp.y - 20, def.p, 2);
      }

      // Dorothy
      const bob = p.onGround ? Math.sin(p.run * 0.2) * 1.5 : 0;
      g.sprite(['.hhhh.','hhffhh','.ffff.','.bwwb.','bbbbbb','bbbbbb','.b..b.','.r..r.'],
        p.x - 6, p.y + bob,
        { h:'#6a4a2a', f:'#f2d2a8', b:'#5a9ad8', w:'#ffffff', r: RED }, 2);
      if (t % 1.2 < 0.14) g.rect(p.x - 4, p.y + 14 + bob, 2, 2, '#ff88cc');

      // Progress
      const bp = Math.min(1, this.dist / this.GOAL);
      g.rect(0, 0, W, 12, 'rgba(0,0,0,.72)');
      g.rect(2, 2, Math.floor((W - 4) * bp), 8, YEL);
      g.rectO(2, 2, W - 4, 8, '#a07020', 1);
      c.fillStyle = DGRN; c.font = "7px 'Press Start 2P'";
      c.textAlign = 'center'; c.fillText('EMERALD CITY', W / 2, 9); c.textAlign = 'left';
    },
  };

  /* ════════════════════════════════════════════════════════════════════════════
   * CHAPTER 3 — THE POPPY FIELD
   * Friends fall asleep; tap them awake before the timer runs out.
   * ════════════════════════════════════════════════════════════════════════════ */
  const ch3 = {
    id: 'poppyfield', name: 'THE POPPY FIELD', menuLabel: 'POPPIES',
    sub: 'The enchanted flowers',
    intro: ["The Wicked Witch's poppies", "make everyone drowsy!", "Tap sleeping friends", "before they're gone!"],
    quote: 'Poppies... poppies will put them to sleep.',
    help: 'TAP SLEEPING FRIENDS to WAKE THEM',
    winText: "Everyone is awake! Onward to Oz!",
    loseText: "Too many friends lost in the poppies...",
    icon: iconPoppy,
    init(api) {
      this.friends = [];
      this.poppies = [];
      this.woken  = 0;
      this.needed = 8;
      this.lost   = 0;
      this.maxLost = 4;
      this.spawnT = 0;
      this.spawnI = 2.0;
      this.t2     = 0;
      const { W, H } = api;
      for (let i = 0; i < 34; i++)
        this.poppies.push({ x: U.rand(8, W - 8), y: U.rand(H * 0.28, H - 18) });
    },
    update(api, dt) {
      const { W, H, pointer } = api;
      this.t2 += dt; this.spawnT += dt;

      if (this.spawnT >= this.spawnI) {
        this.spawnT = 0;
        this.spawnI = Math.max(1.0, 2.0 - this.t2 * 0.07);
        const names = ['SCARECROW','TIN MAN','LION','TOTO','DOROTHY'];
        const cols  = [YEL, '#a8c0d0', '#d49a4a', '#3a2a1a', '#5a9ad8'];
        const idx   = U.randInt(0, 4);
        this.friends.push({
          x: U.rand(22, W - 22), y: U.rand(H * 0.22, H - 55),
          name: names[idx], col: cols[idx],
          timer: 3.2 + Math.random() * 1.6,
          maxT:  3.2 + Math.random() * 1.6,
          state: 'sleeping', flashT: 0,
        });
      }

      for (const f of this.friends) {
        if (f.state !== 'sleeping') { f.flashT -= dt; continue; }
        f.timer -= dt;
        if (f.timer <= 0) {
          f.state = 'lost'; f.flashT = 0.6;
          this.lost++;
          api.shake(3, 0.2);
          if (this.lost >= this.maxLost) { api.shake(8, 0.4); api.lose(); return; }
        }
      }
      this.friends = this.friends.filter(f => f.state === 'sleeping' || f.flashT > 0);

      if (pointer.justDown) {
        for (const f of this.friends) {
          if (f.state !== 'sleeping') continue;
          if (Math.abs(pointer.x - f.x) < 24 && Math.abs(pointer.y - f.y) < 24) {
            f.state = 'woken'; f.flashT = 0.5;
            this.woken++;
            api.addScore(20); api.audio.sfx('coin');
            api.burst(f.x, f.y, YEL, 12);
            break;
          }
        }
      }

      if (this.woken >= this.needed) { api.burst(W / 2, H / 2, GRN, 22); api.win(); }
    },
    draw(api) {
      const { gfx: g, ctx: c, W, H, t } = api;

      // Dreamy pink field
      const bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#cc2858'); bg.addColorStop(0.45, '#a01848'); bg.addColorStop(1, '#280020');
      c.fillStyle = bg; c.fillRect(0, 0, W, H);

      // Poppy stems + heads
      for (const p of this.poppies) {
        const sw = Math.sin(t * 1.8 + p.x * 0.08) * 3;
        g.rect(p.x - 1, p.y - 11 + sw, 2, 13, DGRN);
        g.circle(p.x, p.y - 13 + sw, 5, RED);
        g.circle(p.x, p.y - 13 + sw, 2, '#cc0030');
        g.rect(p.x - 1, p.y - 13 + sw, 2, 2, YEL);
      }

      // Floating pink spores
      for (let i = 0; i < 18; i++) {
        const sx = ((t * 14 * (i % 2 ? 1 : -0.6) + i * 42) % (W + 22) + W + 22) % (W + 22) - 10;
        const sy = H - ((t * 16 + i * 58) % (H + 20));
        c.globalAlpha = 0.35 + 0.4 * Math.sin(t * 3 + i);
        g.rect(sx, sy, 3, 3, '#ffaacc');
      }
      c.globalAlpha = 1;

      // Friends
      for (const f of this.friends) {
        const isSleeping = f.state === 'sleeping';
        const isWoken    = f.state === 'woken';
        const isLost     = f.state === 'lost';
        const alpha = isSleeping ? (0.55 + 0.45 * (f.timer / f.maxT)) : (f.flashT * 2);
        c.globalAlpha = Math.max(0.1, Math.min(1, alpha));

        g.circle(f.x, f.y, 20, isWoken ? GRN : (isLost ? '#660020' : f.col));
        g.circle(f.x, f.y, 15, '#0a0006');

        if (isSleeping) {
          // ZZZ
          const zn = Math.floor(t * 1.8) % 3 + 1;
          c.fillStyle = '#ffffff'; c.font = "9px 'Press Start 2P'";
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText('z'.repeat(zn), f.x + 22, f.y - 12);
          c.textAlign = 'left';
          // sleep ring
          const ang = (1 - f.timer / f.maxT) * Math.PI * 2;
          c.strokeStyle = RED; c.lineWidth = 3;
          c.beginPath(); c.arc(f.x, f.y, 24, -Math.PI / 2, -Math.PI / 2 + ang); c.stroke();
        } else if (isWoken) {
          c.fillStyle = YEL; c.font = "8px 'Press Start 2P'";
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText('AWAKE!', f.x, f.y - 30); c.textAlign = 'left';
        }

        c.globalAlpha = isSleeping ? 1 : Math.max(0, f.flashT * 2);
        c.fillStyle = '#eeeeee'; c.font = "6px 'Press Start 2P'";
        c.textAlign = 'center'; c.textBaseline = 'top';
        c.fillText(f.name, f.x, f.y + 22); c.textAlign = 'left';
        c.globalAlpha = 1;
      }

      // HUD
      g.rect(0, 0, W, 22, 'rgba(0,0,0,.78)');
      c.fillStyle = YEL; c.font = "7px 'Press Start 2P'";
      c.textAlign = 'left';
      c.fillText('WOKEN: ' + this.woken + '/' + this.needed, 6, 8);
      c.fillStyle = RED; c.textAlign = 'right';
      c.fillText('LOST: ' + this.lost + '/' + this.maxLost, W - 6, 8);
      c.textAlign = 'left';
    },
  };

  /* ════════════════════════════════════════════════════════════════════════════
   * CHAPTER 4 — THE GREAT OZ
   * Move left/right to dodge falling fireballs; survive 16 s then tap curtain.
   * ════════════════════════════════════════════════════════════════════════════ */
  const ch4 = {
    id: 'greatoz', name: 'THE GREAT OZ', menuLabel: 'WIZARD',
    sub: 'The wizard behind the curtain',
    intro: ['The Great and Terrible Oz!', 'Dodge the wizard\'s fireballs.', 'Survive long enough to', 'pull back the curtain!'],
    quote: 'Pay no attention to that man behind the curtain!',
    help: 'DRAG LEFT/RIGHT · ARROWS',
    winText: "A great and terrible humbug — exposed!",
    loseText: "The fires of Oz drive you back!",
    icon: iconWizard,
    init(api) {
      this.dx   = api.W / 2;
      this.fbs  = [];
      this.spawnT = 0;
      this.spawnI = 1.4;
      this.lived  = 0;
      this.goal   = 16;
      this.phase  = 'dodge'; // or 'pull' or 'reveal'
      this.revealT = 0;
      this.curtainOpen = 0;
    },
    update(api, dt) {
      const { W, H, input, pointer } = api;
      this.lived += dt;

      if (this.phase === 'dodge') {
        // move left/right
        if (input.down('left')  || (pointer.down && pointer.x < W / 2)) this.dx -= 165 * dt;
        if (input.down('right') || (pointer.down && pointer.x > W / 2)) this.dx += 165 * dt;
        this.dx = U.clamp(this.dx, 14, W - 14);

        // spawn fireballs aimed at Dorothy
        this.spawnT += dt;
        if (this.spawnT >= this.spawnI) {
          this.spawnT = 0;
          this.spawnI = Math.max(0.55, 1.4 - this.lived * 0.045);
          const tx = this.dx + U.rand(-35, 35);
          const ang = Math.atan2(H * 0.8 - 90, tx - W / 2);
          const spd = 115 + this.lived * 3.5;
          this.fbs.push({ x: W / 2 + U.rand(-45, 45), y: 90, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 9 });
        }
        for (const fb of this.fbs) { fb.x += fb.vx * dt; fb.y += fb.vy * dt; }
        this.fbs = this.fbs.filter(fb => fb.x > -20 && fb.x < W + 20 && fb.y < H + 20);

        // collision
        for (const fb of this.fbs) {
          const d2 = (fb.x - this.dx) ** 2 + (fb.y - (H - 60)) ** 2;
          if (d2 < (fb.r + 11) ** 2) { api.shake(8, 0.4); api.flash(RED, 0.3); api.lose(); return; }
        }

        api.addScore(Math.floor(dt * 8));

        // transition to pull
        if (this.lived >= this.goal) {
          this.phase = 'pull';
          api.burst(W / 2, H * 0.5, YEL, 18);
          api.audio.sfx('power');
        }

      } else if (this.phase === 'pull') {
        this.curtainOpen += dt / 1.4;
        if (this.curtainOpen >= 1) {
          this.curtainOpen = 1;
          this.phase = 'reveal';
          api.burst(W / 2, H / 2, YEL, 28);
          api.audio.sfx('win');
        }
      } else if (this.phase === 'reveal') {
        this.revealT += dt;
        api.addScore(100);
        if (this.revealT >= 1.8) api.win();
      }
    },
    draw(api) {
      const { gfx: g, ctx: c, W, H, t } = api;
      const d = this;

      // Throne room
      const bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#001a06'); bg.addColorStop(1, '#000e03');
      c.fillStyle = bg; c.fillRect(0, 0, W, H);

      // Marble floor
      c.globalAlpha = 0.12;
      for (let row = 0; row < 7; row++) for (let col = 0; col < 10; col++) {
        c.fillStyle = (row + col) % 2 === 0 ? '#009040' : '#006828';
        c.fillRect(col * 28, H - 70 + row * 20, 28, 20);
      }
      c.globalAlpha = 1;

      // The Oz head — giant floating green face
      const hx = W / 2, hy = 70;
      const pulse = 1 + Math.sin(t * 2.8) * 0.05;
      c.globalAlpha = 0.25 + 0.18 * Math.abs(Math.sin(t * 1.8));
      g.circle(hx, hy, 42 * pulse, '#00ff70');
      c.globalAlpha = 1;
      g.circle(hx, hy, 33 * pulse, '#003a10');
      g.circle(hx - 10, hy - 6, 6, '#00ff70');
      g.circle(hx + 10, hy - 6, 6, '#00ff70');
      g.circle(hx - 10, hy - 6, 3, '#001808');
      g.circle(hx + 10, hy - 6, 3, '#001808');
      g.rect(hx - 17, hy - 17, 10, 3, '#00ff70');
      g.rect(hx +  7, hy - 17, 10, 3, '#00ff70');
      c.strokeStyle = '#00ff70'; c.lineWidth = 3;
      c.beginPath(); c.arc(hx, hy + 9, 11, 0.25, Math.PI - 0.25); c.stroke();

      // Fireballs
      for (const fb of d.fbs) {
        const fr = Math.sin(t * 14 + fb.x) * 2;
        g.circle(fb.x, fb.y, fb.r + fr, '#ff8000');
        g.circle(fb.x, fb.y, (fb.r + fr) * 0.58, '#ffdd00');
        g.circle(fb.x, fb.y, (fb.r + fr) * 0.28, '#ffffff');
      }

      // Curtain (opens in 'pull' phase)
      if (d.phase !== 'dodge') {
        const cw = W * 0.76, cy2 = H * 0.32, ch = H * 0.52;
        const cx2 = W / 2;
        const open = d.curtainOpen;
        // left panel
        const lw = (cw / 2) * (1 - open);
        c.fillStyle = '#005a22';
        c.fillRect(cx2 - cw / 2, cy2, lw, ch);
        // right panel
        c.fillRect(cx2 + (cw / 2) * open, cy2, lw, ch);
        // velvet fold lines
        c.strokeStyle = '#007a30'; c.lineWidth = 2;
        for (let fi = 1; fi < 4; fi++) {
          if (lw > fi * 12) { c.beginPath(); c.moveTo(cx2 - cw / 2 + fi * 12, cy2); c.lineTo(cx2 - cw / 2 + fi * 12, cy2 + ch); c.stroke(); }
          if (lw > fi * 12) { c.beginPath(); c.moveTo(cx2 + (cw / 2) * open + fi * 12, cy2); c.lineTo(cx2 + (cw / 2) * open + fi * 12, cy2 + ch); c.stroke(); }
        }
        // Reveal: small man with levers
        if (open > 0.4) {
          c.globalAlpha = (open - 0.4) / 0.6;
          g.circle(cx2, cy2 + 36, 16, '#f2d2a8');
          g.rect(cx2 - 11, cy2 + 50, 22, 28, '#cc2020');
          g.rect(cx2 - 5,  cy2 + 78, 4, 14, '#333');
          g.rect(cx2 + 1,  cy2 + 78, 4, 14, '#333');
          if (d.phase === 'reveal') {
            c.fillStyle = YEL; c.font = "9px 'Press Start 2P'";
            c.textAlign = 'center'; c.textBaseline = 'top';
            c.fillText('HUMBUG!', cx2, cy2 + 96); c.textAlign = 'left';
          }
          c.globalAlpha = 1;
        }
      }

      // Dorothy player (only during dodge)
      if (d.phase === 'dodge') {
        g.sprite(['.hhhh.','hhffhh','.ffff.','.bwwb.','bbbbbb','bbbbbb','.b..b.','.r..r.'],
          d.dx - 6, H - 76,
          { h:'#6a4a2a', f:'#f2d2a8', b:'#5a9ad8', w:'#ffffff', r: RED }, 2);
      }

      // "SURVIVE" button hint before phase transition
      if (d.phase === 'dodge') {
        const rem = Math.max(0, d.goal - d.lived);
        g.rect(0, 0, W, 12, 'rgba(0,0,0,.72)');
        const tp = Math.min(1, d.lived / d.goal);
        g.rect(2, 2, Math.floor((W - 4) * tp), 8, GRN);
        g.rectO(2, 2, W - 4, 8, '#004020', 1);
        c.fillStyle = YEL; c.font = "7px 'Press Start 2P'";
        c.textAlign = 'center';
        c.fillText(rem > 0 ? 'SURVIVE ' + Math.ceil(rem) + 's' : 'GRAB THE CURTAIN!', W / 2, 9);
        c.textAlign = 'left';
      } else {
        g.rect(0, 0, W, 12, 'rgba(0,0,0,.72)');
        c.fillStyle = YEL; c.font = "7px 'Press Start 2P'";
        c.textAlign = 'center';
        c.fillText('THE GREAT HUMBUG!', W / 2, 9); c.textAlign = 'left';
      }
    },
  };

  /* ════════════════════════════════════════════════════════════════════════════
   * CHAPTER 5 — THERE'S NO PLACE LIKE HOME
   * Tap the ruby slippers in rhythm — 3 beats, each in the green zone.
   * Fail 3 times and it's over; succeed and the magic carries Dorothy home.
   * ════════════════════════════════════════════════════════════════════════════ */
  const ch5 = {
    id: 'heelclick', name: "NO PLACE LIKE HOME", menuLabel: 'HOME',
    sub: 'Click your heels three times',
    intro: ['Click your ruby slippers', 'together three times!', 'Tap the beat each time', 'the needle hits green.'],
    quote: 'There\'s no place like home.',
    help: 'TAP / SPACE when needle hits GREEN',
    winText: "The ruby slippers glow — and Dorothy is home!",
    loseText: "The slippers won't respond... stay focused.",
    icon: iconSlippers,
    init(api) {
      this.beat      = 0;
      this.beatRate  = 0.88;
      this.clicks    = 0;
      this.results   = [];
      this.fails     = 0;
      this.zone      = 0.26;
      this.done      = false;
      this.doneT     = 0;
      this.failT     = 0;
      this.isFail    = false;
      this.sparks    = [];
    },
    update(api, dt) {
      const { pointer } = api;
      this.beat = (this.beat + dt / this.beatRate) % 1;

      for (const s of this.sparks) { s.x += s.vx; s.y += s.vy; s.vy += 0.12; s.life -= dt; }
      this.sparks = this.sparks.filter(s => s.life > 0);

      if (this.isFail) {
        this.failT += dt;
        if (this.failT > 1.1) {
          this.isFail = false; this.failT = 0;
          this.beat = 0; this.clicks = 0; this.results = [];
        }
        return;
      }
      if (this.done) {
        this.doneT += dt;
        if (this.doneT > 1.6) { api.burst(api.W / 2, api.H / 2, RED, 28); api.win(); }
        return;
      }

      if (api.confirm()) {
        const dist = Math.min(this.beat, 1 - this.beat);
        if (dist < this.zone * 0.38)      { this._click(api, 'PERFECT!', 55); }
        else if (dist < this.zone)         { this._click(api, 'GOOD', 22); }
        else {
          this.fails++;
          api.audio.sfx('hurt');
          api.shake(5, 0.25);
          this.isFail = true; this.failT = 0;
          if (this.fails >= 3) { api.lose(); }
        }
      }
    },
    _click(api, quality, pts) {
      this.results.push(quality);
      this.clicks++;
      api.addScore(pts);
      api.audio.sfx('coin');
      const sx = api.W / 2, sy = api.H * 0.62;
      for (let i = 0; i < 16; i++) this.sparks.push({
        x: sx + U.rand(-18, 18), y: sy + U.rand(-8, 8),
        vx: U.rand(-2.5, 2.5), vy: U.rand(-3.5, -0.5),
        life: U.rand(0.4, 0.9), col: i % 2 === 0 ? RED : YEL,
      });
      if (this.clicks >= 3) { this.done = true; this.doneT = 0; api.audio.sfx('win'); }
    },
    draw(api) {
      const { gfx: g, ctx: c, W, H, t } = api;

      // Kansas golden dusk sky
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#5a3000'); sky.addColorStop(0.55, '#b06818'); sky.addColorStop(1, '#783800');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);

      // Wheat field
      for (let i = 0; i < 32; i++) {
        const wx = (i / 32) * W;
        const wh = 28 + Math.sin(t * 1.9 + i * 0.38) * 8;
        const wy = H - 58 - wh;
        g.rect(wx - 1, wy, 2, wh + 22, '#b87808');
        g.circle(wx, wy, 4, YEL);
      }
      g.rect(0, H - 58, W, 58, '#7a3a00');

      // Farmhouse
      const fy = H - 96;
      g.rect(W / 2 - 22, fy - 28, 44, 28, '#4a1e04');
      c.fillStyle = '#7a1800';
      c.beginPath(); c.moveTo(W / 2 - 27, fy - 28); c.lineTo(W / 2, fy - 50); c.lineTo(W / 2 + 27, fy - 28); c.fill();
      g.rect(W / 2 - 4, fy - 15, 8, 15, '#2a0e00');
      // Windmill
      g.rect(W / 2 + 40, fy - 36, 3, 36, '#6a4820');
      for (let bi = 0; bi < 4; bi++) {
        const ba = t + bi * Math.PI / 2;
        g.rect(W / 2 + 41 + Math.cos(ba) * 10 - 2, fy - 36 + Math.sin(ba) * 10 - 2, 4, 4, '#8a6030');
      }

      // Dorothy
      const dorY = H - 88;
      g.sprite(['.hhhh.','hhffhh','.ffff.','.bwwb.','bbbbbb','bbbbbb','.b..b.','.r..r.'],
        W / 2 - 6, dorY,
        { h:'#6a4a2a', f:'#f2d2a8', b:'#5a9ad8', w:'#ffffff', r: RED }, 2);

      // Ruby slippers + glow
      const sx = W / 2, sy = dorY + 22;
      const glow = 0.35 + 0.38 * Math.sin(t * 4.5);
      c.globalAlpha = glow; g.circle(sx, sy, 22, '#ff3050'); c.globalAlpha = 1;
      g.rect(sx - 15, sy - 4, 12, 8, RED);
      g.rect(sx + 3,  sy - 4, 12, 8, RED);
      g.rect(sx - 5,  sy + 3, 10, 5, RED);
      g.rect(sx - 12, sy - 2, 4,  2, '#ff7088');
      g.rect(sx + 5,  sy - 2, 4,  2, '#ff7088');

      // Beat ring (expanding)
      const br = 30 + this.beat * 22;
      c.globalAlpha = (1 - this.beat) * 0.7;
      c.strokeStyle = RED; c.lineWidth = 3;
      c.beginPath(); c.arc(sx, sy, br, 0, 7); c.stroke(); c.globalAlpha = 1;

      // Static ring
      c.strokeStyle = YEL; c.lineWidth = 2;
      c.beginPath(); c.arc(sx, sy, 30, 0, 7); c.stroke();

      // Green hit zone arc
      const za = this.zone * Math.PI * 2;
      c.strokeStyle = GRN; c.lineWidth = 5;
      c.beginPath(); c.arc(sx, sy, 30, -Math.PI / 2 - za, -Math.PI / 2 + za); c.stroke();

      // Needle
      const na = this.beat * Math.PI * 2 - Math.PI / 2;
      c.strokeStyle = '#ffffff'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(sx, sy);
      c.lineTo(sx + Math.cos(na) * 26, sy + Math.sin(na) * 26); c.stroke();
      g.circle(sx + Math.cos(na) * 26, sy + Math.sin(na) * 26, 4, '#ffffff');

      // Three click dots
      for (let i = 0; i < 3; i++) {
        const cx2 = sx - 28 + i * 28;
        const done2 = i < this.clicks;
        g.circle(cx2, sy + 46, 11, done2 ? GRN : (i === this.clicks ? YEL : '#441800'));
        if (done2) {
          c.fillStyle = '#fff'; c.font = "8px 'Press Start 2P'";
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText('✓', cx2, sy + 46); c.textAlign = 'left';
        }
        if (this.results[i]) {
          const rc = this.results[i] === 'PERFECT!' ? YEL : GRN;
          c.fillStyle = rc; c.font = "5px 'Press Start 2P'";
          c.textAlign = 'center'; c.textBaseline = 'bottom';
          c.fillText(this.results[i], cx2, sy + 34); c.textAlign = 'left';
        }
      }

      // Sparkles
      for (const s of this.sparks) {
        c.globalAlpha = Math.max(0, s.life); g.rect(s.x, s.y, 3, 3, s.col); c.globalAlpha = 1;
      }

      // Fail overlay
      if (this.isFail) {
        c.globalAlpha = 0.62; c.fillStyle = '#000'; c.fillRect(0, H / 2 - 30, W, 60); c.globalAlpha = 1;
        c.fillStyle = RED; c.font = "13px 'Press Start 2P'";
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('MISS!', W / 2, H / 2 - 10);
        c.fillStyle = CRM; c.font = "7px 'Press Start 2P'";
        c.fillText('Try again! (' + (3 - this.fails) + ' left)', W / 2, H / 2 + 14);
        c.textAlign = 'left';
      }

      // HUD
      g.rect(0, 0, W, 12, 'rgba(0,0,0,.72)');
      c.fillStyle = YEL; c.font = "7px 'Press Start 2P'";
      c.textAlign = 'center'; c.fillText('CLICK YOUR HEELS!', W / 2, 9); c.textAlign = 'left';
    },
  };

  /* ════════════════════════════════════════════════════════════════════════════
   * SAGA
   * ════════════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id:       'oz-yellowbrick',
    title:    'The Wizard of Oz',
    subtitle: 'FOLLOW THE YELLOW BRICK ROAD',
    credit:   'AN ORIGINAL PIXEL TRIBUTE · L. FRANK BAUM',
    accent:   YEL,
    currency: 'EMERALDS',
    bootCta:  'TAP TO BEGIN THE JOURNEY',
    bootLine: 'FIVE TALES · ONE MAGICAL LAND',
    menuLabel:'THE LAND OF OZ',
    menuHint: 'TAP A STOP ON THE ROAD',
    menuDone: 'HOME AT LAST',
    emblem,
    scenery,

    screens: {
      overlay:      'rgba(0,18,5,.84)',
      win:          GRN,
      lose:         RED,
      chapterLabel: DGRN,
      name:         YEL,
      sub:          GRN,
      intro:        CRM,
      quote:        DGRN,
      help:         YEL,
      score:        CRM,
      cur:          YEL,
      cta:          CRM,
    },
    labels: {
      chapter: 'TALE',
      score:   'EMERALDS',
      win:     'FOLLOW THE ROAD!',
      lose:    'LOST IN OZ',
      cont:    'TAP TO CONTINUE',
      finale:  'TAP FOR THE FINALE',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO PLAY',
    },
    finale: [
      'DOROTHY WAKES IN KANSAS.',
      '',
      'THE RUBY SLIPPERS GLOW',
      'AND THEN GO DARK.',
      '',
      'THERE\'S NO PLACE LIKE HOME.',
    ],

    menu: {
      colors: {
        title:    YEL,
        label:    GRN,
        cur:      CRM,
        hint:     DGRN,
        panel:    'rgba(0,28,8,.82)',
        panelSel: 'rgba(0,56,16,.96)',
        border:   YEL,
        name:     CRM,
        nameDone: YEL,
        sub:      GRN,
      },
      layout: menuLayout,
      card:   menuCard,
      title(api, respect) {
        api.txtC('WIZARD OF OZ', api.W / 2, 20, 13, YEL, true);
        api.txtC('THE LAND OF OZ', api.W / 2, 46, 8, GRN);
        api.txtC('EMERALDS  ' + respect, api.W / 2, 64, 8, CRM);
      },
    },

    chapters: [ch1, ch2, ch3, ch4, ch5],
  });
})();
