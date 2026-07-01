/* ============================================================================
 * 20,000 LEAGUES UNDER THE SEA
 * Five voyages through Jules Verne's 1870 novel:
 *   1. THE HUNT       — steer the Abraham Lincoln, fire on the "monster"
 *   2. THE DIVE       — walk the seabed, collect specimens, dodge sea life
 *   3. THE SQUID      — swat giant tentacles at the Nautilus hatch
 *   4. THE ICE FIELD  — steer the Nautilus, ram through polar pack ice
 *   5. THE MAELSTROM  — spiral-escape the Norway whirlpool
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Nautilus emblem ─────────────────────────────────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Submarine body
    g.sprite([
      '..aaaaaaaaaaaaa..',
      '.aaaaaaaaaaaaaaaa',
      'aaaaaaaaaaaaaaaaa',
      '.aaaaaaaaaaaaaaaa',
      '..aaaaaaaaaaaa...',
      '......aaaa.......',
    ], cx - 51, cy - 18, { a: '#00c8a0' }, 6);
    // porthole
    g.circle(cx - 12, cy - 3, 8, '#030e1e');
    g.circle(cx - 12, cy - 3, 5, '#00c8a0');
    g.circle(cx - 12, cy - 3, 3, '#a0e8d8');
    // prop
    g.sprite([
      'p.',
      'pp',
      'pp',
      'p.',
    ], cx + 40, cy - 8, { p: '#c8941a' }, 4);
  }

  /* ─── Deep-ocean backdrop ─────────────────────────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Deep water gradient
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#020c1e');
    bg.addColorStop(0.45, '#03152e');
    bg.addColorStop(1, '#01070f');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);

    // Bioluminescent drifting particles
    for (let i = 0; i < 38; i++) {
      const bx = ((i * 73 + t * 12 * (1 + (i % 3) * 0.4)) % (W + 20)) - 10;
      const by = (i * 97 + 17) % H;
      const alpha = 0.1 + 0.45 * Math.sin(t * 1.8 + i * 1.1);
      c.globalAlpha = alpha;
      const col = (i % 3 === 0) ? '#00c8a0' : (i % 3 === 1) ? '#4ab8e8' : '#c8941a';
      g.rect(bx, by, 2, 2, col);
    }
    c.globalAlpha = 1;

    // Ocean surface glow at top
    const surf = c.createLinearGradient(0, 0, 0, 60);
    surf.addColorStop(0, 'rgba(4,28,60,.7)');
    surf.addColorStop(1, 'rgba(4,28,60,0)');
    c.fillStyle = surf; c.fillRect(0, 0, W, 60);

    // Coral formations at the bottom
    if (scene === 'menu' || scene === 'boot') {
      for (let i = 0; i < 7; i++) {
        const cx2 = 18 + i * 38, h2 = 28 + (i * 23) % 32;
        const col2 = (i % 2 === 0) ? '#c8301a' : '#ff6a50';
        // coral trunk
        g.rect(cx2 - 3, H - h2, 6, h2, col2);
        // branches
        g.rect(cx2 - 9, H - h2 + 8, 6, 4, col2);
        g.rect(cx2 + 3, H - h2 + 16, 6, 4, col2);
        g.rect(cx2 - 7, H - h2 + 24, 4, 4, col2);
      }
      // Sandy floor
      g.rect(0, H - 10, W, 10, '#1a1a0a');
    }

    // Nautilus silhouette (non-menu)
    if (scene !== 'menu' && scene !== 'boot') {
      const nx = W * 0.72 + Math.sin(t * 0.5) * 4;
      const ny = H * 0.28 + Math.cos(t * 0.35) * 3;
      c.globalAlpha = 0.18;
      g.rect(nx - 32, ny - 6, 64, 12, '#00c8a0');
      g.rect(nx - 28, ny - 10, 56, 7, '#00c8a0');
      g.rect(nx - 20, ny + 6, 36, 5, '#00c8a0');
      c.globalAlpha = 1;
    }

    // Overlay darkening for story/result screens
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(1,6,14,.78)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(1,6,14,.52)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Chapter portholes (gauge windows on the menu) ──────── */
  function drawPorthole(api, info) {
    const g = api.gfx, c = api.ctx;
    const { ch, i, x, y, w, h, sel, done, best } = info;
    const cx2 = x + w / 2, cy2 = y + h / 2;
    const radius = Math.min(w, h) / 2 - 2;

    // Outer brass ring
    c.beginPath(); c.arc(cx2, cy2, radius + 4, 0, Math.PI * 2);
    c.fillStyle = sel ? '#c8941a' : '#6a4a10'; c.fill();

    // Inner dark glass
    c.beginPath(); c.arc(cx2, cy2, radius, 0, Math.PI * 2);
    c.fillStyle = sel ? '#041828' : '#020e1c'; c.fill();

    // Depth glow (done = teal glow, sel = brighter)
    if (done) {
      c.globalAlpha = 0.35;
      c.beginPath(); c.arc(cx2, cy2, radius - 2, 0, Math.PI * 2);
      c.fillStyle = '#00c8a0'; c.fill();
      c.globalAlpha = 1;
    }

    // Bolt screws at 4 corners (brass dots on the ring)
    for (let b = 0; b < 4; b++) {
      const ang = (b / 4) * Math.PI * 2 + Math.PI / 4;
      const bx = cx2 + Math.cos(ang) * (radius + 2);
      const by = cy2 + Math.sin(ang) * (radius + 2);
      g.rect(bx - 2, by - 2, 4, 4, sel ? '#e8b040' : '#8a6020');
    }

    // Chapter number depth gauge (like a pressure dial)
    api.txtC('' + (i + 1), cx2, cy2 - radius + 10, sel ? 14 : 11, sel ? '#e8b040' : '#c8941a', true);

    // Chapter name (wrapped in the porthole)
    api.txtCFit(ch.name, cx2, cy2 - 3, 7, done ? '#00c8a0' : (sel ? '#a0e8d8' : '#406880'), false, (radius - 6) * 2);

    // Done check
    if (done) {
      api.txtC('✦', cx2, cy2 + radius - 18, 10, '#00c8a0');
    }

    // Pressure bubble top-left
    c.globalAlpha = 0.4;
    c.beginPath(); c.arc(cx2 - radius * 0.4, cy2 - radius * 0.35, radius * 0.18, 0, Math.PI * 2);
    c.fillStyle = '#a0e8d8'; c.fill();
    c.globalAlpha = 1;
  }

  RetroSaga.create({
    id: 'nemo',
    title: '20,000 LEAGUES',
    subtitle: 'UNDER THE SEA',
    currency: 'FATHOMS',
    accent: '#00c8a0',
    credit: 'AN 8-BIT VOYAGE · J. VERNE, 1870',

    screens: {
      win: '#00c8a0', lose: '#1a4060', chapterLabel: '#406880',
      name: '#a0e8d8', sub: '#00c8a0', intro: '#a0e8d8',
      quote: '#4a8090', help: '#00c8a0',
      score: '#a0e8d8', cur: '#00c8a0', cta: '#a0e8d8',
      overlay: 'rgba(1,6,16,.86)',
    },
    labels: {
      chapter: 'VOYAGE',
      score: 'FATHOMS SOUNDED',
      win: 'THE DEPTHS YIELD',
      lose: 'THE SEA CLAIMS YOU',
      cont: 'TAP TO DIVE AGAIN',
      finale: 'TAP FOR THE SURFACE',
      toMenu: 'TAP TO RETURN',
      play: 'TAP TO DESCEND',
    },

    emblem,
    scenery,
    bootCta: 'TAP TO DESCEND',
    menuLabel: 'CAPTAIN NEMO\'S LOG',
    menuHint: 'CHOOSE A VOYAGE',
    menuDone: 'ALL VOYAGES COMPLETE',

    menu: {
      colors: { title: '#00c8a0', label: '#406880', cur: '#a0e8d8' },
      // Five brass portholes scattered on the Nautilus observation deck
      layout(api) {
        // Non-list arrangement: two top, one center-left, two bottom — asymmetric
        return [
          { x: 20,  y: 60,  w: 100, h: 100 },
          { x: 148, y: 44,  w: 100, h: 100 },
          { x: 82,  y: 176, w: 106, h: 106 },
          { x: 14,  y: 304, w: 100, h: 100 },
          { x: 152, y: 320, w: 100, h: 100 },
        ];
      },
      card: drawPorthole,
    },

    finale: [
      'THE NAUTILUS IS GONE.',
      'ARONNAX, CONSEIL,',
      'AND NED LAND SURFACE',
      'in a fisherman\'s boat —',
      'the sea hides its secrets.',
    ],

    width: 270, height: 480, parent: '#game',
    palette: { gold: '#c8941a', teal: '#00c8a0', navy: '#030e1e' },

    chapters: [

      /* ══════════════════════════════════════════════════════
       * VOYAGE 1 — THE HUNT
       * Steer the Abraham Lincoln, fire on the sea monster.
       * Mechanic: tap to fire harpoon (timing — enemy crosses crosshairs)
       * ══════════════════════════════════════════════════════ */
      {
        id: 'hunt',
        name: 'THE HUNT',
        sub: 'ABOARD THE LINCOLN',
        icon(api, x, y) {
          const g = api.gfx;
          // ship hull
          g.rect(x - 9, y - 2, 18, 6, '#8a7040');
          // cannon
          g.rect(x - 5, y - 5, 10, 3, '#5a4020');
          // flash
          g.rect(x + 5, y - 6, 4, 2, '#e8c050');
        },
        intro: [
          'THE SEAS ARE TROUBLED.',
          'A MONSTER RAMS SHIPS',
          'ACROSS THE WORLD.',
          'The Lincoln gives chase.',
        ],
        quote: 'The sea was deeply agitated. Our frigate trembled to her very keel.',
        help: 'TAP when the monster crosses the crosshairs to fire',
        winText: 'The hull shudders — three direct strikes. It is no monster… it is a machine.',
        loseText: 'The creature dives. The Lincoln is left wallowing on the swell.',
        init(api) {
          this.hits = 0; this.need = 5; this.misses = 0; this.maxMiss = 4;
          this.ex = -30; this.ey = 0; this.espd = 0; this.phase = 0;
          this.nextPhase = 1.4; this.phaseT = 0;
          this.crossing = false; this.crossT = 0; this.crossDur = 1.2;
          this.fired = false; this.recoil = 0;
          this.wake = [];
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;
          this.phaseT += dt;
          this.recoil = Math.max(0, this.recoil - dt * 4);

          // Spawn crossing run when phaseT reaches threshold
          if (!this.crossing && this.phaseT >= this.nextPhase) {
            this.crossing = true; this.crossT = 0; this.fired = false;
            // random vertical lane
            this.ey = api.rnd(H * 0.3, H * 0.7);
            // alternate left-to-right and right-to-left
            if (this.phase % 2 === 0) { this.ex = -24; this.espd = W / this.crossDur; }
            else { this.ex = W + 24; this.espd = -W / this.crossDur; }
            this.phase++;
            api.audio.sfx('blip');
          }

          if (this.crossing) {
            this.crossT += dt;
            this.ex += this.espd * dt;
            // Add wake bubbles
            if (Math.random() < 0.25) this.wake.push({ x: this.ex, y: this.ey + api.rnd(-8, 8), life: 0.7 });
            if (this.crossT >= this.crossDur + 0.25) {
              // Run ended without being hit (or already fired)
              this.crossing = false;
              if (!this.fired) {
                this.misses++;
                api.audio.sfx('hurt');
                if (this.misses >= this.maxMiss) { api.lose(); return; }
              }
              this.phaseT = 0;
              this.nextPhase = api.rnd(0.8, 1.6) - Math.min(0.6, this.hits * 0.08);
            }
          }

          // Update wake
          for (const w of this.wake) { w.life -= dt; w.y -= 0.3 * f; }
          this.wake = this.wake.filter(w => w.life > 0);

          // Tap to fire
          if (api.confirm() && this.crossing && !this.fired) {
            this.fired = true;
            // Crosshairs center at W/2, H/2 — check if monster is near
            const cx = api.W / 2, cy = api.H * 0.45;
            const dist = Math.hypot(this.ex - cx, this.ey - cy);
            if (dist < 40) {
              this.hits++;
              this.recoil = 1;
              api.score += 30 + Math.floor((1 - dist / 40) * 40);
              api.audio.sfx('shoot');
              api.shake(5, 0.25);
              api.flash('#c8941a', 0.12);
              api.burst(this.ex, this.ey, '#00c8a0', 14);
              this.crossing = false;
              this.phaseT = 0;
              this.nextPhase = api.rnd(0.6, 1.2) - Math.min(0.4, this.hits * 0.06);
              if (this.hits >= this.need) { api.score += 100; api.win(); }
            } else {
              // Miss
              this.misses++;
              api.audio.sfx('blip');
              if (this.misses >= this.maxMiss) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const cx = W / 2, shipY = H * 0.45;

          // Sky gradient
          const sky = c.createLinearGradient(0, 0, 0, H * 0.5);
          sky.addColorStop(0, '#030d20'); sky.addColorStop(1, '#081e3c');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);

          // Stars
          for (let i = 0; i < 30; i++) {
            const sx = (i * 83) % W, sy = (i * 61) % Math.floor(H * 0.45);
            c.globalAlpha = 0.4 + 0.3 * Math.sin(api.t * 1.4 + i);
            g.rect(sx, sy, 1, 1, '#c8e0f0');
          }
          c.globalAlpha = 1;

          // Moon
          g.circle(W - 40, 35, 16, '#c8d8e8'); g.circle(W - 34, 30, 14, '#081e3c');

          // Horizon / sea surface
          const waterY = Math.floor(H * 0.5);
          const ocean = c.createLinearGradient(0, waterY, 0, H);
          ocean.addColorStop(0, '#0a2248'); ocean.addColorStop(1, '#020c20');
          c.fillStyle = ocean; c.fillRect(0, waterY, W, H - waterY);

          // Waves
          for (let x = 0; x < W; x += 4) {
            const wy = Math.sin(x * 0.07 + api.t * 1.5) * 3 + Math.sin(x * 0.13 + api.t * 0.9) * 1.5;
            g.rect(x, waterY + Math.floor(wy) - 1, 3, 3, '#1a4070');
          }

          // Wake bubbles from monster
          for (const w of this.wake) {
            c.globalAlpha = w.life * 0.8;
            g.rect(w.x - 2, w.y - 2, 4, 4, '#4ab8e8');
          }
          c.globalAlpha = 1;

          // Monster / Nautilus (when crossing)
          if (this.crossing && this.crossT < this.crossDur + 0.05) {
            const mx = this.ex, my = this.ey;
            // Partial submarine shape
            c.globalAlpha = 0.85;
            g.rect(mx - 22, my - 5, 44, 10, '#00c8a0');
            g.rect(mx - 18, my - 9, 36, 6, '#00c8a0');
            g.circle(mx - 20, my, 7, '#00c8a0');
            // glowing porthole
            g.circle(mx - 6, my - 2, 4, '#030e1e');
            g.circle(mx - 6, my - 2, 2, '#a0e8d8');
            c.globalAlpha = 1;
          }

          // Ship — Abraham Lincoln
          const shipRecoil = this.recoil * 4;
          // Hull
          g.rect(cx - 50, shipY - 8 + shipRecoil, 100, 16, '#8a7040');
          g.rect(cx - 46, shipY + 8 + shipRecoil, 92, 8, '#6a5030');
          // Mast
          g.rect(cx - 3, shipY - 40 + shipRecoil, 6, 32, '#5a4020');
          // Sail
          c.fillStyle = '#c8b880';
          c.beginPath(); c.moveTo(cx - 3, shipY - 38 + shipRecoil);
          c.lineTo(cx - 3, shipY - 14 + shipRecoil); c.lineTo(cx + 20, shipY - 24 + shipRecoil);
          c.closePath(); c.fill();
          // Cannon
          g.rect(cx + 12, shipY - 14 + shipRecoil, 20, 6, '#5a4020');
          if (this.recoil > 0.5) {
            // muzzle flash
            g.rect(cx + 32, shipY - 16 + shipRecoil, 8, 10, '#e8c050');
            g.rect(cx + 38, shipY - 14 + shipRecoil, 6, 6, '#fff0a0');
          }

          // Crosshairs in center
          const chx = cx, chy = shipY - 1;
          const chR = 28;
          c.strokeStyle = 'rgba(0,200,160,.55)'; c.lineWidth = 1;
          c.beginPath(); c.arc(chx, chy, chR, 0, Math.PI * 2); c.stroke();
          g.rect(chx - chR, chy - 1, chR * 2, 2, 'rgba(0,200,160,.3)');
          g.rect(chx - 1, chy - chR, 2, chR * 2, 'rgba(0,200,160,.3)');

          // HUD
          api.topBar('THE HUNT');
          api.txt('HITS ' + this.hits + '/' + this.need, 6, 20, 9, '#00c8a0');
          for (let i = 0; i < this.maxMiss; i++) {
            g.rect(W - 14 - i * 14, 19, 10, 10, i < this.misses ? '#c82020' : '#0a3050');
          }
          api.vignette(); api.scanlines();
        },
      },

      /* ══════════════════════════════════════════════════════
       * VOYAGE 2 — THE DIVE
       * Walk the seabed collecting specimens, dodge sea creatures.
       * Mechanic: drag/steer the diver left-right, collect glowing specimens
       * ══════════════════════════════════════════════════════ */
      {
        id: 'dive',
        name: 'THE DIVE',
        sub: 'THE CORAL KINGDOM',
        icon(api, x, y) {
          const g = api.gfx;
          // diver silhouette
          g.rect(x - 3, y - 7, 6, 8, '#4a8090');
          g.circle(x, y - 9, 4, '#a0e8d8');
          // air bubbles
          g.rect(x + 4, y - 10, 2, 2, '#4ab8e8');
          g.rect(x + 6, y - 14, 2, 2, '#4ab8e8');
        },
        intro: [
          'NEMO OFFERS A GIFT:',
          'WALK UPON THE SEA FLOOR',
          'IN ROUQUAYROL SUITS.',
          'The coral blazes with life.',
        ],
        quote: 'The magic of the deep sea! An indescribable garden of corals.',
        help: 'DRAG or use arrows to steer — collect glowing specimens',
        winText: 'The satchel is full. Aronnax surfaces with wonder in his eyes.',
        loseText: 'A moray eel strikes — the specimen bag spills. Back to the ship.',
        init(api) {
          this.x = api.W / 2; this.y = api.H - 60;
          this.vx = 0; this.vy = 0;
          this.collected = 0; this.need = 14;
          this.timer = 30; this.lives = 3;
          this.specs = []; this.creatures = [];
          this.spawnSpec = 0.4; this.spawnCrea = 1.6;
          this.hit = 0;
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;
          this.timer -= dt;
          this.hit = Math.max(0, this.hit - dt * 3);

          // Move diver
          const p = api.pointer;
          if (p.down) {
            this.x += (p.x - this.x) * Math.min(1, dt * 8);
          }
          if (api.keyDown('left')) this.vx -= 0.5 * f;
          if (api.keyDown('right')) this.vx += 0.5 * f;
          this.vx *= 0.82;
          this.x += this.vx * dt;
          this.x = clamp(this.x, 14, W - 14);

          // Diver bobs gently
          this.y = H - 60 + Math.sin(api.t * 1.4) * 3;

          // Spawn specimens (glowing orbs drifting up)
          this.spawnSpec -= dt;
          if (this.spawnSpec <= 0) {
            this.spawnSpec = api.rnd(0.5, 1.1);
            const cols = ['#00c8a0', '#4ab8e8', '#c8941a', '#a0e8d8'];
            this.specs.push({
              x: api.rnd(16, W - 16), y: H + 10,
              vy: api.rnd(-40, -28),
              col: cols[api.rint(0, cols.length - 1)],
              r: api.rnd(7, 11),
            });
          }

          // Spawn creatures (eels / jellyfish drifting down from above)
          this.spawnCrea -= dt;
          if (this.spawnCrea <= 0) {
            this.spawnCrea = api.rnd(1.2, 2.2) - Math.min(0.8, this.collected * 0.05);
            const side = api.chance(0.5);
            this.creatures.push({
              x: side ? -20 : W + 20,
              y: api.rnd(H * 0.25, H - 80),
              vx: side ? api.rnd(22, 38) : api.rnd(-38, -22),
              kind: api.chance(0.4) ? 'jelly' : 'eel',
              t: 0,
            });
          }

          // Update specimens
          for (const s of this.specs) { s.y += s.vy * dt; }
          this.specs = this.specs.filter(s => s.y > -20 && s.y < H + 20);

          // Collect
          for (let i = this.specs.length - 1; i >= 0; i--) {
            const s = this.specs[i];
            if (Math.hypot(this.x - s.x, this.y - s.y) < s.r + 14) {
              this.collected++;
              api.score += 15;
              api.audio.sfx('coin');
              api.burst(s.x, s.y, s.col, 8);
              this.specs.splice(i, 1);
              if (this.collected >= this.need) { api.score += 60; api.win(); return; }
            }
          }

          // Update creatures
          for (const cr of this.creatures) {
            cr.x += cr.vx * dt;
            cr.t += dt;
          }
          this.creatures = this.creatures.filter(cr => cr.x > -40 && cr.x < W + 40);

          // Creature collisions
          for (const cr of this.creatures) {
            if (Math.hypot(this.x - cr.x, this.y - cr.y) < 18 && this.hit <= 0) {
              this.lives--;
              this.hit = 1.2;
              api.shake(6, 0.3); api.flash('#c82020', 0.18); api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }

          if (this.timer <= 0) { api.lose(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Deep water gradient
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#020a1c'); bg.addColorStop(1, '#010609');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // Bioluminescent drifters
          for (let i = 0; i < 20; i++) {
            const bx = ((i * 61 + api.t * 8) % W);
            const by = ((i * 89 + 20) % H);
            c.globalAlpha = 0.08 + 0.12 * Math.sin(api.t * 2 + i);
            g.rect(bx, by, 2, 2, '#00c8a0');
          }
          c.globalAlpha = 1;

          // Coral at bottom
          for (let i = 0; i < 8; i++) {
            const cx2 = 14 + i * 34, h2 = 20 + (i * 19) % 28;
            const col2 = (i % 3 === 0) ? '#c8301a' : (i % 3 === 1) ? '#ff6a50' : '#c8941a';
            g.rect(cx2 - 2, H - h2 - 6, 4, h2, col2);
            g.rect(cx2 - 6, H - h2, 4, 4, col2);
            g.rect(cx2 + 2, H - h2 + 8, 4, 4, col2);
          }
          // Sandy floor
          g.rect(0, H - 8, W, 8, '#1a1a0a');
          g.rect(0, H - 12, W, 4, '#2a2a14');

          // Specimens
          for (const s of this.specs) {
            c.globalAlpha = 0.7 + 0.3 * Math.sin(api.t * 3 + s.x);
            g.circle(s.x, s.y, s.r, s.col);
            c.globalAlpha = 0.5;
            g.circle(s.x - s.r * 0.3, s.y - s.r * 0.3, s.r * 0.35, '#ffffff');
            c.globalAlpha = 1;
          }

          // Creatures
          for (const cr of this.creatures) {
            if (cr.kind === 'eel') {
              const offset = Math.sin(cr.t * 4 + cr.x * 0.1) * 8;
              g.rect(cr.x - 22, cr.y - 4 + offset, 44, 8, '#3a6020');
              g.rect(cr.vx > 0 ? cr.x + 20 : cr.x - 26, cr.y - 6 + offset, 8, 6, '#5a8030');
              g.rect(cr.vx > 0 ? cr.x + 26 : cr.x - 30, cr.y - 4 + offset, 4, 4, '#e83020');
            } else {
              // jellyfish
              const bob = Math.sin(cr.t * 2) * 4;
              c.globalAlpha = 0.7;
              g.circle(cr.x, cr.y + bob, 12, '#9b5cff');
              c.globalAlpha = 0.4;
              g.circle(cr.x, cr.y + bob, 9, '#c89aff');
              c.globalAlpha = 1;
              for (let ti = 0; ti < 4; ti++) {
                g.rect(cr.x - 8 + ti * 5, cr.y + 10 + bob + Math.sin(cr.t * 3 + ti) * 4, 2, 12, '#7040b8');
              }
            }
          }

          // Diver
          const flashCol = this.hit > 0.5 ? '#ff6060' : '#4a8090';
          g.rect(this.x - 5, this.y - 8, 10, 14, flashCol);
          g.circle(this.x, this.y - 10, 5, this.hit > 0.5 ? '#ff9090' : '#a0e8d8');
          // air bubbles
          for (let b = 0; b < 3; b++) {
            const bt = (api.t * 0.6 + b * 0.33) % 1;
            c.globalAlpha = bt * 0.6;
            g.circle(this.x + 7, this.y - 8 - bt * 20, 2, '#4ab8e8');
          }
          c.globalAlpha = 1;

          // HUD
          api.topBar('THE DIVE');
          api.txt('SPEC ' + this.collected + '/' + this.need, 6, 20, 9, '#00c8a0');
          for (let i = 0; i < 3; i++) {
            g.rect(W - 14 - i * 14, 19, 10, 10, i < this.lives ? '#00c8a0' : '#0a2030');
          }
          // Timer bar
          g.rect(6, H - 10, W - 12, 5, '#0a2030');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 30, 0, 1), 5, '#00c8a0');
          api.vignette(); api.scanlines();
        },
      },

      /* ══════════════════════════════════════════════════════
       * VOYAGE 3 — THE SQUID
       * Giant squid attacks the Nautilus — swat tentacles at the hatch.
       * Mechanic: tap tentacles before they seal the hatch, whack-a-mole style
       * ══════════════════════════════════════════════════════ */
      {
        id: 'squid',
        name: 'THE SQUID',
        sub: 'BEAST OF THE DEEP',
        icon(api, x, y) {
          const g = api.gfx;
          // tentacle
          g.rect(x - 1, y - 8, 2, 16, '#9b5cff');
          g.rect(x - 3, y + 4, 6, 4, '#7a3adf');
        },
        intro: [
          'THE NAUTILUS SHAKES.',
          'A COLOSSAL SQUID WRAPS',
          'ITS ARMS AROUND THE HULL.',
          'Man the hatches!',
        ],
        quote: 'A colossal poulpe was creeping towards us! Eight tentacles of immense length!',
        help: 'TAP tentacles to cut them before they block the hatch',
        winText: 'The last tentacle falls. Nemo wipes ink from his brow.',
        loseText: 'The hatch is sealed. The squid drags the Nautilus into the dark.',
        init(api) {
          this.chopped = 0; this.need = 12;
          this.timer = 30; this.breached = 0; this.maxBreach = 3;
          this.tentacles = [];
          this.spawn = 0.9;
          this.slashFx = [];
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;
          this.timer -= dt;
          // Spawn tentacles
          this.spawn -= dt;
          if (this.spawn <= 0) {
            const speedup = Math.min(0.6, this.chopped * 0.04);
            this.spawn = api.rnd(0.6, 1.1) - speedup;
            // Random position along top/sides
            const edge = api.rint(0, 2); // 0=top, 1=left, 2=right
            let tx, ty, targetX, targetY;
            if (edge === 0) { tx = api.rnd(30, W - 30); ty = -20; targetX = api.rnd(60, W - 60); targetY = api.rnd(H * 0.35, H * 0.65); }
            else if (edge === 1) { tx = -20; ty = api.rnd(H * 0.2, H * 0.8); targetX = api.rnd(40, W * 0.4); targetY = api.rnd(H * 0.3, H * 0.7); }
            else { tx = W + 20; ty = api.rnd(H * 0.2, H * 0.8); targetX = api.rnd(W * 0.6, W - 40); targetY = api.rnd(H * 0.3, H * 0.7); }
            this.tentacles.push({
              ox: tx, oy: ty, tx: tx, ty: ty, targetX, targetY,
              progress: 0, dur: api.rnd(1.1, 1.7) - speedup * 0.5,
              life: api.rnd(1.6, 2.4) - speedup * 0.3,
              age: 0,
              reached: false, breachT: 0,
            });
          }

          // Update tentacles
          for (let i = this.tentacles.length - 1; i >= 0; i--) {
            const t2 = this.tentacles[i];
            t2.age += dt;
            if (!t2.reached) {
              t2.progress = Math.min(1, t2.progress + dt / t2.dur);
              t2.tx = t2.ox + (t2.targetX - t2.ox) * t2.progress;
              t2.ty = t2.oy + (t2.targetY - t2.oy) * t2.progress;
              if (t2.progress >= 1) { t2.reached = true; api.audio.sfx('blip'); }
            } else {
              t2.breachT += dt;
              if (t2.breachT >= t2.life) {
                this.breached++;
                api.shake(8, 0.3); api.flash(api.colors.blood, 0.22); api.audio.sfx('hurt');
                this.tentacles.splice(i, 1);
                if (this.breached >= this.maxBreach) { api.lose(); return; }
                continue;
              }
            }
          }

          // Slash effects
          for (let i = this.slashFx.length - 1; i >= 0; i--) {
            this.slashFx[i].life -= dt;
            if (this.slashFx[i].life <= 0) this.slashFx.splice(i, 1);
          }

          // Tap to cut
          if (api.pointer.justDown) {
            let hit = false;
            for (let i = this.tentacles.length - 1; i >= 0; i--) {
              const t2 = this.tentacles[i];
              if (t2.reached && Math.hypot(api.pointer.x - t2.tx, api.pointer.y - t2.ty) < 24) {
                this.slashFx.push({ x: t2.tx, y: t2.ty, life: 0.35 });
                this.tentacles.splice(i, 1);
                this.chopped++;
                api.score += 20;
                api.audio.sfx('coin');
                api.burst(api.pointer.x, api.pointer.y, '#9b5cff', 10);
                hit = true;
                if (this.chopped >= this.need) { api.score += 80; api.win(); return; }
                break;
              }
            }
            if (!hit) api.audio.sfx('blip');
          }

          if (this.timer <= 0 && this.chopped < this.need) { api.lose(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Dark ocean trench
          api.clear('#010812');
          // Sub hull as background shape
          g.rect(20, H * 0.25, W - 40, H * 0.55, '#041828');
          g.rectO(20, H * 0.25, W - 40, H * 0.55, '#0a3050', 2);
          // Rivets
          for (let rx = 28; rx < W - 28; rx += 24) {
            g.rect(rx, H * 0.25 + 4, 4, 4, '#0a3050');
            g.rect(rx, H * 0.25 + H * 0.55 - 8, 4, 4, '#0a3050');
          }
          // Portholes on sub
          for (let pi = 0; pi < 4; pi++) {
            const px = 50 + pi * 52, py = H * 0.5;
            g.circle(px, py, 10, '#020e1e');
            g.circle(px, py, 7, '#0a3050');
            g.circle(px, py, 4, '#4ab8e8');
            c.globalAlpha = 0.3;
            g.circle(px - 3, py - 3, 2, '#ffffff');
            c.globalAlpha = 1;
          }

          // Tentacles
          for (const t2 of this.tentacles) {
            const pulsing = t2.reached && (t2.breachT * 6 % 1 > 0.5);
            const col = pulsing ? '#c060ff' : '#7a3adf';
            const tip = t2.reached ? '#c060ff' : '#9b5cff';
            // Draw tentacle from origin to current tip
            const steps = 10;
            for (let s = 0; s < steps; s++) {
              const frac = s / steps;
              const sx = t2.ox + (t2.tx - t2.ox) * frac;
              const sy = t2.oy + (t2.ty - t2.oy) * frac;
              const wobble = Math.sin(api.t * 5 + frac * 8 + t2.ox * 0.05) * (3 + frac * 3);
              g.rect(sx + wobble - 3, sy - 3, 6, 6, frac > 0.85 ? tip : col);
            }
            // Sucker at tip
            if (t2.reached) {
              g.circle(t2.tx, t2.ty, 12 + (pulsing ? 3 : 0), tip);
              g.circle(t2.tx, t2.ty, 6, '#030812');
              api.txtC('!', t2.tx, t2.ty - 5, 9, '#ffffff');
            }
          }

          // Slash effects
          for (const fx of this.slashFx) {
            c.globalAlpha = fx.life * 2.5;
            const len = 16;
            c.strokeStyle = '#ffffff'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(fx.x - len, fx.y - len); c.lineTo(fx.x + len, fx.y + len); c.stroke();
            c.beginPath(); c.moveTo(fx.x + len, fx.y - len); c.lineTo(fx.x - len, fx.y + len); c.stroke();
            c.globalAlpha = 1;
          }

          // HUD
          api.topBar('THE SQUID');
          api.txt('CUT ' + this.chopped + '/' + this.need, 6, 20, 9, '#9b5cff');
          for (let i = 0; i < this.maxBreach; i++) {
            g.rect(W - 14 - i * 14, 19, 10, 10, i < this.breached ? '#c82020' : '#0a2030');
          }
          // Timer
          g.rect(6, H - 10, W - 12, 5, '#0a2030');
          g.rect(6, H - 10, (W - 12) * clamp(this.chopped / this.need, 0, 1), 5, '#9b5cff');
          api.vignette(); api.scanlines();
        },
      },

      /* ══════════════════════════════════════════════════════
       * VOYAGE 4 — THE ICE FIELD
       * Ram through polar pack ice — tap timing to break each sheet.
       * Mechanic: oscillating power gauge, tap when in the green zone
       * ══════════════════════════════════════════════════════ */
      {
        id: 'ice',
        name: 'THE ICE FIELD',
        sub: 'BENEATH THE POLE',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 3, 16, 6, '#a0e8d8');
          g.rect(x - 4, y - 7, 8, 4, '#4ab8e8');
          g.rect(x - 6, y + 3, 12, 3, '#4ab8e8');
        },
        intro: [
          'THE NAUTILUS PUSHES NORTH.',
          'THE SEA FREEZES SOLID.',
          'NEMO WILL RAM THROUGH',
          'every sheet to find air.',
        ],
        quote: 'Could we pierce this icy ceiling and breathe the open air above it?',
        help: 'TAP when the gauge is in the GREEN — break the ice',
        winText: 'The last barrier shatters. The Nautilus bursts into Arctic air.',
        loseText: 'The engines fail. The ice closes in around the hull.',
        init(api) {
          this.breaks = 0; this.need = 8;
          this.misses = 0; this.maxMiss = 4;
          this.m = 0.5; this.dir = 1; this.spd = 0.9;
          this.band = 0.2;
          this.sheetLife = 0; this.impactT = 0;
          this.iceShards = [];
        },
        update(api, dt) {
          const f = dt * 60;
          // Oscillate gauge
          this.m += this.dir * this.spd * 0.035 * f;
          if (this.m > 1) { this.m = 1; this.dir = -1; }
          if (this.m < 0) { this.m = 0; this.dir = 1; }
          this.impactT = Math.max(0, this.impactT - dt * 3);
          for (const s of this.iceShards) {
            s.x += s.vx * dt; s.y += s.vy * dt;
            s.vy += 60 * dt;
            s.life -= dt;
          }
          this.iceShards = this.iceShards.filter(s => s.life > 0);

          if (api.confirm()) {
            const inZone = Math.abs(this.m - 0.5) < this.band;
            if (inZone) {
              this.breaks++;
              this.impactT = 1;
              api.score += 30 + Math.floor((1 - Math.abs(this.m - 0.5) / this.band) * 30);
              api.audio.sfx('power');
              api.shake(7, 0.3);
              api.flash('#a0e8d8', 0.2);
              // Spawn ice shards
              for (let i = 0; i < 12; i++) {
                const ang = (i / 12) * Math.PI * 2;
                this.iceShards.push({
                  x: api.W / 2, y: api.H * 0.35,
                  vx: Math.cos(ang) * api.rnd(30, 90),
                  vy: Math.sin(ang) * api.rnd(30, 90) - 40,
                  life: api.rnd(0.5, 1.1),
                  size: api.rnd(4, 10),
                });
              }
              this.spd = Math.min(2.6, this.spd + 0.18);
              this.band = Math.max(0.07, this.band - 0.012);
              if (this.breaks >= this.need) { api.score += 80; api.win(); }
            } else {
              this.misses++;
              api.audio.sfx('hurt');
              api.shake(3, 0.15);
              if (this.misses >= this.maxMiss) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Polar ocean
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#040e20'); bg.addColorStop(1, '#010609');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // Ice sheet at top
          const impactFrac = this.impactT;
          g.rect(0, 0, W, 40, '#a0e8d8');
          g.rect(0, 38, W, 6, '#7ac8c0');
          // Cracks on current break
          if (this.impactT > 0) {
            c.globalAlpha = this.impactT;
            c.strokeStyle = '#ffffff'; c.lineWidth = 2;
            const cx2 = W / 2, cy2 = 36;
            for (let ci = 0; ci < 6; ci++) {
              const ang = (ci / 6) * Math.PI * 2;
              const len2 = 18 + ci * 4;
              c.beginPath(); c.moveTo(cx2, cy2);
              c.lineTo(cx2 + Math.cos(ang) * len2, cy2 + Math.sin(ang) * len2);
              c.stroke();
            }
            c.globalAlpha = 1;
          }
          // Break count chips in ice
          for (let i = 0; i < this.breaks; i++) {
            const bx = 15 + i * 30, by = 15;
            g.rect(bx - 8, by - 5, 16, 10, '#4ab8e8');
            g.rect(bx - 4, by - 8, 8, 16, '#4ab8e8');
          }

          // Ice shards
          for (const s of this.iceShards) {
            c.globalAlpha = s.life;
            g.rect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size, '#a0e8d8');
            c.globalAlpha = 1;
          }

          // Nautilus sub (pointing up toward ice)
          const subY = H * 0.55 - impactFrac * 10;
          // body
          g.rect(W / 2 - 24, subY - 18, 48, 36, '#00c8a0');
          g.rect(W / 2 - 20, subY - 26, 40, 12, '#00c8a0');
          g.rect(W / 2 - 14, subY + 18, 28, 8, '#007a62');
          // prow (pointing up)
          c.fillStyle = '#00c8a0';
          c.beginPath(); c.moveTo(W / 2 - 14, subY - 26);
          c.lineTo(W / 2 + 14, subY - 26); c.lineTo(W / 2, subY - 44); c.closePath(); c.fill();
          // Porthole
          g.circle(W / 2 - 6, subY, 7, '#030e1e');
          g.circle(W / 2 - 6, subY, 4, '#4ab8e8');
          // Propeller
          g.rect(W / 2 - 5, subY + 22, 10, 12, '#c8941a');

          // Depth gauge / power meter
          const mx = 24, my = H - 44, mw = W - 48;
          g.rect(mx, my, mw, 14, '#0a2030');
          g.rect(mx + mw * (0.5 - this.band), my, mw * this.band * 2, 14, 'rgba(0,200,160,.4)');
          g.rect(mx + mw * 0.5 - 1, my - 4, 2, 22, '#00c8a0');
          g.rect(mx + mw * this.m - 3, my - 5, 6, 24, '#e8c050');
          api.txtC('POWER', W / 2, my - 13, 7, '#406880', true);

          api.topBar('THE ICE FIELD');
          api.txt('BREAK ' + this.breaks + '/' + this.need, 6, 20, 9, '#4ab8e8');
          for (let i = 0; i < this.maxMiss; i++) {
            g.rect(W - 14 - i * 14, 19, 10, 10, i < this.misses ? '#c82020' : '#0a2030');
          }
          api.vignette(); api.scanlines();
        },
      },

      /* ══════════════════════════════════════════════════════
       * VOYAGE 5 — THE MAELSTROM
       * Escape the Norway whirlpool — steer outward through debris.
       * Mechanic: player navigates outward in a spiral, avoiding rocks
       * ══════════════════════════════════════════════════════ */
      {
        id: 'maelstrom',
        name: 'THE MAELSTROM',
        sub: 'THE LAST DESCENT',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.strokeStyle = '#4ab8e8'; c.lineWidth = 1.5;
          c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 1.6); c.stroke();
          c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 1.4); c.stroke();
        },
        intro: [
          'THE NAUTILUS IS CAUGHT.',
          'THE NORWAY MAELSTROM',
          'PULLS EVERYTHING DOWN.',
          'We must escape — now.',
        ],
        quote: 'I was thrown down and for a few hours I know nothing more.',
        help: 'DRAG or arrows to steer the Nautilus away from the vortex',
        winText: 'Aronnax, Conseil, and Ned surface in a fisherman\'s boat. They are free.',
        loseText: 'The maelstrom takes the Nautilus. Only the sea remains.',
        init(api) {
          this.angle = 0;
          this.radius = 20;  // start near center, need to reach outer edge
          this.targetR = api.W * 0.44;
          this.angSpd = 2.2;  // radians per second (maelstrom rotation)
          this.vr = 0;        // radial velocity (outward is positive)
          this.lives = 3;
          this.hit = 0;
          this.debris = [];
          this.spawnDebris = 0.5;
          this.escaping = false;
          this.escapeT = 0;
          this.timer = 0;
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;
          this.timer += dt;
          this.hit = Math.max(0, this.hit - dt * 2.5);

          const cx = W / 2, cy = H / 2 + 20;

          // Rotate the angle (maelstrom spins)
          this.angle += this.angSpd * dt;

          // Radial control: left/right arrows = outward/inward adjustment
          const p = api.pointer;
          let radialPush = 0;
          if (p.down) {
            // Drag toward pointer — compute radial component
            const px = p.x - cx, py = p.y - cy;
            const pointerR = Math.hypot(px, py);
            radialPush = (pointerR - this.radius) * 0.06;
          }
          if (api.keyDown('left') || api.keyDown('up')) radialPush += 2.0;
          if (api.keyDown('right') || api.keyDown('down')) radialPush -= 1.0;

          // The maelstrom pulls inward
          const inwardPull = 20 + this.timer * 1.5;
          this.vr += (radialPush * 60 - inwardPull) * dt;
          this.vr = clamp(this.vr, -80, 160);
          this.vr *= 0.94;
          this.radius += this.vr * dt;
          this.radius = clamp(this.radius, 8, this.targetR + 20);

          // Player position on the spiral
          const px = cx + Math.cos(this.angle) * this.radius;
          const py = cy + Math.sin(this.angle) * this.radius;

          // Spawn debris (spinning rocks/wreckage on the spiral)
          this.spawnDebris -= dt;
          if (this.spawnDebris <= 0) {
            this.spawnDebris = api.rnd(0.35, 0.8);
            // Debris spawns at a random radius on the spiral
            const dR = api.rnd(this.radius + 15, Math.min(this.targetR, this.radius + 80));
            const dAng = this.angle + api.rnd(0.3, 2.4);
            this.debris.push({
              angle: dAng,
              radius: dR,
              angSpd: this.angSpd * api.rnd(0.8, 1.3),
              driftR: api.rnd(-10, -20),  // drift inward
              size: api.rnd(6, 14),
              col: api.chance(0.4) ? '#8a7040' : '#406080',
              life: api.rnd(2.5, 4.5),
            });
          }

          // Update debris
          for (const d of this.debris) {
            d.angle += d.angSpd * dt;
            d.radius += d.driftR * dt;
            d.life -= dt;
          }
          this.debris = this.debris.filter(d => d.life > 0 && d.radius > 4);

          // Collision
          if (this.hit <= 0) {
            for (const d of this.debris) {
              const dx = cx + Math.cos(d.angle) * d.radius;
              const dy = cy + Math.sin(d.angle) * d.radius;
              if (Math.hypot(px - dx, py - dy) < d.size + 10) {
                this.lives--;
                this.hit = 1.2;
                api.shake(6, 0.3); api.flash('#c82020', 0.2); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }

          // Lose if sucked to center
          if (this.radius < 10) { api.lose(); return; }

          // Win — reached outer edge
          if (this.radius >= this.targetR) {
            api.score += 100 + Math.floor(this.timer * 2);
            api.win();
          }

          api.score = Math.floor(this.radius * 2 + this.timer * 4);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const cx = W / 2, cy = H / 2 + 20;

          api.clear('#010610');

          // Draw maelstrom spiral rings (visual)
          c.strokeStyle = 'rgba(74,184,232,.15)'; c.lineWidth = 1;
          for (let ring = 1; ring <= 8; ring++) {
            const r = ring * (this.targetR / 8);
            c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
          }

          // Rotating funnel effect (streaks)
          c.globalAlpha = 0.08;
          for (let streak = 0; streak < 12; streak++) {
            const a = this.angle * 1.5 + (streak / 12) * Math.PI * 2;
            c.strokeStyle = '#4ab8e8'; c.lineWidth = 3;
            c.beginPath();
            c.moveTo(cx, cy);
            c.lineTo(cx + Math.cos(a) * this.targetR, cy + Math.sin(a) * this.targetR);
            c.stroke();
          }
          c.globalAlpha = 1;

          // Water surface shimmer
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2 + this.angle * 0.3;
            const r = this.targetR - 8;
            c.globalAlpha = 0.3;
            g.rect(cx + Math.cos(a) * r - 3, cy + Math.sin(a) * r - 3, 6, 6, '#1a4070');
          }
          c.globalAlpha = 1;

          // Dark vortex center
          const vortexGrad = c.createRadialGradient(cx, cy, 0, cx, cy, 50);
          vortexGrad.addColorStop(0, 'rgba(0,0,0,.9)');
          vortexGrad.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = vortexGrad; c.fillRect(cx - 60, cy - 60, 120, 120);

          // Debris
          for (const d of this.debris) {
            const dx = cx + Math.cos(d.angle) * d.radius;
            const dy = cy + Math.sin(d.angle) * d.radius;
            const rot = d.angle * 2;
            c.save(); c.translate(dx, dy); c.rotate(rot);
            g.rect(-d.size / 2, -d.size / 2, d.size, d.size, d.col);
            c.restore();
          }

          // Player / Nautilus
          const nx = cx + Math.cos(this.angle) * this.radius;
          const ny = cy + Math.sin(this.angle) * this.radius;
          const nang = this.angle + Math.PI / 2;
          const flashSub = this.hit > 0.6;
          c.save(); c.translate(nx, ny); c.rotate(nang);
          const sc = flashSub ? '#ff8080' : '#00c8a0';
          g.rect(-14, -5, 28, 10, sc);
          g.rect(-12, -9, 24, 6, sc);
          g.circle(-10, 0, 4, '#030e1e');
          g.circle(-10, 0, 2, flashSub ? '#ff8080' : '#4ab8e8');
          c.restore();

          // Escape ring
          c.strokeStyle = 'rgba(0,200,160,.35)'; c.lineWidth = 2;
          c.setLineDash([6, 8]);
          c.beginPath(); c.arc(cx, cy, this.targetR, 0, Math.PI * 2); c.stroke();
          c.setLineDash([]);

          // Radial progress bar
          const progressFrac = clamp((this.radius - 10) / (this.targetR - 10), 0, 1);
          api.topBar('THE MAELSTROM');
          api.txt('ESCAPE', 6, 20, 7, '#4ab8e8');
          g.rect(60, 21, 110, 8, '#0a2030');
          g.rect(60, 21, 110 * progressFrac, 8, '#00c8a0');
          for (let i = 0; i < 3; i++) {
            g.rect(W - 14 - i * 14, 19, 10, 10, i < this.lives ? '#00c8a0' : '#0a2030');
          }
          api.vignette(); api.scanlines();
        },
      },
    ], // end chapters
  }); // end RetroSaga.create
})();
