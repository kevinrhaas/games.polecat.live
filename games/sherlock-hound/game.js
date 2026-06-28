/* ============================================================================
 * THE HOUND OF THE BASKERVILLES — A CASE IN FIVE CHAPTERS
 * Sherlock Holmes told as five different little games:
 *   1. THE WALKING STICK — observation / deduction (tap the clues)
 *   2. THE GRIMPEN MIRE  — timing hops across the bog
 *   3. THE MOOR          — explore a fog-bound maze, gather the clues
 *   4. THE WARNING       — reassemble the cut-out letter in order
 *   5. THE HOUND         — aim & fire on the moor at last
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;
  // scattered positions of the pinned case files on the corkboard menu
  const FILES = [[20, 108, 110, 66], [150, 168, 98, 62], [26, 248, 110, 66], [150, 330, 100, 62], [42, 408, 112, 58]];

  function emblem(api, cx, cy) {
    const c = api.ctx;
    c.strokeStyle = '#5dff8f'; c.lineWidth = 5;
    c.beginPath(); c.arc(cx - 6, cy - 4, 19, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#8a6a3a'; c.lineWidth = 6;
    c.beginPath(); c.moveTo(cx + 7, cy + 9); c.lineTo(cx + 25, cy + 27); c.stroke();
  }

  // recursive-backtracker maze: 1 = wall, 0 = floor
  function genMaze(COLS, ROWS) {
    const m = [];
    for (let y = 0; y < ROWS; y++) { m[y] = []; for (let x = 0; x < COLS; x++) m[y][x] = 1; }
    const stack = [[1, 1]]; m[1][1] = 0;
    const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const opts = [];
      for (const [dx, dy] of dirs) { const nx = cx + dx, ny = cy + dy; if (nx > 0 && nx < COLS - 1 && ny > 0 && ny < ROWS - 1 && m[ny][nx] === 1) opts.push([nx, ny, dx, dy]); }
      if (opts.length) { const [nx, ny, dx, dy] = opts[Math.floor(Math.random() * opts.length)]; m[cy + dy / 2][cx + dx / 2] = 0; m[ny][nx] = 0; stack.push([nx, ny]); }
      else stack.pop();
    }
    return m;
  }

  // foggy Victorian moor backdrop for the title / menu / story screens
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0c1418'); sky.addColorStop(0.6, '#0e1612'); sky.addColorStop(1, '#080c0a');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    g.circle(56, 70, 18, '#cdd6c8'); g.circle(63, 64, 15, '#0e1612');
    const hills = [['#101a14', H - 70, 26], ['#0c150f', H - 40, 18]];
    for (const hh of hills) { c.fillStyle = hh[0]; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 10) c.lineTo(x, hh[1] - Math.sin(x * 0.04 + hh[2]) * hh[2] * 0.4 - hh[2] * 0.4); c.lineTo(W, H); c.closePath(); c.fill(); }
    g.rect(W - 50, H - 96, 3, 40, '#1a2018'); g.rect(W - 54, H - 100, 11, 8, '#243024');
    c.globalAlpha = 0.14; g.circle(W - 48, H - 95, 16, '#e8d27a'); c.globalAlpha = 1; g.circle(W - 48, H - 95, 4, '#e8d27a');
    for (let i = 0; i < 5; i++) { c.globalAlpha = 0.06; const fy = 110 + i * 60 + Math.sin(t * 0.6 + i) * 8, fx = (t * (8 + i * 3)) % (W + 80) - 40; g.rect(fx, fy, 90, 16, '#9fb8a4'); g.rect(fx - 60, fy + 6, 70, 12, '#9fb8a4'); c.globalAlpha = 1; }
    if (scene === 'intro' || scene === 'finale' || scene === 'result') { c.fillStyle = 'rgba(6,10,8,.6)'; c.fillRect(0, 0, W, H); }
    else if (scene === 'menu') {
      // a detective's corkboard — case files are pinned to it
      c.fillStyle = '#8a6638'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 300; i++) { const x = (i * 71 + 13) % W, y = (i * 53 + 7) % H; c.fillStyle = 'rgba(0,0,0,' + (0.05 + (i % 4) * 0.015) + ')'; c.fillRect(x, y, 2, 2); }
      c.fillStyle = '#3a2410'; c.fillRect(0, 0, W, 9); c.fillRect(0, H - 9, W, 9); c.fillRect(0, 0, 9, H); c.fillRect(W - 9, 0, 9, H);
    }
  }

  RetroSaga.create({
    id: 'baskervilles',
    title: 'Baskervilles',
    subtitle: 'A CASE IN FIVE CHAPTERS',
    currency: 'INSIGHT',
    accent: '#5dff8f',
    credit: 'THE HOUND OF THE BASKERVILLES · A. C. DOYLE',
    bootLine: 'FIVE CHAPTERS · ONE MYSTERY',
    tagline: 'A POLECAT MYSTERY',
    emblem,
    scenery,
    bootCta: 'TAP TO INVESTIGATE',
    menuLabel: 'THE CASE FILES',
    menuHint: 'OPEN A FILE TO INVESTIGATE',
    menuDone: 'THE CASE IS CLOSED',
    menu: {
      // chapters are pinned case files scattered across a corkboard, linked by red string
      title(api, insight) {
        const g = api.gfx, c = api.ctx, W = api.W;
        g.rect(64, 22, W - 128, 46, '#efe6cf'); g.rectO(64, 22, W - 128, 46, '#9a8a5a', 1);
        g.circle(W / 2, 26, 4, '#b03030');
        api.txtC('THE CASE FILES', W / 2, 32, 10, '#2a2210');
        api.txtC('INSIGHT  ' + insight, W / 2, 52, 9, '#7a1818');
        c.strokeStyle = 'rgba(176,40,40,.85)'; c.lineWidth = 1.5; c.beginPath();
        FILES.forEach((p, i) => { const cx = p[0] + p[2] / 2, cy = p[1] + 6; if (i) c.lineTo(cx, cy); else c.moveTo(cx, cy); });
        c.stroke();
      },
      layout() { return FILES.map((p) => ({ x: p[0], y: p[1], w: p[2], h: p[3] })); },
      card(api, info) {
        const g = api.gfx, { ch, i, x, y, w, h, sel, done } = info;
        g.rect(x, y, w, h, sel ? '#fffdf0' : '#ece2c8'); g.rectO(x, y, w, h, sel ? '#b03030' : '#9a8a58', sel ? 2 : 1);
        g.rect(x + 6, y + 13, w - 12, h - 30, '#c4b586');           // photo area
        if (ch.icon) ch.icon(api, x + 20, y + 13 + (h - 30) / 2);
        api.txt((i + 1) + '. ' + ch.name, x + 6, y + h - 13, 8, '#2a2210');
        g.circle(x + w / 2, y + 4, 4, '#b03030'); g.circle(x + w / 2, y + 4, 2, '#7a1818'); // thumbtack
        if (done) api.txt('SOLVED', x + w - 50, y + 5, 7, '#2c6a2c');
      },
    },
    finale: ['THE HOUND IS NO PHANTOM —', 'ONLY PHOSPHOR AND MALICE.', 'STAPLETON SINKS INTO', 'THE MIRE. CASE CLOSED.'],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#cde8b0', blood: '#c8102e' },

    chapters: [
      /* ===================== 1. THE WALKING STICK ====================== */
      {
        id: 'stick', name: 'THE WALKING STICK', sub: '221B BAKER STREET',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 1, y - 7, 2, 13, '#7a5a2a'); g.circle(x, y - 7, 3, '#caa15a'); },
        intro: ['A VISITOR LEFT HIS CANE', 'AT BAKER STREET. READ THE', 'MAN FROM HIS STICK', 'as Holmes would.'],
        quote: 'You are a conductor of light. Some people without possessing genius have a remarkable power of stimulating it.',
        help: 'TAP the four clues on the cane',
        winText: '"A country doctor — and he keeps a dog." Mortimer, to the life.',
        loseText: 'The details escape you. Holmes raises a single eyebrow.',
        init() {
          this.clues = [
            { x: 108, y: 132, r: 24, found: false, t: '"C.C.H." — a hunt club gift' },
            { x: 134, y: 212, r: 24, found: false, t: 'Engraved 1884 — a parting present' },
            { x: 158, y: 296, r: 24, found: false, t: 'Worn ferrule — a great walker' },
            { x: 180, y: 372, r: 22, found: false, t: 'Tooth-marks — he keeps a dog' },
          ];
          this.timer = 34; this.msg = ''; this.msgT = 0;
        },
        update(api, dt) {
          this.timer -= dt; if (this.msgT > 0) this.msgT -= dt;
          if (api.pointer.justDown) {
            for (const c of this.clues) {
              if (!c.found && Math.hypot(api.pointer.x - c.x, api.pointer.y - c.y) < c.r) {
                c.found = true; api.score += 60; api.audio.sfx('coin'); api.burst(c.x, c.y, api.colors.gold, 8); this.msg = c.t; this.msgT = 2.4;
              }
            }
          }
          const found = this.clues.filter((c) => c.found).length;
          if (found === this.clues.length) { api.score += Math.floor(this.timer * 4); api.win(); }
          else if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#181410');
          g.rect(0, H - 60, W, 60, '#2a1f16');
          g.rect(20, H - 54, W - 40, 44, '#5a2a2a'); g.rectO(20, H - 54, W - 40, 44, '#7a3a3a', 1);
          for (let i = 0; i < 60; i++) { const x = 96 + i * 1.5, y = 112 + i * 4.3; g.rect(x, y, 9, 6, '#7a5a2a'); }
          g.circle(96, 112, 12, '#9a7a3a'); g.circle(96, 112, 8, '#caa15a');
          for (const cl of this.clues) {
            if (cl.found) { c.strokeStyle = api.colors.gold; c.lineWidth = 2; c.beginPath(); c.arc(cl.x, cl.y, cl.r - 4, 0, Math.PI * 2); c.stroke(); api.txtC('✓', cl.x, cl.y - 6, 11, api.colors.gold); }
            else { c.globalAlpha = 0.18 + Math.sin(api.t * 3 + cl.y) * 0.1; g.circle(cl.x, cl.y, cl.r, '#cde8b0'); c.globalAlpha = 1; c.strokeStyle = 'rgba(205,232,176,.5)'; c.lineWidth = 1; c.beginPath(); c.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2); c.stroke(); }
          }
          api.topBar('THE WALKING STICK');
          const found = this.clues.filter((cl) => cl.found).length;
          api.txt('CLUES ' + found + '/4', 6, 20, 9, api.colors.gold);
          g.rect(W - 70, 21, 64, 6, '#2a2620'); g.rect(W - 70, 21, 64 * clamp(this.timer / 34, 0, 1), 6, api.colors.gold);
          if (this.msgT > 0) { api.panel(14, H - 40, W - 28, 28); api.txtC(this.msg, W / 2, H - 32, 9, api.colors.cream); }
          else api.txtC('TAP THE GLOWING DETAILS', W / 2, H - 30, 8, api.colors.dim);
          api.vignette(); api.scanlines();
        },
      },

      /* ====================== 2. THE GRIMPEN MIRE ===================== */
      {
        id: 'mire', name: 'THE GRIMPEN MIRE', sub: 'ONE FALSE STEP',
        icon(api, x, y) { const g = api.gfx; g.sprite(['.ggg.', 'ggggg', '.bbb.'], x - 5, y - 4, { g: '#5a7a3a', b: '#3a2a1a' }, 2); },
        intro: ['ONLY TUFTS OF GRASS GIVE', 'SAFE FOOTING ON THE GREAT', 'GRIMPEN MIRE. TIME EACH HOP', 'or be sucked under.'],
        quote: 'A false step yonder means death to man or beast.',
        help: 'TAP to hop when a tuft reaches the line',
        winText: 'Tuft by tuft, you reach the firm ground beyond the mire.',
        loseText: 'The green slime closes over your head. The moor keeps its dead.',
        init(api) { this.cross = 0; this.need = 12; this.sinks = 0; this.tufts = []; this.spawn = 0; this.hop = 0; this.cx = api.W / 2; this.lineY = api.H - 100; },
        update(api, dt) {
          const f = dt * 60; const cx = this.cx;
          this.spawn -= dt;
          if (this.spawn <= 0) { this.spawn = api.rnd(0.55, 0.95); this.tufts.push({ x: api.W + 14, y: this.lineY }); }
          for (const t of this.tufts) t.x -= 2.0 * f;
          this.tufts = this.tufts.filter((t) => t.x > -16);
          if (this.hop > 0) this.hop -= dt;
          if (api.confirm()) {
            const near = this.tufts.find((t) => Math.abs(t.x - cx) < 12 && !t.used);
            if (near) { near.used = true; this.cross++; api.score += 20; this.hop = 0.25; api.audio.sfx('jump'); api.burst(cx, this.lineY, '#6a8a4a', 5); if (this.cross >= this.need) { api.score += 60; api.win(); } }
            else { this.sinks++; api.shake(5, 0.25); api.flash('#2a3a1a', 0.18); api.audio.sfx('hurt'); if (this.sinks >= 3) api.lose(); }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#20281a');
          g.rect(0, 70, W, H - 70, '#2e3a22');
          for (let i = 0; i < 40; i++) { const x = (i * 47 + api.t * 6) % W, y = 80 + (i * 53) % (H - 90); g.rect(x, y, 2, 1, '#3e4a2e'); }
          for (let i = 0; i < 5; i++) { api.ctx.globalAlpha = 0.06; g.rect(0, 120 + i * 60 + Math.sin(api.t + i) * 6, W, 18, '#cfe8c0'); api.ctx.globalAlpha = 1; }
          api.ctx.globalAlpha = 0.4; g.rect(this.cx - 16, this.lineY - 18, 32, 36, '#5dff8f'); api.ctx.globalAlpha = 1;
          g.rect(this.cx - 16, this.lineY + 16, 32, 2, '#5dff8f');
          for (const t of this.tufts) { if (t.used) continue; g.sprite(['.ggg.', 'ggggg', '.bbb.'], t.x - 8, t.y - 6, { g: '#5a7a3a', b: '#3a2a1a' }, 3); }
          const hy = this.lineY - (this.hop > 0 ? 14 : 0);
          g.sprite(['.cc.', 'cffc', '.kk.', 'k..k'], this.cx - 8, hy - 14, { c: '#2a2a3a', f: '#caa07a', k: '#3a2a1a' }, 4);
          api.topBar('THE GRIMPEN MIRE');
          api.txt('CROSS ' + this.cross + '/' + this.need, 6, 20, 9, api.colors.gold);
          for (let i = 0; i < 3; i++) g.rect(W - 44 + i * 13, 20, 9, 8, i < 3 - this.sinks ? '#5dff8f' : '#3a2a1a');
          api.vignette(); api.scanlines();
        },
      },

      /* ========================== 3. THE MOOR ======================== */
      {
        id: 'moor', name: 'THE MOOR', sub: 'THE TRACKS OF A HOUND',
        icon(api, x, y) { const g = api.gfx; g.circle(x, y + 3, 3, '#9aa89a'); g.circle(x - 4, y - 2, 1.6, '#9aa89a'); g.circle(x, y - 4, 1.6, '#9aa89a'); g.circle(x + 4, y - 2, 1.6, '#9aa89a'); },
        intro: ['MILES OF FOG-BOUND MOOR.', 'SOMEWHERE OUT THERE THE', 'BEAST LEFT ITS TRACKS.', 'Gather the clues, find the cairn.'],
        quote: 'Mr. Holmes, they were the footprints of a gigantic hound!',
        help: 'DRAG / arrows to explore · gather clues, reach the cairn',
        winText: 'Pawprints vast as a calf’s, a gnawed bone, a shred of cloth. The trail is real.',
        loseText: 'The fog beats you. You stumble back to Baskerville Hall.',
        init(api) {
          const COLS = 9, ROWS = 13, TILE = 26;
          this.COLS = COLS; this.ROWS = ROWS; this.TILE = TILE;
          this.OX = Math.floor((api.W - COLS * TILE) / 2); this.OY = 82;
          this.grid = genMaze(COLS, ROWS);
          this.px = this.OX + TILE + TILE / 2; this.py = this.OY + TILE + TILE / 2;
          const floors = [];
          for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) if (this.grid[y][x] === 0 && (x > 2 || y > 2) && !(x === COLS - 2 && y === ROWS - 2)) floors.push([x, y]);
          this.clues = [];
          for (let i = 0; i < 4 && floors.length; i++) { const k = Math.floor(Math.random() * floors.length); const cc = floors.splice(k, 1)[0]; this.clues.push({ cx: cc[0], cy: cc[1], got: false }); }
          this.exit = { cx: COLS - 2, cy: ROWS - 2 }; this.grid[this.exit.cy][this.exit.cx] = 0;
          this.timer = 55;
        },
        update(api, dt) {
          const f = dt * 60; this.timer -= dt;
          const hs = 6, sp = 2.5 * f;
          let dx = 0, dy = 0; const p = api.pointer;
          if (p.down) { const ddx = p.x - this.px, ddy = p.y - this.py, d = Math.hypot(ddx, ddy) || 1; if (d > 2) { dx = ddx / d; dy = ddy / d; } }
          if (api.keyDown('left')) dx = -1; if (api.keyDown('right')) dx = 1; if (api.keyDown('up')) dy = -1; if (api.keyDown('down')) dy = 1;
          const wall = (x, y) => { const cx = Math.floor((x - this.OX) / this.TILE), cy = Math.floor((y - this.OY) / this.TILE); if (cx < 0 || cy < 0 || cx >= this.COLS || cy >= this.ROWS) return true; return this.grid[cy][cx] === 1; };
          const ok = (nx, ny) => !(wall(nx - hs, ny - hs) || wall(nx + hs, ny - hs) || wall(nx - hs, ny + hs) || wall(nx + hs, ny + hs));
          const nx = this.px + dx * sp; if (ok(nx, this.py)) this.px = nx;
          const ny = this.py + dy * sp; if (ok(this.px, ny)) this.py = ny;
          for (const cl of this.clues) { if (!cl.got) { const xp = this.OX + cl.cx * this.TILE + this.TILE / 2, yp = this.OY + cl.cy * this.TILE + this.TILE / 2; if (Math.hypot(this.px - xp, this.py - yp) < 14) { cl.got = true; api.score += 100; api.audio.sfx('coin'); api.burst(xp, yp, api.colors.gold, 8); } } }
          const allGot = this.clues.every((cl) => cl.got);
          const xp = this.OX + this.exit.cx * this.TILE + this.TILE / 2, yp = this.OY + this.exit.cy * this.TILE + this.TILE / 2;
          if (allGot && Math.hypot(this.px - xp, this.py - yp) < 14) { api.score += Math.floor(this.timer * 3); api.win(); }
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, T = this.TILE, c = api.ctx;
          api.clear('#0b0f0c');
          for (let y = 0; y < this.ROWS; y++) for (let x = 0; x < this.COLS; x++) {
            const px = this.OX + x * T, py = this.OY + y * T;
            if (this.grid[y][x] === 1) { g.rect(px, py, T, T, '#1a2118'); g.rect(px + 2, py + 2, T - 4, T - 5, '#24301f'); }
            else g.rect(px, py, T, T, '#12180f');
          }
          const allGot = this.clues.every((cl) => cl.got);
          const ex = this.OX + this.exit.cx * T, ey = this.OY + this.exit.cy * T;
          g.sprite(['.kk.', 'kkkk', 'kkkk'], ex + 4, ey + 4, { k: allGot ? '#5dff8f' : '#3a3a3a' }, 5);
          for (const cl of this.clues) { if (cl.got) continue; const xp = this.OX + cl.cx * T + T / 2, yp = this.OY + cl.cy * T + T / 2; api.txtC('✦', xp, yp - 6 + Math.sin(api.t * 4 + cl.cx) * 2, 12, api.colors.gold); }
          g.sprite(['.cc.', 'cffc', '.cc.', 'c..c'], this.px - 8, this.py - 12, { c: '#2a2a3a', f: '#caa07a' }, 4);
          g.circle(this.px, this.py, 2, '#ffcf6a');
          const grd = c.createRadialGradient(this.px, this.py, 16, this.px, this.py, 84);
          grd.addColorStop(0, 'rgba(11,15,12,0)'); grd.addColorStop(0.7, 'rgba(7,10,8,.6)'); grd.addColorStop(1, 'rgba(5,7,5,.96)');
          c.fillStyle = grd; c.fillRect(this.OX, this.OY, this.COLS * T, this.ROWS * T);
          api.topBar('THE MOOR');
          const got = this.clues.filter((cl) => cl.got).length;
          api.txt('CLUES ' + got + '/4', 6, 20, 9, api.colors.gold);
          g.rect(W - 70, 21, 64, 6, '#2a2620'); g.rect(W - 70, 21, 64 * clamp(this.timer / 55, 0, 1), 6, api.colors.gold);
          if (got >= 4) api.txtC('FIND THE CAIRN ▣', W / 2, H - 16, 8, '#5dff8f');
          api.vignette(); api.scanlines();
        },
      },

      /* ========================= 4. THE WARNING ====================== */
      {
        id: 'warning', name: 'THE WARNING', sub: 'CUT FROM THE TIMES',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 6, y - 7, 12, 14, '#d8c89a'); g.rect(x - 3, y - 4, 8, 1, '#5a4a2a'); g.rect(x - 3, y - 1, 8, 1, '#5a4a2a'); g.rect(x - 3, y + 2, 5, 1, '#5a4a2a'); },
        intro: ['A NOTE OF PASTED WORDS', 'WARNS SIR HENRY OFF.', 'PIECE THE MESSAGE BACK', 'together, word by word.'],
        quote: 'As you value your life or your reason, keep away from the moor.',
        help: 'TAP the words in the right order',
        winText: 'The warning reads whole. Someone fears what Sir Henry might find.',
        loseText: 'The paste-up makes no sense. The message is lost.',
        init() {
          this.target = ['AS', 'YOU', 'VALUE', 'YOUR', 'LIFE', 'KEEP', 'AWAY', 'THE', 'MOOR'];
          this.placed = 0; this.wrong = 0;
          const order = this.target.map((w, i) => i);
          for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
          this.tiles = order.map((idx, k) => ({ idx, word: this.target[idx], x: 22 + (k % 3) * 80, y: 250 + Math.floor(k / 3) * 50, w: 72, h: 36, gone: false }));
        },
        update(api, dt) {
          if (api.pointer.justDown) {
            for (const t of this.tiles) {
              if (t.gone) continue;
              if (api.pointer.x > t.x && api.pointer.x < t.x + t.w && api.pointer.y > t.y && api.pointer.y < t.y + t.h) {
                if (t.idx === this.placed) { t.gone = true; this.placed++; api.score += 30; api.audio.sfx('coin'); api.burst(t.x + t.w / 2, t.y + t.h / 2, api.colors.gold, 6); if (this.placed >= this.target.length) { api.score += 80; api.win(); } }
                else { this.wrong++; api.shake(4, 0.2); api.audio.sfx('hurt'); if (this.wrong >= 4) api.lose(); }
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#161410');
          g.rect(16, 40, W - 32, 150, '#d8c89a'); g.rectO(16, 40, W - 32, 150, '#9a8a5a', 2);
          let x = 28, y = 58;
          for (let i = 0; i < this.target.length; i++) {
            const wd = this.target[i], wpx = wd.length * 9 + 8;
            if (x + wpx > W - 28) { x = 28; y += 26; }
            if (i < this.placed) { g.rect(x, y, wpx, 20, '#1a1408'); api.txt(wd, x + 4, y + 5, 9, '#d8c89a'); }
            else g.rectO(x, y, wpx, 20, '#9a8a5a', 1);
            x += wpx + 6;
          }
          for (const t of this.tiles) {
            if (t.gone) continue;
            g.rect(t.x, t.y, t.w, t.h, '#efe6cf'); g.rectO(t.x, t.y, t.w, t.h, '#8a7a4a', 1);
            api.txtC(t.word, t.x + t.w / 2, t.y + 12, 9, '#1a1408');
          }
          api.topBar('THE WARNING');
          api.txt('WORD ' + this.placed + '/' + this.target.length, 6, 20, 9, api.colors.gold);
          for (let i = 0; i < 4; i++) g.rect(W - 56 + i * 13, 20, 9, 8, i < 4 - this.wrong ? '#5dff8f' : '#3a2a1a');
          api.vignette(); api.scanlines();
        },
      },

      /* ========================== 5. THE HOUND ======================= */
      {
        id: 'hound', name: 'THE HOUND', sub: 'A CREATURE OF FIRE',
        icon(api, x, y) { const g = api.gfx; api.ctx.globalAlpha = 0.6; g.circle(x, y, 8, '#1aff6a'); api.ctx.globalAlpha = 1; g.circle(x, y + 3, 3, '#0a1a0e'); g.circle(x - 4, y - 2, 1.6, '#0a1a0e'); g.circle(x, y - 4, 1.6, '#0a1a0e'); g.circle(x + 4, y - 2, 1.6, '#0a1a0e'); },
        intro: ['FROM THE FOG IT COMES —', 'A GIANT HOUND, ITS JAWS', 'AND EYES AFLAME WITH', 'phosphorus. Fire!'],
        quote: 'A hound it was, an enormous coal-black hound, but not such a hound as mortal eyes have ever seen.',
        help: 'TAP the hound to fire · keep it off Sir Henry',
        winText: 'Five barrels empty into its flank. The legend dies in the mire.',
        loseText: 'The fiery jaws reach Sir Henry first. The curse holds.',
        init(api) { this.hp = 5; this.hx = api.W / 2; this.hy = 110; this.vx = (Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 0.6); this.flash = 0; this.recoil = 0; },
        update(api, dt) {
          const f = dt * 60;
          this.hy += (0.5 + (5 - this.hp) * 0.12) * f;
          this.hx += this.vx * f; if (this.hx < 30 || this.hx > api.W - 30) this.vx *= -1;
          if (this.recoil > 0) { this.recoil -= dt; this.hy -= 1.4 * f; }
          if (this.flash > 0) this.flash -= dt;
          const sirY = api.H - 44;
          if (this.hy >= sirY) { api.lose(); return; }
          api.score = Math.floor((1 - (this.hy - 110) / (sirY - 110)) * 100) + (5 - this.hp) * 20;
          if (api.pointer.justDown) {
            this.flash = 0.08; api.audio.sfx('shoot'); api.shake(2, 0.1);
            if (Math.hypot(api.pointer.x - this.hx, api.pointer.y - this.hy) < 26) {
              this.hp--; this.recoil = 0.25; api.burst(this.hx, this.hy, '#5dff8f', 12); api.audio.sfx('hurt');
              if (this.hp <= 0) { api.score += Math.floor(sirY - this.hy); api.flash('#fff', 0.3); api.shake(8, 0.5); api.win(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#0a0e0c');
          g.circle(W - 40, 44, 14, '#cdd3c6');
          g.rect(0, H - 40, W, 40, '#141a14');
          g.sprite(['.cc.', 'cffc', 'cccc', 'c..c'], W / 2 - 8, H - 56, { c: '#3a3a2a', f: '#caa07a' }, 4);
          api.txtC('SIR HENRY', W / 2, H - 12, 8, api.colors.dim);
          c.globalAlpha = 0.4 + Math.sin(api.t * 6) * 0.2; g.circle(this.hx, this.hy, 22, '#1aff6a'); c.globalAlpha = 1;
          g.sprite([
            'k......k',
            'kk....kk',
            'kkkkkkkk',
            'gkkkkkkg',
            'kkkkkkkk',
            'k.kk.kk.',
          ], this.hx - 16, this.hy - 12, { k: '#0a1a0e', g: '#1aff6a' }, 4);
          g.rect(this.hx - 9, this.hy - 2, 3, 3, '#bfffd0'); g.rect(this.hx + 6, this.hy - 2, 3, 3, '#bfffd0');
          for (let i = 0; i < 6; i++) { c.globalAlpha = 0.08; g.rect(0, 80 + i * 50 + Math.sin(api.t + i) * 8, W, 22, '#9ab0a0'); c.globalAlpha = 1; }
          if (this.flash > 0) { c.globalAlpha = 0.5; g.rect(0, 0, W, H, '#2a3a2a'); c.globalAlpha = 1; }
          api.topBar('THE HOUND');
          api.txt('SHOTS LANDED ' + (5 - this.hp) + '/5', 6, 20, 9, api.colors.gold);
          const sirY = H - 44, prox = clamp((this.hy - 110) / (sirY - 110), 0, 1);
          g.rect(W - 70, 21, 64, 6, '#2a2230'); g.rect(W - 70, 21, 64 * prox, 6, prox > 0.7 ? api.colors.blood : '#e8a030');
          api.vignette(); api.scanlines();
        },
      },
    ],
  });
})();
