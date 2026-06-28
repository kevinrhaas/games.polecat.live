/* ============================================================================
 * THE HOUND OF THE BASKERVILLES — a foggy-moor mystery maze
 * Genre: Mystery Maze / Stealth.  Built on RetroEngine.
 *
 * Gather every clue scattered across the procedurally-generated moor, then
 * reach Baskerville Hall. The Hound patrols the mire; if it spots your lantern
 * it gives chase. Lantern light reveals the fog; darkness hides the path.
 * ============================================================================ */
(function () {
  'use strict';
  const { clamp, choice } = Retro.util;

  const COLS = 15, ROWS = 11, TILE = 16;
  const MAZE_W = COLS * TILE, MAZE_H = ROWS * TILE;
  const W = 256, H = 240;
  const OX = (W - MAZE_W) / 2, OY = 40; // maze offset (HUD on top)

  const engine = new Retro.Engine({
    width: W, height: H, parent: '#game', touch: 'dpad', showB: false, buttonLabels: { a: '👁' },
  });
  const g = engine.gfx, input = engine.input, audio = engine.audio;
  const GAME = 'sherlock-hound';

  let grid, player, hound, clues, exit, state, level, lives, score, timer, caughtFlash, msgTimer;

  /* ---- maze generation: recursive backtracker on odd grid ---- */
  function genMaze() {
    const m = [];
    for (let y = 0; y < ROWS; y++) { m[y] = []; for (let x = 0; x < COLS; x++) m[y][x] = 1; }
    const stack = [[1, 1]];
    m[1][1] = 0;
    const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const opts = [];
      for (const [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (nx > 0 && nx < COLS - 1 && ny > 0 && ny < ROWS - 1 && m[ny][nx] === 1) opts.push([nx, ny, dx, dy]);
      }
      if (opts.length) {
        const [nx, ny, dx, dy] = choice(opts);
        m[cy + dy / 2][cx + dx / 2] = 0; m[ny][nx] = 0;
        stack.push([nx, ny]);
      } else stack.pop();
    }
    // braid a little: knock out some walls so it's less of a dead-end trap
    for (let i = 0; i < 18; i++) {
      const x = 1 + Math.floor(Math.random() * (COLS - 2));
      const y = 1 + Math.floor(Math.random() * (ROWS - 2));
      if (m[y][x] === 1) {
        let open = 0;
        if (m[y - 1] && m[y - 1][x] === 0) open++; if (m[y + 1] && m[y + 1][x] === 0) open++;
        if (m[y][x - 1] === 0) open++; if (m[y][x + 1] === 0) open++;
        if (open >= 2) m[y][x] = 0;
      }
    }
    return m;
  }

  const isWall = (cx, cy) => cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS || grid[cy][cx] === 1;
  const floors = () => {
    const f = [];
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) if (grid[y][x] === 0) f.push([x, y]);
    return f;
  };

  /* ---- BFS for hound pathfinding ---- */
  function bfsNext(from, to) {
    const key = (x, y) => y * COLS + x;
    const q = [from]; const prev = {}; prev[key(from[0], from[1])] = null;
    while (q.length) {
      const [cx, cy] = q.shift();
      if (cx === to[0] && cy === to[1]) break;
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const nx = cx + dx, ny = cy + dy;
        if (isWall(nx, ny)) continue;
        if (prev[key(nx, ny)] !== undefined) continue;
        prev[key(nx, ny)] = [cx, cy]; q.push([nx, ny]);
      }
    }
    let cur = to;
    if (prev[key(cur[0], cur[1])] === undefined) return null;
    while (prev[key(cur[0], cur[1])] && !(prev[key(cur[0], cur[1])][0] === from[0] && prev[key(cur[0], cur[1])][1] === from[1])) {
      cur = prev[key(cur[0], cur[1])];
    }
    return cur;
  }

  function reset(full) {
    if (full) { level = 1; lives = 3; score = 0; }
    grid = genMaze();
    const fl = floors();
    player = { cx: 1, cy: 1, x: 1 * TILE, y: 1 * TILE, dir: [0, 0], moving: false, target: null, speed: 1.4 };
    // exit far from player
    exit = { cx: COLS - 2, cy: ROWS - 2 };
    grid[exit.cy][exit.cx] = 0;
    // clues
    clues = [];
    const pool = fl.filter(([x, y]) => Math.abs(x - 1) + Math.abs(y - 1) > 4 && !(x === exit.cx && y === exit.cy));
    const count = Math.min(4 + level, 7);
    for (let i = 0; i < count && pool.length; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      const [x, y] = pool.splice(idx, 1)[0];
      clues.push({ cx: x, cy: y, got: false });
    }
    // hound start far
    const far = fl.reduce((best, c) => {
      const d = Math.abs(c[0] - 1) + Math.abs(c[1] - 1);
      return d > best.d ? { c, d } : best;
    }, { c: [COLS - 2, 1], d: 0 }).c;
    hound = { cx: far[0], cy: far[1], x: far[0] * TILE, y: far[1] * TILE, dir: [0, 0], moving: false, target: null, speed: 0.9 + level * 0.12, state: 'patrol', lunge: 0 };
    state = 'play';
    timer = 0; caughtFlash = 0; msgTimer = 0;
    msg('LEVEL ' + level);
  }

  let message = '';
  function msg(t) { message = t; msgTimer = 1.6; }

  function tileCenter(cx, cy) { return { x: cx * TILE, y: cy * TILE }; }

  /* ---- grid-stepped movement for an actor ---- */
  function stepActor(a, wantDir) {
    if (!a.moving) {
      // pick a direction
      if (wantDir && (wantDir[0] || wantDir[1])) {
        const nx = a.cx + wantDir[0], ny = a.cy + wantDir[1];
        if (!isWall(nx, ny)) { a.target = { cx: nx, cy: ny }; a.dir = wantDir; a.moving = true; }
        else a.dir = wantDir; // face but don't move
      }
    }
    if (a.moving && a.target) {
      const tc = tileCenter(a.target.cx, a.target.cy);
      const sp = a.speed;
      if (a.x < tc.x) a.x = Math.min(tc.x, a.x + sp);
      else if (a.x > tc.x) a.x = Math.max(tc.x, a.x - sp);
      if (a.y < tc.y) a.y = Math.min(tc.y, a.y + sp);
      else if (a.y > tc.y) a.y = Math.max(tc.y, a.y - sp);
      if (a.x === tc.x && a.y === tc.y) { a.cx = a.target.cx; a.cy = a.target.cy; a.moving = false; a.target = null; }
    }
  }

  function update(dt) {
    if (msgTimer > 0) msgTimer -= dt;
    if (state === 'win' || state === 'over') {
      if (input.anyPressed()) { reset(state === 'over'); }
      return;
    }
    if (caughtFlash > 0) { caughtFlash -= dt; return; }

    timer += dt;

    // player input
    let wd = [0, 0];
    if (input.down('left')) wd = [-1, 0];
    else if (input.down('right')) wd = [1, 0];
    else if (input.down('up')) wd = [0, -1];
    else if (input.down('down')) wd = [0, 1];
    stepActor(player, wd);

    // pick up clues
    for (const c of clues) {
      if (!c.got && c.cx === player.cx && c.cy === player.cy && !player.moving) {
        c.got = true; score += 100; audio.sfx('coin'); msg('CLUE FOUND!');
      }
    }
    const remaining = clues.filter((c) => !c.got).length;

    // exit
    if (remaining === 0 && player.cx === exit.cx && player.cy === exit.cy && !player.moving) {
      level++; score += 250 + Math.max(0, 600 - Math.floor(timer * 10));
      audio.sfx('win'); Retro.Store.setHigh(GAME, score);
      // brief level-complete
      grid = null; state = 'win';
      return;
    }

    // hound AI
    const dpx = player.cx - hound.cx, dpy = player.cy - hound.cy;
    const manh = Math.abs(dpx) + Math.abs(dpy);
    // detection: close, or line of sight along a corridor
    let sees = manh <= 3;
    if (!sees && (player.cx === hound.cx || player.cy === hound.cy)) {
      sees = lineClear(hound.cx, hound.cy, player.cx, player.cy);
    }
    if (sees) hound.state = 'hunt'; else if (hound.state === 'hunt' && manh > 7) hound.state = 'patrol';

    if (!hound.moving) {
      let dir = [0, 0];
      if (hound.state === 'hunt') {
        const nxt = bfsNext([hound.cx, hound.cy], [player.cx, player.cy]);
        if (nxt) dir = [nxt[0] - hound.cx, nxt[1] - hound.cy];
        hound.speed = clamp(0.95 + level * 0.12, 0.95, player.speed - 0.05);
      } else {
        // wander: keep going, turn at junctions
        const opts = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => !isWall(hound.cx + dx, hound.cy + dy));
        const fwd = opts.filter(([dx, dy]) => !(dx === -hound.dir[0] && dy === -hound.dir[1]));
        dir = (fwd.length ? choice(fwd) : (opts.length ? choice(opts) : [0, 0]));
        hound.speed = 0.7 + level * 0.06;
      }
      stepActor(hound, dir);
    } else stepActor(hound, hound.dir);

    // caught?
    if (Math.abs(hound.x - player.x) < 10 && Math.abs(hound.y - player.y) < 10) {
      lives--; audio.sfx('hurt'); caughtFlash = 1.1;
      if (lives <= 0) { state = 'over'; audio.sfx('lose'); Retro.Store.setHigh(GAME, score); }
      else {
        // respawn player at start, hound pushed away
        player.cx = 1; player.cy = 1; player.x = TILE; player.y = TILE; player.moving = false; player.target = null;
        msg('CAUGHT! ' + lives + ' LEFT');
      }
    }
  }

  function lineClear(x0, y0, x1, y1) {
    if (x0 === x1) { const s = Math.sign(y1 - y0); for (let y = y0 + s; y !== y1; y += s) if (isWall(x0, y)) return false; return true; }
    if (y0 === y1) { const s = Math.sign(x1 - x0); for (let x = x0 + s; x !== x1; x += s) if (isWall(x, y0)) return false; return true; }
    return false;
  }

  /* ---------------------------- rendering ---------------------------- */
  function render() {
    g.clear('#06010f');
    if (state === 'win') { renderLevelClear(); drawHUD(); return; }

    // moor tiles
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const px = OX + x * TILE, py = OY + y * TILE;
      if (grid[y][x] === 1) {
        // rocky outcrop
        g.rect(px, py, TILE, TILE, '#241a33');
        g.rect(px + 2, py + 2, TILE - 4, TILE - 5, '#2f2247');
        g.rect(px + 3, py + 3, 3, 3, '#3c2f57');
      } else {
        g.rect(px, py, TILE, TILE, '#10172a');
        if (((x + y) & 1) === 0) g.rect(px + 6, py + 7, 2, 2, '#16203a');
      }
    }
    // exit (Baskerville Hall)
    const allClues = clues.filter((c) => !c.got).length === 0;
    const ec = tileCenter(exit.cx, exit.cy);
    g.rect(OX + ec.x + 2, OY + ec.y + 1, 12, 14, allClues ? '#5dff8f' : '#2b3a4a');
    g.rect(OX + ec.x + 5, OY + ec.y + 6, 6, 9, '#0b0420');
    g.textC('⌂', OX + ec.x + TILE / 2, OY + ec.y + 1, allClues ? '#0b0420' : '#6a7a8a', 8);

    // clues
    const tw = engine.frame * 0.15;
    for (const c of clues) {
      if (c.got) continue;
      const cc = tileCenter(c.cx, c.cy);
      const yb = Math.sin(tw + c.cx) * 1.5;
      g.textC('✦', OX + cc.x + TILE / 2, OY + cc.y + 4 + yb, '#ffe14d', 9);
    }

    // hound
    drawHound(OX + hound.x, OY + hound.y);
    // player (Holmes with lantern)
    drawHolmes(OX + player.x, OY + player.y);

    // fog of war — darken tiles far from the lantern
    drawFog();

    drawHUD();

    if (caughtFlash > 0 && state === 'play') {
      g.ctx.globalAlpha = Math.min(0.6, caughtFlash); g.rect(0, 0, W, H, '#ff2e97'); g.ctx.globalAlpha = 1;
    }
    if (msgTimer > 0 && message) {
      g.textC(message, W / 2, OY - 2, '#fff', 9);
    }
    if (state === 'over') renderOver();
  }

  function drawFog() {
    const ctx = g.ctx;
    const lx = OX + player.x + TILE / 2, ly = OY + player.y + TILE / 2;
    const grd = ctx.createRadialGradient(lx, ly, 14, lx, ly, 72);
    grd.addColorStop(0, 'rgba(6,1,15,0)');
    grd.addColorStop(0.7, 'rgba(6,1,15,0.55)');
    grd.addColorStop(1, 'rgba(4,1,10,0.92)');
    ctx.fillStyle = grd;
    ctx.fillRect(OX, OY, MAZE_W, MAZE_H);
  }

  function drawHolmes(x, y) {
    g.sprite([
      '..cc..',
      '.cccc.',
      '..ff..',
      '.ffff.',
      'b.ff.b',
      '..ff..',
      '.f..f.',
    ], x + 2, y + 1, { c: '#3a2f57', f: '#d9c7a0', b: '#21e6ff' }, 2);
    // lantern glow dot
    g.circle(x + TILE / 2, y + TILE / 2, 2, '#ffe14d');
  }

  function drawHound(x, y) {
    const hot = hound.state === 'hunt';
    const eye = hot ? '#ff2e97' : '#ff8a3d';
    g.sprite([
      'k....k',
      'kk..kk',
      'kkkkkk',
      'ekkkke',
      'kkkkkk',
      'k.kk.k',
    ], x + 2, y + 2, { k: hot ? '#1b0e22' : '#241a33', e: eye }, 2);
    if (hot) { g.circle(x + 5, y + 8, 1.5, eye); g.circle(x + 11, y + 8, 1.5, eye); }
  }

  function drawHUD() {
    g.rect(0, 0, W, OY - 4, '#0b0420');
    g.line(0, OY - 4, W, OY - 4, '#3a2f57');
    g.text('SCORE ' + score, 6, 6, '#fff', 8);
    const remaining = clues ? clues.filter((c) => !c.got).length : 0;
    g.text('CLUES ' + (clues ? clues.length - remaining : 0) + '/' + (clues ? clues.length : 0), 6, 20, '#ffe14d', 8);
    g.text('LVL ' + level, W - 52, 6, '#21e6ff', 8);
    let hearts = '';
    for (let i = 0; i < lives; i++) hearts += '♥';
    g.text(hearts || ' ', W - 52, 20, '#ff2e97', 8);
    if (hound && hound.state === 'hunt') g.textC('! THE HOUND !', W / 2, 13, '#ff2e97', 8);
  }

  function renderLevelClear() {
    g.clear('#0b0420');
    g.textC('THE GAME', W / 2, 70, '#21e6ff', 12);
    g.textC('IS AFOOT', W / 2, 92, '#21e6ff', 12);
    g.textC('Level ' + (level - 1) + ' solved!', W / 2, 130, '#fff', 9);
    g.textC('SCORE ' + score, W / 2, 152, '#ffe14d', 9);
    g.textC('Press any key', W / 2, 186, '#9d92c7', 8);
  }

  function renderOver() {
    g.ctx.globalAlpha = 0.82; g.rect(0, 0, W, H, '#06010f'); g.ctx.globalAlpha = 1;
    g.textC('THE HOUND', W / 2, 80, '#ff2e97', 14);
    g.textC('WINS', W / 2, 104, '#ff2e97', 14);
    g.textC('Score ' + score, W / 2, 140, '#fff', 9);
    g.textC('Best ' + Retro.Store.getHigh(GAME), W / 2, 158, '#ffe14d', 8);
    g.textC('Press any key to retry', W / 2, 192, '#9d92c7', 8);
  }

  /* --------------------------- controls UI --------------------------- */
  document.getElementById('muteBtn').addEventListener('click', function () {
    this.textContent = audio.toggleMute() ? '🔇' : '🔊';
  });
  document.getElementById('restartBtn').addEventListener('click', () => reset(true));

  reset(true);
  engine.run(update, render);
})();
