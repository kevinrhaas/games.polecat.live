/* ============================================================================
 * NOSFERATU — SHADOW OF THE VAMPYR (1922)
 * Five nights from F. W. Murnau's 1922 silent horror masterpiece:
 *   1. THE JOURNEY       — steer Hutter's carriage past wolves (20s survive)
 *   2. WITHIN THE WALLS  — collect journal pages, avoid Orlok's slow hunt
 *   3. THE DEMETER       — tap coffin lids before Orlok rises (12 sealed)
 *   4. THE SHADOW        — time Orlok's shadow up five stair steps
 *   5. UNTIL DAWN        — repel Orlok with tap / hold until sunrise (28s)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;
  const rand  = Retro.util.rand;
  const randI = Retro.util.randInt;

  /* ─── Stark silent-film palette ─── */
  const C = {
    black:  '#060606',
    ink:    '#100c0a',
    night:  '#0c0808',
    shadow: '#1e1810',
    dark:   '#2a2018',
    stone:  '#3c3028',
    grey:   '#6a6058',
    silver: '#a0988a',
    ash:    '#c8c0b0',
    bone:   '#e8e0cc',
    white:  '#f0ece0',
    blood:  '#cc1122',
    bloodD: '#880a18',
    crimson:'#ff2233',
    rust:   '#883322',
    amber:  '#c88820',
    amberL: '#f0c040',
    moon:   '#b0aaa0',
    moonL:  '#d8d4c8',
  };

  /* ─── Emblem: Orlok silhouette rising before the moon ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Hazy moon glow
    c.globalAlpha = 0.15;
    c.fillStyle = C.moonL;
    c.beginPath(); c.arc(cx, cy - 22, 40, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.7;
    // Moon disc
    c.fillStyle = C.bone;
    c.beginPath(); c.arc(cx, cy - 22, 26, 0, Math.PI * 2); c.fill();
    // Bite-shadow on moon (crescent suggestion)
    c.fillStyle = C.night;
    c.beginPath(); c.arc(cx + 10, cy - 18, 22, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    // Orlok silhouette
    g.rect(cx - 10, cy - 2, 20, 30, C.shadow); // body
    g.circle(cx, cy - 10, 11, C.shadow);         // head (bald, round)
    // Pointed bat ears
    c.fillStyle = C.shadow;
    c.beginPath(); c.moveTo(cx - 8, cy - 18); c.lineTo(cx - 17, cy - 32); c.lineTo(cx - 2, cy - 16); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(cx + 8, cy - 18); c.lineTo(cx + 17, cy - 32); c.lineTo(cx + 2, cy - 16); c.closePath(); c.fill();
    // Raised arms (the iconic pose)
    g.rect(cx - 26, cy,  18, 5, C.shadow);
    g.rect(cx + 8,  cy,  18, 5, C.shadow);
    g.rect(cx - 26, cy - 10, 6, 14, C.shadow);
    g.rect(cx + 20, cy - 10, 6, 14, C.shadow);
    // Red eyes
    g.circle(cx - 4, cy - 10, 2, C.blood);
    g.circle(cx + 4, cy - 10, 2, C.blood);
  }

  /* ─── Scenery ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu' || scene === 'boot') {
      // Aged film negative — deep black
      c.fillStyle = C.ink; c.fillRect(0, 0, W, H);
      // Subtle film grain
      for (let i = 0; i < 160; i++) {
        const gx = (i * 79 + 23) % W, gy = (i * 57 + 13) % H;
        c.globalAlpha = 0.03 + (i % 4) * 0.008;
        c.fillStyle = C.stone; c.fillRect(gx, gy, 2, 1);
      }
      c.globalAlpha = 1;
      // Full moon (upper centre)
      c.globalAlpha = 0.12;
      c.fillStyle = C.moonL;
      c.beginPath(); c.arc(W / 2, 70, 52, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 0.7;
      c.fillStyle = C.bone;
      c.beginPath(); c.arc(W / 2, 70, 34, 0, Math.PI * 2); c.fill();
      // Crescent bite
      c.fillStyle = C.night;
      c.beginPath(); c.arc(W / 2 + 14, 66, 28, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      // Castle silhouette at bottom
      c.fillStyle = C.shadow;
      g.rect(0,   H - 74, 28, 74, C.shadow);
      c.beginPath(); c.moveTo(0, H - 74); c.lineTo(14, H - 92); c.lineTo(28, H - 74); c.closePath(); c.fill();
      g.rect(32,  H - 58, 36, 58, C.shadow);
      g.rect(72,  H - 80, 22, 80, C.shadow);
      c.beginPath(); c.moveTo(72, H - 80); c.lineTo(83, H - 98); c.lineTo(94, H - 80); c.closePath(); c.fill();
      g.rect(96,  H - 52, 54, 52, C.shadow);
      g.rect(154, H - 68, 26, 68, C.shadow);
      c.beginPath(); c.moveTo(154, H - 68); c.lineTo(167, H - 86); c.lineTo(180, H - 68); c.closePath(); c.fill();
      g.rect(184, H - 58, 50, 58, C.shadow);
      g.rect(238, H - 76, 20, 76, C.shadow);
      c.beginPath(); c.moveTo(238, H - 76); c.lineTo(248, H - 92); c.lineTo(258, H - 76); c.closePath(); c.fill();
      g.rect(258, H - 54, 12, 54, C.shadow);
      // Animated bats
      for (let i = 0; i < 5; i++) {
        const bx = ((t * (14 + i * 4) * (i % 2 === 0 ? 1 : -1) + i * 58 + 20) % (W + 40)) - 20;
        const by = 100 + (i * 41) % 80 + Math.sin(t * 1.4 + i * 1.2) * 12;
        c.globalAlpha = 0.65;
        c.fillStyle = C.dark;
        c.beginPath();
        c.moveTo(bx, by);
        c.lineTo(bx - 10, by - 6);
        c.lineTo(bx - 5,  by);
        c.lineTo(bx,      by + 2);
        c.lineTo(bx + 5,  by);
        c.lineTo(bx + 10, by - 6);
        c.closePath(); c.fill();
      }
      c.globalAlpha = 1;
      return;
    }

    // Default: stormy night sky for intro/result/finale
    const sky = c.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, C.black); sky.addColorStop(1, C.night);
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    // Pale moon (small, hazy)
    c.globalAlpha = 0.35;
    c.fillStyle = C.moon;
    c.beginPath(); c.arc(W * 0.76, 36, 20, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    // Dark ground
    c.fillStyle = C.shadow; c.fillRect(0, H * 0.55, W, H * 0.45);
    // Tree silhouettes at horizon
    c.fillStyle = C.dark;
    for (let i = 0; i < 9; i++) {
      const tx = (i * 32 + 8) % W, th = 60 + (i * 23) % 50;
      c.fillRect(tx, H * 0.55 - th, 10, th);
      c.beginPath(); c.arc(tx + 5, H * 0.55 - th, 18 + (i * 7) % 14, 0, Math.PI * 2); c.fill();
    }
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(4,2,2,.84)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Card layout: film frames descending diagonally ─── */
  const CARD_LAYOUT = [
    { x: 10,  y: 78,  w: 114, h: 58 }, // Ch1: THE JOURNEY    (top-left)
    { x: 147, y: 142, w: 114, h: 58 }, // Ch2: WITHIN THE WALLS (top-right)
    { x: 10,  y: 208, w: 114, h: 58 }, // Ch3: THE DEMETER    (mid-left)
    { x: 147, y: 272, w: 114, h: 58 }, // Ch4: THE SHADOW     (mid-right)
    { x: 52,  y: 350, w: 166, h: 58 }, // Ch5: UNTIL DAWN     (bottom-centre)
  ];

  RetroSaga.create({
    id: 'nosferatu',
    title: 'Nosferatu',
    subtitle: 'SHADOW OF THE VAMPYR',
    currency: 'SHADOW',
    screens: {
      win:          C.bone,
      lose:         C.blood,
      chapterLabel: C.silver,
      name:         C.bone,
      sub:          C.ash,
      intro:        C.bone,
      quote:        C.grey,
      help:         C.silver,
      score:        C.bone,
      cur:          C.blood,
      cta:          C.bone,
      overlay:      'rgba(4,2,2,.90)',
    },
    labels: {
      chapter: 'NIGHT',
      score:   'SHADOW CAST',
      win:     'THE DARK HOLDS.',
      lose:    'DAWN FINDS YOU.',
      cont:    'TAP TO CONTINUE',
      finale:  'TAP FOR THE ENDING',
      toMenu:  'RETURN TO THE SHADOWS',
      play:    'TAP TO BEGIN',
    },
    accent:   C.blood,
    credit:   'AFTER F. W. MURNAU · 1922',
    emblem,
    scenery,
    bootCta:   'TAP TO ENTER THE SHADOW',
    menuLabel: 'NOSFERATU',
    menuHint:  'CHOOSE YOUR NIGHT',
    menuDone:  'THE DAWN IS YOURS.',

    menu: {
      title(api, currency) {
        const g = api.gfx, W = api.W, c = api.ctx;
        // Film-strip header
        g.rect(0, 0, W, 72, C.ink);
        // Sprocket holes top and bottom of strip
        for (let i = 0; i < 11; i++) {
          g.rect(3 + i * 26, 3,  12, 8, C.dark);
          g.rect(3 + i * 26, 60, 12, 8, C.dark);
        }
        // Title text
        api.txtCFit('NOSFERATU', W / 2, 16, 10, C.bone, true, W - 40);
        api.txtCFit('SHADOW  ·  ' + currency, W / 2, 36, 8, C.blood, true, W - 40);
        // Dashed connecting threads between cards
        c.strokeStyle = C.stone; c.lineWidth = 1;
        c.setLineDash([3, 4]);
        // Ch1 right-mid → Ch2 left-mid
        c.beginPath(); c.moveTo(124, 107); c.lineTo(147, 171); c.stroke();
        // Ch2 left-mid → Ch3 right-mid
        c.beginPath(); c.moveTo(147, 171); c.lineTo(124, 237); c.stroke();
        // Ch3 right-mid → Ch4 left-mid
        c.beginPath(); c.moveTo(124, 237); c.lineTo(147, 301); c.stroke();
        // Ch4 bottom-centre → Ch5 top-centre
        c.beginPath(); c.moveTo(204, 330); c.lineTo(135, 350); c.stroke();
        c.setLineDash([]);
      },
      layout() { return CARD_LAYOUT; },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2, cy = y + h / 2;
        // Card background — silent film intertitle style
        const bg = sel ? C.dark : (done ? '#150c08' : C.ink);
        c.fillStyle = bg; c.fillRect(x, y, w, h);
        // Outer border
        c.strokeStyle = sel ? C.bone : (done ? C.amber : C.stone);
        c.lineWidth = sel ? 2 : 1; c.strokeRect(x + 1, y + 1, w - 2, h - 2);
        // Inner border (double-line intertitle look)
        c.strokeStyle = sel ? C.silver : (done ? '#604010' : C.shadow);
        c.lineWidth = 1; c.strokeRect(x + 5, y + 5, w - 10, h - 10);
        // Art Nouveau corner brackets
        const cs = 9;
        const cc = sel ? C.silver : (done ? C.amber : C.grey);
        c.lineWidth = 1.5;
        [
          [x + 2, y + 2,  1,  1],
          [x + w - 2, y + 2, -1,  1],
          [x + 2,     y + h - 2,  1, -1],
          [x + w - 2, y + h - 2, -1, -1],
        ].forEach(function (corner) {
          const px = corner[0], py = corner[1], dx = corner[2], dy = corner[3];
          c.strokeStyle = cc;
          c.beginPath();
          c.moveTo(px + dx * cs, py);
          c.lineTo(px, py);
          c.lineTo(px, py + dy * cs);
          c.stroke();
        });
        // Chapter icon
        if (ch.icon) ch.icon(api, cx, cy - 9);
        // Chapter name
        api.txtCFit(ch.name, cx, cy + 8, 7, sel ? C.bone : (done ? C.ash : C.silver), true, w - 18);
        // Done tick
        if (done) {
          c.globalAlpha = 0.9;
          api.txtC('✓', x + w - 10, y + 8, 9, C.amber, true);
          c.globalAlpha = 1;
        }
        // Selection arrow
        if (sel) {
          c.fillStyle = C.bone;
          c.beginPath();
          c.moveTo(x - 3,  cy);
          c.lineTo(x - 12, cy - 5);
          c.lineTo(x - 12, cy + 5);
          c.closePath(); c.fill();
        }
      },
    },

    finale: [
      'THE COCK HAS CROWED.',
      '',
      'AS THE FIRST RAYS',
      'OF DAWN TOUCHED HIM,',
      'COUNT ORLOK DISSOLVED',
      'INTO DUST AND SHADOW.',
      '',
      '"AND DEATH SHALL HAVE',
      ' NO DOMINION."',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ==============================================================
       * 1. THE JOURNEY — steer carriage, dodge wolves for 20 seconds
       * ============================================================== */
      {
        id: 'journey',
        name: 'THE JOURNEY',
        sub: 'INTO DARK COUNTRY',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 10, y - 4, 20, 10, C.dark);
          g.circle(x - 6,  y + 7, 4, C.shadow);
          g.circle(x + 6,  y + 7, 4, C.shadow);
          g.rect(x - 8, y - 10, 16, 7, C.stone);
          g.circle(x - 13, y - 16, 5, C.stone);
          g.circle(x + 13, y - 16, 5, C.stone);
        },
        intro: [
          'THOMAS HUTTER RIDES',
          'TO TRANSYLVANIA.',
          'His employer sends him',
          'to meet a Count named',
          'Orlok. The innkeeper',
          'warns him — turn back.',
        ],
        quote: '"Beyond the forest begins the land of phantoms." — an old Transylvanian legend',
        help: 'DRAG left/right · dodge wolves and fallen trees!',
        winText: 'The carriage reached Castle Orlok as the moon rose cold and pale.',
        loseText: 'The wolves closed in from every shadow. The carriage was lost.',
        init(api) {
          this.hutX   = api.W / 2;
          this.lives  = 3;
          this.timer  = 0;
          this.dur    = 20;
          this.obs    = [];
          this.spawnT = 0;
          this.roadY  = 0;
          this.invT   = 0;
          this.trees  = [];
          for (var i = 0; i < 9; i++) {
            this.trees.push({ x: randI(0, 270), spd: 38 + randI(0, 28), ph: i });
          }
        },
        update(api, dt) {
          var W = api.W, H = api.H;
          this.timer += dt;
          if (this.invT > 0) this.invT -= dt;
          if (this.timer >= this.dur) { api.score += 120; api.win(); return; }
          // Steer
          if (api.pointer.down) this.hutX = clamp(api.pointer.x, 36, W - 36);
          if (api.keyDown('left'))  this.hutX = clamp(this.hutX - 190 * dt, 36, W - 36);
          if (api.keyDown('right')) this.hutX = clamp(this.hutX + 190 * dt, 36, W - 36);
          // Road scroll
          this.roadY = (this.roadY + 200 * dt) % 48;
          // Background trees scroll
          for (var k = 0; k < this.trees.length; k++) {
            this.trees[k].x = (this.trees[k].x + this.trees[k].spd * dt) % (W + 20);
          }
          // Spawn obstacles
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.82, 2.1 - this.timer * 0.055);
            var kind = Math.random() < 0.58 ? 'wolf' : 'log';
            this.obs.push({ x: 36 + randI(0, W - 72), y: -28, kind: kind });
          }
          var spd = 92 + this.timer * 4;
          for (var j = 0; j < this.obs.length; j++) this.obs[j].y += spd * dt;
          this.obs = this.obs.filter(function (o) { return o.y < H + 28; });
          // Collision
          if (this.invT <= 0) {
            var hy = H - 54;
            for (var m = 0; m < this.obs.length; m++) {
              var o = this.obs[m];
              if (Math.abs(o.x - this.hutX) < 22 && Math.abs(o.y - hy) < 22) {
                this.lives--;
                this.invT = 1.6;
                api.shake(6, 0.28); api.flash(C.blood, 0.18); api.audio.sfx('hurt');
                api.burst(this.hutX, hy, C.blood, 10);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dark sky
          c.fillStyle = C.black; c.fillRect(0, 0, W, H);
          // Moon haze
          c.globalAlpha = 0.45;
          c.fillStyle = C.moonL;
          c.beginPath(); c.arc(W * 0.78, 32, 22, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 0.1;
          c.beginPath(); c.arc(W * 0.78, 32, 38, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          // Background forest silhouettes
          c.fillStyle = C.ink;
          for (var ti = 0; ti < this.trees.length; ti++) {
            var tr = this.trees[ti];
            var th = 80 + (tr.ph * 23) % 50;
            c.fillRect(tr.x - 8, H - th, 14, th);
            c.beginPath(); c.arc(tr.x, H - th, 20 + (tr.ph * 7) % 14, 0, Math.PI * 2); c.fill();
          }
          // Dirt road lane
          c.fillStyle = C.shadow; c.fillRect(36, 0, W - 72, H);
          c.fillStyle = C.stone; c.fillRect(36, 0, 2, H); c.fillRect(W - 38, 0, 2, H);
          // Centre dashes scrolling
          for (var dy = -48 + this.roadY; dy < H; dy += 48) {
            g.rect(W / 2 - 2, dy, 4, 26, C.dark);
          }
          // Obstacles
          for (var oi = 0; oi < this.obs.length; oi++) {
            var ob = this.obs[oi];
            if (ob.kind === 'wolf') {
              g.rect(ob.x - 14, ob.y - 3,  28, 12, C.dark);
              g.circle(ob.x + 12, ob.y - 10, 8, C.dark);
              g.rect(ob.x + 16, ob.y - 8, 6, 4, C.shadow);
              g.circle(ob.x + 9,  ob.y - 12, 2, C.blood);
              g.circle(ob.x + 14, ob.y - 12, 2, C.blood);
              g.rect(ob.x - 12, ob.y + 9, 4, 10, C.dark);
              g.rect(ob.x - 5,  ob.y + 9, 4, 10, C.dark);
              g.rect(ob.x + 2,  ob.y + 9, 4, 10, C.dark);
              g.rect(ob.x + 9,  ob.y + 9, 4, 10, C.dark);
            } else {
              g.rect(ob.x - 20, ob.y - 5, 40, 10, C.dark);
              g.rect(ob.x - 20, ob.y - 5, 40,  4, C.stone);
              g.rect(ob.x - 24, ob.y - 6, 8,  12, C.shadow);
              g.rect(ob.x + 16, ob.y - 6, 8,  12, C.shadow);
            }
          }
          // Hutter's carriage
          var hx = this.hutX, hhy = H - 54;
          if (this.invT <= 0 || Math.floor(this.invT * 9) % 2 === 0) {
            g.rect(hx - 14, hhy - 10, 28, 18, C.stone);
            g.rect(hx - 10, hhy - 20, 20, 12, C.dark);
            g.rect(hx - 7,  hhy - 18, 14,  9, C.shadow);
            g.circle(hx - 8, hhy + 8, 5, C.dark); g.circle(hx - 8, hhy + 8, 3, C.stone);
            g.circle(hx + 8, hhy + 8, 5, C.dark); g.circle(hx + 8, hhy + 8, 3, C.stone);
            g.circle(hx, hhy - 24, 5, C.ash); // Hutter head
            g.rect(hx - 3, hhy - 20, 6, 10, C.ash);
          }
          api.topBar('TIME: ' + Math.max(0, Math.ceil(this.dur - this.timer)) + 's');
          for (var li = 0; li < 3; li++) g.circle(W - 38 + li * 13, 20, 4, li < this.lives ? C.blood : C.dark);
          api.vignette();
        },
      },

      /* ==============================================================
       * 2. WITHIN THE WALLS — free movement, collect 6 pages, avoid Orlok
       * ============================================================== */
      {
        id: 'castle',
        name: 'WITHIN THE WALLS',
        sub: "ORLOK'S CASTLE",
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.rect(x - 6, y - 8, 12, 14, C.shadow);
          g.rect(x - 8, y - 12, 16, 5,  C.dark);
          g.rect(x - 8,  y - 16, 4, 5, C.dark);
          g.rect(x,      y - 16, 4, 5, C.dark);
          g.rect(x + 5,  y - 16, 4, 5, C.dark);
          g.rect(x - 3, y - 3, 6, 9, C.blood);
        },
        intro: [
          'HUTTER EXPLORES',
          'THE COUNT\'S CASTLE.',
          'Ancient halls. Cold',
          'stone. Shadows move',
          'where nothing should.',
          'Find the journal pages.',
        ],
        quote: '"Hutter, alone in the castle, felt the weight of centuries pressing down on him." — intertitle',
        help: 'DRAG to move · collect PAGES · avoid Orlok\'s shadow!',
        winText: 'Hutter clutched all six pages. The castle fell silent — too silent.',
        loseText: 'The shadow engulfed Hutter. He woke with two red marks on his neck.',
        init(api) {
          var W = api.W, H = api.H;
          this.hx = W / 2;
          this.hy = H - 100;
          this.lives  = 3;
          this.invT   = 0;
          this.got    = 0;
          this.need   = 6;
          this.orlokX = W / 2;
          this.orlokY = 80;
          this.orlokSpd = 24;
          this.pages = [
            { x: 38,  y: 112, taken: false },
            { x: 226, y: 96,  taken: false },
            { x: 46,  y: 286, taken: false },
            { x: 224, y: 268, taken: false },
            { x: 135, y: 178, taken: false },
            { x: 104, y: 372, taken: false },
          ];
        },
        update(api, dt) {
          var W = api.W, H = api.H;
          if (this.invT > 0) this.invT -= dt;
          // Move Hutter toward pointer or via keys
          var spd = 118;
          if (api.pointer.down) {
            var dx = api.pointer.x - this.hx, dy = api.pointer.y - this.hy;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 6) { this.hx += (dx / dist) * spd * dt; this.hy += (dy / dist) * spd * dt; }
          }
          if (api.keyDown('left'))  this.hx -= spd * dt;
          if (api.keyDown('right')) this.hx += spd * dt;
          if (api.keyDown('up'))    this.hy -= spd * dt;
          if (api.keyDown('down'))  this.hy += spd * dt;
          this.hx = clamp(this.hx, 16, W - 16);
          this.hy = clamp(this.hy, 60, H - 24);
          // Orlok hunts slowly — accelerates with each page collected
          var oSpd = this.orlokSpd + this.got * 4;
          var odx = this.hx - this.orlokX, ody = this.hy - this.orlokY;
          var odist = Math.sqrt(odx * odx + ody * ody);
          if (odist > 2) {
            this.orlokX += (odx / odist) * oSpd * dt;
            this.orlokY += (ody / odist) * oSpd * dt;
          }
          this.orlokX = clamp(this.orlokX, 16, W - 16);
          this.orlokY = clamp(this.orlokY, 60, H - 24);
          // Collect pages
          for (var pi = 0; pi < this.pages.length; pi++) {
            var p = this.pages[pi];
            if (!p.taken && Math.abs(this.hx - p.x) < 20 && Math.abs(this.hy - p.y) < 20) {
              p.taken = true;
              this.got++;
              api.score += 60;
              api.audio.sfx('coin');
              api.burst(p.x, p.y, C.bone, 8);
              if (this.got >= this.need) { api.score += 80; api.win(); return; }
            }
          }
          // Orlok catches Hutter
          if (this.invT <= 0 && Math.abs(this.hx - this.orlokX) < 22 && Math.abs(this.hy - this.orlokY) < 24) {
            this.lives--;
            this.invT = 2.1;
            api.shake(7, 0.32); api.flash(C.blood, 0.24); api.audio.sfx('hurt');
            api.burst(this.hx, this.hy, C.blood, 12);
            // Reset Orlok to far corner
            this.orlokX = W - this.hx;
            this.orlokY = this.hy > H / 2 ? 80 : H - 80;
            if (this.lives <= 0) { api.lose(); }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          // Stone floor
          c.fillStyle = C.ink; c.fillRect(0, 0, W, H);
          c.strokeStyle = C.shadow; c.lineWidth = 1;
          for (var row = 0; row < 12; row++) {
            for (var col = 0; col < 7; col++) {
              c.fillStyle = row % 2 === col % 2 ? '#0e0c0a' : C.ink;
              c.fillRect(col * 40, 56 + row * 36, 40, 36);
              c.strokeRect(col * 40, 56 + row * 36, 40, 36);
            }
          }
          // Orlok's forward shadow (long, angled toward Hutter)
          var sAngle = Math.atan2(this.hy - this.orlokY, this.hx - this.orlokX);
          c.globalAlpha = 0.40;
          c.fillStyle = C.ink;
          c.beginPath();
          c.ellipse(
            this.orlokX + Math.cos(sAngle) * 44,
            this.orlokY + Math.sin(sAngle) * 28,
            52, 20, sAngle, 0, Math.PI * 2
          );
          c.fill();
          c.globalAlpha = 1;
          // Journal pages
          for (var pj = 0; pj < this.pages.length; pj++) {
            var pg = this.pages[pj];
            if (pg.taken) continue;
            var blink = Math.sin(t * 4 + pg.x * 0.08) > 0;
            if (blink) {
              g.rect(pg.x - 9,  pg.y - 11, 18, 15, C.ash);
              g.rect(pg.x - 7,  pg.y - 9,  14, 11, C.bone);
              for (var li = 0; li < 3; li++) g.rect(pg.x - 6, pg.y - 7 + li * 4, 12, 1, C.silver);
            }
          }
          // Orlok
          var ox = this.orlokX, oy = this.orlokY;
          g.rect(ox - 10, oy - 2, 20, 28, C.dark);
          g.circle(ox, oy - 12, 10, C.shadow);
          c.fillStyle = C.shadow;
          c.beginPath(); c.moveTo(ox - 8, oy - 20); c.lineTo(ox - 15, oy - 32); c.lineTo(ox - 2, oy - 18); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(ox + 8, oy - 20); c.lineTo(ox + 15, oy - 32); c.lineTo(ox + 2, oy - 18); c.closePath(); c.fill();
          g.circle(ox - 3, ox > 20 ? oy - 13 : oy - 12, 2, C.blood);
          g.circle(ox + 3, oy - 13, 2, C.blood);
          g.rect(ox - 22, oy + 2, 14, 5, C.dark); g.rect(ox + 8, oy + 2, 14, 5, C.dark);
          g.rect(ox - 22, oy - 7, 5, 14, C.dark); g.rect(ox + 17, oy - 7, 5, 14, C.dark);
          for (var fi = 0; fi < 3; fi++) {
            g.rect(ox - 22 + fi * 3, oy - 12, 2, 8, C.shadow);
            g.rect(ox + 18 + fi * 3, oy - 12, 2, 8, C.shadow);
          }
          // Hutter
          var hx = this.hx, hy = this.hy;
          if (this.invT <= 0 || Math.floor(this.invT * 9) % 2 === 0) {
            g.circle(hx, hy - 10, 7, C.ash);
            g.rect(hx - 5, hy - 4, 10, 14, C.silver);
            g.circle(hx - 2, hy - 13, 2, '#060404');
            g.circle(hx + 2, hy - 13, 2, '#060404');
            // Candle
            g.rect(hx + 9,  hy - 10, 4, 8, C.amber);
            c.globalAlpha = 0.12;
            c.fillStyle = C.amberL;
            c.beginPath(); c.arc(hx + 11, hy - 8, 16, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          }
          api.topBar('PAGES: ' + this.got + '/' + this.need);
          for (var ll = 0; ll < 3; ll++) g.circle(W - 38 + ll * 13, 20, 4, ll < this.lives ? C.blood : C.dark);
          api.vignette();
        },
      },

      /* ==============================================================
       * 3. THE DEMETER — tap coffin lids shut (12 needed, 3 breaches)
       * ============================================================== */
      {
        id: 'demeter',
        name: 'THE DEMETER',
        sub: 'THE PLAGUE SHIP',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Coffin
          g.rect(x - 7,  y - 10, 14, 20, C.stone);
          g.rect(x - 9,  y - 6,  18,  5, C.stone);
          g.rect(x - 1,  y - 8,  2,   8, C.dark);
          g.rect(x - 4,  y - 5,  8,   2, C.dark);
          // Lid ajar top
          g.rect(x - 7, y - 10, 14, 4, C.shadow);
        },
        intro: [
          'THE SCHOONER DEMETER',
          'SAILS FOR WISBORG.',
          'One by one the sailors',
          'fall. Strange boxes',
          'fill the hold — and',
          'something stirs inside.',
        ],
        quote: '"One by one my brave crew fell, till I, the captain, was alone aboard. He must not escape!" — Demeter\'s log',
        help: 'TAP coffin lids to SEAL them before Orlok rises!',
        winText: 'All lids sealed. The Demeter drifted into Wisborg harbour with no one left alive.',
        loseText: 'Three coffins burst open. A shape rose into the night mist.',
        init(api) {
          this.coffins   = [];
          this.sealed    = 0;
          this.need      = 12;
          this.breaches  = 0;
          this.maxBreach = 3;
          this.spawnT    = 0;
          this.timer     = 0;
          this.slots = [
            { x: 46,  y: 206 }, { x: 135, y: 206 }, { x: 224, y: 206 },
            { x: 46,  y: 306 }, { x: 135, y: 306 }, { x: 224, y: 306 },
          ];
          this.occ = [false, false, false, false, false, false];
        },
        update(api, dt) {
          this.timer += dt;
          this.spawnT -= dt;
          var interval = Math.max(0.65, 1.9 - this.timer * 0.06);
          if (this.spawnT <= 0 && this.coffins.length < 4) {
            this.spawnT = interval;
            var free = [];
            for (var fi = 0; fi < this.occ.length; fi++) { if (!this.occ[fi]) free.push(fi); }
            if (free.length > 0) {
              var slot = free[randI(0, free.length - 1)];
              this.occ[slot] = true;
              var life = 2.1 + Math.random() * 1.0;
              this.coffins.push({ slot: slot, life: life, maxLife: life, t: 0, shut: false, exitT: 0 });
            }
          }
          for (var ci = this.coffins.length - 1; ci >= 0; ci--) {
            var co = this.coffins[ci];
            co.t += dt;
            if (co.shut) {
              co.exitT += dt;
              if (co.exitT > 0.42) { this.occ[co.slot] = false; this.coffins.splice(ci, 1); }
              continue;
            }
            co.life -= dt;
            if (co.life <= 0) {
              this.breaches++;
              this.occ[co.slot] = false;
              this.coffins.splice(ci, 1);
              api.audio.sfx('hurt'); api.shake(5, 0.22); api.flash(C.blood, 0.24);
              if (this.breaches >= this.maxBreach) { api.lose(); return; }
            }
          }
          if (api.pointer.justDown) {
            var px = api.pointer.x, py = api.pointer.y;
            for (var si = 0; si < this.coffins.length; si++) {
              var co2 = this.coffins[si];
              if (co2.shut) continue;
              var s = this.slots[co2.slot];
              if (Math.abs(px - s.x) < 32 && Math.abs(py - s.y) < 38) {
                co2.shut = true;
                this.sealed++;
                api.score += 50;
                api.audio.sfx('coin');
                api.burst(s.x, s.y - 12, C.bone, 10);
                if (this.sealed >= this.need) { api.score += 100; api.win(); return; }
                break;
              }
            }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          // Black night ocean
          c.fillStyle = C.black; c.fillRect(0, 0, W, H);
          // Moon reflection ribbon on water
          c.globalAlpha = 0.18;
          c.fillStyle = C.moonL;
          c.beginPath(); c.ellipse(W * 0.72, H * 0.84, 26, 90, 0, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          // Wave lines
          for (var wy = Math.floor(H * 0.72); wy < H; wy += 16) {
            c.globalAlpha = 0.06;
            c.strokeStyle = C.silver; c.lineWidth = 1;
            c.beginPath();
            for (var wx = 0; wx < W; wx += 8) {
              if (wx === 0) c.moveTo(wx, wy + Math.sin(wx * 0.09 + t * 1.1) * 3);
              else c.lineTo(wx, wy + Math.sin(wx * 0.09 + t * 1.1) * 3);
            }
            c.stroke();
          }
          c.globalAlpha = 1;
          // Ship deck planks
          g.rect(0, 162, W, H - 162, C.shadow);
          c.strokeStyle = C.dark; c.lineWidth = 1;
          for (var dpx = 0; dpx < W; dpx += 34) { c.beginPath(); c.moveTo(dpx, 162); c.lineTo(dpx, H); c.stroke(); }
          for (var dpy = 162; dpy < H; dpy += 18) { c.beginPath(); c.moveTo(0, dpy); c.lineTo(W, dpy); c.stroke(); }
          // Mast + torn sail
          g.rect(W / 2 - 3, 18, 6, 144, C.stone);
          g.rect(W / 2 - 38, 50, 76, 4, C.dark);
          c.fillStyle = C.shadow;
          c.beginPath();
          c.moveTo(W / 2 - 36, 54); c.lineTo(W / 2 + 36, 54);
          c.lineTo(W / 2 + 28, 142); c.lineTo(W / 2 - 20, 142);
          c.closePath(); c.fill();
          // Coffin slots (always drawn as base)
          for (var si2 = 0; si2 < this.slots.length; si2++) {
            var sl = this.slots[si2];
            g.rect(sl.x - 26, sl.y - 34, 52, 60, C.dark);
            g.rectO(sl.x - 26, sl.y - 34, 52, 60, C.stone, 1);
            g.rect(sl.x - 20, sl.y - 28, 40, 48, C.shadow);
            g.rect(sl.x - 24, sl.y - 16, 48,  8, C.shadow);
          }
          // Active coffins
          for (var ci2 = 0; ci2 < this.coffins.length; ci2++) {
            var co3 = this.coffins[ci2];
            var sl2 = this.slots[co3.slot];
            if (co3.shut) {
              var fade = Math.max(0, 1 - co3.exitT * 2.5);
              c.globalAlpha = fade;
              api.txtC('SEALED!', sl2.x, sl2.y - 44, 8, C.bone, true);
              c.globalAlpha = 1;
              continue;
            }
            // Life bar
            var lr = co3.life / co3.maxLife;
            g.rect(sl2.x - 22, sl2.y - 42, 44, 4, C.dark);
            g.rect(sl2.x - 22, sl2.y - 42, Math.round(44 * lr), 4, lr > 0.42 ? C.silver : C.blood);
            // Lid rotating open
            var openFrac = Math.min(1, co3.t * 1.7);
            c.save();
            c.translate(sl2.x, sl2.y - 28);
            c.rotate(-openFrac * 0.85);
            c.fillStyle = C.stone;
            c.fillRect(-20, 0, 40, 10);
            c.strokeStyle = C.grey; c.lineWidth = 1; c.strokeRect(-20, 0, 40, 10);
            c.restore();
            // Orlok rising
            c.globalAlpha = openFrac * 0.88;
            var ry = sl2.y - openFrac * 30;
            g.rect(sl2.x - 8, ry, 16, 22, C.dark);
            g.circle(sl2.x, ry - 8, 8, C.shadow);
            g.circle(sl2.x - 3, ry - 9, 2, C.blood);
            g.circle(sl2.x + 3, ry - 9, 2, C.blood);
            c.globalAlpha = 1;
          }
          api.topBar('SEALED: ' + this.sealed + '/' + this.need);
          for (var bl = 0; bl < this.maxBreach; bl++) {
            g.circle(W - 42 + bl * 14, 20, 5, bl < this.breaches ? C.blood : C.dark);
          }
          api.vignette();
        },
      },

      /* ==============================================================
       * 4. THE SHADOW — timing beat: guide shadow up 5 stair steps
       * ============================================================== */
      {
        id: 'shadow',
        name: 'THE SHADOW',
        sub: 'THE STAIRCASE ASCENDS',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Stair steps
          for (var si = 0; si < 4; si++) {
            g.rect(x - 12 + si * 6, y + 4 - si * 5, 18, 4, C.stone);
          }
          // Reaching hand shadow
          g.rect(x + 2, y - 12, 4, 12, C.shadow);
          g.rect(x - 2, y - 12, 3,  4, C.dark);
          g.rect(x + 6, y - 10, 3,  7, C.dark);
        },
        intro: [
          'COUNT ORLOK',
          'APPROACHES ELLEN.',
          'His shadow climbs',
          'the stairs before him',
          '— a dark omen',
          'creeping ever upward.',
        ],
        quote: '"His shadow touched her door, and Ellen felt his presence through the wood." — intertitle',
        help: 'TAP when the shadow reaches each STEP mark!',
        winText: 'The shadow faltered on the final stair. Ellen had set the trap. Now she waited for dawn.',
        loseText: 'The shadow reached the top. The door creaked open slowly.',
        init(api) {
          this.step    = 0;
          this.need    = 5;
          this.misses  = 0;
          this.maxMiss = 3;
          this.needle  = 0;
          this.nDir    = 1;
          this.nSpd    = 0.70;
          this.pause   = 0;
          this.result  = null;
        },
        update(api, dt) {
          if (this.pause > 0) { this.pause -= dt; return; }
          this.needle += this.nDir * this.nSpd * 0.032 * dt * 60;
          if (this.needle > 1) { this.needle = 1; this.nDir = -1; }
          if (this.needle < 0) { this.needle = 0; this.nDir = 1; }
          if (api.confirm()) {
            var zone = Math.max(0.065, 0.16 - this.step * 0.018);
            var off  = Math.abs(this.needle - 0.5);
            if (off < zone) {
              this.step++;
              this.result = 'hit';
              api.audio.sfx('power');
              api.burst(api.W / 2, api.H - 80 - this.step * 52, C.blood, 12);
              api.shake(3, 0.14);
              this.nSpd = Math.min(2.6, this.nSpd + 0.26);
              this.pause = 0.38;
              if (this.step >= this.need) { api.score += 180; api.win(); }
            } else {
              this.misses++;
              this.result = 'miss';
              api.audio.sfx('hurt');
              api.shake(5, 0.22);
              this.pause = 0.38;
              if (this.misses >= this.maxMiss) { api.lose(); }
            }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          // Stone corridor wall
          c.fillStyle = C.ink; c.fillRect(0, 0, W, H);
          c.strokeStyle = C.shadow; c.lineWidth = 0.5;
          for (var row = 0; row < 14; row++) {
            for (var col = 0; col < 6; col++) {
              c.fillStyle = row % 3 === 1 ? '#0c0a08' : C.ink;
              c.fillRect(col * 46, row * 36, 45, 35);
              c.strokeRect(col * 46, row * 36, 45, 35);
            }
          }
          // Five stair steps ascending left
          for (var st = 0; st < 5; st++) {
            var sy = H - 56 - st * 52;
            var sx = W / 2 - 64 + st * 6;
            g.rect(sx, sy, 148, 52, C.dark);
            g.rect(sx, sy, 148,  4, C.stone);
            c.strokeStyle = C.shadow; c.lineWidth = 1; c.strokeRect(sx, sy, 148, 52);
          }
          // Completed step shadows
          for (var cs = 0; cs < this.step; cs++) {
            var csy = H - 54 - cs * 52;
            var csx = W / 2 - 64 + cs * 6;
            c.globalAlpha = 0.50 + 0.12 * Math.sin(t * 2.0 + cs);
            c.fillStyle = C.shadow;
            c.fillRect(csx + 42, csy - 30, 64, 30);
            c.beginPath(); c.ellipse(csx + 84, csy - 40, 18, 22, 0, 0, Math.PI * 2); c.fill();
            c.fillRect(csx + 92, csy - 38, 32, 6);
            c.fillRect(csx + 118, csy - 52, 6, 24);
            c.globalAlpha = 1;
          }
          // Current step shadow (pulsing)
          if (this.step < this.need && this.pause <= 0) {
            var nsy = H - 54 - this.step * 52;
            var nsx = W / 2 - 64 + this.step * 6;
            c.globalAlpha = 0.28 + 0.20 * Math.sin(t * 3.2);
            c.fillStyle = C.shadow;
            c.fillRect(nsx + 42, nsy - 30, 64, 30);
            c.beginPath(); c.ellipse(nsx + 84, nsy - 40, 18, 22, 0, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          }
          // Door at top (goal)
          var dsy = H - 56 - 5 * 52;
          g.rect(W / 2 - 18, dsy - 44, 36, 44, C.dark);
          g.rectO(W / 2 - 18, dsy - 44, 36, 44, C.stone, 1);
          c.beginPath(); c.arc(W / 2, dsy - 44, 18, Math.PI, 0); c.fillStyle = C.dark; c.fill();
          c.strokeStyle = C.stone; c.lineWidth = 1; c.stroke();
          g.circle(W / 2 + 10, dsy - 22, 3, C.grey);
          // Step number badges
          for (var nb = 0; nb < this.need; nb++) {
            var nbs = nb < this.step;
            var bsy = H - 56 - nb * 52;
            var bsx = W / 2 - 64 + nb * 6;
            g.circle(bsx + 14, bsy - 28, 8, nbs ? C.blood : C.stone);
            api.txtC(String(nb + 1), bsx + 14, bsy - 33, 8, nbs ? C.bone : C.grey, true);
          }
          // Timing meter
          var mw = 200, mh = 22, mx = W / 2 - mw / 2, my = H / 2 + 68;
          g.rect(mx, my, mw, mh, '#100c08');
          g.rectO(mx, my, mw, mh, C.stone, 1);
          var zone2 = Math.max(0.065, 0.16 - this.step * 0.018);
          var gz = mw * (0.5 - zone2), gzw = mw * zone2 * 2;
          g.rect(mx + gz, my, gzw, mh, '#320a10');
          c.fillStyle = 'rgba(200,17,34,.22)'; c.fillRect(mx + gz, my, gzw, mh);
          var needleCol = this.pause > 0 ? (this.result === 'hit' ? C.bone : C.blood) : C.ash;
          g.rect(mx + this.needle * mw - 2, my - 5, 4, mh + 10, needleCol);
          api.txtC('TAP WHEN THE SHADOW STEPS', W / 2, my - 14, 6, C.silver, true);
          api.topBar('STEP: ' + this.step + '/' + this.need);
          for (var ml = 0; ml < this.maxMiss; ml++) {
            g.circle(W - 42 + ml * 14, 20, 5, ml < this.misses ? C.blood : C.dark);
          }
          api.vignette();
        },
      },

      /* ==============================================================
       * 5. UNTIL DAWN — tap to repel Orlok until sunrise (28 seconds)
       * ============================================================== */
      {
        id: 'dawn',
        name: 'UNTIL DAWN',
        sub: "ELLEN'S SACRIFICE",
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Rising sun (semicircle above horizon)
          g.circle(x, y + 4, 11, C.amber);
          c.fillStyle = C.ink; c.fillRect(x - 12, y + 4, 24, 12); // horizon cut
          // Rays
          for (var ri = 0; ri < 6; ri++) {
            var ra = ri / 6 * Math.PI;
            var rx = x + Math.cos(ra) * 16, ry = y + 4 - Math.sin(ra) * 14;
            g.rect(rx - 1, ry - 1, 2, 2, C.amberL);
          }
          // Orlok shadow shrinking
          g.rect(x - 8, y - 12, 8, 14, C.shadow);
          g.circle(x - 4, y - 14, 5, C.dark);
        },
        intro: [
          'ELLEN KNOWS THE LORE.',
          'Only a pure woman',
          'who holds the vampire',
          'until sunrise can',
          'destroy him forever.',
          'She must hold. No. Matter. What.',
        ],
        quote: '"She must keep him with her until the first rays of dawn. Then he shall perish." — an old book',
        help: 'TAP to REPEL Orlok · hold your ground until dawn!',
        winText: 'The first shaft of dawn touched Count Orlok. He dissolved into nothing.',
        loseText: 'Ellen fled. Orlok vanished into shadow before the sun could find him.',
        init(api) {
          this.timer    = 0;
          this.dur      = 28;
          this.orlokX   = api.W / 2;
          this.orlokY   = api.H * 0.22;
          this.ellenX   = api.W / 2;
          this.ellenY   = api.H - 82;
          this.touches  = 0;
          this.maxTouch = 3;
          this.invT     = 0;
          this.pushT    = 0;
          this.sunRise  = 0;
        },
        update(api, dt) {
          this.timer += dt;
          if (this.invT > 0) this.invT -= dt;
          if (this.pushT > 0) this.pushT -= dt;
          if (this.timer >= this.dur) { api.score += 200; api.win(); return; }
          this.sunRise = this.timer / this.dur;
          // Orlok drifts toward Ellen, faster as sun nears
          var spd = 22 + this.sunRise * 22;
          var dx = this.ellenX - this.orlokX, dy = this.ellenY - this.orlokY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 2) {
            this.orlokX += (dx / dist) * spd * dt;
            this.orlokY += (dy / dist) * spd * dt;
          }
          // Player taps to repel
          if (api.confirm() && this.pushT <= 0) {
            this.pushT = 0.82;
            // Push Orlok back to upper area, random x
            this.orlokY = Math.max(api.H * 0.1, this.orlokY - 100);
            this.orlokX = api.W / 2 + (Math.random() - 0.5) * 80;
            api.audio.sfx('power');
            api.burst(this.orlokX, this.orlokY + 24, C.bone, 8);
            api.shake(3, 0.12);
          }
          // Orlok reaches Ellen
          if (this.invT <= 0 && dist < 28) {
            this.touches++;
            this.invT = 1.9;
            this.pushT = 0;
            this.orlokY = Math.max(api.H * 0.10, this.orlokY - 130);
            this.orlokX = api.W / 2 + (Math.random() - 0.5) * 70;
            api.shake(8, 0.38); api.flash(C.blood, 0.30); api.audio.sfx('hurt');
            api.burst(this.ellenX, this.ellenY, C.blood, 14);
            if (this.touches >= this.maxTouch) { api.lose(); return; }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          var sr = this.sunRise;
          // Bedroom walls
          c.fillStyle = C.ink; c.fillRect(0, 0, W, H);
          // Wall panels
          for (var row = 0; row < 6; row++) {
            c.fillStyle = row % 2 === 0 ? '#0e0c0a' : C.ink;
            c.fillRect(0, 60 + row * 30, W, 30);
          }
          // Floor boards
          c.strokeStyle = C.shadow; c.lineWidth = 1;
          for (var fpx = 0; fpx < W; fpx += 26) {
            c.beginPath(); c.moveTo(fpx, H - 30); c.lineTo(fpx, H); c.stroke();
          }
          c.fillStyle = C.dark; c.fillRect(0, H - 30, W, 30);
          // Window with sunrise
          var ww = 104, wh = 150, wx = W / 2 - ww / 2, wy = 24;
          // Sky gradient in window
          var r1 = Math.round(6 + sr * 90), g1 = Math.round(2 + sr * 28), b1 = Math.round(2 + sr * 6);
          var r2 = Math.round(16 + sr * 200), g2 = Math.round(6 + sr * 110), b2 = Math.round(2 + sr * 16);
          var skyGrad = c.createLinearGradient(wx, wy, wx, wy + wh);
          skyGrad.addColorStop(0, 'rgb(' + r1 + ',' + g1 + ',' + b1 + ')');
          skyGrad.addColorStop(1, 'rgb(' + r2 + ',' + g2 + ',' + b2 + ')');
          c.fillStyle = skyGrad; c.fillRect(wx, wy, ww, wh);
          // Sun disc rising
          var sunY = wy + wh - sr * (wh + 28);
          c.globalAlpha = Math.min(1, sr * 3.2);
          var sunR = Math.round(200 + sr * 55), sunG = Math.round(120 + sr * 80), sunB = Math.round(20 + sr * 30);
          c.fillStyle = 'rgb(' + sunR + ',' + sunG + ',' + sunB + ')';
          c.beginPath(); c.arc(W / 2, sunY, 26 + sr * 14, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          // Sunlight shaft through window
          if (sr > 0.28) {
            c.globalAlpha = (sr - 0.28) * 0.35;
            c.fillStyle = C.amberL;
            c.beginPath();
            c.moveTo(wx, wy + wh); c.lineTo(wx + ww, wy + wh);
            c.lineTo(W + 20, H); c.lineTo(-20, H);
            c.closePath(); c.fill();
            c.globalAlpha = 1;
          }
          // Window frame
          g.rectO(wx, wy, ww, wh, C.stone, 3);
          g.rect(wx + ww / 2 - 2, wy, 4, wh, C.dark);
          g.rect(wx, wy + wh / 2,  ww, 4,  C.dark);
          // Orlok (shrinks and fades with sunrise)
          var ox = this.orlokX, oy = this.orlokY;
          var shrink = 1.0 - sr * 0.38;
          c.globalAlpha = 0.92 - sr * 0.35;
          c.save();
          c.translate(ox, oy);
          c.scale(shrink, shrink);
          g.rect(-11, 0, 22, 30, C.dark);
          g.circle(0, -10, 11, C.shadow);
          c.fillStyle = C.shadow;
          c.beginPath(); c.moveTo(-8, -18); c.lineTo(-17, -32); c.lineTo(-2, -16); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(8, -18); c.lineTo(17, -32); c.lineTo(2, -16); c.closePath(); c.fill();
          g.circle(-4, -10, 2, C.blood); g.circle(4, -10, 2, C.blood);
          g.rect(-24, 2, 16, 5, C.dark); g.rect(8, 2, 16, 5, C.dark);
          g.rect(-24, -8, 6, 14, C.dark); g.rect(18, -8, 6, 14, C.dark);
          c.restore();
          c.globalAlpha = 1;
          // Push ripple ring
          if (this.pushT > 0.62) {
            c.globalAlpha = (this.pushT - 0.62) * 3.0;
            c.strokeStyle = C.silver; c.lineWidth = 2;
            c.beginPath(); c.arc(ox, oy, (1.0 - this.pushT) * 60 + 8, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }
          // Ellen (player)
          var ex = this.ellenX, ey = this.ellenY;
          if (this.invT <= 0 || Math.floor(this.invT * 9) % 2 === 0) {
            g.rect(ex - 22, ey - 4, 44, 16, C.silver);  // white dress
            g.circle(ex, ey - 12, 9, C.ash);              // head
            g.circle(ex - 2, ey - 15, 2, '#060404');
            g.circle(ex + 2, ey - 15, 2, '#060404');
            g.rect(ex - 24, ey - 6, 8, 4, C.silver);
            g.rect(ex + 16, ey - 6, 8, 4, C.silver);
            // Cross/book held up
            g.rect(ex + 22, ey - 16, 3, 14, C.bone);
            g.rect(ex + 18, ey - 11, 11,  3, C.bone);
          }
          // Dawn progress bar
          var bw = 220, bh = 10, bx = W / 2 - bw / 2, by = H - 22;
          g.rect(bx, by, bw, bh, C.dark);
          g.rectO(bx, by, bw, bh, C.stone, 1);
          var pct = Math.round(bw * sr);
          var barR = Math.round(140 + sr * 115), barG = Math.round(80 + sr * 100), barB = 18;
          c.fillStyle = 'rgb(' + barR + ',' + barG + ',' + barB + ')';
          c.fillRect(bx, by, pct, bh);
          api.txtC('DAWN', W / 2, by - 8, 7, C.silver, true);
          // Tap hint when not on cooldown
          if (this.pushT <= 0) {
            c.globalAlpha = 0.55 + 0.45 * Math.sin(t * 3.2);
            api.txtC('TAP TO REPEL!', W / 2, H / 2 + 30, 8, C.silver, true);
            c.globalAlpha = 1;
          }
          api.topBar('HOLD: ' + Math.max(0, Math.ceil(this.dur - this.timer)) + 's');
          for (var tl = 0; tl < this.maxTouch; tl++) {
            g.circle(W - 42 + tl * 14, 20, 5, tl < this.touches ? C.blood : C.dark);
          }
          api.vignette();
        },
      },

    ], // chapters
  }); // RetroSaga.create
})();
