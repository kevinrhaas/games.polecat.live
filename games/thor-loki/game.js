/* ============================================================================
 * THOR & LOKI — HAMMER OF THE GODS
 * Five tales from Norse mythology:
 *   1. THE BIFROST        — steer Thor, dodge Frost Giant boulders
 *   2. JÖRMUNGANDR        — hold-and-release to haul the World Serpent
 *   3. LOKI'S SHAPES      — tap the real Loki among shapeshifted decoys
 *   4. WOLVES AT THE GATE — seal three Asgard gates before Fenrir's brood breaks through
 *   5. RAGNARÖK           — dodge Surtr's fire-sword swings and hurl Mjolnir
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Emblem: Mjolnir ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    g.rect(cx - 22, cy - 20, 44, 24, '#7a8aaa');
    g.rect(cx - 20, cy - 18, 40, 20, '#b0c0d8');
    g.rect(cx - 22, cy - 20, 44, 5,  '#d0e0f0');
    g.rect(cx - 22, cy - 20, 3,  24, '#c0d0e8');
    g.rect(cx - 2,  cy - 16, 4,  14, '#7aa4d8');
    g.rect(cx - 8,  cy - 8,  6,  2,  '#7aa4d8');
    g.rect(cx + 2,  cy - 8,  6,  2,  '#7aa4d8');
    g.rect(cx - 5,  cy + 4,  10, 22, '#6a4828');
    g.rect(cx - 4,  cy + 4,  3,  22, '#8a6040');
    g.rect(cx - 7,  cy + 26, 14, 4,  '#4a3018');
    g.rect(cx + 14, cy - 14, 2,  8,  '#c0e8ff');
    g.rect(cx + 10, cy - 10, 2,  4,  '#c0e8ff');
    g.rect(cx + 16, cy - 10, 2,  4,  '#c0e8ff');
  }

  /* ─── Scenery: northern lights, Asgard spires, Yggdrasil ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#020810');
    sky.addColorStop(0.5, '#060e20');
    sky.addColorStop(1, '#040a18');
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 55; i++) {
      const sx = (i * 67 + 11) % W;
      const sy = (i * 43 + 7) % Math.floor(H * 0.52);
      c.globalAlpha = 0.18 + 0.45 * Math.sin(t * 0.9 + i * 1.3);
      g.rect(sx, sy, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1, '#cce0ff');
    }
    c.globalAlpha = 1;

    // Aurora borealis
    const auroraData = [
      { col: 'rgba(0,200,100,1)',  cx: 0.42, ph: 0,   cy: 0.14 },
      { col: 'rgba(50,130,220,1)', cx: 0.58, ph: 2.2, cy: 0.22 },
      { col: 'rgba(140,50,220,1)', cx: 0.50, ph: 4.5, cy: 0.30 },
    ];
    for (const a of auroraData) {
      const axC = (a.cx + 0.06 * Math.sin(t * 0.3 + a.ph)) * W;
      const aw  = (0.55 + 0.1 * Math.sin(t * 0.25 + a.ph)) * W;
      c.globalAlpha = 0.05 + 0.03 * Math.sin(t * 0.45 + a.ph);
      c.fillStyle = a.col;
      c.beginPath();
      c.ellipse(axC, a.cy * H + 16, aw / 2, 22 + 5 * Math.sin(t * 0.5 + a.ph), 0, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;

    // Yggdrasil — larger and more prominent in menu
    const isMenu = scene === 'menu';
    const trunkX = W / 2;
    const trunkBase = H - 56;
    const trunkTop  = isMenu ? 90 : 116;
    const trunkW    = isMenu ? 12 : 7;
    const treeAlpha = isMenu ? 0.9 : 0.35;

    c.globalAlpha = treeAlpha;
    c.fillStyle = '#2a1e0e';
    c.fillRect(trunkX - trunkW / 2, trunkTop, trunkW, trunkBase - trunkTop);
    c.fillStyle = '#3e2e18';
    c.fillRect(trunkX - trunkW / 2 + 1, trunkTop, Math.ceil(trunkW / 3), trunkBase - trunkTop);

    // Root tendrils
    for (let ri = 0; ri < 5; ri++) {
      const rdx = (ri - 2) * 26 + Math.sin(t * 0.6 + ri) * 3;
      c.strokeStyle = '#2a1e0e';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(trunkX + rdx * 0.35, trunkBase);
      c.quadraticCurveTo(trunkX + rdx * 0.65, trunkBase + 9, trunkX + rdx, trunkBase + 18 + ri * 3);
      c.stroke();
    }

    // Branches (only in menu — connect tree to stone positions)
    if (isMenu) {
      const brs = [
        [trunkX - 7, trunkTop + 44, trunkX - 95, trunkTop - 14],  // upper-left → ch1
        [trunkX + 7, trunkTop + 44, trunkX + 95, trunkTop - 14],  // upper-right → ch2
        [trunkX - 5, trunkTop + 138, trunkX - 92, trunkTop + 192], // lower-left → ch4
        [trunkX + 5, trunkTop + 138, trunkX + 92, trunkTop + 192], // lower-right → ch5
      ];
      for (const [sx, sy2, ex, ey] of brs) {
        c.strokeStyle = '#2a1e0e';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(sx, sy2);
        c.quadraticCurveTo((sx + ex) / 2 + (ex > trunkX ? 10 : -10), (sy2 + ey) / 2, ex, ey);
        c.stroke();
      }
    }

    // Foliage glow
    c.globalAlpha = treeAlpha * (0.08 + 0.03 * Math.sin(t * 0.7));
    c.fillStyle = '#28d848';
    c.beginPath();
    c.arc(trunkX, trunkTop + 10, isMenu ? 68 : 38, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;

    // Asgard spires
    const baseY = H - 58;
    const spires = [[12, 54], [44, 72], [80, 46], [152, 50], [188, 74], [220, 54], [248, 40]];
    c.fillStyle = '#080e1c';
    for (const [sx, sh] of spires) {
      c.fillRect(sx, baseY - sh, 16, sh);
      c.fillStyle = '#b09228';
      c.beginPath();
      c.moveTo(sx + 8, baseY - sh - 14);
      c.lineTo(sx, baseY - sh);
      c.lineTo(sx + 16, baseY - sh);
      c.closePath();
      c.fill();
      c.fillStyle = '#080e1c';
      g.rect(sx + 3, baseY - sh + 14, 10, 12, '#c8a030');
    }
    c.fillStyle = '#060c18';
    c.fillRect(0, H - 28, W, 28);
    c.globalAlpha = 0.12;
    c.fillStyle = '#e8c848';
    c.fillRect(0, H - 28, W, 28);
    c.globalAlpha = 1;

    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(2,5,16,.76)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(2,5,16,.40)';
      c.fillRect(0, 0, W, H);
    }
  }

  /* ======================================================================
   * SAGA
   * ====================================================================== */
  RetroSaga.create({
    id: 'thor',
    title: 'Thor & Loki',
    subtitle: 'HAMMER OF THE GODS',
    currency: 'GLORY',
    screens: {
      win: '#a4d8ff', lose: '#6840a0', chapterLabel: '#7090c8',
      name: '#d8eaff', sub: '#e8c84a', intro: '#b8d0f0',
      quote: '#7088a8', help: '#a4d8ff',
      score: '#d8eaff', cur: '#e8c84a', cta: '#d8eaff',
      overlay: 'rgba(2,5,18,.88)',
    },
    labels: {
      chapter: 'TALE', score: 'GLORY EARNED',
      win: 'ASGARD STANDS', lose: 'THE GIANTS LAUGH',
      cont: 'TAP TO PRESS ON', finale: 'TAP FOR RAGNARÖK',
      toMenu: 'TAP TO RETURN', play: 'TAP TO BEGIN',
    },
    accent: '#e8c84a',
    credit: 'A PIXEL TRIBUTE · NORSE MYTHOLOGY',
    emblem,
    scenery,
    bootCta: 'TAP TO ENTER',
    bootLine: '5 TALES · ONE LEGEND',
    menuLabel: 'TALES OF THE AESIR',
    menuHint: 'CHOOSE A TALE TO BEGIN',
    menuDone: 'THE HAMMER HAS SPOKEN',
    menu: {
      colors: { title: '#e8c84a', label: '#7090c8', cur: '#d8eaff', hint: '#8090b8' },
      // Runic stones scattered around the World Tree (Yggdrasil)
      layout(api) {
        return [
          { x: 6,   y: 68,  w: 92,  h: 72 },  // ch1: upper-left branch
          { x: 172, y: 78,  w: 92,  h: 72 },  // ch2: upper-right branch
          { x: 78,  y: 184, w: 114, h: 72 },  // ch3: center trunk
          { x: 6,   y: 298, w: 92,  h: 72 },  // ch4: lower-left root
          { x: 172, y: 298, w: 92,  h: 72 },  // ch5: lower-right root
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        // Irregular RUNIC STONE shape
        c.fillStyle = sel ? '#222050' : '#141230';
        c.beginPath();
        c.moveTo(x + 7,     y);
        c.lineTo(x + w - 5, y + 3);
        c.lineTo(x + w - 1, y + h - 7);
        c.lineTo(x + w - 8, y + h);
        c.lineTo(x + 5,     y + h - 3);
        c.lineTo(x + 1,     y + h - 9);
        c.lineTo(x + 2,     y + 8);
        c.closePath();
        c.fill();
        c.strokeStyle = done ? '#e8c84a' : (sel ? '#a4d8ff' : '#2a3060');
        c.lineWidth = sel ? 2 : 1;
        c.stroke();
        // Carved groove (texture)
        c.globalAlpha = 0.18;
        c.strokeStyle = '#8090c0';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(x + 8,     y + h * 0.38);
        c.lineTo(x + w - 7, y + h * 0.38);
        c.stroke();
        c.globalAlpha = 1;
        // Chapter icon
        const icx = x + w / 2, icy = y + h / 2 - 11;
        if (ch.icon) ch.icon(api, icx, icy);
        // Tale number
        api.txtC('' + (i + 1), icx, icy + 14, 7, done ? '#e8c84a' : '#8090c0', true);
        // Name
        api.txtCFit(ch.name, icx, y + h - 18, 6, done ? '#e8c84a' : '#c0d8f0', false, w - 10);
        if (done) api.txtC('✦', icx, y + 5, 8, '#e8c84a');
      },
    },
    finale: ['JÖRMUNGANDR FALLS.', 'SURTR IS DUST.', 'THE NINE REALMS BREATHE.', '', 'ASGARD ENDURES.'],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#e8c84a', ice: '#a4d8ff', lightning: '#d0e8ff', loki: '#3db87a' },

    chapters: [

      /* ======================= 1. THE BIFROST ======================= */
      {
        id: 'bifrost',
        name: 'THE BIFROST',
        sub: 'BRIDGE OF THE GODS',
        icon(api, x, y) {
          const g = api.gfx;
          const cols = ['#ff5050', '#ff8a20', '#e8e040', '#50d860', '#50c0ff', '#9060d0'];
          for (let ci = 0; ci < 6; ci++) g.rect(x - 13 + ci * 4, y - 1, 4, 5, cols[ci]);
          g.rect(x - 14, y + 5, 28, 2, '#b8c0d8');
        },
        intro: [
          'FROST GIANTS HURL BOULDERS',
          'ACROSS THE RAINBOW BRIDGE.',
          'THOR MUST REACH ASGARD.',
          'Dodge everything in your path!',
        ],
        quote: 'Bifrost is the burning rainbow bridge, guarded by the Watchman Heimdall.',
        help: 'DRAG or ← → to steer · dodge boulders · grab runes for glory',
        winText: 'Thor drives through the last giant and plants Mjolnir in Asgard\'s soil.',
        loseText: 'The boulders batter Thor from the bridge and into the void.',
        init(api) {
          this.x       = api.W / 2;
          this.progress = 0;
          this.hp      = 3;
          this.boulders = [];
          this.runes   = [];
          this.spawnB  = 0.9;
          this.spawnR  = 1.8;
          this.speed   = 1.0;
          this.hurtT   = 0;
          this.runesGot = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          if (api.pointer.down) this.x = api.pointer.x;
          if (api.keyDown('left'))  this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 22, api.W - 22);

          this.progress += dt * 0.022 * this.speed;
          this.speed = Math.min(2.0, 1.0 + this.progress * 0.9);
          if (this.hurtT > 0) this.hurtT -= dt;

          // Spawn boulders
          this.spawnB -= dt;
          if (this.spawnB <= 0) {
            this.boulders.push({ x: api.rnd(20, api.W - 20), y: -18, vy: 2.4 + this.progress * 1.8 + api.rnd(0, 0.8) });
            this.spawnB = api.rnd(0.35, 0.75) / this.speed;
          }
          // Spawn runes
          this.spawnR -= dt;
          if (this.spawnR <= 0) {
            this.runes.push({ x: api.rnd(20, api.W - 20), y: -12, vy: 1.4 + api.rnd(0, 0.4) });
            this.spawnR = api.rnd(1.2, 2.5);
          }

          const thorY = api.H - 66;
          for (const b of this.boulders) {
            b.y += b.vy * f;
            if (this.hurtT <= 0 && Math.hypot(this.x - b.x, thorY - b.y) < 20) {
              this.hp--;
              b.y = api.H + 60;
              api.shake(7, 0.3);
              api.flash('#3a60b0', 0.18);
              api.audio.sfx('hurt');
              this.hurtT = 0.9;
              if (this.hp <= 0) { api.lose(); return; }
            }
          }
          this.boulders = this.boulders.filter((b) => b.y < api.H + 30);

          for (const r of this.runes) {
            r.y += r.vy * f;
            if (Math.hypot(this.x - r.x, thorY - r.y) < 22) {
              r.gone = true;
              this.runesGot++;
              api.addScore(20);
              api.burst(r.x, r.y, '#e8c84a', 8);
              api.audio.sfx('coin');
            }
          }
          this.runes = this.runes.filter((r) => !r.gone && r.y < api.H + 20);

          if (this.progress >= 1) { api.addScore(80); api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#030c1c';
          c.fillRect(0, 0, W, H);

          // Aurora glow
          c.globalAlpha = 0.13;
          c.fillStyle = '#20c870';
          c.beginPath(); c.ellipse(W * 0.38, H * 0.22, W * 0.7, 30, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#4080e0';
          c.beginPath(); c.ellipse(W * 0.62, H * 0.36, W * 0.5, 22, 0, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;

          for (let i = 0; i < 28; i++) g.rect((i * 71 + 5) % W, (i * 43 + 9) % Math.floor(H * 0.55), 1, 1, '#99b8e0');

          // Rainbow bridge
          const bridgeY = H - 74;
          const bCols = ['rgba(255,70,70,.48)','rgba(255,148,20,.48)','rgba(220,220,30,.48)','rgba(60,215,80,.48)','rgba(60,160,255,.48)','rgba(160,80,240,.48)'];
          for (let bi = 0; bi < 6; bi++) { c.fillStyle = bCols[bi]; c.fillRect(0, bridgeY + bi * 5, W, 5); }
          c.fillStyle = 'rgba(180,200,255,.10)';
          c.fillRect(0, bridgeY, W, 36);

          // Boulders
          for (const b of this.boulders) {
            c.fillStyle = '#3a4868';
            c.beginPath();
            c.moveTo(b.x, b.y - 13); c.lineTo(b.x + 14, b.y - 4);
            c.lineTo(b.x + 11, b.y + 11); c.lineTo(b.x - 11, b.y + 11);
            c.lineTo(b.x - 14, b.y - 4); c.closePath(); c.fill();
            c.fillStyle = '#5a6888';
            c.fillRect(b.x - 8, b.y - 8, 10, 7);
          }

          // Rune pickups
          for (const r of this.runes) {
            g.rect(r.x - 9, r.y - 11, 18, 22, '#0c1428');
            g.rectO(r.x - 9, r.y - 11, 18, 22, '#e8c84a', 1);
            api.txtC('ᚱ', r.x, r.y - 4, 10, '#e8c84a');
          }

          // Thor
          const ty = H - 66;
          c.globalAlpha = this.hurtT > 0 ? (Math.floor(this.hurtT * 8) % 2 === 0 ? 0.25 : 1.0) : 1.0;
          c.fillStyle = '#c02020';
          c.beginPath();
          c.moveTo(this.x - 12, ty - 4); c.lineTo(this.x + 5, ty - 4); c.lineTo(this.x - 6, ty + 17);
          c.closePath(); c.fill();
          g.rect(this.x - 10, ty - 20, 20, 26, '#8898b0');
          g.rect(this.x - 8,  ty - 18, 16, 22, '#a0a8c0');
          g.rect(this.x - 8,  ty - 30, 16, 12, '#a0a8c0');
          g.rect(this.x - 10, ty - 26, 4, 10, '#8898b0');
          g.rect(this.x + 6,  ty - 26, 4, 10, '#8898b0');
          g.rect(this.x - 4,  ty - 24, 8, 6,  '#c8a070');
          g.rect(this.x + 10, ty - 22, 12, 7,  '#b0bcd0');
          g.rect(this.x + 12, ty - 15, 5, 12,  '#7a5a30');
          c.globalAlpha = 1;

          g.rect(6, H - 12, W - 12, 7, '#0a0c1a');
          g.rect(6, H - 12, Math.floor((W - 12) * this.progress), 7, '#e8c84a');
          api.topBar('THE BIFROST');
          api.txt('RUNES ' + this.runesGot, 6, 20, 9, '#e8c84a');
          for (let hi = 0; hi < 3; hi++) g.rect(W - 64 + hi * 20, 6, 14, 10, hi < this.hp ? '#a4d8ff' : '#1a1828');
          api.vignette();
        },
      },

      /* ======================= 2. JÖRMUNGANDR ======================= */
      {
        id: 'serpent',
        name: 'JÖRMUNGANDR',
        sub: 'THE WORLD SERPENT',
        icon(api, x, y) {
          const c = api.ctx;
          c.strokeStyle = '#3db87a'; c.lineWidth = 3;
          c.beginPath(); c.arc(x, y - 2, 9, 0.2, Math.PI * 1.7); c.stroke();
          api.gfx.rect(x + 7, y - 11, 7, 5, '#3db87a');
          api.gfx.rect(x + 12, y - 10, 2, 2, '#ff4040');
        },
        intro: [
          'THOR ROWS OUT TO SEA',
          'AND HOOKS THE WORLD SERPENT',
          'ON AN OX-HEAD BAIT.',
          'Hold tight — haul it up!',
        ],
        quote: 'Thor alone dared to fish Jörmungandr from the depths below Midgard.',
        help: 'HOLD finger/tap to reel in · RELEASE when the meter turns RED',
        winText: 'Jörmungandr rears its colossal head. Thor raises Mjolnir to meet it.',
        loseText: 'The line snaps for the third time. The Serpent retreats to the deep.',
        init(api) {
          this.progress  = 0;
          this.snaps     = 0;
          this.tension   = 0.4;
          this.phase     = 'reel';
          this.thrashT   = 0;
          this.nextThrash = api.rnd(2.2, 3.8);
          this.sway      = 0;
          this.swayV     = 0;
        },
        update(api, dt) {
          const holding = api.pointer.down || api.keyDown('a') || api.keyDown('up') || api.keyDown('b');

          if (this.phase === 'reel') {
            this.nextThrash -= dt;
            if (holding) {
              this.progress = Math.min(1.0, this.progress + dt * 0.06);
              this.tension  = Math.min(0.88, this.tension + dt * 0.55);
            } else {
              this.tension = Math.max(0.0, this.tension - dt * 1.1);
            }
            if (this.nextThrash <= 0 && this.progress > 0.12) {
              this.phase  = 'thrash';
              this.thrashT = api.rnd(1.6, 2.6);
              api.audio.sfx('hurt');
              api.shake(4, 0.25);
            }
            if (this.progress >= 1.0) { api.addScore(100); api.win(); return; }
          } else if (this.phase === 'thrash') {
            this.thrashT -= dt;
            this.swayV += api.rnd(-0.5, 0.5) * dt * 12;
            this.swayV *= 0.92;
            this.sway   = clamp(this.sway + this.swayV, -28, 28);
            if (holding) {
              this.tension = Math.min(1.0, this.tension + dt * 2.0);
            } else {
              this.tension = Math.max(0.15, this.tension - dt * 1.4);
            }
            if (this.tension >= 1.0) {
              this.snaps++;
              this.tension  = 0.25;
              this.progress = Math.max(0, this.progress - 0.18);
              this.sway     = 0;
              api.shake(9, 0.4);
              api.flash('#ff3030', 0.22);
              api.audio.sfx('hurt');
              this.phase      = 'reel';
              this.nextThrash = api.rnd(1.8, 3.2);
              if (this.snaps >= 3) { api.lose(); return; }
            }
            if (this.thrashT <= 0) {
              this.phase      = 'reel';
              this.nextThrash = api.rnd(2.0, 4.0);
              this.sway       = 0;
              api.audio.sfx('coin');
            }
          }
          api.score = Math.floor(this.progress * 80);
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const thrashing = this.phase === 'thrash';

          const seaGrad = c.createLinearGradient(0, 0, 0, H);
          seaGrad.addColorStop(0, '#030a12');
          seaGrad.addColorStop(0.38, '#071e30');
          seaGrad.addColorStop(1, '#041222');
          c.fillStyle = seaGrad; c.fillRect(0, 0, W, H);
          const seaY = Math.floor(H * 0.38);
          c.fillStyle = '#082840'; c.fillRect(0, seaY, W, H - seaY);

          for (let wi = 0; wi < 5; wi++) {
            c.globalAlpha = 0.12; c.strokeStyle = '#4090b8'; c.lineWidth = 1;
            c.beginPath();
            const wy = seaY + 8 + wi * 14 + Math.sin(api.t * 1.1 + wi) * 3;
            c.moveTo(0, wy);
            for (let wx = 0; wx <= W; wx += 18) c.lineTo(wx, wy + Math.sin((wx / W) * Math.PI * 4 + api.t) * 5);
            c.stroke();
          }
          c.globalAlpha = 1;

          const serpentDepth = 1 - this.progress;
          const sy  = seaY + serpentDepth * (H - seaY + 60) - 30;
          const sw2 = thrashing ? this.sway : Math.sin(api.t * 1.5) * 5;
          const scol  = thrashing ? '#ff5040' : '#3db87a';
          const scol2 = thrashing ? '#c03020' : '#2a9060';

          if (sy < H + 10) {
            c.globalAlpha = 0.88;
            c.fillStyle = scol2;
            c.beginPath(); c.arc(W / 2 + sw2 * 0.6, sy + 60, 24, 0, Math.PI * 2); c.fill();
            c.fillStyle = scol;
            c.beginPath(); c.arc(W / 2 + sw2 * 0.4, sy + 42, 18, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.arc(W / 2 + sw2, sy, 20, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            g.rect(W / 2 + sw2 - 9, sy - 6, 6, 7, '#f8ee00');
            g.rect(W / 2 + sw2 + 4, sy - 6, 6, 7, '#f8ee00');
            g.rect(W / 2 + sw2 - 7, sy - 4, 3, 4, '#060808');
            g.rect(W / 2 + sw2 + 6, sy - 4, 3, 4, '#060808');
            g.rect(W / 2 + sw2 - 7, sy + 14, 4, 9, '#f4f0e0');
            g.rect(W / 2 + sw2 + 4, sy + 14, 4, 9, '#f4f0e0');
          }

          const lineCol = thrashing ? (api.t % 0.25 < 0.12 ? '#ff4040' : '#ff9030') : (this.tension > 0.65 ? '#ff8030' : '#a4d8ff');
          c.strokeStyle = lineCol; c.lineWidth = 2;
          const wobble = thrashing ? Math.sin(api.t * 18) * 14 : 0;
          c.beginPath();
          c.moveTo(W / 2, seaY - 48);
          c.quadraticCurveTo(W / 2 + wobble, seaY + 10, W / 2 + sw2, Math.min(sy + 18, seaY + 40));
          c.stroke();

          // Boat
          c.fillStyle = '#4a3014';
          c.beginPath(); c.ellipse(W / 2, seaY - 38, 46, 14, 0, 0, Math.PI); c.fill();
          g.rect(W / 2 - 8, seaY - 62, 16, 24, '#8898b0');
          g.rect(W / 2 - 10, seaY - 54, 20, 4, '#c02020');
          g.rect(W / 2 - 6, seaY - 68, 12, 10, '#a0a8c0');

          // Tension meter
          const tmx = 12, tmy = H - 42, tmw = W - 24, tmh = 14;
          g.rect(tmx, tmy, tmw, tmh, '#0a0c1a');
          const tCol = this.tension > 0.75 ? '#ff3030' : (this.tension > 0.50 ? '#ff8a20' : '#a4d8ff');
          g.rect(tmx, tmy, Math.floor(tmw * this.tension), tmh, tCol);
          g.rectO(tmx, tmy, tmw, tmh, '#303860', 1);
          api.txtC(thrashing ? 'RELEASE — IT THRASHES!' : 'HOLD TO REEL IN', W / 2, tmy + 10, 7, thrashing ? '#ff5050' : '#a4d8ff');
          g.rect(tmx, H - 14, tmw, 6, '#0a0c1a');
          g.rect(tmx, H - 14, Math.floor(tmw * this.progress), 6, '#e8c84a');

          api.topBar('JÖRMUNGANDR');
          api.txt('HAULED ' + Math.floor(this.progress * 100) + '%', 6, 20, 9, '#a4d8ff');
          api.txt('SNAPS ' + this.snaps + '/3', W - 90, 20, 9, this.snaps > 1 ? '#ff4040' : '#607090');
          api.vignette();
        },
      },

      /* ======================= 3. LOKI'S SHAPES ======================= */
      {
        id: 'loki',
        name: "LOKI'S SHAPES",
        sub: 'THE TRICKSTER GOD',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 8, 12, 12, '#3db87a');
          g.rect(x - 9, y - 11, 4, 7, '#3db87a');
          g.rect(x + 5, y - 11, 4, 7, '#3db87a');
          g.rect(x - 4, y - 4, 3, 4, '#f0e050');
          g.rect(x + 2, y - 4, 3, 4, '#f0e050');
          g.rect(x - 3, y + 4, 6, 2, '#e0e0e0');
        },
        intro: [
          'LOKI SHAPESHIFTS INTO',
          'A HUNDRED FORMS TO DECEIVE.',
          'THE REAL LOKI HAS',
          'gleaming GREEN eyes — find him!',
        ],
        quote: 'Loki is the sly one, the shape-changer, the father of lies and monsters.',
        help: 'TAP the figure with bright GREEN eyes · catch 8 to bind him',
        winText: 'Caught! The Aesir bind Loki beneath the mountain in iron chains.',
        loseText: 'Loki laughs and vanishes in green smoke — back to mischief.',
        init(api) {
          this.caught     = 0;
          this.need       = 8;
          this.misses     = 0;
          this.maxMiss    = 4;
          this.figures    = [];
          this.showing    = false;
          this.timer      = 0;
          this.showTime   = 2.2;
          this.result     = null;
          this.resultTimer = 0;
          this.needSpawn  = true;
        },
        update(api, dt) {
          if (this.needSpawn) {
            this.needSpawn = false;
            const realIdx = api.rint(0, 2);
            this.figures  = [52, 135, 218].map((fx, fi) => ({ x: fx, y: 230, real: fi === realIdx, hit: false }));
            this.showTime = Math.max(0.75, 2.2 - this.caught * 0.16);
            this.timer    = this.showTime;
            this.showing  = true;
            this.result   = null;
          }

          if (this.resultTimer > 0) {
            this.resultTimer -= dt;
            if (this.resultTimer <= 0) {
              if (this.caught >= this.need) { api.addScore(50); api.win(); return; }
              if (this.misses >= this.maxMiss) { api.lose(); return; }
              this.needSpawn = true;
            }
            return;
          }

          if (this.showing) {
            this.timer -= dt;
            if (api.pointer.justDown) {
              for (const fig of this.figures) {
                if (Math.hypot(api.pointer.x - fig.x, api.pointer.y - fig.y) < 32) {
                  fig.hit = true;
                  if (fig.real) {
                    this.caught++;
                    api.addScore(30);
                    api.burst(fig.x, fig.y - 10, '#3db87a', 12);
                    api.audio.sfx('power');
                    api.flash('#3db87a', 0.12);
                    this.result = { correct: true, x: fig.x, y: fig.y };
                  } else {
                    this.misses++;
                    api.shake(5, 0.22);
                    api.audio.sfx('hurt');
                    api.flash('#ff3030', 0.1);
                    this.result = { correct: false, x: fig.x, y: fig.y };
                  }
                  this.resultTimer = 0.75;
                  this.showing = false;
                  break;
                }
              }
            }
            if (this.timer <= 0 && this.showing) {
              this.misses++;
              api.shake(3, 0.2);
              api.audio.sfx('blip');
              this.result = { correct: false, x: 135, y: 230 };
              this.resultTimer = 0.6;
              this.showing = false;
            }
          }
          api.score = this.caught * 30;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Loki's illusion realm
          c.fillStyle = '#07091a'; c.fillRect(0, 0, W, H);
          for (let mi = 0; mi < 7; mi++) {
            c.globalAlpha = 0.05 + 0.02 * Math.sin(api.t * 0.5 + mi);
            c.fillStyle = mi % 3 === 0 ? '#3db87a' : (mi % 3 === 1 ? '#7030c0' : '#204080');
            c.beginPath();
            c.arc(((mi * 48 + Math.sin(api.t * 0.4 + mi) * 16) % (W + 20)) - 10,
                  80 + mi * 48 + Math.cos(api.t * 0.35 + mi) * 20, 50 + mi * 8, 0, Math.PI * 2);
            c.fill();
          }
          c.globalAlpha = 1;
          c.fillStyle = '#0e1225'; c.fillRect(0, Math.floor(H * 0.6), W, H);
          for (let fi2 = 0; fi2 < W; fi2 += 20) {
            c.globalAlpha = 0.16; c.fillStyle = '#4070a0';
            c.fillRect(fi2, Math.floor(H * 0.6), 10, 1);
          }
          c.globalAlpha = 1;

          // Figures
          for (const fig of this.figures) {
            const hitGlow = fig.hit && !!this.result;
            if (hitGlow) {
              c.globalAlpha = 0.6;
              c.fillStyle = fig.real ? '#3db87a' : '#ff3030';
              c.beginPath(); c.arc(fig.x, fig.y - 16, 36, 0, Math.PI * 2); c.fill();
              c.globalAlpha = 1;
            }
            // Horned helm
            const helmC = fig.real ? '#3db87a' : '#5060a8';
            c.fillStyle = helmC;
            c.fillRect(fig.x - 14, fig.y - 52, 28, 10);
            c.fillRect(fig.x - 16, fig.y - 62, 6, 14);
            c.fillRect(fig.x + 10, fig.y - 62, 6, 14);
            // Head
            c.fillStyle = '#c8a070';
            c.beginPath(); c.arc(fig.x, fig.y - 38, 14, 0, Math.PI * 2); c.fill();
            // Eyes — real Loki = bright green
            const eyeC = fig.real ? '#40ff70' : '#d0b060';
            g.rect(fig.x - 8, fig.y - 43, 5, 6, eyeC);
            g.rect(fig.x + 3, fig.y - 43, 5, 6, eyeC);
            g.rect(fig.x - 7, fig.y - 42, 2, 3, '#080808');
            g.rect(fig.x + 4, fig.y - 42, 2, 3, '#080808');
            g.rect(fig.x - 4, fig.y - 28, 8, 2, '#7a4030');
            // Cape + body
            c.fillStyle = fig.real ? '#2a8050' : '#3a3880';
            c.fillRect(fig.x - 20, fig.y - 26, 40, 44);
            c.fillStyle = helmC;
            c.fillRect(fig.x - 14, fig.y - 24, 28, 36);
            g.rect(fig.x - 12, fig.y - 24, 24, 3, '#e8c84a');
            // Legs
            c.fillStyle = '#282040';
            c.fillRect(fig.x - 10, fig.y + 18, 9, 20);
            c.fillRect(fig.x + 2,  fig.y + 18, 9, 20);
            g.rect(fig.x - 12, fig.y + 36, 12, 5, '#1a1828');
            g.rect(fig.x + 2,  fig.y + 36, 12, 5, '#1a1828');
          }

          if (this.showing) {
            const pct = this.timer / this.showTime;
            g.rect(10, H - 28, W - 20, 10, '#0a0c1a');
            g.rect(10, H - 28, Math.floor((W - 20) * pct), 10, pct < 0.3 ? '#ff3030' : '#a4d8ff');
            g.rectO(10, H - 28, W - 20, 10, '#303860', 1);
          }

          if (this.result && this.resultTimer > 0) {
            api.txtC(this.result.correct ? '✦ CAUGHT!' : 'ESCAPED!', W / 2, this.result.y - 80, 13,
              this.result.correct ? '#3db87a' : '#ff4040');
          }

          if (this.showing) {
            for (let fi2 = 0; fi2 < 3; fi2++) api.txtC('TAP', this.figures[fi2].x, H - 14, 7, '#606888');
          }

          api.topBar("LOKI'S SHAPES");
          api.txt('CAUGHT ' + this.caught + '/' + this.need, 6, 20, 9, '#3db87a');
          api.txt('MISS ' + this.misses + '/' + this.maxMiss, W - 96, 20, 9, this.misses > 2 ? '#ff4040' : '#606888');
          api.vignette();
        },
      },

      /* ======================= 4. WOLVES AT THE GATE ======================= */
      {
        id: 'wolves',
        name: 'WOLVES AT THE GATE',
        sub: "FENRIR'S BROOD",
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 8, 16, 12, '#7888a0');
          g.rect(x - 10, y - 12, 5, 7, '#5a6878');
          g.rect(x + 5,  y - 12, 5, 7, '#5a6878');
          g.rect(x - 5,  y - 4, 4, 4, '#ff3030');
          g.rect(x + 2,  y - 4, 4, 4, '#ff3030');
          g.rect(x - 4,  y + 4, 8, 2, '#e8e8e8');
        },
        intro: [
          'FENRIR BREAKS HIS CHAIN.',
          "HIS WOLF-BROOD CHARGES",
          "THREE OF ASGARD'S GATES.",
          'Seal them before they fall!',
        ],
        quote: "At Ragnarök, Fenrir's jaws shall gape from earth to heaven.",
        help: 'TAP glowing gates to drive wolves back · survive 28 seconds',
        winText: 'The last wolf is flung back. The gates hold. Asgard breathes.',
        loseText: 'Five wolves break through. The golden city is overrun.',
        init(api) {
          this.timer     = 28;
          this.broken    = 0;
          this.maxBroken = 5;
          this.spawn     = 0.95;
          this.speed     = 1.0;
          this.gates = [
            { x: 45,  y: 230, active: null },
            { x: 135, y: 230, active: null },
            { x: 225, y: 230, active: null },
          ];
        },
        update(api, dt) {
          this.timer -= dt;
          this.speed = 1.0 + (28 - Math.max(0, this.timer)) / 40;

          this.spawn -= dt;
          if (this.spawn <= 0) {
            const avail = this.gates.filter((gate) => !gate.active);
            if (avail.length > 0) {
              const pick = avail[api.rint(0, avail.length - 1)];
              const at   = Math.max(0.65, 1.9 / this.speed);
              pick.active = { life: at, maxLife: at };
              api.audio.sfx('blip');
            }
            this.spawn = api.rnd(0.28, 0.7) / this.speed;
          }

          for (const gate of this.gates) {
            if (gate.active) {
              gate.active.life -= dt;
              if (gate.active.life <= 0) {
                this.broken++;
                gate.active = null;
                api.shake(5, 0.24);
                api.flash('#ff2020', 0.15);
                api.audio.sfx('hurt');
                if (this.broken >= this.maxBroken) { api.lose(); return; }
              }
            }
          }

          if (api.pointer.justDown) {
            for (const gate of this.gates) {
              if (gate.active && Math.hypot(api.pointer.x - gate.x, api.pointer.y - gate.y) < 40) {
                gate.active = null;
                api.addScore(15);
                api.burst(gate.x, gate.y, '#e8c84a', 8);
                api.audio.sfx('coin');
                break;
              }
            }
          }

          api.score = Math.floor((28 - Math.max(0, this.timer)) * 3);
          if (this.timer <= 0) { api.addScore(60); api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#050a16'; c.fillRect(0, 0, W, H);

          for (let wy = 60; wy < H * 0.62; wy += 22) {
            for (let wx = 0; wx < W; wx += 38) {
              c.fillStyle = (Math.floor(wy / 22) + Math.floor(wx / 38)) % 2 ? '#101828' : '#0c1420';
              c.fillRect(wx, wy, 37, 21);
            }
          }
          for (let bx = 10; bx < W - 20; bx += 18) { c.fillStyle = '#0c1420'; c.fillRect(bx, 40, 12, 26); }
          c.fillStyle = '#080e1c'; c.fillRect(0, Math.floor(H * 0.62), W, H);

          for (let wi = 0; wi < 7; wi++) {
            const wx2 = (wi * 42 + api.t * 22 * (wi % 2 === 0 ? 1 : -1) + 15) % (W + 20) - 10;
            const wy2 = H * 0.65 + wi * 6 + Math.sin(api.t * 2.5 + wi) * 4;
            c.globalAlpha = 0.20;
            g.rect(wx2 - 10, wy2 - 8, 20, 12, '#607080');
            g.rect(wx2 - 12, wy2 - 12, 5, 7, '#506070');
            g.rect(wx2 + 7, wy2 - 12, 5, 7, '#506070');
            c.globalAlpha = 1;
          }

          for (const gate of this.gates) {
            const gx = gate.x, gy = gate.y;
            const isActive = !!gate.active;
            const urgency  = isActive ? (1.0 - gate.active.life / gate.active.maxLife) : 0;
            c.fillStyle = isActive ? 'rgba(200,30,10,' + (0.12 + urgency * 0.38) + ')' : '#080c18';
            c.beginPath();
            c.arc(gx, gy - 22, 34, Math.PI, 0, false);
            c.lineTo(gx + 34, gy + 32); c.lineTo(gx - 34, gy + 32); c.closePath(); c.fill();
            c.strokeStyle = isActive ? (urgency > 0.55 ? '#ff2020' : '#ff7020') : '#3a5080';
            c.lineWidth = isActive ? 2 : 1;
            c.beginPath();
            c.arc(gx, gy - 22, 34, Math.PI, 0, false);
            c.moveTo(gx - 34, gy - 22); c.lineTo(gx - 34, gy + 32);
            c.moveTo(gx + 34, gy - 22); c.lineTo(gx + 34, gy + 32);
            c.stroke();
            api.txtC('ᚷ', gx, gy - 26, 12, isActive ? '#ff9040' : '#e8c84a');
            if (isActive) {
              c.globalAlpha = urgency * 0.65;
              c.fillStyle = '#cc2020';
              c.beginPath(); c.arc(gx, gy - 10, 22 * urgency, 0, Math.PI * 2); c.fill();
              c.globalAlpha = 1;
              if (urgency > 0.3) {
                c.globalAlpha = urgency;
                g.rect(gx - 9, gy - 18, 6, 6, '#ff4040');
                g.rect(gx + 4, gy - 18, 6, 6, '#ff4040');
                c.globalAlpha = 1;
              }
              c.strokeStyle = urgency > 0.6 ? '#ff2020' : '#ff8030'; c.lineWidth = 3;
              c.beginPath();
              c.arc(gx, gy - 22, 38, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * gate.active.life / gate.active.maxLife, false);
              c.stroke();
              api.txtC('TAP!', gx, gy + 18, 9, '#ff5040');
            }
          }

          for (let bi = 0; bi < this.maxBroken; bi++) g.rect(W - 96 + bi * 17, 6, 12, 10, bi < this.broken ? '#ff2020' : '#202840');
          g.rect(6, H - 13, W - 12, 7, '#0a0c1a');
          g.rect(6, H - 13, Math.floor((W - 12) * (this.timer / 28)), 7, '#e8c84a');
          api.topBar("WOLVES AT THE GATE");
          api.txt('HOLD ' + Math.max(0, Math.ceil(this.timer)) + 's', 6, 20, 9, '#e8c84a');
          api.vignette();
        },
      },

      /* ======================= 5. RAGNARÖK ======================= */
      {
        id: 'ragnarok',
        name: 'RAGNARÖK',
        sub: 'TWILIGHT OF THE GODS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 4, y - 12, 8, 18, '#ff6020');
          g.rect(x - 6, y - 8, 12, 12, '#ff8030');
          g.rect(x - 2, y - 16, 4, 6, '#ffe060');
          g.rect(x - 8, y + 6, 16, 6, '#c83010');
        },
        intro: [
          'SURTR THE FIRE GIANT',
          'CHARGES WITH HIS FLAMING SWORD.',
          'DODGE HIS SWINGS AND',
          'hurl Mjolnir in the opening!',
        ],
        quote: 'Surtr will cover all the earth with fire at the twilight of the gods.',
        help: 'Watch the RED WARNING zone · ← → to dodge · TAP in the STRIKE glow!',
        winText: 'Mjolnir strikes Surtr five times. He crumbles to ash. The worlds breathe.',
        loseText: 'The fire engulfs you. Surtr laughs and the last light fades from Asgard.',
        init(api) {
          this.strikes     = 0;
          this.need        = 5;
          this.hp          = 4;
          this.thorX       = api.W / 2;
          this.phase       = 'idle';
          this.phaseTimer  = 0;
          this.swingDir    = 0;
          this.strikeWin   = 0;
          this.hurtT       = 0;
          this.nextIdle    = 1.2;
        },
        update(api, dt) {
          const f = dt * 60;
          if (api.pointer.down) this.thorX = api.pointer.x;
          if (api.keyDown('left'))  this.thorX -= 4.5 * f;
          if (api.keyDown('right')) this.thorX += 4.5 * f;
          this.thorX = clamp(this.thorX, 22, api.W - 22);
          if (this.hurtT > 0) this.hurtT -= dt;

          if (this.phase === 'idle') {
            this.nextIdle -= dt;
            if (this.nextIdle <= 0) {
              this.swingDir   = api.choice([-1, 0, 1]);
              this.phase      = 'telegraph';
              this.phaseTimer = 1.1;
              api.audio.sfx('blip');
            }
          } else if (this.phase === 'telegraph') {
            this.phaseTimer -= dt;
            if (this.phaseTimer <= 0) { this.phase = 'swing'; this.phaseTimer = 0.55; }
          } else if (this.phase === 'swing') {
            this.phaseTimer -= dt;
            if (this.phaseTimer <= 0) {
              const dangerX = api.W * (this.swingDir === -1 ? 0.30 : (this.swingDir === 1 ? 0.70 : 0.50));
              if (Math.abs(this.thorX - dangerX) < 62 && this.hurtT <= 0) {
                this.hp--;
                api.shake(9, 0.4);
                api.flash('#ff3010', 0.22);
                api.audio.sfx('hurt');
                this.hurtT = 0.9;
                if (this.hp <= 0) { api.lose(); return; }
              } else {
                api.audio.sfx('coin');
              }
              this.phase      = 'opening';
              this.phaseTimer = 0.9;
              this.strikeWin  = 0.9;
            }
          } else if (this.phase === 'opening') {
            this.phaseTimer -= dt;
            this.strikeWin  -= dt;
            if (this.strikeWin > 0 && (api.pointer.justDown || api.keyPressed('a') || api.keyPressed('b'))) {
              this.strikes++;
              api.addScore(40);
              api.burst(api.W / 2, Math.floor(api.H * 0.38), '#e8c84a', 14);
              api.shake(5, 0.22);
              api.audio.sfx('power');
              api.flash('#e8c84a', 0.12);
              this.strikeWin = 0;
              if (this.strikes >= this.need) { api.addScore(80); api.win(); return; }
            }
            if (this.phaseTimer <= 0) {
              this.phase    = 'idle';
              this.nextIdle = api.rnd(0.5, 1.2) - (this.strikes * 0.04);
            }
          }
          api.score = this.strikes * 40;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          const fg = c.createLinearGradient(0, 0, 0, H);
          fg.addColorStop(0, '#080308'); fg.addColorStop(0.45, '#180608'); fg.addColorStop(1, '#2a0804');
          c.fillStyle = fg; c.fillRect(0, 0, W, H);

          for (let fi = 0; fi < 5; fi++) {
            const fx = 18 + fi * 58 + Math.sin(api.t * 1.5 + fi) * 8;
            const fh = 60 + fi * 14 + Math.sin(api.t * 2.5 + fi) * 18;
            c.globalAlpha = 0.35; c.fillStyle = '#e03010'; c.fillRect(fx - 12, H - fh, 24, fh);
            c.globalAlpha = 0.50; c.fillStyle = '#ff7020'; c.fillRect(fx - 6, H - fh + 8, 12, fh - 8);
            c.globalAlpha = 1;
          }

          // Surtr
          const sx = W / 2, sy = Math.floor(H * 0.32);
          const flicker = Math.sin(api.t * 9) * 3;
          c.globalAlpha = 0.28; c.fillStyle = '#ff5010';
          c.beginPath(); c.arc(sx, sy, 58 + flicker, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 0.18; c.fillStyle = '#ffa030';
          c.beginPath(); c.arc(sx, sy, 46, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          c.fillStyle = '#b82010'; c.fillRect(sx - 34, sy - 52, 68, 86);
          c.fillStyle = '#901808'; c.fillRect(sx - 30, sy - 48, 60, 78);
          c.fillStyle = '#d02818'; c.beginPath(); c.arc(sx, sy - 62, 28, 0, Math.PI * 2); c.fill();
          for (let fci = 0; fci < 6; fci++) {
            const fca = (fci - 2.5) * 0.38;
            const fch = 18 + Math.sin(api.t * 5 + fci) * 8;
            c.fillStyle = fci === 2 || fci === 3 ? '#ffe060' : '#ff8020';
            c.beginPath();
            c.moveTo(sx + Math.sin(fca) * 22 - 4, sy - 86);
            c.lineTo(sx + Math.sin(fca) * 24, sy - 86 - fch);
            c.lineTo(sx + Math.sin(fca) * 22 + 4, sy - 86);
            c.closePath(); c.fill();
          }
          g.rect(sx - 13, sy - 68, 9, 9, '#fff4e0');
          g.rect(sx + 5,  sy - 68, 9, 9, '#fff4e0');
          // Flaming sword
          const swordTilt = this.phase === 'swing' ? Math.sin(api.t * 20) * 0.7 : 0.2;
          c.save(); c.translate(sx + 58, sy - 14); c.rotate(swordTilt);
          c.fillStyle = '#ff7010'; c.fillRect(-4, -50, 8, 70);
          c.fillStyle = '#ffe040'; c.fillRect(-2, -50, 4, 60);
          c.fillStyle = '#c85020'; c.fillRect(-14, -8, 28, 6);
          c.restore();

          // Telegraph warning
          if (this.phase === 'telegraph') {
            const dangerX = W * (this.swingDir === -1 ? 0.30 : (this.swingDir === 1 ? 0.70 : 0.50));
            c.globalAlpha = 0.20; c.fillStyle = '#ff2020';
            c.fillRect(dangerX - 62, H - 96, 124, 96); c.globalAlpha = 1;
            c.strokeStyle = '#ff4040'; c.lineWidth = 2;
            c.setLineDash([6, 4]);
            c.beginPath(); c.moveTo(dangerX, sy + 44); c.lineTo(dangerX, H - 96); c.stroke();
            c.setLineDash([]);
            api.txtC('⚡ DANGER', dangerX, H - 54, 9, '#ff4040');
          }

          // Strike window
          if (this.strikeWin > 0 && this.phase === 'opening') {
            c.globalAlpha = (this.strikeWin / 0.9) * 0.65;
            c.fillStyle = '#e8c84a';
            c.beginPath(); c.arc(W / 2, Math.floor(H * 0.82), 42, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            api.txtC('THROW MJOLNIR!', W / 2, Math.floor(H * 0.82) + 5, 9, '#e8c84a');
          }

          // Thor
          const ty = H - 62;
          c.globalAlpha = this.hurtT > 0 ? (Math.floor(this.hurtT * 8) % 2 === 0 ? 0.22 : 1.0) : 1.0;
          c.fillStyle = '#c02020';
          c.beginPath();
          c.moveTo(this.thorX - 12, ty - 2); c.lineTo(this.thorX + 5, ty - 2);
          c.lineTo(this.thorX - 7, ty + 18); c.closePath(); c.fill();
          g.rect(this.thorX - 10, ty - 22, 20, 28, '#8898b0');
          g.rect(this.thorX - 8,  ty - 20, 16, 24, '#a0a8c0');
          g.rect(this.thorX - 8,  ty - 32, 16, 12, '#a0a8c0');
          g.rect(this.thorX - 10, ty - 28, 4, 10, '#8898b0');
          g.rect(this.thorX + 6,  ty - 28, 4, 10, '#8898b0');
          g.rect(this.thorX - 5,  ty - 26, 10, 7, '#c8a070');
          g.rect(this.thorX + 10, ty - 30, 14, 8, '#b8c8e0');
          g.rect(this.thorX + 12, ty - 22, 6, 14, '#7a5a30');
          c.globalAlpha = 1;

          api.topBar('RAGNARÖK');
          api.txt('STRIKES ' + this.strikes + '/' + this.need, 6, 20, 9, '#e8c84a');
          for (let hi = 0; hi < 4; hi++) g.rect(W - 78 + hi * 18, 6, 13, 10, hi < this.hp ? '#a4d8ff' : '#1a0808');
          api.vignette();
        },
      },

    ], // end chapters
  });
})();
