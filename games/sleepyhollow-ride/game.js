/* ============================================================================
 * THE HEADLESS HORSEMAN — A TALE IN FIVE CHAPTERS
 *   1. ARRIVAL         — dodge bats while collecting lanterns on a dark road
 *   2. THE SCHOOLROOM  — timing: match the pupils' raised slates before time runs out
 *   3. THE HARVEST FEAST — catch falling food, dodge Brom's pranks
 *   4. THE MIDNIGHT RIDE — lane-dodge horse chase, Horseman closes in
 *   5. THE BRIDGE      — precision: reach the covered bridge dodging pumpkins
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
      c.moveTo(30, 130);
      c.bezierCurveTo(140, 160, 80, 260, 170, 300);
      c.bezierCurveTo(230, 330, 130, 390, 135, 450);
      c.stroke();
      c.lineWidth = 1;
    }
  }

  RetroSaga.create({
    id: 'sleepyhollow',
    title: 'The Headless Horseman',
    subtitle: 'A TALE OF FIVE DARK NIGHTS',
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
      score:    'LANTERNS LIT',
      win:      'YOU CROSSED THE BRIDGE',
      lose:     'THE HOLLOW CLAIMS YOU',
      cont:     'TAP TO RIDE ON',
      finale:   'TAP TO FACE YOUR FATE',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO ENTER THE HOLLOW',
    },

    accent:    '#ff8800',
    credit:    'THE LEGEND OF SLEEPY HOLLOW · W. IRVING, 1820',
    bootCta:   'TAP TO ENTER THE HOLLOW',
    bootLine:  'FIVE CHAPTERS · ONE DARK NIGHT',
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

    // Menu: 5 glowing jack-o-lanterns on a winding path through the dark hollow
    menu: {
      colors: { title: '#ff8800', label: '#8a5a20', cur: '#ffd080' },

      // Winding path: lantern positions roughly S-curve top→bottom
      layout(api) {
        return [
          { x: 20,  y: 108, w: 88, h: 68 },  // top-left: arrival
          { x: 152, y: 162, w: 88, h: 68 },  // top-right: schoolroom
          { x: 20,  y: 248, w: 88, h: 68 },  // mid-left: feast
          { x: 152, y: 318, w: 88, h: 68 },  // lower-right: midnight ride
          { x: 68,  y: 390, w: 88, h: 68 },  // bottom-center: the bridge
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
        const px = x + w / 2, py = y + 18;
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
        api.txtCFit((i + 1) + '. ' + ch.name, x + w / 2, y + h - 32, 7,
          done ? '#ff8800' : (sel ? '#ffd080' : '#c07030'), false, w - 6);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2, y + h - 18, 6,
          done ? '#cc5500' : '#7a4a20', false, w - 6);
      },
    },

    width: 270, height: 480, parent: '#game',
    palette: { gold: '#ff9922', blood: '#cc2200' },

    chapters: [
      /* =================== 1. ARRIVAL IN SLEEPY HOLLOW ================== */
      {
        id: 'arrival', name: 'ARRIVAL', sub: 'THE HAUNTED HOLLOW',
        icon(api, x, y) {
          const g = api.gfx;
          // lantern icon
          g.rect(x - 4, y - 5, 8, 10, '#cc4400');
          g.rect(x - 3, y - 3, 6, 6, '#ff9900');
          g.rect(x - 1, y - 7, 2, 3, '#3a5a10');
        },
        intro: [
          'ICHABOD CRANE RIDES INTO',
          'SLEEPY HOLLOW AT DUSK.',
          'THE HOLLOW IS DARK.',
          'Collect the lanterns to find your way.',
        ],
        quote: 'A drowsy, dreamy influence seems to hang over the land, and to pervade the very atmosphere.',
        help: 'STEER left/right to collect lanterns · dodge swooping bats',
        winText: 'Every lantern found. Ichabod rides toward the Van Tassel farmstead, aglow.',
        loseText: 'The hollow swallows the last light. Ichabod is lost in the dark.',
        init(api) {
          this.x = api.W / 2;
          this.speed = 0;
          this.lanterns = [];
          this.bats = [];
          this.collected = 0;
          this.need = 12;
          this.spawnLantern = 0;
          this.spawnBat = 0;
          this.lives = 3;
          this.hitCool = 0;
          this.scroll = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.scroll += 2 * f;
          this.hitCool = Math.max(0, this.hitCool - dt);

          // steer
          const p = api.pointer;
          if (p.down) {
            const dx = p.x - this.x;
            this.x += clamp(dx, -6, 6) * f * 0.18;
          }
          if (api.keyDown('left'))  this.x -= 3 * f;
          if (api.keyDown('right')) this.x += 3 * f;
          this.x = clamp(this.x, 18, api.W - 18);

          // spawn lanterns
          this.spawnLantern -= dt;
          if (this.spawnLantern <= 0) {
            this.spawnLantern = api.rnd(0.5, 1.2);
            this.lanterns.push({ x: api.rnd(24, api.W - 24), y: -20, spd: api.rnd(1.2, 2.0) });
          }
          // spawn bats
          this.spawnBat -= dt;
          if (this.spawnBat <= 0) {
            this.spawnBat = api.rnd(1.0, 2.2);
            const side = Math.random() < 0.5 ? -1 : 1;
            this.bats.push({ x: side < 0 ? -20 : api.W + 20, y: api.rnd(80, api.H - 120),
              vx: side * api.rnd(1.4, 2.2), vy: api.rnd(-0.4, 0.4) });
          }

          // move lanterns
          for (const ln of this.lanterns) ln.y += ln.spd * f;
          // collect
          for (let i = this.lanterns.length - 1; i >= 0; i--) {
            const ln = this.lanterns[i];
            if (Math.hypot(this.x - ln.x, api.H - 80 - ln.y) < 22) {
              this.lanterns.splice(i, 1);
              this.collected++;
              api.score += 15;
              api.audio.sfx('coin');
              api.burst(ln.x, ln.y, '#ff9900', 8);
              if (this.collected >= this.need) { api.score += 80; api.win(); return; }
            } else if (ln.y > api.H + 10) {
              this.lanterns.splice(i, 1);
            }
          }

          // move bats
          for (const bt of this.bats) { bt.x += bt.vx * f; bt.y += bt.vy * f; }
          this.bats = this.bats.filter(bt => bt.x > -40 && bt.x < api.W + 40);
          // bat hit
          if (this.hitCool <= 0) {
            for (const bt of this.bats) {
              if (Math.hypot(this.x - bt.x, api.H - 80 - bt.y) < 20) {
                this.lives--;
                this.hitCool = 1.2;
                api.shake(5, 0.3);
                api.flash('#330000', 0.25);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // dark road
          api.clear('#0a0500');
          // sky gradient
          const sky = c.createLinearGradient(0, 0, 0, H * 0.6);
          sky.addColorStop(0, '#050208');
          sky.addColorStop(1, '#180b00');
          c.fillStyle = sky;
          c.fillRect(0, 0, W, H * 0.6);

          // moon
          g.circle(W - 44, 44, 20, '#ffcc44');

          // scrolling road markings
          for (let i = 0; i < 8; i++) {
            const ry = ((this.scroll * 0.6 + i * 50) % (H + 20)) - 10;
            g.rect(W / 2 - 2, ry, 4, 18, '#3a2800');
          }

          // ground
          g.rect(0, H - 60, W, 60, '#1a0e00');
          // road edges
          g.rect(20, H - 60, 2, 60, '#3a2800');
          g.rect(W - 22, H - 60, 2, 60, '#3a2800');

          // scrolling trees (parallax)
          for (let i = 0; i < 5; i++) {
            const tx = (i * 60 + (this.scroll * 0.4) % 300) % (W + 20) - 10;
            // left trees
            g.rect(tx - 40, H - 90, 4, 36, '#100800');
            g.rect(tx - 46, H - 96, 12, 20, '#100800');
            // right trees
            g.rect(W - tx + 36, H - 90, 4, 36, '#100800');
            g.rect(W - tx + 30, H - 96, 12, 20, '#100800');
          }

          // lanterns
          for (const ln of this.lanterns) {
            // glow
            c.globalAlpha = 0.22;
            g.circle(ln.x, ln.y, 14, '#ff8800');
            c.globalAlpha = 1;
            // pumpkin lantern small
            g.rect(ln.x - 6, ln.y - 5, 12, 10, '#cc4400');
            g.rect(ln.x - 4, ln.y - 7, 8, 13, '#cc4400');
            g.rect(ln.x - 7, ln.y - 2, 14, 5, '#cc4400');
            g.rect(ln.x - 1, ln.y - 9, 2, 3, '#3a5a10');
            g.rect(ln.x - 4, ln.y - 4, 2, 2, '#ff9900');
            g.rect(ln.x + 2, ln.y - 4, 2, 2, '#ff9900');
            g.rect(ln.x - 1, ln.y + 1, 2, 2, '#ff9900');
          }

          // bats
          for (const bt of this.bats) {
            const flap = Math.sin(api.t * 16 + bt.x * 0.1) > 0;
            if (flap) {
              g.rect(bt.x - 8, bt.y - 1, 6, 3, '#1a0a10');
              g.rect(bt.x + 2, bt.y - 1, 6, 3, '#1a0a10');
            } else {
              g.rect(bt.x - 8, bt.y - 4, 6, 3, '#1a0a10');
              g.rect(bt.x + 2, bt.y - 4, 6, 3, '#1a0a10');
            }
            g.rect(bt.x - 3, bt.y - 3, 6, 5, '#250a18');
          }

          // Ichabod (horse + rider silhouette)
          const iy = H - 80;
          // horse body
          g.rect(this.x - 14, iy - 8, 28, 12, '#1a0e00');
          g.rect(this.x - 18, iy - 4, 8, 8, '#1a0e00');
          g.rect(this.x + 10, iy - 4, 8, 8, '#1a0e00');
          // legs (animated trot)
          const trot = Math.sin(api.t * 14) > 0;
          g.rect(this.x - 10, iy + 4, 3, trot ? 12 : 8, '#1a0e00');
          g.rect(this.x - 4,  iy + 4, 3, trot ? 8 : 12, '#1a0e00');
          g.rect(this.x + 2,  iy + 4, 3, trot ? 12 : 8, '#1a0e00');
          g.rect(this.x + 8,  iy + 4, 3, trot ? 8 : 12, '#1a0e00');
          // rider torso
          g.rect(this.x - 6, iy - 22, 12, 14, '#2a1800');
          // rider head (with hat)
          g.rect(this.x - 4, iy - 30, 8, 8, '#3a2400');
          g.rect(this.x - 6, iy - 34, 12, 4, '#2a1800');
          // invincibility flash
          if (this.hitCool > 0 && Math.sin(api.t * 20) > 0) {
            c.globalAlpha = 0.5;
            g.circle(this.x, iy - 12, 22, '#ff4400');
            c.globalAlpha = 1;
          }

          api.topBar('ARRIVAL');
          api.txt('LANTERNS ' + this.collected + '/' + this.need, 6, 20, 8, '#ff9900', false, true);
          // lives as pumpkins
          for (let i = 0; i < 3; i++) {
            const hx = W - 12 - i * 16, hy = 18;
            g.rect(hx - 4, hy - 3, 8, 7, i < this.lives ? '#cc4400' : '#2a1400');
          }
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

      /* =================== 3. THE HARVEST FEAST ======================== */
      {
        id: 'feast', name: 'THE HARVEST FEAST', sub: "VAN TASSEL'S FARM",
        icon(api, x, y) {
          const g = api.gfx;
          // turkey leg icon
          g.rect(x - 5, y - 4, 10, 8, '#c87840');
          g.rect(x - 2, y - 8, 4, 6, '#8a5020');
          g.rect(x - 3, y + 4, 6, 4, '#8a5020');
        },
        intro: [
          'ICHABOD ARRIVES AT THE',
          'GRAND HARVEST PARTY.',
          'THE TABLE GROANS WITH FOOD.',
          'Catch the dishes — but watch out for Brom!',
        ],
        quote: 'Not those of the bevy of buxom lasses... but the ample charms of a genuine Dutch country tea-table.',
        help: 'MOVE to catch falling food · dodge Brom\'s pranks (skulls)',
        winText: 'Ichabod gorges magnificently. His eye wanders to Katrina across the room.',
        loseText: 'Brom trips up Ichabod one time too many. The feast is ruined.',
        init(api) {
          this.x = api.W / 2;
          this.caught = 0;
          this.need = 15;
          this.timer = 28;
          this.items = [];
          this.spawn = 0;
          this.lives = 3;
          this.hitCool = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.hitCool = Math.max(0, this.hitCool - dt);
          if (this.timer <= 0 && this.caught < this.need) { api.lose(); return; }

          // steer
          const p = api.pointer;
          if (p.down) { this.x += clamp(p.x - this.x, -7, 7) * f * 0.2; }
          if (api.keyDown('left'))  this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 18, api.W - 18);

          // spawn items
          this.spawn -= dt;
          if (this.spawn <= 0) {
            this.spawn = api.rnd(0.35, 0.75);
            const isBrom = api.chance(0.28 + (1 - this.timer / 28) * 0.15);
            this.items.push({
              x: api.rnd(24, api.W - 24),
              y: -16,
              spd: api.rnd(1.5, 2.8),
              kind: isBrom ? 'brom' : api.choice(['pie', 'turkey', 'apple', 'cake']),
            });
          }

          for (let i = this.items.length - 1; i >= 0; i--) {
            const it = this.items[i];
            it.y += it.spd * f;
            const catchY = api.H - 80;
            if (it.y >= catchY && it.y < catchY + 18) {
              if (Math.abs(it.x - this.x) < 28) {
                if (it.kind === 'brom') {
                  if (this.hitCool <= 0) {
                    this.lives--;
                    this.hitCool = 1.0;
                    api.shake(5, 0.3);
                    api.flash('#330000', 0.2);
                    api.audio.sfx('hurt');
                    if (this.lives <= 0) { api.lose(); return; }
                  }
                } else {
                  this.caught++;
                  api.score += 10;
                  api.audio.sfx('coin');
                  api.burst(it.x, it.y, '#ff9900', 7);
                  if (this.caught >= this.need) { api.score += Math.floor(this.timer * 4); api.win(); return; }
                }
                this.items.splice(i, 1);
                continue;
              }
            }
            if (it.y > api.H + 10) this.items.splice(i, 1);
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // warm amber farmhouse interior
          api.clear('#1a0e00');
          // walls
          g.rect(0, 0, W, H * 0.55, '#1e1200');
          // window with moonlight
          g.rect(W / 2 - 28, 28, 56, 40, '#0a0600');
          g.rect(W / 2 - 26, 30, 52, 36, '#ffcc44');
          c.globalAlpha = 0.35;
          g.rect(W / 2 - 26, 30, 52, 36, '#1a0e00');
          c.globalAlpha = 1;
          g.rect(W / 2 - 1, 30, 2, 36, '#3a2800');
          g.rect(W / 2 - 26, 48, 52, 2, '#3a2800');
          // floor
          for (let x = 0; x < W; x += 22) g.rect(x, H - 60, 20, 60, '#2a1a08');
          // table
          g.rect(28, H - 120, W - 56, 24, '#5a3a18');
          g.rectO(28, H - 120, W - 56, 24, '#3a2410', 1);
          g.rect(34, H - 120, 8, 40, '#3a2410');
          g.rect(W - 42, H - 120, 8, 40, '#3a2410');
          // tablecloth pattern
          for (let x = 32; x < W - 32; x += 16) g.rect(x, H - 120, 1, 24, '#4a2e14');
          // candles on table
          g.rect(50, H - 138, 5, 18, '#ece8c0');
          g.circle(52, H - 140, 4, '#ff9900');
          g.rect(W - 55, H - 138, 5, 18, '#ece8c0');
          g.circle(W - 52, H - 140, 4, '#ff9900');

          // falling items
          const colors = { pie: '#c87840', turkey: '#a86020', apple: '#cc2200', cake: '#e8a070', brom: '#331a00' };
          for (const it of this.items) {
            if (it.kind === 'brom') {
              // Brom's prank (skull)
              g.circle(it.x, it.y, 9, '#331a00');
              g.rect(it.x - 4, it.y - 5, 3, 3, '#ff6600');
              g.rect(it.x + 1, it.y - 5, 3, 3, '#ff6600');
              g.rect(it.x - 3, it.y + 2, 6, 2, '#ff6600');
            } else {
              g.circle(it.x, it.y, 9, colors[it.kind] || '#c87840');
              if (it.kind === 'pie') {
                g.rect(it.x - 6, it.y - 2, 12, 4, '#e8c080');
                g.rect(it.x - 4, it.y - 6, 8, 8, colors.pie);
              } else if (it.kind === 'apple') {
                g.rect(it.x - 1, it.y - 10, 2, 3, '#3a5a10');
              }
            }
          }

          // Ichabod at table (tall lanky figure)
          const iy = H - 80;
          g.rect(this.x - 7, iy - 28, 14, 22, '#2a1800');
          g.rect(this.x - 5, iy - 40, 10, 12, '#c8a060');
          g.rect(this.x - 7, iy - 46, 14, 6, '#1a1000');
          // arms out to catch
          g.rect(this.x - 18, iy - 18, 10, 3, '#2a1800');
          g.rect(this.x + 8, iy - 18, 10, 3, '#2a1800');
          g.rect(this.x - 22, iy - 20, 8, 5, '#c8a060');
          g.rect(this.x + 14, iy - 20, 8, 5, '#c8a060');
          // hit flash
          if (this.hitCool > 0 && Math.sin(api.t * 20) > 0) {
            c.globalAlpha = 0.5;
            g.circle(this.x, iy - 20, 22, '#ff4400');
            c.globalAlpha = 1;
          }

          api.topBar('THE HARVEST FEAST');
          api.txt('DISHES ' + this.caught + '/' + this.need, 6, 20, 8, '#ff9900', false, true);
          for (let i = 0; i < 3; i++) {
            g.rect(W - 14 - i * 16, 18, 10, 8, i < this.lives ? '#ff6600' : '#2a1400');
          }
          // timer
          g.rect(6, H - 10, W - 12, 5, '#1a1000');
          g.rect(6, H - 10, Math.floor((W - 12) * clamp(this.timer / 28, 0, 1)), 5, '#ff9900');
        },
      },

      /* =================== 4. THE MIDNIGHT RIDE ======================== */
      {
        id: 'ride', name: 'THE MIDNIGHT RIDE', sub: 'HE COMES',
        icon(api, x, y) {
          const g = api.gfx;
          // horseman silhouette (no head)
          g.rect(x - 6, y - 6, 12, 10, '#1a0e00');
          g.rect(x - 8, y + 2, 16, 6, '#1a0e00');
          // raised arm throwing pumpkin
          g.rect(x + 4, y - 10, 3, 8, '#1a0e00');
          g.circle(x + 8, y - 12, 4, '#cc4400');
        },
        intro: [
          'THE MIDNIGHT RIDE HOME.',
          'THUNDERING HOOVES ECHO.',
          'SOMETHING FOLLOWS.',
          'Ride for your life!',
        ],
        quote: 'Just then he heard a heavy stamping of hoofs, and a rushing of a monstrous dark figure.',
        help: 'STEER to dodge obstacles · ride fast or the Horseman catches you',
        winText: 'The covered bridge looms! Almost there — keep riding!',
        loseText: 'The thundering hooves draw level. Something flies through the dark...',
        init(api) {
          this.x = api.W / 2;
          this.scroll = 0;
          this.dist = 0;        // progress toward bridge (0-1)
          this.horse = 0;       // horseman distance (starts far)
          this.obs = [];        // obstacles
          this.spawnObs = 0;
          this.lives = 3;
          this.hitCool = 0;
          this.speed = 1.8;
        },
        update(api, dt) {
          const f = dt * 60;
          this.hitCool = Math.max(0, this.hitCool - dt);
          this.speed = Math.min(3.2, this.speed + dt * 0.04);

          this.scroll += this.speed * f * 1.2;
          this.dist += dt * 0.022 * this.speed;
          this.horse += dt * 0.018; // Horseman closes in

          if (this.dist >= 1) { api.score += 100; api.win(); return; }
          if (this.horse >= 1) { api.lose(); return; }

          // steer
          const p = api.pointer;
          if (p.down) this.x += clamp(p.x - this.x, -8, 8) * f * 0.16;
          if (api.keyDown('left'))  this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 22, api.W - 22);

          // spawn obstacles (fallen branches, stumps)
          this.spawnObs -= dt;
          if (this.spawnObs <= 0) {
            this.spawnObs = api.rnd(0.55, 1.2) / this.speed;
            this.obs.push({ x: api.rnd(28, api.W - 28), y: -18,
              kind: api.choice(['branch', 'stump', 'rock']) });
          }
          for (let i = this.obs.length - 1; i >= 0; i--) {
            const o = this.obs[i];
            o.y += this.speed * 2.5 * f;
            if (o.y > api.H + 10) { this.obs.splice(i, 1); continue; }
            if (this.hitCool <= 0 && Math.hypot(this.x - o.x, api.H - 90 - o.y) < 22) {
              this.lives--;
              this.hitCool = 1.0;
              api.shake(5, 0.3);
              api.flash('#330000', 0.25);
              api.audio.sfx('hurt');
              this.obs.splice(i, 1);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#050208');
          // sky
          const sky = c.createLinearGradient(0, 0, 0, H * 0.6);
          sky.addColorStop(0, '#020105');
          sky.addColorStop(1, '#100600');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.6);

          // moon (partially obscured by clouds)
          c.globalAlpha = 0.6; g.circle(W / 2, 38, 20, '#ffcc44'); c.globalAlpha = 1;
          for (let ci = 0; ci < 3; ci++) {
            const cx2 = ((api.t * 8 + ci * 90) % (W + 60)) - 30;
            c.globalAlpha = 0.5;
            g.rect(cx2, 28 + ci * 4, 60, 20, '#0a0600');
            c.globalAlpha = 1;
          }

          // dark forest walls
          for (let i = 0; i < 7; i++) {
            const tx = (i * 42 + this.scroll * 0.3) % (W + 20) - 10;
            g.rect(tx - 2, H - 110, 5, 70, '#0a0600');
            g.rect(tx - 10, H - 118, 20, 28, '#0a0600');
            const rx = W - tx - 5;
            g.rect(rx - 2, H - 110, 5, 70, '#0a0600');
            g.rect(rx - 10, H - 118, 20, 28, '#0a0600');
          }

          // road
          g.rect(0, H - 72, W, 72, '#180c00');
          for (let i = 0; i < 8; i++) {
            const ry = ((this.scroll * 1.2 + i * 44) % (H + 20)) - 10;
            g.rect(W / 2 - 2, H - 72 + ry % 72, 4, 16, '#2a1800');
          }
          // road edges
          g.rect(18, H - 72, 2, 72, '#3a2000');
          g.rect(W - 20, H - 72, 2, 72, '#3a2000');

          // obstacles
          for (const o of this.obs) {
            if (o.kind === 'branch') {
              g.rect(o.x - 14, o.y - 2, 28, 4, '#3a2000');
              g.rect(o.x - 8, o.y - 6, 4, 8, '#2a1800');
            } else if (o.kind === 'stump') {
              g.rect(o.x - 8, o.y - 10, 16, 12, '#2a1800');
              g.rect(o.x - 10, o.y - 2, 20, 4, '#3a2000');
            } else {
              g.circle(o.x, o.y, 10, '#1a1408');
            }
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

          // The Horseman looming behind (grows as horse closes in)
          const hScale = this.horse;  // 0→1
          const hSize = 18 + hScale * 30;
          const hAlpha = 0.3 + hScale * 0.6;
          const hx = W / 2 + Math.sin(api.t * 3) * 14;
          const hy = H - 50 + hSize * 0.5;
          c.globalAlpha = hAlpha;
          // headless horseman silhouette
          g.rect(hx - hSize * 0.5, hy - hSize * 1.2, hSize, hSize * 1.0, '#0a0400');
          g.rect(hx - hSize * 0.65, hy - hSize * 0.6, hSize * 1.3, hSize * 0.5, '#0a0400');
          // raised arm with pumpkin
          g.rect(hx + hSize * 0.4, hy - hSize * 1.5, hSize * 0.18, hSize * 0.6, '#0a0400');
          g.circle(hx + hSize * 0.55, hy - hSize * 1.6, hSize * 0.25, '#cc4400');
          c.globalAlpha = 1;

          // progress bar
          api.topBar('THE MIDNIGHT RIDE');
          api.txt('DIST', 6, 20, 8, '#7a5020', false, true);
          g.rect(42, 22, W - 90, 6, '#1a1000');
          g.rect(42, 22, Math.floor((W - 90) * this.dist), 6, '#ff9900');
          for (let i = 0; i < 3; i++) {
            g.rect(W - 14 - i * 14, 18, 10, 8, i < this.lives ? '#ff6600' : '#2a1400');
          }
          // horseman warning
          if (this.horse > 0.65) {
            c.globalAlpha = 0.6 + 0.4 * Math.sin(api.t * 8);
            api.txtC('HE IS NEAR', W / 2, H - 24, 9, '#cc2200', true);
            c.globalAlpha = 1;
          }
          api.vignette();
        },
      },

      /* =================== 5. THE BRIDGE ============================= */
      {
        id: 'bridge', name: 'THE BRIDGE', sub: 'REACH IT — OR FALL',
        icon(api, x, y) {
          const g = api.gfx;
          // bridge arch icon
          g.rect(x - 8, y, 16, 5, '#6a4a18');
          c: {
            const c2 = api.ctx;
            c2.strokeStyle = '#5a3a10'; c2.lineWidth = 2;
            c2.beginPath(); c2.arc(x, y, 8, Math.PI, 0); c2.stroke();
          }
        },
        intro: [
          'THE COVERED BRIDGE!',
          'IF HE CROSSES IT,',
          'THE HORSEMAN CANNOT',
          'follow beyond hallowed ground.',
        ],
        quote: 'If I can but reach that bridge, I am safe.',
        help: 'DODGE the Horseman\'s pumpkins · reach the bridge',
        winText: 'Ichabod leaps the bridge! The Horseman reins in — the deed is done.',
        loseText: 'The pumpkin strikes. Gunpowder gallops off alone into the night.',
        init(api) {
          this.x = api.W / 2;
          this.dist = 0;        // 0 = start, 1 = bridge
          this.scroll = 0;
          this.pumpkins = [];
          this.spawnP = 1.5;
          this.lives = 3;
          this.hitCool = 0;
          this.phase = 'ride'; // 'ride' then 'bridge' flash
          this.bridgeFlash = 0;
          this.speed = 2.0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.hitCool = Math.max(0, this.hitCool - dt);

          if (this.phase === 'bridge') {
            this.bridgeFlash += dt;
            if (this.bridgeFlash > 0.8) { api.score += 120; api.win(); }
            return;
          }

          this.scroll += this.speed * f * 1.5;
          this.dist += dt * 0.028 * this.speed;
          this.speed = Math.min(3.5, this.speed + dt * 0.05);

          if (this.dist >= 1) { this.phase = 'bridge'; api.audio.sfx('win'); return; }

          // steer
          const p = api.pointer;
          if (p.down) this.x += clamp(p.x - this.x, -8, 8) * f * 0.18;
          if (api.keyDown('left'))  this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 22, api.W - 22);

          // spawn pumpkins (thrown by horseman from behind)
          this.spawnP -= dt;
          if (this.spawnP <= 0) {
            this.spawnP = Math.max(0.4, 1.5 - this.dist * 1.0);
            const targetX = this.x + api.rnd(-30, 30);
            const vx = (targetX - api.W / 2) * 0.08;
            this.pumpkins.push({ x: api.W / 2 + api.rnd(-30, 30), y: api.H, vx, vy: -api.rnd(4.5, 7.0), rot: 0, rspd: api.rnd(-0.1, 0.1) });
          }

          for (let i = this.pumpkins.length - 1; i >= 0; i--) {
            const pk = this.pumpkins[i];
            pk.x += pk.vx * f;
            pk.y += pk.vy * f;
            pk.vy += 0.22 * f;  // gravity
            pk.rot += pk.rspd * f;
            if (pk.y < -20 || pk.y > api.H + 20) { this.pumpkins.splice(i, 1); continue; }
            // hit Ichabod
            if (this.hitCool <= 0 && pk.y < api.H - 60 && pk.y > api.H - 120 &&
                Math.abs(pk.x - this.x) < 24) {
              this.lives--;
              this.hitCool = 0.9;
              api.shake(6, 0.3);
              api.flash('#440000', 0.2);
              api.audio.sfx('hurt');
              this.pumpkins.splice(i, 1);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // bridge flash overlay
          if (this.phase === 'bridge') {
            api.clear('#ff9900');
            c.globalAlpha = Math.max(0, 1 - this.bridgeFlash * 1.2);
            c.fillStyle = '#ff9900'; c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
            api.txtC('THE BRIDGE!', W / 2, H / 2 - 14, 18, '#fff8e0', true);
            return;
          }

          api.clear('#030107');
          const sky = c.createLinearGradient(0, 0, 0, H * 0.65);
          sky.addColorStop(0, '#030107');
          sky.addColorStop(1, '#150900');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.65);

          // moon — big, blood orange near horizon
          g.circle(W / 2, 60, 30, '#ff8800');
          c.globalAlpha = 0.3; g.circle(W / 2, 60, 38, '#ff6600'); c.globalAlpha = 1;

          // forest sides
          for (let i = 0; i < 7; i++) {
            const tx = (i * 42 + this.scroll * 0.35) % (W + 20) - 10;
            g.rect(tx - 3, H - 112, 6, 72, '#0a0600');
            g.rect(tx - 12, H - 124, 24, 32, '#0a0600');
            const rx = W - tx - 3;
            g.rect(rx - 3, H - 112, 6, 72, '#0a0600');
            g.rect(rx - 12, H - 124, 24, 32, '#0a0600');
          }

          // road
          g.rect(0, H - 68, W, 68, '#180c00');
          for (let i = 0; i < 8; i++) {
            const ry2 = ((this.scroll * 1.5 + i * 44) % (H + 20)) - 10;
            g.rect(W / 2 - 2, H - 68 + ry2 % 68, 4, 16, '#2a1800');
          }

          // bridge in distance (grows as dist increases)
          if (this.dist > 0.4) {
            const bAlpha = clamp((this.dist - 0.4) * 4, 0, 1);
            const bScale = clamp((this.dist - 0.4) * 2.5, 0, 1);
            const bW = 50 + bScale * 80;
            const bY = H - 72 - bScale * 10;
            c.globalAlpha = bAlpha;
            g.rect(W / 2 - bW / 2, bY - 28, bW, 28, '#4a3010');
            g.rectO(W / 2 - bW / 2, bY - 28, bW, 28, '#6a4820', 1);
            // arch
            c.strokeStyle = '#3a2008'; c.lineWidth = 4;
            c.beginPath(); c.arc(W / 2, bY, bW / 2.2, Math.PI, 0); c.stroke();
            c.lineWidth = 1;
            c.globalAlpha = 1;
          }

          // pumpkins
          for (const pk of this.pumpkins) {
            c.save();
            c.translate(pk.x, pk.y);
            c.rotate(pk.rot);
            g.rect(-7, -5, 14, 10, '#cc4400');
            g.rect(-5, -8, 10, 14, '#cc4400');
            g.rect(-8, -2, 16, 5, '#cc4400');
            g.rect(-1, -10, 2, 3, '#3a5a10');
            g.rect(-4, -3, 2, 2, '#ff9900');
            g.rect(2, -3, 2, 2, '#ff9900');
            g.rect(-2, 1, 4, 2, '#ff9900');
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

          // Horseman behind (looming large)
          const hS = 28 + this.dist * 20;
          const hxP = W / 2 + Math.sin(api.t * 2.5) * 12;
          c.globalAlpha = 0.75 + 0.25 * Math.sin(api.t * 6);
          g.rect(hxP - hS * 0.55, H - 30 - hS * 1.3, hS * 1.1, hS, '#0a0400');
          g.rect(hxP - hS * 0.75, H - 30 - hS * 0.75, hS * 1.5, hS * 0.55, '#0a0400');
          g.rect(hxP + hS * 0.38, H - 30 - hS * 1.65, hS * 0.16, hS * 0.6, '#0a0400');
          g.circle(hxP + hS * 0.52, H - 30 - hS * 1.75, hS * 0.22, '#cc4400');
          c.globalAlpha = 1;

          api.topBar('THE BRIDGE');
          api.txt('BRIDGE', 6, 20, 8, '#7a5020', false, true);
          g.rect(48, 22, W - 96, 6, '#1a1000');
          g.rect(48, 22, Math.floor((W - 96) * this.dist), 6, '#ff9900');
          for (let i = 0; i < 3; i++) {
            g.rect(W - 14 - i * 14, 18, 10, 8, i < this.lives ? '#ff6600' : '#2a1400');
          }
          c.globalAlpha = 0.5 + 0.5 * Math.sin(api.t * 5);
          api.txtC('RIDE!', W / 2, H - 22, 10, '#ff6600', true);
          c.globalAlpha = 1;
          api.vignette();
        },
      },
    ], // end chapters
  }); // end RetroSaga.create
}());
