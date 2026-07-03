/* ============================================================================
 * THE SCARLET LETTER — HESTER'S VIGIL
 * Five Puritan chapters from Hawthorne's 1850 novel:
 *   1. THE MARKET-PLACE — tap-destroy: deflect shame tokens on the scaffold
 *   2. WILD PEARL       — tap-redirect: keep Pearl from the yard's edges
 *   3. CHILLINGWORTH    — timing meter: parry the physician's probing questions
 *   4. THE FOREST PATH  — steer-dodge: guide Hester past sweeping lantern beams
 *   5. THE FINAL SCAFFOLD — courage hold: tap to steady Dimmesdale's heart
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── Puritan palette ── */
  const C = {
    scarlet:   '#cc1122',
    scarletL:  '#ee3344',
    scarletD:  '#880e18',
    parchment: '#e8dcc0',
    parchD:    '#b8a880',
    parchDk:   '#7a6a50',
    charcoal:  '#1a1510',
    stone:     '#5a5248',
    stoneL:    '#7a7268',
    stoneD:    '#3a3230',
    moss:      '#2a3a1a',
    ink:       '#0f0c08',
    amber:     '#c87820',
    amberL:    '#e8a030',
    forest:    '#0c1208',
    night:     '#0c0e18',
    sky:       '#1e2230',
    flesh:     '#e8b880',
    puritan:   '#2a2418',
    slate:     '#1e1c18',
  };

  /* ── Emblem: the scarlet letter A ── */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // Left leg
    g.rect(cx - 14, cy + 4, 5, 26, C.scarlet);
    // Right leg
    g.rect(cx + 9,  cy + 4, 5, 26, C.scarlet);
    // Top peak (angled via stepped blocks)
    g.rect(cx - 4, cy - 14, 8, 20, C.scarlet);
    g.rect(cx - 9, cy - 4,  5,  8, C.scarlet);
    g.rect(cx + 4, cy - 4,  5,  8, C.scarlet);
    // Crossbar
    g.rect(cx - 11, cy + 10, 22, 5, C.scarlet);
    // Gold highlights
    g.rect(cx - 12, cy + 5,  2, 2, C.amberL);
    g.rect(cx + 10, cy + 5,  2, 2, C.amberL);
  }

  /* ── Scenery ── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Overcast Puritan night sky
    const skyGrad = c.createLinearGradient(0, 0, 0, H * 0.58);
    skyGrad.addColorStop(0, '#0c0e18');
    skyGrad.addColorStop(1, '#1a1c28');
    c.fillStyle = skyGrad;
    c.fillRect(0, 0, W, H * 0.58);

    if (scene === 'menu') {
      // Churchyard grass
      c.fillStyle = '#141a0e'; c.fillRect(0, Math.floor(H * 0.58), W, H);
      // Church silhouette (right side)
      c.fillStyle = '#0c0e12';
      c.fillRect(W - 72, Math.floor(H * 0.22), 66, Math.floor(H * 0.36));
      // Church peaked roof
      c.beginPath();
      c.moveTo(W - 72, Math.floor(H * 0.22));
      c.lineTo(W - 39, Math.floor(H * 0.08));
      c.lineTo(W - 6, Math.floor(H * 0.22));
      c.closePath(); c.fill();
      // Steeple
      c.fillRect(W - 50, Math.floor(H * 0.02), 22, Math.floor(H * 0.08));
      c.beginPath();
      c.moveTo(W - 50, Math.floor(H * 0.02));
      c.lineTo(W - 39, 0);
      c.lineTo(W - 28, Math.floor(H * 0.02));
      c.closePath(); c.fill();
      // Church windows (dim amber)
      g.rect(W - 60, Math.floor(H * 0.26), 10, 14, '#3a2810');
      g.rect(W - 42, Math.floor(H * 0.26), 10, 14, '#3a2810');
      // Fence pickets
      c.fillStyle = '#2e2418';
      for (let fx = 0; fx < W - 74; fx += 10) {
        c.fillRect(fx, Math.floor(H * 0.57), 5, 20);
        c.fillRect(fx, Math.floor(H * 0.555), 5, 5);
      }
      // Low mist
      c.globalAlpha = 0.07;
      c.fillStyle = '#c0c8b8';
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.ellipse(W * 0.2 + i * 56 + Math.sin(t * 0.35 + i) * 10,
          Math.floor(H * 0.65), 52 + i * 8, 9, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
      return;
    }

    // Crescent moon
    g.circle(38, 38, 17, '#c0b898');
    g.circle(46, 32, 14, '#0c0e18');

    // Stars
    if (scene === 'result' || scene === 'finale' || scene === 'boot') {
      for (let i = 0; i < 28; i++) {
        const sx = (i * 83 + 13) % W;
        const sy = (i * 61 + 7) % Math.floor(H * 0.46);
        c.globalAlpha = 0.15 + 0.22 * Math.sin(t * 0.85 + i * 1.2);
        g.rect(sx, sy, 1, 1, '#d0c8b8');
      }
      c.globalAlpha = 1;
    }

    // Puritan Boston building row (silhouettes)
    const bldgs = [[0, 88, 44], [50, 72, 36], [92, 82, 46], [144, 68, 44], [194, 78, 76]];
    c.fillStyle = '#0e1016';
    for (const [bx, by, bw] of bldgs) {
      c.fillRect(bx, by, bw, Math.floor(H * 0.58) - by);
      c.beginPath();
      c.moveTo(bx, by);
      c.lineTo(bx + bw / 2, by - 12);
      c.lineTo(bx + bw, by);
      c.closePath(); c.fill();
      g.rect(bx + Math.floor(bw / 2) - 4, by + 16, 8, 10, '#3a2c12');
    }

    // Ground: frozen cobblestones
    const gy = Math.floor(H * 0.58);
    c.fillStyle = '#22180e'; c.fillRect(0, gy, W, H - gy);
    c.fillStyle = '#1a1208';
    for (let x = 0; x < W; x += 20) c.fillRect(x, gy, 1, H);
    for (let y = gy; y < H; y += 12) c.fillRect(0, y, W, 1);

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(10,8,6,.65)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ── Gravestone layout (churchyard chapter select) ── */
  const STONES = [
    { x: 85,  y: 70,  w: 100, h: 56 },
    { x: 14,  y: 162, w: 100, h: 56 },
    { x: 156, y: 155, w: 100, h: 56 },
    { x: 14,  y: 255, w: 100, h: 56 },
    { x: 156, y: 248, w: 100, h: 56 },
  ];

  /* =========================================================== */
  RetroSaga.create({
    id: 'scarletletter',
    title: "Hester's Vigil",
    subtitle: 'FIVE PURITAN CHAPTERS',
    currency: 'FAITH',

    screens: {
      win:          C.amberL,
      lose:         C.scarletL,
      chapterLabel: C.parchD,
      name:         C.parchment,
      sub:          C.amberL,
      intro:        C.parchment,
      quote:        C.parchDk,
      help:         C.amber,
      score:        C.parchment,
      cur:          C.amberL,
      cta:          C.parchment,
      overlay:      'rgba(10,8,4,.92)',
    },
    labels: {
      chapter:  'CHAPTER',
      score:    'FAITH KEPT',
      win:      'ENDURED',
      lose:     'CAST DOWN',
      cont:     'TAP TO CONTINUE',
      finale:   'TAP TO FACE THE DAWN',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO BEGIN',
    },

    accent:   C.scarlet,
    credit:   'THE SCARLET LETTER · NATHANIEL HAWTHORNE · 1850',
    bootLine: 'FIVE CHAPTERS · ONE TRUTH · AN UNDYING LETTER',
    tagline:  'A POLECAT PURITAN TALE',
    emblem,
    scenery,
    bootCta:   'TAP TO TAKE THE SCAFFOLD',
    menuLabel: "HESTER'S CHAPTERS",
    menuHint:  'CHOOSE A CHAPTER',
    menuDone:  'THE TRUTH IS SPOKEN',

    menu: {
      title(api, cur) {
        const g = api.gfx, c = api.ctx, W = api.W;
        // Dark churchyard header bar
        c.fillStyle = '#100c08'; c.fillRect(0, 0, W, 62);
        // Fence along bottom of header
        c.fillStyle = '#2e2418';
        for (let fx = 0; fx < W; fx += 10) {
          c.fillRect(fx, 55, 5, 16);
          c.fillRect(fx, 53, 5, 5);
        }
        // Small scarlet A emblem in header
        const ax = 20, ay = 22;
        g.rect(ax - 5, ay + 2, 2, 10, C.scarlet);
        g.rect(ax + 3, ay + 2, 2, 10, C.scarlet);
        g.rect(ax - 1, ay - 4, 2, 8, C.scarlet);
        g.rect(ax - 3, ay,     2, 4, C.scarlet);
        g.rect(ax + 1, ay,     2, 4, C.scarlet);
        g.rect(ax - 4, ay + 4, 8, 2, C.scarlet);

        api.txtCFit("HESTER'S CHAPTERS", W / 2, 10, 9, C.parchD, true);
        api.txtCFit('FAITH  ' + cur, W / 2, 34, 8, C.amber, false);
      },
      layout() {
        return STONES.map(s => ({ x: s.x, y: s.y, w: s.w, h: s.h }));
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;

        const archH = 20;
        const bodyY = y + archH;
        const bodyH = h - archH;
        const stoneCol = sel ? '#807870' : (done ? '#686058' : '#504848');
        const borderCol = sel ? C.amber : (done ? C.parchD : '#2a2820');

        // Gravestone body
        c.fillStyle = stoneCol;
        c.fillRect(x + 4, bodyY, w - 8, bodyH);
        // Arch
        c.beginPath();
        c.arc(x + w / 2, bodyY, (w - 8) / 2, Math.PI, 0);
        c.lineTo(x + w - 4, bodyY);
        c.lineTo(x + 4, bodyY);
        c.closePath(); c.fill();

        // Border stroke
        c.strokeStyle = borderCol;
        c.lineWidth = sel ? 2 : 1;
        c.beginPath();
        c.arc(x + w / 2, bodyY, (w - 8) / 2, Math.PI, 0);
        c.lineTo(x + w - 4, bodyY + bodyH);
        c.lineTo(x + 4, bodyY + bodyH);
        c.closePath(); c.stroke();

        // Inner decorative border
        c.strokeStyle = sel ? '#a09070' : '#3a3828';
        c.lineWidth = 0.5; c.globalAlpha = 0.5;
        c.strokeRect(x + 8, bodyY + 4, w - 16, bodyH - 8);
        c.globalAlpha = 1;

        // Text (chiseled look)
        api.txtCFit(ch.name, x + w / 2, bodyY + 6, 6,
          sel ? C.parchment : C.parchD, true, w - 16);
        api.txtCFit(ch.sub,  x + w / 2, bodyY + 22, 5,
          sel ? C.amber : '#6a5a40', false, w - 16);

        // Icon
        if (ch.icon) ch.icon(api, x + w / 2, y + h - 14);

        // Done cross marker
        if (done) {
          const dx = x + w - 14, dy = y + 6;
          g.rect(dx - 1, dy, 2, 10, C.parchD);
          g.rect(dx - 4, dy + 3, 8, 2, C.parchD);
        }

        // Selection glow
        if (sel) {
          c.globalAlpha = 0.12;
          c.fillStyle = C.amber;
          c.fillRect(x + 4, bodyY, w - 8, bodyH);
          c.globalAlpha = 1;
        }
      },
    },

    finale: [
      'DIMMESDALE SPEAKS —',
      'THE TRUTH LAID BARE',
      'ON THE SCAFFOLD.',
      'HESTER STANDS UNBOWED.',
      'THE LETTER ENDURES.',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ================================================================
       * CH 1 — THE MARKET-PLACE
       * Shame tokens (words) fall from above toward the scaffold.
       * Tap them before they reach Hester. 3 lives, 22 seconds.
       * Pacing: tokens spawn every ~1.4s, ~14 total; avg ~1.5s to fall.
       * ================================================================ */
      {
        id: 'marketplace',
        name: 'THE MARKET-PLACE',
        sub: 'THE SCAFFOLD',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y + 2, 16, 4, C.stone);
          g.rect(x - 2, y - 10, 4, 12, '#383030');
          g.rect(x - 2, y - 14, 4, 5, C.flesh);
          g.rect(x - 1, y - 8, 2, 3, C.scarlet);
        },
        intro: [
          'HESTER PRYNNE STANDS',
          'ON THE SCAFFOLD.',
          'THE CROWD CRIES OUT.',
          'DEFLECT THEIR WORDS',
          'AND HOLD YOUR DIGNITY.',
        ],
        quote: 'The scarlet letter was her passport into regions where other women dared not tread.',
        help: 'TAP shame tokens before they reach Hester!',
        winText: "Hester stands still and proud. The crowd's words cannot break her.",
        loseText: 'The shame overwhelms — but only for a moment. Hester rises again.',
        init(api) {
          this.tokens = [];
          this.lives = 3;
          this.elapsed = 0;
          this.spawnTimer = 0.5;
          this.duration = 22;
          this.WORDS = ['SINNER', 'SHAME', 'OUTCAST', 'FALLEN', 'GUILTY', 'CONDEMN', 'HARLOT'];
          this.hX = api.W / 2;
          this.hY = api.H - 90;
          this.hitFlash = 0;
          this.speed = 52;
        },
        update(api, dt) {
          this.elapsed += dt;
          this.hitFlash = Math.max(0, this.hitFlash - dt);

          if (this.elapsed >= this.duration) { api.addScore(100); api.win(); return; }

          // Spawn tokens
          this.spawnTimer -= dt;
          const interval = Math.max(0.75, 1.45 - this.elapsed * 0.022);
          if (this.spawnTimer <= 0) {
            this.spawnTimer = interval;
            const word = this.WORDS[Math.floor(this.elapsed * 13) % this.WORDS.length];
            const x = 32 + Math.random() * (api.W - 64);
            this.tokens.push({ x, y: 68, vy: this.speed + Math.random() * 24, word });
            this.speed += 1.2;
          }

          // Move tokens + collision
          for (let i = this.tokens.length - 1; i >= 0; i--) {
            const tok = this.tokens[i];
            tok.y += tok.vy * dt;
            if (tok.y > this.hY - 8) {
              this.lives--;
              api.shake(5, 0.28);
              api.flash(C.scarlet, 0.18);
              api.audio.sfx('hurt');
              this.hitFlash = 0.45;
              this.tokens.splice(i, 1);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }

          // Tap to destroy
          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (let i = this.tokens.length - 1; i >= 0; i--) {
              const tok = this.tokens[i];
              if (Math.abs(px - tok.x) < 30 && Math.abs(py - tok.y) < 16) {
                api.addScore(14);
                api.audio.sfx('coin');
                api.burst(tok.x, tok.y, C.amber, 5);
                this.tokens.splice(i, 1);
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Night sky
          c.fillStyle = '#0c0e18'; c.fillRect(0, 0, W, H);
          // Buildings
          const bldgs = [[0, 94, 42], [48, 80, 34], [88, 90, 44], [140, 76, 42], [188, 84, 82]];
          c.fillStyle = '#0e1016';
          for (const [bx, by, bw] of bldgs) {
            c.fillRect(bx, by, bw, H);
            c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + bw / 2, by - 10); c.lineTo(bx + bw, by); c.closePath(); c.fill();
          }
          // Ground
          g.rect(0, H - 68, W, 68, '#22180e');
          // Scaffold platform
          g.rect(W / 2 - 52, H - 104, 104, 36, '#4a3820');
          g.rect(W / 2 - 52, H - 68, 104, 4, '#5a4828');
          g.rect(W / 2 - 50, H - 68, 4, 36, '#3e3018');
          g.rect(W / 2 + 46, H - 68, 4, 36, '#3e3018');

          // Crowd silhouettes
          const crowd = [10, 32, 56, 186, 210, 236, 258];
          for (const cx2 of crowd) {
            g.rect(cx2 - 5, H - 64 - 22, 10, 22, '#141210');
            g.circle(cx2, H - 64 - 22, 7, '#141210');
          }

          // Hester
          const hf = this.hitFlash > 0;
          const bodyCol = hf ? '#804040' : '#38302a';
          g.rect(this.hX - 7, this.hY - 36, 14, 32, bodyCol);
          g.rect(this.hX - 4, this.hY - 48, 8, 14, hf ? '#ff9090' : C.flesh);
          g.rect(this.hX - 7, this.hY - 52, 14, 6, '#141010');
          // Scarlet A
          g.rect(this.hX - 3, this.hY - 32, 6, 2, C.scarlet);
          g.rect(this.hX - 2, this.hY - 34, 4, 6, C.scarlet);
          g.rect(this.hX - 3, this.hY - 30, 6, 2, C.scarlet);

          // Falling shame tokens
          for (const tok of this.tokens) {
            c.fillStyle = C.scarletD;
            c.fillRect(tok.x - 28, tok.y - 11, 56, 22);
            c.strokeStyle = C.scarlet; c.lineWidth = 1;
            c.strokeRect(tok.x - 28, tok.y - 11, 56, 22);
            api.txtCFit(tok.word, tok.x, tok.y - 3, 6, C.parchment, true, 54);
          }

          // Timer bar + lives
          const prog = this.elapsed / this.duration;
          g.rect(8, H - 64, W - 16, 4, '#1e1810');
          g.rect(8, H - 64, Math.floor((W - 16) * prog), 4, C.amberL);
          api.topBar('DIGNITY: ' + '♥'.repeat(this.lives) + '  |  ' + Math.ceil(this.duration - this.elapsed) + 's');
        },
      },

      /* ================================================================
       * CH 2 — WILD PEARL
       * Pearl bounces around the yard. Tap her to reverse direction.
       * If she reaches any edge danger zone, lose a life.
       * 3 lives, 20 seconds. Pearl speeds up over time.
       * Pacing: ~5-6s per bounce cycle; ~3-4 redirects needed.
       * ================================================================ */
      {
        id: 'pearl',
        name: 'WILD PEARL',
        sub: "HESTER'S YARD",
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 6, 7, '#d44878');
          g.rect(x - 2, y - 11, 4, 6, '#c8a070');
          g.rect(x - 4, y - 13, 8, 4, '#803838');
        },
        intro: [
          'PEARL RUNS WILD IN THE YARD,',
          'HER SPIRIT DRAWN TO',
          'FORBIDDEN THINGS.',
          'TAP HER TO REDIRECT HER.',
          "THREE STUMBLES AND YOU LOSE.",
        ],
        quote: 'She had not been made at all, but had sprung by the spontaneous doodle of nature.',
        help: 'TAP Pearl to turn her around!',
        winText: 'Pearl laughs and runs to Hester. A wild, wonderful child.',
        loseText: "Pearl runs too far. The neighbors' tongues wag again.",
        init(api) {
          this.pX = api.W / 2;
          this.pY = api.H / 2 - 10;
          this.vx = 68;
          this.vy = 52;
          this.lives = 3;
          this.elapsed = 0;
          this.duration = 20;
          this.hitCool = 0;
          this.hitFlash = 0;
          this.MARGIN = 22;
        },
        update(api, dt) {
          this.elapsed += dt;
          this.hitFlash = Math.max(0, this.hitFlash - dt);
          this.hitCool  = Math.max(0, this.hitCool  - dt);

          if (this.elapsed >= this.duration) { api.addScore(100); api.win(); return; }

          // Speed ramp
          const spd = 68 + this.elapsed * 3.5;
          const cur = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1;
          this.vx = this.vx / cur * spd;
          this.vy = this.vy / cur * spd;

          this.pX += this.vx * dt;
          this.pY += this.vy * dt;

          // Soft bounce walls (inside safe area)
          const M = this.MARGIN + 16;
          const TOP = 78, BOT = api.H - 54;
          if (this.pX < M)        { this.pX = M;            this.vx =  Math.abs(this.vx); }
          if (this.pX > api.W-M)  { this.pX = api.W - M;   this.vx = -Math.abs(this.vx); }
          if (this.pY < TOP + M)  { this.pY = TOP + M;      this.vy =  Math.abs(this.vy); }
          if (this.pY > BOT - M)  { this.pY = BOT - M;      this.vy = -Math.abs(this.vy); }

          // Danger zone (edge strip)
          const DM = this.MARGIN;
          const inDanger = this.pX < DM || this.pX > api.W - DM ||
                           this.pY < TOP + DM || this.pY > BOT - DM;
          if (inDanger && this.hitCool <= 0) {
            this.lives--;
            api.shake(4, 0.25);
            api.flash(C.scarlet, 0.15);
            api.audio.sfx('hurt');
            this.hitFlash = 0.4;
            this.hitCool = 1.2;
            this.pX = clamp(this.pX, DM + 20, api.W - DM - 20);
            this.pY = clamp(this.pY, TOP + DM + 20, BOT - DM - 20);
            this.vx = -this.vx; this.vy = -this.vy;
            if (this.lives <= 0) { api.lose(); return; }
          }

          // Tap Pearl to redirect
          if (api.pointer.justDown) {
            const dx = api.pointer.x - this.pX;
            const dy = api.pointer.y - this.pY;
            if (dx * dx + dy * dy < 36 * 36) {
              this.vx = -this.vx;
              this.vy = -this.vy;
              api.addScore(12);
              api.audio.sfx('coin');
              api.burst(this.pX, this.pY, '#d44878', 5);
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const TOP = 78, BOT = H - 54;

          // Yard background
          c.fillStyle = '#141a0e'; c.fillRect(0, 0, W, H);
          // Ground
          c.fillStyle = '#1a220e'; c.fillRect(0, BOT, W, H - BOT);
          // House silhouette (left)
          c.fillStyle = '#0e100c';
          c.fillRect(0, 44, 52, BOT - 44);
          c.beginPath(); c.moveTo(0, 44); c.lineTo(26, 22); c.lineTo(52, 44); c.closePath(); c.fill();
          g.rect(8, 62, 14, 20, '#2a2010');
          g.rect(30, 60, 14, 14, '#2a2010');

          // Fence (danger zone boundary)
          c.fillStyle = '#2e2010';
          for (let fx = 0; fx < W; fx += 10) {
            c.fillRect(fx, BOT - 2, 6, 20);
            c.fillRect(fx, BOT - 6, 6, 6);
          }

          // Danger edge indicator
          const DM = this.MARGIN;
          c.strokeStyle = C.scarlet; c.lineWidth = 1.5;
          c.setLineDash([4, 6]); c.globalAlpha = 0.35;
          c.strokeRect(DM, TOP + DM, W - 2 * DM, BOT - TOP - 2 * DM);
          c.setLineDash([]); c.globalAlpha = 1;

          // Hit flash overlay
          if (this.hitFlash > 0) {
            c.fillStyle = 'rgba(200,10,20,.14)'; c.fillRect(0, 0, W, H);
          }

          // Pearl
          const pCol = this.hitFlash > 0 ? '#ff8090' : '#d44878';
          g.circle(this.pX, this.pY, 10, pCol);
          g.rect(this.pX - 4, this.pY - 19, 8, 11, C.flesh);
          g.rect(this.pX - 6, this.pY - 23, 12, 6, '#803838');
          // Direction arrow
          const spd2 = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1;
          const ax = this.pX + this.vx / spd2 * 18;
          const ay = this.pY + this.vy / spd2 * 18;
          c.strokeStyle = C.amber; c.lineWidth = 1.5;
          c.globalAlpha = 0.6;
          c.beginPath(); c.moveTo(this.pX, this.pY); c.lineTo(ax, ay); c.stroke();
          c.globalAlpha = 1;

          api.topBar('LIVES: ' + '♥'.repeat(this.lives) + '  |  ' + Math.ceil(this.duration - this.elapsed) + 's');
        },
      },

      /* ================================================================
       * CH 3 — CHILLINGWORTH'S QUESTIONS
       * A pointer oscillates around a ring. Tap when it enters the
       * green (calm) arc to parry. 8 questions, miss 3 = lose.
       * Pacing: 8 × ~2.8s average = ~22s
       * ================================================================ */
      {
        id: 'chillingworth',
        name: 'CHILLINGWORTH',
        sub: 'THE PHYSICIAN PROBES',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x - 2, y - 5, 6, C.amber);
          g.circle(x - 2, y - 5, 4, C.charcoal);
          c2: {
            const cx3 = x - 2 + 4, cy3 = y - 5 + 4;
            g.rect(cx3, cy3, 6, 2, C.amber);
          }
        },
        intro: [
          'ROGER CHILLINGWORTH',
          'CIRCLES DIMMESDALE',
          'LIKE A DARK PHYSICIAN.',
          'EACH QUESTION IS A PROBE.',
          'DEFLECT HIM!',
        ],
        quote: 'He had begun an investigation with the severe and equal integrity of a judge.',
        help: 'TAP when the pointer hits GREEN to parry!',
        winText: "Dimmesdale deflects each probe. Chillingworth's eyes narrow.",
        loseText: 'The physician strikes a nerve. Dimmesdale trembles.',
        init(api) {
          this.question = 0;
          this.maxQ    = 8;
          this.angle   = Math.PI; // pointer angle (0 = right, π/2 = down)
          this.speed   = 1.85;
          this.phase   = 'wait';  // 'wait'|'active'|'result'
          this.waitT   = 0.7;
          this.resultT = 0;
          this.good    = false;
          this.misses  = 0;
          this.maxMiss = 3;
          this.activeT = 0;
          this.TIMEOUT = 2.8;
          // Safe zone: pointer near top of circle (angle ≈ 3π/2 = top in canvas coords)
          this.safeCenter = Math.PI * 3 / 2;
          this.safeHalf   = 0.52;
          this.QLABELS = ['YOUR SLEEP?','YOUR HEART?','YOUR GUILT?','YOUR DREAMS?',
                          'YOUR SECRET?','YOUR FEAR?','YOUR SOUL?','YOUR SINS?'];
        },
        update(api, dt) {
          if (this.phase === 'wait') {
            this.waitT -= dt;
            if (this.waitT <= 0) {
              this.phase = 'active';
              this.activeT = 0;
              this.angle = Math.PI + 0.3;
              this.speed = 1.85 + this.question * 0.11;
            }
            return;
          }
          if (this.phase === 'result') {
            this.resultT -= dt;
            if (this.resultT <= 0) {
              this.question++;
              if (this.question >= this.maxQ) { api.addScore(120); api.win(); return; }
              this.phase = 'wait'; this.waitT = 0.55;
            }
            return;
          }
          // Active: spin pointer
          this.angle += this.speed * dt;
          this.activeT += dt;

          const resolve = (hit) => {
            this.good = hit;
            if (hit) {
              api.addScore(18);
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H / 2 - 20, C.amberL, 6);
            } else {
              this.misses++;
              api.shake(4, 0.22);
              api.flash(C.scarlet, 0.15);
              api.audio.sfx('hurt');
              if (this.misses >= this.maxMiss) { api.lose(); return; }
            }
            this.phase = 'result'; this.resultT = 0.5;
          };

          // Auto-miss on timeout
          if (this.activeT >= this.TIMEOUT) { resolve(false); return; }

          if (api.confirm()) {
            const norm = ((this.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const sc = this.safeCenter;
            let diff = Math.abs(norm - sc);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;
            resolve(diff < this.safeHalf);
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dark study
          c.fillStyle = '#100e0a'; c.fillRect(0, 0, W, H);
          // Bookshelves
          c.fillStyle = '#221810';
          for (let sx = 0; sx < W; sx += 44) {
            c.fillRect(sx, 56, 42, Math.floor(H * 0.38));
            for (let bx = sx + 2; bx < sx + 42; bx += 7) {
              const bc = ['#3a2818','#4a3020','#2e1e0e','#5a3018'][(Math.floor(bx / 7)) % 4];
              g.rect(bx, 60, 6, Math.floor(H * 0.35), bc);
            }
          }
          // Floor
          g.rect(0, H - 58, W, 58, '#1a1408');
          for (let bx = 0; bx < W; bx += 26) g.rect(bx, H - 58, 1, 58, '#221a0e');

          // Chillingworth (left)
          const chX = 46;
          g.rect(chX - 14, H - 150, 28, 90, '#181410');
          g.rect(chX - 6,  H - 162, 12, 16, '#c8a070');
          g.rect(chX - 8,  H - 168, 16, 8,  '#0e0c08');
          // Dimmesdale (right)
          const dmX = W - 50;
          g.rect(dmX - 10, H - 162, 20, 100, '#222018');
          g.rect(dmX - 5,  H - 175, 10, 15,  C.flesh);
          g.rect(dmX - 7,  H - 180, 14, 7,   '#14120e');
          g.rect(dmX - 10, H - 160, 20, 7,   '#e0dac8'); // Puritan collar

          // Ring + safe arc
          const cx2 = W / 2, cy2 = H / 2 - 16, R = 58;
          // Danger arc (whole ring, faint red)
          c.strokeStyle = C.scarletD; c.lineWidth = 7; c.globalAlpha = 0.22;
          c.beginPath(); c.arc(cx2, cy2, R, 0, Math.PI * 2); c.stroke();
          c.globalAlpha = 1;
          // Safe arc (green)
          c.strokeStyle = '#22e060'; c.lineWidth = 9; c.globalAlpha = 0.4;
          const sa = this.safeCenter - this.safeHalf - Math.PI / 2;
          const sb = this.safeCenter + this.safeHalf - Math.PI / 2;
          c.beginPath(); c.arc(cx2, cy2, R, sa, sb); c.stroke();
          c.globalAlpha = 1;

          // Pointer
          if (this.phase === 'active' || this.phase === 'result') {
            const norm = ((this.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const sc = this.safeCenter;
            let diff = Math.abs(norm - sc);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;
            const inSafe = diff < this.safeHalf;
            let pCol = inSafe ? '#22e060' : C.scarlet;
            if (this.phase === 'result') pCol = this.good ? C.amberL : C.scarletL;
            const px2 = cx2 + Math.cos(this.angle - Math.PI / 2) * R;
            const py2 = cy2 + Math.sin(this.angle - Math.PI / 2) * R;
            c.strokeStyle = pCol; c.lineWidth = 3;
            c.beginPath(); c.moveTo(cx2, cy2); c.lineTo(px2, py2); c.stroke();
            g.circle(px2, py2, 8, pCol);
            g.circle(cx2, cy2, 5, C.parchment);
          }

          // Question label
          if (this.question < this.QLABELS.length) {
            api.txtCFit(this.QLABELS[this.question], W / 2, cy2 + R + 16, 8, C.parchD, true, W - 20);
          }
          // Result flash word
          if (this.phase === 'result') {
            const word = this.good ? 'PARRIED!' : 'STRUCK!';
            api.txtCFit(word, W / 2, cy2 - R - 30, 11, this.good ? C.amberL : C.scarletL, true);
          }

          api.topBar('Q: ' + (this.question + 1) + '/8  |  MISSES: ' + this.misses + '/3');
        },
      },

      /* ================================================================
       * CH 4 — THE FOREST PATH
       * Hester must cross the dark forest to reach Dimmesdale.
       * 3 sweeping lantern beams; steer left/right to avoid.
       * Caught 3 times = lose. Advance 320px of forest to win.
       * Pacing: forward speed ~14px/s → ~23s; lanterns sweep ~1 rad/s.
       * ================================================================ */
      {
        id: 'forest',
        name: 'THE FOREST PATH',
        sub: 'A SECRET MEETING',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x - 2, y - 9, 9, '#0e1808');
          g.rect(x - 4, y, 4, 12, '#3a2810');
          g.circle(x + 8, y - 5, 5, C.amber);
          g.circle(x + 8, y - 5, 3, C.amberL);
        },
        intro: [
          'HESTER STEALS INTO',
          'THE DARK PURITAN FOREST',
          'TO FIND DIMMESDALE.',
          'DODGE THE WATCHMENS\'',
          'SWEEPING LANTERNS!',
        ],
        quote: 'The forest had a great voice of its own, and they both felt it.',
        help: 'Tap LEFT or RIGHT to steer. Avoid the lantern beams!',
        winText: 'Hester reaches the clearing. Dimmesdale steps from the shadows.',
        loseText: "The watchman's lantern finds you. Back to the path.",
        init(api) {
          this.hX  = api.W / 2;
          this.dist = 0;
          this.distTarget = 300;
          this.fwdSpd = 14;
          this.lives = 3;
          this.hitCool  = 0;
          this.hitFlash = 0;
          this.lanterns = [
            { x: api.W * 0.22, ang: 0,         spd: 0.9,  range: 0.85 },
            { x: api.W * 0.68, ang: Math.PI/2,  spd: 1.1,  range: 0.78 },
            { x: api.W * 0.45, ang: Math.PI,    spd: 0.72, range: 0.95 },
          ];
          this.lanY = Math.floor(api.H * 0.42);
          this.hY  = Math.floor(api.H * 0.72);
        },
        update(api, dt) {
          this.hitFlash = Math.max(0, this.hitFlash - dt);
          this.hitCool  = Math.max(0, this.hitCool  - dt);

          // Steer
          const steerSpd = 98;
          if (api.pointer.down) {
            if (api.pointer.x < api.W / 2) this.hX -= steerSpd * dt;
            else                            this.hX += steerSpd * dt;
          }
          if (api.keyDown('left'))  this.hX -= steerSpd * dt;
          if (api.keyDown('right')) this.hX += steerSpd * dt;
          this.hX = clamp(this.hX, 16, api.W - 16);

          // Advance
          this.dist += this.fwdSpd * dt;
          if (this.dist >= this.distTarget) { api.addScore(120); api.win(); return; }

          // Update lanterns + hit detection
          for (const lan of this.lanterns) {
            lan.ang += lan.spd * dt;
            const beamA = Math.sin(lan.ang) * lan.range;
            const BL    = 115;
            const ex    = lan.x + Math.sin(beamA) * BL;
            const ey    = this.lanY + Math.cos(beamA) * BL;

            if (this.hitCool > 0) continue;
            // Point-to-segment distance
            const dxH = this.hX - lan.x, dyH = this.hY - this.lanY;
            const dxB = ex - lan.x,     dyB = ey - this.lanY;
            const bLen = Math.sqrt(dxB * dxB + dyB * dyB) || 1;
            const dot  = (dxH * dxB + dyH * dyB) / bLen;
            const cross = (dxH * dyB - dyH * dxB) / bLen;

            if (dot > 0 && dot < bLen && Math.abs(cross) < 15) {
              this.lives--;
              api.shake(5, 0.28);
              api.flash(C.amber, 0.18);
              api.audio.sfx('hurt');
              this.hitFlash = 0.5;
              this.hitCool  = 1.2;
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dark forest floor
          c.fillStyle = '#0c1008'; c.fillRect(0, 0, W, H);
          // Tree canopy strip
          c.fillStyle = '#101808';
          for (let tx = -8; tx < W + 8; tx += 24) {
            const tH = 38 + (tx * 7 + 3) % 26;
            c.fillRect(tx, 0, 22, tH + 22);
            g.circle(tx + 11, tH, 20 + (tx * 3) % 8, '#0c1606');
          }
          // Path
          g.rect(28, this.lanY + 30, W - 56, H - (this.lanY + 30), '#181c10');

          // Progress bar (how far through the forest)
          const prog = this.dist / this.distTarget;
          g.rect(8, H - 72, W - 16, 4, '#1a1c12');
          g.rect(8, H - 72, Math.floor((W - 16) * prog), 4, C.amberL);

          // Lantern beams
          for (const lan of this.lanterns) {
            const beamA = Math.sin(lan.ang) * lan.range;
            const BL = 115;
            const ex  = lan.x + Math.sin(beamA) * BL;
            const ey  = this.lanY + Math.cos(beamA) * BL;

            // Cone fill
            c.globalAlpha = 0.16;
            c.fillStyle = '#e8a030';
            c.beginPath();
            c.moveTo(lan.x, this.lanY);
            const a1 = beamA - 0.2, a2 = beamA + 0.2;
            c.lineTo(lan.x + Math.sin(a1) * BL, this.lanY + Math.cos(a1) * BL);
            c.lineTo(lan.x + Math.sin(a2) * BL, this.lanY + Math.cos(a2) * BL);
            c.closePath(); c.fill();
            c.globalAlpha = 1;
            // Beam line
            c.strokeStyle = C.amber; c.lineWidth = 1.5; c.globalAlpha = 0.5;
            c.beginPath(); c.moveTo(lan.x, this.lanY); c.lineTo(ex, ey); c.stroke();
            c.globalAlpha = 1;
            // Lantern bulb
            g.circle(lan.x, this.lanY, 7, C.amber);
            g.circle(lan.x, this.lanY, 4, C.amberL);
            // Watchman body
            g.rect(lan.x - 5, this.lanY - 22, 10, 22, '#141210');
            g.circle(lan.x, this.lanY - 26, 6, '#141210');
          }

          // Near foreground trees
          c.fillStyle = '#0a0e06';
          for (const tx of [10, 52, 218, 258]) {
            c.fillRect(tx - 7, H - 120, 14, 60);
            g.circle(tx, H - 120, 22, '#0c1006');
          }

          // Hit flash
          if (this.hitFlash > 0) {
            c.fillStyle = 'rgba(220,160,20,.12)'; c.fillRect(0, 0, W, H);
          }

          // Hester (cloak)
          const hCol = this.hitFlash > 0 ? '#886040' : '#282018';
          g.rect(this.hX - 7, this.hY - 38, 14, 34, hCol);
          g.rect(this.hX - 4, this.hY - 49, 8, 13, C.flesh);
          g.rect(this.hX - 7, this.hY - 53, 14, 7, '#181410');
          // Glimpse of letter under cloak
          g.rect(this.hX - 2, this.hY - 34, 4, 6, C.scarlet);

          // Touch zones (subtle)
          c.globalAlpha = 0.12;
          c.fillStyle = '#6699ff';
          c.fillRect(0, H - 72, W / 2, 72);
          c.fillRect(W / 2, H - 72, W / 2, 72);
          c.globalAlpha = 1;
          api.txtCFit('◄', W / 4,      H - 46, 14, 'rgba(255,255,255,0.22)', true);
          api.txtCFit('►', W * 3 / 4,  H - 46, 14, 'rgba(255,255,255,0.22)', true);

          api.topBar('PATH: ' + Math.floor(prog * 100) + '%  |  LIVES: ' + '♥'.repeat(this.lives));
        },
      },

      /* ================================================================
       * CH 5 — THE FINAL SCAFFOLD
       * Courage oscillates. Tap to boost it; it must stay >0.
       * Dimmesdale climbs when courage > 0.5.
       * Reach 100% climb before time (32s) or courage collapses 3×.
       * Pacing: needs ~4-5 courage boosts; full climb ~24-28s active.
       * ================================================================ */
      {
        id: 'scaffold',
        name: 'THE FINAL SCAFFOLD',
        sub: 'THE CONFESSION',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y + 2, 16, 4, C.parchment);
          g.rect(x - 2, y - 12, 4, 14, C.parchment);
          g.rect(x - 3, y - 17, 6, 6, C.flesh);
          g.rect(x - 2, y - 10, 4, 5, C.scarlet);
        },
        intro: [
          'DIMMESDALE MOUNTS',
          'THE SCAFFOLD AT LAST.',
          'THE TOWN WATCHES IN',
          'SILENCE. TAP TO STEADY',
          'HIS FALTERING HEART.',
        ],
        quote: 'God gave him the opportunity that he had vainly sought to seize.',
        help: 'TAP when courage DIPS to lift Dimmesdale\'s heart!',
        winText: 'Dimmesdale speaks the truth at last. The crowd falls silent.',
        loseText: 'His courage breaks — but Hester stands with him. Once more.',
        init(api) {
          this.courage  = 0.52;
          this.pulse    = 0;
          this.climb    = 0;
          this.elapsed  = 0;
          this.duration = 32;
          this.lives    = 3;
          this.flash    = 0;
          this.flashGood = false;
        },
        update(api, dt) {
          this.elapsed += dt;
          this.flash = Math.max(0, this.flash - dt);

          if (this.elapsed >= this.duration) { api.lose(); return; }

          // Oscillating courage drain
          this.pulse += (1.1 + this.elapsed * 0.04) * dt;
          const drift = -0.065 + Math.sin(this.pulse) * 0.082;
          this.courage += drift * dt;
          this.courage = clamp(this.courage, 0, 1);

          // Collapse
          if (this.courage <= 0.005) {
            this.lives--;
            api.shake(5, 0.3);
            api.flash(C.scarlet, 0.2);
            api.audio.sfx('hurt');
            this.courage = 0.42;
            this.flash = 0.35; this.flashGood = false;
            if (this.lives <= 0) { api.lose(); return; }
          }

          // Tap to boost
          if (api.confirm()) {
            this.courage = Math.min(1, this.courage + 0.36);
            api.addScore(16);
            api.audio.sfx('coin');
            api.burst(api.W / 2, api.H * 0.55, C.amberL, 5);
            this.flash = 0.28; this.flashGood = true;
          }

          // Climb when courage is strong
          if (this.courage > 0.5) {
            this.climb = Math.min(1, this.climb + 0.024 * dt);
          }
          if (this.climb >= 1) { api.addScore(140); api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Night sky
          c.fillStyle = '#0c0e18'; c.fillRect(0, 0, W, H);
          // Stars
          for (let i = 0; i < 24; i++) {
            const sx = (i * 83 + 17) % W;
            const sy = (i * 61 + 9) % Math.floor(H * 0.44);
            c.globalAlpha = 0.15 + 0.22 * Math.sin(this.elapsed + i * 1.3);
            g.rect(sx, sy, 1, 1, '#d0c8b8');
          }
          c.globalAlpha = 1;
          // Moon
          g.circle(W - 42, 40, 19, '#c0b898');
          g.circle(W - 34, 34, 16, '#0c0e18');

          // Ground + cobbles
          g.rect(0, H - 60, W, 60, '#22180e');
          c.fillStyle = '#1a1208';
          for (let x = 0; x < W; x += 20) c.fillRect(x, H - 60, 1, 60);

          // Crowd silhouettes
          const crX = [8, 26, 46, 66, 86, 106, 162, 184, 206, 230, 250];
          c.fillStyle = '#0e0c08';
          for (const cx3 of crX) {
            const ph = 24 + (cx3 * 7) % 16;
            c.fillRect(cx3 - 6, H - 60 - ph, 12, ph);
            g.circle(cx3, H - 60 - ph, 7, '#0e0c08');
          }

          // Scaffold
          g.rect(W / 2 - 56, H - 60, 112, 8, '#4a3820');
          g.rect(W / 2 - 56, H - 210, 6, 150, '#3a2c18');
          g.rect(W / 2 + 50, H - 210, 6, 150, '#3a2c18');
          // Steps
          for (let s = 0; s < 4; s++) {
            g.rect(W / 2 - 28 - s * 5, H - 60 - s * 22, 56 + s * 10, 8, '#4a3828');
          }

          // Dimmesdale climbing
          const climY = H - 72 - this.climb * 100;
          const lowC = this.courage < 0.3;
          g.rect(W / 2 - 7, climY - 40, 14, 36, lowC ? '#5a3030' : '#282020');
          g.rect(W / 2 - 4, climY - 52, 8,  14, C.flesh);
          g.rect(W / 2 - 6, climY - 57, 12, 7,  '#141210');
          g.rect(W / 2 - 7, climY - 39, 14, 7,  '#e0dac8'); // collar
          // Scarlet A
          g.rect(W / 2 - 2, climY - 33, 4, 8, C.scarlet);

          // Courage meter bar (left side, vertical)
          const bX = 16, bY = Math.floor(H * 0.24), bH = Math.floor(H * 0.44);
          g.rect(bX, bY, 12, bH, '#1a1810');
          const fill = Math.floor(bH * this.courage);
          const mCol = this.courage > 0.6 ? '#22e060' : this.courage > 0.3 ? C.amberL : C.scarlet;
          g.rect(bX, bY + bH - fill, 12, fill, mCol);
          c.strokeStyle = '#3a3020'; c.lineWidth = 1;
          c.strokeRect(bX - 1, bY - 1, 14, bH + 2);
          api.txtCFit('COURAGE', bX + 6, bY - 12, 5, C.parchDk, true);

          // Climb progress bar (bottom)
          g.rect(50, H - 68, W - 100, 4, '#1a1810');
          g.rect(50, H - 68, Math.floor((W - 100) * this.climb), 4, C.scarletL);
          api.txtCFit('SCAFFOLD', W / 2, H - 80, 6, C.parchDk, true);

          // Flash
          if (this.flash > 0) {
            c.fillStyle = this.flashGood ? 'rgba(0,180,60,.07)' : 'rgba(180,10,20,.10)';
            c.fillRect(0, 0, W, H);
          }

          const timeLeft = Math.max(0, this.duration - this.elapsed);
          api.topBar('TIME: ' + Math.ceil(timeLeft) + 's  |  LIVES: ' + '♥'.repeat(this.lives));
        },
      },
    ],
  });
})();
