/* ============================================================================
 * KING KONG — THE EIGHTH WONDER
 * Five scenes from the 1932 novelization:
 *   1. SKULL ISLAND   — dodge falling debris and jungle dangers (survive 22s)
 *   2. THE GREAT LOG  — position Kong away from prehistoric jaw snaps (20s)
 *   3. CHAINS         — timing meter, break 5 Broadway chains to escape
 *   4. NYC RAMPAGE    — dodge biplane bombs raining down (22s runner)
 *   5. KING OF THE SKY — swat orbiting biplanes from atop the Empire State
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;
  const rand  = Retro.util.rand;
  const randI = Retro.util.randInt;

  const C = {
    bg: '#080604', bg2: '#100c06',
    fur: '#3a2410', furL: '#5a3c1c', furD: '#241408',
    amber: '#c87820', amberL: '#e8a840', amberD: '#7a4c10',
    cream: '#f0e8d0', sepia: '#8a6a30',
    red: '#cc2020', redL: '#e83030',
    stone: '#3a3228', grey: '#504840', greyL: '#706858',
    green: '#1a4010', greenL: '#2a6018',
  };

  /* ─── Emblem: Kong silhouette atop spire, biplane circling ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // Spire
    g.rect(cx - 2, cy - 34, 4, 22, C.grey);
    g.rect(cx - 1, cy - 38, 2, 6, C.greyL);
    // Body
    g.rect(cx - 10, cy - 20, 20, 16, C.fur);
    // Arms spread wide (heroic pose)
    g.rect(cx - 22, cy - 16, 12, 5, C.fur);
    g.rect(cx + 10, cy - 16, 12, 5, C.fur);
    // Head
    g.circle(cx, cy - 25, 8, C.fur);
    g.circle(cx - 3, cy - 27, 2, C.cream);
    g.circle(cx + 3, cy - 27, 2, C.cream);
    // Tiny biplane
    g.rect(cx + 22, cy - 36, 12, 3, C.red);
    g.rect(cx + 26, cy - 39, 4, 4, C.red);
    g.rect(cx + 22, cy - 33, 12, 2, '#aa1818');
  }

  /* ─── Scenery: noir NYC night sky with ESB silhouette ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Art-deco 1930s poster: warm dark gradient + film perforations
      const grad = c.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1a0e04');
      grad.addColorStop(0.5, '#0a0804');
      grad.addColorStop(1, '#04060a');
      c.fillStyle = grad; c.fillRect(0, 0, W, H);
      // Film perforations on edges
      c.fillStyle = '#241c10';
      for (let i = 0; i < 22; i++) {
        c.fillRect(2,       i * 24 + 2, 10, 14);
        c.fillRect(W - 12,  i * 24 + 2, 10, 14);
      }
      return;
    }

    // Default: noir night sky
    const sky = c.createLinearGradient(0, 0, 0, H * 0.7);
    sky.addColorStop(0, '#020308');
    sky.addColorStop(0.6, '#060808');
    sky.addColorStop(1, '#0a0c0e');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 32; i++) {
      const sx = (i * 71 + 13) % W, sy = (i * 43 + 7) % Math.floor(H * 0.50);
      c.globalAlpha = 0.12 + 0.18 * Math.sin(t * 1.5 + i);
      g.rect(sx, sy, 1, 1, C.cream);
    }
    c.globalAlpha = 1;

    // Empire State Building silhouette (center)
    const bH = Math.floor(H * 0.52), bW = 38, bX = Math.floor(W / 2 - bW / 2);
    c.fillStyle = '#0a0c10';
    c.fillRect(bX, H - bH, bW, bH);
    c.fillRect(bX + 5,  H - bH - 18, bW - 10, 18);
    c.fillRect(bX + 10, H - bH - 32, bW - 20, 16);
    c.fillRect(bX + 14, H - bH - 44, bW - 28, 14);
    // Spire
    c.fillRect(bX + 17, H - bH - 76, 4, 34);
    // Windows (amber flicker)
    c.globalAlpha = 0.35 + 0.1 * Math.sin(t * 0.9);
    for (let r = 0; r < 5; r++) {
      for (let col = 0; col < 3; col++) {
        c.fillStyle = C.amber;
        c.fillRect(bX + 4 + col * 11, H - bH + 6 + r * 14, 7, 8);
      }
    }
    c.globalAlpha = 1;

    // City skyline (flanking buildings)
    const skyline = [[0,44],[22,60],[50,38],[84,52],[164,46],[192,64],[226,40],[248,55]];
    c.fillStyle = '#060708';
    for (const [bx, bht] of skyline) {
      c.fillRect(bx, H - bht, 20, bht);
      c.globalAlpha = 0.25;
      c.fillStyle = C.amber;
      for (let wr = 0; wr < 2; wr++) {
        if ((bx + wr * 13) % 3 !== 0) c.fillRect(bx + 3, H - bht + 5 + wr * 12, 5, 6);
      }
      c.globalAlpha = 1;
      c.fillStyle = '#060708';
    }

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(4,3,2,.75)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Menu: staggered film-frame layout (zigzag) ─── */
  const menu = {
    title(api) {
      const W = api.W, c = api.ctx;
      c.fillStyle = '#180e04';
      c.fillRect(16, 8, W - 32, 54);
      c.strokeStyle = C.amberL; c.lineWidth = 2;
      c.strokeRect(18, 10, W - 36, 50);
      api.txtCFit('KING KONG', W / 2, 20, 13, C.amberL, true);
      api.txtCFit('EIGHTH WONDER OF THE WORLD', W / 2, 42, 6, C.sepia);
    },
    layout() {
      // Zigzag: odd chapters lean left, even lean right
      return [
        { x: 14,  y: 72,  w: 116, h: 68 },
        { x: 140, y: 152, w: 116, h: 68 },
        { x: 14,  y: 232, w: 116, h: 68 },
        { x: 140, y: 312, w: 116, h: 68 },
        { x: 14,  y: 392, w: 116, h: 68 },
      ];
    },
    card(api, info) {
      const g = api.gfx, c = api.ctx;
      const { ch, i, x, y, w, h, sel, done } = info;
      // Film-frame background
      c.fillStyle = done ? '#201808' : (sel ? '#281e0a' : '#140e04');
      c.fillRect(x, y, w, h);
      c.strokeStyle = done ? C.amberL : (sel ? C.amber : C.amberD);
      c.lineWidth = sel ? 2 : 1;
      c.strokeRect(x, y, w, h);
      // Sprocket holes top + bottom
      c.fillStyle = done ? C.amberL : (sel ? C.amber : C.amberD);
      for (let p = 0; p < 4; p++) {
        c.fillRect(x + 4 + p * 26, y + 2,     20, 6);
        c.fillRect(x + 4 + p * 26, y + h - 8, 20, 6);
      }
      // Frame number
      api.txt('' + (i + 1), x + 7, y + 14, 8, C.amber, true);
      // Chapter icon
      if (ch.icon) ch.icon(api, x + w - 18, y + 20);
      // Name + sub
      api.txtCFit(ch.name, x + w / 2, y + 32, 7, sel ? C.cream : C.amberL, false, w - 18);
      api.txtCFit(ch.sub,  x + w / 2, y + 46, 5, C.sepia,                  false, w - 18);
      // Done star
      if (done) api.txtC('★', x + w - 12, y + h - 14, 9, C.amberL);
      // Selection inner glow
      if (sel) {
        c.strokeStyle = C.amberL; c.lineWidth = 1; c.globalAlpha = 0.3;
        c.strokeRect(x + 2, y + 2, w - 4, h - 4);
        c.globalAlpha = 1;
      }
    },
  };

  /* ========================================================================
   *  Chapter helpers
   * ======================================================================== */

  function drawKong(g, cx, cy, flash) {
    if (flash) return;
    g.rect(cx - 11, cy - 20, 22, 22, C.fur);
    g.circle(cx, cy - 26, 9, C.fur);
    g.rect(cx - 20, cy - 14, 10, 6, C.fur);
    g.rect(cx + 10, cy - 14, 10, 6, C.fur);
    g.circle(cx - 3, cy - 28, 2, C.cream);
    g.circle(cx + 3, cy - 28, 2, C.cream);
  }

  /* ========================================================================
   *  RetroSaga.create
   * ======================================================================== */
  RetroSaga.create({
    id: 'kingkong',
    title: 'King Kong',
    subtitle: 'THE EIGHTH WONDER',
    currency: 'SCREAMS',
    screens: {
      win:          '#e8a840',
      lose:         '#e83030',
      chapterLabel: '#8a6a30',
      name:         '#f0e8d0',
      sub:          '#c87820',
      intro:        '#d8c8a0',
      quote:        '#8a7a50',
      help:         '#c87820',
      score:        '#e0d0a0',
      cur:          '#e8a840',
      cta:          '#f0e8d0',
      overlay:      'rgba(4,3,2,.85)',
    },
    labels: {
      chapter: 'SCENE',
      score:   'SCREAMS',
      win:     'THE CROWD ROARS',
      lose:    'THE SHOW IS OVER',
      cont:    'TAP TO PRESS ON',
      finale:  'TAP FOR THE FINALE',
      toMenu:  'TAP TO RETURN',
      play:    'TAP TO BEGIN',
    },
    accent:    '#c87820',
    credit:    'AN 8-BIT TRIBUTE · KING KONG (1933)',
    emblem,
    scenery,
    bootCta:   'TAP TO CLIMB',
    menuLabel: 'SCENES',
    menuHint:  'CHOOSE YOUR SCENE',
    menuDone:  'KONG RESTS IN PEACE',
    menu,
    finale: [
      'THE LAST BIPLANE',
      'SPIRALS DOWN.',
      '',
      'FROM THE HIGHEST PEAK',
      'IN ALL THE WORLD,',
      'KONG BEATS HIS CHEST',
      'AND ROARS.',
      '',
      '"T\'WAS BEAUTY',
      'KILLED THE BEAST."',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ================================================================
       *  1. SKULL ISLAND  — dodge falling debris, survive 22 seconds
       * ================================================================ */
      {
        id: 'skulls', name: 'SKULL ISLAND', sub: 'SURVIVE THE JUNGLE',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 7, '#3a2010');
          g.circle(x - 2, y - 2, 2, C.cream);
          g.circle(x + 2, y - 2, 2, C.cream);
          g.rect(x - 3, y + 1, 6, 3, C.cream);
        },
        intro: [
          'THE VENTURE DROPS ANCHOR',
          'OFF SKULL ISLAND.',
          'ANCIENT DANGERS',
          'rule the jungle.',
        ],
        quote: 'It was like looking at the skull of some monstrous beast bleached white by the tropic sun.',
        help: 'TAP LEFT / RIGHT to dodge · arrow keys',
        winText: 'You emerge from the shadow. The great wall looms ahead.',
        loseText: 'The jungle swallows you whole.',
        init(api) {
          this.x     = api.W / 2;
          this.timer = 22;
          this.lives = 3;
          this.debris  = [];
          this.spawnT  = 1.0;
          this.speed   = 2.6;
          this.invT    = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          if (this.timer <= 0) { api.addScore(80); api.win(); return; }
          this.speed = Math.min(5.2, this.speed + dt * 0.07);

          // Steer
          const p = api.pointer;
          if (p.down) this.x += (p.x < api.W / 2 ? -1 : 1) * 4.5 * f;
          if (api.keyDown('left'))  this.x -= 4.2 * f;
          if (api.keyDown('right')) this.x += 4.2 * f;
          this.x = clamp(this.x, 18, api.W - 18);

          // Spawn debris
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            const elapsed = 22 - this.timer;
            this.spawnT = Math.max(0.32, 0.95 - elapsed * 0.024);
            const kind = Math.random() < 0.38 ? 'skull' : 'rock';
            this.debris.push({
              x: 20 + Math.random() * (api.W - 40),
              y: -16,
              vy: this.speed * (kind === 'skull' ? 0.9 : 1.2),
              kind,
            });
          }
          for (const d of this.debris) d.y += d.vy * f;
          this.debris = this.debris.filter(d => d.y < api.H + 20);

          if (this.invT > 0) { this.invT -= dt; return; }

          // Collision
          const py = api.H - 46;
          for (const d of this.debris) {
            if (Math.abs(d.x - this.x) < 20 && Math.abs(d.y - py) < 20) {
              this.lives--;
              this.invT = 1.2;
              api.shake(5, 0.3); api.flash('#cc0000', 0.2);
              api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
              break;
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          // Dense jungle
          c.fillStyle = '#04080a'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#0a1606'; c.fillRect(0, H - 30, W, 30);
          // Hanging vines
          for (let i = 0; i < 6; i++) {
            const vx = i * 48 + 8;
            c.strokeStyle = '#162a0a'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(vx, 0);
            for (let vy = 0; vy < H - 30; vy += 12) {
              c.lineTo(vx + Math.sin(api.t * 0.4 + i + vy * 0.04) * 7, vy);
            }
            c.stroke();
          }
          // Debris
          for (const d of this.debris) {
            if (d.kind === 'skull') {
              g.circle(d.x, d.y, 8, C.cream);
              g.rect(d.x - 4, d.y + 1, 9, 4, C.cream);
              g.circle(d.x - 2, d.y - 3, 2, C.stone);
              g.circle(d.x + 2, d.y - 3, 2, C.stone);
            } else {
              g.rect(d.x - 7, d.y - 7, 14, 14, C.stone);
              g.rect(d.x - 5, d.y - 5, 10, 10, C.grey);
            }
          }
          // Kong
          const py = H - 46;
          const flash = this.invT > 0 && Math.sin(api.t * 20) > 0;
          drawKong(g, this.x, py, flash);

          // HUD
          api.topBar('SKULL ISLAND');
          for (let i = 0; i < 3; i++) g.circle(16 + i * 14, 20, 5, i < this.lives ? C.amber : '#2a2018');
          api.txt(Math.ceil(this.timer) + 's', W - 38, 20, 9, C.cream);
          api.vignette(); api.scanlines();
        },
      },

      /* ================================================================
       *  2. THE GREAT LOG  — dodge left/right away from prehistoric jaws
       * ================================================================ */
      {
        id: 'log', name: 'THE GREAT LOG', sub: 'DODGE THE JAWS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 9, y - 2, 18, 5, '#5a3010');
          g.rect(x + 4, y - 7, 8, 5, C.greenL);
          g.rect(x + 4, y + 4, 8, 4, C.greenL);
        },
        intro: [
          'AT THE GREAT LOG,',
          'PREHISTORIC BEASTS',
          'STRIKE FROM BELOW.',
          'move to the safe side.',
        ],
        quote: 'From the darkness came the first brontosaur, and then another, and the log began to shake.',
        help: 'TAP LEFT or RIGHT to move Kong to that side · arrow keys',
        winText: 'The creatures retreat. Only Kong commands this jungle.',
        loseText: 'The ancient beast claims another soul.',
        init(api) {
          this.kongSide = 'right';
          this.timer    = 20;
          this.lives    = 3;
          this.jaw      = null;
          this.nextJaw  = 1.4;
          this.invT     = 0;
        },
        update(api, dt) {
          this.timer -= dt;
          if (this.timer <= 0) { api.addScore(80); api.win(); return; }

          // Reposition Kong (tap/key to move to that side)
          const p = api.pointer;
          if (p.justDown) {
            this.kongSide = p.x < api.W / 2 ? 'left' : 'right';
          }
          if (api.keyPressed('left'))  this.kongSide = 'left';
          if (api.keyPressed('right')) this.kongSide = 'right';

          // Spawn jaw
          this.nextJaw -= dt;
          if (!this.jaw && this.nextJaw <= 0) {
            const elapsed = 20 - this.timer;
            this.nextJaw = Math.max(0.6, 1.3 - elapsed * 0.03);
            this.jaw = {
              side:    Math.random() < 0.5 ? 'left' : 'right',
              t:       0,
              dur:     0.85,
              checked: false,
            };
            api.audio.sfx('blip');
          }
          if (this.jaw) {
            this.jaw.t += dt;
            // Check bite at peak of animation
            if (!this.jaw.checked && this.jaw.t >= this.jaw.dur * 0.48) {
              this.jaw.checked = true;
              if (this.invT <= 0 && this.jaw.side === this.kongSide) {
                this.lives--;
                this.invT = 1.1;
                api.shake(5, 0.3); api.flash('#cc0000', 0.2);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              } else if (this.jaw.side !== this.kongSide) {
                api.audio.sfx('coin');
              }
            }
            if (this.jaw.t >= this.jaw.dur) this.jaw = null;
          }
          if (this.invT > 0) this.invT -= dt;
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          // Pit + jungle
          c.fillStyle = '#040806'; c.fillRect(0, 0, W, H);
          // Pit bottom (darkness below log)
          c.fillStyle = '#020302'; c.fillRect(0, H - 110, W, 110);
          // The log
          const logY = H - 82;
          g.rect(4, logY, W - 8, 14, '#5a3010');
          g.rect(4, logY + 4, W - 8, 5, '#3a2008');
          // Bark rings
          for (let r = 0; r < 5; r++) {
            g.rect(24 + r * 44, logY, 4, 14, '#3a2008');
          }

          // Jaw animation
          if (this.jaw) {
            const phase = Math.sin((this.jaw.t / this.jaw.dur) * Math.PI);
            const extend = Math.round(phase * 44);
            if (this.jaw.side === 'left') {
              g.rect(0, logY + 15, extend, 24, C.greenL);
              g.rect(0, logY + 39, extend, 10, C.green);
              for (let t = 0; t < 4; t++) {
                g.rect(extend - 10 + t * 5, logY + 19, 3, 6, C.cream);
              }
            } else {
              g.rect(W - extend, logY + 15, extend, 24, C.greenL);
              g.rect(W - extend, logY + 39, extend, 10, C.green);
              for (let t = 0; t < 4; t++) {
                g.rect(W - extend + t * 5, logY + 19, 3, 6, C.cream);
              }
            }
            // Warning indicator: glow on jaw side at top of screen
            if (!this.jaw.checked) {
              const wx = this.jaw.side === 'left' ? 30 : W - 30;
              c.globalAlpha = 0.6 * Math.sin((this.jaw.t / this.jaw.dur) * Math.PI);
              g.rect(this.jaw.side === 'left' ? 0 : W / 2, 0, W / 2, H, '#cc0000');
              c.globalAlpha = 1;
              api.txtC('!', wx, 36, 14, C.red, true);
            }
          }

          // Kong on the log
          const kongX = this.kongSide === 'left' ? W * 0.27 : W * 0.73;
          const flash = this.invT > 0 && Math.sin(api.t * 20) > 0;
          drawKong(g, kongX, logY - 10, flash);
          // Side indicator arrow
          if (!flash) {
            api.txtC(this.kongSide === 'left' ? '←' : '→', kongX, logY - 42, 9, C.amberL);
          }

          // HUD
          api.topBar('THE GREAT LOG');
          for (let i = 0; i < 3; i++) g.circle(16 + i * 14, 20, 5, i < this.lives ? C.amber : '#2a2018');
          api.txt(Math.ceil(this.timer) + 's', W - 38, 20, 9, C.cream);
          api.vignette(); api.scanlines();
        },
      },

      /* ================================================================
       *  3. CHAINS OF BROADWAY  — timing meter, break 5 chains
       * ================================================================ */
      {
        id: 'chains', name: 'CHAINS', sub: 'BREAK FREE',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 3, y - 10, 6, 20, C.grey);
          for (let j = 0; j < 4; j++) g.rect(x - 5, y - 9 + j * 5, 10, 3, C.greyL);
        },
        intro: [
          '"LADIES AND GENTLEMEN,"',
          'CRIES THE SHOWMAN,',
          '"THE EIGHTH WONDER',
          'OF THE WORLD!"',
        ],
        quote: '"Ladies and gentlemen, I give you Kong — the Eighth Wonder of the World!"',
        help: 'TAP when the meter hits the GREEN zone to break the chain',
        winText: 'The chains snap! The crowd screams! Kong is FREE!',
        loseText: 'The showmen drag the chains tight again.',
        init(api) {
          this.chain   = 0;
          this.need    = 5;
          this.pos     = 0;
          this.dir     = 1;
          this.spd     = 0.82;
          this.band    = 0.19;
          this.snap    = false;
          this.snapT   = 0;
          this.misses  = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          if (this.snap) {
            this.snapT -= dt;
            if (this.snapT <= 0) {
              this.snap = false;
              if (this.chain >= this.need) { api.addScore(80); api.win(); }
            }
            return;
          }
          this.pos += this.dir * this.spd * 0.03 * f;
          if (this.pos > 1) { this.pos = 1; this.dir = -1; }
          if (this.pos < 0) { this.pos = 0; this.dir =  1; }

          if (api.confirm()) {
            if (Math.abs(this.pos - 0.5) < this.band) {
              this.chain++;
              api.addScore(30);
              api.audio.sfx('power');
              api.shake(6, 0.3);
              api.burst(api.W / 2, api.H * 0.4, C.amberL, 14);
              this.spd  = Math.min(2.4, this.spd  + 0.20);
              this.band = Math.max(0.09, this.band - 0.015);
              this.snap = true; this.snapT = 0.4;
            } else {
              this.misses++;
              api.audio.sfx('hurt');
              api.shake(2, 0.12);
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          // Stage
          c.fillStyle = '#0a0806'; c.fillRect(0, 0, W, H);
          // Curtains
          c.fillStyle = '#3a0808'; c.fillRect(0, 0, 30, H); c.fillRect(W - 30, 0, 30, H);
          // Stage boards
          c.fillStyle = '#1a1208'; c.fillRect(0, H - 52, W, 52);
          for (let b = 0; b < W; b += 18) {
            c.strokeStyle = '#120c04'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(b, H - 52); c.lineTo(b, H); c.stroke();
          }
          // Footlights
          c.globalAlpha = 0.28 + 0.06 * Math.sin(api.t * 4.5);
          for (let i = 0; i < 5; i++) {
            c.fillStyle = '#ffe8c0';
            c.beginPath(); c.arc(28 + i * 44, H - 52, 13, 0, Math.PI * 2); c.fill();
          }
          c.globalAlpha = 1;

          // Kong in chains
          const kx = W / 2, ky = H * 0.4;
          g.rect(kx - 14, ky - 22, 28, 26, C.fur);
          g.circle(kx, ky - 28, 10, C.fur);
          g.circle(kx - 4, ky - 31, 2, C.cream);
          g.circle(kx + 4, ky - 31, 2, C.cream);
          // Arms stretched
          g.rect(kx - 28, ky - 18, 15, 6, C.fur);
          g.rect(kx + 13, ky - 18, 15, 6, C.fur);

          // Remaining chains
          const remaining = this.need - this.chain;
          for (let i = 0; i < remaining; i++) {
            const cx2 = 36 + i * 44, cy2 = ky - 20;
            g.rect(cx2, cy2, 8, 30, C.grey);
            for (let j = 0; j < 5; j++) g.rect(cx2 - 2, cy2 + j * 6, 12, 3, C.greyL);
          }
          // Just-snapped flash
          if (this.snap) {
            c.globalAlpha = 0.5;
            c.fillStyle = C.amberL;
            c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }

          // Meter bar
          const mw = W - 50, mx = 25;
          g.rect(mx, H - 54, mw, 14, '#1e1208');
          g.rect(mx + mw * (0.5 - this.band), H - 54, mw * this.band * 2, 14, 'rgba(93,255,143,.30)');
          g.rect(mx, H - 54, Math.round(mw * this.pos), 14, this.snap ? C.amberL : C.amber);
          g.rect(mx + mw * 0.5 - 1, H - 58, 2, 22, '#5dff8f');

          api.topBar('CHAINS OF BROADWAY');
          api.txt('CHAIN ' + this.chain + '/' + this.need, 6, 20, 8, C.amberL, true);
          if (this.misses > 0) api.txt('MISS ' + this.misses, W - 72, 20, 7, C.red);
          api.vignette(); api.scanlines();
        },
      },

      /* ================================================================
       *  4. NYC RAMPAGE  — dodge biplane bombs, survive 22 seconds
       * ================================================================ */
      {
        id: 'rampage', name: 'NYC RAMPAGE', sub: 'DODGE THE BOMBS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 9, y - 2, 18, 4, C.red);
          g.rect(x - 5, y - 5, 10, 4, C.red);
          g.circle(x + 12, y, 2, C.amberL);
        },
        intro: [
          'KONG BREAKS FREE',
          'AND RAMPAGES THROUGH',
          'NEW YORK CITY.',
          'biplanes strafe from above.',
        ],
        quote: 'He beat his chest and screamed, his roar rolling through the concrete canyons like thunder.',
        help: 'TAP LEFT / RIGHT to dodge biplane bombs · arrow keys',
        winText: 'Kong shakes off the city\'s finest. The towers shudder.',
        loseText: 'The bombs find their mark.',
        init(api) {
          this.x       = api.W / 2;
          this.timer   = 22;
          this.lives   = 3;
          this.bombs   = [];
          this.planes  = [];
          this.spawnB  = 0.95;
          this.spawnP  = 2.2;
          this.invT    = 0;
          this.scrollY = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          if (this.timer <= 0) { api.addScore(80); api.win(); return; }

          this.scrollY += 3.0 * f;

          // Steer
          const p = api.pointer;
          if (p.down) this.x += (p.x < api.W / 2 ? -1 : 1) * 4.6 * f;
          if (api.keyDown('left'))  this.x -= 4.2 * f;
          if (api.keyDown('right')) this.x += 4.2 * f;
          this.x = clamp(this.x, 18, api.W - 18);

          // Spawn planes
          this.spawnP -= dt;
          if (this.spawnP <= 0) {
            const elapsed = 22 - this.timer;
            this.spawnP = Math.max(1.1, 2.1 - elapsed * 0.04);
            const side = Math.random() < 0.5 ? -1 : 1;
            this.planes.push({
              x: side < 0 ? -32 : api.W + 32,
              y: 50 + Math.random() * 90,
              vx: side * (3.0 + elapsed * 0.05),
            });
          }
          for (const pl of this.planes) pl.x += pl.vx * f;
          this.planes = this.planes.filter(pl => pl.x > -70 && pl.x < api.W + 70);

          // Spawn bombs
          this.spawnB -= dt;
          if (this.spawnB <= 0) {
            const elapsed = 22 - this.timer;
            this.spawnB = Math.max(0.48, 0.90 - elapsed * 0.018);
            this.bombs.push({ x: 20 + Math.random() * (api.W - 40), y: 50, vy: 3.0 + elapsed * 0.04 });
          }
          for (const b of this.bombs) b.y += b.vy * f;
          this.bombs = this.bombs.filter(b => b.y < api.H + 20);

          if (this.invT > 0) { this.invT -= dt; return; }

          // Collision
          const py = api.H - 58;
          for (const b of this.bombs) {
            if (Math.abs(b.x - this.x) < 22 && Math.abs(b.y - py) < 22) {
              this.lives--;
              this.invT = 1.1;
              api.shake(6, 0.3); api.flash('#cc0000', 0.2);
              api.audio.sfx('hurt');
              api.burst(b.x, b.y, '#cc4000', 10);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          c.fillStyle = '#04060a'; c.fillRect(0, 0, W, H);

          // Scrolling city-street perspective
          const sy = this.scrollY % 76;
          for (let row = -1; row < 8; row++) {
            const ry = row * 76 + sy - 38;
            c.strokeStyle = '#14110a'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(0, ry); c.lineTo(W, ry); c.stroke();
            // Flanking buildings
            c.fillStyle = '#0c0e14';
            c.fillRect(0,      ry, 26, 72);
            c.fillRect(W - 26, ry, 26, 72);
            c.globalAlpha = 0.28;
            c.fillStyle = C.amber;
            for (let wi = 0; wi < 3; wi++) {
              if ((row + wi * 5) % 4 !== 0) c.fillRect(3 + wi * 7, ry + 8, 5, 7);
              if ((row + wi * 9) % 3 !== 0) c.fillRect(W - 22 + wi * 6, ry + 10, 4, 6);
            }
            c.globalAlpha = 1;
          }

          // Biplanes
          for (const pl of this.planes) {
            const dir = pl.vx > 0 ? 1 : -1;
            g.rect(pl.x - 14, pl.y - 3, 28, 5, C.red);
            g.rect(pl.x - 8,  pl.y - 8, 16, 6, C.red);
            g.rect(pl.x - 14, pl.y + 4,  28, 3, '#aa1818');
            g.rect(pl.x + dir * 15, pl.y - 3, 5, 3, '#c0b890');
          }

          // Bombs
          for (const b of this.bombs) {
            g.rect(b.x - 3, b.y - 8, 6, 10, '#888070');
            g.circle(b.x, b.y - 8, 3, '#606050');
          }

          // Kong rampage sprite
          const py = H - 58;
          const flash = this.invT > 0 && Math.sin(api.t * 18) > 0;
          if (!flash) {
            g.rect(this.x - 13, py - 22, 26, 28, C.fur);
            g.circle(this.x, py - 28, 10, C.fur);
            g.circle(this.x - 4, py - 31, 2, C.cream);
            g.circle(this.x + 4, py - 31, 2, C.cream);
            // Swinging arms
            const armOff = Math.round(Math.sin(api.t * 7) * 5);
            g.rect(this.x - 24, py - 16 + armOff, 12, 6, C.fur);
            g.rect(this.x + 12, py - 16 - armOff, 12, 6, C.fur);
            g.circle(this.x - 24, py - 13 + armOff, 6, C.furL);
          }

          // HUD
          api.topBar('NYC RAMPAGE');
          for (let i = 0; i < 3; i++) g.circle(16 + i * 14, 20, 5, i < this.lives ? C.amber : '#2a2018');
          api.txt(Math.ceil(this.timer) + 's', W - 38, 20, 9, C.cream);
          api.vignette(); api.scanlines();
        },
      },

      /* ================================================================
       *  5. KING OF THE SKY  — swat 8 orbiting biplanes; 3 misses = lose
       * ================================================================ */
      {
        id: 'sky', name: 'KING OF THE SKY', sub: 'SWAT THE BIPLANES',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 9, y - 2, 18, 3, C.red);
          g.rect(x - 5, y - 5, 10, 3, C.red);
          g.circle(x + 10, y - 1, 3, C.amberL);
        },
        intro: [
          'KONG CLIMBS THE',
          'EMPIRE STATE BUILDING.',
          'THE PLANES CIRCLE',
          'and begin their runs.',
        ],
        quote: '"Oh no, it wasn\'t the airplanes. It was Beauty killed the Beast."',
        help: 'TAP when a biplane enters the GOLD RING to swat it',
        winText: 'The sky goes silent. Kong stands alone at the top of the world.',
        loseText: 'The last plane pulls away. The mighty Beast falls.',
        init(api) {
          this.kills   = 0;
          this.need    = 8;
          this.misses  = 0;
          this.maxMiss = 3;
          this.planes  = [];
          this.spawnT  = 1.8;
          this.zoneR   = 58;
          this.cx      = api.W / 2;
          this.cy      = Math.round(api.H * 0.40);
          this.swatT   = 0;
        },
        update(api, dt) {
          // Spawn orbiting planes
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.85, 1.7 - this.kills * 0.07);
            const orbitR = 82 + Math.random() * 30;
            this.planes.push({
              angle:  Math.random() * Math.PI * 2,
              orbitR,
              speed:  0.60 + Math.random() * 0.30,
              alive:  true,
            });
          }
          for (const pl of this.planes) pl.angle += pl.speed * dt;
          if (this.swatT > 0) this.swatT -= dt;

          // Swat on confirm()
          if (api.confirm()) {
            // Find planes currently inside the zone
            const inZone = this.planes.filter(pl => {
              if (!pl.alive) return false;
              const px = this.cx + Math.cos(pl.angle) * pl.orbitR;
              const py = this.cy + Math.sin(pl.angle) * pl.orbitR * 0.5;
              return Math.hypot(px - this.cx, (py - this.cy) * 2) < this.zoneR;
            });

            if (inZone.length > 0) {
              // Swat the first one in zone
              inZone[0].alive = false;
              this.kills++;
              this.swatT = 0.3;
              api.addScore(40);
              api.audio.sfx('power');
              api.shake(4, 0.22);
              const px0 = this.cx + Math.cos(inZone[0].angle) * inZone[0].orbitR;
              const py0 = this.cy + Math.sin(inZone[0].angle) * inZone[0].orbitR * 0.5;
              api.burst(px0, py0, C.red, 14);
              if (this.kills >= this.need) { api.addScore(80); api.win(); return; }
            } else {
              this.misses++;
              api.audio.sfx('blip');
              api.shake(2, 0.1);
              if (this.misses >= this.maxMiss) { api.lose(); return; }
            }
            this.planes = this.planes.filter(pl => pl.alive);
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          // High-altitude night
          c.fillStyle = '#020308'; c.fillRect(0, 0, W, H);
          // Stars (more visible up high)
          for (let i = 0; i < 40; i++) {
            const sx = (i * 71 + 13) % W, sy = (i * 43 + 7) % Math.floor(H * 0.88);
            c.globalAlpha = 0.18 + 0.22 * Math.sin(api.t * 1.5 + i);
            g.rect(sx, sy, 1, 1, C.cream);
          }
          c.globalAlpha = 1;

          // City far below (tiny buildings at bottom)
          c.fillStyle = '#060810'; c.fillRect(0, H - 28, W, 28);
          for (let i = 0; i < 13; i++) {
            const bx = i * 21 + 1, bh = 5 + (i * 13) % 14;
            c.fillRect(bx, H - 28 - bh, 16, bh);
          }

          // ESB top portion (rising from bottom)
          g.rect(W / 2 - 18, H * 0.58, 36, H * 0.42);
          g.rect(W / 2 - 13, H * 0.55, 26, H * 0.06);
          g.rect(W / 2 - 9,  H * 0.52, 18, H * 0.05);
          g.rect(W / 2 - 2,  H * 0.48, 4,  H * 0.06);

          // Swat zone ring
          c.strokeStyle = C.amber;
          c.lineWidth = 2;
          c.globalAlpha = 0.38 + 0.14 * Math.sin(api.t * 3);
          c.beginPath(); c.arc(this.cx, this.cy, this.zoneR, 0, Math.PI * 2); c.stroke();
          c.globalAlpha = 1;

          // Kong at spire top
          const kx = W / 2, ky = this.cy + 28;
          g.rect(kx - 11, ky, 22, 20, C.fur);
          g.circle(kx, ky - 6, 9, C.fur);
          g.circle(kx - 3, ky - 8, 2, C.cream);
          g.circle(kx + 3, ky - 8, 2, C.cream);
          // Swatting arm up
          if (this.swatT > 0) {
            g.rect(kx + 10, ky - 12, 20, 5, C.furL);
            g.circle(kx + 30, ky - 10, 6, C.furL);
          } else {
            g.rect(kx - 22, ky + 4, 12, 5, C.fur);
            g.rect(kx + 10, ky + 4, 12, 5, C.fur);
          }

          // Orbiting biplanes
          for (const pl of this.planes) {
            if (!pl.alive) continue;
            const px = this.cx + Math.cos(pl.angle) * pl.orbitR;
            const py = this.cy + Math.sin(pl.angle) * pl.orbitR * 0.5;
            const dir = Math.cos(pl.angle) > 0 ? 1 : -1;
            // Check if in zone (highlight)
            const inZ = Math.hypot(px - this.cx, (py - this.cy) * 2) < this.zoneR;
            const plCol = inZ ? C.amberL : C.red;
            g.rect(px - 14, py - 3, 28, 5, plCol);
            g.rect(px - 8,  py - 8, 16, 6, plCol);
            g.rect(px - 14, py + 4,  28, 3, '#aa1818');
            g.rect(px + dir * 14, py - 3, 5, 3, '#c0b890');
          }

          // HUD
          api.topBar('KING OF THE SKY');
          api.txt('SWAT ' + this.kills + '/' + this.need, 6, 20, 8, C.amberL, true);
          for (let i = 0; i < this.maxMiss; i++) {
            g.circle(W - 14 - i * 14, 20, 5, i < (this.maxMiss - this.misses) ? C.amber : '#2a2018');
          }
          api.vignette(); api.scanlines();
        },
      },
    ],
  });
})();
