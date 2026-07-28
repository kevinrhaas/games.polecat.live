/* ============================================================================
 * OLIVER TWIST — PLEASE, SIR
 * Five acts from Dickens' 1837 novel:
 *   1. THE WORKHOUSE     — grid lift-timing: steal 2nd helpings past the
 *                          beadle's watchful eye without raising suspicion
 *   2. THE ARTFUL DODGER — pendulum tap: pick Fagin's pocket 8 times
 *   3. THE COURTROOM     — silence 10 lying witnesses before 3 testify (whack)
 *   4. THE BURGLARY      — free-move stealth past patrol guards' lanterns (26s)
 *   5. ROOFTOP RECKONING — dodge Bill Sikes' telegraphed stones until dawn (28s)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ─── Victorian London palette ─── */
  var C = {
    black:  '#060406',
    soot:   '#100c0a',
    dark:   '#1a1410',
    coal:   '#2c2018',
    board:  '#1c1408',
    brown:  '#5a3818',
    brownL: '#7a5030',
    stone:  '#8a7a68',
    fog:    '#b0a898',
    fogL:   '#c8bca8',
    cream:  '#e8d8b8',
    parch:  '#d8c8a0',
    amber:  '#c88820',
    amberL: '#f0b030',
    red:    '#cc3822',
    redD:   '#882210',
    denim:  '#2a4a68',
    blue:   '#4a7098',
    white:  '#f0e8d8',
    green:  '#4a7830',
    greenL: '#60a040',
    gasYel: '#ffd080',
  };

  /* ─── Helper: draw Oliver (dark silhouette with tattered cap) ─── */
  function drawOliver(g, c, x, y, invisible) {
    if (invisible) return;
    // Head
    g.circle(x, y - 15, 9, C.fog);
    // Body
    g.rect(x - 6, y - 7, 12, 16, C.stone);
    // Tattered cap
    c.fillStyle = C.coal;
    c.fillRect(x - 10, y - 22, 20, 5);
    c.fillStyle = C.dark;
    c.beginPath(); c.ellipse(x, y - 21, 8, 3, 0, 0, Math.PI * 2); c.fill();
    // Eyes
    g.circle(x - 3, y - 17, 1, C.amberL);
    g.circle(x + 3, y - 17, 1, C.amberL);
  }

  /* ─── Helper: draw a gas lamp ─── */
  function drawLamp(g, c, x, y) {
    g.rect(x - 2, y, 4, 36, C.brown);
    g.rect(x - 7, y - 12, 14, 14, C.brownL);
    c.globalAlpha = 0.18;
    c.fillStyle = C.amberL;
    c.beginPath(); c.arc(x, y - 5, 22, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    g.circle(x, y - 5, 5, C.gasYel);
  }

  /* ─── Emblem: Oliver holding his empty bowl aloft ─── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    // Gaslight glow
    c.globalAlpha = 0.16;
    c.fillStyle = C.amberL;
    c.beginPath(); c.arc(cx, cy, 46, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    // Body
    g.circle(cx, cy - 13, 11, C.coal);
    g.rect(cx - 9, cy - 3, 18, 22, C.dark);
    // Cap
    c.fillStyle = C.coal;
    c.fillRect(cx - 12, cy - 23, 24, 5);
    c.beginPath(); c.ellipse(cx, cy - 22, 10, 4, 0, 0, Math.PI * 2); c.fill();
    // Arms raised with bowl
    g.rect(cx - 24, cx - cy - 8, 16, 5, C.coal); // intentionally mirrored for effect
    g.rect(cx - 24, cy - 8, 16, 5, C.coal);
    g.rect(cx + 8,  cy - 8, 16, 5, C.coal);
    // Bowl shape
    c.strokeStyle = C.amber; c.lineWidth = 3;
    c.beginPath();
    c.moveTo(cx - 14, cy - 16);
    c.quadraticCurveTo(cx, cy - 9, cx + 14, cy - 16);
    c.stroke();
    c.strokeStyle = C.amberL; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 16, cy - 18); c.lineTo(cx + 16, cy - 18); c.stroke();
    // Pleading eyes
    g.circle(cx - 4, cy - 14, 2, C.amberL);
    g.circle(cx + 4, cy - 14, 2, C.amberL);
  }

  /* ─── Scenery: foggy Victorian London ─── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Notice board — dark cork
      c.fillStyle = '#1c1206'; c.fillRect(0, 0, W, H);
      // Cork grain texture
      for (var ct = 0; ct < 90; ct++) {
        var gx = (ct * 71 + 13) % W, gy = (ct * 57 + 19) % H;
        c.globalAlpha = 0.04 + (ct % 4) * 0.015;
        c.fillStyle = ct % 3 === 0 ? C.brownL : C.brown;
        c.fillRect(gx, gy, 3 + ct % 5, 2 + ct % 3);
      }
      c.globalAlpha = 1;
      // Wood border
      c.strokeStyle = C.brown; c.lineWidth = 9;
      c.strokeRect(4, 4, W - 8, H - 8);
      c.strokeStyle = C.brownL; c.lineWidth = 3;
      c.strokeRect(11, 11, W - 22, H - 22);
      // Corner brass tacks
      var corners = [[10,10],[W-10,10],[10,H-10],[W-10,H-10]];
      for (var ci = 0; ci < corners.length; ci++) {
        g.circle(corners[ci][0], corners[ci][1], 5, C.amberL);
        g.circle(corners[ci][0], corners[ci][1], 2, C.amber);
      }
      return;
    }

    // Foggy London street (all other scenes)
    var sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#08090e');
    sky.addColorStop(0.5, '#131018');
    sky.addColorStop(1, '#1c1810');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // Background buildings
    var bldgs = [
      [0,   H*0.30, 52, H*0.70, '#0c0a0e'],
      [48,  H*0.38, 38, H*0.62, '#0e0c0c'],
      [83,  H*0.24, 62, H*0.76, '#0a0a0c'],
      [148, H*0.32, 46, H*0.68, '#100e0c'],
      [191, H*0.28, 50, H*0.72, '#0c0c0e'],
      [238, H*0.36, 36, H*0.64, '#0e0c0a'],
    ];
    for (var bi = 0; bi < bldgs.length; bi++) {
      var b = bldgs[bi];
      c.fillStyle = b[4]; c.fillRect(b[0], b[1], b[2], b[3]);
      // Amber windows
      c.globalAlpha = 0.2 + 0.08 * Math.sin(t * 0.6 + bi * 1.3);
      c.fillStyle = C.amberL;
      for (var wi = 0; wi < 2; wi++) {
        c.fillRect(b[0]+7+wi*(b[2]/2-5), b[1]+10, 8, 10);
        c.fillRect(b[0]+7+wi*(b[2]/2-5), b[1]+28, 8, 10);
      }
      c.globalAlpha = 1;
    }

    // Gas lamps
    var lamps = [22, 74, 148, 220];
    for (var li = 0; li < lamps.length; li++) drawLamp(g, c, lamps[li], H*0.52);

    // Cobblestone street
    c.fillStyle = '#1c1a14'; c.fillRect(0, H*0.7, W, H*0.3);
    c.strokeStyle = '#26221a'; c.lineWidth = 1;
    for (var si = 0; si < 14; si++) {
      c.beginPath(); c.moveTo(si*20, H*0.72); c.lineTo(si*20+14, H*0.74+18); c.stroke();
    }

    // Drifting fog
    for (var fi = 0; fi < 6; fi++) {
      var fx = ((t*11 + fi*53) % (W+70)) - 35;
      var fy = H*0.5 + fi*18 + Math.sin(t*0.35+fi)*14;
      c.globalAlpha = 0.055;
      c.fillStyle = C.fogL;
      c.beginPath(); c.ellipse(fx, fy, 48, 16, 0, 0, Math.PI*2); c.fill();
    }
    c.globalAlpha = 1;

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(6,4,8,.80)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Notice board card layout: 2 upper, 1 center, 2 lower ─── */
  var CARDS = [
    { x: 14,  y: 76,  w: 100, h: 72 },  // ch1 — upper left
    { x: 156, y: 82,  w: 100, h: 72 },  // ch2 — upper right
    { x: 85,  y: 196, w: 100, h: 72 },  // ch3 — center
    { x: 14,  y: 314, w: 100, h: 72 },  // ch4 — lower left
    { x: 156, y: 320, w: 100, h: 72 },  // ch5 — lower right
  ];

  /* ─── Chapter icons ─── */
  var ICONS = [
    function (api, x, y) { // gruel bowl
      var c = api.ctx;
      c.strokeStyle = C.amber; c.lineWidth = 2;
      c.beginPath(); c.arc(x, y+2, 10, Math.PI, 0); c.stroke();
      api.gfx.rect(x-12, y+2, 24, 3, C.amber);
    },
    function (api, x, y) { // handkerchief diamond
      var c = api.ctx;
      c.fillStyle = C.cream;
      c.beginPath(); c.moveTo(x,y-10); c.lineTo(x+9,y); c.lineTo(x,y+10); c.lineTo(x-9,y); c.closePath(); c.fill();
      c.strokeStyle = C.amber; c.lineWidth = 1; c.stroke();
    },
    function (api, x, y) { // gavel
      var g = api.gfx;
      g.rect(x-9, y-3, 18, 6, C.brownL);
      g.rect(x+5, y-2, 14, 4, C.brown);
    },
    function (api, x, y) { // lantern
      var g = api.gfx, c = api.ctx;
      g.rect(x-5, y-8, 10, 14, C.brownL);
      c.globalAlpha = 0.5; g.circle(x, y-1, 5, C.amberL); c.globalAlpha = 1;
      g.rect(x-1, y-14, 2, 7, C.brown);
    },
    function (api, x, y) { // chimney / rooftop
      var g = api.gfx, c = api.ctx;
      g.rect(x-12, y+4, 24, 6, C.stone);
      g.rect(x-4,  y-8, 8, 14, C.coal);
      c.globalAlpha = 0.35; g.circle(x-2, y-12, 5, C.fog); c.globalAlpha = 1;
    },
  ];

  /* ═══════════════════════════════════════════════════════════════════════
   * SAGA
   * ═══════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id:       'olivertwist',
    title:    'Oliver Twist',
    subtitle: 'FIVE ACTS ON THE LONDON STREETS',
    currency: 'SHILLINGS',
    accent:   C.amber,
    credit:   'OLIVER TWIST · CHARLES DICKENS · 1837',
    bootLine: 'FIVE ACTS · ONE BOY · ONE CITY',
    bootCta:  'PLEASE, SIR',
    menuLabel:'THE NOTICE BOARD',
    menuHint: 'CHOOSE YOUR ACT',
    menuDone: 'FREEDOM FOUND',
    emblem, scenery,

    screens: {
      win:          C.amberL,
      lose:         C.red,
      chapterLabel: C.fog,
      name:         C.cream,
      sub:          C.amber,
      intro:        C.fogL,
      quote:        C.stone,
      help:         C.amber,
      score:        C.cream,
      cur:          C.amberL,
      cta:          C.cream,
      overlay:      'rgba(8,6,4,.86)',
    },
    labels: {
      chapter: 'ACT',
      score:   'SHILLINGS EARNED',
      win:     'THE BOY SURVIVES',
      lose:    'THE STREETS CLAIM YOU',
      cont:    'TAP TO PRESS ON',
      finale:  'TAP TO FIND FREEDOM',
      toMenu:  'BACK TO THE NOTICE BOARD',
      play:    'TAP TO BEGIN',
    },

    finale: [
      'OLIVER STANDS BEFORE',
      'A WARM FIRE AT LAST.',
      '',
      'MR. BROWNLOW\'S HOUSE.',
      'KINDNESS WHERE',
      'NONE WAS EXPECTED.',
      '',
      '"PLEASE, SIR,',
      'I WANT SOME MORE."',
    ],

    width: 270, height: 480, parent: '#game',

    /* ─── Chapter-select: notice board ─── */
    menu: {
      colors: {
        title: C.cream,
        label: C.amber,
        cur:   C.amberL,
        done:  C.greenL,
        lock:  C.coal,
      },

      title: function (api, shillings) {
        var g = api.gfx, c = api.ctx, W = api.W;
        // Header placard
        g.rect(14, 10, W - 28, 50, '#160e04');
        c.strokeStyle = C.brown; c.lineWidth = 2;
        c.strokeRect(14, 10, W - 28, 50);
        // Corner rivets
        var rv = [[20,16],[W-24,16],[20,54],[W-24,54]];
        for (var ri = 0; ri < rv.length; ri++) {
          g.circle(rv[ri][0], rv[ri][1], 3, C.amberL);
          g.circle(rv[ri][0], rv[ri][1], 1, C.amber);
        }
        api.txtCFit('THE NOTICE BOARD', W/2, 22, 8, C.cream, false, W-44);
        api.txtCFit('SHILLINGS  ' + shillings, W/2, 42, 8, C.amberL, false, W-44);
        // Oliver silhouette in corner
        drawOliver(g, c, W-24, 46, false);
      },

      layout: function () { return CARDS; },

      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i;
        var x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done, best = info.best;
        var cx = x + w/2, cy = y + h/2;

        // Red string connecting cards (decorative)
        if (i === 0 || i === 1) {
          var mid = CARDS[2];
          var mx = mid.x + mid.w/2, my = mid.y;
          c.strokeStyle = C.redD; c.lineWidth = 1; c.globalAlpha = 0.28;
          c.setLineDash([3, 5]);
          c.beginPath(); c.moveTo(cx, y + h); c.lineTo(mx, my); c.stroke();
          c.setLineDash([]); c.globalAlpha = 1;
        }
        if (i === 3 || i === 4) {
          var mid2 = CARDS[2];
          var mx2 = mid2.x + mid2.w/2, my2 = mid2.y + mid2.h;
          c.strokeStyle = C.redD; c.lineWidth = 1; c.globalAlpha = 0.28;
          c.setLineDash([3, 5]);
          c.beginPath(); c.moveTo(cx, y); c.lineTo(mx2, my2); c.stroke();
          c.setLineDash([]); c.globalAlpha = 1;
        }

        // Paper background
        var paperCol = sel ? '#eed89a' : (done ? '#c8b87a' : '#d4c898');
        g.rect(x+4, y+4, w-8, h-8, paperCol);

        // Aged border lines
        c.strokeStyle = sel ? C.amber : (done ? C.greenL : C.stone);
        c.lineWidth = sel ? 3 : 2;
        c.strokeRect(x+4, y+4, w-8, h-8);

        // Folded corner crease
        c.fillStyle = sel ? '#c8a858' : '#b0985a';
        c.beginPath();
        c.moveTo(x+w-4, y+4); c.lineTo(x+w-14, y+4);
        c.lineTo(x+w-4, y+14); c.closePath(); c.fill();

        // Thumbtack pin
        g.circle(cx, y+7, 5, sel ? C.amberL : C.red);
        g.circle(cx, y+7, 2, sel ? '#fff8e0' : '#ff8060');

        // "NOTICE" header on paper
        api.txtCFit('NOTICE', cx, y+16, 6, C.coal, false, w-12);

        // Chapter short name
        var shortNames = ['WORKHOUSE','THE DODGER','COURTROOM','BURGLARY','ROOFTOP'];
        api.txtCFit(shortNames[i], cx, y+30,
          sel ? 8 : 7,
          done ? '#3a6820' : (sel ? C.coal : '#4a3a20'),
          false, w-12);

        // Thematic icon
        ICONS[i](api, cx, y+50);

        // Best score badge
        if (best && best > 0) {
          api.txtCFit('' + best, cx, y+h-8, 6, C.amber, false, w-12);
        }
        if (done) {
          api.txtCFit('✓', x+w-14, y+h-10, 9, C.greenL, false, 16);
        }
      },
    },

    /* ═══════════════════════════════════════════════════════════════════
     * CHAPTERS
     * ═══════════════════════════════════════════════════════════════════ */
    chapters: [

      /* ───────────────────────────────────────────────────────────────
       * ACT 1 — THE WORKHOUSE
       * Grid lift-timing: tap a glowing bowl for a stolen second helping —
       * but never while the beadle's eye is watching that column. A
       * suspicion meter (not lives) tracks how many times he catches you.
       * ─────────────────────────────────────────────────────────────── */
      {
        id: 'workhouse',
        name: 'THE WORKHOUSE',
        sub: 'PLEASE, SIR, I WANT SOME MORE',
        icon: function (api, x, y) { ICONS[0](api, x, y); },
        intro: [
          'OLIVER IS BORN IN THE',
          'PARISH WORKHOUSE.',
          'STARVED ON THIN GRUEL,',
          'he learns to snatch a',
          'second bowl unseen.',
        ],
        quote: '"Please, sir, I want some more." — Charles Dickens, 1837',
        help: 'TAP a glowing bowl for extra gruel — but NOT while the beadle\'s eye watches its column! Lift 10 helpings. Get caught 4 times and it\'s over.',
        winText: 'Ten stolen helpings, and not once did the beadle\'s eye catch him. Oliver slips from the workhouse gates.',
        loseText: 'The beadle\'s eye catches him red-handed. Oliver is cast into the coal cellar.',

        init: function (api) {
          var W = api.W, H = api.H;
          var cols = [W*0.27, W*0.5, W*0.73];
          var rows = [H*0.42, H*0.58];
          this.pots = [];
          for (var r = 0; r < 2; r++) {
            for (var cIdx = 0; cIdx < 3; cIdx++) {
              this.pots.push({ col: cIdx, row: r, x: cols[cIdx], y: rows[r], glow: false, glowT: 0 });
            }
          }
          this.cur        = 4; // keyboard cursor, starts center
          this.lifts      = 0;
          this.target      = 10;
          this.suspicion   = 0;
          this.maxSuspicion= 4;
          this.watchCol    = Math.floor(Math.random() * 3);
          this.watchT      = 1.7;
          this.spawnT      = 0.7;
          this.fxs         = [];
        },

        update: function (api, dt) {
          var W = api.W, H = api.H, self = this;

          // Beadle's eye rotates to a new column periodically
          this.watchT -= dt;
          if (this.watchT <= 0) {
            var next = Math.floor(Math.random() * 3);
            if (next === this.watchCol) next = (next + 1) % 3;
            this.watchCol = next;
            this.watchT = 1.4 + Math.random() * 0.7;
          }

          // Spawn a lift opportunity in a random idle pot (max 2 concurrent)
          this.spawnT -= dt;
          var glowing = this.pots.filter(function (p) { return p.glow; });
          if (this.spawnT <= 0 && glowing.length < 2) {
            var idle = this.pots.filter(function (p) { return !p.glow; });
            if (idle.length) {
              var pick = idle[Math.floor(Math.random() * idle.length)];
              pick.glow = true;
              pick.glowT = 1.15;
            }
            this.spawnT = 0.75 + Math.random() * 0.45 - Math.min(0.3, this.lifts * 0.018);
          }

          // Countdown glow windows; missed lifts just fade (no penalty)
          for (var pi = 0; pi < this.pots.length; pi++) {
            var pot = this.pots[pi];
            if (pot.glow) {
              pot.glowT -= dt;
              if (pot.glowT <= 0) pot.glow = false;
            }
          }

          // Keyboard cursor movement (touch taps target directly instead)
          var col = this.cur % 3, row = (this.cur / 3) | 0;
          if (api.keyPressed && api.keyPressed('left'))  col = clamp(col - 1, 0, 2);
          if (api.keyPressed && api.keyPressed('right')) col = clamp(col + 1, 0, 2);
          if (api.keyPressed && api.keyPressed('up'))    row = clamp(row - 1, 0, 1);
          if (api.keyPressed && api.keyPressed('down'))  row = clamp(row + 1, 0, 1);
          this.cur = row * 3 + col;

          // Resolve a tap: pointer hit-test, or 'a' key on the cursor pot
          var targetPot = null;
          if (api.pointer.justDown) {
            var px = api.pointer.x, py = api.pointer.y;
            for (var hi = 0; hi < this.pots.length; hi++) {
              var hp = this.pots[hi];
              if (Math.abs(px - hp.x) < 28 && Math.abs(py - hp.y) < 28) { targetPot = hp; break; }
            }
          } else if (api.keyPressed && api.keyPressed('a')) {
            targetPot = this.pots[this.cur];
          }

          if (targetPot && targetPot.glow) {
            targetPot.glow = false;
            if (targetPot.col === this.watchCol) {
              this.suspicion++;
              this.fxs.push({ x: targetPot.x, y: targetPot.y, t: 0.7, txt: 'CAUGHT!', col: C.red });
              api.shake(6, 0.28);
              api.flash(C.red, 0.16);
              api.burst(targetPot.x, targetPot.y, C.red, 7);
              if (this.suspicion >= this.maxSuspicion) { api.lose(); return; }
            } else {
              this.lifts++;
              api.addScore(20);
              this.fxs.push({ x: targetPot.x, y: targetPot.y, t: 0.6, txt: 'LIFTED!', col: C.amberL });
              api.burst(targetPot.x, targetPot.y, C.amber, 6);
              if (this.lifts >= this.target) { api.win(); return; }
            }
          }

          this.fxs = this.fxs.filter(function (f) { f.t -= dt; return f.t > 0; });
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var t = api.t;

          // Workhouse interior — stone walls
          c.fillStyle = '#180e08'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#241a0e'; c.fillRect(0, 0, W, H*0.72);
          // Stone brick pattern
          c.strokeStyle = '#120a04'; c.lineWidth = 1;
          for (var row = 0; row < 7; row++) {
            for (var col = 0; col < 6; col++) {
              c.strokeRect(col*48 + (row%2)*24, row*32+4, 44, 28);
            }
          }
          // Floor
          g.rect(0, H*0.72, W, H*0.28, '#1c1610');

          // Serving counter
          g.rect(W*0.12, H*0.34, W*0.76, H*0.32, '#20160a');
          c.strokeStyle = C.brown; c.lineWidth = 2;
          c.strokeRect(W*0.12, H*0.34, W*0.76, H*0.32);

          // Beadle's watching eye, positioned over the danger column
          var eyeX = this.pots[this.watchCol].x, eyeY = H*0.22;
          var blink = 0.85 + 0.15 * Math.sin(t*3);
          c.fillStyle = C.cream;
          c.beginPath(); c.ellipse(eyeX, eyeY, 15, 9*blink, 0, 0, Math.PI*2); c.fill();
          c.strokeStyle = C.brown; c.lineWidth = 2;
          c.beginPath(); c.ellipse(eyeX, eyeY, 15, 9*blink, 0, 0, Math.PI*2); c.stroke();
          c.fillStyle = C.coal;
          c.beginPath(); c.arc(eyeX, eyeY, 5*blink, 0, Math.PI*2); c.fill();
          api.txtCFit('THE BEADLE WATCHES', eyeX, eyeY-20, 5, C.stone, false, W*0.8);

          // Danger-column tint (helps mobile players spot it fast)
          c.globalAlpha = 0.10;
          c.fillStyle = C.red;
          c.fillRect(eyeX - 38, H*0.34, 76, H*0.32);
          c.globalAlpha = 1;

          // Pots
          for (var pIdx = 0; pIdx < this.pots.length; pIdx++) {
            var pot = this.pots[pIdx];
            var glowPulse = pot.glow ? (0.6 + 0.4 * Math.sin(t*11)) : 0;
            if (pot.glow) {
              c.globalAlpha = glowPulse * 0.5;
              c.fillStyle = C.amberL;
              c.beginPath(); c.arc(pot.x, pot.y, 20, 0, Math.PI*2); c.fill();
              c.globalAlpha = 1;
            }
            c.strokeStyle = pot.glow ? C.amberL : C.amber; c.lineWidth = 2;
            c.beginPath(); c.arc(pot.x, pot.y+5, 12, Math.PI, 0); c.stroke();
            g.rect(pot.x-14, pot.y+5, 28, 4, pot.glow ? C.amberL : C.amber);
            c.globalAlpha = 0.4;
            c.fillStyle = '#c49028';
            c.beginPath(); c.arc(pot.x, pot.y+2, 9, Math.PI, 0); c.fill();
            c.globalAlpha = 1;
            // Keyboard cursor ring
            if (pIdx === this.cur) {
              c.strokeStyle = C.fogL; c.lineWidth = 1;
              c.setLineDash([3,3]);
              c.strokeRect(pot.x-19, pot.y-15, 38, 34);
              c.setLineDash([]);
            }
          }

          // FX popups
          for (var fi = 0; fi < this.fxs.length; fi++) {
            var fx = this.fxs[fi];
            c.globalAlpha = Math.min(1, fx.t * 2.2);
            api.txtCFit(fx.txt, fx.x, fx.y - (0.7 - fx.t) * 20, 7, fx.col, false, W*0.55);
            c.globalAlpha = 1;
          }

          // Oliver, reaching from below
          drawOliver(g, c, W/2, H*0.92, false);

          // HUD
          api.txtCFit('LIFTED ' + this.lifts + '/' + this.target, W*0.28, 16, 6, C.amberL, false, W*0.5);

          // Suspicion meter
          var spct = this.suspicion / this.maxSuspicion;
          g.rect(0, H-8, W, 8, '#100806');
          g.rect(0, H-8, W*spct, 8, C.red);
          api.txtCFit('SUSPICION', W/2, H-17, 6, C.stone, false, W);
          api.topBar('THE WORKHOUSE', api.score);
          api.vignette();
          api.scanlines();
        },
      },

      /* ───────────────────────────────────────────────────────────────
       * ACT 2 — THE ARTFUL DODGER
       * Pendulum pickpocket timing: tap in the golden zone. 8 lifts, 4 misses.
       * ─────────────────────────────────────────────────────────────── */
      {
        id: 'dodger',
        name: 'THE ARTFUL DODGER',
        sub: 'LEARN THE TRADE',
        icon: function (api, x, y) { ICONS[1](api, x, y); },
        intro: [
          'ON THE ROAD TO LONDON',
          'OLIVER MEETS JACK DAWKINS:',
          'THE ARTFUL DODGER.',
          'Fagin swings a handkerchief.',
          'TAP when it glows golden!',
        ],
        quote: '"My name is Jack Dawkins — commonly known as the Artful Dodger." — Charles Dickens',
        help: 'Tap at the EXACT moment the handkerchief glows bright gold! 8 successful lifts to graduate. Miss 4 times and it\'s over.',
        winText: 'Eight clean lifts! The Dodger grins with pride. Fagin has a new pupil.',
        loseText: 'Too many fumbles. Fagin frowns. The trade requires a steadier hand.',

        init: function (api) {
          this.lifts   = 0;
          this.misses  = 0;
          this.target  = 8;
          this.maxMiss = 4;
          this.angle   = 0;
          this.spd     = 1.6;    // rad/s — the pendulum speed
          this.hitFX   = null;   // {x,y,t,good}
          this.cooldown= 0;      // brief cooldown after tap
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;

          // Swing pendulum
          this.angle += this.spd * dt;

          // Cooldown between taps
          if (this.cooldown > 0) { this.cooldown -= dt; }

          // Detect tap (pointer or A/up key)
          var tapped = (api.pointer.justDown) ||
                       (api.keyPressed && (api.keyPressed('a') || api.keyPressed('up')));
          if (tapped && this.cooldown <= 0) {
            this.cooldown = 0.3;
            // In-zone when |sin(angle)| < 0.26 (near the bottom of each swing)
            var swing = Math.sin(this.angle);
            if (Math.abs(swing) < 0.26) {
              this.lifts++;
              this.spd = 1.6 + this.lifts * 0.22;
              this.hitFX = { x: W/2, y: H*0.58, t: 0.7, good: true };
              api.addScore(30);
              api.burst(W/2, H*0.56, C.amberL, 10);
              api.flash(C.amberL, 0.1);
              if (this.lifts >= this.target) { api.win(); return; }
            } else {
              this.misses++;
              this.hitFX = { x: W/2, y: H*0.58, t: 0.5, good: false };
              api.shake(5, 0.22);
              api.flash(C.red, 0.14);
              if (this.misses >= this.maxMiss) { api.lose(); return; }
            }
          }

          if (this.hitFX) this.hitFX.t -= dt;
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var t = api.t;

          // Den interior — warm amber
          c.fillStyle = '#160e04'; c.fillRect(0, 0, W, H);

          // Fireplace glow (bottom)
          c.globalAlpha = 0.09;
          c.fillStyle = C.amberL;
          c.beginPath(); c.arc(W/2, H, 100, 0, Math.PI*2); c.fill();
          c.globalAlpha = 1;

          // Hanging handkerchiefs (background decoration)
          var hkXs = [14, 68, 122, 176, 230];
          for (var hi = 0; hi < hkXs.length; hi++) {
            c.strokeStyle = '#2c1c0c'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(hkXs[hi], 0); c.lineTo(hkXs[hi], H*0.24); c.stroke();
            var hkCol = hi%2===0 ? '#c0b078' : '#d0c098';
            c.fillStyle = hkCol;
            c.beginPath();
            c.moveTo(hkXs[hi]-10, H*0.22);
            c.lineTo(hkXs[hi]+10, H*0.22);
            c.lineTo(hkXs[hi], H*0.34);
            c.closePath(); c.fill();
          }

          // Fagin (silhouette center top)
          var fagX = W/2, fagY = H*0.22;
          // Robe
          g.rect(fagX-10, fagY+8, 20, 30, '#180e04');
          // Head
          g.circle(fagX, fagY, 12, C.coal);
          // Old Fagin top hat
          g.rect(fagX-11, fagY-16, 22, 4, C.coal);
          g.rect(fagX-8,  fagY-30, 16, 16, C.dark);
          // Glowing eyes
          g.circle(fagX-4, fagY+1, 2, C.amberL);
          g.circle(fagX+4, fagY+1, 2, C.amberL);

          // Pendulum
          var pivX = fagX, pivY = fagY+20;
          var pLen = 90;
          // pendAngle = sin(angle) * maxSwing gives smooth oscillation
          var pendAngle = Math.sin(this.angle) * 0.88;
          var tipX = pivX + Math.sin(pendAngle) * pLen;
          var tipY = pivY + Math.cos(pendAngle) * pLen;

          var inZone = Math.abs(Math.sin(this.angle)) < 0.26;
          var zoneAlpha = inZone ? (0.7 + 0.3*Math.sin(t*18)) : 0.0;

          // Cord
          c.strokeStyle = inZone ? C.amber : C.brownL;
          c.lineWidth = 2;
          c.beginPath(); c.moveTo(pivX, pivY); c.lineTo(tipX, tipY); c.stroke();

          // Handkerchief at tip
          var hkBright = inZone ? C.cream : C.parch;
          c.fillStyle = hkBright;
          c.beginPath();
          c.moveTo(tipX,    tipY-11);
          c.lineTo(tipX+10, tipY);
          c.lineTo(tipX,    tipY+11);
          c.lineTo(tipX-10, tipY);
          c.closePath(); c.fill();
          if (inZone) {
            c.strokeStyle = C.amberL; c.lineWidth = 2; c.stroke();
            // Glow ring
            c.globalAlpha = 0.35 + 0.15*Math.sin(t*16);
            c.strokeStyle = C.amberL; c.lineWidth = 5;
            c.beginPath(); c.arc(tipX, tipY, 20, 0, Math.PI*2); c.stroke();
            c.globalAlpha = 1;
          }

          // "TAP!" nudge on first few seconds
          if (this.lifts === 0 && t < 4) {
            c.globalAlpha = 0.5 + 0.5*Math.sin(t*5);
            api.txtCFit('TAP WHEN GOLDEN!', W/2, H*0.76, 7, C.amberL, false, W-20);
            c.globalAlpha = 1;
          }

          // Hit FX
          if (this.hitFX && this.hitFX.t > 0) {
            var alpha = Math.min(1, this.hitFX.t * 2);
            c.globalAlpha = alpha;
            api.txtCFit(
              this.hitFX.good ? 'LIFTED!' : 'FUMBLED!',
              this.hitFX.x,
              this.hitFX.y - (0.7 - this.hitFX.t) * 26,
              13, this.hitFX.good ? C.amberL : C.red, false, W
            );
            c.globalAlpha = 1;
          }

          // Lifts counter (handkerchief diamonds across top)
          for (var li = 0; li < this.target; li++) {
            var lx = 14 + li*30, ly = 14;
            var filled = li < this.lifts;
            c.fillStyle = filled ? C.amberL : '#2a1a08';
            c.beginPath();
            c.moveTo(lx, ly-6); c.lineTo(lx+7, ly); c.lineTo(lx, ly+6); c.lineTo(lx-7, ly); c.closePath();
            c.fill();
          }

          // Misses indicator
          var missCol = this.misses >= 3 ? C.red : C.stone;
          api.txtCFit('MISSES: ' + this.misses + '/' + this.maxMiss, W/2, H-18, 7, missCol, false, W);

          api.topBar('THE ARTFUL DODGER', api.score);
          api.vignette();
          api.scanlines();
        },
      },

      /* ───────────────────────────────────────────────────────────────
       * ACT 3 — THE COURTROOM
       * Whack lying witnesses before they testify. 10 silenced, 3 max testify.
       * ─────────────────────────────────────────────────────────────── */
      {
        id: 'courtroom',
        name: 'THE COURTROOM',
        sub: 'BEFORE MAGISTRATE FANG',
        icon: function (api, x, y) { ICONS[2](api, x, y); },
        intro: [
          'OLIVER IS ARRESTED,',
          'WRONGLY ACCUSED OF THEFT.',
          'FALSE WITNESSES LINE UP',
          'to give their testimony.',
          'SILENCE THEM before they speak!',
        ],
        quote: '"The law is a ass — a idiot." — Charles Dickens',
        help: 'TAP the witnesses before their bar runs out! Silence 10 of them. Let 3 testify and it\'s all over.',
        winText: 'Ten witnesses silenced! Old Mr. Brownlow sees the truth and speaks up for Oliver.',
        loseText: 'Too many false testimonies. Magistrate Fang sentences the boy.',

        init: function (api) {
          this.tapped   = 0;
          this.reached  = 0;
          this.target   = 10;
          this.maxReach = 3;
          this.witnesses= [];
          this.spawnT   = 0.8;
          this.elapsed  = 0;
          this.fxs      = [];
          // 6 fixed seat positions (2 rows x 3 cols)
          this.seats = [
            { x: 48,  y: 148 }, { x: 135, y: 140 }, { x: 222, y: 148 },
            { x: 48,  y: 250 }, { x: 135, y: 242 }, { x: 222, y: 250 },
          ];
          this.occupied = [false,false,false,false,false,false];
        },

        update: function (api, dt) {
          this.elapsed += dt;

          // Spawn witness into a free seat
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var freeSeat = -1;
            for (var si = 0; si < 6; si++) {
              if (!this.occupied[si]) { freeSeat = si; break; }
            }
            if (freeSeat >= 0 && this.witnesses.length < 5) {
              this.occupied[freeSeat] = true;
              var drainRate = 0.16 + this.elapsed * 0.006;
              this.witnesses.push({
                seat: freeSeat,
                x: this.seats[freeSeat].x,
                y: this.seats[freeSeat].y,
                hp: 1.0,
                drain: drainRate,
              });
            }
            this.spawnT = 0.85 + Math.random()*0.75 - Math.min(0.35, this.elapsed*0.014);
          }

          // Update witnesses
          for (var wi = this.witnesses.length - 1; wi >= 0; wi--) {
            var w = this.witnesses[wi];
            w.hp -= w.drain * dt;
            if (w.hp <= 0) {
              // Testifies against Oliver
              this.occupied[w.seat] = false;
              this.witnesses.splice(wi, 1);
              this.reached++;
              this.fxs.push({ x: w.x, y: w.y, t: 0.7, txt: 'TESTIFIES!', col: C.red });
              api.shake(5, 0.28);
              api.flash(C.red, 0.12);
              if (this.reached >= this.maxReach) { api.lose(); return; }
            }
          }

          // Tap detection
          if (api.pointer.justDown) {
            var px = api.pointer.x, py = api.pointer.y;
            for (var ti = this.witnesses.length - 1; ti >= 0; ti--) {
              var tw = this.witnesses[ti];
              if (Math.abs(px - tw.x) < 32 && Math.abs(py - tw.y) < 32) {
                this.occupied[tw.seat] = false;
                this.witnesses.splice(ti, 1);
                this.tapped++;
                this.fxs.push({ x: tw.x, y: tw.y, t: 0.6, txt: 'SILENCED!', col: C.amberL });
                api.addScore(25);
                api.burst(tw.x, tw.y, C.amberL, 8);
                if (this.tapped >= this.target) { api.win(); return; }
                break;
              }
            }
          }

          this.fxs = this.fxs.filter(function(f){ f.t -= dt; return f.t > 0; });
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Courtroom — dark wood paneling
          c.fillStyle = '#160c04'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#201408'; c.fillRect(0, H*0.58, W, H*0.42);
          // Dock panels
          for (var pi = 0; pi < 4; pi++) {
            var pc = pi%2===0 ? '#281808' : '#201204';
            c.fillStyle = pc; c.fillRect(pi*68, H*0.6, 66, H*0.4);
          }
          // Wainscoting line
          c.strokeStyle = C.brown; c.lineWidth = 2;
          c.beginPath(); c.moveTo(0, H*0.60); c.lineTo(W, H*0.60); c.stroke();

          // Magistrate's bench (top)
          g.rect(W*0.15, 22, W*0.7, 46, C.brownL);
          c.strokeStyle = C.brown; c.lineWidth = 2;
          c.strokeRect(W*0.15, 22, W*0.7, 46);
          // Magistrate figure
          g.circle(W/2, 28, 11, C.coal);
          g.rect(W/2-10, 38, 20, 24, C.dark);
          // Wig
          c.fillStyle = C.fogL;
          c.beginPath(); c.ellipse(W/2, 27, 15, 12, 0, 0, Math.PI*2); c.fill();
          c.fillStyle = C.coal;
          c.beginPath(); c.arc(W/2, 27, 9, 0, Math.PI*2); c.fill();
          api.txtCFit('MAGISTRATE FANG', W/2, 72, 5, C.stone, false, W);

          // Witness box (center bottom)
          g.rect(W/2-20, H*0.62, 40, 32, C.brownL);
          c.strokeStyle = C.brown; c.lineWidth = 1;
          c.strokeRect(W/2-20, H*0.62, 40, 32);
          api.txtCFit('STAND', W/2, H*0.62+10, 5, C.stone, false, 40);

          // Background benches (empty seats)
          for (var si = 0; si < 6; si++) {
            var seat = this.seats[si];
            g.rect(seat.x-24, seat.y+16, 48, 12, si < 3 ? '#2a1c0c' : '#261808');
          }

          // Witnesses
          for (var wi = 0; wi < this.witnesses.length; wi++) {
            var w = this.witnesses[wi];
            // HP bar
            var bw = 44;
            g.rect(w.x-22, w.y+20, bw, 6, '#1a1008');
            var barCol = w.hp > 0.55 ? C.greenL : (w.hp > 0.28 ? C.amber : C.red);
            g.rect(w.x-22, w.y+20, bw*w.hp, 6, barCol);
            // Witness figure
            g.circle(w.x, w.y-12, 10, C.fogL);
            g.rect(w.x-7, w.y-3, 14, 18, C.stone);
            // Wig
            c.fillStyle = C.fogL;
            c.beginPath(); c.ellipse(w.x, w.y-13, 11, 9, 0, 0, Math.PI*2); c.fill();
            c.fillStyle = C.coal;
            c.beginPath(); c.arc(w.x, w.y-13, 7, 0, Math.PI*2); c.fill();
          }

          // FX labels
          for (var fi = 0; fi < this.fxs.length; fi++) {
            var fx = this.fxs[fi];
            c.globalAlpha = Math.min(1, fx.t * 2.5);
            api.txtCFit(fx.txt, fx.x, fx.y - (0.7 - fx.t) * 22, 8, fx.col, false, W*0.65);
            c.globalAlpha = 1;
          }

          // HUD
          api.txtCFit('SILENCED ' + this.tapped + '/' + this.target, 54, 12, 5, C.amberL, false, 108);
          api.txtCFit('TESTIFIED ' + this.reached + '/' + this.maxReach, W-54, 12, 5, C.red, false, 108);
          api.vignette();
          api.scanlines();
        },
      },

      /* ───────────────────────────────────────────────────────────────
       * ACT 4 — THE BURGLARY
       * Drag/arrow-key Oliver around two patrol guards' lantern cones. 3 lives, 26s.
       * ─────────────────────────────────────────────────────────────── */
      {
        id: 'burglary',
        name: 'THE BURGLARY',
        sub: 'A SMALL BOY THROUGH A WINDOW',
        icon: function (api, x, y) { ICONS[3](api, x, y); },
        intro: [
          'BILL SIKES NEEDS',
          'A SMALL BOY WHO CAN SLIP',
          'THROUGH THE CHERTSEY WINDOW.',
          'Oliver must creep inside',
          'while guards patrol the house.',
        ],
        quote: '"Oliver\'s heart beat so violently... he could scarcely breathe." — Charles Dickens',
        help: 'DRAG Oliver or use ARROW KEYS. Stay out of the guards\' lantern light! Survive 26 seconds in the dark house.',
        winText: 'Oliver slips through the window unseen. Sikes grabs the silver and they flee into the night.',
        loseText: 'Caught in the lamplight! A pistol shot rings out — Oliver falls wounded.',

        init: function (api) {
          this.olivX   = api.W / 2;
          this.olivY   = api.H * 0.75;
          this.lives   = 3;
          this.survive = 0;
          this.target  = 26;
          this.hitCD   = 0;
          // Guards: walk back and forth along a path, cone points forward
          this.g1 = { x: api.W*0.5, y: api.H*0.32, dir: 1, spd: 48 }; // horizontal
          this.g2 = { x: api.W*0.72, y: api.H*0.55, dir: 1, spd: 38 }; // vertical
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;

          // Drag Oliver toward pointer
          if (api.pointer.down) {
            var pdx = api.pointer.x - this.olivX;
            var pdy = api.pointer.y - this.olivY;
            var pd = Math.sqrt(pdx*pdx + pdy*pdy);
            if (pd > 4) {
              var spd = 115;
              this.olivX = clamp(this.olivX + (pdx/pd)*spd*dt, 12, W-12);
              this.olivY = clamp(this.olivY + (pdy/pd)*spd*dt, 12, H-12);
            }
          }
          // Arrow keys
          var kx = 0, ky = 0;
          if (api.keyDown('left'))  kx = -1;
          if (api.keyDown('right')) kx =  1;
          if (api.keyDown('up'))    ky = -1;
          if (api.keyDown('down'))  ky =  1;
          this.olivX = clamp(this.olivX + kx * 120 * dt, 12, W-12);
          this.olivY = clamp(this.olivY + ky * 120 * dt, 12, H-12);

          // Patrol guard 1: horizontal across upper area
          this.g1.x += this.g1.dir * this.g1.spd * dt;
          if (this.g1.x > W*0.82) this.g1.dir = -1;
          if (this.g1.x < W*0.18) this.g1.dir =  1;

          // Patrol guard 2: vertical along right side
          this.g2.y += this.g2.dir * this.g2.spd * dt;
          if (this.g2.y > H*0.72) this.g2.dir = -1;
          if (this.g2.y < H*0.18) this.g2.dir =  1;

          // Check if Oliver is in either guard's lantern cone
          if (this.hitCD > 0) {
            this.hitCD -= dt;
          } else {
            var guards = [
              { x: this.g1.x, y: this.g1.y, angle: this.g1.dir > 0 ? 0 : Math.PI },
              { x: this.g2.x, y: this.g2.y, angle: this.g2.dir > 0 ? Math.PI*0.5 : Math.PI*1.5 },
            ];
            for (var gi = 0; gi < guards.length; gi++) {
              var guard = guards[gi];
              var dx = this.olivX - guard.x;
              var dy = this.olivY - guard.y;
              var dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < 78) {
                var toOliver = Math.atan2(dy, dx);
                var diff = toOliver - guard.angle;
                while (diff >  Math.PI) diff -= 2*Math.PI;
                while (diff < -Math.PI) diff += 2*Math.PI;
                if (Math.abs(diff) < 0.48) {
                  this.lives--;
                  this.hitCD = 1.3;
                  api.shake(8, 0.4);
                  api.flash(C.amberL, 0.22);
                  api.burst(this.olivX, this.olivY, C.red, 10);
                  if (this.lives <= 0) { api.lose(); return; }
                  // Reset Oliver to safe position
                  this.olivX = W/2;
                  this.olivY = H * 0.78;
                }
              }
            }
          }

          this.survive += dt;
          api.addScore(Math.floor(dt * 7));
          if (this.survive >= this.target) api.win();
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Dark house interior
          c.fillStyle = '#08060a'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#0e0c0e'; c.fillRect(W*0.06, H*0.12, W*0.88, H*0.76);

          // Floor boards
          c.fillStyle = '#1a1208'; c.fillRect(0, H*0.82, W, H*0.18);
          c.strokeStyle = '#221a0e'; c.lineWidth = 1;
          for (var fi = 0; fi < 8; fi++) {
            c.beginPath(); c.moveTo(fi*36, H*0.82); c.lineTo(fi*36, H); c.stroke();
          }

          // Furniture silhouettes
          g.rect(16, H*0.48, 44, 32, '#0c0a0e');
          g.rect(W-64, H*0.30, 52, 48, '#0e0c0c');

          // Window (the goal / entry point)
          c.strokeStyle = C.amber; c.lineWidth = 2;
          c.strokeRect(W-52, H*0.18, 38, 32);
          c.globalAlpha = 0.08;
          c.fillStyle = C.amberL;
          c.fillRect(W-52, H*0.18, 38, 32);
          c.globalAlpha = 1;
          api.txtCFit('EXIT', W-33, H*0.18+11, 5, C.amber, false, 38);

          // Door frame
          c.strokeStyle = '#2c2014'; c.lineWidth = 3;
          c.strokeRect(16, H*0.24, 36, 56);

          // Guard 1 (horizontal patrol)
          var g1dir = this.g1.dir, g1x = this.g1.x, g1y = this.g1.y;
          var g1angle = g1dir > 0 ? 0 : Math.PI;
          // Cone
          var coneLen = 78, halfCone = 0.48;
          c.globalAlpha = 0.13;
          c.fillStyle = C.gasYel;
          c.beginPath(); c.moveTo(g1x, g1y);
          c.arc(g1x, g1y, coneLen, g1angle-halfCone, g1angle+halfCone);
          c.closePath(); c.fill();
          c.globalAlpha = 1;
          // Figure
          g.circle(g1x, g1y-11, 8, C.stone);
          g.rect(g1x-6, g1y-4, 12, 18, '#3a2c18');
          // Held lantern
          var l1x = g1x + Math.cos(g1angle)*18, l1y = g1y + Math.sin(g1angle)*18;
          g.circle(l1x, l1y, 5, C.gasYel);
          c.strokeStyle = C.brownL; c.lineWidth = 1;
          c.beginPath(); c.moveTo(g1x, g1y); c.lineTo(l1x, l1y); c.stroke();

          // Guard 2 (vertical patrol)
          var g2x = this.g2.x, g2y = this.g2.y;
          var g2angle = this.g2.dir > 0 ? Math.PI*0.5 : Math.PI*1.5;
          // Cone
          c.globalAlpha = 0.13;
          c.fillStyle = C.gasYel;
          c.beginPath(); c.moveTo(g2x, g2y);
          c.arc(g2x, g2y, coneLen, g2angle-halfCone, g2angle+halfCone);
          c.closePath(); c.fill();
          c.globalAlpha = 1;
          // Figure
          g.circle(g2x, g2y-11, 8, C.stone);
          g.rect(g2x-6, g2y-4, 12, 18, '#3a2c18');
          var l2x = g2x + Math.cos(g2angle)*18, l2y = g2y + Math.sin(g2angle)*18;
          g.circle(l2x, l2y, 5, C.gasYel);
          c.strokeStyle = C.brownL; c.lineWidth = 1;
          c.beginPath(); c.moveTo(g2x, g2y); c.lineTo(l2x, l2y); c.stroke();

          // Oliver
          var invisible = this.hitCD > 0 && Math.floor(this.hitCD * 7) % 2 === 0;
          drawOliver(g, c, this.olivX, this.olivY, invisible);

          // Lives
          for (var li = 0; li < this.lives; li++) {
            g.circle(13 + li*24, 14, 7, li === 0 ? C.amberL : C.stone);
          }

          // Survive bar
          var pct = Math.min(1, this.survive / this.target);
          g.rect(0, H-8, W, 8, '#060406');
          g.rect(0, H-8, W*pct, 8, C.amber);
          api.txtCFit('SURVIVE ' + Math.ceil(this.target - this.survive) + 's', W/2, H-17, 6, C.stone, false, W);
          api.topBar('THE BURGLARY', api.score);
          api.vignette();
          api.scanlines();
        },
      },

      /* ───────────────────────────────────────────────────────────────
       * ACT 5 — ROOFTOP RECKONING
       * Dodge pre-telegraphed stones from Sikes until dawn (28s). 3 lives.
       * ─────────────────────────────────────────────────────────────── */
      {
        id: 'rooftop',
        name: 'ROOFTOP RECKONING',
        sub: 'NOWHERE LEFT TO RUN',
        icon: function (api, x, y) { ICONS[4](api, x, y); },
        intro: [
          'CORNERED ON THE ROOFTOPS',
          'OF JACOB\'S ISLAND,',
          'BILL SIKES HURLS STONES',
          'at Oliver and the crowd.',
          'Survive until dawn breaks!',
        ],
        quote: '"The noose swung above. The crowd gathered below. Sikes held his ground." — Charles Dickens',
        help: 'Dodge SIKES\' stones! Tap LEFT or RIGHT side to move. A warning triangle shows WHERE each stone will land. Survive 28 seconds until dawn!',
        winText: 'Dawn breaks. In panic, Sikes\' rope catches — justice comes from his own hand.',
        loseText: 'A stone strikes true. Oliver falls from the rooftop into the mud below.',

        init: function (api) {
          this.olivX  = api.W / 2;
          this.lives  = 3;
          this.dawn   = 0;
          this.target = 28;
          this.projs  = [];  // {x, y, type:'warn'|'stone', t, spd}
          this.spawnT = 0;
          this.hitCD  = 0;
          this.sikesX = api.W / 2;
          this.sikesT = 0;
        },

        update: function (api, dt) {
          var W = api.W, H = api.H;

          // Move Oliver
          var mx = 0;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W/2))  mx = -1;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= W/2)) mx =  1;
          this.olivX = clamp(this.olivX + mx * 188 * dt, 16, W-16);

          // Sikes paces upper area menacingly
          this.sikesT += dt;
          this.sikesX = W/2 + Math.sin(this.sikesT * 0.65) * W * 0.30;

          // Spawn projectile warnings, then convert to stones
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var wx = 16 + Math.random() * (W-32);
            this.projs.push({ x: wx, y: H*0.3, type: 'warn', t: 0.58 });
            var rate = Math.max(0.55, 1.15 - this.dawn * 0.017);
            this.spawnT = rate;
          }

          // Update projectiles
          var stoneSpd = 148 + this.dawn * 6;
          for (var pi = this.projs.length - 1; pi >= 0; pi--) {
            var p = this.projs[pi];
            if (p.type === 'warn') {
              p.t -= dt;
              if (p.t <= 0) {
                p.type = 'stone';
                p.y    = H * 0.28;
                p.t    = 4.0;  // just a sentinel
              }
            } else {
              p.y += stoneSpd * dt;
              if (p.y > H + 30) { this.projs.splice(pi, 1); continue; }
            }
          }

          // Collision
          var olivY = H * 0.77;
          if (this.hitCD > 0) {
            this.hitCD -= dt;
          } else {
            for (var si = 0; si < this.projs.length; si++) {
              var s = this.projs[si];
              if (s.type === 'stone' &&
                  Math.abs(s.x - this.olivX) < 18 &&
                  s.y > olivY - 20 && s.y < olivY + 12) {
                this.lives--;
                this.hitCD = 0.9;
                api.shake(8, 0.38);
                api.flash(C.red, 0.18);
                api.burst(this.olivX, olivY, C.red, 9);
                this.projs.splice(si, 1);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }

          this.dawn += dt;
          api.addScore(Math.floor(dt * 10));
          if (this.dawn >= this.target) api.win();
        },

        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var t = api.t;

          // Dawn sky gradient (shifts from night to orange-grey)
          var dp = Math.min(1, this.dawn / this.target);
          var r = Math.floor(8  + dp*110);
          var gr= Math.floor(6  + dp*66);
          var b = Math.floor(14 + dp*18);
          var r2= Math.floor(20 + dp*160);
          var g2= Math.floor(14 + dp*90);
          var b2= Math.floor(26 + dp*8);
          var sky = c.createLinearGradient(0, 0, 0, H*0.7);
          sky.addColorStop(0, 'rgb('+r+','+gr+','+b+')');
          sky.addColorStop(1, 'rgb('+r2+','+g2+','+b2+')');
          c.fillStyle = sky; c.fillRect(0, 0, W, H*0.7);
          g.rect(0, H*0.7, W, H*0.3, '#1a1410');

          // Rising glow when dawn nears
          if (dp > 0.35) {
            c.globalAlpha = (dp-0.35) * 0.7;
            var sunGrad = c.createRadialGradient(W/2, H*(0.55-dp*0.3), 0, W/2, H*(0.55-dp*0.3), 90);
            sunGrad.addColorStop(0, C.amberL);
            sunGrad.addColorStop(0.4, '#e06018');
            sunGrad.addColorStop(1, 'transparent');
            c.fillStyle = sunGrad; c.fillRect(0, 0, W, H*0.7);
            c.globalAlpha = 1;
          }

          // London rooftop silhouettes
          var roofs = [
            [0,  H*0.37, 54, H*0.63],
            [50, H*0.43, 40, H*0.57],
            [87, H*0.34, 50, H*0.66],
            [132,H*0.40, 36, H*0.60],
            [166,H*0.36, 52, H*0.64],
            [215,H*0.39, 56, H*0.61],
          ];
          c.fillStyle = '#0c0a08';
          for (var ri = 0; ri < roofs.length; ri++) {
            var ro = roofs[ri];
            c.fillRect(ro[0], ro[1], ro[2], ro[3]);
            // Chimneys
            g.rect(ro[0]+7,      ro[1]-20, 9, 22, '#0a0806');
            g.rect(ro[0]+ro[2]-18, ro[1]-14, 8, 16, '#0c0a08');
          }

          // Rooftop platform for the characters
          g.rect(0, H*0.68, W, H*0.06, '#1c1810');

          // Warning triangles (where stones will land)
          for (var pi = 0; pi < this.projs.length; pi++) {
            var p = this.projs[pi];
            if (p.type === 'warn') {
              var alpha = Math.max(0, p.t) * 1.5;
              c.globalAlpha = Math.min(1, alpha);
              c.strokeStyle = C.red; c.lineWidth = 2;
              c.beginPath();
              c.moveTo(p.x-9, H*0.74+2);
              c.lineTo(p.x,   H*0.74-12);
              c.lineTo(p.x+9, H*0.74+2);
              c.closePath(); c.stroke();
              c.globalAlpha = 1;
            }
          }

          // Stones
          for (var si2 = 0; si2 < this.projs.length; si2++) {
            var s = this.projs[si2];
            if (s.type === 'stone') {
              g.circle(s.x, s.y, 7, C.stone);
              g.circle(s.x-1, s.y-2, 2, C.fogL);
            }
          }

          // Bill Sikes (dark, threatening, upper area)
          var sikX = this.sikesX, sikY = H*0.26;
          g.circle(sikX, sikY-14, 14, C.coal);
          g.rect(sikX-12, sikY-1, 24, 32, C.dark);
          // Hat and scarf
          g.rect(sikX-14, sikY-24, 28, 6, C.coal);
          g.rect(sikX-11, sikY-38, 22, 16, C.dark);
          // Arm raised to throw
          var throwA = -0.7 + 0.3*Math.sin(t*3.5);
          c.strokeStyle = C.coal; c.lineWidth = 6;
          c.beginPath();
          c.moveTo(sikX-6, sikY);
          c.lineTo(sikX-6 + Math.cos(throwA)*28, sikY + Math.sin(throwA)*28);
          c.stroke();
          // Rope around neck (foreshadowing)
          c.strokeStyle = '#5a4010'; c.lineWidth = 2;
          c.beginPath(); c.arc(sikX, sikY-14, 15, 0.4, Math.PI-0.4); c.stroke();

          // Oliver at bottom
          var olivY = H * 0.77;
          var invisible = this.hitCD > 0 && Math.floor(this.hitCD * 8) % 2 === 0;
          drawOliver(g, c, this.olivX, olivY, invisible);

          // Lives
          for (var li = 0; li < this.lives; li++) {
            g.circle(13 + li*24, 14, 7, li === 0 ? C.amberL : C.stone);
          }

          // Dawn bar
          var dawnW = W * Math.min(1, this.dawn / this.target);
          g.rect(0, H-8, W, 8, '#060404');
          var dawnGrad = c.createLinearGradient(0, H-8, dawnW, H);
          dawnGrad.addColorStop(0, '#18101e');
          dawnGrad.addColorStop(1, C.amberL);
          c.fillStyle = dawnGrad;
          c.fillRect(0, H-8, dawnW, 8);
          api.txtCFit('DAWN IN ' + Math.ceil(this.target - this.dawn) + 's', W/2, H-17, 6, C.amber, false, W);
          api.topBar('ROOFTOP RECKONING', api.score);
          api.vignette();
          api.scanlines();
        },
      },

    ], // chapters
  }); // RetroSaga.create

})();
