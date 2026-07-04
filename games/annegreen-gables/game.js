/* ============================================================================
 * ANNE OF GREEN GABLES — KINDRED SPIRITS
 *   1. THE WHITE WAY OF DELIGHT  — Imagination Chooser (3 options, pick Anne's voice)
 *   2. THE APOLOGY TO RACHEL     — Phrase Builder (sequence 4 correct phrases)
 *   3. THE BOSOM FRIEND          — Memory Match (flip 8 cards, find 4 kindred pairs)
 *   4. THE HAUNTED WOOD          — Story Builder (fill 4 blanks dramatically)
 *   5. THE AVERY SCHOLARSHIP     — Academic Speed Race vs Gilbert Blythe
 * Built on RetroSaga (js/saga.js) + RetroEngine. Gen 3 / NES-era flat fills.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ── Palette (NES-era warm PEI pastoral) ───────────────────────────────── */
  var C = {
    sky:    '#5870D8', skyL:   '#78A0F8',
    hill:   '#008800', hillL:  '#00B800',
    grass:  '#38A838', grassL: '#68D068',
    road:   '#A84020', roadL:  '#C86040',
    blossom:'#F8C8E0', blossomL:'#FCDCF0',
    gold:   '#F8B800', goldL:  '#FCE040',
    cream:  '#FCE8C0', creamD: '#D0A870',
    rose:   '#D81888', roseL:  '#F848A8',
    skin:   '#F8B880', skinD:  '#C87838',
    hair:   '#B83000', hairD:  '#802000',
    hairG:  '#006820',
    branch: '#604010', branchL:'#805030',
    dark:   '#000000', dimD:   '#100808',
    blue:   '#4848D8', blueL:  '#8888F8',
    shadow: '#281848',
    white:  '#F8F8F8', grey:   '#989898',
    red:    '#C80000', green:  '#007800',
    cork:   '#C89858', corkD:  '#8A5830',
    paper:  '#FCF0D8', paperD: '#D4B880',
    water:  '#3898D8', waterL: '#68C8F0',
    leaf:   '#007800', leafL:  '#009820',
  };

  /* ── Emblem: apple blossom spray ────────────────────────────────────────── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    c.strokeStyle = C.branch; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 2, cy + 16); c.lineTo(cx + 2, cy - 2); c.lineTo(cx + 12, cy - 16); c.stroke();
    c.beginPath(); c.moveTo(cx + 2, cy - 2); c.lineTo(cx - 12, cy - 10); c.stroke();
    c.beginPath(); c.moveTo(cx + 5, cy - 8); c.lineTo(cx + 10, cy - 20); c.stroke();
    [[cx - 12, cy - 10, 6], [cx + 12, cy - 16, 7], [cx + 10, cy - 20, 5], [cx, cy + 2, 5]].forEach(function (b) {
      for (var p = 0; p < 5; p++) { var a = p * Math.PI * 0.4; g.circle(b[0] + Math.cos(a) * b[2] * 0.6, b[1] + Math.sin(a) * b[2] * 0.6, b[2] * 0.45, C.blossom); }
      g.circle(b[0], b[1], b[2] * 0.3, C.gold);
    });
  }

  /* ── Scenery: PEI pastoral, flat NES fills ──────────────────────────────── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    // Sky flat
    g.rect(0, 0, W, H * 0.52, C.sky);
    // Clouds (flat white blobs)
    [[50, 38, 1.0], [140, 22, 0.8], [210, 46, 0.9]].forEach(function (cp) {
      var cx2 = (cp[0] + t * 10 * cp[2]) % (W + 60) - 20;
      g.circle(cx2, cp[1], 10, C.white); g.circle(cx2 + 10, cp[1] - 5, 8, C.white); g.circle(cx2 - 8, cp[1] - 4, 7, C.white);
    });
    // Far hill
    g.rect(0, H * 0.46, W, H * 0.54, C.hill);
    // Near ground
    g.rect(0, H * 0.56, W, H * 0.44, C.grass);
    g.rect(0, H * 0.66, W, H * 0.34, C.grassL);
    // Green Gables farmhouse
    var hx = W - 70, hy = H * 0.42;
    g.rect(hx - 20, hy, 40, 30, C.white);
    c.fillStyle = C.grass;
    c.beginPath(); c.moveTo(hx - 22, hy); c.lineTo(hx + 22, hy); c.lineTo(hx, hy - 22); c.closePath(); c.fill();
    g.rect(hx - 5, hy + 12, 10, 18, C.branch);
    g.rect(hx - 15, hy + 6, 10, 8, C.blue); g.rect(hx + 5, hy + 6, 10, 8, C.blue);
    // Apple trees
    [[W * 0.15, H * 0.54], [W * 0.28, H * 0.50]].forEach(function (tp) {
      g.rect(tp[0] - 2, tp[1], 4, 22, C.branch);
      g.circle(tp[0], tp[1] - 6, 14, C.leaf);
      for (var b = 0; b < 5; b++) { var ba = b * Math.PI * 0.4 + t * 0.25; g.circle(tp[0] + Math.cos(ba) * 8, tp[1] - 6 + Math.sin(ba) * 7, 3, C.blossom); }
    });
    // Lake of Shining Waters
    g.rect(W * 0.06, H * 0.60, 50, 10, C.water);
    g.rect(W * 0.08, H * 0.60, 46, 4, C.waterL);
    // Red clay road
    c.fillStyle = C.road;
    c.beginPath(); c.moveTo(W * 0.34, H); c.lineTo(W * 0.40, H * 0.66); c.lineTo(W * 0.58, H * 0.66); c.lineTo(W * 0.66, H); c.closePath(); c.fill();

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(0,0,0,0.82)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ── Menu card positions (zigzag PEI map scatter) ───────────────────────── */
  var SPOTS = [
    { x: 10,  y: 90,  w: 116, h: 72 },
    { x: 143, y: 104, w: 114, h: 72 },
    { x: 72,  y: 205, w: 116, h: 72 },
    { x: 10,  y: 316, w: 114, h: 72 },
    { x: 146, y: 330, w: 112, h: 72 },
  ];

  /* ── Chapter icons ──────────────────────────────────────────────────────── */
  var ICONS = [
    function (api, x, y) { // buggy wheel + blossom
      var g = api.gfx, c = api.ctx;
      c.strokeStyle = C.branch; c.lineWidth = 2;
      c.beginPath(); c.arc(x, y + 2, 9, 0, Math.PI * 2); c.stroke();
      for (var s = 0; s < 6; s++) { var a = s * Math.PI / 3; c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x + Math.cos(a) * 8, y + 2 + Math.sin(a) * 8); c.stroke(); }
      g.circle(x, y + 2, 3, C.branch);
      g.circle(x + 14, y - 10, 5, C.blossom); g.circle(x + 14, y - 10, 2, C.gold);
    },
    function (api, x, y) { // stern face (Mrs Lynde)
      var g = api.gfx, c = api.ctx;
      g.circle(x, y - 4, 9, C.skin);
      g.circle(x, y - 12, 7, C.grey);
      g.rect(x - 10, y + 4, 20, 14, C.blue);
      c.strokeStyle = C.dark; c.lineWidth = 1;
      c.beginPath(); c.moveTo(x - 4, y - 1); c.lineTo(x + 4, y - 1); c.stroke();
    },
    function (api, x, y) { // two friends heart
      var g = api.gfx;
      g.circle(x - 6, y - 5, 7, C.skin); g.circle(x + 6, y - 5, 7, C.skin);
      g.circle(x - 6, y - 12, 6, C.hair); g.circle(x + 6, y - 12, 5, C.dark);
      g.rect(x - 11, y + 1, 9, 12, C.rose); g.rect(x + 2, y + 1, 9, 12, C.blue);
      g.circle(x - 2, y - 6, 3, C.rose); g.circle(x + 2, y - 6, 3, C.rose);
    },
    function (api, x, y) { // spooky tree
      var g = api.gfx, c = api.ctx;
      c.fillStyle = C.dark;
      c.beginPath(); c.moveTo(x - 6, y + 10); c.lineTo(x, y - 14); c.lineTo(x + 6, y + 10); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x - 10, y + 2); c.lineTo(x, y - 8); c.lineTo(x + 10, y + 2); c.closePath(); c.fill();
      g.circle(x - 3, y - 4, 2, C.gold); g.circle(x + 3, y - 4, 2, C.gold);
    },
    function (api, x, y) { // diploma scroll
      var g = api.gfx, c = api.ctx;
      g.rect(x - 12, y - 6, 24, 16, C.cream);
      g.rect(x - 12, y - 6, 4, 16, C.creamD);
      g.rect(x - 7, y - 3, 15, 2, C.rose); g.rect(x - 7, y + 1, 11, 2, C.rose);
      c.strokeStyle = C.gold; c.lineWidth = 2;
      c.beginPath(); c.arc(x, y + 14, 5, 0, Math.PI * 2); c.stroke();
      g.circle(x, y + 14, 3, C.rose);
    },
  ];

  /* ── Shared drawing helpers ─────────────────────────────────────────────── */

  // Draw a choice button (state: 'normal'|'selected'|'correct'|'wrong')
  function drawBtn(api, bx, by, bw, bh, label, state) {
    var g = api.gfx;
    var bg = state === 'selected' ? C.rose : state === 'correct' ? C.leaf : state === 'wrong' ? C.red : '#201008';
    var bd = state === 'selected' ? C.gold : state === 'correct' ? C.gold : state === 'wrong' ? C.cream : C.corkD;
    var tc = state === 'normal' ? C.cream : C.white;
    g.rect(bx, by, bw, bh, bg);
    g.rectO(bx, by, bw, bh, bd, 1);
    api.txtCFit(label, bx + bw / 2, by + bh / 2 - 2, 5, tc, false, bw - 10);
  }

  // Draw Anne sprite (simple NES chunky)
  function drawAnne(g, x, y, hairCol) {
    g.circle(x, y - 22, 9, C.skin);
    g.circle(x, y - 30, 8, hairCol || C.hair);
    g.circle(x + 7, y - 28, 5, hairCol || C.hair);
    g.rect(x - 9, y - 13, 18, 20, C.blue);
    g.rect(x - 13, y - 9, 5, 12, C.skin);
    g.rect(x + 8, y - 9, 5, 12, C.skin);
  }

  // Draw Mrs Lynde (with anger level 0-3)
  function drawLynde(g, c, x, y, anger) {
    // Body
    g.rect(x - 14, y - 5, 28, 30, C.blue);
    // Head
    g.circle(x, y - 15, 12, C.skin);
    // Hair (grey)
    g.circle(x, y - 26, 10, C.grey);
    g.circle(x - 8, y - 20, 7, C.grey);
    g.circle(x + 8, y - 20, 7, C.grey);
    // Eyes
    g.circle(x - 4, y - 17, 2, C.dark);
    g.circle(x + 4, y - 17, 2, C.dark);
    // Eyebrows (angry = down/together)
    c.strokeStyle = C.dark; c.lineWidth = 1.5;
    if (anger >= 3) {
      c.beginPath(); c.moveTo(x - 7, y - 22); c.lineTo(x - 2, y - 20); c.stroke();
      c.beginPath(); c.moveTo(x + 7, y - 22); c.lineTo(x + 2, y - 20); c.stroke();
    } else if (anger >= 2) {
      c.beginPath(); c.moveTo(x - 7, y - 21); c.lineTo(x - 2, y - 21); c.stroke();
      c.beginPath(); c.moveTo(x + 2, y - 21); c.lineTo(x + 7, y - 21); c.stroke();
    } else {
      c.beginPath(); c.moveTo(x - 7, y - 22); c.lineTo(x - 2, y - 23); c.stroke();
      c.beginPath(); c.moveTo(x + 2, y - 23); c.lineTo(x + 7, y - 22); c.stroke();
    }
    // Mouth (angry = frown, forgiving = slight smile)
    c.beginPath();
    if (anger >= 3) {
      c.arc(x, y - 10, 4, Math.PI * 0.15, Math.PI * 0.85); // frown
    } else if (anger >= 1) {
      c.moveTo(x - 4, y - 11); c.lineTo(x + 4, y - 11); // neutral
    } else {
      c.arc(x, y - 14, 4, Math.PI * 1.15, Math.PI * 1.85); // smile
    }
    c.stroke();
  }

  /* ════════════════════════════════════════════════════════════════════════
   * CHAPTER 1: THE WHITE WAY OF DELIGHT — Imagination Chooser
   * ════════════════════════════════════════════════════════════════════════ */
  var SCENES = [
    { label: 'A SHIMMERING POND',    opts: ['A LAKE OF SHINING WATERS', 'JUST A POND OVER THERE', 'SOME STANDING WATER'],        c: 0 },
    { label: 'BLOSSOMING APPLE TREES', opts: ['THE WHITE WAY OF DELIGHT!', 'SOME FLOWERY TREES, I SUPPOSE', 'TREES ALONG THE ROAD'], c: 0 },
    { label: 'A RED FARMHOUSE',      opts: ['GREEN GABLES — MY TRUE HOME!', 'A FARMHOUSE UP AHEAD', 'A BIG RED BUILDING'],        c: 0 },
    { label: 'THE EVENING SKY',      opts: ['A SEA OF GOLDEN ROSE BLOOMS', 'A PRETTY SUNSET TONIGHT', 'THE SUN GOING DOWN'],      c: 0 },
    { label: 'THE WINDING LANE',     opts: ['A PATH THAT WINDS LIKE A WISH', 'JUST THE ROAD HOMEWARD', 'A DUSTY LANE'],           c: 0 },
  ];

  function drawScene1Bg(g, c, W, H, sceneIdx) {
    // Base
    g.rect(0, 14, W, 200, C.sky);
    g.rect(0, 120, W, 94, C.hill);
    g.rect(0, 155, W, 59, C.grass);
    if (sceneIdx === 0) { // Pond
      g.rect(W / 2 - 32, 130, 64, 18, C.water);
      g.rect(W / 2 - 30, 130, 60, 6, C.waterL);
    } else if (sceneIdx === 1) { // Apple trees
      [-30, 30].forEach(function (ox) {
        g.rect(W / 2 + ox - 2, 96, 4, 28, C.branch);
        g.circle(W / 2 + ox, 92, 16, C.leaf);
        for (var b = 0; b < 6; b++) { var a = b * Math.PI / 3; g.circle(W / 2 + ox + Math.cos(a) * 9, 92 + Math.sin(a) * 8, 4, C.blossom); }
      });
    } else if (sceneIdx === 2) { // Farmhouse
      var hx = W / 2, hy = 90;
      c.fillStyle = C.grass;
      c.beginPath(); c.moveTo(hx - 28, hy); c.lineTo(hx + 28, hy); c.lineTo(hx, hy - 26); c.closePath(); c.fill();
      g.rect(hx - 26, hy, 52, 38, C.white);
      g.rect(hx - 7, hy + 14, 14, 24, C.branch);
      g.rect(hx - 20, hy + 8, 12, 10, C.blue); g.rect(hx + 8, hy + 8, 12, 10, C.blue);
    } else if (sceneIdx === 3) { // Sunset sky (flat bands)
      g.rect(0, 14, W, 40, '#C80000');
      g.rect(0, 54, W, 35, '#F88000');
      g.rect(0, 89, W, 30, C.gold);
      g.rect(0, 119, W, 95, C.hill);
      g.rect(0, 155, W, 59, C.grass);
    } else if (sceneIdx === 4) { // Winding road
      c.fillStyle = C.road;
      c.beginPath();
      c.moveTo(W / 2 - 14, 214); c.lineTo(W / 2 - 8, 175); c.lineTo(W / 2 + 6, 155); c.lineTo(W / 2 + 18, 130); c.lineTo(W / 2 + 22, 110);
      c.lineTo(W / 2 + 10, 110); c.lineTo(W / 2 + 6, 130); c.lineTo(W / 2 - 6, 155); c.lineTo(W / 2 - 20, 175); c.lineTo(W / 2 - 26, 214);
      c.closePath(); c.fill();
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
   * CHAPTER 2: THE APOLOGY — Phrase Builder
   * ════════════════════════════════════════════════════════════════════════ */
  var APOLOGY = [
    { opts: ['I AM SO EXTREMELY SORRY', 'I SUPPOSE I WENT A BIT FAR'],              c: 0 },
    { opts: ['WHAT I SAID WAS WICKEDLY WRONG', 'PERHAPS I SPOKE A LITTLE STRONGLY'], c: 0 },
    { opts: ['YOU MEANT WELL AND I AM GRATEFUL', 'I KNOW EVERYONE MAKES MISTAKES'],  c: 0 },
    { opts: ['WILL YOU FIND IT IN YOUR HEART TO FORGIVE ME?', 'SHALL WE MOVE ON?'],  c: 0 },
  ];

  /* ════════════════════════════════════════════════════════════════════════
   * CHAPTER 3: THE BOSOM FRIEND — Memory Match
   * ════════════════════════════════════════════════════════════════════════ */
  var PAIR_LABELS = ['ROSES', 'POETRY', 'WONDER', 'FRIENDSHIP'];

  /* ════════════════════════════════════════════════════════════════════════
   * CHAPTER 4: THE HAUNTED WOOD — Story Builder
   * ════════════════════════════════════════════════════════════════════════ */
  var STORY_BLANKS = [
    { before: '"ONE STORMY NIGHT, A ___', after: ' GHOST"', opts: ['TRAGIC', 'SCARY'],                         c: 0 },
    { before: '"...DRIFTED THROUGH', after: ' SHADOWS"',   opts: ['MOONLIT', 'DARK'],                          c: 0 },
    { before: '"...ITS VOICE ___', after: '" SAID ANNE',   opts: ['MOURNFUL AS THE WIND', 'LOUD AND SPOOKY'],  c: 0 },
    { before: '"...LIKE ___', after: ' IN THE NIGHT"',      opts: ['THE CRACK OF DOOM', 'A SQUEAKY DOOR'],      c: 0 },
  ];

  /* ════════════════════════════════════════════════════════════════════════
   * CHAPTER 5: THE AVERY SCHOLARSHIP — Academic Speed Race
   * ════════════════════════════════════════════════════════════════════════ */
  var QUESTIONS = [
    { q: 'WHAT DID ANNE NAME THE POND?', opts: ['LAKE OF SHINING WATERS', 'SILVER LAKE'],           c: 0 },
    { q: "WHAT RUINED MARILLA'S CAKE?",  opts: ['LINIMENT', 'TOO MUCH SALT'],                        c: 0 },
    { q: "ANNE'S 'BOSOM FRIEND'?",       opts: ['DIANA BARRY', 'RUBY GILLIS'],                       c: 0 },
    { q: 'WHAT SCHOLARSHIP DID ANNE WIN?', opts: ['AVERY SCHOLARSHIP', 'QUEENS COLLEGE PRIZE'],      c: 0 },
    { q: "WHO IS ANNE'S SCHOOL RIVAL?",  opts: ['GILBERT BLYTHE', 'CHARLIE SLOANE'],                 c: 0 },
    { q: "WHERE IS GREEN GABLES?",       opts: ['AVONLEA, P.E.I.', 'QUEENSWAY, NOVA SCOTIA'],       c: 0 },
  ];

  /* ════════════════════════════════════════════════════════════════════════
   * RETROSAGA
   * ════════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id:       'annegreen',
    title:    'Anne of Green Gables',
    subtitle: 'KINDRED SPIRITS · L. M. MONTGOMERY',
    currency: 'FANCY',
    accent:   '#D81888',
    credit:   'ANNE OF GREEN GABLES · L. M. MONTGOMERY · 1908',
    bootLine: 'IMAGINATION MAKES THE WORLD BEAUTIFUL',
    bootCta:  "TAP TO ENTER ANNE'S WORLD",
    menuLabel:"ANNE'S ADVENTURES",
    menuHint: 'CHOOSE A CHAPTER',
    menuDone: "ALL OF ANNE'S TALES TOLD",
    tagline:  'A POLECAT ADVENTURE',
    emblem,
    scenery,

    screens: {
      win:          '#D81888',
      lose:         '#882040',
      chapterLabel: '#C09040',
      name:         '#FCE8C0',
      sub:          '#D81888',
      intro:        '#F0D8A0',
      quote:        '#C09040',
      help:         '#D81888',
      score:        '#FCE8C0',
      cur:          '#F8B800',
      cta:          '#FCE8C0',
      overlay:      'rgba(8,4,16,0.88)',
    },
    labels: {
      chapter:  'CHAPTER',
      score:    'FANCY EARNED',
      win:      'HOW PERFECTLY SPLENDID!',
      lose:     'SUCH A DREADFUL SCRAPE',
      cont:     'TAP TO CARRY ON',
      finale:   'TAP TO DREAM ON',
      toMenu:   'BACK TO GREEN GABLES',
      play:     'TAP TO BEGIN',
    },

    palette: { rose: '#D81888', gold: '#F8B800', cream: '#FCE8C0' },

    menu: {
      layout: function () { return SPOTS; },
      title: function (api, grace) {
        var g = api.gfx, c = api.ctx, W = api.W;
        // Cork board header
        g.rect(8, 12, W - 16, 72, C.cork);
        g.rect(10, 14, W - 20, 68, '#B07838');
        g.rectO(8, 12, W - 16, 72, C.corkD, 2);
        // Corner blossoms
        [[16, 18], [W - 16, 18], [16, 80], [W - 16, 80]].forEach(function (bp) {
          for (var p = 0; p < 5; p++) { var a = p * Math.PI * 0.4; g.circle(bp[0] + Math.cos(a) * 5, bp[1] + Math.sin(a) * 5, 3, C.blossom); }
          g.circle(bp[0], bp[1], 2, C.gold);
        });
        api.txtCFit("ANNE'S ADVENTURES", W / 2, 30, 10, C.dark, false, W - 48);
        api.txtCFit('FANCY  ' + grace, W / 2, 48, 8, C.rose, false, W - 48);
        c.strokeStyle = C.branch; c.lineWidth = 1;
        c.beginPath(); c.moveTo(22, 60); c.lineTo(W - 22, 60); c.stroke();
        api.txtCFit('L. M. MONTGOMERY · 1908', W / 2, 70, 6, C.corkD, false, W - 48);
        // Connecting lines
        c.strokeStyle = C.road; c.lineWidth = 1.5; c.globalAlpha = 0.38;
        var sp = SPOTS;
        function ln(a, b) { c.beginPath(); c.moveTo(a.x + a.w / 2, a.y + a.h); c.lineTo(b.x + b.w / 2, b.y); c.stroke(); }
        ln(sp[0], sp[2]); ln(sp[1], sp[2]); ln(sp[2], sp[3]); ln(sp[2], sp[4]);
        c.globalAlpha = 1;
      },
      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var x = info.x, y = info.y, w = info.w, h = info.h;
        var ch = info.ch, sel = info.sel, done = info.done, i = info.i;
        var cx2 = x + w / 2, cy2 = y + h / 2;
        // Postcard-style cream paper pinned to board
        g.rect(x, y, w, h, sel ? C.paper : C.paperD);
        g.rectO(x, y, w, h, sel ? C.rose : C.corkD, sel ? 2 : 1);
        g.rectO(x + 3, y + 3, w - 6, h - 6, sel ? C.gold : C.branch, 1);
        if (sel) {
          [[x + 7, y + 7], [x + w - 7, y + 7], [x + 7, y + h - 7], [x + w - 7, y + h - 7]].forEach(function (bp) {
            g.circle(bp[0], bp[1], 3, C.blossom); g.circle(bp[0], bp[1], 1, C.gold);
          });
        }
        ICONS[i](api, cx2, cy2 - 12);
        api.txtCFit(ch.name, cx2, cy2 + 10, 5, sel ? C.dark : C.creamD, false, w - 14);
        if (sel) {
          g.rect(x, y + h - 14, w, 14, C.rose);
          api.txtCFit('TAP TO BEGIN', cx2, y + h - 8, 5, C.white, false, w - 8);
        }
        if (done) { g.circle(x + w - 10, y + h - 10, 8, C.rose); api.txtC('✓', x + w - 10, y + h - 14, 7, C.white); }
        g.circle(x + 10, y + 10, 8, sel ? C.rose : C.corkD);
        api.txtC('' + (i + 1), x + 10, y + 6, 7, C.white);
      },
    },

    finale: [
      'ANNE SHIRLEY — NOT EXACTLY',
      "WHAT MARILLA ORDERED.",
      '',
      'BUT GREEN GABLES',
      'WOULD NEVER BE THE SAME.',
    ],

    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ════════════════════════════════════════════════════════════════════
       * CHAPTER 1: THE WHITE WAY OF DELIGHT — Imagination Chooser
       * ════════════════════════════════════════════════════════════════════ */
      {
        id: 'drive',
        name: 'THE WHITE WAY OF DELIGHT',
        sub: 'ANNE SEES BEAUTY EVERYWHERE',
        icon: function (api, x, y) { ICONS[0](api, x, y); },
        intro: [
          'MATTHEW CUTHBERT CAME',
          'TO BRIGHT RIVER STATION',
          'EXPECTING A BOY.',
          'Instead he found Anne —',
          'a girl who saw wonder',
          'in absolutely everything.',
        ],
        quote: '"It was so beautiful that I almost said a prayer." — Anne Shirley',
        help: 'TAP the phrase that sounds most like ANNE! She sees beauty in everything.',
        winText: 'Anne notices everything! Matthew opens his heart on the drive home.',
        loseText: 'Too plain for Anne! She sees the world through imagination.',
        init: function (api) {
          this.scene    = 0;
          this.total    = SCENES.length;
          this.phase    = 'choose';
          this.chosen   = -1;
          this.correct  = 0;
          this.wrong    = 0;
          this.maxWrong = 3;
          this.feedbackT = 0;
          this.timer    = 0;
          this.timeLimit = 9;
          this.done     = false;
          this.sel      = 0;
          this.btnX = 10; this.btnW = api.W - 20; this.btnH = 32;
          this.btnY = [234, 272, 310];
          this.feedback = '';
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W;
          if (this.phase === 'choose') {
            this.timer += dt;
            if (api.keyPressed('up'))   { this.sel = Math.max(0, this.sel - 1); api.audio.sfx('blip'); }
            if (api.keyPressed('down')) { this.sel = Math.min(2, this.sel + 1); api.audio.sfx('blip'); }
            if (api.pointer.justDown) {
              var px = api.pointer.x, py = api.pointer.y;
              for (var b = 0; b < 3; b++) {
                if (px >= this.btnX && px <= this.btnX + this.btnW &&
                    py >= this.btnY[b] && py <= this.btnY[b] + this.btnH) {
                  this.chosen = b; break;
                }
              }
            }
            if (api.keyPressed('a') || api.keyPressed('start')) this.chosen = this.sel;
            // Time out counts as wrong
            if (this.timer >= this.timeLimit && this.chosen < 0) this.chosen = -2;

            if (this.chosen !== -1) {
              var sc = SCENES[this.scene];
              var hit = (this.chosen === sc.c);
              if (hit) {
                this.correct++; api.addScore(20); api.audio.sfx('coin');
                api.burst(W / 2, 160, C.blossom, 10); this.feedback = 'HOW PERFECTLY SPLENDID!';
              } else {
                this.wrong++; api.audio.sfx('hurt'); api.flash(C.red, 0.18); api.shake(3, 0.18);
                this.feedback = this.chosen === -2 ? 'TOO SLOW, ANNE!' : 'TOO PLAIN FOR ANNE!';
              }
              this.phase = 'feedback'; this.feedbackT = 0;
              if (this.wrong >= this.maxWrong) { this.done = true; api.lose(); return; }
            }
          } else {
            this.feedbackT += dt;
            if (this.feedbackT > 1.1) {
              this.scene++;
              if (this.scene >= this.total) {
                this.done = true;
                if (this.correct >= 4) api.win(); else api.lose();
                return;
              }
              this.phase = 'choose'; this.chosen = -1; this.timer = 0; this.sel = 0; this.feedback = '';
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var sc = SCENES[this.scene];
          // Scene illustration
          drawScene1Bg(g, c, W, H, this.scene);
          // Anne in buggy at bottom of illustration
          var anneY = 200;
          g.rect(W / 2 - 22, anneY - 8, 44, 20, C.corkD);
          g.rect(W / 2 - 22, anneY - 10, 44, 5, C.branch);
          c.strokeStyle = C.branch; c.lineWidth = 2;
          c.beginPath(); c.arc(W / 2 - 14, anneY + 12, 9, 0, Math.PI * 2); c.stroke();
          c.beginPath(); c.arc(W / 2 + 14, anneY + 12, 9, 0, Math.PI * 2); c.stroke();
          drawAnne(g, W / 2 + 4, anneY, C.hair);
          // Scene label panel
          g.rect(0, 215, W, 16, C.dark);
          api.txtCFit(sc.label, W / 2, 219, 6, C.gold, false, W - 8);
          // Time bar
          var tbW = W - 20; var ratio = this.phase === 'choose' ? Math.max(0, 1 - this.timer / this.timeLimit) : 0;
          g.rect(10, 230, tbW, 5, C.dimD);
          g.rect(10, 230, tbW * ratio, 5, ratio > 0.35 ? C.rose : C.red);
          // Choice buttons
          for (var b = 0; b < 3; b++) {
            var state = 'normal';
            if (this.phase === 'feedback') {
              if (b === sc.c) state = 'correct';
              else if (b === this.chosen) state = 'wrong';
            } else if (b === this.sel) {
              state = 'selected';
            }
            drawBtn(api, this.btnX, this.btnY[b], this.btnW, this.btnH, sc.opts[b], state);
          }
          // Feedback text
          if (this.phase === 'feedback' && this.feedback) {
            var fc = this.feedback === 'HOW PERFECTLY SPLENDID!' ? C.gold : C.red;
            api.txtCFit(this.feedback, W / 2, 350, 7, fc, false, W - 20);
          }
          // Progress bar (scenes)
          g.rect(10, H - 14, W - 20, 8, C.dimD);
          g.rect(10, H - 14, (W - 20) * (this.scene / this.total), 8, C.rose);
          api.topBar(this.maxWrong - this.wrong, this.scene + 1 + '/' + this.total, this.correct + ' ✓');
        },
      },

      /* ════════════════════════════════════════════════════════════════════
       * CHAPTER 2: THE APOLOGY — Phrase Builder
       * ════════════════════════════════════════════════════════════════════ */
      {
        id: 'apology',
        name: "ANNE'S APOLOGY",
        sub: "FACE MRS. RACHEL LYNDE",
        icon: function (api, x, y) { ICONS[1](api, x, y); },
        intro: [
          'MRS. RACHEL LYNDE SAID',
          "ANNE WAS 'HOMELY AND SCRAWNY.'",
          'ANNE SNAPPED BACK TERRIBLY.',
          'Now Marilla insists',
          'Anne must apologize',
          'before Mrs. Lynde will forgive.',
        ],
        quote: '"I\'m dreadfully sorry...I said it and I meant it at the time." — Anne Shirley',
        help: 'TAP the phrase that sounds most SINCERE for Anne\'s apology!',
        winText: 'Mrs. Lynde relents. "Well, she certainly has spirit," she says, almost smiling.',
        loseText: 'Too many cold words! Mrs. Lynde remains unforgiving.',
        init: function (api) {
          this.round    = 0;
          this.misses   = 0;
          this.maxMisses = 2;
          this.phase    = 'choose';
          this.chosen   = -1;
          this.sel      = 0;
          this.feedbackT = 0;
          this.anger    = 3;
          this.good     = [];
          this.done     = false;
          this.timer    = 0;
          this.timeLimit = 10;
          this.feedback = '';
          this.btnW = api.W - 20; this.btnH = 36; this.btnX = 10;
          this.btn0Y = 330; this.btn1Y = 374;
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W;
          if (this.phase === 'choose') {
            this.timer += dt;
            if (api.keyPressed('up') || api.keyPressed('down')) { this.sel = 1 - this.sel; api.audio.sfx('blip'); }
            if (api.pointer.justDown) {
              var py = api.pointer.y;
              if (py >= this.btn0Y && py <= this.btn0Y + this.btnH) this.chosen = 0;
              else if (py >= this.btn1Y && py <= this.btn1Y + this.btnH) this.chosen = 1;
            }
            if (api.keyPressed('a') || api.keyPressed('start')) this.chosen = this.sel;
            if (this.timer >= this.timeLimit && this.chosen < 0) this.chosen = -2;

            if (this.chosen !== -1) {
              var rd = APOLOGY[this.round];
              var hit = (this.chosen === rd.c);
              if (hit) {
                this.good.push(rd.opts[rd.c]); api.addScore(25);
                api.audio.sfx('coin'); api.burst(W / 2, 280, C.blossom, 8);
                this.anger = Math.max(0, this.anger - 1); this.feedback = '♥ WELL SAID, ANNE!';
              } else {
                this.misses++; api.audio.sfx('hurt'); api.flash(C.red, 0.15);
                this.feedback = this.chosen === -2 ? 'ANNE HESITATES...' : 'TOO COLD!';
              }
              this.phase = 'feedback'; this.feedbackT = 0;
              if (this.misses >= this.maxMisses) { this.done = true; api.lose(); return; }
            }
          } else {
            this.feedbackT += dt;
            if (this.feedbackT > 1.2) {
              this.round++;
              if (this.round >= APOLOGY.length) { this.done = true; api.win(); return; }
              this.phase = 'choose'; this.chosen = -1; this.timer = 0; this.sel = 0; this.feedback = '';
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Parlor interior (dark wood panelling)
          g.rect(0, 0, W, H, '#180C08');
          g.rect(0, 14, W, H - 14, '#281408');
          // Floor
          g.rect(0, H * 0.62, W, H * 0.38, '#3A1808');
          for (var fl = 0; fl < 4; fl++) { g.rect(0, Math.round(H * 0.62) + fl * 20, W, 2, '#4A2010'); }
          // Window with curtains
          g.rect(W - 62, 20, 52, 64, '#182838');
          g.rect(W - 62, 20, 52, 64, C.water); // sky seen through
          g.rect(W - 62, 20, 10, 64, C.rose); g.rect(W - 20, 20, 10, 64, C.rose);
          g.rectO(W - 62, 20, 52, 64, C.corkD, 1);
          // Mrs Lynde (left, in chair)
          var lx = 62, ly = H * 0.58;
          g.rect(lx - 20, ly, 40, 20, '#1A0808'); // chair
          g.rect(lx - 22, ly - 10, 6, 30, '#2A1010'); g.rect(lx + 16, ly - 10, 6, 30, '#2A1010');
          drawLynde(g, c, lx, ly, this.anger);
          // Anne (right, standing)
          var ax = W - 68, ay = H * 0.60;
          drawAnne(g, ax, ay, C.hair);
          // Gathered apology text box
          g.rect(10, 168, W - 20, 80, '#100808');
          g.rectO(10, 168, W - 20, 80, C.gold, 1);
          api.txtCFit('ANNE SAYS:', 16, 176, 5, C.gold, false, 80);
          if (this.good.length === 0) {
            api.txtCFit('(CHOOSE ANNE\'S WORDS)', W / 2, 200, 5, C.grey, false, W - 28);
          } else {
            var lines = this.good.slice(-2);
            for (var li = 0; li < lines.length; li++) {
              api.txtCFit(lines[li], W / 2, 183 + li * 22, 5, C.blossom, false, W - 28);
            }
          }
          // Time bar
          var ratio = this.phase === 'choose' ? Math.max(0, 1 - this.timer / this.timeLimit) : 0;
          g.rect(10, 252, W - 20, 4, C.dimD);
          g.rect(10, 252, (W - 20) * ratio, 4, C.rose);
          // Prompt
          g.rect(0, 256, W, 16, C.dark);
          api.txtCFit('WHICH SOUNDS MORE SINCERE?', W / 2, 260, 5, C.cream, false, W - 10);
          // Buttons (2 options)
          var rnd = APOLOGY[this.round];
          var state0 = 'normal', state1 = 'normal';
          if (this.phase === 'feedback') {
            state0 = 0 === rnd.c ? 'correct' : (this.chosen === 0 ? 'wrong' : 'normal');
            state1 = 1 === rnd.c ? 'correct' : (this.chosen === 1 ? 'wrong' : 'normal');
          } else {
            if (this.sel === 0) state0 = 'selected';
            else state1 = 'selected';
          }
          drawBtn(api, this.btnX, this.btn0Y, this.btnW, this.btnH, rnd.opts[0], state0);
          drawBtn(api, this.btnX, this.btn1Y, this.btnW, this.btnH, rnd.opts[1], state1);
          // Feedback
          if (this.phase === 'feedback' && this.feedback) {
            var fc = this.feedback.indexOf('♥') >= 0 ? C.gold : C.red;
            api.txtCFit(this.feedback, W / 2, 318, 7, fc, false, W - 16);
          }
          // Miss indicators
          for (var m = 0; m < this.maxMisses; m++) {
            g.circle(10 + m * 18, H - 8, 6, m < this.misses ? C.red : C.rose);
          }
          api.topBar(this.maxMisses - this.misses, (this.round + 1) + '/4 PHRASES', this.good.length + ' ✓');
        },
      },

      /* ════════════════════════════════════════════════════════════════════
       * CHAPTER 3: THE BOSOM FRIEND — Memory Match
       * ════════════════════════════════════════════════════════════════════ */
      {
        id: 'diana',
        name: 'THE BOSOM FRIEND',
        sub: 'FIND YOUR KINDRED SPIRIT',
        icon: function (api, x, y) { ICONS[2](api, x, y); },
        intro: [
          'ANNE MET DIANA BARRY',
          'ON A SUMMER AFTERNOON.',
          '"Will you swear to be',
          'my bosom friend forever?"',
          'Match the kindred things',
          'the two girls shared!',
        ],
        quote: '"You\'re my idea of a kindred spirit." — Anne Shirley',
        help: 'TAP two cards to flip them! Match all 4 kindred pairs to win!',
        winText: 'Anne and Diana are bosom friends forever! Kindred spirits at last.',
        loseText: 'The clock runs out! Anne loses track of the pairs.',
        init: function (api) {
          var cards = [];
          for (var pi = 0; pi < PAIR_LABELS.length; pi++) {
            cards.push({ pair: pi, flipped: false, matched: false });
            cards.push({ pair: pi, flipped: false, matched: false });
          }
          // Shuffle Fisher-Yates
          for (var i = cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = cards[i]; cards[i] = cards[j]; cards[j] = tmp;
          }
          this.cards    = cards;
          this.flipped  = [];
          this.matched  = 0;
          this.timer    = 0;
          this.tlimit   = 38;
          this.delay    = 0;
          this.done     = false;
          this.moves    = 0;
          // Grid: 4 cols × 2 rows
          this.CW = 60; this.CH = 64; this.GAP = 4;
          this.GX = Math.round((api.W - 4 * (60 + 4) + 4) / 2);
          this.GY = 56;
          this.lastMatch = -1;
        },
        update: function (api, dt) {
          if (this.done) return;
          this.timer += dt;
          if (this.timer >= this.tlimit) { this.done = true; api.lose(); return; }

          if (this.delay > 0) {
            this.delay -= dt;
            if (this.delay <= 0) {
              this.flipped.forEach(function (idx) { this.cards[idx].flipped = false; }, this);
              this.flipped = []; this.delay = 0;
            }
            return;
          }

          if (api.pointer.justDown && this.flipped.length < 2) {
            var px = api.pointer.x, py = api.pointer.y;
            for (var i = 0; i < this.cards.length; i++) {
              var col = i % 4, row = Math.floor(i / 4);
              var cx = this.GX + col * (this.CW + this.GAP);
              var cy = this.GY + row * (this.CH + this.GAP);
              if (px >= cx && px <= cx + this.CW && py >= cy && py <= cy + this.CH &&
                  !this.cards[i].flipped && !this.cards[i].matched) {
                this.cards[i].flipped = true;
                this.flipped.push(i);
                api.audio.sfx('blip');
                this.moves++;
                break;
              }
            }
            if (this.flipped.length === 2) {
              var a = this.flipped[0], b = this.flipped[1];
              if (this.cards[a].pair === this.cards[b].pair) {
                this.cards[a].matched = true; this.cards[b].matched = true;
                this.matched++;
                this.lastMatch = this.cards[a].pair;
                api.addScore(30); api.audio.sfx('coin');
                api.burst(this.GX + (a % 4) * (this.CW + this.GAP) + this.CW / 2,
                           this.GY + Math.floor(a / 4) * (this.CH + this.GAP) + this.CH / 2, C.blossom, 8);
                this.flipped = [];
                if (this.matched >= 4) { this.done = true; api.win(); return; }
              } else {
                this.delay = 1.1; // show briefly, then flip back
              }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Sunny garden exterior
          g.rect(0, 0, W, H, C.sky);
          g.rect(0, H * 0.52, W, H * 0.48, C.grass);
          g.rect(0, H * 0.66, W, H * 0.34, C.grassL);
          // Flowers
          for (var fl = 0; fl < 8; fl++) {
            var fx = 14 + fl * 32, fy = Math.round(H * 0.66) - 6;
            g.circle(fx, fy, 5, fl % 2 === 0 ? C.blossom : C.gold);
            g.circle(fx, fy, 2, C.gold);
            g.rect(fx - 1, fy, 2, 8, C.leaf);
          }
          // Cards grid
          for (var i = 0; i < this.cards.length; i++) {
            var col = i % 4, row = Math.floor(i / 4);
            var cx = this.GX + col * (this.CW + this.GAP);
            var cy = this.GY + row * (this.CH + this.GAP);
            var card = this.cards[i];
            if (!card.flipped && !card.matched) {
              // Back of card
              g.rect(cx, cy, this.CW, this.CH, C.paper);
              g.rectO(cx, cy, this.CW, this.CH, C.corkD, 1);
              // Blossom pattern on back
              g.circle(cx + this.CW / 2, cy + this.CH / 2, 12, C.blossom);
              for (var p = 0; p < 5; p++) { var a = p * Math.PI * 0.4; g.circle(cx + this.CW / 2 + Math.cos(a) * 12, cy + this.CH / 2 + Math.sin(a) * 12, 7, C.blossom); }
              g.circle(cx + this.CW / 2, cy + this.CH / 2, 6, C.gold);
            } else {
              // Face up
              var bg2 = card.matched ? C.leaf : C.rose;
              g.rect(cx, cy, this.CW, this.CH, bg2);
              g.rectO(cx, cy, this.CW, this.CH, card.matched ? C.gold : C.white, card.matched ? 2 : 1);
              api.txtCFit(PAIR_LABELS[card.pair], cx + this.CW / 2, cy + this.CH / 2 - 2, 5, C.white, false, this.CW - 8);
            }
          }
          // Timer bar
          var timeRatio = Math.max(0, 1 - this.timer / this.tlimit);
          g.rect(10, H - 22, W - 20, 8, C.dimD);
          g.rect(10, H - 22, (W - 20) * timeRatio, 8, timeRatio > 0.3 ? C.rose : C.red);
          // Last match celebration
          if (this.lastMatch >= 0) {
            api.txtCFit(PAIR_LABELS[this.lastMatch] + ' MATCHED!', W / 2, H - 36, 6, C.gold, false, W - 20);
          }
          api.topBar(4 - this.matched, Math.ceil(this.tlimit - this.timer) + 's', this.matched + '/4 PAIRS');
        },
      },

      /* ════════════════════════════════════════════════════════════════════
       * CHAPTER 4: THE HAUNTED WOOD — Story Builder
       * ════════════════════════════════════════════════════════════════════ */
      {
        id: 'hauntedWood',
        name: 'THE HAUNTED WOOD',
        sub: "ANNE TELLS DIANA A GHOST STORY",
        icon: function (api, x, y) { ICONS[3](api, x, y); },
        intro: [
          "ANNE AND DIANA NAMED",
          "THE OLD SPRUCE GROVE",
          '"THE HAUNTED WOOD."',
          'That evening Anne told',
          'Diana the most dramatic',
          'ghost story imaginable.',
        ],
        quote: '"The Haunted Wood was haunted by a very persistent imagination." — L. M. Montgomery',
        help: 'TAP the MORE DRAMATIC word to fill each blank in Anne\'s ghost story!',
        winText: 'Diana screams delightfully! Anne\'s ghost story is a masterpiece.',
        loseText: 'Too plain! Diana yawns. Anne\'s ghost story falls flat.',
        init: function (api) {
          this.blank    = 0;
          this.total    = STORY_BLANKS.length;
          this.phase    = 'choose';
          this.chosen   = -1;
          this.sel      = 0;
          this.correct  = 0;
          this.wrong    = 0;
          this.maxWrong = 2;
          this.feedbackT = 0;
          this.timer    = 0;
          this.timeLimit = 9;
          this.done     = false;
          this.chosenWords = [];
          this.feedback = '';
          this.btnW = api.W - 20; this.btnH = 36; this.btnX = 10;
          this.btn0Y = 330; this.btn1Y = 374;
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W;
          if (this.phase === 'choose') {
            this.timer += dt;
            if (api.keyPressed('up') || api.keyPressed('down')) { this.sel = 1 - this.sel; api.audio.sfx('blip'); }
            if (api.pointer.justDown) {
              var py = api.pointer.y;
              if (py >= this.btn0Y && py <= this.btn0Y + this.btnH) this.chosen = 0;
              else if (py >= this.btn1Y && py <= this.btn1Y + this.btnH) this.chosen = 1;
            }
            if (api.keyPressed('a') || api.keyPressed('start')) this.chosen = this.sel;
            if (this.timer >= this.timeLimit && this.chosen < 0) this.chosen = -2;

            if (this.chosen !== -1) {
              var bl = STORY_BLANKS[this.blank];
              var hit = (this.chosen === bl.c);
              var word = (this.chosen >= 0 && this.chosen < 2) ? bl.opts[this.chosen] : '...';
              this.chosenWords.push({ word: word, good: hit });
              if (hit) {
                this.correct++; api.addScore(20); api.audio.sfx('coin');
                api.burst(W / 2, 200, C.shadow, 8); this.feedback = 'HOW DRAMATIC!';
              } else {
                this.wrong++; api.audio.sfx('hurt'); api.flash(C.grey, 0.15);
                this.feedback = 'TOO PLAIN FOR ANNE!';
              }
              this.phase = 'feedback'; this.feedbackT = 0;
              if (this.wrong >= this.maxWrong) { this.done = true; api.lose(); return; }
            }
          } else {
            this.feedbackT += dt;
            if (this.feedbackT > 1.1) {
              this.blank++;
              if (this.blank >= this.total) {
                this.done = true;
                if (this.correct >= 3) api.win(); else api.lose();
                return;
              }
              this.phase = 'choose'; this.chosen = -1; this.timer = 0; this.sel = 0; this.feedback = '';
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var t = api.t;
          // Dark haunted wood night
          g.rect(0, 0, W, H, '#080410');
          // Moon
          g.circle(W - 36, 30, 18, C.cream); g.circle(W - 30, 26, 16, '#080410');
          // Moonlight
          c.globalAlpha = 0.12; g.circle(W / 2, H / 2, 160, C.cream); c.globalAlpha = 1;
          // Spooky trees
          [15, 55, 90, 140, 195, 230, 258].forEach(function (tx) {
            var th = 90 + ((tx * 7) % 60);
            c.fillStyle = '#0C1408';
            c.beginPath(); c.moveTo(tx - 14, H); c.lineTo(tx, H - th); c.lineTo(tx + 14, H); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(tx - 10, H - th * 0.4); c.lineTo(tx, H - th * 0.65); c.lineTo(tx + 10, H - th * 0.4); c.closePath(); c.fill();
          });
          // Anne and Diana seated (storytelling)
          var seated = H * 0.68;
          // Diana (listener, wide eyes)
          g.circle(W * 0.68, seated - 20, 8, C.skin);
          g.circle(W * 0.68, seated - 28, 7, C.dark);
          g.rect(W * 0.68 - 9, seated - 12, 18, 20, C.blue);
          // Diana's eyes wide
          g.circle(W * 0.68 - 3, seated - 22, 3, C.dark); g.circle(W * 0.68 - 3, seated - 22, 1, C.white);
          g.circle(W * 0.68 + 3, seated - 22, 3, C.dark); g.circle(W * 0.68 + 3, seated - 22, 1, C.white);
          // Anne (storyteller)
          var ax = W * 0.30, ay = seated;
          drawAnne(g, ax, ay, C.hair);
          // Lantern
          g.circle(ax + 18, ay - 14, 8, C.gold); g.circle(ax + 18, ay - 14, 5, C.goldL);
          // Story text box
          g.rect(8, 160, W - 16, 100, '#0A0410');
          g.rectO(8, 160, W - 16, 100, C.shadow, 1);
          g.rectO(10, 162, W - 20, 96, '#481870', 1);
          api.txtCFit('ANNE\'S STORY:', 14, 170, 5, C.roseL, false, 90);
          // Build story with chosen words
          var bl = STORY_BLANKS[this.blank];
          var storyY = 186;
          for (var si = 0; si < this.chosenWords.length && si < 3; si++) {
            var cw2 = this.chosenWords[si];
            api.txtCFit('"...' + STORY_BLANKS[si].opts[STORY_BLANKS[si].c] + '..."',
              W / 2, storyY + si * 18, 5, cw2.good ? C.blossom : C.grey, false, W - 28);
          }
          // Current blank prompt
          api.txtCFit(bl.before + '_____' + bl.after, W / 2, 245, 5, C.cream, false, W - 20);
          // Time bar
          var ratio = this.phase === 'choose' ? Math.max(0, 1 - this.timer / this.timeLimit) : 0;
          g.rect(10, 266, W - 20, 4, C.dimD);
          g.rect(10, 266, (W - 20) * ratio, 4, C.roseL);
          // Prompt
          g.rect(0, 272, W, 16, '#0A0410');
          api.txtCFit('WHICH FILLS THE BLANK?', W / 2, 276, 5, C.blossom, false, W - 10);
          // Buttons
          var s0 = 'normal', s1 = 'normal';
          if (this.phase === 'feedback') {
            s0 = (0 === bl.c) ? 'correct' : (this.chosen === 0 ? 'wrong' : 'normal');
            s1 = (1 === bl.c) ? 'correct' : (this.chosen === 1 ? 'wrong' : 'normal');
          } else { if (this.sel === 0) s0 = 'selected'; else s1 = 'selected'; }
          drawBtn(api, this.btnX, this.btn0Y, this.btnW, this.btnH, bl.opts[0], s0);
          drawBtn(api, this.btnX, this.btn1Y, this.btnW, this.btnH, bl.opts[1], s1);
          if (this.phase === 'feedback' && this.feedback) {
            api.txtCFit(this.feedback, W / 2, 316, 7, this.feedback === 'HOW DRAMATIC!' ? C.gold : C.grey, false, W - 16);
          }
          api.topBar(this.maxWrong - this.wrong, (this.blank + 1) + '/4 BLANKS', this.correct + ' ✓');
        },
      },

      /* ════════════════════════════════════════════════════════════════════
       * CHAPTER 5: THE AVERY SCHOLARSHIP — Academic Speed Race vs Gilbert
       * ════════════════════════════════════════════════════════════════════ */
      {
        id: 'scholarship',
        name: 'THE AVERY SCHOLARSHIP',
        sub: 'ANNE VS. GILBERT BLYTHE',
        icon: function (api, x, y) { ICONS[4](api, x, y); },
        intro: [
          'ANNE STUDIED HARD.',
          'GILBERT BLYTHE STUDIED HARDER.',
          'Only one could win',
          'the Avery Scholarship.',
          'Answer faster than Gilbert',
          'to prove your brilliance!',
        ],
        quote: '"I\'m going to win the Avery if hard work can do it." — Anne Shirley',
        help: 'TAP LEFT or RIGHT to choose answer A or B — FASTER THAN GILBERT!',
        winText: 'Anne wins the Avery Scholarship! Gilbert tips his hat with genuine respect.',
        loseText: 'Gilbert answers too quickly. Study harder next time, Anne!',
        init: function (api) {
          this.question = 0;
          this.total    = QUESTIONS.length;
          this.correct  = 0;
          this.wrong    = 0;
          this.phase    = 'question'; // 'question'|'feedback'|'done'
          this.chosen   = -1;
          this.gilbertT = 0;
          this.gilbertBar = 5.8; // seconds Gilbert takes to answer
          this.feedbackT = 0;
          this.done     = false;
          this.feedback = '';
          this.sel      = 0;
          this.halfW    = Math.floor(api.W / 2);
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W;
          if (this.phase === 'question') {
            this.gilbertT += dt;
            // Keyboard
            if (api.keyPressed('left'))  { this.sel = 0; this.chosen = 0; }
            if (api.keyPressed('right')) { this.sel = 1; this.chosen = 1; }
            if (api.keyPressed('a') || api.keyPressed('start')) this.chosen = this.sel;
            // Touch: left half = A, right half = B
            if (api.pointer.justDown) {
              this.chosen = api.pointer.x < this.halfW ? 0 : 1;
            }
            // Gilbert answers
            if (this.gilbertT >= this.gilbertBar && this.chosen < 0) {
              this.chosen = 1 - QUESTIONS[this.question].c; // Gilbert gets it wrong on purpose
              this.feedback = 'GILBERT ANSWERS FIRST!';
              this.wrong++;
              api.audio.sfx('hurt'); api.shake(3, 0.2);
              this.phase = 'feedback'; this.feedbackT = 0;
              if (this.wrong >= 3) { this.done = true; api.lose(); return; }
              return;
            }

            if (this.chosen >= 0) {
              var q = QUESTIONS[this.question];
              var hit = (this.chosen === q.c);
              if (hit) {
                this.correct++; api.addScore(25); api.audio.sfx('coin');
                api.burst(W / 2, 200, C.gold, 10); this.feedback = 'CORRECT!';
              } else {
                this.wrong++; api.audio.sfx('hurt'); api.flash(C.red, 0.2);
                this.feedback = 'WRONG ANSWER!';
                if (this.wrong >= 3) { this.done = true; api.lose(); return; }
              }
              this.phase = 'feedback'; this.feedbackT = 0;
            }
          } else if (this.phase === 'feedback') {
            this.feedbackT += dt;
            if (this.feedbackT > 1.1) {
              this.question++;
              if (this.question >= this.total) {
                this.done = true;
                if (this.correct >= 4) api.win(); else api.lose();
                return;
              }
              this.phase = 'question'; this.chosen = -1; this.gilbertT = 0;
              this.gilbertBar = Math.max(3.5, 5.8 - this.question * 0.25);
              this.feedback = ''; this.sel = 0;
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var q = QUESTIONS[this.question];
          // Academy hall interior
          g.rect(0, 0, W, H, '#100808');
          g.rect(0, 14, W, H - 14, '#180C08');
          // Marble floor
          g.rect(0, H * 0.72, W, H * 0.28, '#1A1010');
          // Columns
          for (var col = 0; col < 4; col++) {
            var cx = 18 + col * 76;
            g.rect(cx, 14, 14, H * 0.72, '#201010');
            g.rect(cx, 14, 4, H * 0.72, '#281818');
          }
          // Pediment
          c.fillStyle = '#200E08';
          c.beginPath(); c.moveTo(0, 14); c.lineTo(W / 2, -10); c.lineTo(W, 14); c.closePath(); c.fill();
          // Banner
          g.rect(W / 2 - 56, 22, 112, 22, '#281428');
          g.rectO(W / 2 - 56, 22, 112, 22, C.gold, 1);
          api.txtCFit('AVERY SCHOLARSHIP EXAM', W / 2, 27, 5, C.gold, false, 108);
          // Anne and Gilbert at desks
          var deskY = H * 0.60;
          // Anne (left desk)
          g.rect(18, deskY, 60, 8, C.creamD);
          drawAnne(g, 48, deskY, C.hair);
          api.txtC('ANNE', 48, deskY + 14, 5, C.blossom, false);
          // Gilbert (right desk)
          g.rect(W - 78, deskY, 60, 8, C.creamD);
          // Gilbert sprite
          g.circle(W - 48, deskY - 22, 9, C.skin);
          g.circle(W - 48, deskY - 30, 8, '#5A3018');
          g.rect(W - 57, deskY - 13, 18, 20, '#2A4878');
          api.txtC('GILBERT', W - 48, deskY + 14, 5, C.grey, false);
          // Gilbert's countdown bar
          var gilbRatio = Math.max(0, 1 - this.gilbertT / this.gilbertBar);
          g.rect(W - 78, deskY - 42, 60, 6, C.dimD);
          g.rect(W - 78, deskY - 42, 60 * gilbRatio, 6, gilbRatio > 0.4 ? C.grey : C.red);
          api.txtCFit('GILBERT THINKING...', W - 48, deskY - 52, 4, C.grey, false, 68);
          // Question box
          g.rect(8, 138, W - 16, 52, '#0C0808');
          g.rectO(8, 138, W - 16, 52, C.gold, 1);
          api.txtCFit('Q' + (this.question + 1) + ': ' + q.q, W / 2, 157, 5, C.cream, false, W - 24);
          // Answer buttons (left half A, right half B)
          var aState = 'normal', bState = 'normal';
          if (this.phase === 'feedback') {
            aState = 0 === q.c ? 'correct' : (this.chosen === 0 ? 'wrong' : 'normal');
            bState = 1 === q.c ? 'correct' : (this.chosen === 1 ? 'wrong' : 'normal');
          } else {
            if (this.sel === 0) aState = 'selected'; else bState = 'selected';
          }
          drawBtn(api, 8, 196, this.halfW - 12, 36, 'A: ' + q.opts[0], aState);
          drawBtn(api, this.halfW + 4, 196, this.halfW - 12, 36, 'B: ' + q.opts[1], bState);
          api.txtCFit('← TAP LEFT            TAP RIGHT →', W / 2, 238, 4, C.grey, false, W - 16);
          // Score and feedback
          if (this.feedback) {
            var fc = this.feedback === 'CORRECT!' ? C.gold : C.red;
            api.txtCFit(this.feedback, W / 2, 262, 8, fc, false, W - 16);
          }
          // Score bars
          for (var s = 0; s < this.total; s++) {
            var sx = 10 + s * 42;
            g.rect(sx, H - 22, 36, 8, s < this.question ? (s < this.correct ? C.rose : C.red) : C.dimD);
          }
          api.topBar(3 - this.wrong, (this.question + 1) + '/' + this.total, this.correct + ' CORRECT');
        },
      },

    ], // end chapters
  }); // end RetroSaga.create

}());
