/* ============================================================================
 * HEIDI — FIVE ALPINE TALES
 * Johanna Spyri's 1881 novel as five distinct mini-games:
 *   1. THE CLIMB       — dodge falling rocks up the mountain path (survive 24s)
 *   2. GOAT MEADOW     — tap stray goats before 3 escape (collect 14)
 *   3. FRANKFURT SNEAK — avoid Miss Rottenmeier and post Heidi's letter (26s)
 *   4. THE LONGING     — catch golden memories falling from above (12 items)
 *   5. CLARA WALKS     — timing ring: tap at the right moment for 6 steps
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ─── Palette ─────────────────────────────────────────────────────────── */
  var C = {
    sky1:  '#5bc8f5',
    sky2:  '#a8e0f8',
    sky3:  '#daf0fc',
    grass: '#4a9c3c',
    grassL:'#5ab84a',
    grassD:'#3a7a2c',
    mtn:   '#8b9eaa',
    mtn2:  '#a8b8c4',
    snow:  '#e8f4fc',
    rock:  '#8b7355',
    rockD: '#6a5a40',
    wood:  '#a0703a',
    woodD: '#7a5228',
    gold:  '#f5c842',
    goldD: '#d4a020',
    flwr:  '#e84090',
    flwr2: '#ff60a8',
    edelw: '#ffffff',
    heidi: '#e8a870',
    heidD: '#c87848',
    apron: '#4499e8',
    aprnD: '#2266c0',
    goat:  '#e8e0d0',
    goatD: '#c0b898',
    clara: '#f0dcc0',
    claraD:'#d0bc90',
    red:   '#cc2211',
    cream: '#f5ead0',
    grey:  '#888890',
    grey2: '#606068',
    white: '#ffffff',
    frank: '#1a1208',
  };

  /* ─── Shared draw helpers ──────────────────────────────────────────────── */
  function drawMtn(c, x, y, w, h, col) {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x, y + h);
    c.lineTo(x + w / 2, y);
    c.lineTo(x + w, y + h);
    c.closePath();
    c.fill();
  }

  function drawFlower(g, x, y, col) {
    g.circle(x - 4, y, 3, col);
    g.circle(x + 4, y, 3, col);
    g.circle(x, y - 4, 3, col);
    g.circle(x, y + 4, 3, col);
    g.circle(x, y, 3, C.gold);
  }

  function drawGoat(g, x, y, t) {
    g.rect(x - 10, y - 5, 20, 12, C.goat);
    g.rect(x + 8, y - 12, 10, 8, C.goat);
    g.rect(x + 15, y - 10, 2, 2, '#404040');
    g.rect(x + 10, y - 16, 2, 5, C.goatD);
    g.rect(x + 14, y - 16, 2, 5, C.goatD);
    var leg = Math.floor(Math.sin(t * 10 + x * 0.1)) > 0 ? 2 : -2;
    g.rect(x - 6, y + 7, 4, 7 + leg, C.goatD);
    g.rect(x + 2, y + 7, 4, 7 - leg, C.goatD);
    g.rect(x + 8, y + 7, 4, 7 + leg, C.goatD);
    g.rect(x - 12, y - 6, 3, 4, C.goatD);
  }

  function drawHeidi(g, c, x, y, t, flashing) {
    if (flashing) return;
    g.rect(x - 6, y - 14, 12, 14, C.apron);
    g.rect(x - 5, y - 24, 10, 12, C.heidi);
    g.circle(x, y - 30, 9, C.heidi);
    g.rect(x - 9, y - 27, 4, 10, C.goldD);
    g.rect(x + 5, y - 27, 4, 10, C.goldD);
    var leg = Math.sin(t * 8) * 4;
    g.rect(x - 4, y, 4, 8 + leg, C.aprnD);
    g.rect(x + 1, y, 4, 8 - leg, C.aprnD);
    g.rect(x - 5, y + 7 + leg, 5, 3, '#604020');
    g.rect(x + 1, y + 7 - leg, 5, 3, '#604020');
  }

  function drawClara(g, c, x, y, steps) {
    var lean = steps > 0 ? Math.sin(steps * 1.2) * 3 : 0;
    g.rect(x - 6 + lean, y - 14, 12, 14, C.claraD);
    g.rect(x - 5 + lean, y - 24, 10, 12, C.clara);
    g.circle(x + lean, y - 30, 8, C.clara);
    g.rect(x - 7 + lean, y - 33, 14, 4, '#8a5a2a');
    g.rect(x + lean - 4, y, 4, 8, C.claraD);
    g.rect(x + lean + 1, y, 4, 8, C.claraD);
  }

  /* ─── Emblem: edelweiss flower ─────────────────────────────────────────── */
  function emblem(api, cx, cy) {
    var g = api.gfx;
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      g.circle(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11, 5, C.edelw);
    }
    g.circle(cx, cy, 7, C.gold);
    g.circle(cx, cy, 3, '#f0f0f0');
  }

  /* ─── Scenery ───────────────────────────────────────────────────────────── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      /* Sunny Alpine panorama for chapter-select */
      var sky = c.createLinearGradient(0, 0, 0, H * 0.48);
      sky.addColorStop(0, C.sky1);
      sky.addColorStop(1, C.sky3);
      c.fillStyle = sky; c.fillRect(0, 0, W, H);

      /* Sun */
      c.globalAlpha = 1;   g.circle(W * 0.82, 46, 22, '#fff8d0');
      c.globalAlpha = 0.22; g.circle(W * 0.82, 46, 34, '#ffe880');
      c.globalAlpha = 1;

      /* Distant mountains */
      drawMtn(c, -20, 82, 160, 118, C.mtn);
      drawMtn(c, 100, 62, 180, 138, '#9ab0bc');
      drawMtn(c, 160, 92, 140, 108, C.mtn2);
      drawMtn(c, 18, 82, 52, 24, C.snow);
      drawMtn(c, 162, 62, 52, 22, C.snow);

      /* Rolling green hills */
      c.fillStyle = C.grass;
      c.beginPath(); c.moveTo(0, H);
      for (var x = 0; x <= W; x += 5)
        c.lineTo(x, H * 0.44 + Math.sin(x * 0.028 + 0.5) * 18 + Math.sin(x * 0.07) * 8);
      c.lineTo(W, H); c.closePath(); c.fill();

      c.fillStyle = C.grassL;
      c.beginPath(); c.moveTo(0, H);
      for (var x2 = 0; x2 <= W; x2 += 5)
        c.lineTo(x2, H * 0.62 + Math.sin(x2 * 0.04 + 1) * 10);
      c.lineTo(W, H); c.closePath(); c.fill();

      /* Wildflowers */
      var fps = [[28,282],[56,302],[82,278],[112,294],[140,280],
                 [168,298],[196,276],[220,308],[248,286],[264,298]];
      for (var fi = 0; fi < fps.length; fi++) {
        var fc = fi % 3 === 0 ? C.flwr : fi % 3 === 1 ? '#ffe040' : '#cc44cc';
        drawFlower(g, fps[fi][0], fps[fi][1] + Math.sin(t * 0.8 + fi) * 2, fc);
      }

      /* Grandfather's hut silhouette top-right */
      g.rect(196, 64, 48, 34, C.woodD);
      g.rect(192, 62, 56, 5, C.rockD);
      c.fillStyle = '#8b3a18';
      c.beginPath(); c.moveTo(188, 64); c.lineTo(248, 64); c.lineTo(218, 44); c.closePath(); c.fill();
      g.rect(216, 78, 10, 20, '#1a0e08');
      g.rect(200, 70, 10, 10, C.gold);

      /* Wandering goat */
      var gx = 58 + Math.sin(t * 0.4) * 28;
      drawGoat(g, gx, H * 0.68, t);
      return;
    }

    /* Default backdrop: Alpine sky + hills (boot / intro / result / finale / gameplay) */
    var sky2 = c.createLinearGradient(0, 0, 0, H * 0.42);
    sky2.addColorStop(0, C.sky1); sky2.addColorStop(1, C.sky2);
    c.fillStyle = sky2; c.fillRect(0, 0, W, H);

    drawMtn(c, -10, 102, 140, 98, C.mtn);
    drawMtn(c, 120, 82, 160, 118, '#9ab0c0');
    drawMtn(c, 10, 102, 44, 20, C.snow);
    drawMtn(c, 148, 82, 44, 20, C.snow);

    c.fillStyle = C.grassD;
    c.beginPath(); c.moveTo(0, H);
    for (var hx = 0; hx <= W; hx += 5)
      c.lineTo(hx, H * 0.48 + Math.sin(hx * 0.03) * 14);
    c.lineTo(W, H); c.closePath(); c.fill();

    c.fillStyle = C.grass;
    c.fillRect(0, H * 0.52, W, H);

    for (var fj = 0; fj < 7; fj++)
      drawFlower(g, 20 + fj * 36, H * 0.54, fj % 2 === 0 ? C.flwr : C.gold);

    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(10,40,10,.72)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Card layout: zigzag winding Alpine trail (right → left → right …) ── */
  var CARDS = [
    { x: 152, y: 78,  w: 100, h: 58 },  // ch 1 — right
    { x: 18,  y: 152, w: 100, h: 58 },  // ch 2 — left
    { x: 152, y: 226, w: 100, h: 58 },  // ch 3 — right
    { x: 18,  y: 300, w: 100, h: 58 },  // ch 4 — left
    { x: 85,  y: 380, w: 100, h: 58 },  // ch 5 — centre
  ];

  /* ─── Chapter icons ─────────────────────────────────────────────────────── */
  var ICONS = [
    function (api, x, y) {  /* falling rock */
      api.gfx.circle(x, y, 7, C.rock);
      api.gfx.circle(x - 3, y - 3, 3, C.rockD);
    },
    function (api, x, y) {  /* goat horns */
      api.gfx.circle(x, y, 6, C.goat);
      api.gfx.rect(x - 3, y - 10, 2, 5, C.goatD);
      api.gfx.rect(x + 1, y - 10, 2, 5, C.goatD);
    },
    function (api, x, y) {  /* envelope */
      api.gfx.rect(x - 8, y - 5, 16, 12, C.cream);
      api.ctx.strokeStyle = C.goldD; api.ctx.lineWidth = 1;
      api.ctx.beginPath();
      api.ctx.moveTo(x - 8, y - 5); api.ctx.lineTo(x, y + 1); api.ctx.lineTo(x + 8, y - 5);
      api.ctx.stroke();
    },
    function (api, x, y) {  /* wildflower */
      drawFlower(api.gfx, x, y, C.flwr);
    },
    function (api, x, y) {  /* footstep pair */
      api.gfx.circle(x - 4, y + 2, 5, C.flwr2);
      api.gfx.circle(x + 4, y - 4, 5, C.flwr2);
    },
  ];

  /* ─── RetroSaga ─────────────────────────────────────────────────────────── */
  RetroSaga.create({
    id:       'heidi',
    title:    'Heidi',
    subtitle: 'FIVE ALPINE TALES',
    currency: 'EDELWEISS',
    screens: {
      win:          '#4a9c3c',
      lose:         '#cc2211',
      chapterLabel: '#2a6e1a',
      name:         '#f5c842',
      sub:          '#ffffff',
      intro:        '#e8f4f8',
      quote:        '#4a9c3c',
      help:         '#4a9c3c',
      score:        '#f5c842',
      cur:          '#f5c842',
      cta:          '#ffffff',
      overlay:      'rgba(10,40,10,.82)',
    },
    labels: {
      chapter: 'TALE',
      score:   'EDELWEISS GATHERED',
      win:     'THE MOUNTAIN SMILES',
      lose:    'OH DEAR, TRY AGAIN',
      cont:    'TAP TO CONTINUE',
      finale:  'TAP TO DANCE IN THE MEADOW',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO CLIMB',
    },
    accent:    '#f5c842',
    credit:    'HEIDI · JOHANNA SPYRI',
    bootLine:  'FIVE ALPINE TALES · ONE DEAR HOME',
    tagline:   'A POLECAT ADVENTURE',
    emblem, scenery,
    bootCta:   'CLIMB THE ALM',
    menuLabel: 'THE TALES OF HEIDI',
    menuHint:  'CHOOSE YOUR TALE',
    menuDone:  'THE ALM IS YOUR HOME',
    finale: [
      'THE MOUNTAINS RING',
      'WITH LAUGHTER AND JOY.',
      '',
      'HEIDI DANCES IN THE MEADOW',
      'AS CLARA TAKES HER STEPS.',
      '',
      '"NOWHERE IN ALL THE WORLD',
      'IS AS BEAUTIFUL AS THIS."',
    ],
    width: 270, height: 480, parent: '#game',

    /* ─── Chapter-select: wooden Alpine hiking signs on a winding path ───── */
    menu: {
      colors: {
        title: C.white, label: C.grassL, cur: C.gold,
        done: C.grassL, lock: '#4a5a38',
      },

      layout: function () { return CARDS; },

      title: function (api, edelweiss) {
        var g = api.gfx, c = api.ctx, W = api.W;
        /* Wooden top-board */
        g.rect(14, 10, W - 28, 54, C.wood);
        c.globalAlpha = 0.12;
        for (var gi = 0; gi < 3; gi++) g.rect(16, 18 + gi * 12, W - 32, 3, '#000');
        c.globalAlpha = 1;
        c.strokeStyle = C.woodD; c.lineWidth = 2; c.strokeRect(14, 10, W - 28, 54);
        /* Corner nails */
        g.circle(20, 16, 3, '#a08060'); g.circle(W - 20, 16, 3, '#a08060');
        g.circle(20, 60, 3, '#a08060'); g.circle(W - 20, 60, 3, '#a08060');
        /* Flower corners */
        drawFlower(g, 28, 26, C.flwr);   drawFlower(g, W - 28, 26, C.flwr);
        drawFlower(g, 28, 50, C.gold);   drawFlower(g, W - 28, 50, C.gold);
        /* Title */
        api.txtCFit('THE TALES OF HEIDI', W / 2, 18, 7, C.white, true, W - 68);
        api.txtCFit('EDELWEISS  ' + edelweiss, W / 2, 36, 6, C.gold, true, W - 68);
      },

      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i;
        var x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done, best = info.best;
        var cx = x + w / 2, cy = y + h / 2;

        /* Connecting dashed trail to previous card */
        if (i > 0) {
          var prev = CARDS[i - 1];
          var px = prev.x + prev.w / 2, py = prev.y + prev.h / 2;
          c.strokeStyle = C.grassD; c.lineWidth = 3;
          c.setLineDash([6, 6]);
          c.beginPath(); c.moveTo(px, py); c.lineTo(cx, cy); c.stroke();
          c.setLineDash([]);
        }

        /* Wooden sign post */
        g.rect(cx - 3, y + h - 6, 6, 18, C.woodD);

        /* Sign face */
        var bgCol = done ? '#5ab84a' : sel ? '#7acc58' : C.wood;
        g.rect(x, y, w, h, bgCol);
        c.globalAlpha = 0.12;
        for (var gi = 0; gi < 3; gi++) g.rect(x + 3, y + 7 + gi * 12, w - 6, 3, '#000');
        c.globalAlpha = 1;
        c.strokeStyle = done ? C.grassD : sel ? C.gold : C.woodD;
        c.lineWidth = sel ? 3 : 2;
        c.strokeRect(x + 1, y + 1, w - 2, h - 2);

        /* Chapter number */
        api.txtCFit('#' + (i + 1), cx, y + 10, 7, sel ? C.gold : C.cream, true);

        /* Name */
        api.txtCFit(ch.name, cx, y + 24, 6, C.white, true, w - 14);

        /* Icon */
        if (ICONS[i]) ICONS[i](api, cx, y + 40);

        /* Best score */
        if (done && best) {
          api.txtCFit('✓ ' + best, cx, y + h - 8, 5, C.gold, true);
        }

        /* Selection side arrows */
        if (sel) {
          g.rect(x - 9, cy - 4, 7, 8, C.gold);
          g.rect(x + w + 2, cy - 4, 7, 8, C.gold);
        }
      },
    },

    chapters: [
      /* ═══════════════════════════════════════════════════════════════════
         TALE 1 — THE CLIMB
         Dodge falling rocks climbing the steep rocky mountain path.
         Survive 24 seconds, 3 lives, rocks spawn faster over time.
       ═══════════════════════════════════════════════════════════════════ */
      {
        id: 'climb', name: 'The Climb', sub: 'UP TO THE ALM',
        intro: [
          'Aunt Dete leads young Heidi',
          'up the steep mountain path.',
          '',
          'Loose boulders tumble down!',
          'Dodge left and right to reach',
          "Grandfather's hut safely.",
        ],
        quote: '"She scrambled nimbly over the rocks, sure as any mountain goat." — Spyri',
        help: 'Move left and right. Dodge the falling rocks!',
        winText: 'Safe on the Alm!',
        loseText: 'A rock blocked the way…',
        icon: function (api, x, y) { ICONS[0](api, x, y); },

        init: function (api) {
          this.timer = 24;
          this.lives = 3;
          this.rocks = [];
          this.spawnT = 0;
          this.spawnDelay = 1.8;
          this.hx = api.W / 2;
          this.hy = api.H - 80;
          this.hurt = 0;
          this.dodged = 0;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer -= dt;
          if (this.timer <= 0) { api.win(); return; }

          /* Move Heidi */
          var spd = 130;
          var goLeft  = api.input.down('left')  || (api.pointer.down && api.pointer.x < W * 0.44);
          var goRight = api.input.down('right') || (api.pointer.down && api.pointer.x > W * 0.56);
          if (goLeft)  this.hx -= spd * dt;
          if (goRight) this.hx += spd * dt;
          this.hx = clamp(this.hx, 18, W - 18);

          /* Spawn rocks in 5 lanes */
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var lane = Math.floor(Math.random() * 5);
            this.rocks.push({
              x: 20 + lane * 54,
              y: -18,
              spd: 82 + Math.random() * 44,
              r: 10 + Math.random() * 5,
            });
            this.spawnT = this.spawnDelay;
            this.spawnDelay = Math.max(0.6, this.spawnDelay - 0.028);
          }

          /* Update rocks */
          this.hurt = Math.max(0, this.hurt - dt);
          for (var ri = this.rocks.length - 1; ri >= 0; ri--) {
            var r = this.rocks[ri];
            r.y += r.spd * dt;
            if (r.y > H + 24) {
              this.rocks.splice(ri, 1);
              this.dodged++;
              api.addScore(5);
              continue;
            }
            /* Collision */
            if (this.hurt <= 0 &&
                Math.abs(r.x - this.hx) < r.r + 12 &&
                Math.abs(r.y - this.hy) < r.r + 16) {
              this.rocks.splice(ri, 1);
              this.lives--;
              this.hurt = 1.2;
              api.shake(5, 0.4);
              api.flash('#ff4400', 0.3);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          scenery(api, 'game', t);

          /* Rocky path overlay */
          c.fillStyle = '#a08060';
          c.beginPath();
          c.moveTo(W * 0.28, 0); c.lineTo(W * 0.72, 0);
          c.lineTo(W * 0.86, H); c.lineTo(W * 0.14, H);
          c.closePath(); c.fill();
          c.globalAlpha = 0.18;
          for (var pi = 0; pi < 9; pi++) {
            g.rect(W * 0.3 + (pi % 3) * 28, pi * 52, 16, 30, C.rockD);
          }
          c.globalAlpha = 1;

          api.topBar('TALE 1', Math.ceil(this.timer) + 's', '♥'.repeat(this.lives));

          /* Rocks */
          for (var ri = 0; ri < this.rocks.length; ri++) {
            var r = this.rocks[ri];
            g.circle(r.x, r.y, r.r, C.rock);
            g.circle(r.x - 3, r.y - 3, Math.floor(r.r * 0.35), C.rockD);
          }

          /* Heidi */
          var flash = this.hurt > 0 && Math.sin(t * 20) > 0;
          drawHeidi(g, c, this.hx, this.hy, t, flash);

          api.txtCFit('ROCKS DODGED ' + this.dodged, W / 2, H - 10, 6, C.gold, true);
        },
      },

      /* ═══════════════════════════════════════════════════════════════════
         TALE 2 — GOAT MEADOW
         Tap stray goats before 3 escape the mountain pasture.
         Collect 14 goats. 3 escapes = fail.
       ═══════════════════════════════════════════════════════════════════ */
      {
        id: 'goats', name: 'Goat Meadow', sub: 'HERD THE FLOCK',
        intro: [
          'Peter the goatherd is asleep!',
          'The goats are wandering toward',
          'the cliff edge.',
          '',
          'Tap each goat quickly to',
          'startle it back to safety.',
        ],
        quote: '"The goats were Peter\'s whole world." — Spyri',
        help: 'Tap wandering goats to stop them escaping! 3 escapes = fail.',
        winText: 'All safely home, Peter!',
        loseText: 'Three goats gone over the edge!',
        icon: function (api, x, y) { ICONS[1](api, x, y); },

        init: function (api) {
          this.goats = [];
          this.spawnT = 0.6;
          this.spawnDelay = 1.9;
          this.collected = 0;
          this.escaped = 0;
          this.goal = 14;
          this.maxEsc = 3;
          this.gt = 0;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.gt += dt;

          /* Spawn goats from left or right */
          this.spawnT -= dt;
          if (this.spawnT <= 0 && this.goats.length < 6) {
            var side = Math.random() < 0.5 ? 0 : 1;
            var gy = H * 0.36 + Math.random() * H * 0.38;
            var speed = 44 + Math.random() * 24;
            this.goats.push({
              x:      side === 0 ? -14 : W + 14,
              y:      gy,
              vx:     side === 0 ? speed : -speed,
              tapped: false,
              fade:   0,
              age:    0,
            });
            this.spawnT = this.spawnDelay;
            this.spawnDelay = Math.max(0.9, this.spawnDelay - 0.05);
          }

          /* Update goats */
          for (var gi = this.goats.length - 1; gi >= 0; gi--) {
            var gd = this.goats[gi];
            gd.age += dt;

            if (gd.tapped) {
              gd.fade -= dt;
              if (gd.fade <= 0) {
                this.goats.splice(gi, 1);
                this.collected++;
                api.addScore(10);
                api.audio.sfx('coin');
                api.burst(gd.x, gd.y, C.gold, 7);
                if (this.collected >= this.goal) { api.win(); return; }
              }
              continue;
            }

            gd.x += gd.vx * dt;

            if (gd.x < -32 || gd.x > W + 32) {
              this.goats.splice(gi, 1);
              this.escaped++;
              api.flash('#ff4400', 0.2);
              api.audio.sfx('hurt');
              if (this.escaped >= this.maxEsc) { api.lose(); return; }
            }
          }

          /* Tap handling */
          if (api.pointer.justDown) {
            var px = api.pointer.x, py = api.pointer.y;
            for (var gi2 = 0; gi2 < this.goats.length; gi2++) {
              var g2 = this.goats[gi2];
              if (!g2.tapped &&
                  Math.abs(px - g2.x) < 30 && Math.abs(py - g2.y) < 26) {
                g2.tapped = true;
                g2.fade = 0.65;
                api.burst(g2.x, g2.y, C.flwr, 8);
                api.audio.sfx('blip');
                break;
              }
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          scenery(api, 'game', t);

          /* Wooden fence at bottom */
          for (var fi = 0; fi <= 7; fi++) {
            g.rect(fi * 36, H * 0.76, 4, 18, C.woodD);
            if (fi < 7) g.rect(fi * 36 + 4, H * 0.79, 32, 4, C.wood);
          }

          /* Cliff danger zones */
          c.fillStyle = C.rockD;
          c.fillRect(0, H * 0.72, 18, H * 0.28);
          c.fillRect(W - 18, H * 0.72, 18, H * 0.28);

          api.topBar('TALE 2', this.collected + '/' + this.goal, this.escaped + '/' + this.maxEsc + ' ESC');

          /* Goats */
          for (var gi = 0; gi < this.goats.length; gi++) {
            var gd = this.goats[gi];
            var flash = gd.tapped && Math.sin(t * 28) > 0;
            if (!flash) {
              drawGoat(g, gd.x, gd.y, t);
              if (!gd.tapped) {
                c.globalAlpha = 0.42 + 0.28 * Math.sin(t * 3.5);
                c.strokeStyle = C.gold; c.lineWidth = 2;
                c.beginPath(); c.arc(gd.x, gd.y, 24, 0, Math.PI * 2); c.stroke();
                c.globalAlpha = 1;
              }
            }
          }

          /* Escaped markers */
          for (var ei = 0; ei < this.escaped; ei++) {
            g.circle(12 + ei * 20, H - 12, 7, C.red);
          }
        },
      },

      /* ═══════════════════════════════════════════════════════════════════
         TALE 3 — FRANKFURT SNEAK
         Avoid Miss Rottenmeier's vision cone and reach the mailbox.
         Free movement, 26-second timer, 3 lives.
       ═══════════════════════════════════════════════════════════════════ */
      {
        id: 'frankfurt', name: 'Frankfurt Sneak', sub: 'MAIL THE LETTER',
        intro: [
          'In gloomy Frankfurt,',
          'Heidi is desperately homesick.',
          '',
          'She must sneak past',
          'Miss Rottenmeier and post',
          "a letter to Grandfather!",
        ],
        quote: '"She walked straight to the window and gazed out, longing for the mountains." — Spyri',
        help: 'Drag or use arrows. Avoid the housekeeper and reach the mailbox!',
        winText: 'Letter sent! Home soon!',
        loseText: 'Caught by Miss Rottenmeier!',
        icon: function (api, x, y) { ICONS[2](api, x, y); },

        init: function (api) {
          var W = api.W, H = api.H;
          this.hx = W / 2;
          this.hy = H - 82;
          this.timer = 26;
          this.lives = 3;
          this.hurt = 0;
          this.reached = false;
          this.mailX = W - 30;
          this.mailY = H * 0.22;
          /* Miss Rottenmeier patrol */
          this.missPat = 0;
          this.missX = W * 0.5;
          this.coneDir = 0;  /* 0 = facing right, Math.PI = facing left */
          /* Furniture hiding spots */
          this.furniture = [
            { x: 22, y: 118, w: 62, h: 42 },    /* armchair left */
            { x: 148, y: 198, w: 52, h: 62 },   /* wardrobe right-centre */
            { x: 18,  y: 298, w: 72, h: 32 },   /* table left-low */
          ];
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          if (this.reached) return;

          this.timer -= dt;
          if (this.timer <= 0) { api.lose(); return; }

          /* Move Heidi by drag or arrows */
          var spd = 92;
          if (api.pointer.down) {
            var dx = api.pointer.x - this.hx, dy = api.pointer.y - this.hy;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 4) {
              this.hx += (dx / dist) * spd * dt;
              this.hy += (dy / dist) * spd * dt;
            }
          }
          if (api.input.down('left'))  this.hx -= spd * dt;
          if (api.input.down('right')) this.hx += spd * dt;
          if (api.input.down('up'))    this.hy -= spd * dt;
          if (api.input.down('down'))  this.hy += spd * dt;
          this.hx = clamp(this.hx, 14, W - 14);
          this.hy = clamp(this.hy, 56, H - 18);

          /* Miss Rottenmeier patrols horizontally */
          this.missPat += dt;
          this.missX = W * 0.3 + Math.sin(this.missPat * 0.65) * W * 0.24;
          /* Face direction of movement */
          this.coneDir = Math.cos(this.missPat * 0.65) > 0 ? 0 : Math.PI;

          /* Hidden-behind-furniture check */
          var hidden = false;
          for (var fi = 0; fi < this.furniture.length; fi++) {
            var f = this.furniture[fi];
            if (this.hx > f.x - 8 && this.hx < f.x + f.w + 8 &&
                this.hy > f.y - 8 && this.hy < f.y + f.h + 8) {
              hidden = true; break;
            }
          }

          /* Detection cone check */
          this.hurt = Math.max(0, this.hurt - dt);
          var missY = H * 0.34;
          if (!hidden && this.hurt <= 0) {
            var ddx = this.hx - this.missX;
            var ddy = this.hy - missY;
            var ddist = Math.sqrt(ddx * ddx + ddy * ddy);
            var ang = Math.atan2(ddy, ddx);
            var diff = Math.abs(ang - this.coneDir);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;
            if (ddist < 90 && diff < Math.PI * 0.32) {
              this.lives--;
              this.hurt = 1.4;
              api.shake(6, 0.4);
              api.flash('#ff0000', 0.3);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }

          /* Reached mailbox? */
          if (Math.abs(this.hx - this.mailX) < 26 &&
              Math.abs(this.hy - this.mailY) < 26) {
            this.reached = true;
            api.burst(this.mailX, this.mailY, C.flwr, 12);
            api.audio.sfx('win');
            api.addScore(30);
            var self = this;
            window.setTimeout(function () { api.win(); }, 600);
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;

          /* Dark Frankfurt interior */
          c.fillStyle = '#1a1208'; c.fillRect(0, 0, W, H);

          /* Floor planks */
          for (var pi = 0; pi < 10; pi++) {
            g.rect(pi * 28, H * 0.70, 26, H * 0.30, pi % 2 === 0 ? '#3a2810' : '#2e2008');
          }

          /* Dado rail */
          g.rect(0, 0, W, H * 0.07, '#2a1c0c');

          /* Window showing Alpine dream */
          var wx = W - 72, wy = H * 0.08, ww = 62, wh = 82;
          var skg = c.createLinearGradient(wx, wy, wx, wy + wh);
          skg.addColorStop(0, '#2a8adc'); skg.addColorStop(1, '#6ab8f0');
          c.fillStyle = skg; c.fillRect(wx, wy, ww, wh);
          drawMtn(c, wx, wy + 48, ww, 44, C.mtn);
          drawMtn(c, wx + 18, wy + 46, 28, 16, C.snow);
          g.rect(wx - 2, wy - 2, ww + 4, 4, C.woodD);
          g.rect(wx - 2, wy + wh - 2, ww + 4, 4, C.woodD);
          g.rect(wx - 2, wy, 4, wh, C.woodD);
          g.rect(wx + ww - 2, wy, 4, wh, C.woodD);
          g.rect(wx + ww / 2 - 2, wy, 4, wh, C.woodD);

          /* Furniture */
          var fCols = ['#2a1a0c', '#221408', '#382010'];
          for (var fi2 = 0; fi2 < this.furniture.length; fi2++) {
            var f = this.furniture[fi2];
            g.rect(f.x, f.y, f.w, f.h, fCols[fi2]);
            c.strokeStyle = C.woodD; c.lineWidth = 2;
            c.strokeRect(f.x, f.y, f.w, f.h);
          }

          /* Mailbox */
          var mbReached = this.reached;
          g.rect(this.mailX - 14, this.mailY - 16, 28, 22, mbReached ? C.grass : '#880000');
          api.txtCFit('✉', this.mailX, this.mailY - 7, 10, C.cream, true);
          if (!mbReached) {
            c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3.2);
            c.strokeStyle = C.gold; c.lineWidth = 2;
            c.beginPath(); c.arc(this.mailX, this.mailY - 7, 20, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }

          /* Miss Rottenmeier */
          var missY = H * 0.34;
          if (this.hurt <= 0) {
            /* Vision cone */
            c.globalAlpha = 0.22;
            c.fillStyle = '#ffcc00';
            c.beginPath();
            c.moveTo(this.missX, missY);
            c.arc(this.missX, missY, 90, this.coneDir - Math.PI * 0.32, this.coneDir + Math.PI * 0.32);
            c.closePath(); c.fill();
            c.globalAlpha = 1;
          }
          /* Miss body */
          g.rect(this.missX - 8, missY - 24, 16, 24, '#2a0e22');
          g.circle(this.missX, missY - 30, 9, '#e8c8a0');
          g.rect(this.missX - 5, missY - 40, 10, 12, '#1a0c18');
          /* Spectacles */
          c.strokeStyle = '#888'; c.lineWidth = 1;
          c.beginPath();
          c.arc(this.missX - 4, missY - 31, 3, 0, Math.PI * 2);
          c.arc(this.missX + 4, missY - 31, 3, 0, Math.PI * 2);
          c.stroke();
          g.rect(this.missX - 1, missY - 32, 2, 1, '#888');

          /* Heidi */
          var flash = this.hurt > 0 && Math.sin(t * 22) > 0;
          drawHeidi(g, c, this.hx, this.hy, t, flash);

          api.topBar('TALE 3', Math.ceil(this.timer) + 's', '♥'.repeat(this.lives));
        },
      },

      /* ═══════════════════════════════════════════════════════════════════
         TALE 4 — THE LONGING
         Catch golden memories falling from above.
         Collect 12 golden items; 3 grey city catches = fail.
       ═══════════════════════════════════════════════════════════════════ */
      {
        id: 'longing', name: 'The Longing', sub: 'DREAMS OF HOME',
        intro: [
          'In dark Frankfurt, Heidi',
          'dreams of the sunny Alps.',
          '',
          'Golden memories rain down:',
          'wildflowers, goats, starlight.',
          'Catch them — dodge the grey city!',
        ],
        quote: '"The homesickness in her heart was like a stone." — Spyri',
        help: 'Move left and right or drag. Catch the bright golden items, avoid the grey!',
        winText: 'Home fills her heart!',
        loseText: 'The city weighs too heavy…',
        icon: function (api, x, y) { ICONS[3](api, x, y); },

        init: function (api) {
          this.catcher = api.W / 2;
          this.items = [];
          this.spawnT = 1.0;
          this.spawnDelay = 1.5;
          this.caught = 0;
          this.goal = 12;
          this.bad = 0;
          this.maxBad = 3;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;

          /* Move catcher */
          var spd = 158;
          if (api.input.down('left'))  this.catcher -= spd * dt;
          if (api.input.down('right')) this.catcher += spd * dt;
          if (api.pointer.down) this.catcher = api.pointer.x;
          this.catcher = clamp(this.catcher, 26, W - 26);

          /* Spawn items */
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var isGold = Math.random() < 0.65;
            this.items.push({
              x:     22 + Math.random() * (W - 44),
              y:     -22,
              spd:   68 + Math.random() * 42,
              isGold: isGold,
              type:  isGold ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 2),
            });
            this.spawnT = this.spawnDelay;
            this.spawnDelay = Math.max(0.72, this.spawnDelay - 0.035);
          }

          /* Update items */
          var catchY = H - 62;
          for (var ii = this.items.length - 1; ii >= 0; ii--) {
            var item = this.items[ii];
            item.y += item.spd * dt;
            if (item.y > catchY - 12 && item.y < catchY + 16 &&
                Math.abs(item.x - this.catcher) < 32) {
              this.items.splice(ii, 1);
              if (item.isGold) {
                this.caught++;
                api.addScore(10);
                api.burst(item.x, catchY, C.gold, 8);
                api.audio.sfx('coin');
                if (this.caught >= this.goal) { api.win(); return; }
              } else {
                this.bad++;
                api.flash('#884400', 0.28);
                api.audio.sfx('hurt');
                if (this.bad >= this.maxBad) { api.lose(); return; }
              }
              continue;
            }
            if (item.y > H + 14) this.items.splice(ii, 1);
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;

          /* Frankfurt bedroom — dark */
          c.fillStyle = '#0e0c1a'; c.fillRect(0, 0, W, H);

          /* Tiny alpine window showing dream */
          var wx = W * 0.5 - 38, wy = 28, ww = 76, wh = 82;
          var skg2 = c.createLinearGradient(wx, wy, wx, wy + wh);
          skg2.addColorStop(0, '#2880cc'); skg2.addColorStop(1, '#5ab0f0');
          c.fillStyle = skg2; c.fillRect(wx, wy, ww, wh);
          drawMtn(c, wx, wy + 50, ww, 42, C.mtn);
          drawMtn(c, wx + 18, wy + 50, 30, 18, C.snow);
          g.rect(wx - 2, wy - 2, ww + 4, 4, C.woodD);
          g.rect(wx - 2, wy + wh - 2, ww + 4, 4, C.woodD);
          g.rect(wx - 2, wy, 4, wh, C.woodD);
          g.rect(wx + ww - 2, wy, 4, wh, C.woodD);
          g.rect(wx + ww / 2 - 2, wy, 4, wh, C.woodD);

          /* Progress hearts at top */
          for (var hi = 0; hi < this.goal; hi++) {
            g.circle(8 + hi * 13, 8, 4, hi < this.caught ? C.flwr : '#3a3040');
          }

          api.topBar('TALE 4', this.caught + '/' + this.goal, '⚡' + this.bad + '/' + this.maxBad);

          /* Falling items */
          for (var ii = 0; ii < this.items.length; ii++) {
            var item = this.items[ii];
            if (item.isGold) {
              if (item.type === 0) {       /* wildflower */
                drawFlower(g, item.x, item.y, C.flwr);
              } else if (item.type === 1) { /* goat */
                g.circle(item.x, item.y, 8, C.goat);
                g.rect(item.x - 2, item.y - 13, 2, 5, C.goatD);
                g.rect(item.x + 2, item.y - 13, 2, 5, C.goatD);
              } else if (item.type === 2) { /* star */
                c.globalAlpha = 0.9 + 0.1 * Math.sin(t * 9 + ii);
                g.circle(item.x, item.y, 8, C.gold);
                g.rect(item.x - 2, item.y - 10, 4, 20, C.gold);
                g.rect(item.x - 10, item.y - 2, 20, 4, C.gold);
                c.globalAlpha = 1;
              } else {                     /* pine / mountain */
                drawMtn(c, item.x - 9, item.y - 14, 18, 16, C.grassD);
                g.rect(item.x - 2, item.y + 2, 4, 7, C.woodD);
              }
            } else {
              /* Grey city items */
              c.globalAlpha = 0.88;
              g.circle(item.x, item.y, 11, C.grey);
              api.txtCFit('✗', item.x, item.y, 8, '#ccc', true);
              c.globalAlpha = 1;
            }
          }

          /* Catcher — Heidi's apron */
          var cy = H - 62;
          g.rect(this.catcher - 30, cy - 4, 60, 10, C.apron);
          g.rect(this.catcher - 24, cy - 12, 48, 8, C.aprnD);
          g.circle(this.catcher, cy + 16, 12, C.heidi);
          g.rect(this.catcher - 10, cy + 20, 4, 12, C.goldD);
          g.rect(this.catcher + 6,  cy + 20, 4, 12, C.goldD);

          /* Bad item markers */
          for (var bi = 0; bi < this.bad; bi++) {
            g.circle(W - 10 - bi * 16, H - 10, 6, C.red);
          }
        },
      },

      /* ═══════════════════════════════════════════════════════════════════
         TALE 5 — CLARA WALKS
         Timing ring: tap when the contracting ring hits the target zone.
         6 steps to freedom. 4 misses allowed. Ring speeds up each step.
       ═══════════════════════════════════════════════════════════════════ */
      {
        id: 'clara', name: 'Clara Walks', sub: 'THE MIRACLE',
        intro: [
          'Clara has come to the Alps!',
          'In the warm mountain air',
          'she finds new strength.',
          '',
          'Tap at the perfect moment',
          "to encourage Clara's first steps!",
        ],
        quote: '"She rose, drew a long breath, and with a spring stood upright on her own feet." — Spyri',
        help: 'Tap or press A when the ring reaches the pink target to encourage Clara!',
        winText: 'Clara walks! A miracle!',
        loseText: 'Clara lost her courage…',
        icon: function (api, x, y) { ICONS[4](api, x, y); },

        init: function (api) {
          var W = api.W;
          this.steps = 0;
          this.goal = 6;
          this.misses = 0;
          this.maxMiss = 4;
          this.ringR = W * 0.42;
          this.ringSpd = 48;   /* px per second */
          this.targetR = 14;
          this.hitCD = 0;
          this.phase = 'wait';    /* 'wait' | 'step' | 'wobble' */
          this.phaseT = 0;
          this.cx = W / 2;
          this.cy = api.H - 128;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.hitCD = Math.max(0, this.hitCD - dt);
          this.phaseT += dt;

          /* Phase timers */
          if (this.phase === 'step' && this.phaseT > 0.55) {
            this.phase = 'wait'; this.phaseT = 0;
          }
          if (this.phase === 'wobble' && this.phaseT > 0.7) {
            this.phase = 'wait'; this.phaseT = 0;
            this.ringR = W * 0.42; /* fresh ring after wobble */
          }

          /* Ring contracts */
          if (this.phase === 'wait') {
            this.ringR -= this.ringSpd * dt;
            if (this.ringR <= 0) {
              /* Passed through — auto miss */
              this.misses++;
              api.flash('#cc2211', 0.3);
              api.audio.sfx('hurt');
              this.phase = 'wobble'; this.phaseT = 0;
              if (this.misses >= this.maxMiss) { api.lose(); return; }
            }
          }

          /* Tap input */
          var tapped = (api.pointer.justDown || api.input.pressed('a')) &&
                       this.phase === 'wait' && this.hitCD <= 0;
          if (tapped) {
            if (this.ringR <= this.targetR * 3.0) {
              /* Good timing! */
              this.steps++;
              this.ringR = W * 0.42;
              this.ringSpd = Math.min(48 + this.steps * 10, 120);
              api.addScore(15);
              api.burst(this.cx, this.cy, C.flwr2, 10);
              api.audio.sfx('power');
              this.phase = 'step'; this.phaseT = 0;
              this.hitCD = 0.38;
              if (this.steps >= this.goal) { api.win(); return; }
            } else {
              /* Too early */
              this.misses++;
              api.flash('#884400', 0.22);
              api.audio.sfx('blip');
              this.phase = 'wobble'; this.phaseT = 0;
              if (this.misses >= this.maxMiss) { api.lose(); return; }
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          scenery(api, 'game', t);

          /* Extra flowers for celebratory meadow */
          var fxs = [18, 48, 78, 108, 142, 172, 204, 236, 260];
          for (var fi = 0; fi < fxs.length; fi++) {
            drawFlower(g, fxs[fi], H * 0.57 + Math.sin(fi * 1.4) * 7,
                       fi % 2 === 0 ? C.flwr : C.gold);
          }

          /* Ring arena */
          var cx = this.cx, cy = this.cy;

          /* Outer reference ring */
          c.strokeStyle = C.goldD; c.lineWidth = 2; c.globalAlpha = 0.3;
          c.beginPath(); c.arc(cx, cy, W * 0.42, 0, Math.PI * 2); c.stroke();

          /* Target (inner) ring */
          var tPulse = 0.85 + 0.15 * Math.sin(t * 8);
          c.strokeStyle = C.flwr; c.lineWidth = 3 * tPulse; c.globalAlpha = 0.9;
          c.beginPath(); c.arc(cx, cy, this.targetR, 0, Math.PI * 2); c.stroke();
          c.globalAlpha = 1;

          /* Contracting ring */
          var ringClose = this.ringR < this.targetR * 3.2;
          c.strokeStyle = ringClose ? C.flwr : C.gold;
          c.lineWidth = 4 * (0.85 + 0.15 * Math.sin(t * 14));
          c.globalAlpha = ringClose ? 1.0 : 0.75;
          c.beginPath(); c.arc(cx, cy, Math.max(2, this.ringR), 0, Math.PI * 2); c.stroke();
          c.globalAlpha = 1;

          /* Wobble effect */
          var wobble = this.phase === 'wobble' ? Math.sin(this.phaseT * 28) * 5 : 0;

          /* Clara */
          drawClara(g, c, cx + wobble, cy, this.steps);

          /* Heidi encouraging from left */
          drawHeidi(g, c, cx - 56, cy + 8, t, false);

          /* Step progress dots */
          for (var si = 0; si < this.goal; si++) {
            var sx = W / 2 - (this.goal * 14) / 2 + si * 14 + 7;
            g.circle(sx, H - 14, 5, si < this.steps ? C.flwr : '#446644');
          }

          /* Miss indicators */
          for (var mi = 0; mi < this.misses; mi++) {
            g.circle(10 + mi * 14, H - 14, 5, C.red);
          }

          api.topBar('TALE 5', this.steps + '/' + this.goal + ' steps', '✗'.repeat(this.misses));
        },
      },
    ],
  });
})();
