/* ============================================================================
 * KING ARTHUR — THE LEGEND OF CAMELOT
 * Five chapters through the Arthurian legend:
 *   1. THE STONE       — pull Excalibur (wobble-meter tap timing)
 *   2. MERLIN'S TEST   — fly as a hawk, dodge rocks & arrows
 *   3. THE TOURNAMENT  — joust: aim the lance, strike when in range
 *   4. SAXONS RISE     — tap-defend Camelot's three gates
 *   5. THE HOLY GRAIL  — collect grail shards, dodge the dark knights
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Emblem: Excalibur ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // Blade (pointing up)
    g.rect(cx - 2, cy - 36, 4, 32, '#c8d8f8');
    g.rect(cx - 1, cy - 40, 2, 6, '#e8f0ff');
    // Cross-guard (gold)
    g.rect(cx - 16, cy - 7, 32, 5, '#e3c567');
    g.rect(cx - 20, cy - 5, 5, 3, '#e3c567');
    g.rect(cx + 15, cy - 5, 5, 3, '#e3c567');
    // Grip
    g.rect(cx - 2, cy - 2, 4, 14, '#8a6030');
    // Pommel
    g.circle(cx, cy + 16, 5, '#e3c567');
    // Gleam
    g.rect(cx - 1, cy - 36, 1, 28, 'rgba(255,255,255,.4)');
  }

  /* ─── Scenery: rolling hills, Camelot silhouette, misty lake ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Night sky gradient
    const sky = c.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, '#050e1e');
    sky.addColorStop(0.55, '#0e2040');
    sky.addColorStop(1, '#182e50');
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 42; i++) {
      const sx = (i * 73 + 11) % W;
      const sy = (i * 47 + 5) % Math.floor(H * 0.50);
      c.globalAlpha = 0.25 + 0.4 * Math.sin(t * 1.1 + i * 0.8);
      g.rect(sx, sy, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1, '#c8ddf8');
    }
    c.globalAlpha = 1;

    // Crescent moon
    g.circle(W - 48, 44, 18, '#d8c870');
    g.circle(W - 41, 38, 15, '#0e2040');

    // Far hills (very dark)
    c.fillStyle = '#0c1e10';
    c.beginPath();
    c.moveTo(0, H * 0.60);
    for (let x = 0; x <= W; x += 22) c.lineTo(x, H * 0.60 - 10 - ((x * 9 + 5) % 22));
    c.lineTo(W, H);
    c.lineTo(0, H);
    c.closePath();
    c.fill();

    // Camelot silhouette
    const baseY = Math.floor(H * 0.57);
    const towers = [[20, 58], [52, 74], [98, 62], [148, 78], [198, 64], [238, 52]];
    c.fillStyle = '#091624';
    for (const [tx, th] of towers) {
      c.fillRect(tx, baseY - th, 20, th);
      // battlements
      for (let bx = 0; bx < 20; bx += 6) c.fillRect(tx + bx, baseY - th - 6, 4, 6);
      // lit window (warm amber glow)
      g.rect(tx + 5, baseY - th + 16, 10, 12, '#c8902a');
      g.rect(tx + 6, baseY - th + 17, 8, 10, 'rgba(0,0,0,.35)');
    }
    // Castle wall between towers
    c.fillStyle = '#091624';
    c.fillRect(20, baseY - 32, W - 40, 32);
    // Battlements on main wall
    for (let x = 24; x < W - 22; x += 14) c.fillRect(x, baseY - 38, 8, 8);

    // Near rolling hills
    c.fillStyle = '#101e0e';
    c.beginPath();
    c.moveTo(0, H - 72);
    for (let x = 0; x <= W; x += 18) c.lineTo(x, H - 72 - 6 - ((x * 7 + 13) % 18));
    c.lineTo(W, H);
    c.lineTo(0, H);
    c.closePath();
    c.fill();

    // Misty lake
    c.fillStyle = '#081828';
    c.fillRect(0, H - 38, W, 38);
    // Shimmer lines
    c.globalAlpha = 0.10 + 0.06 * Math.sin(t * 1.8);
    for (let i = 0; i < 5; i++) {
      const lx = ((i * 48 + t * 14) % (W + 30)) - 15;
      g.rect(lx, H - 30, 32, 2, '#21e6ff');
    }
    c.globalAlpha = 1;

    // Overlay for story/result/finale
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(4, 10, 20, 0.68)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // a torch-lit stone hall with the Round Table — unlike the night vista
      for (let yy = 0; yy < H; yy += 26) for (let xx = 0; xx < W; xx += 40) { c.fillStyle = ((Math.floor(yy / 26) + Math.floor(xx / 40)) % 2) ? '#231e18' : '#1b1712'; c.fillRect(xx, yy, 39, 25); }
      for (const tx of [22, W - 22]) {
        c.fillStyle = '#3a2a16'; c.fillRect(tx - 2, 74, 4, 26);
        c.globalAlpha = 0.5 + 0.2 * Math.sin(t * 6 + tx); c.fillStyle = '#ff9a30'; c.beginPath(); c.arc(tx, 70, 8, 0, 7); c.fill(); c.globalAlpha = 1;
        c.fillStyle = '#ffd060'; c.beginPath(); c.arc(tx, 71, 3, 0, 7); c.fill();
      }
      const tcx = W / 2, tcy = 296;
      c.fillStyle = '#2e2012'; c.beginPath(); c.arc(tcx, tcy, 122, 0, 7); c.fill();
      c.fillStyle = '#4a3520'; c.beginPath(); c.arc(tcx, tcy, 112, 0, 7); c.fill();
      c.strokeStyle = '#caa15a'; c.lineWidth = 2; c.beginPath(); c.arc(tcx, tcy, 112, 0, 7); c.stroke();
      g.rect(tcx - 1, tcy - 30, 3, 44, '#cfe0ff'); g.rect(tcx - 8, tcy + 12, 17, 3, '#caa15a'); g.rect(tcx - 2, tcy + 14, 5, 9, '#8a6a3a'); // Excalibur
    }
  }

  /* ======================================================================
   * SAGA
   * ====================================================================== */
  RetroSaga.create({
    id: 'arthur',
    title: 'King Arthur',
    subtitle: 'THE LEGEND OF CAMELOT',
    currency: 'HONOUR',
    // framed-screen palette + wording (royal blue, heraldic gold)
    screens: { win: '#ffd966', lose: '#7a8898', chapterLabel: '#9fb4e8', name: '#ffe9a8',
      sub: '#21e6ff', intro: '#d6e2ff', quote: '#8fa0c8', help: '#ffd966',
      score: '#d6e2ff', cur: '#ffd966', cta: '#ffe9a8', overlay: 'rgba(8,12,30,.85)' },
    labels: { chapter: 'CHAPTER', score: 'DEEDS DONE', win: 'HONOUR EARNED',
      lose: 'THE QUEST FALTERS', cont: 'TAP TO RIDE ON', finale: 'TAP FOR THE LAST BATTLE',
      toMenu: 'TAP TO RETURN', play: 'TAP TO BEGIN' },
    accent: '#e3c567',
    credit: 'A PIXEL TRIBUTE · ARTHURIAN LEGEND',
    emblem,
    scenery,
    bootCta: 'TAP TO BEGIN',
    bootLine: '5 CHAPTERS · ONE LEGEND',
    menuLabel: 'CHRONICLES OF CAMELOT',
    menuHint: 'CHOOSE YOUR QUEST',
    menuDone: 'THE ONCE AND FUTURE KING',
    menu: {
      // chapters are SHIELDS seated around the Round Table (radial layout)
      title(api, honour) {
        api.txtC('KING ARTHUR', api.W / 2, 22, 15, '#ffd966', true);
        api.txtC('THE ROUND TABLE', api.W / 2, 48, 9, '#8a9ad0');
        api.txtC('HONOUR  ' + honour, api.W / 2, 64, 9, '#cfe0ff');
      },
      layout(api) {
        const cx = api.W / 2, cy = 296, R = 94, out = [];
        for (let i = 0; i < 5; i++) { const a = (-90 + i * 72) * Math.PI / 180; out.push({ x: cx + Math.cos(a) * R - 26, y: cy + Math.sin(a) * R - 26, w: 52, h: 56 }); }
        return out;
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx, { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2, cy = y + 24;
        c.fillStyle = sel ? '#2a3a7a' : '#16244e';
        c.beginPath(); c.moveTo(cx - 22, cy - 22); c.lineTo(cx + 22, cy - 22); c.lineTo(cx + 22, cy + 6);
        c.quadraticCurveTo(cx + 22, cy + 26, cx, cy + 30); c.quadraticCurveTo(cx - 22, cy + 26, cx - 22, cy + 6); c.closePath(); c.fill();
        c.strokeStyle = (done || sel) ? '#ffd966' : '#5a6aa8'; c.lineWidth = sel ? 2 : 1; c.stroke();
        if (ch.icon) ch.icon(api, cx, cy - 2);
        api.txtC('' + (i + 1), cx, cy + 11, 8, '#cfe0ff', true);
        const tw = ch.name.length * 5 + 6;
        g.rect(cx - tw / 2, cy + 34, tw, 12, 'rgba(8,10,24,.88)');
        api.txtC(ch.name, cx, cy + 36, 7, done ? '#ffd966' : '#cfe0ff');
      },
    },
    finale: ['EXCALIBUR GLEAMS.', 'CAMELOT STANDS.', 'THE GRAIL IS FOUND.', '', 'THE LEGEND LIVES ON.'],
    tagline: 'A POLECAT ARCADE TRIBUTE',
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#e3c567', silver: '#c8d8f8', lake: '#21e6ff', stone: '#7a8898', forest: '#2a5a2a' },

    chapters: [

      /* ============================
       * CHAPTER 1 — THE STONE
       * Wobble-meter timing: tap when the wobble centres to pull Excalibur
       * ============================ */
      {
        id: 'stone',
        name: 'THE STONE',
        sub: 'WHOSOEVER PULLS THE SWORD...',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 1, 16, 10, '#5a6470');
          g.rect(x - 8, y - 1, 16, 2, '#7a8898');
          g.rect(x - 1, y - 14, 2, 14, '#c8d8f8');
          g.rect(x - 5, y - 5, 10, 3, '#e3c567');
        },
        intro: [
          'BEFORE THE GREAT CATHEDRAL',
          'A SWORD STANDS IN STONE.',
          '"WHO DRAWS IT SHALL BE',
          'RIGHTWISE KING."',
          'Many have tried. None',
          'have succeeded. Yet.',
        ],
        quote: 'Whoso pulleth out this sword of this stone is rightwise born king of all England.',
        help: 'TAP when the indicator is in the green zone',
        winText: 'The sword slides free with a ring of steel. England has its king.',
        loseText: 'The stone holds fast. A king must earn his right.',
        init(api) {
          this.pulls = 0;
          this.need = 6;
          this.angle = 0;
          this.aspd = 0.9;
          this.adir = 1;
          this.band = 0.17;
          this.miss = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.angle += this.adir * this.aspd * 0.035 * f;
          if (this.angle > 1) { this.angle = 1; this.adir = -1; }
          if (this.angle < -1) { this.angle = -1; this.adir = 1; }

          if (api.confirm()) {
            if (Math.abs(this.angle) < this.band) {
              this.pulls++;
              api.score += 28;
              api.audio.sfx('coin');
              api.burst(api.W / 2, Math.floor(api.H * 0.40), '#e3c567', 8);
              this.aspd = Math.min(2.4, this.aspd + 0.14);
              this.band = Math.max(0.07, this.band - 0.013);
              if (this.pulls >= this.need) { api.score += 80; api.win(); }
            } else {
              this.miss++;
              api.shake(5, 0.22);
              api.audio.sfx('hurt');
              if (this.miss >= 4) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, ctx = api.ctx;
          const cx = W / 2;

          // Courtyard stone floor
          api.clear('#181410');
          for (let y = Math.floor(H * 0.52); y < H; y += 14) {
            for (let x = 0; x < W; x += 22) {
              const ox = (Math.floor(y / 14) % 2) ? 11 : 0;
              g.rect(x + ox, y, 20, 12, '#241e18');
              g.rectO(x + ox, y, 20, 12, '#181410', 1);
            }
          }

          // Cathedral arch hint
          ctx.fillStyle = '#0e0c0a';
          ctx.beginPath();
          ctx.arc(cx, Math.floor(H * 0.08), 60, 0, Math.PI);
          ctx.fill();
          g.rect(cx - 60, 0, 120, Math.floor(H * 0.08), '#0e0c0a');

          // Crowd silhouettes
          for (let i = 0; i < 10; i++) {
            const hx = 8 + i * 26;
            const hh = 18 + (i % 3) * 9;
            const hy = Math.floor(H * 0.52);
            g.rect(hx - 5, hy - hh, 10, hh, '#0a0806');
            g.circle(hx, hy - hh - 5, 5, '#0a0806');
          }

          // Stone plinth
          g.rect(cx - 30, Math.floor(H * 0.44), 60, 16, '#5a6470');
          g.rect(cx - 32, Math.floor(H * 0.42), 64, 8, '#7a8898');
          g.rect(cx - 28, Math.floor(H * 0.51), 56, 6, '#4a5460');
          g.rect(cx - 26, Math.floor(H * 0.57), 52, H - Math.floor(H * 0.57), '#3a444e');

          // Sword — rotates with the wobble angle
          const ang = this.angle * 0.16;
          const pivX = cx, pivY = Math.floor(H * 0.42) + 4;
          ctx.save();
          ctx.translate(pivX, pivY);
          ctx.rotate(ang);
          // Blade
          g.rect(-2, -58, 4, 56, '#c8d8f8');
          g.rect(-1, -62, 2, 6, '#e8f0ff');
          // Gleam
          g.rect(-1, -58, 1, 44, 'rgba(255,255,255,.38)');
          // Guard
          g.rect(-14, -4, 28, 5, '#e3c567');
          g.rect(-16, -3, 4, 3, '#c8a040');
          g.rect(12, -3, 4, 3, '#c8a040');
          // Grip
          g.rect(-2, 0, 4, 12, '#8a6030');
          g.circle(0, 14, 4, '#e3c567');
          ctx.restore();

          // Wobble bar
          const bx = 30, bw = W - 60, by = H - 52, bh = 12;
          g.rect(bx, by, bw, bh, '#1a1610');
          const zw = bw * this.band * 2;
          g.rect(bx + bw / 2 - zw / 2, by, zw, bh, 'rgba(93,255,143,.28)');
          g.rect(bx + bw / 2 - 1, by - 4, 2, bh + 8, '#5dff8f');
          const indX = bx + bw * (0.5 + this.angle * 0.5);
          g.rect(indX - 3, by - 5, 6, bh + 10, '#e3c567');

          // Pull pips
          for (let i = 0; i < this.need; i++) {
            g.rect(cx - this.need * 5 + i * 10 + 2, H - 22, 8, 6, i < this.pulls ? '#e3c567' : '#2a2018');
          }

          api.topBar('THE STONE');
          api.txt('PULLS ' + this.pulls + '/' + this.need, 6, 20, 9, '#e3c567');
          api.txt('SLIP ' + this.miss + '/4', W - 78, 20, 9, this.miss > 2 ? '#c8102e' : api.colors.dim);
          api.vignette();
          api.scanlines();
        },
      },

      /* ============================
       * CHAPTER 2 — MERLIN'S TEST
       * Dodge/steer: fly as a hawk, avoid falling rocks & arrows
       * ============================ */
      {
        id: 'merlin',
        name: "MERLIN'S TEST",
        sub: 'THE HAWK OF MAY',
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite(['.ww.', 'wwww', '.ww.'], x - 6, y - 5, { w: '#c8b870' }, 3);
          g.rect(x + 4, y - 4, 3, 2, '#e07820');
        },
        intro: [
          'MERLIN TRANSFORMS YOUNG',
          'ARTHUR INTO A HAWK',
          'TO TEACH HIM THE SKY.',
          'Dodge the rocks and',
          'arrows of the world.',
          'Wisdom comes from flight.',
        ],
        quote: 'The best thing for being sad is to learn something.',
        help: 'DRAG or use arrows to fly · avoid rocks & arrows',
        winText: 'The hawk soars free. Arthur returns to earth wiser.',
        loseText: 'The hawk falters and Merlin calls him back.',
        init(api) {
          this.hx = api.W / 2;
          this.hy = Math.floor(api.H * 0.4);
          this.hits = 0;
          this.maxHits = 3;
          this.timer = 22;
          this.obs = [];
          this.spawn = 0.5;
          this.coins = [];
          this.coinSpawn = 1.4;
          this.iframes = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.iframes = Math.max(0, this.iframes - dt);
          this.spawn -= dt;
          this.coinSpawn -= dt;

          // Move hawk
          if (api.pointer.down) {
            this.hx += (api.pointer.x - this.hx) * 0.22 * f;
            this.hy += (api.pointer.y - this.hy) * 0.22 * f;
          }
          if (api.keyDown('left')) this.hx -= 3 * f;
          if (api.keyDown('right')) this.hx += 3 * f;
          if (api.keyDown('up')) this.hy -= 3 * f;
          if (api.keyDown('down')) this.hy += 3 * f;
          this.hx = clamp(this.hx, 14, api.W - 14);
          this.hy = clamp(this.hy, 28, api.H - 36);

          // Spawn obstacles
          if (this.spawn <= 0) {
            this.spawn = api.rnd(0.55, 1.0);
            const arrow = api.chance(0.38);
            this.obs.push({
              x: api.rnd(14, api.W - 14),
              y: -16,
              vy: arrow ? api.rnd(2.6, 3.6) : api.rnd(1.5, 2.4),
              arrow,
            });
          }

          // Spawn golden feathers (collectibles)
          if (this.coinSpawn <= 0) {
            this.coinSpawn = api.rnd(1.1, 2.0);
            this.coins.push({ x: api.rnd(18, api.W - 18), y: api.rnd(36, api.H * 0.65), life: 3.2 });
          }

          // Move obstacles
          for (const o of this.obs) o.y += o.vy * f;
          this.obs = this.obs.filter(o => o.y < api.H + 24);

          // Tick coins
          for (const coin of this.coins) coin.life -= dt;
          this.coins = this.coins.filter(c => c.life > 0 && !c.taken);

          // Collect coins
          for (const coin of this.coins) {
            if (Math.hypot(coin.x - this.hx, coin.y - this.hy) < 18) {
              coin.taken = true;
              api.score += 15;
              api.audio.sfx('coin');
              api.burst(coin.x, coin.y, '#e3c567', 6);
            }
          }

          // Collision with obstacles
          if (this.iframes <= 0) {
            for (const o of this.obs) {
              const r = o.arrow ? 8 : 11;
              if (Math.hypot(o.x - this.hx, o.y - this.hy) < r + 7) {
                this.hits++;
                o.y = api.H + 100;
                this.iframes = 1.3;
                api.shake(5, 0.25);
                api.flash('#c8102e', 0.15);
                api.audio.sfx('hurt');
                if (this.hits >= this.maxHits) { api.lose(); return; }
              }
            }
          }

          // Score from time survived
          api.score = Math.max(api.score, Math.floor((22 - Math.max(0, this.timer)) * 3));
          if (this.timer <= 0) { api.score += 60; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          // Sky
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#070f22');
          bg.addColorStop(1, '#152440');
          c.fillStyle = bg;
          c.fillRect(0, 0, W, H);

          // Drifting clouds
          for (let i = 0; i < 4; i++) {
            const cx2 = ((i * 78 + api.t * 9) % (W + 60)) - 30;
            const cy2 = 40 + i * 32;
            c.globalAlpha = 0.14;
            g.rect(cx2, cy2, 54, 18, '#c0d4f0');
            g.rect(cx2 + 10, cy2 - 10, 34, 20, '#c0d4f0');
            c.globalAlpha = 1;
          }

          // Land below
          g.rect(0, H - 36, W, 36, '#0e1c0c');
          g.rect(0, H - 42, W, 8, '#162414');

          // Golden feathers (collectibles)
          for (const coin of this.coins) {
            const pulse = 0.6 + 0.4 * Math.sin(api.t * 4 + coin.x);
            c.globalAlpha = pulse;
            g.circle(coin.x, coin.y, 6, '#e3c567');
            g.circle(coin.x, coin.y, 3, '#fff8d0');
            c.globalAlpha = 1;
          }

          // Obstacles
          for (const o of this.obs) {
            if (o.arrow) {
              g.rect(o.x - 1, o.y - 12, 2, 20, '#8a6030');
              g.sprite(['.r.', 'r.r'], o.x - 3, o.y - 16, { r: '#c8102e' }, 2);
            } else {
              g.rect(o.x - 8, o.y - 7, 16, 13, '#5a6070');
              g.rect(o.x - 6, o.y - 9, 12, 5, '#7a8898');
            }
          }

          // Hawk (Arthur transformed) — blink on iframes
          const blink = this.iframes > 0 && Math.floor(api.t * 9) % 2 === 0;
          if (!blink) {
            const flap = Math.sin(api.t * 11) > 0;
            if (flap) {
              g.sprite(['.ww.', 'wwww', '.ww.'], this.hx - 6, this.hy - 6, { w: '#c8b870' }, 3);
            } else {
              g.sprite(['w..w', '.ww.', '.ww.'], this.hx - 6, this.hy - 6, { w: '#c8b870' }, 3);
            }
            g.rect(this.hx + 4, this.hy - 3, 4, 2, '#e07820');
          }

          // Lives
          for (let i = 0; i < this.maxHits; i++) {
            g.rect(W - 18 - i * 15, 20, 11, 7, i < (this.maxHits - this.hits) ? '#5dff8f' : '#2a1414');
          }

          // Timer bar
          g.rect(6, H - 12, W - 12, 6, '#1a1610');
          g.rect(6, H - 12, (W - 12) * clamp(this.timer / 22, 0, 1), 6, '#e3c567');

          api.topBar("MERLIN'S TEST");
          api.txt('WISDOM ' + api.score, 6, 20, 9, '#e3c567');
          api.vignette();
          api.scanlines();
        },
      },

      /* ============================
       * CHAPTER 3 — THE TOURNAMENT
       * Joust: move lance up/down, tap to strike when knight is in range
       * ============================ */
      {
        id: 'tourney',
        name: 'THE TOURNAMENT',
        sub: 'FOR HONOUR AND CAMELOT',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 7, 12, 12, '#1a6090');
          g.rect(x - 4, y + 5, 8, 5, '#1a6090');
          g.rect(x - 2, y + 10, 4, 3, '#1a6090');
          g.rect(x - 1, y - 7, 2, 18, '#e3c567');
          g.rect(x - 6, y - 1, 12, 2, '#e3c567');
        },
        intro: [
          'AT THE GRAND TOURNAMENT',
          'OF CAMELOT, ARTHUR',
          'RIDES FOR THE KINGDOM.',
          'Knights charge from',
          'across the lists.',
          'Strike true or yield.',
        ],
        quote: 'A knight is sworn to valour. His heart knows only virtue.',
        help: 'DRAG UP/DOWN to aim · TAP when the knight is close',
        winText: 'The crowd roars! Arthur takes the field and wins the day.',
        loseText: 'The lance splinters. The young king is unhorsed.',
        init(api) {
          this.wins = 0;
          this.need = 4;
          this.knightX = api.W + 30;
          this.knightSpd = 2.0;
          this.lanceY = Math.floor(api.H * 0.48);
          this.targetY = 170 + api.rint(0, 3) * 44;
          this.miss = 0;
        },
        update(api, dt) {
          const f = dt * 60;

          // Aim lance
          if (api.pointer.down) {
            this.lanceY += (api.pointer.y - this.lanceY) * 0.18 * f;
          }
          if (api.keyDown('up')) this.lanceY -= 3.2 * f;
          if (api.keyDown('down')) this.lanceY += 3.2 * f;
          this.lanceY = clamp(this.lanceY, 100, api.H - 100);

          // Knight charges
          this.knightX -= this.knightSpd * f;

          // Auto-miss if knight rides past
          if (this.knightX < -30) {
            this.miss++;
            api.shake(4, 0.2);
            api.audio.sfx('hurt');
            if (this.miss >= 3) { api.lose(); return; }
            this.knightX = api.W + 30;
            this.targetY = 170 + api.rint(0, 3) * 44;
          }

          // Player strikes when knight is in range
          const inRange = this.knightX < api.W * 0.60 && this.knightX > 20;
          if (api.confirm() && inRange) {
            const diff = Math.abs(this.lanceY - this.targetY);
            if (diff < 30) {
              this.wins++;
              api.score += Math.max(10, Math.round(80 - diff * 1.8));
              api.shake(8, 0.4);
              api.audio.sfx('power');
              api.burst(this.knightX, this.targetY, '#e3c567', 14);
              api.flash('#fffbe0', 0.12);
              if (this.wins >= this.need) { api.score += 100; api.win(); return; }
              this.knightSpd = Math.min(3.8, this.knightSpd + 0.22);
              this.knightX = api.W + 30;
              this.targetY = 170 + api.rint(0, 3) * 44;
            } else {
              this.miss++;
              api.shake(4, 0.2);
              api.audio.sfx('hurt');
              if (this.miss >= 3) { api.lose(); return; }
              this.knightX = api.W + 30;
              this.targetY = 170 + api.rint(0, 3) * 44;
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#100c08');

          // Sky
          const skyG = c.createLinearGradient(0, 0, 0, H * 0.50);
          skyG.addColorStop(0, '#0a1622');
          skyG.addColorStop(1, '#1a2e44');
          c.fillStyle = skyG;
          c.fillRect(0, 0, W, Math.floor(H * 0.50));

          // Banners
          const bannerColors = ['#c8102e', '#21e6ff', '#e3c567', '#5dff8f', '#c8102e'];
          for (let i = 0; i < 5; i++) {
            const bx = i * 58 - 8;
            g.rect(bx, 16, 2, 44, '#5a3010');
            g.rect(bx + 2, 18, 18, 24, bannerColors[i]);
            g.rect(bx + 6, 24, 6, 12, '#e3c567');
          }

          // Tournament ground / lists
          g.rect(0, Math.floor(H * 0.50), W, H - Math.floor(H * 0.50), '#1e1208');
          g.rect(0, Math.floor(H * 0.49), W, 5, '#3a2010');
          // Center divider rail
          g.rect(0, Math.floor(H * 0.49) - 22, W, 5, '#7a5028');

          // Arthur (on left)
          const aBaseY = Math.floor(H * 0.49) - 4;
          g.rect(18, aBaseY - 40, 28, 40, '#1a3060'); // horse body
          g.rect(24, aBaseY - 56, 18, 20, '#1a3060'); // upper torso
          g.circle(33, aBaseY - 60, 9, '#caa07a'); // head
          g.rect(25, aBaseY - 60, 16, 7, '#c8d8f8'); // helmet
          // Lance
          c.save();
          c.translate(50, this.lanceY);
          g.rect(-2, -2, Math.floor(this.knightX * 0.7), 4, '#8a6030');
          // Tip
          g.rect(Math.floor(this.knightX * 0.7) - 2, -4, 6, 8, '#c8d8f8');
          c.restore();

          // Aim indicator (horizontal line showing lance level)
          g.rect(0, this.lanceY, 6, 1, 'rgba(93,255,143,.5)');

          // Enemy knight charging from right
          const kx = Math.round(this.knightX);
          const ky = Math.floor(H * 0.49) - 4;
          if (kx > -30) {
            // Scale slightly as it approaches
            const scale = 0.7 + (W - kx) / W * 0.4;
            const kw = Math.round(28 * scale), kh = Math.round(40 * scale);
            g.rect(kx - kw / 2, ky - kh, kw, kh, '#3a2840'); // horse
            g.rect(kx - kw / 3, ky - kh - Math.round(18 * scale), Math.round(18 * scale), Math.round(18 * scale), '#3a2840'); // body
            g.circle(kx, ky - kh - Math.round(22 * scale), Math.round(7 * scale), '#6a4a50'); // head
            // Shield (the target)
            const shX = kx - kw / 2 - 10;
            const shY = this.targetY - 10;
            const shW = 16, shH = 18;
            g.rect(shX, shY, shW, shH, '#2a1e40');
            g.rectO(shX, shY, shW, shH, '#5a4060', 1);
            g.rect(shX + 4, shY + 4, shW - 8, shH - 8, '#1a3070');
            // Hit indicator (green ring if aimed correctly)
            const inRange = kx < W * 0.60 && kx > 20;
            if (inRange) {
              const diff = Math.abs(this.lanceY - this.targetY);
              const aimed = diff < 30;
              g.rectO(shX - 2, shY - 2, shW + 4, shH + 4, aimed ? '#5dff8f' : '#c8102e', 2);
            }
          }

          // Tilt pips
          for (let i = 0; i < this.need; i++) {
            g.rect(W / 2 - this.need * 6 + i * 12, H - 18, 10, 10, i < this.wins ? '#e3c567' : '#2a1a10');
          }

          api.topBar('THE TOURNAMENT');
          api.txt('TILTS ' + this.wins + '/' + this.need, 6, 20, 9, '#e3c567');
          api.txt('MISS ' + this.miss + '/3', W - 80, 20, 9, this.miss > 1 ? '#c8102e' : api.colors.dim);
          api.vignette();
          api.scanlines();
        },
      },

      /* ============================
       * CHAPTER 4 — SAXONS RISE
       * Tap-defend: three castle gates, Saxons assault them
       * ============================ */
      {
        id: 'saxons',
        name: 'SAXONS RISE',
        sub: 'HOLD THE GATES OF CAMELOT',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 8, 16, 16, '#2e3444');
          for (let bx = -6; bx < 8; bx += 6) g.rect(x + bx, y - 12, 4, 5, '#2e3444');
          g.rect(x - 2, y - 5, 4, 12, '#5a3010');
        },
        intro: [
          'THE SAXONS MASS AT',
          'CAMELOT\'S WALLS.',
          'THREE GATES MUST HOLD.',
          'TAP each gate under',
          'siege to drive the',
          'Saxons back.',
        ],
        quote: 'For it was the sword of a great king, and it must not fall.',
        help: 'TAP each glowing gate to repel the Saxon assault',
        winText: 'Camelot holds. The Saxons scatter into the dark forest.',
        loseText: 'Two gates fall. The Saxons pour through Camelot.',
        init(api) {
          this.timer = 28;
          this.gates = [
            { x: 56, hp: 1.0, active: null },
            { x: 135, hp: 1.0, active: null },
            { x: 214, hp: 1.0, active: null },
          ];
          this.fallen = 0;
          this.repelled = 0;
          this.nextAttack = 1.0;
        },
        update(api, dt) {
          this.timer -= dt;
          this.nextAttack -= dt;
          api.score = this.repelled * 12 + Math.floor(28 - Math.max(0, this.timer));

          // Launch new attack on a free gate
          if (this.nextAttack <= 0) {
            const free = this.gates.filter(gt => !gt.active);
            if (free.length) {
              const gate = api.choice(free);
              const window = Math.max(0.9, 2.2 - (28 - this.timer) * 0.04);
              gate.active = { t: window, max: window };
              gate.hp = 1.0;
              api.audio.sfx('blip');
            }
            this.nextAttack = api.rnd(0.55, 1.1);
          }

          // Drain gates under attack
          for (const gate of this.gates) {
            if (gate.active) {
              gate.active.t -= dt;
              gate.hp = gate.active.t / gate.active.max;
              if (gate.active.t <= 0) {
                this.fallen++;
                gate.active = null;
                gate.hp = 0;
                api.shake(7, 0.3);
                api.flash('#c8102e', 0.18);
                api.audio.sfx('hurt');
                if (this.fallen >= 2) { api.lose(); return; }
              }
            }
          }

          // Tap to repel
          if (api.pointer.justDown) {
            let hit = false;
            for (const gate of this.gates) {
              if (gate.active && Math.abs(api.pointer.x - gate.x) < 36 &&
                  api.pointer.y > 140 && api.pointer.y < 340) {
                gate.active = null;
                gate.hp = 1.0;
                this.repelled++;
                api.score += 12;
                api.burst(gate.x, 230, '#e3c567', 10);
                api.audio.sfx('coin');
                hit = true;
                break;
              }
            }
            if (!hit) api.audio.sfx('blip');
          }

          if (this.timer <= 0) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#0c1018');

          // Dawn sky
          const skyG = c.createLinearGradient(0, 0, 0, H * 0.48);
          skyG.addColorStop(0, '#06100e');
          skyG.addColorStop(1, '#1a2830');
          c.fillStyle = skyG;
          c.fillRect(0, 0, W, Math.floor(H * 0.48));

          // Campfires of the Saxon host (far)
          for (let i = 0; i < 6; i++) {
            const fx = 20 + i * 42;
            const fy = Math.floor(H * 0.45);
            g.rect(fx, fy, 4, 4, '#ff8a20');
            c.globalAlpha = 0.2 + 0.15 * Math.sin(api.t * 3 + i);
            g.circle(fx + 2, fy - 3, 8, '#ff6010');
            c.globalAlpha = 1;
          }

          // Ground
          g.rect(0, Math.floor(H * 0.62), W, H - Math.floor(H * 0.62), '#0e1408');

          // Camelot wall
          g.rect(0, Math.floor(H * 0.38), W, Math.floor(H * 0.24), '#1a2030');
          g.rect(0, Math.floor(H * 0.34), W, 8, '#252e40');
          // Wall battlements
          for (let x = 2; x < W; x += 14) g.rect(x, Math.floor(H * 0.34) - 12, 8, 12, '#252e40');

          // Gates
          const gateY = Math.floor(H * 0.38);
          const gateH = Math.floor(H * 0.24);
          for (const gate of this.gates) {
            const gx = gate.x;
            const active = gate.active;

            // Gate arch
            g.rect(gx - 22, gateY, 44, gateH, '#0e1828');
            // Arch top (semi-circle)
            c.fillStyle = '#0e1828';
            c.beginPath();
            c.arc(gx, gateY, 22, Math.PI, 0);
            c.fill();
            // Gate border
            g.rectO(gx - 22, gateY, 44, gateH, active ? '#c8102e' : '#2a3a50', 2);

            if (active) {
              // Saxon warrior in the gate
              const prog = 1 - gate.active.t / gate.active.max;
              const sy2 = gateY + gateH * 0.15 + prog * gateH * 0.3;
              const sy2i = Math.round(sy2);
              g.rect(gx - 7, sy2i - 18, 14, 20, '#5a3a28');
              g.circle(gx, sy2i - 22, 7, '#8a5a40');
              g.rect(gx - 7, sy2i - 25, 14, 6, '#4a2e2a');
              g.rect(gx + 4, sy2i - 16, 9, 14, '#2e2840');

              // HP ring arc
              const pAng = gate.hp * Math.PI * 2;
              c.strokeStyle = gate.hp > 0.5 ? '#e3c567' : '#c8102e';
              c.lineWidth = 3;
              c.beginPath();
              c.arc(gx, gateY + gateH / 2, 28, -Math.PI / 2, -Math.PI / 2 + pAng);
              c.stroke();
            }

            // TAP glyph
            if (active && Math.floor(api.t * 2) % 2 === 0) {
              api.txtC('TAP', gx, gateY + gateH + 8, 9, '#e3c567');
            }
          }

          // Fallen gate markers
          for (let i = 0; i < 2; i++) {
            g.rect(W / 2 - 14 + i * 22, H - 20, 12, 10, i < this.fallen ? '#c8102e' : '#1e2430');
          }

          // Timer bar
          g.rect(6, H - 10, W - 12, 5, '#1a1818');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 28, 0, 1), 5, '#e3c567');

          api.topBar('SAXONS RISE');
          api.txt('REPELLED ' + this.repelled, 6, 20, 9, '#e3c567');
          api.txt('FALLEN ' + this.fallen + '/2', W - 90, 20, 9, this.fallen > 0 ? '#c8102e' : api.colors.dim);
          api.vignette();
          api.scanlines();
        },
      },

      /* ============================
       * CHAPTER 5 — THE HOLY GRAIL
       * Collect/dodge: gather 8 shards, avoid patrolling dark knights
       * ============================ */
      {
        id: 'grail',
        name: 'THE HOLY GRAIL',
        sub: 'THE SACRED QUEST',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 10, 12, 10, '#e3c567');
          g.rect(x - 2, y, 4, 4, '#e3c567');
          g.rect(x - 7, y + 4, 14, 3, '#e3c567');
          g.rect(x - 4, y - 8, 8, 6, '#21e6ff');
        },
        intro: [
          'THE GREATEST QUEST.',
          'IN THE SACRED CHAPEL',
          'THE HOLY GRAIL AWAITS.',
          'Seek the eight shards',
          'of divine light.',
          'Shun the dark.',
        ],
        quote: 'The quest for the Grail is the quest for the divine in man.',
        help: 'DRAG Arthur to collect shards · avoid the dark knights',
        winText: 'The Grail blazes with light. Camelot\'s glory is eternal.',
        loseText: 'The dark knight bars the path. The quest is not yet done.',
        init(api) {
          this.ax = api.W / 2;
          this.ay = Math.floor(api.H * 0.62);
          // 8 shards scattered in two rows
          const positions = [
            [45, 110], [100, 96], [170, 108], [225, 100],
            [36, 260], [94, 278], [176, 262], [230, 270],
          ];
          this.shards = positions.map(([x, y]) => ({
            x: x + api.rnd(-10, 10),
            y: y + api.rnd(-10, 10),
            taken: false,
          }));
          // Two dark knights on elliptical patrol paths
          this.knights = [
            { angle: 0, spd: 0.65, cx: api.W / 2, cy: 185, rx: 82, ry: 48 },
            { angle: Math.PI * 0.8, spd: 0.48, cx: api.W / 2, cy: 335, rx: 78, ry: 46 },
          ];
          this.lives = 3;
          this.iframes = 0;
          this.collected = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.iframes = Math.max(0, this.iframes - dt);

          // Move Arthur
          if (api.pointer.down) {
            this.ax += (api.pointer.x - this.ax) * 0.20 * f;
            this.ay += (api.pointer.y - this.ay) * 0.20 * f;
          }
          if (api.keyDown('left')) this.ax -= 2.8 * f;
          if (api.keyDown('right')) this.ax += 2.8 * f;
          if (api.keyDown('up')) this.ay -= 2.8 * f;
          if (api.keyDown('down')) this.ay += 2.8 * f;
          this.ax = clamp(this.ax, 14, api.W - 14);
          this.ay = clamp(this.ay, 30, api.H - 26);

          // Move dark knights along ellipses
          for (const kn of this.knights) {
            kn.angle += kn.spd * dt;
            kn.x = kn.cx + Math.cos(kn.angle) * kn.rx;
            kn.y = kn.cy + Math.sin(kn.angle) * kn.ry;
          }

          // Collect shards
          for (const s of this.shards) {
            if (!s.taken && Math.hypot(s.x - this.ax, s.y - this.ay) < 20) {
              s.taken = true;
              this.collected++;
              api.score += 20;
              api.audio.sfx('coin');
              api.burst(s.x, s.y, '#21e6ff', 10);
              if (this.collected >= 8) { api.score += 100; api.win(); return; }
            }
          }

          // Collision with dark knights
          if (this.iframes <= 0) {
            for (const kn of this.knights) {
              if (Math.hypot(kn.x - this.ax, kn.y - this.ay) < 22) {
                this.lives--;
                this.iframes = 1.5;
                api.shake(6, 0.28);
                api.flash('#4a0078', 0.16);
                api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          // Sacred chapel interior
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#08061a');
          bg.addColorStop(1, '#10081e');
          c.fillStyle = bg;
          c.fillRect(0, 0, W, H);

          // Mystical light shafts from the top
          for (let i = 0; i < 5; i++) {
            const lx = W * 0.12 + i * W * 0.19;
            c.globalAlpha = 0.05 + 0.03 * Math.sin(api.t * 0.9 + i * 1.2);
            c.fillStyle = '#b080ff';
            c.beginPath();
            c.moveTo(lx - 8, 0);
            c.lineTo(lx + 8, 0);
            c.lineTo(lx + 36, H);
            c.lineTo(lx - 36, H);
            c.closePath();
            c.fill();
            c.globalAlpha = 1;
          }

          // Stone pillars
          for (let px = 20; px <= W - 20; px += 58) {
            g.rect(px - 6, 14, 12, H - 14, '#161028');
            g.rect(px - 9, 14, 18, 8, '#201838');
          }

          // Floor glow
          g.rect(0, H - 24, W, 24, '#100a20');
          c.globalAlpha = 0.18;
          g.rect(0, H - 24, W, 4, '#8050ff');
          c.globalAlpha = 1;

          // Grail shards
          for (const s of this.shards) {
            if (s.taken) continue;
            const pulse = 0.55 + 0.45 * Math.sin(api.t * 3.2 + s.x * 0.05);
            c.globalAlpha = 0.55 + 0.45 * pulse;
            g.circle(s.x, s.y, 8, '#21e6ff');
            g.circle(s.x, s.y, 4, '#c0f0ff');
            c.globalAlpha = 0.2 * pulse;
            g.circle(s.x, s.y, 18, '#21e6ff');
            c.globalAlpha = 1;
          }

          // Dark knights
          for (const kn of this.knights) {
            const kx = Math.round(kn.x), ky = Math.round(kn.y);
            g.rect(kx - 8, ky - 22, 16, 24, '#1e1230');
            g.circle(kx, ky - 26, 7, '#120c22');
            g.rect(kx - 8, ky - 28, 16, 6, '#2a1840');
            g.rect(kx + 6, ky - 20, 10, 14, '#181028');
            // Dark aura
            c.globalAlpha = 0.15;
            g.circle(kx, ky - 12, 20, '#9010c0');
            c.globalAlpha = 1;
          }

          // Arthur — blink when invincible
          const blink = this.iframes > 0 && Math.floor(api.t * 9) % 2 === 0;
          if (!blink) {
            const ax = Math.round(this.ax), ay = Math.round(this.ay);
            g.rect(ax - 6, ay - 22, 12, 24, '#21e6ff');
            g.circle(ax, ay - 26, 7, '#caa07a');
            g.rect(ax - 6, ay - 28, 12, 6, '#c8d8f8');
            g.rect(ax - 1, ay - 16, 2, 10, '#e3c567');
            // Golden aura from Excalibur
            c.globalAlpha = 0.14;
            g.circle(ax, ay - 12, 18, '#e3c567');
            c.globalAlpha = 1;
          }

          // Lives
          for (let i = 0; i < 3; i++) {
            g.circle(W - 14 - i * 18, 22, 5, i < this.lives ? '#5dff8f' : '#1e1028');
          }

          // Shard progress bar
          g.rect(6, H - 12, W - 12, 6, '#100a18');
          g.rect(6, H - 12, (W - 12) * (this.collected / 8), 6, '#21e6ff');

          api.topBar('THE HOLY GRAIL');
          api.txt('SHARDS ' + this.collected + '/8', 6, 20, 9, '#21e6ff');
          api.vignette();
          api.scanlines();
        },
      },

    ],
  });
})();
