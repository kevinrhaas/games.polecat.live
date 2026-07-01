/* ============================================================================
 * THE GREAT GATSBY — A TALE IN FIVE SCENES
 *   1. WEST EGG PARTY     — catch falling notes (rhythm / collect)
 *   2. THE YELLOW ROADSTER — dodge oncoming traffic (lane dodge)
 *   3. THE GREEN LIGHT     — expanding ring timing (precision)
 *   4. THE PLAZA HOTEL     — tension balance bar (hold your ground)
 *   5. VALLEY OF ASHES     — dodge ash & Wilson shadow (free-move dodge)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ============================= EMBLEM ================================= */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    c.globalAlpha = 0.12; g.circle(cx, cy, 44, '#00cc66');
    c.globalAlpha = 0.22; g.circle(cx, cy, 30, '#00cc66');
    c.globalAlpha = 1;
    g.rect(cx - 3, cy + 12, 6, 28, '#8a7a5a');
    g.rect(cx - 10, cy + 4, 20, 10, '#3a5a3a');
    g.rect(cx - 8, cy - 8, 16, 14, '#4a7a4a');
    g.circle(cx, cy, 11, '#00cc66');
    g.circle(cx, cy, 7, '#44ffaa');
    g.circle(cx - 2, cy - 2, 3, '#aaffcc');
    c.globalAlpha = 0.28; c.strokeStyle = '#00cc66'; c.lineWidth = 1;
    c.beginPath(); c.arc(cx, cy, 17, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = 0.13;
    c.beginPath(); c.arc(cx, cy, 26, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = 1;
  }

  /* ============================= SCENERY ================================ */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Night sky over Long Island Sound
    var sky = c.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, '#020112'); sky.addColorStop(0.6, '#050320'); sky.addColorStop(1, '#0a0830');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // Stars
    for (var si = 0; si < 52; si++) {
      var sx = (si * 71 + 13) % W, sy = (si * 43 + 7) % Math.floor(H * 0.48);
      c.globalAlpha = 0.15 + 0.35 * Math.sin(t * 1.3 + si * 0.8);
      g.rect(sx, sy, 1, 1, '#f0e8c8');
    }
    c.globalAlpha = 1;

    // Long Island Sound water
    c.fillStyle = '#060c1c'; c.fillRect(0, H * 0.52, W, H * 0.48);
    for (var wi = 0; wi < 7; wi++) {
      c.globalAlpha = 0.06 + 0.04 * Math.sin(t * 2 + wi * 1.1);
      g.rect(8 + (wi * 43) % (W - 40), H * 0.56 + wi * 13, 28 + (wi * 17) % 32, 2, '#1e3a5a');
    }
    c.globalAlpha = 1;

    // Gatsby's West Egg mansion (left silhouette)
    c.fillStyle = '#0c0a1e'; c.fillRect(0, H * 0.26, 86, H * 0.74);
    c.fillStyle = '#100e28'; c.fillRect(8, H * 0.22, 72, H * 0.78);
    var wins = [[14, H*0.28], [36, H*0.28], [58, H*0.28], [14, H*0.37], [58, H*0.37], [36, H*0.46]];
    for (var wj = 0; wj < wins.length; wj++) {
      c.globalAlpha = 0.45 + 0.2 * Math.sin(t * 2.5 + wins[wj][0]);
      g.rect(wins[wj][0], wins[wj][1], 8, 10, '#d4a017');
    }
    c.globalAlpha = 1;
    for (var col = 0; col < 4; col++) g.rect(10 + col * 18, H * 0.3, 3, H * 0.7, '#0c0a1c');

    // Daisy's green dock light (right, across bay)
    var glx = W - 36, gly = H * 0.50;
    c.globalAlpha = 0.14 + 0.10 * Math.sin(t * 2.4); g.circle(glx, gly, 26, '#00cc66');
    c.globalAlpha = 0.28 + 0.10 * Math.sin(t * 2.4); g.circle(glx, gly, 16, '#00cc66');
    c.globalAlpha = 1;
    g.circle(glx, gly, 8, '#00cc66'); g.circle(glx, gly, 5, '#44ffaa');
    g.rect(glx - 2, gly + 8, 4, 20, '#8a7a5a');
    for (var ri = 0; ri < 4; ri++) {
      c.globalAlpha = (0.12 - ri * 0.025) * (0.8 + 0.2 * Math.sin(t * 3 + ri));
      g.rect(glx - 3 + ri, gly + 20 + ri * 8, 7 - ri * 2, 3, '#00cc66');
    }
    c.globalAlpha = 1;

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(4,2,16,.72)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // Dark lacquered table overlay
      c.fillStyle = 'rgba(4,2,12,.52)'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#080620'; c.fillRect(0, H * 0.56, W, H * 0.44);
      c.strokeStyle = '#d4a017'; c.lineWidth = 1; c.globalAlpha = 0.35;
      c.beginPath(); c.moveTo(0, H * 0.56); c.lineTo(W, H * 0.56); c.stroke();
      // Art deco diamond row along table edge
      for (var di = 0; di < 7; di++) {
        var dx = 16 + di * 38;
        c.globalAlpha = 0.12;
        c.beginPath(); c.moveTo(dx, H * 0.56); c.lineTo(dx + 9, H * 0.56 + 9);
        c.lineTo(dx, H * 0.56 + 18); c.lineTo(dx - 9, H * 0.56 + 9); c.closePath(); c.stroke();
      }
      c.globalAlpha = 1;
    }
  }

  /* ============================= GAME ================================== */
  RetroSaga.create({
    id: 'gatsby',
    title: 'The Green Light',
    subtitle: 'A TALE IN FIVE SCENES',
    currency: 'GLAMOUR',

    screens: {
      win: '#00cc66', lose: '#880011',
      chapterLabel: '#9a8a5a', name: '#f5e6c8',
      sub: '#d4a017', intro: '#e8d4a0',
      quote: '#9a8a5a', help: '#d4a017',
      score: '#f5e6c8', cur: '#d4a017',
      cta: '#f5e6c8', overlay: 'rgba(4,2,16,.88)',
    },
    labels: {
      chapter: 'SCENE', score: 'GLAMOUR EARNED',
      win: 'OLD SPORT, WELL DONE', lose: 'THE DREAM SLIPS AWAY',
      cont: 'TAP TO CONTINUE', finale: 'TAP FOR THE FINALE',
      toMenu: 'RETURN TO WEST EGG', play: 'TAP TO BEGIN',
    },

    accent: '#d4a017',
    credit: 'AFTER F. SCOTT FITZGERALD, 1925',
    emblem: emblem,
    scenery: scenery,
    bootCta: 'TAP TO ENTER',
    menuLabel: "GATSBY'S INVITATION LIST",
    menuHint: 'CHOOSE YOUR SCENE',
    menuDone: 'THE DREAM IS COMPLETE',

    menu: {
      colors: { title: '#d4a017', label: '#9a8a5a', cur: '#f5e6c8' },
      // Scattered cocktail invitation cards — 2-1-2 diamond arrangement
      layout: function (api) {
        return [
          { x: 14,  y: 126, w: 100, h: 68 },
          { x: 156, y: 116, w: 100, h: 68 },
          { x: 85,  y: 218, w: 100, h: 68 },
          { x: 14,  y: 316, w: 100, h: 68 },
          { x: 156, y: 306, w: 100, h: 68 },
        ];
      },
      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done;
        var cx = x + w / 2, cy = y + h / 2;
        var rots = [-0.16, 0.11, -0.06, 0.13, -0.09];
        var rot = rots[i] || 0;

        c.save();
        c.translate(cx, cy); c.rotate(rot); c.translate(-cx, -cy);

        // Card body
        c.fillStyle = sel ? '#1a1444' : '#0c0a22';
        c.fillRect(x, y, w, h);
        // Outer gold border
        c.strokeStyle = sel ? '#d4a017' : '#4a3a18';
        c.lineWidth = sel ? 2 : 1;
        c.strokeRect(x + 1, y + 1, w - 2, h - 2);
        // Inner border
        c.globalAlpha = 0.38;
        c.strokeStyle = sel ? '#d4a017' : '#2a220e';
        c.lineWidth = 1;
        c.strokeRect(x + 4, y + 4, w - 8, h - 8);
        c.globalAlpha = 1;

        // Green wax seal (top-right corner)
        g.circle(x + w - 11, y + 11, 8, done ? '#005a28' : (sel ? '#013a16' : '#020a06'));
        g.circle(x + w - 11, y + 11, 5, done ? '#00cc66' : (sel ? '#007a30' : '#033a14'));
        if (done) {
          api.txtC('✦', x + w - 11, y + 7, 7, '#f5e6c8');
        } else {
          api.txtC('G', x + w - 11, y + 7, 6, '#d4a017');
        }

        // Chapter name
        api.txtCFit(ch.name, cx, y + 22, 8, done ? '#d4a017' : (sel ? '#f5e6c8' : '#b8a870'), false, w - 22);
        if (ch.sub) api.txtCFit(ch.sub, cx, y + 37, 6, '#9a8a5a', false, w - 18);
        // Scene number
        api.txtC('SCENE ' + (i + 1), cx, y + h - 15, 6, sel ? '#d4a017' : '#4a3a28');

        c.restore();
      },
    },

    finale: ['THE LIGHT IS OUT.', 'THE PARTIES ARE DONE.', '', 'BUT THE DREAM', 'WAS BEAUTIFUL', 'WHILE IT LASTED.'],

    width: 270, height: 480, parent: '#game',
    palette: { gold: '#d4a017', green: '#00cc66', cream: '#f5e6c8', blood: '#cc2244' },

    chapters: [

      /* =================== 1. WEST EGG PARTY ========================= */
      {
        id: 'party', name: 'WEST EGG PARTY', sub: 'CATCH THE BEAT',
        icon: function (api, x, y) {
          var g = api.gfx;
          g.rect(x - 4, y - 8, 8, 6, '#d4a017');
          g.rect(x - 1, y - 2, 2, 6, '#c8960e');
          g.rect(x - 4, y + 4, 8, 2, '#d4a017');
        },
        intro: ['EVERY FRIDAY EVENING,', 'YELLOW COCKTAILS FLOAT', 'AND JAZZ RINGS OUT', 'at Gatsby\'s great house.'],
        quote: 'In his blue gardens men and girls came and went like moths among the whisperings.',
        help: 'Move LEFT/RIGHT to catch the falling glasses',
        winText: 'The music plays on till dawn. Old sport, you were born for this.',
        loseText: 'The notes crash to the floor. The party stumbles to silence.',
        init: function (api) {
          this.paddle = api.W / 2;
          this.notes = [];
          this.caught = 0;
          this.missed = 0;
          this.need = 15;
          this.maxMiss = 5;
          this.spawnT = 1.4;
          this.noteSpd = 86;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          // Move paddle
          if (api.keyDown('left')) this.paddle -= 160 * dt;
          if (api.keyDown('right')) this.paddle += 160 * dt;
          if (api.pointer.down) this.paddle = api.pointer.x;
          this.paddle = clamp(this.paddle, 22, W - 22);

          // Spawn notes in 3 columns
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            var cols = [54, 135, 216];
            this.notes.push({ x: cols[api.rint(0, 2)], y: -14 });
            this.spawnT = Math.max(1.2, 2.0 - api.t * 0.027);
          }

          // Move notes and check catches / misses
          var padY = H - 54, padHW = 30;
          for (var i = this.notes.length - 1; i >= 0; i--) {
            var n = this.notes[i];
            n.y += this.noteSpd * dt;
            if (n.y > padY && n.y < padY + 22) {
              if (Math.abs(n.x - this.paddle) < padHW + 8) {
                this.caught++;
                api.addScore(20);
                api.burst(n.x, padY, '#d4a017', 8);
                api.audio.sfx('coin');
                this.notes.splice(i, 1);
                if (this.caught >= this.need) { api.addScore(60); api.win(); }
              }
            } else if (n.y > H + 12) {
              this.missed++;
              api.shake(4, 0.18);
              api.audio.sfx('hurt');
              this.notes.splice(i, 1);
              if (this.missed >= this.maxMiss) api.lose();
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#040214');

          // Dance floor tiles
          for (var fy = H - 80; fy < H; fy += 18) {
            for (var fx = 0; fx < W; fx += 18) {
              var dark = ((Math.floor(fy / 18) + Math.floor(fx / 18)) % 2) === 0;
              g.rect(fx, fy, 18, 18, dark ? '#06042a' : '#0e0c3a');
            }
          }

          // Ceiling spotlights
          var lColors = ['#cc2244', '#d4a017', '#4488cc', '#00cc66', '#8844cc'];
          for (var li = 0; li < 5; li++) {
            var lx = 22 + li * 56;
            var flicker = 0.5 + 0.5 * Math.sin(api.t * (7 + li) + li * 1.9);
            c.globalAlpha = 0.09 * flicker; g.circle(lx, 18, 20, lColors[li]);
            c.globalAlpha = 0.32 * flicker; g.circle(lx, 20, 3, lColors[li]);
            c.globalAlpha = 1; g.rect(lx, 0, 1, 20, '#181840');
          }

          // Lane dividers
          g.rect(89, 0, 1, H - 80, '#16134a');
          g.rect(179, 0, 1, H - 80, '#16134a');

          // Falling champagne glasses
          for (var ni = 0; ni < this.notes.length; ni++) {
            var n = this.notes[ni];
            g.rect(n.x - 5, n.y - 10, 10, 7, '#d4a017');
            g.rect(n.x - 3, n.y - 3, 6, 7, '#c09010');
            g.rect(n.x - 5, n.y + 4, 10, 2, '#d4a017');
            g.rect(n.x - 1, n.y - 10, 2, 2, '#f5e6c8');
          }

          // Catch tray (champagne tray)
          var py = H - 58;
          g.rect(this.paddle - 30, py, 60, 5, '#c8a820');
          g.rect(this.paddle - 28, py + 1, 56, 3, '#e8c840');
          g.rectO(this.paddle - 30, py, 60, 5, '#f5e6c8', 1);

          // HUD
          api.topBar('WEST EGG PARTY');
          api.txt('CAUGHT ' + this.caught + '/' + this.need, 6, 20, 9, '#d4a017');
          for (var mi = 0; mi < this.maxMiss; mi++) {
            g.rect(W - 18 - mi * 14, 20, 8, 8, mi < this.missed ? '#440014' : '#cc2244');
          }
          api.vignette();
        },
      },

      /* =================== 2. THE YELLOW ROADSTER ===================== */
      {
        id: 'roadster', name: 'YELLOW ROADSTER', sub: 'DRIVE TO THE CITY',
        icon: function (api, x, y) {
          var g = api.gfx;
          g.rect(x - 7, y - 2, 14, 5, '#e8c030');
          g.rect(x - 5, y - 5, 10, 4, '#e8c030');
          g.circle(x - 4, y + 4, 2, '#101010');
          g.circle(x + 4, y + 4, 2, '#101010');
        },
        intro: ['GATSBY\'S CREAM-YELLOW', 'CAR ROARS DOWN LONG', 'ISLAND\'S HIGHWAY.', 'Nick grips the door.'],
        quote: 'He drove with a sort of concentrated intensity, like a man being pursued.',
        help: 'TAP lanes or LEFT/RIGHT arrow · dodge traffic · 3 lives',
        winText: 'The Plaza rises ahead. You burned every mile, old sport.',
        loseText: 'The yellow car crumples on the roadside. The city recedes.',
        init: function (api) {
          this.lane = 1;
          this.lanes = [54, 135, 216];
          this.lives = 3;
          this.obs = [];
          this.spawnT = 1.8;
          this.roadY = 0;
          this.hit = false;
          this.hitT = 0;
          this.dur = 26;
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;
          this.roadY = (this.roadY + 180 * dt) % 40;

          // Lane change
          if (api.keyPressed('left')) { this.lane = Math.max(0, this.lane - 1); api.audio.sfx('blip'); }
          if (api.keyPressed('right')) { this.lane = Math.min(2, this.lane + 1); api.audio.sfx('blip'); }
          if (api.pointer.justDown) {
            var px = api.pointer.x;
            var nl = px < W / 3 ? 0 : px < 2 * W / 3 ? 1 : 2;
            if (nl !== this.lane) { this.lane = nl; api.audio.sfx('blip'); }
          }

          // Spawn obstacles
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(1.2, 2.2 - api.t * 0.038);
            var isGreen = api.chance(0.22) && api.t > 4;
            this.obs.push({ lane: api.rint(0, 2), y: -26, type: isGreen ? 'light' : 'car' });
          }

          var spd = 140 + api.t * 3;
          for (var oi = 0; oi < this.obs.length; oi++) this.obs[oi].y += spd * dt;

          if (this.hit) { this.hitT -= dt; if (this.hitT <= 0) this.hit = false; }

          // Collisions
          for (var i = this.obs.length - 1; i >= 0; i--) {
            var o = this.obs[i];
            if (o.y > H - 64 && o.y < H - 16 && o.lane === this.lane) {
              if (o.type === 'car' && !this.hit) {
                this.lives--;
                this.hit = true; this.hitT = 0.85;
                api.shake(7, 0.3); api.flash('#cc2244', 0.2); api.audio.sfx('hurt');
                this.obs.splice(i, 1);
                if (this.lives <= 0) api.lose();
              } else if (o.type === 'light') {
                api.addScore(10);
                api.burst(this.lanes[o.lane], H - 44, '#00cc66', 8);
                api.audio.sfx('coin');
                this.obs.splice(i, 1);
              }
            } else if (o.y > H + 14) this.obs.splice(i, 1);
          }

          api.score = Math.floor(api.t * 4);
          if (api.t >= this.dur) { api.addScore(80 + this.lives * 20); api.win(); }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#080a14');

          // Road surface
          g.rect(18, 0, W - 36, H, '#161428');
          for (var ly = -40 + this.roadY; ly < H; ly += 40) {
            g.rect(85, ly, 3, 20, '#28244a'); g.rect(175, ly, 3, 20, '#28244a');
          }
          g.rect(0, 0, 18, H, '#0c0a1c'); g.rect(W - 18, 0, 18, H, '#0c0a1c');

          // Distant night skyline
          for (var bi = 0; bi < 6; bi++) {
            var bx = 20 + bi * 38, bh = 28 + (bi * 19) % 44;
            c.globalAlpha = 0.26; g.rect(bx, H * 0.18 - bh, 28, bh, '#14122a');
            c.globalAlpha = 0.36;
            for (var wyi = H * 0.18 - bh + 4; wyi < H * 0.18 - 4; wyi += 8) {
              if ((Math.floor(wyi) + bx) % 16 < 8) g.rect(bx + 4, wyi, 4, 4, '#d4a017');
            }
            c.globalAlpha = 1;
          }

          // Obstacles
          for (var oi = 0; oi < this.obs.length; oi++) {
            var o = this.obs[oi];
            var ox = this.lanes[o.lane];
            if (o.type === 'car') {
              g.rect(ox - 13, o.y - 22, 26, 40, '#7a0810');
              g.rect(ox - 9, o.y - 24, 18, 8, '#550608');
              g.rect(ox - 9, o.y + 16, 18, 6, '#ff4444');
              g.rect(ox - 12, o.y + 18, 4, 5, '#ffaaaa');
              g.rect(ox + 8, o.y + 18, 4, 5, '#ffaaaa');
            } else {
              c.globalAlpha = 0.26; g.circle(ox, o.y, 13, '#00cc66'); c.globalAlpha = 1;
              g.circle(ox, o.y, 7, '#00cc66'); g.circle(ox, o.y, 4, '#44ffaa');
              api.txtC('G', ox, o.y - 4, 7, '#f5e6c8');
            }
          }

          // Player's yellow roadster
          var carX = this.lanes[this.lane], carY = H - 62;
          var flashing = this.hit && (Math.floor(api.t * 12) % 2 === 0);
          var cc = flashing ? '#ffffff' : '#e8c030';
          g.rect(carX - 13, carY - 20, 26, 36, cc);
          g.rect(carX - 9, carY - 24, 18, 8, flashing ? '#ffffff' : '#d4b020');
          g.rect(carX - 9, carY + 14, 18, 6, '#ffee80');
          g.rect(carX - 11, carY - 22, 4, 7, '#8ab0d0');
          g.rect(carX + 7, carY - 22, 4, 7, '#8ab0d0');
          g.circle(carX - 8, carY + 18, 5, '#101010');
          g.circle(carX + 8, carY + 18, 5, '#101010');

          api.topBar('THE YELLOW ROADSTER');
          for (var li = 0; li < 3; li++) g.rect(8 + li * 16, 20, 10, 8, li < this.lives ? '#00cc66' : '#1c1838');
          g.rect(6, H - 14, W - 12, 6, '#1a1836');
          g.rect(6, H - 14, (W - 12) * Math.min(1, api.t / this.dur), 6, '#d4a017');
          api.txt(Math.ceil(this.dur - api.t) + 's', W - 30, 20, 9, '#d4a017');
          api.vignette();
        },
      },

      /* =================== 3. THE GREEN LIGHT ======================== */
      {
        id: 'greenlight', name: 'THE GREEN LIGHT', sub: 'REACH ACROSS THE BAY',
        icon: function (api, x, y) {
          var g = api.gfx, c = api.ctx;
          c.globalAlpha = 0.35; g.circle(x, y, 7, '#00cc66'); c.globalAlpha = 1;
          g.circle(x, y, 4, '#00cc66'); g.circle(x, y, 2, '#44ffaa');
        },
        intro: ['AT THE END OF DAISY\'S', 'DOCK, A GREEN LIGHT', 'PULSES IN THE NIGHT.', 'Gatsby reaches toward it.'],
        quote: 'He stretched out his arms toward the dark water in a single trembling gesture.',
        help: 'TAP when the ring glows GREEN around the light',
        winText: 'His fingers brush the light. For one moment, the dream is real.',
        loseText: 'The current pulls him back. The light pulses on, unanswered.',
        init: function (api) {
          this.strikes = 0;
          this.need = 6;
          this.miss = 0;
          this.maxMiss = 4;
          this.ringR = 0;
          this.ringSpd = 62;
          this.maxR = 216;
          this.armX = 58;
          this.armY = 258;
          this.lightX = api.W - 38;
          this.lightY = 202;
          // ring center is (armX, armY-14) = (58, 244)
          this.dist = Math.hypot(this.lightX - this.armX, this.lightY - (this.armY - 14));
          this.winLo = this.dist - 15;
          this.winHi = this.dist + 15;
          this.flashT = 0;
          this.flashC = '#00cc66';
        },
        update: function (api, dt) {
          this.ringR += this.ringSpd * dt;
          if (this.ringR > this.maxR) this.ringR = 0; // silent cycle reset
          if (this.flashT > 0) this.flashT -= dt;

          if (api.confirm()) {
            var inWin = this.ringR >= this.winLo && this.ringR <= this.winHi;
            if (inWin) {
              this.strikes++;
              api.addScore(30);
              api.burst(this.lightX, this.lightY, '#00cc66', 12);
              api.audio.sfx('power');
              this.flashT = 0.35; this.flashC = '#004422';
              this.ringR = 0;
              if (this.strikes >= this.need) { api.addScore(80); api.win(); }
            } else if (this.ringR > 8) {
              this.miss++;
              api.shake(4, 0.22);
              api.audio.sfx('hurt');
              this.flashT = 0.28; this.flashC = '#880011';
              if (this.miss >= this.maxMiss) api.lose();
            }
          }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#040216');

          // Night sky above the Sound
          var sky = c.createLinearGradient(0, 0, 0, H * 0.52);
          sky.addColorStop(0, '#020110'); sky.addColorStop(1, '#070820');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.52);
          for (var si = 0; si < 34; si++) {
            var sx = (si * 71 + 5) % W, sy = (si * 37 + 3) % Math.floor(H * 0.44);
            c.globalAlpha = 0.2 + 0.28 * Math.sin(api.t * 1.4 + si);
            g.rect(sx, sy, 1, 1, '#e8d8c0');
          }
          c.globalAlpha = 1;

          // Bay water
          c.fillStyle = '#050a1a'; c.fillRect(0, H * 0.52, W, H * 0.48);
          for (var wi = 0; wi < 5; wi++) {
            c.globalAlpha = 0.05 + 0.04 * Math.sin(api.t * 2 + wi);
            g.rect(8 + (wi * 53) % (W - 40), H * 0.57 + wi * 14, 22 + (wi * 21) % 28, 2, '#1e3a5a');
          }
          c.globalAlpha = 1;

          // Green dock light (far side)
          var lx = this.lightX, ly = this.lightY;
          c.globalAlpha = 0.10 + 0.09 * Math.sin(api.t * 3); g.circle(lx, ly, 28, '#00cc66');
          c.globalAlpha = 0.24 + 0.10 * Math.sin(api.t * 3); g.circle(lx, ly, 18, '#00cc66');
          c.globalAlpha = 1;
          g.circle(lx, ly, 9, '#00cc66'); g.circle(lx, ly, 5, '#44ffaa');
          g.rect(lx - 2, ly + 9, 4, 20, '#8a7a5a');

          // Gatsby silhouette on the dock (left)
          var ax = this.armX, ay = this.armY;
          g.rect(ax - 6, ay - 30, 12, 40, '#0e0c22');
          g.rect(ax - 5, ay - 44, 10, 14, '#c4a07a');
          // Outstretched arm pointing toward light
          var aTX = ax + 6 + Math.round(0.36 * (lx - ax));
          var aTY = (ay - 18) + Math.round(0.36 * (ly - (ay - 18)));
          c.strokeStyle = '#0c0a20'; c.lineWidth = 4;
          c.beginPath(); c.moveTo(ax + 6, ay - 18); c.lineTo(aTX, aTY); c.stroke();

          // Expanding ring
          if (this.ringR > 1) {
            var inWin = this.ringR >= this.winLo && this.ringR <= this.winHi;
            var pastWin = this.ringR > this.winHi;
            c.strokeStyle = inWin ? '#00ff88' : (pastWin ? '#661122' : '#d4a017');
            c.lineWidth = inWin ? 2.5 : 1.5;
            c.globalAlpha = inWin ? 0.9 : Math.max(0.2, 0.65 - this.ringR / this.maxR * 0.45);
            c.beginPath(); c.arc(ax, ay - 14, this.ringR, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }

          // Flash overlay on hit/miss
          if (this.flashT > 0) {
            c.globalAlpha = Math.min(0.38, this.flashT) * 1.2;
            c.fillStyle = this.flashC; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
          }

          api.topBar('THE GREEN LIGHT');
          api.txt('REACH ' + this.strikes + '/' + this.need, 6, 20, 9, '#d4a017');
          for (var mi = 0; mi < this.maxMiss; mi++) {
            g.rect(W - 18 - mi * 14, 20, 8, 8, mi < this.miss ? '#440014' : '#cc2244');
          }
          api.vignette();
        },
      },

      /* =================== 4. THE PLAZA HOTEL ======================== */
      {
        id: 'plaza', name: 'THE PLAZA HOTEL', sub: 'HOLD YOUR GROUND',
        icon: function (api, x, y) {
          var g = api.gfx;
          g.rect(x - 1, y - 8, 2, 10, '#d4a017');
          g.rect(x - 8, y - 1, 16, 2, '#d4a017');
          g.rect(x - 8, y + 2, 4, 5, '#cc2244');
          g.rect(x + 4, y + 2, 4, 5, '#00cc66');
        },
        intro: ['IN THE PLAZA HOTEL', 'SUITE, TOM BULLDOZES', 'IN. THE AIR GROWS', 'hot with accusations.'],
        quote: '"She never loved you, do you hear?" he cried. "She only married you..."',
        help: 'TAP to push back · keep the bar in the center · 24s',
        winText: 'Daisy weeps but you held the room. A draw, old sport.',
        loseText: 'Tom\'s certainty fills the suite. Daisy looks away.',
        init: function (api) {
          this.tension = 50;
          this.dur = 24;
          this.claims = [];
          this.claimT = 2.0;
          this.claimIdx = 0;
          this.tomLines = [
            "SHE'S MY WIFE!", "YOU'RE A NOBODY!", "YOU'RE COMMON!",
            "CRIMINAL!", "HER VOICE IS", "FULL OF MONEY!", "YOU'LL NEVER WIN!"
          ];
        },
        update: function (api, dt) {
          // Tom's drift toward 0 (left)
          var hasClaim = this.claims.some(function (cl) { return cl.life > 1.0; });
          var drift = 14 + (hasClaim ? 7 : 0);
          this.tension -= drift * dt;
          // Auto-bounce if Gatsby overcorrects
          if (this.tension > 83) this.tension -= 14 * dt;
          this.tension = clamp(this.tension, 0, 97);

          if (api.confirm()) {
            this.tension = Math.min(88, this.tension + 22);
            api.audio.sfx('blip');
          }

          if (this.tension <= 2) { api.lose(); return; }
          if (this.tension >= 95) { api.lose(); return; }

          // Tom's claim bubbles
          this.claimT -= dt;
          if (this.claimT <= 0) {
            this.claimT = 2.0 + api.rnd(0, 1.6);
            this.claims.push({
              text: this.tomLines[this.claimIdx % this.tomLines.length],
              life: 2.4,
              x: api.W * 0.26 + api.rnd(-10, 10),
              y: api.H * 0.30 + api.rnd(-14, 14)
            });
            this.claimIdx++;
          }
          for (var ci = 0; ci < this.claims.length; ci++) this.claims[ci].life -= dt;
          this.claims = this.claims.filter(function (cl) { return cl.life > 0; });

          api.score = Math.floor(api.t * 4) + Math.floor(50 - Math.abs(this.tension - 50));
          if (api.t >= this.dur) { api.addScore(80); api.win(); }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#080618');

          // Art deco wallpaper (diamond pattern)
          c.fillStyle = '#0c0a20'; c.fillRect(0, 0, W, H - 90);
          for (var wy = 0; wy < H - 90; wy += 22) {
            for (var wx = 0; wx < W; wx += 22) {
              c.globalAlpha = 0.045;
              c.strokeStyle = '#d4a017'; c.lineWidth = 0.5;
              c.beginPath();
              c.moveTo(wx + 11, wy); c.lineTo(wx + 22, wy + 11);
              c.lineTo(wx + 11, wy + 22); c.lineTo(wx, wy + 11); c.closePath(); c.stroke();
              c.globalAlpha = 1;
            }
          }

          // Floor
          c.fillStyle = '#120f28'; c.fillRect(0, H - 90, W, 90);

          // Tom (left) — navy suit
          g.rect(26, H - 152, 30, 68, '#1a1450');
          g.rect(28, H - 168, 26, 20, '#c4a07a');
          g.rect(56, H - 130, 22, 3, '#1a1450'); // pointing arm
          g.rect(76, H - 131, 4, 5, '#c4a07a');  // finger

          // Gatsby (right) — cream suit
          g.rect(W - 58, H - 152, 28, 68, '#d8c898');
          g.rect(W - 56, H - 168, 24, 20, '#c4a07a');

          // Tom's claim bubbles
          for (var ci = 0; ci < this.claims.length; ci++) {
            var cl = this.claims[ci];
            var alpha = Math.min(1, cl.life * 0.8) * 0.9;
            c.globalAlpha = alpha;
            c.fillStyle = '#1a0808'; c.fillRect(cl.x - 44, cl.y - 10, 90, 20);
            c.strokeStyle = '#cc2244'; c.lineWidth = 1;
            c.strokeRect(cl.x - 44, cl.y - 10, 90, 20);
            api.txtCFit(cl.text, cl.x, cl.y - 5, 7, '#ff4466', false, 86);
            c.globalAlpha = 1;
          }

          // Tension balance bar
          var bx = 22, by = H - 54, bw = W - 44, bh = 18;
          g.rect(bx, by, bw, bh, '#0c0a20');
          g.rect(bx, by, Math.round(bw * 0.27), bh, '#2a0a10');          // Tom's zone (left, red)
          g.rect(bx + Math.round(bw * 0.27), by, Math.round(bw * 0.46), bh, '#0a1c0a'); // safe center
          g.rect(bx + Math.round(bw * 0.73), by, Math.round(bw * 0.27), bh, '#2a0a10'); // over-push (right)
          var tx = bx + Math.round(bw * (this.tension / 100));
          var inZone = this.tension >= 27 && this.tension <= 73;
          g.rect(tx - 4, by - 3, 8, bh + 6, inZone ? '#d4a017' : '#cc2244');
          g.rectO(bx, by, bw, bh, '#3a2a18', 1);
          api.txtC('TOM', bx + Math.round(bw * 0.10), by + 5, 7, '#cc4444');
          api.txtC('GATSBY', bx + Math.round(bw * 0.76), by + 5, 7, '#44aa66');

          api.topBar('THE PLAZA HOTEL');
          var tLeft = Math.ceil(this.dur - api.t);
          api.txt('HOLD ' + tLeft + 's', 6, 20, 9, !inZone ? '#cc2244' : '#d4a017');
          api.vignette();
        },
      },

      /* =================== 5. VALLEY OF ASHES ======================= */
      {
        id: 'ashes', name: 'VALLEY OF ASHES', sub: 'OUTRUN THE SHADOWS',
        icon: function (api, x, y) {
          var g = api.gfx, c = api.ctx;
          c.globalAlpha = 0.7; g.circle(x, y, 7, '#3c3040');
          g.circle(x - 4, y + 2, 4, '#2c2030');
          g.circle(x + 4, y + 1, 5, '#2c2030'); c.globalAlpha = 1;
        },
        intro: ['THE GREY VALLEY BETWEEN', 'WEST EGG AND NEW YORK', 'LIES UNDER WATCHING', 'eyes of faded blue.'],
        quote: 'A fantastic farm where ashes grow like wheat... the eyes of Doctor T. J. Eckleburg.',
        help: 'LEFT/RIGHT to dodge ash and Wilson · 3 lives · 22s',
        winText: 'You clear the grey valley. The billboard eyes watch you through.',
        loseText: 'The ash closes in. Wilson steps from the grey murk.',
        init: function (api) {
          this.x = api.W / 2;
          this.speed = 178;
          this.lives = 3;
          this.dur = 22;
          this.ash = [];
          this.spawnT = 1.2;
          this.wilson = { x: api.W + 50, y: api.H - 68, spd: 40, dir: -1 };
          this.hit = false;
          this.hitT = 0;
          this.smoke = [];
        },
        update: function (api, dt) {
          var W = api.W, H = api.H;

          // Player movement
          if (api.keyDown('left')) this.x -= this.speed * dt;
          if (api.keyDown('right')) this.x += this.speed * dt;
          if (api.pointer.down) this.x = api.pointer.x;
          this.x = clamp(this.x, 14, W - 14);

          // Spawn ash chunks
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.76, 1.2 - api.t * 0.02);
            var r = 11 + api.rnd(0, 10);
            this.ash.push({ x: api.rnd(16, W - 16), y: -r, r: r, spd: 65 + api.rnd(0, 40) });
          }
          for (var ai = 0; ai < this.ash.length; ai++) this.ash[ai].y += this.ash[ai].spd * dt;

          // Wilson patrol (sweeps left/right at floor)
          this.wilson.x += this.wilson.spd * this.wilson.dir * dt;
          if (this.wilson.x > W + 50) this.wilson.dir = -1;
          if (this.wilson.x < -50) this.wilson.dir = 1;

          if (this.hit) { this.hitT -= dt; if (this.hitT <= 0) this.hit = false; }

          var playerY = H - 62;

          // Ash collision
          for (var i = this.ash.length - 1; i >= 0; i--) {
            var a = this.ash[i];
            if (a.y > playerY - 12 && a.y < playerY + 20 && Math.abs(a.x - this.x) < a.r + 9 && !this.hit) {
              this.lives--;
              this.hit = true; this.hitT = 0.9;
              api.shake(6, 0.28); api.flash('#3a2838', 0.25); api.audio.sfx('hurt');
              this.ash.splice(i, 1);
              if (this.lives <= 0) { api.lose(); return; }
            } else if (a.y > H + 16) this.ash.splice(i, 1);
          }

          // Wilson collision
          if (Math.abs(this.wilson.x - this.x) < 22 && !this.hit) {
            this.lives--;
            this.hit = true; this.hitT = 0.9;
            api.shake(8, 0.35); api.flash('#880022', 0.3); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }

          // Smoke particles
          if (api.chance(0.25)) {
            this.smoke.push({
              x: api.rnd(0, W), y: H * 0.58 + api.rnd(0, H * 0.24),
              vx: api.rnd(-0.3, 0.3), vy: -api.rnd(0.2, 0.7),
              r: api.rnd(4, 14), life: api.rnd(1.5, 3.5)
            });
          }
          for (var si = 0; si < this.smoke.length; si++) {
            this.smoke[si].x += this.smoke[si].vx;
            this.smoke[si].y += this.smoke[si].vy;
            this.smoke[si].life -= dt;
          }
          this.smoke = this.smoke.filter(function (p) { return p.life > 0; });

          api.score = Math.floor(api.t * 5);
          if (api.t >= this.dur) { api.addScore(80 + this.lives * 20); api.win(); }
        },
        draw: function (api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#141020');

          // Industrial sky
          var sky = c.createLinearGradient(0, 0, 0, H * 0.55);
          sky.addColorStop(0, '#0a0812'); sky.addColorStop(1, '#161428');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.55);

          // Ash heaps (background mounds)
          c.fillStyle = '#1a1620';
          for (var hi = 0; hi < 5; hi++) {
            var hx = hi * 54 + 6, hy = H * 0.55;
            c.beginPath(); c.moveTo(hx, hy);
            c.quadraticCurveTo(hx + 26, hy - 26 - (hi * 7) % 18, hx + 52, hy);
            c.closePath(); c.fill();
          }

          // Doctor T. J. Eckleburg billboard
          var bx = W / 2 - 34, byb = 26;
          g.rect(bx, byb, 68, 52, '#160e20'); g.rectO(bx, byb, 68, 52, '#1e1830', 1);
          g.rect(bx + 7, byb + 13, 22, 13, '#09061a'); g.rect(bx + 39, byb + 13, 22, 13, '#09061a');
          c.globalAlpha = 0.32 + 0.12 * Math.sin(api.t * 0.7);
          g.circle(bx + 18, byb + 19, 5, '#d4a017'); g.circle(bx + 50, byb + 19, 5, '#d4a017');
          c.globalAlpha = 0.18;
          g.rectO(bx + 6, byb + 12, 24, 15, '#d4a017', 1);
          g.rectO(bx + 38, byb + 12, 24, 15, '#d4a017', 1);
          g.rect(bx + 30, byb + 18, 8, 2, '#d4a017');
          c.globalAlpha = 1;

          // Ground
          c.fillStyle = '#1e1a28'; c.fillRect(0, H - 82, W, 82);
          c.fillStyle = '#160e1e'; c.fillRect(0, H - 58, W, 58);

          // Smoke particles
          for (var smi = 0; smi < this.smoke.length; smi++) {
            var p = this.smoke[smi];
            c.globalAlpha = Math.min(1, p.life) * 0.2;
            g.circle(p.x, p.y, p.r, '#2c2838');
          }
          c.globalAlpha = 1;

          // Falling ash chunks
          for (var ai = 0; ai < this.ash.length; ai++) {
            var a = this.ash[ai];
            c.globalAlpha = 0.62; g.circle(a.x, a.y, a.r, '#383048');
            c.globalAlpha = 0.32; g.circle(a.x - a.r * 0.3, a.y - a.r * 0.3, a.r * 0.5, '#484060');
            c.globalAlpha = 1;
          }

          // Wilson silhouette
          var wx = this.wilson.x, wy = this.wilson.y;
          c.globalAlpha = 0.76;
          g.rect(wx - 8, wy - 40, 16, 46, '#08060e');
          g.rect(wx - 6, wy - 56, 12, 18, '#08060e');
          if (this.wilson.dir > 0) g.rect(wx + 8, wy - 32, 22, 3, '#08060e');
          else g.rect(wx - 30, wy - 32, 22, 3, '#08060e');
          c.globalAlpha = 1;

          // Player (running figure — Nick or Gatsby fleeing)
          var px = this.x, py = H - 66;
          var fl = this.hit && (Math.floor(api.t * 12) % 2 === 0);
          var pc = fl ? '#ffffff' : '#d4a017';
          g.rect(px - 6, py - 30, 12, 34, fl ? '#ffffff' : '#c0980e');
          g.rect(px - 5, py - 44, 10, 14, fl ? '#ffffff' : '#c4a07a');
          var leg = Math.sin(api.t * 9);
          g.rect(px - 6, py + 4, 5, 9 + (leg > 0 ? 4 : 0), pc);
          g.rect(px + 1, py + 4, 5, 9 + (leg < 0 ? 4 : 0), pc);

          api.topBar('VALLEY OF ASHES');
          for (var li = 0; li < 3; li++) g.rect(8 + li * 16, 20, 10, 8, li < this.lives ? '#00cc66' : '#1c1838');
          g.rect(6, H - 14, W - 12, 6, '#1a1828');
          g.rect(6, H - 14, (W - 12) * Math.min(1, api.t / this.dur), 6, '#d4a017');
          api.txt(Math.ceil(this.dur - api.t) + 's', W - 30, 20, 9, '#d4a017');
          api.vignette();
        },
      },

    ], // end chapters
  }); // end RetroSaga.create

})();
