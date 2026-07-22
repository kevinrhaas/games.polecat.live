/* ============================================================================
 * THE HEADLESS HORSEMAN — A TALE IN FOUR CHAPTERS
 *   1. ARRIVAL      — memory: watch the village's ward-signs, tap them back
 *   2. THE SCHOOLROOM — timing: match the pupils' raised slates before time runs out
 *   3. COURTING KATRINA — social-sim: charm her at the feast without alarming Brom
 *   4. THE HOLLOW CHASE — stealth-horror: hide from the Horseman's gaze, sprint
 *      the open ground, then dodge his thrown pumpkins to the covered bridge
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  // Pumpkin lantern emblem for the title / finale
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // pumpkin body
    g.rect(cx - 18, cy - 14, 36, 28, '#cc4400');
    g.rect(cx - 14, cy - 18, 28, 36, '#cc4400');
    g.rect(cx - 20, cy - 8, 40, 16, '#cc4400');
    // ribs
    g.rect(cx - 1, cy - 18, 2, 36, '#aa3300');
    g.rect(cx - 8, cy - 16, 2, 32, '#aa3300');
    g.rect(cx + 6, cy - 16, 2, 32, '#aa3300');
    // stem
    g.rect(cx - 2, cy - 24, 4, 8, '#3a5a10');
    g.rect(cx, cy - 28, 2, 6, '#3a5a10');
    // glowing face
    g.rect(cx - 10, cy - 8, 6, 6, '#ff9900');
    g.rect(cx + 4, cy - 8, 6, 6, '#ff9900');
    g.rect(cx - 8, cy + 2, 4, 2, '#ff9900');
    g.rect(cx - 2, cy + 2, 4, 2, '#ff9900');
    g.rect(cx + 4, cy + 2, 4, 2, '#ff9900');
    g.rect(cx - 2, cy + 6, 4, 2, '#ff9900');
    // glow
    c.globalAlpha = 0.18;
    g.circle(cx, cy, 32, '#ff8800');
    c.globalAlpha = 1;
  }

  // Dark autumnal backdrop: night sky, bare trees, Sleepy Hollow village
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // night sky gradient
    const sky = c.createLinearGradient(0, 0, 0, H * 0.7);
    sky.addColorStop(0, '#050208');
    sky.addColorStop(0.5, '#120800');
    sky.addColorStop(1, '#1a0e00');
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);

    // stars
    for (let i = 0; i < 48; i++) {
      const sx = (i * 67 + 13) % W;
      const sy = (i * 43 + 5) % Math.floor(H * 0.55);
      c.globalAlpha = 0.3 + 0.4 * Math.sin(t * 1.5 + i * 0.7);
      g.rect(sx, sy, 1, 1, '#ffd8a0');
    }
    c.globalAlpha = 1;

    // moon (large, harvest orange)
    const moonX = W - 52, moonY = 52;
    c.globalAlpha = 0.9;
    g.circle(moonX, moonY, 26, '#ff9922');
    c.globalAlpha = 0.5;
    g.circle(moonX, moonY, 30, '#ff8800');
    c.globalAlpha = 1;
    g.circle(moonX, moonY, 24, '#ffcc44');
    // moon face scratch
    c.globalAlpha = 0.18;
    g.circle(moonX - 6, moonY - 4, 7, '#cc6600');
    g.circle(moonX + 8, moonY + 6, 5, '#cc6600');
    c.globalAlpha = 1;

    // ground
    c.fillStyle = '#1a0c00';
    c.fillRect(0, H - 72, W, 72);
    c.fillStyle = '#0e0700';
    c.fillRect(0, H - 38, W, 38);

    // road
    c.fillStyle = '#180e04';
    for (let i = 0; i < W; i += 28) {
      c.fillRect(i, H - 60, 14, 22);
    }

    // bare trees
    function tree(tx, ty, h) {
      g.rect(tx - 2, ty - h, 4, h, '#1a0e00');
      // branches
      for (let b = 0; b < 4; b++) {
        const by = ty - h * (0.4 + b * 0.18);
        const bw = (4 - b) * 14 + 6;
        const len = (4 - b) * 6 + 4;
        g.rect(tx - bw / 2, by, 2, len, '#120a00');
        g.rect(tx + bw / 2 - 2, by, 2, len, '#120a00');
      }
    }
    tree(22, H - 60, 55);
    tree(58, H - 60, 45);
    tree(W - 30, H - 60, 60);
    tree(W - 65, H - 60, 42);
    tree(W / 2 - 70, H - 60, 50);
    tree(W / 2 + 60, H - 60, 48);

    // flying bats (animated)
    for (let i = 0; i < 4; i++) {
      const bx = ((t * (22 + i * 11) + i * 80) % (W + 60)) - 30;
      const by = 70 + Math.sin(t * 2.5 + i) * 14 + i * 18;
      const flap = Math.sin(t * 14 + i) > 0;
      if (flap) {
        g.rect(bx - 7, by, 6, 3, '#0a0408');
        g.rect(bx + 1, by, 6, 3, '#0a0408');
        g.rect(bx - 2, by - 2, 4, 4, '#150a10');
      } else {
        g.rect(bx - 7, by - 3, 6, 3, '#0a0408');
        g.rect(bx + 1, by - 3, 6, 3, '#0a0408');
        g.rect(bx - 2, by - 2, 4, 4, '#150a10');
      }
    }

    // church silhouette
    g.rect(W / 2 - 22, H - 78, 44, 28, '#100800');
    g.rect(W / 2 - 6, H - 94, 12, 18, '#100800');
    g.rect(W / 2 - 1, H - 100, 2, 8, '#100800');

    // overlay for story screens
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(5,2,0,.65)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // pumpkin patch / village map — non-list layout drawn in menu.card
      c.fillStyle = 'rgba(4,1,0,.45)';
      c.fillRect(0, 0, W, H);
      // winding dirt road hint
      c.strokeStyle = 'rgba(120,60,0,.3)';
      c.lineWidth = 14;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(30, 120);
      c.bezierCurveTo(150, 150, 90, 260, 180, 300);
      c.bezierCurveTo(230, 330, 120, 400, 150, 440);
      c.stroke();
      c.lineWidth = 1;
    }
  }

  // A single ward-sign glyph (cross / horseshoe / eye / candle), used by the
  // Arrival chapter's memory board.
  function drawWard(api, type, x, y, sz, color) {
    const g = api.gfx, c = api.ctx;
    c.save();
    c.translate(x, y);
    c.scale(sz / 16, sz / 16);
    if (type === 'cross') {
      g.rect(-2, -10, 4, 20, color);
      g.rect(-8, -3, 16, 4, color);
    } else if (type === 'shoe') {
      c.strokeStyle = color; c.lineWidth = 3.5; c.lineCap = 'round';
      c.beginPath(); c.arc(0, -2, 9, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
      g.rect(-11, -4, 3, 6, color);
      g.rect(8, -4, 3, 6, color);
      c.lineWidth = 1;
    } else if (type === 'eye') {
      c.strokeStyle = color; c.lineWidth = 2;
      c.beginPath(); c.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2); c.stroke();
      g.circle(0, 0, 4, color);
      c.lineWidth = 1;
    } else { // candle
      g.rect(-3, -4, 6, 14, color);
      g.rect(-1, -12, 2, 6, '#3a5a10');
      c.globalAlpha = 0.5; g.circle(0, -11, 5, '#ffcc44'); c.globalAlpha = 1;
      g.circle(0, -11, 2.5, '#ffee88');
    }
    c.restore();
  }

  RetroSaga.create({
    id: 'sleepyhollow',
    title: 'The Headless Horseman',
    subtitle: 'A TALE OF FOUR DARK HOURS',
    currency: 'NERVE',

    screens: {
      win:          '#ff8800',
      lose:         '#6a2000',
      chapterLabel: '#8a5a20',
      name:         '#ffd080',
      sub:          '#cc6600',
      intro:        '#d8a060',
      quote:        '#8a6030',
      help:         '#ff8800',
      score:        '#ffd080',
      cur:          '#ff8800',
      cta:          '#ffd080',
      overlay:      'rgba(8,3,0,.85)',
    },
    labels: {
      chapter:  'CHAPTER',
      score:    'NERVE HELD',
      win:      'THE NIGHT IS SURVIVED',
      lose:     'THE HOLLOW CLAIMS YOU',
      cont:     'TAP TO RIDE ON',
      finale:   'TAP TO FACE YOUR FATE',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO ENTER THE HOLLOW',
    },

    accent:    '#ff8800',
    credit:    'THE LEGEND OF SLEEPY HOLLOW · W. IRVING, 1820',
    bootCta:   'TAP TO ENTER THE HOLLOW',
    bootLine:  'FOUR CHAPTERS · ONE DARK NIGHT',
    menuLabel: 'THE HOLLOW\'S PATH',
    menuHint:  'CHOOSE YOUR NEXT CHAPTER',
    menuDone:  'YOU OUTRAN THE HORSEMAN',
    emblem,
    scenery,

    finale: [
      'THE PUMPKIN FLIES —',
      'AND ICHABOD IS GONE.',
      '',
      'ONLY HIS HORSE REMAINS,',
      'AND A SHATTERED PUMPKIN',
      'BY THE BRIDGE.',
    ],

    // Menu: 4 glowing jack-o-lanterns on a winding path through the dark hollow
    menu: {
      colors: { title: '#ff8800', label: '#8a5a20', cur: '#ffd080' },

      layout(api) {
        return [
          { x: 18,  y: 108, w: 110, h: 82 },  // top-left: arrival
          { x: 142, y: 188, w: 110, h: 82 },  // right: schoolroom
          { x: 18,  y: 288, w: 110, h: 82 },  // left: courting
          { x: 142, y: 372, w: 110, h: 82 },  // bottom-right: the chase
        ];
      },

      title(api, score) {
        const g = api.gfx, c = api.ctx, W = api.W;
        // parchment header
        c.fillStyle = '#2a1200';
        c.fillRect(10, 18, W - 20, 74);
        c.strokeStyle = '#7a4000';
        c.lineWidth = 1;
        c.strokeRect(10, 18, W - 20, 74);
        g.rect(10, 20, W - 20, 2, '#4a2000');
        g.rect(10, 88, W - 20, 2, '#4a2000');
        api.txtC('THE HOLLOW\'S PATH', W / 2, 30, 9, '#ff8800', true);
        api.txtC('NERVE  ' + score, W / 2, 56, 9, '#ffd080', true);
        // lantern deco
        const lx = 26, ly = 44;
        g.rect(lx - 6, ly - 8, 12, 16, '#cc4400');
        g.rect(lx - 4, ly - 4, 8, 8, '#ff9900');
        g.rect(lx - 1, ly - 10, 2, 4, '#3a5a10');
        const rx = W - 26, ry = 44;
        g.rect(rx - 6, ry - 8, 12, 16, '#cc4400');
        g.rect(rx - 4, ry - 4, 8, 8, '#ff9900');
        g.rect(rx - 1, ry - 10, 2, 4, '#3a5a10');
      },

      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;

        // card background: dark wood plank with orange lantern-glow border
        c.fillStyle = sel ? '#2a1400' : '#1a0c00';
        c.fillRect(x, y, w, h);
        c.strokeStyle = sel ? '#ff8800' : '#5a3000';
        c.lineWidth = sel ? 2 : 1;
        c.strokeRect(x, y, w, h);

        // pumpkin lantern icon (small) top-center
        const px = x + w / 2, py = y + 20;
        const pc = done ? '#ff6600' : (sel ? '#cc4400' : '#7a3000');
        g.rect(px - 7, py - 7, 14, 11, pc);
        g.rect(px - 5, py - 9, 10, 14, pc);
        g.rect(px - 8, py - 3, 16, 7, pc);
        g.rect(px - 1, py - 11, 2, 4, '#3a5a10');
        // pumpkin face glow
        const gc = done ? '#ff9900' : (sel ? '#ff7700' : '#4a2000');
        g.rect(px - 4, py - 5, 2, 2, gc);
        g.rect(px + 2, py - 5, 2, 2, gc);
        g.rect(px - 3, py, 2, 2, gc);
        g.rect(px + 1, py, 2, 2, gc);
        if (done) {
          c.globalAlpha = 0.22;
          g.circle(px, py, 16, '#ff8800');
          c.globalAlpha = 1;
        }

        // chapter name + sub
        api.txtCFit((i + 1) + '. ' + ch.name, x + w / 2, y + h - 34, 7,
          done ? '#ff8800' : (sel ? '#ffd080' : '#c07030'), false, w - 6);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2, y + h - 20, 6,
          done ? '#cc5500' : '#7a4a20', false, w - 6);
      },
    },

    width: 270, height: 480, parent: '#game',
    palette: { gold: '#ff9922', blood: '#cc2200' },

    chapters: [
      /* =================== 1. ARRIVAL — THE WARY WELCOME ================ */
      {
        id: 'arrival', name: 'ARRIVAL', sub: 'THE WARY WELCOME',
        icon(api, x, y) { drawWard(api, 'eye', x, y, 14, '#ff9900'); },
        intro: [
          'ICHABOD CRANE RIDES INTO',
          'SLEEPY HOLLOW AT DUSK.',
          'THE OLD WIVES SHOW HIM THE',
          'WARD-SIGNS THAT KEEP THE',
          'HORSEMAN AT BAY.',
          'Watch each sign, then repeat it.',
        ],
        quote: 'A drowsy, dreamy influence seems to hang over the land, and to pervade the very atmosphere.',
        help: 'WATCH the ward-signs light up, then TAP them back in the same order',
        winText: 'Every ward learned by heart. Ichabod rides on toward the Van Tassel farmstead.',
        loseText: 'His nerve fails him mid-sign. The old wives shake their heads — he wasn\'t listening.',
        init(api) {
          this.types = ['cross', 'shoe', 'eye', 'candle'];
          this.colors = ['#ffd080', '#e8c890', '#ff9900', '#ffcc44'];
          this.pos = [
            { x: api.W / 2 - 46, y: api.H / 2 - 46 },
            { x: api.W / 2 + 46, y: api.H / 2 - 46 },
            { x: api.W / 2 - 46, y: api.H / 2 + 46 },
            { x: api.W / 2 + 46, y: api.H / 2 + 46 },
          ];
          this.round = 0;
          this.need = 5;
          this.seq = [];
          this.showIdx = 0;
          this.showT = 0.55;
          this.inputIdx = 0;
          this.phase = 'show'; // show | pause | input
          this.pauseT = 0;
          this.lit = -1;
          this.feedback = -1;   // index flashed correct(green)/wrong(red)
          this.feedbackOk = true;
          this.feedbackT = 0;
          this.lives = 3;
          this.newRound(api);
        },
        newRound(api) {
          const len = 2 + this.round;
          this.seq = [];
          for (let i = 0; i < len; i++) this.seq.push(api.rint(0, 3));
          this.showIdx = 0;
          this.showT = 0.15;
          this.inputIdx = 0;
          this.phase = 'pause';
          this.pauseT = 0.5;
          this.lit = -1;
        },
        update(api, dt) {
          this.feedbackT = Math.max(0, this.feedbackT - dt);
          if (this.feedbackT <= 0) this.feedback = -1;

          if (this.phase === 'pause') {
            this.pauseT -= dt;
            if (this.pauseT <= 0) { this.phase = 'show'; this.showT = 0.15; this.lit = -1; }
            return;
          }
          if (this.phase === 'show') {
            this.showT -= dt;
            if (this.showT <= 0) {
              if (this.lit === this.showIdx) {
                // finished showing this one — brief gap then next
                this.lit = -1;
                this.showIdx++;
                this.showT = 0.22;
                if (this.showIdx >= this.seq.length) { this.phase = 'input'; this.inputIdx = 0; }
              } else {
                this.lit = this.showIdx;
                this.showT = 0.5;
                api.audio.sfx('blip');
              }
            }
            return;
          }
          // input phase
          if (api.pointer.justDown) {
            for (let i = 0; i < 4; i++) {
              const p = this.pos[i];
              if (Math.hypot(api.pointer.x - p.x, api.pointer.y - p.y) < 30) {
                const want = this.seq[this.inputIdx];
                if (i === want) {
                  this.feedback = i; this.feedbackOk = true; this.feedbackT = 0.3;
                  api.audio.sfx('coin');
                  api.burst(p.x, p.y, '#ff9900', 6);
                  this.inputIdx++;
                  if (this.inputIdx >= this.seq.length) {
                    this.round++;
                    api.score += 20 + this.seq.length * 4;
                    if (this.round >= this.need) { api.win(); return; }
                    this.newRound(api);
                  }
                } else {
                  this.feedback = i; this.feedbackOk = false; this.feedbackT = 0.4;
                  api.audio.sfx('hurt');
                  api.shake(4, 0.25);
                  this.lives--;
                  if (this.lives <= 0) { api.lose(); return; }
                  this.newRound(api);
                }
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#140a02');
          // parchment board
          g.rect(24, 78, W - 48, H - 190, '#1e1002');
          g.rectO(24, 78, W - 48, H - 190, '#5a3400', 1);
          api.txtC('THE OLD WIVES\' WARDS', W / 2, 92, 8, '#c89050', true);

          // 4 ward slots
          for (let i = 0; i < 4; i++) {
            const p = this.pos[i];
            const isLit = this.phase === 'show' && this.lit === i;
            const isFb = this.feedback === i;
            const ring = isFb ? (this.feedbackOk ? '#33ff66' : '#ff3322') : (isLit ? '#ffee88' : '#5a3a18');
            c.strokeStyle = ring; c.lineWidth = isLit || isFb ? 3 : 1.5;
            c.beginPath(); c.arc(p.x, p.y, 34, 0, Math.PI * 2); c.stroke();
            c.lineWidth = 1;
            if (isLit || isFb) { c.globalAlpha = 0.18; g.circle(p.x, p.y, 30, ring); c.globalAlpha = 1; }
            drawWard(api, this.types[i], p.x, p.y, 20, isLit ? '#fff3d0' : this.colors[i]);
          }

          // sequence progress dots
          const dotW = this.seq.length * 14;
          const dx0 = W / 2 - dotW / 2;
          for (let i = 0; i < this.seq.length; i++) {
            const done = this.phase === 'input' ? i < this.inputIdx : (this.phase !== 'pause' && i < this.showIdx);
            g.circle(dx0 + i * 14 + 6, H - 92, 4, done ? '#ff9900' : '#3a2408');
          }

          api.topBar('ARRIVAL');
          api.txt('WARD ' + (this.round + 1) + '/' + this.need, 6, 20, 8, '#ff9900', false, true);
          for (let i = 0; i < 3; i++) {
            const hx = W - 12 - i * 16, hy = 18;
            g.rect(hx - 4, hy - 3, 8, 7, i < this.lives ? '#cc4400' : '#2a1400');
          }
          if (this.phase === 'input') api.txtC('YOUR TURN', W / 2, H - 70, 8, '#ffd080');
          else if (this.phase === 'show') api.txtC('WATCH...', W / 2, H - 70, 8, '#8a5a20');
          api.vignette();
        },
      },

      /* =================== 2. THE SCHOOLROOM ========================== */
      {
        id: 'schoolroom', name: 'THE SCHOOLROOM', sub: 'KNOWLEDGE IS POWER',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 5, 12, 10, '#ece8c8');
          g.rect(x - 5, y - 4, 10, 8, '#c8c490');
          g.rect(x - 2, y - 7, 4, 3, '#3a2a10');
        },
        intro: [
          'ICHABOD TEACHES AT THE',
          'LITTLE SCHOOLHOUSE.',
          'MATCH EACH PUPIL\'S SLATE',
          'before the candle burns low.',
        ],
        quote: 'He was the ruling man of his little kingdom, and all the rustics regarded him with awe.',
        help: 'TAP the correct answer on each pupil\'s slate · match before time runs out',
        winText: '"Excellent!" Every sum matched. The pupils cheer; Ichabod beams.',
        loseText: 'The candle gutters out. Too many wrong answers — dismissed!',
        init(api) {
          this.correct = 0;
          this.need = 10;
          this.timer = 30;
          this.pupils = [];
          this.active = null;
          this.nextPupil = 0.6;
          this.wrong = 0;
          this.answers = [];    // answer buttons [x,y,w,h,val,correct]
          this.showAns = 0;     // how long to show feedback
          this.feedback = null; // {x,y,ok}
        },
        update(api, dt) {
          this.timer -= dt;
          if (this.timer <= 0) { api.lose(); return; }

          this.showAns = Math.max(0, this.showAns - dt);

          // generate a new question if none active
          if (!this.active && this.showAns <= 0) {
            this.nextPupil -= dt;
            if (this.nextPupil <= 0) {
              const a = api.rint(1, 9), b = api.rint(1, 9);
              const rightAns = a + b;
              const wrongs = [];
              while (wrongs.length < 2) {
                const w = rightAns + api.rint(-4, 4);
                if (w !== rightAns && w > 0 && !wrongs.includes(w)) wrongs.push(w);
              }
              // shuffle
              const opts = [rightAns, wrongs[0], wrongs[1]];
              for (let i = opts.length - 1; i > 0; i--) {
                const j = api.rint(0, i);
                [opts[i], opts[j]] = [opts[j], opts[i]];
              }
              const pupilX = api.rnd(40, api.W - 40);
              const pupilY = api.rnd(90, api.H - 170);
              this.active = { a, b, rightAns, pupilX, pupilY };
              // answer buttons at bottom
              const bw = 60, bh = 36, gap = 10;
              const totalW = 3 * bw + 2 * gap;
              const startX = (api.W - totalW) / 2;
              const by = api.H - 100;
              this.answers = opts.map((v, i) => ({
                x: startX + i * (bw + gap), y: by, w: bw, h: bh,
                val: v, correct: v === rightAns,
              }));
            }
          }

          // tap
          if (api.pointer.justDown && this.active && this.showAns <= 0) {
            for (const ans of this.answers) {
              if (api.pointer.x >= ans.x && api.pointer.x <= ans.x + ans.w &&
                  api.pointer.y >= ans.y && api.pointer.y <= ans.y + ans.h) {
                this.feedback = { x: this.active.pupilX, y: this.active.pupilY, ok: ans.correct };
                if (ans.correct) {
                  this.correct++;
                  api.score += 20;
                  api.audio.sfx('coin');
                  api.burst(this.active.pupilX, this.active.pupilY, '#ff9900', 8);
                  if (this.correct >= this.need) { api.score += Math.floor(this.timer * 5); api.win(); return; }
                } else {
                  this.wrong++;
                  api.audio.sfx('hurt');
                  api.shake(3, 0.2);
                  if (this.wrong >= 4) { api.lose(); return; }
                }
                this.active = null;
                this.answers = [];
                this.showAns = 0.5;
                this.nextPupil = 0.3;
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // schoolhouse interior — warm candlelight amber
          api.clear('#1a1000');
          // wooden floor
          for (let y = H - 80; y < H; y += 14) g.rect(0, y, W, 12, '#2a1a08');
          for (let x = 0; x < W; x += 20) g.rect(x, H - 80, 1, 80, '#1a1004');
          // blackboard
          g.rect(28, 46, W - 56, 72, '#1a2a1a');
          g.rectO(28, 46, W - 56, 72, '#4a3a18', 1);
          api.txtC('SLEEPY HOLLOW SCHOOL', W / 2, 52, 7, '#3a5a3a', true);
          // candle timer bar (burns down)
          const candleFrac = clamp(this.timer / 30, 0, 1);
          g.rect(28, 126, W - 56, 6, '#1a1408');
          g.rect(28, 126, Math.floor((W - 56) * candleFrac), 6, '#ff9900');
          g.rect(28, 128, Math.floor((W - 56) * candleFrac), 2, '#ffcc44');

          // active question on blackboard
          if (this.active) {
            api.txtC(this.active.a + ' + ' + this.active.b + ' = ?', W / 2, 72, 14, '#e8d8a0', true);
            // pupil figure
            const px = this.active.pupilX, py = this.active.pupilY;
            g.rect(px - 8, py - 14, 16, 10, '#8a6030');
            g.rect(px - 4, py - 22, 8, 8, '#c8a060');
            g.rect(px - 6, py - 8, 12, 14, '#7a5020');
            // raised hand
            g.rect(px + 6, py - 20, 3, 14, '#c8a060');
          }

          // feedback flash
          if (this.feedback && this.showAns > 0) {
            const fc = this.feedback.ok ? '#ff9900' : '#cc2200';
            api.txtC(this.feedback.ok ? '✓' : '✗', this.feedback.x, this.feedback.y - 30, 22, fc, true);
          }

          // answer buttons
          for (const ans of this.answers) {
            g.rect(ans.x, ans.y, ans.w, ans.h, '#2a1e08');
            g.rectO(ans.x, ans.y, ans.w, ans.h, '#7a5a20', 1);
            api.txtC(String(ans.val), ans.x + ans.w / 2, ans.y + 10, 14, '#ffd080', true);
          }

          // desk rows (decorative pupils)
          for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
              if (this.active && row === 0 && col === 1) continue; // skip active pupil spot
              const dx = 38 + col * 66, dy = H - 135 + row * 36;
              g.rect(dx - 10, dy, 20, 7, '#6a4a18');
              g.rect(dx - 4, dy - 8, 8, 7, '#c8a060');
            }
          }

          api.topBar('THE SCHOOLROOM');
          api.txt('CORRECT ' + this.correct + '/' + this.need, 6, 20, 8, '#ff9900', false, true);
          api.txt('MISS ' + this.wrong + '/4', W - 72, 20, 8, this.wrong > 2 ? '#cc2200' : '#7a5a20', false, true);
        },
      },

      /* =================== 3. COURTING KATRINA ========================= */
      {
        id: 'courting', name: 'COURTING KATRINA', sub: "WIN HER HEART",
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 5, y - 3, 4, 4, '#cc3366');
          g.rect(x + 1, y - 3, 4, 4, '#cc3366');
          g.rect(x - 6, y, 12, 3, '#cc3366');
          g.rect(x - 3, y + 3, 6, 3, '#cc3366');
        },
        intro: [
          'THE GRAND HARVEST PARTY',
          'AT VAN TASSEL\'S FARM.',
          'KATRINA HOLDS COURT —',
          'AND BROM BONES IS WATCHING.',
          'Choose your words with care.',
        ],
        quote: 'Not those of the bevy of buxom lasses... but the ample charms of a genuine Dutch country tea-table.',
        help: 'TAP a choice each round · win Katrina\'s CHARM before Brom\'s SUSPICION boils over',
        winText: 'Katrina\'s eyes linger on Ichabod. Brom scowls into his cider.',
        loseText: 'Brom looms over the schoolmaster. "Best watch yourself, Crane." Katrina looks away.',
        init(api) {
          this.charm = 0;
          this.needCharm = 65;
          this.suspicion = 0;
          this.maxSusp = 100;
          this.round = 0;
          this.encounters = [
            { title: 'THE FIDDLE STRIKES UP', a: { label: 'Ask her to dance', sub: '(warm, easy)', charm: 14, susp: 8 },
              b: { label: 'Cut in on Brom', sub: '(bold, risky)', charm: 24, susp: 26 } },
            { title: 'THE CIDER TABLE', a: { label: 'Offer her cider', sub: '(warm, easy)', charm: 12, susp: 6 },
              b: { label: 'Toast your salary', sub: '(bold, risky)', charm: 20, susp: 22 } },
            { title: 'A QUIET MOMENT', a: { label: 'Recite a gentle verse', sub: '(warm, easy)', charm: 16, susp: 10 },
              b: { label: 'Steal a lingering look', sub: '(bold, risky)', charm: 26, susp: 28 } },
            { title: 'THE GHOST STORIES BEGIN', a: { label: 'Laugh along politely', sub: '(warm, easy)', charm: 10, susp: 6 },
              b: { label: 'Spook her on purpose', sub: '(bold, risky)', charm: 22, susp: 20 } },
            { title: 'THE NIGHT GROWS LATE', a: { label: 'Offer to see her home', sub: '(warm, easy)', charm: 18, susp: 12 },
              b: { label: 'Ask her outright', sub: '(bold, risky)', charm: 28, susp: 24 } },
          ];
          this.active = this.encounters[0];
          this.feedback = null;
          this.feedbackT = 0;
        },
        choiceRects(api) {
          const W = api.W, H = api.H;
          return [
            { x: 20, y: H - 130, w: W - 40, h: 44 },
            { x: 20, y: H - 78, w: W - 40, h: 44 },
          ];
        },
        update(api, dt) {
          this.feedbackT = Math.max(0, this.feedbackT - dt);
          if (this.feedbackT > 0) return;
          if (!api.pointer.justDown) return;
          const rects = this.choiceRects(api);
          const opts = [this.active.a, this.active.b];
          for (let i = 0; i < 2; i++) {
            const r = rects[i];
            if (api.pointer.x >= r.x && api.pointer.x <= r.x + r.w &&
                api.pointer.y >= r.y && api.pointer.y <= r.y + r.h) {
              const pick = opts[i];
              this.charm = Math.min(100, this.charm + pick.charm);
              this.suspicion += pick.susp;
              api.score += pick.charm;
              api.audio.sfx(i === 0 ? 'coin' : 'select');
              api.burst(api.W / 2, api.H * 0.4, i === 0 ? '#ffd080' : '#ff6699', 8);
              this.feedback = pick.label;
              this.feedbackT = 0.9;
              this.round++;
              if (this.suspicion >= this.maxSusp) { api.shake(6, 0.3); api.lose(); return; }
              if (this.round >= this.encounters.length) {
                if (this.charm >= this.needCharm) api.win(); else api.lose();
                return;
              }
              this.active = this.encounters[this.round];
              break;
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // warm amber farmhouse interior
          api.clear('#1a0e00');
          g.rect(0, 0, W, H * 0.5, '#1e1200');
          // window with moonlight
          g.rect(W / 2 - 28, 20, 56, 40, '#0a0600');
          g.rect(W / 2 - 26, 22, 52, 36, '#ffcc44');
          c.globalAlpha = 0.35;
          g.rect(W / 2 - 26, 22, 52, 36, '#1a0e00');
          c.globalAlpha = 1;
          g.rect(W / 2 - 1, 22, 2, 36, '#3a2800');
          g.rect(W / 2 - 26, 40, 52, 2, '#3a2800');
          // floor
          for (let x = 0; x < W; x += 22) g.rect(x, H - 60, 20, 60, '#2a1a08');

          // Katrina + Brom silhouettes flanking the dance floor
          const kx = 60, bx = W - 60, py = H * 0.5 - 6;
          g.rect(kx - 8, py - 24, 16, 22, '#cc3366');
          g.rect(kx - 5, py - 34, 10, 10, '#e8c090');
          g.rect(bx - 9, py - 24, 18, 22, '#3a2a10');
          g.rect(bx - 6, py - 36, 12, 12, '#c8a060');
          const susFrac = clamp(this.suspicion / this.maxSusp, 0, 1);
          if (susFrac > 0.5 && Math.sin(api.t * 8) > 0) {
            c.globalAlpha = 0.4; g.circle(bx, py - 20, 20, '#ff2200'); c.globalAlpha = 1;
          }

          // encounter card
          const cardY = H * 0.5 + 40;
          g.rect(16, cardY, W - 32, 46, '#241606');
          g.rectO(16, cardY, W - 32, 46, '#6a4a18', 1);
          api.txtCFit(this.active ? this.active.title : '', W / 2, cardY + 8, 9, '#ffd080', true, W - 44);
          if (this.feedbackT > 0) api.txtCFit('"' + this.feedback + '"', W / 2, cardY + 26, 8, '#cc9955', false, W - 44);

          // choice buttons
          if (this.feedbackT <= 0 && this.active) {
            const rects = this.choiceRects(api);
            const opts = [this.active.a, this.active.b];
            for (let i = 0; i < 2; i++) {
              const r = rects[i], o = opts[i];
              g.rect(r.x, r.y, r.w, r.h, i === 0 ? '#241a08' : '#2a1010');
              g.rectO(r.x, r.y, r.w, r.h, i === 0 ? '#7a5a20' : '#8a3030', 1);
              api.txtCFit(o.label, r.x + r.w / 2, r.y + 8, 9, '#ffe8c0', false, r.w - 12);
              api.txtCFit(o.sub, r.x + r.w / 2, r.y + 26, 7, i === 0 ? '#7a9a5a' : '#cc6644', false, r.w - 12);
            }
          }

          // meters
          api.topBar('COURTING KATRINA');
          api.txt('CHARM', 6, 20, 7, '#ffd080', false, true);
          g.rect(50, 20, W - 96, 6, '#1a1000');
          g.rect(50, 20, Math.floor((W - 96) * clamp(this.charm / 100, 0, 1)), 6, '#ffd080');
          api.txt('SUSPICION', 6, 30, 7, '#ff6666', false, true);
          g.rect(70, 30, W - 116, 6, '#1a1000');
          g.rect(70, 30, Math.floor((W - 116) * susFrac), 6, susFrac > 0.7 ? '#ff2200' : '#aa3322');
        },
      },

      /* =================== 4. THE HOLLOW CHASE ========================== */
      {
        id: 'chase', name: 'THE HOLLOW CHASE', sub: 'HIDE OR RUN',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 6, 12, 10, '#1a0e00');
          g.rect(x - 8, y + 2, 16, 6, '#1a0e00');
          g.rect(x + 4, y - 10, 3, 8, '#1a0e00');
          g.circle(x + 8, y - 12, 4, '#cc4400');
        },
        intro: [
          'THE MIDNIGHT RIDE HOME.',
          'THUNDERING HOOFS ECHO —',
          'BUT HIS GAZE HASN\'T FOUND',
          'YOU YET. STAY IN SHADOW,',
          'sprint the open ground,',
          'and reach the covered bridge.',
        ],
        quote: 'Just then he heard a heavy stamping of hoofs, and a rushing of a monstrous dark figure.',
        help: 'STEER into the SHADOW lane when his gaze sweeps · dodge pumpkins near the bridge',
        winText: 'Ichabod leaps the bridge! The Horseman reins in — the deed is done.',
        loseText: 'The gaze finds him in the open. Something flies through the dark...',
        init(api) {
          this.x = api.W / 2;
          this.dist = 0;
          this.scroll = 0;
          this.speed = 1.5;
          this.lives = 3;
          this.hitCool = 0;
          this.lanes = [api.W * 0.24, api.W * 0.5, api.W * 0.76];
          this.litLane = 1;
          this.gazeState = 'wait'; // wait | warn | sweep
          this.gazeT = api.rnd(2.4, 3.2);
          this.pumpkins = [];
          this.spawnP = 1.6;
          this.phase = 'ride'; // ride -> bridge
          this.bridgeFlash = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.hitCool = Math.max(0, this.hitCool - dt);

          if (this.phase === 'bridge') {
            this.bridgeFlash += dt;
            if (this.bridgeFlash > 0.8) { api.score += 120; api.win(); }
            return;
          }

          this.speed = Math.min(2.6, this.speed + dt * 0.03);
          this.scroll += this.speed * f * 1.1;
          this.dist += dt * 0.032 * this.speed;
          if (this.dist >= 1) { this.phase = 'bridge'; api.audio.sfx('win'); return; }

          // steer
          const p = api.pointer;
          if (p.down) this.x += clamp(p.x - this.x, -8, 8) * f * 0.16;
          if (api.keyDown('left'))  this.x -= 3.4 * f;
          if (api.keyDown('right')) this.x += 3.4 * f;
          this.x = clamp(this.x, 22, api.W - 22);

          // which lane is Ichabod nearest?
          let myLane = 0, best = Infinity;
          for (let i = 0; i < 3; i++) { const d = Math.abs(this.x - this.lanes[i]); if (d < best) { best = d; myLane = i; } }

          // gaze cycle: wait -> warn (telegraph) -> sweep (danger instant)
          this.gazeT -= dt;
          if (this.gazeState === 'wait' && this.gazeT <= 0) {
            this.gazeState = 'warn'; this.gazeT = 0.9;
            let nl = api.rint(0, 2);
            if (nl === this.litLane) nl = (nl + 1) % 3;
            this.litLane = nl;
          } else if (this.gazeState === 'warn' && this.gazeT <= 0) {
            this.gazeState = 'sweep'; this.gazeT = 0.35;
            if (myLane === this.litLane && this.hitCool <= 0) {
              this.lives--; this.hitCool = 1.1;
              api.shake(6, 0.3); api.flash('#330000', 0.25); api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          } else if (this.gazeState === 'sweep' && this.gazeT <= 0) {
            this.gazeState = 'wait';
            this.gazeT = Math.max(1.3, api.rnd(2.6, 3.4) - this.dist * 1.4);
          }

          // near the bridge, the Horseman starts throwing pumpkins too
          if (this.dist > 0.55) {
            this.spawnP -= dt;
            if (this.spawnP <= 0) {
              this.spawnP = Math.max(0.5, 1.3 - this.dist * 0.7);
              const targetX = this.x + api.rnd(-30, 30);
              const vx = (targetX - api.W / 2) * 0.08;
              this.pumpkins.push({ x: api.W / 2 + api.rnd(-30, 30), y: api.H, vx, vy: -api.rnd(4.5, 7.0), rot: 0, rspd: api.rnd(-0.1, 0.1) });
            }
          }
          for (let i = this.pumpkins.length - 1; i >= 0; i--) {
            const pk = this.pumpkins[i];
            pk.x += pk.vx * f; pk.y += pk.vy * f; pk.vy += 0.22 * f; pk.rot += pk.rspd * f;
            if (pk.y < -20 || pk.y > api.H + 20) { this.pumpkins.splice(i, 1); continue; }
            if (this.hitCool <= 0 && pk.y < api.H - 60 && pk.y > api.H - 120 && Math.abs(pk.x - this.x) < 24) {
              this.lives--; this.hitCool = 0.9;
              api.shake(6, 0.3); api.flash('#440000', 0.2); api.audio.sfx('hurt');
              this.pumpkins.splice(i, 1);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          if (this.phase === 'bridge') {
            api.clear('#ff9900');
            c.globalAlpha = Math.max(0, 1 - this.bridgeFlash * 1.2);
            c.fillStyle = '#ff9900'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
            api.txtC('THE BRIDGE!', W / 2, H / 2 - 14, 18, '#fff8e0', true);
            return;
          }

          api.clear('#050208');
          const sky = c.createLinearGradient(0, 0, 0, H * 0.6);
          sky.addColorStop(0, '#020105'); sky.addColorStop(1, '#100600');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.6);
          c.globalAlpha = 0.6; g.circle(W / 2, 38, 20, '#ffcc44'); c.globalAlpha = 1;

          // forest walls
          for (let i = 0; i < 7; i++) {
            const tx = (i * 42 + this.scroll * 0.3) % (W + 20) - 10;
            g.rect(tx - 2, H - 110, 5, 70, '#0a0600');
            g.rect(tx - 10, H - 118, 20, 28, '#0a0600');
            const rx = W - tx - 5;
            g.rect(rx - 2, H - 110, 5, 70, '#0a0600');
            g.rect(rx - 10, H - 118, 20, 28, '#0a0600');
          }

          // road with 3 lanes; the LIT lane is exposed moonlight, the rest are shadow-safe
          g.rect(0, H - 72, W, 72, '#180c00');
          for (let i = 0; i < 3; i++) {
            const lx = this.lanes[i];
            const lit = i === this.litLane && this.gazeState !== 'wait';
            c.globalAlpha = lit ? (this.gazeState === 'sweep' ? 0.55 : 0.3) : 0.08;
            g.rect(lx - 26, H - 72, 52, 72, lit ? '#ffcc66' : '#3a2200');
            c.globalAlpha = 1;
          }
          g.rect(18, H - 72, 2, 72, '#3a2000');
          g.rect(W - 20, H - 72, 2, 72, '#3a2000');

          // the Horseman's gaze telegraph, looming center-back
          const hScale = this.gazeState === 'sweep' ? 1 : (this.gazeState === 'warn' ? 0.7 : 0.4);
          const hSize = 16 + hScale * 26;
          c.globalAlpha = 0.3 + hScale * 0.5;
          const hx = W / 2, hy = H - 60;
          g.rect(hx - hSize * 0.5, hy - hSize * 1.2, hSize, hSize, '#0a0400');
          g.rect(hx - hSize * 0.65, hy - hSize * 0.6, hSize * 1.3, hSize * 0.5, '#0a0400');
          g.rect(hx + hSize * 0.4, hy - hSize * 1.5, hSize * 0.18, hSize * 0.6, '#0a0400');
          g.circle(hx + hSize * 0.55, hy - hSize * 1.6, hSize * 0.25, '#cc4400');
          c.globalAlpha = 1;

          // pumpkins thrown near the bridge
          for (const pk of this.pumpkins) {
            c.save(); c.translate(pk.x, pk.y); c.rotate(pk.rot);
            g.rect(-7, -5, 14, 10, '#cc4400'); g.rect(-5, -8, 10, 14, '#cc4400'); g.rect(-8, -2, 16, 5, '#cc4400');
            g.rect(-1, -10, 2, 3, '#3a5a10');
            g.rect(-4, -3, 2, 2, '#ff9900'); g.rect(2, -3, 2, 2, '#ff9900'); g.rect(-2, 1, 4, 2, '#ff9900');
            c.restore();
          }

          // Ichabod on horse
          const iy = H - 80;
          const trot = Math.sin(api.t * 14) > 0;
          g.rect(this.x - 14, iy - 8, 28, 12, '#1a1000');
          g.rect(this.x - 18, iy - 4, 8, 8, '#1a1000');
          g.rect(this.x + 10, iy - 4, 8, 8, '#1a1000');
          g.rect(this.x - 10, iy + 4, 3, trot ? 12 : 8, '#1a1000');
          g.rect(this.x - 4,  iy + 4, 3, trot ? 8 : 12, '#1a1000');
          g.rect(this.x + 2,  iy + 4, 3, trot ? 12 : 8, '#1a1000');
          g.rect(this.x + 8,  iy + 4, 3, trot ? 8 : 12, '#1a1000');
          g.rect(this.x - 6, iy - 22, 12, 14, '#2a1800');
          g.rect(this.x - 4, iy - 30, 8, 8, '#3a2400');
          g.rect(this.x - 6, iy - 34, 12, 4, '#2a1800');
          if (this.hitCool > 0 && Math.sin(api.t * 20) > 0) {
            c.globalAlpha = 0.5; g.circle(this.x, iy - 14, 24, '#ff4400'); c.globalAlpha = 1;
          }

          api.topBar('THE HOLLOW CHASE');
          api.txt('DIST', 6, 20, 8, '#7a5020', false, true);
          g.rect(42, 22, W - 90, 6, '#1a1000');
          g.rect(42, 22, Math.floor((W - 90) * this.dist), 6, '#ff9900');
          for (let i = 0; i < 3; i++) g.rect(W - 14 - i * 14, 18, 10, 8, i < this.lives ? '#ff6600' : '#2a1400');

          if (this.gazeState === 'warn') {
            c.globalAlpha = 0.7 + 0.3 * Math.sin(api.t * 10);
            api.txtC('HE LOOKS...', W / 2, H - 30, 9, '#ffaa33', true);
            c.globalAlpha = 1;
          } else if (this.gazeState === 'sweep') {
            api.txtC('THE GAZE SWEEPS', W / 2, H - 30, 9, '#ff2200', true);
          }
          api.vignette();
        },
      },
    ], // end chapters
  }); // end RetroSaga.create
}());
