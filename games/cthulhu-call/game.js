/* ============================================================================
 * THE CALL — Five Fragments of Lovecraftian Horror
 * Adapted from "The Call of Cthulhu" by H. P. Lovecraft (1926)
 *
 *  I.   THE IDOL           — tap the true Cthulhu glyph before sanity breaks
 *  II.  THE BAYOU CULT     — weave through cultists' torchlight in the swamp
 *  III. VOYAGE TO R'LYEH   — steer the yacht through storm debris and tentacles
 *  IV.  THE SUNKEN CITY    — collect runes in non-Euclidean corridors
 *  V.   THE GREAT OLD ONE  — face Cthulhu; ram the eye before time is up
 *
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp  = Retro.util.clamp;
  const rand   = Retro.util.rand;
  const randI  = Retro.util.randInt;

  /* ── PALETTE ────────────────────────────────────────────────────────────── */
  const C = {
    void_:  '#050810',
    abyss:  '#060c1a',
    deep:   '#0a1428',
    ink:    '#02040a',
    green:  '#00cc55',
    greenL: '#22ff77',
    greenD: '#004422',
    teal:   '#004455',
    tealL:  '#00aabb',
    purple: '#220044',
    purpleL:'#6600cc',
    bone:   '#c0d4e0',
    mist:   '#4a6a80',
    gold:   '#cc9922',
    red:    '#cc2233',
    fog:    '#1a2a3a',
  };

  /* ── EMBLEM — Cthulhu silhouette rising from the sea ────────────────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Glow behind
    c.globalAlpha = 0.18 + 0.08 * Math.sin(api.t * 0.7);
    const grd = c.createRadialGradient(cx, cy - 10, 4, cx, cy - 10, 46);
    grd.addColorStop(0, C.greenL); grd.addColorStop(1, 'transparent');
    c.fillStyle = grd; c.fillRect(cx - 50, cy - 60, 100, 100);
    c.globalAlpha = 1;
    // Wings
    g.rect(cx - 34, cy - 18, 16, 10, C.greenD);
    g.rect(cx - 42, cy - 12, 10, 14, C.greenD);
    g.rect(cx + 18, cy - 18, 16, 10, C.greenD);
    g.rect(cx + 32, cy - 12, 10, 14, C.greenD);
    // Body
    g.rect(cx - 14, cy - 22, 28, 24, C.greenD);
    // Head
    g.rect(cx - 10, cy - 38, 20, 18, C.greenD);
    // Tentacles (head)
    g.rect(cx - 14, cy - 32, 5, 14, C.greenD);
    g.rect(cx + 9,  cy - 32, 5, 14, C.greenD);
    g.rect(cx - 18, cy - 26, 5, 10, C.greenD);
    g.rect(cx + 13, cy - 26, 5, 10, C.greenD);
    g.rect(cx - 6,  cy - 18, 4, 8,  C.greenD);
    g.rect(cx + 2,  cy - 18, 4, 8,  C.greenD);
    // Eyes (glowing)
    const eyeBright = 0.7 + 0.3 * Math.sin(api.t * 1.4);
    c.globalAlpha = eyeBright;
    g.rect(cx - 6, cy - 34, 4, 4, C.greenL);
    g.rect(cx + 2, cy - 34, 4, 4, C.greenL);
    c.globalAlpha = 1;
    // Ocean waves at base
    g.rect(cx - 28, cy + 2,  56, 3, C.teal);
    g.rect(cx - 32, cy + 6,  64, 3, '#003344');
  }

  /* ── SCENERY ─────────────────────────────────────────────────────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Dark ocean chart — graph-paper grid over void
      c.fillStyle = '#040a14';
      c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(0,180,80,0.07)';
      c.lineWidth = 1;
      for (let x = 0; x < W; x += 18) { c.beginPath(); c.moveTo(x,0); c.lineTo(x,H); c.stroke(); }
      for (let y = 0; y < H; y += 18) { c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); }
      // Eldritch nebula glow
      c.globalAlpha = 0.05 + 0.03 * Math.sin(t * 0.4);
      const grd = c.createRadialGradient(W * 0.65, H * 0.5, 0, W * 0.65, H * 0.5, 110);
      grd.addColorStop(0, C.green); grd.addColorStop(1, 'transparent');
      c.fillStyle = grd; c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
      return;
    }

    // All other scenes: void sky + ocean surface
    const sky = c.createLinearGradient(0, 0, 0, H * 0.62);
    sky.addColorStop(0, '#01020a');
    sky.addColorStop(0.6, '#050c18');
    sky.addColorStop(1,   '#0a1428');
    c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.62);

    // Stars — faint, many
    for (let i = 0; i < 56; i++) {
      const sx = ((i * 73 + 17) % (W - 6)) + 3;
      const sy = ((i * 47 + 9)  % Math.floor(H * 0.58)) + 2;
      const bright = i % 8 === 0
        ? 0.85 + 0.15 * Math.sin(t * 1.1 + i)
        : 0.15 + 0.18 * Math.sin(t * 1.4 + i);
      c.globalAlpha = bright;
      g.rect(sx, sy, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1, C.bone);
    }
    c.globalAlpha = 1;

    // The star Xoth (R'lyeh's star) — a sickly green point
    c.globalAlpha = 0.55 + 0.3 * Math.sin(t * 0.9);
    g.rect(Math.floor(W * 0.72), Math.floor(H * 0.07), 3, 3, C.greenL);
    c.globalAlpha = 1;

    // Ocean surface
    const sea = c.createLinearGradient(0, H * 0.60, 0, H);
    sea.addColorStop(0, '#0a1428');
    sea.addColorStop(0.5, '#050c1a');
    sea.addColorStop(1, '#020408');
    c.fillStyle = sea; c.fillRect(0, H * 0.60, W, H * 0.40);

    // Wave flickers
    for (let w = 0; w < 6; w++) {
      const wx = ((t * 14 + w * 43) % W + W) % W;
      c.globalAlpha = 0.22;
      g.rect(wx, Math.floor(H * 0.60), 22, 1, C.tealL);
    }
    c.globalAlpha = 1;
  }

  /* ── MENU LAYOUT — scattered field-note pages on a dark chart ───────────── */
  const MENU_RECTS = [
    { x: 12,  y: 96,  w: 148, h: 54 },  // I  — left
    { x: 110, y: 155, w: 148, h: 54 },  // II — right
    { x: 12,  y: 214, w: 148, h: 54 },  // III— left
    { x: 110, y: 273, w: 148, h: 54 },  // IV — right
    { x: 50,  y: 332, w: 170, h: 54 },  // V  — wider, centered
  ];

  const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

  const menu = {
    title(api, respect) {
      const W = api.W, c = api.ctx;
      // Compass-rose decoration (top)
      c.strokeStyle = C.teal; c.lineWidth = 1;
      c.beginPath(); c.moveTo(20,82); c.lineTo(W-20,82); c.stroke();
      // Title
      api.txtCFit('THE CALL', W/2, 16, 20, C.greenL, true);
      api.txtCFit('FIVE ACCOUNTS OF COSMIC DREAD', W/2, 44, 6, C.mist);
      api.txtC('SANITY  ' + respect, W/2, 64, 8, C.green);
    },
    layout(api, chapters) { return MENU_RECTS.map(r => Object.assign({}, r)); },
    card(api, info) {
      const { ch, i, x, y, w, h, sel, done, best } = info;
      const g = api.gfx, c = api.ctx;
      // Aged field-note paper
      const bg = done ? '#091a10' : (sel ? '#0c1e18' : '#070f14');
      g.rect(x, y, w, h, bg);
      const border = sel ? C.greenL : (done ? C.green : C.teal);
      g.rectO(x, y, w, h, border, 1);
      if (sel) { c.globalAlpha = 0.15; g.rect(x+1,y+1,w-2,h-2,C.greenL); c.globalAlpha = 1; }
      // Fragment label (top left)
      api.txt('FRAGMENT ' + ROMAN[i], x + 7, y + 7, 6, done ? C.green : C.mist);
      // Icon (right side)
      if (ch.icon) ch.icon(api, x + w - 18, y + h/2);
      // Name
      api.txtCFit(ch.name, x + (w - 22)/2 + 7, y + 22, 9, sel ? C.bone : C.greenL, true, w - 30);
      // Sub
      api.txt(ch.sub || '', x + 7, y + 38, 6, C.mist);
      // Best score or arrow
      if (done) api.txt('✓ ' + best, x + w - 44, y + 38, 6, C.green);
      else       api.txt(sel ? '▶ DARE' : '○', x + w - (sel ? 38 : 14), y + 38, 6, sel ? C.greenL : C.teal);
    },
  };

  /* ── CHAPTER ICONS ───────────────────────────────────────────────────────── */
  function iconIdol(api, x, y) {
    const g = api.gfx;
    g.rect(x-5,y-9,10,12,C.mist);
    g.rect(x-3,y-13,6,5,C.mist);
    g.rect(x-7,y-2,3,6,C.teal);
    g.rect(x+4,y-2,3,6,C.teal);
    g.rect(x-2,y-11,1,1,C.greenL);
    g.rect(x+1,y-11,1,1,C.greenL);
  }
  function iconTorch(api, x, y) {
    const g = api.gfx, c = api.ctx;
    g.rect(x-1,y-5,2,8,C.gold);
    c.globalAlpha = 0.7 + 0.3*Math.sin(api.t*3);
    g.rect(x-3,y-10,6,6,'#ff8800');
    c.globalAlpha = 1;
  }
  function iconShip(api, x, y) {
    const g = api.gfx;
    g.rect(x-7,y+1,14,5,C.bone);
    g.rect(x-5,y+3,10,3,C.mist);
    g.rect(x-1,y-10,2,12,'#8a7060');
    g.rect(x-1,y-10,6,6,C.bone);
  }
  function iconGlyph(api, x, y) {
    const g = api.gfx;
    g.rect(x-6,y-6,12,12,C.teal);
    g.rect(x-4,y-4,8,8,C.void_);
    g.rect(x-2,y-2,4,4,C.greenL);
  }
  function iconEye(api, x, y) {
    const g = api.gfx, c = api.ctx;
    g.rect(x-7,y-3,14,6,C.greenD);
    c.globalAlpha = 0.7+0.3*Math.sin(api.t*1.4);
    g.rect(x-3,y-3,6,6,C.greenL);
    c.globalAlpha = 1;
    g.rect(x-2,y-2,4,4,C.void_);
  }

  /* ======================================================================
   *  CHAPTER  I — THE IDOL
   *  Tap the true Cthulhu glyph (one marked '✦') among 9 tiles
   *  10 rounds · 3.5s each · 3 misses = lose
   * ====================================================================== */
  const CH1 = {
    id: 'idol', name: 'THE IDOL', sub: 'DECODE THE GLYPHS',
    icon: iconIdol,
    intro: [
      'PROFESSOR ANGELL\'S NOTES',
      'ARRIVE BY POST.',
      'A CLAY IDOL — OLD AS STARS.',
      'FIND THE TRUE GLYPH',
      'BEFORE YOUR MIND BREAKS.',
    ],
    quote: 'The bas-relief was a rough rectangle of perhaps an inch thick and about five by six inches in area.',
    help: 'TAP the correct glyph ✦ each round',
    winText: 'The symbol burns into your memory. The cult is real.',
    loseText: 'The meaning slips away into nightmare.',
    init(api) {
      this.round   = 0;
      this.misses  = 0;
      this.roundT  = 0;
      this.correct = 0;
      this.tiles   = [];
      this.flash   = -1;
      this.flashC  = '';
      this.flashT  = 0;
      this.done    = false;
      this._nextRound(api);
    },
    _nextRound(api) {
      const W = api.W, H = api.H;
      this.round++;
      this.roundT = 3.5;
      this.correct = randI(0, 8);
      // 9 tiles in 3x3
      const SYMS = ['✶','◆','▲','⬟','✕','◉','⌘','⊛','✦'];
      // shuffle decoy symbols (all but '✦')
      const decoys = ['✶','◆','▲','⬟','✕','◉','⌘','⊛','◌','⬡','⊕','⌬','✧','❖','⋄'];
      this.tiles = [];
      const tW = 68, tH = 56, gapX = 18, gapY = 8;
      const startX = Math.floor((W - 3*tW - 2*gapX) / 2);
      const startY = 100;
      for (let r = 0; r < 3; r++) {
        for (let col = 0; col < 3; col++) {
          const idx = r * 3 + col;
          const sym = idx === this.correct ? '✦' : decoys[randI(0, decoys.length-1)];
          this.tiles.push({
            x: startX + col * (tW + gapX),
            y: startY + r * (tH + gapY),
            w: tW, h: tH, sym,
          });
        }
      }
      this.flash = -1;
    },
    update(api, dt) {
      if (this.done) return;
      this.roundT -= dt;
      if (this.flashT > 0) {
        this.flashT -= dt;
        if (this.flashT <= 0) this.flash = -1;
      }
      // Timer expired — miss
      if (this.roundT <= 0 && this.flash < 0) {
        this.misses++;
        this.flash  = this.correct;
        this.flashC = C.red;
        this.flashT = 0.5;
        api.audio.sfx('hurt');
        api.shake(3, 0.25);
        if (this.misses >= 3) { this.done = true; api.lose(); return; }
        if (this.round >= 10) { api.addScore(40); this.done = true; api.win(); return; }
        this._nextRound(api);
      }
      // Tap detection
      const p = api.pointer;
      if (p.justDown) {
        for (let i = 0; i < this.tiles.length; i++) {
          const t = this.tiles[i];
          if (p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h) {
            if (i === this.correct) {
              // Correct
              api.addScore(100);
              this.flash  = i;
              this.flashC = C.greenL;
              this.flashT = 0.4;
              api.burst(t.x + t.w/2, t.y + t.h/2, C.greenL, 8);
              api.audio.sfx('coin');
              if (this.round >= 10) { this.done = true; api.win(); return; }
              this._nextRound(api);
            } else {
              this.misses++;
              this.flash  = i;
              this.flashC = C.red;
              this.flashT = 0.4;
              api.shake(3, 0.2);
              api.audio.sfx('hurt');
              if (this.misses >= 3) { this.done = true; api.lose(); return; }
            }
            break;
          }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      // Background
      c.fillStyle = C.abyss; c.fillRect(0,0,W,H);
      // Grid lines (faint)
      c.strokeStyle = 'rgba(0,100,60,0.1)'; c.lineWidth = 1;
      for (let x = 0; x < W; x += 18) { c.beginPath(); c.moveTo(x,0); c.lineTo(x,H); c.stroke(); }
      for (let y = 0; y < H; y += 18) { c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); }

      // Top bar
      api.topBar('FRAGMENT I · THE IDOL');
      api.txt('MISS: ' + this.misses + '/3', W - 72, 4, 8, this.misses > 1 ? C.red : C.mist);
      // Round progress
      api.txtC('ROUND ' + this.round + ' / 10', W/2, 24, 8, C.mist);
      // Timer bar
      const barW = W - 40;
      const fill = Math.max(0, this.roundT / 3.5) * barW;
      g.rect(20, 44, barW, 6, C.teal);
      g.rect(20, 44, Math.floor(fill), 6, this.roundT < 1 ? C.red : C.green);
      // Find the glyph label
      api.txtCFit('FIND THE MARK  ✦', W/2, 74, 10, C.bone, false);
      // Tiles
      for (let i = 0; i < this.tiles.length; i++) {
        const t = this.tiles[i];
        const isFlash = (i === this.flash);
        const bg = isFlash ? this.flashC : (i === this.correct && this.roundT < 0.5 ? 'rgba(0,200,80,.2)' : 'rgba(8,20,30,.9)');
        g.rect(t.x, t.y, t.w, t.h, bg);
        g.rectO(t.x, t.y, t.w, t.h, isFlash ? this.flashC : C.teal, 1);
        const textColor = isFlash ? C.void_ : (i === this.correct ? C.greenL : C.bone);
        api.txtC(t.sym, t.x + t.w/2, t.y + t.h/2 - 10, 22, textColor, false);
      }
      api.vignette(); api.scanlines();
    },
  };

  /* ======================================================================
   *  CHAPTER  II — THE BAYOU CULT
   *  Drag player away from cultists' torch halos · survive 22s
   * ====================================================================== */
  const CH2 = {
    id: 'bayou', name: 'THE BAYOU CULT', sub: 'AVOID THE TORCHLIGHT',
    icon: iconTorch,
    intro: [
      'INSPECTOR LEGRASSE RAIDS',
      'THE LOUISIANA SWAMP CULT.',
      'YOU MUST CREEP THROUGH',
      'WITHOUT ENTERING',
      'THE TORCHLIGHT.',
    ],
    quote: 'The worshippers moved in a circle around the monolith, singing in a guttural chant.',
    help: 'DRAG to move · stay out of torch glow',
    winText: 'You slip into the reeds. The chanting fades.',
    loseText: 'The torchlight finds you. The circle closes.',
    init(api) {
      this.px     = api.W / 2;
      this.py     = api.H * 0.75;
      this.sanity = 3;
      this.timer  = 22;
      this.cults  = [];
      this.sanT   = 0;
      this.invT   = 0;
      this.done   = false;
      // Spawn cultists
      const W = api.W, H = api.H;
      const paths = [
        {ax:40,ay:160,bx:230,by:160,sp:34},
        {ax:135,ay:90, bx:135,by:320,sp:30},
        {ax:30, ay:260,bx:200,by:130,sp:28},
        {ax:220,ay:80, bx:50, by:300,sp:32},
        {ax:80, ay:200,bx:190,by:200,sp:36},
      ];
      paths.forEach((p,i) => {
        const t0 = i * 0.37;
        const frac0 = (Math.sin(t0) + 1) / 2;
        this.cults.push({
          ax:p.ax, ay:p.ay, bx:p.bx, by:p.by, sp:p.sp, t:t0, r:40+i*3,
          x: p.ax + (p.bx - p.ax) * frac0,
          y: p.ay + (p.by - p.ay) * frac0,
        });
      });
    },
    update(api, dt) {
      if (this.done) return;
      this.timer -= dt;
      if (this.timer <= 0) { api.addScore(120); api.win(); this.done = true; return; }
      if (this.invT > 0) this.invT -= dt;

      // Move player (pointer drag or arrow keys)
      const p = api.pointer;
      if (p.down) {
        this.px += (p.x - this.px) * 0.22;
        this.py += (p.y - this.py) * 0.22;
      }
      const spd = 2.2;
      if (api.keyDown('left'))  this.px = clamp(this.px - spd*dt*60, 12, api.W-12);
      if (api.keyDown('right')) this.px = clamp(this.px + spd*dt*60, 12, api.W-12);
      if (api.keyDown('up'))    this.py = clamp(this.py - spd*dt*60, 30, api.H-20);
      if (api.keyDown('down'))  this.py = clamp(this.py + spd*dt*60, 30, api.H-20);
      this.px = clamp(this.px, 12, api.W - 12);
      this.py = clamp(this.py, 30, api.H - 20);

      // Update cultists
      this.cults.forEach(cu => {
        cu.t += dt * cu.sp / 200;
        const frac = (Math.sin(cu.t) + 1) / 2;
        cu.x = cu.ax + (cu.bx - cu.ax) * frac;
        cu.y = cu.ay + (cu.by - cu.ay) * frac;
      });

      // Sanity drain when inside a torch halo
      if (this.invT <= 0) {
        let caught = false;
        this.cults.forEach(cu => {
          const dx = this.px - cu.x, dy = this.py - cu.y;
          if (dx*dx + dy*dy < cu.r*cu.r) caught = true;
        });
        if (caught) {
          this.sanT += dt;
          if (this.sanT >= 1.4) {
            this.sanT = 0;
            this.sanity--;
            api.shake(4, 0.3);
            api.flash('rgba(255,180,0,.35)', 0.3);
            api.audio.sfx('hurt');
            if (this.sanity <= 0) { this.done = true; api.lose(); return; }
          }
        } else {
          this.sanT = Math.max(0, this.sanT - dt * 1.2);
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      // Dark bayou background
      c.fillStyle = '#030a06'; c.fillRect(0,0,W,H);
      // Swamp texture (faint horizontal strips)
      for (let y = 40; y < H; y += 14) {
        c.globalAlpha = 0.04 + 0.02*Math.sin(api.t*0.5+y*0.1);
        c.fillStyle = C.greenD; c.fillRect(0,y,W,6);
      }
      c.globalAlpha = 1;
      // Tree silhouettes (static)
      c.fillStyle = '#040a06';
      [[0,H-60,20,60],[15,H-80,16,80],[W-30,H-70,18,70],[W-15,H-50,14,50],[W/2-60,H-90,12,90],[W/2+40,H-75,15,75]].forEach(([tx,ty,tw,th]) => {
        c.fillRect(tx,ty,tw,th);
        g.rect(tx-8,ty-10,tw+16,20,C.void_);
      });

      // Cultist torch glows (soft radial, additive-ish)
      this.cults.forEach(cu => {
        c.globalAlpha = 0.13 + 0.05*Math.sin(api.t*2.2);
        const grd = c.createRadialGradient(cu.x,cu.y,2,cu.x,cu.y,cu.r);
        grd.addColorStop(0,'#ff8800'); grd.addColorStop(1,'transparent');
        c.fillStyle = grd; c.fillRect(cu.x-cu.r,cu.y-cu.r,cu.r*2,cu.r*2);
        c.globalAlpha = 1;
        // Cultist figure
        g.rect(cu.x-4,cu.y-14,8,14,'#181008');
        g.rect(cu.x-2,cu.y-18,4,5,'#181008');
        g.rect(cu.x-1,cu.y-24,2,10,'#6a4010');
        c.globalAlpha = 0.8;
        g.rect(cu.x-2,cu.y-26,4,4,'#ff8800');
        c.globalAlpha = 1;
      });

      // Player (bone-white orb)
      c.globalAlpha = this.invT > 0 ? 0.4 : 1;
      g.circle(this.px, this.py, 6, C.bone);
      g.circle(this.px-2, this.py-1, 2, C.void_);
      g.circle(this.px+2, this.py-1, 2, C.void_);
      c.globalAlpha = 1;

      // Top bar
      api.topBar('FRAGMENT II · THE BAYOU');
      api.txt('SANITY: ' + '●'.repeat(this.sanity) + '○'.repeat(3-this.sanity), 6, 4, 8, this.sanity < 2 ? C.red : C.green);
      // Timer
      const barW = W - 40;
      const fill = Math.max(0, this.timer / 22) * barW;
      g.rect(20, H-14, barW, 6, C.teal);
      g.rect(20, H-14, Math.floor(fill), 6, C.green);
      api.txtC(Math.ceil(this.timer) + 's', W/2, H-26, 9, C.mist);
      api.vignette(); api.scanlines();
    },
  };

  /* ======================================================================
   *  CHAPTER  III — VOYAGE TO R'LYEH
   *  Steer yacht (pointer x) · dodge ocean debris · survive 22s
   * ====================================================================== */
  const CH3 = {
    id: 'voyage', name: 'THE VOYAGE', sub: 'STEER FOR THE SUNKEN CITY',
    icon: iconShip,
    intro: [
      'JOHANSEN\'S LOGS TELL',
      'OF A JOURNEY INTO',
      'UNCHARTED PACIFIC WATERS.',
      'STEER THROUGH THE DEBRIS',
      'AS R\'LYEH RISES.',
    ],
    quote: 'The nightmare corpse-city of R\'lyeh, with its monoliths and sepulchres, had risen from the depths.',
    help: 'DRAG or TAP LEFT/RIGHT to steer',
    winText: 'The yacht cuts through black waters. A coast rises ahead.',
    loseText: 'The sea claims you. A tentacle drags you under.',
    init(api) {
      this.x      = api.W / 2;
      this.lives  = 3;
      this.timer  = 22;
      this.debs   = [];
      this.spawnT = 1.1;
      this.spd    = 2.8;
      this.invT   = 0;
      this.done   = false;
    },
    update(api, dt) {
      if (this.done) return;
      this.timer -= dt;
      if (this.timer <= 0) { api.addScore(100); api.win(); this.done = true; return; }
      if (this.invT > 0) this.invT -= dt;
      this.spd = Math.min(5.6, this.spd + dt * 0.09);

      // Steer
      const p = api.pointer;
      if (p.down) {
        const dir = p.x < api.W/2 ? -1 : 1;
        this.x += dir * 4.8 * dt * 60 * 0.016;
        // smoother: lerp toward pointer
        this.x += (p.x - this.x) * 0.06;
      }
      if (api.keyDown('left'))  this.x -= 4.2 * dt * 60 * 0.016;
      if (api.keyDown('right')) this.x += 4.2 * dt * 60 * 0.016;
      this.x = clamp(this.x, 18, api.W - 18);

      // Spawn debris
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        const elapsed = 22 - this.timer;
        this.spawnT = Math.max(0.28, 0.95 - elapsed * 0.025);
        const kind = Math.random() < 0.3 ? 'tentacle' : 'debris';
        this.debs.push({
          x: 16 + Math.random() * (api.W - 32),
          y: -18, vy: this.spd, kind,
          w: kind === 'tentacle' ? 10 : 16,
          h: kind === 'tentacle' ? 26 : 10,
        });
      }
      // Move & collide
      this.debs.forEach(d => { d.y += d.vy * dt * 60 * 0.016; });
      this.debs = this.debs.filter(d => d.y < api.H + 30);
      if (this.invT <= 0) {
        const yx = this.x, yy = api.H - 40;
        this.debs.forEach(d => {
          if (Math.abs(yx - d.x) < d.w/2 + 10 && Math.abs(yy - d.y) < d.h/2 + 8) {
            this.lives--;
            this.invT = 1.0;
            api.shake(5, 0.3);
            api.audio.sfx('hurt');
            if (this.lives <= 0) { this.done = true; api.lose(); }
          }
        });
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      // Night ocean
      c.fillStyle = '#030810'; c.fillRect(0,0,W,H);
      // Wave texture
      for (let wy = 60; wy < H - 50; wy += 22) {
        c.globalAlpha = 0.06 + 0.04*Math.sin(api.t*1.5+wy*0.07);
        c.fillStyle = C.tealL; c.fillRect(0,wy,W,2);
      }
      c.globalAlpha = 1;
      // Stars (top quarter)
      for (let i = 0; i < 24; i++) {
        c.globalAlpha = 0.25 + 0.2*Math.sin(api.t+i);
        g.rect(((i*61+7)%W), ((i*37+3)%(H*0.22|0)), 1, 1, C.bone);
      }
      c.globalAlpha = 1;

      // Debris
      this.debs.forEach(d => {
        if (d.kind === 'tentacle') {
          g.rect(d.x-5,d.y-13,10,26,C.greenD);
          g.rect(d.x-7,d.y,14,10,C.greenD);
          g.rect(d.x-3,d.y-15,6,4,C.green);
        } else {
          g.rect(d.x-8,d.y-5,16,10,'#4a3020');
          g.rect(d.x-6,d.y-3,12,6,'#3a2010');
        }
      });

      // Yacht
      const yx = Math.floor(this.x), yy = H - 40;
      c.globalAlpha = this.invT > 0 ? 0.45 : 1;
      g.rect(yx-14,yy-4,28,10,C.bone);
      g.rect(yx-10,yy+2,20,6,C.mist);
      g.rect(yx-1,yy-20,2,18,'#9a8070');
      g.rect(yx-1,yy-20,10,10,C.bone);
      c.globalAlpha = 1;

      // Top bar
      api.topBar('FRAGMENT III · THE VOYAGE');
      api.txt('LIVES: ' + '♦'.repeat(this.lives) + '◇'.repeat(3-this.lives), 6, 4, 8, this.lives < 2 ? C.red : C.tealL);
      // Timer bar
      const barW = W - 40;
      g.rect(20, H-14, barW, 6, C.teal);
      g.rect(20, H-14, Math.floor(Math.max(0,this.timer/22)*barW), 6, C.green);
      api.txtC(Math.ceil(this.timer) + 's', W/2, H-26, 9, C.mist);
      api.vignette(); api.scanlines();
    },
  };

  /* ======================================================================
   *  CHAPTER  IV — THE SUNKEN CITY
   *  Collect 10 glowing runes in R'lyeh's corridors · 26s
   *  Walls pulse and shift — touching a pulsing wall loses a life
   * ====================================================================== */
  const CH4 = {
    id: 'rlyeh', name: 'THE SUNKEN CITY', sub: 'GATHER THE RUNES',
    icon: iconGlyph,
    intro: [
      'R\'LYEH\'S GEOMETRY',
      'DEFIES ALL REASON.',
      'COLLECT THE ANCIENT RUNES',
      'BEFORE THE WALLS',
      'DRIVE YOU MAD.',
    ],
    quote: 'The geometry of the place was all wrong. It seemed to be part of some crazy angle which was causing the walls to fall inward.',
    help: 'DRAG or arrow keys to move · collect runes',
    winText: 'Ten runes gathered. The way home shimmers.',
    loseText: 'The angles fold around you. You are lost.',
    init(api) {
      this.px     = api.W / 2;
      this.py     = api.H * 0.5;
      this.timer  = 26;
      this.lives  = 3;
      this.runes  = [];
      this.walls  = [];
      this.invT   = 0;
      this.done   = false;
      this.shiftT = 0;
      this._spawnRunes(api);
      this._spawnWalls(api);
    },
    _spawnRunes(api) {
      this.runes = [];
      const W = api.W, H = api.H;
      for (let i = 0; i < 10; i++) {
        this.runes.push({
          x: 24 + Math.random() * (W - 48),
          y: 36 + Math.random() * (H - 70),
          r: 7, t: Math.random() * Math.PI * 2,
        });
      }
    },
    _spawnWalls(api) {
      this.walls = [];
      const W = api.W, H = api.H;
      // A few horizontal/vertical bars that pulse and shift
      const specs = [
        {x:0,   y:90,  w:90,  h:8},
        {x:180, y:130, w:90,  h:8},
        {x:0,   y:220, w:110, h:8},
        {x:150, y:270, w:120, h:8},
        {x:60,  y:360, w:100, h:8},
        {x:20,  y:170, w:8,   h:80},
        {x:220, y:190, w:8,   h:80},
      ];
      specs.forEach((s,i) => this.walls.push(Object.assign({t:i*0.8,active:false},s)));
    },
    update(api, dt) {
      if (this.done) return;
      this.timer -= dt;
      if (this.timer <= 0) { this.done = true; api.lose(); return; }
      if (this.invT > 0) this.invT -= dt;

      // Shift walls periodically
      this.shiftT += dt;
      if (this.shiftT >= 5) {
        this.shiftT = 0;
        this.walls.forEach(w => w.active = !w.active);
        api.flash('rgba(0,200,100,.2)', 0.3);
        api.audio.sfx('blip');
      }

      // Move player
      const p = api.pointer;
      if (p.down) {
        this.px += (p.x - this.px) * 0.14;
        this.py += (p.y - this.py) * 0.14;
      }
      const spd = 2.2;
      if (api.keyDown('left'))  this.px -= spd * dt * 60 * 0.016;
      if (api.keyDown('right')) this.px += spd * dt * 60 * 0.016;
      if (api.keyDown('up'))    this.py -= spd * dt * 60 * 0.016;
      if (api.keyDown('down'))  this.py += spd * dt * 60 * 0.016;
      this.px = clamp(this.px, 10, api.W - 10);
      this.py = clamp(this.py, 28, api.H - 20);

      // Rune collect
      this.runes = this.runes.filter(ru => {
        ru.t += dt;
        const dx = this.px - ru.x, dy = this.py - ru.y;
        if (dx*dx + dy*dy < (ru.r + 8)*(ru.r + 8)) {
          api.addScore(100);
          api.burst(ru.x, ru.y, C.greenL, 10);
          api.audio.sfx('coin');
          if (this.runes.length === 1) { this.done = true; api.win(); }
          return false;
        }
        return true;
      });

      // Wall collision
      if (this.invT <= 0) {
        this.walls.forEach(w => {
          if (!w.active) return;
          const pulse = Math.sin(api.t * 2.5 + w.t) > 0.3;
          if (!pulse) return;
          if (this.px > w.x && this.px < w.x+w.w && this.py > w.y && this.py < w.y+w.h) {
            this.lives--;
            this.invT = 1.0;
            api.shake(4,0.25);
            api.audio.sfx('hurt');
            if (this.lives <= 0) { this.done = true; api.lose(); }
          }
        });
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      c.fillStyle = '#04080c'; c.fillRect(0,0,W,H);
      // R'lyeh stone texture
      for (let x = 0; x < W; x += 28) for (let y = 0; y < H; y += 28) {
        c.globalAlpha = 0.04;
        g.rect(x,y,26,26,'#002211');
        g.rect(x+1,y+1,24,24,'#000a08');
        c.globalAlpha = 1;
      }

      // Walls
      this.walls.forEach(w => {
        const pulse = Math.sin(api.t * 2.5 + w.t) > 0.3;
        const col = w.active ? (pulse ? C.greenL : C.green) : C.teal;
        g.rect(w.x, w.y, w.w, w.h, col);
        if (w.active && pulse) {
          c.globalAlpha = 0.35;
          g.rect(w.x-2,w.y-2,w.w+4,w.h+4,C.greenL);
          c.globalAlpha = 1;
        }
      });

      // Runes (glowing circles with glyph)
      this.runes.forEach(ru => {
        c.globalAlpha = 0.5 + 0.4*Math.sin(ru.t * 2.2);
        const grd = c.createRadialGradient(ru.x,ru.y,0,ru.x,ru.y,ru.r+6);
        grd.addColorStop(0,C.greenL); grd.addColorStop(1,'transparent');
        c.fillStyle = grd; c.fillRect(ru.x-ru.r-6,ru.y-ru.r-6,(ru.r+6)*2,(ru.r+6)*2);
        c.globalAlpha = 1;
        g.circle(ru.x,ru.y,ru.r,C.greenD);
        api.txtC('✦',ru.x,ru.y-6,10,C.greenL,false);
      });

      // Player
      c.globalAlpha = this.invT > 0 ? 0.4 : 1;
      g.circle(this.px,this.py,7,C.bone);
      g.circle(this.px-2,this.py-2,2,C.void_);
      g.circle(this.px+2,this.py-2,2,C.void_);
      c.globalAlpha = 1;

      // HUD
      api.topBar('FRAGMENT IV · THE SUNKEN CITY');
      api.txt('RUNES: ' + (10 - this.runes.length) + '/10', 6, 4, 8, C.greenL);
      api.txt('LIVES: ' + '●'.repeat(this.lives), W - 58, 4, 8, this.lives < 2 ? C.red : C.green);
      const barW = W - 40;
      g.rect(20, H-14, barW, 6, C.teal);
      g.rect(20, H-14, Math.floor(Math.max(0,this.timer/26)*barW), 6, C.green);
      api.txtC(Math.ceil(this.timer) + 's', W/2, H-26, 9, C.mist);
      // Shift warning
      if (this.shiftT > 3.8) {
        c.globalAlpha = 0.5 + 0.5*Math.sin(api.t*8);
        api.txtC('WALLS SHIFT', W/2, H*0.44, 10, C.greenL);
        c.globalAlpha = 1;
      }
      api.vignette(); api.scanlines();
    },
  };

  /* ======================================================================
   *  CHAPTER  V — THE GREAT OLD ONE
   *  Cthulhu's eye sweeps across · align boat · tap to RAM · 5 hits to win
   * ====================================================================== */
  const CH5 = {
    id: 'cthulhu', name: 'THE GREAT OLD ONE', sub: 'RAM THE ANCIENT EYE',
    icon: iconEye,
    intro: [
      'CTHULHU RISES FROM',
      'THE SUNKEN CITY.',
      'JOHANSEN STEERS STRAIGHT',
      'FOR THE MONSTER\'S EYE —',
      'THE ONE DESPERATE ACT.',
    ],
    quote: 'Johansen drove his vessel directly into the gelatinous face — crushing the soft skull and scattering the green ichor.',
    help: 'DRAG to align boat with EYE · tap to RAM',
    winText: 'The creature recoils into the abyss. The nightmare recedes.',
    loseText: 'The tentacles close around the hull. The sea swallows you.',
    init(api) {
      this.bx     = api.W / 2;
      this.eyeX   = api.W / 2;
      this.eyeDir = 1;
      this.eyeSpd = 48;
      this.hits   = 0;
      this.misses = 0;
      this.timer  = 30;
      this.sanity = 4;
      this.tentacles = [];
      this.spawnT = 1.4;
      this.invT   = 0;
      this.recoilT= 0;
      this.eyeOpen= true;
      this.blinkT = 0;
      this.done   = false;
    },
    update(api, dt) {
      if (this.done) return;
      this.timer -= dt;
      if (this.timer <= 0) { this.done = true; api.lose(); return; }
      if (this.invT > 0) this.invT -= dt;
      if (this.recoilT > 0) this.recoilT -= dt;

      // Eye movement (oscillates, speeds up with hits)
      this.eyeSpd = 48 + this.hits * 16;
      this.eyeX += this.eyeDir * this.eyeSpd * dt;
      if (this.eyeX > api.W - 30) { this.eyeX = api.W - 30; this.eyeDir = -1; }
      if (this.eyeX < 30)          { this.eyeX = 30;         this.eyeDir = 1;  }

      // Blink: eye closes for 0.6s every 3s
      this.blinkT += dt;
      if (this.blinkT > 3.0) {
        this.eyeOpen = false;
        if (this.blinkT > 3.6) { this.eyeOpen = true; this.blinkT = 0; }
      }

      // Steer boat
      const p = api.pointer;
      if (p.down) this.bx += (p.x - this.bx) * 0.18;
      if (api.keyDown('left'))  this.bx -= 4.0 * dt * 60 * 0.016;
      if (api.keyDown('right')) this.bx += 4.0 * dt * 60 * 0.016;
      this.bx = clamp(this.bx, 18, api.W - 18);

      // Ram on tap/press
      if ((api.confirm() || p.justDown) && this.eyeOpen) {
        const dx = Math.abs(this.bx - this.eyeX);
        if (dx < 28) {
          // Hit
          this.hits++;
          this.recoilT = 0.6;
          api.shake(7, 0.5);
          api.burst(this.eyeX, api.H * 0.36, C.greenL, 14);
          api.flash('rgba(0,255,100,.4)', 0.5);
          api.audio.sfx('explode');
          if (this.hits >= 5) { this.done = true; api.addScore(200); api.win(); return; }
        } else {
          // Miss
          this.misses++;
          api.audio.sfx('hurt');
          api.shake(3, 0.2);
          if (this.misses >= 4) { this.done = true; api.lose(); return; }
        }
      }

      // Tentacles sweeping from bottom
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = Math.max(0.5, 1.3 - this.hits * 0.12);
        this.tentacles.push({
          x: 12 + Math.random() * (api.W - 24),
          y: api.H + 16, vy: -(62 + Math.random() * 30),
          maxY: api.H * 0.70,
        });
      }
      this.tentacles.forEach(te => {
        if (te.y > te.maxY) te.y += te.vy * dt;
        else te.vy = Math.abs(te.vy) * 0.5; // retract slowly
        te.y += te.vy < 0 ? te.vy * dt : Math.abs(te.vy) * dt;
      });
      this.tentacles = this.tentacles.filter(te => te.y < api.H + 30);

      // Tentacle hit
      if (this.invT <= 0) {
        const by = api.H - 38;
        this.tentacles.forEach(te => {
          if (Math.abs(this.bx - te.x) < 22 && Math.abs(by - te.y) < 22) {
            this.sanity--;
            this.invT = 0.9;
            api.shake(4, 0.25);
            api.audio.sfx('hurt');
            if (this.sanity <= 0) { this.done = true; api.lose(); }
          }
        });
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      c.fillStyle = '#020408'; c.fillRect(0,0,W,H);

      // Night sky with stars
      for (let i = 0; i < 28; i++) {
        c.globalAlpha = 0.3 + 0.2*Math.sin(api.t+i);
        g.rect(((i*67+11)%W), ((i*41+5)%(H*0.28|0)), 1, 1, C.bone);
      }
      c.globalAlpha = 1;

      // Cthulhu body (massive, fills upper 55%)
      const bodyH = Math.floor(H * 0.55) + (this.recoilT > 0 ? 10 : 0);
      const cx = W/2;
      // Body mass
      c.fillStyle = C.greenD; c.fillRect(cx-55,0,110,bodyH);
      c.fillStyle = '#003320';
      c.fillRect(cx-48,0,96,bodyH-20);
      // Tentacle fringe around body edges
      for (let i = 0; i < 5; i++) {
        const tx = cx - 62 + i * 4, ty = bodyH - 30 + i * 8;
        g.rect(tx, ty, 5, 24 + i*4, C.greenD);
        const tx2 = cx + 50 - i * 4;
        g.rect(tx2, bodyH-35+i*8, 5, 24+i*4, C.greenD);
      }
      // Wings
      g.rect(cx-80, bodyH*0.3|0, 28, 60, C.greenD);
      g.rect(cx+52, bodyH*0.3|0, 28, 60, C.greenD);

      // The Eye (center of Cthulhu body)
      const ey = Math.floor(bodyH * 0.5);
      if (!this.eyeOpen) {
        // Closed — a dark slit
        g.rect(this.eyeX - 16, ey - 3, 32, 6, C.greenD);
      } else {
        // Open — glowing circle
        c.globalAlpha = 0.35 + 0.25 * Math.sin(api.t * 2);
        const grd = c.createRadialGradient(this.eyeX, ey, 4, this.eyeX, ey, 24);
        grd.addColorStop(0, C.greenL); grd.addColorStop(1, 'transparent');
        c.fillStyle = grd; c.fillRect(this.eyeX-28,ey-28,56,56);
        c.globalAlpha = 1;
        g.circle(this.eyeX, ey, 14, C.greenD);
        g.circle(this.eyeX, ey, 9, C.green);
        g.circle(this.eyeX, ey, 4, C.void_);
        // Recoil scar
        if (this.hits > 0) {
          c.globalAlpha = Math.min(1, this.hits * 0.25);
          for (let s = 0; s < this.hits; s++) {
            const sx = this.eyeX - 10 + s * 6;
            g.rect(sx, ey - 16, 2, 4, C.red);
          }
          c.globalAlpha = 1;
        }
      }

      // Ocean surface
      c.fillStyle = '#040c18'; c.fillRect(0, bodyH, W, H - bodyH);
      for (let wy = bodyH; wy < H; wy += 18) {
        c.globalAlpha = 0.07;
        c.fillStyle = C.tealL; c.fillRect(0, wy, W, 2);
      }
      c.globalAlpha = 1;

      // Tentacles from ocean
      this.tentacles.forEach(te => {
        g.rect(te.x - 5, te.y, 10, H - te.y + 6, C.greenD);
        g.rect(te.x - 8, te.y - 4, 16, 10, C.green);
      });

      // Boat
      const bx = Math.floor(this.bx), by = H - 38;
      c.globalAlpha = this.invT > 0 ? 0.45 : 1;
      g.rect(bx-14, by-4, 28, 10, C.bone);
      g.rect(bx-10, by+2, 20, 6, C.mist);
      g.rect(bx-1,  by-18, 2, 16, '#9a8070');
      g.rect(bx-1,  by-18, 10, 10, C.bone);
      c.globalAlpha = 1;

      // Aim indicator (arrow from boat toward eye when eyeOpen)
      if (this.eyeOpen) {
        const dx = this.eyeX - bx, absdx = Math.abs(dx);
        const col = absdx < 28 ? C.greenL : (absdx < 60 ? C.gold : C.mist);
        c.globalAlpha = 0.5;
        api.txtC(absdx < 28 ? '↑ RAM!' : (dx > 0 ? '→' : '←'), bx, by - 30, absdx < 28 ? 12 : 10, col);
        c.globalAlpha = 1;
      } else {
        c.globalAlpha = 0.4;
        api.txtC('EYE CLOSED', W/2, H * 0.65, 8, C.mist);
        c.globalAlpha = 1;
      }

      // HUD
      api.topBar('FRAGMENT V · THE GREAT OLD ONE');
      const hitStr = '✦'.repeat(this.hits) + '◌'.repeat(5 - this.hits);
      api.txt('HITS: ' + hitStr, 6, 4, 7, C.greenL);
      api.txt('SANITY: ' + this.sanity, W - 68, 4, 7, this.sanity < 2 ? C.red : C.green);
      const barW = W - 40;
      g.rect(20, H-12, barW, 5, C.teal);
      g.rect(20, H-12, Math.floor(Math.max(0,this.timer/30)*barW), 5, C.green);
      api.txtC(Math.ceil(this.timer) + 's', W/2, H-24, 8, C.mist);
      api.vignette(); api.scanlines();
    },
  };

  /* ======================================================================
   *  RetroSaga.create
   * ====================================================================== */
  RetroSaga.create({
    id:       'cthulhu',
    title:    'The Call',
    subtitle: 'A TALE OF COSMIC DREAD',
    currency: 'SANITY',
    credit:   'H. P. LOVECRAFT · 1926',
    accent:   '#00cc55',
    emblem,
    scenery,
    bootCta:   'TAP TO INVESTIGATE',
    menuLabel: 'CHOOSE YOUR ACCOUNT',
    menuHint:  'TAP A FRAGMENT',
    menuDone:  'THE TRUTH IS KNOWN. THE MIND ENDURES.',
    menu,
    finale: [
      'THE NIGHTMARE RETREATS',
      'TO THE BOTTOM OF THE SEA.',
      '',
      'WHAT JOHANSEN SAW',
      'CANNOT BE UNSEEN.',
      'WHAT ANGELL DOCUMENTED',
      'CANNOT BE UNTHOUGHT.',
      '',
      '"THE WORLD IS PRIMAL,',
      'ANCIENT, AND NOT',
      'BUILT FOR MAN."',
    ],
    tagline: 'A POLECAT GAME · LOVECRAFT 1926',

    screens: {
      overlay:      'rgba(2,4,10,.86)',
      win:          '#22ff77',
      lose:         '#cc2233',
      chapterLabel: '#4a6a80',
      name:         '#c0d4e0',
      sub:          '#00cc55',
      intro:        '#90b0c0',
      quote:        '#3a5a6a',
      help:         '#00cc55',
      score:        '#c0d4e0',
      cur:          '#22ff77',
      cta:          '#c0d4e0',
    },
    labels: {
      chapter: 'FRAGMENT',
      score:   'SANITY HELD',
      win:     'THE MIND ENDURES',
      lose:    'MADNESS TAKES YOU',
      cont:    'TAP TO PRESS ON',
      finale:  'TAP FOR THE FINAL ACCOUNT',
      toMenu:  'RETURN TO DARKNESS',
      play:    'DARE TO BEGIN',
    },

    width: 270, height: 480, parent: '#game',

    chapters: [CH1, CH2, CH3, CH4, CH5],
  });

})();
