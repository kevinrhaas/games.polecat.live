/* ============================================================================
 * LITTLE WOMEN — FIVE CHAPTERS FROM ALCOTT'S NOVEL
 *   1. A MERRY CHRISTMAS — falling-catch: gifts for the Hummels (collect 10)
 *   2. THE PICKWICK CLUB — timing ring: Jo's melodrama, 7 dramatic beats
 *   3. OVER THE ICE      — dodge: Amy's frozen pond, survive 22 seconds
 *   4. BETH'S FEVER      — whack-a-mole: tap medicine vials, collect 15
 *   5. THE RETURN        — float-collect: catch joy tokens, dodge shadows
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ─── Palette ──────────────────────────────────────────────────────────── */
  var C = {
    bg:      '#160c04',  bgM:    '#1e1008',  bgD:    '#0c0604',
    fire:    '#e84010',  fireL:  '#f88030',  fireLL: '#ffcc60',
    gold:    '#d4a020',  goldL:  '#f0cc60',  goldLL: '#fffbc0',
    rose:    '#c84868',  roseD:  '#7a2840',  roseL:  '#e890a8',  roseLL: '#ffd8e8',
    cream:   '#f0e0c0',  creamD: '#c8a870',  creamDD:'#8a6040',
    sage:    '#6a8840',  sageL:  '#a0c050',
    mahog:   '#5a2808',  mahogL: '#8a4818',  mahogLL:'#b86828',
    skin:    '#e0a878',  skinD:  '#c07848',
    dark:    '#0a0604',  grey:   '#887870',  greyL:  '#c0b0a0',
    snow:    '#d8e8f0',  snowL:  '#f0f8fc',
    ice:     '#b0d4e8',  iceD:   '#78a8c8',  crackD: '#3a5870',
    joy:     '#ffdc50',  joyL:   '#ffffc0',
    shadow:  '#283850',  shadowL:'#3a4c68',
    vial:    '#a0e8c8',  vialL:  '#c8fff0',
    waxRed:  '#b82020',
    paper:   '#f0e8d0',  paperD: '#d4c890',
    candleG: '#e88020',
  };

  /* ─── Emblem: open book with rose ─────────────────────────────────────── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    g.rect(cx - 18, cy - 14, 36, 28, C.mahogL);
    g.rect(cx - 18, cy - 14, 5, 28, C.mahog);
    g.rect(cx - 13, cy - 12, 26, 24, C.paper);
    g.rect(cx - 1, cy - 12, 2, 24, C.creamD);
    g.rect(cx - 9, cy - 7, 18, 2, C.rose);
    g.rect(cx - 9, cy - 3, 14, 2, C.roseL);
    g.rect(cx - 7, cy + 1,  12, 2, C.roseL);
    g.circle(cx + 7, cy + 8, 5, C.roseD);
    g.circle(cx + 7, cy + 8, 3, C.rose);
    g.circle(cx + 7, cy + 8, 1, C.goldL);
    g.rect(cx + 6, cy + 13, 2, 5, C.sage);
  }

  /* ─── Scenery: Victorian parlor at Christmas ───────────────────────────── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    c.fillStyle = C.bgD; c.fillRect(0, 0, W, H);
    // Wall paneling
    c.fillStyle = '#1e0e06'; c.fillRect(0, 0, W, H - 80);
    for (var p = 0; p < 3; p++) { g.rectO(p * 94 + 4, 20, 84, 90, '#3a1c0a', 1); }
    // Floorboards
    c.fillStyle = C.mahog; c.fillRect(0, H - 80, W, 80);
    for (var f = 0; f < 6; f++) { c.fillRect(f * 50 - 10, H - 80, 2, 80); }
    c.fillStyle = C.mahogL; c.fillRect(0, H - 82, W, 3);
    // Fireplace lower-left
    c.fillStyle = '#2a1008'; c.fillRect(0, H - 148, 64, 70);
    g.rect(6, H - 142, 52, 64, '#120804');
    var fl = 0.85 + 0.15 * Math.sin(t * 4.8);
    for (var fi = 0; fi < 7; fi++) {
      var fx = 11 + fi * 6 + Math.sin(t * 3.2 + fi * 0.9) * 2.5;
      var fh = 10 + (fi % 3) * 7 + Math.sin(t * 5.1 + fi * 1.3) * 5;
      g.rect(fx, H - 84 - fh * fl, 4, fh, fi % 2 ? C.fire : C.fireL);
    }
    c.globalAlpha = 0.12 + 0.08 * Math.sin(t * 2.3);
    g.circle(32, H - 96, 30, C.fireLL); c.globalAlpha = 1;
    g.rect(0, H - 150, 68, 8, C.mahogLL);
    // Candles on mantel
    for (var ci = 0; ci < 3; ci++) {
      var cmx = 6 + ci * 22;
      g.rect(cmx, H - 165, 5, 14, C.cream);
      g.circle(cmx + 2, H - 167, 4, C.fireLL);
      c.globalAlpha = 0.10 + 0.07 * Math.sin(t * 3.4 + ci);
      g.circle(cmx + 2, H - 167, 12, C.goldL); c.globalAlpha = 1;
    }
    // Window right
    g.rect(W - 52, 20, 50, 120, '#0e1828');
    for (var sw = 0; sw < 8; sw++) {
      var sx2 = W - 50 + (sw * 19) % 44, sy2 = 26 + (sw * 17) % 100;
      c.globalAlpha = 0.35 + 0.25 * Math.sin(t * 1.2 + sw);
      g.rect(sx2, sy2, 2, 2, C.snowL); c.globalAlpha = 1;
    }
    g.rect(W - 52, 138, 50, 5, C.snowL);
    g.rectO(W - 52, 20, 50, 120, C.mahogL, 2);
    g.rect(W - 26, 20, 2, 120, C.mahogL);
    g.rect(W - 52, 80, 50, 2, C.mahogL);
    // Curtains
    for (var cu = 0; cu < 6; cu++) {
      c.fillStyle = cu % 2 ? C.rose : C.roseD;
      c.fillRect(W - 57, 18 + cu * 4, 7, 3);
      c.fillRect(W - 4, 18 + cu * 4, 5, 3);
    }
    // Warm fire glow
    c.globalAlpha = 0.06 + 0.04 * Math.sin(t * 1.9);
    var gg = c.createRadialGradient(30, H - 110, 0, 30, H - 110, 180);
    gg.addColorStop(0, C.fireL); gg.addColorStop(1, 'transparent');
    c.fillStyle = gg; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
    // Overlays
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(10,6,2,.76)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(14,8,2,.52)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Chapter-select: 5 keepsake cards in a diamond/parlor pattern ─────── */
  var SPOTS = [
    { x: 14,  y: 100, w: 108, h: 68 },  // Ch1 top-left   (Christmas)
    { x: 146, y: 112, w: 108, h: 68 },  // Ch2 top-right  (Pickwick)
    { x: 78,  y: 208, w: 110, h: 68 },  // Ch3 center     (Ice)
    { x: 14,  y: 316, w: 108, h: 68 },  // Ch4 bot-left   (Fever)
    { x: 146, y: 328, w: 108, h: 68 },  // Ch5 bot-right  (Return)
  ];

  /* ─── Chapter icons ──────────────────────────────────────────────────────── */
  var ICONS = [
    function (api, x, y) {  // wrapped gift
      var g = api.gfx, c = api.ctx;
      g.rect(x - 8, y - 4, 16, 12, C.rose);
      g.rect(x - 10, y - 6, 20, 5, C.roseD);
      g.rect(x - 1, y - 12, 2, 20, C.goldL);
      g.rect(x - 8, y - 4, 16, 2, C.goldL);
      c.fillStyle = C.gold;
      c.beginPath(); c.ellipse(x - 6, y - 9, 5, 3, -0.4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(x + 6, y - 9, 5, 3,  0.4, 0, Math.PI * 2); c.fill();
      g.circle(x, y - 8, 3, C.gold);
    },
    function (api, x, y) {  // comedy/drama masks
      var g = api.gfx, c = api.ctx;
      g.circle(x - 6, y - 1, 7, C.creamD);
      g.circle(x + 6, y + 1, 7, C.mahogL);
      c.strokeStyle = C.dark; c.lineWidth = 1.5;
      c.beginPath(); c.arc(x - 6, y + 2, 4, 0.2, Math.PI - 0.2); c.stroke();
      c.strokeStyle = C.cream; c.lineWidth = 1.5;
      c.beginPath(); c.arc(x + 6, y - 1, 4, Math.PI + 0.2, -0.2); c.stroke();
    },
    function (api, x, y) {  // ice skate
      var g = api.gfx, c = api.ctx;
      g.rect(x - 10, y - 2, 20, 8, C.cream);
      g.rect(x - 6,  y - 7, 10, 6, C.creamD);
      c.strokeStyle = C.iceD; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x - 11, y + 6); c.lineTo(x + 12, y + 6); c.stroke();
      g.rect(x - 1, y + 4, 2, 4, C.grey);
    },
    function (api, x, y) {  // medicine vial
      var g = api.gfx, c = api.ctx;
      g.rect(x - 4, y - 10, 8, 14, C.vial);
      g.rect(x - 3, y - 10, 6,  4, C.vialL);
      g.circle(x, y - 10, 3, C.creamD);
      c.globalAlpha = 0.35; g.circle(x, y, 9, C.vialL); c.globalAlpha = 1;
      g.circle(x, y - 4, 2, C.rose);
    },
    function (api, x, y) {  // homecoming letter / envelope
      var g = api.gfx, c = api.ctx;
      g.rect(x - 10, y - 7, 20, 14, C.paper);
      g.rectO(x - 10, y - 7, 20, 14, C.creamDD, 1);
      c.fillStyle = C.creamD;
      c.beginPath(); c.moveTo(x - 10, y - 7); c.lineTo(x, y + 2); c.lineTo(x + 10, y - 7); c.closePath(); c.fill();
      g.rect(x - 1, y - 6, 2, 10, C.rose);
      g.rect(x - 4, y - 2, 8, 2, C.rose);
    },
  ];

  RetroSaga.create({
    id: 'littlewomen',
    title: 'Little Women',
    subtitle: 'FIVE CHAPTERS · LOUISA MAY ALCOTT',
    currency: 'GRACE',
    screens: {
      win:          '#d4a020',
      lose:         '#7a2840',
      chapterLabel: '#9a8060',
      name:         '#f0e0c0',
      sub:          '#c84868',
      intro:        '#e8d4b0',
      quote:        '#9a8060',
      help:         '#d4a020',
      score:        '#f0e0c0',
      cur:          '#d4a020',
      cta:          '#f0e0c0',
      overlay:      'rgba(16,8,2,.86)',
    },
    labels: {
      chapter:  'CHAPTER',
      score:    'GRACE GIVEN',
      win:      'THE MARCH GIRLS TRIUMPH',
      lose:     'THE BURDEN GROWS HEAVY',
      cont:     'TAP TO PRESS ON',
      finale:   'TAP FOR THE HOMECOMING',
      toMenu:   'TAP TO RETURN HOME',
      play:     'TAP TO BEGIN',
    },
    accent:    '#c84868',
    credit:    'LITTLE WOMEN · LOUISA MAY ALCOTT · 1868',
    bootLine:  'FIVE CHAPTERS · ONE FAMILY',
    tagline:   'A POLECAT ADVENTURE',
    emblem,
    scenery,
    bootCta:   'TAP TO BEGIN THE STORY',
    menuLabel: 'THE MARCH PARLOR',
    menuHint:  'CHOOSE A CHAPTER',
    menuDone:  'ALL FOUR SISTERS GROWN',
    menu: {
      layout: function () { return SPOTS; },
      title: function (api, grace) {
        var g = api.gfx, c = api.ctx, W = api.W;
        // Ornate Victorian banner frame
        g.rect(10, 18, W - 20, 62, C.mahog);
        g.rect(12, 20, W - 24, 58, C.bgM);
        g.rectO(10, 18, W - 20, 62, C.gold, 1);
        g.rectO(14, 22, W - 28, 54, C.mahogL, 1);
        g.circle(14, 22, 4, C.gold); g.circle(W - 14, 22, 4, C.gold);
        g.circle(14, 76, 4, C.gold); g.circle(W - 14, 76, 4, C.gold);
        api.txtCFit('THE MARCH PARLOR', W / 2, 35, 9, C.cream, false, W - 44);
        api.txtCFit('GRACE  ' + grace, W / 2, 52, 8, C.gold, false, W - 44);
        c.strokeStyle = C.roseL; c.lineWidth = 1;
        c.beginPath(); c.moveTo(22, 63); c.lineTo(W - 22, 63); c.stroke();
        api.txtCFit('LITTLE WOMEN · L. M. ALCOTT', W / 2, 71, 6, C.creamDD, false, W - 44);
        // Connecting rose ribbons between cards
        c.strokeStyle = C.rose; c.lineWidth = 1.2; c.globalAlpha = 0.32;
        var sp = SPOTS;
        // ch1 → center, ch2 → center
        c.beginPath(); c.moveTo(sp[0].x + sp[0].w / 2, sp[0].y + sp[0].h); c.lineTo(sp[2].x + sp[2].w / 2, sp[2].y); c.stroke();
        c.beginPath(); c.moveTo(sp[1].x + sp[1].w / 2, sp[1].y + sp[1].h); c.lineTo(sp[2].x + sp[2].w / 2, sp[2].y); c.stroke();
        // center → ch4, center → ch5
        c.beginPath(); c.moveTo(sp[2].x + sp[2].w / 2, sp[2].y + sp[2].h); c.lineTo(sp[3].x + sp[3].w / 2, sp[3].y); c.stroke();
        c.beginPath(); c.moveTo(sp[2].x + sp[2].w / 2, sp[2].y + sp[2].h); c.lineTo(sp[4].x + sp[4].w / 2, sp[4].y); c.stroke();
        c.globalAlpha = 1;
      },
      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        var ch = info.ch, sel = info.sel, done = info.done;
        var cx = x + w / 2, cy = y + h / 2;
        // Victorian keepsake card
        g.rect(x, y, w, h, sel ? '#f0e8d8' : C.paperD);
        g.rectO(x, y, w, h, sel ? C.gold : C.mahogL, sel ? 2 : 1);
        g.rectO(x + 3, y + 3, w - 6, h - 6, sel ? C.mahogL : C.creamDD, 1);
        // Rose tint if selected
        if (sel) {
          c.fillStyle = C.rose; c.globalAlpha = 0.10;
          c.fillRect(x + 1, y + 1, w - 2, h - 2); c.globalAlpha = 1;
        }
        // Icon
        ICONS[i](api, cx, cy - 14);
        // Chapter name
        api.txtCFit(ch.name, cx, cy + 7, 5, sel ? C.mahog : C.creamDD, false, w - 12);
        // Bottom ribbon if selected
        if (sel) {
          g.rect(x, y + h - 14, w, 14, C.roseD);
          api.txtCFit('TAP TO PLAY', cx, y + h - 8, 5, C.roseLL, false, w - 8);
        }
        // Wax seal if done
        if (done) {
          g.circle(x + w - 10, y + h - 10, 8, C.waxRed);
          api.txtC('✓', x + w - 10, y + h - 14, 7, C.cream);
        }
        // Chapter number badge
        g.circle(x + 10, y + 10, 8, sel ? C.gold : C.mahogL);
        api.txtC('' + (i + 1), x + 10, y + 6, 7, sel ? C.dark : C.cream);
      },
    },
    finale: ['FATHER COMES HOME.', 'MARMEE WEEPS WITH JOY.', '', 'THE MARCH SISTERS', 'HAVE KEPT THEIR GRACE.'],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#d4a020', rose: '#c84868', cream: '#f0e0c0', fire: '#e84010' },

    chapters: [

      /* ==================================================================
       * CHAPTER 1 — A MERRY CHRISTMAS
       * Falling-catch: gifts for the Hummels. Collect 10 in 26s, 3 lives.
       * ================================================================== */
      {
        id: 'christmas',
        name: 'A MERRY CHRISTMAS',
        sub: 'GIFTS FOR THE HUMMELS',
        icon: function (api, x, y) { ICONS[0](api, x, y); },
        intro: [
          'CHRISTMAS MORNING IN CONCORD.',
          'FATHER IS AT WAR.',
          'MARMEE CALLS HER DAUGHTERS:',
          '"Our neighbors the Hummels',
          'have nothing at all.',
          'Let us give them our breakfast."',
        ],
        quote: '"There are people poorer than we, and I think this little sacrifice will make us happy all day." — Louisa May Alcott',
        help: 'MOVE left/right to CATCH gift parcels and food. Dodge COAL and snowballs!',
        winText: 'The Hummels are fed. The March girls glow with warmth all day long.',
        loseText: 'The gifts are lost in the snow. Try again.',
        init: function (api) {
          this.px      = api.W / 2;
          this.py      = api.H - 60;
          this.lives   = 3;
          this.caught  = 0;
          this.need    = 10;
          this.timer   = 0;
          this.tlimit  = 26;
          this.items   = [];
          this.spawnT  = 0;
          this.spRate  = 1.2;
          this.speed   = 78;
          this.hurtT   = 0;
          this.done    = false;
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W, H = api.H;
          this.timer += dt;
          this.hurtT = Math.max(0, this.hurtT - dt);
          // Player move
          if (api.keyDown('left'))  this.px -= 155 * dt;
          if (api.keyDown('right')) this.px += 155 * dt;
          if (api.pointer.down) this.px += (api.pointer.x - this.px) * 9 * dt;
          this.px = clamp(this.px, 18, W - 18);
          // Spawn
          this.spawnT += dt;
          var prog = this.timer / this.tlimit;
          if (this.spawnT >= this.spRate) {
            this.spawnT = 0;
            this.spRate = Math.max(0.65, 1.2 - prog * 0.4);
            this.speed  = Math.min(180, 78 + prog * 90);
            var good = Math.random() < 0.62;
            this.items.push({
              x:  20 + Math.random() * (W - 40),
              y:  -14,
              vy: this.speed * (0.85 + Math.random() * 0.3),
              t:  good ? Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 2),
              rot: Math.random() * Math.PI * 2,
            });
          }
          // Update items
          for (var i = this.items.length - 1; i >= 0; i--) {
            var it = this.items[i];
            it.y += it.vy * dt;
            it.rot += 1.8 * dt;
            if (it.y > H + 20) { this.items.splice(i, 1); continue; }
            var dx = it.x - this.px, dy = it.y - this.py;
            if (dx * dx + dy * dy < 21 * 21) {
              this.items.splice(i, 1);
              if (it.t < 3) {
                this.caught++;
                api.addScore(10);
                api.audio.sfx('coin');
                api.burst(it.x, it.y, C.gold, 6);
                if (this.caught >= this.need) { this.done = true; api.win(); return; }
              } else if (this.hurtT <= 0) {
                this.lives--;
                this.hurtT = 1.1;
                api.shake(5, 0.3);
                api.flash(C.rose, 0.2);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { this.done = true; api.lose(); return; }
              }
            }
          }
          if (this.timer >= this.tlimit) { this.done = true; api.lose(); }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Snowy night street
          var sky = c.createLinearGradient(0, 0, 0, H * 0.55);
          sky.addColorStop(0, '#0c1824'); sky.addColorStop(1, '#1e3448');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          // Houses
          var houseColors = ['#1a1208','#1a0e06','#1e1408','#160e04'];
          for (var h = 0; h < 4; h++) {
            var hx = h * 70 - 8;
            c.fillStyle = houseColors[h % 4]; c.fillRect(hx, H * 0.3, 56, H * 0.35);
            c.fillStyle = C.fireLL; c.globalAlpha = 0.38;
            c.fillRect(hx + 8, H * 0.35, 12, 10);
            c.fillRect(hx + 30, H * 0.35, 12, 10);
            c.globalAlpha = 1;
            c.fillStyle = '#0e0c0a';
            c.beginPath(); c.moveTo(hx - 4, H * 0.3); c.lineTo(hx + 28, H * 0.1); c.lineTo(hx + 60, H * 0.3); c.closePath(); c.fill();
          }
          // Snowflake drift
          for (var sf = 0; sf < 18; sf++) {
            var sx2 = ((sf * 43 + this.timer * 18) % (W + 10));
            var sy2 = ((sf * 37 + this.timer * 22 + sf * 14) % H);
            c.globalAlpha = 0.45; g.circle(sx2, sy2, 1, C.snowL); c.globalAlpha = 1;
          }
          // Snow ground
          c.fillStyle = C.snow; c.fillRect(0, H - 42, W, 42);
          c.fillStyle = C.snowL; c.fillRect(0, H - 44, W, 4);
          // Draw items
          for (var i = 0; i < this.items.length; i++) {
            var it = this.items[i];
            c.save(); c.translate(it.x, it.y); c.rotate(it.rot);
            if (it.t === 0) {           // wrapped gift (rose box + gold ribbon)
              g.rect(-7, -5, 14, 11, C.rose);
              g.rect(-8, -7, 16, 5, C.roseD);
              g.rect(-1, -10, 2, 16, C.gold);
              g.rect(-7, -5, 14, 2, C.gold);
              g.circle(0, -9, 3, C.gold);
            } else if (it.t === 1) {    // bread loaf
              g.rect(-7, -4, 14, 9, C.mahogL);
              g.rect(-6, -5, 12, 5, C.creamD);
              g.circle(0, -5, 5, C.creamD);
            } else if (it.t === 2) {    // cream jug
              g.rect(-5, -7, 10, 13, C.snowL);
              g.rect(-7, -4, 4, 6, C.greyL);
              g.circle(0, -7, 4, C.cream);
            } else if (it.t === 3) {    // coal (bad)
              g.rect(-7, -5, 14, 10, C.dark);
              g.rect(-5, -3, 10, 7, '#282018');
              g.circle(-3, -1, 2, '#38302a');
            } else {                    // snowball (bad)
              g.circle(0, 0, 8, C.snow);
              g.circle(-3, -3, 3, C.snowL);
            }
            c.restore();
          }
          // Jo (player) — dark coat, dark bun
          var px = this.px, py = this.py;
          var hide = this.hurtT > 0 && Math.floor(this.hurtT * 9) % 2 === 0;
          if (!hide) {
            c.fillStyle = C.mahogL; c.fillRect(px - 10, py - 16, 20, 22);
            g.circle(px, py - 20, 9, C.skin);
            g.circle(px, py - 27, 7, C.dark);
            g.circle(px + 5, py - 25, 4, C.dark);
            g.rect(px - 10, py - 14, 20, 5, C.rose);       // scarf
            g.rect(px + 10, py - 8, 12, 10, C.mahog);      // basket
            g.rect(px + 10, py - 10, 12, 3, C.mahogLL);
          }
          api.topBar(this.lives, Math.max(0, this.tlimit - this.timer).toFixed(1) + 's', this.caught + '/' + this.need + ' GIFTS');
        },
      },

      /* ==================================================================
       * CHAPTER 2 — THE PICKWICK CLUB
       * Timing ring: tap at the sweet spot 7 times. ~25 s of play.
       * ================================================================== */
      {
        id: 'pickwick',
        name: 'THE PICKWICK CLUB',
        sub: "JO'S MELODRAMA",
        icon: function (api, x, y) { ICONS[1](api, x, y); },
        intro: [
          'IN THE OLD ATTIC BARN',
          'THE MARCH GIRLS FOUNDED',
          'THE PICKWICK CLUB.',
          'Jo\'s melodrama is tonight —',
          'hit every dramatic beat',
          'before the audience sleeps.',
        ],
        quote: '"I am the only literary lady in my family, and it is a great responsibility." — Jo March',
        help: 'TAP when the shrinking ring hits the GOLDEN CENTRE. Hit 7 dramatic beats!',
        winText: 'The audience erupts in applause. Jo takes her bow at centre stage.',
        loseText: 'Three missed cues — the audience nods off. Try again, Miss March.',
        init: function (api) {
          this.beat       = 0;
          this.beats      = 7;
          this.misses     = 0;
          this.maxMisses  = 3;
          this.ringR      = 108;
          this.shrinkTime = 3.2;
          this.ringT      = 0;
          this.GOOD_MIN   = 20;
          this.GOOD_MAX   = 46;
          this.phase      = 'shrink';
          this.resultT    = 0;
          this.quality    = '';
          this.pauseT     = 0;
          this.sparks     = [];
          this.done       = false;
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W, H = api.H;
          // Sparks
          for (var s = this.sparks.length - 1; s >= 0; s--) {
            var sp = this.sparks[s];
            sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.life -= dt;
            if (sp.life <= 0) this.sparks.splice(s, 1);
          }
          if (this.phase === 'shrink') {
            this.ringT += dt;
            this.ringR = 108 - (this.ringT / this.shrinkTime) * 96;
            if (this.ringR < 6) {
              this.quality = 'MISSED'; this.misses++;
              api.audio.sfx('hurt'); api.shake(4, 0.2);
              this.phase = 'result'; this.resultT = 0;
              if (this.misses >= this.maxMisses) { this.done = true; api.lose(); return; }
            }
            var tapped = api.pointer.justDown || api.keyPressed('a') || api.keyPressed('up');
            if (tapped) {
              var r = this.ringR;
              if (r <= this.GOOD_MIN) {
                this.quality = 'PERFECT!';
                api.audio.sfx('power');
                api.burst(W / 2, H * 0.38, C.gold, 12);
                api.addScore(25);
              } else if (r <= this.GOOD_MAX) {
                this.quality = 'BRAVO!';
                api.audio.sfx('coin');
                api.burst(W / 2, H * 0.38, C.roseL, 7);
                api.addScore(15);
              } else {
                this.quality = 'TOO EARLY';
                api.audio.sfx('blip');
                this.misses++;
                if (this.misses >= this.maxMisses) { this.done = true; api.lose(); return; }
              }
              // Audience applause sparks
              for (var s2 = 0; s2 < 10; s2++) {
                this.sparks.push({ x: 30 + Math.random() * (W - 60), y: H - 30, vx: (Math.random() - 0.5) * 50, vy: -50 - Math.random() * 60, life: 1.4 });
              }
              this.beat++;
              this.phase = 'result'; this.resultT = 0;
              if (this.beat >= this.beats) { this.done = true; api.win(); return; }
            }
          } else if (this.phase === 'result') {
            this.resultT += dt;
            if (this.resultT > 0.85) { this.phase = 'pause'; this.pauseT = 0; this.ringR = 108; this.ringT = 0; }
          } else if (this.phase === 'pause') {
            this.pauseT += dt;
            if (this.pauseT > 0.55) this.phase = 'shrink';
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dark theatre/barn interior
          c.fillStyle = '#100808'; c.fillRect(0, 0, W, H);
          // Stage curtains
          for (var cu = 0; cu < 8; cu++) {
            c.fillStyle = cu % 2 ? C.rose : C.roseD;
            c.fillRect(cu * 4, 0, 3, H); c.fillRect(W - 34 + cu * 4, 0, 3, H);
          }
          g.rect(0, 0, 34, H, 'rgba(80,10,30,.4)');
          g.rect(W - 34, 0, 34, H, 'rgba(80,10,30,.4)');
          // Stage floor
          c.fillStyle = C.mahog; c.fillRect(36, H * 0.52, W - 72, H * 0.48);
          for (var b = 0; b < 5; b++) { c.fillStyle = C.mahogL; c.fillRect(36, H * 0.52 + b * 18, W - 72, 2); }
          // Footlights
          for (var fl = 0; fl < 5; fl++) {
            var flx = 52 + fl * 36;
            g.circle(flx, H * 0.53, 5, C.goldLL);
            c.globalAlpha = 0.11; g.circle(flx, H * 0.53, 18, C.goldL); c.globalAlpha = 1;
          }
          // Audience silhouettes
          for (var au = 0; au < 7; au++) {
            c.fillStyle = ['#1a1008','#120c04','#0e0a04','#180e04'][au % 4];
            var ax = 38 + au * 28;
            c.beginPath(); c.arc(ax, H * 0.72, 9, 0, Math.PI * 2); c.fill();
            c.fillRect(ax - 7, H * 0.72, 14, 28);
          }
          // Applause sparks
          for (var s = 0; s < this.sparks.length; s++) {
            var sp2 = this.sparks[s];
            c.globalAlpha = sp2.life / 1.4;
            g.circle(sp2.x, sp2.y, 3, C.goldL); c.globalAlpha = 1;
          }
          // Jo performing on stage
          var jx = W / 2, jy = H * 0.52 - 28;
          g.circle(jx, jy - 28, 10, C.skin);
          g.circle(jx, jy - 36, 8, C.dark);
          g.circle(jx + 6, jy - 33, 5, C.dark);
          c.fillStyle = C.rose; c.fillRect(jx - 12, jy - 18, 24, 26);
          c.fillRect(jx - 16, jy - 6, 6, 14); c.fillRect(jx + 10, jy - 6, 6, 14);
          c.fillStyle = C.skin;
          c.fillRect(jx - 20, jy - 22, 6, 16);   // left arm dramatic outreach
          c.fillRect(jx + 14, jy - 30, 6, 18);   // right arm raised
          // Timing ring system
          var cx = W / 2, cy = H * 0.34;
          // Outer limit marker
          c.strokeStyle = C.grey; c.lineWidth = 1.5; c.globalAlpha = 0.25;
          c.beginPath(); c.arc(cx, cy, 108, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
          // Good zone ring
          c.strokeStyle = C.roseL; c.lineWidth = 2.5; c.globalAlpha = 0.45;
          c.beginPath(); c.arc(cx, cy, this.GOOD_MAX, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
          // Perfect zone ring
          c.strokeStyle = C.gold; c.lineWidth = 3; c.globalAlpha = 0.35;
          c.beginPath(); c.arc(cx, cy, this.GOOD_MIN, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
          // The shrinking ring
          if (this.phase !== 'pause') {
            var ringCol = this.ringR <= this.GOOD_MIN ? C.gold : this.ringR <= this.GOOD_MAX ? C.roseL : C.cream;
            c.strokeStyle = ringCol; c.lineWidth = 3; c.globalAlpha = this.phase === 'result' ? 0.4 : 1.0;
            c.beginPath(); c.arc(cx, cy, Math.max(4, this.ringR), 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
          }
          // Centre mark
          g.circle(cx, cy, 6, C.gold); g.circle(cx, cy, 3, C.goldLL);
          // Hit quality
          if (this.phase === 'result' && this.quality) {
            var qc = this.quality === 'PERFECT!' ? C.goldLL : this.quality === 'BRAVO!' ? C.roseLL : C.grey;
            api.txtCFit(this.quality, W / 2, cy - 28, 11, qc, true, W - 40);
          }
          // HUD: misses left as "lives", beat progress, nothing right
          var mis = '♥'.repeat(this.maxMisses - this.misses) + '♡'.repeat(this.misses);
          api.topBar(this.maxMisses - this.misses, 'BEAT ' + (this.beat + 1) + '/' + this.beats, mis);
        },
      },

      /* ==================================================================
       * CHAPTER 3 — OVER THE ICE
       * Dodge left/right for 22 seconds as cracks widen across the pond.
       * ================================================================== */
      {
        id: 'ice',
        name: 'OVER THE ICE',
        sub: 'AMY FALLS THROUGH',
        icon: function (api, x, y) { ICONS[2](api, x, y); },
        intro: [
          'AMY FOLLOWED JO',
          'TO THE FROZEN POND',
          'AGAINST ALL WARNINGS.',
          'The ice cracked beneath her.',
          'Skate left and right',
          'and reach the far bank!',
        ],
        quote: '"The ice was thin, and the skaters\' blades cut it with a dreadful sound." — Louisa May Alcott',
        help: 'MOVE left/right to dodge the ice cracks! Survive to reach the far bank.',
        winText: 'Amy reaches the far bank. Laurie pulls her to safety in the nick of time.',
        loseText: 'The ice gives way three times. A very wet and frightened Amy.',
        init: function (api) {
          this.px      = api.W / 2;
          this.py      = api.H - 80;
          this.lives   = 3;
          this.timer   = 0;
          this.tlimit  = 22;
          this.cracks  = [];
          this.shards  = [];
          this.spawnT  = 0;
          this.hurtT   = 0;
          this.done    = false;
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W, H = api.H;
          this.timer += dt;
          this.hurtT = Math.max(0, this.hurtT - dt);
          var prog = this.timer / this.tlimit;
          // Player
          if (api.keyDown('left'))  this.px -= 165 * dt;
          if (api.keyDown('right')) this.px += 165 * dt;
          if (api.pointer.down) this.px += (api.pointer.x - this.px) * 11 * dt;
          this.px = clamp(this.px, 16, W - 16);
          // Crack spawn
          this.spawnT += dt;
          var spRate = Math.max(0.48, 1.2 - prog * 0.55);
          var speed  = 62 + prog * 88;
          if (this.spawnT >= spRate) {
            this.spawnT = 0;
            var cw = 22 + Math.random() * 58 + prog * 38;
            var cx = cw / 2 + 4 + Math.random() * (W - cw - 8);
            this.cracks.push({ x: cx, y: -12, w: cw, vy: speed });
          }
          // Update cracks
          for (var i = this.cracks.length - 1; i >= 0; i--) {
            var cr = this.cracks[i];
            cr.y += cr.vy * dt;
            if (cr.y > H + 20) { this.cracks.splice(i, 1); continue; }
            // Collision
            if (this.hurtT <= 0) {
              var px = this.px, py = this.py;
              if (px > cr.x - cr.w / 2 - 14 && px < cr.x + cr.w / 2 + 14 &&
                  py > cr.y - 12 && py < cr.y + 12) {
                this.lives--;
                this.hurtT = 1.3;
                api.shake(8, 0.4); api.flash(C.ice, 0.35); api.audio.sfx('hurt');
                for (var sh = 0; sh < 8; sh++) {
                  this.shards.push({ x: px, y: py, vx: (Math.random() - 0.5) * 90, vy: -65 - Math.random() * 45, life: 1.1 });
                }
                if (this.lives <= 0) { this.done = true; api.lose(); return; }
              }
            }
          }
          // Ice shards
          for (var s = this.shards.length - 1; s >= 0; s--) {
            var sh2 = this.shards[s];
            sh2.x += sh2.vx * dt; sh2.y += sh2.vy * dt; sh2.vy += 130 * dt; sh2.life -= dt;
            if (sh2.life <= 0) this.shards.splice(s, 1);
          }
          if (this.timer >= this.tlimit) { this.done = true; api.win(); }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var prog = this.timer / this.tlimit;
          // Ice surface
          c.fillStyle = C.iceD; c.fillRect(0, 0, W, H);
          for (var i2 = 0; i2 < 7; i2++) {
            c.fillStyle = C.ice; c.globalAlpha = 0.14 + (i2 % 3) * 0.04;
            c.fillRect(0, i2 * 68, W, 22); c.globalAlpha = 1;
          }
          // Static crack texture (decorative)
          c.strokeStyle = C.crackD; c.lineWidth = 1; c.globalAlpha = 0.4;
          for (var t2 = 0; t2 < 9; t2++) {
            var tx = (t2 * 41 + 7) % W, ty = (t2 * 53 + 11) % H;
            c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + 18, ty + 10); c.stroke();
          }
          c.globalAlpha = 1;
          // Far bank (top)
          c.fillStyle = C.snowL; c.fillRect(0, 0, W, 18);
          c.fillStyle = C.snow; c.fillRect(0, 14, W, 8);
          // Near bank (bottom)
          c.fillStyle = C.snowL; c.fillRect(0, H - 18, W, 18);
          c.fillStyle = C.snow; c.fillRect(0, H - 22, W, 6);
          // Cracks
          for (var i = 0; i < this.cracks.length; i++) {
            var cr2 = this.cracks[i];
            c.fillStyle = '#0a1420'; c.globalAlpha = 0.88;
            c.beginPath();
            c.moveTo(cr2.x - cr2.w / 2, cr2.y - 5);
            c.lineTo(cr2.x - cr2.w * 0.25, cr2.y + 2);
            c.lineTo(cr2.x, cr2.y - 3);
            c.lineTo(cr2.x + cr2.w * 0.25, cr2.y + 3);
            c.lineTo(cr2.x + cr2.w / 2, cr2.y - 5);
            c.lineTo(cr2.x + cr2.w / 2, cr2.y + 9);
            c.lineTo(cr2.x - cr2.w / 2, cr2.y + 9);
            c.closePath(); c.fill(); c.globalAlpha = 1;
          }
          // Ice shards
          for (var s2 = 0; s2 < this.shards.length; s2++) {
            var sh3 = this.shards[s2];
            c.globalAlpha = sh3.life / 1.1;
            g.rect(sh3.x - 3, sh3.y - 3, 6, 6, C.ice); c.globalAlpha = 1;
          }
          // Amy (player) — pink coat on ice
          var px2 = this.px, py2 = this.py;
          var hide2 = this.hurtT > 0 && Math.floor(this.hurtT * 8) % 2 === 0;
          if (!hide2) {
            c.strokeStyle = C.grey; c.lineWidth = 2;
            c.beginPath(); c.moveTo(px2 - 12, py2 + 10); c.lineTo(px2 + 12, py2 + 10); c.stroke();
            g.rect(px2 - 8, py2, 16, 10, C.cream);
            c.fillStyle = C.roseL; c.fillRect(px2 - 10, py2 - 18, 20, 18);
            g.circle(px2, py2 - 22, 9, C.skin);
            g.circle(px2, py2 - 28, 8, C.goldL);     // Amy's golden curls
            g.rect(px2 - 14, py2 - 12, 10, 8, C.snow); // muff
          }
          // Survive progress bar
          var remain = 1 - prog;
          g.rect(0, H - 4, W * remain, 4, C.ice);
          g.rect(0, H - 4, W * remain * 0.6, 4, C.snowL);
          api.topBar(this.lives, Math.max(0, this.tlimit - this.timer).toFixed(1) + 's', 'REACH THE FAR BANK');
        },
      },

      /* ==================================================================
       * CHAPTER 4 — BETH'S FEVER
       * Whack-a-mole: tap glowing vials before they fade. Collect 15 in ~28s.
       * ================================================================== */
      {
        id: 'fever',
        name: "BETH'S FEVER",
        sub: 'NIGHT NURSE',
        icon: function (api, x, y) { ICONS[3](api, x, y); },
        intro: [
          "BETH CAUGHT SCARLET FEVER",
          "NURSING THE HUMMEL CHILDREN.",
          'All through the long nights',
          'Jo sits by her sister,',
          'bringing medicine',
          'and praying for dawn.',
        ],
        quote: '"Don\'t be troubled, Jo. I don\'t think I shall be very ill long." — Beth March',
        help: 'TAP each glowing MEDICINE VIAL before it fades. Collect 15 to help Beth!',
        winText: "Beth's fever breaks at dawn. She opens her eyes and smiles.",
        loseText: 'Three vials lost — the fever climbs again. Hold on, Jo.',
        init: function (api) {
          this.vials   = [];
          this.caught  = 0;
          this.need    = 15;
          this.misses  = 0;
          this.maxMiss = 3;
          this.timer   = 0;
          this.tlimit  = 30;
          this.spawnT  = 0;
          this.shadowT = 0;
          this.maxV    = 4;
          this.burst   = [];
          this.done    = false;
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W, H = api.H;
          this.timer += dt;
          var prog = this.timer / this.tlimit;
          // Burst particles
          for (var s = this.burst.length - 1; s >= 0; s--) {
            var sb = this.burst[s];
            sb.x += sb.vx * dt; sb.y += sb.vy * dt; sb.life -= dt;
            if (sb.life <= 0) this.burst.splice(s, 1);
          }
          // Spawn vials
          this.spawnT += dt;
          var spR = Math.max(0.7, 1.3 - prog * 0.35);
          if (this.spawnT >= spR && this.vials.length < this.maxV) {
            this.spawnT = 0;
            var vlife = Math.max(1.1, 1.85 - prog * 0.45);
            var tries = 0, ok = false, vx, vy;
            while (tries < 20 && !ok) {
              vx = 30 + Math.random() * (W - 60);
              vy = 80 + Math.random() * (H - 180);
              ok = true;
              for (var v = 0; v < this.vials.length; v++) {
                if (Math.abs(this.vials[v].x - vx) < 44 && Math.abs(this.vials[v].y - vy) < 44) { ok = false; break; }
              }
              tries++;
            }
            if (ok) this.vials.push({ x: vx, y: vy, life: vlife, max: vlife, pulse: Math.random() * 6 });
          }
          // Update vials
          for (var i = this.vials.length - 1; i >= 0; i--) {
            var vi = this.vials[i];
            vi.life -= dt; vi.pulse += dt * 5;
            if (vi.life <= 0) {
              this.vials.splice(i, 1);
              this.misses++;
              api.shake(4, 0.2); api.audio.sfx('hurt');
              if (this.misses >= this.maxMiss) { this.done = true; api.lose(); return; }
            }
          }
          // Tap
          if (api.pointer.justDown) {
            var tx = api.pointer.x, ty = api.pointer.y;
            for (var i2 = this.vials.length - 1; i2 >= 0; i2--) {
              var vi2 = this.vials[i2];
              var dx = tx - vi2.x, dy = ty - vi2.y;
              if (dx * dx + dy * dy < 26 * 26) {
                this.vials.splice(i2, 1);
                this.caught++;
                api.addScore(15); api.audio.sfx('coin');
                api.burst(tx, ty, C.vialL, 6);
                for (var sb2 = 0; sb2 < 6; sb2++) {
                  this.burst.push({ x: tx, y: ty, vx: (Math.random() - 0.5) * 90, vy: -55 - Math.random() * 55, life: 0.9 });
                }
                if (this.caught >= this.need) { this.done = true; api.win(); return; }
                break;
              }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dark sickroom
          c.fillStyle = '#0c0804'; c.fillRect(0, 0, W, H);
          // Bed lower half
          g.rect(8,  H * 0.58, W - 16, H * 0.42, C.mahog);
          g.rect(12, H * 0.62, W - 24, H * 0.38 - 4, C.snow);
          g.rect(W / 2 - 38, H * 0.60, 76, 18, C.snowL);
          g.rect(W / 2 - 36, H * 0.604, 72, 8, C.cream);
          // Beth's face
          g.circle(W / 2 - 4, H * 0.615, 10, C.skin);
          g.circle(W / 2 - 6, H * 0.611, 10, C.skinD);
          g.circle(W / 2 - 4, H * 0.616, 8, C.skin);
          c.strokeStyle = '#2a1808'; c.lineWidth = 1.5;
          c.beginPath(); c.arc(W / 2 - 10, H * 0.615 + 2, 3, 0, Math.PI); c.stroke();
          c.beginPath(); c.arc(W / 2,      H * 0.615 + 2, 3, 0, Math.PI); c.stroke();
          // Warm rosy cheeks
          c.fillStyle = C.rose; c.globalAlpha = 0.25;
          c.beginPath(); c.arc(W / 2 - 14, H * 0.617, 5, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(W / 2 + 6,  H * 0.617, 5, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          // Candle nightstand
          var ndx = W - 38, ndy = H * 0.58 - 18;
          g.rect(ndx - 18, ndy, 36, 18, C.mahogL);
          g.rect(ndx - 4,  ndy - 18, 8, 18, C.cream);
          g.circle(ndx, ndy - 20, 5, C.fireLL);
          c.globalAlpha = 0.13 + 0.09 * Math.sin(this.timer * 3.5);
          g.circle(ndx, ndy - 20, 22, C.goldL); c.globalAlpha = 1;
          // Jo seated at bedside (left)
          var jox2 = 30, joy2 = H * 0.58 - 8;
          c.fillStyle = C.mahog; c.fillRect(jox2 - 10, joy2 - 22, 20, 22);
          g.circle(jox2, joy2 - 26, 9, C.skin);
          g.circle(jox2, joy2 - 32, 8, C.dark);
          // Burst particles
          for (var s2 = 0; s2 < this.burst.length; s2++) {
            var sb3 = this.burst[s2];
            c.globalAlpha = sb3.life / 0.9;
            g.circle(sb3.x, sb3.y, 3, C.vialL); c.globalAlpha = 1;
          }
          // Draw vials
          for (var i3 = 0; i3 < this.vials.length; i3++) {
            var vi3 = this.vials[i3];
            var fade = vi3.life / vi3.max;
            var pulse = 0.9 + 0.1 * Math.sin(vi3.pulse);
            // Glow halo
            c.globalAlpha = fade * 0.22; g.circle(vi3.x, vi3.y, 24 * pulse, C.vialL); c.globalAlpha = 1;
            // Vial body
            c.globalAlpha = 0.7 + 0.3 * fade;
            g.rect(vi3.x - 6, vi3.y - 14, 12, 20, C.vial);
            g.rect(vi3.x - 4, vi3.y - 14, 8,  6,  C.vialL);
            g.circle(vi3.x, vi3.y - 14, 4, C.creamD);
            c.fillStyle = C.rose; c.globalAlpha = 0.55 * fade;
            c.fillRect(vi3.x - 5, vi3.y - 6, 10, 10 * fade);
            c.globalAlpha = 1;
            // Arc timer
            c.strokeStyle = C.vialL; c.lineWidth = 2; c.globalAlpha = fade * 0.85;
            c.beginPath(); c.arc(vi3.x, vi3.y, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fade); c.stroke();
            c.globalAlpha = 1;
          }
          api.topBar(this.maxMiss - this.misses, this.caught + '/' + this.need + ' VIALS', Math.max(0, this.tlimit - this.timer).toFixed(0) + 's');
        },
      },

      /* ==================================================================
       * CHAPTER 5 — THE RETURN
       * Float-collect: catch 15 joy tokens, dodge shadow clouds.
       * ================================================================== */
      {
        id: 'return',
        name: 'THE RETURN',
        sub: 'FATHER COMES HOME',
        icon: function (api, x, y) { ICONS[4](api, x, y); },
        intro: [
          'THE WAR IS OVER.',
          'FATHER IS COMING HOME.',
          'The March family waits',
          'at the garden gate.',
          'Catch the golden memories',
          'before the shadows steal them.',
        ],
        quote: '"There never was such a Christmas dinner as they had that day." — Louisa May Alcott',
        help: 'MOVE freely to catch golden MEMORIES. Dodge the grey SHADOWS of worry!',
        winText: 'Father walks through the gate. The family is whole and happy once more.',
        loseText: 'The shadows dim the joy. Hold on — try again.',
        init: function (api) {
          this.px      = api.W / 2;
          this.py      = api.H / 2;
          this.lives   = 3;
          this.caught  = 0;
          this.need    = 15;
          this.timer   = 0;
          this.tokens  = [];
          this.shadows = [];
          this.tokenT  = 0;
          this.shadowT = 0;
          this.hurtT   = 0;
          this.done    = false;
        },
        update: function (api, dt) {
          if (this.done) return;
          var W = api.W, H = api.H;
          this.timer += dt;
          this.hurtT = Math.max(0, this.hurtT - dt);
          var prog = Math.min(1, this.timer / 22);
          // Player follows pointer
          if (api.pointer.down) {
            this.px += (api.pointer.x - this.px) * 9 * dt;
            this.py += (api.pointer.y - this.py) * 9 * dt;
          }
          if (api.keyDown('left'))  this.px -= 155 * dt;
          if (api.keyDown('right')) this.px += 155 * dt;
          if (api.keyDown('up'))    this.py -= 155 * dt;
          if (api.keyDown('down'))  this.py += 155 * dt;
          this.px = clamp(this.px, 14, W - 14);
          this.py = clamp(this.py, 30, H - 30);
          // Spawn joy tokens
          this.tokenT += dt;
          if (this.tokenT > Math.max(0.9, 1.4 - prog * 0.3) && this.tokens.length < 5) {
            this.tokenT = 0;
            this.tokens.push({
              x: 22 + Math.random() * (W - 44), y: 44 + Math.random() * (H - 90),
              vx: (Math.random() - 0.5) * 44, vy: (Math.random() - 0.5) * 44,
              life: 7 + Math.random() * 5, pulse: Math.random() * 6,
            });
          }
          // Spawn shadow clouds
          this.shadowT += dt;
          var maxSh = 2 + Math.floor(prog * 4);
          if (this.shadowT > 2.2 && this.shadows.length < maxSh) {
            this.shadowT = 0;
            var edge = Math.floor(Math.random() * 4);
            var sx, sy, svx, svy;
            if (edge === 0) { sx = -20; sy = Math.random() * H; svx = 28 + Math.random() * 22; svy = (Math.random() - 0.5) * 22; }
            else if (edge === 1) { sx = W + 20; sy = Math.random() * H; svx = -(28 + Math.random() * 22); svy = (Math.random() - 0.5) * 22; }
            else if (edge === 2) { sx = Math.random() * W; sy = -20; svx = (Math.random() - 0.5) * 22; svy = 28 + Math.random() * 22; }
            else { sx = Math.random() * W; sy = H + 20; svx = (Math.random() - 0.5) * 22; svy = -(28 + Math.random() * 22); }
            this.shadows.push({ x: sx, y: sy, vx: svx, vy: svy, r: 17 + Math.random() * 11 });
          }
          // Update tokens
          for (var t = this.tokens.length - 1; t >= 0; t--) {
            var tok = this.tokens[t];
            tok.x += tok.vx * dt; tok.y += tok.vy * dt;
            tok.pulse += 2.5 * dt; tok.life -= dt;
            if (tok.x < 10 || tok.x > W - 10) tok.vx *= -1;
            if (tok.y < 30 || tok.y > H - 30) tok.vy *= -1;
            tok.x = clamp(tok.x, 10, W - 10); tok.y = clamp(tok.y, 30, H - 30);
            if (tok.life <= 0) { this.tokens.splice(t, 1); continue; }
            var dx = tok.x - this.px, dy = tok.y - this.py;
            if (dx * dx + dy * dy < 22 * 22) {
              this.tokens.splice(t, 1);
              this.caught++;
              api.addScore(15); api.audio.sfx('coin');
              api.burst(tok.x, tok.y, C.joy, 8);
              if (this.caught >= this.need) { this.done = true; api.win(); return; }
            }
          }
          // Update shadows
          for (var s = this.shadows.length - 1; s >= 0; s--) {
            var sh = this.shadows[s];
            sh.x += sh.vx * dt; sh.y += sh.vy * dt;
            if (sh.x < -60 || sh.x > W + 60 || sh.y < -60 || sh.y > H + 60) {
              this.shadows.splice(s, 1); continue;
            }
            if (this.hurtT <= 0) {
              var dx2 = sh.x - this.px, dy2 = sh.y - this.py;
              if (dx2 * dx2 + dy2 * dy2 < (sh.r + 13) * (sh.r + 13)) {
                this.lives--;
                this.hurtT = 1.3;
                api.shake(6, 0.3); api.flash(C.shadow, 0.3); api.audio.sfx('hurt');
                if (this.lives <= 0) { this.done = true; api.lose(); return; }
              }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Warm sunset homecoming sky
          var sky2 = c.createLinearGradient(0, 0, 0, H);
          sky2.addColorStop(0, '#c04820'); sky2.addColorStop(0.45, '#e06828'); sky2.addColorStop(1, '#ffa040');
          c.fillStyle = sky2; c.fillRect(0, 0, W, H);
          // March house silhouette
          c.fillStyle = '#2a1808';
          c.fillRect(W / 2 - 46, H * 0.34, 92, 68);
          c.beginPath(); c.moveTo(W / 2 - 50, H * 0.34); c.lineTo(W / 2, H * 0.19); c.lineTo(W / 2 + 50, H * 0.34); c.closePath(); c.fill();
          // Warm glowing windows
          for (var wi = 0; wi < 3; wi++) {
            c.fillStyle = C.fireLL; c.globalAlpha = 0.58;
            c.fillRect(W / 2 - 38 + wi * 30, H * 0.39, 14, 12);
            c.globalAlpha = 1;
          }
          // Chimney smoke
          for (var sm = 0; sm < 4; sm++) {
            c.globalAlpha = 0.15 + sm * 0.04;
            g.circle(W / 2 + 22, H * 0.19 - sm * 12 - 6, 8 + sm * 3, C.greyL);
            c.globalAlpha = 1;
          }
          // Garden gate and path
          c.fillStyle = '#c8a060'; c.fillRect(W / 2 - 22, H * 0.54, 44, H * 0.46);
          g.rect(W / 2 - 26, H * 0.52, 6, 32, C.mahogL);
          g.rect(W / 2 + 20, H * 0.52, 6, 32, C.mahogL);
          g.rect(W / 2 - 22, H * 0.52, 44, 4, C.mahogL);
          // Snow
          c.fillStyle = C.snowL; c.fillRect(0, H - 24, W, 24);
          c.fillStyle = C.snow;  c.fillRect(0, H - 28, W,  6);
          // Shadows
          for (var s2 = 0; s2 < this.shadows.length; s2++) {
            var sh2 = this.shadows[s2];
            c.globalAlpha = 0.52; c.fillStyle = C.shadow;
            c.beginPath(); c.arc(sh2.x, sh2.y, sh2.r, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
          }
          // Joy tokens
          for (var t2 = 0; t2 < this.tokens.length; t2++) {
            var tok2 = this.tokens[t2];
            var fade2 = Math.min(1, tok2.life / 2.5);
            var pulse2 = 0.9 + 0.1 * Math.sin(tok2.pulse);
            c.globalAlpha = fade2;
            c.fillStyle = C.joy;
            c.beginPath(); c.arc(tok2.x, tok2.y, 11 * pulse2, 0, Math.PI * 2); c.fill();
            c.fillStyle = C.joyL;
            c.beginPath(); c.arc(tok2.x, tok2.y, 7 * pulse2, 0, Math.PI * 2); c.fill();
            c.globalAlpha = fade2 * 0.28;
            c.beginPath(); c.arc(tok2.x, tok2.y, 20 * pulse2, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          }
          // Player (Marmee at the gate)
          var px3 = this.px, py3 = this.py;
          var hide3 = this.hurtT > 0 && Math.floor(this.hurtT * 8) % 2 === 0;
          if (!hide3) {
            c.fillStyle = C.mahogL; c.fillRect(px3 - 12, py3 - 18, 24, 22);
            g.circle(px3, py3 - 22, 10, C.skin);
            g.circle(px3, py3 - 30,  9, C.dark);
            c.fillStyle = C.rose; c.fillRect(px3 - 13, py3 - 34, 26, 8);
            g.circle(px3, py3 - 34, 6, C.roseD);    // bonnet
          }
          api.topBar(this.lives, this.caught + '/' + this.need + ' MEMORIES', '');
        },
      },
    ],
  });

})();
