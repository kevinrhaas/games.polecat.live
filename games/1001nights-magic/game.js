/* ============================================================================
 * A THOUSAND NIGHTS — One Thousand and One Nights (Arabic folklore)
 *   A point-and-click branching adventure: Scheherazade weaves her tale by
 *   choosing story fragments, memory-paths, hidden gold, bold commands, and a
 *   charted course across the night sky — every choice buys time before dawn.
 *   1. THE SULTAN'S EAR    — tap story-fragment cards to fill the suspense meter
 *   2. THE ROC'S SHADOW    — watch, then repeat the safe island path (memory)
 *   3. OPEN SESAME         — spot & tap the true gold jars before the thieves return
 *   4. THE GENIE'S WISH    — choose bold or safe commands; favor is not limitless
 *   5. THE FLYING CARPET   — chart a course across a night-sky lattice to the Sultan
 * Built on RetroSaga (js/saga.js) + RetroEngine. Rebuilt from a dodge/steer
 * arcade set into a genuine point-and-click branching adventure (REBUILD_QUEUE #25).
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;
  var rand  = Retro.util.rand;
  var randI = Retro.util.randInt;

  /* ─── Arabian Nights Palette ─── */
  var C = {
    night:   '#06040e',
    indigo:  '#0c0820',
    dkblue:  '#100c2c',
    blue:    '#1a1440',
    midblue: '#241a50',
    star:    '#e8e0c8',
    moon:    '#f0e8c0',
    gold:    '#d4900a',
    goldL:   '#e8b020',
    amber:   '#f0c840',
    copper:  '#b06820',
    teal:    '#00b8a0',
    tealL:   '#20d4ba',
    cyan:    '#4de8d8',
    ruby:    '#cc1844',
    rubyL:   '#e83060',
    gem:     '#9b3ccc',
    sand:    '#c89038',
    sandL:   '#e0b058',
    dust:    '#8a6030',
    wall:    '#2a1e50',
    wallL:   '#3a2a6a',
    dome:    '#1a1438',
    smoke:   '#6a50c0',
    smokeL:  '#9a80e0',
    silk:    '#e85898',
    ivory:   '#f8f0d8',
    cream:   '#e8dcc4',
    parch:   '#d0b878',
    danger:  '#ee1e3a',
    shadow:  '#040212',
  };

  /* ─── Branching-story tags, tallied across the whole playthrough ─── */
  var TAGS = { brave: 0, clever: 0, wise: 0, mercy: 0 };
  function dominantTag() {
    var order = ['brave', 'clever', 'wise', 'mercy'], best = order[0], bv = -1;
    for (var i = 0; i < order.length; i++) { var v = TAGS[order[i]] || 0; if (v > bv) { bv = v; best = order[i]; } }
    return best;
  }
  var FINALE_TEXT = {
    brave: [
      'THE SULTAN RISES,',
      'HIS BLADE SET DOWN.',
      '',
      '"No one at my court',
      ' carries your courage.',
      ' Stay — and rule',
      ' beside me."',
    ],
    clever: [
      'THE SULTAN LAUGHS —',
      'FOR THE FIRST TIME',
      'IN A THOUSAND NIGHTS.',
      '',
      '"Your wit outran every',
      ' vizier I have known.',
      ' Keep me guessing."',
    ],
    wise: [
      'THE SULTAN SETS DOWN',
      'HIS SWORD FOREVER.',
      '',
      '"One thousand and one',
      ' nights, and at last',
      ' I understand: wisdom',
      ' outlasts anger."',
    ],
    mercy: [
      'THE SULTAN WEEPS,',
      'THEN OPENS THE',
      'PALACE GATES.',
      '',
      '"Your mercy freed more',
      ' than a storyteller',
      ' tonight."',
    ],
  };

  /* ─── Small reusable helpers ─── */
  function shuffleArr(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function hitRects(px, py, rects) {
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
    }
    return -1;
  }
  function hitPoints(px, py, pts, r) {
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], dx = px - p.x, dy = py - p.y;
      if (dx * dx + dy * dy <= r * r) return i;
    }
    return -1;
  }
  function drawStarGlyph(c, x, y, r) {
    c.beginPath();
    for (var k = 0; k < 5; k++) {
      var a = -Math.PI / 2 + k * (Math.PI * 2 / 5);
      var xx = x + Math.cos(a) * r, yy = y + Math.sin(a) * r;
      if (k === 0) c.moveTo(xx, yy); else c.lineTo(xx, yy);
      var a2 = a + (Math.PI * 2 / 10);
      var xx2 = x + Math.cos(a2) * (r * 0.45), yy2 = y + Math.sin(a2) * (r * 0.45);
      c.lineTo(xx2, yy2);
    }
    c.closePath(); c.fill();
  }
  function tagGlyph(api, tagName, x, y, color) {
    var c = api.ctx;
    c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 1.5;
    if (tagName === 'brave') {
      c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x, y + 6); c.stroke();
      c.beginPath(); c.moveTo(x - 5, y + 2); c.lineTo(x + 5, y + 2); c.stroke();
      c.beginPath(); c.arc(x, y - 8, 2, 0, Math.PI * 2); c.fill();
    } else if (tagName === 'clever') {
      c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(x, y, 1.6, 0, Math.PI * 2); c.fill();
    } else if (tagName === 'wise') {
      drawStarGlyph(c, x, y, 6);
    } else {
      c.beginPath();
      c.moveTo(x, y + 5);
      c.bezierCurveTo(x - 8, y - 4, x - 3, y - 9, x, y - 3);
      c.bezierCurveTo(x + 3, y - 9, x + 8, y - 4, x, y + 5);
      c.fill();
    }
  }

  /* ─── Emblem: magic lamp with genie smoke ─── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    var t = api.t !== undefined ? api.t : (Date.now() * 0.001);
    var i;
    for (i = 0; i < 3; i++) {
      var sw = 10 + i * 6;
      var sx = cx + Math.sin(t * 1.4 + i * 1.1) * (6 + i * 4);
      var sy = cy - 28 - i * 12;
      c.globalAlpha = 0.18 + 0.1 * Math.sin(t * 2 + i);
      c.fillStyle = C.smokeL;
      c.beginPath(); c.arc(sx, sy, sw, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
    c.globalAlpha = 0.7;
    c.fillStyle = C.smoke;
    c.beginPath(); c.arc(cx, cy - 44, 12, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    g.circle(cx, cy - 44, 8, C.smokeL);
    c.fillStyle = C.gold;
    c.beginPath(); c.ellipse(cx, cy - 4, 20, 10, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = C.goldL;
    c.beginPath();
    c.moveTo(cx + 16, cy - 4);
    c.quadraticCurveTo(cx + 28, cy - 12, cx + 22, cy - 18);
    c.quadraticCurveTo(cx + 14, cy - 10, cx + 10, cy - 4);
    c.closePath(); c.fill();
    c.fillStyle = C.copper;
    c.beginPath(); c.ellipse(cx, cy + 6, 16, 6, 0, 0, Math.PI * 2); c.fill();
    c.lineWidth = 4; c.strokeStyle = C.gold;
    c.beginPath(); c.arc(cx - 18, cy - 4, 8, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
    c.globalAlpha = 0.8 + 0.15 * Math.sin(t * 5);
    c.fillStyle = C.amber;
    c.beginPath(); c.ellipse(cx + 20, cy - 22, 4, 7, -0.3, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    for (var j = 0; j < 6; j++) {
      var sa = j / 6 * Math.PI * 2 + t * 0.5;
      var srx = cx + Math.cos(sa) * 44, sry = cy - 4 + Math.sin(sa) * 28;
      c.globalAlpha = 0.3 + 0.35 * Math.sin(t * 2.2 + j);
      c.fillStyle = C.amber;
      c.beginPath(); c.arc(srx, sry, 2, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }

  /* ─── Scenery: Arabian night with palace silhouettes ─── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    var sky = c.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, C.night);
    sky.addColorStop(0.5, C.indigo);
    sky.addColorStop(1, C.dkblue);
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    var i;
    for (i = 0; i < 55; i++) {
      var sx = (i * 53 + 7) % W, sy = (i * 97 + 3) % (H * 0.55);
      var sa = 0.15 + 0.55 * Math.abs(Math.sin(t * 1.2 + i * 0.7));
      c.globalAlpha = sa;
      c.fillStyle = C.star;
      c.fillRect(sx, sy, (i % 3 === 0) ? 2 : 1, (i % 3 === 0) ? 2 : 1);
    }
    c.globalAlpha = 1;
    c.globalAlpha = 0.88;
    c.fillStyle = C.moon;
    c.beginPath(); c.arc(50, 44, 22, 0, Math.PI * 2); c.fill();
    c.fillStyle = C.indigo;
    c.beginPath(); c.arc(60, 40, 17, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    var horizY = H * 0.60;
    c.fillStyle = '#0e0826';
    c.beginPath(); c.moveTo(0, horizY + 20);
    for (var dx = 0; dx <= W; dx += 38) {
      c.quadraticCurveTo(dx + 19, horizY - 10 + (dx * 7 + 4) % 26, dx + 38, horizY + 12 + (dx * 3) % 16);
    }
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    var minarets = [[26, 78], [66, 106], [132, 92], [182, 114], [228, 82], [256, 68]];
    for (var m = 0; m < minarets.length; m++) {
      var mx = minarets[m][0], mh = minarets[m][1], my = horizY - mh;
      c.fillStyle = '#0e0826';
      c.fillRect(mx - 8, my, 16, mh);
      c.beginPath(); c.arc(mx, my, 11, Math.PI, 0); c.fill();
      c.beginPath();
      c.moveTo(mx - 4, my - 9);
      c.lineTo(mx, my - 21);
      c.lineTo(mx + 4, my - 9);
      c.closePath(); c.fill();
      c.globalAlpha = 0.45;
      c.fillStyle = C.goldL;
      c.beginPath(); c.arc(mx, my - 23, 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = C.dkblue;
      c.beginPath(); c.arc(mx + 1.5, my - 24, 2, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    }
    c.fillStyle = '#0a0620';
    c.fillRect(0, horizY + 12, W, H - horizY - 12);
    if (scene === 'boot' || scene === 'menu') {
      for (var li = 0; li < 6; li++) {
        var lx = 22 + li * 44, ly = horizY - 8;
        var la = 0.25 + 0.45 * Math.abs(Math.sin(t * 1.8 + li * 1.3));
        c.globalAlpha = la;
        c.fillStyle = C.amber;
        c.beginPath(); c.arc(lx, ly, 3.5, 0, Math.PI * 2); c.fill();
        c.globalAlpha = la * 0.18;
        c.fillStyle = C.gold;
        c.beginPath(); c.arc(lx, ly, 11, 0, Math.PI * 2); c.fill();
      }
      c.globalAlpha = 1;
    }
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(4,2,12,.84)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Chapter-select: 5 hanging lanterns scattered in a bazaar ─── */
  var CARD_LAYOUT = [
    { x: 14,  y: 84,  w: 110, h: 68 },
    { x: 146, y: 72,  w: 110, h: 68 },
    { x: 76,  y: 190, w: 118, h: 68 },
    { x: 12,  y: 316, w: 110, h: 68 },
    { x: 148, y: 304, w: 110, h: 68 },
  ];

  function drawLantern(api, info, t) {
    var c = api.ctx, g = api.gfx;
    var ch = info.ch, x = info.x, y = info.y, w = info.w, h = info.h;
    var sel = info.sel, done = info.done;
    var cx = x + w / 2, cy = y + h / 2;
    c.strokeStyle = C.copper; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(cx, y - 10); c.lineTo(cx, y + 4); c.stroke();
    for (var ci = 0; ci < 3; ci++) {
      c.strokeStyle = C.goldL; c.lineWidth = 1;
      c.beginPath(); c.ellipse(cx, y - 8 + ci * 4, 2, 3, 0, 0, Math.PI * 2); c.stroke();
    }
    if (sel || done) {
      c.globalAlpha = sel ? (0.22 + 0.12 * Math.sin(t * 3)) : 0.10;
      c.fillStyle = done ? C.teal : C.amber;
      c.beginPath(); c.ellipse(cx, cy, w * 0.58, h * 0.54, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    }
    c.fillStyle = done ? '#0a2018' : (sel ? '#261608' : '#140c22');
    c.strokeStyle = done ? C.teal : (sel ? C.amber : C.copper);
    c.lineWidth = sel ? 2 : 1.5;
    c.beginPath();
    c.moveTo(cx, y + 4);
    c.lineTo(x + w - 8, y + h * 0.28);
    c.lineTo(x + w - 8, y + h * 0.72);
    c.lineTo(cx, y + h - 5);
    c.lineTo(x + 8, y + h * 0.72);
    c.lineTo(x + 8, y + h * 0.28);
    c.closePath(); c.fill(); c.stroke();
    if (!info.locked) {
      c.fillStyle = done ? 'rgba(0,184,160,.20)' : 'rgba(212,144,10,.16)';
      c.beginPath();
      c.moveTo(cx, y + 9);
      c.lineTo(x + w - 13, y + h * 0.30);
      c.lineTo(x + w - 13, y + h * 0.70);
      c.lineTo(cx, y + h - 9);
      c.lineTo(x + 13, y + h * 0.70);
      c.lineTo(x + 13, y + h * 0.30);
      c.closePath(); c.fill();
    }
    c.fillStyle = C.gold;
    c.fillRect(cx - 13, y + 2, 26, 5);
    c.fillRect(cx - 13, y + h - 7, 26, 5);
    g.circle(cx - 9, y + 4, 2.5, C.amber);
    g.circle(cx + 9, y + 4, 2.5, C.amber);
    g.circle(cx - 9, y + h - 4, 2.5, C.amber);
    g.circle(cx + 9, y + h - 4, 2.5, C.amber);
    if (ch.icon && !info.locked) ch.icon(api, x + 26, cy - 2);
    var nameCol = done ? C.teal : (sel ? C.amber : C.goldL);
    api.txtCFit(ch.name, cx + 12, cy - 12, 7, nameCol, true, w - 52);
    api.txtCFit(ch.sub || '', cx + 12, cy + 4, 6, sel ? C.parch : C.dust, true, w - 52);
    if (done) {
      c.globalAlpha = 0.88; c.fillStyle = C.teal;
      c.font = "bold 10px 'Press Start 2P'";
      c.textAlign = 'right'; c.textBaseline = 'top';
      c.fillText('☽', x + w - 8, y + 8);
      c.textAlign = 'left'; c.globalAlpha = 1;
    }
    if (sel) {
      c.fillStyle = C.amber;
      c.beginPath(); c.moveTo(x + 2, cy); c.lineTo(x - 7, cy - 5); c.lineTo(x - 7, cy + 5); c.closePath(); c.fill();
    }
  }

  /* ============================================================
   * Chapter 1 data — story-fragment deck (choose-your-path cards)
   * ============================================================ */
  var FRAGMENT_POOL = [
    { label: "THE MERCHANT'S RUIN", tag: 'brave',  val: 20 },
    { label: "THE THIEF'S BARGAIN", tag: 'clever', val: 22 },
    { label: "THE DJINN'S OATH",    tag: 'wise',   val: 24 },
    { label: "THE BEGGAR'S KINDNESS", tag: 'mercy', val: 18 },
    { label: 'THE CARAVAN AMBUSH',  tag: 'brave',  val: 22 },
    { label: 'THE RIDDLE UNTOLD',   tag: 'clever', val: 20 },
    { label: "THE HERMIT'S WARNING", tag: 'wise',  val: 18 },
    { label: "THE ORPHAN'S PLEA",   tag: 'mercy',  val: 22 },
    { label: 'THE STORM AT SEA',    tag: 'brave',  val: 18 },
    { label: 'THE FALSE VIZIER',    tag: 'clever', val: 18 },
    { label: 'A KING FORGIVEN',     tag: 'mercy',  val: 20 },
    { label: "THE STARS' COUNSEL",  tag: 'wise',   val: 22 },
  ];
  var FRAG_CARDS = [
    { x: 12,  y: 356, w: 78, h: 96 },
    { x: 96,  y: 356, w: 78, h: 96 },
    { x: 180, y: 356, w: 78, h: 96 },
  ];
  function nextFragment(ch) {
    if (!ch.pool || !ch.pool.length) ch.pool = shuffleArr(FRAGMENT_POOL.slice());
    return ch.pool.pop();
  }

  /* ============================================================
   * Chapter 2 data — island memory path
   * ============================================================ */
  var ISLANDS = [
    { x: 52,  y: 150 }, { x: 150, y: 118 }, { x: 222, y: 186 },
    { x: 96,  y: 250 }, { x: 186, y: 288 },
  ];
  function startSinbadRound(ch) {
    ch.sequence = [];
    for (var i = 0; i < ch.seqLen; i++) ch.sequence.push(randI(0, ISLANDS.length - 1));
    ch.phase = 'show'; ch.showIdx = -1; ch.showT = 0.4;
  }

  /* ============================================================
   * Chapter 3 data — spot the true gold jars
   * ============================================================ */
  var JARS = [
    { x: 50, y: 170 }, { x: 135, y: 170 }, { x: 220, y: 170 },
    { x: 50, y: 270 }, { x: 135, y: 270 }, { x: 220, y: 270 },
  ];
  function startAlibabaRound(ch) {
    var idxs = [0, 1, 2, 3, 4, 5]; shuffleArr(idxs);
    ch.trueIdx = [idxs[0], idxs[1]]; ch.foundIdx = [];
    ch.phase = 'reveal'; ch.revealT = 1.1; ch.roundT = ch.roundDur || 7;
  }

  /* ============================================================
   * Chapter 4 data — command the genie (branching choices)
   * ============================================================ */
  var WISH_ROUNDS = [
    { situation: "JAFAR'S SOLDIERS STORM THE GATE.", options: [
      { label: 'RAISE A WALL OF SAND', hint: 'Steady & sure', cost: 0, tag: 'wise' },
      { label: 'CALL DOWN DESERT FIRE', hint: 'Bold — costs favor', cost: 1, tag: 'brave' },
      { label: 'WHISPER A CLEVER RUSE', hint: 'Sly — costs favor', cost: 1, tag: 'clever' },
    ] },
    { situation: 'THE VIZIER SENDS SPIES IN DISGUISE.', options: [
      { label: 'POST WATCHFUL GUARDS', hint: 'Steady & sure', cost: 0, tag: 'wise' },
      { label: 'UNLEASH A ROARING WIND', hint: 'Bold — costs favor', cost: 1, tag: 'brave' },
      { label: 'SET A TRAIL OF FALSE GOLD', hint: 'Sly — costs favor', cost: 1, tag: 'clever' },
    ] },
    { situation: 'A SIEGE TOWER APPROACHES THE WALL.', options: [
      { label: 'REINFORCE THE GATE', hint: 'Steady & sure', cost: 0, tag: 'wise' },
      { label: 'HURL A BOULDER OF FLAME', hint: 'Bold — costs favor', cost: 1, tag: 'brave' },
      { label: "COLLAPSE THEIR LADDERS", hint: 'Sly — costs favor', cost: 1, tag: 'clever' },
    ] },
    { situation: 'JAFAR HIMSELF DEMANDS THE LAMP.', options: [
      { label: 'OFFER A HUMBLE BARGAIN', hint: 'Steady & sure', cost: 0, tag: 'mercy' },
      { label: 'STAND AND FACE HIM', hint: 'Bold — costs favor', cost: 1, tag: 'brave' },
      { label: 'VANISH IN A PLUME OF SMOKE', hint: 'Sly — costs favor', cost: 1, tag: 'clever' },
    ] },
    { situation: 'THE PALACE GUARD WAVERS IN FEAR.', options: [
      { label: 'SPEAK WORDS OF COMFORT', hint: 'Steady & sure', cost: 0, tag: 'mercy' },
      { label: 'RALLY THEM WITH A ROAR', hint: 'Bold — costs favor', cost: 1, tag: 'brave' },
      { label: 'SHOW THEM A CLEVER SIGN', hint: 'Sly — costs favor', cost: 1, tag: 'clever' },
    ] },
    { situation: 'DAWN NEARS — ONE LAST ASSAULT.', options: [
      { label: 'HOLD THE LINE TOGETHER', hint: 'Steady & sure', cost: 0, tag: 'wise' },
      { label: "UNLEASH THE GENIE'S FURY", hint: 'Bold — costs favor', cost: 1, tag: 'brave' },
      { label: 'SPARE THE FLEEING SOLDIERS', hint: 'Sly — costs favor', cost: 1, tag: 'mercy' },
    ] },
  ];
  var WISH_CARDS = [
    { x: 14, y: 210, w: 242, h: 64 },
    { x: 14, y: 284, w: 242, h: 64 },
    { x: 14, y: 358, w: 242, h: 64 },
  ];

  /* ============================================================
   * Chapter 5 data — chart the sky (route-planning lattice)
   * ============================================================ */
  var LATTICE_COLS = 5, LATTICE_ROWS = 3;
  var LAT_COLX = [40, 87, 134, 181, 228];
  var LAT_ROWY = [150, 220, 290];
  function weightedType() {
    var r = Math.random();
    if (r < 0.35) return 'star';
    if (r < 0.80) return 'cloud';
    return 'storm';
  }
  function buildLattice() {
    var nodes = [];
    for (var col = 0; col < LATTICE_COLS; col++) {
      var colArr = [];
      for (var row = 0; row < LATTICE_ROWS; row++) {
        colArr.push({ col: col, row: row, x: LAT_COLX[col], y: LAT_ROWY[row], type: weightedType() });
      }
      nodes.push(colArr);
    }
    return nodes;
  }

  /* ─── Bespoke finale: outcome depends on which story tags dominated ─── */
  function renderFinale(api, info) {
    var W = api.W, H = api.H;
    scenery(api, 'finale', info.sceneT);
    emblem(api, W / 2, H * 0.24);
    var tag = dominantTag();
    api.lines(FINALE_TEXT[tag], W / 2, H * 0.38, 11, C.amber, 16);
    api.txtC('FINAL COINS  ' + info.respect, W / 2, H * 0.62, 11, C.ivory);
    api.txtC('A THOUSAND NIGHTS', W / 2, H * 0.70, 8, C.tealL);
    if (Math.floor(info.sceneT * 1.5) % 2 === 0 && info.sceneT > 0.6) {
      api.txtC('RETURN TO THE BAZAAR', W / 2, H - 40, 11, C.ivory);
    }
    api.vignette(); api.scanlines();
  }

  /* ===================================================================== */
  RetroSaga.create({
    id:        '1001nights',
    title:     'A Thousand Nights',
    subtitle:  'ONE THOUSAND AND ONE TALES',
    currency:  'COINS',
    accent:    C.goldL,
    credit:    'AFTER ONE THOUSAND AND ONE NIGHTS · c.800–1500 CE',
    emblem:    emblem,
    scenery:   scenery,
    renderFinale: renderFinale,
    bootCta:   'TAP TO HEAR THE TALE',
    menuLabel: 'A THOUSAND NIGHTS',
    menuHint:  'CHOOSE YOUR TALE',
    menuDone:  'ALL TALES ARE TOLD. SCHEHERAZADE LIVES.',

    screens: {
      win:          C.amber,
      lose:         C.rubyL,
      chapterLabel: C.tealL,
      name:         C.ivory,
      sub:          C.sandL,
      intro:        C.cream,
      quote:        C.parch,
      help:         C.sandL,
      score:        C.amber,
      cur:          C.goldL,
      cta:          C.ivory,
      overlay:      'rgba(4,2,12,.90)',
    },
    labels: {
      chapter: 'TALE',
      score:   'COINS EARNED',
      win:     'SCHEHERAZADE WEAVES THE NIGHT.',
      lose:    'DAWN BREAKS THE SPELL.',
      cont:    'TAP TO CONTINUE',
      finale:  'TAP FOR THE ENDING',
      toMenu:  'RETURN TO THE BAZAAR',
      play:    'TAP TO BEGIN',
    },

    menu: {
      title: function (api, currency) {
        var c = api.ctx, W = api.W;
        var t = Date.now() * 0.001;
        var topGrad = c.createLinearGradient(0, 0, 0, 80);
        topGrad.addColorStop(0, C.night);
        topGrad.addColorStop(1, C.dkblue);
        c.fillStyle = topGrad; c.fillRect(0, 0, W, 80);
        var i;
        for (i = 0; i < 20; i++) {
          var sx = (i * 17 + 5) % W, sy = (i * 11 + 3) % 44;
          c.globalAlpha = 0.25 + 0.45 * Math.abs(Math.sin(t * 1.5 + i));
          c.fillStyle = C.star; c.fillRect(sx, sy, 1, 1);
        }
        c.globalAlpha = 1;
        c.globalAlpha = 0.82;
        c.fillStyle = C.moon;
        c.beginPath(); c.arc(W - 30, 28, 15, 0, Math.PI * 2); c.fill();
        c.fillStyle = C.dkblue;
        c.beginPath(); c.arc(W - 24, 25, 11, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 1;
        c.fillStyle = '#16102e'; c.fillRect(8, 10, W - 16, 58);
        c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(8, 10, W - 16, 58);
        c.strokeStyle = C.copper; c.lineWidth = 1; c.strokeRect(11, 13, W - 22, 52);
        api.txtCFit('A THOUSAND NIGHTS', W / 2, 18, 9, C.goldL, true, W - 40);
        api.txtCFit(currency + ' COINS', W / 2, 38, 7, C.amber, true, W - 60);
        api.txtCFit('CHOOSE YOUR TALE', W / 2, 56, 6, C.teal, true, W - 60);
        c.strokeStyle = C.copper; c.lineWidth = 1; c.globalAlpha = 0.4;
        for (var ri = 0; ri < CARD_LAYOUT.length; ri++) {
          var rl = CARD_LAYOUT[ri];
          c.beginPath(); c.moveTo(rl.x + rl.w / 2, 70); c.lineTo(rl.x + rl.w / 2, rl.y - 4); c.stroke();
        }
        c.globalAlpha = 1;
        for (var si = 0; si < 10; si++) {
          var spx = (si * 31 + 12) % W, spy = 90 + (si * 57) % 250;
          var spa = 0.08 + 0.16 * Math.abs(Math.sin(t * 1.8 + si * 1.7));
          c.globalAlpha = spa;
          c.fillStyle = C.gold;
          c.beginPath(); c.arc(spx, spy, 1.5, 0, Math.PI * 2); c.fill();
        }
        c.globalAlpha = 1;
      },
      layout: function () { return CARD_LAYOUT; },
      card: function (api, info) {
        drawLantern(api, info, Date.now() * 0.001);
      },
    },

    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ==============================================================
       * 1. THE SULTAN'S EAR — story-fragment deck (choose-your-path)
       * Tap fragment cards to fill the suspense meter before dawn.
       * ============================================================== */
      {
        id: 'scheherazade',
        name: "THE SULTAN'S EAR",
        sub: 'SCHEHERAZADE',
        icon: function (api, x, y) {
          var g = api.gfx, c = api.ctx;
          g.rect(x - 10, y - 8, 20, 14, C.ivory);
          g.rect(x - 9, y - 7, 9, 12, '#c8b898');
          c.strokeStyle = C.gold; c.lineWidth = 1; c.strokeRect(x - 10, y - 8, 20, 14);
          c.fillStyle = C.amber;
          c.beginPath(); c.moveTo(x + 8, y - 16); c.lineTo(x + 14, y - 8); c.lineTo(x + 6, y); c.closePath(); c.fill();
          g.rect(x + 9, y - 8, 2, 8, C.ivory);
        },
        intro: [
          'NIGHT FALLS ON THE',
          "SULTAN'S PALACE.",
          'Weave the tale from',
          'story fragments —',
          'keep him spellbound',
          'before the dawn breaks!',
        ],
        quote: '"Once upon a time and a long, long time ago..." — One Thousand and One Nights',
        help: 'TAP a story fragment to weave it in. Fill SUSPENSE before dawn!',
        winText: "The Sultan leans forward, enchanted. The night is saved — and Scheherazade with it.",
        loseText: "The Sultan's patience ran out with the tale unfinished. Dawn found her silent.",
        init: function (api) {
          this.pool = shuffleArr(FRAGMENT_POOL.slice());
          this.hand = [nextFragment(this), nextFragment(this), nextFragment(this)];
          this.suspense = 0;
          this.target = 155;
          this.dawn = 30; this.maxDawn = 30;
          this.cooldown = 0; this.flash2 = 0; this.lastLabel = '';
        },
        update: function (api, dt) {
          if (this.cooldown > 0) this.cooldown -= dt;
          if (this.flash2 > 0) this.flash2 -= dt;
          this.dawn -= dt;
          if (this.dawn <= 0) { api.lose(); return; }
          if (api.pointer.justDown && this.cooldown <= 0) {
            var idx = hitRects(api.pointer.x, api.pointer.y, FRAG_CARDS);
            if (idx >= 0) {
              var card = this.hand[idx];
              this.suspense += card.val;
              this.lastLabel = card.label;
              TAGS[card.tag] = (TAGS[card.tag] || 0) + 1;
              this.hand[idx] = nextFragment(this);
              this.cooldown = 0.6; this.flash2 = 0.4;
              api.audio.sfx('power'); api.shake(2, 0.1);
              api.burst(FRAG_CARDS[idx].x + FRAG_CARDS[idx].w / 2, FRAG_CARDS[idx].y + 20, C.goldL, 10);
              if (this.suspense >= this.target) { api.addScore(Math.round(this.suspense)); api.win(); }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = C.dome; c.fillRect(0, 0, W, H);
          var archY = H * 0.24;
          c.fillStyle = '#120938';
          for (var ai = 0; ai < 4; ai++) {
            var ax = 18 + ai * 62;
            c.fillRect(ax, archY, 46, H - archY);
            c.beginPath(); c.arc(ax + 23, archY, 23, Math.PI, 0); c.fill();
          }
          for (var li2 = 0; li2 < 3; li2++) {
            var lx2 = 50 + li2 * 84, ly2 = 50;
            c.globalAlpha = 0.16; c.fillStyle = C.amber;
            c.beginPath(); c.arc(lx2, ly2, 18, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1; g.circle(lx2, ly2, 5, C.amber);
            g.rect(lx2 - 2, ly2 - 14, 4, 14, C.copper);
          }
          c.fillStyle = '#3a0c48'; c.fillRect(0, 0, 20, H); c.fillRect(W - 20, 0, 20, H);

          var meterY = 96, meterH = 14, meterW = W - 40;
          g.rect(20, meterY, meterW, meterH, '#1a1024');
          c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(20, meterY, meterW, meterH);
          var fillW = Math.max(0, Math.min(meterW - 4, (meterW - 4) * (this.suspense / this.target)));
          g.rect(22, meterY + 2, fillW, meterH - 4, C.goldL);
          api.txtCFit('SUSPENSE', W / 2, meterY - 14, 8, C.amber, true);
          var dawnFrac = Math.max(0, this.dawn / this.maxDawn);
          api.txtCFit('DAWN IN ' + Math.ceil(this.dawn) + 's', W / 2, meterY + 24, 8, dawnFrac < 0.25 ? C.rubyL : C.sandL, true);

          if (this.lastLabel) {
            c.globalAlpha = Math.min(1, this.flash2 * 2.5 + 0.35);
            api.txtCHead('"' + this.lastLabel + '"', W / 2, 158, 9, C.cream, false, 13, W - 40);
            c.globalAlpha = 1;
          }

          for (var i = 0; i < 3; i++) {
            var r = FRAG_CARDS[i], card = this.hand[i];
            var tagCol = card.tag === 'brave' ? C.rubyL : card.tag === 'clever' ? C.tealL : card.tag === 'wise' ? C.goldL : C.silk;
            g.rect(r.x, r.y, r.w, r.h, '#1c1230');
            c.strokeStyle = tagCol; c.lineWidth = 2; c.strokeRect(r.x, r.y, r.w, r.h);
            tagGlyph(api, card.tag, r.x + r.w / 2, r.y + 22, tagCol);
            api.txtCHead(card.label, r.x + r.w / 2, r.y + 40, 7, C.ivory, true, 9, r.w - 10);
            api.txtCFit('+' + card.val, r.x + r.w / 2, r.y + r.h - 16, 8, tagCol, true);
          }

          api.topBar('WEAVE THE TALE');
          api.vignette(); api.scanlines();
        },
      },

      /* ==============================================================
       * 2. THE ROC'S SHADOW — island memory path (watch, then repeat)
       * ============================================================== */
      {
        id: 'sinbad',
        name: "THE ROC'S SHADOW",
        sub: 'SINBAD THE SAILOR',
        icon: function (api, x, y) {
          var g = api.gfx, c = api.ctx;
          g.rect(x - 12, y + 2, 24, 10, C.sand);
          c.fillStyle = C.ivory;
          c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + 10, y + 2); c.lineTo(x - 10, y + 2); c.closePath(); c.fill();
          g.rect(x - 1, y - 14, 2, 18, C.dust);
          c.fillStyle = C.smoke;
          c.beginPath(); c.moveTo(x + 14, y - 8); c.quadraticCurveTo(x + 22, y - 16, x + 18, y - 2); c.closePath(); c.fill();
        },
        intro: [
          'SINBAD IS STRANDED',
          'ON A LONELY ISLAND.',
          'The monstrous Roc',
          'wheels overhead —',
          'remember the safe',
          'stepping stones home!',
        ],
        quote: '"Its wings darkened the sun and the earth shook with its cry." — Sinbad\'s Second Voyage',
        help: 'WATCH the glowing islands, then TAP them back in order!',
        winText: "Sinbad traced the safe path home from memory alone — the Roc's shadow passed him by.",
        loseText: "Sinbad's foot found open water. The Roc's shriek was the last sound he heard.",
        init: function (api) {
          this.round = 0; this.roundsToWin = 4; this.seqLen = 3; this.lives = 3;
          this.sequence = []; this.inputIdx = 0;
          startSinbadRound(this);
        },
        update: function (api, dt) {
          if (this.phase === 'show') {
            this.showT -= dt;
            if (this.showT <= 0) {
              this.showIdx++;
              if (this.showIdx >= this.sequence.length) { this.phase = 'input'; this.inputIdx = 0; }
              else { this.showT = 0.55; api.audio.sfx('blip'); }
            }
          } else if (this.phase === 'input') {
            if (api.pointer.justDown) {
              var hit = hitPoints(api.pointer.x, api.pointer.y, ISLANDS, 20);
              if (hit >= 0) {
                if (hit === this.sequence[this.inputIdx]) {
                  api.audio.sfx('select'); api.burst(ISLANDS[hit].x, ISLANDS[hit].y, C.tealL, 8);
                  this.inputIdx++;
                  if (this.inputIdx >= this.sequence.length) {
                    this.round++;
                    api.addScore(30 + this.seqLen * 5);
                    TAGS.brave = (TAGS.brave || 0) + 1;
                    if (this.round >= this.roundsToWin) { api.win(); return; }
                    this.seqLen++;
                    startSinbadRound(this);
                  }
                } else {
                  this.lives--;
                  api.audio.sfx('hurt'); api.shake(5, 0.2); api.flash(C.ruby, 0.15);
                  if (this.lives <= 0) { api.lose(); return; }
                  startSinbadRound(this);
                }
              }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          var seaGrad = c.createLinearGradient(0, H * 0.38, 0, H);
          seaGrad.addColorStop(0, '#0a2840'); seaGrad.addColorStop(1, '#042028');
          c.fillStyle = seaGrad; c.fillRect(0, 0, W, H);
          var skyGrad = c.createLinearGradient(0, 0, 0, H * 0.42);
          skyGrad.addColorStop(0, '#0c0618'); skyGrad.addColorStop(1, '#142030');
          c.fillStyle = skyGrad; c.fillRect(0, 0, W, H * 0.42);
          var rocX = W * 0.5 + Math.sin(t * 0.5) * 40;
          c.globalAlpha = 0.42 + 0.1 * Math.sin(t * 0.8);
          c.fillStyle = '#060210';
          c.beginPath(); c.ellipse(rocX, 26, 80, 36, 0, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          for (var i = 0; i < ISLANDS.length; i++) {
            var isl = ISLANDS[i];
            var isShown = (this.phase === 'show' && this.showIdx >= 0 && this.sequence[this.showIdx] === i);
            var isDone = (this.phase === 'input' && this.sequence.slice(0, this.inputIdx).indexOf(i) >= 0);
            if (isShown) {
              c.globalAlpha = 0.35 + 0.25 * Math.sin(t * 8); c.fillStyle = C.goldL;
              c.beginPath(); c.arc(isl.x, isl.y, 26, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
            }
            g.circle(isl.x, isl.y + 6, 16, C.sand);
            g.circle(isl.x, isl.y + 2, 12, C.sandL);
            c.strokeStyle = isDone ? C.teal : (isShown ? C.goldL : C.dust); c.lineWidth = 2;
            c.beginPath(); c.arc(isl.x, isl.y + 2, 12, 0, Math.PI * 2); c.stroke();
            if (isDone) {
              c.fillStyle = C.teal; c.font = "bold 10px 'Press Start 2P'";
              c.textAlign = 'center'; c.fillText('✓', isl.x, isl.y + 6); c.textAlign = 'left';
            }
          }
          api.topBar('ROUND ' + Math.min(this.round + 1, this.roundsToWin) + ' / ' + this.roundsToWin);
          for (var li = 0; li < 3; li++) g.circle(W - 38 + li * 13, 20, 4, li < this.lives ? C.teal : '#1a0c28');
          api.txtCFit(this.phase === 'show' ? 'WATCH THE STARS...' : 'REPEAT THE PATH', W / 2, H - 30, 9, C.sandL, true);
          api.vignette();
        },
      },

      /* ==============================================================
       * 3. OPEN SESAME — spot the true gold jars before the thieves return
       * ============================================================== */
      {
        id: 'alibaba',
        name: 'OPEN SESAME',
        sub: 'ALI BABA',
        icon: function (api, x, y) {
          var g = api.gfx, c = api.ctx;
          c.fillStyle = '#1a0e28';
          c.beginPath(); c.arc(x, y, 11, Math.PI, 0); c.fill();
          c.fillRect(x - 11, y, 22, 10);
          g.circle(x + 14, y - 4, 7, C.gold);
          g.rect(x + 12, y - 12, 4, 10, C.sand);
          c.strokeStyle = C.copper; c.lineWidth = 1.5;
          c.beginPath(); c.arc(x + 14, y - 2, 5, 0, Math.PI); c.stroke();
        },
        intro: [
          '"OPEN SESAME!"',
          'ALI BABA ENTERS',
          "THE THIEVES' CAVE.",
          'Only two jars hold',
          'true gold — the rest',
          "are the thieves' traps!",
        ],
        quote: '"Open Sesame!" — Ali Baba and the Forty Thieves',
        help: 'MEMORIZE the glowing jars, then TAP them before the thieves return!',
        winText: "Ali Baba's sharp eye found every hidden gleam of gold. He slipped away rich.",
        loseText: "A thief's trap sprang shut on Ali Baba's hand. The cave keeps its gold.",
        init: function (api) {
          this.round = 0; this.need = 5; this.lives = 3; this.roundDur = 7;
          startAlibabaRound(this);
        },
        update: function (api, dt) {
          if (this.phase === 'reveal') {
            this.revealT -= dt;
            if (this.revealT <= 0) this.phase = 'hunt';
          } else if (this.phase === 'hunt') {
            this.roundT -= dt;
            if (this.roundT <= 0) {
              this.lives--;
              api.audio.sfx('hurt'); api.shake(4, 0.18); api.flash(C.ruby, 0.14);
              if (this.lives <= 0) { api.lose(); return; }
              startAlibabaRound(this);
              return;
            }
            if (api.pointer.justDown) {
              var hit = hitPoints(api.pointer.x, api.pointer.y, JARS, 22);
              if (hit >= 0 && this.foundIdx.indexOf(hit) === -1) {
                if (this.trueIdx.indexOf(hit) >= 0) {
                  this.foundIdx.push(hit);
                  api.audio.sfx('coin'); api.addScore(15); api.burst(JARS[hit].x, JARS[hit].y, C.gold, 10);
                  if (this.foundIdx.length >= this.trueIdx.length) {
                    this.round++;
                    TAGS.clever = (TAGS.clever || 0) + 1;
                    if (this.round >= this.need) { api.win(); return; }
                    startAlibabaRound(this);
                  }
                } else {
                  this.lives--;
                  api.audio.sfx('hurt'); api.shake(5, 0.2); api.flash(C.ruby, 0.16);
                  api.burst(JARS[hit].x, JARS[hit].y, C.ruby, 8);
                  if (this.lives <= 0) { api.lose(); return; }
                }
              }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          c.fillStyle = '#0a0614'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#12082a';
          for (var ci = 0; ci < 6; ci++) {
            c.beginPath(); c.arc((ci * 50 + 20) % W, (ci * 37 + 10) % (H * 0.55) + 60, 26 + (ci * 11) % 20, 0, Math.PI * 2); c.fill();
          }
          for (var i = 0; i < JARS.length; i++) {
            var j = JARS[i];
            var isTrue = this.trueIdx.indexOf(i) >= 0;
            var isFound = this.foundIdx.indexOf(i) >= 0;
            var showGlow = (this.phase === 'reveal' && isTrue) || isFound;
            if (showGlow) {
              c.globalAlpha = 0.3 + 0.2 * Math.sin(t * 4); c.fillStyle = C.gold;
              c.beginPath(); c.arc(j.x, j.y, 24, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
            }
            g.circle(j.x, j.y, 15, '#3a2560');
            g.circle(j.x, j.y - 3, 11, '#4a3070');
            c.strokeStyle = isFound ? C.teal : C.copper; c.lineWidth = 1.5;
            c.beginPath(); c.arc(j.x, j.y, 15, 0, Math.PI * 2); c.stroke();
            if (isFound) {
              c.fillStyle = C.teal; c.font = "bold 9px 'Press Start 2P'";
              c.textAlign = 'center'; c.fillText('✓', j.x, j.y + 3); c.textAlign = 'left';
            }
          }
          api.topBar('BAGS ' + this.round + ' / ' + this.need);
          for (var li = 0; li < 3; li++) g.circle(W - 38 + li * 13, 20, 4, li < this.lives ? C.teal : '#1a0c28');
          if (this.phase === 'reveal') api.txtCFit('REMEMBER THE GLEAM...', W / 2, H - 30, 9, C.amber, true);
          else api.txtCFit('TIME LEFT: ' + Math.ceil(this.roundT) + 's', W / 2, H - 30, 9, this.roundT < 2.5 ? C.rubyL : C.sandL, true);
          api.vignette(); api.scanlines();
        },
      },

      /* ==============================================================
       * 4. THE GENIE'S WISH — command the genie; favor is not limitless
       * ============================================================== */
      {
        id: 'aladdin',
        name: "THE GENIE'S WISH",
        sub: 'ALADDIN',
        icon: function (api, x, y) {
          var g = api.gfx, c = api.ctx;
          c.fillStyle = C.gold;
          c.beginPath(); c.ellipse(x - 2, y, 12, 7, 0, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.moveTo(x + 8, y); c.quadraticCurveTo(x + 16, y - 8, x + 12, y - 14); c.quadraticCurveTo(x + 6, y - 8, x + 4, y); c.closePath(); c.fill();
          c.fillStyle = C.smoke;
          c.beginPath(); c.arc(x, y - 14, 8, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 0.55; c.fillStyle = C.smokeL;
          c.beginPath(); c.arc(x, y - 22, 5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
          g.circle(x + 14, y - 14, 3, C.amber);
        },
        intro: [
          'ALADDIN FINDS THE',
          'MAGIC LAMP!',
          "Jafar's forces close in.",
          'Command the Genie',
          'wisely — his favor',
          'is not limitless.',
        ],
        quote: '"Thy wish is my command." — The Genie of the Lamp',
        help: "TAP a command. Bold wishes work — but cost the GENIE'S FAVOR.",
        winText: "The Genie's power held the gate through six desperate calls. The palace stands!",
        loseText: "The Genie's favor ran dry mid-wish. The lamp grows cold and dark.",
        init: function (api) {
          this.round = 0; this.need = WISH_ROUNDS.length; this.favor = 3;
          this.opts = WISH_ROUNDS[0].options; this.situation = WISH_ROUNDS[0].situation;
          this.flashIdx = -1; this.flashT = 0; this.roundT = 0;
        },
        update: function (api, dt) {
          if (this.flashT > 0) this.flashT -= dt;
          this.roundT += dt;
          if (api.pointer.justDown && this.roundT > 0.7) {
            var hit = hitRects(api.pointer.x, api.pointer.y, WISH_CARDS);
            if (hit >= 0) {
              var opt = this.opts[hit];
              this.favor -= opt.cost;
              TAGS[opt.tag] = (TAGS[opt.tag] || 0) + 1;
              api.addScore(20);
              this.flashIdx = hit; this.flashT = 0.3;
              api.audio.sfx(opt.cost ? 'power' : 'select');
              api.burst(WISH_CARDS[hit].x + 20, WISH_CARDS[hit].y + WISH_CARDS[hit].h / 2, opt.cost ? C.rubyL : C.tealL, 10);
              if (this.favor <= 0) { api.shake(6, 0.3); api.lose(); return; }
              this.round++;
              if (this.round >= this.need) { api.win(); return; }
              var next = WISH_ROUNDS[this.round];
              this.opts = next.options; this.situation = next.situation;
              this.roundT = 0;
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          var palGrad = c.createLinearGradient(0, 0, 0, H);
          palGrad.addColorStop(0, C.night); palGrad.addColorStop(1, C.dome);
          c.fillStyle = palGrad; c.fillRect(0, 0, W, H);
          for (var si = 0; si < 22; si++) {
            var sx = (si * 14 + 5) % W, sy = (si * 23 + 4) % (H * 0.35);
            c.globalAlpha = 0.18 + 0.28 * Math.abs(Math.sin(t * 1.4 + si));
            c.fillStyle = C.star; c.fillRect(sx, sy, 1, 1);
          }
          c.globalAlpha = 1;
          c.fillStyle = '#16102e'; c.fillRect(8, 54, W - 16, 44);
          c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(8, 54, W - 16, 44);
          api.txtCHead(this.situation, W / 2, 62, 8, C.amber, true, 11, W - 32);
          for (var i = 0; i < this.opts.length; i++) {
            var r = WISH_CARDS[i], opt = this.opts[i];
            var col = opt.tag === 'brave' ? C.rubyL : opt.tag === 'clever' ? C.tealL : opt.tag === 'mercy' ? C.silk : C.goldL;
            var lit = this.flashIdx === i && this.flashT > 0;
            g.rect(r.x, r.y, r.w, r.h, lit ? 'rgba(212,144,10,.28)' : '#1c1230');
            c.strokeStyle = col; c.lineWidth = 2; c.strokeRect(r.x, r.y, r.w, r.h);
            api.txtCHead(opt.label, r.x + r.w / 2, r.y + 8, 8, C.ivory, true, 10, r.w - 16);
            api.txtCFit(opt.hint, r.x + r.w / 2, r.y + r.h - 16, 7, col, false);
            if (opt.cost > 0) { c.fillStyle = C.amber; c.beginPath(); c.arc(r.x + r.w - 14, r.y + 14, 4, 0, Math.PI * 2); c.fill(); }
          }
          api.topBar('CALL ' + (this.round + 1) + ' / ' + this.need);
          for (var fi = 0; fi < 3; fi++) g.circle(W - 38 + fi * 13, 20, 4, fi < this.favor ? C.gold : '#1a0c28');
          api.vignette();
        },
      },

      /* ==============================================================
       * 5. THE FLYING CARPET — chart a course across the night sky
       * ============================================================== */
      {
        id: 'carpet',
        name: 'THE FLYING CARPET',
        sub: 'MAGIC CARPET RACE',
        icon: function (api, x, y) {
          var g = api.gfx, c = api.ctx;
          c.fillStyle = C.ruby;
          c.beginPath();
          c.moveTo(x - 14, y + 2); c.lineTo(x + 14, y - 4);
          c.lineTo(x + 16, y + 6); c.lineTo(x - 12, y + 12);
          c.closePath(); c.fill();
          c.strokeStyle = C.goldL; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x - 14, y + 2); c.lineTo(x + 14, y - 4); c.stroke();
          g.circle(x - 2, y - 2, 5, '#d8a878');
          c.fillStyle = C.teal;
          c.beginPath(); c.arc(x - 2, y - 6, 6, Math.PI, 0); c.fill();
        },
        intro: [
          "SCHEHERAZADE'S",
          'FINAL TALE MUST',
          'REACH THE SULTAN!',
          "Chart the carpet's",
          'course through the',
          'night sky before dawn.',
        ],
        quote: '"It soared up and up, swift as the evening star." — One Thousand and One Nights',
        help: 'TAP a star-chart node each leg. Stars buy time, storms cost a life.',
        winText: "The carpet swept past the last star-swept height and Scheherazade spoke her final words to the Sultan.",
        loseText: "A storm caught the carpet's fringe and dawn broke before the tale could land.",
        init: function (api) {
          this.nodes = buildLattice();
          this.col = 0; this.lives = 3; this.dawn = 24; this.maxDawn = 24; this.lockT = 0;
          this.path = [];
        },
        update: function (api, dt) {
          if (this.lockT > 0) this.lockT -= dt;
          this.dawn -= dt;
          if (this.dawn <= 0) { api.lose(); return; }
          if (this.lockT <= 0 && this.col < LATTICE_COLS && api.pointer.justDown) {
            var colNodes = this.nodes[this.col];
            var hit = hitPoints(api.pointer.x, api.pointer.y, colNodes, 17);
            if (hit >= 0) {
              var node = colNodes[hit];
              this.path.push(node);
              if (node.type === 'star') {
                this.dawn = Math.min(this.maxDawn, this.dawn + 4);
                TAGS.wise = (TAGS.wise || 0) + 1;
                api.audio.sfx('power'); api.addScore(20);
              } else if (node.type === 'cloud') {
                TAGS.clever = (TAGS.clever || 0) + 1;
                api.audio.sfx('select'); api.addScore(10);
              } else {
                this.lives--; this.dawn -= 3;
                TAGS.brave = (TAGS.brave || 0) + 1;
                api.audio.sfx('hurt'); api.shake(5, 0.2); api.flash(C.ruby, 0.14); api.addScore(5);
              }
              api.burst(node.x, node.y, node.type === 'storm' ? C.ruby : C.goldL, 10);
              if (this.lives <= 0) { api.lose(); return; }
              this.col++;
              this.lockT = 0.9;
              if (this.col >= LATTICE_COLS) { api.addScore(80); api.win(); return; }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          var skyGrad = c.createLinearGradient(0, 0, 0, H);
          skyGrad.addColorStop(0, C.night); skyGrad.addColorStop(0.7, C.indigo); skyGrad.addColorStop(1, '#1a1440');
          c.fillStyle = skyGrad; c.fillRect(0, 0, W, H);
          for (var si = 0; si < 42; si++) {
            var sx = (si * 71 + 4) % W, sy = (si * 53 + 8) % (H * 0.9);
            c.globalAlpha = 0.12 + 0.32 * Math.abs(Math.sin(t * 1.1 + si));
            c.fillStyle = C.star; c.fillRect(sx, sy, 1, 1);
          }
          c.globalAlpha = 1;
          c.strokeStyle = C.goldL; c.lineWidth = 1.5; c.globalAlpha = 0.6;
          for (var pi = 1; pi < this.path.length; pi++) {
            c.beginPath(); c.moveTo(this.path[pi - 1].x, this.path[pi - 1].y); c.lineTo(this.path[pi].x, this.path[pi].y); c.stroke();
          }
          c.globalAlpha = 1;
          for (var col = 0; col < LATTICE_COLS; col++) {
            for (var row = 0; row < LATTICE_ROWS; row++) {
              var node = this.nodes[col][row];
              var active = col === this.col;
              var past = col < this.col;
              c.globalAlpha = active ? 1 : (past ? 0.35 : 0.55);
              var glyphCol = node.type === 'star' ? C.goldL : node.type === 'cloud' ? C.sandL : C.rubyL;
              g.circle(node.x, node.y, 13, past ? '#241a3a' : '#1c1230');
              c.strokeStyle = glyphCol; c.lineWidth = active ? 2 : 1;
              c.beginPath(); c.arc(node.x, node.y, 13, 0, Math.PI * 2); c.stroke();
              if (node.type === 'star') { c.fillStyle = glyphCol; drawStarGlyph(c, node.x, node.y, 6); }
              else if (node.type === 'cloud') {
                c.fillStyle = glyphCol;
                c.beginPath(); c.arc(node.x - 3, node.y, 4, 0, Math.PI * 2); c.arc(node.x + 3, node.y, 5, 0, Math.PI * 2); c.arc(node.x, node.y - 3, 4, 0, Math.PI * 2); c.fill();
              } else {
                c.fillStyle = glyphCol;
                c.beginPath();
                c.moveTo(node.x, node.y - 6); c.lineTo(node.x + 5, node.y + 2); c.lineTo(node.x - 1, node.y + 2);
                c.lineTo(node.x + 3, node.y + 7); c.lineTo(node.x - 6, node.y - 1); c.lineTo(node.x - 1, node.y - 1);
                c.closePath(); c.fill();
              }
              c.globalAlpha = 1;
            }
          }
          api.topBar('LEG ' + Math.min(this.col + 1, LATTICE_COLS) + ' / ' + LATTICE_COLS);
          for (var li = 0; li < 3; li++) g.circle(W - 38 + li * 13, 20, 4, li < this.lives ? C.teal : '#1a0c28');
          api.txtCFit('DAWN IN ' + Math.ceil(this.dawn) + 's', W / 2, H - 24, 9, this.dawn < 8 ? C.rubyL : C.sandL, true);
          api.vignette();
        },
      },

    ], // end chapters
  });

}());
