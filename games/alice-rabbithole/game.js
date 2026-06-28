/* ============================================================================
 * DOWN THE RABBIT HOLE — an endless falling dodge game
 * Genre: Endless Faller.  Built on RetroEngine.
 *
 * Alice falls forever down the rabbit hole, drifting past furniture, clocks and
 * the Queen's playing-card guards. Steer through the gaps in each shelf. Sip
 * DRINK ME to shrink through tight spaces; eat EAT ME to grow huge and smash
 * straight through. Collect keys. The deeper you fall, the faster it gets.
 * ============================================================================ */
(function () {
  'use strict';
  const { clamp, rand, randInt, choice } = Retro.util;

  const W = 220, H = 260;
  const engine = new Retro.Engine({
    width: W, height: H, parent: '#game', touch: 'horizontal', showB: false, buttonLabels: { a: '·' },
  });
  const g = engine.gfx, input = engine.input, audio = engine.audio;
  const GAME = 'alice-rabbithole';

  let alice, items, walls, depth, fallSpeed, state, lives, sizeState, sizeT, spawnTimer, msg, msgT, bgItems, started, flash;

  const SIZES = { normal: { w: 16, h: 18, label: '' }, small: { w: 9, h: 11, label: 'TINY' }, big: { w: 26, h: 30, label: 'HUGE' } };

  function reset() {
    alice = { x: W / 2, vx: 0 };
    items = []; walls = []; bgItems = [];
    depth = 0; fallSpeed = 1.4; state = 'play'; lives = 3;
    sizeState = 'normal'; sizeT = 0; spawnTimer = 0; msg = ''; msgT = 0; started = false; flash = 0;
    for (let i = 0; i < 8; i++) bgItems.push({ x: rand(0, W), y: rand(0, H), kind: choice(['clock', 'cup', 'card', 'book']), spin: rand(0, 6.28) });
  }

  function sz() { return SIZES[sizeState]; }

  function spawnWall(y) {
    // a shelf spanning the width with a gap; gap width scales with difficulty
    const gapW = clamp(64 - Math.floor(depth / 120) * 3, 34, 64);
    const gapX = randInt(10, W - gapW - 10);
    const fragile = Math.random() < 0.25; // can be smashed only when big
    walls.push({ y, gapX, gapW, fragile, hit: false, passed: false });
  }
  function spawnItem(y) {
    const r = Math.random();
    let kind;
    if (r < 0.34) kind = 'key';
    else if (r < 0.6) kind = 'drink';
    else if (r < 0.78) kind = 'cake';
    else kind = 'hazard'; // pocket-watch / card guard
    items.push({ x: rand(20, W - 20), y, kind, t: 0, got: false, vx: kind === 'hazard' ? rand(-0.6, 0.6) : 0 });
  }

  function update(dt) {
    if (state === 'over') { if (input.anyPressed()) reset(); return; }

    // input (steer)
    if (input.down('left')) { alice.vx -= 0.7; started = true; }
    if (input.down('right')) { alice.vx += 0.7; started = true; }
    if (!input.down('left') && !input.down('right')) alice.vx *= 0.84;
    alice.vx = clamp(alice.vx, -3.4, 3.4);
    alice.x = clamp(alice.x + alice.vx, sz().w / 2, W - sz().w / 2);

    if (!started) return;

    // difficulty ramp
    fallSpeed = clamp(1.4 + depth / 900, 1.4, 4.2);
    depth += fallSpeed * 0.6;

    // size timer
    if (sizeState !== 'normal') { sizeT -= dt; if (sizeT <= 0) { sizeState = 'normal'; msgShow('back to normal'); } }

    // spawn
    spawnTimer -= fallSpeed;
    if (spawnTimer <= 0) {
      spawnTimer = randInt(54, 78);
      spawnWall(H + 10);
      if (Math.random() < 0.8) spawnItem(H + randInt(30, 70));
    }

    // move bg
    for (const b of bgItems) { b.y -= fallSpeed * 0.5; b.spin += 0.02; if (b.y < -10) { b.y = H + 10; b.x = rand(0, W); } }

    const aliceBox = { x: alice.x - sz().w / 2, y: aliceY() - sz().h / 2, w: sz().w, h: sz().h };

    // walls
    for (const wl of walls) {
      wl.y -= fallSpeed;
      if (!wl.passed && wl.y < aliceY() - 6) { wl.passed = true; depth += 8; }
      if (wl.hit) continue;
      // collision: alice overlaps the wall band but not within gap
      if (aliceY() + sz().h / 2 > wl.y && aliceY() - sz().h / 2 < wl.y + 8) {
        const inGap = aliceBox.x > wl.gapX && aliceBox.x + aliceBox.w < wl.gapX + wl.gapW;
        if (!inGap) {
          if (sizeState === 'big' && wl.fragile) { wl.hit = true; audio.sfx('explode'); spark(alice.x, wl.y, '#ff2e97'); msgShow('SMASH!'); }
          else { hurt(); wl.hit = true; }
        }
      }
    }

    // items
    for (const it of items) {
      it.y -= fallSpeed; it.t += dt;
      if (it.kind === 'hazard') { it.x = clamp(it.x + it.vx, 10, W - 10); }
      if (it.got) continue;
      const ib = { x: it.x - 7, y: it.y - 7, w: 14, h: 14 };
      if (overlap(aliceBox, ib)) {
        if (it.kind === 'key') { it.got = true; depth += 30; audio.sfx('coin'); spark(it.x, it.y, '#ffe14d'); msgShow('+KEY'); }
        else if (it.kind === 'drink') { it.got = true; setSize('small'); audio.sfx('power'); msgShow('DRINK ME!'); }
        else if (it.kind === 'cake') { it.got = true; setSize('big'); audio.sfx('power'); msgShow('EAT ME!'); }
        else if (it.kind === 'hazard') { if (sizeState !== 'big') { hurt(); it.got = true; } else { it.got = true; spark(it.x, it.y, '#ff8a3d'); } }
      }
    }

    // cull
    walls = walls.filter((w) => w.y > -14);
    items = items.filter((i) => i.y > -14 && !i.got);

    if (msgT > 0) msgT -= dt;
    if (flash > 0) flash -= dt;
    sparkle.forEach((s) => { s.x += s.vx; s.y += s.vy; s.vy += 0.15; s.life -= dt; });
    sparkle = sparkle.filter((s) => s.life > 0);
  }

  function aliceY() { return H * 0.34; }
  function setSize(s) { sizeState = s; sizeT = 5.5; }
  function hurt() {
    lives--; flash = 0.4; audio.sfx('hurt'); alice.vx *= -1.2;
    if (lives <= 0) { state = 'over'; audio.sfx('lose'); Retro.Store.setHigh(GAME, score()); }
    else msgShow('OUCH! ' + lives + ' left');
  }
  function score() { return Math.floor(depth); }
  function msgShow(t) { msg = t; msgT = 1.0; }
  let sparkle = [];
  function spark(x, y, c) { for (let i = 0; i < 9; i++) sparkle.push({ x, y, vx: rand(-2.2, 2.2), vy: rand(-2.5, 1), life: rand(0.3, 0.7), c }); }
  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  /* ---------------------------- rendering ---------------------------- */
  function render() {
    const ctx = g.ctx;
    // tunnel gradient
    const grd = ctx.createRadialGradient(W / 2, aliceY(), 10, W / 2, aliceY(), 170);
    grd.addColorStop(0, '#2a1a4a');
    grd.addColorStop(0.6, '#160a30');
    grd.addColorStop(1, '#06010f');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    // swirling tunnel rings
    ctx.strokeStyle = 'rgba(123,92,255,.18)'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const r = ((depth * 0.6 + i * 40) % 240);
      ctx.beginPath(); ctx.arc(W / 2, aliceY(), r, 0, Math.PI * 2); ctx.stroke();
    }

    // background floating curios
    for (const b of bgItems) drawCurio(b.x, b.y, b.kind, b.spin, 0.4);

    // walls (shelves)
    for (const wl of walls) {
      if (wl.hit) continue;
      const col = wl.fragile ? '#8e5a3a' : '#5a3a6e';
      const top = wl.fragile ? '#ae7a4a' : '#7a5a8e';
      // left segment
      g.rect(0, wl.y, wl.gapX, 8, col); g.rect(0, wl.y, wl.gapX, 2, top);
      // right segment
      g.rect(wl.gapX + wl.gapW, wl.y, W - (wl.gapX + wl.gapW), 8, col);
      g.rect(wl.gapX + wl.gapW, wl.y, W - (wl.gapX + wl.gapW), 2, top);
      if (wl.fragile) { g.text('!', wl.gapX - 8, wl.y - 1, '#ffe14d', 8); }
    }

    // items
    for (const it of items) {
      if (it.got) continue;
      if (it.kind === 'key') { g.rect(it.x - 1, it.y - 5, 2, 8, '#ffe14d'); g.rect(it.x - 4, it.y + 1, 8, 2, '#ffe14d'); g.circle(it.x, it.y - 5, 3, '#ffe14d'); g.circle(it.x, it.y - 5, 1.5, '#160a30'); }
      else if (it.kind === 'drink') { g.rect(it.x - 4, it.y - 6, 8, 12, '#21e6ff'); g.rect(it.x - 2, it.y - 9, 4, 3, '#cfeeff'); g.textC('▾', it.x, it.y - 4, '#06010f', 7); }
      else if (it.kind === 'cake') { g.rect(it.x - 6, it.y - 4, 12, 8, '#ff2e97'); g.rect(it.x - 6, it.y - 6, 12, 3, '#ffd6ea'); g.textC('▴', it.x, it.y - 3, '#fff', 7); }
      else { drawCurio(it.x, it.y, 'card', it.t * 2, 1); }
    }

    // alice
    drawAlice(alice.x, aliceY());

    // sparkles
    for (const s of sparkle) g.rect(s.x, s.y, 2, 2, s.c);

    // HUD
    g.rect(0, 0, W, 18, 'rgba(11,4,32,.85)');
    g.text('DEPTH ' + score() + 'm', 5, 5, '#fff', 8);
    let hearts = ''; for (let i = 0; i < lives; i++) hearts += '♥';
    g.text(hearts, W - 8 - lives * 10, 5, '#ff2e97', 8);
    if (sizeState !== 'normal') g.textC(sz().label + '!', W / 2, 5, sizeState === 'small' ? '#21e6ff' : '#ff2e97', 8);

    if (flash > 0) { ctx.globalAlpha = flash; g.rect(0, 0, W, H, '#ff2e97'); ctx.globalAlpha = 1; }
    if (msgT > 0 && msg) g.textC(msg, W / 2, aliceY() - 34, '#fff', 8);

    if (!started) {
      ctx.globalAlpha = 0.8; g.rect(0, 0, W, H, '#06010f'); ctx.globalAlpha = 1;
      g.textC('DOWN THE', W / 2, 74, '#21e6ff', 13);
      g.textC('RABBIT HOLE', W / 2, 96, '#21e6ff', 13);
      g.textC('Steer into the gaps', W / 2, 140, '#9d92c7', 8);
      g.textC('▾ shrink   ▴ grow', W / 2, 158, '#9d92c7', 8);
      g.textC('◀ ▶ to begin', W / 2, 190, '#5dff8f', 8);
    }
    if (state === 'over') {
      ctx.globalAlpha = 0.84; g.rect(0, 0, W, H, '#06010f'); ctx.globalAlpha = 1;
      g.textC('CURIOUSER...', W / 2, 90, '#ff2e97', 12);
      g.textC('You fell ' + score() + 'm', W / 2, 124, '#fff', 9);
      g.textC('Best ' + Retro.Store.getHigh(GAME) + 'm', W / 2, 142, '#ffe14d', 8);
      g.textC('Press any key', W / 2, 176, '#9d92c7', 8);
    }
  }

  function drawAlice(x, y) {
    const s = sizeState === 'small' ? 1.4 : sizeState === 'big' ? 3 : 2;
    const blink = flash > 0 && engine.frame % 6 < 3;
    if (blink) return;
    // dress = blue, apron = white, hair = yellow; arms out as if falling
    g.sprite([
      '.yyyy.',
      'yyyyyy',
      '.ffff.',
      'b.bb.b',
      'bbbbbb',
      '.bwwb.',
      '.b..b.',
      '.l..l.',
    ], x - 3 * s, y - 4 * s, { y: '#ffe14d', f: '#f2d2a8', b: '#21a0ff', w: '#ffffff', l: '#1b3a5a' }, s);
  }

  function drawCurio(x, y, kind, spin, alpha) {
    g.ctx.globalAlpha = alpha;
    if (kind === 'clock') { g.circle(x, y, 6, '#caa15a'); g.circle(x, y, 4, '#160a30'); g.line(x, y, x + Math.cos(spin) * 3, y + Math.sin(spin) * 3, '#caa15a', 1); }
    else if (kind === 'cup') { g.rect(x - 4, y - 2, 8, 5, '#e8e0ff'); g.rect(x + 4, y - 1, 2, 3, '#e8e0ff'); }
    else if (kind === 'book') { g.rect(x - 5, y - 4, 10, 8, '#8e3a5a'); g.rect(x - 1, y - 4, 2, 8, '#ffd6ea'); }
    else { // card guard
      g.rect(x - 5, y - 7, 10, 14, '#f4f0ff'); g.rect(x - 5, y - 7, 10, 2, '#ff2e97');
      g.textC('♥', x, y - 5, '#ff2e97', 6);
    }
    g.ctx.globalAlpha = 1;
  }

  document.getElementById('muteBtn').addEventListener('click', function () { this.textContent = audio.toggleMute() ? '🔇' : '🔊'; });
  document.getElementById('restartBtn').addEventListener('click', reset);

  reset();
  engine.run(update, render);
})();
