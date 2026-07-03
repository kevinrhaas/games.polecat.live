/* ============================================================================
 * WHITE FANG — WILD BORN · FIRE TAMED
 * Five chapters of Jack London's 1906 tale:
 *   1. BORN OF THE WILD   — wolf cub dodges eagle strikes in the Yukon wild
 *   2. GRAY BEAVER'S CAMP — collect fish while sled dogs hunt you
 *   3. BEAUTY SMITH'S PIT — dodge lunges, counter in the red window
 *   4. THE LOVE-MASTER    — earn Weedon Scott's trust through a timing meter
 *   5. NIGHT OF JIM HALL  — chase the escaped convict to protect the judge
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* paw-print trail node centers for the menu layout (zigzag, bottom→top) */
  var NODE_XY = [
    [75,  420],
    [195, 338],
    [68,  254],
    [198, 170],
    [135,  76],
  ];

  /* ── emblem: wolf-head silhouette ─────────────────────────────────────── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    /* skull / snout */
    g.circle(cx, cy - 10, 14, '#8899aa');
    g.circle(cx, cy + 2,  10, '#8899aa');
    /* ears */
    c.fillStyle = '#8899aa';
    c.beginPath(); c.moveTo(cx - 10, cy - 20); c.lineTo(cx - 18, cy - 34); c.lineTo(cx - 2, cy - 22); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(cx + 10, cy - 20); c.lineTo(cx + 18, cy - 34); c.lineTo(cx + 2,  cy - 22); c.closePath(); c.fill();
    /* inner ear */
    c.fillStyle = '#3a5a78';
    c.beginPath(); c.moveTo(cx - 10, cy - 23); c.lineTo(cx - 15, cy - 32); c.lineTo(cx - 5, cy - 24); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(cx + 10, cy - 23); c.lineTo(cx + 15, cy - 32); c.lineTo(cx + 5,  cy - 24); c.closePath(); c.fill();
    /* eyes */
    g.circle(cx - 6, cy - 12, 3, '#7ac8ff');
    g.circle(cx + 6, cy - 12, 3, '#7ac8ff');
    /* snout highlight */
    g.circle(cx, cy + 3, 5, '#aabbcc');
    g.circle(cx, cy + 1, 2, '#334455');
  }

  /* ── scenery: snowy Yukon night with aurora ───────────────────────────── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    /* night sky */
    var sky = c.createLinearGradient(0, 0, 0, H * 0.72);
    sky.addColorStop(0, '#030810');
    sky.addColorStop(0.55, '#071228');
    sky.addColorStop(1, '#0c1a38');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    /* stars */
    for (var i = 0; i < 44; i++) {
      var sx = (i * 73 + 9)  % W;
      var sy = (i * 47 + 5)  % Math.floor(H * 0.58);
      c.globalAlpha = 0.25 + 0.35 * Math.sin(t * 1.3 + i * 0.9);
      g.rect(sx, sy, 1, 1, '#c8dcf0');
    }
    c.globalAlpha = 1;

    /* aurora borealis — three wavy bands */
    var auro = ['#00cc88', '#1168cc', '#7744bb'];
    for (var b = 0; b < 3; b++) {
      c.globalAlpha = 0.07 + 0.05 * Math.sin(t * 0.38 + b * 1.3);
      c.fillStyle = auro[b];
      c.beginPath();
      c.moveTo(0, 38 + b * 22);
      for (var ax = 0; ax <= W; ax += 16) {
        var ay = 38 + b * 22 + Math.sin(ax * 0.038 + t * 0.44 + b) * 20;
        c.lineTo(ax, ay);
      }
      c.lineTo(W, 0); c.lineTo(0, 0); c.closePath(); c.fill();
    }
    c.globalAlpha = 1;

    /* moon */
    g.circle(W - 42, 38, 14, '#c0d8ee');
    g.circle(W - 38, 34, 11, '#071228');

    /* pine trees on horizon */
    var pineX = [18, 56, 108, 162, 210, 256];
    for (var pi = 0; pi < pineX.length; pi++) {
      var px = pineX[pi], ph = 50 + (pi * 17) % 28;
      c.fillStyle = '#2a1a0c'; c.fillRect(px - 3, H - 62 - ph + 12, 6, ph - 12);
      var lyrs = ['#162c18', '#1e3a20', '#28482a'];
      for (var li = 0; li < 3; li++) {
        var ly2 = H - 62 - ph + li * (ph * 0.28);
        var hw = 14 + li * 4;
        c.fillStyle = lyrs[li];
        c.beginPath(); c.moveTo(px, ly2); c.lineTo(px - hw, ly2 + 22); c.lineTo(px + hw, ly2 + 22); c.closePath(); c.fill();
      }
      /* snow on topmost layer */
      c.fillStyle = '#c8dcf0'; c.fillRect(px - 7, H - 62 - ph, 14, 3);
    }

    /* snow ground */
    c.fillStyle = '#c0d4e8'; c.fillRect(0, H - 62, W, 62);
    c.fillStyle = '#deeeff'; c.fillRect(0, H - 64, W, 4);

    if (scene === 'menu') {
      c.fillStyle = 'rgba(3,8,16,.60)'; c.fillRect(0, 0, W, H);
      /* paw-print trail connecting nodes */
      c.strokeStyle = 'rgba(190,215,240,.30)';
      c.lineWidth = 2; c.setLineDash([4, 6]);
      c.beginPath(); c.moveTo(NODE_XY[0][0], NODE_XY[0][1]);
      for (var ni = 1; ni < NODE_XY.length; ni++) c.lineTo(NODE_XY[ni][0], NODE_XY[ni][1]);
      c.stroke(); c.setLineDash([]);
    } else if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(3,8,16,.74)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ── paw-print helper for menu cards ─────────────────────────────────── */
  function drawPaw(g, cx, cy, col) {
    g.circle(cx,     cy,     5, col);
    g.circle(cx - 6, cy - 7, 3, col);
    g.circle(cx,     cy - 8, 3, col);
    g.circle(cx + 6, cy - 7, 3, col);
  }

  /* ── wolf sprite (shared across chapters) ────────────────────────────── */
  function drawWolf(g, x, y, scale) {
    g.sprite([
      '.ww..',
      'wwwww',
      'wEEww',
      '.www.',
      'w...w',
    ], x, y, { w: '#8899aa', E: '#deeeff' }, scale || 4);
  }

  /* ═══════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id:       'whitefang',
    title:    'WHITE FANG',
    subtitle: 'WILD BORN · FIRE TAMED',
    currency: 'HOWLS',
    accent:   '#7ac8ff',
    credit:   'AFTER JACK LONDON · 1906',
    emblem,
    scenery,
    bootCta:   'TAP TO SURVIVE',
    menuLabel: 'THE YUKON TRAIL',
    menuHint:  'CHOOSE A CHAPTER',
    menuDone:  'THE TRAIL IS BLAZED',

    screens: {
      win:          '#7ac8ff',
      lose:         '#cc2200',
      chapterLabel: '#7898aa',
      name:         '#deeeff',
      sub:          '#5588aa',
      intro:        '#aaccdd',
      quote:        '#7ac8ff',
      help:         '#9bbccc',
      score:        '#deeeff',
      cur:          '#7ac8ff',
      cta:          '#deeeff',
      overlay:      'rgba(3,8,16,.84)',
    },
    labels: {
      chapter: 'CHAPTER',
      score:   'HOWLS EARNED',
      win:     'THE WILD ENDURES',
      lose:    'THE COLD CLAIMS YOU',
      cont:    'TAP TO PRESS ON',
      finale:  'TAP FOR THE FINAL CHAPTER',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO BEGIN',
    },

    /* ── chapter-select menu: zigzag paw-print trail ──────────────────── */
    menu: {
      colors: { title: '#7ac8ff', label: '#7898aa', cur: '#deeeff' },
      layout(api) {
        return NODE_XY.map(function (xy) {
          return { x: xy[0] - 52, y: xy[1] - 34, w: 104, h: 68 };
        });
      },
      card(api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done;

        /* card body — ice-blue panel with snow drift on top */
        var r = 8;
        c.fillStyle = sel ? '#1a3252' : '#0c1e34';
        c.strokeStyle = sel ? '#7ac8ff' : '#1e3e5e';
        c.lineWidth = sel ? 2 : 1;
        c.beginPath();
        c.moveTo(x + r, y); c.lineTo(x + w - r, y);
        c.arcTo(x + w, y, x + w, y + r, r);
        c.lineTo(x + w, y + h - r);
        c.arcTo(x + w, y + h, x + w - r, y + h, r);
        c.lineTo(x + r, y + h);
        c.arcTo(x, y + h, x, y + h - r, r);
        c.lineTo(x, y + r);
        c.arcTo(x, y, x + r, y, r);
        c.closePath(); c.fill(); c.stroke();

        /* snow drift cap */
        c.fillStyle = sel ? '#9bbccc' : '#3a5a78';
        c.beginPath();
        c.moveTo(x + r, y); c.lineTo(x + w - r, y);
        c.arcTo(x + w, y, x + w, y + r, r);
        c.lineTo(x + w, y + 11);
        c.quadraticCurveTo(x + w * 0.72, y + 18, x + w * 0.5, y + 13);
        c.quadraticCurveTo(x + w * 0.28, y + 8,  x, y + 11);
        c.lineTo(x, y + r);
        c.arcTo(x, y, x + r, y, r);
        c.closePath(); c.fill();

        /* paw print icon */
        drawPaw(g, x + 16, y + h / 2, done ? '#7ac8ff' : '#2a4a6e');

        /* text — centered in right portion */
        var tx = x + 32 + (w - 36) / 2;
        api.txtC('CH. ' + (i + 1),    tx, y + 15, 7, done ? '#7ac8ff' : '#3e6080');
        api.txtCFit(ch.name,           tx, y + 31, 7, done ? '#deeeff' : '#6888a8', false, w - 38);
        if (ch.sub) api.txtCFit(ch.sub, tx, y + 49, 6, '#445566', false, w - 38);
        /* snowflake done badge */
        if (done) api.txtC('*', x + w - 11, y + h - 14, 11, '#7ac8ff', true);
      },
    },

    finale: [
      'WHITE FANG ENDURES.',
      'THE WILD IS IN HIS BLOOD',
      'but the fire of love',
      'has tamed his heart.',
      '',
      'THE YUKON IS FREE.',
    ],

    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ═══════════════════════════ 1. BORN OF THE WILD ═══════════════════ */
      {
        id: 'born', name: 'BORN OF THE WILD', sub: 'THE LONE CUB',
        icon(api, x, y) {
          var g = api.gfx;
          /* snowflake */
          g.rect(x - 8, y - 1, 16, 2, '#7ac8ff');
          g.rect(x - 1, y - 8, 2, 16, '#7ac8ff');
          g.rect(x - 6, y - 6, 2, 2,  '#7ac8ff');
          g.rect(x + 4, y - 6, 2, 2,  '#7ac8ff');
          g.rect(x - 6, y + 4, 2, 2,  '#7ac8ff');
          g.rect(x + 4, y + 4, 2, 2,  '#7ac8ff');
        },
        intro: [
          'A SHE-WOLF WATCHES',
          'HER CUB TAKE HIS',
          'FIRST STEPS INTO',
          'the Yukon wild.',
          'Eagles circle above.',
        ],
        quote: '"He did not know the word, but fear was the motif of his life."',
        help: 'DRAG left and right · dodge eagle strikes · survive 24 seconds',
        winText: 'The cub slips into a rock crevice. The eagle screams and wheels away empty.',
        loseText: 'The eagle\'s talons find him. The forest grows very quiet and cold.',
        init(api) {
          this.px    = api.W / 2;
          this.timer = 24; this.lives = 3;
          this.eagles = []; this.spawnT = 1.3;
          this.spd   = 155; this.hurt = 0;
        },
        update(api, dt) {
          var f = dt * 60, W = api.W, H = api.H;
          this.timer -= dt;

          /* move cub */
          if (api.pointer.down) {
            var dx = api.pointer.x - this.px;
            this.px += Math.sign(dx) * Math.min(Math.abs(dx), 215 * dt);
          }
          if (api.keyDown('left'))  this.px -= 3.5 * f;
          if (api.keyDown('right')) this.px += 3.5 * f;
          this.px = clamp(this.px, 16, W - 16);

          /* spawn eagles */
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = 0.6 + Math.random() * 0.55;
            this.eagles.push({ x: 20 + Math.random() * (W - 40), y: -22, hit: false });
          }

          /* move eagles down */
          for (var i = 0; i < this.eagles.length; i++) this.eagles[i].y += this.spd * dt;
          this.spd = Math.min(260, 155 + (24 - Math.max(0, this.timer)) * 4.5);

          /* collision */
          this.hurt -= dt;
          for (var j = 0; j < this.eagles.length; j++) {
            var e = this.eagles[j];
            if (!e.hit && this.hurt <= 0 && Math.abs(e.x - this.px) < 22 && e.y > H - 100 && e.y < H - 52) {
              e.hit = true; this.lives--;
              api.shake(7, 0.3); api.flash('#cc2200', 0.2); api.audio.sfx('hurt');
              this.hurt = 0.9;
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          this.eagles = this.eagles.filter(function (e) { return e.y < H + 24 && !e.hit; });

          api.score = Math.floor((24 - Math.max(0, this.timer)) * 8);
          if (this.timer <= 0) { api.score += 100; api.win(); }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          /* snowy sky */
          var sky = c.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#060c1c'); sky.addColorStop(1, '#1a2840');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);

          /* drifting snow particles */
          for (var i = 0; i < 22; i++) {
            var sx = ((i * 73 + api.t * 15) % (W + 20)) - 5;
            var sy = ((i * 51 + api.t * 19 * (i % 3 === 0 ? 1 : 0.6)) % (H - 60));
            c.globalAlpha = 0.35;
            g.rect(sx, sy, 2, 2, '#deeeff');
          }
          c.globalAlpha = 1;

          /* pine trees */
          var treeX = [22, 80, 150, 215, 258];
          for (var ti = 0; ti < treeX.length; ti++) {
            var tx = treeX[ti], th = 55 + (ti * 13) % 26;
            c.fillStyle = '#2c1c0e'; c.fillRect(tx - 3, H - 64 - th + 14, 6, th - 14);
            c.fillStyle = '#162c18';
            c.beginPath(); c.moveTo(tx, H - 64 - th); c.lineTo(tx - 14, H - 64 - th + 20); c.lineTo(tx + 14, H - 64 - th + 20); c.closePath(); c.fill();
            c.fillStyle = '#1e3a20';
            c.beginPath(); c.moveTo(tx, H - 64 - th + 14); c.lineTo(tx - 18, H - 64 - th + 36); c.lineTo(tx + 18, H - 64 - th + 36); c.closePath(); c.fill();
            c.fillStyle = '#284a28';
            c.beginPath(); c.moveTo(tx, H - 64 - th + 28); c.lineTo(tx - 22, H - 64 - th + 52); c.lineTo(tx + 22, H - 64 - th + 52); c.closePath(); c.fill();
            c.fillStyle = '#c8dcf0'; c.fillRect(tx - 8, H - 64 - th - 2, 16, 3);
          }

          /* snow ground */
          c.fillStyle = '#c0d4e8'; c.fillRect(0, H - 64, W, 64);
          c.fillStyle = '#deeeff'; c.fillRect(0, H - 66, W, 4);

          /* eagle sprites */
          for (var ei = 0; ei < this.eagles.length; ei++) {
            var en = this.eagles[ei];
            if (en.hit) continue;
            var fw = 26 + Math.sin(api.t * 5 + en.x * 0.1) * 4;
            c.fillStyle = '#5a4830';
            /* wings */
            c.beginPath(); c.moveTo(en.x, en.y); c.lineTo(en.x - fw, en.y - 10); c.lineTo(en.x - fw + 8, en.y + 7); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(en.x, en.y); c.lineTo(en.x + fw, en.y - 10); c.lineTo(en.x + fw - 8, en.y + 7); c.closePath(); c.fill();
            /* body */
            g.circle(en.x, en.y, 7, '#3a2c18');
            /* white head */
            g.circle(en.x, en.y - 10, 5, '#d8e8f0');
            /* talons */
            g.rect(en.x - 5, en.y + 6, 2, 9, '#8a7030');
            g.rect(en.x + 3, en.y + 6, 2, 9, '#8a7030');
          }

          /* shadow on snow */
          for (var si = 0; si < this.eagles.length; si++) {
            var ee = this.eagles[si];
            if (ee.hit || ee.y < H * 0.5) continue;
            var sa = (ee.y / H - 0.5) * 0.5;
            var sr = (ee.y / H) * 18;
            c.globalAlpha = sa;
            g.circle(ee.x, H - 60, sr, '#334455');
            c.globalAlpha = 1;
          }

          /* wolf cub */
          var bob = Math.sin(api.t * 7) * 2;
          drawWolf(g, this.px - 10, H - 90 + bob, 4);

          api.topBar('BORN OF THE WILD');
          api.txt('TIME ' + Math.ceil(Math.max(0, this.timer)), 6, 20, 9, '#7ac8ff');
          for (var li = 0; li < 3; li++) g.circle(W - 20 - li * 17, 22, 5, li < this.lives ? '#7ac8ff' : '#0e1a28');
          api.vignette();
        },
      },

      /* ═══════════════════════════ 2. GRAY BEAVER'S CAMP ═════════════════ */
      {
        id: 'camp', name: "GRAY BEAVER'S CAMP", sub: 'THE LAW OF HUNGER',
        icon(api, x, y) {
          var g = api.gfx;
          /* campfire */
          g.circle(x, y + 2, 6, '#c07820');
          g.circle(x, y - 2, 4, '#f0a030');
          g.circle(x, y - 6, 2, '#ffee88');
          g.rect(x - 7, y + 6, 14, 3, '#5a3a1a');
        },
        intro: [
          'WHITE FANG IS CAUGHT',
          'BY GRAY BEAVER.',
          'THE SLED DOGS BULLY.',
          'He must eat to survive.',
        ],
        quote: '"It is not pleasant to be lonely; it is better to knock than be knocked."',
        help: 'DRAG to move · catch fish · avoid sled dogs · 12 fish to survive',
        winText: 'White Fang eats his fill and holds his ground. He begins to learn the camp.',
        loseText: 'The pack drives him back into the snow, cold and starving once more.',
        init(api) {
          this.px = api.W / 2; this.py = api.H - 110;
          this.fish = []; this.fSpawn = 0.9;
          this.dogs = []; this.dSpawn = 2.6;
          this.caught = 0; this.need = 12;
          this.lives = 3; this.hurt = 0; this.speed = 125;
        },
        update(api, dt) {
          var f = dt * 60, W = api.W, H = api.H;

          /* move wolf */
          if (api.pointer.down) {
            var dx = api.pointer.x - this.px;
            var dy = api.pointer.y - this.py;
            this.px += Math.sign(dx) * Math.min(Math.abs(dx), 185 * dt);
            this.py += Math.sign(dy) * Math.min(Math.abs(dy), 185 * dt);
          }
          if (api.keyDown('left'))  this.px -= 3 * f;
          if (api.keyDown('right')) this.px += 3 * f;
          if (api.keyDown('up'))    this.py -= 3 * f;
          if (api.keyDown('down'))  this.py += 3 * f;
          this.px = clamp(this.px, 14, W - 14);
          this.py = clamp(this.py, 60, H - 68);

          /* spawn falling fish */
          this.fSpawn -= dt;
          if (this.fSpawn <= 0 && this.fish.length < 6) {
            this.fSpawn = 0.75 + Math.random() * 0.65;
            this.fish.push({ x: 22 + Math.random() * (W - 44), y: -14, done: false });
          }
          for (var fi = 0; fi < this.fish.length; fi++) this.fish[fi].y += this.speed * dt;

          /* collect fish */
          for (var ci = 0; ci < this.fish.length; ci++) {
            var fi2 = this.fish[ci];
            if (!fi2.done && Math.abs(fi2.x - this.px) < 22 && Math.abs(fi2.y - this.py) < 22) {
              fi2.done = true; this.caught++;
              api.score += 25; api.audio.sfx('coin');
              api.burst(this.px, this.py, '#7ac8ff', 6);
              if (this.caught >= this.need) { api.score += 100; api.win(); return; }
            }
          }
          this.fish = this.fish.filter(function (fi3) { return fi3.y < H + 20 && !fi3.done; });

          /* spawn sled dogs */
          this.dSpawn -= dt;
          if (this.dSpawn <= 0 && this.dogs.length < 2) {
            this.dSpawn = 2.8 + Math.random();
            var side = Math.random() < 0.5 ? 0 : W;
            this.dogs.push({ x: side, y: 80 + Math.random() * (H - 180) });
          }

          /* move dogs toward wolf */
          for (var di = 0; di < this.dogs.length; di++) {
            var d = this.dogs[di];
            var ddx = this.px - d.x, ddy = this.py - d.y;
            var ddist = Math.sqrt(ddx * ddx + ddy * ddy);
            if (ddist > 5) { d.x += (ddx / ddist) * 92 * dt; d.y += (ddy / ddist) * 92 * dt; }
          }
          this.dogs = this.dogs.filter(function (d2) { return d2.x > -30 && d2.x < W + 30; });

          /* dog collision */
          this.hurt -= dt;
          if (this.hurt <= 0) {
            for (var dci = 0; dci < this.dogs.length; dci++) {
              var dc = this.dogs[dci];
              if (Math.abs(dc.x - this.px) < 22 && Math.abs(dc.y - this.py) < 22) {
                this.lives--;
                api.shake(6, 0.28); api.flash('#cc2200', 0.18); api.audio.sfx('hurt');
                this.hurt = 1.1;
                dc.x -= (this.px - dc.x) * 0.6; dc.y -= (this.py - dc.y) * 0.6;
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          /* camp ground */
          c.fillStyle = '#0e1622'; c.fillRect(0, 0, W, H);
          /* dirt/snow patches */
          for (var pi = 0; pi < 5; pi++) {
            c.fillStyle = '#c0d0e0'; c.fillRect(pi * 56 + 4, H - 32, 38, 20);
          }

          /* campfire at top center */
          var fx = W / 2, fy = 86;
          c.globalAlpha = 0.28 + 0.18 * Math.sin(api.t * 5.5);
          g.circle(fx, fy, 32, '#c07820');
          c.globalAlpha = 1;
          g.circle(fx, fy, 13, '#e09020');
          g.circle(fx, fy - 7, 9, '#f0b030');
          g.circle(fx, fy - 14, 5, '#ffee88');
          /* logs */
          g.rect(fx - 18, fy + 8, 36, 5, '#5a3a1a');
          g.rect(fx - 12, fy + 4, 5, 12, '#4a2a0e');
          g.rect(fx + 7,  fy + 4, 5, 12, '#4a2a0e');

          /* fence posts */
          for (var fpi = 0; fpi < 6; fpi++) {
            var fpx = fpi * 52 - 6;
            c.fillStyle = '#3a2a14'; c.fillRect(fpx, H - 58, 7, 28);
            c.fillStyle = '#4a3820'; c.fillRect(fpx, H - 70, 7, 15);
          }
          c.fillStyle = '#5a4828'; c.fillRect(0, H - 54, W, 4);

          /* fish (falling) */
          for (var fsi = 0; fsi < this.fish.length; fsi++) {
            var fs = this.fish[fsi];
            if (fs.done) continue;
            g.sprite(['.ff.','fffb','.ff.'], fs.x - 6, fs.y - 6, { f: '#48b0e0', b: '#0078b0' }, 4);
          }

          /* sled dogs */
          for (var ddi = 0; ddi < this.dogs.length; ddi++) {
            var dd = this.dogs[ddi];
            var dflash = this.hurt > 0 && api.t % 0.22 < 0.11;
            g.sprite(['.dd.','dddd','d..d','d..d'], dd.x - 8, dd.y - 12, { d: dflash ? '#ff6644' : '#aa7744' }, 4);
          }

          /* white fang */
          var wb = Math.sin(api.t * 8) * 1.5;
          drawWolf(g, this.px - 10, this.py - 14 + wb, 4);

          api.topBar("GRAY BEAVER'S CAMP");
          api.txt('FISH ' + this.caught + '/' + this.need, 6, 20, 8, '#7ac8ff');
          for (var lvi = 0; lvi < 3; lvi++) g.circle(W - 20 - lvi * 17, 22, 5, lvi < this.lives ? '#cc3300' : '#1a1e28');
          api.vignette();
        },
      },

      /* ═══════════════════════════ 3. BEAUTY SMITH'S PIT ═════════════════ */
      {
        id: 'pit', name: "BEAUTY SMITH'S PIT", sub: 'THE REIGN OF HATE',
        icon(api, x, y) {
          var g = api.gfx;
          /* crossed claws */
          g.rect(x - 8, y - 8, 3, 16, '#cc2200');
          g.rect(x + 5, y - 8, 3, 16, '#cc2200');
          g.rect(x - 8, y - 8, 16, 3, '#cc2200');
          g.rect(x - 8, y + 5, 16, 3, '#cc2200');
        },
        intro: [
          'BEAUTY SMITH FORCES',
          'WHITE FANG INTO',
          'THE FIGHT PIT.',
          'Defeat three challengers.',
        ],
        quote: '"White Fang was a killer, a thing that preyed, living on the things that lived."',
        help: 'DODGE left/right · TAP in the RED FLASH to counter-attack · beat 3 foes',
        winText: 'Three challengers lie still. White Fang stands alone in the red dust of the pit.',
        loseText: 'The fight drains from his eyes. He lies motionless in the red dust.',
        init(api) {
          this.px   = api.W / 2;
          this.wins = 0;
          this.en   = { hp: 3, cd: 2.0, phase: 'idle', atkX: api.W / 2, atkT: 0 };
          this.myHp = 3; this.hurt = 0;
        },
        update(api, dt) {
          var f = dt * 60, W = api.W, H = api.H;

          /* move white fang */
          if (api.pointer.down) {
            var dx = api.pointer.x - this.px;
            this.px += Math.sign(dx) * Math.min(Math.abs(dx), 240 * dt);
          }
          if (api.keyDown('left'))  this.px -= 4 * f;
          if (api.keyDown('right')) this.px += 4 * f;
          this.px = clamp(this.px, 18, W - 18);

          var en = this.en;

          if (en.phase === 'idle') {
            en.cd -= dt;
            if (en.cd <= 0) {
              /* lock on player, start wind-up */
              en.atkX  = this.px;
              en.atkT  = 0;
              en.phase = 'windup';
              en.cd    = 0.48;
            }
          } else if (en.phase === 'windup') {
            en.cd  -= dt;
            en.atkT += dt;
            /* player can tap to counter during wind-up */
            if (api.confirm()) {
              en.hp--;
              api.score += 65; api.audio.sfx('shoot');
              api.burst(W / 2, 135, '#7ac8ff', 9);
              api.shake(5, 0.22);
              en.phase = 'idle';
              en.cd    = 1.4 + Math.random() * 0.7;
              if (en.hp <= 0) {
                this.wins++;
                if (this.wins >= 3) { api.score += 150; api.win(); return; }
                en.hp  = 3 + this.wins;
                en.cd  = 2.0;
                api.burst(W / 2, H / 2, '#f0a030', 14);
              }
            } else if (en.cd <= 0) {
              /* attack! */
              en.phase = 'lunge';
              en.cd    = 0.32;
            }
          } else if (en.phase === 'lunge') {
            en.cd  -= dt;
            en.atkT += dt;
            /* hit if player still near target x */
            this.hurt -= dt;
            if (this.hurt <= 0 && Math.abs(en.atkX - this.px) < 30) {
              this.myHp--;
              api.shake(8, 0.3); api.flash('#cc2200', 0.26); api.audio.sfx('hurt');
              this.hurt = 1.0;
              if (this.myHp <= 0) { api.lose(); return; }
            }
            if (en.cd <= 0) { en.phase = 'idle'; en.cd = 1.5 + Math.random(); }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var en = this.en;

          /* pit floor */
          c.fillStyle = '#1a0c06'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#3a1a0e'; c.fillRect(0, H - 68, W, 68);
          c.fillStyle = '#5a2818'; c.fillRect(0, H - 70, W, 4);

          /* audience silhouettes at top */
          for (var ai = 0; ai < 8; ai++) {
            var ax = ai * 35 + 8;
            g.circle(ax, 16, 8, '#0c0608');
            c.fillStyle = '#0c0608'; c.fillRect(ax - 5, 20, 10, 24);
          }
          c.fillStyle = '#281010'; c.fillRect(0, 38, W, 5);

          /* torches on sides */
          var torchX = [18, W - 18];
          for (var tqi = 0; tqi < torchX.length; tqi++) {
            var tqx = torchX[tqi];
            c.globalAlpha = 0.32 + 0.16 * Math.sin(api.t * 5 + tqx);
            g.circle(tqx, 62, 26, '#e09820');
            c.globalAlpha = 1;
            g.rect(tqx - 2, 52, 4, 18, '#4a3820');
            g.circle(tqx, 52, 5, '#e09820');
            g.circle(tqx, 46, 3, '#ffee88');
          }

          /* wind-up red flash */
          if (en.phase === 'windup') {
            c.globalAlpha = 0.35 + 0.25 * Math.sin(api.t * 12);
            c.fillStyle = '#cc2200'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
            api.txtC('COUNTER!', W / 2, H / 2 - 22, 12, '#ffcc44', true);
          }

          /* target reticle (where lunge will land) */
          if (en.phase === 'windup' || en.phase === 'lunge') {
            g.rect(en.atkX - 14, H - 70, 28, 3,  '#cc2200');
            g.rect(en.atkX - 2,  H - 82, 4,  26, '#cc2200');
          }

          /* enemy dog */
          var ey = 135;
          if (en.phase === 'lunge') {
            var lp = Math.min(1, en.atkT / 0.28);
            ey = 135 + lp * 90;
          }
          var enCols = ['#aa7744', '#884422', '#cc3322'];
          g.sprite(['.ee.','eeee','e..e','e..e'],
            en.atkX - 8, ey - 10,
            { e: enCols[Math.min(this.wins, 2)] }, 4);

          /* enemy hp pips */
          var maxPips = 3 + this.wins;
          for (var hpi = 0; hpi < maxPips; hpi++) {
            g.rect(W / 2 - maxPips * 9 + hpi * 18, 55, 14, 6, hpi < en.hp ? '#cc2200' : '#2a0e0e');
          }

          /* white fang (player) */
          var wb2 = Math.sin(api.t * 9) * 1.5;
          drawWolf(g, this.px - 10, H - 88 + wb2, 4);

          api.topBar("BEAUTY SMITH'S PIT");
          api.txt('WIN ' + this.wins + '/3', 6, 20, 8, '#e09820');
          for (var hli = 0; hli < 3; hli++) g.circle(W - 20 - hli * 17, 22, 5, hli < this.myHp ? '#7ac8ff' : '#1a1020');
          api.vignette();
        },
      },

      /* ═══════════════════════════ 4. THE LOVE-MASTER ═════════════════════ */
      {
        id: 'scott', name: 'THE LOVE-MASTER', sub: 'WEEDON SCOTT',
        icon(api, x, y) {
          var g = api.gfx;
          /* hand reaching toward wolf */
          g.rect(x - 8, y + 3, 14, 5, '#c8a060');
          g.rect(x - 6, y - 4, 2, 9, '#c8a060');
          g.rect(x - 3, y - 6, 2, 11, '#c8a060');
          g.rect(x,     y - 5, 2, 10, '#c8a060');
          g.rect(x + 3, y - 3, 2, 8,  '#c8a060');
          g.circle(x - 14, y + 4, 4, '#8899aa');
        },
        intro: [
          'WEEDON SCOTT RESCUES',
          'WHITE FANG FROM',
          'BEAUTY SMITH.',
          'Love is patient. Be still.',
        ],
        quote: '"It was the beginning of the end of the old life and the birth of the new."',
        help: 'TAP when the meter is GREEN · pull back when RED · earn 10 trust',
        winText: 'White Fang licks Scott\'s hand. The hatred finally leaves his golden eyes.',
        loseText: 'White Fang snaps and bolts. Scott waits for another day.',
        init(api) {
          this.trust   = 0.5;
          this.dir     = 1;
          this.spd     = 0.30;
          this.earned  = 0; this.need = 10;
          this.miss    = 0;
          this.glow    = 0;
          this.cd      = 0;
          this.band    = 0.27;
        },
        update(api, dt) {
          var f = dt * 60;
          /* oscillate the trust meter */
          this.trust += this.dir * this.spd * 0.026 * f;
          if (this.trust >= 1) { this.trust = 1; this.dir = -1; }
          if (this.trust <= 0) { this.trust = 0; this.dir =  1; }
          this.glow -= dt;
          this.cd   -= dt;

          if (this.cd <= 0 && api.confirm()) {
            if (Math.abs(this.trust - 0.5) < this.band) {
              /* success! */
              this.earned++;
              api.score += 32; api.audio.sfx('coin');
              api.burst(api.W / 2, api.H * 0.52, '#7ac8ff', 8);
              this.glow = 0.35;
              this.spd  = Math.min(1.9, this.spd + 0.08);
              this.band = Math.max(0.10, this.band - 0.015);
              this.cd   = 0.38;
              if (this.earned >= this.need) { api.score += 90; api.win(); }
            } else {
              this.miss++;
              api.shake(4, 0.2); api.audio.sfx('hurt');
              this.glow = -0.35;
              this.cd   = 0.32;
              if (this.miss >= 5) { api.lose(); }
            }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0e1428');

          /* warm log cabin interior */
          for (var ri = 0; ri < 8; ri++) {
            c.fillStyle = ri % 2 === 0 ? '#2a1a0e' : '#342010';
            c.fillRect(0, H * 0.28 + ri * 26, W, 26);
          }
          /* cabin floor */
          c.fillStyle = '#1e1208'; c.fillRect(0, H * 0.62, W, H * 0.38);

          /* fireplace glow (left wall) */
          c.globalAlpha = 0.22 + 0.14 * Math.sin(api.t * 4.5);
          c.fillStyle = '#f0a030'; c.fillRect(0, 0, W, H);
          c.globalAlpha = 1;

          /* Weedon Scott (right side) */
          g.sprite([
            '..pp..',
            '..pp..',
            '.pppp.',
            'pppppp',
            '.p..p.',
            '.p..p.',
          ], W - 58, H * 0.28 + 10, { p: '#c8a060' }, 6);
          /* outstretched hand toward wolf */
          g.sprite(['hhhh','.h..','.h..','.h..'], W / 2 + 18, H * 0.48 + 8, { h: '#c8a060' }, 4);

          /* White Fang (left, cautious) */
          var dist = Math.abs(this.trust - 0.5) < this.band + 0.05 ? 5 : 16;
          drawWolf(g, 42 + dist, H * 0.46, 5);

          /* ── TRUST METER ── */
          var mW = W - 54, mX = 26, mY = H - 92;
          g.rect(mX - 2, mY - 2, mW + 4, 20, '#3a5a78');
          g.rect(mX,     mY,     mW,     16,  '#cc2200');
          /* green safe zone */
          var zL = mX + (0.5 - this.band) * mW;
          g.rect(zL, mY, this.band * 2 * mW, 16, '#22aa44');
          /* needle */
          var needle = mX + this.trust * mW;
          g.rect(needle - 2, mY - 5, 4, 26, '#deeeff');
          api.txtC('TRUST', W / 2, mY - 18, 9, '#7ac8ff', true);

          /* flash overlay on tap */
          if (this.glow > 0) {
            c.globalAlpha = this.glow * 0.75;
            c.fillStyle = '#7ac8ff'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          } else if (this.glow < 0) {
            c.globalAlpha = -this.glow * 0.75;
            c.fillStyle = '#cc2200'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          api.topBar('THE LOVE-MASTER');
          api.txt('EARNED ' + this.earned + '/' + this.need, 6, 20, 8, '#7ac8ff');
          api.vignette();
        },
      },

      /* ═══════════════════════════ 5. NIGHT OF JIM HALL ══════════════════ */
      {
        id: 'jimhall', name: 'NIGHT OF JIM HALL', sub: 'THE KILLER',
        icon(api, x, y) {
          var g = api.gfx;
          /* badge / star */
          g.circle(x, y, 7, '#e0a020');
          g.circle(x, y, 4, '#0a1020');
          g.rect(x - 1, y - 7, 2, 14, '#e0a020');
          g.rect(x - 7, y - 1, 14, 2,  '#e0a020');
        },
        intro: [
          'JIM HALL ESCAPES PRISON.',
          'HE HUNTS THE JUDGE',
          'IN THE DARK HOUSE.',
          'White Fang guards the family.',
        ],
        quote: '"White Fang was glad to be free at last, glad to die fighting."',
        help: 'TAP and DRAG to chase Jim Hall · catch him 3 times to save the judge',
        winText: 'White Fang stands over Jim Hall. The family is safe. The wild has served love.',
        loseText: 'Jim Hall slips past in the darkness. A shot rings out in the long night.',
        init(api) {
          this.wx = api.W / 2; this.wy = api.H - 110;
          this.hx = 20; this.hy = 90;
          this.hdx = 0; this.hdy = 0; this.hcd = 0;
          this.catches = 0; this.need = 3;
          this.jHp = 3;
          this.jX  = api.W / 2; this.jY = 54;
          this.catchT = 0;
          this.wSpd = 155; this.hSpd = 88;
        },
        update(api, dt) {
          var f = dt * 60, W = api.W, H = api.H;

          /* white fang movement */
          if (api.pointer.down) {
            var dx = api.pointer.x - this.wx;
            var dy = api.pointer.y - this.wy;
            this.wx += Math.sign(dx) * Math.min(Math.abs(dx), this.wSpd * dt);
            this.wy += Math.sign(dy) * Math.min(Math.abs(dy), this.wSpd * dt);
          }
          if (api.keyDown('left'))  this.wx -= 4 * f;
          if (api.keyDown('right')) this.wx += 4 * f;
          if (api.keyDown('up'))    this.wy -= 4 * f;
          if (api.keyDown('down'))  this.wy += 4 * f;
          this.wx = clamp(this.wx, 14, W - 14);
          this.wy = clamp(this.wy, 60, H - 58);

          /* Jim Hall AI — sneaks toward judge with random zigzag */
          this.hcd -= dt;
          if (this.hcd <= 0) {
            var tjx = this.jX - this.hx, tjy = this.jY - this.hy;
            var td  = Math.sqrt(tjx * tjx + tjy * tjy) || 1;
            this.hdx = tjx / td + (Math.random() - 0.5) * 0.7;
            this.hdy = tjy / td + (Math.random() - 0.5) * 0.7;
            this.hcd = 0.5 + Math.random() * 0.5;
          }
          this.hx += this.hdx * this.hSpd * dt;
          this.hy += this.hdy * this.hSpd * dt;
          this.hx = clamp(this.hx, 10, W - 10);
          this.hy = clamp(this.hy, 58, H - 48);
          this.hSpd = Math.min(140, 88 + this.catches * 14);

          /* Hall reaches judge */
          if (Math.abs(this.hx - this.jX) < 28 && Math.abs(this.hy - this.jY) < 28) {
            this.jHp--;
            api.shake(9, 0.38); api.flash('#cc2200', 0.28); api.audio.sfx('hurt');
            /* respawn Hall from bottom edge */
            this.hx = 20 + Math.random() * (W - 40);
            this.hy = H - 44;
            if (this.jHp <= 0) { api.lose(); return; }
          }

          /* WF catches Hall */
          this.catchT -= dt;
          if (this.catchT <= 0 &&
              Math.abs(this.wx - this.hx) < 28 &&
              Math.abs(this.wy - this.hy) < 28) {
            this.catches++;
            api.score += 80; api.audio.sfx('win');
            api.burst(this.hx, this.hy, '#7ac8ff', 11);
            api.shake(5, 0.25);
            this.catchT = 1.3;
            /* respawn Hall */
            var respSide = Math.random() < 0.5 ? 0 : W;
            this.hx = respSide;
            this.hy = 80 + Math.random() * (H - 170);
            if (this.catches >= this.need) { api.score += 160; api.win(); return; }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          /* dark house interior */
          c.fillStyle = '#060810'; c.fillRect(0, 0, W, H);

          /* floorboard lines */
          for (var fi4 = 0; fi4 < 9; fi4++) {
            c.fillStyle = '#0c0e18'; c.fillRect(0, 58 + fi4 * 48, W, 1);
          }

          /* top room wall */
          c.fillStyle = '#0a0814'; c.fillRect(0, 0, W, 52);
          c.fillStyle = '#161420'; c.fillRect(0, 50, W, 4);

          /* moonlight window (top center) */
          c.globalAlpha = 0.14;
          c.fillStyle = '#7ac8ff'; c.fillRect(W / 2 - 20, 8, 40, 26);
          c.globalAlpha = 1;
          g.rect(W / 2 - 20,  8, 40, 26, '#1c2040');
          g.rect(W / 2 - 2,   8,  4, 26, '#1c2040');
          g.rect(W / 2 - 20, 20, 40,  4, '#1c2040');

          /* judge in bed */
          g.rect(this.jX - 30, this.jY - 12, 60, 28, '#1e1228');
          g.rect(this.jX - 26, this.jY - 15, 52, 10, '#302848');
          /* judge figure (tiles = remaining hp) */
          for (var ji = 0; ji < this.jHp; ji++) {
            g.rect(this.jX - 22 + ji * 22, this.jY - 10, 16, 20, '#6a5a58');
          }
          api.txtC('JUDGE', this.jX, this.jY + 20, 7, '#7898aa');
          for (var jhi = 0; jhi < 3; jhi++) {
            g.rect(this.jX - 24 + jhi * 18, this.jY + 28, 14, 6, jhi < this.jHp ? '#22aa44' : '#1a1228');
          }

          /* Jim Hall — shadow figure */
          g.sprite([
            '..dd..',
            '.dddd.',
            'dddddd',
            '.d..d.',
            '.d..d.',
          ], this.hx - 12, this.hy - 14, { d: '#38183a' }, 4);
          g.circle(this.hx, this.hy - 15, 6, '#281828');
          /* knife glint */
          if (api.t % 0.48 < 0.24) g.rect(this.hx + 8, this.hy - 4, 2, 10, '#c0c0d8');

          /* White Fang */
          var wb3 = Math.sin(api.t * 9) * 1.5;
          drawWolf(g, this.wx - 10, this.wy - 14 + wb3, 4);

          api.topBar('NIGHT OF JIM HALL');
          api.txt('CAUGHT ' + this.catches + '/3', 6, 20, 8, '#7ac8ff');
          for (var jli = 0; jli < 3; jli++) {
            g.circle(W - 20 - jli * 17, 22, 5, jli < this.jHp ? '#22aa44' : '#1a1228');
          }
          api.vignette();
        },
      },

    ], /* end chapters */
  });
})();
