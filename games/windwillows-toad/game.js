/* ============================================================================
 * THE WIND IN THE WILLOWS — POOP-POOP!
 * Five tales from Kenneth Grahame's 1908 classic:
 *   1. POOP-POOP!       — steer Toad's motorcar, dodge traffic (22s survive)
 *   2. DISGUISED!        — bluff past guards as the washerwoman (suspicion)
 *   3. LOCKED IN!       — time the padlock tumblers to escape prison (5 pins)
 *   4. THE RIVER BANK   — row home to the beat, oar strokes on the river (16)
 *   5. RETAKE TOAD HALL — tap weasels out of the windows before they flee (10)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp  = Retro.util.clamp;
  const rand   = Retro.util.rand;
  const randI  = Retro.util.randInt;

  /* ─── English countryside palette ─── */
  const C = {
    sky:    '#7ac0e8',
    skyH:   '#4a90c8',
    meadow: '#4a9a2a',
    meadowD:'#2a6014',
    hedge:  '#1a4a0a',
    river:  '#2878c0',
    riverL: '#5098d8',
    gold:   '#d8a020',
    goldL:  '#f0bc38',
    cream:  '#f4e8cc',
    stone:  '#a09060',
    toad:   '#5a9a20',
    toadL:  '#80c040',
    toadD:  '#2a5a08',
    brown:  '#7a5020',
    brownL: '#a07040',
    road:   '#b8a870',
    roadL:  '#d0c090',
    weasel: '#9a7840',
    weaselD:'#6a5020',
    red:    '#c83020',
    grey:   '#807060',
    dark:   '#0c1408',
    parch:  '#e8d8a0',
  };

  /* ─── Emblem: Mr Toad's motorcar, front view, goggles and all ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // Body / bonnet
    g.rect(cx - 18, cy - 6,  36, 18, C.toad);
    g.rect(cx - 14, cy - 16, 28,  12, C.toadD);
    // Windscreen
    g.rect(cx - 10, cy - 14, 20,  9, '#a8d4f0');
    // Headlights
    g.circle(cx - 12, cy + 8, 5, C.gold);
    g.circle(cx + 12, cy + 8, 5, C.gold);
    g.circle(cx - 12, cy + 8, 3, C.goldL);
    g.circle(cx + 12, cy + 8, 3, C.goldL);
    // Wheels
    g.circle(cx - 16, cy + 14, 6, '#1a1008');
    g.circle(cx + 16, cy + 14, 6, '#1a1008');
    g.circle(cx - 16, cy + 14, 3, C.stone);
    g.circle(cx + 16, cy + 14, 3, C.stone);
    // Radiator grille
    g.rect(cx - 10, cy + 4, 20, 8, C.brownL);
    for (let r = 0; r < 4; r++) g.rect(cx - 8 + r * 6, cy + 4, 2, 8, C.brown);
    // Toad face in windscreen (goggles)
    g.circle(cx,      cy - 8, 5, C.toad);
    g.circle(cx - 3,  cy - 9, 2, '#c8e0f0');
    g.circle(cx + 3,  cy - 9, 2, '#c8e0f0');
    // Horn
    g.rect(cx + 14, cy - 5, 8, 3, C.brown);
    g.circle(cx + 22, cy - 4, 3, C.brown);
  }

  /* ─── Scenery ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Parchment countryside map
      c.fillStyle = C.parch; c.fillRect(0, 0, W, H);
      // Parchment texture dots
      for (let i = 0; i < 200; i++) {
        const px = (i * 73 + 11) % W, py = (i * 53 + 7) % H;
        c.globalAlpha = 0.03 + (i % 4) * 0.007;
        c.fillStyle = '#8b6010'; c.fillRect(px, py, 2, 1);
      }
      c.globalAlpha = 1;
      // Map border (double line)
      c.strokeStyle = '#9a7030'; c.lineWidth = 4; c.strokeRect(8, 8, W - 16, H - 16);
      c.strokeStyle = '#c8a040'; c.lineWidth = 1; c.strokeRect(12, 12, W - 24, H - 24);
      // Rolling green hills (lower half)
      c.fillStyle = '#8ac050';
      c.beginPath(); c.moveTo(0, H * 0.52);
      for (let x = 0; x <= W; x += 14) {
        c.lineTo(x, H * 0.52 - Math.sin(x * 0.09) * 18 - Math.sin(x * 0.05) * 12);
      }
      c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      // Gatehouse wall (top-right: the guarded courtyard)
      c.fillStyle = '#7a6a52';
      c.fillRect(178, 92, 68, 40);
      c.fillStyle = '#5a4c38';
      c.fillRect(178, 92, 68, 8);
      c.fillRect(184, 100, 10, 32); c.fillRect(230, 100, 10, 32);
      // River (right side)
      c.fillStyle = C.river;
      c.beginPath();
      c.moveTo(W * 0.68, 0);
      c.bezierCurveTo(W * 0.76, H * 0.28, W * 0.64, H * 0.55, W * 0.70, H);
      c.lineTo(W * 0.82, H);
      c.bezierCurveTo(W * 0.76, H * 0.55, W * 0.88, H * 0.28, W * 0.80, 0);
      c.closePath(); c.fill();
      // Winding roads connecting chapter nodes
      c.strokeStyle = C.roadL; c.lineWidth = 5;
      // Road: Ch1 (80,122) → Ch3 (70,272)
      c.beginPath(); c.moveTo(80, 122); c.bezierCurveTo(60, 170, 60, 220, 70, 272); c.stroke();
      // Road: Ch1 (80,122) → Ch2 (195,157)
      c.beginPath(); c.moveTo(80, 122); c.bezierCurveTo(110, 100, 160, 110, 195, 157); c.stroke();
      // Road: Ch2 (195,157) → Ch4 (200,282)
      c.beginPath(); c.moveTo(195, 157); c.bezierCurveTo(220, 200, 210, 245, 200, 282); c.stroke();
      // Road: Ch3 (70,272) → Ch5 (135,412)
      c.beginPath(); c.moveTo(70, 272); c.bezierCurveTo(80, 330, 100, 370, 135, 412); c.stroke();
      // Road: Ch4 (200,282) → Ch5 (135,412)
      c.beginPath(); c.moveTo(200, 282); c.bezierCurveTo(195, 340, 170, 380, 135, 412); c.stroke();
      // Toad Hall silhouette at bottom
      c.fillStyle = '#c8b070';
      g.rect(100, H - 54, 70, 40, '#c8b070');
      c.fillStyle = '#8a6830';
      c.beginPath(); c.moveTo(94, H - 54); c.lineTo(135, H - 76); c.lineTo(176, H - 54); c.closePath(); c.fill();
      g.rect(118, H - 38, 16, 24, '#6a4820');
      // Compass rose
      api.txtC('N', W - 28, H - 60, 8, C.stone, true);
      g.rect(W - 40, H - 56, 26, 26, 'rgba(180,150,60,.18)');
      c.strokeStyle = C.stone; c.lineWidth = 1; c.strokeRect(W - 40, H - 56, 26, 26);
      api.txtC('S', W - 28, H - 36, 7, C.stone, true);
      api.txtC('W', W - 40, H - 48, 7, C.stone, true);
      api.txtC('E', W - 16, H - 48, 7, C.stone, true);
      return;
    }

    // Default: English countryside sky + meadow
    const sky = c.createLinearGradient(0, 0, 0, H * 0.5);
    sky.addColorStop(0, C.skyH); sky.addColorStop(1, C.sky);
    c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.5);
    // Clouds
    for (let i = 0; i < 4; i++) {
      const cx2 = ((t * 11 + i * 76) % (W + 60)) - 30, cy2 = 26 + i * 20;
      c.globalAlpha = 0.72;
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(cx2,      cy2,     14, 0, 7); c.fill();
      c.beginPath(); c.arc(cx2 + 12, cy2 + 4, 11, 0, 7); c.fill();
      c.beginPath(); c.arc(cx2 - 12, cy2 + 5, 9,  0, 7); c.fill();
    }
    c.globalAlpha = 1;
    // Meadow
    c.fillStyle = C.meadow; c.fillRect(0, H * 0.5, W, H * 0.5);
    // Hedge-row bumps
    c.fillStyle = C.hedge;
    for (let i = 0; i < 12; i++) {
      c.beginPath(); c.arc((i * 24 + 4) % W, H * 0.5, 10 + (i * 7) % 8, 0, Math.PI); c.fill();
    }
    // Dark overlay for narrative screens
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(8,18,4,.78)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Map layout: 5 chapter node rects on the parchment map ─── */
  const MAP_LAYOUT = [
    { x: 40,  y: 100, w: 80, h: 44 }, // Ch1: POOP-POOP (top-left road)
    { x: 155, y: 135, w: 80, h: 44 }, // Ch2: DISGUISED! (top-right gatehouse)
    { x: 28,  y: 250, w: 80, h: 44 }, // Ch3: PRISON     (middle-left)
    { x: 158, y: 260, w: 80, h: 44 }, // Ch4: RIVER BANK (middle-right)
    { x: 88,  y: 385, w: 94, h: 44 }, // Ch5: TOAD HALL  (bottom-center)
  ];

  RetroSaga.create({
    id: 'windwillows',
    title: 'The Wind in the Willows',
    subtitle: 'POOP-POOP!',
    currency: 'CHEERS',
    screens: {
      win:          '#5aaa28',
      lose:         '#c83020',
      chapterLabel: '#9a7030',
      name:         '#f4e8cc',
      sub:          '#6abf30',
      intro:        '#f4e8cc',
      quote:        '#a09060',
      help:         '#d8a020',
      score:        '#f4e8cc',
      cur:          '#d8a020',
      cta:          '#f4e8cc',
      overlay:      'rgba(12,22,6,.82)',
    },
    labels: {
      chapter: 'ADVENTURE',
      score:   'CHEERS WON',
      win:     'POOP-POOP!',
      lose:    'OH BOTHER!',
      cont:    'TAP TO MOTOR ON',
      finale:  'TAP FOR THE GRAND FINISH',
      toMenu:  'BACK TO THE MAP',
      play:    'TAP TO BEGIN',
    },
    accent:   '#d8a020',
    credit:   'AN 8-BIT TRIBUTE · KENNETH GRAHAME 1908',
    emblem,
    scenery,
    bootCta:   'TAP TO POOP-POOP',
    menuLabel: 'THE WIND IN THE WILLOWS',
    menuHint:  'CHOOSE YOUR ADVENTURE',
    menuDone:  'TOAD HALL RECLAIMED!',

    menu: {
      title(api, cheers) {
        const g = api.gfx, W = api.W;
        // Ribbon banner at top of map
        g.rect(16, 18, W - 32, 30, C.gold);
        g.rectO(16, 18, W - 32, 30, C.brown, 2);
        api.txtCFit('THE WIND IN THE WILLOWS', W / 2, 22, 9, C.brown, true, W - 44);
        api.txtCFit('CHEERS  ' + cheers, W / 2, 36, 9, C.brownL, true, W - 44);
      },
      layout() { return MAP_LAYOUT; },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2, cy = y + h / 2;
        // Post
        g.rect(cx - 2, cy + 10, 4, 18, C.brown);
        // Sign board (English road-sign rectangle, rounded slightly)
        const brd = sel ? C.gold : (done ? '#b0cc70' : C.cream);
        c.fillStyle = brd;
        c.beginPath();
        c.roundRect(x + 2, y + 2, w - 4, h - 12, 4);
        c.fill();
        c.strokeStyle = sel ? C.brown : (done ? '#5a8018' : C.stone);
        c.lineWidth = sel ? 2 : 1; c.stroke();
        // Chapter icon centred in sign
        if (ch.icon) ch.icon(api, cx, cy - 6);
        // Chapter name below icon
        api.txtCFit(ch.name, cx, cy + 6, 7, sel ? C.brown : (done ? '#3a6010' : '#5a3a10'), true, w - 12);
        // Done tick
        if (done) {
          g.circle(x + w - 11, y + 4, 7, '#3a8018');
          api.txtC('✓', x + w - 11, y - 1, 9, C.cream, true);
        }
        // Selection highlight arrow
        if (sel) {
          c.fillStyle = C.brown;
          c.beginPath();
          c.moveTo(x - 2, cy - 10);
          c.lineTo(x - 10, cy - 5);
          c.lineTo(x - 2, cy);
          c.closePath(); c.fill();
        }
      },
    },

    finale: [
      'TOAD HALL IS WON!',
      '',
      'TOAD STOOD UPON THE STEPS',
      'AND BOWED LOW TO HIS FRIENDS.',
      '',
      '"I AM THE FAMOUS,',
      'THE POPULAR,',
      'THE INCOMPARABLE TOAD!"',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ==============================================================
       * 1. POOP-POOP!  — steer Toad's motorcar, dodge traffic 22s
       * ============================================================== */
      {
        id: 'road',
        name: 'POOP-POOP!',
        sub: 'THE OPEN ROAD',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 4, 16, 10, C.toad);
          g.circle(x - 5, y + 6, 3, '#1a1008');
          g.circle(x + 5, y + 6, 3, '#1a1008');
          g.circle(x - 4, y - 1, 2, C.gold);
          g.circle(x + 4, y - 1, 2, C.gold);
        },
        intro: [
          'MR. TOAD OF TOAD HALL',
          'HAS FOUND HIS DESTINY —',
          'THE MOTORCAR!',
          '"Nothing so complete,"',
          'he cried, "as a motor car!',
          'POOP-POOP!"',
        ],
        quote: '"Glorious, stirring sight! The poetry of motion! The only way to travel!" — Kenneth Grahame',
        help: 'DRAG left/right to steer · avoid carts, geese & potholes',
        winText: 'Toad arrived in a cloud of dust, goggles askew, grinning magnificently.',
        loseText: '"Bother!" yelped Toad as the ditch swallowed the motorcar whole.',
        init(api) {
          this.toadX  = api.W / 2;
          this.lives  = 3;
          this.timer  = 0;
          this.dur    = 22;
          this.obs    = [];
          this.spawnT = 0;
          this.roadY  = 0;
          this.invT   = 0;
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer += dt;
          if (this.invT > 0) this.invT -= dt;
          if (this.timer >= this.dur) { api.score += 120; api.win(); return; }
          // Steer
          if (api.pointer.down) this.toadX = clamp(api.pointer.x, 38, W - 38);
          if (api.keyDown('left'))  this.toadX = clamp(this.toadX - 190 * dt, 38, W - 38);
          if (api.keyDown('right')) this.toadX = clamp(this.toadX + 190 * dt, 38, W - 38);
          // Road scroll
          this.roadY = (this.roadY + 220 * dt) % 60;
          // Spawn obstacles — every 1.8s at start, down to 0.9s by 22s
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.9, 1.8 - this.timer * 0.04);
            const kinds = ['cart', 'cart', 'goose', 'pothole'];
            const kind  = kinds[randI(0, 3)];
            this.obs.push({ x: 44 + randI(0, Math.floor(W - 88)), y: -24, kind });
          }
          // Move obstacles
          const spd = 100 + this.timer * 3;
          for (const o of this.obs) o.y += spd * dt;
          this.obs = this.obs.filter(o => o.y < H + 30);
          // Collision
          if (this.invT <= 0) {
            const ty = H - 58;
            for (const o of this.obs) {
              if (Math.abs(o.x - this.toadX) < 20 && Math.abs(o.y - ty) < 22) {
                this.lives--;
                this.invT = 1.6;
                api.shake(6, 0.3); api.flash('#ff4444', 0.18); api.audio.sfx('hurt');
                api.burst(this.toadX, ty, C.red, 12);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Sky strip
          const sk = c.createLinearGradient(0, 0, 0, H * 0.28);
          sk.addColorStop(0, C.skyH); sk.addColorStop(1, C.sky);
          c.fillStyle = sk; c.fillRect(0, 0, W, H * 0.28);
          // Grass verges
          c.fillStyle = C.meadow;
          c.fillRect(0,      H * 0.28, 36, H);
          c.fillRect(W - 36, H * 0.28, 36, H);
          // Hedges on verges
          c.fillStyle = C.hedge;
          for (let i = 0; i < 6; i++) {
            c.beginPath(); c.arc(6 + (i * 41) % 30,  H * 0.28 + 8 + i * 40, 10, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.arc(W - 8 - (i * 37) % 24, H * 0.28 + 8 + i * 40, 9, 0, Math.PI * 2); c.fill();
          }
          // Road surface
          c.fillStyle = C.road; c.fillRect(36, H * 0.28, W - 72, H);
          // Road edge lines
          g.rect(36,      H * 0.28, 3, H, '#e8d890');
          g.rect(W - 39,  H * 0.28, 3, H, '#e8d890');
          // Centre dashes scrolling down
          for (let dy = -60 + this.roadY; dy < H; dy += 60) {
            g.rect(W / 2 - 2, H * 0.28 + dy, 4, 32, C.cream);
          }
          // Obstacles
          for (const o of this.obs) {
            if (o.kind === 'cart') {
              g.rect(o.x - 14, o.y - 12, 28, 22, C.brown);
              g.circle(o.x - 9,  o.y + 12, 7, '#2a1808');
              g.circle(o.x + 9,  o.y + 12, 7, '#2a1808');
              g.rect(o.x - 14, o.y - 16, 28, 6, C.brownL);
              // Horse head
              g.rect(o.x - 6, o.y - 32, 12, 14, '#c8b090');
              g.circle(o.x, o.y - 36, 6, '#c8b090');
            } else if (o.kind === 'goose') {
              g.circle(o.x, o.y - 10, 7, C.cream);
              g.rect(o.x - 5, o.y - 4, 10, 14, C.cream);
              g.rect(o.x - 4, o.y + 8, 4, 7, C.gold);
              g.rect(o.x + 1, o.y + 8, 4, 7, C.gold);
              g.circle(o.x + 3, o.y - 12, 2, '#080404');
              // Wing flap
              g.rect(o.x - 12, o.y - 3, 8, 4, C.cream);
              g.rect(o.x + 5,  o.y - 3, 8, 4, C.cream);
            } else {
              // pothole
              g.circle(o.x,     o.y,     10, '#4a3a18');
              g.circle(o.x - 3, o.y - 2, 4,  '#342a10');
            }
          }
          // Toad's car
          const tx = this.toadX, ty = H - 58;
          if (this.invT <= 0 || Math.floor(this.invT * 9) % 2 === 0) {
            g.rect(tx - 16, ty - 14, 32, 20, C.toad);
            g.rect(tx - 12, ty - 22, 24, 10, C.toadD);
            g.rect(tx - 8,  ty - 20, 16,  8, '#a8d4f0');
            g.circle(tx - 10, ty + 4, 5, '#1a1008');
            g.circle(tx + 10, ty + 4, 5, '#1a1008');
            g.circle(tx - 8,  ty - 6, 3, C.gold);
            g.circle(tx + 8,  ty - 6, 3, C.gold);
            // Toad driving
            g.circle(tx, ty - 16, 4, C.toad);
            g.rect(tx - 2, ty - 20, 2, 2, '#080402');
            g.rect(tx + 1, ty - 20, 2, 2, '#080402');
          }
          // HUD
          api.topBar('TIME: ' + Math.max(0, Math.ceil(this.dur - this.timer)) + 's');
          for (let i = 0; i < 3; i++) g.circle(W - 38 + i * 13, 20, 4, i < this.lives ? C.red : '#2a0808');
          api.vignette();
        },
      },

      /* ==============================================================
       * 2. DISGUISED! — bluff past patrolling guards as the washerwoman
       * A social-stealth suspicion game: hold your nerve when a guard's
       * gaze sweeps toward you, and curtsy on cue to bluff your way past.
       * ============================================================== */
      {
        id: 'disguise',
        name: 'DISGUISED!',
        sub: 'THE WASHERWOMAN',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 12, 7, C.cream);
          g.rect(x - 10, y - 6, 20, 18, '#8098b0');
          g.rect(x - 12, y - 8, 24, 4, C.parch);
          g.circle(x - 4, y - 13, 1.6, '#302818');
          g.circle(x + 4, y - 13, 1.6, '#302818');
        },
        intro: [
          'THE GAOLER\'S DAUGHTER',
          'SMUGGLED IN A GOWN,',
          'A SHAWL, A BONNET.',
          '"You\'re a very clever',
          'animal," she said,',
          'buttoning him in.',
        ],
        quote: '"A fat, elderly washerwoman, in a mob-cap, dowdy print gown, and shawl." — Kenneth Grahame',
        help: 'HOLD STILL — TAP to curtsy when a guard\'s eye turns your way!',
        winText: '"Nice-looking washerwoman, that," the guards agreed, tipping their hats as Toad sailed past.',
        loseText: '"Here — you\'re no washerwoman!" a guard bellowed, yanking off the bonnet.',
        init(api) {
          this.zones   = [46, 112, 178, 224].map(x => clamp(x, 34, api.W - 34));
          this.zone    = 1;                 // which zone Toad currently stands in
          this.guards  = [
            { x: 30, dir: 1, spd: 0.55, phase: 0 },
            { x: 240, dir: -1, spd: 0.4, phase: 2.1 },
          ];
          this.timer     = 0;
          this.dur       = 24;
          this.suspicion = 0;
          this.maxSusp   = 100;
          this.lookT     = 1.6;             // countdown to next "look" check
          this.telegraph = 0;               // 0..1 warm-up before a look lands
          this.looking   = false;
          this.lookZone  = -1;
          this.lookHold  = 0;
          this.resolved  = false;           // did we react to the current look?
          this.flashGood = 0;
          this.flashBad  = 0;
        },
        update(api, dt) {
          const W = api.W;
          this.timer += dt;
          if (this.flashGood > 0) this.flashGood -= dt;
          if (this.flashBad  > 0) this.flashBad  -= dt;
          if (this.timer >= this.dur) { api.score += 140; api.win(); return; }
          // Move Toad-washerwoman between the 4 waiting zones — step with
          // arrow keys, or tap a zone directly on touch.
          if (api.keyPressed('left'))  this.zone = clamp(this.zone - 1, 0, this.zones.length - 1);
          if (api.keyPressed('right')) this.zone = clamp(this.zone + 1, 0, this.zones.length - 1);
          if (api.pointer.justDown) {
            const px = api.pointer.x;
            let best = 0, bd = Infinity;
            for (let i = 0; i < this.zones.length; i++) {
              const d = Math.abs(this.zones[i] - px);
              if (d < bd) { bd = d; best = i; }
            }
            this.zone = best;
          }
          // Guards patrol back and forth
          for (const g of this.guards) {
            g.x += g.dir * g.spd * 60 * dt;
            if (g.x < 26) { g.x = 26; g.dir = 1; }
            if (g.x > W - 26) { g.x = W - 26; g.dir = -1; }
          }
          // Look cycle: telegraph → look (must react) → clear
          if (!this.looking) {
            this.lookT -= dt;
            if (this.lookT <= 0) {
              this.looking   = true;
              this.telegraph = 0.85;
              this.lookHold  = 0.5;
              this.resolved  = false;
              this.lookZone  = randI(0, this.zones.length - 1);
            }
          } else if (this.telegraph > 0) {
            this.telegraph -= dt;
          } else {
            // The look has landed — this frame onward is the danger window
            if (!this.resolved && this.zone === this.lookZone) {
              if (api.confirm()) {
                this.resolved = true;
                this.flashGood = 0.3;
                api.score += 20; api.audio.sfx('power');
                api.burst(this.zones[this.zone], api.H - 96, C.gold, 10);
              }
            }
            this.lookHold -= dt;
            if (this.lookHold <= 0) {
              if (this.zone === this.lookZone && !this.resolved) {
                this.suspicion += 30;
                this.flashBad = 0.3;
                api.shake(5, 0.22); api.flash('#c83020', 0.16); api.audio.sfx('hurt');
                if (this.suspicion >= this.maxSusp) { api.lose(); return; }
              }
              this.looking = false;
              this.lookT   = Math.max(0.9, 1.9 - this.timer * 0.035);
            }
          }
          // Suspicion slowly cools when not being watched
          if (!this.looking) this.suspicion = Math.max(0, this.suspicion - 8 * dt);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dusk courtyard
          const sk = c.createLinearGradient(0, 0, 0, H * 0.5);
          sk.addColorStop(0, '#3a4868'); sk.addColorStop(1, '#7488a8');
          c.fillStyle = sk; c.fillRect(0, 0, W, H * 0.5);
          // Cobbled ground
          c.fillStyle = '#5a5a58'; c.fillRect(0, H * 0.5, W, H * 0.5);
          for (let row = 0; row < 6; row++) for (let col = 0; col < 8; col++) {
            c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1;
            c.strokeRect(col * 34 + (row % 2) * 17, H * 0.5 + row * 24, 34, 24);
          }
          // Gatehouse wall behind
          g.rect(0, H * 0.32, W, H * 0.2, '#8a7860');
          for (let i = 0; i < 7; i++) g.rect(i * 40, H * 0.32, 22, H * 0.2, i % 2 ? '#7a6a54' : '#8a7860');
          // Guards patrolling the wall walk
          for (const gd of this.guards) {
            const gy = H * 0.32 + 12;
            g.rect(gd.x - 8, gy, 16, 20, '#2a3a54');
            g.circle(gd.x, gy - 6, 6, '#e0c0a0');
            g.rect(gd.x - 10, gy - 12, 20, 5, '#1a2438');
            // Eye — flashes gold while a "look" is telegraphing/landing at this zone
            const watchingHere = this.looking && this.zones[this.lookZone] != null &&
              Math.abs(gd.x - this.zones[this.lookZone]) < 60;
            const eyeCol = watchingHere ? (this.telegraph > 0 ? '#f0c840' : '#ff5030') : '#402818';
            g.circle(gd.x + (gd.dir > 0 ? 3 : -3), gy - 6, 2, eyeCol);
          }
          // Waiting zones (crates Toad shuffles between)
          for (let i = 0; i < this.zones.length; i++) {
            const zx = this.zones[i], zy = H - 70;
            const isLook = this.looking && i === this.lookZone;
            const danger = isLook && this.telegraph <= 0 && !this.resolved;
            g.rect(zx - 16, zy + 18, 32, 10, '#6a5230');
            if (isLook) {
              c.globalAlpha = this.telegraph > 0 ? 0.35 : 0.6;
              c.fillStyle = danger ? '#ff4030' : '#f0c840';
              c.beginPath(); c.ellipse(zx, zy + 6, 26, 34, 0, 0, Math.PI * 2); c.fill();
              c.globalAlpha = 1;
            }
          }
          // Toad, disguised
          const tz = this.zones[this.zone], ty = H - 70;
          const curtsy = this.looking && this.telegraph <= 0 && this.resolved;
          g.rect(tz - 13, ty - (curtsy ? 20 : 26), 26, curtsy ? 24 : 30, '#8098b0'); // gown
          g.rect(tz - 15, ty - (curtsy ? 22 : 28), 30, 5, C.parch); // apron trim
          g.circle(tz, ty - (curtsy ? 30 : 36), 8, C.cream); // bonnet
          g.rect(tz - 9, ty - (curtsy ? 33 : 39), 18, 5, '#404850');
          g.circle(tz - 3, ty - (curtsy ? 30 : 36), 1.4, '#201810');
          g.circle(tz + 3, ty - (curtsy ? 30 : 36), 1.4, '#201810');
          if (this.flashGood > 0) api.txtC('CURTSY!', tz, ty - 50, 8, C.gold, true);
          if (this.flashBad  > 0) api.txtC('CAUGHT LOOKING!', tz, ty - 50, 7, C.red, true);
          // Suspicion meter
          api.topBar('SUSPICION');
          const mw = W - 60, mx = 30, my = 30;
          g.rect(mx, my, mw, 10, '#201410');
          const pw = mw * (this.suspicion / this.maxSusp);
          g.rect(mx, my, pw, 10, pw > mw * 0.7 ? C.red : C.gold);
          g.rectO(mx, my, mw, 10, '#0c0806', 1);
          api.txtC(Math.max(0, Math.ceil(this.dur - this.timer)) + 's TO GO', W / 2, H - 14, 7, C.parch, true);
          api.vignette();
        },
      },

      /* ==============================================================
       * 3. LOCKED IN! — pick 5 padlock pins, 3 misses lose
       * ============================================================== */
      {
        id: 'prison',
        name: 'LOCKED IN!',
        sub: 'PICK THE LOCK',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 6, 7, C.grey);
          g.circle(x, y - 6, 4, '#0a0808');
          g.rect(x - 6, y,  12, 10, C.grey);
          g.rect(x - 4, y + 2, 8,  6, '#1a1614');
          g.rect(x - 1, y + 2, 2, 7, '#c8c0a8');
        },
        intro: [
          'TOAD IS CAUGHT!',
          '"TWENTY YEARS\' GAOL"',
          'ruled the judge.',
          'But the gaoler\'s',
          'daughter took pity —',
          'here is a hairpin...',
        ],
        quote: '"He was dressed in convict\'s clothes, handcuffed, helpless." — Kenneth Grahame',
        help: 'TAP when the needle enters the GREEN zone!',
        winText: 'Click! The bolt shot back. Toad dressed as a washerwoman and strolled out.',
        loseText: 'The warden found the bent hairpin. Back to the dungeon.',
        init(api) {
          this.pins   = 0;
          this.need   = 5;
          this.misses = 0;
          this.maxMiss= 3;
          this.needle = 0;
          this.nDir   = 1;
          this.nSpd   = 0.75; // starts slow, speeds up each pin
          this.pause  = 0;
          this.result = null; // 'hit' | 'miss'
        },
        update(api, dt) {
          if (this.pause > 0) { this.pause -= dt; return; }
          const f = dt * 60;
          this.needle += this.nDir * this.nSpd * 0.033 * f;
          if (this.needle > 1) { this.needle = 1; this.nDir = -1; }
          if (this.needle < 0) { this.needle = 0; this.nDir = 1; }
          if (api.confirm()) {
            const zone = Math.max(0.06, 0.14 - this.pins * 0.016);
            const off  = Math.abs(this.needle - 0.5);
            if (off < zone) {
              this.pins++;
              this.result = 'hit';
              api.audio.sfx('power'); api.shake(3, 0.14);
              api.burst(api.W / 2, api.H / 2 + 20, C.gold, 14);
              this.nSpd = Math.min(2.4, this.nSpd + 0.22);
              this.pause = 0.4;
              if (this.pins >= this.need) { api.score += 160; api.win(); }
            } else {
              this.misses++;
              this.result = 'miss';
              api.audio.sfx('hurt'); api.shake(5, 0.22);
              this.pause = 0.4;
              if (this.misses >= this.maxMiss) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Stone dungeon
          c.fillStyle = '#120e0a'; c.fillRect(0, 0, W, H);
          // Stone-block grid
          for (let row = 0; row < 13; row++) {
            for (let col = 0; col < 7; col++) {
              const bx = col * 40 + (row % 2) * 20, by = row * 40;
              c.fillStyle = row % 3 === 0 ? '#181210' : '#120e0a';
              c.fillRect(bx, by, 39, 39);
              c.strokeStyle = '#2a2018'; c.lineWidth = 1; c.strokeRect(bx, by, 39, 39);
            }
          }
          // Barred window
          g.rect(W / 2 - 24, 18, 48, 62, '#080604');
          for (let b = 0; b < 6; b++) g.rect(W / 2 - 22 + b * 9, 20, 3, 58, '#4a3a28');
          g.rect(W / 2 - 22, 38, 44, 3, '#4a3a28');
          g.rect(W / 2 - 22, 56, 44, 3, '#4a3a28');
          c.fillStyle = 'rgba(140,180,240,.06)'; c.fillRect(W / 2 - 20, 22, 40, 56);
          // Door
          g.rect(W / 2 - 32, H - 180, 64, 110, '#3a2c18');
          g.rectO(W / 2 - 32, H - 180, 64, 110, '#5a4a28', 2);
          for (let r = 0; r < 3; r++) g.rect(W / 2 - 28, H - 174 + r * 34, 56, 4, '#2a1e0e');
          // Padlock (big)
          const lx = W / 2, ly = H - 132;
          g.circle(lx, ly - 16, 18, '#7a6a50');
          g.circle(lx, ly - 16, 12, '#120e0a');
          g.rect(lx - 16, ly - 9, 32, 24, '#7a6a50');
          g.rect(lx - 12, ly - 6, 24, 18, '#5a4c38');
          g.circle(lx, ly + 2, 5, '#120e0a');
          g.rect(lx - 2, ly + 2, 4, 8, '#120e0a');
          // Pin progress dots
          for (let i = 0; i < this.need; i++) {
            const px = W / 2 - (this.need - 1) * 11 + i * 22;
            const done = i < this.pins;
            g.circle(px, H - 56, 7, done ? C.gold : '#3a2e20');
            if (done) g.circle(px, H - 56, 4, C.goldL);
          }
          api.txtC('PINS', W / 2, H - 68, 8, C.stone, true);
          // Timing meter
          const mw = 190, mh = 24, mx = W / 2 - mw / 2, my = H / 2 + 30;
          g.rect(mx, my, mw, mh, '#201810');
          g.rectO(mx, my, mw, mh, C.stone, 1);
          const zone = Math.max(0.06, 0.14 - this.pins * 0.016);
          const gz = mw * (0.5 - zone), gzw = mw * zone * 2;
          g.rect(mx + gz, my, gzw, mh, '#1a5010');
          c.fillStyle = 'rgba(50,180,30,.25)'; c.fillRect(mx + gz, my, gzw, mh);
          // Needle
          const needleCol = this.pause > 0 ? (this.result === 'hit' ? C.gold : C.red) : C.cream;
          g.rect(mx + this.needle * mw - 2, my - 5, 4, mh + 10, needleCol);
          api.txtC('TAP THE GREEN ZONE', W / 2, my - 18, 7, C.stone, true);
          // Misses top bar
          api.topBar('PINS: ' + this.pins + '/' + this.need);
          for (let i = 0; i < this.maxMiss; i++) {
            g.circle(W - 42 + i * 14, 20, 5, i < this.misses ? C.red : '#2a1810');
          }
          api.vignette();
        },
      },

      /* ==============================================================
       * 4. THE RIVER BANK — row home to the beat: tap each ripple as it
       * reaches the ring. A rhythm chapter, not a dodge/catch chapter.
       * ============================================================== */
      {
        id: 'river',
        name: 'THE RIVER BANK',
        sub: 'ROW FOR HOME',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 2, 16, 10, C.brown);
          g.rect(x - 6, y - 6,  12,  5, C.brown);
          g.rect(x - 8, y,     16,  2, C.gold);
          g.rect(x - 3, y - 9,  6,  4, C.brownL);
        },
        intro: [
          'FREE AT LAST!',
          'RATTY TAKES THE OARS.',
          'PULL IN TIME WITH HIM —',
          'a steady stroke gets',
          'you home to Toad Hall',
          'before the light fades.',
        ],
        quote: '"There is nothing — absolutely nothing — half so much worth doing as simply messing about in boats." — Kenneth Grahame',
        help: 'TAP each ripple the moment it reaches the ring — keep the stroke!',
        winText: '"Steady an oar!" laughed Ratty, as Toad Hall\'s chimneys rose on the bank.',
        loseText: 'The stroke fell apart, the boat spun in the current, and the light faded.',
        init(api) {
          this.hits    = 0;
          this.need    = 16;
          this.misses  = 0;
          this.maxMiss = 4;
          this.beats   = [];
          this.spawnT  = 0;
          this.timer   = 0;
          this.oarT    = 0;      // oar dip animation clock
          this.combo   = 0;
          this.bestCombo = 0;
          this.flashGood = 0;
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer += dt;
          this.oarT   += dt;
          if (this.flashGood > 0) this.flashGood -= dt;
          const ringY = H - 96, fallSpd = 150;
          // Tempo quickens as the row goes on
          this.spawnT -= dt;
          const interval = Math.max(0.62, 1.15 - this.timer * 0.018);
          if (this.spawnT <= 0) { this.spawnT = interval; this.beats.push({ y: -20, hit: false }); }
          for (const b of this.beats) b.y += fallSpd * dt;
          // Tap on the beat
          if (api.confirm()) {
            let best = -1, bd = 22;
            for (let i = 0; i < this.beats.length; i++) {
              const b = this.beats[i];
              if (b.hit) continue;
              const d = Math.abs(b.y - ringY);
              if (d < bd) { bd = d; best = i; }
            }
            if (best >= 0) {
              const b = this.beats[best];
              b.hit = true;
              this.hits++; this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo);
              this.flashGood = 0.22;
              api.score += 25 + Math.min(20, this.combo);
              api.audio.sfx('coin');
              api.burst(W / 2, ringY, C.riverL, 8);
              if (this.hits >= this.need) { api.score += 100; api.win(); return; }
            }
          }
          // Missed beats — passed the ring unhit
          for (let i = this.beats.length - 1; i >= 0; i--) {
            const b = this.beats[i];
            if (!b.hit && b.y > ringY + 22) {
              this.misses++; this.combo = 0;
              api.audio.sfx('hurt'); api.shake(2, 0.1);
              this.beats.splice(i, 1);
              if (this.misses >= this.maxMiss) { api.lose(); return; }
            } else if (b.hit && b.y > H + 20) {
              this.beats.splice(i, 1);
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
          // River fills screen, scrolling faster with combo (juice)
          const rv = c.createLinearGradient(0, 0, 0, H);
          rv.addColorStop(0, '#1a68b0'); rv.addColorStop(1, '#2878c0');
          c.fillStyle = rv; c.fillRect(0, 0, W, H);
          for (let i = 0; i < 9; i++) {
            const rx = (i * 31 + t * (18 + this.combo * 2)) % W, ry = 18 + (i * 47) % (H - 140);
            c.globalAlpha = 0.10;
            c.strokeStyle = '#90c8f0'; c.lineWidth = 1;
            c.beginPath(); c.ellipse(rx, ry, 18, 6, 0, 0, Math.PI * 2); c.stroke();
          }
          c.globalAlpha = 1;
          // Distant bank sliding by
          c.fillStyle = C.meadow; c.fillRect(0, 40, W, 14);
          c.fillStyle = C.meadowD; c.fillRect(0, 40, W, 4);
          // Falling ripple beats
          const ringY = H - 96;
          for (const b of this.beats) {
            if (b.hit) continue;
            c.strokeStyle = C.gold; c.lineWidth = 2; c.globalAlpha = 0.9;
            c.beginPath(); c.ellipse(W / 2, b.y, 16, 8, 0, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }
          // The hit ring
          c.strokeStyle = this.flashGood > 0 ? C.gold : '#dff0ff'; c.lineWidth = 3;
          c.beginPath(); c.ellipse(W / 2, ringY, 24, 11, 0, 0, Math.PI * 2); c.stroke();
          if (this.flashGood > 0) {
            c.globalAlpha = this.flashGood / 0.22;
            c.beginPath(); c.ellipse(W / 2, ringY, 34, 15, 0, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }
          // Boat, fixed centre, bobbing with the stroke
          const bob = Math.sin(this.oarT * 5) * 2;
          const bx = W / 2, by = H - 60 + bob;
          g.rect(bx - 28, by - 4, 56, 18, C.brown);
          g.rect(bx - 24, by - 10, 48,  8, C.brownL);
          // Ratty rowing — oar dips on each beat
          const oarDip = (Math.sin(this.oarT * 5) + 1) / 2;
          g.circle(bx + 20, by - 14, 6, '#2a4a18');
          g.rect(bx + 14, by - 10, 12, 12, '#2a4a18');
          g.rect(bx + 20, by + 2 + oarDip * 10, 2, 22, C.brown);
          g.circle(bx + 20, by + 2 + oarDip * 32, 3, '#3a5a2a');
          // Mole in bow
          g.circle(bx - 12, by - 16, 7, '#3a2a1e');
          g.rect(bx - 18, by - 10, 12, 10, '#3a2a1e');
          g.circle(bx - 10, by - 18, 2, '#060402');
          g.circle(bx - 14, by - 18, 2, '#060402');
          // HUD
          api.topBar('STROKES: ' + this.hits + '/' + this.need);
          for (let i = 0; i < this.maxMiss; i++) {
            g.circle(W - 42 + i * 14, 20, 5, i < this.misses ? C.red : '#2a0808');
          }
          if (this.combo >= 3) api.txtC(this.combo + ' STROKE COMBO', W / 2, 46, 7, C.gold, true);
          api.vignette();
        },
      },

      /* ==============================================================
       * 5. RETAKE TOAD HALL — tap 10 weasels before 3 escape
       * ============================================================== */
      {
        id: 'toadhall',
        name: 'RETAKE TOAD HALL',
        sub: 'BIFF THE WEASELS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 10, y + 2, 20, 10, C.toad);
          g.rect(x - 8,  y - 6, 16,  9, C.toadD);
          g.rect(x - 5, y - 10, 4,   6, C.toad);
          g.rect(x + 1, y - 10, 4,   6, C.toad);
          g.circle(x + 9, y - 12, 5, C.weasel);
          g.circle(x + 10, y - 14, 2, '#080402');
        },
        intro: [
          'THE WEASELS HAVE',
          'SEIZED TOAD HALL!',
          '"CHARGE!" cried Toad.',
          'Badger\'s band stormed',
          'through the secret',
          'passage. Biff them!',
        ],
        quote: '"The hour has come!" said Badger. He led the charge on Toad Hall.',
        help: 'TAP weasels before they slip out of the windows!',
        winText: 'Toad Hall rang with cries of the fleeing weasels. Toad stood on the steps in triumph!',
        loseText: 'The weasels held the hall. Toad slunk off to the Wild Wood, dejected.',
        init(api) {
          this.weas     = [];
          this.bopped   = 0;
          this.need     = 10;
          this.escaped  = 0;
          this.maxEsc   = 3;
          this.spawnT   = 0;
          this.timer    = 0;
          // 6 window slots: 3 cols × 2 rows inside Toad Hall
          this.slots = [
            { x: 58,  y: 196 },
            { x: 135, y: 196 },
            { x: 212, y: 196 },
            { x: 58,  y: 286 },
            { x: 135, y: 286 },
            { x: 212, y: 286 },
          ];
          this.occ = new Array(6).fill(false);
        },
        update(api, dt) {
          this.timer += dt;
          // Spawn weasels
          this.spawnT -= dt;
          const interval = Math.max(0.7, 1.8 - this.timer * 0.05);
          if (this.spawnT <= 0 && this.weas.length < 4) {
            this.spawnT = interval;
            const free = this.occ.map((o, i) => o ? -1 : i).filter(i => i >= 0);
            if (free.length > 0) {
              const slot = free[randI(0, free.length - 1)];
              this.occ[slot] = true;
              const life = 2.2 + Math.random() * 0.8;
              this.weas.push({ slot, life, maxLife: life, t: 0, tapped: false, exitT: 0 });
            }
          }
          // Update weasels
          for (let i = this.weas.length - 1; i >= 0; i--) {
            const w = this.weas[i];
            w.t += dt;
            if (w.tapped) {
              w.exitT += dt;
              if (w.exitT > 0.35) { this.occ[w.slot] = false; this.weas.splice(i, 1); }
              continue;
            }
            w.life -= dt;
            if (w.life <= 0) {
              this.escaped++;
              this.occ[w.slot] = false;
              this.weas.splice(i, 1);
              api.audio.sfx('hurt'); api.shake(3, 0.14);
              if (this.escaped >= this.maxEsc) { api.lose(); return; }
            }
          }
          // Tap to bop
          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (const w of this.weas) {
              if (w.tapped) continue;
              const s = this.slots[w.slot];
              if (Math.abs(px - s.x) < 26 && Math.abs(py - s.y) < 26) {
                w.tapped = true;
                this.bopped++;
                api.score += 40;
                api.audio.sfx('coin');
                api.burst(s.x, s.y - 10, C.gold, 10);
                if (this.bopped >= this.need) { api.score += 100; api.win(); return; }
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Afternoon sky
          const sk = c.createLinearGradient(0, 0, 0, H * 0.38);
          sk.addColorStop(0, '#4a78b0'); sk.addColorStop(1, C.sky);
          c.fillStyle = sk; c.fillRect(0, 0, W, H * 0.38);
          // Lawn
          c.fillStyle = C.meadow; c.fillRect(0, H - 38, W, 38);
          c.fillStyle = C.meadowD; c.fillRect(0, H - 38, W, 6);
          // Toad Hall building
          g.rect(18, 112, W - 36, H - 148, '#c8b48a');
          g.rectO(18, 112, W - 36, H - 148, '#9a7a50', 2);
          // Roof (gable)
          c.fillStyle = '#6a5a3a';
          c.beginPath(); c.moveTo(10, 112); c.lineTo(W / 2, 54); c.lineTo(W - 10, 112); c.closePath(); c.fill();
          g.rectO(10, 112, W - 20, 2, '#4a3a22', 2);
          // Chimneys
          g.rect(62, 55, 12, 34, '#8a7060');
          g.rect(59, 53, 18, 5,  '#6a5a48');
          g.rect(W - 74, 55, 12, 34, '#8a7060');
          g.rect(W - 77, 53, 18, 5,  '#6a5a48');
          // Front door
          g.rect(W / 2 - 16, H - 96, 32, 46, '#4a3820');
          c.beginPath(); c.arc(W / 2, H - 96, 16, Math.PI, 0); c.fillStyle = '#4a3820'; c.fill();
          g.circle(W / 2 + 8, H - 74, 3, C.gold);
          // Windows (6 slots)
          for (const s of this.slots) {
            g.rect(s.x - 24, s.y - 26, 48, 50, '#3a2c18');
            g.rectO(s.x - 24, s.y - 26, 48, 50, '#7a6040', 1);
            g.rect(s.x - 20, s.y - 22, 40, 42, '#88aace');
            g.rect(s.x - 20, s.y - 4,  40,  2, '#3a2c18');
            g.rect(s.x - 2,  s.y - 22, 2,   42, '#3a2c18');
          }
          // Weasels popping out of windows
          for (const w of this.weas) {
            const s = this.slots[w.slot];
            const pop  = Math.min(1, w.t * 4);        // 0→1 pop-up fraction
            const wy   = s.y + 8 - pop * 22;
            // Life bar above window
            const lr   = w.life / w.maxLife;
            g.rect(s.x - 20, s.y - 32, 40, 4, '#1a1008');
            g.rect(s.x - 20, s.y - 32, Math.round(40 * lr), 4, lr > 0.45 ? C.meadow : C.red);
            if (!w.tapped) {
              c.globalAlpha = pop;
              const wx2 = s.x;
              g.rect(wx2 - 12, wy - 4,  24, 20, C.weasel);
              g.circle(wx2, wy - 14, 10, C.weaselD);
              g.circle(wx2 - 4, wy - 16, 3, C.gold);
              g.circle(wx2 + 4, wy - 16, 3, C.gold);
              g.circle(wx2 - 4, wy - 16, 2, '#e84000');
              g.circle(wx2 + 4, wy - 16, 2, '#e84000');
              g.rect(wx2 - 2, wy - 6, 4, 3, '#c8a000'); // teeth
              g.rect(wx2 + 10, wy - 14, 2, 18, C.brownL); // stick weapon
              c.globalAlpha = 1;
            } else {
              // Flash "BIFF!"
              const fade = Math.max(0, 1 - w.exitT * 3);
              c.globalAlpha = fade;
              api.txtC('BIFF!', s.x, s.y - 24, 10, C.gold, true);
              c.globalAlpha = 1;
            }
          }
          // HUD
          api.topBar('BOPPED: ' + this.bopped + '/' + this.need);
          for (let i = 0; i < this.maxEsc; i++) {
            g.circle(W - 42 + i * 14, 20, 5, i < this.escaped ? C.red : '#2a0808');
          }
          api.vignette();
        },
      },

    ], // chapters
  }); // RetroSaga.create
})();
