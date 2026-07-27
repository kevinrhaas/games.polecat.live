/* ============================================================================
 * GREAT EXPECTATIONS — RISE FROM THE FORGE
 * Five acts from Dickens' 1861 novel:
 *   1. THE MARSHES     — branching trek: QUIET (spend provisions) vs BOLD
 *      (free, raises alarm) across 4 checkpoints to reach Magwitch
 *   2. SATIS HOUSE     — class-ladder life-choices: Gentleman vs Blacksmith
 *      picks build STATUS/LOYALTY stats that pick one of three endings
 *   3. JAGGERS' LAW    — pendulum: tap the gavel into the zone 8 times
 *   4. DOWN THE THAMES — runner/dodge: row to the waiting ship (26s)
 *   5. THE CONFRONTATION — reactive grip-read: brace the telegraphed
 *      side (LEFT/CENTER/RIGHT) before the ring closes, 5 grapples to win
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
       * Branching trek: 4 checkpoints between the forge and Magwitch's
       * hiding place, each a QUIET (spend provisions, stay hidden) vs
       * BOLD (free, raises alarm) choice. Alarm capped at 65 — cross it
       * and the patrol closes in.
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
          'PIP MUST CROSS FOUR MILES',
          'OF MARSH BEFORE DAYBREAK,',
          'PAST SOLDIERS HUNTING HIM.',
        ],
        quote: '"I was a boy whom nobody had pitied." — Charles Dickens, 1861',
        help:  'TAP a route at each checkpoint. QUIET spends provisions to stay hidden; BOLD is free but raises the soldiers\' alarm. Let alarm max out and they catch you.',
        winText:  '',
        loseText: 'Lantern light sweeps the reeds. Pip is caught crossing open ground, dragged back before he ever reaches Magwitch.',

        init: function (api) {
          this.provisions = 30;
          this.alarm = 0;
          this.maxAlarm = 65;
          this.leg = 0;
          this.checkpoints = [
            { name: 'THE CHURCHYARD GATE', text: 'A DOG BARKS BEHIND THE RECTORY.',
              quiet: { label: 'TOSS IT A SCRAP', sub: '-14 provisions · silent', cost: 14 },
              bold:  { label: 'SLIP PAST IN THE DARK', sub: 'free · +20 alarm', gain: 20 } },
            { name: 'THE OLD BATTERY', text: 'SOLDIERS DRILL BY THE GUN EMPLACEMENT.',
              quiet: { label: 'CRAWL THE LONG WAY ROUND', sub: '-14 provisions · silent', cost: 14 },
              bold:  { label: 'DASH BEHIND THE CANNON', sub: 'free · +20 alarm', gain: 20 } },
            { name: 'THE SLUICE GATE', text: 'THE SLUICE CREAKS LOUD IN THE WIND.',
              quiet: { label: 'EASE IT OPEN INCH BY INCH', sub: '-14 provisions · silent', cost: 14 },
              bold:  { label: 'HAUL IT WIDE AND RUN THROUGH', sub: 'free · +20 alarm', gain: 20 } },
            { name: 'THE GIBBET MARSH', text: "THE HANGED PIRATE'S CHAINS CREAK OVERHEAD.",
              quiet: { label: 'KEEP LOW IN THE REEDS', sub: '-14 provisions · silent', cost: 14 },
              bold:  { label: 'SPRINT THE OPEN GROUND', sub: 'free · +20 alarm', gain: 20 } },
          ];
          this.active = this.checkpoints[0];
          this.feedback = null; this.feedbackT = 0;
        },

        choiceRects: function (api) {
          var W = api.W, H = api.H;
          return [
            { x: 20, y: H - 130, w: W - 40, h: 44 },
            { x: 20, y: H - 78, w: W - 40, h: 44 },
          ];
        },

        update: function (api, dt) {
          this.feedbackT = Math.max(0, this.feedbackT - dt);
          if (this.feedbackT > 0 || !this.active) return;
          if (!api.pointer.justDown) return;

          var rects = this.choiceRects(api);
          var canAffordQuiet = this.provisions >= this.active.quiet.cost;
          var opts = [this.active.quiet, this.active.bold];
          for (var i = 0; i < 2; i++) {
            if (i === 0 && !canAffordQuiet) continue; // quiet route locked without provisions
            var r = rects[i];
            if (api.pointer.x >= r.x && api.pointer.x <= r.x + r.w &&
                api.pointer.y >= r.y && api.pointer.y <= r.y + r.h) {
              var pick = opts[i];
              if (i === 0) {
                this.provisions -= pick.cost;
                api.audio.sfx('select');
                api.burst(api.W / 2, api.H * 0.42, C.marshL, 8);
              } else {
                this.alarm += pick.gain;
                api.addScore(pick.gain);
                api.audio.sfx('coin');
                api.shake(4, 0.2);
                api.burst(api.W / 2, api.H * 0.42, C.red, 8);
              }
              this.feedback = pick.label;
              this.feedbackT = 0.9;

              if (this.alarm >= this.maxAlarm) {
                api.lose();
                return;
              }
              this.leg++;
              if (this.leg >= this.checkpoints.length) {
                this.winText = this.provisions >= 10
                  ? 'Pip reaches Magwitch with a full sack of stolen food and the file. The convict\'s iron grip softens for just a moment.'
                  : 'Pip reaches Magwitch, provisions nearly spent. The convict takes what little remains and the file, and is grateful all the same.';
                api.addScore(35);
                this.active = null;
                api.win();
                return;
              }
              this.active = this.checkpoints[this.leg];
              break;
            }
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

          // Moon
          c.globalAlpha = 0.45;
          c.fillStyle = '#f0e8c0';
          c.beginPath(); c.arc(W*0.80, H*0.09, 13, 0, Math.PI*2); c.fill();
          c.globalAlpha = 1;

          // Route map: waypoint dots for the 4 checkpoints
          var mapY = H * 0.14, mapL = 30, mapR = W - 30;
          for (var wi = 0; wi < this.checkpoints.length; wi++) {
            var wx = mapL + wi * ((mapR - mapL) / (this.checkpoints.length - 1));
            var passed = wi < this.leg, isCur = wi === this.leg;
            if (wi > 0) {
              var pwx = mapL + (wi - 1) * ((mapR - mapL) / (this.checkpoints.length - 1));
              c.strokeStyle = (passed || isCur) ? C.amber : C.stonD;
              c.lineWidth = 2; c.globalAlpha = 0.5;
              c.beginPath(); c.moveTo(pwx, mapY); c.lineTo(wx, mapY); c.stroke();
              c.globalAlpha = 1;
            }
            g.circle(wx, mapY, isCur ? 6 : 4, passed ? C.greenL : (isCur ? C.amberL : C.stonD));
          }

          // Marsh ground
          g.rect(0, H*0.78, W, H*0.22, C.marsh);
          g.rect(0, H*0.66, W, H*0.14, C.marshL);
          c.fillStyle = C.marshL;
          for (var gt = 0; gt < 10; gt++) {
            c.fillRect((gt * 137 + 20) % W, H*0.66 + (gt * 13) % 20, 6 + gt % 5, 3 + gt % 3);
          }

          // Mist wisps
          for (var mw = 0; mw < 4; mw++) {
            var mwx = ((t * 6 + mw * 71) % (W + 100)) - 50;
            var mwy = H * 0.55 + mw * 22 + Math.sin(t * 0.3 + mw * 1.4) * 14;
            c.globalAlpha = 0.05;
            c.fillStyle = C.fogGr;
            c.beginPath(); c.ellipse(mwx, mwy, 60, 18, 0, 0, Math.PI * 2); c.fill();
          }
          c.globalAlpha = 1;

          // Lurking soldier + lantern, watching from the reeds — glows brighter as alarm rises
          var solX = W * 0.78, solY = H * 0.60;
          var alarmFrac = clamp(this.alarm / this.maxAlarm, 0, 1);
          c.globalAlpha = 0.35 + 0.5 * alarmFrac + 0.1 * Math.sin(t * 3);
          drawSoldier(g, c, solX, solY, false);
          drawLantern(g, c, solX - 8, solY - 10);
          c.globalAlpha = 1;

          // Pip, mid-trek
          drawPip(g, c, W * 0.28, H * 0.60);

          // Checkpoint card
          var cardY = H * 0.42;
          g.rect(16, cardY, W - 32, 46, '#141c10');
          c.strokeStyle = C.marshL; c.lineWidth = 1; c.strokeRect(16, cardY, W - 32, 46);
          if (this.active) {
            api.txtCFit(this.active.name, W / 2, cardY + 8, 8, C.cream, true, W - 44);
            api.txtCFit(this.feedbackT > 0 ? ('"' + this.feedback + '"') : this.active.text,
              W / 2, cardY + 26, 7, this.feedbackT > 0 ? C.amberL : C.fogGr, false, W - 44);
          }

          // Choice buttons
          if (this.feedbackT <= 0 && this.active) {
            var rects = this.choiceRects(api);
            var canAffordQuiet = this.provisions >= this.active.quiet.cost;
            var opts = [this.active.quiet, this.active.bold];
            for (var i = 0; i < 2; i++) {
              var r = rects[i], o = opts[i];
              var locked = i === 0 && !canAffordQuiet;
              g.rect(r.x, r.y, r.w, r.h, locked ? '#161616' : (i === 0 ? '#141c10' : '#241412'));
              c.strokeStyle = locked ? C.stonD : (i === 0 ? C.marshL : C.red);
              c.lineWidth = 1; c.strokeRect(r.x, r.y, r.w, r.h);
              api.txtCFit(o.label, r.x + r.w / 2, r.y + 8, 9, locked ? C.stonD : C.cream, false, r.w - 12);
              api.txtCFit(locked ? 'NOT ENOUGH PROVISIONS' : o.sub, r.x + r.w / 2, r.y + 26, 7,
                locked ? C.stonD : (i === 0 ? C.greenL : C.red), false, r.w - 12);
            }
          }

          // Stat bars
          api.txt('ALARM', 6, 20, 7, C.red, false, true);
          g.rect(50, 20, W - 104, 6, '#241008');
          g.rect(50, 20, Math.floor((W - 104) * clamp(this.alarm / this.maxAlarm, 0, 1)), 6, C.red);
          api.txt('PROVISIONS ' + this.provisions, W - 8, 20, 7, C.amberL, 'right', true);

          api.topBar('THE MARSHES · CHECKPOINT ' + (Math.min(this.leg + 1, this.checkpoints.length)) + '/' + this.checkpoints.length);
          api.vignette();
          api.scanlines();
        },
      },

      /* ───────────────────────────────────────────────────────────────
       * ACT 2 — SATIS HOUSE
       * Class-ladder life-choices: five encounters with Estella, each a
       * Gentleman (STATUS) vs Blacksmith (LOYALTY) pick. No fail state —
       * the accumulated stats pick which of three endings Pip lives.
       * ─────────────────────────────────────────────────────────────── */
      {
        id:   'satis',
        name: 'SATIS HOUSE',
        sub:  'SHE TEACHES HIM TO WANT MORE',
        icon: function (api, ix, iy) { drawChapterIcon(api, 1, ix, iy); },
        intro: [
          'MISS HAVISHAM STOPPED',
          'ALL THE CLOCKS AT NINE',
          'TWENTY ON HER WEDDING',
          'MORNING. ESTELLA WATCHES',
          'PIP WITH COOL CONTEMPT.',
          'Every answer he gives',
          'teaches him to want more —',
          'or to stay who he is.',
        ],
        quote: '"She seemed to have stopped... her own heart." — Dickens, 1861',
        help:  'TAP a choice each round · lean GENTLEMAN (status) or BLACKSMITH (loyalty) — there is no wrong answer, only an ending',
        winText:  '',
        loseText: '',

        init: function (api) {
          this.status = 0; this.loyalty = 0;
          this.round = 0;
          this.encounters = [
            { title: 'ESTELLA CALLS HIS BOOTS "COARSE"', a: { label: 'Look away, ashamed', sub: '(gentleman)', status: 20, loyalty: 0 },
              b: { label: '"Joe made them himself"', sub: '(blacksmith)', status: 0, loyalty: 20 } },
            { title: 'SHE OFFERS CARDS — "BEGGAR MY NEIGHBOUR"', a: { label: 'Play to impress her', sub: '(gentleman)', status: 18, loyalty: 0 },
              b: { label: 'Play like it\'s the forge yard', sub: '(blacksmith)', status: 0, loyalty: 18 } },
            { title: 'MISS HAVISHAM ASKS: "DO YOU LOVE HER?"', a: { label: 'Yes — desperately', sub: '(gentleman)', status: 24, loyalty: 0 },
              b: { label: 'I love who I already have', sub: '(blacksmith)', status: 0, loyalty: 24 } },
            { title: 'ESTELLA STRIKES HIM AND WALKS AWAY', a: { label: 'Vow to become worthy of her', sub: '(gentleman)', status: 22, loyalty: 0 },
              b: { label: 'Vow never to return', sub: '(blacksmith)', status: 0, loyalty: 22 } },
            { title: 'THE GATE CLOSES BEHIND HIM', a: { label: 'Dream of a gentleman\'s life', sub: '(gentleman)', status: 20, loyalty: 0 },
              b: { label: 'Walk home to the forge, glad of it', sub: '(blacksmith)', status: 0, loyalty: 20 } },
          ];
          this.active = this.encounters[0];
          this.feedback = null; this.feedbackT = 0;
        },

        choiceRects: function (api) {
          var W = api.W, H = api.H;
          return [
            { x: 20, y: H - 130, w: W - 40, h: 44 },
            { x: 20, y: H - 78, w: W - 40, h: 44 },
          ];
        },

        update: function (api, dt) {
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
              this.status += pick.status;
              this.loyalty += pick.loyalty;
              api.addScore(pick.status + pick.loyalty);
              api.audio.sfx(i === 0 ? 'select' : 'coin');
              api.burst(api.W / 2, api.H * 0.4, i === 0 ? C.parch : C.amber, 8);
              this.feedback = pick.label;
              this.feedbackT = 0.9;
              this.round++;
              if (this.round >= this.encounters.length) {
                if (this.status > this.loyalty + 10) {
                  this.winText = 'Pip walks out wanting to be a gentleman more than anything in the world. Ambition has him now.';
                } else if (this.loyalty > this.status + 10) {
                  this.winText = 'Pip walks out unashamed of the forge. Estella\'s scorn slides off him like rain.';
                } else {
                  this.winText = 'Pip walks out torn between two lives — the one he has, and the one he now wants.';
                }
                api.win();
                return;
              }
              this.active = this.encounters[this.round];
              break;
            }
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
          g.rect(0, H*0.30, W, 12, '#2a1a12');
          g.rect(8, H*0.30+12, 12, H*0.16, '#1e1208');
          g.rect(W-20, H*0.30+12, 12, H*0.16, '#1e1208');

          // Stopped clock on wall
          c.strokeStyle = '#3a2a1a'; c.lineWidth = 2;
          c.beginPath(); c.arc(W/2, H*0.12, 18, 0, Math.PI*2); c.stroke();
          c.strokeStyle = C.brownL; c.lineWidth = 2;
          c.beginPath(); c.moveTo(W/2, H*0.12); c.lineTo(W/2 - 10, H*0.12 - 6); c.stroke();
          c.beginPath(); c.moveTo(W/2, H*0.12); c.lineTo(W/2 + 5, H*0.12 - 14); c.stroke();

          // Cobwebs in corners
          c.strokeStyle = 'rgba(180,170,150,0.18)'; c.lineWidth = 1;
          for (var cw = 0; cw < 6; cw++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(cw*12, cw*8); c.stroke(); }
          for (var cw2 = 0; cw2 < 6; cw2++) { c.beginPath(); c.moveTo(W, 0); c.lineTo(W-cw2*12, cw2*8); c.stroke(); }

          // Miss Havisham (left) + Estella (right) flanking the table
          g.rect(28, H*0.20, 22, 24, '#0a0608');
          g.circle(39, H*0.17, 10, '#0a0608');
          c.fillStyle = 'rgba(200,190,170,0.10)'; c.fillRect(24, H*0.13, 30, 34);
          g.rect(W-50, H*0.20, 20, 24, '#2a1622');
          g.circle(W-40, H*0.17, 9, '#3a2030');

          // Pip, small, between them
          drawPip(g, c, W/2, H*0.34);

          // encounter card
          var cardY = H * 0.42;
          g.rect(16, cardY, W - 32, 46, '#241614');
          c.strokeStyle = C.brownL; c.lineWidth = 1; c.strokeRect(16, cardY, W - 32, 46);
          api.txtCFit(this.active ? this.active.title : '', W / 2, cardY + 8, 9, C.cream, true, W - 44);
          if (this.feedbackT > 0) api.txtCFit('"' + this.feedback + '"', W / 2, cardY + 26, 8, C.amberL, false, W - 44);

          // choice buttons
          if (this.feedbackT <= 0 && this.active) {
            var rects = this.choiceRects(api);
            var opts = [this.active.a, this.active.b];
            for (var i = 0; i < 2; i++) {
              var r = rects[i], o = opts[i];
              g.rect(r.x, r.y, r.w, r.h, i === 0 ? '#241614' : '#1a2418');
              c.strokeStyle = i === 0 ? C.parchD : C.green; c.lineWidth = 1; c.strokeRect(r.x, r.y, r.w, r.h);
              api.txtCFit(o.label, r.x + r.w / 2, r.y + 8, 9, C.cream, false, r.w - 12);
              api.txtCFit(o.sub, r.x + r.w / 2, r.y + 26, 7, i === 0 ? C.parch : C.greenL, false, r.w - 12);
            }
          }

          // stat bars
          api.txt('GENTLEMAN', 6, 20, 7, C.amberL, false, true);
          g.rect(76, 20, W - 130, 6, '#241408');
          g.rect(76, 20, Math.floor((W - 130) * clamp(this.status / 100, 0, 1)), 6, C.amberL);
          api.txt('FORGE', 6, 30, 7, C.greenL, false, true);
          g.rect(56, 30, W - 110, 6, '#0e1a0e');
          g.rect(56, 30, Math.floor((W - 110) * clamp(this.loyalty / 100, 0, 1)), 6, C.greenL);

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
       * Branching river-escape: 4 reaches, each a QUIET (costs coin, no
       * risk) vs BOLD (free, raises suspicion) choice. Suspicion capped
       * at 70 — cross it and a police galley runs the boat down.
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
          "NOW HERBERT ROWS THEM",
          "DOWNRIVER TO A WAITING",
          "STEAMER — EVERY REACH",
          "A CHOICE: PAY FOR COVER,",
          "OR RISK THE OPEN WATER.",
        ],
        quote: '"We spend our lives trying to find out the secret, and the secret is in this: there is no secret." — Dickens',
        help:  'TAP a route at each reach. QUIET costs coin but stays safe; BOLD is free but raises suspicion. Let suspicion top out and the police close in.',
        winText:  '',
        loseText: 'A police galley runs the boat down. Magwitch is taken before the steamer ever comes in sight.',

        init: function (api) {
          this.coin = 40;
          this.suspicion = 0;
          this.maxSuspicion = 70;
          this.leg = 0;
          this.scroll = 0;
          this.reaches = [
            { name: 'BLACKWALL REACH', text: 'CRANES LOOM OVER BLACK WATER.',
              quiet: { label: 'HUG THE WHARVES', sub: '-16 coin · silent', cost: 16 },
              bold:  { label: 'RACE THE MIDDLE CHANNEL', sub: 'free · +22 suspicion', gain: 22 } },
            { name: 'ERITH FLATS', text: 'FLAT MARSH, NO COVER FOR MILES.',
              quiet: { label: 'PAY THE FERRYMAN FOR COVER', sub: '-16 coin · silent', cost: 16 },
              bold:  { label: 'ROW THE OPEN MARSH', sub: 'free · +22 suspicion', gain: 22 } },
            { name: 'GRAVESEND REACH', text: 'CUSTOMS BOATS WORK THIS STRETCH.',
              quiet: { label: 'MUFFLE THE OARS, SLACK TIDE', sub: '-16 coin · silent', cost: 16 },
              bold:  { label: 'PUSH ON IN DAYLIGHT', sub: 'free · +22 suspicion', gain: 22 } },
            { name: 'THE NORE', text: "THE STEAMER WAITS AT THE RIVER'S MOUTH.",
              quiet: { label: 'SIGNAL WITH A SHUTTERED LAMP', sub: '-16 coin · silent', cost: 16 },
              bold:  { label: 'WAVE THEM DOWN IN THE OPEN', sub: 'free · +22 suspicion', gain: 22 } },
          ];
          this.active = this.reaches[0];
          this.feedback = null; this.feedbackT = 0;
        },

        choiceRects: function (api) {
          var W = api.W, H = api.H;
          return [
            { x: 20, y: H - 130, w: W - 40, h: 44 },
            { x: 20, y: H - 78, w: W - 40, h: 44 },
          ];
        },

        update: function (api, dt) {
          this.scroll = (this.scroll + 60 * dt) % 120;
          this.feedbackT = Math.max(0, this.feedbackT - dt);
          if (this.feedbackT > 0 || !this.active) return;
          if (!api.pointer.justDown) return;

          var rects = this.choiceRects(api);
          var canAffordQuiet = this.coin >= this.active.quiet.cost;
          var opts = [this.active.quiet, this.active.bold];
          for (var i = 0; i < 2; i++) {
            if (i === 0 && !canAffordQuiet) continue; // quiet route locked without coin
            var r = rects[i];
            if (api.pointer.x >= r.x && api.pointer.x <= r.x + r.w &&
                api.pointer.y >= r.y && api.pointer.y <= r.y + r.h) {
              var pick = opts[i];
              if (i === 0) {
                this.coin -= pick.cost;
                api.audio.sfx('select');
                api.burst(api.W / 2, api.H * 0.42, C.riverL, 8);
              } else {
                this.suspicion += pick.gain;
                api.addScore(pick.gain);
                api.audio.sfx('coin');
                api.shake(4, 0.2);
                api.burst(api.W / 2, api.H * 0.42, C.red, 8);
              }
              this.feedback = pick.label;
              this.feedbackT = 0.9;

              if (this.suspicion >= this.maxSuspicion) {
                api.lose();
                return;
              }
              this.leg++;
              if (this.leg >= this.reaches.length) {
                this.winText = this.coin >= 24
                  ? 'The rowboat slips alongside the steamer with coin to spare. The waiting ship looms ahead.'
                  : 'The rowboat clears the last reach, purse near empty. The waiting ship looms ahead.';
                api.addScore(35);
                this.active = null;
                api.win();
                return;
              }
              this.active = this.reaches[this.leg];
              break;
            }
          }
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Thames at dusk
          var sk = c.createLinearGradient(0, 0, 0, H);
          sk.addColorStop(0, '#0a1018');
          sk.addColorStop(1, '#16282e');
          c.fillStyle = sk; c.fillRect(0, 0, W, H);

          // Scrolling river band
          g.rect(0, H * 0.32, W, H * 0.30, C.water);
          c.strokeStyle = C.riverL; c.lineWidth = 1; c.globalAlpha = 0.3;
          for (var ri = 0; ri < 7; ri++) {
            var ry = H * 0.32 + ((ri * 18 + this.scroll) % (H * 0.30));
            c.beginPath(); c.moveTo(0, ry); c.lineTo(W, ry + 3); c.stroke();
          }
          c.globalAlpha = 1;
          g.rect(0, H * 0.30, W, 4, '#060a0c');
          g.rect(0, H * 0.62, W, 4, '#060a0c');

          // Route map: waypoint dots for the 4 reaches
          var mapY = H * 0.14, mapL = 30, mapR = W - 30;
          for (var wi = 0; wi < this.reaches.length; wi++) {
            var wx = mapL + wi * ((mapR - mapL) / (this.reaches.length - 1));
            var passed = wi < this.leg, isCur = wi === this.leg;
            if (wi > 0) {
              var pwx = mapL + (wi - 1) * ((mapR - mapL) / (this.reaches.length - 1));
              c.strokeStyle = (passed || isCur) ? C.amber : C.stonD;
              c.lineWidth = 2; c.globalAlpha = 0.5;
              c.beginPath(); c.moveTo(pwx, mapY); c.lineTo(wx, mapY); c.stroke();
              c.globalAlpha = 1;
            }
            g.circle(wx, mapY, isCur ? 6 : 4, passed ? C.greenL : (isCur ? C.amberL : C.stonD));
          }
          var boatMapX = mapL + Math.min(this.leg, this.reaches.length - 1) * ((mapR - mapL) / (this.reaches.length - 1));
          c.fillStyle = C.boatL;
          c.beginPath();
          c.moveTo(boatMapX - 6, mapY - 10); c.lineTo(boatMapX + 6, mapY - 10); c.lineTo(boatMapX, mapY - 2);
          c.closePath(); c.fill();

          // Rowboat mid-scene
          var boatY = H * 0.48;
          c.fillStyle = C.boatL;
          c.beginPath();
          c.moveTo(W/2 - 30, boatY + 9);
          c.lineTo(W/2 + 30, boatY + 9);
          c.lineTo(W/2 + 23, boatY - 8);
          c.lineTo(W/2 - 23, boatY - 8);
          c.closePath(); c.fill();
          c.strokeStyle = C.boat; c.lineWidth = 2; c.stroke();
          c.strokeStyle = C.brownL; c.lineWidth = 3;
          c.beginPath(); c.moveTo(W/2 - 23, boatY); c.lineTo(W/2 - 46, boatY + 11); c.stroke();
          c.beginPath(); c.moveTo(W/2 + 23, boatY); c.lineTo(W/2 + 46, boatY + 11); c.stroke();
          c.fillStyle = '#08060a';
          g.circle(W/2 - 6, boatY - 4, 5, '#08060a');
          g.circle(W/2 + 8, boatY - 5, 6, '#08060a');

          // Encounter card
          var cardY = H * 0.64;
          g.rect(16, cardY, W - 32, 40, '#0e1a1e');
          c.strokeStyle = C.riverL; c.lineWidth = 1; c.strokeRect(16, cardY, W - 32, 40);
          if (this.active) {
            api.txtCFit(this.active.name, W / 2, cardY + 6, 8, C.cream, true, W - 44);
            api.txtCFit(this.feedbackT > 0 ? ('"' + this.feedback + '"') : this.active.text,
              W / 2, cardY + 24, 7, this.feedbackT > 0 ? C.amberL : C.fogGr, false, W - 44);
          }

          // Choice buttons
          if (this.feedbackT <= 0 && this.active) {
            var rects = this.choiceRects(api);
            var canAffordQuiet = this.coin >= this.active.quiet.cost;
            var opts = [this.active.quiet, this.active.bold];
            for (var i = 0; i < 2; i++) {
              var r = rects[i], o = opts[i];
              var locked = i === 0 && !canAffordQuiet;
              g.rect(r.x, r.y, r.w, r.h, locked ? '#161616' : (i === 0 ? '#0e1a1e' : '#241412'));
              c.strokeStyle = locked ? C.stonD : (i === 0 ? C.riverL : C.red);
              c.lineWidth = 1; c.strokeRect(r.x, r.y, r.w, r.h);
              api.txtCFit(o.label, r.x + r.w / 2, r.y + 8, 9, locked ? C.stonD : C.cream, false, r.w - 12);
              api.txtCFit(locked ? 'NOT ENOUGH COIN' : o.sub, r.x + r.w / 2, r.y + 26, 7,
                locked ? C.stonD : (i === 0 ? C.riverL : C.red), false, r.w - 12);
            }
          }

          // Stat bars
          api.txt('SUSPICION', 6, 20, 7, C.red, false, true);
          g.rect(76, 20, W - 130, 6, '#241008');
          g.rect(76, 20, Math.floor((W - 130) * clamp(this.suspicion / this.maxSuspicion, 0, 1)), 6, C.red);
          api.txt('COIN ' + this.coin, W - 8, 20, 7, C.amberL, 'right', true);

          api.topBar('THE THAMES · REACH ' + (Math.min(this.leg + 1, this.reaches.length)) + '/' + this.reaches.length);
          api.vignette();
          api.scanlines();
        },
      },

      /* ───────────────────────────────────────────────────────────────
       * ACT 5 — THE CONFRONTATION
       * Reactive grip-read duel: Compeyson telegraphs a grapple side
       * (LEFT / CENTER / RIGHT) with a shrinking ring; Pip must slap the
       * matching zone before it closes. 5 grapples won to free Magwitch.
       * 3 misses = lose. Window shrinks and choices quicken with wins.
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
          "PIP MUST READ EACH GRIP",
          "AND BRACE THE RIGHT SIDE.",
        ],
        quote: '"In the little world in which children exist... there is nothing so finely perceived as injustice." — Dickens',
        help:  'Compeyson telegraphs a grip — LEFT, CENTER or RIGHT. TAP the matching zone (or arrow keys / up) before the ring closes! 5 grapples to win. 3 misses and you lose.',
        winText:  'Compeyson is overcome. The Thames takes him. Magwitch is free — but badly wounded.',
        loseText: 'Compeyson overwhelms Pip. The river runs cold and dark.',

        zoneRects: function (api) {
          var W = api.W, H = api.H;
          var zw = (W - 24) / 3;
          return [
            { x: 12,             y: H - 92, w: zw, h: 64, zone: 0, label: '← LEFT' },
            { x: 12 + zw + 6,     y: H - 92, w: zw, h: 64, zone: 1, label: 'CENTER' },
            { x: 12 + zw * 2 + 12, y: H - 92, w: zw, h: 64, zone: 2, label: 'RIGHT →' },
          ];
        },

        pickZone: function () {
          var z = Math.floor(Math.random() * 3);
          if (z === this.zone) z = (z + 1 + Math.floor(Math.random() * 2)) % 3;
          return z;
        },

        init: function (api) {
          this.lives = 3;
          this.hits  = 0;
          this.need  = 5;
          this.victimFlash = 0;
          this.resultFlash = 0;
          this.resultOK = false;
          this.phase  = 'telegraph'; // telegraph | resolve
          this.zone   = 1;
          this.windowDur = 1.15;
          this.windowT   = this.windowDur;
          this.resolveT  = 0;
          this.compX = api.W / 2;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.victimFlash = Math.max(0, this.victimFlash - dt);
          this.resultFlash = Math.max(0, this.resultFlash - dt);

          if (this.phase === 'telegraph') {
            this.windowT -= dt;

            var pressedZone = -1;
            if (api.pointer.justDown) {
              var rects = this.zoneRects(api);
              for (var i = 0; i < rects.length; i++) {
                var r = rects[i];
                if (api.pointer.x >= r.x && api.pointer.x <= r.x + r.w &&
                    api.pointer.y >= r.y && api.pointer.y <= r.y + r.h) { pressedZone = r.zone; break; }
              }
            }
            if (pressedZone < 0) {
              if (api.keyPressed('left')) pressedZone = 0;
              else if (api.keyPressed('up') || api.keyPressed('a') || api.keyPressed('start')) pressedZone = 1;
              else if (api.keyPressed('right')) pressedZone = 2;
            }

            if (pressedZone >= 0) {
              if (pressedZone === this.zone) {
                this.hits++;
                this.resultFlash = 0.4; this.resultOK = true;
                api.addScore(20);
                api.audio.sfx('coin');
                api.burst(this.compX, H * 0.32, C.amberL, 10);
                api.shake(5, 0.25);
                if (this.hits >= this.need) { api.addScore(40); api.win(); return; }
              } else {
                this.lives--;
                this.resultFlash = 0.4; this.resultOK = false;
                this.victimFlash = 0.5;
                api.shake(8, 0.35);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
              this.phase = 'resolve';
              this.resolveT = 0.5;
              return;
            }

            if (this.windowT <= 0) {
              // Missed the window entirely — the grip lands
              this.lives--;
              this.resultFlash = 0.4; this.resultOK = false;
              this.victimFlash = 0.5;
              api.shake(8, 0.35);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
              this.phase = 'resolve';
              this.resolveT = 0.5;
            }
          } else {
            this.resolveT -= dt;
            if (this.resolveT <= 0) {
              this.zone = this.pickZone();
              this.windowDur = Math.max(0.55, 1.15 - this.hits * 0.11);
              this.windowT = this.windowDur;
              this.phase = 'telegraph';
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
          g.rect(0, H * 0.60, W, H * 0.16, C.river);
          c.strokeStyle = C.riverL; c.lineWidth = 1; c.globalAlpha = 0.3;
          for (var rp = 0; rp < 5; rp++) {
            var rpY = H * 0.62 + rp * 12 + api.t % 12;
            c.beginPath(); c.moveTo(0, rpY); c.lineTo(W, rpY + 3); c.stroke();
          }
          c.globalAlpha = 1;

          // Background warehouse silhouettes
          c.fillStyle = '#060808';
          c.fillRect(0, H * 0.20, 40, H * 0.42);
          c.fillRect(W - 44, H * 0.16, 44, H * 0.46);

          // Compeyson — large menacing figure at top
          var ex = this.compX, ey = H * 0.30;
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

          if (this.phase === 'telegraph') {
            // Lean toward the telegraphed side + a pulsing warning glow
            var lean = this.zone === 0 ? -10 : (this.zone === 2 ? 10 : 0);
            c.globalAlpha = 0.5 + 0.3 * Math.sin(api.t * 8);
            g.circle(ex + lean, ey - 30, 6, C.red);
            c.globalAlpha = 1;

            var label = this.zone === 0 ? 'GRIPS LEFT!' : (this.zone === 2 ? 'GRIPS RIGHT!' : 'GRIPS CENTER!');
            api.txtCFit(label, W / 2, H * 0.42, 11, C.cream, true, W - 20);

            // Shrinking countdown ring — the reaction window
            var ringR = 16, ringX = W / 2, ringY = H * 0.52;
            c.strokeStyle = '#241408'; c.lineWidth = 4;
            c.beginPath(); c.arc(ringX, ringY, ringR, 0, Math.PI * 2); c.stroke();
            var frac = clamp(this.windowT / this.windowDur, 0, 1);
            c.strokeStyle = frac > 0.3 ? C.amberL : C.red; c.lineWidth = 4;
            c.beginPath(); c.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); c.stroke();
          }

          // Result / victim flash
          if (this.resultFlash > 0) {
            c.globalAlpha = this.resultFlash * (this.resultOK ? 0.5 : 0.35);
            c.fillStyle = this.resultOK ? C.amberL : C.red;
            c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          // Pip braced at the water's edge
          drawPip(g, c, W / 2, H * 0.58);

          // Zone buttons — the reaction targets
          var rects = this.zoneRects(api);
          for (var zi = 0; zi < rects.length; zi++) {
            var r = rects[zi];
            var isTarget = this.phase === 'telegraph' && r.zone === this.zone;
            g.rect(r.x, r.y, r.w, r.h, isTarget ? '#3a2408' : '#181008');
            c.strokeStyle = isTarget ? C.amberL : C.stone;
            c.lineWidth = isTarget ? 3 : 1.5;
            c.strokeRect(r.x, r.y, r.w, r.h);
            api.txtCFit(r.label, r.x + r.w / 2, r.y + r.h / 2 - 5, 8, isTarget ? C.amberL : C.stonD, false, r.w - 8);
          }

          // Hit counter (grapples won)
          for (var hi = 0; hi < this.need; hi++) {
            var hcol = hi < this.hits ? C.amber : C.dark;
            g.circle(W / 2 - (this.need * 10) / 2 + hi * 10 + 5, H * 0.16, 4, hcol);
            c.strokeStyle = C.stone; c.lineWidth = 1;
            c.beginPath(); c.arc(W / 2 - (this.need * 10) / 2 + hi * 10 + 5, H * 0.16, 4, 0, Math.PI * 2); c.stroke();
          }

          api.topBar('THE WHARF', '★ ' + this.hits + '/' + this.need, this.lives);
          api.vignette();
          api.scanlines();
        },
      },

    ], /* end chapters */
  }); /* end RetroSaga.create */

}()); /* end IIFE */
