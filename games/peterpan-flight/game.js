/* ============================================================================
 * PETER PAN — SECOND STAR TO THE RIGHT
 * Five tales through J. M. Barrie's Neverland:
 *   1. THINK HAPPY THOUGHTS — hold to rise, dodge London chimneys
 *   2. MERMAID LAGOON        — drag Pan to intercept Hook's pirates
 *   3. TICK-TOCK             — alternate-tap L/R to run from the crocodile
 *   4. THE HIDEOUT           — tap pirates rushing in from every side
 *   5. THE JOLLY ROGER       — dodge Hook's attacks, then counter-strike
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Emblem: Peter's silhouette against the moon ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // moon glow halo
    c.globalAlpha = 0.18;
    c.fillStyle = '#f0e8c0'; c.beginPath(); c.arc(cx, cy - 4, 38, 0, 7); c.fill();
    c.globalAlpha = 1;
    // moon
    c.fillStyle = '#f0e8c0'; c.beginPath(); c.arc(cx, cy - 4, 27, 0, 7); c.fill();
    // crescent shadow
    c.fillStyle = '#060b22'; c.beginPath(); c.arc(cx + 9, cy - 9, 21, 0, 7); c.fill();
    // Peter silhouette (flying figure, facing right)
    g.sprite([
      '....pp',
      '...ppp',
      '..pppp',
      '.ppppp',
      'pppppp',
      '...pp.',
      '...p..',
    ], cx - 16, cy - 12, { p: '#02030e' }, 4);
    // hat feather
    g.rect(cx - 4, cy - 18, 2, 8, '#c8102e');
  }

  /* ─── Scenery ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Starry night sky — the map from London to Neverland
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#010208'); sky.addColorStop(0.6, '#06091e'); sky.addColorStop(1, '#0a102e');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);
      // many stars, some twinkling
      for (let i = 0; i < 72; i++) {
        const sx = (i * 47 + 13) % W, sy = (i * 83 + 5) % (H - 70);
        const alpha = 0.2 + 0.55 * Math.abs(Math.sin(t * 1.8 + i * 0.65));
        c.globalAlpha = alpha;
        c.fillStyle = i % 7 === 0 ? '#ffe14d' : '#d0deff';
        c.fillRect(sx, sy, i % 11 === 0 ? 2 : 1, i % 11 === 0 ? 2 : 1);
      }
      c.globalAlpha = 1;
      // pixie-dust trail connecting chapter star positions
      // ch1(48,390) ch2(214,324) ch3(56,248) ch4(200,172) ch5(118,96)
      c.strokeStyle = '#ffe14d'; c.lineWidth = 1.5; c.setLineDash([3, 6]);
      c.globalAlpha = 0.45;
      c.beginPath();
      c.moveTo(48, 390); c.lineTo(214, 324); c.lineTo(56, 248); c.lineTo(200, 172); c.lineTo(118, 96);
      c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
      // Moon (top-right)
      c.fillStyle = '#f0e8c0'; c.beginPath(); c.arc(W - 32, 40, 22, 0, 7); c.fill();
      c.fillStyle = '#06091e'; c.beginPath(); c.arc(W - 24, 34, 17, 0, 7); c.fill();
      // "Second star to the right" — glowing
      const sg = 0.6 + 0.4 * Math.sin(t * 3.2);
      c.globalAlpha = sg;
      c.fillStyle = '#ffe14d';
      c.fillRect(W - 20, 18, 3, 11); c.fillRect(W - 26, 23, 15, 3);
      c.fillRect(W - 20, 19, 3, 2); c.globalAlpha = 1;
      // London rooftop silhouette at bottom
      c.fillStyle = '#030408';
      c.beginPath(); c.moveTo(0, H);
      const roofs = [[0,44],[18,32],[34,56],[54,24],[72,24],[90,42],[108,28],[126,36],[146,26],[164,40],[182,32],[200,24],[218,34],[238,42],[258,28],[270,H]];
      for (const [rx, ry] of roofs) c.lineTo(rx, H - ry);
      c.closePath(); c.fill();
      // chimneys
      for (let i = 0; i < 9; i++) {
        const chx = 14 + i * 28, chh = 8 + (i * 9) % 14;
        c.fillStyle = '#030408'; c.fillRect(chx, H - 50 - chh, 5, chh); c.fillRect(chx - 1, H - 50 - chh - 3, 7, 3);
      }
      // Lit windows in rooftops
      for (let i = 0; i < 12; i++) { const wx = 8 + (i * 22) % 254, wy = H - 30 - (i * 13) % 20; c.fillStyle = '#e8c060'; c.fillRect(wx, wy, 4, 4); }
      return;
    }

    // Night sky (boot / intro / result / finale)
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#010208'); sky.addColorStop(0.6, '#06091e'); sky.addColorStop(1, '#0a102e');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    // twinkling stars
    for (let i = 0; i < 38; i++) {
      const sx = (i * 67 + 11) % W, sy = (i * 97 + 7) % Math.floor(H * 0.68);
      c.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(t * 1.9 + i * 0.7));
      c.fillStyle = i % 8 === 0 ? '#ffe14d' : '#d0deff';
      c.fillRect(sx, sy, 1, 1);
    }
    c.globalAlpha = 1;
    // moon
    c.fillStyle = '#f0e8c0'; c.beginPath(); c.arc(W - 40, 50, 22, 0, 7); c.fill();
    c.fillStyle = '#06091e'; c.beginPath(); c.arc(W - 33, 44, 17, 0, 7); c.fill();
    // second star (always upper right, bright)
    const sg2 = 0.5 + 0.5 * Math.sin(t * 3.2);
    c.globalAlpha = 0.5 + sg2 * 0.5;
    c.fillStyle = '#ffe14d';
    c.fillRect(W - 18, 16, 2, 9); c.fillRect(W - 22, 19, 10, 2);
    c.globalAlpha = 1;
    // London rooftops (boot screen only)
    if (scene === 'boot') {
      c.fillStyle = '#030408';
      c.beginPath(); c.moveTo(0, H);
      const r2 = [[0,34],[22,24],[38,44],[56,20],[74,20],[92,32],[110,24],[130,28],[150,22],[168,30],[188,26],[206,20],[226,28],[246,32],[268,H]];
      for (const [rx, ry] of r2) c.lineTo(rx, H - ry);
      c.closePath(); c.fill();
    }
    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(1,2,8,.80)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ─── Shared sprite helpers ─── */
  function drawPeter(g, x, y, sc) {
    sc = sc || 3;
    // body (green jacket)
    g.sprite([
      '.gg.',
      'gggg',
      '.bb.',
      '.bb.',
      'b..b',
    ], x - sc * 2, y - sc * 5, { g: '#2ab83a', b: '#1a8028' }, sc);
    // head
    g.rect(x - sc + 1, y - sc * 8, sc * 2, sc * 3, '#f0c080');
    // hat
    g.sprite(['.h.', 'hhh'], x - sc, y - sc * 10 - 1, { h: '#1a6a18' }, sc);
    // feather
    g.rect(x + sc - 2, y - sc * 10 - 4, 2, 6, '#c8102e');
  }

  function drawHook(g, x, y, sc) {
    sc = sc || 3;
    g.sprite([
      '.rr.',
      'rrrr',
      '.bb.',
      '.bb.',
      'b..b',
    ], x - sc * 2, y - sc * 5, { r: '#c8102e', b: '#3a2010' }, sc);
    g.rect(x - sc + 1, y - sc * 8, sc * 2, sc * 3, '#d09060');
    g.sprite(['.r.', 'rrr'], x - sc, y - sc * 10, { r: '#8a1a1a' }, sc);
    // hook (right hand)
    g.rect(x + sc * 2, y - sc * 2, 9, 2, '#e3c567');
    g.rect(x + sc * 2 + 7, y - sc * 4, 2, 4, '#e3c567');
  }

  function drawCroc(g, x, y) {
    g.sprite([
      '.gg.gg',
      'gggggg',
      'gggggg',
      '.gg...',
    ], x - 18, y - 8, { g: '#28a828' }, 5);
    // eyes
    g.rect(x - 14, y - 12, 4, 4, '#ff2a2a');
    g.rect(x - 4, y - 12, 4, 4, '#ff2a2a');
    // teeth
    g.rect(x - 14, y + 2, 2, 5, '#f0f0f0');
    g.rect(x - 8, y + 2, 2, 5, '#f0f0f0');
    g.rect(x - 2, y + 2, 2, 5, '#f0f0f0');
    g.rect(x + 4, y + 2, 2, 5, '#f0f0f0');
    // tail curl
    g.rect(x + 15, y - 2, 8, 4, '#28a828');
    g.rect(x + 20, y - 5, 4, 4, '#28a828');
  }

  /* ============================================================ */
  RetroSaga.create({
    id: 'peterpan',
    title: 'Peter Pan',
    subtitle: 'SECOND STAR TO THE RIGHT',
    currency: 'ADVENTURE',
    screens: {
      win: '#ffe14d', lose: '#c84030',
      chapterLabel: '#8090b8', name: '#c8dcff',
      sub: '#90b8ff', intro: '#c0d0ff', quote: '#7088a8', help: '#ffe14d',
      score: '#c8dcff', cur: '#ffe14d', cta: '#c8dcff', overlay: 'rgba(1,2,8,.90)',
    },
    labels: {
      chapter: 'TALE', score: 'ADVENTURE WON',
      win: 'OFF TO NEVERLAND', lose: 'THE PIRATES CAUGHT YOU',
      cont: 'TAP TO FLY ON', finale: 'TAP FOR THE FINAL ADVENTURE',
      toMenu: 'TAP TO RETURN', play: 'TAP TO FLY',
    },
    accent: '#ffe14d',
    credit: 'AN 8-BIT TRIBUTE · J. M. BARRIE, 1911',
    emblem,
    scenery,
    bootCta: 'TAP TO FLY',
    menuLabel: 'THE WAY TO NEVERLAND',
    menuHint: 'CHOOSE YOUR ADVENTURE',
    menuDone: 'HOOK IS VANQUISHED',
    menu: {
      colors: { title: '#ffe14d', label: '#8090b8', cur: '#c8dcff' },
      // Chapter-select: glowing STARS scattered across the night sky,
      // tracing the pixie-dust path from London to Neverland.
      layout(api) {
        // Positions: ch1 London rooftops → ch5 near "second star"
        const P = [
          [48, 390],
          [214, 324],
          [56, 248],
          [200, 172],
          [118, 96],
        ];
        return P.map((p) => ({ x: p[0] - 36, y: p[1] - 36, w: 72, h: 72 }));
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2, cy = y + h / 2;
        const r = w / 2 - 4;
        // glow halo on selected
        if (sel) {
          c.globalAlpha = 0.28;
          c.fillStyle = '#ffe14d'; c.beginPath(); c.arc(cx, cy, r + 11, 0, 7); c.fill();
          c.globalAlpha = 1;
        }
        // five-pointed star
        c.fillStyle = done ? '#1e2860' : (sel ? '#141c50' : '#0c1228');
        c.strokeStyle = sel ? '#ffe14d' : (done ? '#5070d0' : '#1e2870');
        c.lineWidth = sel ? 2.5 : 1;
        c.beginPath();
        for (let pt = 0; pt < 5; pt++) {
          const a1 = (pt * 2 * Math.PI / 5) - Math.PI / 2;
          const a2 = a1 + Math.PI / 5;
          const px1 = cx + r * Math.cos(a1), py1 = cy + r * Math.sin(a1);
          const px2 = cx + r * 0.42 * Math.cos(a2), py2 = cy + r * 0.42 * Math.sin(a2);
          if (pt === 0) c.moveTo(px1, py1); else c.lineTo(px1, py1);
          c.lineTo(px2, py2);
        }
        c.closePath(); c.fill(); c.stroke();
        // Chapter number (large)
        api.txtC(String(i + 1), cx, cy - 20, 12, sel ? '#ffe14d' : (done ? '#90aaf0' : '#3858b0'));
        // Short label
        const shortLabels = ['NURSERY', 'LAGOON', 'TICK-TOCK', 'HIDEOUT', 'JOLLY ROGER'];
        api.txtC(shortLabels[i] || '', cx, cy - 5, 5, done ? '#c8dcff' : '#5070a8');
        if (done) api.txtC('★', cx, cy + 14, 11, '#ffe14d');
      },
    },
    finale: [
      'HOOK FALLS.',
      'THE CROC IS PLEASED.',
      '',
      'PETER FLIES THE',
      'DARLINGS HOME',
      'BENEATH THE SECOND STAR.',
    ],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#ffe14d', blood: '#c8102e', peter: '#2ab83a', teal: '#21c8c8', dim: '#4060a0' },

    chapters: [

      /* ===== 1. THINK HAPPY THOUGHTS — flappy dodge over London ===== */
      {
        id: 'nursery', name: 'THINK HAPPY THOUGHTS', sub: 'OVER THE LONDON ROOFTOPS',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.circle(x + 3, y - 3, 7, '#f0e8c0');
          g.circle(x + 6, y - 6, 5, '#060b1e');
          g.rect(x - 8, y + 1, 5, 3, '#2ab83a');
          g.rect(x - 4, y - 1, 3, 1, '#c8102e');
        },
        intro: [
          '"THINK LOVELY THOUGHTS,"',
          'SAID PETER PAN.',
          'AND THE CHILDREN',
          'began to rise.',
        ],
        quote: '"Second to the right, and then straight on till morning."',
        help: 'HOLD tap/A to rise · release to fall · dodge chimneys',
        winText: 'London shrinks below. The stars grow close. Neverland awaits.',
        loseText: 'A chimney catches you — tumbling back to the nursery window.',
        init(api) {
          this.y = api.H * 0.5;
          this.vy = 0;
          this.dist = 0;
          this.need = 280;
          this.obs = [];
          this.pixies = [];
          this.spawnT = 0;
          this.pixieT = 0;
          this.lives = 3;
          this.collected = 0;
          this.speed = 58;
          this.inv = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.inv = Math.max(0, this.inv - dt);
          const holding = api.pointer.down || api.keyDown('up') || api.keyDown('a');
          this.vy += holding ? (-0.33 * f) : (0.24 * f);
          this.vy = clamp(this.vy, -5, 5.5);
          this.y = clamp(this.y + this.vy * f * 0.5, 26, api.H - 26);

          this.speed = Math.min(115, 58 + this.dist * 0.09);
          this.dist += this.speed * dt;
          api.score = Math.floor(this.dist / 8) + this.collected * 18;

          // spawn obstacles
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = 0.85 + (Math.random() * 0.5) - Math.min(0.28, this.dist / 1200);
            const gap = 72 + Math.random() * 55;
            const midY = 80 + Math.random() * (api.H - 160);
            this.obs.push({ x: api.W + 12, y: midY, gap, spire: Math.random() < 0.38 });
          }
          // spawn pixie dust stars
          this.pixieT -= dt;
          if (this.pixieT <= 0) {
            this.pixieT = 0.7 + Math.random() * 0.7;
            this.pixies.push({ x: api.W + 10, y: 28 + Math.random() * (api.H - 56) });
          }

          const spd = this.speed;
          for (const o of this.obs) o.x -= spd * dt;
          for (const p of this.pixies) p.x -= spd * dt;
          this.obs = this.obs.filter((o) => o.x > -24);
          this.pixies = this.pixies.filter((p) => p.x > -10);

          const px = 50;
          // collect pixie stars
          for (const p of this.pixies) {
            if (Math.hypot(px - p.x, this.y - p.y) < 14) {
              p.x = -999; this.collected++;
              api.audio.sfx('coin'); api.burst(p.x, p.y, '#ffe14d', 6);
            }
          }
          // obstacle collision
          if (this.inv <= 0) {
            for (const o of this.obs) {
              if (Math.abs(px - o.x) < 16) {
                const inGap = this.y > o.y - o.gap / 2 - 12 && this.y < o.y + o.gap / 2 + 12;
                if (!inGap) {
                  this.lives--; this.inv = 1.4;
                  api.shake(6, 0.3); api.flash('#c84030', 0.2); api.audio.sfx('hurt');
                  if (this.lives <= 0) { api.lose(); return; }
                }
              }
            }
          }
          if (this.dist >= this.need) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const sky = c.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#010208'); sky.addColorStop(1, '#0a102e');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          for (let i = 0; i < 22; i++) { const sx = (i * 61 + 7) % W, sy = (i * 89) % 160; c.globalAlpha = 0.4 + 0.3 * Math.sin(api.t * 2 + i); c.fillStyle = '#d0deff'; c.fillRect(sx, sy, 1, 1); } c.globalAlpha = 1;
          g.circle(W - 32, 32, 17, '#f0e8c0'); g.circle(W - 26, 27, 12, '#06091e');

          // obstacles
          for (const o of this.obs) {
            const topH = o.y - o.gap / 2;
            const botY = o.y + o.gap / 2;
            const botH = H - botY;
            if (o.spire) {
              g.rect(o.x - 6, 0, 12, topH - 14, '#161a2a');
              g.sprite(['..s..', '.sss.', 'sssss'], o.x - 8, topH - 17, { s: '#1e2438' }, 3);
              g.rect(o.x - 6, botY + 14, 12, botH, '#161a2a');
              g.sprite(['sssss', '.sss.', '..s..'], o.x - 8, botY, { s: '#1e2438' }, 3);
            } else {
              g.rect(o.x - 8, 0, 16, topH, '#1a1e2e');
              g.rect(o.x - 11, topH - 7, 22, 7, '#222840');
              g.rect(o.x - 8, botY, 16, botH, '#1a1e2e');
              g.rect(o.x - 11, botY, 22, 7, '#222840');
            }
          }

          // pixie dust
          for (const p of this.pixies) {
            c.globalAlpha = 0.85;
            g.rect(p.x - 2, p.y - 1, 4, 4, '#ffe14d');
            g.rect(p.x, p.y - 4, 1, 8, '#ffe060');
            g.rect(p.x - 3, p.y + 1, 7, 1, '#ffe060');
            c.globalAlpha = 1;
          }

          // Peter (flash when invincible)
          if (this.inv <= 0 || Math.floor(this.inv * 8) % 2 === 0) {
            drawPeter(g, 50, this.y, 3);
          }

          api.topBar('THINK HAPPY THOUGHTS');
          for (let i = 0; i < 3; i++) g.rect(W - 70 + i * 22, 4, 16, 8, i < this.lives ? '#2ab83a' : '#162038');
          api.txtC('★ ' + this.collected, W / 2, 4, 8, '#ffe14d');
          g.rect(6, H - 10, W - 12, 5, '#162038');
          g.rect(6, H - 10, (W - 12) * clamp(this.dist / this.need, 0, 1), 5, '#ffe14d');
          api.vignette();
        },
      },

      /* ===== 2. MERMAID LAGOON — intercept Hook's pirates ===== */
      {
        id: 'lagoon', name: 'MERMAID LAGOON', sub: 'RESCUE TIGER LILY',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y + 2, 16, 3, '#21c8c8');
          g.rect(x - 6, y + 5, 12, 2, '#0ea0a0');
          g.rect(x - 2, y - 8, 4, 10, '#e06820');
          g.rect(x - 4, y - 8, 8, 2, '#e88040');
        },
        intro: [
          'HOOK TIES TIGER LILY',
          'TO MAROONER\'S ROCK.',
          'THE TIDE IS RISING.',
          'Pan flies in.',
        ],
        quote: '"Pan, who and what art thou?" he cried huskily. "I\'m youth, I\'m joy," Peter answered.'        ,
        help: 'DRAG Pan · intercept pirates before they reach Tiger Lily',
        winText: 'Tiger Lily is free. She leaps into the lagoon with a laugh.',
        loseText: 'Too many pirates reach the rock. The tide rushes in.',
        init(api) {
          this.panX = api.W / 2;
          this.panY = api.H / 2;
          this.tlX = api.W / 2;
          this.tlY = api.H / 2 - 8;
          this.pirates = [];
          this.spawnT = 1.1;
          this.timer = 28;
          this.danger = 0;
          this.maxDanger = 4;
          this.warded = 0;
        },
        update(api, dt) {
          this.timer -= dt;
          if (api.pointer.down) { this.panX = api.pointer.x; this.panY = api.pointer.y; }
          if (api.keyDown('left')) this.panX -= 3.5 * dt * 60;
          if (api.keyDown('right')) this.panX += 3.5 * dt * 60;
          if (api.keyDown('up')) this.panY -= 3.5 * dt * 60;
          if (api.keyDown('down')) this.panY += 3.5 * dt * 60;
          this.panX = clamp(this.panX, 14, api.W - 14);
          this.panY = clamp(this.panY, 28, api.H - 20);

          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.48, 1.1 - (28 - this.timer) * 0.024);
            const edge = Math.floor(Math.random() * 4);
            let px, py;
            if (edge === 0) { px = Math.random() * api.W; py = 28; }
            else if (edge === 1) { px = api.W - 8; py = 28 + Math.random() * (api.H - 56); }
            else if (edge === 2) { px = Math.random() * api.W; py = api.H - 8; }
            else { px = 8; py = 28 + Math.random() * (api.H - 56); }
            this.pirates.push({ x: px, y: py, spd: 28 + Math.random() * 18 });
          }

          for (const p of this.pirates) {
            const dx = this.tlX - p.x, dy = this.tlY - p.y;
            const d = Math.hypot(dx, dy) || 1;
            p.x += (dx / d) * p.spd * dt; p.y += (dy / d) * p.spd * dt;
            if (Math.hypot(this.panX - p.x, this.panY - p.y) < 20) {
              p.gone = true; this.warded++;
              api.audio.sfx('power'); api.burst(p.x, p.y, '#ffe14d', 8);
            }
            if (Math.hypot(this.tlX - p.x, this.tlY - p.y) < 16) {
              p.gone = true; this.danger++;
              api.shake(5, 0.25); api.flash('#c84030', 0.2); api.audio.sfx('hurt');
              if (this.danger >= this.maxDanger) { api.lose(); return; }
            }
          }
          this.pirates = this.pirates.filter((p) => !p.gone);
          api.score = this.warded * 12 + Math.floor(28 - this.timer);
          if (this.timer <= 0) { api.score += 60; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // turquoise lagoon
          const sky = c.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#003850'); sky.addColorStop(0.5, '#005878'); sky.addColorStop(1, '#003850');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          // water shimmer
          c.globalAlpha = 0.12;
          for (let wy = 0; wy < H; wy += 9) { c.fillStyle = wy % 18 === 0 ? '#40d0e0' : '#10a0b8'; c.fillRect(0, wy, W, 4); }
          c.globalAlpha = 1;
          // Skull Rock
          c.fillStyle = '#bab2a0';
          c.beginPath(); c.arc(W / 2, H / 2, 50, 0, Math.PI); c.fill();
          g.rect(W / 2 - 50, H / 2, 100, 28, '#bab2a0');
          // skull sockets
          g.circle(W / 2 - 15, H / 2 - 22, 8, '#18181a'); g.circle(W / 2 + 15, H / 2 - 22, 8, '#18181a');
          g.rect(W / 2 - 12, H / 2 - 4, 24, 3, '#18181a');
          // water ripple around rock
          c.strokeStyle = '#21c8c8'; c.lineWidth = 1; c.globalAlpha = 0.25;
          c.beginPath(); c.ellipse(W / 2, H / 2 + 20, 64, 14, 0, 0, 7); c.stroke(); c.globalAlpha = 1;

          // Tiger Lily (tied to rock)
          const tlX = this.tlX, tlY = this.tlY;
          g.rect(tlX - 3, tlY - 14, 6, 14, '#e06820');
          g.circle(tlX, tlY - 18, 6, '#f09030');
          g.rect(tlX - 5, tlY - 3, 10, 2, '#c8a040'); // rope

          // pirates
          for (const p of this.pirates) {
            g.sprite(['.r.', 'rrr', '.r.'], p.x - 6, p.y - 6, { r: '#c8102e' }, 4);
            g.rect(p.x + 5, p.y - 8, 9, 2, '#d0c080');
          }

          drawPeter(g, this.panX, this.panY, 3);

          api.topBar('MERMAID LAGOON');
          api.txt('WARDED ' + this.warded, 6, 4, 8, '#ffe14d');
          for (let i = 0; i < this.maxDanger; i++) {
            g.rect(W - 8 - i * 15, 3, 11, 11, i < this.maxDanger - this.danger ? '#c8102e' : '#1e1a2a');
          }
          g.rect(6, H - 10, W - 12, 5, '#0a1820');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 28, 0, 1), 5, '#21c8c8');
          api.vignette();
        },
      },

      /* ===== 3. TICK-TOCK — alternate-tap to run from the croc ===== */
      {
        id: 'ticking', name: 'TICK-TOCK', sub: 'THE CROCODILE COMES',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 9, y - 2, 18, 5, '#28a828');
          g.rect(x - 8, y + 3, 3, 5, '#f0f0f0');
          g.rect(x - 3, y + 3, 3, 5, '#f0f0f0');
          g.rect(x + 2, y + 3, 3, 5, '#f0f0f0');
          g.rect(x + 2, y - 8, 2, 6, '#e3c567');
        },
        intro: [
          'A CROCODILE ONCE ATE',
          'HOOK\'S HAND — AND AN',
          'ALARM CLOCK AFTER.',
          'Tick-tock! Run, Hook!',
        ],
        quote: '"Hook or me this time."',
        help: 'TAP LEFT / RIGHT alternately to keep Hook running',
        winText: 'Hook dives onto the gangplank. The croc circles, unsatisfied.',
        loseText: 'The ticking grows deafening. Tick-tock. Tick-tock.',
        init(api) {
          this.hookX = api.W * 0.55;
          this.hookY = api.H * 0.68;
          this.crocX = -50;
          this.runSpeed = 0;
          this.lastSide = 0;
          this.stepCount = 0;
          this.dist = 0;
          this.need = 250;
          this.tapCooldown = 0;
          this.tock = 0;
        },
        update(api, dt) {
          this.tapCooldown = Math.max(0, this.tapCooldown - dt);
          this.tock += dt;

          if (api.pointer.justDown && this.tapCooldown <= 0) {
            const side = api.pointer.x < api.W / 2 ? -1 : 1;
            if (side !== this.lastSide) {
              this.lastSide = side;
              this.runSpeed = Math.min(98, this.runSpeed + 36);
              this.stepCount++;
              api.audio.sfx('blip');
            }
            this.tapCooldown = 0.11;
          }
          if (api.keyPressed('left') && this.lastSide !== -1) { this.lastSide = -1; this.runSpeed = Math.min(98, this.runSpeed + 36); this.stepCount++; api.audio.sfx('blip'); }
          if (api.keyPressed('right') && this.lastSide !== 1) { this.lastSide = 1; this.runSpeed = Math.min(98, this.runSpeed + 36); this.stepCount++; api.audio.sfx('blip'); }

          this.runSpeed = Math.max(10, this.runSpeed - 28 * dt);
          this.dist += this.runSpeed * dt;

          // croc closes in when player slows
          const targetCrocX = this.hookX - 115 + (100 - this.runSpeed) * 0.65;
          this.crocX += (targetCrocX - this.crocX) * Math.min(1, dt * 1.4);

          if (this.crocX > this.hookX - 28) {
            api.shake(8, 0.4); api.flash('#28a828', 0.25); api.audio.sfx('lose'); api.lose(); return;
          }
          api.score = Math.floor(this.dist);
          if (this.dist >= this.need) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Jungle
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#091506'); bg.addColorStop(0.5, '#0f1e08'); bg.addColorStop(1, '#0b1806');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);
          // scrolling trees
          const sx = -(this.dist % 110);
          for (let tx = -30; tx < W + 44; tx += 48) {
            const rx = tx + sx;
            c.fillStyle = '#070e06'; c.fillRect(rx + 2, H * 0.28, 9, H * 0.72);
            c.fillStyle = '#0a1808'; c.beginPath(); c.arc(rx + 6, H * 0.28, 20, 0, 7); c.fill();
          }
          c.fillStyle = '#162608'; c.fillRect(0, H * 0.73, W, H * 0.27);
          // ferns
          c.fillStyle = '#1c3a0c'; c.globalAlpha = 0.7;
          for (let i = 0; i < 8; i++) { const fx = ((i * 36 + sx * 0.6) % (W + 32)) - 16; c.beginPath(); c.arc(fx, H * 0.73, 13, Math.PI, 0); c.fill(); }
          c.globalAlpha = 1;

          // urgency flash
          const gap = this.hookX - this.crocX;
          if (gap < 60) {
            c.globalAlpha = 0.15 * Math.abs(Math.sin(api.t * 9));
            c.fillStyle = '#28a828'; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
          }

          if (this.crocX > -55) drawCroc(g, this.crocX, H * 0.73 - 14);

          // Hook running (bob with steps)
          const bob = Math.sin(this.stepCount * 0.9) * 3;
          drawHook(g, this.hookX, H * 0.73 - 18 + bob, 3);

          // Tap hints
          c.globalAlpha = 0.06 + 0.04 * Math.abs(Math.sin(api.t * 5));
          c.fillStyle = '#ffe14d'; c.fillRect(0, H * 0.55, W / 2, H * 0.45); c.fillRect(W / 2, H * 0.55, W / 2, H * 0.45);
          c.globalAlpha = 1;
          api.txtC('←', W / 4, H * 0.83, 18, 'rgba(255,225,77,0.20)');
          api.txtC('→', W * 3 / 4, H * 0.83, 18, 'rgba(255,225,77,0.20)');

          api.topBar('TICK-TOCK');
          // Gap bar
          const gapFrac = clamp(gap / 115, 0, 1);
          g.rect(6, 20, W - 12, 5, '#0a1808');
          g.rect(6, 20, (W - 12) * gapFrac, 5, gapFrac < 0.35 ? '#c84030' : '#5dff8f');
          api.txtC('GAP', W / 2, 20, 6, '#6a9040');
          // Progress bar
          g.rect(6, H - 10, W - 12, 5, '#0a1808');
          g.rect(6, H - 10, (W - 12) * clamp(this.dist / this.need, 0, 1), 5, '#ffe14d');
          api.vignette();
        },
      },

      /* ===== 4. THE HIDEOUT — defend from all sides ===== */
      {
        id: 'hideout', name: 'THE HIDEOUT', sub: 'DEFEND THE LOST BOYS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 6, 12, 10, '#6a3810');
          g.circle(x, y - 6, 7, '#2a1008');
          g.rect(x - 3, y - 8, 6, 3, '#2ab83a');
          g.rect(x - 1, y - 1, 2, 4, '#e8c060');
        },
        intro: [
          'HOOK STORMS THE',
          'UNDERGROUND HOME.',
          'PIRATES POUR IN',
          'from every side.',
        ],
        quote: '"I\'m youth, I\'m joy, I\'m a little bird that has broken out of the egg."',
        help: 'TAP pirates before they reach the hideout entrance',
        winText: 'The last pirate runs. The Lost Boys cheer from underground.',
        loseText: 'Too many boots pound down the hollow trees.',
        init(api) {
          this.cx = api.W / 2;
          this.cy = api.H / 2 + 24;
          this.radius = 88;
          this.enemies = [];
          this.spawnT = 0.9;
          this.timer = 30;
          this.lives = 5;
          this.killed = 0;
        },
        update(api, dt) {
          this.timer -= dt;
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.35, 0.9 - (30 - this.timer) * 0.019);
            const angle = Math.random() * Math.PI * 2;
            this.enemies.push({
              x: this.cx + Math.cos(angle) * (this.radius + 22),
              y: this.cy + Math.sin(angle) * (this.radius + 22),
              spd: 22 + Math.random() * 18,
            });
            api.audio.sfx('blip');
          }

          for (const e of this.enemies) {
            const dx = this.cx - e.x, dy = this.cy - e.y;
            const d = Math.hypot(dx, dy) || 1;
            e.x += (dx / d) * e.spd * dt; e.y += (dy / d) * e.spd * dt;
            if (api.pointer.justDown && Math.hypot(api.pointer.x - e.x, api.pointer.y - e.y) < 24) {
              e.gone = true; this.killed++;
              api.score += 10; api.audio.sfx('power'); api.burst(e.x, e.y, '#ffe14d', 7);
            }
            if (Math.hypot(this.cx - e.x, this.cy - e.y) < 20) {
              e.gone = true; this.lives--;
              api.shake(6, 0.3); api.flash('#c84030', 0.2); api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          this.enemies = this.enemies.filter((e) => !e.gone);
          api.score = this.killed * 10 + Math.floor(30 - this.timer);
          if (this.timer <= 0) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Underground earth
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#0d0a06'); bg.addColorStop(1, '#1c1208');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);
          // Root tendrils
          c.globalAlpha = 0.16;
          c.strokeStyle = '#6a3810'; c.lineWidth = 2;
          for (let i = 0; i < 10; i++) {
            c.beginPath();
            c.moveTo((i * 27) % W, 0);
            c.quadraticCurveTo((i * 43 + 20) % W, H * 0.45, (i * 19 + 30) % W, H);
            c.stroke();
          }
          c.globalAlpha = 1;
          // Radius ring (subtle)
          c.strokeStyle = 'rgba(42,184,58,.13)'; c.lineWidth = 2;
          c.beginPath(); c.arc(this.cx, this.cy, this.radius, 0, 7); c.stroke();
          // Hollow-tree entrance
          c.fillStyle = '#5a3010'; c.fillRect(this.cx - 20, this.cy - 30, 40, 36);
          c.fillStyle = '#18080a'; c.beginPath(); c.arc(this.cx, this.cy - 30, 20, Math.PI, 0); c.fill();
          c.fillStyle = '#18080a'; c.fillRect(this.cx - 18, this.cy - 30, 36, 28);
          // Lantern glow
          c.globalAlpha = 0.1 + 0.06 * Math.sin(api.t * 4);
          c.fillStyle = '#e8c060'; c.beginPath(); c.arc(this.cx, this.cy - 18, 24, 0, 7); c.fill();
          c.globalAlpha = 1;
          g.rect(this.cx - 3, this.cy - 22, 6, 8, '#e8c060');
          // enemies
          for (const e of this.enemies) {
            g.sprite(['.r.', 'rrr', '.r.'], e.x - 6, e.y - 6, { r: '#c8102e' }, 4);
            g.rect(e.x + 5, e.y - 7, 8, 2, '#d0c080');
          }
          drawPeter(g, this.cx, this.cy - 12, 3);

          api.topBar('THE HIDEOUT');
          api.txt('REPELLED ' + this.killed, 6, 4, 8, '#ffe14d');
          for (let i = 0; i < 5; i++) g.rect(W - 8 - i * 14, 3, 10, 10, i < this.lives ? '#2ab83a' : '#201808');
          g.rect(6, H - 10, W - 12, 5, '#0e0a06');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 30, 0, 1), 5, '#2ab83a');
          api.vignette();
        },
      },

      /* ===== 5. THE JOLLY ROGER — duel with Captain Hook ===== */
      {
        id: 'jollyroger', name: 'THE JOLLY ROGER', sub: 'FACE CAPTAIN HOOK',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 1, 16, 2, '#e3c567');
          g.rect(x - 1, y - 8, 2, 16, '#e3c567');
          g.rect(x + 3, y - 2, 7, 2, '#e3c567');
          g.rect(x + 8, y - 5, 2, 5, '#e3c567');
        },
        intro: [
          'ON THE JOLLY ROGER\'S DECK',
          'HOOK RAISES HIS SWORD.',
          '"THIS TIME, PAN,"',
          'he smiles, "you will not win."',
        ],
        quote: '"Hook or me this time."',
        help: 'Dodge LEFT or RIGHT when Hook telegraphs · then TAP to counter',
        winText: 'Peter kicks Hook over the rail — to the waiting crocodile below.',
        loseText: 'The hook catches Peter\'s collar. The deck tilts.',
        init(api) {
          this.panX = api.W / 2;
          this.panY = api.H * 0.73;
          this.hookX = api.W / 2;
          this.hookY = api.H * 0.36;
          this.phase = 'idle';
          this.phaseT = 0;
          this.idleT = 1.6;
          this.attackSide = 0;
          this.strikes = 0;
          this.needStrikes = 3;
          this.lives = 4;
        },
        update(api, dt) {
          const f = dt * 60;
          this.phaseT += dt;

          // pan movement (L/R)
          if (api.pointer.down) this.panX = api.pointer.x;
          if (api.keyDown('left')) this.panX -= 4 * f;
          if (api.keyDown('right')) this.panX += 4 * f;
          this.panX = clamp(this.panX, 18, api.W - 18);

          if (this.phase === 'idle') {
            this.idleT -= dt;
            if (this.idleT <= 0) {
              this.phase = 'telegraph';
              this.phaseT = 0;
              this.attackSide = Math.random() < 0.5 ? -1 : 1;
              api.audio.sfx('blip');
            }
          } else if (this.phase === 'telegraph') {
            if (this.phaseT > 0.95) { this.phase = 'strike'; this.phaseT = 0; api.audio.sfx('shoot'); }
          } else if (this.phase === 'strike') {
            if (this.phaseT > 0.48) {
              const dodged = (this.attackSide === -1 && this.panX > api.W / 2 + 18) ||
                             (this.attackSide === 1 && this.panX < api.W / 2 - 18);
              if (dodged) {
                this.phase = 'counter'; this.phaseT = 0; api.audio.sfx('coin');
              } else {
                this.lives--;
                api.shake(7, 0.35); api.flash('#c84030', 0.25); api.audio.sfx('hurt');
                api.burst(this.panX, this.panY, '#c84030', 8);
                this.phase = 'idle'; this.phaseT = 0;
                this.idleT = Math.max(0.9, 1.6 - this.strikes * 0.2);
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          } else if (this.phase === 'counter') {
            if (api.pointer.justDown || api.keyPressed('a') || api.keyPressed('up')) {
              this.strikes++;
              api.score += 30; api.audio.sfx('power');
              api.shake(5, 0.22); api.burst(this.hookX, this.hookY, '#ffe14d', 14);
              if (this.strikes >= this.needStrikes) { api.score += 80; api.win(); return; }
              this.phase = 'stagger'; this.phaseT = 0;
            } else if (this.phaseT > 0.85) {
              this.phase = 'idle'; this.phaseT = 0; this.idleT = 1.1;
            }
          } else if (this.phase === 'stagger') {
            if (this.phaseT > 0.65) {
              this.phase = 'idle'; this.phaseT = 0;
              this.idleT = Math.max(0.7, 1.5 - this.strikes * 0.22);
            }
          }
          api.score = this.strikes * 30;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Night sea sky
          const sky = c.createLinearGradient(0, 0, 0, H * 0.55);
          sky.addColorStop(0, '#010208'); sky.addColorStop(1, '#081028');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.55);
          // Stars
          for (let i = 0; i < 18; i++) { const sx = (i * 59) % W, sy = (i * 41) % Math.floor(H * 0.48); c.globalAlpha = 0.4; c.fillStyle = '#d0deff'; c.fillRect(sx, sy, 1, 1); } c.globalAlpha = 1;
          // Moon
          g.circle(W - 26, 28, 16, '#f0e8c0'); g.circle(W - 20, 23, 12, '#060918');
          // Ship deck
          c.fillStyle = '#3a2810'; c.fillRect(0, H * 0.55, W, H * 0.45);
          for (let yd = H * 0.55; yd < H; yd += 10) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, yd, W, 1); }
          for (let xd = 0; xd < W; xd += 20) { c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(xd, H * 0.55, 1, H); }
          // Railing
          g.rect(0, H * 0.55 - 4, W, 4, '#5a3c18');
          for (let xr = 10; xr < W; xr += 20) g.rect(xr, H * 0.55 - 20, 4, 20, '#4a3010');
          // Mast
          g.rect(W / 2 - 4, 0, 8, H * 0.55, '#4a3010');
          // Skull & crossbones flag
          g.sprite([
            '.w.', 'www', '.w.',
            'w.w', 'w.w',
          ], W / 2 - 6, 6, { w: '#f0f0ee' }, 4);
          // Dark sea below
          c.fillStyle = '#010610'; c.fillRect(0, H - 8, W, 8);

          // Hook
          const stagger = this.phase === 'stagger' ? Math.sin(this.phaseT * 22) * 7 : 0;
          drawHook(g, this.hookX + stagger, this.hookY, 4);

          // Telegraph / strike arrow
          if (this.phase === 'telegraph' || this.phase === 'strike') {
            const col = this.phase === 'strike' ? '#c84030' : '#ffe14d';
            const arrowX = this.hookX + this.attackSide * 30;
            const prog = this.phase === 'strike' ? clamp(this.phaseT / 0.48, 0, 1) : 0;
            g.rect(arrowX - 5, this.hookY - 6, 10, 14, col);
            api.txtC(this.attackSide < 0 ? '←' : '→', this.hookX, this.hookY - 22, 13, col);
            // warning bar
            if (this.phase === 'telegraph') {
              const frac = this.phaseT / 0.95;
              g.rect(W / 2 - 40, H * 0.55 - 12, 80, 4, '#1a1010');
              g.rect(W / 2 - 40, H * 0.55 - 12, 80 * frac, 4, '#e84030');
            }
          }

          // Counter window
          if (this.phase === 'counter') {
            const pulse = 0.25 + 0.35 * Math.sin(api.t * 13);
            c.globalAlpha = pulse;
            c.fillStyle = '#ffe14d'; c.fillRect(W / 2 - 32, H * 0.48, 64, 24);
            c.globalAlpha = 1;
            api.txtC('STRIKE!', W / 2, H * 0.50, 10, '#060810');
          }

          // Dodge zone hint
          if (this.phase === 'telegraph') {
            c.globalAlpha = 0.08;
            c.fillStyle = '#5dff8f';
            const safeX = this.attackSide === -1 ? W / 2 : 0;
            c.fillRect(safeX, H * 0.6, W / 2, H * 0.4);
            c.globalAlpha = 1;
          }

          drawPeter(g, this.panX, this.panY, 3);

          api.topBar('THE JOLLY ROGER');
          api.txt('HITS ' + this.strikes + '/' + this.needStrikes, 6, 4, 8, '#ffe14d');
          for (let i = 0; i < 4; i++) g.rect(W - 8 - i * 14, 3, 10, 10, i < this.lives ? '#ffe14d' : '#20160a');
          api.vignette(); api.scanlines();
        },
      },

    ], // end chapters
  }); // end RetroSaga.create
})();
