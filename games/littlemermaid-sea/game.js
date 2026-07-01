/* ============================================================================
 * THE LITTLE MERMAID — THE SEA KING'S DAUGHTER
 * Five tides from H. C. Andersen's 1837 fairy tale:
 *   1. THE SUNKEN KINGDOM  — swim to the surface (left/right steer-dodge)
 *   2. THE SEA WITCH'S CAVE — navigate past tentacles (free 2-D dodge)
 *   3. THE RAGING STORM    — rescue the drowning prince (horizontal track)
 *   4. THE PALACE BALL     — dance despite the pain (L/R tap timing)
 *   5. THE FINAL DAWN      — catch the sea-spirit gifts (catch & dodge)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  // Bright, magical underwater palette — children's fairy tale, NOT dark
  var C = {
    ocean:   '#021830',
    azure:   '#0a4870',
    seafoam: '#00d4b8',
    teal:    '#00a896',
    pearl:   '#f0f8ff',
    coral:   '#ff6b8a',
    anemone: '#ff4870',
    gold:    '#f0c040',
    sand:    '#d4b870',
    kelp:    '#1a6840',
    lilac:   '#a098e0',
    skin:    '#ffc890',
    hair:    '#00a888',
    tail:    '#00c8a8',
    dark:    '#010810',
  };

  // Shared mermaid silhouette for emblem and in-game sprites
  function drawMermaid(api, mx, my, blink) {
    if (blink) return;
    var g = api.gfx, c = api.ctx;
    // Tail fin
    c.fillStyle = C.tail;
    c.beginPath();
    c.moveTo(mx, my + 16);
    c.lineTo(mx - 12, my + 26); c.lineTo(mx - 5, my + 19);
    c.lineTo(mx, my + 22); c.lineTo(mx + 5, my + 19);
    c.lineTo(mx + 12, my + 26);
    c.closePath(); c.fill();
    // Body
    c.fillStyle = C.seafoam; c.fillRect(mx - 5, my, 10, 17);
    // Head
    g.circle(mx, my - 9, 8, C.skin);
    // Flowing hair
    c.fillStyle = C.hair;
    c.fillRect(mx - 8, my - 18, 3, 12); c.fillRect(mx + 5, my - 18, 3, 14);
    // Shell bra
    g.circle(mx - 3, my - 2, 3, C.coral); g.circle(mx + 3, my - 2, 3, C.coral);
  }

  function drawHearts(api, lives, x, y) {
    var c = api.ctx;
    for (var i = 0; i < 3; i++) {
      var hx = x + i * 20, hy = y;
      if (i < lives) {
        c.fillStyle = C.coral;
        c.beginPath();
        c.arc(hx + 3, hy + 2, 3.5, Math.PI, 0);
        c.arc(hx + 9, hy + 2, 3.5, Math.PI, 0);
        c.lineTo(hx + 6, hy + 11); c.closePath(); c.fill();
      } else {
        c.strokeStyle = '#603050'; c.lineWidth = 1.5;
        c.beginPath();
        c.arc(hx + 3, hy + 2, 3.5, Math.PI, 0);
        c.arc(hx + 9, hy + 2, 3.5, Math.PI, 0);
        c.lineTo(hx + 6, hy + 11); c.closePath(); c.stroke();
      }
    }
  }

  // ── Emblem: mermaid silhouette + starfish ──────────────────────────────────
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    // Glowing halo
    var halo = c.createRadialGradient(cx, cy - 10, 5, cx, cy - 10, 45);
    halo.addColorStop(0, 'rgba(0,212,184,.22)');
    halo.addColorStop(1, 'rgba(0,212,184,0)');
    c.fillStyle = halo; c.beginPath(); c.arc(cx, cy - 10, 45, 0, 7); c.fill();
    // Tail fin
    c.fillStyle = C.tail;
    c.beginPath();
    c.moveTo(cx, cy + 28); c.lineTo(cx - 22, cy + 52); c.lineTo(cx - 8, cy + 36);
    c.lineTo(cx, cy + 44); c.lineTo(cx + 8, cy + 36); c.lineTo(cx + 22, cy + 52);
    c.closePath(); c.fill();
    // Body
    c.fillStyle = C.seafoam; c.fillRect(cx - 7, cy + 4, 14, 26);
    // Head
    g.circle(cx, cy - 8, 14, C.skin);
    // Hair
    c.fillStyle = C.hair;
    c.fillRect(cx - 14, cy - 24, 5, 18); c.fillRect(cx + 9, cy - 24, 5, 22);
    // Shell
    g.circle(cx - 5, cy + 6, 4, C.coral); g.circle(cx + 5, cy + 6, 4, C.coral);
    // Starfish at tail join
    c.fillStyle = C.gold;
    c.beginPath();
    for (var i = 0; i < 5; i++) {
      var a = (i * 2 * Math.PI / 5) - Math.PI / 2;
      var r = i % 2 === 0 ? 8 : 3.5;
      if (i === 0) c.moveTo(cx + Math.cos(a) * r, cy + 40 + Math.sin(a) * r);
      else c.lineTo(cx + Math.cos(a) * r, cy + 40 + Math.sin(a) * r);
    }
    c.closePath(); c.fill();
  }

  // ── Scenery: menu = bright sunlit shallows; other = deep magical ocean ─────
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Bright, colourful sunlit underwater world for chapter select
      var sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#083c60'); sky.addColorStop(0.55, '#052840'); sky.addColorStop(1, '#031828');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);

      // Sunlight shafts from above
      c.globalAlpha = 0.10 + 0.04 * Math.sin(t * 0.38);
      c.fillStyle = '#80eeff';
      c.beginPath(); c.moveTo(W * 0.18, 0); c.lineTo(W * 0.46, 0); c.lineTo(W * 0.32, H * 0.72); c.lineTo(W * 0.08, H * 0.72); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(W * 0.62, 0); c.lineTo(W * 0.88, 0); c.lineTo(W * 0.76, H * 0.58); c.lineTo(W * 0.58, H * 0.58); c.closePath(); c.fill();
      c.globalAlpha = 1;

      // Sandy floor
      c.fillStyle = '#a88540'; c.fillRect(0, H - 48, W, 48);
      c.fillStyle = C.sand;
      for (var i = 0; i < 28; i++) { c.fillRect((i * 11 + 3) % W, H - 48, 7, 2); }

      // Swaying kelp
      var kxs = [8, 22, 238, 254, 128];
      var khs = [78, 60, 68, 52, 48];
      var kcs = ['#1a6840', '#206848', '#287848', '#1a5830', '#308850'];
      for (var ki = 0; ki < 5; ki++) {
        c.strokeStyle = kcs[ki]; c.lineWidth = 5;
        c.beginPath(); c.moveTo(kxs[ki], H - 48);
        var segs = Math.ceil(khs[ki] / 10);
        for (var j = 1; j <= segs; j++) {
          c.lineTo(kxs[ki] + Math.sin(t * 0.8 + ki + j * 0.4) * 8, H - 48 - j * 10);
        }
        c.stroke();
      }

      // Coral formations
      var corals = [[40, H - 52], [110, H - 54], [170, H - 50], [228, H - 52]];
      var coralColors = ['#ff6080', '#ff9040', '#ff60b0', '#e86030'];
      for (var ci = 0; ci < corals.length; ci++) {
        var cxp = corals[ci][0], cyp = corals[ci][1];
        c.fillStyle = coralColors[ci];
        c.beginPath(); c.arc(cxp, cyp, 6 + (ci % 3) * 2, 0, 7); c.fill();
        c.beginPath(); c.arc(cxp - 5, cyp - 4, 4, 0, 7); c.fill();
        c.beginPath(); c.arc(cxp + 5, cyp - 4, 4, 0, 7); c.fill();
      }

      // Small fish swimming
      var fishColors = ['#ff8060', '#f0c030', '#00c090', '#ff6090', '#40b8ff'];
      for (var fi = 0; fi < 5; fi++) {
        var fx = ((t * (10 + fi * 5) + fi * 60) % (W + 30)) - 15;
        var fy = 85 + fi * 50 + Math.sin(t * 1.2 + fi) * 16;
        g.sprite(['.bb.', 'bbb.', '.bb.'], fx, fy, { b: fishColors[fi] }, 2);
      }

      // Rising bubbles
      for (var bi = 0; bi < 14; bi++) {
        var bx = (bi * 23 + 9) % W;
        var by = ((H - 60 - (t * 20 + bi * 42)) % (H - 60) + (H - 60)) % (H - 60) + 5;
        c.globalAlpha = 0.45; c.strokeStyle = '#b0f0ff'; c.lineWidth = 1;
        c.beginPath(); c.arc(bx, by, 2 + (bi % 3), 0, 7); c.stroke();
        c.globalAlpha = 1;
      }

    } else {
      // Deep ocean — mysterious, bioluminescent — for title / intro / result / finale
      var deep = c.createLinearGradient(0, 0, 0, H);
      deep.addColorStop(0, '#020c18'); deep.addColorStop(0.6, '#031428'); deep.addColorStop(1, '#010810');
      c.fillStyle = deep; c.fillRect(0, 0, W, H);

      // Bioluminescent drift particles
      for (var pi = 0; pi < 30; pi++) {
        var px = (pi * 79 + 11) % W, py = (pi * 113 + 23) % H;
        c.globalAlpha = 0.10 + 0.20 * Math.sin(t * 2.3 + pi * 0.8);
        var pcol = pi % 3 === 0 ? C.seafoam : pi % 3 === 1 ? C.coral : '#80d8ff';
        g.rect(px, py, 2, 2, pcol);
      }
      c.globalAlpha = 1;

      // Swaying side kelp
      var skxs = [4, 18, 242, 258, 126, 142];
      for (var ski = 0; ski < 6; ski++) {
        c.strokeStyle = C.kelp; c.lineWidth = 3;
        c.beginPath(); c.moveTo(skxs[ski], H);
        for (var sj = 0; sj < 9; sj++) {
          c.lineTo(skxs[ski] + Math.sin(t * 0.5 + ski * 0.9 + sj * 0.5) * 7, H - sj * 38);
        }
        c.stroke();
      }

      // Faint surface light column
      c.globalAlpha = 0.06 + 0.02 * Math.sin(t * 0.3);
      c.fillStyle = '#40a0c0';
      c.beginPath(); c.moveTo(W * 0.36, 0); c.lineTo(W * 0.64, 0); c.lineTo(W * 0.56, H * 0.38); c.lineTo(W * 0.44, H * 0.38); c.closePath(); c.fill();
      c.globalAlpha = 1;

      if (scene === 'intro' || scene === 'finale' || scene === 'result') {
        c.fillStyle = 'rgba(1,8,18,.72)'; c.fillRect(0, 0, W, H);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  RetroSaga.create({
    id: 'littlemermaid',
    title: "The Sea King's Daughter",
    subtitle: 'A TALE IN FIVE TIDES',
    currency: 'PEARLS',
    screens: {
      win:          '#00d4b8',
      lose:         '#904060',
      chapterLabel: '#3a8090',
      name:         '#80e8f8',
      sub:          '#00c0a8',
      intro:        '#b0e0f8',
      quote:        '#4a8090',
      help:         '#00d4b8',
      score:        '#c8f0f8',
      cur:          '#00c8b8',
      cta:          '#80e8f8',
      overlay:      'rgba(2,12,24,.86)',
    },
    labels: {
      chapter:  'TIDE',
      score:    'PEARLS WON',
      win:      'THE SEA SMILES ON YOU',
      lose:     'THE DEPTHS HOLD YOU',
      cont:     'TAP TO SWIM ON',
      finale:   'TAP FOR THE FINAL TIDE',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO DIVE',
    },
    accent:    '#00d4b8',
    credit:    'AN 8-BIT TRIBUTE · H. C. ANDERSEN, 1837',
    emblem:    emblem,
    scenery:   scenery,
    bootCta:   'DIVE DEEP',
    menuLabel: 'TIDES OF ANDERSEN',
    menuHint:  'CHOOSE A TIDE TO SWIM',
    menuDone:  'ALL FIVE TIDES CLEARED',
    menu: {
      colors: { title: '#00d4b8', label: '#3a8090', cur: '#80e8f8', hint: '#3a8090' },
      // Five oyster shells scattered on the ocean floor — organic, non-list layout
      layout: function (api) {
        return [
          { x:  16, y: 128, w: 76, h: 58 },
          { x: 176, y: 104, w: 76, h: 58 },
          { x:  10, y: 252, w: 76, h: 58 },
          { x: 172, y: 258, w: 76, h: 58 },
          { x:  90, y: 372, w: 76, h: 58 },
        ];
      },
      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i, x = info.x, y = info.y, w = info.w, h = info.h, sel = info.sel, done = info.done;
        var cx = x + w / 2, cy = y + h / 2;

        // Oyster shell body (ellipse)
        c.fillStyle = sel ? '#3a6080' : '#1e3a50';
        c.beginPath(); c.ellipse(cx, cy + 8, w / 2 - 3, 20, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = sel ? C.seafoam : '#1a3040'; c.lineWidth = sel ? 2 : 1; c.stroke();

        // Shell ribs radiating from hinge
        c.globalAlpha = 0.22; c.strokeStyle = '#80c0d8'; c.lineWidth = 1;
        for (var r = 0; r < 5; r++) {
          var ra = -Math.PI * 0.55 + r * Math.PI * 0.27;
          c.beginPath(); c.moveTo(cx, cy + 8);
          c.lineTo(cx + Math.cos(ra) * (w / 2 - 3), cy + 8 + Math.sin(ra) * 20); c.stroke();
        }
        c.globalAlpha = 1;

        // Pearl inside if cleared
        if (done) {
          var pgrd = c.createRadialGradient(cx - 2, cy + 6, 1, cx, cy + 10, 9);
          pgrd.addColorStop(0, '#ffffff'); pgrd.addColorStop(0.5, '#c0f0f8'); pgrd.addColorStop(1, 'rgba(0,200,180,0)');
          c.fillStyle = pgrd; c.beginPath(); c.arc(cx, cy + 10, 9, 0, 7); c.fill();
          g.circle(cx, cy + 10, 6, '#f0f8ff'); g.circle(cx - 2, cy + 8, 2, '#ffffff');
        } else if (sel) {
          c.globalAlpha = 0.35; g.circle(cx, cy + 10, 5, '#c0e8f8'); c.globalAlpha = 1;
        }

        // Number badge
        c.fillStyle = done ? C.seafoam : sel ? '#6ab0c8' : '#253850';
        c.beginPath(); c.arc(cx, y + 12, 11, 0, 7); c.fill();
        api.txtC('' + (i + 1), cx, y + 7, 9, done ? '#001820' : '#f0f8ff', true);

        // Chapter name below
        api.txtCFit(ch.name, cx, y + h + 3, 7, done ? C.seafoam : sel ? '#80d8f8' : '#4a7888', false, w + 18);
      },
      title: function (api, total) {
        var W = api.W;
        // Bubble-framed title banner
        api.ctx.fillStyle = 'rgba(2,24,44,.75)';
        api.ctx.beginPath(); api.ctx.roundRect(14, 12, W - 28, 60, 8); api.ctx.fill();
        api.ctx.strokeStyle = '#004a60'; api.ctx.lineWidth = 1; api.ctx.stroke();
        api.txtCFit("THE SEA KING'S DAUGHTER", W / 2, 18, 11, C.seafoam, true, W - 36);
        api.txtC('TIDES OF ANDERSEN', W / 2, 40, 8, '#3a8090');
        api.txtC('PEARLS  ' + total, W / 2, 54, 8, C.teal);
      },
    },
    finale: [
      'THE MERMAID LEAPS',
      'INTO THE SUNRISE SEA.',
      '',
      'SHE BECOMES A SPIRIT',
      'OF THE MORNING AIR.',
      '',
      'THREE HUNDRED YEARS',
      'SHE EARNS HER SOUL.',
    ],
    width: 270, height: 480, parent: '#game',
    palette: { seafoam: C.seafoam, coral: C.coral, pearl: C.pearl, gold: C.gold },

    chapters: [

      /* ═══════════════════ TIDE 1 · THE SUNKEN KINGDOM ═══════════════════ */
      {
        id: 'kingdom', name: 'SUNKEN KINGDOM', sub: 'RISE TO THE SURFACE',
        icon: function (api, x, y) {
          var c = api.ctx;
          var pgrd = c.createRadialGradient(x - 2, y - 2, 1, x, y, 9);
          pgrd.addColorStop(0, '#ffffff'); pgrd.addColorStop(0.5, '#b0f0f8'); pgrd.addColorStop(1, 'rgba(0,200,180,0)');
          c.fillStyle = pgrd; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill();
          c.strokeStyle = C.seafoam; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 9, 0, 7); c.stroke();
        },
        intro: [
          'THE MERMAID TURNS',
          'FIFTEEN TODAY.',
          'AT LAST SHE MAY RISE',
          'to see the surface world.',
        ],
        quote: '"She rose as lightly as a bubble to the surface of the water." — H. C. Andersen',
        help: 'STEER LEFT & RIGHT · DODGE JELLYFISH & URCHINS · REACH THE SURFACE',

        init: function (api) {
          var s = api._s = {};
          s.lives = 3; s.invincible = 0;
          s.mx = api.W / 2; s.my = api.H - 55;
          s.speed = 88;   // world scroll speed px/s
          s.dist = 0;
          s.target = 1870;  // ~21 seconds at 88px/s
          s.obstacles = []; s.pearls = [];
          s.spawnT = 0.85; s.pearlT = 1.5;
          s.done = false;
          s.bubbles = [];
          for (var i = 0; i < 14; i++) {
            s.bubbles.push({ x: Math.random() * api.W, y: Math.random() * api.H,
              r: 2 + Math.random() * 3, vy: -(18 + Math.random() * 26) });
          }
        },

        update: function (api, dt) {
          var s = api._s;
          if (s.done) return;
          var W = api.W, H = api.H, spd = 155;

          // Horizontal steering
          var dx = 0;
          if (api.keyDown('left')) dx = -1;
          if (api.keyDown('right')) dx = 1;
          if (api.pointer.down && !api.keyDown('left') && !api.keyDown('right')) {
            var pd = api.pointer.x - s.mx;
            if (Math.abs(pd) > 10) dx = Math.sign(pd) * Math.min(1, Math.abs(pd) / 40);
          }
          s.mx = clamp(s.mx + dx * spd * dt, 14, W - 14);

          // Advance world
          s.dist += s.speed * dt;

          // Spawn obstacles (fall from top)
          s.spawnT -= dt;
          if (s.spawnT <= 0) {
            var ox = 16 + Math.random() * (W - 32);
            var type = Math.random() < 0.55 ? 'jelly' : 'urchin';
            s.obstacles.push({ x: ox, y: -20, vy: 54 + s.dist * 0.012, type: type });
            s.spawnT = 0.78 - Math.min(0.42, s.dist / 9000);
          }

          // Spawn pearls
          s.pearlT -= dt;
          if (s.pearlT <= 0) {
            s.pearls.push({ x: 18 + Math.random() * (W - 36), y: -12, vy: 44 });
            s.pearlT = 1.4 + Math.random() * 0.8;
          }

          // Move obstacles and pearls
          for (var oi = 0; oi < s.obstacles.length; oi++) s.obstacles[oi].y += s.obstacles[oi].vy * dt;
          s.obstacles = s.obstacles.filter(function (o) { return o.y < H + 32; });
          for (var pi = 0; pi < s.pearls.length; pi++) s.pearls[pi].y += s.pearls[pi].vy * dt;

          // Collect pearls
          s.pearls = s.pearls.filter(function (p) {
            if (p.y > H + 15) return false;
            if (Math.abs(p.x - s.mx) < 18 && Math.abs(p.y - s.my) < 18) {
              api.addScore(10); api.audio.sfx('coin');
              api.burst(p.x, p.y, C.pearl, 5); return false;
            }
            return true;
          });

          // Move bubbles
          for (var bi = 0; bi < s.bubbles.length; bi++) {
            s.bubbles[bi].y += s.bubbles[bi].vy * dt;
            if (s.bubbles[bi].y < -8) s.bubbles[bi].y = H + 5;
          }

          if (s.invincible > 0) s.invincible -= dt;

          // Collision with obstacles
          if (s.invincible <= 0) {
            for (var ci = 0; ci < s.obstacles.length; ci++) {
              var o = s.obstacles[ci];
              if (Math.abs(o.x - s.mx) < 17 && Math.abs(o.y - s.my) < 17) {
                s.lives--; s.invincible = 1.4;
                api.shake(6, 0.4); api.flash('#ff4080', 0.18); api.audio.sfx('hurt');
                if (s.lives <= 0) { s.done = true; api.lose(); }
                break;
              }
            }
          }

          // Win: reach the surface
          if (s.dist >= s.target) {
            s.done = true;
            api.burst(W / 2, 50, C.seafoam, 22); api.burst(W / 2, 50, C.gold, 10);
            api.flash('#a0f0ff', 0.5); api.audio.sfx('win'); api.win();
          }
        },

        draw: function (api) {
          var s = api._s;
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var prog = Math.min(1, s.dist / s.target);

          // Background gradient — darkens to deep blue, lightens toward surface
          var grad = c.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, 'hsl(200,80%,' + Math.round(8 + prog * 22) + '%)');
          grad.addColorStop(1, '#010810');
          c.fillStyle = grad; c.fillRect(0, 0, W, H);

          // Light column from above, grows brighter as we rise
          c.globalAlpha = 0.04 + prog * 0.28;
          c.fillStyle = '#70e0ff';
          c.beginPath(); c.moveTo(W * 0.3, 0); c.lineTo(W * 0.7, 0);
          c.lineTo(W * 0.58, H); c.lineTo(W * 0.42, H); c.closePath(); c.fill();
          c.globalAlpha = 1;

          // Background bubbles
          c.globalAlpha = 0.45;
          for (var bi = 0; bi < s.bubbles.length; bi++) {
            var b = s.bubbles[bi];
            c.strokeStyle = '#80e8f8'; c.lineWidth = 1;
            c.beginPath(); c.arc(b.x, b.y, b.r, 0, 7); c.stroke();
          }
          c.globalAlpha = 1;

          // Pearls
          for (var pi = 0; pi < s.pearls.length; pi++) {
            var p = s.pearls[pi];
            var pgrd = c.createRadialGradient(p.x - 1, p.y - 2, 1, p.x, p.y, 5);
            pgrd.addColorStop(0, '#ffffff'); pgrd.addColorStop(1, '#b0e8f8');
            c.fillStyle = pgrd; c.beginPath(); c.arc(p.x, p.y, 5, 0, 7); c.fill();
          }

          // Obstacles
          for (var oi = 0; oi < s.obstacles.length; oi++) {
            var o = s.obstacles[oi];
            if (o.type === 'jelly') {
              // Jellyfish bell
              c.fillStyle = C.lilac;
              c.beginPath(); c.ellipse(o.x, o.y, 11, 9, 0, Math.PI, 0); c.closePath(); c.fill();
              c.globalAlpha = 0.55; c.fillStyle = '#d0c8ff';
              c.beginPath(); c.ellipse(o.x, o.y, 7, 6, 0, Math.PI, 0); c.closePath(); c.fill();
              c.globalAlpha = 1;
              // Tentacles
              c.strokeStyle = C.lilac; c.lineWidth = 1.5; c.globalAlpha = 0.65;
              for (var ti = -2; ti <= 2; ti++) {
                c.beginPath(); c.moveTo(o.x + ti * 4, o.y);
                c.quadraticCurveTo(o.x + ti * 5 + Math.sin(api.t * 3 + ti) * 4, o.y + 8, o.x + Math.sin(api.t * 2 + ti) * 3, o.y + 14);
                c.stroke();
              }
              c.globalAlpha = 1;
            } else {
              // Sea urchin
              c.fillStyle = '#502060'; c.beginPath(); c.arc(o.x, o.y, 7, 0, 7); c.fill();
              c.strokeStyle = '#9040a0'; c.lineWidth = 1.5;
              for (var si = 0; si < 8; si++) {
                var sa = si * Math.PI / 4;
                c.beginPath(); c.moveTo(o.x + Math.cos(sa) * 7, o.y + Math.sin(sa) * 7);
                c.lineTo(o.x + Math.cos(sa) * 13, o.y + Math.sin(sa) * 13); c.stroke();
              }
            }
          }

          // Mermaid
          var blink = s.invincible > 0 && Math.floor(s.invincible * 7) % 2 === 0;
          drawMermaid(api, s.mx, s.my, blink);

          // Progress bar
          g.rect(14, 8, W - 28, 7, '#103050');
          g.rect(14, 8, (W - 28) * prog, 7, C.seafoam);
          g.rectO(14, 8, W - 28, 7, '#1a4060', 1);
          api.txtC('↑ SURFACE', W / 2, 17, 7, '#60a8c8');

          drawHearts(api, s.lives, 16, 28);
          api.scanlines(); api.vignette();
        },
      },

      /* ═══════════════════ TIDE 2 · THE SEA WITCH'S CAVE ═════════════════ */
      {
        id: 'witch', name: "SEA WITCH'S CAVE", sub: 'A VOICE FOR LEGS',
        icon: function (api, x, y) {
          var g = api.gfx, c = api.ctx;
          c.fillStyle = '#284050';
          c.beginPath(); c.ellipse(x, y + 6, 10, 5, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#304858';
          c.beginPath(); c.ellipse(x, y, 10, 5, 0, Math.PI, 0);
          c.lineTo(x + 10, y + 6); c.arc(x, y + 6, 10, 0, Math.PI); c.closePath(); c.fill();
          g.circle(x - 3, y - 1, 2, C.seafoam); g.circle(x + 3, y - 2, 2, '#c070e0'); g.circle(x, y - 4, 3, '#70d0b0');
        },
        intro: [
          'SHE DESCENDS TO',
          "URSULA'S LAIR.",
          'GREAT TENTACLES GUARD',
          'the path to the cauldron.',
        ],
        quote: '"Cut out your tongue in payment," said the sea witch. "I will have that as my price." — H. C. Andersen',
        help: 'DRAG or ARROW KEYS to swim · reach the GLOWING CAULDRON',

        init: function (api) {
          var s = api._s = {};
          s.lives = 3; s.invincible = 0; s.done = false;
          var W = api.W, H = api.H;
          s.mx = 38; s.my = H / 2;
          s.cauldron = { x: W - 44, y: H / 2 };
          s.reachProg = 0;
          // Six animated tentacles
          s.tentacles = [
            { ax: 78,  ay: H * 0.22, len: 54, spd: 0.72, phase: 0 },
            { ax: 135, ay: H * 0.76, len: 58, spd: 0.90, phase: 2.2 },
            { ax: 100, ay: H * 0.48, len: 50, spd: 1.12, phase: 4.0 },
            { ax: 172, ay: H * 0.20, len: 56, spd: 0.82, phase: 1.3 },
            { ax: 202, ay: H * 0.72, len: 50, spd: 1.05, phase: 5.6 },
            { ax: 162, ay: H * 0.50, len: 46, spd: 1.30, phase: 2.8 },
          ];
        },

        update: function (api, dt) {
          var s = api._s;
          if (s.done) return;
          var W = api.W, H = api.H, spd = 125;

          // Free 2D movement
          var dx = 0, dy = 0;
          if (api.keyDown('left'))  dx = -1;
          if (api.keyDown('right')) dx =  1;
          if (api.keyDown('up'))    dy = -1;
          if (api.keyDown('down'))  dy =  1;
          if (api.pointer.down) {
            var pdx = api.pointer.x - s.mx, pdy = api.pointer.y - s.my;
            var d = Math.sqrt(pdx * pdx + pdy * pdy);
            if (d > 12) { dx = pdx / d; dy = pdy / d; }
          }
          // Normalise diagonal
          if (dx !== 0 && dy !== 0) { var inv = 1 / Math.SQRT2; dx *= inv; dy *= inv; }
          s.mx = clamp(s.mx + dx * spd * dt, 14, W - 14);
          s.my = clamp(s.my + dy * spd * dt, 36, H - 28);

          if (s.invincible > 0) s.invincible -= dt;

          // Tentacle tip collisions
          if (s.invincible <= 0) {
            for (var ti = 0; ti < s.tentacles.length; ti++) {
              var t = s.tentacles[ti];
              var ang = Math.sin(api.t * t.spd + t.phase) * Math.PI * 0.72;
              var tx = t.ax + Math.cos(ang) * t.len;
              var ty = t.ay + Math.sin(ang) * t.len;
              var tdx = tx - s.mx, tdy = ty - s.my;
              if (tdx * tdx + tdy * tdy < 196) { // 14px tip radius
                s.lives--; s.invincible = 1.2;
                api.shake(5, 0.35); api.flash('#a050c0', 0.18); api.audio.sfx('hurt');
                if (s.lives <= 0) { s.done = true; api.lose(); }
                break;
              }
            }
          }

          // Reach cauldron (hold 2.2s)
          var cdx = s.mx - s.cauldron.x, cdy = s.my - s.cauldron.y;
          if (cdx * cdx + cdy * cdy < 900) {
            s.reachProg += dt / 2.2;
            if (s.reachProg >= 1) {
              s.done = true;
              api.burst(s.cauldron.x, s.cauldron.y, C.seafoam, 20);
              api.burst(s.cauldron.x, s.cauldron.y, '#d090ff', 12);
              api.flash('#c080ff', 0.5); api.audio.sfx('win'); api.win();
            }
          } else {
            s.reachProg = Math.max(0, s.reachProg - dt * 0.4);
          }
        },

        draw: function (api) {
          var s = api._s;
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Cave — dark purple-black
          var grad = c.createLinearGradient(0, 0, W, H);
          grad.addColorStop(0, '#060214'); grad.addColorStop(1, '#020110');
          c.fillStyle = grad; c.fillRect(0, 0, W, H);

          // Cave crack glows
          c.globalAlpha = 0.18;
          for (var gi = 0; gi < 8; gi++) {
            c.strokeStyle = gi % 2 ? C.seafoam : '#c080ff'; c.lineWidth = 1;
            c.beginPath(); c.moveTo((gi * 33 + 7) % W, (gi * 47 + 13) % H);
            c.lineTo(((gi * 33 + 7) % W) + (gi % 3 - 1) * 12, ((gi * 47 + 13) % H) + (gi % 2 ? -1 : 1) * 18);
            c.stroke();
          }
          c.globalAlpha = 1;

          // Tentacles
          for (var ti = 0; ti < s.tentacles.length; ti++) {
            var t = s.tentacles[ti];
            var ang = Math.sin(api.t * t.spd + t.phase) * Math.PI * 0.72;
            var ex = t.ax + Math.cos(ang) * t.len;
            var ey = t.ay + Math.sin(ang) * t.len;
            var mid = { x: (t.ax + ex) / 2 + Math.sin(api.t + t.phase) * 14, y: (t.ay + ey) / 2 };

            c.strokeStyle = '#602080'; c.lineWidth = 9;
            c.beginPath(); c.moveTo(t.ax, t.ay); c.quadraticCurveTo(mid.x, mid.y, ex, ey); c.stroke();
            c.strokeStyle = '#9030c0'; c.lineWidth = 4;
            c.beginPath(); c.moveTo(t.ax, t.ay); c.quadraticCurveTo(mid.x, mid.y, ex, ey); c.stroke();

            // Suction cups
            c.fillStyle = '#a040c8'; c.globalAlpha = 0.6;
            for (var si = 1; si <= 3; si++) {
              c.beginPath(); c.arc(t.ax + (ex - t.ax) * si / 4, t.ay + (ey - t.ay) * si / 4, 3, 0, 7); c.fill();
            }
            c.globalAlpha = 1;
            // Danger tip glow
            c.globalAlpha = 0.55 + 0.3 * Math.sin(api.t * 4);
            g.circle(ex, ey, 7, '#c040e0');
            c.globalAlpha = 1;
          }

          // Cauldron (goal)
          var cx = s.cauldron.x, cy = s.cauldron.y;
          c.globalAlpha = 0.28 + 0.18 * Math.sin(api.t * 3) + s.reachProg * 0.4;
          g.circle(cx, cy, 24, C.seafoam);
          c.globalAlpha = 1;
          c.fillStyle = '#2a3840'; c.beginPath(); c.ellipse(cx, cy + 6, 13, 7, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#344858'; c.beginPath(); c.ellipse(cx, cy, 13, 7, 0, Math.PI, 0); c.lineTo(cx + 13, cy + 6); c.arc(cx, cy + 6, 13, 0, Math.PI); c.closePath(); c.fill();
          c.globalAlpha = 0.8; g.circle(cx - 3, cy - 2, 3, C.seafoam); g.circle(cx + 4, cy - 3, 3, '#d080ff'); g.circle(cx, cy - 6, 4, '#90e8d8'); c.globalAlpha = 1;

          // Reach progress arc
          if (s.reachProg > 0) {
            c.strokeStyle = C.seafoam; c.lineWidth = 3; c.globalAlpha = 0.8;
            c.beginPath(); c.arc(cx, cy, 28, -Math.PI / 2, -Math.PI / 2 + s.reachProg * Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }

          // Mermaid
          var blink = s.invincible > 0 && Math.floor(s.invincible * 7) % 2 === 0;
          drawMermaid(api, s.mx, s.my, blink);

          drawHearts(api, s.lives, 16, 10);
          api.txtCFit('REACH THE CAULDRON', W / 2, H - 18, 8, '#4a6878');
          api.scanlines(); api.vignette();
        },
      },

      /* ═══════════════════ TIDE 3 · THE RAGING STORM ═════════════════════ */
      {
        id: 'storm', name: 'THE RAGING STORM', sub: 'THE PRINCE FALLS',
        icon: function (api, x, y) {
          var g = api.gfx, c = api.ctx;
          c.strokeStyle = '#80a8c8'; c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(x - 10, y + 3); c.lineTo(x - 10, y - 8); c.lineTo(x + 10, y - 8); c.lineTo(x + 10, y + 3); c.stroke();
          c.fillStyle = '#304860'; c.fillRect(x - 10, y + 3, 20, 4);
          c.strokeStyle = C.seafoam; c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(x - 12, y + 9);
          for (var wi = 0; wi <= 6; wi++) c.lineTo(x - 12 + wi * 4, y + 9 + (wi % 2 === 0 ? -3 : 3));
          c.stroke();
          g.rect(x - 5, y - 12, 1, 3, '#80c8e8'); g.rect(x + 2, y - 14, 1, 3, '#80c8e8'); g.rect(x + 8, y - 11, 1, 3, '#80c8e8');
        },
        intro: [
          'A TERRIBLE STORM',
          'WRECKS THE SHIP.',
          'SHE MUST SUPPORT',
          'the drowning prince.',
        ],
        quote: '"She supported his head above the water, and let the waves drive them where they would." — H. C. Andersen',
        help: 'ALIGN WITH THE PRINCE · HOLD CLOSE TO RESCUE · DODGE DEBRIS',

        init: function (api) {
          var s = api._s = {};
          s.lives = 3; s.invincible = 0; s.done = false;
          var W = api.W, H = api.H;
          s.mx = W / 2; s.my = H - 58;
          s.px = W / 2; s.py = 95;
          s.pSinkSpd = 12;
          s.wavePhase = 0;
          s.rescueProg = 0;
          s.debris = []; s.debrisT = 1.3;
          s.lightningAlpha = 0; s.lightningT = 4 + Math.random() * 2;
        },

        update: function (api, dt) {
          var s = api._s;
          if (s.done) return;
          var W = api.W, H = api.H, spd = 150;

          // Steer mermaid left/right
          var dx = 0;
          if (api.keyDown('left'))  dx = -1;
          if (api.keyDown('right')) dx =  1;
          if (api.pointer.down && !api.keyDown('left') && !api.keyDown('right')) {
            var pd = api.pointer.x - s.mx;
            if (Math.abs(pd) > 10) dx = Math.sign(pd) * Math.min(1, Math.abs(pd) / 40);
          }
          s.mx = clamp(s.mx + dx * spd * dt, 14, W - 14);

          // Prince drifts on waves
          s.wavePhase += dt;
          s.px = W / 2 + Math.sin(s.wavePhase * 0.65) * 62;
          s.py = Math.min(H - 82, s.py + s.pSinkSpd * dt);

          // Rescue meter — fill when aligned
          if (Math.abs(s.mx - s.px) < 32 && Math.abs(s.my - s.py) < 65) {
            s.rescueProg += dt / 18; // ~18s to fill
            if (s.rescueProg >= 1) {
              s.done = true;
              api.burst(s.px, s.py, C.pearl, 20); api.burst(W / 2, H / 2, C.seafoam, 15);
              api.flash('#c0f0ff', 0.5); api.audio.sfx('win'); api.win();
            }
          } else {
            s.rescueProg = Math.max(0, s.rescueProg - dt * 0.28);
          }

          // Spawn debris
          s.debrisT -= dt;
          if (s.debrisT <= 0) {
            s.debris.push({ x: 20 + Math.random() * (W - 40), y: -20, vy: 58 + Math.random() * 30, rot: Math.random() * Math.PI * 2, kind: Math.random() < 0.6 ? 'plank' : 'barrel' });
            s.debrisT = 0.85 + Math.random() * 0.5;
          }
          for (var di = 0; di < s.debris.length; di++) { s.debris[di].y += s.debris[di].vy * dt; s.debris[di].rot += dt * 1.6; }
          s.debris = s.debris.filter(function (d) { return d.y < H + 30; });

          // Lightning flash
          s.lightningT -= dt;
          if (s.lightningT <= 0) { s.lightningAlpha = 1; s.lightningT = 3.5 + Math.random() * 2.5; }
          s.lightningAlpha = Math.max(0, s.lightningAlpha - dt * 5);

          if (s.invincible > 0) s.invincible -= dt;

          // Debris collision
          if (s.invincible <= 0) {
            for (var di2 = 0; di2 < s.debris.length; di2++) {
              var d = s.debris[di2];
              if (Math.abs(d.x - s.mx) < 16 && Math.abs(d.y - s.my) < 14) {
                s.lives--; s.invincible = 1.3;
                api.shake(7, 0.4); api.flash('#806040', 0.2); api.audio.sfx('hurt');
                if (s.lives <= 0) { s.done = true; api.lose(); }
                break;
              }
            }
          }
        },

        draw: function (api) {
          var s = api._s;
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Stormy sea
          var grad = c.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, '#18242e'); grad.addColorStop(0.5, '#0a1820'); grad.addColorStop(1, '#030a10');
          c.fillStyle = grad; c.fillRect(0, 0, W, H);

          // Rain streaks
          c.strokeStyle = '#405870'; c.lineWidth = 1; c.globalAlpha = 0.38;
          for (var ri = 0; ri < 22; ri++) {
            var rx = ((ri * 43 + api.t * 130) % (W + 20)) - 10;
            var ry = ((ri * 67 + api.t * 190) % (H + 20)) - 10;
            c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 4, ry + 14); c.stroke();
          }
          c.globalAlpha = 1;

          // Lightning flash overlay
          if (s.lightningAlpha > 0) {
            c.globalAlpha = s.lightningAlpha * 0.32;
            c.fillStyle = '#c0e8ff'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          // Waves
          c.strokeStyle = '#204060'; c.lineWidth = 3; c.globalAlpha = 0.6;
          for (var wi = 0; wi < 3; wi++) {
            c.beginPath();
            for (var wx = 0; wx <= W; wx += 8) c.lineTo(wx, H - 68 + wi * 18 + Math.sin(wx * 0.04 + api.t * (1 - wi * 0.2)) * 7);
            c.stroke();
          }
          c.globalAlpha = 1;

          // Debris
          for (var di = 0; di < s.debris.length; di++) {
            var d = s.debris[di];
            c.save(); c.translate(d.x, d.y); c.rotate(d.rot);
            if (d.kind === 'plank') {
              c.fillStyle = '#6a4a28'; c.fillRect(-14, -3, 28, 6);
              c.strokeStyle = '#8a6038'; c.lineWidth = 1; c.strokeRect(-14, -3, 28, 6);
            } else {
              c.fillStyle = '#5a3a18'; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill();
              c.strokeStyle = '#8a5a28'; c.lineWidth = 1.5; c.stroke();
            }
            c.restore();
          }

          // Prince (sinking)
          c.globalAlpha = 0.9;
          g.circle(s.px, s.py, 8, C.skin);
          c.fillStyle = '#2a4060'; c.fillRect(s.px - 5, s.py + 7, 10, 12);
          c.strokeStyle = '#3a6080'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(s.px - 5, s.py + 10); c.lineTo(s.px - 12, s.py + 6); c.stroke();
          c.beginPath(); c.moveTo(s.px + 5, s.py + 10); c.lineTo(s.px + 12, s.py + 6); c.stroke();
          c.globalAlpha = 1;

          // Rescue arc
          if (s.rescueProg > 0) {
            c.strokeStyle = C.seafoam; c.lineWidth = 3; c.globalAlpha = 0.7;
            c.beginPath(); c.arc(s.px, s.py, 22, -Math.PI / 2, -Math.PI / 2 + s.rescueProg * Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }

          // Mermaid
          var blink = s.invincible > 0 && Math.floor(s.invincible * 7) % 2 === 0;
          drawMermaid(api, s.mx, s.my, blink);

          // Rescue bar
          g.rect(14, 8, W - 28, 7, '#102030');
          g.rect(14, 8, (W - 28) * s.rescueProg, 7, C.seafoam);
          g.rectO(14, 8, W - 28, 7, '#1a3040', 1);
          api.txtC('RESCUE', W / 2, 17, 7, '#507080');
          drawHearts(api, s.lives, 16, 28);
          api.scanlines(); api.vignette();
        },
      },

      /* ═══════════════════ TIDE 4 · THE PALACE BALL ══════════════════════ */
      {
        id: 'dance', name: 'THE PALACE BALL', sub: 'EVERY STEP, A KNIFE',
        icon: function (api, x, y) {
          var g = api.gfx, c = api.ctx;
          c.fillStyle = '#ff94b8';
          c.beginPath(); c.arc(x - 3, y + 5, 5, 0, 7); c.fill();
          c.fillRect(x + 1, y - 10, 2, 16);
          c.fillRect(x + 1, y - 10, 10, 2);
          c.fillRect(x + 9, y - 7, 2, 13);
          c.beginPath(); c.arc(x + 11, y + 6, 4, 0, 7); c.fill();
        },
        intro: [
          'SHE HAS LEGS NOW.',
          'EACH STEP IS AGONY —',
          'LIKE WALKING ON',
          'sharp knives. She dances.',
        ],
        quote: '"She danced again and again, though every time her foot touched the floor it felt as if she trod on sharp knives." — H. C. Andersen',
        help: 'TAP LEFT or RIGHT half · match the step cue as it reaches the line',

        init: function (api) {
          var s = api._s = {};
          s.lives = 6; s.done = false;
          s.steps = []; s.stepsDone = 0; s.stepsTotal = 14;
          s.stepT = 0.8; s.stepInterval = 1.55; s.fallDur = 1.1;
          s.beatY = api.H - 80;
          s.feedback = null; s.pain = 0;
        },

        update: function (api, dt) {
          var s = api._s;
          if (s.done) return;

          // Spawn step cues
          s.stepT -= dt;
          if (s.stepT <= 0 && s.stepsDone + s.steps.length < s.stepsTotal) {
            s.steps.push({ side: Math.random() < 0.5 ? 'L' : 'R', y: 30, progress: 0, judged: false });
            s.stepT = s.stepInterval;
          }

          // Move step cues downward
          for (var si = 0; si < s.steps.length; si++) {
            s.steps[si].progress += dt / s.fallDur;
            s.steps[si].y = 30 + (s.beatY - 30) * s.steps[si].progress;
          }

          // Read input
          var tapped = api.pointer.justDown;
          var tappedL = tapped && api.pointer.x < api.W / 2;
          var tappedR = tapped && api.pointer.x >= api.W / 2;
          var pressedL = api.keyPressed('left') || tappedL;
          var pressedR = api.keyPressed('right') || api.keyPressed('a') || tappedR;

          // Judge steps
          for (var ji = 0; ji < s.steps.length; ji++) {
            var st = s.steps[ji];
            if (st.judged) continue;
            if (st.progress > 1.15) {
              // Missed
              st.judged = true; s.stepsDone++;
              s.lives--; s.pain = Math.min(1, s.pain + 0.26);
              s.feedback = { text: 'PAIN!', col: C.coral, t: 0.7 };
              api.shake(4, 0.3); api.audio.sfx('hurt');
              if (s.lives <= 0) { s.done = true; api.lose(); }
            } else if (st.progress >= 0.84 && st.progress <= 1.15) {
              var correct = (st.side === 'L' && pressedL) || (st.side === 'R' && pressedR);
              if (correct) {
                st.judged = true; s.stepsDone++;
                api.addScore(15); s.pain = Math.max(0, s.pain - 0.1);
                s.feedback = { text: '❖ GRACE', col: C.seafoam, t: 0.6 };
                api.audio.sfx('coin'); api.burst(api.W / 2, s.beatY, C.pearl, 6);
              }
            }
          }
          s.steps = s.steps.filter(function (st) { return !st.judged; });

          if (s.feedback) { s.feedback.t -= dt; if (s.feedback.t <= 0) s.feedback = null; }

          if (s.stepsDone >= s.stepsTotal && s.steps.length === 0) {
            s.done = true;
            api.burst(api.W / 2, api.H / 2, C.seafoam, 20); api.burst(api.W / 2, api.H / 2, C.gold, 12);
            api.flash('#ffd8f0', 0.5); api.audio.sfx('win'); api.win();
          }
        },

        draw: function (api) {
          var s = api._s;
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Royal ballroom — deep rose and violet
          var grad = c.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, '#2a1830'); grad.addColorStop(0.6, '#1a0c20'); grad.addColorStop(1, '#100818');
          c.fillStyle = grad; c.fillRect(0, 0, W, H);

          // Chandelier sparkle
          c.globalAlpha = 0.4;
          for (var gi = 0; gi < 18; gi++) {
            c.fillStyle = gi % 3 === 0 ? C.gold : gi % 3 === 1 ? '#ffd8f0' : C.pearl;
            c.fillRect(28 + gi * 12, 10 + (gi % 3) * 5, 2, 2);
          }
          c.globalAlpha = 1;

          // Ballroom floor (dark rose marble)
          c.fillStyle = '#1e1228'; c.fillRect(0, H - 92, W, 92);
          c.globalAlpha = 0.07;
          for (var fi = 0; fi < 12; fi++) { c.fillStyle = '#c890a8'; c.fillRect(fi * 24, H - 92, 12, 92); }
          c.globalAlpha = 1;

          // Pain vignette (grows with each miss)
          if (s.pain > 0) {
            var pv = c.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.7);
            pv.addColorStop(0, 'rgba(0,0,0,0)');
            pv.addColorStop(1, 'rgba(200,30,60,' + (s.pain * 0.38) + ')');
            c.fillStyle = pv; c.fillRect(0, 0, W, H);
          }

          // Beat line
          c.strokeStyle = '#804060'; c.lineWidth = 2; c.setLineDash([6, 4]);
          c.beginPath(); c.moveTo(10, s.beatY); c.lineTo(W - 10, s.beatY); c.stroke();
          c.setLineDash([]);
          api.txtC('◄ L', W * 0.25, s.beatY + 8, 9, '#604858');
          api.txtC('R ►', W * 0.75, s.beatY + 8, 9, '#604858');

          // Centre divider
          c.strokeStyle = '#503040'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(W / 2, s.beatY - 45); c.lineTo(W / 2, H); c.stroke();

          // Step cues
          for (var si = 0; si < s.steps.length; si++) {
            var st = s.steps[si];
            var inWin = st.progress >= 0.80;
            var sx = st.side === 'L' ? W * 0.27 : W * 0.73;
            var sz = 22;
            c.fillStyle = inWin ? (st.side === 'L' ? '#60a0ff' : '#ff90b0') : (st.side === 'L' ? '#2060a0' : '#902040');
            c.beginPath();
            if (st.side === 'L') {
              c.moveTo(sx + sz / 2, st.y); c.lineTo(sx - sz / 2, st.y + sz / 2); c.lineTo(sx + sz / 2, st.y + sz);
            } else {
              c.moveTo(sx - sz / 2, st.y); c.lineTo(sx + sz / 2, st.y + sz / 2); c.lineTo(sx - sz / 2, st.y + sz);
            }
            c.closePath(); c.fill();
            api.txtC(st.side, sx, st.y + sz / 2 - 4, 9, '#f0e0f0', true);
          }

          // Tap zone highlight
          var tapL = api.keyDown('left') || (api.pointer.down && api.pointer.x < W / 2);
          var tapR = api.keyDown('right') || (api.pointer.down && api.pointer.x >= W / 2);
          if (tapL) { c.fillStyle = 'rgba(96,160,255,.14)'; c.fillRect(0, 0, W / 2, H); }
          if (tapR) { c.fillStyle = 'rgba(255,144,176,.14)'; c.fillRect(W / 2, 0, W / 2, H); }

          // Feedback
          if (s.feedback) {
            c.globalAlpha = Math.min(1, s.feedback.t * 3);
            api.txtC(s.feedback.text, W / 2, s.beatY - 44, 13, s.feedback.col, true);
            c.globalAlpha = 1;
          }

          // Miss indicators (hearts → X)
          for (var mi = 0; mi < 6; mi++) {
            var hx = 6 + mi * 17, hy = 10;
            if (mi < s.lives) {
              g.circle(hx + 5, hy + 5, 6, C.coral);
              api.txtC('♥', hx + 5, hy + 2, 8, '#ffd0e0', true);
            } else {
              c.strokeStyle = '#603050'; c.lineWidth = 1.5;
              c.beginPath(); c.moveTo(hx + 1, hy + 1); c.lineTo(hx + 9, hy + 9); c.moveTo(hx + 9, hy + 1); c.lineTo(hx + 1, hy + 9); c.stroke();
            }
          }

          api.txtC(s.stepsDone + '/' + s.stepsTotal + ' STEPS', W / 2, H - 18, 8, '#604858');
          api.scanlines(); api.vignette();
        },
      },

      /* ═══════════════════ TIDE 5 · THE FINAL DAWN ═══════════════════════ */
      {
        id: 'dawn', name: 'THE FINAL DAWN', sub: 'THE SEA FOAM RISES',
        icon: function (api, x, y) {
          var g = api.gfx, c = api.ctx;
          c.fillStyle = '#f0a040';
          c.beginPath(); c.arc(x, y, 8, -Math.PI, 0); c.fill();
          c.strokeStyle = C.gold; c.lineWidth = 1.5;
          for (var i = 0; i < 7; i++) {
            var a = -Math.PI + i * Math.PI / 6;
            c.beginPath(); c.moveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10);
            c.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); c.stroke();
          }
          g.rect(x - 12, y - 10, 2, 2, C.pearl); g.rect(x + 10, y - 8, 2, 2, C.pearl);
        },
        intro: [
          'SUNRISE. SHE COULD',
          'KILL THE PRINCE AND LIVE.',
          'SHE CASTS THE KNIFE',
          'into the sea instead.',
        ],
        quote: '"She flung herself from the ship into the sea and felt her body dissolving into foam." — H. C. Andersen',
        help: 'CATCH the SPIRIT ORBS · DODGE the sunrise bolts',

        init: function (api) {
          var s = api._s = {};
          s.lives = 3; s.invincible = 0; s.done = false;
          var W = api.W, H = api.H;
          s.mx = W / 2; s.my = H - 55;
          s.orbs = []; s.bolts = [];
          s.orbCount = 0; s.orbTarget = 12;
          s.orbT = 1.9; s.boltT = 2.6;
          s.sunriseY = H + 50;
          s.sunriseSpd = 7.2; // px/s → fills screen in ~(H+50)/7.2 ≈ 73s, well past 12-orb collection
        },

        update: function (api, dt) {
          var s = api._s;
          if (s.done) return;
          var W = api.W, H = api.H, spd = 150;

          // Steer mermaid left/right
          var dx = 0;
          if (api.keyDown('left'))  dx = -1;
          if (api.keyDown('right')) dx =  1;
          if (api.pointer.down && !api.keyDown('left') && !api.keyDown('right')) {
            var pd = api.pointer.x - s.mx;
            if (Math.abs(pd) > 10) dx = Math.sign(pd) * Math.min(1, Math.abs(pd) / 40);
          }
          s.mx = clamp(s.mx + dx * spd * dt, 14, W - 14);
          s.sunriseY -= s.sunriseSpd * dt;

          // Spawn sea spirit orbs
          s.orbT -= dt;
          if (s.orbT <= 0 && s.orbCount + s.orbs.length < s.orbTarget) {
            s.orbs.push({ x: 18 + Math.random() * (W - 36), y: -15, vy: 48 + Math.random() * 22, r: 7 + Math.random() * 4, phase: Math.random() * 7 });
            s.orbT = 1.5 + Math.random() * 0.9;
          }
          // Spawn sunrise bolts
          s.boltT -= dt;
          if (s.boltT <= 0) {
            s.bolts.push({ x: 18 + Math.random() * (W - 36), y: -12, vy: 115 + Math.random() * 55 });
            s.boltT = 1.9 + Math.random() * 1.0;
          }

          // Move orbs, check catch
          for (var oi = 0; oi < s.orbs.length; oi++) s.orbs[oi].y += s.orbs[oi].vy * dt;
          s.orbs = s.orbs.filter(function (o) {
            if (o.y > H + 20) return false;
            if (Math.abs(o.x - s.mx) < 22 && Math.abs(o.y - s.my) < 22) {
              s.orbCount++;
              api.addScore(20); api.audio.sfx('coin');
              api.burst(o.x, o.y, C.seafoam, 8); api.burst(o.x, o.y, C.pearl, 4);
              if (s.orbCount >= s.orbTarget) {
                s.done = true;
                api.burst(W / 2, H / 2, C.seafoam, 30); api.burst(W / 2, H / 2, C.gold, 20);
                api.flash('#c0f8ff', 0.6); api.audio.sfx('win'); api.win();
              }
              return false;
            }
            return true;
          });

          // Move bolts
          for (var bi = 0; bi < s.bolts.length; bi++) s.bolts[bi].y += s.bolts[bi].vy * dt;
          s.bolts = s.bolts.filter(function (b) { return b.y < H + 30; });

          if (s.invincible > 0) s.invincible -= dt;

          // Bolt collision
          if (s.invincible <= 0) {
            for (var bi2 = 0; bi2 < s.bolts.length; bi2++) {
              var b = s.bolts[bi2];
              if (Math.abs(b.x - s.mx) < 16 && Math.abs(b.y - s.my) < 20) {
                s.lives--; s.invincible = 1.2;
                api.shake(6, 0.4); api.flash('#ff8030', 0.2); api.audio.sfx('hurt');
                if (s.lives <= 0) { s.done = true; api.lose(); }
                break;
              }
            }
          }
        },

        draw: function (api) {
          var s = api._s;
          var g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var sunProg = clamp(1 - s.sunriseY / H, 0, 1);

          // Night sky fading to dawn
          var grad = c.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, 'hsl(220,60%,' + Math.round(5 + sunProg * 14) + '%)');
          grad.addColorStop(0.5, 'hsl(200,50%,' + Math.round(4 + sunProg * 10) + '%)');
          grad.addColorStop(1, '#010810');
          c.fillStyle = grad; c.fillRect(0, 0, W, H);

          // Sunrise glow from below horizon
          if (s.sunriseY < H) {
            var sunGrad = c.createLinearGradient(0, s.sunriseY - 40, 0, H);
            sunGrad.addColorStop(0, 'rgba(255,200,80,0)');
            sunGrad.addColorStop(0.5, 'rgba(255,140,40,' + (sunProg * 0.5) + ')');
            sunGrad.addColorStop(1, 'rgba(255,80,20,' + (sunProg * 0.65) + ')');
            c.fillStyle = sunGrad; c.fillRect(0, Math.max(0, s.sunriseY - 40), W, H);
          }

          // Stars (fade as dawn rises)
          c.globalAlpha = Math.max(0, 1 - sunProg * 2.5);
          for (var sti = 0; sti < 18; sti++) {
            c.fillStyle = '#e0f0ff'; c.fillRect((sti * 73 + 17) % W, (sti * 43 + 11) % Math.floor(H * 0.6), 2, 2);
          }
          c.globalAlpha = 1;

          // Sea foam at water line
          c.globalAlpha = 0.25; c.strokeStyle = '#a0e8f8'; c.lineWidth = 2;
          for (var fmi = 0; fmi < 8; fmi++) {
            var fx = ((api.t * 28 + fmi * 38) % (W + 40)) - 20, fy = H - 66 + (fmi % 3) * 12;
            c.beginPath(); c.moveTo(fx, fy); c.quadraticCurveTo(fx + 10, fy - 4, fx + 20, fy); c.stroke();
          }
          c.globalAlpha = 1;

          // Sea spirit orbs
          for (var oi = 0; oi < s.orbs.length; oi++) {
            var o = s.orbs[oi];
            var glow = c.createRadialGradient(o.x, o.y, 1, o.x, o.y, o.r + 5);
            glow.addColorStop(0, '#ffffff');
            glow.addColorStop(0.4, C.seafoam);
            glow.addColorStop(1, 'rgba(0,200,180,0)');
            c.fillStyle = glow; c.beginPath(); c.arc(o.x, o.y, o.r + 5, 0, 7); c.fill();
            g.circle(o.x, o.y, o.r, '#d0f8f8'); g.circle(o.x - 2, o.y - 2, o.r * 0.35, '#ffffff');
            // Trailing sparkle
            c.globalAlpha = 0.45;
            g.rect(o.x + Math.sin(api.t * 4 + o.phase) * 6, o.y - 13, 2, 2, C.pearl);
            c.globalAlpha = 1;
          }

          // Sunrise bolts (orange streaks from above)
          for (var bi = 0; bi < s.bolts.length; bi++) {
            var b = s.bolts[bi];
            c.fillStyle = '#ff8020';
            c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x - 5, b.y + 18); c.lineTo(b.x + 5, b.y + 18); c.closePath(); c.fill();
            c.globalAlpha = 0.4; g.circle(b.x, b.y, 5, C.gold); c.globalAlpha = 1;
          }

          // Mermaid (slightly dissolving)
          c.globalAlpha = 0.88 - sunProg * 0.18;
          var blink = s.invincible > 0 && Math.floor(s.invincible * 7) % 2 === 0;
          drawMermaid(api, s.mx, s.my, blink);
          c.globalAlpha = 1;

          // Orb counter bar
          g.rect(14, 8, W - 28, 7, '#102030');
          g.rect(14, 8, (W - 28) * (s.orbCount / s.orbTarget), 7, C.seafoam);
          g.rectO(14, 8, W - 28, 7, '#1a4050', 1);
          api.txtC(s.orbCount + '/' + s.orbTarget + ' GIFTS', W / 2, 17, 7, '#4a8090');

          drawHearts(api, s.lives, 16, 28);
          api.scanlines(); api.vignette();
        },
      },
    ],
  });
})();
