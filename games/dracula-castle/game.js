/* ============================================================================
 * ESCAPE CASTLE DRACULA — a vertical climbing platformer
 * Genre: Platformer.  Built on RetroEngine.
 *
 * Jonathan Harker scales the Count's crumbling tower. Run and leap from ledge
 * to ledge as the camera climbs; the Count's shadow rises from below and never
 * stops. Dodge the bats, grab the garlic for safety, reach the dawn to escape.
 * ============================================================================ */
(function () {
  'use strict';
  const { clamp, rand, randInt } = Retro.util;

  const W = 240, H = 248;
  const engine = new Retro.Engine({
    width: W, height: H, parent: '#game', touch: 'horizontal', buttonLabels: { a: '⤒', b: '⤒' }, showB: false,
  });
  const g = engine.gfx, input = engine.input, audio = engine.audio;
  const GAME = 'dracula-castle';

  const GRAV = 0.5, MOVE = 0.7, MAXVX = 3.0, FRICT = 0.82, JUMP = -8.4;
  let player, platforms, bats, pickups, camY, maxClimb, shadowY, state, score, started, msg, msgT, sparkle;

  function makePlatform(x, y, w, type) { return { x, y, w, h: 6, type: type || 'stone', vx: type === 'move' ? (Math.random() < 0.5 ? -0.8 : 0.8) : 0, broke: false, t: 0 }; }

  function reset() {
    player = { x: W / 2 - 6, y: H - 60, w: 12, h: 14, vx: 0, vy: 0, onGround: false, face: 1, inv: 0 };
    platforms = [];
    bats = [];
    pickups = [];
    // base ground
    platforms.push({ x: 0, y: H - 30, w: W, h: 30, type: 'ground', vx: 0, broke: false, t: 0 });
    // seed a stack going up
    let y = H - 70;
    for (let i = 0; i < 14; i++) { addRow(y); y -= randInt(34, 48); }
    camY = 0; maxClimb = 0; shadowY = H + 40; score = 0; state = 'play'; started = false;
    msg = 'CLIMB!'; msgT = 1.4; sparkle = [];
    highestSpawnY = y;
  }

  let highestSpawnY = 0;
  function addRow(y) {
    const w = randInt(34, 64);
    const x = randInt(6, W - w - 6);
    let type = 'stone';
    const r = Math.random();
    if (r < 0.18) type = 'move'; else if (r < 0.34) type = 'crumble';
    platforms.push(makePlatform(x, y, w, type));
    // occasional pickup (garlic = invuln / cross = points)
    if (Math.random() < 0.28) {
      pickups.push({ x: x + w / 2 - 4, y: y - 14, w: 8, h: 10, kind: Math.random() < 0.5 ? 'garlic' : 'cross', t: 0, got: false });
    }
    // occasional bat above
    if (Math.random() < 0.5 && y < H - 120) {
      bats.push({ x: randInt(10, W - 20), y: y - randInt(8, 22), w: 12, h: 8, vx: rand(0.6, 1.6) * (Math.random() < 0.5 ? 1 : -1), phase: rand(0, 6.28), amp: rand(6, 16) });
    }
  }

  function update(dt) {
    if (state === 'over' || state === 'win') { if (input.anyPressed()) reset(); return; }

    // input
    if (input.down('left')) { player.vx -= MOVE; player.face = -1; started = true; }
    if (input.down('right')) { player.vx += MOVE; player.face = 1; started = true; }
    if (!input.down('left') && !input.down('right')) player.vx *= FRICT;
    player.vx = clamp(player.vx, -MAXVX, MAXVX);

    const jump = input.pressed('up') || input.pressed('a') || input.pressed('b');
    if (jump && player.onGround) { player.vy = JUMP; player.onGround = false; audio.sfx('jump'); started = true; }

    // physics
    player.vy += GRAV; player.vy = Math.min(player.vy, 9);
    player.x += player.vx;
    // wrap horizontally (castle is round)
    if (player.x < -player.w) player.x = W; if (player.x > W) player.x = -player.w;
    player.y += player.vy;
    if (player.inv > 0) player.inv -= dt;

    // platform collision (only when falling)
    player.onGround = false;
    for (const p of platforms) {
      if (p.broke) continue;
      if (p.vx) { p.x += p.vx; if (p.x < 2 || p.x + p.w > W - 2) p.vx *= -1; }
      const feet = player.y + player.h;
      if (player.vy >= 0 && feet >= p.y && feet <= p.y + p.h + player.vy + 2 &&
        player.x + player.w > p.x + 2 && player.x < p.x + p.w - 2) {
        player.y = p.y - player.h; player.vy = 0; player.onGround = true;
        if (p.vx) player.x += p.vx;
        if (p.type === 'crumble' && !p.t) { p.t = 0.45; }
      }
    }
    // crumble timers
    for (const p of platforms) { if (p.type === 'crumble' && p.t > 0) { p.t -= dt; if (p.t <= 0) p.broke = true; } }

    // camera follows upward only
    if (started) {
      const targetCam = player.y - H * 0.58;
      if (targetCam < camY) camY = targetCam + (camY - targetCam) * 0.0; // snap up
      camY = Math.min(camY, targetCam);
    }
    const climb = Math.max(0, Math.floor((H - 60 - player.y) / 10));
    if (climb > maxClimb) { score += (climb - maxClimb); maxClimb = climb; }

    // rising shadow: speeds up over time
    if (started) shadowY -= 0.18 + maxClimb * 0.0016;
    // shadow stays relative to camera floor too (never lets you rest at very bottom)
    const screenShadow = shadowY - camY;
    if (screenShadow < player.y - camY + player.h && player.y - camY > 0) {
      // shadow caught player
      die('THE SHADOW');
      return;
    }

    // generate more platforms above as we climb
    while (highestSpawnY > camY - 30) { highestSpawnY -= randInt(34, 48); addRow(highestSpawnY); }
    // cull below
    platforms = platforms.filter((p) => p.y - camY < H + 60);
    pickups = pickups.filter((p) => p.y - camY < H + 60 && !p.got);
    bats = bats.filter((b) => b.y - camY < H + 60 && b.y - camY > -80);

    // bats
    for (const b of bats) {
      b.x += b.vx; b.phase += 0.08;
      if (b.x < 4 || b.x + b.w > W - 4) b.vx *= -1;
      const by = b.y + Math.sin(b.phase) * 0.6;
      if (player.inv <= 0 && rectHit(player, { x: b.x, y: by, w: b.w, h: b.h })) {
        player.inv = 1.2; player.vy = -4; player.vx = b.vx > 0 ? -3 : 3; audio.sfx('hurt');
        score = Math.max(0, score - 5); msgShow('OUCH!');
      }
    }

    // pickups
    for (const p of pickups) {
      p.t += dt;
      if (!p.got && rectHit(player, p)) {
        p.got = true;
        if (p.kind === 'garlic') { player.inv = 4.5; audio.sfx('power'); msgShow('GARLIC! SAFE'); }
        else { score += 25; audio.sfx('coin'); msgShow('+25'); spark(p.x, p.y, '#ffe14d'); }
      }
    }

    // fell off the bottom
    if (player.y - camY > H + 20) { die('YOU FELL'); return; }

    // win: climbed high enough -> dawn
    if (maxClimb >= 520) { state = 'win'; audio.sfx('win'); Retro.Store.setHigh(GAME, score); }

    if (msgT > 0) msgT -= dt;
    sparkle.forEach((s) => { s.x += s.vx; s.y += s.vy; s.vy += 0.2; s.life -= dt; });
    sparkle = sparkle.filter((s) => s.life > 0);
  }

  function die(reason) {
    state = 'over'; msg = reason; audio.sfx('lose'); Retro.Store.setHigh(GAME, score);
  }
  function msgShow(t) { msg = t; msgT = 1.0; }
  function spark(x, y, c) { for (let i = 0; i < 8; i++) sparkle.push({ x, y, vx: rand(-2, 2), vy: rand(-3, 0), life: rand(0.3, 0.7), c }); }
  function rectHit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  /* ---------------------------- rendering ---------------------------- */
  function render() {
    // night sky gradient that brightens with altitude (toward dawn)
    const dawn = clamp(maxClimb / 520, 0, 1);
    const ctx = g.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, mix('#0b0420', '#ff8a3d', dawn * 0.7));
    sky.addColorStop(1, mix('#06010f', '#5a2a55', dawn * 0.5));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // moon
    g.circle(W - 40, 40 - dawn * 30, 12, mix('#e9e6ff', '#ffe14d', dawn));

    // background brick texture (parallax)
    ctx.fillStyle = 'rgba(40,26,64,.35)';
    const off = (camY * 0.3) % 24;
    for (let y = -24; y < H + 24; y += 24) for (let x = 0; x < W; x += 30) {
      ctx.fillRect(x + ((Math.floor((y - off) / 24) % 2) ? 15 : 0), y - off, 26, 20);
    }

    // platforms
    for (const p of platforms) {
      if (p.broke) continue;
      const sy = p.y - camY;
      if (sy < -10 || sy > H) continue;
      let col = '#5a4a6e', top = '#7a6a8e';
      if (p.type === 'ground') { col = '#241a33'; top = '#3a2f57'; }
      if (p.type === 'move') { col = '#3a5a8e'; top = '#5a8ace'; }
      if (p.type === 'crumble') { col = p.t > 0 ? '#8e3a3a' : '#6e4a4a'; top = '#ae5a5a'; }
      g.rect(p.x, sy, p.w, p.h, col);
      g.rect(p.x, sy, p.w, 2, top);
      if (p.type === 'move') { g.rect(p.x + p.w / 2 - 2, sy - 2, 4, 2, '#5a8ace'); }
    }

    // pickups
    for (const p of pickups) {
      if (p.got) continue;
      const sy = p.y - camY + Math.sin(p.t * 3) * 1.5;
      if (p.kind === 'garlic') {
        g.sprite(['.ww.', 'wwww', 'wwww', '.ww.'], p.x, sy, { w: '#f2eede' }, 2);
        g.rect(p.x + 3, sy - 2, 2, 3, '#5dff8f');
      } else {
        g.rect(p.x + 3, sy, 2, 10, '#ffe14d'); g.rect(p.x, sy + 3, 8, 2, '#ffe14d');
      }
    }

    // bats
    for (const b of bats) {
      const sy = b.y - camY + Math.sin(b.phase) * b.amp * 0.1;
      if (sy < -12 || sy > H) continue;
      const flap = Math.sin(engine.frame * 0.4) > 0 ? 0 : 1;
      g.sprite(flap ? ['k.kk.k', '.kkkk.', '..kk..'] : ['.k..k.', 'kkkkkk', '.kkkk.'], b.x, sy, { k: '#1b0e22' }, 2);
      g.rect(b.x + 4, sy + 4, 1, 1, '#ff2e97'); g.rect(b.x + 7, sy + 4, 1, 1, '#ff2e97');
    }

    // rising shadow
    const ssy = shadowY - camY;
    if (ssy < H + 20) {
      const sg = ctx.createLinearGradient(0, ssy - 30, 0, ssy + 30);
      sg.addColorStop(0, 'rgba(155,92,255,0)');
      sg.addColorStop(1, 'rgba(20,5,30,0.96)');
      ctx.fillStyle = sg; ctx.fillRect(0, ssy - 30, W, H - (ssy - 30) + 30);
      // wispy top
      ctx.fillStyle = 'rgba(155,92,255,.5)';
      for (let x = 0; x < W; x += 8) ctx.fillRect(x, ssy - 30 + Math.sin(x * 0.3 + engine.frame * 0.1) * 4, 6, 3);
    }

    // player (Harker)
    const blink = player.inv > 0 && (engine.frame % 8 < 4);
    if (!blink) drawHarker(player.x, player.y - camY, player.face, player.inv > 0);

    // sparkles
    for (const s of sparkle) g.rect(s.x, s.y - camY, 2, 2, s.c);

    drawHUD(dawn);

    if (msgT > 0 && msg) g.textC(msg, W / 2, 40, '#fff', 9);
    if (!started) {
      g.ctx.globalAlpha = 0.85; g.rect(0, 0, W, H, '#06010f'); g.ctx.globalAlpha = 1;
      g.textC('ESCAPE', W / 2, 70, '#ff2e97', 16);
      g.textC('CASTLE DRACULA', W / 2, 96, '#fff', 9);
      g.textC('Move ◀ ▶ , Jump', W / 2, 140, '#9d92c7', 8);
      g.textC('Beat the shadow', W / 2, 158, '#9d92c7', 8);
      g.textC('to the dawn!', W / 2, 172, '#9d92c7', 8);
      g.textC('▶ press any key', W / 2, 205, '#5dff8f', 8);
    }
    if (state === 'over') overlay('CAUGHT', msg, '#ff2e97');
    if (state === 'win') overlay('DAWN BREAKS!', 'You escaped!', '#ffe14d');
  }

  function drawHarker(x, y, face, glow) {
    if (glow) g.circle(x + 6, y + 7, 11, 'rgba(93,255,143,.18)');
    g.sprite([
      '.hhhh.',
      '.hffh.',
      '.ffff.',
      'cccccc',
      '.cccc.',
      '.c..c.',
      '.l..l.',
    ], x, y, { h: '#3a2f1a', f: '#e8c79a', c: '#6a2a2a', l: '#241a33' }, 2);
    void face;
  }

  function drawHUD(dawn) {
    g.text('HEIGHT ' + maxClimb + 'm', 6, 6, '#fff', 8);
    g.text('SCORE ' + score, 6, 20, '#ffe14d', 8);
    // dawn progress bar
    g.rect(W - 70, 8, 62, 8, '#241a33');
    g.rect(W - 69, 9, Math.floor(60 * dawn), 6, '#ff8a3d');
    g.text('DAWN', W - 70, 20, '#ff8a3d', 7);
  }

  function overlay(title, sub, col) {
    g.ctx.globalAlpha = 0.82; g.rect(0, 0, W, H, '#06010f'); g.ctx.globalAlpha = 1;
    g.textC(title, W / 2, 84, col, 14);
    g.textC(sub, W / 2, 116, '#fff', 9);
    g.textC('Height ' + maxClimb + 'm · Score ' + score, W / 2, 140, '#9d92c7', 8);
    g.textC('Best ' + Retro.Store.getHigh(GAME), W / 2, 156, '#ffe14d', 8);
    g.textC('Press any key', W / 2, 188, '#9d92c7', 8);
  }

  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
    const gg = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
    const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
    return '#' + ((1 << 24) + (r << 16) + (gg << 8) + bl).toString(16).slice(1);
  }

  document.getElementById('muteBtn').addEventListener('click', function () { this.textContent = audio.toggleMute() ? '🔇' : '🔊'; });
  document.getElementById('restartBtn').addEventListener('click', reset);

  reset();
  engine.run(update, render);
})();
