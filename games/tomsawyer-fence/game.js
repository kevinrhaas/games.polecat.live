/* ============================================================================
 * TOM SAWYER — WHITEWASH & WONDER
 * Five chapters from Mark Twain's Adventures of Tom Sawyer (1876):
 *   1. THE FENCE        — convince passing kids to paint (tap-to-trick)
 *   2. THE GRAVEYARD    — midnight stealth: dodge Injun Joe's lantern
 *   3. JACKSON'S ISLAND — raft runner down the Mississippi
 *   4. MCDOUGAL'S CAVE  — maze: find Becky, escape before the candle dies
 *   5. THE TREASURE     — timing strike: dig up Injun Joe's buried gold
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  // ——— Tom's straw hat emblem ———
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    c.fillStyle = '#b89020';
    c.beginPath(); c.ellipse(cx, cy + 10, 26, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#c8a028';
    c.fillRect(cx - 14, cy - 10, 28, 22);
    c.fillStyle = '#2a600e';
    c.fillRect(cx - 14, cy + 6, 28, 5);
    c.fillStyle = '#e0c040';
    c.fillRect(cx - 12, cy - 8, 7, 2);
  }

  // ——— Scenery: sunny summer / parchment map ———
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Hand-drawn parchment treasure map
      const bg = c.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#f2d890'); bg.addColorStop(0.55, '#e8c870'); bg.addColorStop(1, '#d4b450');
      c.fillStyle = bg; c.fillRect(0, 0, W, H);
      // Parchment grain
      c.globalAlpha = 0.06; c.fillStyle = '#5a3a0c';
      for (let i = 0; i < 280; i++) c.fillRect((i * 73 + 11) % W, (i * 59 + 7) % H, 2, 2);
      c.globalAlpha = 1;
      // Mississippi River winding across map
      c.strokeStyle = '#5898d0'; c.lineWidth = 22; c.globalAlpha = 0.42;
      c.beginPath(); c.moveTo(0, 248); c.bezierCurveTo(48, 270, 96, 204, 148, 244);
      c.bezierCurveTo(196, 284, 226, 212, W, 256); c.stroke();
      c.globalAlpha = 1;
      c.globalAlpha = 0.3;
      api.txtC('MISSISSIPPI', 148, 232, 6, '#1a4a88', false);
      c.globalAlpha = 1;
      // Small map icons at chapter locations (rough coords matching layout)
      // Near fence (110, 129): fence posts
      g.rect(100, 122, 2, 10, '#8b5820'); g.rect(108, 120, 2, 12, '#8b5820');
      g.rect(116, 122, 2, 10, '#8b5820'); g.rect(98, 126, 22, 2, '#a06820');
      // Near graveyard (206, 195): cross
      g.rect(200, 182, 2, 14, '#6a7a78'); g.rect(196, 186, 10, 2, '#6a7a78');
      // Near island (58, 247): waves
      for (let wx = 0; wx < 3; wx++) {
        c.globalAlpha = 0.5;
        c.beginPath(); c.moveTo(42 + wx * 10, 250);
        c.quadraticCurveTo(47 + wx * 10, 244, 52 + wx * 10, 250); c.stroke();
      }
      c.globalAlpha = 1;
      // Near cave (210, 329): stalactite triangles
      c.fillStyle = '#7a6a5a';
      c.beginPath(); c.moveTo(204, 320); c.lineTo(208, 332); c.lineTo(212, 320); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(212, 318); c.lineTo(216, 330); c.lineTo(220, 318); c.closePath(); c.fill();
      // Near treasure (135, 409): X marks
      c.strokeStyle = '#8b4010'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(127, 402); c.lineTo(135, 412); c.stroke();
      c.beginPath(); c.moveTo(135, 402); c.lineTo(127, 412); c.stroke();
      // Compass rose (bottom right)
      const cr = W - 26, cry = H - 36;
      g.circle(cr, cry, 12, '#c8a030'); g.circle(cr, cry, 9, '#e8d080');
      api.txtC('N', cr, cry - 7, 6, '#5a3a0c', true);
      // Double border
      c.strokeStyle = '#8b5a20'; c.lineWidth = 6; c.strokeRect(3, 3, W - 6, H - 6);
      c.strokeStyle = '#6a3e10'; c.lineWidth = 2; c.strokeRect(8, 8, W - 16, H - 16);
      return;
    }

    // Title / intro / result: sunny summer backdrop
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#7ec0e8'); sky.addColorStop(0.65, '#aad8f0'); sky.addColorStop(1, '#c8f0a0');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    g.circle(W - 36, 34, 18, '#ffe060');
    c.globalAlpha = 0.14; g.circle(W - 36, 34, 28, '#ffe060'); c.globalAlpha = 1;
    for (let i = 0; i < 3; i++) {
      const bx = (t * 6 + i * 96) % (W + 64) - 32, by = 24 + i * 20;
      c.fillStyle = '#ffffff'; c.globalAlpha = 0.86;
      c.beginPath(); c.arc(bx, by, 11, 0, 7); c.arc(bx + 13, by - 5, 15, 0, 7); c.arc(bx + 26, by, 11, 0, 7); c.fill();
    }
    c.globalAlpha = 1;
    // Rolling green hills
    c.fillStyle = '#5a9a2a';
    c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W; x += 8)
      c.lineTo(x, H - 60 - Math.sin(x * 0.04) * 14 - Math.sin(x * 0.022 + 1) * 9);
    c.lineTo(W, H); c.closePath(); c.fill();
    c.fillStyle = '#4a8a1a';
    c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W; x += 8)
      c.lineTo(x, H - 34 - Math.sin(x * 0.06 + 2) * 7);
    c.lineTo(W, H); c.closePath(); c.fill();
    // Fence line in foreground
    for (let i = 0; i < 9; i++) {
      const fpx = i * 32;
      g.rect(fpx + 6, H - 60, 4, 24, '#d8c055');
      g.rect(fpx + 3, H - 66, 10, 8, '#d8c055');
      if (i < 8) g.rect(fpx + 10, H - 56, 22, 3, '#c8b040');
    }
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(8,18,4,.65)'; c.fillRect(0, 0, W, H);
    }
  }

  // ============================================================
  RetroSaga.create({
    id: 'tomsawyer',
    title: 'Tom Sawyer',
    subtitle: 'FIVE SUMMERS ON THE MISSISSIPPI',
    currency: 'MISCHIEF',
    screens: {
      win: '#c07810', lose: '#6a3408', chapterLabel: '#7a5818',
      name: '#2a1408', sub: '#a86010', intro: '#3a2208', quote: '#5a3a18',
      help: '#a86010', score: '#2a1408', cur: '#c07810', cta: '#2a1408',
      overlay: 'rgba(244,224,132,.88)',
    },
    labels: {
      chapter: 'TALE', score: 'MISCHIEF EARNED',
      win: 'SLICKER THAN PAINT', lose: 'CAUGHT IN THE ACT',
      cont: 'TAP TO CARRY ON', finale: 'TAP TO CLAIM THE GOLD',
      toMenu: 'TAP TO RETURN', play: 'TAP TO COMMENCE',
    },
    accent: '#c07810',
    credit: 'AN 8-BIT TRIBUTE · MARK TWAIN, 1876',
    emblem,
    scenery,
    bootCta: 'TAP TO PLAY HOOKY',
    menuLabel: 'ADVENTURES OF TOM SAWYER',
    menuHint: 'CHOOSE YOUR TALE',
    menuDone: 'THE GOLD IS ALL YOURS',
    menu: {
      colors: { title: '#5a2808', label: '#8b5a20', cur: '#a86010' },
      // Non-list layout: chapter cards as location pins on the parchment map
      layout(api) {
        return [
          { x: 65, y: 102, w: 96, h: 54 },   // 1. FENCE — upper town area
          { x: 160, y: 170, w: 96, h: 54 },   // 2. GRAVEYARD — upper right hill
          { x: 8,  y: 222, w: 96, h: 54 },    // 3. JACKSON'S ISLAND — left, river
          { x: 162, y: 304, w: 96, h: 54 },   // 4. CAVE — lower right
          { x: 72,  y: 382, w: 126, h: 54 },  // 5. TREASURE — center bottom
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const mx = x + w / 2;
        // Parchment note card
        c.fillStyle = sel ? '#fff4c4' : '#ece0a0';
        c.fillRect(x, y, w, h);
        // Folded-corner effect (top-right)
        c.fillStyle = sel ? '#d8c060' : '#c8b048';
        c.beginPath(); c.moveTo(x + w - 10, y); c.lineTo(x + w, y); c.lineTo(x + w, y + 10); c.closePath(); c.fill();
        // Border
        c.strokeStyle = sel ? '#8b4510' : '#a87828'; c.lineWidth = sel ? 2 : 1; c.strokeRect(x, y, w, h);
        if (sel) { c.strokeStyle = '#c87a10'; c.lineWidth = 1; c.strokeRect(x + 2, y + 2, w - 4, h - 4); }
        // Number badge
        g.circle(x + 13, y + 13, 10, sel ? '#c87a10' : '#a86828');
        api.txtC('' + (i + 1), x + 13, y + 8, 8, '#f0e0b0', true);
        // Chapter name
        api.txtCFit(ch.name, mx + 5, y + 8, 8, '#2a1008', false, w - 24);
        if (ch.sub) api.txtCFit(ch.sub, mx + 5, y + 24, 7, '#7a5010', false, w - 18);
        if (done) api.txtC('✓', x + w - 8, y + h - 12, 9, '#1a8a10', true);
      },
    },
    finale: [
      'THE GOLD IS YOURS,', 'TOM SAWYER!',
      'RICHEST BOY IN', "ST. PETERSBURG.", '',
      "AUNT POLLY SMILES.",
    ],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#c07810', brown: '#8b4a0a', green: '#3a8a1a', blue: '#4a90d9' },

    chapters: [
      /* ====================== 1. THE FENCE ====================== */
      {
        id: 'fence', name: 'THE FENCE', sub: 'THE WHITEWASH SCHEME',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 10, y - 10, 4, 20, '#d4aa4a'); g.rect(x - 2, y - 10, 4, 20, '#d4aa4a');
          g.rect(x + 6, y - 10, 4, 20, '#d4aa4a');
          g.rect(x - 11, y - 6, 22, 3, '#e8cc6a'); g.rect(x - 11, y + 4, 22, 3, '#e8cc6a');
          g.rect(x + 10, y - 8, 3, 11, '#c8501a');
          g.rect(x + 9, y - 12, 5, 5, '#f0f0f0');
        },
        intro: [
          'AUNT POLLY HANDS TOM', 'A BUCKET OF WHITEWASH.', 'THIRTY YARDS OF FENCE!',
          '"Oh, my! This is a surprise."',
        ],
        quote: 'He had discovered a great law of human action: in order to make a man covet a thing, it is only necessary to make the thing difficult to attain.',
        help: 'TAP EACH KID TO TRICK THEM INTO PAINTING THE FENCE FOR YOU!',
        winText: 'The fence gleams white. Tom has engineered a masterpiece of deception.',
        loseText: "Time ran out! Aunt Polly isn't pleased.",
        init(api) {
          this.progress = 0;
          this.kids = [];
          this.spawnT = 0.6;
          this.elapsed = 0;
          this.totalTime = 28;
          this.won = false;
          this.KID_COLORS = ['#c8501a', '#2a70c8', '#5aaa2a', '#c83080', '#c8a020'];
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.elapsed += dt;
          this.spawnT -= dt;
          if (this.won) return;

          // Spawn walking kids
          if (this.spawnT <= 0 && this.kids.length < 3) {
            const row = this.kids.length % 3;
            this.kids.push({
              x: -26, y: H * 0.50 + row * 16,
              speed: 22 + Math.random() * 14,
              painting: false, paintT: 0, done: false,
              col: this.KID_COLORS[Math.floor(Math.random() * this.KID_COLORS.length)],
            });
            this.spawnT = 2.6 + Math.random() * 2.0;
          }

          for (let k = this.kids.length - 1; k >= 0; k--) {
            const kid = this.kids[k];
            if (kid.painting) {
              kid.paintT -= dt;
              if (kid.paintT <= 0) {
                this.progress = Math.min(1, this.progress + 0.22);
                kid.done = true;
                api.addScore(80);
                api.audio.sfx('coin');
                api.burst(kid.x, kid.y, '#e8f0d8', 8);
                if (this.progress >= 1 && !this.won) {
                  this.won = true;
                  api.addScore(200);
                  api.win();
                }
              }
            } else if (!kid.done) {
              kid.x += kid.speed * dt;
            }
            if (kid.x > W + 30) this.kids.splice(k, 1);
          }

          // Tap to convince a kid
          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (const kid of this.kids) {
              if (!kid.painting && !kid.done &&
                  Math.abs(px - kid.x) < 24 && Math.abs(py - kid.y) < 24) {
                kid.painting = true;
                kid.paintT = 2.0;
                api.audio.sfx('select');
                api.burst(kid.x, kid.y - 10, '#ffffff', 7);
                break;
              }
            }
          }

          if (this.elapsed >= this.totalTime && !this.won) api.lose();
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const sky = c.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#7ec0e8'); sky.addColorStop(1, '#d0eea0');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          g.circle(W - 28, 26, 16, '#ffe060');
          // Ground
          c.fillStyle = '#6ab030'; c.fillRect(0, H * 0.60, W, H * 0.40);
          c.fillStyle = '#5a9020'; c.fillRect(0, H * 0.60, W, 4);
          // The Fence boards
          const fy = H * 0.60, fw = 8, gap = 1;
          const nBoards = Math.floor((W - 10) / (fw + gap));
          for (let i = 0; i < nBoards; i++) {
            const bx = 5 + i * (fw + gap);
            g.rect(bx, fy - 50, fw, 50, '#d4a85a');
            g.rect(bx + 2, fy - 56, fw - 4, 7, '#d4a85a');
            const fill = clamp(this.progress * nBoards - i, 0, 1);
            if (fill > 0) {
              c.globalAlpha = fill;
              g.rect(bx, fy - 50, fw, 50, '#e8ead8');
              c.globalAlpha = 1;
            }
          }
          g.rect(4, fy - 37, W - 8, 4, '#c49040');
          g.rect(4, fy - 14, W - 8, 4, '#c49040');

          // Kids
          for (const kid of this.kids) {
            if (kid.done) continue;
            const kx = kid.x, ky = kid.y;
            c.fillStyle = kid.col; c.fillRect(kx - 6, ky - 14, 12, 14);
            g.circle(kx, ky - 20, 6, '#f4c080');
            g.rect(kx - 7, ky - 26, 14, 4, '#c8a020');
            g.rect(kx - 5, ky - 30, 10, 5, '#c8a020');
            if (!kid.painting) {
              // Walking legs alternate
              const step = Math.sin(api.t * 8 + kid.x * 0.1) > 0;
              c.fillStyle = '#4a4a4a';
              c.fillRect(kx - 4, ky, 4, step ? 10 : 7, '#4a4a4a');
              c.fillRect(kx + 0, ky, 4, step ? 7 : 10, '#4a4a4a');
              // Tappable hint
              c.globalAlpha = 0.55 + 0.4 * Math.sin(api.t * 3 + kid.x);
              api.txtC('?', kx, ky - 40, 10, '#c07810', true);
              c.globalAlpha = 1;
            } else {
              // Static legs while painting
              c.fillStyle = '#4a4a4a';
              c.fillRect(kx - 4, ky, 4, 10, '#4a4a4a');
              c.fillRect(kx + 0, ky, 4, 10, '#4a4a4a');
              // Painting arm with brush
              const brushSwing = Math.sin(api.t * 6) * 6;
              g.rect(kx + 7, ky - 10 + brushSwing, 14, 3, '#c8501a');
              g.rect(kx + 18, ky - 14 + brushSwing, 5, 8, '#e8e8d8');
              c.globalAlpha = 0.7 + 0.3 * Math.sin(api.t * 4);
              api.txtC('$', kx, ky - 42, 9, '#d4a020', true);
              c.globalAlpha = 1;
            }
          }

          // HUD
          api.topBar('THE FENCE');
          api.txt('PAINTED ' + Math.round(this.progress * 100) + '%', 6, 3, 8, '#c07810');
          const left = Math.max(0, this.totalTime - this.elapsed);
          api.txtC(Math.ceil(left) + 's', W - 22, 3, 8, left < 6 ? '#e83020' : '#5a2808', true);
          g.rect(10, H - 12, W - 20, 7, '#3a2010');
          g.rect(10, H - 12, Math.round((W - 20) * this.progress), 7, '#c8e060');
          api.scanlines();
        },
      },

      /* ====================== 2. THE GRAVEYARD ====================== */
      {
        id: 'graveyard', name: 'THE GRAVEYARD', sub: 'MIDNIGHT WITNESS',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.fillStyle = '#6a7a88';
          c.beginPath(); c.arc(x, y - 6, 7, Math.PI, 0); c.fill();
          c.fillRect(x - 7, y - 6, 14, 14, '#6a7a88');
          g.rect(x - 3, y - 4, 2, 2, '#4a5a68'); g.rect(x + 1, y - 4, 2, 2, '#4a5a68');
          g.circle(x + 13, y - 14, 4, '#e8d888');
        },
        intro: [
          'TOM AND HUCK SNEAK OUT', 'TO THE GRAVEYARD', 'AT DEAD OF NIGHT...',
          'And witness something terrible.',
        ],
        quote: '"Tom! Tom, what is that?" "Oh, Tom, it\'s the devil again, and two more of him!"',
        help: 'DRAG LEFT / RIGHT TO DODGE THE LANTERN. COLLECT ALL 5 CLUES!',
        winText: "Tom and Huck saw the whole thing — the murder, the truth.",
        loseText: 'Injun Joe spots them in the lantern light!',
        init(api) {
          const W = api.W, H = api.H;
          this.tomX = W / 2;
          this.tomY = H * 0.72;
          this.speed = 100;
          this.hp = 3;
          this.hitT = 0;
          this.elapsed = 0;
          this.totalTime = 26;
          // Injun Joe's lantern sweep
          this.joeX = W * 0.66;
          this.joeY = H * 0.40;
          this.joeAngle = -Math.PI * 0.5;
          this.sweepDir = 1;
          this.sweepSpd = 0.62;
          // Clues scattered
          this.clues = [
            { x: 46, y: H * 0.57, got: false },
            { x: 200, y: H * 0.63, got: false },
            { x: 116, y: H * 0.48, got: false },
            { x: 72, y: H * 0.75, got: false },
            { x: 222, y: H * 0.53, got: false },
          ];
          this.got = 0;
          this.won = false;
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.elapsed += dt;
          if (this.hitT > 0) this.hitT -= dt;
          if (this.won) return;

          // Sweep lantern
          this.joeAngle += this.sweepDir * this.sweepSpd * dt;
          if (this.joeAngle > Math.PI * 0.18) { this.joeAngle = Math.PI * 0.18; this.sweepDir = -1; }
          if (this.joeAngle < -Math.PI * 0.98) { this.joeAngle = -Math.PI * 0.98; this.sweepDir = 1; }

          // Move Tom: drag / arrow keys
          const ptr = api.pointer;
          if (ptr.down) {
            const tx = clamp(ptr.x, 12, W - 12);
            this.tomX += (tx - this.tomX) * Math.min(1, dt * 9);
          }
          if (api.keyDown('left')) this.tomX -= this.speed * dt;
          if (api.keyDown('right')) this.tomX += this.speed * dt;
          this.tomX = clamp(this.tomX, 12, W - 12);

          // Lantern hit check
          if (this.hitT <= 0) {
            const dx = this.tomX - this.joeX, dy = this.tomY - this.joeY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 148) {
              const ang = Math.atan2(dy, dx);
              const diff = Math.abs(((ang - this.joeAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
              if (diff < 0.32) {
                this.hp--;
                this.hitT = 1.6;
                api.shake(5, 0.3);
                api.audio.sfx('hurt');
                api.flash(api.colors.blood, 0.2);
                if (this.hp <= 0) { api.lose(); return; }
              }
            }
          }

          // Collect clues
          for (const cl of this.clues) {
            if (!cl.got && Math.abs(this.tomX - cl.x) < 18 && Math.abs(this.tomY - cl.y) < 18) {
              cl.got = true;
              this.got++;
              api.addScore(100);
              api.audio.sfx('coin');
              api.burst(cl.x, cl.y, '#e8d888', 8);
              if (this.got >= 5 && !this.won) { this.won = true; api.addScore(150); api.win(); }
            }
          }

          if (this.elapsed >= this.totalTime && !this.won) {
            if (this.got >= 4) { this.won = true; api.win(); }
            else api.lose();
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Night sky
          c.fillStyle = '#080e18'; c.fillRect(0, 0, W, H);
          for (let i = 0; i < 34; i++) {
            const sx = (i * 83 + 13) % W, sy = (i * 57 + 9) % (H * 0.55);
            c.globalAlpha = 0.4 + 0.5 * Math.sin(api.t * 1.5 + i);
            g.rect(sx, sy, 1, 1, '#d8e8ff');
          }
          c.globalAlpha = 1;
          // Crescent moon
          g.circle(W - 34, 36, 18, '#e8d888');
          g.circle(W - 28, 32, 14, '#080e18');
          // Ground
          c.fillStyle = '#10180a'; c.fillRect(0, H * 0.82, W, H * 0.18);
          c.fillStyle = '#161e10'; c.fillRect(0, H * 0.80, W, H * 0.03);
          // Tombstones
          const stones = [[32,H*0.72],[84,H*0.70],[148,H*0.73],[204,H*0.71],[60,H*0.63],[192,H*0.64]];
          for (const [sx, sy] of stones) {
            c.fillStyle = '#283848'; c.fillRect(sx - 9, sy - 28, 18, 28);
            c.beginPath(); c.arc(sx, sy - 28, 9, Math.PI, 0); c.fill();
            g.rect(sx - 7, sy - 20, 14, 2, '#1a2838');
          }
          // Lantern cone
          c.globalAlpha = 0.20; c.fillStyle = '#e8d040';
          c.beginPath(); c.moveTo(this.joeX, this.joeY);
          c.arc(this.joeX, this.joeY, 150, this.joeAngle - 0.31, this.joeAngle + 0.31);
          c.closePath(); c.fill(); c.globalAlpha = 1;
          // Injun Joe silhouette + lantern
          g.circle(this.joeX + 8, this.joeY - 4, 5, '#e8b030');
          c.globalAlpha = 0.28; g.circle(this.joeX + 8, this.joeY - 4, 11, '#e8b030'); c.globalAlpha = 1;
          g.rect(this.joeX - 7, this.joeY - 22, 14, 22, '#080a08');
          g.circle(this.joeX, this.joeY - 26, 8, '#080a08');
          // Clue icons
          const ICONS = ['💀', '🪙', '🎩', '📜', '🗡'];
          for (let ci = 0; ci < this.clues.length; ci++) {
            const cl = this.clues[ci];
            if (!cl.got) {
              c.globalAlpha = 0.5 + 0.45 * Math.sin(api.t * 2.8 + ci);
              api.txtC(ICONS[ci], cl.x, cl.y, 13, '#e8d888', false);
              c.globalAlpha = 1;
            }
          }
          // Tom (flashes when hit)
          if (!(this.hitT > 0 && Math.floor(api.t * 8) % 2 === 0)) {
            g.circle(this.tomX, this.tomY - 22, 7, '#f4c080');
            g.rect(this.tomX - 7, this.tomY - 15, 14, 15, '#c8501a');
            g.rect(this.tomX - 8, this.tomY - 28, 16, 5, '#c8a020');
          }
          api.topBar('MIDNIGHT WITNESS');
          api.txt('CLUES ' + this.got + '/5', 6, 3, 8, '#e8d888');
          for (let h = 0; h < 3; h++)
            g.circle(W - 12 - h * 18, 9, 6, h < this.hp ? '#e82040' : '#2a1010');
          api.vignette();
          api.scanlines();
        },
      },

      /* ==================== 3. JACKSON'S ISLAND ==================== */
      {
        id: 'island', name: "JACKSON'S ISLAND", sub: 'PIRATES OF THE MISSISSIPPI',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 10, y + 2, 20, 6, '#c4903a'); g.rect(x - 10, y + 2, 20, 2, '#a87030');
          g.rect(x - 1, y - 12, 2, 14, '#c49040');
          g.rect(x + 1, y - 12, 12, 8, '#e83020'); g.rect(x + 1, y - 8, 12, 4, '#f0f0f0');
        },
        intro: [
          "TOM, HUCK, AND JOE HARPER", 'PUSH OFF ON A RAFT', 'DOWN THE MISSISSIPPI!',
          '"We\'re pirates! Hooray!"',
        ],
        quote: '"It\'s just the life for me — you don\'t have to get up mornings, and you don\'t have to go to school, and wash, and all that blame foolishness."',
        help: 'STEER THE RAFT LEFT / RIGHT. DODGE LOGS AND ROCKS!',
        winText: "Reached Jackson's Island! Three outlaws at large!",
        loseText: 'The raft smashes up! Back to shore.',
        init(api) {
          const W = api.W, H = api.H;
          this.raftX = W / 2;
          this.raftY = H * 0.56;
          this.spd = 118;
          this.hp = 3;
          this.hitT = 0;
          this.dist = 0;
          this.need = 1620;
          this.rspd = 78;
          this.obs = [];
          this.spawnT = 0;
          this.scroll = 0;
          this.won = false;
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          if (this.hitT > 0) this.hitT -= dt;
          if (this.won) return;

          // Steer raft
          const ptr = api.pointer;
          if (ptr.down) {
            const tx = clamp(ptr.x, 22, W - 22);
            this.raftX += (tx - this.raftX) * Math.min(1, dt * 8);
          }
          if (api.keyDown('left')) this.raftX -= this.spd * dt;
          if (api.keyDown('right')) this.raftX += this.spd * dt;
          this.raftX = clamp(this.raftX, 22, W - 22);

          // River flow
          this.dist += this.rspd * dt;
          this.scroll = (this.scroll + this.rspd * dt * 0.24) % 48;

          // Spawn obstacles
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.obs.push({
              x: 18 + Math.random() * (W - 36), y: -18,
              spd: 72 + Math.random() * 38,
              log: Math.random() < 0.55,
            });
            this.spawnT = 0.82 + Math.random() * 0.78;
          }
          for (let i = this.obs.length - 1; i >= 0; i--) {
            const o = this.obs[i];
            o.y += o.spd * dt;
            if (o.y > H + 26) { this.obs.splice(i, 1); continue; }
            if (this.hitT <= 0 && Math.abs(o.x - this.raftX) < 24 && Math.abs(o.y - this.raftY) < 14) {
              this.hp--;
              this.hitT = 1.2;
              api.shake(5, 0.3);
              api.audio.sfx('hurt');
              api.burst(this.raftX, this.raftY, '#c49040', 8);
              this.obs.splice(i, 1);
              if (this.hp <= 0) { api.lose(); return; }
            }
          }
          if (this.dist >= this.need && !this.won) {
            this.won = true; api.addScore(300); api.win();
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#1a5a8a'; c.fillRect(0, 0, W, H);
          // River current ripples
          c.globalAlpha = 0.11; c.fillStyle = '#6ab0e0';
          for (let row = -1; row < H / 48 + 1; row++) {
            const ry = row * 48 + this.scroll;
            c.fillRect(0, ry, W, 3); c.fillRect(22, ry + 16, W * 0.5, 2);
            c.fillRect(W * 0.38, ry + 32, W * 0.62, 2);
          }
          c.globalAlpha = 1;
          // Banks
          c.fillStyle = '#3a7a18'; c.fillRect(0, 0, 16, H); c.fillRect(W - 16, 0, 16, H);
          c.fillStyle = '#d8b860'; c.fillRect(0, 0, 7, H); c.fillRect(W - 7, 0, 7, H);
          // Obstacles
          for (const o of this.obs) {
            if (o.log) {
              g.rect(o.x - 20, o.y - 5, 40, 10, '#8b5a20');
              g.rect(o.x - 14, o.y - 5, 4, 10, '#6a3e10');
              g.rect(o.x + 10, o.y - 5, 4, 10, '#6a3e10');
            } else {
              c.fillStyle = '#5a6878'; c.beginPath(); c.arc(o.x, o.y, 14, 0, 7); c.fill();
              c.fillStyle = '#4a5868'; c.beginPath(); c.arc(o.x - 4, o.y - 4, 7, 0, 7); c.fill();
            }
          }
          // Raft
          if (!(this.hitT > 0 && Math.floor(api.t * 8) % 2 === 0)) {
            const rf = this.raftX, ry2 = this.raftY;
            g.rect(rf - 22, ry2 - 3, 44, 10, '#c4903a');
            g.rect(rf - 22, ry2 - 3, 44, 4, '#a87030');
            g.rect(rf - 4, ry2 - 20, 2, 17, '#c49040');
            g.rect(rf - 2, ry2 - 20, 14, 8, '#e83020');
            g.rect(rf - 2, ry2 - 15, 14, 4, '#f0f0f0');
            g.circle(rf - 10, ry2 - 8, 5, '#f4c080');
          }
          const prog = Math.min(1, this.dist / this.need);
          g.rect(18, H - 10, W - 36, 5, '#0a3060');
          g.rect(18, H - 10, Math.round((W - 36) * prog), 5, '#5ab0e0');
          api.txtC("JACKSON'S ISLAND", W / 2, H - 20, 6, '#a0d0f0', false);
          api.topBar("JACKSON'S ISLAND");
          api.txt(Math.round(prog * 100) + '%', 6, 3, 8, '#5ab0e0');
          for (let h = 0; h < 3; h++)
            g.circle(W - 12 - h * 18, 9, 6, h < this.hp ? '#e82040' : '#2a1010');
          api.scanlines();
        },
      },

      /* =================== 4. MCDOUGAL'S CAVE =================== */
      {
        id: 'cave', name: "MCDOUGAL'S CAVE", sub: 'LOST WITH BECKY',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.fillStyle = '#1a0e08';
          c.beginPath(); c.arc(x, y - 2, 12, Math.PI, 0); c.fill();
          c.fillRect(x - 12, y - 2, 24, 12);
          g.rect(x - 1, y, 2, 8, '#e8d888'); g.circle(x, y - 1, 2, '#e87020');
          c.globalAlpha = 0.28; g.circle(x, y - 1, 5, '#e8c040'); c.globalAlpha = 1;
        },
        intro: [
          'TOM AND BECKY WANDER', 'DEEPER INTO THE CAVE', 'WHILE THE OTHERS FEAST.',
          'The candle grows shorter...',
        ],
        quote: '"Tom saw that candle-end and knew that their last hour was come."',
        help: 'FIND BECKY, THEN FIND THE EXIT! TAP A DIRECTION OR USE ARROWS.',
        winText: "Tom spots a speck of daylight — they're saved!",
        loseText: 'The candle gutters and dies. Dark, total dark.',
        init(api) {
          this.COLS = 9; this.ROWS = 11;
          this.TW = 30; this.TH = 43;
          this.OY = 16;
          // Build maze (all walls)
          this.maze = [];
          for (let r = 0; r < this.ROWS; r++) {
            this.maze[r] = [];
            for (let col = 0; col < this.COLS; col++) this.maze[r][col] = 1;
          }
          // DFS recursive backtracker from (col=1, row=1)
          const carve = (col, row) => {
            this.maze[row][col] = 0;
            const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);
            for (const [dc, dr] of dirs) {
              const nc = col + dc, nr = row + dr;
              if (nc > 0 && nc < this.COLS - 1 && nr > 0 && nr < this.ROWS - 1 && this.maze[nr][nc] === 1) {
                this.maze[row + dr / 2][col + dc / 2] = 0;
                carve(nc, nr);
              }
            }
          };
          carve(1, 1);
          // Guarantee exit path is open
          this.maze[this.ROWS - 2][this.COLS - 2] = 0;
          this.maze[this.ROWS - 3][this.COLS - 2] = 0;
          // Player start
          this.px = 1; this.py = 1;
          this.subX = this.TW + this.TW / 2;
          this.subY = this.TH + this.TH / 2 + this.OY;
          // Becky at (5,5), exit at (7,9)
          this.bx = 5; this.by = 5;
          this.ex = this.COLS - 2; this.ey = this.ROWS - 2;
          this.beckyFound = false;
          // Candle timer
          this.candle = 24; this.maxCandle = 24;
          this.moveT = 0;
          this.won = false;
        },
        update(api, dt) {
          this.candle -= dt;
          this.moveT = Math.max(0, this.moveT - dt);
          if (this.won) return;
          if (this.candle <= 0) { api.lose(); return; }

          let dc = 0, dr = 0;
          if (this.moveT <= 0) {
            if (api.keyDown('left')) dc = -1;
            else if (api.keyDown('right')) dc = 1;
            else if (api.keyDown('up')) dr = -1;
            else if (api.keyDown('down')) dr = 1;
            // Touch: tap towards a direction from player center
            if (api.pointer.justDown) {
              const pcx = this.px * this.TW + this.TW / 2;
              const pcy = this.py * this.TH + this.TH / 2 + this.OY;
              const adx = Math.abs(api.pointer.x - pcx);
              const ady = Math.abs(api.pointer.y - pcy);
              if (adx > 8 || ady > 8) {
                if (adx > ady) dc = api.pointer.x > pcx ? 1 : -1;
                else dr = api.pointer.y > pcy ? 1 : -1;
              }
            }
            if (dc !== 0 || dr !== 0) {
              const nc = this.px + dc, nr = this.py + dr;
              if (nc >= 0 && nc < this.COLS && nr >= 0 && nr < this.ROWS && this.maze[nr][nc] === 0) {
                this.px = nc; this.py = nr;
                this.moveT = 0.18;
                api.audio.sfx('blip');
              } else {
                this.moveT = 0.1;
              }
            }
          }
          // Smooth pixel position
          this.subX += (this.px * this.TW + this.TW / 2 - this.subX) * Math.min(1, dt * 14);
          this.subY += (this.py * this.TH + this.TH / 2 + this.OY - this.subY) * Math.min(1, dt * 14);

          // Find Becky
          if (!this.beckyFound && this.px === this.bx && this.py === this.by) {
            this.beckyFound = true;
            this.candle = Math.min(this.maxCandle, this.candle + 9);
            api.addScore(150);
            api.audio.sfx('select');
            api.burst(this.subX, this.subY, '#f4c080', 12);
          }
          // Reach exit (only after Becky)
          if (this.beckyFound && this.px === this.ex && this.py === this.ey) {
            this.won = true; api.addScore(300); api.win();
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const TW = this.TW, TH = this.TH, OY = this.OY;
          c.fillStyle = '#040208'; c.fillRect(0, 0, W, H);
          const cRatio = clamp(this.candle / this.maxCandle, 0, 1);
          const lightR = 50 + 65 * cRatio;
          // Draw maze with candle-light falloff
          for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
              const cx = col * TW + TW / 2, cy = row * TH + TH / 2 + OY;
              const dist = Math.hypot(cx - this.subX, cy - this.subY);
              const alpha = clamp(1 - dist / lightR, 0, 1);
              if (alpha < 0.02) continue;
              c.globalAlpha = alpha * alpha;
              if (this.maze[row][col] === 1) {
                c.fillStyle = '#2a180a'; c.fillRect(col * TW, row * TH + OY, TW, TH);
                g.rect(col * TW + 1, row * TH + OY + 1, TW - 2, TH - 2, '#1e1006');
              } else {
                c.fillStyle = '#3a2210'; c.fillRect(col * TW, row * TH + OY, TW, TH);
                if ((col + row) % 2 === 0) g.rect(col * TW + 2, row * TH + OY + 2, TW - 4, TH - 4, '#2e1c0a');
              }
            }
          }
          c.globalAlpha = 1;
          // Becky
          if (!this.beckyFound) {
            const bpx = this.bx * TW + TW / 2, bpy = this.by * TH + TH / 2 + OY;
            const bAlpha = clamp(1 - Math.hypot(bpx - this.subX, bpy - this.subY) / lightR, 0, 1);
            if (bAlpha > 0.04) {
              c.globalAlpha = bAlpha;
              g.circle(bpx, bpy - 2, 8, '#f4c080');
              api.txtC('B', bpx, bpy - 6, 7, '#3a1808', true);
              c.globalAlpha = bAlpha * (0.28 + 0.22 * Math.sin(api.t * 3));
              g.circle(bpx, bpy, 13, '#e8c060');
              c.globalAlpha = 1;
            }
          }
          // Exit marker
          {
            const epx = this.ex * TW + TW / 2, epy = this.ey * TH + TH / 2 + OY;
            const eAlpha = clamp(1 - Math.hypot(epx - this.subX, epy - this.subY) / lightR, 0, 1);
            if (eAlpha > 0.04) {
              const blink = 0.55 + 0.45 * Math.sin(api.t * 5);
              c.globalAlpha = eAlpha * (this.beckyFound ? 1 : 0.4) * blink;
              g.circle(epx, epy, 10, '#60c830');
              api.txtC('OUT', epx, epy - 4, 6, '#f0f0f0', true);
              c.globalAlpha = 1;
            }
          }
          // Player
          g.circle(this.subX, this.subY - 8, 6, '#f4c080');
          g.rect(this.subX - 3, this.subY - 2, 6, 9, '#c8501a');
          c.globalAlpha = 0.65 + 0.3 * Math.sin(api.t * 7);
          g.circle(this.subX + 9, this.subY - 5, 4, '#e8c040');
          g.circle(this.subX + 9, this.subY - 8, 2, '#fff060');
          c.globalAlpha = 1;
          // Candle bar
          g.rect(14, H - 11, W - 28, 6, '#1a0808');
          g.rect(14, H - 11, Math.round((W - 28) * cRatio), 6, cRatio > 0.3 ? '#e8c040' : '#e84020');
          api.txtC('CANDLE', W / 2, H - 22, 7, '#e8c040', false);
          api.topBar("MCDOUGAL'S CAVE");
          api.txt(this.beckyFound ? 'FIND THE EXIT!' : 'FIND BECKY!', 6, 3, 7, '#e8c040');
          api.vignette();
        },
      },

      /* =================== 5. THE TREASURE =================== */
      {
        id: 'treasure', name: 'THE TREASURE', sub: "INJUN JOE'S GOLD",
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 9, y - 1, 18, 12, '#c49030'); g.rect(x - 9, y - 8, 18, 8, '#d4a040');
          g.rect(x - 9, y - 1, 18, 2, '#8b6020');
          g.rect(x - 2, y - 3, 4, 5, '#e8c040'); g.circle(x, y - 1, 2, '#d4a020');
        },
        intro: [
          'TOM AND HUCK TRACK', "INJUN JOE TO HIS HIDING PLACE.", 'THE HAUNTED HOUSE.',
          'Gold — right here!',
        ],
        quote: '"Twelve thousand dollars in gold — every cent of it!" Tom\'s eyes blazed.',
        help: 'TAP (OR PRESS A) WHEN THE SHOVEL IS OVER THE X — THEN DIG!',
        winText: "Twelve thousand dollars in gold — and it's all theirs!",
        loseText: 'Injun Joe returns! Flee the haunted house!',
        init(api) {
          const W = api.W, H = api.H;
          this.spots = [
            { x: 55, y: H * 0.57, dug: false },
            { x: W / 2, y: H * 0.64, dug: false },
            { x: W - 55, y: H * 0.57, dug: false },
          ];
          this.cur = 0;
          this.found = 0;
          this.shovelX = this.spots[0].x;
          this.shovelDir = 1;
          this.shovelSpd = 116;
          this.strikeT = 0;
          this.strikeChecked = true;
          this.joeT = 32;   // seconds before Joe returns
          this.won = false;
        },
        update(api, dt) {
          const W = api.W;
          if (this.won) return;
          this.joeT -= dt;
          if (this.joeT <= 0) { api.lose(); return; }
          if (this.strikeT > 0) this.strikeT -= dt;

          // Shovel sweeps over current spot
          if (!this.spots[this.cur].dug) {
            const sp = this.spots[this.cur];
            this.shovelX += this.shovelDir * this.shovelSpd * dt;
            if (this.shovelX > sp.x + 52) { this.shovelX = sp.x + 52; this.shovelDir = -1; }
            if (this.shovelX < sp.x - 52) { this.shovelX = sp.x - 52; this.shovelDir = 1; }
          }

          // Strike input: tap anywhere or press A
          if ((api.pointer.justDown || api.keyPressed('a')) && this.strikeT <= 0 && !this.spots[this.cur].dug) {
            this.strikeT = 0.38;
            this.strikeChecked = false;
            api.audio.sfx('select');
          }

          // Evaluate accuracy mid-strike
          if (this.strikeT > 0 && this.strikeT < 0.12 && !this.strikeChecked) {
            this.strikeChecked = true;
            const sp = this.spots[this.cur];
            if (Math.abs(this.shovelX - sp.x) < 16) { // tighter dig window
              // each spot takes TWO good strikes to dig out (dig deeper) — a
              // masher used to clear all three in ~2.5s, undercutting the timer
              sp.depth = (sp.depth || 0) + 1;
              api.addScore(200);
              api.shake(3, 0.3);
              if (sp.depth >= 2) {
                sp.dug = true;
                this.found++;
                api.audio.sfx('win');
                api.burst(sp.x, sp.y, '#d4a020', 16);
                if (this.found >= 3) { this.won = true; api.win(); }
                else {
                  do { this.cur = (this.cur + 1) % 3; } while (this.spots[this.cur].dug);
                  this.shovelX = this.spots[this.cur].x;
                  this.strikeT = 0;
                }
              } else {
                api.audio.sfx('coin');
                api.burst(sp.x, sp.y, '#a07018', 8);
              }
            } else {
              api.shake(1, 0.15);
              api.audio.sfx('hurt');
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Haunted house interior
          c.fillStyle = '#0e0804'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#3a2010';
          for (let i = 0; i < 9; i++) {
            const py = H * 0.36 + i * 17;
            c.fillRect(0, py, W, 15);
            g.rect(0, py, W, 1, '#281608');
          }
          c.fillStyle = '#1c1206'; c.fillRect(0, 0, W, H * 0.36);
          // Broken window
          c.fillStyle = '#3a4858'; c.fillRect(W / 2 - 16, 10, 32, 26);
          g.rectO(W / 2 - 16, 10, 32, 26, '#5a6878', 1);
          g.rect(W / 2 - 1, 10, 2, 26, '#5a6878');
          g.rect(W / 2 - 16, 23, 32, 2, '#5a6878');
          // Cobwebs
          c.globalAlpha = 0.3; c.strokeStyle = '#9090a0'; c.lineWidth = 1;
          for (let j = 0; j < 4; j++) {
            c.beginPath(); c.moveTo(0, 0); c.lineTo(20 + j * 7, j * 9); c.stroke();
            c.beginPath(); c.moveTo(W, 0); c.lineTo(W - 20 - j * 7, j * 9); c.stroke();
          }
          c.globalAlpha = 1;
          // Dig spots
          for (let i = 0; i < 3; i++) {
            const sp = this.spots[i];
            if (!sp.dug) {
              const isAct = i === this.cur;
              c.strokeStyle = isAct ? '#d4a020' : '#6a5018'; c.lineWidth = isAct ? 3 : 2;
              c.beginPath(); c.moveTo(sp.x - 12, sp.y - 12); c.lineTo(sp.x + 12, sp.y + 12); c.stroke();
              c.beginPath(); c.moveTo(sp.x + 12, sp.y - 12); c.lineTo(sp.x - 12, sp.y + 12); c.stroke();
              if (isAct) {
                c.globalAlpha = 0.22 + 0.18 * Math.sin(api.t * 4);
                g.circle(sp.x, sp.y, 17, '#d4a020');
                c.globalAlpha = 1;
              }
            } else {
              c.fillStyle = '#0a0604'; c.beginPath(); c.ellipse(sp.x, sp.y + 4, 17, 7, 0, 0, 7); c.fill();
              g.rect(sp.x - 9, sp.y - 5, 18, 12, '#c49030');
              g.rect(sp.x - 9, sp.y - 10, 18, 7, '#d4a040');
              g.rect(sp.x - 9, sp.y - 5, 18, 2, '#8b6020');
              g.circle(sp.x, sp.y - 6, 2, '#e8c040');
              for (let ci = 0; ci < 5; ci++) g.circle(sp.x - 12 + ci * 6, sp.y + 9, 3, '#e8c040');
            }
          }
          // Swinging shovel
          if (!this.spots[this.cur].dug) {
            const strikeOff = this.strikeT > 0 ? (1 - this.strikeT / 0.38) * 68 : 0;
            const sy = H * 0.21 + strikeOff;
            g.rect(this.shovelX - 2, sy, 4, 52, '#8b5a20');
            c.fillStyle = '#8090a0';
            c.beginPath();
            c.moveTo(this.shovelX - 10, sy + 48);
            c.lineTo(this.shovelX + 10, sy + 48);
            c.lineTo(this.shovelX + 8, sy + 64);
            c.lineTo(this.shovelX - 8, sy + 64);
            c.closePath(); c.fill();
          }
          // Injun Joe creeping in from the right
          if (this.joeT < 12) {
            const progress = (12 - this.joeT) / 12;
            const joeScreenX = W + 20 - progress * (W * 0.7 + 20);
            c.globalAlpha = clamp(progress * 2, 0, 1);
            g.rect(joeScreenX - 8, H - 80, 16, 44, '#1a0a06');
            g.circle(joeScreenX, H - 88, 10, '#7a4020');
            g.rect(joeScreenX - 6, H - 36, 6, 36, '#1a0a06');
            g.rect(joeScreenX + 2, H - 36, 6, 36, '#1a0a06');
            c.globalAlpha = 1;
            if (this.joeT > 0) {
              const warn = Math.ceil(this.joeT);
              api.txtC('JOE RETURNS IN ' + warn + 's!', W / 2, H - 18, 7,
                this.joeT < 5 ? '#e83020' : '#c87a10', true);
            }
          }
          // HUD
          api.topBar('THE HAUNTED HOUSE');
          api.txt('CHESTS ' + this.found + '/3', 6, 3, 8, '#d4a020');
          api.txtC('TAP TO STRIKE!', W / 2, H - 30, 7, '#c8a030', false);
          api.vignette();
          api.scanlines();
        },
      },
    ],
  });
})();
