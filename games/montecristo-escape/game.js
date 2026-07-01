/* ============================================================================
 * THE COUNT OF MONTE CRISTO — A TALE IN FIVE ACTS
 *   1. THE BETRAYAL    — dodge accusations to read the conspirators' letter
 *   2. CHÂTEAU D'IF    — tap timing to chip through the prison wall (10 strikes)
 *   3. THE TREASURE    — catch falling gems in Monte Cristo's cave
 *   4. THE SEA         — steer the burial sack through ocean debris to shore
 *   5. THE RECKONING   — expose three conspirators with precision timing rings
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  // Gold diamond emblem — the treasure of Monte Cristo
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // outer glow
    c.globalAlpha = 0.18;
    g.circle(cx, cy, 34, '#e3c567');
    c.globalAlpha = 1;
    // diamond shape
    c.fillStyle = '#c8a840';
    c.beginPath();
    c.moveTo(cx, cy - 28); c.lineTo(cx + 20, cy); c.lineTo(cx, cy + 28); c.lineTo(cx - 20, cy);
    c.closePath(); c.fill();
    c.fillStyle = '#f0d868';
    c.beginPath();
    c.moveTo(cx, cy - 22); c.lineTo(cx + 14, cy - 2); c.lineTo(cx, cy + 6); c.lineTo(cx - 14, cy - 2);
    c.closePath(); c.fill();
    c.fillStyle = '#fffbe8';
    c.beginPath();
    c.moveTo(cx - 3, cy - 20); c.lineTo(cx + 6, cy - 8); c.lineTo(cx - 3, cy - 6);
    c.closePath(); c.fill();
    c.strokeStyle = '#8a6a20';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx, cy - 28); c.lineTo(cx + 20, cy); c.lineTo(cx, cy + 28); c.lineTo(cx - 20, cy);
    c.closePath(); c.stroke();
  }

  // Mediterranean night backdrop: starry sky, moonlit sea, rocky island silhouette
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // night sky
    const sky = c.createLinearGradient(0, 0, 0, H * 0.58);
    sky.addColorStop(0, '#02050f');
    sky.addColorStop(0.6, '#06101e');
    sky.addColorStop(1, '#0a1628');
    c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.58);

    // stars
    for (let i = 0; i < 52; i++) {
      const sx = (i * 71 + 17) % W;
      const sy = (i * 47 + 9) % Math.floor(H * 0.48);
      c.globalAlpha = 0.25 + 0.45 * Math.sin(t * 1.4 + i * 0.8);
      g.rect(sx, sy, 1, 1, '#c8d8f0');
    }
    c.globalAlpha = 1;

    // crescent moon
    const mx = W - 46, my = 44;
    g.circle(mx, my, 17, '#d4c8a0');
    g.circle(mx + 6, my - 4, 14, '#06101e');

    // sea
    const sea = c.createLinearGradient(0, H * 0.54, 0, H);
    sea.addColorStop(0, '#0c1e34');
    sea.addColorStop(1, '#040c16');
    c.fillStyle = sea; c.fillRect(0, H * 0.54, W, H * 0.46);

    // moonlight reflection on water
    c.globalAlpha = 0.07 + 0.04 * Math.sin(t * 1.2);
    for (let i = 0; i < 5; i++) {
      const wy = H * 0.58 + i * 10 + Math.sin(t * 0.9 + i) * 3;
      g.rect(mx - 12 - i * 3, wy, 24 + i * 4, 2, '#d4c8a0');
    }
    c.globalAlpha = 1;

    // Château d'If silhouette (rocky island with tower)
    c.fillStyle = '#060a12';
    c.beginPath();
    c.moveTo(10, H * 0.54);
    c.lineTo(10, H * 0.40);
    c.lineTo(26, H * 0.34);
    c.lineTo(44, H * 0.38);
    c.lineTo(62, H * 0.33);
    c.lineTo(76, H * 0.41);
    c.lineTo(82, H * 0.54);
    c.closePath(); c.fill();
    // tower
    c.fillStyle = '#08080e';
    c.fillRect(38, H * 0.34 - 22, 14, 22);
    for (let bx = 0; bx < 14; bx += 5) c.fillRect(38 + bx, H * 0.34 - 26, 3, 4);
    // tower window glow
    c.fillStyle = '#c87820'; c.fillRect(43, H * 0.34 - 14, 4, 5);

    if (scene === 'menu') {
      // parchment map overlay
      c.fillStyle = 'rgba(10,14,24,.78)'; c.fillRect(0, 0, W, H);
      // aged map tint lines
      c.globalAlpha = 0.03;
      c.fillStyle = '#c8a860';
      for (let y = 0; y < H; y += 6) c.fillRect(0, y, W, 2);
      c.globalAlpha = 1;
      // draw the sailing route connecting menu nodes (centers)
      // centers: (64,86) (202,164) (118,244) (64,331) (198,414)
      const route = [[64,86],[202,164],[118,244],[64,331],[198,414]];
      c.setLineDash([4, 5]);
      c.strokeStyle = 'rgba(180,150,60,.35)';
      c.lineWidth = 1.5;
      c.beginPath();
      route.forEach(([rx, ry], i) => i === 0 ? c.moveTo(rx, ry) : c.lineTo(rx, ry));
      c.stroke();
      c.setLineDash([]);
      // compass rose corner
      const crx = W - 30, cry = H - 38;
      c.strokeStyle = '#5a4020'; c.lineWidth = 1;
      for (let a = 0; a < 8; a++) {
        const ang = a / 8 * Math.PI * 2, len = a % 2 === 0 ? 14 : 9;
        c.beginPath(); c.moveTo(crx, cry);
        c.lineTo(crx + Math.cos(ang) * len, cry + Math.sin(ang) * len); c.stroke();
      }
      g.circle(crx, cry, 3, '#5a4020');
      api.txtC('N', crx, cry - 22, 7, '#5a4020');
    } else if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(4,8,20,.76)'; c.fillRect(0, 0, W, H);
    }
  }

  // location names for the 5 map nodes
  const LOCS = ['MARSEILLE', "ÎLE D'IF", 'MONTE CRISTO', 'THE SEA', 'PARIS'];

  RetroSaga.create({
    id: 'montecristo',
    title: 'THE COUNT OF MONTE CRISTO',
    subtitle: 'A TALE OF RUIN AND REVENGE',
    currency: 'GOLD',
    accent: '#e3c567',
    credit: 'AFTER ALEXANDRE DUMAS, 1844',
    emblem,
    scenery,
    bootCta: 'TAP TO BEGIN',
    bootLine: 'FIVE ACTS · ONE RECKONING',
    menuLabel: 'THE ROAD TO MONTE CRISTO',
    menuHint: 'TAP A LOCATION TO PLAY',
    menuDone: 'REVENGE IS COMPLETE',

    screens: {
      win: '#e3c567', lose: '#8040a0',
      chapterLabel: '#5a6888', name: '#d0c4f0',
      sub: '#7060b0', intro: '#b0b8d8', quote: '#5a6888',
      help: '#e3c567', score: '#d0c4f0', cur: '#e3c567',
      cta: '#d0c4f0', overlay: 'rgba(4,6,18,.88)',
    },
    labels: {
      chapter: 'ACT', score: 'GOLD EARNED',
      win: 'JUSTICE ADVANCES', lose: 'THE PLAN UNRAVELS',
      cont: 'TAP TO PRESS ON', finale: 'TAP TO CLAIM YOUR THRONE',
      toMenu: 'TAP TO RETURN', play: 'TAP TO BEGIN',
    },

    palette: { stone: '#3a3456', parchment: '#c0a060', ocean: '#0c1e34' },

    menu: {
      colors: { title: '#e3c567', label: '#6070a0', cur: '#d0c4f0', hint: '#6070a0' },
      // scattered map nodes — Mediterranean voyage chart
      layout(api, chapters) {
        return [
          { x: 14,  y: 52,  w: 100, h: 68 },   // Marseille    center (64, 86)
          { x: 152, y: 130, w: 100, h: 68 },   // Île d'If     center (202, 164)
          { x: 68,  y: 210, w: 100, h: 68 },   // Monte Cristo center (118, 244)
          { x: 14,  y: 297, w: 100, h: 68 },   // At Sea       center (64, 331)
          { x: 148, y: 380, w: 110, h: 68 },   // Paris        center (203, 414)
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        // parchment card with folded corner
        c.fillStyle = sel ? '#1c1808' : '#10120c';
        c.fillRect(x, y, w, h);
        // folded corner
        const fc = 12;
        c.fillStyle = sel ? '#c8a840' : '#2a2010';
        c.beginPath(); c.moveTo(x+w-fc,y); c.lineTo(x+w,y+fc); c.lineTo(x+w-fc,y+fc); c.closePath(); c.fill();
        // border
        c.strokeStyle = sel ? '#e3c567' : '#3a3020';
        c.lineWidth = sel ? 2 : 1; c.strokeRect(x+0.5, y+0.5, w-1, h-1);
        // top divider line
        g.rect(x+8, y+20, w-16, 1, sel ? '#6a5428' : '#2a2010');
        // location name
        api.txtCFit(LOCS[i], x+w/2, y+5, 7, done ? '#c8a840' : '#6a5828', false, w-14);
        // chapter name
        api.txtCFit(ch.name, x+w/2, y+26, 8, done ? '#e3c567' : '#b8a878', false, w-12);
        if (ch.sub) api.txtCFit(ch.sub, x+w/2, y+42, 7, done ? '#a09050' : '#504830', false, w-14);
        if (done) {
          api.txtC('★', x+w/2, y+h-14, 10, '#e3c567');
        } else if (sel) {
          api.txtC('▶', x+w-14, y+h/2-5, 10, '#e3c567');
        }
      },
    },

    finale: [
      'THE CONSPIRATORS FALL.',
      'EDMOND DANTÈS IS FREE.',
      '',
      'THE COUNT SAILS ON.',
      '"WAIT AND HOPE."',
    ],

    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ============================= ACT 1: THE BETRAYAL ============================= */
      {
        id: 'betrayal', name: 'THE BETRAYAL', sub: 'MARSEILLE, 1815',
        icon(api, x, y) {
          const g = api.gfx;
          // envelope / letter icon
          g.rect(x-7, y-5, 14, 10, '#c0a060');
          g.rect(x-7, y-5, 14, 1, '#8a7040');
          api.gfx.line(x-7, y-5, x, y+1, '#8a7040');
          api.gfx.line(x+7, y-5, x, y+1, '#8a7040');
        },
        intro: [
          'DANTÈS IS ARRESTED AT',
          'HIS OWN WEDDING FEAST.',
          'THE LETTER OF TREASON —',
          'planted by three false friends.',
        ],
        quote: 'In the whole earth, perhaps, there is no spot more beautiful than that of Monte Cristo.',
        help: 'TAP / DRAG to dodge left and right · avoid 3 gendarmes',
        winText: 'You slip the letter into your coat. The truth is yours — for now.',
        loseText: 'The gendarmes close in. The letter is seized. Villefort reads it.',
        init(api) {
          this.x = api.W / 2;
          this.y = api.H - 70;
          this.enemies = [];
          this.spawnT = 0.9;
          this.survived = 0;
          this.need = 22;
          this.hits = 0;
          this.invuln = 0;
          this.score = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.survived += dt;
          if (this.survived >= this.need) { api.score += 80; api.win(); return; }

          // player movement (horizontal only, near bottom)
          const p = api.pointer;
          if (p.down) this.x += (p.x - this.x) * 0.18 * f;
          if (api.keyDown('left'))  this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 18, api.W - 18);

          // spawn gendarmes (blue-coated figures rushing left)
          this.spawnT -= dt;
          const difficulty = this.survived / this.need;
          if (this.spawnT <= 0) {
            const speed = (2.0 + difficulty * 1.4) * 60;
            this.enemies.push({ x: api.W + 14, y: api.rnd(56, api.H - 56), spd: speed, r: 12 });
            this.spawnT = api.rnd(0.65, 1.2) - difficulty * 0.28;
          }

          // update enemies
          this.invuln = Math.max(0, this.invuln - dt);
          for (const e of this.enemies) {
            e.x -= e.spd * dt;
            if (this.invuln <= 0 && Math.hypot(e.x - this.x, e.y - this.y) < 18) {
              this.hits++;
              this.invuln = 0.8;
              api.shake(6, 0.3);
              api.flash('#c03040', 0.18);
              api.audio.sfx('hurt');
              e.gone = true;
              if (this.hits >= 3) { api.lose(); return; }
            }
          }
          this.enemies = this.enemies.filter(e => e.x > -20 && !e.gone);
          api.score = Math.floor(this.survived * 4);
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          // warm tavern interior
          c.fillStyle = '#120c04';
          c.fillRect(0, 0, W, H);
          // stone wall bricks
          for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
              const bx = col * 36 + (row % 2 ? 18 : 0);
              g.rect(bx, row * 24, 34, 22, row < 4 ? '#1e1408' : '#161008');
            }
          }
          // floor
          g.rect(0, H - 48, W, 48, '#181008');
          for (let fx = 0; fx < W; fx += 32) g.rect(fx, H - 48, 30, 46, '#1c1208');
          // torch glow
          for (const tx of [36, W - 44]) {
            c.globalAlpha = 0.14 + 0.06 * Math.sin(api.t * 7 + tx);
            g.circle(tx, 44, 28, '#e87820');
            c.globalAlpha = 1;
            g.rect(tx - 3, 28, 6, 18, '#5a3a18');
            g.rect(tx - 4, 24, 8, 8, '#ff8820');
          }
          // enemies (gendarmes — blue coats)
          for (const e of this.enemies) {
            g.sprite([
              '.bbb.',
              '.bbb.',
              '.www.',
              '.www.',
              'bb.bb',
              'b...b',
            ], e.x - 10, e.y - 18, { b: '#2040a0', w: '#f0e8d0' }, 4);
          }
          // player (Dantès — dark coat)
          g.sprite([
            '.hh.',
            '.hh.',
            'dddd',
            'dddd',
            'd..d',
            'd..d',
          ], this.x - 8, this.y - 24, { h: '#c09060', d: '#1a1218' }, 4);
          // letter glow near player
          c.globalAlpha = 0.3 + 0.15 * Math.sin(api.t * 4);
          g.circle(this.x, this.y - 30, 8, '#e3c567');
          c.globalAlpha = 1;

          api.topBar('THE BETRAYAL');
          api.txt('DODGE ' + Math.ceil(this.need - this.survived) + 's', 6, 20, 9, api.colors.gold);
          for (let i = 0; i < 3; i++) {
            g.rect(W - 16 - i * 13, 18, 9, 8, i < (3 - this.hits) ? '#5dff8f' : '#3a1414');
          }
          // time bar
          g.rect(6, H - 10, W - 12, 5, '#18160c');
          g.rect(6, H - 10, (W - 12) * (this.survived / this.need), 5, api.colors.gold);
          api.vignette(); api.scanlines();
        },
      },

      /* ============================= ACT 2: CHÂTEAU D'IF ============================= */
      {
        id: 'dif', name: "CHÂTEAU D'IF", sub: 'THE PRISON WALL',
        icon(api, x, y) {
          const g = api.gfx;
          // pickaxe icon
          g.rect(x-7, y-1, 14, 3, '#7a6040');
          g.rect(x-2, y-5, 4, 5, '#9a8060');
          g.rect(x+2, y-3, 3, 3, '#9a8060');
        },
        intro: [
          'THIRTEEN YEARS IN A',
          'STONE CELL. FARIA DIGS.',
          'NOW IT IS DANTÈS\' TURN',
          'to chip through to freedom.',
        ],
        quote: 'All human wisdom is contained in two words: wait and hope.',
        help: 'TAP when the chisel glows in the crack · 10 strikes to break through',
        winText: 'Stone crumbles. Cold sea air floods in. Faria smiles in the dark.',
        loseText: 'The guards hear the tapping. The cell door slams open.',
        init(api) {
          this.m = 0;      // marker position 0–1
          this.dir = 1;
          this.spd = 0.85;
          this.zone = 0.22;  // hit zone half-width
          this.digs = 0;
          this.need = 10;
          this.misses = 0;
          this.maxMiss = 4;
          this.flash = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.m += this.dir * this.spd * 0.03 * f;
          if (this.m >= 1) { this.m = 1; this.dir = -1; }
          if (this.m <= 0) { this.m = 0; this.dir = 1; }
          this.flash = Math.max(0, this.flash - dt * 3);

          if (api.confirm()) {
            if (Math.abs(this.m - 0.5) < this.zone / 2) {
              this.digs++;
              api.score += 20;
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H * 0.52, '#c0a060', 8);
              this.flash = 1;
              this.spd = Math.min(2.6, this.spd + 0.14);
              this.zone = Math.max(0.09, this.zone - 0.011);
              if (this.digs >= this.need) { api.score += 80; api.win(); }
            } else {
              this.misses++;
              api.shake(5, 0.25);
              api.audio.sfx('hurt');
              api.flash('#400018', 0.2);
              if (this.misses >= this.maxMiss) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#0e0c14');
          // stone wall
          for (let row = 0; row < 14; row++) {
            for (let col = 0; col < 7; col++) {
              const bx = col * 40 + (row % 2 ? 20 : 0);
              g.rect(bx, row * 36, 38, 34, '#18161e');
              g.rect(bx+1, row*36+1, 36, 32, '#1e1c28');
            }
          }
          // crack in wall (progress)
          const crackX = W / 2, crackY = H * 0.45;
          const pct = this.digs / this.need;
          c.strokeStyle = this.flash > 0 ? '#f0d060' : '#4a3828';
          c.lineWidth = this.flash > 0 ? 2 : 1.5;
          c.beginPath();
          for (let ci = 0; ci <= 10; ci++) {
            const cx2 = crackX + (ci % 2 ? 4 : -4) + (ci - 5) * 1.5;
            const cy2 = crackY - 30 + ci * 6 * pct;
            ci === 0 ? c.moveTo(cx2, crackY - 30) : c.lineTo(cx2, cy2);
          }
          c.stroke();
          // gap opening as progress increases
          if (pct > 0.3) {
            c.globalAlpha = pct * 0.6;
            g.circle(crackX, crackY - 10, 8 * pct, '#0a1828');
            c.globalAlpha = 1;
          }
          // torch
          c.globalAlpha = 0.12 + 0.06 * Math.sin(api.t * 8);
          g.circle(W - 30, 100, 22, '#e07010');
          c.globalAlpha = 1;
          g.rect(W - 33, 86, 6, 18, '#5a3a18');
          g.rect(W - 34, 82, 8, 8, '#ff8010');
          // chisel meter
          const mx = 28, my = H - 56, mw = W - 56;
          g.rect(mx, my, mw, 14, '#0a0810');
          g.rect(mx + mw * (0.5 - this.zone / 2), my, mw * this.zone, 14, 'rgba(180,150,60,.32)');
          g.rect(mx + mw * 0.5 - 1, my - 3, 2, 20, '#6a5030');
          const inZone = Math.abs(this.m - 0.5) < this.zone / 2;
          g.rect(mx + mw * this.m - 3, my - 4, 6, 22, inZone ? '#f0d860' : '#c0a060');
          api.topBar("CHÂTEAU D'IF");
          api.txt('STRUCK ' + this.digs + '/' + this.need, 6, 20, 9, api.colors.gold);
          api.txt('NOISE ' + this.misses + '/4', W - 80, 20, 9, this.misses > 2 ? '#c03040' : api.colors.dim);
          api.vignette(); api.scanlines();
        },
      },

      /* ============================= ACT 3: THE TREASURE ============================= */
      {
        id: 'treasure', name: 'THE TREASURE', sub: "MONTE CRISTO'S CAVE",
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x-6, y-1, 12, 8, '#8a6020');
          g.rect(x-5, y-3, 10, 2, '#a07828');
          g.rect(x-3, y+1, 6, 5, '#e3c567');
        },
        intro: [
          'THE ABBÉ\'S MAP LEADS',
          'TO A CAVE CRAMMED',
          'WITH GOLD AND JEWELS —',
          'the fortune of Spada.',
        ],
        quote: 'There is nothing like the sight of an old friend. Gold is the one true friend.',
        help: 'TAP / DRAG to move the sack · catch falling gems · collect 18',
        winText: 'The sack grows heavy. Edmond Dantès is the richest man in Europe.',
        loseText: 'The tide rises. The gems scatter. The cave goes dark.',
        init(api) {
          this.x = api.W / 2;
          this.gems = [];
          this.spawnT = 0.5;
          this.caught = 0;
          this.need = 18;
          this.timer = 26;
          this.sackW = 28;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          if (this.timer <= 0) { api.lose(); return; }

          // move sack
          const p = api.pointer;
          if (p.down) this.x += (p.x - this.x) * 0.20 * f;
          if (api.keyDown('left'))  this.x -= 4 * f;
          if (api.keyDown('right')) this.x += 4 * f;
          this.x = clamp(this.x, this.sackW / 2 + 4, api.W - this.sackW / 2 - 4);

          // spawn gems
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            const colours = ['#e3c567','#5dff8f','#21e6ff','#ff2e97','#ff8a3d','#c0a0ff'];
            this.gems.push({
              x: api.rnd(16, api.W - 16),
              y: -10,
              spd: api.rnd(90, 160),
              col: api.choice(colours),
              r: api.rnd(4, 7),
            });
            this.spawnT = api.rnd(0.28, 0.55);
          }

          // update gems
          const sackTop = api.H - 60;
          for (const gem of this.gems) {
            gem.y += gem.spd * dt;
            if (!gem.caught && gem.y >= sackTop && Math.abs(gem.x - this.x) < this.sackW / 2 + gem.r) {
              gem.caught = true;
              this.caught++;
              api.score += 8;
              api.audio.sfx('coin');
              api.burst(gem.x, sackTop, gem.col, 6);
              if (this.caught >= this.need) { api.score += Math.floor(this.timer * 4); api.win(); }
            }
          }
          this.gems = this.gems.filter(gem => gem.y < api.H + 10 && !gem.caught);
          api.score = this.caught * 8 + Math.floor((26 - this.timer) * 1.5);
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#080610');
          // cave walls
          c.fillStyle = '#0e0c18';
          c.beginPath();
          c.moveTo(0, 0); c.lineTo(0, H);
          c.lineTo(30, H); c.lineTo(22, H * 0.6); c.lineTo(18, H * 0.3); c.lineTo(30, 0);
          c.closePath(); c.fill();
          c.beginPath();
          c.moveTo(W, 0); c.lineTo(W, H);
          c.lineTo(W - 30, H); c.lineTo(W - 24, H * 0.6); c.lineTo(W - 20, H * 0.3); c.lineTo(W - 28, 0);
          c.closePath(); c.fill();
          // stalactites
          for (let i = 0; i < 7; i++) {
            const sx = 36 + i * 30;
            const sh = 20 + (i % 3) * 12;
            c.fillStyle = '#16141e';
            c.beginPath(); c.moveTo(sx - 6, 0); c.lineTo(sx + 6, 0); c.lineTo(sx, sh); c.closePath(); c.fill();
          }
          // gems in air
          for (const gem of this.gems) {
            c.globalAlpha = 0.85 + 0.15 * Math.sin(api.t * 8 + gem.x);
            g.circle(gem.x, gem.y, gem.r, gem.col);
            c.globalAlpha = 0.5;
            g.circle(gem.x - 1, gem.y - 1, gem.r * 0.45, '#ffffff');
            c.globalAlpha = 1;
          }
          // sack
          const sy = H - 60;
          g.rect(this.x - 14, sy, 28, 22, '#6a4820');
          g.rect(this.x - 12, sy + 1, 24, 20, '#8a6030');
          g.rect(this.x - 8, sy - 4, 16, 6, '#5a3a18');
          // sack fill indicator
          const fill = this.caught / this.need;
          g.rect(this.x - 12, sy + 22 - 20 * fill, 24, 20 * fill, 'rgba(220,190,60,.45)');
          // glow under sack
          c.globalAlpha = 0.10 + 0.06 * Math.sin(api.t * 3);
          g.circle(this.x, sy + 10, 26, '#e3c567');
          c.globalAlpha = 1;

          api.topBar('THE TREASURE');
          api.txt('GEMS ' + this.caught + '/' + this.need, 6, 20, 9, api.colors.gold);
          g.rect(W - 64, 21, 58, 5, '#18140c');
          g.rect(W - 64, 21, 58 * (1 - clamp(this.timer / 26, 0, 1)), 5, api.colors.gold);
          api.vignette(); api.scanlines();
        },
      },

      /* ============================= ACT 4: THE SEA ============================= */
      {
        id: 'sea', name: 'THE SEA', sub: 'THE BURIAL SACK',
        icon(api, x, y) {
          const g = api.gfx;
          // wave icon
          for (let i = 0; i < 3; i++) {
            g.rect(x - 7 + i * 3, y - 2 + (i % 2 ? -3 : 0), 6, 4, '#21e6ff');
          }
        },
        intro: [
          'SEWN IN FARIA\'S BURIAL SACK,',
          'DANTÈS IS FLUNG FROM',
          'THE CLIFFS OF THE ÎLE D\'IF.',
          'Swim. Survive.',
        ],
        quote: 'He was free — free, with that freedom that is sweeter than all else.',
        help: 'TAP / DRAG to steer · avoid the debris · 20 seconds to shore',
        winText: 'A fisherman\'s lantern flickers ahead. The island of Tiboulen. He is free.',
        loseText: 'A rock catches him full. The cold sea closes over his head.',
        init(api) {
          this.x = api.W / 2;
          this.y = api.H * 0.62;
          this.obstacles = [];
          this.spawnT = 1.0;
          this.survived = 0;
          this.need = 20;
          this.hits = 0;
          this.invuln = 0;
          this.wake = [];
        },
        update(api, dt) {
          const f = dt * 60;
          this.survived += dt;
          if (this.survived >= this.need) { api.score += 80; api.win(); return; }

          // steer
          const p = api.pointer;
          if (p.down) this.x += (p.x - this.x) * 0.15 * f;
          if (api.keyDown('left'))  this.x -= 3.2 * f;
          if (api.keyDown('right')) this.x += 3.2 * f;
          this.x = clamp(this.x, 18, api.W - 18);

          // wake trail
          this.wake.push({ x: this.x, y: this.y, life: 0.5 });
          this.wake.forEach(w => w.life -= dt);
          this.wake = this.wake.filter(w => w.life > 0);

          // spawn rocks/debris
          this.spawnT -= dt;
          const diff = this.survived / this.need;
          if (this.spawnT <= 0) {
            const w2 = api.rnd(10, 22);
            this.obstacles.push({
              x: api.rnd(w2 + 4, api.W - w2 - 4),
              y: -18,
              spd: (60 + diff * 30),
              w: w2,
            });
            this.spawnT = api.rnd(0.55, 1.0) - diff * 0.2;
          }

          // update rocks
          this.invuln = Math.max(0, this.invuln - dt);
          for (const ob of this.obstacles) {
            ob.y += ob.spd * dt;
            if (this.invuln <= 0 && Math.hypot(ob.x - this.x, ob.y - this.y) < ob.w + 12) {
              this.hits++;
              this.invuln = 0.8;
              api.shake(6, 0.3);
              api.flash('#1a3a6a', 0.2);
              api.audio.sfx('hurt');
              ob.gone = true;
              if (this.hits >= 3) { api.lose(); return; }
            }
          }
          this.obstacles = this.obstacles.filter(ob => ob.y < api.H + 22 && !ob.gone);
          api.score = Math.floor(this.survived * 4);
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          // night sea
          c.fillStyle = '#040c16';
          c.fillRect(0, 0, W, H);
          // sea pattern (horizontal waves)
          const waveBase = '#061422';
          for (let row = 0; row < H / 18 + 1; row++) {
            const wy = row * 18 + (api.t * 12) % 18;
            c.globalAlpha = 0.5;
            c.fillStyle = row % 3 === 0 ? '#0a1e30' : waveBase;
            c.fillRect(0, wy, W, 9);
            c.globalAlpha = 1;
          }
          // moonlight column
          c.globalAlpha = 0.04;
          g.rect(W / 2 - 20, 0, 40, H, '#d4c8a0');
          c.globalAlpha = 1;
          // stars visible above
          for (let i = 0; i < 20; i++) {
            const sx = (i * 89 + 11) % W;
            c.globalAlpha = 0.2 + 0.3 * Math.sin(api.t * 1.5 + i);
            g.rect(sx, 6 + (i * 17 + 5) % 40, 1, 1, '#c8d8f0');
          }
          c.globalAlpha = 1;
          // wake trail
          for (const w of this.wake) {
            c.globalAlpha = w.life * 0.5;
            g.rect(w.x - 2, w.y + 8, 4, 2, '#4ab8d8');
            c.globalAlpha = 1;
          }
          // rocks
          for (const ob of this.obstacles) {
            g.circle(ob.x, ob.y, ob.w, '#181828');
            g.circle(ob.x - ob.w * 0.3, ob.y - ob.w * 0.2, ob.w * 0.4, '#22223a');
          }
          // player (sack silhouette + head)
          const inv = this.invuln > 0 && Math.floor(api.t * 12) % 2 === 0;
          if (!inv) {
            g.circle(this.x, this.y - 16, 9, '#c09060');
            g.sprite([
              'sssss',
              'sssss',
              'sssss',
              '.sss.',
              '.sss.',
            ], this.x - 10, this.y - 8, { s: '#4a3018' }, 4);
          }
          // shore hint at bottom
          g.rect(0, H - 8, W, 8, '#0c1a0c');
          api.txtC('SHORE', W / 2, H - 14, 7, '#2a4a2a');

          api.topBar('THE SEA');
          api.txt('SWIM ' + Math.ceil(this.need - this.survived) + 's', 6, 20, 9, api.colors.gold);
          for (let i = 0; i < 3; i++) {
            g.rect(W - 16 - i * 13, 18, 9, 8, i < (3 - this.hits) ? '#21e6ff' : '#1a1a2a');
          }
          g.rect(6, H - 16, W - 12, 4, '#0c1020');
          g.rect(6, H - 16, (W - 12) * (this.survived / this.need), 4, '#21e6ff');
          api.vignette(); api.scanlines();
        },
      },

      /* ============================= ACT 5: THE RECKONING ============================= */
      {
        id: 'reckoning', name: 'THE RECKONING', sub: 'THREE MEN TO ANSWER',
        icon(api, x, y) {
          const g = api.gfx;
          // scales of justice
          g.rect(x-1, y-7, 2, 12, '#c8a840');
          g.rect(x-7, y-2, 14, 1, '#c8a840');
          g.rect(x-7, y-2, 1, 5, '#c8a840');
          g.rect(x+6, y-2, 1, 5, '#c8a840');
        },
        intro: [
          'FERNAND THE BETRAYER.',
          'DANGLARS THE SCHEMER.',
          'VILLEFORT THE JUDGE.',
          'Each answers tonight.',
        ],
        quote: 'I am the hand of God... I am retribution.',
        help: 'TAP when the ring meets the seal · 3 exposures to bring justice',
        winText: 'Three names struck. Three families undone. The Count raises his glass.',
        loseText: 'Too hesitant. The conspirators scatter into the Paris night.',
        init(api) {
          this.villains = [
            { name: 'FERNAND',   col: '#c03050', done: false },
            { name: 'DANGLARS',  col: '#a040c0', done: false },
            { name: 'VILLEFORT', col: '#4060c0', done: false },
          ];
          this.cur = 0;
          this.r = 48;
          this.dir = -1;
          this.spd = 0.9;
          this.seal = 14;
          this.misses = 0;
          this.maxMiss = 5;
          this.flashT = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          if (this.villains[this.cur].done) {
            // advance to next
            const next = this.villains.findIndex((v, i) => i > this.cur && !v.done);
            if (next < 0) { api.score += 100; api.win(); return; }
            this.cur = next;
            this.r = 48; this.spd = 0.9;
          }
          this.r += this.dir * this.spd * f;
          if (this.r >= 52) { this.r = 52; this.dir = -1; }
          if (this.r <= 6)  { this.r = 6;  this.dir = 1;  }
          this.flashT = Math.max(0, this.flashT - dt * 3);

          if (api.confirm()) {
            if (Math.abs(this.r - this.seal) < 7) {
              this.villains[this.cur].done = true;
              api.score += 40;
              api.audio.sfx('power');
              api.shake(5, 0.25);
              api.burst(api.W / 2, api.H / 2, this.villains[this.cur].col, 14);
              api.flash(this.villains[this.cur].col, 0.18);
              this.spd = Math.min(2.4, this.spd + 0.22);
              this.flashT = 1;
            } else {
              this.misses++;
              api.audio.sfx('hurt');
              api.shake(3, 0.15);
              if (this.misses >= this.maxMiss) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#06040e');
          // Parisian salon — dark curtains
          g.rect(0, 0, 28, H, '#0c0818');
          g.rect(W - 28, 0, 28, H, '#0c0818');
          // curtain folds
          for (let i = 0; i < 4; i++) {
            g.rect(4 + i * 6, 0, 3, H, '#100e1c');
            g.rect(W - 26 + i * 6, 0, 3, H, '#100e1c');
          }
          // floor
          g.rect(0, H - 36, W, 36, '#0e0c10');
          for (let fx = 28; fx < W - 28; fx += 24) g.rect(fx, H - 36, 22, 34, '#100e12');
          // villain portraits
          for (let vi = 0; vi < 3; vi++) {
            const v = this.villains[vi];
            const vx = 50 + vi * 60, vy = H * 0.28;
            const isActive = vi === this.cur && !v.done;
            // portrait frame
            g.rect(vx - 18, vy - 32, 36, 52, '#1a1420');
            g.rectO(vx - 18, vy - 32, 36, 52, v.done ? v.col : (isActive ? '#d0c8a0' : '#3a3040'), 1);
            // silhouette
            if (!v.done) {
              g.circle(vx, vy - 14, 10, '#120e18');
              g.rect(vx - 8, vy - 4, 16, 18, '#0e0c14');
            } else {
              // crossed out
              g.circle(vx, vy - 14, 10, v.col);
              g.rect(vx - 8, vy - 4, 16, 18, v.col);
              c.strokeStyle = '#ffffff'; c.lineWidth = 2;
              c.beginPath(); c.moveTo(vx - 16, vy - 30); c.lineTo(vx + 16, vy + 18); c.stroke();
              c.beginPath(); c.moveTo(vx + 16, vy - 30); c.lineTo(vx - 16, vy + 18); c.stroke();
            }
            api.txtCFit(v.name, vx, vy + 22, 6, v.done ? v.col : '#4a4058', false, 34);
          }

          // active ring around current villain
          if (!this.villains[this.cur].done) {
            const vx = 50 + this.cur * 60, vy = H * 0.28;
            const col = this.villains[this.cur].col;
            // seal target
            c.strokeStyle = 'rgba(180,160,80,.5)';
            c.lineWidth = 2;
            c.beginPath(); c.arc(vx, vy - 10, this.seal, 0, Math.PI * 2); c.stroke();
            // closing ring
            const inZone = Math.abs(this.r - this.seal) < 7;
            c.strokeStyle = inZone ? '#f0e060' : col;
            c.lineWidth = inZone ? 2.5 : 1.5;
            c.beginPath(); c.arc(vx, vy - 10, this.r, 0, Math.PI * 2); c.stroke();
            // pulsing glow on active portrait
            c.globalAlpha = 0.12 + 0.08 * Math.sin(api.t * 5);
            g.circle(vx, vy - 10, 26, col);
            c.globalAlpha = 1;
          }

          // candelabra
          for (const cx2 of [W / 2 - 44, W / 2 + 44]) {
            g.rect(cx2 - 2, H - 36, 4, 22, '#5a4820');
            g.rect(cx2 - 5, H - 44, 10, 10, '#c0a830');
            c.globalAlpha = 0.16 + 0.07 * Math.sin(api.t * 7 + cx2);
            g.circle(cx2, H - 44, 18, '#e8a020');
            c.globalAlpha = 1;
          }

          api.topBar('THE RECKONING');
          api.txt('EXPOSED', 6, 20, 9, api.colors.gold);
          for (let vi = 0; vi < 3; vi++) {
            const vx = W - 46 + vi * 14;
            g.rect(vx, 18, 10, 8, this.villains[vi].done ? this.villains[vi].col : '#201c28');
          }
          api.txt('MISS ' + this.misses + '/5', W - 64, 29, 7, this.misses > 3 ? '#c03040' : api.colors.dim);
          api.vignette(); api.scanlines();
        },
      },

    ], // end chapters
  });
})();
