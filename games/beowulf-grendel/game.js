/* ============================================================================
 * BEOWULF — FIVE DEEDS
 * Five chapters through the Old English epic:
 *   1. THE WHALE-ROAD  — steer the longship through the grey sea
 *   2. GRENDEL'S GRIP  — wrestle the monster with bare hands
 *   3. THE MERE        — face Grendel's Mother with the ancient sword
 *   4. THE FIRE DRAKE  — dodge the dragon's breath, strike for glory
 *   5. WIGLAF'S STAND  — hold the shield wall to the last
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  // Dragon silhouette emblem (Beowulf's final foe)
  function emblem(api, cx, cy) {
    var g = api.gfx;
    g.sprite([
      '...ddd.....',
      '..ddddd....',
      '.ddddddf...',
      'ddddddfff..',
      '.dddddfff..',
      '..dddff....',
      '...ddd.....',
      '....dd.....',
      '...dddd....',
    ], cx - 33, cy - 28, { d: '#c8962a', f: '#ff7a28' }, 6);
  }

  // Animated backdrop — night hillside for menu, mead-hall for other screens
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    var sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#040e02');
    sky.addColorStop(0.55, '#0a1806');
    sky.addColorStop(1, '#060c04');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    if (scene === 'menu') {
      // Stars
      for (var i = 0; i < 38; i++) {
        var sx = (i * 71 + 19) % W, sy = (i * 43 + 7) % Math.floor(H * 0.5);
        c.globalAlpha = 0.22 + 0.32 * Math.sin(t * 1.3 + i * 0.8);
        g.rect(sx, sy, 1, 1, '#f0e8c8');
      }
      c.globalAlpha = 1;
      // Crescent moon
      g.circle(W - 50, 40, 19, '#d4c890');
      g.circle(W - 42, 33, 16, '#0a1806');
      // Distant treeline
      c.fillStyle = '#061008';
      c.beginPath(); c.moveTo(0, H * 0.47);
      for (var x = 0; x <= W; x += 13) {
        var th = ((x * 13 + 9) % 30) + 8;
        c.lineTo(x, H * 0.47 - th);
      }
      c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      // Burial mound silhouette
      c.fillStyle = '#0c1a08';
      c.beginPath();
      c.ellipse(W / 2, H * 0.76, W * 0.68, H * 0.17, 0, Math.PI, 0);
      c.fill();
      // Ground
      c.fillStyle = '#101e08'; c.fillRect(0, H - 92, W, 92);
      c.fillStyle = '#182c0c'; c.fillRect(0, H - 94, W, 3);
    } else {
      // Mead-hall interior
      c.fillStyle = '#1a1008'; c.fillRect(0, 0, W, H);
      for (var y = 0; y < H; y += 24) g.rect(0, y, W, 1, '#120c06');
      // Torch flicker
      var fl1 = 0.65 + 0.35 * Math.sin(t * 7.3);
      var fl2 = 0.65 + 0.35 * Math.sin(t * 5.8 + 1.9);
      c.globalAlpha = fl1 * 0.20; c.fillStyle = '#ff8a1a';
      c.beginPath(); c.ellipse(0, H * 0.36, 58, 130, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = fl2 * 0.20;
      c.beginPath(); c.ellipse(W, H * 0.36, 58, 130, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      var ty = Math.floor(H * 0.30);
      g.rect(4, ty - 14, 7, 20, '#3a2010'); g.rect(5, ty - 20, 5, 8, '#ff9a2a');
      g.rect(W - 11, ty - 14, 7, 20, '#3a2010'); g.rect(W - 10, ty - 20, 5, 8, '#ff9a2a');
      // Rafters
      for (var ri = 0; ri < 4; ri++) {
        c.globalAlpha = 0.16; g.rect(0, H * 0.08 + ri * 26, W, 8, '#2a1808'); c.globalAlpha = 1;
      }
      if (scene === 'intro' || scene === 'result' || scene === 'finale') {
        c.fillStyle = 'rgba(4,8,2,.72)'; c.fillRect(0, 0, W, H);
      }
    }
  }

  RetroSaga.create({
    id: 'beowulf',
    title: 'BEOWULF',
    subtitle: 'AN OLD ENGLISH EPIC',
    currency: 'GLORY',
    screens: {
      win: '#c8962a', lose: '#8b2a0a',
      chapterLabel: '#6a8858', name: '#f0e8c8', sub: '#8a7a3a',
      intro: '#d4c8a0', quote: '#5a7848', help: '#c8962a',
      score: '#f0e8c8', cur: '#c8962a', cta: '#f0e8c8',
      overlay: 'rgba(4,8,2,.88)',
    },
    labels: {
      chapter: 'DEED', score: 'GLORY WON',
      win: 'THE HALL RINGS WITH YOUR NAME',
      lose: 'WYRD HAS CLAIMED YOU',
      cont: 'TAP TO PRESS ON',
      finale: 'TAP FOR THE LAST STAND',
      toMenu: 'TAP TO RETURN',
      play: 'TAP TO BEGIN',
    },
    accent: '#c8962a',
    credit: 'OLD ENGLISH EPIC · c. 700–1000 AD',
    emblem: emblem,
    scenery: scenery,
    bootCta: 'ENTER THE MEAD-HALL',
    menuLabel: 'THE DEEDS OF BEOWULF',
    menuHint: 'CHOOSE A DEED',
    menuDone: '★ THE SONG IS SUNG ★',
    menu: {
      colors: { title: '#c8962a', label: '#6a8858', cur: '#f0e8c8', hint: '#8a7a3a' },
      // Standing stones in a burial-mound arc (like Stonehenge at night)
      layout: function (api) {
        return [
          { x: 14,  y: 126, w: 78, h: 92 },
          { x: 178, y: 106, w: 78, h: 92 },
          { x: 12,  y: 256, w: 78, h: 88 },
          { x: 180, y: 256, w: 78, h: 88 },
          { x: 84,  y: 358, w: 102, h: 80 },
        ];
      },
      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done;
        // Stone shape: slightly tapered (wider at top, narrower at base)
        c.fillStyle = sel ? '#243a14' : '#162410';
        c.beginPath();
        c.moveTo(x + 4, y);
        c.lineTo(x + w - 4, y);
        c.lineTo(x + w - 2, y + h);
        c.lineTo(x + 2, y + h);
        c.closePath(); c.fill();
        c.strokeStyle = sel ? '#c8962a' : '#3a5a22'; c.lineWidth = sel ? 2 : 1; c.stroke();
        // Rune etch lines
        for (var li = 0; li < 4; li++) {
          c.globalAlpha = done ? 0.42 : 0.18;
          g.rect(x + 12, y + 10 + li * 9, w - 24, 1, '#c8962a');
          c.globalAlpha = 1;
        }
        // Chapter icon
        if (ch.icon) ch.icon(api, x + w / 2, y + 30);
        // Name text
        api.txtCFit((i + 1) + '. ' + ch.name, x + w / 2, y + 50, 7, done ? '#c8962a' : '#f0e8c8', false, w - 16);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2, y + 65, 6, '#6a8858', false, w - 16);
        if (done) api.txtC('✦', x + w / 2, y + h - 15, 9, '#c8962a');
        if (sel) {
          c.globalAlpha = 0.10; c.fillStyle = '#c8962a';
          c.fillRect(x + 3, y + 3, w - 6, h - 6); c.globalAlpha = 1;
        }
      },
    },
    finale: [
      'THE DRAGON FALLS.',
      'BEOWULF SPEAKS HIS LAST BOAST.',
      '',
      'THE GEATS BUILD',
      'A SEA BARROW ON THE CLIFF.',
      '',
      'THE SONG WILL LAST.',
    ],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#c8962a', blood: '#8b2a0a' },

    chapters: [

      // ═══════════════════ DEED 1 — THE WHALE-ROAD ═══════════════════
      {
        id: 'whale-road', name: 'THE WHALE-ROAD', sub: 'SAIL TO HEOROT',
        icon: function (api, x, y) {
          var g = api.gfx;
          g.rect(x - 9, y + 1, 18, 5, '#4a3018');
          g.rect(x - 1, y - 11, 2, 12, '#3a2010');
          g.rect(x, y - 10, 10, 7, '#c8962a');
        },
        intro: [
          'GRENDEL THE MERE-STALKER',
          'PLAGUES KING HROTHGAR\'S HALL.',
          'BEOWULF GATHERS FOURTEEN THANES',
          'and sails the whale-road to help.',
        ],
        quote: 'He chose the greatest men he could find, fourteen warriors, and led them to the sea.',
        help: 'DRAG or tap LEFT / RIGHT to steer the longship past the rocks',
        winText: 'Grey cliffs of Hrothgar\'s kingdom rise from the cold mist. Heorot awaits.',
        loseText: 'The rocks tear the hull apart. The crew is cast into the freezing sea.',

        init: function (api) {
          this.x = api.W / 2;
          this.dist = 0;
          this.need = 520;
          this.rockSpd = 82;
          this.rocks = [];
          this.spawnT = 0;
          this.lives = 3;
          this.hitCool = 0;
          this.wave = 0;
        },
        update: function (api, dt) {
          var f = dt * 60;
          this.wave += dt;
          // Distance accrues to ~22s at average speed
          var spd = 22 + (this.dist / this.need) * 10;
          this.dist += spd * dt;
          this.rockSpd = 82 + (this.dist / this.need) * 62;

          // Steer
          if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.13 * f;
          if (api.keyDown('left'))  this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 22, api.W - 22);

          // Spawn rocks
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.44, 1.3 - (this.dist / this.need) * 0.72);
            this.rocks.push({ x: api.rnd(18, api.W - 18), y: -14, r: 9 + api.rint(0, 7), gone: false });
          }

          // Move rocks
          for (var ri = 0; ri < this.rocks.length; ri++) this.rocks[ri].y += this.rockSpd * dt;

          // Collision
          this.hitCool = Math.max(0, this.hitCool - dt);
          if (this.hitCool <= 0) {
            for (var ci = 0; ci < this.rocks.length; ci++) {
              var r = this.rocks[ci];
              if (!r.gone && Math.hypot(this.x - r.x, (api.H - 64) - r.y) < r.r + 13) {
                r.gone = true; this.lives--;
                this.hitCool = 1.0;
                api.shake(6, 0.3); api.flash(api.colors.blood, 0.2); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          }
          this.rocks = this.rocks.filter(function (r) { return r.y < api.H + 20 && !r.gone; });

          if (this.dist >= this.need) { api.score += 80; api.win(); }
          api.score = Math.floor(this.dist / 5);
        },
        draw: function (api) {
          var g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          var sea = c.createLinearGradient(0, 0, 0, H);
          sea.addColorStop(0, '#0a1a2c'); sea.addColorStop(1, '#04101e');
          c.fillStyle = sea; c.fillRect(0, 0, W, H);
          // Waves
          for (var wi = 0; wi < 7; wi++) {
            var wy = 38 + wi * 54 + Math.sin(this.wave * 1.4 + wi) * 7;
            c.globalAlpha = 0.14; g.rect(0, wy, W, 3, '#4ab8e8'); c.globalAlpha = 1;
          }
          // Rocks
          for (var rk = 0; rk < this.rocks.length; rk++) {
            var rr = this.rocks[rk];
            g.circle(rr.x, rr.y, rr.r, '#1e2e14');
            g.circle(rr.x - 2, rr.y - 2, Math.max(2, rr.r - 4), '#283818');
          }
          // Ship
          var sx = this.x, sy = H - 64;
          c.fillStyle = this.hitCool > 0 ? '#3a1808' : '#5a3a18';
          c.beginPath();
          c.moveTo(sx - 24, sy); c.lineTo(sx - 20, sy + 16);
          c.lineTo(sx + 20, sy + 16); c.lineTo(sx + 24, sy); c.closePath(); c.fill();
          c.strokeStyle = '#2a1808'; c.lineWidth = 1; c.stroke();
          g.rect(sx - 1, sy - 30, 2, 30, '#2a1a08');
          c.fillStyle = '#c8962a';
          c.beginPath(); c.moveTo(sx, sy - 28); c.lineTo(sx + 18, sy - 12); c.lineTo(sx, sy - 6); c.closePath(); c.fill();
          // Shields along rail
          for (var sh = -2; sh <= 2; sh++) g.circle(sx + sh * 9, sy + 4, 4, '#1a3a5a');

          api.topBar('THE WHALE-ROAD');
          api.txt('VOYAGE ' + Math.min(100, Math.floor(this.dist / this.need * 100)) + '%', 6, 20, 8, api.colors.gold);
          for (var li = 0; li < 3; li++) g.rect(W - 54 + li * 17, 3, 11, 10, li < this.lives ? '#5dff8f' : '#1a2a14');
          g.rect(6, H - 10, W - 12, 6, '#0c1808');
          g.rect(6, H - 10, (W - 12) * clamp(this.dist / this.need, 0, 1), 6, api.colors.gold);
        },
      },

      // ═══════════════════ DEED 2 — GRENDEL'S GRIP ═══════════════════
      {
        id: 'grendel', name: "GRENDEL'S GRIP", sub: 'WRESTLE IN THE DARK',
        icon: function (api, x, y) {
          var g = api.gfx;
          g.rect(x - 10, y - 4, 8, 8, '#c8962a');
          g.rect(x + 2,  y - 4, 8, 8, '#2a1808');
          g.rect(x - 1,  y - 2, 2, 6, '#4a3a28');
        },
        intro: [
          'GRENDEL BURSTS INTO HEOROT',
          'AND SNATCHES A SLEEPING WARRIOR.',
          'BEOWULF LEAPS AND SEIZES THE MONSTER',
          'with his bare, iron hands.',
        ],
        quote: 'The formidable one found, in all the earth, he had never met a man with a stronger handgrip.',
        help: 'TAP RAPIDLY to overpower Grendel — drive the bar into the gold zone',
        winText: 'A terrible crack. The arm tears free at the shoulder. Grendel flees to his mere to die.',
        loseText: 'The grip slips. Grendel tears loose and vanishes howling into the night.',

        init: function (api) {
          this.power = 0.5;
          this.rounds = 0;
          this.need = 5;
          this.phase = 'fight';
          this.roarT = 0;
          this.taps = 0;
        },
        update: function (api, dt) {
          var f = dt * 60;
          if (this.phase === 'roar') {
            this.roarT -= dt;
            if (this.roarT <= 0) { this.phase = 'fight'; this.power = 0.5; }
            return;
          }
          var pull = 0.0008 + this.rounds * 0.0005;
          this.power -= pull * f;
          if (api.pointer.justDown || api.keyPressed('a') || api.keyPressed('up')) {
            this.power += 0.065;
            this.taps++;
            api.audio.sfx('blip');
          }
          this.power = clamp(this.power, 0, 1);
          if (this.power <= 0) { api.lose(); return; }
          if (this.power >= 1) {
            this.rounds++;
            api.score += 30;
            api.audio.sfx('power'); api.shake(6, 0.3);
            api.burst(api.W / 2, api.H / 2, api.colors.gold, 14);
            if (this.rounds >= this.need) { api.score += 70; api.win(); return; }
            this.phase = 'roar'; this.roarT = 0.9;
          }
          api.score = this.taps * 4 + this.rounds * 30;
        },
        draw: function (api) {
          var g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#120e08');
          for (var y = 0; y < H; y += 24) g.rect(0, y, W, 1, '#0c0a06');
          c.globalAlpha = 0.10 + 0.05 * Math.sin(api.t * 4);
          c.fillStyle = '#ff8a1a'; c.fillRect(0, 0, W, H); c.globalAlpha = 1;

          if (this.phase === 'roar') {
            c.globalAlpha = 0.28; c.fillStyle = '#8b2a0a'; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
            api.txtC('GRENDEL STAGGERS!', W / 2, H / 2 - 6, 9, '#ff8a1a');
            api.topBar("GRENDEL'S GRIP"); return;
          }

          // Grendel (right) — massive dark creature
          g.sprite([
            '....kkkkk.',
            '...kkkkkkk',
            '..kk.kk.kk',
            '..kkkkkkk.',
            '...kkkkkk.',
            '....k..k..',
            '....k..k..',
          ], W / 2 + 6, H / 2 - 54, { k: '#2a1a0e' }, 8);
          g.rect(W / 2 + 32, H / 2 - 30, 6, 6, '#ff2a08');
          g.rect(W / 2 + 48, H / 2 - 30, 6, 6, '#ff2a08');

          // Beowulf (left) — warrior in gold
          g.sprite(['.bb.', 'bbbb', '.bb.', '.bb.'], W / 2 - 42, H / 2 - 28, { b: '#c8962a' }, 6);

          // Clash spark
          c.globalAlpha = 0.35 + 0.25 * Math.sin(api.t * 9);
          g.rect(W / 2 - 14, H / 2 - 10, 28, 18, '#c8962a'); c.globalAlpha = 1;

          // Power bar
          var bx = W / 2 - 8, by = H - 94, bh = 72;
          g.rect(bx, by, 16, bh, '#0e1a0a');
          g.rect(bx, by, 16, bh * 0.28, 'rgba(93,255,143,.20)');
          var pwr = this.power;
          g.rect(bx, by + bh * (1 - pwr), 16, bh * pwr, pwr > 0.72 ? '#5dff8f' : pwr > 0.32 ? api.colors.gold : '#8b2a0a');
          g.rect(bx - 5, by + bh * (1 - pwr) - 2, 26, 4, '#f0e8c8');

          api.topBar("GRENDEL'S GRIP");
          api.txt('ROUNDS ' + this.rounds + '/' + this.need, 6, 20, 8, api.colors.gold);
          api.txt('TAP!', W / 2, 20, 8, '#f0e8c8');
          for (var di = 0; di < this.need; di++) {
            g.circle(W - 18 - di * 14, 8, 4, di < this.rounds ? '#5dff8f' : '#1a2a14');
          }
        },
      },

      // ═══════════════════ DEED 3 — THE MERE ═══════════════════════════
      {
        id: 'mere', name: 'THE MERE', sub: "GRENDEL'S MOTHER",
        icon: function (api, x, y) {
          var g = api.gfx;
          g.rect(x - 1, y - 11, 2, 20, '#c8962a');
          g.rect(x - 6, y - 6, 12, 2, '#c8962a');
          g.rect(x - 2, y + 9, 4, 4, '#4a6a28');
        },
        intro: [
          "GRENDEL'S MOTHER DRAGS",
          "KING HROTHGAR'S COUNSELLOR",
          'INTO THE BLOOD-DARK MERE.',
          'Beowulf dives with the sword Hrunting.',
        ],
        quote: 'He saw the mighty water-witch. He swung the sword, held nothing back, and the blade sang against her head.',
        help: 'TAP when the ring meets the heart — strike six times',
        winText: 'An ancient blade from the armory gleams. One true stroke and the troll-wife falls. The mere clears.',
        loseText: 'Nerve breaks. The sword arm falters. The mere claims Beowulf in its cold grip.',

        init: function (api) {
          this.ring = 54;
          this.dir = -1;
          this.spd = 1.0;
          this.strikes = 0;
          this.need = 6;
          this.bad = 0;
          this.maxBad = 5;
          this.targetR = 12;
          this.zone = 7;
        },
        update: function (api, dt) {
          var f = dt * 60;
          this.ring += this.dir * this.spd * f;
          if (this.ring < 6)  { this.ring = 6;  this.dir = 1; }
          if (this.ring > 58) { this.ring = 58; this.dir = -1; }

          if (api.confirm()) {
            if (Math.abs(this.ring - this.targetR) < this.zone) {
              this.strikes++;
              api.score += 25;
              api.audio.sfx('power'); api.shake(5, 0.25);
              api.burst(api.W / 2, api.H / 2, api.colors.gold, 14);
              api.flash('#2a1808', 0.14);
              this.spd = Math.min(2.4, this.spd + 0.22);
              this.zone = Math.max(5, this.zone - 0.5);
              if (this.strikes >= this.need) { api.score += 80; api.win(); return; }
            } else {
              this.bad++;
              api.audio.sfx('hurt'); api.shake(4, 0.18);
              if (this.bad >= this.maxBad) { api.lose(); }
            }
          }
          api.score = this.strikes * 25;
        },
        draw: function (api) {
          var g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          var bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#021018'); bg.addColorStop(1, '#010810');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);
          // Murk wisps
          for (var i = 0; i < 12; i++) {
            var bx = (i * 59 + Math.floor(api.t * 12)) % W;
            var byt = (i * 43 + Math.floor(api.t * 18)) % H;
            c.globalAlpha = 0.06; g.rect(bx, byt, 22, 5, '#1a6a3a'); c.globalAlpha = 1;
          }
          // Grendel's Mother — shadow at top
          g.sprite([
            '.kkkkkkk.',
            'kkkkkkkkkk',
            'kk.kk.kkkk',
            '.kkkkkkkk.',
            '..k.....k.',
            '..kk...kk.',
          ], W / 2 - 40, 36, { k: '#0e2a18' }, 8);
          g.circle(W / 2 - 12, 58, 5, '#00dd5a');
          g.circle(W / 2 + 12, 58, 5, '#00dd5a');

          // HP pips
          for (var pi = 0; pi < this.need; pi++) {
            g.circle(W / 2 - (this.need - 1) * 10 + pi * 20, H - 82, 5, pi < this.strikes ? '#5dff8f' : '#1a3a28');
          }

          // Center fight zone
          var cx = W / 2, cy = H / 2 + 22;
          var hp = this.targetR + Math.sin(api.t * 6) * 1.5;
          g.circle(cx, cy, hp, '#1a4a28');
          g.circle(cx, cy, 5, api.colors.gold);
          // Closing ring
          var inZone = Math.abs(this.ring - this.targetR) < this.zone;
          c.strokeStyle = inZone ? '#5dff8f' : '#f0e8c8';
          c.lineWidth = 2;
          c.beginPath(); c.arc(cx, cy, this.ring, 0, Math.PI * 2); c.stroke();
          // Sword
          g.rect(cx - 1, cy + 30, 2, 18, '#c8962a');
          g.rect(cx - 6, cy + 34, 12, 2, '#c8962a');

          api.topBar('THE MERE');
          api.txt('STRIKE ' + this.strikes + '/' + this.need, 6, 20, 8, api.colors.gold);
          api.txt('NERVE ' + (this.maxBad - this.bad), W - 72, 20, 8, this.bad > 2 ? '#8b2a0a' : '#6a8858');
        },
      },

      // ═══════════════════ DEED 4 — THE FIRE DRAKE ════════════════════
      {
        id: 'fire-drake', name: 'THE FIRE DRAKE', sub: 'FIFTY YEARS LATER',
        icon: function (api, x, y) {
          var g = api.gfx;
          g.sprite(['.dd.', 'dddff', '.ddf', '..d.'], x - 10, y - 8, { d: '#c8962a', f: '#ff7a28' }, 4);
        },
        intro: [
          'A THIEF WAKES THE DRAGON.',
          'THE FIRE DRAKE BURNS',
          'ALL THE GEAT LANDS.',
          'Old Beowulf takes up his iron shield.',
        ],
        quote: 'The king of the Geats would await his fate, great-hearted as he had always been, undaunted.',
        help: 'TAP top or bottom to pick a lane · Tap center to STRIKE when the dragon opens',
        winText: "Sword finds the scale-gap. The great wyrm coils and falls. Beowulf's last deed is done.",
        loseText: "The dragon's venom finds its mark. The old king falls, but not in shame.",

        init: function (api) {
          this.lane = 1;
          this.phase = 'rest';
          this.phaseT = 1.4;
          this.breathLane = 1;
          this.hits = 0;
          this.need = 8;
          this.lives = 3;
          this.hitCool = 0;
          this.cycle = 0;
          this.fire = [];
        },
        update: function (api, dt) {
          var f = dt * 60;
          this.phaseT -= dt;
          this.hitCool = Math.max(0, this.hitCool - dt);

          // Input: tap top 1/3 = go lane up, bottom 1/3 = go lane down
          // tap middle = strike (when open phase)
          if (api.pointer.justDown) {
            if (this.phase === 'open') {
              // any tap = strike
              this._doStrike(api);
            } else {
              var py = api.pointer.y, H3 = api.H / 3;
              if      (py < H3)     this.lane = Math.max(0, this.lane - 1);
              else if (py > H3 * 2) this.lane = Math.min(2, this.lane + 1);
              else                  this.lane = 1;
            }
          }
          if (api.keyPressed('up'))   this.lane = Math.max(0, this.lane - 1);
          if (api.keyPressed('down')) this.lane = Math.min(2, this.lane + 1);
          if (api.keyPressed('a') && this.phase === 'open') this._doStrike(api);

          // Phase state machine
          if (this.phaseT <= 0) {
            if (this.phase === 'rest') {
              this.phase = 'warn'; this.breathLane = api.rint(0, 2);
              this.phaseT = 0.85; api.audio.sfx('blip');
            } else if (this.phase === 'warn') {
              this.phase = 'breathe'; this.phaseT = 0.65;
              for (var fi = 0; fi < 10; fi++) {
                this.fire.push({
                  x: api.W - 50,
                  y: 80 + this.breathLane * 124 + api.rnd(-14, 14),
                  vx: -api.rnd(185, 265), vy: api.rnd(-18, 18), life: 0.68,
                });
              }
            } else if (this.phase === 'breathe') {
              if (this.hitCool <= 0 && this.lane === this.breathLane) {
                this.lives--; this.hitCool = 1.4;
                api.shake(8, 0.4); api.flash('#ff4a08', 0.28); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
              this.phase = 'open';
              this.phaseT = Math.max(0.85, 1.5 - this.cycle * 0.06);
            } else if (this.phase === 'open') {
              this.phase = 'rest'; this.phaseT = 0.9;
            }
          }

          for (var fp = 0; fp < this.fire.length; fp++) {
            this.fire[fp].x += this.fire[fp].vx * dt;
            this.fire[fp].y += this.fire[fp].vy * dt;
            this.fire[fp].life -= dt;
          }
          this.fire = this.fire.filter(function (p) { return p.life > 0; });
          api.score = this.hits * 20;
        },
        _doStrike: function (api) {
          this.hits++; api.score += 20;
          api.audio.sfx('power'); api.shake(5, 0.28);
          api.burst(api.W - 60, api.H / 2, '#ff7a28', 14);
          if (this.hits >= this.need) { api.score += 60; api.win(); return; }
          this.phase = 'rest'; this.phaseT = 0.85; this.cycle++;
        },
        draw: function (api) {
          var g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#0e0a04');
          c.fillStyle = '#181008'; c.fillRect(0, H - 34, W, 34);
          // Burning embers
          for (var ei = 0; ei < 5; ei++) {
            var ex = (ei * 52 + Math.floor(api.t * 28)) % W;
            c.globalAlpha = 0.12; c.fillStyle = '#ff4a08';
            c.beginPath(); c.ellipse(ex, H - 20, 11, 16, 0, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          }
          // 3 lanes
          var laneY = [30, 162, 294], laneH = 100;
          for (var li = 0; li < 3; li++) {
            var ly = laneY[li];
            c.globalAlpha = 0.08;
            g.rect(0, ly, W - 58, laneH, li === this.lane ? '#c8962a' : '#1a1208');
            c.globalAlpha = 1;
            g.rect(0, ly - 1, W - 58, 1, '#2a1808');
          }
          // Warn glow
          if (this.phase === 'warn') {
            var wy = laneY[this.breathLane] + laneH / 2;
            c.globalAlpha = 0.48 + 0.38 * Math.sin(api.t * 20);
            g.rect(0, wy - 12, W - 58, 24, 'rgba(255,74,8,.45)');
            c.globalAlpha = 1;
          }
          // Fire particles
          for (var fp = 0; fp < this.fire.length; fp++) {
            var fpt = this.fire[fp];
            c.globalAlpha = fpt.life * 1.4;
            g.circle(fpt.x, fpt.y, 6 + fpt.life * 6, '#ff7a28');
            g.circle(fpt.x + 4, fpt.y, 3, '#ffaa30');
            c.globalAlpha = 1;
          }
          // Dragon
          var dOff = this.phase === 'open' ? 5 : 0;
          g.sprite([
            '...ddd...',
            '..ddddd..',
            '.dddddff.',
            'ddddddfff',
            '.dddddff.',
            '..ddddd..',
            '...ddd...',
            '....dd...',
          ], W - 78 + dOff, H / 2 - 50, { d: '#2a5a18', f: '#ff7a28' }, 9);
          g.circle(W - 34, H / 2 - 16, 5, '#ff2808');
          if (this.phase === 'open') {
            api.txtC('STRIKE!', W / 2 - 30, H / 2 - 4, 9, '#5dff8f');
          }
          // Beowulf in current lane
          var pl = laneY[this.lane] + laneH / 2 - 14;
          g.sprite(['.bb.', 'bbbb', '.bb.', '.bb.'], 10, pl, { b: '#c8962a' }, 6);
          g.circle(10 + 24, pl + 12, 12, '#1a3a5a');
          g.circle(10 + 24, pl + 12, 8, '#2a5a82');

          api.topBar('THE FIRE DRAKE');
          api.txt('STRIKES ' + this.hits + '/' + this.need, 6, 20, 8, api.colors.gold);
          for (var vi = 0; vi < 3; vi++) g.rect(W - 54 + vi * 17, 3, 11, 10, vi < this.lives ? '#5dff8f' : '#1a1408');
        },
      },

      // ═══════════════════ DEED 5 — WIGLAF'S STAND ════════════════════
      {
        id: 'wiglaf', name: "WIGLAF'S STAND", sub: 'HOLD THE SHIELD WALL',
        icon: function (api, x, y) {
          var g = api.gfx;
          g.circle(x, y, 9, '#1a3a5a');
          g.circle(x, y, 6, '#2a5a82');
          g.rect(x - 1, y - 9, 2, 18, '#c8962a');
          g.rect(x - 9, y - 1, 18, 2, '#c8962a');
        },
        intro: [
          'BEOWULF AND WIGLAF CHARGE',
          'THE WOUNDED FIRE DRAKE.',
          'TOGETHER THEY HOLD THE LINE.',
          'The last shield wall must not break.',
        ],
        quote: 'Let the bold man who can win glory before death — that is the finest memorial for a dead man.',
        help: 'TAP the flashing shield sector or use arrow keys to block each blow',
        winText: 'The shield wall holds! One last roar — the wyrm falls. The deed is done.',
        loseText: 'A blow breaks through. The shield wall shatters. The Geats weep for their king.',

        init: function (api) {
          this.timer = 24;
          this.blows = [];
          this.spawnT = 1.5;
          this.blocked = 0;
          this.missed = 0;
          this.maxMiss = 8;
          this.elapsed = 0;
          this.sectors = [
            { x: api.W / 2, y: 56,          label: '▲', key: 'up'    },
            { x: api.W - 46, y: api.H / 2,  label: '▶', key: 'right' },
            { x: api.W / 2, y: api.H - 58,  label: '▼', key: 'down'  },
            { x: 46,         y: api.H / 2,   label: '◀', key: 'left'  },
          ];
        },
        update: function (api, dt) {
          this.timer -= dt;
          this.elapsed += dt;
          this.spawnT -= dt;

          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.46, 1.5 - this.elapsed / 52);
            var blowLife = Math.max(0.72, 1.5 - this.elapsed / 42);
            this.blows.push({ si: api.rint(0, 3), t: blowLife, maxT: blowLife });
            api.audio.sfx('blip');
          }

          // Age blows
          var _self = this;
          for (var bi = 0; bi < this.blows.length; bi++) {
            this.blows[bi].t -= dt;
            if (this.blows[bi].t <= 0) {
              this.missed++;
              api.shake(5, 0.24); api.flash(api.colors.blood, 0.16); api.audio.sfx('hurt');
              if (this.missed >= this.maxMiss) { api.lose(); return; }
            }
          }
          this.blows = this.blows.filter(function (b) { return b.t > 0; });

          // Pointer: find nearest sector
          if (api.pointer.justDown) {
            var px = api.pointer.x, py = api.pointer.y;
            for (var si = 0; si < this.sectors.length; si++) {
              var s = this.sectors[si];
              if (Math.hypot(px - s.x, py - s.y) < s.r + 16) { this._block(si, api); break; }
            }
          }
          // Arrow keys
          for (var ki = 0; ki < this.sectors.length; ki++) {
            if (api.keyPressed(this.sectors[ki].key)) this._block(ki, api);
          }

          if (this.timer <= 0) { api.score += 80; api.win(); }
          api.score = this.blocked * 8 + Math.floor(Math.max(0, 24 - this.timer));
        },
        _block: function (si, api) {
          var idx = -1;
          for (var i = 0; i < this.blows.length; i++) {
            if (this.blows[i].si === si) { idx = i; break; }
          }
          if (idx >= 0) {
            this.blows.splice(idx, 1);
            this.blocked++;
            api.burst(this.sectors[si].x, this.sectors[si].y, api.colors.gold, 10);
            api.audio.sfx('coin');
          }
        },
        draw: function (api) {
          var g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#0a0e06');
          c.fillStyle = '#0e1408'; c.fillRect(0, H - 46, W, 46);
          // Outer ring
          c.strokeStyle = '#2a4a18'; c.lineWidth = 2;
          c.beginPath(); c.arc(W / 2, H / 2, 88, 0, Math.PI * 2); c.stroke();
          c.strokeStyle = '#3a6a24'; c.lineWidth = 1;
          c.beginPath(); c.arc(W / 2, H / 2, 56, 0, Math.PI * 2); c.stroke();

          // Sector buttons
          var R = 26;
          for (var si = 0; si < this.sectors.length; si++) {
            var s = this.sectors[si];
            s.r = R;
            var blow = null;
            for (var bi = 0; bi < this.blows.length; bi++) {
              if (this.blows[bi].si === si) { blow = this.blows[bi]; break; }
            }
            var hot = blow !== null;
            c.globalAlpha = hot ? 0.92 : 0.32;
            g.circle(s.x, s.y, R, hot ? '#6a1808' : '#142408');
            g.circle(s.x, s.y, R - 5, hot ? '#b82a14' : '#1e3a10');
            c.globalAlpha = 1;
            if (hot && blow) {
              var urgR = R + 8 + (1 - blow.t / blow.maxT) * 14;
              c.globalAlpha = 0.52; c.strokeStyle = '#ff4a08'; c.lineWidth = 2;
              c.beginPath(); c.arc(s.x, s.y, urgR, 0, Math.PI * 2); c.stroke();
              c.globalAlpha = 1;
            }
            api.txtC(s.label, s.x, s.y - 6, 12, hot ? '#ffcc40' : '#4a6a38');
          }

          // Center shield
          g.circle(W / 2, H / 2, 24, '#1a3a5a');
          g.circle(W / 2, H / 2, 16, '#2a5a82');
          g.rect(W / 2 - 1, H / 2 - 20, 2, 40, api.colors.gold);
          g.rect(W / 2 - 14, H / 2 - 1, 28, 2, api.colors.gold);

          api.topBar("WIGLAF'S STAND");
          api.txt('BLOCKED ' + this.blocked, 6, 20, 8, api.colors.gold);
          g.rect(6, H - 10, W - 12, 6, '#0e1a0a');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 24, 0, 1), 6, api.colors.gold);
          for (var mi = 0; mi < this.maxMiss; mi++) {
            g.rect(W - 148 + mi * 18, 3, 12, 10, mi < this.missed ? '#8b2a0a' : '#1a3a14');
          }
        },
      },

    ],
  });
})();
