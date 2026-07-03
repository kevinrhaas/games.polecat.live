/* ============================================================================
 * MERLIN — FIVE TRIALS OF THE ENCHANTER
 * Five chapters from Arthurian legend:
 *   1. THE WILD MAGIC    — catch glowing runes, dodge cursed glyphs (collect 12)
 *   2. THE TWO DRAGONS   — dodge Red & White Dragon fire in Vortigern's tower (24s)
 *   3. FALCON'S FLIGHT   — steer the merlin falcon, collect 10 golden feathers (dodge)
 *   4. THE RUNE PUZZLE   — tap the correct glowing rune from the standing stones (10 rounds)
 *   5. NIMUE'S SNARE     — steer through closing crystal spires before trapped (26s)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── palette ── */
  const C = {
    void_:   '#06040e',
    deep:    '#0e0820',
    night:   '#160c30',
    mist:    '#2a1858',
    purple:  '#4a1a7a',
    violet:  '#7a3aaa',
    lavender:'#b87aff',
    silver:  '#c8d0f0',
    starlit: '#e8eeff',
    gold:    '#d4a820',
    goldL:   '#ffe060',
    red:     '#cc2244',
    redL:    '#ff4466',
    white:   '#dde8ff',
    green:   '#1aaa4a',
    greenL:  '#44ee88',
    crystal: '#88ccff',
    crystalL:'#ccf0ff',
  };

  /* ─── emblem: staff with crescent moon and orbiting stars ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Staff
    g.rect(cx - 1, cy - 30, 3, 52, C.gold);
    g.rect(cx - 4, cy - 30, 9, 3, C.gold);
    // Crescent moon atop staff
    g.circle(cx, cy - 36, 8, C.silver);
    c.fillStyle = C.deep; c.beginPath(); c.arc(cx + 4, cy - 38, 7, 0, Math.PI * 2); c.fill();
    // Orbiting star sparks
    const orb = api.t || 0;
    for (let i = 0; i < 5; i++) {
      const a = orb * 1.8 + i * (Math.PI * 2 / 5);
      const sx = cx + Math.cos(a) * 18;
      const sy = cy + Math.sin(a) * 10;
      c.globalAlpha = 0.6 + 0.4 * Math.sin(orb * 3 + i);
      g.rect(sx - 1, sy - 1, 3, 3, i % 2 === 0 ? C.lavender : C.gold);
    }
    c.globalAlpha = 1;
  }

  /* ─── scenery: ancient British forest at night with standing stones ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    // Sky gradient
    const sky = c.createLinearGradient(0, 0, 0, H * 0.62);
    sky.addColorStop(0, '#06040e');
    sky.addColorStop(0.45, '#100828');
    sky.addColorStop(1, '#1a0c38');
    c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.62);

    // Stars (deterministic)
    for (let i = 0; i < 55; i++) {
      const sx = (i * 67 + 19) % W;
      const sy = (i * 43 + 11) % (H * 0.52);
      const br = 0.35 + 0.65 * Math.sin(t * 1.4 + i * 0.9);
      c.globalAlpha = br;
      const sz = i % 7 === 0 ? 2 : 1;
      g.rect(sx, sy, sz, sz, i % 3 === 0 ? C.lavender : C.starlit);
    }
    c.globalAlpha = 1;

    // Crescent moon
    g.circle(W - 50, 46, 20, '#d8d0f0');
    c.fillStyle = '#0e0820'; c.beginPath(); c.arc(W - 40, 40, 17, 0, Math.PI * 2); c.fill();
    // Moon aura
    c.globalAlpha = 0.18 + 0.1 * Math.sin(t * 0.7);
    g.circle(W - 50, 46, 32, C.lavender);
    c.globalAlpha = 1;

    // Ground
    const grd = c.createLinearGradient(0, H * 0.6, 0, H);
    grd.addColorStop(0, '#1a0c38');
    grd.addColorStop(1, '#06040e');
    c.fillStyle = grd; c.fillRect(0, H * 0.6, W, H * 0.4);

    // Rolling hills silhouette
    c.fillStyle = '#0e0820';
    c.beginPath(); c.moveTo(0, H * 0.68);
    for (let x = 0; x <= W; x += 12) {
      c.lineTo(x, H * 0.68 - 12 * Math.sin(x * 0.028 + 0.4) - 8 * Math.sin(x * 0.055));
    }
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();

    // Standing stones
    const stones = [[28, 0.74, 14, 34], [56, 0.72, 11, 28], [110, 0.73, 13, 38], [155, 0.71, 10, 26], [200, 0.73, 12, 32], [235, 0.75, 9, 22]];
    for (const [sx, sy, sw, sh] of stones) {
      g.rect(sx - sw / 2, H * sy - sh, sw, sh, '#160c30');
      g.rect(sx - sw / 2 - 1, H * sy - sh, sw + 2, 4, '#1e1040');
    }

    // Magical wisps drifting
    for (let i = 0; i < 8; i++) {
      const wx = (t * 18 + i * 38) % (W + 20) - 10;
      const wy = H * 0.62 + 10 + Math.sin(t * 1.2 + i * 1.3) * 14 + i * 5;
      c.globalAlpha = 0.25 + 0.2 * Math.sin(t * 2 + i);
      g.circle(wx, wy, 3, i % 2 === 0 ? C.lavender : C.greenL);
    }
    c.globalAlpha = 1;

    // Dark overlay for result/finale/intro scenes
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(6,4,14,.65)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(6,4,14,.55)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── menu: celestial star chart ─── */
  // Five constellation medallions scattered on a night-sky chart
  // Layout: upper-left, upper-right, center, lower-left, lower-right
  const MENU_POSITIONS = [
    { x: 10, y: 30,  w: 108, h: 78 },   // ch1 upper-left
    { x: 152, y: 20, w: 108, h: 78 },   // ch2 upper-right
    { x: 80,  y: 168, w: 110, h: 80 },  // ch3 center
    { x: 8,   y: 300, w: 108, h: 78 },  // ch4 lower-left
    { x: 152, y: 295, w: 108, h: 78 },  // ch5 lower-right
  ];

  // Each chapter's constellation star pattern (relative to card center)
  const CONSTELLATIONS = [
    // ch1: rune spiral
    [[0,-22],[10,-10],[-10,-10],[0,4],[15,14],[-15,14],[0,24]],
    // ch2: two dragons facing
    [[-18,-18],[-6,-8],[6,-8],[18,-18],[-20,4],[0,10],[20,4],[-10,24],[10,24]],
    // ch3: falcon/hawk silhouette
    [[0,-22],[-22,-8],[-10,4],[-24,12],[0,8],[24,12],[10,4],[22,-8]],
    // ch4: four-point rune star
    [[0,-22],[0,22],[-22,0],[22,0],[-12,-12],[12,-12],[-12,12],[12,12]],
    // ch5: spiral/serpent
    [[0,-20],[14,-10],[18,6],[8,18],[-8,18],[-16,6],[-12,-8],[0,-2]],
  ];

  const menu = {
    colors: {
      title: C.lavender,
      label: C.silver,
      cur:   C.goldL,
    },
    layout() { return MENU_POSITIONS.map(p => ({ x: p.x, y: p.y, w: p.w, h: p.h })); },
    card(api, info) {
      const { ch, i, x, y, w, h, sel, done } = info;
      const g = api.gfx, c = api.ctx;
      const cx = x + w / 2, cy = y + h / 2;
      const t = api.t || 0;

      // Card background: circular chart disc
      c.globalAlpha = sel ? 0.88 : 0.68;
      c.fillStyle = sel ? '#1e0c44' : '#130826';
      // Ellipse-shaped chart
      c.beginPath(); c.ellipse(cx, cy, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;

      // Border ring
      c.strokeStyle = done ? C.gold : (sel ? C.lavender : C.mist);
      c.lineWidth = sel ? 2.5 : 1.5;
      c.beginPath(); c.ellipse(cx, cy, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2); c.stroke();

      // Faint grid lines (RA/dec)
      c.globalAlpha = 0.12;
      c.strokeStyle = C.silver; c.lineWidth = 0.7;
      for (let gx = x + 14; gx < x + w - 4; gx += 18) { c.beginPath(); c.moveTo(gx, y + 6); c.lineTo(gx, y + h - 6); c.stroke(); }
      for (let gy = y + 14; gy < y + h - 4; gy += 16) { c.beginPath(); c.moveTo(x + 6, gy); c.lineTo(x + w - 6, gy); c.stroke(); }
      c.globalAlpha = 1;

      // Constellation lines
      const pts = CONSTELLATIONS[i] || [];
      if (pts.length > 1) {
        c.globalAlpha = done ? 0.6 : (sel ? 0.55 : 0.35);
        c.strokeStyle = done ? C.gold : C.lavender;
        c.lineWidth = 1.2;
        for (let pi = 0; pi < pts.length - 1; pi++) {
          c.beginPath();
          c.moveTo(cx + pts[pi][0], cy + pts[pi][1]);
          c.lineTo(cx + pts[pi + 1][0], cy + pts[pi + 1][1]);
          c.stroke();
        }
        // Connect last to second for loops
        c.beginPath();
        c.moveTo(cx + pts[pts.length - 1][0], cy + pts[pts.length - 1][1]);
        c.lineTo(cx + pts[0][0], cy + pts[0][1]);
        c.stroke();
        c.globalAlpha = 1;
      }

      // Stars at constellation points
      for (let pi = 0; pi < pts.length; pi++) {
        const sx = cx + pts[pi][0], sy = cy + pts[pi][1];
        const pulse = 0.6 + 0.4 * Math.sin(t * 2.2 + pi * 0.9 + i);
        c.globalAlpha = done ? 0.95 : (sel ? 0.85 * pulse : 0.5 + 0.3 * pulse);
        const starC = pi === 0 ? C.goldL : (done ? C.gold : (sel ? C.lavender : C.silver));
        const sz = pi === 0 ? 3 : 2;
        g.rect(sx - sz / 2, sy - sz / 2, sz, sz, starC);
      }
      c.globalAlpha = 1;

      // Chapter icon in center
      if (ch.icon) {
        c.globalAlpha = sel ? 1 : 0.75;
        ch.icon(api, cx, cy - 10);
        c.globalAlpha = 1;
      }

      // Chapter name
      const nameC = done ? C.gold : (sel ? C.starlit : C.silver);
      api.txtCFit(ch.name, cx, y + h - 22, 7, nameC, false, w - 8);

      // Done star
      if (done) {
        api.txtC('★', cx, y + 4, 9, C.gold);
      }

      // Selection glow
      if (sel && !done) {
        c.globalAlpha = 0.25 + 0.15 * Math.sin(t * 3);
        g.circle(cx, cy, 30, C.lavender);
        c.globalAlpha = 1;
      }
    },
  };

  /* ═══════════════════════════════════════════════════════════
   * CHAPTER 1: THE WILD MAGIC
   * Catch 12 glowing runes falling from above; avoid dark cursed glyphs.
   * 3 lives, 22s average duration.
   ═══════════════════════════════════════════════════════════ */
  const RUNE_SYMS = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ'];
  function chapter1_wildMagic() {
    return {
      id: 'wildmagic', name: 'THE WILD MAGIC', sub: 'Catch the runes',
      intro: [
        "Deep in the oakwood, the Old Magic",
        "stirs — runes drift down through the",
        "canopy like embers from a distant fire.",
        "Catch the golden ones.",
        "Shun the cursed red.",
      ],
      quote: '"There is only one sin: choosing not to see." — attributed to Merlin',
      help: 'DRAG or ARROWS to catch gold runes · avoid red glyphs · 3 lives',
      winText: 'The forest breathes. The runes settle into Merlin\'s staff, singing.',
      loseText: 'A cursed glyph burns the hand. The Old Magic scatters on the wind.',
      icon(api, x, y) {
        api.gfx.rect(x - 1, y - 8, 2, 16, C.gold);
        api.gfx.rect(x - 5, y - 8, 10, 2, C.gold);
        api.txtC('ᚠ', x, y + 4, 8, C.lavender, true);
      },
      init(api) {
        this.px = api.W / 2;
        this.lives = 3;
        this.caught = 0;
        this.need = 12;
        this.items = [];
        this.spawnT = 0;
        this.spawnRate = 1.8; // seconds between spawns
        this.t = 0;
        this.flashT = 0;
        this.particles = [];
      },
      update(api, dt) {
        this.t += dt;
        this.flashT = Math.max(0, this.flashT - dt);

        // player movement
        const speed = 120;
        if (api.input.down('left')) this.px = clamp(this.px - speed * dt, 14, api.W - 14);
        if (api.input.down('right')) this.px = clamp(this.px + speed * dt, 14, api.W - 14);
        if (api.pointer.down) this.px = clamp(api.pointer.x, 14, api.W - 14);

        // spawn
        this.spawnT += dt;
        if (this.spawnT >= this.spawnRate) {
          this.spawnT = 0;
          this.spawnRate = Math.max(0.85, this.spawnRate - 0.06);
          const cursed = Math.random() < 0.28 + Math.min(0.2, this.caught * 0.01);
          this.items.push({
            x: 18 + Math.random() * (api.W - 36),
            y: -14,
            spd: 55 + Math.random() * 30 + this.caught * 2,
            cursed,
            sym: RUNE_SYMS[Math.floor(Math.random() * RUNE_SYMS.length)],
            wobble: Math.random() * Math.PI * 2,
          });
        }

        const py = api.H - 52;
        for (let i = this.items.length - 1; i >= 0; i--) {
          const it = this.items[i];
          it.y += it.spd * dt;
          it.x += Math.sin(it.wobble + this.t * 1.8) * 0.6;
          const dx = Math.abs(it.x - this.px), dy = Math.abs(it.y - py);
          if (dx < 20 && dy < 18) {
            this.items.splice(i, 1);
            if (it.cursed) {
              this.lives--;
              api.shake(4, 0.4);
              api.flash(C.red, 0.3);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            } else {
              this.caught++;
              api.addScore(20);
              api.audio.sfx('coin');
              for (let p = 0; p < 6; p++) this.particles.push({ x: it.x, y: it.y, vx: (Math.random() - 0.5) * 80, vy: -40 - Math.random() * 60, life: 0.7, maxL: 0.7, c: Math.random() < 0.5 ? C.gold : C.lavender });
              if (this.caught >= this.need) { api.addScore(80); api.win(); return; }
            }
          } else if (it.y > api.H + 10) {
            this.items.splice(i, 1);
            if (!it.cursed) {
              this.lives--;
              api.shake(2, 0.3);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        }

        // particles
        for (let p = this.particles.length - 1; p >= 0; p--) {
          const pt = this.particles[p];
          pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 120 * dt;
          pt.life -= dt;
          if (pt.life <= 0) this.particles.splice(p, 1);
        }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
        // forest bg
        const bg = c.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#06040e'); bg.addColorStop(0.5, '#100828'); bg.addColorStop(1, '#0e0c20');
        c.fillStyle = bg; c.fillRect(0, 0, W, H);
        // canopy silhouette
        c.fillStyle = '#06040e';
        for (let tx = -10; tx < W + 10; tx += 28) {
          const th = 60 + Math.sin(tx * 0.08) * 20;
          c.beginPath(); c.moveTo(tx, H * 0.22 + th);
          c.lineTo(tx + 14, H * 0.22); c.lineTo(tx + 28, H * 0.22 + th);
          c.lineTo(tx + 28, 0); c.lineTo(tx, 0); c.closePath(); c.fill();
        }
        // floor mist
        c.globalAlpha = 0.22; c.fillStyle = C.lavender; c.fillRect(0, H - 38, W, 38);
        c.globalAlpha = 1;

        // falling items
        for (const it of this.items) {
          const pulse = 0.7 + 0.3 * Math.sin(this.t * 4 + it.wobble);
          c.globalAlpha = 0.6 + 0.4 * pulse;
          const col = it.cursed ? C.red : C.gold;
          g.circle(it.x, it.y, 10, it.cursed ? 'rgba(180,20,40,.18)' : 'rgba(200,160,20,.18)');
          api.txtC(it.sym, it.x, it.y - 5, 13, col, true);
          c.globalAlpha = 1;
        }

        // particles
        for (const pt of this.particles) {
          c.globalAlpha = pt.life / pt.maxL * 0.9;
          g.rect(pt.x - 1.5, pt.y - 1.5, 3, 3, pt.c);
        }
        c.globalAlpha = 1;

        // player: Merlin catcher (staff silhouette)
        const py = H - 52;
        g.rect(this.px - 1, py - 12, 3, 20, C.silver);
        g.rect(this.px - 10, py - 14, 20, 3, C.gold);
        g.circle(this.px, py - 12, 5, C.lavender);

        // HUD
        api.topBar('RUNES  ' + this.caught + '/' + this.need);
        for (let li = 0; li < 3; li++) g.rect(W - 10 - li * 14, 3, 10, 10, li < this.lives ? C.red : '#2a0a10');
      },
    };
  }

  /* ═══════════════════════════════════════════════════════════
   * CHAPTER 2: THE TWO DRAGONS
   * Dodge Red & White Dragon fire attacks in 3 lanes.
   * Survive 24 seconds.
   ═══════════════════════════════════════════════════════════ */
  function chapter2_twoDragons() {
    return {
      id: 'twodragons', name: 'THE TWO DRAGONS', sub: 'Survive the prophecy',
      intro: [
        "Beneath Vortigern's crumbling tower",
        "slumber two ancient dragons.",
        "The Red represents the invaders;",
        "the White, the true sons of Britain.",
        "Merlin stands between their fury.",
      ],
      quote: '"The red dragon shall be defeated and the white dragon shall triumph." — Geoffrey of Monmouth',
      help: 'LEFT / RIGHT to dodge · survive both dragon fire-breath · 3 lives',
      winText: 'The dragons exhaust themselves. Merlin\'s prophecy stands unburnt.',
      loseText: 'The crossfire catches Merlin. The prophecy turns to ash.',
      icon(api, x, y) {
        api.gfx.rect(x - 14, y - 6, 8, 4, C.red);
        api.gfx.rect(x - 8, y - 10, 4, 8, C.red);
        api.gfx.rect(x + 6, y - 6, 8, 4, C.silver);
        api.gfx.rect(x + 4, y - 10, 4, 8, C.silver);
      },
      init(api) {
        this.lane = 1; // 0=left, 1=center, 2=right
        this.lives = 3;
        this.elapsed = 0;
        this.need = 24;
        this.attacks = [];
        this.spawnT = 0;
        this.spawnRate = 2.2;
        this.lastDir = -1;
        this.inputLock = 0;
        this.particles = [];
        this.warning = null;
        this.warnT = 0;
      },
      update(api, dt) {
        this.elapsed += dt;
        this.spawnT += dt;
        this.inputLock = Math.max(0, this.inputLock - dt);
        this.warnT = Math.max(0, this.warnT - dt);

        // Input: change lane
        if (this.inputLock <= 0) {
          const left = api.input.pressed('left') || (api.pointer.justDown && api.pointer.x < api.W / 3);
          const right = api.input.pressed('right') || (api.pointer.justDown && api.pointer.x > api.W * 2 / 3);
          if (left && this.lane > 0) { this.lane--; this.inputLock = 0.18; api.audio.sfx('blip'); }
          else if (right && this.lane < 2) { this.lane++; this.inputLock = 0.18; api.audio.sfx('blip'); }
        }

        // Spawn dragon attacks
        if (this.spawnT >= this.spawnRate) {
          this.spawnT = 0;
          this.spawnRate = Math.max(1.0, this.spawnRate - 0.07);
          // Pick lane to attack, prefer varying from last
          let targetLane;
          do { targetLane = Math.floor(Math.random() * 3); } while (targetLane === this.lastDir && Math.random() < 0.6);
          this.lastDir = targetLane;
          const fromRed = Math.random() < 0.5;
          this.warning = { lane: targetLane, fromRed, t: 0, dur: 0.7 };
          this.warnT = 0.7;
          this.attacks.push({
            lane: targetLane,
            fromRed,
            delay: 0.7,
            len: 0,
            maxLen: api.H - 80,
            spd: api.H * 0.9,
          });
        }

        // Advance attacks
        const laneX = [44, api.W / 2, api.W - 44];
        for (let a = this.attacks.length - 1; a >= 0; a--) {
          const atk = this.attacks[a];
          if (atk.delay > 0) { atk.delay -= dt; continue; }
          atk.len += atk.spd * dt;
          if (atk.len >= atk.maxLen) {
            this.attacks.splice(a, 1);
          }
          // Hit check when beam reaches player area (y ~ H - 70)
          const beamEnd = atk.len;
          const topY = atk.fromRed ? 48 : api.H - 48 - beamEnd;
          const botY = atk.fromRed ? 48 + beamEnd : api.H - 48;
          const playerY = api.H - 72;
          if (Math.abs(laneX[atk.lane] - laneX[this.lane]) < 24 && playerY >= topY && playerY <= botY) {
            // Check if beam freshly hits this frame
            if (!atk.hit) {
              atk.hit = true;
              this.lives--;
              api.shake(5, 0.4);
              api.flash(atk.fromRed ? C.red : C.silver, 0.35);
              api.audio.sfx('hurt');
              for (let p = 0; p < 10; p++) this.particles.push({ x: laneX[this.lane], y: playerY, vx: (Math.random() - 0.5) * 90, vy: -50 - Math.random() * 80, life: 0.6, maxL: 0.6, c: atk.fromRed ? C.redL : C.crystalL });
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        }

        // particles
        for (let p = this.particles.length - 1; p >= 0; p--) {
          const pt = this.particles[p];
          pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 100 * dt;
          pt.life -= dt;
          if (pt.life <= 0) this.particles.splice(p, 1);
        }

        if (this.elapsed >= this.need) { api.addScore(100); api.win(); }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
        // Dark stone tower interior
        c.fillStyle = '#0a0616'; c.fillRect(0, 0, W, H);
        // Stone wall texture
        c.globalAlpha = 0.25;
        for (let row = 0; row < 10; row++) {
          const off = row % 2 === 0 ? 0 : 18;
          for (let col = -1; col < W / 36 + 1; col++) {
            c.strokeStyle = '#2a1858'; c.lineWidth = 1;
            c.strokeRect(col * 36 + off + 2, row * 50 + 2, 32, 46);
          }
        }
        c.globalAlpha = 1;

        const laneX = [44, W / 2, W - 44];

        // Draw Red Dragon (top) and White Dragon silhouettes
        // Red Dragon (top-left)
        c.fillStyle = C.red; c.globalAlpha = 0.7;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(70, 0); c.lineTo(70, 54); c.lineTo(50, 62); c.lineTo(20, 54); c.lineTo(0, 62); c.closePath(); c.fill();
        c.globalAlpha = 1;
        api.txtCFit('RED', 35, 8, 7, C.redL, false, 60);
        // White Dragon (bottom-right)
        c.fillStyle = '#2a2a44'; c.globalAlpha = 0.7;
        c.beginPath(); c.moveTo(W, H); c.lineTo(W - 70, H); c.lineTo(W - 70, H - 54); c.lineTo(W - 50, H - 62); c.lineTo(W - 20, H - 54); c.lineTo(W, H - 62); c.closePath(); c.fill();
        c.globalAlpha = 1;
        api.txtCFit('WHITE', W - 35, H - 30, 7, C.silver, false, 60);

        // Lane markers
        for (let li = 0; li < 3; li++) {
          c.globalAlpha = 0.15;
          g.rect(laneX[li] - 22, 68, 44, H - 136, '#4a3070');
          c.globalAlpha = 1;
          g.rect(laneX[li] - 22, H - 86, 44, 3, C.mist);
        }

        // Dragon fire attacks
        for (const atk of this.attacks) {
          if (atk.delay > 0) {
            // Warning flash
            const pulse = Math.sin(atk.delay * 24) > 0;
            if (pulse) {
              c.globalAlpha = 0.5;
              g.rect(laneX[atk.lane] - 20, atk.fromRed ? 64 : H - 88, 40, 24, atk.fromRed ? C.red : C.silver);
              c.globalAlpha = 1;
            }
            continue;
          }
          const bx = laneX[atk.lane] - 8;
          const by = atk.fromRed ? 64 : H - 64 - atk.len;
          const bw = 16;
          const bh = atk.len;
          // Beam gradient
          const beamGrd = c.createLinearGradient(bx, by, bx, by + bh);
          if (atk.fromRed) {
            beamGrd.addColorStop(0, C.redL);
            beamGrd.addColorStop(1, 'rgba(200,20,40,0)');
          } else {
            beamGrd.addColorStop(0, 'rgba(200,210,255,0)');
            beamGrd.addColorStop(1, C.silver);
          }
          c.fillStyle = beamGrd;
          c.fillRect(bx, by, bw, bh);
          // Glow
          c.globalAlpha = 0.4;
          g.rect(bx - 4, by, bw + 8, bh, atk.fromRed ? 'rgba(200,30,50,.3)' : 'rgba(200,210,255,.3)');
          c.globalAlpha = 1;
        }

        // Particles
        for (const pt of this.particles) {
          c.globalAlpha = pt.life / pt.maxL;
          g.rect(pt.x - 2, pt.y - 2, 4, 4, pt.c);
        }
        c.globalAlpha = 1;

        // Player: Merlin silhouette
        const py = H - 72;
        const plx = laneX[this.lane];
        g.rect(plx - 1, py - 20, 3, 28, C.silver);
        g.circle(plx, py - 24, 7, C.lavender);
        // Robe
        c.fillStyle = C.mist; c.globalAlpha = 0.85;
        c.beginPath(); c.moveTo(plx - 9, py - 10); c.lineTo(plx + 9, py - 10); c.lineTo(plx + 14, py + 8); c.lineTo(plx - 14, py + 8); c.closePath(); c.fill();
        c.globalAlpha = 1;

        // Lane indicator dots
        for (let li = 0; li < 3; li++) {
          g.circle(laneX[li], H - 90, li === this.lane ? 5 : 3, li === this.lane ? C.lavender : C.mist);
        }

        // Timer bar
        const pct = Math.min(1, this.elapsed / this.need);
        g.rect(8, H - 16, W - 16, 6, '#1a0e30');
        g.rect(8, H - 16, (W - 16) * pct, 6, C.lavender);
        api.txtCFit(Math.ceil(this.need - this.elapsed) + 's', W / 2, H - 28, 8, C.silver);

        // Lives
        for (let li = 0; li < 3; li++) {
          g.circle(14 + li * 16, H - 28, li < this.lives ? 5 : 3, li < this.lives ? C.gold : C.mist);
        }
      },
    };
  }

  /* ═══════════════════════════════════════════════════════════
   * CHAPTER 3: FALCON'S FLIGHT
   * Steer the merlin falcon through arrows; collect 10 gold feathers.
   * Free movement, 3 lives.
   ═══════════════════════════════════════════════════════════ */
  function chapter3_falconFlight() {
    return {
      id: 'falconflight', name: "FALCON'S FLIGHT", sub: 'Collect feathers',
      intro: [
        "Merlin transforms young Arthur",
        "into a merlin falcon, teaching him",
        "freedom and perspective.",
        "Soar through the arrows.",
        "Catch the golden feathers.",
      ],
      quote: '"The best thing for being sad is to learn something." — T. H. White (The Once and Future King)',
      help: 'DRAG or ARROWS to fly · catch gold feathers · dodge arrows · 3 lives',
      winText: 'The falcon wheels upward, feathers glowing. A lesson remembered.',
      loseText: 'An arrow finds its mark. Merlin calls the falcon back to earth.',
      icon(api, x, y) {
        api.gfx.rect(x - 14, y - 4, 10, 4, C.gold);
        api.gfx.rect(x + 4, y - 4, 10, 4, C.gold);
        api.gfx.rect(x - 3, y - 10, 6, 14, C.lavender);
      },
      init(api) {
        this.px = api.W / 2;
        this.py = api.H / 2;
        this.vx = 0; this.vy = 0;
        this.lives = 3;
        this.caught = 0;
        this.need = 10;
        this.items = []; // feathers and arrows
        this.spawnT = 0;
        this.spawnRate = 1.2;
        this.t = 0;
        this.particles = [];
        this.invT = 0;
      },
      update(api, dt) {
        this.t += dt;
        this.invT = Math.max(0, this.invT - dt);
        const W = api.W, H = api.H;

        // Movement
        const spd = 140;
        let ax = 0, ay = 0;
        if (api.input.down('left')) ax -= spd;
        if (api.input.down('right')) ax += spd;
        if (api.input.down('up')) ay -= spd;
        if (api.input.down('down')) ay += spd;
        if (api.pointer.down) {
          const dx = api.pointer.x - this.px, dy = api.pointer.y - this.py;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > 6) { ax = dx / d * spd; ay = dy / d * spd; }
        }
        this.vx = this.vx * 0.78 + ax * 0.22;
        this.vy = this.vy * 0.78 + ay * 0.22;
        this.px = clamp(this.px + this.vx * dt, 14, W - 14);
        this.py = clamp(this.py + this.vy * dt, 30, H - 52);

        // Spawn feathers and arrows
        this.spawnT += dt;
        if (this.spawnT >= this.spawnRate) {
          this.spawnT = 0;
          this.spawnRate = Math.max(0.7, this.spawnRate - 0.04);
          const isArrow = Math.random() < 0.35 + Math.min(0.25, this.caught * 0.025);
          // Spawn from edges
          const side = Math.random();
          let sx, sy, svx, svy;
          if (side < 0.25) { sx = -10; sy = 30 + Math.random() * (H - 80); svx = 40 + Math.random() * 30; svy = (Math.random() - 0.5) * 40; }
          else if (side < 0.5) { sx = W + 10; sy = 30 + Math.random() * (H - 80); svx = -(40 + Math.random() * 30); svy = (Math.random() - 0.5) * 40; }
          else if (side < 0.75) { sx = 10 + Math.random() * (W - 20); sy = -10; svx = (Math.random() - 0.5) * 40; svy = 40 + Math.random() * 30; }
          else { sx = 10 + Math.random() * (W - 20); sy = H + 10; svx = (Math.random() - 0.5) * 40; svy = -(40 + Math.random() * 30); }
          this.items.push({ x: sx, y: sy, vx: svx, vy: svy, arrow: isArrow, r: isArrow ? 7 : 9 });
        }

        // Update and check items
        for (let i = this.items.length - 1; i >= 0; i--) {
          const it = this.items[i];
          it.x += it.vx * dt; it.y += it.vy * dt;
          // Feathers drift
          if (!it.arrow) it.x += Math.sin(this.t * 1.5 + i) * 0.5;
          const dx = it.x - this.px, dy = it.y - this.py;
          if (dx * dx + dy * dy < (it.r + 8) * (it.r + 8)) {
            this.items.splice(i, 1);
            if (it.arrow) {
              if (this.invT <= 0) {
                this.lives--;
                this.invT = 1.2;
                api.shake(4, 0.35);
                api.flash(C.red, 0.3);
                api.audio.sfx('hurt');
                for (let p = 0; p < 8; p++) this.particles.push({ x: this.px, y: this.py, vx: (Math.random() - 0.5) * 100, vy: -60 - Math.random() * 60, life: 0.5, maxL: 0.5, c: C.redL });
                if (this.lives <= 0) { api.lose(); return; }
              }
            } else {
              this.caught++;
              api.addScore(25);
              api.audio.sfx('coin');
              for (let p = 0; p < 7; p++) this.particles.push({ x: it.x, y: it.y, vx: (Math.random() - 0.5) * 80, vy: -50 - Math.random() * 50, life: 0.6, maxL: 0.6, c: C.gold });
              if (this.caught >= this.need) { api.addScore(80); api.win(); return; }
            }
            continue;
          }
          // Cull off-screen
          if (it.x < -30 || it.x > W + 30 || it.y < -30 || it.y > H + 30) this.items.splice(i, 1);
        }

        for (let p = this.particles.length - 1; p >= 0; p--) {
          const pt = this.particles[p];
          pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 100 * dt;
          pt.life -= dt;
          if (pt.life <= 0) this.particles.splice(p, 1);
        }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
        // Sky
        const sky = c.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#06040e'); sky.addColorStop(1, '#160c34');
        c.fillStyle = sky; c.fillRect(0, 0, W, H);
        // Cloud wisps
        c.globalAlpha = 0.09;
        for (let cl = 0; cl < 6; cl++) {
          const cx2 = ((this.t * 12 + cl * 52) % (W + 60)) - 30;
          const cy2 = 40 + cl * 30 + Math.sin(cl * 1.3) * 20;
          g.circle(cx2, cy2, 20, C.silver);
          g.circle(cx2 + 15, cy2 - 6, 16, C.silver);
        }
        c.globalAlpha = 1;

        // Items (feathers and arrows)
        for (const it of this.items) {
          if (it.arrow) {
            // Arrow: a thin line with tip
            const ang = Math.atan2(it.vy, it.vx);
            c.save(); c.translate(it.x, it.y); c.rotate(ang);
            c.strokeStyle = '#8a6830'; c.lineWidth = 2.5;
            c.beginPath(); c.moveTo(-12, 0); c.lineTo(10, 0); c.stroke();
            c.fillStyle = '#c0a040';
            c.beginPath(); c.moveTo(10, 0); c.lineTo(5, -3); c.lineTo(5, 3); c.closePath(); c.fill();
            c.restore();
          } else {
            // Golden feather
            c.globalAlpha = 0.9;
            const fa = Math.atan2(it.vy || 1, it.vx || 1) + Math.PI / 2;
            c.save(); c.translate(it.x, it.y); c.rotate(fa);
            c.strokeStyle = C.gold; c.lineWidth = 2;
            c.beginPath(); c.moveTo(0, -9); c.quadraticCurveTo(5, 0, 0, 9); c.stroke();
            c.beginPath(); c.moveTo(0, -9); c.quadraticCurveTo(-5, 0, 0, 9); c.stroke();
            c.restore();
            c.globalAlpha = 1;
          }
        }

        // Particles
        for (const pt of this.particles) {
          c.globalAlpha = pt.life / pt.maxL;
          g.rect(pt.x - 2, pt.y - 2, 4, 4, pt.c);
        }
        c.globalAlpha = 1;

        // Player: falcon
        const inv = this.invT > 0 && Math.sin(this.invT * 20) > 0;
        if (!inv) {
          c.globalAlpha = 0.9;
          // Wings
          const wFlap = Math.sin(this.t * 14) * 6;
          c.fillStyle = C.gold;
          c.beginPath(); c.moveTo(this.px, this.py); c.lineTo(this.px - 18, this.py - wFlap); c.lineTo(this.px - 8, this.py + 2); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(this.px, this.py); c.lineTo(this.px + 18, this.py - wFlap); c.lineTo(this.px + 8, this.py + 2); c.closePath(); c.fill();
          // Body
          c.fillStyle = C.lavender;
          c.beginPath(); c.ellipse(this.px, this.py, 5, 8, 0, 0, Math.PI * 2); c.fill();
          // Eye
          g.rect(this.px - 2, this.py - 4, 2, 2, '#ff8800');
          c.globalAlpha = 1;
        }

        // HUD
        api.topBar('FEATHERS  ' + this.caught + '/' + this.need);
        for (let li = 0; li < 3; li++) g.rect(W - 10 - li * 14, 3, 10, 10, li < this.lives ? C.red : '#2a0a10');
      },
    };
  }

  /* ═══════════════════════════════════════════════════════════
   * CHAPTER 4: THE RUNE PUZZLE
   * Tap the correct glowing rune from standing stones. 10 rounds.
   * 3 misses lose. Timer per round gets shorter.
   ═══════════════════════════════════════════════════════════ */
  function chapter4_runePuzzle() {
    return {
      id: 'runepuzzle', name: 'THE RUNE PUZZLE', sub: 'Read the stones',
      intro: [
        "The standing stones speak in the",
        "Old Tongue. One rune pulses with",
        "true power — the others are traps.",
        "Read the stones swiftly.",
        "Mistakes have a cost.",
      ],
      quote: '"Knowledge is the most direct road to wisdom." — Merlin, in tradition',
      help: 'TAP the glowing rune · avoid the fakes · 10 rounds · 3 misses',
      winText: 'The stones grow still. Merlin has read the circle rightly.',
      loseText: 'A wrong rune cracks the stone circle. The pattern is broken.',
      icon(api, x, y) {
        const g = api.gfx;
        g.rect(x - 8, y - 10, 6, 20, C.mist);
        g.rect(x + 2, y - 10, 6, 20, C.mist);
        api.txtC('ᚦ', x - 5, y - 4, 7, C.lavender, true);
        api.txtC('ᚱ', x + 5, y - 4, 7, C.gold, true);
      },
      init(api) {
        this.misses = 0;
        this.maxMiss = 3;
        this.round = 0;
        this.need = 10;
        this.timer = 3.5;
        this.maxTimer = 3.5;
        this.stones = [];
        this.correct = -1;
        this.feedback = null;
        this.feedT = 0;
        this.inputLock = 0;
        this._buildRound(api);
      },
      _buildRound(api) {
        const n = 4 + Math.min(2, Math.floor(this.round / 3)); // 4..6 stones
        this.stones = [];
        this.correct = Math.floor(Math.random() * n);
        this.maxTimer = Math.max(1.8, 3.5 - this.round * 0.15);
        this.timer = this.maxTimer;
        const runeSet = RUNE_SYMS.slice().sort(() => Math.random() - 0.5).slice(0, n);
        const cols = n <= 4 ? 2 : (n <= 6 ? 3 : 3);
        const rows = Math.ceil(n / cols);
        const cw = api.W / (cols + 1);
        const rowH = 90;
        const startY = api.H / 2 - (rows - 1) * rowH / 2 - 20;
        for (let i = 0; i < n; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          this.stones.push({
            x: cw * (col + 1),
            y: startY + row * rowH,
            w: 50, h: 64,
            sym: runeSet[i],
            isCorrect: i === this.correct,
            pulse: Math.random() * Math.PI * 2,
          });
        }
        this.inputLock = 0.25;
        this.feedback = null;
      },
      update(api, dt) {
        if (this.feedT > 0) { this.feedT -= dt; if (this.feedT <= 0) { if (this.feedback === 'correct') this._buildRound(api); } return; }
        this.inputLock = Math.max(0, this.inputLock - dt);
        this.timer -= dt;

        if (this.timer <= 0) {
          this.misses++;
          api.shake(3, 0.3);
          api.audio.sfx('hurt');
          this.feedback = 'miss';
          this.feedT = 0.7;
          if (this.misses >= this.maxMiss) { api.lose(); return; }
          this.round = Math.min(this.round + 1, this.need - 1);
          return;
        }

        if (this.inputLock > 0) return;

        // Check tap on stones
        if (api.pointer.justDown) {
          for (let i = 0; i < this.stones.length; i++) {
            const s = this.stones[i];
            if (Math.abs(api.pointer.x - s.x) < s.w / 2 + 4 && Math.abs(api.pointer.y - s.y) < s.h / 2 + 4) {
              if (s.isCorrect) {
                this.round++;
                api.addScore(30);
                api.audio.sfx('coin');
                api.burst(s.x, s.y, C.lavender, 8);
                this.feedback = 'correct';
                this.feedT = 0.55;
                if (this.round >= this.need) { api.addScore(100); api.win(); return; }
              } else {
                this.misses++;
                api.shake(4, 0.35);
                api.flash(C.red, 0.3);
                api.audio.sfx('hurt');
                this.feedback = 'wrong';
                this.feedT = 0.7;
                if (this.misses >= this.maxMiss) { api.lose(); return; }
                this.round = Math.min(this.round + 1, this.need - 1);
              }
              break;
            }
          }
        }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
        // Stone circle clearing at night
        const bg = c.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#06040e'); bg.addColorStop(1, '#100828');
        c.fillStyle = bg; c.fillRect(0, 0, W, H);
        // Grass
        c.fillStyle = '#0e0c1e'; c.fillRect(0, H * 0.78, W, H * 0.22);
        // Ground mist
        c.globalAlpha = 0.2;
        g.circle(W / 2, H * 0.82, 80, C.lavender);
        c.globalAlpha = 1;

        // Draw stones
        const t = api.t || 0;
        for (let i = 0; i < this.stones.length; i++) {
          const s = this.stones[i];
          // Stone shape
          const pulse = s.isCorrect ? (0.6 + 0.4 * Math.sin(t * 3.5 + s.pulse)) : 1;
          c.fillStyle = s.isCorrect ? '#1a0c38' : '#100820';
          c.beginPath();
          c.moveTo(s.x - s.w / 2, s.y + s.h / 2);
          c.lineTo(s.x + s.w / 2, s.y + s.h / 2);
          c.lineTo(s.x + s.w / 2 - 4, s.y - s.h / 2);
          c.lineTo(s.x - s.w / 2 + 4, s.y - s.h / 2);
          c.closePath(); c.fill();
          // Border
          c.strokeStyle = s.isCorrect ? C.lavender : C.mist;
          c.lineWidth = s.isCorrect ? 2 : 1;
          c.globalAlpha = s.isCorrect ? pulse : 0.5;
          c.stroke();
          c.globalAlpha = 1;
          // Glow on correct
          if (s.isCorrect && this.feedT <= 0) {
            c.globalAlpha = 0.18 * pulse;
            g.circle(s.x, s.y - 4, 30, C.lavender);
            c.globalAlpha = 1;
          }
          // Rune
          const rc = s.isCorrect ? (this.feedback === 'correct' ? C.goldL : C.lavender) : (this.feedback === 'wrong' ? C.red : C.silver);
          c.globalAlpha = s.isCorrect ? pulse : 0.65;
          api.txtC(s.sym, s.x, s.y - 10, 18, rc, true);
          c.globalAlpha = 1;
        }

        // Feedback flash text
        if (this.feedback && this.feedT > 0) {
          const alpha = Math.min(1, this.feedT / 0.3);
          c.globalAlpha = alpha;
          if (this.feedback === 'correct') api.txtCFit('✦ CORRECT ✦', W / 2, H * 0.18, 13, C.goldL, false);
          else if (this.feedback === 'wrong') api.txtCFit('✗ WRONG', W / 2, H * 0.18, 13, C.redL, false);
          else api.txtCFit('TIME!', W / 2, H * 0.18, 13, C.red, false);
          c.globalAlpha = 1;
        }

        // Timer bar
        const pct = Math.max(0, this.timer / this.maxTimer);
        g.rect(8, H - 18, W - 16, 6, '#1a0e30');
        const timerC = pct > 0.4 ? C.lavender : (pct > 0.2 ? C.gold : C.red);
        g.rect(8, H - 18, (W - 16) * pct, 6, timerC);

        // Round counter
        api.txtCFit(this.round + '/' + this.need, W / 2, H - 40, 11, C.gold, false);
        // Misses
        for (let m = 0; m < this.maxMiss; m++) {
          g.circle(W - 14 - m * 16, H - 42, 5, m < this.misses ? C.red : C.mist);
        }
      },
    };
  }

  /* ═══════════════════════════════════════════════════════════
   * CHAPTER 5: NIMUE'S SNARE
   * Steer through crystal spires closing from both sides. 26s.
   * 3 lives. Corridor narrows over time.
   ═══════════════════════════════════════════════════════════ */
  function chapter5_nimueSnare() {
    return {
      id: 'nimuesnare', name: "NIMUE'S SNARE", sub: 'Escape the crystal',
      intro: [
        "Nimue has turned Merlin's own magic",
        "against him. Crystal spires grow",
        "from the cave walls, closing in.",
        "Guide him through the narrowing gap",
        "before the trap shuts forever.",
      ],
      quote: '"Merlin taught her his enchantments, and she used them to enclose him for ever." — Malory, Le Morte d\'Arthur',
      help: 'DRAG or ARROWS to steer · survive 26 seconds · 3 lives',
      winText: 'The crystal cracks. Merlin finds the last gap and is through.',
      loseText: 'The spires close. The enchantment holds. Sleep, old wizard.',
      icon(api, x, y) {
        api.gfx.rect(x - 12, y - 12, 6, 18, C.crystalL);
        api.gfx.rect(x + 6, y - 8, 6, 14, C.crystal);
        api.gfx.rect(x - 3, y - 16, 6, 24, C.lavender);
      },
      init(api) {
        this.px = api.W / 2;
        this.py = api.H / 2;
        this.lives = 3;
        this.elapsed = 0;
        this.need = 26;
        this.leftW = 20;   // width of left wall
        this.rightW = 20;  // width of right wall
        this.growRate = 1.6; // pixels per second each wall grows
        this.spires = [];
        this.spireT = 0;
        this.spireRate = 0.9;
        this.particles = [];
        this.invT = 0;
        this._spawnSpires(api);
      },
      _spawnSpires(api) {
        // Left wall spires
        for (let i = 0; i < 5; i++) {
          this.spires.push({ side: 'left', x: 0, y: 50 + i * 90 + Math.random() * 40 - 20, w: 18 + Math.random() * 16, h: 8 + Math.random() * 10, spd: 0, t: i * 0.18 });
        }
        // Right wall spires
        for (let i = 0; i < 5; i++) {
          this.spires.push({ side: 'right', x: api.W, y: 60 + i * 90 + Math.random() * 40 - 20, w: 18 + Math.random() * 16, h: 8 + Math.random() * 10, spd: 0, t: i * 0.22 });
        }
      },
      update(api, dt) {
        this.elapsed += dt;
        this.invT = Math.max(0, this.invT - dt);
        const W = api.W, H = api.H;

        // Movement
        const spd = 130;
        let ax = 0, ay = 0;
        if (api.input.down('left')) ax -= spd;
        if (api.input.down('right')) ax += spd;
        if (api.input.down('up')) ay -= spd;
        if (api.input.down('down')) ay += spd;
        if (api.pointer.down) {
          const dx = api.pointer.x - this.px, dy = api.pointer.y - this.py;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > 5) { ax = dx / d * spd; ay = dy / d * spd; }
        }
        this.px += ax * dt;
        this.py += ay * dt;

        // Wall growth
        const prog = this.elapsed / this.need;
        this.leftW = 20 + prog * 60;
        this.rightW = 20 + prog * 60;
        const leftEdge = this.leftW + 6;
        const rightEdge = W - this.rightW - 6;
        this.px = clamp(this.px, leftEdge, rightEdge);
        this.py = clamp(this.py, 38, H - 52);

        // Spire animations
        for (const sp of this.spires) {
          sp.t += dt;
          sp.y -= 22 * dt; // scroll upward
          if (sp.y < -30) sp.y = H + 30 + Math.random() * 80;
        }

        // Collision with walls
        if (this.invT <= 0) {
          const inLeftWall = this.px < this.leftW + 8;
          const inRightWall = this.px > W - this.rightW - 8;
          if (inLeftWall || inRightWall) {
            this.lives--;
            this.invT = 1.0;
            api.shake(5, 0.4);
            api.flash(C.crystal, 0.35);
            api.audio.sfx('hurt');
            for (let p = 0; p < 10; p++) this.particles.push({ x: this.px, y: this.py, vx: (Math.random() - 0.5) * 100, vy: -60 - Math.random() * 60, life: 0.5, maxL: 0.5, c: C.crystalL });
            if (this.lives <= 0) { api.lose(); return; }
            // Push back to center
            this.px = W / 2;
          }
        }

        // Spawn spire bursts
        this.spireT += dt;
        if (this.spireT >= this.spireRate) {
          this.spireT = 0;
          this.spireRate = Math.max(0.5, this.spireRate - 0.03);
          const side = Math.random() < 0.5 ? 'left' : 'right';
          this.spires.push({ side, y: H + 10, w: 20 + Math.random() * 20, h: 6 + Math.random() * 10, t: 0 });
        }

        // Particles
        for (let p = this.particles.length - 1; p >= 0; p--) {
          const pt = this.particles[p];
          pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 80 * dt;
          pt.life -= dt;
          if (pt.life <= 0) this.particles.splice(p, 1);
        }

        if (this.elapsed >= this.need) { api.addScore(120); api.win(); }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
        const t = api.t || 0;

        // Cave interior
        const bg = c.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#06040e'); bg.addColorStop(1, '#0c0820');
        c.fillStyle = bg; c.fillRect(0, 0, W, H);

        // Crystal walls (solid, growing)
        // Left wall
        const lwPulse = 0.7 + 0.3 * Math.sin(t * 2.5);
        c.fillStyle = '#100838';
        c.fillRect(0, 0, this.leftW, H);
        c.fillStyle = C.crystal; c.globalAlpha = 0.25 * lwPulse;
        c.fillRect(0, 0, this.leftW, H);
        c.globalAlpha = 1;
        c.strokeStyle = C.crystalL; c.lineWidth = 1.5; c.globalAlpha = 0.7;
        c.beginPath(); c.moveTo(this.leftW, 0); c.lineTo(this.leftW, H); c.stroke();
        c.globalAlpha = 1;
        // Right wall
        c.fillStyle = '#100838';
        c.fillRect(W - this.rightW, 0, this.rightW, H);
        c.fillStyle = C.crystal; c.globalAlpha = 0.25 * lwPulse;
        c.fillRect(W - this.rightW, 0, this.rightW, H);
        c.globalAlpha = 1;
        c.strokeStyle = C.crystalL; c.lineWidth = 1.5; c.globalAlpha = 0.7;
        c.beginPath(); c.moveTo(W - this.rightW, 0); c.lineTo(W - this.rightW, H); c.stroke();
        c.globalAlpha = 1;

        // Spires protruding from walls
        for (const sp of this.spires) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 3 + sp.t * 5);
          c.globalAlpha = 0.6 + 0.3 * pulse;
          if (sp.side === 'left') {
            c.fillStyle = C.crystalL;
            c.beginPath();
            c.moveTo(this.leftW, sp.y - sp.h);
            c.lineTo(this.leftW + sp.w, sp.y);
            c.lineTo(this.leftW, sp.y + sp.h);
            c.closePath(); c.fill();
          } else {
            c.fillStyle = C.crystalL;
            c.beginPath();
            c.moveTo(W - this.rightW, sp.y - sp.h);
            c.lineTo(W - this.rightW - sp.w, sp.y);
            c.lineTo(W - this.rightW, sp.y + sp.h);
            c.closePath(); c.fill();
          }
          c.globalAlpha = 1;
        }

        // Ambient crystal shimmer in walls
        for (let sh = 0; sh < 6; sh++) {
          const sy = (t * 28 + sh * 80) % H;
          c.globalAlpha = 0.3 + 0.2 * Math.sin(t * 4 + sh);
          g.rect(4, sy, this.leftW - 6, 3, C.crystalL);
          g.rect(W - this.rightW + 2, sy + 20, this.rightW - 6, 3, C.crystalL);
          c.globalAlpha = 1;
        }

        // Particles
        for (const pt of this.particles) {
          c.globalAlpha = pt.life / pt.maxL;
          g.rect(pt.x - 2, pt.y - 2, 4, 4, pt.c);
        }
        c.globalAlpha = 1;

        // Nimue spell text drifting
        c.globalAlpha = 0.08 + 0.05 * Math.sin(t * 1.2);
        api.txtCFit('IMPRISONED', W / 2, H / 2 - 30, 9, C.crystalL, false);
        c.globalAlpha = 1;

        // Player: Merlin
        const inv = this.invT > 0 && Math.sin(this.invT * 18) > 0;
        if (!inv) {
          // Staff
          g.rect(this.px - 1, this.py - 22, 3, 32, C.gold);
          // Star at top of staff
          const starPulse = 0.7 + 0.3 * Math.sin(t * 6);
          c.globalAlpha = starPulse;
          g.circle(this.px, this.py - 24, 5, C.lavender);
          c.globalAlpha = 1;
          // Robe
          c.fillStyle = C.mist; c.globalAlpha = 0.85;
          c.beginPath(); c.moveTo(this.px - 9, this.py - 8); c.lineTo(this.px + 9, this.py - 8); c.lineTo(this.px + 12, this.py + 14); c.lineTo(this.px - 12, this.py + 14); c.closePath(); c.fill();
          c.globalAlpha = 1;
          g.circle(this.px, this.py - 10, 7, C.silver);
          // Hat
          c.fillStyle = C.mist; c.globalAlpha = 0.9;
          c.beginPath(); c.moveTo(this.px - 9, this.py - 14); c.lineTo(this.px + 9, this.py - 14); c.lineTo(this.px, this.py - 32); c.closePath(); c.fill();
          c.globalAlpha = 1;
        }

        // Timer bar
        const pct = Math.min(1, this.elapsed / this.need);
        g.rect(8, H - 18, W - 16, 6, '#1a0e30');
        g.rect(8, H - 18, (W - 16) * pct, 6, C.lavender);
        api.txtCFit(Math.ceil(this.need - this.elapsed) + 's', W / 2, H - 30, 9, C.silver);

        // Lives
        for (let li = 0; li < 3; li++) {
          g.circle(14 + li * 16, H - 42, 5, li < this.lives ? C.gold : C.mist);
        }

        // Corridor width warning
        const gap = W - this.leftW - this.rightW;
        if (gap < 100) {
          c.globalAlpha = 0.5 + 0.4 * Math.sin(t * 6);
          api.txtCFit('CLOSING', W / 2, 24, 10, C.crystal, false);
          c.globalAlpha = 1;
        }
      },
    };
  }

  /* ════════════════════════════════════
   * ASSEMBLE THE SAGA
   ════════════════════════════════════ */
  RetroSaga.create({
    id: 'merlin-spells',
    title: 'MERLIN',
    subtitle: 'Five Trials of the Enchanter',
    accent: C.lavender,
    credit: 'Arthurian Legend',
    currency: 'RUNES',
    bootCta: 'TAP TO BEGIN THE TRIALS',
    menuLabel: 'CHOOSE A TRIAL',
    menuHint: 'Tap any constellation',
    menuDone: 'ALL TRIALS COMPLETE',
    bootLine: 'The Old Magic stirs in the oakwood. Are you ready, young wizard?',
    finale: '"In the end it will all have been worth it." — Merlin, as the last enchantment fades',

    screens: {
      win:          C.greenL,
      lose:         C.redL,
      chapterLabel: C.lavender,
      name:         C.starlit,
      sub:          C.silver,
      intro:        C.silver,
      quote:        '#a098c8',
      help:         C.silver,
      score:        C.lavender,
      cur:          C.gold,
      cta:          C.goldL,
      overlay:      'rgba(6,4,14,.82)',
    },
    labels: {
      chapter: 'TRIAL',
      score:   'RUNES WON',
      win:     'THE ENCHANTMENT HOLDS',
      lose:    'THE SPELL BREAKS',
      cont:    'CONTINUE',
      finale:  'THE MERLIN ENDURES',
      toMenu:  'STAR CHART',
      play:    'BEGIN TRIAL',
    },

    emblem,
    scenery,
    menu,

    chapters: [
      chapter1_wildMagic(),
      chapter2_twoDragons(),
      chapter3_falconFlight(),
      chapter4_runePuzzle(),
      chapter5_nimueSnare(),
    ],
  });
})();
