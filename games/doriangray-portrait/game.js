/* ============================================================================
 * THE PORTRAIT — The Picture of Dorian Gray (Oscar Wilde, 1890)
 * Five chapters of Victorian Gothic:
 *   1. THE SITTING      — dodge Lord Henry's platitudes in Basil's studio (22s survive)
 *   2. SIBYL'S NIGHT    — catch 12 roses at the Lyceum Theatre (catch mechanic)
 *   3. THE YELLOW BOOK  — sort Lord Henry's pages: ACCEPT beauty or REJECT vice
 *   4. EAST LONDON      — hide from James Vane's lantern in the fog (stealth/dodge)
 *   5. THE LOCKED ROOM  — strike the corrupted portrait at the exact moment (timing)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;
  const rand  = Retro.util.rand;
  const randI = Retro.util.randInt;

  /* ─── Victorian Gothic Palette ─── */
  const C = {
    // Backgrounds
    void_:   '#060109',
    abyss:   '#0e0412',
    shadow:  '#160615',
    dark:    '#220b1c',
    wine:    '#360f22',
    plum:    '#501a38',
    mauve:   '#6c2050',
    // Sin / Rot
    rose:    '#8a1a3a',
    crimson: '#bc1e3e',
    scarlet: '#e02e54',
    blood:   '#ff2858',
    // Beauty / Gold
    tarnish: '#4e3a0c',
    oldgold: '#8a6418',
    gold:    '#cc9830',
    gilded:  '#e6b448',
    gleam:   '#f4d668',
    // Neutrals
    stone:   '#443040',
    grey:    '#6c5466',
    silver:  '#9e8496',
    ivory:   '#d2b4a6',
    parch:   '#e2ccb0',
    cream:   '#eeddca',
    // Character
    skin:    '#be7a58',
    suit:    '#cec8a4',
    hair:    '#3a1606',
    curtain: '#560c1e',
  };

  /* ─── Emblem: corrupted portrait in a gilded frame ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    const t = Date.now() * 0.001;

    // Outer heavy gilt frame
    c.strokeStyle = C.gold; c.lineWidth = 5;
    c.strokeRect(cx - 34, cy - 44, 68, 84);
    c.strokeStyle = C.tarnish; c.lineWidth = 1;
    c.strokeRect(cx - 38, cy - 48, 76, 92);
    c.strokeStyle = C.gilded; c.lineWidth = 1;
    c.strokeRect(cx - 30, cy - 40, 60, 76);

    // Frame corner rosettes
    [[cx - 38, cy - 48], [cx + 38, cy - 48], [cx - 38, cy + 44], [cx + 38, cy + 44]].forEach(function (pt) {
      c.fillStyle = C.gilded;
      c.beginPath(); c.arc(pt[0], pt[1], 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = C.gold;
      c.beginPath(); c.arc(pt[0], pt[1], 3, 0, Math.PI * 2); c.fill();
    });

    // Aged canvas background
    c.fillStyle = C.dark; c.fillRect(cx - 29, cy - 39, 58, 74);

    // Dorian's beautiful face
    c.fillStyle = C.skin;
    c.beginPath(); c.arc(cx, cy - 14, 15, 0, Math.PI * 2); c.fill();
    c.fillStyle = C.hair; c.fillRect(cx - 15, cy - 30, 30, 14);
    c.beginPath(); c.arc(cx, cy - 30, 15, Math.PI, 0); c.fill();
    // Eyes
    g.rect(cx - 6, cy - 18, 4, 5, C.dark);
    g.rect(cx + 2, cy - 18, 4, 5, C.dark);
    // Suit
    c.fillStyle = C.suit; c.fillRect(cx - 14, cy + 2, 28, 18);
    c.fillRect(cx - 5, cy - 1, 10, 5);

    // Decay cracks (pulsing)
    c.strokeStyle = C.crimson; c.lineWidth = 1.2;
    c.globalAlpha = 0.6 + 0.35 * Math.sin(t * 2);
    c.beginPath(); c.moveTo(cx + 2, cy - 6); c.lineTo(cx + 18, cy + 6); c.stroke();
    c.beginPath(); c.moveTo(cx - 4, cy - 10); c.lineTo(cx - 20, cy + 2); c.stroke();
    c.beginPath(); c.moveTo(cx, cy - 2); c.lineTo(cx + 7, cy + 14); c.stroke();
    c.globalAlpha = 1;

    // Rot wash at bottom of portrait
    c.fillStyle = C.crimson;
    c.globalAlpha = 0.28 + 0.12 * Math.sin(t * 1.8);
    c.fillRect(cx - 29, cy + 12, 58, 23);
    c.globalAlpha = 1;
  }

  /* ─── Scenery: Victorian study for boot/menu, dark attic for screens ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'boot' || scene === 'menu') {
      // Deep wine wallpaper
      const bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, C.wine); bg.addColorStop(1, C.abyss);
      c.fillStyle = bg; c.fillRect(0, 0, W, H);

      // Subtle damask diamond pattern
      c.globalAlpha = 0.07;
      c.fillStyle = C.gilded;
      for (var di = 0; di < 22; di++) {
        for (var dj = 0; dj < 16; dj++) {
          var ddx = di * 24 + (dj % 2) * 12, ddy = dj * 30;
          c.beginPath();
          c.moveTo(ddx + 12, ddy); c.lineTo(ddx + 20, ddy + 15);
          c.lineTo(ddx + 12, ddy + 30); c.lineTo(ddx + 4, ddy + 15);
          c.closePath(); c.fill();
        }
      }
      c.globalAlpha = 1;

      // Bookshelf silhouette (left edge)
      c.fillStyle = C.dark; c.fillRect(0, 80, 16, H - 116);
      for (var bi = 0; bi < 9; bi++) {
        c.fillStyle = [C.wine, C.plum, C.tarnish, C.rose, C.shadow, C.mauve, C.oldgold, C.dark, C.crimson][bi];
        c.fillRect(2, 88 + bi * 28, 12, 25);
      }

      // Fireplace glow (right)
      c.globalAlpha = 0.16 + 0.07 * Math.sin(t * 3.1);
      c.fillStyle = C.gilded;
      c.beginPath(); c.arc(W - 18, H - 64, 36, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;

      // Heavy velvet curtain strips
      c.fillStyle = C.curtain;
      c.fillRect(0, 0, 4, H);
      c.fillRect(W - 4, 0, 4, H);

      // Wainscoting (dark wood baseboard)
      c.fillStyle = C.dark; c.fillRect(0, H - 34, W, 34);
      c.fillStyle = C.tarnish; c.fillRect(0, H - 38, W, 4);
      c.strokeStyle = C.oldgold; c.lineWidth = 0.8;
      for (var pi = 0; pi < 5; pi++) {
        c.strokeRect(pi * 54 + 6, H - 34, 46, 30);
      }

      if (scene === 'menu') {
        c.fillStyle = 'rgba(6,1,9,.52)'; c.fillRect(0, 0, W, H);
        c.fillStyle = C.tarnish; c.fillRect(0, H - 38, W, 3);
      }
      return;
    }

    // Intro / result / finale: candlelit attic with the locked door
    const attic = c.createLinearGradient(0, 0, 0, H);
    attic.addColorStop(0, C.abyss); attic.addColorStop(1, C.shadow);
    c.fillStyle = attic; c.fillRect(0, 0, W, H);

    // Bare floorboards
    c.fillStyle = C.dark; c.fillRect(0, H - 40, W, 40);
    c.strokeStyle = C.tarnish; c.lineWidth = 0.4;
    for (var fi = 0; fi < 8; fi++) {
      c.beginPath(); c.moveTo(fi * 38, H - 40); c.lineTo(fi * 38, H); c.stroke();
    }

    // The locked portrait hinted on the wall
    c.fillStyle = C.tarnish; c.fillRect(W / 2 - 42, 52, 84, 108);
    c.strokeStyle = C.oldgold; c.lineWidth = 3; c.strokeRect(W / 2 - 42, 52, 84, 108);
    c.fillStyle = C.dark; c.fillRect(W / 2 - 36, 58, 72, 96);
    c.fillStyle = C.skin; c.globalAlpha = 0.25;
    c.beginPath(); c.arc(W / 2, 94, 18, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    c.fillStyle = C.crimson; c.globalAlpha = 0.22 + 0.09 * Math.sin(t * 2.3);
    c.fillRect(W / 2 - 36, 106, 72, 48); c.globalAlpha = 1;

    // Candle glow
    c.globalAlpha = 0.12 + 0.05 * Math.sin(t * 4.7);
    c.fillStyle = C.gilded;
    c.beginPath(); c.arc(W / 2, H / 2, 80, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;

    // Dark overlay for legibility
    c.fillStyle = 'rgba(6,1,9,.80)'; c.fillRect(0, 0, W, H);
  }

  /* ─── Gallery layout: 5 portrait frames on a Victorian wall ─── */
  var GALLERY = [
    { x: 8,   y: 84,  w: 76, h: 88 },   // Ch1: THE SITTING
    { x: 96,  y: 74,  w: 78, h: 100 },  // Ch2: SIBYL'S NIGHT (centrepiece, taller)
    { x: 186, y: 84,  w: 76, h: 88 },   // Ch3: THE YELLOW BOOK
    { x: 26,  y: 198, w: 96, h: 90 },   // Ch4: EAST LONDON
    { x: 148, y: 198, w: 96, h: 90 },   // Ch5: THE LOCKED ROOM
  ];

  /* ─── Saga ─── */
  RetroSaga.create({
    id: 'doriangray',
    title: 'The Portrait',
    subtitle: 'THE PICTURE OF DORIAN GRAY',
    currency: 'SINS',
    screens: {
      win:          C.gleam,
      lose:         C.scarlet,
      chapterLabel: C.grey,
      name:         C.cream,
      sub:          C.ivory,
      intro:        C.parch,
      quote:        C.grey,
      help:         C.silver,
      score:        C.cream,
      cur:          C.scarlet,
      cta:          C.gilded,
      overlay:      'rgba(6,1,9,.92)',
    },
    labels: {
      chapter: 'CHAPTER',
      score:   'SINS TALLIED',
      win:     'THE FACE HOLDS.',
      lose:    'THE PORTRAIT WINS.',
      cont:    'TAP TO CONTINUE',
      finale:  'TAP FOR THE ENDING',
      toMenu:  'RETURN TO THE GALLERY',
      play:    'TAP TO BEGIN',
    },
    accent:    C.gold,
    credit:    'AFTER OSCAR WILDE · 1890',
    emblem,
    scenery,
    bootCta:   'TAP TO ENTER',
    menuLabel: 'THE PORTRAIT',
    menuHint:  'CHOOSE YOUR CHAPTER',
    menuDone:  'THE KNIFE IS DRAWN.',

    /* ─── Gallery chapter-select ─── */
    menu: {
      title(api, currency) {
        const c = api.ctx, W = api.W;
        // Velvet header panel
        c.fillStyle = C.shadow; c.fillRect(0, 0, W, 72);
        c.fillStyle = C.tarnish; c.fillRect(0, 70, W, 2);
        // Gold ruled border
        c.strokeStyle = C.gold; c.lineWidth = 1;
        c.strokeRect(4, 4, W - 8, 64);
        c.strokeStyle = C.tarnish; c.lineWidth = 0.5;
        c.strokeRect(7, 7, W - 14, 58);
        // Title
        api.txtCFit('THE PORTRAIT', W / 2, 16, 11, C.gleam, true, W - 32);
        api.txtCFit('DORIAN GRAY  ·  ' + currency + ' SINS', W / 2, 38, 7, C.gold, true, W - 32);
        api.txtCFit('GALLERY', W / 2, 54, 7, C.grey, false, W - 32);
        // Corner ornaments
        [[8, 8], [W - 8, 8], [8, 66], [W - 8, 66]].forEach(function (pt) {
          c.fillStyle = C.gilded;
          c.beginPath(); c.arc(pt[0], pt[1], 3, 0, Math.PI * 2); c.fill();
        });
        // Picture rail at y=72
        c.strokeStyle = C.oldgold; c.lineWidth = 1;
        c.beginPath(); c.moveTo(0, 72); c.lineTo(W, 72); c.stroke();
        // Hanging wires (dashed) from rail to each frame top-centre
        c.setLineDash([2, 3]);
        c.strokeStyle = C.stone; c.lineWidth = 0.8;
        [[46, 84], [135, 74], [224, 84], [74, 198], [196, 198]].forEach(function (pt) {
          c.beginPath(); c.moveTo(pt[0], 72); c.lineTo(pt[0], pt[1]); c.stroke();
        });
        c.setLineDash([]);
      },
      layout() { return GALLERY; },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2, cy = y + h / 2;

        // Canvas background
        c.fillStyle = sel ? C.wine : (done ? '#1a0c18' : C.abyss);
        c.fillRect(x, y, w, h);

        // Outer gilt frame
        const fw = sel ? 4 : 3;
        const fc = sel ? C.gleam : (done ? C.gold : C.oldgold);
        c.strokeStyle = fc; c.lineWidth = fw;
        c.strokeRect(x + fw / 2, y + fw / 2, w - fw, h - fw);
        // Inner line
        c.strokeStyle = sel ? C.gilded : C.tarnish;
        c.lineWidth = 1;
        c.strokeRect(x + fw + 2, y + fw + 2, w - (fw + 2) * 2, h - (fw + 2) * 2);

        // Corner rosettes
        var rr = 5;
        [[x + rr, y + rr], [x + w - rr, y + rr], [x + rr, y + h - rr], [x + w - rr, y + h - rr]].forEach(function (pt) {
          c.fillStyle = fc;
          c.beginPath(); c.arc(pt[0], pt[1], rr, 0, Math.PI * 2); c.fill();
          c.fillStyle = sel ? C.gold : C.tarnish;
          c.beginPath(); c.arc(pt[0], pt[1], rr - 2, 0, Math.PI * 2); c.fill();
        });

        // Chapter icon (tiny painted scene)
        if (ch.icon) ch.icon(api, cx, cy - 12);

        // Museum caption
        api.txtCFit(ch.name, cx, cy + 8, 6, sel ? C.cream : (done ? C.ivory : C.silver), true, w - 22);

        // Done: crimson wax seal
        if (done) {
          c.fillStyle = C.crimson;
          c.beginPath(); c.arc(x + w - 10, y + 10, 7, 0, Math.PI * 2); c.fill();
          c.fillStyle = C.scarlet;
          c.beginPath(); c.arc(x + w - 10, y + 10, 5, 0, Math.PI * 2); c.fill();
          api.txtC('✓', x + w - 10, y + 6, 7, C.cream, false);
        }

        // Selected: pulsing gilt edge + arrow
        if (sel) {
          c.strokeStyle = C.gleam; c.lineWidth = 1.5;
          c.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 280);
          c.strokeRect(x + 1, y + 1, w - 2, h - 2);
          c.globalAlpha = 1;
          c.fillStyle = C.gleam;
          c.beginPath();
          c.moveTo(x - 4, cy); c.lineTo(x - 12, cy - 5); c.lineTo(x - 12, cy + 5);
          c.closePath(); c.fill();
        }
      },
    },

    finale: [
      'THE LOCKED DOOR',
      'SWUNG OPEN AT LAST.',
      '',
      'THE KNIFE FOUND',
      'ITS MARK.',
      '',
      '"He had killed',
      ' the only thing',
      ' he had ever loved."',
      '',
      '— THE END —',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ================================================================
       * 1. THE SITTING
       *    Dodge Lord Henry's poisonous platitudes falling from above.
       *    22 seconds, 3 lives. Paint-drop bonuses for score.
       * ================================================================ */
      {
        id: 'sitting',
        name: 'THE SITTING',
        sub: 'LORD HENRY SPEAKS',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Easel legs
          c.strokeStyle = C.tarnish; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x - 8, y + 8); c.lineTo(x - 12, y + 18); c.stroke();
          c.beginPath(); c.moveTo(x + 8, y + 8); c.lineTo(x + 12, y + 18); c.stroke();
          c.beginPath(); c.moveTo(x - 4, y + 16); c.lineTo(x + 4, y + 16); c.stroke();
          // Canvas on easel
          g.rect(x - 8, y - 12, 16, 22, C.wine);
          c.strokeStyle = C.oldgold; c.lineWidth = 1; c.strokeRect(x - 8, y - 12, 16, 22);
          // Face on canvas
          g.circle(x, y - 2, 4, C.skin);
          g.rect(x - 6, y - 12, 12, 5, C.hair);
        },
        intro: [
          'BASIL HALLWARD PAINTS',
          'DORIAN\'S PORTRAIT.',
          'Lord Henry Wotton lounges',
          'nearby, filling the room',
          'with golden words.',
          'Each one is a needle.',
        ],
        quote: '"The only way to get rid of a temptation is to yield to it." — Oscar Wilde',
        help: 'DRAG left/right · dodge the whispered platitudes!',
        winText: 'Basil set down his brush. The portrait was flawless — and Dorian wept.',
        loseText: 'Lord Henry\'s poison reached him. Dorian stared at the finished canvas, changed.',
        init(api) {
          this.dx    = api.W / 2;
          this.lives = 3;
          this.timer = 0;
          this.dur   = 22;
          this.obs   = [];
          this.spawnT = 0;
          this.invT  = 0;
          this.drops = [];      // bonus paint drops
          this.dropT = 2.5;
          this.trees = [];
          // Background drift elements
          for (var i = 0; i < 6; i++) {
            this.trees.push({ x: i * 48 + 8, spd: 12 + i * 3 });
          }
        },
        update(api, dt) {
          var W = api.W, H = api.H;
          this.timer += dt;
          if (this.invT > 0) this.invT -= dt;
          if (this.timer >= this.dur) { api.score += 100; api.win(); return; }

          // Steer
          var spd = 165;
          if (api.pointer.down) this.dx = clamp(api.pointer.x, 22, W - 22);
          if (api.keyDown('left'))  this.dx = clamp(this.dx - spd * dt, 22, W - 22);
          if (api.keyDown('right')) this.dx = clamp(this.dx + spd * dt, 22, W - 22);

          // Spawn platitude orbs
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.65, 1.9 - this.timer * 0.045);
            var labels = ['YIELD', 'BEAUTY', 'YOUTH', 'SIN', 'VANITY', 'RESIST', 'PLEASURE'];
            var cols   = [C.crimson, C.scarlet, C.rose];
            this.obs.push({
              x:   20 + randI(0, W - 40),
              y:   -22,
              r:   12 + randI(0, 7),
              lbl: labels[randI(0, labels.length - 1)],
              col: cols[randI(0, cols.length - 1)],
              spd: 68 + randI(0, 55) + this.timer * 2.2,
              wob: (Math.random() - 0.5) * 32,
            });
          }

          // Spawn paint drops (bonus)
          this.dropT -= dt;
          if (this.dropT <= 0) {
            this.dropT = 3.5 + Math.random() * 3;
            this.drops.push({ x: 22 + randI(0, W - 44), y: -12, spd: 55 + randI(0, 38) });
          }

          // Move orbs
          for (var i = this.obs.length - 1; i >= 0; i--) {
            var o = this.obs[i];
            o.y += o.spd * dt;
            o.x += Math.sin(o.y * 0.036 + o.wob) * dt * 26;
            if (o.y > H + 24) { this.obs.splice(i, 1); continue; }
            if (this.invT <= 0) {
              var hy = H - 54;
              var dx = o.x - this.dx, dy = o.y - hy;
              if (dx * dx + dy * dy < (o.r + 12) * (o.r + 12)) {
                this.lives--;
                this.invT = 1.5;
                api.shake(5, 0.22); api.flash(C.blood, 0.14); api.audio.sfx('hurt');
                api.burst(this.dx, hy, C.crimson, 8);
                this.obs.splice(i, 1);
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          }

          // Move paint drops
          for (var j = this.drops.length - 1; j >= 0; j--) {
            var pd = this.drops[j];
            pd.y += pd.spd * dt;
            if (pd.y > H + 12) { this.drops.splice(j, 1); continue; }
            var hy2 = H - 54;
            if (Math.abs(pd.x - this.dx) < 16 && Math.abs(pd.y - hy2) < 16) {
              api.score += 30; api.burst(pd.x, pd.y, C.gilded, 6); api.audio.sfx('coin');
              this.drops.splice(j, 1);
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Studio interior
          c.fillStyle = C.dark; c.fillRect(0, 0, W, H);
          // Afternoon light from window
          c.fillStyle = C.plum; c.fillRect(W / 2 - 28, 0, 56, 82);
          c.globalAlpha = 0.45; c.fillStyle = C.mauve; c.fillRect(W / 2 - 26, 2, 52, 80); c.globalAlpha = 1;
          c.strokeStyle = C.wine; c.lineWidth = 2;
          c.strokeRect(W / 2 - 28, 0, 56, 82);
          c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, 82); c.stroke();
          c.beginPath(); c.moveTo(W / 2 - 28, 41); c.lineTo(W / 2 + 28, 41); c.stroke();

          // Easel (left)
          c.strokeStyle = C.tarnish; c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(46, H - 72); c.lineTo(32, H - 28); c.stroke();
          c.beginPath(); c.moveTo(46, H - 72); c.lineTo(60, H - 28); c.stroke();
          c.beginPath(); c.moveTo(32, H - 28); c.lineTo(60, H - 28); c.stroke();
          g.rect(32, H - 120, 28, 52, C.wine);
          c.strokeStyle = C.oldgold; c.lineWidth = 1; c.strokeRect(32, H - 120, 28, 52);
          // Basil figure
          g.circle(18, H - 116, 9, C.ivory);
          g.rect(12, H - 108, 12, 22, C.plum);

          // Floor
          c.fillStyle = C.shadow; c.fillRect(0, H - 30, W, 30);
          c.strokeStyle = C.tarnish; c.lineWidth = 0.4;
          for (var fi = 0; fi < 7; fi++) {
            c.beginPath(); c.moveTo(fi * 42, H - 30); c.lineTo(fi * 42, H); c.stroke();
          }

          // Paint drops
          this.drops.forEach(function (pd) {
            c.fillStyle = C.gilded; c.globalAlpha = 0.9;
            c.beginPath(); c.arc(pd.x, pd.y, 5, 0, Math.PI * 2); c.fill();
            c.fillStyle = C.gleam; c.globalAlpha = 0.55;
            c.beginPath(); c.arc(pd.x - 1, pd.y - 2, 2, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          });

          // Platitude orbs
          this.obs.forEach(function (o) {
            c.globalAlpha = 0.22;
            c.fillStyle = o.col;
            c.beginPath(); c.arc(o.x, o.y, o.r + 7, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            g.circle(o.x, o.y, o.r, o.col);
            api.txtCFit(o.lbl, o.x, o.y - 4, 6, C.cream, true, o.r * 2 - 4);
          });

          // Dorian (player)
          var hy = H - 54;
          if (this.invT <= 0 || Math.floor(this.invT * 8) % 2 === 0) {
            g.circle(this.dx, hy - 15, 11, C.skin);
            c.fillStyle = C.hair; c.fillRect(this.dx - 9, hy - 27, 18, 10);
            c.beginPath(); c.arc(this.dx, hy - 25, 9, Math.PI, 0); c.fill();
            g.rect(this.dx - 9, hy - 4, 18, 18, C.suit);
          }

          // HUD
          api.topBar('HOLD STILL: ' + Math.max(0, Math.ceil(this.dur - this.timer)) + 's');
          for (var li = 0; li < 3; li++) {
            c.fillStyle = li < this.lives ? C.crimson : C.dark;
            c.beginPath(); c.arc(W - 36 + li * 14, 8, 4, 0, Math.PI * 2); c.fill();
          }
          api.vignette();
        },
      },

      /* ================================================================
       * 2. SIBYL'S NIGHT
       *    Catch 12 roses at the Lyceum. Dodge programmes. 3 lives.
       * ================================================================ */
      {
        id: 'sibyl',
        name: "SIBYL'S NIGHT",
        sub: 'THE LYCEUM THEATRE',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Curtain panels
          g.rect(x - 16, y - 14, 8, 26, C.curtain);
          g.rect(x + 8, y - 14, 8, 26, C.curtain);
          // Stage platform
          g.rect(x - 8, y + 6, 16, 8, C.dark);
          // Rose bloom
          c.fillStyle = C.scarlet;
          c.beginPath(); c.arc(x, y - 4, 5, 0, Math.PI * 2); c.fill();
          c.fillStyle = C.rose;
          c.beginPath(); c.arc(x - 4, y - 7, 3, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(x + 4, y - 7, 3, 0, Math.PI * 2); c.fill();
          // Stem
          c.strokeStyle = '#284020'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x, y + 1); c.lineTo(x, y + 7); c.stroke();
        },
        intro: [
          'DORIAN ATTENDS THE',
          'LYCEUM THEATRE NIGHTLY.',
          'Sibyl Vane plays Juliet.',
          'Roses rain from the',
          'enchanted audience.',
          'Catch them — for her.',
        ],
        quote: '"She is all the great heroines of the world in one." — Oscar Wilde',
        help: 'DRAG left/right · catch ROSES · dodge programmes!',
        winText: 'Twelve roses caught. Sibyl curtsied, eyes bright with love for Dorian.',
        loseText: 'The programmes flew like insults. The audience had grown cold to Sibyl.',
        init(api) {
          this.bx     = api.W / 2;
          this.lives  = 3;
          this.caught = 0;
          this.need   = 12;
          this.obs    = [];
          this.spawnT = 0;
          this.invT   = 0;
          this.lt     = 0;  // local timer for ramp
        },
        update(api, dt) {
          var W = api.W, H = api.H;
          this.lt += dt;
          if (this.invT > 0) this.invT -= dt;

          // Move basket
          var spd = 178;
          if (api.pointer.down) this.bx = clamp(api.pointer.x, 20, W - 20);
          if (api.keyDown('left'))  this.bx = clamp(this.bx - spd * dt, 20, W - 20);
          if (api.keyDown('right')) this.bx = clamp(this.bx + spd * dt, 20, W - 20);

          // Spawn falling objects
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.55, 1.05 - this.lt * 0.018);
            var isRose = Math.random() < 0.70;
            this.obs.push({
              x:    22 + randI(0, W - 44),
              y:    -18,
              rose: isRose,
              spd:  82 + randI(0, 65),
              rot:  Math.random() * Math.PI * 2,
              rspd: (Math.random() - 0.5) * 4,
            });
          }

          // Move objects
          var bhy = H - 42;
          for (var i = this.obs.length - 1; i >= 0; i--) {
            var o = this.obs[i];
            o.y += o.spd * dt;
            o.rot += o.rspd * dt;
            if (o.y > H + 18) { this.obs.splice(i, 1); continue; }
            if (Math.abs(o.x - this.bx) < 22 && o.y > bhy - 12 && o.y < bhy + 12) {
              if (o.rose) {
                this.caught++;
                api.score += 80;
                api.burst(o.x, bhy, C.scarlet, 8); api.audio.sfx('coin');
                this.obs.splice(i, 1);
                if (this.caught >= this.need) { api.score += 100; api.win(); return; }
              } else if (this.invT <= 0) {
                this.lives--;
                this.invT = 1.2;
                api.shake(5, 0.20); api.flash(C.crimson, 0.13); api.audio.sfx('hurt');
                api.burst(this.bx, bhy, C.grey, 8);
                this.obs.splice(i, 1);
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Stage background — deep burgundy
          c.fillStyle = '#100610'; c.fillRect(0, 0, W, H);
          c.fillStyle = C.dark; c.fillRect(0, 0, W, H - 78);

          // Footlights row
          for (var fl = 0; fl < 9; fl++) {
            var lx = fl * 32 + 12;
            c.globalAlpha = 0.30 + 0.14 * Math.sin(api.t * 3 + fl * 0.9);
            c.fillStyle = C.gilded;
            c.beginPath(); c.arc(lx, H - 78, 10, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          }
          // Stage arch
          c.strokeStyle = C.oldgold; c.lineWidth = 2;
          c.beginPath(); c.arc(W / 2, 0, 106, 0, Math.PI); c.stroke();

          // Curtains
          c.fillStyle = C.curtain; c.fillRect(0, 0, 20, H - 78); c.fillRect(W - 20, 0, 20, H - 78);
          c.strokeStyle = C.rose; c.lineWidth = 1;
          c.strokeRect(0, 0, 20, H - 78); c.strokeRect(W - 20, 0, 20, H - 78);

          // Sibyl performing (silhouette)
          var sy = H - 148 + Math.sin(api.t * 1.9) * 5;
          g.circle(W / 2, sy - 22, 11, C.ivory);
          g.rect(W / 2 - 9, sy - 12, 18, 26, C.plum);
          c.strokeStyle = C.ivory; c.lineWidth = 2;
          c.beginPath(); c.moveTo(W / 2 - 9, sy - 2); c.lineTo(W / 2 - 22, sy - 16); c.stroke();
          c.beginPath(); c.moveTo(W / 2 + 9, sy - 2); c.lineTo(W / 2 + 22, sy - 16); c.stroke();
          // Dress train suggestion
          c.fillStyle = C.plum; c.globalAlpha = 0.7;
          c.beginPath(); c.moveTo(W / 2 - 9, sy + 14); c.lineTo(W / 2 - 22, sy + 32); c.lineTo(W / 2 + 22, sy + 32); c.lineTo(W / 2 + 9, sy + 14); c.closePath(); c.fill();
          c.globalAlpha = 1;

          // Stage floor
          c.fillStyle = C.shadow; c.fillRect(0, H - 78, W, 78);
          c.strokeStyle = C.dark; c.lineWidth = 0.5;
          for (var pi = 0; pi < 8; pi++) {
            c.beginPath(); c.moveTo(pi * 36, H - 78); c.lineTo(pi * 36, H); c.stroke();
          }

          // Falling objects
          this.obs.forEach(function (o) {
            c.save(); c.translate(o.x, o.y); c.rotate(o.rot);
            if (o.rose) {
              c.fillStyle = C.scarlet;
              c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill();
              c.fillStyle = C.rose;
              c.beginPath(); c.arc(-3, -4, 3.5, 0, Math.PI * 2); c.fill();
              c.beginPath(); c.arc(3, -4, 3.5, 0, Math.PI * 2); c.fill();
              c.fillStyle = C.gilded; c.globalAlpha = 0.6;
              c.beginPath(); c.arc(0, 0, 3, 0, Math.PI * 2); c.fill();
              c.globalAlpha = 1;
            } else {
              // Programme — grey pamphlet
              c.fillStyle = C.grey; c.fillRect(-10, -7, 20, 14);
              c.strokeStyle = C.stone; c.lineWidth = 0.5; c.strokeRect(-10, -7, 20, 14);
              c.fillStyle = C.silver; c.globalAlpha = 0.5;
              c.fillRect(-7, -4, 14, 2); c.fillRect(-7, 0, 14, 2);
              c.globalAlpha = 1;
            }
            c.restore();
          });

          // Basket
          var bhy = H - 42;
          g.rect(this.bx - 22, bhy, 44, 26, C.oldgold);
          g.rect(this.bx - 18, bhy + 3, 36, 19, C.tarnish);
          g.rect(this.bx - 22, bhy, 44, 5, C.gold);
          c.strokeStyle = C.oldgold; c.lineWidth = 0.5;
          for (var ki = 0; ki < 5; ki++) {
            c.beginPath(); c.moveTo(this.bx - 14 + ki * 7, bhy + 5); c.lineTo(this.bx - 14 + ki * 7, bhy + 24); c.stroke();
          }

          // HUD
          api.topBar('ROSES: ' + this.caught + ' / ' + this.need);
          for (var li = 0; li < 3; li++) {
            c.fillStyle = li < this.lives ? C.crimson : C.dark;
            c.beginPath(); c.arc(W - 36 + li * 14, 8, 4, 0, Math.PI * 2); c.fill();
          }
          api.vignette();
        },
      },

      /* ================================================================
       * 3. THE YELLOW BOOK
       *    Pages float down. Tap RIGHT half to ACCEPT beauty (gold).
       *    Tap LEFT half to REJECT vice (crimson). 10 correct, 3 misses.
       * ================================================================ */
      {
        id: 'book',
        name: 'THE YELLOW BOOK',
        sub: "LORD HENRY'S GIFT",
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.rect(x - 10, y - 13, 20, 26, C.gilded);
          g.rect(x - 8, y - 11, 16, 22, C.gold);
          g.rect(x - 10, y - 13, 3, 26, C.tarnish);
          for (var i = 0; i < 3; i++) g.rect(x - 5, y - 8 + i * 7, 10, 5, C.parch);
        },
        intro: [
          'LORD HENRY SENDS',
          'DORIAN A YELLOW BOOK.',
          'Its pages intoxicate.',
          'Beautiful ideas mingle',
          'with the darkest',
          'temptation. Choose wisely.',
        ],
        quote: '"Nowadays people know the price of everything and the value of nothing." — Oscar Wilde',
        help: 'TAP RIGHT to ACCEPT beauty · TAP LEFT to REJECT vice!',
        winText: 'Dorian set the book aside. But its poison already sang in his blood.',
        loseText: 'Page after page of corruption. Dorian could no longer tell beauty from sin.',
        init(api) {
          this.correct    = 0;
          this.need       = 10;
          this.mistakes   = 0;
          this.maxMistakes = 3;
          this.page       = null;
          this.pageTimer  = 0;
          this.pageDur    = 2.2;
          this.nextPageT  = 1.0;
          this.goodLabels = ['BEAUTY', 'MUSIC', 'ART', 'POETRY', 'NATURE', 'YOUTH', 'GRACE'];
          this.badLabels  = ['OPIUM', 'VICE', 'EXCESS', 'DECAY', 'RUIN', 'LUST', 'FOLLY'];
        },
        update(api, dt) {
          var W = api.W, H = api.H;
          if (!this.page) {
            this.nextPageT -= dt;
            if (this.nextPageT <= 0) {
              var good = Math.random() < 0.55;
              this.page = {
                good:     good,
                label:    good ? this.goodLabels[randI(0, this.goodLabels.length - 1)]
                               : this.badLabels[randI(0, this.badLabels.length - 1)],
                answered: false,
                result:   false,
              };
              this.pageTimer = this.pageDur;
            }
          } else {
            this.pageTimer -= dt;
            // Input
            var accepted = (api.pointer.justDown && api.pointer.x > W / 2) ||
                           api.keyPressed('right') || api.keyPressed('a');
            var rejected = (api.pointer.justDown && api.pointer.x <= W / 2) ||
                           api.keyPressed('left')  || api.keyPressed('b');
            if (!this.page.answered && (accepted || rejected)) {
              var correct = (accepted && this.page.good) || (rejected && !this.page.good);
              this.page.answered = true;
              this.page.result = correct;
              if (correct) {
                this.correct++;
                api.score += 80;
                api.audio.sfx('coin');
                api.burst(W / 2, H / 2, this.page.good ? C.gilded : C.silver, 6);
              } else {
                this.mistakes++;
                api.shake(4, 0.18); api.flash(C.crimson, 0.12); api.audio.sfx('hurt');
              }
              this.pageTimer = 0.55;
            }
            if (this.pageTimer <= 0) {
              if (!this.page.answered) {
                // Timed out — count as mistake
                this.mistakes++;
                api.shake(3, 0.14); api.audio.sfx('hurt');
              }
              this.page = null;
              this.nextPageT = 0.28;
            }
            if (this.correct >= this.need)  { api.score += 100; api.win();  return; }
            if (this.mistakes >= this.maxMistakes) { api.lose(); return; }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Study walls — wine wallpaper
          c.fillStyle = C.wine; c.fillRect(0, 0, W, H - 38);
          c.globalAlpha = 0.06; c.fillStyle = C.gold;
          for (var i = 0; i < 14; i++) for (var j = 0; j < 18; j++) c.fillRect(i * 20, j * 20, 8, 8);
          c.globalAlpha = 1;
          c.fillStyle = C.dark; c.fillRect(0, H - 38, W, 38);

          // Divider line
          c.strokeStyle = C.stone; c.lineWidth = 1; c.setLineDash([4, 5]);
          c.beginPath(); c.moveTo(W / 2, 22); c.lineTo(W / 2, H - 38); c.stroke();
          c.setLineDash([]);

          // Zone backgrounds
          c.fillStyle = 'rgba(180,0,40,.16)'; c.fillRect(0, 22, W / 2 - 1, H - 60);
          c.fillStyle = 'rgba(180,130,10,.12)'; c.fillRect(W / 2 + 1, 22, W / 2 - 1, H - 60);

          // Zone labels
          api.txtCFit('← REJECT', W / 4, H - 30, 8, C.scarlet, false, W / 2 - 8);
          api.txtCFit('ACCEPT →', 3 * W / 4, H - 30, 8, C.gilded, false, W / 2 - 8);
          api.txtCFit('SIN', W / 4, H - 14, 7, C.rose, false, W / 2 - 8);
          api.txtCFit('BEAUTY', 3 * W / 4, H - 14, 7, C.gold, false, W / 2 - 8);

          // HUD
          api.topBar('CORRECT: ' + this.correct + '/' + this.need + '   WRONG: ' + this.mistakes + '/' + this.maxMistakes);

          if (this.page) {
            var pw = 136, ph = 100;
            var px = W / 2 - pw / 2, py = H / 2 - ph / 2 - 18;

            // Drop shadow
            c.fillStyle = 'rgba(0,0,0,.42)'; c.fillRect(px + 5, py + 5, pw, ph);
            // Page body
            c.fillStyle = this.page.good ? C.parch : C.dark; c.fillRect(px, py, pw, ph);
            // Border
            c.strokeStyle = this.page.good ? C.gold : C.crimson;
            c.lineWidth = 2; c.strokeRect(px, py, pw, ph);
            // Rule line
            c.strokeStyle = this.page.good ? C.tarnish : C.rose; c.lineWidth = 0.5;
            c.beginPath(); c.moveTo(px + 8, py + 18); c.lineTo(px + pw - 8, py + 18); c.stroke();

            // Word
            var lc = this.page.good ? C.dark : C.ivory;
            api.txtCFit(this.page.label, W / 2, py + 28, 16, lc, true, pw - 18);

            // Sub-label
            var sl = this.page.good ? '~ beauty ~' : '~ sin ~';
            api.txtCFit(sl, W / 2, py + 58, 8, this.page.good ? C.oldgold : C.rose, false, pw - 18);

            // Answered feedback or timer bar
            if (this.page.answered) {
              var rc = this.page.result ? C.gleam : C.blood;
              var rl = this.page.result ? '✓ CORRECT' : '✗ WRONG';
              api.txtCFit(rl, W / 2, py + ph - 18, 10, rc, false, pw - 18);
            } else {
              var prog = this.pageTimer / this.pageDur;
              c.fillStyle = C.dark; c.fillRect(px + 8, py + ph - 14, pw - 16, 8);
              c.fillStyle = prog > 0.38 ? C.gold : C.crimson;
              c.fillRect(px + 8, py + ph - 14, (pw - 16) * prog, 8);
            }
          } else {
            api.txtCFit('...', W / 2, H / 2 - 10, 14, C.grey, false, W - 20);
          }
          api.vignette();
        },
      },

      /* ================================================================
       * 4. EAST LONDON
       *    Move left/right; duck into a doorway when Vane's lantern sweeps.
       *    Survive 22 seconds. 3 lives.
       * ================================================================ */
      {
        id: 'eastlondon',
        name: 'EAST LONDON',
        sub: 'JAMES VANE HUNTS',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Lantern body
          g.rect(x - 5, y - 10, 10, 16, C.dark);
          c.strokeStyle = C.tarnish; c.lineWidth = 1; c.strokeRect(x - 5, y - 10, 10, 16);
          // Glow inside
          c.globalAlpha = 0.7; c.fillStyle = C.gilded;
          c.beginPath(); c.arc(x, y - 2, 4, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
          // Cap
          c.fillStyle = C.stone;
          c.beginPath(); c.moveTo(x - 6, y - 10); c.lineTo(x, y - 17); c.lineTo(x + 6, y - 10); c.closePath(); c.fill();
          // Handle hook
          g.rect(x - 1, y - 18, 2, 8, C.tarnish);
        },
        intro: [
          'JAMES VANE HAUNTS',
          'THE EAST END.',
          'He searches for the man',
          'who destroyed Sibyl.',
          'In this fog-soaked dark,',
          'the doorways are your only hope.',
        ],
        quote: '"Behind every exquisite thing that existed, there was something tragic." — Oscar Wilde',
        help: 'DRAG left/right · step into a DOORWAY when the lantern sweeps!',
        winText: 'Vane passed within a foot of Dorian. The shadows held their secret.',
        loseText: 'The lantern found Dorian in the open. Vane\'s eyes met his — and knew.',
        init(api) {
          var W = api.W;
          this.dx    = W / 2;
          this.lives = 3;
          this.timer = 0;
          this.dur   = 22;
          this.invT  = 0;
          // Three fixed doorways
          this.doors = [{ x: 44 }, { x: W / 2 }, { x: W - 44 }];
          // Sweep state machine
          this.phase     = 'wait';
          this.nextSweep = 3.0;
          this.sweepX    = -30;
          this.sweepDir  = 1;
          this.warnDur   = 1.2;
          this.sweepDur  = 1.3;
          this.sweepSpd  = 0;
          this.sweepT    = 0;
          // Fog clouds
          this.fog = [];
          for (var i = 0; i < 10; i++) {
            this.fog.push({ x: Math.random() * W, y: 60 + Math.random() * 320, spd: 8 + Math.random() * 16, r: 24 + Math.random() * 22 });
          }
        },
        update(api, dt) {
          var W = api.W, H = api.H;
          this.timer += dt;
          if (this.invT > 0) this.invT -= dt;
          if (this.timer >= this.dur) { api.score += 120; api.win(); return; }

          // Move Dorian
          var spd = 168;
          if (api.pointer.down) this.dx = clamp(api.pointer.x, 20, W - 20);
          if (api.keyDown('left'))  this.dx = clamp(this.dx - spd * dt, 20, W - 20);
          if (api.keyDown('right')) this.dx = clamp(this.dx + spd * dt, 20, W - 20);

          // Drift fog
          for (var fi = 0; fi < this.fog.length; fi++) {
            this.fog[fi].x = (this.fog[fi].x + this.fog[fi].spd * dt + W) % (W + 50);
          }

          // Sweep state machine
          if (this.phase === 'wait') {
            this.nextSweep -= dt;
            if (this.nextSweep <= 0) {
              this.phase = 'warn';
              this.sweepT = this.warnDur;
            }
          } else if (this.phase === 'warn') {
            this.sweepT -= dt;
            if (this.sweepT <= 0) {
              this.phase = 'sweep';
              this.sweepDir = Math.random() < 0.5 ? 1 : -1;
              this.sweepX = this.sweepDir > 0 ? -32 : W + 32;
              this.sweepSpd = (W + 64) / this.sweepDur;
              this.sweepT = this.sweepDur;
            }
          } else if (this.phase === 'sweep') {
            this.sweepX += this.sweepDir * this.sweepSpd * dt;
            this.sweepT -= dt;

            // Collision: caught in beam?
            if (Math.abs(this.dx - this.sweepX) < 38 && this.invT <= 0) {
              var inDoor = false;
              for (var di = 0; di < this.doors.length; di++) {
                if (Math.abs(this.dx - this.doors[di].x) < 17) { inDoor = true; break; }
              }
              if (!inDoor) {
                this.lives--;
                this.invT = 1.6;
                api.shake(6, 0.24); api.flash(C.gilded, 0.14); api.audio.sfx('hurt');
                api.burst(this.dx, H - 58, C.gilded, 8);
                if (this.lives <= 0) { api.lose(); return; }
              }
            }

            if (this.sweepT <= 0) {
              this.phase = 'wait';
              this.nextSweep = Math.max(1.8, 3.6 - this.timer * 0.065);
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Night sky
          c.fillStyle = C.abyss; c.fillRect(0, 0, W, H);

          // Building silhouettes
          c.fillStyle = C.shadow;
          for (var bi = 0; bi < 8; bi++) {
            var bx = bi * 36, bh = 80 + (bi * 23) % 60;
            c.fillRect(bx, H - 72 - bh, 30, bh);
            c.fillStyle = C.gilded; c.globalAlpha = 0.20;
            for (var wi = 0; wi < 3; wi++) {
              c.fillRect(bx + 4 + wi * 9, H - 72 - bh + 8 + (wi * 13) % 36, 5, 7);
            }
            c.globalAlpha = 1; c.fillStyle = C.shadow;
          }

          // Cobblestone street
          c.fillStyle = C.dark; c.fillRect(0, H - 72, W, 72);
          c.strokeStyle = C.shadow; c.lineWidth = 0.5;
          for (var ci = 0; ci < 10; ci++) {
            for (var cj = 0; cj < 4; cj++) {
              c.strokeRect(ci * 28 - 4, H - 72 + cj * 18, 24, 16);
            }
          }

          // Doorways (arched, safe spots)
          this.doors.forEach(function (d) {
            c.fillStyle = C.void_; c.fillRect(d.x - 14, H - 76, 28, 50);
            c.beginPath(); c.arc(d.x, H - 76, 14, Math.PI, 0); c.fill();
            c.strokeStyle = C.tarnish; c.lineWidth = 2;
            c.beginPath();
            c.moveTo(d.x - 14, H - 26);
            c.lineTo(d.x - 14, H - 76);
            c.arc(d.x, H - 76, 14, Math.PI, 0);
            c.lineTo(d.x + 14, H - 26);
            c.stroke();
            // Faint green safety glow
            c.globalAlpha = 0.12;
            c.fillStyle = '#183820';
            c.beginPath(); c.arc(d.x, H - 52, 20, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          });

          // Warning flash
          if (this.phase === 'warn') {
            var wa = 0.12 + 0.12 * Math.sin(api.t * 20);
            c.fillStyle = C.gilded; c.globalAlpha = wa; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
            api.txtCFit('LANTERN!', W / 2, H / 2 - 32, 13, C.gilded, true, W - 20);
          }

          // Sweeping lantern beam
          if (this.phase === 'sweep') {
            var sx = this.sweepX;
            var lg = c.createRadialGradient(sx, H - 88, 3, sx, H - 88, 88);
            lg.addColorStop(0, 'rgba(255,210,60,.52)');
            lg.addColorStop(0.45, 'rgba(255,200,40,.20)');
            lg.addColorStop(1, 'rgba(255,200,40,0)');
            c.fillStyle = lg; c.fillRect(sx - 90, H - 180, 180, 180);
            g.rect(sx - 7, H - 98, 14, 18, C.dark);
            c.fillStyle = C.gilded; c.globalAlpha = 0.9;
            c.beginPath(); c.arc(sx, H - 89, 6, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          }

          // Fog particles
          c.globalAlpha = 0.11;
          c.fillStyle = C.silver;
          this.fog.forEach(function (fp) {
            c.beginPath(); c.arc(fp.x, fp.y, fp.r, 0, Math.PI * 2); c.fill();
          });
          c.globalAlpha = 1;

          // Dorian (with cloak)
          var hy = H - 56;
          if (this.invT <= 0 || Math.floor(this.invT * 9) % 2 === 0) {
            g.circle(this.dx, hy - 16, 10, C.skin);
            c.fillStyle = C.hair; c.fillRect(this.dx - 8, hy - 27, 16, 10);
            c.beginPath(); c.arc(this.dx, hy - 25, 8, Math.PI, 0); c.fill();
            g.rect(this.dx - 9, hy - 6, 18, 20, C.suit);
            c.fillStyle = C.dark; c.globalAlpha = 0.8;
            c.beginPath();
            c.moveTo(this.dx - 11, hy - 4);
            c.lineTo(this.dx - 16, hy + 16);
            c.lineTo(this.dx + 16, hy + 16);
            c.lineTo(this.dx + 11, hy - 4);
            c.closePath(); c.fill();
            c.globalAlpha = 1;
          }

          // HUD
          api.topBar('SURVIVE: ' + Math.max(0, Math.ceil(this.dur - this.timer)) + 's');
          for (var li = 0; li < 3; li++) {
            c.fillStyle = li < this.lives ? C.scarlet : C.dark;
            c.beginPath(); c.arc(W - 36 + li * 14, 8, 4, 0, Math.PI * 2); c.fill();
          }
          api.vignette();
        },
      },

      /* ================================================================
       * 5. THE LOCKED ROOM
       *    A ring contracts toward the portrait's centre.
       *    TAP when it reaches the target to strike.
       *    6 strikes to destroy the portrait. 3 misses = lose.
       * ================================================================ */
      {
        id: 'lockedroom',
        name: 'THE LOCKED ROOM',
        sub: 'THE PORTRAIT AT LAST',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Frame
          c.strokeStyle = C.oldgold; c.lineWidth = 2;
          c.strokeRect(x - 10, y - 13, 20, 26);
          // Decay cracks
          c.strokeStyle = C.crimson; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x - 4, y - 4); c.lineTo(x + 8, y + 6); c.stroke();
          c.beginPath(); c.moveTo(x + 2, y - 10); c.lineTo(x - 6, y + 4); c.stroke();
          // Knife
          c.fillStyle = C.silver; c.fillRect(x + 4, y - 2, 12, 3);
          c.fillStyle = C.ivory; c.fillRect(x + 4, y - 2, 4, 3);
        },
        intro: [
          'DORIAN UNLOCKS',
          'THE ATTIC ROOM.',
          'The portrait stares back',
          '— his rotted soul laid bare.',
          'He raises the knife.',
          'Time the strike exactly.',
        ],
        quote: '"It is the confession, not the priest, that gives us absolution." — Oscar Wilde',
        help: 'TAP when the RING reaches the centre to strike!',
        winText: 'The knife found its mark. The portrait cried out — and was still forever.',
        loseText: 'The knife wavered. The portrait leered. Dorian could not end it.',
        init(api) {
          var W = api.W, H = api.H;
          this.cx      = W / 2;
          this.cy      = H / 2 - 18;
          this.strikes = 0;
          this.need    = 6;
          this.misses  = 0;
          this.maxMisses = 3;
          this.phase   = 'idle';
          this.ringR   = 110;
          this.targetR = 22;
          this.shrinkSpd = 60;
          this.resultT = 0;
          this.cracks  = [];
          this.pulseT  = 0;
          this.phaseT  = 0.9;
        },
        update(api, dt) {
          this.pulseT += dt;
          if (this.phase === 'idle') {
            this.phaseT -= dt;
            if (this.phaseT <= 0) {
              this.phase = 'contracting';
              this.shrinkSpd = 58 + this.strikes * 12;
              this.ringR = 110;
            }
          } else if (this.phase === 'contracting') {
            this.ringR -= this.shrinkSpd * dt;
            var pressed = api.pointer.justDown || api.keyPressed('a') || api.keyPressed('start') || api.keyPressed('b');
            if (pressed) {
              var dist = Math.abs(this.ringR - this.targetR);
              if (dist < 20) {
                // Hit!
                this.strikes++;
                api.score += 120;
                api.audio.sfx('power');
                api.shake(5, 0.20);
                api.flash(C.scarlet, 0.12);
                api.burst(this.cx, this.cy, C.blood, 10);
                var ang = Math.random() * Math.PI * 2;
                this.cracks.push({ angle: ang, len: 22 + Math.random() * 44 });
                this.phase = 'result_hit'; this.resultT = 0.5;
                if (this.strikes >= this.need) { api.score += 150; api.win(); return; }
              } else {
                // Miss
                this.misses++;
                api.audio.sfx('hurt'); api.shake(4, 0.16);
                this.phase = 'result_miss'; this.resultT = 0.5;
                if (this.misses >= this.maxMisses) { api.lose(); return; }
              }
            }
            // Ring passed target — auto-miss
            if (this.ringR < this.targetR - 20) {
              this.misses++;
              api.audio.sfx('hurt'); api.shake(3, 0.14);
              this.phase = 'result_miss'; this.resultT = 0.5;
              if (this.misses >= this.maxMisses) { api.lose(); return; }
            }
          } else {
            this.resultT -= dt;
            if (this.resultT <= 0) { this.phase = 'idle'; this.phaseT = 0.75; }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          var cx = this.cx, cy = this.cy;

          // Attic
          c.fillStyle = C.abyss; c.fillRect(0, 0, W, H);
          c.fillStyle = C.shadow;
          for (var ai = 0; ai < 9; ai++) { c.fillRect(0, ai * 14, W, 12); }

          // Floor
          c.fillStyle = C.dark; c.fillRect(0, H - 42, W, 42);
          c.strokeStyle = C.shadow; c.lineWidth = 0.4;
          for (var fi = 0; fi < 7; fi++) {
            c.beginPath(); c.moveTo(fi * 42, H - 42); c.lineTo(fi * 42, H); c.stroke();
          }

          // The portrait (large)
          var pw = 130, ph = 162;
          var px = cx - pw / 2, py = cy - ph / 2;
          c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(px + 6, py + 6, pw, ph);
          c.fillStyle = C.tarnish; c.fillRect(px - 10, py - 10, pw + 20, ph + 20);
          c.strokeStyle = C.oldgold; c.lineWidth = 3; c.strokeRect(px - 10, py - 10, pw + 20, ph + 20);
          c.strokeStyle = C.gold;   c.lineWidth = 1; c.strokeRect(px - 6,  py - 6,  pw + 12, ph + 12);
          c.fillStyle = '#1a0c0a'; c.fillRect(px, py, pw, ph);
          // Rotted face
          c.fillStyle = C.skin; c.globalAlpha = 0.22;
          c.beginPath(); c.arc(cx, py + 46, 24, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
          c.fillStyle = C.crimson; c.globalAlpha = 0.6 + 0.3 * Math.sin(this.pulseT * 3.2);
          c.beginPath(); c.arc(cx - 9, py + 40, 5, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(cx + 9, py + 40, 5, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          c.fillStyle = C.crimson; c.globalAlpha = 0.28 + 0.12 * Math.sin(this.pulseT * 2.1);
          c.fillRect(px, py + ph - 58, pw, 58); c.globalAlpha = 1;

          // Cracks from prior strikes
          var cx_ = cx, cy_ = py + 50;
          this.cracks.forEach(function (cr) {
            c.strokeStyle = C.blood; c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(cx_, cy_);
            c.lineTo(cx_ + Math.cos(cr.angle) * cr.len, cy_ + Math.sin(cr.angle) * cr.len);
            c.stroke();
            c.lineWidth = 0.8;
            c.beginPath();
            c.moveTo(cx_ + Math.cos(cr.angle) * cr.len * 0.5, cy_ + Math.sin(cr.angle) * cr.len * 0.5);
            c.lineTo(cx_ + Math.cos(cr.angle + 0.6) * cr.len * 0.38, cy_ + Math.sin(cr.angle + 0.6) * cr.len * 0.38);
            c.stroke();
          });

          // Contracting ring
          if (this.phase === 'contracting') {
            var rp = 1 - Math.max(0, (this.ringR - this.targetR)) / (110 - this.targetR);
            var danger = rp > 0.82;
            c.strokeStyle = danger ? C.blood : C.gilded;
            c.lineWidth = 2.5; c.globalAlpha = 0.82;
            c.beginPath(); c.arc(cx, cy, this.ringR, 0, Math.PI * 2); c.stroke();
            c.strokeStyle = danger ? C.scarlet : C.gleam;
            c.lineWidth = 1; c.globalAlpha = 0.35;
            c.beginPath(); c.arc(cx, cy, this.ringR + 5, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }

          // Target ring (always shown)
          c.strokeStyle = C.gleam; c.lineWidth = 2;
          c.globalAlpha = 0.65 + 0.32 * Math.sin(this.pulseT * 4.2);
          c.beginPath(); c.arc(cx, cy, this.targetR, 0, Math.PI * 2); c.stroke();
          c.fillStyle = C.gleam; c.globalAlpha = 0.45;
          c.beginPath(); c.arc(cx, cy, 6, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;

          // Action prompt
          if (this.phase === 'contracting') {
            api.txtCFit('TAP!', cx, cy + ph / 2 + 14, 11, C.gleam, true, 80);
          } else if (this.phase === 'result_hit') {
            api.txtCFit('STRIKE!', cx, cy + ph / 2 + 14, 11, C.blood, true, 100);
          } else if (this.phase === 'result_miss') {
            api.txtCFit('MISS', cx, cy + ph / 2 + 14, 11, C.grey, true, 100);
          }

          // HUD
          api.topBar('STRIKES: ' + this.strikes + '/' + this.need + '   MISSES: ' + this.misses + '/' + this.maxMisses);
          api.vignette();
        },
      },
    ],
  });
})();
