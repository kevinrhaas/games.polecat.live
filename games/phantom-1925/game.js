/* ============================================================================
 * THE MASQUE
 * Phantom of the Opera — 1925 film (dir. Rupert Julian)
 * Five scenes:
 *   1. RED DEATH      — weave through the masquerade ball, collect roses
 *   2. THE LAIR       — hit organ notes in the gold zone to entrance Christine
 *   3. CHANDELIER     — drop the great chandelier on the pursuing mob
 *   4. CATACOMBS      — steer the gondola past torch-sweeping guards
 *   5. MOB CHASE      — flee through Paris streets, dodge cobblestones
 * Built on RetroSaga (js/saga.js).
 * NES-honest: sepia/monochrome palette, no smooth gradients or alpha glows.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* --- NES-honest palette: sepia film-tones, crimson accent, gold chandelier --- */
  const P = {
    black:   '#000000',
    dkGray:  '#3C3C3C',
    gray:    '#7C7C7C',
    ltGray:  '#BCBCBC',
    white:   '#F8F8F8',
    red:     '#D82800',
    dkRed:   '#880000',
    crimson: '#6C0000',
    purple:  '#7C2888',
    gold:    '#F8B800',
    amber:   '#BC7800',
    sepia:   '#A87848',
    sepiaLt: '#FCE0A8',
    sepiaDk: '#503000',
    bone:    '#F8F8F8',
    curtain: '#3C0000',
    stage:   '#1C0000',
    water:   '#000880',
    waterLt: '#0050C8',
    dkBlue:  '#000030',
    cand:    '#FCE0A8',
  };

  /* ========================= EMBLEM ========================= */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // White half-mask (left)
    g.rect(cx - 18, cy - 16, 18, 26, P.white);
    g.rect(cx - 22, cy - 8, 6, 14, P.white);
    // Eye holes
    g.rect(cx - 16, cy - 12, 4, 4, P.black);
    // Dark scarred right face
    g.rect(cx, cy - 16, 18, 26, P.dkGray);
    g.circle(cx + 8, cy - 6, 4, P.dkGray);
    g.rect(cx + 2, cy - 12, 4, 4, P.black);
    // Red cape/collar
    g.rect(cx - 18, cy + 14, 36, 8, P.red);
    g.rect(cx - 12, cy + 22, 24, 4, P.dkRed);
    // Single rose
    g.circle(cx + 12, cy + 28, 5, P.red);
    g.rect(cx + 11, cy + 32, 2, 8, P.sepiaDk);
  }

  /* ========================= SCENERY ======================== */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Dark theater curtain
      c.fillStyle = P.stage; c.fillRect(0, 0, W, H);
      for (let x = 0; x < W; x += 18) {
        g.rect(x,      0, 10, H, P.curtain);
        g.rect(x + 10, 0,  8, H, '#240000');
      }
      g.rect(0, 0,     W, 6, P.gold);
      g.rect(0, 6,     W, 3, P.amber);
      g.rect(0, H - 9, W, 3, P.amber);
      g.rect(0, H - 6, W, 6, P.gold);
      return;
    }

    // Opera house backdrop
    c.fillStyle = P.black; c.fillRect(0, 0, W, H);
    // Proscenium arch (top)
    g.rect(0, 0, W, 28, P.curtain);
    g.rect(0, 0, W, 4,  P.gold);
    // Side box columns
    g.rect(0,     26, 20, Math.round(H * 0.62), P.dkGray);
    g.rect(W - 20, 26, 20, Math.round(H * 0.62), P.dkGray);
    for (let by = 38; by < Math.round(H * 0.62); by += 34) {
      g.rect(3,      by, 14, 22, '#240000');
      g.rect(W - 17, by, 14, 22, '#240000');
    }
    // Stage floor
    const flY = Math.round(H * 0.68);
    g.rect(20, flY, W - 40, H - flY, P.sepiaDk);
    for (let fx = 20; fx < W - 20; fx += 24) g.rect(fx, flY, 22, H - flY, '#3a1e08');

    // Swinging chandelier
    const sw = Math.sin(t * 0.72) * 7;
    const chX = Math.round(W / 2 + sw);
    for (let ci = 0; ci < 7; ci++) g.rect(chX - 1, 28 + ci * 6, 2, 5, P.sepia);
    g.rect(chX - 24, 70, 48, 8, P.gold);
    g.rect(chX - 18, 78, 36, 5, P.amber);
    for (let ci = -3; ci <= 3; ci++) {
      const cx2 = chX + ci * 7;
      g.rect(cx2 - 1, 61, 2, 10, P.cand);
      g.rect(cx2 - 2, 56, 4, 6, Math.sin(t * 9 + ci * 1.8) > 0.2 ? P.gold : P.amber);
    }

    if (scene === 'intro' || scene === 'result') {
      c.fillStyle = 'rgba(0,0,0,.78)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'finale') {
      c.fillStyle = 'rgba(0,0,0,.86)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ========================= ICONS ========================== */
  function iconRedDeath(api, x, y) {
    const g = api.gfx;
    g.circle(x, y - 4, 8, P.red);
    g.rect(x - 4, y + 4, 8, 6, P.red);
    g.rect(x - 4, y - 8, 3, 3, P.black);
    g.rect(x + 1, y - 8, 3, 3, P.black);
  }
  function iconLair(api, x, y) {
    const g = api.gfx;
    const hs = [22, 28, 24, 18, 26, 20, 14];
    for (let i = 0; i < 7; i++) {
      g.rect(x - 16 + i * 5, y - hs[i] + 6, 4, hs[i], i % 2 === 0 ? P.ltGray : P.gray);
    }
    g.rect(x - 18, y + 6, 38, 4, P.sepiaDk);
  }
  function iconChandelier(api, x, y) {
    const g = api.gfx;
    g.rect(x - 12, y - 10, 24, 6, P.gold);
    g.rect(x - 8,  y - 4,  16, 4, P.amber);
    for (let ci = -2; ci <= 2; ci++) g.rect(x + ci * 5 - 1, y, 2, 8, P.cand);
  }
  function iconCatacombs(api, x, y) {
    const g = api.gfx;
    g.rect(x - 14, y + 2,  28, 8, P.sepiaDk);
    g.rect(x - 16, y - 2,  32, 6, P.sepia);
    g.rect(x + 8,  y - 16,  2, 20, P.gray);
    g.rect(x - 16, y + 10, 32,  4, P.waterLt);
  }
  function iconMob(api, x, y) {
    const g = api.gfx;
    for (let i = 0; i < 3; i++) {
      const fx = x - 10 + i * 10;
      g.circle(fx, y - 6, 4, P.sepia);
      g.rect(fx - 3, y - 2, 6, 9, P.gray);
    }
  }

  /* ====================== MENU: SILENT FILM FRAMES ========== */
  const MENU = {
    colors: { title: P.gold, label: P.white, cur: P.gold, done: P.amber, locked: P.gray },

    layout() {
      // 2×2 grid + 1 centred at bottom — like a strip of film
      return [
        { x: 10,  y: 86,  w: 118, h: 82 },
        { x: 142, y: 86,  w: 118, h: 82 },
        { x: 10,  y: 184, w: 118, h: 82 },
        { x: 142, y: 184, w: 118, h: 82 },
        { x: 76,  y: 282, w: 118, h: 82 },
      ];
    },

    card(api, info) {
      const g = api.gfx, c = api.ctx;
      const { ch, i, x, y, w, h, sel, done } = info;
      const cx = x + w / 2, cy = y + h / 2;

      // Film frame outer
      g.rect(x, y, w, h, P.black);
      g.rectO(x, y, w, h, sel ? P.gold : done ? P.amber : P.dkGray, sel ? 2 : 1);

      // Sprocket holes (left + right edges)
      const sCol = sel ? '#504000' : '#1C1C1C';
      for (let sy = y + 4; sy < y + h - 6; sy += 16) {
        g.rect(x + 2,     sy, 7, 9, sCol);
        g.rect(x + w - 9, sy, 7, 9, sCol);
      }

      // Inner image area
      const iX = x + 13, iY = y + 5, iW = w - 26, iH = h - 10;
      g.rect(iX, iY, iW, iH, '#080808');
      g.rectO(iX, iY, iW, iH, sel ? P.gold : P.dkGray, 1);

      // Chapter icon
      const icons = [iconRedDeath, iconLair, iconChandelier, iconCatacombs, iconMob];
      if (icons[i]) icons[i](api, cx, cy - 9);

      // Scene name
      api.txtCFit(ch.name, cx, cy + 20, 6, sel ? P.gold : P.ltGray, true, iW - 6);

      // Done overlay
      if (done) {
        c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(iX, iY, iW, iH);
        api.txtCFit('DONE', cx, cy - 2, 8, P.gold, true);
      }

      // Selection pulse
      if (sel && Math.sin(api.t * 5) > 0) {
        g.rectO(iX - 1, iY - 1, iW + 2, iH + 2, P.gold, 1);
      }
    },

    title(api, currency) {
      const g = api.gfx, W = api.W;
      g.rect(10, 10, W - 20, 62, P.black);
      g.rectO(10, 10, W - 20, 62, P.gold, 2);
      // Film sprocket strip
      for (let hx = 18; hx < W - 14; hx += 18) g.rect(hx, 14, 10, 7, '#1C1C1C');
      g.rect(18, 22, W - 36, 1, P.amber);
      api.txtCFit('THE MASQUE', W / 2, 38, 10, P.white, true, W - 44);
      api.txtCFit('SOULS: ' + currency, W / 2, 58, 7, P.gold, true, W - 44);
    },
  };

  /* ===================== GAME CONFIG ======================== */
  RetroSaga.create({
    id: 'phantom1925',
    title: 'The Phantom',
    subtitle: 'THE MASQUE',
    currency: 'SOULS',
    accent: P.red,
    credit: 'PHANTOM OF THE OPERA · RUPERT JULIAN · 1925',
    emblem,
    scenery,
    bootCta: 'TAP TO UNMASK',
    menuLabel: "THE PHANTOM'S OPERA",
    menuHint: 'CHOOSE YOUR SCENE',
    menuDone: 'THE PHANTOM RESTS',
    screens: {
      win:          P.gold,
      lose:         P.red,
      chapterLabel: P.ltGray,
      name:         P.white,
      sub:          P.sepia,
      intro:        P.sepiaLt,
      quote:        P.gray,
      help:         P.gold,
      score:        P.white,
      cur:          P.gold,
      cta:          P.gold,
      overlay:      'rgba(0,0,0,.90)',
    },
    labels: {
      chapter:  'SCENE',
      score:    'SOULS ENSNARED',
      win:      'DARKNESS HOLDS',
      lose:     'LIGHT FINDS YOU',
      cont:     'TAP TO CONTINUE',
      finale:   'TAP FOR SILENCE',
      toMenu:   'TAP TO RETREAT',
      play:     'TAP TO BEGIN',
    },
    menu: MENU,
    finale: [
      'THE PHANTOM STANDS ALONE',
      'in the empty catacombs.',
      '',
      'THE MOB HAS GONE.',
      'Only Christine\'s voice lingers',
      'in the vaulted dark.',
      '',
      'MUSIC ENDURES.',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ====================== SCENE 1: RED DEATH ====================== */
      {
        id: 'reddeath', name: 'RED DEATH', sub: 'THE MASQUERADE BALL',
        icon: iconRedDeath,
        intro: [
          'AT THE GRAND MASQUERADE,',
          'THE PHANTOM APPEARS',
          'dressed as the Red Death —',
          'stalking among the revelers.',
        ],
        quote: '"The chandelier has fallen! The Phantom! The Phantom of the Opera!"',
        help: 'STEER left/right · COLLECT roses · DODGE masked guests',
        winText: 'The revelers part in terror. The Red Death holds court over the stunned hall.',
        loseText: 'The crowd closes in. The Phantom vanishes before the mob reaches him.',
        init(api) {
          this.x = api.W / 2;
          this.timer = 26;
          this.roses = 0;
          this.needRoses = 12;
          this.hits = 0;
          this.maxHits = 4;
          this.items = [];
          this.spawnT = 0.6;
          this.speed = 2.3;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.speed = Math.min(4.0, this.speed + dt * 0.04);

          if (api.pointer.down) this.x += (api.pointer.x < api.W / 2 ? -1 : 1) * 4.2 * f;
          if (api.keyDown('left'))  this.x -= 4.0 * f;
          if (api.keyDown('right')) this.x += 4.0 * f;
          this.x = clamp(this.x, 16, api.W - 16);

          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.38, 0.78);
            const rose = api.chance(0.44);
            this.items.push({
              x: api.rnd(18, api.W - 18), y: -18,
              vy: this.speed * (rose ? 0.70 : 1.0),
              kind: rose ? 'rose' : 'guest',
            });
          }

          const pY = api.H - 64;
          this.items = this.items.filter(it => {
            it.y += it.vy * f;
            if (it.y > api.H + 24) return false;
            if (!it.hit && Math.abs(it.x - this.x) < 18 && Math.abs(it.y - pY) < 18) {
              it.hit = true;
              if (it.kind === 'rose') {
                this.roses++;
                api.audio.sfx('coin');
                api.burst(it.x, it.y, P.red, 8);
                if (this.roses >= this.needRoses) { api.score += 100; api.win(); return false; }
              } else {
                this.hits++;
                api.audio.sfx('hurt'); api.shake(5, 0.2); api.flash(P.ltGray, 0.14);
                if (this.hits >= this.maxHits) { api.lose(); return false; }
              }
            }
            return !it.hit;
          });

          if (this.timer <= 0) {
            if (this.roses >= this.needRoses) { api.score += 60; api.win(); }
            else api.lose();
          }
          api.score = this.roses * 9;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Grand ballroom
          g.rect(0, 0, W, H, P.sepiaDk);
          g.rect(0, 0, W, 36, P.curtain);
          g.rect(0, 0, W, 4, P.gold);

          // Marble floor (dithered)
          const flY = Math.round(H * 0.64);
          g.rect(0, flY, W, H - flY, '#281408');
          for (let fx = 0; fx < W; fx += 22) g.rect(fx, flY, 20, H - flY, '#1e1006');
          for (let fy = flY; fy < H; fy += 22) g.rect(0, fy, W, 1, '#0a0604');

          // Wall columns
          for (let col = 0; col < 4; col++) {
            const cx2 = col * 90;
            g.rect(cx2, 36, 12, flY - 36, P.sepia);
            g.rect(cx2, 36, 12, 5, P.gold);
            g.rect(cx2, flY - 5, 12, 5, P.gold);
          }

          // Falling items
          for (const it of this.items) {
            if (it.kind === 'rose') {
              g.circle(it.x, it.y, 6, P.red);
              g.rect(it.x - 1, it.y + 5, 2, 8, '#005800');
            } else {
              // Masked guest
              g.rect(it.x - 8, it.y - 14, 16, 22, P.dkGray);
              g.circle(it.x, it.y - 14, 6, P.ltGray);
              g.rect(it.x - 4, it.y - 18, 3, 3, P.black);
              g.rect(it.x + 1, it.y - 18, 3, 3, P.black);
            }
          }

          // Phantom as Red Death
          const px = this.x, py = H - 64;
          g.rect(px - 18, py - 8, 36, 18, P.dkRed);
          g.rect(px - 14, py - 22, 28, 20, P.red);
          g.circle(px, py - 30, 10, P.white);
          g.rect(px - 5, py - 35, 4, 4, P.black);
          g.rect(px + 2, py - 35, 4, 4, P.black);
          g.rect(px - 14, py - 40, 28, 10, P.crimson); // hood

          // HUD
          api.topBar('RED DEATH');
          api.txt('ROSE ' + this.roses + '/' + this.needRoses, 6, 20, 9, P.red);
          const tw = W - 92;
          g.rect(W - tw - 6, 20, tw, 6, '#280000');
          g.rect(W - tw - 6, 20, tw * clamp(this.timer / 26, 0, 1), 6, P.amber);
          for (let i = 0; i < 4; i++) {
            g.rect(6 + i * 13, 30, 10, 6, i < (4 - this.hits) ? P.red : '#280000');
          }
          api.vignette(); api.scanlines();
        },
      },

      /* ====================== SCENE 2: THE LAIR ======================= */
      {
        id: 'lair', name: 'THE LAIR', sub: 'MUSIC OF THE NIGHT',
        icon: iconLair,
        intro: [
          'DEEP BELOW THE OPERA,',
          'THE PHANTOM PLAYS HIS ORGAN',
          'to keep Christine entranced',
          'in his underground lair.',
        ],
        quote: '"I am your Angel of Music — come to me, Angel of Music!"',
        help: 'TAP when the slider reaches the GOLD ZONE · hit 5 notes',
        winText: 'The music soars. Christine stands transfixed, tears streaming down her face.',
        loseText: 'A wrong note breaks the spell. Christine stirs — and sees his face.',
        init(api) {
          this.pos = 0;
          this.dir = 1;
          this.speed = 0.011;
          this.attempts = 0;
          this.maxAttempts = 9;
          this.hits = 0;
          this.needHits = 5;
          this.misses = 0;
          this.maxMisses = 4;
          this.zone = 0.21;
          this.playing = false;
          this.playT = 0;
          this.playHit = false;
          this.notes = [];
          this.noteT = 0.8;
          this.noteIdx = 0;
          const NOTES = 'CDEFGABC'.split('');
          this.NOTES = NOTES;
        },
        update(api, dt) {
          const f = dt * 60;

          // Floating musical notes (decorative)
          this.noteT -= dt;
          if (this.noteT <= 0) {
            this.noteT = api.rnd(0.5, 1.1);
            this.notes.push({
              x: api.rnd(22, api.W - 22),
              y: api.H - 90,
              vy: 0.65,
              life: 2.2,
              n: this.NOTES[this.noteIdx++ % 8],
            });
          }
          for (const n of this.notes) { n.y -= n.vy * f; n.life -= dt; }
          this.notes = this.notes.filter(n => n.life > 0 && n.y > -20);

          if (this.playing) {
            this.playT += dt;
            if (this.playT >= 0.55) {
              this.playing = false;
              this.attempts++;
              if (this.playHit) {
                this.hits++;
                if (this.hits >= this.needHits) { api.score += 100; api.win(); return; }
              } else {
                this.misses++;
                if (this.misses >= this.maxMisses) { api.lose(); return; }
              }
              if (this.attempts >= this.maxAttempts) {
                if (this.hits >= this.needHits) { api.score += 60; api.win(); }
                else api.lose();
                return;
              }
              this.zone = Math.max(0.09, this.zone - 0.011);
              this.speed = Math.min(0.022, this.speed + 0.001);
            }
            return;
          }

          this.pos += this.dir * this.speed * f;
          if (this.pos >= 1) { this.pos = 1; this.dir = -1; }
          if (this.pos <= 0) { this.pos = 0; this.dir = 1; }

          if (api.confirm()) {
            const dist = Math.abs(this.pos - 0.5);
            this.playHit = dist < this.zone;
            this.playing = true; this.playT = 0;
            if (this.playHit) {
              api.audio.sfx('power');
              api.burst(api.W / 2, api.H * 0.5, P.gold, 14);
            } else {
              api.audio.sfx('blip'); api.flash(P.red, 0.1);
            }
          }
          api.score = this.hits * 20;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Underground lair — dark stone
          g.rect(0, 0, W, H, '#060408');
          for (let sy = 0; sy < Math.round(H * 0.55); sy += 20) {
            for (let sx = 0; sx < W; sx += 36) {
              g.rect(sx, sy, 34, 18, '#0C0A12');
              g.rectO(sx, sy, 34, 18, '#18101E', 1);
            }
          }

          // Candle sconces
          for (const sx of [14, W - 22]) {
            g.rect(sx, 28, 8, 22, P.sepiaDk);
            g.rect(sx + 1, 22, 6, 8, P.cand);
            g.rect(sx + 1, 18, 6, 5, Math.sin(api.t * 7 + sx) > 0.1 ? P.gold : P.amber);
          }

          // Organ pipes
          const oX = W / 2, oY = H - 106;
          const pipeH = [55, 66, 58, 44, 62, 50, 38, 70, 46, 60];
          const pipeStart = oX - (pipeH.length * 12) / 2;
          for (let pi = 0; pi < pipeH.length; pi++) {
            const px2 = pipeStart + pi * 12;
            const ph = pipeH[pi];
            g.rect(px2, oY - ph, 10, ph, pi % 2 === 0 ? P.gray : P.ltGray);
            g.rect(px2, oY - ph, 10, 4, P.sepia);
          }

          // Organ console
          g.rect(oX - 52, oY, 104, 14, P.sepiaDk);
          g.rect(oX - 48, oY + 2, 96, 8, P.white);
          for (let ki = 0; ki < 13; ki++) {
            const kx = oX - 46 + ki * 7;
            const black = [1, 3, 6, 8, 10].includes(ki);
            if (!black) g.rect(kx, oY + 2, 6, 7, P.white);
          }
          for (let ki = 0; ki < 13; ki++) {
            const kx = oX - 46 + ki * 7;
            if ([1, 3, 6, 8, 10].includes(ki)) g.rect(kx, oY + 2, 5, 5, P.black);
          }

          // Hit pulse
          if (this.playing && this.playHit) {
            const prog = this.playT / 0.55;
            c.globalAlpha = Math.max(0, 1 - prog);
            for (let r = 12; r < 40; r += 9) g.rectO(oX - r, oY - r * 0.6, r * 2, r, P.gold, 1);
            c.globalAlpha = 1;
          }

          // Phantom at bench
          g.sprite([
            '..cc..',
            'cccccc',
            '.cccc.',
            'cc..cc',
          ], oX - 12, oY + 14, { c: P.purple }, 4);
          g.circle(oX, oY + 10, 7, P.white);
          g.rect(oX - 7, oY + 6, 7, 8, P.white);
          g.rect(oX - 7, oY + 4, 3, 3, P.black);

          // Floating notes
          for (const n of this.notes) {
            const a = clamp(n.life / 2.2, 0, 1);
            c.globalAlpha = a;
            g.circle(n.x, n.y, 4, P.gold);
            g.rect(n.x + 3, n.y - 8, 2, 10, P.gold);
            c.globalAlpha = 1;
          }

          // Aim slider
          const slW = W - 40, slX = 20, slY = H - 30;
          g.rect(slX, slY, slW, 12, '#060408');
          g.rect(slX + slW * (0.5 - this.zone), slY, slW * this.zone * 2, 12, 'rgba(248,184,0,.26)');
          g.rectO(slX, slY, slW, 12, P.gray, 1);
          g.rect(slX + slW * (0.5 - this.zone) - 1, slY - 3, 2, 18, P.gold);
          g.rect(slX + slW * (0.5 + this.zone) - 1, slY - 3, 2, 18, P.gold);
          if (!this.playing) {
            const curX = slX + slW * this.pos;
            const onZone = Math.abs(this.pos - 0.5) < this.zone;
            g.rect(curX - 3, slY - 4, 6, 20, onZone ? P.gold : P.red);
          }

          api.topBar('THE LAIR');
          api.txt('NOTE ' + this.attempts + '/' + this.maxAttempts, 6, 20, 9, P.ltGray);
          api.txt('HIT ' + this.hits + '/' + this.needHits, W - 86, 20, 9, P.gold);
          api.vignette();
        },
      },

      /* ====================== SCENE 3: CHANDELIER ==================== */
      {
        id: 'chandelier', name: 'CHANDELIER', sub: 'LET IT FALL',
        icon: iconChandelier,
        intro: [
          'THE PHANTOM CUTS THE CHAIN',
          'ABOVE THE GREAT CHANDELIER.',
          'Below, the audience fills',
          'the house. Drop it.',
        ],
        quote: '"The chandelier crashing down on the heads of a screaming audience."',
        help: 'MOVE left/right · TAP to DROP when the crowd is below',
        winText: 'The chandelier crashes to the floor. The Phantom laughs in the dark rigging.',
        loseText: 'The chandelier misses. The crowd flees into the corridors unharmed.',
        init(api) {
          this.chanX = api.W / 2;
          this.drops = 0;
          this.needDrops = 3;
          this.misses = 0;
          this.maxMisses = 3;
          this.crowds = [];
          this.spawnT = 1.6;
          this.falling = false;
          this.fallY = 0;
          this.fallDone = false;
          this.resetT = 0;
          this.lastHit = false;
          this.lastDropX = api.W / 2;
          this.score_v = 0;
        },
        update(api, dt) {
          const f = dt * 60;

          // Reset delay after each drop
          if (this.resetT > 0) {
            this.resetT -= dt;
            if (this.resetT <= 0) {
              this.falling = false;
              this.fallY = 0;
              this.fallDone = false;
              this.chanX = api.W / 2;
              if (this.lastHit) {
                this.crowds = this.crowds.filter(cr => Math.abs(cr.x - this.lastDropX) >= 54);
              }
            }
            return;
          }

          if (this.falling) {
            this.fallY += 9 * f;
            const floorY = api.H - 82;
            if (!this.fallDone && this.fallY >= floorY) {
              this.fallDone = true;
              let hit = false;
              for (const cr of this.crowds) {
                if (Math.abs(cr.x - this.lastDropX) < 54) { hit = true; break; }
              }
              this.lastHit = hit;
              if (hit) {
                this.drops++;
                this.score_v += 100;
                api.audio.sfx('explode'); api.shake(10, 0.4);
                api.burst(this.lastDropX, floorY, P.gold, 22);
                api.burst(this.lastDropX, floorY, P.sepia, 12);
                if (this.drops >= this.needDrops) { api.score = this.score_v + 200; api.win(); return; }
              } else {
                this.misses++;
                api.audio.sfx('hurt'); api.shake(4, 0.2); api.flash(P.ltGray, 0.12);
                if (this.misses >= this.maxMisses) { api.lose(); return; }
              }
              this.resetT = 0.85;
            }
            return;
          }

          // Move chandelier
          if (api.pointer.down) this.chanX += (api.pointer.x - this.chanX) * 0.14 * f;
          if (api.keyDown('left'))  this.chanX -= 4.2 * f;
          if (api.keyDown('right')) this.chanX += 4.2 * f;
          this.chanX = clamp(this.chanX, 30, api.W - 30);

          // Spawn crowds walking across the stage
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(1.6, 3.0);
            const fromLeft = api.chance(0.5);
            this.crowds.push({
              x: fromLeft ? -40 : api.W + 40,
              vx: fromLeft ? api.rnd(0.45, 0.80) : -api.rnd(0.45, 0.80),
              size: api.rnd(32, 52),
            });
          }
          for (const cr of this.crowds) cr.x += cr.vx * f;
          this.crowds = this.crowds.filter(cr => cr.x > -70 && cr.x < api.W + 70);

          // Drop
          if (!this.falling && api.confirm()) {
            this.falling = true;
            this.lastDropX = this.chanX;
            this.fallY = 74;
            this.fallDone = false;
            api.audio.sfx('shoot');
          }
          api.score = this.score_v;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Auditorium interior (looking down)
          g.rect(0, 0, W, H, '#0E0608');
          // Ceiling rigging
          g.rect(0, 0, W, 28, P.sepiaDk);
          for (let rx = 0; rx < W; rx += 16) g.rect(rx, 0, 2, 28, P.sepia);
          // Stage floor
          const floorY = H - 82;
          g.rect(0, floorY, W, 82, '#160E04');
          for (let fx = 0; fx < W; fx += 22) g.rect(fx, floorY, 20, 82, '#120C04');

          // Walking crowd figures at floor level
          const crowdY = H - 68;
          for (const cr of this.crowds) {
            const sz = Math.round(cr.size);
            for (let ci = 0; ci < 4; ci++) {
              const fx = cr.x - sz / 2 + ci * (sz / 4);
              const fh = 20 + (ci * 9) % 12;
              g.circle(fx, crowdY - fh, 5, P.sepia);
              g.rect(fx - 4, crowdY - fh + 4, 8, fh, P.dkGray);
            }
          }

          // Drop shadow on floor
          c.globalAlpha = 0.45;
          c.fillStyle = P.black;
          c.beginPath();
          c.ellipse(this.chanX, floorY - 2, 46, 9, 0, 0, Math.PI * 2);
          c.fill();
          c.globalAlpha = 1;

          // Target indicator
          const hitCrowd = this.crowds.some(cr => Math.abs(cr.x - this.chanX) < 54);
          g.rect(this.chanX - 54, floorY - 3, 108, 3, hitCrowd ? P.red : P.amber);

          // Chandelier
          const chY = this.falling ? this.fallY : 62;
          if (!this.falling || chY < 220) {
            // Chain
            for (let ci = 0; ci < Math.floor(chY / 8); ci++) {
              g.rect(this.chanX - 1, 28 + ci * 8, 2, 7, P.sepia);
            }
          }
          g.rect(this.chanX - 28, chY,      56, 10, P.gold);
          g.rect(this.chanX - 22, chY + 10, 44, 6,  P.amber);
          for (let ci = -3; ci <= 3; ci++) {
            const cx2 = this.chanX + ci * 8;
            g.rect(cx2 - 1, chY - 11, 2, 13, P.cand);
            g.rect(cx2 - 2, chY - 15, 4, 5, Math.sin(api.t * 9 + ci) > 0 ? P.gold : P.amber);
          }
          for (let ci = -4; ci <= 4; ci++) {
            g.rect(this.chanX + ci * 6 - 1, chY + 16, 2, 8, P.ltGray);
          }

          api.topBar('CHANDELIER');
          api.txt('DROP ' + this.drops + '/' + this.needDrops, 6, 20, 9, P.gold);
          for (let i = 0; i < 3; i++) {
            g.rect(W - 12 - i * 14, 20, 10, 8, i < (3 - this.misses) ? P.red : '#280000');
          }
          api.vignette(); api.scanlines();
        },
      },

      /* ====================== SCENE 4: CATACOMBS ==================== */
      {
        id: 'catacombs', name: 'CATACOMBS', sub: 'BELOW THE OPERA',
        icon: iconCatacombs,
        intro: [
          'THE PHANTOM STEERS HIS GONDOLA',
          'through torch-lit tunnels',
          'beneath the Paris opera,',
          'where guard patrols sweep.',
        ],
        quote: '"Beneath the surface of the opera there are five floors of vaulted cellars."',
        help: 'TAP UP/DOWN · Steer the gondola · AVOID the torch sweeps',
        winText: 'The gondola glides to the underground lake. The Phantom is home.',
        loseText: 'A torch reveals him. The guards close in from both ends of the tunnel.',
        init(api) {
          this.y = api.H / 2;
          this.vy = 0;
          this.timer = 25;
          this.hits = 0;
          this.maxHits = 3;
          this.torches = [];
          this.spawnT = 2.2;
          this.scrollX = 0;
          this.stalactites = [];
          for (let i = 0; i < 16; i++) {
            this.stalactites.push({
              ox: i * 20 + Retro.util.rand(0, 12),
              h:  Retro.util.rand(14, 42),
              w:  Retro.util.rand(6, 14),
            });
          }
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;

          if (api.pointer.down) this.vy += (api.pointer.y < api.H / 2 ? -1 : 1) * 0.28 * f;
          if (api.keyDown('up'))   this.vy -= 0.32 * f;
          if (api.keyDown('down')) this.vy += 0.32 * f;
          this.vy = clamp(this.vy, -6, 6);
          this.vy *= 0.87;
          this.y = clamp(this.y + this.vy * f, 56, api.H - 88);

          this.scrollX += 1.6 * f;

          // Spawn sweeping torches (come from right, sweep vertically near gondola X=135)
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(2.2, 3.8);
            const fromTop = api.chance(0.5);
            this.torches.push({
              x: api.W + 20,
              fromTop,
              centerY: api.rnd(api.H * 0.22, api.H * 0.72),
              sweepAmp: api.rnd(36, 64),
              sweepT: 0,
              sweepSpd: api.rnd(1.1, 1.8),
              hit: false,
            });
          }
          for (const tr of this.torches) {
            tr.x -= 1.3 * f;
            tr.sweepT += dt;
          }
          this.torches = this.torches.filter(tr => tr.x > -30);

          // Collision: torch is "at" gondola X when x is between 100 and 170
          for (const tr of this.torches) {
            if (tr.x < 98 || tr.x > 172) { tr.hit = false; continue; }
            const beamY = tr.centerY + Math.sin(tr.sweepT * tr.sweepSpd) * tr.sweepAmp;
            const inBeam = Math.abs(this.y - beamY) < 22;
            if (inBeam && !tr.hit) {
              tr.hit = true;
              this.hits++;
              api.audio.sfx('hurt'); api.shake(5, 0.22); api.flash(P.gold, 0.18);
              if (this.hits >= this.maxHits) { api.lose(); return; }
            } else if (!inBeam) {
              tr.hit = false;
            }
          }

          if (this.timer <= 0) { api.score += 150; api.win(); }
          api.score = Math.floor(Math.max(0, 25 - this.timer) * 7);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Dark catacomb tunnel
          g.rect(0, 0, W, H, P.dkBlue);
          g.rect(0, 0, W, 28, '#0C0C16');
          // Stone arch blocks
          for (let sx = 0; sx < W; sx += 22) {
            const sh = 12 + (sx * 7) % 14;
            g.rect(sx, 0, 20, sh + 14, '#10101A');
            g.rect(sx, sh, 20, 3, P.dkGray);
          }

          // Scrolling stalactites
          const W2 = W + 20;
          for (const st of this.stalactites) {
            const sx = (st.ox - this.scrollX % W2 + W2 * 6) % W2;
            g.rect(sx - Math.round(st.w / 2), 28, Math.round(st.w), Math.round(st.h), '#101018');
            g.rect(sx - 2, 28 + Math.round(st.h) - 5, 4, 5, P.dkGray);
          }

          // Underground water
          const waterY = H - 52;
          g.rect(0, waterY, W, 52, P.water);
          for (let wx = 0; wx < W; wx += 10) {
            if (Math.sin(api.t * 2.4 + wx * 0.25) > 0.35) g.rect(wx, waterY, 8, 3, P.waterLt);
          }
          g.rect(0, waterY, W, 4, '#001050');

          // Torch beams and holders
          for (const tr of this.torches) {
            const holderY = tr.fromTop ? 28 : waterY;
            const beamY = tr.centerY + Math.sin(tr.sweepT * tr.sweepSpd) * tr.sweepAmp;

            // Torch holder on wall
            g.rect(tr.x - 5, tr.fromTop ? 28 : holderY - 14, 10, 14, P.sepiaDk);
            g.rect(tr.x - 2, tr.fromTop ? 20 : holderY - 24, 5, 10, P.sepia);
            const fl = Math.sin(api.t * 9.5 + tr.x * 0.1) > 0.1;
            g.rect(tr.x - 3, tr.fromTop ? 14 : holderY - 32, 6, 7, fl ? P.gold : P.amber);

            // Beam (approximate cone from torch to beamY target)
            const torchY = tr.fromTop ? 30 : holderY - 20;
            c.strokeStyle = 'rgba(248,184,0,.3)';
            c.lineWidth = 16;
            c.lineCap = 'round';
            c.beginPath();
            c.moveTo(tr.x, torchY);
            c.lineTo(135, beamY);
            c.stroke();
            c.lineCap = 'butt';
            c.lineWidth = 1;

            // Danger zone indicator near gondola
            if (tr.x > 98 && tr.x < 172) {
              const dist = Math.abs(this.y - beamY);
              if (dist < 40) {
                g.rect(100, Math.round(beamY) - 2, 70, 4, 'rgba(248,184,0,0.4)');
              }
            }
          }

          // Gondola
          const gx = 135, gy = Math.round(this.y);
          g.rect(gx - 24, gy + 2, 48, 14, P.sepiaDk);
          g.rect(gx - 28, gy - 2, 56, 8,  P.sepia);
          g.rect(gx + 22,  gy - 14, 8, 18, P.sepiaDk);
          g.rect(gx + 24,  gy - 22, 4,  9, P.sepia);
          // Gondolier silhouette (the Phantom)
          g.rect(gx - 10, gy - 26, 20, 26, P.black);
          g.circle(gx, gy - 30, 7, P.black);
          g.rect(gx - 6, gy - 34, 6, 7, P.white); // half-mask
          g.rect(gx - 6, gy - 36, 3, 3, P.black);
          g.rect(gx + 4, gy - 28, 2, 38, P.gray);  // pole

          api.topBar('CATACOMBS');
          const bw = W - 52;
          g.rect(W - bw - 6, 20, bw, 6, '#000820');
          g.rect(W - bw - 6, 20, bw * clamp(this.timer / 25, 0, 1), 6, P.waterLt);
          api.txt('LIFE', 6, 20, 9, P.ltGray);
          for (let i = 0; i < 3; i++) {
            g.rect(6 + i * 14, 30, 10, 8, i < (3 - this.hits) ? P.amber : '#280000');
          }
          api.vignette();
        },
      },

      /* ====================== SCENE 5: MOB CHASE ==================== */
      {
        id: 'mobchase', name: 'MOB CHASE', sub: 'INTO THE NIGHT',
        icon: iconMob,
        intro: [
          'THE MOB FLOODS',
          'THE PARIS STREETS.',
          'The Phantom flees toward',
          'the dark river below.',
        ],
        quote: '"To the river! After him! The Phantom of the Opera!"',
        help: 'STEER left/right · DODGE the cobblestones · escape the mob',
        winText: 'The Phantom vanishes into the catacombs. The mob howls at empty darkness.',
        loseText: 'Cobblestones and torches close in. The Phantom falls at last.',
        init(api) {
          this.x = api.W / 2;
          this.timer = 24;
          this.hits = 0;
          this.maxHits = 4;
          this.stones = [];
          this.spawnT = 0.62;
          this.speed = 2.4;
          this.mobX = api.W + 60;
          this.scroll = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.speed = Math.min(4.4, this.speed + dt * 0.05);
          this.scroll += 1.8 * f;
          this.mobX = Math.max(api.W - 55, this.mobX - 0.35 * f);

          if (api.pointer.down) this.x += (api.pointer.x < api.W / 2 ? -1 : 1) * 4.5 * f;
          if (api.keyDown('left'))  this.x -= 4.2 * f;
          if (api.keyDown('right')) this.x += 4.2 * f;
          this.x = clamp(this.x, 16, api.W - 16);

          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.34, 0.74);
            this.stones.push({
              x: api.rnd(16, api.W - 16), y: -18,
              vy: this.speed,
            });
          }

          const pY = api.H - 64;
          this.stones = this.stones.filter(st => {
            st.y += st.vy * f;
            if (st.y > api.H + 24) return false;
            if (!st.hit && Math.abs(st.x - this.x) < 16 && Math.abs(st.y - pY) < 18) {
              st.hit = true;
              this.hits++;
              api.audio.sfx('hurt'); api.shake(5, 0.2); api.flash(P.ltGray, 0.14);
              if (this.hits >= this.maxHits) { api.lose(); return false; }
            }
            return !st.hit;
          });

          if (this.timer <= 0) { api.score += 150; api.win(); }
          api.score = Math.floor(Math.max(0, 24 - this.timer) * 7);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Night Paris
          g.rect(0, 0, W, H, '#060208');
          g.rect(0, 0, W, Math.round(H * 0.30), '#040008');

          // Stars
          const stars = [[22,8],[68,5],[112,12],[158,7],[202,11],[240,6],[44,20],[134,17],[190,24]];
          for (const [sx, sy] of stars) {
            g.rect(sx, sy, 2, 2, Math.sin(api.t * 1.5 + sx * 0.1) > 0.3 ? P.white : P.ltGray);
          }

          // Paris skyline silhouette
          const skyline = [[0,0.30,38,0.14],[42,0.30,34,0.18],[80,0.30,26,0.12],[110,0.30,52,0.20],[166,0.30,30,0.15],[200,0.30,70,0.16]];
          for (const [bx, by, bw, bh] of skyline) {
            g.rect(bx, Math.round(H * by - H * bh), bw, Math.round(H * bh), '#0A0614');
          }

          // Cobblestone street (scrolling)
          const streetY = Math.round(H * 0.64);
          g.rect(0, streetY, W, H - streetY, '#0C0810');
          const off = this.scroll % 28;
          for (let sy = streetY; sy < H; sy += 18) {
            for (let sx = -off; sx < W + 28; sx += 28) {
              g.rect(sx, sy, 26, 16, '#0A0608');
              g.rectO(sx, sy, 26, 16, '#181010', 1);
            }
          }

          // Thrown cobblestones
          for (const st of this.stones) {
            g.rect(st.x - 8, st.y - 7, 16, 14, P.dkGray);
            g.rectO(st.x - 8, st.y - 7, 16, 14, P.gray, 1);
            g.rect(st.x - 3, st.y - 3, 6, 1, P.gray);
          }

          // Angry mob (right side, with torches)
          const mobY = H - 72;
          for (let mi = 0; mi < 6; mi++) {
            const mx = Math.round(this.mobX) + mi * 14;
            const mh = 22 + (mi * 5) % 12;
            g.circle(mx, mobY - mh, 5, P.sepia);
            g.rect(mx - 4, mobY - mh + 4, 8, mh, P.gray);
            if (mi % 2 === 0) {
              g.rect(mx + 3, mobY - mh - 8, 2, 12, P.sepia);
              const fl = Math.sin(api.t * 8.5 + mi) > 0;
              g.rect(mx + 2, mobY - mh - 14, 4, 7, fl ? P.gold : P.amber);
            }
          }

          // The Phantom fleeing (left side)
          const px = Math.round(this.x), py = H - 64;
          g.rect(px - 18, py - 6, 36, 18, '#0A0000');  // cape
          g.rect(px - 12, py - 20, 24, 22, P.black);    // body
          g.circle(px, py - 26, 9, P.black);             // head
          g.rect(px - 9, py - 31, 9, 8, P.white);        // half-mask
          g.rect(px - 9, py - 33, 4, 3, P.black);        // eye

          api.topBar('MOB CHASE');
          const bw = W - 52;
          g.rect(W - bw - 6, 20, bw, 6, '#080008');
          g.rect(W - bw - 6, 20, bw * clamp(this.timer / 24, 0, 1), 6, P.purple);
          api.txt('LIFE', 6, 20, 9, P.ltGray);
          for (let i = 0; i < 4; i++) {
            g.rect(6 + i * 13, 30, 10, 8, i < (4 - this.hits) ? P.red : '#280000');
          }
          api.vignette(); api.scanlines();
        },
      },

    ],
  });
})();
