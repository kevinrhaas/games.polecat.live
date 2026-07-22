/* ============================================================================
 * WHITE FANG — WILD BORN · FIRE TAMED
 * Five chapters of Jack London's 1906 tale:
 *   1. SURVIVAL OF THE FITTEST — resource-sim: forage fish/wood against dual
 *      HUNGER/COLD meters, dodge the eagle's telegraphed swoop, pick a route
 *      at a mid-trail fork
 *   2. THE LAW OF THE PACK — social-strategy: choose safe or bold responses to
 *      rise in DOMINANCE without maxing Gray Beaver's PUNISHMENT meter
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

      /* ═══════════════════════════ 1. SURVIVAL OF THE FITTEST ═══════════ */
      {
        id: 'survival', name: 'SURVIVAL OF THE FITTEST', sub: 'HUNGER AND COLD',
        icon(api, x, y) {
          var g = api.gfx;
          g.rect(x - 1, y - 8, 2, 13, '#7ac8ff');
          g.circle(x, y + 6, 3, '#cc4422');
        },
        intro: [
          'A SHE-WOLF WATCHES',
          'HER CUB TAKE HIS',
          'FIRST STEPS INTO',
          'the Yukon wild.',
          'Hunger and cold stalk him',
          'as surely as the eagle above.',
        ],
        quote: '"He did not know the word, but fear was the motif of his life."',
        help: 'DRAG to forage FISH (hunger) and WOOD (cold) · dodge the eagle\'s swoop · pick a route at the fork',
        winText: 'The cub endures the trail, fed and warm enough. The wild has not claimed him yet.',
        loseText: 'Hunger and cold close in together. The cub curls small in the snow, and does not rise.',
        init(api) {
          this.px = api.W / 2; this.py = api.H - 90;
          this.hunger = 22; this.cold = 22; this.cap = 100;
          this.hungerRate = 1.55; this.coldRate = 1.55;
          this.timer = 0; this.duration = 27;
          this.forages = []; this.spawnT = 1.0;
          this.eagleState = 'wait'; this.eagleT = 2.6; this.eagleX = api.W / 2;
          this.hurt = 0;
          this.forkAt = 12; this.forked = false; this.showFork = false; this.fork = null;
          this.done = false;
        },
        update(api, dt) {
          if (this.done) return;
          var W = api.W, H = api.H, f = dt * 60;
          this.timer += dt;
          this.hurt = Math.max(0, this.hurt - dt);

          if (!this.forked && this.timer >= this.forkAt) this.showFork = true;
          if (this.showFork) {
            if (api.pointer.justDown && api.pointer.y > H - 140) {
              if (api.pointer.x < W / 2) { this.fork = 'river'; this.coldRate += 0.9; this.hungerRate = Math.max(0.6, this.hungerRate - 0.35); }
              else { this.fork = 'snow'; this.hungerRate += 0.9; this.coldRate = Math.max(0.6, this.coldRate - 0.35); }
              this.forked = true; this.showFork = false;
              api.audio.sfx('select');
            }
            return; // meters pause while the choice is up
          }

          this.hunger = Math.min(this.cap, this.hunger + this.hungerRate * dt);
          this.cold = Math.min(this.cap, this.cold + this.coldRate * dt);
          if (this.hunger >= this.cap || this.cold >= this.cap) { this.done = true; api.lose(); return; }
          if (this.timer >= this.duration) {
            this.done = true;
            api.score += Math.floor((this.cap - this.hunger) + (this.cap - this.cold));
            api.win(); return;
          }

          if (api.pointer.down) {
            var dx = api.pointer.x - this.px;
            this.px += Math.sign(dx) * Math.min(Math.abs(dx), 200 * dt);
          }
          if (api.keyDown('left'))  this.px -= 3.4 * f;
          if (api.keyDown('right')) this.px += 3.4 * f;
          this.px = clamp(this.px, 16, W - 16);

          this.spawnT -= dt;
          if (this.spawnT <= 0 && this.forages.length < 4) {
            this.spawnT = 0.85 + Math.random() * 0.7;
            this.forages.push({
              x: 22 + Math.random() * (W - 44),
              y: H - 90 + (Math.random() * 44 - 22),
              kind: Math.random() < 0.5 ? 'fish' : 'wood', t: 0,
            });
          }
          for (var i = this.forages.length - 1; i >= 0; i--) {
            var it = this.forages[i];
            it.t += dt;
            if (Math.abs(it.x - this.px) < 20 && Math.abs(it.y - this.py) < 20) {
              if (it.kind === 'fish') this.hunger = Math.max(0, this.hunger - 16);
              else this.cold = Math.max(0, this.cold - 16);
              api.score += 15; api.audio.sfx('coin'); api.burst(it.x, it.y, '#7ac8ff', 6);
              this.forages.splice(i, 1); continue;
            }
            if (it.t > 6) this.forages.splice(i, 1);
          }

          // eagle: telegraphed swoop that spikes BOTH meters if it catches the cub
          this.eagleT -= dt;
          if (this.eagleState === 'wait' && this.eagleT <= 0) {
            this.eagleState = 'warn'; this.eagleT = 0.7;
            this.eagleX = clamp(this.px + (Math.random() * 70 - 35), 24, W - 24);
          } else if (this.eagleState === 'warn' && this.eagleT <= 0) {
            this.eagleState = 'strike'; this.eagleT = 0.18;
            if (this.hurt <= 0 && Math.abs(this.eagleX - this.px) < 24) {
              this.hunger = Math.min(this.cap, this.hunger + 12);
              this.cold = Math.min(this.cap, this.cold + 12);
              this.hurt = 1.0;
              api.shake(7, 0.3); api.flash('#cc2200', 0.2); api.audio.sfx('hurt');
            }
          } else if (this.eagleState === 'strike' && this.eagleT <= 0) {
            this.eagleState = 'wait'; this.eagleT = Math.max(1.6, 2.8 - this.timer * 0.04);
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          var sky = c.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#060c1c'); sky.addColorStop(1, '#1a2840');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);

          for (var i = 0; i < 22; i++) {
            var sx = ((i * 73 + api.t * 15) % (W + 20)) - 5;
            var sy = ((i * 51 + api.t * 19 * (i % 3 === 0 ? 1 : 0.6)) % (H - 60));
            c.globalAlpha = 0.35;
            g.rect(sx, sy, 2, 2, '#deeeff');
          }
          c.globalAlpha = 1;

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

          c.fillStyle = '#c0d4e8'; c.fillRect(0, H - 64, W, 64);
          c.fillStyle = '#deeeff'; c.fillRect(0, H - 66, W, 4);

          // forage nodes
          this.forages.forEach(function (it) {
            if (it.kind === 'fish') g.sprite(['.ff.', 'fffb', '.ff.'], it.x - 6, it.y - 6, { f: '#48b0e0', b: '#0078b0' }, 4);
            else { g.rect(it.x - 6, it.y - 3, 12, 6, '#5a3a1a'); g.rect(it.x - 6, it.y - 3, 12, 2, '#7a5228'); }
          });

          // eagle telegraph + strike
          if (this.eagleState !== 'wait') {
            var warn = this.eagleState === 'warn';
            c.globalAlpha = warn ? 0.35 + 0.25 * Math.sin(api.t * 12) : 0.55;
            g.circle(this.eagleX, H - 60, warn ? 22 : 30, '#cc2200');
            c.globalAlpha = 1;
            var fw = 22;
            c.fillStyle = '#5a4830';
            c.beginPath(); c.moveTo(this.eagleX, 50); c.lineTo(this.eagleX - fw, 40); c.lineTo(this.eagleX - fw + 8, 57); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(this.eagleX, 50); c.lineTo(this.eagleX + fw, 40); c.lineTo(this.eagleX + fw - 8, 57); c.closePath(); c.fill();
            g.circle(this.eagleX, 50, 7, '#3a2c18');
          }

          var bob = Math.sin(api.t * 7) * 2;
          c.globalAlpha = this.hurt > 0 ? 0.5 : 1;
          drawWolf(g, this.px - 10, H - 90 + bob, 4);
          c.globalAlpha = 1;

          api.topBar('SURVIVAL OF THE FITTEST');
          api.txt('HUNGER', 6, 4, 6, '#ff8866');
          g.rect(46, 5, W - 96, 6, '#1a0e0e');
          g.rect(46, 5, Math.floor((W - 96) * clamp(this.hunger / this.cap, 0, 1)), 6, '#ff5533');
          api.txt('COLD', 6, 14, 6, '#7ac8ff');
          g.rect(46, 15, W - 96, 6, '#0e1a2a');
          g.rect(46, 15, Math.floor((W - 96) * clamp(this.cold / this.cap, 0, 1)), 6, '#4499ee');

          if (this.showFork) {
            c.fillStyle = 'rgba(3,8,16,.86)'; c.fillRect(0, 0, W, H);
            api.txtCFit('A FORK IN THE TRAIL', W / 2, H * 0.28, 11, '#deeeff', true);
            var by = H - 140;
            g.rect(16, by, W / 2 - 24, 60, '#0c1e34'); g.rectO(16, by, W / 2 - 24, 60, '#4499ee', 1);
            api.txtCFit('THE FROZEN RIVER', 16 + (W / 2 - 24) / 2, by + 8, 8, '#deeeff', false, W / 2 - 34);
            api.txtCFit('faster, colder', 16 + (W / 2 - 24) / 2, by + 40, 6, '#7ac8ff', false, W / 2 - 34);
            g.rect(W / 2 + 8, by, W / 2 - 24, 60, '#1e2c14'); g.rectO(W / 2 + 8, by, W / 2 - 24, 60, '#88cc66', 1);
            api.txtCFit('THE DEEP SNOW', W / 2 + 8 + (W / 2 - 24) / 2, by + 8, 8, '#deeeff', false, W / 2 - 34);
            api.txtCFit('slower, hungrier', W / 2 + 8 + (W / 2 - 24) / 2, by + 40, 6, '#aaddaa', false, W / 2 - 34);
          } else {
            api.txtC(Math.ceil(Math.max(0, this.duration - this.timer)) + 's', W / 2, H - 22, 8, '#9bbccc');
          }
          api.vignette();
        },
      },

      /* ═══════════════════════════ 2. THE LAW OF THE PACK ════════════════ */
      {
        id: 'pack', name: 'THE LAW OF THE PACK', sub: 'EARN YOUR PLACE',
        icon(api, x, y) {
          var g = api.gfx;
          g.rect(x - 8, y - 3, 3, 8, '#e0a020');
          g.rect(x + 5, y - 3, 3, 8, '#e0a020');
          g.rect(x - 8, y + 3, 16, 3, '#e0a020');
        },
        intro: [
          'WHITE FANG IS CAUGHT',
          'BY GRAY BEAVER.',
          'THE SLED DOGS TEST HIM,',
          'ONE BY ONE, AT THE CAMP\'S EDGE.',
          'How he answers decides his rank.',
        ],
        quote: '"It is not pleasant to be lonely; it is better to knock than be knocked."',
        help: 'TAP a choice each round · rise in DOMINANCE before Gray Beaver\'s PUNISHMENT boils over',
        winText: 'White Fang holds his ground. The pack yields him a place by the fire.',
        loseText: 'Gray Beaver\'s club falls hard. White Fang slinks back, lower than before.',
        init(api) {
          this.dominance = 0; this.needDom = 60;
          this.punish = 0; this.maxPunish = 100;
          this.round = 0;
          this.encounters = [
            { title: 'LIP-CURL AT THE WATER HOLE', a: { label: 'Back down', sub: '(safe)', dom: 10, pun: 6 }, b: { label: 'Snap back', sub: '(bold)', dom: 18, pun: 22 } },
            { title: 'A STOLEN SCRAP OF MEAT', a: { label: 'Let it go', sub: '(safe)', dom: 12, pun: 6 }, b: { label: 'Fight for it', sub: '(bold)', dom: 20, pun: 24 } },
            { title: 'THE BIGGEST DOG BLOCKS THE PATH', a: { label: 'Go around', sub: '(safe)', dom: 10, pun: 6 }, b: { label: 'Push through', sub: '(bold)', dom: 22, pun: 26 } },
            { title: 'A PUP CHALLENGES YOU', a: { label: 'Ignore the pup', sub: '(safe)', dom: 14, pun: 6 }, b: { label: 'Pin it down', sub: '(bold)', dom: 20, pun: 20 } },
            { title: 'GRAY BEAVER WATCHES CLOSELY', a: { label: 'Sit and wait', sub: '(safe)', dom: 14, pun: 6 }, b: { label: 'Stare him down', sub: '(bold)', dom: 24, pun: 24 } },
          ];
          this.active = this.encounters[0];
          this.feedback = null; this.feedbackT = 0;
        },
        choiceRects(api) {
          var W = api.W, H = api.H;
          return [
            { x: 20, y: H - 130, w: W - 40, h: 44 },
            { x: 20, y: H - 78, w: W - 40, h: 44 },
          ];
        },
        update(api, dt) {
          this.feedbackT = Math.max(0, this.feedbackT - dt);
          if (this.feedbackT > 0) return;
          if (!api.pointer.justDown) return;
          var rects = this.choiceRects(api);
          var opts = [this.active.a, this.active.b];
          for (var i = 0; i < 2; i++) {
            var r = rects[i];
            if (api.pointer.x >= r.x && api.pointer.x <= r.x + r.w &&
                api.pointer.y >= r.y && api.pointer.y <= r.y + r.h) {
              var pick = opts[i];
              this.dominance = Math.min(100, this.dominance + pick.dom);
              this.punish += pick.pun;
              api.score += pick.dom;
              api.audio.sfx(i === 0 ? 'blip' : 'select');
              api.burst(api.W / 2, api.H * 0.4, i === 0 ? '#7ac8ff' : '#e0a020', 8);
              this.feedback = pick.label;
              this.feedbackT = 0.9;
              this.round++;
              if (this.punish >= this.maxPunish) { api.shake(6, 0.3); api.lose(); return; }
              if (this.round >= this.encounters.length) {
                if (this.dominance >= this.needDom) api.win(); else api.lose();
                return;
              }
              this.active = this.encounters[this.round];
              break;
            }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          c.fillStyle = '#0e1622'; c.fillRect(0, 0, W, H);
          for (var pi = 0; pi < 5; pi++) { c.fillStyle = '#c0d0e0'; c.fillRect(pi * 56 + 4, H - 32, 38, 20); }

          var fx = W / 2, fy = 70;
          c.globalAlpha = 0.28 + 0.18 * Math.sin(api.t * 5.5);
          g.circle(fx, fy, 26, '#c07820');
          c.globalAlpha = 1;
          g.circle(fx, fy, 11, '#e09020');
          g.circle(fx, fy - 6, 7, '#f0b030');

          // White Fang + the rival dog flanking the fire
          drawWolf(g, fx - 68, fy + 24, 4);
          g.sprite(['.dd.', 'dddd', 'd..d', 'd..d'], fx + 46, fy + 12, { d: this.punish > 60 && Math.sin(api.t * 8) > 0 ? '#ff6644' : '#aa7744' }, 4);

          var cardY = H * 0.42;
          g.rect(16, cardY, W - 32, 46, '#0c1e34');
          g.rectO(16, cardY, W - 32, 46, '#1e3e5e', 1);
          api.txtCFit(this.active ? this.active.title : '', W / 2, cardY + 8, 9, '#deeeff', true, W - 44);
          if (this.feedbackT > 0) api.txtCFit('"' + this.feedback + '"', W / 2, cardY + 26, 8, '#7ac8ff', false, W - 44);

          if (this.feedbackT <= 0 && this.active) {
            var rects = this.choiceRects(api);
            var opts = [this.active.a, this.active.b];
            for (var i = 0; i < 2; i++) {
              var r = rects[i], o = opts[i];
              g.rect(r.x, r.y, r.w, r.h, i === 0 ? '#0c1e34' : '#2a1608');
              g.rectO(r.x, r.y, r.w, r.h, i === 0 ? '#1e3e5e' : '#e0a020', 1);
              api.txtCFit(o.label, r.x + r.w / 2, r.y + 8, 9, '#deeeff', false, r.w - 12);
              api.txtCFit(o.sub, r.x + r.w / 2, r.y + 26, 7, i === 0 ? '#7ac8ff' : '#e0a020', false, r.w - 12);
            }
          }

          api.topBar("THE LAW OF THE PACK");
          api.txt('DOMINANCE', 6, 20, 7, '#deeeff', false, true);
          g.rect(78, 20, W - 124, 6, '#0e1a28');
          g.rect(78, 20, Math.floor((W - 124) * clamp(this.dominance / 100, 0, 1)), 6, '#7ac8ff');
          api.txt('PUNISH', 6, 30, 7, '#e0a020', false, true);
          g.rect(56, 30, W - 102, 6, '#1a0e0e');
          g.rect(56, 30, Math.floor((W - 102) * clamp(this.punish / this.maxPunish, 0, 1)), 6, this.punish > 70 ? '#ff2200' : '#cc4422');
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
