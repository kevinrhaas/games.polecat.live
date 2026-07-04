/* ============================================================================
 * JOURNEY TO THE CENTER OF THE EARTH — Jules Verne (1864)
 * Rebuilt as a Verne descent resource-sim:
 *   1. THE SUPPLY DROP  — ration AIR / ROPE / LIGHT before descending
 *   2. THE GRANITE PASSAGE — navigate branching tunnels spending resources
 *   3. LIDENBROCK SEA   — catch rising oxygen bubbles to refuel AIR
 *   4. THE FOSSIL BEDS  — memory-match prehistoric creatures by torchlight
 *   5. THE ERUPTION     — operate pressure valves in sequence to ascend
 * Resources persist across chapters via closure. NES palette throughout.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── Persistent expedition resources ──────────────────────────────────── */
  const J = { air: 5, rope: 4, light: 5 };  // set by ch1, used in ch2-5

  /* ── NES-approximate palette ─────────────────────────────────────────── */
  const C = {
    void:   '#050200',
    rock0:  '#2a1400',
    rock1:  '#3c2008',
    rock2:  '#5a3818',
    gran:   '#787868',
    granL:  '#a8a898',
    amber:  '#f8a800',
    amberD: '#c86800',
    gold:   '#fcd878',
    cream:  '#f8f0d0',
    ocean:  '#0038a8',
    oceanL: '#3c98f8',
    crystal:'#58f8b8',
    gem:    '#00d8c8',
    lava:   '#f83800',
    lavaBr: '#f87800',
    smoke:  '#787060',
    airC:   '#58e8f8',
    ropeC:  '#c8a030',
    lightC: '#f8d800',
    moss:   '#28a820',
    bone:   '#e8d8a0',
    warn:   '#f82000',
    fossil1:'#c8a060',
    fossil2:'#50a850',
    fossil3:'#e84080',
    fossil4:'#9058e8',
    fossil5:'#4898f8',
    fossil6:'#f8a040',
  };

  /* ── Resource meter helper ────────────────────────────────────────────── */
  function resMeter(api, x, y, val, max, col, label) {
    const g = api.gfx;
    g.rect(x, y, max * 8, 6, C.rock0);
    g.rect(x, y, Math.max(0, val) * 8, 6, col);
    api.txtCFit(label, x + max * 8 + 20, y + 1, 5, col, true, 32);
  }

  /* ── Emblem: Verne compass + notebook ────────────────────────────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    g.rect(cx - 18, cy - 22, 36, 44, C.cream);
    g.rect(cx - 16, cy - 20, 32, 40, '#e8dca8');
    for (let i = 0; i < 5; i++) g.rect(cx - 12, cy - 12 + i * 7, 24, 1, C.rock1);
    g.circle(cx + 6, cy - 10, 10, C.rock2);
    g.circle(cx + 6, cy - 10, 8, C.void);
    c.strokeStyle = C.amber; c.lineWidth = 1;
    c.beginPath(); c.arc(cx + 6, cy - 10, 8, 0, Math.PI * 2); c.stroke();
    g.rect(cx + 5, cy - 17, 2, 8, C.warn);
    g.rect(cx + 5, cy - 10, 2, 8, C.granL);
    api.txtC('VERNE', cx - 2, cy + 12, 5, C.amberD, true);
    api.txtC('1864', cx - 2, cy + 20, 5, C.rock2, true);
  }

  /* ── Scenery: geological cross-section backdrops ─────────────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      c.fillStyle = '#1858a8'; c.fillRect(0, 0, W, 35);
      c.fillStyle = '#3878c8'; c.fillRect(0, 28, W, 14);
      c.fillStyle = '#503828'; c.fillRect(0, 42, W, 53);
      c.fillStyle = C.gran;
      for (let i = 0; i < 60; i++) {
        if ((i * 7 + Math.floor(t)) % 5 < 2)
          c.fillRect(4 + (i * 43) % (W - 8), 44 + (i * 31) % 49, 2, 1);
      }
      c.fillStyle = '#382010'; c.fillRect(0, 95, W, 95);
      c.fillStyle = C.rock2;
      for (let i = 0; i < 70; i++) {
        if ((i * 11 + 3) % 4 < 2)
          c.fillRect(2 + (i * 37) % (W - 4), 97 + (i * 53) % 89, 3, 2);
      }
      c.fillStyle = C.ocean; c.fillRect(0, 190, W, 95);
      const wt = Math.floor(t * 3) % 3;
      c.fillStyle = C.oceanL;
      for (let i = 0; i < 12; i++)
        c.fillRect(4 + (i * 22 + wt * 7) % (W - 8), 195 + (i * 19) % 80, 8, 2);
      c.fillStyle = '#1c1208'; c.fillRect(0, 285, W, 95);
      c.fillStyle = C.bone;
      for (let i = 0; i < 20; i++)
        c.fillRect(6 + (i * 59) % (W - 12), 288 + (i * 41) % 88, 5, 2);
      c.fillStyle = '#280000'; c.fillRect(0, 380, W, 100);
      c.fillStyle = C.lava;
      const lt = Math.floor(t * 4) % 4;
      for (let i = 0; i < 10; i++)
        c.fillRect(8 + (i * 27 + lt * 5) % (W - 16), 384 + (i * 37) % 90, 4, 3);
      c.fillStyle = C.lavaBr;
      for (let i = 0; i < 6; i++)
        c.fillRect(12 + (i * 43 + lt * 3) % (W - 24), 390 + (i * 29) % 80, 2, 2);
      const dY = [48, 130, 232, 318, 415];
      ['0 km', '3 km', '8 km', '12 km', '40 km'].forEach((d, i) => {
        c.globalAlpha = 0.55;
        api.txtC(d, 18, dY[i], 5, C.cream, true);
        c.globalAlpha = 1;
      });
      [95, 190, 285, 380].forEach(dy => {
        c.strokeStyle = C.amberD; c.lineWidth = 1;
        c.setLineDash([3, 4]);
        c.beginPath(); c.moveTo(0, dy); c.lineTo(W, dy); c.stroke();
        c.setLineDash([]);
      });
      return;
    }

    if (scene === 'boot' || scene === 'finale') {
      c.fillStyle = C.void; c.fillRect(0, 0, W, H);
      const bands = [C.rock0, '#2e1808', '#3a2210', C.rock1, '#200000'];
      bands.forEach((col, i) => {
        c.fillStyle = col;
        c.fillRect(0, i * (H / 5), W, H / 5 + 1);
      });
      const gx = W / 2, gy = H * 0.45;
      [38, 28, 18, 10].forEach((r, i) => {
        c.globalAlpha = 0.08 + i * 0.04;
        c.fillStyle = C.amber;
        c.beginPath(); c.arc(gx, gy, r, 0, Math.PI * 2); c.fill();
      });
      c.globalAlpha = 1;
      for (let i = 0; i < 8; i++) {
        const sx = 14 + i * 34, sh = 18 + (i * 13) % 22;
        g.rect(sx - 2, 0, 4, sh, C.rock2);
        g.rect(sx - 1, sh - 4, 2, 4, C.gran);
      }
      for (let i = 0; i < 6; i++) {
        const cx2 = 18 + i * 44, cy2 = H - 12;
        c.strokeStyle = C.crystal; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(cx2, cy2); c.lineTo(cx2 - 4, cy2 - 14); c.lineTo(cx2 + 4, cy2 - 14); c.closePath(); c.stroke();
      }
      return;
    }

    c.fillStyle = C.rock0; c.fillRect(0, 0, W, H);
    c.fillStyle = C.rock1;
    for (let i = 0; i < 30; i++)
      c.fillRect((i * 89 + 7) % W, (i * 67 + 11) % H, 2, 1);
  }

  /* ── Menu: strata map with stone-plaque chapter nodes ────────────────── */
  const STRATA_LAYOUT = [
    { x: 40, y:  48, w: 190, h: 42 },
    { x: 40, y: 143, w: 190, h: 42 },
    { x: 40, y: 238, w: 190, h: 42 },
    { x: 40, y: 333, w: 190, h: 42 },
    { x: 40, y: 420, w: 190, h: 42 },
  ];

  const PLAQUE_COLS = ['#786858', '#686050', C.ocean, '#302010', '#500010'];

  const menu = {
    colors: { title: C.gold, label: C.amber, cur: C.cream, hint: C.amberD,
              panel: C.rock1, panelSel: C.rock2, border: C.amberD,
              name: C.cream, nameDone: C.crystal, sub: C.granL },

    layout(api, chapters) { return STRATA_LAYOUT; },

    title(api, respect) {
      const x0 = 12, y0 = api.H - 52;
      resMeter(api, x0, y0,      J.air,   8, C.airC,   'AIR');
      resMeter(api, x0, y0 + 12, J.rope,  6, C.ropeC,  'ROPE');
      resMeter(api, x0, y0 + 24, J.light, 6, C.lightC, 'LIGHT');
      api.txtCFit('EXPEDITION  ' + respect, api.W / 2, api.H - 18, 7, C.amber, true, api.W - 20);
    },

    card(api, { ch, i, x, y, w, h, sel, done, best }) {
      const g = api.gfx, c = api.ctx;
      const pc = PLAQUE_COLS[i];
      g.rect(x, y, w, h, pc);
      c.strokeStyle = sel ? C.amber : C.amberD;
      c.lineWidth = sel ? 2 : 1;
      c.strokeRect(x + 1, y + 1, w - 2, h - 2);
      c.strokeStyle = C.rock0; c.lineWidth = 1;
      c.setLineDash([2, 5]);
      c.beginPath();
      c.moveTo(x + 12, y + 4); c.lineTo(x + 30, y + h - 6);
      c.moveTo(x + w - 18, y + 8); c.lineTo(x + w - 8, y + h - 4);
      c.stroke(); c.setLineDash([]);
      const numCol = done ? C.crystal : (sel ? C.gold : C.granL);
      api.txtC('' + (i + 1), x + 16, y + h / 2 - 5, 9, numCol, true);
      api.txtCFit(ch.name, x + 32, y + 7, 7, done ? C.crystal : (sel ? C.cream : C.granL), true, w - 44);
      api.txtCFit(ch.sub, x + 32, y + 22, 5, C.smoke, true, w - 44);
      if (done) {
        api.txtC('✓', x + w - 16, y + h / 2 - 6, 9, C.crystal, true);
        api.txtC('' + best, x + w - 16, y + h / 2 + 4, 6, C.gem, true);
      } else if (sel) {
        if (Math.floor(api.t * 3) % 2 === 0)
          api.txtC('▶', x + w - 14, y + h / 2 - 5, 9, C.amber, true);
      }
    },
  };

  /* ── Chapter icons ────────────────────────────────────────────────────── */
  function drawIcon(api, x, y, idx) {
    const g = api.gfx, c = api.ctx;
    if (idx === 0) {
      g.rect(x - 8, y - 4, 16, 10, C.amberD);
      g.rect(x - 6, y - 2, 12, 6, C.amber);
      g.rect(x - 1, y - 4, 2, 10, C.rock0);
    } else if (idx === 1) {
      g.rect(x - 1, y - 8, 2, 8, C.gran);
      g.rect(x - 7, y, 6, 2, C.gran);
      g.rect(x + 1, y, 6, 2, C.gran);
    } else if (idx === 2) {
      c.strokeStyle = C.oceanL; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x - 8, y + 3); c.quadraticCurveTo(x - 2, y - 3, x + 4, y + 3); c.stroke();
      g.circle(x + 6, y - 5, 4, C.crystal);
    } else if (idx === 3) {
      g.circle(x - 5, y, 4, C.bone);
      g.rect(x - 5, y - 1, 10, 2, C.bone);
      g.circle(x + 5, y, 4, C.bone);
    } else {
      g.circle(x, y - 2, 7, C.rock2);
      g.circle(x, y - 2, 5, C.void);
      g.rect(x - 1, y - 8, 2, 5, C.warn);
      g.rect(x - 3, y + 2, 6, 3, C.amberD);
    }
  }

  /* ── Chapters ─────────────────────────────────────────────────────────── */
  const chapters = [

    /* ─── CHAPTER 1: THE SUPPLY DROP — resource allocation ─── */
    {
      id: 'supply', name: 'The Supply Drop',
      sub: 'Snæfellsjökull · 0 km',
      intro: [
        'At the crater rim of Snæfellsjökull,',
        'Professor Lidenbrock divides the provisions.',
        'Three resources must last the descent:',
        'AIR canisters, ROPE coils, and LIGHT torches.',
        'You have twelve supply points.',
        'Choose wisely — they shape every chapter ahead.',
      ],
      quote: '"The only certain thing about the future is that it will surprise us." — Jules Verne',
      help: 'TAP + / − to allocate · TAP DESCEND when ready',
      winText: 'The provisions are secured. The crater opens below.',
      loseText: 'The supplies are left behind. Back to the surface.',
      icon(api, x, y) { drawIcon(api, x, y, 0); },
      init(api) {
        this.air   = 5;
        this.rope  = 4;
        this.light = 3;
        this.total = 12;
        this.confirmed = false;
        this.showHelp = 0;
      },
      update(api, dt) {
        if (this.confirmed) {
          this.showHelp += dt;
          if (this.showHelp > 0.8) {
            J.air   = this.air;
            J.rope  = this.rope;
            J.light = this.light;
            api.addScore(80 + this.air * 4 + this.rope * 3 + this.light * 3);
            api.win();
          }
          return;
        }
        const ptr = api.pointer;
        if (!ptr.justDown) return;
        const rows = [
          { key: 'air',   min: 2, max: 7, y: 175 },
          { key: 'rope',  min: 1, max: 6, y: 225 },
          { key: 'light', min: 1, max: 6, y: 275 },
        ];
        const used = this.air + this.rope + this.light;
        rows.forEach(row => {
          if (ptr.y >= row.y - 12 && ptr.y <= row.y + 18) {
            if (ptr.x >= 44 && ptr.x <= 88) {
              if (this[row.key] > row.min) { this[row.key]--; api.audio.sfx('blip'); }
            } else if (ptr.x >= 100 && ptr.x <= 144) {
              if (this[row.key] < row.max && used < this.total) { this[row.key]++; api.audio.sfx('blip'); }
            }
          }
        });
        if (ptr.y >= 328 && ptr.y <= 364 && ptr.x >= 55 && ptr.x <= 215) {
          this.confirmed = true;
          api.audio.sfx('select');
          api.flash(C.amber, 0.3);
        }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
        c.fillStyle = '#0a0604'; c.fillRect(0, 0, W, H);
        c.fillStyle = C.rock1;
        c.beginPath(); c.moveTo(0, H * 0.55); c.lineTo(W * 0.28, H * 0.25); c.lineTo(W * 0.38, H * 0.32); c.lineTo(W * 0.38, H * 0.55); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(W, H * 0.55); c.lineTo(W * 0.72, H * 0.25); c.lineTo(W * 0.62, H * 0.32); c.lineTo(W * 0.62, H * 0.55); c.closePath(); c.fill();
        c.fillStyle = C.void; c.fillRect(W * 0.38, H * 0.3, W * 0.24, H * 0.55);
        c.fillStyle = C.cream;
        c.beginPath(); c.moveTo(W * 0.28, H * 0.25); c.lineTo(W * 0.38, H * 0.3); c.lineTo(W * 0.36, H * 0.35); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(W * 0.72, H * 0.25); c.lineTo(W * 0.62, H * 0.3); c.lineTo(W * 0.64, H * 0.35); c.closePath(); c.fill();
        c.fillStyle = '#184888'; c.fillRect(0, 0, W, H * 0.25);
        c.fillStyle = '#2a5898'; c.fillRect(0, 0, W, H * 0.12);
        c.fillStyle = C.cream;
        [[18,8],[52,18],[90,6],[140,14],[200,9],[234,22],[22,28],[168,25]].forEach(([sx,sy]) => {
          c.fillRect(sx, sy, 2, 1); c.fillRect(sx + 1, sy - 1, 1, 3);
        });
        api.txtCFit('SUPPLY ALLOCATION', W / 2, 100, 9, C.gold, true, W - 20);
        api.txtCFit('Distribute 12 points', W / 2, 118, 7, C.cream, true, W - 30);
        const used = this.air + this.rope + this.light;
        api.txtCFit('REMAINING: ' + (this.total - used), W / 2, 134, 7,
          used < this.total ? C.amber : C.crystal, true, W - 20);

        const rows = [
          { key: 'air',   label: 'AIR',   col: C.airC,   max: 7, y: 175 },
          { key: 'rope',  label: 'ROPE',  col: C.ropeC,  max: 6, y: 225 },
          { key: 'light', label: 'LIGHT', col: C.lightC, max: 6, y: 275 },
        ];
        rows.forEach(row => {
          api.txtCFit(row.label, 24, row.y, 6, row.col, true, 36);
          g.rect(44, row.y - 8, 40, 26, C.rock2);
          c.strokeStyle = C.gran; c.lineWidth = 1; c.strokeRect(44, row.y - 8, 40, 26);
          api.txtC('−', 64, row.y + 1, 9, C.cream, true);
          g.rect(100, row.y - 8, 40, 26, C.rock2);
          c.strokeStyle = C.gran; c.lineWidth = 1; c.strokeRect(100, row.y - 8, 40, 26);
          api.txtC('+', 120, row.y + 1, 9, C.cream, true);
          const val = this[row.key];
          for (let i = 0; i < row.max; i++) {
            c.fillStyle = i < val ? row.col : C.rock1;
            c.fillRect(152 + i * 14, row.y - 4, 11, 18);
          }
          api.txtC('' + val, 252, row.y + 1, 8, row.col, true);
        });
        g.rect(55, 328, 160, 36, this.confirmed ? C.amberD : C.rock2);
        c.strokeStyle = C.amber; c.lineWidth = 2; c.strokeRect(55, 328, 160, 36);
        api.txtCFit('DESCEND', W / 2, 341, 9, C.gold, true, 150);
      },
    },

    /* ─── CHAPTER 2: THE GRANITE PASSAGE — branching tunnel navigation ─── */
    {
      id: 'tunnel', name: 'Granite Passage',
      sub: 'Volcanic lava tubes · 3 km',
      intro: [
        'The passages branch endlessly.',
        'Professor Lidenbrock\'s compass spins —',
        'magnetite in the rock walls confounds it.',
        'Navigate by rope and torchlight.',
        'Every step burns precious AIR.',
        'Rope bridges cross the deep shafts.',
      ],
      quote: '"Science, my lad, is made up of mistakes, but they are useful mistakes." — Jules Verne',
      help: 'ARROWS or DRAG to move · gaps need ROPE · dark tiles cost LIGHT',
      winText: 'The deep gallery opens. The underground sea glimmers ahead.',
      loseText: 'The air runs out. Retreat and rest before descending again.',
      icon(api, x, y) { drawIcon(api, x, y, 1); },
      init(api) {
        // 7×11 grid: 0=open, 1=wall, 2=dark(costs LIGHT), 3=gap(needs ROPE)
        this.grid = [
          [1,1,1,0,1,1,1],
          [1,0,0,0,0,0,1],
          [1,0,1,2,1,0,1],
          [1,0,1,2,1,0,1],
          [1,0,0,3,0,0,1],
          [1,1,0,1,0,1,1],
          [1,0,0,1,0,0,1],
          [1,0,2,1,2,0,1],
          [1,0,0,0,0,0,1],
          [1,1,0,1,0,1,1],
          [1,1,1,0,1,1,1],
        ];
        this.px = 3; this.py = 0;
        this.goalX = 3; this.goalY = 10;
        this.airLeft   = Math.max(3, J.air);
        this.ropeLeft  = Math.max(1, J.rope);
        this.lightLeft = Math.max(1, J.light);
        this.steps = 0;
        this.moveCooldown = 0;
        this.msg = ''; this.msgT = 0;
        this.done = false;
        this.COLS = 7; this.ROWS = 11;
        this.TW = 34; this.TH = 38;
        this.offX = Math.floor((api.W - 7 * 34) / 2);
        this.offY = 56;
        this._dragX = undefined; this._dragY = undefined;
      },
      update(api, dt) {
        if (this.done) return;
        this.moveCooldown -= dt;
        if (this.msgT > 0) this.msgT -= dt;

        const tryMove = (dx, dy) => {
          if (this.moveCooldown > 0) return;
          const nx = this.px + dx, ny = this.py + dy;
          if (nx < 0 || nx >= this.COLS || ny < 0 || ny >= this.ROWS) return;
          const tile = this.grid[ny][nx];
          if (tile === 1) { api.shake(3, 0.1); return; }
          if (tile === 3) {
            if (this.ropeLeft <= 0) {
              this.msg = 'NO ROPE!'; this.msgT = 1.2;
              api.shake(4, 0.12); api.audio.sfx('hurt'); return;
            }
            this.ropeLeft--;
            this.msg = 'ROPE USED'; this.msgT = 0.9;
            api.audio.sfx('jump');
          }
          if (tile === 2) {
            if (this.lightLeft > 0) {
              this.lightLeft--;
              this.msg = 'TORCH SPENT'; this.msgT = 0.9;
              api.audio.sfx('coin');
            }
          }
          this.px = nx; this.py = ny;
          this.airLeft--;
          this.steps++;
          this.moveCooldown = 0.18;
          api.audio.sfx('blip');
          if (this.airLeft <= 0) { this.done = true; api.lose(); return; }
          if (this.px === this.goalX && this.py === this.goalY) {
            api.addScore(60 + this.airLeft * 6 + this.ropeLeft * 4 + this.lightLeft * 4);
            J.air   = Math.max(1, this.airLeft);
            J.rope  = Math.max(0, this.ropeLeft);
            J.light = Math.max(0, this.lightLeft);
            this.done = true;
            api.flash(C.crystal, 0.4);
            api.win();
          }
        };

        if (api.keyPressed('up')    || api.keyDown('up'))    tryMove(0, -1);
        if (api.keyPressed('down')  || api.keyDown('down'))  tryMove(0,  1);
        if (api.keyPressed('left')  || api.keyDown('left'))  tryMove(-1, 0);
        if (api.keyPressed('right') || api.keyDown('right')) tryMove(1,  0);

        const ptr = api.pointer;
        if (ptr.justDown) { this._dragX = ptr.x; this._dragY = ptr.y; }
        if (!ptr.down && this._dragX !== undefined) {
          const dx = ptr.x - this._dragX, dy = ptr.y - this._dragY;
          if (Math.abs(dx) > 14 || Math.abs(dy) > 14) {
            if (Math.abs(dx) > Math.abs(dy)) tryMove(dx > 0 ? 1 : -1, 0);
            else tryMove(0, dy > 0 ? 1 : -1);
          }
          this._dragX = undefined;
        }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
        const ox = this.offX, oy = this.offY;
        const TW = this.TW, TH = this.TH;
        c.fillStyle = '#0a0604'; c.fillRect(0, 0, W, H);
        g.rect(0, 0, W, 52, C.rock0);
        api.txtCFit('DEPTH 3 km — GRANITE GALLERY', W / 2, 8, 7, C.amberD, true, W - 8);
        resMeter(api, 8, 22,      this.airLeft,   8, C.airC,   'AIR');
        resMeter(api, 8, 34, this.ropeLeft,  5, C.ropeC,  'ROPE');
        // second column for LIGHT
        resMeter(api, 140, 22, this.lightLeft, 5, C.lightC, 'LIGHT');
        api.txtCFit('STEPS ' + this.steps, 140, 36, 6, C.amberD, true, 80);

        for (let row = 0; row < this.ROWS; row++) {
          for (let col = 0; col < this.COLS; col++) {
            const tx = ox + col * TW, ty = oy + row * TH;
            const tile = this.grid[row][col];
            if (tile === 1) {
              g.rect(tx, ty, TW, TH, C.rock1);
              c.strokeStyle = C.rock0; c.lineWidth = 1; c.strokeRect(tx, ty, TW, TH);
              if ((col + row) % 2 === 0) { c.fillStyle = C.rock2; c.fillRect(tx + 2, ty + 2, 4, 3); }
            } else {
              g.rect(tx, ty, TW, TH, C.void);
              c.strokeStyle = C.rock0; c.lineWidth = 1; c.strokeRect(tx, ty, TW, TH);
              if (tile === 2) {
                g.rect(tx + 2, ty + 2, TW - 4, TH - 4, '#0c0808');
                api.txtC('?', tx + TW / 2 - 3, ty + TH / 2 - 5, 7, C.amberD, true);
              } else if (tile === 3) {
                g.rect(tx + 2, ty + 2, TW - 4, TH - 4, C.ocean);
                api.txtC('~', tx + TW / 2 - 4, ty + TH / 2 - 5, 8, C.oceanL, true);
              }
              if (col === this.goalX && row === this.goalY) {
                g.circle(tx + TW / 2, ty + TH / 2, 9, C.crystal);
                api.txtC('▼', tx + TW / 2 - 5, ty + TH / 2 - 6, 8, C.void, true);
              }
            }
          }
        }
        // Player
        const px = ox + this.px * TW + TW / 2;
        const py = oy + this.py * TH + TH / 2;
        g.circle(px, py - 6, 6, C.amberD);
        g.rect(px - 5, py - 2, 10, 12, '#c89060');
        g.rect(px - 3, py + 10, 3, 8, '#8a6030');
        g.rect(px, py + 10, 3, 8, '#8a6030');
        c.globalAlpha = 0.18; c.fillStyle = C.amber;
        c.beginPath(); c.arc(px, py - 6, 18, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 1;

        if (this.msgT > 0) {
          c.globalAlpha = Math.min(1, this.msgT);
          api.txtCFit(this.msg, W / 2, H - 68, 9, C.warn, true, W - 20);
          c.globalAlpha = 1;
        }
        api.txtCFit('AIR LEFT: ' + this.airLeft, W / 2, H - 20, 6, C.airC, true, W - 20);
      },
    },

    /* ─── CHAPTER 3: LIDENBROCK SEA — catch rising oxygen bubbles ─── */
    {
      id: 'sea', name: 'Lidenbrock Sea',
      sub: 'Underground ocean · 8 km',
      intro: [
        'The sea stretches beyond the horizon,',
        'lit by electric phosphorescence.',
        'Hans spots oxygen pockets rising',
        'from volcanic vents on the ocean floor.',
        'Catch them in the collection flask.',
        'Beware the luminous sea creatures.',
      ],
      quote: '"The sea itself seemed to be carrying us along at full speed." — Jules Verne',
      help: 'TAP or press A when a bubble enters the CATCH RING',
      winText: 'The flasks are full. The fossil galleries glimmer ahead.',
      loseText: 'Too many creatures fouled the net. Rest on the raft.',
      icon(api, x, y) { drawIcon(api, x, y, 2); },
      init(api) {
        this.bubbles = [];
        this.creatures = [];
        this.caught = 0;
        this.needed = 8;
        this.misses = 0;
        this.maxMisses = 3;
        this.spawnT = 0;
        this.creatureT = 0;
        this.ringY = api.H * 0.28;
        this.ringR = 32;
        this.timer = 55;
        this.done = false;
        this.flashT = 0;
        this.raftX = api.W / 2;
      },
      update(api, dt) {
        if (this.done) return;
        this.timer -= dt;
        this.flashT = Math.max(0, this.flashT - dt);
        if (this.timer <= 0 && this.caught < this.needed) { this.done = true; api.lose(); return; }

        this.spawnT -= dt;
        if (this.spawnT <= 0) {
          this.spawnT = 1.4 + Retro.util.rand(0, 0.7);
          this.bubbles.push({
            x: api.W * 0.16 + Retro.util.rand(0, api.W * 0.68),
            y: api.H + 12,
            vy: -(42 + Retro.util.rand(0, 22)),
            r: 8 + Retro.util.rand(0, 4),
            popped: false,
          });
        }
        this.creatureT -= dt;
        if (this.creatureT <= 0) {
          this.creatureT = 3.0 + Retro.util.rand(0, 1.5);
          this.creatures.push({
            x: api.W * 0.1 + Retro.util.rand(0, api.W * 0.8),
            y: api.H + 20,
            vy: -(28 + Retro.util.rand(0, 18)),
            r: 12,
            alive: true,
          });
        }

        this.bubbles.forEach(b => { if (!b.popped) b.y += b.vy * dt; });
        this.bubbles = this.bubbles.filter(b => b.y > -20 && !b.popped);
        this.creatures.forEach(cr => { if (cr.alive) cr.y += cr.vy * dt; });
        this.creatures = this.creatures.filter(cr => cr.y > -30 && cr.alive);

        const ptr = api.pointer;
        const targetX = ptr.down ? ptr.x : api.W / 2;
        this.raftX = clamp(this.raftX + (targetX - this.raftX) * 3 * dt, 30, api.W - 30);

        if (api.keyPressed('a') || ptr.justDown) {
          let caught = false;
          this.bubbles.forEach(b => {
            if (b.popped) return;
            const dx = b.x - this.raftX, dy = b.y - this.ringY;
            if (Math.sqrt(dx * dx + dy * dy) < this.ringR + b.r) {
              b.popped = true; this.caught++; caught = true;
              api.burst(b.x, b.y, C.crystal, 8); api.audio.sfx('coin');
              if (this.caught >= this.needed) {
                this.done = true;
                J.air = Math.min(8, J.air + 3);
                api.addScore(100 + this.caught * 10);
                api.flash(C.oceanL, 0.5); api.win();
              }
            }
          });
          if (!caught) {
            let hitCreature = false;
            this.creatures.forEach(cr => {
              if (!cr.alive) return;
              const dx = cr.x - this.raftX, dy = cr.y - this.ringY;
              if (Math.sqrt(dx * dx + dy * dy) < this.ringR + cr.r) {
                cr.alive = false; hitCreature = true;
              }
            });
            if (!hitCreature) {
              this.misses++; this.flashT = 0.4;
              api.shake(3, 0.12); api.audio.sfx('hurt');
              if (this.misses >= this.maxMisses) { this.done = true; api.lose(); }
            }
          }
        }
        this.creatures.forEach(cr => {
          if (!cr.alive) return;
          const dy = cr.y - this.ringY;
          if (Math.abs(dy) < 8 && Math.abs(cr.x - this.raftX) < this.ringR + cr.r) {
            cr.alive = false;
            this.misses++;
            api.shake(5, 0.2); api.audio.sfx('hurt');
            this.flashT = 0.5;
            if (this.misses >= this.maxMisses) { this.done = true; api.lose(); }
          }
        });
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
        c.fillStyle = '#001848'; c.fillRect(0, 0, W, H);
        c.fillStyle = C.ocean; c.fillRect(0, H * 0.1, W, H);
        c.fillStyle = C.oceanL;
        const wt = Math.floor(api.t * 3) % 4;
        for (let i = 0; i < 8; i++)
          c.fillRect((i * 37 + wt * 9) % (W - 20), H * 0.12 + (i * 51) % (H * 0.75), 18, 2);
        c.fillStyle = C.gem; c.globalAlpha = 0.25;
        for (let i = 0; i < 6; i++) c.fillRect(10 + i * 44, H - 22, 8, 6);
        c.globalAlpha = 1;

        const rx = Math.round(this.raftX);
        g.rect(rx - 28, H * 0.42, 56, 10, '#7a4c18');
        g.rect(rx - 24, H * 0.42 - 2, 48, 5, '#9a6a28');
        g.rect(rx - 3, H * 0.42 - 18, 6, 18, '#5a3010');
        g.circle(rx, H * 0.1, 14, '#e8d080');
        g.rect(rx - 10, H * 0.1, 20, 14, '#e8d040');

        c.strokeStyle = this.flashT > 0 ? C.warn : C.crystal;
        c.lineWidth = 2;
        c.beginPath(); c.arc(rx, this.ringY, this.ringR, 0, Math.PI * 2); c.stroke();

        this.bubbles.forEach(b => {
          if (b.popped) return;
          g.circle(b.x, b.y, b.r, C.crystal);
          c.globalAlpha = 0.5;
          g.circle(b.x - 2, b.y - 2, Math.floor(b.r * 0.45), '#a8f8f8');
          c.globalAlpha = 1;
        });
        this.creatures.forEach(cr => {
          if (!cr.alive) return;
          g.circle(cr.x, cr.y, cr.r, '#e040a0');
          c.strokeStyle = '#f880c8'; c.lineWidth = 1;
          c.beginPath(); c.arc(cr.x, cr.y, cr.r, 0, Math.PI * 2); c.stroke();
          for (let i = 0; i < 4; i++) {
            const ta = i * Math.PI / 2 + api.t * 1.2;
            c.beginPath();
            c.moveTo(cr.x + Math.cos(ta) * cr.r, cr.y + cr.r);
            c.lineTo(cr.x + Math.cos(ta) * cr.r * 0.7, cr.y + cr.r + 8);
            c.stroke();
          }
        });

        g.rect(0, 0, W, 44, C.rock0);
        api.txtCFit('LIDENBROCK SEA · 8 km', W / 2, 6, 7, C.amberD, true, W - 8);
        resMeter(api, 8, 18, this.caught, this.needed, C.crystal, 'CAUGHT');
        for (let i = 0; i < this.maxMisses; i++) {
          c.fillStyle = i < this.misses ? C.warn : C.rock2;
          c.fillRect(W - 24 + i * (-10), 18, 8, 8);
        }
        api.txtCFit('TIME ' + Math.ceil(Math.max(0, this.timer)), W - 52, 30, 6, C.amber, true, 44);
      },
    },

    /* ─── CHAPTER 4: THE FOSSIL BEDS — memory matching ─── */
    {
      id: 'fossils', name: 'The Fossil Beds',
      sub: 'Prehistoric strata · 12 km',
      intro: [
        'In the torch-lit galleries, giant fossils',
        'are embedded deep in the wall.',
        'Hans traces bones of creatures extinct',
        'for a million years.',
        'Match each prehistoric creature',
        'before the torches burn out.',
      ],
      quote: '"All human wisdom is contained in two words — wait and hope." — Alexandre Dumas (used by Verne)',
      help: 'TAP two tiles to flip them · match all pairs before torches run out',
      winText: 'The fossil gallery mapped. Science triumphs over darkness.',
      loseText: 'The torches gutter out. The fossils wait in the dark.',
      icon(api, x, y) { drawIcon(api, x, y, 3); },
      init(api) {
        const names  = ['ICHTHY', 'PLESIO', 'PTEROD', 'MAMMTH', 'TRILOBT', 'MEGATH'];
        const cols   = [C.fossil1, C.fossil2, C.fossil3, C.fossil6, C.fossil5, C.fossil4];
        this.tiles = [];
        const shapes = [0, 1, 2, 3, 4, 5];
        const pairs  = [...shapes, ...shapes];
        for (let i = pairs.length - 1; i > 0; i--) {
          const j = Math.floor(Retro.util.rand(0, 0.9999) * (i + 1));
          [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }
        pairs.forEach((shape, i) => {
          this.tiles.push({ shape, name: names[shape], col: cols[shape], flipped: false, matched: false });
        });
        this.selected = [];
        this.flipT = 0;
        this.flipping = false;
        this.lightLeft = Math.max(2, J.light);
        this.matched = 0;
        this.done = false;
        this.COLS = 4; this.ROWS = 3;
        this.TW = 58; this.TH = 74;
        this.offX = (270 - 4 * 58) / 2;
        this.offY = 62;
      },
      update(api, dt) {
        if (this.done) return;
        if (this.flipping) {
          this.flipT -= dt;
          if (this.flipT <= 0) {
            this.flipping = false;
            const [a, b] = this.selected;
            if (this.tiles[a].shape === this.tiles[b].shape) {
              this.tiles[a].matched = this.tiles[b].matched = true;
              this.matched++;
              const ax = this.offX + (a % 4) * this.TW + this.TW / 2;
              const ay = this.offY + Math.floor(a / 4) * this.TH + this.TH / 2;
              api.burst(ax, ay, C.crystal, 6);
              api.audio.sfx('coin');
              if (this.matched >= 6) {
                this.done = true;
                api.addScore(80 + this.lightLeft * 8);
                J.light = Math.max(0, this.lightLeft);
                api.flash(C.amber, 0.5); api.win();
              }
            } else {
              this.tiles[a].flipped = false;
              this.tiles[b].flipped = false;
              this.lightLeft--;
              api.audio.sfx('hurt');
              if (this.lightLeft <= 0) { this.done = true; api.lose(); }
            }
            this.selected = [];
          }
          return;
        }
        const ptr = api.pointer;
        if (!ptr.justDown) return;
        const col = Math.floor((ptr.x - this.offX) / this.TW);
        const row = Math.floor((ptr.y - this.offY) / this.TH);
        if (col < 0 || col >= this.COLS || row < 0 || row >= this.ROWS) return;
        const idx = row * this.COLS + col;
        if (idx >= 12) return;
        const tile = this.tiles[idx];
        if (tile.flipped || tile.matched) return;
        tile.flipped = true;
        this.selected.push(idx);
        api.audio.sfx('blip');
        if (this.selected.length === 2) { this.flipping = true; this.flipT = 1.1; }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
        c.fillStyle = '#050200'; c.fillRect(0, 0, W, H);
        c.fillStyle = '#1a0e06';
        for (let i = 0; i < 40; i++)
          c.fillRect(2 + (i * 67) % (W - 4), 2 + (i * 53) % (H - 4), 3, 1);

        for (let i = 0; i < 12; i++) {
          const col = i % this.COLS, row = Math.floor(i / this.COLS);
          const tx = this.offX + col * this.TW;
          const ty = this.offY + row * this.TH;
          const tile = this.tiles[i];
          if (tile.matched) {
            g.rect(tx + 2, ty + 2, this.TW - 4, this.TH - 4, tile.col);
            c.strokeStyle = C.crystal; c.lineWidth = 1.5; c.strokeRect(tx + 2, ty + 2, this.TW - 4, this.TH - 4);
            api.txtCFit(tile.name, tx + this.TW / 2, ty + 8, 5, C.void, true, this.TW - 8);
            drawFossil(api, tx + this.TW / 2, ty + this.TH / 2 + 4, tile.shape);
          } else if (tile.flipped) {
            g.rect(tx + 2, ty + 2, this.TW - 4, this.TH - 4, '#181008');
            c.strokeStyle = tile.col; c.lineWidth = 1.5; c.strokeRect(tx + 2, ty + 2, this.TW - 4, this.TH - 4);
            api.txtCFit(tile.name, tx + this.TW / 2, ty + 8, 5, tile.col, true, this.TW - 8);
            drawFossil(api, tx + this.TW / 2, ty + this.TH / 2 + 4, tile.shape);
          } else {
            g.rect(tx + 2, ty + 2, this.TW - 4, this.TH - 4, C.rock2);
            c.strokeStyle = C.amberD; c.lineWidth = 1; c.strokeRect(tx + 2, ty + 2, this.TW - 4, this.TH - 4);
            c.fillStyle = C.rock1; c.globalAlpha = 0.6;
            c.fillRect(tx + 10, ty + 20, this.TW - 20, this.TH - 34);
            c.globalAlpha = 1;
            api.txtC('?', tx + this.TW / 2 - 4, ty + this.TH / 2 - 7, 9, C.amberD, true);
          }
        }
        g.rect(0, 0, W, 56, C.rock0);
        api.txtCFit('FOSSIL BEDS · 12 km', W / 2, 6, 7, C.amberD, true, W - 8);
        resMeter(api, 8, 20, this.matched, 6, C.crystal, 'PAIRS');
        resMeter(api, 8, 34, this.lightLeft, 6, C.lightC, 'LIGHT');
      },
    },

    /* ─── CHAPTER 5: THE ERUPTION — pressure valve sequence ─── */
    {
      id: 'eruption', name: 'The Eruption',
      sub: 'Volcanic vent · 40 km',
      intro: [
        'Below the fossil beds, volcanic pressure',
        'has been building for millennia.',
        'Three valves must be opened in the right',
        'sequence to trigger the eruption vent.',
        'The blast will carry you up',
        'through Stromboli and into the Sicilian sky.',
      ],
      quote: '"We were projected, as from a cannon, into the midst of a violent storm." — Jules Verne',
      help: 'Tap the valve that FLASHES · repeat the growing sequence',
      winText: 'The vent roars open! You burst from Stromboli into the Sicilian sky!',
      loseText: 'The pressure fails. Rest and try the sequence again.',
      icon(api, x, y) { drawIcon(api, x, y, 4); },
      init(api) {
        this.phase = 'show';
        this.sequence = [Retro.util.randInt(0, 2)];
        this.showStep = 0;
        this.showT = 0;
        this.playerStep = 0;
        this.round = 1;
        this.errors = 0;
        this.maxErrors = 3;
        this.maxRound = 5 + Math.floor(J.rope / 2);
        this.pressure = 0;
        this.done = false;
        this.highlight = -1;
        this.highlightT = 0;
        this.showDelay = 0.55;
        this.errorFlash = 0;
      },
      update(api, dt) {
        if (this.done) return;
        this.highlightT = Math.max(0, this.highlightT - dt);
        this.errorFlash = Math.max(0, this.errorFlash - dt);

        if (this.phase === 'show') {
          this.showT += dt;
          if (this.showT >= this.showDelay) {
            this.showT = 0;
            if (this.highlight >= 0) {
              this.highlight = -1;
              this.showStep++;
              if (this.showStep >= this.sequence.length) {
                this.phase = 'input';
                this.playerStep = 0;
              }
            } else {
              this.highlight = this.sequence[this.showStep];
              this.highlightT = this.showDelay * 0.7;
              api.audio.sfx(this.highlight === 0 ? 'blip' : this.highlight === 1 ? 'coin' : 'jump');
            }
          }
          return;
        }
        if (this.phase === 'pause') {
          this.showT += dt;
          if (this.showT >= 0.7) { this.phase = 'show'; this.showT = 0; this.showStep = 0; this.highlight = -1; }
          return;
        }

        const ptr = api.pointer;
        let pressed = -1;
        if (ptr.justDown) {
          if (ptr.y >= api.H - 100 && ptr.y <= api.H - 28) {
            if (ptr.x >= 14  && ptr.x <= 78)  pressed = 0;
            else if (ptr.x >= 96  && ptr.x <= 174) pressed = 1;
            else if (ptr.x >= 192 && ptr.x <= 256) pressed = 2;
          }
        }
        if (api.keyPressed('left'))  pressed = 0;
        if (api.keyPressed('a') || api.keyPressed('up')) pressed = 1;
        if (api.keyPressed('right')) pressed = 2;
        if (pressed < 0) return;

        this.highlight = pressed;
        this.highlightT = 0.25;
        api.audio.sfx(pressed === 0 ? 'blip' : pressed === 1 ? 'coin' : 'jump');

        if (pressed === this.sequence[this.playerStep]) {
          this.playerStep++;
          this.pressure = Math.min(1, this.pressure + 0.18);
          if (this.playerStep >= this.sequence.length) {
            this.round++;
            api.burst(api.W / 2, api.H * 0.5, C.lava, 10);
            if (this.round > this.maxRound) {
              this.done = true;
              api.addScore(100 + this.round * 12);
              J.air = Math.min(8, J.air + 2);
              api.flash(C.lava, 0.6); api.win(); return;
            }
            this.sequence.push(Retro.util.randInt(0, 2));
            this.phase = 'pause'; this.showT = 0;
          }
        } else {
          this.errors++;
          this.pressure = Math.max(0, this.pressure - 0.25);
          this.errorFlash = 0.5;
          api.shake(5, 0.2); api.audio.sfx('hurt');
          if (this.errors >= this.maxErrors) { this.done = true; api.lose(); }
          else { this.phase = 'pause'; this.showT = 0; this.playerStep = 0; }
        }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
        c.fillStyle = '#180000'; c.fillRect(0, 0, W, H);
        const lt = Math.floor(api.t * 4) % 4;
        [[C.lava, 0.3], [C.lavaBr, 0.22], ['#f8a830', 0.14]].forEach(([col, a], i) => {
          c.fillStyle = col; c.globalAlpha = a;
          for (let j = 0; j < 5; j++)
            c.fillRect((j * 54 + lt * 7 + i * 20) % (W - 20), H * 0.7 + i * 16, 22, 8);
          c.globalAlpha = 1;
        });
        // Pressure bar
        g.rect(8, 80, 16, H - 200, '#200000');
        const pFill = Math.floor((H - 200) * this.pressure);
        g.rect(8, 80 + (H - 200) - pFill, 16, pFill, C.lava);
        if (pFill > 0) g.rect(8, 80 + (H - 200) - pFill, 16, 3, C.lavaBr);
        c.strokeStyle = C.amberD; c.lineWidth = 1; c.strokeRect(8, 80, 16, H - 200);
        g.rect(8, 83, 16, 2, C.gold);
        api.txtC('PSI', 16, 70, 5, C.amber, true);
        // Steam
        const st = api.t * 0.8;
        for (let i = 0; i < 6; i++) {
          c.globalAlpha = 0.15; c.fillStyle = C.smoke;
          c.fillRect(40 + (i * 37 + Math.floor(st * 20)) % (W - 80), H * 0.65 - ((st * 30 + i * 18) % (H * 0.55)), 6, 6);
          c.globalAlpha = 1;
        }
        // Valves
        const vX = [46, 135, 224], vY = H - 64;
        const vCols = [C.airC, C.lavaBr, C.crystal];
        ['LEFT', 'CENTER', 'RIGHT'].forEach((lbl, i) => {
          const lit = this.highlight === i && this.highlightT > 0;
          g.circle(vX[i], vY, 26, lit ? vCols[i] : C.rock2);
          g.circle(vX[i], vY, 22, lit ? '#ffffff' : C.rock1);
          c.strokeStyle = lit ? vCols[i] : C.gran; c.lineWidth = 2;
          c.beginPath(); c.arc(vX[i], vY, 12, 0, Math.PI * 2); c.stroke();
          c.beginPath(); c.moveTo(vX[i] - 10, vY); c.lineTo(vX[i] + 10, vY); c.stroke();
          c.beginPath(); c.moveTo(vX[i], vY - 10); c.lineTo(vX[i], vY + 10); c.stroke();
          api.txtCFit(lbl, vX[i], vY + 28, 5, lit ? vCols[i] : C.amberD, true, 60);
        });
        // Error dots
        for (let i = 0; i < this.maxErrors; i++) {
          c.fillStyle = i < this.errors ? C.warn : C.rock2;
          c.fillRect(W - 20 - i * 12, H - 150, 9, 9);
        }
        if (this.phase === 'show') {
          api.txtCFit('WATCH THE SEQUENCE', W / 2, H * 0.3, 8, C.amber, true, W - 30);
        } else if (this.phase === 'input') {
          api.txtCFit(this.errorFlash > 0 ? 'WRONG VALVE!' : 'YOUR TURN  STEP ' + (this.playerStep + 1) + '/' + this.sequence.length,
            W / 2, H * 0.3, this.errorFlash > 0 ? 9 : 7, this.errorFlash > 0 ? C.warn : C.cream, true, W - 20);
        } else {
          api.txtCFit('PRESSURE BUILDING…', W / 2, H * 0.3, 8, C.lavaBr, true, W - 20);
        }
        api.txtCFit('ROUND ' + this.round + ' / ' + this.maxRound, W / 2, H * 0.44, 7, C.amberD, true, W - 20);
        g.rect(0, 0, W, 44, C.rock0);
        api.txtCFit('VOLCANIC SHAFT · 40 km', W / 2, 6, 7, C.amberD, true, W - 8);
        resMeter(api, 8, 18, this.round - 1, this.maxRound, C.lava, 'ROUND');
        resMeter(api, 8, 30, this.maxErrors - this.errors, this.maxErrors, C.warn, 'TRIES');
      },
    },
  ];

  /* ── Fossil glyph renderer ───────────────────────────────────────────── */
  function drawFossil(api, cx, cy, shape) {
    const c = api.ctx;
    const cols = [C.fossil1, C.fossil2, C.fossil3, C.fossil6, C.fossil5, C.fossil4];
    c.strokeStyle = cols[shape]; c.lineWidth = 1.5;
    if (shape === 0) {
      // Ichthyosaurus
      c.beginPath(); c.ellipse(cx, cy, 16, 8, 0, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(cx + 14, cy); c.lineTo(cx + 22, cy - 7); c.lineTo(cx + 22, cy + 7); c.closePath(); c.stroke();
      c.beginPath(); c.arc(cx - 10, cy - 4, 3, 0, Math.PI * 2); c.stroke();
    } else if (shape === 1) {
      // Plesiosaur
      c.beginPath(); c.ellipse(cx + 4, cy + 4, 12, 7, 0, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(cx - 6, cy - 2); c.lineTo(cx - 12, cy - 14); c.stroke();
      c.beginPath(); c.arc(cx - 13, cy - 16, 4, 0, Math.PI * 2); c.stroke();
    } else if (shape === 2) {
      // Pterodactyl
      c.beginPath(); c.moveTo(cx - 18, cy + 4); c.lineTo(cx, cy - 6); c.lineTo(cx + 18, cy + 4); c.stroke();
      c.beginPath(); c.moveTo(cx - 2, cy - 6); c.lineTo(cx - 2, cy + 10); c.stroke();
      c.beginPath(); c.arc(cx - 3, cy - 10, 4, 0, Math.PI * 2); c.stroke();
    } else if (shape === 3) {
      // Mammoth
      c.beginPath(); c.ellipse(cx, cy + 2, 14, 9, 0, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(cx - 8, cy - 6); c.lineTo(cx - 10, cy - 16); c.stroke();
      c.beginPath(); c.moveTo(cx + 6, cy - 6); c.lineTo(cx + 10, cy - 16); c.lineTo(cx + 14, cy - 10); c.stroke();
    } else if (shape === 4) {
      // Trilobite
      c.beginPath(); c.ellipse(cx, cy, 8, 14, 0, 0, Math.PI * 2); c.stroke();
      for (let i = -2; i <= 2; i++) {
        c.fillStyle = cols[shape];
        c.fillRect(cx - 8, cy + i * 5 - 1, 16, 2);
      }
    } else {
      // Megatherium
      c.beginPath(); c.ellipse(cx, cy + 2, 12, 8, 0.3, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(cx - 4, cy - 5); c.lineTo(cx - 8, cy - 16); c.stroke();
      c.beginPath(); c.moveTo(cx + 6, cy - 5); c.lineTo(cx + 12, cy - 8); c.lineTo(cx + 14, cy - 16); c.stroke();
    }
  }

  /* ── Screen & label theming ──────────────────────────────────────────── */
  const screens = {
    win: C.crystal, lose: C.warn, chapterLabel: C.amber,
    name: C.gold, sub: C.amberD, intro: C.cream, quote: '#a8c8a0',
    help: C.granL, score: C.amber, cur: C.airC, cta: C.gold,
    overlay: 'rgba(4,2,0,0.88)',
  };

  const labels = {
    chapter: 'DEPTH',
    score:   'COURAGE',
    win:     'The Earth yields its secret',
    lose:    'The depths reclaim their mystery',
    cont:    'CONTINUE DESCENT',
    finale:  'THE CENTER REACHED',
    toMenu:  'RETURN TO THE SURFACE',
    play:    'DESCEND',
  };

  /* ── Launch ──────────────────────────────────────────────────────────── */
  RetroSaga.create({
    id: 'journeycenter-earth',
    title: 'JOURNEY TO THE CENTER OF THE EARTH',
    subtitle: 'Jules Verne · 1864',
    currency: 'COURAGE',
    bootCta: 'TAP TO DESCEND',
    menuLabel: 'CHOOSE YOUR DEPTH',
    menuHint: 'TAP A STRATUM TO ENTER',
    menuDone: 'THE CENTER REACHED',
    finale: 'You have descended to the very centre of the Earth and returned to tell the tale. The Lidenbrock Expedition enters legend.',
    emblem,
    scenery,
    menu,
    screens,
    labels,
    chapters,
  });
}());
