/* ============================================================================
 * MERLIN — FIVE TRIALS OF THE ENCHANTER
 * Five chapters from Arthurian legend:
 *   1. THE WILD MAGIC    — trace glowing rune sigils in order (path-tracing, 5 sigils)
 *   2. THE TWO DRAGONS   — dodge Red & White Dragon fire in Vortigern's tower (24s)
 *   3. FALCON'S FLIGHT   — steer the merlin falcon, collect 10 golden feathers (dodge)
 *   4. THE RUNE PUZZLE   — tap the correct glowing rune from the standing stones (10 rounds)
 *   5. NIMUE'S SNARE     — Simon-style incantation duel: repeat her crystal sequence
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
   * Rune-tracing spellcaster: tap each glowing waypoint of a sigil
   * in order across 5 sigils, sharing one candle-timer.
   ═══════════════════════════════════════════════════════════ */
  const RUNE_SYMS = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ'];
  const RUNE_GLYPHS = [
    [[0,-1],[0.9,0.72],[-0.9,0.72],[0,-1]],
    [[0,-1],[0,0],[0,1],[-1,0],[1,0]],
    [[-0.5,-0.9],[0.35,-0.15],[-0.35,0.15],[0.5,0.9]],
    [[-0.85,-0.9],[0.85,-0.45],[-0.85,0],[0.85,0.45],[-0.85,0.9]],
    [[0,-1],[1,0],[0,1],[-1,0]],
  ];
  function chapter1_wildMagic() {
    return {
      id: 'wildmagic', name: 'THE WILD MAGIC', sub: 'Trace the sigils',
      intro: [
        "Deep in the oakwood, the Old Magic",
        "stirs. Merlin traces the shape of",
        "each rune in the air with a finger",
        "of light — every point, in order,",
        "or the working scatters unspoken.",
      ],
      quote: '"There is only one sin: choosing not to see." — attributed to Merlin',
      help: 'TAP each glowing point in order to trace the sigil · 5 sigils · one shared candle',
      winText: 'Five sigils burn complete. The Old Magic answers Merlin\'s hand.',
      loseText: 'The candle gutters out. The half-drawn sigil fades to smoke.',
      icon(api, x, y) {
        api.gfx.rect(x - 1, y - 8, 2, 16, C.gold);
        api.gfx.rect(x - 5, y - 8, 10, 2, C.gold);
        api.txtC('ᚠ', x, y + 4, 8, C.lavender, true);
      },
      init(api) {
        this.lives = 3;
        this.sigil = 0;
        this.need = 5;
        this.t = 0;
        this.errT = 0;
        this.doneFlashT = 0;
        this.maxTime = 42;
        this.timeLeft = 42;
        this._buildSigil(api);
      },
      _buildSigil(api) {
        const shape = RUNE_GLYPHS[this.sigil % RUNE_GLYPHS.length];
        const cx = api.W / 2, cy = api.H * 0.48, scale = 78;
        this.points = shape.map(([sx, sy]) => ({ x: cx + sx * scale, y: cy + sy * scale }));
        this.step = 0;
      },
      update(api, dt) {
        this.t += dt;
        this.errT = Math.max(0, this.errT - dt);
        this.doneFlashT = Math.max(0, this.doneFlashT - dt);
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) { api.lose(); return; }

        if (api.pointer.justDown) {
          const target = this.points[this.step];
          const dist = Math.hypot(api.pointer.x - target.x, api.pointer.y - target.y);
          if (dist < 28) {
            this.step++;
            api.audio.sfx('coin');
            api.burst(target.x, target.y, C.lavender, 8);
            if (this.step >= this.points.length) {
              this.sigil++;
              api.addScore(30);
              this.timeLeft = Math.min(this.maxTime, this.timeLeft + 6);
              this.doneFlashT = 0.5;
              if (this.sigil >= this.need) { api.addScore(80); api.win(); return; }
              this._buildSigil(api);
            }
          } else {
            this.lives--;
            this.errT = 0.4;
            api.shake(3, 0.3);
            api.flash(C.red, 0.25);
            api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
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
          c.beginPath(); c.moveTo(tx, H * 0.16 + th);
          c.lineTo(tx + 14, H * 0.16); c.lineTo(tx + 28, H * 0.16 + th);
          c.lineTo(tx + 28, 0); c.lineTo(tx, 0); c.closePath(); c.fill();
        }
        // floor mist
        c.globalAlpha = 0.22; c.fillStyle = C.lavender; c.fillRect(0, H - 38, W, 38);
        c.globalAlpha = 1;

        const pts = this.points;

        // faint full guide outline
        c.globalAlpha = 0.22;
        c.setLineDash([5, 5]);
        c.strokeStyle = C.lavender; c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
        c.stroke();
        c.setLineDash([]);
        c.globalAlpha = 1;

        // traced segments, glowing gold
        if (this.step > 0) {
          c.strokeStyle = C.goldL; c.lineWidth = 3;
          c.globalAlpha = 0.9;
          c.beginPath();
          c.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i <= this.step && i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
          c.stroke();
          c.globalAlpha = 1;
        }

        // waypoints
        const pulse = 0.6 + 0.4 * Math.sin(this.t * 4.5);
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          if (i < this.step) {
            g.circle(p.x, p.y, 7, C.gold);
          } else if (i === this.step) {
            c.globalAlpha = 0.5 + 0.5 * pulse;
            g.circle(p.x, p.y, 11, C.lavender);
            c.globalAlpha = 1;
            g.circle(p.x, p.y, 6, C.starlit);
          } else {
            c.globalAlpha = 0.35;
            g.circle(p.x, p.y, 5, C.mist);
            c.globalAlpha = 1;
          }
        }

        // error / success flash rings
        if (this.errT > 0) {
          c.globalAlpha = this.errT / 0.4 * 0.4;
          g.circle(W / 2, H * 0.48, 96, C.red);
          c.globalAlpha = 1;
        }
        if (this.doneFlashT > 0) {
          c.globalAlpha = this.doneFlashT / 0.5 * 0.35;
          g.circle(W / 2, H * 0.48, 96, C.gold);
          c.globalAlpha = 1;
        }

        // HUD
        api.topBar('SIGIL  ' + this.sigil + '/' + this.need);
        for (let li = 0; li < 3; li++) g.rect(W - 10 - li * 14, 3, 10, 10, li < this.lives ? C.red : '#2a0a10');
        const pct = Math.max(0, this.timeLeft / this.maxTime);
        g.rect(8, H - 16, W - 16, 6, '#1a0e30');
        g.rect(8, H - 16, (W - 16) * pct, 6, pct > 0.3 ? C.lavender : C.red);
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
   * Simon-style incantation duel: watch Nimue's spell light the four
   * crystal spires, then repeat it — TAP or ARROW KEYS. Grows each round.
   ═══════════════════════════════════════════════════════════ */
  const DUEL_COLORS = [/* up */ '#88ccff', /* right */ '#d4a820', /* down */ '#b87aff', /* left */ '#c8d0f0'];
  function chapter5_nimueSnare() {
    return {
      id: 'nimuesnare', name: "NIMUE'S SNARE", sub: 'Duel of incantations',
      intro: [
        "Nimue has turned Merlin's own magic",
        "against him. Four crystal spires",
        "answer her call in the cave dark.",
        "Watch her incantation, then cast",
        "it back to her, note for note.",
      ],
      quote: '"Merlin taught her his enchantments, and she used them to enclose him for ever." — Malory, Le Morte d\'Arthur',
      help: 'WATCH the spires light in order, then repeat it — TAP a spire or ARROW KEYS · 3 lives',
      winText: 'Merlin casts her own spell back at her. The snare shatters.',
      loseText: "Merlin's answer falters. The crystal closes over him.",
      icon(api, x, y) {
        api.gfx.rect(x - 12, y - 12, 6, 18, C.crystalL);
        api.gfx.rect(x + 6, y - 8, 6, 14, C.crystal);
        api.gfx.rect(x - 3, y - 16, 6, 24, C.lavender);
      },
      init(api) {
        this.lives = 3;
        this.seq = [];
        this.maxLen = 8;
        this.round = 1;
        this.t = 0;
        this.lit = -1;
        this.feedT = 0;
        this.msg = '';
        this.msgC = C.silver;
        for (let i = 0; i < 3; i++) this._extend();
        this._beginWatch();
      },
      _extend() { this.seq.push(Math.floor(Math.random() * 4)); },
      _beginWatch() {
        this.phase = 'watch';
        this.watchIdx = 0;
        this.stepState = 'gap';
        this.stepT = 0.4;
        this.lit = -1;
        this.inputIdx = 0;
      },
      _nodes(api) {
        const cx = api.W / 2, cy = api.H * 0.5, R = 96;
        return [
          { x: cx, y: cy - R },        // up
          { x: cx + R * 0.82, y: cy }, // right
          { x: cx, y: cy + R },        // down
          { x: cx - R * 0.82, y: cy }, // left
        ];
      },
      update(api, dt) {
        this.t += dt;

        if (this.phase === 'watch') {
          this.stepT -= dt;
          if (this.stepT <= 0) {
            if (this.stepState === 'gap') {
              if (this.watchIdx >= this.seq.length) {
                this.phase = 'input'; this.inputIdx = 0; this.lit = -1;
              } else {
                this.lit = this.seq[this.watchIdx];
                this.stepState = 'lit'; this.stepT = 0.5;
                api.audio.sfx('blip');
              }
            } else {
              this.lit = -1;
              this.watchIdx++;
              this.stepState = 'gap'; this.stepT = 0.22;
            }
          }
          return;
        }

        if (this.phase === 'input') {
          let dir = -1;
          if (api.input.pressed('up')) dir = 0;
          else if (api.input.pressed('right')) dir = 1;
          else if (api.input.pressed('down')) dir = 2;
          else if (api.input.pressed('left')) dir = 3;
          else if (api.pointer.justDown) {
            const nodes = this._nodes(api);
            let best = -1, bestD = 46;
            for (let i = 0; i < 4; i++) {
              const d = Math.hypot(api.pointer.x - nodes[i].x, api.pointer.y - nodes[i].y);
              if (d < bestD) { bestD = d; best = i; }
            }
            dir = best;
          }
          if (dir < 0) return;

          if (dir === this.seq[this.inputIdx]) {
            this.lit = dir;
            api.addScore(10);
            api.audio.sfx('coin');
            const n = this._nodes(api)[dir];
            api.burst(n.x, n.y, DUEL_COLORS[dir], 7);
            this.inputIdx++;
            if (this.inputIdx >= this.seq.length) {
              if (this.seq.length >= this.maxLen) {
                api.addScore(150);
                this.msg = 'THE SPELL TURNS'; this.msgC = C.goldL;
                this.phase = 'won'; this.feedT = 0.5;
              } else {
                this.msg = 'PRECISE'; this.msgC = C.goldL;
                this.phase = 'roundgap'; this.feedT = 0.7;
              }
            }
          } else {
            this.lives--;
            this.lit = -1;
            api.shake(5, 0.35);
            api.flash(C.red, 0.3);
            api.audio.sfx('hurt');
            this.msg = 'WRONG NOTE'; this.msgC = C.redL;
            this.phase = 'wronggap'; this.feedT = 0.9;
          }
          return;
        }

        if (this.phase === 'roundgap') {
          this.feedT -= dt;
          if (this.feedT <= 0) { this.round++; this._extend(); this._beginWatch(); }
          return;
        }

        if (this.phase === 'wronggap') {
          this.feedT -= dt;
          if (this.feedT <= 0) {
            if (this.lives <= 0) { api.lose(); return; }
            this._beginWatch();
          }
          return;
        }

        if (this.phase === 'won') {
          this.feedT -= dt;
          if (this.feedT <= 0) api.win();
          return;
        }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

        const bg = c.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#06040e'); bg.addColorStop(1, '#0c0820');
        c.fillStyle = bg; c.fillRect(0, 0, W, H);

        const nodes = this._nodes(api);
        const cx = W / 2, cy = H * 0.5;

        // connecting spokes
        c.globalAlpha = 0.18; c.strokeStyle = C.mist; c.lineWidth = 1.5;
        for (const n of nodes) { c.beginPath(); c.moveTo(cx, cy); c.lineTo(n.x, n.y); c.stroke(); }
        c.globalAlpha = 1;

        // center Nimue mark
        const pulse = 0.6 + 0.4 * Math.sin(this.t * 2.2);
        c.globalAlpha = 0.25 + 0.15 * pulse;
        g.circle(cx, cy, 22, C.crystal);
        c.globalAlpha = 1;
        api.txtC('☾', cx, cy + 4, 12, C.crystalL, true);

        // crystal spires
        for (let i = 0; i < 4; i++) {
          const n = nodes[i];
          const active = this.lit === i;
          const idlePulse = 0.55 + 0.35 * Math.sin(this.t * 2.6 + i * 1.4);
          const r = active ? 20 : 14;
          c.globalAlpha = active ? 0.9 : 0.35 + 0.15 * idlePulse;
          g.circle(n.x, n.y, r + 6, active ? DUEL_COLORS[i] : '#160c30');
          c.globalAlpha = 1;
          c.fillStyle = DUEL_COLORS[i];
          c.globalAlpha = active ? 1 : 0.55;
          c.beginPath();
          c.moveTo(n.x, n.y - r); c.lineTo(n.x + r * 0.7, n.y); c.lineTo(n.x, n.y + r); c.lineTo(n.x - r * 0.7, n.y);
          c.closePath(); c.fill();
          c.globalAlpha = 1;
        }

        // phase hint + feedback
        let hint = '';
        if (this.phase === 'watch') hint = 'WATCH';
        else if (this.phase === 'input') hint = 'YOUR TURN';
        if (hint) api.txtCFit(hint, W / 2, 56, 10, C.lavender, false);
        if (this.msg && this.feedT > 0) api.txtCFit(this.msg, W / 2, 76, 10, this.msgC, false);

        // round label + sequence progress dots
        api.txtCFit('ROUND ' + this.round, W / 2, H - 56, 9, C.silver, false);
        const dots = this.maxLen;
        const dotW = (W - 40) / dots;
        for (let i = 0; i < dots; i++) {
          const dx = 20 + dotW * i + dotW / 2;
          g.circle(dx, H - 38, 3.5, i < this.seq.length ? C.gold : '#241040');
        }

        // lives
        for (let li = 0; li < 3; li++) g.rect(W - 10 - li * 14, 3, 10, 10, li < this.lives ? C.red : '#2a0a10');
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
