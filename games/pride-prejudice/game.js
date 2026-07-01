/* ============================================================================
 * PRIDE & PREJUDICE — A MATTER OF PRIDE
 * Five scenes from Jane Austen's novel:
 *   1. THE MERYTON BALL  — dodge Mr. Collins, collect introduction cards
 *   2. WICKHAM'S WORDS   — catch truths, avoid Wickham's flattering lies
 *   3. THE PROPOSAL      — time the perfect refusal of Mr. Collins
 *   4. ROAD TO LONDON    — steer Darcy's carriage to silence the scandal
 *   5. THE MORNING WALK  — meet Darcy at dawn and speak from the heart
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── Emblem: a rose in bloom ── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // outer petals
    g.circle(cx, cy - 14, 10, '#c85a7a');
    g.circle(cx + 12, cy - 6, 10, '#c85a7a');
    g.circle(cx + 10, cy + 8, 10, '#c85a7a');
    g.circle(cx - 10, cy + 8, 10, '#c85a7a');
    g.circle(cx - 12, cy - 6, 10, '#c85a7a');
    // inner petals
    g.circle(cx, cy - 8, 8, '#e07a9a');
    g.circle(cx + 7, cy - 2, 8, '#e07a9a');
    g.circle(cx + 5, cy + 8, 8, '#e07a9a');
    g.circle(cx - 5, cy + 8, 8, '#e07a9a');
    g.circle(cx - 7, cy - 2, 8, '#e07a9a');
    // centre
    g.circle(cx, cy, 7, '#f0c0d0');
    g.circle(cx, cy, 3, '#f8e8f0');
    // stem
    g.rect(cx - 2, cy + 18, 4, 22, '#4a7a4a');
    g.rect(cx + 2, cy + 26, 10, 3, '#4a7a4a');
    g.rect(cx - 12, cy + 32, 10, 3, '#4a7a4a');
  }

  /* ── Scenery: Longbourn estate at dusk / dawn ── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Sky — deep violet fading to soft green-earth
    const sky = c.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, '#18102a');
    sky.addColorStop(0.5, '#220f1e');
    sky.addColorStop(1, '#1a2614');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // Stars (not on menu)
    if (scene !== 'menu') {
      for (let i = 0; i < 38; i++) {
        const sx = (i * 67 + 11) % W, sy = (i * 43 + 7) % Math.floor(H * 0.5);
        c.globalAlpha = 0.2 + 0.35 * Math.sin(t * 1.4 + i * 1.6);
        g.rect(sx, sy, i % 5 === 0 ? 2 : 1, 1, '#e8d8d0');
      }
      c.globalAlpha = 1;
      // Moon — soft rose
      g.circle(W - 54, 46, 19, '#c8a0b0');
      g.circle(W - 48, 40, 16, '#18102a');
      g.circle(W - 52, 48, 19, '#b8909e');
    }

    // Rolling hills
    const hillY = Math.floor(H * 0.62);
    c.fillStyle = '#1a3020';
    c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W; x += 14) c.lineTo(x, hillY - 10 - Math.sin(x * 0.035 + 0.8) * 14);
    c.lineTo(W, H); c.closePath(); c.fill();

    // Nearer grass band
    c.fillStyle = '#1e3818';
    c.fillRect(0, hillY + 2, W, H - hillY - 2);

    // Longbourn manor silhouette
    const mx = 60, my = hillY - 52;
    c.fillStyle = '#0e1a0e';
    c.fillRect(mx, my, 88, 52);          // main body
    c.fillRect(mx + 18, my - 20, 52, 22); // upper storey
    c.fillRect(mx + 28, my - 28, 12, 10); // chimney L
    c.fillRect(mx + 52, my - 28, 12, 10); // chimney R
    // windows, lit warm
    g.rect(mx + 10, my + 14, 12, 16, '#d4900a');
    g.rect(mx + 32, my + 14, 12, 16, '#d4900a');
    g.rect(mx + 54, my + 14, 12, 16, '#d4900a');
    g.rect(mx + 30, my - 14, 10, 12, '#d4900a');

    // Foreground roses (hedge)
    for (let i = 0; i < 7; i++) {
      const fx = 12 + i * 38, fy = hillY + 10;
      g.rect(fx, fy, 2, 12, '#3a6030');
      g.circle(fx + 1, fy - 1, 5, '#c85a7a');
    }

    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(10,6,18,.64)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // Candlelit drawing room — overlay the scenery
      c.fillStyle = 'rgba(10,6,18,.54)';
      c.fillRect(0, 0, W, H);
      // warm candlelight glow near bottom
      const cg = c.createRadialGradient(W / 2, H + 20, 0, W / 2, H + 20, 180);
      cg.addColorStop(0, 'rgba(200,150,60,.18)');
      cg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = cg; c.fillRect(0, H - 180, W, 200);
    }
  }

  // dance-card positions on the "table" — 2 upper, 1 mid, 2 lower
  const CARDS = [
    [16,  96,  108, 76],   // upper-left
    [144, 82,  108, 76],   // upper-right
    [12,  218, 108, 76],   // mid-left
    [148, 212, 108, 76],   // mid-right
    [74,  336, 114, 76],   // centre bottom
  ];
  // slight rotation per card (radians)
  const CARD_ROT = [-0.11, 0.08, 0.16, -0.06, -0.03];

  RetroSaga.create({
    id: 'pride-prejudice',
    title: 'Pride & Prejudice',
    subtitle: 'A TALE IN FIVE SCENES',
    currency: 'HEARTS',
    screens: {
      win:          '#c85a7a',
      lose:         '#6a4a8a',
      chapterLabel: '#8a9a7a',
      name:         '#f0e8d8',
      sub:          '#c85a7a',
      intro:        '#e8d8c0',
      quote:        '#9a8a9a',
      help:         '#c85a7a',
      score:        '#f0e8d8',
      cur:          '#c85a7a',
      cta:          '#f0e8d8',
      overlay:      'rgba(10,6,20,.86)',
    },
    labels: {
      chapter:  'SCENE',
      score:    'HEARTS WON',
      win:      'PROPRIETY PREVAILS',
      lose:     'FIRST IMPRESSIONS FAIL',
      cont:     'TAP TO CONTINUE',
      finale:   'TAP FOR THE FINALE',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO BEGIN',
    },
    accent:    '#c85a7a',
    credit:    'PRIDE AND PREJUDICE · JANE AUSTEN, 1813',
    bootLine:  'FIVE SCENES · ONE GREAT ROMANCE',
    bootCta:   'TAP TO ENTER',
    menuLabel: 'THE DANCE CARDS',
    menuHint:  'TAP A CARD TO PLAY',
    menuDone:  '✦ PRIDE AND PREJUDICE OVERCOME ✦',
    emblem,
    scenery,
    finale: [
      'IT IS A TRUTH',
      'UNIVERSALLY ACKNOWLEDGED',
      '',
      'THAT DARCY & ELIZABETH',
      'ARE HAPPY AT LAST.',
    ],
    palette: { gold: '#d4a020', blood: '#c85a7a', cream: '#f0e8d8', dim: '#8a7a8a' },
    width: 270, height: 480, parent: '#game',

    menu: {
      colors: { title: '#c85a7a', label: '#9a8a9a', cur: '#f0e8d8', hint: '#9a8a9a' },

      // title block drawn in the top area of the menu
      title(api, hearts) {
        const g = api.gfx, c = api.ctx, W = api.W;
        // parchment card at top
        g.rect(40, 14, W - 80, 56, '#f0e4d0');
        g.rectO(40, 14, W - 80, 56, '#b89070', 1);
        g.rectO(43, 17, W - 86, 50, '#d4b080', 1);
        api.txtCFit('PRIDE & PREJUDICE', W / 2, 24, 9, '#3a2a18', false, W - 90);
        api.txtCFit('THE DANCE CARDS', W / 2, 42, 8, '#7a5a3a', false, W - 90);
        api.txtC('HEARTS  ' + hearts, W / 2, 56, 8, '#c85a7a');
      },

      layout() {
        return CARDS.map((p) => ({ x: p[0], y: p[1], w: p[2], h: p[3] }));
      },

      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done, best } = info;
        const cx = x + w / 2, cy = y + h / 2;
        const rot = CARD_ROT[i] || 0;

        c.save();
        c.translate(cx, cy);
        c.rotate(rot);
        c.translate(-cx, -cy);

        // Ivory dance card
        g.rect(x, y, w, h, sel ? '#f8f0f4' : '#f0e8d8');
        g.rectO(x, y, w, h, sel ? '#c85a7a' : '#b8a898', sel ? 2 : 1);
        g.rectO(x + 3, y + 3, w - 6, h - 6, sel ? '#e07a9a' : '#d4c0b0', 1);

        // Scene number (small, top-center)
        api.txtC(String(i + 1), cx, y + 9, 7, '#8a6a5a');

        // Small rose decoration
        if (!done) {
          g.circle(cx - w / 2 + 12, y + 12, 4, '#c85a7a');
        } else {
          api.txtC('✦', cx - w / 2 + 12, y + 10, 8, '#c85a7a');
        }

        // Chapter name
        api.txtCFit(ch.name, cx, y + 30, 8, done ? '#c85a7a' : '#2a1a1a', false, w - 14);
        if (ch.sub) api.txtCFit(ch.sub, cx, y + 46, 7, '#6a5a5a', false, w - 14);

        // Score if done
        if (done && best) api.txtC(String(best), cx + w / 2 - 14, y + h - 14, 7, '#c85a7a');

        c.restore();
      },
    },

    chapters: [

      /* ══════════════════════════════════════════════════
       * CHAPTER 1 — THE MERYTON BALL
       * Dodge Mr. Collins, collect golden invitation cards
       * ══════════════════════════════════════════════════ */
      {
        id: 'ball',
        name: 'THE MERYTON BALL',
        sub: 'FIRST ENCOUNTERS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 2, 16, 10, '#c85a7a');
          g.rect(x - 6, y - 5, 12, 4, '#e07a9a');
          g.rect(x - 2, y + 8, 4, 4, '#f0e8d8');
        },
        intro: [
          'THE BENNET DAUGHTERS',
          'ARRIVE AT NETHERFIELD.',
          'MR COLLINS IS DETERMINED',
          'to lead Elizabeth out.',
        ],
        quote: 'Mr. Collins had only to change from Jane to Elizabeth — and it was soon done.',
        help: 'DRAG to move Elizabeth · collect invitation cards · avoid Mr. Collins',
        winText: 'Elizabeth slips away at last, laughing behind her fan.',
        loseText: 'Mr. Collins claims the dance. Elizabeth endures every long minute.',
        init(api) {
          this.ex = api.W / 2;
          this.ey = api.H - 110;
          this.cx = api.W / 2 + 60;
          this.invites = [];
          this.spawnT = 0.6;
          this.caught = 0;
          this.need = 8;
          this.lives = 3;
          this.timer = 30;
          this.hitCd = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          const W = api.W, H = api.H;

          // Move Elizabeth via pointer or keys
          if (api.pointer.down) this.ex = clamp(api.pointer.x, 22, W - 22);
          if (api.keyDown('left'))  this.ex = clamp(this.ex - 3.2 * f, 22, W - 22);
          if (api.keyDown('right')) this.ex = clamp(this.ex + 3.2 * f, 22, W - 22);

          // Collins drifts toward Elizabeth (slow)
          const cdx = this.ex - this.cx;
          this.cx += cdx * 0.010 * f;

          // Spawn invitation cards
          this.spawnT -= dt;
          if (this.spawnT <= 0 && this.invites.length < 3) {
            this.spawnT = api.rnd(0.8, 1.6);
            this.invites.push({ x: api.rnd(28, W - 28), y: api.rnd(50, H - 150) });
          }

          // Collect invites
          for (let i = this.invites.length - 1; i >= 0; i--) {
            const inv = this.invites[i];
            if (Math.hypot(this.ex - inv.x, this.ey - inv.y) < 22) {
              this.invites.splice(i, 1);
              this.caught++;
              api.score += 20;
              api.audio.sfx('coin');
              api.burst(inv.x, inv.y, '#d4a020', 8);
            }
          }

          // Collins catches Elizabeth
          this.hitCd = Math.max(0, this.hitCd - dt);
          if (this.hitCd === 0 && Math.abs(this.cx - this.ex) < 22) {
            this.lives--;
            this.hitCd = 1.6;
            api.shake(5, 0.28);
            api.flash('#8a2a4a', 0.25);
            api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }

          this.timer -= dt;
          if (this.caught >= this.need) { api.score += Math.floor(this.timer * 5); api.win(); return; }
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Ballroom floor — warm parquet
          api.clear('#1a1020');
          for (let fy = H - 140; fy < H; fy += 22) {
            for (let fx = 0; fx < W; fx += 44) {
              const off = Math.floor((fy - H + 140) / 22) % 2 * 22;
              g.rect(fx + off, fy, 42, 20, '#2a1a10');
              g.rectO(fx + off, fy, 42, 20, '#1a1008', 1);
            }
          }
          // Ballroom walls — pale blue-green panelling
          g.rect(0, 0, W, H - 140, '#1a1a2e');
          for (let fx = 14; fx < W - 14; fx += 50) {
            g.rectO(fx, 22, 36, H - 180, '#2a2a42', 1);
          }
          // Chandelier
          g.rect(W / 2 - 2, 0, 4, 24, '#b09060');
          g.circle(W / 2, 26, 16, '#d4a020');
          for (let a = 0; a < 8; a++) {
            const ang = a / 8 * Math.PI * 2;
            g.rect(W / 2 + Math.cos(ang) * 16 - 1, 26 + Math.sin(ang) * 16 - 4, 2, 8, '#d4b050');
          }
          c.globalAlpha = 0.3;
          const lgt = c.createRadialGradient(W / 2, 26, 0, W / 2, 26, 120);
          lgt.addColorStop(0, '#d4a020'); lgt.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = lgt; c.fillRect(0, 0, W, H - 140);
          c.globalAlpha = 1;

          // Invitation cards (gold envelopes)
          for (const inv of this.invites) {
            const pulse = 0.75 + 0.25 * Math.sin(api.t * 4 + inv.x);
            c.globalAlpha = 0.25 * pulse;
            g.circle(inv.x, inv.y, 18, '#d4a020');
            c.globalAlpha = 1;
            g.rect(inv.x - 10, inv.y - 7, 20, 14, '#d4a020');
            g.rectO(inv.x - 10, inv.y - 7, 20, 14, '#f0c840', 1);
            g.rect(inv.x - 10, inv.y - 7, 10, 7, '#e8b830');
          }

          // Mr. Collins — dark frock coat, earnest face
          const cFlash = this.hitCd > 0 && Math.floor(this.hitCd * 8) % 2 === 0;
          if (!cFlash) {
            g.sprite(['.kk.', 'kffk', '.kk.', 'kbbk', 'k..k'],
              this.cx - 6, this.ey - 20, { k: '#1a120e', f: '#c8a080', b: '#2a1a0e' }, 3);
          }

          // Elizabeth — rose gown
          const eShine = this.hitCd > 0 ? '#f09090' : '#e07a9a';
          g.sprite(['.hh.', 'hffh', '.rr.', 'rrrr', '.r.r'],
            this.ex - 6, this.ey - 20, { h: '#2a1810', f: '#d8a880', r: eShine }, 3);

          api.topBar('THE MERYTON BALL');
          api.txt('CARDS  ' + this.caught + '/' + this.need, 6, 20, 9, '#d4a020');
          for (let i = 0; i < 3; i++) g.rect(W - 54 + i * 16, 4, 10, 8, i < this.lives ? '#c85a7a' : '#2a1a2a');
          g.rect(6, H - 10, W - 12, 5, '#2a1a2a');
          g.rect(6, H - 10, (W - 12) * clamp(1 - this.timer / 30, 0, 1), 5, '#d4a020');
          api.vignette(); api.scanlines();
        },
      },

      /* ══════════════════════════════════════════════════
       * CHAPTER 2 — WICKHAM'S WORDS
       * Catch falling truths (roses), avoid flattering lies (masks)
       * ══════════════════════════════════════════════════ */
      {
        id: 'wickham',
        name: "WICKHAM'S WORDS",
        sub: 'CHARM AND DECEPTION',
        icon(api, x, y) {
          const g = api.gfx;
          // rose
          g.circle(x, y - 4, 5, '#c85a7a');
          g.rect(x - 1, y + 1, 2, 7, '#4a7a4a');
          // mask half
          g.rect(x + 4, y - 6, 8, 5, '#4a3a2a');
          g.rect(x + 5, y - 5, 2, 3, '#f0e8d8');
        },
        intro: [
          'WICKHAM ENCHANTS THE',
          'NEIGHBOURHOOD WITH HIS',
          'TALES OF DARCY\'S CRUELTY.',
          'Truth and lies fall together.',
        ],
        quote: 'He was exactly what he appeared — and he appeared everything that was charming.',
        help: 'DRAG left/right to catch ROSES · avoid the MASKS',
        winText: 'Elizabeth sees through the charm at last. The roses tell the truth.',
        loseText: 'The flattery is too sweet. She is quite taken in.',
        init(api) {
          this.bx = api.W / 2;
          this.items = [];
          this.spawnT = 0.55;
          this.roses = 0;
          this.need = 12;
          this.masks = 0;
          this.maxMasks = 4;
          this.timer = 28;
          this.speed = 1.4;
        },
        update(api, dt) {
          const f = dt * 60;
          const W = api.W, H = api.H;

          // Move basket
          if (api.pointer.down) this.bx = clamp(api.pointer.x, 20, W - 20);
          if (api.keyDown('left'))  this.bx = clamp(this.bx - 3.5 * f, 20, W - 20);
          if (api.keyDown('right')) this.bx = clamp(this.bx + 3.5 * f, 20, W - 20);

          // Spawn items
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.45, 0.9);
            const isMask = api.chance(0.38);
            this.items.push({
              x: api.rnd(18, W - 18),
              y: -12,
              vy: this.speed * api.rnd(0.85, 1.2),
              kind: isMask ? 'mask' : 'rose',
            });
          }

          // Move items down
          for (const it of this.items) it.y += it.vy * f;

          // Catch / miss at basket level
          const catchY = H - 74;
          for (let i = this.items.length - 1; i >= 0; i--) {
            const it = this.items[i];
            if (it.y >= catchY) {
              if (Math.abs(it.x - this.bx) < 28) {
                if (it.kind === 'rose') {
                  this.roses++;
                  api.score += 10;
                  api.audio.sfx('coin');
                  api.burst(it.x, catchY, '#c85a7a', 8);
                } else {
                  this.masks++;
                  api.shake(5, 0.28);
                  api.flash('#4a2a6a', 0.22);
                  api.audio.sfx('hurt');
                }
              }
              this.items.splice(i, 1);
            }
          }

          // Remove off-screen
          this.items = this.items.filter((it) => it.y < H + 20);

          this.timer -= dt;
          this.speed = 1.4 + (28 - Math.max(0, this.timer)) * 0.04;

          if (this.roses >= this.need) { api.score += Math.floor(this.timer * 6); api.win(); return; }
          if (this.masks >= this.maxMasks) { api.lose(); return; }
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Garden evening
          api.clear('#0e1a18');
          // Hedge rows
          for (let hy = 30; hy < H - 100; hy += 60) {
            g.rect(0, hy, W, 28, '#1a2e1a');
            for (let hx = 6; hx < W; hx += 20) g.circle(hx + 6, hy + 10, 7, '#224022');
          }

          // Falling items
          for (const it of this.items) {
            if (it.kind === 'rose') {
              g.circle(it.x, it.y, 7, '#c85a7a');
              g.circle(it.x - 2, it.y - 2, 3, '#e07a9a');
              g.rect(it.x - 1, it.y + 7, 2, 8, '#3a6030');
            } else {
              // theatre mask — dark, half-shadowed
              g.rect(it.x - 8, it.y - 6, 16, 12, '#3a2a18');
              g.rectO(it.x - 8, it.y - 6, 16, 12, '#6a5030', 1);
              g.rect(it.x - 4, it.y - 3, 3, 3, '#f0e8d8');
              g.rect(it.x + 2, it.y - 3, 3, 3, '#f0e8d8');
              g.rect(it.x - 3, it.y + 2, 6, 2, '#d07a40');
            }
          }

          // Fan / basket catcher at bottom
          const bY = H - 74;
          g.rect(this.bx - 24, bY, 48, 10, '#c85a7a');
          g.rectO(this.bx - 24, bY, 48, 10, '#e07a9a', 1);
          // fan handle
          g.rect(this.bx - 2, bY + 10, 4, 14, '#d4a020');

          // HUD
          api.topBar("WICKHAM'S WORDS");
          api.txt('ROSES  ' + this.roses + '/' + this.need, 6, 20, 9, '#c85a7a');
          for (let i = 0; i < this.maxMasks; i++) {
            g.rect(W - 8 - (i + 1) * 13, 4, 10, 8, i < this.masks ? '#4a2a6a' : '#2a1a2a');
          }
          g.rect(6, H - 10, W - 12, 5, '#2a1a2a');
          g.rect(6, H - 10, (W - 12) * clamp(1 - this.timer / 28, 0, 1), 5, '#c85a7a');
          api.vignette(); api.scanlines();
        },
      },

      /* ══════════════════════════════════════════════════
       * CHAPTER 3 — MR COLLINS PROPOSES
       * Timing: hit the DECLINE zone in the oscillating meter
       * ══════════════════════════════════════════════════ */
      {
        id: 'collins',
        name: 'MR COLLINS PROPOSES',
        sub: 'A MOST IMPERTINENT SUIT',
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite(['.bb.', 'bccb', '.bb.'], x - 6, y - 6, { b: '#2a1810', c: '#c8a080' }, 3);
          g.rect(x + 2, y - 4, 6, 3, '#d4a020');
        },
        intro: [
          'MR COLLINS INFORMS',
          'ELIZABETH THAT HE',
          'INTENDS TO HONOUR HER.',
          'She must decline firmly.',
        ],
        quote: 'You could not make me happy, and I am convinced that I am the last woman who could make you so.',
        help: 'TAP when the ring enters the green zone',
        winText: 'Five firm refusals. Mr. Collins retreats to console himself with Charlotte.',
        loseText: 'Faltering once was enough. Mr. Collins takes it as encouragement.',
        init(api) {
          this.m = 0.5;
          this.dir = 1;
          this.spd = 0.9;
          this.band = 0.20;
          this.declines = 0;
          this.need = 5;
          this.misses = 0;
          this.phase = 0; // speech phase text
          const speeches = [
            'My reasons are…',
            'Lady Catherine insists…',
            'The honour I offer…',
            'Your modesty adds…',
            'I shall prevail…',
          ];
          this.speech = speeches;
        },
        update(api, dt) {
          const f = dt * 60;
          this.m += this.dir * this.spd * 0.028 * f;
          if (this.m >= 1) { this.m = 1; this.dir = -1; }
          if (this.m <= 0) { this.m = 0; this.dir = 1; }

          if (api.confirm()) {
            if (Math.abs(this.m - 0.5) < this.band) {
              this.declines++;
              api.score += 25;
              api.audio.sfx('power');
              api.burst(api.W / 2, api.H * 0.6, '#c85a7a', 10);
              api.flash('#c85a7a', 0.12);
              this.spd = Math.min(2.6, this.spd + 0.22);
              this.band = Math.max(0.09, this.band - 0.018);
              this.phase = Math.min(this.need - 1, this.declines);
              if (this.declines >= this.need) { api.score += 80; api.win(); }
            } else {
              this.misses++;
              api.shake(5, 0.22);
              api.audio.sfx('hurt');
              if (this.misses >= 3) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H, cx = W / 2;

          // Drawing room
          api.clear('#18141e');
          g.rect(0, 0, W, H - 160, '#1e1828');
          for (let fx = 10; fx < W - 10; fx += 54) {
            g.rectO(fx, 14, 40, H - 200, '#2a2440', 1);
          }
          // fireplace glow
          c.globalAlpha = 0.18;
          const fg = c.createRadialGradient(cx, H - 90, 4, cx, H - 90, 100);
          fg.addColorStop(0, '#d4a020'); fg.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = fg; c.fillRect(0, H - 190, W, 200);
          c.globalAlpha = 1;
          // fireplace
          g.rect(cx - 28, H - 110, 56, 40, '#1a100a');
          g.rectO(cx - 28, H - 110, 56, 40, '#5a3a1a', 1);
          g.rect(cx - 16, H - 100, 32, 26, '#d4500a');
          g.rect(cx - 16, H - 100, 32, 26, 'rgba(255,200,0,.2)');

          // Mr. Collins figure (centre, speaking)
          const bob = Math.sin(api.t * 4) * 1.5;
          g.sprite(['.kk.', 'kffk', '.kk.', 'kbbk', 'k..k'],
            cx - 9, H - 195 + bob, { k: '#18100a', f: '#c8a080', b: '#1a1210' }, 4);

          // His speech bubble
          const sp = this.speech[this.phase] || '';
          g.rect(cx + 14, H - 210 + bob, 80, 22, '#f0e8d8');
          g.rectO(cx + 14, H - 210 + bob, 80, 22, '#b8a888', 1);
          g.rect(cx + 14, H - 188 + bob, 8, 6, '#f0e8d8');
          api.txtCFit(sp, cx + 54, H - 204 + bob, 7, '#3a2818', false, 74);

          // Timing meter
          const my = H - 60, mx = 24, mw = W - 48;
          g.rect(mx, my, mw, 14, '#2a1a2a');
          g.rect(mx + mw * (0.5 - this.band), my, mw * this.band * 2, 14, 'rgba(93,220,120,.35)');
          g.rect(mx + mw * 0.5 - 1, my - 3, 2, 20, '#5dff8f');
          g.rect(mx + mw * this.m - 3, my - 5, 6, 24, '#d4a020');
          api.txtC('DECLINE', cx, my + 20, 9, '#c85a7a', true);

          api.topBar('MR COLLINS PROPOSES');
          api.txt('NO  ' + this.declines + '/' + this.need, 6, 20, 9, '#c85a7a');
          api.txt('SLIP ' + this.misses + '/3', W - 76, 20, 9, this.misses > 1 ? '#9a2a4a' : '#5a4a6a');
          api.vignette(); api.scanlines();
        },
      },

      /* ══════════════════════════════════════════════════
       * CHAPTER 4 — THE ROAD TO LONDON
       * Runner: steer Darcy's carriage, dodge gossip sheets, collect coins
       * ══════════════════════════════════════════════════ */
      {
        id: 'london',
        name: 'THE ROAD TO LONDON',
        sub: "DARCY'S ERRAND",
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 3, 16, 8, '#2a1810');
          g.circle(x - 5, y + 5, 3, '#3a3030');
          g.circle(x + 5, y + 5, 3, '#3a3030');
        },
        intro: [
          'LYDIA ELOPES WITH WICKHAM.',
          'DARCY RIDES SECRETLY',
          'TO LONDON TO BUY THEM',
          'out and save the Bennets.',
        ],
        quote: 'He had done it for her. For Elizabeth.',
        help: 'DRAG left/right to steer the carriage · collect banknotes · avoid gossip',
        winText: 'Darcy reaches town in time. The scandal is contained. Elizabeth will never know.',
        loseText: 'The carriage overturns. Wickham disappears into the London crowds.',
        init(api) {
          this.cx = api.W / 2;
          this.obs = [];
          this.coins = [];
          this.spawnT = 0.7;
          this.coinT = 0.9;
          this.collected = 0;
          this.need = 10;
          this.lives = 3;
          this.timer = 30;
          this.spd = 2.0;
          this.hitCd = 0;
          this.scroll = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          const W = api.W, H = api.H;
          this.scroll += 5 * f;

          // Steer carriage
          if (api.pointer.down) this.cx = clamp(api.pointer.x, 22, W - 22);
          if (api.keyDown('left'))  this.cx = clamp(this.cx - 3.2 * f, 22, W - 22);
          if (api.keyDown('right')) this.cx = clamp(this.cx + 3.2 * f, 22, W - 22);

          // Spawn obstacles (gossip sheets — newspapers)
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.55, 1.0);
            const lanes = [W * 0.2, W * 0.5, W * 0.8];
            this.obs.push({ x: api.choice(lanes) + api.rnd(-16, 16), y: -20, vy: this.spd * api.rnd(0.9, 1.2) });
          }

          // Spawn coins (banknotes)
          this.coinT -= dt;
          if (this.coinT <= 0) {
            this.coinT = api.rnd(0.6, 1.2);
            this.coins.push({ x: api.rnd(24, W - 24), y: -14, vy: this.spd * 0.8 });
          }

          const carriageY = H - 90;

          // Move + check obstacles
          this.hitCd = Math.max(0, this.hitCd - dt);
          for (const o of this.obs) o.y += o.vy * f;
          for (let i = this.obs.length - 1; i >= 0; i--) {
            const o = this.obs[i];
            if (o.y > H + 20) { this.obs.splice(i, 1); continue; }
            if (this.hitCd === 0 && Math.abs(o.x - this.cx) < 24 && Math.abs(o.y - carriageY) < 20) {
              this.lives--;
              this.hitCd = 1.4;
              this.obs.splice(i, 1);
              api.shake(6, 0.28);
              api.flash('#3a1a0a', 0.25);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }

          // Move + collect coins
          for (const co of this.coins) co.y += co.vy * f;
          for (let i = this.coins.length - 1; i >= 0; i--) {
            const co = this.coins[i];
            if (co.y > H + 20) { this.coins.splice(i, 1); continue; }
            if (Math.abs(co.x - this.cx) < 22 && Math.abs(co.y - carriageY) < 18) {
              this.collected++;
              api.score += 10;
              api.audio.sfx('coin');
              api.burst(co.x, co.y, '#d4a020', 6);
              this.coins.splice(i, 1);
            }
          }

          this.timer -= dt;
          this.spd = 2.0 + (30 - Math.max(0, this.timer)) * 0.055;
          if (this.collected >= this.need) { api.score += Math.floor(this.timer * 5); api.win(); return; }
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Night road
          api.clear('#0e100a');
          // Scrolling road
          g.rect(W / 2 - 50, 0, 100, H, '#18140e');
          const sc = this.scroll % 60;
          for (let y = -60 + sc; y < H; y += 60) {
            g.rect(W / 2 - 2, y, 4, 28, '#3a3018');
          }
          // Road sides — verge
          for (let y = 0; y < H; y += 18) {
            g.rect(0, y, W / 2 - 50, 2, '#1a200e');
            g.rect(W / 2 + 50, y, W - (W / 2 + 50), 2, '#1a200e');
          }
          // Trees scrolling at sides
          const ts = (this.scroll * 0.4) % 80;
          for (let y = -80 + ts; y < H; y += 80) {
            g.rect(10, y, 8, 30, '#2a3810'); g.circle(14, y - 6, 14, '#1a2e10');
            g.rect(W - 18, y, 8, 30, '#2a3810'); g.circle(W - 14, y - 6, 14, '#1a2e10');
          }

          // Gossip sheets (newspaper obstacle)
          for (const o of this.obs) {
            g.rect(o.x - 12, o.y - 8, 24, 16, '#e8e0d0');
            g.rectO(o.x - 12, o.y - 8, 24, 16, '#8a7060', 1);
            g.rect(o.x - 8, o.y - 4, 16, 2, '#8a7060');
            g.rect(o.x - 8, o.y + 1, 16, 2, '#8a7060');
          }

          // Banknotes (gold)
          for (const co of this.coins) {
            g.rect(co.x - 8, co.y - 5, 16, 10, '#d4a020');
            g.rectO(co.x - 8, co.y - 5, 16, 10, '#f0c040', 1);
            api.txtC('£', co.x, co.y - 4, 8, '#3a2000');
          }

          // Darcy's carriage
          const carriageY = H - 90;
          const cf = this.hitCd > 0 && Math.floor(this.hitCd * 6) % 2 === 0;
          if (!cf) {
            g.rect(this.cx - 20, carriageY - 14, 40, 22, '#1a1208');
            g.rectO(this.cx - 20, carriageY - 14, 40, 22, '#5a4020', 1);
            g.rect(this.cx - 10, carriageY - 12, 20, 14, '#d4900a');
            g.circle(this.cx - 14, carriageY + 8, 6, '#3a3020');
            g.circle(this.cx + 14, carriageY + 8, 6, '#3a3020');
          }

          api.topBar("THE ROAD TO LONDON");
          api.txt('£  ' + this.collected + '/' + this.need, 6, 20, 9, '#d4a020');
          for (let i = 0; i < 3; i++) g.rect(W - 54 + i * 16, 4, 10, 8, i < this.lives ? '#c85a7a' : '#2a1a2a');
          g.rect(6, H - 10, W - 12, 5, '#2a1a2a');
          g.rect(6, H - 10, (W - 12) * clamp(1 - this.timer / 30, 0, 1), 5, '#d4a020');
          api.vignette(); api.scanlines();
        },
      },

      /* ══════════════════════════════════════════════════
       * CHAPTER 5 — THE MORNING WALK
       * Approach timing: tap when the "speak" ring reaches the heart
       * ══════════════════════════════════════════════════ */
      {
        id: 'proposal',
        name: 'THE MORNING WALK',
        sub: 'LONGBOURN FIELDS',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 6, '#c85a7a');
          g.circle(x - 2, y - 2, 2, '#e07a9a');
          g.circle(x + 1, y - 3, 1, '#f0a0b8');
        },
        intro: [
          'ELIZABETH KNOWS THE TRUTH',
          'OF DARCY\'S GOODNESS.',
          'ON A MISTY MORNING,',
          'they walk toward each other.',
        ],
        quote: 'You must allow me to tell you how ardently I admire and love you.',
        help: 'TAP when the ring glows green to speak your heart',
        winText: '"I love you." The words are said at last. Longbourn never looked so fair.',
        loseText: 'The moment passes. They walk on in silence, each too proud to speak.',
        init(api) {
          this.r = 80;
          this.dir = -1;
          this.spd = 0.65;
          this.targetR = 14;
          this.moments = 0;
          this.need = 6;
          this.misses = 0;
          this.maxMiss = 3;
          // Elizabeth and Darcy approach from opposite sides
          this.ex = 30;
          this.dx = api.W - 30;
          this.heartAlpha = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.r += this.dir * this.spd * f;
          if (this.r <= 8)  { this.r = 8;  this.dir = 1; }
          if (this.r >= 82) { this.r = 82; this.dir = -1; }

          if (api.confirm()) {
            if (Math.abs(this.r - this.targetR) < 7) {
              this.moments++;
              api.score += 30;
              api.audio.sfx('coin');
              this.heartAlpha = 1;
              api.burst(api.W / 2, api.H / 2, '#c85a7a', 14);
              api.flash('#c85a7a', 0.12);
              // draw characters closer
              this.ex = Math.min(api.W / 2 - 20, this.ex + (api.W / 2 - 30) / this.need);
              this.dx = Math.max(api.W / 2 + 20, this.dx - (api.W / 2 - 30) / this.need);
              this.spd = Math.min(2.0, this.spd + 0.18);
              if (this.moments >= this.need) { api.score += 100; api.win(); }
            } else {
              this.misses++;
              api.shake(4, 0.2);
              api.audio.sfx('hurt');
              if (this.misses >= this.maxMiss) { api.lose(); }
            }
          }
          this.heartAlpha = Math.max(0, this.heartAlpha - dt * 1.5);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H, cx = W / 2, cy = H / 2;

          // Misty dawn meadow
          api.clear('#1a1c22');
          // Sky gradient — dawn blush
          const dawn = c.createLinearGradient(0, 0, 0, H * 0.55);
          dawn.addColorStop(0, '#1a1220');
          dawn.addColorStop(0.6, '#2e1a28');
          dawn.addColorStop(1, '#1e2a1a');
          c.fillStyle = dawn; c.fillRect(0, 0, W, H * 0.55);

          // Rising sun glow on horizon
          const progress = this.moments / this.need;
          c.globalAlpha = 0.15 + progress * 0.35;
          const sg = c.createRadialGradient(cx, H * 0.55, 0, cx, H * 0.55, 100);
          sg.addColorStop(0, '#f0a040'); sg.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = sg; c.fillRect(0, H * 0.3, W, H * 0.4);
          c.globalAlpha = 1;

          // Ground
          g.rect(0, H * 0.55, W, H - H * 0.55, '#1e3018');
          // Misty grass lines
          for (let y = H * 0.55; y < H; y += 18) {
            c.globalAlpha = 0.06 + 0.04 * Math.sin(api.t * 0.5 + y * 0.1);
            g.rect(0, y, W, 2, '#7ab07a');
          }
          c.globalAlpha = 1;

          // Mist ribbons
          c.globalAlpha = 0.08;
          for (let i = 0; i < 4; i++) {
            const my = H * 0.48 + i * 22;
            const mx = ((api.t * (12 + i * 5)) % (W + 120)) - 60;
            g.rect(mx, my, 100, 10, '#c0d0c0');
          }
          c.globalAlpha = 1;

          // Heart glow (when moments collected)
          if (this.heartAlpha > 0) {
            c.globalAlpha = this.heartAlpha * 0.6;
            const hg = c.createRadialGradient(cx, cy, 0, cx, cy, 60);
            hg.addColorStop(0, '#c85a7a'); hg.addColorStop(1, 'rgba(0,0,0,0)');
            c.fillStyle = hg; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          // Approach ring
          const inZone = Math.abs(this.r - this.targetR) < 7;
          // outer ring
          c.strokeStyle = inZone ? '#5dff8f' : 'rgba(200,160,180,0.5)';
          c.lineWidth = inZone ? 2 : 1.5;
          c.beginPath(); c.arc(cx, cy, this.r, 0, Math.PI * 2); c.stroke();
          // inner heart target
          c.strokeStyle = inZone ? '#5dff8f' : '#c85a7a';
          c.lineWidth = 2;
          c.beginPath(); c.arc(cx, cy, this.targetR, 0, Math.PI * 2); c.stroke();
          g.circle(cx, cy, 5, inZone ? '#5dff8f' : '#e07a9a');

          const baseY = H * 0.55 - 10;

          // Elizabeth — rose gown, walking from left
          g.sprite(['.hh.', 'hffh', '.rr.', 'rrrr', '.r.r'],
            this.ex - 6, baseY - 20, { h: '#2a1810', f: '#d8a880', r: '#e07a9a' }, 3);

          // Darcy — dark coat, walking from right
          g.sprite(['.kk.', 'kffk', '.kk.', 'kbbk', 'k..k'],
            this.dx - 6, baseY - 20, { k: '#18120e', f: '#c8a080', b: '#2a1810' }, 3);

          // Progress hearts below meter
          for (let i = 0; i < this.need; i++) {
            const hx = cx - (this.need / 2) * 14 + i * 14 + 7;
            g.rect(hx - 4, H - 30, 10, 9, i < this.moments ? '#c85a7a' : '#2a1a2a');
          }

          api.topBar('THE MORNING WALK');
          api.txt('MOMENTS  ' + this.moments + '/' + this.need, 6, 20, 9, '#c85a7a');
          api.txt('SLIP ' + this.misses + '/' + this.maxMiss, W - 82, 20, 9, this.misses > 1 ? '#9a2a4a' : '#5a4a6a');
          api.vignette(); api.scanlines();
        },
      },

    ], // end chapters
  }); // end RetroSaga.create
})();
