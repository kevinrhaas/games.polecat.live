/* ============================================================================
 * AROUND THE WORLD IN EIGHTY DAYS — PHILEAS FOGG'S RACE
 * Five legs of Verne's globe-trotting wager:
 *   1. THE WAGER     — clock timing, seal the bet at the Reform Club
 *   2. THE MONGOLIA  — steer the steamship to Suez, dodge rocks & waves
 *   3. KIOUNI        — ride the elephant across India, dodge jungle obstacles
 *   4. THE HENRIETTA — stoke the boiler: keep pressure in the green zone
 *   5. LONDON IN TIME— carriage race through night London to the Reform Club
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Emblem: Victorian pocket watch ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    g.circle(cx, cy, 24, '#8b6914');
    g.circle(cx, cy, 20, '#c8a020');
    g.circle(cx, cy, 17, '#f0e8c0');
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2 - Math.PI / 2;
      const r1 = i % 3 === 0 ? 11 : 13;
      c.strokeStyle = '#3a2408'; c.lineWidth = i % 3 === 0 ? 2 : 1;
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      c.lineTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16);
      c.stroke();
    }
    // Hands (showing ~8 o'clock — 80 days)
    const h8 = -Math.PI / 2 + (8 / 12) * Math.PI * 2;
    c.strokeStyle = '#1a0e06'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(h8) * 11, cy + Math.sin(h8) * 11); c.stroke();
    c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - 14); c.stroke();
    g.circle(cx, cy, 2, '#3a2408');
    // Crown
    g.rect(cx - 3, cy - 27, 6, 5, '#8b6914');
    g.rect(cx - 5, cy - 29, 10, 3, '#c8a020');
  }

  /* ─── Scenery: Victorian London skyline + Thames ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    c.fillStyle = '#1a0e06'; c.fillRect(0, 0, W, H);
    // Stars
    for (let i = 0; i < 28; i++) {
      const sx = (i * 83 + 17) % W, sy = (i * 61 + 9) % Math.floor(H * 0.48);
      c.globalAlpha = 0.16 + 0.2 * Math.sin(t * 1.4 + i);
      g.rect(sx, sy, 1, 1, '#f0e8c8');
    }
    c.globalAlpha = 1;
    // Moon (crescent)
    g.circle(W - 44, 44, 16, '#e8d880'); g.circle(W - 38, 40, 13, '#1a0e06');
    // London skyline
    const baseY = H - 58;
    c.fillStyle = '#0d0903';
    // Big Ben
    c.fillRect(22, baseY - 84, 20, 84);
    for (let bx = 22; bx < 42; bx += 6) c.fillRect(bx, baseY - 88, 4, 5);
    c.fillRect(27, baseY - 97, 10, 10); c.fillRect(30, baseY - 104, 4, 9);
    g.circle(32, baseY - 78, 8, '#c8a020');
    // Other buildings
    const blds = [[60, 38], [90, 54], [125, 36], [158, 49], [184, 42], [215, 58], [244, 34]];
    for (const [bx, bh] of blds) {
      c.fillRect(bx, baseY - bh, 22, bh);
      for (let wy = baseY - bh + 8; wy < baseY - 8; wy += 14)
        for (let wx = bx + 4; wx < bx + 18; wx += 8) g.rect(wx, wy, 5, 7, '#c8902a');
    }
    // Thames
    c.fillStyle = '#0e1e30'; c.fillRect(0, H - 40, W, 40);
    c.globalAlpha = 0.1 + 0.06 * Math.sin(t * 2.1);
    for (let i = 0; i < 4; i++) {
      const rx = ((i * 54 + t * 14) % (W + 28)) - 14;
      g.rect(rx, H - 28, 36, 3, '#4a8ab8');
    }
    c.globalAlpha = 1;

    if (scene === 'menu') {
      // Parchment world-map overlay
      c.fillStyle = 'rgba(34,20,6,.78)'; c.fillRect(0, 0, W, H);
      // Lat/long grid
      c.strokeStyle = 'rgba(180,140,50,.07)'; c.lineWidth = 1;
      for (let y = 60; y < H; y += 38) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      for (let x = 0; x < W; x += 38) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
      // Route dotted line connecting chapter stop centres (matches layout rects)
      const stops = [[65, 111], [205, 171], [65, 241], [205, 301], [135, 381]];
      c.strokeStyle = '#d4a017'; c.lineWidth = 1.5; c.setLineDash([4, 4]);
      for (let i = 0; i < stops.length - 1; i++) {
        c.beginPath(); c.moveTo(stops[i][0], stops[i][1]); c.lineTo(stops[i + 1][0], stops[i + 1][1]); c.stroke();
      }
      c.setLineDash([]);
      // Compass rose (bottom-right corner)
      const crx = W - 26, cry = H - 26;
      g.circle(crx, cry, 12, 'rgba(212,160,23,.18)');
      g.circle(crx, cry, 2, '#d4a017');
      const dirs = [['N', 0, -14], ['S', 0, 14], ['E', 14, 0], ['W', -14, 0]];
      for (const [l, dx, dy] of dirs) api.txtC(l, crx + dx, cry + dy - 4, 6, '#d4a017', true);
    } else if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(12,8,2,.74)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ============================================================ */
  RetroSaga.create({
    id: 'around80days',
    title: 'Around the World in 80 Days',
    subtitle: 'IN EIGHTY DAYS — A RACE AGAINST TIME',
    currency: 'MILES',
    bootCta: 'TAP TO DEPART',
    menuLabel: 'THE ROUTE OF PHILEAS FOGG',
    menuHint: 'SELECT A LEG OF THE JOURNEY',
    menuDone: 'THE WAGER IS WON — FOGG TRIUMPHS',
    credit: 'AFTER JULES VERNE, 1872',
    emblem,
    scenery,
    screens: {
      win: '#d4a017', lose: '#8b3a1a', chapterLabel: '#a07840',
      name: '#f0e8d0', sub: '#d4a017', intro: '#e8d8b0',
      quote: '#a07840', help: '#d4a017',
      score: '#f0e8d0', cur: '#d4a017', cta: '#f0e8d0',
      overlay: 'rgba(12,8,2,.84)',
    },
    labels: {
      chapter: 'LEG', score: 'MILES COVERED',
      win: 'FOGG GAINS GROUND', lose: 'THE WAGER IS LOST',
      cont: 'TAP TO PRESS ON', finale: 'TAP FOR THE FINAL LEG',
      toMenu: 'TAP TO RETURN', play: 'TAP TO DEPART',
    },
    accent: '#d4a017',
    palette: { gold: '#d4a017', cream: '#f0e8d0', burgundy: '#8b1a2a' },
    finale: [
      'THE WAGER IS WON.',
      'PHILEAS FOGG RETURNS',
      'TO LONDON IN TIME.',
      '',
      '"Here I am, gentlemen."',
      'The clock: 8:44:59.',
    ],
    width: 270, height: 480, parent: '#game',

    menu: {
      colors: { title: '#d4a017', label: '#a07840', cur: '#f0e8d0' },
      // World-map zigzag: London→Suez→India→Pacific→London return
      layout(api) {
        return [
          { x: 10,  y: 80,  w: 110, h: 62 },
          { x: 150, y: 140, w: 110, h: 62 },
          { x: 10,  y: 210, w: 110, h: 62 },
          { x: 150, y: 270, w: 110, h: 62 },
          { x: 59,  y: 350, w: 152, h: 62 },
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        // Passport stamp
        c.fillStyle = sel ? '#2a1e08' : '#140e04';
        c.fillRect(x + 2, y + 2, w - 4, h - 4);
        c.strokeStyle = sel ? '#d4a017' : (done ? '#7a5a14' : '#3a2808');
        c.lineWidth = sel ? 2 : 1;
        c.beginPath(); c.rect(x + 2, y + 2, w - 4, h - 4); c.stroke();
        // Dashed inner border
        c.strokeStyle = sel ? 'rgba(212,160,23,.45)' : 'rgba(139,100,20,.2)';
        c.lineWidth = 1; c.setLineDash([3, 2]);
        c.strokeRect(x + 6, y + 6, w - 12, h - 12);
        c.setLineDash([]);
        api.txtC('LEG ' + (i + 1), x + w / 2, y + 12, 7, done ? '#d4a017' : '#5a4010', true);
        api.txtCFit(ch.name, x + w / 2, y + 28, 7, sel ? '#f0e8d0' : (done ? '#c8a050' : '#8a6a30'), false, w - 12);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2, y + 42, 6, sel ? '#a07840' : '#4a3410', false, w - 12);
        if (done) {
          c.globalAlpha = 0.85;
          g.circle(x + w - 16, y + 14, 10, '#8b1a2a');
          api.txtC('✓', x + w - 16, y + 10, 9, '#f0d0d0');
          c.globalAlpha = 1;
        }
      },
    },

    chapters: [
      /* ===== LEG 1: THE WAGER — Reform Club timing ===== */
      {
        id: 'wager', name: 'THE WAGER', sub: 'REFORM CLUB',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.circle(x, y, 7, '#c8a020'); g.circle(x, y, 5, '#f0e8c0');
          c.strokeStyle = '#2a1a06'; c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 4); c.stroke();
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3, y + 2); c.stroke();
        },
        intro: [
          'PHILEAS FOGG WAGERS',
          '£20,000 THAT HE CAN',
          'CIRCLE THE GLOBE',
          'IN EIGHTY DAYS.',
          'Seal the deal at',
          'the right moment.',
        ],
        quote: 'I will bet twenty thousand pounds against anyone who wishes that I will make the tour of the world in eighty days or less.',
        help: 'TAP when the clock hand lands in the GOLD zone — seal the wager 3 times',
        winText: 'Fogg seals the bet with a calm handshake. "Passepartout! We leave at 8:45 this very evening."',
        loseText: 'The hand wavers at the wrong hour. The gentlemen laugh. The wager is refused.',
        init(api) {
          this.sealed = 0; this.need = 3; this.angle = 0;
          this.spd = 1.1; this.misses = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.angle += this.spd * 0.04 * f;
          if (this.angle >= Math.PI * 2) this.angle -= Math.PI * 2;
          // Gold zone: near 12 o'clock (±22% of the full circle)
          const norm = this.angle / (Math.PI * 2);
          const inZone = norm < 0.12 || norm > 0.88;
          if (api.confirm()) {
            if (inZone) {
              this.sealed++;
              api.score += 40;
              api.audio.sfx('coin');
              api.burst(api.W / 2, api.H / 2 - 20, '#d4a017', 12);
              api.flash('#d4a017', 0.1);
              this.spd = Math.min(2.6, this.spd + 0.35);
              if (this.sealed >= this.need) { api.score += 80; api.win(); }
            } else {
              this.misses++;
              api.shake(4, 0.2);
              api.audio.sfx('hurt');
              if (this.misses >= 4) api.lose();
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const cx = W / 2, cy = H / 2 - 14;
          api.clear('#1a1408');
          // Club room wood panelling
          for (let y = 0; y < H; y += 22) {
            c.fillStyle = Math.floor(y / 22) % 2 ? '#1e1508' : '#1a1206';
            c.fillRect(0, y, W, 22);
          }
          for (let x = 0; x < W; x += 34) g.rect(x, 0, 1, H, '#0d0a04');
          // Club table
          g.rect(W / 2 - 72, H / 2 + 52, 144, 14, '#3a2008');
          g.rect(W / 2 - 74, H / 2 + 50, 148, 5, '#5a3010');
          // Large clock
          g.circle(cx, cy, 60, '#8b6914');
          g.circle(cx, cy, 56, '#c8a020');
          g.circle(cx, cy, 52, '#f0e8c0');
          for (let i = 0; i < 12; i++) {
            const a = i / 12 * Math.PI * 2 - Math.PI / 2;
            c.strokeStyle = '#3a2408'; c.lineWidth = i % 3 === 0 ? 2.5 : 1.5;
            c.beginPath();
            c.moveTo(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44);
            c.lineTo(cx + Math.cos(a) * 50, cy + Math.sin(a) * 50);
            c.stroke();
          }
          // Gold zone arc
          c.globalAlpha = 0.38;
          c.fillStyle = '#d4a017';
          c.beginPath(); c.moveTo(cx, cy);
          c.arc(cx, cy, 50, -Math.PI / 2 - Math.PI * 0.22, -Math.PI / 2 + Math.PI * 0.22);
          c.closePath(); c.fill();
          c.globalAlpha = 1;
          // Spinning hand
          c.strokeStyle = '#1a0e06'; c.lineWidth = 3;
          c.beginPath(); c.moveTo(cx, cy);
          c.lineTo(cx + Math.cos(this.angle - Math.PI / 2) * 46, cy + Math.sin(this.angle - Math.PI / 2) * 46);
          c.stroke();
          // Counter-weight hand
          c.lineWidth = 1.5; c.strokeStyle = '#2a1808';
          c.beginPath(); c.moveTo(cx, cy);
          c.lineTo(cx + Math.cos(this.angle + Math.PI / 2) * 18, cy + Math.sin(this.angle + Math.PI / 2) * 18);
          c.stroke();
          g.circle(cx, cy, 4, '#3a2408');
          // Seal counters at bottom
          for (let i = 0; i < this.need; i++) {
            const sx = W / 2 - 30 + i * 30, sy = H - 38;
            g.circle(sx, sy, 12, i < this.sealed ? '#8b1a2a' : '#2a1a06');
            if (i < this.sealed) api.txtC('✓', sx, sy - 5, 10, '#f0d0d0');
            else api.txtC('' + (i + 1), sx, sy - 5, 9, '#4a3010');
          }
          api.topBar('THE REFORM CLUB WAGER');
          api.txt('SEALS ' + this.sealed + '/' + this.need, 6, 20, 9, '#d4a017');
          api.txt('MISS ' + this.misses + '/4', W - 82, 20, 9, this.misses > 2 ? '#c8102e' : '#6a5020');
          api.vignette();
        },
      },

      /* ===== LEG 2: THE MONGOLIA — Suez steer ===== */
      {
        id: 'mongolia', name: 'THE MONGOLIA', sub: 'BRINDISI TO SUEZ',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 7, y + 2, 14, 5, '#5a3420');
          g.rect(x - 2, y - 4, 4, 7, '#2a1808');
          g.rect(x + 1, y - 6, 7, 3, '#b0a080');
        },
        intro: [
          'FOGG BOARDS THE MONGOLIA',
          'AT BRINDISI FOR EGYPT.',
          'DETECTIVE FIX WATCHES',
          'FROM THE SHADOWS.',
          'Steer through churning',
          'seas to Suez.',
        ],
        quote: 'The Mongolia steamed towards Suez at a furious speed, the passengers never doubting they would arrive on time.',
        help: 'DRAG or LEFT/RIGHT to steer the Mongolia — dodge rocks and wave crests',
        winText: 'The Mongolia docks at Suez right on schedule. Passepartout gets the passport stamped.',
        loseText: 'The ship runs aground on submerged rocks. Days of delay are lost.',
        init(api) {
          this.x = api.W / 2; this.dist = 0; this.need = 840;
          this.obs = []; this.spawn = 1.4; this.spd = 38; this.hits = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.dist += this.spd * dt;
          this.spd = Math.min(54, 38 + this.dist / 200);
          api.score = Math.floor(this.dist / 4);
          const p = api.pointer;
          if (p.down) this.x += (p.x - this.x) * 0.14 * f;
          if (api.keyDown('left')) this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 20, api.W - 20);
          this.spawn -= dt;
          if (this.spawn <= 0) {
            this.spawn = Math.max(0.55, 1.4 - this.dist / 1800);
            this.obs.push({ x: api.rnd(22, api.W - 22), y: -22, vy: api.rnd(110, 170), kind: api.chance(0.4) ? 'rock' : 'wave', hit: false });
          }
          for (const o of this.obs) o.y += o.vy * dt;
          for (const o of this.obs) {
            if (!o.hit && Math.abs(o.x - this.x) < 20 && Math.abs(o.y - (api.H - 80)) < 20) {
              o.hit = true; this.hits++;
              api.shake(5, 0.25); api.flash('#1a4060', 0.2); api.audio.sfx('hurt');
            }
          }
          this.obs = this.obs.filter(o => o.y < api.H + 20 && !o.hit);
          if (this.hits >= 4) { api.lose(); return; }
          if (this.dist >= this.need) { api.score += 100; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0e2030');
          // Sky
          c.fillStyle = '#182840'; c.fillRect(0, 0, W, 56);
          g.circle(W - 38, 28, 12, '#d4a017');
          // Sea rows
          for (let y = 60; y < H - 60; y += 22) {
            c.globalAlpha = 0.1 + 0.05 * Math.sin(api.t * 2 + y * 0.05);
            g.rect(0, y, W, 9, '#1a4860');
          }
          c.globalAlpha = 1;
          // Obstacles
          for (const o of this.obs) {
            if (o.kind === 'rock') {
              g.rect(o.x - 12, o.y - 8, 24, 16, '#3a3020');
              g.rect(o.x - 10, o.y - 12, 20, 8, '#4a4030');
            } else {
              c.globalAlpha = 0.8;
              g.circle(o.x, o.y, 14, '#1a5878');
              g.circle(o.x - 2, o.y - 3, 6, '#4ab0e0');
              c.globalAlpha = 1;
            }
          }
          // Ship
          const sy = H - 80;
          g.rect(this.x - 24, sy + 8, 48, 12, '#5a3420');
          g.rect(this.x - 26, sy + 14, 52, 6, '#3a2010');
          g.rect(this.x - 5, sy - 18, 10, 26, '#2a1808');
          g.rect(this.x + 4, sy - 14, 12, 10, '#b0a078');
          for (let i = 0; i < 3; i++) {
            c.globalAlpha = 0.3 - i * 0.08;
            g.circle(this.x + 5, sy - 20 - i * 9, 5 + i * 2, '#9a9080');
          }
          c.globalAlpha = 1;
          // Progress
          g.rect(8, H - 14, W - 16, 5, '#1a1208');
          g.rect(8, H - 14, (W - 16) * clamp(this.dist / this.need, 0, 1), 5, '#d4a017');
          api.topBar('MONGOLIA — SUEZ RUN');
          api.txt('SUEZ ' + Math.floor(this.dist / this.need * 100) + '%', 6, 20, 9, '#d4a017');
          for (let i = 0; i < 4; i++) g.rect(W - 70 + i * 16, 19, 12, 8, i < (4 - this.hits) ? '#5dff8f' : '#2a1a06');
          api.vignette();
        },
      },

      /* ===== LEG 3: KIOUNI — India elephant dodge ===== */
      {
        id: 'kiouni', name: 'KIOUNI', sub: 'ACROSS INDIA',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 1, 12, 8, '#8a7060');
          g.rect(x - 8, y + 3, 4, 5, '#7a6050'); g.rect(x + 4, y + 3, 4, 5, '#7a6050');
          g.rect(x - 3, y - 6, 6, 7, '#8a7060');
          g.rect(x + 2, y - 4, 6, 3, '#7a6050');
        },
        intro: [
          'THE RAILWAY ENDS HERE.',
          'FOGG BUYS AN ELEPHANT',
          'FOR TWO THOUSAND POUNDS.',
          '"Kiouni will not',
          'fail us," says',
          'the guide.',
        ],
        quote: '"The man had not one instant to lose. He must reach Bombay before nightfall." — Jules Verne',
        help: 'DRAG up/down or press UP/DOWN — steer Kiouni past fallen logs, mud and branches',
        winText: 'Kiouni crashes through the last vines just as the Bombay train pulls into Allahabad station.',
        loseText: 'The jungle closes in. The path to Allahabad is hopelessly lost.',
        init(api) {
          this.y = api.H / 2; this.dist = 0; this.need = 960;
          this.obs = []; this.spawn = 1.1; this.vy = 0; this.hits = 0; this.scroll = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.dist += 50 * dt;
          this.scroll += 95 * dt;
          api.score = Math.floor(this.dist / 5);
          if (api.pointer.down) this.y += (api.pointer.y - this.y) * 0.12 * f;
          if (api.keyDown('up')) this.vy -= 7 * f;
          if (api.keyDown('down')) this.vy += 7 * f;
          this.vy *= Math.pow(0.88, f);
          this.y += this.vy * dt;
          this.y = clamp(this.y, 70, api.H - 55);
          this.spawn -= dt;
          if (this.spawn <= 0) {
            this.spawn = Math.max(0.5, 1.1 - this.dist / 2800);
            this.obs.push({ x: api.W + 24, y: api.rnd(70, api.H - 55), kind: api.rint(0, 2), hit: false });
          }
          for (const o of this.obs) o.x -= 115 * dt;
          for (const o of this.obs) {
            if (!o.hit && Math.abs(o.x - 55) < 24 && Math.abs(o.y - this.y) < 24) {
              o.hit = true; this.hits++;
              api.shake(5, 0.25); api.flash('#3a2010', 0.2); api.audio.sfx('hurt');
            }
          }
          this.obs = this.obs.filter(o => o.x > -30 && !o.hit);
          if (this.hits >= 3) { api.lose(); return; }
          if (this.dist >= this.need) { api.score += 100; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0e1806');
          g.rect(0, H - 28, W, 28, '#1a2808'); g.rect(0, H - 30, W, 4, '#2a3a0e');
          // Far trees (slow parallax)
          for (let i = 0; i < 10; i++) {
            const tx = ((i * 90 - this.scroll * 0.55 + 200) % (W + 50) + W + 50) % (W + 50) - 25;
            const th = 70 + (i * 37) % 55;
            c.fillStyle = '#0a1406'; c.fillRect(tx, H - 28 - th, 16, th);
            c.fillStyle = '#0e1c06'; c.beginPath(); c.arc(tx + 8, H - 28 - th, 20, 0, Math.PI * 2); c.fill();
          }
          // Near trees (fast parallax)
          for (let i = 0; i < 6; i++) {
            const tx = ((i * 130 - this.scroll * 1.1 + 100) % (W + 60) + W + 60) % (W + 60) - 30;
            c.fillStyle = '#070e04'; c.fillRect(tx, H - 28 - 110, 10, 110);
            c.fillStyle = '#0c1604'; c.beginPath(); c.arc(tx + 5, H - 28 - 110, 26, 0, Math.PI * 2); c.fill();
          }
          // Obstacles
          for (const o of this.obs) {
            if (o.kind === 0) {       // fallen log
              g.rect(o.x - 20, o.y - 7, 40, 14, '#4a2e08');
              g.rect(o.x - 18, o.y - 9, 36, 5, '#5a3a10');
            } else if (o.kind === 1) { // mud pool
              g.circle(o.x, o.y, 15, '#2a1e08');
              g.circle(o.x - 2, o.y - 2, 7, '#3a2a0e');
              api.txtC('~', o.x, o.y - 5, 9, '#6a5020');
            } else {                   // low branch
              g.rect(o.x - 26, o.y - 5, 52, 10, '#2a1a04');
              g.rect(o.x - 24, o.y - 7, 48, 5, '#3a2a08');
              for (let lx = o.x - 20; lx < o.x + 26; lx += 10) g.rect(lx, o.y + 4, 4, 6, '#1a1004');
            }
          }
          // Elephant body
          const ex = 55, ey = this.y;
          g.rect(ex - 14, ey - 10, 28, 20, '#8a7060');
          g.rect(ex - 18, ey + 4, 8, 10, '#7a6050'); g.rect(ex + 10, ey + 4, 8, 10, '#7a6050');
          g.rect(ex - 6, ey - 18, 12, 10, '#8a7060');
          g.rect(ex + 5, ey - 14, 10, 4, '#7a6050'); g.rect(ex + 13, ey - 10, 6, 2, '#7a6050');
          g.rect(ex - 5, ey - 20, 5, 7, '#9a8070');
          // Rider (Passepartout)
          g.rect(ex - 4, ey - 28, 8, 10, '#c8a070');
          g.rect(ex - 5, ey - 32, 10, 5, '#e8a030');
          // Progress
          g.rect(8, H - 12, W - 16, 5, '#1a1208');
          g.rect(8, H - 12, (W - 16) * clamp(this.dist / this.need, 0, 1), 5, '#d4a017');
          api.topBar('KIOUNI — ACROSS INDIA');
          api.txt('ALLAHABAD ' + Math.floor(this.dist / this.need * 100) + '%', 6, 20, 9, '#d4a017');
          for (let i = 0; i < 3; i++) g.rect(W - 52 + i * 16, 19, 12, 8, i < (3 - this.hits) ? '#5dff8f' : '#2a1a06');
          api.vignette();
        },
      },

      /* ===== LEG 4: THE HENRIETTA — boiler pressure ===== */
      {
        id: 'henrietta', name: 'THE HENRIETTA', sub: 'STOKING THE BOILER',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 2, 12, 8, '#3a2208');
          g.rect(x - 2, y - 8, 4, 7, '#2a1608');
          g.rect(x - 1, y - 10, 7, 3, '#b0a080');
        },
        intro: [
          'FOGG BUYS THE HENRIETTA',
          'AND BURNS THE SHIP\'S',
          'OWN WOODWORK FOR FUEL.',
          'Stoke the boiler!',
          'Keep her running hot',
          'across the Atlantic.',
        ],
        quote: 'He burned the masts, the spare spars, and all the woodwork on deck to keep up the steam.',
        help: 'TAP to add coal · keep the PRESSURE GAUGE in the GREEN zone for 30 seconds',
        winText: 'New York! The Henrietta limps in on the last spoonful of coal. "Onward, Passepartout!"',
        loseText: 'The boiler runs cold. The Henrietta drifts to a dead stop in the Atlantic.',
        init(api) {
          this.pressure = 0.5; this.timer = 30; this.goodTime = 0;
          this.target = 0.52; this.band = 0.2; this.drift = -0.036;
          this.tapFlash = 0;
        },
        update(api, dt) {
          this.timer -= dt;
          this.tapFlash = Math.max(0, this.tapFlash - dt * 3);
          // Drift increases slightly over time (fire cools faster)
          this.drift = -0.036 - (30 - this.timer) * 0.0015;
          this.pressure += this.drift * dt;
          this.pressure = clamp(this.pressure, 0, 1);
          if (api.confirm()) {
            this.pressure = Math.min(1, this.pressure + 0.14);
            this.tapFlash = 1;
            api.audio.sfx('blip');
          }
          const inZone = Math.abs(this.pressure - this.target) < this.band;
          if (inZone) { this.goodTime += dt; api.score = Math.floor(this.goodTime * 12); }
          if (this.pressure < 0.04) { api.lose(); return; }
          if (this.pressure > 0.96) api.shake(2, 0.1);
          if (this.timer <= 0) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#08100c');
          c.fillStyle = '#0a1c2c'; c.fillRect(0, 0, W, Math.floor(H * 0.42));
          // Stars
          for (let i = 0; i < 20; i++) {
            const sx = (i * 83) % W, sy = (i * 41) % Math.floor(H * 0.35);
            c.globalAlpha = 0.18 + 0.22 * Math.sin(api.t * 1.2 + i);
            g.rect(sx, sy, 1, 1, '#f0e8c8');
          }
          c.globalAlpha = 1;
          // Ship silhouette
          const shipY = Math.floor(H * 0.44) + Math.round(Math.sin(api.t * 0.9) * 4);
          g.rect(18, shipY - 14, W - 36, 26, '#2a1808');
          g.rect(W / 2 - 5, shipY - 46, 10, 33, '#1a1006');
          // Smoke stack puffs
          for (let i = 0; i < 5; i++) {
            const smx = W / 2 + Math.round(Math.sin(api.t * 2 + i) * 7);
            const smy = shipY - 48 - i * 10;
            c.globalAlpha = (0.38 - i * 0.07) * (0.4 + 0.6 * this.pressure);
            g.circle(smx, smy, 6 + i * 2, '#6a5a50');
          }
          c.globalAlpha = 1;
          // Boiler gauge
          const gx = W / 2 - 18, gy = Math.floor(H * 0.52), gw = 36, gh = Math.floor(H * 0.27);
          g.rect(gx - 5, gy - 5, gw + 10, gh + 10, '#2a1a06');
          g.rect(gx, gy, gw, gh, '#140e04');
          // Danger zones (top + bottom)
          const dh = Math.floor(gh * 0.05);
          g.rect(gx, gy, gw, dh, 'rgba(200,16,46,.4)');
          g.rect(gx, gy + gh - dh, gw, dh, 'rgba(200,16,46,.4)');
          // Green zone
          const zo = Math.floor(gh * (1 - (this.target + this.band)));
          const zs = Math.floor(gh * this.band * 2);
          g.rect(gx, gy + zo, gw, zs, 'rgba(93,255,143,.28)');
          // Pressure fill
          const pH = Math.floor(gh * this.pressure);
          const inZone = Math.abs(this.pressure - this.target) < this.band;
          const pc = this.pressure > 0.94 ? '#c84030' : (inZone ? '#5dff8f' : '#d4a017');
          g.rect(gx, gy + gh - pH, gw, pH, pc);
          g.rectO(gx, gy, gw, gh, '#5a4010', 1);
          api.txtC('BOILER', W / 2, gy - 14, 7, '#d4a017', true);
          // Tap button
          const tc = this.tapFlash > 0 ? '#f0e8d0' : '#5a4010';
          g.rect(W / 2 - 35, H - 58, 70, 30, '#1e1408');
          g.rectO(W / 2 - 35, H - 58, 70, 30, tc, 2);
          api.txtC('COAL', W / 2, H - 51, 9, tc, true);
          api.txtC('(TAP)', W / 2, H - 38, 7, tc, true);
          // Timer bar
          const tr = clamp(this.timer / 30, 0, 1);
          g.rect(8, H - 14, W - 16, 5, '#1a1208');
          g.rect(8, H - 14, Math.floor((W - 16) * tr), 5, '#d4a017');
          api.topBar('THE HENRIETTA');
          api.txt('PRESSURE', 6, 20, 8, '#a07840');
          api.txt(Math.ceil(this.timer) + 's', W - 36, 20, 9, '#d4a017');
          api.vignette();
        },
      },

      /* ===== LEG 5: LONDON IN TIME — carriage sprint ===== */
      {
        id: 'london', name: 'LONDON IN TIME', sub: 'THE FINAL SPRINT',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.circle(x, y, 7, '#8b1a2a'); g.circle(x, y, 5, '#c82030');
          c.strokeStyle = '#f0e8d0'; c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 4); c.stroke();
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3, y + 2); c.stroke();
          g.circle(x, y, 2, '#1a0e06');
        },
        intro: [
          'FOGG THINKS HE IS LATE.',
          'PASSEPARTOUT REALIZES',
          'THE TRUTH — THEY CROSSED',
          'THE DATE LINE.',
          'They gained a day!',
          'Race to the Club!',
        ],
        quote: 'Phileas Fogg had won his wager of twenty thousand pounds. He had made the tour of the world in eighty days!',
        help: 'DRAG or LEFT/RIGHT to steer · reach the Reform Club before the clock strikes nine',
        winText: '"Here I am, gentlemen," says Fogg. The clock reads 8:44 and 59 seconds. He has won.',
        loseText: 'The church bell tolls nine. The Reform Club doors swing shut. The wager is lost by seconds.',
        init(api) {
          this.x = api.W / 2; this.timer = 32; this.dist = 0; this.need = 960;
          this.obs = []; this.spawn = 1.0; this.hits = 0; this.spd = 30;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.dist += this.spd * dt;
          this.spd = Math.min(52, 30 + (32 - this.timer) * 0.8);
          api.score = Math.floor(this.dist / 4);
          const p = api.pointer;
          if (p.down) this.x += (p.x - this.x) * 0.15 * f;
          if (api.keyDown('left')) this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 20, api.W - 20);
          this.spawn -= dt;
          if (this.spawn <= 0) {
            this.spawn = Math.max(0.42, 1.0 - (32 - this.timer) * 0.022);
            this.obs.push({ x: api.rnd(20, api.W - 20), y: -22, vy: api.rnd(140, 210), kind: api.rint(0, 2), hit: false });
          }
          for (const o of this.obs) o.y += o.vy * dt;
          for (const o of this.obs) {
            if (!o.hit && Math.abs(o.x - this.x) < 20 && Math.abs(o.y - (api.H - 70)) < 20) {
              o.hit = true; this.hits++; this.timer -= 2.5;
              api.shake(5, 0.25); api.flash('#1a1206', 0.2); api.audio.sfx('hurt');
              api.burst(this.x, api.H - 70, '#d4a017', 8);
            }
          }
          this.obs = this.obs.filter(o => o.y < api.H + 20 && !o.hit);
          if (this.timer <= 0) { api.lose(); return; }
          if (this.dist >= this.need) { api.score += 120 + Math.floor(this.timer * 5); api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0c0a06');
          // Cobblestone road
          g.rect(0, H - 88, W, 88, '#1a1610'); g.rect(0, H - 90, W, 4, '#2a2218');
          const sc = (this.dist * 0.9) % 40;
          for (let y = H - 86 + sc % 20; y < H; y += 20) g.rect(W / 2 - 2, y, 4, 10, '#3a3428');
          // Gas lamp posts
          for (let i = 0; i < 5; i++) {
            const lx = ((i * 60 - this.dist) % (W + 40) + W + 40) % (W + 40) - 20;
            if (lx < 0 || lx > W) continue;
            g.rect(lx - 2, H - 132, 4, 44, '#4a3818');
            c.globalAlpha = 0.55 + 0.12 * Math.sin(api.t * 4 + i);
            g.circle(lx, H - 132, 9, '#d4a017');
            c.globalAlpha = 0.12 + 0.04 * Math.sin(api.t * 4 + i);
            g.circle(lx, H - 132, 22, '#d4a017');
            c.globalAlpha = 1;
          }
          // Buildings (parallax)
          for (let i = 0; i < 6; i++) {
            const bx = ((i * 55 - this.dist * 0.5) % (W + 60) + W + 60) % (W + 60) - 30;
            const bh = 55 + (i * 31) % 50;
            c.fillStyle = '#0c0a04'; c.fillRect(bx, H - 90 - bh, 36, bh);
            for (let wy = H - 90 - bh + 8; wy < H - 90 - 10; wy += 16)
              for (let wx = bx + 5; wx < bx + 31; wx += 10) g.rect(wx, wy, 7, 9, '#c8902a');
          }
          // Obstacles
          for (const o of this.obs) {
            if (o.kind === 0) {       // oncoming carriage
              g.rect(o.x - 16, o.y - 10, 32, 20, '#2a1a06');
              g.rect(o.x - 14, o.y - 8, 28, 16, '#3a2810');
              g.rect(o.x - 8, o.y - 8, 16, 10, '#c8902a');
              g.circle(o.x - 9, o.y + 10, 5, '#1a1206'); g.circle(o.x + 9, o.y + 10, 5, '#1a1206');
            } else if (o.kind === 1) { // barrel
              g.rect(o.x - 8, o.y - 10, 16, 20, '#3a2408');
              g.rect(o.x - 9, o.y - 8, 18, 3, '#5a3e10'); g.rect(o.x - 9, o.y + 3, 18, 3, '#5a3e10');
            } else {                   // police constable (stop sign)
              g.rect(o.x - 4, o.y - 14, 8, 14, '#1a2838');
              g.rect(o.x - 5, o.y - 16, 10, 4, '#101e28');
              g.rect(o.x - 3, o.y, 6, 10, '#1a3040');
              api.txtC('!', o.x, o.y - 26, 9, '#d4a017');
            }
          }
          // Player carriage
          const py = H - 70;
          g.rect(this.x - 22, py - 14, 44, 28, '#3a2408');
          g.rect(this.x - 20, py - 12, 40, 24, '#4a3010');
          g.rect(this.x - 10, py - 10, 20, 16, '#c8902a');
          g.circle(this.x - 14, py + 14, 7, '#1a1206'); g.circle(this.x + 14, py + 14, 7, '#1a1206');
          // Big Ben — visible ahead, grows as progress increases
          const bbProgress = this.dist / this.need;
          const bbx = Math.floor(W - 18 - bbProgress * 58);
          if (bbx > 0 && bbx < W) {
            c.fillStyle = '#0a0806'; c.fillRect(bbx - 14, H - 192, 28, 102);
            for (let bx = bbx - 14; bx < bbx + 14; bx += 7) c.fillRect(bx, H - 194, 4, 5);
            c.fillRect(bbx - 5, H - 202, 10, 10); c.fillRect(bbx - 2, H - 208, 4, 7);
            g.circle(bbx, H - 168, 12, '#c8a020'); g.circle(bbx, H - 168, 10, '#f0e8a0');
          }
          // Timer bar
          const tr = clamp(this.timer / 32, 0, 1);
          g.rect(8, H - 12, W - 16, 5, '#1a1208');
          g.rect(8, H - 12, Math.floor((W - 16) * tr), 5, tr < 0.25 ? '#c8102e' : '#d4a017');
          api.topBar('RACE TO THE REFORM CLUB');
          api.txt('CLUB ' + Math.floor(this.dist / this.need * 100) + '%', 6, 20, 9, '#d4a017');
          api.txt(Math.ceil(this.timer) + 's', W - 36, 20, 9, this.timer < 8 ? '#c8102e' : '#d4a017');
          api.vignette();
        },
      },
    ],
  });
})();
