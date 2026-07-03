/* ============================================================================
 * GREAT EXPECTATIONS — RISE FROM THE FORGE
 * Five acts from Dickens' 1861 novel:
 *   1. THE MARSHES     — free-move stealth: bring provisions to Magwitch (26s)
 *   2. SATIS HOUSE     — fall-catcher: catch cake, dodge rot (collect 12)
 *   3. JAGGERS' LAW    — pendulum: tap the gavel into the zone 8 times
 *   4. DOWN THE THAMES — runner/dodge: row to the waiting ship (26s)
 *   5. THE CONFRONTATION — dodge + tap: strike Compeyson 5 times
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ─── Victorian England palette ─── */
  var C = {
    black:  '#080608',
    dark:   '#180e14',
    darkN:  '#0a1220',
    marsh:  '#192810',
    marshL: '#2e4018',
    mist:   '#8a9878',
    fog:    '#b8c4a8',
    amber:  '#c88820',
    amberL: '#f0b030',
    gasYel: '#ffe090',
    cream:  '#e8d8b0',
    parch:  '#d4c080',
    parchD: '#a89840',
    red:    '#cc2211',
    redD:   '#881a08',
    brown:  '#5a3818',
    brownL: '#8a5a28',
    stone:  '#8a7a68',
    stonD:  '#6a5a48',
    river:  '#1a3040',
    riverL: '#2a5060',
    water:  '#1e4050',
    fogGr:  '#c0c8b0',
    green:  '#4a7a3a',
    greenL: '#6aaa50',
    blue:   '#2a4a68',
    white:  '#f0e8d8',
    straw:  '#d4b870',
    chain:  '#6a6050',
    brass:  '#b89040',
    silk:   '#d8c0a0',
    cake:   '#f0d8a0',
    cakeD:  '#d0a860',
    rot:    '#3a5010',
    rotL:   '#5a7020',
    boat:   '#5a3818',
    boatL:  '#7a5030',
    police: '#1e2a4a',
    hull:   '#2a3820',
  };

  /* ─── Draw Pip: small silhouetted boy figure ─── */
  function drawPip(g, c, px, py) {
    // Body
    g.rect(px - 6, py - 10, 12, 14, C.stonD);
    // Head
    g.circle(px, py - 16, 7, C.mist);
    // Cap (flat top)
    c.fillStyle = C.dark;
    c.fillRect(px - 8, py - 22, 16, 4);
    c.fillRect(px - 5, py - 26, 10, 5);
    // Eyes glow with amber
    g.circle(px - 2, py - 18, 1, C.amberL);
    g.circle(px + 2, py - 18, 1, C.amberL);
    // Legs
    g.rect(px - 5, py + 3, 4, 8, C.dark);
    g.rect(px + 1, py + 3, 4, 8, C.dark);
  }

  /* ─── Draw a glowing lantern (for soldiers) ─── */
  function drawLantern(g, c, lx, ly) {
    g.rect(lx - 4, ly - 7, 8, 10, C.brownL);
    c.globalAlpha = 0.5;
    g.circle(lx, ly - 2, 4, C.gasYel);
    c.globalAlpha = 1;
    g.rect(lx - 1, ly - 12, 2, 6, C.brown);
  }

  /* ─── Draw a soldier silhouette ─── */
  function drawSoldier(g, c, sx, sy, facingRight) {
    c.fillStyle = '#0a0a14';
    // Body + coat
    g.rect(sx - 7, sy - 14, 14, 18, '#0a0a14');
    // Head
    g.circle(sx, sy - 20, 7, '#0a0a14');
    // Tall hat (shako)
    c.fillStyle = '#0a0a14';
    c.fillRect(sx - 6, sy - 32, 12, 14);
    c.fillRect(sx - 7, sy - 34, 14, 3);
    // Rifle
    var rfDir = facingRight ? 1 : -1;
    g.rect(sx + rfDir * 6, sy - 28, rfDir * 14, 3, '#1a1a24');
  }

  /* ─── Emblem: sealed envelope with brass key ─── */
  function emblem(api, ecx, ecy) {
    var g = api.gfx, c = api.ctx;
    // Ambient glow
    c.globalAlpha = 0.14;
    c.fillStyle = C.amberL;
    c.beginPath(); c.arc(ecx, ecy, 46, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;

    // Envelope body
    c.fillStyle = C.parch;
    c.fillRect(ecx - 22, ecy - 16, 44, 30);
    c.strokeStyle = C.parchD; c.lineWidth = 2;
    c.strokeRect(ecx - 22, ecy - 16, 44, 30);

    // Envelope flap (V-fold from top)
    c.fillStyle = C.silk;
    c.beginPath();
    c.moveTo(ecx - 22, ecy - 16);
    c.lineTo(ecx, ecy - 5);
    c.lineTo(ecx + 22, ecy - 16);
    c.closePath(); c.fill();
    c.strokeStyle = C.parchD; c.lineWidth = 1; c.stroke();

    // Red wax seal
    g.circle(ecx, ecy + 6, 8, C.red);
    g.circle(ecx, ecy + 6, 4, C.redD);

    // Brass key below envelope
    c.strokeStyle = C.brass; c.lineWidth = 2;
    c.beginPath(); c.arc(ecx - 7, ecy + 25, 6, 0, Math.PI * 2); c.stroke();
    c.fillStyle = C.brass;
    c.fillRect(ecx - 1, ecy + 22, 16, 3);
    c.fillRect(ecx + 11, ecy + 25, 3, 4);
    c.fillRect(ecx + 7, ecy + 25, 3, 5);
  }

  /* ─── Scenery: Victorian marshes / barrister's office ─── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Dark Victorian barrister's office
      c.fillStyle = '#0e0a06'; c.fillRect(0, 0, W, H);

      // Back wall + shelves
      c.fillStyle = '#1a1008';
      c.fillRect(0, 0, W, H * 0.42);
      // Shelf planks
      c.fillStyle = '#2a1a0e';
      c.fillRect(0, Math.floor(H * 0.13), W, 3);
      c.fillRect(0, Math.floor(H * 0.255), W, 3);
      c.fillRect(0, Math.floor(H * 0.38), W, 3);

      // Law books across 3 shelves
      var bookColors = ['#4a2810','#1e3a50','#2a4a1a','#503018','#3a1a40','#4a3010'];
      var bookWidths = [9, 11, 8, 10, 9, 11, 8, 10, 9];
      var bx = 3;
      for (var bi = 0; bi < 26; bi++) {
        var bw = bookWidths[bi % bookWidths.length];
        var bColor = bookColors[bi % 6];
        var shelfRow = bi % 3;
        var bsy = H * 0.02 + shelfRow * (H * 0.13);
        var bsh = 18 + (bi * 7) % 14;
        var sbx = 3 + (bi % 9) * 28 + (bi >= 9 && bi < 18 ? 5 : 0) + (bi >= 18 ? 3 : 0);
        c.fillStyle = bColor;
        c.fillRect(sbx, bsy, bw, bsh);
        c.fillStyle = C.parchD;
        c.fillRect(sbx + 1, bsy + bsh - 4, bw - 2, 3);
      }

      // Desk surface gradient
      var dg = c.createLinearGradient(0, H * 0.42, 0, H);
      dg.addColorStop(0, '#3a2010');
      dg.addColorStop(1, '#1c0e06');
      c.fillStyle = dg;
      c.fillRect(0, H * 0.42, W, H * 0.58);
      // Desk edge highlight
      c.fillStyle = '#5a3018';
      c.fillRect(0, H * 0.42, W, 4);

      // Candle at left
      var cndx = 22;
      g.rect(cndx - 3, Math.floor(H * 0.51), 6, 18, C.cream);
      g.circle(cndx, Math.floor(H * 0.51) - 3, 4, C.gasYel);
      c.globalAlpha = 0.12; c.fillStyle = C.gasYel;
      c.beginPath(); c.arc(cndx, H * 0.51, 22, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;

      // Inkwell + quill at right
      var inx = W - 30, iny = H * 0.55;
      g.circle(inx, iny + 8, 10, '#1a1006');
      c.strokeStyle = '#3a2a18'; c.lineWidth = 2;
      c.beginPath(); c.arc(inx, iny + 8, 10, 0, Math.PI * 2); c.stroke();
      g.circle(inx, iny + 4, 5, '#000a08');
      c.strokeStyle = C.straw; c.lineWidth = 1;
      c.beginPath(); c.moveTo(inx - 2, iny + 4); c.lineTo(inx - 18, iny - 12); c.stroke();
      c.globalAlpha = 0.55; c.fillStyle = C.straw;
      c.beginPath(); c.moveTo(inx - 2, iny + 4); c.lineTo(inx - 13, iny - 8);
      c.lineTo(inx - 18, iny - 12); c.closePath(); c.fill();
      c.globalAlpha = 1;

      // Sealing wax stick
      g.rect(W - 56, Math.floor(H * 0.53), 5, 16, C.red);
      return;
    }

    // Kent marshes backdrop (boot/intro/result/finale)
    var sk = c.createLinearGradient(0, 0, 0, H);
    sk.addColorStop(0, '#080b10');
    sk.addColorStop(0.42, '#10181e');
    sk.addColorStop(1, '#18281a');
    c.fillStyle = sk; c.fillRect(0, 0, W, H);

    // Moon
    c.globalAlpha = 0.55;
    c.fillStyle = '#f0e8c0';
    c.beginPath(); c.arc(W * 0.72, H * 0.14, 17, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.08;
    c.beginPath(); c.arc(W * 0.72, H * 0.14, 30, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;

    // Stars
    c.fillStyle = '#d8dce0';
    for (var si = 0; si < 22; si++) {
      var sx2 = (si * 137 + 29) % W;
      var sy2 = (si * 91 + 7) % Math.floor(H * 0.32);
      c.globalAlpha = 0.28 + 0.18 * Math.sin(t * 0.4 + si * 0.7);
      c.beginPath(); c.arc(sx2, sy2, 1, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;

    // Distant river
    c.fillStyle = C.river;
    c.fillRect(0, Math.floor(H * 0.44), W, 18);
    // Ripple shimmer
    c.fillStyle = C.riverL;
    for (var ri = 0; ri < 6; ri++) {
      var rip = ((t * 20 + ri * 54) % (W + 30)) - 15;
      c.fillRect(rip, Math.floor(H * 0.46), 18, 2);
    }

    // Prison hulk silhouette
    c.fillStyle = '#050506';
    c.beginPath();
    c.moveTo(W * 0.10, H * 0.44 + 2);
    c.lineTo(W * 0.10, H * 0.44 - 20);
    c.lineTo(W * 0.145, H * 0.44 - 20);
    c.lineTo(W * 0.148, H * 0.44 - 34);
    c.lineTo(W * 0.158, H * 0.44 - 34);
    c.lineTo(W * 0.162, H * 0.44 - 20);
    c.lineTo(W * 0.44, H * 0.44 - 20);
    c.lineTo(W * 0.44, H * 0.44 + 2);
    c.closePath(); c.fill();
    c.fillRect(W * 0.12, Math.floor(H * 0.44) - 29, Math.floor(W * 0.06), 2);

    // Church spire (far right)
    c.fillStyle = '#06060a';
    c.fillRect(Math.floor(W * 0.82), Math.floor(H * 0.28), 14, Math.floor(H * 0.16));
    c.beginPath();
    c.moveTo(W * 0.82, H * 0.28);
    c.lineTo(W * 0.89, H * 0.28);
    c.lineTo(W * 0.855, H * 0.13);
    c.closePath(); c.fill();

    // Gravestones
    var graveData = [
      [22, 0.57, 13, 22, 0], [50, 0.55, 11, 27, 1], [72, 0.58, 13, 20, 0],
      [100, 0.56, 14, 24, 1], [130, 0.59, 12, 21, 0], [160, 0.57, 14, 23, 1],
      [198, 0.56, 14, 22, 0], [228, 0.58, 11, 26, 1], [252, 0.56, 13, 20, 0],
    ];
    c.fillStyle = '#060608';
    for (var gvi = 0; gvi < graveData.length; gvi++) {
      var gd = graveData[gvi];
      var gx = gd[0], gy = H * gd[1], gw = gd[2], gh = gd[3], gtype = gd[4];
      if (gtype === 1) {
        // Arched headstone
        c.beginPath();
        c.moveTo(gx - gw/2, gy + gh);
        c.lineTo(gx - gw/2, gy + gh * 0.5);
        c.arc(gx, gy + gh * 0.5, gw/2, Math.PI, 0);
        c.lineTo(gx + gw/2, gy + gh);
        c.closePath(); c.fill();
      } else {
        // Cross headstone
        c.fillRect(gx - gw/2, gy, gw, gh);
        c.fillRect(gx - 2, gy - 8, 4, 10);
        c.fillRect(gx - 7, gy - 5, 14, 3);
      }
    }

    // Marsh ground
    c.fillStyle = C.marsh;
    c.fillRect(0, Math.floor(H * 0.70), W, Math.floor(H * 0.30));
    c.fillStyle = C.marshL;
    for (var gt = 0; gt < 14; gt++) {
      c.fillRect((gt * 127 + 30) % W, Math.floor(H * 0.70) + (gt * 11) % 18, 7 + gt % 6, 3 + gt % 4);
    }

    // Mist wisps
    for (var mw = 0; mw < 5; mw++) {
      var mwx = ((t * 7 + mw * 63) % (W + 100)) - 50;
      var mwy = H * 0.47 + mw * 26 + Math.sin(t * 0.28 + mw * 1.3) * 18;
      c.globalAlpha = 0.036;
      c.fillStyle = C.fogGr;
      c.beginPath(); c.ellipse(mwx, mwy, 68, 22, 0, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(4,4,8,.84)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Menu: 5 legal indentures on a barrister's desk ─── */
  var CARDS = [
    { x: 12,  y: 76,  w: 108, h: 76 },
    { x: 150, y: 84,  w: 108, h: 76 },
    { x: 81,  y: 198, w: 108, h: 76 },
    { x: 12,  y: 316, w: 108, h: 76 },
    { x: 150, y: 322, w: 108, h: 76 },
  ];

  var CHAPTER_SHORT = ['THE MARSHES', 'SATIS HOUSE', "JAGGERS' LAW", 'THE THAMES', 'THE WHARF'];

  function drawChapterIcon(api, idx, ix, iy) {
    var g = api.gfx, c = api.ctx;
    if (idx === 0) {
      // Chain link (Magwitch's leg-iron)
      c.strokeStyle = C.chain; c.lineWidth = 3;
      c.beginPath(); c.arc(ix - 6, iy, 5, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(ix + 6, iy, 5, 0, Math.PI * 2); c.stroke();
    } else if (idx === 1) {
      // Three-tier wedding cake
      g.rect(ix - 11, iy + 3,  22, 5, C.cake);
      g.rect(ix - 7,  iy - 2,  14, 6, C.cake);
      g.rect(ix - 4,  iy - 7,  8,  6, C.cake);
      c.strokeStyle = C.parchD; c.lineWidth = 1;
      c.strokeRect(ix - 11, iy + 3, 22, 5);
    } else if (idx === 2) {
      // Gavel
      g.rect(ix - 10, iy - 3, 20, 6, C.brownL);
      g.rect(ix + 5,  iy - 1, 14, 3, C.brown);
      g.circle(ix - 10, iy, 7, C.brownL);
    } else if (idx === 3) {
      // Rowing oar
      c.strokeStyle = C.brownL; c.lineWidth = 3;
      c.beginPath(); c.moveTo(ix - 8, iy + 8); c.lineTo(ix + 12, iy - 8); c.stroke();
      c.fillStyle = C.brown;
      c.beginPath(); c.ellipse(ix - 8, iy + 8, 7, 4, -0.7, 0, Math.PI * 2); c.fill();
    } else {
      // Crossed iron bars (confrontation)
      c.strokeStyle = C.stone; c.lineWidth = 3;
      c.beginPath(); c.moveTo(ix - 9, iy + 9); c.lineTo(ix + 9, iy - 9); c.stroke();
      c.strokeStyle = C.amber; c.lineWidth = 2;
      c.beginPath(); c.moveTo(ix + 9, iy + 9); c.lineTo(ix - 9, iy - 9); c.stroke();
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
   * SAGA
   * ═══════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id:        'greatexpect',
    title:     'GREAT EXPECTATIONS',
    subtitle:  'FIVE ACTS FROM THE FORGE TO FORTUNE',
    currency:  'EXPECTATIONS',
    accent:    C.amber,
    credit:    'GREAT EXPECTATIONS · CHARLES DICKENS · 1861',
    bootLine:  'FROM HUMBLE FORGE TO LONDON SOCIETY',
    bootCta:   'BEGIN, PIP',
    menuLabel: "THE SOLICITOR'S DESK",
    menuHint:  'CHOOSE YOUR ACT',
    menuDone:  'ALL ACTS CLEARED',
    emblem, scenery,

    screens: {
      win:          C.amberL,
      lose:         C.red,
      chapterLabel: C.fog,
      name:         C.cream,
      sub:          C.amber,
      intro:        C.fogGr,
      quote:        C.stonD,
      help:         C.amber,
      score:        C.cream,
      cur:          C.amberL,
      cta:          C.cream,
      overlay:      'rgba(6,4,8,.86)',
    },
    labels: {
      chapter:  'ACT',
      score:    'EXPECTATIONS EARNED',
      win:      'THE PATH RISES',
      lose:     'GREAT EXPECTATIONS FALL',
      cont:     'TAP TO PRESS ON',
      finale:   'TAP TO FIND YOUR FATE',
      toMenu:   "BACK TO THE SOLICITOR'S DESK",
      play:     'TAP TO BEGIN',
    },

    finale: [
      'PIP STANDS AT LAST',
      'IN THE GREY MORNING LIGHT.',
      '',
      'FORTUNE WAS NOT WHAT',
      'HE IMAGINED. BUT THE',
      'TRUE GENTLEMAN WITHIN',
      'WAS HIS ALL ALONG.',
      '',
      '"I am the maker of my',
      'own fate, and it is',
      'enough." — after Dickens',
    ],

    width: 270, height: 480, parent: '#game',

    /* ─── Chapter-select: indenture papers on a barrister's desk ─── */
    menu: {
      colors: {
        title: C.cream,
        label: C.amber,
        cur:   C.amberL,
        done:  C.greenL,
        lock:  C.stonD,
      },

      title: function (api, total) {
        var g = api.gfx, c = api.ctx, W = api.W;
        // Header placard — mahogany name plate
        g.rect(14, 10, W - 28, 50, '#1a1008');
        c.strokeStyle = C.brown; c.lineWidth = 2;
        c.strokeRect(14, 10, W - 28, 50);
        // Corner brass studs
        var corners = [[20, 16], [W - 22, 16], [20, 54], [W - 22, 54]];
        for (var ci = 0; ci < corners.length; ci++) {
          g.circle(corners[ci][0], corners[ci][1], 3, C.brass);
          g.circle(corners[ci][0], corners[ci][1], 1, C.amberL);
        }
        api.txtCFit("THE SOLICITOR'S DESK", W / 2, 22, 8, C.cream, false, W - 44);
        api.txtCFit('EXPECTATIONS  ' + total, W / 2, 42, 8, C.amberL, false, W - 44);
      },

      layout: function () { return CARDS; },

      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done, best = info.best;
        var midCard = CARDS[2];
        var mc = { x: midCard.x + midCard.w / 2, y: midCard.y + midCard.h / 2 };

        // String connecting upper cards to center
        if (i === 0 || i === 1) {
          c.strokeStyle = C.redD; c.lineWidth = 1; c.globalAlpha = 0.25;
          c.setLineDash([3, 5]);
          c.beginPath();
          c.moveTo(x + w / 2, y + h);
          c.lineTo(mc.x, midCard.y);
          c.stroke();
          c.setLineDash([]); c.globalAlpha = 1;
        }
        if (i === 3 || i === 4) {
          c.strokeStyle = C.redD; c.lineWidth = 1; c.globalAlpha = 0.25;
          c.setLineDash([3, 5]);
          c.beginPath();
          c.moveTo(x + w / 2, y);
          c.lineTo(mc.x, midCard.y + midCard.h);
          c.stroke();
          c.setLineDash([]); c.globalAlpha = 1;
        }

        // Parchment body
        var pCol = sel ? '#eedda0' : (done ? '#c4b470' : '#d0be7a');
        g.rect(x + 3, y + 3, w - 6, h - 6, pCol);
        c.strokeStyle = sel ? C.amber : (done ? C.parchD : C.stone);
        c.lineWidth = sel ? 3 : 1.5;
        c.strokeRect(x + 3, y + 3, w - 6, h - 6);

        // Folded corner crease (top-right)
        c.fillStyle = sel ? '#c4a040' : '#a89030';
        c.beginPath();
        c.moveTo(x + w - 3, y + 3);
        c.lineTo(x + w - 14, y + 3);
        c.lineTo(x + w - 3, y + 14);
        c.closePath(); c.fill();

        // Pin / brass eyelet at top center
        g.circle(x + w / 2, y + 7, 5, sel ? C.brass : C.parchD);
        g.circle(x + w / 2, y + 7, 2, sel ? C.amberL : '#7a6830');

        // Top label "INDENTURE No. X"
        api.txtCFit('INDENTURE NO. ' + (i + 1), x + w / 2, y + 17, 5, '#4a3a18', false, w - 14);

        // Chapter short name
        api.txtCFit(CHAPTER_SHORT[i], x + w / 2, y + 30,
          sel ? 8 : 7,
          done ? '#2a5a18' : (sel ? '#1a1208' : '#3a2e10'),
          false, w - 14);

        // Icon
        drawChapterIcon(api, i, x + w / 2, y + 55);

        // Best score / done badge
        if (best && best > 0) {
          api.txtCFit('' + best, x + w / 2, y + h - 10, 6, C.amber, false, w - 14);
        }
        if (done) {
          api.txtCFit('✓', x + w - 16, y + h - 12, 9, C.greenL, false, 18);
        }
      },
    },

    /* ═══════════════════════════════════════════════════════════════════
     * CHAPTERS
     * ═══════════════════════════════════════════════════════════════════ */
    chapters: [

      /* ───────────────────────────────────────────────────────────────
       * ACT 1 — THE MARSHES
       * Free-move stealth: collect 6 provisions for Magwitch, avoid
       * 3 soldier lantern cones. 3 lives, ~26 seconds.
       * ─────────────────────────────────────────────────────────────── */
      {
        id:   'marshes',
        name: 'THE MARSHES',
        sub:  'A BOY AND A CONVICT IN THE COLD',
        icon: function (api, ix, iy) { drawChapterIcon(api, 0, ix, iy); },
        intro: [
          'PIP IS SEVEN YEARS OLD.',
          'ALONE IN THE COLD CHURCH-',
          'YARD, HE MEETS A DESPERATE',
          'ESCAPED CONVICT. MAGWITCH',
          'DEMANDS FOOD AND A FILE.',
          'PIP STEALS FROM THE FORGE',
          'AND CREEPS ACROSS THE MARSH.',
        ],
        quote: '"I was a boy whom nobody had pitied." — Charles Dickens, 1861',
        help:  'Drag or use arrows to move Pip. Collect 6 provisions (glowing dots) for Magwitch. Dodge the soldiers\' lantern beams! 3 lives.',
        winText:  'Pip delivers the provisions. Magwitch\'s iron grip softens for just a moment.',
        loseText: 'The soldiers find Pip on the marsh. He is dragged back to the forge.',

        init: function (api) {
          var W = api.W, H = api.H;
          this.px = W / 2;
          this.py = H * 0.82;
          this.lives  = 3;
          this.hitCD  = 0;
          this.survive = 0;

          // 6 provision items scattered across the marsh
          this.items = [
            { x: W*0.18, y: H*0.55, collected: false },
            { x: W*0.72, y: H*0.48, collected: false },
            { x: W*0.35, y: H*0.68, collected: false },
            { x: W*0.80, y: H*0.72, collected: false },
            { x: W*0.55, y: H*0.58, collected: false },
            { x: W*0.22, y: H*0.76, collected: false },
          ];
          this.collected = 0;

          // Magwitch position (target, top area)
          this.magX = W * 0.82;
          this.magY = H * 0.38;

          // 3 patrolling soldiers
          this.soldiers = [
            { x: W*0.30, y: H*0.50, dir: 1, angle: 0, speed: 48 },
            { x: W*0.65, y: H*0.62, dir: -1, angle: Math.PI*0.8, speed: 56 },
            { x: W*0.50, y: H*0.75, dir: 1, angle: Math.PI*0.3, speed: 52 },
          ];
          this.itemGlow = 0;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.survive += dt;
          this.itemGlow = (this.itemGlow + dt * 3) % (Math.PI * 2);

          // Move Pip
          var spd = 148;
          var mx = 0, my = 0;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W * 0.45 && Math.abs(api.pointer.x - this.px) > 14)) mx = -1;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W * 0.55 && Math.abs(api.pointer.x - this.px) > 14)) mx = 1;
          if (api.keyDown('up')    || (api.pointer.down && api.pointer.y < H * 0.45 && Math.abs(api.pointer.y - this.py) > 14)) my = -1;
          if (api.keyDown('down')  || (api.pointer.down && api.pointer.y > H * 0.55 && Math.abs(api.pointer.y - this.py) > 14)) my = 1;

          // Touch drag: move toward pointer
          if (api.pointer.down) {
            var dx2 = api.pointer.x - this.px;
            var dy2 = api.pointer.y - this.py;
            var dist = Math.sqrt(dx2*dx2 + dy2*dy2);
            if (dist > 12) {
              mx = dx2 / dist;
              my = dy2 / dist;
            }
          }

          this.px = clamp(this.px + mx * spd * dt, 14, W - 14);
          this.py = clamp(this.py + my * spd * dt, H * 0.36, H - 18);

          // Update soldiers (patrol left-right within bounds)
          for (var si = 0; si < this.soldiers.length; si++) {
            var sol = this.soldiers[si];
            sol.angle += dt * 0.9;
            sol.x += sol.dir * sol.speed * dt;
            if (sol.x < 20 || sol.x > W - 20) {
              sol.dir *= -1;
              sol.x = clamp(sol.x, 20, W - 20);
            }
          }

          // Collect items
          for (var ii = 0; ii < this.items.length; ii++) {
            var item = this.items[ii];
            if (!item.collected) {
              var ddx = this.px - item.x, ddy = this.py - item.y;
              if (ddx*ddx + ddy*ddy < 20*20) {
                item.collected = true;
                this.collected++;
                api.addScore(15);
                api.audio.sfx('coin');
                api.burst(item.x, item.y, C.amberL, 8);
              }
            }
          }

          // Check lantern hits
          this.hitCD = Math.max(0, this.hitCD - dt);
          if (this.hitCD <= 0) {
            for (var si2 = 0; si2 < this.soldiers.length; si2++) {
              var sol2 = this.soldiers[si2];
              var coneLen = 60, coneHalf = 0.38; // cone parameters
              // Cone direction: soldier faces the direction they're walking
              var coneDir = sol2.dir > 0 ? 0 : Math.PI;
              var ex = this.px - sol2.x, ey = this.py - sol2.y;
              var eDist = Math.sqrt(ex*ex + ey*ey);
              if (eDist < coneLen) {
                var eAngle = Math.atan2(ey, ex);
                var diff = eAngle - coneDir;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                if (Math.abs(diff) < coneHalf) {
                  this.lives--;
                  this.hitCD = 1.6;
                  api.shake(8, 0.4);
                  api.flash('#ffffff', 0.25);
                  api.audio.sfx('hurt');
                  if (this.lives <= 0) { api.lose(); return; }
                  break;
                }
              }
            }
          }

          // Win: all collected
          if (this.collected >= 6) {
            api.addScore(30);
            api.win();
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var t = api.t;

          // Night marsh background
          var sk = c.createLinearGradient(0, 0, 0, H);
          sk.addColorStop(0, '#070910');
          sk.addColorStop(1, '#15221a');
          c.fillStyle = sk; c.fillRect(0, 0, W, H);

          // Distant river strip
          g.rect(0, H*0.43, W, 14, C.river);
          // Moon
          c.globalAlpha = 0.45;
          c.fillStyle = '#f0e8c0';
          c.beginPath(); c.arc(W*0.78, H*0.12, 15, 0, Math.PI*2); c.fill();
          c.globalAlpha = 1;

          // Marsh ground
          g.rect(0, H*0.82, W, H*0.18, C.marsh);
          g.rect(0, H*0.68, W, H*0.14, C.marshL);

          // Magwitch (crouched silhouette)
          var mx2 = this.magX, my2 = this.magY;
          c.fillStyle = '#08060a';
          g.circle(mx2, my2 - 10, 9, '#08060a');
          g.rect(mx2 - 7, my2 - 3, 14, 16, '#08060a');
          // Glowing eyes (hint to player)
          g.circle(mx2 - 3, my2 - 12, 2, C.red);
          g.circle(mx2 + 3, my2 - 12, 2, C.red);
          // Collection indicator above Magwitch
          api.txtCFit(this.collected + '/6', mx2, my2 - 26, 7, C.amberL, false, 30);

          // Provision items
          for (var ii = 0; ii < this.items.length; ii++) {
            var item = this.items[ii];
            if (!item.collected) {
              var glow = 0.6 + 0.4 * Math.sin(this.itemGlow + ii * 1.1);
              c.globalAlpha = glow;
              g.circle(item.x, item.y, 7, C.amberL);
              c.globalAlpha = 0.4 * glow;
              g.circle(item.x, item.y, 13, C.amber);
              c.globalAlpha = 1;
              g.circle(item.x, item.y, 3, C.gasYel);
            }
          }

          // Soldiers + lantern cones
          for (var si = 0; si < this.soldiers.length; si++) {
            var sol = this.soldiers[si];
            var coneDir = sol.dir > 0 ? 0 : Math.PI;
            var coneLen = 60, coneHalf = 0.38;

            // Draw lantern glow cone
            c.globalAlpha = 0.14;
            c.fillStyle = C.gasYel;
            c.beginPath();
            c.moveTo(sol.x, sol.y - 5);
            c.arc(sol.x, sol.y - 5, coneLen, coneDir - coneHalf, coneDir + coneHalf);
            c.closePath(); c.fill();
            c.globalAlpha = 1;

            drawSoldier(g, c, sol.x, sol.y, sol.dir > 0);
            drawLantern(g, c, sol.x + (sol.dir > 0 ? 8 : -8), sol.y - 10);
          }

          // Pip
          if (this.hitCD > 0) {
            // Flash white when hit
            if (Math.floor(this.hitCD * 8) % 2 === 0) drawPip(g, c, this.px, this.py);
          } else {
            drawPip(g, c, this.px, this.py);
          }

          // HUD
          api.topBar('THE MARSHES', this.collected + '/6', this.lives);
          api.vignette();
          api.scanlines();
        },
      },

      /* ───────────────────────────────────────────────────────────────
       * ACT 2 — SATIS HOUSE
       * Fall-catcher: catch good wedding cake pieces (12 needed),
       * dodge rotten ones (3 rotten = lose). Pip moves left/right.
       * ─────────────────────────────────────────────────────────────── */
      {
        id:   'satis',
        name: 'SATIS HOUSE',
        sub:  'THE ROTTING WEDDING FEAST',
        icon: function (api, ix, iy) { drawChapterIcon(api, 1, ix, iy); },
        intro: [
          'MISS HAVISHAM STOPPED',
          'ALL THE CLOCKS AT NINE',
          'TWENTY ON HER WEDDING',
          'MORNING. THE FEAST HAS',
          'ROTTED FOR DECADES.',
          'PIP MUST CATCH WHAT',
          'REMAINS BEFORE IT FALLS.',
        ],
        quote: '"She seemed to have stopped... her own heart." — Dickens, 1861',
        help:  'Tap LEFT or RIGHT half to move. Catch GOLDEN cake pieces (need 12). Avoid the ROTTEN dark pieces — 3 caught = over!',
        winText:  'Pip catches enough. Miss Havisham watches from her throne of cobwebs, unmoved.',
        loseText: 'The rotten feast overwhelms Pip. He retreats from the rotting room.',

        init: function (api) {
          var W = api.W;
          this.px = W / 2;
          this.speed = 130;
          this.lives = 3;
          this.caught = 0;
          this.need = 12;
          this.pieces = [];
          this.spawnT = 0.9;
          this.elapsed = 0;
          this.hitCD = 0;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.elapsed += dt;
          this.hitCD = Math.max(0, this.hitCD - dt);

          // Move Pip
          var mv = 0;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W / 2)) mv = -1;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W / 2)) mv =  1;
          this.px = clamp(this.px + mv * 192 * dt, 22, W - 22);

          // Spawn pieces
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            // Roughly 60% good, 40% rotten
            var isGood = Math.random() < 0.6;
            this.pieces.push({
              x: 20 + Math.random() * (W - 40),
              y: -20,
              good: isGood,
              spd: this.speed + this.elapsed * 4 + Math.random() * 30,
            });
            this.spawnT = 0.70 - Math.min(0.35, this.elapsed * 0.018) + Math.random() * 0.25;
          }

          // Move pieces down
          for (var pi = 0; pi < this.pieces.length; pi++) {
            this.pieces[pi].y += this.pieces[pi].spd * dt;
          }

          // Catch check (catcher at bottom of screen)
          var catchY = api.H * 0.85, catchW = 40;
          for (var pi2 = this.pieces.length - 1; pi2 >= 0; pi2--) {
            var piece = this.pieces[pi2];
            if (piece.y >= catchY - 8 && piece.y <= catchY + 8) {
              if (Math.abs(piece.x - this.px) < catchW) {
                this.pieces.splice(pi2, 1);
                if (piece.good) {
                  this.caught++;
                  api.addScore(10);
                  api.audio.sfx('coin');
                  api.burst(piece.x, catchY, C.cake, 7);
                } else if (this.hitCD <= 0) {
                  this.lives--;
                  this.hitCD = 1.2;
                  api.shake(6, 0.35);
                  api.flash(C.rot, 0.3);
                  api.audio.sfx('hurt');
                  if (this.lives <= 0) { api.lose(); return; }
                }
                continue;
              }
            }
            // Remove pieces that fell off
            if (piece.y > api.H + 20) {
              this.pieces.splice(pi2, 1);
            }
          }

          if (this.caught >= this.need) {
            api.addScore(25);
            api.win();
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Interior of Satis House — dim cobwebbed room
          var bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#1a0e10');
          bg.addColorStop(1, '#0e080c');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // Long table silhouette at mid-height
          g.rect(0, H*0.46, W, 12, '#2a1a12');
          g.rect(8, H*0.46+12, 12, H*0.35, '#1e1208');
          g.rect(W-20, H*0.46+12, 12, H*0.35, '#1e1208');

          // Stopped clock on wall
          c.strokeStyle = '#3a2a1a'; c.lineWidth = 2;
          c.beginPath(); c.arc(W/2, H*0.16, 22, 0, Math.PI*2); c.stroke();
          c.strokeStyle = C.brownL; c.lineWidth = 2;
          // Hands stopped at 9:20
          c.beginPath(); c.moveTo(W/2, H*0.16); c.lineTo(W/2 - 12, H*0.16 - 8); c.stroke(); // hour 9
          c.beginPath(); c.moveTo(W/2, H*0.16); c.lineTo(W/2 + 6, H*0.16 - 18); c.stroke(); // min 4

          // Cobwebs in corners
          c.strokeStyle = 'rgba(180,170,150,0.18)'; c.lineWidth = 1;
          for (var cw = 0; cw < 6; cw++) {
            c.beginPath(); c.moveTo(0, 0); c.lineTo(cw*12, cw*8); c.stroke();
          }
          for (var cw2 = 0; cw2 < 6; cw2++) {
            c.beginPath(); c.moveTo(W, 0); c.lineTo(W-cw2*12, cw2*8); c.stroke();
          }

          // Miss Havisham silhouette (seated in chair)
          c.fillStyle = '#0a0608';
          // Chair
          g.rect(W-52, H*0.54, 32, 40, '#120a08');
          g.rect(W-56, H*0.42, 40, 12, '#120a08');
          // Figure
          g.rect(W-48, H*0.34, 22, 24, '#0a0608');
          g.circle(W-37, H*0.30, 10, '#0a0608');
          // Wedding veil (rough drape)
          c.fillStyle = 'rgba(200,190,170,0.08)';
          c.fillRect(W-52, H*0.26, 36, 40);

          // Falling pieces
          for (var pi = 0; pi < this.pieces.length; pi++) {
            var piece = this.pieces[pi];
            var px2 = piece.x, py2 = piece.y;
            if (piece.good) {
              // Golden cake slice
              c.fillStyle = C.cake;
              c.beginPath();
              c.moveTo(px2, py2 - 9);
              c.lineTo(px2 + 8, py2 + 7);
              c.lineTo(px2 - 8, py2 + 7);
              c.closePath(); c.fill();
              c.fillStyle = C.cakeD;
              c.fillRect(px2 - 8, py2 + 5, 16, 3);
            } else {
              // Rotten piece (dark green)
              c.fillStyle = C.rot;
              c.fillRect(px2 - 7, py2 - 7, 14, 14);
              c.fillStyle = C.rotL;
              c.fillRect(px2 - 4, py2 - 4, 8, 8);
            }
          }

          // Catcher (Pip's tray)
          var catchY = H * 0.85;
          g.rect(this.px - 40, catchY - 4, 80, 8, C.brownL);
          // Pip above the tray
          drawPip(g, c, this.px, catchY - 18);

          // HUD
          api.topBar('SATIS HOUSE', this.caught + '/' + this.need, this.lives);
          api.vignette();
          api.scanlines();
        },
      },

      /* ───────────────────────────────────────────────────────────────
       * ACT 3 — JAGGERS' LAW
       * Pendulum: tap the swinging gavel into the zone 8 times.
       * 4 misses = lose. Zone narrows, speed increases each hit.
       * ─────────────────────────────────────────────────────────────── */
      {
        id:   'jagger',
        name: "JAGGERS' LAW",
        sub:  "YOUR GREAT EXPECTATIONS REVEALED",
        icon: function (api, ix, iy) { drawChapterIcon(api, 2, ix, iy); },
        intro: [
          "MR. JAGGERS IS LONDON'S",
          "MOST FEARED LAWYER.",
          "HE SUMMONS PIP TO HIS",
          "OFFICE IN LITTLE BRITAIN",
          "TO DELIVER STARTLING",
          "NEWS: AN ANONYMOUS",
          "BENEFACTOR HAS PROVIDED.",
        ],
        quote: '"You are to be brought up as a gentleman." — Dickens, 1861',
        help:  'Tap when the swinging GAVEL enters the GOLDEN ZONE. 8 stamps to win! The zone shrinks with each success. 4 misses and you lose.',
        winText:  'Pip is declared a gentleman of great expectations. Mr. Jaggers washes his hands.',
        loseText: 'The gavel falls outside the zone. Mr. Jaggers dismisses the case.',

        init: function (api) {
          this.hits    = 0;
          this.misses  = 0;
          this.need    = 8;
          this.maxMiss = 4;
          this.angle   = -Math.PI * 0.65; // starts left
          this.angVel  = 1.4;  // radians/sec
          this.zoneW   = 0.40; // half-width of zone in radians
          this.minAngle = -Math.PI * 0.72;
          this.maxAngle =  Math.PI * 0.72;
          this.tapped   = false;
          this.flashT   = 0;
          this.flashOK  = false;
          this.stampT   = 0; // cooldown after a stamp
          this.pivotY   = 0; // will be set in draw
        },

        update: function (api, dt) {
          this.flashT = Math.max(0, this.flashT - dt);
          this.stampT = Math.max(0, this.stampT - dt);

          // Swing pendulum
          this.angle += this.angVel * dt;
          if (this.angle >= this.maxAngle) {
            this.angle = this.maxAngle;
            this.angVel = -Math.abs(this.angVel);
          } else if (this.angle <= this.minAngle) {
            this.angle = this.minAngle;
            this.angVel = Math.abs(this.angVel);
          }

          // Listen for tap/press
          var pressed = api.pointer.justDown || api.keyPressed('a') || api.keyPressed('start');
          if (pressed && this.stampT <= 0) {
            this.tapped = true;
            this.stampT = 0.22; // brief refractory
            // Check if gavel is in zone
            var zoneCenter = Math.PI * 0.5; // straight down
            var diff = Math.abs(this.angle - zoneCenter);
            if (diff < this.zoneW) {
              // Hit!
              this.hits++;
              this.flashT = 0.5; this.flashOK = true;
              api.addScore(15);
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H * 0.70, C.amber, 10);
              // Shrink zone and increase speed
              this.zoneW = Math.max(0.10, this.zoneW - 0.03);
              this.angVel = (this.angVel > 0 ? 1 : -1) * (1.4 + this.hits * 0.22);
              if (this.hits >= this.need) {
                api.addScore(30);
                api.win();
              }
            } else {
              // Miss
              this.misses++;
              this.flashT = 0.4; this.flashOK = false;
              api.shake(5, 0.28);
              api.audio.sfx('hurt');
              if (this.misses >= this.maxMiss) { api.lose(); }
            }
          } else {
            this.tapped = false;
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Victorian law office interior
          var bg2 = c.createLinearGradient(0, 0, 0, H);
          bg2.addColorStop(0, '#1a0e08');
          bg2.addColorStop(1, '#100806');
          c.fillStyle = bg2; c.fillRect(0, 0, W, H);

          // Bookshelf back wall
          c.fillStyle = '#200e06';
          c.fillRect(0, 0, W, H * 0.42);
          // Shelf lines
          c.fillStyle = '#2e1808';
          c.fillRect(0, Math.floor(H*0.14), W, 3);
          c.fillRect(0, Math.floor(H*0.28), W, 3);
          // Books
          var bk = [C.blue, C.dark, '#2a4a18', '#3a1a30'];
          for (var bi2 = 0; bi2 < 18; bi2++) {
            var bkx = 4 + bi2 * 14;
            var bky = H * 0.02 + (bi2 % 2) * (H * 0.14);
            var bkh = 20 + (bi2 * 7) % 16;
            c.fillStyle = bk[bi2 % 4];
            c.fillRect(bkx, bky, 12, bkh);
          }

          // Desk
          g.rect(0, H*0.7, W, H*0.30, '#2e1808');
          c.fillStyle = '#3e2010';
          c.fillRect(0, H*0.7, W, 5);

          // Mr. Jaggers silhouette (stands behind desk)
          c.fillStyle = '#0c080e';
          g.rect(W*0.55, H*0.38, 28, 36, '#0c080e');
          g.circle(W*0.55+14, H*0.32, 13, '#0c080e');
          // Wig outline
          c.strokeStyle = '#18140c'; c.lineWidth = 3;
          c.beginPath(); c.arc(W*0.55+14, H*0.32, 15, 0, Math.PI); c.stroke();

          // Gavel pivot point
          var pvX = W / 2;
          var pvY = H * 0.20;
          var armLen = 120;

          // Zone arc (golden zone on the floor)
          var floorY = pvY + armLen + 15;
          var zoneLeft  = pvX + (armLen + 12) * Math.sin(Math.PI * 0.5 - this.zoneW);
          var zoneRight = pvX + (armLen + 12) * Math.sin(Math.PI * 0.5 + this.zoneW);

          // Draw zone indicator on desk
          c.globalAlpha = 0.4;
          c.fillStyle = C.amber;
          c.fillRect(zoneLeft - 4, H*0.70, (zoneRight - zoneLeft) + 8, 5);
          c.globalAlpha = 1;
          c.strokeStyle = C.amberL; c.lineWidth = 2;
          c.strokeRect(zoneLeft - 4, H*0.70 - 2, (zoneRight - zoneLeft) + 8, 9);

          // Pivot bracket
          g.rect(pvX - 5, pvY - 8, 10, 10, C.brownL);

          // Arm of gavel swing
          var gx = pvX + Math.sin(this.angle) * armLen;
          var gy = pvY + Math.cos(this.angle) * armLen;
          c.strokeStyle = C.brown; c.lineWidth = 4;
          c.beginPath(); c.moveTo(pvX, pvY); c.lineTo(gx, gy); c.stroke();

          // Gavel head
          var headSize = 14;
          var perpAngle = this.angle + Math.PI / 2;
          var hx1 = gx + Math.sin(perpAngle) * headSize;
          var hy1 = gy + Math.cos(perpAngle) * headSize;
          var hx2 = gx - Math.sin(perpAngle) * headSize;
          var hy2 = gy - Math.cos(perpAngle) * headSize;
          c.strokeStyle = C.brownL; c.lineWidth = 8;
          c.beginPath(); c.moveTo(hx1, hy1); c.lineTo(hx2, hy2); c.stroke();

          // Flash feedback
          if (this.flashT > 0) {
            var alpha = this.flashT * 1.4;
            c.globalAlpha = Math.min(0.5, alpha);
            c.fillStyle = this.flashOK ? C.amberL : C.red;
            c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          // HUD counters
          api.topBar("JAGGERS' LAW",
            '★' + this.hits + '/' + this.need,
            this.maxMiss - this.misses);
          api.txtCFit('MISSES LEFT: ' + (this.maxMiss - this.misses), W/2, H*0.92, 7, C.red, false, W-20);
          api.vignette();
          api.scanlines();
        },
      },

      /* ───────────────────────────────────────────────────────────────
       * ACT 4 — DOWN THE THAMES
       * Dodge runner: row the boat past obstacles for 26 seconds.
       * Obstacles: police galley, logs, fog walls. 3 lives.
       * ─────────────────────────────────────────────────────────────── */
      {
        id:   'thames',
        name: 'DOWN THE THAMES',
        sub:  "ROW FOR MAGWITCH'S FREEDOM",
        icon: function (api, ix, iy) { drawChapterIcon(api, 3, ix, iy); },
        intro: [
          "MAGWITCH'S IDENTITY IS",
          "REVEALED AT LAST.",
          "HIS FORTUNE, EARNED IN",
          "AUSTRALIA, MADE PIP",
          "A GENTLEMAN.",
          "NOW THEY MUST FLEE",
          "DOWN THE THAMES.",
        ],
        quote: '"We spend our lives trying to find out the secret, and the secret is in this: there is no secret." — Dickens',
        help:  'Tap LEFT or RIGHT to steer the boat. Dodge police galleys, logs, and fog banks! Survive 26 seconds to reach the ship.',
        winText:  'The rowboat clears the last police galley. The waiting ship looms ahead.',
        loseText: 'The Thames swallows them. The police close in from all sides.',

        init: function (api) {
          var W = api.W;
          this.bx      = W / 2;
          this.lives   = 3;
          this.elapsed = 0;
          this.target  = 26;
          this.obs     = [];
          this.spawnT  = 1.0;
          this.speed   = 120;
          this.hitCD   = 0;
          this.scroll  = 0; // river scroll
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.elapsed += dt;
          this.hitCD = Math.max(0, this.hitCD - dt);
          this.scroll = (this.scroll + 180 * dt) % 120;

          // Steer boat
          var mv2 = 0;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W / 2)) mv2 = -1;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W / 2)) mv2 =  1;
          this.bx = clamp(this.bx + mv2 * 168 * dt, 30, W - 30);

          // Spawn obstacles
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var types = ['galley', 'log', 'fog'];
            var otype = types[Math.floor(Math.random() * 3)];
            var ow = otype === 'galley' ? 60 : (otype === 'fog' ? 80 : 22);
            var ox = 20 + Math.random() * (W - ow - 20);
            this.obs.push({ type: otype, x: ox, y: -50, w: ow, h: otype === 'galley' ? 28 : (otype === 'fog' ? 36 : 14) });
            this.spawnT = 0.80 - Math.min(0.40, this.elapsed * 0.012) + Math.random() * 0.35;
          }

          // Move obstacles
          var oSpd = this.speed + this.elapsed * 4;
          for (var oi = 0; oi < this.obs.length; oi++) {
            this.obs[oi].y += oSpd * dt;
          }
          this.obs = this.obs.filter(function (o) { return o.y < api.H + 60; });

          // Collision with boat
          var boatY = api.H * 0.80, boatW = 28, boatH = 16;
          if (this.hitCD <= 0) {
            for (var oi2 = 0; oi2 < this.obs.length; oi2++) {
              var ob = this.obs[oi2];
              if (ob.type === 'fog') continue; // fog is visual only
              var bLeft = this.bx - boatW/2, bRight = this.bx + boatW/2;
              var bTop = boatY - boatH/2, bBot = boatY + boatH/2;
              if (ob.x < bRight && ob.x + ob.w > bLeft && ob.y < bBot && ob.y + ob.h > bTop) {
                this.lives--;
                this.hitCD = 1.4;
                api.shake(8, 0.4);
                api.flash('#ffffff', 0.3);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          }

          if (this.elapsed >= this.target) {
            api.addScore(35);
            api.win();
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Dark Thames night
          c.fillStyle = '#080c12'; c.fillRect(0, 0, W, H);

          // Scrolling river surface
          c.fillStyle = C.water;
          c.fillRect(0, 0, W, H);
          // River ripple lines
          c.strokeStyle = C.riverL; c.lineWidth = 1; c.globalAlpha = 0.35;
          for (var ri2 = 0; ri2 < 12; ri2++) {
            var ry = (ri2 * 42 + this.scroll) % (H + 40) - 20;
            c.beginPath(); c.moveTo(0, ry); c.lineTo(W, ry + 4); c.stroke();
          }
          c.globalAlpha = 1;

          // Bank silhouettes (dark buildings on either side)
          c.fillStyle = '#060808';
          c.fillRect(0, 0, 20, H);
          c.fillRect(W - 20, 0, 20, H);
          // Building silhouettes on banks
          var bankBldgs = [
            [0, H*0.20, 20, H*0.80],
            [W-20, H*0.15, 20, H*0.85],
          ];
          // Chimneys on left bank
          g.rect(0, H*0.08, 8, 22, '#040608');
          g.rect(12, H*0.06, 8, 28, '#040608');

          // Obstacles
          for (var oi3 = 0; oi3 < this.obs.length; oi3++) {
            var ob2 = this.obs[oi3];
            if (ob2.type === 'galley') {
              // Police galley boat
              c.fillStyle = C.police;
              c.beginPath();
              c.moveTo(ob2.x, ob2.y + ob2.h);
              c.lineTo(ob2.x + ob2.w, ob2.y + ob2.h);
              c.lineTo(ob2.x + ob2.w - 6, ob2.y);
              c.lineTo(ob2.x + 6, ob2.y);
              c.closePath(); c.fill();
              // Police light
              c.globalAlpha = 0.5;
              g.circle(ob2.x + ob2.w/2, ob2.y - 5, 7, C.gasYel);
              c.globalAlpha = 1;
              api.txtCFit('POLICE', ob2.x + ob2.w/2, ob2.y + 9, 5, C.cream, false, ob2.w);
            } else if (ob2.type === 'log') {
              g.rect(ob2.x, ob2.y, ob2.w, ob2.h, C.brown);
              g.rect(ob2.x + 2, ob2.y + 4, ob2.w - 4, 4, C.brownL);
            } else {
              // Fog bank
              c.globalAlpha = 0.28;
              c.fillStyle = C.fogGr;
              c.beginPath(); c.ellipse(ob2.x + ob2.w/2, ob2.y + ob2.h/2, ob2.w/2, ob2.h/2, 0, 0, Math.PI*2); c.fill();
              c.globalAlpha = 1;
            }
          }

          // Player's rowboat
          var boatY = H * 0.80;
          c.fillStyle = C.boatL;
          c.beginPath();
          c.moveTo(this.bx - 28, boatY + 8);
          c.lineTo(this.bx + 28, boatY + 8);
          c.lineTo(this.bx + 22, boatY - 8);
          c.lineTo(this.bx - 22, boatY - 8);
          c.closePath(); c.fill();
          c.strokeStyle = C.boat; c.lineWidth = 2;
          c.stroke();
          // Oars
          c.strokeStyle = C.brownL; c.lineWidth = 3;
          c.beginPath(); c.moveTo(this.bx - 22, boatY); c.lineTo(this.bx - 48, boatY + 12); c.stroke();
          c.beginPath(); c.moveTo(this.bx + 22, boatY); c.lineTo(this.bx + 48, boatY + 12); c.stroke();
          // Pip + Magwitch silhouettes in boat
          c.fillStyle = '#08060a';
          g.circle(this.bx - 6, boatY - 4, 5, '#08060a');
          g.circle(this.bx + 8, boatY - 5, 6, '#08060a');

          // Timer bar
          var prog = Math.min(1, this.elapsed / this.target);
          g.rect(0, H - 6, W * prog, 6, C.amber);

          api.topBar('THE THAMES',
            Math.ceil(Math.max(0, this.target - this.elapsed)) + 's',
            this.lives);
          api.vignette();
          api.scanlines();
        },
      },

      /* ───────────────────────────────────────────────────────────────
       * ACT 5 — THE CONFRONTATION
       * Dodge + tap boss: Compeyson attacks in 3 patterns.
       * Move away from telegraphed side, then tap when stunned.
       * 5 hits to win. 3 lives.
       * ─────────────────────────────────────────────────────────────── */
      {
        id:   'wharf',
        name: 'THE CONFRONTATION',
        sub:  "COMPEYSON ON THE DARK RIVER",
        icon: function (api, ix, iy) { drawChapterIcon(api, 4, ix, iy); },
        intro: [
          "COMPEYSON — MAGWITCH'S",
          "OLD ENEMY — AMBUSHES",
          "THEM ON THE RIVER.",
          "THE TWO CONVICTS GRAPPLE",
          "IN THE ICY THAMES.",
          "PIP MUST HELP MAGWITCH",
          "DEFEAT HIS FOE.",
        ],
        quote: '"In the little world in which children exist... there is nothing so finely perceived as injustice." — Dickens',
        help:  'Move to the SAFE SIDE when Compeyson\'s attack glows RED. When he staggers (GOLDEN FLASH), tap to strike! 5 hits to win. 3 lives.',
        winText:  'Compeyson is overcome. The Thames takes him. Magwitch is free — but badly wounded.',
        loseText: 'Compeyson overwhelms Pip. The river runs cold and dark.',

        init: function (api) {
          var W = api.W, H = api.H;
          this.px    = W / 2;
          this.lives = 3;
          this.hits  = 0;
          this.need  = 5;
          this.hitCD = 0;
          this.tapCD = 0;
          this.phase = 'idle';   // idle | telegraph | attack | stun
          this.phaseT = 0;
          this.attackSide = 0;   // -1=left, 0=center, 1=right
          this.stunT = 0;
          this.idleT = 1.0;
          this.compX = W / 2;
          this.shakeIntensity = 0;
          this.attackFlash = 0;
          this.stunFlash = 0;
          this.victimFlash = 0;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.hitCD = Math.max(0, this.hitCD - dt);
          this.tapCD = Math.max(0, this.tapCD - dt);
          this.attackFlash = Math.max(0, this.attackFlash - dt);
          this.stunFlash = Math.max(0, this.stunFlash - dt);
          this.victimFlash = Math.max(0, this.victimFlash - dt);
          this.phaseT -= dt;

          // Move Pip left/right
          var mv3 = 0;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W * 0.45)) mv3 = -1;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W * 0.55)) mv3 =  1;
          this.px = clamp(this.px + mv3 * 200 * dt, 24, W - 24);

          // State machine
          if (this.phase === 'idle') {
            if (this.phaseT <= 0) {
              // Choose attack side
              var r = Math.random();
              if (r < 0.35) this.attackSide = -1;
              else if (r < 0.7) this.attackSide = 1;
              else this.attackSide = 0; // center sweep
              this.phase = 'telegraph';
              this.phaseT = 1.2 - Math.min(0.5, this.hits * 0.08);
              this.attackFlash = this.phaseT;
            }
          } else if (this.phase === 'telegraph') {
            if (this.phaseT <= 0) {
              this.phase = 'attack';
              this.phaseT = 0.5;
            }
          } else if (this.phase === 'attack') {
            // Deal damage if Pip is on wrong side
            if (this.hitCD <= 0) {
              var danger = false;
              if (this.attackSide === -1 && this.px < W * 0.5)  danger = true;
              if (this.attackSide ===  1 && this.px > W * 0.5)  danger = true;
              if (this.attackSide ===  0) danger = true; // center sweep always dangerous unless at edges
              if (this.attackSide === 0 && (this.px < W * 0.18 || this.px > W * 0.82)) danger = false;
              if (danger) {
                this.lives--;
                this.hitCD = 1.2;
                this.victimFlash = 0.5;
                api.shake(8, 0.35);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
            if (this.phaseT <= 0) {
              this.phase = 'stun';
              this.phaseT = 1.0;
              this.stunFlash = 1.0;
              api.audio.sfx('blip');
            }
          } else if (this.phase === 'stun') {
            // Player can tap to hit
            var tapped2 = api.pointer.justDown || api.keyPressed('a') || api.keyPressed('start');
            if (tapped2 && this.tapCD <= 0) {
              this.hits++;
              this.tapCD = 0.18;
              api.addScore(20);
              api.audio.sfx('shoot');
              api.burst(this.compX, H * 0.35, C.amber, 10);
              api.shake(5, 0.28);
              if (this.hits >= this.need) {
                api.addScore(40);
                api.win();
                return;
              }
            }
            if (this.phaseT <= 0) {
              this.phase = 'idle';
              this.phaseT = 0.6;
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Night Thames riverbank
          var bg3 = c.createLinearGradient(0, 0, 0, H);
          bg3.addColorStop(0, '#080c12');
          bg3.addColorStop(0.5, '#0e1a18');
          bg3.addColorStop(1, '#1a2820');
          c.fillStyle = bg3; c.fillRect(0, 0, W, H);

          // River at bottom
          g.rect(0, H*0.76, W, H*0.24, C.river);
          // Ripple
          c.strokeStyle = C.riverL; c.lineWidth = 1; c.globalAlpha = 0.3;
          for (var rp = 0; rp < 5; rp++) {
            var rpY = H*0.78 + rp*16 + api.t % 16;
            c.beginPath(); c.moveTo(0, rpY); c.lineTo(W, rpY + 3); c.stroke();
          }
          c.globalAlpha = 1;

          // Wharf planks at bottom
          c.fillStyle = '#2a1808';
          c.fillRect(0, H*0.76, W, 10);
          // Plank lines
          c.strokeStyle = '#1a0e04'; c.lineWidth = 1;
          for (var pl = 0; pl < 9; pl++) {
            c.beginPath(); c.moveTo(pl * 30 + 8, H*0.76); c.lineTo(pl * 30, H*0.82); c.stroke();
          }

          // Background warehouse silhouettes
          c.fillStyle = '#060808';
          c.fillRect(0, H*0.22, 40, H*0.54);
          c.fillRect(W-44, H*0.18, 44, H*0.58);

          // Compeyson — large menacing figure at top
          var ex = this.compX;
          var ey = H * 0.30;
          c.fillStyle = '#08060c';
          g.rect(ex - 14, ey - 2, 28, 36, '#08060c');
          g.circle(ex, ey - 10, 14, '#08060c');
          // Wild hair
          c.strokeStyle = '#100c0e'; c.lineWidth = 3;
          for (var h2 = 0; h2 < 5; h2++) {
            c.beginPath();
            c.moveTo(ex - 10 + h2 * 5, ey - 22);
            c.lineTo(ex - 14 + h2 * 6, ey - 36);
            c.stroke();
          }
          // Attack glow
          if (this.phase === 'telegraph' || (this.phase === 'attack' && this.attackFlash > 0)) {
            var aCol = this.attackSide === 0 ? C.red : C.red;
            var aAlpha = this.phase === 'attack' ? 0.7 : (0.3 + 0.4 * Math.sin(api.t * 6));
            c.globalAlpha = aAlpha;
            if (this.attackSide === -1) {
              c.fillStyle = aCol;
              c.fillRect(0, H * 0.20, W / 2, H * 0.56);
            } else if (this.attackSide === 1) {
              c.fillStyle = aCol;
              c.fillRect(W / 2, H * 0.20, W / 2, H * 0.56);
            } else {
              // Center sweep
              c.fillStyle = aCol;
              c.fillRect(W * 0.18, H * 0.20, W * 0.64, H * 0.56);
            }
            c.globalAlpha = 1;
          }
          // Stun glow (golden)
          if (this.phase === 'stun') {
            c.globalAlpha = 0.4 + 0.3 * Math.sin(api.t * 8);
            c.fillStyle = C.amberL;
            c.beginPath(); c.arc(ex, ey, 40, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            // "STRIKE!" prompt
            api.txtCFit('STRIKE!', W / 2, H * 0.56, 13, C.amberL, true, W - 20);
          }
          // Attack side arrow indicator
          if (this.phase === 'telegraph') {
            var safeX = this.attackSide === -1 ? W * 0.78 : (this.attackSide === 1 ? W * 0.22 : W * 0.08);
            var safeStr = this.attackSide === -1 ? '→ MOVE RIGHT' : (this.attackSide === 1 ? '← MOVE LEFT' : '→ EDGE ←');
            api.txtCFit(safeStr, W / 2, H * 0.56, 9, C.cream, false, W - 20);
          }

          // Victim flash when Pip is hit
          if (this.victimFlash > 0) {
            c.globalAlpha = this.victimFlash * 0.6;
            c.fillStyle = C.red;
            c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          // Pip at bottom
          if (this.hitCD > 0 && Math.floor(this.hitCD * 8) % 2 === 0) {
            // Blink when invincible
          } else {
            drawPip(g, c, this.px, H * 0.70);
          }

          // Hit counter (health dots)
          for (var hi = 0; hi < this.need; hi++) {
            var hcol = hi < this.hits ? C.amber : C.dark;
            g.circle(W / 2 - (this.need * 10) / 2 + hi * 10 + 5, H * 0.88, 4, hcol);
            c.strokeStyle = C.stone; c.lineWidth = 1;
            c.beginPath(); c.arc(W / 2 - (this.need * 10) / 2 + hi * 10 + 5, H * 0.88, 4, 0, Math.PI * 2); c.stroke();
          }

          api.topBar('THE WHARF', '★ ' + this.hits + '/' + this.need, this.lives);
          api.vignette();
          api.scanlines();
        },
      },

    ], /* end chapters */
  }); /* end RetroSaga.create */

}()); /* end IIFE */
