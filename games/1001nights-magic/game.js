/* ============================================================================
 * A THOUSAND NIGHTS — One Thousand and One Nights (Arabic folklore)
 *   1. THE SULTAN'S EAR    — pendulum-tap timing: Scheherazade holds the Sultan (10 hits)
 *   2. THE ROC'S SHADOW    — steer Sinbad's ship through feathers & rocks (22 s)
 *   3. OPEN SESAME         — catch Ali Baba's gold bags, dodge daggers (12, 3 lives)
 *   4. THE GENIE'S WISH    — tap falling soldiers before they breach the palace (12)
 *   5. THE FLYING CARPET   — steer through palace spires to freedom (22 s)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
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

  /* ─── Emblem: magic lamp with genie smoke ─── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    var t = api.t !== undefined ? api.t : (Date.now() * 0.001);
    // Genie smoke wisps behind
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
    // Genie face
    c.globalAlpha = 0.7;
    c.fillStyle = C.smoke;
    c.beginPath(); c.arc(cx, cy - 44, 12, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    g.circle(cx, cy - 44, 8, C.smokeL);
    // Lamp body
    c.fillStyle = C.gold;
    c.beginPath(); c.ellipse(cx, cy - 4, 20, 10, 0, 0, Math.PI * 2); c.fill();
    // Spout
    c.fillStyle = C.goldL;
    c.beginPath();
    c.moveTo(cx + 16, cy - 4);
    c.quadraticCurveTo(cx + 28, cy - 12, cx + 22, cy - 18);
    c.quadraticCurveTo(cx + 14, cy - 10, cx + 10, cy - 4);
    c.closePath(); c.fill();
    // Base
    c.fillStyle = C.copper;
    c.beginPath(); c.ellipse(cx, cy + 6, 16, 6, 0, 0, Math.PI * 2); c.fill();
    // Handle
    c.lineWidth = 4; c.strokeStyle = C.gold;
    c.beginPath(); c.arc(cx - 18, cy - 4, 8, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
    // Flame
    c.globalAlpha = 0.8 + 0.15 * Math.sin(t * 5);
    c.fillStyle = C.amber;
    c.beginPath(); c.ellipse(cx + 20, cy - 22, 4, 7, -0.3, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    // Orbiting stars
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
    // Sky gradient
    var sky = c.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, C.night);
    sky.addColorStop(0.5, C.indigo);
    sky.addColorStop(1, C.dkblue);
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    // Stars
    var i;
    for (i = 0; i < 55; i++) {
      var sx = (i * 53 + 7) % W, sy = (i * 97 + 3) % (H * 0.55);
      var sa = 0.15 + 0.55 * Math.abs(Math.sin(t * 1.2 + i * 0.7));
      c.globalAlpha = sa;
      c.fillStyle = C.star;
      c.fillRect(sx, sy, (i % 3 === 0) ? 2 : 1, (i % 3 === 0) ? 2 : 1);
    }
    c.globalAlpha = 1;
    // Crescent moon
    c.globalAlpha = 0.88;
    c.fillStyle = C.moon;
    c.beginPath(); c.arc(50, 44, 22, 0, Math.PI * 2); c.fill();
    c.fillStyle = C.indigo;
    c.beginPath(); c.arc(60, 40, 17, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    // Palace silhouettes
    var horizY = H * 0.60;
    c.fillStyle = '#0e0826';
    c.beginPath(); c.moveTo(0, horizY + 20);
    for (var dx = 0; dx <= W; dx += 38) {
      c.quadraticCurveTo(dx + 19, horizY - 10 + (dx * 7 + 4) % 26, dx + 38, horizY + 12 + (dx * 3) % 16);
    }
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    // Minarets
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
      // Lantern glows on horizon
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
    // Hanging rope
    c.strokeStyle = C.copper; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(cx, y - 10); c.lineTo(cx, y + 4); c.stroke();
    for (var ci = 0; ci < 3; ci++) {
      c.strokeStyle = C.goldL; c.lineWidth = 1;
      c.beginPath(); c.ellipse(cx, y - 8 + ci * 4, 2, 3, 0, 0, Math.PI * 2); c.stroke();
    }
    // Outer glow
    if (sel || done) {
      c.globalAlpha = sel ? (0.22 + 0.12 * Math.sin(t * 3)) : 0.10;
      c.fillStyle = done ? C.teal : C.amber;
      c.beginPath(); c.ellipse(cx, cy, w * 0.58, h * 0.54, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    }
    // Lantern hex body
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
    // Inner panel glow
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
    // Cap & base bar
    c.fillStyle = C.gold;
    c.fillRect(cx - 13, y + 2, 26, 5);
    c.fillRect(cx - 13, y + h - 7, 26, 5);
    // Corner gems
    g.circle(cx - 9, y + 4, 2.5, C.amber);
    g.circle(cx + 9, y + 4, 2.5, C.amber);
    g.circle(cx - 9, y + h - 4, 2.5, C.amber);
    g.circle(cx + 9, y + h - 4, 2.5, C.amber);
    // Chapter icon
    if (ch.icon && !info.locked) ch.icon(api, x + 26, cy - 2);
    // Text
    var nameCol = done ? C.teal : (sel ? C.amber : C.goldL);
    api.txtCFit(ch.name, cx + 12, cy - 12, 7, nameCol, true, w - 52);
    api.txtCFit(ch.sub || '', cx + 12, cy + 4, 6, sel ? C.parch : C.dust, true, w - 52);
    // Done badge
    if (done) {
      c.globalAlpha = 0.88; c.fillStyle = C.teal;
      c.font = "bold 10px 'Press Start 2P'";
      c.textAlign = 'right'; c.textBaseline = 'top';
      c.fillText('☽', x + w - 8, y + 8);
      c.textAlign = 'left'; c.globalAlpha = 1;
    }
    // Selection arrow
    if (sel) {
      c.fillStyle = C.amber;
      c.beginPath(); c.moveTo(x + 2, cy); c.lineTo(x - 7, cy - 5); c.lineTo(x - 7, cy + 5); c.closePath(); c.fill();
    }
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
    bootCta:   'TAP TO HEAR THE TALE',
    menuLabel: 'A THOUSAND NIGHTS',
    menuHint:  'CHOOSE YOUR TALE',
    menuDone:  'ALL TALES ARE TOLD. SCHEHERAZADE LIVES.',
    finale: [
      'SCHEHERAZADE HAS',
      'TOLD HER LAST TALE.',
      '',
      'One thousand and one',
      'nights of stories,',
      'and the Sultan sets',
      'down his sword forever.',
      '',
      '"He who does not know',
      ' his past is lost in',
      ' the desert without',
      ' a star to follow."',
    ],

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
        // Header band
        var topGrad = c.createLinearGradient(0, 0, 0, 80);
        topGrad.addColorStop(0, C.night);
        topGrad.addColorStop(1, C.dkblue);
        c.fillStyle = topGrad; c.fillRect(0, 0, W, 80);
        // Stars
        var i;
        for (i = 0; i < 20; i++) {
          var sx = (i * 17 + 5) % W, sy = (i * 11 + 3) % 44;
          c.globalAlpha = 0.25 + 0.45 * Math.abs(Math.sin(t * 1.5 + i));
          c.fillStyle = C.star; c.fillRect(sx, sy, 1, 1);
        }
        c.globalAlpha = 1;
        // Crescent in header
        c.globalAlpha = 0.82;
        c.fillStyle = C.moon;
        c.beginPath(); c.arc(W - 30, 28, 15, 0, Math.PI * 2); c.fill();
        c.fillStyle = C.dkblue;
        c.beginPath(); c.arc(W - 24, 25, 11, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 1;
        // Title scroll
        c.fillStyle = '#16102e'; c.fillRect(8, 10, W - 16, 58);
        c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(8, 10, W - 16, 58);
        c.strokeStyle = C.copper; c.lineWidth = 1; c.strokeRect(11, 13, W - 22, 52);
        api.txtCFit('A THOUSAND NIGHTS', W / 2, 18, 9, C.goldL, true, W - 40);
        api.txtCFit(currency + ' COINS', W / 2, 38, 7, C.amber, true, W - 60);
        api.txtCFit('CHOOSE YOUR TALE', W / 2, 56, 6, C.teal, true, W - 60);
        // Ropes from header down to each lantern
        c.strokeStyle = C.copper; c.lineWidth = 1; c.globalAlpha = 0.4;
        for (var ri = 0; ri < CARD_LAYOUT.length; ri++) {
          var rl = CARD_LAYOUT[ri];
          c.beginPath(); c.moveTo(rl.x + rl.w / 2, 70); c.lineTo(rl.x + rl.w / 2, rl.y - 4); c.stroke();
        }
        c.globalAlpha = 1;
        // Ambient sparkles in menu area
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
       * 1. THE SULTAN'S EAR — pendulum-tap timing (10 successes, 3 misses)
       * Scheherazade must strike the golden ink zone to spin her tale.
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
          'Scheherazade begins',
          'her tale — but the',
          'Sultan grows restless.',
          'Keep him captivated!',
        ],
        quote: '"Once upon a time and a long, long time ago..." — One Thousand and One Nights',
        help: 'TAP when the quill touches the GOLDEN INK ZONE!',
        winText: "The Sultan leans forward, enchanted. The night is saved — and Scheherazade with it.",
        loseText: "The Sultan yawned. The tale was lost and silence fell over the palace.",
        init: function (api) {
          this.swings = 0;
          this.need   = 10;
          this.misses = 0;
          this.maxMis = 3;
          this.angle  = 0;
          this.dir    = 1;
          this.spd    = 0.72;
          this.zone   = 0.16;
          this.pause  = 0;
          this.result = null;
        },
        update: function (api, dt) {
          if (this.pause > 0) { this.pause -= dt; return; }
          var maxA = Math.PI / 3;
          this.angle += this.dir * this.spd * dt;
          if (this.angle > maxA)  { this.angle = maxA;  this.dir = -1; }
          if (this.angle < -maxA) { this.angle = -maxA; this.dir =  1; }
          if (api.confirm()) {
            if (Math.abs(this.angle) < this.zone) {
              this.swings++;
              this.result = 'hit';
              api.addScore(20); api.audio.sfx('power');
              api.shake(3, 0.12);
              api.burst(api.W / 2, api.H * 0.55, C.goldL, 12);
              this.spd  = Math.min(2.2, this.spd + 0.18);
              this.zone = Math.max(0.07, this.zone - 0.008);
              this.pause = 0.34;
              if (this.swings >= this.need) { api.addScore(60); api.win(); }
            } else {
              this.misses++;
              this.result = 'miss';
              api.audio.sfx('hurt'); api.shake(4, 0.18);
              this.pause = 0.38;
              if (this.misses >= this.maxMis) { api.lose(); }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Throne room
          c.fillStyle = C.dome; c.fillRect(0, 0, W, H);
          // Arched niches
          var archY = H * 0.28;
          c.fillStyle = '#120938';
          var ai;
          for (ai = 0; ai < 4; ai++) {
            var ax = 18 + ai * 62;
            c.fillRect(ax, archY, 46, H - archY);
            c.beginPath(); c.arc(ax + 23, archY, 23, Math.PI, 0); c.fill();
          }
          // Overhead lanterns
          var li2;
          for (li2 = 0; li2 < 3; li2++) {
            var lx2 = 50 + li2 * 84, ly2 = 56;
            c.globalAlpha = 0.16; c.fillStyle = C.amber;
            c.beginPath(); c.arc(lx2, ly2, 20, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1; g.circle(lx2, ly2, 5, C.amber);
            g.rect(lx2 - 2, ly2 - 14, 4, 14, C.copper);
          }
          // Silk curtains
          c.fillStyle = '#3a0c48'; c.fillRect(0, 0, 24, H); c.fillRect(W - 24, 0, 24, H);
          c.strokeStyle = C.silk; c.lineWidth = 1; c.globalAlpha = 0.5;
          c.beginPath(); c.moveTo(0, 0); c.lineTo(24, H / 3); c.stroke();
          c.beginPath(); c.moveTo(24, 0); c.lineTo(0, H / 2); c.stroke();
          c.beginPath(); c.moveTo(W, 0); c.lineTo(W - 24, H / 3); c.stroke();
          c.beginPath(); c.moveTo(W - 24, 0); c.lineTo(W, H / 2); c.stroke();
          c.globalAlpha = 1;
          // Inkwell
          var inkX = W / 2, inkY = H * 0.72;
          g.rect(inkX - 14, inkY - 8, 28, 20, C.copper);
          g.circle(inkX, inkY - 8, 14, C.copper);
          c.fillStyle = C.gold;
          c.beginPath(); c.ellipse(inkX, inkY - 8, 10, 6, 0, 0, Math.PI * 2); c.fill();
          // Zone arc
          var qLen = 136;
          c.save();
          c.translate(inkX, inkY - 8);
          c.globalAlpha = 0.24; c.strokeStyle = C.goldL; c.lineWidth = 14;
          c.beginPath(); c.arc(0, 0, qLen, -Math.PI / 2 - this.zone, -Math.PI / 2 + this.zone);
          c.stroke(); c.globalAlpha = 1; c.restore();
          // Quill pendulum
          var qTipX = inkX + Math.sin(this.angle) * qLen;
          var qTipY = inkY - 8 - Math.cos(this.angle) * qLen;
          c.strokeStyle = C.amber; c.lineWidth = 3;
          c.beginPath(); c.moveTo(inkX, inkY - 8); c.lineTo(qTipX, qTipY); c.stroke();
          c.fillStyle = C.ivory;
          c.beginPath(); c.moveTo(qTipX - 5, qTipY); c.lineTo(qTipX + 5, qTipY); c.lineTo(qTipX, qTipY - 14); c.closePath(); c.fill();
          g.circle(qTipX, qTipY + 2, 4, C.amber);
          // Flash feedback
          if (this.result === 'hit' && this.pause > 0.2) {
            c.globalAlpha = 0.4; c.fillStyle = C.gold; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
          } else if (this.result === 'miss' && this.pause > 0.2) {
            c.globalAlpha = 0.28; c.fillStyle = C.ruby; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
          }
          // HUD
          api.topBar('TALES: ' + this.swings + ' / ' + this.need);
          var hi;
          for (hi = 0; hi < 3; hi++) g.circle(W - 38 + hi * 13, 20, 4, hi < (3 - this.misses) ? C.teal : '#1a0c28');
          api.vignette(); api.scanlines();
        },
      },

      /* ==============================================================
       * 2. THE ROC'S SHADOW — steer Sinbad's ship (22 s, 3 lives)
       * Sinbad's 2nd Voyage: the monstrous Roc blots out the sun.
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
          'returns with prey,',
          'its wings blotting',
          'out the whole sky!',
        ],
        quote: '"Its wings darkened the sun and the earth shook with its cry." — Sinbad\'s Second Voyage',
        help: 'STEER left/right to dodge Roc feathers and rocks!',
        winText: "Sinbad clung to the Roc's talon and soared to safety. Courage rewarded!",
        loseText: "The Roc's shadow swallowed Sinbad's ship. Lost at sea.",
        init: function (api) {
          this.shipX  = api.W / 2;
          this.lives  = 3;
          this.timer  = 0;
          this.dur    = 22;
          this.obs    = [];
          this.spawnT = 0;
          this.invT   = 0;
          this.waveY  = 0;
          this.rocX   = api.W * 0.65;
          this.rocDir = -1;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer += dt;
          if (this.invT > 0) this.invT -= dt;
          if (this.timer >= this.dur) { api.addScore(100); api.win(); return; }
          if (api.pointer.down) this.shipX = clamp(api.pointer.x, 26, W - 26);
          if (api.keyDown('left'))  this.shipX = clamp(this.shipX - 180 * dt, 26, W - 26);
          if (api.keyDown('right')) this.shipX = clamp(this.shipX + 180 * dt, 26, W - 26);
          this.waveY = (this.waveY + 90 * dt) % 48;
          this.rocX += this.rocDir * 26 * dt;
          if (this.rocX < 32) { this.rocX = 32; this.rocDir = 1; }
          if (this.rocX > W - 32) { this.rocX = W - 32; this.rocDir = -1; }
          // Spawn feathers and rocks
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.55, 1.8 - this.timer * 0.045);
            var kind = Math.random() < 0.65 ? 'feather' : 'rock';
            this.obs.push({ x: 22 + randI(0, W - 44), y: -32, kind: kind, vx: (Math.random() - 0.5) * 28 });
          }
          var spd = 85 + this.timer * 3.5;
          var i;
          for (i = 0; i < this.obs.length; i++) {
            this.obs[i].y += spd * dt;
            this.obs[i].x = clamp(this.obs[i].x + this.obs[i].vx * dt, 10, W - 10);
          }
          this.obs = this.obs.filter(function (o) { return o.y < H + 36; });
          if (this.invT <= 0) {
            var sy = H - 54;
            var j;
            for (j = 0; j < this.obs.length; j++) {
              var ob = this.obs[j];
              if (Math.abs(ob.x - this.shipX) < 22 && Math.abs(ob.y - sy) < 22) {
                this.lives--; this.invT = 1.4;
                api.shake(6, 0.24); api.flash(C.ruby, 0.18); api.audio.sfx('hurt');
                api.burst(this.shipX, sy, C.ruby, 10);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          // Ocean
          var seaGrad = c.createLinearGradient(0, H * 0.38, 0, H);
          seaGrad.addColorStop(0, '#0a2840');
          seaGrad.addColorStop(1, '#042028');
          c.fillStyle = seaGrad; c.fillRect(0, 0, W, H);
          // Sky darkened by Roc
          var skyGrad = c.createLinearGradient(0, 0, 0, H * 0.42);
          skyGrad.addColorStop(0, '#0c0618');
          skyGrad.addColorStop(1, '#142030');
          c.fillStyle = skyGrad; c.fillRect(0, 0, W, H * 0.42);
          // Roc silhouette
          c.globalAlpha = 0.5 + 0.12 * Math.sin(t * 0.8);
          c.fillStyle = '#060210';
          c.beginPath(); c.ellipse(this.rocX, 26, 88, 42, 0, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.ellipse(this.rocX - 70, 42, 48, 20, -0.3, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.ellipse(this.rocX + 70, 42, 48, 20, 0.3, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          // Waves
          c.strokeStyle = '#1a5080'; c.lineWidth = 1.5;
          var wy;
          for (wy = H * 0.38 + this.waveY; wy < H; wy += 24) {
            c.beginPath();
            var wx;
            for (wx = 0; wx < W; wx += 36) {
              c.moveTo(wx, wy + Math.sin(t * 2 + wx * 0.08) * 3);
              c.quadraticCurveTo(wx + 18, wy - 5, wx + 36, wy + Math.sin(t * 2 + (wx + 36) * 0.08) * 3);
            }
            c.stroke();
          }
          // Obstacles
          var oi;
          for (oi = 0; oi < this.obs.length; oi++) {
            var ob = this.obs[oi];
            if (ob.kind === 'feather') {
              c.fillStyle = C.smoke;
              c.beginPath();
              c.moveTo(ob.x, ob.y - 16);
              c.quadraticCurveTo(ob.x + 9, ob.y, ob.x, ob.y + 12);
              c.quadraticCurveTo(ob.x - 9, ob.y, ob.x, ob.y - 16);
              c.fill();
              c.strokeStyle = C.smokeL; c.lineWidth = 1;
              c.beginPath(); c.moveTo(ob.x, ob.y - 14); c.lineTo(ob.x, ob.y + 10); c.stroke();
            } else {
              g.circle(ob.x, ob.y, 11, C.wall);
              g.circle(ob.x - 3, ob.y - 2, 5, C.wallL);
            }
          }
          // Sinbad's ship
          var sy2 = H - 54;
          if (this.invT <= 0 || Math.floor(this.invT * 8) % 2 === 0) {
            g.rect(this.shipX - 20, sy2 + 4, 40, 14, C.sand);
            c.fillStyle = C.dust;
            c.beginPath(); c.moveTo(this.shipX - 20, sy2 + 18); c.lineTo(this.shipX + 20, sy2 + 18); c.lineTo(this.shipX + 14, sy2 + 26); c.lineTo(this.shipX - 14, sy2 + 26); c.closePath(); c.fill();
            c.fillStyle = C.ivory;
            c.beginPath(); c.moveTo(this.shipX, sy2 - 18); c.lineTo(this.shipX + 16, sy2 + 4); c.lineTo(this.shipX - 16, sy2 + 4); c.closePath(); c.fill();
            g.rect(this.shipX - 2, sy2 - 20, 4, 24, C.dust);
            c.fillStyle = C.goldL;
            c.beginPath(); c.arc(this.shipX + 2, sy2 - 20, 4.5, 0, Math.PI * 2); c.fill();
            c.fillStyle = C.indigo;
            c.beginPath(); c.arc(this.shipX + 4, sy2 - 21, 3, 0, Math.PI * 2); c.fill();
          }
          api.topBar('SURVIVE: ' + Math.max(0, Math.ceil(this.dur - this.timer)) + 's');
          var li;
          for (li = 0; li < 3; li++) g.circle(W - 38 + li * 13, 20, 4, li < this.lives ? C.teal : '#1a0c28');
          api.vignette();
        },
      },

      /* ==============================================================
       * 3. OPEN SESAME — catch gold bags, dodge daggers (12 bags, 3 lives)
       * Ali Baba fills the sacks before the Forty Thieves return!
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
          'THE THIEVES\' CAVE.',
          'Gold rains from the',
          'ceiling — but the',
          'forty thieves return!',
        ],
        quote: '"Open Sesame!" — Ali Baba and the Forty Thieves',
        help: 'MOVE left/right — catch GOLD BAGS, dodge DAGGERS!',
        winText: "Ali Baba filled his sacks and slipped away before the Forty Thieves returned.",
        loseText: "A thief's dagger found Ali Baba in the dark. The gold was lost.",
        init: function (api) {
          this.x      = api.W / 2;
          this.lives  = 3;
          this.caught = 0;
          this.need   = 12;
          this.items  = [];
          this.spawnT = 0;
          this.invT   = 0;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          if (this.invT > 0) this.invT -= dt;
          if (api.pointer.down) this.x = clamp(api.pointer.x, 22, W - 22);
          if (api.keyDown('left'))  this.x = clamp(this.x - 185 * dt, 22, W - 22);
          if (api.keyDown('right')) this.x = clamp(this.x + 185 * dt, 22, W - 22);
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var progress = this.caught / this.need;
            var isDagger = Math.random() < (0.22 + progress * 0.28);
            this.spawnT = isDagger ? (0.5 + Math.random() * 0.5) : (0.65 + Math.random() * 0.85);
            this.items.push({ x: 18 + randI(0, W - 36), y: -22, kind: isDagger ? 'dagger' : 'gold' });
          }
          var fallSpd = 95 + this.caught * 5;
          var i;
          for (i = 0; i < this.items.length; i++) this.items[i].y += fallSpd * dt;
          this.items = this.items.filter(function (o) { return o.y < H + 22; });
          var py = H - 44;
          var j;
          for (j = this.items.length - 1; j >= 0; j--) {
            var it = this.items[j];
            if (Math.abs(it.x - this.x) < 24 && Math.abs(it.y - py) < 22) {
              if (it.kind === 'gold') {
                this.caught++; api.addScore(15); api.audio.sfx('coin');
                api.burst(it.x, it.y, C.gold, 8);
                this.items.splice(j, 1);
                if (this.caught >= this.need) { api.addScore(80); api.win(); }
              } else if (this.invT <= 0) {
                this.lives--; this.invT = 1.3;
                api.shake(5, 0.22); api.flash(C.ruby, 0.16); api.audio.sfx('hurt');
                api.burst(this.x, py, C.ruby, 8);
                this.items.splice(j, 1);
                if (this.lives <= 0) { api.lose(); }
              }
              break;
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          // Cave
          c.fillStyle = '#0a0614'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#12082a';
          var ci;
          for (ci = 0; ci < 6; ci++) {
            c.beginPath(); c.arc((ci * 50 + 20) % W, (ci * 37 + 10) % (H * 0.7), 28 + (ci * 11) % 22, 0, Math.PI * 2); c.fill();
          }
          // Gem veins
          c.globalAlpha = 0.3;
          var vi;
          for (vi = 0; vi < 5; vi++) {
            c.strokeStyle = vi % 2 === 0 ? C.gem : C.teal; c.lineWidth = 1;
            c.beginPath(); c.moveTo((vi * 56 + 8) % W, (vi * 41 + 8) % (H * 0.6));
            c.lineTo((vi * 56 + 28) % W, (vi * 41 + 38) % (H * 0.6)); c.stroke();
          }
          c.globalAlpha = 1;
          // Glowing gems
          var gi2;
          for (gi2 = 0; gi2 < 4; gi2++) {
            var gx = (gi2 * 72 + 20) % (W - 20), gy = 80 + (gi2 * 63) % 160;
            c.globalAlpha = 0.10 + 0.09 * Math.sin(t * 2 + gi2);
            c.fillStyle = gi2 % 2 === 0 ? C.gem : C.teal;
            c.beginPath(); c.arc(gx, gy, 13, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            g.circle(gx, gy, 4, gi2 % 2 === 0 ? C.gem : C.tealL);
          }
          // Items
          var ii;
          for (ii = 0; ii < this.items.length; ii++) {
            var it = this.items[ii];
            if (it.kind === 'gold') {
              g.circle(it.x, it.y, 10, C.gold);
              g.circle(it.x, it.y - 2, 7, C.goldL);
              g.rect(it.x - 3, it.y - 16, 6, 8, C.sand);
              c.strokeStyle = C.copper; c.lineWidth = 1.5;
              c.beginPath(); c.arc(it.x, it.y - 10, 4, Math.PI, 0); c.stroke();
            } else {
              c.fillStyle = C.ivory;
              c.beginPath(); c.moveTo(it.x, it.y + 14); c.lineTo(it.x - 5, it.y - 6); c.lineTo(it.x + 5, it.y - 6); c.closePath(); c.fill();
              c.fillRect(it.x - 7, it.y - 10, 14, 6);
              c.fillStyle = C.sand; c.fillRect(it.x - 4, it.y - 24, 8, 16);
            }
          }
          // Ali Baba
          var py2 = H - 44;
          if (this.invT <= 0 || Math.floor(this.invT * 8) % 2 === 0) {
            c.fillStyle = '#38205e';
            c.beginPath(); c.moveTo(this.x - 12, py2 + 14); c.lineTo(this.x + 12, py2 + 14); c.lineTo(this.x + 10, py2 - 8); c.lineTo(this.x - 10, py2 - 8); c.closePath(); c.fill();
            g.circle(this.x, py2 - 16, 10, '#d8a878');
            c.fillStyle = C.teal;
            c.beginPath(); c.arc(this.x, py2 - 20, 11, Math.PI, 0); c.fill();
            g.rect(this.x - 11, py2 - 20, 22, 6, C.teal);
            g.circle(this.x + 16, py2 - 2, 8, C.sand);
            g.circle(this.x + 16, py2 - 4, 5, C.sandL);
          }
          api.topBar('BAGS: ' + this.caught + ' / ' + this.need);
          var li3;
          for (li3 = 0; li3 < 3; li3++) g.circle(W - 38 + li3 * 13, 20, 4, li3 < this.lives ? C.teal : '#1a0c28');
          api.vignette(); api.scanlines();
        },
      },

      /* ==============================================================
       * 4. THE GENIE'S WISH — tap falling soldiers before they breach (12)
       * Aladdin commands the Genie to defend the palace from Jafar!
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
          "ALADDIN FINDS THE",
          'MAGIC LAMP!',
          "But Jafar's soldiers",
          'storm the palace.',
          'Rub the lamp — command',
          'the Genie to defend!',
        ],
        quote: '"Thy wish is my command." — The Genie of the Lamp',
        help: 'TAP the SOLDIERS before they breach the palace gate!',
        winText: "The Genie's power scattered Jafar's forces. The palace stands!",
        loseText: "Jafar's soldiers overwhelmed the gate. The lamp grows cold.",
        init: function (api) {
          this.tapped   = 0;
          this.need     = 12;
          this.misses   = 0;
          this.maxMis   = 3;
          this.threats  = [];
          this.spawnT   = 0;
          this.sparks   = [];
          this.timer    = 0;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer += dt;
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var spd = 52 + this.tapped * 4.5;
            this.spawnT = Math.max(0.52, 1.4 - this.tapped * 0.065);
            this.threats.push({ x: 22 + randI(0, W - 44), y: -26, r: 16, spd: spd });
          }
          var i;
          for (i = 0; i < this.threats.length; i++) this.threats[i].y += this.threats[i].spd * dt;
          var groundY = H - 44;
          var j;
          for (j = this.threats.length - 1; j >= 0; j--) {
            if (this.threats[j].y > groundY) {
              this.threats.splice(j, 1);
              this.misses++;
              api.shake(5, 0.20); api.flash(C.ruby, 0.15); api.audio.sfx('hurt');
              if (this.misses >= this.maxMis) { api.lose(); return; }
            }
          }
          // Tap
          if (api.pointer.justDown) {
            var px = api.pointer.x, py2 = api.pointer.y;
            var k;
            for (k = this.threats.length - 1; k >= 0; k--) {
              var th = this.threats[k];
              var dx = px - th.x, dy = py2 - th.y;
              if (dx * dx + dy * dy < (th.r + 14) * (th.r + 14)) {
                this.threats.splice(k, 1);
                this.tapped++; api.addScore(18); api.audio.sfx('power');
                api.burst(px, py2, C.amber, 12);
                this.sparks.push({ x: px, y: py2, life: 0.45 });
                if (this.tapped >= this.need) { api.addScore(60); api.win(); }
                break;
              }
            }
          }
          // Keyboard: destroy nearest
          if (api.confirm()) {
            if (this.threats.length > 0) {
              var nearest = 0, bestY = -1;
              var n;
              for (n = 0; n < this.threats.length; n++) {
                if (this.threats[n].y > bestY) { nearest = n; bestY = this.threats[n].y; }
              }
              var nt = this.threats[nearest];
              this.threats.splice(nearest, 1);
              this.tapped++; api.addScore(18); api.audio.sfx('power');
              api.burst(nt.x, nt.y, C.amber, 12);
              this.sparks.push({ x: nt.x, y: nt.y, life: 0.45 });
              if (this.tapped >= this.need) { api.addScore(60); api.win(); }
            }
          }
          for (var si = this.sparks.length - 1; si >= 0; si--) {
            this.sparks[si].life -= dt;
            if (this.sparks[si].life <= 0) this.sparks.splice(si, 1);
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          // Palace courtyard
          var palGrad = c.createLinearGradient(0, 0, 0, H);
          palGrad.addColorStop(0, C.night);
          palGrad.addColorStop(1, C.dome);
          c.fillStyle = palGrad; c.fillRect(0, 0, W, H);
          // Stars
          var si2;
          for (si2 = 0; si2 < 22; si2++) {
            var stx = (si2 * 14 + 5) % W, sty = (si2 * 23 + 4) % (H * 0.55);
            c.globalAlpha = 0.18 + 0.28 * Math.abs(Math.sin(t * 1.4 + si2));
            c.fillStyle = C.star; c.fillRect(stx, sty, 1, 1);
          }
          c.globalAlpha = 1;
          // Palace gate (bottom)
          c.fillStyle = C.wall; c.fillRect(0, H - 54, W, 54);
          c.strokeStyle = C.goldL; c.lineWidth = 1.5; c.strokeRect(0, H - 54, W, 2);
          var ai2;
          for (ai2 = 0; ai2 < 3; ai2++) {
            var ax2 = 16 + ai2 * 84, aw2 = 78, ah2 = 80;
            c.fillStyle = '#1e1448'; c.fillRect(ax2, H - ah2, aw2, ah2);
            c.beginPath(); c.arc(ax2 + aw2 / 2, H - ah2, aw2 / 2, Math.PI, 0); c.fill();
          }
          // Genie laser beams
          var lampX = W / 2;
          var bi;
          for (bi = 0; bi < this.threats.length; bi++) {
            var th2 = this.threats[bi];
            c.globalAlpha = 0.06; c.strokeStyle = C.smoke; c.lineWidth = 2;
            c.setLineDash([4, 6]);
            c.beginPath(); c.moveTo(lampX, H - 30); c.lineTo(th2.x, th2.y); c.stroke();
            c.setLineDash([]); c.globalAlpha = 1;
          }
          // Soldiers
          var ti2;
          for (ti2 = 0; ti2 < this.threats.length; ti2++) {
            var th3 = this.threats[ti2];
            c.fillStyle = C.ruby;
            c.beginPath(); c.arc(th3.x, th3.y - 10, 8, 0, Math.PI * 2); c.fill();
            c.fillRect(th3.x - 8, th3.y - 2, 16, 18);
            c.strokeStyle = C.ivory; c.lineWidth = 2;
            c.beginPath(); c.moveTo(th3.x + 9, th3.y - 14); c.lineTo(th3.x + 9, th3.y + 12); c.stroke();
            c.fillStyle = C.amber;
            c.beginPath(); c.moveTo(th3.x + 5, th3.y - 14); c.lineTo(th3.x + 13, th3.y - 14); c.lineTo(th3.x + 9, th3.y - 22); c.closePath(); c.fill();
          }
          // Spark flashes
          var spk;
          for (spk = 0; spk < this.sparks.length; spk++) {
            var sp = this.sparks[spk];
            c.globalAlpha = sp.life / 0.45;
            c.fillStyle = C.amber;
            c.beginPath(); c.arc(sp.x, sp.y, (1 - sp.life / 0.45) * 28 + 8, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          }
          // Genie lamp at bottom center
          c.fillStyle = C.gold;
          c.beginPath(); c.ellipse(lampX, H - 28, 22, 10, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = C.goldL;
          c.beginPath(); c.moveTo(lampX + 18, H - 28); c.quadraticCurveTo(lampX + 30, H - 38, lampX + 24, H - 44); c.quadraticCurveTo(lampX + 14, H - 36, lampX + 10, H - 28); c.closePath(); c.fill();
          c.globalAlpha = 0.65 + 0.2 * Math.sin(t * 3);
          c.fillStyle = C.smoke;
          c.beginPath(); c.arc(lampX + 18, H - 50, 10, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          api.topBar('DEFEATED: ' + this.tapped + ' / ' + this.need);
          var mi;
          for (mi = 0; mi < 3; mi++) g.circle(W - 38 + mi * 13, 20, 4, mi < (3 - this.misses) ? C.teal : '#1a0c28');
          api.vignette();
        },
      },

      /* ==============================================================
       * 5. THE FLYING CARPET — steer through palace spires (22 s, 3 lives)
       * Race the magic carpet to the Sultan with Scheherazade's final tale!
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
          'Ride the magic carpet',
          'through desert spires —',
          'swift as the east wind!',
        ],
        quote: '"It soared up and up, swift as the evening star." — One Thousand and One Nights',
        help: 'MOVE left/right to steer the carpet through the GAPS!',
        winText: "The carpet swept through the last minaret and Scheherazade spoke her final words to the Sultan.",
        loseText: "The carpet struck a spire and tumbled from the sky. So close to the end...",
        init: function (api) {
          this.x      = api.W / 2;
          this.y      = api.H * 0.42;
          this.timer  = 0;
          this.dur    = 22;
          this.lives  = 3;
          this.invT   = 0;
          this.spires = [];
          this.spawnT = 0;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer += dt;
          if (this.invT > 0) this.invT -= dt;
          if (this.timer >= this.dur) { api.addScore(120); api.win(); return; }
          if (api.pointer.down) this.x = clamp(api.pointer.x, 20, W - 20);
          if (api.keyDown('left'))  this.x = clamp(this.x - 185 * dt, 20, W - 20);
          if (api.keyDown('right')) this.x = clamp(this.x + 185 * dt, 20, W - 20);
          // Carpet gently floats
          this.y = H * 0.42 + Math.sin(this.timer * 2.2) * 14;
          // Spawn spire pairs
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.62, 1.6 - this.timer * 0.042);
            var gapW = Math.max(68, 108 - this.timer * 2.2);
            var gapX = 22 + randI(0, W - 44 - gapW);
            this.spires.push({ y: -22, gapX: gapX, gapW: gapW });
          }
          var spd = 88 + this.timer * 4;
          var i;
          for (i = 0; i < this.spires.length; i++) this.spires[i].y += spd * dt;
          this.spires = this.spires.filter(function (s) { return s.y < H + 32; });
          // Collision
          if (this.invT <= 0) {
            var carpY = this.y;
            var j;
            for (j = 0; j < this.spires.length; j++) {
              var sp = this.spires[j];
              if (Math.abs(sp.y - carpY) < 30) {
                if (this.x < sp.gapX + 14 || this.x > sp.gapX + sp.gapW - 14) {
                  this.lives--; this.invT = 1.2;
                  api.shake(6, 0.22); api.flash(C.ruby, 0.16); api.audio.sfx('hurt');
                  api.burst(this.x, carpY, C.ruby, 10);
                  if (this.lives <= 0) { api.lose(); return; }
                  break;
                }
              }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          // Night sky
          var skyGrad = c.createLinearGradient(0, 0, 0, H);
          skyGrad.addColorStop(0, C.night);
          skyGrad.addColorStop(0.7, C.indigo);
          skyGrad.addColorStop(1, '#1a1440');
          c.fillStyle = skyGrad; c.fillRect(0, 0, W, H);
          // Stars
          var si3;
          for (si3 = 0; si3 < 42; si3++) {
            var stx2 = (si3 * 71 + 4) % W, sty2 = (si3 * 53 + 8) % (H * 0.9);
            c.globalAlpha = 0.12 + 0.32 * Math.abs(Math.sin(t * 1.1 + si3));
            c.fillStyle = C.star; c.fillRect(stx2, sty2, 1, 1);
          }
          c.globalAlpha = 1;
          // Moon
          c.globalAlpha = 0.78;
          c.fillStyle = C.moon;
          c.beginPath(); c.arc(W * 0.78, 48, 19, 0, Math.PI * 2); c.fill();
          c.fillStyle = C.indigo;
          c.beginPath(); c.arc(W * 0.78 + 8, 45, 15, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          // Spires
          var si4;
          for (si4 = 0; si4 < this.spires.length; si4++) {
            var sp2 = this.spires[si4];
            var bandH = 44;
            var bandTop = sp2.y - bandH / 2;
            // Left wall
            c.fillStyle = '#150d34';
            c.fillRect(0, bandTop, sp2.gapX, bandH);
            c.beginPath(); c.moveTo(sp2.gapX - 18, bandTop); c.lineTo(sp2.gapX, bandTop - 22); c.lineTo(sp2.gapX, bandTop); c.closePath(); c.fill();
            // Right wall
            c.fillRect(sp2.gapX + sp2.gapW, bandTop, W - (sp2.gapX + sp2.gapW), bandH);
            c.beginPath(); c.moveTo(sp2.gapX + sp2.gapW, bandTop - 22); c.lineTo(sp2.gapX + sp2.gapW, bandTop); c.lineTo(sp2.gapX + sp2.gapW + 18, bandTop); c.closePath(); c.fill();
            // Gold edges
            c.strokeStyle = C.copper; c.lineWidth = 1;
            c.strokeRect(0, bandTop, sp2.gapX, bandH);
            c.strokeRect(sp2.gapX + sp2.gapW, bandTop, W - (sp2.gapX + sp2.gapW), bandH);
            // Gap highlight
            c.globalAlpha = 0.07; c.fillStyle = C.teal;
            c.fillRect(sp2.gapX, bandTop, sp2.gapW, bandH); c.globalAlpha = 1;
          }
          // Magic carpet (player)
          var cx2 = this.x, cy2 = this.y;
          if (this.invT <= 0 || Math.floor(this.invT * 8) % 2 === 0) {
            var wobble = Math.sin(t * 4) * 2.5;
            c.fillStyle = C.ruby;
            c.beginPath();
            c.moveTo(cx2 - 22, cy2 + 5 + wobble * 0.3);
            c.quadraticCurveTo(cx2, cy2 + 10 + Math.abs(wobble), cx2 + 22, cy2 + 5 + wobble * 0.3);
            c.lineTo(cx2 + 22, cy2 - 5);
            c.quadraticCurveTo(cx2, cy2 - 1 + wobble * 0.2, cx2 - 22, cy2 - 5);
            c.closePath(); c.fill();
            c.strokeStyle = C.amber; c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(cx2, cy2 - 4); c.lineTo(cx2 + 8, cy2); c.lineTo(cx2, cy2 + 4); c.lineTo(cx2 - 8, cy2); c.closePath(); c.stroke();
            // Fringe
            c.strokeStyle = C.gold; c.lineWidth = 1.5;
            var fi;
            for (fi = -2; fi <= 2; fi++) {
              c.beginPath(); c.moveTo(cx2 + fi * 9, cy2 + 5); c.lineTo(cx2 + fi * 9, cy2 + 11); c.stroke();
            }
            // Rider
            g.circle(cx2, cy2 - 16, 8, '#d8a878');
            c.fillStyle = C.silk;
            c.beginPath(); c.arc(cx2, cy2 - 20, 9, Math.PI, 0); c.fill();
            g.rect(cx2 - 8, cy2 - 14, 16, 10, '#541040');
            g.rect(cx2 + 9, cy2 - 24, 5, 12, C.ivory);
            g.circle(cx2 + 11, cy2 - 24, 3, C.parch);
            g.circle(cx2 + 11, cy2 - 12, 3, C.parch);
          }
          api.topBar('SURVIVE: ' + Math.max(0, Math.ceil(this.dur - this.timer)) + 's');
          var li4;
          for (li4 = 0; li4 < 3; li4++) g.circle(W - 38 + li4 * 13, 20, 4, li4 < this.lives ? C.teal : '#1a0c28');
          api.vignette();
        },
      },

    ], // end chapters
  });

}());
