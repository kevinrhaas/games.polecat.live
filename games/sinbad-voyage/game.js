/* ============================================================================
 * SINBAD THE SAILOR — SEVEN SEAS
 * Five voyages from One Thousand and One Nights:
 *   1. WHALE ISLAND  — dodge waterspouts, survive the submerging whale (22s)
 *   2. VALLEY OF GEMS — catch falling diamonds, dodge valley serpents (collect 10)
 *   3. ROC'S FLIGHT  — cling to the Roc, dodge falling rocks and clouds (20s)
 *   4. OLD MAN OF THE SEA — collect grapes to brew wine, trick the Old Man free (8 grapes)
 *   5. FINAL VOYAGE  — steer the ship, fire cannons at sea monsters (kill 10)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Ship silhouette
    g.rect(cx - 1, cy - 26, 2, 34, '#c89820');
    c.fillStyle = '#f0e8c0';
    c.beginPath(); c.moveTo(cx + 2, cy - 24); c.lineTo(cx + 22, cy - 10); c.lineTo(cx + 2, cy + 4); c.closePath(); c.fill();
    c.fillStyle = '#7a3a10';
    c.beginPath(); c.moveTo(cx - 18, cy + 6); c.lineTo(cx + 18, cy + 6); c.lineTo(cx + 14, cy + 16); c.lineTo(cx - 14, cy + 16); c.closePath(); c.fill();
    c.strokeStyle = '#00a8c8'; c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx - 26, cy + 18);
    c.quadraticCurveTo(cx - 14, cy + 14, cx, cy + 18);
    c.quadraticCurveTo(cx + 14, cy + 22, cx + 26, cy + 18);
    c.stroke();
  }

  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    // Night sky
    const sky = c.createLinearGradient(0, 0, 0, H * 0.6);
    sky.addColorStop(0, '#060820');
    sky.addColorStop(0.5, '#0a1234');
    sky.addColorStop(1, '#0c2a3a');
    c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.6);
    // Stars
    for (let i = 0; i < 44; i++) {
      const sx = (i * 71 + 13) % W, sy = (i * 47 + 5) % (H * 0.46);
      c.globalAlpha = 0.45 + 0.55 * Math.sin(t * 1.2 + i * 0.8);
      g.rect(sx, sy, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1, '#e8f0ff');
    }
    c.globalAlpha = 1;
    // Crescent moon
    g.circle(W - 44, 36, 16, '#f0e8b0');
    c.fillStyle = '#0a1234'; c.beginPath(); c.arc(W - 36, 32, 14, 0, Math.PI * 2); c.fill();
    // Sea
    const sea = c.createLinearGradient(0, H * 0.56, 0, H);
    sea.addColorStop(0, '#0c3a5a');
    sea.addColorStop(1, '#060e20');
    c.fillStyle = sea; c.fillRect(0, H * 0.56, W, H * 0.44);
    // Waves
    c.lineWidth = 1.5;
    for (let w = 0; w < 4; w++) {
      const wy = H * 0.59 + w * 20;
      c.strokeStyle = 'rgba(26,106,138,' + (0.6 - w * 0.1) + ')';
      c.beginPath(); c.globalAlpha = 1;
      for (let x = 0; x <= W; x += 4) {
        const y = wy + Math.sin(x * 0.06 + t * 1.4 + w * 1.2) * 3;
        if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
    }
    // Distant ship
    const shipX = ((t * 10) % (W + 80)) - 40;
    c.fillStyle = '#04101a';
    c.fillRect(shipX - 1, H * 0.57 - 22, 2, 22);
    c.beginPath(); c.moveTo(shipX + 1, H * 0.57 - 18); c.lineTo(shipX + 14, H * 0.57 - 10); c.lineTo(shipX + 1, H * 0.57 - 2); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(shipX - 14, H * 0.57); c.lineTo(shipX + 12, H * 0.57); c.lineTo(shipX + 8, H * 0.57 + 6); c.lineTo(shipX - 10, H * 0.57 + 6); c.closePath(); c.fill();

    if (scene === 'menu') {
      // Mariner's chart — deep teal sea with parchment map overlay
      c.fillStyle = '#0c2a40'; c.fillRect(0, 0, W, H);
      // Sea texture
      for (let i = 0; i < 220; i++) {
        const px = (i * 67 + 13) % (W - 8) + 4, py = (i * 43 + 11) % (H - 8) + 4;
        c.fillStyle = 'rgba(0,140,180,' + (0.04 + (i % 4) * 0.01) + ')';
        c.fillRect(px, py, 2, 2);
      }
      // Animated wave lines on map
      c.lineWidth = 1;
      for (let w2 = 0; w2 < 7; w2++) {
        const wy = 56 + w2 * 60;
        c.strokeStyle = 'rgba(0,140,180,0.12)';
        c.beginPath();
        for (let x = 0; x <= W; x += 6) {
          const y = wy + Math.sin(x * 0.07 + t * 0.7 + w2) * 4;
          if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
      // Map border
      c.strokeStyle = '#c89820'; c.lineWidth = 2.5; c.strokeRect(6, 6, W - 12, H - 12);
      c.strokeStyle = '#8a6010'; c.lineWidth = 1; c.strokeRect(11, 11, W - 22, H - 22);
      // Compass rose
      const crx = W - 28, cry = H - 34;
      c.strokeStyle = '#c89820'; c.lineWidth = 1.5;
      for (let a = 0; a < 4; a++) {
        const ax = Math.cos((a * Math.PI / 2) - Math.PI / 2), ay = Math.sin((a * Math.PI / 2) - Math.PI / 2);
        c.beginPath(); c.moveTo(crx, cry); c.lineTo(crx + ax * 14, cry + ay * 14); c.stroke();
      }
      g.circle(crx, cry, 3, '#c89820');
      api.txt('N', crx - 3, cry - 17, 6, '#f0c030');
      // Dotted paths between voyage nodes (drawn before cards)
      const nodes = [[48, 115], [200, 185], [130, 268], [50, 350], [200, 430]];
      c.setLineDash([3, 5]); c.strokeStyle = 'rgba(200,152,32,0.4)'; c.lineWidth = 1.5;
      for (let n = 0; n < nodes.length - 1; n++) {
        c.beginPath(); c.moveTo(nodes[n][0], nodes[n][1]); c.lineTo(nodes[n + 1][0], nodes[n + 1][1]); c.stroke();
      }
      c.setLineDash([]);
    } else if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(6,8,24,.74)'; c.fillRect(0, 0, W, H);
    }
  }

  RetroSaga.create({
    id: 'sinbad',
    title: 'Sinbad',
    subtitle: 'SEVEN SEAS',
    currency: 'JEWELS',
    screens: {
      win:    '#f0c030',
      lose:   '#cc4422',
      chapterLabel: '#00c8e0',
      name:   '#f0e8c0',
      sub:    '#00b8d8',
      intro:  '#c8e8f8',
      quote:  '#7aa8c0',
      help:   '#f0c030',
      score:  '#f0e8c0',
      cur:    '#f0c030',
      cta:    '#e8f4ff',
      overlay: 'rgba(6,8,24,.86)',
    },
    labels: {
      chapter:  'VOYAGE',
      score:    'JEWELS WON',
      win:      'SEAS CONQUERED',
      lose:     'THE DEEP CLAIMS YOU',
      cont:     'TAP TO SET SAIL',
      finale:   'TAP FOR THE SEVENTH SEA',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO EMBARK',
    },
    accent: '#f0c030',
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
        // Scroll banner
        c.fillStyle = '#b88010';
        c.beginPath();
        c.arc(24, 34, 10, Math.PI / 2, Math.PI * 3 / 2); c.arc(W - 24, 34, 10, -Math.PI / 2, Math.PI / 2); c.closePath(); c.fill();
        c.fillStyle = '#e8c050'; c.fillRect(24, 24, W - 48, 20);
        c.strokeStyle = '#8a5a08'; c.lineWidth = 1; c.strokeRect(24, 24, W - 48, 20);
        api.txtCFit('THE VOYAGES OF SINBAD', W / 2, 29, 8, '#3a1a04', false, W - 58);
        api.txtCFit('JEWELS  ' + jewels, W / 2, 41, 8, '#6a2a04', false, W - 58);
      },
      layout() {
        // 5 island nodes scattered across the map — non-list arrangement
        const nodes = [[48, 115], [200, 185], [130, 268], [50, 350], [200, 430]];
        return nodes.map(([cx, cy]) => ({ x: cx - 28, y: cy - 28, w: 56, h: 56 }));
      },
      card(api, { ch, i, x, y, w, h, sel, done }) {
        const g = api.gfx, c = api.ctx;
        const cx = x + w / 2, cy = y + h / 2;
        // Sandy island
        c.fillStyle = '#b89030'; c.beginPath(); c.ellipse(cx, cy + 18, 22, 8, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#e8c860'; c.beginPath(); c.ellipse(cx, cy + 16, 16, 5, 0, 0, Math.PI * 2); c.fill();
        // Palm tree
        g.rect(cx - 1, cy + 6, 2, 12, '#6a3a10');
        c.fillStyle = '#24a040';
        c.beginPath(); c.moveTo(cx - 1, cy + 8); c.lineTo(cx - 15, cy - 2); c.lineTo(cx + 1, cy + 6); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(cx + 1, cy + 7); c.lineTo(cx + 15, cy - 2); c.lineTo(cx - 1, cy + 6); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(cx, cy + 6); c.lineTo(cx - 2, cy - 6); c.lineTo(cx + 2, cy + 4); c.closePath(); c.fill();
        // Voyage number badge
        const col = done ? '#f0c030' : sel ? '#00e8d0' : '#0a4060';
        c.fillStyle = col; c.beginPath(); c.arc(cx, cy - 8, 13, 0, Math.PI * 2); c.fill();
        c.strokeStyle = done ? '#c89820' : sel ? '#00b8a0' : '#1a6a8a';
        c.lineWidth = 2; c.beginPath(); c.arc(cx, cy - 8, 13, 0, Math.PI * 2); c.stroke();
        api.txtC('' + (i + 1), cx, cy - 13, 10, done ? '#3a1a04' : sel ? '#003830' : '#e8f8ff', true);
        // Small scroll label
        const nw = Math.min(ch.name.length * 5 + 8, 62);
        const nx = cx - nw / 2;
        c.fillStyle = '#e8c860'; c.fillRect(nx, cy + 26, nw, 11);
        c.strokeStyle = '#8a6010'; c.lineWidth = 1; c.strokeRect(nx, cy + 26, nw, 11);
        api.txtC(ch.name, cx, cy + 28, 6, '#3a1a04');
        if (done) {
          c.strokeStyle = '#f0c030'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(cx - 7, cy - 9); c.lineTo(cx - 2, cy - 4); c.lineTo(cx + 7, cy - 16); c.stroke();
        }
      },
      colors: {
        bg: '#0c2a40', title: '#f0c030', label: '#c8e8f8', cur: '#00e8d0', done: '#f0c030',
      },
    },
    finale: [
      'SINBAD DROPS ANCHOR', 'IN HIS HOME PORT OF BASRA.', '',
      'HIS PALACE GLEAMS', 'WITH SEVEN SEAS OF SPOILS.', '',
      'ALL WHO HEAR HIS TALES', 'ARE RICHER FOR THE HEARING.',
    ],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#f0c030', teal: '#00c8e0', ruby: '#cc2244', indigo: '#1a1a6a', sand: '#e8c890' },

    chapters: [

      /* ==================== 1. WHALE ISLAND — dodge + survive ==================== */
      {
        id: 'whale', name: 'WHALE ISLAND', sub: 'THE SEA STIRS BENEATH',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.fillStyle = '#0a6090';
          c.beginPath(); c.moveTo(x - 10, y + 2); c.lineTo(x + 4, y - 6); c.lineTo(x + 8, y + 2); c.lineTo(x + 4, y + 8); c.closePath(); c.fill();
          g.rect(x - 1, y - 13, 2, 10, '#80d0f0');
          g.circle(x, y - 15, 4, '#b0e8ff');
        },
        intro: [
          'SINBAD AND HIS SAILORS',
          'LAND ON WHAT SEEMS',
          'A LUSH GREEN ISLAND —',
          'but the ground trembles.',
          '',
          'IT IS A SLEEPING WHALE.',
        ],
        quote: '"Scarcely had they landed than the island moved, and the Merchants cried out: Fly! It is a fish, not land!"',
        help: 'LEFT / RIGHT to dodge spouts · collect CRATES',
        winText: 'Sinbad seizes a floating timber and rides the waves to safety. The whale vanishes into the deep.',
        loseText: 'The whale dives. The cold sea closes over everything.',
        init(api) {
          this.sx = api.W / 2;
          this.sy = api.H - 88;
          this.spouts = [];
          this.crates = [];
          this.spoutT = 0;
          this.crateT = 0;
          this.lives = 3;
          this.caught = 0;
          this.elapsed = 0;
          this.duration = 22;
          this.invuln = 0;
          this.waveT = 0;
        },
        update(api, dt) {
          this.elapsed += dt;
          this.waveT += dt;
          if (this.invuln > 0) this.invuln -= dt;
          // Move Sinbad
          const spd = 95;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < this.sx - 18)) this.sx -= spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > this.sx + 18)) this.sx += spd * dt;
          this.sx = clamp(this.sx, 14, api.W - 14);
          // Spawn spouts
          this.spoutT += dt;
          const spoutRate = Math.max(1.0, 2.2 - this.elapsed * 0.04);
          if (this.spoutT > spoutRate) {
            this.spoutT = 0;
            this.spouts.push({ x: 22 + Math.random() * (api.W - 44), h: 0, maxH: 60 + Math.random() * 50, phase: 0, life: 2.0 });
          }
          // Spawn crates
          this.crateT += dt;
          if (this.crateT > 2.2) {
            this.crateT = 0;
            this.crates.push({ x: 18 + Math.random() * (api.W - 36), y: -12, vy: 38 + Math.random() * 20 });
          }
          // Update spouts
          for (let i = this.spouts.length - 1; i >= 0; i--) {
            const s = this.spouts[i];
            s.life -= dt; s.phase += dt * 3;
            if (s.life > 0.65) s.h = Math.min(s.maxH, s.h + s.maxH * dt / 0.45);
            else               s.h = Math.max(0, s.h - s.maxH * dt / 0.35);
            if (s.h < 2) { this.spouts.splice(i, 1); continue; }
            if (this.invuln <= 0 && Math.abs(s.x - this.sx) < 14 && s.h > 28) {
              this.lives--;
              this.invuln = 1.3;
              api.audio.sfx('hurt'); api.shake(4, 0.2);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          // Update crates
          for (let i = this.crates.length - 1; i >= 0; i--) {
            const cr = this.crates[i];
            cr.y += cr.vy * dt;
            if (cr.y > api.H + 20) { this.crates.splice(i, 1); continue; }
            if (Math.abs(cr.x - this.sx) < 18 && Math.abs(cr.y - this.sy) < 18) {
              this.caught++; this.crates.splice(i, 1);
              api.addScore(25); api.audio.sfx('coin');
              api.burst(cr.x, cr.y, '#f0c030', 6);
            }
          }
          if (this.elapsed >= this.duration) { api.addScore(80 + this.caught * 8); api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#060e20'; c.fillRect(0, 0, W, H);
          // Whale body / "island"
          const bob = Math.sin(this.waveT * 0.85) * 4;
          c.fillStyle = '#0a3a5a';
          c.beginPath();
          c.moveTo(8, H - 48 + bob);
          c.quadraticCurveTo(W * 0.28, H - 78 + bob, W / 2, H - 58 + bob);
          c.quadraticCurveTo(W * 0.72, H - 40 + bob, W - 8, H - 52 + bob);
          c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
          // Island greenery
          c.fillStyle = '#1a5a20';
          for (let i = 0; i < 5; i++) {
            const tx = 28 + i * 50, ty = H - 62 + bob;
            c.beginPath(); c.arc(tx, ty, 11, 0, Math.PI * 2); c.fill();
          }
          g.circle(W * 0.33, H - 66 + bob, 4, '#1a7090'); // blowhole
          // Sea surface
          c.lineWidth = 1.5;
          for (let row = 0; row < 3; row++) {
            const wy = H - 28 + row * 11;
            c.strokeStyle = 'rgba(26,90,138,' + (0.45 - row * 0.1) + ')';
            c.beginPath();
            for (let x = 0; x <= W; x += 5) {
              const y = wy + Math.sin(x * 0.07 + this.waveT * 1.8 + row) * 3;
              if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
            }
            c.stroke();
          }
          c.fillStyle = '#0a2a44'; c.fillRect(0, H - 24, W, 24);
          // Spouts
          for (const s of this.spouts) {
            c.globalAlpha = 0.65 + 0.35 * Math.sin(s.phase);
            g.rect(s.x - 5, H - 57 - s.h, 10, s.h, '#60c0f0');
            g.circle(s.x, H - 57 - s.h, 7 + Math.sin(s.phase) * 2, '#90d8ff');
            c.globalAlpha = 1;
          }
          // Crates
          for (const cr of this.crates) {
            g.rect(cr.x - 7, cr.y - 7, 14, 14, '#8a5a10');
            g.rect(cr.x - 7, cr.y - 2, 14, 2, '#c89820');
            g.rect(cr.x - 2, cr.y - 7, 2, 14, '#c89820');
          }
          // Sinbad (flashing when invuln)
          if (!(this.invuln > 0 && Math.sin(api.t * 20) > 0)) {
            g.rect(this.sx - 4, this.sy - 18, 8, 8, '#e8c080');
            g.rect(this.sx - 5, this.sy - 20, 10, 4, '#cc2244');
            g.rect(this.sx - 5, this.sy - 10, 10, 12, '#2244cc');
            g.rect(this.sx - 5, this.sy + 2, 5, 6, '#1a1a4a');
            g.rect(this.sx + 0, this.sy + 2, 5, 6, '#1a1a4a');
          }
          // HUD
          api.topBar('WHALE ISLAND');
          const tl = Math.max(0, Math.ceil(this.duration - this.elapsed));
          api.txt('CRATES ' + this.caught, 6, 20, 8, '#f0c030');
          api.txt(tl + 's', W - 28, 20, 8, tl < 7 ? '#cc2244' : '#e8f0ff');
          for (let l = 0; l < 3; l++) g.rect(6 + l * 14, 30, 10, 10, l < this.lives ? '#cc2244' : '#2a0a10');
          g.rect(6, 42, W - 12, 4, '#0a2a40');
          g.rect(6, 42, Math.round((W - 12) * this.elapsed / this.duration), 4, '#00c8e0');
          api.vignette(); api.scanlines();
        },
      },

      /* ==================== 2. VALLEY OF GEMS — collect + dodge ==================== */
      {
        id: 'gems', name: 'VALLEY OF GEMS', sub: 'CATCH THE FALLING JEWELS',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.fillStyle = '#00d4ff';
          c.beginPath(); c.moveTo(x, y - 10); c.lineTo(x + 8, y); c.lineTo(x, y + 10); c.lineTo(x - 8, y); c.closePath(); c.fill();
          c.strokeStyle = '#ffffff'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x, y - 10); c.lineTo(x + 8, y); c.lineTo(x, y + 10); c.lineTo(x - 8, y); c.closePath(); c.stroke();
          g.circle(x - 2, y - 2, 2, 'rgba(255,255,255,0.6)');
        },
        intro: [
          'THE VALLEY OF JEWELS',
          'LIES BEYOND THE CLIFFS.',
          'EAGLES CARRY DIAMONDS',
          'up from the valley floor.',
          '',
          'CATCH THEM BEFORE',
          'THE SERPENTS DO.',
        ],
        quote: '"The floor of the valley was paved with diamonds, but great serpents lay among them, each as thick as a palm tree."',
        help: 'LEFT / RIGHT to move · catch DIAMONDS · dodge SERPENTS',
        winText: 'Sinbad\'s pockets are heavy with diamonds. He ties himself to an eagle and soars free of the valley.',
        loseText: 'A serpent strikes from the shadows. The valley grows dark.',
        init(api) {
          this.sx = api.W / 2;
          this.sy = api.H - 80;
          this.gems = [];
          this.serpents = [];
          this.gemT = 0;
          this.serpT = 0;
          this.collected = 0;
          this.need = 10;
          this.lives = 3;
          this.invuln = 0;
          this.elapsed = 0;
        },
        update(api, dt) {
          this.elapsed += dt;
          if (this.invuln > 0) this.invuln -= dt;
          // Move Sinbad
          const spd = 90;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < this.sx - 18)) this.sx -= spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > this.sx + 18)) this.sx += spd * dt;
          this.sx = clamp(this.sx, 14, api.W - 14);
          // Spawn gems
          this.gemT += dt;
          const gemRate = Math.max(0.9, 2.0 - this.elapsed * 0.04);
          if (this.gemT > gemRate) {
            this.gemT = 0;
            this.gems.push({ x: 24 + Math.random() * (api.W - 48), y: -12, vy: 50 + Math.random() * 30 });
          }
          // Spawn serpents (side entry)
          this.serpT += dt;
          const serpRate = Math.max(1.4, 2.6 - this.elapsed * 0.05);
          if (this.serpT > serpRate) {
            this.serpT = 0;
            const left = Math.random() > 0.5;
            this.serpents.push({ x: left ? -20 : api.W + 20, y: api.H - 100 + Math.random() * 40, vx: left ? 65 : -65 });
          }
          // Update gems
          for (let i = this.gems.length - 1; i >= 0; i--) {
            const gem = this.gems[i];
            gem.y += gem.vy * dt;
            if (gem.y > api.H + 20) { this.gems.splice(i, 1); continue; }
            if (Math.abs(gem.x - this.sx) < 18 && Math.abs(gem.y - this.sy) < 20) {
              this.collected++; this.gems.splice(i, 1);
              api.addScore(40); api.audio.sfx('coin');
              api.burst(gem.x, gem.y, '#00d4ff', 8);
              if (this.collected >= this.need) { api.addScore(100); api.win(); return; }
            }
          }
          // Update serpents
          for (let i = this.serpents.length - 1; i >= 0; i--) {
            const s = this.serpents[i];
            s.x += s.vx * dt;
            if (s.x < -40 || s.x > api.W + 40) { this.serpents.splice(i, 1); continue; }
            if (this.invuln <= 0 && Math.abs(s.x - this.sx) < 20 && Math.abs(s.y - this.sy) < 18) {
              this.lives--;
              this.invuln = 1.2;
              api.audio.sfx('hurt'); api.shake(5, 0.2);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dark valley floor
          c.fillStyle = '#100c04'; c.fillRect(0, 0, W, H);
          // Sky opening at top (between cliffs)
          c.fillStyle = '#1a3060'; c.fillRect(34, 0, W - 68, 100);
          // Eagles soaring at top
          for (let i = 0; i < 3; i++) {
            const ex = ((api.t * (22 + i * 8) + i * 90) % (W - 70)) + 36;
            const ey = 18 + i * 16 + Math.sin(api.t * 0.9 + i) * 7;
            c.fillStyle = '#4a2a08';
            c.beginPath(); c.ellipse(ex, ey, 9, 3, 0, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.moveTo(ex - 10, ey); c.lineTo(ex - 20, ey - 6); c.lineTo(ex - 8, ey + 2); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(ex + 10, ey); c.lineTo(ex + 20, ey - 6); c.lineTo(ex + 8, ey + 2); c.closePath(); c.fill();
          }
          // Cliff walls
          c.fillStyle = '#2a1a08'; c.fillRect(0, 0, 34, H - 60); c.fillRect(W - 34, 0, 34, H - 60);
          // Rock striations on cliffs
          c.fillStyle = '#1e1208';
          for (let i = 0; i < 6; i++) { c.fillRect(4, 40 + i * 54, 26, 3); c.fillRect(W - 30, 40 + i * 54, 26, 3); }
          // Diamonds on ground
          for (let i = 0; i < 14; i++) {
            const dx = 38 + (i * 17) % (W - 76), dy = H - 48 + (i * 7) % 22;
            c.fillStyle = 'rgba(0,180,220,0.28)';
            c.beginPath(); c.moveTo(dx, dy - 4); c.lineTo(dx + 4, dy); c.lineTo(dx, dy + 4); c.lineTo(dx - 4, dy); c.closePath(); c.fill();
          }
          // Ground
          c.fillStyle = '#1a0e04'; c.fillRect(0, H - 56, W, 56);
          // Gems falling
          for (const gem of this.gems) {
            c.fillStyle = '#00d4ff';
            c.beginPath(); c.moveTo(gem.x, gem.y - 8); c.lineTo(gem.x + 7, gem.y); c.lineTo(gem.x, gem.y + 8); c.lineTo(gem.x - 7, gem.y); c.closePath(); c.fill();
            c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(gem.x, gem.y - 8); c.lineTo(gem.x + 7, gem.y); c.lineTo(gem.x, gem.y + 8); c.lineTo(gem.x - 7, gem.y); c.closePath(); c.stroke();
            g.circle(gem.x - 2, gem.y - 2, 2, 'rgba(255,255,255,0.5)');
          }
          // Serpents
          for (const s of this.serpents) {
            const dir = s.vx > 0 ? 1 : -1;
            c.fillStyle = '#1e6618';
            c.beginPath(); c.ellipse(s.x, s.y, 18, 6, 0, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.ellipse(s.x - dir * 14, s.y - 1, 8, 5, 0, 0, Math.PI * 2); c.fill();
            g.circle(s.x - dir * 22, s.y - 4, 6, '#154814');
            g.circle(s.x - dir * 25, s.y - 6, 2, '#f0f020'); // eye
            // Forked tongue
            c.strokeStyle = '#ff3060'; c.lineWidth = 1;
            const tx = s.x - dir * 28;
            c.beginPath(); c.moveTo(tx, s.y - 4); c.lineTo(tx - dir * 5, s.y - 6); c.stroke();
            c.beginPath(); c.moveTo(tx, s.y - 4); c.lineTo(tx - dir * 5, s.y - 2); c.stroke();
          }
          // Sinbad
          if (!(this.invuln > 0 && Math.sin(api.t * 20) > 0)) {
            g.rect(this.sx - 4, this.sy - 18, 8, 8, '#e8c080');
            g.rect(this.sx - 5, this.sy - 20, 10, 4, '#cc2244');
            g.rect(this.sx - 5, this.sy - 10, 10, 12, '#2244cc');
            g.rect(this.sx - 5, this.sy + 2, 4, 6, '#1a1a4a');
            g.rect(this.sx + 1, this.sy + 2, 4, 6, '#1a1a4a');
          }
          // HUD
          api.topBar('VALLEY OF GEMS');
          api.txt('GEMS ' + this.collected + '/' + this.need, 6, 20, 8, '#00d4ff');
          for (let l = 0; l < 3; l++) g.rect(6 + l * 14, 30, 10, 10, l < this.lives ? '#cc2244' : '#2a0a10');
          // Gem progress bar
          g.rect(6, 42, W - 12, 4, '#0a1820');
          g.rect(6, 42, Math.round((W - 12) * this.collected / this.need), 4, '#00d4ff');
          api.vignette(); api.scanlines();
        },
      },

      /* ==================== 3. ROC'S FLIGHT — dodge from above ==================== */
      {
        id: 'roc', name: "ROC'S FLIGHT", sub: 'CLING AND SURVIVE',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.fillStyle = '#4a2a08';
          c.beginPath(); c.ellipse(x, y - 2, 10, 4, 0, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.moveTo(x - 12, y - 2); c.lineTo(x - 22, y - 10); c.lineTo(x - 10, y + 2); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(x + 12, y - 2); c.lineTo(x + 22, y - 10); c.lineTo(x + 10, y + 2); c.closePath(); c.fill();
          g.circle(x + 8, y - 5, 2, '#f0c030');
        },
        intro: [
          'SINBAD TIES HIMSELF',
          'TO THE GREAT ROC\'S LEG',
          'AND SOARS SKYWARD',
          'on wings like a ship\'s sail.',
          '',
          'AVOID THE ROCKS',
          'AND STORM CLOUDS.',
        ],
        quote: '"I tied my turban to the Roc\'s foot. At dawn it flew up, carrying me until I thought I had reached the stars."',
        help: 'LEFT / RIGHT to dodge · collect FEATHERS for bonus',
        winText: 'The Roc circles down to a distant cliffside. Sinbad unties himself, breathless, into the open air.',
        loseText: 'A cliff strikes hard. Sinbad\'s grip gives way.',
        init(api) {
          this.sx = api.W / 2;
          this.sy = api.H - 90;
          this.obstacles = [];
          this.feathers = [];
          this.obstT = 0;
          this.featT = 0;
          this.lives = 3;
          this.invuln = 0;
          this.elapsed = 0;
          this.duration = 20;
        },
        update(api, dt) {
          this.elapsed += dt;
          if (this.invuln > 0) this.invuln -= dt;
          // Move Sinbad
          const spd = 110;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < this.sx - 16)) this.sx -= spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > this.sx + 16)) this.sx += spd * dt;
          this.sx = clamp(this.sx, 14, api.W - 14);
          // Spawn obstacles — rocks and cloud puffs fall from sky
          this.obstT += dt;
          const obstRate = Math.max(0.6, 1.4 - this.elapsed * 0.03);
          if (this.obstT > obstRate) {
            this.obstT = 0;
            const type = Math.random() > 0.45 ? 'rock' : 'cloud';
            const spd2 = 80 + this.elapsed * 3;
            this.obstacles.push({ x: 20 + Math.random() * (api.W - 40), y: -22, vy: Math.min(spd2, 180), type });
          }
          // Spawn feathers (collectibles)
          this.featT += dt;
          if (this.featT > 3.0) { this.featT = 0; this.feathers.push({ x: 22 + Math.random() * (api.W - 44), y: -16, vy: 50 }); }
          // Update obstacles
          for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.y += o.vy * dt;
            if (o.y > api.H + 30) { this.obstacles.splice(i, 1); continue; }
            const hw = o.type === 'rock' ? 13 : 20;
            if (this.invuln <= 0 && Math.abs(o.x - this.sx) < hw && Math.abs(o.y - this.sy) < hw) {
              this.lives--; this.invuln = 1.1;
              api.audio.sfx('hurt'); api.shake(5, 0.25);
              this.obstacles.splice(i, 1);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          // Update feathers
          for (let i = this.feathers.length - 1; i >= 0; i--) {
            const f = this.feathers[i];
            f.y += f.vy * dt;
            if (f.y > api.H + 20) { this.feathers.splice(i, 1); continue; }
            if (Math.abs(f.x - this.sx) < 16 && Math.abs(f.y - this.sy) < 16) {
              api.addScore(30); api.audio.sfx('coin'); api.burst(f.x, f.y, '#f0c030', 5);
              this.feathers.splice(i, 1);
            }
          }
          if (this.elapsed >= this.duration) { api.addScore(100); api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Daytime sky
          const sky = c.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#0a1860'); sky.addColorStop(0.4, '#1a4898'); sky.addColorStop(1, '#3080c0');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          // Sun
          g.circle(W * 0.82, 38, 20, '#f8d040');
          c.globalAlpha = 0.14; g.circle(W * 0.82, 38, 34, '#f8d040'); c.globalAlpha = 1;
          // Background clouds
          c.fillStyle = 'rgba(255,255,255,0.10)';
          for (let i = 0; i < 5; i++) {
            const cx2 = ((api.t * 16 + i * 64) % (W + 90)) - 45;
            const cy2 = 55 + i * 50;
            c.beginPath(); c.ellipse(cx2, cy2, 30 + i * 4, 12, 0, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.ellipse(cx2 + 20, cy2 - 5, 18, 9, 0, 0, Math.PI * 2); c.fill();
          }
          // The Roc above (silhouette at very top)
          const rx = W / 2 + Math.sin(api.t * 0.6) * 14;
          const flap = Math.sin(api.t * 2.8) * 0.3;
          c.fillStyle = '#18080a';
          c.beginPath(); c.ellipse(rx, -6, 22, 8, 0, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.moveTo(rx - 22, -8); c.lineTo(rx - 62, -22 + flap * 28); c.lineTo(rx - 20, 0); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(rx + 22, -8); c.lineTo(rx + 62, -22 + flap * 28); c.lineTo(rx + 20, 0); c.closePath(); c.fill();
          // Rope/turban from Roc's foot to Sinbad
          c.strokeStyle = '#c89820'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(rx, 2); c.lineTo(this.sx, this.sy - 16); c.stroke();
          // Obstacles
          for (const o of this.obstacles) {
            if (o.type === 'rock') {
              c.fillStyle = '#5a4a30';
              c.beginPath(); c.moveTo(o.x - 12, o.y + 12); c.lineTo(o.x - 8, o.y - 10); c.lineTo(o.x + 9, o.y - 8); c.lineTo(o.x + 13, o.y + 12); c.closePath(); c.fill();
              c.fillStyle = '#3a2a18'; c.fillRect(o.x - 10, o.y - 6, 4, 4);
            } else {
              c.globalAlpha = 0.55; c.fillStyle = '#e8f0ff';
              c.beginPath(); c.ellipse(o.x, o.y, 22, 10, 0, 0, Math.PI * 2); c.fill();
              c.beginPath(); c.ellipse(o.x - 13, o.y - 5, 14, 7, 0, 0, Math.PI * 2); c.fill();
              c.beginPath(); c.ellipse(o.x + 13, o.y - 4, 12, 6, 0, 0, Math.PI * 2); c.fill();
              c.globalAlpha = 1;
            }
          }
          // Feathers
          for (const f of this.feathers) {
            c.strokeStyle = '#f0c030'; c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(f.x, f.y - 8); c.quadraticCurveTo(f.x + 6, f.y, f.x, f.y + 8); c.stroke();
          }
          // Sinbad (clinging with arms raised)
          if (!(this.invuln > 0 && Math.sin(api.t * 20) > 0)) {
            g.rect(this.sx - 8, this.sy - 28, 4, 14, '#2244cc');
            g.rect(this.sx + 4, this.sy - 28, 4, 14, '#2244cc');
            g.rect(this.sx - 4, this.sy - 20, 8, 8, '#e8c080');
            g.rect(this.sx - 5, this.sy - 22, 10, 4, '#cc2244');
            g.rect(this.sx - 5, this.sy - 12, 10, 12, '#2244cc');
            g.rect(this.sx - 5, this.sy, 4, 8, '#1a1a4a');
            g.rect(this.sx + 1, this.sy, 4, 8, '#1a1a4a');
          }
          // HUD
          api.topBar("ROC'S FLIGHT");
          const tl = Math.max(0, Math.ceil(this.duration - this.elapsed));
          api.txt(tl + 's', W / 2 - 8, 20, 8, tl < 6 ? '#cc2244' : '#e8f0ff');
          for (let l = 0; l < 3; l++) g.rect(6 + l * 14, 20, 10, 10, l < this.lives ? '#cc2244' : '#2a0a10');
          g.rect(6, 32, W - 12, 4, '#0a1830');
          g.rect(6, 32, Math.round((W - 12) * this.elapsed / this.duration), 4, '#00c8e0');
          api.vignette(); api.scanlines();
        },
      },

      /* ==================== 4. OLD MAN OF THE SEA — collect grapes ==================== */
      {
        id: 'oldman', name: 'OLD MAN OF SEA', sub: 'BREW WINE, WIN FREEDOM',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.circle(x, y + 2, 7, '#8030b0');
          g.circle(x - 5, y - 3, 6, '#8030b0');
          g.circle(x + 5, y - 3, 6, '#8030b0');
          g.circle(x, y - 8, 6, '#6020a0');
          g.rect(x - 1, y - 15, 2, 8, '#2a6010');
        },
        intro: [
          'ON A DESERT ISLAND,',
          'A WITHERED OLD MAN',
          'CLIMBS ONTO SINBAD\'S SHOULDERS',
          'and will not let go.',
          '',
          'COLLECT GRAPES, BREW',
          'WINE, TRICK HIM FREE.',
        ],
        quote: '"I made wine from the grapes and gave it to him. He drank deep, grew merry, relaxed his grip — and I flung him to the ground."',
        help: 'LEFT / RIGHT to collect GRAPES · fill the wine jar',
        winText: 'The Old Man topples, snoring softly in the vines. Sinbad runs laughing across the empty beach.',
        loseText: 'The Old Man\'s iron grip tightens. Sinbad\'s knees buckle at last.',
        init(api) {
          this.sx = api.W / 2;
          this.sy = api.H - 90;
          this.grapes = [];
          this.grapeT = 0;
          this.rocks = [];
          this.wineLevel = 0;
          this.wineNeed = 8;
          this.lives = 3;
          this.invuln = 0;
          this.elapsed = 0;
          this.oldManAnger = false; // rocks start when wine >= 5
        },
        update(api, dt) {
          this.elapsed += dt;
          if (this.invuln > 0) this.invuln -= dt;
          // Move Sinbad (slightly slower — carrying Old Man)
          const spd = 78;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < this.sx - 18)) this.sx -= spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > this.sx + 18)) this.sx += spd * dt;
          this.sx = clamp(this.sx, 14, api.W - 14);
          // Spawn grape clusters
          this.grapeT += dt;
          if (this.grapeT > 1.5 && this.grapes.length < 5) {
            this.grapeT = 0;
            this.grapes.push({ x: 22 + Math.random() * (api.W - 44), y: api.H * 0.28 + Math.random() * (api.H * 0.42), bob: Math.random() * Math.PI * 2 });
          }
          // Collect grapes
          for (let i = this.grapes.length - 1; i >= 0; i--) {
            const gr = this.grapes[i];
            gr.bob += dt * 1.6;
            if (Math.abs(gr.x - this.sx) < 18 && Math.abs(gr.y - (this.sy + 2)) < 20) {
              this.wineLevel++;
              api.addScore(35); api.audio.sfx('coin');
              api.burst(gr.x, gr.y, '#9040b0', 7);
              this.grapes.splice(i, 1);
              if (this.wineLevel >= this.wineNeed) { api.addScore(120); api.win(); return; }
            }
          }
          // Old Man anger: drops rocks when wine level >= 5
          if (this.wineLevel >= 5) {
            if (Math.random() < 0.012) {
              this.rocks.push({ x: this.sx + (Math.random() - 0.5) * 90, y: -14, vy: 85 + Math.random() * 40 });
            }
          }
          for (let i = this.rocks.length - 1; i >= 0; i--) {
            const r = this.rocks[i];
            r.y += r.vy * dt;
            if (r.y > api.H + 20) { this.rocks.splice(i, 1); continue; }
            if (this.invuln <= 0 && Math.abs(r.x - this.sx) < 12 && Math.abs(r.y - this.sy) < 12) {
              this.lives--; this.invuln = 1.1;
              api.audio.sfx('hurt'); api.shake(3, 0.15);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Tropical island
          const sky = c.createLinearGradient(0, 0, 0, H * 0.65);
          sky.addColorStop(0, '#1a3870'); sky.addColorStop(1, '#2a7ab0');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.65);
          // Sun
          g.circle(W * 0.18, 44, 18, '#f8d040'); c.globalAlpha = 0.12; g.circle(W * 0.18, 44, 32, '#f8d040'); c.globalAlpha = 1;
          // Sandy ground
          c.fillStyle = '#c0a040'; c.fillRect(0, H * 0.62, W, H * 0.38);
          c.fillStyle = '#dcc060'; c.fillRect(0, H * 0.62, W, 5);
          // Vine plants
          c.strokeStyle = '#2a6010'; c.lineWidth = 2;
          for (let i = 0; i < 7; i++) {
            const vx = i * 40 + 14, vy = H * 0.62;
            c.beginPath(); c.moveTo(vx, vy); c.quadraticCurveTo(vx + 10, vy - 32, vx + (i % 2 ? 22 : -22), vy - 54); c.stroke();
          }
          // Grapes
          for (const gr of this.grapes) {
            const bob = Math.sin(gr.bob) * 3;
            g.circle(gr.x, gr.y + bob, 7, '#8030b0');
            g.circle(gr.x - 5, gr.y - 4 + bob, 5, '#8030b0');
            g.circle(gr.x + 5, gr.y - 4 + bob, 5, '#8030b0');
            g.circle(gr.x, gr.y - 9 + bob, 5, '#6020a0');
            g.rect(gr.x - 1, gr.y - 16 + bob, 2, 7, '#2a6010');
          }
          // Falling rocks (old man angry)
          for (const r of this.rocks) {
            c.fillStyle = '#6a4a28';
            c.beginPath(); c.moveTo(r.x - 7, r.y + 6); c.lineTo(r.x - 4, r.y - 6); c.lineTo(r.x + 6, r.y - 4); c.lineTo(r.x + 8, r.y + 6); c.closePath(); c.fill();
          }
          // Sinbad + Old Man riding shoulders
          if (!(this.invuln > 0 && Math.sin(api.t * 20) > 0)) {
            const sx = this.sx, sy = this.sy;
            const sway = Math.sin(api.t * 2.4) * 3;
            // Sinbad legs (wobbling under weight)
            g.rect(sx - 5, sy + 2, 4, 8, '#1a1a4a');
            g.rect(sx + 1, sy + 2, 4, 8, '#1a1a4a');
            // Sinbad body
            g.rect(sx - 5, sy - 10, 10, 12, '#2244cc');
            g.rect(sx - 4, sy - 18, 8, 8, '#e8c080');
            g.rect(sx - 5, sy - 20, 10, 4, '#cc2244');
            // Old Man on shoulders
            const ox = sx + sway * 0.4, oy = sy - 34;
            // Old Man legs wrapped around Sinbad's neck
            g.rect(sx - 11, sy - 18, 6, 8, '#8a6848');
            g.rect(sx + 5, sy - 18, 6, 8, '#8a6848');
            // Old Man body
            g.rect(ox - 4, oy - 12, 8, 12, '#8a6848');
            g.circle(ox, oy - 16, 7, '#b8946a');
            // Old Man arms gesturing
            g.rect(ox + 6, oy - 11, 8, 3, '#b8946a');
            if (this.wineLevel >= 5) {
              // Old Man flailing (angry) — wiggle arms
              g.rect(ox - 14, oy - 13 + Math.round(Math.sin(api.t * 8) * 2), 8, 3, '#b8946a');
            }
          }
          // HUD
          api.topBar('OLD MAN OF THE SEA');
          api.txt('GRAPES ' + this.wineLevel + '/' + this.wineNeed, 6, 20, 8, '#9040b0');
          // Wine jar fill indicator
          const jx = W - 36, jy = 18;
          c.fillStyle = '#3a1a04'; c.fillRect(jx, jy, 24, 18);
          const fill = Math.round(16 * this.wineLevel / this.wineNeed);
          c.fillStyle = '#7020a0'; c.fillRect(jx + 2, jy + 18 - fill, 20, fill);
          c.strokeStyle = '#c89820'; c.lineWidth = 1; c.strokeRect(jx, jy, 24, 18);
          for (let l = 0; l < 3; l++) g.rect(6 + l * 14, 30, 10, 10, l < this.lives ? '#cc2244' : '#2a0a10');
          api.vignette(); api.scanlines();
        },
      },

      /* ==================== 5. FINAL VOYAGE — shmup shooter ==================== */
      {
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
          'ON THE SEVENTH VOYAGE',
          'SINBAD SAILS INTO',
          'SEAS OF MONSTERS.',
          '',
          'FIRE THE CANNONS,',
          'STEER THE SHIP,',
          'BRING THE CREW HOME.',
        ],
        quote: '"I set sail once more, and the sea rose against me like mountains. Yet I did not despair, for Providence was with us."',
        help: 'LEFT / RIGHT to steer · TAP / A / UP to fire cannons',
        winText: 'The last monster sinks in a cascade of foam. Sinbad\'s ship limps into Basra harbour, hold bursting with treasure.',
        loseText: 'The monsters overwhelm the ship. The sea swallows her whole, mast and all.',
        init(api) {
          this.ship = { x: api.W / 2, y: api.H - 76 };
          this.bullets = [];
          this.monsters = [];
          this.monsterT = 0;
          this.cannonCD = 0;
          this.kills = 0;
          this.need = 10;
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
          // Steer ship
          const spd = 100;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < this.ship.x - 18)) this.ship.x -= spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > this.ship.x + 18)) this.ship.x += spd * dt;
          this.ship.x = clamp(this.ship.x, 22, api.W - 22);
          // Fire
          if ((api.confirm() || api.keyDown('up') || api.keyDown('a')) && this.cannonCD <= 0) {
            this.cannonCD = 0.38;
            this.bullets.push({ x: this.ship.x, y: this.ship.y - 22, vy: -230 });
            api.audio.sfx('shoot');
          }
          // Update bullets
          for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.y += b.vy * dt;
            if (b.y < -12) { this.bullets.splice(i, 1); continue; }
            let hit = false;
            for (let m = this.monsters.length - 1; m >= 0; m--) {
              const mon = this.monsters[m];
              if (Math.abs(b.x - mon.x) < 22 && Math.abs(b.y - mon.y) < 20) {
                api.burst(b.x, b.y, '#f0c030', 7); api.audio.sfx('explode');
                mon.hp--;
                if (mon.hp <= 0) {
                  api.burst(mon.x, mon.y, '#cc4422', 12);
                  this.monsters.splice(m, 1);
                  this.kills++; api.addScore(50); api.shake(3, 0.15);
                }
                hit = true; break;
              }
            }
            if (hit) { this.bullets.splice(i, 1); }
          }
          // Spawn monsters
          this.monsterT += dt;
          const mRate = Math.max(1.4, 3.2 - this.kills * 0.12);
          if (this.monsterT > mRate) {
            this.monsterT = 0;
            const big = this.kills > 5 && Math.random() > 0.55;
            this.monsters.push({
              x: 24 + Math.random() * (api.W - 48), y: 40 + Math.random() * 80,
              vy: 20 + Math.random() * 15, sway: Math.random() * Math.PI * 2,
              type: big ? 'kraken' : 'serpent', hp: big ? 3 : 2,
            });
          }
          // Update monsters
          for (let i = this.monsters.length - 1; i >= 0; i--) {
            const mon = this.monsters[i];
            mon.y += mon.vy * dt;
            mon.sway += dt * 1.4;
            mon.x += Math.sin(mon.sway) * 38 * dt;
            mon.x = clamp(mon.x, 20, api.W - 20);
            if (mon.y > api.H + 30) { this.monsters.splice(i, 1); continue; }
            if (this.invuln <= 0 && Math.abs(mon.x - this.ship.x) < 28 && Math.abs(mon.y - this.ship.y) < 26) {
              this.lives--; this.invuln = 1.2;
              api.audio.sfx('hurt'); api.shake(6, 0.3);
              this.monsters.splice(i, 1);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          if (this.kills >= this.need) { api.addScore(150); api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Night sea
          const sky = c.createLinearGradient(0, 0, 0, H * 0.52);
          sky.addColorStop(0, '#060820'); sky.addColorStop(1, '#0a1840');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.52);
          // Stars
          for (let i = 0; i < 32; i++) {
            const sx2 = (i * 81 + 11) % W, sy2 = (i * 43 + 7) % (H * 0.42);
            c.globalAlpha = 0.5 + 0.5 * Math.sin(api.t + i * 0.7);
            g.rect(sx2, sy2, 1, 1, '#e8f0ff');
          }
          c.globalAlpha = 1;
          // Sea
          const sea = c.createLinearGradient(0, H * 0.42, 0, H);
          sea.addColorStop(0, '#0c3a5a'); sea.addColorStop(1, '#060e20');
          c.fillStyle = sea; c.fillRect(0, H * 0.42, W, H * 0.58);
          // Wave lines
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
          // Monsters
          for (const mon of this.monsters) {
            if (mon.type === 'serpent') {
              c.fillStyle = '#1a6618';
              c.beginPath(); c.ellipse(mon.x, mon.y, 14, 7, Math.sin(mon.sway) * 0.3, 0, Math.PI * 2); c.fill();
              g.circle(mon.x + 13, mon.y - 4, 7, '#0a4810');
              g.circle(mon.x + 16, mon.y - 6, 2, '#f0f030');
              c.strokeStyle = '#ff3060'; c.lineWidth = 1;
              c.beginPath(); c.moveTo(mon.x + 20, mon.y - 4); c.lineTo(mon.x + 24, mon.y - 6); c.stroke();
              c.beginPath(); c.moveTo(mon.x + 20, mon.y - 4); c.lineTo(mon.x + 24, mon.y - 2); c.stroke();
              for (let h = 0; h < mon.hp; h++) g.rect(mon.x - 6 + h * 6, mon.y - 18, 4, 4, '#cc2244');
            } else {
              // Kraken
              c.fillStyle = '#4a0a4a';
              c.beginPath(); c.ellipse(mon.x, mon.y, 18, 12, 0, 0, Math.PI * 2); c.fill();
              for (let ti = 0; ti < 6; ti++) {
                const ta = (ti / 6) * Math.PI * 2 + mon.sway;
                const tx = mon.x + Math.cos(ta) * 22, ty = mon.y + 8 + Math.sin(ta) * 10;
                g.rect(tx - 3, ty - 12, 5, 14, '#38083a');
              }
              g.circle(mon.x - 6, mon.y - 4, 3, '#ff4000');
              g.circle(mon.x + 6, mon.y - 4, 3, '#ff4000');
              for (let h = 0; h < mon.hp; h++) g.rect(mon.x - 9 + h * 6, mon.y - 22, 4, 4, '#cc2244');
            }
          }
          // Cannonballs
          for (const b of this.bullets) {
            c.globalAlpha = 0.35; g.circle(b.x, b.y, 7, '#f0c030'); c.globalAlpha = 1;
            g.circle(b.x, b.y, 4, '#f0c030');
          }
          // Ship
          const sx = this.ship.x, sy = this.ship.y;
          if (!(this.invuln > 0 && Math.sin(api.t * 20) > 0)) {
            c.fillStyle = '#5a2a08';
            c.beginPath(); c.moveTo(sx - 24, sy); c.lineTo(sx + 24, sy); c.lineTo(sx + 20, sy + 14); c.lineTo(sx - 20, sy + 14); c.closePath(); c.fill();
            g.rect(sx - 1, sy - 38, 2, 38, '#8a5a20');
            c.fillStyle = '#e8e0d0';
            c.beginPath(); c.moveTo(sx + 2, sy - 36); c.lineTo(sx + 22, sy - 18); c.lineTo(sx + 2, sy - 2); c.closePath(); c.fill();
            g.rect(sx - 22, sy + 2, 6, 4, '#2a1a08');
            g.rect(sx + 16, sy + 2, 6, 4, '#2a1a08');
            g.rect(sx + 2, sy - 38, 12, 8, '#cc2244'); // flag
          }
          // Cannon fire flash
          if (this.cannonCD > 0.28) {
            c.globalAlpha = 0.5; g.circle(sx, sy - 38, 10, '#f8e040'); c.globalAlpha = 1;
          }
          // HUD
          api.topBar('FINAL VOYAGE');
          api.txt('SLAIN ' + this.kills + '/' + this.need, 6, 20, 8, '#f0c030');
          for (let l = 0; l < 3; l++) g.rect(W - 48 + l * 14, 20, 10, 10, l < this.lives ? '#cc2244' : '#2a0a10');
          g.rect(6, 32, W - 12, 4, '#0a1830');
          g.rect(6, 32, Math.round((W - 12) * this.kills / this.need), 4, '#f0c030');
          api.vignette(); api.scanlines();
        },
      },

    ],
  });
})();
