/* ============================================================================
 * HEIDI — A YEAR ON THE ALM
 * Johanna Spyri's 1881 novel as an alpine day-cycle chore sim (REBUILD_QUEUE
 * #17): four seasons on Grandfather's alm, three chores a day —
 *   HERD GOATS    — tap Peter's wandering flock back to the meadow (FOOD/BOND)
 *   FORAGE MEADOW — gather edelweiss & herbs, dodge the nettles (FOOD/HEALTH)
 *   TEND HEARTH   — stir the cheese pot in rhythm with the fire (BOND/HEALTH)
 *   REST          — Heidi naps in the sun (HEALTH, no chore played)
 * Balance FOOD, HEALTH and BOND across Spring/Summer/Autumn/Winter — a hard
 * winter punishes empty stores — then Clara's first steps in the finale play
 * out warmer the better you cared for the Alm. Built directly on the bare
 * RetroEngine (no chapter-select menu — a single continuous seasonal loop).
 * ============================================================================ */
(function () {
  'use strict';
  var U = Retro.util, clamp = U.clamp;

  /* ─── Palette (kept from the original tale-based build) ─────────────────── */
  var C = {
    sky1: '#5bc8f5', sky2: '#a8e0f8', sky3: '#daf0fc',
    grass: '#4a9c3c', grassL: '#5ab84a', grassD: '#3a7a2c',
    mtn: '#8b9eaa', mtn2: '#a8b8c4', snow: '#e8f4fc',
    rock: '#8b7355', rockD: '#6a5a40', wood: '#a0703a', woodD: '#7a5228',
    gold: '#f5c842', goldD: '#d4a020', flwr: '#e84090', flwr2: '#ff60a8',
    edelw: '#ffffff', heidi: '#e8a870', heidD: '#c87848',
    apron: '#4499e8', aprnD: '#2266c0', goat: '#e8e0d0', goatD: '#c0b898',
    clara: '#f0dcc0', claraD: '#d0bc90', red: '#cc2211', cream: '#f5ead0',
    grey: '#888890', frank: '#1a1208', fire: '#ff8a2a', fireD: '#c94a12',
    food: '#f5c842', health: '#e05a6a', bond: '#7ab0f0',
  };

  /* ─── Shared draw helpers (unchanged from the tale build) ────────────────── */
  function drawMtn(c, x, y, w, h, col) {
    c.fillStyle = col; c.beginPath();
    c.moveTo(x, y + h); c.lineTo(x + w / 2, y); c.lineTo(x + w, y + h);
    c.closePath(); c.fill();
  }
  function drawFlower(g, x, y, col) {
    g.circle(x - 4, y, 3, col); g.circle(x + 4, y, 3, col);
    g.circle(x, y - 4, 3, col); g.circle(x, y + 4, 3, col);
    g.circle(x, y, 3, C.gold);
  }
  function drawGoat(g, x, y, t) {
    g.rect(x - 10, y - 5, 20, 12, C.goat);
    g.rect(x + 8, y - 12, 10, 8, C.goat);
    g.rect(x + 15, y - 10, 2, 2, '#404040');
    g.rect(x + 10, y - 16, 2, 5, C.goatD);
    g.rect(x + 14, y - 16, 2, 5, C.goatD);
    var leg = Math.floor(Math.sin(t * 10 + x * 0.1)) > 0 ? 2 : -2;
    g.rect(x - 6, y + 7, 4, 7 + leg, C.goatD);
    g.rect(x + 2, y + 7, 4, 7 - leg, C.goatD);
    g.rect(x + 8, y + 7, 4, 7 + leg, C.goatD);
    g.rect(x - 12, y - 6, 3, 4, C.goatD);
  }
  function drawHeidi(g, c, x, y, t, flashing) {
    if (flashing) return;
    g.rect(x - 6, y - 14, 12, 14, C.apron);
    g.rect(x - 5, y - 24, 10, 12, C.heidi);
    g.circle(x, y - 30, 9, C.heidi);
    g.rect(x - 9, y - 27, 4, 10, C.goldD);
    g.rect(x + 5, y - 27, 4, 10, C.goldD);
    var leg = Math.sin(t * 8) * 4;
    g.rect(x - 4, y, 4, 8 + leg, C.aprnD);
    g.rect(x + 1, y, 4, 8 - leg, C.aprnD);
    g.rect(x - 5, y + 7 + leg, 5, 3, '#604020');
    g.rect(x + 1, y + 7 - leg, 5, 3, '#604020');
  }
  function drawClara(g, c, x, y, steps) {
    var lean = steps > 0 ? Math.sin(steps * 1.2) * 3 : 0;
    g.rect(x - 6 + lean, y - 14, 12, 14, C.claraD);
    g.rect(x - 5 + lean, y - 24, 10, 12, C.clara);
    g.circle(x + lean, y - 30, 8, C.clara);
    g.rect(x - 7 + lean, y - 33, 14, 4, '#8a5a2a');
    g.rect(x + lean - 4, y, 4, 8, C.claraD);
    g.rect(x + lean + 1, y, 4, 8, C.claraD);
  }
  function drawEmblem(g, cx, cy) {
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      g.circle(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11, 5, C.edelw);
    }
    g.circle(cx, cy, 7, C.gold);
    g.circle(cx, cy, 3, '#f0f0f0');
  }

  /* ─── Engine ──────────────────────────────────────────────────────────────
     Bare RetroEngine, not RetroSaga — the day-cycle loop has no chapter-select
     menu, so it doesn't fit the saga chassis. Own pointer tracking + own tiny
     UI/juice helpers, same conventions as saga.js. */
  var W = 270, H = 480;
  var engine = new Retro.Engine({ width: W, height: H, parent: '#game', touch: false });
  var ctx = engine.ctx, gfx = engine.gfx, input = engine.input, audio = engine.audio;

  var ptr = { x: W / 2, y: H / 2, down: false, justDown: false };
  function mapPt(cx2, cy2) {
    var r = engine.canvas.getBoundingClientRect();
    ptr.x = clamp((cx2 - r.left) / r.width * W, 0, W);
    ptr.y = clamp((cy2 - r.top) / r.height * H, 0, H);
  }
  function pDown(x, y) { mapPt(x, y); ptr.down = true; ptr.justDown = true; audio.resume(); }
  function pMove(x, y) { if (ptr.down) mapPt(x, y); }
  function pUp() { ptr.down = false; }
  var cv = engine.canvas;
  cv.addEventListener('mousedown', function (e) { pDown(e.clientX, e.clientY); });
  cv.addEventListener('mousemove', function (e) { pMove(e.clientX, e.clientY); });
  window.addEventListener('mouseup', function () { pUp(); });
  cv.addEventListener('touchstart', function (e) { e.preventDefault(); var t = e.changedTouches[0]; pDown(t.clientX, t.clientY); }, { passive: false });
  cv.addEventListener('touchmove', function (e) { e.preventDefault(); var t = e.changedTouches[0]; pMove(t.clientX, t.clientY); }, { passive: false });
  cv.addEventListener('touchend', function (e) { e.preventDefault(); pUp(); }, { passive: false });
  function confirmPressed() { return ptr.justDown || input.pressed('a') || input.pressed('start'); }

  function txt(s, x, y, sz, col, align) { gfx.text(s, x, y, col, sz, align || 'left'); }
  function txtC(s, x, y, sz, col) { gfx.textC(s, x, y, col, sz); }
  function lines(arr, x, y, sz, col, lh) { for (var i = 0; i < arr.length; i++) txtC(arr[i], x, y + i * (lh || sz + 4), sz, col); }
  function measureText(str, sz) { ctx.font = sz + "px 'Press Start 2P', monospace"; return ctx.measureText(str).width; }
  // Word-wrap a long narrative string to the canvas width (measure-based, not
  // char-count — the pixel font isn't monospaced at every size).
  function wrapFit(str, sz, maxW) {
    var words = String(str).split(' '), out = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (line && measureText(test, sz) > maxW) { out.push(line); line = words[i]; }
      else line = test;
    }
    if (line) out.push(line);
    return out;
  }
  function vignette() {
    var g = ctx.createRadialGradient(W / 2, H / 2, H * 0.24, W / 2, H / 2, H * 0.64);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.42)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function panel(x, y, w, h, fill, border) {
    gfx.rect(x, y, w, h, fill || 'rgba(20,14,6,.85)');
    ctx.strokeStyle = border || C.woodD; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  }
  function topBar(label, right) {
    gfx.rect(0, 0, W, 16, 'rgba(20,14,6,.8)');
    gfx.line(0, 16, W, 16, C.woodD, 1);
    txt(label, 6, 4, 8, C.cream);
    if (right) txt(right, W - 6, 4, 8, C.gold, 'right');
  }
  var parts = [];
  function burst(x, y, col, n) { for (var i = 0; i < (n || 8); i++) parts.push({ x: x, y: y, vx: U.rand(-2, 2), vy: U.rand(-3, 1), life: U.rand(0.3, 0.8), col: col }); }
  function flash(col, t) { flashObj = { col: col, t: t, max: t }; }
  var flashObj = null;
  function updateParts(dt) {
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= dt;
      if (p.life <= 0) parts.splice(i, 1);
    }
    if (flashObj) { flashObj.t -= dt; if (flashObj.t <= 0) flashObj = null; }
  }
  function drawParts() { for (var i = 0; i < parts.length; i++) gfx.rect(parts[i].x, parts[i].y, 2, 2, parts[i].col); }

  /* ─── Backdrop (reused Alpine sky/hills, minus the chapter-select variant) ─ */
  function scenery(t) {
    var sky = ctx.createLinearGradient(0, 0, 0, H * 0.42);
    sky.addColorStop(0, C.sky1); sky.addColorStop(1, C.sky2);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    drawMtn(ctx, -10, 102, 140, 98, C.mtn);
    drawMtn(ctx, 120, 82, 160, 118, '#9ab0c0');
    drawMtn(ctx, 10, 102, 44, 20, C.snow);
    drawMtn(ctx, 148, 82, 44, 20, C.snow);
    ctx.fillStyle = C.grassD; ctx.beginPath(); ctx.moveTo(0, H);
    for (var hx = 0; hx <= W; hx += 5) ctx.lineTo(hx, H * 0.48 + Math.sin(hx * 0.03) * 14);
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.grass; ctx.fillRect(0, H * 0.52, W, H);
    for (var fj = 0; fj < 7; fj++) drawFlower(gfx, 20 + fj * 36, H * 0.54, fj % 2 === 0 ? C.flwr : C.gold);
  }
  function nightTint(seasonIdx) {
    if (seasonIdx === 3) { ctx.fillStyle = 'rgba(10,18,40,.55)'; ctx.fillRect(0, 0, W, H); }
    else { ctx.fillStyle = 'rgba(10,30,10,.30)'; ctx.fillRect(0, 0, W, H); }
  }

  /* ─── Year state ──────────────────────────────────────────────────────── */
  var SEASONS = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];
  var SEASON_LINE = [
    'Snowmelt swells the streams; the first flowers push through.',
    'Long golden days — the herds range high on the sunlit Alm.',
    'The herds come down; the hut must be readied for the cold.',
    'The wind howls around the hut. Every stored crumb matters now.',
  ];
  var ACTIONS_PER_DAY = 3;
  var STATS = { food: 55, health: 55, bond: 55 };
  var edelweissTotal = 0;
  var day = 0;          // index into SEASONS
  var actionsLeft = ACTIONS_PER_DAY;
  var lastResult = null;   // { label, deltas }
  var lastNight = null;    // { lines, deltas }
  var over = false;

  var ACTIONS = [
    { key: 'herd', label: 'HERD GOATS', hint: 'FOOD + BOND', icon: iconHerd },
    { key: 'forage', label: 'FORAGE MEADOW', hint: 'FOOD + HEALTH', icon: iconForage },
    { key: 'tend', label: 'TEND HEARTH', hint: 'BOND + HEALTH', icon: iconTend },
    { key: 'rest', label: 'REST', hint: 'HEALTH', icon: iconRest },
  ];
  function iconHerd(x, y) { gfx.circle(x, y, 6, C.goat); gfx.rect(x - 3, y - 10, 2, 5, C.goatD); gfx.rect(x + 1, y - 10, 2, 5, C.goatD); }
  function iconForage(x, y) { drawFlower(gfx, x, y, C.flwr); }
  function iconTend(x, y) {
    gfx.rect(x - 8, y - 2, 16, 8, '#5a3a1a'); ctx.strokeStyle = C.goldD; ctx.lineWidth = 1; ctx.strokeRect(x - 8, y - 2, 16, 8);
    ctx.fillStyle = C.fire; ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x - 4, y - 3); ctx.lineTo(x + 4, y - 3); ctx.closePath(); ctx.fill();
  }
  function iconRest(x, y) { txtC('z', x - 5, y - 8, 9, C.bond); txtC('z', x + 3, y - 2, 6, C.bond); }

  var TILES = [
    { x: 14, y: 150, w: 118, h: 100 },
    { x: 142, y: 150, w: 118, h: 100 },
    { x: 14, y: 260, w: 118, h: 100 },
    { x: 142, y: 260, w: 118, h: 100 },
  ];
  var chooseSel = 0;

  function checkGameOver() {
    if (STATS.health <= 0 && !over) { over = true; setScene('over'); return true; }
    return false;
  }

  /* ─── Chore rewards (shared by real play AND the headless test hook) ────── */
  function applyReward(key, quality, count) {
    quality = clamp(quality, 0, 1);
    var d = { food: 0, health: 0, bond: 0 };
    if (key === 'herd') { d.food = 6 + 12 * quality; d.bond = 2 + 2 * quality; }
    else if (key === 'forage') { d.food = 4 + 10 * quality; d.health = 2 + 8 * quality; edelweissTotal += (count || 0); }
    else if (key === 'tend') { d.bond = 6 + 10 * quality; d.health = 2 + 6 * quality; }
    else if (key === 'rest') { d.health = 14; }
    STATS.food = clamp(STATS.food + d.food, 0, 100);
    STATS.health = clamp(STATS.health + d.health, 0, 100);
    STATS.bond = clamp(STATS.bond + d.bond, 0, 100);
    return d;
  }

  function fmtDelta(d) {
    var out = [];
    if (Math.round(d.food)) out.push((d.food > 0 ? '+' : '') + Math.round(d.food) + ' FOOD');
    if (Math.round(d.health)) out.push((d.health > 0 ? '+' : '') + Math.round(d.health) + ' HEALTH');
    if (Math.round(d.bond)) out.push((d.bond > 0 ? '+' : '') + Math.round(d.bond) + ' BOND');
    return out;
  }

  function endAction(key, quality, label, count) {
    var d = applyReward(key, quality, count);
    lastResult = { key: key, label: label, deltas: fmtDelta(d) };
    actionsLeft--;
    audio.sfx(quality > 0.5 || key === 'rest' ? 'win' : 'blip');
    mini = null;
    if (!checkGameOver()) setScene('result');
  }

  /* ─── Mini 1 — HERD GOATS: tap wandering goats back to the flock ───────── */
  function makeHerdMini() {
    var TIME = 9, t = 0, goats = [], spawnT = 0.4, spawnDelay = 1.0, caught = 0, escaped = 0;
    return {
      update: function (dt) {
        t += dt; spawnT -= dt;
        if (spawnT <= 0 && goats.length < 6) {
          var side = Math.random() < 0.5 ? 0 : 1;
          var gy = H * 0.42 + Math.random() * H * 0.28;
          var spd = 50 + Math.random() * 26;
          goats.push({ x: side === 0 ? -14 : W + 14, y: gy, vx: side === 0 ? spd : -spd, tapped: false, fade: 0 });
          spawnT = spawnDelay; spawnDelay = Math.max(0.55, spawnDelay - 0.05);
        }
        for (var i = goats.length - 1; i >= 0; i--) {
          var gd = goats[i];
          if (gd.tapped) { gd.fade -= dt; if (gd.fade <= 0) { goats.splice(i, 1); caught++; } continue; }
          gd.x += gd.vx * dt;
          if (gd.x < -32 || gd.x > W + 32) { goats.splice(i, 1); escaped++; }
        }
        if (ptr.justDown) {
          for (var j = 0; j < goats.length; j++) {
            var g2 = goats[j];
            if (!g2.tapped && Math.abs(ptr.x - g2.x) < 30 && Math.abs(ptr.y - g2.y) < 26) {
              g2.tapped = true; g2.fade = 0.5; burst(g2.x, g2.y, C.flwr, 8); audio.sfx('blip'); break;
            }
          }
        }
        if (t >= TIME) endAction('herd', clamp(caught / 8, 0, 1), caught + ' goats herded home');
      },
      draw: function () {
        scenery(engine.time);
        for (var fi = 0; fi <= 7; fi++) { gfx.rect(fi * 36, H * 0.76, 4, 18, C.woodD); if (fi < 7) gfx.rect(fi * 36 + 4, H * 0.79, 32, 4, C.wood); }
        topBar('HERD GOATS', Math.max(0, Math.ceil(TIME - t)) + 's');
        for (var gi = 0; gi < goats.length; gi++) {
          var gd = goats[gi], fl = gd.tapped && Math.sin(engine.time * 28) > 0;
          if (!fl) {
            drawGoat(gfx, gd.x, gd.y, engine.time);
            if (!gd.tapped) { ctx.globalAlpha = 0.4 + 0.28 * Math.sin(engine.time * 3.5); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gd.x, gd.y, 24, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
          }
        }
        txtC('HERDED ' + caught, W / 2, H - 26, 8, C.gold);
        vignette();
      },
    };
  }

  /* ─── Mini 2 — FORAGE MEADOW: catch herbs & edelweiss, dodge nettles ───── */
  function makeForageMini() {
    var TIME = 9, t = 0, catcher = W / 2, items = [], spawnT = 0.5, spawnDelay = 0.85, good = 0, bad = 0;
    return {
      update: function (dt) {
        t += dt;
        var spd = 160;
        if (input.down('left')) catcher -= spd * dt;
        if (input.down('right')) catcher += spd * dt;
        if (ptr.down) catcher = ptr.x;
        catcher = clamp(catcher, 26, W - 26);
        spawnT -= dt;
        if (spawnT <= 0) {
          var isGood = Math.random() < 0.68;
          items.push({ x: 22 + Math.random() * (W - 44), y: -18, spd: 72 + Math.random() * 40, good: isGood, type: isGood ? Math.floor(Math.random() * 2) : 0 });
          spawnT = spawnDelay; spawnDelay = Math.max(0.48, spawnDelay - 0.03);
        }
        var catchY = H - 70;
        for (var i = items.length - 1; i >= 0; i--) {
          var it = items[i]; it.y += it.spd * dt;
          if (it.y > catchY - 12 && it.y < catchY + 16 && Math.abs(it.x - catcher) < 30) {
            items.splice(i, 1);
            if (it.good) { good++; burst(it.x, catchY, C.gold, 8); audio.sfx('coin'); }
            else { bad++; flash('#884400', 0.2); audio.sfx('hurt'); }
            continue;
          }
          if (it.y > H + 14) items.splice(i, 1);
        }
        if (t >= TIME) endAction('forage', clamp((good - bad * 1.5) / 8, 0, 1), good + ' gathered', good);
      },
      draw: function () {
        scenery(engine.time);
        topBar('FORAGE MEADOW', Math.max(0, Math.ceil(TIME - t)) + 's');
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          if (it.good) { if (it.type === 0) drawFlower(gfx, it.x, it.y, C.edelw); else drawFlower(gfx, it.x, it.y, C.flwr); }
          else { ctx.globalAlpha = 0.85; gfx.circle(it.x, it.y, 9, C.grassD); txtC('✗', it.x, it.y, 7, '#ccc'); ctx.globalAlpha = 1; }
        }
        var cy = H - 62;
        gfx.rect(catcher - 22, cy - 3, 44, 8, C.apron);
        gfx.circle(catcher, cy + 14, 11, C.heidi);
        gfx.rect(catcher - 9, cy + 18, 4, 11, C.goldD);
        gfx.rect(catcher + 5, cy + 18, 4, 11, C.goldD);
        txtC('GOOD ' + good + '  BAD ' + bad, W / 2, H - 26, 8, C.gold);
        vignette();
      },
    };
  }

  /* ─── Mini 3 — TEND HEARTH: stir the pot in rhythm with the fire (new) ──── */
  function makeTendMini() {
    var ROUNDS = 5, round = 0, hits = 0, ringSpd = 74, targetR = 13, hitCD = 0;
    var phase = 'wait', phaseT = 0, ringR = W * 0.30;
    var cx = W / 2, cy = H * 0.42;
    function newRound() { ringR = W * 0.30; }
    return {
      update: function (dt) {
        phaseT += dt; hitCD = Math.max(0, hitCD - dt);
        if (phase === 'step' && phaseT > 0.35) { phase = 'wait'; phaseT = 0; }
        if (phase === 'wobble' && phaseT > 0.4) { phase = 'wait'; phaseT = 0; newRound(); }
        if (phase === 'wait') {
          ringR -= ringSpd * dt;
          if (ringR <= 0) {
            round++; phase = 'wobble'; phaseT = 0; audio.sfx('hurt');
            if (round >= ROUNDS) return endAction('tend', clamp(hits / ROUNDS, 0, 1), hits + '/' + ROUNDS + ' beats kept');
          }
        }
        var tapped = (ptr.justDown || input.pressed('a')) && phase === 'wait' && hitCD <= 0;
        if (tapped) {
          if (ringR <= targetR * 3.0) {
            hits++; round++; ringSpd = Math.min(74 + round * 8, 130);
            burst(cx, cy, C.fire, 10); audio.sfx('power'); phase = 'step'; phaseT = 0; hitCD = 0.3;
          } else {
            round++; phase = 'wobble'; phaseT = 0; audio.sfx('blip');
          }
          if (round >= ROUNDS) return endAction('tend', clamp(hits / ROUNDS, 0, 1), hits + '/' + ROUNDS + ' beats kept');
        }
      },
      draw: function () {
        scenery(engine.time);
        panel(cx - 60, cy - 60, 120, 120, 'rgba(20,10,4,.35)', C.woodD);
        ctx.strokeStyle = C.goldD; ctx.lineWidth = 2; ctx.globalAlpha = 0.3;
        ctx.beginPath(); ctx.arc(cx, cy, W * 0.30, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        var pulse = 0.85 + 0.15 * Math.sin(engine.time * 8);
        ctx.strokeStyle = C.fire; ctx.lineWidth = 3 * pulse; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(cx, cy, targetR, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        var close = ringR < targetR * 3.2;
        ctx.strokeStyle = close ? C.fire : C.goldD;
        ctx.lineWidth = 4 * (0.85 + 0.15 * Math.sin(engine.time * 14));
        ctx.globalAlpha = close ? 1 : 0.75;
        ctx.beginPath(); ctx.arc(cx, cy, Math.max(2, ringR), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        gfx.rect(cx - 14, cy + 20, 28, 10, '#5a3a1a');
        drawHeidi(gfx, ctx, cx, cy + 44, engine.time, false);
        topBar('TEND HEARTH', hits + '/' + ROUNDS);
        vignette();
      },
    };
  }

  /* ─── Finale mini — CLARA WALKS: same timing-ring, no hard fail ────────── */
  function makeClaraMini() {
    var GOAL = 6, steps = 0, misses = 0, ringSpd = 48, targetR = 14, hitCD = 0;
    var phase = 'wait', phaseT = 0, ringR = W * 0.42;
    var cx = W / 2, cy = H - 128;
    return {
      steps: function () { return steps; },
      misses: function () { return misses; },
      done: function () { return steps >= GOAL; },
      forceWin: function () { steps = GOAL; },  // test-only fast-forward (see __heidiTest.finishClara)
      update: function (dt) {
        if (steps >= GOAL) return;
        phaseT += dt; hitCD = Math.max(0, hitCD - dt);
        if (phase === 'step' && phaseT > 0.55) { phase = 'wait'; phaseT = 0; }
        if (phase === 'wobble' && phaseT > 0.7) { phase = 'wait'; phaseT = 0; ringR = W * 0.42; }
        if (phase === 'wait') {
          ringR -= ringSpd * dt;
          if (ringR <= 0) { misses++; flash('#cc2211', 0.3); audio.sfx('hurt'); phase = 'wobble'; phaseT = 0; }
        }
        var tapped = (ptr.justDown || input.pressed('a')) && phase === 'wait' && hitCD <= 0;
        if (tapped) {
          if (ringR <= targetR * 3.0) {
            steps++; ringR = W * 0.42; ringSpd = Math.min(48 + steps * 10, 120);
            burst(cx, cy, C.flwr2, 10); audio.sfx('power'); phase = 'step'; phaseT = 0; hitCD = 0.38;
          } else { misses++; flash('#884400', 0.22); audio.sfx('blip'); phase = 'wobble'; phaseT = 0; }
        }
      },
      draw: function () {
        scenery(engine.time);
        var fxs = [18, 48, 78, 108, 142, 172, 204, 236, 260];
        for (var i = 0; i < fxs.length; i++) drawFlower(gfx, fxs[i], H * 0.57 + Math.sin(i * 1.4) * 7, i % 2 === 0 ? C.flwr : C.gold);
        ctx.strokeStyle = C.goldD; ctx.lineWidth = 2; ctx.globalAlpha = 0.3;
        ctx.beginPath(); ctx.arc(cx, cy, W * 0.42, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        var tPulse = 0.85 + 0.15 * Math.sin(engine.time * 8);
        ctx.strokeStyle = C.flwr; ctx.lineWidth = 3 * tPulse; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(cx, cy, targetR, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        var ringClose = ringR < targetR * 3.2;
        ctx.strokeStyle = ringClose ? C.flwr : C.gold;
        ctx.lineWidth = 4 * (0.85 + 0.15 * Math.sin(engine.time * 14));
        ctx.globalAlpha = ringClose ? 1.0 : 0.75;
        ctx.beginPath(); ctx.arc(cx, cy, Math.max(2, ringR), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        var wobble = phase === 'wobble' ? Math.sin(phaseT * 28) * 5 : 0;
        drawClara(gfx, ctx, cx + wobble, cy, steps);
        drawHeidi(gfx, ctx, cx - 56, cy + 8, engine.time, false);
        for (var si = 0; si < GOAL; si++) { var sx = W / 2 - (GOAL * 14) / 2 + si * 14 + 7; gfx.circle(sx, H - 14, 5, si < steps ? C.flwr : '#446644'); }
        topBar('CLARA WALKS', steps + '/' + GOAL + ' steps');
        vignette();
      },
    };
  }

  /* ─── Night resolution — the season's real stakes ────────────────────── */
  function resolveNight() {
    var s = day, d = { food: 0, health: 0, bond: 0 }, note;
    if (s === 0) { d.food = -10; note = 'A quiet spring night by the fire.'; if (STATS.food + d.food < 0) { d.health = -8; note = 'Too little put by — a hungry spring night.'; } }
    else if (s === 1) { d.food = -8; note = 'Warm, easy summer nights on the Alm.'; if (STATS.health < 50) { d.health = 6; note = 'The sun has done Heidi good.'; } }
    else if (s === 2) {
      d.food = -8;
      if (STATS.food - 8 >= 40) { d.food = 4; note = 'A good harvest, safely stored for winter.'; }
      else { d.health = -6; note = 'Thin stores worry Grandfather as the cold nears.'; }
    } else {
      d.food = -18; note = 'The storm howls through the night.';
      var food2 = STATS.food + d.food;
      if (food2 < 0) { d.health = -20; note = 'The larder runs bare — a harsh, hungry winter night.'; }
      if (STATS.bond < 40) { d.health += -6; note += ' Grandfather is too distant to help through it.'; }
    }
    STATS.food = clamp(STATS.food + d.food, 0, 100);
    STATS.health = clamp(STATS.health + d.health, 0, 100);
    STATS.bond = clamp(STATS.bond + d.bond, 0, 100);
    lastNight = { note: note, deltas: fmtDelta(d), season: SEASONS[s] };
    if (checkGameOver()) return;
    setScene('night');
  }

  /* ─── Scene machine ──────────────────────────────────────────────────── */
  var scene = 'boot', sceneT = 0, mini = null, claraMini = null;
  function setScene(s) { scene = s; sceneT = 0; parts = []; if (s === 'choose') chooseSel = 0; }

  function startAction(key) {
    if (key === 'rest') { endAction('rest', 1, 'Heidi naps in the warm sun.'); return; }
    if (key === 'herd') mini = makeHerdMini();
    else if (key === 'forage') mini = makeForageMini();
    else if (key === 'tend') mini = makeTendMini();
    setScene('play');
  }

  function beginYear() {
    STATS.food = 55; STATS.health = 55; STATS.bond = 55;
    edelweissTotal = 0; day = 0; actionsLeft = ACTIONS_PER_DAY; over = false;
    setScene('daybrief');
  }

  function update(dt) {
    sceneT += dt; updateParts(dt);
    if (scene === 'boot') {
      if (confirmPressed()) beginYear();
    } else if (scene === 'daybrief') {
      if (confirmPressed() && sceneT > 0.3) setScene('choose');
    } else if (scene === 'choose') {
      if (input.pressed('left') || input.pressed('right')) chooseSel ^= 1;
      if (input.pressed('up')) chooseSel = (chooseSel + 2) % 4;
      if (input.pressed('down')) chooseSel = (chooseSel + 2) % 4;
      if (input.pressed('a') || input.pressed('start')) startAction(ACTIONS[chooseSel].key);
      if (ptr.justDown) {
        for (var i = 0; i < TILES.length; i++) {
          var r = TILES[i];
          if (ptr.x >= r.x && ptr.x <= r.x + r.w && ptr.y >= r.y && ptr.y <= r.y + r.h) { chooseSel = i; startAction(ACTIONS[i].key); break; }
        }
      }
    } else if (scene === 'play') {
      if (mini) mini.update(dt);
    } else if (scene === 'result') {
      if (confirmPressed() && sceneT > 0.35) {
        if (actionsLeft > 0) setScene('choose'); else resolveNight();
      }
    } else if (scene === 'night') {
      if (confirmPressed() && sceneT > 0.4) {
        day++;
        if (day >= SEASONS.length) { claraMini = makeClaraMini(); setScene('finale'); }
        else { actionsLeft = ACTIONS_PER_DAY; setScene('daybrief'); }
      }
    } else if (scene === 'finale') {
      if (claraMini && !claraMini.done()) claraMini.update(dt);
      else if (confirmPressed() && sceneT > 0.6) setScene('epilogue');
    } else if (scene === 'epilogue') {
      if (confirmPressed() && sceneT > 0.5) beginYear();
    } else if (scene === 'over') {
      if (confirmPressed() && sceneT > 0.5) beginYear();
    }
    ptr.justDown = false;
    window.__heidiScene = scene;
  }

  /* ─── Rendering ───────────────────────────────────────────────────────── */
  function meterRow(label, val, col, y) {
    txt(label, 14, y, 7, C.cream);
    gfx.rect(90, y + 1, 150, 8, 'rgba(0,0,0,.4)');
    gfx.rect(90, y + 1, Math.round(150 * clamp(val, 0, 100) / 100), 8, col);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(90.5, y + 1.5, 149, 7);
    txt(Math.round(val), 244, y, 7, C.cream);
  }

  function drawBoot() {
    scenery(engine.time);
    ctx.fillStyle = 'rgba(10,30,10,.30)'; ctx.fillRect(0, 0, W, H);
    drawEmblem(gfx, W / 2, H * 0.28);
    txtC('HEIDI', W / 2, H * 0.42, 22, C.gold);
    txtC('A YEAR ON THE ALM', W / 2, H * 0.42 + 30, 9, C.cream);
    if (Math.floor(sceneT * 1.5) % 2 === 0) txtC('TAP TO BEGIN', W / 2, H * 0.62, 12, C.cream);
    txtC('HEIDI · JOHANNA SPYRI, 1881', W / 2, H - 40, 7, '#c8e0c8');
    txtC('FOUR SEASONS · ONE ALM', W / 2, H - 26, 7, '#c8e0c8');
    vignette();
  }

  function drawDaybrief() {
    scenery(engine.time);
    ctx.fillStyle = 'rgba(10,30,10,.62)'; ctx.fillRect(0, 0, W, H);
    txtC(SEASONS[day], W / 2, H * 0.32, 16, C.gold);
    txtC('DAY ' + (day + 1) + ' OF 4', W / 2, H * 0.32 + 24, 8, C.cream);
    lines(wrapFit(SEASON_LINE[day], 9, W - 24).concat(['', 'Three chores to spend today.']), W / 2, H * 0.48, 9, C.cream, 16);
    if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.3) txtC('TAP TO BEGIN THE DAY', W / 2, H * 0.72, 10, C.gold);
    vignette();
  }

  function drawChoose() {
    scenery(engine.time);
    panel(8, 8, W - 16, 96, 'rgba(20,14,6,.82)');
    txtC(SEASONS[day] + ' · DAY ' + (day + 1) + '/4', W / 2, 16, 8, C.gold);
    meterRow('FOOD', STATS.food, C.food, 32);
    meterRow('HEALTH', STATS.health, C.health, 48);
    meterRow('BOND', STATS.bond, C.bond, 64);
    txtC(actionsLeft + ' CHORE' + (actionsLeft === 1 ? '' : 'S') + ' LEFT TODAY', W / 2, 84, 7, C.cream);
    for (var i = 0; i < TILES.length; i++) {
      var r = TILES[i], a = ACTIONS[i], sel = i === chooseSel;
      panel(r.x, r.y, r.w, r.h, sel ? 'rgba(60,44,16,.92)' : 'rgba(20,14,6,.85)', sel ? C.gold : C.woodD);
      a.icon(r.x + r.w / 2, r.y + 30);
      txtC(a.label, r.x + r.w / 2, r.y + 52, 7, C.cream);
      txtC(a.hint, r.x + r.w / 2, r.y + 68, 6, C.gold);
    }
    txtC('TAP A CHORE', W / 2, H - 18, 8, C.cream);
    vignette();
  }

  function drawPlay() { if (mini) mini.draw(); drawParts(); }

  function drawResult() {
    if (mini) { ctx.globalAlpha = 0.5; try { mini.draw(); } catch (e) {} ctx.globalAlpha = 1; }
    else { scenery(engine.time); }
    ctx.fillStyle = 'rgba(10,30,10,.78)'; ctx.fillRect(0, 0, W, H);
    var labelLines = lastResult ? wrapFit(lastResult.label, 11, W - 24) : [];
    lines(labelLines, W / 2, H * 0.36, 11, C.gold, 18);
    var dy = H * 0.36 + labelLines.length * 18 + 8;
    if (lastResult) for (var i = 0; i < lastResult.deltas.length; i++) { txtC(lastResult.deltas[i], W / 2, dy, 9, C.cream); dy += 16; }
    if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.35) txtC(actionsLeft > 0 ? 'TAP TO CONTINUE' : 'TAP FOR NIGHTFALL', W / 2, H * 0.62, 10, C.gold);
    vignette();
  }

  function drawNight() {
    scenery(engine.time); nightTint(day);
    txtC(lastNight ? lastNight.season + ' NIGHT' : 'NIGHT FALLS', W / 2, H * 0.36, 13, C.gold);
    if (lastNight) {
      var noteLines = wrapFit(lastNight.note, 9, W - 24);
      lines(noteLines, W / 2, H * 0.36 + 30, 9, C.cream, 16);
      var dy = H * 0.36 + 30 + noteLines.length * 16 + 14;
      for (var i = 0; i < lastNight.deltas.length; i++) { txtC(lastNight.deltas[i], W / 2, dy, 9, '#ffd080'); dy += 16; }
    }
    if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.4) txtC('TAP FOR THE NEXT DAY', W / 2, H * 0.68, 10, C.gold);
    vignette();
  }

  function drawFinale() {
    if (claraMini) claraMini.draw();
    drawParts();
    if (claraMini && claraMini.done()) {
      ctx.fillStyle = 'rgba(10,30,10,.45)'; ctx.fillRect(0, 0, W, H);
      if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.6) txtC('TAP TO CONTINUE', W / 2, H * 0.16, 10, C.gold);
    }
  }

  function drawEpilogue() {
    scenery(engine.time);
    ctx.fillStyle = 'rgba(10,30,10,.72)'; ctx.fillRect(0, 0, W, H);
    drawEmblem(gfx, W / 2, H * 0.24);
    var warmth = STATS.health + STATS.bond;
    var head, body;
    if (warmth >= 150) { head = 'THE MOUNTAIN SMILES'; body = ['Clara stands tall in the sunlight.', 'The Alm has never felt so alive —', 'a full flock, a warm hearth,', 'and a home Grandfather never', 'thought he\'d have again.']; }
    else if (warmth >= 90) { head = 'CLARA WALKS'; body = ['Clara takes her first steps,', 'laughing, into Heidi\'s arms.', 'It was a hard year on the Alm,', 'but a good one.']; }
    else { head = 'A QUIET MIRACLE'; body = ['Clara walks — slowly, carefully —', 'a small triumph after a lean year.', 'Heidi promises next spring', 'will be easier.']; }
    txtC(head, W / 2, H * 0.38, 13, C.gold);
    lines(body.flatMap(function (l) { return wrapFit(l, 9, W - 24); }), W / 2, H * 0.38 + 26, 9, C.cream, 16);
    var score = Math.round(edelweissTotal * 10 + STATS.food + STATS.health + STATS.bond);
    var isHigh = Retro.Store.setHigh('heidi', score);
    txtC('YEAR SCORE ' + score + (isHigh ? '  ★ NEW BEST' : ''), W / 2, H * 0.72, 9, C.gold);
    if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.5) txtC('TAP FOR A NEW YEAR', W / 2, H * 0.82, 9, C.cream);
    vignette();
  }

  function drawOver() {
    scenery(engine.time); ctx.fillStyle = 'rgba(30,10,10,.68)'; ctx.fillRect(0, 0, W, H);
    txtC('TOO WEAK FOR THE ALM', W / 2, H * 0.4, 12, C.red);
    lines(['Heidi grows too weak for the', 'mountain air. Grandfather carries', 'her inside to rest and try again', 'next spring.'], W / 2, H * 0.4 + 28, 9, C.cream, 16);
    if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.5) txtC('TAP TO TRY AGAIN', W / 2, H * 0.7, 10, C.gold);
    vignette();
  }

  function draw() {
    ctx.save();
    if (scene === 'boot') drawBoot();
    else if (scene === 'daybrief') drawDaybrief();
    else if (scene === 'choose') drawChoose();
    else if (scene === 'play') drawPlay();
    else if (scene === 'result') drawResult();
    else if (scene === 'night') drawNight();
    else if (scene === 'finale') drawFinale();
    else if (scene === 'epilogue') drawEpilogue();
    else if (scene === 'over') drawOver();
    ctx.restore();
    if (flashObj) { ctx.globalAlpha = Math.max(0, flashObj.t / flashObj.max) * 0.8; gfx.clear(flashObj.col); ctx.globalAlpha = 1; }
  }

  /* Headless test surface (tools/test-heidi.mjs) — fast-forwards the year
     without waiting out each chore's real-time play. Harmless in normal play. */
  window.__heidiTest = {
    scene: function () { return scene; },
    day: function () { return day; },
    actionsLeft: function () { return actionsLeft; },
    stats: function () { return { food: STATS.food, health: STATS.health, bond: STATS.bond }; },
    setStats: function (f, h, b) { STATS.food = f; STATS.health = h; STATS.bond = b; },
    begin: function () { beginYear(); },
    doAction: function (key, quality, count) { mini = null; setScene('play'); endAction(key, quality == null ? 1 : quality, key + ' (test)', count); },
    forceNight: function () { resolveNight(); },
    forceFinale: function () { claraMini = makeClaraMini(); setScene('finale'); },
    finishClara: function () { if (claraMini) claraMini.forceWin(); },
  };

  /* ─── Bar buttons (mute/restart — fullscreen auto-wires in retro-engine.js) */
  var muteBtn = document.getElementById('muteBtn');
  if (muteBtn) muteBtn.addEventListener('click', function () { muteBtn.classList.toggle('is-muted', audio.toggleMute()); });
  var restartBtn = document.getElementById('restartBtn');
  if (restartBtn) restartBtn.addEventListener('click', function () { beginYear(); });

  engine.run(update, draw);
})();
