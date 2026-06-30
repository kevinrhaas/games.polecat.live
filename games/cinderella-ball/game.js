/* ============================================================================
 * CINDERELLA — BEFORE MIDNIGHT
 * Five fairy-tale acts through Perrault's Cinderella:
 *   1. MORNING CHORES      — tap tasks before they fade
 *   2. BIBBIDI-BOBBIDI-BOO — catch the Fairy Godmother's sparkles
 *   3. THE ROYAL BALL      — timing wheel: tap when the needle lands in gold
 *   4. MIDNIGHT FLIGHT     — 3-lane dodge: reach the gate before 12 bells
 *   5. THE GLASS SLIPPER   — drag the slipper to Cinderella's foot
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Emblem: glass slipper with sparkles ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    c.globalAlpha = 0.2; c.fillStyle = '#7de0ff';
    c.beginPath(); c.arc(cx, cy + 6, 32, 0, 7); c.fill(); c.globalAlpha = 1;
    // heel
    g.rect(cx - 26, cy + 14, 52, 7, '#5abcdd');
    g.rect(cx - 26, cy + 14, 10, 13, '#4a9ac4');
    // toe box
    g.rect(cx + 2, cy - 4, 24, 20, '#9de8ff');
    g.rect(cx + 5, cy - 1, 17, 14, '#c8f4ff');
    g.rect(cx + 7, cy + 1, 7, 5, '#ffffff');
    // sparkles
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, r = 34;
      g.rect(cx + Math.cos(a) * r - 1, cy + 6 + Math.sin(a) * r - 1, 2, 2, i % 2 === 0 ? '#ffe566' : '#ff9ec4');
    }
  }

  /* ─── Scenery: midnight castle / ballroom ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#070318'); sky.addColorStop(0.55, '#18073a'); sky.addColorStop(1, '#280c5c');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    // stars
    for (let i = 0; i < 58; i++) {
      const sx = (i * 53 + 11) % W, sy = (i * 37 + 5) % Math.floor(H * 0.52);
      c.globalAlpha = 0.2 + 0.6 * Math.abs(Math.sin(t * 1.3 + i * 0.9));
      g.rect(sx, sy, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1, i % 3 === 0 ? '#ffe566' : '#d8ccff');
    }
    c.globalAlpha = 1;
    // moon
    c.fillStyle = '#f0e4bc'; c.beginPath(); c.arc(W - 46, 50, 22, 0, 7); c.fill();
    c.fillStyle = '#18073a'; c.beginPath(); c.arc(W - 36, 42, 18, 0, 7); c.fill();
    // castle
    const baseY = H - 108;
    c.fillStyle = '#0f0626';
    c.fillRect(W / 2 - 26, baseY - 68, 52, 68 + 200);
    for (let bx = 0; bx < 7; bx++) c.fillRect(W / 2 - 26 + bx * 8, baseY - 76, 5, 10);
    c.fillRect(34, baseY - 40, 26, 40 + 200);
    c.fillRect(W - 60, baseY - 40, 26, 40 + 200);
    for (let bx = 0; bx < 4; bx++) {
      c.fillRect(34 + bx * 7, baseY - 46, 4, 8);
      c.fillRect(W - 60 + bx * 7, baseY - 46, 4, 8);
    }
    g.rect(W / 2 - 5, baseY - 52, 10, 13, '#ffe566');
    g.rect(W / 2 - 3, baseY - 50, 6, 9, 'rgba(255,210,80,.45)');
    const grd = c.createLinearGradient(0, baseY, 0, H);
    grd.addColorStop(0, '#1c0e44'); grd.addColorStop(1, '#0c0420');
    c.fillStyle = grd; c.fillRect(0, baseY, W, H - baseY);
    // floating magic dust
    for (let i = 0; i < 16; i++) {
      const bx = ((t * 20 * (i % 2 ? 1 : -1) + i * 41) % (W + 20) + W + 20) % (W + 20) - 10;
      const by = H - 130 - ((i * 41 + t * 20) % (H - 160));
      c.globalAlpha = 0.25 + 0.55 * Math.sin(t * 3.2 + i);
      g.rect(bx, by, 2, 2, i % 2 === 0 ? '#ffe566' : '#ff9ec4');
    }
    c.globalAlpha = 1;

    if (scene === 'menu') {
      // grand ballroom — marble checkerboard floor
      c.globalAlpha = 0.32;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 11; col++) {
          c.fillStyle = (row + col) % 2 === 0 ? '#281450' : '#1a0c3a';
          c.fillRect(col * 28 - 14, H - 130 + row * 16, 28, 16);
        }
      }
      c.globalAlpha = 1;
      // chandelier at top center
      g.rect(W / 2 - 24, 0, 48, 4, '#c890ff');
      g.circle(W / 2, 13, 12, '#ffe566');
      for (let ci = -2; ci <= 2; ci++) {
        g.rect(W / 2 + ci * 11 - 1, 9, 2, 19, '#c890ff');
        g.circle(W / 2 + ci * 11, 30, 5, '#ffe566');
      }
      c.globalAlpha = 0.5;
      for (let ci = 0; ci < 8; ci++) {
        const a2 = ci * Math.PI / 4;
        g.rect(W / 2 + Math.cos(a2) * 30 - 1, 13 + Math.sin(a2) * 18 - 1, 2, 2, '#fff0a0');
      }
      c.globalAlpha = 1;
    } else if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(5,2,16,.70)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Per-chapter icons ─── */
  function iconBroom(api, x, y) {
    const g = api.gfx;
    g.rect(x - 1, y - 9, 2, 14, '#a08060');
    g.rect(x - 6, y + 4, 12, 5, '#c8a870');
    g.rect(x - 8, y + 8, 16, 2, '#b08848');
  }
  function iconWand(api, x, y) {
    const g = api.gfx;
    g.rect(x - 1, y - 9, 2, 17, '#c890ff');
    g.rect(x - 3, y - 12, 6, 5, '#ffe566');
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      g.rect(x + Math.cos(a) * 7 - 1, y - 9 + Math.sin(a) * 5 - 1, 2, 2, '#ffe566');
    }
  }
  function iconCrown(api, x, y) {
    const g = api.gfx;
    g.rect(x - 8, y + 1, 16, 7, '#ffe566');
    g.rect(x - 8, y - 6, 2, 9, '#ffe566');
    g.rect(x - 3, y - 9, 6, 12, '#ffe566');
    g.rect(x + 6, y - 6, 2, 9, '#ffe566');
    g.rect(x - 4, y + 2, 2, 3, '#ff9ec4');
    g.rect(x + 2, y + 2, 2, 3, '#7de0ff');
  }
  function iconClock(api, x, y) {
    const g = api.gfx, c = api.ctx;
    c.fillStyle = '#c890ff'; c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill();
    c.fillStyle = '#0e0428'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
    g.rect(x - 1, y - 5, 2, 6, '#ffe566');
    g.rect(x, y - 1, 5, 2, '#ffe566');
  }
  function iconSlipper(api, x, y) {
    const g = api.gfx;
    g.rect(x - 8, y + 4, 16, 5, '#7de0ff');
    g.rect(x - 8, y + 4, 4, 8, '#5abcdd');
    g.rect(x + 1, y - 3, 7, 8, '#9de8ff');
    g.rect(x + 2, y - 1, 4, 4, '#ffffff');
  }

  RetroSaga.create({
    id: 'cinderella-ball',
    title: 'Cinderella',
    subtitle: 'BEFORE MIDNIGHT',
    credit: 'AN ORIGINAL 8-BIT TRIBUTE · PERRAULT / GRIMM',
    accent: '#ff9ec4',
    currency: 'WISHES',
    bootCta: 'TAP TO STEP FORWARD',
    bootLine: 'FIVE ACTS · ONE ENCHANTED NIGHT',
    menuLabel: 'THE ENCHANTED EVENING',
    menuHint: 'CHOOSE YOUR ACT',
    menuDone: '★ HAPPILY EVER AFTER ★',
    emblem,
    scenery,
    screens: {
      win:          '#ff9ec4',
      lose:         '#9060b8',
      chapterLabel: '#9070b0',
      name:         '#f8eeff',
      sub:          '#c890ff',
      intro:        '#e8d8ff',
      quote:        '#9070b0',
      help:         '#ff9ec4',
      score:        '#f8eeff',
      cur:          '#ff9ec4',
      cta:          '#e8d8ff',
      overlay:      'rgba(5,2,16,.84)',
    },
    labels: {
      chapter: 'ACT',
      score:   'WISHES GRANTED',
      win:     'A DREAM COME TRUE',
      lose:    'THE SPELL IS BROKEN',
      cont:    'TAP TO CONTINUE',
      finale:  'TAP FOR THE FINALE',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO BEGIN',
    },
    finale: [
      'THE CLOCK STRIKES TWELVE.',
      'THE SLIPPER FITS.',
      '',
      'AND THEY LIVED',
      'HAPPILY EVER AFTER.',
    ],
    menu: {
      colors: { title: '#ff9ec4', label: '#c890ff', cur: '#f8eeff', hint: '#9070b0' },
      layout(api) {
        // Dance cards scattered on the ballroom floor — non-list arrangement
        return [
          { x: 16,  y: 118, w: 110, h: 74 },
          { x: 142, y: 100, w: 112, h: 74 },
          { x: 20,  y: 226, w: 110, h: 74 },
          { x: 140, y: 216, w: 112, h: 74 },
          { x: 72,  y: 328, w: 124, h: 74 },
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const rotations = [-0.038, 0.030, -0.022, 0.036, -0.012];
        const rot = rotations[i] || 0;
        const mx = x + w / 2, my = y + h / 2;
        c.save();
        c.translate(mx, my); c.rotate(rot); c.translate(-mx, -my);
        // card body
        c.fillStyle = sel ? '#2c1254' : '#1c0840';
        c.fillRect(x, y, w, h);
        // outer border
        c.strokeStyle = sel ? '#ff9ec4' : '#7840b8';
        c.lineWidth = sel ? 2 : 1; c.strokeRect(x + 1, y + 1, w - 2, h - 2);
        // inner border decoration
        c.strokeStyle = sel ? 'rgba(255,158,196,.3)' : 'rgba(200,144,255,.22)';
        c.lineWidth = 1; c.strokeRect(x + 4, y + 4, w - 8, h - 8);
        // corner flourishes
        const co = sel ? '#ff9ec4' : '#c890ff';
        g.rect(x + 6, y + 6, 4, 1, co); g.rect(x + 6, y + 6, 1, 4, co);
        g.rect(x + w - 10, y + 6, 4, 1, co); g.rect(x + w - 7, y + 6, 1, 4, co);
        // act number
        api.txtC('ACT ' + (i + 1), mx, y + 9, 7, '#ffe566', true);
        // chapter icon
        if (ch.icon) ch.icon(api, x + 14, my + 4);
        // chapter name
        api.txtCFit(ch.name, mx, y + 27, 6, done ? '#ff9ec4' : '#e8d8ff', true, w - 10);
        if (ch.sub) api.txtCFit(ch.sub, mx, y + 45, 5, '#9070b0', true, w - 10);
        if (done) api.txtC('✦', mx, y + h - 13, 9, '#ff9ec4', true);
        else if (sel) api.txtC('▶', x + w - 13, y + 13, 8, '#ff9ec4', true);
        c.restore();
      },
    },
    palette: {
      ink: '#0c0624', dark: '#18083a', panel: '#0e0428',
      gold: '#ffe566', cream: '#f8eeff', dim: '#9070b0',
      blood: '#c890ff', white: '#f4eeff', shadow: 'rgba(0,0,0,.6)',
      rose: '#ff9ec4', blue: '#7de0ff', purple: '#c890ff',
    },
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ══════ ACT 1: MORNING CHORES ══════ */
      {
        id: 'chores',
        name: 'MORNING CHORES',
        sub: 'BEFORE THE STEP-SISTERS WAKE',
        icon: iconBroom,
        intro: ['CINDERELLA RISES', 'BEFORE THE DAWN.', 'THE HOUSE MUST SHINE', 'before they stir.'],
        quote: 'She went on singing cheerfully — and the house had never been so clean.',
        help: 'TAP each chore before the glow fades',
        winText: 'Every corner gleams. The step-sisters find nothing to scold.',
        loseText: 'The step-sisters stir — and the chores are undone.',
        init(api) {
          this.tasks = [];
          this.done = 0; this.need = 15;
          this.missed = 0; this.maxMiss = 4;
          this.timer = 30; this.spawn = 0.5;
        },
        update(api, dt) {
          this.timer -= dt;
          this.spawn -= dt;
          const f = dt * 60;
          if (this.spawn <= 0 && this.tasks.length < 7) {
            this.spawn = api.rnd(1.0, 1.8);
            const life = api.rnd(3.0, 5.2);
            this.tasks.push({
              x: api.rnd(26, api.W - 26),
              y: api.rnd(58, api.H - 76),
              kind: api.rint(0, 4),
              life, maxLife: life,
            });
          }
          // expire
          let expiredCount = 0;
          this.tasks = this.tasks.filter((tk) => {
            tk.life -= dt;
            if (tk.life <= 0) { expiredCount++; return false; }
            return true;
          });
          if (expiredCount > 0) {
            this.missed += expiredCount;
            api.shake(3, 0.18);
            api.audio.sfx('hurt');
            if (this.missed >= this.maxMiss) { api.lose(); return; }
          }
          // tap to complete
          if (api.pointer.justDown) {
            let hit = false;
            for (let i = this.tasks.length - 1; i >= 0; i--) {
              const tk = this.tasks[i];
              if (Math.hypot(api.pointer.x - tk.x, api.pointer.y - tk.y) < 24) {
                this.tasks.splice(i, 1);
                this.done++;
                api.score = this.done * 10 + Math.floor(this.timer * 1.5);
                api.audio.sfx('coin');
                api.burst(tk.x, tk.y, '#ffe566', 8);
                hit = true; break;
              }
            }
            if (!hit) api.audio.sfx('blip');
          }
          if (this.done >= this.need) { api.score += Math.floor(this.timer * 3); api.win(); }
          else if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // kitchen floor
          g.rect(0, 0, W, H, '#1a0c32');
          for (let ry = 0; ry < H; ry += 32) {
            for (let rx = 0; rx < W; rx += 32) {
              g.rect(rx, ry, 30, 30,
                (Math.floor(ry / 32) + Math.floor(rx / 32)) % 2 === 0 ? '#220e3a' : '#190c2e');
            }
          }
          // chore tasks
          for (const tk of this.tasks) {
            const frac = tk.life / tk.maxLife;
            // fading ring timer
            c.strokeStyle = frac > 0.38 ? '#ff9ec4' : '#ff3a5a';
            c.lineWidth = 2.5;
            c.beginPath();
            c.arc(tk.x, tk.y, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
            c.stroke();
            // icon by kind: 0=broom, 1=bucket, 2=laundry, 3=dishes, 4=cloth
            switch (tk.kind) {
              case 0: // broom
                g.rect(tk.x - 1, tk.y - 9, 2, 14, '#a08060');
                g.rect(tk.x - 6, tk.y + 4, 12, 5, '#c8a870');
                g.rect(tk.x - 8, tk.y + 8, 16, 2, '#b08848');
                break;
              case 1: // bucket
                g.rect(tk.x - 6, tk.y - 8, 12, 14, '#9060a0');
                g.rect(tk.x - 8, tk.y + 4, 16, 3, '#c890ff');
                g.rect(tk.x - 5, tk.y - 3, 10, 9, 'rgba(130,50,180,.35)');
                break;
              case 2: // laundry pile
                g.rect(tk.x - 9, tk.y - 4, 18, 10, '#ff9ec4');
                g.rect(tk.x - 7, tk.y - 2, 14, 6, '#f4c8da');
                g.rect(tk.x - 5, tk.y + 4, 10, 3, '#e0a8c0');
                break;
              case 3: // dishes
                g.rect(tk.x - 8, tk.y - 3, 16, 9, '#7de0ff');
                g.rect(tk.x - 6, tk.y - 1, 12, 6, '#a8eeff');
                g.rect(tk.x - 9, tk.y + 5, 18, 3, '#5abcdd');
                break;
              case 4: // cloth / dust rag
                g.rect(tk.x - 7, tk.y - 5, 14, 11, '#c890ff');
                g.rect(tk.x - 5, tk.y - 3, 10, 7, '#e0d0ff');
                break;
            }
          }
          api.topBar('MORNING CHORES');
          api.txt('DONE ' + this.done + '/' + this.need, 6, 20, 9, '#ff9ec4');
          api.txt('MISS ' + this.missed + '/' + this.maxMiss, W - 84, 20, 9,
            this.missed >= 2 ? '#ff3a5a' : '#9070b0');
          g.rect(6, H - 10, W - 12, 6, '#2a1050');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 30, 0, 1), 6, '#ff9ec4');
          api.vignette();
        },
      },

      /* ══════ ACT 2: BIBBIDI-BOBBIDI-BOO ══════ */
      {
        id: 'bibbidi',
        name: 'BIBBIDI-BOBBIDI-BOO',
        sub: 'THE FAIRY GODMOTHER ARRIVES',
        icon: iconWand,
        intro: ['A FLASH OF LIGHT —', 'THE FAIRY GODMOTHER!', 'CATCH THE SPARKLES', 'before they fade.'],
        quote: 'Bibbidi-bobbidi-boo! Now, child — you shall go to the ball.',
        help: 'DRAG to move Cinderella · catch GOLD, dodge SMOKE',
        winText: 'Gown, coach, midnight rule — wish granted!',
        loseText: 'The smoke smothers the spell before it can take hold.',
        init(api) {
          this.basketX = api.W / 2;
          this.sparkles = [];
          this.caught = 0; this.need = 18;
          this.smoked = 0; this.maxSmoke = 3;
          this.timer = 26; this.spawn = 0.3;
        },
        update(api, dt) {
          this.timer -= dt;
          this.spawn -= dt;
          const f = dt * 60;
          // basket follows pointer x
          if (api.pointer.down) {
            this.basketX += (api.pointer.x - this.basketX) * 0.16 * f;
          }
          this.basketX = clamp(this.basketX, 24, api.W - 24);
          // spawn sparkles / smoke
          if (this.spawn <= 0) {
            this.spawn = api.rnd(0.25, 0.52);
            const smoke = api.chance(0.22);
            const spd = api.rnd(1.5, 2.8) + this.caught * 0.05;
            this.sparkles.push({
              x: api.rnd(14, api.W - 14),
              y: -10,
              vx: api.rnd(-0.5, 0.5),
              vy: spd,
              smoke,
              gone: false,
            });
          }
          // move sparkles
          for (const s of this.sparkles) {
            s.x += s.vx * f;
            s.y += s.vy * f;
            if (s.x < 8 || s.x > api.W - 8) s.vx *= -1;
            s.x = clamp(s.x, 8, api.W - 8);
            if (s.y > api.H + 10) s.gone = true;
          }
          // catch
          const bY = api.H - 52;
          for (const s of this.sparkles) {
            if (s.gone) continue;
            if (Math.abs(s.x - this.basketX) < 24 && Math.abs(s.y - bY) < 16) {
              s.gone = true;
              if (s.smoke) {
                this.smoked++;
                api.shake(5, 0.22); api.audio.sfx('hurt');
                api.flash('#4a1060', 0.25);
                if (this.smoked >= this.maxSmoke) { api.lose(); return; }
              } else {
                this.caught++;
                api.score = this.caught * 8 + Math.floor((26 - this.timer) * 2);
                api.audio.sfx('coin');
                api.burst(s.x, bY, '#ffe566', 8);
                if (this.caught >= this.need) { api.score += Math.floor(this.timer * 4); api.win(); return; }
              }
            }
          }
          this.sparkles = this.sparkles.filter((s) => !s.gone);
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          g.rect(0, 0, W, H, '#0c0428');
          // garden at night
          g.rect(0, H - 80, W, 80, '#12083a');
          for (let i = 0; i < 9; i++) g.rect(i * 32 - 4, H - 80, 28, 80, '#0e0630');
          // hedge tops
          for (let i = 0; i < 5; i++) g.circle(i * 56 + 20, H - 80, 14, '#1a1050');
          // fairy godmother (top center)
          const fgx = W / 2, fgy = 36;
          g.circle(fgx, fgy - 10, 13, '#f0e0ff');
          g.rect(fgx - 3, fgy + 3, 6, 12, '#c890ff');
          g.rect(fgx - 9, fgy + 4, 7, 16, '#e8d8ff');
          g.rect(fgx + 2, fgy + 4, 7, 16, '#e8d8ff');
          // wand
          g.rect(fgx + 11, fgy - 12, 2, 20, '#ffe566');
          c.globalAlpha = 0.5 + 0.5 * Math.sin(api.t * 9);
          g.rect(fgx + 10, fgy - 14, 4, 4, '#ffe566');
          g.rect(fgx + 8, fgy - 12, 8, 1, '#ffe566');
          g.rect(fgx + 11, fgy - 15, 2, 8, '#ffe566');
          c.globalAlpha = 1;
          // sparkles / smoke falling
          for (const s of this.sparkles) {
            if (s.smoke) {
              c.globalAlpha = 0.8;
              g.circle(s.x, s.y, 9, '#4a1880');
              g.circle(s.x, s.y, 5, '#6a2ca0');
              c.globalAlpha = 1;
            } else {
              c.globalAlpha = 0.65 + 0.35 * Math.sin(api.t * 11 + s.x);
              g.rect(s.x - 3, s.y - 3, 6, 6, '#ffe566');
              g.rect(s.x - 5, s.y, 10, 1, '#fff0a0');
              g.rect(s.x, s.y - 5, 1, 10, '#fff0a0');
              c.globalAlpha = 1;
            }
          }
          // basket / Cinderella gown
          const bY = H - 52;
          g.rect(this.basketX - 22, bY - 8, 44, 16, '#9b7040');
          g.rect(this.basketX - 20, bY - 6, 40, 12, '#c8a060');
          g.rect(this.basketX - 18, bY + 2, 36, 4, '#ffe566');
          g.circle(this.basketX, bY + 2, 6, '#ff8a3d');
          api.topBar('BIBBIDI-BOBBIDI-BOO');
          api.txt('CAUGHT ' + this.caught + '/' + this.need, 6, 20, 9, '#ff9ec4');
          for (let i = 0; i < this.maxSmoke; i++) {
            g.rect(W - 16 - i * 14, 21, 10, 8,
              i < this.smoked ? '#4a1060' : '#5dff8f');
          }
          g.rect(6, H - 10, W - 12, 6, '#2a1050');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 26, 0, 1), 6, '#c890ff');
          api.vignette();
        },
      },

      /* ══════ ACT 3: THE ROYAL BALL ══════ */
      {
        id: 'ball',
        name: 'THE ROYAL BALL',
        sub: 'A WALTZ WITH THE PRINCE',
        icon: iconCrown,
        intro: ['THE PALACE BLAZES', 'WITH CANDLELIGHT.', 'THE PRINCE TAKES HER', 'hand. Time to dance.'],
        quote: 'He danced with no one else, and never left her side the whole night long.',
        help: 'TAP when the needle lands in the GOLD arc',
        winText: 'Every eye in the ballroom watches you twirl. The Prince is enchanted.',
        loseText: 'You stumble on the marble floor. The dance ends too soon.',
        init(api) {
          this.angle = 0;
          this.spd = 1.0;
          this.steps = 0; this.need = 10;
          this.misses = 0; this.maxMiss = 3;
          this.arcStart = Math.PI * 0.30;
          this.arcLen = Math.PI * 0.44;
          this.cooldown = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.angle = (this.angle + this.spd * 0.034 * f) % (Math.PI * 2);
          this.cooldown = Math.max(0, this.cooldown - dt);
          if (api.confirm() && this.cooldown === 0) {
            this.cooldown = 0.20;
            const a = this.angle;
            const end = this.arcStart + this.arcLen;
            const inZone = (end <= Math.PI * 2)
              ? (a >= this.arcStart && a <= end)
              : (a >= this.arcStart || a <= end - Math.PI * 2);
            if (inZone) {
              this.steps++;
              api.score += 20;
              this.spd = Math.min(2.6, this.spd + 0.14);
              this.arcLen = Math.max(Math.PI * 0.17, this.arcLen - 0.018);
              api.burst(api.W / 2, api.H / 2, '#ffe566', 10);
              api.audio.sfx('coin');
              if (this.steps >= this.need) { api.score += 80; api.win(); }
            } else {
              this.misses++;
              api.shake(4, 0.2); api.audio.sfx('hurt');
              if (this.misses >= this.maxMiss) api.lose();
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const cx = W / 2, cy = H / 2 - 14, R = 72;
          // ballroom floor
          g.rect(0, 0, W, H, '#130938');
          for (let ry = 0; ry < H; ry += 32) {
            for (let rx = 0; rx < W; rx += 32) {
              g.rect(rx, ry, 30, 30,
                (Math.floor(ry / 32) + Math.floor(rx / 32)) % 2 === 0 ? '#1e1242' : '#170e36');
            }
          }
          // dancing silhouettes (background)
          for (let i = 0; i < 3; i++) {
            const dx = (i - 1) * 84 + cx, dy = cy + 14;
            g.circle(dx, dy - 28, 8, '#1a0c40');
            g.rect(dx - 7, dy - 20, 14, 24, '#1a0c40');
            g.circle(dx + 18, dy - 26, 7, '#1e1046');
            g.rect(dx + 11, dy - 18, 14, 22, '#1e1046');
          }
          // outer track ring
          c.strokeStyle = '#2a1858'; c.lineWidth = 14;
          c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
          // gold zone arc
          c.strokeStyle = '#ffe566'; c.lineWidth = 10;
          c.globalAlpha = 0.88;
          c.beginPath();
          c.arc(cx, cy, R, this.arcStart - Math.PI / 2, this.arcStart + this.arcLen - Math.PI / 2);
          c.stroke(); c.globalAlpha = 1;
          // step pips
          for (let i = 0; i < this.need; i++) {
            g.rect(cx - 45 + i * 9, cy - R - 24, 7, 7,
              i < this.steps ? '#ffe566' : '#2a1858');
          }
          // needle
          const nx = cx + Math.cos(this.angle - Math.PI / 2) * R;
          const ny = cy + Math.sin(this.angle - Math.PI / 2) * R;
          c.strokeStyle = '#ff9ec4'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(cx, cy); c.lineTo(nx, ny); c.stroke();
          g.circle(nx, ny, 6, '#ff9ec4');
          g.circle(cx, cy, 7, '#ffe566');
          g.circle(cx, cy, 4, '#fff0a0');
          api.topBar('THE ROYAL BALL');
          api.txt('STEPS ' + this.steps + '/' + this.need, 6, 20, 9, '#ffe566');
          api.txt('MISS ' + this.misses + '/' + this.maxMiss, W - 80, 20, 9,
            this.misses >= 2 ? '#ff3a5a' : '#9070b0');
          api.vignette(); api.scanlines();
        },
      },

      /* ══════ ACT 4: THE MIDNIGHT FLIGHT ══════ */
      {
        id: 'flight',
        name: 'THE MIDNIGHT FLIGHT',
        sub: 'THE CLOCK STRIKES TWELVE',
        icon: iconClock,
        intro: ['DONG! THE FIRST BELL!', 'CINDERELLA FLEES', 'DOWN THE PALACE STEPS —', 'do not let them stop her!'],
        quote: 'She ran as she had never run before, losing one slipper on the stair.',
        help: 'TAP LEFT · CENTER · RIGHT to switch lanes — dodge the guards!',
        winText: 'She slips through the gates — and vanishes into the night.',
        loseText: 'The guards close the gate. The carriage is still waiting.',
        init(api) {
          this.lane = 1; // 0=top 1=mid 2=bottom
          this.guards = [];
          this.hits = 0; this.maxHits = 3;
          this.timer = 22;
          this.bells = 0; this.bellTimer = 22 / 12; this.nextBell = 22 / 12;
          this.spawn = 0.6;
        },
        update(api, dt) {
          this.timer -= dt;
          // bell countdown
          this.nextBell -= dt;
          if (this.nextBell <= 0) {
            this.nextBell = this.bellTimer;
            this.bells = Math.min(12, this.bells + 1);
            api.audio.sfx('blip');
          }
          // spawn guards from right
          this.spawn -= dt;
          const rate = Math.max(0.48, 1.7 - (22 - this.timer) * 0.045);
          if (this.spawn <= 0) {
            this.spawn = api.rnd(rate * 0.8, rate * 1.25);
            this.guards.push({ lane: api.rint(0, 2), x: api.W + 18, hit: false });
          }
          // move guards
          const spd = 95 + (22 - this.timer) * 3.2;
          for (const gd of this.guards) {
            gd.x -= spd * dt;
            if (gd.x < -24) gd.gone = true;
            // collision check
            if (!gd.hit && gd.lane === this.lane && Math.abs(gd.x - 52) < 20) {
              gd.hit = true;
              this.hits++;
              api.shake(7, 0.28); api.flash('#c890ff', 0.22); api.audio.sfx('hurt');
              if (this.hits >= this.maxHits) { api.lose(); return; }
            }
          }
          this.guards = this.guards.filter((gd) => !gd.gone);
          // tap to switch lane
          if (api.pointer.justDown) {
            const tx = api.pointer.x;
            if (tx < api.W / 3) this.lane = 0;
            else if (tx < api.W * 2 / 3) this.lane = 1;
            else this.lane = 2;
          }
          // arrow keys
          if (api.keyPressed('up') && this.lane > 0) this.lane--;
          if (api.keyPressed('down') && this.lane < 2) this.lane++;
          api.score = Math.floor((22 - this.timer) * 5);
          if (this.timer <= 0) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const laneH = Math.floor(H / 3);
          g.rect(0, 0, W, H, '#0d072e');
          // lane backgrounds
          const laneColors = ['#1a0a40', '#15083a', '#1e0e46'];
          for (let i = 0; i < 3; i++) {
            g.rect(0, i * laneH, W, laneH, laneColors[i]);
            if (i < 2) g.rect(0, (i + 1) * laneH - 1, W, 2, '#2a1858');
          }
          // staircase lines scrolling
          const scroll = (api.t * 60) % 32;
          c.globalAlpha = 0.12;
          for (let sx = -32; sx < W + 32; sx += 32) {
            g.rect(sx - scroll, 0, 1, H, '#c890ff');
          }
          c.globalAlpha = 1;
          // lane tap guides (faint)
          c.globalAlpha = 0.15;
          g.rect(W / 3, 0, 1, H, '#ff9ec4');
          g.rect(W * 2 / 3, 0, 1, H, '#ff9ec4');
          c.globalAlpha = 1;
          // guards
          for (const gd of this.guards) {
            const gy = gd.lane * laneH + Math.floor(laneH / 2);
            // guard body
            g.rect(gd.x - 11, gy - 20, 22, 32, '#3a1858');
            g.circle(gd.x, gy - 27, 10, '#c8a878');
            g.rect(gd.x - 9, gy - 36, 18, 7, '#c890ff'); // hat
            g.rect(gd.x + 7, gy - 44, 3, 40, '#9870b0'); // spear shaft
            g.rect(gd.x + 6, gy - 46, 5, 7, '#ffe566');  // spear tip
            g.rect(gd.x - 11, gy + 10, 6, 3, '#9870b0'); g.rect(gd.x + 5, gy + 10, 6, 3, '#9870b0');
          }
          // Cinderella sprite
          const cinY = this.lane * laneH + Math.floor(laneH / 2);
          g.rect(39, cinY - 22, 16, 32, '#ff9ec4');   // gown
          g.circle(47, cinY - 30, 10, '#e8c090');      // head
          g.rect(42, cinY - 40, 10, 12, '#f0d890');    // hair up
          g.rect(40, cinY - 22, 16, 6, '#ffd0e8');     // gown collar
          // running shoe left behind
          c.globalAlpha = 0.6 - clamp(api.t / 3, 0, 0.5);
          g.rect(53, H - 22, 7, 5, '#7de0ff');
          c.globalAlpha = 1;
          api.topBar('THE MIDNIGHT FLIGHT');
          api.txt('BELLS ' + this.bells + '/12', 6, 20, 9, '#c890ff');
          for (let i = 0; i < this.maxHits; i++) {
            g.rect(W - 16 - i * 14, 21, 10, 8,
              i < this.hits ? '#c890ff' : '#5dff8f');
          }
          g.rect(6, H - 10, W - 12, 6, '#2a1050');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 22, 0, 1), 6, '#ff9ec4');
          api.vignette();
        },
      },

      /* ══════ ACT 5: THE GLASS SLIPPER ══════ */
      {
        id: 'slipper',
        name: 'THE GLASS SLIPPER',
        sub: 'ONE PERFECT FIT',
        icon: iconSlipper,
        intro: ['THE GRAND DUKE RIDES', 'ACROSS THE KINGDOM,', 'SLIPPER IN HAND.', 'One foot will fit.'],
        quote: 'The slipper slid on as if it had been made of wax — because it had.',
        help: 'DRAG to guide the slipper · tap step-sisters to shoo them',
        winText: 'The slipper glides on as though cast for her foot alone. It was.',
        loseText: 'Grasping hands snatch it away before it can reach her.',
        init(api) {
          this.slipX = api.W / 2;
          this.slipY = 90;
          this.fits = 0; this.need = 4;
          this.footX = api.W / 2; this.footY = api.H - 88;
          this.inFoot = 0; this.inFootNeed = 1.4;
          this.sisters = [];
          this.spawnS = 1.8;
          this.lives = 3;
        },
        update(api, dt) {
          const f = dt * 60;
          // slipper follows pointer smoothly
          if (api.pointer.down) {
            this.slipX += (api.pointer.x - this.slipX) * 0.11 * f;
            this.slipY += (api.pointer.y - this.slipY) * 0.11 * f;
          }
          this.slipX = clamp(this.slipX, 14, api.W - 14);
          this.slipY = clamp(this.slipY, 22, api.H - 22);
          // spawn step-sisters
          this.spawnS -= dt;
          if (this.spawnS <= 0 && this.sisters.length < 3) {
            this.spawnS = api.rnd(2.2, 4.0);
            const side = api.chance(0.5);
            this.sisters.push({
              x: side ? -22 : api.W + 22,
              y: api.rnd(110, api.H - 120),
              spd: api.rnd(30, 46) + this.fits * 4,
              grabbed: false,
            });
          }
          // sisters chase slipper
          for (const s of this.sisters) {
            if (s.grabbed) continue;
            const dx = this.slipX - s.x, dy = this.slipY - s.y;
            const dist = Math.hypot(dx, dy) || 1;
            s.x += (dx / dist) * s.spd * dt;
            s.y += (dy / dist) * s.spd * dt;
            // grab?
            if (dist < 20) {
              s.grabbed = true;
              this.lives--;
              api.shake(7, 0.3); api.audio.sfx('hurt'); api.flash('#9050c0', 0.28);
              this.slipX = api.W / 2; this.slipY = 90;
              this.inFoot = 0;
              if (this.lives <= 0) { api.lose(); return; }
            }
            // tap to shoo
            if (api.pointer.justDown && Math.hypot(api.pointer.x - s.x, api.pointer.y - s.y) < 24) {
              s.grabbed = true;
              api.burst(s.x, s.y, '#ff9ec4', 9);
              api.audio.sfx('coin');
            }
          }
          this.sisters = this.sisters.filter((s) => !s.grabbed);
          // foot target check
          const dFoot = Math.hypot(this.slipX - this.footX, this.slipY - this.footY);
          if (dFoot < 26) {
            this.inFoot += dt;
            if (this.inFoot >= this.inFootNeed) {
              this.inFoot = 0;
              this.fits++;
              api.score += 30;
              api.burst(this.footX, this.footY, '#ffe566', 16);
              api.audio.sfx('power');
              this.slipX = api.W / 2; this.slipY = 90;
              if (this.fits >= this.need) { api.score += 80; api.win(); return; }
            }
          } else {
            this.inFoot = Math.max(0, this.inFoot - dt * 0.6);
          }
          api.score = this.fits * 30;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          g.rect(0, 0, W, H, '#0c0420');
          // village backdrop
          g.rect(0, H - 70, W, 70, '#180838');
          for (let i = 0; i < 7; i++) {
            g.rect(i * 40, H - 70, 36, 70, '#120630');
            g.rect(i * 40 + 12, H - 84, 12, 18, '#1a0c3e');
            g.rect(i * 40 + 13, H - 88, 10, 7, '#14082e');
          }
          // foot target (glowing ellipse)
          const fp = this.inFoot / this.inFootNeed;
          const pulse = 0.55 + 0.45 * Math.sin(api.t * 3.2);
          c.strokeStyle = fp > 0 ? '#ffe566' : '#7de0ff';
          c.lineWidth = fp > 0 ? 3 : 2;
          c.globalAlpha = pulse;
          c.beginPath();
          c.ellipse(this.footX, this.footY, 24, 13, 0, 0, Math.PI * 2);
          c.stroke();
          c.globalAlpha = 1;
          if (fp > 0) {
            c.fillStyle = 'rgba(255,229,102,.16)';
            c.beginPath();
            c.ellipse(this.footX, this.footY, 24, 13, 0, 0, Math.PI * 2);
            c.fill();
            // fill arc
            c.strokeStyle = '#ffe566'; c.lineWidth = 4; c.globalAlpha = 0.7;
            c.beginPath();
            c.arc(this.footX, this.footY, 32, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fp);
            c.stroke(); c.globalAlpha = 1;
          }
          // fit pips
          for (let i = 0; i < this.need; i++) {
            g.rect(W / 2 - 28 + i * 18, H - 15, 14, 8,
              i < this.fits ? '#ffe566' : '#2a1050');
          }
          // step-sisters
          for (const s of this.sisters) {
            g.rect(s.x - 11, s.y - 20, 22, 32, '#3a1858');
            g.circle(s.x, s.y - 27, 10, '#c8a060');
            // fussy hair
            g.rect(s.x - 6, s.y - 38, 12, 10, '#ff9ec4');
            g.rect(s.x - 8, s.y - 36, 4, 6, '#ff7ea0');
            g.rect(s.x + 4, s.y - 36, 4, 6, '#ff7ea0');
            // grabbing hands
            g.rect(s.x - 11, s.y - 8, 6, 3, '#c8a060');
            g.rect(s.x + 5, s.y - 8, 6, 3, '#c8a060');
          }
          // glass slipper
          const sglow = 0.4 + 0.4 * Math.sin(api.t * 5.2);
          c.globalAlpha = sglow * 0.45;
          g.circle(this.slipX, this.slipY + 4, 18, '#7de0ff');
          c.globalAlpha = 1;
          g.rect(this.slipX - 14, this.slipY + 6, 28, 6, '#5abcdd');
          g.rect(this.slipX - 14, this.slipY + 6, 6, 11, '#4a9ac4');
          g.rect(this.slipX + 2, this.slipY - 5, 12, 13, '#9de8ff');
          g.rect(this.slipX + 4, this.slipY - 3, 8, 9, '#c8f4ff');
          g.rect(this.slipX + 6, this.slipY - 1, 4, 4, '#ffffff');
          api.topBar('THE GLASS SLIPPER');
          api.txt('FITS ' + this.fits + '/' + this.need, 6, 20, 9, '#7de0ff');
          for (let i = 0; i < 3; i++) {
            g.rect(W - 16 - i * 14, 21, 10, 8,
              i < (3 - this.lives) ? '#9050c0' : '#5dff8f');
          }
          api.vignette();
        },
      },
    ],
  });
})();
