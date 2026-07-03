/* ============================================================================
 * THE METAMORPHOSIS — DIE VERWANDLUNG
 * Franz Kafka's 1915 novella as five distinct mini-games:
 *   1. THE AWAKENING   — dodge falling household items (survive 22s, 3 lives)
 *   2. THE VISITOR     — evade panicking family & clerk (24s, free movement)
 *   3. GRETE'S GIFT    — collect rotten food, avoid fresh (10 scraps, 3 mistakes)
 *   4. THE PERFORMANCE — creep past scanning lodgers to the violin (30s)
 *   5. THE LAST NIGHT  — final slow crawl to the bedroom door before dawn (28s)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ─── Palette ─────────────────────────────────────────────────────────── */
  var C = {
    bg:    '#0d0b09',
    bgD:   '#080604',
    wall:  '#1e1a12',
    wallL: '#2c2618',
    wallP: '#221c30',
    floor: '#161208',
    floorL:'#201a0e',
    floorB:'#2a2418',
    bug:   '#3a4a14',
    bugL:  '#5a6a24',
    bugH:  '#7a8a34',
    leg:   '#2a3a0e',
    amber: '#c88a20',
    amberL:'#e0a830',
    amberD:'#7a5510',
    rot:   '#7a9c2a',
    rotL:  '#9ab840',
    fresh: '#d8b050',
    freshL:'#f0cc68',
    skin:  '#c8a060',
    skinD: '#a07840',
    coat:  '#2a2840',
    coatD: '#1a1828',
    red:   '#882020',
    redL:  '#cc3030',
    cream: '#d0c8a0',
    paper: '#b8a870',
    paperD:'#8a7848',
    grey:  '#888880',
    greyD: '#504840',
    dawn:  '#c09038',
    dawnL: '#e8b050',
    violet:'#504070',
    shadow:'rgba(0,0,0,.70)',
  };

  /* ─── Draw: Gregor the insect ──────────────────────────────────────────── */
  function drawGregor(api, x, y, t, hurt) {
    var g = api.gfx, c = api.ctx;
    if (hurt && Math.sin(t * 18) > 0) return;
    // Abdomen
    c.fillStyle = C.bug;
    c.beginPath(); c.ellipse(x, y + 7, 13, 9, 0, 0, Math.PI * 2); c.fill();
    // Thorax
    c.fillStyle = C.bugL;
    c.beginPath(); c.ellipse(x, y - 1, 10, 7, 0, 0, Math.PI * 2); c.fill();
    // Head
    c.fillStyle = C.bugH;
    c.beginPath(); c.ellipse(x, y - 10, 7, 5, 0, 0, Math.PI * 2); c.fill();
    // Eyes
    g.circle(x - 3, y - 11, 2, C.amber);
    g.circle(x + 3, y - 11, 2, C.amber);
    // Antennae
    c.strokeStyle = C.leg; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(x - 2, y - 14); c.lineTo(x - 10, y - 25); c.stroke();
    c.beginPath(); c.moveTo(x + 2, y - 14); c.lineTo(x + 10, y - 25); c.stroke();
    // Six legs (animated)
    var la = Math.sin(t * 8);
    c.lineWidth = 1.5;
    for (var i = 0; i < 3; i++) {
      var ly = y + i * 7;
      var loff = la * 5 * (i % 2 === 0 ? 1 : -1);
      c.beginPath(); c.moveTo(x - 10, ly); c.lineTo(x - 22, ly + loff + 4); c.stroke();
      c.beginPath(); c.moveTo(x + 10, ly); c.lineTo(x + 22, ly - loff + 4); c.stroke();
    }
  }

  /* ─── Draw: Human NPC ──────────────────────────────────────────────────── */
  function drawHuman(g, c, x, y, t, isClerk) {
    var arm = Math.sin(t * 7) * 8;
    // Body
    g.rect(x - 5, y - 18, 10, 18, isClerk ? '#1a2830' : C.coat);
    // Head
    g.circle(x, y - 22, 7, C.skin);
    if (isClerk) {
      // Clerk: top hat
      g.rect(x - 7, y - 30, 14, 3, '#0e1c28');
      g.rect(x - 5, y - 33, 10, 7, '#0e1c28');
    } else {
      // Family: dark hair
      g.circle(x, y - 26, 5, C.coatD);
    }
    // Panicking arms
    c.strokeStyle = isClerk ? '#1a2830' : C.coat; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x - 5, y - 12); c.lineTo(x - 18, y - 12 + arm); c.stroke();
    c.beginPath(); c.moveTo(x + 5, y - 12); c.lineTo(x + 18, y - 12 - arm); c.stroke();
    // Legs
    var legA = Math.sin(t * 9) * 4;
    g.rect(x - 4, y, 4, 10 + legA, C.coatD);
    g.rect(x + 1, y, 4, 10 - legA, C.coatD);
  }

  /* ─── Room backdrop ─────────────────────────────────────────────────────── */
  function drawRoom(api, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    // Gradient background
    var gr = c.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#0d0b09'); gr.addColorStop(1, '#181208');
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
    // Victorian wallpaper pattern (faint)
    c.globalAlpha = 0.09;
    c.fillStyle = C.wallP;
    for (var wx = 0; wx < W; wx += 24) {
      for (var wy = 0; wy < H - 55; wy += 24) {
        c.fillRect(wx + 8, wy, 8, 3);
        c.fillRect(wx, wy + 8, 3, 8);
        c.fillRect(wx + 16, wy + 16, 3, 3);
      }
    }
    c.globalAlpha = 1;
    // Floor
    g.rect(0, H - 55, W, 55, C.floor);
    g.rect(0, H - 55, W, 2, C.wallL);
    c.strokeStyle = C.floorB; c.lineWidth = 0.8;
    for (var fx = 0; fx < W; fx += 30) { c.beginPath(); c.moveTo(fx, H - 55); c.lineTo(fx, H); c.stroke(); }
    // Baseboard
    g.rect(0, H - 57, W, 4, C.wallL);
    // Window
    var wX = api.W / 2 - 28, wY = 22;
    g.rect(wX, wY, 56, 78, '#141c2a');
    c.strokeStyle = C.wallL; c.lineWidth = 2; c.strokeRect(wX, wY, 56, 78);
    c.strokeStyle = '#202e40'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(wX + 28, wY); c.lineTo(wX + 28, wY + 78); c.stroke();
    c.beginPath(); c.moveTo(wX, wY + 39); c.lineTo(wX + 56, wY + 39); c.stroke();
    // Moonlight shaft
    c.globalAlpha = 0.05;
    c.fillStyle = '#7080a0';
    c.beginPath();
    c.moveTo(wX + 6, wY + 78); c.lineTo(wX - 40, H - 55);
    c.lineTo(wX + 96, H - 55); c.lineTo(wX + 50, wY + 78);
    c.closePath(); c.fill();
    c.globalAlpha = 1;
  }

  /* ─── Emblem: stylized beetle ───────────────────────────────────────────── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    // Abdomen
    c.fillStyle = C.bug;
    c.beginPath(); c.ellipse(cx, cy + 10, 18, 13, 0, 0, Math.PI * 2); c.fill();
    // Thorax
    c.fillStyle = C.bugL;
    c.beginPath(); c.ellipse(cx, cy - 1, 14, 10, 0, 0, Math.PI * 2); c.fill();
    // Head
    c.fillStyle = C.bugH;
    c.beginPath(); c.ellipse(cx, cy - 14, 9, 8, 0, 0, Math.PI * 2); c.fill();
    // Eyes (amber glow)
    g.circle(cx - 4, cy - 15, 3, C.amber);
    g.circle(cx + 4, cy - 15, 3, C.amber);
    // Antennae
    c.strokeStyle = C.leg; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 3, cy - 21); c.lineTo(cx - 15, cy - 35); c.stroke();
    c.beginPath(); c.moveTo(cx + 3, cy - 21); c.lineTo(cx + 15, cy - 35); c.stroke();
    // Six legs
    c.lineWidth = 2;
    for (var i = -1; i <= 1; i++) {
      var ly = cy + 6 + i * 7;
      c.beginPath(); c.moveTo(cx - 14, ly); c.lineTo(cx - 30, ly + 10); c.stroke();
      c.beginPath(); c.moveTo(cx + 14, ly); c.lineTo(cx + 30, ly + 10); c.stroke();
    }
  }

  /* ─── Scenery ───────────────────────────────────────────────────────────── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Dark apartment backdrop
      c.fillStyle = C.bgD; c.fillRect(0, 0, W, H);
      // Faint wallpaper
      c.globalAlpha = 0.07;
      c.fillStyle = C.wallP;
      for (var wx = 0; wx < W; wx += 22) {
        for (var wy = 68; wy < H; wy += 22) {
          c.fillRect(wx + 6, wy, 10, 3);
          c.fillRect(wx, wy + 6, 3, 10);
        }
      }
      c.globalAlpha = 1;
      // Floor plan walls
      c.strokeStyle = '#3a3020'; c.lineWidth = 2.5;
      // Outer apartment boundary
      c.strokeRect(10, 68, 250, 280);
      // Interior vertical divider (between rooms 0&1 and rooms 2&3)
      c.beginPath(); c.moveTo(132, 68); c.lineTo(132, 348); c.stroke();
      // Interior horizontal divider
      c.beginPath(); c.moveTo(10, 192); c.lineTo(260, 192); c.stroke();
      // Doorway cuts (paint over with bg color)
      c.strokeStyle = C.bgD; c.lineWidth = 6;
      c.beginPath(); c.moveTo(132, 118); c.lineTo(132, 145); c.stroke(); // top corridor gap
      c.beginPath(); c.moveTo(55, 192); c.lineTo(82, 192); c.stroke(); // left bottom gap
      c.beginPath(); c.moveTo(175, 192); c.lineTo(202, 192); c.stroke(); // right bottom gap
      c.beginPath(); c.moveTo(132, 232); c.lineTo(132, 258); c.stroke(); // lower corridor gap
      // Lower landing / staircase area
      c.strokeStyle = '#3a3020'; c.lineWidth = 2.5;
      c.beginPath(); c.moveTo(10, 350); c.lineTo(260, 350); c.stroke();
      c.beginPath(); c.moveTo(42, 350); c.lineTo(42, 456); c.stroke();
      c.beginPath(); c.moveTo(228, 350); c.lineTo(228, 456); c.stroke();
      c.beginPath(); c.moveTo(42, 456); c.lineTo(228, 456); c.stroke();
      // Gap from rooms to corridor
      c.strokeStyle = C.bgD; c.lineWidth = 6;
      c.beginPath(); c.moveTo(72, 350); c.lineTo(96, 350); c.stroke();
      c.beginPath(); c.moveTo(164, 350); c.lineTo(188, 350); c.stroke();
      // Amber lamp glows inside each room (subtle)
      var gAlpha = 0.07 + Math.sin(t * 0.9) * 0.02;
      c.globalAlpha = gAlpha;
      c.fillStyle = C.amber;
      g.circle(70, 128, 28, C.amber);
      g.circle(196, 128, 28, C.amber);
      g.circle(70, 270, 22, C.amber);
      g.circle(196, 270, 22, C.amber);
      g.circle(135, 402, 26, C.dawn);
      c.globalAlpha = 1;
      return;
    }

    // Default room backdrop (boot, intro, result, finale, play)
    drawRoom(api, t);
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(8,6,4,.82)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Chapter card positions (apartment floor plan) ─────────────────────── */
  var ROOMS = [
    { x: 13,  y: 70,  w: 116, h: 119 },  // ch1: Bedroom
    { x: 135, y: 70,  w: 122, h: 119 },  // ch2: Parlor
    { x: 13,  y: 195, w: 116, h: 152 },  // ch3: Kitchen
    { x: 135, y: 195, w: 122, h: 152 },  // ch4: Dining room
    { x: 43,  y: 352, w: 184, h: 102 },  // ch5: Hallway / exit
  ];

  /* ─── Chapter icons ─────────────────────────────────────────────────────── */
  var ICONS = [
    // ch1: alarm clock
    function (api, x, y) {
      api.gfx.circle(x, y, 8, C.grey);
      api.gfx.circle(x, y, 6, C.wallL);
      api.ctx.strokeStyle = C.amber; api.ctx.lineWidth = 1.5;
      api.ctx.beginPath(); api.ctx.moveTo(x, y - 4); api.ctx.lineTo(x, y); api.ctx.lineTo(x + 3, y + 2); api.ctx.stroke();
    },
    // ch2: top hat (the chief clerk)
    function (api, x, y) {
      api.gfx.rect(x - 8, y + 2, 16, 3, C.grey);
      api.gfx.rect(x - 5, y - 8, 10, 12, C.grey);
      api.gfx.rect(x - 5, y - 10, 10, 3, C.greyD);
    },
    // ch3: food bowl with rot
    function (api, x, y) {
      var g = api.gfx, c = api.ctx;
      c.fillStyle = C.wallL;
      c.beginPath(); c.ellipse(x, y + 4, 10, 6, 0, 0, Math.PI); c.fill();
      g.circle(x - 4, y + 1, 3, C.rot);
      g.circle(x + 3, y + 2, 3, C.rotL);
      g.circle(x, y - 2, 3, C.rot);
    },
    // ch4: violin (the forbidden music)
    function (api, x, y) {
      var c = api.ctx;
      c.fillStyle = C.fresh;
      c.beginPath(); c.ellipse(x, y - 5, 5, 7, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(x, y + 6, 5, 7, 0, 0, Math.PI * 2); c.fill();
      api.gfx.rect(x - 2, y - 3, 4, 9, C.fresh);
      c.strokeStyle = C.amber; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x, y - 13); c.lineTo(x, y + 14); c.stroke();
    },
    // ch5: dawn light through door
    function (api, x, y) {
      var g = api.gfx, c = api.ctx;
      g.rect(x - 9, y - 8, 18, 18, '#141c2a');
      c.globalAlpha = 0.6;
      c.fillStyle = C.dawnL;
      c.beginPath(); c.ellipse(x, y + 10, 8, 6, 0, Math.PI, 0); c.fill();
      c.globalAlpha = 1;
      c.strokeStyle = C.amberD; c.lineWidth = 1.5;
      c.strokeRect(x - 9, y - 8, 18, 18);
    },
  ];

  /* ─── RetroSaga.create ──────────────────────────────────────────────────── */
  RetroSaga.create({
    id:       'metamorphosis',
    title:    'DIE VERWANDLUNG',
    subtitle: 'THE METAMORPHOSIS',
    currency: 'HOURS',
    accent:   C.amber,
    credit:   'FRANZ KAFKA · 1915',
    bootLine: 'FIVE SCENES FROM AN IMPOSSIBLE MORNING',
    bootCta:  'TAP TO WAKE',
    menuLabel:'THE SAMSA APARTMENT',
    menuHint: 'CHOOSE A SCENE',
    menuDone: 'THE ROOM GROWS STILL AT LAST',
    tagline:  'A POLECAT PRODUCTION',

    screens: {
      win:          C.rot,
      lose:         C.red,
      chapterLabel: C.amber,
      name:         C.amberL,
      sub:          C.grey,
      intro:        C.cream,
      quote:        C.amberD,
      help:         C.paper,
      score:        C.amber,
      cur:          C.amber,
      cta:          C.cream,
      overlay:      'rgba(8,6,4,.86)',
    },

    labels: {
      chapter: 'SCENE',
      score:   'HOURS ENDURED',
      win:     'ANOTHER HOUR SURVIVED',
      lose:    'THE BURDEN IS TOO GREAT',
      cont:    'TAP TO PERSIST',
      finale:  'TAP FOR DAWN',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO WAKE',
    },

    emblem, scenery,
    width: 270, height: 480, parent: '#game',

    finale: [
      'BY MORNING, GREGOR SAMSA',
      'HAS MADE HIS FINAL PEACE.',
      '',
      'THE FAMILY STEPS INTO THE SUN.',
      '',
      '"HE HAD SEEN THAT HE',
      'MUST DISAPPEAR, AND THIS',
      'CONVICTION WAS FIRMER THAN',
      'EVEN HIS SISTER\'S."',
    ],

    /* ─── Menu: apartment floor plan rooms ─────────────────────────────── */
    menu: {
      colors: {
        title:   C.amber,
        label:   C.grey,
        cur:     C.amberL,
        done:    C.rot,
        lock:    '#3a3020',
      },

      layout: function () { return ROOMS; },

      title: function (api, hours) {
        var g = api.gfx, c = api.ctx, W = api.W;
        g.rect(0, 0, W, 68, '#09070400');
        c.fillStyle = '#09070400'; c.fillRect(0, 0, W, 68);
        g.rect(0, 0, W, 68, '#0a0804');
        c.strokeStyle = '#3a3020'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(10, 68); c.lineTo(260, 68); c.stroke();
        api.txtCFit('DIE VERWANDLUNG', W / 2, 7, 9, C.amber, true);
        api.txtCFit('THE METAMORPHOSIS', W / 2, 24, 7, C.paper, true);
        api.txtCFit('HOURS ENDURED  ' + hours, W / 2, 41, 6, C.amberD, true);
        api.txtCFit('THE SAMSA APARTMENT · TAP A SCENE', W / 2, 56, 5, C.greyD, true);
      },

      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done, best = info.best;
        var ch = info.ch, i = info.i;
        var cx = x + w / 2, cy = y + h / 2;

        // Room background
        var bgCol = done ? '#121a0c' : sel ? '#1c1a0e' : '#100e08';
        g.rect(x, y, w, h, bgCol);

        // Subtle wallpaper
        c.globalAlpha = 0.07;
        c.fillStyle = C.wallP;
        for (var rx = x + 4; rx < x + w - 4; rx += 18) {
          for (var ry = y + 4; ry < y + h - 4; ry += 18) {
            c.fillRect(rx + 5, ry, 8, 2);
            c.fillRect(rx, ry + 5, 2, 8);
          }
        }
        c.globalAlpha = 1;

        // Room border
        c.strokeStyle = sel ? C.amber : (done ? '#4a6020' : '#3a3020');
        c.lineWidth = sel ? 2 : 1.5;
        c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

        // Lamp glow in top of room
        c.globalAlpha = 0.10;
        g.circle(cx, y + 16, 14, C.amber);
        c.globalAlpha = 1;

        // Scene number (top-left corner label)
        api.txtCFit('SCENE ' + (i + 1), cx, y + 8, 5, sel ? C.amber : C.amberD, true);

        // Divider line under number
        c.strokeStyle = sel ? C.amberD : '#3a3020'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(x + 10, y + 20); c.lineTo(x + w - 10, y + 20); c.stroke();

        // Chapter name
        api.txtCFit(ch.name, cx, y + 24, 7, sel ? C.amberL : C.paper, true, w - 14);

        // Icon centered
        if (ICONS[i]) ICONS[i](api, cx, cy + 12);

        // Done tick or sub text
        if (done) {
          api.txtCFit('✓ ' + best, cx, y + h - 14, 5, C.rot, true);
        } else {
          api.txtCFit(ch.sub || '', cx, y + h - 14, 5, C.greyD, true, w - 14);
        }

        // Selection: glowing border emphasis
        if (sel) {
          c.globalAlpha = 0.18;
          g.rect(x + 2, y + 2, w - 4, h - 4, C.amber);
          c.globalAlpha = 1;
        }
      },
    },

    chapters: [

      /* ════════════════════════════════════════════════════════════════════
         SCENE 1 — THE AWAKENING
         Gregor wakes transformed. Dodge falling household items for 22s.
         3 lives. Spawn rate increases over time.
       ════════════════════════════════════════════════════════════════════ */
      {
        id: 'awakening', name: 'The Awakening', sub: 'ONE IMPOSSIBLE MORNING',
        intro: [
          'Gregor Samsa woke to find himself',
          'transformed into a monstrous insect.',
          '',
          'His disturbed furniture rattled.',
          'Objects rained down on him.',
          '',
          'Crawl left and right to survive.',
        ],
        quote: '"He lay on his hard, shell-like back, and when he lifted his head a little, he could see his dome-like brown belly." — Kafka',
        help: 'Tap left/right half to move. Dodge the falling objects!',
        winText: 'The room grows quiet.',
        loseText: 'Crushed beneath the ordinary weight of things.',
        icon: function (api, x, y) { ICONS[0](api, x, y); },

        init: function (api) {
          this.timer = 22;
          this.lives = 3;
          this.items = [];
          this.spawnT = 0;
          this.spawnDelay = 1.55;
          this.gx = api.W / 2;
          this.gy = api.H - 42;
          this.hurt = 0;
          this.dodged = 0;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer -= dt;
          if (this.timer <= 0) { api.addScore(this.dodged * 3 + 20); api.win(); return; }

          // Move Gregor
          var spd = 118;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W * 0.44)) this.gx -= spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W * 0.56)) this.gx += spd * dt;
          this.gx = clamp(this.gx, 20, W - 20);

          // Spawn falling items
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var types = ['clock', 'book', 'boot', 'bottle', 'clock'];
            this.items.push({
              x: 24 + Math.random() * (W - 48),
              y: -18,
              spd: 88 + Math.random() * 55,
              r: 10 + Math.random() * 5,
              type: types[Math.floor(Math.random() * types.length)],
            });
            this.spawnT = this.spawnDelay;
            this.spawnDelay = Math.max(0.5, this.spawnDelay - 0.026);
          }

          // Update items and collisions
          this.hurt = Math.max(0, this.hurt - dt);
          for (var ii = this.items.length - 1; ii >= 0; ii--) {
            var item = this.items[ii];
            item.y += item.spd * dt;
            if (item.y > H + 22) {
              this.items.splice(ii, 1);
              this.dodged++;
              api.addScore(5);
              continue;
            }
            if (this.hurt <= 0 &&
                Math.abs(item.x - this.gx) < item.r + 13 &&
                Math.abs(item.y - this.gy) < item.r + 17) {
              this.items.splice(ii, 1);
              this.lives--;
              this.hurt = 1.2;
              api.shake(5, 0.4);
              api.flash(C.red, 0.3);
              api.audio.sfx('hurt');
              api.burst(this.gx, this.gy, C.red, 6);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          drawRoom(api, t);
          api.topBar('SCENE 1  ' + Math.ceil(this.timer) + 's  ' + '♥'.repeat(this.lives));

          // Falling items
          for (var ii = 0; ii < this.items.length; ii++) {
            var item = this.items[ii];
            if (item.type === 'clock') {
              g.circle(item.x, item.y, item.r, C.grey);
              g.circle(item.x, item.y, item.r - 3, C.wallL);
              g.circle(item.x, item.y, 2, C.amber);
              c.strokeStyle = C.amber; c.lineWidth = 1;
              c.beginPath(); c.moveTo(item.x, item.y - 4); c.lineTo(item.x, item.y); c.stroke();
            } else if (item.type === 'book') {
              g.rect(item.x - item.r, item.y - item.r * 0.8, item.r * 2, item.r * 1.6, C.paperD);
              g.rect(item.x - item.r + 2, item.y - item.r * 0.5, item.r * 2 - 4, 2, C.paper);
              g.rect(item.x - item.r + 2, item.y, item.r * 2 - 4, 2, C.paper);
            } else if (item.type === 'boot') {
              g.rect(item.x - 8, item.y - 8, 16, 10, C.coatD);
              g.rect(item.x - 6, item.y + 2, 14, 6, '#120808');
            } else {
              // bottle
              g.rect(item.x - 4, item.y - item.r, 8, item.r * 2, C.grey);
              g.circle(item.x, item.y - item.r + 2, 4, C.grey);
              g.rect(item.x - 2, item.y - item.r - 4, 4, 5, '#a0a090');
            }
          }

          drawGregor(api, this.gx, this.gy, t, this.hurt > 0);
          api.txtCFit('DODGED  ' + this.dodged, W / 2, H - 10, 6, C.amberD, true);
        },
      },

      /* ════════════════════════════════════════════════════════════════════
         SCENE 2 — THE VISITOR
         The chief clerk arrives. Family panics. Avoid 4 NPCs for 24s.
         Free movement (all 4 dirs). 3 lives. NPCs speed up over time.
       ════════════════════════════════════════════════════════════════════ */
      {
        id: 'visitor', name: 'The Visitor', sub: 'PANDEMONIUM',
        intro: [
          'The chief clerk arrived to check',
          'why Gregor had not appeared.',
          '',
          'The family swept into chaos —',
          'shrieking, recoiling, flailing.',
          '',
          'Crawl away from their feet.',
        ],
        quote: '"His mother rushed toward his father with her arms outstretched. The chief clerk let out a low ohh!" — Kafka',
        help: 'Tap to move. Avoid the panicking family and the clerk!',
        winText: 'The room empties. Peace, for a moment.',
        loseText: 'Trampled in the pandemonium.',

        init: function (api) {
          var W = api.W, H = api.H;
          this.timer = 24;
          this.lives = 3;
          this.gx = W / 2;
          this.gy = H - 42;
          this.hurt = 0;
          this.npcs = [
            { x: W * 0.22, y: H * 0.42, vx:  85, vy:  35, isClerk: false, turnT: 0 },
            { x: W * 0.78, y: H * 0.30, vx: -70, vy:  55, isClerk: false, turnT: 0.6 },
            { x: W * 0.50, y: H * 0.55, vx:  95, vy: -40, isClerk: false, turnT: 0.3 },
            { x: W * 0.32, y: H * 0.65, vx: -55, vy:  65, isClerk: true,  turnT: 0.8 },
          ];
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer -= dt;
          if (this.timer <= 0) { api.addScore(60); api.win(); return; }

          // Move Gregor (all 4 directions)
          var spd = 108;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W * 0.4))  this.gx -= spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W * 0.6))  this.gx += spd * dt;
          if (api.keyDown('up')    || (api.pointer.down && api.pointer.y < H * 0.38)) this.gy -= spd * dt;
          if (api.keyDown('down')  || (api.pointer.down && api.pointer.y > H * 0.62)) this.gy += spd * dt;
          this.gx = clamp(this.gx, 16, W - 16);
          this.gy = clamp(this.gy, 56, H - 20);

          // NPCs speed up as panic mounts
          var mult = 1 + (24 - this.timer) * 0.038;
          this.hurt = Math.max(0, this.hurt - dt);

          for (var ni = 0; ni < this.npcs.length; ni++) {
            var npc = this.npcs[ni];
            npc.turnT -= dt;
            if (npc.turnT <= 0) {
              npc.vx = (Math.random() - 0.5) * 170;
              npc.vy = (Math.random() - 0.5) * 130;
              npc.turnT = 0.55 + Math.random() * 0.85;
            }
            npc.x += npc.vx * mult * dt;
            npc.y += npc.vy * mult * dt;
            if (npc.x < 14 || npc.x > W - 14) { npc.vx *= -1; npc.x = clamp(npc.x, 14, W - 14); }
            if (npc.y < 52 || npc.y > H - 18) { npc.vy *= -1; npc.y = clamp(npc.y, 52, H - 18); }

            if (this.hurt <= 0 &&
                Math.abs(npc.x - this.gx) < 22 && Math.abs(npc.y - this.gy) < 26) {
              this.lives--;
              this.hurt = 1.4;
              api.shake(5, 0.4);
              api.flash(C.red, 0.3);
              api.audio.sfx('hurt');
              api.burst(this.gx, this.gy, C.red, 7);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          api.addScore(dt * 3.5);
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          drawRoom(api, t);
          api.topBar('SCENE 2  ' + Math.ceil(this.timer) + 's  ' + '♥'.repeat(this.lives));

          for (var ni = 0; ni < this.npcs.length; ni++) {
            drawHuman(g, c, this.npcs[ni].x, this.npcs[ni].y, t, this.npcs[ni].isClerk);
          }
          drawGregor(api, this.gx, this.gy, t, this.hurt > 0);

          // Progress strip
          c.fillStyle = C.amberD;
          c.fillRect(10, H - 8, (W - 20) * (this.timer / 24), 4);
          c.strokeStyle = C.greyD; c.lineWidth = 1;
          c.strokeRect(10, H - 8, W - 20, 4);
        },
      },

      /* ════════════════════════════════════════════════════════════════════
         SCENE 3 — GRETE'S GIFT
         Sister brings food. Collect rotten scraps (green), avoid fresh (gold).
         10 rot items = win. 3 fresh touches = lose.
       ════════════════════════════════════════════════════════════════════ */
      {
        id: 'gift', name: "Grete's Gift", sub: 'NEW TASTES',
        intro: [
          "His sister Grete slid food under",
          "the door each morning.",
          '',
          'Gregor found he craved only',
          'the rotting, mouldy scraps —',
          'never the clean, fresh things.',
        ],
        quote: '"He hurriedly sucked at the cheese, which attracted him strongly above all other dishes." — Kafka',
        help: 'Crawl to the green rot food. Avoid the golden fresh food!',
        winText: 'The dark scraps satisfy completely.',
        loseText: 'The wrong taste revolts you.',

        init: function (api) {
          this.gx = api.W / 2;
          this.gy = api.H - 42;
          this.collected = 0;
          this.mistakes = 0;
          this.needed = 10;
          this.foods = [];
          this.spawnT = 0;
          this.spawnDelay = 1.15;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;

          // Move Gregor freely
          var spd = 114;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W * 0.4))  this.gx -= spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W * 0.6))  this.gx += spd * dt;
          if (api.keyDown('up')    || (api.pointer.down && api.pointer.y < H * 0.38)) this.gy -= spd * dt;
          if (api.keyDown('down')  || (api.pointer.down && api.pointer.y > H * 0.62)) this.gy += spd * dt;
          this.gx = clamp(this.gx, 16, W - 16);
          this.gy = clamp(this.gy, 56, H - 20);

          // Spawn food items
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var isRot = Math.random() < 0.67;
            this.foods.push({
              x: 24 + Math.random() * (W - 48),
              y: 72 + Math.random() * (H - 130),
              rot: isRot,
              life: isRot ? 5.5 : 7,
            });
            this.spawnT = this.spawnDelay;
          }

          // Check food collection
          for (var fi = this.foods.length - 1; fi >= 0; fi--) {
            var food = this.foods[fi];
            food.life -= dt;
            if (food.life <= 0) { this.foods.splice(fi, 1); continue; }

            if (Math.abs(food.x - this.gx) < 19 && Math.abs(food.y - this.gy) < 19) {
              if (food.rot) {
                this.collected++;
                api.addScore(10);
                api.audio.sfx('coin');
                api.burst(food.x, food.y, C.rot, 7);
              } else {
                this.mistakes++;
                api.audio.sfx('hurt');
                api.flash(C.fresh, 0.3);
                api.shake(3, 0.3);
                api.burst(food.x, food.y, C.fresh, 6);
              }
              this.foods.splice(fi, 1);
              if (this.collected >= this.needed) { api.addScore(50); api.win(); return; }
              if (this.mistakes >= 3) { api.lose(); return; }
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          drawRoom(api, t);
          api.topBar('SCENE 3  ' + this.collected + '/' + this.needed + '  ✗' + this.mistakes + '/3');

          // Food items
          for (var fi = 0; fi < this.foods.length; fi++) {
            var food = this.foods[fi];
            var fade = Math.min(1, food.life * 0.7);
            c.globalAlpha = fade;
            if (food.rot) {
              g.circle(food.x, food.y, 9, C.rot);
              g.circle(food.x - 3, food.y - 2, 4, C.rotL);
              // mould spots
              g.circle(food.x + 3, food.y + 3, 2, '#4a7a10');
            } else {
              g.circle(food.x, food.y, 9, C.fresh);
              g.circle(food.x - 3, food.y - 2, 4, C.freshL);
            }
            c.globalAlpha = 1;
          }

          drawGregor(api, this.gx, this.gy, t, false);

          // Collected bar
          c.fillStyle = C.rot;
          c.fillRect(10, H - 9, (W - 20) * (this.collected / this.needed), 5);
          c.strokeStyle = C.greyD; c.lineWidth = 1;
          c.strokeRect(10, H - 9, W - 20, 5);
        },
      },

      /* ════════════════════════════════════════════════════════════════════
         SCENE 4 — THE PERFORMANCE
         Three lodgers scan the room. Creep past them to hear Grete's violin.
         Lodgers sweep back-and-forth. 3 detections = lose. 30s timer.
       ════════════════════════════════════════════════════════════════════ */
      {
        id: 'performance', name: 'The Performance', sub: 'FORBIDDEN MUSIC',
        intro: [
          'Three lodgers had moved in.',
          'Grete was playing violin.',
          '',
          "Gregor couldn't help himself.",
          'He crept forward, drawn to',
          'the music he no longer deserved.',
        ],
        quote: '"Was he an animal, that music could move him so? He felt as if the way were opening up to him toward the unknown nourishment he craved." — Kafka',
        help: 'Creep slowly toward the violin. Freeze when lodgers face you!',
        winText: 'The music reaches you at last.',
        loseText: 'Spotted. The lodgers recoil in horror.',

        init: function (api) {
          var W = api.W, H = api.H;
          this.timer = 30;
          this.lives = 3;
          this.gx = 22;
          this.gy = H - 42;
          this.tgtX = W - 28;
          this.tgtY = H * 0.4;
          this.detectCool = 0;
          this.hurt = 0;
          this.lodgers = [
            { x: W * 0.35, y: H * 0.42, face: 1,  scanT: 0,   period: 2.2 },
            { x: W * 0.60, y: H * 0.28, face: -1, scanT: 1.1, period: 1.9 },
            { x: W * 0.52, y: H * 0.60, face: 1,  scanT: 0.6, period: 2.6 },
          ];
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer -= dt;
          if (this.timer <= 0) { api.lose(); return; }
          this.detectCool = Math.max(0, this.detectCool - dt);
          this.hurt = Math.max(0, this.hurt - dt);

          // Gregor moves slowly (sneaking)
          var spd = 78;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W * 0.4))  this.gx -= spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W * 0.6))  this.gx += spd * dt;
          if (api.keyDown('up')    || (api.pointer.down && api.pointer.y < H * 0.38)) this.gy -= spd * dt;
          if (api.keyDown('down')  || (api.pointer.down && api.pointer.y > H * 0.62)) this.gy += spd * dt;
          this.gx = clamp(this.gx, 14, W - 14);
          this.gy = clamp(this.gy, 54, H - 18);

          // Reach violin
          var tdx = this.gx - this.tgtX, tdy = this.gy - this.tgtY;
          if (Math.sqrt(tdx * tdx + tdy * tdy) < 24) {
            api.addScore(Math.ceil(this.timer * 4));
            api.audio.sfx('win');
            api.win();
            return;
          }

          // Lodger scanning
          for (var li = 0; li < this.lodgers.length; li++) {
            var l = this.lodgers[li];
            l.scanT += dt;
            if (l.scanT >= l.period) {
              l.face *= -1;
              l.scanT = 0;
              api.audio.sfx('blip');
            }

            // Detection check
            var dx = this.gx - l.x, dy = this.gy - l.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var facingGregor = (l.face > 0 && dx > 0) || (l.face < 0 && dx < 0);
            if (facingGregor && dist < 105 && Math.abs(dy) < 58 && this.detectCool <= 0) {
              this.lives--;
              this.detectCool = 1.8;
              this.hurt = 1.8;
              api.shake(5, 0.4);
              api.flash(C.fresh, 0.35);
              api.audio.sfx('hurt');
              api.burst(this.gx, this.gy, C.fresh, 8);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          drawRoom(api, t);
          api.topBar('SCENE 4  ' + Math.ceil(this.timer) + 's  ' + '♥'.repeat(this.lives));

          // Vision cones
          for (var li = 0; li < this.lodgers.length; li++) {
            var l = this.lodgers[li];
            c.globalAlpha = 0.13;
            c.fillStyle = C.freshL;
            var bx = l.x + l.face * 108;
            c.beginPath();
            c.moveTo(l.x, l.y);
            c.lineTo(bx, l.y - 52);
            c.lineTo(bx, l.y + 52);
            c.closePath(); c.fill();
            c.globalAlpha = 1;
          }

          // Draw lodgers (standing, scanning)
          for (var lii = 0; lii < this.lodgers.length; lii++) {
            var ln = this.lodgers[lii];
            // Body
            g.rect(ln.x - 5, ln.y - 18, 10, 18, '#1a2838');
            g.circle(ln.x, ln.y - 22, 7, C.skin);
            // Top hat
            g.rect(ln.x - 7, ln.y - 30, 14, 3, '#0e1c28');
            g.rect(ln.x - 5, ln.y - 33, 10, 7, '#0e1c28');
            // Legs
            g.rect(ln.x - 4, ln.y, 4, 10, '#141e28');
            g.rect(ln.x + 1, ln.y, 4, 10, '#141e28');
            // Watching eye (amber — in facing direction)
            var eyeX = ln.x + ln.face * 8;
            g.circle(eyeX, ln.y - 23, 2, C.red);
          }

          // Violin target (pulsing amber glow)
          var pulse = 0.45 + Math.sin(t * 4) * 0.25;
          c.globalAlpha = pulse;
          g.circle(this.tgtX, this.tgtY, 16, C.amberD);
          c.globalAlpha = 1;
          api.txtCFit('♪', this.tgtX, this.tgtY - 10, 14, C.amber, false);

          drawGregor(api, this.gx, this.gy, t, this.hurt > 0);

          // Spotted! overlay
          if (this.hurt > 1) {
            api.txtCFit('SPOTTED!', W / 2, H / 2 - 10, 20, C.red, false);
          }
        },
      },

      /* ════════════════════════════════════════════════════════════════════
         SCENE 5 — THE LAST NIGHT
         Gregor's final crawl to his bedroom before dawn. Moves very slowly.
         3 family members patrol. Reach the right side of the screen. 28s timer.
       ════════════════════════════════════════════════════════════════════ */
      {
        id: 'lastnight', name: 'The Last Night', sub: 'FINAL PEACE',
        intro: [
          "Gregor made his decision.",
          "He needed to disappear.",
          '',
          'With his last strength he',
          'crawled across the dark apartment',
          'back toward his empty room.',
        ],
        quote: '"His conviction that he must disappear was, if possible, even firmer than his sister\'s." — Kafka',
        help: 'Crawl right toward your room. Avoid your family. Reach the door.',
        winText: 'The room grows still. At last, at last.',
        loseText: 'Dawn finds Gregor fallen outside his door.',

        init: function (api) {
          var W = api.W, H = api.H;
          this.timer = 28;
          this.lives = 3;
          this.gx = 22;
          this.gy = H / 2;
          this.hurt = 0;
          this.family = [
            { x: W * 0.40, y: H * 0.30, spd: 60, dir: 1 },
            { x: W * 0.62, y: H * 0.62, spd: 72, dir: -1 },
            { x: W * 0.50, y: H * 0.48, spd: 55, dir: 1 },
          ];
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer -= dt;
          if (this.timer <= 0) { api.lose(); return; }

          // Gregor moves very slowly
          var spd = 46;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W * 0.4))  this.gx -= spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W * 0.6))  this.gx += spd * dt;
          if (api.keyDown('up')    || (api.pointer.down && api.pointer.y < H * 0.38)) this.gy -= spd * dt;
          if (api.keyDown('down')  || (api.pointer.down && api.pointer.y > H * 0.62)) this.gy += spd * dt;
          this.gx = clamp(this.gx, 14, W - 14);
          this.gy = clamp(this.gy, 54, H - 18);

          // Win: reach bedroom door on right
          if (this.gx > W - 30) {
            api.addScore(Math.ceil(this.timer * 5));
            api.win();
            return;
          }

          // Family patrols back and forth
          this.hurt = Math.max(0, this.hurt - dt);
          for (var fi = 0; fi < this.family.length; fi++) {
            var fm = this.family[fi];
            fm.x += fm.spd * fm.dir * dt;
            if (fm.x < 20 || fm.x > W - 20) {
              fm.dir *= -1;
              fm.x = clamp(fm.x, 20, W - 20);
            }

            if (this.hurt <= 0 &&
                Math.abs(fm.x - this.gx) < 24 && Math.abs(fm.y - this.gy) < 28) {
              this.lives--;
              this.hurt = 1.6;
              api.shake(4, 0.35);
              api.flash(C.red, 0.25);
              api.audio.sfx('hurt');
              api.burst(this.gx, this.gy, C.red, 6);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          api.addScore(dt * 3);
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          drawRoom(api, t);

          // Dawn light creeping in from the right as timer counts down
          var dawnProg = 1 - this.timer / 28;
          if (dawnProg > 0) {
            c.globalAlpha = dawnProg * 0.32;
            var dawnGr = c.createLinearGradient(W, 0, W - 90, 0);
            dawnGr.addColorStop(0, C.dawn);
            dawnGr.addColorStop(1, 'rgba(0,0,0,0)');
            c.fillStyle = dawnGr;
            c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          api.topBar('SCENE 5  ' + Math.ceil(this.timer) + 's  ' + '♥'.repeat(this.lives));

          // Bedroom door (golden glow on right wall)
          g.rect(W - 24, H / 2 - 42, 24, 84, '#1a1008');
          c.globalAlpha = 0.55 + Math.sin(t * 1.8) * 0.1;
          c.fillStyle = C.dawn;
          c.fillRect(W - 22, H / 2 - 40, 20, 80);
          c.globalAlpha = 1;
          c.strokeStyle = C.amberD; c.lineWidth = 2;
          c.strokeRect(W - 24, H / 2 - 42, 24, 84);
          api.txtCFit('ROOM', W - 12, H / 2 - 8, 5, C.amberL, true);

          // Family members
          for (var fi = 0; fi < this.family.length; fi++) {
            drawHuman(g, c, this.family[fi].x, this.family[fi].y, t, false);
          }

          drawGregor(api, this.gx, this.gy, t, this.hurt > 0);

          // Progress bar toward door
          c.fillStyle = C.amberD;
          c.fillRect(10, H - 9, (W - 20) * (this.gx / (W - 30)), 5);
          c.strokeStyle = C.greyD; c.lineWidth = 1;
          c.strokeRect(10, H - 9, W - 20, 5);
        },
      },
    ],
  });
})();
