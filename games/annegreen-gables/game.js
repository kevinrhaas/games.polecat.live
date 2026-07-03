/* ============================================================================
 * ANNE OF GREEN GABLES — FIVE TALES FROM MONTGOMERY'S 1908 NOVEL
 *   1. THE LONG DRIVE      — catch-collect: apple blossoms on the way home (10 blooms, 22s)
 *   2. THE LINIMENT CAKE   — falling sort: catch ingredients, dodge liniment (12 good, 26s)
 *   3. THE GREEN HAIR      — timing ring: dye tap, 8 rounds, 3 misses
 *   4. THE HAUNTED WOOD    — stealth dodge: free-move past shadows, 26s survive
 *   5. THE SCHOLARSHIP     — collect race: 15 gold books in 24s, 3 misses lose
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ─── Palette ──────────────────────────────────────────────────────────── */
  var C = {
    sky:    '#74c8f0',  skyL:   '#a8dff8',  skyD:   '#3a90c8',
    cloud:  '#f4fbfd',  cloudS: '#d4ecf8',
    hillD:  '#2a6820',  hill:   '#4a9840',  hillL:  '#70c050',
    grass:  '#5ab040',  grassL: '#88d060',
    road:   '#c06450',  roadL:  '#d88060',  roadD:  '#8a3820',
    apple:  '#d8506a',  appleL: '#f07a90',
    bloom:  '#f8d8e8',  bloomL: '#fce8f4',  bloomY: '#f8e080',
    tree:   '#2a6018',  treeL:  '#4a8030',  treeTr: '#5a9838',
    houseW: '#f0ecd8',  houseR: '#c04030',  houseG: '#2a6018',
    gold:   '#d4a820',  goldL:  '#f8d060',  goldLL: '#fffcc0',
    cream:  '#f8f0e0',  creamD: '#d8c090',  creamDD:'#9a7848',
    flour:  '#f4f0e8',  flourD: '#c8b888',
    egg:    '#f4e8c0',  eggS:   '#d0b880',
    butter: '#f0d040',  butD:   '#c09810',
    van:    '#7a3010',  vanD:   '#4a1808',
    lin:    '#78b810',  linD:   '#508008',
    skin:   '#f0c078',  skinD:  '#c89050',
    hairR:  '#c83018',  /* Anne's 'carrot' red */
    hairG:  '#2a7010',  /* dyed green - disaster */
    hairB:  '#180808',
    dress:  '#4888d0',  dressD: '#2a5898',  dressL: '#80b8f8',
    water:  '#60b8d8',  waterL: '#90d4f0',  waterD: '#2a7898',
    shadow: '#221640',  shadowL:'#3a2860',
    branch: '#5a2c10',  branchL:'#7a4820',
    dark:   '#060408',  dimD:   '#0c0818',
    leaf:   '#2a5c10',  leafL:  '#3a8020',
    book:   '#d4a020',  bookD:  '#8a6010',  bookL:  '#f8d060',
    bookGr: '#888870',  bookGrD:'#585850',
    grey:   '#9a8880',  greyD:  '#5a4838',
    rock:   '#708078',  rockD:  '#485058',
    mud:    '#7a5830',  mudD:   '#4a3418',
    firefly:'#c8f030',  ffL:    '#e8ff80',
    red:    '#cc1a20',
    white:  '#f8f8f8',
    frost:  '#d8ecf8',
    glow:   '#fffcc0',
    waxRed: '#a82020',
    pei:    '#c06450',  /* PEI red clay */
  };

  /* ─── Emblem: apple blossom spray ─────────────────────────────────────── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    c.strokeStyle = C.branch; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(cx - 4, cy + 16); c.lineTo(cx + 2, cy); c.lineTo(cx + 10, cy - 12); c.stroke();
    c.beginPath(); c.moveTo(cx + 2, cy); c.lineTo(cx - 10, cy - 8); c.stroke();
    c.beginPath(); c.moveTo(cx + 4, cy - 6); c.lineTo(cx + 8, cy - 18); c.stroke();
    var blooms = [[cx - 10, cy - 8, 7], [cx + 10, cy - 12, 8], [cx + 8, cy - 18, 6], [cx - 2, cy + 4, 5]];
    blooms.forEach(function (b) {
      for (var p = 0; p < 5; p++) {
        var a = p * Math.PI * 0.4 + 0.2;
        g.circle(b[0] + Math.cos(a) * b[2] * 0.55, b[1] + Math.sin(a) * b[2] * 0.55, b[2] * 0.44, C.bloomL);
      }
      g.circle(b[0], b[1], b[2] * 0.32, C.goldL);
    });
  }

  /* ─── Anne sprite ──────────────────────────────────────────────────────── */
  function drawAnne(g, c, x, y, hairCol, hurt, t) {
    if (hurt && Math.floor(t * 9) % 2 === 0) return;
    g.circle(x, y - 24, 9, C.skin);
    g.circle(x, y - 32, 8, hairCol);
    g.circle(x + 6, y - 30, 4, hairCol);
    g.circle(x - 6, y - 30, 4, hairCol);
    g.rect(x - 9, y - 15, 18, 20, C.dress);
    g.rect(x - 13, y - 10, 5, 12, C.skin);
    g.rect(x + 8,  y - 10, 5, 12, C.skin);
    g.rect(x - 7, y + 5, 7, 14, C.dressD);
    g.rect(x + 0, y + 5, 7, 14, C.dressD);
  }

  /* ─── Scenery: PEI pastoral, Green Gables ────────────────────────────── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    // Sky
    var sky = c.createLinearGradient(0, 0, 0, H * 0.52);
    sky.addColorStop(0, '#3a90c8'); sky.addColorStop(1, '#a8dff8');
    c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.56);
    // Clouds
    [[44, 40, 1.0], [130, 24, 0.75], [205, 50, 0.88]].forEach(function (cp) {
      var cx2 = (cp[0] + t * 4.5 * cp[2]) % (W + 60) - 20;
      var r = cp[2];
      g.circle(cx2, cp[1], 13 * r, C.cloud); g.circle(cx2 + 12, cp[1] - 6, 10 * r, C.cloud);
      g.circle(cx2 - 11, cp[1] - 5, 9 * r, C.cloud); g.circle(cx2 + 5, cp[1] + 5, 11 * r, C.cloud);
    });
    // Far hill
    c.fillStyle = C.hillD;
    c.beginPath(); c.moveTo(0, H * 0.52);
    c.bezierCurveTo(W * 0.2, H * 0.36, W * 0.45, H * 0.42, W * 0.62, H * 0.38);
    c.bezierCurveTo(W * 0.78, H * 0.34, W * 0.88, H * 0.44, W, H * 0.46);
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    // Near hill
    c.fillStyle = C.hill;
    c.beginPath(); c.moveTo(0, H * 0.58);
    c.bezierCurveTo(W * 0.22, H * 0.50, W * 0.5, H * 0.54, W * 0.72, H * 0.48);
    c.bezierCurveTo(W * 0.88, H * 0.44, W, H * 0.52, W, H * 0.58);
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    // Green Gables farmhouse
    var hx = W - 80, hy = H * 0.42;
    c.fillStyle = C.houseR;
    c.beginPath(); c.moveTo(hx - 22, hy); c.lineTo(hx + 22, hy); c.lineTo(hx, hy - 26); c.closePath(); c.fill();
    c.fillStyle = C.houseW; c.fillRect(hx - 20, hy, 40, 30);
    c.fillStyle = C.houseG; c.fillRect(hx - 6, hy + 12, 12, 18);
    c.fillStyle = '#9ea880'; c.fillRect(hx - 16, hy + 6, 12, 10); c.fillRect(hx + 4, hy + 6, 12, 10);
    // Apple trees
    [[W * 0.12, H * 0.53], [W * 0.25, H * 0.48]].forEach(function (tp) {
      c.fillStyle = C.branch; c.fillRect(tp[0] - 2, tp[1], 4, 22);
      g.circle(tp[0], tp[1] - 6, 15, C.treeL);
      for (var b2 = 0; b2 < 5; b2++) {
        var ba = b2 * Math.PI * 0.4 + t * 0.2;
        g.circle(tp[0] + Math.cos(ba) * 8, tp[1] - 6 + Math.sin(ba) * 7, 4, C.apple);
      }
    });
    // Lake of Shining Waters glimmer
    c.globalAlpha = 0.48 + 0.18 * Math.sin(t * 1.4);
    c.fillStyle = C.waterL;
    c.beginPath(); c.ellipse(W * 0.32, H * 0.60, 30, 9, 0.08, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    // Ground
    c.fillStyle = C.grass; c.fillRect(0, H * 0.62, W, H * 0.38);
    c.fillStyle = C.grassL; c.fillRect(0, H * 0.62, W, 4);
    // Red clay road
    c.fillStyle = C.road;
    c.beginPath(); c.moveTo(W * 0.32, H); c.lineTo(W * 0.38, H * 0.64); c.lineTo(W * 0.54, H * 0.64); c.lineTo(W * 0.62, H); c.closePath(); c.fill();
    c.fillStyle = C.roadL; c.fillRect(W * 0.44, H * 0.64, 3, H * 0.36);
    // Fireflies at dusk
    for (var ff = 0; ff < 8; ff++) {
      var ffa = ff * 1.4 + t * 0.85;
      var ffx = 18 + ff * 30 + Math.cos(ffa + ff * 0.5) * 14;
      var ffy = H * 0.68 + Math.sin(ffa * 0.7 + ff) * 22;
      var ffp = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.6 + ff));
      c.globalAlpha = ffp;
      g.circle(ffx, ffy, 2, C.firefly);
      c.globalAlpha = ffp * 0.28;
      g.circle(ffx, ffy, 6, C.ffL);
      c.globalAlpha = 1;
    }
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(6,4,10,.80)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(6,8,4,.44)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Chapter card spots: PEI island map scatter ───────────────────────── */
  var SPOTS = [
    { x: 12,  y: 96,  w: 112, h: 70 },   // Bright River Station
    { x: 146, y: 108, w: 110, h: 70 },   // Green Gables Kitchen
    { x: 76,  y: 206, w: 112, h: 70 },   // The Dye Parlour
    { x: 10,  y: 318, w: 112, h: 70 },   // The Haunted Wood
    { x: 148, y: 330, w: 110, h: 70 },   // Queen's College
  ];

  /* ─── Chapter icons ─────────────────────────────────────────────────────── */
  var ICONS = [
    function (api, x, y) {  // buggy wheel
      var g = api.gfx, c = api.ctx;
      c.strokeStyle = C.branchL; c.lineWidth = 2;
      c.beginPath(); c.arc(x, y, 10, 0, Math.PI * 2); c.stroke();
      for (var s = 0; s < 6; s++) {
        var a = s * Math.PI / 3;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); c.stroke();
      }
      g.circle(x, y, 3, C.branch);
      // apple blossom
      g.circle(x + 12, y - 8, 4, C.bloomL); g.circle(x + 12, y - 8, 2, C.goldL);
    },
    function (api, x, y) {  // cake
      var g = api.gfx, c = api.ctx;
      g.rect(x - 10, y - 2, 20, 12, C.cream);
      g.rect(x - 12, y + 2, 24, 7, C.creamD);
      g.rect(x - 6, y - 8, 12, 8, C.cream);
      g.circle(x - 4, y - 10, 3, C.gold); g.circle(x + 4, y - 10, 3, C.gold);
      // liniment bottle (bad green)
      g.rect(x + 8, y - 10, 6, 14, C.lin); g.circle(x + 11, y - 10, 3, C.linD);
    },
    function (api, x, y) {  // hair mirror
      var g = api.gfx, c = api.ctx;
      c.strokeStyle = C.goldL; c.lineWidth = 2;
      c.beginPath(); c.arc(x, y - 4, 9, 0, Math.PI * 2); c.stroke();
      g.rect(x - 2, y + 5, 4, 8, C.goldL);
      g.rect(x - 5, y + 12, 10, 3, C.goldL);
      // Green hair gag
      g.circle(x - 3, y - 8, 4, C.hairG); g.circle(x + 3, y - 8, 4, C.hairG);
      g.circle(x, y - 10, 5, C.lin);
    },
    function (api, x, y) {  // spooky tree
      var g = api.gfx, c = api.ctx;
      g.rect(x - 2, y - 6, 4, 18, C.branch);
      c.strokeStyle = C.branchL; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x - 10, y - 12); c.stroke();
      c.beginPath(); c.moveTo(x, y - 2); c.lineTo(x + 8, y - 10); c.stroke();
      c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x - 6, y - 4); c.stroke();
      g.circle(x - 8, y - 8, 3, C.shadowL);
      g.circle(x + 10, y - 6, 3, C.shadowL);
    },
    function (api, x, y) {  // open book with gold
      var g = api.gfx, c = api.ctx;
      g.rect(x - 12, y - 8, 24, 18, C.book);
      g.rect(x - 12, y - 8, 5, 18, C.bookD);
      g.rect(x - 1, y - 8, 2, 18, C.creamD);
      g.rect(x - 7, y - 4, 6, 2, C.goldLL); g.rect(x - 7, y, 8, 2, C.goldLL);
      g.rect(x + 3, y - 4, 6, 2, C.goldLL); g.rect(x + 1, y, 6, 2, C.goldLL);
      g.circle(x + 10, y + 12, 5, C.gold); api.txtC('A', x + 10, y + 8, 6, C.dark);
    },
  ];

  /* ─── RetroSaga configuration ───────────────────────────────────────────── */
  RetroSaga.create({
    id:       'annegreen',
    title:    'Anne of Green Gables',
    subtitle: 'FIVE TALES · L. M. MONTGOMERY',
    currency: 'FANCY',
    accent:   '#d44878',
    credit:   'ANNE OF GREEN GABLES · L. M. MONTGOMERY · 1908',
    bootLine: 'FIVE TALES · ONE RED-HAIRED GIRL',
    bootCta:  'TAP TO BEGIN ANNE\'S STORY',
    menuLabel:'THE ISLAND OF ANNE',
    menuHint: 'CHOOSE A TALE',
    menuDone: 'ALL FIVE TALES OF ANNE',
    tagline:  'A POLECAT ADVENTURE',
    emblem,
    scenery,

    screens: {
      win:          '#d4a820',
      lose:         '#7a2848',
      chapterLabel: '#9a8060',
      name:         '#f8f0e0',
      sub:          '#d44878',
      intro:        '#e8d4b0',
      quote:        '#9a8060',
      help:         '#d4a820',
      score:        '#f8f0e0',
      cur:          '#d4a820',
      cta:          '#f8f0e0',
      overlay:      'rgba(8,4,14,.84)',
    },
    labels: {
      chapter:  'TALE',
      score:    'IMAGINATION KINDLED',
      win:      'KINDRED SPIRITS REJOICE',
      lose:     'SUCH A DREADFUL SCRAPE',
      cont:     'TAP TO KEEP ON',
      finale:   'TAP TO DREAM ON',
      toMenu:   'TAP FOR GREEN GABLES',
      play:     'TAP TO BEGIN',
    },

    palette: { gold: '#d4a820', rose: '#d44878', cream: '#f8f0e0' },

    menu: {
      layout: function () { return SPOTS; },
      title: function (api, grace) {
        var g = api.gfx, c = api.ctx, W = api.W;
        // Ornate pastoral banner
        g.rect(10, 16, W - 20, 66, C.hillD);
        g.rect(12, 18, W - 24, 62, '#122a08');
        g.rectO(10, 16, W - 20, 66, C.gold, 1);
        g.rectO(14, 20, W - 28, 58, C.hill, 1);
        // Corner apple blossoms
        [[16, 22], [W - 16, 22], [16, 80], [W - 16, 80]].forEach(function (bp) {
          for (var p = 0; p < 5; p++) {
            var a = p * Math.PI * 0.4;
            g.circle(bp[0] + Math.cos(a) * 5, bp[1] + Math.sin(a) * 5, 3, C.bloomL);
          }
          g.circle(bp[0], bp[1], 2, C.goldL);
        });
        api.txtCFit('THE ISLAND OF ANNE', W / 2, 30, 9, C.cream, false, W - 48);
        api.txtCFit('FANCY  ' + grace, W / 2, 48, 8, C.gold, false, W - 48);
        c.strokeStyle = C.apple; c.lineWidth = 1;
        c.beginPath(); c.moveTo(22, 60); c.lineTo(W - 22, 60); c.stroke();
        api.txtCFit('L. M. MONTGOMERY · 1908', W / 2, 68, 6, C.creamDD, false, W - 48);
        // Winding road connections
        c.strokeStyle = C.road; c.lineWidth = 1.8; c.globalAlpha = 0.38;
        var sp = SPOTS;
        function roadLine(a, b) {
          c.beginPath();
          c.moveTo(a.x + a.w / 2, a.y + a.h);
          c.lineTo(b.x + b.w / 2, b.y);
          c.stroke();
        }
        roadLine(sp[0], sp[2]); roadLine(sp[1], sp[2]);
        roadLine(sp[2], sp[3]); roadLine(sp[2], sp[4]);
        c.globalAlpha = 1;
      },
      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        var ch = info.ch, sel = info.sel, done = info.done;
        var cx = x + w / 2, cy = y + h / 2;
        // Postcard-style card (cream with green floral border)
        g.rect(x, y, w, h, sel ? '#f8f4e8' : C.creamD);
        g.rectO(x, y, w, h, sel ? C.gold : C.treeL, sel ? 2 : 1);
        g.rectO(x + 3, y + 3, w - 6, h - 6, sel ? C.hillL : C.hill, 1);
        // Floral corner accents
        if (sel) {
          [[x + 6, y + 6], [x + w - 6, y + 6], [x + 6, y + h - 6], [x + w - 6, y + h - 6]].forEach(function (bp) {
            g.circle(bp[0], bp[1], 4, C.bloomL);
            g.circle(bp[0], bp[1], 2, C.goldL);
          });
          c.fillStyle = C.apple; c.globalAlpha = 0.08;
          c.fillRect(x + 1, y + 1, w - 2, h - 2); c.globalAlpha = 1;
        }
        // Chapter icon
        ICONS[i](api, cx, cy - 14);
        // Chapter name
        api.txtCFit(ch.name, cx, cy + 8, 5, sel ? C.hillD : C.creamDD, false, w - 14);
        // Selected ribbon
        if (sel) {
          g.rect(x, y + h - 14, w, 14, C.apple);
          api.txtCFit('TAP TO PLAY', cx, y + h - 8, 5, C.bloomL, false, w - 8);
        }
        // Done seal
        if (done) {
          g.circle(x + w - 10, y + h - 10, 8, C.waxRed);
          api.txtC('✓', x + w - 10, y + h - 14, 7, C.cream);
        }
        // Tale number
        g.circle(x + 10, y + 10, 8, sel ? C.gold : C.treeL);
        api.txtC('' + (i + 1), x + 10, y + 6, 7, sel ? C.dark : C.cream);
      },
    },

    finale: [
      'MATTHEW WALKS WITH ANNE',
      'DOWN THE WHITE WAY OF DELIGHT.',
      '',
      'GREEN GABLES WAS HOME',
      'ALL ALONG.',
    ],

    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ======================================================================
       * TALE 1 — THE LONG DRIVE
       * Matthew picks Anne up from Bright River. She notices everything.
       * Steer buggy left/right; catch apple blossoms Anne points out.
       * Dodge rocks and mud puddles. Collect 10 in 22 seconds, 3 lives.
       * ==================================================================== */
      {
        id: 'drive',
        name: 'THE LONG DRIVE',
        sub: 'THE WHITE WAY OF DELIGHT',
        icon: function (api, x, y) { ICONS[0](api, x, y); },
        intro: [
          'MATTHEW CUTHBERT CAME',
          'TO BRIGHT RIVER STATION',
          'EXPECTING A BOY.',
          'He found Anne instead —',
          'a red-haired girl who saw',
          'beauty in everything.',
        ],
        quote: '"It was so beautiful that I almost said a prayer." — Anne Shirley',
        help: 'MOVE left/right to CATCH the apple blossoms! Dodge ROCKS and mud holes!',
        winText: 'Anne pointed out every lovely thing on the road. Matthew\'s heart opened wide.',
        loseText: 'Rocks and mud spoil the drive. Try again, Anne!',
        init: function (api) {
          this.px     = api.W / 2;
          this.py     = api.H - 68;
          this.lives  = 3;
          this.caught = 0;
          this.need   = 10;
          this.timer  = 0;
          this.tlimit = 22;
          this.items  = [];
          this.spawnT = 0;
          this.spRate = 1.1;
          this.speed  = 80;
          this.hurtT  = 0;
          this.done   = false;
          this.dust   = [];
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W, H = api.H;
          this.timer += dt;
          this.hurtT = Math.max(0, this.hurtT - dt);
          // Move
          if (api.keyDown('left'))  this.px -= 160 * dt;
          if (api.keyDown('right')) this.px += 160 * dt;
          if (api.pointer.down) this.px += (api.pointer.x - this.px) * 10 * dt;
          this.px = clamp(this.px, 18, W - 18);
          // Spawn items
          this.spawnT += dt;
          var prog = this.timer / this.tlimit;
          if (this.spawnT >= this.spRate) {
            this.spawnT = 0;
            this.spRate = Math.max(0.55, 1.1 - prog * 0.45);
            this.speed  = Math.min(170, 80 + prog * 80);
            var good = Math.random() < 0.65;
            this.items.push({
              x: 20 + Math.random() * (W - 40), y: -16,
              vy: this.speed * (0.85 + Math.random() * 0.3),
              t: good ? Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2),
              rot: Math.random() * Math.PI * 2, rspd: (Math.random() - 0.5) * 3,
            });
          }
          // Dust trail
          this.dust.push({ x: this.px + (Math.random() - 0.5) * 8, y: this.py + 14, life: 0.55 });
          for (var d = this.dust.length - 1; d >= 0; d--) {
            this.dust[d].life -= dt;
            if (this.dust[d].life <= 0) this.dust.splice(d, 1);
          }
          // Items
          for (var i = this.items.length - 1; i >= 0; i--) {
            var it = this.items[i];
            it.y += it.vy * dt;
            it.rot += it.rspd * dt;
            if (it.y > H + 20) { this.items.splice(i, 1); continue; }
            var dx = it.x - this.px, dy = it.y - this.py;
            if (dx * dx + dy * dy < 20 * 20) {
              this.items.splice(i, 1);
              if (it.t < 2) {
                this.caught++;
                api.addScore(10);
                api.audio.sfx('coin');
                api.burst(it.x, it.y, C.bloomL, 7);
                if (this.caught >= this.need) { this.done = true; api.win(); return; }
              } else if (this.hurtT <= 0) {
                this.lives--;
                this.hurtT = 1.2;
                api.shake(6, 0.3); api.flash(C.mud, 0.25); api.audio.sfx('hurt');
                if (this.lives <= 0) { this.done = true; api.lose(); return; }
              }
            }
          }
          if (this.timer >= this.tlimit) { this.done = true; api.lose(); }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var t = api.t;
          // PEI countryside dusk
          var sky = c.createLinearGradient(0, 0, 0, H * 0.5);
          sky.addColorStop(0, '#4a9ac8'); sky.addColorStop(1, '#a8d8f0');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          // Rolling hills
          c.fillStyle = C.hillD;
          c.beginPath(); c.moveTo(0, H * 0.52); c.bezierCurveTo(W * 0.3, H * 0.38, W * 0.6, H * 0.46, W, H * 0.44); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
          c.fillStyle = C.hill;
          c.beginPath(); c.moveTo(0, H * 0.60); c.bezierCurveTo(W * 0.25, H * 0.52, W * 0.55, H * 0.56, W, H * 0.52); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
          // Apple trees lining road
          [W * 0.06, W * 0.18, W * 0.82, W * 0.94].forEach(function (tx) {
            c.fillStyle = C.branch; c.fillRect(tx - 2, H * 0.55, 4, H * 0.18);
            g.circle(tx, H * 0.52, 16, C.treeL);
            for (var b = 0; b < 6; b++) {
              var ba = b * Math.PI / 3 + t * 0.2;
              g.circle(tx + Math.cos(ba) * 8, H * 0.52 + Math.sin(ba) * 7, 3, C.apple);
            }
            for (var bl = 0; bl < 4; bl++) {
              var bla = bl * Math.PI / 2 + 0.3;
              g.circle(tx + Math.cos(bla) * 5, H * 0.52 + Math.sin(bla) * 5, 3, C.bloomL);
            }
          });
          // Red clay road
          c.fillStyle = C.road; c.fillRect(W * 0.28, H * 0.62, W * 0.44, H * 0.38);
          c.fillStyle = C.roadL; c.fillRect(W * 0.44, H * 0.62, 3, H * 0.38);
          c.fillStyle = C.hill; c.fillRect(0, H * 0.60, W * 0.28, H * 0.40);
          c.fillStyle = C.hill; c.fillRect(W * 0.72, H * 0.60, W * 0.28, H * 0.40);
          c.fillStyle = C.grass; c.fillRect(0, H * 0.62, W * 0.28, H * 0.38);
          c.fillStyle = C.grass; c.fillRect(W * 0.72, H * 0.62, W * 0.28, H * 0.38);
          // Dust
          for (var d = 0; d < this.dust.length; d++) {
            c.globalAlpha = this.dust[d].life * 0.6;
            g.circle(this.dust[d].x, this.dust[d].y, 5, C.road); c.globalAlpha = 1;
          }
          // Items
          for (var i = 0; i < this.items.length; i++) {
            var it = this.items[i];
            c.save(); c.translate(it.x, it.y); c.rotate(it.rot);
            if (it.t === 0) {
              // Apple blossom (5 petals)
              for (var p = 0; p < 5; p++) {
                var a = p * Math.PI * 0.4;
                g.circle(Math.cos(a) * 5, Math.sin(a) * 5, 4, C.bloomL);
              }
              g.circle(0, 0, 3, C.goldL);
            } else if (it.t === 1) {
              // Firefly (glow)
              c.globalAlpha = 0.4; g.circle(0, 0, 7, C.ffL); c.globalAlpha = 1;
              g.circle(0, 0, 3, C.firefly);
            } else if (it.t === 2) {
              // Rock (bad)
              g.circle(0, 0, 7, C.rock); g.circle(-2, -3, 3, C.rockD);
            } else {
              // Mud puddle (bad)
              c.fillStyle = C.mud; c.globalAlpha = 0.8;
              c.beginPath(); c.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2); c.fill();
              c.globalAlpha = 1;
            }
            c.restore();
          }
          // Buggy + Matthew + Anne
          var px = this.px, py = this.py;
          var hide = this.hurtT > 0 && Math.floor(this.hurtT * 9) % 2 === 0;
          // Buggy body
          g.rect(px - 22, py - 6, 44, 18, C.creamDD);
          g.rect(px - 22, py - 8, 44, 5, C.mahogL || '#8a4818');
          // Wheels
          c.strokeStyle = C.branchL || '#7a4820'; c.lineWidth = 2;
          c.beginPath(); c.arc(px - 14, py + 12, 10, 0, Math.PI * 2); c.stroke();
          c.beginPath(); c.arc(px + 14, py + 12, 10, 0, Math.PI * 2); c.stroke();
          g.circle(px - 14, py + 12, 3, C.branch); g.circle(px + 14, py + 12, 3, C.branch);
          if (!hide) {
            // Matthew (driver, grey coat)
            g.circle(px - 8, py - 22, 7, C.skin);
            g.rect(px - 14, py - 16, 14, 14, C.grey || '#9a8880');
            g.circle(px - 8, py - 27, 6, C.greyD || '#5a4838');
            // Anne (passenger, red hair)
            g.circle(px + 8, py - 24, 7, C.skin);
            g.rect(px + 2, py - 18, 14, 16, C.dress);
            g.circle(px + 8, py - 30, 6, C.hairR);
            g.circle(px + 14, py - 28, 5, C.hairR);
          }
          api.topBar(this.lives, Math.max(0, this.tlimit - this.timer).toFixed(1) + 's', this.caught + '/' + this.need + ' BLOOMS');
        },
      },

      /* ======================================================================
       * TALE 2 — THE LINIMENT CAKE
       * Anne bakes for the Ladies' Aid Society but adds liniment instead of vanilla.
       * Catch good ingredients falling, dodge liniment bottles.
       * Collect 12 good items in 26 seconds, 3 misses.
       * ==================================================================== */
      {
        id: 'liniment',
        name: 'THE LINIMENT CAKE',
        sub: "MARILLA'S HORROR",
        icon: function (api, x, y) { ICONS[1](api, x, y); },
        intro: [
          'MRS. RACHEL LYNDE',
          'WAS COMING FOR TEA.',
          'Anne baked a fine layer cake —',
          'but mistook the liniment',
          'for vanilla extract.',
          'Catch the RIGHT ingredients!',
        ],
        quote: '"It tasted of liniment. I put it in by mistake." — Anne Shirley',
        help: 'CATCH flour, eggs, butter, and vanilla! DODGE the liniment bottles!',
        winText: 'The cake is perfect! Marilla breathes again. Mrs. Lynde is none the wiser.',
        loseText: 'Too much liniment! The cake is ruined. Start over, Anne.',
        init: function (api) {
          this.px     = api.W / 2;
          this.py     = api.H - 64;
          this.lives  = 3;
          this.caught = 0;
          this.need   = 12;
          this.timer  = 0;
          this.tlimit = 26;
          this.items  = [];
          this.spawnT = 0;
          this.spRate = 1.0;
          this.speed  = 78;
          this.hurtT  = 0;
          this.done   = false;
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W, H = api.H;
          this.timer += dt;
          this.hurtT = Math.max(0, this.hurtT - dt);
          var prog = this.timer / this.tlimit;
          if (api.keyDown('left'))  this.px -= 158 * dt;
          if (api.keyDown('right')) this.px += 158 * dt;
          if (api.pointer.down) this.px += (api.pointer.x - this.px) * 10 * dt;
          this.px = clamp(this.px, 18, W - 18);
          this.spawnT += dt;
          if (this.spawnT >= this.spRate) {
            this.spawnT = 0;
            this.spRate = Math.max(0.58, 1.0 - prog * 0.38);
            this.speed  = Math.min(175, 78 + prog * 85);
            var good = Math.random() < 0.62;
            this.items.push({
              x: 22 + Math.random() * (W - 44), y: -18,
              vy: this.speed * (0.88 + Math.random() * 0.25),
              t: good ? Math.floor(Math.random() * 4) : 4,
              rot: Math.random() * Math.PI * 2,
            });
          }
          for (var i = this.items.length - 1; i >= 0; i--) {
            var it = this.items[i];
            it.y += it.vy * dt; it.rot += 1.2 * dt;
            if (it.y > H + 20) { this.items.splice(i, 1); continue; }
            var dx = it.x - this.px, dy = it.y - this.py;
            if (dx * dx + dy * dy < 22 * 22) {
              this.items.splice(i, 1);
              if (it.t < 4) {
                this.caught++;
                api.addScore(10);
                api.audio.sfx('coin');
                api.burst(it.x, it.y, C.goldL, 6);
                if (this.caught >= this.need) { this.done = true; api.win(); return; }
              } else if (this.hurtT <= 0) {
                this.lives--;
                this.hurtT = 1.1;
                api.shake(5, 0.3); api.flash(C.lin, 0.22); api.audio.sfx('hurt');
                if (this.lives <= 0) { this.done = true; api.lose(); return; }
              }
            }
          }
          if (this.timer >= this.tlimit) { this.done = true; api.lose(); }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Kitchen interior
          c.fillStyle = '#1c0e08'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#2a1a0c'; c.fillRect(0, 0, W, H - 90);
          // Window
          g.rect(W - 60, 20, 54, 70, '#1a2a3a');
          var t2 = api.t;
          c.fillStyle = '#5ab0d8'; c.globalAlpha = 0.5; c.fillRect(W - 58, 22, 50, 66); c.globalAlpha = 1;
          g.rect(W - 33, 22, 2, 66, C.houseW); g.rect(W - 58, 55, 50, 2, C.houseW);
          g.rectO(W - 60, 20, 54, 70, C.creamDD, 1);
          // Sunlight through window
          c.globalAlpha = 0.07 + 0.04 * Math.sin(t2 * 0.8);
          c.fillStyle = C.goldL;
          c.beginPath(); c.moveTo(W - 58, 22); c.lineTo(W - 10, H * 0.6); c.lineTo(W - 38, H * 0.6); c.lineTo(W - 58, 55); c.closePath(); c.fill();
          c.globalAlpha = 1;
          // Wooden floor
          c.fillStyle = '#5a2c10'; c.fillRect(0, H - 90, W, 90);
          for (var b = 0; b < 5; b++) { c.fillStyle = '#7a4020'; c.fillRect(0, H - 90 + b * 18, W, 2); }
          // Kitchen counter
          g.rect(0, H - 95, W * 0.55, 8, C.creamDD);
          g.rect(0, H - 88, W * 0.55, 18, '#4a2808');
          // Mixing bowl
          var bx = W * 0.22, by = H - 90;
          c.fillStyle = C.cream;
          c.beginPath(); c.ellipse(bx, by, 18, 10, 0, 0, Math.PI); c.fill();
          c.strokeStyle = C.creamD; c.lineWidth = 2;
          c.beginPath(); c.ellipse(bx, by, 18, 10, 0, 0, Math.PI * 2); c.stroke();
          // Items falling
          for (var i = 0; i < this.items.length; i++) {
            var it = this.items[i];
            c.save(); c.translate(it.x, it.y); c.rotate(it.rot);
            if (it.t === 0) {
              // Flour bag
              g.rect(-7, -9, 14, 18, C.flour);
              g.rect(-7, -9, 14, 4, C.flourD);
              api.txtC('F', 0, -3, 6, C.creamDD, true);
            } else if (it.t === 1) {
              // Egg
              c.fillStyle = C.egg; c.beginPath(); c.ellipse(0, 0, 6, 8, 0, 0, Math.PI * 2); c.fill();
              c.strokeStyle = C.eggS; c.lineWidth = 1; c.stroke();
            } else if (it.t === 2) {
              // Butter
              g.rect(-8, -5, 16, 10, C.butter);
              g.rect(-8, -5, 16, 3, C.butD);
            } else if (it.t === 3) {
              // Vanilla (small dark bottle)
              g.rect(-4, -8, 8, 16, C.van);
              g.circle(0, -8, 3, C.vanD);
            } else {
              // LINIMENT (bad — bright green bottle)
              g.rect(-5, -10, 10, 18, C.lin);
              g.circle(0, -10, 4, C.linD);
              g.rect(-3, 6, 6, 5, C.cream);
              api.txtC('L', 0, 7, 5, C.linD, true);
            }
            c.restore();
          }
          // Anne at counter
          var px = this.px, py = this.py;
          var hide = this.hurtT > 0 && Math.floor(this.hurtT * 9) % 2 === 0;
          if (!hide) {
            // Apron
            g.rect(px - 12, py - 6, 24, 22, C.cream);
            g.rect(px - 12, py - 18, 24, 14, C.dress);
            g.circle(px, py - 22, 9, C.skin);
            g.circle(px, py - 29, 7, C.hairR);
            g.circle(px + 6, py - 27, 5, C.hairR);
            // Outstretched arms (catching)
            g.rect(px - 22, py + 2, 10, 6, C.skin);
            g.rect(px + 12, py + 2, 10, 6, C.skin);
            // Bowl held
            g.rect(px - 14, py + 12, 28, 8, C.cream);
          }
          api.topBar(this.lives, Math.max(0, this.tlimit - this.timer).toFixed(1) + 's', this.caught + '/' + this.need + ' INGREDIENTS');
        },
      },

      /* ======================================================================
       * TALE 3 — THE GREEN HAIR
       * Anne tries to dye her red hair black with a peddler's dye. It turns green.
       * Timing ring: tap in the DARK zone before it shifts to GREEN. 8 rounds, 3 misses.
       * ==================================================================== */
      {
        id: 'hairDye',
        name: 'THE GREEN HAIR',
        sub: "ANNE'S GREAT DISGRACE",
        icon: function (api, x, y) { ICONS[2](api, x, y); },
        intro: [
          'ANNE\'S HAIR WAS RED.',
          'SHE HATED IT.',
          'A PEDDLER SOLD HER DYE',
          'that promised jet-black locks.',
          'Tap in the DARK zone',
          'before the dye turns GREEN!',
        ],
        quote: '"It was dyed green. Not particularly green either — a strange ugly green." — L. M. Montgomery',
        help: 'TAP when the ring is in the DARK ZONE (centre). Wait too long and it goes green!',
        winText: 'Jet black! Anne weeps with joy. Marilla will never know.',
        loseText: 'Green! Absolutely green! Marilla has to cut it all off.',
        init: function (api) {
          this.round     = 0;
          this.rounds    = 8;
          this.misses    = 0;
          this.maxMisses = 3;
          this.ringR     = 104;
          this.shrinkT   = 3.0;
          this.ringTm    = 0;
          this.GOOD_MIN  = 16;
          this.GOOD_MAX  = 42;
          this.GREAT_MIN = 6;
          this.phase     = 'shrink';
          this.resultT   = 0;
          this.quality   = '';
          this.pauseT    = 0;
          this.sparks    = [];
          this.done      = false;
          this.hairCol   = C.hairR;
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W, H = api.H;
          for (var s = this.sparks.length - 1; s >= 0; s--) {
            var sp = this.sparks[s];
            sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.life -= dt;
            if (sp.life <= 0) this.sparks.splice(s, 1);
          }
          if (this.phase === 'shrink') {
            this.ringTm += dt;
            var ratio = this.ringTm / this.shrinkT;
            this.ringR = 104 - ratio * 96;
            if (this.ringR < 4) {
              this.quality = 'TOO GREEN!';
              this.misses++;
              this.hairCol = C.hairG;
              api.audio.sfx('hurt'); api.shake(4, 0.25);
              api.flash(C.lin, 0.3);
              this.phase = 'result'; this.resultT = 0;
              if (this.misses >= this.maxMisses) { this.done = true; api.lose(); return; }
            }
            var tapped = api.pointer.justDown || api.keyPressed('a') || api.keyPressed('up');
            if (tapped) {
              var r = this.ringR;
              if (r <= this.GREAT_MIN) {
                this.quality = 'PERFECT!';
                api.audio.sfx('power'); api.burst(W / 2, H * 0.36, C.goldL, 12);
                api.addScore(25); this.hairCol = C.hairB;
              } else if (r <= this.GOOD_MIN) {
                this.quality = 'JET BLACK!';
                api.audio.sfx('coin'); api.burst(W / 2, H * 0.36, C.hair || C.dark, 8);
                api.addScore(15); this.hairCol = C.hairB;
              } else if (r <= this.GOOD_MAX) {
                this.quality = 'A HINT GREEN';
                api.audio.sfx('blip'); this.misses++;
                this.hairCol = C.hairG;
                api.flash(C.lin, 0.18);
                if (this.misses >= this.maxMisses) { this.done = true; api.lose(); return; }
              } else {
                this.quality = 'TOO SOON!';
                api.audio.sfx('blip'); this.misses++;
                if (this.misses >= this.maxMisses) { this.done = true; api.lose(); return; }
              }
              for (var s2 = 0; s2 < 8; s2++) {
                this.sparks.push({ x: W / 2 + (Math.random() - 0.5) * 40, y: H * 0.36, vx: (Math.random() - 0.5) * 55, vy: -45 - Math.random() * 55, life: 1.2 });
              }
              this.round++;
              this.phase = 'result'; this.resultT = 0;
              if (this.round >= this.rounds) { this.done = true; api.win(); return; }
            }
          } else if (this.phase === 'result') {
            this.resultT += dt;
            if (this.resultT > 0.82) { this.phase = 'pause'; this.pauseT = 0; this.ringR = 104; this.ringTm = 0; }
          } else if (this.phase === 'pause') {
            this.pauseT += dt;
            var nextShrink = Math.max(2.2, this.shrinkT - this.round * 0.06);
            this.shrinkT = nextShrink;
            if (this.pauseT > 0.50) this.phase = 'shrink';
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var t = api.t;
          // Bedroom interior
          c.fillStyle = '#140e1a'; c.fillRect(0, 0, W, H);
          // Vanity table area
          g.rect(W / 2 - 30, H * 0.55, 60, 30, '#3a2010');
          g.rect(W / 2 - 28, H * 0.53, 56, 6, '#5a3818');
          // Mirror
          var mx = W / 2, my = H * 0.36;
          c.strokeStyle = C.goldL; c.lineWidth = 3;
          c.beginPath(); c.arc(mx, my, 36, 0, Math.PI * 2); c.stroke();
          c.strokeStyle = C.gold; c.lineWidth = 1.5;
          c.beginPath(); c.arc(mx, my, 34, 0, Math.PI * 2); c.stroke();
          // Mirror interior
          c.fillStyle = '#1a2028'; c.beginPath(); c.arc(mx, my, 33, 0, Math.PI * 2); c.fill();
          // Anne in mirror
          var hc = this.hairCol;
          g.circle(mx, my - 6, 10, C.skin);
          g.circle(mx, my - 15, 9, hc);
          g.circle(mx + 8, my - 12, 6, hc);
          g.circle(mx - 8, my - 12, 6, hc);
          g.rect(mx - 10, my + 4, 20, 20, C.dress);
          // Mirror handle
          g.rect(mx - 2, my + 37, 4, 14, C.gold);
          g.rect(mx - 6, my + 50, 12, 4, C.gold);
          // Dye bottle on table
          var dbx = W / 2 + 20, dby = H * 0.55 - 2;
          var dyeCol = this.phase === 'shrink' && this.ringR <= this.GOOD_MAX ? C.lin : '#2a1840';
          g.rect(dbx - 5, dby - 16, 10, 20, dyeCol);
          g.circle(dbx, dby - 16, 4, dyeCol === C.lin ? C.linD : '#180c28');
          // Sparks
          for (var s = 0; s < this.sparks.length; s++) {
            var sp2 = this.sparks[s];
            c.globalAlpha = sp2.life / 1.2;
            g.circle(sp2.x, sp2.y, 3, this.hairCol === C.hairB ? C.goldL : C.lin); c.globalAlpha = 1;
          }
          // Ring system
          var cx = W / 2, cy = H * 0.36;
          // Zone markers
          c.strokeStyle = C.lin; c.lineWidth = 1.5; c.globalAlpha = 0.3;
          c.beginPath(); c.arc(cx, cy, this.GOOD_MAX, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
          c.strokeStyle = C.goldL; c.lineWidth = 2; c.globalAlpha = 0.38;
          c.beginPath(); c.arc(cx, cy, this.GOOD_MIN, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
          c.strokeStyle = C.goldLL; c.lineWidth = 2.5; c.globalAlpha = 0.38;
          c.beginPath(); c.arc(cx, cy, this.GREAT_MIN, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
          // Shrinking ring
          if (this.phase !== 'pause') {
            var r = Math.max(3, this.ringR);
            var ringCol = r <= this.GREAT_MIN ? C.goldLL : r <= this.GOOD_MIN ? C.gold : r <= this.GOOD_MAX ? C.cream : C.lin;
            c.strokeStyle = ringCol; c.lineWidth = 3;
            c.globalAlpha = this.phase === 'result' ? 0.35 : 1.0;
            c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
          }
          g.circle(cx, cy, 6, C.gold); g.circle(cx, cy, 3, C.goldLL);
          // Hit quality label
          if (this.phase === 'result' && this.quality) {
            var qc = (this.quality === 'PERFECT!' || this.quality === 'JET BLACK!') ? C.goldLL : this.quality === 'TOO SOON!' ? C.cream : C.lin;
            api.txtCFit(this.quality, W / 2, cy - 30, 10, qc, true, W - 40);
          }
          // Round progress + lives
          api.topBar(this.maxMisses - this.misses, 'DYE ' + (this.round + 1) + '/' + this.rounds, '♥'.repeat(this.maxMisses - this.misses) + '♡'.repeat(this.misses));
        },
      },

      /* ======================================================================
       * TALE 4 — THE HAUNTED WOOD
       * Anne and Diana invented 'The Haunted Wood' and then terrified themselves.
       * Free-move: dodge dark shadow shapes for 26 seconds. 3 lives.
       * ==================================================================== */
      {
        id: 'hauntedWood',
        name: 'THE HAUNTED WOOD',
        sub: 'ANNE AND DIANA RUN',
        icon: function (api, x, y) { ICONS[3](api, x, y); },
        intro: [
          'ANNE AND DIANA',
          'NAMED THE OLD SPRUCE GROVE',
          '"THE HAUNTED WOOD"',
          'and frightened themselves silly.',
          'Reach the far gate before',
          'the shadows catch you!',
        ],
        quote: '"The Haunted Wood was haunted by a very persistent imagination." — L. M. Montgomery',
        help: 'DRAG or use ARROWS to dodge the shadows! Reach the gate in 26 seconds!',
        winText: 'Through the gate! Anne and Diana collapse laughing on the other side.',
        loseText: 'The shadows get you three times. Brave the wood again!',
        init: function (api) {
          this.px     = api.W / 2;
          this.py     = api.H - 60;
          this.lives  = 3;
          this.timer  = 0;
          this.tlimit = 26;
          this.shadows = [];
          this.hurtT  = 0;
          this.done   = false;
          this.sparkles = [];
          // Spawn 4 patrolling shadows
          var W = api.W, H = api.H;
          var shadowDefs = [
            { x: 60,  y: H * 0.22, rx: 40, speed: 1.0, radius: 24 },
            { x: 200, y: H * 0.35, rx: 38, speed: -1.2, radius: 22 },
            { x: 100, y: H * 0.50, rx: 50, speed: 0.85, radius: 26 },
            { x: 165, y: H * 0.65, rx: 35, speed: -0.9, radius: 20 },
          ];
          shadowDefs.forEach(function (sd) {
            this.shadows.push({ x: sd.x, y: sd.y, ox: sd.x, rx: sd.rx, speed: sd.speed, phase: Math.random() * Math.PI * 2, radius: sd.radius, t: 0 });
          }, this);
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W, H = api.H;
          this.timer += dt;
          this.hurtT = Math.max(0, this.hurtT - dt);
          var prog = this.timer / this.tlimit;
          // Player move
          var spd = 160;
          if (api.keyDown('left'))  this.px -= spd * dt;
          if (api.keyDown('right')) this.px += spd * dt;
          if (api.keyDown('up'))    this.py -= spd * dt;
          if (api.keyDown('down'))  this.py += spd * dt;
          if (api.pointer.down) {
            this.px += (api.pointer.x - this.px) * 9 * dt;
            this.py += (api.pointer.y - this.py) * 9 * dt;
          }
          this.px = clamp(this.px, 14, W - 14);
          this.py = clamp(this.py, 40, H - 30);
          // Sparkle trail
          this.sparkles.push({ x: this.px + (Math.random() - 0.5) * 6, y: this.py + 8, life: 0.7 });
          for (var k = this.sparkles.length - 1; k >= 0; k--) {
            this.sparkles[k].life -= dt;
            if (this.sparkles[k].life <= 0) this.sparkles.splice(k, 1);
          }
          // Shadow movement
          var spMult = 1 + prog * 0.5;
          this.shadows.forEach(function (sh) {
            sh.t += dt;
            sh.x = sh.ox + Math.sin(sh.t * sh.speed * spMult + sh.phase) * sh.rx;
            sh.y += Math.sin(sh.t * 0.4) * 0.5;
          });
          // Collision
          if (this.hurtT <= 0) {
            for (var i = 0; i < this.shadows.length; i++) {
              var sh = this.shadows[i];
              var dx = this.px - sh.x, dy = this.py - sh.y;
              var sr = sh.radius + prog * 4;
              if (dx * dx + dy * dy < sr * sr) {
                this.lives--;
                this.hurtT = 1.5;
                api.shake(7, 0.4); api.flash(C.shadow, 0.4); api.audio.sfx('hurt');
                if (this.lives <= 0) { this.done = true; api.lose(); return; }
                break;
              }
            }
          }
          if (this.timer >= this.tlimit) { this.done = true; api.win(); }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var t = api.t;
          var prog = this.timer / this.tlimit;
          // Dark wood night
          c.fillStyle = C.dimD; c.fillRect(0, 0, W, H);
          // Moonlight
          c.globalAlpha = 0.14 + 0.06 * Math.sin(t * 0.7);
          var mgl = c.createRadialGradient(W / 2, -20, 0, W / 2, -20, 260);
          mgl.addColorStop(0, C.frost); mgl.addColorStop(1, 'transparent');
          c.fillStyle = mgl; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
          // Spruce trees silhouettes
          var treePosns = [10, 50, 85, 130, 180, 220, 255];
          treePosns.forEach(function (tx) {
            var th = 100 + ((tx * 7) % 60);
            c.fillStyle = '#0c1808';
            c.beginPath(); c.moveTo(tx - 14, H); c.lineTo(tx, H - th); c.lineTo(tx + 14, H); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(tx - 10, H - th * 0.4); c.lineTo(tx, H - th * 0.7); c.lineTo(tx + 10, H - th * 0.4); c.closePath(); c.fill();
          });
          // Shadow creatures
          this.shadows.forEach(function (sh) {
            var glw = c.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, sh.radius + 8);
            glw.addColorStop(0, 'rgba(60,20,80,.85)');
            glw.addColorStop(0.5, 'rgba(30,10,50,.5)');
            glw.addColorStop(1, 'transparent');
            c.fillStyle = glw; c.beginPath(); c.arc(sh.x, sh.y, sh.radius + 8, 0, Math.PI * 2); c.fill();
            // Glowing eyes
            g.circle(sh.x - 5, sh.y - 3, 3, C.shadowL);
            g.circle(sh.x + 5, sh.y - 3, 3, C.shadowL);
            g.circle(sh.x - 5, sh.y - 3, 1, C.bloom);
            g.circle(sh.x + 5, sh.y - 3, 1, C.bloom);
          });
          // Gate at top (destination)
          var gateY = 24;
          g.rect(W / 2 - 22, gateY - 4, 44, 22, C.branch);
          g.rect(W / 2 - 18, gateY, 10, 22, C.branchL);
          g.rect(W / 2 + 8,  gateY, 10, 22, C.branchL);
          // Gate glow
          c.globalAlpha = 0.22 + 0.12 * Math.abs(Math.sin(t * 1.2));
          g.circle(W / 2, gateY + 6, 26, C.goldL); c.globalAlpha = 1;
          api.txtC('GATE', W / 2, gateY - 2, 5, C.goldLL, true);
          // Progress bar (how far to gate)
          var barW = W - 24;
          g.rect(12, H - 14, barW, 8, C.dark);
          g.rect(12, H - 14, barW * prog, 8, C.hill);
          g.rect(12, H - 14, barW * prog * 0.55, 8, C.grassL);
          // Sparkle trail (player lantern glow)
          for (var k = 0; k < this.sparkles.length; k++) {
            c.globalAlpha = this.sparkles[k].life;
            g.circle(this.sparkles[k].x, this.sparkles[k].y, 3, C.goldL); c.globalAlpha = 1;
          }
          // Anne (girl with lantern)
          var px = this.px, py = this.py;
          var hide = this.hurtT > 0 && Math.floor(this.hurtT * 8) % 2 === 0;
          if (!hide) {
            // Lantern glow
            c.globalAlpha = 0.30 + 0.12 * Math.sin(t * 2.1);
            g.circle(px + 12, py - 12, 22, C.goldL); c.globalAlpha = 1;
            g.circle(px + 12, py - 12, 6, C.goldLL);
            g.rect(px + 10, py - 20, 4, 8, C.creamDD);
            // Anne sprite
            drawAnne(g, c, px, py, C.hairR, false, api.t);
          }
          api.topBar(this.lives, Math.max(0, this.tlimit - this.timer).toFixed(1) + 's', 'REACH THE GATE');
        },
      },

      /* ======================================================================
       * TALE 5 — THE SCHOLARSHIP
       * Anne wins the Avery Scholarship to Queen's Academy, Charlottetown.
       * Catch 15 golden books, dodge grey boring texts. 3 misses, 24 seconds.
       * ==================================================================== */
      {
        id: 'scholarship',
        name: 'THE SCHOLARSHIP',
        sub: "CHARLOTTETOWN AWAITS",
        icon: function (api, x, y) { ICONS[4](api, x, y); },
        intro: [
          'ANNE STUDIED HARD.',
          'GILBERT BLYTHE STUDIED HARDER.',
          'At Queen\'s Academy entrance',
          'only one could win',
          'the Avery Scholarship.',
          'Catch the golden books!',
        ],
        quote: '"I\'m going to win the Avery prize if hard work can do it." — Anne Shirley',
        help: 'CATCH the gold books and letters! DODGE the grey boring texts!',
        winText: 'Anne wins the Avery Scholarship! Green Gables shines with pride.',
        loseText: 'Three wrong answers. Study harder, Anne!',
        init: function (api) {
          this.px     = api.W / 2;
          this.py     = api.H - 60;
          this.caught = 0;
          this.need   = 15;
          this.misses = 0;
          this.maxM   = 3;
          this.timer  = 0;
          this.tlimit = 24;
          this.items  = [];
          this.spawnT = 0;
          this.spRate = 0.95;
          this.speed  = 82;
          this.hurtT  = 0;
          this.done   = false;
          this.stars  = [];
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W, H = api.H;
          this.timer += dt;
          this.hurtT = Math.max(0, this.hurtT - dt);
          var prog = this.timer / this.tlimit;
          if (api.keyDown('left'))  this.px -= 162 * dt;
          if (api.keyDown('right')) this.px += 162 * dt;
          if (api.pointer.down) this.px += (api.pointer.x - this.px) * 10 * dt;
          this.px = clamp(this.px, 18, W - 18);
          // Spawn
          this.spawnT += dt;
          if (this.spawnT >= this.spRate) {
            this.spawnT = 0;
            this.spRate = Math.max(0.52, 0.95 - prog * 0.4);
            this.speed  = Math.min(182, 82 + prog * 85);
            var good = Math.random() < 0.60;
            this.items.push({
              x: 20 + Math.random() * (W - 40), y: -20,
              vy: this.speed * (0.85 + Math.random() * 0.3),
              t: good ? 0 : 1,
              tilt: (Math.random() - 0.5) * 0.6,
            });
          }
          // Stars
          if (Math.random() < 0.08) {
            this.stars.push({ x: Math.random() * W, y: H * 0.12 + Math.random() * H * 0.3, life: 0.9 + Math.random() * 0.6 });
          }
          for (var s = this.stars.length - 1; s >= 0; s--) {
            this.stars[s].life -= dt * 0.4;
            if (this.stars[s].life <= 0) this.stars.splice(s, 1);
          }
          // Items
          for (var i = this.items.length - 1; i >= 0; i--) {
            var it = this.items[i];
            it.y += it.vy * dt;
            if (it.y > H + 20) { this.items.splice(i, 1); continue; }
            var dx = it.x - this.px, dy = it.y - this.py;
            if (dx * dx + dy * dy < 22 * 22) {
              this.items.splice(i, 1);
              if (it.t === 0) {
                this.caught++;
                api.addScore(10);
                api.audio.sfx('coin');
                api.burst(it.x, it.y, C.gold, 8);
                if (this.caught >= this.need) { this.done = true; api.win(); return; }
              } else if (this.hurtT <= 0) {
                this.misses++;
                this.hurtT = 1.0;
                api.shake(4, 0.25); api.flash(C.bookGr, 0.2); api.audio.sfx('hurt');
                if (this.misses >= this.maxM) { this.done = true; api.lose(); return; }
              }
            }
          }
          if (this.timer >= this.tlimit) { this.done = true; api.lose(); }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var t = api.t;
          var prog = this.timer / this.tlimit;
          // Charlottetown Academy hall
          var sky2 = c.createLinearGradient(0, 0, 0, H * 0.45);
          sky2.addColorStop(0, '#1a0c2a'); sky2.addColorStop(1, '#2a1848');
          c.fillStyle = sky2; c.fillRect(0, 0, W, H);
          // Stars
          for (var s = 0; s < this.stars.length; s++) {
            c.globalAlpha = this.stars[s].life * 0.7;
            g.circle(this.stars[s].x, this.stars[s].y, 1, C.goldLL); c.globalAlpha = 1;
          }
          // Moon
          g.circle(W - 28, 24, 14, C.cream); g.circle(W - 24, 22, 12, '#1a0c2a');
          // Academy building silhouette
          c.fillStyle = '#100808';
          c.fillRect(0, H * 0.22, W, H * 0.58);
          // Columns
          for (var col = 0; col < 5; col++) {
            var cx2 = 20 + col * 56;
            c.fillStyle = '#1e1010'; c.fillRect(cx2, H * 0.22, 14, H * 0.58);
            c.fillStyle = '#2a1818'; c.fillRect(cx2, H * 0.22, 5, H * 0.58);
          }
          // Pediment
          c.fillStyle = '#1a0e0a';
          c.beginPath(); c.moveTo(0, H * 0.22); c.lineTo(W / 2, H * 0.06); c.lineTo(W, H * 0.22); c.closePath(); c.fill();
          // Avery Prize banner
          g.rect(W / 2 - 52, H * 0.28, 104, 22, '#2a1830');
          g.rectO(W / 2 - 52, H * 0.28, 104, 22, C.gold, 1);
          api.txtCFit('AVERY SCHOLARSHIP', W / 2, H * 0.30, 6, C.goldL, true, 96);
          // Lit windows
          [[38, 42, 0.9], [108, 50, 0.7], [162, 38, 0.8], [222, 46, 0.75]].forEach(function (wp) {
            c.fillStyle = C.goldL; c.globalAlpha = (0.3 + 0.2 * Math.sin(t * 0.9 + wp[2])) * 0.7;
            c.fillRect(wp[0], wp[1] + H * 0.22, 18, 24); c.globalAlpha = 1;
          });
          // Floor
          c.fillStyle = '#0c0808'; c.fillRect(0, H * 0.78, W, H * 0.22);
          // Items
          for (var i = 0; i < this.items.length; i++) {
            var it = this.items[i];
            c.save(); c.translate(it.x, it.y); c.rotate(it.tilt);
            if (it.t === 0) {
              // Gold book
              g.rect(-10, -8, 20, 16, C.book);
              g.rect(-10, -8, 4, 16, C.bookD);
              g.rect(-8, -5, 16, 2, C.goldLL);
              g.rect(-8, -1, 12, 2, C.goldLL);
              g.rect(-8,  3, 14, 2, C.goldLL);
            } else {
              // Grey boring text
              g.rect(-10, -8, 20, 16, C.bookGr);
              g.rect(-10, -8, 3, 16, C.bookGrD);
              g.rect(-8, -5, 16, 1, C.greyD);
              g.rect(-8, -2, 14, 1, C.greyD);
            }
            c.restore();
          }
          // Progress bar
          var barW = W - 24;
          g.rect(12, H - 12, barW, 8, '#1a0e18');
          g.rect(12, H - 12, barW * (this.caught / this.need), 8, C.gold);
          g.rect(12, H - 12, barW * (this.caught / this.need) * 0.5, 8, C.goldLL);
          // Anne at bottom with bag
          var px = this.px, py = this.py;
          var hide = this.hurtT > 0 && Math.floor(this.hurtT * 8) % 2 === 0;
          if (!hide) {
            drawAnne(g, c, px, py, C.hairR, false, api.t);
            // Book bag
            g.rect(px + 9, py + 4, 14, 12, C.book);
            g.rect(px + 9, py + 2, 14, 5, C.bookD);
          }
          // Miss indicators (wrong answer X marks)
          for (var m = 0; m < this.maxM; m++) {
            var mc = m < this.misses ? C.red : C.cream;
            api.txtC(m < this.misses ? '✘' : '✓', W - 44 + m * 14, 8, 8, mc, true);
          }
          api.topBar(this.maxM - this.misses, Math.max(0, this.tlimit - this.timer).toFixed(1) + 's', this.caught + '/' + this.need + ' BOOKS');
        },
      },

    ], // end chapters
  }); // end RetroSaga.create
}());
