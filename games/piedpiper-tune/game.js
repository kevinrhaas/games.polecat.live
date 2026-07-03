/* ============================================================================
 * THE PIED PIPER OF HAMELIN
 * Five tales from the medieval German legend (Robert Browning, 1842):
 *   1. THE RAT PLAGUE  — tap/drive rats before they reach the food stores (28s)
 *   2. THE BARGAIN     — pendulum timing: play 8 perfect notes for the Mayor
 *   3. PIPING THE RATS — steer the Piper through streets to the River Weser (24s)
 *   4. THE BETRAYAL    — dodge the Mayor's guards when he refuses to pay (24s)
 *   5. THE MOUNTAIN    — rhythm tap: lead the children with 12 enchanted notes
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ─── Palette: warm medieval amber, cobblestone, magic cyan ─── */
  var C = {
    night:  '#080408',
    nightL: '#14100a',
    stone:  '#c8a870',
    stoneD: '#8a7048',
    amber:  '#c87a18',
    amberL: '#f0c030',
    piperR: '#cc2200',
    piperG: '#1e9922',
    piperY: '#f0c030',
    ratGr:  '#8a6850',
    ratGrD: '#5a4030',
    ratEye: '#cc4400',
    magic:  '#44aaff',
    magicL: '#88ccff',
    river:  '#2878c0',
    riverL: '#4a9add',
    mtn:    '#2e1e44',
    mtnL:   '#5a4878',
    green:  '#4a8a20',
    cream:  '#f0e8c8',
    red:    '#cc1a0a',
    gold:   '#f0c030',
    guild:  '#d4a020',
    guard:  '#3a5898',
    guardL: '#5a78b8',
    child:  '#e85888',
    disso:  '#cc2244',
  };

  /* ─── Draw the Piper (multicolored costume) ─── */
  function drawPiper(g, c, x, y, t, flashing) {
    if (flashing) return;
    /* hat */
    c.fillStyle = C.piperR;
    c.beginPath(); c.moveTo(x - 10, y - 26); c.lineTo(x + 10, y - 26); c.lineTo(x, y - 40); c.closePath(); c.fill();
    c.fillStyle = C.piperY; c.fillRect(x - 12, y - 26, 24, 5);
    /* head */
    g.circle(x, y - 16, 9, C.stone);
    /* body - two-tone tunic */
    g.rect(x - 8, y - 8, 8, 18, C.piperR);
    g.rect(x, y - 8, 8, 18, C.piperG);
    /* legs */
    var leg = Math.sin(t * 10) * 4;
    g.rect(x - 7, y + 10, 6, 10 + leg, C.piperY);
    g.rect(x + 1, y + 10, 6, 10 - leg, C.piperY);
    /* arm holding pipe */
    g.rect(x + 8, y - 6, 12, 4, C.stone);
    g.rect(x + 18, y - 6, 18, 3, C.amber);
    /* pipe holes */
    for (var h = 0; h < 3; h++) g.circle(x + 20 + h * 5, y - 5, 1, C.stoneD);
    /* eyes */
    g.circle(x - 3, y - 18, 1, C.night);
    g.circle(x + 3, y - 18, 1, C.night);
  }

  /* ─── Draw a rat (scuttling) ─── */
  function drawRat(g, c, x, y, dir, phase) {
    var bob = Math.sin(phase * 16) * 2;
    var f = dir >= 0 ? 1 : -1;
    g.rect(x - 13 * f, y - 4 + bob, 26, 8, C.ratGr);
    g.circle(x + 13 * f, y - 2 + bob, 6, C.ratGr);
    g.rect(x + 17 * f, y - 1 + bob, 5, 4, C.ratGrD);
    g.circle(x + 14 * f, y - 5 + bob, 2, C.ratEye);
    c.strokeStyle = C.ratGrD; c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x - 13 * f, y + 1 + bob);
    c.quadraticCurveTo(x - 26 * f, y - 10 + bob, x - 20 * f, y - 18 + bob);
    c.stroke();
    var lp = Math.abs(Math.sin(phase * 16)) * 5;
    g.rect(x - 4, y + 3 + bob, 3, 5 + lp, C.ratGrD);
    g.rect(x + 2, y + 3 + bob, 3, 5 - lp, C.ratGrD);
  }

  /* ─── Draw a child (marching) ─── */
  function drawChild(g, c, x, y, t, col) {
    var bob = Math.sin(t * 10) * 2;
    g.circle(x, y - 13 + bob, 6, C.stone);
    g.rect(x - 5, y - 8 + bob, 10, 13, col);
    var leg2 = Math.sin(t * 12) * 4;
    g.rect(x - 4, y + 5 + bob, 4, 8 + leg2, C.stoneD);
    g.rect(x + 1, y + 5 + bob, 4, 8 - leg2, C.stoneD);
  }

  /* ─── Draw a medieval guard ─── */
  function drawGuard(g, c, x, y) {
    g.circle(x, y - 16, 9, C.stone);
    c.fillStyle = C.guardL; c.fillRect(x - 11, y - 26, 22, 12);
    c.fillStyle = C.guard; c.beginPath(); c.arc(x, y - 21, 10, Math.PI, 0); c.fill();
    g.rect(x - 8, y - 8, 16, 22, C.guard);
    c.strokeStyle = C.stoneD; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x + 9, y - 26); c.lineTo(x + 9, y + 18); c.stroke();
    c.fillStyle = C.amberL;
    c.beginPath(); c.moveTo(x + 9, y - 26); c.lineTo(x + 4, y - 20); c.lineTo(x + 14, y - 20); c.closePath(); c.fill();
  }

  /* ─── EMBLEM: Piper silhouette with orbiting notes ─── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    c.globalAlpha = 0.12; c.fillStyle = C.amberL;
    c.beginPath(); c.arc(cx, cy, 50, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.08; c.fillStyle = C.magic;
    c.beginPath(); c.arc(cx, cy, 54, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    /* hat */
    c.fillStyle = C.piperR;
    c.beginPath(); c.moveTo(cx - 10, cy - 24); c.lineTo(cx + 10, cy - 24); c.lineTo(cx, cy - 38); c.closePath(); c.fill();
    c.fillStyle = C.amberL; c.fillRect(cx - 12, cy - 24, 24, 5);
    g.circle(cx, cy - 13, 9, C.stone);
    g.rect(cx - 8, cy - 5, 8, 18, C.piperR);
    g.rect(cx, cy - 5, 8, 18, C.piperG);
    g.rect(cx + 8, cy - 4, 18, 4, C.amber);
    /* orbiting notes */
    var offsets = [[-20, -16], [26, -10], [-26, 4], [24, 8], [-14, 22]];
    for (var ni = 0; ni < offsets.length; ni++) {
      var ox = offsets[ni][0], oy = offsets[ni][1];
      c.globalAlpha = 0.55 + 0.4 * Math.sin(api.t * 2.2 + ni);
      g.circle(cx + ox, cy + oy, 4, C.magic);
      g.rect(cx + ox + 4, cy + oy - 10, 2, 12, C.magicL);
    }
    c.globalAlpha = 1;
  }

  /* ─── SCENERY ─── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      /* Daytime Hamelin town — warm amber and cobblestone */
      var daySky = c.createLinearGradient(0, 0, 0, H);
      daySky.addColorStop(0, '#4a7ab8');
      daySky.addColorStop(0.55, '#7a9aCC');
      daySky.addColorStop(1, '#b8a070');
      c.fillStyle = daySky; c.fillRect(0, 0, W, H);
      /* Fluffy clouds */
      for (var ci = 0; ci < 3; ci++) {
        var cx2 = 44 + ci * 88 + Math.sin(t * 0.1 + ci) * 8;
        c.globalAlpha = 0.72; c.fillStyle = '#f8f4e8';
        c.beginPath(); c.ellipse(cx2, 46 + ci * 8, 26, 11, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(cx2 + 14, 42 + ci * 8, 18, 9, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(cx2 - 12, 44 + ci * 8, 16, 7, 0, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 1;
      }
      /* Medieval building rooftops */
      var roofY = H * 0.67;
      var blds = [[0, 52], [48, 68], [110, 44], [164, 76], [222, 58]];
      for (var bi = 0; bi < blds.length; bi++) {
        var bx = blds[bi][0], bw = blds[bi][1];
        g.rect(bx, roofY - 22, bw, 22, '#8a6840');
        c.fillStyle = '#6a4820';
        c.beginPath(); c.moveTo(bx, roofY - 22); c.lineTo(bx + bw / 2, roofY - 36); c.lineTo(bx + bw, roofY - 22); c.closePath(); c.fill();
        c.globalAlpha = 0.5;
        g.rect(bx + bw * 0.28, roofY - 15, bw * 0.2, bw * 0.14, C.amberL);
        c.globalAlpha = 1;
      }
      /* Cobblestone ground */
      c.fillStyle = C.stoneD; c.fillRect(0, roofY, W, H - roofY);
      c.globalAlpha = 0.35;
      for (var ri = 0; ri < 10; ri++) {
        for (var rj = 0; rj < 3; rj++) {
          c.strokeStyle = '#6a5030'; c.lineWidth = 1;
          c.strokeRect(ri * 28 + (rj % 2) * 14, roofY + rj * 22, 24, 18);
        }
      }
      c.globalAlpha = 1;
      /* Scuttling rats in background */
      for (var rai = 0; rai < 4; rai++) {
        var rx = (t * 28 * (rai % 2 === 0 ? 1 : -1) + rai * 90 + 200) % (W + 60) - 30;
        var ry = roofY - 8 - (rai % 2) * 10;
        c.globalAlpha = 0.45;
        drawRat(g, c, rx, ry, rai % 2 === 0 ? 1 : -1, t);
        c.globalAlpha = 1;
      }
      return;
    }

    /* Night backdrop — boot / intro / result / finale */
    var nSky = c.createLinearGradient(0, 0, 0, H);
    nSky.addColorStop(0, C.night); nSky.addColorStop(1, '#1a1008');
    c.fillStyle = nSky; c.fillRect(0, 0, W, H);
    /* Stars */
    for (var si = 0; si < 36; si++) {
      var sx = (si * 73 + 11) % W, sy = (si * 53 + 7) % Math.floor(H * 0.48);
      c.globalAlpha = (0.3 + 0.65 * Math.abs(Math.sin(t * 0.8 + si))) * 0.7;
      g.rect(sx, sy, 1, 1, C.cream);
    }
    c.globalAlpha = 1;
    /* Moon */
    g.circle(W - 38, 40, 18, '#e8dcc0');
    c.globalAlpha = 0.14; g.circle(W - 38, 40, 28, '#d8c8a0'); c.globalAlpha = 1;
    /* Town silhouette */
    var silY = H * 0.62;
    var sils = [[0, 58], [54, 72], [106, 48], [154, 82], [210, 62], [248, 52]];
    for (var sli = 0; sli < sils.length; sli++) {
      var sbx = sils[sli][0], sbw = sils[sli][1];
      g.rect(sbx, silY - 24, sbw, 24, '#0e0a06');
      c.fillStyle = '#0a0706';
      c.beginPath(); c.moveTo(sbx, silY - 24); c.lineTo(sbx + sbw / 2, silY - 40); c.lineTo(sbx + sbw, silY - 24); c.closePath(); c.fill();
      c.globalAlpha = 0.38; g.rect(sbx + sbw * 0.28, silY - 16, sbw * 0.18, sbw * 0.12, C.amberL); c.globalAlpha = 1;
    }
    g.rect(0, silY, W, H - silY, '#1a0e06');
    /* Floating magic notes */
    for (var mni = 0; mni < 6; mni++) {
      var mnx = (mni * 50 + t * 18) % (W + 30) - 15;
      var mny = 48 + mni * 40 + Math.sin(t * 0.65 + mni * 1.1) * 15;
      c.globalAlpha = 0.2 + 0.18 * Math.sin(t + mni * 0.7);
      g.circle(mnx, mny, 3, C.magic);
      g.rect(mnx + 3, mny - 9, 2, 10, C.magicL);
      c.globalAlpha = 1;
    }
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(4,2,6,.72)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Menu layout: five location cards on a Hamelin town map ─── */
  var CARDS = [
    { x: 14,  y: 80,  w: 96, h: 60 },   /* Town Square  — top-left   */
    { x: 160, y: 108, w: 96, h: 60 },   /* Mayor's Hall  — top-right  */
    { x: 87,  y: 196, w: 96, h: 60 },   /* High Street   — center     */
    { x: 14,  y: 290, w: 96, h: 60 },   /* River Bank    — bottom-left */
    { x: 160, y: 318, w: 96, h: 60 },   /* The Mountain  — bottom-right*/
  ];

  var LOC_NAMES = ['TOWN SQUARE', "MAYOR'S HALL", 'HIGH STREET', 'RIVER BANK', 'THE MOUNTAIN'];
  var CH_SHORT  = ['RAT PLAGUE', 'THE BARGAIN', 'PIPE THE RATS', 'BETRAYAL', 'THE MOUNTAIN'];

  /* ─── Chapter icons ─── */
  var ICONS = [
    function (api, x, y) { /* rat silhouette */
      api.gfx.circle(x + 5, y, 5, C.ratGr);
      api.gfx.rect(x - 6, y - 2, 14, 5, C.ratGr);
      api.ctx.strokeStyle = C.ratGrD; api.ctx.lineWidth = 2;
      api.ctx.beginPath(); api.ctx.moveTo(x - 6, y + 1); api.ctx.quadraticCurveTo(x - 16, y - 6, x - 11, y - 14); api.ctx.stroke();
    },
    function (api, x, y) { /* pipe + note */
      api.gfx.rect(x - 12, y - 2, 24, 5, C.amber);
      for (var i = 0; i < 3; i++) api.gfx.circle(x - 7 + i * 6, y, 2, C.amberL);
      api.gfx.circle(x + 16, y - 7, 4, C.magic);
      api.gfx.rect(x + 20, y - 17, 2, 12, C.magicL);
    },
    function (api, x, y) { /* rats → arrow → river */
      for (var i = 0; i < 3; i++) api.gfx.circle(x - 10 + i * 9, y, 3, C.ratGr);
      api.ctx.fillStyle = C.amber;
      api.ctx.beginPath(); api.ctx.moveTo(x + 14, y); api.ctx.lineTo(x + 8, y - 6); api.ctx.lineTo(x + 8, y + 6); api.ctx.closePath(); api.ctx.fill();
    },
    function (api, x, y) { /* guard spear */
      api.gfx.circle(x - 4, y - 2, 6, C.guard);
      api.gfx.rect(x - 7, y + 2, 14, 7, C.guard);
      api.gfx.circle(x + 9, y - 3, 5, C.guild);
      api.ctx.fillStyle = C.red;
      api.ctx.beginPath(); api.ctx.arc(x + 9, y - 3, 5, 0, Math.PI * 2); api.ctx.fill();
      api.ctx.fillStyle = C.cream; api.ctx.font = 'bold 7px monospace';
      api.ctx.textAlign = 'center'; api.ctx.textBaseline = 'middle';
      api.ctx.fillText('50', x + 9, y - 3);
      api.ctx.textAlign = 'left'; api.ctx.textBaseline = 'alphabetic';
    },
    function (api, x, y) { /* mountain peak + note */
      api.ctx.fillStyle = C.mtnL;
      api.ctx.beginPath(); api.ctx.moveTo(x, y - 11); api.ctx.lineTo(x - 13, y + 7); api.ctx.lineTo(x + 13, y + 7); api.ctx.closePath(); api.ctx.fill();
      api.gfx.circle(x - 8, y - 13, 3, C.magic);
      api.gfx.rect(x - 6, y - 23, 2, 11, C.magicL);
    },
  ];

  /* ─── SAGA ─── */
  RetroSaga.create({
    id: 'piedpiper',
    title: 'The Pied Piper',
    subtitle: 'FIVE TALES OF HAMELIN',
    currency: 'GUILDERS',
    screens: {
      win:   C.amberL, lose: C.red, chapterLabel: C.stoneD,
      name:  C.cream,  sub: C.amberL, intro: C.stone, quote: C.stoneD,
      help:  C.amber,  score: C.cream, cur: C.gold,
      cta:   C.cream,  overlay: 'rgba(4,2,6,.84)',
    },
    labels: {
      chapter: 'TALE',
      score:   'GUILDERS EARNED',
      win:     'THE PIPE RINGS TRUE',
      lose:    'HAMELIN IS LOST',
      cont:    'TAP TO PIPE ON',
      finale:  'TAP TO REMEMBER',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO BEGIN',
    },
    accent:   C.amberL,
    credit:   'THE PIED PIPER OF HAMELIN',
    bootLine: 'FIVE TALES · ONE PIPE · ONE LEGEND',
    tagline:  'A POLECAT ADVENTURE',
    emblem: emblem, scenery: scenery,
    bootCta:   'PLAY THE PIPE',
    menuLabel: 'HAMELIN TOWN MAP',
    menuHint:  'CHOOSE YOUR TALE',
    menuDone:  'THE LEGEND IS TOLD',
    finale: [
      'THE PIPE FALLS SILENT.',
      '',
      'ONE HUNDRED AND THIRTY CHILDREN',
      'FOLLOWED THE MUSIC',
      'INTO THE MOUNTAIN SIDE.',
      '',
      '"AND WHEN ALL WERE IN TO THE VERY LAST,',
      'THE DOOR IN THE MOUNTAIN SHUT FAST."',
      '',
      '— ROBERT BROWNING, 1842',
    ],
    width: 270, height: 480, parent: '#game',

    menu: {
      colors: { title: C.cream, label: C.stone, cur: C.amberL, done: C.green, lock: '#4a3a28' },

      title: function (api, guilders) {
        var g = api.gfx, c = api.ctx, W = api.W;
        /* parchment header box */
        g.rect(10, 6, W - 20, 60, '#1e1608');
        c.strokeStyle = C.amber; c.lineWidth = 2;
        c.strokeRect(10, 6, W - 20, 60);
        /* inner double-border */
        c.strokeStyle = '#3a2010'; c.lineWidth = 1;
        c.strokeRect(14, 10, W - 28, 52);
        /* corner nail dots */
        var corners = [[16, 12], [W - 20, 12], [16, 52], [W - 20, 52]];
        for (var ki = 0; ki < corners.length; ki++) {
          c.fillStyle = C.amber;
          c.beginPath(); c.arc(corners[ki][0], corners[ki][1], 3, 0, Math.PI * 2); c.fill();
        }
        api.txtCFit('HAMELIN TOWN MAP', W / 2, 18, 8, C.cream, false, W - 38);
        api.txtCFit('GUILDERS  ' + guilders, W / 2, 40, 8, C.gold, false, W - 38);
        /* tiny compass */
        c.strokeStyle = C.stoneD; c.lineWidth = 1;
        c.beginPath(); c.moveTo(W - 30, 22); c.lineTo(W - 30, 14); c.stroke();
        c.beginPath(); c.moveTo(W - 34, 18); c.lineTo(W - 26, 18); c.stroke();
        api.txtCFit('N', W - 30, 13, 5, C.stoneD, false, 10);
      },

      layout: function () { return CARDS; },

      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done, best = info.best;
        var cx2 = x + w / 2;

        /* dotted path to previous card */
        if (i > 0) {
          var prev = CARDS[i - 1];
          var px2 = prev.x + prev.w / 2, py2 = prev.y + prev.h / 2;
          c.strokeStyle = C.stoneD; c.lineWidth = 1.5;
          c.setLineDash([4, 5]);
          c.beginPath(); c.moveTo(px2, py2); c.lineTo(cx2, y + h / 2); c.stroke();
          c.setLineDash([]);
        }

        /* parchment card */
        var bg = sel ? '#2c1e08' : (done ? '#1a1606' : '#181408');
        var border = sel ? C.amberL : (done ? C.green : C.stoneD);
        g.rect(x, y, w, h, bg);
        c.strokeStyle = border; c.lineWidth = sel ? 3 : 2;
        c.strokeRect(x, y, w, h);
        /* inner frame */
        c.strokeStyle = sel ? C.amber : '#2a1e0e';
        c.lineWidth = 1;
        c.strokeRect(x + 3, y + 3, w - 6, h - 6);

        /* location name */
        api.txtCFit(LOC_NAMES[i], cx2, y + 11, 6, sel ? C.amberL : C.stoneD, false, w - 8);
        /* chapter name */
        api.txtCFit(CH_SHORT[i], cx2, y + 26, 7, done ? C.green : (sel ? C.cream : C.stone), false, w - 8);
        /* icon */
        ICONS[i](api, cx2, y + 43);
        /* best */
        if (best && best > 0) {
          api.txtCFit('' + best, cx2, y + h - 5, 6, C.gold, false, w - 8);
        }
        /* done stamp */
        if (done) {
          c.globalAlpha = 0.7;
          c.strokeStyle = C.green; c.lineWidth = 2;
          c.beginPath(); c.arc(x + w - 11, y + 11, 8, 0, Math.PI * 2); c.stroke();
          c.globalAlpha = 1;
          api.txtCFit('✓', x + w - 11, y + 9, 7, C.green, false, 14);
        }
      },
    },

    chapters: [

      /* ═══ 1. THE RAT PLAGUE — tap/drive rats from the town square ═══ */
      {
        id: 'rats', name: 'THE RAT PLAGUE', sub: 'HAMELIN IS OVERRUN',
        icon: function (api, x, y) { ICONS[0](api, x, y); },
        intro: [
          'THE YEAR 1284.',
          'HAMELIN IS PLAGUED',
          'WITH RATS.',
          'They gnaw the food stores.',
          'Drive them from the square!',
        ],
        quote: '"They fought the dogs and killed the cats, and bit the babies in the cradles." — Robert Browning',
        help: 'TAP rats before they reach the food barrels! Drive 12 away. 3 escape = over.',
        winText: 'The rats scatter! Hamelin breathes again — but the square is still filthy.',
        loseText: 'The rats overwhelmed the stores. Hamelin is on the brink of famine.',

        init: function (api) {
          this.drove    = 0;
          this.target   = 12;
          this.escapes  = 0;
          this.escMax   = 3;
          this.timer    = 0;
          this.limit    = 28;
          this.rats     = [];
          this.spawnT   = 0;
          this.spawnInt = 1.7;
          this.hitFx    = [];
          this.spd      = 52;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer += dt;

          /* spawn */
          this.spawnT -= dt;
          if (this.spawnT <= 0 && this.rats.length < 8) {
            var side = Math.random() < 0.5 ? -1 : 1;
            var ry = H * 0.44 + Math.random() * H * 0.28;
            var spd = this.spd + this.timer * 2.8;
            this.rats.push({ x: side < 0 ? -24 : W + 24, y: ry, dir: side, spd: spd, alive: true, phase: Math.random() * 6 });
            this.spawnT = this.spawnInt * (0.72 + Math.random() * 0.56);
            this.spawnInt = Math.max(0.7, this.spawnInt - 0.02);
          }

          /* move */
          for (var i = 0; i < this.rats.length; i++) {
            this.rats[i].x += this.rats[i].dir * this.rats[i].spd * dt;
            this.rats[i].phase += dt;
          }

          /* tap to drive */
          if (api.pointer.justDown) {
            var px = api.pointer.x, py = api.pointer.y;
            for (var ri = 0; ri < this.rats.length; ri++) {
              var r = this.rats[ri];
              if (r.alive && Math.abs(r.x - px) < 28 && Math.abs(r.y - py) < 22) {
                r.alive = false;
                this.drove++;
                api.addScore(18);
                api.burst(r.x, r.y, C.ratGr, 7);
                api.audio.sfx('blip');
                this.hitFx.push({ x: r.x, y: r.y, t: 0.55 });
                break;
              }
            }
          }

          /* check escapes and clean up */
          var exitL = 22, exitR = W - 22;
          for (var ri2 = 0; ri2 < this.rats.length; ri2++) {
            var r2 = this.rats[ri2];
            if (!r2.alive) continue;
            if ((r2.dir > 0 && r2.x > exitR) || (r2.dir < 0 && r2.x < exitL)) {
              r2.alive = false;
              this.escapes++;
            }
          }
          this.rats = this.rats.filter(function (r) { return r.alive && r.x > -50 && r.x < W + 50; });
          this.hitFx = this.hitFx.filter(function (e) { e.t -= dt; return e.t > 0; });

          api.addScore(Math.floor(dt * 3));
          if (this.drove >= this.target)   { api.win();  return; }
          if (this.escapes >= this.escMax) { api.lose(); return; }
          if (this.timer >= this.limit)    { api.lose(); return; }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          /* day sky */
          var sky = c.createLinearGradient(0, 0, 0, H * 0.5);
          sky.addColorStop(0, '#4a7ab8'); sky.addColorStop(1, '#7a9ac8');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.5);

          /* buildings */
          var blds = [[0, 52], [48, 68], [130, 44], [176, 78], [238, 56]];
          for (var bi = 0; bi < blds.length; bi++) {
            var bx = blds[bi][0], bw = blds[bi][1];
            g.rect(bx, H * 0.5 - 32, bw, 32, '#8a6840');
            c.fillStyle = '#6a4820';
            c.beginPath(); c.moveTo(bx, H * 0.5 - 32); c.lineTo(bx + bw / 2, H * 0.5 - 50); c.lineTo(bx + bw, H * 0.5 - 32); c.closePath(); c.fill();
            c.globalAlpha = 0.5; g.rect(bx + bw * 0.25, H * 0.5 - 22, bw * 0.18, bw * 0.12, C.amberL); c.globalAlpha = 1;
          }

          /* cobblestone */
          c.fillStyle = C.stoneD; c.fillRect(0, H * 0.5, W, H * 0.5);
          c.globalAlpha = 0.3;
          for (var ci2 = 0; ci2 < 10; ci2++) for (var rj = 0; rj < 5; rj++) {
            c.strokeStyle = '#6a5030'; c.lineWidth = 1;
            c.strokeRect(ci2 * 28 + (rj % 2) * 14, H * 0.5 + rj * 22, 24, 18);
          }
          c.globalAlpha = 1;

          /* food barrels (targets) */
          var barrels = [[W * 0.1, H * 0.62], [W * 0.9, H * 0.62]];
          for (var bari = 0; bari < barrels.length; bari++) {
            var bx2 = barrels[bari][0], by2 = barrels[bari][1];
            g.rect(bx2 - 12, by2 - 22, 24, 26, '#7a5028');
            c.strokeStyle = C.amber; c.lineWidth = 2; c.strokeRect(bx2 - 12, by2 - 22, 24, 26);
            g.circle(bx2, by2 - 24, 10, '#6a4018');
            api.txtCFit('FOOD', bx2, by2 - 26, 5, C.amberL, false, 26);
          }

          /* rats */
          for (var ri3 = 0; ri3 < this.rats.length; ri3++) {
            var r3 = this.rats[ri3];
            drawRat(g, c, r3.x, r3.y, r3.dir, r3.phase);
          }

          /* hit fx */
          for (var fi = 0; fi < this.hitFx.length; fi++) {
            var e = this.hitFx[fi];
            c.globalAlpha = e.t * 2;
            api.txtCFit('SHOO!', e.x, e.y - 18, 8, C.amberL, false, 52);
            c.globalAlpha = 1;
          }

          /* escape indicators */
          for (var ei = 0; ei < this.escMax; ei++) {
            g.circle(W - 14 - ei * 18, 20, 6, ei < this.escapes ? C.red : '#2a1e10');
          }

          /* drove counter */
          api.txtCFit('DROVE: ' + this.drove + '/' + this.target, W / 2, 12, 7, C.amberL, false, W - 46);

          /* timer bar */
          var pct = Math.max(0, 1 - this.timer / this.limit);
          g.rect(0, H - 8, W, 8, '#0e0a06');
          g.rect(0, H - 8, W * pct, 8, pct > 0.4 ? C.green : C.amber);
          api.txtCFit(Math.ceil(this.limit - this.timer) + 's', W / 2, H - 16, 6, C.stoneD, false, W);
          api.topBar('RAT PLAGUE', api.score);
          api.scanlines();
        },
      },

      /* ═══ 2. THE BARGAIN — pendulum timing, play 8 perfect notes ═══ */
      {
        id: 'bargain', name: 'THE BARGAIN', sub: 'ONE THOUSAND GUILDERS',
        icon: function (api, x, y) { ICONS[1](api, x, y); },
        intro: [
          'A STRANGER IN MOTLEY',
          'STEPS FORWARD.',
          '"PLEASE YOUR HONORS,',
          'I AM ABLE TO DRAW ALL',
          'CREATURES WITH MY PIPE."',
        ],
        quote: '"A thousand guilders! The Mayor looked blue; so did the Corporation too." — Robert Browning',
        help: 'TAP when the pipe tip is in the GOLD ZONE to play a perfect note! 8 notes to seal the deal.',
        winText: 'Eight perfect notes! The Mayor shakes your hand — one thousand guilders agreed.',
        loseText: 'Too many wrong notes. The Mayor scoffs and slams the hall door.',

        init: function (api) {
          this.notes    = 0;
          this.target   = 8;
          this.misses   = 0;
          this.missMax  = 4;
          this.angle    = 0;
          this.angSpd   = 1.5;
          this.sweep    = 0;
          this.hitFlash = 0;
          this.missFlash= 0;
          this.labels   = [];
          this.pendLen  = 132;
        },
        update: function (api, dt) {
          this.angle  += this.angSpd * dt;
          this.sweep   = Math.sin(this.angle);
          /* speed up and zone narrows after each success */
          this.angSpd  = 1.5 + this.notes * 0.18 + this.misses * 0.08;
          /* zone: |sweep| > threshold (at extremes of swing) */
          var threshold = Math.max(0.72, 0.88 - this.notes * 0.02);

          this.hitFlash  = Math.max(0, this.hitFlash - dt);
          this.missFlash = Math.max(0, this.missFlash - dt);
          this.labels    = this.labels.filter(function (l) { l.t -= dt; return l.t > 0; });

          var tapped = api.pointer.justDown || api.keyPressed('a') || api.keyPressed('up');
          if (tapped) {
            var inZone = Math.abs(this.sweep) > threshold;
            if (inZone) {
              this.notes++;
              api.addScore(28);
              this.hitFlash = 0.35;
              api.burst(api.W / 2, api.H * 0.62, C.magic, 14);
              api.flash(C.magic, 0.1);
              api.audio.sfx('coin');
              this.labels.push({ text: 'PERFECT!', good: true, t: 0.65 });
              if (this.notes >= this.target) { api.win(); return; }
            } else {
              this.misses++;
              this.missFlash = 0.3;
              api.shake(5, 0.25);
              api.audio.sfx('hurt');
              this.labels.push({ text: 'MISS!', good: false, t: 0.5 });
              if (this.misses >= this.missMax) { api.lose(); return; }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          /* Mayor's hall interior */
          c.fillStyle = '#16120a'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#241a0e'; c.fillRect(0, 0, W, H * 0.52);
          /* stone brickwork */
          c.globalAlpha = 0.28;
          for (var bri = 0; bri < 3; bri++) for (var brj = 0; brj < 3; brj++) {
            c.strokeStyle = '#1a1006'; c.lineWidth = 1;
            c.strokeRect(brj * 94 + (bri % 2) * 47, bri * 38, 88, 32);
          }
          c.globalAlpha = 1;
          /* floor */
          c.fillStyle = '#1c1206'; c.fillRect(0, H * 0.52, W, H * 0.48);
          g.rect(0, H * 0.52, W, 4, '#3a2810');

          /* Mayor (seated right) */
          g.rect(W * 0.66, H * 0.32, 48, 50, C.guardL);
          g.circle(W * 0.66 + 24, H * 0.32 - 14, 14, C.stone);
          c.strokeStyle = C.gold; c.lineWidth = 3;
          c.beginPath(); c.arc(W * 0.66 + 24, H * 0.32 + 8, 12, 0, Math.PI); c.stroke();
          /* mayoral hat */
          c.fillStyle = '#4a3890'; c.fillRect(W * 0.66 + 10, H * 0.32 - 30, 28, 16);
          /* money bag in his hand */
          g.circle(W * 0.66 + 46, H * 0.32 + 14, 10, C.gold);
          api.txtCFit('1000', W * 0.66 + 46, H * 0.32 + 12, 5, C.stoneD, false, 18);

          /* pendulum pivot */
          var pivX = W / 2, pivY = H * 0.12;
          var swingA = this.sweep * 1.05; /* max ±60° */
          var tipX = pivX + Math.sin(swingA) * this.pendLen;
          var tipY = pivY + Math.cos(swingA) * this.pendLen;
          var threshold2 = Math.max(0.72, 0.88 - this.notes * 0.02);
          var inZone = Math.abs(this.sweep) > threshold2;

          /* gold zone arcs at extremes */
          c.globalAlpha = 0.2;
          c.fillStyle = C.gold;
          for (var za = 0; za < 2; za++) {
            var zSweep = za === 0 ? 1.0 : -1.0;
            c.beginPath(); c.moveTo(pivX, pivY);
            var zThresh = threshold2;
            for (var a = -0.18; a <= 0.18; a += 0.03) {
              var za2 = zSweep * zThresh + a * 0.8;
              c.lineTo(pivX + Math.sin(za2) * (this.pendLen + 12), pivY + Math.cos(za2) * (this.pendLen + 12));
            }
            c.closePath(); c.fill();
          }
          c.globalAlpha = 1;

          /* pipe arm */
          c.strokeStyle = inZone ? C.amberL : C.amber; c.lineWidth = 5;
          c.beginPath(); c.moveTo(pivX, pivY); c.lineTo(tipX, tipY); c.stroke();
          g.circle(pivX, pivY, 7, C.amberL);

          /* pipe tip */
          var tipR = inZone ? 14 : 9;
          var tipC = this.hitFlash > 0 ? C.magic : (this.missFlash > 0 ? C.red : (inZone ? C.amberL : C.stoneD));
          g.circle(tipX, tipY, tipR, tipC);
          if (inZone) {
            c.globalAlpha = 0.35; g.circle(tipX, tipY, tipR + 8, C.amberL); c.globalAlpha = 1;
          }
          if (this.hitFlash > 0) {
            c.globalAlpha = 0.5; g.circle(tipX, tipY, 22, C.magic); c.globalAlpha = 1;
          }

          /* label */
          for (var li2 = 0; li2 < this.labels.length; li2++) {
            var lbl = this.labels[li2];
            c.globalAlpha = Math.min(1, lbl.t * 2);
            api.txtCFit(lbl.text, W / 2, H * 0.63, 12, lbl.good ? C.magic : C.red, false, W - 20);
            c.globalAlpha = 1;
          }

          /* progress dots (notes) */
          var sp = (W - 32) / this.target;
          for (var ni = 0; ni < this.target; ni++) {
            var nx2 = 16 + ni * sp + sp / 2;
            g.circle(nx2, H - 20, 6, ni < this.notes ? C.magic : '#281e0a');
            if (ni < this.notes) {
              c.globalAlpha = 0.45; g.circle(nx2, H - 20, 10, C.magic); c.globalAlpha = 1;
            }
          }

          /* miss indicators */
          for (var mi = 0; mi < this.missMax; mi++) {
            g.circle(W - 16 - mi * 18, 20, 6, mi < this.misses ? C.red : '#281808');
          }
          api.txtCFit('NOTES: ' + this.notes + '/' + this.target, W / 2, 11, 7, C.amber, false, W - 46);
          api.topBar('THE BARGAIN', api.score);
          api.scanlines();
        },
      },

      /* ═══ 3. PIPING THE RATS — steer Piper through streets to the river ═══ */
      {
        id: 'river', name: 'PIPING THE RATS', sub: 'TO THE RIVER WESER',
        icon: function (api, x, y) { ICONS[2](api, x, y); },
        intro: [
          'THE PIPER BEGINS TO PLAY.',
          'FROM EVERY HOLE AND CRACK',
          'RATS COME TUMBLING OUT.',
          'Lead them through the streets',
          'to the River Weser!',
        ],
        quote: '"And out of the houses the rats came tumbling, great rats, small rats, lean rats, brawny rats..." — Browning',
        help: 'Steer the Piper left and right to dodge walls! Collect guilder coins. Reach the river in 24s.',
        winText: 'The rats plunge into the Weser and drown! Hamelin erupts in cheers!',
        loseText: 'The walls scattered the swarm. Some rats survive to breed again.',

        init: function (api) {
          this.lives   = 3;
          this.survive = 0;
          this.target  = 24;
          this.piperX  = api.W / 2;
          this.walls   = [];
          this.coins   = [];
          this.wallT   = 1.4;
          this.coinT   = 1.1;
          this.hitCD   = 0;
          this.spd     = 90;
          this.notes   = [];
          this.noteT   = 0.3;
          /* swarm trailing rats */
          this.swarm = [];
          for (var i = 0; i < 14; i++) {
            this.swarm.push({ ox: (Math.random() - 0.5) * 64, oy: 26 + Math.random() * 58, phase: Math.random() * 6 });
          }
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.survive += dt;
          this.spd = 90 + this.survive * 4;

          /* move piper */
          var mx = 0;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W / 2))  mx = -1;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= W / 2)) mx =  1;
          this.piperX = clamp(this.piperX + mx * 182 * dt, 26, W - 26);

          /* spawn wall obstacles from sides */
          this.wallT -= dt;
          if (this.wallT <= 0) {
            var fromLeft = Math.random() < 0.5;
            this.walls.push({ x: fromLeft ? 0 : W - 52, y: -32, w: 52, h: 32, spd: this.spd });
            this.wallT = 0.9 + Math.random() * 0.65;
          }

          /* spawn coins */
          this.coinT -= dt;
          if (this.coinT <= 0) {
            this.coins.push({ x: 22 + Math.random() * (W - 44), y: -12 });
            this.coinT = 0.75 + Math.random() * 0.45;
          }

          /* move objects */
          for (var wi = 0; wi < this.walls.length; wi++) this.walls[wi].y += this.walls[wi].spd * dt;
          for (var ci2 = 0; ci2 < this.coins.length; ci2++) this.coins[ci2].y += this.spd * 0.48 * dt;
          this.walls = this.walls.filter(function (w) { return w.y < H + 40; });
          this.coins = this.coins.filter(function (co) { return co.y < H + 24; });

          /* music note trail */
          this.noteT -= dt;
          if (this.noteT <= 0) {
            this.notes.push({ x: this.piperX + (Math.random() - 0.5) * 18, y: H * 0.5, t: 0.8 });
            this.noteT = 0.22 + Math.random() * 0.18;
          }
          for (var ni = 0; ni < this.notes.length; ni++) {
            this.notes[ni].t -= dt;
            this.notes[ni].y -= 30 * dt;
          }
          this.notes = this.notes.filter(function (n) { return n.t > 0; });

          /* collect coins */
          var piperY = H * 0.5;
          var self = this;
          this.coins = this.coins.filter(function (co) {
            if (Math.abs(co.x - self.piperX) < 20 && Math.abs(co.y - piperY) < 20) {
              api.addScore(22);
              api.burst(co.x, co.y, C.gold, 6);
              return false;
            }
            return true;
          });

          /* wall collision */
          if (this.hitCD > 0) {
            this.hitCD -= dt;
          } else {
            for (var wi2 = 0; wi2 < this.walls.length; wi2++) {
              var w = this.walls[wi2];
              if (this.piperX + 16 > w.x && this.piperX - 16 < w.x + w.w &&
                  piperY + 18 > w.y && piperY - 22 < w.y + w.h) {
                this.lives--;
                this.hitCD = 0.75;
                api.shake(5, 0.3);
                api.flash(C.red, 0.14);
                api.burst(this.piperX, piperY, C.red, 8);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }

          api.addScore(Math.floor(dt * 5));
          if (this.survive >= this.target) { api.win(); return; }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var scroll = (api.t * this.spd) % 60;
          var piperY = H * 0.5;

          /* scrolling cobblestone */
          c.fillStyle = '#8a6840'; c.fillRect(0, 0, W, H);
          c.globalAlpha = 0.28;
          for (var ri = -1; ri < 10; ri++) for (var ci3 = 0; ci3 < 5; ci3++) {
            c.strokeStyle = '#6a4820'; c.lineWidth = 1;
            c.strokeRect(ci3 * 56 + (ri % 2) * 28 - 14, ri * 44 + scroll - 44, 50, 38);
          }
          c.globalAlpha = 1;

          /* building walls flanking the street */
          c.fillStyle = '#5a3e1e';
          c.fillRect(0, 0, 24, H);
          c.fillRect(W - 24, 0, 24, H);
          c.strokeStyle = '#3a2810'; c.lineWidth = 2;
          c.strokeRect(0, 0, 24, H);
          c.strokeRect(W - 24, 0, 24, H);
          /* animated windows */
          for (var wi3 = 0; wi3 < 5; wi3++) {
            var wy = (wi3 * 92 + scroll * 2) % (H + 60) - 30;
            c.globalAlpha = 0.45;
            g.rect(4, wy, 14, 11, C.amberL);
            g.rect(W - 20, wy, 14, 11, C.amberL);
            c.globalAlpha = 1;
          }

          /* river hint at top */
          g.rect(0, 0, W, 20, '#14305a');
          api.txtCFit('RIVER WESER ▲', W / 2, 7, 6, C.riverL, false, W - 10);

          /* wall obstacles */
          for (var wi4 = 0; wi4 < this.walls.length; wi4++) {
            var wall = this.walls[wi4];
            g.rect(wall.x, wall.y, wall.w, wall.h, '#5a3e1e');
            c.strokeStyle = C.stoneD; c.lineWidth = 2;
            c.strokeRect(wall.x, wall.y, wall.w, wall.h);
          }

          /* coins */
          for (var ci4 = 0; ci4 < this.coins.length; ci4++) {
            var co = this.coins[ci4];
            g.circle(co.x, co.y, 7, C.gold);
            g.circle(co.x, co.y, 4, C.amberL);
          }

          /* trailing rat swarm */
          for (var si2 = 0; si2 < this.swarm.length; si2++) {
            var sr = this.swarm[si2];
            var srx = this.piperX + sr.ox + Math.sin(api.t * 2.8 + sr.phase) * 7;
            var sry = piperY + sr.oy + Math.cos(api.t * 2.3 + sr.phase) * 5;
            drawRat(g, c, srx, sry, srx < this.piperX ? -1 : 1, api.t + sr.phase);
          }

          /* note trail */
          for (var ni2 = 0; ni2 < this.notes.length; ni2++) {
            var n = this.notes[ni2];
            c.globalAlpha = n.t * 1.1;
            g.circle(n.x, n.y, 4, C.magic);
            g.rect(n.x + 4, n.y - 10, 2, 10, C.magicL);
            c.globalAlpha = 1;
          }

          /* piper */
          var flash2 = this.hitCD > 0 && Math.floor(this.hitCD * 8) % 2 === 0;
          drawPiper(g, c, this.piperX, piperY, api.t, flash2);

          /* lives */
          for (var li3 = 0; li3 < this.lives; li3++) g.circle(14 + li3 * 20, H - 20, 5, C.amberL);

          /* progress bar */
          var pct2 = Math.min(1, this.survive / this.target);
          g.rect(0, H - 8, W, 8, '#0e0a06');
          g.rect(0, H - 8, W * pct2, 8, C.river);
          api.txtCFit(Math.ceil(this.target - this.survive) + 's', W / 2, H - 16, 6, C.stoneD, false, W);
          api.topBar('PIPING THE RATS', api.score);
          api.scanlines();
        },
      },

      /* ═══ 4. THE BETRAYAL — dodge guards when Mayor breaks his word ═══ */
      {
        id: 'betrayal', name: 'THE BETRAYAL', sub: 'FIFTY GUILDERS!',
        icon: function (api, x, y) { ICONS[3](api, x, y); },
        intro: [
          'THE RATS ARE DROWNED!',
          'THE MAYOR GRINS.',
          '"FIFTY GUILDERS," HE SAYS.',
          '"Not a penny more, fellow."',
          'The guards advance!',
        ],
        quote: '"Do you think I brook being worse treated than a cook?" — The Pied Piper',
        help: 'The Mayor\'s guards are charging! Dodge left and right to survive 24 seconds!',
        winText: 'You escape the square! The pipe trembles in your hands with a new, darker song.',
        loseText: 'The guards drive you out. The Mayor laughs from his window.',

        init: function (api) {
          this.lives   = 3;
          this.survive = 0;
          this.target  = 24;
          this.piperX  = api.W / 2;
          this.guards  = [];
          this.coins   = [];
          this.guardT  = 1.4;
          this.coinT   = 0.95;
          this.hitCD   = 0;
          this.spd     = 115;
          this.shout   = [];
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.survive += dt;
          this.spd = 115 + this.survive * 4.5;

          /* piper movement */
          var mx2 = 0;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W / 2))  mx2 = -1;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= W / 2)) mx2 =  1;
          this.piperX = clamp(this.piperX + mx2 * 178 * dt, 26, W - 26);

          /* spawn guards in 3 lanes */
          this.guardT -= dt;
          if (this.guardT <= 0) {
            var lanes = [W * 0.22, W * 0.5, W * 0.78];
            var lane = lanes[Math.floor(Math.random() * 3)];
            this.guards.push({ x: lane, y: -32, spd: this.spd });
            this.guardT = 0.78 + Math.random() * 0.52;
            if (this.survive > 10) this.guardT *= 0.82;
          }

          /* spawn coins */
          this.coinT -= dt;
          if (this.coinT <= 0) {
            this.coins.push({ x: 22 + Math.random() * (W - 44), y: -12 });
            this.coinT = 0.85 + Math.random() * 0.45;
          }

          /* move everything */
          for (var gi = 0; gi < this.guards.length; gi++) this.guards[gi].y += this.guards[gi].spd * dt;
          for (var ci5 = 0; ci5 < this.coins.length; ci5++) this.coins[ci5].y += 78 * dt;
          this.guards = this.guards.filter(function (gu) { return gu.y < H + 40; });
          this.coins  = this.coins.filter(function (co) { return co.y < H + 24; });
          this.shout  = this.shout.filter(function (s) { s.t -= dt; return s.t > 0; });

          /* collect coins */
          var piperY2 = H * 0.72;
          var self2 = this;
          this.coins = this.coins.filter(function (co) {
            if (Math.abs(co.x - self2.piperX) < 20 && Math.abs(co.y - piperY2) < 20) {
              api.addScore(16);
              api.burst(co.x, co.y, C.gold, 5);
              return false;
            }
            return true;
          });

          /* guard collision */
          if (this.hitCD > 0) {
            this.hitCD -= dt;
          } else {
            for (var gi2 = 0; gi2 < this.guards.length; gi2++) {
              var gu = this.guards[gi2];
              if (Math.abs(gu.x - this.piperX) < 24 && gu.y > piperY2 - 32 && gu.y < piperY2 + 14) {
                this.lives--;
                this.hitCD = 0.8;
                api.shake(6, 0.35);
                api.flash(C.guard, 0.18);
                api.burst(this.piperX, piperY2, C.guard, 8);
                api.audio.sfx('hurt');
                this.shout.push({ x: this.piperX, y: piperY2 - 32, t: 0.6 });
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }

          api.addScore(Math.floor(dt * 6));
          if (this.survive >= this.target) { api.win(); return; }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var piperY3 = H * 0.72;

          /* town square - confrontation */
          c.fillStyle = '#140e06'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#281a08'; c.fillRect(0, H * 0.28, W, H * 0.72);
          /* cobblestone */
          c.globalAlpha = 0.2;
          for (var ri4 = 0; ri4 < 8; ri4++) for (var ci6 = 0; ci6 < 6; ci6++) {
            c.strokeStyle = '#1a1006'; c.lineWidth = 1;
            c.strokeRect(ri4 * 36 + (ci6 % 2) * 18, H * 0.28 + ci6 * 28, 32, 24);
          }
          c.globalAlpha = 1;
          /* Mayor's hall doorway at top */
          g.rect(W * 0.28, 0, W * 0.44, H * 0.28, '#201608');
          c.strokeStyle = C.amber; c.lineWidth = 3;
          c.strokeRect(W * 0.28, 0, W * 0.44, H * 0.28);
          g.rect(W * 0.41, H * 0.08, W * 0.18, H * 0.2, '#0a0806');
          c.fillStyle = C.stoneD;
          c.beginPath(); c.arc(W / 2, H * 0.08, W * 0.09, Math.PI, 0); c.fill();

          /* Mayor in doorway (smug) */
          var mx3 = W / 2, myY = H * 0.18;
          g.circle(mx3, myY - 14, 10, C.stone);
          g.rect(mx3 - 10, myY - 4, 20, 24, C.guardL);
          c.fillStyle = '#4a3890'; c.fillRect(mx3 - 10, myY - 26, 20, 12);
          /* money bag showing 50 */
          g.circle(mx3 - 18, myY, 10, C.gold);
          api.txtCFit('50!', mx3 - 18, myY - 3, 5, C.stoneD, false, 18);

          /* coins raining */
          for (var ci7 = 0; ci7 < this.coins.length; ci7++) {
            var co2 = this.coins[ci7];
            g.circle(co2.x, co2.y, 6, C.guild);
            g.circle(co2.x, co2.y, 3, C.amberL);
          }

          /* guards */
          for (var gi3 = 0; gi3 < this.guards.length; gi3++) {
            drawGuard(g, c, this.guards[gi3].x, this.guards[gi3].y);
          }

          /* shout fx */
          for (var si3 = 0; si3 < this.shout.length; si3++) {
            var sh = this.shout[si3];
            c.globalAlpha = sh.t * 1.6;
            api.txtCFit('OOF!', sh.x, sh.y, 10, C.red, false, 52);
            c.globalAlpha = 1;
          }

          /* piper */
          var flash3 = this.hitCD > 0 && Math.floor(this.hitCD * 8) % 2 === 0;
          drawPiper(g, c, this.piperX, piperY3, api.t, flash3);

          /* lives */
          for (var li4 = 0; li4 < this.lives; li4++) g.circle(14 + li4 * 20, H - 20, 5, C.amberL);

          /* survive bar */
          var pct3 = Math.min(1, this.survive / this.target);
          g.rect(0, H - 8, W, 8, '#0e0a06');
          g.rect(0, H - 8, W * pct3, 8, C.red);
          api.txtCFit(Math.ceil(this.target - this.survive) + 's', W / 2, H - 16, 6, C.stoneD, false, W);
          api.topBar('THE BETRAYAL', api.score);
          api.scanlines();
        },
      },

      /* ═══ 5. THE MOUNTAIN — rhythm, tap notes to lead the children ═══ */
      {
        id: 'mountain', name: 'THE MOUNTAIN', sub: "THE PIPER'S REVENGE",
        icon: function (api, x, y) { ICONS[4](api, x, y); },
        intro: [
          'THE PIPER RETURNS',
          'AND PLAYS A DIFFERENT TUNE.',
          'IT IS SWEETER. SADDER.',
          'The children rise and follow.',
          'The mountain door opens...',
        ],
        quote: '"And when all were in to the very last, the door in the mountain-side shut fast." — Robert Browning',
        help: 'Tap LEFT · CENTER · RIGHT to catch the falling BLUE notes! Avoid the RED ones. 12 to lead the children.',
        winText: 'The children follow into the mountain. The door shuts. They are never seen again.',
        loseText: 'Three red notes! The tune breaks — some children run back to their parents.',

        init: function (api) {
          this.notes    = 0;
          this.target   = 12;
          this.misses   = 0;
          this.missMax  = 3;
          this.cols     = [api.W * 0.22, api.W * 0.5, api.W * 0.78];
          this.falling  = [];
          this.spawnT   = 0;
          this.spawnInt = 0.9;
          this.hitFx    = [];
          this.children = [];
          this.childT   = 0.55;
          this.done     = false;
          for (var ci8 = 0; ci8 < 6; ci8++) {
            this.children.push({ x: -22 - ci8 * 26, y: api.H * 0.62 + Math.random() * 20, phase: ci8 * 0.52 });
          }
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          if (this.done) return;
          var progress = this.notes / this.target;

          /* spawn notes */
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var col = Math.floor(Math.random() * 3);
            var isRed = Math.random() < 0.18 + progress * 0.14;
            this.falling.push({
              x: this.cols[col], y: -18, col: col,
              red: isRed, spd: 125 + this.notes * 7
            });
            this.spawnT = this.spawnInt * (0.7 + Math.random() * 0.55);
            this.spawnInt = Math.max(0.45, 0.9 - this.notes * 0.032);
          }

          /* move notes */
          for (var fi2 = 0; fi2 < this.falling.length; fi2++) this.falling[fi2].y += this.falling[fi2].spd * dt;

          /* move children */
          for (var ci9 = 0; ci9 < this.children.length; ci9++) {
            this.children[ci9].x += (38 + progress * 28) * dt;
          }
          /* spawn more children */
          this.childT -= dt;
          if (this.childT <= 0 && this.children.length < 16) {
            this.children.push({ x: -24, y: H * 0.6 + Math.random() * 28, phase: Math.random() * 3 });
            this.childT = 0.48 + Math.random() * 0.28;
          }
          this.children = this.children.filter(function (ch) { return ch.x < W + 34; });
          this.hitFx = this.hitFx.filter(function (e) { e.t -= dt; return e.t > 0; });

          /* input: three column taps */
          var tapL = api.keyPressed('left')  || (api.pointer.justDown && api.pointer.x < W * 0.38);
          var tapM = api.keyPressed('a')     || (api.pointer.justDown && api.pointer.x >= W * 0.38 && api.pointer.x < W * 0.64);
          var tapR = api.keyPressed('right') || (api.pointer.justDown && api.pointer.x >= W * 0.64);
          var tapped3 = [];
          if (tapL) tapped3.push(0);
          if (tapM) tapped3.push(1);
          if (tapR) tapped3.push(2);

          /* catch zone */
          var catchY = H * 0.79;
          var self3 = this;
          this.falling = this.falling.filter(function (n) {
            if (n.y > catchY - 22 && n.y < catchY + 30) {
              if (tapped3.indexOf(n.col) >= 0) {
                if (n.red) {
                  self3.misses++;
                  api.shake(5, 0.25);
                  api.flash(C.red, 0.14);
                  api.audio.sfx('hurt');
                  self3.hitFx.push({ x: n.x, y: catchY, t: 0.5, good: false });
                  if (self3.misses >= self3.missMax) { self3.done = true; api.lose(); }
                } else {
                  self3.notes++;
                  api.addScore(22);
                  api.burst(n.x, catchY, C.magic, 9);
                  api.audio.sfx('coin');
                  self3.hitFx.push({ x: n.x, y: catchY, t: 0.62, good: true });
                  if (self3.notes >= self3.target) { self3.done = true; api.win(); }
                }
                return false;
              }
            }
            /* good note passes catch zone untouched */
            if (!n.red && n.y > catchY + 30) {
              self3.misses++;
              self3.hitFx.push({ x: n.x, y: catchY + 12, t: 0.4, good: false });
              if (self3.misses >= self3.missMax) { self3.done = true; api.lose(); }
              return false;
            }
            return n.y < H + 36;
          });
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var progress2 = this.notes / this.target;

          /* mountain twilight sky */
          var mSky = c.createLinearGradient(0, 0, 0, H);
          mSky.addColorStop(0, '#14082a'); mSky.addColorStop(0.5, '#2a1440'); mSky.addColorStop(1, '#3c2258');
          c.fillStyle = mSky; c.fillRect(0, 0, W, H);

          /* stars */
          for (var si4 = 0; si4 < 28; si4++) {
            var sx2 = (si4 * 71 + 13) % W, sy2 = (si4 * 53 + 9) % Math.floor(H * 0.44);
            c.globalAlpha = 0.35 + 0.45 * Math.abs(Math.sin(api.t * 0.75 + si4));
            g.rect(sx2, sy2, 2, 2, C.cream);
          }
          c.globalAlpha = 1;

          /* mountain silhouette */
          c.fillStyle = C.mtn;
          c.beginPath();
          c.moveTo(0, H);
          c.lineTo(0, H * 0.52);
          c.lineTo(W * 0.16, H * 0.28);
          c.lineTo(W * 0.36, H * 0.48);
          c.lineTo(W * 0.55, H * 0.18);
          c.lineTo(W * 0.72, H * 0.4);
          c.lineTo(W, H * 0.26);
          c.lineTo(W, H);
          c.closePath(); c.fill();

          /* mountain gate (glows with progress) */
          var gateX = W * 0.55, gateY = H * 0.18;
          c.globalAlpha = 0.28 + progress2 * 0.55;
          c.fillStyle = C.magic;
          c.beginPath(); c.arc(gateX, gateY + 18, 20, Math.PI, 0); c.fill();
          c.fillRect(gateX - 20, gateY + 18, 40, 20);
          c.globalAlpha = 1;
          c.fillStyle = '#08021a';
          c.beginPath(); c.arc(gateX, gateY + 18, 14, Math.PI, 0); c.fill();
          c.fillRect(gateX - 14, gateY + 18, 28, 16);

          /* ground */
          c.fillStyle = '#1c1206'; c.fillRect(0, H * 0.62, W, H * 0.38);
          c.globalAlpha = 0.18;
          for (var ri5 = 0; ri5 < 6; ri5++) for (var ci10 = 0; ci10 < 5; ci10++) {
            c.strokeStyle = '#281a08'; c.lineWidth = 1;
            c.strokeRect(ri5 * 48 - 24 + ci10 * 14, H * 0.64 + ci10 * 18, 42, 15);
          }
          c.globalAlpha = 1;

          /* lane guides */
          for (var li5 = 0; li5 < this.cols.length; li5++) {
            var col2 = this.cols[li5];
            c.globalAlpha = 0.1;
            c.fillStyle = C.magic;
            c.fillRect(col2 - 19, 0, 38, H * 0.86);
            c.globalAlpha = 0.3;
            c.fillStyle = C.mtnL;
            c.fillRect(col2 - 19, H * 0.79 - 18, 38, 34);
            c.globalAlpha = 1;
            api.txtCFit(li5 === 0 ? '◄' : (li5 === 1 ? '■' : '►'), col2, H - 14, 7, '#4a3870', false, 36);
          }

          /* falling notes */
          for (var fi3 = 0; fi3 < this.falling.length; fi3++) {
            var n2 = this.falling[fi3];
            var nc = n2.red ? C.disso : C.magic;
            g.circle(n2.x, n2.y, 10, nc);
            c.globalAlpha = 0.38; g.circle(n2.x, n2.y, 15, nc); c.globalAlpha = 1;
            if (!n2.red) {
              g.rect(n2.x + 10, n2.y - 20, 3, 18, C.magicL);
            } else {
              c.strokeStyle = '#ff3355'; c.lineWidth = 2;
              c.beginPath(); c.moveTo(n2.x - 5, n2.y - 5); c.lineTo(n2.x + 5, n2.y + 5);
              c.moveTo(n2.x + 5, n2.y - 5); c.lineTo(n2.x - 5, n2.y + 5); c.stroke();
            }
          }

          /* children marching */
          var childColors = [C.child, '#e8a040', '#40c880', '#e05050', '#a040e0', '#5080f0'];
          for (var chi = 0; chi < this.children.length; chi++) {
            var ch2 = this.children[chi];
            drawChild(g, c, ch2.x, ch2.y, api.t + ch2.phase, childColors[chi % childColors.length]);
          }

          /* piper at left, playing */
          drawPiper(g, c, W * 0.1, H * 0.68, api.t, false);

          /* hit fx */
          for (var fi4 = 0; fi4 < this.hitFx.length; fi4++) {
            var e2 = this.hitFx[fi4];
            c.globalAlpha = Math.min(1, e2.t * 1.5);
            api.txtCFit(e2.good ? 'NOTE!' : 'MISS!', e2.x, e2.y - 16, 9, e2.good ? C.magic : C.red, false, 62);
            c.globalAlpha = 1;
          }

          /* miss indicators */
          for (var mi2 = 0; mi2 < this.missMax; mi2++) {
            g.circle(18 + mi2 * 24, 22, 8, mi2 < this.misses ? C.red : '#20103a');
            if (mi2 < this.misses) {
              c.fillStyle = C.cream; c.font = 'bold 8px monospace';
              c.textAlign = 'center'; c.textBaseline = 'middle';
              c.fillText('✗', 18 + mi2 * 24, 22);
              c.textAlign = 'left'; c.textBaseline = 'alphabetic';
            }
          }

          /* note progress dots */
          var sp2 = (W - 32) / this.target;
          for (var ni3 = 0; ni3 < this.target; ni3++) {
            var nx3 = 16 + ni3 * sp2 + sp2 / 2;
            g.circle(nx3, H - 18, 5, ni3 < this.notes ? C.magic : '#201430');
          }

          api.txtCFit('NOTES: ' + this.notes + '/' + this.target, W / 2, 11, 7, C.magicL, false, W - 46);
          api.topBar('THE MOUNTAIN', api.score);
          api.scanlines();
        },
      },
    ],
  });
})();
