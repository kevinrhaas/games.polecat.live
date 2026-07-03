/* ============================================================================
 * A TRIP TO THE MOON (1902)  —  games.polecat.live
 * Five chapters through Méliès' masterpiece:
 *   1. THE CONGRESS       — timing: vote for the expedition (gavel/bell)
 *   2. INTO THE CANNON    — precision rings: load the capsule
 *   3. THROUGH THE STARS  — free-move dodge: steer through starlit space
 *   4. SELENITE CAVES     — whack/defend: fight Moon creatures
 *   5. THE SPLASHDOWN     — steer: fall back to Earth and hit the ocean
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    void:    '#06040e',  // deep space
    moon:    '#b8ccd8',  // moon surface
    crater:  '#5a7082',  // dark crater
    star:    '#ffe080',  // golden star
    brass:   '#c88020',  // brass capsule
    fire:    '#c83010',  // fire / Victorian red
    sel:     '#30c0a0',  // selenite teal
    sky:     '#2060c0',  // Victorian blue sky
    ocean:   '#1060a0',  // ocean blue
    earth:   '#2a6030',  // Earth green
    pale:    '#c0d8ee',  // pale moon light
    dim:     '#3a506a',  // dark blue-grey
  };

  /* ─── EMBLEM: the iconic Méliès Moon face ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // halo glow
    c.globalAlpha = 0.35;
    c.fillStyle = '#ffe080';
    c.beginPath(); c.arc(cx, cy, 38, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    // moon disc
    g.circle(cx, cy, 30, '#c8d8e4');
    // shadow crescent
    g.circle(cx + 6, cy, 26, '#b0c4d4');
    // eye sockets
    g.circle(cx - 10, cy - 7, 7, '#8090a0');
    g.circle(cx + 9,  cy - 7, 7, '#8090a0');
    // pupils
    g.circle(cx - 9,  cy - 8, 3, '#1a2230');
    g.circle(cx + 10, cy - 8, 3, '#1a2230');
    // nose bridge
    g.rect(cx - 2, cy + 1, 4, 7, '#7090a0');
    // mouth curve
    c.strokeStyle = '#4a6070'; c.lineWidth = 3;
    c.beginPath(); c.arc(cx, cy + 14, 12, Math.PI * 0.1, Math.PI * 0.9); c.stroke();
    // capsule stuck in right eye
    g.rect(cx + 9 - 2, cy - 7 - 3, 4, 10, C.brass);
    g.circle(cx + 9, cy - 7 - 3, 3, C.fire);
  }

  /* ─── SCENERY ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Deep space base
    c.fillStyle = C.void; c.fillRect(0, 0, W, H);

    // Twinkling stars
    for (let i = 0; i < 55; i++) {
      const sx = (i * 53 + 7)  % W;
      const sy = (i * 97 + 13) % (H * 0.8);
      const a  = 0.2 + 0.6 * Math.abs(Math.sin(t * (0.8 + (i % 5) * 0.3) + i));
      c.globalAlpha = a;
      g.rect(sx, sy, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1, C.star);
    }
    c.globalAlpha = 1;

    if (scene === 'menu') {
      // Paris rooftops silhouette
      c.fillStyle = '#080616';
      for (let i = 0; i < 7; i++) {
        const bx = i * 40, bh = 55 + (i * 23) % 28;
        c.fillRect(bx, H - bh, 36, bh);
        c.fillRect(bx + 14, H - bh - 14, 8, 14); // chimney
      }
      // Great cannon silhouette pointing up-right
      c.save(); c.translate(32, H - 105); c.rotate(-Math.PI * 0.38);
      c.fillStyle = '#201830'; c.fillRect(-7, -44, 14, 88); c.fillRect(-11, 36, 22, 16);
      c.restore();
      // Moon (with face) in upper right
      drawMoonFace(g, c, W - 50, 56, 32);
      // French tricolour mini-flag
      g.rect(W / 2 - 15, 16, 10, 18, '#2040c0');
      g.rect(W / 2 - 5,  16, 10, 18, '#e8e8e0');
      g.rect(W / 2 + 5,  16, 10, 18, C.fire);
      c.fillStyle = '#8a5020'; c.fillRect(W / 2 - 1, 10, 2, 26);
      // Dim overlay to let map show
      c.fillStyle = 'rgba(4,2,10,.42)'; c.fillRect(0, 0, W, H);

    } else {
      // Moon face in upper right for non-menu scenes
      if (scene !== 'boot') drawMoonFace(g, c, W - 44, 44, 24);
      // Earth in lower left for result / finale
      if (scene === 'result' || scene === 'finale') {
        g.circle(30, H - 36, 22, C.earth);
        c.fillStyle = '#1a4820'; c.beginPath(); c.ellipse(28, H - 40, 7, 5, -0.3, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#1a4820'; c.beginPath(); c.ellipse(36, H - 30, 5, 4, 0.5,  0, Math.PI * 2); c.fill();
      }
    }

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(4,2,10,.62)'; c.fillRect(0, 0, W, H);
    }
  }

  function drawMoonFace(g, c, mx, my, r) {
    g.circle(mx, my, r,     '#c8d8e4');
    g.circle(mx + Math.round(r * 0.2), my, Math.round(r * 0.86), '#b0c4d4');
    const er = Math.max(3, Math.round(r * 0.22));
    g.circle(mx - Math.round(r * 0.33), my - Math.round(r * 0.22), er, '#8090a0');
    g.circle(mx + Math.round(r * 0.30), my - Math.round(r * 0.22), er, '#8090a0');
    c.strokeStyle = '#4a6070'; c.lineWidth = 2;
    c.beginPath(); c.arc(mx, my + Math.round(r * 0.42), Math.round(r * 0.36), 0.15, Math.PI - 0.15); c.stroke();
  }

  /* ─── MENU: parabolic voyage arc from Paris → Moon → Ocean ─── */
  const menu = {
    layout(api) {
      // Arc: Earth/Paris (lower-left) → launch → apex in space → Moon (upper-right) → splashdown (lower-right)
      return [
        { x: 8,   y: 376, w: 58, h: 52 }, // 1 Congress (Earth)
        { x: 60,  y: 256, w: 58, h: 52 }, // 2 Cannon (launch)
        { x: 103, y: 130, w: 58, h: 52 }, // 3 Stars (apex)
        { x: 158, y: 52,  w: 58, h: 52 }, // 4 Moon
        { x: 200, y: 226, w: 58, h: 52 }, // 5 Splashdown (return)
      ];
    },
    title(api, stardust) {
      const c = api.ctx, W = api.W;
      // Dotted arc connecting the stops
      const centers = [
        [37, 402], [89, 282], [132, 156], [187, 78], [229, 252],
      ];
      c.setLineDash([3, 6]); c.strokeStyle = C.brass; c.lineWidth = 1.5; c.globalAlpha = 0.75;
      c.beginPath();
      centers.forEach(([x, y], i) => i === 0 ? c.moveTo(x, y) : c.lineTo(x, y));
      c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
      // Title at bottom
      api.txtCFit('THE GREAT EXPEDITION', W / 2, 448, 9, C.star,  false, W - 16);
      api.txtCFit('STARDUST  ' + stardust, W / 2, 464, 8, C.sel, false, W - 16);
    },
    card(api, { ch, i, x, y, w, h, sel, done }) {
      const g = api.gfx, c = api.ctx;
      const cx = x + w / 2, cy = y + h / 2;
      const r = 24; // octagon radius
      // Draw octagonal magic-lantern slide frame
      c.beginPath();
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2 - Math.PI / 8;
        const px = cx + r * Math.cos(ang), py = cy + r * Math.sin(ang);
        a === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
      }
      c.closePath();
      c.fillStyle = done ? '#2a200e' : sel ? '#140e28' : '#0c0818';
      c.fill();
      c.strokeStyle = done ? C.star : sel ? '#ffe080' : C.brass;
      c.lineWidth = sel ? 3 : 1.5;
      c.stroke();
      // Corner rivets
      for (let a = 0; a < 4; a++) {
        const ang = (a / 4) * Math.PI * 2 + Math.PI / 4;
        g.circle(Math.round(cx + (r - 4) * Math.cos(ang)), Math.round(cy + (r - 4) * Math.sin(ang)), 2, sel ? '#ffe080' : '#7a6030');
      }
      // Inner glass disc
      c.fillStyle = sel ? 'rgba(255,220,80,.12)' : done ? 'rgba(200,160,40,.08)' : 'rgba(80,100,140,.10)';
      c.beginPath(); c.arc(cx, cy, r - 5, 0, Math.PI * 2); c.fill();
      // Chapter icon
      if (ch.icon) ch.icon(api, cx, cy - 5);
      // Number label
      api.txtC('' + (i + 1), cx, cy + 9, 9, done ? C.star : sel ? '#ffe080' : C.dim, true);
      // Name label below card
      api.txtCFit(ch.name, cx, y + h + 9, 5, sel ? C.sel : '#506070', false, w + 14);
    },
  };

  /* ============================ CHAPTERS ============================ */
  RetroSaga.create({
    id:        'tripmoon-1902',
    title:     'A TRIP TO THE MOON',
    subtitle:  'MÉLIÈS · 1902',
    credit:    'TRIBUTE TO THE FILM BY GEORGES MÉLIÈS',
    currency:  'STARDUST',
    bootCta:   'TO THE MOON!',
    bootLine:  'Fire the great cannon — and bring back wonders from the Moon!',
    menuLabel: 'THE GREAT EXPEDITION',
    menuHint:  'CHOOSE YOUR CHAPTER',
    menuDone:  'THE EXPEDITION TRIUMPHS',
    finale:    ['THE GREAT CAPSULE SURFACES.', 'SAILORS CHEER FROM THE DECK.', '', 'PARIS ERUPTS IN JOY.', '', 'PROFESSOR BARBENFOUILLIS', 'TAKES HIS BOW!'],
    accent:    '#c88020',
    emblem,
    scenery,
    menu,
    screens: {
      win:          '#ffe080',
      lose:         '#7090a0',
      chapterLabel: '#30c0a0',
      name:         '#ffe080',
      sub:          '#c0d4f0',
      intro:        '#d0e4ff',
      quote:        '#8aaac0',
      help:         '#b8d4f8',
      score:        '#ffe080',
      cur:          '#30c0a0',
      cta:          '#c88020',
      overlay:      '#06040e',
    },
    labels: {
      chapter: 'CHAPTER',
      score:   'STARDUST',
      win:     'ONWARD TO GLORY',
      lose:    'MISSION ABORTED',
      cont:    'CONTINUE EXPEDITION',
      finale:  'TAKE A BOW',
      toMenu:  'RETURN TO MAP',
      play:    'BLAST OFF',
    },
    width: 270, height: 480, parent: '#game',

    /* ============================================================
     * CHAPTER 1 — THE CONGRESS  (Timing: gavel/bell)
     * ============================================================ */
    chapters: [
      {
        id: 'congress', name: 'THE CONGRESS', sub: 'THE VOTE',
        intro: [
          'PROFESSOR BARBENFOUILLIS',
          'CALLS THE GRAND ASSEMBLY.',
          'THE ASTRONOMERS DEBATE...',
          'WHO DARES GO TO THE MOON?',
        ],
        quote: '"To the Moon! We shall plant the flag of Science upon the face of Night itself." — Barbenfouillis',
        help: 'TAP / SPACE when the gavel hits the GOLD BELL!',
        winText: 'SIX VOTES — THE CONGRESS ROARS! THE EXPEDITION IS GO!',
        loseText: 'The ayes fall short. The great dream wavers.',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 9, y - 3, 18, 7, C.brass);   // gavel head
          g.rect(x - 1, y + 4,  2, 11, '#8b5e3c'); // handle
          g.circle(x, y - 12, 5, C.star);          // bell
        },
        init(api) {
          this.votes   = 0; this.need     = 6;
          this.pos     = 0; this.dir      = 1;
          this.spd     = 0.52;               // sweeps ~1.8s per full cycle initially
          this.zone    = 0.10;               // hit window width
          this.misses  = 0; this.maxMiss   = 3;
          this.struck  = false; this.sT    = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          if (this.struck) {
            this.sT += dt;
            if (this.sT > 0.55) this.struck = false;
            return;
          }
          this.pos += this.dir * this.spd * 0.04 * f;
          if (this.pos > 1) { this.pos = 1; this.dir = -1; }
          if (this.pos < 0) { this.pos = 0; this.dir  =  1; }
          if (api.confirm()) {
            const off = Math.abs(this.pos - 0.5);
            this.struck = true; this.sT = 0;
            if (off < this.zone) {
              this.votes++;
              api.addScore(30);
              api.audio.sfx('coin');
              api.burst(api.W / 2, Math.round(api.H * 0.36), C.star, 10);
              this.spd  = Math.min(1.6, this.spd  + 0.12);
              this.zone = Math.max(0.07, this.zone - 0.005);
              if (this.votes >= this.need) { api.addScore(90); api.win(); }
            } else {
              this.misses++;
              api.audio.sfx('hurt'); api.shake(3, 0.18);
              if (this.misses >= this.maxMiss) api.lose();
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dark auditorium
          g.rect(0, 0, W, H, '#07050e');
          // Stage
          g.rect(0, H - 90, W, 90, '#110e1e');
          g.rect(0, H - 92, W,  4, '#221e3a');
          // Audience silhouettes
          for (let i = 0; i < 13; i++) {
            const hx = i * 21 + 2, hh = 22 + (i * 13) % 14;
            g.rect(hx, H - 92 - hh, 15, hh, '#0e0a1a');
            g.circle(hx + 7, H - 95 - hh, 7, '#0e0a1a');
          }
          // Podium
          g.rect(W / 2 - 22, H - 90, 44, 38, '#18143a');
          g.rectO(W / 2 - 22, H - 90, 44, 38, '#33295a', 1);
          // Professor sprite
          g.sprite([
            '..bb..',
            '.bwwb.',
            'bbwwbb',
            '.bwwb.',
            '..bb..',
            '.b..b.',
          ], W / 2 - 9, H - 130, { b: '#1a1040', w: '#c8c0d8' }, 3);
          // Bell
          const bellY = H - 148;
          g.circle(W / 2, bellY, 13, C.star);
          g.circle(W / 2, bellY + 5, 4, C.brass);
          // Gavel pendulum
          const gavelX = W / 2 - 52 + this.pos * 104;
          c.strokeStyle = '#7a4e2c'; c.lineWidth = 4;
          c.beginPath(); c.moveTo(W / 2, bellY - 22); c.lineTo(gavelX, bellY - 22 + 30); c.stroke();
          // Gavel head
          const inZ = Math.abs(this.pos - 0.5) < this.zone;
          g.rect(gavelX - 10, bellY + 4, 20, 8, inZ ? '#ffe080' : C.brass);
          // Strike flash
          if (this.struck && this.votes > 0) {
            c.globalAlpha = Math.max(0, 0.55 - this.sT * 1.8);
            g.circle(W / 2, bellY, 26, '#ffe080');
            c.globalAlpha = 1;
          }
          // Sweep bar at bottom
          const bw = W - 52, bx = 26;
          g.rect(bx, H - 30, bw,  8, '#12101e');
          g.rect(bx + bw * (0.5 - this.zone), H - 30, bw * this.zone * 2, 8, 'rgba(255,224,80,.26)');
          g.rect(bx + bw * 0.5 - 1, H - 34, 2, 16, C.star);
          g.rect(bx + bw * this.pos - 3, H - 35, 5, 18, inZ ? '#5dff8f' : '#d09828');
          api.topBar('VOTES: ' + this.votes + '/' + this.need + '   MISSES: ' + this.misses + '/' + this.maxMiss);
        },
      },

      /* ============================================================
       * CHAPTER 2 — INTO THE CANNON  (Precision rings: load capsule)
       * ============================================================ */
      {
        id: 'cannon', name: 'INTO THE CANNON', sub: 'THE LAUNCH',
        intro: [
          'THE IRON CANNON IS FORGED!',
          'THE CAPSULE MUST BE LOADED.',
          'FIVE PRECISE CHARGES...',
          '...THEN THE TRIGGER IS PULLED.',
        ],
        quote: '"Fire!" — The crowd holds its breath. The great machine speaks.',
        help: 'TAP / SPACE when the ring hits the TARGET CIRCLE!',
        winText: 'FIRE! THE CAPSULE ROARS INTO THE NIGHT SKY!',
        loseText: 'The charge misfires. The barrel smokes in silence.',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.save(); c.translate(x, y); c.rotate(-Math.PI * 0.28);
          g.rect(-4, -16, 8, 32, C.dim);
          g.rect(-6, 12, 12, 10, C.dim);
          c.restore();
          g.circle(x + 7, y - 10, 6, C.brass);
        },
        init(api) {
          this.loads     = 0;  this.need    = 5;
          this.ring      = 1.0;               // 1=outer, 0=center
          this.shrinkSpd = 0.38;              // ring contracts ~2.6s to reach zone
          this.zone      = 0.07;
          this.misses    = 0;  this.maxMiss  = 3;
          this.cd        = 0;
          this.fired     = false; this.fireT = 0;
        },
        update(api, dt) {
          if (this.fired) {
            this.fireT += dt;
            if (this.fireT > 1.2) { api.addScore(90); api.win(); }
            return;
          }
          if (this.cd > 0) { this.cd -= dt; return; }
          this.ring -= this.shrinkSpd * dt;
          if (this.ring < 0) {
            // ring overshot center — automatic miss
            this.ring = 1.0;
            this.misses++;
            api.audio.sfx('hurt'); api.shake(3, 0.15);
            if (this.misses >= this.maxMiss) { api.lose(); return; }
            this.cd = 0.5;
            return;
          }
          if (api.confirm()) {
            const off = Math.abs(this.ring - this.zone);
            if (off < this.zone + 0.05) {
              this.loads++;
              api.addScore(Math.round((1 - off / (this.zone + 0.05)) * 45 + 20));
              api.audio.sfx('power'); api.shake(5, 0.28);
              api.burst(api.W / 2, Math.round(api.H * 0.4), C.brass, 12);
              this.shrinkSpd = Math.min(0.9, this.shrinkSpd + 0.07);
              this.zone      = Math.max(0.04, this.zone     - 0.005);
              this.ring = 1.0; this.cd = 0.35;
              if (this.loads >= this.need) {
                this.fired = true; this.fireT = 0;
                api.audio.sfx('win');
              }
            } else {
              this.misses++;
              api.audio.sfx('hurt'); api.shake(3, 0.15);
              this.ring = 1.0; this.cd = 0.35;
              if (this.misses >= this.maxMiss) api.lose();
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          g.rect(0, 0, W, H, '#080610');
          // Cannon barrel — top-down view (looking down the bore)
          const bx = W / 2, by = Math.round(H * 0.42);
          for (let r2 = 76; r2 >= 8; r2 -= 5) {
            const b = Math.round(22 + r2 * 0.9);
            c.fillStyle = `rgb(${b},${Math.round(b * 0.8)},${Math.round(b * 1.1)})`;
            c.beginPath(); c.arc(bx, by, r2, 0, Math.PI * 2); c.fill();
          }
          g.circle(bx, by,  9, '#070515');
          g.circle(bx, by,  5, C.sel);
          // Target ring (zone indicator)
          c.strokeStyle = C.sel; c.lineWidth = 1.5; c.globalAlpha = 0.38;
          c.beginPath(); c.arc(bx, by, Math.round(this.zone * 70 + 5), 0, Math.PI * 2); c.stroke();
          c.globalAlpha = 1;
          // Contracting ring
          const ringR = Math.max(5, Math.round(this.ring * 70));
          const atZ   = Math.abs(this.ring - this.zone) < this.zone + 0.05;
          c.strokeStyle = atZ ? '#5dff8f' : C.star;
          c.lineWidth   = atZ ? 3.5 : 2.5;
          c.beginPath(); c.arc(bx, by, ringR, 0, Math.PI * 2); c.stroke();
          // Fire blast (when launched)
          if (this.fired) {
            const prog = Math.min(1, this.fireT * 1.8);
            c.globalAlpha = 1 - prog;
            g.rect(0, 0, W, H, '#ffe080');
            c.globalAlpha = 1;
            const capY = by - Math.round(prog * by * 2);
            g.circle(bx, capY, 11, C.brass);
            g.circle(bx - 2, capY - 3, 5, C.star);
          }
          // Workers around the barrel
          const workerPos = [[bx - 66, by + 34], [bx + 62, by + 28], [bx - 44, by - 54]];
          workerPos.forEach(([wx, wy]) => {
            g.sprite(['.bb.', 'bwwb', '.bb.', 'b..b'], wx - 6, wy - 12, { b: '#18183a', w: '#b0a8c0' }, 3);
          });
          api.topBar('LOADS: ' + this.loads + '/' + this.need + '   MISSES: ' + this.misses + '/' + this.maxMiss);
        },
      },

      /* ============================================================
       * CHAPTER 3 — THROUGH THE STARS  (Free-move dodge, 24 seconds)
       * ============================================================ */
      {
        id: 'space', name: 'THROUGH THE STARS', sub: 'THE JOURNEY',
        intro: [
          'THE CAPSULE SOARS!',
          'STAR-DANCERS WALTZ PAST.',
          'COMETS SHOWER THE SKY.',
          'STEER THROUGH THE VOID!',
        ],
        quote: '"They sailed through the heavens, amid the dancing spirits of the stars." — Méliès program notes',
        help: 'TAP & DRAG or ARROWS to steer! Dodge star-dancers and comets!',
        winText: 'THE MOON SWELLS BEFORE YOU — YOU ARE NEARLY THERE!',
        loseText: 'The capsule spins away into the endless void...',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 7, C.brass);
          g.rect(x - 2, y - 12, 4, 6,  C.sel);  // antenna
          g.rect(x - 12, y - 2, 7, 4,  C.sel);  // fin L
          g.rect(x + 5,  y - 2, 7, 4,  C.sel);  // fin R
        },
        init(api) {
          this.t        = 0; this.dur = 24;
          this.px       = api.W / 2; this.py = Math.round(api.H * 0.62);
          this.lives    = 3;
          this.dancers  = [];
          this.comets   = [];
          this.spawnT   = 0;
          this.hurt     = 0;
          this.done     = false;
        },
        update(api, dt) {
          if (this.done) return;
          this.t += dt;
          if (this.t >= this.dur) { api.addScore(100); api.win(); return; }

          // Player movement
          const spd = 118;
          if (api.keyDown('left'))  this.px -= spd * dt;
          if (api.keyDown('right')) this.px += spd * dt;
          if (api.keyDown('up'))    this.py -= spd * dt;
          if (api.keyDown('down'))  this.py += spd * dt;
          if (api.pointer.down) {
            const dx = api.pointer.x - this.px, dy = api.pointer.y - this.py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 8) {
              this.px += (dx / dist) * spd * dt;
              this.py += (dy / dist) * spd * dt;
            }
          }
          this.px = clamp(this.px, 13, api.W - 13);
          this.py = clamp(this.py, 13, api.H - 13);

          // Spawn
          this.spawnT += dt;
          const rate = Math.max(0.55, 1.4 - this.t * 0.033);
          if (this.spawnT > rate) {
            this.spawnT = 0;
            const left = Math.random() < 0.5;
            this.dancers.push({
              x: left ? -22 : api.W + 22,
              y: 50 + Math.random() * (api.H - 90),
              vx: left ? 55 + Math.random() * 35 : -(55 + Math.random() * 35),
              vy: (Math.random() - 0.5) * 45,
              ph: Math.random() * Math.PI * 2,
            });
            this.comets.push({
              x: 16 + Math.random() * (api.W - 32),
              y: -18,
              vy: 95 + Math.random() * 65,
              vx: (Math.random() - 0.5) * 44,
            });
          }

          // Move
          this.dancers = this.dancers.filter(d => {
            d.x += d.vx * dt; d.y += d.vy * dt;
            return d.x > -32 && d.x < api.W + 32;
          });
          this.comets = this.comets.filter(cm => {
            cm.x += cm.vx * dt; cm.y += cm.vy * dt;
            return cm.y < api.H + 22;
          });

          // Collision (immune while hurt)
          if (this.hurt > 0) { this.hurt -= dt; return; }
          const r = 10;
          for (const d of this.dancers) {
            if (Retro.util.dist(this.px, this.py, d.x, d.y) < r + 9) {
              this.lives--; this.hurt = 1.0;
              api.audio.sfx('hurt'); api.shake(6, 0.3); api.flash('#b0c4d8', 0.22);
              if (this.lives <= 0) { api.lose(); this.done = true; } return;
            }
          }
          for (const cm of this.comets) {
            if (Retro.util.dist(this.px, this.py, cm.x, cm.y) < r + 6) {
              this.lives--; this.hurt = 1.0;
              api.audio.sfx('hurt'); api.shake(6, 0.3); api.flash(C.star, 0.18);
              if (this.lives <= 0) { api.lose(); this.done = true; } return;
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          g.rect(0, 0, W, H, '#06040e');
          // Stars
          for (let i = 0; i < 64; i++) {
            const sx = (i * 53 + 7) % W, sy = (i * 97 + 13) % H;
            c.globalAlpha = 0.15 + 0.55 * Math.abs(Math.sin(api.t * (0.8 + i % 5 * 0.25) + i));
            g.rect(sx, sy, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1, C.star);
          }
          c.globalAlpha = 1;
          // Moon growing ahead (upper-right)
          const ms = 12 + (this.t / this.dur) * 28;
          drawMoonFace(g, c, W - 44, 40, ms);
          // Star dancers
          for (const d of this.dancers) {
            c.globalAlpha = 0.82;
            g.sprite(
              ['.s.s.', '.sss.', 'sssss', '..s..', '.s.s.'],
              Math.round(d.x) - 5, Math.round(d.y) - 10,
              { s: '#ffe080' }, 2,
            );
            c.globalAlpha = 0.55;
            c.strokeStyle = 'rgba(255,224,80,.5)'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(d.x - 9, d.y); c.lineTo(d.x + 9, d.y); c.stroke();
            c.beginPath(); c.moveTo(d.x, d.y - 9); c.lineTo(d.x, d.y + 9); c.stroke();
            c.globalAlpha = 1;
          }
          // Comets
          for (const cm of this.comets) {
            c.globalAlpha = 0.6;
            g.rect(Math.round(cm.x) - 1, Math.round(cm.y) - 14, 2, 14, 'rgba(200,180,90,.6)');
            g.circle(Math.round(cm.x), Math.round(cm.y), 4, C.star);
            c.globalAlpha = 1;
          }
          // Capsule (blink when hurt)
          const blink = this.hurt > 0 && Math.floor(this.hurt * 8) % 2 === 0;
          if (!blink) {
            // Exhaust
            c.globalAlpha = 0.5;
            g.rect(Math.round(this.px) - 2, Math.round(this.py) + 11, 4, 9, C.fire);
            c.globalAlpha = 1;
            g.circle(Math.round(this.px), Math.round(this.py), 10, C.brass);
            g.circle(Math.round(this.px) - 2, Math.round(this.py) - 2, 4, C.star);
          }
          // Lives
          for (let i = 0; i < this.lives; i++) g.circle(12 + i * 18, H - 14, 5, C.brass);
          // Countdown timer bar
          const prog = this.t / this.dur;
          g.rect(0, H - 6, Math.round(W * prog), 6, C.sel);
          api.topBar('SURVIVE: ' + Math.ceil(Math.max(0, this.dur - this.t)) + 's');
        },
      },

      /* ============================================================
       * CHAPTER 4 — SELENITE CAVES  (Whack/defend: tap Moon creatures)
       * ============================================================ */
      {
        id: 'selenites', name: 'SELENITE CAVES', sub: "THE MOON'S CREATURES",
        intro: [
          "THE MOON'S SURFACE!",
          'SELENITES BURST FROM CRATERS —',
          'CLICKING CLAWS REACHING!',
          'DRIVE THEM BACK!',
        ],
        quote: '"We are not alone upon the Moon. Heaven preserve us." — expedition journal',
        help: 'TAP the Selenites before they reach you! 3 breaches = failure!',
        winText: 'THE SELENITES FLEE! THE SURFACE IS OURS!',
        loseText: 'The creatures swarm. The team retreats in chaos.',
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite(['.t.t.', 'ttttt', '.ttt.', '..t..', '.t.t.'], x - 5, y - 10, { t: C.sel }, 2);
        },
        init(api) {
          this.defeated  = 0; this.need     = 20;
          this.breaches  = 0; this.maxBreach = 3;
          this.craters   = [
            { x: 46, y: 98 }, { x: 135, y: 78 }, { x: 222, y: 106 },
            { x: 64, y: 218 }, { x: 195, y: 200 }, { x: 132, y: 185 },
          ];
          this.active      = [];
          this.spawnT      = 0;
          this.spawnRate   = 2.2;
          this.done        = false;
        },
        update(api, dt) {
          if (this.done) return;
          // Spawn
          this.spawnT += dt;
          const maxSimul = this.defeated < 6 ? 1 : this.defeated < 13 ? 2 : 3;
          while (this.spawnT > this.spawnRate && this.active.length < maxSimul) {
            this.spawnT   -= this.spawnRate;
            this.spawnRate = Math.max(0.85, this.spawnRate - 0.045);
            const cr = this.craters[Math.floor(Math.random() * this.craters.length)];
            this.active.push({ x: cr.x, y: cr.y, prog: 0, speed: 0.22 + Math.random() * 0.06, cx: cr.x, cy: cr.y });
            api.audio.sfx('blip');
          }
          // Move towards center
          const centX = api.W / 2, centY = Math.round(api.H * 0.68);
          for (const s of this.active) {
            s.prog = Math.min(1, s.prog + s.speed * dt);
            s.x = s.cx + (centX - s.cx) * s.prog;
            s.y = s.cy + (centY - s.cy) * s.prog;
          }
          // Check breaches
          for (let i = this.active.length - 1; i >= 0; i--) {
            if (this.active[i].prog >= 1.0) {
              this.active.splice(i, 1);
              this.breaches++;
              api.audio.sfx('hurt'); api.shake(7, 0.3); api.flash(C.sel, 0.18);
              if (this.breaches >= this.maxBreach) { api.lose(); this.done = true; return; }
            }
          }
          // Tap to defeat
          if (api.pointer.justDown) {
            for (let i = this.active.length - 1; i >= 0; i--) {
              const s = this.active[i];
              if (Retro.util.dist(api.pointer.x, api.pointer.y, s.x, s.y) < 24) {
                this.active.splice(i, 1);
                this.defeated++;
                api.addScore(26);
                api.burst(Math.round(s.x), Math.round(s.y), C.sel, 7);
                api.audio.sfx('coin');
                if (this.defeated >= this.need) {
                  api.addScore(90); api.win(); this.done = true; return;
                }
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Moon surface
          g.rect(0, 0, W, H, '#080e16');
          // Ground
          g.rect(0, Math.round(H * 0.56), W, H, '#131e2a');
          g.rect(0, Math.round(H * 0.56) - 2, W, 3, '#20364e');
          // Stars
          for (let i = 0; i < 28; i++) {
            const sx = (i * 71 + 5) % W, sy = (i * 43 + 3) % Math.round(H * 0.52);
            c.globalAlpha = 0.45; g.rect(sx, sy, 1, 1, C.star); c.globalAlpha = 1;
          }
          // Earth in sky
          const ex = 36, ey = 36;
          g.circle(ex, ey, 20, C.earth);
          c.fillStyle = '#1a4820';
          c.beginPath(); c.ellipse(ex - 2, ey - 4, 8, 5, -0.3, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.ellipse(ex + 6, ey + 6, 6, 4, 0.5,  0, Math.PI * 2); c.fill();
          // Craters
          for (const cr of this.craters) {
            g.circle(cr.x, cr.y, 19, '#0f1e2a');
            g.circle(cr.x, cr.y, 12, '#080e18');
            c.strokeStyle = '#1e3a52'; c.lineWidth = 1.5;
            c.beginPath(); c.arc(cr.x, cr.y, 19, 0, Math.PI * 2); c.stroke();
          }
          // Selenites
          for (const s of this.active) {
            const pulse = 0.82 + 0.18 * Math.sin(api.t * 8 + s.cx * 0.1);
            c.globalAlpha = pulse;
            g.sprite(
              ['.t.t.', 'ttttt', '.ttt.', '..t..', '.t.t.'],
              Math.round(s.x) - 5, Math.round(s.y) - 10,
              { t: C.sel }, 2,
            );
            c.globalAlpha = 1;
            if (s.prog > 0.65) {
              const a = (s.prog - 0.65) / 0.35;
              c.strokeStyle = `rgba(200,60,30,${(a * 0.72).toFixed(2)})`;
              c.lineWidth = 2;
              c.beginPath(); c.arc(Math.round(s.x), Math.round(s.y), 18, 0, Math.PI * 2); c.stroke();
            }
          }
          // Explorers at center
          const cx2 = Math.round(W / 2), cy2 = Math.round(H * 0.68);
          g.sprite(['.bb.', 'bwwb', '.bb.', 'b..b'], cx2 - 17, cy2 - 14, { b: '#1a2090', w: '#d0d8e0' }, 3);
          g.sprite(['.bb.', 'bwwb', '.bb.', 'b..b'], cx2 + 2,  cy2 - 14, { b: '#8a1820', w: '#d0d8e0' }, 3);
          api.topBar('DEFEATED: ' + this.defeated + '/' + this.need + '  BREACHES: ' + this.breaches + '/' + this.maxBreach);
        },
      },

      /* ============================================================
       * CHAPTER 5 — THE SPLASHDOWN  (Steer falling capsule, 3 lives)
       * ============================================================ */
      {
        id: 'splashdown', name: 'THE SPLASHDOWN', sub: 'THE RETURN',
        intro: [
          'THE CAPSULE IS PUSHED',
          "OFF THE MOON'S EDGE!",
          'FALLING BACK TO EARTH...',
          'STEER IT INTO THE SEA!',
        ],
        quote: '"The great bullet plunged into the Pacific — and we were home at last." — Barbenfouillis',
        help: 'TAP & DRAG or ARROWS to steer left/right! Hit the BLUE OCEAN ZONE!',
        winText: 'SPLASH! THE CREW IS SAFE — AND FAMOUS FOREVER!',
        loseText: 'The capsule misses the sea and is lost to the deep...',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.circle(x, y - 1, 7, C.ocean);
          g.circle(x - 1, y - 3, 3, C.brass);
          c.strokeStyle = '#40c0e8'; c.lineWidth = 1.5;
          c.beginPath(); c.arc(x - 5, y + 5, 4, Math.PI, 0); c.stroke();
          c.beginPath(); c.arc(x + 4, y + 5, 4, Math.PI, 0); c.stroke();
        },
        init(api) {
          this.px       = api.W / 2;
          this.py       = 28;
          this.vy       = 38;            // ~10.5 s to fall full height
          this.lives    = 3;
          this.obs      = [];
          this.spawnT   = 0;
          this.done     = false;
          this.age      = 0;
          this.won      = false;
          this.hurt     = 0;
          this.oceanL   = Math.round(api.W * 0.14);
          this.oceanR   = Math.round(api.W * 0.86);
          this.oceanY   = api.H - 62;
        },
        update(api, dt) {
          if (this.done) return;
          this.age += dt;
          const phase = this.py < api.H * 0.35 ? 0 : this.py < api.H * 0.72 ? 1 : 2;

          // Steer
          const spd = 125;
          if (api.keyDown('left'))  this.px -= spd * dt;
          if (api.keyDown('right')) this.px += spd * dt;
          if (api.pointer.down) {
            const dx = api.pointer.x - this.px;
            if (Math.abs(dx) > 5) this.px += Math.sign(dx) * Math.min(Math.abs(dx), spd * dt * 2.2);
          }
          this.px = clamp(this.px, 12, api.W - 12);

          // Fall
          this.py += this.vy * dt;

          // Reached ocean
          if (this.py >= this.oceanY) {
            if (this.px >= this.oceanL && this.px <= this.oceanR) {
              api.addScore(150); api.win(); this.won = true; this.done = true;
            } else {
              this.lives--;
              api.audio.sfx('hurt'); api.shake(8, 0.4);
              if (this.lives <= 0) { api.lose(); this.done = true; return; }
              this.py = 28; this.px = api.W / 2;
            }
            return;
          }

          // Obstacle spawning (by phase)
          if (this.hurt > 0) { this.hurt -= dt; }
          this.spawnT += dt;
          const spRate = phase === 1 ? 1.1 : 1.8;
          if (this.spawnT > spRate) {
            this.spawnT = 0;
            if (phase === 0) {
              // Asteroids from sides
              const fromL = Math.random() < 0.5;
              this.obs.push({ type: 'asteroid', x: fromL ? -14 : api.W + 14, y: 50 + Math.random() * (api.H * 0.3), vx: fromL ? 68 : -68, vy: 25, r: 9 });
            } else if (phase === 1) {
              // Lightning bolts from top
              this.obs.push({ type: 'bolt', x: 20 + Math.random() * (api.W - 40), y: -18, vx: (Math.random() - 0.5) * 32, vy: 145, r: 7 });
            } else {
              // Waves from sides
              const fromL2 = Math.random() < 0.5;
              this.obs.push({ type: 'wave', x: fromL2 ? -14 : api.W + 14, y: this.oceanY - 18 - Math.random() * 30, vx: fromL2 ? 75 : -75, vy: 0, r: 11 });
            }
          }
          this.obs = this.obs.filter(o => { o.x += o.vx * dt; o.y += o.vy * dt; return o.x > -20 && o.x < api.W + 20 && o.y < api.H + 20; });

          // Collisions
          if (this.hurt <= 0) {
            for (const o of this.obs) {
              if (Retro.util.dist(this.px, this.py, o.x, o.y) < o.r + 8) {
                this.lives--;
                api.audio.sfx('hurt'); api.shake(5, 0.3); api.flash(C.fire, 0.18);
                this.obs = this.obs.filter(x => x !== o);
                this.hurt = 0.8;
                if (this.lives <= 0) { api.lose(); this.done = true; return; }
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const phase = this.py < H * 0.35 ? 0 : this.py < H * 0.72 ? 1 : 2;

          // Background gradient per phase
          let sky;
          if (phase === 0) {
            // Deep space
            g.rect(0, 0, W, H, '#06040e');
            for (let i = 0; i < 44; i++) {
              const sx = (i * 53 + 7) % W, sy = (i * 97 + 13) % H;
              c.globalAlpha = 0.28; g.rect(sx, sy, 1, 1, C.star); c.globalAlpha = 1;
            }
            // Earth swelling from below
            const er = 18 + (this.py / (H * 0.35)) * 32;
            g.circle(W / 2, H + er - 20, Math.round(er), C.earth);
          } else if (phase === 1) {
            // Atmosphere — orange/red re-entry
            sky = c.createLinearGradient(0, 0, 0, H);
            sky.addColorStop(0,   '#08040e');
            sky.addColorStop(0.4, '#300a08');
            sky.addColorStop(1,   '#1840a0');
            c.fillStyle = sky; c.fillRect(0, 0, W, H);
          } else {
            // Ocean approach — blue sky
            sky = c.createLinearGradient(0, 0, 0, H);
            sky.addColorStop(0, '#0a2070');
            sky.addColorStop(1, '#2070c0');
            c.fillStyle = sky; c.fillRect(0, 0, W, H);
          }

          // Ocean zone at bottom
          g.rect(0, this.oceanY, W, H - this.oceanY, '#0a4880');
          g.rect(this.oceanL, this.oceanY, this.oceanR - this.oceanL, H - this.oceanY, '#1870c8');
          g.rect(this.oceanL, this.oceanY, this.oceanR - this.oceanL, 3, '#40c8f0');
          // Waves
          for (let wx = 0; wx < W; wx += 22) {
            const wy = this.oceanY + Math.round(Math.sin(api.t * 2.2 + wx * 0.12) * 3);
            c.strokeStyle = '#50d4f8'; c.lineWidth = 1.5;
            c.beginPath(); c.arc(wx + 11, wy, 11, Math.PI, 0); c.stroke();
          }
          // Landing target label
          api.txtCFit('OCEAN', (this.oceanL + this.oceanR) / 2, this.oceanY + 18, 7, '#70e8ff', false, this.oceanR - this.oceanL - 4);

          // Obstacles
          for (const o of this.obs) {
            if (o.type === 'asteroid') {
              g.circle(Math.round(o.x), Math.round(o.y), o.r, '#3a4050');
              g.circle(Math.round(o.x) - 2, Math.round(o.y) - 2, o.r - 4, '#232830');
            } else if (o.type === 'bolt') {
              c.strokeStyle = '#ffe080'; c.lineWidth = 2.5; c.globalAlpha = 0.88;
              c.beginPath();
              c.moveTo(Math.round(o.x),     Math.round(o.y));
              c.lineTo(Math.round(o.x) - 5, Math.round(o.y) + 12);
              c.lineTo(Math.round(o.x) + 4, Math.round(o.y) + 24);
              c.lineTo(Math.round(o.x) - 3, Math.round(o.y) + 36);
              c.stroke(); c.globalAlpha = 1;
            } else {
              c.strokeStyle = '#50d4f8'; c.lineWidth = 2;
              c.beginPath(); c.arc(Math.round(o.x), Math.round(o.y), o.r, Math.PI, 0); c.stroke();
            }
          }

          // Capsule
          const blink = this.hurt > 0 && Math.floor(this.hurt * 8) % 2 === 0;
          if (!blink) {
            if (phase === 1) {
              // Re-entry fire
              c.globalAlpha = 0.72;
              g.rect(Math.round(this.px) - 5, Math.round(this.py) + 10, 10, 14, C.fire);
              c.globalAlpha = 0.42;
              g.rect(Math.round(this.px) - 7, Math.round(this.py) + 16, 14, 10, '#e87020');
              c.globalAlpha = 1;
            }
            g.circle(Math.round(this.px), Math.round(this.py), 10, C.brass);
            g.circle(Math.round(this.px) - 2, Math.round(this.py) - 3, 4, C.star);
          }

          // Lives
          for (let i = 0; i < this.lives; i++) g.circle(12 + i * 18, H - this.oceanY + this.oceanY - 74, 5, C.brass);

          // Altitude progress bar
          const prog = Math.min(1, this.py / this.oceanY);
          g.rect(0, 0, Math.round(W * prog), 4, C.sel);
          api.topBar('ALTITUDE: ' + Math.max(0, Math.round((1 - prog) * 100)) + 'km');
        },
      },
    ], // end chapters
  }); // end RetroSaga.create
})();
