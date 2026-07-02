/* ============================================================================
 * BALLAD OF HONOR — A WARRIOR'S JOURNEY IN FIVE CHAPTERS
 *   1. DISGUISE       — timing: hit the green zone 8 times to transform
 *   2. TRAINING CAMP  — dodge: survive 22s of arrow volleys
 *   3. MOUNTAIN PASS  — aim & fire: cannon 10 hits to trigger the avalanche
 *   4. THE PALACE     — stealth: slip past torchlit guards to reach the throne
 *   5. THE FINAL DUEL — parry timing: deflect Shan-Yu's blade 6 times
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  // Sword + cherry-blossom emblem
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Sword blade (vertical)
    g.rect(cx - 2, cy - 30, 4, 44, '#c8c4a0');
    g.rect(cx - 1, cy - 30, 2, 44, '#e8e0c0');  // highlight
    // Guard
    g.rect(cx - 9, cy + 12, 18, 5, '#8a6828');
    g.rect(cx - 7, cy + 14, 14, 3, '#ffd700');
    // Hilt
    g.rect(cx - 3, cy + 17, 6, 12, '#6a4a18');
    // Cherry blossom petals (5)
    const pColors = ['#ff5577', '#ff3355', '#ff7799'];
    for (let p = 0; p < 5; p++) {
      const ang = (p / 5) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.round(Math.cos(ang) * 13);
      const py = (cy - 8) + Math.round(Math.sin(ang) * 13);
      g.circle(px, py, 7, pColors[p % 3]);
    }
    g.circle(cx, cy - 8, 5, '#ffd700');
    // Glow
    c.globalAlpha = 0.14;
    g.circle(cx, cy - 8, 26, '#ff4466');
    c.globalAlpha = 1;
  }

  // Scenery: Chinese mountains, Great Wall, pagodas, lanterns
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Sky — imperial gold-red sunrise
    const sky = c.createLinearGradient(0, 0, 0, H * 0.6);
    sky.addColorStop(0, '#1a0a00');
    sky.addColorStop(0.45, '#8a2200');
    sky.addColorStop(1, '#cc4400');
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H * 0.6);

    // Sun disk
    c.globalAlpha = 0.85 + 0.12 * Math.sin(t * 0.7);
    g.circle(W * 0.68, H * 0.18, 20, '#ffcc00');
    c.globalAlpha = 0.35;
    g.circle(W * 0.68, H * 0.18, 30, '#ff8800');
    c.globalAlpha = 1;

    // Far mountains
    c.fillStyle = '#2a1200';
    c.beginPath();
    c.moveTo(0, H * 0.56);
    c.lineTo(W * 0.12, H * 0.30);
    c.lineTo(W * 0.28, H * 0.46);
    c.lineTo(W * 0.46, H * 0.22);
    c.lineTo(W * 0.62, H * 0.40);
    c.lineTo(W * 0.80, H * 0.17);
    c.lineTo(W, H * 0.36);
    c.lineTo(W, H * 0.56);
    c.closePath();
    c.fill();

    // Snow cap highlights
    c.fillStyle = '#f0ece0';
    c.globalAlpha = 0.8;
    c.beginPath();
    c.moveTo(W * 0.46, H * 0.22);
    c.lineTo(W * 0.39, H * 0.34);
    c.lineTo(W * 0.53, H * 0.34);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(W * 0.80, H * 0.17);
    c.lineTo(W * 0.73, H * 0.28);
    c.lineTo(W * 0.87, H * 0.28);
    c.closePath();
    c.fill();
    c.globalAlpha = 1;

    // Near mountains
    c.fillStyle = '#180e00';
    c.beginPath();
    c.moveTo(0, H * 0.7);
    c.lineTo(W * 0.18, H * 0.52);
    c.lineTo(W * 0.38, H * 0.62);
    c.lineTo(W * 0.56, H * 0.44);
    c.lineTo(W * 0.74, H * 0.58);
    c.lineTo(W, H * 0.50);
    c.lineTo(W, H * 0.7);
    c.closePath();
    c.fill();

    // Great Wall sections
    function wallSect(wx, wy, ww) {
      g.rect(wx, wy - 12, ww, 12, '#2a1800');
      for (let b = 0; b < ww - 4; b += 12) {
        g.rect(wx + b + 1, wy - 20, 8, 10, '#2a1800');
      }
    }
    wallSect(0, Math.floor(H * 0.63), Math.floor(W * 0.28));
    wallSect(Math.floor(W * 0.54), Math.floor(H * 0.55), Math.floor(W * 0.46));

    // Pagodas (left and right silhouette)
    function pagoda(px, py) {
      g.rect(px - 8, py, 16, 20, '#160c00');
      g.rect(px - 13, py - 7, 26, 6, '#160c00');
      g.rect(px - 9, py - 19, 18, 14, '#160c00');
      g.rect(px - 14, py - 25, 28, 6, '#160c00');
      g.rect(px - 5, py - 34, 10, 12, '#160c00');
      g.rect(px - 11, py - 40, 22, 6, '#160c00');
      g.rect(px - 2, py - 50, 4, 10, '#160c00');
    }
    pagoda(Math.floor(W * 0.11), Math.floor(H * 0.7) - 28);
    pagoda(Math.floor(W * 0.89), Math.floor(H * 0.64) - 28);

    // Ground
    c.fillStyle = '#0e0800';
    c.fillRect(0, Math.floor(H * 0.7), W, Math.floor(H * 0.3));

    // Bamboo clumps (animated sway)
    function bamboo(bx) {
      const sw = Math.sin(t * 1.1 + bx * 0.04) * 2;
      for (let s = 0; s < 5; s++) {
        const sy = Math.floor(H * 0.7) - s * 15;
        g.rect(Math.round(bx + sw * s * 0.22) - 2, sy - 11, 4, 13, '#1a3a08');
        if (s > 0) {
          g.rect(Math.round(bx + sw * s * 0.22) - 8, sy - 1, 6, 3, '#1a3a08');
          g.rect(Math.round(bx + sw * s * 0.22) + 2, sy - 4, 5, 3, '#1a3a08');
        }
      }
    }
    bamboo(12);
    bamboo(21);
    bamboo(W - 21);
    bamboo(W - 12);

    // Floating lanterns (animated)
    for (let i = 0; i < 4; i++) {
      const lx = 24 + i * 62;
      const ly = Math.round(H * 0.12 + Math.sin(t * 0.9 + i * 1.4) * 7 + i * 8);
      c.globalAlpha = 0.65;
      g.rect(lx - 6, ly - 9, 12, 16, '#cc2200');
      g.rect(lx - 4, ly + 5, 8, 5, '#aa1800');
      g.rect(lx - 1, ly - 12, 2, 5, '#aa8800');
      g.circle(lx, ly - 1, 4, '#ffcc00');
      c.globalAlpha = 1;
    }

    // Per-scene overlay
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(8,3,0,.72)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(5,2,0,.52)';
      c.fillRect(0, 0, W, H);
      // Dotted journey path connecting chapter nodes
      c.strokeStyle = 'rgba(255,180,0,.35)';
      c.lineWidth = 2;
      c.setLineDash([6, 6]);
      c.beginPath();
      c.moveTo(66, 448);
      c.lineTo(200, 370);
      c.lineTo(66, 292);
      c.lineTo(200, 214);
      c.lineTo(133, 136);
      c.stroke();
      c.setLineDash([]);
      c.lineWidth = 1;
    }
  }

  RetroSaga.create({
    id: 'mulan',
    title: 'BALLAD OF HONOR',
    subtitle: 'A WARRIOR\'S JOURNEY',
    currency: 'HONOR',

    screens: {
      win:          '#ffd700',
      lose:         '#8a2000',
      chapterLabel: '#aa6020',
      name:         '#ffd700',
      sub:          '#cc2200',
      intro:        '#e8c080',
      quote:        '#aa7a40',
      help:         '#ffd700',
      score:        '#ffd700',
      cur:          '#cc2200',
      cta:          '#ffd700',
      overlay:      'rgba(6,2,0,.88)',
    },
    labels: {
      chapter:  'CHAPTER',
      score:    'HONOR EARNED',
      win:      'CHINA IS PROUD',
      lose:     'THE JOURNEY FALTERS',
      cont:     'TAP TO RIDE ON',
      finale:   'TAP FOR THE FINAL WORD',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO BEGIN THE JOURNEY',
    },

    accent:    '#cc2200',
    credit:    'HUA MULAN · BALLAD OF MULAN, c. 6TH CENTURY',
    bootCta:   'TAP TO BRING HONOR TO US ALL',
    bootLine:  'FIVE CHAPTERS · ONE WARRIOR\'S PATH',
    menuLabel: 'THE PATH OF HONOR',
    menuHint:  'CHOOSE YOUR CHAPTER',
    menuDone:  'CHINA IS SAVED',
    emblem,
    scenery,

    finale: [
      'THE EMPEROR BOWS.',
      '',
      'NO ARMY. NO TITLE.',
      'ONLY A DAUGHTER\'S LOVE',
      'AND CHINA\'S GRATITUDE.',
      '',
      '"YOU HAVE SAVED US ALL."',
    ],

    // Chapter-select: journey map, zigzag from village (bottom) to palace (top)
    menu: {
      colors: { title: '#ffd700', label: '#aa6020', cur: '#ffd700' },

      layout(api) {
        return [
          { x: 12,  y: 380, w: 108, h: 70 },  // village (bottom-left)
          { x: 148, y: 302, w: 108, h: 70 },  // army camp (right)
          { x: 12,  y: 224, w: 108, h: 70 },  // mountain pass (left)
          { x: 148, y: 146, w: 108, h: 70 },  // imperial city (right)
          { x: 80,  y: 68,  w: 108, h: 70 },  // palace rooftop (center-top)
        ];
      },

      title(api, score) {
        const g = api.gfx, c = api.ctx, W = api.W;
        // Imperial banner header
        c.fillStyle = '#1a0800';
        c.fillRect(6, 12, W - 12, 48);
        c.strokeStyle = '#cc2200';
        c.lineWidth = 2;
        c.strokeRect(6, 12, W - 12, 48);
        g.rect(10, 16, W - 20, 1, '#ffd700');
        g.rect(10, 56, W - 20, 1, '#ffd700');
        api.txtC('PATH OF HONOR', W / 2, 21, 8, '#ffd700', true);
        api.txtC('HONOR  ' + score, W / 2, 42, 7, '#cc2200', true);
        // Corner ornaments
        g.rect(14, 20, 6, 4, '#cc2200');
        g.rect(14, 24, 3, 9, '#cc2200');
        g.rect(W - 20, 20, 6, 4, '#cc2200');
        g.rect(W - 17, 24, 3, 9, '#cc2200');
      },

      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        // Silk banner / jade tile
        c.fillStyle = sel ? '#2a0e00' : '#180800';
        c.fillRect(x, y, w, h);
        c.strokeStyle = sel ? '#ffd700' : (done ? '#cc2200' : '#6a2800');
        c.lineWidth = sel ? 2 : 1;
        c.strokeRect(x, y, w, h);
        // Corner diamonds
        const dc = done ? '#ffd700' : (sel ? '#cc2200' : '#6a2800');
        g.rect(x + 2, y + 2, 4, 4, dc);
        g.rect(x + w - 6, y + 2, 4, 4, dc);
        g.rect(x + 2, y + h - 6, 4, 4, dc);
        g.rect(x + w - 6, y + h - 6, 4, 4, dc);
        // Chapter icon
        ch.icon(api, x + w / 2, y + 22);
        // Labels
        api.txtCFit((i + 1) + '. ' + ch.name, x + w / 2, y + h - 28, 7,
          done ? '#ffd700' : (sel ? '#ffcc66' : '#c8a040'), false, w - 8);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2, y + h - 14, 6,
          done ? '#cc2200' : '#7a4a20', false, w - 8);
        // Selected glow
        if (sel) {
          c.globalAlpha = 0.11;
          c.fillStyle = '#ffd700';
          c.fillRect(x, y, w, h);
          c.globalAlpha = 1;
        }
      },
    },

    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ==================== 1. DISGUISE ==================== */
      {
        id: 'disguise', name: 'DISGUISE', sub: 'BECOME THE SOLDIER',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 7, y - 3, 14, 10, '#8a1800');
          g.rect(x - 5, y - 9, 10, 8, '#8a1800');
          g.rect(x - 9, y + 5, 18, 4, '#6a1200');
          g.rect(x - 1, y - 13, 2, 6, '#cc2200');
        },
        intro: [
          'THE CONSCRIPTION NOTICE IS READ.',
          'MULAN TAKES HER FATHER\'S ARMOR',
          'AND RIDES BEFORE DAWN.',
          'Transform before the generals inspect!',
        ],
        quote: 'When morning dawned she donned her warrior\'s garb and mounted her steed.',
        help: 'TAP / A when the needle is in the GREEN zone · 8 hits · 3 misses lose',
        winText: 'No one suspects. Mulan has left hearth and home for the empire.',
        loseText: 'The generals see through the disguise. Mulan is turned away in shame.',
        init(api) {
          this.angle   = 0;
          this.dir     = 1;
          this.speed   = 2.2;
          this.hits    = 0;
          this.need    = 8;
          this.misses  = 0;
          this.maxMiss = 3;
          this.cool    = 0;
          this.flash   = 0;
          this.items   = ['HELMET','ARMOR','SASH','BOOTS','SWORD','HAIR PIN','SADDLE','BANNER'];
        },
        update(api, dt) {
          this.cool  = Math.max(0, this.cool - dt);
          if (this.flash > 0) this.flash -= dt;
          else if (this.flash < 0) this.flash += dt;

          this.angle += this.dir * this.speed * dt;
          const lim = Math.PI * 0.9;
          if (this.angle > lim)  { this.angle = lim;  this.dir = -1; }
          if (this.angle < -lim) { this.angle = -lim; this.dir =  1; }
          this.speed = Math.min(4.8, 2.2 + this.hits * 0.2);

          if ((api.pointer.justDown || api.keyPressed('a') || api.keyPressed('up')) && this.cool <= 0) {
            const half = Math.PI * 0.22;
            if (Math.abs(this.angle) <= half) {
              this.hits++;
              api.score += 20;
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H * 0.52, '#ffd700', 10);
              this.flash = 0.55;
              this.cool  = 0.22;
              if (this.hits >= this.need) { api.score += 60; api.win(); return; }
            } else {
              this.misses++;
              api.audio.sfx('hurt');
              api.shake(4, 0.25);
              this.flash = -0.4;
              this.cool  = 0.14;
              if (this.misses >= this.maxMiss) { api.lose(); return; }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0e0500');
          // Pre-dawn sky
          const sky = c.createLinearGradient(0, 0, 0, H * 0.55);
          sky.addColorStop(0, '#0e0500');
          sky.addColorStop(0.6, '#3a1200');
          sky.addColorStop(1, '#7a2600');
          c.fillStyle = sky;
          c.fillRect(0, 0, W, H * 0.55);
          // Stars
          for (let i = 0; i < 30; i++) {
            const sx = (i * 83 + 7) % W;
            const sy = (i * 47 + 3) % Math.floor(H * 0.38);
            c.globalAlpha = 0.3 + 0.35 * Math.sin(api.t * 2.1 + i);
            g.rect(sx, sy, 1, 1, '#ffe0a0');
          }
          c.globalAlpha = 1;
          // House/courtyard silhouette
          g.rect(0, Math.floor(H * 0.55), W, Math.floor(H * 0.45), '#0a0400');
          c.fillStyle = '#160a00';
          c.beginPath();
          c.moveTo(-12, H * 0.55);
          c.lineTo(W / 2, H * 0.26);
          c.lineTo(W + 12, H * 0.55);
          c.closePath();
          c.fill();
          g.rect(W / 2 - 15, Math.floor(H * 0.55) + 10, 30, 48, '#240e00');
          g.rect(W / 2 - 1, Math.floor(H * 0.55) + 10, 2, 48, '#120600');
          // Red lanterns on eaves
          g.rect(W / 2 - 44, Math.floor(H * 0.55) - 2, 8, 12, '#cc2200');
          g.circle(W / 2 - 40, Math.floor(H * 0.55) + 12, 4, '#ff8800');
          g.rect(W / 2 + 36, Math.floor(H * 0.55) - 2, 8, 12, '#cc2200');
          g.circle(W / 2 + 40, Math.floor(H * 0.55) + 12, 4, '#ff8800');

          // Timing meter arc
          const cx = W / 2, cy = Math.floor(H * 0.5);
          const R = 66;
          c.strokeStyle = '#3a1800';
          c.lineWidth = 14;
          c.beginPath();
          c.arc(cx, cy, R, Math.PI * 0.12, Math.PI * 0.88);
          c.stroke();
          // Green zone
          const half = Math.PI * 0.22;
          c.strokeStyle = this.flash > 0 ? '#ffff44' : '#00cc44';
          c.lineWidth = 14;
          c.beginPath();
          c.arc(cx, cy, R, Math.PI / 2 - half, Math.PI / 2 + half);
          c.stroke();
          // Needle
          const nAng = this.angle + Math.PI / 2;
          const nx = cx + Math.cos(nAng) * R;
          const ny = cy + Math.sin(nAng) * R;
          c.strokeStyle = this.flash < 0 ? '#ff4400' : '#ffd700';
          c.lineWidth = 3;
          c.beginPath(); c.moveTo(cx, cy); c.lineTo(nx, ny); c.stroke();
          c.lineWidth = 1;
          g.circle(cx, cy, 6, '#ffd700');
          // Current item label
          const idx = Math.min(this.hits, this.items.length - 1);
          api.txtC(this.items[idx] || '', cx, cy - 22, 8, '#e8c080', true);

          // Flash overlay
          if (this.flash > 0.2) {
            c.globalAlpha = (this.flash - 0.2) * 0.5;
            c.fillStyle = '#00ff66'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          } else if (this.flash < -0.1) {
            c.globalAlpha = Math.abs(this.flash + 0.1) * 0.6;
            c.fillStyle = '#ff2200'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          api.topBar('DISGUISE');
          api.txt('READY ' + this.hits + '/' + this.need, 6, 20, 7, '#ffd700', false, true);
          for (let i = 0; i < 3; i++) {
            g.rect(W - 12 - i * 14, 18, 10, 7, i < this.misses ? '#cc2200' : '#3a1800');
          }
          api.vignette();
        },
      },

      /* ==================== 2. TRAINING CAMP ==================== */
      {
        id: 'training', name: 'TRAINING CAMP', sub: 'SURVIVE THE TRIALS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 1, y - 8, 3, 16, '#8a6828');
          g.rect(x - 6, y - 1, 12, 3, '#8a6828');
          g.circle(x, y - 10, 3, '#cc2200');
        },
        intro: [
          'MULAN ARRIVES AT THE',
          'ARMY TRAINING CAMP.',
          'SHE MUST PROVE HER WORTH.',
          'Dodge arrows and survive the trials!',
        ],
        quote: 'She drilled a thousand miles by day and camped at rivers by night.',
        help: 'STEER left/right to dodge arrows · catch gold stars for HONOR',
        winText: 'Mulan has proven herself. The other recruits begin to respect her.',
        loseText: 'Too many hits. Mulan is driven from the training ground in disgrace.',
        init(api) {
          this.x      = api.W / 2;
          this.timer  = 22;
          this.lives  = 3;
          this.hitCool = 0;
          this.items  = [];
          this.spawn  = 0.4;
          this.scroll = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer = Math.max(0, this.timer - dt);
          this.hitCool = Math.max(0, this.hitCool - dt);
          this.scroll += f * 1.8;

          if (this.timer <= 0) { api.score += 100; api.win(); return; }

          // Steer
          const p = api.pointer;
          if (p.down) this.x += clamp(p.x - this.x, -7, 7) * f * 0.18;
          if (api.keyDown('left'))  this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 20, api.W - 20);

          // Spawn
          this.spawn -= dt;
          if (this.spawn <= 0) {
            const phase = 1 - this.timer / 22;
            this.spawn = clamp(0.38 - phase * 0.12, 0.22, 0.5);
            const isGold = api.chance(0.18);
            this.items.push({
              x: api.rnd(24, api.W - 24),
              y: -18,
              spd: api.rnd(2.0 + phase, 3.4 + phase),
              kind: isGold ? 'star' : api.choice(['arrow', 'arrow', 'rock']),
            });
          }

          for (let i = this.items.length - 1; i >= 0; i--) {
            const it = this.items[i];
            it.y += it.spd * f;
            if (it.y > api.H + 12) { this.items.splice(i, 1); continue; }
            const pY = api.H - 80;
            if (Math.hypot(this.x - it.x, pY - it.y) < 22) {
              if (it.kind === 'star') {
                api.score += 15;
                api.audio.sfx('coin');
                api.burst(it.x, it.y, '#ffd700', 8);
              } else if (this.hitCool <= 0) {
                this.lives--;
                this.hitCool = 1.1;
                api.shake(5, 0.3);
                api.flash('#440000', 0.22);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
              this.items.splice(i, 1);
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a0800');
          // Earthy training ground sky
          const sky = c.createLinearGradient(0, 0, 0, H * 0.5);
          sky.addColorStop(0, '#1a0e00');
          sky.addColorStop(1, '#3a1800');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.5);
          // Back wall + archery targets
          g.rect(0, Math.floor(H * 0.5), W, 22, '#2a1800');
          for (let ti = 0; ti < 4; ti++) {
            const tx = 30 + ti * 58;
            g.circle(tx, Math.floor(H * 0.5) + 11, 10, '#cc2200');
            g.circle(tx, Math.floor(H * 0.5) + 11, 6, '#ffcc00');
            g.circle(tx, Math.floor(H * 0.5) + 11, 2, '#ffffff');
          }
          // Ground
          g.rect(0, H - 70, W, 70, '#1a1000');
          for (let rx = 0; rx < W + 20; rx += 20) {
            const gx = (rx + Math.floor(this.scroll * 0.5)) % (W + 20) - 10;
            g.rect(gx, H - 70, 1, 70, '#150e00');
          }
          // Falling items
          for (const it of this.items) {
            if (it.kind === 'arrow') {
              g.rect(Math.round(it.x) - 1, Math.round(it.y) - 11, 3, 17, '#8a6030');
              g.rect(Math.round(it.x) - 5, Math.round(it.y) - 15, 10, 4, '#cc2200');
              g.rect(Math.round(it.x) - 3, Math.round(it.y) + 6, 2, 4, '#8a6030');
              g.rect(Math.round(it.x) + 2, Math.round(it.y) + 6, 2, 4, '#8a6030');
            } else if (it.kind === 'rock') {
              g.circle(Math.round(it.x), Math.round(it.y), 9, '#4a3a20');
              g.rect(Math.round(it.x) - 4, Math.round(it.y) - 3, 3, 3, '#6a5430');
            } else {
              // Gold star
              c.globalAlpha = 0.28;
              g.circle(Math.round(it.x), Math.round(it.y), 13, '#ffd700');
              c.globalAlpha = 1;
              c.fillStyle = '#ffd700';
              c.beginPath();
              for (let pi = 0; pi < 10; pi++) {
                const ang = (pi / 10) * Math.PI * 2 - Math.PI / 2;
                const rad = pi % 2 === 0 ? 9 : 4;
                pi === 0
                  ? c.moveTo(it.x + Math.cos(ang) * rad, it.y + Math.sin(ang) * rad)
                  : c.lineTo(it.x + Math.cos(ang) * rad, it.y + Math.sin(ang) * rad);
              }
              c.closePath(); c.fill();
            }
          }
          // Mulan soldier
          const my = H - 80;
          const bob = Math.round(Math.sin(api.t * 12) * 2);
          g.rect(Math.round(this.x) - 6, my - 28 + bob, 12, 24, '#8a1800');
          g.rect(Math.round(this.x) - 5, my - 38 + bob, 10, 10, '#c8a060');
          g.rect(Math.round(this.x) - 7, my - 44 + bob, 14, 6, '#6a1200');
          g.rect(Math.round(this.x) - 1, my - 49 + bob, 2, 7, '#cc2200');
          g.rect(Math.round(this.x) - 18, my - 22 + bob, 10, 14, '#6a1200');
          g.rect(Math.round(this.x) + 8, my - 24 + bob, 3, 20, '#8a7030');
          if (this.hitCool > 0 && Math.sin(api.t * 20) > 0) {
            c.globalAlpha = 0.5;
            g.circle(Math.round(this.x), my - 16, 22, '#ff4400');
            c.globalAlpha = 1;
          }
          api.topBar('TRAINING CAMP');
          // Countdown bar
          g.rect(6, H - 10, W - 12, 5, '#1a1000');
          g.rect(6, H - 10, Math.floor((W - 12) * (this.timer / 22)), 5, '#cc2200');
          api.txt('TIME ' + Math.ceil(this.timer), 6, 20, 8, '#ffd700', false, true);
          for (let i = 0; i < 3; i++) {
            g.rect(W - 12 - i * 14, 18, 10, 7, i < this.lives ? '#cc2200' : '#2a1000');
          }
          api.vignette();
        },
      },

      /* ==================== 3. MOUNTAIN PASS ==================== */
      {
        id: 'mountain', name: 'MOUNTAIN PASS', sub: 'FIRE THE CANNON!',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 9, y - 3, 14, 8, '#4a4848');
          g.circle(x - 9, y + 1, 5, '#383838');
          g.rect(x + 4, y - 1, 9, 4, '#4a4848');
          g.circle(x + 5, y - 8, 3, '#cc2200');
        },
        intro: [
          'SHAN-YU\'S ARMY POURS',
          'THROUGH THE MOUNTAIN PASS.',
          'MULAN SEIZES THE CANNON.',
          'Fire to trigger the avalanche!',
        ],
        quote: 'She used a single cannon to summon a thousand echoes from the mountains.',
        help: 'DRAG / ARROWS to aim · TAP / A to fire · 10 hits triggers the avalanche',
        winText: 'The avalanche buries Shan-Yu\'s vanguard. China lives to fight on.',
        loseText: 'The army breaks through. The pass is lost and the capital threatened.',
        init(api) {
          this.aimX    = api.W / 2;
          this.shots   = [];
          this.enemies = [];
          this.hits    = 0;
          this.need    = 10;
          this.missed  = 0;
          this.maxMiss = 5;
          this.spawn   = 0.9;
          this.reload  = 0;
          this.RELOAD  = 0.45;
          this.wave    = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.reload = Math.max(0, this.reload - dt);

          // Aim
          if (api.pointer.down) {
            this.aimX += clamp(api.pointer.x - this.aimX, -7, 7) * f * 0.22;
          }
          if (api.keyDown('left'))  this.aimX -= 3.2 * f;
          if (api.keyDown('right')) this.aimX += 3.2 * f;
          this.aimX = clamp(this.aimX, 18, api.W - 18);

          // Fire
          if ((api.pointer.justDown || api.keyPressed('a') || api.keyPressed('up')) && this.reload <= 0) {
            const cx = api.W / 2;
            const vy = -8.2;
            const vx = (this.aimX - cx) * 0.065;
            this.shots.push({ x: cx, y: api.H - 72, vx, vy });
            this.reload = this.RELOAD;
            api.audio.sfx('shoot');
          }

          // Move shots (with gravity)
          for (let i = this.shots.length - 1; i >= 0; i--) {
            const s = this.shots[i];
            s.x += s.vx * f;
            s.y += s.vy * f;
            s.vy += 0.17 * f;
            if (s.y < -12 || s.y > api.H || s.x < -12 || s.x > api.W + 12) {
              this.shots.splice(i, 1);
            }
          }

          // Spawn enemies
          this.spawn -= dt;
          if (this.spawn <= 0) {
            this.wave++;
            this.spawn = clamp(0.9 - this.wave * 0.05, 0.38, 0.9);
            this.enemies.push({
              x: api.rnd(26, api.W - 26),
              y: -22,
              spd: api.rnd(0.85 + this.wave * 0.06, 1.55 + this.wave * 0.08),
            });
          }

          // Move enemies, check collisions
          for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.y += e.spd * f;
            if (e.y > api.H - 48) {
              this.enemies.splice(i, 1);
              this.missed++;
              api.audio.sfx('hurt');
              if (this.missed >= this.maxMiss) { api.lose(); return; }
              continue;
            }
            let hit = false;
            for (let j = this.shots.length - 1; j >= 0; j--) {
              if (Math.hypot(e.x - this.shots[j].x, e.y - this.shots[j].y) < 18) {
                this.enemies.splice(i, 1);
                this.shots.splice(j, 1);
                this.hits++;
                api.score += 20;
                api.audio.sfx('explode');
                api.burst(e.x, e.y, '#cc2200', 10);
                api.shake(2, 0.14);
                if (this.hits >= this.need) { api.score += 80; api.win(); return; }
                hit = true;
                break;
              }
            }
            if (hit) continue;
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a0c10');
          // Cold grey-blue mountain sky
          const sky = c.createLinearGradient(0, 0, 0, H * 0.6);
          sky.addColorStop(0, '#06080e');
          sky.addColorStop(1, '#181c24');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.6);
          // Mountains
          c.fillStyle = '#161a22';
          c.beginPath();
          c.moveTo(0, H * 0.64);
          c.lineTo(W * 0.1, H * 0.32);
          c.lineTo(W * 0.26, H * 0.50);
          c.lineTo(W * 0.44, H * 0.22);
          c.lineTo(W * 0.60, H * 0.42);
          c.lineTo(W * 0.76, H * 0.16);
          c.lineTo(W, H * 0.38);
          c.lineTo(W, H * 0.64);
          c.closePath();
          c.fill();
          // Snow highlights
          c.fillStyle = '#e0e6f0';
          c.globalAlpha = 0.82;
          c.beginPath();
          c.moveTo(W * 0.44, H * 0.22);
          c.lineTo(W * 0.37, H * 0.35);
          c.lineTo(W * 0.51, H * 0.35);
          c.closePath(); c.fill();
          c.beginPath();
          c.moveTo(W * 0.76, H * 0.16);
          c.lineTo(W * 0.69, H * 0.29);
          c.lineTo(W * 0.83, H * 0.29);
          c.closePath(); c.fill();
          c.globalAlpha = 1;
          // Great Wall battlements
          g.rect(0, H - 128, W, 20, '#201c18');
          for (let b = 4; b < W - 4; b += 16) {
            g.rect(b, H - 144, 10, 18, '#201c18');
          }
          // Ground
          g.rect(0, H - 60, W, 60, '#121010');
          g.rect(0, H - 62, W, 4, '#282420');
          // Enemies (Huns marching down)
          for (const e of this.enemies) {
            const ex = Math.round(e.x), ey = Math.round(e.y);
            g.rect(ex - 5, ey - 14, 10, 16, '#3a1800');
            g.rect(ex - 4, ey - 22, 8, 8, '#c8a060');
            g.rect(ex - 6, ey - 27, 12, 5, '#3a1800');
            g.rect(ex + 5, ey - 18, 2, 14, '#6a5020');
          }
          // Shots
          for (const s of this.shots) {
            g.circle(Math.round(s.x), Math.round(s.y), 5, '#cc2200');
            c.globalAlpha = 0.38;
            g.circle(Math.round(s.x), Math.round(s.y), 8, '#ff6600');
            c.globalAlpha = 1;
          }
          // Cannon
          const cxC = W / 2, cyC = H - 70;
          g.rect(cxC - 22, cyC - 6, 28, 10, '#383838');
          g.circle(cxC - 22, cyC - 1, 7, '#282828');
          // Aim guide line
          c.strokeStyle = 'rgba(255,200,0,.35)';
          c.lineWidth = 1;
          c.setLineDash([4, 6]);
          c.beginPath();
          c.moveTo(cxC, cyC - 4);
          c.lineTo(this.aimX, H * 0.2);
          c.stroke();
          c.setLineDash([]); c.lineWidth = 1;
          // Aim cursor
          c.fillStyle = 'rgba(255,200,0,.6)';
          c.beginPath();
          c.moveTo(this.aimX, H * 0.2 - 8);
          c.lineTo(this.aimX - 5, H * 0.2);
          c.lineTo(this.aimX + 5, H * 0.2);
          c.closePath(); c.fill();
          // Mulan at cannon
          g.rect(cxC + 8, cyC - 32, 10, 26, '#8a1800');
          g.rect(cxC + 9, cyC - 42, 8, 10, '#c8a060');
          g.rect(cxC + 7, cyC - 48, 12, 6, '#6a1200');
          g.rect(cxC + 10, cyC - 52, 2, 6, '#cc2200');
          api.topBar('MOUNTAIN PASS');
          api.txt('HITS ' + this.hits + '/' + this.need, 6, 20, 7, '#ffd700', false, true);
          for (let i = 0; i < 5; i++) {
            g.rect(W - 14 - i * 12, 18, 8, 7, i < this.missed ? '#cc2200' : '#2a1800');
          }
          api.vignette();
        },
      },

      /* ==================== 4. THE PALACE ==================== */
      {
        id: 'palace', name: 'THE PALACE', sub: 'STOP SHAN-YU',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 6, 16, 12, '#8a1800');
          g.rect(x - 10, y - 8, 20, 4, '#6a1200');
          g.rect(x - 3, y - 2, 6, 8, '#1a0800');
          g.rect(x - 4, y - 10, 8, 4, '#cc2200');
        },
        intro: [
          'SHAN-YU HAS INVADED THE',
          'IMPERIAL PALACE.',
          'MULAN MUST SLIP INSIDE.',
          'Dodge the guards\' torches to reach the throne!',
        ],
        quote: 'She stood in the emperor\'s hall and spoke truth where others only bowed.',
        help: 'MOVE up/down to dodge guard torchlight · reach the throne room',
        winText: 'Mulan reaches the Emperor. The palace guard rallies to her call at last.',
        loseText: 'Caught by the guards. The alarm is raised — Shan-Yu prepares his escape.',
        init(api) {
          this.y       = api.H / 2;
          this.dist    = 0;
          this.lives   = 3;
          this.hitCool = 0;
          this.guards  = [];
          this.spawn   = 0.6;
          this.scroll  = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.hitCool = Math.max(0, this.hitCool - dt);
          this.scroll += f * 2.6;
          this.dist   += 0.033 * dt;
          if (this.dist >= 1) { api.score += 100; api.win(); return; }

          // Move up/down
          const p = api.pointer;
          if (p.down) this.y += clamp(p.y - this.y, -6, 6) * f * 0.18;
          if (api.keyDown('up'))   this.y -= 3.2 * f;
          if (api.keyDown('down')) this.y += 3.2 * f;
          this.y = clamp(this.y, 52, api.H - 52);

          // Spawn guards
          this.spawn -= dt;
          if (this.spawn <= 0) {
            this.spawn = api.rnd(1.1, 2.0);
            const top = Math.random() < 0.5;
            const gy = top ? api.rnd(60, api.H * 0.38) : api.rnd(api.H * 0.62, api.H - 60);
            this.guards.push({
              x: api.W + 32,
              y: gy,
              sweepAng: 0,
              sweepDir: Math.random() < 0.5 ? 1 : -1,
              sweepSpd: api.rnd(1.2, 1.9),
              tLen:     api.rnd(44, 62),
            });
          }

          for (let i = this.guards.length - 1; i >= 0; i--) {
            const grd = this.guards[i];
            grd.x -= 1.5 * f;
            grd.sweepAng += grd.sweepDir * grd.sweepSpd * dt;
            if (Math.abs(grd.sweepAng) > 0.68) grd.sweepDir *= -1;
            if (grd.x < -44) { this.guards.splice(i, 1); continue; }

            // Torch cone collision (Mulan is at x=62)
            if (this.hitCool <= 0) {
              const MX = 62;
              const dx = MX - grd.x;
              const dy = this.y - grd.y;
              const dist = Math.hypot(dx, dy);
              const ang = Math.atan2(dy, dx);
              const rel = ang - (grd.sweepAng + Math.PI);
              const norm = ((rel % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
              const diff = Math.min(norm, Math.PI * 2 - norm);
              if (dist < grd.tLen && diff < 0.44) {
                this.lives--;
                this.hitCool = 1.2;
                api.shake(5, 0.3);
                api.flash('#ffcc00', 0.25);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a0400');
          const floorY = H - 52;
          const ceilY  = 52;
          // Stone floor tiles
          for (let tx = 0; tx < W + 32; tx += 30) {
            const fx = (tx + Math.floor(this.scroll * 0.4)) % (W + 32) - 16;
            g.rect(fx, floorY, 28, H, '#1a1000');
            g.rect(fx, floorY, 1, H, '#0e0800');
            g.rect(fx, floorY + 2, 28, 2, '#281400');
          }
          // Walls
          g.rect(0, 0, W, ceilY, '#1a0e00');
          g.rect(0, floorY - 2, W, 4, '#3a1800');
          g.rect(0, ceilY, W, 4, '#3a1800');
          // Ceiling planks
          for (let tx = 0; tx < W + 32; tx += 30) {
            const fx = (tx + Math.floor(this.scroll * 0.4)) % (W + 32) - 16;
            g.rect(fx, 0, 1, ceilY, '#0e0800');
          }
          // Red columns
          for (let col = 0; col < 5; col++) {
            const colX = Math.floor((col * 68 - this.scroll * 0.6) % 68 + 68) % (W + 32) - 16;
            g.rect(colX - 8, ceilY, 16, floorY - ceilY, '#6a1200');
            g.rect(colX - 10, ceilY - 2, 20, 4, '#cc2200');
            g.rect(colX - 10, floorY - 4, 20, 8, '#cc2200');
          }
          // Guards
          for (const grd of this.guards) {
            const gx = Math.round(grd.x), gy = Math.round(grd.y);
            g.rect(gx - 6, gy - 14, 12, 20, '#2a1800');
            g.rect(gx - 4, gy - 22, 8, 8, '#c8a060');
            g.rect(gx - 6, gy - 28, 12, 6, '#3a1200');
            // Torch cone
            const tAng = grd.sweepAng + Math.PI;
            c.globalAlpha = 0.18;
            c.fillStyle = '#ffaa00';
            c.beginPath();
            c.moveTo(gx, gy);
            c.arc(gx, gy, grd.tLen, tAng - 0.44, tAng + 0.44);
            c.closePath(); c.fill();
            c.globalAlpha = 1;
            // Torch stick
            const txE = Math.round(gx + Math.cos(tAng) * 14);
            const tyE = Math.round(gy + Math.sin(tAng) * 14);
            c.strokeStyle = '#8a6030'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(gx, gy); c.lineTo(txE, tyE); c.stroke();
            c.lineWidth = 1;
            g.circle(txE, tyE, 4, '#ff8800');
          }
          // Mulan (sneaking)
          const MX = 62, my = Math.round(this.y);
          g.rect(MX - 5, my - 16, 10, 18, '#cc2200');
          g.rect(MX - 4, my - 24, 8, 8, '#c8a060');
          g.rect(MX - 6, my - 28, 12, 6, '#8a1800');
          const wk = Math.sin(api.t * 10);
          g.rect(MX - 4, my + 2, 4, wk > 0 ? 10 : 7, '#8a1800');
          g.rect(MX,     my + 2, 4, wk > 0 ? 7 : 10, '#8a1800');
          if (this.hitCool > 0 && Math.sin(api.t * 18) > 0) {
            c.globalAlpha = 0.38;
            g.circle(MX, my, 20, '#ffcc00');
            c.globalAlpha = 1;
          }
          api.topBar('THE PALACE');
          api.txt('THRONE', 6, 20, 7, '#7a4a20', false, true);
          g.rect(52, 22, W - 102, 6, '#1a1000');
          g.rect(52, 22, Math.floor((W - 102) * this.dist), 6, '#ffd700');
          for (let i = 0; i < 3; i++) {
            g.rect(W - 12 - i * 14, 18, 10, 7, i < this.lives ? '#ffd700' : '#2a1800');
          }
          api.vignette();
        },
      },

      /* ==================== 5. THE FINAL DUEL ==================== */
      {
        id: 'duel', name: 'THE FINAL DUEL', sub: 'FACE SHAN-YU',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 7, y - 7, 3, 14, '#c0b890');
          g.rect(x + 4, y - 7, 3, 14, '#c0b890');
          g.rect(x - 9, y - 2, 18, 3, '#8a6828');
          g.circle(x - 5, y - 10, 3, '#cc2200');
        },
        intro: [
          'SHAN-YU STANDS ATOP',
          'THE PALACE ROOFTOP.',
          'MULAN FACES HIM ALONE.',
          'Parry every blow to bring him down!',
        ],
        quote: 'She fought not for glory, but for her father, and for China.',
        help: 'TAP / A when Shan-Yu\'s blade enters the GOLD parry zone · 6 parries wins',
        winText: 'Mulan sends Shan-Yu hurtling from the palace roof. China is free.',
        loseText: 'Mulan is overpowered. But the fight for China is not yet done...',
        init(api) {
          this.parries  = 0;
          this.need     = 6;
          this.lives    = 3;
          this.phase    = 'wait'; // 'wait' | 'attack' | 'stagger'
          this.waitLeft = 1.4;
          this.bladeAng = 0;     // 0=raised, 1=struck
          this.bladeSpd = 1.1;
          this.hitCool  = 0;
          this.stagger  = 0;
        },
        update(api, dt) {
          this.hitCool = Math.max(0, this.hitCool - dt);

          if (this.phase === 'wait') {
            this.waitLeft -= dt;
            this.bladeAng  = 0;
            if (this.waitLeft <= 0) {
              this.phase    = 'attack';
              this.bladeSpd = 1.1 + this.parries * 0.18;
              api.audio.sfx('blip');
            }
            return;
          }
          if (this.phase === 'stagger') {
            this.stagger -= dt;
            if (this.stagger <= 0) {
              this.phase    = 'wait';
              this.waitLeft = 0.8 + (this.need - this.parries) * 0.1;
            }
            return;
          }

          // Attack: blade sweeps down
          this.bladeAng += this.bladeSpd * dt;
          const inParry = this.bladeAng >= 0.58 && this.bladeAng < 0.84;

          if (api.pointer.justDown || api.keyPressed('a') || api.keyPressed('up')) {
            if (inParry) {
              this.parries++;
              api.score += 40;
              api.audio.sfx('power');
              api.burst(api.W * 0.38, api.H * 0.44, '#ffd700', 14);
              api.shake(6, 0.3);
              this.phase    = 'stagger';
              this.stagger  = 0.75;
              this.bladeAng = 0;
              if (this.parries >= this.need) { api.score += 100; api.win(); return; }
            } else {
              this.hitCool = 0.4; // brief tap penalty (no life lost)
            }
          }

          // Blade completes = Mulan hit
          if (this.bladeAng >= 1.0) {
            if (this.hitCool <= 0) {
              this.lives--;
              this.hitCool = 0.9;
              api.shake(7, 0.35);
              api.flash('#440000', 0.22);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
            this.phase    = 'wait';
            this.waitLeft = 0.6;
            this.bladeAng = 0;
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#080412');
          // Night sky
          const sky = c.createLinearGradient(0, 0, 0, H * 0.5);
          sky.addColorStop(0, '#040210');
          sky.addColorStop(1, '#1a0a00');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.5);
          // Stars
          for (let i = 0; i < 44; i++) {
            const sx = (i * 79 + 11) % W;
            const sy = (i * 53 + 7) % Math.floor(H * 0.44);
            c.globalAlpha = 0.28 + 0.4 * Math.sin(api.t + i * 0.9);
            g.rect(sx, sy, 1, 1, '#e0d0c0');
          }
          c.globalAlpha = 1;
          // Full moon
          g.circle(Math.floor(W * 0.15), 56, 28, '#ffeeaa');
          c.globalAlpha = 0.2;
          g.circle(Math.floor(W * 0.15), 56, 36, '#ffcc66');
          c.globalAlpha = 1;
          // City silhouettes below
          for (let i = 0; i < 6; i++) {
            const bx = i * 46 + 6;
            const bh = 28 + (i % 3) * 14;
            g.rect(bx, H - 92 - bh, 36, bh, '#100800');
            g.rect(bx + 4, H - 92 - bh - 8, 28, 8, '#100800');
            g.rect(bx - 2, H - 92 - bh - 12, 4, 4, '#100800');
            g.rect(bx + 34, H - 92 - bh - 12, 4, 4, '#100800');
          }
          // Rooftop
          g.rect(0, H - 92, W, 92, '#1a1000');
          for (let tx = 0; tx < W; tx += 18) {
            g.rect(tx, H - 92, 16, 12, '#2a1800');
            g.rect(tx + 2, H - 94, 12, 4, '#cc2200');
          }

          // Parry meter (right side, vertical)
          const mX = W - 20, mY = Math.floor(H * 0.2), mH = Math.floor(H * 0.52);
          g.rect(mX - 6, mY, 12, mH, '#1a1000');
          const pS = mY + Math.floor(mH * 0.58);
          const pE = mY + Math.floor(mH * 0.84);
          g.rect(mX - 6, pS, 12, pE - pS, '#00aa44');
          api.txt('PARRY', mX - 10, mY - 10, 6, '#8a6030', false, true);
          if (this.phase === 'attack') {
            const pct = Math.min(this.bladeAng, 1.0);
            const bY  = mY + Math.floor(mH * pct);
            const inP = pct >= 0.58 && pct < 0.84;
            g.rect(mX - 8, bY - 2, 16, 4, inP ? '#ffd700' : '#cc2200');
            c.globalAlpha = inP ? 0.5 : 0.22;
            g.circle(mX, bY, 8, inP ? '#ffd700' : '#cc2200');
            c.globalAlpha = 1;
          }

          // Shan-Yu
          const SX = Math.floor(W * 0.72);
          const SY = H - 100;
          const stg = this.phase === 'stagger' ? Math.round(Math.sin(api.t * 22) * 4) : 0;
          g.rect(SX - 16 + stg, SY - 42, 32, 36, '#1a0800');
          g.rect(SX - 12 + stg, SY - 58, 24, 16, '#2a1200');
          g.rect(SX - 9  + stg, SY - 70, 18, 12, '#c8a060');
          g.rect(SX - 11 + stg, SY - 78, 22, 8, '#1a0800');
          g.rect(SX - 1  + stg, SY - 86, 2, 10, '#8a1800');
          // Sword arm
          const bladeP = this.phase === 'attack' ? this.bladeAng : 0;
          const sAng = -Math.PI * 0.7 + bladeP * Math.PI * 0.9;
          const armX = SX - 14 + stg, armY = SY - 38;
          c.strokeStyle = '#a0a090'; c.lineWidth = 3;
          c.beginPath();
          c.moveTo(armX, armY);
          c.lineTo(armX + Math.cos(sAng) * 40, armY + Math.sin(sAng) * 40);
          c.stroke(); c.lineWidth = 1;
          if (this.phase === 'attack') {
            c.globalAlpha = 0.55;
            g.circle(
              Math.round(armX + Math.cos(sAng) * 40),
              Math.round(armY + Math.sin(sAng) * 40),
              4, '#e0e0d0');
            c.globalAlpha = 1;
          }

          // Mulan
          const MX2 = Math.floor(W * 0.28), MY2 = H - 96;
          const parryPose = this.phase === 'attack' && this.bladeAng >= 0.48;
          g.rect(MX2 - 5, MY2 - 38, 10, 30, '#cc2200');
          g.rect(MX2 - 4, MY2 - 50, 8, 12, '#c8a060');
          g.rect(MX2 - 6, MY2 - 56, 12, 6, '#6a1200');
          g.rect(MX2 - 1, MY2 - 60, 2, 6, '#cc2200');
          const mSAng = parryPose ? -Math.PI * 0.1 : -Math.PI * 0.55;
          c.strokeStyle = '#c8c0a0'; c.lineWidth = 2;
          c.beginPath();
          c.moveTo(MX2 + 6, MY2 - 34);
          c.lineTo(MX2 + 6 + Math.cos(mSAng) * 35, MY2 - 34 + Math.sin(mSAng) * 35);
          c.stroke(); c.lineWidth = 1;
          if (this.hitCool > 0 && Math.sin(api.t * 20) > 0) {
            c.globalAlpha = 0.44;
            g.circle(MX2, MY2 - 24, 22, '#ff4400');
            c.globalAlpha = 1;
          }

          api.topBar('THE FINAL DUEL');
          api.txt('PARRIES ' + this.parries + '/' + this.need, 6, 20, 7, '#ffd700', false, true);
          for (let i = 0; i < 3; i++) {
            g.rect(W - 62 + i * 16, 18, 10, 7, i < this.lives ? '#cc2200' : '#2a1000');
          }
          api.vignette();
        },
      },

    ], // end chapters
  }); // end RetroSaga.create
}());
