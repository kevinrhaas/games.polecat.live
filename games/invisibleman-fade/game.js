/* ============================================================================
 * THE INVISIBLE MAN — FIVE ENCOUNTERS WITH THE UNSEEN
 *   1. THE FORMULA      — pendulum timing: mix the invisibility compound
 *   2. IPING VILLAGE    — free-move stealth: avoid townsfolk sight cones
 *   3. SNOW BETRAYAL    — dodge: snow reveal patches fall from above
 *   4. KEMP'S HOUSE     — defense: tap breach points before soldiers break in
 *   5. THE DARK COMMONS — survive: dodge the mob's torches and thrown rocks
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const U = Retro.util;

  /* ---- Emblem: bandaged Griffin silhouette — top hat, goggles, dark coat ---- */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // invisible aura
    c.globalAlpha = 0.12;
    g.circle(cx, cy - 16, 44, '#60a8ff');
    c.globalAlpha = 1;
    // dark coat body
    g.rect(cx - 18, cy - 14, 36, 46, '#22262e');
    // lapels
    g.rect(cx - 18, cy - 14, 8, 22, '#161820');
    g.rect(cx + 10, cy - 14, 8, 22, '#161820');
    // white shirt / cravat
    g.rect(cx - 4, cy - 12, 8, 10, '#c8c0b0');
    // neck
    g.rect(cx - 4, cy - 28, 8, 16, '#c8b8a0');
    // bandaged head
    g.rect(cx - 13, cy - 52, 26, 26, '#d0c8bc');
    // bandage horizontal strips
    g.rect(cx - 13, cy - 46, 26, 3, '#b0a898');
    g.rect(cx - 13, cy - 38, 26, 3, '#b0a898');
    g.rect(cx - 13, cy - 30, 26, 3, '#b0a898');
    // goggles
    g.rect(cx - 12, cy - 46, 9, 7, '#181c24');
    g.rect(cx + 3, cy - 46, 9, 7, '#181c24');
    // goggle glass tint
    g.rect(cx - 10, cy - 44, 5, 4, '#2a4870');
    g.rect(cx + 5, cy - 44, 5, 4, '#2a4870');
    // goggle bridge
    g.rect(cx - 3, cy - 44, 6, 2, '#181c24');
    // top hat
    g.rect(cx - 14, cy - 58, 28, 6, '#181c24');
    g.rect(cx - 10, cy - 74, 20, 18, '#181c24');
  }

  /* ---- Scenery: foggy English village at night with snowfall ---- */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Sky gradient — deep misty blue-black
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#04060e');
    sky.addColorStop(0.6, '#080e1a');
    sky.addColorStop(1, '#0c1220');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // stars (faint, through the fog)
    for (let i = 0; i < 36; i++) {
      const sx = (i * 71 + 13) % W;
      const sy = (i * 47 + 7) % Math.floor(H * 0.42);
      c.globalAlpha = 0.08 + 0.06 * Math.sin(t * 0.9 + i * 0.8);
      g.rect(sx, sy, 1, 1, '#b0bcc8');
    }
    c.globalAlpha = 1;

    // rolling mist layers
    for (let i = 0; i < 3; i++) {
      const my = H * (0.48 + i * 0.13) + Math.sin(t * 0.25 + i * 1.4) * 6;
      const mg = c.createLinearGradient(0, my, 0, my + 38);
      mg.addColorStop(0, 'rgba(55,65,85,0)');
      mg.addColorStop(0.5, `rgba(55,65,85,${0.07 + i * 0.035})`);
      mg.addColorStop(1, 'rgba(55,65,85,0)');
      c.fillStyle = mg;
      c.fillRect(Math.sin(t * 0.2 + i) * 20, my, W + 40, 38);
    }

    // gas lamp — left
    g.rect(28 - 1, H - 130, 2, 74, '#2e2818');
    g.rect(28 - 7, H - 134, 14, 16, '#3c3020');
    g.rect(28 - 5, H - 132, 10, 12, '#d8c060');
    c.globalAlpha = 0.22 + 0.04 * Math.sin(t * 2.1);
    g.circle(28, H - 126, 26, '#e8cc50');
    c.globalAlpha = 1;

    // gas lamp — right
    g.rect(W - 28 - 1, H - 130, 2, 74, '#2e2818');
    g.rect(W - 28 - 7, H - 134, 14, 16, '#3c3020');
    g.rect(W - 28 - 5, H - 132, 10, 12, '#d8c060');
    c.globalAlpha = 0.22 + 0.04 * Math.sin(t * 1.8);
    g.circle(W - 28, H - 126, 26, '#e8cc50');
    c.globalAlpha = 1;

    // village buildings silhouettes
    c.fillStyle = '#080c16';
    // coach inn on left
    c.fillRect(0, H - 175, 58, 115);
    c.fillRect(7, H - 192, 18, 20);      // chimney
    // central church
    c.fillRect(W / 2 - 28, H - 200, 56, 140);
    c.fillRect(W / 2 - 9, H - 232, 18, 34);   // spire
    c.fillRect(W / 2 - 2, H - 244, 4, 14);    // cross
    // draper's shop on right
    c.fillRect(W - 62, H - 162, 62, 102);
    c.fillRect(W - 48, H - 180, 16, 20);      // chimney

    // warm window glows
    c.fillStyle = '#786030';
    c.fillRect(8, H - 152, 18, 12);
    c.fillRect(32, H - 152, 14, 12);
    c.fillRect(W - 54, H - 142, 14, 10);
    c.fillStyle = '#3a2e14';
    c.fillRect(10, H - 150, 14, 8);
    c.fillRect(34, H - 150, 10, 8);
    c.fillRect(W - 52, H - 140, 10, 7);

    // ground (cobblestone road)
    c.fillStyle = '#0a0e18';
    c.fillRect(0, H - 56, W, 56);
    c.fillStyle = '#070a12';
    c.fillRect(0, H - 36, W, 36);

    // snow on rooftops and ground
    c.fillStyle = '#5a6878';
    c.fillRect(0, H - 178, 58, 4);
    c.fillRect(W / 2 - 28, H - 202, 56, 4);
    c.fillRect(W - 62, H - 165, 62, 4);
    c.fillStyle = '#4a5868';
    c.fillRect(0, H - 58, W, 4);

    // falling snow (continuous drift, seeded)
    c.globalAlpha = 0.38;
    for (let i = 0; i < 70; i++) {
      const sx = ((i * 43 + t * 18) % (W + 10)) - 5;
      const sy = ((i * 31 + t * 55) % (H + 10)) - 5;
      g.rect(Math.floor(sx), Math.floor(sy), 2, 2, '#b8ccd8');
    }
    c.globalAlpha = 1;

    // dim overlay for story screens
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(4,6,12,.72)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(4,6,14,.55)';
      c.fillRect(0, 0, W, H);
      // dotted trail connecting the 5 chapter locations
      c.setLineDash([3, 7]);
      c.strokeStyle = 'rgba(70, 100, 130, 0.38)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(70, 139);
      c.lineTo(200, 207);
      c.lineTo(70, 289);
      c.lineTo(200, 363);
      c.lineTo(118, 435);
      c.stroke();
      c.setLineDash([]);
      c.lineWidth = 1;
    }
  }

  /* ============================================================ */
  /* MAIN SAGA                                                     */
  /* ============================================================ */
  RetroSaga.create({
    id: 'invisibleman',
    title: 'The Invisible Man',
    subtitle: 'FIVE ENCOUNTERS WITH THE UNSEEN',
    currency: 'VAPOURS',

    screens: {
      win:          '#7ab0cc',
      lose:         '#3a1624',
      chapterLabel: '#4a6878',
      name:         '#c8dce8',
      sub:          '#607888',
      intro:        '#90a8b8',
      quote:        '#3a5870',
      help:         '#6090aa',
      score:        '#c8dce8',
      cur:          '#7ab0cc',
      cta:          '#a8c0d0',
      overlay:      'rgba(4,6,14,.90)',
    },
    labels: {
      chapter:  'ENCOUNTER',
      score:    'VAPOURS GATHERED',
      win:      'UNSEEN — FOR NOW',
      lose:     'THEY HAVE YOU',
      cont:     'TAP TO VANISH AGAIN',
      finale:   'TAP TO FACE THE CROWD',
      toMenu:   'TAP TO DISAPPEAR',
      play:     'TAP TO BECOME INVISIBLE',
    },

    accent:    '#6090b0',
    credit:    'THE INVISIBLE MAN · H. G. WELLS, 1897',
    bootCta:   'TAP TO BECOME INVISIBLE',
    bootLine:  'FIVE ENCOUNTERS · ONE DARK SECRET',
    menuLabel: "GRIFFIN'S TRAIL",
    menuHint:  'CHOOSE YOUR NEXT ENCOUNTER',
    menuDone:  'NO TRACE REMAINS',
    emblem,
    scenery,

    finale: [
      '"HE IS DYING!"',
      '',
      'THE WOUNDS APPEAR.',
      'FIRST THE TOES,',
      'THEN THE FEET —',
      'GRIFFIN BECOMES VISIBLE AGAIN.',
    ],

    menu: {
      colors: { title: '#6090b0', label: '#3a5870', cur: '#c8dce8' },

      layout(api) {
        // Five chapter locations in a zigzag footprint trail
        return [
          { x: 20,  y: 102, w: 100, h: 74 },  // top-left: the formula
          { x: 150, y: 170, w: 100, h: 74 },  // top-right: Iping Village
          { x: 20,  y: 252, w: 100, h: 74 },  // mid-left: snow betrayal
          { x: 150, y: 326, w: 100, h: 74 },  // lower-right: Kemp's house
          { x: 68,  y: 398, w: 100, h: 74 },  // bottom-centre: dark commons
        ];
      },

      title(api, score) {
        const g = api.gfx, c = api.ctx, W = api.W;
        c.fillStyle = '#060a16';
        c.fillRect(10, 14, W - 20, 78);
        c.strokeStyle = '#2a4060'; c.lineWidth = 1;
        c.strokeRect(10, 14, W - 20, 78);
        g.rect(10, 15, W - 20, 2, '#1a3050');
        g.rect(10, 89, W - 20, 2, '#1a3050');
        api.txtC("GRIFFIN'S TRAIL", W / 2, 25, 9, '#6090b0', true);
        api.txtC('VAPOURS  ' + score, W / 2, 52, 9, '#c8dce8', true);
        // tiny footprint pairs each side
        for (let s of [-1, 1]) {
          const bx = s < 0 ? 26 : W - 26;
          g.rect(bx - 4, 42, 3, 5, '#3a5870');
          g.rect(bx + 1, 42, 3, 5, '#3a5870');
          g.rect(bx - 5, 49, 4, 6, '#3a5870');
          g.rect(bx + 1, 49, 4, 6, '#3a5870');
        }
      },

      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;

        // card body: stone wall tile
        c.fillStyle = sel ? '#0c1828' : '#080c18';
        c.fillRect(x, y, w, h);
        c.strokeStyle = sel ? '#5080a0' : '#1e3048';
        c.lineWidth = sel ? 2 : 1;
        c.strokeRect(x, y, w, h);

        // snow cap on card top
        c.fillStyle = '#4a5870';
        c.fillRect(x, y, w, 3);

        // footprint icon (centred top)
        const px = x + w / 2, py = y + 22;
        const fc = done ? '#80b8d8' : (sel ? '#5080a0' : '#2a4060');
        g.rect(px - 7, py - 7, 4, 6, fc);
        g.rect(px + 3, py - 7, 4, 6, fc);
        g.rect(px - 8, py, 5, 7, fc);
        g.rect(px + 3, py, 5, 7, fc);
        if (done) {
          c.globalAlpha = 0.18;
          g.circle(px, py, 14, '#80b8d8');
          c.globalAlpha = 1;
        }

        // chapter name + sub
        api.txtCFit((i + 1) + '. ' + ch.name, x + w / 2, y + h - 30, 7,
          done ? '#80b8d8' : (sel ? '#b0cce0' : '#5a7890'), false, w - 8);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2, y + h - 16, 6,
          done ? '#406080' : '#2a3e52', false, w - 8);
      },
    },

    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ====================== 1. THE FORMULA ===================== */
      {
        id: 'formula', name: 'THE FORMULA', sub: 'GRIFFIN\'S LABORATORY',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 3, y - 8, 6, 12, '#3a6890');
          g.rect(x - 5, y + 2, 10, 6, '#245070');
          g.rect(x - 1, y - 11, 2, 4, '#707880');
          g.rect(x - 2, y - 2, 4, 4, '#60a8d0');
        },
        intro: [
          'GRIFFIN LABOURS ALONE',
          'THROUGH THE COLD NIGHT.',
          'EIGHT COMPOUNDS MUST BE',
          'MEASURED PRECISELY.',
        ],
        quote: '"I began to realise the extraordinary possibilities of invisibility."',
        help: 'TAP when the needle hits the BLUE ZONE · 8 brews · 3 misses lose',
        winText: 'The final flask glows cold and clear. Griffin drinks deeply and waits. Slowly — invisibly — he vanishes.',
        loseText: 'The compound goes toxic. The experiment fails. Griffin must start again.',

        init(api) {
          this.step    = 0;
          this.need    = 8;
          this.needle  = 0;
          this.dir     = 1;
          this.speed   = 0.78;
          this.zoneW   = 0.28;
          this.zoneL   = 0.5 - 0.14;
          this.misses  = 0;
          this.maxMiss = 3;
          this.hitFlash = 0;
          this.goodFlash = 0;
          this.done    = false;
        },

        update(api, dt) {
          if (this.done) return;
          this.hitFlash  = Math.max(0, this.hitFlash - dt * 4);
          this.goodFlash = Math.max(0, this.goodFlash - dt * 4);

          // move pendulum
          this.needle += this.speed * this.dir * dt;
          if (this.needle >= 1) { this.needle = 1; this.dir = -1; }
          if (this.needle <= 0) { this.needle = 0; this.dir =  1; }

          // tap/click to brew
          if (api.pointer.justDown || api.keyPressed('a') || api.keyPressed('start')) {
            const inZone = this.needle >= this.zoneL &&
                           this.needle <= this.zoneL + this.zoneW;
            if (inZone) {
              this.step++;
              api.addScore(12);
              api.audio.sfx('coin');
              api.burst(api.W / 2, 260, '#60c0ff', 10);
              this.goodFlash = 1;
              // tighten the zone and speed up
              this.speed  = Math.min(2.6, this.speed  + 0.12);
              this.zoneW  = Math.max(0.10, this.zoneW - 0.020);
              this.zoneL  = 0.5 - this.zoneW / 2;
              if (this.step >= this.need) {
                api.addScore(60);
                api.audio.sfx('win');
                this.done = true;
                setTimeout(() => api.win(), 700);
              }
            } else {
              this.misses++;
              api.audio.sfx('hurt');
              api.shake(5, 0.35);
              this.hitFlash = 1;
              if (this.misses >= this.maxMiss) {
                api.audio.sfx('lose');
                this.done = true;
                setTimeout(() => api.lose(), 500);
              }
            }
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#060a10');

          // lab walls
          c.fillStyle = '#090e18'; c.fillRect(0, 0, W, H - 56);
          // stone tiles
          for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 5; col++) {
              const ox = (row % 2) ? 27 : 0;
              c.fillStyle = 'rgba(30,38,56,.14)';
              c.fillRect(col * 54 + ox, row * 22, 52, 20);
            }
          }
          // window (arched, glowing)
          const wx = W / 2 - 18, wy = 14;
          c.fillStyle = 'rgba(50,100,150,0.07)';
          c.fillRect(wx, wy, 36, 46);
          c.strokeStyle = '#1a3050'; c.lineWidth = 1;
          c.strokeRect(wx, wy, 36, 46);
          if (Math.sin(api.t * 4.2) > 0.4) {
            c.fillStyle = 'rgba(50,100,180,.18)';
            c.fillRect(wx, wy, 36, 46);
          }

          // lab bench
          c.fillStyle = '#0e1620'; c.fillRect(0, H - 56, W, 56);
          c.fillStyle = '#182030'; c.fillRect(0, H - 58, W, 4);

          // beakers on bench (filled as steps complete)
          const flaskCols = ['#3060a0', '#2878b8', '#30a0d0', '#50c8e0',
                             '#60d0f0', '#70d8ff', '#88e4ff', '#a0ecff'];
          for (let b = 0; b < 4; b++) {
            const bx = 28 + b * 56, by = H - 52;
            const filled = b < this.step;
            const col = filled ? flaskCols[Math.min(b, 7)] : '#162030';
            g.rect(bx - 7, by - 18, 14, 20, col);
            g.rect(bx - 9, by - 20, 18, 5, '#1e2e3e');
            g.rect(bx - 3, by - 26, 6, 8, '#1e2e3e');
            if (filled) {
              c.globalAlpha = 0.28 + 0.08 * Math.sin(api.t * 7 + b);
              g.circle(bx, by - 12, 10, '#80d0ff');
              c.globalAlpha = 1;
            }
          }
          for (let b = 0; b < 4; b++) {
            const bx = 28 + b * 56 + 28, by = H - 52;
            const filled = b + 4 < this.step;
            const col = filled ? flaskCols[Math.min(b + 4, 7)] : '#162030';
            g.rect(bx - 7, by - 18, 14, 20, col);
            g.rect(bx - 9, by - 20, 18, 5, '#1e2e3e');
            g.rect(bx - 3, by - 26, 6, 8, '#1e2e3e');
            if (filled) {
              c.globalAlpha = 0.28 + 0.08 * Math.sin(api.t * 7 + b + 4);
              g.circle(bx, by - 12, 10, '#80d0ff');
              c.globalAlpha = 1;
            }
          }

          // pendulum track
          const tx = 26, tw = W - 52, ty = 240;
          g.rect(tx, ty - 12, tw, 24, '#0c1828');
          c.strokeStyle = '#1e3048'; c.lineWidth = 1;
          c.strokeRect(tx, ty - 12, tw, 24);

          // sweet zone
          const zx = Math.round(tx + this.zoneL * tw);
          const zw = Math.round(this.zoneW * tw);
          g.rect(zx, ty - 12, zw, 24, '#0e2e50');
          c.strokeStyle = '#3080b0'; c.lineWidth = 1;
          c.strokeRect(zx, ty - 12, zw, 24);
          api.txtC('ZONE', zx + zw / 2, ty - 2, 6, '#4090c0', true);

          // needle
          const nx = Math.round(tx + this.needle * tw);
          const needleCol = this.goodFlash > 0.5 ? '#80e0ff' : '#c0d8e8';
          g.rect(nx - 3, ty - 20, 6, 40, needleCol);
          g.rect(nx - 5, ty - 24, 10, 8, needleCol);

          // progress pips
          api.txtC('BREW ' + this.step + ' / ' + this.need, W / 2, 170, 8, '#4a7090', true);

          // miss indicators
          for (let m = 0; m < this.maxMiss; m++) {
            const mx = W / 2 - 22 + m * 20;
            const mc = m < this.misses ? '#cc2a2a' : '#1a3048';
            g.rect(mx, ty + 28, 14, 14, mc);
            if (m < this.misses) {
              g.rect(mx + 3, ty + 31, 2, 8, '#ff4040');
              g.rect(mx + 9, ty + 31, 2, 8, '#ff4040');
            }
          }
          api.txtC('MISSES', W / 2, ty + 52, 7, '#3a5060', true);

          // hit flash overlay
          if (this.hitFlash > 0.5) {
            c.globalAlpha = 0.12;
            c.fillStyle = '#ff2020'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          api.topBar('THE FORMULA');
          api.vignette();
        },
      },

      /* ===================== 2. IPING VILLAGE ==================== */
      {
        id: 'iping', name: 'IPING VILLAGE', sub: 'TOWNSFOLK SUSPECT',
        icon(api, x, y) {
          const g = api.gfx;
          // house silhouette
          g.rect(x - 6, y - 2, 12, 9, '#3a4060');
          g.rect(x - 7, y - 7, 14, 6, '#2a3050');
          g.rect(x - 2, y + 3, 4, 4, '#506080');
        },
        intro: [
          'THE VILLAGE OF IPING',
          'GROWS SUSPICIOUS.',
          'SLIP THROUGH UNSEEN.',
          'THREE LIVES — SURVIVE 24s.',
        ],
        quote: '"He had invented tales of a secret process, and the bandages protected his face."',
        help: 'DRAG or ARROWS to move · avoid the townsfolk sight cones · 24 seconds',
        winText: 'You slip past the last suspicious eye. The door closes. Iping is deceived — for now.',
        loseText: 'They see the empty coat moving. The crowd gathers, pointing and shouting.',

        init(api) {
          this.px      = api.W / 2;
          this.py      = api.H / 2 + 40;
          this.lives   = 3;
          this.hitCool = 0;
          this.elapsed = 0;
          this.goal    = 24;
          // 4 villagers patrol horizontal routes
          this.folk = [
            { x: 50,  y: 150, angle: 0,         dir: 1,  minX: 30,  maxX: 130, spd: 36 },
            { x: 210, y: 200, angle: Math.PI,    dir: -1, minX: 140, maxX: 245, spd: 40 },
            { x: 60,  y: 300, angle: 0,          dir: 1,  minX: 25,  maxX: 160, spd: 34 },
            { x: 200, y: 370, angle: Math.PI,    dir: -1, minX: 120, maxX: 248, spd: 42 },
          ];
        },

        update(api, dt) {
          this.hitCool = Math.max(0, this.hitCool - dt);
          this.elapsed += dt;
          if (this.elapsed >= this.goal) { api.addScore(50); api.win(); return; }

          // player movement — drag or arrows
          const p = api.pointer;
          if (p.down) {
            const dx = p.x - this.px, dy = p.y - this.py;
            const d = Math.hypot(dx, dy);
            if (d > 6) {
              this.px += (dx / d) * 80 * dt;
              this.py += (dy / d) * 80 * dt;
            }
          }
          if (api.keyDown('left'))  this.px -= 80 * dt;
          if (api.keyDown('right')) this.px += 80 * dt;
          if (api.keyDown('up'))    this.py -= 80 * dt;
          if (api.keyDown('down'))  this.py += 80 * dt;
          this.px = U.clamp(this.px, 14, api.W - 14);
          this.py = U.clamp(this.py, 56, api.H - 56);

          // move folk and check sight cones
          for (const f of this.folk) {
            f.x += f.spd * f.dir * dt;
            if (f.dir >  0 && f.x >= f.maxX) { f.dir = -1; f.angle = Math.PI; }
            if (f.dir < 0 && f.x <= f.minX) { f.dir =  1; f.angle = 0; }

            if (this.hitCool > 0) continue;
            const dx = this.px - f.x, dy = this.py - f.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 85) {
              let diff = Math.atan2(dy, dx) - f.angle;
              while (diff >  Math.PI) diff -= 2 * Math.PI;
              while (diff < -Math.PI) diff += 2 * Math.PI;
              if (Math.abs(diff) < 0.52 && dist < 82) {
                this.lives--;
                this.hitCool = 1.6;
                api.shake(5, 0.4);
                api.audio.sfx('hurt');
                api.flash('#cc1a1a', 0.3);
                if (this.lives <= 0) { api.audio.sfx('lose'); api.lose(); }
              }
            }
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#05080e');

          // night sky
          c.fillStyle = '#07090f'; c.fillRect(0, 0, W, H * 0.5);

          // cobblestone ground
          c.fillStyle = '#0a0e18'; c.fillRect(0, H - 50, W, 50);
          for (let cy2 = H - 50; cy2 < H; cy2 += 14) {
            for (let cx2 = 0; cx2 < W; cx2 += 20) {
              c.strokeStyle = '#0d1320'; c.lineWidth = 1;
              c.strokeRect(cx2 + 2, cy2 + 2, 16, 10);
            }
          }

          // building hints at screen edges
          c.fillStyle = '#060a14';
          c.fillRect(0, 0, 14, H - 50);
          c.fillRect(W - 14, 0, 14, H - 50);

          // sight cones (amber lantern glow)
          for (const f of this.folk) {
            c.save();
            c.translate(f.x, f.y);
            c.rotate(f.angle);
            const grd = c.createRadialGradient(0, 0, 5, 0, 0, 82);
            grd.addColorStop(0, 'rgba(190,150,50,0.22)');
            grd.addColorStop(1, 'rgba(190,150,50,0)');
            c.fillStyle = grd;
            c.beginPath();
            c.moveTo(0, 0);
            c.arc(0, 0, 82, -0.52, 0.52);
            c.closePath();
            c.fill();
            c.restore();
          }

          // draw folk (village silhouettes)
          for (const f of this.folk) {
            // body / coat
            g.rect(f.x - 6, f.y - 18, 12, 22, '#2e3444');
            // head
            g.rect(f.x - 4, f.y - 30, 8, 13, '#c0a880');
            // hat
            g.rect(f.x - 5, f.y - 36, 10, 4, '#1e2030');
            g.rect(f.x - 3, f.y - 42, 6, 8, '#1e2030');
            // tiny lantern held (direction-appropriate)
            const lx = f.dir > 0 ? f.x + 8 : f.x - 8;
            g.rect(lx - 3, f.y - 14, 6, 8, '#403020');
            g.rect(lx - 2, f.y - 12, 4, 6, '#d0a030');
          }

          // Griffin — faint shimmer, flickers when hit
          const alpha = this.hitCool > 0
            ? (Math.sin(api.t * 20) > 0 ? 0.55 : 0.05)
            : 0.18;
          c.globalAlpha = alpha;
          g.rect(this.px - 8, this.py - 24, 16, 28, '#4a6080');
          g.rect(this.px - 6, this.py - 34, 12, 12, '#3a5070');
          g.rect(this.px - 5, this.py - 42, 10, 10, '#c0b0a0');
          g.rect(this.px - 6, this.py - 46, 12, 5, '#1a1c24');
          c.globalAlpha = 1;

          // danger halo when close to detection
          for (const f of this.folk) {
            const d = Math.hypot(this.px - f.x, this.py - f.y);
            if (d < 82) {
              c.globalAlpha = 0.06 + 0.1 * (1 - d / 82);
              g.circle(this.px, this.py - 12, 18, '#ff3030');
              c.globalAlpha = 1;
            }
          }

          // HUD
          const tLeft = Math.max(0, Math.ceil(this.goal - this.elapsed));
          api.topBar('IPING VILLAGE');
          api.txt(tLeft + 's', W - 6, 4, 9, '#5080a0', 'right', true);
          for (let i = 0; i < 3; i++) {
            g.rect(W - 70 + i * 18, 4, 12, 9,
              i < this.lives ? '#4a7090' : '#1a2a38');
          }
          api.vignette();
        },
      },

      /* ==================== 3. SNOW BETRAYAL ===================== */
      {
        id: 'snow', name: 'SNOW BETRAYAL', sub: 'FOOTPRINTS REVEAL ALL',
        icon(api, x, y) {
          const g = api.gfx;
          // snowflake
          g.rect(x - 1, y - 8, 2, 16, '#7ab0cc');
          g.rect(x - 8, y - 1, 16, 2, '#7ab0cc');
          g.rect(x - 5, y - 5, 2, 2, '#7ab0cc');
          g.rect(x + 3, y - 5, 2, 2, '#7ab0cc');
          g.rect(x - 5, y + 3, 2, 2, '#7ab0cc');
          g.rect(x + 3, y + 3, 2, 2, '#7ab0cc');
        },
        intro: [
          'IT SNOWED LAST NIGHT.',
          'EVERY STEP GRIFFIN TAKES',
          'LEAVES PRINTS THAT',
          'BETRAY HIM TO THE MOB.',
        ],
        quote: '"Footmarks! Of course, I was still wearing boots!"',
        help: 'DRAG or ARROWS to move · dodge the SNOW REVEAL blobs · 22 seconds',
        winText: 'The last reveal cloud fades. You reach the barn door. Darkness — and safety — at last.',
        loseText: 'The footprints lead the mob straight to you. They close in from all sides.',

        init(api) {
          this.px      = api.W / 2;
          this.py      = api.H - 110;
          this.lives   = 3;
          this.hitCool = 0;
          this.elapsed = 0;
          this.goal    = 22;
          this.reveals = [];
          this.items   = [];
          this.spawnR  = 1.1;
          this.spawnI  = 3.5;
          // footprint trail (visual only)
          this.prints  = [];
          this.lastFX  = -999; this.lastFY = -999;
        },

        update(api, dt) {
          this.hitCool = Math.max(0, this.hitCool - dt);
          this.elapsed += dt;
          if (this.elapsed >= this.goal) { api.addScore(50); api.win(); return; }

          // movement
          const p = api.pointer;
          if (p.down) {
            const dx = p.x - this.px, dy = p.y - this.py;
            const d = Math.hypot(dx, dy);
            if (d > 6) {
              this.px += (dx / d) * 88 * dt;
              this.py += (dy / d) * 88 * dt;
            }
          }
          if (api.keyDown('left'))  this.px -= 88 * dt;
          if (api.keyDown('right')) this.px += 88 * dt;
          if (api.keyDown('up'))    this.py -= 88 * dt;
          if (api.keyDown('down'))  this.py += 88 * dt;
          this.px = U.clamp(this.px, 14, api.W - 14);
          this.py = U.clamp(this.py, 56, api.H - 56);

          // footprints (visual decoration)
          if (Math.hypot(this.px - this.lastFX, this.py - this.lastFY) > 24) {
            this.prints.push({ x: this.px, y: this.py, age: 0 });
            this.lastFX = this.px; this.lastFY = this.py;
            if (this.prints.length > 16) this.prints.shift();
          }
          for (const fp of this.prints) fp.age += dt;

          // spawn snow reveal blobs
          this.spawnR -= dt;
          if (this.spawnR <= 0) {
            this.spawnR = Math.max(0.48, 1.1 - this.elapsed * 0.028);
            this.reveals.push({
              x: U.rand(20, api.W - 20),
              y: -22,
              spd: 52 + this.elapsed * 1.8,
              r: 20,
            });
          }

          // spawn bonus items (scarves / hats)
          this.spawnI -= dt;
          if (this.spawnI <= 0) {
            this.spawnI = 3.8;
            this.items.push({ x: U.rand(20, api.W - 20), y: -14, spd: 45 });
          }

          // move reveals
          for (const rv of this.reveals) rv.y += rv.spd * dt;
          this.reveals = this.reveals.filter(rv => rv.y < api.H + 30);

          // move items
          for (const it of this.items) it.y += it.spd * dt;
          this.items = this.items.filter(it => it.y < api.H + 20);

          // reveal collisions
          if (this.hitCool <= 0) {
            for (let i = this.reveals.length - 1; i >= 0; i--) {
              const rv = this.reveals[i];
              if (Math.hypot(this.px - rv.x, this.py - rv.y) < rv.r + 10) {
                this.lives--;
                this.hitCool = 1.4;
                api.shake(5, 0.4);
                api.audio.sfx('hurt');
                api.flash('#cc1a1a', 0.3);
                this.reveals.splice(i, 1);
                if (this.lives <= 0) { api.audio.sfx('lose'); api.lose(); }
                break;
              }
            }
          }

          // item pickups
          for (let i = this.items.length - 1; i >= 0; i--) {
            const it = this.items[i];
            if (Math.hypot(this.px - it.x, this.py - it.y) < 18) {
              api.addScore(15);
              api.audio.sfx('coin');
              api.burst(it.x, it.y, '#80b0d0', 6);
              this.items.splice(i, 1);
            }
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#05070d');

          // grey snowy ground
          c.fillStyle = '#09101e'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#48586a'; c.fillRect(0, H - 46, W, 46);
          c.fillStyle = '#3a4858'; c.fillRect(0, H - 48, W, 3);

          // heavy falling snow
          c.globalAlpha = 0.45;
          for (let i = 0; i < 90; i++) {
            const sx = ((i * 41 + api.t * 20) % (W + 6)) - 3;
            const sy = ((i * 29 + api.t * 64) % (H + 6)) - 3;
            g.rect(Math.floor(sx), Math.floor(sy), 2, 2, '#b0c4d8');
          }
          c.globalAlpha = 1;

          // footprints (visual)
          for (const fp of this.prints) {
            const a = Math.max(0, 0.5 - fp.age * 0.18);
            c.globalAlpha = a;
            g.rect(fp.x - 4, fp.y - 3, 3, 5, '#7090a8');
            g.rect(fp.x + 1, fp.y - 3, 3, 5, '#7090a8');
            c.globalAlpha = 1;
          }

          // reveal blobs
          for (const rv of this.reveals) {
            c.globalAlpha = 0.7;
            g.circle(rv.x, rv.y, rv.r, '#8090a8');
            c.globalAlpha = 0.9;
            g.circle(rv.x, rv.y, rv.r - 5, '#a0b0c4');
            c.globalAlpha = 1;
            // pulse red if close
            const d = Math.hypot(this.px - rv.x, this.py - rv.y);
            if (d < 44) {
              c.globalAlpha = 0.45 + 0.35 * Math.sin(api.t * 22);
              c.strokeStyle = '#cc3333'; c.lineWidth = 2;
              c.beginPath();
              c.arc(rv.x, rv.y, rv.r + 3, 0, Math.PI * 2);
              c.stroke();
              c.globalAlpha = 1;
            }
            api.txtC('SNOW', rv.x, rv.y + 4, 6, '#30405a', true);
          }

          // bonus items (scarves)
          for (const it of this.items) {
            g.rect(it.x - 7, it.y - 3, 14, 5, '#7040a0');
            g.rect(it.x - 5, it.y + 2, 10, 4, '#7040a0');
            api.txtC('+', it.x, it.y - 10, 7, '#a060d0', true);
          }

          // Griffin (very faint shimmer — flickers when hit)
          const alpha = this.hitCool > 0
            ? (Math.sin(api.t * 20) > 0 ? 0.65 : 0.08)
            : 0.16;
          c.globalAlpha = alpha;
          g.rect(this.px - 8, this.py - 24, 16, 28, '#486080');
          g.rect(this.px - 6, this.py - 36, 12, 14, '#3a5070');
          g.rect(this.px - 5, this.py - 44, 10, 10, '#b8a898');
          c.globalAlpha = 1;

          // HUD
          const tLeft = Math.max(0, Math.ceil(this.goal - this.elapsed));
          api.topBar('SNOW BETRAYAL');
          api.txt(tLeft + 's', W - 6, 4, 9, '#5080a0', 'right', true);
          for (let i = 0; i < 3; i++) {
            g.rect(W - 70 + i * 18, 4, 12, 9,
              i < this.lives ? '#4a7090' : '#1a2a38');
          }
          api.vignette();
        },
      },

      /* =================== 4. KEMP'S HOUSE ====================== */
      {
        id: 'kemp', name: "KEMP'S HOUSE", sub: 'THE SOLDIERS SURROUND',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 5, 12, 10, '#2a3a56');
          g.rect(x - 5, y - 4, 5, 8, '#405878');
          g.rect(x + 1, y - 4, 4, 8, '#405878');
          g.rect(x - 1, y - 5, 2, 10, '#1e2a40');
          g.rect(x - 3, y - 4, 1, 6, '#cc2222');
        },
        intro: [
          'GRIFFIN HOLDS KEMP HOSTAGE.',
          'SOLDIERS HAMMER ON EVERY',
          'DOOR AND WINDOW.',
          '3 BREACHES LOSE — 28 SECONDS.',
        ],
        quote: '"The world could master me if it could! I had merely to fling aside my garments and vanish."',
        help: 'TAP breach points to repel soldiers before they break in · 28 seconds',
        winText: "The battering fades. Griffin has slipped out through the back. Kemp stares at an empty room.",
        loseText: 'The doors splinter and the soldiers pour in. Too many to hold.',

        init(api) {
          this.elapsed    = 0;
          this.goal       = 28;
          this.breachCount = 0;
          this.maxBreach  = 3;
          this.pts = [
            { x: 42,  y: 140, label: 'WINDOW', hp: 100 },
            { x: 228, y: 140, label: 'WINDOW', hp: 100 },
            { x: 42,  y: 265, label: 'DOOR',   hp: 100 },
            { x: 228, y: 265, label: 'DOOR',   hp: 100 },
            { x: 135, y: 355, label: 'GATE',   hp: 100 },
          ];
          this.breached  = [false, false, false, false, false];
          this.tapFlash  = [0, 0, 0, 0, 0];
        },

        update(api, dt) {
          this.elapsed += dt;
          if (this.elapsed >= this.goal) { api.addScore(50); api.win(); return; }

          const rate = 14 + this.elapsed * 0.5;
          for (let i = 0; i < this.pts.length; i++) {
            if (this.breached[i]) continue;
            this.pts[i].hp -= rate * dt;
            this.tapFlash[i] = Math.max(0, this.tapFlash[i] - dt * 5);
            if (this.pts[i].hp <= 0) {
              this.pts[i].hp = 0;
              this.breached[i] = true;
              this.breachCount++;
              api.shake(7, 0.45);
              api.audio.sfx('hurt');
              api.flash('#cc1a1a', 0.35);
              if (this.breachCount >= this.maxBreach) {
                api.audio.sfx('lose');
                setTimeout(() => api.lose(), 400);
              }
            }
          }

          // tap detection
          const p = api.pointer;
          if (p.justDown) {
            for (let i = 0; i < this.pts.length; i++) {
              if (this.breached[i]) continue;
              if (Math.hypot(p.x - this.pts[i].x, p.y - this.pts[i].y) < 38) {
                this.pts[i].hp = Math.min(100, this.pts[i].hp + 44);
                api.addScore(8);
                api.audio.sfx('blip');
                api.burst(this.pts[i].x, this.pts[i].y, '#4080a0', 6);
                this.tapFlash[i] = 1;
                break;
              }
            }
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#05080e');

          // room interior — dark wallpaper
          c.fillStyle = '#080c18'; c.fillRect(0, 0, W, H);
          // wainscoting
          c.fillStyle = '#0a0f1c'; c.fillRect(0, H - 120, W, 120);
          c.fillStyle = '#101828'; c.fillRect(0, H - 122, W, 3);
          // floor boards
          for (let x2 = 0; x2 < W; x2 += 30) {
            c.strokeStyle = '#0c1320'; c.lineWidth = 1;
            c.strokeRect(x2, H - 118, 28, 116);
          }

          // draw breach points
          for (let i = 0; i < this.pts.length; i++) {
            const pt = this.pts[i];
            const tf = this.tapFlash[i];
            const br = this.breached[i];

            const bx = pt.x - 32, by = pt.y - 34, bw = 64, bh = 64;
            c.fillStyle = br ? '#150606' : (tf > 0.4 ? '#0e2038' : '#0a1428');
            c.fillRect(bx, by, bw, bh);
            c.strokeStyle = br ? '#880000' : (tf > 0.4 ? '#4888c0' : '#1c3458');
            c.lineWidth = br ? 3 : (tf > 0.4 ? 2 : 1);
            c.strokeRect(bx, by, bw, bh);

            if (!br) {
              // HP bar (above box)
              const barW = 58;
              g.rect(pt.x - 29, by - 10, barW, 7, '#0c1828');
              const ratio = pt.hp / 100;
              const hc = ratio > 0.55 ? '#208050' : (ratio > 0.28 ? '#a09020' : '#cc2020');
              g.rect(pt.x - 29, by - 10, Math.round(barW * ratio), 7, hc);
              // label
              api.txtC(pt.label, pt.x, pt.y - 22, 6, tf > 0.4 ? '#60a8d8' : '#3a5878', true);
              api.txtC('TAP', pt.x, pt.y + 5, 7, tf > 0.4 ? '#80c0e0' : '#2e4e68', true);
            } else {
              // breached — big X
              g.rect(pt.x - 14, pt.y - 14, 4, 28, '#880000');
              g.rect(pt.x + 10, pt.y - 14, 4, 28, '#880000');
              g.rect(pt.x - 14, pt.y - 14, 28, 4, '#880000');
              g.rect(pt.x - 14, pt.y + 10, 28, 4, '#880000');
              api.txtC('BREACH', pt.x, pt.y + 22, 6, '#660000', true);
            }
          }

          // banging noise indicators
          const bang = Math.sin(api.t * 14) > 0.7;
          if (bang) {
            c.globalAlpha = 0.06;
            c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          // HUD
          const tLeft = Math.max(0, Math.ceil(this.goal - this.elapsed));
          api.topBar("KEMP'S HOUSE");
          api.txt(tLeft + 's', W - 6, 4, 9, '#5080a0', 'right', true);
          // breach counter
          api.txtC('BREACHES: ' + this.breachCount + ' / ' + this.maxBreach,
            W / 2, H - 18, 7, '#aa2020', true);
          api.vignette();
        },
      },

      /* =================== 5. THE DARK COMMONS =================== */
      {
        id: 'commons', name: 'THE DARK COMMONS', sub: 'THE MOB CLOSES IN',
        icon(api, x, y) {
          const g = api.gfx;
          // torch icon
          g.rect(x - 1, y + 1, 2, 8, '#4a3818');
          g.rect(x - 3, y - 6, 6, 8, '#b85018');
          g.rect(x - 2, y - 10, 4, 5, '#e87020');
          g.rect(x - 1, y - 13, 2, 4, '#ffa030');
        },
        intro: [
          'THE MOB FINDS GRIFFIN',
          'ON THE DARK COMMONS.',
          'RAIN MAKES HIM VISIBLE.',
          'DODGE TORCHES — 26 SECONDS.',
        ],
        quote: '"I am becoming visible!"',
        help: 'DRAG or ARROWS · dodge torch GLOW and thrown ROCKS · 26 seconds',
        winText: 'The last torch fades in the storm. Griffin staggers into the dark field — still free.',
        loseText: 'The mob closes in from every side. Griffin falls on the wet commons.',

        init(api) {
          this.px      = api.W / 2;
          this.py      = api.H / 2;
          this.lives   = 3;
          this.hitCool = 0;
          this.elapsed = 0;
          this.goal    = 26;
          this.rocks   = [];
          this.spawnRk = 1.8;
          // starting mob ring (6 torch-bearers slowly converge)
          const cx2 = api.W / 2, cy2 = api.H / 2;
          const angles = [0, 1.05, 2.09, 3.14, 4.19, 5.24];
          this.mob = angles.map(a => ({
            x: cx2 + Math.cos(a) * 105,
            y: cy2 + Math.sin(a) * 95,
            torchR: 48,
          }));
        },

        update(api, dt) {
          this.hitCool = Math.max(0, this.hitCool - dt);
          this.elapsed += dt;
          if (this.elapsed >= this.goal) { api.addScore(50); api.win(); return; }

          // movement
          const p = api.pointer;
          if (p.down) {
            const dx = p.x - this.px, dy = p.y - this.py;
            const d = Math.hypot(dx, dy);
            if (d > 6) {
              this.px += (dx / d) * 86 * dt;
              this.py += (dy / d) * 86 * dt;
            }
          }
          if (api.keyDown('left'))  this.px -= 86 * dt;
          if (api.keyDown('right')) this.px += 86 * dt;
          if (api.keyDown('up'))    this.py -= 86 * dt;
          if (api.keyDown('down'))  this.py += 86 * dt;
          this.px = U.clamp(this.px, 14, api.W - 14);
          this.py = U.clamp(this.py, 54, api.H - 54);

          // mob converges slowly
          const cf = 0.010 + this.elapsed * 0.00028;
          for (const m of this.mob) {
            const dx = this.px - m.x, dy = this.py - m.y;
            const d = Math.hypot(dx, dy);
            if (d > 35) {
              m.x += (dx / d) * cf * 60 * dt;
              m.y += (dy / d) * cf * 60 * dt;
            }
          }

          // torch glow damage
          if (this.hitCool <= 0) {
            for (const m of this.mob) {
              if (Math.hypot(this.px - m.x, this.py - m.y) < m.torchR - 5) {
                this.lives--;
                this.hitCool = 1.5;
                api.shake(5, 0.45);
                api.audio.sfx('hurt');
                api.flash('#cc1a1a', 0.3);
                if (this.lives <= 0) { api.audio.sfx('lose'); api.lose(); }
                break;
              }
            }
          }

          // spawn rocks (telegraph then land)
          this.spawnRk -= dt;
          if (this.spawnRk <= 0) {
            this.spawnRk = Math.max(0.7, 1.8 - this.elapsed * 0.04);
            this.rocks.push({
              tx: this.px + U.rand(-70, 70),
              ty: U.clamp(this.py + U.rand(-70, 70), 54, api.H - 54),
              warn: 0.85,
              landed: false,
              ttl: 0.4,
            });
          }
          for (let i = this.rocks.length - 1; i >= 0; i--) {
            const rk = this.rocks[i];
            if (!rk.landed) {
              rk.warn -= dt;
              if (rk.warn <= 0) rk.landed = true;
            } else {
              rk.ttl -= dt;
              if (rk.ttl <= 0) { this.rocks.splice(i, 1); continue; }
              if (this.hitCool <= 0 &&
                  Math.hypot(this.px - rk.tx, this.py - rk.ty) < 16) {
                this.lives--;
                this.hitCool = 1.5;
                api.shake(5, 0.4);
                api.audio.sfx('hurt');
                api.flash('#cc1a1a', 0.3);
                if (this.lives <= 0) { api.audio.sfx('lose'); api.lose(); }
              }
            }
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#04060a');

          // dark wet commons
          c.fillStyle = '#060810'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#0a0e18'; c.fillRect(0, H - 46, W, 46);

          // rain streaks
          c.globalAlpha = 0.22;
          for (let i = 0; i < 60; i++) {
            const rx = (i * 51 + Math.floor(api.t * 38) * 5) % W;
            const ry = (i * 37 + Math.floor(api.t * 38) * 9) % H;
            g.rect(rx, ry, 1, 7, '#6a7a90');
          }
          c.globalAlpha = 1;

          // torch glows (radial amber)
          for (const m of this.mob) {
            const grd = c.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.torchR);
            grd.addColorStop(0, 'rgba(180,120,30,0.28)');
            grd.addColorStop(0.65, 'rgba(160,100,20,0.12)');
            grd.addColorStop(1, 'rgba(160,100,20,0)');
            c.fillStyle = grd;
            c.beginPath(); c.arc(m.x, m.y, m.torchR, 0, Math.PI * 2); c.fill();
          }

          // mob members
          for (const m of this.mob) {
            g.rect(m.x - 5, m.y - 18, 10, 22, '#252830');
            g.rect(m.x - 4, m.y - 30, 8, 14, '#b09880');
            // torch (held to one side)
            const tx2 = m.x + 8;
            g.rect(tx2 - 1, m.y - 26, 2, 14, '#4a3010');
            g.rect(tx2 - 3, m.y - 32, 6, 8, '#b04818');
            g.rect(tx2 - 2, m.y - 36, 4, 6, '#e06820');
            c.globalAlpha = 0.38 + 0.08 * Math.sin(api.t * 9 + m.x);
            g.circle(tx2, m.y - 30, 9, '#f08018');
            c.globalAlpha = 1;
          }

          // rocks: warning X then impact splash
          for (const rk of this.rocks) {
            if (!rk.landed) {
              // warning — pulsing X
              c.globalAlpha = 0.5 + 0.4 * Math.sin(api.t * 20);
              g.rect(rk.tx - 8, rk.ty - 2, 16, 4, '#cc2222');
              g.rect(rk.tx - 2, rk.ty - 8, 4, 16, '#cc2222');
              c.globalAlpha = 1;
            } else {
              // rock impact
              const prog = 1 - rk.ttl / 0.4;
              g.rect(rk.tx - 7, rk.ty - 7, 14, 14, '#606070');
              g.rect(rk.tx - 5, rk.ty - 5, 10, 10, '#8080a0');
              c.globalAlpha = 0.4 * (1 - prog);
              g.circle(rk.tx, rk.ty, 14 + prog * 10, '#aa8040');
              c.globalAlpha = 1;
            }
          }

          // Griffin — more visible in rain
          const alpha = this.hitCool > 0
            ? (Math.sin(api.t * 20) > 0 ? 0.75 : 0.1)
            : 0.38;
          c.globalAlpha = alpha;
          g.rect(this.px - 8, this.py - 24, 16, 28, '#486080');
          g.rect(this.px - 6, this.py - 36, 12, 14, '#3a5070');
          g.rect(this.px - 5, this.py - 44, 10, 10, '#c0b0a0');
          g.rect(this.px - 6, this.py - 48, 12, 5, '#1a1c24');
          c.globalAlpha = 1;

          // HUD
          const tLeft = Math.max(0, Math.ceil(this.goal - this.elapsed));
          api.topBar('THE DARK COMMONS');
          api.txt(tLeft + 's', W - 6, 4, 9, '#5080a0', 'right', true);
          for (let i = 0; i < 3; i++) {
            g.rect(W - 70 + i * 18, 4, 12, 9,
              i < this.lives ? '#4a7090' : '#1a2a38');
          }
          api.vignette();
          api.scanlines();
        },
      },

    ], // end chapters
  }); // end RetroSaga.create
})();
