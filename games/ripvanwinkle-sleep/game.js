/* ============================================================================
 * RIP VAN WINKLE — TWENTY YEARS ASLEEP
 * Five Catskill tales through Washington Irving's classic:
 *   1. CATSKILL HUNT    — dodge rocks, collect game in the mountains
 *   2. NINEPINS         — bowl with the ghostly hollow men (timing aim)
 *   3. THE LONG SLEEP   — dream-dodge falling calendar years
 *   4. THE CHANGED WORLD— catch old-life tokens, dodge new republic signs
 *   5. WHO AM I?        — memory-card match to prove your identity
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * NES-honest palette: flat fills + dithering, no gradients or alpha glows.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ---- NES-honest color palette (all snapped to NES 2C02) ---- */
  const P = {
    sky:       '#0078F8',  // NES bright blue
    skyDark:   '#0000BC',  // NES dark blue (night / hollow)
    hillDeep:  '#005800',  // deep forest green
    hill:      '#006800',  // forest green
    hillBright:'#00B800',  // bright NES green
    ground:    '#503000',  // dark brown earth
    leaf1:     '#F83800',  // red-orange autumn
    leaf2:     '#F8B800',  // gold autumn
    leaf3:     '#AC7C00',  // amber
    stone:     '#7C7C7C',  // gray stone
    coat:      '#7C7C7C',  // Rip's coat
    cap:       '#A80020',  // Rip's colonial cap
    skin:      '#F0D0B0',  // NES peach skin
    ghost:     '#4428BC',  // ghostly purple
    ghostGlow: '#9878F8',  // lighter ghost
    barrel:    '#A81000',  // dark colonial red
    building:  '#BCBCBC',  // village gray
    parchment: '#FCE0A8',  // warm cream
    ink:       '#000000',
    white:     '#F8F8F8',
    gold:      '#F8B800',
    dark:      '#281408',
    dkBrown:   '#4A2810',
  };

  /* ========================= EMBLEM ========================= */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // Oak tree trunk
    g.rect(cx - 4, cy - 20, 8, 22, P.ground);
    // Canopy (chunky NES)
    g.rect(cx - 18, cy - 36, 36, 20, P.hillBright);
    g.rect(cx - 12, cy - 44, 24, 14, P.hill);
    g.rect(cx - 6,  cy - 48,  12, 8, P.hillDeep);
    // Rip asleep at base
    g.rect(cx - 22, cy + 2, 34, 8, P.coat);
    g.rect(cx - 24, cy + 2, 10, 10, P.cap);
    g.circle(cx - 18, cy - 2, 5, P.skin);
    // Zzz
    g.rect(cx + 6, cy - 8,  4, 4, P.white);
    g.rect(cx + 12, cy - 16, 5, 5, P.white);
    g.rect(cx + 19, cy - 24, 6, 6, P.white);
  }

  /* ========================= SCENERY ======================== */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Tavern wall: dark horizontal wooden planks
      c.fillStyle = P.dark; c.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y += 22) {
        g.rect(0, y,     W, 20, y % 44 < 22 ? '#4a2810' : '#3a2010');
        g.rect(0, y + 20, W, 2,  '#1e0e04');
      }
      // Wood knots
      const knots = [[28,13],[92,35],[178,79],[48,101],[218,123],[138,57],[64,167],[204,189]];
      c.fillStyle = '#200c02';
      for (const [kx, ky] of knots) {
        c.beginPath(); c.ellipse(kx, ky, 5, 3, 0.3, 0, Math.PI * 2); c.fill();
      }
      return;
    }

    // Catskill backdrop (all other scenes)
    const darkScene = scene === 'intro' || scene === 'finale';
    g.rect(0, 0, W, H, darkScene ? P.skyDark : P.sky);
    // Dithered horizon band
    for (let x = 0; x < W; x += 2) g.rect(x, Math.round(H * 0.42), 1, 7, P.hillDeep);
    // Mountain silhouettes
    const mts = [[0,0.50,68,0.28],[50,0.54,78,0.26],[135,0.48,72,0.24],[198,0.52,64,0.30]];
    c.fillStyle = P.hillDeep;
    for (const [mx,mb,mw,mh] of mts) {
      const by = Math.round(H*mb), pk = Math.round(H*mh);
      c.beginPath();
      c.moveTo(mx, by); c.lineTo(mx + mw*0.5, by - pk); c.lineTo(mx + mw, by);
      c.closePath(); c.fill();
    }
    // Ground
    g.rect(0, Math.round(H*0.46), W, Math.round(H*0.54), P.ground);
    // Grass fringe (dithered)
    for (let x = 0; x < W; x += 4) g.rect(x, Math.round(H*0.46)-4, 3, 8, P.hillBright);
    // Animated falling leaves
    for (let i = 0; i < 9; i++) {
      const lx = ((t * 20 + i * 41) % (W + 20)) - 10;
      const ly = 14 + ((i * 48 + Math.sin(t * 1.3 + i * 2.0) * 16) % Math.round(H * 0.44));
      g.rect(lx, ly, 5, 5, [P.leaf1, P.leaf2, P.leaf3][i % 3]);
    }
    // Dark overlay for narrative screens
    if (scene === 'intro' || scene === 'result') {
      c.fillStyle = 'rgba(0,0,0,.68)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'finale') {
      c.fillStyle = 'rgba(10,6,0,.62)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ===================== CHAPTER ICONS ====================== */
  function iconHunt(api, x, y) {
    const g = api.gfx;
    g.sprite(['.b.', 'bbb', '.b.'], x - 6, y - 6, { b: '#A81000' }, 4); // musket ball
    g.rect(x - 10, y - 1, 12, 2, P.coat); // gun barrel
  }
  function iconBowl(api, x, y) {
    const g = api.gfx;
    g.circle(x, y, 7, P.ghost);
    g.circle(x, y, 3, P.ghostGlow);
  }
  function iconSleep(api, x, y) {
    const g = api.gfx;
    g.rect(x - 10, y, 20, 8, P.coat);
    g.circle(x - 8, y - 4, 4, P.skin);
    g.rect(x + 2, y - 12, 4, 4, P.white);
    g.rect(x + 8, y - 18, 5, 5, P.white);
  }
  function iconWorld(api, x, y) {
    const g = api.gfx;
    g.circle(x, y, 8, P.sky);
    g.rect(x - 10, y - 1, 20, 2, P.white);
  }
  function iconWho(api, x, y) {
    const g = api.gfx;
    g.circle(x, y - 2, 7, P.skin);
    g.rect(x - 8, y + 6, 16, 8, P.coat);
    g.rect(x - 8, y - 12, 16, 6, P.cap);
  }

  /* =================== MENU (BULLETIN BOARD) ================ */
  const MENU = {
    colors: { title: P.gold, label: P.parchment, cur: P.leaf2, done: '#58D854', locked: P.stone },
    title(api, currency) {
      const g = api.gfx, W = api.W;
      // Header board sign (mounted plank)
      g.rect(26, 14, W - 52, 6, P.ground);          // top peg
      g.rect(30, 20, W - 60, 44, P.dkBrown);
      g.rect(30, 20, W - 60, 44, '#00000000');       // no-op (already drew)
      // Rounded end caps
      g.circle(30,      42, 22, P.dkBrown);
      g.circle(W - 30,  42, 22, P.dkBrown);
      // Outline
      const c = api.ctx;
      c.strokeStyle = P.gold; c.lineWidth = 2;
      c.strokeRect(30, 20, W - 60, 44);
      // Title text
      api.txtCFit('TWENTY YEARS ASLEEP', W / 2, 26, 9, P.gold, true, W - 72);
      api.txtCFit('TALES  ' + currency, W / 2, 46, 9, P.leaf2, true, W - 72);
    },
    layout(api) {
      // Scatter 5 notices on the tavern board
      return [
        { x: 14,  y: 96,  w: 110, h: 72 },  // top-left
        { x: 146, y: 84,  w: 110, h: 72 },  // top-right
        { x: 80,  y: 200, w: 110, h: 72 },  // center
        { x: 14,  y: 316, w: 110, h: 72 },  // bottom-left
        { x: 146, y: 304, w: 110, h: 72 },  // bottom-right
      ];
    },
    card(api, info) {
      const g = api.gfx, c = api.ctx;
      const { ch, i, x, y, w, h, sel, done } = info;
      const cx = x + w / 2, cy = y + h / 2;
      // Tack nails at corners
      for (const [nx, ny] of [[x+8,y+8],[x+w-8,y+8],[x+8,y+h-8],[x+w-8,y+h-8]]) {
        g.circle(nx, ny, 4, sel ? P.gold : '#7C7C7C');
        g.circle(nx, ny, 2, done ? P.gold : '#BCBCBC');
      }
      // Parchment body (slightly tilted feel — just draw flat)
      const bgCol = sel ? '#FCA044' : done ? '#F8D878' : P.parchment;
      g.rect(x + 10, y + 10, w - 20, h - 20, bgCol);
      g.rectO(x + 10, y + 10, w - 20, h - 20, sel ? P.gold : '#AC7C00', sel ? 2 : 1);
      // Chapter icon
      const icons = [iconHunt, iconBowl, iconSleep, iconWorld, iconWho];
      if (icons[i]) icons[i](api, cx, cy - 8);
      // Name
      api.txtCFit(ch.name, cx, cy + 12, 7, sel ? '#000000' : '#503000', true, w - 24);
      if (done) {
        c.fillStyle = '#007800'; c.globalAlpha = 0.55;
        c.fillRect(x + 10, y + 10, w - 20, h - 20);
        c.globalAlpha = 1;
        api.txtCFit('DONE', cx, cy - 2, 8, '#58D854', true);
      }
    },
  };

  /* ===================== GAME CONFIG ======================== */
  RetroSaga.create({
    id: 'ripvanwinkle',
    title: 'Rip Van Winkle',
    subtitle: 'TWENTY YEARS ASLEEP',
    currency: 'TALES',
    accent: P.gold,
    credit: 'AN 8-BIT TRIBUTE · WASHINGTON IRVING · 1819',
    emblem,
    scenery,
    bootCta: 'TAP TO WAKE',
    menuLabel: 'THE CATSKILL LEGEND',
    menuHint: 'CHOOSE YOUR CHAPTER',
    menuDone: 'TWENTY YEARS REMEMBERED',
    screens: {
      win:          P.leaf2,
      lose:         '#0078F8',
      chapterLabel: P.leaf3,
      name:         P.parchment,
      sub:          P.gold,
      intro:        '#F0D0B0',
      quote:        '#AC7C00',
      help:         P.leaf2,
      score:        '#FCE0A8',
      cur:          P.gold,
      cta:          P.leaf2,
      overlay:      'rgba(10,5,0,.85)',
    },
    labels: {
      chapter:  'CHAPTER',
      score:    'TALES EARNED',
      win:      'REMEMBERED!',
      lose:     'LOST IN TIME',
      cont:     'TAP TO WANDER ON',
      finale:   'TAP TO SIT BY THE FIRE',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO BEGIN',
    },
    palette: { gold: P.gold, green: P.hillBright, brown: P.ground, leaf: P.leaf1 },
    menu: MENU,
    finale: [
      'RIP SITS BY THE FIRE',
      'of the old King George Inn.',
      '',
      'THE VILLAGE FINALLY KNOWS',
      'his name — and his tale.',
      '',
      'TWENTY YEARS ASLEEP.',
      'A LIFETIME OF STORIES.',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* =================== 1. CATSKILL HUNT ===================== */
      {
        id: 'hunt', name: 'CATSKILL HUNT', sub: 'INTO THE MOUNTAINS',
        icon: iconHunt,
        intro: [
          'RIP VAN WINKLE ESCAPES',
          'HIS NAGGING WIFE',
          'into the blue Catskill Mountains',
          'with his faithful dog Wolf.',
        ],
        quote: '"Rip had but one failing — an insuperable aversion to all kinds of profitable labour."',
        help: 'DODGE the rocks · collect squirrels with left/right',
        winText: 'Rip bags enough game for supper. Wolf barks at something strange in the hollow ahead…',
        loseText: 'The rocks are too many. Rip limps home, empty-handed and bruised.',
        init(api) {
          this.x = api.W / 2;
          this.timer = 24;
          this.hits = 0;
          this.squirrels = 0;
          this.need = 10;
          this.obs = []; this.spawnT = 0.8;
          this.speed = 2.6;
          this.trees = []; this.treeT = 0.4;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.speed = Math.min(4.5, this.speed + dt * 0.05);
          // Steer
          if (api.pointer.down) this.x += (api.pointer.x < api.W / 2 ? -1 : 1) * 4.0 * f;
          if (api.keyDown('left'))  this.x -= 3.8 * f;
          if (api.keyDown('right')) this.x += 3.8 * f;
          this.x = clamp(this.x, 20, api.W - 20);
          // Background trees
          this.treeT -= dt;
          if (this.treeT <= 0) {
            this.treeT = api.rnd(0.25, 0.55);
            const side = api.chance(0.5);
            this.trees.push({ x: side ? api.rnd(4, 36) : api.rnd(api.W - 36, api.W - 4), y: -40, vy: this.speed * 0.6 });
          }
          for (const tr of this.trees) tr.y += tr.vy * f;
          this.trees = this.trees.filter(tr => tr.y < api.H + 50);
          // Spawn rocks and squirrels
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.38, 0.9);
            const kind = api.chance(0.38) ? 'squirrel' : 'rock';
            this.obs.push({ x: api.rnd(22, api.W - 22), y: -20, vy: this.speed * (kind === 'rock' ? 1.0 : 0.7), kind });
          }
          const pY = api.H - 60;
          this.obs = this.obs.filter(o => {
            o.y += o.vy * f;
            if (o.y > api.H + 20) return false;
            if (!o.hit && Math.abs(o.x - this.x) < 18 && Math.abs(o.y - pY) < 18) {
              o.hit = true;
              if (o.kind === 'squirrel') {
                this.squirrels++;
                api.audio.sfx('coin');
                api.burst(o.x, o.y, P.leaf2, 7);
                if (this.squirrels >= this.need) { api.score += 80; api.win(); return false; }
              } else {
                this.hits++;
                api.audio.sfx('hurt'); api.shake(5, 0.25); api.flash(P.stone, 0.15);
                if (this.hits >= 3) { api.lose(); return false; }
              }
            }
            return !o.hit;
          });
          if (this.timer <= 0) {
            if (this.squirrels >= this.need) { api.score += 60; api.win(); }
            else { api.lose(); }
          }
          api.score = this.squirrels * 8;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Sky
          g.rect(0, 0, W, Math.round(H * 0.44), P.sky);
          // Mountain silhouettes
          c.fillStyle = P.hillDeep;
          const mts = [[0,0.5,66,0.3],[50,0.55,72,0.26],[140,0.5,68,0.28],[208,0.54,58,0.29]];
          for (const [mx,mb,mw,mh] of mts) {
            c.beginPath(); c.moveTo(mx, H*mb); c.lineTo(mx+mw*0.5,H*mb-H*mh); c.lineTo(mx+mw,H*mb); c.closePath(); c.fill();
          }
          // Ground with dither horizon
          g.rect(0, Math.round(H * 0.46), W, H, P.ground);
          for (let x = 0; x < W; x += 2) g.rect(x, Math.round(H * 0.44), 1, 5, P.hillDeep);
          for (let x = 1; x < W; x += 2) g.rect(x, Math.round(H * 0.44)+3, 1, 3, P.hill);
          // Scrolling dirt path
          const pathY = api.t * (this.speed * 12) % 40;
          for (let py = pathY - 40; py < H; py += 40) {
            g.rect(W / 2 - 20, py, 40, 22, '#3a1e08');
          }
          // Background trees
          for (const tr of this.trees) {
            g.rect(tr.x - 4, tr.y, 8, 38, P.hillDeep);
            c.fillStyle = '#004800'; c.beginPath(); c.arc(tr.x, tr.y, 16, 0, Math.PI * 2); c.fill();
          }
          // Obstacles
          for (const o of this.obs) {
            if (o.kind === 'rock') {
              g.rect(o.x - 10, o.y - 8, 20, 16, P.stone);
              g.rect(o.x - 8,  o.y - 10, 16, 6,  '#7C7C7C');
              g.rect(o.x - 12, o.y - 4, 6, 6, '#BCBCBC');
            } else {
              // Squirrel (tiny sprite)
              g.sprite([
                '.ss.',
                'sSSs',
                '.ss.',
                '..t.',
              ], o.x - 8, o.y - 10, { s: P.leaf3, S: '#F0D0B0', t: P.leaf1 }, 4);
            }
          }
          // Rip (coat + cap)
          g.sprite([
            '..cc..',
            '.ckkc.',
            'cccccc',
            '.cccc.',
            'c....c',
          ], this.x - 12, H - 88, { c: P.coat, k: P.cap }, 4);
          g.circle(this.x, H - 92, 8, P.skin);
          // Wolf dog (following)
          g.sprite([
            '..dd',
            '.ddd',
            'dddd',
            'd..d',
          ], this.x - 28, H - 56, { d: P.dkBrown }, 4);
          // HUD
          api.topBar('CATSKILL HUNT');
          api.txt('GAME ' + this.squirrels + '/' + this.need, 6, 20, 9, P.gold);
          const tw = api.W - 90;
          g.rect(88, 20, tw, 6, '#281408');
          g.rect(88, 20, tw * clamp(this.timer / 24, 0, 1), 6, P.hillBright);
          api.txt('LIFE', api.W - 50, 20, 9, P.stone);
          for (let i = 0; i < 3; i++) g.rect(api.W - 46 + i * 14, 32, 10, 8, i < (3 - this.hits) ? P.leaf1 : '#3a1208');
          api.vignette(); api.scanlines();
        },
      },

      /* =================== 2. NINEPINS ========================== */
      {
        id: 'ninepins', name: 'NINEPINS', sub: 'STRANGERS IN THE HOLLOW',
        icon: iconBowl,
        intro: [
          'STRANGE LITTLE MEN',
          'IN OLD DUTCH CLOTHES',
          'play ninepins in the hollow.',
          'They beckon Rip to bowl.',
        ],
        quote: '"Their visages, too, were peculiar: one had a large beard, broad face, and small piggish eyes."',
        help: 'TAP when the slider is in the GOLD ZONE to bowl',
        winText: 'Thunder rolls through the hollow — the men cheer. A jug is pressed into Rip\'s hands.',
        loseText: 'Rip\'s balls sail wide. The ghostly men roar with silent laughter.',
        init(api) {
          this.pos = 0;
          this.dir = 1;
          this.speed = 0.018;
          this.bowls = 0;
          this.maxBowls = 5;
          this.strikes = 0;
          this.needStrikes = 3;
          this.zone = 0.18;
          this.rolling = false;
          this.rollT = 0;
          this.rollHit = false;
          this.pins = this.makePins();
          this.rumbleT = 0;
        },
        makePins() {
          // 6 pins in a diamond arrangement
          const px = 135, py = 80;
          return [
            { x: px,      y: py,      alive: true },
            { x: px - 14, y: py + 18, alive: true },
            { x: px + 14, y: py + 18, alive: true },
            { x: px - 26, y: py + 36, alive: true },
            { x: px,      y: py + 36, alive: true },
            { x: px + 26, y: py + 36, alive: true },
          ];
        },
        update(api, dt) {
          const f = dt * 60;
          this.rumbleT = Math.max(0, this.rumbleT - dt);
          if (this.rolling) {
            this.rollT += dt;
            if (this.rollT > 0.7) {
              this.rolling = false;
              this.bowls++;
              if (this.rollHit) {
                this.strikes++;
                api.score += 50;
                if (this.strikes >= this.needStrikes) { api.score += 100; api.win(); return; }
              }
              if (this.bowls >= this.maxBowls) {
                if (this.strikes >= this.needStrikes) { api.score += 60; api.win(); }
                else api.lose();
                return;
              }
              // Reset pins for next bowl
              this.pins = this.makePins();
              this.zone = Math.max(0.09, this.zone - 0.013);
              this.speed = Math.min(0.038, this.speed + 0.003);
            }
            return;
          }
          this.pos += this.dir * this.speed * f;
          if (this.pos >= 1) { this.pos = 1; this.dir = -1; }
          if (this.pos <= 0) { this.pos = 0; this.dir = 1; }
          if (api.confirm()) {
            const dist = Math.abs(this.pos - 0.5);
            this.rollHit = dist < this.zone;
            this.rolling = true; this.rollT = 0;
            if (this.rollHit) {
              // Knock pins
              const ko = Math.floor(api.rnd(3, 6));
              let n = 0;
              for (const p of this.pins) { if (p.alive && n < ko) { p.alive = false; n++; } }
              this.rumbleT = 0.5;
              api.audio.sfx('power'); api.shake(6, 0.3);
              api.burst(135, 130, P.ghost, 16);
            } else {
              api.audio.sfx('blip');
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dark hollow — eerie purple night
          g.rect(0, 0, W, H, P.skyDark);
          // Hollow walls (jagged rock silhouettes)
          c.fillStyle = '#0a0818';
          for (let i = 0; i < 5; i++) {
            const rx = i * 54, rh = 60 + (i * 37) % 50;
            c.beginPath(); c.moveTo(rx, H); c.lineTo(rx, H - rh);
            c.lineTo(rx + 27, H - rh - 24); c.lineTo(rx + 54, H - rh); c.lineTo(rx + 54, H); c.closePath(); c.fill();
          }
          // Lane
          g.rect(60, 72, 150, 220, '#18100a');
          for (let i = 0; i < 8; i++) g.rect(60, 72 + i * 28, 150, 2, '#201408');
          g.rectO(60, 72, 150, 220, '#3a2010', 2);
          // Pins
          for (const p of this.pins) {
            if (p.alive) {
              g.sprite([
                '.w.',
                'www',
                '.w.',
              ], p.x - 6, p.y - 6, { w: this.rumbleT > 0 ? '#F8B800' : '#F8F8F8' }, 4);
            } else {
              g.rect(p.x - 5, p.y + 4, 10, 4, P.stone);
            }
          }
          // Ghostly bowlers in background
          for (let i = 0; i < 3; i++) {
            const gx = 78 + i * 42, gy = H - 80;
            g.sprite(['.gg.', 'gggg', '.gg.', 'g..g'], gx - 8, gy - 28, { g: P.ghost }, 4);
          }
          // Rolling ball
          if (this.rolling) {
            const prog = clamp(this.rollT / 0.7, 0, 1);
            const by = H - 68 - prog * (H - 68 - 140);
            g.circle(135, by, 10, P.ghostGlow);
            g.circle(135, by, 6, P.ghost);
          }
          // Aim slider bar
          const slW = W - 36, slX = 18, slY = H - 34;
          g.rect(slX, slY, slW, 14, '#0a0818');
          g.rect(slX + slW * (0.5 - this.zone), slY, slW * this.zone * 2, 14, 'rgba(248,184,0,.3)');
          g.rectO(slX, slY, slW, 14, P.stone, 1);
          // Zone markers
          g.rect(slX + slW * (0.5 - this.zone) - 1, slY - 3, 2, 20, P.gold);
          g.rect(slX + slW * (0.5 + this.zone) - 1, slY - 3, 2, 20, P.gold);
          // Cursor
          if (!this.rolling) {
            const curX = slX + slW * this.pos;
            const dist = Math.abs(this.pos - 0.5);
            const col = dist < this.zone ? P.hillBright : P.leaf1;
            g.rect(curX - 3, slY - 4, 6, 22, col);
          }
          api.topBar('NINEPINS');
          api.txt('BOWL ' + this.bowls + '/' + this.maxBowls, 6, 20, 9, P.ghost);
          api.txt('HIT ' + this.strikes + '/' + this.needStrikes, W - 86, 20, 9, P.gold);
          api.vignette(); api.scanlines();
        },
      },

      /* =================== 3. THE LONG SLEEP ==================== */
      {
        id: 'sleep', name: 'THE LONG SLEEP', sub: 'TWENTY YEARS OF DREAMS',
        icon: iconSleep,
        intro: [
          'RIP DRINKS THE SCHNAPPS.',
          'THE HOLLOW GOES DARK.',
          'The years begin to fall',
          'like leaves from a shaken tree.',
        ],
        quote: '"On waking he found himself on the green knoll whence he had first seen the old man of the glen."',
        help: 'DODGE the falling years · a few can pass by',
        winText: 'Twenty years have passed. Rip wakes stiff and grey, his musket rusted, Wolf long gone.',
        loseText: 'The years pile up too fast. Time overwhelms even the deepest enchanted sleep.',
        init(api) {
          this.x = api.W / 2;
          this.timer = 22;
          this.yearHits = 0;
          this.maxHits = 5;
          this.years = [];
          this.spawnT = 0.55;
          this.speed = 2.2;
          this.zzz = [];
          this.zzzT = 0.8;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.speed = Math.min(4.0, this.speed + dt * 0.04);
          // Steer
          if (api.pointer.down) this.x += (api.pointer.x < api.W / 2 ? -1 : 1) * 4.2 * f;
          if (api.keyDown('left'))  this.x -= 3.6 * f;
          if (api.keyDown('right')) this.x += 3.6 * f;
          this.x = clamp(this.x, 16, api.W - 16);
          // Spawn Zzz floaters
          this.zzzT -= dt;
          if (this.zzzT <= 0) {
            this.zzzT = api.rnd(0.5, 1.2);
            this.zzz.push({ x: api.rnd(20, api.W - 20), y: api.H + 10, vy: -0.6, life: 2.5 });
          }
          for (const z of this.zzz) { z.y += z.vy * f; z.life -= dt; }
          this.zzz = this.zzz.filter(z => z.life > 0 && z.y > -20);
          // Spawn falling year numbers/pages
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.28, 0.62);
            const yr = 1769 + Math.floor((22 - this.timer) * 0.92);
            this.years.push({ x: api.rnd(16, api.W - 16), y: -24, vy: this.speed, label: yr, w: 30 });
          }
          const ripY = api.H - 52;
          this.years = this.years.filter(y => {
            y.y += y.vy * f;
            if (y.y > api.H + 20) return false;
            if (!y.hit && Math.abs(y.x - this.x) < 20 && Math.abs(y.y - ripY) < 16) {
              y.hit = true;
              this.yearHits++;
              api.audio.sfx('hurt'); api.shake(4, 0.2); api.flash(P.ghostGlow, 0.2);
              if (this.yearHits >= this.maxHits) { api.lose(); return false; }
            }
            return !y.hit;
          });
          if (this.timer <= 0) { api.score += 100; api.win(); }
          api.score = Math.floor(Math.max(0, 22 - this.timer) * 5);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dream sky — shifting purple/blue
          const hue = Math.sin(api.t * 0.3) * 0.5 + 0.5;
          g.rect(0, 0, W, H, hue > 0.5 ? P.skyDark : '#0000FC');
          // Dream stars (pixel sparkle)
          for (let i = 0; i < 18; i++) {
            const sx = (i * 53 + 7) % W;
            const sy = (i * 31 + 11) % (H * 0.55);
            const blink = Math.sin(api.t * 2.1 + i * 0.7) > 0 ? P.white : P.ghostGlow;
            g.rect(sx, sy, 2, 2, blink);
          }
          // Falling calendar pages
          for (const yr of this.years) {
            g.rect(yr.x - 15, yr.y - 12, 30, 24, P.parchment);
            g.rectO(yr.x - 15, yr.y - 12, 30, 24, P.leaf3, 1);
            api.txtCFit('' + yr.label, yr.x, yr.y - 8, 8, '#503000', true, 26);
          }
          // Zzz floaters
          for (const z of this.zzz) {
            const a = Math.min(1, z.life / 2.5);
            c.globalAlpha = a;
            api.txtCFit('Z', z.x, z.y, 12, P.ghostGlow, true);
            c.globalAlpha = 1;
          }
          // Sleeping Rip (ground level)
          g.rect(this.x - 22, H - 56, 38, 10, P.coat);
          g.circle(this.x - 18, H - 60, 6, P.skin);
          g.rect(this.x - 26, H - 60, 12, 8, P.cap);
          // Life dots
          api.topBar('THE LONG SLEEP');
          api.txt('YEARS ' + Math.floor(Math.max(0, 22 - this.timer)), 6, 20, 9, P.ghostGlow);
          for (let i = 0; i < 5; i++) {
            g.rect(W - 14 - i * 14, 20, 10, 8, i < (5 - this.yearHits) ? P.ghostGlow : '#181028');
          }
          api.vignette(); api.scanlines();
        },
      },

      /* =================== 4. THE CHANGED WORLD ================= */
      {
        id: 'changed', name: 'THE CHANGED WORLD', sub: 'NOTHING IS THE SAME',
        icon: iconWorld,
        intro: [
          'RIP STAGGERS INTO TOWN.',
          'KING GEORGE IS GONE.',
          'Catch what you remember.',
          'Dodge what the new world brings.',
        ],
        quote: '"To make a long story short, the company broke up and returned to the more important concerns of the election."',
        help: 'CATCH old-life items (amber) · DODGE republic signs (blue)',
        winText: 'Rip gathers enough memories to know who he is. The old inn still stands. Just.',
        loseText: 'The new world overwhelms him. Rip sits weeping by the village well.',
        init(api) {
          this.x = api.W / 2;
          this.caught = 0;
          this.need = 16;
          this.mistakes = 0;
          this.maxMistakes = 5;
          this.items = [];
          this.spawnT = 0.5;
          this.speed = 2.4;
          this.timer = 30;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.speed = Math.min(4.2, this.speed + dt * 0.04);
          // Steer
          if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.18 * f;
          if (api.keyDown('left'))  this.x -= 4.0 * f;
          if (api.keyDown('right')) this.x += 4.0 * f;
          this.x = clamp(this.x, 18, api.W - 18);
          // Spawn items
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.3, 0.65);
            const old = api.chance(0.52); // slightly more old items
            this.items.push({
              x: api.rnd(18, api.W - 18), y: -20,
              vy: this.speed * api.rnd(0.85, 1.15),
              kind: old ? 'old' : 'new',
            });
          }
          const catchY = api.H - 56;
          this.items = this.items.filter(it => {
            it.y += it.vy * f;
            if (it.y > api.H + 20) return false;
            if (!it.hit && Math.abs(it.x - this.x) < 22 && Math.abs(it.y - catchY) < 16) {
              it.hit = true;
              if (it.kind === 'old') {
                this.caught++;
                api.audio.sfx('coin');
                api.burst(it.x, it.y, P.gold, 8);
                if (this.caught >= this.need) { api.score += 80; api.win(); return false; }
              } else {
                this.mistakes++;
                api.audio.sfx('hurt'); api.shake(4, 0.2); api.flash(P.sky, 0.15);
                if (this.mistakes >= this.maxMistakes) { api.lose(); return false; }
              }
            }
            return !it.hit;
          });
          if (this.timer <= 0) {
            if (this.caught >= this.need) { api.score += 50; api.win(); }
            else api.lose();
          }
          api.score = this.caught * 7;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Village backdrop
          g.rect(0, 0, W, H, P.sky);
          g.rect(0, Math.round(H*0.55), W, H, P.ground);
          // Village buildings silhouette
          const blds = [[0,0.28,52,0.55],[56,0.24,44,0.55],[104,0.32,42,0.55],[150,0.22,50,0.55],[204,0.3,66,0.55]];
          for (const [bx,bh,bw,bbase] of blds) {
            g.rect(bx, Math.round(H*bbase-H*bh), bw, Math.round(H*bh), P.building);
            g.rect(bx, Math.round(H*bbase-H*bh), bw, 6, P.barrel); // colonial red roof
            // Windows
            g.rect(bx+8, Math.round(H*bbase-H*bh*0.5), 12, 10, '#F8B800');
            if (bw > 45) g.rect(bx+bw-20, Math.round(H*bbase-H*bh*0.5), 12, 10, '#F8B800');
          }
          // Falling items
          for (const it of this.items) {
            if (it.kind === 'old') {
              // Old colonial pipe — amber colored
              g.rect(it.x - 8, it.y - 4, 16, 8, P.leaf3);
              g.circle(it.x + 8, it.y, 6, P.ground);
              g.rect(it.x - 10, it.y - 2, 5, 4, P.ground);
            } else {
              // Newspaper (republic) — blue tinted
              g.rect(it.x - 10, it.y - 10, 20, 20, P.white);
              g.rectO(it.x - 10, it.y - 10, 20, 20, P.sky, 1);
              g.rect(it.x - 7, it.y - 7, 14, 2, P.sky);
              g.rect(it.x - 7, it.y - 3, 10, 2, P.sky);
              g.rect(it.x - 7, it.y + 1, 12, 2, P.sky);
            }
          }
          // Catch zone
          g.rectO(this.x - 22, H - 64, 44, 14, 'rgba(248,184,0,.5)', 1);
          // Rip (confused, old beard)
          g.sprite([
            '..cc..',
            '.cGGc.',
            'cccccc',
            '.cccc.',
            'c....c',
          ], this.x - 12, H - 88, { c: P.coat, G: P.white }, 4);
          g.circle(this.x, H - 92, 8, P.skin);
          g.rect(this.x - 8, H - 100, 16, 6, P.cap);
          // Long white beard
          g.sprite([
            'ww',
            'ww',
            '.w',
          ], this.x - 5, H - 88, { w: P.white }, 4);
          // Progress bar
          g.rect(18, H - 18, W - 36, 8, '#1a1208');
          g.rect(18, H - 18, (W - 36) * Math.min(1, this.caught / this.need), 8, P.gold);
          g.rectO(18, H - 18, W - 36, 8, P.dkBrown, 1);
          api.topBar('THE CHANGED WORLD');
          api.txt('MEM ' + this.caught + '/' + this.need, 6, 20, 9, P.gold);
          for (let i = 0; i < 5; i++) g.rect(W - 14 - i * 14, 20, 10, 8, i < (5 - this.mistakes) ? P.leaf2 : '#281408');
          api.vignette(); api.scanlines();
        },
      },

      /* =================== 5. WHO AM I? ========================= */
      {
        id: 'whoami', name: 'WHO AM I?', sub: 'PROVE YOUR IDENTITY',
        icon: iconWho,
        intro: [
          '"WHO ARE YOU? WHY DO YOU',
          'COME HERE WITH A GUN,',
          'and why are you asking',
          'for neighbours long dead?"',
        ],
        quote: '"He doubted his own identity, and whether he was himself or another man."',
        help: 'TAP cards to flip · match each pair from Rip\'s old life',
        winText: 'An old woman recognises her father. The village roars with laughter and wonder.',
        loseText: 'Rip cannot remember enough. The village drives him away as a madman.',
        init(api) {
          this.cards = this.makeCards();
          this.flipped = [];
          this.matched = 0;
          this.totalPairs = 4;
          this.mismatches = 0;
          this.maxMismatches = 5;
          this.lockT = 0;
          this.showT = 0; // brief "show all" at start
          this.showAll = true;
          this.showAllT = 2.0;
        },
        makeCards() {
          // 4 pairs = 8 cards: Wolf, Jug, Gun, Rip's House
          const types = ['wolf', 'jug', 'gun', 'house', 'wolf', 'jug', 'gun', 'house'];
          // Shuffle
          for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
          }
          // Layout: 2 rows of 4
          return types.map((type, i) => {
            const col = i % 4, row = Math.floor(i / 4);
            return {
              type, id: i,
              x: 18 + col * 60, y: 120 + row * 88,
              w: 52, h: 76,
              faceUp: false, matched: false,
            };
          });
        },
        update(api, dt) {
          const f = dt * 60;
          this.lockT = Math.max(0, this.lockT - dt);
          if (this.showAll) {
            this.showAllT -= dt;
            if (this.showAllT <= 0) {
              this.showAll = false;
              for (const c of this.cards) c.faceUp = false;
            }
            return;
          }
          if (this.lockT > 0) return;
          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (const card of this.cards) {
              if (card.matched || card.faceUp) continue;
              if (px >= card.x && px < card.x + card.w && py >= card.y && py < card.y + card.h) {
                card.faceUp = true;
                api.audio.sfx('blip');
                this.flipped.push(card);
                if (this.flipped.length === 2) {
                  const [a, b] = this.flipped;
                  if (a.type === b.type) {
                    a.matched = b.matched = true;
                    this.matched++;
                    api.audio.sfx('coin');
                    api.burst(api.W / 2, api.H / 2, P.gold, 16);
                    api.score += 60;
                    this.flipped = [];
                    if (this.matched >= this.totalPairs) { api.score += 120; api.win(); return; }
                  } else {
                    this.mismatches++;
                    api.audio.sfx('hurt');
                    this.lockT = 1.0;
                    if (this.mismatches >= this.maxMismatches) { api.lose(); return; }
                    setTimeout(() => {
                      a.faceUp = false; b.faceUp = false; this.flipped = [];
                    }, 950);
                  }
                }
                break;
              }
            }
          }
          api.score = this.matched * 60;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Village green (colonial town square)
          g.rect(0, 0, W, H, '#AC7C00');
          g.rect(0, Math.round(H*0.62), W, H, P.ground);
          // Village wall backdrop
          g.rect(0, 0, W, Math.round(H*0.14), P.building);
          for (let bx = 0; bx < W; bx += 34) {
            g.rect(bx, 0, 32, Math.round(H*0.12), P.barrel);
          }
          // Crowd silhouettes
          for (let i = 0; i < 14; i++) {
            const cx2 = i * 19 + 4, ch = 20 + (i * 13) % 16;
            c.fillStyle = '#281008';
            c.beginPath(); c.arc(cx2 + 6, H * 0.62 - ch - 6, 5, 0, Math.PI * 2); c.fill();
            g.rect(cx2, H * 0.62 - ch, 12, ch, '#281008');
          }
          // Cards
          for (const card of this.cards) {
            if (card.matched) {
              // Matched: golden glow
              g.rect(card.x, card.y, card.w, card.h, '#AC7C00');
              g.rectO(card.x, card.y, card.w, card.h, P.gold, 2);
              this.drawCardFace(api, card);
              c.fillStyle = 'rgba(248,184,0,.3)'; c.fillRect(card.x, card.y, card.w, card.h);
            } else if (card.faceUp || this.showAll) {
              g.rect(card.x, card.y, card.w, card.h, P.parchment);
              g.rectO(card.x, card.y, card.w, card.h, P.leaf3, 2);
              this.drawCardFace(api, card);
            } else {
              // Face down: colonial blue back
              g.rect(card.x, card.y, card.w, card.h, '#0000BC');
              g.rectO(card.x, card.y, card.w, card.h, P.ghostGlow, 1);
              // Diamond pattern
              for (let di = 0; di < 3; di++) {
                for (let dj = 0; dj < 4; dj++) {
                  g.rect(card.x + 10 + di * 14, card.y + 12 + dj * 16, 6, 6, P.ghost);
                }
              }
            }
          }
          // Show-all prompt
          if (this.showAll) {
            const prog = clamp(this.showAllT / 2.0, 0, 1);
            api.txtCFit('MEMORIZE!', W / 2, H - 36, 10, P.gold, true);
            g.rect(18, H - 22, W - 36, 8, '#281408');
            g.rect(18, H - 22, (W - 36) * prog, 8, P.gold);
          }
          api.topBar('WHO AM I?');
          api.txt('PAIR ' + this.matched + '/' + this.totalPairs, 6, 20, 9, P.gold);
          for (let i = 0; i < 5; i++) g.rect(W - 14 - i * 14, 20, 10, 8, i < (5 - this.mismatches) ? P.leaf2 : '#281408');
          api.vignette(); api.scanlines();
        },
        drawCardFace(api, card) {
          const g = api.gfx, cx = card.x + card.w / 2, cy = card.y + card.h / 2;
          if (card.type === 'wolf') {
            // Dog face
            g.sprite([
              'dddd',
              'dwwd',
              'dddd',
              '.dd.',
            ], cx - 8, cy - 18, { d: P.dkBrown, w: P.white }, 4);
            api.txtCFit('WOLF', cx, cy + 12, 7, P.ground, true);
          } else if (card.type === 'jug') {
            // Jug
            g.sprite([
              '.jj.',
              'jjjj',
              'jjjj',
              '.jj.',
            ], cx - 8, cy - 18, { j: P.barrel }, 4);
            api.txtCFit('JUG', cx, cy + 12, 7, P.ground, true);
          } else if (card.type === 'gun') {
            // Musket
            g.rect(cx - 16, cy - 4, 32, 4, P.dkBrown);
            g.rect(cx - 14, cy - 8, 24, 4, P.stone);
            api.txtCFit('GUN', cx, cy + 12, 7, P.ground, true);
          } else if (card.type === 'house') {
            // House silhouette
            g.rect(cx - 12, cy - 6, 24, 16, P.building);
            g.sprite(['.r.', 'rrr'], cx - 6, cy - 14, { r: P.barrel }, 4);
            api.txtCFit('HOME', cx, cy + 14, 7, P.ground, true);
          }
        },
      },
    ],
  });
})();
