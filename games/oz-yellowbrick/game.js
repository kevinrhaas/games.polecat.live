/* ============================================================================
 * THE YELLOW BRICK ROAD — an auto-running platform dash
 * Genre: Auto-Runner.  Built on RetroEngine.
 *
 * Dorothy and Toto skip down the yellow brick road toward the Emerald City.
 * Jump the ditches, crows and poppy patches. Rescue the Scarecrow, the Tin Man
 * and the Cowardly Lion along the way, and scoop up emeralds. Each companion
 * you gather lets you take one extra hit. Reach the Emerald City to win!
 * ============================================================================ */
(function () {
  'use strict';
  const { clamp, rand, randInt } = Retro.util;

  const W = 288, H = 180;
  const engine = new Retro.Engine({
    width: W, height: H, parent: '#game', touch: 'minimal', buttonLabels: { a: 'JUMP' },
  });
  const g = engine.gfx, input = engine.input, audio = engine.audio;
  const GAME = 'oz-yellowbrick';

  const GROUND_Y = H - 34, GRAV = 0.55, JUMP = -7.4;
  const GOAL = 4200; // distance to Emerald City

  let player, obstacles, coins, companions, clouds, dist, speed, state, scrollX, jumps, msg, msgT, hitFlash, started, spawnX, compIdx, sparkle;
  const COMP_NAMES = ['SCARECROW', 'TIN MAN', 'LION'];

  function reset() {
    player = { x: 54, y: GROUND_Y - 18, w: 12, h: 18, vy: 0, onGround: true, run: 0 };
    obstacles = []; coins = []; companions = []; clouds = []; sparkle = [];
    dist = 0; speed = 2.2; state = 'play'; scrollX = 0; jumps = 0;
    msg = ''; msgT = 0; hitFlash = 0; started = false; spawnX = W + 40; compIdx = 0;
    player.lives = 1; // base; companions add buffer
    player.companions = 0;
    for (let i = 0; i < 5; i++) clouds.push({ x: rand(0, W), y: rand(14, 60), s: rand(0.4, 1), spd: rand(0.2, 0.5) });
  }

  function update(dt) {
    if (state === 'over' || state === 'win') { if (input.anyPressed()) reset(); return; }

    const jump = input.pressed('up') || input.pressed('a') || input.pressed('b');
    if (jump) {
      started = true;
      if (player.onGround) { player.vy = JUMP; player.onGround = false; jumps = 1; audio.sfx('jump'); }
      else if (jumps < 2) { player.vy = JUMP * 0.86; jumps = 2; audio.sfx('jump'); spark(player.x + 6, player.y + 18, '#fff'); }
    }
    if (!started) return;

    // run physics
    player.vy += GRAV; player.y += player.vy;
    if (player.y >= GROUND_Y - player.h) {
      // check if over a gap
      if (!overGap(player.x + player.w / 2)) { player.y = GROUND_Y - player.h; player.vy = 0; player.onGround = true; jumps = 0; }
      else if (player.y > H + 20) { fall(); return; }
    } else player.onGround = false;
    player.run += speed;

    // progression
    speed = clamp(2.2 + dist / 1400, 2.2, 4.6);
    dist += speed; scrollX += speed;

    // spawn world
    spawnX -= speed;
    while (spawnX < W + 40) { spawnChunk(); }

    // move + cull
    obstacles.forEach((o) => { o.x -= speed; if (o.kind === 'crow') { o.x -= 0.6; o.y += Math.sin(engine.frame * 0.1 + o.ph) * 0.4; } });
    coins.forEach((c) => c.x -= speed);
    companions.forEach((c) => c.x -= speed);
    clouds.forEach((c) => { c.x -= c.spd; if (c.x < -30) { c.x = W + 20; c.y = rand(14, 60); } });
    obstacles = obstacles.filter((o) => o.x > -40);
    coins = coins.filter((c) => c.x > -20 && !c.got);
    companions = companions.filter((c) => c.x > -30 && !c.got);

    const pb = { x: player.x + 1, y: player.y, w: player.w - 2, h: player.h };

    // obstacle collisions
    for (const o of obstacles) {
      if (o.kind === 'gap') continue;
      const ob = obstacleBox(o);
      if (ob && hit(pb, ob)) { o.dead = true; takeHit(); }
    }
    obstacles = obstacles.filter((o) => !o.dead);

    // coins
    for (const c of coins) {
      if (!c.got && hit(pb, { x: c.x - 5, y: c.y - 5, w: 10, h: 10 })) { c.got = true; dist += 15; audio.sfx('coin'); spark(c.x, c.y, '#5dff8f'); }
    }
    // companions
    for (const c of companions) {
      if (!c.got && hit(pb, { x: c.x - 7, y: c.y - 16, w: 14, h: 20 })) {
        c.got = true; player.companions++; audio.sfx('power'); msgShow(c.name + ' JOINS!'); spark(c.x, c.y - 8, '#ffe14d'); dist += 50;
      }
    }

    // win
    if (dist >= GOAL) { state = 'win'; audio.sfx('win'); Retro.Store.setHigh(GAME, Math.floor(dist + player.companions * 200)); }

    if (msgT > 0) msgT -= dt;
    if (hitFlash > 0) hitFlash -= dt;
    sparkle.forEach((s) => { s.x += s.vx; s.y += s.vy; s.vy += 0.18; s.life -= dt; });
    sparkle = sparkle.filter((s) => s.life > 0);
  }

  // --- world generation in chunks ---
  function spawnChunk() {
    const base = spawnX;
    const r = Math.random();
    const progress = dist / GOAL;
    if (r < 0.22 && progress > 0.04) {
      // gap (ditch)
      const gw = randInt(26, 40);
      obstacles.push({ kind: 'gap', x: base, w: gw });
      // coin arc over gap
      for (let i = 0; i < 3; i++) coins.push({ x: base + gw / 2 + (i - 1) * 12, y: GROUND_Y - 36 - (1 - Math.abs(i - 1)) * 10, got: false });
      spawnX = base + gw + randInt(60, 110);
    } else if (r < 0.5) {
      // rock / poppy on ground
      const kind = Math.random() < 0.5 ? 'rock' : 'poppy';
      obstacles.push({ kind, x: base, w: 14 });
      spawnX = base + randInt(70, 130);
    } else if (r < 0.66) {
      // flying crow
      obstacles.push({ kind: 'crow', x: base, y: GROUND_Y - 40 - randInt(0, 18), w: 14, ph: rand(0, 6.28) });
      spawnX = base + randInt(80, 130);
    } else {
      // open run with a line of emeralds
      const n = randInt(3, 5);
      for (let i = 0; i < n; i++) coins.push({ x: base + i * 16, y: GROUND_Y - 24, got: false });
      spawnX = base + n * 16 + randInt(50, 90);
    }
    // companion checkpoints
    if (compIdx < 3 && dist + (base - 54) > (compIdx + 1) * (GOAL / 4)) {
      companions.push({ x: base + 30, y: GROUND_Y - 2, name: COMP_NAMES[compIdx], type: compIdx, got: false });
      compIdx++;
    }
  }

  function overGap(px) { return obstacles.some((o) => o.kind === 'gap' && px > o.x && px < o.x + o.w); }
  function obstacleBox(o) {
    if (o.kind === 'rock') return { x: o.x, y: GROUND_Y - 12, w: 14, h: 12 };
    if (o.kind === 'poppy') return { x: o.x, y: GROUND_Y - 10, w: 14, h: 10 };
    if (o.kind === 'crow') return { x: o.x, y: o.y, w: 14, h: 8 };
    return null;
  }
  function hit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  function takeHit() {
    if (hitFlash > 0) return;
    audio.sfx('hurt'); hitFlash = 0.7;
    if (player.companions > 0) { player.companions--; msgShow('A friend shields you!'); player.vy = -4; }
    else { state = 'over'; audio.sfx('lose'); Retro.Store.setHigh(GAME, Math.floor(dist)); }
  }
  function fall() { audio.sfx('lose'); state = 'over'; Retro.Store.setHigh(GAME, Math.floor(dist)); }
  function msgShow(t) { msg = t; msgT = 1.2; }
  function spark(x, y, c) { for (let i = 0; i < 8; i++) sparkle.push({ x, y, vx: rand(-2, 2), vy: rand(-2.5, 0.5), life: rand(0.3, 0.7), c }); }

  /* ---------------------------- rendering ---------------------------- */
  function render() {
    const ctx = g.ctx;
    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#3aa0d8'); sky.addColorStop(1, '#bfe6ff');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // emerald city on the horizon, grows as you approach
    const prog = dist / GOAL;
    drawEmeraldCity(W - 60 + (1 - prog) * 40, GROUND_Y - 8 - prog * 6, 0.5 + prog * 0.8);

    // clouds
    for (const c of clouds) drawCloud(c.x, c.y, c.s);

    // rolling green hills (parallax)
    ctx.fillStyle = '#5db36a';
    const ho = (scrollX * 0.3) % 80;
    ctx.beginPath(); ctx.moveTo(-ho, H);
    for (let x = -ho; x <= W + 80; x += 80) ctx.quadraticCurveTo(x + 40, GROUND_Y - 18, x + 80, GROUND_Y - 4);
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

    // ground band
    g.rect(0, GROUND_Y, W, H - GROUND_Y, '#3e8c4a');
    g.rect(0, GROUND_Y, W, 3, '#6cd47e');

    // yellow brick road (with gaps)
    for (let x = -((scrollX) % 16) - 16; x < W + 16; x += 16) {
      const bx = x;
      if (obstacles.some((o) => o.kind === 'gap' && bx + 8 > o.x && bx + 8 < o.x + o.w)) continue;
      const row = Math.floor((x + scrollX) / 16);
      g.rect(bx, GROUND_Y, 14, 10, (row & 1) ? '#f0c93a' : '#ffe14d');
      g.rect(bx, GROUND_Y, 14, 2, '#fff1a8');
    }

    // gaps (darken)
    for (const o of obstacles) if (o.kind === 'gap') g.rect(o.x, GROUND_Y, o.w, H - GROUND_Y, '#2a5a32');

    // obstacles
    for (const o of obstacles) {
      if (o.kind === 'rock') { g.sprite(['.kk.', 'kkkk', 'kkkk'], o.x, GROUND_Y - 12, { k: '#7a6a55' }, 3.5); }
      else if (o.kind === 'poppy') { for (let i = 0; i < 3; i++) { g.rect(o.x + i * 5, GROUND_Y - 8, 1, 8, '#3e8c4a'); g.circle(o.x + i * 5 + 1, GROUND_Y - 9, 3, '#ff2e97'); g.circle(o.x + i * 5 + 1, GROUND_Y - 9, 1, '#ffe14d'); } }
      else if (o.kind === 'crow') { const f = Math.sin(engine.frame * 0.3) > 0; g.sprite(f ? ['k.k', 'kkk'] : ['.k.', 'kkk'], o.x, o.y, { k: '#241a33' }, 4); g.rect(o.x + 11, o.y + 4, 2, 1, '#ff8a3d'); }
    }

    // coins (emeralds)
    for (const c of coins) { if (c.got) continue; const yb = Math.sin(engine.frame * 0.15 + c.x) * 1.5; g.sprite(['.g.', 'ggg', '.g.'], c.x - 4, c.y - 4 + yb, { g: '#5dff8f' }, 3); }

    // companions waiting on road
    for (const c of companions) { if (!c.got) drawCompanion(c.x, c.y, c.type); }

    // sparkles
    for (const s of sparkle) g.rect(s.x, s.y, 2, 2, s.c);

    // player (Dorothy + Toto)
    drawDorothy(player.x, player.y);

    drawHUD(prog);

    if (hitFlash > 0) { ctx.globalAlpha = Math.min(0.5, hitFlash); g.rect(0, 0, W, H, '#ff2e97'); ctx.globalAlpha = 1; }
    if (msgT > 0 && msg) g.textC(msg, W / 2, 40, '#fff', 9);

    if (!started) {
      ctx.globalAlpha = 0.78; g.rect(0, 0, W, H, '#06010f'); ctx.globalAlpha = 1;
      g.textC('THE YELLOW', W / 2, 50, '#ffe14d', 13);
      g.textC('BRICK ROAD', W / 2, 72, '#ffe14d', 13);
      g.textC('JUMP to follow the road', W / 2, 110, '#9d92c7', 8);
      g.textC('to the Emerald City', W / 2, 124, '#9d92c7', 8);
      g.textC('▲ press JUMP to start', W / 2, 152, '#5dff8f', 8);
    }
    if (state === 'over') overlay('OFF TO SEE...', 'You traveled ' + Math.floor(dist) + 'm', '#ff2e97');
    if (state === 'win') overlay('EMERALD CITY!', 'You made it home!', '#5dff8f');
  }

  function drawHUD(prog) {
    g.text('DIST ' + Math.floor(dist), 6, 6, '#0b3a1a', 8);
    // companion icons
    for (let i = 0; i < player.companions; i++) g.text('★', 6 + i * 12, 20, '#ffe14d', 8);
    // progress bar to emerald city
    g.rect(W - 90, 8, 80, 7, 'rgba(0,0,0,.3)');
    g.rect(W - 89, 9, Math.floor(78 * clamp(prog, 0, 1)), 5, '#5dff8f');
  }

  function drawDorothy(x, y) {
    const bob = player.onGround ? Math.sin(player.run * 0.3) * 1 : 0;
    // dress blue gingham, hair brown, basket
    g.sprite([
      '.hhhh.',
      'hhffhh',
      '.ffff.',
      '.bwwb.',
      'bbbbbb',
      'bbbbbb',
      '.b..b.',
      '.r..r.',
    ], x, y + bob, { h: '#6a4a2a', f: '#f2d2a8', b: '#5a9ad8', w: '#ffffff', r: '#b03a3a' }, 2);
    // ruby slippers sparkle
    if (engine.frame % 20 < 3) g.rect(x + 2, y + 16 + bob, 2, 2, '#ff2e97');
    // Toto trailing
    const tx = x - 14 + Math.sin(player.run * 0.2) * 2;
    g.sprite(['.kk.', 'kkkk', 'k..k'], tx, y + 10, { k: '#3a2a1a' }, 2);
  }

  function drawCompanion(x, y, type) {
    if (type === 0) g.sprite(['.ss.', 'sffs', '.ss.', 'ssss', '.s.s'], x - 4, y - 18, { s: '#e0c050', f: '#caa15a' }, 2); // scarecrow
    else if (type === 1) g.sprite(['.mm.', 'mffm', '.mm.', 'mmmm', '.m.m'], x - 4, y - 18, { m: '#a8c0d0', f: '#cfe0ec' }, 2); // tin man
    else g.sprite(['.LL.', 'LffL', 'LLLL', 'LLLL', '.L.L'], x - 4, y - 18, { L: '#d49a4a', f: '#f0c878' }, 2); // lion
  }

  function drawEmeraldCity(x, y, s) {
    g.ctx.globalAlpha = 0.9;
    for (let i = 0; i < 5; i++) {
      const tx = x + i * 9 * s, th = (18 + (i % 2) * 10) * s;
      g.rect(tx, y - th, 7 * s, th, '#3ad07a');
      g.rect(tx, y - th, 7 * s, 2, '#a8ffd0');
      // spire
      g.rect(tx + 2 * s, y - th - 5 * s, 2, 5 * s, '#5dff8f');
    }
    g.ctx.globalAlpha = 1;
  }
  function drawCloud(x, y, s) { g.ctx.globalAlpha = 0.85; g.circle(x, y, 7 * s, '#fff'); g.circle(x + 8 * s, y + 2, 9 * s, '#fff'); g.circle(x + 16 * s, y, 6 * s, '#fff'); g.ctx.globalAlpha = 1; }

  function overlay(title, sub, col) {
    g.ctx.globalAlpha = 0.84; g.rect(0, 0, W, H, '#06010f'); g.ctx.globalAlpha = 1;
    g.textC(title, W / 2, 56, col, 13);
    g.textC(sub, W / 2, 90, '#fff', 9);
    g.textC('Best ' + Retro.Store.getHigh(GAME), W / 2, 110, '#ffe14d', 8);
    g.textC('Press any key', W / 2, 138, '#9d92c7', 8);
  }

  document.getElementById('muteBtn').addEventListener('click', function () { this.textContent = audio.toggleMute() ? '🔇' : '🔊'; });
  document.getElementById('restartBtn').addEventListener('click', reset);

  reset();
  engine.run(update, render);
})();
