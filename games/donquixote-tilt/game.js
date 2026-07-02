/* ============================================================================
 * DON QUIXOTE — TILTING AT WINDMILLS
 * Five chapters through Cervantes' classic (1605):
 *   1. THE WINDMILLS   — timing: thread the lance through rotating arms
 *   2. THE WINESKINS   — whack: stab "enchanted monsters" at the inn cellar
 *   3. THE CHAIN GANG  — dodge: freed galley slaves hurl rocks
 *   4. THE CAVE        — fog-of-war maze: find the exit by torchlight
 *   5. WHITE MOON      — timing duel: beat the Knight of the White Moon
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Castilian palette ─── */
  const C = {
    sky:   '#5898d8',
    skyL:  '#80baf0',
    earth: '#c87820',
    dust:  '#e0b040',
    wheat: '#d4a030',
    parch: '#e8d8a0',
    ink:   '#3a2810',
    red:   '#c85020',
    white: '#f0e8c0',
    shadow:'#2a1408',
    stone: '#8a8070',
    green: '#4ad870',
    dark:  '#0c1420',
    gold:  '#e3c567',
    saddle:'#8b5e3c',
    mill:  '#c8b88a',
    night: '#1a1030',
  };

  /* ─── Emblem: Knight's helm with lance ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Lance shaft
    g.rect(cx - 50, cy - 6, 100, 4, C.saddle);
    // Lance tip
    g.sprite(['.r', 'rr', '.r'], cx + 46, cy - 8, { r: C.red }, 3);
    // Rocinante (horse silhouette)
    g.rect(cx - 22, cy + 6, 32, 12, C.white);
    g.rect(cx - 26, cy - 2, 12, 10, C.white);
    g.rect(cx - 8,  cy + 16, 6, 8,  C.white);
    g.rect(cx + 8,  cy + 16, 6, 8,  C.white);
    // Rider
    g.rect(cx - 5, cy - 20, 10, 26, C.shadow);
    g.circle(cx, cy - 22, 6, C.shadow);
    // Helmet crest + plume
    g.rect(cx - 6, cy - 30, 12, 10, '#9a9080');
    g.rect(cx - 4, cy - 38,  6, 10, C.red);
  }

  /* ─── Scenery: La Mancha plains / parchment map ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      /* Parchment map */
      c.fillStyle = '#e8d8a0'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 260; i++) {
        const mx = (i * 73 + 11) % W, my = (i * 53 + 7) % H;
        c.globalAlpha = 0.04 + (i % 5) * 0.006;
        c.fillStyle = '#8b6010'; c.fillRect(mx, my, 2, 1);
      }
      c.globalAlpha = 1;
      c.strokeStyle = '#8b6010'; c.lineWidth = 4;
      c.strokeRect(8, 8, W - 16, H - 16);
      c.strokeStyle = '#c8a040'; c.lineWidth = 2;
      c.strokeRect(12, 12, W - 24, H - 24);
      /* Faint rolling plains silhouette on map */
      c.globalAlpha = 0.08;
      c.fillStyle = '#6a8820';
      c.beginPath(); c.moveTo(0, H * 0.6);
      for (let x = 0; x <= W; x += 16) c.lineTo(x, H * 0.6 - 8 - ((x * 5) % 14));
      c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      c.globalAlpha = 1;
      return;
    }

    /* Normal scenes: La Mancha sky + plains */
    const skyG = c.createLinearGradient(0, 0, 0, H * 0.55);
    skyG.addColorStop(0, C.skyL); skyG.addColorStop(1, C.sky);
    c.fillStyle = skyG; c.fillRect(0, 0, W, H);

    /* Sun */
    c.globalAlpha = 0.7; g.circle(W - 44, 44, 22, '#ffe86a');
    c.globalAlpha = 0.2; g.circle(W - 44, 44, 32, '#ffee90');
    c.globalAlpha = 1;

    /* Wheat plains */
    const plainY = Math.floor(H * 0.54);
    const plainG = c.createLinearGradient(0, plainY, 0, H);
    plainG.addColorStop(0, '#d4a030'); plainG.addColorStop(0.4, '#c87820'); plainG.addColorStop(1, '#7a4010');
    c.fillStyle = plainG;
    c.beginPath(); c.moveTo(0, plainY);
    for (let x = 0; x <= W; x += 14) c.lineTo(x, plainY - 4 - ((x * 7 + 5) % 10));
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();

    /* Distant windmills */
    const mills = [[34,62],[88,50],[178,56],[228,44]];
    for (const [mx, mh] of mills) {
      const my = plainY - mh;
      c.fillStyle = '#7a6840'; c.fillRect(mx - 3, my, 6, mh);
      g.circle(mx, my, 9, '#9a8a60');
      const a = t * 0.6 + mx * 0.1;
      for (let arm = 0; arm < 4; arm++) {
        const ang = a + arm * Math.PI / 2;
        const x1 = mx + Math.cos(ang) * 20, y1 = my + Math.sin(ang) * 20;
        const x2 = mx - Math.cos(ang) * 20, y2 = my - Math.sin(ang) * 20;
        c.strokeStyle = '#9a8a60'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
      }
    }

    /* Dusty road */
    c.fillStyle = '#c8a060';
    c.beginPath();
    c.moveTo(W * 0.15, H); c.lineTo(W * 0.46, plainY + 4);
    c.lineTo(W * 0.58, plainY + 4); c.lineTo(W, H);
    c.closePath(); c.fill();

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(42,20,8,.68)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Map waypoint rects ─── */
  const MAP = [
    { x: 48, y: 76,  w: 92, h: 52 },  // Ch1 Windmills (top-left)
    { x: 130,y: 148, w: 92, h: 52 },  // Ch2 Inn      (top-right)
    { x: 16, y: 226, w: 92, h: 52 },  // Ch3 Galley   (mid-left)
    { x: 156,y: 298, w: 92, h: 52 },  // Ch4 Cave     (mid-right)
    { x: 80, y: 374, w: 110,h: 52 },  // Ch5 Duel     (bottom-center)
  ];

  RetroSaga.create({
    id: 'donquixote',
    title: 'Don Quixote',
    subtitle: 'TILTING AT WINDMILLS',
    currency: 'GLORY',
    screens: {
      win:          '#d4a030',
      lose:         '#c85020',
      chapterLabel: '#8b6030',
      name:         '#e8d8a0',
      sub:          '#c85020',
      intro:        '#3a2810',
      quote:        '#6a5030',
      help:         '#d4a030',
      score:        '#e8d8a0',
      cur:          '#d4a030',
      cta:          '#e8d8a0',
      overlay:      'rgba(42,20,8,.86)',
    },
    labels: {
      chapter:  'CHAPTER',
      score:    'GLORY WON',
      win:      'A VALIANT DEED!',
      lose:     'ROCINANTE STUMBLES',
      cont:     'TAP TO RIDE ONWARD',
      finale:   'TAP FOR THE FINAL JOUST',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO CHARGE',
    },
    accent: C.dust,
    credit: 'DON QUIXOTE · MIGUEL DE CERVANTES · 1605',
    bootCta:   'TAP TO BEGIN THE QUEST',
    bootLine:  '5 CHAPTERS · ONE GALLANT KNIGHT',
    menuLabel: 'THE ROADS OF LA MANCHA',
    menuHint:  'CHOOSE YOUR ADVENTURE',
    menuDone:  'THE KNIGHT OF LA MANCHA TRIUMPHS',
    emblem,
    scenery,

    menu: {
      title(api, glory) {
        const c = api.ctx, W = api.W, H = api.H;
        /* Journey path between waypoints */
        c.strokeStyle = C.saddle; c.lineWidth = 2; c.setLineDash([3, 5]);
        c.globalAlpha = 0.55;
        c.beginPath();
        MAP.forEach((p, i) => {
          const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
          if (i === 0) c.moveTo(cx, cy); else c.lineTo(cx, cy);
        });
        c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
        /* Compass rose (bottom-right) */
        const crx = W - 26, cry = H - 44;
        c.strokeStyle = C.ink; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(crx, cry - 10); c.lineTo(crx, cry + 10); c.stroke();
        c.beginPath(); c.moveTo(crx - 10, cry); c.lineTo(crx + 10, cry); c.stroke();
        api.txt('N', crx - 3, cry - 18, 7, C.ink);
        /* Title banner */
        c.fillStyle = C.red; c.fillRect(8, 20, W - 16, 38);
        c.strokeStyle = C.gold; c.lineWidth = 2; c.strokeRect(8, 20, W - 16, 38);
        api.txtC('DON QUIXOTE', W / 2, 24, 12, C.white, true);
        api.txtC('GLORY  ' + glory, W / 2, 44, 9, C.gold);
      },
      layout() { return MAP; },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2, cy = y + h / 2;
        /* Parchment scroll banner */
        c.fillStyle = done ? '#c8a050' : (sel ? '#d8c070' : C.parch);
        c.beginPath();
        c.moveTo(x + 6, y); c.lineTo(x + w - 6, y);
        c.quadraticCurveTo(x + w, y, x + w, y + 8);
        c.lineTo(x + w, y + h - 8);
        c.quadraticCurveTo(x + w, y + h, x + w - 6, y + h);
        c.lineTo(x + 6, y + h);
        c.quadraticCurveTo(x, y + h, x, y + h - 8);
        c.lineTo(x, y + 8);
        c.quadraticCurveTo(x, y, x + 6, y);
        c.closePath(); c.fill();
        c.strokeStyle = sel ? C.red : C.saddle; c.lineWidth = sel ? 2 : 1; c.stroke();
        /* Map pin marker */
        c.fillStyle = sel ? C.red : C.saddle;
        c.beginPath(); c.arc(cx, y - 5, 7, 0, Math.PI * 2); c.fill();
        c.fillStyle = sel ? C.white : C.parch;
        c.beginPath(); c.arc(cx, y - 5, 3, 0, Math.PI * 2); c.fill();
        /* Pin tail */
        c.strokeStyle = sel ? C.red : C.saddle; c.lineWidth = 2;
        c.beginPath(); c.moveTo(cx, y - 2); c.lineTo(cx, y + 4); c.stroke();
        /* Chapter icon */
        if (ch.icon) ch.icon(api, cx, cy - 4);
        /* Chapter name */
        api.txtCFit(ch.name, cx, cy + 8, 7, done ? '#8b3010' : C.ink, false, w - 10);
        if (done) api.txtC('★', x + w - 10, y + h - 14, 10, C.gold);
      },
    },

    finale: [
      'THE WINDMILLS STAND STILL.',
      'THE LANCE IS LAID DOWN AT LAST.',
      '',
      'IN EVERY DREAMER\'S HEART',
      'THE QUEST LIVES ON.',
    ],
    tagline: 'A POLECAT TRIBUTE · CERVANTES · 1605',
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ==================================================================
       * CHAPTER 1 — THE WINDMILLS
       * Timing: watch 4 rotating arms, tap when the gap faces your lance
       * ================================================================== */
      {
        id: 'windmills',
        name: 'THE WINDMILLS',
        sub: '"THIRTY OR MORE GIANTS!"',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.rect(x - 1, y - 2, 3, 12, C.saddle);
          g.circle(x, y - 2, 4, C.mill);
          c.strokeStyle = C.mill; c.lineWidth = 2;
          c.beginPath(); c.moveTo(x - 8, y - 9); c.lineTo(x + 8, y + 5); c.stroke();
          c.beginPath(); c.moveTo(x + 8, y - 9); c.lineTo(x - 8, y + 5); c.stroke();
        },
        intro: [
          'UPON THE PLAINS OF LA MANCHA,',
          'DON QUIXOTE SPIES ENEMIES.',
          '"Giants!" he shouts.',
          '"Thirty or more!"',
          'Sancho cries: "Those are',
          'windmills, my lord!"',
        ],
        quote: 'Fortune is guiding our affairs better than we ourselves could have wished.',
        help: 'TAP when the GAP between arms faces the lance (right side)',
        winText: 'The lance finds the gap! The "giant" shudders and falls.',
        loseText: 'An arm catches the lance — horse and rider tumble to earth.',
        init(api) {
          this.charges = 0;
          this.need = 8;
          this.angle = 0;
          this.aspd = 0.70;      // rad/s → gap appears ~every 2.2s at start
          this.miss = 0;
          this.maxMiss = 4;
          this.hitCD = 0;
          this.flashT = 0;
          this.bumpT = 0;
        },
        update(api, dt) {
          this.angle = (this.angle + this.aspd * dt) % (Math.PI * 2);
          this.hitCD  = Math.max(0, this.hitCD - dt);
          this.flashT = Math.max(0, this.flashT - dt);
          this.bumpT  = Math.max(0, this.bumpT - dt);

          if (this.hitCD > 0) return;

          if (api.confirm()) {
            /* Gap is open when no arm is within ARM_HALF radians of angle=0 */
            const ARM_HALF = 0.20;
            let onArm = false;
            for (let a = 0; a < 4; a++) {
              let diff = ((this.angle + a * Math.PI / 2) % (Math.PI * 2));
              if (diff > Math.PI) diff = Math.PI * 2 - diff;
              if (diff < ARM_HALF) { onArm = true; break; }
            }
            if (!onArm) {
              this.charges++;
              this.hitCD = 0.55;
              api.addScore(30);
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H * 0.38, C.dust, 10);
              this.flashT = 0.5;
              this.aspd = Math.min(2.2, this.aspd + 0.11);
              if (this.charges >= this.need) { api.addScore(60); api.win(); }
            } else {
              this.miss++;
              this.bumpT = 0.5;
              this.hitCD = 0.8;
              api.shake(7, 0.3);
              api.audio.sfx('hurt');
              if (this.miss >= this.maxMiss) api.lose();
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          const cx = Math.floor(W / 2), cy = Math.floor(H * 0.36);

          /* Sky + plains */
          const skyG = c.createLinearGradient(0, 0, 0, H * 0.55);
          skyG.addColorStop(0, C.skyL); skyG.addColorStop(1, C.sky);
          c.fillStyle = skyG; c.fillRect(0, 0, W, H);
          c.fillStyle = C.earth; c.fillRect(0, Math.floor(H * 0.55), W, H);
          c.globalAlpha = 0.5; g.circle(W - 36, 36, 18, '#ffe86a'); c.globalAlpha = 1;

          /* Hit flash */
          if (this.flashT > 0) {
            c.globalAlpha = this.flashT * 0.45;
            c.fillStyle = '#ffe86a'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          /* Windmill mast */
          g.rect(cx - 4, cy, 8, 90, '#8a7050');
          g.rect(cx - 3, cy + 2, 2, 86, '#7a6040');
          g.circle(cx, cy, 13, C.stone);
          g.circle(cx, cy, 7, C.mill);

          /* Rotating arms (4, each pair shares a line) */
          const ARM_LEN = 60;
          for (let arm = 0; arm < 4; arm++) {
            const a = this.angle + arm * Math.PI / 2;
            const x1 = cx + Math.cos(a) * ARM_LEN, y1 = cy + Math.sin(a) * ARM_LEN;
            const x2 = cx - Math.cos(a) * (ARM_LEN * 0.28), y2 = cy - Math.sin(a) * (ARM_LEN * 0.28);
            const bumpCol = this.bumpT > 0 ? C.red : C.mill;
            c.strokeStyle = bumpCol; c.lineWidth = 8;
            c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
            c.strokeStyle = '#a09060'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
            g.circle(Math.round(x1), Math.round(y1), 4, '#a09060');
          }
          g.circle(cx, cy, 5, '#c8b070');

          /* Lance target indicator (right side) */
          const tX = cx + ARM_LEN + 14, tY = cy;
          const ARM_HALF = 0.20;
          let gapOpen = true;
          for (let a = 0; a < 4; a++) {
            let diff = ((this.angle + a * Math.PI / 2) % (Math.PI * 2));
            if (diff > Math.PI) diff = Math.PI * 2 - diff;
            if (diff < ARM_HALF) { gapOpen = false; break; }
          }
          g.rect(tX - 3, tY - 22, 6, 44, gapOpen ? 'rgba(74,216,112,.28)' : 'rgba(200,80,32,.22)');
          g.rect(tX - 1, tY - 2, 2, 4, gapOpen ? C.green : C.red);

          /* Knight charging from left */
          const kx = Math.floor(W * 0.12);
          const ky = Math.floor(H * 0.55) - 22;
          const bob = this.bumpT > 0 ? 4 : Math.floor(Math.sin(api.t * 8) * 2);
          g.rect(kx - 14, ky + bob, 28, 12, C.white);
          g.rect(kx - 16, ky - 8 + bob, 12, 10, C.white);
          g.rect(kx - 4,  ky + 10 + bob, 5, 8, C.white);
          g.rect(kx + 8,  ky + 10 + bob, 5, 8, C.white);
          g.rect(kx - 4,  ky - 22 + bob, 10, 22, C.shadow);
          g.circle(kx, ky - 24 + bob, 6, C.shadow);
          g.rect(kx - 5, ky - 32 + bob, 10, 10, '#9a9080');
          /* Lance */
          const lanceCol = this.bumpT > 0 ? C.red : C.saddle;
          c.strokeStyle = lanceCol; c.lineWidth = 3;
          c.beginPath(); c.moveTo(kx + 4, ky - 10 + bob); c.lineTo(tX, tY); c.stroke();
          g.sprite(['.r', 'rr', '.r'], tX - 2, tY - 2, { r: C.red }, 2);

          /* Charge pips */
          for (let i = 0; i < this.need; i++) {
            g.rect(W / 2 - this.need * 5 + i * 10 + 2, H - 20, 8, 6,
              i < this.charges ? C.dust : '#3a2810');
          }

          api.topBar('THE WINDMILLS');
          api.txt('CHARGES ' + this.charges + '/' + this.need, 6, 20, 8, C.dust);
          api.txt('MISS ' + this.miss + '/' + this.maxMiss, W - 90, 20, 8,
            this.miss > 2 ? C.red : C.stone);
          api.vignette();
          api.scanlines();
        },
      },

      /* ==================================================================
       * CHAPTER 2 — THE WINESKINS
       * Whack: stab the "enchanted monsters" at the inn before they tip
       * ================================================================== */
      {
        id: 'wineskins',
        name: 'THE WINESKINS',
        sub: '"ENEMIES FROM THE EAST!"',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 3, 5, C.red);
          g.rect(x - 3, y - 3, 6, 9, C.red);
          g.circle(x, y + 6, 4, C.red);
          g.rect(x - 1, y - 9, 2, 5, C.saddle);
        },
        intro: [
          'THE INN, WHICH QUIXOTE',
          'MISTAKES FOR A CASTLE...',
          'Giant wineskins line',
          'the cellar walls.',
          '"Bewitched enemies!" he cries',
          'and draws his sword.',
        ],
        quote: 'Delay always breeds danger; and to protract a great design is often to ruin it.',
        help: 'TAP the wineskins quickly — avoid the INNKEEPER!',
        winText: 'Wine runs across the floor. The "monsters" are vanquished!',
        loseText: 'The innkeeper wakes — Quixote is dragged off to bed.',
        init(api) {
          this.skins = [];
          this.popped = 0;
          this.need = 12;
          this.miss = 0;
          this.maxMiss = 4;
          this.spawnT = 0;
          this.spawnInt = 1.5;
          this.spawnMin = 0.7;
          this.splats = [];
          this.innTimer = 9;
          this.innActive = null;
          this.elapsed = 0;
        },
        update(api, dt) {
          this.elapsed += dt;
          this.spawnT -= dt;
          this.innTimer -= dt;

          /* Spawn wineskins */
          if (this.spawnT <= 0) {
            this.spawnT = this.spawnInt;
            this.spawnInt = Math.max(this.spawnMin, this.spawnInt - 0.04);
            this.skins.push({
              x: 24 + api.rint(0, api.W - 48),
              y: Math.floor(api.H * 0.32) + api.rint(0, Math.floor(api.H * 0.34)),
              life: 2.4, maxLife: 2.4,
            });
          }

          /* Innkeeper warning */
          if (this.innTimer <= 0 && !this.innActive) {
            this.innActive = {
              x: api.rint(40, api.W - 40),
              y: Math.floor(api.H * 0.5),
              life: 2.5,
            };
          }
          if (this.innActive) {
            this.innActive.life -= dt;
            if (this.innActive.life <= 0) {
              this.innActive = null;
              this.innTimer = this.elapsed + 11 + api.rnd(0, 5);
            }
          }

          /* Tap to stab */
          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            /* Check innkeeper first */
            if (this.innActive) {
              const inn = this.innActive;
              if (Math.abs(px - inn.x) < 20 && Math.abs(py - inn.y) < 24) {
                this.miss++;
                api.shake(5, 0.2);
                api.audio.sfx('hurt');
                this.innActive = null;
                this.innTimer = this.elapsed + 14;
                if (this.miss >= this.maxMiss) { api.lose(); return; }
                return;
              }
            }
            /* Find nearest skin */
            let hit = null, bestD = 30;
            for (const sk of this.skins) {
              const d = Math.hypot(px - sk.x, py - sk.y);
              if (d < bestD) { bestD = d; hit = sk; }
            }
            if (hit) {
              this.skins = this.skins.filter(s => s !== hit);
              this.popped++;
              api.addScore(20);
              api.audio.sfx('coin');
              api.burst(hit.x, hit.y, C.red, 8);
              this.splats.push({ x: hit.x, y: Math.min(hit.y + 14, Math.floor(api.H * 0.88) - 2) });
              if (this.splats.length > 10) this.splats.shift();
              if (this.popped >= this.need) { api.addScore(60); api.win(); }
            }
          }

          /* Age skins */
          for (const sk of this.skins) {
            sk.life -= dt;
            if (sk.life <= 0) {
              this.miss++;
              api.audio.sfx('blip');
              if (this.miss >= this.maxMiss) { api.lose(); return; }
            }
          }
          this.skins = this.skins.filter(sk => sk.life > 0);
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          /* Inn interior: stone blocks */
          c.fillStyle = '#1a1208'; c.fillRect(0, 0, W, H);
          for (let y = 0; y < H; y += 16) {
            for (let x = 0; x < W; x += 22) {
              const ox = (Math.floor(y / 16) % 2) ? 11 : 0;
              c.fillStyle = ((Math.floor(y / 16) + Math.floor((x + ox) / 22)) % 2) ? '#2a2010' : '#221a0a';
              c.fillRect(x + ox, y, 20, 14);
              c.strokeStyle = '#160e04'; c.lineWidth = 0.5; c.strokeRect(x + ox, y, 20, 14);
            }
          }
          /* Floor */
          g.rect(0, Math.floor(H * 0.88), W, Math.ceil(H * 0.12), '#3a2810');
          for (let x = 0; x < W; x += 18) g.rect(x, Math.floor(H * 0.88), 17, 1, '#4a3818');

          /* Candlelight */
          for (const cx2 of [22, W - 22]) {
            c.globalAlpha = 0.35 + 0.1 * Math.sin(api.t * 7 + cx2);
            c.fillStyle = '#e87820';
            c.beginPath(); c.arc(cx2, 18, 12, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            g.rect(cx2 - 1, 14, 2, 8, '#c8a060');
            g.circle(cx2, 13, 3, '#ffc040');
          }

          /* Wine splats */
          c.globalAlpha = 0.65;
          for (const sp of this.splats) {
            c.fillStyle = '#7a1008';
            c.beginPath(); c.ellipse(sp.x, sp.y, 9, 5, 0, 0, Math.PI * 2); c.fill();
          }
          c.globalAlpha = 1;

          /* Wineskins */
          for (const sk of this.skins) {
            const urgent = sk.life < sk.maxLife * 0.38;
            const col = urgent ? '#e84020' : C.red;
            const pct = sk.life / sk.maxLife;
            /* Life bar */
            g.rect(sk.x - 12, sk.y - 22, 24, 4, '#1a0808');
            g.rect(sk.x - 12, sk.y - 22, Math.round(24 * pct), 4, urgent ? '#ff4020' : '#c83020');
            /* Body */
            g.circle(sk.x, sk.y - 7, 7, col);
            g.rect(sk.x - 5, sk.y - 7, 10, 11, col);
            g.circle(sk.x, sk.y + 4, 5, col);
            g.rect(sk.x - 1, sk.y - 15, 2, 6, C.saddle);
            /* Highlight */
            g.circle(sk.x - 2, sk.y - 9, 2, 'rgba(255,200,180,.4)');
          }

          /* Innkeeper warning */
          if (this.innActive) {
            const inn = this.innActive;
            const pulse = Math.sin(api.t * 10) > 0;
            c.globalAlpha = 0.22 + (pulse ? 0.1 : 0);
            c.fillStyle = '#e8a820'; c.fillRect(inn.x - 26, inn.y - 34, 52, 60);
            c.globalAlpha = 1;
            g.rect(inn.x - 8, inn.y - 20, 16, 22, '#a07828');
            g.circle(inn.x, inn.y - 26, 9, '#c89858');
            api.txtC('⚠', inn.x, inn.y - 44, 12, '#e8a820');
            api.txtCFit('INNKEEPER', inn.x, inn.y + 4, 7, '#e8a820', true, 58);
          }

          /* Progress + HUD */
          api.topBar('THE WINESKINS');
          api.txt('STABBED ' + this.popped + '/' + this.need, 6, 20, 8, C.dust);
          api.txt('MISS ' + this.miss + '/' + this.maxMiss, W - 90, 20, 8,
            this.miss > 2 ? C.red : C.stone);
          api.vignette();
          api.scanlines();
        },
      },

      /* ==================================================================
       * CHAPTER 3 — THE CHAIN GANG
       * Dodge: freed galley slaves hurl rocks — survive 24 seconds
       * ================================================================== */
      {
        id: 'galley',
        name: 'THE CHAIN GANG',
        sub: 'NO GOOD DEED...',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.strokeStyle = C.stone; c.lineWidth = 2;
          c.beginPath(); c.arc(x - 5, y, 4, 0, Math.PI * 2); c.stroke();
          c.beginPath(); c.arc(x + 5, y, 4, 0, Math.PI * 2); c.stroke();
          g.rect(x - 5, y - 2, 10, 4, C.stone);
        },
        intro: [
          'QUIXOTE BREAKS THE CHAINS',
          'OF A GANG OF CONVICTS.',
          'He asks them to carry',
          'his greetings to Dulcinea.',
          'They thank him by throwing',
          'stones. Naturally.',
        ],
        quote: 'I know who I am and who I may be, if I choose.',
        help: 'DODGE the rocks! DRAG or ARROWS to move Quixote',
        winText: 'Quixote endures the rain of stones. A true knight perseveres.',
        loseText: 'Too many blows — even a knight of La Mancha has limits.',
        init(api) {
          this.qx = api.W / 2;
          this.qy = Math.floor(api.H * 0.7);
          this.rocks = [];
          this.hits = 0;
          this.maxHits = 3;
          this.timer = 24;
          this.spawnT = 0.7;
          this.iframes = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer = Math.max(0, this.timer - dt);
          this.spawnT -= dt;
          this.iframes = Math.max(0, this.iframes - dt);

          /* Move Quixote */
          if (api.pointer.down) {
            this.qx += (api.pointer.x - this.qx) * 0.20 * f;
          }
          if (api.keyDown('left'))  this.qx -= 3.6 * f;
          if (api.keyDown('right')) this.qx += 3.6 * f;
          this.qx = clamp(this.qx, 16, api.W - 16);

          /* Spawn rocks aimed loosely at Quixote */
          if (this.spawnT <= 0) {
            const intv = Math.max(0.30, 0.70 - (24 - this.timer) * 0.018);
            this.spawnT = intv;
            const sx = 20 + api.rnd(0, api.W - 40);
            const sy = Math.floor(api.H * 0.20);
            const tx = this.qx + api.rnd(-60, 60);
            const dist = Math.hypot(tx - sx, api.H * 0.7 - sy);
            const spd = api.rnd(2.0, 3.2);
            this.rocks.push({ x: sx, y: sy, vx: (tx - sx) / dist * spd, vy: (api.H * 0.7 - sy) / dist * spd });
          }

          /* Move rocks */
          for (const r of this.rocks) {
            r.x += r.vx * f;
            r.y += r.vy * f;
          }
          this.rocks = this.rocks.filter(r => r.y < api.H + 20 && r.x > -20 && r.x < api.W + 20);

          /* Collision */
          if (this.iframes === 0) {
            for (const r of this.rocks) {
              if (Math.abs(r.x - this.qx) < 14 && Math.abs(r.y - this.qy) < 18) {
                this.hits++;
                this.iframes = 1.2;
                api.shake(6, 0.28);
                api.audio.sfx('hurt');
                r.y = api.H + 40;
                if (this.hits >= this.maxHits) { api.lose(); return; }
                break;
              }
            }
          }

          api.addScore(Math.floor(dt * 8));
          if (this.timer <= 0) { api.addScore(60); api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          /* Sky + dusty road */
          const skyG = c.createLinearGradient(0, 0, 0, H * 0.5);
          skyG.addColorStop(0, C.skyL); skyG.addColorStop(1, C.sky);
          c.fillStyle = skyG; c.fillRect(0, 0, W, H);
          c.fillStyle = C.earth; c.fillRect(0, Math.floor(H * 0.5), W, Math.ceil(H * 0.5));
          c.fillStyle = C.dust; c.fillRect(0, Math.floor(H * 0.5), W, 2);
          c.globalAlpha = 0.5; g.circle(W - 36, 36, 18, '#ffe86a'); c.globalAlpha = 1;

          /* Slaves in background */
          const slaveY = Math.floor(H * 0.28);
          for (let i = 0; i < 6; i++) {
            const sx = 14 + i * 42;
            g.rect(sx - 5, slaveY - 18, 10, 18, '#5a4830');
            g.circle(sx, slaveY - 22, 6, '#c8985a');
            /* Throwing animation */
            const phase = (api.t * 1.8 + i * 0.9) % 3;
            if (phase < 1.5) {
              g.rect(sx + 3, slaveY - 14, 10, 4, '#5a4830');
            } else {
              g.rect(sx + 2, slaveY - 8, 6, 12, '#5a4830');
            }
            /* Broken chain */
            c.strokeStyle = '#7a7060'; c.lineWidth = 1.5;
            c.beginPath(); c.arc(sx - 3, slaveY + 4, 4, 0, Math.PI * 2); c.stroke();
          }

          /* Rocks */
          for (const r of this.rocks) {
            g.circle(Math.round(r.x), Math.round(r.y), 5, C.stone);
            g.rect(Math.round(r.x) + 1, Math.round(r.y) - 2, 2, 2, '#c8c0a8');
          }

          /* Quixote + Rocinante (blink when invincible) */
          const vis = this.iframes === 0 || Math.floor(api.t * 12) % 2 === 0;
          if (vis) {
            const qx = Math.round(this.qx), qy = Math.round(this.qy);
            const bob = Math.floor(Math.sin(api.t * 8) * 1.5);
            g.rect(qx - 15, qy + bob, 28, 12, C.white);
            g.rect(qx - 17, qy - 8 + bob, 12, 10, C.white);
            g.rect(qx - 4,  qy + 10 + bob, 5, 8, C.white);
            g.rect(qx + 8,  qy + 10 + bob, 5, 8, C.white);
            g.rect(qx - 4,  qy - 22 + bob, 10, 22, C.shadow);
            g.circle(qx, qy - 24 + bob, 6, C.shadow);
            g.rect(qx - 5, qy - 32 + bob, 10, 10, '#9a9080');
            /* Lance */
            g.rect(qx - 34, qy - 14 + bob, 38, 3, C.saddle);
            g.sprite(['.r', 'rr', '.r'], qx - 38, qy - 16 + bob, { r: C.red }, 2);
          }

          /* Hearts */
          for (let i = 0; i < this.maxHits; i++) {
            api.txt('♥', 6 + i * 16, 20, 11, i < (this.maxHits - this.hits) ? C.red : '#3a2010');
          }

          /* Timer bar */
          const bW = 140, bX = W / 2 - bW / 2;
          g.rect(bX, H - 18, bW, 8, '#1a1008');
          g.rect(bX, H - 18, Math.round(bW * this.timer / 24), 8, C.dust);
          api.txtC('TIME', W / 2, H - 28, 7, C.stone);
          api.topBar('THE CHAIN GANG');
          api.vignette();
          api.scanlines();
        },
      },

      /* ==================================================================
       * CHAPTER 4 — THE CAVE OF MONTESINOS
       * Fog-of-war maze: navigate by torchlight, find the exit
       * ================================================================== */
      {
        id: 'cave',
        name: 'THE CAVE',
        sub: 'MONTESINOS\' REALM',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 1, y - 8, 3, 10, C.saddle);
          g.sprite(['.r.', 'rrr', '.r.'], x - 3, y - 15, { r: '#e87820' }, 2);
        },
        intro: [
          'LOWERED BY ROPE INTO',
          'THE CAVE OF MONTESINOS,',
          'Quixote beholds a realm',
          'of sleeping enchanted heroes.',
          'Find your way through',
          'the magical dark.',
        ],
        quote: 'The truth may be stretched thin, but it never breaks.',
        help: 'DRAG or ARROWS to move — find the EXIT (▲)',
        winText: 'Light at last! Quixote emerges full of wondrous visions.',
        loseText: 'The torch gutters out. Enchantment swallows the way.',
        init(api) {
          const COLS = 9, ROWS = 13;
          this.COLS = COLS; this.ROWS = ROWS;
          this.CELL = 22;
          this.maze = this._genMaze(COLS, ROWS);
          this.px = 1; this.py = 1;
          this.exitX = COLS - 2; this.exitY = ROWS - 2;
          this.timer = 38;
          this.moveCD = 0;
          this.seen = new Set();
          this._reveal(this.px, this.py);
          this.gems = this._placeGems();
        },
        _genMaze(COLS, ROWS) {
          const m = [];
          for (let y = 0; y < ROWS; y++) { m[y] = []; for (let x = 0; x < COLS; x++) m[y][x] = 1; }
          const stk = [[1, 1]]; m[1][1] = 0;
          const dirs = [[0,-2],[0,2],[-2,0],[2,0]];
          while (stk.length) {
            const [cx, cy] = stk[stk.length - 1];
            const opts = [];
            for (const [dx,dy] of dirs) {
              const nx = cx+dx, ny = cy+dy;
              if (nx>0&&nx<COLS-1&&ny>0&&ny<ROWS-1&&m[ny][nx]===1) opts.push([nx,ny,dx,dy]);
            }
            if (opts.length) {
              const [nx,ny,dx,dy] = opts[Math.floor(Math.random()*opts.length)];
              m[cy+dy/2][cx+dx/2]=0; m[ny][nx]=0; stk.push([nx,ny]);
            } else stk.pop();
          }
          return m;
        },
        _reveal(cx, cy) {
          for (let dy=-2;dy<=2;dy++) for (let dx=-2;dx<=2;dx++) {
            const nx=cx+dx, ny=cy+dy;
            if (nx>=0&&ny>=0&&nx<this.COLS&&ny<this.ROWS) this.seen.add(ny*this.COLS+nx);
          }
        },
        _placeGems() {
          const cands = [];
          for (let y=1;y<this.ROWS-1;y++) for (let x=1;x<this.COLS-1;x++) {
            if (this.maze[y][x]===0 && !(x===1&&y===1) && !(x===this.exitX&&y===this.exitY))
              cands.push([x,y]);
          }
          cands.sort(()=>Math.random()-0.5);
          return cands.slice(0,3).map(([x,y])=>({x,y,taken:false}));
        },
        update(api, dt) {
          this.timer = Math.max(0, this.timer - dt);
          this.moveCD = Math.max(0, this.moveCD - dt);

          /* Input → discrete cell movement */
          let dx = 0, dy = 0;
          if (api.keyPressed('right')) dx = 1;
          else if (api.keyPressed('left'))  dx = -1;
          else if (api.keyPressed('down'))  dy = 1;
          else if (api.keyPressed('up'))    dy = -1;
          else if (api.pointer.justDown && this.moveCD === 0) {
            /* Touch: move toward tap */
            const CELL = this.CELL;
            const offX = Math.floor(api.W/2) - this.px*CELL - CELL/2;
            const offY = Math.floor(api.H/2) - this.py*CELL - CELL/2;
            const pdx = api.pointer.x - (this.px*CELL + offX + CELL/2);
            const pdy = api.pointer.y - (this.py*CELL + offY + CELL/2);
            if (Math.abs(pdx) > Math.abs(pdy)) dx = pdx > 0 ? 1 : -1;
            else dy = pdy > 0 ? 1 : -1;
          }

          if ((dx!==0||dy!==0) && this.moveCD===0) {
            const nx = this.px+dx, ny = this.py+dy;
            if (nx>=0&&ny>=0&&nx<this.COLS&&ny<this.ROWS&&this.maze[ny][nx]===0) {
              this.px=nx; this.py=ny;
              this.moveCD=0.11;
              this._reveal(this.px,this.py);
              api.audio.sfx('blip');
              for (const gem of this.gems) {
                if (!gem.taken&&gem.x===nx&&gem.y===ny) {
                  gem.taken=true; api.addScore(25); api.audio.sfx('coin');
                  api.burst(api.W/2, api.H/2, C.gold, 7);
                }
              }
              if (nx===this.exitX&&ny===this.exitY) { api.addScore(80); api.win(); }
            }
          }
          if (this.timer<=0) api.lose();
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          const CELL = this.CELL;
          const offX = Math.floor(W/2) - this.px*CELL - CELL/2;
          const offY = Math.floor(H/2) - this.py*CELL - CELL/2;

          c.fillStyle='#040306'; c.fillRect(0,0,W,H);

          /* Draw visible maze cells */
          for (let row=0;row<this.ROWS;row++) {
            for (let col=0;col<this.COLS;col++) {
              const wx=col*CELL+offX, wy=row*CELL+offY;
              if (wx>-CELL&&wx<W+CELL&&wy>-CELL&&wy<H+CELL) {
                if (!this.seen.has(row*this.COLS+col)) continue;
                if (this.maze[row][col]===1) {
                  c.fillStyle='#28203a'; c.fillRect(wx,wy,CELL,CELL);
                  c.fillStyle='#1a1428'; c.fillRect(wx+1,wy+1,CELL-2,CELL-2);
                  /* Stone texture */
                  c.fillStyle='rgba(255,255,255,.04)';
                  c.fillRect(wx+2,wy+2,CELL-4,2);
                } else {
                  c.fillStyle='#100e14'; c.fillRect(wx,wy,CELL,CELL);
                  if ((col+row)%2===0) { c.fillStyle='#141018'; c.fillRect(wx+3,wy+3,CELL-6,CELL-6); }
                }
                /* Exit glow */
                if (col===this.exitX&&row===this.exitY) {
                  const pulse=0.5+0.4*Math.sin(api.t*4);
                  c.globalAlpha=0.25+0.25*pulse;
                  c.fillStyle='#c8e850'; c.fillRect(wx+2,wy+2,CELL-4,CELL-4);
                  c.globalAlpha=1;
                  api.txtC('▲', wx+CELL/2, wy+3, 10, '#c8e850');
                }
                /* Gems */
                for (const gem of this.gems) {
                  if (!gem.taken&&gem.x===col&&gem.y===row) {
                    const gp=0.5+0.4*Math.sin(api.t*5+col);
                    c.globalAlpha=0.6+0.3*gp;
                    g.circle(wx+CELL/2, wy+CELL/2, 4, C.gold);
                    c.globalAlpha=1;
                  }
                }
              }
            }
          }

          /* Torch glow */
          const pcx=this.px*CELL+offX+CELL/2, pcy=this.py*CELL+offY+CELL/2;
          const warmG=c.createRadialGradient(pcx,pcy,4,pcx,pcy,76);
          warmG.addColorStop(0,'rgba(200,100,10,.24)');
          warmG.addColorStop(0.5,'rgba(160,70,5,.10)');
          warmG.addColorStop(1,'rgba(0,0,0,0)');
          c.fillStyle=warmG; c.fillRect(0,0,W,H);

          /* Fog */
          const fogG=c.createRadialGradient(pcx,pcy,62,pcx,pcy,96);
          fogG.addColorStop(0,'rgba(0,0,0,0)');
          fogG.addColorStop(1,'rgba(4,3,6,.97)');
          c.fillStyle=fogG; c.fillRect(0,0,W,H);

          /* Player torch */
          g.circle(Math.round(pcx),Math.round(pcy),8,'#3a2818');
          g.circle(Math.round(pcx),Math.round(pcy),4,C.saddle);
          const fl=0.6+0.4*Math.sin(api.t*14);
          c.globalAlpha=fl; g.circle(Math.round(pcx),Math.round(pcy-8),4,'#e87820');
          c.globalAlpha=fl*0.7; g.circle(Math.round(pcx),Math.round(pcy-11),2,'#ffe040');
          c.globalAlpha=1;

          /* Gem icons */
          for (let gi=0;gi<this.gems.length;gi++) {
            g.circle(8+gi*16, 28, 5, this.gems[gi].taken ? C.gold : '#3a2810');
          }

          /* Timer bar */
          const bW=140, bX=W/2-bW/2;
          g.rect(bX,H-18,bW,8,'#18100e');
          const frac=Math.max(0,this.timer/38);
          g.rect(bX,H-18,Math.round(bW*frac),8, frac<0.3 ? C.red : C.dust);
          api.txtC('TIME',W/2,H-28,7,C.stone);
          api.topBar('THE CAVE');
          api.vignette();
        },
      },

      /* ==================================================================
       * CHAPTER 5 — KNIGHT OF THE WHITE MOON
       * Timing duel: 3 rounds, tap in the gold zone to strike
       * ================================================================== */
      {
        id: 'whitemoon',
        name: 'WHITE MOON',
        sub: 'THE FINAL JOUST',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.circle(x, y-1, 7, '#e0d8f0');
          g.circle(x+4, y-3, 5, '#1a1830');
          g.rect(x+5, y-10, 2, 2, '#e0d8f0');
        },
        intro: [
          'ON THE BEACH AT BARCELONA,',
          'A STRANGE KNIGHT APPEARS.',
          '"I am the Knight of the',
          'White Moon. Yield!"',
          'Quixote readies his lance',
          'for the last time.',
        ],
        quote: 'There is no book so bad that it does not have something good in it.',
        help: 'TAP when the lance reaches the GOLD zone!',
        winText: 'The White Moon knight yields the field. Honour is satisfied.',
        loseText: '"I yield," says Quixote. The quest comes to a noble close.',
        init(api) {
          this.round = 0;
          this.rounds = 3;
          this.meter = 0;
          this.mDir  = 1;
          this.mSpd  = 0.58;   // full sweep in ~1.72s → ~3.4s round trip
          this.band  = 0.22;
          this.roundDone = false;
          this.roundWon  = false;
          this.pauseT = 0;
          this.playerHP = 3;
          this.enemyHP  = 3;
          this.flashT = 0;
          this.hitCD  = 0;
          this.chargeT = 0;
        },
        update(api, dt) {
          this.flashT = Math.max(0, this.flashT - dt);
          this.hitCD  = Math.max(0, this.hitCD - dt);
          this.chargeT += dt;

          if (this.roundDone) {
            this.pauseT -= dt;
            if (this.pauseT <= 0) {
              if (this.roundWon) {
                this.round++;
                if (this.round >= this.rounds) { api.addScore(80); api.win(); return; }
              } else {
                if (this.playerHP <= 0) { api.lose(); return; }
              }
              this.roundDone = false;
              this.mSpd = Math.min(1.6, this.mSpd + 0.14);
              this.band = Math.max(0.09, this.band - 0.025);
            }
            return;
          }

          this.meter += this.mDir * this.mSpd * dt;
          if (this.meter > 1) { this.meter = 1; this.mDir = -1; }
          if (this.meter < 0) { this.meter = 0; this.mDir = 1; }

          if (this.hitCD > 0) return;

          if (api.confirm()) {
            this.hitCD = 0.18;
            if (Math.abs(this.meter - 0.5) < this.band) {
              this.enemyHP--;
              api.addScore(40);
              api.audio.sfx('coin');
              api.burst(Math.floor(api.W * 0.72), Math.floor(api.H * 0.42), '#d8c8f0', 10);
              this.flashT = 0.45;
              this.roundDone = true; this.roundWon = true; this.pauseT = 1.2;
            } else {
              this.playerHP--;
              api.shake(7, 0.3);
              api.audio.sfx('hurt');
              this.roundDone = true; this.roundWon = false; this.pauseT = 1.0;
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          /* Barcelona beach at dusk */
          const skyG = c.createLinearGradient(0, 0, 0, H * 0.52);
          skyG.addColorStop(0, '#1a1030');
          skyG.addColorStop(0.5, '#302050');
          skyG.addColorStop(1, '#503878');
          c.fillStyle = skyG; c.fillRect(0, 0, W, H);

          /* Moon */
          g.circle(W/2, 48, 28, '#e8e0f0');
          g.circle(W/2+16, 40, 22, '#1a1030');

          /* Stars */
          for (let i = 0; i < 20; i++) {
            const sx=(i*67+13)%W, sy=(i*47+5)%Math.floor(H*0.34);
            c.globalAlpha=0.3+0.35*Math.sin(api.t*1.5+i);
            g.rect(sx,sy,1,1,'#e8e0f8');
          }
          c.globalAlpha=1;

          /* Sea */
          const seaY = Math.floor(H * 0.52);
          c.fillStyle='#0c1828'; c.fillRect(0,seaY,W,H-seaY);
          for (let i=0;i<5;i++) {
            const wx=((api.t*18+i*52)%(W+40))-20;
            c.globalAlpha=0.13;
            g.rect(wx,seaY+4+i*5,44,2,'#e0eeff');
          }
          c.globalAlpha=1;
          /* Sand */
          g.rect(0,seaY-10,W,14,'#d4b870');

          /* Hit flash */
          if (this.flashT > 0) {
            c.globalAlpha=this.flashT*0.35;
            c.fillStyle='#ffe0f0'; c.fillRect(0,0,W,H);
            c.globalAlpha=1;
          }

          /* Enemy knight (right) */
          const ekx=Math.floor(W*0.74), eky=seaY-28;
          g.rect(ekx-14,eky,28,14,'#d0c8e4');
          g.rect(ekx-12,eky-10,10,12,'#d0c8e4');
          g.rect(ekx-4,eky+12,5,8,'#d0c8e4');
          g.rect(ekx+6,eky+12,5,8,'#d0c8e4');
          g.rect(ekx-4,eky-22,10,22,'#b0a8c8');
          g.circle(ekx,eky-24,6,'#c8c0e0');
          g.circle(ekx,eky-32,5,'#e8e0f8');
          g.circle(ekx+3,eky-34,3,'#302050');
          /* Enemy lance (pointing left) */
          g.rect(ekx-54,eky-8,44,3,'#c0b8d8');

          /* Quixote (left, slight bob) */
          const qkx=Math.floor(W*0.22);
          const bob=Math.floor(Math.sin(this.chargeT*3)*2);
          const qky=seaY-26+bob;
          g.rect(qkx-14,qky,28,12,'#c8c0b0');
          g.rect(qkx-16,qky-8,12,10,'#c8c0b0');
          g.rect(qkx-4,qky+10,5,8,'#c8c0b0');
          g.rect(qkx+8,qky+10,5,8,'#c8c0b0');
          g.rect(qkx-4,qky-22,10,22,'#8a8070');
          g.circle(qkx,qky-24,6,'#8a8070');
          g.rect(qkx-6,qky-32,12,10,'#9a9080');
          /* Lance */
          c.strokeStyle=C.saddle; c.lineWidth=3;
          c.beginPath(); c.moveTo(qkx+4,qky-10); c.lineTo(ekx-16,eky-6); c.stroke();
          g.sprite(['.r','rr','.r'],ekx-22,eky-8,{r:C.red},2);

          /* HP bars */
          api.txtCFit('QUIXOTE',34,22,7,C.white,true,60);
          for (let i=0;i<3;i++) g.rect(6+i*12,32,10,6,i<this.playerHP?C.red:'#3a1010');
          api.txtCFit('WHITE MOON',W-70,22,7,'#d0c0e8',true,60);
          for (let i=0;i<3;i++) g.rect(W-44+(2-i)*12,32,10,6,i<this.enemyHP?'#a090d0':'#2a2030');

          /* Strike meter */
          const mW=160, mX=W/2-mW/2, mY=H-44, mH=14;
          g.rect(mX,mY,mW,mH,'#10101c');
          const zHalf=this.band*mW;
          g.rect(mX+mW/2-zHalf,mY,zHalf*2,mH,'rgba(224,192,80,.28)');
          g.rectO(mX+mW/2-zHalf,mY,zHalf*2,mH,C.gold,1);
          const nX=mX+Math.round(this.meter*mW);
          g.rect(nX-3,mY-5,6,mH+10,'#e0d0f8');
          g.rect(nX-1,mY,2,mH,'#ffffff');

          /* Round pips */
          for (let i=0;i<this.rounds;i++) {
            g.circle(W/2-(this.rounds-1)*10+i*20, H-18, 5, i<this.round ? C.dust : '#26202e');
          }
          api.txtC('PASS ' + (this.round+1) + ' OF ' + this.rounds, W/2, H-58, 8, C.stone);
          api.topBar('KNIGHT OF THE WHITE MOON');
          api.vignette();
          api.scanlines();
        },
      },
    ],
  });
})();
