/* ============================================================================
 * SINBAD THE SAILOR — SEVEN SEAS (REBUILT)
 * Five genuinely-different voyages:
 *   1. WHALE ISLAND   — rush-collect crates before the whale dives (timed collect)
 *   2. VALLEY OF GEMS — memory game: watch gems fall, tap the right chests
 *   3. OLD MAN OF SEA — stealth: move ONLY when Old Man eyes are closed
 *   4. ROC'S FLIGHT   — balance pendulum: keep the rope centred for 20s
 *   5. FINAL VOYAGE   — shmup: steer & fire cannons at sea monsters
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── shared palette (NES-honest) ── */
  const P = {
    gold:   '#f0c030',
    teal:   '#00c8e0',
    ruby:   '#cc2244',
    night:  '#060e20',
    sea:    '#0c3a5a',
    sand:   '#e8c890',
    sky:    '#1a4898',
    vine:   '#2a6010',
  };

  /* ── emblem: dhow silhouette ── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    g.rect(cx - 1, cy - 26, 2, 34, '#b88018');
    c.fillStyle = '#f0e8c0';
    c.beginPath(); c.moveTo(cx + 2, cy - 24); c.lineTo(cx + 22, cy - 10); c.lineTo(cx + 2, cy + 4); c.closePath(); c.fill();
    c.fillStyle = '#7a3a10';
    c.beginPath(); c.moveTo(cx - 18, cy + 6); c.lineTo(cx + 18, cy + 6); c.lineTo(cx + 14, cy + 16); c.lineTo(cx - 14, cy + 16); c.closePath(); c.fill();
    c.strokeStyle = '#00a8c8'; c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx - 26, cy + 18);
    c.quadraticCurveTo(cx, cy + 14, cx + 26, cy + 18);
    c.stroke();
  }

  /* ── scenery: Arabian-night sea backdrop ── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      /* mariner's chart — deep teal with parchment accent */
      c.fillStyle = '#0c2a40'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 180; i++) {
        const px = (i * 71 + 13) % (W - 8) + 4, py = (i * 43 + 11) % (H - 8) + 4;
        c.fillStyle = 'rgba(0,140,180,' + (0.03 + (i % 5) * 0.01) + ')';
        c.fillRect(px, py, 2, 2);
      }
      for (let w2 = 0; w2 < 6; w2++) {
        const wy = 60 + w2 * 66;
        c.strokeStyle = 'rgba(0,140,180,0.10)';
        c.lineWidth = 1;
        c.beginPath();
        for (let x = 0; x <= W; x += 6) {
          const y = wy + Math.sin(x * 0.07 + t * 0.6 + w2) * 4;
          if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
      /* decorative border */
      c.strokeStyle = P.gold; c.lineWidth = 2.5; c.strokeRect(6, 6, W - 12, H - 12);
      c.strokeStyle = '#8a6010'; c.lineWidth = 1; c.strokeRect(11, 11, W - 22, H - 22);
      /* compass rose */
      const crx = W - 28, cry = H - 34;
      c.strokeStyle = P.gold; c.lineWidth = 1.5;
      for (let a = 0; a < 4; a++) {
        const ax = Math.cos(a * Math.PI / 2 - Math.PI / 2), ay = Math.sin(a * Math.PI / 2 - Math.PI / 2);
        c.beginPath(); c.moveTo(crx, cry); c.lineTo(crx + ax * 14, cry + ay * 14); c.stroke();
      }
      g.circle(crx, cry, 3, P.gold);
      api.txt('N', crx - 3, cry - 17, 6, P.gold);
      /* dotted route between nodes */
      const nds = [[48,115],[196,182],[126,265],[50,348],[200,428]];
      c.setLineDash([3, 5]); c.strokeStyle = 'rgba(200,152,32,0.38)'; c.lineWidth = 1.5;
      for (let n = 0; n < nds.length - 1; n++) {
        c.beginPath(); c.moveTo(nds[n][0], nds[n][1]); c.lineTo(nds[n + 1][0], nds[n + 1][1]); c.stroke();
      }
      c.setLineDash([]);
      return;
    }

    /* generic night sea for other scenes */
    const sky = c.createLinearGradient(0, 0, 0, H * 0.6);
    sky.addColorStop(0, '#060820'); sky.addColorStop(1, '#0c2a3a');
    c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.6);
    for (let i = 0; i < 44; i++) {
      const sx = (i * 71 + 13) % W, sy = (i * 47 + 5) % (H * 0.46);
      c.globalAlpha = 0.4 + 0.6 * Math.sin(t * 1.2 + i * 0.8);
      g.rect(sx, sy, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1, '#e8f0ff');
    }
    c.globalAlpha = 1;
    g.circle(W - 44, 34, 15, '#f0e8b0');
    c.fillStyle = '#0a1234'; c.beginPath(); c.arc(W - 36, 30, 13, 0, Math.PI * 2); c.fill();
    const sea = c.createLinearGradient(0, H * 0.56, 0, H);
    sea.addColorStop(0, '#0c3a5a'); sea.addColorStop(1, '#060e20');
    c.fillStyle = sea; c.fillRect(0, H * 0.56, W, H * 0.44);
    c.lineWidth = 1.5;
    for (let w = 0; w < 4; w++) {
      const wy = H * 0.59 + w * 20;
      c.strokeStyle = 'rgba(26,106,138,' + (0.6 - w * 0.1) + ')';
      c.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = wy + Math.sin(x * 0.06 + t * 1.4 + w * 1.2) * 3;
        if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
    }

    if (scene !== 'menu') {
      c.fillStyle = 'rgba(6,8,24,.68)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ── small Sinbad sprite helper ── */
  function drawSinbad(api, sx, sy, flash) {
    if (flash) return;
    const g = api.gfx;
    g.rect(sx - 4, sy - 18, 8, 8, '#e8c080');   // head
    g.rect(sx - 5, sy - 20, 10, 4, P.ruby);      // turban
    g.rect(sx - 5, sy - 10, 10, 12, '#2244cc');  // robe
    g.rect(sx - 5, sy + 2, 4, 6, '#1a1a4a');     // left leg
    g.rect(sx + 1, sy + 2, 4, 6, '#1a1a4a');     // right leg
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * CHAPTER 1: WHALE ISLAND — timed collect (rush grab crates before dive)
   * ══════════════════════════════════════════════════════════════════════════ */
  const ch_whale = {
    id: 'whale', name: 'WHALE ISLAND', sub: 'GRAB WHAT YOU CAN!',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      c.fillStyle = '#0a6090';
      c.beginPath(); c.moveTo(x - 10, y + 2); c.lineTo(x + 4, y - 6); c.lineTo(x + 8, y + 2); c.lineTo(x + 4, y + 8); c.closePath(); c.fill();
      g.rect(x - 1, y - 14, 2, 10, '#80d0f0');
      g.circle(x, y - 16, 4, '#b0e8ff');
    },
    intro: [
      'SINBAD\'S FLEET',
      'DROPS ANCHOR ON',
      'A LUSH GREEN ISLE —',
      'but the ground trembles.',
      '',
      'IT IS A SLEEPING WHALE.',
      'GRAB ALL YOU CAN!',
    ],
    quote: '"Scarcely had they landed than the island moved. Fly! It is a fish, not land!"',
    help: 'MOVE to reach CRATES · collect 6 before the whale dives!',
    winText: 'Sinbad leaps to a timber and rides the swell to safety. The whale vanishes into the deep.',
    loseText: 'The whale dives. Cold water swallows the camp.',
    init(api) {
      this.sx = api.W / 2;
      this.sy = api.H - 90;
      this.crates = [];
      this.spouts = [];
      this.spoutT = 0;
      this.crateT = 0;
      this.collected = 0;
      this.need = 6;
      this.lives = 3;
      this.invuln = 0;
      this.elapsed = 0;
      this.duration = 28;
      this.waveT = 0;
      /* pre-spawn some crates spread across the whale back */
      for (let i = 0; i < 4; i++) {
        this.crates.push({
          x: 28 + (i * 54 + 10) % (api.W - 56),
          y: api.H - 110 + (i % 3) * 14,
        });
      }
    },
    update(api, dt) {
      this.elapsed += dt;
      this.waveT += dt;
      if (this.invuln > 0) this.invuln -= dt;
      /* move */
      const spd = 100;
      const pd = api.pointer;
      if (api.keyDown('left')  || (pd.down && pd.x < this.sx - 16)) this.sx -= spd * dt;
      if (api.keyDown('right') || (pd.down && pd.x > this.sx + 16)) this.sx += spd * dt;
      if (api.keyDown('up')    || (pd.down && pd.y < this.sy - 16)) this.sy -= spd * dt;
      if (api.keyDown('down')  || (pd.down && pd.y > this.sy + 16)) this.sy += spd * dt;
      this.sx = clamp(this.sx, 14, api.W - 14);
      this.sy = clamp(this.sy, api.H - 150, api.H - 68);
      /* collect crates */
      for (let i = this.crates.length - 1; i >= 0; i--) {
        const cr = this.crates[i];
        if (Math.abs(cr.x - this.sx) < 20 && Math.abs(cr.y - this.sy) < 20) {
          this.collected++;
          api.addScore(50); api.audio.sfx('coin');
          api.burst(cr.x, cr.y, P.gold, 6);
          this.crates.splice(i, 1);
          if (this.collected >= this.need) { api.addScore(120); api.win(); return; }
        }
      }
      /* spawn new crates */
      this.crateT += dt;
      if (this.crateT > 3.5 && this.crates.length < 5) {
        this.crateT = 0;
        this.crates.push({
          x: 24 + Math.random() * (api.W - 48),
          y: api.H - 148 + Math.random() * 60,
        });
      }
      /* spouts (hazard — rising urgency) */
      this.spoutT += dt;
      const spoutRate = Math.max(1.2, 3.2 - this.elapsed * 0.07);
      if (this.spoutT > spoutRate) {
        this.spoutT = 0;
        this.spouts.push({ x: 20 + Math.random() * (api.W - 40), h: 0, maxH: 50 + Math.random() * 40, life: 1.8, phase: 0 });
      }
      for (let i = this.spouts.length - 1; i >= 0; i--) {
        const s = this.spouts[i];
        s.life -= dt; s.phase += dt * 3;
        if (s.life > 0.5) s.h = Math.min(s.maxH, s.h + s.maxH * dt / 0.4);
        else              s.h = Math.max(0, s.h - s.maxH * dt / 0.4);
        if (s.h < 2) { this.spouts.splice(i, 1); continue; }
        if (this.invuln <= 0 && Math.abs(s.x - this.sx) < 13 && s.h > 24) {
          this.lives--;
          this.invuln = 1.2;
          api.audio.sfx('hurt'); api.shake(4, 0.2);
          if (this.lives <= 0) { api.lose(); return; }
        }
      }
      if (this.elapsed >= this.duration) { api.lose(); }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      c.fillStyle = '#060e20'; c.fillRect(0, 0, W, H);
      /* whale back */
      const bob = Math.sin(this.waveT * 0.7) * 4;
      c.fillStyle = '#0a3a5a';
      c.beginPath();
      c.moveTo(8, H - 48 + bob);
      c.quadraticCurveTo(W * 0.28, H - 80 + bob, W / 2, H - 58 + bob);
      c.quadraticCurveTo(W * 0.72, H - 42 + bob, W - 8, H - 52 + bob);
      c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      /* greenery on island */
      c.fillStyle = '#1a5a20';
      for (let i = 0; i < 5; i++) {
        const tx = 24 + i * 50, ty = H - 66 + bob;
        c.beginPath(); c.arc(tx, ty, 10, 0, Math.PI * 2); c.fill();
      }
      g.circle(W * 0.35, H - 70 + bob, 4, '#1a7090');
      /* sea */
      c.lineWidth = 1.5;
      for (let row = 0; row < 3; row++) {
        const wy = H - 28 + row * 11;
        c.strokeStyle = 'rgba(26,90,138,' + (0.4 - row * 0.08) + ')';
        c.beginPath();
        for (let x = 0; x <= W; x += 5) {
          const y = wy + Math.sin(x * 0.07 + this.waveT * 1.8 + row) * 3;
          if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
      c.fillStyle = '#0a2a44'; c.fillRect(0, H - 22, W, 22);
      /* spouts */
      for (const s of this.spouts) {
        c.globalAlpha = 0.65 + 0.35 * Math.sin(s.phase);
        g.rect(s.x - 5, H - 56 - s.h, 10, s.h, '#60c0f0');
        g.circle(s.x, H - 56 - s.h, 7, '#90d8ff');
        c.globalAlpha = 1;
      }
      /* crates */
      for (const cr of this.crates) {
        g.rect(cr.x - 8, cr.y - 8, 16, 16, '#8a5a10');
        g.rect(cr.x - 8, cr.y - 2, 16, 2, P.gold);
        g.rect(cr.x - 2, cr.y - 8, 2, 16, P.gold);
      }
      /* Sinbad */
      drawSinbad(api, this.sx, this.sy, this.invuln > 0 && Math.sin(api.t * 20) > 0);
      /* HUD */
      api.topBar('WHALE ISLAND');
      api.txt('CRATES ' + this.collected + '/' + this.need, 6, 20, 8, P.gold);
      const tl = Math.max(0, Math.ceil(this.duration - this.elapsed));
      api.txt(tl + 's', W - 30, 20, 8, tl < 8 ? P.ruby : '#e8f0ff');
      for (let l = 0; l < 3; l++) g.rect(6 + l * 14, 30, 10, 10, l < this.lives ? P.ruby : '#2a0a10');
      g.rect(6, 42, W - 12, 4, '#0a2a40');
      g.rect(6, 42, Math.round((W - 12) * (1 - this.elapsed / this.duration)), 4, '#00c8e0');
      api.vignette(); api.scanlines();
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * CHAPTER 2: VALLEY OF GEMS — memory game
   *   REVEAL phase: diamonds fall into 5 numbered chests (3 s).
   *   RECALL phase: tap/arrow the right chest to retrieve each gem.
   *   3 wrong = lose. Collect 8 gems to win.
   * ══════════════════════════════════════════════════════════════════════════ */
  const CHEST_COUNT = 5;
  const ch_gems = {
    id: 'gems', name: 'VALLEY OF GEMS', sub: 'REMEMBER WHERE THEY FELL',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      c.fillStyle = '#00d4ff';
      c.beginPath(); c.moveTo(x, y - 10); c.lineTo(x + 8, y); c.lineTo(x, y + 10); c.lineTo(x - 8, y); c.closePath(); c.fill();
      g.circle(x - 2, y - 2, 2, 'rgba(255,255,255,0.7)');
    },
    intro: [
      'THE VALLEY OF JEWELS',
      'LIES BEYOND THE CLIFFS.',
      'EAGLES DROP DIAMONDS',
      'into hidden chests below.',
      '',
      'WATCH CAREFULLY.',
      'THEN CHOOSE WISELY.',
    ],
    quote: '"The floor was paved with diamonds, but great serpents lay among them, each as thick as a palm tree."',
    help: 'WATCH gems fall into chests · then TAP the right chest to collect',
    winText: 'Eight diamonds safe. Sinbad ties himself to an eagle and soars free of the valley!',
    loseText: 'Too many wrong chests! A serpent lunges from the shadows.',
    init(api) {
      this.phase = 'reveal';   // 'reveal' | 'recall'
      this.revealT = 0;
      this.revealDur = 2.8;
      this.collected = 0;
      this.need = 8;
      this.wrong = 0;
      this.maxWrong = 3;
      this.round = 0;
      /* falling gem state */
      this.fallingGem = null;
      this.targetChest = -1;
      this.flashChest = -1;
      this.flashT = 0;
      /* recall: which chest to pick next */
      this.recallQueue = [];
      this.recallIdx = 0;
      /* history of (chest, round) for multi-drop reveal */
      this.drops = [];
      this.selection = 2; // cursor for arrow key input
      this.W = api.W; this.H = api.H;
      this._startReveal(api);
    },
    _chestX(i, W) { return 22 + i * Math.floor((W - 44) / (CHEST_COUNT - 1)); },
    _chestY(H) { return H - 64; },
    _startReveal(api) {
      this.phase = 'reveal';
      this.revealT = 0;
      this.drops = [];
      /* pick 1-2 gems to drop this round */
      const count = this.round < 4 ? 1 : 2;
      const used = new Set();
      for (let i = 0; i < count; i++) {
        let ch;
        do { ch = Math.floor(Math.random() * CHEST_COUNT); } while (used.has(ch));
        used.add(ch);
        this.drops.push(ch);
      }
      this.dropIdx = 0;
      this._launchDrop(api);
    },
    _launchDrop(api) {
      if (this.dropIdx >= this.drops.length) {
        /* all drops launched — switch to recall after short pause */
        this.phase = 'pause';
        this.pauseT = 0.7;
        return;
      }
      const chest = this.drops[this.dropIdx];
      this.fallingGem = { x: this.W / 2, y: 30, vy: 160, chest };
      this.targetChest = chest;
    },
    update(api, dt) {
      if (this.phase === 'reveal') {
        this.revealT += dt;
        if (this.fallingGem) {
          this.fallingGem.y += this.fallingGem.vy * dt;
          const cy = this._chestY(api.H);
          if (this.fallingGem.y >= cy - 6) {
            /* landed */
            this.flashChest = this.fallingGem.chest;
            this.flashT = 0.55;
            api.audio.sfx('coin');
            api.burst(this._chestX(this.fallingGem.chest, api.W), cy, '#00d4ff', 5);
            this.fallingGem = null;
            this.dropIdx++;
            this._launchDrop(api);
          }
        }
        if (this.flashT > 0) this.flashT -= dt;
        return;
      }
      if (this.phase === 'pause') {
        this.pauseT -= dt;
        if (this.pauseT <= 0) {
          this.phase = 'recall';
          this.recallQueue = [...this.drops];
          this.recallIdx = 0;
        }
        return;
      }
      /* RECALL phase */
      if (this.flashT > 0) { this.flashT -= dt; return; }
      /* arrow key cursor */
      if (api.keyPressed('left')  && this.selection > 0) this.selection--;
      if (api.keyPressed('right') && this.selection < CHEST_COUNT - 1) this.selection++;
      /* confirm tap or A key */
      let chose = -1;
      if (api.keyPressed('a') || api.keyPressed('up')) chose = this.selection;
      /* tap on a chest */
      if (api.pointer.justDown) {
        const cy = this._chestY(api.H);
        for (let i = 0; i < CHEST_COUNT; i++) {
          const cx = this._chestX(i, api.W);
          if (Math.abs(api.pointer.x - cx) < 22 && Math.abs(api.pointer.y - cy) < 24) {
            chose = i; break;
          }
        }
      }
      if (chose < 0) return;
      const correct = this.recallQueue[this.recallIdx];
      this.flashChest = chose;
      this.flashT = 0.5;
      if (chose === correct) {
        api.addScore(60); api.audio.sfx('coin');
        api.burst(this._chestX(chose, api.W), this._chestY(api.H), '#00d4ff', 8);
        this.collected++;
        this.recallIdx++;
        if (this.collected >= this.need) { api.addScore(150); api.win(); return; }
        if (this.recallIdx >= this.recallQueue.length) {
          /* round done — start next */
          this.round++;
          this._startReveal(api);
        }
      } else {
        this.wrong++;
        api.audio.sfx('hurt'); api.shake(4, 0.2);
        if (this.wrong >= this.maxWrong) { api.lose(); return; }
        /* let them try again */
        this.flashChest = chose;
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      /* dark valley floor */
      c.fillStyle = '#100c04'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#1a3060'; c.fillRect(28, 0, W - 56, H * 0.38);
      /* eagles */
      for (let i = 0; i < 3; i++) {
        const ex = ((api.t * (22 + i * 9) + i * 88) % (W - 60)) + 30;
        const ey = 14 + i * 16 + Math.sin(api.t * 0.9 + i) * 6;
        c.fillStyle = '#4a2a08';
        c.beginPath(); c.ellipse(ex, ey, 9, 3, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.moveTo(ex - 9, ey); c.lineTo(ex - 20, ey - 6); c.lineTo(ex - 8, ey + 2); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(ex + 9, ey); c.lineTo(ex + 20, ey - 6); c.lineTo(ex + 8, ey + 2); c.closePath(); c.fill();
      }
      /* cliff walls */
      c.fillStyle = '#2a1a08'; c.fillRect(0, 0, 28, H); c.fillRect(W - 28, 0, 28, H);
      /* ground */
      c.fillStyle = '#1a0e04'; c.fillRect(0, H - 52, W, 52);
      /* chests */
      const cy = this._chestY(H);
      for (let i = 0; i < CHEST_COUNT; i++) {
        const cx = this._chestX(i, W);
        const isFlash = this.flashChest === i && this.flashT > 0;
        const isCorrect = this.recallQueue && this.recallQueue[this.recallIdx] === i && this.phase === 'recall';
        const isSel = this.selection === i && this.phase === 'recall';
        c.fillStyle = isFlash ? '#00d4ff' : '#6a3a10';
        c.fillRect(cx - 14, cy - 14, 28, 20);
        c.fillStyle = isFlash ? '#00eeff' : '#8a5a20';
        c.fillRect(cx - 14, cy - 18, 28, 6);
        c.strokeStyle = isSel ? '#ffff00' : P.gold;
        c.lineWidth = isSel ? 2 : 1;
        c.strokeRect(cx - 14, cy - 18, 28, 24);
        api.txt('' + (i + 1), cx - 3, cy - 16, 8, isFlash ? '#000080' : '#f0c030');
      }
      /* falling gem */
      if (this.fallingGem) {
        const gem = this.fallingGem;
        c.fillStyle = '#00d4ff';
        c.beginPath(); c.moveTo(gem.x, gem.y - 9); c.lineTo(gem.x + 7, gem.y); c.lineTo(gem.x, gem.y + 9); c.lineTo(gem.x - 7, gem.y); c.closePath(); c.fill();
        g.circle(gem.x - 2, gem.y - 2, 2, 'rgba(255,255,255,0.5)');
        /* dotted line to target chest */
        const tx = this._chestX(gem.chest, W);
        c.setLineDash([3, 4]); c.strokeStyle = 'rgba(0,212,255,0.28)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(gem.x, gem.y + 10); c.lineTo(tx, cy - 14); c.stroke();
        c.setLineDash([]);
      }
      /* phase label */
      const phaseStr = this.phase === 'reveal' ? 'WATCH!' : this.phase === 'recall' ? 'CHOOSE CHEST ' + (this.recallIdx + 1) + '/' + this.recallQueue.length : '';
      if (phaseStr) api.txtC(phaseStr, W / 2, 46, 8, this.phase === 'recall' ? '#f0c030' : '#00d4ff');
      /* HUD */
      api.topBar('VALLEY OF GEMS');
      api.txt('GEMS ' + this.collected + '/' + this.need, 6, 20, 8, '#00d4ff');
      api.txt('✗ ' + this.wrong + '/' + this.maxWrong, W - 46, 20, 8, P.ruby);
      api.vignette(); api.scanlines();
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * CHAPTER 3: OLD MAN OF THE SEA — stealth
   *   Old Man has eyes that open/close on a cycle.
   *   Move ONLY when eyes are CLOSED. Collect 8 grapes.
   *   Moving while eyes open = caught → lose a life.
   * ══════════════════════════════════════════════════════════════════════════ */
  const ch_oldman = {
    id: 'oldman', name: 'OLD MAN OF SEA', sub: 'MOVE ONLY IN DARKNESS',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      g.circle(x, y + 2, 7, '#8030b0');
      g.circle(x - 5, y - 3, 6, '#8030b0');
      g.circle(x + 5, y - 3, 6, '#8030b0');
      g.circle(x, y - 8, 6, '#6020a0');
      g.rect(x - 1, y - 15, 2, 8, P.vine);
    },
    intro: [
      'A WITHERED OLD MAN',
      'RIDES SINBAD\'S BACK',
      'WITH AN IRON GRIP.',
      '',
      'HIS EYES OPEN AND SHUT.',
      'COLLECT GRAPES ONLY',
      'WHEN HE CANNOT SEE.',
    ],
    quote: '"I made wine and gave it to him. He drank deep, grew merry, relaxed his grip — and I flung him to the ground."',
    help: 'Move ONLY when the Old Man\'s eyes are SHUT · collect 8 GRAPES',
    winText: 'The Old Man dozes off into the vines! Sinbad runs free across the empty beach.',
    loseText: 'The Old Man\'s iron eyes open at the wrong moment. His grip tightens forever.',
    init(api) {
      this.sx = api.W / 2;
      this.sy = api.H - 90;
      this.grapes = [];
      this.wineLevel = 0;
      this.wineNeed = 8;
      this.lives = 3;
      this.invuln = 0;
      /* eye cycle: eyeT counts, eyeOpen flips on cycle */
      this.eyeT = 0;
      this.eyeOpen = false;
      this.eyeOpenDur = 1.4;  // how long eyes stay open
      this.eyeClosedDur = 2.2; // how long eyes stay shut
      this.caught = false;
      this.caughtFlash = 0;
      /* spawn initial grapes */
      this._spawnGrapes(api);
    },
    _spawnGrapes(api) {
      this.grapes = [];
      const positions = [
        [40, api.H - 140], [90, api.H - 120], [150, api.H - 155],
        [210, api.H - 130], [60, api.H - 170], [180, api.H - 170],
        [120, api.H - 145], [230, api.H - 150],
      ];
      for (let i = 0; i < 8; i++) {
        this.grapes.push({ x: positions[i][0], y: positions[i][1], bob: i * 0.9 });
      }
    },
    update(api, dt) {
      if (this.invuln > 0) { this.invuln -= dt; }
      /* eye cycle */
      this.eyeT += dt;
      const cycleDur = this.eyeOpen ? this.eyeOpenDur : this.eyeClosedDur;
      if (this.eyeT >= cycleDur) {
        this.eyeT = 0;
        this.eyeOpen = !this.eyeOpen;
      }
      /* check if moving while eyes open */
      const pd = api.pointer;
      const movingX = api.keyDown('left') || api.keyDown('right') || (pd.down && Math.abs(pd.x - this.sx) > 18);
      const movingY = api.keyDown('up')   || api.keyDown('down')  || (pd.down && Math.abs(pd.y - this.sy) > 18);
      const moving = movingX || movingY;
      if (this.eyeOpen && moving && this.invuln <= 0) {
        this.lives--;
        this.invuln = 1.8;
        api.audio.sfx('hurt'); api.shake(6, 0.3);
        api.flash(P.ruby, 0.25);
        if (this.lives <= 0) { api.lose(); return; }
        return;
      }
      /* move Sinbad only when eyes closed */
      if (!this.eyeOpen) {
        const spd = 88;
        if (api.keyDown('left')  || (pd.down && pd.x < this.sx - 18)) this.sx -= spd * dt;
        if (api.keyDown('right') || (pd.down && pd.x > this.sx + 18)) this.sx += spd * dt;
        if (api.keyDown('up')    || (pd.down && pd.y < this.sy - 18)) this.sy -= spd * dt;
        if (api.keyDown('down')  || (pd.down && pd.y > this.sy + 18)) this.sy += spd * dt;
        this.sx = clamp(this.sx, 12, api.W - 12);
        this.sy = clamp(this.sy, api.H - 200, api.H - 68);
      }
      /* collect grapes */
      for (let i = this.grapes.length - 1; i >= 0; i--) {
        const gr = this.grapes[i];
        gr.bob += dt * 1.5;
        if (Math.abs(gr.x - this.sx) < 18 && Math.abs(gr.y - this.sy) < 18) {
          this.wineLevel++;
          api.addScore(45); api.audio.sfx('coin');
          api.burst(gr.x, gr.y, '#9040b0', 7);
          this.grapes.splice(i, 1);
          if (this.wineLevel >= this.wineNeed) { api.addScore(130); api.win(); return; }
        }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      /* tropical island */
      c.fillStyle = '#1a3870'; c.fillRect(0, 0, W, H * 0.48);
      g.circle(W * 0.18, 42, 18, '#f8d040');
      c.fillStyle = '#c0a040'; c.fillRect(0, H * 0.48, W, H * 0.52);
      c.fillStyle = '#dcc060'; c.fillRect(0, H * 0.48, W, 4);
      /* vines */
      c.strokeStyle = P.vine; c.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const vx = i * 34 + 10, vy = H * 0.48;
        c.beginPath(); c.moveTo(vx, vy); c.quadraticCurveTo(vx + 10, vy - 28, vx + (i % 2 ? 20 : -20), vy - 52); c.stroke();
      }
      /* grapes */
      for (const gr of this.grapes) {
        const bob = Math.sin(gr.bob) * 3;
        g.circle(gr.x, gr.y + bob, 7, '#8030b0');
        g.circle(gr.x - 5, gr.y - 4 + bob, 5, '#8030b0');
        g.circle(gr.x + 5, gr.y - 4 + bob, 5, '#8030b0');
        g.circle(gr.x, gr.y - 9 + bob, 5, '#6020a0');
        g.rect(gr.x - 1, gr.y - 16 + bob, 2, 7, P.vine);
      }
      /* Sinbad + Old Man on back */
      const flash = this.invuln > 0 && Math.sin(api.t * 18) > 0;
      if (!flash) {
        const sx = this.sx, sy = this.sy;
        /* Sinbad */
        g.rect(sx - 5, sy + 2, 4, 8, '#1a1a4a');
        g.rect(sx + 1, sy + 2, 4, 8, '#1a1a4a');
        g.rect(sx - 5, sy - 10, 10, 12, '#2244cc');
        g.rect(sx - 4, sy - 18, 8, 8, '#e8c080');
        g.rect(sx - 5, sy - 20, 10, 4, P.ruby);
        /* Old Man on shoulders */
        const sway = Math.sin(api.t * 2.2) * 2;
        const ox = sx + sway, oy = sy - 36;
        g.rect(sx - 11, sy - 18, 6, 8, '#8a6848');
        g.rect(sx + 5, sy - 18, 6, 8, '#8a6848');
        g.rect(ox - 4, oy - 12, 8, 14, '#8a6848');
        g.circle(ox, oy - 16, 7, '#b8946a');
        /* eyes */
        if (this.eyeOpen) {
          g.circle(ox - 3, oy - 18, 2, '#ff3000');
          g.circle(ox + 3, oy - 18, 2, '#ff3000');
        } else {
          g.rect(ox - 5, oy - 19, 4, 2, '#6a4a2a');
          g.rect(ox + 1, oy - 19, 4, 2, '#6a4a2a');
        }
      }
      /* eye status bar */
      const eyeFrac = this.eyeT / (this.eyeOpen ? this.eyeOpenDur : this.eyeClosedDur);
      const eyeLabel = this.eyeOpen ? 'EYES OPEN — FREEZE!' : 'EYES CLOSED — MOVE!';
      const eyeCol = this.eyeOpen ? '#ff4400' : '#00cc44';
      api.txtC(eyeLabel, W / 2, H - 20, 7, eyeCol);
      g.rect(6, H - 12, W - 12, 5, '#1a0a04');
      g.rect(6, H - 12, Math.round((W - 12) * (1 - eyeFrac)), 5, eyeCol);
      /* HUD */
      api.topBar('OLD MAN OF THE SEA');
      api.txt('GRAPES ' + this.wineLevel + '/' + this.wineNeed, 6, 20, 8, '#9040b0');
      for (let l = 0; l < 3; l++) g.rect(W - 48 + l * 14, 20, 10, 10, l < this.lives ? P.ruby : '#2a0a10');
      g.rect(6, 32, W - 12, 4, '#1a0a10');
      g.rect(6, 32, Math.round((W - 12) * this.wineLevel / this.wineNeed), 4, '#9040b0');
      api.vignette(); api.scanlines();
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * CHAPTER 4: ROC'S FLIGHT — balance pendulum
   *   Sinbad hangs from the Roc on a rope. The rope swings like a pendulum.
   *   Tap LEFT / RIGHT to shift weight and counterbalance.
   *   Stay in the safe zone (angle < threshold) for 20 seconds.
   *   Feathers drift down — catch them for bonus points.
   * ══════════════════════════════════════════════════════════════════════════ */
  const ch_roc = {
    id: 'roc', name: "ROC'S FLIGHT", sub: 'BALANCE ON THE ROPE',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      c.fillStyle = '#4a2a08';
      c.beginPath(); c.ellipse(x, y - 2, 10, 4, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(x - 12, y - 2); c.lineTo(x - 24, y - 10); c.lineTo(x - 10, y + 2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x + 12, y - 2); c.lineTo(x + 24, y - 10); c.lineTo(x + 10, y + 2); c.closePath(); c.fill();
      g.circle(x + 8, y - 5, 2, P.gold);
    },
    intro: [
      'SINBAD TIES HIS TURBAN',
      'TO THE GREAT ROC\'S FOOT',
      'AND SOARS SKYWARD',
      'on wings like a ship\'s sail.',
      '',
      'THE ROPE SWINGS.',
      'HOLD YOUR BALANCE!',
    ],
    quote: '"I tied my turban to the Roc\'s foot. At dawn it flew up, carrying me until I thought I had reached the stars."',
    help: 'TAP LEFT / RIGHT to shift weight · keep the rope centred · catch FEATHERS',
    winText: 'Sinbad holds fast! The Roc circles down to a cliff\'s edge and drops him safely.',
    loseText: 'The rope swings too far. Sinbad\'s grip gives way over the endless sky.',
    init(api) {
      this.angle = 0;        // radians, 0 = straight down
      this.angVel = 0;
      this.maxAngle = 0.70;  // lose if abs > this
      this.dangerAngle = 0.45;
      this.ropLen = 120;
      this.elapsed = 0;
      this.duration = 22;
      /* perturbation timer */
      this.perturbT = 2.5;
      this.feathers = [];
      this.featT = 0;
      this.lives = 3;
      this.invuln = 0;
      this.W = api.W;
      this.H = api.H;
    },
    _rocX(t) { return this.W / 2 + Math.sin(t * 0.28) * 28; },
    update(api, dt) {
      this.elapsed += dt;
      if (this.invuln > 0) this.invuln -= dt;
      /* physics: pendulum with damping */
      const gravity = 3.5;
      this.angVel += (-gravity * Math.sin(this.angle) - this.angVel * 0.6) * dt;
      /* player input: left/right tap shifts weight */
      const pd = api.pointer;
      const pushL = api.keyDown('left')  || (pd.down && pd.x < this.W / 2 - 20);
      const pushR = api.keyDown('right') || (pd.down && pd.x > this.W / 2 + 20);
      if (pushL) this.angVel -= 1.8 * dt;
      if (pushR) this.angVel += 1.8 * dt;
      this.angle += this.angVel * dt;
      /* random perturbations (wind gusts) */
      this.perturbT -= dt;
      if (this.perturbT <= 0) {
        const mag = 0.5 + Math.random() * 0.8;
        this.angVel += (Math.random() > 0.5 ? 1 : -1) * mag;
        this.perturbT = 2.0 + Math.random() * 2.0;
      }
      /* lose life if too far */
      if (Math.abs(this.angle) > this.maxAngle && this.invuln <= 0) {
        this.lives--;
        this.invuln = 1.6;
        this.angVel *= -0.5;
        this.angle = Math.sign(this.angle) * (this.maxAngle * 0.6);
        api.audio.sfx('hurt'); api.shake(5, 0.25);
        if (this.lives <= 0) { api.lose(); return; }
      }
      /* feathers */
      this.featT += dt;
      if (this.featT > 2.8) { this.featT = 0; this.feathers.push({ x: 20 + Math.random() * (this.W - 40), y: -16, vy: 48 + Math.random() * 20 }); }
      const rocX = this._rocX(api.t);
      const sinbadX = rocX + Math.sin(this.angle) * this.ropLen;
      const sinbadY = 14 + this.ropLen * Math.cos(this.angle);
      for (let i = this.feathers.length - 1; i >= 0; i--) {
        const f = this.feathers[i];
        f.y += f.vy * dt;
        if (f.y > this.H + 20) { this.feathers.splice(i, 1); continue; }
        if (Math.abs(f.x - sinbadX) < 16 && Math.abs(f.y - sinbadY) < 16) {
          api.addScore(30); api.audio.sfx('coin');
          api.burst(f.x, f.y, P.gold, 5);
          this.feathers.splice(i, 1);
        }
      }
      if (this.elapsed >= this.duration) { api.addScore(120); api.win(); }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      /* sky gradient */
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0a1860'); sky.addColorStop(0.5, '#1a4898'); sky.addColorStop(1, '#3080c0');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);
      /* sun */
      g.circle(W * 0.82, 38, 20, '#f8d040');
      c.globalAlpha = 0.12; g.circle(W * 0.82, 38, 36, '#f8d040'); c.globalAlpha = 1;
      /* background clouds */
      c.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 5; i++) {
        const cx2 = ((api.t * 14 + i * 62) % (W + 90)) - 45;
        const cy2 = 60 + i * 52;
        c.beginPath(); c.ellipse(cx2, cy2, 32 + i * 4, 13, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(cx2 + 22, cy2 - 6, 18, 9, 0, 0, Math.PI * 2); c.fill();
      }
      /* Roc silhouette */
      const rocX = this._rocX(api.t);
      const flap = Math.sin(api.t * 2.6) * 0.32;
      c.fillStyle = '#18080a';
      c.beginPath(); c.ellipse(rocX, -4, 22, 8, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(rocX - 22, -6); c.lineTo(rocX - 66, -20 + flap * 30); c.lineTo(rocX - 20, 2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(rocX + 22, -6); c.lineTo(rocX + 66, -20 + flap * 30); c.lineTo(rocX + 20, 2); c.closePath(); c.fill();
      /* rope */
      const sinbadX = rocX + Math.sin(this.angle) * this.ropLen;
      const sinbadY = 14 + this.ropLen * Math.cos(this.angle);
      const danger = Math.abs(this.angle) > this.dangerAngle;
      c.strokeStyle = danger ? P.ruby : P.gold; c.lineWidth = 2;
      c.beginPath(); c.moveTo(rocX, 4); c.lineTo(sinbadX, sinbadY - 16); c.stroke();
      /* angle guide lines */
      c.globalAlpha = 0.22;
      c.strokeStyle = '#00ff88'; c.lineWidth = 1; c.setLineDash([4, 4]);
      const safeX = Math.sin(this.maxAngle) * this.ropLen;
      c.beginPath(); c.moveTo(rocX, 4); c.lineTo(rocX + safeX, 14 + this.ropLen * Math.cos(this.maxAngle)); c.stroke();
      c.beginPath(); c.moveTo(rocX, 4); c.lineTo(rocX - safeX, 14 + this.ropLen * Math.cos(this.maxAngle)); c.stroke();
      c.setLineDash([]); c.globalAlpha = 1;
      /* feathers */
      for (const f of this.feathers) {
        c.strokeStyle = P.gold; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(f.x, f.y - 8); c.quadraticCurveTo(f.x + 6, f.y, f.x, f.y + 8); c.stroke();
      }
      /* Sinbad */
      if (!(this.invuln > 0 && Math.sin(api.t * 20) > 0)) {
        g.rect(sinbadX - 8, sinbadY - 30, 4, 14, '#2244cc');
        g.rect(sinbadX + 4, sinbadY - 30, 4, 14, '#2244cc');
        g.rect(sinbadX - 4, sinbadY - 22, 8, 8, '#e8c080');
        g.rect(sinbadX - 5, sinbadY - 24, 10, 4, P.ruby);
        g.rect(sinbadX - 5, sinbadY - 14, 10, 14, '#2244cc');
        g.rect(sinbadX - 5, sinbadY, 4, 8, '#1a1a4a');
        g.rect(sinbadX + 1, sinbadY, 4, 8, '#1a1a4a');
      }
      /* angle danger indicator */
      const angFrac = Math.abs(this.angle) / this.maxAngle;
      g.rect(6, H - 14, W - 12, 6, '#0a1830');
      g.rect(6, H - 14, Math.round((W - 12) * angFrac), 6, danger ? P.ruby : '#00cc44');
      /* HUD */
      api.topBar("ROC'S FLIGHT");
      const tl = Math.max(0, Math.ceil(this.duration - this.elapsed));
      api.txt(tl + 's', W / 2 - 8, 20, 8, tl < 7 ? P.ruby : '#e8f0ff');
      for (let l = 0; l < 3; l++) g.rect(6 + l * 14, 20, 10, 10, l < this.lives ? P.ruby : '#2a0a10');
      g.rect(6, 32, W - 12, 4, '#0a1830');
      g.rect(6, 32, Math.round((W - 12) * this.elapsed / this.duration), 4, P.teal);
      api.vignette(); api.scanlines();
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * CHAPTER 5: FINAL VOYAGE — vertical shmup (sea monsters)
   *   Steer & shoot. Ammo drops refill cannons. Kill 12 monsters to win.
   *   Bigger monsters take 2 hits. Kraken takes 3.
   * ══════════════════════════════════════════════════════════════════════════ */
  const ch_final = {
    id: 'finalvoyage', name: 'FINAL VOYAGE', sub: 'ALL MONSTERS MUST FALL',
    icon(api, x, y) {
      const g = api.gfx, c = api.ctx;
      g.rect(x - 10, y - 4, 20, 8, '#4a4a6a');
      g.circle(x + 10, y, 5, '#2a2a4a');
      g.rect(x - 14, y + 2, 4, 8, '#3a2a18');
      g.rect(x + 10, y + 2, 4, 8, '#3a2a18');
      g.circle(x + 16, y - 8, 4, '#1a1a2a');
    },
    intro: [
      'THE SEVENTH VOYAGE.',
      'SINBAD SAILS INTO',
      'SEAS THICK WITH MONSTERS.',
      '',
      'MAN THE CANNONS.',
      'PICK UP AMMO CRATES.',
      'BRING THE CREW HOME.',
    ],
    quote: '"I set sail once more, and the sea rose against me like mountains. Yet I did not despair, for Providence was with us."',
    help: 'STEER the ship · TAP / A to fire cannons · grab AMMO crates · kill 12 monsters',
    winText: 'The last monster sinks in foam and moonlight. Sinbad\'s ship limps into Basra, hold heavy with treasure.',
    loseText: 'The monsters overwhelm the ship. The sea takes her down, mast and all.',
    init(api) {
      this.ship = { x: api.W / 2, y: api.H - 72 };
      this.bullets = [];
      this.monsters = [];
      this.ammoDrops = [];
      this.monsterT = 0;
      this.ammoT = 0;
      this.cannonCD = 0;
      this.ammo = 20;
      this.kills = 0;
      this.need = 12;
      this.lives = 3;
      this.invuln = 0;
      this.waveT = 0;
      this.elapsed = 0;
    },
    update(api, dt) {
      this.elapsed += dt;
      this.waveT += dt;
      if (this.invuln > 0) this.invuln -= dt;
      if (this.cannonCD > 0) this.cannonCD -= dt;
      /* steer */
      const spd = 110;
      const pd = api.pointer;
      if (api.keyDown('left')  || (pd.down && pd.x < this.ship.x - 18)) this.ship.x -= spd * dt;
      if (api.keyDown('right') || (pd.down && pd.x > this.ship.x + 18)) this.ship.x += spd * dt;
      this.ship.x = clamp(this.ship.x, 22, api.W - 22);
      /* fire */
      if ((api.confirm() || api.keyDown('up') || api.keyDown('a')) && this.cannonCD <= 0 && this.ammo > 0) {
        this.cannonCD = 0.34;
        this.ammo--;
        this.bullets.push({ x: this.ship.x, y: this.ship.y - 22, vy: -250 });
        api.audio.sfx('shoot');
      }
      /* ammo drops */
      this.ammoT += dt;
      if (this.ammoT > 7) { this.ammoT = 0; this.ammoDrops.push({ x: 22 + Math.random() * (api.W - 44), y: -14, vy: 52 }); }
      for (let i = this.ammoDrops.length - 1; i >= 0; i--) {
        const a = this.ammoDrops[i];
        a.y += a.vy * dt;
        if (a.y > api.H + 20) { this.ammoDrops.splice(i, 1); continue; }
        if (Math.abs(a.x - this.ship.x) < 20 && Math.abs(a.y - this.ship.y) < 22) {
          this.ammo += 8; api.audio.sfx('power'); api.burst(a.x, a.y, P.gold, 6);
          this.ammoDrops.splice(i, 1);
        }
      }
      /* bullets */
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.y += b.vy * dt;
        if (b.y < -14) { this.bullets.splice(i, 1); continue; }
        let hit = false;
        for (let m = this.monsters.length - 1; m >= 0; m--) {
          const mon = this.monsters[m];
          if (Math.abs(b.x - mon.x) < 22 && Math.abs(b.y - mon.y) < 20) {
            api.burst(b.x, b.y, P.gold, 5); api.audio.sfx('explode');
            mon.hp--;
            if (mon.hp <= 0) {
              api.burst(mon.x, mon.y, '#cc4422', 14);
              this.monsters.splice(m, 1);
              this.kills++; api.addScore(50); api.shake(3, 0.12);
            }
            hit = true; break;
          }
        }
        if (hit) this.bullets.splice(i, 1);
      }
      /* spawn monsters */
      this.monsterT += dt;
      const mRate = Math.max(1.2, 3.4 - this.kills * 0.14);
      if (this.monsterT > mRate) {
        this.monsterT = 0;
        const big = this.kills > 4 && Math.random() > 0.5;
        const kraken = this.kills > 8 && Math.random() > 0.7;
        this.monsters.push({
          x: 24 + Math.random() * (api.W - 48), y: 36 + Math.random() * 80,
          vy: 18 + Math.random() * 14, sway: Math.random() * Math.PI * 2,
          type: kraken ? 'kraken' : big ? 'serpent' : 'eel',
          hp: kraken ? 3 : big ? 2 : 1,
        });
      }
      /* move monsters */
      for (let i = this.monsters.length - 1; i >= 0; i--) {
        const mon = this.monsters[i];
        mon.y += mon.vy * dt;
        mon.sway += dt * 1.3;
        mon.x += Math.sin(mon.sway) * 36 * dt;
        mon.x = clamp(mon.x, 18, api.W - 18);
        if (mon.y > api.H + 30) { this.monsters.splice(i, 1); continue; }
        if (this.invuln <= 0 && Math.abs(mon.x - this.ship.x) < 28 && Math.abs(mon.y - this.ship.y) < 26) {
          this.lives--; this.invuln = 1.1;
          api.audio.sfx('hurt'); api.shake(6, 0.3);
          this.monsters.splice(i, 1);
          if (this.lives <= 0) { api.lose(); return; }
        }
      }
      if (this.kills >= this.need) { api.addScore(200); api.win(); }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
      /* night sea */
      const sky = c.createLinearGradient(0, 0, 0, H * 0.5);
      sky.addColorStop(0, '#060820'); sky.addColorStop(1, '#0a1840');
      c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.5);
      for (let i = 0; i < 32; i++) {
        const sx2 = (i * 81 + 11) % W, sy2 = (i * 43 + 7) % (H * 0.42);
        c.globalAlpha = 0.5 + 0.5 * Math.sin(api.t + i * 0.7);
        g.rect(sx2, sy2, 1, 1, '#e8f0ff');
      }
      c.globalAlpha = 1;
      const sea = c.createLinearGradient(0, H * 0.42, 0, H);
      sea.addColorStop(0, '#0c3a5a'); sea.addColorStop(1, '#060e20');
      c.fillStyle = sea; c.fillRect(0, H * 0.42, W, H * 0.58);
      c.lineWidth = 1.5;
      for (let row = 0; row < 5; row++) {
        const wy = H * 0.44 + row * 28;
        c.strokeStyle = 'rgba(26,106,138,' + (0.5 - row * 0.07) + ')';
        c.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const y = wy + Math.sin(x * 0.07 + this.waveT * 1.6 + row * 0.7) * 4;
          if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
      /* ammo drops */
      for (const a of this.ammoDrops) {
        g.rect(a.x - 7, a.y - 7, 14, 12, '#3a2a08');
        g.rect(a.x - 5, a.y - 4, 10, 6, '#8a6010');
        api.txt('⚫', a.x - 4, a.y - 7, 8, P.gold);
      }
      /* monsters */
      for (const mon of this.monsters) {
        if (mon.type === 'eel') {
          c.fillStyle = '#1e6618';
          c.beginPath(); c.ellipse(mon.x, mon.y, 12, 5, Math.sin(mon.sway) * 0.3, 0, Math.PI * 2); c.fill();
          g.circle(mon.x + 12, mon.y - 3, 6, '#0a4810');
          g.circle(mon.x + 14, mon.y - 5, 2, '#f0f030');
          for (let h = 0; h < mon.hp; h++) g.rect(mon.x - 4 + h * 6, mon.y - 15, 4, 4, P.ruby);
        } else if (mon.type === 'serpent') {
          c.fillStyle = '#1e6618';
          c.beginPath(); c.ellipse(mon.x, mon.y, 16, 8, 0, 0, Math.PI * 2); c.fill();
          g.circle(mon.x + 15, mon.y - 5, 8, '#0a4810');
          g.circle(mon.x + 18, mon.y - 7, 2, '#f0f030');
          for (let h = 0; h < mon.hp; h++) g.rect(mon.x - 7 + h * 7, mon.y - 20, 5, 5, P.ruby);
        } else {
          c.fillStyle = '#4a0a4a';
          c.beginPath(); c.ellipse(mon.x, mon.y, 18, 12, 0, 0, Math.PI * 2); c.fill();
          for (let ti = 0; ti < 6; ti++) {
            const ta = (ti / 6) * Math.PI * 2 + mon.sway;
            const tx = mon.x + Math.cos(ta) * 22, ty = mon.y + 8 + Math.sin(ta) * 10;
            g.rect(tx - 3, ty - 12, 5, 14, '#38083a');
          }
          g.circle(mon.x - 6, mon.y - 4, 3, '#ff4000');
          g.circle(mon.x + 6, mon.y - 4, 3, '#ff4000');
          for (let h = 0; h < mon.hp; h++) g.rect(mon.x - 9 + h * 7, mon.y - 24, 5, 5, P.ruby);
        }
      }
      /* cannonballs */
      for (const b of this.bullets) {
        c.globalAlpha = 0.35; g.circle(b.x, b.y, 7, P.gold); c.globalAlpha = 1;
        g.circle(b.x, b.y, 4, P.gold);
      }
      /* ship */
      const sx = this.ship.x, sy = this.ship.y;
      if (!(this.invuln > 0 && Math.sin(api.t * 20) > 0)) {
        c.fillStyle = '#5a2a08';
        c.beginPath(); c.moveTo(sx - 24, sy); c.lineTo(sx + 24, sy); c.lineTo(sx + 20, sy + 14); c.lineTo(sx - 20, sy + 14); c.closePath(); c.fill();
        g.rect(sx - 1, sy - 38, 2, 38, '#8a5a20');
        c.fillStyle = '#e8e0d0';
        c.beginPath(); c.moveTo(sx + 2, sy - 36); c.lineTo(sx + 24, sy - 18); c.lineTo(sx + 2, sy - 2); c.closePath(); c.fill();
        g.rect(sx - 22, sy + 2, 6, 4, '#2a1a08');
        g.rect(sx + 16, sy + 2, 6, 4, '#2a1a08');
        g.rect(sx + 2, sy - 40, 14, 8, P.ruby);
      }
      /* muzzle flash */
      if (this.cannonCD > 0.26) {
        c.globalAlpha = 0.5; g.circle(sx, sy - 38, 10, '#f8e040'); c.globalAlpha = 1;
      }
      /* HUD */
      api.topBar('FINAL VOYAGE');
      api.txt('SLAIN ' + this.kills + '/' + this.need, 6, 20, 8, P.gold);
      api.txt('⚫ ' + this.ammo, W - 52, 20, 8, this.ammo < 5 ? P.ruby : '#e8e0d0');
      for (let l = 0; l < 3; l++) g.rect(6 + l * 14, 32, 10, 10, l < this.lives ? P.ruby : '#2a0a10');
      g.rect(6, 44, W - 12, 4, '#0a1830');
      g.rect(6, 44, Math.round((W - 12) * this.kills / this.need), 4, P.gold);
      api.vignette(); api.scanlines();
    },
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * RETROSAGA SHELL
   * ══════════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id: 'sinbad',
    title: 'Sinbad the Sailor',
    subtitle: 'SEVEN SEAS',
    currency: 'JEWELS',
    screens: {
      win:          '#f0c030',
      lose:         '#cc4422',
      chapterLabel: '#00c8e0',
      name:         '#f0e8c0',
      sub:          '#00b8d8',
      intro:        '#c8e8f8',
      quote:        '#7aa8c0',
      help:         '#f0c030',
      score:        '#f0e8c0',
      cur:          '#f0c030',
      cta:          '#e8f4ff',
      overlay:      'rgba(6,8,24,.86)',
    },
    labels: {
      chapter:  'VOYAGE',
      score:    'JEWELS WON',
      win:      'THE SEAS YIELD',
      lose:     'THE DEEP CLAIMS YOU',
      cont:     'TAP TO SET SAIL',
      finale:   'TAP FOR THE SEVENTH SEA',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO EMBARK',
    },
    accent: P.gold,
    credit: 'ONE THOUSAND AND ONE NIGHTS',
    bootLine: 'FIVE VOYAGES · ONE LEGEND',
    tagline: 'AN 8-BIT ADVENTURE',
    emblem,
    scenery,
    bootCta: 'TAP TO SET SAIL',
    menuLabel: 'THE VOYAGES OF SINBAD',
    menuHint:  'CHOOSE YOUR VOYAGE',
    menuDone:  'ALL SEAS CROSSED',
    menu: {
      title(api, jewels) {
        const c = api.ctx, W = api.W;
        c.fillStyle = '#b88010';
        c.beginPath();
        c.arc(24, 34, 10, Math.PI / 2, Math.PI * 3 / 2);
        c.arc(W - 24, 34, 10, -Math.PI / 2, Math.PI / 2);
        c.closePath(); c.fill();
        c.fillStyle = '#e8c050'; c.fillRect(24, 24, W - 48, 20);
        c.strokeStyle = '#8a5a08'; c.lineWidth = 1; c.strokeRect(24, 24, W - 48, 20);
        api.txtCFit('THE VOYAGES OF SINBAD', W / 2, 29, 8, '#3a1a04', false, W - 60);
        api.txtCFit('JEWELS  ' + jewels, W / 2, 41, 8, '#6a2a04', false, W - 60);
      },
      layout() {
        /* 5 island nodes scattered across the chart — non-list */
        return [
          { x: 20,  y: 89,  w: 56, h: 56 },
          { x: 168, y: 154, w: 56, h: 56 },
          { x: 98,  y: 237, w: 56, h: 56 },
          { x: 20,  y: 320, w: 56, h: 56 },
          { x: 168, y: 400, w: 56, h: 56 },
        ];
      },
      card(api, { ch, i, x, y, w, h, sel, done }) {
        const g = api.gfx, c = api.ctx;
        const cx = x + w / 2, cy = y + h / 2;
        /* sandy island */
        c.fillStyle = '#b89030'; c.beginPath(); c.ellipse(cx, cy + 18, 22, 8, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#e8c860'; c.beginPath(); c.ellipse(cx, cy + 16, 16, 5, 0, 0, Math.PI * 2); c.fill();
        /* palm */
        g.rect(cx - 1, cy + 6, 2, 12, '#6a3a10');
        c.fillStyle = '#24a040';
        c.beginPath(); c.moveTo(cx - 1, cy + 8); c.lineTo(cx - 15, cy - 2); c.lineTo(cx + 1, cy + 6); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(cx + 1, cy + 7); c.lineTo(cx + 15, cy - 2); c.lineTo(cx - 1, cy + 6); c.closePath(); c.fill();
        /* badge */
        const col = done ? P.gold : sel ? '#00e8d0' : '#0a4060';
        c.fillStyle = col; c.beginPath(); c.arc(cx, cy - 8, 13, 0, Math.PI * 2); c.fill();
        c.strokeStyle = done ? '#c89820' : sel ? '#00b8a0' : '#1a6a8a';
        c.lineWidth = 2; c.beginPath(); c.arc(cx, cy - 8, 13, 0, Math.PI * 2); c.stroke();
        api.txtC('' + (i + 1), cx, cy - 13, 10, done ? '#3a1a04' : sel ? '#003830' : '#e8f8ff', true);
        /* scroll label */
        const nw = Math.min(ch.name.length * 5 + 8, 62);
        const nx = cx - nw / 2;
        c.fillStyle = '#e8c860'; c.fillRect(nx, cy + 26, nw, 11);
        c.strokeStyle = '#8a6010'; c.lineWidth = 1; c.strokeRect(nx, cy + 26, nw, 11);
        api.txtC(ch.name, cx, cy + 28, 6, '#3a1a04');
        if (done) {
          c.strokeStyle = P.gold; c.lineWidth = 2;
          c.beginPath(); c.moveTo(cx - 7, cy - 9); c.lineTo(cx - 2, cy - 4); c.lineTo(cx + 7, cy - 16); c.stroke();
        }
      },
      colors: { bg: '#0c2a40', title: P.gold, label: '#c8e8f8', cur: '#00e8d0', done: P.gold },
    },
    finale: [
      'SINBAD DROPS ANCHOR', 'IN HIS HOME PORT OF BASRA.', '',
      'HIS PALACE GLEAMS', 'WITH SEVEN SEAS OF SPOILS.', '',
      'ALL WHO HEAR HIS TALES', 'ARE RICHER FOR THE HEARING.',
    ],
    width: 270, height: 480, parent: '#game',
    palette: { gold: P.gold, teal: P.teal, ruby: P.ruby },

    chapters: [ch_whale, ch_gems, ch_oldman, ch_roc, ch_final],
  });
})();
