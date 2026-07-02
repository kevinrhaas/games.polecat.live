/* ============================================================================
 * THE CALL OF THE WILD — FIVE STRETCHES OF THE YUKON
 * Jack London's 1903 novel told as five distinct mini-games:
 *   1. THE ROPE         — dodge falling lasso loops in the California night
 *   2. THE TRAIL        — steer the dog team, collect fish, dodge snowdrifts
 *   3. KING OF THE PACK — counter-strike timing duel against Spitz on the ice
 *   4. THE THOUSAND LBS — rapid-tap rhythm to pull Thornton's loaded sled
 *   5. THE CALL         — follow wolf howls through the dark Yukon forest
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Palette ─── */
  const C = {
    sky:    '#080c14',
    sky2:   '#0a1428',
    snow:   '#d8e8f0',
    snowSh: '#a0b8cc',
    spruce: '#0c2010',
    spruce2:'#1a3a18',
    gold:   '#d4a030',
    ice:    '#4ab8e8',
    buck:   '#8a5a20',
    buckD:  '#6a4018',
    buckH:  '#a06a28',
    red:    '#cc2210',
    wolf:   '#505868',
    wolfH:  '#606878',
    aurora: '#20c870',
    white:  '#d8e8f0',
    moon:   '#d0e0ee',
    bark:   '#5a3a18',
    rope:   '#c8a060',
  };

  /* ─── Shared helpers (used by scenery + chapter draws) ─── */
  function drawSpruce(g, c, x, y, h, col) {
    var lw = h * 0.36;
    for (var i = 0; i < 3; i++) {
      var ly = y - i * h * 0.28, lhw = lw - i * h * 0.07;
      c.fillStyle = col;
      c.beginPath(); c.moveTo(x, ly - h * 0.32 + i * h * 0.08);
      c.lineTo(x - lhw, ly); c.lineTo(x + lhw, ly); c.closePath(); c.fill();
    }
    g.rect(x - 3, y, 6, 10, C.bark);
  }

  function drawBuck(g, c, x, y, t, flashing) {
    if (flashing) return;
    g.rect(x - 14, y - 8, 28, 14, C.buck);
    g.rect(x - 6,  y - 16, 14, 10, C.buckH);
    g.circle(x + 7, y - 13, 6, C.buckH);
    g.rect(x + 10, y - 17, 4, 6, C.buckD);
    g.rect(x + 12, y - 15, 2, 2, '#e8c060');
    var leg = Math.sin(t * 12) * 5;
    g.rect(x - 8, y + 4, 4, 8 + leg, C.buckD);
    g.rect(x,     y + 4, 4, 8 - leg, C.buckD);
    g.rect(x + 8, y + 4, 4, 8 + leg, C.buckD);
    c.strokeStyle = '#c87a30'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x - 14, y - 2);
    c.quadraticCurveTo(x - 28, y - 18, x - 22, y - 30); c.stroke();
  }

  function drawPaw(g, cx, cy, col) {
    g.circle(cx,     cy + 4, 5, col);
    g.circle(cx - 5, cy,     3, col);
    g.circle(cx + 5, cy,     3, col);
    g.circle(cx - 2, cy - 4, 2, col);
    g.circle(cx + 2, cy - 4, 2, col);
  }

  function drawAurora(c, W, t) {
    for (var i = 0; i < 3; i++) {
      var ax = i * 90 + 20 + Math.sin(t * 0.3 + i) * 18;
      c.globalAlpha = 0.13 + 0.07 * Math.sin(t * 0.5 + i * 1.3);
      var ag = c.createLinearGradient(ax, 0, ax + 80, 60);
      ag.addColorStop(0, 'transparent');
      ag.addColorStop(0.5, i === 1 ? C.aurora : '#4060e0');
      ag.addColorStop(1, 'transparent');
      c.fillStyle = ag;
      c.beginPath();
      c.ellipse(ax + 40, 28 + i * 14, 54, 18, -0.15 + i * 0.08, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }

  /* ─── Emblem: golden paw print ─── */
  function emblem(api, cx, cy) {
    drawPaw(api.gfx, cx, cy, C.gold);
  }

  /* ─── Scenery ─── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      /* Daytime blue-sky sled trail — bright, totally unlike the night scenes */
      var daySky = c.createLinearGradient(0, 0, 0, H);
      daySky.addColorStop(0, '#3a6898');
      daySky.addColorStop(0.55, '#5888b8');
      daySky.addColorStop(1, '#90b8d8');
      c.fillStyle = daySky; c.fillRect(0, 0, W, H);
      /* Sun */
      c.globalAlpha = 0.9; g.circle(W - 44, 44, 20, '#fff8d0');
      c.globalAlpha = 0.22; g.circle(W - 44, 44, 30, '#ffe880'); c.globalAlpha = 1;
      /* Snow hills */
      c.fillStyle = '#d4e4f0'; c.beginPath(); c.moveTo(0, H);
      for (var x = 0; x <= W; x += 10) c.lineTo(x, H * 0.55 - Math.sin(x * 0.022 + 1) * 22 - 14);
      c.lineTo(W, H); c.closePath(); c.fill();
      /* Ground */
      c.fillStyle = '#e8f0f8'; c.fillRect(0, H * 0.58, W, H * 0.42);
      /* Sled trail path */
      c.strokeStyle = '#b8ccd8'; c.lineWidth = 22; c.globalAlpha = 0.55;
      c.beginPath(); c.moveTo(W * 0.42, 72);
      c.bezierCurveTo(W * 0.56, 180, W * 0.36, 280, W * 0.50, H - 56);
      c.stroke(); c.globalAlpha = 1;
      /* Spruce border trees */
      var tPos = [10, 22, 34, W - 10, W - 22, W - 34];
      for (var ti = 0; ti < tPos.length; ti++) {
        drawSpruce(g, c, tPos[ti], H * 0.58, 34 + (ti % 3) * 8, C.spruce2);
      }
      return;
    }

    /* Night backdrop (boot / intro / result / finale) */
    var sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, C.sky); sky.addColorStop(1, C.sky2);
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    /* Northern lights */
    drawAurora(c, W, t);
    /* Stars */
    for (var si = 0; si < 42; si++) {
      var sx = (si * 71 + 11) % W, sy = (si * 53 + 7) % Math.floor(H * 0.5);
      c.globalAlpha = (0.3 + 0.7 * Math.abs(Math.sin(t * 0.9 + si))) * 0.8;
      g.rect(sx, sy, 1, 1, C.snow);
    }
    c.globalAlpha = 1;
    /* Snow hills */
    c.fillStyle = '#182030';
    c.beginPath(); c.moveTo(0, H);
    for (var hx = 0; hx <= W; hx += 8) c.lineTo(hx, H * 0.63 - Math.sin(hx * 0.024) * 26 - 18);
    c.lineTo(W, H); c.closePath(); c.fill();
    /* Snow ground gradient */
    var sg = c.createLinearGradient(0, H * 0.63, 0, H);
    sg.addColorStop(0, '#c0d4e4'); sg.addColorStop(1, '#9ab0c4');
    c.fillStyle = sg; c.fillRect(0, H * 0.63, W, H * 0.37);
    /* Spruce silhouettes */
    var spPos = [[16, 0.63, 38], [48, 0.63, 28], [90, 0.64, 44],
                 [142, 0.63, 34], [186, 0.62, 46], [228, 0.64, 30], [258, 0.63, 40]];
    for (var sp = 0; sp < spPos.length; sp++) {
      drawSpruce(g, c, spPos[sp][0], H * spPos[sp][1], spPos[sp][2], C.spruce);
    }
    /* Snow on treetops */
    for (var sps = 0; sps < spPos.length; sps++) {
      c.globalAlpha = 0.65;
      c.fillStyle = C.snow;
      c.beginPath();
      c.ellipse(spPos[sps][0], H * spPos[sps][1] - spPos[sps][2] * 0.42, spPos[sps][2] * 0.2, 4, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    /* Drifting snow */
    for (var dn = 0; dn < 18; dn++) {
      var px = ((t * 10 + dn * 37) % (W + 20)) - 10;
      var py = (t * 16 + dn * 63 + Math.sin(t + dn) * 10) % H;
      c.globalAlpha = 0.45;
      g.rect(px, py, 2, 2, C.snow);
    }
    c.globalAlpha = 1;
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(4,6,14,.74)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Trail marker card layout: zigzag down the page ─── */
  var CARDS = [
    { x: 27,  y: 86,  w: 80, h: 58 },   // ch 1 — left
    { x: 163, y: 154, w: 80, h: 58 },   // ch 2 — right
    { x: 27,  y: 224, w: 80, h: 58 },   // ch 3 — left
    { x: 163, y: 292, w: 80, h: 58 },   // ch 4 — right
    { x: 95,  y: 374, w: 80, h: 58 },   // ch 5 — center
  ];

  /* ─── Chapter icons ─── */
  var ICONS = [
    function (api, x, y) { /* lasso loop */
      api.ctx.strokeStyle = C.rope; api.ctx.lineWidth = 3;
      api.ctx.beginPath(); api.ctx.arc(x, y, 8, 0, Math.PI * 2); api.ctx.stroke();
    },
    function (api, x, y) { /* fish */
      api.gfx.circle(x, y, 6, C.ice);
      api.ctx.fillStyle = '#2090c8';
      api.ctx.beginPath(); api.ctx.moveTo(x + 6, y - 2);
      api.ctx.lineTo(x + 11, y - 5); api.ctx.lineTo(x + 11, y + 1); api.ctx.closePath(); api.ctx.fill();
    },
    function (api, x, y) { /* wolf tooth / fang */
      api.gfx.circle(x, y, 7, C.red);
      api.gfx.circle(x, y, 4, C.wolf);
    },
    function (api, x, y) { /* sled */
      api.gfx.rect(x - 10, y - 3, 20, 8, C.gold);
      api.gfx.rect(x - 6, y + 5,  12, 3, C.bark);
    },
    function (api, x, y) { /* wolf silhouette */
      api.gfx.circle(x, y - 2, 7, C.wolfH);
      api.ctx.fillStyle = C.wolf;
      api.ctx.beginPath(); api.ctx.moveTo(x - 4, y - 8); api.ctx.lineTo(x - 8, y - 15); api.ctx.lineTo(x, y - 9); api.ctx.closePath(); api.ctx.fill();
      api.ctx.beginPath(); api.ctx.moveTo(x + 4, y - 8); api.ctx.lineTo(x + 8, y - 15); api.ctx.lineTo(x, y - 9); api.ctx.closePath(); api.ctx.fill();
    },
  ];

  /* ─── SAGA ─── */
  RetroSaga.create({
    id: 'callwild',
    title: 'Call of the Wild',
    subtitle: 'FIVE STRETCHES OF THE YUKON',
    currency: 'MILES',
    screens: {
      win:   '#4ab8e8', lose: '#cc2210', chapterLabel: '#6888a8',
      name:  '#d8e8f0', sub: '#d4a030', intro: '#c8d8e8', quote: '#6888a8',
      help:  '#4ab8e8', score: '#d8e8f0', cur: '#d4a030',
      cta:   '#d8e8f0', overlay: 'rgba(4,8,18,.86)',
    },
    labels: {
      chapter: 'STRETCH',
      score:   'MILES COVERED',
      win:     'THE TRAIL HOLDS',
      lose:    'THE SNOW CLAIMS YOU',
      cont:    'TAP TO PRESS ON',
      finale:  'TAP TO ANSWER THE CALL',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO RUN',
    },
    accent:   '#4ab8e8',
    credit:   'THE CALL OF THE WILD · JACK LONDON',
    bootLine: 'FIVE STRETCHES · ONE DESTINY',
    tagline:  'A POLECAT ADVENTURE',
    emblem, scenery,
    bootCta:   'ANSWER THE CALL',
    menuLabel: 'THE YUKON TRAIL',
    menuHint:  'CHOOSE YOUR STRETCH',
    menuDone:  'THE WILD IS YOURS',
    finale: [
      'BUCK RAISES HIS HEAD',
      'TO THE FROZEN STARS.',
      '',
      'HE SINGS WITH THE PACK.',
      '',
      'THE CALL HAS BEEN ANSWERED.',
    ],
    width: 270, height: 480, parent: '#game',

    menu: {
      colors: { title: C.white, label: C.ice, cur: C.gold, done: C.aurora, lock: '#404858' },

      title(api, miles) {
        var g = api.gfx, c = api.ctx, W = api.W;
        g.rect(18, 12, W - 36, 50, '#0a1828');
        c.strokeStyle = C.ice; c.lineWidth = 2;
        c.strokeRect(18, 12, W - 36, 50);
        /* snowflake marks */
        for (var fi = 0; fi < 4; fi++) {
          var fx = 28 + fi * 58;
          c.strokeStyle = C.ice; c.lineWidth = 1; c.globalAlpha = 0.25;
          c.beginPath(); c.moveTo(fx, 16); c.lineTo(fx, 24);
          c.moveTo(fx - 4, 20); c.lineTo(fx + 4, 20); c.stroke();
          c.globalAlpha = 1;
        }
        api.txtCFit('THE YUKON TRAIL', W / 2, 22, 9, C.white, false, W - 44);
        api.txtCFit('MILES  ' + miles, W / 2, 40, 9, C.gold,  false, W - 44);
        /* sled silhouette */
        g.rect(W / 2 - 22, 52, 44, 6, '#162030');
        g.rect(W / 2 - 26, 56, 52, 3, '#1e3048');
      },

      layout: function () { return CARDS; },

      card(api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done, best = info.best;
        var cx = x + w / 2;

        /* Connecting trail (dashed line to previous card) */
        if (i > 0) {
          var prev = CARDS[i - 1];
          var px = prev.x + prev.w / 2, py = prev.y + prev.h + 2;
          var cy2 = y - 2;
          c.strokeStyle = '#2a4a68'; c.lineWidth = 2;
          c.setLineDash([5, 5]);
          c.beginPath(); c.moveTo(px, py); c.lineTo(cx, cy2); c.stroke();
          c.setLineDash([]);
        }

        /* Wooden trail marker post */
        g.rect(cx - 3, y + h - 10, 6, 16, C.bark);

        /* Sign board */
        var bc = sel ? '#1e3c5a' : (done ? '#122a40' : '#162030');
        var bo = sel ? C.gold : (done ? C.aurora : '#2a4060');
        g.rect(x + 4, y + 3, w - 8, h - 14, bc);
        c.strokeStyle = bo; c.lineWidth = sel ? 3 : 2;
        c.strokeRect(x + 4, y + 3, w - 8, h - 14);

        /* Mile post number */
        var mileLabels = ['22 MI', '48 MI', '81 MI', '117 MI', '160 MI'];
        api.txtCFit(mileLabels[i], cx, y + 10, 7, sel ? C.gold : '#4a6a8a', false, w - 12);

        /* Chapter short name */
        var shortNames = ['THE ROPE', 'THE TRAIL', 'KING OF PACK', 'THE BET', 'THE CALL'];
        api.txtCFit(shortNames[i], cx, y + 24, 7,
          done ? C.aurora : (sel ? C.white : '#3a5870'), false, w - 10);

        /* Icon */
        ICONS[i](api, cx, y + 40);

        /* Best score */
        if (best && best > 0) {
          api.txtCFit('' + best, cx, y + h - 6, 6, C.gold, false, w - 12);
        }
      },
    },

    chapters: [

      /* ═══════════ 1. THE ROPE — dodge falling lasso loops ═══════════ */
      {
        id: 'rope', name: 'THE ROPE', sub: 'STOLEN FROM THE SUN',
        icon: function (api, x, y) { ICONS[0](api, x, y); },
        intro: [
          'BUCK LIVES IN LUXURY',
          'AT JUDGE MILLER\'S RANCH.',
          'MANUEL, A TREACHEROUS GARDENER,',
          'sells him to a dog trader.',
          'Men come with ropes in the night.',
        ],
        quote: '"He was beaten (he knew that); but he was not broken." — Jack London',
        help: 'Dodge the falling lassos! Tap LEFT or RIGHT side to move. Survive to earn miles.',
        winText: 'You fought hard — but the rope finally found you. Buck is shipped north.',
        loseText: 'Caught and crated, Buck begins the journey north to the Klondike.',

        init: function (api) {
          this.lives    = 3;
          this.survive  = 0;
          this.target   = 22;
          this.ropes    = [];
          this.spawnT   = 0;
          this.spawnInt = 1.1;
          this.buckX    = api.W / 2;
          this.speed    = 160;
          this.hitCD    = 0;
          this.scored   = 0;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          /* Move Buck */
          var mx = 0;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W / 2))  mx = -1;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= W / 2)) mx =  1;
          this.buckX = clamp(this.buckX + mx * 175 * dt, 20, W - 20);

          /* Spawn ropes */
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.ropes.push({ x: 20 + Math.random() * (W - 40), y: -22, spd: this.speed });
            this.spawnT = this.spawnInt * (0.75 + Math.random() * 0.5);
          }

          /* Update ropes */
          for (var i = 0; i < this.ropes.length; i++) this.ropes[i].y += this.ropes[i].spd * dt;
          this.ropes = this.ropes.filter(function (r) { return r.y < H + 30; });

          /* Collision */
          if (this.hitCD > 0) {
            this.hitCD -= dt;
          } else {
            for (var ri = 0; ri < this.ropes.length; ri++) {
              var r = this.ropes[ri];
              var buckY = H * 0.76;
              if (Math.abs(r.x - this.buckX) < 18 && r.y > buckY - 14 && r.y < buckY + 10) {
                this.lives--;
                this.hitCD = 0.8;
                api.shake(6, 0.35);
                api.flash(C.red, 0.18);
                api.burst(this.buckX, buckY, C.red, 8);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }

          /* Progress */
          this.survive += dt;
          this.speed    = 160 + this.survive * 9;
          this.spawnInt = Math.max(0.45, 1.1 - this.survive * 0.025);
          api.addScore(Math.floor(dt * 6));

          if (this.survive >= this.target) api.win();
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          /* Ranch night */
          var sky = c.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#101c2a'); sky.addColorStop(1, '#1a2c3a');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          /* Moon */
          g.circle(W - 36, 44, 16, '#d0dce8');
          c.globalAlpha = 0.15; g.circle(W - 36, 44, 24, '#c0ccd8'); c.globalAlpha = 1;
          /* Fence */
          for (var fi = 0; fi < 8; fi++) {
            g.rect(fi * 36, H * 0.76 - 28, 6, 34, '#7a5038');
          }
          for (var fi2 = 0; fi2 < 7; fi2++) {
            g.rect(fi2 * 36 + 8, H * 0.76 - 18, 28, 5, '#6a4430');
          }
          /* Ground */
          g.rect(0, H * 0.76, W, H * 0.24, '#1e2e14');
          /* Ropes */
          for (var ri = 0; ri < this.ropes.length; ri++) {
            var r = this.ropes[ri];
            c.strokeStyle = C.rope; c.lineWidth = 3;
            c.beginPath(); c.arc(r.x, r.y, 13, 0, Math.PI * 2); c.stroke();
            c.strokeStyle = '#a07840'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(r.x, r.y - 13); c.lineTo(r.x, r.y - 30); c.stroke();
          }
          /* Buck */
          var flash = this.hitCD > 0 && Math.floor(this.hitCD * 9) % 2 === 0;
          drawBuck(g, c, this.buckX, H * 0.76 - 14, api.t, flash);
          /* Lives paws */
          for (var li = 0; li < this.lives; li++) drawPaw(g, 12 + li * 22, 18, C.gold);
          /* Survive progress bar */
          var pct = Math.min(1, this.survive / this.target);
          g.rect(0, H - 8, W, 8, '#0a1020');
          g.rect(0, H - 8, W * pct, 8, C.ice);
          api.txtCFit('SURVIVE ' + Math.ceil(this.target - this.survive) + 's', W / 2, H - 15, 6, '#4a6888', false, W);
          api.topBar('THE ROPE', api.score);
          api.scanlines();
        },
      },

      /* ═══════════ 2. THE TRAIL — sled runner, collect fish ═══════════ */
      {
        id: 'trail', name: 'THE TRAIL', sub: 'LAW OF CLUB AND FANG',
        icon: function (api, x, y) { ICONS[1](api, x, y); },
        intro: [
          'PERRAULT AND FRANCOIS',
          'DRIVE THEIR SLED NORTH.',
          'BUCK LEARNS: EAT FAST OR STARVE.',
          'He must master the trail or die.',
        ],
        quote: '"He was quick to learn, and under the hard tutelage of the North he learned rapidly." — Jack London',
        help: 'Steer the dog team left or right. Catch frozen fish — avoid the snowdrifts!',
        winText: 'Ten fish! The team runs true — Perrault is impressed with the big dog.',
        loseText: 'The sled topples in the drifts. Buck learns the price of a bad run.',

        init: function (api) {
          this.lives    = 3;
          this.fish     = 0;
          this.fishNeed = 10;
          this.timer    = 0;
          this.limit    = 30;
          this.obs      = [];
          this.catches  = [];
          this.fx       = [];
          this.buckX    = api.W / 2;
          this.obsT     = 0.7;
          this.fishT    = 0.9;
          this.speed    = 130;
          this.hitCD    = 0;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer += dt;
          var spd = this.speed + this.timer * 3.5;

          /* Buck movement */
          var mx = 0;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W / 2))  mx = -1;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= W / 2)) mx =  1;
          this.buckX = clamp(this.buckX + mx * 165 * dt, 28, W - 28);

          /* Spawn obstacles */
          this.obsT -= dt;
          if (this.obsT <= 0) {
            var lanes = [W * 0.22, W * 0.5, W * 0.78];
            var lane = lanes[Math.floor(Math.random() * 3)];
            this.obs.push({ x: lane, y: -20 });
            this.obsT = 0.65 + Math.random() * 0.5;
          }

          /* Spawn fish */
          this.fishT -= dt;
          if (this.fishT <= 0) {
            this.catches.push({ x: 24 + Math.random() * (W - 48), y: -20 });
            this.fishT = 0.85 + Math.random() * 0.35;
          }

          /* Move objects */
          for (var oi = 0; oi < this.obs.length; oi++)     this.obs[oi].y     += spd * dt;
          for (var fi = 0; fi < this.catches.length; fi++) this.catches[fi].y += spd * 0.68 * dt;
          this.obs     = this.obs.filter(function (o) { return o.y < H + 30; });
          this.catches = this.catches.filter(function (f) { return f.y < H + 30; });

          /* Catch fish */
          var by = H * 0.76, bx = this.buckX;
          var self = this;
          this.catches = this.catches.filter(function (f) {
            if (Math.abs(f.x - bx) < 22 && Math.abs(f.y - by) < 22) {
              self.fish++;
              api.addScore(20);
              api.burst(f.x, f.y, C.ice, 7);
              self.fx.push({ x: f.x, y: f.y, t: 0.55 });
              return false;
            }
            return true;
          });
          this.fx = this.fx.filter(function (e) { e.t -= dt; return e.t > 0; });

          /* Obstacle collision */
          if (this.hitCD > 0) {
            this.hitCD -= dt;
          } else {
            for (var oi2 = 0; oi2 < this.obs.length; oi2++) {
              var o = this.obs[oi2];
              if (Math.abs(o.x - bx) < 24 && o.y > by - 22 && o.y < by + 18) {
                this.lives--;
                this.hitCD = 0.65;
                api.shake(5, 0.3);
                api.flash(C.red, 0.15);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }

          if (this.fish >= this.fishNeed) { api.win(); return; }
          if (this.timer >= this.limit)   { api.lose(); return; }
          api.addScore(Math.floor(dt * 3));
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var scroll = (api.t * 130) % 48;
          /* Snow trail */
          c.fillStyle = '#a8c0d0'; c.fillRect(0, 0, W, H);
          c.strokeStyle = '#7888a0'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(W * 0.14, 0); c.lineTo(W * 0.14, H); c.stroke();
          c.beginPath(); c.moveTo(W * 0.86, 0); c.lineTo(W * 0.86, H); c.stroke();
          /* Track ruts */
          c.globalAlpha = 0.35;
          for (var ti = -48 + scroll; ti < H + 48; ti += 48) {
            g.rect(W * 0.14 + 8, ti, 4, 22, '#6878a0');
            g.rect(W * 0.86 - 12, ti, 4, 22, '#6878a0');
          }
          c.globalAlpha = 1;
          /* Side snow + trees */
          c.fillStyle = '#c0d4e4'; c.fillRect(0, 0, W * 0.14, H);
          c.fillStyle = '#c0d4e4'; c.fillRect(W * 0.86, 0, W * 0.14, H);
          for (var trI = 0; trI < 5; trI++) {
            var ty = ((trI * 90 - api.t * 36) % (H + 80)) - 40;
            drawSpruce(g, c, 12, ty + H + 10, 36, C.spruce2);
            drawSpruce(g, c, W - 12, ty + H + 10, 36, C.spruce2);
          }
          /* Snowdrift obstacles */
          for (var oi = 0; oi < this.obs.length; oi++) {
            var o = this.obs[oi];
            g.rect(o.x - 24, o.y - 8, 48, 16, '#d4e4f0');
            c.strokeStyle = '#9ab0c4'; c.lineWidth = 2; c.strokeRect(o.x - 24, o.y - 8, 48, 16);
            c.fillStyle = '#bccedd'; c.beginPath(); c.ellipse(o.x, o.y - 8, 18, 8, 0, Math.PI, 0); c.fill();
          }
          /* Fish collectibles */
          for (var fi = 0; fi < this.catches.length; fi++) {
            var f = this.catches[fi];
            c.fillStyle = C.ice;
            c.beginPath(); c.ellipse(f.x, f.y, 9, 5, 0.3, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#2090c8';
            c.beginPath(); c.moveTo(f.x + 8, f.y - 2); c.lineTo(f.x + 13, f.y - 5); c.lineTo(f.x + 13, f.y + 1); c.closePath(); c.fill();
          }
          /* Catch pop labels */
          for (var ei = 0; ei < this.fx.length; ei++) {
            var e = this.fx[ei];
            c.globalAlpha = e.t / 0.55;
            api.txtCFit('+FISH', e.x, e.y - 10, 8, C.gold, false, 54);
            c.globalAlpha = 1;
          }
          /* Buck */
          var flash = this.hitCD > 0 && Math.floor(this.hitCD * 9) % 2 === 0;
          drawBuck(g, c, this.buckX, H * 0.76 - 14, api.t, flash);
          /* Harness line */
          if (!flash) {
            c.strokeStyle = C.gold; c.lineWidth = 2;
            c.beginPath(); c.moveTo(this.buckX - 14, H * 0.76 - 5);
            c.lineTo(this.buckX - 32, H * 0.76 + 6); c.stroke();
          }
          /* Lives */
          for (var li = 0; li < this.lives; li++) drawPaw(g, 12 + li * 22, 18, C.gold);
          /* Fish counter */
          g.rect(W - 72, 5, 64, 22, 'rgba(8,16,32,.75)');
          api.txtCFit('FISH ' + this.fish + '/' + this.fishNeed, W - 40, 12, 7, C.ice, false, 62);
          /* Timer bar */
          var tPct = Math.min(1, this.timer / this.limit);
          g.rect(0, H - 8, W, 8, '#0a1020');
          g.rect(0, H - 8, W * (1 - tPct), 8, C.gold);
          api.topBar('THE TRAIL', api.score);
          api.scanlines();
        },
      },

      /* ═══════════ 3. KING OF THE PACK — counter-strike Spitz ═══════════ */
      {
        id: 'spitz', name: 'KING OF THE PACK', sub: 'BUCK VERSUS SPITZ',
        icon: function (api, x, y) { ICONS[2](api, x, y); },
        intro: [
          'SPITZ IS THE LEAD DOG —',
          'CRUEL, BATTLE-SCARRED, FEARLESS.',
          'THE PACK FORMS A SILENT CIRCLE',
          'ON THE FROZEN RIVER.',
          'Only one will stand when it\'s over.',
        ],
        quote: '"There is an ecstasy that marks the summit of life, and beyond which life cannot rise." — Jack London',
        help: 'Watch Spitz charge! When the ring turns RED — tap to counter-strike. Don\'t get hit!',
        winText: 'Buck stands over Spitz. The pack surges forward — and acknowledges the new lead dog.',
        loseText: 'Spitz drives Buck from the ice. The pack howls his defeat.',

        init: function (api) {
          this.buckHP    = 4;
          this.counters  = 0;
          this.need      = 5;
          this.phase     = 'idle';
          this.phaseT    = 0;
          this.phaseLen  = 1.2;
          this.telegraph = 0;
          this.tapped    = false;
          this.goodHit   = false;
          this.hitCD     = 0;
          this.spitzShk  = 0;
          this.effect    = null;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.phaseT += dt;
          if (this.hitCD  > 0) this.hitCD  -= dt;
          if (this.spitzShk > 0) this.spitzShk -= dt;
          if (this.effect) { this.effect.t -= dt; if (this.effect.t <= 0) this.effect = null; }

          if (this.phase === 'idle') {
            this.telegraph = 0;
            if (this.phaseT >= this.phaseLen) {
              this.phase = 'telegraph'; this.phaseT = 0; this.phaseLen = 1.2;
              this.tapped = false; this.goodHit = false;
            }
          } else if (this.phase === 'telegraph') {
            this.telegraph = this.phaseT / this.phaseLen;
            if (this.phaseT >= this.phaseLen) {
              this.phase = 'strike'; this.phaseT = 0; this.phaseLen = 0.55;
            }
          } else if (this.phase === 'strike') {
            /* Counter window: first 0.38s of strike phase */
            if (!this.tapped && (api.keyPressed('a') || api.pointer.justDown)) {
              this.tapped = true;
              if (this.phaseT < 0.38) {
                /* Good counter */
                this.goodHit = true;
                this.counters++;
                this.spitzShk = 0.5;
                api.shake(4, 0.25);
                api.burst(190, Math.floor(H * 0.48), C.red, 10);
                api.addScore(35);
                this.effect = { x: 190, y: Math.floor(H * 0.32), t: 0.65, type: 'good' };
                if (this.counters >= this.need) { api.win(); return; }
              } else {
                this.effect = { x: W / 2, y: Math.floor(H * 0.38), t: 0.5, type: 'late' };
              }
            }

            if (this.phaseT >= this.phaseLen) {
              if (!this.goodHit && this.hitCD <= 0) {
                this.buckHP--;
                this.hitCD = 0.5;
                api.shake(8, 0.4);
                api.flash(C.red, 0.2);
                this.effect = { x: 80, y: Math.floor(H * 0.44), t: 0.6, type: 'hit' };
                if (this.buckHP <= 0) { api.lose(); return; }
              }
              this.phase = 'idle'; this.phaseT = 0;
              this.phaseLen = 0.7 + Math.random() * 0.9;
              this.telegraph = 0;
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          /* Frozen river night */
          c.fillStyle = '#0e1828'; c.fillRect(0, 0, W, H);
          /* Ice floe */
          c.fillStyle = '#bcd0e0';
          c.beginPath(); c.ellipse(W / 2, H * 0.60, W * 0.44, H * 0.26, 0, 0, Math.PI * 2); c.fill();
          c.strokeStyle = '#8aaccO'; c.strokeStyle = '#8aacb8'; c.lineWidth = 3;
          c.beginPath(); c.ellipse(W / 2, H * 0.60, W * 0.44, H * 0.26, 0, 0, Math.PI * 2); c.stroke();
          /* Ice cracks */
          c.strokeStyle = '#90aab8'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(W * 0.35, H * 0.52); c.lineTo(W * 0.38, H * 0.62); c.stroke();
          c.beginPath(); c.moveTo(W * 0.62, H * 0.55); c.lineTo(W * 0.58, H * 0.66); c.stroke();
          /* Watching wolf pack */
          for (var wi = 0; wi < 9; wi++) {
            var wAng = (wi / 9) * Math.PI * 2 + api.t * 0.08;
            var wx = W / 2 + Math.cos(wAng) * (W * 0.45);
            var wy = H * 0.60 + Math.sin(wAng) * (H * 0.29);
            c.globalAlpha = 0.55;
            g.circle(wx, wy, 5, C.wolf);
            c.globalAlpha = 1;
          }
          /* Spitz (white lead dog) — shakes on counter-hit */
          var sx = 190 + (this.spitzShk > 0 ? Math.sin(this.spitzShk * 28) * 4 : 0);
          var sy = Math.floor(H * 0.46);
          g.rect(sx - 17, sy - 5, 34, 14, '#dceaf4');
          g.rect(sx - 8,  sy - 14, 16, 10, '#ccdaea');
          g.circle(sx + 8, sy - 12, 7, '#ccdaea');
          g.rect(sx + 11, sy - 14, 4, 6, '#90aabb');
          g.rect(sx + 13, sy - 13, 2, 2, C.red);
          /* Telegraph ring */
          if (this.telegraph > 0) {
            c.globalAlpha = this.telegraph * 0.85;
            c.strokeStyle = C.red; c.lineWidth = 3 + this.telegraph * 3;
            c.beginPath(); c.arc(sx, sy - 2, 26 + this.telegraph * 10, 0, Math.PI * 2 * this.telegraph); c.stroke();
            c.globalAlpha = 1;
          }
          /* Buck */
          var bFlash = this.hitCD > 0 && Math.floor(this.hitCD * 9) % 2 === 0;
          drawBuck(g, c, 80, Math.floor(H * 0.52), api.t, bFlash);
          /* Effect label */
          if (this.effect) {
            var ea = this.effect.t > 0.25 ? 1 : this.effect.t / 0.25;
            c.globalAlpha = ea;
            var ecol = this.effect.type === 'good' ? C.aurora : (this.effect.type === 'hit' ? C.red : '#ff8820');
            var etxt = this.effect.type === 'good' ? 'BITE!' : (this.effect.type === 'hit' ? 'HIT!' : 'SLOW!');
            api.txtCFit(etxt, this.effect.x, this.effect.y, 14, ecol, false, 80);
            c.globalAlpha = 1;
          }
          /* Counter prompt */
          if (this.phase === 'telegraph' && this.telegraph > 0.6) {
            c.globalAlpha = (this.telegraph - 0.6) / 0.4;
            api.txtCFit('TAP TO COUNTER!', W / 2, H - 28, 9, C.gold, false, W - 20);
            c.globalAlpha = 1;
          } else if (this.phase === 'strike' && this.phaseT < 0.4 && !this.tapped) {
            api.txtCFit('NOW!', W / 2, H - 28, 12, C.red, false, W - 20);
          }
          /* Buck HP */
          g.rect(8, 8, 76, 12, '#0a1828');
          g.rect(8, 8, Math.max(0, 76 * this.buckHP / 4), 12, C.gold);
          api.txtCFit('BUCK', 46, 16, 7, C.white, false, 74);
          /* Spitz HP (counters landed) */
          g.rect(W - 84, 8, 76, 12, '#0a1828');
          g.rect(W - 84, 8, Math.max(0, 76 * (this.need - this.counters) / this.need), 12, C.red);
          api.txtCFit('SPITZ', W - 46, 16, 7, C.white, false, 74);
          api.topBar('KING OF THE PACK', this.counters * 35);
          api.scanlines();
        },
      },

      /* ═══════════ 4. THE THOUSAND POUNDS — rapid-tap sled pull ═══════════ */
      {
        id: 'bet', name: 'THE THOUSAND POUNDS', sub: 'A MAN\'S WAGER',
        icon: function (api, x, y) { ICONS[3](api, x, y); },
        intro: [
          'JOHN THORNTON WAGERS THAT BUCK',
          'CAN PULL A SLED LOADED WITH',
          'A THOUSAND POUNDS OF FLOUR',
          'from a dead standstill.',
          'He stakes his last dollar on it.',
        ],
        quote: '"Love, genuine passionate love, was his for the first time." — Jack London',
        help: 'Tap rapidly to build PULL POWER! Keep tapping to stay in the blue zone and drag the sled.',
        winText: 'Buck walks off with a thousand pounds! The crowd erupts. Thornton weeps.',
        loseText: 'The sled won\'t budge. The gold is gone — but Buck was willing.',

        init: function (api) {
          this.power    = 0;
          this.dist     = 0;
          this.distNeed = 100;
          this.timer    = 0;
          this.limit    = 32;
          this.lastTap  = -99;
          this.rhythm   = 0;
          this.flashGd  = 0;
        },
        update: function (api, dt) {
          this.timer += dt;

          /* Tap detection */
          var tapping = api.keyPressed('a') || api.pointer.justDown;
          if (tapping) {
            var since = this.timer - this.lastTap;
            this.lastTap = this.timer;
            if (since > 0.08 && since < 0.48) {
              this.rhythm = Math.min(1, this.rhythm + 0.28);
              this.flashGd = 0.28;
            } else {
              this.rhythm = Math.max(0, this.rhythm - 0.18);
            }
            this.power = Math.min(1, this.power + 0.12 * (1 + this.rhythm * 0.5));
          }

          /* Decay */
          this.power  = Math.max(0, this.power  - 0.28 * dt);
          this.rhythm = Math.max(0, this.rhythm - 0.55 * dt);
          if (this.flashGd > 0) this.flashGd -= dt;

          /* Advance distance */
          if (this.power > 0.25) {
            var pullSpd = this.power * 8.5;
            this.dist += pullSpd * dt;
            api.addScore(Math.floor(pullSpd * dt * 3));
          }

          if (this.dist >= this.distNeed) { api.win(); return; }
          if (this.timer >= this.limit)   { api.lose(); return; }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          /* Snowy Dawson City scene */
          var dsky = c.createLinearGradient(0, 0, 0, H * 0.55);
          dsky.addColorStop(0, '#2a5070'); dsky.addColorStop(1, '#4878a0');
          c.fillStyle = dsky; c.fillRect(0, 0, W, H * 0.55);
          g.rect(0, H * 0.55, W, H * 0.45, '#c4d8e8');
          /* Crowd silhouettes */
          for (var ci = 0; ci < 13; ci++) {
            var cx = ci * 22 + 4, cy = Math.floor(H * 0.55) - 12;
            g.rect(cx, cy, 8, 16, '#162030');
            g.circle(cx + 4, cy - 6, 5, '#162030');
          }
          /* Sled (advances across screen) */
          var sledPct = Math.min(1, this.dist / this.distNeed);
          var sledX = 22 + (W * 0.6) * sledPct;
          var by = Math.floor(H * 0.64);
          g.rect(sledX - 18, by - 10, 66, 14, '#7a5028');
          g.rect(sledX, by - 16, 46, 12, '#9a6a08');
          g.rect(sledX + 4, by - 22, 18, 10, '#c07820');
          g.rect(sledX + 26, by - 20, 16, 8, '#b06010');
          g.rect(sledX - 22, by + 4, 72, 4, '#50a0c0');
          /* Harness */
          c.strokeStyle = C.gold; c.lineWidth = 2;
          c.beginPath(); c.moveTo(sledX - 18, by - 3);
          c.lineTo(sledX - 44, by); c.stroke();
          /* Buck straining */
          var bkX = sledX - 52;
          c.save(); c.translate(bkX, by - 2);
          c.rotate(-this.power * 0.28);
          g.rect(-14, -8, 28, 14, C.buck);
          g.rect(-6, -16, 14, 10, C.buckH);
          g.circle(7, -13, 6, C.buckH);
          var leg = Math.sin(api.t * (7 + this.power * 14)) * (4 + this.power * 7);
          g.rect(-8, 4, 4, 8 + leg, C.buckD);
          g.rect(0,  4, 4, 8 - leg, C.buckD);
          g.rect(8,  4, 4, 8 + leg, C.buckD);
          c.restore();
          /* PULL boost label */
          if (this.flashGd > 0) {
            c.globalAlpha = this.flashGd / 0.28;
            api.txtCFit('PULL!', W / 2, H * 0.38, 14, C.aurora, false, W);
            c.globalAlpha = 1;
          }
          /* Power bar */
          g.rect(18, H - 74, W - 36, 20, '#0a1828');
          var pCol = this.power < 0.25 ? C.red : (this.power > 0.65 ? C.aurora : C.ice);
          g.rect(18, H - 74, (W - 36) * this.power, 20, pCol);
          /* Zone marker */
          c.strokeStyle = C.gold; c.lineWidth = 2;
          c.strokeRect(18 + (W - 36) * 0.25, H - 74, (W - 36) * 0.4, 20);
          api.txtCFit('PULL POWER', W / 2, H - 50, 7, '#4a6888', false, W - 36);
          /* Distance bar */
          g.rect(18, H - 36, W - 36, 12, '#0a1828');
          g.rect(18, H - 36, (W - 36) * Math.min(1, this.dist / this.distNeed), 12, C.ice);
          api.txtCFit(Math.floor(this.dist) + '/' + this.distNeed + ' yds', W / 2, H - 18, 7, C.white, false, W - 36);
          /* Timer */
          var tLeft = Math.max(0, Math.ceil(this.limit - this.timer));
          api.txtCFit(tLeft + 's', W - 22, 16, 9, C.gold, false, 38);
          api.topBar('THE BET', Math.floor(this.dist));
          api.scanlines();
        },
      },

      /* ═══════════ 5. THE CALL — follow wolves, dodge traps ═══════════ */
      {
        id: 'wild', name: 'THE CALL', sub: 'WHERE THE WILD THINGS SING',
        icon: function (api, x, y) { ICONS[4](api, x, y); },
        intro: [
          'JOHN THORNTON IS DEAD.',
          'THE YEEHAT TRIBE HAS COME',
          'AND GONE. NOTHING HOLDS BUCK',
          'to the world of men any longer.',
          'The wolves are calling.',
        ],
        quote: '"He was mastered by the sheer surging of life, the tidal wave of being, the perfect joy of each separate muscle, joint, and sinew." — Jack London',
        help: 'A wolf appears on one side — move toward it! Dodge hunter\'s traps. Answer the call!',
        winText: 'Buck runs with the pack through the moonlit spruce forest. The wild has claimed him.',
        loseText: 'A trapper\'s steel trap snaps shut. Buck cannot break free.',

        init: function (api) {
          this.lives  = 3;
          this.buckX  = api.W / 2;
          this.dist   = 0;
          this.need   = 110;
          this.speed  = 6;
          this.wolfX  = -1;
          this.wolfT  = 0;
          this.wolfDur = 1.4;
          this.wolfNext = 0.9;
          this.traps  = [];
          this.trapT  = 1.3;
          this.hitCD  = 0;
          this.howlEf = null;
          this.answered = 0;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.dist  += this.speed * dt;
          this.speed  = 6 + this.dist * 0.018;
          api.addScore(Math.floor(dt * 6));
          if (this.hitCD > 0) this.hitCD -= dt;

          /* Wolf howl prompt */
          this.wolfT -= dt;
          if (this.wolfT <= 0) {
            if (this.wolfX < 0) {
              this.wolfX = Math.random() < 0.5 ? W * 0.17 : W * 0.83;
              this.wolfT = this.wolfDur;
              this.howlEf = { x: this.wolfX, t: 0.9 };
            } else {
              this.wolfX = -1;
              this.wolfT = 0.5 + Math.random() * 0.45;
            }
          }
          if (this.howlEf) { this.howlEf.t -= dt; if (this.howlEf.t <= 0) this.howlEf = null; }

          /* Buck moves */
          var mx = 0;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W / 2))  mx = -1;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= W / 2)) mx =  1;
          this.buckX = clamp(this.buckX + mx * 200 * dt, 28, W - 28);

          /* Answer wolf */
          if (this.wolfX > 0) {
            var wolfSide = this.wolfX < W / 2 ? -1 : 1;
            var buckSide = this.buckX < W / 2 ? -1 : 1;
            if (wolfSide === buckSide && Math.abs(this.wolfX - this.buckX) < 62) {
              this.answered++;
              this.wolfX = -1;
              this.wolfT = 0.3;
              api.burst(Math.floor(this.buckX), Math.floor(H * 0.55), C.aurora, 8);
              api.addScore(25);
            }
          }

          /* Traps */
          this.trapT -= dt;
          if (this.trapT <= 0) {
            var tLane = Math.random() < 0.5 ? W * 0.3 : W * 0.7;
            this.traps.push({ x: tLane, y: -22 });
            this.trapT = 1.1 + Math.random() * 0.7;
          }
          var tspd = 100 + this.dist * 0.45;
          for (var ti = 0; ti < this.traps.length; ti++) this.traps[ti].y += tspd * dt;
          this.traps = this.traps.filter(function (t) { return t.y < H + 30; });

          /* Trap collision */
          if (this.hitCD <= 0) {
            var by = H * 0.72, bx = this.buckX;
            for (var tri = 0; tri < this.traps.length; tri++) {
              var tr = this.traps[tri];
              if (Math.abs(tr.x - bx) < 20 && tr.y > by - 20 && tr.y < by + 24) {
                this.lives--;
                this.hitCD = 0.8;
                api.shake(8, 0.4);
                api.flash(C.red, 0.2);
                api.burst(Math.floor(bx), Math.floor(by), C.red, 8);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }

          if (this.dist >= this.need) api.win();
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          /* Deep forest night */
          var sky = c.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#05080e'); sky.addColorStop(1, '#08100e');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          /* Moon */
          g.circle(Math.floor(W * 0.72), 54, 22, C.moon);
          c.globalAlpha = 0.14; g.circle(Math.floor(W * 0.72), 54, 34, '#a8c0d0'); c.globalAlpha = 1;
          /* Aurora (triumph) */
          drawAurora(c, W, api.t);
          /* Stars */
          for (var si = 0; si < 50; si++) {
            var sx = (si * 61 + 9) % W, sy = (si * 47 + 13) % Math.floor(H * 0.45);
            c.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(api.t * 0.9 + si));
            g.rect(sx, sy, 1, 1, C.white);
          }
          c.globalAlpha = 1;
          /* Scrolling forest */
          var scroll = (api.t * 56) % 84;
          for (var spi = 0; spi < 9; spi++) {
            var tx = ((spi * 34 - scroll) + (W + 80)) % (W + 50) - 24;
            drawSpruce(g, c, tx, Math.floor(H * 0.72), 42 + (spi % 3) * 10, '#08180c');
            drawSpruce(g, c, tx + Math.floor(W * 0.5), Math.floor(H * 0.72), 36 + (spi % 3) * 8, '#0a1e0e');
          }
          /* Snow ground */
          g.rect(0, Math.floor(H * 0.72), W, Math.floor(H * 0.28), '#a8c0cc');
          g.rect(0, Math.floor(H * 0.72), W, 4, '#bed0da');
          /* Traps */
          for (var tri = 0; tri < this.traps.length; tri++) {
            var tr = this.traps[tri];
            c.strokeStyle = '#7888a0'; c.lineWidth = 3;
            c.beginPath(); c.arc(tr.x, tr.y, 11, 0, Math.PI);     c.stroke();
            c.beginPath(); c.arc(tr.x, tr.y, 11, Math.PI, Math.PI * 2); c.stroke();
            /* Spike teeth */
            for (var ti2 = 0; ti2 < 6; ti2++) {
              var tang = (ti2 / 6) * Math.PI;
              g.rect(tr.x + Math.cos(tang) * 10 - 1, tr.y + Math.sin(tang) * 4 - 1, 2, 2, '#a0b0c0');
            }
          }
          /* Wolf */
          if (this.wolfX > 0) {
            var wAlpha = this.wolfT > 0.22 ? 1 : this.wolfT / 0.22;
            c.globalAlpha = wAlpha;
            var wy = Math.floor(H * 0.6);
            g.rect(this.wolfX - 14, wy - 8,  28, 14, C.wolf);
            g.rect(this.wolfX - 6,  wy - 16, 14, 10, C.wolfH);
            g.circle(this.wolfX + 6, wy - 13, 6, C.wolfH);
            c.fillStyle = '#3a4450';
            c.beginPath(); c.moveTo(this.wolfX + 2, wy - 18); c.lineTo(this.wolfX - 2, wy - 26); c.lineTo(this.wolfX + 7, wy - 20); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(this.wolfX + 8, wy - 18); c.lineTo(this.wolfX + 12, wy - 26); c.lineTo(this.wolfX + 14, wy - 20); c.closePath(); c.fill();
            g.circle(this.wolfX + 9, wy - 14, 2, C.aurora);
            c.globalAlpha = 1;
          }
          /* Howl text */
          if (this.howlEf && this.howlEf.t > 0.32) {
            c.globalAlpha = Math.min(1, (this.howlEf.t - 0.32) / 0.4);
            api.txtCFit('AWOO!', this.wolfX > 0 ? this.wolfX : W / 2, Math.floor(H * 0.46), 9, C.aurora, false, 70);
            c.globalAlpha = 1;
          }
          /* Buck */
          var bFlash = this.hitCD > 0 && Math.floor(this.hitCD * 9) % 2 === 0;
          drawBuck(g, c, this.buckX, Math.floor(H * 0.72) - 14, api.t, bFlash);
          /* Lives */
          for (var li = 0; li < this.lives; li++) drawPaw(g, 12 + li * 22, 18, C.gold);
          /* Distance progress */
          var dPct = Math.min(1, this.dist / this.need);
          g.rect(0, H - 8, W, 8, '#080e08');
          g.rect(0, H - 8, W * dPct, 8, C.aurora);
          api.txtCFit('TO THE WILD', W / 2, H - 15, 6, '#3a5848', false, W);
          api.topBar('THE CALL', api.score);
          api.scanlines();
        },
      },

    ], /* end chapters */
  });
})();
