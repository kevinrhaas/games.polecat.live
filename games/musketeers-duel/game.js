/* ============================================================================
 * THE THREE MUSKETEERS — ALL FOR ONE
 * Five acts through Alexandre Dumas, 1844:
 *   1. THE ROAD TO PARIS    — dodge/ride: steer D'Artagnan past road hazards
 *   2. THREE DUELS, ONE DAWN — timing meter: parry Athos, Porthos & Aramis
 *   3. THE QUEEN'S DIAMONDS — stealth tap: collect gems, avoid guard sight cones
 *   4. THE SIEGE OF LA ROCHELLE — defense tap: repel attacking guards at the wall
 *   5. THE CARDINAL'S RECKONING — reaction duel: parry Rochefort's attacks to win
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  // ── Fleur-de-lis emblem (gold, drawn with rects) ──────────────────────────
  function emblem(api, cx, cy) {
    var g = api.gfx, col = '#c8961e', dk = '#8a6210';
    // center top petal
    g.rect(cx - 5, cy - 28, 10, 20, col);
    g.rect(cx - 3, cy - 34, 6, 8, col);
    // left petal
    g.rect(cx - 22, cy - 14, 16, 8, col);
    g.rect(cx - 26, cy - 20, 10, 8, col);
    // right petal
    g.rect(cx + 6, cy - 14, 16, 8, col);
    g.rect(cx + 16, cy - 20, 10, 8, col);
    // center band / collar
    g.rect(cx - 8, cy - 10, 16, 6, dk);
    g.rect(cx - 6, cy - 8, 12, 4, col);
    // stem
    g.rect(cx - 4, cy - 4, 8, 16, col);
    // base bar
    g.rect(cx - 12, cy + 10, 24, 5, col);
    g.rect(cx - 8, cy + 13, 16, 3, dk);
  }

  // ── French court backdrop (stone hall + torches + night sky) ─────────────
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // deep navy gradient sky
    var sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#090618');
    sky.addColorStop(0.65, '#110c2a');
    sky.addColorStop(1, '#0c0820');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // stars
    if (scene !== 'menu') {
      for (var i = 0; i < 32; i++) {
        var sx = (i * 71 + 19) % W, sy = (i * 43 + 7) % Math.floor(H * 0.42);
        c.globalAlpha = 0.2 + 0.25 * Math.sin(t * 1.4 + i);
        g.rect(sx, sy, 1, 1, '#e8d8a8');
      }
      c.globalAlpha = 1;
    }

    // stone floor
    var floorY = H - 72;
    c.fillStyle = '#181230';
    c.fillRect(0, floorY, W, 72);
    for (var fx = 0; fx < W; fx += 32) { c.fillStyle = '#1e1838'; c.fillRect(fx, floorY, 1, 72); }
    for (var fy = floorY; fy < H; fy += 16) { c.fillStyle = '#1e1838'; c.fillRect(0, fy, W, 1); }

    // pillars
    for (var px of [8, W - 26]) {
      c.fillStyle = '#1c1836'; c.fillRect(px, 48, 22, H - 48);
      c.fillStyle = '#261e44'; c.fillRect(px, 48, 5, H - 48);
      c.fillStyle = '#2a2248'; c.fillRect(px - 3, 44, 28, 10);
    }

    // torches
    for (var tx of [44, W - 54]) {
      g.rect(tx, H * 0.38, 7, 18, '#4a3010');
      var fl = 0.7 + 0.3 * Math.sin(t * 7 + tx);
      g.rect(tx + 1, H * 0.38 - 10, 5, 10, '#c86010');
      c.globalAlpha = fl;
      g.rect(tx + 1, H * 0.38 - 14, 5, 8, '#e8a020');
      c.globalAlpha = 1;
      // torch glow
      c.globalAlpha = 0.07 * fl;
      c.fillStyle = '#e8a020';
      c.beginPath(); c.arc(tx + 3, H * 0.38 - 8, 30, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    }

    // royal banner (center top, non-menu screens)
    if (scene !== 'menu') {
      c.fillStyle = '#1a0e3a';
      c.fillRect(W / 2 - 24, 28, 48, 60);
      c.strokeStyle = '#c8961e'; c.lineWidth = 1; c.strokeRect(W / 2 - 24, 28, 48, 60);
      // fleur-de-lis on banner (mini)
      g.rect(W / 2 - 3, 42, 6, 12, '#c8961e');
      g.rect(W / 2 - 9, 48, 18, 5, '#c8961e');
      g.rect(W / 2 - 2, 52, 4, 6, '#c8961e');
      g.rect(W / 2 - 6, 56, 12, 3, '#c8961e');
    }

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(6,3,18,.72)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // dark velvet board
      c.fillStyle = 'rgba(6,3,18,.6)'; c.fillRect(0, 0, W, H);
      // gold corner pins
      for (var cp of [[14,14],[W-14,14],[14,H-14],[W-14,H-14]]) {
        g.circle(cp[0], cp[1], 4, '#c8961e');
        g.circle(cp[0], cp[1], 2, '#f0e0a0');
      }
      // faint fleur-de-lis watermark repeats
      c.globalAlpha = 0.04;
      c.fillStyle = '#c8961e';
      for (var wi = 0; wi < 5; wi++) {
        var wx = 30 + wi * 52;
        c.fillRect(wx + 2, H / 2 - 14, 4, 18);
        c.fillRect(wx - 4, H / 2 - 4, 16, 5);
        c.fillRect(wx + 1, H / 2 + 3, 6, 8);
        c.fillRect(wx - 2, H / 2 + 10, 12, 3);
      }
      c.globalAlpha = 1;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  RetroSaga.create({
    id: 'musketeers',
    title: 'THE THREE MUSKETEERS',
    subtitle: 'ALL FOR ONE · ONE FOR ALL',
    currency: 'HONOR',
    screens: {
      win: '#c8961e', lose: '#7a0e1e',
      chapterLabel: '#7878aa', name: '#e8dff8', sub: '#c8961e',
      intro: '#d0c8f0', quote: '#7878aa', help: '#c8961e',
      score: '#e8dff8', cur: '#c8961e', cta: '#e8dff8',
      overlay: 'rgba(6,3,18,.88)'
    },
    labels: {
      chapter: 'ACT', score: 'GLORY WON',
      win: 'VIVE LES MOUSQUETAIRES!', lose: 'HONOR DEMANDS ANOTHER ATTEMPT',
      cont: 'TAP TO PRESS ON', finale: 'TAP TO CLAIM VICTORY',
      toMenu: 'TAP TO RETURN', play: 'DRAW STEEL'
    },
    accent: '#c8961e',
    credit: 'AFTER ALEXANDRE DUMAS, 1844',
    emblem, scenery,
    bootCta: 'DRAW STEEL',
    menuLabel: "D'ARTAGNAN'S CHRONICLES",
    menuHint: 'CHOOSE AN ACT',
    menuDone: 'FRANCE IS SAVED — ALL FOR ONE',
    menu: {
      colors: { title: '#c8961e', label: '#7878aa', cur: '#e8dff8' },
      // Proclamation scrolls pinned to a velvet board — 2-1-2 scattered layout
      layout(api) {
        var W = api.W;
        return [
          { x: 10,      y: 104, w: 110, h: 78 },
          { x: W - 120, y: 116, w: 110, h: 78 },
          { x: W/2 - 55,y: 214, w: 110, h: 78 },
          { x: 10,      y: 326, w: 110, h: 78 },
          { x: W - 120, y: 326, w: 110, h: 78 },
        ];
      },
      card(api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i, x = info.x, y = info.y,
            w = info.w, h = info.h, sel = info.sel, done = info.done;
        var cx = x + w / 2;

        // Scroll parchment body
        c.fillStyle = sel ? '#281e54' : '#18123e';
        c.fillRect(x, y, w, h);
        c.strokeStyle = sel ? '#c8961e' : '#3e3070';
        c.lineWidth = sel ? 2 : 1;
        c.strokeRect(x, y, w, h);

        // decorative scroll borders
        g.rect(x + 6, y + 6,  w - 12, 1, sel ? '#c8961e' : '#2e2860');
        g.rect(x + 6, y + h - 7, w - 12, 1, sel ? '#c8961e' : '#2e2860');

        // Pin at top center
        g.circle(cx, y, 5, sel ? '#c8961e' : '#5a5490');
        g.circle(cx, y, 2, sel ? '#f0e0a0' : '#38306a');

        // ACT number header
        api.txtC('ACT ' + (i + 1), cx, y + 17, 7, '#c8961e', true);

        // Chapter name (shrink-to-fit)
        api.txtCFit(ch.name, cx, y + 37, 7, done ? '#c8961e' : '#e8dff8', false, w - 10);

        // Sub-title
        if (ch.sub) api.txtCFit(ch.sub, cx, y + 53, 6, '#7878a8', false, w - 10);

        // Wax seal at bottom
        g.circle(cx, y + h - 10, 8, done ? '#c8961e' : '#6a0e18');
        g.circle(cx, y + h - 10, 5, done ? '#a87018' : '#8a1020');
        api.txtC(done ? '✦' : 'R', cx, y + h - 13, 7, done ? '#f0e8c0' : '#e8a0a0');
      },
    },
    finale: [
      'RICHELIEU WITHDRAWS.',
      'THE DIAMONDS SAFE.',
      'PARIS REJOICES.',
      '',
      'ALL FOR ONE,',
      'ONE FOR ALL!'
    ],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#c8961e', crimson: '#a0102a', silver: '#c8c8e8', navy: '#1a1260' },

    chapters: [

      /* ================================================================
       * ACT 1 — THE ROAD TO PARIS
       * D'Artagnan rides north; steer left/right to dodge road hazards.
       * ================================================================ */
      {
        id: 'road', name: 'THE ROAD TO PARIS', sub: 'A GASCON RIDES NORTH',
        icon(api, x, y) {
          var g = api.gfx;
          // simple horse silhouette in gold
          g.rect(x - 10, y - 4, 20, 8, '#c8961e');
          g.rect(x + 8, y - 10, 6, 8, '#c8961e');
          g.rect(x - 12, y + 4, 6, 6, '#c8961e');
          g.rect(x + 4, y + 4, 6, 6, '#c8961e');
        },
        intro: [
          "D'ARTAGNAN SPURS HIS",
          "YELLOW HORSE AND",
          "RIDES FOR PARIS.",
          'The road to glory',
          'is long and rocky.',
        ],
        quote: "All for one, one for all — that is our device.",
        help: 'TAP LEFT / RIGHT (or ← →) to dodge road hazards',
        winText: "Paris at last! D'Artagnan leaps from the saddle, breathless and ready.",
        loseText: "The road has the better of you. A Gascon tries again.",
        init(api) {
          this.px = api.W / 2;
          this.spd = 95;
          this.obs = [];
          this.ot = 0;
          this.dist = 0;
          this.need = 36;
          this.lives = 3;
          this.hcool = 0;
        },
        update(api, dt) {
          var W = api.W, H = api.H;
          this.dist += dt;
          this.hcool = Math.max(0, this.hcool - dt);

          var left  = api.keyDown('left')  || (api.pointer.down && api.pointer.x < W / 2);
          var right = api.keyDown('right') || (api.pointer.down && api.pointer.x > W / 2);
          if (left)  this.px = clamp(this.px - this.spd * dt, 32, W - 32);
          if (right) this.px = clamp(this.px + this.spd * dt, 32, W - 32);

          this.ot -= dt;
          if (this.ot <= 0) {
            var lane = Math.floor(Math.random() * 5);
            this.obs.push({ x: 24 + lane * 44, y: -18, r: 13 });
            this.ot = Math.max(0.32, 0.88 - this.dist * 0.012);
          }

          var ospd = 110 + this.dist * 5;
          var px = this.px, py = H - 80;
          this.obs = this.obs.filter(function(o) {
            o.y += ospd * dt;
            if (this.hcool <= 0 && Math.hypot(o.x - px, o.y - py) < 26) {
              this.lives--;
              this.hcool = 1.1;
              api.shake(5, 0.3);
              api.flash(api.colors.crimson, 0.2);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); }
            }
            return o.y < H + 20;
          }, this);

          api.score = Math.floor(this.dist * 14);
          if (this.dist >= this.need) { api.score += 60; api.win(); }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#090618');

          // stars
          for (var i = 0; i < 22; i++) {
            g.rect((i * 67 + 13) % W, (i * 41 + 9) % Math.floor(H * 0.38), 1, 1, '#d8c880');
          }

          // road surface
          c.fillStyle = '#1a1530';
          c.fillRect(18, H * 0.36, W - 36, H * 0.65);
          c.fillStyle = '#131028';
          c.fillRect(18, H * 0.36, 1, H);
          c.fillRect(W - 19, H * 0.36, 1, H);

          // scrolling lane markings
          var off = (api.t * 148) % 40;
          for (var lx = 18 + 44; lx < W - 19; lx += 44) {
            c.fillStyle = '#221e40';
            c.fillRect(lx - 1, H * 0.36, 1, H);
          }
          for (var my = H * 0.36 + off; my < H; my += 40) {
            g.rect(W / 2 - 2, my, 4, 18, '#2a2448');
          }

          // obstacles (rocks / fallen logs)
          for (var o of this.obs) {
            g.rect(o.x - o.r, o.y - o.r * 0.6, o.r * 2, o.r * 1.2, '#2e2850');
            g.rect(o.x - o.r + 3, o.y - o.r * 0.6 + 2, o.r - 3, o.r * 0.5, '#3a3468');
          }

          // horse + rider (blink when hit)
          if (!(this.hcool > 0 && Math.floor(api.t * 8) % 2)) {
            var rx = this.px, ry = H - 80;
            // horse
            g.rect(rx - 14, ry - 10, 28, 12, '#7a5020');
            g.rect(rx + 12, ry - 16, 10, 10, '#7a5020'); // head
            g.rect(rx - 18, ry + 2, 8, 7, '#7a5020');
            g.rect(rx + 8, ry + 2, 8, 7, '#7a5020');
            g.rect(rx - 6, ry - 6, 2, 4, '#5a3a10'); // ear
            // rider
            g.rect(rx - 7, ry - 28, 14, 18, '#1a1e60');
            g.rect(rx - 5, ry - 40, 10, 13, '#c8a070'); // head
            // cavalier hat + feather
            g.rect(rx - 8, ry - 46, 16, 6, '#141414');
            g.rect(rx + 6, ry - 54, 3, 10, '#c8102a');
          }

          api.topBar('THE ROAD TO PARIS');
          for (var li = 0; li < 3; li++) {
            g.rect(8 + li * 14, 20, 10, 10, li < this.lives ? '#c8961e' : '#2a1828');
          }
          api.txt('DIST ' + Math.floor(this.dist) + '/' + this.need, W - 90, 20, 7, '#c8961e');
          api.vignette();
        },
      },

      /* ================================================================
       * ACT 2 — THREE DUELS, ONE DAWN
       * Timing-meter duel: press in the gold zone to parry.
       * Three opponents (Athos, Porthos, Aramis), 5 hits each.
       * ================================================================ */
      {
        id: 'duels', name: 'THREE DUELS, ONE DAWN', sub: 'THE MUSKETEERS MEET',
        icon(api, x, y) {
          var g = api.gfx;
          g.line(x - 9, y - 9, x + 9, y + 9, '#c8961e', 2);
          g.line(x + 9, y - 9, x - 9, y + 9, '#c8961e', 2);
          g.rect(x - 2, y - 2, 4, 4, '#c8961e');
        },
        intro: [
          "D'ARTAGNAN OFFENDS",
          'ATHOS, PORTHOS, AND',
          'ARAMIS IN ONE DAY.',
          'Three dawn duels',
          'before the guards come.',
        ],
        quote: "He who fights and runs away may fight again another day. But that is not the way of a Musketeer.",
        help: 'TAP when the blade enters the GOLD zone to parry!',
        winText: "Three victories at dawn! The Musketeers roar with laughter.",
        loseText: "Steel finds its mark. En garde — once more!",
        init(api) {
          this.phase = 0;
          this.foes = ['ATHOS', 'PORTHOS', 'ARAMIS'];
          this.hp = 4;
          this.hits = 0;
          this.need = 5;
          this.m = 0; this.dir = 1; this.spd = 1.05;
          this.band = 0.19;
          this.cool = 0;
        },
        update(api, dt) {
          this.cool = Math.max(0, this.cool - dt);
          this.m += this.dir * this.spd * 0.028 * dt * 60;
          if (this.m > 1) { this.m = 1; this.dir = -1; }
          if (this.m < 0) { this.m = 0; this.dir = 1; }

          if (api.confirm() && this.cool <= 0) {
            this.cool = 0.28;
            if (Math.abs(this.m - 0.5) < this.band) {
              this.hits++;
              api.score += 20;
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H * 0.42, api.colors.gold, 7);
              api.shake(3, 0.14);
              this.spd = Math.min(2.6, this.spd + 0.12);
              this.band = Math.max(0.08, this.band - 0.012);
              if (this.hits >= this.need) {
                this.phase++;
                this.hits = 0; this.hp = 4;
                this.spd = 1.05; this.band = 0.19;
                if (this.phase >= 3) { api.score += 80; api.win(); }
                else { api.flash(api.colors.gold, 0.25); api.audio.sfx('power'); }
              }
            } else {
              this.hp--;
              api.shake(5, 0.26);
              api.audio.sfx('hurt');
              api.flash(api.colors.crimson, 0.2);
              if (this.hp <= 0) { api.lose(); }
            }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a0820');

          // dawn sky
          var sky = c.createLinearGradient(0, 0, 0, H * 0.5);
          sky.addColorStop(0, '#0a0820');
          sky.addColorStop(1, '#220830');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.5);

          // ground
          g.rect(0, H * 0.5, W, H * 0.5, '#181430');

          // horizon glow (dawn)
          c.globalAlpha = 0.18;
          c.fillStyle = '#c85020';
          c.fillRect(0, H * 0.46, W, H * 0.1);
          c.globalAlpha = 1;

          // opponent
          var ph = Math.min(this.phase, 2);
          var foeColors = ['#223068', '#3a1860', '#183a30'];
          var fX = W * 0.62, fY = H * 0.38;
          c.fillStyle = foeColors[ph];
          c.fillRect(fX - 14, fY - 32, 28, 42);
          g.rect(fX - 8, fY - 50, 16, 20, '#b09070');
          g.rect(fX - 14, fY - 58, 28, 10, '#141414');
          // opponent sword (oscillating)
          var sOff = Math.sin(api.t * 5) * 7;
          g.line(fX + 12, fY - 18, fX + 38 + sOff, fY - 38 + sOff, '#c8c8e8', 2);
          g.rect(fX + 10, fY - 20, 5, 5, '#c8961e');

          // player (left side)
          var pY = H - 95;
          g.rect(W * 0.22, pY - 32, 22, 40, '#1a1e60');
          g.rect(W * 0.24, pY - 52, 14, 20, '#c8a070');
          g.rect(W * 0.20, pY - 60, 24, 9, '#141414');
          // player sword (aimed right)
          g.line(W * 0.22 + 20, pY - 20, W * 0.22 + 48, pY - 38, '#c8c8e8', 2);
          g.rect(W * 0.22 + 18, pY - 22, 5, 5, '#c8961e');

          // HP hearts
          for (var hi = 0; hi < 4; hi++) {
            g.rect(8 + hi * 16, 20, 12, 10, hi < this.hp ? '#a0102a' : '#2a1828');
          }

          // Opponent name + hit counter
          api.txtC(this.foes[ph], W / 2, H * 0.5 + 14, 9, '#c8961e', true);
          api.txtC('HIT ' + this.hits + '/' + this.need, W / 2, H * 0.5 + 28, 7, '#8888b0');

          // timing meter
          var my = H - 40, mx = 24, mw = W - 48;
          g.rect(mx, my, mw, 12, '#14102a');
          g.rect(mx + mw * (0.5 - this.band), my, mw * this.band * 2, 12, 'rgba(200,150,30,.42)');
          g.rect(mx + mw * 0.5 - 1, my - 3, 2, 18, '#c8961e');
          g.rect(mx + mw * this.m - 2, my - 4, 4, 20, '#e8e8f8');
          api.txtC('PARRY', W / 2, my - 11, 7, '#c8c8e8');

          api.topBar('THREE DUELS, ONE DAWN');
          api.vignette();
        },
      },

      /* ================================================================
       * ACT 3 — THE QUEEN'S DIAMONDS
       * Stealth tap: collect 12 diamonds; tapping inside a guard's
       * sight cone costs a life.  Guards sweep their cones over time.
       * ================================================================ */
      {
        id: 'diamonds', name: "THE QUEEN'S DIAMONDS", sub: 'MILADY AND THE MINISTER',
        icon(api, x, y) {
          var g = api.gfx;
          g.sprite(['.d.','ddd','.d.'], x - 6, y - 6, { d: '#21e6ff' }, 4);
        },
        intro: [
          "THE CARDINAL PLOTS",
          "TO SHAME THE QUEEN.",
          'Her diamonds — secretly',
          'gifted to Buckingham',
          '— must be retrieved!',
        ],
        quote: "The end justifies the means. But a Musketeer chooses his means well.",
        help: 'TAP diamonds · avoid the GOLDEN sweeping guard sight cones!',
        winText: "Twelve diamonds recovered! The Queen's honour is safe.",
        loseText: "Spotted by the Cardinal's eyes. Melt into the shadows.",
        init(api) {
          this.gems = [];
          this.guards = [];
          this.got = 0;
          this.need = 12;
          this.lives = 3;
          this.scool = 0;
          this.gspawn = 0.6;
          this.nxtGuard = 2.5;
          // seed some gems
          for (var i = 0; i < 5; i++) {
            this.gems.push({ x: 28 + Math.random() * (api.W - 56),
                             y: 90 + Math.random() * (api.H - 150), t: Math.random() * 5 });
          }
          // one initial guard
          this.guards.push({ x: api.W / 2, y: 90, angle: 1.2, aspd: 0.65, adir: 1 });
        },
        update(api, dt) {
          var W = api.W, H = api.H;
          this.scool = Math.max(0, this.scool - dt);

          // gem respawn
          this.gspawn -= dt;
          if (this.gspawn <= 0 && this.gems.length < 7) {
            this.gems.push({ x: 28 + Math.random() * (W - 56), y: 90 + Math.random() * (H - 150), t: 0 });
            this.gspawn = 0.7;
          }
          this.gems.forEach(function(d) { d.t += dt; });

          // guard spawn
          this.nxtGuard -= dt;
          if (this.nxtGuard <= 0 && this.guards.length < 3) {
            var side = Math.random() < 0.5 ? 18 : W - 18;
            this.guards.push({ x: side, y: 70 + Math.random() * (H - 140),
                               angle: Math.random() * Math.PI * 2, aspd: 0.55 + this.got * 0.03, adir: 1 });
            this.nxtGuard = 4.5;
          }
          // sweep guards
          this.guards.forEach(function(gd) {
            gd.angle += gd.aspd * gd.adir * dt;
            if (gd.angle > Math.PI * 2.4) gd.adir = -1;
            if (gd.angle < 0.2) gd.adir = 1;
          });

          // tap
          if (api.pointer.justDown) {
            var px = api.pointer.x, py = api.pointer.y;

            // check if tap is inside any cone
            var inCone = false;
            for (var gi = 0; gi < this.guards.length; gi++) {
              var gd = this.guards[gi];
              var ddx = px - gd.x, ddy = py - gd.y;
              var dist = Math.sqrt(ddx * ddx + ddy * ddy);
              var ang = Math.atan2(ddy, ddx);
              var diff = Math.abs(((ang - gd.angle) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
              if (dist < 125 && diff < 0.46) { inCone = true; break; }
            }

            if (inCone && this.scool <= 0) {
              this.lives--;
              this.scool = 1.4;
              api.shake(5, 0.3);
              api.flash(api.colors.crimson, 0.28);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            } else if (!inCone) {
              // collect gem
              var self = this;
              this.gems = this.gems.filter(function(d) {
                if (Math.hypot(px - d.x, py - d.y) < 22) {
                  self.got++;
                  api.score += 15;
                  api.audio.sfx('coin');
                  api.burst(d.x, d.y, '#21e6ff', 9);
                  if (self.got >= self.need) { api.score += 60; api.win(); }
                  return false;
                }
                return true;
              });
            }
          }

          api.score = this.got * 15;
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0d0a28');

          // checkerboard palace floor
          for (var fx = 0; fx < W; fx += 22) {
            for (var fy = 0; fy < H; fy += 22) {
              c.fillStyle = ((Math.floor(fx / 22) + Math.floor(fy / 22)) % 2) ? '#110e26' : '#0e0b22';
              c.fillRect(fx, fy, 22, 22);
            }
          }

          // guard sight cones + figures
          for (var i = 0; i < this.guards.length; i++) {
            var gd = this.guards[i];
            c.save();
            c.translate(gd.x, gd.y);
            var cone = c.createRadialGradient(0, 0, 0, 0, 0, 125);
            cone.addColorStop(0, 'rgba(200,150,30,.28)');
            cone.addColorStop(1, 'rgba(200,150,30,0)');
            c.fillStyle = cone;
            c.beginPath(); c.moveTo(0, 0);
            c.arc(0, 0, 125, gd.angle - 0.46, gd.angle + 0.46);
            c.closePath(); c.fill();
            c.restore();

            g.rect(gd.x - 6, gd.y - 15, 12, 20, '#3a1030');
            g.rect(gd.x - 5, gd.y - 25, 10, 12, '#b09070');
            // lance showing direction
            var ex = gd.x + Math.cos(gd.angle) * 20, ey = gd.y + Math.sin(gd.angle) * 20;
            g.line(gd.x, gd.y - 6, ex, ey, '#c8961e', 1);
          }

          // gems (pulsing)
          for (var di = 0; di < this.gems.length; di++) {
            var d = this.gems[di];
            var pulse = 0.65 + 0.35 * Math.sin(d.t * 4.2);
            c.globalAlpha = pulse;
            g.sprite(['.d.','.ddd.','.d.'], d.x - 6, d.y - 6, { d: '#21e6ff' }, 4);
            c.globalAlpha = 1;
          }

          if (this.scool > 0) api.txtC('SPOTTED!', W / 2, H / 2, 13, '#c8102a', true);

          api.topBar("THE QUEEN'S DIAMONDS");
          for (var li = 0; li < 3; li++) {
            g.rect(8 + li * 14, 20, 10, 10, li < this.lives ? '#a0102a' : '#2a1828');
          }
          api.txt(this.got + '/' + this.need, W - 50, 20, 9, '#21e6ff');
          api.vignette();
        },
      },

      /* ================================================================
       * ACT 4 — THE SIEGE OF LA ROCHELLE
       * Defense tap: Cardinal's guards charge down lanes.
       * Tap them before they breach the wall at the bottom.
       * ================================================================ */
      {
        id: 'rochelle', name: 'THE SIEGE OF LA ROCHELLE', sub: 'HOLD THE BASTION',
        icon(api, x, y) {
          var g = api.gfx;
          // cannon
          g.rect(x - 10, y - 3, 20, 7, '#5a5070');
          g.rect(x + 8, y - 1, 5, 3, '#3a3050');
          g.circle(x - 7, y + 6, 4, '#3a3050');
          g.circle(x + 5, y + 6, 4, '#3a3050');
        },
        intro: [
          "THE CARDINAL SIEGES",
          'LA ROCHELLE.',
          'The Musketeers hold',
          'the bastion while',
          'France holds its breath.',
        ],
        quote: "We do not retreat — we advance in the other direction.",
        help: 'TAP the attackers before they breach the wall below!',
        winText: "The bastion holds! The Cardinal's offensive falters.",
        loseText: "The wall is breached. Regroup — France needs you!",
        init(api) {
          this.atk = [];
          this.repelled = 0;
          this.need = 20;
          this.wallHp = 5;
          this.nxt = 1.1;
        },
        update(api, dt) {
          var W = api.W, H = api.H;
          this.nxt -= dt;
          if (this.nxt <= 0) {
            var lane = Math.floor(Math.random() * 5);
            this.atk.push({ x: 27 + lane * 44, y: -22, spd: 38 + this.repelled * 1.8,
                            id: this.repelled + '_' + lane + '_' + this.atk.length });
            this.nxt = Math.max(0.38, 1.0 - this.repelled * 0.022);
          }

          for (var i = 0; i < this.atk.length; i++) {
            var a = this.atk[i];
            if (!a.hit) a.y += a.spd * dt;
          }

          if (api.pointer.justDown) {
            var px = api.pointer.x, py = api.pointer.y;
            for (var ai = 0; ai < this.atk.length; ai++) {
              var atk = this.atk[ai];
              if (!atk.hit && Math.hypot(px - atk.x, py - atk.y) < 24) {
                atk.hit = true;
                this.repelled++;
                api.score += 10;
                api.audio.sfx('shoot');
                api.burst(atk.x, atk.y, '#c8961e', 8);
                if (this.repelled >= this.need) { api.score += 60; api.win(); }
              }
            }
          }

          this.atk = this.atk.filter(function(a) {
            if (a.hit) return a.y < 600;
            if (a.y > H - 88) {
              this.wallHp--;
              api.shake(6, 0.35);
              api.flash(api.colors.crimson, 0.3);
              api.audio.sfx('hurt');
              if (this.wallHp <= 0) { api.lose(); return false; }
              return false;
            }
            return true;
          }, this);
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#090618');

          // siege night sky
          c.fillStyle = '#0c0820'; c.fillRect(0, 0, W, H * 0.56);
          // distant city silhouette
          for (var ci = 0; ci < 8; ci++) {
            var bx = ci * 34, bh = 26 + (ci * 19) % 28;
            c.fillStyle = '#060410'; c.fillRect(bx, H * 0.56 - bh, 30, bh);
          }
          // fire glow from siege
          c.globalAlpha = 0.1 + 0.06 * Math.sin(api.t * 2.2);
          c.fillStyle = '#c86010'; c.fillRect(0, 0, W, H);
          c.globalAlpha = 1;

          // lanes
          for (var l = 0; l < 5; l++) {
            var lx = 27 + l * 44;
            c.fillStyle = '#130f28'; c.fillRect(lx - 18, 0, 36, H - 85);
          }

          // attackers
          for (var ai = 0; ai < this.atk.length; ai++) {
            var a = this.atk[ai];
            if (a.hit) continue;
            g.rect(a.x - 9, a.y - 20, 18, 26, '#3a0a20');
            g.rect(a.x - 6, a.y - 32, 12, 14, '#b09070');
            g.rect(a.x - 5, a.y - 20, 10, 6, '#a00818'); // red sash
            // pike
            g.line(a.x, a.y - 32, a.x + 8, a.y - 54, '#8a7860', 1);
          }

          // wall
          c.fillStyle = '#2a2248'; c.fillRect(0, H - 86, W, 86);
          for (var wx = 0; wx < W; wx += 28) { c.fillStyle = '#1e1838'; c.fillRect(wx, H - 86, 1, 86); }
          // merlons
          for (var mx = 0; mx < W; mx += 18) { c.fillStyle = '#38305a'; c.fillRect(mx, H - 94, 12, 8); }
          // musketeer on wall (simple figure)
          g.rect(W / 2 - 8, H - 94, 16, 22, '#1a1e60');
          g.rect(W / 2 - 5, H - 106, 10, 14, '#c8a070');

          // wall HP
          for (var whi = 0; whi < 5; whi++) {
            g.rect(W / 2 - 40 + whi * 18, H - 78, 14, 10, whi < this.wallHp ? '#c8961e' : '#2a1828');
          }

          api.topBar('THE SIEGE OF LA ROCHELLE');
          api.txt('REPELLED ' + this.repelled + '/' + this.need, 8, 20, 7, '#c8961e');
          api.vignette();
        },
      },

      /* ================================================================
       * ACT 5 — THE CARDINAL'S RECKONING
       * Reaction duel: a flash window opens when Rochefort attacks.
       * Tap PARRY during the window to land a riposte.
       * Miss: lose a guard card. Take 8 hits to win.
       * ================================================================ */
      {
        id: 'cardinal', name: "THE CARDINAL'S RECKONING", sub: 'ONE FINAL BLADE',
        icon(api, x, y) {
          var g = api.gfx;
          g.rect(x - 2, y - 10, 4, 20, '#a0102a');
          g.rect(x - 8, y - 4, 16, 4, '#a0102a');
          g.rect(x - 1, y - 9, 2, 18, '#c8961e');
          g.rect(x - 7, y - 3, 14, 2, '#c8961e');
        },
        intro: [
          "RICHELIEU IS EXPOSED.",
          "ROCHEFORT — THE",
          "CARDINAL'S OWN SWORD —",
          'bars the way to Paris.',
          'One final duel for the',
          'fate of France.',
        ],
        quote: "It is enough for me to know that virtue is not always victorious. But it is always right.",
        help: 'TAP PARRY when it flashes GOLD to riposte Rochefort!',
        winText: "Rochefort falls! The Cardinal concedes. Paris is saved!",
        loseText: "The Cardinal's champion is formidable. Steel yourself.",
        init(api) {
          this.hp = 5;
          this.ehp = 8;
          this.window = false;
          this.winT = 0;
          this.winDur = 0.56;
          this.nextAtk = 1.9;
          this.cool = 0;
          this.streak = 0;
        },
        update(api, dt) {
          this.cool = Math.max(0, this.cool - dt);
          this.nextAtk -= dt;
          if (this.nextAtk <= 0 && !this.window) {
            this.window = true;
            this.winT = this.winDur;
            api.audio.sfx('blip');
            this.nextAtk = Math.max(0.85, 1.8 - (8 - this.ehp) * 0.1);
          }

          if (this.window) {
            this.winT -= dt;
            if (this.winT <= 0) {
              this.window = false;
              this.hp--;
              this.streak = 0;
              api.shake(5, 0.3);
              api.flash(api.colors.crimson, 0.26);
              api.audio.sfx('hurt');
              if (this.hp <= 0) { api.lose(); }
            }
          }

          if (api.confirm() && this.window && this.cool <= 0) {
            this.window = false;
            this.cool = 0.28;
            this.ehp--;
            this.streak++;
            api.score += 10 + this.streak * 5;
            api.audio.sfx('shoot');
            api.burst(api.W / 2, api.H * 0.4, api.colors.gold, 9);
            api.shake(3, 0.18);
            if (this.ehp <= 0) { api.score += 80; api.win(); }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#090514');

          // throne room columns
          for (var px of [0, W - 22]) {
            c.fillStyle = '#1a1430'; c.fillRect(px, 0, 22, H);
            c.fillStyle = '#221c3c'; c.fillRect(px, 0, 5, H);
          }

          // Cardinal red tapestry at top
          c.fillStyle = '#4a0610'; c.fillRect(36, 0, W - 72, 78);
          c.fillStyle = '#640a18'; c.fillRect(36, 74, W - 72, 4);
          c.fillStyle = '#c8961e'; c.fillRect(36, 74, W - 72, 1);

          // Richelieu figure (seated on throne)
          g.rect(W / 2 - 16, 14, 32, 46, '#500810');
          g.rect(W / 2 - 10, 8, 20, 14, '#c8a878');
          g.rect(W / 2 - 14, 4, 28, 8, '#780a12');
          api.txtC('RICHELIEU', W / 2, 70, 6, '#c8961e');

          // Rochefort (opponent, center-right)
          var rX = W * 0.64, rY = H * 0.44;
          c.fillStyle = '#220820';
          c.fillRect(rX - 14, rY - 36, 28, 44);
          g.rect(rX - 8, rY - 56, 16, 22, '#a89070');
          g.rect(rX - 14, rY - 64, 30, 10, '#141414');
          // eye-patch
          g.rect(rX - 2, rY - 50, 11, 5, '#1a0808');
          // Rochefort's sword
          var sA = Math.sin(api.t * 5) * 6;
          g.line(rX + 12, rY - 22, rX + 38 + sA, rY - 44 + sA, '#c8c8e8', 2);
          g.rect(rX + 10, rY - 24, 5, 5, '#c8961e');

          // D'Artagnan (player, left)
          var pX = W * 0.28, pY = H * 0.54;
          g.rect(pX - 10, pY - 36, 20, 44, '#1a1e60');
          g.rect(pX - 6, pY - 56, 12, 22, '#c8a070');
          g.rect(pX - 9, pY - 64, 20, 9, '#141414');
          g.line(pX + 8, pY - 22, W * 0.5, pY - 38, '#c8c8e8', 2);
          g.rect(pX + 6, pY - 24, 5, 5, '#c8961e');

          // PARRY button / attack window
          var btnY = H - 82, btnW = 130, btnX = W / 2 - btnW / 2;
          if (this.window) {
            var fl = 0.55 + 0.45 * Math.abs(Math.sin(api.t * 18));
            c.globalAlpha = fl;
            c.fillStyle = '#c8961e'; c.fillRect(btnX, btnY, btnW, 44);
            c.globalAlpha = 1;
            api.txtC('PARRY!', W / 2, btnY + 14, 14, '#090514', true);
            api.txtC('TAP NOW', W / 2, btnY + 30, 7, '#1a1040');
          } else {
            g.rect(btnX, btnY, btnW, 44, '#1a1438');
            c.strokeStyle = '#3e3468'; c.lineWidth = 1; c.strokeRect(btnX, btnY, btnW, 44);
            api.txtC('RIPOSTE', W / 2, btnY + 14, 10, '#3e3468');
            api.txtC('WAIT FOR OPENING', W / 2, btnY + 30, 6, '#2e2858');
          }

          // HP (D'Artagnan)
          api.txtC("D'ARTAGNAN", 44, H * 0.68, 6, '#8888b0');
          for (var hi = 0; hi < 5; hi++) {
            g.rect(8 + hi * 16, H * 0.68 + 10, 12, 9, hi < this.hp ? '#c8961e' : '#2a1828');
          }
          // HP (Rochefort)
          api.txtC('ROCHEFORT', W - 44, H * 0.68, 6, '#8888b0');
          for (var ri = 0; ri < 8; ri++) {
            g.rect(W - 96 + (ri % 4) * 14, H * 0.68 + 10 + Math.floor(ri / 4) * 12, 11, 9,
                   ri < this.ehp ? '#a0102a' : '#2a1828');
          }

          // streak
          if (this.streak > 1) api.txtC('RIPOSTE x' + this.streak, W / 2, H * 0.68 + 4, 7, '#c8961e');

          api.topBar("THE CARDINAL'S RECKONING");
          api.vignette();
        },
      },

    ], // end chapters
  }); // end RetroSaga.create
})();
