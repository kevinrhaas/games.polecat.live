/* ============================================================================
 * HEART MACHINE — METROPOLIS (1927)
 * Five chapters through Fritz Lang's 1927 masterpiece:
 *   1. THE MACHINE     — timing: hit the green zone 8 times on the pressure dial
 *   2. THE DESCENT     — dodge: steer Freder through the workers' shaft 22 seconds
 *   3. THE FLOOD       — collect: guide Maria's children before the water rises
 *   4. FALSE PROPHET   — intercept: expose Rotwang's robot 6 times at the revel
 *   5. THE CATHEDRAL   — platformer: climb to the great bell and ring it
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;
  const rand  = Retro.util.rand;
  const randI = Retro.util.randInt;

  /* ─── Art Deco / industrial palette ─── */
  const C = {
    black:  '#060810',
    dark:   '#0c0e18',
    deep:   '#10141e',
    steel:  '#1a2030',
    iron:   '#242c3c',
    slate:  '#364050',
    chrome: '#6878a0',
    silver: '#9aacbc',
    white:  '#dce8f0',
    deco:   '#c8a020',
    decoL:  '#ffe060',
    amber:  '#ff9000',
    spark:  '#ffffa0',
    elec:   '#40d0ff',
    elecD:  '#1050a0',
    steam:  '#505868',
    rust:   '#804010',
    flame:  '#ff4400',
    worker: '#2a4050',
    green:  '#00cc44',
  };

  /* ─── Emblem: the great gear-heart of Metropolis ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    c.globalAlpha = 0.20; c.fillStyle = C.elec;
    c.beginPath(); c.arc(cx, cy, 42, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.5; c.strokeStyle = C.deco; c.lineWidth = 2;
    c.beginPath(); c.arc(cx, cy, 34, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = 1;
    // Gear teeth
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const tx = Math.round(cx + Math.cos(a) * 34);
      const ty = Math.round(cy + Math.sin(a) * 34);
      g.rect(tx - 3, ty - 3, 6, 6, C.slate);
    }
    // Machine body
    g.rect(cx - 20, cy - 22, 40, 44, C.iron);
    g.rect(cx - 16, cy - 26, 32, 8, C.slate);
    // Power core glow
    c.globalAlpha = 0.85;
    g.circle(cx, cy, 12, C.elecD);
    g.circle(cx, cy, 7, C.elec);
    c.globalAlpha = 1;
    // Spark lines
    c.strokeStyle = C.spark; c.lineWidth = 1; c.globalAlpha = 0.6;
    c.beginPath(); c.moveTo(cx - 7, cy - 7); c.lineTo(cx - 16, cy - 16); c.stroke();
    c.beginPath(); c.moveTo(cx + 7, cy - 7); c.lineTo(cx + 16, cy - 16); c.stroke();
    c.globalAlpha = 1;
  }

  /* ─── Industrial Metropolis scenery ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    // Sky
    const sky = c.createLinearGradient(0, 0, 0, H * 0.52);
    sky.addColorStop(0, C.black); sky.addColorStop(1, C.dark);
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    // Stars
    for (let i = 0; i < 22; i++) {
      const sx = (i * 71 + 13) % W, sy = (i * 47 + 5) % Math.floor(H * 0.3);
      c.globalAlpha = 0.18 + 0.14 * Math.sin(t * 3 + i);
      g.rect(sx, sy, 1, 1, C.white);
    }
    c.globalAlpha = 1;
    // Art Deco towers
    const towers = [[10,130,20,4],[38,110,16,3],[64,150,24,5],[98,95,18,4],[128,125,14,3],[150,85,22,5],[184,115,16,3],[206,95,20,4],[236,130,16,3]];
    for (const [tx,th,tw,steps] of towers) {
      g.rect(tx, H*0.52 - th, tw, th, C.dark);
      for (let s = 0; s < steps; s++) {
        const sw = Math.max(4, tw - s * 3), sx2 = tx + (tw - sw) / 2;
        g.rect(Math.round(sx2), Math.round(H * 0.52 - th - s * 5), Math.round(sw), 5, C.steel);
      }
      if ((tx * 3) % 7 < 3) g.rect(tx + 3, Math.round(H * 0.52 - th + 18), 4, 4, C.deco);
    }
    // Smokestacks
    const stacks = [[32,195],[88,175],[162,195],[222,180]];
    for (const [sx, sh] of stacks) {
      g.rect(sx - 5, H - sh, 10, sh, C.iron);
      const oy = (t * 16 + sx) % 32;
      c.globalAlpha = Math.max(0, 0.28 - oy / 110);
      g.circle(sx, H - sh - 8 - oy, 5 + oy * 0.35, C.steam);
      c.globalAlpha = 1;
    }
    // Ground level (workers' city)
    g.rect(0, Math.round(H * 0.52), W, H, C.deep);
    const mechY = Math.round(H * 0.7);
    for (let x = 0; x < W; x += 32) {
      g.rect(x, mechY, 22, 6, C.iron);
      g.rect(x + 11, mechY - 6, 4, 6, C.slate);
    }
    g.rect(0, Math.round(H * 0.68), W, 2, C.slate);
    // Power lines
    c.strokeStyle = C.elecD; c.lineWidth = 1; c.globalAlpha = 0.35;
    c.beginPath(); c.moveTo(0, H * 0.34);
    for (let x = 0; x <= W; x += 36) c.lineTo(x, H * 0.34 + Math.sin(x * 0.07 + t * 0.4) * 4);
    c.stroke(); c.globalAlpha = 1;
    // CRT scanlines (sci-fi film — appropriate here)
    c.fillStyle = 'rgba(0,0,0,.05)';
    for (let y = 0; y < H; y += 2) c.fillRect(0, y, W, 1);
    // Scene overlay
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(6,8,16,.70)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu' || scene === 'boot') {
      c.fillStyle = 'rgba(6,8,16,.52)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Chapter icons ─── */
  function iconMachine(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    c.strokeStyle = C.deco; c.lineWidth = 1.5;
    c.beginPath(); c.arc(cx, cy, 9, 0, Math.PI * 2); c.stroke();
    // Needle pointing up
    c.strokeStyle = C.white; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - 9); c.stroke();
    g.circle(cx, cy, 3, C.elec);
  }
  function iconDescent(api, cx, cy) {
    const g = api.gfx;
    g.rect(cx - 2, cy - 8, 4, 10, C.chrome);
    g.rect(cx - 6, cy + 2, 12, 3, C.amber);
    g.rect(cx - 4, cy + 5, 8, 3, C.amber);
    g.rect(cx - 2, cy + 8, 4, 3, C.amber);
  }
  function iconFlood(api, cx, cy) {
    const c = api.ctx;
    c.strokeStyle = C.elec; c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx - 9, cy - 2);
    c.quadraticCurveTo(cx - 4, cy - 8, cx, cy - 2);
    c.quadraticCurveTo(cx + 4, cy + 4, cx + 9, cy - 2);
    c.stroke();
    c.beginPath();
    c.moveTo(cx - 9, cy + 5);
    c.quadraticCurveTo(cx - 4, cy - 1, cx, cy + 5);
    c.quadraticCurveTo(cx + 4, cy + 11, cx + 9, cy + 5);
    c.stroke();
  }
  function iconRobot(api, cx, cy) {
    const g = api.gfx;
    g.rect(cx - 7, cy - 8, 14, 14, C.chrome);
    g.circle(cx - 3, cy - 4, 2, C.elec);
    g.circle(cx + 3, cy - 4, 2, C.elec);
    g.rect(cx - 4, cy + 2, 8, 2, C.deco);
    g.rect(cx - 4, cy - 11, 8, 3, C.iron);
  }
  function iconBell(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    g.rect(cx - 5, cy - 8, 10, 16, C.iron);
    c.strokeStyle = C.deco; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(cx - 5, cy - 8); c.lineTo(cx, cy - 14); c.lineTo(cx + 5, cy - 8); c.stroke();
    g.circle(cx, cy + 4, 3, C.amber);
  }

  /* ══════════════════════════ CHAPTER 1: THE MACHINE ══════════════════════════ */
  const chMachine = {
    id: 'machine', name: 'THE MACHINE', sub: 'Stabilise the pressure dial',
    icon: iconMachine,
    intro: [
      'Below Metropolis roars the Heart Machine —',
      'a god of steel that must never stop.',
      'Freder takes a fallen worker\'s post at the dials.',
      'Keep the pressure true. Do not let it fall.',
    ],
    quote: 'There can be no understanding between the hand and the brain unless the heart acts as mediator.',
    help: 'TAP / SPACE when the needle is in the GREEN zone',
    winText: 'The machine steadies. Freder holds his post.',
    loseText: 'The pressure collapses. The machine screams.',
    init(api) {
      this.need   = 8;    // hits needed
      this.hits   = 0;
      this.misses = 0;
      this.maxMiss = 3;
      this.m     = 0;     // needle position [0..1] (0=left, 1=right, 0.5=top=green)
      this.dir   = 1;
      this.spd   = 0.52;  // fraction/s
      this.band  = 0.14;  // green half-width
      this.cooldown = 0;
    },
    update(api, dt) {
      this.cooldown = Math.max(0, this.cooldown - dt);
      this.m += this.dir * this.spd * dt;
      if (this.m >= 1) { this.m = 1; this.dir = -1; }
      if (this.m <= 0) { this.m = 0; this.dir = 1; }
      if (this.cooldown <= 0 && api.confirm()) {
        this.cooldown = 0.20;
        if (Math.abs(this.m - 0.5) < this.band) {
          this.hits++;
          api.addScore(25);
          api.shake(3, 0.18);
          api.burst(api.W / 2, api.H * 0.62, C.decoL, 8);
          api.audio.sfx('coin');
          this.spd  = Math.min(1.05, this.spd + 0.06);
          this.band = Math.max(0.09, this.band - 0.005);
          if (this.hits >= this.need) { api.addScore(100); api.win(); }
        } else {
          this.misses++;
          api.shake(5, 0.22);
          api.flash(C.flame, 0.16);
          api.audio.sfx('hurt');
          if (this.misses >= this.maxMiss) api.lose();
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      g.clear(C.dark);
      // Brick wall
      for (let y = 0; y < H; y += 18) {
        for (let x = 0; x < W; x += 36) g.rectO(x + (y % 36 === 0 ? 0 : 18), y, 34, 16, C.iron, 1);
      }
      // Boiler glow
      c.globalAlpha = 0.08 + 0.05 * Math.sin(api.t * 3);
      c.fillStyle = C.amber; c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
      // Machine body
      const mx = W / 2, my = H * 0.38;
      g.rect(mx - 55, my - 36, 110, 72, C.iron);
      g.rect(mx - 50, my - 30, 100, 60, C.steel);
      // Spinning outer ring
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + api.t * (i % 2 ? 0.8 : -0.8);
        const gx = Math.round(mx + Math.cos(a) * 32), gy = Math.round(my + Math.sin(a) * 22);
        g.rect(gx - 3, gy - 3, 6, 6, C.slate);
      }
      g.circle(mx, my, 14, C.elecD);
      const coreColor = this.hits >= 6 ? C.decoL : this.hits >= 3 ? C.elec : C.amber;
      g.circle(mx, my, 8, coreColor);
      // Pressure dial
      const dx = W / 2, dy = H * 0.67;
      g.circle(dx, dy, 44, C.iron);
      g.circle(dx, dy, 40, C.deep);
      // Dial arc: sweeps from 9 o'clock (π) to 3 o'clock (2π) through 12 o'clock (top)
      const gA = Math.PI + (0.5 - this.band) * Math.PI;
      const gB = Math.PI + (0.5 + this.band) * Math.PI;
      // Background arc
      c.beginPath(); c.arc(dx, dy, 36, Math.PI, 2 * Math.PI);
      c.strokeStyle = C.slate; c.lineWidth = 8; c.stroke();
      // Red zones
      c.beginPath(); c.arc(dx, dy, 36, Math.PI, gA);
      c.strokeStyle = C.flame; c.lineWidth = 8; c.stroke();
      c.beginPath(); c.arc(dx, dy, 36, gB, 2 * Math.PI);
      c.strokeStyle = C.flame; c.lineWidth = 8; c.stroke();
      // Green zone
      c.beginPath(); c.arc(dx, dy, 36, gA, gB);
      c.strokeStyle = C.green; c.lineWidth = 8; c.stroke();
      // Tick marks
      c.strokeStyle = C.chrome; c.lineWidth = 1;
      for (let ti = 0; ti <= 8; ti++) {
        const ta = Math.PI + (ti / 8) * Math.PI;
        const r1 = ti % 2 === 0 ? 28 : 30;
        c.beginPath();
        c.moveTo(dx + Math.cos(ta) * r1, dy + Math.sin(ta) * r1);
        c.lineTo(dx + Math.cos(ta) * 37, dy + Math.sin(ta) * 37);
        c.stroke();
      }
      // Needle
      const nAngle = Math.PI + this.m * Math.PI;
      c.strokeStyle = C.white; c.lineWidth = 2.5;
      c.beginPath(); c.moveTo(dx, dy); c.lineTo(dx + Math.cos(nAngle) * 30, dy + Math.sin(nAngle) * 30); c.stroke();
      g.circle(dx, dy, 4, C.chrome);
      // Bezel ring
      c.strokeStyle = C.chrome; c.lineWidth = 2;
      c.beginPath(); c.arc(dx, dy, 41, 0, Math.PI * 2); c.stroke();
      // HUD
      api.topBar('THE MACHINE');
      api.txtC('PRESSURE: ' + this.hits + ' / ' + this.need, W / 2, H * 0.87, 8, C.decoL);
      const mc = this.misses >= 2 ? C.flame : C.amber;
      api.txtC('FAILURES: ' + this.misses + ' / ' + this.maxMiss, W / 2, H * 0.91, 7, mc);
      api.vignette();
    },
  };

  /* ══════════════════════════ CHAPTER 2: THE DESCENT ══════════════════════════ */
  const chDescent = {
    id: 'descent', name: 'THE DESCENT', sub: 'Fall to the workers\' city',
    icon: iconDescent,
    intro: [
      'Freder descends the great shaft to the',
      'underground city — where workers toil',
      'in endless shifts beneath the towers.',
      'Steer past the debris and reach them.',
    ],
    quote: 'The mediator between head and hands must be the heart.',
    help: 'LEFT / RIGHT (or drag) to dodge falling debris',
    winText: 'Freder reaches the workers\' level. He sees the truth.',
    loseText: 'Struck in the shaft. The descent fails.',
    init(api) {
      this.x = api.W / 2;
      this.y = api.H * 0.52;
      this.spd = 80;
      this.timer = 0;
      this.survive = 22;
      this.debris = [];
      this.spawnTimer = 0;
      this.scrollY = 0;
    },
    _spawn(api) {
      const W = api.W;
      if (Math.random() < 0.35) {
        // flame jet from side
        const left = Math.random() < 0.5;
        this.debris.push({
          kind: 'flame', x: left ? 14 : W - 14, y: rand(80, api.H - 80),
          vx: left ? rand(55, 90) : -rand(55, 90), vy: 0, w: 28, h: 10, life: 1.4,
        });
      } else {
        // falling gear or bolt
        const big = Math.random() < 0.4;
        this.debris.push({
          kind: big ? 'gear' : 'bolt', x: rand(24, W - 24), y: -18,
          vx: rand(-18, 18), vy: rand(75, 130), r: big ? 10 : 5,
          rot: 0, rotSpd: rand(-2.5, 2.5), life: 3,
        });
      }
    },
    update(api, dt) {
      this.timer += dt;
      this.scrollY += dt * 80;
      const W = api.W, H = api.H;
      // Move
      let dx = 0;
      if (api.keyDown('left'))  dx = -this.spd;
      if (api.keyDown('right')) dx =  this.spd;
      if (api.pointer.down) dx = api.pointer.x < this.x ? -this.spd : this.spd;
      this.x = clamp(this.x + dx * dt, 20, W - 20);
      // Spawn
      this.spawnTimer -= dt;
      const rate = Math.max(0.38, 1.15 - this.timer * 0.025);
      if (this.spawnTimer <= 0) {
        this.spawnTimer = rate;
        this._spawn(api);
        if (this.timer > 10) this._spawn(api);
      }
      // Update debris
      for (const d of this.debris) {
        d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt;
        if (d.rot !== undefined) d.rot += d.rotSpd * dt;
      }
      this.debris = this.debris.filter(d => d.life > 0 && d.y < H + 30);
      // Collision
      for (const d of this.debris) {
        let hit = false;
        if (d.kind === 'flame') {
          hit = this.x > d.x - d.w && this.x < d.x + d.w && Math.abs(this.y - d.y) < d.h + 6;
        } else {
          hit = Math.hypot(this.x - d.x, this.y - d.y) < d.r + 9;
        }
        if (hit) {
          api.shake(6, 0.28); api.flash(C.flame, 0.18); api.audio.sfx('hurt');
          api.lose(); return;
        }
      }
      if (this.timer >= this.survive) { api.addScore(120); api.win(); }
      api.addScore(dt * 3);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      g.clear(C.black);
      // Scrolling shaft walls
      const scroll = this.scrollY % 48;
      for (let y = -scroll; y < H; y += 48) {
        g.rect(0, y, 18, 40, C.iron);
        g.rect(18, y + 4, 3, 32, C.steel);
        g.rect(W - 18, y, 18, 40, C.iron);
        g.rect(W - 21, y + 4, 3, 32, C.steel);
      }
      g.rect(21, 0, W - 42, H, '#090b12');
      // Debris
      for (const d of this.debris) {
        if (d.kind === 'flame') {
          const fx = d.vx > 0 ? d.x : d.x - d.w;
          c.globalAlpha = 0.85;
          g.rect(Math.round(fx), Math.round(d.y - d.h / 2), d.w, d.h, C.flame);
          g.rect(Math.round(d.vx > 0 ? fx + d.w : fx - 8), Math.round(d.y - 5), 8, 10, C.amber);
          c.globalAlpha = 1;
        } else if (d.kind === 'gear') {
          c.save(); c.translate(Math.round(d.x), Math.round(d.y)); c.rotate(d.rot);
          g.circle(0, 0, d.r, C.chrome);
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            g.rect(Math.round(Math.cos(a) * d.r - 2), Math.round(Math.sin(a) * d.r - 2), 4, 4, C.slate);
          }
          g.circle(0, 0, 3, C.dark);
          c.restore();
        } else {
          g.rect(Math.round(d.x - 2), Math.round(d.y - 6), 4, 12, C.chrome);
          g.rect(Math.round(d.x - 4), Math.round(d.y - 7), 8, 4, C.silver);
        }
      }
      // Freder
      const px = Math.round(this.x), py = Math.round(this.y);
      g.rect(px - 5, py - 12, 10, 18, C.white);
      g.circle(px, py - 16, 5, '#f0d4a0');
      g.rect(px - 13, py - 9, 9, 3, C.white);
      g.rect(px + 4, py - 9, 9, 3, C.white);
      // HUD
      api.topBar('THE DESCENT');
      const pct = Math.min(1, this.timer / this.survive);
      g.rect(20, H - 14, Math.round((W - 40) * pct), 8, C.elec);
      g.rectO(20, H - 14, W - 40, 8, C.chrome, 1);
      api.txtC('DEPTH', W / 2, H - 26, 7, C.chrome);
      api.vignette();
    },
  };

  /* ══════════════════════════ CHAPTER 3: THE FLOOD ══════════════════════════ */
  const chFlood = {
    id: 'flood', name: 'THE FLOOD', sub: 'Save the children',
    icon: iconFlood,
    intro: [
      'Rotwang floods the workers\' catacombs.',
      'Maria leads the children to higher ground,',
      'but they are scattered in the dark tunnels.',
      'Find them all before the water rises!',
    ],
    quote: 'Come, children — follow me!',
    help: 'LEFT / RIGHT (or drag) to guide Maria',
    winText: 'All the children reach safety. The city breathes again.',
    loseText: 'The waters rise. Maria\'s cries go unheard.',
    init(api) {
      const W = api.W, H = api.H;
      this.mx = W / 2;
      this.my = H * 0.82;
      this.spd = 88;
      this.waterY = H + 10;
      this.riseSpd = 2.0;
      this.timer = 0;
      this.rescued = 0;
      this.total = 7;
      this.children = [];
      const xs = [28, 60, 102, 140, 178, 216, 248];
      for (let i = 0; i < this.total; i++) {
        this.children.push({ x: xs[i], y: H * 0.82 - 4, rescued: false, bob: rand(0, Math.PI * 2) });
      }
    },
    update(api, dt) {
      this.timer += dt;
      const W = api.W, H = api.H;
      // Move Maria
      let dx = 0;
      if (api.keyDown('left'))  dx = -this.spd;
      if (api.keyDown('right')) dx =  this.spd;
      if (api.pointer.down) dx = api.pointer.x < this.mx ? -this.spd : this.spd;
      this.mx = clamp(this.mx + dx * dt, 12, W - 12);
      // Collect children
      for (const ch of this.children) {
        if (!ch.rescued && Math.abs(this.mx - ch.x) < 20) {
          ch.rescued = true; this.rescued++;
          api.addScore(30);
          api.burst(ch.x, ch.y, C.elec, 6);
          api.audio.sfx('coin');
        }
      }
      // Water rises, accelerating
      this.riseSpd = Math.min(10, 2 + this.timer * 0.14);
      this.waterY -= this.riseSpd * dt;
      // Lose: water reaches Maria
      if (this.waterY <= this.my - 10) {
        api.shake(7, 0.35); api.flash(C.elec, 0.25); api.audio.sfx('hurt');
        api.lose(); return;
      }
      // Win: all rescued
      if (this.rescued >= this.total) {
        api.addScore(120); api.burst(this.mx, this.my, C.decoL, 14); api.win();
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      g.clear('#080a10');
      // Brick tunnel
      for (let y = 0; y < H; y += 14) {
        for (let x = 0; x < W; x += 28) g.rectO(x + (y % 28 === 0 ? 0 : 14), y, 26, 12, C.iron, 1);
      }
      // Floor line
      g.rect(0, Math.round(H * 0.88), W, 4, C.slate);
      // Children
      for (const ch of this.children) {
        if (!ch.rescued) {
          ch.bob += 0.06;
          const by = Math.round(ch.y + Math.sin(ch.bob) * 2);
          g.circle(Math.round(ch.x), by - 5, 4, '#f0c880');
          g.rect(Math.round(ch.x) - 3, by - 1, 7, 8, C.elec);
          // scared eyes
          g.rect(Math.round(ch.x) - 2, by - 7, 1, 2, C.dark);
          g.rect(Math.round(ch.x) + 1, by - 7, 1, 2, C.dark);
        }
      }
      // Water
      const wy = Math.round(this.waterY);
      if (wy < H) {
        c.fillStyle = C.elecD; c.globalAlpha = 0.78;
        c.fillRect(0, wy, W, H - wy);
        c.globalAlpha = 1;
        // Wave surface
        c.beginPath(); c.moveTo(0, wy);
        for (let x = 0; x <= W; x += 8) c.lineTo(x, wy - 3 + Math.sin(x * 0.1 + api.t * 3.5) * 3);
        c.lineTo(W, H); c.lineTo(0, H); c.closePath();
        c.fillStyle = C.elec; c.globalAlpha = 0.35; c.fill(); c.globalAlpha = 1;
      }
      // Maria
      const mx = Math.round(this.mx), my = Math.round(this.my);
      g.circle(mx, my - 11, 5, '#f0d0a0');
      g.rect(mx - 5, my - 6, 10, 14, C.white);
      // Rescued children follow
      for (let i = 0; i < this.rescued; i++) {
        const cx2 = mx - 16 - i * 10;
        g.circle(cx2, my - 7, 3, '#f0c880');
        g.rect(cx2 - 2, my - 4, 5, 8, C.elec);
      }
      // HUD
      api.topBar('THE FLOOD');
      const warn = this.waterY < H * 0.55;
      if (warn) {
        c.globalAlpha = 0.5 + 0.5 * Math.sin(api.t * 8);
        api.txtC('WATER RISING!', W / 2, H * 0.08, 8, C.flame);
        c.globalAlpha = 1;
      }
      api.txtC('RESCUED: ' + this.rescued + ' / ' + this.total, W / 2, H * 0.92, 8, warn ? C.flame : C.decoL);
      api.vignette();
    },
  };

  /* ══════════════════════════ CHAPTER 4: FALSE PROPHET ══════════════════════════ */
  const chRobot = {
    id: 'robot', name: 'FALSE PROPHET', sub: 'Expose Rotwang\'s creation',
    icon: iconRobot,
    intro: [
      'Rotwang\'s robot wears Maria\'s face.',
      'It dances at the Yoshiwara and stirs',
      'the workers to riot and ruin.',
      'Tap the robot to expose the deception!',
    ],
    quote: 'She is not human!',
    help: 'TAP the ROBOT (glowing) — avoid the real Maria',
    winText: 'The robot is unmasked. The workers see the truth.',
    loseText: 'The deception holds. The city descends into fire.',
    init(api) {
      const W = api.W, H = api.H;
      this.rx = W * 0.6; this.ry = H * 0.45;
      this.rDirAngle = 0; this.rDirTimer = 0;
      this.rSpd = 52;
      this.mx = W * 0.2; this.my = H * 0.6;
      this.mDirAngle = Math.PI; this.mDirTimer = 0; this.mSpd = 28;
      this.exposures = 0; this.needed = 6;
      this.cooldown = 0;
      this.timer = 0; this.tLimit = 30;
      this.wrongTaps = 0; this.wrongFlash = 0;
      this.sparks = [];
    },
    update(api, dt) {
      this.timer += dt;
      this.cooldown = Math.max(0, this.cooldown - dt);
      this.wrongFlash = Math.max(0, this.wrongFlash - dt);
      const W = api.W, H = api.H;
      // Robot wanders
      this.rDirTimer -= dt;
      if (this.rDirTimer <= 0) { this.rDirTimer = rand(0.5, 1.3); this.rDirAngle = rand(0, Math.PI * 2); }
      this.rx = clamp(this.rx + Math.cos(this.rDirAngle) * this.rSpd * dt, 24, W - 24);
      this.ry = clamp(this.ry + Math.sin(this.rDirAngle) * this.rSpd * dt, 60, H - 60);
      this.rSpd = 52 + this.timer * 1.8;
      // Real Maria wanders slowly
      this.mDirTimer -= dt;
      if (this.mDirTimer <= 0) { this.mDirTimer = rand(1.0, 2.0); this.mDirAngle = rand(0, Math.PI * 2); }
      this.mx = clamp(this.mx + Math.cos(this.mDirAngle) * this.mSpd * dt, 20, W - 20);
      this.my = clamp(this.my + Math.sin(this.mDirAngle) * this.mSpd * dt, 60, H - 60);
      // Keep real Maria away from robot
      if (Math.hypot(this.mx - this.rx, this.my - this.ry) < 40) {
        this.mx = clamp(this.mx - Math.cos(this.rDirAngle) * 40, 20, W - 20);
        this.my = clamp(this.my - Math.sin(this.rDirAngle) * 40, 60, H - 60);
      }
      // Tap detection
      if (api.pointer.justDown && this.cooldown <= 0) {
        const tx = api.pointer.x, ty = api.pointer.y;
        if (Math.hypot(tx - this.rx, ty - this.ry) < 26) {
          this.exposures++;
          this.cooldown = 0.28;
          api.addScore(40);
          api.shake(3, 0.18);
          for (let i = 0; i < 6; i++) this.sparks.push({ x: this.rx, y: this.ry, vx: rand(-2, 2), vy: rand(-3, 0), life: 0.5 });
          api.audio.sfx('shoot');
          if (this.exposures >= this.needed) { api.addScore(120); api.win(); }
        } else if (Math.hypot(tx - this.mx, ty - this.my) < 20) {
          this.wrongTaps++; this.wrongFlash = 1.0;
          api.flash('#ff2266', 0.18); api.audio.sfx('hurt');
          if (this.wrongTaps >= 3) { api.lose(); return; }
        }
      }
      if (this.timer >= this.tLimit) { api.lose(); return; }
      for (const s of this.sparks) { s.x += s.vx; s.y += s.vy + 0.1; s.life -= dt; }
      this.sparks = this.sparks.filter(s => s.life > 0);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      g.clear(C.dark);
      // Cabaret background
      const bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#08050e'); bg.addColorStop(1, '#140810');
      c.fillStyle = bg; c.fillRect(0, 0, W, H);
      // Stage lights
      for (let i = 0; i < 4; i++) {
        const lx = 28 + i * 62;
        c.globalAlpha = 0.06 + 0.03 * Math.sin(api.t * 2 + i);
        c.fillStyle = i % 2 === 0 ? C.amber : C.elec;
        c.beginPath(); c.moveTo(lx, 0); c.lineTo(lx - 22, H * 0.55); c.lineTo(lx + 22, H * 0.55); c.closePath(); c.fill();
      }
      c.globalAlpha = 1;
      // Floor
      g.rect(0, H - 28, W, 28, C.iron);
      for (let x = 0; x < W; x += 22) g.rect(x, H - 28, 20, 26, C.steel);
      // Crowd silhouettes
      for (let i = 0; i < 8; i++) {
        const wx = 10 + i * 32, wy = H - 54;
        g.rect(wx - 4, wy, 8, 22, C.worker);
        g.circle(wx, wy - 5, 5, '#40302a');
      }
      // Real Maria (white dress)
      const mxr = Math.round(this.mx), myr = Math.round(this.my);
      g.rect(mxr - 6, myr - 1, 12, 18, C.white);
      g.circle(mxr, myr - 8, 6, '#f0d0a0');
      api.txtC('MARIA', mxr, myr - 20, 6, '#88ffaa');
      if (this.wrongFlash > 0) { c.globalAlpha = Math.min(1, this.wrongFlash); api.txtC('WRONG!', mxr, myr - 32, 8, '#ff2266'); c.globalAlpha = 1; }
      // Robot Maria (metal with glowing eyes)
      const rxr = Math.round(this.rx), ryr = Math.round(this.ry);
      g.rect(rxr - 7, ryr - 2, 14, 20, C.chrome);
      g.circle(rxr, ryr - 10, 8, C.silver);
      g.rect(rxr - 5, ryr + 4, 4, 8, C.elecD);
      g.rect(rxr + 1, ryr + 4, 4, 8, C.elecD);
      g.rect(rxr - 5, ryr + 8, 10, 2, C.elecD);
      g.circle(rxr - 3, ryr - 11, 2, C.elec);
      g.circle(rxr + 3, ryr - 11, 2, C.elec);
      c.globalAlpha = 0.12 + 0.08 * Math.sin(api.t * 7);
      c.fillStyle = C.elec; c.beginPath(); c.arc(rxr, ryr, 24, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      // Sparks
      for (const s of this.sparks) {
        c.globalAlpha = s.life * 2;
        g.rect(Math.round(s.x), Math.round(s.y), 2, 2, C.spark);
      }
      c.globalAlpha = 1;
      // HUD
      api.topBar('FALSE PROPHET');
      api.txtC('EXPOSED: ' + this.exposures + ' / ' + this.needed, W / 2, H * 0.07, 9, C.decoL);
      const tLeft = Math.max(0, Math.ceil(this.tLimit - this.timer));
      api.txtC('TIME: ' + tLeft, W / 2, H * 0.12, 8, tLeft < 8 ? C.flame : C.chrome);
      if (this.wrongTaps > 0) api.txtC('STRIKES: ' + this.wrongTaps + '/3', W / 2, H * 0.17, 7, C.amber);
      api.vignette();
    },
  };

  /* ══════════════════════════ CHAPTER 5: THE CATHEDRAL ══════════════════════════ */
  const chCathedral = {
    id: 'cathedral', name: 'THE CATHEDRAL', sub: 'Ring the great bell',
    icon: iconBell,
    intro: [
      'The workers riot across Metropolis.',
      'Freder chases Rotwang up the cathedral.',
      'At the peak, the great bell waits —',
      'ring it, and the city will hear reason.',
    ],
    quote: 'Freder! You will not see morning!',
    help: 'LEFT / RIGHT to move · TAP or UP to jump',
    winText: 'The great bell rings over Metropolis. The city is saved.',
    loseText: 'Freder falls. The bell is silenced.',
    init(api) {
      const W = api.W, H = api.H;
      this.px = W / 2;
      this.py = H * 0.88;
      this.vx = 0; this.vy = 0;
      this.onGround = false;
      this.spd = 92;
      this.jumpVy = -240;
      this.grav = 310;
      this.timer = 0;
      this.stones = [];
      this.stoneTimer = 1.5;
      // Platforms: [x, y, w]
      this.platforms = [
        [W / 2 - 36, H * 0.88, 72],   // ground
        [W * 0.08, H * 0.76, 70],      // far left
        [W * 0.52, H * 0.66, 70],      // right
        [W * 0.10, H * 0.56, 70],      // left
        [W * 0.52, H * 0.46, 70],      // right (Rotwang)
        [W * 0.08, H * 0.36, 70],      // far left
        [W * 0.52, H * 0.26, 70],      // right
        [W * 0.20, H * 0.16, 70],      // left
        [W * 0.35, H * 0.07, 72],      // bell platform (top)
      ];
      // Rotwang patrols the 5th platform
      const rp = this.platforms[4];
      this.rotwang = { x: rp[0] + 35, y: rp[1], vx: 45, patrolMin: rp[0] + 10, patrolMax: rp[0] + rp[2] - 10 };
      this.bellRung = false;
    },
    update(api, dt) {
      this.timer += dt;
      const W = api.W, H = api.H;
      // Horizontal input
      let dx = 0;
      if (api.keyDown('left'))  dx = -this.spd;
      if (api.keyDown('right')) dx =  this.spd;
      if (api.pointer.down) dx = api.pointer.x < W / 2 ? -this.spd : this.spd;
      this.px = clamp(this.px + dx * dt, 12, W - 12);
      // Jump
      if (this.onGround && (api.keyPressed('up') || api.keyPressed('a') || api.pointer.justDown)) {
        this.vy = this.jumpVy;
        api.audio.sfx('jump');
      }
      // Gravity
      this.vy += this.grav * dt;
      this.py += this.vy * dt;
      // Platform collision
      this.onGround = false;
      for (const [plx, ply, plw] of this.platforms) {
        if (this.px >= plx && this.px <= plx + plw && this.py >= ply - 4 && this.py <= ply + 10 && this.vy >= 0) {
          this.py = ply; this.vy = 0; this.onGround = true; break;
        }
      }
      // Falling off bottom = lose
      if (this.py > H + 20) { api.shake(7, 0.3); api.audio.sfx('hurt'); api.lose(); return; }
      // Stone spawner
      this.stoneTimer -= dt;
      if (this.stoneTimer <= 0) {
        this.stoneTimer = Math.max(0.5, 1.6 - this.timer * 0.03);
        this.stones.push({ x: rand(16, W - 16), y: -12, vy: rand(65, 110), life: 3 });
      }
      // Update stones
      for (const s of this.stones) { s.y += s.vy * dt; s.life -= dt; }
      this.stones = this.stones.filter(s => s.life > 0);
      // Stone collision
      for (const s of this.stones) {
        if (Math.hypot(this.px - s.x, this.py - s.y) < 14) {
          api.shake(5, 0.22); api.flash(C.slate, 0.18); api.audio.sfx('hurt');
          api.lose(); return;
        }
      }
      // Rotwang patrol
      this.rotwang.x += this.rotwang.vx * dt;
      if (this.rotwang.x < this.rotwang.patrolMin || this.rotwang.x > this.rotwang.patrolMax) this.rotwang.vx *= -1;
      // Rotwang collision
      if (Math.hypot(this.px - this.rotwang.x, this.py - this.rotwang.y) < 18) {
        api.shake(6, 0.25); api.flash(C.elec, 0.2); api.audio.sfx('hurt');
        api.lose(); return;
      }
      // Win: land on bell platform
      const bell = this.platforms[this.platforms.length - 1];
      if (this.onGround && this.px >= bell[0] && this.px <= bell[0] + bell[2] && Math.abs(this.py - bell[1]) < 5) {
        api.addScore(150);
        api.burst(this.px, this.py - 20, C.decoL, 16);
        api.flash(C.amber, 0.5);
        api.audio.sfx('power');
        api.win();
      }
      api.addScore(dt * 2);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      g.clear('#040608');
      // Night sky
      for (let i = 0; i < 18; i++) {
        const sx = (i * 59 + 7) % W, sy = (i * 43 + 3) % Math.floor(H * 0.55);
        c.globalAlpha = 0.25 + 0.15 * Math.sin(api.t * 3 + i);
        g.rect(sx, sy, 1, 1, C.white);
      }
      c.globalAlpha = 1;
      // Cathedral body
      c.fillStyle = '#0a0c14';
      c.beginPath();
      c.moveTo(W * 0.5, 0); c.lineTo(W * 0.18, H * 0.35); c.lineTo(W * 0.12, H);
      c.lineTo(W * 0.88, H); c.lineTo(W * 0.82, H * 0.35); c.closePath(); c.fill();
      // Gothic windows
      for (let wy = H * 0.12; wy < H * 0.82; wy += 44) {
        c.globalAlpha = 0.25 + 0.12 * Math.sin(api.t * 1.5 + wy * 0.01);
        c.fillStyle = C.amber;
        const wbase = W * 0.5 - (wy / H) * W * 0.28;
        const wwide = (wy / H) * W * 0.56 + W * 0.08;
        c.fillRect(Math.round(wbase + wwide * 0.28), Math.round(wy), 7, 16);
        c.fillRect(Math.round(wbase + wwide * 0.64), Math.round(wy), 7, 16);
        c.globalAlpha = 1;
      }
      // Platforms
      for (let i = 0; i < this.platforms.length; i++) {
        const [plx, ply, plw] = this.platforms[i];
        const isBell = i === this.platforms.length - 1;
        g.rect(Math.round(plx), Math.round(ply), plw, 7, isBell ? C.deco : C.iron);
        g.rect(Math.round(plx), Math.round(ply), plw, 2, isBell ? C.decoL : C.chrome);
        if (isBell) {
          // Bell icon
          const bx = Math.round(plx + plw / 2);
          g.rect(bx - 8, Math.round(ply) - 18, 16, 16, C.deco);
          g.rect(bx - 8, Math.round(ply) - 20, 16, 5, C.iron);
          g.circle(bx, Math.round(ply) - 3, 3, C.amber);
        }
      }
      // Rotwang
      const rw = this.rotwang;
      g.rect(Math.round(rw.x - 6), Math.round(rw.y - 20), 12, 20, C.iron);
      g.circle(Math.round(rw.x), Math.round(rw.y - 24), 6, '#1a1010');
      g.circle(Math.round(rw.x) + (rw.vx > 0 ? 5 : -5), Math.round(rw.y - 13), 4, C.elec);
      // Stones
      for (const s of this.stones) g.circle(Math.round(s.x), Math.round(s.y), 5, C.slate);
      // Freder
      const px = Math.round(this.px), py = Math.round(this.py);
      g.rect(px - 5, py - 15, 10, 15, C.white);
      g.circle(px, py - 19, 5, '#f0d0a0');
      if (!this.onGround) {
        g.rect(px - 13, py - 12, 10, 3, C.white);
        g.rect(px + 3, py - 12, 10, 3, C.white);
      }
      // HUD
      api.topBar('THE CATHEDRAL');
      // Altitude bar (right edge)
      const bell = this.platforms[this.platforms.length - 1];
      const startY = this.platforms[0][1];
      const pct = clamp(1 - (this.py - bell[1]) / (startY - bell[1]), 0, 1);
      g.rect(W - 14, 22, 8, H - 44, C.deep);
      g.rect(W - 14, Math.round(22 + (H - 44) * (1 - pct)), 8, Math.round((H - 44) * pct), C.elec);
      g.rectO(W - 14, 22, 8, H - 44, C.chrome, 1);
      api.txtC('UP', W - 10, 24, 6, C.decoL, true);
      api.vignette();
    },
  };

  /* ══════════════════════════ MENU BLOCK ══════════════════════════ */
  const menu = {
    colors: {
      panel: 'rgba(12,16,26,.88)', panelSel: 'rgba(22,30,50,.96)',
      border: C.chrome, name: C.silver, nameDone: C.decoL,
      sub: C.chrome, title: C.deco, label: C.steam, cur: C.decoL, hint: C.chrome,
    },
    title(api, gears) {
      const W = api.W;
      api.txtCFit('HEART MACHINE', W / 2, 20, 15, C.deco, true);
      api.txtCFit('THE WORKERS\' CITY', W / 2, 46, 8, C.elec, false);
      api.txtC('GEARS  ' + gears, W / 2, 68, 8, C.decoL);
      // Separator bar
      const c = api.ctx;
      c.strokeStyle = C.slate; c.lineWidth = 1;
      c.beginPath(); c.moveTo(12, 84); c.lineTo(W - 12, 84); c.stroke();
    },
    // 3+2 staggered grid — control panel layout
    layout(api) {
      const y1 = 92, y2 = 166, w = 74, h = 66;
      return [
        { x: 10,  y: y1, w, h },
        { x: 98,  y: y1, w, h },
        { x: 186, y: y1, w, h },
        { x: 54,  y: y2, w, h },
        { x: 142, y: y2, w, h },
      ];
    },
    card(api, { ch, i, x, y, w, h, sel, done, best }) {
      const g = api.gfx, c = api.ctx;
      // Metal panel
      c.fillStyle = sel ? 'rgba(28,40,64,.96)' : 'rgba(14,18,28,.90)';
      c.fillRect(x, y, w, h);
      c.strokeStyle = sel ? C.elec : (done ? C.deco : C.chrome);
      c.lineWidth = sel ? 2 : 1;
      c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      // Corner rivets
      for (const [rx, ry] of [[x+3,y+3],[x+w-4,y+3],[x+3,y+h-4],[x+w-4,y+h-4]]) {
        g.circle(rx, ry, 2, sel ? C.decoL : C.chrome);
      }
      // Selection glow
      if (sel) {
        c.globalAlpha = 0.16; c.fillStyle = C.elec; c.fillRect(x + 2, y + 2, w - 4, h - 4); c.globalAlpha = 1;
      }
      // Chapter icon (upper center)
      if (ch.icon) ch.icon(api, x + w / 2, y + 24);
      // Number
      c.fillStyle = done ? C.deco : (sel ? C.elec : C.chrome);
      c.font = "7px 'Press Start 2P'"; c.textAlign = 'left'; c.textBaseline = 'top';
      c.fillText('' + (i + 1), x + 5, y + 5);
      // Name
      api.txtCFit(ch.name, x + w / 2, y + h - 22, 6, done ? C.decoL : C.silver, true, w - 8);
      // Done check
      if (done) {
        c.fillStyle = C.decoL; c.font = "8px 'Press Start 2P'"; c.textAlign = 'center';
        c.fillText('✓', x + w - 7, y + 5);
      }
    },
  };

  /* ══════════════════════════ SAGA DEFINITION ══════════════════════════ */
  RetroSaga.create({
    id:       'metropolis-1927',
    title:    'HEART MACHINE',
    subtitle: 'THE WORKERS\' CITY',
    accent:   C.elec,
    credit:   'After Fritz Lang\'s 1927 METROPOLIS',
    bootCta:  'TAP TO DESCEND',
    bootLine: 'FIVE CHAPTERS IN THE CITY OF THE FUTURE',
    currency: 'GEARS',
    menuLabel: 'CHOOSE YOUR CHAPTER',
    menuHint:  'TAP A PANEL TO ENGAGE',
    menuDone:  'ALL CHAPTERS CLEARED',
    palette: {
      ink: C.black, dark: C.deep, panel: C.iron, gold: C.deco,
      cream: C.silver, dim: C.chrome, blood: C.flame, white: C.white,
      shadow: 'rgba(0,0,0,.68)',
    },
    screens: {
      win:          C.decoL,
      lose:         C.flame,
      chapterLabel: C.chrome,
      name:         C.deco,
      sub:          C.elec,
      intro:        C.silver,
      quote:        C.chrome,
      help:         C.decoL,
      score:        C.silver,
      cur:          C.decoL,
      cta:          C.elec,
      overlay:      'rgba(6,8,16,.78)',
    },
    labels: {
      chapter: 'LEVEL',
      score:   'GEARS EARNED',
      win:     'SYSTEM STABLE',
      lose:    'CRITICAL FAILURE',
      cont:    'TAP TO CONTINUE',
      finale:  'TAP FOR FINALE',
      toMenu:  'TAP TO RETURN',
      play:    'ENGAGE',
    },
    emblem,
    scenery,
    menu,
    chapters: [chMachine, chDescent, chFlood, chRobot, chCathedral],
    finale: ['The mediator has come.', 'The Heart beats on.', 'Metropolis lives.'],
  });

})();
