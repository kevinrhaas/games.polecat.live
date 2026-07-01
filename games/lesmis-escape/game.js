/* ============================================================================
 * LES MISÉRABLES — 24601
 * Five acts of Victor Hugo's 1862 novel, each a distinct mini-game:
 *   1. THE GALLEYS       — timing meter, row the oar in Toulon prison
 *   2. THE STOLEN LOAF   — stealth collect, grab bread while avoiding guards
 *   3. COSETTE'S TASK    — falling catch, fill the bucket, dodge the bully throws
 *   4. THE BARRICADES    — defend, tap soldiers before they breach the line
 *   5. THROUGH THE SEWERS — steer, carry Marius through the winding underground
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  // Location labels for the five map cards
  const LOCS = ['TOULON', 'FAVEROLLES', 'MONTFERMEIL', 'PARIS', 'LES ÉGOUTS'];

  // Journey path centers connecting the five locations
  const ROUTE = [[62, 110], [212, 96], [205, 218], [67, 258], [137, 388]];

  // Broken chain emblem — the prisoner unbound
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // candlestick left
    g.rect(cx - 22, cy + 6, 6, 14, '#c8a030');
    g.rect(cx - 26, cy + 18, 14, 3, '#c8a030');
    c.globalAlpha = 0.8; g.circle(cx - 19, cy + 2, 4, '#f0c040');
    c.globalAlpha = 0.4; g.circle(cx - 19, cy - 1, 2, '#fffbe0');
    c.globalAlpha = 1;
    // candlestick right
    g.rect(cx + 16, cy + 6, 6, 14, '#c8a030');
    g.rect(cx + 12, cy + 18, 14, 3, '#c8a030');
    c.globalAlpha = 0.8; g.circle(cx + 19, cy + 2, 4, '#f0c040');
    c.globalAlpha = 0.4; g.circle(cx + 19, cy - 1, 2, '#fffbe0');
    c.globalAlpha = 1;
    // chain links across the bottom
    for (let i = 0; i < 5; i++) {
      const lx = cx - 20 + i * 10;
      g.rectO(lx, cy + 28, 8, 6, i === 2 ? '#cc2233' : '#888890', i === 2 ? 2 : 1);
    }
    // broken center link (gap)
    g.rect(cx - 2, cy + 29, 4, 4, '#0a0812');
    g.rect(cx - 1, cy + 28, 2, 6, '#cc2233');
  }

  // Dark Paris night backdrop — cobblestones, Haussmann silhouettes, gas lamps
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Night sky
    const sky = c.createLinearGradient(0, 0, 0, H * 0.62);
    sky.addColorStop(0, '#04030a'); sky.addColorStop(0.7, '#0a0814'); sky.addColorStop(1, '#0e0c1c');
    c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.62);

    // Stars
    for (let i = 0; i < 48; i++) {
      const sx = (i * 67 + 11) % W, sy = (i * 41 + 9) % Math.floor(H * 0.48);
      c.globalAlpha = 0.18 + 0.28 * Math.sin(t * 1.6 + i * 0.9);
      g.rect(sx, sy, 1, 1, '#d8d0e8'); c.globalAlpha = 1;
    }

    // Building silhouettes
    const bldgs = [[0,215,48,130],[42,232,34,113],[70,195,58,145],[122,212,44,128],[160,200,52,140],[206,218,52,122],[252,225,20,105]];
    for (const [bx, by, bw, bh] of bldgs) {
      c.fillStyle = '#0c0b18'; c.fillRect(bx, by, bw, bh);
      // lit windows
      for (let wy = by + 10; wy < by + bh - 14; wy += 18) {
        for (let wx = bx + 5; wx < bx + bw - 8; wx += 14) {
          if (Math.sin(wx * 11 + wy * 7 + t * 0.25) > 0.25) g.rect(wx, wy, 5, 7, '#c87820');
        }
      }
      // chimney + smoke
      g.rect(bx + bw - 10, by - 12, 5, 14, '#0c0b18');
      c.globalAlpha = 0.1 + 0.06 * Math.sin(t * 1.8 + bx * 0.1);
      g.circle(bx + bw - 8, by - 16 + Math.sin(t + bx * 0.08) * 4, 5, '#887766');
      c.globalAlpha = 1;
    }

    // Cobblestone street
    g.rect(0, H - 52, W, 52, '#18162a');
    for (let y = H - 48; y < H; y += 10) {
      const off = Math.floor((y - (H - 48)) / 10) % 2 === 0 ? 0 : 8;
      for (let x = off; x < W; x += 16) g.rect(x + 1, y + 1, 14, 8, '#1e1c2e');
    }

    // Gas lamp posts
    for (const lx of [38, 135, 232]) {
      g.rect(lx - 1, H - 116, 2, 64, '#4a3828');
      g.rect(lx - 6, H - 120, 12, 6, '#4a3828');
      c.globalAlpha = 0.16 + 0.07 * Math.sin(t * 2.1 + lx);
      g.circle(lx, H - 124, 22, '#c87820');
      c.globalAlpha = 0.55 + 0.1 * Math.sin(t * 2.1 + lx);
      g.circle(lx, H - 124, 5, '#f0c040');
      c.globalAlpha = 1;
    }

    if (scene === 'menu') {
      // Parchment-tinted map overlay
      c.fillStyle = 'rgba(10,8,18,.72)'; c.fillRect(0, 0, W, H);
      c.globalAlpha = 0.08; c.fillStyle = '#c8a860';
      for (let y = 0; y < H; y += 6) c.fillRect(0, y, W, 2);
      c.globalAlpha = 1;
      // Dotted journey route
      c.setLineDash([4, 5]); c.strokeStyle = 'rgba(204,34,51,.45)'; c.lineWidth = 1.5;
      c.beginPath();
      ROUTE.forEach(([rx, ry], i) => i === 0 ? c.moveTo(rx, ry) : c.lineTo(rx, ry));
      c.stroke(); c.setLineDash([]);
      // Compass rose
      const crx = W - 24, cry = H - 34;
      c.strokeStyle = '#5a4020'; c.lineWidth = 1;
      for (let a = 0; a < 8; a++) {
        const ang = a / 8 * Math.PI * 2, len = a % 2 === 0 ? 12 : 7;
        c.beginPath(); c.moveTo(crx, cry); c.lineTo(crx + Math.cos(ang) * len, cry + Math.sin(ang) * len); c.stroke();
      }
      g.circle(crx, cry, 3, '#5a4020'); api.txtC('N', crx, cry - 18, 6, '#5a4020');
    } else if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(6,5,14,.74)'; c.fillRect(0, 0, W, H);
    }
  }

  RetroSaga.create({
    id: 'lesmis',
    title: 'LES MISÉRABLES',
    subtitle: '24601 · AN EPIC IN FIVE ACTS',
    currency: 'LIBERTÉ',
    accent: '#cc2233',
    credit: 'AFTER VICTOR HUGO · 1862',
    emblem,
    scenery,
    bootCta: 'TAP TO TAKE THE STAGE',
    bootLine: 'FIVE ACTS · ONE RECKONING',
    menuLabel: 'THE ROAD TO REDEMPTION',
    menuHint: 'CHOOSE AN ACT',
    menuDone: 'THE PRISONER IS FREE',
    finale: ['VALJEAN IS REDEEMED.', 'MARIUS LIVES.', 'COSETTE IS FREE.', '', 'LET JUSTICE', 'RING OUT.'],

    screens: {
      win: '#cc2233', lose: '#3a3056',
      chapterLabel: '#7070a0', name: '#f0e8d8',
      sub: '#d4a020', intro: '#c8c0d8', quote: '#7878a0',
      help: '#cc2233', score: '#f0e8d8', cur: '#d4a020',
      cta: '#f0e8d8', overlay: 'rgba(6,5,14,.88)',
    },
    labels: {
      chapter: 'ACT', score: 'LIBERTÉ EARNED',
      win: 'JUSTICE ADVANCES', lose: 'JAVERT CLOSES IN',
      cont: 'TAP TO PRESS ON', finale: 'TAP FOR THE FINALE',
      toMenu: 'TAP TO RETURN', play: 'TAP TO BEGIN',
    },

    palette: { stone: '#3a3460', parchment: '#c0a060', rouge: '#cc2233' },

    menu: {
      colors: { title: '#cc2233', label: '#7070a0', cur: '#f0e8d8' },
      // Scattered map location cards — France/Paris journey
      layout(api) {
        return [
          { x: 12,  y: 78,  w: 100, h: 62 },   // Toulon        center (62,109)
          { x: 158, y: 65,  w: 108, h: 62 },   // Faverolles    center (212,96)
          { x: 150, y: 188, w: 110, h: 60 },   // Montfermeil   center (205,218)
          { x: 10,  y: 228, w: 114, h: 60 },   // Paris         center (67,258)
          { x: 75,  y: 358, w: 122, h: 60 },   // Les Égouts    center (136,388)
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        // parchment card
        c.fillStyle = sel ? '#1a1428' : '#0f0d1c';
        c.fillRect(x, y, w, h);
        // folded top-right corner
        const fc = 11;
        c.fillStyle = sel ? '#cc2233' : '#2a1a38';
        c.beginPath(); c.moveTo(x+w-fc,y); c.lineTo(x+w,y+fc); c.lineTo(x+w-fc,y+fc); c.closePath(); c.fill();
        // border
        c.strokeStyle = sel ? '#cc2233' : '#2a2240';
        c.lineWidth = sel ? 2 : 1; c.strokeRect(x+0.5, y+0.5, w-1, h-1);
        // location name (small, top)
        api.txtCFit(LOCS[i], x+w/2, y+5, 7, done ? '#d4a020' : '#5050a0', false, w-14);
        // divider
        g.rect(x+8, y+19, w-16, 1, sel ? '#3a1a28' : '#1a1830');
        // chapter name
        api.txtCFit(ch.name, x+w/2, y+25, 8, done ? '#cc2233' : '#c8c0d8', false, w-14);
        // sub
        if (ch.sub) api.txtCFit(ch.sub, x+w/2, y+41, 6, done ? '#c09020' : '#404060', false, w-16);
        if (done) api.txtC('★', x+w/2, y+h-14, 10, '#cc2233');
        else if (sel) api.txtC('▶', x+w/2, y+h-14, 9, '#cc2233');
        // scene icon
        const ic = [
          () => { // galleys — oar
            g.rect(x+8, y+h-22, 2, 14, '#8a6840'); g.rect(x+6, y+h-22, 6, 2, '#8a6840');
          },
          () => { // bread — loaf
            g.rect(x+8, y+h-22, 12, 8, '#c88030'); g.rect(x+9, y+h-24, 10, 3, '#c88030');
          },
          () => { // bucket — pail
            g.rect(x+8, y+h-22, 10, 10, '#446688'); g.rect(x+6, y+h-22, 14, 2, '#668ab0');
          },
          () => { // barricade — crossed rifles
            g.rect(x+6, y+h-22, 2, 10, '#5a4028'); g.rect(x+12, y+h-22, 2, 10, '#5a4028');
            g.rect(x+6, y+h-24, 8, 2, '#5a4028');
          },
          () => { // sewer — arch
            c.strokeStyle = '#446688'; c.lineWidth = 2;
            c.beginPath(); c.arc(x+12, y+h-12, 8, Math.PI, 0); c.stroke();
          },
        ];
        ic[i] && ic[i]();
      },
    },

    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ====================== ACT I: THE GALLEYS ======================= */
      {
        id: 'galleys', name: 'THE GALLEYS', sub: 'TOULON, 1796',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x-1, y-6, 2, 12, '#8a6840');
          g.rect(x-4, y-6, 8, 2, '#8a6840');
        },
        intro: ['JEAN VALJEAN, #24601,', 'SERVES NINETEEN YEARS', 'AT HARD LABOR IN', 'the Toulon prison galleys.'],
        quote: 'He who opens a school door, closes a prison.',
        help: 'TAP when the oar lines up with the green zone',
        winText: 'His sentence served. Valjean walks free into a world that hates him.',
        loseText: 'His grip gives out. The guards haul him back to the bench.',
        init(api) {
          this.m = 0; this.dir = 1; this.spd = 0.78; this.band = 0.22;
          this.strokes = 0; this.need = 12; this.bad = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.m += this.dir * this.spd * 0.03 * f;
          if (this.m > 1) { this.m = 1; this.dir = -1; }
          if (this.m < 0) { this.m = 0; this.dir = 1; }
          if (api.confirm()) {
            if (Math.abs(this.m - 0.5) < this.band) {
              this.strokes++; api.score += 20;
              api.audio.sfx('coin'); api.burst(api.W / 2, api.H - 44, '#d4a020', 6);
              this.spd = Math.min(1.85, this.spd + 0.09);
              this.band = Math.max(0.10, this.band - 0.009);
              if (this.strokes >= this.need) { api.score += 60; api.win(); }
            } else {
              this.bad++; api.shake(5, 0.22); api.audio.sfx('hurt');
              if (this.bad >= 4) api.lose();
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a0812');
          // galley hull planks
          for (let y = 0; y < H - 60; y += 14) {
            for (let x = 0; x < W; x += 26) {
              g.rect(x + (Math.floor(y/14)%2 ? 13:0), y, 24, 12, '#1c1628');
            }
          }
          // water at bottom
          g.rect(0, H - 60, W, 60, '#0c1830');
          for (let i = 0; i < 8; i++) {
            const wx = (i * 37 + api.t * 22) % (W + 30) - 15;
            g.rect(wx, H - 48 + Math.sin(api.t * 2 + i) * 4, 28, 3, '#1a2e50');
          }
          // oar shaft
          const oy = H - 120, oh = 80;
          g.rect(W/2 - 2, oy, 4, oh, '#8a6840');
          g.rect(W/2 - 8, oy + oh - 10, 16, 6, '#6a5028');
          // marker bar
          const mx = 24, mw = W - 48, my = H - 38;
          g.rect(mx, my, mw, 14, '#1a1230');
          g.rect(mx + mw*(0.5 - this.band), my, mw * this.band * 2, 14, 'rgba(50,200,80,.32)');
          g.rect(mx + mw*0.5 - 2, my - 3, 4, 20, '#3acc50');
          g.rect(mx + mw*this.m - 3, my - 4, 6, 22, '#d4a020');
          api.topBar('THE GALLEYS');
          api.txt('STROKES ' + this.strokes + '/' + this.need, 6, 20, 9, '#d4a020');
          api.txt('SLIP ' + this.bad + '/4', W - 82, 20, 9, this.bad > 2 ? '#cc2233' : '#7070a0');
          api.vignette(); api.scanlines();
        },
      },

      /* =================== ACT II: THE STOLEN LOAF ===================== */
      {
        id: 'bread', name: 'THE STOLEN LOAF', sub: 'FAVEROLLES, 1815',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x-6, y-3, 12, 6, '#c88030'); g.rect(x-4, y-6, 8, 4, '#c88030');
        },
        intro: ['RELEASED WITH A YELLOW', 'PASSPORT, VALJEAN IS', 'TURNED AWAY AT EVERY INN.', 'His nephew starves.'],
        quote: 'He who has a full stomach does not know what it is to be hungry.',
        help: 'DRAG to move · grab bread · stay away from the guards',
        winText: 'Six loaves saved. A family fed. But the law will not forget.',
        loseText: 'The gendarmes have him. Nineteen years forgotten in an instant.',
        init(api) {
          this.x = api.W / 2;
          this.taken = 0; this.need = 6;
          this.lives = 3; this.hitCd = 0;
          // Two guards with patrol paths
          this.guards = [
            { x: 60,  y: api.H - 120, dir: 1, spd: 48 },
            { x: 200, y: api.H - 168, dir: -1, spd: 56 },
          ];
          this.loaf = this.spawnLoaf(api);
          this.timer = 32;
        },
        spawnLoaf(api) {
          return { x: 30 + Math.floor(Math.random() * (api.W - 60)), y: api.H - 200 + Math.floor(Math.random() * 80) };
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt; api.score = this.taken * 16 + Math.max(0, Math.floor(this.timer));
          // Move Valjean via pointer
          if (api.pointer.down) this.x = clamp(api.pointer.x, 12, api.W - 12);
          // Move guards
          for (const g of this.guards) {
            g.x += g.dir * g.spd * dt;
            if (g.x < 20 || g.x > api.W - 20) g.dir *= -1;
          }
          // Collect loaf
          const l = this.loaf;
          if (l && Math.hypot(this.x - l.x, (api.H - 88) - l.y) < 18) {
            this.taken++; api.score += 16; api.audio.sfx('coin');
            api.burst(l.x, l.y, '#d4a020', 8);
            if (this.taken >= this.need) { api.score += 60; api.win(); return; }
            this.loaf = this.spawnLoaf(api);
          }
          // Guard collision
          this.hitCd -= dt;
          if (this.hitCd <= 0) {
            for (const g of this.guards) {
              if (Math.hypot(this.x - g.x, (api.H - 88) - g.y) < 32) {
                this.lives--; api.shake(6, 0.3); api.flash('#cc2233', 0.2); api.audio.sfx('hurt');
                this.hitCd = 1.2;
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a0812');
          // Street
          g.rect(0, 0, W, H - 52, '#10101e');
          g.rect(0, H - 52, W, 52, '#18162a');
          for (let y = H-48; y < H; y+=10) {
            const off = Math.floor((y-(H-48))/10)%2===0?0:8;
            for (let x=off; x<W; x+=16) g.rect(x+1,y+1,14,8,'#1e1c2e');
          }
          // Bakery window on right
          g.rect(W - 60, H - 280, 54, 80, '#1a1830');
          g.rectO(W - 60, H - 280, 54, 80, '#3a2c18', 1);
          g.rect(W - 58, H - 278, 50, 20, '#cc8833');
          c.globalAlpha = 0.4; g.rect(W-56, H-276, 46, 16, '#f0c070'); c.globalAlpha = 1;
          // Bread in window
          g.rect(W - 52, H - 254, 10, 6, '#c88030');
          g.rect(W - 38, H - 256, 14, 8, '#c88030');
          // Current loaf target
          const l = this.loaf;
          if (l) {
            g.rect(l.x - 8, l.y - 5, 16, 10, '#c88030');
            g.rect(l.x - 6, l.y - 8, 12, 5, '#c88030');
            // glow
            c.globalAlpha = 0.25 + 0.1 * Math.sin(api.t * 4);
            g.circle(l.x, l.y, 16, '#d4a020'); c.globalAlpha = 1;
          }
          // Guards (blue-coated gendarmes)
          for (const guard of this.guards) {
            // lantern glow
            c.globalAlpha = 0.14; g.circle(guard.x, guard.y, 36, '#f0c040'); c.globalAlpha = 1;
            g.sprite(['.bb.','.bb.','bbbb','.cc.','c..c'], guard.x - 8, guard.y - 18, { b: '#1a3090', c: '#2a2040' }, 4);
            g.rect(guard.x + 6, guard.y - 4, 3, 10, '#8a6030'); // rifle
            g.circle(guard.x + 7, guard.y - 8, 3, '#c8a030'); // lantern
          }
          // Valjean
          const vy = H - 88;
          g.sprite(['.bb.','.bb.','bbbb','.cc.','c..c'], this.x - 8, vy - 18,
            { b: '#5a4838', c: '#3a3048' }, 4);
          // Lives
          for (let i = 0; i < 3; i++) g.rect(6 + i * 14, H - 14, 10, 8, i < this.lives ? '#cc2233' : '#2a2240');
          api.topBar('THE STOLEN LOAF');
          api.txt('BREAD ' + this.taken + '/' + this.need, 6, 20, 9, '#d4a020');
          g.rect(6, H-16, (W-12)*(1-clamp(this.timer/32,0,1)), 5, '#cc2233');
          api.vignette(); api.scanlines();
        },
      },

      /* =================== ACT III: COSETTE'S TASK ===================== */
      {
        id: 'cosette', name: "COSETTE'S TASK", sub: 'MONTFERMEIL, 1823',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x-5, y-5, 10, 10, '#446688'); g.rect(x-7, y-5, 14, 2, '#668ab0');
        },
        intro: ['LITTLE COSETTE SERVES', 'THE THÉNARDIERS LIKE', 'A HOUSEHOLD SLAVE.', 'Fetch water or be beaten.'],
        quote: 'To love another person is to see the face of God.',
        help: 'DRAG to move Cosette · catch water drops · avoid the rocks',
        winText: 'The bucket is full. Somewhere in the dark, Jean Valjean watches.',
        loseText: 'The Thénardiers take the bucket and push Cosette back out.',
        init(api) {
          this.x = api.W / 2;
          this.drops = []; this.spawnT = 0;
          this.caught = 0; this.need = 16;
          this.lives = 3; this.hitCd = 0;
          this.timer = 26;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt; api.score = this.caught * 6 + Math.max(0, Math.floor(this.timer));
          if (api.pointer.down) this.x = clamp(api.pointer.x, 14, api.W - 14);
          // Spawn drops + rocks
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = 0.55 - Math.min(0.3, (26 - this.timer) * 0.01);
            const kind = Math.random() < 0.28 ? 'rock' : 'drop';
            this.drops.push({ x: 20 + Math.random() * (api.W - 40), y: -12, vy: 100 + Math.random() * 50, kind });
          }
          // Move drops
          for (const d of this.drops) d.y += d.vy * dt;
          // Check collisions at Cosette level (H - 80)
          const cosY = api.H - 80;
          this.hitCd -= dt;
          this.drops = this.drops.filter((d) => {
            if (d.y > cosY + 20) return false; // off-screen
            if (d.y > cosY - 16 && d.y < cosY + 14) {
              if (Math.abs(d.x - this.x) < 22) {
                if (d.kind === 'drop') {
                  this.caught++; api.audio.sfx('coin'); api.burst(d.x, d.y, '#4488cc', 6);
                  if (this.caught >= this.need) { api.score += 60; api.win(); return false; }
                } else if (this.hitCd <= 0) {
                  this.lives--; api.shake(5, 0.25); api.flash('#cc2233', 0.18); api.audio.sfx('hurt');
                  this.hitCd = 0.9;
                  if (this.lives <= 0) { api.lose(); return false; }
                }
                return false;
              }
            }
            return true;
          });
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a0a0f');
          // Dark forest path
          g.rect(0, 0, W, H - 52, '#0c0e12');
          // Trees on sides
          for (let ty = 40; ty < H - 60; ty += 48) {
            g.rect(0, ty, 12, 36, '#0c1208'); g.rect(4, ty - 16, 6, 20, '#0c1208');
            g.rect(W-12, ty, 12, 36, '#0c1208'); g.rect(W-10, ty-16, 6, 20, '#0c1208');
          }
          // Muddy ground
          g.rect(0, H - 52, W, 52, '#14120e');
          for (let y = H-48; y < H; y+=10) {
            const off = Math.floor((y-(H-48))/10)%2===0?0:8;
            for (let x=off; x<W; x+=16) g.rect(x+1,y+1,14,8,'#181410');
          }
          // Well on right
          g.rect(W - 52, H - 220, 38, 42, '#2a2420');
          g.rect(W - 56, H - 222, 46, 4, '#3a3028');
          g.rect(W - 50, H - 246, 4, 26, '#3a3028');
          g.rect(W - 20, H - 246, 4, 26, '#3a3028');
          g.rect(W - 52, H - 248, 40, 5, '#3a3028');
          // Drops and rocks
          for (const d of this.drops) {
            if (d.kind === 'drop') {
              g.circle(d.x, d.y, 5, '#4488cc');
              c.globalAlpha = 0.4; g.circle(d.x - 2, d.y - 2, 2, '#88ccff'); c.globalAlpha = 1;
            } else {
              g.circle(d.x, d.y, 6, '#6a5a48');
              g.circle(d.x + 2, d.y - 2, 2, '#7a6a58');
            }
          }
          // Cosette (small figure)
          const cy = H - 80;
          g.sprite(['.gg.', 'grrg', '.cc.', 'c..c'], this.x - 8, cy - 18, { g: '#806040', r: '#c06060', c: '#404048' }, 4);
          // Bucket
          g.rect(this.x - 5, cy + 2, 10, 8, '#446688');
          g.rect(this.x - 7, cy + 2, 14, 2, '#668ab0');
          // Bucket fill
          const fill = Math.min(1, this.caught / this.need);
          g.rect(this.x - 4, cy + 3 + 6*(1-fill), 8, 6*fill, '#4488cc');
          // Lives (stars)
          for (let i=0;i<3;i++) g.rect(6+i*14, H-14, 10, 8, i<this.lives?'#cc2233':'#2a1a28');
          api.topBar("COSETTE'S TASK");
          api.txt('DROPS ' + this.caught + '/' + this.need, 6, 20, 9, '#4488cc');
          g.rect(6, H-16, (W-12)*(1-clamp(this.timer/26,0,1)), 5, '#cc2233');
          api.vignette(); api.scanlines();
        },
      },

      /* =================== ACT IV: THE BARRICADES ====================== */
      {
        id: 'barricades', name: 'THE BARRICADES', sub: 'PARIS, JUNE 1832',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x-7, y-2, 14, 2, '#5a4028');
          g.rect(x-5, y-6, 2, 8, '#5a4028'); g.rect(x+3, y-6, 2, 8, '#5a4028');
        },
        intro: ['THE STUDENTS AND WORKERS', 'RAISE THE BARRICADES.', 'ENJOLRAS LEADS THE FIGHT.', 'Hold the line or fall.'],
        quote: 'The future belongs to those who plant trees they will never see shade.',
        help: 'TAP soldiers to push them back before they breach the barricade',
        winText: 'The barricade holds through the night. Courage becomes legend.',
        loseText: 'The line breaks. The National Guard pours through.',
        init(api) {
          this.soldiers = []; this.spawnT = 1.6;
          this.stopped = 0; this.breached = 0;
          this.timer = 28;
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer -= dt;
          api.score = this.stopped * 8 + Math.max(0, Math.floor(this.timer * 3));
          // Spawn soldiers from left and right
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.7, 1.6 - (28 - this.timer) * 0.03);
            const fromRight = Math.random() < 0.5;
            this.soldiers.push({
              x: fromRight ? W + 16 : -16,
              y: H - 148 - Math.random() * 60,
              dir: fromRight ? -1 : 1,
              spd: 36 + (28 - this.timer) * 1.2,
              hp: 1,
            });
            api.audio.sfx('blip');
          }
          // Advance soldiers
          const barricadeX_left = 50, barricadeX_right = W - 50;
          for (const s of this.soldiers) {
            s.x += s.dir * s.spd * dt;
          }
          // Tap to hit
          if (api.pointer.justDown) {
            for (const s of this.soldiers) {
              if (Math.hypot(api.pointer.x - s.x, api.pointer.y - s.y) < 24) {
                s.hp = 0; this.stopped++;
                api.score += 8; api.burst(s.x, s.y, '#cc2233', 8); api.audio.sfx('power');
                break;
              }
            }
          }
          // Check breach
          for (const s of this.soldiers) {
            if ((s.dir === 1 && s.x > barricadeX_right) || (s.dir === -1 && s.x < barricadeX_left)) {
              s.hp = 0; this.breached++;
              api.shake(7, 0.35); api.flash('#cc2233', 0.25); api.audio.sfx('hurt');
            }
          }
          this.soldiers = this.soldiers.filter((s) => s.hp > 0);
          if (this.breached >= 3) { api.lose(); return; }
          if (this.timer <= 0) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#0a0a0e');
          // Night sky
          g.rect(0, 0, W, H/2, '#08081a');
          // Smoke and fire glow
          for (let i = 0; i < 6; i++) {
            const fx = 40 + i * 36, fy = H/2 + 10 + Math.sin(api.t*1.3+i)*8;
            c.globalAlpha = 0.08 + 0.05 * Math.sin(api.t * 2.1 + i);
            g.circle(fx, fy, 18, '#cc5520'); c.globalAlpha = 1;
          }
          // Street / cobbles
          g.rect(0, H - 52, W, 52, '#18162a');
          for (let y=H-48; y<H; y+=10) {
            const off=Math.floor((y-(H-48))/10)%2===0?0:8;
            for (let x=off; x<W; x+=16) g.rect(x+1,y+1,14,8,'#1e1c2e');
          }
          // Barricade (center)
          const bx = 48, bw = W - 96;
          g.rect(bx, H - 150, bw, 100, '#3a2c1a');
          // Barricade furniture detail
          for (let i = 0; i < 5; i++) g.rect(bx + 4 + i*22, H-148, 18, 12, '#2a2010');
          g.rect(bx, H - 148, bw, 3, '#4a3c28');
          // Tricolor flag
          g.rect(W/2 - 3, H - 210, 2, 60, '#8a6840');
          g.rect(W/2 - 1, H - 210, 12, 20, '#1a2880');
          g.rect(W/2 - 1, H - 190, 12, 20, '#e8e8e8');
          g.rect(W/2 - 1, H - 170, 12, 20, '#cc2233');
          // Soldiers
          for (const s of this.soldiers) {
            // danger ring
            c.globalAlpha = 0.25; g.circle(s.x, s.y, 20, '#cc2233'); c.globalAlpha = 1;
            g.sprite(['.bb.','.bb.','bbbb','.cc.','c..c'], s.x-8, s.y-20,
              { b: '#1a3090', c: '#2a2040' }, 4);
            g.rect(s.x + (s.dir>0?6:-9), s.y-6, 3, 12, '#8a6030');
          }
          // HUD
          api.topBar('THE BARRICADES');
          api.txt('STOPPED ' + this.stopped, 6, 20, 9, '#d4a020');
          for (let i=0;i<3;i++) g.rect(W-54+i*16, 4, 12, 10, i<(3-this.breached)?'#cc2233':'#2a2240');
          g.rect(6, H-16, (W-12)*Math.max(0, this.timer/28), 5, '#cc2233');
          api.vignette(); api.scanlines();
        },
      },

      /* =================== ACT V: THROUGH THE SEWERS =================== */
      {
        id: 'sewers', name: 'THROUGH THE SEWERS', sub: 'PARIS, JUNE 1832',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.strokeStyle = '#446688'; c.lineWidth = 2;
          c.beginPath(); c.arc(x, y+4, 8, Math.PI, 0); c.stroke();
          g.rect(x-8, y+4, 16, 6, '#0a0a0e');
        },
        intro: ['WITH MARIUS DYING ON', 'HIS BACK, VALJEAN', 'PLUNGES INTO THE SEWERS', 'as Javert waits above.'],
        quote: 'Jean Valjean, convict, transported, was in the sewer of Paris.',
        help: 'DRAG left and right to steer through the sewer tunnel',
        winText: 'Dawn. The river Seine. Marius breathes. Even Javert is silent.',
        loseText: 'The tunnels close in. Valjean cannot find the way out.',
        init(api) {
          this.x = api.W / 2;
          this.dist = 0;
          this.crashes = 0; this.cooldown = 0;
          this.survived = 0;
        },
        update(api, dt) {
          this.survived += dt;
          this.dist += (50 + this.survived * 1.8) * dt;
          api.score = Math.floor(this.survived * 6);
          // Steer via pointer
          if (api.pointer.down) this.x = clamp(api.pointer.x, 0, api.W);
          // Arrow key steering
          if (api.keyDown('left')) this.x = clamp(this.x - 90*dt, 0, api.W);
          if (api.keyDown('right')) this.x = clamp(this.x + 90*dt, 0, api.W);
          // Tunnel walls (parametric — winding with distance)
          const phase = this.dist / 200;
          const amp = Math.min(62, this.dist / 90);
          const tunnelCenter = api.W / 2 + amp * Math.sin(phase);
          const gap = Math.max(58, 92 - this.survived * 1.3);
          const left = clamp(tunnelCenter - gap / 2, 12, api.W - 12 - gap);
          const right = left + gap;
          // Collision check (with cooldown)
          this.cooldown -= dt;
          if (this.cooldown <= 0) {
            if (this.x < left + 8 || this.x > right - 8) {
              this.crashes++; api.shake(6, 0.3); api.flash('#cc2233', 0.2); api.audio.sfx('hurt');
              this.cooldown = 1.1;
              if (this.crashes >= 3) { api.lose(); return; }
            }
          }
          if (this.survived >= 26) { api.score += 100; api.win(); }
          // Store for draw
          this._tc = tunnelCenter; this._gap = gap; this._left = left; this._right = right;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#05050a');
          // Draw scrolling tunnel walls using parametric samples
          const tc = this._tc || W/2, gap = this._gap || 90;
          for (let row = 0; row < H; row += 4) {
            const rowDist = this.dist - (H - row) * 0.6;
            const rowPhase = rowDist / 200;
            const rowAmp = Math.min(62, rowDist / 90);
            const rowCenter = W/2 + rowAmp * Math.sin(rowPhase);
            const rowGap = Math.max(58, 92 - this.survived * 1.3);
            const rowLeft = clamp(rowCenter - rowGap/2, 12, W-12-rowGap);
            const rowRight = rowLeft + rowGap;
            // Left wall
            c.fillStyle = row % 16 < 8 ? '#1a1830' : '#161428';
            c.fillRect(0, row, rowLeft, 4);
            // Right wall
            c.fillRect(rowRight, row, W - rowRight, 4);
            // Sewer water trickle at center bottom
            if (row > H - 80) {
              c.globalAlpha = 0.25; c.fillStyle = '#1a3050';
              c.fillRect(rowLeft + 2, row, rowGap - 4, 4); c.globalAlpha = 1;
            }
          }
          // Javert's lantern from above (threat indicator)
          c.globalAlpha = 0.3 + 0.1 * Math.sin(api.t * 3);
          const jGrad = c.createRadialGradient(tc, 0, 0, tc, 0, 90);
          jGrad.addColorStop(0, '#cc2233'); jGrad.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = jGrad; c.fillRect(0, 0, W, 90);
          c.globalAlpha = 1;
          // Valjean (carrying Marius)
          const vy = H - 72;
          // Marius on back
          g.sprite(['.mm.', 'mrrm'], this.x - 8, vy - 24, { m: '#3a3048', r: '#b09080' }, 4);
          // Valjean
          g.sprite(['.bb.', '.bb.', 'bbbb', '.cc.', 'c..c'], this.x - 8, vy - 4,
            { b: '#5a4838', c: '#3a3048' }, 4);
          // Wall boundary glows
          g.rect(this._left - 3, 0, 4, H, '#334466');
          g.rect(this._right - 1, 0, 4, H, '#334466');
          // HUD
          api.topBar('THROUGH THE SEWERS');
          api.txt('TIME ' + Math.max(0, 26 - Math.floor(this.survived)).toString().padStart(2,'0'), 6, 20, 9, '#cc2233');
          for (let i=0; i<3; i++) g.rect(W-50+i*16, 4, 12, 10, i<(3-this.crashes)?'#446688':'#2a1a28');
          api.vignette(); api.scanlines();
        },
      },
    ],
  });
})();
