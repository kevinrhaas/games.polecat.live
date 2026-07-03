/* ============================================================================
 * ALI BABA AND THE FORTY THIEVES — FIVE TALES OF GOLD AND WIT
 * From One Thousand and One Nights (Hanna Diyab / Antoine Galland, c.1710)
 *   1. THE FOREST      — hide from the forty thieves' lanterns in the trees
 *   2. OPEN SESAME     — rush the treasure cave, collect gold before it seals
 *   3. THE MARKED DOOR — mark all doors on the street to foil the thieves
 *   4. THE OIL JARS    — tap jars that stir before the captain signals
 *   5. THE DANCE       — Morgiana's dagger-dance timing to stop the captain
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ─── Palette ─── */
  var C = {
    night:  '#08060e',
    night2: '#120a1e',
    indigo: '#1a1030',
    deep:   '#0c0818',
    gold:   '#d4a020',
    goldL:  '#f0c840',
    goldD:  '#a07010',
    amber:  '#e05800',
    sand:   '#d8b870',
    sandL:  '#f0d090',
    sandD:  '#a88040',
    stone:  '#5a4a2a',
    stoneL: '#7a6a40',
    cave:   '#1a0e28',
    caveL:  '#2e1a44',
    gem:    '#00c8a0',
    ruby:   '#cc1844',
    sky:    '#160c28',
    star:   '#e8d8a0',
    purple: '#4a2878',
    purpleL:'#6a3aaa',
    teal:   '#006080',
    tealL:  '#0088b0',
    white:  '#f0e8d0',
    cream:  '#e0d0a0',
    lantern:'#ff9020',
    lanternL:'#ffcc60',
    door:   '#7a5030',
    doorL:  '#a06840',
    chalk:  '#c0b8a8',
    jar:    '#8a5020',
    jarL:   '#b07038',
    jarD:   '#5a3010',
    red:    '#cc1022',
    dark:   '#080610',
  };

  /* ─── Helpers ─── */
  function star(c, x, y, r, col, alpha) {
    c.globalAlpha = alpha === undefined ? 1 : alpha;
    c.fillStyle = col;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }

  function drawStars(c, t, W) {
    for (var si = 0; si < 54; si++) {
      var sx = (si * 83 + 17) % W;
      var sy = (si * 61 + 13) % 130;
      var al = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.7 + si * 0.4));
      star(c, sx, sy, si % 3 === 0 ? 1.5 : 0.8, C.star, al);
    }
  }

  function drawMoon(c, cx, cy, r) {
    c.fillStyle = '#f0e8b0';
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = C.night;
    c.beginPath(); c.arc(cx + r * 0.38, cy - r * 0.12, r * 0.82, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.18;
    c.fillStyle = '#f0e880';
    c.beginPath(); c.arc(cx, cy, r + 6, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }

  function drawPalm(g, c, x, base, h) {
    g.rect(x - 3, base - h, 6, h, '#4a3010');
    var branches = [[-18,-h+8], [18,-h+4], [-14,-h+18], [16,-h+16], [0,-h+2]];
    for (var b = 0; b < branches.length; b++) {
      var bx = x + branches[b][0], by = base + branches[b][1];
      c.strokeStyle = '#2a5018'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x, base - h + 6);
      c.quadraticCurveTo(bx - branches[b][0] * 0.3, by - 8, bx, by);
      c.stroke();
      /* leaf */
      c.fillStyle = '#3a6822';
      c.beginPath(); c.ellipse(bx, by, 8, 3, Math.atan2(by - (base - h + 6), bx - x), 0, Math.PI * 2); c.fill();
    }
  }

  function drawDune(c, x, y, w, h, col) {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x, y + h);
    c.quadraticCurveTo(x + w * 0.35, y, x + w * 0.52, y + h * 0.35);
    c.quadraticCurveTo(x + w * 0.7, y + h * 0.1, x + w, y + h);
    c.closePath(); c.fill();
  }

  function drawCamel(g, c, x, y, dir) {
    /* body */
    g.rect(x - 14, y - 8, 28, 12, C.sandD);
    /* hump */
    c.fillStyle = C.sandD;
    c.beginPath(); c.ellipse(x, y - 13, 8, 7, 0, 0, Math.PI * 2); c.fill();
    /* head */
    var hx = dir > 0 ? x + 16 : x - 16;
    g.rect(hx - 4, y - 14, 8, 10, C.sand);
    g.rect(hx - 3, y - 4, 5, 4, C.sandD);
    /* legs */
    var lp = [[x - 10, y + 4], [x - 4, y + 4], [x + 4, y + 4], [x + 10, y + 4]];
    for (var li = 0; li < lp.length; li++) g.rect(lp[li][0] - 1, lp[li][1], 3, 8, C.sandD);
  }

  function drawLanternCone(c, lx, ly, angle, len, W) {
    c.fillStyle = 'rgba(255,180,40,.11)';
    c.beginPath();
    c.moveTo(lx, ly);
    var spread = 0.45;
    var a1 = angle - spread, a2 = angle + spread;
    c.lineTo(lx + Math.cos(a1) * len, ly + Math.sin(a1) * len);
    c.lineTo(lx + Math.cos(angle) * len, ly + Math.sin(angle) * len);
    c.lineTo(lx + Math.cos(a2) * len, ly + Math.sin(a2) * len);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,190,50,.16)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(lx, ly);
    c.lineTo(lx + Math.cos(a1) * len, ly + Math.sin(a1) * len);
    c.moveTo(lx, ly);
    c.lineTo(lx + Math.cos(a2) * len, ly + Math.sin(a2) * len);
    c.stroke();
    /* lantern dot */
    c.fillStyle = C.lanternL;
    c.beginPath(); c.arc(lx, ly, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = C.lantern;
    c.beginPath(); c.arc(lx, ly, 3, 0, Math.PI * 2); c.fill();
  }

  function drawJar(g, c, x, y, eyeAlpha) {
    var base = y + 18;
    /* jar body */
    c.fillStyle = C.jar;
    c.beginPath();
    c.ellipse(x, base - 12, 12, 18, 0, 0, Math.PI * 2); c.fill();
    /* neck */
    g.rect(x - 5, base - 32, 10, 8, C.jarL);
    /* rim */
    c.fillStyle = C.jarD;
    c.beginPath(); c.ellipse(x, base - 32, 7, 3, 0, 0, Math.PI * 2); c.fill();
    /* jar highlight */
    c.globalAlpha = 0.22;
    c.fillStyle = C.sandL;
    c.beginPath(); c.ellipse(x - 4, base - 18, 3, 8, -0.4, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    /* shadow */
    c.globalAlpha = 0.3;
    c.fillStyle = '#000';
    c.beginPath(); c.ellipse(x, base + 3, 10, 3, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    /* eyes */
    if (eyeAlpha > 0) {
      c.globalAlpha = eyeAlpha;
      c.fillStyle = '#ff4020';
      c.beginPath(); c.arc(x - 4, base - 14, 3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + 4, base - 14, 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ff8040';
      c.beginPath(); c.arc(x - 4, base - 14, 1.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + 4, base - 14, 1.5, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    }
  }

  function drawDagger(g, c, x, y, angle) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    /* blade */
    c.fillStyle = '#c0d0e0';
    c.beginPath(); c.moveTo(0, -22); c.lineTo(-3, 0); c.lineTo(3, 0); c.closePath(); c.fill();
    /* guard */
    g.rect(-6, 0, 12, 3, C.goldD);
    /* handle */
    c.fillStyle = C.ruby;
    c.beginPath(); c.roundRect ? c.roundRect(-3, 3, 6, 12, 2) :
      (c.rect(-3, 3, 6, 12)); c.fill();
    /* pommel */
    c.fillStyle = C.gold;
    c.beginPath(); c.arc(0, 18, 4, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  /* ─── Emblem: treasure chest with gold coins ─── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    /* chest */
    g.rect(cx - 18, cy - 6, 36, 22, C.stone);
    g.rect(cx - 18, cy - 6, 36, 10, C.stoneL);
    /* hinge band */
    g.rect(cx - 18, cy + 3, 36, 3, C.gold);
    /* lock */
    g.rect(cx - 5, cy - 2, 10, 8, C.goldD);
    c.fillStyle = C.goldL;
    c.beginPath(); c.arc(cx, cy + 1, 3, 0, Math.PI * 2); c.fill();
    /* coins spilling */
    var coils = [[-12,-12], [0,-14], [12,-12], [-6,-20], [8,-20]];
    for (var ci = 0; ci < coils.length; ci++) {
      c.fillStyle = C.goldL;
      c.beginPath(); c.ellipse(cx + coils[ci][0], cy + coils[ci][1], 5, 3, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = C.gold;
      c.beginPath(); c.arc(cx + coils[ci][0], cy + coils[ci][1] - 1, 2, 0, Math.PI * 2); c.fill();
    }
  }

  /* ─── Scenery ─── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    /* Desert night sky gradient */
    var sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, C.night);
    sky.addColorStop(0.5, C.night2);
    sky.addColorStop(1, '#200a14');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    drawStars(c, t, W);
    drawMoon(c, W - 44, 38, 18);

    if (scene === 'menu') {
      /* Daytime desert: bright sandy sky with dunes and palace */
      var dSky = c.createLinearGradient(0, 0, 0, H);
      dSky.addColorStop(0, '#1e1040');
      dSky.addColorStop(0.6, '#2e1858');
      dSky.addColorStop(1, '#3a2060');
      c.fillStyle = dSky; c.fillRect(0, 0, W, H);
      drawStars(c, t, W);
      drawMoon(c, W - 44, 38, 18);

      /* Palace silhouette */
      c.fillStyle = '#16082a';
      c.beginPath();
      /* main wall */
      c.rect(20, H * 0.26, W - 40, H * 0.36);
      /* towers */
      c.rect(20, H * 0.14, 28, H * 0.36);
      c.rect(W - 48, H * 0.14, 28, H * 0.36);
      /* center dome */
      c.beginPath();
      c.arc(W / 2, H * 0.18, 28, Math.PI, 0);
      c.rect(W / 2 - 28, H * 0.18, 56, H * 0.26 - H * 0.18);
      c.fill();
      /* tower caps (pointed) */
      c.fillStyle = '#16082a';
      c.beginPath();
      c.moveTo(20, H * 0.14); c.lineTo(34, H * 0.06); c.lineTo(48, H * 0.14); c.closePath(); c.fill();
      c.beginPath();
      c.moveTo(W - 48, H * 0.14); c.lineTo(W - 34, H * 0.06); c.lineTo(W - 20, H * 0.14); c.closePath(); c.fill();
      /* arched windows (glowing gold) */
      var wins = [W / 2 - 30, W / 2, W / 2 + 30];
      for (var wi = 0; wi < wins.length; wi++) {
        c.globalAlpha = 0.3 + 0.1 * Math.sin(t * 0.7 + wi);
        c.fillStyle = C.goldL;
        c.beginPath(); c.arc(wins[wi], H * 0.36, 6, Math.PI, 0); c.rect(wins[wi] - 6, H * 0.36, 12, 10); c.fill();
        c.globalAlpha = 1;
      }

      /* Dunes */
      drawDune(c, -10, H * 0.52, 160, 60, C.sandD);
      drawDune(c, 130, H * 0.50, 160, 70, '#6a5020');
      c.fillStyle = C.sand;
      c.fillRect(0, H * 0.60, W, H * 0.40);
      /* Dune ridge highlight */
      c.globalAlpha = 0.3;
      c.fillStyle = C.sandL;
      c.beginPath();
      for (var dx = 0; dx <= W; dx += 8) c.lineTo(dx, H * 0.58 - Math.sin(dx * 0.025) * 8);
      c.lineTo(W, H * 0.62); c.lineTo(0, H * 0.62); c.closePath(); c.fill();
      c.globalAlpha = 1;

      /* Palms */
      drawPalm(g, c, 34, H * 0.60, 50);
      drawPalm(g, c, W - 30, H * 0.60, 44);

      /* Camel */
      drawCamel(g, c, W * 0.68, H * 0.60 - 8, 1);
      return;
    }

    /* Default night scene (boot / intro / result / finale) */
    /* Dunes */
    drawDune(c, -10, H * 0.60, 160, 50, '#2a1808');
    drawDune(c, 100, H * 0.58, 170, 65, '#1e1006');
    c.fillStyle = '#1e1008';
    c.fillRect(0, H * 0.68, W, H * 0.32);
    /* Sand ground */
    c.fillStyle = '#28180a';
    c.fillRect(0, H * 0.70, W, H * 0.30);
    /* Palm silhouettes */
    var palmX = [20, W - 22];
    for (var pi = 0; pi < 2; pi++) {
      var ph = 50 + pi * 10;
      g.rect(palmX[pi] - 2, H * 0.70 - ph, 4, ph, '#2e1a04');
      for (var bl = 0; bl < 4; bl++) {
        var bax = palmX[pi] + (bl % 2 === 0 ? -1 : 1) * (10 + bl * 5);
        var bay = H * 0.70 - ph + bl * 5;
        c.strokeStyle = '#1e3808'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(palmX[pi], H * 0.70 - ph);
        c.quadraticCurveTo(palmX[pi] + (bl % 2 === 0 ? -6 : 6), bay - 6, bax, bay);
        c.stroke();
      }
    }
    /* Floating torch lights */
    for (var ti = 0; ti < 3; ti++) {
      var tx2 = 40 + ti * 95;
      c.globalAlpha = 0.08 + 0.04 * Math.sin(t * 1.1 + ti);
      c.fillStyle = C.goldL;
      c.beginPath(); c.arc(tx2, H * 0.70, 18, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      g.rect(tx2 - 2, H * 0.70 - 12, 4, 14, '#5a3a10');
      c.fillStyle = C.lantern;
      c.beginPath(); c.arc(tx2, H * 0.70 - 14, 4, 0, Math.PI * 2); c.fill();
    }

    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(8,4,16,.78)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Chapter-select card layout: Five arched doorways arranged 2-1-2 ─── */
  var CARDS = [
    { x: 14,  y: 78,  w: 108, h: 72 },   // ch 1 — top-left
    { x: 148, y: 78,  w: 108, h: 72 },   // ch 2 — top-right
    { x: 81,  y: 178, w: 108, h: 72 },   // ch 3 — center
    { x: 14,  y: 278, w: 108, h: 72 },   // ch 4 — bottom-left
    { x: 148, y: 278, w: 108, h: 72 },   // ch 5 — bottom-right
  ];

  /* ─── Chapter icons ─── */
  var ICONS = [
    function (api, x, y) { /* eye in triangle (hidden watcher) */
      var c = api.ctx;
      c.strokeStyle = C.gold; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x, y - 9); c.lineTo(x - 10, y + 6); c.lineTo(x + 10, y + 6); c.closePath(); c.stroke();
      c.fillStyle = C.indigo;
      c.beginPath(); c.arc(x, y + 1, 4, 0, Math.PI * 2); c.fill();
      c.fillStyle = C.goldL;
      c.beginPath(); c.arc(x, y + 1, 2, 0, Math.PI * 2); c.fill();
    },
    function (api, x, y) { /* treasure bag */
      var c = api.ctx, g = api.gfx;
      c.fillStyle = C.goldD;
      c.beginPath(); c.arc(x, y + 2, 9, 0, Math.PI * 2); c.fill();
      c.fillStyle = C.gold;
      c.beginPath(); c.arc(x, y + 1, 7, Math.PI, 0, false); c.fill();
      g.rect(x - 3, y - 8, 6, 6, C.stoneL);
      c.strokeStyle = C.goldL; c.lineWidth = 1;
      c.beginPath(); c.arc(x, y + 1, 4, 0, Math.PI); c.stroke();
    },
    function (api, x, y) { /* chalk mark / door */
      var g = api.gfx, c = api.ctx;
      g.rect(x - 6, y - 8, 12, 16, C.door);
      c.strokeStyle = C.chalk; c.lineWidth = 2;
      c.beginPath(); c.arc(x, y - 8, 6, Math.PI, 0); c.stroke();
      c.beginPath(); c.moveTo(x - 3, y - 2); c.lineTo(x + 3, y + 4);
      c.moveTo(x + 3, y - 2); c.lineTo(x - 3, y + 4); c.stroke();
    },
    function (api, x, y) { /* oil jar */
      var g = api.gfx, c = api.ctx;
      c.fillStyle = C.jar;
      c.beginPath(); c.ellipse(x, y + 3, 8, 11, 0, 0, Math.PI * 2); c.fill();
      g.rect(x - 4, y - 10, 8, 8, C.jarL);
      c.fillStyle = C.jarD;
      c.beginPath(); c.ellipse(x, y - 10, 5, 2, 0, 0, Math.PI * 2); c.fill();
    },
    function (api, x, y) { /* dagger */
      var c = api.ctx;
      c.save(); c.translate(x, y); c.rotate(-0.5);
      c.fillStyle = '#b8ccd0';
      c.beginPath(); c.moveTo(0, -11); c.lineTo(-2, 2); c.lineTo(2, 2); c.closePath(); c.fill();
      c.fillStyle = C.gold; c.fillRect(-5, 2, 10, 3);
      c.fillStyle = C.ruby; c.fillRect(-2, 5, 4, 6);
      c.restore();
    },
  ];

  /* ─── SAGA ─── */
  RetroSaga.create({
    id: 'alibaba',
    title: 'Open Sesame',
    subtitle: 'FIVE TALES OF GOLD AND WIT',
    currency: 'GOLD',
    screens: {
      win:          '#f0c840',
      lose:         '#cc1844',
      chapterLabel: '#a090c0',
      name:         '#f0e8d0',
      sub:          '#d4a020',
      intro:        '#c8b880',
      quote:        '#8070a0',
      help:         '#d4a020',
      score:        '#f0e8d0',
      cur:          '#f0c840',
      cta:          '#f0e8d0',
      overlay:      'rgba(8,4,16,.86)',
    },
    labels: {
      chapter: 'TALE',
      score:   'GOLD EARNED',
      win:     'THE CAVE YIELDS',
      lose:    'THE THIEVES RETURN',
      cont:    'TAP TO PRESS ON',
      finale:  'TAP TO CLAIM YOUR FORTUNE',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO BEGIN',
    },
    accent:   '#d4a020',
    credit:   'ONE THOUSAND AND ONE NIGHTS',
    bootLine: 'FORTY THIEVES · ONE WOODCUTTER · ONE WORD',
    tagline:  'A POLECAT ADVENTURE',
    emblem, scenery,
    bootCta:   'OPEN SESAME',
    menuLabel: 'THE FORTY THIEVES',
    menuHint:  'CHOOSE YOUR TALE',
    menuDone:  'THE GOLD IS YOURS',
    finale: [
      'THE THIEVES ARE UNDONE.',
      '',
      'ALI BABA LIVES IN WEALTH',
      'AND PEACE.',
      '',
      'MORGIANA IS FREED,',
      'AND THE CAVE HOLDS ITS SECRETS',
      'NO MORE.',
    ],
    width: 270, height: 480, parent: '#game',

    menu: {
      colors: { title: C.white, label: C.sandL, cur: C.goldL, done: C.gem, lock: '#3a2860' },

      title: function (api, score) {
        var g = api.gfx, c = api.ctx, W = api.W;
        /* Ornate header band */
        var hg = c.createLinearGradient(0, 8, 0, 66);
        hg.addColorStop(0, '#2a1848'); hg.addColorStop(1, '#1a0e30');
        c.fillStyle = hg; c.fillRect(10, 8, W - 20, 58);
        /* Gold border */
        c.strokeStyle = C.gold; c.lineWidth = 2;
        c.strokeRect(10, 8, W - 20, 58);
        /* Inner double line */
        c.strokeStyle = C.goldD; c.lineWidth = 1;
        c.strokeRect(14, 12, W - 28, 50);
        /* Corner ornaments */
        var corners = [[14,12],[W-14,12],[14,62],[W-14,62]];
        for (var ci = 0; ci < corners.length; ci++) {
          g.circle(corners[ci][0], corners[ci][1], 3, C.gold);
        }
        api.txtCFit('THE FORTY THIEVES', W / 2, 22, 7, C.goldL, false, W - 40);
        api.txtCFit('GOLD  ' + score, W / 2, 40, 7, C.gold, false, W - 40);
        /* Small lantern icons */
        for (var li = 0; li < 3; li++) {
          var lx = 30 + li * 105;
          c.fillStyle = C.lantern;
          c.beginPath(); c.arc(lx, 58, 4, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 0.3;
          c.fillStyle = C.goldL;
          c.beginPath(); c.arc(lx, 58, 8, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
        }
      },

      layout: function () { return CARDS; },

      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done, best = info.best;
        var cx2 = x + w / 2;

        /* Arch doorway shape */
        var archH = h * 0.55;
        var wallCol = sel ? '#2e1c50' : (done ? '#1e1438' : '#16102e');
        var borderCol = sel ? C.goldL : (done ? C.gem : C.purple);

        c.fillStyle = wallCol;
        c.beginPath();
        c.arc(cx2, y + archH, w * 0.38, Math.PI, 0);
        c.lineTo(x + w - 4, y + h - 4);
        c.lineTo(x + 4, y + h - 4);
        c.lineTo(x + 4, y + archH);
        c.closePath(); c.fill();

        /* Arch border */
        c.strokeStyle = borderCol; c.lineWidth = sel ? 3 : 2;
        c.beginPath();
        c.arc(cx2, y + archH, w * 0.38, Math.PI, 0);
        c.lineTo(x + w - 4, y + h - 4);
        c.moveTo(x + 4, y + h - 4);
        c.lineTo(x + 4, y + archH);
        c.stroke();
        /* Base line */
        c.beginPath(); c.moveTo(x + 4, y + h - 4); c.lineTo(x + w - 4, y + h - 4); c.stroke();

        /* Arch keystone */
        c.fillStyle = sel ? C.goldL : (done ? C.gem : C.purpleL);
        c.beginPath(); c.arc(cx2, y + archH - w * 0.38, 4, 0, Math.PI * 2); c.fill();

        /* Torch on sides */
        g.rect(cx2 - w * 0.32 + 2, y + archH + 8, 3, 12, '#4a3010');
        c.fillStyle = sel ? C.lanternL : C.lantern;
        c.globalAlpha = 0.7 + (sel ? 0.3 : 0);
        c.beginPath(); c.arc(cx2 - w * 0.32 + 3, y + archH + 6, 4, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 1;

        /* Tale number */
        var taleNums = ['TALE I', 'TALE II', 'TALE III', 'TALE IV', 'TALE V'];
        api.txtCFit(taleNums[i], cx2, y + archH * 0.32, 6, sel ? C.goldL : (done ? C.gem : C.purpleL), false, w - 12);

        /* Chapter name */
        var shortNames = ['THE FOREST', 'OPEN SESAME', 'MARKED DOOR', 'THE OIL JARS', 'THE DANCE'];
        api.txtCFit(shortNames[i], cx2, y + archH * 0.52, 6,
          done ? C.gem : (sel ? C.white : '#8070a0'), false, w - 12);

        /* Icon */
        ICONS[i](api, cx2, y + archH + 28);

        /* Best score */
        if (best && best > 0) {
          api.txtCFit('' + best, cx2, y + h - 14, 5, C.gold, false, w - 12);
        }
      },
    },

    chapters: [

      /* ═══════════ 1. THE FOREST — hide from 40 thieves' lanterns ═══════════ */
      {
        id: 'forest', name: 'THE FOREST', sub: 'HIDDEN AMONG THE TREES',
        icon: function (api, x, y) { ICONS[0](api, x, y); },
        intro: [
          'ALI BABA, A POOR WOODCUTTER,',
          'is gathering wood when forty',
          'thieves ride into the forest.',
          'He climbs a tree and hides.',
          'Their lanterns sweep every shadow.',
        ],
        quote: '"He who trusts his own observation learns more than he who listens only to others." — Arabian Nights',
        help: 'Stay out of the thieves\' lantern beams! Tap sides or drag to move. Survive to earn gold!',
        winText: 'You stayed hidden until the thieves departed. Ali Baba climbs down, breathless.',
        loseText: 'Caught in the lantern beam! The thieves wheel their horses toward you.',

        init: function (api) {
          this.lives   = 3;
          this.survive = 0;
          this.target  = 24;
          this.ali     = { x: api.W / 2, y: api.H * 0.68 };
          this.aliV    = 0;
          this.lanterns = [
            { x: -20, y: api.H * 0.5, dir: 1, speed: 52, angle: 0 },
            { x: api.W + 20, y: api.H * 0.62, dir: -1, speed: 40, angle: Math.PI },
            { x: api.W / 2, y: 0, dir: 0, speed: 0, angle: Math.PI / 2 },
          ];
          this.flash    = 0;
          this.trees    = [];
          /* Generate static tree positions */
          for (var ti = 0; ti < 7; ti++) {
            this.trees.push({ x: 20 + ti * 36, h: 60 + (ti % 3) * 20 });
          }
          this.invincible = 0;
          this.score      = 0;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.survive += dt;
          if (this.survive >= this.target) {
            api.addScore(Math.max(0, 200 - Math.floor(this.survive - this.target) * 2));
            api.win(); return;
          }
          this.flash = Math.max(0, this.flash - dt);
          this.invincible = Math.max(0, this.invincible - dt);

          /* Ali Baba movement */
          var speed = 130;
          var ptr = api.pointer;
          if (ptr.down) {
            var dx = ptr.x - this.ali.x;
            this.aliV = Retro.util.clamp(dx * 6, -speed, speed);
          } else if (api.keyDown('left'))  { this.aliV = -speed; }
          else if (api.keyDown('right')) { this.aliV = speed; }
          else { this.aliV *= 0.85; }

          this.ali.x = clamp(this.ali.x + this.aliV * dt, 14, W - 14);

          /* Update lanterns */
          var t = api.t;
          /* Lantern 0: sweeps left-right at mid height */
          this.lanterns[0].x += this.lanterns[0].dir * this.lanterns[0].speed * dt;
          this.lanterns[0].angle = this.lanterns[0].dir > 0 ? 0.3 : Math.PI - 0.3;
          if (this.lanterns[0].x > W + 24) { this.lanterns[0].x = -24; this.lanterns[0].dir = 1; }
          if (this.lanterns[0].x < -24) { this.lanterns[0].x = W + 24; this.lanterns[0].dir = -1; }

          /* Lantern 1: sweeps right-left higher up */
          this.lanterns[1].x += this.lanterns[1].dir * this.lanterns[1].speed * dt;
          this.lanterns[1].angle = this.lanterns[1].dir > 0 ? 0.6 : Math.PI - 0.6;
          if (this.lanterns[1].x > W + 24) { this.lanterns[1].x = -24; }
          if (this.lanterns[1].x < -24) { this.lanterns[1].x = W + 24; }

          /* Lantern 2: oscillates from top, pointing down */
          this.lanterns[2].x = W * 0.5 + Math.sin(t * 0.8) * W * 0.35;
          this.lanterns[2].angle = Math.PI / 2 + Math.sin(t * 0.4) * 0.3;

          /* Increase speed over time */
          var progress = this.survive / this.target;
          this.lanterns[0].speed = 52 + progress * 38;
          this.lanterns[1].speed = 40 + progress * 30;

          /* Collision with lantern cones */
          if (this.invincible <= 0) {
            var ax = this.ali.x, ay = this.ali.y;
            for (var li = 0; li < this.lanterns.length; li++) {
              var lntn = this.lanterns[li];
              var dx2 = ax - lntn.x, dy2 = ay - lntn.y;
              var dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
              if (dist < 100) {
                var testAngle = Math.atan2(dy2, dx2);
                var angleDiff = Math.abs(((testAngle - lntn.angle) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
                if (angleDiff < 0.42 && dist < 88) {
                  this.lives--;
                  this.flash = 0.6;
                  this.invincible = 1.4;
                  api.shake(4, 0.3);
                  api.audio.sfx('hurt');
                  if (this.lives <= 0) { api.lose(); return; }
                }
              }
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          /* Dark forest background */
          var bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#060410'); bg.addColorStop(1, '#0e080a');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          /* Stars */
          drawStars(c, api.t, W);
          drawMoon(c, W - 34, 32, 14);

          /* Tree trunks & canopy */
          for (var ti = 0; ti < this.trees.length; ti++) {
            var tr = this.trees[ti];
            g.rect(tr.x - 4, H * 0.58 - tr.h * 0.3, 8, H * 0.42 + tr.h * 0.3, '#2a1606');
            c.fillStyle = '#183008';
            c.beginPath();
            c.ellipse(tr.x, H * 0.58 - tr.h * 0.3, 22, tr.h * 0.45, 0, 0, Math.PI * 2);
            c.fill();
          }

          /* Ground */
          c.fillStyle = '#120a04';
          c.beginPath(); c.moveTo(0, H);
          for (var gx = 0; gx <= W; gx += 12) c.lineTo(gx, H * 0.58 - Math.sin(gx * 0.03) * 6);
          c.lineTo(W, H); c.closePath(); c.fill();

          /* Lanterns and cones */
          for (var ln = 0; ln < this.lanterns.length; ln++) {
            var lntn = this.lanterns[ln];
            drawLanternCone(c, lntn.x, lntn.y, lntn.angle, 100, W);
          }

          /* Ali Baba */
          var flash = this.flash > 0 && Math.floor(this.flash * 10) % 2 === 0;
          if (!flash) {
            var ax = this.ali.x, ay = this.ali.y;
            /* Body */
            g.rect(ax - 7, ay - 22, 14, 16, '#3a2870');
            /* Head */
            g.circle(ax, ay - 28, 7, C.sand);
            /* Turban */
            g.rect(ax - 8, ay - 36, 16, 6, '#4a2090');
            g.circle(ax, ay - 38, 5, '#5a28b0');
            /* Robe skirt */
            c.fillStyle = '#302060';
            c.beginPath(); c.moveTo(ax - 10, ay - 6); c.lineTo(ax - 14, ay); c.lineTo(ax + 14, ay); c.lineTo(ax + 10, ay - 6); c.closePath(); c.fill();
          }

          /* HUD */
          api.topBar('THE FOREST', this.lives, 3,
            Math.floor((this.target - this.survive) * 10) / 10 + 's', C.goldL);
        },
      },

      /* ═══════════ 2. OPEN SESAME — rush into the cave ═══════════ */
      {
        id: 'sesame', name: 'OPEN SESAME', sub: 'TREASURE BEYOND ALL TELLING',
        icon: function (api, x, y) { ICONS[1](api, x, y); },
        intro: [
          'THE CAPTAIN COMMANDS:',
          '"OPEN SESAME!"',
          'A great door rolls open in the rock.',
          'Ali Baba slips inside...',
          'Treasure fills every chamber.',
          'But the door will close again soon!',
        ],
        quote: '"Open Sesame!" — Ali Baba (from the Arabian Nights)',
        help: 'Collect gold bags before the cave door seals! Dodge stalactites. Tap sides or drag left/right.',
        winText: 'The bags are secured! Ali Baba steps back as the door thunders shut.',
        loseText: 'Caught by a falling rock — or the door sealed before enough gold was gathered.',

        init: function (api) {
          this.lives    = 3;
          this.bags     = 0;
          this.target   = 12;
          this.timer    = 26;
          this.elapsed  = 0;
          this.ali      = { x: api.W / 2, y: api.H * 0.70 };
          this.aliV     = 0;
          this.items    = [];
          this.spawnT   = 0;
          this.invincible = 0;
          this.doorOpen = 1; /* 1 = fully open, 0 = closed */
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.elapsed += dt;
          this.doorOpen = Math.max(0, 1 - this.elapsed / this.timer);

          if (this.elapsed >= this.timer) {
            if (this.bags < this.target) { api.lose(); return; }
          }
          if (this.bags >= this.target) {
            api.addScore(Math.max(0, 200 + Math.floor((this.timer - this.elapsed) * 5)));
            api.win(); return;
          }

          this.invincible = Math.max(0, this.invincible - dt);

          /* Ali Baba movement */
          var speed = 140;
          var ptr = api.pointer;
          if (ptr.down) {
            var dx = ptr.x - this.ali.x;
            this.aliV = clamp(dx * 6, -speed, speed);
          } else if (api.keyDown('left'))  { this.aliV = -speed; }
          else if (api.keyDown('right')) { this.aliV = speed; }
          else { this.aliV *= 0.82; }
          this.ali.x = clamp(this.ali.x + this.aliV * dt, 14, W - 14);

          /* Spawn items */
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var progress = this.elapsed / this.timer;
            var isRock = Math.random() < 0.3;
            this.items.push({
              x: 20 + Math.random() * (W - 40),
              y: -16,
              vy: 90 + progress * 60 + Math.random() * 40,
              type: isRock ? 'rock' : 'bag',
            });
            this.spawnT = 0.55 - progress * 0.18;
          }

          /* Update items */
          for (var ii = this.items.length - 1; ii >= 0; ii--) {
            var item = this.items[ii];
            item.y += item.vy * dt;
            if (item.y > H + 20) { this.items.splice(ii, 1); continue; }

            var dx2 = this.ali.x - item.x, dy2 = this.ali.y - item.y;
            if (Math.abs(dx2) < 18 && Math.abs(dy2) < 20) {
              if (item.type === 'bag') {
                this.bags++;
                api.addScore(10);
                api.audio.sfx('coin');
                api.burst(item.x, item.y, C.gold, 5);
              } else if (this.invincible <= 0) {
                this.lives--;
                this.invincible = 1.2;
                api.shake(4, 0.3);
                api.audio.sfx('hurt');
                api.burst(item.x, item.y, C.red, 4);
                if (this.lives <= 0) { api.lose(); return; }
              }
              this.items.splice(ii, 1);
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          /* Cave interior */
          var bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#100818'); bg.addColorStop(1, '#2a1610');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          /* Cave walls — rough stone sides */
          c.fillStyle = '#1a0e20';
          c.beginPath(); c.moveTo(0, 0); c.lineTo(24, 0); c.lineTo(28, H); c.lineTo(0, H); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(W, 0); c.lineTo(W - 24, 0); c.lineTo(W - 28, H); c.lineTo(W, H); c.closePath(); c.fill();

          /* Stalactites from ceiling */
          for (var si = 0; si < 8; si++) {
            var sx = 30 + si * 28;
            var sh = 20 + (si % 3) * 12;
            c.fillStyle = '#2a1a30';
            c.beginPath(); c.moveTo(sx - 6, 0); c.lineTo(sx + 6, 0); c.lineTo(sx, sh); c.closePath(); c.fill();
          }

          /* Torch lights on walls */
          for (var ti2 = 0; ti2 < 2; ti2++) {
            var tx2 = ti2 === 0 ? 20 : W - 20;
            c.globalAlpha = 0.35 + 0.1 * Math.sin(api.t * 1.5 + ti2);
            c.fillStyle = C.goldL;
            c.beginPath(); c.arc(tx2, H * 0.35, 22, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            g.rect(tx2 - 2, H * 0.35 - 16, 4, 14, '#4a2a08');
            c.fillStyle = C.lantern;
            c.beginPath(); c.arc(tx2, H * 0.35 - 18, 5, 0, Math.PI * 2); c.fill();
          }

          /* Treasure piles */
          var tPiles = [[W * 0.22, H * 0.82], [W * 0.55, H * 0.85], [W * 0.80, H * 0.80]];
          for (var tp = 0; tp < tPiles.length; tp++) {
            var px2 = tPiles[tp][0], py2 = tPiles[tp][1];
            c.fillStyle = C.goldD;
            c.beginPath(); c.ellipse(px2, py2, 18, 10, 0, 0, Math.PI * 2); c.fill();
            for (var co = 0; co < 5; co++) {
              c.fillStyle = co % 2 === 0 ? C.gold : C.goldL;
              c.beginPath(); c.ellipse(
                px2 + (co - 2) * 6, py2 - 4 - (co === 2 ? 4 : 0),
                4, 2.5, 0, 0, Math.PI * 2); c.fill();
            }
          }

          /* Cave floor */
          c.fillStyle = '#1e1008';
          c.beginPath(); c.moveTo(0, H * 0.88);
          for (var fx = 0; fx <= W; fx += 10) c.lineTo(fx, H * 0.88 - Math.sin(fx * 0.04) * 4);
          c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();

          /* Items (bags and rocks) */
          for (var ii = 0; ii < this.items.length; ii++) {
            var item = this.items[ii];
            if (item.type === 'bag') {
              c.fillStyle = C.gold;
              c.beginPath(); c.arc(item.x, item.y + 3, 9, 0, Math.PI * 2); c.fill();
              c.fillStyle = C.goldL;
              c.beginPath(); c.arc(item.x, item.y + 1, 7, Math.PI, 0, false); c.fill();
              g.rect(item.x - 3, item.y - 8, 6, 6, C.stoneL);
            } else {
              c.fillStyle = '#4a3a28';
              c.beginPath(); c.arc(item.x, item.y, 8, 0, Math.PI * 2); c.fill();
              c.fillStyle = '#6a5038';
              c.beginPath(); c.arc(item.x - 2, item.y - 2, 3, 0, Math.PI * 2); c.fill();
            }
          }

          /* Ali Baba */
          var flash2 = this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0;
          if (!flash2) {
            var ax = this.ali.x, ay = this.ali.y;
            g.rect(ax - 7, ay - 22, 14, 16, '#3a2870');
            g.circle(ax, ay - 28, 7, C.sand);
            g.rect(ax - 8, ay - 36, 16, 6, '#4a2090');
            g.circle(ax, ay - 38, 5, '#5a28b0');
            c.fillStyle = '#302060';
            c.beginPath(); c.moveTo(ax - 10, ay - 6); c.lineTo(ax - 14, ay); c.lineTo(ax + 14, ay); c.lineTo(ax + 10, ay - 6); c.closePath(); c.fill();
          }

          /* Door seal progress */
          var doorPct = this.doorOpen;
          var doorBarW = W - 28;
          g.rect(14, 8, doorBarW, 10, '#1a0e28');
          g.rect(14, 8, Math.floor(doorBarW * doorPct), 10, doorPct > 0.5 ? C.gold : (doorPct > 0.25 ? C.amber : C.red));
          api.txtCFit('DOOR', 14 + doorBarW / 2, 10, 5, '#c0b880', false, doorBarW);

          /* HUD */
          api.topBar('OPEN SESAME', this.lives, 3,
            this.bags + '/' + this.target, C.goldL);
        },
      },

      /* ═══════════ 3. THE MARKED DOOR — chalk-mark all the doors ═══════════ */
      {
        id: 'door', name: 'THE MARKED DOOR', sub: 'ONE MARK AMONG MANY',
        icon: function (api, x, y) { ICONS[2](api, x, y); },
        intro: [
          'A THIEF MARKS ALI BABA\'S DOOR',
          'with chalk — to find it again.',
          'MORGIANA SEES THE MARK.',
          'She marks every door in the street',
          'the same way, before dawn.',
        ],
        quote: '"She who is quick of eye and quicker of hand turns the enemy\'s cunning to dust." — Arabian Nights',
        help: 'Tap the doors with glowing marks before they fade. Mark 14 doors to fool the thieves!',
        winText: 'Every door bears the same mark. The thief returns — and cannot tell which is Ali Baba\'s!',
        loseText: 'Too many doors were missed. The thief finds the right one and returns to his captain.',

        init: function (api) {
          this.marked   = 0;
          this.target   = 14;
          this.missed   = 0;
          this.maxMiss  = 3;
          this.doors    = [];
          this.spawnT   = 0.6;
          /* Static door positions on a street */
          this.doorSlots = [];
          for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
              this.doorSlots.push({ x: 40 + col * 80, y: 100 + row * 110 });
            }
          }
        },

        update: function (api, dt) {
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            /* Find an empty slot */
            var busy = {};
            for (var di = 0; di < this.doors.length; di++) {
              busy[this.doors[di].slotIdx] = true;
            }
            var free = [];
            for (var si = 0; si < this.doorSlots.length; si++) {
              if (!busy[si]) free.push(si);
            }
            if (free.length > 0) {
              var slotIdx = free[Math.floor(Math.random() * free.length)];
              var slot = this.doorSlots[slotIdx];
              this.doors.push({
                x: slot.x, y: slot.y,
                slotIdx: slotIdx,
                life: 2.8 - (this.marked / this.target) * 0.9,
                maxLife: 2.8 - (this.marked / this.target) * 0.9,
                tapped: false,
              });
            }
            this.spawnT = 0.65 - (this.marked / this.target) * 0.22;
          }

          /* Update doors */
          for (var di2 = this.doors.length - 1; di2 >= 0; di2--) {
            var door = this.doors[di2];
            if (door.tapped) { this.doors.splice(di2, 1); continue; }
            door.life -= dt;
            if (door.life <= 0) {
              this.missed++;
              this.doors.splice(di2, 1);
              api.audio.sfx('hurt');
              if (this.missed >= this.maxMiss) { api.lose(); return; }
            }
          }

          /* Tap detection */
          if (api.pointer.justDown) {
            var px2 = api.pointer.x, py2 = api.pointer.y;
            for (var di3 = this.doors.length - 1; di3 >= 0; di3--) {
              var d = this.doors[di3];
              if (Math.abs(px2 - d.x) < 30 && Math.abs(py2 - d.y) < 44) {
                d.tapped = true;
                this.marked++;
                api.addScore(15);
                api.burst(d.x, d.y, C.chalk, 6);
                api.audio.sfx('select');
                if (this.marked >= this.target) {
                  api.addScore(100);
                  api.win(); return;
                }
                break;
              }
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          /* Street background — cobblestones and night sky */
          var bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#0e0818'); bg.addColorStop(1, '#1a1208');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          /* Stone building wall */
          c.fillStyle = '#261808';
          c.fillRect(0, 30, W, H - 30);
          /* Horizontal mortar lines */
          c.strokeStyle = '#1a1006'; c.lineWidth = 1;
          for (var hy = 50; hy < H; hy += 22) {
            c.beginPath(); c.moveTo(0, hy); c.lineTo(W, hy); c.stroke();
          }
          /* Vertical mortar */
          for (var vx = 0; vx < W; vx += 36) {
            c.beginPath(); c.moveTo(vx, 30); c.lineTo(vx, H); c.stroke();
          }

          /* Night sky strip at top */
          c.fillStyle = C.night;
          c.fillRect(0, 0, W, 32);
          drawStars(c, api.t * 0.5, W);

          /* Draw doors */
          for (var di = 0; di < this.doors.length; di++) {
            var door = this.doors[di];
            var pct = door.life / door.maxLife;
            var dx2 = door.x, dy2 = door.y;

            /* Door frame */
            g.rect(dx2 - 22, dy2 - 38, 44, 58, C.door);
            /* Arch */
            c.fillStyle = C.doorL;
            c.beginPath(); c.arc(dx2, dy2 - 38, 22, Math.PI, 0); c.fill();
            /* Door panel */
            c.fillStyle = '#5a3820';
            c.fillRect(dx2 - 18, dy2 - 36, 36, 54);
            /* Door arch fill */
            c.fillStyle = '#5a3820';
            c.beginPath(); c.arc(dx2, dy2 - 38, 18, Math.PI, 0); c.fill();

            /* Glowing chalk mark (X) */
            var markAlpha = pct;
            c.globalAlpha = markAlpha;
            c.strokeStyle = C.chalk; c.lineWidth = 3;
            c.beginPath();
            c.moveTo(dx2 - 8, dy2 - 18); c.lineTo(dx2 + 8, dy2);
            c.moveTo(dx2 + 8, dy2 - 18); c.lineTo(dx2 - 8, dy2);
            c.stroke();
            c.globalAlpha = 1;

            /* Urgency glow when almost gone */
            if (pct < 0.35) {
              c.globalAlpha = 0.2 + 0.15 * Math.sin(api.t * 8);
              c.fillStyle = C.red;
              c.beginPath(); c.arc(dx2, dy2 - 18, 28, 0, Math.PI * 2); c.fill();
              c.globalAlpha = 1;
            }
          }

          /* HUD */
          api.topBar('MARK THE DOORS', this.maxMiss - this.missed, this.maxMiss,
            this.marked + '/' + this.target, C.goldL);
        },
      },

      /* ═══════════ 4. THE OIL JARS — tap the stirring thieves ═══════════ */
      {
        id: 'jars', name: 'THE OIL JARS', sub: 'FORTY HIDING IN PLAIN SIGHT',
        icon: function (api, x, y) { ICONS[3](api, x, y); },
        intro: [
          'THE CAPTAIN DISGUISES',
          'himself as an oil merchant.',
          'Thirty-eight thieves hide',
          'in great oil jars in the courtyard.',
          'MORGIANA MUST DISCOVER THEM',
          'before they attack!',
        ],
        quote: '"Vigilance is the sword that never sleeps." — Arabian Nights',
        help: 'Tap jars that show glowing eyes before the thief inside escapes! 14 found to win. 3 misses lose.',
        winText: 'Every hiding thief is found! Morgiana deals with them swiftly, one by one.',
        loseText: 'Too many slipped away in the night. The thieves signal the captain to strike.',

        init: function (api) {
          this.found    = 0;
          this.target   = 14;
          this.missed   = 0;
          this.maxMiss  = 3;
          this.jars     = [];
          this.spawnT   = 0.7;
          /* Jar grid positions */
          this.jarSlots = [];
          var cols = [45, 95, 145, 195, 240];
          var rows = [220, 340, 430];
          for (var ri = 0; ri < rows.length; ri++) {
            for (var ci = 0; ci < cols.length; ci++) {
              this.jarSlots.push({ x: cols[ci], y: rows[ri] });
            }
          }
        },

        update: function (api, dt) {
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var busy = {};
            for (var ji = 0; ji < this.jars.length; ji++) busy[this.jars[ji].slotIdx] = true;
            var free = [];
            for (var si = 0; si < this.jarSlots.length; si++) if (!busy[si]) free.push(si);
            if (free.length > 0) {
              var slotIdx = free[Math.floor(Math.random() * free.length)];
              var slot = this.jarSlots[slotIdx];
              var progress = this.found / this.target;
              var life = 2.4 - progress * 0.7;
              this.jars.push({
                x: slot.x, y: slot.y, slotIdx: slotIdx,
                life: life, maxLife: life, tapped: false, eyeAnim: 0,
              });
            }
            this.spawnT = 0.6 - (this.found / this.target) * 0.22;
          }

          /* Update jars */
          for (var ji2 = this.jars.length - 1; ji2 >= 0; ji2--) {
            var jar = this.jars[ji2];
            if (jar.tapped) { this.jars.splice(ji2, 1); continue; }
            jar.life -= dt;
            jar.eyeAnim = Math.max(0, jar.life / jar.maxLife);
            if (jar.life <= 0) {
              this.missed++;
              this.jars.splice(ji2, 1);
              api.audio.sfx('hurt');
              if (this.missed >= this.maxMiss) { api.lose(); return; }
            }
          }

          /* Tap detection */
          if (api.pointer.justDown) {
            var px = api.pointer.x, py = api.pointer.y;
            for (var ji3 = this.jars.length - 1; ji3 >= 0; ji3--) {
              var j = this.jars[ji3];
              if (Math.abs(px - j.x) < 18 && Math.abs(py - (j.y + 3)) < 22) {
                j.tapped = true;
                this.found++;
                api.addScore(15);
                api.burst(j.x, j.y, C.amber, 6);
                api.audio.sfx('select');
                if (this.found >= this.target) {
                  api.addScore(100);
                  api.win(); return;
                }
                break;
              }
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          /* Courtyard at night */
          var bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#100820'); bg.addColorStop(1, '#1e1208');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          /* Moon and stars in upper portion */
          drawStars(c, api.t * 0.6, W);
          drawMoon(c, W - 30, 26, 14);

          /* Courtyard floor tiles */
          c.fillStyle = '#1a1008';
          c.fillRect(0, H * 0.25, W, H * 0.75);
          c.strokeStyle = '#221606'; c.lineWidth = 1;
          for (var fy = Math.floor(H * 0.25); fy < H; fy += 30) {
            c.beginPath(); c.moveTo(0, fy); c.lineTo(W, fy); c.stroke();
          }
          for (var fx = 0; fx < W; fx += 38) {
            c.beginPath(); c.moveTo(fx, H * 0.25); c.lineTo(fx, H); c.stroke();
          }

          /* Oil jars */
          for (var ji = 0; ji < this.jars.length; ji++) {
            var jar = this.jars[ji];
            drawJar(g, c, jar.x, jar.y, jar.eyeAnim);
            /* Urgency pulse */
            if (jar.eyeAnim < 0.35) {
              c.globalAlpha = 0.15 + 0.1 * Math.sin(api.t * 10);
              c.fillStyle = C.red;
              c.beginPath(); c.arc(jar.x, jar.y, 26, 0, Math.PI * 2); c.fill();
              c.globalAlpha = 1;
            }
          }

          /* Morgiana (holding a lantern) at top left */
          var mx = 28, my = H * 0.22;
          g.circle(mx, my - 18, 7, C.sand);
          g.rect(mx - 3, my - 10, 6, 4, '#6a4010');
          g.rect(mx - 6, my - 18, 4, 6, '#c04030'); /* head scarf */
          g.rect(mx - 7, my - 8, 14, 16, '#c04030');
          c.fillStyle = '#a03020'; c.beginPath(); c.moveTo(mx - 8, my + 8); c.lineTo(mx - 12, my + 22); c.lineTo(mx + 12, my + 22); c.lineTo(mx + 8, my + 8); c.closePath(); c.fill();
          /* Lantern */
          c.globalAlpha = 0.45 + 0.1 * Math.sin(api.t * 1.4);
          c.fillStyle = C.goldL;
          c.beginPath(); c.arc(mx + 18, my - 4, 16, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          g.rect(mx + 15, my - 12, 6, 18, '#8a6020');
          c.fillStyle = C.lanternL;
          c.beginPath(); c.arc(mx + 18, my - 4, 5, 0, Math.PI * 2); c.fill();

          /* HUD */
          api.topBar('THE OIL JARS', this.maxMiss - this.missed, this.maxMiss,
            this.found + '/' + this.target, C.goldL);
        },
      },

      /* ═══════════ 5. THE DANCE — Morgiana's dagger-dance timing ═══════════ */
      {
        id: 'dance', name: 'THE DANCE', sub: 'THE DAGGER REVEALS ALL',
        icon: function (api, x, y) { ICONS[4](api, x, y); },
        intro: [
          'THE CAPTAIN RETURNS DISGUISED',
          'as a merchant — and is invited to dine.',
          'MORGIANA PERFORMS A DAGGER DANCE.',
          'As the blade flashes near him,',
          'she drives it home —',
          'and reveals the last thief.',
        ],
        quote: '"She danced, and the dagger sang, and the captain knew too late." — Arabian Nights',
        help: 'Time the dagger throw! Tap when the swinging blade lines up with the golden target zone. 8 strikes to win!',
        winText: 'The captain is unmasked! Morgiana bows. Ali Baba is finally, completely free.',
        loseText: 'The captain slipped away in the confusion of the dance. The danger lingers.',

        init: function (api) {
          this.strikes  = 0;
          this.target   = 8;
          this.misses   = 0;
          this.maxMiss  = 4;
          this.angle    = 0;
          this.speed    = 1.8; /* radians per second */
          this.dir      = 1;
          this.cooldown = 0;
          this.hitFlash = 0;
          this.missFlash = 0;
          /* Pendulum center */
          this.pivX = api.W / 2;
          this.pivY = 80;
          this.armLen = 140;
          /* Target zone angle range (centered on bottom of arc) */
          this.zoneHalf = 0.28;
        },

        update: function (api, dt) {
          this.hitFlash  = Math.max(0, this.hitFlash - dt);
          this.missFlash = Math.max(0, this.missFlash - dt);
          this.cooldown  = Math.max(0, this.cooldown - dt);

          /* Swing pendulum */
          this.angle += this.dir * this.speed * dt;
          var maxAngle = Math.PI * 0.7;
          if (this.angle > maxAngle) { this.angle = maxAngle; this.dir = -1; }
          if (this.angle < -maxAngle) { this.angle = -maxAngle; this.dir = 1; }

          /* Check tap */
          if (this.cooldown <= 0 && (api.pointer.justDown || api.keyPressed('a'))) {
            /* dagger tip is at pivot + arm in direction (angle - PI/2) */
            var tipAngle = this.angle + Math.PI / 2;
            /* normalized angle from straight down = this.angle */
            var inZone = Math.abs(this.angle) < this.zoneHalf;
            if (inZone) {
              this.strikes++;
              this.hitFlash = 0.5;
              this.cooldown = 0.4;
              api.addScore(25);
              api.burst(this.pivX + Math.sin(this.angle) * this.armLen,
                this.pivY + Math.cos(this.angle) * this.armLen, C.goldL, 8);
              api.audio.sfx('shoot');
              /* Increase speed each strike */
              this.speed = 1.8 + this.strikes * 0.22;
              /* Shrink zone each strike */
              this.zoneHalf = Math.max(0.10, 0.28 - this.strikes * 0.02);
              if (this.strikes >= this.target) {
                api.addScore(100);
                api.win(); return;
              }
            } else {
              this.misses++;
              this.missFlash = 0.5;
              this.cooldown = 0.25;
              api.audio.sfx('hurt');
              if (this.misses >= this.maxMiss) { api.lose(); return; }
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          /* Palace banquet hall */
          var bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#0e0616'); bg.addColorStop(1, '#200e08');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          /* Ornate columns */
          var colX = [18, W - 18];
          for (var ci = 0; ci < colX.length; ci++) {
            /* Column shaft */
            g.rect(colX[ci] - 8, 0, 16, H, '#2a1828');
            /* Fluting */
            for (var fl = 1; fl < 5; fl++) {
              g.rect(colX[ci] - 6 + fl * 2, 0, 1, H, '#321e32');
            }
            /* Capital */
            g.rect(colX[ci] - 12, 20, 24, 12, '#3a2240');
          }

          /* Draped ceiling fabric */
          c.fillStyle = '#3a0a10';
          c.beginPath(); c.moveTo(0, 0);
          for (var drx = 0; drx <= W; drx += 30) {
            c.lineTo(drx, 8 + Math.sin(drx * 0.12 + api.t * 0.3) * 6);
          }
          c.lineTo(W, 0); c.closePath(); c.fill();

          /* Hanging lanterns above scene */
          for (var hl = 0; hl < 3; hl++) {
            var hlx = 60 + hl * 75;
            c.globalAlpha = 0.4 + 0.12 * Math.sin(api.t * 0.9 + hl);
            c.fillStyle = C.goldL;
            c.beginPath(); c.arc(hlx, 36, 22, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            g.rect(hlx - 7, 26, 14, 22, '#8a5010');
            c.fillStyle = C.lanternL; c.beginPath(); c.arc(hlx, 26, 5, 0, Math.PI * 2); c.fill();
            /* Chain to ceiling */
            c.strokeStyle = '#5a4010'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(hlx, 18); c.lineTo(hlx, 6); c.stroke();
          }

          /* Moroccan tile floor */
          c.fillStyle = '#1a0e16';
          c.fillRect(0, H * 0.80, W, H * 0.20);
          for (var tx2 = 0; tx2 < W; tx2 += 24) {
            c.strokeStyle = '#280e1e'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(tx2, H * 0.80); c.lineTo(tx2, H); c.stroke();
          }

          /* Captain seated (right side) */
          var capX = W - 38, capY = H * 0.68;
          g.rect(capX - 12, capY - 20, 24, 30, '#1a3010');
          g.circle(capX, capY - 28, 10, C.sand);
          g.rect(capX - 6, capY - 40, 12, 6, '#2a4010');
          /* Worried expression */
          c.fillStyle = '#cc2020';
          c.beginPath(); c.arc(capX - 3, capY - 25, 2, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(capX + 3, capY - 25, 2, 0, Math.PI * 2); c.fill();

          /* Morgiana silhouette (left side, dancing) */
          var morX = 34, morY = H * 0.70;
          c.fillStyle = '#c04030';
          c.beginPath(); c.moveTo(morX - 14, morY); c.lineTo(morX + 14, morY); c.lineTo(morX + 8, morY - 30); c.lineTo(morX - 8, morY - 30); c.closePath(); c.fill();
          g.circle(morX, morY - 38, 8, C.sand);
          g.rect(morX - 5, morY - 46, 10, 6, '#a03028');
          /* Dancing arm up */
          c.strokeStyle = C.sand; c.lineWidth = 4;
          c.beginPath(); c.moveTo(morX + 8, morY - 22); c.quadraticCurveTo(morX + 22, morY - 34, morX + 18, morY - 48); c.stroke();

          /* Dance floor glow */
          c.globalAlpha = 0.12 + 0.06 * Math.sin(api.t * 2.5);
          c.fillStyle = C.goldL;
          c.beginPath(); c.ellipse(W / 2, H * 0.80, W * 0.4, 20, 0, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;

          /* Golden target zone arc at bottom of pendulum */
          var pivX = this.pivX, pivY = this.pivY, armLen = this.armLen;
          c.strokeStyle = this.hitFlash > 0 ? C.goldL : C.goldD;
          c.lineWidth = 12;
          c.globalAlpha = 0.32;
          c.beginPath();
          c.arc(pivX, pivY, armLen, Math.PI / 2 - this.zoneHalf, Math.PI / 2 + this.zoneHalf);
          c.stroke();
          c.globalAlpha = 1;
          /* Bright inner ring */
          c.strokeStyle = this.hitFlash > 0 ? C.goldL : C.gold;
          c.lineWidth = 4;
          c.globalAlpha = 0.7;
          c.beginPath();
          c.arc(pivX, pivY, armLen, Math.PI / 2 - this.zoneHalf, Math.PI / 2 + this.zoneHalf);
          c.stroke();
          c.globalAlpha = 1;

          /* Pendulum arm */
          var tipX = pivX + Math.sin(this.angle) * armLen;
          var tipY = pivY + Math.cos(this.angle) * armLen;
          c.strokeStyle = '#6a4028'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(pivX, pivY); c.lineTo(tipX, tipY); c.stroke();

          /* Pivot point */
          g.circle(pivX, pivY, 5, '#5a3818');
          g.circle(pivX, pivY, 2, C.goldD);

          /* Dagger at tip */
          drawDagger(g, c, tipX, tipY, this.angle - Math.PI / 2);

          /* Flash overlays */
          if (this.hitFlash > 0) {
            c.globalAlpha = this.hitFlash * 0.35;
            c.fillStyle = C.goldL; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }
          if (this.missFlash > 0) {
            c.globalAlpha = this.missFlash * 0.25;
            c.fillStyle = C.red; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          /* Progress pips (strikes made) */
          for (var sp = 0; sp < this.target; sp++) {
            var pipX = W / 2 - (this.target - 1) * 12 + sp * 24;
            g.circle(pipX, H - 20, 7, sp < this.strikes ? C.gold : '#2a1840');
            if (sp < this.strikes) g.circle(pipX, H - 20, 4, C.goldL);
          }
          /* Miss indicators */
          for (var mp = 0; mp < this.maxMiss; mp++) {
            var missX = 14 + mp * 22;
            g.rect(missX, H - 38, 16, 6, mp < this.misses ? C.red : '#2a1840');
          }

          api.topBar('THE DANCE', this.maxMiss - this.misses, this.maxMiss,
            this.strikes + '/' + this.target, C.goldL);
        },
      },

    ], // end chapters
  }); // end RetroSaga.create

}());
