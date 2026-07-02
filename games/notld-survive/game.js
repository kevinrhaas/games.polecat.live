/* ============================================================================
 * NIGHT OF THE LIVING DEAD — THEY'RE COMING
 * Five ordeals from Romero's 1968 horror masterpiece:
 *   1. THE CEMETERY      — dodge the dead fleeing to the farmhouse (20s)
 *   2. BOARD THE WINDOWS — tap 3 windows to nail boards before breach (26s)
 *   3. GATHER SUPPLIES   — catch 15 supplies, dodge zombie hands (catcher)
 *   4. THE NIGHT SIEGE   — hold 3 breach points against the growing horde (26s)
 *   5. DAWN ESCAPE       — guide Ben through the zombie field to the light
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;
  const rand  = Retro.util.rand;
  const randI = Retro.util.randInt;

  /* ── Noir horror palette: charcoal/bone/blood + amber lantern ── */
  const C = {
    black:   '#050504',
    pit:     '#0c0a08',
    dark:    '#161412',
    plank:   '#1e1a14',
    wood:    '#2e2618',
    grain:   '#3c3020',
    shadow:  '#2a2820',
    grey:    '#504840',
    ash:     '#706858',
    bone:    '#a09080',
    pale:    '#c8c0a8',
    white:   '#e0d8c0',
    blood:   '#cc1122',
    bloodD:  '#880a14',
    crimson: '#ff2233',
    amber:   '#c88820',
    amberL:  '#f0c840',
    lantern: '#e08810',
    grass:   '#283820',
    sickly:  '#708040',
    flesh:   '#6a5438',
  };

  /* ── Helper: draw a zombie silhouette ── */
  function drawZombie(g, c, x, y, alpha) {
    c.globalAlpha = alpha || 1;
    g.rect(x - 7, y - 22, 14, 18, C.sickly);
    g.circle(x, y - 30, 9, C.flesh);
    g.rect(x - 4, y - 34, 8, 6, C.dark);
    g.rect(x - 16, y - 20, 8, 3, C.sickly);
    g.rect(x + 8,  y - 20, 8, 3, C.sickly);
    g.rect(x - 5,  y - 4,  4, 14, C.sickly);
    g.rect(x + 1,  y - 4,  4, 14, C.sickly);
    g.circle(x - 3, y - 32, 2, C.white);
    g.circle(x + 3, y - 32, 2, C.white);
    g.rect(x - 1, y - 30, 2, 3, C.blood);
    c.globalAlpha = 1;
  }

  /* ── Helper: draw a gravestone ── */
  function drawGrave(g, c, x, y, w, h) {
    g.rect(x, y, w, h, C.shadow);
    g.circle(x + w / 2, y, w / 2, C.grey);
    g.rect(x + w * 0.35, y - 6, w * 0.3, 6, C.grey);
    g.rect(x + w * 0.1, y - 1, w * 0.8, 2, C.grey);
  }

  /* ── Emblem: zombie hand through a boarded window ── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    g.rect(cx - 26, cy - 30, 52, 56, C.wood);
    g.rect(cx - 23, cy - 27, 46, 50, C.pit);
    for (let b = 0; b < 3; b++) {
      g.rect(cx - 26, cy - 18 + b * 15, 52, 8, C.wood);
      g.circle(cx - 20, cy - 14 + b * 15, 2, C.grey);
      g.circle(cx + 20, cy - 14 + b * 15, 2, C.grey);
    }
    // Zombie hand bursting through top gap
    g.rect(cx - 5, cy - 30, 12, 16, C.sickly);
    g.rect(cx - 9, cy - 38, 4, 12, C.sickly);
    g.rect(cx - 4, cy - 40, 4, 14, C.sickly);
    g.rect(cx + 1, cy - 40, 4, 14, C.sickly);
    g.rect(cx + 6, cy - 37, 4, 11, C.sickly);
    g.rect(cx - 2, cy - 32, 2, 7, C.blood);
  }

  /* ── Scenery ── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'boot' || scene === 'menu') {
      c.fillStyle = C.black; c.fillRect(0, 0, W, H);
      // Stars
      for (let i = 0; i < 28; i++) {
        const sx = (i * 97 + 13) % W, sy = (i * 61 + 7) % (H * 0.44);
        c.globalAlpha = 0.16 + (i % 4) * 0.06;
        c.fillStyle = C.pale; c.fillRect(sx, sy, 1 + (i % 2), 1);
      }
      c.globalAlpha = 1;
      // Ground
      c.fillStyle = C.grass; c.fillRect(0, H * 0.55, W, H * 0.45);
      c.fillStyle = C.dark;  c.fillRect(0, H * 0.55, W, 3);
      // Farmhouse silhouette
      const fy = Math.floor(H * 0.55);
      c.fillStyle = C.plank; c.fillRect(38, fy - 88, 194, 88);
      c.fillStyle = C.dark;
      c.beginPath(); c.moveTo(28, fy - 88); c.lineTo(135, fy - 136); c.lineTo(242, fy - 88); c.closePath(); c.fill();
      // Door ajar
      c.fillStyle = C.pit; c.fillRect(113, fy - 46, 24, 46);
      c.fillStyle = C.dark; c.fillRect(113, fy - 46, 4, 46);
      // Boarded windows
      for (let wi = 0; wi < 2; wi++) {
        const wx = 62 + wi * 106;
        c.fillStyle = C.pit; c.fillRect(wx, fy - 72, 28, 22);
        c.fillStyle = C.wood;
        c.fillRect(wx, fy - 68, 28, 5); c.fillRect(wx, fy - 58, 28, 5);
        g.circle(wx + 2, fy - 66, 2, C.grey); g.circle(wx + 26, fy - 66, 2, C.grey);
      }
      // Dead trees
      c.fillStyle = C.dark;
      c.fillRect(10, fy - 68, 5, 68); c.fillRect(0, fy - 50, 24, 3); c.fillRect(4, fy - 40, 18, 2);
      c.fillRect(252, fy - 62, 5, 62); c.fillRect(244, fy - 44, 22, 3);
      // Shuffling zombies
      for (let i = 0; i < 6; i++) {
        const zx = ((t * (12 + i * 6) * (i % 2 === 0 ? 1 : -1) + i * 55 + 20) % (W + 44)) - 22;
        const zy = fy + 16 + (i * 19) % 32;
        drawZombie(g, c, zx, zy, 0.6);
      }
      return;
    }

    // Intro/result/finale: dark farmhouse interior
    c.fillStyle = C.pit; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {
      c.fillStyle = i % 2 === 0 ? C.dark : C.plank;
      c.fillRect(0, H * 0.72 + i * 10, W, 10);
    }
    c.globalAlpha = 0.07; c.fillStyle = C.amberL;
    c.beginPath(); c.arc(W - 15, 15, 70, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(5,4,3,.88)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ── Menu card layout: farmhouse floor plan ── */
  const CARD_LAYOUT = [
    { x: 15,  y: 78,  w: 240, h: 52 }, // Ch1 — cemetery (outside)
    { x: 15,  y: 150, w: 108, h: 76 }, // Ch2 — front room (L)
    { x: 147, y: 150, w: 108, h: 76 }, // Ch3 — storage room (R)
    { x: 15,  y: 244, w: 240, h: 66 }, // Ch4 — night siege (full)
    { x: 15,  y: 328, w: 240, h: 72 }, // Ch5 — dawn escape
  ];

  RetroSaga.create({
    id:       'notld',
    title:    "THEY'RE COMING",
    subtitle: 'TO GET YOU',
    currency: 'GUTS',
    accent:   C.blood,
    credit:   'AFTER GEORGE ROMERO · 1968',
    emblem,
    scenery,
    bootCta:   'TAP TO ENTER THE FARMHOUSE',
    menuLabel: "THEY'RE COMING",
    menuHint:  'CHOOSE YOUR ORDEAL',
    menuDone:  'THE NIGHT IS SURVIVED.',
    screens: {
      win:          C.white,
      lose:         C.blood,
      chapterLabel: C.bone,
      name:         C.white,
      sub:          C.ash,
      intro:        C.pale,
      quote:        C.grey,
      help:         C.bone,
      score:        C.white,
      cur:          C.blood,
      cta:          C.white,
      overlay:      'rgba(5,4,3,.92)',
    },
    labels: {
      chapter: 'NIGHT',
      score:   'SURVIVED',
      win:     'THE DEAD ARE HELD BACK.',
      lose:    'THE DEAD GOT IN.',
      cont:    'TAP TO PUSH ON',
      finale:  'TAP FOR THE ENDING',
      toMenu:  'BACK TO THE FARMHOUSE',
      play:    'TAP TO SURVIVE',
    },

    menu: {
      colors: { bg: C.black, title: C.white, label: C.bone, cur: C.blood },
      title(api, currency) {
        const g = api.gfx, c = api.ctx, W = api.W;
        // Plank-board header
        for (let i = 0; i < 5; i++) {
          c.fillStyle = i % 2 === 0 ? C.plank : C.dark;
          c.fillRect(0, i * 14, W, 14);
        }
        // Faint caution-stripe overlay
        c.globalAlpha = 0.1;
        c.fillStyle = C.amber;
        for (let i = -4; i < 16; i++) c.fillRect(i * 28 - 10, 0, 14, 70);
        c.globalAlpha = 1;
        api.txtCFit("THEY'RE COMING", W / 2, 18, 9, C.blood, true, W - 20);
        api.txtCFit('GUTS: ' + currency, W / 2, 40, 7, C.amber, true, W - 20);
        api.txtCFit('NIGHT OF THE LIVING DEAD  ·  1968', W / 2, 59, 5, C.ash, true, W - 20);
        // Farmhouse wall outline
        c.strokeStyle = C.wood; c.lineWidth = 3;
        c.strokeRect(12, 142, 246, 188);
        // Interior dividers
        c.strokeStyle = C.grain; c.lineWidth = 2;
        c.beginPath(); c.moveTo(135, 142); c.lineTo(135, 234); c.stroke();
        c.beginPath(); c.moveTo(12, 234); c.lineTo(258, 234); c.stroke();
        c.beginPath(); c.moveTo(12, 318); c.lineTo(258, 318); c.stroke();
        // Section labels
        api.txtCFit('— CEMETERY · OUTSIDE —', W / 2, 74, 5, C.ash, true, 240);
        api.txtCFit('— FARMHOUSE · INSIDE —', W / 2, 139, 5, C.grey, true, 240);
        api.txtCFit('— THE NIGHT —', W / 2, 240, 5, C.grey, true, 160);
        api.txtCFit('— DAWN —', W / 2, 315, 5, C.grey, true, 120);
        // Corner nails
        [[12,142],[258,142],[12,330],[258,330],[135,142],[135,234],[12,234],[258,234]].forEach(function(pt) {
          g.circle(pt[0], pt[1], 2, C.grey);
        });
      },
      layout() { return CARD_LAYOUT; },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const ch = info.ch, x = info.x, y = info.y, w = info.w, h = info.h;
        const sel = info.sel, done = info.done;
        const cx = x + w / 2, cy = y + h / 2;
        // Background
        c.fillStyle = sel ? C.plank : (done ? '#161210' : C.pit);
        c.fillRect(x, y, w, h);
        // Plank grain
        c.globalAlpha = 0.22;
        for (let pi = 1; pi < 4; pi++) {
          c.fillStyle = C.grain; c.fillRect(x, y + pi * (h / 4), w, 1);
        }
        c.globalAlpha = 1;
        // Border
        c.strokeStyle = sel ? C.blood : (done ? C.amber : C.wood);
        c.lineWidth = sel ? 2 : 1;
        c.strokeRect(x + 1, y + 1, w - 2, h - 2);
        if (sel) {
          c.globalAlpha = 0.1; c.fillStyle = C.blood; c.fillRect(x, y, w, h);
          c.globalAlpha = 1;
        }
        if (ch.icon) ch.icon(api, cx, cy - 9);
        api.txtCFit(ch.name, cx, cy + 14, 6, sel ? C.white : (done ? C.pale : C.bone), true, w - 16);
        if (done) api.txtC('✓', x + w - 11, y + 11, 8, C.amber, true);
        if (sel) {
          g.rect(cx - 1, y, 2, 7, C.blood);
          g.circle(cx, y + 9, 3, C.blood);
        }
      },
    },

    finale: [
      'AS THE SUN ROSE',
      'OVER THE HOLLOW,',
      'YOU STOOD AMONG',
      'THE ASHES OF THE NIGHT.',
      '',
      '"They\'re dead. They\'re',
      ' all messed up."',
      '',
      'THE DEAD WILL NOT',
      'RISE AGAIN.',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ================================================================
       * 1. THE CEMETERY — dodge zombies, steer left/right, 20s survive
       * ================================================================ */
      {
        id:   'cemetery',
        name: 'THE CEMETERY',
        sub:  "BARBRA'S RUN",
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          drawGrave(g, c, x - 14, y - 14, 11, 16);
          drawGrave(g, c, x + 2,  y - 16, 13, 18);
          // cross on right grave
          g.rect(x + 7, y - 18, 2, 9, C.grey);
          g.rect(x + 5, y - 15, 6, 2, C.grey);
        },
        intro: [
          'BARBRA AND JOHNNY',
          'VISIT THEIR FATHER\'S',
          'GRAVE IN THE COUNTRY.',
          'A SHAMBLING FIGURE',
          'EMERGES FROM THE DARK.',
          'RUN.',
        ],
        quote: '"They\'re coming to get you, Barbra." — Johnny, 1968',
        help:  'DRAG left/right — dodge the dead, reach the farmhouse!',
        winText:  'Barbra burst through the farmhouse door and bolted it shut.',
        loseText: 'The dead pulled her down among the headstones.',
        init(api) {
          this.bx     = api.W / 2;
          this.lives  = 3;
          this.timer  = 0;
          this.dur    = 20;
          this.zoms   = [];
          this.spawnT = 0;
          this.invT   = 0;
          this.graves = [];
          for (let i = 0; i < 10; i++) {
            this.graves.push({ x: randI(8, 262), y: randI(60, 350), w: 8 + randI(0, 9), h: 12 + randI(0, 11) });
          }
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer += dt;
          if (this.invT > 0) this.invT -= dt;
          if (this.timer >= this.dur) { api.addScore(120); api.win(); return; }
          // Steer
          if (api.pointer.down) this.bx = clamp(api.pointer.x, 28, W - 28);
          if (api.keyDown('left'))  this.bx = clamp(this.bx - 180 * dt, 28, W - 28);
          if (api.keyDown('right')) this.bx = clamp(this.bx + 180 * dt, 28, W - 28);
          // Spawn
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.72, 2.0 - this.timer * 0.05);
            this.zoms.push({ x: 20 + randI(0, W - 40), y: -32, spd: 58 + randI(0, 28) + this.timer * 2.2 });
          }
          for (let z of this.zoms) z.y += z.spd * dt;
          this.zoms = this.zoms.filter(function(z) { return z.y < H + 34; });
          // Collision
          if (this.invT <= 0) {
            const by = H - 55;
            for (let z of this.zoms) {
              if (Math.abs(z.x - this.bx) < 22 && Math.abs(z.y - by) < 22) {
                this.lives--;
                this.invT = 1.5;
                api.shake(7, 0.3); api.flash(C.blood, 0.2); api.audio.sfx('hurt');
                api.burst(this.bx, by, C.blood, 9);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = C.black; c.fillRect(0, 0, W, H);
          // Moon
          c.globalAlpha = 0.5; c.fillStyle = C.pale;
          c.beginPath(); c.arc(W * 0.8, 30, 18, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 0.15; c.fillStyle = C.white;
          c.beginPath(); c.arc(W * 0.8, 30, 32, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          // Ground
          c.fillStyle = C.grass; c.fillRect(0, H * 0.72, W, H * 0.28);
          c.fillStyle = C.dark;  c.fillRect(0, H * 0.72, W, 2);
          // Gravel path
          c.fillStyle = C.shadow; c.fillRect(W / 2 - 28, 0, 56, H);
          // Graves
          for (let gr of this.graves) drawGrave(g, c, gr.x, gr.y, gr.w, gr.h);
          // Zombies
          for (let z of this.zoms) drawZombie(g, c, z.x, z.y, 1);
          // Barbra
          const by = H - 55;
          if (this.invT <= 0 || Math.floor(this.invT * 10) % 2 === 0) {
            g.circle(this.bx, by - 24, 8, C.pale);
            g.rect(this.bx - 6, by - 16, 12, 16, C.grey);
            g.rect(this.bx - 5, by,       4, 14, C.dark);
            g.rect(this.bx + 1, by,       4, 14, C.dark);
            const arm = Math.sin(this.timer * 8) * 8;
            g.rect(this.bx - 14, by - 14 + arm, 8, 3, C.grey);
            g.rect(this.bx + 6,  by - 14 - arm, 8, 3, C.grey);
          }
          api.topBar('TIME: ' + Math.max(0, Math.ceil(this.dur - this.timer)) + 's');
          for (let li = 0; li < 3; li++) {
            g.circle(W - 38 + li * 13, 20, 4, li < this.lives ? C.blood : C.dark);
          }
          api.vignette();
        },
      },

      /* ================================================================
       * 2. BOARD THE WINDOWS — tap 3 windows before they breach, 26s
       * ================================================================ */
      {
        id:   'windows',
        name: 'BOARD THE WINDOWS',
        sub:  'NAIL EVERY BOARD',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 14, y - 14, 28, 22, C.wood);
          g.rect(x - 12, y - 12, 24, 18, C.pit);
          g.rect(x - 14, y - 7,  28, 6, C.wood);
          g.rect(x - 14, y + 2,  28, 6, C.wood);
          g.circle(x - 10, y - 5, 2, C.grey);
          g.circle(x + 10, y - 5, 2, C.grey);
        },
        intro: [
          'BEN FINDS THE',
          'FARMHOUSE.',
          'THE DEAD CIRCLE IT.',
          'NAIL BOARDS OVER',
          'EVERY WINDOW',
          'BEFORE THEY GET IN.',
        ],
        quote: '"We\'ve got to board up all the doors and windows." — Ben, 1968',
        help:  'TAP a window to hammer boards — don\'t let 3 breach!',
        winText:  'The last board was nailed. The farmhouse held against the night.',
        loseText: 'Too many windows fell. The dead poured through.',
        init(api) {
          this.lives  = 3;
          this.timer  = 0;
          this.dur    = 26;
          // Three windows: left, center, right
          this.wins = [
            { x: 20,  y: 138, w: 68, h: 108, hp: 100, breached: false, bTimer: 0 },
            { x: 101, y: 126, w: 68, h: 118, hp: 100, breached: false, bTimer: 0 },
            { x: 182, y: 138, w: 68, h: 108, hp: 100, breached: false, bTimer: 0 },
          ];
          this.active    = [false, false, false];
          this.scheduleT = 0;
        },
        update(api, dt) {
          this.timer += dt;
          if (this.timer >= this.dur) { api.addScore(100); api.win(); return; }

          // Activate zombies on schedule
          this.scheduleT -= dt;
          if (this.scheduleT <= 0) {
            const inactive = [];
            for (let i = 0; i < 3; i++) {
              if (!this.active[i] && !this.wins[i].breached) inactive.push(i);
            }
            if (inactive.length > 0) {
              this.active[inactive[randI(0, inactive.length - 1)]] = true;
            }
            const minActive = Math.min(3, 1 + Math.floor(this.timer / 8));
            const nowActive = this.active.filter(Boolean).length;
            this.scheduleT = nowActive < minActive ? 0.4 : Math.max(1.6, 4.5 - this.timer * 0.1);
          }

          // Drain / repair windows
          const drain = 12 + this.timer * 0.7;
          for (let i = 0; i < 3; i++) {
            const w = this.wins[i];
            if (w.breached) {
              w.bTimer -= dt;
              if (w.bTimer <= 0) { w.breached = false; w.hp = 55; }
              continue;
            }
            if (this.active[i]) {
              w.hp -= drain * dt;
              if (w.hp <= 0) {
                w.hp = 0; w.breached = true; w.bTimer = 2.0;
                this.active[i] = false;
                this.lives--;
                api.shake(9, 0.38); api.flash(C.blood, 0.28); api.audio.sfx('hurt');
                api.burst(w.x + w.w / 2, w.y + w.h * 0.4, C.blood, 14);
                if (this.lives <= 0) { api.lose(); return; }
              }
            } else {
              w.hp = Math.min(100, w.hp + 3.5 * dt);
            }
          }

          // Tap to board
          if (api.pointer.justDown) {
            for (let i = 0; i < 3; i++) {
              const w = this.wins[i];
              if (w.breached) continue;
              if (api.pointer.x >= w.x && api.pointer.x <= w.x + w.w &&
                  api.pointer.y >= w.y && api.pointer.y <= w.y + w.h) {
                w.hp = Math.min(100, w.hp + 44);
                if (this.active[i]) {
                  this.active[i] = false;
                  this.scheduleT = Math.max(0.3, this.scheduleT - 0.4);
                }
                api.audio.sfx('shoot');
                api.burst(w.x + w.w / 2, w.y + w.h * 0.4, C.amber, 5);
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = C.dark; c.fillRect(0, 0, W, H);
          // Paneled wall
          for (let pi = 0; pi < 12; pi++) {
            c.fillStyle = pi % 2 === 0 ? C.plank : C.dark;
            c.fillRect(0, 110 + pi * 32, W, 32);
          }
          c.fillStyle = C.shadow; c.fillRect(0, 110, W, 3);
          // Floor
          for (let fi = 0; fi < 6; fi++) {
            c.fillStyle = fi % 2 === 0 ? C.grain : C.wood;
            c.fillRect(0, H - 55 + fi * 9, W, 9);
          }
          // Lantern glow
          c.globalAlpha = 0.13; c.fillStyle = C.amberL;
          c.beginPath(); c.arc(W / 2, H - 55, 120, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;

          // Windows
          for (let i = 0; i < 3; i++) {
            const w = this.wins[i], cx = w.x + w.w / 2;
            g.rect(w.x - 5, w.y - 5, w.w + 10, w.h + 10, C.wood);
            if (w.breached) {
              c.globalAlpha = 0.55 + Math.sin(this.timer * 8) * 0.2;
              c.fillStyle = C.bloodD; c.fillRect(w.x, w.y, w.w, w.h);
              c.globalAlpha = 1;
              api.txtCFit('BREACH!', cx, w.y + w.h / 2, 8, C.crimson, true, w.w);
            } else {
              c.fillStyle = C.pit; c.fillRect(w.x, w.y, w.w, w.h);
              // Zombie visible at window when active
              if (this.active[i]) {
                const shk = Math.sin(this.timer * 14) * 2;
                drawZombie(g, c, cx + shk, w.y + w.h * 0.45, 1);
              }
              // Boards: hp determines how many boards are intact
              const boards = Math.ceil((w.hp / 100) * 4);
              for (let b = 0; b < 4; b++) {
                const by2 = w.y + 10 + b * ((w.h - 20) / 3);
                g.rect(w.x, by2, w.w, 7, b < boards ? C.wood : C.pit);
                if (b < boards) {
                  g.circle(w.x + 5, by2 + 3, 2, C.grey);
                  g.circle(w.x + w.w - 5, by2 + 3, 2, C.grey);
                }
              }
              // HP bar below window
              const bw = w.w - 8;
              g.rect(w.x + 4, w.y + w.h + 5, bw, 5, C.dark);
              const fill = w.hp / 100;
              g.rect(w.x + 4, w.y + w.h + 5, bw * fill, 5,
                fill > 0.5 ? C.bone : (fill > 0.25 ? C.amber : C.blood));
            }
          }
          api.topBar('TIME: ' + Math.max(0, Math.ceil(this.dur - this.timer)) + 's');
          for (let li = 0; li < 3; li++) {
            g.circle(W - 38 + li * 13, 20, 4, li < this.lives ? C.blood : C.dark);
          }
          api.vignette();
        },
      },

      /* ================================================================
       * 3. GATHER SUPPLIES — catcher: collect 15 goods, dodge bad items
       * ================================================================ */
      {
        id:   'supplies',
        name: 'GATHER SUPPLIES',
        sub:  'STAY ALIVE INSIDE',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 7, y - 10, 14, 18, C.bone);
          g.rect(x - 7, y - 13, 14, 5, C.ash);
          g.rect(x - 6, y - 4,  12, 2, C.dark);
          g.rect(x + 9, y - 12, 6, 20, C.grey);
          g.circle(x + 12, y - 14, 5, C.amberL);
        },
        intro: [
          'SURVIVORS HUDDLE',
          'IN THE FARMHOUSE.',
          'THEY NEED FOOD,',
          'FUEL, AND FLASHLIGHTS.',
          'GRAB WHAT FALLS —',
          'AVOID THE DEAD\'S HANDS.',
        ],
        quote: '"We could last for days in this place." — Ben, 1968',
        help:  'DRAG left/right — catch supplies, avoid zombie hands!',
        winText:  'Enough gathered. The survivors could hold out through the night.',
        loseText: 'The supplies were lost. The night grew longer.',
        init(api) {
          this.benX  = api.W / 2;
          this.lives = 3;
          this.caught = 0;
          this.goal   = 15;
          this.items  = [];
          this.spawnT = 0;
          this.timer  = 0;
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer += dt;
          if (api.pointer.down) this.benX = clamp(api.pointer.x, 24, W - 24);
          if (api.keyDown('left'))  this.benX = clamp(this.benX - 195 * dt, 24, W - 24);
          if (api.keyDown('right')) this.benX = clamp(this.benX + 195 * dt, 24, W - 24);

          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            const bad = Math.random() < 0.26;
            const kinds = bad ? ['hand', 'glass'] : ['can', 'fuel', 'torch'];
            this.items.push({
              x: 20 + randI(0, W - 40), y: -22,
              spd: 76 + randI(0, 38) + this.timer * 1.4,
              bad: bad,
              kind: kinds[randI(0, kinds.length - 1)],
            });
            this.spawnT = Math.max(0.52, 1.38 - this.timer * 0.018);
          }
          for (let it of this.items) it.y += it.spd * dt;

          const benY = H - 52;
          this.items = this.items.filter(function(it) {
            if (it.y >= H + 20) return false;
            if (Math.abs(it.x - this.benX) < 26 && Math.abs(it.y - benY) < 22) {
              if (it.bad) {
                this.lives--;
                api.shake(6, 0.25); api.flash(C.blood, 0.2); api.audio.sfx('hurt');
                api.burst(it.x, benY, C.blood, 8);
                if (this.lives <= 0) { api.lose(); return false; }
              } else {
                this.caught++;
                api.audio.sfx('coin');
                api.burst(it.x, benY, C.amber, 6);
                api.addScore(8);
                if (this.caught >= this.goal) { api.addScore(100); api.win(); return false; }
              }
              return false;
            }
            return true;
          }, this);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = C.dark; c.fillRect(0, 0, W, H);
          // Shelves
          for (let si = 0; si < 3; si++) g.rect(0, 75 + si * 90, W, 5, C.wood);
          // Floor
          for (let fi = 0; fi < 5; fi++) {
            c.fillStyle = fi % 2 === 0 ? C.grain : C.plank;
            c.fillRect(0, H - 45 + fi * 9, W, 9);
          }
          c.globalAlpha = 0.14; c.fillStyle = C.amberL;
          c.beginPath(); c.arc(W / 2, H / 2, 100, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;

          // Items
          for (let it of this.items) {
            if (it.kind === 'hand') {
              g.rect(it.x - 5, it.y - 18, 12, 22, C.sickly);
              g.rect(it.x - 9, it.y - 24, 4, 10, C.sickly);
              g.rect(it.x - 4, it.y - 26, 4, 12, C.sickly);
              g.rect(it.x + 1, it.y - 26, 4, 12, C.sickly);
              g.rect(it.x + 5, it.y - 23, 4, 9,  C.sickly);
              g.rect(it.x - 2, it.y - 18, 2, 6, C.blood);
            } else if (it.kind === 'glass') {
              c.fillStyle = C.blood; c.globalAlpha = 0.75;
              c.beginPath();
              c.moveTo(it.x, it.y - 10); c.lineTo(it.x + 9, it.y);
              c.lineTo(it.x - 5, it.y + 5); c.lineTo(it.x - 9, it.y - 7);
              c.closePath(); c.fill(); c.globalAlpha = 1;
            } else if (it.kind === 'can') {
              g.rect(it.x - 7, it.y - 11, 14, 18, C.bone);
              g.rect(it.x - 7, it.y - 13, 14, 5, C.ash);
              g.rect(it.x - 6, it.y - 4,  12, 2, C.dark);
            } else if (it.kind === 'fuel') {
              g.rect(it.x - 8, it.y - 13, 16, 20, C.grey);
              g.rect(it.x - 4, it.y - 18, 8, 7, C.ash);
              g.circle(it.x, it.y - 8, 4, C.dark);
            } else {
              // torch/flashlight
              g.rect(it.x - 3, it.y - 15, 6, 22, C.grey);
              g.circle(it.x, it.y - 17, 6, C.amberL);
              c.globalAlpha = 0.14; c.fillStyle = C.amberL;
              c.beginPath(); c.arc(it.x, it.y - 17, 14, 0, Math.PI * 2); c.fill();
              c.globalAlpha = 1;
            }
          }

          // Ben (basket character)
          const benY = H - 52;
          g.circle(this.benX, benY - 22, 9, C.pale);
          g.rect(this.benX - 8, benY - 14, 16, 18, C.dark);
          g.rect(this.benX - 6, benY + 4,  5, 14, C.shadow);
          g.rect(this.benX + 1, benY + 4,  5, 14, C.shadow);
          g.rect(this.benX - 17, benY - 12, 9, 3, C.dark);
          g.rect(this.benX + 8,  benY - 12, 9, 3, C.dark);

          api.topBar(this.caught + ' / ' + this.goal + ' SUPPLIES');
          for (let li = 0; li < 3; li++) {
            g.circle(W - 38 + li * 13, 20, 4, li < this.lives ? C.blood : C.dark);
          }
          api.vignette();
        },
      },

      /* ================================================================
       * 4. THE NIGHT SIEGE — hold 3 breach points for 26s
       * ================================================================ */
      {
        id:   'siege',
        name: 'THE NIGHT SIEGE',
        sub:  'HOLD THE LINE',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 11, y - 15, 22, 26, C.wood);
          g.circle(x + 7, y - 2, 2, C.grey);
          g.rect(x - 16, y - 11, 6, 3, C.sickly);
          g.rect(x + 10,  y - 11, 6, 3, C.sickly);
          g.rect(x - 16, y - 7,  6, 3, C.sickly);
          g.rect(x + 10,  y - 7,  6, 3, C.sickly);
        },
        intro: [
          'AS NIGHT DEEPENS,',
          'THE HORDE GROWS.',
          'THREE BREACH POINTS.',
          'TAP EACH SURGE',
          'TO PUSH THEM BACK.',
          'HOLD UNTIL DAWN.',
        ],
        quote: '"There\'s no stopping them — more of them every hour." — Ben, 1968',
        help:  'TAP a surging door/window to push the horde back!',
        winText:  'The horde ebbed as the night wore on. You held every breach point.',
        loseText: 'They broke through. The farmhouse fell to the dead.',
        init(api) {
          this.lives = 3;
          this.timer = 0;
          this.dur   = 26;
          this.pts = [
            { x: 18,  y: 138, w: 70, h: 112, pressure: 0, bTimer: 0, label: 'WINDOW' },
            { x: 100, y: 120, w: 70, h: 122, pressure: 0, bTimer: 0, label: 'DOOR'   },
            { x: 182, y: 138, w: 70, h: 112, pressure: 0, bTimer: 0, label: 'WINDOW' },
          ];
          this.zOffsets = [0, 0, 0];
        },
        update(api, dt) {
          this.timer += dt;
          if (this.timer >= this.dur) { api.addScore(120); api.win(); return; }

          const rate = 15 + this.timer * 0.55;
          for (let i = 0; i < 3; i++) {
            const p = this.pts[i];
            if (p.bTimer > 0) { p.bTimer -= dt; continue; }
            const mult = i === 1 ? 1.25 : 1.0;
            p.pressure = Math.min(100, p.pressure + rate * mult * dt);
            if (p.pressure >= 100) {
              p.pressure = 0; p.bTimer = 1.6;
              this.lives--;
              api.shake(10, 0.42); api.flash(C.blood, 0.32); api.audio.sfx('hurt');
              api.burst(p.x + p.w / 2, p.y + p.h / 2, C.blood, 14);
              if (this.lives <= 0) { api.lose(); return; }
            }
            this.zOffsets[i] = Math.sin(this.timer * 5 + i * 1.1) * 3;
          }

          if (api.pointer.justDown) {
            for (let i = 0; i < 3; i++) {
              const p = this.pts[i];
              if (p.bTimer > 0) continue;
              if (api.pointer.x >= p.x && api.pointer.x <= p.x + p.w &&
                  api.pointer.y >= p.y && api.pointer.y <= p.y + p.h) {
                p.pressure = Math.max(0, p.pressure - 32);
                api.audio.sfx('blip');
                api.burst(p.x + p.w / 2, p.y + p.h * 0.5, C.amber, 7);
                api.shake(3, 0.12);
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = C.black; c.fillRect(0, 0, W, H);
          for (let fi = 0; fi < 5; fi++) {
            c.fillStyle = fi % 2 === 0 ? C.grain : C.wood;
            c.fillRect(0, H - 50 + fi * 10, W, 10);
          }
          c.fillStyle = C.plank; c.fillRect(0, 108, W, H - 158);

          for (let i = 0; i < 3; i++) {
            const p = this.pts[i];
            const cx = p.x + p.w / 2, cy = p.y + p.h * 0.5;
            const danger = p.pressure / 100;
            if (p.bTimer > 0) {
              c.globalAlpha = 0.55 + Math.sin(this.timer * 10) * 0.2;
              c.fillStyle = C.bloodD; c.fillRect(p.x, p.y, p.w, p.h);
              c.globalAlpha = 1;
              api.txtCFit('BREACH!', cx, cy, 8, C.crimson, true, p.w);
            } else {
              const frameC = danger > 0.72 ? C.blood : (danger > 0.42 ? C.amber : C.wood);
              g.rect(p.x - 5, p.y - 5, p.w + 10, p.h + 10, frameC);
              c.fillStyle = C.pit; c.fillRect(p.x, p.y, p.w, p.h);
              // Boards (crack as pressure rises)
              for (let b = 0; b < 4; b++) {
                const bY = p.y + 10 + b * ((p.h - 20) / 3);
                const cracked = danger > b * 0.25;
                g.rect(p.x, bY, p.w, 6, cracked ? (danger > 0.8 ? C.bloodD : C.grain) : C.wood);
                g.circle(p.x + 5, bY + 3, 2, C.grey);
                g.circle(p.x + p.w - 5, bY + 3, 2, C.grey);
              }
              // Zombies visible through boards as pressure rises
              if (danger > 0.18) {
                const zCount = 1 + Math.floor(danger * 2.5);
                for (let zi = 0; zi < zCount; zi++) {
                  const zx = p.x + 12 + zi * ((p.w - 24) / Math.max(1, zCount - 1)) + this.zOffsets[i];
                  c.globalAlpha = 0.4 + danger * 0.45;
                  drawZombie(g, c, zx, p.y + p.h * 0.42, 0.88);
                  c.globalAlpha = 1;
                }
              }
              // Pressure bar
              const bw = p.w - 8;
              g.rect(p.x + 4, p.y - 13, bw, 7, C.dark);
              g.rect(p.x + 4, p.y - 13, bw * danger, 7,
                danger < 0.5 ? C.bone : (danger < 0.75 ? C.amber : C.blood));
              api.txtCFit(p.label, cx, p.y + p.h + 11, 5, C.ash, true, p.w);
            }
          }
          api.topBar('TIME: ' + Math.max(0, Math.ceil(this.dur - this.timer)) + 's');
          for (let li = 0; li < 3; li++) {
            g.circle(W - 38 + li * 13, 20, 4, li < this.lives ? C.blood : C.dark);
          }
          api.vignette();
        },
      },

      /* ================================================================
       * 5. DAWN ESCAPE — guide Ben through the zombie field to the light
       * ================================================================ */
      {
        id:   'escape',
        name: 'DAWN ESCAPE',
        sub:  'INTO THE LIGHT',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.globalAlpha = 0.75; g.circle(x, y - 12, 11, C.amberL);
          c.globalAlpha = 0.25; g.circle(x, y - 12, 17, C.amber);
          c.globalAlpha = 1;
          g.circle(x, y + 7, 5, C.pale);
          g.rect(x - 4, y + 12, 8, 10, C.dark);
          g.rect(x - 8, y + 15, 8, 2, C.dark);
          g.rect(x,     y + 15, 8, 2, C.dark);
        },
        intro: [
          'AS DAWN APPROACHES,',
          'BEN SEES HIS CHANCE.',
          'THE FIELD IS FULL',
          'OF THE DEAD.',
          'REACH THE LIGHT.',
          'DON\'T LOOK BACK.',
        ],
        quote: '"If you stay here, this is going to be your tomb." — Ben, 1968',
        help:  'DRAG to guide Ben — reach the golden dawn at the top!',
        winText:  'Ben ran into the open field as golden light swept across the grass.',
        loseText: 'The dead closed in before the light could reach you.',
        init(api) {
          const W = api.W, H = api.H;
          this.benX  = W / 2;
          this.benY  = H - 62;
          this.lives = 3;
          this.invT  = 0;
          this.timer = 0;
          this.exitY = 55;
          this.zoms  = [];
          for (let i = 0; i < 12; i++) {
            this.zoms.push({
              x: 22 + randI(0, W - 44),
              y: 90 + randI(0, H - 200),
              vx: (Math.random() - 0.5) * 28,
              vy: (Math.random() - 0.5) * 20 + 8,
              wt: 0, wd: 0.8 + Math.random() * 2,
            });
          }
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer += dt;
          if (this.invT > 0) this.invT -= dt;

          // Move Ben
          if (api.pointer.down) {
            const dx = api.pointer.x - this.benX, dy = api.pointer.y - this.benY;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > 5) {
              const spd = Math.min(105, d * 5.5);
              this.benX = clamp(this.benX + (dx / d) * spd * dt, 18, W - 18);
              this.benY = clamp(this.benY + (dy / d) * spd * dt, 30, H - 30);
            }
          }
          if (api.keyDown('left'))  this.benX = clamp(this.benX - 90 * dt, 18, W - 18);
          if (api.keyDown('right')) this.benX = clamp(this.benX + 90 * dt, 18, W - 18);
          if (api.keyDown('up'))    this.benY = clamp(this.benY - 90 * dt, 30, H - 30);
          if (api.keyDown('down'))  this.benY = clamp(this.benY + 90 * dt, 30, H - 30);

          // Win check
          if (this.benY < this.exitY + 28) { api.addScore(140); api.win(); return; }

          // Zombie wander + slow chase
          const chase = Math.min(0.55, this.timer * 0.018);
          for (let z of this.zoms) {
            z.wt += dt;
            if (z.wt > z.wd) {
              z.wt = 0; z.wd = 0.8 + Math.random() * 2;
              z.vx = (Math.random() - 0.5) * 30;
              z.vy = (Math.random() - 0.5) * 22 + 7;
            }
            const dx = this.benX - z.x, dy = this.benY - z.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            z.vx += (dx / d * 20 - z.vx) * chase * dt;
            z.vy += (dy / d * 16 - z.vy) * chase * dt;
            z.x = clamp(z.x + z.vx * dt, 14, W - 14);
            z.y = clamp(z.y + z.vy * dt, 62, H - 18);
          }

          // Collision
          if (this.invT <= 0) {
            for (let z of this.zoms) {
              if (Math.abs(z.x - this.benX) < 20 && Math.abs(z.y - this.benY) < 22) {
                this.lives--;
                this.invT = 1.9;
                api.shake(7, 0.3); api.flash(C.blood, 0.22); api.audio.sfx('hurt');
                api.burst(this.benX, this.benY, C.blood, 10);
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Pre-dawn sky
          const sky = c.createLinearGradient(0, 0, 0, H * 0.5);
          sky.addColorStop(0, C.dark); sky.addColorStop(1, '#2a1800');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.5);
          // Dawn glow strip at top
          c.globalAlpha = 0.55; c.fillStyle = C.amber;
          c.fillRect(0, 0, W, this.exitY + 16);
          c.globalAlpha = 0.22; c.fillStyle = C.amberL;
          c.fillRect(0, 0, W, this.exitY + 38);
          c.globalAlpha = 1;
          // Exit zone
          c.globalAlpha = 0.7; c.fillStyle = C.amberL;
          c.fillRect(0, 0, W, this.exitY);
          c.globalAlpha = 1;
          api.txtCFit('↑ REACH THE DAWN ↑', W / 2, this.exitY + 16, 7, C.amberL, true, W - 18);
          // Ground
          c.fillStyle = C.grass; c.fillRect(0, H * 0.5, W, H * 0.5);
          c.fillStyle = C.dark;  c.fillRect(0, H * 0.5, W, 2);
          // Farmhouse behind
          c.fillStyle = C.dark;
          c.fillRect(72, H - 92, 126, 92);
          c.beginPath(); c.moveTo(62, H - 92); c.lineTo(135, H - 132); c.lineTo(208, H - 92); c.closePath(); c.fill();
          // Zombies
          for (let z of this.zoms) drawZombie(g, c, z.x, z.y, 1);
          // Ben
          if (this.invT <= 0 || Math.floor(this.invT * 10) % 2 === 0) {
            g.circle(this.benX, this.benY - 22, 9, C.pale);
            g.rect(this.benX - 7, this.benY - 14, 14, 18, C.dark);
            g.rect(this.benX - 6, this.benY + 4,  5, 14, C.shadow);
            g.rect(this.benX + 1, this.benY + 4,  5, 14, C.shadow);
            const arm = Math.sin(this.timer * 9) * 10;
            g.rect(this.benX - 16, this.benY - 12 + arm, 9, 3, C.dark);
            g.rect(this.benX + 7,  this.benY - 12 - arm, 9, 3, C.dark);
          }
          for (let li = 0; li < 3; li++) {
            g.circle(W - 38 + li * 13, 20, 4, li < this.lives ? C.blood : C.dark);
          }
          api.vignette();
        },
      },

    ],
  });
})();
