/* ============================================================================
 * TARZAN — LORD OF THE VINES
 * Five chapters through Burroughs' 1912 novel:
 *   1. THE JUNGLE CRADLE — dodge falling dangers (left/right)
 *   2. KING OF THE CANOPY — vine-swing timing (pendulum launch)
 *   3. KING OF THE APES  — combat timing vs Kerchak (attack/dodge)
 *   4. THE RESCUE        — stealth maze, reach Jane past ape guards
 *   5. LORD OF THE JUNGLE — aim & throw spears at ivory hunters
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── Tarzan handprint emblem ── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // palm
    c.beginPath();
    c.ellipse(cx, cy + 4, 14, 12, 0, 0, Math.PI * 2);
    c.fillStyle = '#8b5a2b'; c.fill();
    // thumb
    c.beginPath(); c.ellipse(cx - 15, cy + 2, 5, 8, -0.5, 0, Math.PI * 2); c.fill();
    // four fingers
    const fx = [-7, -2, 4, 10];
    for (const x of fx) {
      c.beginPath(); c.ellipse(cx + x, cy - 14, 4, 9, 0, 0, Math.PI * 2); c.fill();
    }
  }

  /* ── Jungle canopy backdrop ── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Sky — deep jungle
    const sky = c.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, '#0a1f0a');
    sky.addColorStop(1, '#1a4a20');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // Ground
    c.fillStyle = '#122a0a'; c.fillRect(0, H * 0.7, W, H);

    // Sunbeam shafts through canopy
    c.globalAlpha = 0.08 + 0.03 * Math.sin(t * 0.4);
    c.fillStyle = '#d0f060';
    c.beginPath(); c.moveTo(W * 0.5, 0); c.lineTo(W * 0.7, 0); c.lineTo(W * 0.35, H * 0.68); c.lineTo(W * 0.2, H * 0.68); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(W * 0.1, 0); c.lineTo(W * 0.22, 0); c.lineTo(W * 0.08, H * 0.5); c.lineTo(W * 0.0, H * 0.5); c.closePath(); c.fill();
    c.globalAlpha = 1;

    // Background trees
    const treeXs = [0, 42, 88, 140, 192, 240, 268];
    const treeHs = [0.4, 0.35, 0.45, 0.38, 0.42, 0.36, 0.44];
    for (let i = 0; i < treeXs.length; i++) {
      const tx = treeXs[i], th = treeHs[i];
      c.fillStyle = '#102208'; c.fillRect(tx + 14, H * th + 10, 14, H * (1 - th));
      c.globalAlpha = 0.7;
      c.fillStyle = '#1e4010';
      c.beginPath(); c.ellipse(tx + 21, H * th, 32, 26, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    }

    // Hanging vines
    for (let i = 0; i < 7; i++) {
      const vx = (i * 43 + 14) % W;
      const sway = Math.sin(t * 0.6 + i * 1.1) * 12;
      c.strokeStyle = '#2d5a18'; c.lineWidth = 2; c.globalAlpha = 0.45 + 0.15 * Math.sin(t + i);
      c.beginPath();
      c.moveTo(vx, 0);
      c.quadraticCurveTo(vx + sway, H * 0.38, vx + sway * 1.4, H * 0.72);
      c.stroke();
      c.globalAlpha = 1;
    }

    // Exotic birds
    for (let i = 0; i < 3; i++) {
      const bx = ((t * 28 + i * 110) % (W + 60)) - 30;
      const by = 28 + i * 26 + Math.sin(t * 1.2 + i) * 8;
      g.sprite(['.b.b.', 'bbbbb'], bx, by, { b: i === 0 ? '#ff6020' : i === 1 ? '#20b0ff' : '#ff20b0' }, 2);
    }

    // Overlay for story/result screens
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(4,12,4,.70)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(4,12,4,.38)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * RETROSAGA
   * ══════════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id: 'tarzan',
    title: 'Lord of the Vines',
    subtitle: 'FIVE TALES OF THE JUNGLE LORD',
    currency: 'VINES',

    screens: {
      win:          '#5dff8f',
      lose:         '#8b3a10',
      chapterLabel: '#7aaa60',
      name:         '#d0f0a0',
      sub:          '#9ae060',
      intro:        '#c0e890',
      quote:        '#7aaa60',
      help:         '#5dff8f',
      score:        '#d0f0a0',
      cur:          '#5dff8f',
      cta:          '#d0f0a0',
      overlay:      'rgba(4,12,4,.84)',
    },
    labels: {
      chapter: 'TALE',
      score:   'PREY CLAIMED',
      win:     'THE JUNGLE ANSWERS',
      lose:    'THE JUNGLE TAKES YOU',
      cont:    'TAP TO SWING ON',
      finale:  'TAP TO CLAIM THE JUNGLE',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO BEGIN',
    },

    accent:    '#5dff8f',
    credit:    'AN ORIGINAL 8-BIT TRIBUTE · E. R. BURROUGHS, 1912',
    emblem,
    scenery,
    bootCta:   'TAP TO ENTER THE JUNGLE',
    menuLabel: 'THE FIVE TALES',
    menuHint:  'CHOOSE A TALE',
    menuDone:  'THE JUNGLE IS YOURS',

    /* ── Chapter-select: scattered tree platforms connected by hanging vines ── */
    menu: {
      colors: { title: '#5dff8f', label: '#7aaa60', cur: '#d0f0a0' },

      layout(api) {
        // Non-list: canopy platforms at varying heights
        return [
          { x: 14,  y: 68,  w: 108, h: 68 },  // top-left
          { x: 146, y: 120, w: 108, h: 68 },  // upper-right
          { x: 6,   y: 212, w: 108, h: 68 },  // mid-left
          { x: 153, y: 264, w: 108, h: 68 },  // mid-right
          { x: 72,  y: 358, w: 118, h: 68 },  // bottom-center
        ];
      },

      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done, best } = info;

        // Vine rope connecting to next platform
        if (i < 4) {
          const rects = [[14,68],[146,120],[6,212],[153,264],[72,358]];
          const nx = rects[i + 1][0] + rects[i + 1][2] / 2;
          const ny = rects[i + 1][1];
          const ox = x + w / 2, oy = y + h;
          c.strokeStyle = '#3a6a20'; c.lineWidth = 2; c.globalAlpha = 0.55;
          c.beginPath();
          c.moveTo(ox, oy);
          c.quadraticCurveTo((ox + nx) / 2, oy + (ny - oy) * 0.6 + 18, nx, ny);
          c.stroke();
          c.globalAlpha = 1;
        }

        // Platform: bark-textured leaf perch
        c.fillStyle = sel ? '#28560e' : '#182e0a';
        c.beginPath(); c.roundRect(x, y, w, h, 7); c.fill();
        c.strokeStyle = sel ? '#5dff8f' : '#2d5a1a'; c.lineWidth = sel ? 2 : 1; c.stroke();

        // Leaf canopy on top edge
        c.fillStyle = sel ? '#4aaa28' : '#2a5a12';
        for (let j = 0; j < 3; j++) {
          c.beginPath();
          c.ellipse(x + w * 0.25 + j * w * 0.25, y + 3, w * 0.15, 7, 0, 0, Math.PI * 2);
          c.fill();
        }

        // Tale number
        api.txtC(String(i + 1), x + w / 2, y + 16, 8, sel ? '#d0f0a0' : '#7aaa60');
        // Chapter name
        api.txtCFit(ch.name, x + w / 2, y + 34, 7, done ? '#5dff8f' : '#c0e890', false, w - 10);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2, y + 50, 6, '#7aaa60', false, w - 10);
        if (done) api.txtC('✦', x + w / 2, y + h - 13, 9, '#5dff8f');
      },
    },

    finale: ['THE JUNGLE BOWS.', '', 'KERCHAK NODS.', 'JANE SMILES.', '', 'TARZAN ROARS.'],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#f0c040', vine: '#5dff8f' },

    chapters: [

      /* ════════════════════════════════════════════════════════════════════
       * 1. THE JUNGLE CRADLE — dodge falling hazards (left/right)
       * ════════════════════════════════════════════════════════════════════ */
      {
        id: 'cradle',
        name: 'THE JUNGLE CRADLE',
        sub: 'BORN TO THE WILD',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 4, 5, '#f0c0a0');
          g.rect(x - 4, y + 1, 8, 7, '#8b5a2b');
        },
        intro: ['LORD AND LADY GREYSTOKE', 'ARE MAROONED IN AFRICA.', 'THEIR INFANT SON', 'is raised by the apes.'],
        quote: 'From the branches of a great tree, the ape-child looked out upon the moonlit clearing.',
        help: 'TAP LEFT or RIGHT side to dodge falling dangers',
        winText: 'The ape-child survives the jungle night. Kala holds him close.',
        loseText: 'The jungle is not gentle with the unprepared.',
        init(api) {
          this.px = api.W / 2; this.py = api.H - 72;
          this.hazards = []; this.nextSpawn = 0.9;
          this.cleared = 0; this.need = 16;
          this.timer = 32; this.hp = 3;
          this.W = api.W; this.H = api.H;
        },
        update(api, dt) {
          this.timer -= dt;
          if (this.timer <= 0) { api.score += 60; api.win(); return; }

          // Horizontal move
          const goL = api.keyDown('left') || (api.pointer.down && api.pointer.x < this.W / 2);
          const goR = api.keyDown('right') || (api.pointer.down && api.pointer.x >= this.W / 2);
          if (goL) this.px = Math.max(18, this.px - 140 * dt);
          if (goR) this.px = Math.min(this.W - 18, this.px + 140 * dt);

          // Spawn hazards
          this.nextSpawn -= dt;
          if (this.nextSpawn <= 0) {
            this.nextSpawn = Math.max(0.28, 0.9 - (32 - this.timer) * 0.016);
            const ks = ['coconut', 'snake', 'branch'];
            this.hazards.push({
              x: api.rnd(18, this.W - 18), y: -12,
              vy: 100 + api.rnd(0, 80), kind: api.choice(ks),
            });
          }

          for (const h of this.hazards) {
            h.y += h.vy * dt;
            if (Math.hypot(h.x - this.px, h.y - this.py) < 18) {
              h.dead = true; this.hp--;
              api.shake(7, 0.28); api.flash('#ff4040', 0.18); api.audio.sfx('hurt');
              if (this.hp <= 0) { api.lose(); return; }
            }
            if (h.y > this.H + 10) { h.dead = true; this.cleared++; }
          }
          this.hazards = this.hazards.filter(h => !h.dead);
          if (this.cleared >= this.need) { api.score += 80; api.win(); return; }
          api.score = this.cleared * 6 + Math.floor((32 - this.timer) * 2);
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#0a200a');
          // Moon
          g.circle(W - 38, 38, 22, '#d8e890'); g.circle(W - 30, 32, 18, '#162a0e');
          // Trees
          for (let i = 0; i < 5; i++) {
            const tx = i * 60 - 10;
            g.rect(tx + 22, 0, 14, H, '#102008');
            g.circle(tx + 29, 36 + i * 14, 30, '#1e4010');
          }
          // Ground
          g.rect(0, H - 52, W, 52, '#1a3a10');
          g.rect(0, H - 52, W, 4, '#4a8a28');

          // Hazards
          for (const h of this.hazards) {
            if (h.kind === 'coconut') {
              g.circle(h.x, h.y, 8, '#5a3a1a'); g.rect(h.x - 2, h.y - 3, 4, 3, '#8b5a2b');
            } else if (h.kind === 'snake') {
              g.rect(h.x - 9, h.y - 3, 18, 6, '#2a8a20'); g.rect(h.x + 7, h.y - 5, 4, 4, '#e04020');
            } else {
              g.rect(h.x - 13, h.y - 3, 26, 6, '#5a3a1a');
            }
          }

          // Tarzan (young)
          g.circle(this.px, this.py - 10, 9, '#f0c0a0');
          g.rect(this.px - 5, this.py, 10, 12, '#8b5a2b');

          api.topBar('THE JUNGLE CRADLE');
          api.txt('DODGED ' + this.cleared + '/' + this.need, 6, 20, 9, '#5dff8f');
          for (let i = 0; i < 3; i++) g.rect(W - 64 + i * 21, 5, 15, 12, i < this.hp ? '#5dff8f' : '#2a3a20');
          // Timer bar
          g.rect(6, H - 13, W - 12, 6, '#1a2a10');
          g.rect(6, H - 13, (W - 12) * clamp(this.timer / 32, 0, 1), 6, '#f0c040');
          api.vignette();
        },
      },

      /* ════════════════════════════════════════════════════════════════════
       * 2. KING OF THE CANOPY — vine-swing timing (pendulum)
       * ════════════════════════════════════════════════════════════════════ */
      {
        id: 'canopy',
        name: 'KING OF THE CANOPY',
        sub: 'SWING FREE',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x, y - 12, 2, 16, '#5a3a1a');
          g.circle(x + 1, y + 6, 5, '#f0c0a0');
        },
        intro: ['TARZAN RACES THROUGH', 'THE CANOPY — FASTER', 'THAN ANY APE ALIVE.', 'Vine by vine. Never fall.'],
        quote: 'He swung from tree to tree as the crow flies, and for the same distance it would have taken him but a fraction of the time.',
        help: 'TAP when the swing arc peaks toward the next vine',
        winText: 'Vine by vine — Tarzan reaches the far side. None can match him.',
        loseText: 'A vine missed — and the canopy rushes past.',
        init(api) {
          this.W = api.W; this.H = api.H;
          // Generate fixed vine anchor positions across the canopy
          this.vines = [];
          const startX = 44;
          for (let i = 0; i < 9; i++) {
            this.vines.push({ x: startX + i * 28, y: 32 + (i % 3) * 14 });
          }
          this.cur = 0;           // which vine Tarzan is on
          this.angle = -0.6;      // pendulum angle from vertical
          this.angVel = 1.8;      // angular velocity (rad/s)
          this.pendLen = 90;
          this.launched = false;
          this.launchVx = 0; this.launchVy = 0;
          this.px = 0; this.py = 0; // free-flight pos
          this.hp = 3;
          this.cleared = 0;
          this._tapped = false;
        },
        update(api, dt) {
          const f = dt;
          if (this.launched) {
            // Free flight
            this.launchVy += 380 * dt;
            this.px += this.launchVx * dt;
            this.py += this.launchVy * dt;

            // Check if caught next vine
            const next = this.vines[this.cur + 1];
            if (next && Math.hypot(this.px - next.x, this.py - next.y) < this.pendLen + 20 &&
                this.py < next.y + this.pendLen + 20) {
              this.cur++;
              this.cleared++;
              this.launched = false;
              // Set angle based on arrival direction
              const av = this.cur < this.vines.length ? this.vines[this.cur] : null;
              if (av) {
                const dx = this.px - av.x, dy = this.py - av.y;
                this.angle = Math.atan2(dx, dy);
                this.pendLen = clamp(Math.hypot(dx, dy), 50, 110);
                this.angVel = -0.8;
              }
              api.burst(this.px, this.py, '#5dff8f', 6);
              api.audio.sfx('coin');
              if (this.cleared >= this.vines.length - 1) { api.score += 120; api.win(); return; }
            } else if (this.py > this.H - 20) {
              // Fell
              this.hp--;
              api.shake(8, 0.3); api.flash('#ff3030', 0.2); api.audio.sfx('hurt');
              if (this.hp <= 0) { api.lose(); return; }
              // Reset to current vine
              this.launched = false;
              this.angle = -0.5; this.angVel = 1.6;
              this.pendLen = 90;
            }
            api.score = this.cleared * 18;
            return;
          }

          // Pendulum swing
          const G = 9.5;
          this.angVel -= (G / this.pendLen) * Math.sin(this.angle) * dt * 40;
          this.angVel *= 0.9985;
          this.angle += this.angVel * dt * 2.2;
          this.angle = clamp(this.angle, -1.2, 1.2);

          // Tarzan position
          const v = this.vines[this.cur];
          this.px = v.x + Math.sin(this.angle) * this.pendLen;
          this.py = v.y + Math.cos(this.angle) * this.pendLen;

          // Tap to launch toward next vine
          const tapped = api.pointer.justDown || api.keyPressed('a') || api.keyPressed('up');
          if (tapped && !this._tapped) {
            this._tapped = true;
            const next = this.vines[this.cur + 1];
            if (this.angle > 0.22 && next) {
              // Good timing — launch!
              const spd = Math.abs(this.angVel) * this.pendLen * 1.1 + 80;
              const dir = Math.atan2(next.x - this.px, -(next.y - this.py));
              this.launchVx = Math.sin(dir) * spd;
              this.launchVy = -Math.cos(dir) * spd * 0.6;
              this.launched = true;
            } else {
              // Missed — lose grip
              this.hp--;
              api.shake(6, 0.25); api.audio.sfx('hurt');
              if (this.hp <= 0) { api.lose(); return; }
              // Swing back without penalty otherwise
            }
          }
          if (!tapped) this._tapped = false;
          api.score = this.cleared * 18;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a1a0a');
          // Sky layer
          c.fillStyle = '#0f2a12'; c.fillRect(0, 0, W, H * 0.68);
          // Ground
          g.rect(0, H - 28, W, 28, '#1a3010');
          // Background trees
          for (let i = 0; i < 7; i++) {
            g.rect(i * 40, 0, 16, H - 28, '#0e1e0a');
            g.circle(i * 40 + 8, 20 + (i % 3) * 16, 26, '#1a3a0e');
          }

          // Draw all vine ropes
          for (let i = 0; i < this.vines.length; i++) {
            const v = this.vines[i];
            const col = i <= this.cur ? '#4a8a28' : '#2a4a18';
            g.rect(v.x - 1, 0, 2, v.y + this.pendLen, col);
            g.circle(v.x, v.y, 4, i <= this.cur ? '#5dff8f' : '#2a4a18');
          }

          // Tarzan on vine or in flight
          const v = this.vines[this.cur];
          if (!this.launched) {
            // Draw vine connection
            c.strokeStyle = '#5dff8f'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(v.x, v.y); c.lineTo(this.px, this.py); c.stroke();
          }
          // Body
          g.circle(this.px, this.py - 9, 8, '#f0c0a0');
          g.rect(this.px - 4, this.py, 8, 11, '#8b5a2b');

          // Next-vine guide arrow (subtle)
          const next = this.vines[this.cur + 1];
          if (next && !this.launched) {
            c.globalAlpha = 0.3;
            c.strokeStyle = '#f0c040'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(this.px, this.py); c.lineTo(next.x, next.y + this.pendLen); c.stroke();
            c.globalAlpha = 1;
          }

          // Progress
          const pct = clamp(this.cleared / (this.vines.length - 1), 0, 1);
          g.rect(6, H - 13, W - 12, 6, '#1a2a10');
          g.rect(6, H - 13, (W - 12) * pct, 6, '#5dff8f');
          for (let i = 0; i < 3; i++) g.rect(W - 64 + i * 21, 5, 15, 12, i < this.hp ? '#5dff8f' : '#2a3a20');
          api.topBar('KING OF THE CANOPY');
          api.txt('VINE ' + this.cleared + '/' + (this.vines.length - 1), 6, 20, 9, '#5dff8f');
          api.vignette();
        },
      },

      /* ════════════════════════════════════════════════════════════════════
       * 3. KING OF THE APES — combat timing vs Kerchak
       * ════════════════════════════════════════════════════════════════════ */
      {
        id: 'kerchak',
        name: 'KING OF THE APES',
        sub: 'FACE KERCHAK',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 3, 8, '#2a1a0a');
          g.rect(x - 6, y + 4, 12, 8, '#1a1008');
        },
        intro: ['KERCHAK — KING OF APES —', 'BLOCKS THE WAY.', 'ONLY THE MIGHTIEST', 'may lead the tribe.'],
        quote: 'With the quickness of a striking snake, Tarzan leaped upon the great beast, burying his knife.',
        help: 'When Kerchak LUNGES — TAP to STRIKE. When he ROARS — TAP to DODGE.',
        winText: 'Kerchak falls. The tribe is silent. Tarzan raises his face to the moon and roars.',
        loseText: 'Kerchak hurls Tarzan aside. The great ape still rules the tribe.',
        init(api) {
          this.phase = 'watch'; this.phaseT = 1.4; this.acted = false;
          this.kerHP = 5; this.tarzHP = 3;
          this.kerX = api.W * 0.72; this.kerY = api.H * 0.46;
          this.tarzX = api.W * 0.24;
          this.msg = ''; this.msgT = 0; this.msgCol = '#5dff8f';
          this.roar = false;
          this.W = api.W; this.H = api.H;
        },
        update(api, dt) {
          this.phaseT -= dt;
          if (this.msgT > 0) this.msgT -= dt;

          if (this.phase === 'watch') {
            if (this.phaseT <= 0) {
              this.phase = api.chance(0.35) ? 'roar' : 'lunge';
              this.phaseT = 1.6; this.acted = false;
              this.roar = (this.phase === 'roar');
              api.audio.sfx('blip');
            }
            return;
          }

          const tapped = api.confirm();
          // Action window is second half of phase
          if (this.phaseT < 0.72 && !this.acted) {
            if (tapped) {
              this.acted = true;
              if (this.phase === 'lunge') {
                this.kerHP--;
                api.score += 30;
                api.burst(this.kerX, this.kerY - 10, '#5dff8f', 8);
                api.audio.sfx('coin'); api.shake(6, 0.3);
                this.msg = 'STRIKE!'; this.msgT = 0.7; this.msgCol = '#5dff8f';
                if (this.kerHP <= 0) { api.score += 120; api.win(); return; }
              } else {
                // dodge
                api.score += 15;
                this.msg = 'DODGE!'; this.msgT = 0.7; this.msgCol = '#f0c040';
                api.audio.sfx('coin');
              }
            }
          }

          if (this.phaseT <= 0) {
            if (!this.acted) {
              if (this.phase === 'lunge') {
                this.tarzHP--;
                api.shake(9, 0.4); api.flash('#ff2020', 0.22); api.audio.sfx('hurt');
                this.msg = 'HIT!'; this.msgT = 0.7; this.msgCol = '#ff4040';
              } else {
                if (api.chance(0.5)) {
                  this.tarzHP = Math.max(0, this.tarzHP - 1);
                  api.shake(4, 0.2); api.audio.sfx('hurt');
                  this.msg = 'STUNNED!'; this.msgT = 0.6; this.msgCol = '#ff8020';
                }
              }
              if (this.tarzHP <= 0) { api.lose(); return; }
            }
            this.acted = false; this.roar = false;
            this.phase = 'watch';
            this.phaseT = 0.85 + api.rnd(0, 0.5);
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0c1e08');
          // Arena floor
          g.rect(0, H * 0.64, W, H * 0.36, '#1a3010');
          g.rect(0, H * 0.64, W, 5, '#4a8a28');
          // Trees ring
          for (let i = 0; i < 5; i++) {
            const tx = i * 56 - 8;
            g.rect(tx + 18, 0, 12, H * 0.64, '#102008');
            g.circle(tx + 24, 24 + (i % 2) * 12, 28, '#1e4010');
          }

          // Kerchak
          const lunge = this.phase === 'lunge' && this.phaseT < 1.0;
          const kox = lunge ? -28 * (1 - this.phaseT / 1.0) : 0;
          const kx = this.kerX + kox;
          const ky = this.kerY;
          // body
          g.circle(kx, ky - 18, 22, '#1e1208');
          g.rect(kx - 18, ky + 4, 36, 26, '#140e04');
          g.rect(kx - 24, ky - 8, 14, 8, '#140e04'); // left arm
          g.rect(kx + 10, ky - 8, 14, 8, '#140e04'); // right arm
          // eyes
          g.rect(kx - 8, ky - 24, 5, 4, this.roar ? '#ff1010' : '#ff8020');
          g.rect(kx + 3, ky - 24, 5, 4, this.roar ? '#ff1010' : '#ff8020');
          if (this.roar) {
            g.rect(kx - 7, ky - 10, 14, 8, '#8b0000');
            api.txtC('ROAR!', kx, ky - 42, 8, '#ff4040');
          }
          if (lunge && this.phaseT < 1.0) {
            api.txtC('LUNGE!', kx - 20, ky - 42, 8, '#f0c040');
          }
          // Kerchak HP pips
          for (let i = 0; i < 5; i++) g.rect(8 + i * 18, H * 0.68, 13, 9, i < this.kerHP ? '#ff4040' : '#2a1010');

          // Tarzan
          const tx = this.tarzX, ty = this.kerY;
          g.circle(tx, ty - 18, 12, '#f0c0a0');
          g.rect(tx - 8, ty - 4, 16, 18, '#8b5a2b');
          g.rect(tx + 6, ty - 10, 3, 7, '#c8a060'); // knife hand
          g.rect(tx + 8, ty - 14, 8, 2, '#c0c0c0'); // knife blade
          // Tarzan HP
          for (let i = 0; i < 3; i++) g.rect(W - 64 + i * 20, H * 0.68, 14, 9, i < this.tarzHP ? '#5dff8f' : '#1a2a18');

          // Prompt
          if (this.phase === 'lunge' && this.phaseT > 0.72) {
            api.txtC('LUNGE! — TAP TO STRIKE', W / 2, H * 0.8, 7, '#f0c040');
          } else if (this.phase === 'roar' && this.phaseT > 0.72) {
            api.txtC('ROAR! — TAP TO DODGE', W / 2, H * 0.8, 7, '#ff6a20');
          }
          if (this.msgT > 0) api.txtC(this.msg, W / 2, H * 0.36, 12, this.msgCol);

          api.topBar('KING OF THE APES');
          api.vignette();
        },
      },

      /* ════════════════════════════════════════════════════════════════════
       * 4. THE RESCUE — stealth grid, reach Jane past ape patrols
       * ════════════════════════════════════════════════════════════════════ */
      {
        id: 'rescue',
        name: 'THE RESCUE',
        sub: 'SAVE JANE',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 4, 5, '#f0c8a0');
          g.rect(x - 2, y + 1, 4, 6, '#ff88aa');
        },
        intro: ['TERKOZ THE ROGUE APE', 'HAS TAKEN JANE PORTER.', 'TARZAN FOLLOWS THE TRAIL', 'through the dark forest.'],
        quote: '"You are safe now," he said. She did not understand the words — but the tone she knew.',
        help: 'Move to reach Jane — dodge the ape sight-cones (orange beams)',
        winText: 'Jane is safe. She looks into his grey eyes and does not fear him.',
        loseText: 'The apes close in. Jane is carried deeper into the wild.',
        init(api) {
          this.W = api.W; this.H = api.H;
          this.px = 22; this.py = api.H * 0.46;
          this.janeX = api.W - 26; this.janeY = api.H * 0.46;
          this.guards = [
            { x: 95,  y: api.H * 0.26, vy: 58,  dir: 1 },
            { x: 175, y: api.H * 0.52, vy: -52, dir: -1 },
            { x: 120, y: api.H * 0.65, vy: 48,  dir: 1 },
          ];
          this.spotted = false; this.spotT = 0; this.alarm = false;
          this.flashT = 0;
        },
        update(api, dt) {
          // Move Tarzan (8-directional)
          const spd = 78;
          let mx = 0, my = 0;
          if (api.keyDown('left')  || (api.pointer.down && api.pointer.x < this.px - 14)) mx = -1;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > this.px + 14)) mx = 1;
          if (api.keyDown('up')    || (api.pointer.down && api.pointer.y < this.py - 14)) my = -1;
          if (api.keyDown('down')  || (api.pointer.down && api.pointer.y > this.py + 14)) my = 1;
          this.px = clamp(this.px + mx * spd * dt, 12, this.W - 12);
          this.py = clamp(this.py + my * spd * dt, 44, this.H - 40);

          // Guards patrol vertically
          let caught = false;
          for (const gd of this.guards) {
            gd.y += gd.vy * gd.dir * dt;
            if (gd.y < 44 || gd.y > this.H - 44) gd.dir *= -1;
            // Sight: horizontal beam to the right
            const dx = this.px - gd.x, dy = this.py - gd.y;
            if (dx > 0 && dx < 60 && Math.abs(dy) < 22) caught = true;
          }

          if (caught) {
            this.spotted = true; this.spotT = 0.55;
            this.flashT = 0.55;
          }
          if (this.spotT > 0) {
            this.spotT -= dt;
            if (this.spotT <= 0) {
              this.spotted = false;
              // If still too close, lose
              for (const gd of this.guards) {
                if (Math.hypot(this.px - gd.x, this.py - gd.y) < 48) { api.lose(); return; }
              }
            }
          }

          // Reach Jane
          if (Math.hypot(this.px - this.janeX, this.py - this.janeY) < 28) {
            api.score += 200;
            api.audio.sfx('win');
            api.burst(this.janeX, this.janeY, '#ff88aa', 12);
            api.win();
          }
          api.score = Math.floor(clamp((this.px - 22) / (this.W - 50), 0, 1) * 80);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#080e08');
          // Dark jungle strips
          for (let i = 0; i < 8; i++) {
            g.rect(i * 36, 0, 22, H, '#0a1408');
            g.circle(i * 36 + 11, 18 + (i % 3) * 12, 22, '#122210');
          }
          // Dim moonbeams
          c.globalAlpha = 0.06;
          c.fillStyle = '#c0e890';
          for (let i = 0; i < 3; i++) c.fillRect(40 + i * 90, 0, 18, H);
          c.globalAlpha = 1;

          // Guards with sight-cone beams
          for (const gd of this.guards) {
            c.globalAlpha = 0.22;
            c.fillStyle = '#ff8020';
            c.fillRect(gd.x, gd.y - 20, 60, 40);
            c.globalAlpha = 1;
            g.circle(gd.x, gd.y, 14, '#1e1208');
            g.rect(gd.x - 10, gd.y + 10, 20, 16, '#140e04');
            g.rect(gd.x - 6, gd.y - 8, 5, 3, '#ff8020');
            g.rect(gd.x + 1, gd.y - 8, 5, 3, '#ff8020');
          }

          // Jane (glowing pink)
          c.globalAlpha = 0.3; g.circle(this.janeX, this.janeY, 20, '#ff88aa'); c.globalAlpha = 1;
          g.circle(this.janeX, this.janeY - 8, 9, '#f0c8a0');
          g.rect(this.janeX - 5, this.janeY + 1, 10, 13, '#ff88aa');

          // Tarzan
          g.circle(this.px, this.py - 8, 8, '#f0c0a0');
          g.rect(this.px - 5, this.py, 10, 12, '#8b5a2b');
          if (this.spotted) api.txtC('!', this.px, this.py - 24, 14, '#ff4040');

          // Progress bar
          const pct = clamp((this.px - 22) / (this.W - 50), 0, 1);
          g.rect(6, H - 12, W - 12, 5, '#1a2010');
          g.rect(6, H - 12, (W - 12) * pct, 5, '#5dff8f');
          api.topBar('THE RESCUE');
          api.vignette();
        },
      },

      /* ════════════════════════════════════════════════════════════════════
       * 5. LORD OF THE JUNGLE — aim & throw spears at hunters
       * ════════════════════════════════════════════════════════════════════ */
      {
        id: 'lord',
        name: 'LORD OF THE JUNGLE',
        sub: 'DEFEND THE WILD',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 10, y - 1, 22, 2, '#c8c8c8');
          g.rect(x + 10, y - 4, 2, 5, '#f0c040');
        },
        intro: ['IVORY HUNTERS INVADE', 'TARZAN\'S JUNGLE.', 'HE IS ITS GUARDIAN.', 'None shall pass.'],
        quote: 'He was Tarzan, Lord of the Jungle — and this was his domain.',
        help: 'DRAG to aim — TAP to throw your spear at the hunters',
        winText: 'The last hunter flees screaming into the dark. The jungle belongs to Tarzan.',
        loseText: 'The hunters press deep into the trees. The jungle weeps.',
        init(api) {
          this.W = api.W; this.H = api.H;
          this.hunters = []; this.spears = [];
          this.spawnTimer = 1.6;
          this.killed = 0; this.need = 10;
          this.missed = 0; this.maxMiss = 4;
          this.elapsed = 0;
          this.aimX = api.W / 2; this.aimY = api.H / 3;
        },
        update(api, dt) {
          this.elapsed += dt;
          this.spawnTimer -= dt;

          if (this.spawnTimer <= 0) {
            const spd = 32 + this.killed * 3.5;
            this.hunters.push({
              x: this.W + 22,
              y: api.rnd(56, this.H - 52),
              vx: -(spd + api.rnd(-8, 8)),
            });
            this.spawnTimer = Math.max(0.48, 1.6 - this.elapsed * 0.038);
          }

          // Aim follows pointer drag
          if (api.pointer.down) {
            this.aimX = api.pointer.x;
            this.aimY = api.pointer.y;
          }
          if (api.pointer.justDown) {
            this.spears.push({
              x: 26, y: this.H / 2 - 10,
              tx: this.aimX, ty: this.aimY,
              spd: 370,
            });
            api.audio.sfx('shoot');
          }

          // Move hunters
          for (const h of this.hunters) {
            h.x += h.vx * dt;
            if (h.x < -22) {
              h.dead = true;
              this.missed++;
              api.shake(4, 0.18); api.audio.sfx('hurt');
              if (this.missed >= this.maxMiss) { api.lose(); return; }
            }
          }

          // Move spears
          for (const s of this.spears) {
            const dx = s.tx - s.x, dy = s.ty - s.y;
            const len = Math.hypot(dx, dy) || 1;
            s.x += (dx / len) * s.spd * dt;
            s.y += (dy / len) * s.spd * dt;
            for (const h of this.hunters) {
              if (!h.dead && Math.hypot(s.x - h.x, s.y - h.y) < 18) {
                h.dead = true; s.dead = true;
                this.killed++;
                api.score += 20;
                api.burst(h.x, h.y, '#f0c040', 8); api.audio.sfx('coin');
                if (this.killed >= this.need) { api.score += 100; api.win(); return; }
              }
            }
            if (s.x < -20 || s.x > this.W + 20 || s.y < -20 || s.y > this.H + 20) s.dead = true;
          }

          this.hunters = this.hunters.filter(h => !h.dead);
          this.spears  = this.spears.filter(s => !s.dead);
          api.score = this.killed * 20;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a1a08');
          // Canopy background
          c.fillStyle = '#0d2008'; c.fillRect(0, 0, W, H * 0.68);
          for (let i = 0; i < 6; i++) {
            g.rect(i * 48, 0, 14, H * 0.68, '#102008');
            g.circle(i * 48 + 7, 18 + (i % 3) * 10, 28, '#1e4010');
          }
          g.rect(0, H * 0.68, W, H * 0.32, '#1a3010');
          g.rect(0, H * 0.68, W, 5, '#4a8a28');

          // Tarzan in tree (left)
          const ty = H * 0.48;
          g.rect(14, ty - 18, 3, 28, '#5a3a1a');
          g.circle(22, ty - 18, 9, '#f0c0a0');
          g.rect(14, ty - 4, 14, 14, '#8b5a2b');
          // Spear in hand
          g.rect(26, ty - 10, 16, 2, '#c8c820');

          // Aim crosshair
          c.strokeStyle = 'rgba(240,192,64,0.55)';
          c.lineWidth = 1;
          c.beginPath(); c.moveTo(this.aimX - 13, this.aimY); c.lineTo(this.aimX + 13, this.aimY); c.stroke();
          c.beginPath(); c.moveTo(this.aimX, this.aimY - 13); c.lineTo(this.aimX, this.aimY + 13); c.stroke();
          g.circle(this.aimX, this.aimY, 5, 'rgba(240,192,64,0.35)');

          // Spears
          for (const s of this.spears) {
            c.strokeStyle = '#c8c820'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(s.x - 7, s.y); c.lineTo(s.x + 7, s.y); c.stroke();
            g.rect(s.x + 6, s.y - 3, 2, 5, '#f0c040');
          }

          // Hunters
          for (const h of this.hunters) {
            g.rect(h.x - 8, h.y - 14, 16, 24, '#c8a060');
            g.circle(h.x, h.y - 18, 8, '#f0c0a0');
            g.rect(h.x + 6, h.y - 8, 14, 3, '#c0c0c0'); // rifle
          }

          api.topBar('LORD OF THE JUNGLE');
          api.txt('DRIVEN OFF ' + this.killed + '/' + this.need, 6, 20, 9, '#5dff8f');
          for (let i = 0; i < this.maxMiss; i++) {
            g.rect(W - 82 + i * 20, 5, 14, 12, i < this.missed ? '#ff4040' : '#2a4020');
          }
          api.vignette();
        },
      },
    ],
  });
})();
