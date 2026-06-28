/* ============================================================================
 * IT'S ALIVE! — a lightning-storm rhythm game
 * Genre: Rhythm / Timing.  Built on RetroEngine.
 *
 * In Victor Frankenstein's laboratory, a storm rages overhead. Bolts of
 * lightning race down four conducting rods toward the Creature on the slab.
 * Strike each bolt the instant it reaches its glowing rod-tip to channel the
 * charge into the life-meter. Fill the meter to spark the Creature to life —
 * but mistimed strikes bleed the charge away and the storm will pass.
 * ============================================================================ */
(function () {
  'use strict';
  const { clamp, rand, randInt } = Retro.util;

  const W = 240, H = 264;
  const engine = new Retro.Engine({
    width: W, height: H, parent: '#game', touch: 'dpad', showB: false,
  });
  const g = engine.gfx, input = engine.input, audio = engine.audio;
  const GAME = 'frankenstein-spark';

  // Four lanes mapped to the four D-pad / arrow directions.
  const LANES = [
    { key: 'left', glyph: '◀', color: '#ff2e97' },
    { key: 'up', glyph: '▲', color: '#21e6ff' },
    { key: 'down', glyph: '▼', color: '#5dff8f' },
    { key: 'right', glyph: '▶', color: '#ffe14d' },
  ];
  const LANE_W = 46, FIELD_X = (W - LANE_W * 4) / 2;
  const HIT_Y = H - 52, SPAWN_Y = 26, APPROACH = 1.35; // seconds top->hit
  const HIT_WIN = 0.13, PERFECT_WIN = 0.055;            // timing windows (s)

  let notes, charge, combo, bestCombo, score, state, nextBeat, beat, bpm, flash, screenShake,
    judgeText, judgeT, judgeColor, creature, started, lastSpawnLane, pops;

  function reset() {
    notes = []; charge = 34; combo = 0; bestCombo = 0; score = 0; state = 'play';
    bpm = 96; beat = 0; nextBeat = 1.2; flash = 0; screenShake = 0;
    judgeText = ''; judgeT = 0; judgeColor = '#fff'; lastSpawnLane = -1; pops = [];
    creature = { awake: 0, twitch: 0, eyes: 0 };
    started = false;
  }

  function laneX(i) { return FIELD_X + i * LANE_W + LANE_W / 2; }

  function spawnBeat() {
    // density + tempo rise as the charge climbs (the storm intensifies)
    const intensity = clamp(charge / 100, 0, 1);
    bpm = 96 + intensity * 64;
    const beatLen = 60 / bpm;
    // chance of 1 or 2 notes per beat
    const lanesThisBeat = (Math.random() < 0.18 + intensity * 0.25) ? 2 : 1;
    const used = [];
    for (let n = 0; n < lanesThisBeat; n++) {
      let li;
      do { li = randInt(0, 3); } while (used.includes(li) || (lanesThisBeat === 1 && li === lastSpawnLane && Math.random() < 0.5));
      used.push(li);
      notes.push({ lane: li, hitTime: engine.time + APPROACH, y: SPAWN_Y, judged: false });
    }
    lastSpawnLane = used[used.length - 1];
    nextBeat = beatLen * (Math.random() < 0.25 ? 0.5 : 1); // occasional off-beat
  }

  function update(dt) {
    if (state === 'win' || state === 'over') {
      if (input.anyPressed()) reset();
      return;
    }
    if (!started) {
      if (input.anyPressed()) { started = true; }
      else return;
    }

    // spawn to the beat
    nextBeat -= dt;
    if (nextBeat <= 0) { spawnBeat(); }

    // advance notes
    for (const nt of notes) {
      const tToHit = nt.hitTime - engine.time;
      nt.y = HIT_Y - (tToHit / APPROACH) * (HIT_Y - SPAWN_Y);
      // auto-miss if passed window
      if (!nt.judged && engine.time - nt.hitTime > HIT_WIN) {
        nt.judged = true; nt.result = 'miss'; registerMiss();
      }
    }

    // input judging — press the lane direction
    for (let i = 0; i < 4; i++) {
      if (input.pressed(LANES[i].key)) {
        const nt = nearestNote(i);
        if (nt) {
          const err = Math.abs(engine.time - nt.hitTime);
          nt.judged = true;
          if (err <= PERFECT_WIN) { nt.result = 'perfect'; registerHit(3.2, 'PERFECT', LANES[i].color, nt); }
          else { nt.result = 'good'; registerHit(1.8, 'GOOD', '#cfeeff', nt); }
        } else {
          // empty strike — small penalty (over-mashing)
          charge = clamp(charge - 1.2, 0, 100); flash = Math.max(flash, 0.05);
        }
      }
    }

    // passive charge bleed (the storm fights you) — gentle, scales down near full
    charge = clamp(charge - dt * 1.4, 0, 100);

    notes = notes.filter((n) => !(n.judged && n.y > HIT_Y + 18));

    // creature awakening tracks charge
    creature.awake = charge / 100;
    creature.eyes = clamp((charge - 55) / 45, 0, 1);
    if (combo > 0 && combo % 8 === 0) creature.twitch = 0.3;
    if (creature.twitch > 0) creature.twitch -= dt;

    // win / lose
    if (charge >= 100) { state = 'win'; combo > bestCombo && (bestCombo = combo); audio.sfx('win'); flash = 0.6; screenShake = 0.5; Retro.Store.setHigh(GAME, Math.max(score, Retro.Store.getHigh(GAME))); }
    if (charge <= 0 && started) { state = 'over'; audio.sfx('lose'); Retro.Store.setHigh(GAME, score); }

    if (flash > 0) flash -= dt;
    if (screenShake > 0) screenShake -= dt;
    if (judgeT > 0) judgeT -= dt;
    pops.forEach((p) => { p.y += p.vy; p.vy += 0.2; p.life -= dt; });
    pops = pops.filter((p) => p.life > 0);
  }

  function nearestNote(lane) {
    let best = null, bestErr = HIT_WIN + 0.001;
    for (const nt of notes) {
      if (nt.lane !== lane || nt.judged) continue;
      const err = Math.abs(engine.time - nt.hitTime);
      if (err < bestErr) { bestErr = err; best = nt; }
    }
    return best;
  }

  function registerHit(amount, label, color, nt) {
    combo++; if (combo > bestCombo) bestCombo = combo;
    const mult = 1 + Math.min(combo, 30) * 0.04;
    charge = clamp(charge + amount * (label === 'PERFECT' ? 1.2 : 1), 0, 100);
    score += Math.round(amount * 40 * mult);
    judge(label, color);
    audio.tone(label === 'PERFECT' ? 880 : 660, 0.06, 'square', 0.25);
    if (label === 'PERFECT') { audio.tone(1320, 0.05, 'square', 0.2, 0.04); flash = Math.max(flash, 0.35); screenShake = Math.max(screenShake, 0.18); }
    for (let i = 0; i < 6; i++) pops.push({ x: laneX(nt.lane) + rand(-8, 8), y: HIT_Y, vy: rand(-2.5, -0.5), life: rand(0.3, 0.6), c: color });
  }
  function registerMiss() {
    combo = 0; charge = clamp(charge - 4.5, 0, 100);
    judge('MISS', '#ff5a5a'); audio.sfx('hurt');
  }
  function judge(t, c) { judgeText = t; judgeColor = c; judgeT = 0.5; }

  /* ---------------------------- rendering ---------------------------- */
  function render() {
    const ctx = g.ctx;
    let sx = 0, sy = 0;
    if (screenShake > 0) { sx = rand(-2, 2) * screenShake * 4; sy = rand(-2, 2) * screenShake * 4; }
    ctx.save(); ctx.translate(sx, sy);

    // lab background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#160a30'); bg.addColorStop(1, '#06010f');
    ctx.fillStyle = bg; ctx.fillRect(-4, -4, W + 8, H + 8);

    // storm flashes at top
    if (flash > 0.2) { ctx.fillStyle = 'rgba(180,200,255,' + (flash - 0.2) + ')'; ctx.fillRect(-4, -4, W + 8, 40); }
    // jagged sky bolt occasionally
    if (flash > 0.25) drawBolt(rand(20, W - 20), 0, 3);

    // lane field
    for (let i = 0; i < 4; i++) {
      const x = FIELD_X + i * LANE_W;
      ctx.fillStyle = i % 2 ? 'rgba(123,92,255,.06)' : 'rgba(123,92,255,.10)';
      ctx.fillRect(x, SPAWN_Y - 6, LANE_W, HIT_Y - SPAWN_Y + 24);
      // conducting rod down the lane
      g.rect(laneX(i) - 1, SPAWN_Y, 2, HIT_Y - SPAWN_Y, 'rgba(123,92,255,.25)');
      // hit target (rod tip)
      const lit = nearestNote(i) && Math.abs(engine.time - nearestNote(i).hitTime) < 0.12;
      g.circle(laneX(i), HIT_Y, 11, lit ? LANES[i].color : 'rgba(255,255,255,.10)');
      g.circle(laneX(i), HIT_Y, 8, '#0b0420');
      g.textC(LANES[i].glyph, laneX(i), HIT_Y - 4, LANES[i].color, 8);
    }

    // notes (lightning orbs)
    for (const nt of notes) {
      if (nt.judged && nt.result !== undefined && nt.y > HIT_Y) continue;
      const x = laneX(nt.lane), c = LANES[nt.lane].color;
      const r = 7 + Math.sin(engine.frame * 0.4 + nt.lane) * 1;
      // trail
      g.ctx.globalAlpha = 0.3; g.circle(x, nt.y - 8, r * 0.7, c); g.ctx.globalAlpha = 1;
      g.circle(x, nt.y, r, c);
      g.circle(x, nt.y, r - 3, '#fff');
      g.rect(x - 1, nt.y - r - 3, 2, 3, c);
    }

    // the slab + Creature at the bottom
    drawCreature();

    // particles
    for (const p of pops) g.rect(p.x, p.y, 2, 2, p.c);

    // judge text
    if (judgeT > 0 && judgeText) g.textC(judgeText, W / 2, HIT_Y - 30, judgeColor, 11);

    ctx.restore();

    // HUD (no shake)
    drawHUD();

    if (!started) {
      ctx.globalAlpha = 0.82; g.rect(0, 0, W, H, '#06010f'); ctx.globalAlpha = 1;
      g.textC("IT'S ALIVE!", W / 2, 64, '#5dff8f', 15);
      g.textC('Strike each bolt as it', W / 2, 104, '#9d92c7', 8);
      g.textC('hits its glowing rod.', W / 2, 118, '#9d92c7', 8);
      g.textC('Fill the LIFE meter!', W / 2, 138, '#21e6ff', 8);
      g.textC('◀ ▲ ▼ ▶  press to begin', W / 2, 174, '#ffe14d', 8);
    }
    if (state === 'win') overlay("IT'S ALIVE!!!", 'The Creature awakens!', '#5dff8f');
    if (state === 'over') overlay('THE STORM PASSES', 'The spark fades...', '#ff2e97');
  }

  function drawBolt(x, y, w) {
    const ctx = g.ctx; ctx.strokeStyle = 'rgba(200,220,255,.9)'; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x, y);
    let cy = y;
    while (cy < 40) { cy += rand(6, 12); ctx.lineTo(x + rand(-10, 10), cy); }
    ctx.stroke();
  }

  function drawCreature() {
    const cx = W / 2, baseY = H - 14;
    // slab
    g.rect(cx - 44, baseY - 2, 88, 10, '#2a2436');
    g.rect(cx - 44, baseY - 2, 88, 2, '#43394f');
    // body (rises slightly as it awakens)
    const rise = creature.awake * 4 + (creature.twitch > 0 ? 1 : 0);
    const skin = creature.awake > 0.6 ? '#7fbf6f' : '#5f8f5a';
    g.rect(cx - 26, baseY - 12 - rise, 52, 12, skin);
    // head
    g.rect(cx - 10, baseY - 24 - rise, 20, 14, skin);
    g.rect(cx - 10, baseY - 26 - rise, 20, 3, '#3a3a2a'); // flat-top hair
    // bolts in neck
    g.rect(cx - 14, baseY - 16 - rise, 3, 4, '#caa15a');
    g.rect(cx + 11, baseY - 16 - rise, 3, 4, '#caa15a');
    // eyes open with charge
    if (creature.eyes > 0) {
      const ew = 2 + creature.eyes * 1.5;
      g.rect(cx - 6, baseY - 20 - rise, ew, 2 + creature.eyes * 2, '#ffe14d');
      g.rect(cx + 4, baseY - 20 - rise, ew, 2 + creature.eyes * 2, '#ffe14d');
      if (creature.eyes > 0.8 && engine.frame % 30 < 15) { g.rect(cx - 6, baseY - 20 - rise, ew, 1, '#fff'); }
    } else {
      g.rect(cx - 6, baseY - 19 - rise, 4, 1, '#1a2a1a');
      g.rect(cx + 2, baseY - 19 - rise, 4, 1, '#1a2a1a');
    }
    // stitches
    g.rect(cx - 4, baseY - 14 - rise, 8, 1, '#2a4a2a');
  }

  function drawHUD() {
    // life meter (vertical, left)
    const mx = 8, my = 30, mh = H - 90;
    g.rect(mx, my, 12, mh, '#241a33');
    const fill = Math.floor(mh * (charge / 100));
    const c = charge > 75 ? '#5dff8f' : charge > 40 ? '#21e6ff' : '#ff8a3d';
    g.rect(mx, my + (mh - fill), 12, fill, c);
    g.rect(mx, my + (mh - fill), 12, 2, '#fff');
    g.text('LIFE', mx - 2, my - 12, '#9d92c7', 7);
    // score + combo
    g.text('SCORE ' + score, 28, 8, '#fff', 8);
    if (combo > 1) g.text(combo + 'x COMBO', W - 96, 8, combo >= 10 ? '#ffe14d' : '#9d92c7', 8);
    g.text('BPM ' + Math.round(bpm), W - 70, 22, '#5dff8f', 7);
  }

  function overlay(title, sub, col) {
    const ctx = g.ctx;
    ctx.globalAlpha = 0.85; g.rect(0, 0, W, H, '#06010f'); ctx.globalAlpha = 1;
    g.textC(title, W / 2, 70, col, 13);
    g.textC(sub, W / 2, 104, '#fff', 9);
    g.textC('Score ' + score + ' · Combo ' + bestCombo, W / 2, 130, '#9d92c7', 8);
    g.textC('Best ' + Retro.Store.getHigh(GAME), W / 2, 148, '#ffe14d', 8);
    g.textC('Press any key', W / 2, 182, '#9d92c7', 8);
  }

  document.getElementById('muteBtn').addEventListener('click', function () { this.textContent = audio.toggleMute() ? '🔇' : '🔊'; });
  document.getElementById('restartBtn').addEventListener('click', reset);

  reset();
  engine.run(update, render);
})();
