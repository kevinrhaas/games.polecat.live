/* ============================================================================
 * THE PHANTOM OF THE OPERA — BENEATH THE GARNIER
 * Five scenes through Gaston Leroux, 1910:
 *   1. THE CATACOMBS    — stealth: slip through torch beams to the underground lair
 *   2. THE MUSIC LESSON — rhythm: catch the falling notes of Erik's aria
 *   3. THE ROOFTOP      — intercept: block searchlights before they reach Christine
 *   4. THE CHANDELIER   — timing: cut the ropes at the perfect moment
 *   5. THE LAKE         — dodge: steer the gondola to freedom through the dark
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ── half-mask emblem ────────────────────────────────────────────────────── */
  function emblem(api, cx, cy) {
    var g = api.gfx;
    g.rect(cx - 20, cy - 16, 20, 28, '#f0e8e0');
    g.rect(cx - 22, cy - 10, 4, 18, '#f0e8e0');
    g.rect(cx,      cy - 16, 18, 28, '#1a0818');
    g.rect(cx + 18, cy - 10, 4,  18, '#1a0818');
    g.rect(cx - 1,  cy - 16, 2,  28, '#e0c050');
    g.rect(cx - 15, cy - 9,  7,  5,  '#0a0008');
    g.rect(cx + 5,  cy - 9,  7,  5,  '#cc2233');
    g.rect(cx - 5,  cy,      4,  5,  '#0a0008');
    g.rect(cx + 20, cy - 4,  10, 2,  '#cc2233');
    g.rect(cx - 30, cy - 4,  10, 2,  '#cc2233');
  }

  /* ── opera house scenery backdrop ─────────────────────────────────────────── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    var bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#060008');
    bg.addColorStop(0.55, '#0e0018');
    bg.addColorStop(1, '#080012');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);

    if (scene === 'menu') {
      for (var bi = 0; bi < 4; bi++) {
        c.globalAlpha = 0.05 + bi * 0.015;
        c.strokeStyle = '#cc2233';
        c.lineWidth = bi * 2 + 1;
        c.beginPath();
        c.arc(W / 2, 30 + bi * 18, W / 2 - bi * 6, 0, Math.PI);
        c.stroke();
        c.globalAlpha = 1;
      }
      c.fillStyle = '#0c0018'; c.fillRect(0, H - 55, W, 55);
      for (var si = 0; si < 14; si++) {
        var sx = 4 + (si % 7) * 36, sy = H - 48 + Math.floor(si / 7) * 22;
        c.globalAlpha = 0.12; c.fillStyle = '#8a1030';
        c.beginPath(); c.ellipse(sx + 14, sy + 6, 13, 6, 0, 0, Math.PI); c.fill();
        c.fillRect(sx + 2, sy + 6, 24, 14); c.globalAlpha = 1;
      }
      c.globalAlpha = 0.08; c.fillStyle = '#e0c050'; c.fillRect(0, 0, W, 4); c.globalAlpha = 1;
      return;
    }

    // proscenium curtains
    c.fillStyle = '#3a0818'; c.fillRect(0, 0, 36, H);
    c.fillStyle = '#540e24'; c.fillRect(0, 0, 18, H);
    for (var fi = 0; fi < 5; fi++) { c.globalAlpha = 0.08; c.fillStyle = '#e87070'; c.fillRect(fi * 4, 0, 2, H); c.globalAlpha = 1; }
    c.fillStyle = '#3a0818'; c.fillRect(W - 36, 0, 36, H);
    c.fillStyle = '#540e24'; c.fillRect(W - 18, 0, 18, H);
    for (var fi2 = 0; fi2 < 5; fi2++) { c.globalAlpha = 0.08; c.fillStyle = '#e87070'; c.fillRect(W - 16 + fi2 * 4, 0, 2, H); c.globalAlpha = 1; }

    // arch
    c.fillStyle = '#1a0828'; c.fillRect(28, 0, W - 56, 52);
    c.strokeStyle = '#e0c050'; c.lineWidth = 2;
    c.beginPath(); c.arc(W / 2, 52, (W - 56) / 2, Math.PI, 0); c.stroke();
    for (var ai = 0; ai < 5; ai++) { var arx = 50 + ai * ((W - 100) / 4); g.circle(arx, 18, 5, '#e0c050'); g.circle(arx, 18, 2, '#c8a030'); }
    g.rect(28, 50, W - 56, 3, '#e0c050');

    // chandelier
    var chY = 68 + Math.sin(t * 0.5) * 3;
    g.rect(W / 2 - 1, 52, 2, chY - 52, '#c8a030');
    c.fillStyle = '#c8a030'; c.beginPath(); c.ellipse(W / 2, chY, 22, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#e0c050'; c.beginPath(); c.ellipse(W / 2, chY, 14, 5, 0, 0, Math.PI * 2); c.fill();
    for (var li = 0; li < 5; li++) {
      var la = (li / 5) * Math.PI * 2 + t * 0.18;
      var lx = W / 2 + Math.cos(la) * 20, ly = chY + Math.sin(la) * 6;
      g.rect(lx - 1, ly, 2, 9, '#c8a030');
      var fl = 0.6 + 0.4 * Math.sin(t * 7 + li * 1.3);
      g.rect(lx - 1, ly + 8, 2, 4, '#c87020');
      c.globalAlpha = fl; g.rect(lx - 1, ly + 7, 2, 3, '#f0d040');
      c.globalAlpha = 0.05 * fl; c.fillStyle = '#f0d040'; c.beginPath(); c.arc(lx, ly + 10, 18, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    }
    g.rect(28, H - 54, W - 56, 5, '#2a1428');
    c.fillStyle = '#1a0e22'; c.fillRect(28, H - 49, W - 56, 34);
    c.globalAlpha = 0.09;
    var fglow = c.createLinearGradient(0, H - 54, 0, H - 90);
    fglow.addColorStop(0, '#f0c030'); fglow.addColorStop(1, 'transparent');
    c.fillStyle = fglow; c.fillRect(28, H - 90, W - 56, 36); c.globalAlpha = 1;

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(6,0,12,.76)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ── progress bar below topBar ───────────────────────────────────────────── */
  function drawProg(api, pct, col) {
    var W = api.W;
    api.gfx.rect(0, 16, W, 5, '#0a0018');
    api.gfx.rect(0, 16, Math.floor(W * clamp(pct, 0, 1)), 5, col || '#e0c050');
  }

  /* ── mini heart ──────────────────────────────────────────────────────────── */
  function heart(api, x, y, filled) {
    var g = api.gfx, col = filled ? '#cc2233' : '#220c2a';
    g.rect(x + 2, y,     4, 3, col); g.rect(x + 7, y,     4, 3, col);
    g.rect(x,     y + 2, 13, 4, col); g.rect(x + 1, y + 6, 11, 3, col);
    g.rect(x + 3, y + 8, 7,  2, col); g.rect(x + 5, y + 9, 3,  2, col);
  }

  /* ── tiny phantom sprite ─────────────────────────────────────────────────── */
  function drawErik(api, ex, ey) {
    var g = api.gfx, c = api.ctx;
    c.fillStyle = '#060010';
    c.beginPath(); c.moveTo(ex - 12, ey + 4); c.lineTo(ex + 12, ey + 4);
    c.lineTo(ex + 16, ey + 22); c.lineTo(ex - 16, ey + 22); c.closePath(); c.fill();
    g.rect(ex - 6, ey - 14, 12, 20, '#12061e');
    g.rect(ex - 5, ey - 24, 10, 12, '#18082a');
    g.rect(ex - 5, ey - 24, 5, 12, '#e8e0e0');
    g.rect(ex - 1, ey - 24, 1, 12, '#e0c050');
    g.rect(ex - 4, ey - 21, 2, 2, '#0a0008');
    g.rect(ex + 2, ey - 21, 2, 2, '#cc2233');
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id: 'phantom',
    title: 'THE PHANTOM OF THE OPERA',
    subtitle: 'FIVE SCENES BENEATH THE GARNIER',
    currency: 'DEVOTION',
    screens: {
      win: '#e0c050', lose: '#6a1020', chapterLabel: '#8a6080',
      name: '#f0e8f0', sub: '#cc2233', intro: '#d8c0d8',
      quote: '#8a6080', help: '#e0c050', score: '#f0e8f0',
      cur: '#e0c050', cta: '#f0e8f0', overlay: 'rgba(6,0,12,.90)'
    },
    labels: {
      chapter: 'SCENE', score: "PHANTOM'S GIFT",
      win: 'THE MUSIC PLAYS ON', lose: 'DARKNESS CLAIMS YOU',
      cont: 'TAP TO CONTINUE', finale: 'TAP TO FACE YOUR FATE',
      toMenu: 'TAP TO RETURN', play: 'ENTER THE OPERA'
    },
    accent: '#e0c050',
    credit: 'AFTER GASTON LEROUX, 1910',
    emblem, scenery,
    bootCta:   'ENTER THE OPERA',
    menuLabel: 'BENEATH THE PALAIS GARNIER',
    menuHint:  'CHOOSE A SCENE',
    menuDone:  'THE PHANTOM GOES FREE',
    menu: {
      colors: { title: '#e0c050', label: '#8a6080', cur: '#f0e8f0' },
      layout(api) {
        var W = api.W;
        return [
          { x: 8,         y: 86,  w: 116, h: 82 },
          { x: W - 124,   y: 86,  w: 116, h: 82 },
          { x: W/2 - 60,  y: 196, w: 120, h: 82 },
          { x: 8,         y: 308, w: 116, h: 82 },
          { x: W - 124,   y: 308, w: 116, h: 82 },
        ];
      },
      card(api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i, x = info.x, y = info.y,
            w = info.w, h = info.h, sel = info.sel, done = info.done;
        var cx2 = x + w / 2, royal = (i === 2);
        c.fillStyle = royal ? (sel ? '#200c30' : '#160828') : (sel ? '#1c0828' : '#100418');
        c.fillRect(x, y, w, h);
        c.strokeStyle = sel ? '#e0c050' : (done ? '#8a5830' : '#4a1850'); c.lineWidth = sel ? 2 : 1;
        c.strokeRect(x, y, w, h);
        c.strokeStyle = sel ? '#c8a030' : '#2a0c38'; c.lineWidth = 1;
        c.strokeRect(x + 4, y + 4, w - 8, h - 8);
        if (royal) { g.rect(cx2 - 20, y + 2, 40, 3, sel ? '#e0c050' : '#6a3080'); g.rect(cx2 - 2, y, 4, 7, sel ? '#e0c050' : '#6a3080'); }
        api.txtC(royal ? 'ROYAL BOX' : 'BOX ' + (i + 1), cx2, y + 16, 6, done ? '#e0c050' : '#7a4878', true);
        g.rect(x + 10, y + 24, w - 20, 1, sel ? '#4a2860' : '#1e0c28');
        api.txtCFit(ch.name, cx2, y + 38, 7, done ? '#e0c050' : '#f0e8f0', false, w - 10);
        if (ch.sub) api.txtCFit(ch.sub, cx2, y + 56, 6, '#8a6090', false, w - 10);
        if (done) {
          api.txtC('✶', cx2, y + h - 13, 9, '#e0c050');
        } else {
          g.rect(cx2 - 7, y + h - 15, 6, 9, '#e8e0e0');
          g.rect(cx2,     y + h - 15, 6, 9, '#1a0818');
          g.rect(cx2 - 1, y + h - 15, 2, 9, '#e0c050');
          g.rect(cx2 - 5, y + h - 12, 2, 2, '#0a0008');
          g.rect(cx2 + 2, y + h - 12, 2, 2, '#cc2233');
        }
      },
    },
    finale: ['THE PHANTOM RETREATS', 'DEEP INTO THE DARK.', '', 'FROM BELOW, FAINT MUSIC', 'DRIFTS THROUGH THE STONES.'],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ══════════════ SCENE 1: THE CATACOMBS ══════════════════════════════ */
      {
        id: 'catacombs', name: 'THE CATACOMBS', sub: 'INTO THE DARK',
        icon(api, x, y) {
          var g = api.gfx;
          g.rect(x - 8, y - 6,  16, 14, '#1e0c28'); g.rect(x - 6, y - 4, 12, 12, '#0a0010');
          g.rect(x - 6, y - 8,  12, 6,  '#1e0c28'); g.rect(x - 4, y - 10, 8, 6,  '#0a0010');
          g.rect(x + 3, y - 9,  2,  7,  '#5a3010'); g.rect(x + 2, y - 13, 4, 5,  '#c87020');
          g.rect(x + 3, y - 15, 2,  3,  '#f0d040');
        },
        intro: ['FIVE LEVELS OF CATACOMBS', 'LIE BENEATH THE PALAIS.', 'BELOW EVEN THOSE —', "ERIK'S HIDDEN LAIR."],
        quote: '"The Phantom of the Opera existed. He was not, as was long believed, a creature of the imagination." — Gaston Leroux, 1910',
        help: 'Slip through the torchlit passages without touching the guard\'s light. Tap LEFT or RIGHT side of screen to move. Reach the lair!',
        winText: 'THE LAIR IS REACHED',
        loseText: 'CAUGHT IN THE LIGHT',
        init(api) {
          this.erikX    = api.W / 2;
          this.erikY    = 370;
          this.spd      = 42;
          this.dist     = 0;
          this.goal     = 560;
          this.guards   = [];
          this.spawnT   = 0.4;
          this.caught   = false;
          this.cFlash   = 0;
          this.wallW    = 28;
          for (var i = 0; i < 3; i++) {
            this.guards.push({ side: i % 2, y: 120 + i * 160, phase: i * 1.1, spd: 0.7 + i * 0.15, len: 62 + i * 12, angle: 0 });
          }
        },
        update(api, dt) {
          var W = api.W, H = api.H;
          this.cFlash = Math.max(0, this.cFlash - dt * 4);
          if (this.caught) { if (this.cFlash <= 0) api.lose(); return; }

          var goL = api.keyDown('left')  || (api.pointer.down && api.pointer.x < W / 2);
          var goR = api.keyDown('right') || (api.pointer.down && api.pointer.x >= W / 2);
          if (goL) this.erikX -= 90 * dt;
          if (goR) this.erikX += 90 * dt;
          this.erikX = clamp(this.erikX, this.wallW + 6, W - this.wallW - 6);

          this.dist += this.spd * dt;
          this.spd = Math.min(74, 42 + this.dist * 0.04);
          if (this.dist >= this.goal) { api.addScore(200); api.win(); return; }

          this.spawnT -= dt;
          if (this.spawnT <= 0 && this.guards.length < 6) {
            this.spawnT = Math.max(0.9, 1.8 - this.dist / 600);
            this.guards.push({ side: this.guards.length % 2, y: H + 20, phase: Math.random() * Math.PI * 2, spd: 0.7 + Math.random() * 0.5, len: 55 + Math.random() * 40, angle: 0 });
          }

          for (var i = this.guards.length - 1; i >= 0; i--) {
            var gd = this.guards[i];
            gd.y -= this.spd * dt;
            if (gd.y < -30) { this.guards.splice(i, 1); continue; }
            var angle = Math.sin(api.t * gd.spd + gd.phase) * 0.7;
            gd.angle = gd.side === 0 ? angle : Math.PI + angle;
            var ox = gd.side === 0 ? 0 : W;
            var bx = Math.cos(gd.angle), by = Math.sin(gd.angle);
            var ex = this.erikX - ox, ey = this.erikY - gd.y;
            var proj = ex * bx + ey * by;
            if (proj > 4 && proj < gd.len) {
              var px2 = ex - proj * bx, py2 = ey - proj * by;
              if (Math.sqrt(px2 * px2 + py2 * py2) < 9) {
                this.caught = true; this.cFlash = 0.7;
                api.shake(7, 0.5); api.flash('#cc2233', 0.3); api.audio.sfx('hurt');
              }
            }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#060010'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#0e001e'; c.fillRect(0, 0, this.wallW, H); c.fillRect(W - this.wallW, 0, this.wallW, H);
          var stOff = (this.dist * 0.6) % 32;
          for (var wy = -stOff; wy < H + 4; wy += 32) {
            c.fillStyle = '#160028';
            c.fillRect(2, wy, this.wallW - 6, 2);
            c.fillRect(W - this.wallW + 4, wy + 16, this.wallW - 8, 2);
          }
          c.globalAlpha = 0.08; c.fillStyle = '#8070a0';
          var flOff = this.dist % 40;
          for (var fy = -flOff; fy < H; fy += 40) c.fillRect(this.wallW, fy, W - this.wallW * 2, 1);
          c.globalAlpha = 1;

          for (var i = 0; i < this.guards.length; i++) {
            var gd2 = this.guards[i];
            var ox2 = gd2.side === 0 ? 0 : W;
            var ex2 = ox2 + Math.cos(gd2.angle) * gd2.len;
            var ey2 = gd2.y + Math.sin(gd2.angle) * gd2.len;
            c.globalAlpha = 0.14; c.strokeStyle = '#f0c060'; c.lineWidth = 16;
            c.beginPath(); c.moveTo(ox2, gd2.y); c.lineTo(ex2, ey2); c.stroke();
            c.globalAlpha = 0.30; c.lineWidth = 6;
            c.beginPath(); c.moveTo(ox2, gd2.y); c.lineTo(ex2, ey2); c.stroke();
            c.globalAlpha = 1; c.lineWidth = 2; c.strokeStyle = '#f0e0a0';
            c.beginPath(); c.moveTo(ox2, gd2.y); c.lineTo(ex2, ey2); c.stroke();
            g.circle(ox2, gd2.y, 5, '#c87020'); g.circle(ox2, gd2.y, 2, '#f0e070');
          }

          var ek = this.erikX, ekY = this.erikY;
          if (this.caught && Math.floor(api.t * 12) % 2 === 0) {
            c.globalAlpha = 0.8; c.fillStyle = '#cc2233'; c.fillRect(ek - 14, ekY - 22, 28, 44); c.globalAlpha = 1;
          } else {
            drawErik(api, ek, ekY);
          }
          api.topBar('THE CATACOMBS');
          drawProg(api, this.dist / this.goal, '#e0c050');
          api.txtC('DEPTH', 6, 5, 6, '#8a6080');
        },
      },

      /* ══════════════ SCENE 2: THE MUSIC LESSON ════════════════════════════ */
      {
        id: 'lesson', name: 'THE MUSIC LESSON', sub: 'VOICES IN THE DARK',
        icon(api, x, y) {
          var g = api.gfx;
          g.rect(x - 1, y - 12, 3, 14, '#e0c050'); g.rect(x + 2, y - 14, 7, 3, '#e0c050');
          g.rect(x + 6, y - 12, 3, 9,  '#e0c050'); g.rect(x - 4, y + 1,  7, 5, '#e0c050');
          g.rect(x + 5, y - 2,  7, 5,  '#e0c050');
        },
        intro: ['IN HIS UNDERGROUND LAIR', 'ERIK TEACHES CHRISTINE', 'THE ARIA THAT WILL MAKE', 'HER THE STAR OF THE OPERA.'],
        quote: '"His voice... it did not seem to come from any one place." — Gaston Leroux',
        help: 'Catch the falling notes! Tap the LEFT, CENTER, or RIGHT zone as each note drops to your line. Hit all notes — don\'t miss more than four!',
        winText: 'THE ARIA SOARS',
        loseText: 'THE MELODY BREAKS',
        init(api) {
          this.cols   = [45, 135, 225];
          this.lineY  = 368;
          this.notes  = [];
          this.spawnT = 0;
          this.spawnI = 1.05;
          this.hits   = 0;
          this.misses = 0;
          this.goal   = 18;
          this.flashC = [0, 0, 0];
          this.nspd   = 88;
          this.combo  = 0;
        },
        update(api, dt) {
          var W = api.W;
          this.flashC = this.flashC.map(function(v) { return Math.max(0, v - dt * 3); });
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = this.spawnI;
            this.spawnI = Math.max(0.46, this.spawnI - 0.018);
            var col = Math.floor(Math.random() * 3);
            this.notes.push({ col: col, y: -14, hit: false, miss: false, fv: 0 });
            if (this.hits > 8 && Math.random() < 0.28) {
              var c2 = (col + 1 + Math.floor(Math.random() * 2)) % 3;
              this.notes.push({ col: c2, y: -14, hit: false, miss: false, fv: 0 });
            }
          }

          var tapped = -1;
          if (api.pointer.justDown) {
            tapped = api.pointer.x < W / 3 ? 0 : (api.pointer.x < W * 2 / 3 ? 1 : 2);
          } else if (api.keyPressed('left')  || api.keyPressed('a'))     { tapped = 0; }
          else if   (api.keyPressed('up')    || api.keyPressed('start')) { tapped = 1; }
          else if   (api.keyPressed('right') || api.keyPressed('b'))     { tapped = 2; }

          for (var i = this.notes.length - 1; i >= 0; i--) {
            var n = this.notes[i];
            n.y += this.nspd * dt;
            n.fv = Math.max(0, n.fv - dt * 3);
            if (!n.hit && !n.miss) {
              if (tapped === n.col && Math.abs(n.y - this.lineY) < 30) {
                n.hit = true; n.fv = 1;
                this.hits++; this.combo++;
                api.addScore(10 + Math.min(this.combo, 6) * 10);
                this.flashC[n.col] = 1;
                api.audio.sfx('coin'); api.burst(this.cols[n.col], this.lineY, '#e0c050', 5);
              } else if (n.y > this.lineY + 36) {
                n.miss = true; this.misses++; this.combo = 0;
                api.audio.sfx('blip'); api.flash('#6a1020', 0.15);
              }
            }
            if (n.y > 520) this.notes.splice(i, 1);
          }
          if (this.hits >= this.goal) { api.addScore(160); api.win(); }
          if (this.misses >= 5) api.lose();
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#04000c'); bg.addColorStop(1, '#0c001e');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);
          c.globalAlpha = 0.07;
          for (var pi = 0; pi < 9; pi++) { c.fillStyle = '#7060a0'; c.fillRect(6 + pi * 28, 20, 9 + pi * 4, 50 + pi * 18); }
          c.globalAlpha = 1;

          for (var ci = 0; ci < 3; ci++) {
            c.globalAlpha = 0.05; c.fillStyle = '#9080c0'; c.fillRect(this.cols[ci] - 22, 0, 44, H); c.globalAlpha = 1;
            var lc = this.flashC[ci] > 0 ? '#e0c050' : '#3a1850';
            g.rect(this.cols[ci] - 22, this.lineY, 44, 3, lc);
            if (this.flashC[ci] > 0) { c.globalAlpha = this.flashC[ci] * 0.2; c.fillStyle = '#e0c050'; c.fillRect(this.cols[ci] - 22, this.lineY - 10, 44, 24); c.globalAlpha = 1; }
          }

          for (var i = 0; i < this.notes.length; i++) {
            var n = this.notes[i], nx = this.cols[n.col], ny = n.y;
            if (n.hit) {
              c.globalAlpha = n.fv; g.circle(nx, ny, 13, '#f0e070'); g.circle(nx, ny, 9, '#e0c050'); c.globalAlpha = 1;
            } else if (n.miss) {
              c.globalAlpha = Math.max(0, 1 - (n.y - this.lineY) / 90); g.circle(nx, ny, 11, '#4a1020'); c.globalAlpha = 1;
            } else {
              g.circle(nx, ny, 13, '#2a0c38'); g.circle(nx, ny, 13, '#cc2233'); g.circle(nx, ny, 10, '#1c0828');
              c.fillStyle = '#e0c050'; c.beginPath(); c.ellipse(nx - 1, ny + 3, 7, 5, -0.28, 0, Math.PI * 2); c.fill();
              g.rect(nx + 5, ny - 14, 2, 18, '#e0c050'); g.rect(nx + 5, ny - 14, 9, 2, '#e0c050');
            }
          }

          for (var mi = 0; mi < 5; mi++) g.rect(W - 14 - mi * 14, 19, 10, 8, mi < this.misses ? '#6a1020' : '#1e0c2a');
          api.topBar('THE MUSIC LESSON');
          drawProg(api, this.hits / this.goal, '#e0c050');
          api.txtC('NOTES ' + this.hits + '/' + this.goal, 6, 5, 6, '#8a6080');
        },
      },

      /* ══════════════ SCENE 3: THE ROOFTOP ════════════════════════════════ */
      {
        id: 'rooftop', name: 'THE ROOFTOP', sub: 'ABOVE THE GARNIER',
        icon(api, x, y) {
          var g = api.gfx;
          g.circle(x + 7, y - 9, 7, '#c8b080'); g.circle(x + 10, y - 10, 6, '#06000e');
          g.rect(x - 12, y + 1, 24, 4, '#1e0c28'); g.rect(x - 14, y - 3, 4, 6, '#1e0c28');
          g.rect(x + 10, y - 3, 4, 6, '#1e0c28');   g.rect(x - 4,  y - 5, 8, 7, '#1e0c28');
        },
        intro: ['RAOUL FINDS CHRISTINE', 'ON THE GOLDEN ROOF.', "GUARDS SWEEP THEIR LIGHTS.", 'KEEP HER IN THE DARK.'],
        quote: '"And now, Raoul, listen. I am not what they call me — the Phantom." — Gaston Leroux',
        help: 'Move left and right to intercept the glowing searchlight orbs before they reach Christine. Tap LEFT or RIGHT side. Block enough orbs to protect her!',
        winText: 'CHRISTINE IS SAFE',
        loseText: 'DISCOVERED',
        init(api) {
          this.erikX   = api.W / 2;
          this.erikY   = 360;
          this.christX = api.W / 2;
          this.christY = 278;
          this.orbs    = [];
          this.spawnT  = 1.0;
          this.health  = 5;
          this.blocked = 0;
          this.goal    = 16;
          this.espd    = 120;
        },
        update(api, dt) {
          var W = api.W;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W / 2))  this.erikX -= this.espd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= W / 2)) this.erikX += this.espd * dt;
          this.erikX = clamp(this.erikX, 16, W - 16);

          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.6, 1.1 - this.blocked * 0.025);
            var fromL = Math.random() < 0.5;
            var sx = fromL ? -10 : W + 10, sy = 220 + Math.random() * 100;
            var tx = this.christX + (Math.random() - 0.5) * 40;
            var ty = this.christY + (Math.random() - 0.5) * 30;
            var ddx = tx - sx, ddy = ty - sy, dd = Math.sqrt(ddx * ddx + ddy * ddy);
            var spd = 75 + this.blocked * 2;
            this.orbs.push({ x: sx, y: sy, vx: (ddx / dd) * spd, vy: (ddy / dd) * spd, r: 9 });
          }

          for (var i = this.orbs.length - 1; i >= 0; i--) {
            var o = this.orbs[i];
            o.x += o.vx * dt; o.y += o.vy * dt;
            var ex2 = o.x - this.erikX, ey2 = o.y - this.erikY;
            if (Math.sqrt(ex2 * ex2 + ey2 * ey2) < o.r + 16) {
              this.orbs.splice(i, 1); this.blocked++;
              api.addScore(30); api.burst(o.x, o.y, '#e0c050', 6); api.audio.sfx('coin');
              continue;
            }
            var cx2 = o.x - this.christX, cy2 = o.y - this.christY;
            if (Math.sqrt(cx2 * cx2 + cy2 * cy2) < o.r + 14) {
              this.orbs.splice(i, 1); this.health--;
              api.flash('#cc2233', 0.28); api.shake(5, 0.3); api.audio.sfx('hurt');
              continue;
            }
            if (o.x < -30 || o.x > api.W + 30 || o.y > api.H + 30) this.orbs.splice(i, 1);
          }
          if (this.blocked >= this.goal) { api.addScore(180); api.win(); }
          if (this.health <= 0) api.lose();
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var sky = c.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#04000c'); sky.addColorStop(1, '#0c0818');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          for (var i = 0; i < 26; i++) {
            var ssx = (i * 83 + 11) % W, ssy = (i * 41 + 3) % 160;
            c.globalAlpha = 0.15 + 0.18 * Math.sin(api.t * 1.1 + i); g.rect(ssx, ssy, 1, 1, '#d0c8e0');
          }
          c.globalAlpha = 1;
          g.circle(W - 46, 46, 24, '#c8b080'); g.circle(W - 40, 42, 19, '#08000e');
          c.fillStyle = '#140826'; c.fillRect(0, H - 108, W, 108);
          for (var di = 0; di < 3; di++) {
            g.rect(22 + di * 80, H - 118, 36, 5, '#8a5a10');
            g.rect(24 + di * 80, H - 122, 32, 5, '#e0c050');
          }
          g.rect(0, H - 108, W, 2, '#e0c050');

          for (var i = 0; i < this.orbs.length; i++) {
            var o = this.orbs[i];
            c.globalAlpha = 0.25; c.fillStyle = '#f0e080'; c.beginPath(); c.arc(o.x, o.y, o.r + 8, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
            g.circle(o.x, o.y, o.r, '#f0e080'); g.circle(o.x, o.y, o.r - 3, '#f8f0a0');
          }

          var chX = this.christX, chY = this.christY;
          c.fillStyle = '#d0c8f0'; c.beginPath(); c.arc(chX, chY - 16, 9, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#e8e4f8';
          c.beginPath(); c.moveTo(chX - 11, chY - 7); c.lineTo(chX + 11, chY - 7);
          c.lineTo(chX + 15, chY + 18); c.lineTo(chX - 15, chY + 18); c.closePath(); c.fill();

          drawErik(api, this.erikX, this.erikY);

          for (var hi = 0; hi < 5; hi++) heart(api, W - 17 - hi * 16, 18, hi < this.health);
          api.topBar('THE ROOFTOP');
          drawProg(api, this.blocked / this.goal, '#e0c050');
          api.txtC('SHIELDED ' + this.blocked + '/' + this.goal, 6, 5, 6, '#8a6080');
        },
      },

      /* ══════════════ SCENE 4: THE CHANDELIER ═════════════════════════════ */
      {
        id: 'chandelier', name: 'THE CHANDELIER', sub: 'LET IT FALL',
        icon(api, x, y) {
          var g = api.gfx;
          g.rect(x - 1, y - 13, 2, 4, '#c8a030'); g.rect(x - 9, y - 9, 18, 7, '#c8a030');
          g.rect(x - 7, y - 3, 14, 4, '#c8a030');
          g.rect(x - 8, y + 1, 3, 6, '#c8a030'); g.rect(x - 2, y + 1, 3, 6, '#c8a030'); g.rect(x + 5, y + 1, 3, 6, '#c8a030');
          g.rect(x - 8, y + 6, 2, 3, '#f0d040'); g.rect(x - 2, y + 6, 2, 3, '#f0d040'); g.rect(x + 5, y + 6, 2, 3, '#f0d040');
        },
        intro: ['FROM BOX FIVE, THE PHANTOM', 'SEIZES THE COUNTERWEIGHT.', 'THE GREAT CHANDELIER', 'HANGS — WAITING TO FALL.'],
        quote: '"...and then the chandelier crashed down upon the crowd!" — Gaston Leroux',
        help: 'The chandelier swings like a pendulum. Tap (or press SPACE) when it passes over the glowing TARGET ZONE to cut the rope. Cut all three ropes!',
        winText: 'THE CHANDELIER FALLS',
        loseText: 'THE ROPE HOLDS FAST',
        init(api) {
          this.phase     = 0;
          this.freq      = 0.55;
          this.amp       = 88;
          this.chanX     = api.W / 2;
          this.hangs     = 3;
          this.cut       = 0;
          this.tgtW      = 46;
          this.cutFlash  = 0;
          this.cooldown  = 0;
          this.misses    = 0;
          this.maxMiss   = 6;
          this.doneTimer = -1;
        },
        update(api, dt) {
          var W = api.W;
          this.phase += this.freq * dt * Math.PI * 2;
          this.chanX = W / 2 + Math.sin(this.phase) * this.amp;
          this.cutFlash = Math.max(0, this.cutFlash - dt * 3);
          this.cooldown = Math.max(0, this.cooldown - dt);
          if (this.doneTimer > 0) {
            this.doneTimer -= dt;
            if (this.doneTimer <= 0) { api.addScore(200); api.win(); }
            return;
          }
          var cut = api.pointer.justDown || api.keyPressed('a') || api.keyPressed('up') || api.keyPressed('start') || api.keyPressed('b');
          if (cut && this.cooldown <= 0) {
            if (Math.abs(this.chanX - W / 2) < this.tgtW / 2 + 8) {
              this.cut++; this.cutFlash = 1; this.cooldown = 0.5;
              this.tgtW = Math.max(22, this.tgtW - 10); this.freq = Math.min(0.9, this.freq + 0.1);
              api.shake(9, 0.5); api.audio.sfx('explode');
              api.burst(this.chanX, 90, '#e0c050', 10); api.addScore(100 + (6 - this.misses) * 10);
              if (this.cut >= this.hangs) this.doneTimer = 0.9;
            } else {
              this.misses++; this.cooldown = 0.25;
              api.audio.sfx('blip'); api.flash('#6a1020', 0.18);
              if (this.misses >= this.maxMiss && this.cut < this.hangs) api.lose();
            }
          }
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#06000e'); bg.addColorStop(1, '#0c0820');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);
          c.fillStyle = '#0e0520';
          for (var ai = 0; ai < 20; ai++) {
            var aax = 8 + (ai % 10) * 25, aay = H - 58 + Math.floor(ai / 10) * 22;
            c.beginPath(); c.arc(aax + 9, aay, 9, Math.PI, 0); c.fill();
            c.fillRect(aax, aay, 18, 20);
          }

          var tp = 0.08 + 0.08 * Math.sin(api.t * 3.5);
          c.globalAlpha = tp + (this.cutFlash > 0 ? 0.35 : 0); c.fillStyle = '#cc2233';
          c.fillRect(W / 2 - this.tgtW / 2, H - 78, this.tgtW, 14); c.globalAlpha = 1;
          g.rect(W / 2 - this.tgtW / 2, H - 78, this.tgtW, 3, '#cc2233');

          var chainCol = this.doneTimer > 0 ? '#4a2a08' : '#c8a030';
          for (var cy3 = 0; cy3 < 72; cy3 += 8) g.rect(W / 2 - 1, cy3, 2, 6, chainCol);

          var chX2 = this.chanX, chTop = 82;
          if (this.cutFlash > 0.08) { c.globalAlpha = this.cutFlash * 0.4; g.circle(chX2, chTop + 18, 34, '#f0e060'); c.globalAlpha = 1; }
          for (var li = 0; li < 6; li++) {
            var lla = (li / 6) * Math.PI * 2 + this.phase * 0.1;
            var llx = chX2 + Math.cos(lla) * 26, lly = chTop + Math.sin(lla) * 9;
            g.rect(llx - 1, lly, 2, 12, '#c8a030'); g.rect(llx - 1, lly + 11, 2, 5, '#c87020');
            var fl = 0.5 + 0.5 * Math.sin(api.t * 7 + li * 1.1);
            c.globalAlpha = fl; g.rect(llx - 1, lly + 9, 2, 4, '#f0d040');
            c.globalAlpha = 0.04 * fl; c.fillStyle = '#f0d040'; c.beginPath(); c.arc(llx, lly + 12, 16, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          }
          c.fillStyle = '#c8a030'; c.beginPath(); c.ellipse(chX2, chTop, 28, 11, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#e0c050'; c.beginPath(); c.ellipse(chX2, chTop, 18, 6,  0, 0, Math.PI * 2); c.fill();

          c.globalAlpha = 0.10; c.strokeStyle = '#e0c050'; c.lineWidth = 1;
          c.setLineDash([4, 4]);
          c.beginPath(); c.moveTo(chX2, chTop + 16); c.lineTo(chX2, H - 78); c.stroke();
          c.setLineDash([]); c.globalAlpha = 1;

          for (var ri = 0; ri < this.hangs; ri++) {
            var rx = W / 2 - 34 + ri * 34, ry = 20;
            g.rect(rx, ry, 26, 10, ri < this.cut ? '#1a0828' : '#c8a030');
            api.txtC(ri < this.cut ? '✶' : 'CUT', rx + 13, ry + 1, 6, ri < this.cut ? '#6a4080' : '#0a0014', true);
          }
          api.txtC('TRIES: ' + (this.maxMiss - this.misses), W - 4, H - 14, 6, '#8a6080', false);
          api.topBar('THE CHANDELIER');
        },
      },

      /* ══════════════ SCENE 5: THE LAKE ════════════════════════════════════ */
      {
        id: 'lake', name: 'THE LAKE', sub: 'FLEE INTO THE DARK',
        icon(api, x, y) {
          var g = api.gfx;
          g.rect(x - 11, y + 2, 22, 9, '#2a1020'); g.rect(x - 9, y, 18, 4, '#3a1830');
          g.rect(x - 11, y + 5, 3, 6, '#3a1830'); g.rect(x + 5, y - 8, 2, 18, '#3a2010');
          g.rect(x - 14, y + 10, 28, 3, '#1a0c38'); g.rect(x - 12, y + 13, 24, 2, '#140a30');
        },
        intro: ['CHRISTINE TEARS THE MASK', "FROM ERIK'S FACE.", 'RAOUL AND THE MOB PURSUE.', 'FLEE ACROSS THE LAKE.'],
        quote: '"Ah, you wanted to see! See! Feast your eyes, glut your soul on my cursed ugliness!" — Gaston Leroux',
        help: 'Steer the gondola left and right to dodge the rocks and Raoul\'s lanterns. Tap LEFT or RIGHT side. Reach the far shore! Watch your three lives.',
        winText: 'FREEDOM IN THE DARK',
        loseText: 'CAPTURED AT THE LAKE',
        init(api) {
          this.boatX   = api.W / 2;
          this.boatY   = 370;
          this.dist    = 0;
          this.goal    = 680;
          this.obs     = [];
          this.spawnT  = 0.6;
          this.lives   = 3;
          this.hitCD   = 0;
          this.ripples = [];
          this.bspd    = 110;
        },
        update(api, dt) {
          var W = api.W, H = api.H;
          this.dist  += 78 * dt;
          this.hitCD  = Math.max(0, this.hitCD - dt);
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < W / 2))  this.boatX -= this.bspd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= W / 2)) this.boatX += this.bspd * dt;
          this.boatX = clamp(this.boatX, 22, W - 22);

          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.44, 0.86 - this.dist / 2000);
            var isL = this.dist > 300 && Math.random() < 0.32;
            this.obs.push({ x: 22 + Math.random() * (W - 44), y: -22, vy: 68 + this.dist * 0.035, type: isL ? 'l' : 'r', r: isL ? 12 : 10 });
          }

          for (var i = this.obs.length - 1; i >= 0; i--) {
            var o = this.obs[i];
            o.y += o.vy * dt;
            if (o.y > H + 30) { this.obs.splice(i, 1); continue; }
            if (this.hitCD <= 0) {
              var ddx = o.x - this.boatX, ddy = o.y - this.boatY;
              if (Math.sqrt(ddx * ddx + ddy * ddy) < o.r + 13) {
                this.obs.splice(i, 1); this.lives--; this.hitCD = 1.3;
                api.shake(6, 0.45); api.flash('#cc2233', 0.3); api.audio.sfx('hurt');
                continue;
              }
            }
          }

          this.ripples.push({ x: this.boatX, y: this.boatY + 12, r: 3, life: 0.55 });
          for (var i = this.ripples.length - 1; i >= 0; i--) {
            this.ripples[i].life -= dt; this.ripples[i].r += 7 * dt;
            if (this.ripples[i].life <= 0) this.ripples.splice(i, 1);
          }
          if (this.dist >= this.goal) { api.addScore(260); api.win(); }
          if (this.lives <= 0) api.lose();
        },
        draw(api) {
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#04000a'); bg.addColorStop(1, '#0a0616');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          for (var wi = 0; wi < 7; wi++) {
            c.globalAlpha = 0.03; c.fillStyle = '#6050a0';
            c.fillRect(0, 44 + wi * 60 + Math.sin(api.t * 1.4 + wi) * 8, W, 2); c.globalAlpha = 1;
          }
          c.fillStyle = '#080012'; c.fillRect(0, 0, 12, H); c.fillRect(W - 12, 0, 12, H);
          for (var si = 0; si < 7; si++) {
            var stx = 16 + si * 36, sth = 18 + (si * 17 + 5) % 32;
            c.fillStyle = '#100020'; c.beginPath(); c.moveTo(stx, 0); c.lineTo(stx + 11, 0); c.lineTo(stx + 5, sth); c.closePath(); c.fill();
          }

          c.strokeStyle = '#6050a0'; c.lineWidth = 1;
          for (var i = 0; i < this.ripples.length; i++) {
            var rip = this.ripples[i];
            c.globalAlpha = rip.life * 0.35; c.beginPath(); c.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2); c.stroke();
          }
          c.globalAlpha = 1;

          for (var i = 0; i < this.obs.length; i++) {
            var o = this.obs[i];
            if (o.type === 'r') {
              c.fillStyle = '#22103a'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, Math.PI * 2); c.fill();
              c.fillStyle = '#160828'; c.beginPath(); c.arc(o.x - 3, o.y - 3, o.r * 0.45, 0, Math.PI * 2); c.fill();
            } else {
              g.circle(o.x, o.y, o.r, '#6a3a08'); g.circle(o.x, o.y, o.r - 4, '#c87020');
              c.globalAlpha = 0.14; c.fillStyle = '#f0c030'; c.beginPath(); c.arc(o.x, o.y, o.r + 14, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
            }
          }

          var bx = this.boatX, by = this.boatY;
          var blink = this.hitCD > 0 && Math.floor(api.t * 10) % 2 === 0;
          c.fillStyle = blink ? '#cc2233' : '#20100c';
          c.beginPath(); c.moveTo(bx - 20, by); c.lineTo(bx + 20, by);
          c.lineTo(bx + 15, by + 14); c.lineTo(bx - 15, by + 14); c.closePath(); c.fill();
          c.fillStyle = '#301820';
          c.beginPath(); c.moveTo(bx - 15, by); c.lineTo(bx - 24, by + 6); c.lineTo(bx - 20, by + 14); c.closePath(); c.fill();
          g.rect(bx + 7, by - 26, 2, 40, '#3a2010');
          g.rect(bx - 5, by - 22, 9, 12, '#12061e');
          g.rect(bx - 4, by - 22, 4, 12, '#e8e0e0');
          g.rect(bx - 1, by - 22, 1, 12, '#e0c050');
          g.rect(bx - 3, by - 18, 2,  2, '#0a0008');
          g.rect(bx + 2, by - 18, 2,  2, '#cc2233');

          for (var li = 0; li < 3; li++) heart(api, 8 + li * 18, 19, li < this.lives);
          api.topBar('THE LAKE');
          drawProg(api, this.dist / this.goal, '#e0c050');
          api.txtC('ESCAPE', W - 4, 5, 6, '#8a6080', false);
        },
      },
    ],
  });
})();
