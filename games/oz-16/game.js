/* ============================================================================
 * THE WIZARD OF OZ — THE PATCHWORK ROAD   (Gen 2 / 16-bit)
 * L. Frank Baum's novel on RetroSaga2: HUB is Dorothy's own patchwork quilt,
 * spread out at bedtime — Kansas in one corner, the Emerald City in another,
 * a dashed gold thread stitching the patches into a road. A choice behind the
 * Wizard's curtain (forgive the humbug, or call out the fraud) shapes how the
 * tale ends. Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    gold: '#ffd23f', goldBright: '#fff0a8', goldDark: '#8a6a10',
    green: '#20e070', greenBright: '#8dffc0', greenDim: '#0f6a3c', greenDark: '#0a3320',
    ruby: '#ff2e5f', rubyDark: '#7a0f28',
    poppy: '#ff4fa3', poppyDark: '#8a1f5a',
    witch: '#7a3ad1', witchDark: '#2a1050', witchSkin: '#8fce4f',
    sky: '#4fb8ff',
    dust: '#8a8a7a', dustLight: '#c8b878', dustDark: '#4a4a3e',
    cream: '#fff6dc', dim: '#6a8a78', danger: '#ff4a5a',
    ink: '#04140b', night: '#0a2216',
  };
  // a clean geometric dot-matrix face — fresh for the fleet, playful without
  // tipping into horror-CRT territory; kept for the whimsical Oz property.
  const TITLE = "'DotGothic16','Press Start 2P',monospace";
  const UI = "'Pixelify Sans','Press Start 2P',monospace";

  const shuffled = (arr, api) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = api.rint(0, i); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  function angDiff(a, b) {
    let d = (a - b) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return Math.abs(d);
  }

  const DOROTHY_ROWS = [
    '..hhhh..',
    '.hffffh.',
    '.hffffh.',
    '..ffff..',
    '.wwdddw.',
    '.wwdddw.',
    'wwddddww',
    '.wddddw.',
    '..r..r..',
    '..r..r..',
  ];
  const DOROTHY_PAL = { h: '#6a4420', f: '#f0c090', w: C.cream, d: '#3a6fd8', r: C.ruby };

  /* ─── emblem: a stitched quilt square framing the ruby slippers ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(cx, cy, 26, C.gold, 0.28);
    g2.roundRect(cx - 20, cy - 20, 40, 40, 4, 'rgba(8,20,12,.85)', C.gold, 2);
    c.strokeStyle = 'rgba(255,255,255,.15)'; c.lineWidth = 1; c.setLineDash([2, 2]);
    c.strokeRect(cx - 16, cy - 16, 32, 32); c.setLineDash([]);
    c.fillStyle = C.ruby;
    c.fillRect(cx - 13, cy + 2, 11, 7); c.fillRect(cx - 15, cy + 7, 5, 4); c.fillRect(cx - 12, cy - 4, 8, 5);
    c.fillRect(cx + 2, cy + 2, 11, 7); c.fillRect(cx + 10, cy + 7, 5, 4); c.fillRect(cx + 4, cy - 4, 8, 5);
    const spA = api.t ? api.t : cy;
    for (let i = 0; i < 3; i++) { const a = spA * 1.4 + i * 2.1; g2.glow(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20, 3, C.gold, 0.7); }
  }

  /* ─── shared: a spinning cyclone funnel (boot title + Kansas patch) ─── */
  function drawFunnel(api, cx, cy, t, scale) {
    const c = api.ctx, s = scale || 1;
    for (let i = 0; i < 4; i++) {
      const rad = (18 + i * 11) * s, rot = t * (0.6 + i * 0.15) + i * 0.7;
      c.strokeStyle = 'rgba(200,200,190,' + (0.22 - i * 0.03) + ')'; c.lineWidth = 1.4;
      c.beginPath(); c.ellipse(cx, cy, rad, rad * 0.4, rot, 0, Math.PI * 1.5); c.stroke();
    }
  }
  function drawHouse(c, x, y, s) {
    c.fillStyle = '#8a5a34'; c.fillRect(x - 9 * s, y - 2 * s, 18 * s, 10 * s);
    c.fillStyle = '#4a3020';
    c.beginPath(); c.moveTo(x - 11 * s, y - 2 * s); c.lineTo(x, y - 10 * s); c.lineTo(x + 11 * s, y - 2 * s); c.closePath(); c.fill();
    c.fillStyle = C.cream; c.fillRect(x - 3 * s, y + 1 * s, 6 * s, 5 * s);
  }

  /* ─── twilight backdrop (boot/intro/result/finale/choice) ─── */
  function ozTwilight(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, '#0a2216'], [0.55, '#123322'], [1, '#1e4a2c']], H);
    g2.stars(t, 18, 90, 'rgba(220,255,230,0.35)');
    g2.glow(W * 0.5, H * 0.86, 150, C.gold, 0.05);
    g2.embers(t, 10, { color: C.gold, speed: 0.08, size: 2, alpha: 0.6 });
    if (dim) { c.fillStyle = 'rgba(4,10,6,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }

  /* ─── hub backdrop: Dorothy's own patchwork quilt ─── */
  const NODE_XY = { kansas: [66, 118], road: [198, 108], poppies: [222, 240], witchtower: [188, 356], emerald: [70, 372] };
  const ORDER = ['kansas', 'road', 'poppies', 'witchtower', 'emerald'];
  const DIMS = { kansas: [62, 54], road: [58, 50], poppies: [60, 54], witchtower: [64, 54], emerald: [74, 62] };

  function quiltBG(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.verticalGradient(0, 0, W, H, [[0, '#132a1c'], [0.6, '#0d2016'], [1, '#0a1a10']]);
    c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1;
    for (let x = 10; x < W; x += 27) { c.beginPath(); c.moveTo(x, 54); c.lineTo(x, H - 16); c.stroke(); }
    for (let y = 54; y < H - 16; y += 30) { c.beginPath(); c.moveTo(10, y); c.lineTo(W - 10, y); c.stroke(); }
    c.strokeStyle = C.gold; c.lineWidth = 1.6; c.setLineDash([4, 3]); c.globalAlpha = 0.55;
    c.beginPath();
    ORDER.forEach((id, i) => { const p = NODE_XY[id]; if (i === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); });
    c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
    for (let s = 0; s < ORDER.length - 1; s++) {
      const a = NODE_XY[ORDER[s]], b = NODE_XY[ORDER[s + 1]];
      const ph = ((t * 0.14) + s / (ORDER.length - 1)) % 1;
      g2.glow(a[0] + (b[0] - a[0]) * ph, a[1] + (b[1] - a[1]) * ph, 5, C.gold, 0.5);
    }
    g2.glow(24, H - 30, 40, C.gold, 0.12);
  }

  /* ─── tiny vignettes painted inside each quilt patch ─── */
  const ART = {
    kansas(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = '#3a4038'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      drawFunnel(api, cx, cy - h * 0.06, t, 0.42);
      drawHouse(c, cx, cy + h * 0.22, 0.7);
    },
    road(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = '#123018'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.fillStyle = C.gold; c.globalAlpha = 0.7;
      c.beginPath(); c.moveTo(cx - w * 0.3, cy + h * 0.5); c.lineTo(cx, cy - h * 0.1); c.lineTo(cx + w * 0.1, cy - h * 0.1); c.lineTo(cx - w * 0.1, cy + h * 0.5); c.closePath(); c.fill();
      c.globalAlpha = 1;
      c.strokeStyle = C.dustLight; c.lineWidth = 2;
      c.beginPath(); c.moveTo(cx + w * 0.14, cy - h * 0.28); c.lineTo(cx + w * 0.14, cy + h * 0.1); c.moveTo(cx + w * 0.02, cy - h * 0.12); c.lineTo(cx + w * 0.26, cy - h * 0.12); c.stroke();
    },
    poppies(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = '#2a1030'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      const spots = [[-0.22, 0.1], [0.05, -0.15], [0.24, 0.16], [-0.05, 0.22]];
      spots.forEach((p, i) => {
        const px = cx + p[0] * w, py = cy + p[1] * h, r = 5 + (i % 2);
        const bob = Math.sin(t * 2 + i) * 1.2;
        c.fillStyle = C.poppy; c.beginPath(); c.arc(px, py + bob, r, 0, 7); c.fill();
        c.fillStyle = C.poppyDark; c.beginPath(); c.arc(px, py + bob, r * 0.4, 0, 7); c.fill();
      });
    },
    witchtower(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = '#160a26'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      c.fillStyle = C.witchDark;
      c.beginPath(); c.moveTo(cx - w * 0.14, cy + h * 0.44); c.lineTo(cx - w * 0.14, cy - h * 0.1); c.lineTo(cx, cy - h * 0.42); c.lineTo(cx + w * 0.14, cy - h * 0.1); c.lineTo(cx + w * 0.14, cy + h * 0.44); c.closePath(); c.fill();
      const sweep = Math.sin(t * 1.3) * w * 0.22;
      c.strokeStyle = C.witch; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(cx + sweep - 8, cy - h * 0.3); c.lineTo(cx + sweep + 8, cy - h * 0.34); c.stroke();
    },
    emerald(api, cx, cy, w, h, t) {
      const c = api.ctx;
      c.fillStyle = '#062018'; c.fillRect(cx - w / 2, cy - h / 2, w, h);
      const spires = [-0.24, -0.06, 0.12, 0.28];
      spires.forEach((sx, i) => {
        const px = cx + sx * w, sh = h * (0.34 + (i % 2) * 0.14);
        c.fillStyle = i % 2 ? C.green : C.greenDim;
        c.beginPath(); c.moveTo(px - 5, cy + h * 0.4); c.lineTo(px, cy + h * 0.4 - sh); c.lineTo(px + 5, cy + h * 0.4); c.closePath(); c.fill();
      });
      if (Math.sin(t * 5) > 0.6) { const c2 = api.ctx; c2.fillStyle = C.goldBright; c2.fillRect(cx + 2, cy - h * 0.2, 2, 2); }
    },
  };

  const HUB_LABEL = { kansas: 'KANSAS', road: 'CORNFIELD', poppies: 'POPPIES', witchtower: 'THE CASTLE', emerald: 'EMERALD CITY' };

  const menu = {
    title(api, save, t) {
      const g2 = api.g2, W = api.W;
      g2.ornateFrame(14, 6, W - 28, 32, 8, 'rgba(6,16,10,.88)', C.gold);
      const ti = 'THE WIZARD OF OZ';
      g2.gleamText(ti, W / 2, 12, api.fitSize(ti, 10, W - 48, 'title'), C.green, t, { shadow: 'rgba(0,0,0,.6)', gleamSpeed: 55, font: TITLE });
      api.txtCFit('WISHES  ' + (save.cur || 0), W / 2, 28, 8, C.cream);
    },
    layout() {
      return ORDER.map((id) => { const p = NODE_XY[id], d = DIMS[id]; return { x: p[0] - d[0] / 2, y: p[1] - d[1] / 2, w: d[0], h: d[1] }; });
    },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, locked, t, i } = info;
      const cx = x + w / 2, cy = y + h / 2;
      if (i === 0) menu._labelQueue = [];
      if (sel && !locked) g2.glow(cx, cy, Math.max(w, h) * 0.75, C.green, 0.28 + 0.1 * Math.sin(t * 4));
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      if (!locked && ART[node.id]) ART[node.id](api, cx, cy, w, h, t); else { c.fillStyle = '#0a0a12'; c.fillRect(x, y, w, h); }
      c.restore();
      g2.roundRect(x - 3, y - 3, w + 6, h + 6, 5, null, C.night, 3);
      g2.roundRect(x, y, w, h, 3, null, locked ? '#3a3a3a' : (done ? C.green : C.gold), sel ? 2.4 : 1.6);
      if (locked) { c.fillStyle = 'rgba(6,6,10,.6)'; c.fillRect(x, y, w, h); api.txtC('🔒', cx, cy - 6, 11, '#8a8a8a'); }
      if (done) { g2.roundRect(x + w - 15, y - 2, 13, 11, 3, C.ink, C.green, 1); api.txtC('✓', x + w - 9, y - 1, 8, C.green); }
      menu._labelQueue.push({ id: node.id, name: node.name, cx, ly: y + h + 4, w, locked, done });
      if (i === ORDER.length - 1) {
        for (const L of menu._labelQueue) {
          const maxW = Math.min(L.w + 18, 2 * Math.min(L.cx - 3, api.W - 3 - L.cx));
          g2.roundRect(L.cx - maxW / 2 - 2, L.ly - 2, maxW + 4, 13, 4, '#0a0a12', L.locked ? '#3a3a3a' : C.night, 1);
          api.txtCFit(HUB_LABEL[L.id] || L.name, L.cx, L.ly, 6.5, L.locked ? '#7a7a7a' : (L.done ? C.green : C.cream), false, maxW);
        }
      }
    },
  };

  /* ─── animated title screen ─── */
  function renderBoot(api, info) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    ozTwilight(api, t, 0);
    drawFunnel(api, W / 2, H * 0.2, t, 0.9);
    const title = 'THE WIZARD OF OZ';
    const ts = api.fitSize(title, 13, W - 20, 'title');
    g2.gleamText(title, W / 2, H * 0.40, ts, C.green, t, { shadow: 'rgba(0,0,0,.5)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('A PATCHWORK JOURNEY', W / 2, H * 0.40 + ts + 12, 10, C.gold, true);
    if (info.blink) api.txtCFit('▸ TAP TO FOLLOW THE ROAD ◂', W / 2, H * 0.66, 11, C.cream);
    api.txtCFit('AFTER L. FRANK BAUM, 1900', W / 2, H - 28, 8, C.dim);
    api.vignette(); api.scanlines();
  }

  /* ============================ mini-game phases ============================ */

  /* --- KANSAS: THE CYCLONE (orbit-dodge around the funnel wall) --- */
  const ORBIT_R = 62;
  function cycloneSpin() {
    return {
      name: 'THE CYCLONE', boss: false,
      help: 'DRAG / ARROW KEYS to spin around the wall — dodge debris, catch Toto',
      winText: 'The house settles with a bump. Outside the window, Kansas is nowhere to be seen.',
      loseText: 'A wagon wheel finds the window first. The house comes down hard, and not gently.',
      init(api) {
        this.cx = api.W / 2; this.cy = api.H * 0.52; this.theta = -Math.PI / 2;
        this.hp = 3; this.timer = 22; this.items = []; this.spawnT = 0; this.hitFlash = 0; this.msgT = 0; this.msg = '';
      },
      update(api, dt) {
        this.timer -= dt;
        if (this.timer <= 0) { api.addScore(70); api.win(); return; }
        let dir = 0; if (api.keyDown('left')) dir -= 1; if (api.keyDown('right')) dir += 1;
        if (dir) this.theta += dir * 1.8 * dt;
        else if (api.pointer.down) this.theta += api.pointer.dx * 0.03;
        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          this.spawnT = api.rnd(0.35, 0.6);
          const isGood = api.chance(0.22);
          this.items.push({ a: api.rnd(0, Math.PI * 2), r: 140, speed: isGood ? api.rnd(48, 66) : api.rnd(70, 110 + (22 - this.timer) * 3), kind: isGood ? 'toto' : 'debris' });
        }
        for (const it of this.items) it.r -= it.speed * dt;
        if (this.hitFlash <= 0) {
          for (const it of this.items) {
            if (it.gone) continue;
            if (it.r < ORBIT_R + 14 && it.r > ORBIT_R - 14 && angDiff(it.a, this.theta) < 0.5) {
              it.gone = true;
              const ix = this.cx + Math.cos(this.theta) * ORBIT_R, iy = this.cy + Math.sin(this.theta) * ORBIT_R * 0.55;
              if (it.kind === 'debris') {
                this.hp--; api.shake(6, 0.3); api.flash('#8a8a7a', 0.2); api.audio.sfx('hurt'); this.hitFlash = 0.7;
                api.burst(ix, iy, C.dustLight, 10);
                if (this.hp <= 0) { api.lose(); return; }
              } else {
                api.addScore(18); api.audio.sfx('coin'); api.burst(ix, iy, C.gold, 8);
                this.msg = '+TOTO!'; this.msgT = 0.7;
              }
            }
          }
        }
        this.items = this.items.filter((it) => !it.gone && it.r > -20);
        if (this.hitFlash > 0) this.hitFlash -= dt;
        if (this.msgT > 0) this.msgT -= dt;
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#3a4038'], [1, '#161a16']]);
        drawFunnel(api, this.cx, this.cy, t, 1.15);
        drawFunnel(api, this.cx, this.cy, t * 1.4, 1.7);
        for (const it of this.items) {
          if (it.gone) continue;
          const ix = this.cx + Math.cos(it.a) * it.r, iy = this.cy + Math.sin(it.a) * it.r * 0.55;
          if (it.kind === 'debris') { c.fillStyle = C.dustDark; c.fillRect(ix - 4, iy - 4, 8, 8); }
          else { g2.glow(ix, iy, 8, C.gold, 0.5); c.fillStyle = C.goldBright; c.beginPath(); c.arc(ix, iy, 4, 0, 7); c.fill(); }
        }
        if (!(this.hitFlash > 0 && Math.floor(t * 10) % 2 === 0)) {
          drawHouse(c, this.cx + Math.cos(this.theta) * ORBIT_R, this.cy + Math.sin(this.theta) * ORBIT_R * 0.55, 1);
        }
        if (this.msgT > 0) api.txtCFit(this.msg, W / 2, 50, 9, C.gold);
        for (let i = 0; i < this.hp; i++) g2.roundRect(W - 20 - i * 14, 20, 10, 10, 3, C.green, null);
        g2.roundRect(6, H - 12, W - 12, 5, 3, C.night, null);
        g2.roundRect(6, H - 12, Math.round((W - 12) * (this.timer / 22)), 5, 3, C.green, null);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,10,.7)', C.night, 1);
        api.txtCFit(Math.ceil(this.timer) + 's', W / 2, 8, 8, C.cream, false, 60);
        api.vignette();
      },
    };
  }

  /* --- THE ROAD: THE CORNFIELD WATCH (multi-lane tower defense) --- */
  function cornfieldDefense() {
    return {
      name: 'THE CORNFIELD WATCH', boss: false,
      help: 'TAP a lane to scare off crows near the post — spare the bluebird',
      winText: 'The crows scatter for good. The Scarecrow climbs down, grinning straw from ear to ear.',
      loseText: 'The crows pick the field clean. The Scarecrow slumps back on his post, defeated.',
      init(api) {
        this.LANES = [api.W * 0.22, api.W * 0.5, api.W * 0.78];
        this.DEFEND_Y = api.H - 90; this.crows = []; this.spawnT = 0.8;
        this.need = 16; this.scared = 0; this.corn = 4;
      },
      update(api, dt) {
        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          this.spawnT = Math.max(0.32, api.rnd(0.5, 0.85) - this.scared * 0.012);
          const kind = api.chance(0.18) ? 'bird' : 'crow';
          this.crows.push({ lane: api.rint(0, 2), y: -12, speed: 70 + this.scared * 3, kind });
        }
        for (const cw of this.crows) cw.y += cw.speed * dt;
        if (api.pointer.justDown) {
          const lane = this.LANES.reduce((best, lx, i) => (Math.abs(api.pointer.x - lx) < Math.abs(api.pointer.x - this.LANES[best]) ? i : best), 0);
          let best = null;
          for (const cw of this.crows) { if (cw.gone || cw.lane !== lane) continue; if (cw.y > this.DEFEND_Y - 130 && cw.y < this.DEFEND_Y - 6) { best = cw; break; } }
          if (best) {
            best.gone = true;
            if (best.kind === 'crow') {
              this.scared++; api.addScore(14); api.audio.sfx('coin'); api.burst(this.LANES[best.lane], best.y, C.dustDark, 8);
              if (this.scared >= this.need) { api.addScore(70); api.win(); return; }
            } else {
              this.corn--; api.shake(4, 0.2); api.flash('#4fb8ff', 0.14); api.audio.sfx('hurt');
              if (this.corn <= 0) { api.lose(); return; }
            }
          }
        }
        for (const cw of this.crows) {
          if (!cw.gone && cw.y > this.DEFEND_Y) {
            cw.gone = true;
            if (cw.kind === 'crow') {
              this.corn--; api.shake(4, 0.2); api.flash('#123018', 0.14); api.audio.sfx('hurt');
              if (this.corn <= 0) { api.lose(); return; }
            }
          }
        }
        this.crows = this.crows.filter((cw) => !cw.gone && cw.y < api.H + 20);
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
        g2.skyGradient([[0, '#4fb8ff'], [0.5, '#7ad0a0'], [1, '#123018']], H);
        for (const lx of this.LANES) {
          c.strokeStyle = 'rgba(32,224,112,.14)'; c.lineWidth = 12;
          c.beginPath(); c.moveTo(lx, 30); c.lineTo(lx, this.DEFEND_Y); c.stroke();
          for (let sy = 40; sy < this.DEFEND_Y; sy += 18) { c.strokeStyle = C.greenDim; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, sy); c.lineTo(lx - 4, sy - 10); c.moveTo(lx, sy); c.lineTo(lx + 4, sy - 10); c.stroke(); }
        }
        c.fillStyle = C.dustLight; c.fillRect(W / 2 - 2, this.DEFEND_Y, 4, 26);
        c.fillStyle = C.gold; c.fillRect(W / 2 - 8, this.DEFEND_Y - 12, 16, 12);
        c.fillStyle = '#c85a2a'; c.fillRect(W / 2 - 10, this.DEFEND_Y - 4, 20, 3); c.fillRect(W / 2 - 10, this.DEFEND_Y + 2, 20, 3);
        for (const cw of this.crows) {
          if (cw.gone) continue;
          const lx = this.LANES[cw.lane];
          if (cw.kind === 'crow') { c.fillStyle = '#141018'; c.beginPath(); c.moveTo(lx - 6, cw.y); c.lineTo(lx, cw.y - 4); c.lineTo(lx + 6, cw.y); c.lineTo(lx, cw.y + 3); c.closePath(); c.fill(); }
          else { c.fillStyle = C.sky; c.beginPath(); c.ellipse(lx, cw.y, 5, 4, 0, 0, 7); c.fill(); }
        }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,10,.7)', C.night, 1);
        api.txt('SCARED ' + this.scared + '/' + this.need, 10, 8, 8, C.greenDim);
        api.txtCFit('CORN ' + this.corn + '/4', W - 56, 8, 8, C.danger, false, 96);
        api.vignette();
      },
    };
  }

  /* --- THE POPPY FIELD: resist the drowse while dodging pollen --- */
  function poppyDrowse() {
    return {
      name: 'THE POPPY FIELD', boss: false,
      help: 'DRAG to dodge the pollen · TAP to shake off the drowsiness',
      winText: 'Snow drifts down out of a clear sky, and the poppies lose their hold at last.',
      loseText: 'The scent wins. Dorothy sinks into the blossoms, fast asleep.',
      init(api) {
        this.x = api.W / 2; this.meter = 100; this.timer = 20; this.spawnT = 0; this.puffs = []; this.tapCd = 0;
      },
      update(api, dt) {
        let dir = 0; if (api.keyDown('left')) dir -= 1; if (api.keyDown('right')) dir += 1;
        if (dir) this.x += dir * 140 * dt;
        else if (api.pointer.down) this.x += clamp(api.pointer.x - this.x, -140 * dt, 140 * dt);
        this.x = clamp(this.x, 20, api.W - 20);
        const drainRate = 6 + (20 - this.timer) * 0.15;
        this.meter -= drainRate * dt;
        if (this.tapCd > 0) this.tapCd -= dt;
        if (api.pointer.justDown && this.tapCd <= 0) { this.meter = Math.min(100, this.meter + 9); this.tapCd = 0.18; api.audio.sfx('blip'); }
        this.spawnT -= dt;
        if (this.spawnT <= 0) { this.spawnT = api.rnd(0.5, 0.9); this.puffs.push({ x: api.rnd(20, api.W - 20), y: -10, speed: api.rnd(60, 100) }); }
        for (const p of this.puffs) p.y += p.speed * dt;
        for (const p of this.puffs) {
          if (!p.hit && Math.abs(p.x - this.x) < 16 && Math.abs(p.y - (api.H - 70)) < 16) {
            p.hit = true; this.meter -= 16; api.shake(4, 0.2); api.flash('#ff4fa3', 0.14); api.audio.sfx('hurt');
          }
        }
        this.puffs = this.puffs.filter((p) => !p.hit && p.y < api.H + 20);
        this.timer -= dt;
        if (this.meter <= 0) { this.meter = 0; api.lose(); return; }
        if (this.timer <= 0) { api.addScore(70); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#2a1030'], [0.7, '#3a1440'], [1, '#1a0a20']]);
        for (let i = 0; i < 10; i++) {
          const px = (i * 41 + 20) % W, py = H * 0.3 + ((i * 53) % (H * 0.55)), bob = Math.sin(t * 1.6 + i) * 2;
          c.fillStyle = i % 2 ? C.poppy : C.poppyDark; c.beginPath(); c.arc(px, py + bob, 6 + (i % 3), 0, 7); c.fill();
        }
        for (const p of this.puffs) { if (p.hit) continue; g2.glow(p.x, p.y, 8, C.poppy, 0.4); c.fillStyle = 'rgba(255,150,220,.5)'; c.beginPath(); c.arc(p.x, p.y, 5, 0, 7); c.fill(); }
        g2.bigSprite(DOROTHY_ROWS, this.x - 12, api.H - 106, DOROTHY_PAL, 3, { outline: true, shadow: true });
        g2.roundRect(14, H - 24, W - 28, 8, 3, C.night, null);
        c.fillStyle = this.meter > 30 ? C.greenBright : C.danger;
        g2.roundRect(14, H - 24, Math.round((W - 28) * (this.meter / 100)), 8, 3, this.meter > 30 ? C.greenBright : C.danger, null);
        api.txtCFit('SNOW IN ' + Math.ceil(Math.max(0, this.timer)) + 's', W / 2, H - 38, 8, C.cream, false, 120);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,10,.7)', C.night, 1);
        api.txtCFit('STAY AWAKE', W / 2, 8, 8, C.poppy, false, 110);
        api.vignette();
      },
    };
  }

  /* --- THE CASTLE p1: THE FLYING MONKEYS (triage defense of three allies) --- */
  function monkeyTriage() {
    return {
      name: 'THE FLYING MONKEYS', boss: false,
      help: 'TAP a monkey before it reaches your friend',
      winText: 'The last monkey wheels away, shrieking, back toward the tower.',
      loseText: 'The monkeys close in — Scarecrow, Tin Man and Lion are carried off into the dark.',
      init(api) {
        this.allies = [
          { id: 'scarecrow', x: api.W * 0.22, y: api.H - 90, hp: 3, flashT: 0, col: C.gold },
          { id: 'tinman', x: api.W * 0.5, y: api.H - 90, hp: 3, flashT: 0, col: '#b8c4d0' },
          { id: 'lion', x: api.W * 0.78, y: api.H - 90, hp: 3, flashT: 0, col: '#d89a4a' },
        ];
        this.need = 10; this.repelled = 0; this.monkeys = []; this.spawnT = 0.6;
      },
      update(api, dt) {
        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          this.spawnT = Math.max(0.32, api.rnd(0.55, 0.95) - this.repelled * 0.02);
          const target = api.choice(this.allies);
          this.monkeys.push({ x: target.x + api.rnd(-10, 10), y: -14, target, speed: api.rnd(70, 105) });
        }
        for (const m of this.monkeys) m.y += m.speed * dt;
        if (api.pointer.justDown) {
          let best = null, bestD = 26;
          for (const m of this.monkeys) { if (m.gone) continue; const d = Math.hypot(api.pointer.x - m.x, api.pointer.y - m.y); if (d < bestD) { best = m; bestD = d; } }
          if (best) {
            best.gone = true; this.repelled++; api.addScore(16); api.audio.sfx('coin'); api.burst(best.x, best.y, C.witchSkin, 8);
            if (this.repelled >= this.need) { api.addScore(70); api.win(); return; }
          }
        }
        for (const m of this.monkeys) {
          if (m.gone) continue;
          if (m.y >= m.target.y - 6) {
            m.gone = true; m.target.hp--; m.target.flashT = 0.5; api.shake(4, 0.2); api.flash('#3a2a54', 0.14); api.audio.sfx('hurt');
            if (m.target.hp <= 0) { api.lose(); return; }
          }
        }
        this.monkeys = this.monkeys.filter((m) => !m.gone);
        this.allies.forEach((a) => { if (a.flashT > 0) a.flashT -= dt; });
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#160a26'], [1, '#0a0614']]);
        g2.stars(t, 12, H * 0.5, 'rgba(200,180,240,.3)');
        for (const a of this.allies) {
          const flash = a.flashT > 0 && Math.floor(t * 10) % 2 === 0;
          c.globalAlpha = flash ? 0.35 : 1;
          c.fillStyle = a.col; c.beginPath(); c.arc(a.x, a.y - 8, 8, 0, 7); c.fill();
          c.fillRect(a.x - 8, a.y - 2, 16, 20);
          c.globalAlpha = 1;
          for (let i = 0; i < a.hp; i++) g2.roundRect(a.x - 15 + i * 12, a.y + 22, 8, 6, 2, a.col, null);
        }
        for (const m of this.monkeys) {
          if (m.gone) continue;
          const flap = Math.sin(t * 16 + m.x) * 3;
          c.fillStyle = '#4a3020';
          c.beginPath(); c.moveTo(m.x - 8 - flap, m.y); c.lineTo(m.x, m.y - 5); c.lineTo(m.x + 8 + flap, m.y); c.lineTo(m.x, m.y + 5); c.closePath(); c.fill();
        }
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,10,.7)', C.night, 1);
        api.txtCFit('REPELLED ' + this.repelled + '/' + this.need, W / 2, 8, 8, C.witchSkin, false, 140);
        api.vignette();
      },
    };
  }

  /* --- THE CASTLE p2 (boss): THE LAST BUCKET (dodge fire, splash the witch) --- */
  function waterSplash() {
    return {
      name: 'THE LAST BUCKET', boss: true,
      help: 'DRAG to dodge the flung torches · TAP to splash',
      winText: 'The Witch dissolves into a puddle on the castle floor. "You wicked girl!" is the last thing anyone hears her say.',
      loseText: 'The torches keep coming. Dorothy retreats, bucket empty, courage rattled.',
      init(api) {
        this.x = api.W / 2; this.hp = 3; this.dryness = 100; this.fires = []; this.spawnT = 0; this.hitFlash = 0; this.bucketCd = 0;
      },
      update(api, dt) {
        let dir = 0; if (api.keyDown('left')) dir -= 1; if (api.keyDown('right')) dir += 1;
        if (dir) this.x += dir * 150 * dt;
        else if (api.pointer.down) this.x += clamp(api.pointer.x - this.x, -150 * dt, 150 * dt);
        this.x = clamp(this.x, 20, api.W - 20);
        this.spawnT -= dt;
        if (this.spawnT <= 0) { this.spawnT = api.rnd(0.35, 0.6); this.fires.push({ x: api.rnd(20, api.W - 20), y: -10, speed: api.rnd(90, 140) }); }
        for (const f of this.fires) f.y += f.speed * dt;
        if (this.hitFlash <= 0) {
          for (const f of this.fires) {
            if (f.gone) continue;
            if (Math.abs(this.x - f.x) < 14 && Math.abs((api.H - 70) - f.y) < 16) {
              f.gone = true; this.hp--; this.hitFlash = 0.7; api.shake(5, 0.3); api.flash('#ff6a1a', 0.2); api.audio.sfx('hurt');
              if (this.hp <= 0) { api.lose(); return; }
            }
          }
        }
        this.fires = this.fires.filter((f) => !f.gone && f.y < api.H + 20);
        if (this.hitFlash > 0) this.hitFlash -= dt;
        if (this.bucketCd > 0) this.bucketCd -= dt;
        if (api.pointer.justDown && this.bucketCd <= 0) {
          this.bucketCd = 0.5; this.dryness -= 100 / 6; api.addScore(20); api.audio.sfx('coin'); api.burst(this.x, api.H - 70, C.sky, 8);
          if (this.dryness <= 0) { api.addScore(90); api.win(); return; }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        g2.verticalGradient(0, 0, W, H, [[0, '#2a1050'], [0.6, '#160a26'], [1, '#0a0614']]);
        const witchX = W / 2 + Math.sin(t * 0.9) * W * 0.28;
        c.fillStyle = C.witch; c.beginPath(); c.arc(witchX, 46, 10, 0, 7); c.fill();
        c.fillStyle = C.witchDark; c.beginPath(); c.moveTo(witchX - 14, 40); c.lineTo(witchX, 24); c.lineTo(witchX + 14, 40); c.closePath(); c.fill();
        for (const f of this.fires) { if (f.gone) continue; g2.flame(f.x, f.y, t + f.x, 0.6, { outer: '#ff6020', inner: '#ffb030' }); }
        if (!(this.hitFlash > 0 && Math.floor(t * 10) % 2 === 0)) {
          g2.bigSprite(DOROTHY_ROWS, this.x - 12, api.H - 106, DOROTHY_PAL, 3, { outline: true, shadow: true });
        }
        for (let i = 0; i < this.hp; i++) g2.roundRect(8 + i * 14, 20, 10, 10, 3, C.sky, null);
        g2.roundRect(6, H - 24, W - 12, 8, 3, C.night, null);
        g2.roundRect(6, H - 24, Math.round((W - 12) * (this.dryness / 100)), 8, 3, C.witch, null);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,10,.7)', C.night, 1);
        api.txtCFit('THE WITCH', W / 2, 8, 8, C.witch, false, 110);
        api.vignette();
      },
    };
  }

  /* --- THE EMERALD CITY (finale): THREE TAPS HOME (heel-click timing) --- */
  function heelClickHome() {
    return {
      name: 'THREE TAPS HOME', boss: true,
      help: 'TAP when the dial lands in the gold band — three times',
      winText: 'Three clicks, and the ground begins to spin beneath her feet.',
      loseText: 'The meter slips through her fingers — the shoes stay silent, and Kansas stays far away.',
      init(api) {
        this.need = 3; this.hits = 0;
        this.maxMistakes = 2 + (api.has('wideawake') ? 1 : 0);
        this.mistakes = 0;
        this.halfBand = 0.14 + (api.has('steadyfooting') ? 0.08 : 0);
        this.showHint = api.has('scarecrowwit');
        this.hasForgive = api.has('meltcourage'); this.forgiveUsed = false;
        this.meter = 0; this.mDir = 1; this.mSpd = 1.0;
      },
      update(api, dt) {
        this.meter += this.mDir * this.mSpd * dt;
        if (this.meter > 1) { this.meter = 1; this.mDir = -1; }
        if (this.meter < 0) { this.meter = 0; this.mDir = 1; }
        if (api.confirm()) {
          if (Math.abs(this.meter - 0.5) <= this.halfBand) {
            this.hits++; api.addScore(40); api.audio.sfx('coin');
            api.burst(api.W / 2, api.H - 90, C.ruby, 10); api.shake(2, 0.1);
            this.mSpd = Math.min(2.4, this.mSpd + 0.3);
            if (this.hits >= this.need) { api.addScore(100); api.win(); return; }
          } else if (this.hasForgive && !this.forgiveUsed) {
            this.forgiveUsed = true; api.flash('#8a6a10', 0.1);
          } else {
            this.mistakes++; api.shake(4, 0.2); api.flash('#7a3ad1', 0.15); api.audio.sfx('hurt');
            if (this.mistakes >= this.maxMistakes) { api.lose(); return; }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        ozTwilight(api, t, 0.1);
        g2.bigSprite(DOROTHY_ROWS, W / 2 - 12, H * 0.42, DOROTHY_PAL, 4, { outline: true, shadow: true });
        const mx = 24, my = H - 70, mw = W - 48;
        g2.roundRect(mx, my, mw, 10, 3, C.night, null);
        c.fillStyle = C.gold; c.globalAlpha = 0.6; c.fillRect(mx + (0.5 - this.halfBand) * mw, my, this.halfBand * 2 * mw, 10); c.globalAlpha = 1;
        if (this.showHint) g2.glow(mx + 0.5 * mw, my + 5, 6, C.greenBright, 0.5 + 0.3 * Math.sin(t * 5));
        c.fillStyle = C.cream; c.fillRect(mx + this.meter * mw - 2, my - 4, 4, 18);
        for (let i = 0; i < this.need; i++) g2.roundRect(W / 2 - 24 + i * 20, H - 96, 14, 14, 3, i < this.hits ? C.ruby : C.night, C.dim, 1);
        api.txtCFit('MISTAKES ' + this.mistakes + '/' + this.maxMistakes, W / 2, H - 44, 8, C.danger, false, 140);
        g2.roundRect(6, 4, W - 12, 15, 5, 'rgba(6,16,10,.7)', C.night, 1);
        api.txtCFit('CLICK ' + this.hits + '/' + this.need, W / 2, 8, 8, C.ruby, false, 100);
        api.vignette(); api.scanlines();
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'oz16', title: 'The Wizard of Oz', subtitle: 'THE PATCHWORK ROAD',
    currency: 'WISHES', accent: C.green, ownPhaseHud: true,
    titleFont: TITLE, uiFont: UI, superSample: 3,
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.green, blood: C.poppy, cream: C.cream, dim: C.dim, ink: C.ink },
    emblem, scenery(api, scene, t) { if (scene === 'hub') { quiltBG(api, t); return; } ozTwilight(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale' || scene === 'choice') ? 0.26 : 0); },
    menu, map: menu, renderBoot,
    mapHint: 'CHOOSE A PATCH', mapDone: 'THE ROAD LEADS HOME',
    screens: {
      overlay: 'rgba(6,16,10,.86)', win: C.green, lose: C.poppy, chapterLabel: C.dim,
      name: C.cream, sub: C.gold, intro: '#e6f5ea', quote: '#6a9a7a', help: C.green,
      score: C.cream, cur: C.gold, cta: C.cream,
    },
    labels: {
      chapter: 'PATCH', phase: 'STAGE', boss: 'THE RECKONING', score: 'WISHES',
      win: 'WISH GRANTED', lose: 'THE DREAM SLIPS', nextPhaseWin: 'HELD FAST',
      cont: 'TAP TO PRESS ON', toMap: 'TAP FOR THE QUILT', play: 'TAP TO BEGIN',
      nextPhase: 'TAP TO PRESS ON', toFinale: 'TAP FOR HOME',
    },
    upgrades: {
      steadyfooting: { name: 'STEADY FOOTING', desc: 'a wider window when the heels finally click' },
      scarecrowwit: { name: "THE SCARECROW'S WIT", desc: 'a helpful glimmer shows exactly when to click' },
      wideawake: { name: 'WIDE AWAKE', desc: 'one extra stumble forgiven at the finish' },
      meltcourage: { name: 'MELTED COURAGE', desc: 'the very first missed click is forgiven outright' },
    },
    nodes: [
      {
        id: 'kansas', name: 'THE CYCLONE', sub: 'A KANSAS SKY GONE GRAY', reward: 55, grant: 'steadyfooting',
        intro: ['A GRAY KANSAS SKY TURNS GREEN.', 'THE FARMHOUSE GROANS AND LIFTS —', 'DOROTHY AND TOTO SPIN INSIDE', "THE CYCLONE'S HOWLING WALL."],
        quote: 'The house whirled around two or three times and rose slowly through the air.',
        winText: 'The house settles with a bump. Outside the window, Kansas is nowhere to be seen.',
        phases: [cycloneSpin()],
      },
      {
        id: 'road', name: 'THE CORNFIELD WATCH', sub: 'THE YELLOW BRICK ROAD', needs: ['kansas'], reward: 60, grant: 'scarecrowwit',
        intro: ['A SCARECROW HANGS ON HIS POST,', 'BEGGING FOR A BRAIN OF HIS OWN.', 'HIS CROWS HAVE OTHER IDEAS.', 'Help him keep the field clear.'],
        quote: 'I have no brains at all, so I am going to Oz to beg for some.',
        winText: 'The crows scatter for good. The Scarecrow climbs down, grinning straw from ear to ear.',
        phases: [cornfieldDefense()],
      },
      {
        id: 'poppies', name: 'THE POPPY FIELD', sub: 'A DEADLY SWEET SLUMBER', needs: ['road'], reward: 65, grant: 'wideawake',
        intro: ['THE FIELD SMELLS SWEET AS SUGAR', 'AND JUST AS DANGEROUS. EYES GROW', 'HEAVY WITH EVERY STEP FORWARD.', 'Stay awake until the snow arrives.'],
        quote: 'If we leave her here she will die. The scent of the flowers is killing us all.',
        winText: 'Snow drifts down out of a clear sky, and the poppies lose their hold at last.',
        phases: [poppyDrowse()],
      },
      {
        id: 'witchtower', name: "THE WITCH'S CASTLE", sub: 'WINKIE COUNTRY', needs: ['poppies'], reward: 95, grant: 'meltcourage',
        intro: ['THE WICKED WITCH SENDS HER', 'WINGED MONKEYS SCREAMING DOWN', 'ON SCARECROW, TIN MAN AND LION.', 'Keep her from tearing them apart.'],
        quote: 'See what you have done! In a minute I shall melt away.',
        winText: 'The Witch dissolves into a puddle on the castle floor. "You wicked girl!" is the last thing anyone hears her say.',
        loseText: 'The torches keep coming. Dorothy retreats, bucket empty, courage rattled.',
        phases: [monkeyTriage(), waterSplash()],
      },
      {
        id: 'emerald', name: 'BEHIND THE CURTAIN', sub: 'THE EMERALD CITY', needs: ['witchtower'], reward: 130,
        intro: ['THE GREAT OZ ROARS FROM A', 'GIANT FLOATING HEAD OF SMOKE —', 'UNTIL TOTO TUGS BACK A CURTAIN', 'AND THE TRICK FALLS APART.'],
        quote: "I am a good man, but I'm a very bad Wizard, I must admit.",
        winText: 'Three clicks, and the ground begins to spin beneath her feet.',
        choice: {
          prompt: 'Toto tugs back a curtain — the Great and Powerful Oz is only a man pulling levers. What does Dorothy do?',
          hint: 'YOUR ANSWER SHAPES HOW THE TALE ENDS',
          options: [
            { label: 'Forgive the humbug', sub: 'A kind word for a frightened old showman', flag: 'kindheart',
              icon(api, x, y) { const c = api.ctx; c.fillStyle = C.gold; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); } },
            { label: 'Call out the fraud', sub: 'Say it plainly, in front of everyone', flag: 'braveheart',
              icon(api, x, y) { const c = api.ctx; c.strokeStyle = C.ruby; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 6, y - 6); c.lineTo(x + 6, y + 6); c.moveTo(x + 6, y - 6); c.lineTo(x - 6, y + 6); c.stroke(); } },
          ],
        },
        phases: [heelClickHome()],
      },
    ],
    endings: [
      { when: (f) => f.kindheart, title: 'A KIND GOODBYE', lines: ['The balloon lifts the old humbug away', 'with a wave and no hard feelings —', 'and three soft clicks carry Dorothy', 'home to a gray Kansas sky that,', 'somehow, looks a little brighter.'] },
      { when: (f) => f.braveheart, title: 'THE CURTAIN STAYS OPEN', lines: ['Word of the "wizard" spreads fast —', 'Oz laughs it off and packs his bags,', 'while the Scarecrow, the Tin Man and', 'the Lion stand taller for having seen', 'the trick. Three clicks, and she is gone.'] },
      { when: () => true, title: "THERE'S NO PLACE LIKE HOME", lines: ['The heels click three times, and Kansas', 'rises up to meet her — gray, familiar,', 'and exactly right.'] },
    ],
    finale: ['DOROTHY WAKES IN HER OWN BED, HOME AT LAST.'],
  });
})();
