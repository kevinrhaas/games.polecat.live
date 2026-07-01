/* ============================================================================
 * MOBY DICK — THE WHITE WHALE
 * Five chapters through Melville's 1851 novel:
 *   1. SIGN THE ARTICLES — dodge the Nantucket docks, collect pay
 *   2. FIRST LOWERING    — harpoon the surfacing sperm whale
 *   3. THE GREAT SQUID   — survive the tentacle onslaught
 *   4. THE GALE          — trim the sails through the typhoon
 *   5. THE WHITE WHALE   — three days' battle with Moby Dick
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─────────────── shared: whale emblem ─────────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    g.sprite([
      '....wwwwwwwwwwwww.',
      '..wwwwwwwwwwwwwwww',
      '.wwwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwwww',
      '.wwwwwwwwwwwwwwww.',
      '..wwwwwwwwwwwwwww.',
      '....w...........w.',
    ], cx - 54, cy - 22, { w: '#e8f4fc' }, 6);
  }

  /* ─────────────── shared: ocean-night backdrop ─────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Gradient sky
    const sky = c.createLinearGradient(0, 0, 0, H * 0.56);
    sky.addColorStop(0, '#020a1c'); sky.addColorStop(1, '#091b38');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 55; i++) {
      const sx = (i * 71 + 9) % W, sy = (i * 97 + 13) % Math.floor(H * 0.48);
      c.globalAlpha = 0.15 + 0.55 * Math.sin(t * 1.3 + i);
      g.rect(sx, sy, 1, 1, '#d8eef8');
    }
    c.globalAlpha = 1;

    // Crescent moon
    g.circle(W - 50, 46, 20, '#c8d8e8');
    g.circle(W - 43, 40, 17, '#020a1c');

    // Ocean surface
    const waterY = Math.floor(H * 0.54);
    const ocean = c.createLinearGradient(0, waterY, 0, H);
    ocean.addColorStop(0, '#0a2248'); ocean.addColorStop(1, '#040e28');
    c.fillStyle = ocean; c.fillRect(0, waterY, W, H - waterY);
    for (let x = 0; x < W; x += 3) {
      const wh = Math.sin(x * 0.07 + t * 1.4) * 3 + Math.sin(x * 0.13 + t * 0.9) * 1.5;
      g.rect(x, waterY + Math.floor(wh), 2, 2, '#1a4070');
    }

    // Ship silhouette on horizon (non-menu scenes)
    if (scene !== 'menu') {
      const hx = W * 0.3, hy = waterY - 5;
      c.fillStyle = '#040e1e'; c.fillRect(hx - 30, hy - 4, 60, 10);
      g.rect(hx - 2, hy - 34, 4, 30, '#040e1e');
      c.fillStyle = '#07101e';
      c.beginPath(); c.moveTo(hx - 2, hy - 34); c.lineTo(hx - 2, hy - 10); c.lineTo(hx + 22, hy - 20); c.closePath(); c.fill();
    }

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(2,8,22,.76)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // Aged nautical chart overlay
      c.fillStyle = 'rgba(4,12,28,.6)'; c.fillRect(0, 0, W, H);
      // Chart grid
      c.globalAlpha = 0.05; c.strokeStyle = '#c8b880'; c.lineWidth = 1;
      for (let x = 0; x < W; x += 28) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
      for (let y = 0; y < H; y += 28) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.globalAlpha = 1; c.lineWidth = 1;
      // Dotted voyage route through waypoints
      const wpts = [[60, 378], [198, 298], [68, 222], [192, 148], [132, 76]];
      c.setLineDash([4, 6]); c.strokeStyle = '#c8a860'; c.lineWidth = 1.5; c.globalAlpha = 0.45;
      c.beginPath(); c.moveTo(wpts[0][0], wpts[0][1]);
      for (let i = 1; i < wpts.length; i++) c.lineTo(wpts[i][0], wpts[i][1]);
      c.stroke(); c.setLineDash([]); c.lineWidth = 1; c.globalAlpha = 1;
      // Compass rose
      const rx = W - 34, ry = H - 56;
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2 - Math.PI / 2, l = a % 2 === 0 ? 14 : 9;
        c.strokeStyle = a === 0 ? '#d4a020' : '#6a8aaa'; c.lineWidth = a % 2 === 0 ? 1.5 : 1;
        c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + Math.cos(ang) * l, ry + Math.sin(ang) * l); c.stroke();
      }
      c.lineWidth = 1;
      g.circle(rx, ry, 4, '#061228'); g.circle(rx, ry, 3, '#d4a020');
      api.txtC('N', rx, ry - 22, 7, '#d4a020');
    }
  }

  /* ─────────────── saga ─────────────── */
  RetroSaga.create({
    id: 'mobydick',
    title: 'Moby Dick',
    subtitle: 'THE WHITE WHALE',
    currency: 'RESOLVE',
    screens: {
      win: '#4ab8d8', lose: '#c84040', chapterLabel: '#5a8aaa',
      name: '#e8dcc0', sub: '#8ab4cc', intro: '#c0d4e8',
      quote: '#5a8aaa', help: '#4ab8d8', score: '#d4a020',
      cur: '#4ab8d8', cta: '#e8dcc0', overlay: 'rgba(2,8,22,.86)',
    },
    labels: {
      chapter: 'LOG', score: 'LEAGUES SAILED',
      win: 'THE WATERS HOLD', lose: 'THE DEEP CLAIMS YOU',
      cont: 'TAP TO PRESS ON', finale: 'TAP FOR THE RECKONING',
      toMenu: 'RETURN TO CHART', play: 'TAP TO SET SAIL',
    },
    accent: '#d4a020',
    credit: 'AN ORIGINAL 8-BIT TRIBUTE · HERMAN MELVILLE, 1851',
    emblem,
    scenery,
    bootCta: 'TAP TO SET SAIL',
    menuLabel: 'VOYAGE OF THE PEQUOD',
    menuHint: 'CHOOSE A LOG ENTRY',
    menuDone: 'THE WHITE WHALE IS TAKEN',
    menu: {
      colors: { title: '#4ab8d8', label: '#8ab4cc', cur: '#e8dcc0' },
      // Voyage chart: five porthole waypoints scattered on the ocean map
      layout(api) {
        const pts = [[60, 378], [198, 298], [68, 222], [192, 148], [132, 76]];
        return pts.map((p) => ({ x: p[0] - 34, y: p[1] - 32, w: 68, h: 64 }));
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2, cy = y + h / 2;
        // Porthole / compass circle
        c.fillStyle = sel ? '#112040' : '#091830';
        c.strokeStyle = sel ? '#4ab8d8' : '#1e3e64';
        c.lineWidth = sel ? 2.5 : 1.5;
        c.beginPath(); c.arc(cx, cy, w * 0.44, 0, Math.PI * 2); c.fill(); c.stroke();
        c.strokeStyle = sel ? '#205080' : '#102030'; c.lineWidth = 1;
        c.beginPath(); c.arc(cx, cy, w * 0.32, 0, Math.PI * 2); c.stroke();
        c.lineWidth = 1;
        // Chapter number
        api.txtC(String(i + 1), cx, cy - 10, 13, done ? '#4ab8d8' : '#d4a020', true);
        // Last word of chapter name as label
        const tag = ch.name.split(' ').pop();
        api.txtCFit(tag, cx, cy + 5, 6, done ? '#4ab8d8' : '#c8d8e8', false, w - 16);
        if (done) api.txtC('✦', cx, cy + h * 0.37, 8, '#4ab8d8');
      },
    },
    finale: [
      'THE WHITE WHALE SOUNDS.',
      'THE PEQUOD IS GONE.',
      '', '"AND I ONLY AM',
      'ESCAPED ALONE', 'TO TELL THEE."',
      '', '— ISHMAEL ENDURES.',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ══════════════ LOG 1: SIGN THE ARTICLES ══════════════ */
      {
        id: 'docks',
        name: 'SIGN THE ARTICLES',
        sub: 'NANTUCKET, 1841',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 7, 12, 15, '#d8c89a');
          g.rect(x - 4, y - 4, 8, 1, '#8a7040');
          g.rect(x - 4, y - 1, 8, 1, '#8a7040');
          g.rect(x - 4, y + 2, 8, 1, '#8a7040');
          g.rect(x - 6, y - 7, 2, 15, '#c0a870');
          g.rect(x + 4, y - 7, 2, 15, '#c0a870');
        },
        intro: [
          'CALL ME ISHMAEL.', 'HE ARRIVED IN NANTUCKET',
          'AND SIGNED ON WITH THE', 'PEQUOD — bound for',
          'the south seas.',
        ],
        quote: '"Call me Ishmael. Some years ago — never mind how long precisely — having little or no money in my purse, I thought I would sail about a little."',
        help: 'DRAG or arrows to steer ISHMAEL · collect PAY COINS · dodge SAILORS & BARRELS',
        winText: 'Ishmael signs the articles. The Pequod weighs anchor at dawn.',
        loseText: 'The gangplank is raised before Ishmael reaches the ship.',
        init(api) {
          this.px = api.W / 2;
          this.coins = []; this.obs = [];
          this.collected = 0; this.need = 12;
          this.timer = 28; this.scroll = 0;
          this.spawnC = 0; this.spawnO = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt; this.scroll += 72 * dt;
          if (api.pointer.down) this.px += (api.pointer.x - this.px) * 10 * dt;
          if (api.keyDown('left')) this.px -= 2.8 * f;
          if (api.keyDown('right')) this.px += 2.8 * f;
          this.px = clamp(this.px, 16, api.W - 16);

          this.spawnC -= dt;
          if (this.spawnC <= 0) {
            this.spawnC = 0.36 + Math.random() * 0.22;
            this.coins.push({ x: 18 + Math.random() * (api.W - 36), y: -12, vy: 50 + Math.random() * 28 });
          }
          this.spawnO -= dt;
          if (this.spawnO <= 0) {
            this.spawnO = 0.78 + Math.random() * 0.5;
            this.obs.push({ x: 20 + Math.random() * (api.W - 40), y: -26, vy: 44 + Math.random() * 38, k: Math.random() < 0.5 ? 'b' : 's' });
          }
          for (const c of this.coins) c.y += c.vy * dt;
          for (const o of this.obs) o.y += o.vy * dt;

          this.coins = this.coins.filter((c) => {
            if (Math.hypot(c.x - this.px, c.y - (api.H - 80)) < 22) {
              this.collected++; api.score += 8;
              api.burst(c.x, c.y, '#d4a020', 5); api.audio.sfx('coin');
              if (this.collected >= this.need) { api.score += 60; api.win(); }
              return false;
            }
            return c.y < api.H + 10;
          });
          this.obs = this.obs.filter((o) => {
            if (Math.hypot(o.x - this.px, o.y - (api.H - 80)) < 20) {
              api.shake(5, 0.2); api.flash('#c84040', 0.14); api.audio.sfx('hurt');
              this.timer -= 3; return false;
            }
            return o.y < api.H + 10;
          });
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#1c1408');
          const off = Math.floor(this.scroll) % 20;
          for (let y = -off; y < H; y += 20) {
            g.rect(0, y, W, 18, (Math.floor(y / 20) % 2 === 0) ? '#2a1e10' : '#221808');
            g.rect(0, y + 18, W, 2, '#140e06');
          }
          g.rect(0, 0, 10, H, '#3a2814'); g.rect(W - 10, 0, 10, H, '#3a2814');
          g.rect(0, H - 28, W, 4, '#5a4020');

          for (const c of this.coins) {
            g.circle(c.x, c.y, 7, '#c89020'); g.circle(c.x, c.y, 4, '#f0c040');
            api.txtC('$', c.x, c.y - 5, 6, '#7a5000', true);
          }
          for (const o of this.obs) {
            if (o.k === 'b') {
              g.circle(o.x, o.y, 10, '#6a3a18');
              g.rect(o.x - 8, o.y - 2, 16, 2, '#8a5a30');
              g.rect(o.x - 8, o.y + 4, 16, 2, '#8a5a30');
            } else {
              g.circle(o.x, o.y - 12, 7, '#b08060');
              g.rect(o.x - 5, o.y - 5, 10, 14, '#3a5a80');
              g.rect(o.x - 8, o.y - 16, 16, 5, '#2a3a60');
            }
          }
          // Ishmael
          const py = H - 80;
          g.circle(this.px, py - 12, 7, '#c09070');
          g.rect(this.px - 5, py - 5, 10, 14, '#4a3020');
          g.rect(this.px - 7, py - 18, 14, 5, '#5a4030');

          api.topBar('SIGN THE ARTICLES');
          api.txt('PAY ' + this.collected + '/' + this.need, 6, 20, 9, '#d4a020');
          g.rect(6, H - 10, W - 12, 5, '#0a1828');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 28, 0, 1), 5, '#4ab8d8');
        },
      },

      /* ══════════════ LOG 2: FIRST LOWERING ══════════════ */
      {
        id: 'first_lowering',
        name: 'FIRST LOWERING',
        sub: 'THE HUNT BEGINS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 9, y, 14, 2, '#c0a870');
          g.rect(x + 5, y - 3, 5, 4, '#8ab4cc');
          g.rect(x - 9, y - 3, 2, 8, '#8a6828');
        },
        intro: [
          '"A SPOUT! SHE BLOWS!"', 'THE LONGBOAT IS LOWERED.',
          'QUEEQUEG STANDS', 'at the bow — harpoon ready.', 'The whale circles below.',
        ],
        quote: '"There she blows! — there she blows! A hump like a snow-hill! It is Moby Dick!" — Ahab',
        help: 'Wait for the WHALE to surface · TAP to throw the HARPOON · hit it 4 times to win',
        winText: 'A fast fish! Queequeg strikes true. The whale rolls and is taken.',
        loseText: 'The whale sounds into the deep, rope trailing behind her.',
        init(api) {
          this.strikes = 0; this.need = 4;
          this.timer = 40;
          this.phase = 'submerged'; this.phaseT = 0;
          this.wX = api.W / 2; this.wY = api.H + 60; this.wTargX = api.W / 2;
          this.harpX = 0; this.harpY = 0; this.harpA = false;
          this.cooldown = 0;
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer -= dt; this.phaseT += dt;
          if (this.cooldown > 0) this.cooldown -= dt;

          if (this.phase === 'submerged') {
            this.wY = H * 0.7 + Math.sin(this.phaseT * 0.5) * 20;
            if (this.phaseT > 1.6 + Math.random() * 0.8) {
              this.phase = 'rising'; this.phaseT = 0;
              this.wTargX = 38 + Math.random() * (W - 76); this.wY = H + 50;
            }
          } else if (this.phase === 'rising') {
            this.wY -= 210 * dt;
            this.wX += (this.wTargX - this.wX) * 5 * dt;
            if (this.wY <= H * 0.5) {
              this.wY = H * 0.5; this.phase = 'surface'; this.phaseT = 0;
              api.audio.sfx('blip');
            }
          } else if (this.phase === 'surface') {
            this.wX += Math.sin(this.phaseT * 1.6) * 1.4;
            this.wX = clamp(this.wX, 44, W - 44);
            if (this.phaseT > 2.4) { this.phase = 'diving'; this.phaseT = 0; }
          } else if (this.phase === 'diving') {
            this.wY += 190 * dt;
            if (this.wY > H + 50) { this.phase = 'submerged'; this.phaseT = 0; this.wY = H * 0.7; }
          }

          if (this.harpA) {
            this.harpY -= 420 * dt;
            if (this.harpY < -12) { this.harpA = false; }
            else if (this.phase === 'surface' && Math.hypot(this.harpX - this.wX, this.harpY - this.wY) < 34) {
              this.strikes++; api.score += 28;
              api.audio.sfx('power'); api.shake(4, 0.22); api.burst(this.wX, this.wY, '#d4a020', 8);
              this.harpA = false; this.phase = 'diving'; this.phaseT = 0;
              if (this.strikes >= this.need) { api.score += 80; api.win(); return; }
            }
          }

          if (!this.harpA && this.cooldown <= 0 && (api.pointer.justDown || api.confirm())) {
            this.harpX = api.pointer.y < H - 50 ? api.pointer.x : this.wX;
            this.harpY = H - 58; this.harpA = true; this.cooldown = 1.4;
            api.audio.sfx('shoot');
          }

          api.score = this.strikes * 28;
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#040e24');
          // Sky
          g.rect(0, 0, W, Math.floor(H * 0.42), '#030c1e');
          for (let i = 0; i < 18; i++) g.rect((i * 67) % W, (i * 43) % Math.floor(H * 0.38), 1, 1, '#4a6a8a');
          // Ocean surface
          for (let x = 0; x < W; x += 3) {
            const wh = Math.sin(x * 0.08 + api.t * 1.7) * 3;
            g.rect(x, Math.floor(H * 0.42) + Math.floor(wh), 2, 2, '#1e4a7a');
          }
          const od = c.createLinearGradient(0, H * 0.44, 0, H);
          od.addColorStop(0, '#0e2850'); od.addColorStop(1, '#030c1e');
          c.fillStyle = od; c.fillRect(0, Math.floor(H * 0.44), W, H);

          // Whale
          const wpha = this.phase === 'submerged' ? 0.22 :
                       this.phase === 'rising' ? clamp((H - this.wY) / 90, 0, 1) :
                       this.phase === 'surface' ? 1 :
                       clamp(1 - this.phaseT / 0.6, 0, 1);
          c.globalAlpha = wpha;
          g.sprite([
            '...wwwwwwwww..',
            '.wwwwwwwwwwwww',
            'wwwwwwwwwwwwww',
            'wwwwwwwwwwwwww',
            '.wwwwwwwwwwww.',
            '...ww.....ww..',
          ], this.wX - 42, this.wY - 18, { w: '#d8eef8' }, 6);
          if (wpha > 0.5) {
            g.circle(this.wX - 22, this.wY - 4, 4, '#061228');
            g.circle(this.wX - 20, this.wY - 6, 2, '#ffffff');
          }
          c.globalAlpha = 1;
          // Spout
          if (this.phase === 'surface') {
            for (let i = 0; i < 3; i++) {
              const sp = Math.sin(api.t * 9 + i * 1.1) * 9;
              g.rect(this.wX - 4 + i * 4, this.wY - 34 - Math.floor(sp), 3, 18, 'rgba(180,220,240,.65)');
            }
          }

          // Longboat
          g.rect(W / 2 - 38, H - 54, 76, 16, '#6a4420');
          g.rect(W / 2 - 32, H - 68, 64, 16, '#7a5030');
          g.rect(W / 2 - 1, H - 70, 2, 20, '#3a2810');
          for (let i = 0; i < 4; i++) {
            g.circle(W / 2 - 22 + i * 14, H - 62, 4, '#c09070');
            g.rect(W / 2 - 25 + i * 14, H - 58, 6, 10, '#4a5060');
          }
          g.circle(W / 2 + 24, H - 67, 5, '#7a4030');
          g.rect(W / 2 + 28, H - 74, 2, 22, '#8a6828');

          if (this.harpA) {
            g.rect(this.harpX - 1, this.harpY - 14, 2, 14, '#c0a870');
            g.rect(this.harpX - 3, this.harpY - 17, 7, 4, '#8ab4cc');
          }

          api.topBar('FIRST LOWERING');
          api.txt('STRUCK ' + this.strikes + '/' + this.need, 6, 20, 9, '#4ab8d8');
          g.rect(W - 80, 16, 72, 6, '#0a1428');
          g.rect(W - 80, 16, 72 * clamp(this.timer / 40, 0, 1), 6, '#4ab8d8');
          if (this.phase !== 'surface') api.txtC('WAIT FOR THE WHALE...', W / 2, H - 18, 7, '#4a7a9a');
          else api.txtC('HARPOON NOW!', W / 2, H - 18, 8, '#d4a020');
        },
      },

      /* ══════════════ LOG 3: THE GREAT SQUID ══════════════ */
      {
        id: 'squid',
        name: 'THE GREAT SQUID',
        sub: 'FROM THE DEEP',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 4, 6, '#6a2aaf');
          g.rect(x - 5, y + 2, 2, 8, '#7a3abf');
          g.rect(x - 1, y + 2, 2, 10, '#7a3abf');
          g.rect(x + 3, y + 2, 2, 8, '#7a3abf');
        },
        intro: [
          'A VAST WHITENESS', 'ROSE FROM THE DEEP.',
          'THE GREAT SQUID —', 'no harpoon had ever',
          'been thrown at one.',
        ],
        quote: '"A vast pulpy mass, innumerable long arms radiating from its centre, curling and twisting like a nest of anacondas." — Ishmael',
        help: 'DRAG or arrows to dodge the TENTACLES · survive until dawn breaks · 3 lives',
        winText: 'The squid retreats into the abyss. The crew breathes at last.',
        loseText: 'A tentacle sweeps the longboat. Only the oars float free.',
        init(api) {
          this.px = api.W / 2; this.py = api.H * 0.6;
          this.tentacles = [];
          this.spawnT = 0; this.timer = 22; this.hp = 3; this.iCD = 0;
          this.sqY = api.H + 80;
          for (let i = 0; i < 2; i++) this.tentacles.push(this._makeTent(api, 1.0 + i * 0.8));
        },
        _makeTent(api, delay) {
          const left = Math.random() < 0.5;
          return {
            sx: left ? -12 : api.W + 12, sy: api.H * 0.84,
            tx: 28 + Math.random() * (api.W - 56), ty: 72 + Math.random() * (api.H * 0.52),
            prog: 0, spd: 0.2 + Math.random() * 0.14,
            life: 3.6 + Math.random() * 1.4, delay,
            r: 9 + Math.floor(Math.random() * 6),
            cx: 0, cy: 0,
          };
        },
        update(api, dt) {
          this.timer -= dt;
          if (this.iCD > 0) this.iCD -= dt;
          if (this.sqY > api.H * 0.66) this.sqY -= 36 * dt;

          if (api.pointer.down) {
            this.px += (api.pointer.x - this.px) * 9 * dt;
            this.py += (api.pointer.y - this.py) * 9 * dt;
          }
          if (api.keyDown('left')) this.px -= 120 * dt;
          if (api.keyDown('right')) this.px += 120 * dt;
          if (api.keyDown('up')) this.py -= 100 * dt;
          if (api.keyDown('down')) this.py += 100 * dt;
          this.px = clamp(this.px, 16, api.W - 16);
          this.py = clamp(this.py, 50, api.H - 30);

          for (const t of this.tentacles) {
            if (t.delay > 0) { t.delay -= dt; continue; }
            t.life -= dt; t.prog = Math.min(1, t.prog + t.spd * dt);
            const p = t.prog < 0.55 ? t.prog / 0.55 : 1 - (t.prog - 0.55) / 0.45;
            t.cx = t.sx + (t.tx - t.sx) * p; t.cy = t.sy + (t.ty - t.sy) * p;
            if (t.prog > 0.2 && t.prog < 0.72 && this.iCD <= 0) {
              if (Math.hypot(t.cx - this.px, t.cy - this.py) < t.r + 15) {
                this.hp--; this.iCD = 1.2;
                api.shake(6, 0.3); api.flash('#7a2aaf', 0.2); api.audio.sfx('hurt');
                if (this.hp <= 0) { api.lose(); return; }
              }
            }
          }
          this.tentacles = this.tentacles.filter((t) => t.life > 0 || t.delay > 0);
          this.spawnT -= dt;
          if (this.spawnT <= 0) { this.spawnT = 1.0 + Math.random() * 0.5; this.tentacles.push(this._makeTent(api, 0)); }
          api.score = Math.floor(Math.max(0, 22 - this.timer) * 5);
          if (this.timer <= 0) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#020810');
          g.rect(0, 0, W, Math.floor(H * 0.42), '#040e1e');
          for (let i = 0; i < 12; i++) g.rect((i * 71) % W, (i * 43) % Math.floor(H * 0.38), 1, 1, '#3a5a7a');
          for (let x = 0; x < W; x += 3) g.rect(x, Math.floor(H * 0.42) + Math.floor(Math.sin(x * 0.1 + api.t * 2) * 2), 2, 2, '#1a3a6a');
          g.rect(0, Math.floor(H * 0.44), W, H, '#020810');

          // Squid body
          const sqA = clamp((H - this.sqY) / 80, 0, 0.85);
          if (sqA > 0) {
            c.globalAlpha = sqA;
            g.circle(W / 2, this.sqY, 48, '#3a1870'); g.circle(W / 2, this.sqY - 9, 32, '#4a2090');
            g.circle(W / 2 - 14, this.sqY - 8, 9, '#7a40c8'); g.circle(W / 2 + 14, this.sqY - 8, 9, '#7a40c8');
            g.circle(W / 2 - 11, this.sqY - 10, 4, '#060018'); g.circle(W / 2 + 11, this.sqY - 10, 4, '#060018');
            c.globalAlpha = 1;
          }

          // Tentacles
          for (const t of this.tentacles) {
            if (t.delay > 0 || !t.cx) continue;
            c.strokeStyle = '#5a1898'; c.lineWidth = t.r * 1.6; c.globalAlpha = 0.8;
            c.beginPath(); c.moveTo(W / 2, this.sqY);
            c.quadraticCurveTo((t.sx * 0.3 + t.tx * 0.7), (this.sqY * 0.4 + t.ty * 0.6), t.cx, t.cy);
            c.stroke();
            c.globalAlpha = 1; c.lineWidth = 1;
            g.circle(t.cx, t.cy, t.r + 3, '#8030c0'); g.circle(t.cx, t.cy, 4, '#1a0828');
          }
          c.globalAlpha = 1; c.lineWidth = 1;

          // Boat (Ishmael)
          g.rect(this.px - 22, this.py - 6, 44, 12, '#6a3a18');
          g.rect(this.px - 17, this.py - 14, 34, 10, '#7a4a28');
          g.rect(this.px, this.py - 28, 2, 20, '#3a2010');
          for (let i = 0; i < 3; i++) g.circle(this.px - 10 + i * 10, this.py - 16, 3, '#5a3020');

          api.topBar('THE GREAT SQUID');
          api.txt('SURVIVE', 6, 20, 8, '#4ab8d8');
          g.rect(W - 80, 16, 72, 6, '#0a1428');
          g.rect(W - 80, 16, 72 * clamp(this.timer / 22, 0, 1), 6, '#4ab8d8');
          for (let i = 0; i < 3; i++) g.rect(6 + i * 14, H - 12, 10, 5, i < this.hp ? '#5dff8f' : '#1a2a3a');
        },
      },

      /* ══════════════ LOG 4: THE GALE ══════════════ */
      {
        id: 'gale',
        name: 'THE GALE',
        sub: 'TRIM THE SAILS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 1, y - 8, 2, 18, '#8ab4cc');
          g.rect(x + 1, y - 8, 8, 2, '#d8eef8'); g.rect(x + 1, y - 3, 8, 2, '#d8eef8');
          g.rect(x + 1, y + 2, 6, 2, '#d8eef8');
          for (let i = 0; i < 3; i++) g.rect(x - 9 + i * 5, y + 8, 3, 1, '#4a6a8a');
        },
        intro: [
          'A TYPHOON STRUCK.', 'THE SKY TURNED BLACK.',
          'THE SEAS ROSE', 'like mountains.', 'Ahab lashed himself to the mast.',
        ],
        quote: '"I own thy speechless, placeless power; said I not so? Nor was it wrung from me; nor do I now drop these links." — Ahab',
        help: 'TAP when the GAUGE lands in the GREEN ZONE to trim the sail · 8 trims to survive',
        winText: 'The storm breaks at dawn. The Pequod endures, and sails on into silence.',
        loseText: 'The sail is lost. The mast splinters. The Pequod wallows helpless.',
        init(api) {
          this.need = 8; this.done = 0; this.fails = 0; this.maxFail = 3;
          this.m = 0; this.dir = 1; this.spd = 1.1; this.band = 0.2;
          this.windT = 0; this.windAng = 0; this.rage = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.rage = Math.min(1, this.done / this.need);
          this.spd = 1.1 + this.rage * 1.3;
          this.band = Math.max(0.1, 0.2 - this.rage * 0.07);
          this.windT += dt;
          if (this.windT > 1.6 + Math.random()) { this.windAng = Math.random() * Math.PI * 2; this.windT = 0; }
          this.m += this.dir * this.spd * 0.028 * f;
          if (this.m > 1) { this.m = 1; this.dir = -1; }
          if (this.m < 0) { this.m = 0; this.dir = 1; }
          if (api.confirm()) {
            if (Math.abs(this.m - 0.5) < this.band) {
              this.done++; api.score += 22;
              api.burst(api.W / 2, api.H / 2, '#4ab8d8', 6); api.audio.sfx('coin');
              if (this.done >= this.need) { api.score += 70; api.win(); }
            } else {
              this.fails++; api.shake(6, 0.3); api.audio.sfx('hurt');
              if (this.fails >= this.maxFail) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          const storm = Math.floor(18 + this.rage * 28);
          api.clear('rgb(' + storm + ',' + Math.floor(storm * 0.8) + ',28)');

          // Rain
          c.strokeStyle = 'rgba(160,210,230,.22)'; c.lineWidth = 1;
          for (let i = 0; i < 22; i++) {
            const rx = (i * 53 + api.t * 88) % (W + 20) - 10;
            const ry = (i * 97 + api.t * 112) % (H + 30) - 15;
            c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + 5, ry + 13); c.stroke();
          }
          c.lineWidth = 1;

          // Churning sea
          for (let x = 0; x < W; x += 3) {
            const wh = (Math.sin(x * 0.06 + api.t * 3.2) + Math.sin(x * 0.12 + api.t * 2)) * (4 + this.rage * 6);
            g.rect(x, Math.floor(H * 0.58) + Math.floor(wh), 2, 4, '#1a4080');
          }

          // Mast and deck
          g.rect(W / 2 - 30, Math.floor(H * 0.6), W, H, '#3a2010');
          g.rect(W / 2 - 2, Math.floor(H * 0.24), 4, Math.floor(H * 0.36), '#4a3018');

          // Billowing sail
          const bx = Math.sin(this.windAng) * (12 + this.rage * 14);
          c.fillStyle = 'rgba(190,215,235,' + (0.5 - this.rage * 0.2) + ')';
          c.beginPath();
          c.moveTo(W / 2 - 2, H * 0.27);
          c.quadraticCurveTo(W / 2 + bx, H * 0.4, W / 2 - 2, H * 0.56);
          c.quadraticCurveTo(W / 2 - 38 + bx * 0.4, H * 0.43, W / 2 - 2, H * 0.27);
          c.fill();

          // Ahab silhouette lashed to mast
          g.circle(W / 2, Math.floor(H * 0.23), 5, '#3a2818');
          g.rect(W / 2 - 3, Math.floor(H * 0.23) + 4, 6, 13, '#1a2840');
          g.rect(W / 2 - 7, Math.floor(H * 0.26), 14, 2, '#2a4060');

          // Trim gauge
          const gx = 24, gy = H - 46, gw = W - 48;
          g.rect(gx, gy, gw, 14, '#0a1828');
          g.rect(gx + gw * (0.5 - this.band), gy, gw * this.band * 2, 14, 'rgba(93,255,143,.4)');
          g.rect(gx + gw * 0.5 - 1, gy - 3, 2, 20, '#5dff8f');
          g.rect(gx + gw * this.m - 3, gy - 4, 6, 22, '#d4a020');

          api.topBar('THE GALE');
          api.txt('TRIM ' + this.done + '/' + this.need, 6, 20, 9, '#4ab8d8');
          api.txt('FAILS ' + this.fails + '/' + this.maxFail, W - 90, 20, 9, this.fails > 1 ? '#c84040' : '#6a8aaa');
        },
      },

      /* ══════════════ LOG 5: THE WHITE WHALE ══════════════ */
      {
        id: 'white_whale',
        name: 'THE WHITE WHALE',
        sub: "THREE DAYS' CHASE",
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite(['.www.', 'wwwww', 'wwww.', '.ww..'], x - 7, y - 6, { w: '#e8f4fc' }, 3);
        },
        intro: [
          'THREE DAYS THE PEQUOD', 'CHASED THE WHITE WHALE.',
          'ON THE THIRD DAY', 'Moby Dick turned',
          'and made straight for the ship.',
        ],
        quote: '"From hell\'s heart I stab at thee! For hate\'s sake I spit my last breath at thee!" — Captain Ahab',
        help: 'Tap arrows or DRAG to DODGE the whale\'s charge · TAP when it surfaces to HARPOON',
        winText: 'The White Whale sounds for the last time. The sea returns to silence.',
        loseText: 'The Pequod is stove. The vortex closes above Ahab\'s hat.',
        init(api) {
          this.px = api.W / 2;
          this.hp = 3; this.hpCD = 0;
          this.wPhase = 'submerged'; this.wPhaseT = 0;
          this.wx = api.W / 2; this.wy = api.H * 0.68;
          this.wTargX = api.W / 2;
          this.chargeFromLeft = true;
          this.chargeSet = false; this.wVX = 0;
          this.surfaceX = api.W / 2; this.surfaceY = api.H * 0.68;
          this.warnSide = 0; this.warnT = 0;
          this.strikes = 0; this.needStrikes = 5;
          this.harpX = 0; this.harpY = 0; this.harpVX = 0; this.harpVY = 0; this.harpA = false;
          this.cooldown = 0;
          this.days = 1; this.dayT = 0;
          this.splashes = [];
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.dayT += dt; if (this.dayT > 11 && this.days < 3) { this.days++; this.dayT = 0; }
          this.wPhaseT += dt;
          if (this.hpCD > 0) this.hpCD -= dt;
          if (this.cooldown > 0) this.cooldown -= dt;

          // Player — left/right only on the ocean surface
          if (api.pointer.down) this.px += (api.pointer.x - this.px) * 8 * dt;
          if (api.keyDown('left')) this.px -= 130 * dt;
          if (api.keyDown('right')) this.px += 130 * dt;
          this.px = clamp(this.px, 18, W - 18);

          // Harpoon
          if (!this.harpA && this.cooldown <= 0 && (api.confirm() || (api.pointer.justDown && api.pointer.y < H * 0.5))) {
            this.harpX = this.px; this.harpY = H * 0.44;
            const dx = this.wx - this.harpX, dy = this.wy - this.harpY;
            const d = Math.max(1, Math.hypot(dx, dy));
            const sp = 380;
            this.harpVX = dx / d * sp; this.harpVY = dy / d * sp;
            this.harpA = true; this.cooldown = 1.3;
            api.audio.sfx('shoot');
          }
          if (this.harpA) {
            this.harpX += this.harpVX * dt; this.harpY += this.harpVY * dt;
            if (this.harpX < -10 || this.harpX > W + 10 || this.harpY < -10 || this.harpY > H + 10) this.harpA = false;
            if ((this.wPhase === 'surfaced' || this.wPhase === 'rising') &&
                Math.hypot(this.harpX - this.wx, this.harpY - this.wy) < 36) {
              this.strikes++; api.score += 30;
              api.audio.sfx('power'); api.shake(5, 0.3); api.burst(this.wx, this.wy, '#f0f5fa', 10);
              this.harpA = false; this.wPhase = 'retreating'; this.wPhaseT = 0;
              if (this.strikes >= this.needStrikes) { api.score += 100; api.win(); return; }
            }
          }

          // Whale AI
          if (this.wPhase === 'submerged') {
            this.wx = W / 2 + Math.sin(this.wPhaseT * 0.55) * (W * 0.28);
            this.wy = H * 0.66 + Math.sin(this.wPhaseT * 0.4) * 18;
            if (this.wPhaseT > 2.0 + Math.random() * 1.4) {
              if (Math.random() < 0.6) {
                this.wPhase = 'warning'; this.wPhaseT = 0;
                this.chargeFromLeft = Math.random() < 0.5;
                this.warnSide = this.chargeFromLeft ? -1 : 1; this.warnT = 0.95;
              } else {
                this.wPhase = 'rising'; this.wPhaseT = 0;
                this.surfaceX = 36 + Math.random() * (W - 72);
                this.surfaceY = H * 0.66;
              }
            }
          } else if (this.wPhase === 'warning') {
            this.warnT -= dt;
            if (this.warnT <= 0) {
              this.wPhase = 'charging'; this.wPhaseT = 0;
              this.chargeSet = false;
              this.wx = this.chargeFromLeft ? -64 : W + 64;
              this.wy = H * 0.5;
              this.warnSide = 0;
            }
          } else if (this.wPhase === 'charging') {
            if (!this.chargeSet) {
              const sp = 270 + this.strikes * 20 + (this.days - 1) * 30;
              this.wVX = (this.chargeFromLeft ? 1 : -1) * sp;
              this.chargeSet = true;
            }
            this.wx += this.wVX * dt;
            this.wy = H * 0.5;
            // Hit ship
            if (this.hpCD <= 0 && Math.hypot(this.wx - this.px, this.wy - (H * 0.46)) < 30) {
              this.hp--; this.hpCD = 1.4;
              api.shake(8, 0.4); api.flash('#d8eef8', 0.22); api.audio.sfx('hurt');
              for (let i = 0; i < 8; i++) this.splashes.push({ x: this.px, y: H * 0.44, vx: (Math.random() - 0.5) * 80, vy: -18 - Math.random() * 36, life: 1.0 });
              if (this.hp <= 0) { api.lose(); return; }
            }
            if (this.wx < -80 || this.wx > W + 80) {
              this.wPhase = 'submerged'; this.wPhaseT = 0;
              this.wx = W / 2; this.wy = H * 0.66;
              this.chargeSet = false;
            }
          } else if (this.wPhase === 'rising') {
            this.surfaceY -= 130 * dt;
            this.wx = this.surfaceX; this.wy = this.surfaceY;
            if (this.surfaceY <= H * 0.42) {
              this.surfaceY = H * 0.42; this.wy = H * 0.42;
              this.wPhase = 'surfaced'; this.wPhaseT = 0;
              api.audio.sfx('blip');
            }
          } else if (this.wPhase === 'surfaced') {
            this.wx += Math.sin(this.wPhaseT * 1.8) * 1.4;
            this.wx = clamp(this.wx, 40, W - 40); this.wy = H * 0.42;
            if (this.wPhaseT > 2.6) { this.wPhase = 'retreating'; this.wPhaseT = 0; }
          } else if (this.wPhase === 'retreating') {
            this.wy += 150 * dt;
            this.wx = this.surfaceX;
            if (this.wy > H * 0.7) { this.wPhase = 'submerged'; this.wPhaseT = 0; this.wy = H * 0.66; }
          }

          for (const s of this.splashes) { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 60 * dt; s.life -= dt; }
          this.splashes = this.splashes.filter((s) => s.life > 0);
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;

          // Sky gets darker over 3 days
          const r = 3 + this.days * 4, bl = 18 + this.days * 8;
          api.clear('rgb(' + r + ',' + r + ',' + bl + ')');
          // Stars fade on day 3
          if (this.days < 3) {
            c.globalAlpha = (3 - this.days) * 0.4;
            for (let i = 0; i < 22; i++) g.rect((i * 71) % W, (i * 43) % Math.floor(H * 0.38), 1, 1, '#8ab4cc');
            c.globalAlpha = 1;
          }
          // Storm clouds on days 2+
          if (this.days > 1) {
            c.fillStyle = 'rgba(18,18,26,' + (0.35 * (this.days - 1)) + ')';
            c.fillRect(0, 0, W, Math.floor(H * 0.35));
          }

          // Ocean surface
          const waveMult = 1 + (this.days - 1) * 0.8;
          for (let x = 0; x < W; x += 3) {
            const wh = (Math.sin(x * 0.07 + api.t * 2.2) + Math.sin(x * 0.13 + api.t)) * 3 * waveMult;
            g.rect(x, Math.floor(H * 0.46) + Math.floor(wh), 2, 2, '#1e4a7a');
          }
          const od = c.createLinearGradient(0, H * 0.48, 0, H);
          od.addColorStop(0, '#0a2850'); od.addColorStop(1, '#030c1e');
          c.fillStyle = od; c.fillRect(0, Math.floor(H * 0.48), W, H);

          // Submerged whale (ghostly)
          if (this.wPhase === 'submerged' || this.wPhase === 'warning') {
            c.globalAlpha = 0.2 + Math.sin(api.t * 2) * 0.07;
            g.sprite([
              '..wwwwwwwww..',
              '.wwwwwwwwwwww',
              'wwwwwwwwwwwww',
              '.wwwwwwwwwww.',
              '...wwwwwwwww.',
            ], this.wx - 39, this.wy - 15, { w: '#d8eef8' }, 6);
            c.globalAlpha = 1;
          }

          // Charging whale (large + fast, near surface)
          if (this.wPhase === 'charging') {
            const fl = this.chargeFromLeft;
            g.sprite(
              fl ? [
                '....wwwwwwwwwwwww',
                '..wwwwwwwwwwwwwww',
                '.wwwwwwwwwwwwwwww',
                'wwwwwwwwwwwwwwwww',
                '.wwwwwwwwwwwwwww.',
                '...wwwwwwwwwwwww.',
              ] : [
                'wwwwwwwwwwwww....',
                'wwwwwwwwwwwwwww..',
                'wwwwwwwwwwwwwwww.',
                'wwwwwwwwwwwwwwwww',
                '.wwwwwwwwwwwwwww.',
                '.wwwwwwwwwwwww...',
              ],
              this.wx - (fl ? 0 : 51), this.wy - 18,
              { w: '#e8f4fc' }, 3
            );
          }

          // Rising whale
          if (this.wPhase === 'rising') {
            const rA = clamp((H * 0.66 - this.wy) / 70, 0, 1);
            c.globalAlpha = rA;
            g.sprite([
              '...wwwwwwwwwww..',
              '.wwwwwwwwwwwwwww',
              'wwwwwwwwwwwwwwww',
              '.wwwwwwwwwwwwwww',
              '...wwwwwwwwwwwww',
              '....ww.....ww...',
            ], this.wx - 48, this.wy - 18, { w: '#d8eef8' }, 6);
            c.globalAlpha = 1;
          }

          // Surfaced whale (fully visible + spout)
          if (this.wPhase === 'surfaced') {
            g.sprite([
              '...wwwwwwwwwww..',
              '.wwwwwwwwwwwwwww',
              'wwwwwwwwwwwwwwww',
              '.wwwwwwwwwwwwwww',
              '...wwwwwwwwwwwww',
              '....ww.....ww...',
            ], this.wx - 48, this.wy - 18, { w: '#e8f4fc' }, 6);
            g.circle(this.wx - 28, this.wy - 4, 5, '#061228');
            g.circle(this.wx - 26, this.wy - 6, 2, '#ffffff');
            // Harpoon scars
            for (let s = 0; s < this.strikes; s++) g.rect(this.wx - 16 + s * 8, this.wy + 2, 6, 2, '#c84040');
            // Spout
            for (let i = 0; i < 4; i++) {
              const sp = Math.sin(api.t * 9 + i) * 11;
              g.rect(this.wx - 4 + i * 4, this.wy - 40 - Math.floor(sp), 3, 20, 'rgba(210,235,250,.6)');
            }
            api.txtC('HARPOON!', W / 2, Math.floor(H * 0.32), 9, '#d4a020');
          }

          // Retreating
          if (this.wPhase === 'retreating') {
            const ra = Math.max(0, 1 - (this.wy - H * 0.42) / (H * 0.28));
            c.globalAlpha = ra;
            g.sprite([
              '...wwwwwwwwwww..',
              '.wwwwwwwwwwwwwww',
              'wwwwwwwwwwwwwwww',
              '.wwwwwwwwwwwwwww',
              '....ww.....ww...',
            ], this.wx - 48, this.wy - 15, { w: '#d8eef8' }, 6);
            c.globalAlpha = 1;
          }

          // Warning flash
          if (this.warnSide !== 0 && this.warnT > 0) {
            const wx2 = this.warnSide < 0 ? 22 : W - 22;
            c.globalAlpha = 0.45 + 0.35 * Math.sin(api.t * 14);
            g.circle(wx2, Math.floor(H * 0.5), 18, '#c84040');
            c.globalAlpha = 1;
            api.txtC(this.warnSide < 0 ? '◄ BREACH!' : 'BREACH! ►', W / 2, Math.floor(H * 0.38), 8, '#ff4040');
          }

          // Flying harpoon
          if (this.harpA) {
            g.rect(this.harpX - 1, this.harpY - 14, 2, 14, '#c0a870');
            g.rect(this.harpX - 4, this.harpY - 17, 8, 5, '#8ab4cc');
          }

          // Splashes
          for (const s of this.splashes) {
            c.globalAlpha = Math.max(0, s.life);
            g.rect(Math.floor(s.x), Math.floor(s.y), 3, 3, '#6ab4d8');
          }
          c.globalAlpha = 1;

          // The Pequod (player)
          g.rect(this.px - 28, Math.floor(H * 0.46) - 6, 56, 14, '#5a3a18');
          g.rect(this.px - 22, Math.floor(H * 0.46) - 16, 44, 12, '#6a4a28');
          g.rect(this.px - 1, Math.floor(H * 0.46) - 44, 2, 32, '#3a2810');
          c.fillStyle = '#b09070'; c.globalAlpha = 0.7;
          c.beginPath(); c.moveTo(this.px - 1, Math.floor(H * 0.46) - 44); c.lineTo(this.px - 1, Math.floor(H * 0.46) - 18); c.lineTo(this.px + 20, Math.floor(H * 0.46) - 28); c.closePath(); c.fill();
          c.globalAlpha = 1;
          g.circle(this.px - 14, Math.floor(H * 0.46) - 18, 5, '#3a2818');

          api.topBar('THE WHITE WHALE');
          api.txt('STRUCK ' + this.strikes + '/' + this.needStrikes, 6, 20, 9, '#4ab8d8');
          for (let i = 0; i < 3; i++) g.rect(W - 52 + i * 18, 14, 14, 10, i < this.hp ? '#5dff8f' : '#1a2a3a');
          api.txt('DAY ' + this.days, W / 2 - 14, 20, 8, '#8ab4cc');
        },
      },
    ],
  });
})();
