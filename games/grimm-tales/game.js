/* ============================================================================
 * GRIMM'S PATH — Five Dark Tales from the Brothers Grimm
 *   1. THROUGH THE WOOD    — steer Red past the wolf's charging runs (22s, 3 lives)
 *   2. LET DOWN YOUR HAIR  — pendulum timing to climb Rapunzel's tower (8 levels, 3 misses)
 *   3. THE WITCH'S OVEN    — whack the witch before she catches Hansel (12 hits, 3 misses)
 *   4. STRAW INTO GOLD     — catch spinning wheel's golden coins (12 coins, 3 straw hits)
 *   5. TRUE LOVE'S KISS    — precision ring to wake Sleeping Beauty (5 kisses, 3 misses)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;
  var rand  = Retro.util.rand;
  var randI = Retro.util.randInt;

  /* ─── Enchanted Forest Palette ─── */
  var C = {
    void_:   '#020402',
    forest:  '#080c08',
    nightWd: '#0e180c',
    dkwood:  '#182414',
    wood:    '#263a1c',
    moss:    '#3a5028',
    bark:    '#5a3c18',
    brown:   '#7a5a2a',
    leaf:    '#487030',
    leafL:   '#6a9c40',
    moon:    '#e4f0dc',
    silver:  '#9ab48c',
    grey:    '#6a7860',
    stone:   '#485040',
    // Red
    red:     '#cc1a2a',
    redL:    '#e83040',
    cloak:   '#cc2030',
    // Gold / fairytale warmth
    gold:    '#d4a020',
    goldL:   '#e8c040',
    amber:   '#f0cc58',
    straw:   '#d0b060',
    // Witch purple
    witch:   '#6a1888',
    magic:   '#9a38c8',
    enchant: '#c060e8',
    // Story cream / parchment
    parch:   '#d8c8a0',
    cream:   '#e8dcc0',
    white:   '#f4f0e4',
    // Danger
    blood:   '#aa1020',
    // Candy / gingerbread
    candy:   '#e8604a',
    ginger:  '#d08030',
  };

  /* ─── Emblem: moonlit forest with a glowing path ─── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    var t = Date.now() * 0.001;
    // Moon glow
    c.globalAlpha = 0.12;
    c.fillStyle = C.moon;
    c.beginPath(); c.arc(cx, cy - 28, 40, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.55;
    c.fillStyle = C.moon;
    c.beginPath(); c.arc(cx, cy - 28, 22, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    // Tree silhouettes
    var trees = [-34, -18, 20, 38];
    for (var i = 0; i < trees.length; i++) {
      var tx = cx + trees[i], th = 54 + (i * 11) % 20;
      c.fillStyle = C.nightWd;
      c.fillRect(tx - 4, cy + 16, 8, th - 24);
      c.beginPath(); c.arc(tx, cy + 4, 12 + (i * 3) % 8, 0, Math.PI * 2);
      c.fillStyle = C.dkwood; c.fill();
    }
    // Golden path (winding)
    c.strokeStyle = C.gold;
    c.globalAlpha = 0.7 + 0.2 * Math.sin(t * 1.8);
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(cx, cy + 50);
    c.bezierCurveTo(cx - 16, cy + 30, cx + 12, cy + 14, cx, cy + 2);
    c.stroke();
    c.globalAlpha = 1;
    // Floating fireflies
    for (var j = 0; j < 6; j++) {
      var fx = cx + Math.sin(t * 1.1 + j * 1.4) * 22 + (j - 3) * 8;
      var fy = cy - 10 + Math.cos(t * 0.9 + j * 2.1) * 18;
      c.globalAlpha = 0.4 + 0.4 * Math.abs(Math.sin(t * 2 + j));
      c.fillStyle = C.amber;
      c.beginPath(); c.arc(fx, fy, 2, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }

  /* ─── Scenery ─── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'boot' || scene === 'menu') {
      // Deep forest night
      var sky = c.createLinearGradient(0, 0, 0, H * 0.45);
      sky.addColorStop(0, C.forest);
      sky.addColorStop(1, C.nightWd);
      c.fillStyle = sky; c.fillRect(0, 0, W, H);
      // Moon (upper right)
      c.globalAlpha = 0.10;
      c.fillStyle = C.moon;
      c.beginPath(); c.arc(W * 0.78, 40, 50, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 0.55;
      c.fillStyle = C.moon;
      c.beginPath(); c.arc(W * 0.78, 40, 28, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      // Ground
      c.fillStyle = C.dkwood; c.fillRect(0, H * 0.58, W, H * 0.42);
      // Forest silhouette
      c.fillStyle = C.nightWd;
      var tpos = [0, 22, 48, 76, 108, 136, 162, 194, 220, 248, 268];
      for (var i = 0; i < tpos.length; i++) {
        var tx = tpos[i], th = 100 + (i * 23) % 80;
        c.fillRect(tx, H * 0.58 - th, 14, th);
        c.beginPath(); c.arc(tx + 7, H * 0.58 - th, 22 + (i * 7) % 16, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(tx + 7, H * 0.58 - th - 14, 16, 0, Math.PI * 2); c.fill();
      }
      // Golden path winding through forest floor
      c.strokeStyle = C.gold;
      c.globalAlpha = 0.55;
      c.lineWidth = 4;
      c.setLineDash([6, 7]);
      c.beginPath();
      c.moveTo(W * 0.48, H);
      c.bezierCurveTo(W * 0.52, H * 0.8, W * 0.38, H * 0.72, W * 0.48, H * 0.6);
      c.stroke();
      c.setLineDash([]);
      c.globalAlpha = 1;
      // Fireflies
      for (var j = 0; j < 10; j++) {
        var fx = (j * 29 + 18) % W;
        var fy = H * 0.3 + (j * 43) % (H * 0.35);
        var fa = 0.25 + 0.5 * Math.abs(Math.sin(t * 1.6 + j * 2.3));
        c.globalAlpha = fa;
        c.fillStyle = C.amber;
        c.beginPath(); c.arc(fx, fy, 2.5, 0, Math.PI * 2); c.fill();
      }
      c.globalAlpha = 1;
      return;
    }

    // Default: moonlit forest glade for intros/results/finale
    c.fillStyle = C.forest; c.fillRect(0, 0, W, H);
    c.globalAlpha = 0.08;
    c.fillStyle = C.moon;
    c.beginPath(); c.arc(W / 2, 30, 60, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.4;
    c.fillStyle = C.moon;
    c.beginPath(); c.arc(W / 2, 30, 22, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    // Ground and trees
    c.fillStyle = C.dkwood; c.fillRect(0, H * 0.65, W, H * 0.35);
    c.fillStyle = C.nightWd;
    for (var ti = 0; ti < 8; ti++) {
      var ttx = (ti * 38 + 6) % W, tth = 90 + (ti * 19) % 60;
      c.fillRect(ttx, H * 0.65 - tth, 12, tth);
      c.beginPath(); c.arc(ttx + 6, H * 0.65 - tth, 18 + (ti * 6) % 12, 0, Math.PI * 2); c.fill();
    }
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(4,6,4,.82)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Chapter-select card layout: 5 storybook signposts in enchanted clearing ─── */
  var CARD_LAYOUT = [
    { x: 12,  y: 82,  w: 112, h: 58 }, // Ch1: Through the Wood    (top-left)
    { x: 147, y: 98,  w: 111, h: 58 }, // Ch2: Let Down Your Hair  (top-right)
    { x: 72,  y: 196, w: 126, h: 58 }, // Ch3: The Witch's Oven    (center)
    { x: 10,  y: 316, w: 112, h: 58 }, // Ch4: Straw into Gold     (bottom-left)
    { x: 147, y: 328, w: 112, h: 58 }, // Ch5: True Love's Kiss    (bottom-right)
  ];

  RetroSaga.create({
    id:       'grimm',
    title:    "Grimm's Path",
    subtitle: 'FIVE DARK FAIRY TALES',
    currency: 'TOKENS',
    accent:   C.gold,
    credit:   'AFTER JACOB & WILHELM GRIMM · 1812',
    emblem:   emblem,
    scenery:  scenery,
    bootCta:  'TAP TO ENTER THE FOREST',
    menuLabel: "GRIMM'S PATH",
    menuHint: 'CHOOSE YOUR TALE',
    menuDone: 'ALL TALES ARE TOLD.',
    finale: [
      'THE TALES ARE ENDED.',
      '',
      'FIVE PATHS THROUGH',
      'THE DARK FOREST —',
      'five heroes who faced',
      'their fears and won.',
      '',
      '"Fairy tales are more',
      ' than true: not because',
      ' they tell us dragons',
      ' exist, but because',
      ' they tell us dragons',
      ' can be beaten."',
    ],

    screens: {
      win:          C.moon,
      lose:         C.red,
      chapterLabel: C.silver,
      name:         C.moon,
      sub:          C.silver,
      intro:        C.cream,
      quote:        C.grey,
      help:         C.silver,
      score:        C.moon,
      cur:          C.gold,
      cta:          C.moon,
      overlay:      'rgba(4,6,4,.90)',
    },
    labels: {
      chapter: 'TALE',
      score:   'TOKENS WON',
      win:     'THE TALE IS TOLD.',
      lose:    'THE FOREST CLAIMS YOU.',
      cont:    'TAP TO CONTINUE',
      finale:  'TAP FOR THE ENDING',
      toMenu:  'RETURN TO THE CLEARING',
      play:    'TAP TO BEGIN',
    },

    menu: {
      title: function (api, currency) {
        var c = api.ctx, W = api.W;
        // Dark forest top band
        c.fillStyle = C.forest; c.fillRect(0, 0, W, 76);
        // Subtle canopy texture
        c.fillStyle = C.nightWd;
        for (var i = 0; i < 7; i++) {
          c.beginPath(); c.arc(14 + i * 38, 18, 18 + (i * 5) % 10, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(14 + i * 38, 8, 12, 0, Math.PI * 2); c.fill();
        }
        // Moonlit scroll title
        c.fillStyle = C.dkwood; c.fillRect(12, 20, W - 24, 34);
        c.strokeStyle = C.gold; c.lineWidth = 1.5; c.strokeRect(12, 20, W - 24, 34);
        c.strokeStyle = C.bark; c.lineWidth = 1; c.strokeRect(14, 22, W - 28, 30);
        api.txtCFit("GRIMM'S PATH", W / 2, 27, 10, C.gold, true, W - 40);
        api.txtCFit(currency + ' EARNED', W / 2, 43, 7, C.amber, true, W - 60);

        // Path lines connecting cards (winding dotted trails)
        c.strokeStyle = C.bark; c.lineWidth = 1.5;
        c.setLineDash([3, 4]);
        // Ch1 bottom → Ch3 top
        c.beginPath(); c.moveTo(68, 140); c.lineTo(110, 196); c.stroke();
        // Ch2 bottom → Ch3 top
        c.beginPath(); c.moveTo(202, 156); c.lineTo(160, 196); c.stroke();
        // Ch3 bottom-left → Ch4 top
        c.beginPath(); c.moveTo(100, 254); c.lineTo(66, 316); c.stroke();
        // Ch3 bottom-right → Ch5 top
        c.beginPath(); c.moveTo(170, 254); c.lineTo(204, 328); c.stroke();
        c.setLineDash([]);

        // Firefly sparkles near intersections
        c.fillStyle = C.amber;
        var sparks = [[90, 170], [180, 178], [128, 282], [165, 288]];
        var now2 = Date.now() * 0.001;
        for (var k = 0; k < sparks.length; k++) {
          var sa = 0.3 + 0.5 * Math.abs(Math.sin(now2 * 2.1 + k * 1.7));
          c.globalAlpha = sa;
          c.beginPath(); c.arc(sparks[k][0], sparks[k][1], 2.5, 0, Math.PI * 2); c.fill();
        }
        c.globalAlpha = 1;
      },
      layout: function () { return CARD_LAYOUT; },
      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done;
        var cx = x + w / 2, cy = y + h / 2;

        // Wooden signpost card
        var bg = sel ? C.bark : (done ? '#2a1c0a' : C.dkwood);
        c.fillStyle = bg; c.fillRect(x, y, w, h);
        // Wood grain lines
        c.strokeStyle = sel ? C.brown : (done ? '#3a2810' : C.wood);
        c.lineWidth = 1;
        for (var row = 1; row < 5; row++) {
          c.beginPath();
          c.moveTo(x + 2, y + row * (h / 5));
          c.lineTo(x + w - 2, y + row * (h / 5));
          c.stroke();
        }
        // Border (wooden frame)
        c.strokeStyle = sel ? C.gold : (done ? C.gold : C.bark);
        c.lineWidth = sel ? 2 : 1.5;
        c.strokeRect(x + 1, y + 1, w - 2, h - 2);
        // Nail dots at corners
        var nailC = sel ? C.amber : (done ? C.gold : C.brown);
        g.circle(x + 6,  y + 6,  3, nailC);
        g.circle(x + w - 6, y + 6,  3, nailC);
        g.circle(x + 6,  y + h - 6, 3, nailC);
        g.circle(x + w - 6, y + h - 6, 3, nailC);

        // Chapter icon (top-left area)
        if (ch.icon) ch.icon(api, x + 18, cy - 2);

        // Chapter name
        api.txtCFit(ch.name, cx + 10, cy - 12, 7, sel ? C.amber : (done ? C.gold : C.silver), true, w - 46);
        api.txtCFit(ch.sub || '', cx + 10, cy + 4, 6, sel ? C.silver : (done ? C.bark : C.stone), true, w - 46);

        // Done stamp
        if (done) {
          c.globalAlpha = 0.88;
          c.fillStyle = C.gold;
          c.font = "bold 11px 'Press Start 2P'";
          c.textAlign = 'right'; c.textBaseline = 'top';
          c.fillText('★', x + w - 8, y + 8);
          c.textAlign = 'left';
          c.globalAlpha = 1;
        }
        // Selection arrow
        if (sel) {
          c.fillStyle = C.amber;
          c.beginPath();
          c.moveTo(x - 4, cy);
          c.lineTo(x - 13, cy - 5);
          c.lineTo(x - 13, cy + 5);
          c.closePath(); c.fill();
        }
      },
    },

    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ==============================================================
       * 1. THROUGH THE WOOD — dodge the wolf, 22 seconds, 3 lives
       * ============================================================== */
      {
        id: 'redhood',
        name: 'THROUGH THE WOOD',
        sub: 'LITTLE RED RIDING HOOD',
        icon: function (api, x, y) {
          var g = api.gfx;
          // Red cloak
          g.circle(x, y - 8, 8, C.cloak);
          g.rect(x - 7, y,  14, 10, C.cloak);
          // Hood
          c_icon_arc(api.ctx, x, y - 14, 7, C.red);
          // Basket
          g.rect(x + 6, y - 2, 8, 7, C.brown);
          g.rect(x + 5, y - 4, 10, 3, C.bark);
        },
        intro: [
          'RED SETS OUT THROUGH',
          'THE DARK FOREST.',
          'Mother warned her',
          'to keep to the path.',
          'But the wolf has',
          'already heard her...',
        ],
        quote: '"All the better to eat you with!" — The Big Bad Wolf, Little Red Riding Hood (1812)',
        help: 'DRAG left/right to dodge the wolf!',
        winText: "Red reached Grandmother's house safely. The wolf slunk away, hungry.",
        loseText: 'The wolf caught Red in the dark of the forest. How terrible!',
        init: function (api) {
          this.redX   = api.W / 2;
          this.lives  = 3;
          this.timer  = 0;
          this.dur    = 22;
          this.obs    = [];
          this.spawnT = 0;
          this.invT   = 0;
          this.treeY  = 0;
          this.trees  = [];
          for (var i = 0; i < 8; i++) {
            this.trees.push({ x: randI(0, 270), spd: 30 + randI(0, 20), ph: i * 1.3 });
          }
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer += dt;
          if (this.invT > 0) this.invT -= dt;
          if (this.timer >= this.dur) { api.score += 120; api.win(); return; }
          // Steer Red
          if (api.pointer.down) this.redX = clamp(api.pointer.x, 30, W - 30);
          if (api.keyDown('left'))  this.redX = clamp(this.redX - 190 * dt, 30, W - 30);
          if (api.keyDown('right')) this.redX = clamp(this.redX + 190 * dt, 30, W - 30);
          // Scroll background trees
          this.treeY = (this.treeY + 140 * dt) % 56;
          for (var k = 0; k < this.trees.length; k++) {
            this.trees[k].x = (this.trees[k].x + this.trees[k].spd * dt + 270) % 270;
          }
          // Spawn wolf obstacles (alternating sides)
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.75, 2.0 - this.timer * 0.05);
            var kind = Math.random() < 0.7 ? 'wolf' : 'log';
            this.obs.push({ x: 30 + randI(0, W - 60), y: -28, kind: kind });
          }
          var spd = 88 + this.timer * 4;
          for (var j = 0; j < this.obs.length; j++) this.obs[j].y += spd * dt;
          this.obs = this.obs.filter(function (o) { return o.y < H + 28; });
          // Collision
          if (this.invT <= 0) {
            var ry = H - 56;
            for (var m = 0; m < this.obs.length; m++) {
              var o = this.obs[m];
              if (Math.abs(o.x - this.redX) < 20 && Math.abs(o.y - ry) < 22) {
                this.lives--;
                this.invT = 1.5;
                api.shake(6, 0.28); api.flash(C.red, 0.18); api.audio.sfx('hurt');
                api.burst(this.redX, ry, C.red, 10);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          // Dark forest path
          c.fillStyle = C.forest; c.fillRect(0, 0, W, H);
          // Moon
          c.globalAlpha = 0.40;
          c.fillStyle = C.moon;
          c.beginPath(); c.arc(W * 0.75, 28, 20, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          // Scrolling background trees
          c.fillStyle = C.nightWd;
          for (var ti = 0; ti < this.trees.length; ti++) {
            var tr = this.trees[ti];
            var th = 80 + (tr.ph * 20) % 50;
            c.fillRect(tr.x - 6, H - th, 12, th);
            c.beginPath(); c.arc(tr.x, H - th, 16 + (tr.ph * 5) % 12, 0, Math.PI * 2); c.fill();
          }
          // Forest floor path
          c.fillStyle = C.dkwood; c.fillRect(32, 0, W - 64, H);
          // Dirt lane texture
          c.strokeStyle = C.nightWd; c.lineWidth = 1;
          for (var dy = -56 + this.treeY; dy < H; dy += 56) {
            c.beginPath(); c.moveTo(W / 2, dy); c.lineTo(W / 2 + 4, dy + 28); c.stroke();
          }
          // Obstacles
          for (var i = 0; i < this.obs.length; i++) {
            var ob = this.obs[i];
            if (ob.kind === 'wolf') {
              // Wolf silhouette
              g.rect(ob.x - 12, ob.y - 8, 24, 16, C.nightWd);
              g.circle(ob.x + 8, ob.y - 12, 8, C.nightWd);
              // Eyes
              g.circle(ob.x + 10, ob.y - 14, 2, C.gold);
              g.circle(ob.x + 6, ob.y - 14, 2, C.gold);
              // Ears
              c.fillStyle = C.nightWd;
              c.beginPath(); c.moveTo(ob.x + 4, ob.y - 18); c.lineTo(ob.x + 9, ob.y - 26); c.lineTo(ob.x + 14, ob.y - 18); c.closePath(); c.fill();
              c.beginPath(); c.moveTo(ob.x + 1, ob.y - 18); c.lineTo(ob.x + 4, ob.y - 24); c.lineTo(ob.x + 8, ob.y - 18); c.closePath(); c.fill();
            } else {
              // Fallen log
              g.rect(ob.x - 16, ob.y - 4, 32, 10, C.bark);
              g.rect(ob.x - 14, ob.y - 2, 28, 6, C.brown);
              g.circle(ob.x - 16, ob.y + 1, 5, C.bark);
              g.circle(ob.x + 16, ob.y + 1, 5, C.bark);
            }
          }
          // Red Riding Hood (player)
          var rx = this.redX, ry = H - 56;
          if (this.invT <= 0 || Math.floor(this.invT * 9) % 2 === 0) {
            // Cloak
            g.rect(rx - 9, ry, 18, 14, C.cloak);
            // Hood + head
            g.circle(rx, ry - 10, 9, C.cloak);
            g.circle(rx, ry - 10, 6, '#e8b898'); // face
            // Hood peak
            c.fillStyle = C.cloak;
            c.beginPath(); c.moveTo(rx - 8, ry - 16); c.lineTo(rx, ry - 26); c.lineTo(rx + 8, ry - 16); c.closePath(); c.fill();
            // Basket
            g.rect(rx + 9, ry + 2, 8, 7, C.brown);
          }
          // HUD
          api.topBar('TIME: ' + Math.max(0, Math.ceil(this.dur - this.timer)) + 's');
          for (var li = 0; li < 3; li++) g.circle(W - 38 + li * 13, 20, 4, li < this.lives ? C.red : '#2a0808');
          api.vignette();
        },
      },

      /* ==============================================================
       * 2. LET DOWN YOUR HAIR — pendulum timing, 8 levels, 3 misses
       * ============================================================== */
      {
        id: 'rapunzel',
        name: 'LET DOWN YOUR HAIR',
        sub: 'RAPUNZEL',
        icon: function (api, x, y) {
          var g = api.gfx;
          // Tower
          g.rect(x - 6, y - 12, 12, 16, C.stone);
          g.rect(x - 8, y - 14, 16, 4, C.grey);
          g.rect(x - 2, y - 12, 4, 16, C.dkwood);
          // Hair cascading down
          c_icon_arc(api.ctx, x + 2, y - 4, 3, C.gold);
          g.rect(x + 1, y - 1, 4, 14, C.gold);
        },
        intro: [
          'RAPUNZEL IS LOCKED',
          'HIGH IN HER TOWER.',
          'The prince has found her',
          'and calls from below.',
          'The golden braid',
          'sways in the moonlight...',
        ],
        quote: '"Rapunzel, Rapunzel, let down your golden hair!" — Rapunzel (1812)',
        help: 'TAP when the braid swings to the GOLD ZONE!',
        winText: 'Tap by tap, the prince climbed to Rapunzel. Together at last!',
        loseText: 'The braid slipped from his grasp. The witch laughed from below.',
        init: function (api) {
          this.level  = 0;
          this.need   = 8;
          this.misses = 0;
          this.maxMis = 3;
          this.angle  = 0;
          this.dir    = 1;
          this.spd    = 0.7; // radians per second
          this.pause  = 0;
          this.result = null;
        },
        update: function (api, dt) {
          if (this.pause > 0) { this.pause -= dt; return; }
          // Pendulum sweep ±60°
          var maxA = Math.PI / 3;
          this.angle += this.dir * this.spd * dt;
          if (this.angle > maxA)  { this.angle = maxA;  this.dir = -1; }
          if (this.angle < -maxA) { this.angle = -maxA; this.dir = 1; }
          // Win zone: ±8° (shrinks with each level)
          var zone = Math.max(0.06, 0.14 - this.level * 0.014);
          if (api.confirm()) {
            if (Math.abs(this.angle) < zone) {
              this.level++;
              this.result = 'hit';
              api.audio.sfx('power'); api.shake(3, 0.14);
              api.burst(api.W / 2, api.H / 2, C.gold, 14);
              this.spd = Math.min(2.6, this.spd + 0.22);
              this.pause = 0.38;
              if (this.level >= this.need) { api.score += 160; api.win(); }
            } else {
              this.misses++;
              this.result = 'miss';
              api.audio.sfx('hurt'); api.shake(5, 0.20);
              this.pause = 0.40;
              if (this.misses >= this.maxMis) { api.lose(); }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Night sky
          c.fillStyle = C.forest; c.fillRect(0, 0, W, H);
          // Moon
          c.globalAlpha = 0.55;
          c.fillStyle = C.moon;
          c.beginPath(); c.arc(W * 0.76, 30, 22, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          // Tower
          var tx = W / 2, ty = 48;
          g.rect(tx - 26, ty, 52, H * 0.35, C.stone);
          g.rect(tx - 30, ty - 8, 60, 12, C.grey);
          // Crenellations
          for (var ci = 0; ci < 5; ci++) g.rect(tx - 28 + ci * 14, ty - 16, 10, 12, C.stone);
          // Window
          g.rect(tx - 10, ty + 8, 20, 24, C.dkwood);
          g.rect(tx - 6,  ty + 10, 12, 20, '#0a0c14');
          c.globalAlpha = 0.4; c.fillStyle = C.amber;
          c.fillRect(tx - 6, ty + 10, 12, 20);
          c.globalAlpha = 1;
          // Rapunzel face in window
          g.circle(tx, ty + 20, 7, '#e8c0a0');
          g.rect(tx - 4, ty + 10, 8, 5, C.gold);

          // Braid pendulum (hangs from window centre)
          var bLen = 180;
          var bx = tx + Math.sin(this.angle) * bLen;
          var by = ty + 28 + Math.cos(this.angle) * bLen;
          // Draw braid strand
          c.strokeStyle = C.gold; c.lineWidth = 4;
          c.beginPath(); c.moveTo(tx, ty + 28); c.lineTo(bx, by); c.stroke();
          c.strokeStyle = C.amber; c.lineWidth = 1.5;
          c.setLineDash([6, 4]);
          c.beginPath(); c.moveTo(tx, ty + 28); c.lineTo(bx, by); c.stroke();
          c.setLineDash([]);
          // Braid end
          g.circle(bx, by, 6, C.gold);
          g.circle(bx, by, 3, C.amber);

          // Gold zone indicator (vertical center bar)
          var zone = Math.max(0.06, 0.14 - this.level * 0.014);
          var mh = bLen * 2 + 4, mx = W / 2 - 4, my = ty + 28 - bLen;
          // Zone arc (centre segment is the hit area)
          c.strokeStyle = '#1a3a10'; c.lineWidth = 3;
          c.beginPath(); c.arc(tx, ty + 28, bLen, Math.PI / 2 - zone, Math.PI / 2 + zone); c.stroke();
          c.strokeStyle = C.gold; c.lineWidth = 3;
          c.globalAlpha = 0.7;
          c.beginPath(); c.arc(tx, ty + 28, bLen, Math.PI / 2 - zone, Math.PI / 2 + zone); c.stroke();
          c.globalAlpha = 1;

          // Hit/miss flash
          if (this.pause > 0) {
            c.fillStyle = this.result === 'hit' ? 'rgba(212,160,32,.28)' : 'rgba(200,20,30,.25)';
            c.fillRect(0, 0, W, H);
          }

          // Level progress dots
          for (var i = 0; i < this.need; i++) {
            var px = W / 2 - (this.need - 1) * 10 + i * 20;
            g.circle(px, H - 28, 6, i < this.level ? C.gold : '#2a2410');
            if (i < this.level) g.circle(px, H - 28, 3, C.amber);
          }
          api.txtC('CLIMB: ' + this.level + '/' + this.need, W / 2, H - 46, 7, C.silver, true);

          // Misses (bottom bar)
          for (var mi = 0; mi < this.maxMis; mi++) {
            g.circle(W - 30 + mi * 14, H - 28, 5, mi < this.misses ? C.red : '#2a1408');
          }
          api.topBar('TAP IN THE GOLD ZONE');
          api.vignette();
        },
      },

      /* ==============================================================
       * 3. THE WITCH'S OVEN — whack the witch 12 times, 3 misses
       * ============================================================== */
      {
        id: 'hansel',
        name: "THE WITCH'S OVEN",
        sub: 'HANSEL & GRETEL',
        icon: function (api, x, y) {
          var g = api.gfx;
          // Gingerbread house
          g.rect(x - 8, y - 6, 16, 12, C.ginger);
          g.rect(x - 10, y - 10, 20, 6, C.candy);
          g.rect(x - 3, y - 2,  6, 8, C.brown);
          // Candy dots
          g.circle(x - 4, y - 4, 2, C.red);
          g.circle(x + 3, y - 4, 2, C.gold);
          g.circle(x - 1, y - 6, 1, C.moon);
        },
        intro: [
          'THE WITCH LURED',
          'THEM WITH CANDY.',
          'Now Hansel is caged',
          'and Gretel must act.',
          'Push the witch into',
          'the oven — tap her!',
        ],
        quote: '"She shrieked most horribly; but Gretel ran away, and the wicked witch burned." — Hansel & Gretel (1812)',
        help: 'TAP the witch when she appears — before she escapes!',
        winText: 'Into the oven! Hansel was freed, and the house was stuffed with treasure.',
        loseText: 'The witch cackled and fled back to the candy house. Try again!',
        init: function (api) {
          this.hits   = 0;
          this.need   = 12;
          this.misses = 0;
          this.maxMis = 3;
          this.witch  = null; // { x, y, timer, dur }
          this.coolT  = 0;
          this.score_ = 0;
          this.ovenFlash = 0;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.coolT -= dt;
          this.ovenFlash = Math.max(0, this.ovenFlash - dt);
          // Witch appearance window
          if (!this.witch && this.coolT <= 0) {
            var slots = [
              { x: 50,  y: H * 0.36 },
              { x: 135, y: H * 0.30 },
              { x: 218, y: H * 0.36 },
              { x: 80,  y: H * 0.54 },
              { x: 190, y: H * 0.50 },
            ];
            var s = slots[randI(0, 4)];
            var dur = Math.max(0.9, 1.8 - this.hits * 0.06);
            this.witch = { x: s.x, y: s.y, timer: 0, dur: dur };
          }
          // Advance witch timer
          if (this.witch) {
            this.witch.timer += dt;
            if (this.witch.timer >= this.witch.dur) {
              // Escaped
              this.misses++;
              api.audio.sfx('hurt'); api.shake(4, 0.2);
              this.witch = null;
              this.coolT = Math.max(0.3, 0.7 - this.hits * 0.04);
              if (this.misses >= this.maxMis) { api.lose(); return; }
            }
            // Check tap on witch
            if (api.pointer.justDown && this.witch) {
              var dx = api.pointer.x - this.witch.x;
              var dy = api.pointer.y - this.witch.y;
              if (dx * dx + dy * dy < 30 * 30) {
                this.hits++;
                this.ovenFlash = 0.3;
                api.audio.sfx('power'); api.shake(3, 0.14);
                api.burst(this.witch.x, this.witch.y, C.magic, 12);
                this.witch = null;
                this.coolT = Math.max(0.25, 0.65 - this.hits * 0.04);
                if (this.hits >= this.need) { api.score += 160; api.win(); }
              }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          // Gingerbread house interior
          c.fillStyle = '#1a0e06'; c.fillRect(0, 0, W, H);
          // Wall candy stripes
          c.fillStyle = C.ginger; c.fillRect(0, 0, W, H * 0.12);
          c.fillStyle = C.candy;
          for (var cs = 0; cs < 8; cs++) {
            c.fillRect(cs * 36, 0, 18, H * 0.12);
          }
          // Wall gingerbread panels
          var panelColors = ['#2a1606', '#261408'];
          for (var row = 0; row < 5; row++) {
            for (var col = 0; col < 4; col++) {
              var px = col * 68 + 2, py = H * 0.12 + row * 64 + 2;
              c.fillStyle = panelColors[(row + col) % 2];
              c.fillRect(px, py, 64, 60);
              c.strokeStyle = C.ginger; c.lineWidth = 1; c.strokeRect(px, py, 64, 60);
            }
          }
          // Oven (center bottom)
          var ox = W / 2, oy = H - 52;
          g.rect(ox - 36, oy - 30, 72, 58, '#3a1808');
          g.rect(ox - 32, oy - 26, 64, 48, '#2a1004');
          // Oven fire (glow)
          c.globalAlpha = 0.55 + 0.2 * Math.sin(t * 4);
          c.fillStyle = '#e85010';
          c.beginPath(); c.arc(ox, oy + 10, 18, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 0.3 + 0.2 * Math.sin(t * 3.1);
          c.fillStyle = C.amber;
          c.beginPath(); c.arc(ox, oy + 14, 10, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          if (this.ovenFlash > 0) {
            c.globalAlpha = 0.5 * (this.ovenFlash / 0.3);
            c.fillStyle = C.magic;
            c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }
          g.rect(ox - 36, oy - 30, 72, 6, '#5a2810'); // oven top bar
          api.txtCFit('OVEN', ox, oy - 34, 6, C.gold, true, 60);

          // Witch (if active)
          if (this.witch) {
            var wx = this.witch.x, wy = this.witch.y;
            var pct = this.witch.timer / this.witch.dur;
            // Fade out as time expires
            c.globalAlpha = Math.max(0, 1 - pct * 1.2);
            // Witch body
            g.circle(wx, wy - 18, 12, C.witch);
            g.rect(wx - 10, wy - 8, 20, 20, C.witch);
            // Witch hat
            c.fillStyle = C.witch;
            c.beginPath();
            c.moveTo(wx - 14, wy - 28);
            c.lineTo(wx, wy - 48);
            c.lineTo(wx + 14, wy - 28);
            c.closePath(); c.fill();
            g.rect(wx - 15, wy - 30, 30, 5, C.nightWd);
            // Eyes
            g.circle(wx - 4, wy - 22, 2, C.enchant);
            g.circle(wx + 4, wy - 22, 2, C.enchant);
            // Nose
            g.rect(wx - 1, wy - 18, 2, 5, '#3a1008');
            // Warning ring when almost expiring
            if (pct > 0.6) {
              c.strokeStyle = C.red;
              c.lineWidth = 2;
              c.globalAlpha = (pct - 0.6) / 0.4;
              c.beginPath(); c.arc(wx, wy - 10, 24, 0, Math.PI * 2); c.stroke();
            }
            c.globalAlpha = 1;
          }

          // Progress bar
          var bw = W - 40;
          g.rect(20, H - 18, bw, 8, '#1a0e06');
          g.rect(20, H - 18, Math.floor(bw * this.hits / this.need), 8, C.witch);
          api.txtC('PUSH: ' + this.hits + '/' + this.need, W / 2, H - 32, 7, C.silver, true);
          // Misses
          for (var mi = 0; mi < this.maxMis; mi++) {
            g.circle(W - 30 + mi * 14, H - 26, 5, mi < this.misses ? C.red : '#2a1408');
          }
          api.topBar('TAP THE WITCH!');
          api.vignette();
        },
      },

      /* ==============================================================
       * 4. STRAW INTO GOLD — catch golden coins, 12 needed, 3 misses
       * ============================================================== */
      {
        id: 'rumpel',
        name: 'STRAW INTO GOLD',
        sub: 'RUMPELSTILTSKIN',
        icon: function (api, x, y) {
          var g = api.gfx;
          // Spinning wheel
          g.circle(x, y - 2, 8, C.bark);
          g.circle(x, y - 2, 5, C.dkwood);
          g.circle(x, y - 2, 2, C.gold);
          g.rect(x - 2, y + 6, 4, 8, C.bark);
          g.circle(x - 5, y - 2, 2, C.gold);
          g.circle(x + 5, y - 2, 2, C.gold);
        },
        intro: [
          'THE MILLER\'S DAUGHTER',
          'FACES DAWN OR RUIN.',
          'Rumpelstiltskin\'s wheel',
          'spins straw to gold.',
          'Catch the coins before',
          'the morning bell rings!',
        ],
        quote: '"I\'ll come back and spin your straw into gold — if you give me what I want." — Rumpelstiltskin (1812)',
        help: 'DRAG left/right — catch GOLD coins, dodge plain STRAW!',
        winText: 'The room shone with gold! The miller\'s daughter had kept her bargain.',
        loseText: 'The plain straw piled up. Rumpelstiltskin demanded his price.',
        init: function (api) {
          this.basketX = api.W / 2;
          this.caught  = 0;
          this.need    = 12;
          this.misses  = 0;
          this.maxMis  = 3;
          this.items   = [];
          this.spawnT  = 0;
          this.wheelA  = 0;
          this.invT    = 0;
          this.timer   = 0;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.timer += dt;
          this.wheelA += 2.2 * dt;
          if (this.invT > 0) this.invT -= dt;
          // Move basket
          if (api.pointer.down) this.basketX = clamp(api.pointer.x, 22, W - 22);
          if (api.keyDown('left'))  this.basketX = clamp(this.basketX - 190 * dt, 22, W - 22);
          if (api.keyDown('right')) this.basketX = clamp(this.basketX + 190 * dt, 22, W - 22);
          // Spawn items
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.55, 1.4 - this.timer * 0.04);
            var isGold = Math.random() < 0.62;
            this.items.push({ x: 24 + randI(0, W - 48), y: -16, gold: isGold });
          }
          var spd = 80 + this.timer * 2.5;
          for (var j = 0; j < this.items.length; j++) this.items[j].y += spd * dt;
          // Catch check
          var bx = this.basketX, by = H - 42;
          var toRemove = [];
          for (var m = 0; m < this.items.length; m++) {
            var it = this.items[m];
            if (it.y > H + 16) { toRemove.push(m); continue; }
            if (it.y > by - 10 && it.y < by + 14 && Math.abs(it.x - bx) < 24) {
              toRemove.push(m);
              if (it.gold) {
                this.caught++;
                api.audio.sfx('coin'); api.burst(it.x, it.y, C.gold, 10);
                if (this.caught >= this.need) { api.score += 160; api.win(); }
              } else {
                if (this.invT <= 0) {
                  this.misses++;
                  this.invT = 0.8;
                  api.shake(4, 0.18); api.flash(C.straw, 0.15); api.audio.sfx('hurt');
                  if (this.misses >= this.maxMis) { api.lose(); return; }
                }
              }
            }
          }
          for (var ri = toRemove.length - 1; ri >= 0; ri--) this.items.splice(toRemove[ri], 1);
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Castle chamber
          c.fillStyle = '#100c06'; c.fillRect(0, 0, W, H);
          // Stone floor
          c.fillStyle = '#1a1408'; c.fillRect(0, H * 0.68, W, H * 0.32);
          for (var fc = 0; fc < 6; fc++) {
            c.strokeStyle = '#221a0e'; c.lineWidth = 1;
            c.strokeRect(fc * 45, H * 0.68, 45, H * 0.32);
          }
          // Spinning wheel (large, centre)
          var wx = W / 2 - 44, wy = H * 0.52;
          var wa = this.wheelA;
          g.circle(wx, wy, 34, C.bark);
          g.circle(wx, wy, 24, C.dkwood);
          g.circle(wx, wy, 6, C.brown);
          // Spokes
          c.strokeStyle = C.bark; c.lineWidth = 2;
          for (var sp = 0; sp < 6; sp++) {
            var sa = wa + sp * Math.PI / 3;
            c.beginPath();
            c.moveTo(wx + Math.cos(sa) * 6, wy + Math.sin(sa) * 6);
            c.lineTo(wx + Math.cos(sa) * 24, wy + Math.sin(sa) * 24);
            c.stroke();
          }
          // Wheel frame
          g.rect(wx - 2, wy + 24, 4, 36, C.bark);
          g.rect(wx - 24, wy + 56, 48, 4, C.bark);
          // Straw pile (right side)
          var sx = W / 2 + 30;
          g.rect(sx, wy + 10, 60, 8, C.straw);
          g.rect(sx + 6, wy + 4, 48, 8, C.straw);
          for (var si = 0; si < 6; si++) {
            c.strokeStyle = C.straw; c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(sx + si * 10 + 2, wy + 2); c.lineTo(sx + si * 10 + randI(-2, 4), wy + 20); c.stroke();
          }
          // Falling items
          for (var i = 0; i < this.items.length; i++) {
            var it = this.items[i];
            if (it.gold) {
              g.circle(it.x, it.y, 7, C.gold);
              g.circle(it.x, it.y, 4, C.amber);
              g.circle(it.x - 2, it.y - 2, 2, C.moon);
            } else {
              // Straw bundle
              c.strokeStyle = C.straw; c.lineWidth = 2;
              c.beginPath(); c.moveTo(it.x - 6, it.y - 5); c.lineTo(it.x + 6, it.y + 5); c.stroke();
              c.beginPath(); c.moveTo(it.x - 4, it.y - 6); c.lineTo(it.x + 4, it.y + 6); c.stroke();
              g.rect(it.x - 5, it.y - 2, 10, 4, '#a07818');
            }
          }
          // Basket
          var bx = this.basketX, by = H - 42;
          if (this.invT <= 0 || Math.floor(this.invT * 10) % 2 === 0) {
            g.rect(bx - 22, by, 44, 20, C.bark);
            g.rect(bx - 22, by, 44, 4, C.brown);
            // Weave lines
            c.strokeStyle = C.brown; c.lineWidth = 1;
            for (var bwi = 0; bwi < 5; bwi++) {
              c.beginPath(); c.moveTo(bx - 22 + bwi * 11, by); c.lineTo(bx - 22 + bwi * 11, by + 20); c.stroke();
            }
          }
          // Progress bar (gold caught)
          var bw = W - 40;
          g.rect(20, H - 18, bw, 8, '#1a1008');
          g.rect(20, H - 18, Math.floor(bw * this.caught / this.need), 8, C.gold);
          api.txtC('GOLD: ' + this.caught + '/' + this.need, W / 2, H - 32, 7, C.silver, true);
          // Straw misses
          for (var mi = 0; mi < this.maxMis; mi++) {
            g.circle(W - 30 + mi * 14, H - 26, 5, mi < this.misses ? C.straw : '#2a1e08');
          }
          api.topBar('CATCH THE GOLD COINS!');
          api.vignette();
        },
      },

      /* ==============================================================
       * 5. TRUE LOVE'S KISS — precision ring, 5 kisses, 3 misses
       * ============================================================== */
      {
        id: 'sleeping',
        name: "TRUE LOVE'S KISS",
        sub: 'SLEEPING BEAUTY',
        icon: function (api, x, y) {
          var g = api.gfx;
          // Rose
          g.circle(x, y - 8, 7, C.red);
          g.circle(x - 3, y - 10, 4, C.redL);
          g.circle(x + 3, y - 6, 4, C.cloak);
          // Stem and leaf
          g.rect(x - 1, y - 1, 2, 10, C.leaf);
          g.rect(x - 6, y + 2, 8, 4, C.leaf);
        },
        intro: [
          'THE PRINCESS SLEEPS,',
          'WRAPPED IN THORNS.',
          'One hundred years',
          'beneath the enchantment.',
          'The prince must deliver',
          'the kiss of true love...',
        ],
        quote: '"Then the prince kissed her, and she awoke." — Sleeping Beauty (Briar Rose), Brothers Grimm (1812)',
        help: 'TAP when the enchantment ring closes to its tightest!',
        winText: 'She opened her eyes! The spell was broken. The kingdom awoke.',
        loseText: 'The enchantment ring held firm. She sleeps another hundred years.',
        init: function (api) {
          this.kisses = 0;
          this.need   = 5;
          this.misses = 0;
          this.maxMis = 3;
          this.ring   = 1.0; // 0 = smallest (hit zone), 1 = largest
          this.rDir   = -1;  // -1 = shrinking, +1 = growing
          this.spd    = 0.5;
          this.pause  = 0;
          this.result = null;
          this.roseA  = 0;
        },
        update: function (api, dt) {
          this.roseA += dt;
          if (this.pause > 0) { this.pause -= dt; return; }
          this.ring += this.rDir * this.spd * dt;
          if (this.ring <= 0) {
            // Hit zone: near 0 = tightest ring, is where they should tap
            this.ring = 0;
            this.rDir = 1;
          }
          if (this.ring >= 1) {
            this.ring = 1;
            this.rDir = -1;
          }
          // Tap check — good window is ring < 0.18 (shrinks with each kiss)
          var hitWindow = Math.max(0.08, 0.18 - this.kisses * 0.018);
          if (api.confirm()) {
            if (this.ring < hitWindow) {
              this.kisses++;
              this.result = 'hit';
              api.audio.sfx('power'); api.shake(3, 0.15);
              api.burst(api.W / 2, api.H / 2, C.enchant, 16);
              this.spd = Math.min(2.0, this.spd + 0.22);
              this.pause = 0.42;
              if (this.kisses >= this.need) { api.score += 200; api.win(); }
            } else {
              this.misses++;
              this.result = 'miss';
              api.audio.sfx('hurt'); api.shake(5, 0.22);
              this.pause = 0.42;
              if (this.misses >= this.maxMis) { api.lose(); }
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          // Royal chamber
          var sky = c.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#0c0818');
          sky.addColorStop(1, '#18082c');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          // Thorn vines along walls
          c.strokeStyle = '#1a2c10'; c.lineWidth = 2;
          for (var vi = 0; vi < 6; vi++) {
            c.beginPath();
            c.moveTo(0, vi * 88);
            c.bezierCurveTo(24, vi * 88 + 22, 8, vi * 88 + 44, 30, vi * 88 + 66);
            c.stroke();
            c.beginPath();
            c.moveTo(W, vi * 88);
            c.bezierCurveTo(W - 24, vi * 88 + 22, W - 8, vi * 88 + 44, W - 30, vi * 88 + 66);
            c.stroke();
          }
          // Thorn thorns
          c.strokeStyle = '#0e1e08'; c.lineWidth = 1;
          for (var ti2 = 0; ti2 < 8; ti2++) {
            var tvx = ti2 < 4 ? 22 : W - 22;
            var tvy = ti2 * 62 + 20;
            c.beginPath(); c.moveTo(tvx, tvy); c.lineTo(tvx + (ti2 < 4 ? 10 : -10), tvy - 8); c.stroke();
            c.beginPath(); c.moveTo(tvx, tvy + 14); c.lineTo(tvx + (ti2 < 4 ? 8 : -8), tvy + 22); c.stroke();
          }
          // Roses on vines
          for (var ri = 0; ri < 5; ri++) {
            var rvx = ri % 2 === 0 ? 18 : W - 18;
            var rvy = 60 + ri * 82;
            c.globalAlpha = 0.7;
            g.circle(rvx, rvy, 6, C.red);
            g.circle(rvx - 2, rvy - 2, 3, C.redL);
            c.globalAlpha = 1;
          }

          // Sleeping princess (on a canopied bed, center)
          var px = W / 2, py = H * 0.44;
          // Bed canopy
          g.rect(px - 44, py - 54, 88, 6, '#3c1848');
          g.rect(px - 40, py - 50, 80, 54, '#1e0c2a');
          g.rect(px - 42, py - 60, 4, 60, '#3c1848');
          g.rect(px + 38, py - 60, 4, 60, '#3c1848');
          // Princess body
          g.rect(px - 30, py - 14, 60, 12, '#c8a8d8');
          g.circle(px, py - 20, 12, '#e8c8a0');
          // Hair (spread)
          g.rect(px - 26, py - 22, 52, 6, C.gold);
          // Closed eyes
          c.strokeStyle = '#3a2820'; c.lineWidth = 1.5;
          c.beginPath(); c.arc(px - 5, py - 22, 4, Math.PI, 0); c.stroke();
          c.beginPath(); c.arc(px + 5, py - 22, 4, Math.PI, 0); c.stroke();
          // Enchantment rose on chest
          g.circle(px, py - 12, 4, C.red);
          g.circle(px - 1, py - 14, 2, C.redL);

          // Enchantment ring (pulsing around princess)
          var maxR = 62, minR = 8;
          var curR = minR + (maxR - minR) * this.ring;
          // Ring glow
          c.globalAlpha = 0.4 * (1 - this.ring);
          c.strokeStyle = C.enchant;
          c.lineWidth = 4;
          c.beginPath(); c.arc(px, py - 14, curR, 0, Math.PI * 2); c.stroke();
          c.globalAlpha = 0.7;
          c.strokeStyle = C.magic;
          c.lineWidth = 2;
          c.beginPath(); c.arc(px, py - 14, curR, 0, Math.PI * 2); c.stroke();
          c.globalAlpha = 1;
          // Target centre circle (hit when ring reaches this)
          var hitWindow2 = Math.max(0.08, 0.18 - this.kisses * 0.018);
          var hitR = minR + (maxR - minR) * hitWindow2;
          c.strokeStyle = C.gold; c.lineWidth = 1.5;
          c.globalAlpha = 0.5;
          c.beginPath(); c.arc(px, py - 14, hitR, 0, Math.PI * 2); c.stroke();
          c.globalAlpha = 1;

          // Floating rose petals (orbiting)
          for (var pi2 = 0; pi2 < 5; pi2++) {
            var pa = this.roseA * 0.6 + pi2 * (Math.PI * 2 / 5);
            var prx = px + Math.cos(pa) * 48;
            var pry = (py - 14) + Math.sin(pa) * 28;
            g.circle(prx, pry, 3, C.red);
          }

          // Hit/miss flash
          if (this.pause > 0) {
            c.fillStyle = this.result === 'hit' ? 'rgba(192,96,232,.3)' : 'rgba(200,20,30,.25)';
            c.fillRect(0, 0, W, H);
          }

          // Kiss progress hearts
          for (var ki = 0; ki < this.need; ki++) {
            var kx = W / 2 - (this.need - 1) * 12 + ki * 24;
            var filled = ki < this.kisses;
            c.fillStyle = filled ? C.red : '#2a0c18';
            // Simple heart
            c.beginPath();
            c.arc(kx - 3, H - 28, 4, Math.PI, 0);
            c.arc(kx + 3, H - 28, 4, Math.PI, 0);
            c.lineTo(kx, H - 18); c.closePath(); c.fill();
          }
          api.txtC('KISSES: ' + this.kisses + '/' + this.need, W / 2, H - 46, 7, C.silver, true);
          // Misses
          for (var mi2 = 0; mi2 < this.maxMis; mi2++) {
            g.circle(W - 30 + mi2 * 14, H - 40, 5, mi2 < this.misses ? C.red : '#2a0818');
          }
          api.topBar('TAP WHEN THE RING IS SMALL!');
          api.vignette();
        },
      },

    ],
  });

  /* ── tiny arc helper used in icon drawing (no closure over outer `c`) ── */
  function c_icon_arc(ctx2, x, y, r, color) {
    ctx2.fillStyle = color;
    ctx2.beginPath(); ctx2.arc(x, y, r, 0, Math.PI * 2); ctx2.fill();
  }

}());
