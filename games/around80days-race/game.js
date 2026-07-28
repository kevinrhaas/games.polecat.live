/* ============================================================================
 * AROUND THE WORLD IN EIGHTY DAYS — PHILEAS FOGG'S RACE
 * Five legs of Verne's globe-trotting wager:
 *   1. THE WAGER     — clock timing, seal the bet at the Reform Club
 *   2. THE MONGOLIA  — chart the Mongolia's course to Suez (route-planning)
 *   3. KIOUNI        — free-roam stealth: rescue Aouda from the Pillaji pyre
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

      /* ===== LEG 2: THE MONGOLIA — chart the course (route-planning) ===== */
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
          'Chart her course to Suez —',
          'every strait a choice.',
        ],
        quote: 'The Mongolia steamed towards Suez at a furious speed, the passengers never doubting they would arrive on time.',
        help: 'TAP a route at each strait. STEAM is fast but burns coal; the SAFE lane spares the reserve but costs days. Run the bunkers dry, or miss the calendar, and the wager slips away.',
        winText: '', loseText: '',
        init(api) {
          this.coal = 70; this.day = 0; this.dayCap = 6; this.leg = 0;
          this.legs = [
            { name: 'OTRANTO STRAIT', text: 'THE NARROW GATE TO THE ADRIATIC.',
              fast: { label: 'STEAM THE STRAIT', sub: '+1 day · -22 coal', day: 1, coal: -22 },
              safe: { label: 'HUG THE ITALIAN COAST', sub: '+2 days · -8 coal', day: 2, coal: -8 } },
            { name: 'CAPE MATAPAN', text: "GREECE'S STORMY SOUTHERN HORN.",
              fast: { label: 'RACE THE OPEN CHANNEL', sub: '+1 day · -24 coal', day: 1, coal: -24 },
              safe: { label: "SHELTER IN KYTHIRA'S LEE", sub: '+2 days · -8 coal', day: 2, coal: -8 } },
            { name: 'CRETAN PASSAGE', text: 'THE LAST COALING PORT BEFORE EGYPT.',
              fast: { label: 'PRESS ON THROUGH THE NIGHT', sub: '+1 day · -20 coal', day: 1, coal: -20 },
              safe: { label: 'PUT IN AT CRETE FOR COAL', sub: '+2 days · +10 coal', day: 2, coal: 10 } },
            { name: 'SUEZ APPROACH', text: 'THE CANAL MOUTH, AND THE PASSPORT STAMP.',
              fast: { label: 'FULL STEAM TO SUEZ', sub: '+1 day · -18 coal', day: 1, coal: -18 },
              safe: { label: 'DRIFT IN ON THE TIDE', sub: '+2 days · -6 coal', day: 2, coal: -6 } },
          ];
          this.active = this.legs[0];
          this.feedback = null; this.feedbackT = 0;
        },
        choiceRects(api) {
          const W = api.W, H = api.H;
          return [
            { x: 16, y: H - 128, w: W - 32, h: 42 },
            { x: 16, y: H - 78, w: W - 32, h: 42 },
          ];
        },
        update(api, dt) {
          this.feedbackT = Math.max(0, this.feedbackT - dt);
          if (this.feedbackT > 0 || !this.active) return;
          if (!api.pointer.justDown) return;
          const rects = this.choiceRects(api);
          const opts = [this.active.fast, this.active.safe];
          for (let i = 0; i < 2; i++) {
            const r = rects[i];
            if (api.pointer.x >= r.x && api.pointer.x <= r.x + r.w &&
                api.pointer.y >= r.y && api.pointer.y <= r.y + r.h) {
              const pick = opts[i];
              this.day += pick.day;
              this.coal += pick.coal;
              api.addScore(30);
              this.feedback = pick.label; this.feedbackT = 0.9;
              if (i === 0) { api.shake(3, 0.15); api.flash('#1a4060', 0.12); api.audio.sfx('blip'); }
              else api.audio.sfx('select');
              api.burst(api.W / 2, api.H * 0.4, pick.coal >= 0 ? '#5dff8f' : '#d4a017', 8);
              if (this.coal < 0) {
                this.loseText = 'The bunkers run dry in open water. The Mongolia drifts, dead in the swell, far short of Suez.';
                this.active = null; api.lose(); return;
              }
              this.leg++;
              if (this.leg >= this.legs.length) {
                if (this.day > this.dayCap) {
                  this.loseText = 'The Mongolia raises Suez two days behind the timetable — the connecting steamer has already sailed.';
                  this.active = null; api.lose(); return;
                }
                this.winText = this.coal >= 30
                  ? 'The Mongolia docks at Suez with coal and days to spare. Passepartout gets the passport stamped.'
                  : 'The Mongolia docks at Suez on the very last shovel of coal. Passepartout gets the passport stamped.';
                api.addScore(80);
                this.active = null; api.win(); return;
              }
              this.active = this.legs[this.leg];
              break;
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0e2030');
          // Sky
          c.fillStyle = '#182840'; c.fillRect(0, 0, W, 46);
          g.circle(W - 34, 24, 10, '#d4a017');
          // Sea rows
          for (let y = 50; y < H * 0.42; y += 20) {
            c.globalAlpha = 0.08 + 0.05 * Math.sin(api.t * 2 + y * 0.05);
            g.rect(0, y, W, 8, '#1a4860');
          }
          c.globalAlpha = 1;
          // Route map: the waypoint chain from Brindisi to Suez
          const names = ['BRINDISI', 'OTRANTO', 'MATAPAN', 'CRETE', 'SUEZ'];
          const mapY = 64, mapL = 26, mapR = W - 26;
          for (let wi = 0; wi < names.length; wi++) {
            const wx = mapL + wi * ((mapR - mapL) / (names.length - 1));
            const passed = wi < this.leg, isCur = wi === this.leg;
            if (wi > 0) {
              const pwx = mapL + (wi - 1) * ((mapR - mapL) / (names.length - 1));
              c.strokeStyle = (passed || isCur) ? '#d4a017' : '#2a3a4a';
              c.lineWidth = 2; c.globalAlpha = 0.55;
              c.beginPath(); c.moveTo(pwx, mapY); c.lineTo(wx, mapY); c.stroke();
              c.globalAlpha = 1;
            }
            g.circle(wx, mapY, isCur ? 6 : 4, passed ? '#5dff8f' : (isCur ? '#f0e8c0' : '#2a3a4a'));
            api.txtC(names[wi].slice(0, 3), wx, mapY + 12, 6, (passed || isCur) ? '#d4a017' : '#4a5a6a', true);
          }
          const shipX = mapL + Math.min(this.leg, names.length - 1) * ((mapR - mapL) / (names.length - 1));
          g.rect(shipX - 6, mapY - 17, 12, 5, '#5a3420');
          g.rect(shipX - 1, mapY - 22, 2, 6, '#2a1808');
          // Mid-scene steamer, riding the current stretch of sea
          const midY = H * 0.36;
          for (let i = 0; i < 4; i++) { c.globalAlpha = 0.22; g.rect(0, midY - 4 + i * 12, W, 4, '#1a4860'); }
          c.globalAlpha = 1;
          g.rect(W / 2 - 26, midY - 6, 52, 14, '#5a3420');
          g.rect(W / 2 - 28, midY, 56, 6, '#3a2010');
          g.rect(W / 2 - 5, midY - 24, 10, 20, '#2a1808');
          g.rect(W / 2 + 4, midY - 20, 12, 10, '#b0a078');
          for (let i = 0; i < 3; i++) {
            c.globalAlpha = 0.3 - i * 0.08;
            g.circle(W / 2 + 9, midY - 26 - i * 9, 5 + i * 2, '#9a9080');
          }
          c.globalAlpha = 1;
          // Encounter card
          const cardY = H * 0.52;
          g.rect(14, cardY, W - 28, 40, '#0e1a1e');
          c.strokeStyle = '#4a6878'; c.lineWidth = 1; c.strokeRect(14, cardY, W - 28, 40);
          if (this.active) {
            api.txtCFit(this.active.name, W / 2, cardY + 6, 8, '#f0e8d0', true, W - 40);
            api.txtCFit(this.feedbackT > 0 ? ('"' + this.feedback + '"') : this.active.text,
              W / 2, cardY + 24, 7, this.feedbackT > 0 ? '#d4a017' : '#8aa0b0', false, W - 40);
          }
          // Choice buttons
          if (this.feedbackT <= 0 && this.active) {
            const rects = this.choiceRects(api);
            const opts = [this.active.fast, this.active.safe];
            for (let i = 0; i < 2; i++) {
              const r = rects[i], o = opts[i];
              g.rect(r.x, r.y, r.w, r.h, i === 0 ? '#241a08' : '#0e1a1e');
              c.strokeStyle = i === 0 ? '#d4a017' : '#4a6878';
              c.lineWidth = 1; c.strokeRect(r.x, r.y, r.w, r.h);
              api.txtCFit(o.label, r.x + r.w / 2, r.y + 9, 9, '#f0e8d0', false, r.w - 12);
              api.txtCFit(o.sub, r.x + r.w / 2, r.y + 27, 7, i === 0 ? '#d4a017' : '#7ab8d8', false, r.w - 12);
            }
          }
          // Stat readout
          api.txt('COAL', 6, 20, 8, '#a07840');
          g.rect(42, 15, W - 96, 6, '#1a1208');
          g.rect(42, 15, Math.floor((W - 96) * clamp(this.coal / 70, 0, 1)), 6, this.coal < 20 ? '#c8102e' : '#d4a017');
          api.txt('DAY ' + this.day + '/' + this.dayCap, W - 60, 20, 8, this.day > this.dayCap ? '#c8102e' : '#d4a017');
          api.topBar('MONGOLIA — CHART THE COURSE');
          api.vignette();
        },
      },

      /* ===== LEG 3: KIOUNI — the Pillaji rescue (free-roam stealth) ===== */
      {
        id: 'kiouni', name: 'KIOUNI', sub: 'THE PILLAJI RESCUE',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.rect(x - 1, y - 1, 2, 8, '#4a2e08');
          g.circle(x, y - 6, 3, '#e08030'); g.circle(x, y - 7, 2, '#f6d060');
          c.strokeStyle = '#7a5010'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x - 4, y + 6); c.lineTo(x + 4, y + 6); c.stroke();
        },
        intro: [
          'THE RAILWAY ENDS HERE.',
          'FOGG BUYS THE ELEPHANT',
          'KIOUNI AND A GUIDE.',
          'Near Pillaji, drums warn',
          'of a young widow, Aouda,',
          'to be burned at dawn.',
          'Creep through the priests\'',
          'torchlight and steal',
          'her away before then.',
        ],
        quote: 'The whole party crept through the shadow of the trees, in absolute silence, toward the pyre where the young widow lay senseless, waiting for a dawn she would not see.',
        help: 'DRAG or ARROW KEYS to creep through the grove. Stay out of the priests\' torchlight, reach Aouda, then carry her back to Kiouni before the drums call dawn.',
        winText: 'Passepartout scoops up the drugged Aouda and melts into the trees. Kiouni waits, unseen and unheard — free.',
        loseText: 'A torch swings round. Shouts ring through the grove — the priests raise the alarm, and the rescue is lost.',
        init(api) {
          this.startX = api.W / 2; this.startY = api.H - 46;
          this.aoudaX = api.W / 2; this.aoudaY = 96;
          this.px = this.startX; this.py = this.startY;
          this.phase = 'in';        // 'in' creeping toward Aouda, 'out' carrying her back
          this.lives = 3; this.hitCD = 0; this.timer = 30; this.glowT = 0;
          this.g1 = { x: api.W * 0.28, y: 170, dir: 1, spd: 46 };  // horizontal patrol
          this.g2 = { x: api.W * 0.76, y: 150, dir: 1, spd: 34 };  // vertical patrol
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;
          this.timer -= dt;
          this.hitCD = Math.max(0, this.hitCD - dt);
          this.glowT += dt;
          // Drag toward pointer
          if (api.pointer.down) {
            const dx = api.pointer.x - this.px, dy = api.pointer.y - this.py;
            const d = Math.hypot(dx, dy);
            if (d > 3) { const s = 42 * dt; this.px += dx / d * s; this.py += dy / d * s; }
          }
          // Arrow keys
          let kx = 0, ky = 0;
          if (api.keyDown('left')) kx = -1;
          if (api.keyDown('right')) kx = 1;
          if (api.keyDown('up')) ky = -1;
          if (api.keyDown('down')) ky = 1;
          this.px = clamp(this.px + kx * 46 * dt, 24, W - 24);
          this.py = clamp(this.py + ky * 46 * dt, 46, H - 40);
          this.px = clamp(this.px, 24, W - 24);
          this.py = clamp(this.py, 46, H - 40);

          // Patrols
          this.g1.x += this.g1.dir * this.g1.spd * dt;
          if (this.g1.x > W - 46) this.g1.dir = -1;
          if (this.g1.x < 46) this.g1.dir = 1;
          this.g2.y += this.g2.dir * this.g2.spd * dt;
          if (this.g2.y > H - 90) this.g2.dir = -1;
          if (this.g2.y < 118) this.g2.dir = 1;

          if (this.hitCD <= 0) {
            const guards = [
              { x: this.g1.x, y: this.g1.y, angle: this.g1.dir > 0 ? 0 : Math.PI },
              { x: this.g2.x, y: this.g2.y, angle: this.g2.dir > 0 ? Math.PI * 0.5 : Math.PI * 1.5 },
            ];
            for (const guard of guards) {
              const dx = this.px - guard.x, dy = this.py - guard.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 76) {
                const toPlayer = Math.atan2(dy, dx);
                let diff = toPlayer - guard.angle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                if (Math.abs(diff) < 0.5) {
                  this.lives--;
                  this.hitCD = 1.2;
                  api.shake(6, 0.3); api.flash('#e08030', 0.18); api.audio.sfx('hurt');
                  api.burst(this.px, this.py, '#e08030', 10);
                  if (this.lives <= 0) { api.lose(); return; }
                  const kd = dist > 0.01 ? dist : 1;
                  this.px = clamp(this.px + (dx / kd) * 46, 24, W - 24);
                  this.py = clamp(this.py + (dy / kd) * 46, 46, H - 40);
                  break;
                }
              }
            }
          }

          api.addScore(Math.floor(dt * 6));
          if (this.phase === 'in') {
            if (Math.hypot(this.px - this.aoudaX, this.py - this.aoudaY) < 20) {
              this.phase = 'out';
              this.hitCD = Math.max(this.hitCD, 0.6);
              api.addScore(70);
              api.audio.sfx('coin'); api.flash('#f6d060', 0.14);
              api.burst(this.aoudaX, this.aoudaY, '#f6d060', 14);
            }
          } else if (Math.hypot(this.px - this.startX, this.py - this.startY) < 20) {
            api.score += Math.max(0, Math.floor(this.timer * 4));
            api.win(); return;
          }
          if (this.timer <= 0) { api.lose(); return; }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a1408');
          // Canopy-filtered moonlight clearing
          c.fillStyle = '#0e1c0c'; c.fillRect(0, 40, W, H - 40);
          for (let i = 0; i < 14; i++) {
            const mx = (i * 61 + 20) % W, my = 44 + (i * 97) % (H - 100);
            c.globalAlpha = 0.05 + 0.03 * Math.sin(this.glowT * 1.3 + i);
            g.circle(mx, my, 16, '#9ac86a');
          }
          c.globalAlpha = 1;
          // Tree-line border
          for (let tx = 6; tx < W; tx += 30) { c.fillStyle = '#050c04'; c.fillRect(tx, 40, 10, H - 40); }
          c.fillStyle = '#0e1c0c'; c.fillRect(14, 40, W - 28, H - 40);

          // The pyre platform (Aouda's fate, if still there)
          g.rect(this.aoudaX - 22, this.aoudaY + 10, 44, 8, '#2a1a08');
          for (let lx = this.aoudaX - 20; lx < this.aoudaX + 22; lx += 8) g.rect(lx, this.aoudaY + 2, 5, 9, '#3a2408');
          if (this.phase === 'in') {
            g.rect(this.aoudaX - 12, this.aoudaY - 8, 24, 9, '#e8ded0');
            g.circle(this.aoudaX, this.aoudaY - 11, 5, '#c8a878');
            c.globalAlpha = 0.55 + 0.15 * Math.sin(this.glowT * 2);
            g.circle(this.aoudaX, this.aoudaY, 26, '#f6d060');
            c.globalAlpha = 1;
          }

          // Patrol guards + torch cones
          const guards = [
            { x: this.g1.x, y: this.g1.y, angle: this.g1.dir > 0 ? 0 : Math.PI },
            { x: this.g2.x, y: this.g2.y, angle: this.g2.dir > 0 ? Math.PI * 0.5 : Math.PI * 1.5 },
          ];
          for (const guard of guards) {
            c.globalAlpha = 0.15;
            c.fillStyle = '#f0a030';
            c.beginPath(); c.moveTo(guard.x, guard.y);
            c.arc(guard.x, guard.y, 76, guard.angle - 0.5, guard.angle + 0.5);
            c.closePath(); c.fill();
            c.globalAlpha = 1;
            g.circle(guard.x, guard.y - 10, 7, '#4a3018');
            g.rect(guard.x - 5, guard.y - 3, 10, 16, '#c8902a');
            const lx = guard.x + Math.cos(guard.angle) * 16, ly = guard.y + Math.sin(guard.angle) * 16;
            c.strokeStyle = '#5a3a14'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(guard.x, guard.y); c.lineTo(lx, ly); c.stroke();
            g.circle(lx, ly, 4, '#e08030'); g.circle(lx, ly, 2, '#f6d060');
          }

          // Exit / Kiouni waiting in the shadows
          c.globalAlpha = 0.5 + 0.2 * Math.sin(this.glowT * 1.6);
          g.circle(this.startX, this.startY, 16, '#3a5a2a');
          c.globalAlpha = 1;
          api.txtC('K', this.startX, this.startY - 4, 8, '#9ac86a', true);

          // Player (Passepartout, carrying Aouda once rescued)
          const invis = this.hitCD > 0 && Math.floor(this.hitCD * 8) % 2 === 0;
          if (!invis) {
            if (this.phase === 'out') {
              g.rect(this.px - 10, this.py - 9, 8, 15, '#e8ded0');
              g.circle(this.px - 6, this.py - 12, 4, '#c8a878');
            }
            g.rect(this.px - 4, this.py - 10, 8, 15, '#c8a070');
            g.circle(this.px, this.py - 13, 4, '#8a6a4a');
            g.rect(this.px - 3, this.py - 17, 6, 4, '#e8a030');
          }

          api.topBar(this.phase === 'in' ? 'CREEP TOWARD THE PYRE' : 'CARRY HER TO KIOUNI');
          for (let i = 0; i < 3; i++) g.circle(W - 20 - i * 16, 20, 5, i < this.lives ? '#e08030' : '#3a2a1a');
          const tr = clamp(this.timer / 30, 0, 1);
          g.rect(8, H - 12, W - 16, 5, '#1a1208');
          g.rect(8, H - 12, Math.floor((W - 16) * tr), 5, tr < 0.25 ? '#c8102e' : '#e08030');
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

      /* ===== LEG 5: LONDON IN TIME — urge the horses (rhythm) ===== */
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
        help: 'TAP the reins in rhythm with each GOLD beat to urge the horses on — hold back when a RED beat rides through · reach the Reform Club before the clock strikes nine',
        winText: '"Here I am, gentlemen," says Fogg. The clock reads 8:44 and 59 seconds. He has won.',
        loseText: 'The church bell tolls nine. The Reform Club doors swing shut. The wager is lost by seconds.',
        init(api) {
          this.timer = 32; this.dist = 0; this.need = 960;
          this.beats = []; this.spawnT = 0.9; this.spawnInterval = 0.9; this.beatCount = 0;
          this.combo = 0; this.bestCombo = 0; this.speed = 108;
          this.laneL = 16; this.laneR = api.W - 16; this.laneY = 34; this.hitX = 44;
          this.flashTap = 0;
        },
        update(api, dt) {
          const W = api.W;
          this.timer -= dt;
          this.flashTap = Math.max(0, this.flashTap - dt * 3);
          // the gallop quickens as the clock runs down toward nine
          const urgency = clamp((32 - this.timer) / 32, 0, 1);
          this.speed = 108 + urgency * 70;
          this.spawnInterval = Math.max(0.46, 0.9 - urgency * 0.42);

          // a rhythm of correct taps carries the carriage; idling barely moves it
          this.dist += (10 + Math.min(this.combo, 10) * 3) * dt;
          api.score = Math.floor(this.dist / 4) + this.bestCombo * 2;

          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = this.spawnInterval;
            this.beatCount++;
            const isRed = this.beatCount > 2 && api.chance(0.26);
            this.beats.push({ x: this.laneR, kind: isRed ? 'red' : 'gold', judged: false });
          }
          for (const b of this.beats) b.x -= this.speed * dt;

          if (api.confirm()) {
            this.flashTap = 1;
            let target = null, bestD = 1e9;
            for (const b of this.beats) {
              if (b.judged) continue;
              const d = Math.abs(b.x - this.hitX);
              if (d < 15 && d < bestD) { target = b; bestD = d; }
            }
            if (target) {
              target.judged = true;
              if (target.kind === 'gold') {
                this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo);
                this.dist += 44 + Math.min(this.combo, 12) * 3;
                api.audio.sfx('coin'); api.burst(this.hitX, api.H - 70, '#d4a017', 10); api.flash('#d4a017', 0.08);
              } else {
                this.combo = 0; this.timer -= 2;
                api.audio.sfx('hurt'); api.shake(5, 0.22); api.flash('#c8102e', 0.16);
                api.burst(this.hitX, api.H - 70, '#c8102e', 10);
              }
            } else {
              this.combo = 0; api.audio.sfx('blip');
            }
          }
          // beats that slide past the reins unjudged: a red one dodged safely,
          // a gold one simply missed (no bonus, streak broken)
          for (const b of this.beats) {
            if (!b.judged && b.x < this.hitX - 15) {
              b.judged = true;
              if (b.kind === 'red') this.dist += 10;
              else this.combo = 0;
            }
          }
          this.beats = this.beats.filter((b) => !b.judged);

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
          // Carriage gallops in place, bobbing harder on a hot streak
          const bobScale = 1 + Math.min(this.combo, 10) * 0.35;
          const cx = W / 2, py = H - 70 + Math.sin(api.t * 9) * bobScale;
          g.rect(cx - 22, py - 14, 44, 28, '#3a2408');
          g.rect(cx - 20, py - 12, 40, 24, '#4a3010');
          g.rect(cx - 10, py - 10, 20, 16, '#c8902a');
          g.circle(cx - 14, py + 14, 7, '#1a1206'); g.circle(cx + 14, py + 14, 7, '#1a1206');
          // Big Ben — visible ahead, grows as progress increases
          const bbProgress = this.dist / this.need;
          const bbx = Math.floor(W - 18 - bbProgress * 58);
          if (bbx > 0 && bbx < W) {
            c.fillStyle = '#0a0806'; c.fillRect(bbx - 14, H - 192, 28, 102);
            for (let bx = bbx - 14; bx < bbx + 14; bx += 7) c.fillRect(bx, H - 194, 4, 5);
            c.fillRect(bbx - 5, H - 202, 10, 10); c.fillRect(bbx - 2, H - 208, 4, 7);
            g.circle(bbx, H - 168, 12, '#c8a020'); g.circle(bbx, H - 168, 10, '#f0e8a0');
          }
          // Reins rhythm lane — tap on the gold beat, hold off the red
          const laneY = this.laneY;
          g.rect(this.laneL, laneY, this.laneR - this.laneL, 20, 'rgba(10,7,3,.7)');
          c.strokeStyle = '#4a3818'; c.lineWidth = 1; c.strokeRect(this.laneL, laneY, this.laneR - this.laneL, 20);
          const tapGlow = this.flashTap;
          c.fillStyle = 'rgba(212,160,23,' + (0.22 + tapGlow * 0.4) + ')';
          c.fillRect(this.hitX - 15, laneY, 30, 20);
          c.strokeStyle = '#d4a017'; c.lineWidth = 2; c.strokeRect(this.hitX - 15, laneY, 30, 20);
          for (const b of this.beats) {
            if (b.kind === 'gold') { g.circle(b.x, laneY + 10, 7, '#d4a017'); g.circle(b.x, laneY + 10, 3, '#f6e8b0'); }
            else {
              g.rect(b.x - 6, laneY + 2, 12, 16, '#7a1a1a');
              api.txtC('!', b.x, laneY + 3, 7, '#f0d0d0', true);
            }
          }
          api.txtC('REINS', this.hitX, laneY - 9, 6, '#a07840', true);
          if (this.combo > 2) api.txtC('COMBO ' + this.combo, W - 40, laneY - 9, 6, '#d4a017', true);
          // Timer bar
          const tr = clamp(this.timer / 32, 0, 1);
          g.rect(8, H - 12, W - 16, 5, '#1a1208');
          g.rect(8, H - 12, Math.floor((W - 16) * tr), 5, tr < 0.25 ? '#c8102e' : '#d4a017');
          api.topBar('RACE TO THE REFORM CLUB');
          api.txt('CLUB ' + Math.floor(clamp(this.dist / this.need, 0, 1) * 100) + '%', 6, 20, 9, '#d4a017');
          api.txt(Math.ceil(this.timer) + 's', W - 36, 20, 9, this.timer < 8 ? '#c8102e' : '#d4a017');
          api.vignette();
        },
      },
    ],
  });
})();
