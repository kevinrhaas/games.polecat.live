/* ============================================================================
 * 802,701 A.D. — Five Eras of H. G. Wells' Time Machine
 * Adapted from "The Time Machine" by H. G. Wells (1895)
 *
 *  I.   THE MACHINE      — hit the timing bar to charge the time circuits
 *  II.  YEAR 802,701     — gather Weena's fruit before Morlocks emerge
 *  III. THE WHITE SPHINX — stealth past Morlock guards to reach the machine
 *  IV.  THE UNDERWORLD   — navigate dark tunnels with a dwindling match
 *  V.   THE FINAL LEAP   — dodge temporal debris racing back to 1895
 *
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;
  const rand  = Retro.util.rand;
  const randI = Retro.util.randInt;

  /* ── PALETTE ────────────────────────────────────────────────────────────── */
  const C = {
    ink:     '#030806',
    dark:    '#060e08',
    deep:    '#0a1a0e',
    green:   '#44ff88',
    greenL:  '#88ffbb',
    greenD:  '#114422',
    amber:   '#ffaa33',
    amberD:  '#664400',
    brass:   '#c8882a',
    brassD:  '#7a5010',
    eloi:    '#d4c8ff',
    eloiD:   '#605080',
    morlock: '#aa2222',
    morlockD:'#441111',
    steel:   '#6688aa',
    steelL:  '#aaccee',
    red:     '#ff3322',
    bone:    '#e8d4a0',
    mist:    '#6a8870',
    glow:    'rgba(68,255,136,.18)',
  };

  /* ── EMBLEM — Time Machine: spinning dial, saddle, brass frame ─────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx, t = api.t;
    c.globalAlpha = 0.15 + 0.07 * Math.sin(t * 0.8);
    const grd = c.createRadialGradient(cx, cy, 2, cx, cy, 40);
    grd.addColorStop(0, C.greenL); grd.addColorStop(1, 'transparent');
    c.fillStyle = grd; c.fillRect(cx - 44, cy - 44, 88, 88);
    c.globalAlpha = 1;
    // Saddle
    g.rect(cx - 12, cy + 8,  24, 8,  C.brass);
    g.rect(cx - 8,  cy + 12, 16, 4,  C.brassD);
    // Frame rods
    g.rect(cx - 10, cy - 12, 4, 22, C.steelL);
    g.rect(cx + 6,  cy - 12, 4, 22, C.steelL);
    // Main dial (spinning)
    c.save();
    c.translate(cx, cy - 16);
    c.strokeStyle = C.greenD; c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, 14, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = C.green; c.lineWidth = 1;
    const angle = t * 1.8;
    const rx = Math.cos(angle) * 11, ry = Math.sin(angle) * 11;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(rx, ry); c.stroke();
    c.restore();
    // Lever
    g.rect(cx + 14, cy - 8,  4, 16, C.brass);
    g.rect(cx + 12, cy - 12, 8, 6,  C.amber);
    // Base
    g.rect(cx - 18, cy + 14, 36, 6, C.brassD);
    // Terminal indicator lights
    c.globalAlpha = 0.8 + 0.2 * Math.sin(t * 2.2);
    g.rect(cx - 6, cy - 26, 4, 4, C.green);
    g.rect(cx + 2, cy - 26, 4, 4, C.green);
    c.globalAlpha = 1;
  }

  /* ── SCENERY ────────────────────────────────────────────────────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      c.fillStyle = '#040b06'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(68,255,136,0.055)'; c.lineWidth = 1;
      for (let x = 0; x <= W; x += 22) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
      for (let y = 0; y <= H; y += 22) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.globalAlpha = 0.07 + 0.03 * Math.sin(t * 0.5);
      const grd = c.createRadialGradient(W * 0.5, H * 0.38, 0, W * 0.5, H * 0.38, 110);
      grd.addColorStop(0, C.amber); grd.addColorStop(1, 'transparent');
      c.fillStyle = grd; c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
      return;
    }

    // Far-future garden / standard sky
    const sky = c.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, '#0c1a10');
    sky.addColorStop(0.5, '#162a18');
    sky.addColorStop(1, '#203028');
    c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.55);
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 79 + 13) % (W - 4)) + 2;
      const sy = ((i * 53 + 7) % Math.floor(H * 0.48)) + 2;
      c.globalAlpha = 0.09 + 0.12 * Math.sin(t * 1.1 + i);
      g.rect(sx, sy, 1, 1, C.greenL);
    }
    c.globalAlpha = 1;
    // Dying sun
    c.globalAlpha = 0.55 + 0.08 * Math.sin(t * 0.3);
    const sg = c.createRadialGradient(W * 0.78, H * 0.11, 0, W * 0.78, H * 0.11, 22);
    sg.addColorStop(0, '#ffcc44'); sg.addColorStop(0.5, '#cc4422'); sg.addColorStop(1, 'transparent');
    c.fillStyle = sg; c.fillRect(W * 0.78 - 26, H * 0.11 - 26, 52, 52);
    c.globalAlpha = 1;
    // Ground
    const ground = c.createLinearGradient(0, H * 0.54, 0, H);
    ground.addColorStop(0, '#1a3020');
    ground.addColorStop(1, '#060e08');
    c.fillStyle = ground; c.fillRect(0, H * 0.54, W, H * 0.46);
    // Distant palace silhouette
    c.globalAlpha = 0.13;
    g.rect(Math.floor(W * 0.08), Math.floor(H * 0.36), 56, 26, C.eloi);
    g.rect(Math.floor(W * 0.08) + 18, Math.floor(H * 0.29), 20, 8, C.eloi);
    g.rect(Math.floor(W * 0.56), Math.floor(H * 0.39), 38, 20, C.eloi);
    c.globalAlpha = 1;
  }

  /* ── MENU — staggered brass instrument panels (clock/dial theme) ─────── */
  const DIAL_RECTS = [
    { x: 10,  y: 84,  w: 152, h: 52 },
    { x: 108, y: 142, w: 152, h: 52 },
    { x: 10,  y: 200, w: 152, h: 52 },
    { x: 108, y: 258, w: 152, h: 52 },
    { x: 48,  y: 318, w: 174, h: 52 },
  ];
  const ERA_TAGS = ['1895', '802,701', 'SPHINX', 'BELOW', 'HOME'];

  const menu = {
    title(api, respect) {
      const W = api.W, c = api.ctx;
      c.strokeStyle = C.greenD; c.lineWidth = 1;
      c.beginPath(); c.moveTo(14, 79); c.lineTo(W - 14, 79); c.stroke();
      api.txtCFit('802,701 A.D.', W / 2, 13, 18, C.greenL, true);
      api.txtCFit('THE TIME MACHINE', W / 2, 42, 7, C.mist);
      api.txtC('ERAS CROSSED: ' + respect, W / 2, 62, 7, C.amber);
    },
    layout(api, chapters) { return DIAL_RECTS.map(r => Object.assign({}, r)); },
    card(api, info) {
      const { ch, i, x, y, w, h, sel, done, best } = info;
      const g = api.gfx, c = api.ctx;
      const bg = done ? '#0a1a0c' : (sel ? '#102014' : '#070e08');
      g.rect(x, y, w, h, bg);
      const border = sel ? C.amber : (done ? C.green : C.greenD);
      g.rectO(x, y, w, h, border, 1);
      // Rivets
      g.rect(x + 2, y + 2, 3, 3, C.brassD);
      g.rect(x + w - 5, y + 2, 3, 3, C.brassD);
      g.rect(x + 2, y + h - 5, 3, 3, C.brassD);
      g.rect(x + w - 5, y + h - 5, 3, 3, C.brassD);
      // Era tag
      api.txt('ERA · ' + ERA_TAGS[i], x + 8, y + 6, 5, done ? C.green : C.brass);
      // Icon
      if (ch.icon) ch.icon(api, x + w - 18, y + h / 2);
      // Name
      api.txtCFit(ch.name, x + (w - 22) / 2 + 8, y + 20, 9, sel ? C.greenL : C.green, true, w - 32);
      // Sub
      api.txt(ch.sub || '', x + 8, y + 36, 5, C.mist);
      // Status
      if (done) api.txt('✓ ' + best, x + w - 44, y + 36, 5, C.green);
      else      api.txt(sel ? '► TRAVEL' : '○', x + w - (sel ? 46 : 14), y + 36, 5, sel ? C.greenL : C.greenD);
    },
  };

  /* ── CHAPTER ICONS ──────────────────────────────────────────────────────── */
  function iconDial(api, x, y) {
    const g = api.gfx, c = api.ctx;
    c.strokeStyle = C.amber; c.lineWidth = 1;
    c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.stroke();
    g.rect(x - 1, y - 6, 2, 7, C.green);
    g.rect(x - 2, y - 2, 4, 2, C.amber);
  }
  function iconFruit(api, x, y) {
    const g = api.gfx;
    g.rect(x - 3, y - 5, 6, 7, '#44cc44');
    g.rect(x - 1, y - 8, 2, 4, '#2a6a2a');
  }
  function iconSphinx(api, x, y) {
    const g = api.gfx;
    g.rect(x - 7, y + 2, 14, 7, C.eloi);
    g.rect(x - 5, y - 2, 10, 5, C.eloi);
    g.rect(x - 2, y - 6, 4, 5, C.eloi);
  }
  function iconTorch(api, x, y) {
    const g = api.gfx, c = api.ctx;
    g.rect(x - 1, y, 2, 8, C.brass);
    c.globalAlpha = 0.7 + 0.3 * Math.sin(api.t * 3.2);
    g.rect(x - 3, y - 7, 6, 8, '#ff8800');
    c.globalAlpha = 1;
  }
  function iconLeap(api, x, y) {
    const g = api.gfx;
    g.rect(x - 2, y - 8, 4, 10, C.steelL);
    g.rect(x - 4, y + 1, 8, 4, C.steel);
    g.rect(x - 1, y + 4, 2, 4, '#ff6622');
  }

  /* ======================================================================
   *  CHAPTER I — THE MACHINE
   *  Timing bar: tap when the needle lands in the green zone · 8 rounds
   *  3 misses = lose, complete 8 = win (~25s at a natural pace)
   * ====================================================================== */
  const CH1 = {
    id: 'machine', name: 'THE MACHINE', sub: 'CALIBRATE THE CIRCUITS',
    icon: iconDial,
    intro: [
      'THE WORKSHOP, 1895.',
      'THE TIME MACHINE TREMBLES',
      'ON ITS CRYSTAL RUNNERS.',
      'HIT THE GREEN ZONE',
      'TO CHARGE EACH CIRCUIT.',
    ],
    quote: '"I drew a breath, set my teeth, gripped the starting lever with both hands, and went off with a thud."',
    help: 'TAP when the needle hits the GREEN zone',
    winText: 'The machine hums with temporal energy. You leap forward.',
    loseText: 'The calibration fails. The machine shudders and dies.',
    init(api) {
      this.round   = 0;
      this.misses  = 0;
      this.charged = 0;
      this.needle  = 0;
      this.speed   = 1.1;
      this.dir     = 1;
      this.zoneL   = 0.36;
      this.zoneR   = 0.64;
      this.flashT  = 0;
      this.flashC  = '';
      this.done    = false;
    },
    update(api, dt) {
      if (this.done) return;
      if (this.flashT > 0) { this.flashT -= dt; return; }
      this.needle += this.dir * this.speed * dt;
      if (this.needle >= 1) { this.needle = 1; this.dir = -1; }
      if (this.needle <= 0) { this.needle = 0; this.dir = 1; }
      const tapped = api.pointer.justDown || api.keyPressed('a') || api.keyPressed('start');
      if (!tapped) return;
      const inZone = this.needle >= this.zoneL && this.needle <= this.zoneR;
      if (inZone) {
        this.charged++;
        this.round++;
        api.addScore(60);
        api.audio.sfx('coin');
        api.burst(api.W / 2, api.H * 0.52, C.greenL, 10);
        this.flashT = 0.28; this.flashC = 'rgba(68,255,136,0.22)';
        // Narrow zone a little and speed up each round
        const s = 0.015 * this.round;
        this.zoneL = Math.min(0.44, 0.36 + s);
        this.zoneR = Math.max(0.56, 0.64 - s);
        this.speed = 1.1 + 0.18 * this.round + rand(0, 0.15);
        if (this.charged >= 8) { this.done = true; api.win(); }
      } else {
        this.misses++;
        api.audio.sfx('hurt');
        api.shake(3, 0.3);
        this.flashT = 0.28; this.flashC = 'rgba(255,50,30,0.22)';
        if (this.misses >= 3) { this.done = true; api.lose(); }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      c.fillStyle = '#040c06'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(68,255,136,0.05)'; c.lineWidth = 1;
      for (let x = 0; x < W; x += 20) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
      for (let y = 0; y < H; y += 20) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }

      // The Time Machine (center-ish)
      const mx = W / 2, my = Math.floor(H * 0.38);
      g.rect(mx - 20, my - 14, 40, 26, C.brassD);
      g.rect(mx - 16, my - 10, 32, 18, '#0a1808');
      g.rect(mx - 16, my - 26, 5, 14, C.steelL);
      g.rect(mx + 11, my - 26, 5, 14, C.steelL);
      c.strokeStyle = C.greenD; c.lineWidth = 2;
      c.beginPath(); c.arc(mx, my - 18, 11, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = C.green; c.lineWidth = 1;
      const na = (this.needle - 0.5) * Math.PI * 1.25;
      c.beginPath(); c.moveTo(mx, my - 18);
      c.lineTo(mx + Math.sin(na) * 9, my - 18 - Math.cos(na) * 9); c.stroke();
      g.rect(mx - 14, my + 10, 28, 8, C.brass);
      g.rect(mx - 18, my + 16, 36, 5, C.brassD);

      // Timing bar
      const bx = 22, by = Math.floor(H * 0.62), bw = W - 44, bh = 30;
      g.rect(bx, by, bw, bh, '#071006');
      g.rectO(bx, by, bw, bh, C.greenD, 1);
      const zx = bx + Math.floor(this.zoneL * bw);
      const zw = Math.floor((this.zoneR - this.zoneL) * bw);
      c.globalAlpha = 0.35;
      g.rect(zx, by, zw, bh, C.green);
      c.globalAlpha = 1;
      g.rectO(zx, by, zw, bh, C.greenL, 1);
      const nx = bx + Math.floor(this.needle * bw);
      g.rect(nx - 2, by - 4, 4, bh + 8, C.amber);
      api.txtC('TAP!', nx, by + bh + 5, 7, C.amber);

      // Flash overlay
      if (this.flashT > 0) { c.fillStyle = this.flashC; c.fillRect(0, 0, W, H); }

      // HUD — charge pips
      api.topBar('ERA I · CALIBRATION · 1895');
      const pipW = Math.floor((W - 44) / 8);
      for (let i = 0; i < 8; i++) {
        g.rect(22 + i * (pipW + 2), by - 13, pipW, 7, i < this.charged ? C.green : C.greenD);
      }
      api.txt('MISS: ' + '▪'.repeat(this.misses) + '▫'.repeat(3 - this.misses), 6, 4, 7, this.misses > 1 ? C.red : C.amber);
      api.vignette();
    },
  };

  /* ======================================================================
   *  CHAPTER II — YEAR 802,701
   *  Catch falling fruit; Morlocks emerge from the ground · 3 lives · 26s
   *  Win: catch 10 fruit in time · Lose: all lives lost or time up <10
   * ====================================================================== */
  const CH2 = {
    id: 'eloi', name: 'YEAR 802,701', sub: 'GATHER THE HARVEST',
    icon: iconFruit,
    intro: [
      'THE FAR FUTURE.',
      'THE ELOI DRIFT IN GRACE',
      'BUT FEAR THE DARK.',
      'WEENA NEEDS YOUR HELP:',
      'GATHER THE FRUITS QUICKLY.',
    ],
    quote: '"She had come to me, it seemed, as a child might come to one of us if frightened in the dark."',
    help: 'DRAG left/right · catch FRUIT · avoid Morlocks',
    winText: 'Weena laughs and fills her arms. The garden is full.',
    loseText: 'The Morlocks drag you below. The garden falls silent.',
    init(api) {
      this.px      = api.W / 2;
      this.fruits  = [];
      this.morlocks= [];
      this.lives   = 3;
      this.caught  = 0;
      this.timer   = 26;
      this.spawnFT = 0.75;
      this.spawnMT = 3.8;
      this.invT    = 0;
      this.done    = false;
    },
    update(api, dt) {
      if (this.done) return;
      this.timer -= dt;
      if (this.timer <= 0) {
        this.done = true;
        if (this.caught >= 10) api.win(); else api.lose();
        return;
      }
      const W = api.W, H = api.H;
      const p = api.pointer;
      if (p.down) this.px += (p.x - this.px) * 0.16;
      if (api.keyDown('left'))  this.px -= 120 * dt;
      if (api.keyDown('right')) this.px += 120 * dt;
      this.px = clamp(this.px, 12, W - 12);

      this.spawnFT -= dt;
      if (this.spawnFT <= 0) {
        this.spawnFT = 0.5 + rand(0, 0.6);
        this.fruits.push({ x: randI(16, W - 16), y: -12, spd: 58 + rand(0, 44) });
      }
      this.spawnMT -= dt;
      if (this.spawnMT <= 0) {
        this.spawnMT = 3.0 + rand(0, 1.8);
        this.morlocks.push({ x: randI(20, W - 20), y: H + 12, t: 0 });
      }

      const py = H - 44;
      this.fruits = this.fruits.filter(f => {
        f.y += f.spd * dt;
        if (Math.abs(this.px - f.x) < 18 && Math.abs(py - f.y) < 18) {
          this.caught++;
          api.addScore(50);
          api.burst(f.x, f.y, C.greenL, 6);
          api.audio.sfx('coin');
          if (this.caught >= 10) { this.done = true; api.win(); }
          return false;
        }
        return f.y < H + 20;
      });

      if (this.invT > 0) this.invT -= dt;
      this.morlocks = this.morlocks.filter(m => {
        m.t += dt;
        m.y -= 38 * dt;
        if (m.y < py + 10 && Math.abs(m.x - this.px) < 20 && this.invT <= 0) {
          this.lives--;
          this.invT = 1.2;
          api.shake(4, 0.3);
          api.audio.sfx('hurt');
          if (this.lives <= 0) { this.done = true; api.lose(); }
        }
        return m.y > -20 && m.t < 3.8;
      });
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      const sky = c.createLinearGradient(0, 0, 0, H * 0.55);
      sky.addColorStop(0, '#0c1a10'); sky.addColorStop(1, '#1a2e18');
      c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.55);
      for (let i = 0; i < 24; i++) {
        c.globalAlpha = 0.07 + 0.08 * Math.sin(api.t + i);
        g.rect(((i * 77 + 3) % (W - 4)) + 2, ((i * 41 + 5) % Math.floor(H * 0.5)) + 2, 1, 1, C.greenL);
      }
      c.globalAlpha = 1;
      c.globalAlpha = 0.5;
      const sg = c.createRadialGradient(W * 0.8, H * 0.1, 0, W * 0.8, H * 0.1, 20);
      sg.addColorStop(0, '#ffcc44'); sg.addColorStop(0.6, '#cc4422'); sg.addColorStop(1, 'transparent');
      c.fillStyle = sg; c.fillRect(W * 0.8 - 24, H * 0.1 - 24, 48, 48);
      c.globalAlpha = 1;
      g.rect(0, Math.floor(H * 0.55), W, Math.ceil(H * 0.45), '#102018');
      g.rect(0, Math.floor(H * 0.55), W, 2, '#1a3820');

      this.fruits.forEach(f => {
        g.rect(f.x - 4, f.y - 6, 8, 8, '#44cc44');
        g.rect(f.x - 1, f.y - 9, 2, 4, '#2a6a2a');
      });

      this.morlocks.forEach(m => {
        const a = Math.min(1, m.t / 0.3);
        c.globalAlpha = a;
        g.rect(m.x - 7, m.y - 14, 14, 16, C.morlockD);
        g.rect(m.x - 5, m.y - 18, 10, 6,  C.morlock);
        g.rect(m.x - 4, m.y - 17, 2, 2, C.greenL);
        g.rect(m.x + 2, m.y - 17, 2, 2, C.greenL);
        c.globalAlpha = 1;
      });

      const py = H - 44;
      c.globalAlpha = this.invT > 0 ? 0.4 : 1;
      g.rect(this.px - 6, py - 16, 12, 18, C.bone);
      g.rect(this.px - 4, py - 20, 8,  6,  C.steelL);
      g.rect(this.px - 2, py - 22, 4,  3,  C.brass);
      g.rect(this.px - 8, py - 6,  4, 10,  C.bone);
      g.rect(this.px + 4, py - 6,  4, 10,  C.bone);
      g.rect(this.px - 6, py + 2,  5,  8,  C.brassD);
      g.rect(this.px + 1, py + 2,  5,  8,  C.brassD);
      c.globalAlpha = 1;

      api.topBar('ERA II · 802,701 A.D.');
      api.txt('FRUIT: ' + this.caught + '/10', 6, 4, 7, C.greenL);
      api.txt('LIVES: ' + '♥'.repeat(this.lives), W - 64, 4, 7, this.lives < 2 ? C.red : C.amber);
      const bw = W - 40;
      g.rect(20, H - 12, bw, 5, C.greenD);
      g.rect(20, H - 12, Math.floor(Math.max(0, this.timer / 26) * bw), 5, C.green);
      api.txtC(Math.ceil(this.timer) + 's', W / 2, H - 22, 8, C.mist);
      api.vignette();
    },
  };

  /* ======================================================================
   *  CHAPTER III — THE WHITE SPHINX
   *  Stealth: navigate past 3 rotating Morlock sight-cones · reach the goal
   * ====================================================================== */
  const CH3 = {
    id: 'sphinx', name: 'THE WHITE SPHINX', sub: 'RECLAIM THE MACHINE',
    icon: iconSphinx,
    intro: [
      'YOUR MACHINE IS GONE.',
      'IT SITS INSIDE THE',
      'WHITE SPHINX PEDESTAL.',
      'SLIP PAST THE MORLOCK',
      'SENTRIES TO REACH IT.',
    ],
    quote: '"I found the Time Machine had been dragged inside the bronze pedestal of the White Sphinx."',
    help: 'DRAG to creep · stay OUT of the yellow light beams',
    winText: 'You reach the machine! The levers are intact.',
    loseText: 'A Morlock\'s clawed hand catches your collar in the dark.',
    init(api) {
      this.px = api.W / 2;
      this.py = api.H - 50;
      this.goalX = api.W / 2;
      this.goalY = 84;
      this.guards = [
        { x: api.W * 0.22, y: api.H * 0.63, angle: 0,          dir: 1,  spd: 0.50, range: 68, half: 0.44 },
        { x: api.W * 0.78, y: api.H * 0.45, angle: Math.PI,    dir: -1, spd: 0.58, range: 64, half: 0.40 },
        { x: api.W * 0.50, y: api.H * 0.27, angle: Math.PI*0.5,dir: 1,  spd: 0.68, range: 60, half: 0.42 },
      ];
      this.done = false;
    },
    _inCone(px, py, guard) {
      const dx = px - guard.x, dy = py - guard.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > guard.range) return false;
      const a = Math.atan2(dy, dx);
      let d = a - guard.angle;
      while (d >  Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      return Math.abs(d) < guard.half;
    },
    update(api, dt) {
      if (this.done) return;
      this.guards.forEach(guard => { guard.angle += guard.dir * guard.spd * dt; });
      const p = api.pointer;
      if (p.down) {
        this.px += (p.x - this.px) * 0.11;
        this.py += (p.y - this.py) * 0.11;
      }
      const spd = 88;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.keyDown('up'))    this.py -= spd * dt;
      if (api.keyDown('down'))  this.py += spd * dt;
      this.px = clamp(this.px, 8, api.W - 8);
      this.py = clamp(this.py, 30, api.H - 20);

      for (const guard of this.guards) {
        if (this._inCone(this.px, this.py, guard)) {
          this.done = true;
          api.audio.sfx('hurt'); api.shake(5, 0.4); api.flash('#ff2200', 0.45);
          api.lose(); return;
        }
      }
      const dx = this.px - this.goalX, dy = this.py - this.goalY;
      if (dx * dx + dy * dy < 22 * 22) {
        this.done = true;
        api.addScore(120);
        api.burst(this.goalX, this.goalY, C.amber, 16);
        api.audio.sfx('win');
        api.win();
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      c.fillStyle = '#040b06'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 30; i++) {
        c.globalAlpha = 0.06 + 0.09 * Math.sin(api.t * 0.8 + i);
        g.rect(((i * 71 + 11) % (W - 4)) + 2, ((i * 43 + 7) % Math.floor(H * 0.6)) + 2, 1, 1, C.steelL);
      }
      c.globalAlpha = 1;

      // White Sphinx goal
      const sx = this.goalX, sy = this.goalY;
      c.globalAlpha = 0.88;
      g.rect(sx - 22, sy + 4,  44, 22, C.eloi);
      g.rect(sx - 16, sy - 7,  32, 13, C.eloi);
      g.rect(sx - 8,  sy - 17, 16, 11, C.eloi);
      g.rect(sx - 3,  sy - 24, 6,  8,  C.eloi);
      c.globalAlpha = 1;
      c.globalAlpha = 0.28 + 0.18 * Math.sin(api.t * 2.4);
      const gg = c.createRadialGradient(sx, sy, 0, sx, sy, 24);
      gg.addColorStop(0, C.amber); gg.addColorStop(1, 'transparent');
      c.fillStyle = gg; c.fillRect(sx - 26, sy - 28, 52, 56);
      c.globalAlpha = 1;
      api.txtC('MACHINE', sx, sy - 30, 6, C.amber);

      // Sight cones
      this.guards.forEach(guard => {
        c.save();
        c.translate(guard.x, guard.y);
        c.globalAlpha = 0.17;
        c.fillStyle = '#ffdd22';
        c.beginPath();
        c.moveTo(0, 0);
        c.arc(0, 0, guard.range, guard.angle - guard.half, guard.angle + guard.half);
        c.closePath(); c.fill();
        c.globalAlpha = 0.5;
        c.strokeStyle = '#ffdd22'; c.lineWidth = 1; c.stroke();
        c.restore();
        g.rect(guard.x - 5, guard.y - 8,  10, 12, C.morlockD);
        g.rect(guard.x - 4, guard.y - 13,  8,  6, C.morlock);
        g.rect(guard.x - 3, guard.y - 12,  2,  2, C.greenL);
        g.rect(guard.x + 1, guard.y - 12,  2,  2, C.greenL);
      });

      // Player
      g.rect(this.px - 5, this.py - 14, 10, 16, C.bone);
      g.rect(this.px - 3, this.py - 18,  6,  5, C.steelL);
      g.rect(this.px - 1, this.py - 20,  2,  3, C.brass);

      api.topBar('ERA III · THE WHITE SPHINX');
      api.txt('AVOID THE LIGHT', 6, 4, 7, C.amber);
      api.vignette();
    },
  };

  /* ======================================================================
   *  CHAPTER IV — THE UNDERWORLD
   *  Navigate by matchlight · collect 5 gears · flame shrinks over 22s
   *  Morlocks drain the flame on contact · survive until all 5 gears found
   * ====================================================================== */
  const CH4 = {
    id: 'underworld', name: 'THE UNDERWORLD', sub: 'LIGHT THE WAY',
    icon: iconTorch,
    intro: [
      'BELOW THE GARDEN',
      'THE MORLOCKS TOIL.',
      'ONE MATCH LIGHTS YOUR WAY.',
      'FIND THE MACHINE PARTS',
      'BEFORE THE FLAME DIES.',
    ],
    quote: '"I groped about in the blackness, and something soft, that smelled of musk, ran away from me."',
    help: 'DRAG to move · gather GEARS · watch the flame!',
    winText: 'You clutch the last gear and sprint for the ladder!',
    loseText: 'The match dies. In the dark, the Morlocks take you.',
    init(api) {
      this.px        = api.W / 2;
      this.py        = api.H / 2 + 20;
      this.flame     = 22;
      this.collected = 0;
      this.gears     = [];
      this.morlocks  = [];
      this.spawnMT   = 2.6;
      this.invT      = 0;
      this.done      = false;
      const W = api.W, H = api.H;
      const gpos = [
        { x: 44,     y: 100 },
        { x: W - 44, y: 130 },
        { x: W / 2,  y: H - 84 },
        { x: 38,     y: H - 110 },
        { x: W - 42, y: H * 0.38 },
      ];
      gpos.forEach((p, i) => this.gears.push({ x: p.x, y: p.y, id: i }));
    },
    update(api, dt) {
      if (this.done) return;
      this.flame -= dt;
      if (this.flame <= 0) { this.flame = 0; this.done = true; api.lose(); return; }

      const W = api.W, H = api.H;
      const p = api.pointer;
      if (p.down) {
        this.px += (p.x - this.px) * 0.12;
        this.py += (p.y - this.py) * 0.12;
      }
      const spd = 100;
      if (api.keyDown('left'))  this.px -= spd * dt;
      if (api.keyDown('right')) this.px += spd * dt;
      if (api.keyDown('up'))    this.py -= spd * dt;
      if (api.keyDown('down'))  this.py += spd * dt;
      this.px = clamp(this.px, 10, W - 10);
      this.py = clamp(this.py, 30, H - 20);

      this.gears = this.gears.filter(ge => {
        const dx = this.px - ge.x, dy = this.py - ge.y;
        if (dx * dx + dy * dy < 22 * 22) {
          this.collected++;
          api.addScore(100);
          api.burst(ge.x, ge.y, C.amber, 10);
          api.audio.sfx('coin');
          if (this.collected >= 5) { this.done = true; api.win(); }
          return false;
        }
        return true;
      });

      this.spawnMT -= dt;
      if (this.spawnMT <= 0) {
        this.spawnMT = 1.8 + rand(0, 1.2);
        const sideLeft = Math.random() < 0.5;
        this.morlocks.push({
          x: sideLeft ? randI(0, W / 2 - 20) : randI(W / 2 + 20, W - 10),
          y: randI(30, H - 30),
          spd: 34 + rand(0, 22),
        });
      }

      if (this.invT > 0) this.invT -= dt;
      this.morlocks = this.morlocks.filter(m => {
        const dx = this.px - m.x, dy = this.py - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) { m.x += (dx / dist) * m.spd * dt; m.y += (dy / dist) * m.spd * dt; }
        if (dist < 16 && this.invT <= 0) {
          this.flame -= 4;
          this.invT = 1.0;
          api.shake(3, 0.25); api.audio.sfx('hurt');
          if (this.flame <= 0) { this.done = true; api.lose(); }
          return false;
        }
        return dist > 4;
      });
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      c.fillStyle = '#010302'; c.fillRect(0, 0, W, H);
      for (let xi = 0; xi < W; xi += 32) for (let yi = 24; yi < H; yi += 20) {
        c.globalAlpha = 0.05;
        g.rect(xi, yi, 30, 18, '#0a160a');
        c.globalAlpha = 1;
      }

      // Matchlight radius
      const radius = 40 + (this.flame / 22) * 62;
      c.globalAlpha = Math.min(1, this.flame / 22) * 0.9;
      const lightGrd = c.createRadialGradient(this.px, this.py, 0, this.px, this.py, radius);
      lightGrd.addColorStop(0, 'rgba(255,180,60,0.28)');
      lightGrd.addColorStop(0.55, 'rgba(255,130,30,0.10)');
      lightGrd.addColorStop(1, 'transparent');
      c.fillStyle = lightGrd; c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;

      // Gears — visible only in light
      this.gears.forEach(ge => {
        const dx = this.px - ge.x, dy = this.py - ge.y;
        const vis = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / radius);
        if (vis < 0.04) return;
        c.globalAlpha = vis;
        g.rect(ge.x - 7, ge.y - 7, 14, 14, C.brassD);
        g.rect(ge.x - 5, ge.y - 5, 10, 10, C.amberD);
        g.rect(ge.x - 3, ge.y - 3,  6,  6, C.amber);
        g.rect(ge.x - 5, ge.y - 1, 10,  2, C.brassD);
        g.rect(ge.x - 1, ge.y - 5,  2, 10, C.brassD);
        c.globalAlpha = 1;
      });

      // Morlocks — semi-visible
      this.morlocks.forEach(m => {
        const dx = this.px - m.x, dy = this.py - m.y;
        const vis = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / radius * 0.7);
        if (vis < 0.04) return;
        c.globalAlpha = vis;
        g.rect(m.x - 6, m.y - 12, 12, 14, C.morlockD);
        g.rect(m.x - 4, m.y - 16,  8,  5, C.morlock);
        g.rect(m.x - 3, m.y - 15,  2,  2, C.greenL);
        g.rect(m.x + 1, m.y - 15,  2,  2, C.greenL);
        c.globalAlpha = 1;
      });

      // Match flame
      c.globalAlpha = 0.6 + 0.4 * Math.sin(api.t * 4.5);
      g.rect(this.px - 2, this.py - 26,  4, 10, C.brassD);
      g.rect(this.px - 4, this.py - 34,  8,  9, '#ff8800');
      g.rect(this.px - 2, this.py - 38,  4,  5, '#ffcc44');
      c.globalAlpha = 1;

      // Player
      c.globalAlpha = this.invT > 0 ? 0.4 : 1;
      g.rect(this.px - 5, this.py - 12, 10, 14, C.bone);
      g.rect(this.px - 3, this.py - 16,  6,  5, C.steelL);
      c.globalAlpha = 1;

      api.topBar('ERA IV · THE UNDERWORLD');
      api.txt('GEARS: ' + this.collected + '/5', 6, 4, 7, C.amber);
      const bw = W - 40;
      g.rect(20, H - 12, bw, 5, C.morlockD);
      const fr = Math.max(0, this.flame / 22);
      const fc = fr > 0.4 ? '#ff8800' : (fr > 0.18 ? '#ff4400' : C.red);
      g.rect(20, H - 12, Math.floor(fr * bw), 5, fc);
      api.txtC('FLAME', W / 2, H - 22, 7, C.mist);
      api.vignette();
    },
  };

  /* ======================================================================
   *  CHAPTER V — THE FINAL LEAP
   *  Dodge temporal debris while the year counter races back to 1895
   *  28 seconds survive · 3 lives
   * ====================================================================== */
  const CH5 = {
    id: 'escape', name: 'THE FINAL LEAP', sub: 'RETURN TO 1895',
    icon: iconLeap,
    intro: [
      'THE MACHINE IS YOURS.',
      'MORLOCKS SWARM THE LEVER.',
      'PULL IT — RACE BACK',
      'THROUGH THE CENTURIES',
      'TO THE WORLD YOU KNOW.',
    ],
    quote: '"I felt a nightmare sensation of falling; and, looking round, I saw that I had fallen into a gigantic bowl of flowers."',
    help: 'DRAG left/right through the time stream · dodge debris',
    winText: 'The workshop rushes back. You have returned home.',
    loseText: 'The machine tumbles. You are lost in the centuries.',
    init(api) {
      this.px     = api.W / 2;
      this.py     = Math.floor(api.H * 0.70);
      this.timer  = 28;
      this.speed  = 110;
      this.rocks  = [];
      this.spawnT = 0.62;
      this.lives  = 3;
      this.invT   = 0;
      this.years  = 802701;
      this.scroll = 0;
      this.done   = false;
    },
    update(api, dt) {
      if (this.done) return;
      this.timer -= dt;
      this.years = Math.max(1895, Math.floor(802701 - (802701 - 1895) * ((28 - this.timer) / 28)));
      this.scroll += dt * 90;
      if (this.timer <= 0) {
        this.done = true;
        api.addScore(80);
        api.win();
        return;
      }
      const W = api.W;
      const p = api.pointer;
      if (p.down) this.px += (p.x - this.px) * 0.14;
      if (api.keyDown('left'))  this.px -= 128 * dt;
      if (api.keyDown('right')) this.px += 128 * dt;
      this.px = clamp(this.px, 12, W - 12);

      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = 0.32 + rand(0, 0.44);
        const sz = randI(6, 18);
        this.rocks.push({ x: randI(sz, W - sz), y: -sz * 2, sz,
          spd: this.speed + rand(0, 64),
          col: Math.random() < 0.5 ? C.steel : C.greenD });
        this.speed = Math.min(this.speed + 1.5, 210);
      }

      if (this.invT > 0) this.invT -= dt;
      this.rocks = this.rocks.filter(r => {
        r.y += r.spd * dt;
        const dx = this.px - r.x, dy = this.py - r.y;
        if (dx * dx + dy * dy < (r.sz + 11) * (r.sz + 11) && this.invT <= 0) {
          this.lives--;
          this.invT = 0.9;
          api.shake(4, 0.3); api.audio.sfx('hurt');
          api.burst(r.x, r.y, C.steel, 8);
          if (this.lives <= 0) { this.done = true; api.lose(); }
          return false;
        }
        return r.y < api.H + 24;
      });
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      c.fillStyle = '#030806'; c.fillRect(0, 0, W, H);
      // Time-stream streaks
      for (let i = 0; i < 24; i++) {
        const lx = ((i * 53 + 7) % W);
        const ly = ((this.scroll * 0.72 + i * 37) % H);
        const lh = 12 + (i % 4) * 8;
        c.globalAlpha = 0.07 + 0.07 * (i % 3 === 0 ? 1 : 0);
        g.rect(lx, ly, 1, lh, i % 3 === 0 ? C.amber : (i % 3 === 1 ? C.green : C.steel));
        c.globalAlpha = 1;
      }
      // Year counter
      c.globalAlpha = 0.7 + 0.3 * Math.sin(api.t * 5.5);
      api.txtC(String(this.years), W / 2, H * 0.17, 17, C.amber, true);
      c.globalAlpha = 1;
      api.txtC('A.D.', W / 2, H * 0.17 + 23, 8, C.mist);

      // Debris
      this.rocks.forEach(r => {
        g.rect(r.x - r.sz / 2, r.y - r.sz / 2, r.sz, r.sz, r.col);
        c.globalAlpha = 0.3;
        g.rect(r.x - r.sz / 2 + 1, r.y - r.sz / 2 + 1, r.sz - 2, r.sz - 2, '#000000');
        c.globalAlpha = 1;
      });

      // Time machine + traveller
      const px = Math.floor(this.px), py = Math.floor(this.py);
      c.globalAlpha = this.invT > 0 ? 0.4 : 1;
      g.rect(px - 14, py - 8,  28, 18, C.brassD);
      g.rect(px - 10, py - 4,  20, 12, '#0a1808');
      g.rect(px - 10, py - 18,  4, 12, C.steelL);
      g.rect(px + 6,  py - 18,  4, 12, C.steelL);
      g.rect(px - 4,  py - 14,  8,  8, C.greenD);
      g.rect(px - 2,  py - 12,  4,  4, C.green);
      g.rect(px - 8,  py + 8,  16,  6, C.brass);
      g.rect(px - 4,  py - 26,  8, 12, C.bone);
      g.rect(px - 3,  py - 30,  6,  5, C.steelL);
      c.globalAlpha = 1;

      api.topBar('ERA V · THE FINAL LEAP');
      api.txt('LIVES: ' + '♥'.repeat(this.lives), 6, 4, 7, this.lives < 2 ? C.red : C.amber);
      const bw = W - 40;
      g.rect(20, H - 12, bw, 5, C.greenD);
      g.rect(20, H - 12, Math.floor(Math.max(0, this.timer / 28) * bw), 5, C.green);
      api.txtC(Math.ceil(this.timer) + 's', W / 2, H - 22, 8, C.mist);
      api.vignette(); api.scanlines();
    },
  };

  /* ======================================================================
   *  RetroSaga.create
   * ====================================================================== */
  RetroSaga.create({
    id:       'timemachine',
    title:    '802,701 A.D.',
    subtitle: 'THE TIME MACHINE',
    currency: 'ERAS',
    credit:   'H. G. WELLS · 1895',
    accent:   '#44ff88',
    emblem,
    scenery,
    bootCta:   'TAP TO LEAP FORWARD',
    menuLabel: 'CHOOSE YOUR ERA',
    menuHint:  'TAP A TIME PERIOD',
    menuDone:  'ALL ERAS CROSSED. 1895 AWAITS.',
    menu,
    finale: [
      'THE WORKSHOP IS STILL.',
      'THE MACHINE SITS IN ITS CORNER,',
      'DENTED AND SILENT.',
      '',
      'WHAT DID YOU SEE?',
      'AN EMPIRE OF FLOWERS.',
      'A WORLD DIVIDED IN THE DARK.',
      'THE LAST, RED EARTH.',
      '',
      '"I GRIEVED TO THINK HOW',
      'BRIEF THE DREAM OF',
      'THE HUMAN INTELLECT HAD BEEN."',
    ],
    tagline: 'A POLECAT GAME · H.G. WELLS 1895',

    screens: {
      overlay:      'rgba(3,8,6,.88)',
      win:          '#88ffbb',
      lose:         '#ff3322',
      chapterLabel: '#4a6a50',
      name:         '#e8d4a0',
      sub:          '#44ff88',
      intro:        '#8ab890',
      quote:        '#3a5a44',
      help:         '#ffaa33',
      score:        '#e8d4a0',
      cur:          '#44ff88',
      cta:          '#c8882a',
    },
    labels: {
      chapter: 'ERA',
      score:   'ERAS CROSSED',
      win:     'TIME HOLDS',
      lose:    'LOST IN THE CENTURIES',
      cont:    'TAP TO PRESS ON',
      finale:  'TAP FOR THE FINAL ERA',
      toMenu:  'RETURN TO THE WORKSHOP',
      play:    'BEGIN THE LEAP',
    },

    width: 270, height: 480, parent: '#game',
    chapters: [CH1, CH2, CH3, CH4, CH5],
  });

})();
