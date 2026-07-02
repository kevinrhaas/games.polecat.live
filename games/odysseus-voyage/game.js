/* ============================================================================
 * ODYSSEUS — THE LONG WAY HOME
 * Five crossings through Homer's Odyssey (c. 8th century BC):
 *   1. THE CYCLOPS' CAVE    — dodge sweeping eye, hide under sheep (5 sweeps)
 *   2. CIRCE'S ISLAND       — collect moly herbs, dodge wand beams (14 herbs)
 *   3. THE SIRENS           — dodge falling siren notes, survive 22s
 *   4. SCYLLA & CHARYBDIS   — steer ship past tentacles and debris (24s)
 *   5. THE BOW CONTEST      — time the shot through 8 axe-ring handles
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── Emblem: Greek trireme ship ────────────────────────────────────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Hull (gold/brown)
    c.fillStyle = '#c8962a';
    c.beginPath();
    c.moveTo(cx - 28, cy + 10);
    c.lineTo(cx + 32, cy + 10);
    c.lineTo(cx + 28, cy + 20);
    c.lineTo(cx - 24, cy + 20);
    c.closePath(); c.fill();
    // Hull lower band
    g.rect(cx - 24, cy + 18, 52, 5, '#8a6218');
    // Oars (small rects along bottom)
    for (let oi = 0; oi < 5; oi++) {
      g.rect(cx - 20 + oi * 10, cy + 20, 2, 8, '#a07830');
    }
    // Mast
    g.rect(cx - 1, cy - 26, 3, 38, '#c8962a');
    // Sail (white rectangle)
    c.fillStyle = '#f0ede8';
    c.fillRect(cx - 14, cy - 24, 28, 24);
    // Sail lines
    c.strokeStyle = '#9ab8d4'; c.lineWidth = 1;
    for (let sl = 1; sl < 4; sl++) {
      c.beginPath(); c.moveTo(cx - 14, cy - 24 + sl * 6); c.lineTo(cx + 14, cy - 24 + sl * 6); c.stroke();
    }
  }

  /* ── Scenery: wine-dark sea backdrop ──────────────────────────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Night sky gradient
    const sky = c.createLinearGradient(0, 0, 0, H * 0.43);
    sky.addColorStop(0, '#060f28'); sky.addColorStop(1, '#0d1b3e');
    c.fillStyle = sky; c.fillRect(0, 0, W, Math.ceil(H * 0.43));

    // 55 animated stars
    for (let i = 0; i < 55; i++) {
      const sx = (i * 73 + 11) % W;
      const sy = (i * 47 + 7) % Math.floor(H * 0.40);
      c.globalAlpha = 0.25 + 0.25 * Math.sin(t * 1.3 + i * 0.8);
      g.rect(sx, sy, 1, 1, '#f0ede8');
      c.globalAlpha = 1;
    }

    // Crescent moon
    g.circle(W - 34, 28, 11, '#e8c87a');
    g.circle(W - 28, 25, 10, '#0d1b3e'); // dark circle offset to create crescent

    // Horizon line
    const horizonY = Math.floor(H * 0.43);

    // Wine-dark sea gradient
    const sea = c.createLinearGradient(0, horizonY, 0, H);
    sea.addColorStop(0, '#142a5a'); sea.addColorStop(1, '#050e28');
    c.fillStyle = sea; c.fillRect(0, horizonY, W, H - horizonY);

    // 6 animated waves
    for (let wi = 0; wi < 6; wi++) {
      c.globalAlpha = 0.10 + 0.03 * Math.sin(t * 0.7 + wi * 0.9);
      c.strokeStyle = '#4ac8d4'; c.lineWidth = 1.5;
      c.beginPath();
      const wy = horizonY + 10 + wi * ((H - horizonY - 20) / 6);
      for (let wx = 0; wx < W; wx += 4) {
        const ywv = wy + 4 * Math.sin((wx / W) * Math.PI * 4 + t * 1.2 + wi * 0.7);
        if (wx === 0) c.moveTo(wx, ywv); else c.lineTo(wx, ywv);
      }
      c.stroke();
      c.globalAlpha = 1;
    }

    // Two small island silhouettes on horizon
    c.fillStyle = '#0a1a38';
    c.fillRect(18, horizonY - 8, 28, 12);
    c.fillRect(W - 52, horizonY - 6, 22, 10);

    if (scene === 'menu') {
      c.fillStyle = 'rgba(8,22,56,0.93)'; c.fillRect(0, 0, W, H);
      // Double border lines
      c.strokeStyle = '#c8962a'; c.lineWidth = 2;
      c.strokeRect(4, 4, W - 8, H - 8);
      c.strokeRect(7, 7, W - 14, H - 14);
    } else if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(8,22,56,.84)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ── Chart waypoints (zigzag island stops) ─────────────────────────────── */
  const CHART_PTS = [
    [152, 115, 92, 68],   // Ch1 Cyclops (east)
    [20,  200, 92, 68],   // Ch2 Circe (west)
    [152, 272, 92, 68],   // Ch3 Sirens (east)
    [20,  350, 92, 68],   // Ch4 Scylla (west)
    [74,  415, 122, 58],  // Ch5 Bow (center)
  ];

  /* ══════════════════════════════════════════════════════════════════════════
   * RETROSAGA CONFIG
   * ══════════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id: 'odysseus',
    title: 'Odysseus',
    subtitle: 'THE LONG WAY HOME',
    currency: 'GLORY',
    screens: {
      win: '#4ac8d4', lose: '#8b2a10',
      chapterLabel: '#9a8a5a', name: '#f0ede8', sub: '#e8c87a',
      intro: '#d4c090', quote: '#8a7a50', help: '#4ac8d4',
      score: '#f0ede8', cur: '#e8c87a', cta: '#f0ede8',
      overlay: 'rgba(8,22,56,.86)',
    },
    labels: {
      chapter: 'CROSSING', score: 'GLORY WON',
      win: 'THE GODS SMILE',
      lose: 'POSEIDON LAUGHS',
      cont: 'TAP TO PRESS ON',
      finale: 'TAP TO RETURN HOME',
      toMenu: 'TAP TO THE CHART',
      play: 'TAP TO SET SAIL',
    },
    accent: '#4ac8d4',
    credit: 'THE ODYSSEY · HOMER · c. 8TH CENTURY BC',
    emblem,
    scenery,
    bootCta: 'TAP TO SET SAIL',
    bootLine: 'FIVE CROSSINGS · ONE HERO',
    menuLabel: "ODYSSEUS'S CHART",
    menuHint: 'CHOOSE YOUR NEXT CROSSING',
    menuDone: 'ITHACA IS REACHED',
    menu: {
      colors: { title: '#e8c87a', label: '#9a8a5a', cur: '#f0ede8' },
      layout(api) {
        return CHART_PTS.map(p => ({ x: p[0], y: p[1], w: p[2], h: p[3] }));
      },
      title(api, glory) {
        const g = api.gfx, c = api.ctx, W = api.W;
        // Chart title box at top
        g.rect(8, 8, W - 16, 54, '#08163a');
        c.strokeStyle = '#c8962a'; c.lineWidth = 2;
        c.strokeRect(8, 8, W - 16, 54);
        api.txtC("ODYSSEUS'S CHART", W / 2, 28, 7, '#e8c87a');
        api.txtC('GLORY  ' + glory, W / 2, 48, 7, '#4ac8d4');
        // Dotted sailing route connecting all CHART_PTS centers
        c.save();
        c.setLineDash([4, 5]);
        c.strokeStyle = '#c8962a'; c.lineWidth = 1.5;
        c.beginPath();
        for (let pi = 0; pi < CHART_PTS.length; pi++) {
          const p = CHART_PTS[pi];
          const cx2 = p[0] + p[2] / 2;
          const cy2 = p[1] + p[3] / 2;
          if (pi === 0) c.moveTo(cx2, cy2); else c.lineTo(cx2, cy2);
        }
        c.stroke();
        c.restore();
        // Small compass rose at (202, 378)
        const rx = 202, ry = 378;
        c.strokeStyle = '#c8962a'; c.lineWidth = 1;
        c.beginPath(); c.arc(rx, ry, 10, 0, Math.PI * 2); c.stroke();
        c.strokeStyle = '#c8962a'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(rx, ry - 10); c.lineTo(rx, ry + 10); c.stroke();
        c.beginPath(); c.moveTo(rx - 10, ry); c.lineTo(rx + 10, ry); c.stroke();
        api.txtC('N', rx, ry - 13, 6, '#e8c87a');
      },
      card(api, { ch, i, x, y, w, h, sel, done }) {
        const g = api.gfx, c = api.ctx, cx = x + w / 2;
        // Card background
        c.fillStyle = sel ? '#1a3560' : '#0c1f48';
        c.fillRect(x, y, w, h);
        // Border
        c.strokeStyle = sel ? '#4ac8d4' : '#c8962a';
        c.lineWidth = 2;
        c.strokeRect(x, y, w, h);
        // Roman numerals at top in gold
        const numerals = ['I', 'II', 'III', 'IV', 'V'];
        api.txtC(numerals[i], cx, y + 14, 8, '#e8c87a');
        // Rule line
        g.rect(x + 4, y + 20, w - 8, 1, '#c8962a');
        // Chapter name
        api.txtCFit(ch.name, cx, y + 34, 7, done ? '#e8c87a' : '#f0ede8', false, w - 8);
        // Sub
        if (ch.sub) api.txtCFit(ch.sub, cx, y + 46, 6, done ? '#4ac8d4' : '#9a8a7a', false, w - 8);
        // Chapter icon
        if (ch.icon) ch.icon(api, cx, y + h - 22);
        // Done: anchor symbol
        if (done) {
          api.txtC('⚓', cx, y + h - 8, 9, '#e8c87a');
        }
        if (sel) {
          c.strokeStyle = '#4ac8d4'; c.lineWidth = 1.5;
          c.strokeRect(x + 3, y + 3, w - 6, h - 6);
        }
      },
    },
    finale: [
      'THE WINE-DARK SEA',
      'GROWS CALM.',
      '',
      'PENELOPE WAITS.',
      'ODYSSEUS IS HOME.',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ══════════════════════════════════════════════════════════════════
       * CHAPTER 1 — THE CYCLOPS' CAVE: hide under sheep, survive 5 sweeps
       * ══════════════════════════════════════════════════════════════════ */
      {
        id: 'cyclops', name: 'THE CYCLOPS', sub: 'BLINDED BY NOBODY',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 8, '#cc2200');
          g.circle(x, y, 4, '#0a0400');
        },
        intro: [
          'POLYPHEMUS, SON OF',
          'POSEIDON, GUARDS',
          'THE CAVE EXIT.',
          'Hide under the sheep.',
        ],
        quote: '"Nobody has blinded me!" — Polyphemus',
        help: 'UP/DOWN to move lanes · stay under a SHEEP when the red eye glows · survive 5 sweeps',
        winText: 'You slip out with the flock. The blinded giant curses Nobody.',
        loseText: 'The great hand finds you in the darkness.',
        init(api) {
          this.lane = 1; this.lives = 3; this.sweeps = 0; this.TARGET = 5;
          this.sheep = []; this.spawnT = 0.7;
          this.sweepPhase = 0; // 0=wait, 1=warn
          this.sweepTimer = 3.0; this.warnTimer = 0; this.warnDur = 0.9;
          this.iframes = 0; this.hitFlash = 0;
          this.LANEY = [140, 240, 340];
        },
        update(api, dt) {
          // Lane switch
          if (api.keyPressed('up') || (api.pointer.justDown && api.pointer.y < api.H / 2 - 20)) {
            this.lane = Math.max(0, this.lane - 1); api.audio.sfx('blip');
          }
          if (api.keyPressed('down') || (api.pointer.justDown && api.pointer.y > api.H / 2 + 20)) {
            this.lane = Math.min(2, this.lane + 1); api.audio.sfx('blip');
          }
          // Spawn sheep from right
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.sheep.push({ lane: api.rint(0, 2), x: api.W + 24 });
            this.spawnT = 0.7 + api.rnd(0, 0.4);
          }
          // Move sheep leftward
          for (const sh of this.sheep) sh.x -= 52 * dt;
          this.sheep = this.sheep.filter(sh => sh.x > -30);
          if (this.iframes > 0) this.iframes -= dt;
          if (this.hitFlash > 0) this.hitFlash -= dt;
          // Sweep cycle
          if (this.sweepPhase === 0) {
            this.sweepTimer -= dt;
            if (this.sweepTimer <= 0) {
              this.sweepPhase = 1; this.warnTimer = this.warnDur; api.audio.sfx('shoot');
            }
          } else {
            this.warnTimer -= dt;
            if (this.warnTimer <= 0) {
              // Check if player under a sheep in their lane
              const safe = this.sheep.some(sh => sh.lane === this.lane && sh.x > 30 && sh.x < api.W - 30);
              if (!safe && this.iframes <= 0) {
                this.lives--; this.iframes = 1.2; this.hitFlash = 0.5;
                api.shake(7, 0.3); api.flash('#cc4422', 0.2); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
              this.sweeps++;
              if (this.sweeps >= this.TARGET) { api.addScore(220); api.win(); return; }
              this.sweepPhase = 0; this.sweepTimer = 3.2 + this.sweeps * 0.1;
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#100806');
          // Rocky cave walls
          c.fillStyle = '#1a0e08';
          for (let i = 0; i < 10; i++) { c.fillRect((i * 43) % W, (i * 61) % H, 18, 10); }
          // Faint lane guides
          for (const ly of this.LANEY) {
            c.globalAlpha = 0.12; c.strokeStyle = '#c8962a'; c.lineWidth = 1;
            c.setLineDash([6, 8]);
            c.beginPath(); c.moveTo(0, ly); c.lineTo(W - 60, ly); c.stroke();
            c.setLineDash([]); c.globalAlpha = 1;
          }
          // Sheep
          for (const sh of this.sheep) {
            const sy = this.LANEY[sh.lane];
            g.circle(sh.x, sy, 12, '#d8d4c0');
            g.circle(sh.x - 7, sy - 4, 8, '#e4e0d0');
            g.circle(sh.x + 4, sy - 5, 8, '#e4e0d0');
            g.circle(sh.x - 14, sy - 2, 6, '#c4c0b0');
            g.rect(sh.x - 8, sy + 10, 4, 8, '#8a8070');
            g.rect(sh.x - 1, sy + 12, 4, 8, '#8a8070');
            g.rect(sh.x + 5, sy + 12, 4, 8, '#8a8070');
          }
          // Player (Odysseus)
          const py = this.LANEY[this.lane];
          const vis = this.iframes <= 0 || Math.floor(this.iframes * 8) % 2 === 0;
          if (vis) {
            const pc = this.hitFlash > 0 ? '#ff8080' : '#d4a060';
            g.circle(W / 2, py - 14, 7, pc);
            g.rect(W / 2 - 4, py - 8, 8, 16, pc);
          }
          // "Under sheep" safe glow
          if (this.sheep.some(sh => sh.lane === this.lane && sh.x > 30 && sh.x < W - 30)) {
            c.globalAlpha = 0.25; g.circle(W / 2, py, 18, '#5dff8f'); c.globalAlpha = 1;
          }
          // Polyphemus (right wall, big rocky giant)
          c.fillStyle = '#5a3a1a'; c.fillRect(W - 54, 40, 54, H);
          // Eye
          const eyeC = this.sweepPhase === 1 ? '#ff2000' : '#8b3010';
          g.circle(W - 28, 200, 20, '#2a1808');
          g.circle(W - 28, 200, 13, eyeC);
          g.circle(W - 28, 200, 6, '#0a0400');
          if (this.sweepPhase === 1) {
            c.globalAlpha = 0.35 + 0.3 * Math.sin(this.warnTimer * 25);
            g.circle(W - 28, 200, 22, '#ff2000'); c.globalAlpha = 1;
          }
          api.topBar('THE CYCLOPS');
          api.txt('SWEEPS ' + this.sweeps + '/' + this.TARGET, 8, 20, 8, '#e8c87a');
          for (let li = 0; li < 3; li++) g.rect(W - 52 + li * 18, 3, 13, 10, li < this.lives ? '#cc4422' : '#2a1010');
          api.vignette();
        },
      },

      /* ══════════════════════════════════════════════════════════════════
       * CHAPTER 2 — CIRCE'S ISLAND: collect moly herbs, dodge wand beams
       * ══════════════════════════════════════════════════════════════════ */
      {
        id: 'circe', name: "CIRCE'S ISLAND", sub: 'THE WITCH AND THE HERB',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Purple wand
          g.rect(x - 1, y - 12, 2, 16, '#9b5cff');
          g.circle(x, y - 14, 4, '#e8c87a');
          // Sparks
          c.globalAlpha = 0.8;
          g.rect(x + 5, y - 16, 2, 2, '#e8c87a');
          g.rect(x - 6, y - 14, 2, 2, '#4ac8d4');
          g.rect(x + 4, y - 8, 2, 2, '#ff88cc');
          c.globalAlpha = 1;
        },
        intro: [
          'CIRCE TURNS MEN',
          'INTO SWINE.',
          'Hermes gives Odysseus',
          'the white herb moly.',
        ],
        quote: '"The gods call it moly. Hard for mortals to dig." — Hermes',
        help: "MOVE to collect MOLY HERBS · dodge Circe's wand beams · 14 herbs to win",
        winText: "Protected by moly, you resist Circe's spell. She lowers her wand.",
        loseText: 'The transformation begins. Hooves where hands should be.',
        init(api) {
          this.px = api.W / 2; this.py = api.H / 2 + 30; this.lives = 3;
          this.herbs = []; this.beams = []; this.iframes = 0;
          this.collected = 0; this.NEED = 14; this.spawnH = 0; this.spawnB = 3.5; this.timer = 0;
        },
        update(api, dt) {
          this.timer += dt;
          // Player movement
          let dx = 0, dy = 0;
          if (api.keyDown('left')) dx -= 2.4;
          if (api.keyDown('right')) dx += 2.4;
          if (api.keyDown('up')) dy -= 2.4;
          if (api.keyDown('down')) dy += 2.4;
          if (api.pointer.down) {
            if (api.pointer.x < this.px - 10) dx -= 2.2;
            else if (api.pointer.x > this.px + 10) dx += 2.2;
            if (api.pointer.y < this.py - 10) dy -= 2.2;
            else if (api.pointer.y > this.py + 10) dy += 2.2;
          }
          this.px = clamp(this.px + dx * dt * 60, 12, api.W - 12);
          this.py = clamp(this.py + dy * dt * 60, 60, api.H - 20);
          // Spawn herbs
          this.spawnH -= dt;
          if (this.spawnH <= 0 && this.herbs.length < 6) {
            this.herbs.push({ x: api.rnd(20, api.W - 20), y: api.rnd(90, api.H - 50), r: 8 });
            this.spawnH = api.rnd(0.6, 1.2);
          }
          // Collect herbs
          for (let i = this.herbs.length - 1; i >= 0; i--) {
            const h = this.herbs[i];
            if (Math.hypot(this.px - h.x, this.py - h.y) < 14) {
              this.herbs.splice(i, 1); this.collected++;
              api.burst(h.x, h.y, '#f0ede8', 8); api.audio.sfx('coin');
              if (this.collected >= this.NEED) { api.addScore(200); api.win(); return; }
            }
          }
          // Spawn beams
          this.spawnB -= dt;
          if (this.spawnB <= 0) {
            const ang = Math.atan2(this.py - 80, this.px - (api.W / 2)) + api.rnd(-0.5, 0.5);
            const spd = 90 + this.collected * 3;
            this.beams.push({ x: api.W / 2, y: 80, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, life: 3 });
            this.spawnB = Math.max(1.2, 3.5 - this.collected * 0.15);
            api.audio.sfx('shoot');
          }
          // Move beams
          for (const b of this.beams) { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; }
          this.beams = this.beams.filter(b => b.life > 0 && b.x > -20 && b.x < api.W + 20 && b.y > -20 && b.y < api.H + 20);
          // Beam hits player
          if (this.iframes <= 0) {
            for (let i = this.beams.length - 1; i >= 0; i--) {
              const b = this.beams[i];
              if (Math.hypot(this.px - b.x, this.py - b.y) < 12) {
                this.beams.splice(i, 1); this.lives--; this.iframes = 1.4;
                api.shake(6, 0.3); api.flash('#9b5cff', 0.2); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; } break;
              }
            }
          } else { this.iframes -= dt; }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          // Island: green ground
          api.clear('#1a3a1a');
          c.fillStyle = '#2a5a2a'; c.fillRect(0, 60, W, H);
          // Flowers/grass dots
          for (let i = 0; i < 20; i++) {
            c.globalAlpha = 0.18;
            g.circle((i * 53) % W, 70 + ((i * 41) % 340), 2, '#5dff8f');
            c.globalAlpha = 1;
          }
          // Circe at top center
          g.circle(W / 2, 68, 16, '#d4a0d4');
          g.rect(W / 2 - 4, 68, 8, 24, '#9b5cff');
          g.rect(W / 2 - 1, 44, 2, 28, '#9b5cff');
          g.circle(W / 2, 44, 4, '#e8c87a');
          // Beam flash from wand
          if (this.beams.length > 0) { c.globalAlpha = 0.3; g.circle(W / 2, 68, 20, '#9b5cff'); c.globalAlpha = 1; }
          // Herbs (glowing white flowers)
          for (const h of this.herbs) {
            c.globalAlpha = 0.7 + 0.2 * Math.sin(this.timer * 4 + h.x);
            g.circle(h.x, h.y, 6, '#f0ede8');
            g.circle(h.x, h.y, 3, '#e8c87a');
            c.globalAlpha = 1;
          }
          // Beams (purple streaks)
          for (const b of this.beams) {
            c.globalAlpha = Math.min(1, b.life * 0.8);
            g.circle(b.x, b.y, 5, '#9b5cff');
            c.globalAlpha = 1;
          }
          // Player
          const vis = this.iframes <= 0 || Math.floor(this.iframes * 8) % 2 === 0;
          if (vis) {
            g.circle(this.px, this.py - 10, 7, '#d4a060');
            g.rect(this.px - 4, this.py - 4, 8, 14, '#d4a060');
          }
          api.topBar("CIRCE'S ISLAND");
          api.txt('MOLY: ' + this.collected + '/' + this.NEED, 8, 20, 8, '#f0ede8');
          for (let li = 0; li < 3; li++) g.rect(W - 52 + li * 18, 3, 13, 10, li < this.lives ? '#9b5cff' : '#1a0a2a');
          api.vignette();
        },
      },

      /* ══════════════════════════════════════════════════════════════════
       * CHAPTER 3 — THE SIRENS: dodge falling notes, survive 22 seconds
       * ══════════════════════════════════════════════════════════════════ */
      {
        id: 'sirens', name: 'THE SIRENS', sub: 'LASHED TO THE MAST',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Musical note shape in teal
          c.fillStyle = '#4ac8d4';
          c.font = "14px 'Press Start 2P'";
          c.textAlign = 'center';
          c.fillText('♪', x, y + 5);
        },
        intro: [
          'ODYSSEUS ORDERS HIS',
          'MEN TO PLUG THEIR',
          'EARS. HE ALONE',
          'will hear the song.',
        ],
        quote: '"Lash me harder!" cried Odysseus, straining at the ropes. — Homer',
        help: 'LEFT/RIGHT to dodge siren notes · survive 22 seconds · 3 lives',
        winText: "The Sirens' island falls behind. Their song fades. You are past.",
        loseText: 'Three notes pierce the heart. The ship turns toward the rocks.',
        init(api) {
          this.px = api.W / 2; this.lives = 3; this.timer = 22;
          this.notes = []; this.spawnT = 1.8; this.iframes = 0; this.speed = 60;
        },
        update(api, dt) {
          this.timer -= dt;
          api.score = Math.floor(Math.max(0, 22 - this.timer) * 5);
          let dx = 0;
          if (api.keyDown('left')) dx -= 2.3;
          if (api.keyDown('right')) dx += 2.3;
          if (api.pointer.down) {
            if (api.pointer.x < this.px - 12) dx -= 2.3;
            else if (api.pointer.x > this.px + 12) dx += 2.3;
          }
          this.px = clamp(this.px + dx * dt * 60, 18, api.W - 18);
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.notes.push({ x: api.rnd(20, api.W - 20), y: -20, spd: this.speed });
            this.spawnT = Math.max(0.55, 1.8 - Math.max(0, 22 - this.timer) * 0.05);
          }
          for (const n of this.notes) n.y += n.spd * dt;
          this.notes = this.notes.filter(n => n.y < api.H + 20);
          if (this.iframes <= 0) {
            for (let i = this.notes.length - 1; i >= 0; i--) {
              const n = this.notes[i];
              if (Math.hypot(this.px - n.x, (api.H - 80) - n.y) < 16) {
                this.notes.splice(i, 1); this.lives--;
                api.shake(6, 0.28); api.flash('#4ac8d4', 0.2); api.audio.sfx('hurt');
                this.iframes = 1.3;
                if (this.lives <= 0) { api.lose(); return; } break;
              }
            }
          } else { this.iframes -= dt; }
          if (this.timer <= 0) { api.addScore(180); api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          // Ocean + sky
          c.fillStyle = '#060f28'; c.fillRect(0, 0, W, H * 0.5);
          const sea = c.createLinearGradient(0, H * 0.5, 0, H);
          sea.addColorStop(0, '#142a5a'); sea.addColorStop(1, '#050e28');
          c.fillStyle = sea; c.fillRect(0, H * 0.5, W, H * 0.5);
          // Stars
          for (let i = 0; i < 30; i++) {
            c.globalAlpha = 0.4;
            g.rect((i * 67) % W, (i * 43) % Math.floor(H * 0.45), 1, 1, '#f0ede8');
            c.globalAlpha = 1;
          }
          // Siren silhouettes on rocks
          const horizY = Math.floor(H * 0.5);
          c.fillStyle = '#0d1b3e';
          c.fillRect(0, horizY - 20, 40, 60);
          c.fillRect(W - 40, horizY - 20, 40, 60);
          g.circle(20, horizY - 28, 9, '#0d1b3e');
          g.circle(W - 20, horizY - 28, 9, '#0d1b3e');
          // Mast
          g.rect(W / 2 - 2, H - 120, 4, 100, '#c8962a');
          // Siren notes
          for (const n of this.notes) {
            c.globalAlpha = 0.85;
            g.circle(n.x, n.y, 9, '#4ac8d4');
            g.circle(n.x, n.y, 5, '#a0f0ff');
            c.globalAlpha = 1;
            c.fillStyle = '#4ac8d4';
            c.font = "12px 'Press Start 2P'";
            c.textAlign = 'center';
            c.fillText('♪', n.x, n.y + 4);
          }
          // Player (small figure lashed to mast)
          const vis = this.iframes <= 0 || Math.floor(this.iframes * 8) % 2 === 0;
          if (vis) {
            g.circle(this.px, H - 100, 7, '#d4a060');
            g.rect(this.px - 4, H - 94, 8, 18, '#d4a060');
          }
          api.topBar('THE SIRENS');
          api.txt('SURVIVE ' + Math.ceil(Math.max(0, this.timer)) + 's', 8, 20, 8, '#4ac8d4');
          for (let li = 0; li < 3; li++) g.rect(W - 52 + li * 18, 3, 13, 10, li < this.lives ? '#4ac8d4' : '#0a1830');
          g.rect(6, H - 11, W - 12, 5, '#0a1a3a');
          g.rect(6, H - 11, Math.round((W - 12) * Math.max(0, this.timer / 22)), 5, '#4ac8d4');
          api.vignette();
        },
      },

      /* ══════════════════════════════════════════════════════════════════
       * CHAPTER 4 — SCYLLA & CHARYBDIS: steer ship, survive 24 seconds
       * ══════════════════════════════════════════════════════════════════ */
      {
        id: 'scylla', name: 'SCYLLA & CHARYBDIS', sub: 'BETWEEN TWO DOOMS',
        icon(api, x, y) {
          const g = api.gfx;
          // Ship rect between two danger rects
          g.rect(x - 18, y - 5, 8, 10, '#cc4422');
          g.rect(x - 5, y - 3, 10, 6, '#c8962a');
          g.rect(x + 10, y - 5, 8, 10, '#4ac8d4');
        },
        intro: [
          'SCYLLA THE SIX-',
          'HEADED MONSTER.',
          'CHARYBDIS, THE GREAT',
          'whirlpool. Pass between.',
        ],
        quote: '"Row past quickly! Lose six men, not the whole ship." — Circe',
        help: 'LEFT/RIGHT to steer · dodge TENTACLES from the left · survive 24 seconds',
        winText: 'Six men lost to Scylla — but the ship makes it through the strait.',
        loseText: 'The whirlpool takes the ship down into the wine-dark deep.',
        init(api) {
          this.sx = api.W / 2; this.lives = 3; this.timer = 24;
          this.tentacles = []; this.debris = []; this.spawnT = 1.5; this.spawnD = 0.8; this.iframes = 0;
        },
        update(api, dt) {
          this.timer -= dt;
          api.score = Math.floor(Math.max(0, 24 - this.timer) * 5);
          let dx = 0;
          if (api.keyDown('left')) dx -= 2.2;
          if (api.keyDown('right')) dx += 2.2;
          if (api.pointer.down) {
            if (api.pointer.x < this.sx - 12) dx -= 2.2;
            else if (api.pointer.x > this.sx + 12) dx += 2.2;
          }
          // Charybdis pull from right
          dx += 0.6;
          this.sx = clamp(this.sx + dx * dt * 60, 30, api.W - 30);
          // Scylla tentacles from left
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.tentacles.push({ y: api.rnd(120, api.H - 80), len: 0, maxLen: 90 + api.rint(0, 40), spd: 140, retract: false });
            this.spawnT = Math.max(0.9, 1.5 - (24 - this.timer) * 0.025);
          }
          for (const t of this.tentacles) {
            t.len = Math.min(t.maxLen, t.len + t.spd * dt);
            if (t.len >= t.maxLen) { t.retract = true; }
            if (t.retract) t.len -= t.spd * dt * 1.5;
          }
          this.tentacles = this.tentacles.filter(t => !t.retract || t.len > 0);
          // Charybdis debris from right
          this.spawnD -= dt;
          if (this.spawnD <= 0) {
            this.debris.push({ x: api.W + 14, y: api.rnd(80, api.H - 60), vx: -(80 + api.rnd(0, 30)) });
            this.spawnD = Math.max(0.5, 0.8 - (24 - this.timer) * 0.015);
          }
          for (const d of this.debris) d.x += d.vx * dt;
          this.debris = this.debris.filter(d => d.x > -30);
          // Collision
          if (this.iframes <= 0) {
            const sy = api.H - 80;
            for (const t of this.tentacles) {
              if (t.len > this.sx - 18 && Math.abs(sy - t.y) < 18) {
                this.lives--; this.iframes = 1.2;
                api.shake(7, 0.3); api.flash('#cc4422', 0.2); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; } break;
              }
            }
            for (const d of this.debris) {
              if (Math.hypot(this.sx - d.x, sy - d.y) < 18) {
                this.lives--; this.iframes = 1.2;
                api.shake(7, 0.3); api.flash('#1a6688', 0.2); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; } break;
              }
            }
          } else { this.iframes -= dt; }
          if (this.timer <= 0) { api.addScore(200); api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          // Sea background
          c.fillStyle = '#060f28'; c.fillRect(0, 0, W, H);
          const sea = c.createLinearGradient(0, 0, 0, H);
          sea.addColorStop(0, '#0a1a40'); sea.addColorStop(1, '#050e28');
          c.fillStyle = sea; c.fillRect(0, 0, W, H);
          // Scylla cliff on left
          c.fillStyle = '#0d1a10'; c.fillRect(0, 0, 22, H);
          // Charybdis whirlpool on right (animated)
          const wx = W + 20, wy = H * 0.4;
          for (let r = 70; r > 10; r -= 15) {
            c.globalAlpha = 0.07 + 0.03 * ((r % 20) / 20);
            c.strokeStyle = '#4ac8d4'; c.lineWidth = 2;
            c.beginPath(); c.arc(wx, wy, r, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }
          // Tentacles from left
          for (const t of this.tentacles) {
            c.strokeStyle = '#2a6a2a'; c.lineWidth = 8; c.lineCap = 'round';
            c.beginPath(); c.moveTo(0, t.y); c.lineTo(t.len, t.y); c.stroke();
            c.lineCap = 'butt';
            g.circle(t.len, t.y, 8, '#1a4a1a');
          }
          // Debris from right
          for (const d of this.debris) {
            g.rect(d.x - 6, d.y - 5, 12, 10, '#2a4a6a');
            g.rect(d.x - 2, d.y - 2, 5, 4, '#4a6a8a');
          }
          // Ship
          const sy = H - 80;
          g.rect(this.sx - 20, sy, 40, 10, '#c8962a');
          g.rect(this.sx - 25, sy + 6, 50, 6, '#8a6218');
          g.rect(this.sx - 1, sy - 30, 3, 32, '#c8962a');
          g.rect(this.sx - 14, sy - 28, 28, 20, '#f0ede8');
          api.topBar('SCYLLA & CHARYBDIS');
          api.txt('SURVIVE ' + Math.ceil(Math.max(0, this.timer)) + 's', 8, 20, 8, '#4ac8d4');
          for (let li = 0; li < 3; li++) g.rect(W - 52 + li * 18, 3, 13, 10, li < this.lives ? '#cc4422' : '#1a0808');
          g.rect(6, H - 11, W - 12, 5, '#0a1a3a');
          g.rect(6, H - 11, Math.round((W - 12) * Math.max(0, this.timer / 24)), 5, '#4ac8d4');
          api.vignette();
        },
      },

      /* ══════════════════════════════════════════════════════════════════
       * CHAPTER 5 — THE BOW CONTEST: aim timing, 8 shots through ring row
       * ══════════════════════════════════════════════════════════════════ */
      {
        id: 'bow', name: 'THE BOW CONTEST', sub: 'TWELVE AXE HANDLES',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Bow arc + arrow
          c.strokeStyle = '#c8962a'; c.lineWidth = 2;
          c.beginPath(); c.arc(x, y, 10, -1.2, 1.2); c.stroke();
          g.rect(x - 10, y - 1, 18, 2, '#f0ede8');
          g.rect(x + 6, y - 3, 6, 6, '#cc4422');
        },
        intro: [
          'DISGUISED AS A',
          'BEGGAR, ODYSSEUS',
          'WATCHES THE SUITORS',
          'fail the bow trial.',
        ],
        quote: '"With ease he strung the great bow, and shot through every axe head." — Homer',
        help: 'TAP or press A when the ARROW aligns with a ring · 8 shots · 4 misses lose',
        winText: 'Each arrow threads clean. The suitors stare. The beggar lifts his mask.',
        loseText: 'The string slips. Telemachus averts his eyes.',
        init(api) {
          this.angle = 0; this.angSpd = 1.6; this.dir = 1;
          this.rings = []; this.shots = 0; this.need = 8; this.misses = 0; this.maxMiss = 4;
          this.fired = false; this.arrowX = -1; this.arrowSpd = 0; this.arrowY = 0;
          // Place 8 rings in a row near top
          for (let i = 0; i < 8; i++) this.rings.push({ x: 20 + i * 30, y: 100, hit: false });
        },
        update(api, dt) {
          if (this.fired) {
            this.arrowX += this.arrowSpd * dt;
            // Check ring hits
            for (const r of this.rings) {
              if (!r.hit && Math.abs(this.arrowX - r.x) < 10 && Math.abs(this.arrowY - r.y) < 18) {
                r.hit = true; this.shots++;
                api.burst(r.x, r.y, '#e8c87a', 10); api.audio.sfx('coin');
                if (this.shots >= this.need) { api.addScore(250); api.win(); return; }
              }
            }
            if (this.arrowX > api.W + 20) { this.fired = false; }
          } else {
            // Swing angle
            this.angle += this.angSpd * this.dir * dt;
            if (this.angle > 1.0) { this.dir = -1; }
            if (this.angle < -1.0) { this.dir = 1; }
            // Fire input
            if (api.pointer.justDown || api.keyPressed('a') || api.keyPressed('start')) {
              if (Math.abs(this.angle) < 0.35) {
                this.fired = true; this.arrowX = api.W / 2; this.arrowY = 100; this.arrowSpd = 200;
                api.audio.sfx('shoot');
              } else {
                this.misses++; api.audio.sfx('blip'); api.shake(3, 0.15);
                if (this.misses >= this.maxMiss) { api.lose(); return; }
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#0c1830');
          // Hall columns
          for (let i = 0; i < 4; i++) {
            c.fillStyle = '#162040'; c.fillRect(10 + i * 65, 50, 16, H - 60);
          }
          // Floor
          for (let fx = 0; fx < W; fx += 24) {
            g.rect(fx, H - 40, 22, 38, '#1a2a50');
            g.rect(fx, H - 40, 22, 1, '#2a3a60');
          }
          // Axe rings (top area)
          for (const r of this.rings) {
            c.strokeStyle = r.hit ? '#e8c87a' : '#d4763a'; c.lineWidth = r.hit ? 3 : 2;
            c.beginPath(); c.arc(r.x, r.y, 10, 0, Math.PI * 2); c.stroke();
            if (r.hit) { c.globalAlpha = 0.4; g.circle(r.x, r.y, 10, '#e8c87a'); c.globalAlpha = 1; }
          }
          // Bowman (Odysseus at bottom center)
          g.circle(W / 2, H - 80, 8, '#d4a060');
          g.rect(W / 2 - 4, H - 72, 8, 20, '#d4a060');
          // Bow arc
          c.save(); c.translate(W / 2, H - 60); c.rotate(this.angle);
          c.strokeStyle = '#c8962a'; c.lineWidth = 3;
          c.beginPath(); c.arc(0, 0, 28, -1.2, 1.2); c.stroke();
          // String
          c.strokeStyle = '#f0ede8'; c.lineWidth = 1;
          c.beginPath();
          c.moveTo(28 * Math.cos(-1.2), 28 * Math.sin(-1.2));
          c.lineTo(28 * Math.cos(1.2), 28 * Math.sin(1.2));
          c.stroke();
          c.restore();
          // Arrow if fired
          if (this.fired) {
            c.strokeStyle = '#f0ede8'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(this.arrowX - 20, this.arrowY); c.lineTo(this.arrowX + 6, this.arrowY); c.stroke();
            g.rect(this.arrowX + 4, this.arrowY - 3, 8, 6, '#cc4422');
          } else {
            // Aim line guide
            c.globalAlpha = 0.18; c.strokeStyle = '#f0ede8'; c.lineWidth = 1;
            c.setLineDash([4, 6]);
            c.beginPath();
            c.moveTo(W / 2, H - 60);
            const ex = W / 2 + Math.sin(this.angle) * 300;
            const ey = H - 60 - Math.cos(this.angle) * 300;
            c.lineTo(ex, ey); c.stroke();
            c.setLineDash([]); c.globalAlpha = 1;
          }
          api.topBar('THE BOW CONTEST');
          api.txt('SHOTS: ' + this.shots + '/' + this.need, 8, 20, 8, '#e8c87a');
          for (let mi = 0; mi < this.maxMiss; mi++) {
            g.rect(W - 58 + mi * 14, 3, 11, 10, mi < this.misses ? '#cc4422' : '#1a2a50');
          }
          api.vignette();
        },
      },

    ], // chapters
  }); // RetroSaga.create
})();
