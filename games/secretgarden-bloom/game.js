/* ============================================================================
 * THE SECRET GARDEN — FIVE CHAPTERS
 * Frances Hodgson Burnett's 1911 novel as five distinct mini-games:
 *   1. THE ROBIN'S GIFT   — follow the robin; catch feathers, dodge thorns (20s)
 *   2. WINTER PLANTING    — tap lit soil patches to plant seeds before frost (26s)
 *   3. DICKON'S CREATURES — tap creatures before they bolt; 20 animals in 28s
 *   4. COLIN STANDS       — timing ring: tap at the sweet spot for 7 steps
 *   5. THE MAGIC          — catch golden blooms; dodge grey stones; 30s survive
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  var clamp = Retro.util.clamp;

  /* ─── Palette ─────────────────────────────────────────────────────────── */
  var C = {
    sky:    '#7ecaee',
    skyD:   '#3a8ec8',
    skyM:   '#b0dcf0',
    wall:   '#8b6e4e',
    wallD:  '#6a5238',
    wallL:  '#a88460',
    ivy:    '#2a6818',
    ivyL:   '#4a9030',
    ivyLL:  '#68b848',
    grass:  '#3a8820',
    grassL: '#58b030',
    earth:  '#6a3c18',
    earthL: '#8a5828',
    earthLL:'#aa7848',
    rose:   '#e84090',
    roseD:  '#b02060',
    roseL:  '#ffb0d0',
    roseLL: '#ffd0e4',
    thorn:  '#404820',
    thornL: '#585c28',
    gold:   '#f0c830',
    goldD:  '#c89018',
    goldL:  '#fff098',
    stone:  '#9a9080',
    stoneD: '#6a6058',
    stoneL: '#c0b8a8',
    mary:   '#d870b8',
    maryD:  '#a04888',
    maryL:  '#f0a8d8',
    coat:   '#5080d0',
    coatD:  '#3060a8',
    skin:   '#f0c07a',
    skinD:  '#c89050',
    hair:   '#2a1808',
    robin:  '#cc3820',
    robinB: '#402010',
    robinW: '#f0e8d0',
    dickon: '#6a8830',
    dickonD:'#4a6018',
    rabbit: '#d0c8b0',
    rabbitD:'#a8a090',
    fox:    '#c06820',
    foxD:   '#904810',
    crow:   '#303038',
    crowL:  '#484858',
    colin:  '#d8c890',
    colinD: '#b0a068',
    colinR: '#f0d0b0',
    green:  '#58c030',
    purple: '#a060e8',
    white:  '#ffffff',
    cream:  '#f8f0e0',
    grey:   '#888880',
    greyD:  '#585850',
    fog:    '#c0d0b0',
    magic:  '#ffffc0',
    magicG: '#b0ffa0',
    magicP: '#e0a0ff',
    frost:  '#c0ddf0',
    frostL: '#e0f0fc',
  };

  /* ─── Emblem: an iron key with ivy ──────────────────────────────────────── */
  function emblem(api, cx, cy) {
    var g = api.gfx, c = api.ctx;
    // Key bow (ring)
    c.strokeStyle = C.stone; c.lineWidth = 3;
    c.beginPath(); c.arc(cx - 8, cy - 6, 8, 0, Math.PI * 2); c.stroke();
    g.circle(cx - 8, cy - 6, 4, C.stoneD);
    // Key shaft
    g.rect(cx - 1, cy - 6, 3, 20, C.stone);
    // Key teeth
    g.rect(cx + 2, cy + 6, 5, 3, C.stone);
    g.rect(cx + 2, cy + 12, 4, 3, C.stone);
    // Ivy accent
    c.fillStyle = C.ivyL;
    c.beginPath(); c.arc(cx - 4, cy - 14, 5, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(cx + 2, cy - 18, 4, 0, Math.PI * 2); c.fill();
    g.circle(cx - 1, cy - 14, 3, C.roseL);
  }

  /* ─── Draw: Mary Lennox ──────────────────────────────────────────────────── */
  function drawMary(g, c, x, y, t, hurt) {
    if (hurt && Math.sin(t * 18) > 0) return;
    // Dress
    c.fillStyle = C.mary;
    c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x - 12, y + 18); c.lineTo(x + 12, y + 18); c.lineTo(x + 8, y); c.fill();
    // Bodice
    g.rect(x - 7, y - 12, 14, 14, C.maryD);
    // Arms
    g.rect(x - 11, y - 10, 4, 10, C.skin);
    g.rect(x + 7, y - 10, 4, 10, C.skin);
    // Head
    g.circle(x, y - 20, 9, C.skin);
    // Hair
    g.rect(x - 9, y - 28, 18, 10, C.hair);
    g.rect(x - 9, y - 20, 3, 8, C.hair);
    g.rect(x + 6, y - 20, 3, 8, C.hair);
    // Legs
    var leg = Math.sin(t * 7) * 3;
    g.rect(x - 5, y + 18, 4, 9 + leg, C.coatD);
    g.rect(x + 1, y + 18, 4, 9 - leg, C.coatD);
    g.rect(x - 6, y + 25 + leg, 5, 3, C.hair);
    g.rect(x, y + 25 - leg, 5, 3, C.hair);
  }

  /* ─── Draw: Dickon ───────────────────────────────────────────────────────── */
  function drawDickon(g, x, y, t) {
    // Body
    g.rect(x - 7, y - 14, 14, 14, C.dickon);
    g.rect(x - 6, y - 26, 12, 14, C.skin);
    g.circle(x, y - 32, 9, C.skin);
    g.rect(x - 9, y - 40, 18, 10, C.dickonD);
    var leg = Math.sin(t * 6) * 3;
    g.rect(x - 5, y, 4, 9 + leg, C.dickonD);
    g.rect(x + 1, y, 4, 9 - leg, C.dickonD);
  }

  /* ─── Draw: Colin in wheelchair / standing ───────────────────────────────── */
  function drawColin(g, c, x, y, step, lean) {
    var tilt = lean * 4;
    // Blanket / legs
    g.rect(x - 10 + tilt, y, 20, 14, C.colinD);
    // Body
    g.rect(x - 7 + tilt, y - 16, 14, 18, C.colinD);
    g.rect(x - 6 + tilt, y - 26, 12, 12, C.colinR);
    g.circle(x + tilt, y - 33, 8, C.colinR);
    g.rect(x - 8 + tilt, y - 38, 16, 8, C.hair);
    if (step > 0) {
      // Actually walking legs
      var la = Math.sin(step * 1.4) * 5;
      g.rect(x - 5, y, 4, 10 + la, C.colinD);
      g.rect(x + 1, y, 4, 10 - la, C.colinD);
    }
  }

  /* ─── Draw: Robin ────────────────────────────────────────────────────────── */
  function drawRobin(g, c, x, y, t) {
    // Body
    c.fillStyle = C.robinB;
    c.beginPath(); c.ellipse(x, y, 7, 5, 0, 0, Math.PI * 2); c.fill();
    // Red breast
    c.fillStyle = C.robin;
    c.beginPath(); c.ellipse(x + 1, y + 1, 5, 4, 0.3, 0, Math.PI * 2); c.fill();
    // Head
    g.circle(x + 5, y - 4, 4, C.robinB);
    // Eye
    g.circle(x + 7, y - 5, 1.5, C.white);
    // Beak
    g.rect(x + 9, y - 5, 4, 2, '#cc8820');
    // Wing flap
    var wa = Math.sin(t * 14) * 3;
    c.fillStyle = C.crowL;
    c.beginPath(); c.moveTo(x - 4, y - 2); c.lineTo(x - 12, y - 6 - wa); c.lineTo(x - 2, y + 3); c.fill();
  }

  /* ─── Draw: small creature ───────────────────────────────────────────────── */
  function drawCreature(g, c, type, x, y, t) {
    if (type === 'rabbit') {
      g.rect(x - 6, y - 8, 12, 10, C.rabbit);
      g.rect(x - 4, y - 18, 3, 12, C.rabbit);
      g.rect(x + 1, y - 20, 3, 14, C.rabbit);
      g.circle(x - 4, y - 8, 5, C.rabbit);
      g.circle(x + 3, y - 18, 2, C.rose);
      g.circle(x - 5, y - 7, 2, '#ff6888');
    } else if (type === 'fox') {
      g.rect(x - 8, y - 6, 16, 8, C.fox);
      g.circle(x + 6, y - 6, 6, C.fox);
      g.rect(x + 8, y - 12, 4, 6, C.fox);
      g.rect(x + 9, y - 14, 3, 6, C.fox);
      g.circle(x + 8, y - 7, 2, '#202020');
      g.rect(x + 9, y - 8, 3, 2, C.colinR);
      var ta = Math.sin(t * 5) * 8;
      g.rect(x - 12, y - 4 + ta, 6, 3, C.fox);
    } else if (type === 'crow') {
      c.fillStyle = C.crow;
      c.beginPath(); c.ellipse(x, y - 4, 9, 6, 0, 0, Math.PI * 2); c.fill();
      g.circle(x + 7, y - 8, 4, C.crow);
      g.circle(x + 9, y - 9, 1.5, C.white);
      g.rect(x + 11, y - 9, 5, 2, C.goldD);
      var wa2 = Math.sin(t * 12) * 4;
      c.fillStyle = C.crowL;
      c.beginPath(); c.moveTo(x - 2, y - 8); c.lineTo(x - 14, y - 12 - wa2); c.lineTo(x, y - 2); c.fill();
    } else {
      // squirrel
      g.rect(x - 5, y - 8, 10, 10, C.fox);
      g.circle(x + 4, y - 8, 5, C.fox);
      g.circle(x + 6, y - 10, 2, '#201010');
      var ta2 = Math.sin(t * 4) * 10;
      g.rect(x - 8, y - 16 + ta2, 5, 20, C.foxD);
    }
  }

  /* ─── Scenery: the walled garden & ivy walls ─────────────────────────────── */
  function scenery(api, scene, t) {
    var g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Sky gradient
    var sky = c.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, C.skyD); sky.addColorStop(1, C.skyM);
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // Sun
    c.globalAlpha = 0.7;
    g.circle(W - 40, 40, 22, '#ffffd8');
    c.globalAlpha = 0.25;
    g.circle(W - 40, 40, 36, '#ffffd8');
    c.globalAlpha = 1;

    // Brick wall background
    c.fillStyle = C.wallD; c.fillRect(0, H * 0.55, W, H * 0.45);
    for (var wr = 0; wr < 6; wr++) {
      var wy = H * 0.55 + wr * 12;
      var off = (wr % 2) * 18;
      for (var wx = -18 + off; wx < W; wx += 36) {
        g.rectO(wx, wy, 34, 10, C.wallL, 1);
      }
    }

    // Grass / garden floor
    var grd = c.createLinearGradient(0, H - 70, 0, H);
    grd.addColorStop(0, C.grassL); grd.addColorStop(1, C.grass);
    c.fillStyle = grd; c.fillRect(0, H - 70, W, 70);

    // Garden soil bed
    c.fillStyle = C.earth;
    c.beginPath(); c.ellipse(W / 2, H - 36, 90, 22, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = C.earthL;
    c.beginPath(); c.ellipse(W / 2, H - 40, 80, 14, 0, 0, Math.PI * 2); c.fill();

    // Roses on wall
    var roseSpots = [[20, H * 0.55 + 8], [60, H * 0.55 + 18], [110, H * 0.55 + 4],
                     [160, H * 0.55 + 15], [210, H * 0.55 + 6], [250, H * 0.55 + 20]];
    for (var ri = 0; ri < roseSpots.length; ri++) {
      var rs = roseSpots[ri], rox = rs[0], roy = rs[1];
      // Ivy tendrils
      c.strokeStyle = C.ivy; c.lineWidth = 2;
      c.beginPath(); c.moveTo(rox, roy + 20); c.bezierCurveTo(rox + 10, roy, rox - 8, roy - 20, rox + 5, roy - 35); c.stroke();
      c.fillStyle = C.ivyL;
      c.beginPath(); c.arc(rox + 5, roy - 35, 5, 0, Math.PI * 2); c.fill();
      // Rose blooms
      var rb = Math.sin(t * 0.8 + ri) * 1.5;
      g.circle(rox - 4, roy - 10 + rb, 5, C.roseD);
      g.circle(rox + 2, roy - 6 + rb, 6, C.rose);
      g.circle(rox, roy - 12 + rb, 5, C.roseL);
      g.circle(rox - 1, roy - 9 + rb, 3, C.gold);
    }

    // Animated ivy leaves along top of wall
    for (var li = 0; li < 8; li++) {
      var lx = li * 34 + 5;
      var ly = H * 0.55 - 12 + Math.sin(t * 1.2 + li) * 4;
      c.fillStyle = (li % 2 === 0) ? C.ivyL : C.ivy;
      c.beginPath(); c.ellipse(lx, ly, 8, 5, Math.sin(li) * 0.5, 0, Math.PI * 2); c.fill();
    }

    // Dark overlay for non-menu screens
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(8,20,4,.65)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // Garden background — lighter and more lush
      c.fillStyle = 'rgba(10,30,6,.50)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Chapter-select: a winding garden path with 5 flower beds ─────────── */
  // Five stepping stones laid in a gentle S-curve through the garden
  var GARDEN_NODES = [
    { x: 52, y: 400, w: 78, h: 52 },   // ch1: bottom-left
    { x: 148, y: 330, w: 78, h: 52 },  // ch2: middle
    { x: 52, y: 260, w: 78, h: 52 },   // ch3: left
    { x: 148, y: 190, w: 78, h: 52 },  // ch4: right
    { x: 52, y: 120, w: 78, h: 52 },   // ch5: top-left
  ];

  var CHAPTER_ICONS = [
    // key / feather
    function (api, x, y) {
      var g = api.gfx, c = api.ctx;
      c.strokeStyle = C.stone; c.lineWidth = 2;
      c.beginPath(); c.arc(x - 5, y - 3, 6, 0, Math.PI * 2); c.stroke();
      g.rect(x, y - 3, 2, 14, C.stone);
      g.rect(x + 2, y + 4, 4, 2, C.stone);
      g.rect(x + 2, y + 8, 3, 2, C.stone);
    },
    // seed / plant sprout
    function (api, x, y) {
      var g = api.gfx, c = api.ctx;
      c.strokeStyle = C.ivyL; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x, y - 6); c.stroke();
      c.fillStyle = C.grassL;
      c.beginPath(); c.ellipse(x - 6, y - 4, 7, 4, -0.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(x + 6, y - 2, 7, 4, 0.5, 0, Math.PI * 2); c.fill();
      g.circle(x, y + 6, 4, C.earthL);
    },
    // paw / creature
    function (api, x, y) {
      var g = api.gfx;
      g.circle(x, y, 5, C.rabbit);
      g.circle(x - 6, y - 4, 3, C.rabbit);
      g.circle(x + 6, y - 4, 3, C.rabbit);
      g.circle(x, y - 6, 3, C.rabbit);
    },
    // shining star / courage
    function (api, x, y) {
      var g = api.gfx, c = api.ctx;
      c.strokeStyle = C.gold; c.lineWidth = 2;
      for (var ia = 0; ia < 6; ia++) {
        var ang = (ia / 6) * Math.PI * 2;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(ang) * 9, y + Math.sin(ang) * 9); c.stroke();
      }
      g.circle(x, y, 4, C.gold);
    },
    // bloom / rose
    function (api, x, y) {
      var g = api.gfx, c = api.ctx;
      c.fillStyle = C.roseD;
      c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fill();
      c.fillStyle = C.rose;
      c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill();
      g.circle(x, y, 3, C.gold);
      for (var ip = 0; ip < 4; ip++) {
        var ap = (ip / 4) * Math.PI * 2;
        c.fillStyle = C.roseL;
        c.beginPath(); c.ellipse(x + Math.cos(ap) * 9, y + Math.sin(ap) * 9, 5, 3, ap, 0, Math.PI * 2); c.fill();
      }
    },
  ];

  var CHAPTER_FLOWERS = [C.rose, C.ivyL, C.rabbit, C.gold, C.roseL];

  /* ────────────────────────────────────────────────────────────────────────
   * CHAPTER 1 — THE ROBIN'S GIFT
   * Mary follows the robin. Catch falling feathers (red-tipped), dodge thorns.
   * Move left/right (arrow keys or touch). Collect 12 feathers in 22s, 3 lives.
   * ──────────────────────────────────────────────────────────────────────── */
  var ch1 = {
    id: 'robin',
    name: "The Robin's Gift",
    sub: 'Follow the robin to the hidden door',
    intro: [
      'Mary Lennox stands alone',
      'in the grey Misselthwaite garden.',
      'A red-breasted robin hops\nnear the old ivy-covered wall.',
      'Catch the feathers he drops —\nthey will lead you to the key.',
    ],
    quote: '"Perhaps it had lived all these ten years within the lonely walls, and perhaps it had been one of the wild things that kept themselves alive in places like this." — F. H. Burnett',
    help: 'Move left/right to catch red feathers. Avoid the grey thorns!',
    winText: 'The robin leads you to the buried door!',
    loseText: 'The thorns drive you back. Try again.',
    icon: function (api, x, y) { CHAPTER_ICONS[0](api, x, y); },
    init: function (api) {
      var s = api._s1 = {
        mx: api.W / 2, my: api.H - 80,
        lives: 3, feathers: 0, need: 12,
        timer: 22,
        items: [],
        spawnT: 0, spawnRate: 1.8,
        robinX: api.W / 2, robinY: 60,
        robinDir: 1, robinBob: 0,
        hurt: false, hurtT: 0,
        flashT: 0,
        done: false,
      };
    },
    update: function (api, dt) {
      var s = api._s1, W = api.W, H = api.H;
      if (s.done) return;

      // Robin wanders
      s.robinX += s.robinDir * 38 * dt;
      s.robinBob += dt * 6;
      if (s.robinX > W - 20 || s.robinX < 20) s.robinDir *= -1;

      // Player movement
      var spd = 130;
      if (api.keyDown('left') || (api.pointer.down && api.pointer.x < W / 2)) s.mx -= spd * dt;
      if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= W / 2)) s.mx += spd * dt;
      s.mx = clamp(s.mx, 14, W - 14);

      // Spawn items
      s.spawnT += dt;
      if (s.spawnT >= s.spawnRate) {
        s.spawnT = 0;
        s.spawnRate = Math.max(0.6, 1.8 - (22 - s.timer) * 0.05);
        var isFeather = Math.random() < 0.55;
        s.items.push({
          x: 20 + Math.random() * (W - 40),
          y: -12,
          vy: 80 + Math.random() * 60,
          type: isFeather ? 'feather' : 'thorn',
          rot: Math.random() * 6,
        });
      }

      // Update items
      for (var i = s.items.length - 1; i >= 0; i--) {
        var it = s.items[i];
        it.y += it.vy * dt;
        it.rot += dt * 2;
        if (it.y > H + 20) { s.items.splice(i, 1); continue; }
        // Collision with Mary
        var dx = it.x - s.mx, dy = it.y - (s.my - 10);
        if (dx * dx + dy * dy < 22 * 22) {
          s.items.splice(i, 1);
          if (it.type === 'feather') {
            s.feathers++;
            api.addScore(10);
            api.burst(it.x, it.y, C.robin, 5);
            api.audio.sfx('coin');
            if (s.feathers >= s.need) { s.done = true; api.win(); return; }
          } else {
            if (!s.hurt) {
              s.lives--;
              s.hurt = true; s.hurtT = 1.2;
              api.shake(6, 0.3);
              api.flash(C.rose, 0.2);
              api.audio.sfx('hurt');
              if (s.lives <= 0) { s.done = true; api.lose(); return; }
            }
          }
        }
      }

      // Hurt cooldown
      if (s.hurt) {
        s.hurtT -= dt;
        if (s.hurtT <= 0) s.hurt = false;
      }

      // Timer
      s.timer -= dt;
      if (s.timer <= 0) { s.done = true; api.lose(); }
    },
    draw: function (api) {
      var s = api._s1, g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Sky + garden backdrop
      var sky = c.createLinearGradient(0, 0, 0, H * 0.45);
      sky.addColorStop(0, C.skyD); sky.addColorStop(1, C.skyM);
      c.fillStyle = sky; c.fillRect(0, 0, W, H);

      // Brick wall
      c.fillStyle = C.wallD; c.fillRect(0, H * 0.42, W, 10);
      c.fillStyle = C.wallL;
      for (var wr = 0; wr < 3; wr++) {
        var off = (wr % 2) * 18;
        for (var wx = -18 + off; wx < W; wx += 36) {
          g.rectO(wx, H * 0.42 + wr * 10, 34, 9, C.wall, 1);
        }
      }

      // Ivy on wall
      c.fillStyle = C.ivy; c.fillRect(0, H * 0.42 - 8, W, 10);
      for (var li = 0; li < 10; li++) {
        var lx = li * 28 + 4;
        c.fillStyle = (li % 3 < 2) ? C.ivyL : C.ivy;
        c.beginPath(); c.ellipse(lx, H * 0.42 - 8, 8, 5, Math.sin(li) * 0.4, 0, Math.PI * 2); c.fill();
      }

      // Grass
      c.fillStyle = C.grassL; c.fillRect(0, H - 60, W, 60);
      c.fillStyle = C.grass; c.fillRect(0, H - 30, W, 30);
      c.fillStyle = C.earth; c.fillRect(0, H - 10, W, 10);

      // Robin
      var robY = s.robinY + Math.sin(s.robinBob) * 6;
      drawRobin(g, c, s.robinX, robY, api.t);

      // Falling items
      for (var i = 0; i < s.items.length; i++) {
        var it = s.items[i];
        c.save(); c.translate(it.x, it.y); c.rotate(it.rot);
        if (it.type === 'feather') {
          c.fillStyle = C.robin;
          c.beginPath(); c.ellipse(0, 0, 3, 10, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = C.robinW;
          c.beginPath(); c.ellipse(0, 2, 2, 7, 0, 0, Math.PI * 2); c.fill();
        } else {
          // Thorn
          c.strokeStyle = C.thornL; c.lineWidth = 2;
          c.beginPath(); c.moveTo(0, -8); c.lineTo(0, 8); c.stroke();
          c.beginPath(); c.moveTo(-5, 0); c.lineTo(5, 0); c.stroke();
          c.fillStyle = C.thorn;
          c.beginPath(); c.moveTo(0, -4); c.lineTo(-4, 2); c.lineTo(4, 2); c.fill();
        }
        c.restore();
      }

      // Mary
      drawMary(g, c, s.mx, s.my, api.t, s.hurt);

      // HUD
      api.topBar(
        'FEATHERS ' + s.feathers + '/' + s.need,
        '♥'.repeat(s.lives),
        Math.ceil(Math.max(0, s.timer)) + 's',
      );
    },
  };

  /* ────────────────────────────────────────────────────────────────────────
   * CHAPTER 2 — WINTER PLANTING
   * Tap soil squares that light up one at a time. Plant 14 seeds before frost
   * covers them. Each square is active for ~1.6s. 26s total.
   * ──────────────────────────────────────────────────────────────────────── */
  var ch2 = {
    id: 'planting',
    name: 'Winter Planting',
    sub: 'Coax the sleeping garden back to life',
    intro: [
      'Winter. The garden sleeps',
      'under grey Yorksh ire skies.',
      'Dickon has brought seeds —\nbut frost is coming fast.',
      'Tap the glowing soil before\nthe ground freezes solid.',
    ],
    quote: '"One of the strange things about living in the world is that it is only now and then one is quite sure one is going to live forever and ever and ever." — F. H. Burnett',
    help: 'Tap the glowing soil patches quickly to plant seeds. 14 seeds win!',
    winText: 'The seeds are in the ground — spring will come!',
    loseText: 'Frost takes the garden. Try again!',
    icon: function (api, x, y) { CHAPTER_ICONS[1](api, x, y); },
    init: function (api) {
      // 4×4 grid of soil patches
      var W = api.W, H = api.H;
      var cols = 4, rows = 4;
      var cw = 52, ch = 44;
      var startX = (W - cols * cw) / 2 + 8, startY = 170;
      var patches = [];
      for (var r = 0; r < rows; r++) {
        for (var cc = 0; cc < cols; cc++) {
          patches.push({
            x: startX + cc * cw, y: startY + r * ch,
            w: cw - 8, h: ch - 8,
            planted: false, active: false, activeT: 0,
            frosted: false, frostedT: 0,
          });
        }
      }
      api._s2 = {
        patches: patches,
        planted: 0, need: 14,
        timer: 26,
        activeIdx: -1, nextSpawn: 0.5,
        done: false,
      };
    },
    update: function (api, dt) {
      var s = api._s2, W = api.W;
      if (s.done) return;

      s.timer -= dt;
      if (s.timer <= 0 && s.planted < s.need) { s.done = true; api.lose(); return; }

      // Spawn a new active patch
      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        // pick a random un-planted, un-active patch
        var avail = [];
        for (var i = 0; i < s.patches.length; i++) {
          if (!s.patches[i].planted && !s.patches[i].active && !s.patches[i].frosted) avail.push(i);
        }
        if (avail.length > 0) {
          var idx = avail[Math.floor(Math.random() * avail.length)];
          s.patches[idx].active = true;
          s.patches[idx].activeT = 0;
          s.activeIdx = idx;
        }
        s.nextSpawn = Math.max(0.4, 1.3 - (26 - s.timer) * 0.025);
      }

      // Update active patches
      for (var j = 0; j < s.patches.length; j++) {
        var p = s.patches[j];
        if (p.active) {
          p.activeT += dt;
          if (p.activeT > 1.6) {
            p.active = false; p.frosted = true; p.frostedT = 0;
          }
        }
        if (p.frosted) {
          p.frostedT += dt;
        }
      }

      // Touch / tap input
      if (api.pointer.justDown) {
        var px = api.pointer.x, py = api.pointer.y;
        for (var k = 0; k < s.patches.length; k++) {
          var pk = s.patches[k];
          if (pk.active && px >= pk.x && px <= pk.x + pk.w && py >= pk.y && py <= pk.y + pk.h) {
            pk.active = false; pk.planted = true;
            s.planted++;
            api.addScore(12);
            api.burst(pk.x + pk.w / 2, pk.y + pk.h / 2, C.ivyL, 6);
            api.audio.sfx('coin');
            if (s.planted >= s.need) { s.done = true; api.win(); return; }
          }
        }
      }
    },
    draw: function (api) {
      var s = api._s2, g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Cold sky
      var sky = c.createLinearGradient(0, 0, 0, H * 0.5);
      sky.addColorStop(0, '#5080a0'); sky.addColorStop(1, '#90b8cc');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);

      // Frost clouds
      c.globalAlpha = 0.35;
      for (var ci = 0; ci < 5; ci++) {
        g.circle(40 + ci * 50, 40 + (ci % 2) * 20, 24 + ci * 4, C.frostL);
      }
      c.globalAlpha = 1;

      // Ground
      c.fillStyle = C.earthLL; c.fillRect(0, H * 0.48, W, H * 0.52);
      c.fillStyle = C.earth; c.fillRect(0, H - 30, W, 30);

      // Dickon watching
      drawDickon(g, 26, H - 66, api.t);

      // Soil patches
      for (var j = 0; j < s.patches.length; j++) {
        var p = s.patches[j];
        var col = C.earth;
        if (p.planted) col = C.earthL;
        else if (p.frosted) col = C.frost;
        else if (p.active) {
          var blink = Math.sin(p.activeT * 12) > 0;
          col = blink ? C.goldL : C.goldD;
        }
        g.rect(p.x, p.y, p.w, p.h, col);
        g.rectO(p.x, p.y, p.w, p.h, C.earthLL, 1);

        if (p.planted) {
          // Small green sprout
          c.strokeStyle = C.grassL; c.lineWidth = 2;
          var sx = p.x + p.w / 2, sy = p.y + p.h - 4;
          c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx, sy - 12); c.stroke();
          c.fillStyle = C.ivyL;
          c.beginPath(); c.ellipse(sx - 5, sy - 9, 5, 3, -0.5, 0, Math.PI * 2); c.fill();
        } else if (p.frosted) {
          // Frost crystals
          c.strokeStyle = C.frostL; c.lineWidth = 1;
          for (var fi = 0; fi < 3; fi++) {
            var fx = p.x + 8 + fi * 12, fy = p.y + p.h / 2;
            c.beginPath(); c.moveTo(fx, fy - 5); c.lineTo(fx, fy + 5); c.stroke();
            c.beginPath(); c.moveTo(fx - 4, fy); c.lineTo(fx + 4, fy); c.stroke();
          }
        }
      }

      // HUD
      api.topBar(
        'PLANTED ' + s.planted + '/' + s.need,
        '',
        Math.ceil(Math.max(0, s.timer)) + 's',
      );
    },
  };

  /* ────────────────────────────────────────────────────────────────────────
   * CHAPTER 3 — DICKON'S CREATURES
   * Wild animals pop up in random spots. Tap them before they bolt!
   * 20 creatures in 28s. Miss = wastes time. 3 "scared off" = fail.
   * ──────────────────────────────────────────────────────────────────────── */
  var ch3 = {
    id: 'creatures',
    name: "Dickon's Creatures",
    sub: 'Befriend the wild folk of the moor',
    intro: [
      "Dickon has a gift — all the\nwild things trust him.",
      'A crow, a fox cub, two rabbits,\na curly-tailed squirrel.',
      'Tap each creature gently\nbefore it bolts back to the wild.',
    ],
    quote: '"He was a Yorkshire boy and he was accustomed to the moor animals." — F. H. Burnett',
    help: 'Tap creatures before they flee! 3 escapes and the chapter is lost.',
    winText: "All Dickon's friends are at ease in the garden!",
    loseText: 'Too many creatures startled away.',
    icon: function (api, x, y) { CHAPTER_ICONS[2](api, x, y); },
    init: function (api) {
      var types = ['rabbit', 'fox', 'crow', 'squirrel'];
      api._s3 = {
        creatures: [],
        caught: 0, need: 20,
        fled: 0, maxFled: 3,
        timer: 28,
        spawnT: 0, spawnRate: 1.0,
        done: false,
        types: types,
      };
    },
    update: function (api, dt) {
      var s = api._s3, W = api.W, H = api.H;
      if (s.done) return;

      s.timer -= dt;
      if (s.timer <= 0 && s.caught < s.need) { s.done = true; api.lose(); return; }

      // Spawn
      s.spawnT += dt;
      if (s.spawnT >= s.spawnRate) {
        s.spawnT = 0;
        s.spawnRate = Math.max(0.45, 1.0 - (28 - s.timer) * 0.02);
        if (s.creatures.length < 6) {
          var type = s.types[Math.floor(Math.random() * s.types.length)];
          s.creatures.push({
            x: 28 + Math.random() * (W - 56),
            y: 140 + Math.random() * (H - 200),
            type: type,
            age: 0, life: 1.8 + Math.random() * 0.6,
            tapped: false, tapT: 0,
          });
        }
      }

      // Update creatures
      for (var i = s.creatures.length - 1; i >= 0; i--) {
        var cr = s.creatures[i];
        cr.age += dt;
        if (cr.tapped) {
          cr.tapT += dt;
          if (cr.tapT > 0.5) s.creatures.splice(i, 1);
          continue;
        }
        if (cr.age >= cr.life) {
          // Fled!
          s.fled++;
          s.creatures.splice(i, 1);
          api.flash('#4444aa', 0.15);
          api.audio.sfx('hurt');
          if (s.fled >= s.maxFled) { s.done = true; api.lose(); return; }
        }
      }

      // Tap input
      if (api.pointer.justDown) {
        var px = api.pointer.x, py = api.pointer.y;
        for (var j = 0; j < s.creatures.length; j++) {
          var cr2 = s.creatures[j];
          if (cr2.tapped) continue;
          var ddx = px - cr2.x, ddy = py - cr2.y;
          if (ddx * ddx + ddy * ddy < 32 * 32) {
            cr2.tapped = true; cr2.tapT = 0;
            s.caught++;
            api.addScore(15);
            api.burst(cr2.x, cr2.y, C.gold, 8);
            api.audio.sfx('coin');
            if (s.caught >= s.need) { s.done = true; api.win(); return; }
            break;
          }
        }
      }
    },
    draw: function (api) {
      var s = api._s3, g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Garden scene
      var sky = c.createLinearGradient(0, 0, 0, H * 0.45);
      sky.addColorStop(0, C.sky); sky.addColorStop(1, C.skyM);
      c.fillStyle = sky; c.fillRect(0, 0, W, H);

      // Background trees
      for (var ti = 0; ti < 4; ti++) {
        var tx = 30 + ti * 64;
        c.fillStyle = C.ivyL; c.fillRect(tx - 12, H * 0.35, 24, H * 0.12);
        c.fillStyle = C.ivy;
        c.beginPath(); c.arc(tx, H * 0.35, 22, 0, Math.PI * 2); c.fill();
        c.fillStyle = C.ivyLL;
        c.beginPath(); c.arc(tx, H * 0.3, 16, 0, Math.PI * 2); c.fill();
      }

      // Ground
      c.fillStyle = C.grassL; c.fillRect(0, H - 70, W, 70);
      c.fillStyle = C.grass; c.fillRect(0, H - 35, W, 35);

      // Scattered flowers
      for (var fi = 0; fi < 8; fi++) {
        var fx = 20 + fi * 32, fy = H - 62;
        g.circle(fx, fy, 4, C.roseL);
        g.circle(fx, fy, 2, C.gold);
      }

      // Creatures
      for (var i = 0; i < s.creatures.length; i++) {
        var cr = s.creatures[i];
        c.globalAlpha = cr.tapped ? Math.max(0, 1 - cr.tapT * 2) : 1;
        var urgency = cr.age / cr.life;
        // Warn ring when about to flee
        if (urgency > 0.65 && !cr.tapped) {
          c.strokeStyle = urgency > 0.85 ? C.rose : C.gold;
          c.lineWidth = 2;
          c.globalAlpha *= 0.7;
          c.beginPath(); c.arc(cr.x, cr.y, 24 + Math.sin(api.t * 10) * 3, 0, Math.PI * 2); c.stroke();
          c.globalAlpha = cr.tapped ? Math.max(0, 1 - cr.tapT * 2) : 1;
        }
        drawCreature(g, c, cr.type, cr.x, cr.y, api.t);
        // Tap burst
        if (cr.tapped) {
          g.circle(cr.x, cr.y, cr.tapT * 30, C.gold);
          api.txtC('♥', cr.x, cr.y - cr.tapT * 20, 10, C.rose);
        }
        c.globalAlpha = 1;
      }

      // Dickon watching from the side
      drawDickon(g, W - 24, H - 66, api.t);

      // Escaped indicator
      for (var ei = 0; ei < s.maxFled; ei++) {
        g.circle(12 + ei * 16, 38, 5, ei < s.fled ? C.stoneD : C.ivyL);
      }

      api.topBar(
        'CALMED ' + s.caught + '/' + s.need,
        '●'.repeat(s.maxFled - s.fled) + '○'.repeat(s.fled),
        Math.ceil(Math.max(0, s.timer)) + 's',
      );
    },
  };

  /* ────────────────────────────────────────────────────────────────────────
   * CHAPTER 4 — COLIN STANDS
   * A shrinking ring: tap when it reaches the center sweet-spot.
   * 7 successful steps = win. 4 misses = lose.
   * The ring shrinks slower for early steps, speeds up as confidence grows.
   * ──────────────────────────────────────────────────────────────────────── */
  var ch4 = {
    id: 'colin',
    name: 'Colin Stands',
    sub: 'Give the hidden boy courage to walk',
    intro: [
      'Colin Craven has lived in bed,\nconvinced he will die young.',
      'Now, in the secret garden,\nhe wants to try — to stand,',
      'to take a step, to believe.\nTap at just the right moment!',
    ],
    quote: '"I am going to live forever and ever and ever!" — Colin, The Secret Garden',
    help: 'Tap when the ring reaches the glowing centre. 4 misses and Colin loses heart.',
    winText: 'Colin walks! The garden works its magic!',
    loseText: "Colin's courage wavers. Try once more!",
    icon: function (api, x, y) { CHAPTER_ICONS[3](api, x, y); },
    init: function (api) {
      api._s4 = {
        steps: 0, need: 7,
        misses: 0, maxMiss: 4,
        ring: { r: 90, speed: 42, active: true, hit: false, hitT: 0, miss: false, missT: 0 },
        colinSteps: 0,
        done: false,
        celebT: 0,
      };
    },
    update: function (api, dt) {
      var s = api._s4;
      if (s.done) return;

      var rng = s.ring;

      if (rng.hit) {
        rng.hitT += dt;
        if (rng.hitT > 0.7) {
          rng.hit = false;
          rng.r = 90;
          rng.speed = 42 + s.steps * 5; // faster each step
          rng.active = true;
        }
        return;
      }
      if (rng.miss) {
        rng.missT += dt;
        if (rng.missT > 0.6) {
          rng.miss = false;
          rng.r = 90;
          rng.active = true;
        }
        return;
      }

      if (rng.active) {
        rng.r -= rng.speed * dt;
        if (rng.r <= 8) {
          // Too late — missed
          rng.active = false; rng.miss = true; rng.missT = 0;
          s.misses++;
          api.shake(5, 0.2);
          api.flash(C.stoneD, 0.15);
          api.audio.sfx('hurt');
          if (s.misses >= s.maxMiss) { s.done = true; api.lose(); }
        }
      }

      // Tap / touch input
      var tapped = api.keyPressed('a') || api.keyPressed('up') || api.pointer.justDown;
      if (tapped && rng.active) {
        if (rng.r <= 30 && rng.r >= 8) {
          // Good hit
          rng.active = false; rng.hit = true; rng.hitT = 0;
          s.steps++;
          s.colinSteps++;
          api.addScore(20);
          api.burst(api.W / 2, api.H / 2, C.gold, 10);
          api.audio.sfx('win');
          if (s.steps >= s.need) { s.done = true; api.win(); }
        } else {
          // Miss — ring still big
          rng.active = false; rng.miss = true; rng.missT = 0;
          s.misses++;
          api.flash(C.stoneD, 0.15);
          api.audio.sfx('hurt');
          if (s.misses >= s.maxMiss) { s.done = true; api.lose(); }
        }
      }
    },
    draw: function (api) {
      var s = api._s4, g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      var rng = s.ring;

      // Sunny garden
      c.fillStyle = C.skyM; c.fillRect(0, 0, W, H);
      c.fillStyle = C.grassL; c.fillRect(0, H - 80, W, 80);
      c.fillStyle = C.grass; c.fillRect(0, H - 40, W, 40);

      // Sunbeams
      c.globalAlpha = 0.12;
      for (var sb = 0; sb < 8; sb++) {
        c.fillStyle = C.goldL;
        c.beginPath();
        var sa = (sb / 8) * Math.PI * 2 + api.t * 0.1;
        c.moveTo(W / 2, -10);
        c.lineTo(W / 2 + Math.cos(sa) * H * 1.2, H * 1.1);
        c.lineTo(W / 2 + Math.cos(sa + 0.15) * H * 1.2, H * 1.1);
        c.fill();
      }
      c.globalAlpha = 1;

      // Flowers on ground
      for (var fi = 0; fi < 10; fi++) {
        var fx = 15 + fi * 26, fy = H - 72;
        g.circle(fx, fy, 5, fi % 2 === 0 ? C.rose : C.roseL);
        g.circle(fx, fy, 2, C.gold);
      }

      // Colin in center
      var lean = rng.hit ? Math.min(s.steps / s.need, 1) : 0;
      drawColin(g, c, W / 2, H / 2 + 10, s.colinSteps, lean);

      // Step dots
      for (var si = 0; si < s.need; si++) {
        g.circle(W / 2 - (s.need - 1) * 9 + si * 18, H / 2 + 55, 6,
          si < s.steps ? C.gold : C.stoneD);
      }

      // Timing ring
      if (rng.active) {
        c.strokeStyle = C.ivyL; c.lineWidth = 3;
        c.globalAlpha = 0.4;
        c.beginPath(); c.arc(W / 2, H / 2, rng.r, 0, Math.PI * 2); c.stroke();
        c.globalAlpha = 1;
        // Sweet-spot indicator (ring r = 8-30)
        c.strokeStyle = C.gold; c.lineWidth = 4;
        c.beginPath(); c.arc(W / 2, H / 2, 20, 0, Math.PI * 2); c.stroke();
        c.strokeStyle = C.goldL; c.lineWidth = 2;
        c.beginPath(); c.arc(W / 2, H / 2, 8, 0, Math.PI * 2); c.stroke();
        // Moving ring
        c.strokeStyle = rng.r <= 32 ? C.rose : C.robinW; c.lineWidth = 5;
        c.beginPath(); c.arc(W / 2, H / 2, Math.max(8, rng.r), 0, Math.PI * 2); c.stroke();
      }
      if (rng.hit) {
        c.strokeStyle = C.gold; c.lineWidth = 6;
        c.globalAlpha = Math.max(0, 1 - rng.hitT * 2);
        c.beginPath(); c.arc(W / 2, H / 2, 20 + rng.hitT * 40, 0, Math.PI * 2); c.stroke();
        c.globalAlpha = 1;
        api.txtC('STEP ' + s.steps + '!', W / 2, H / 2 - 60, 12, C.gold);
      }
      if (rng.miss) {
        api.txtC('TOO EARLY!', W / 2, H / 2 - 60, 10, C.rose);
      }

      api.topBar(
        'STEPS ' + s.steps + '/' + s.need,
        '♥'.repeat(s.maxMiss - s.misses),
        'TAP!',
      );
    },
  };

  /* ────────────────────────────────────────────────────────────────────────
   * CHAPTER 5 — THE MAGIC
   * The garden blooms! Catch falling golden magic sparks. Dodge grey stones.
   * Archibald Craven approaches from outside — collect 15 blooms in 30s, 3 lives.
   * ──────────────────────────────────────────────────────────────────────── */
  var ch5 = {
    id: 'magic',
    name: 'The Magic',
    sub: "The garden's secret fills the air",
    intro: [
      'The garden is alive with magic —',
      'golden sparks drift on the breeze.',
      "Archibald Craven approaches\nthe locked door from outside.",
      'Catch the blooms before they fade.\nDo not let the grey stones crush them.',
    ],
    quote: '"Magic is always pushing and drawing and making things out of nothing." — F. H. Burnett',
    help: 'Move to catch golden magic blooms. Dodge the grey stones. 15 blooms win!',
    winText: 'The garden blooms in full! Archibald sees his son walk!',
    loseText: 'The magic fades… but the garden remembers.',
    icon: function (api, x, y) { CHAPTER_ICONS[4](api, x, y); },
    init: function (api) {
      api._s5 = {
        mx: api.W / 2, my: api.H - 80,
        blooms: 0, need: 15,
        lives: 3,
        timer: 30,
        items: [],
        spawnT: 0, spawnRate: 1.2,
        hurt: false, hurtT: 0,
        arch: { x: -40, spd: 18 },  // Archibald approaching
        done: false,
      };
    },
    update: function (api, dt) {
      var s = api._s5, W = api.W, H = api.H;
      if (s.done) return;

      // Player movement
      var spd = 125;
      if (api.keyDown('left') || (api.pointer.down && api.pointer.x < W / 2)) s.mx -= spd * dt;
      if (api.keyDown('right') || (api.pointer.down && api.pointer.x >= W / 2)) s.mx += spd * dt;
      s.mx = clamp(s.mx, 14, W - 14);

      // Archibald creeping closer
      s.arch.x += s.arch.spd * dt;
      if (s.arch.x > W + 60) s.arch.x = -60;

      // Spawn
      s.spawnT += dt;
      if (s.spawnT >= s.spawnRate) {
        s.spawnT = 0;
        s.spawnRate = Math.max(0.5, 1.2 - (30 - s.timer) * 0.02);
        var isMagic = Math.random() < 0.58;
        s.items.push({
          x: 18 + Math.random() * (W - 36),
          y: -14,
          vy: 72 + Math.random() * 55,
          type: isMagic ? 'bloom' : 'stone',
          spin: Math.random() * 6,
          pulse: Math.random() * Math.PI * 2,
        });
      }

      // Items
      for (var i = s.items.length - 1; i >= 0; i--) {
        var it = s.items[i];
        it.y += it.vy * dt;
        it.spin += dt * 2;
        if (it.y > H + 20) { s.items.splice(i, 1); continue; }
        var dx2 = it.x - s.mx, dy2 = it.y - (s.my - 10);
        if (dx2 * dx2 + dy2 * dy2 < 24 * 24) {
          s.items.splice(i, 1);
          if (it.type === 'bloom') {
            s.blooms++;
            api.addScore(18);
            api.burst(it.x, it.y, C.gold, 8);
            api.audio.sfx('coin');
            if (s.blooms >= s.need) { s.done = true; api.win(); return; }
          } else {
            if (!s.hurt) {
              s.lives--;
              s.hurt = true; s.hurtT = 1.0;
              api.shake(7, 0.3); api.flash(C.stoneD, 0.2);
              api.audio.sfx('hurt');
              if (s.lives <= 0) { s.done = true; api.lose(); return; }
            }
          }
        }
      }

      if (s.hurt) { s.hurtT -= dt; if (s.hurtT <= 0) s.hurt = false; }

      s.timer -= dt;
      if (s.timer <= 0) { s.done = true; api.lose(); }
    },
    draw: function (api) {
      var s = api._s5, g = api.gfx, c = api.ctx, W = api.W, H = api.H;

      // Full bloom garden sky
      var sky = c.createLinearGradient(0, 0, 0, H * 0.5);
      sky.addColorStop(0, C.sky); sky.addColorStop(1, C.skyM);
      c.fillStyle = sky; c.fillRect(0, 0, W, H);

      // Sunlight burst
      c.globalAlpha = 0.08;
      for (var sb = 0; sb < 12; sb++) {
        var sa2 = (sb / 12) * Math.PI * 2 + api.t * 0.08;
        c.fillStyle = C.goldL;
        c.beginPath(); c.moveTo(W / 2 - 20, 0);
        c.lineTo(W * 0.4 + Math.cos(sa2) * 300, H);
        c.lineTo(W * 0.4 + Math.cos(sa2 + 0.1) * 300, H);
        c.fill();
      }
      c.globalAlpha = 1;

      // Garden floor
      c.fillStyle = C.grassL; c.fillRect(0, H - 65, W, 65);
      c.fillStyle = C.grass; c.fillRect(0, H - 30, W, 30);

      // Many flowers on ground
      for (var fi = 0; fi < 14; fi++) {
        var fx2 = 10 + fi * 19, fy2 = H - 60 + Math.sin(fi * 1.3) * 8;
        var flCol = fi % 3 === 0 ? C.rose : (fi % 3 === 1 ? C.roseL : C.purple);
        g.circle(fx2, fy2, 5 + (fi % 2) * 2, flCol);
        g.circle(fx2, fy2, 2, C.gold);
      }

      // Brick wall (partial)
      c.fillStyle = C.wallD; c.fillRect(0, H * 0.38, W, 14);
      for (var bri = 0; bri < W; bri += 36) {
        g.rectO(bri, H * 0.38, 34, 12, C.wall, 1);
      }
      // Ivy
      c.fillStyle = C.ivyL; c.fillRect(0, H * 0.38 - 8, W, 10);

      // Archibald approaching on other side of wall
      var ax = s.arch.x;
      c.globalAlpha = 0.7;
      // Tall man silhouette
      g.rect(ax - 10, H * 0.35 - 55, 20, 55, C.greyD);
      g.circle(ax, H * 0.35 - 58, 11, C.grey);
      g.rect(ax - 12, H * 0.35 - 68, 24, 8, C.greyD);
      c.globalAlpha = 1;

      // Falling items
      for (var i = 0; i < s.items.length; i++) {
        var it = s.items[i];
        c.save(); c.translate(it.x, it.y); c.rotate(it.spin);
        if (it.type === 'bloom') {
          var pulse2 = Math.sin(api.t * 8 + it.pulse) * 2;
          // Golden magic bloom
          c.fillStyle = C.gold;
          for (var pi = 0; pi < 5; pi++) {
            var pa = (pi / 5) * Math.PI * 2;
            c.beginPath(); c.ellipse(Math.cos(pa) * 7, Math.sin(pa) * 7, 4, 3, pa, 0, Math.PI * 2); c.fill();
          }
          g.circle(0, 0, 4 + pulse2, C.goldL);
          c.globalAlpha = 0.5; g.circle(0, 0, 8 + pulse2, C.goldL); c.globalAlpha = 1;
        } else {
          // Grey stone
          c.fillStyle = C.stoneD;
          c.beginPath(); c.ellipse(0, 0, 8, 6, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = C.stone;
          c.beginPath(); c.ellipse(-2, -2, 5, 4, 0, 0, Math.PI * 2); c.fill();
        }
        c.restore();
      }

      // Mary
      drawMary(g, c, s.mx, s.my, api.t, s.hurt);

      api.topBar(
        'BLOOMS ' + s.blooms + '/' + s.need,
        '♥'.repeat(s.lives),
        Math.ceil(Math.max(0, s.timer)) + 's',
      );
    },
  };

  /* ─── Create the saga ────────────────────────────────────────────────────── */
  RetroSaga.create({
    id: 'secretgarden',
    title: 'The Secret Garden',
    subtitle: 'FIVE CHAPTERS IN THE WALLED GARDEN',
    currency: 'BLOSSOMS',
    credit: 'THE SECRET GARDEN · F. H. BURNETT',
    bootLine: 'FIVE CHAPTERS · ONE HIDDEN DOOR',
    tagline: 'A POLECAT ADVENTURE',
    bootCta: 'TAP TO ENTER THE GARDEN',
    menuLabel: 'THE GARDEN CHAPTERS',
    menuHint: 'CHOOSE A PATH THROUGH THE GARDEN',
    menuDone: 'THE GARDEN IS IN FULL BLOOM',
    accent: C.rose,

    screens: {
      win:          C.ivyL,
      lose:         C.roseD,
      chapterLabel: C.gold,
      name:         C.cream,
      sub:          C.roseL,
      intro:        '#e8f8d0',
      quote:        '#9ab870',
      help:         C.goldL,
      score:        C.cream,
      cur:          C.rose,
      cta:          C.goldL,
      overlay:      'rgba(6,16,4,.84)',
    },

    labels: {
      chapter:  'CHAPTER',
      score:    'BLOSSOMS GATHERED',
      win:      'THE GARDEN BLOOMS',
      lose:     'THE ROSES WITHER',
      cont:     'TAP TO CONTINUE',
      finale:   'TAP TO SEE THE FULL BLOOM',
      toMenu:   'BACK TO THE GARDEN',
      play:     'ENTER THE GARDEN',
    },

    emblem,
    scenery,

    menu: {
      colors: {
        title:  C.gold,
        label:  C.cream,
        cur:    C.rose,
        done:   C.ivyL,
        locked: C.stoneD,
      },

      layout: function () {
        return GARDEN_NODES.map(function (n) {
          return { x: n.x, y: n.y, w: n.w, h: n.h };
        });
      },

      title: function (api, blossoms) {
        var g = api.gfx, c = api.ctx, W = api.W;
        // Garden title plaque at top
        g.rect(30, 14, W - 60, 42, C.wallD);
        g.rectO(30, 14, W - 60, 42, C.wallL, 2);
        api.txtC('THE GARDEN', W / 2, 24, 10, C.goldL);
        api.txtC('BLOSSOMS  ' + blossoms, W / 2, 42, 9, C.rose);
        // Winding path lines
        c.strokeStyle = C.earthL; c.lineWidth = 5; c.setLineDash([6, 4]);
        c.beginPath();
        GARDEN_NODES.forEach(function (n, i) {
          var cx2 = n.x + n.w / 2, cy2 = n.y + n.h / 2;
          if (i === 0) c.moveTo(cx2, cy2); else c.lineTo(cx2, cy2);
        });
        c.stroke();
        c.setLineDash([]);
      },

      card: function (api, info) {
        var g = api.gfx, c = api.ctx;
        var ch = info.ch, i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        var sel = info.sel, done = info.done;

        // Flower bed card — a stone-edged garden plot
        var bgCol = done ? '#1e3e10' : (sel ? '#2e5e18' : '#163008');
        g.rect(x, y, w, h, bgCol);
        g.rectO(x, y, w, h, done ? C.ivyL : (sel ? C.gold : C.stone), sel ? 3 : 2);

        // Soil strip at bottom
        g.rect(x + 2, y + h - 14, w - 4, 12, C.earth);

        // Rose bushes in the soil
        var numRoses = 3;
        for (var ri = 0; ri < numRoses; ri++) {
          var rx = x + 10 + ri * ((w - 20) / (numRoses - 1));
          var ry = y + h - 16;
          c.strokeStyle = C.ivyL; c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx, ry - 10); c.stroke();
          var rcol = done ? C.roseL : (sel ? C.rose : C.roseD);
          g.circle(rx, ry - 12, 5, rcol);
          if (done) g.circle(rx, ry - 12, 2, C.gold);
        }

        // Chapter icon in upper area
        var iconX = x + w / 2, iconY = y + h / 2 - 8;
        CHAPTER_ICONS[i](api, iconX, iconY);

        // Chapter name
        var labelCol = done ? C.goldL : (sel ? C.white : C.cream);
        api.txtCFit(ch.name, x + w / 2, y + 6, 7, labelCol, true);

        // Score badge
        if (done && info.best !== undefined) {
          g.rect(x + w - 28, y + 2, 26, 12, C.roseD);
          api.txtC('' + info.best, x + w - 15, y + 4, 6, C.white);
        }

        // Selected sparkle
        if (sel) {
          c.globalAlpha = 0.6 + Math.sin(api.t * 6) * 0.4;
          g.circle(x + 8, y + 8, 4, C.goldL);
          g.circle(x + w - 8, y + h - 8, 4, C.roseL);
          c.globalAlpha = 1;
        }
      },
    },

    chapters: [ch1, ch2, ch3, ch4, ch5],

    finale: "THE GARDEN LIVES AGAIN\n\nMary, Colin, and Dickon stand\namong the roses as Archibald\nCraven hears his son's laughter\nfor the very first time.\n\nThe secret was never the garden —\nit was the magic of believing.",
  });
})();
