/* ============================================================================
 * RetroSaga — an "epic saga" shell on top of RetroEngine.
 * ----------------------------------------------------------------------------
 * Turns a property into a full-screen, multi-chapter pixel saga: a title
 * screen, a chapter-select menu, a story interstitial (narrative + a quote)
 * before each chapter, a self-contained mini-game per chapter, a result screen
 * that banks "RESPECT", and a finale once every chapter is cleared. Progress is
 * saved to localStorage. Tap/drag + arrow keys; auto-fullscreen on begin.
 *
 * A game defines an id, some theme, and an array of chapters — each chapter is
 * just an object with intro text, a quote, and init/update/draw that runs one
 * mini-game and calls api.win()/api.lose() when it ends. The framework does all
 * the meta-structure, transitions, scoring, juice and persistence.
 *
 *   RetroSaga.create({
 *     id, title, subtitle, accent, credit,
 *     width:270, height:480, parent:'#game',
 *     chapters: [ { id,name,sub, intro:[...lines], quote, help, init,update,draw } ]
 *   })
 * ============================================================================ */
(function (global) {
  'use strict';
  const Retro = global.Retro;
  if (!Retro) { console.error('RetroSaga requires retro-engine.js'); return; }
  const U = Retro.util;

  function create(cfg) {
    const W = cfg.width || 270, H = cfg.height || 480;
    const accent = cfg.accent || '#e3c567';
    const PAL = Object.assign({
      ink: '#0d0b0a', dark: '#1a1410', panel: '#120d08', gold: accent,
      cream: '#e8d9b0', dim: '#9a8a6a', blood: '#c8102e', white: '#f4ecd8',
      shadow: 'rgba(0,0,0,.55)',
    }, cfg.palette || {});
    const chapters = cfg.chapters || [];
    const SAVE_KEY = 'saga.' + (cfg.id || cfg.title || 'game');

    const engine = new Retro.Engine({ width: W, height: H, parent: cfg.parent || '#game', touch: false });
    const ctx = engine.ctx, gfx = engine.gfx, input = engine.input, audio = engine.audio;

    /* ----------------------------- save ----------------------------- */
    let save = { best: {}, done: {} };
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) save = Object.assign(save, s); } catch (e) {}
    const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} };
    const respect = () => Object.values(save.best).reduce((a, b) => a + b, 0);
    const allDone = () => chapters.every((c) => save.done[c.id]);

    /* --------------------------- pointer ---------------------------- */
    const ptr = { x: W / 2, y: H / 2, down: false, justDown: false, justUp: false, dx: 0, dy: 0 };
    function mapPt(clientX, clientY) {
      const r = engine.canvas.getBoundingClientRect();
      ptr.x = U.clamp((clientX - r.left) / r.width * W, 0, W);
      ptr.y = U.clamp((clientY - r.top) / r.height * H, 0, H);
    }
    function pDown(x, y) { mapPt(x, y); ptr.down = true; ptr.justDown = true; audio.resume(); }
    function pMove(x, y) { const ox = ptr.x, oy = ptr.y; mapPt(x, y); ptr.dx = ptr.x - ox; ptr.dy = ptr.y - oy; }
    function pUp() { ptr.down = false; ptr.justUp = true; }
    const cv = engine.canvas;
    cv.addEventListener('mousedown', (e) => { pDown(e.clientX, e.clientY); });
    cv.addEventListener('mousemove', (e) => { if (ptr.down) pMove(e.clientX, e.clientY); });
    global.addEventListener('mouseup', () => pUp());
    cv.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.changedTouches[0]; pDown(t.clientX, t.clientY); }, { passive: false });
    cv.addEventListener('touchmove', (e) => { e.preventDefault(); const t = e.changedTouches[0]; pMove(t.clientX, t.clientY); }, { passive: false });
    cv.addEventListener('touchend', (e) => { e.preventDefault(); pUp(); }, { passive: false });

    // a "confirm" press: tap, or A/Start/Space
    const confirmPressed = () => ptr.justDown || input.pressed('a') || input.pressed('start') || input.pressed('b');

    /* ------------------------- draw helpers ------------------------- */
    const clear = (c) => gfx.clear(c || PAL.ink);
    function txt(str, x, y, size, color, align, pixel) {
      ctx.fillStyle = color;
      ctx.font = (pixel ? size + "px 'Press Start 2P'" : 'bold ' + size + "px 'Courier New',monospace");
      ctx.textAlign = align || 'left'; ctx.textBaseline = 'top';
      ctx.fillText(str, x, y); ctx.textAlign = 'left';
    }
    const txtC = (s, x, y, sz, c, pix) => txt(s, x, y, sz, c, 'center', pix);
    function lines(arr, x, y, size, color, lh, align) {
      arr.forEach((l, i) => txt(l, x, y + i * (lh || size + 4), size, color, align || 'center'));
    }
    function vignette() {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.22, W / 2, H / 2, H * 0.62);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, PAL.shadow);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    function scanlines() {
      ctx.fillStyle = 'rgba(0,0,0,.10)';
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    }
    function panel(x, y, w, h, fill) {
      gfx.rect(x, y, w, h, fill || 'rgba(10,7,4,.82)');
      gfx.rectO(x, y, w, h, PAL.gold, 1);
    }
    function topBar(label) {
      gfx.rect(0, 0, W, 16, 'rgba(8,5,3,.85)');
      gfx.line(0, 16, W, 16, PAL.gold);
      txt(label, 6, 4, 9, PAL.gold);
    }

    /* ---------------------------- juice ----------------------------- */
    let shakeT = 0, shakeAmt = 0, flashObj = null, parts = [];
    function shake(a, t) { shakeAmt = a; shakeT = t; }
    function flash(col, t) { flashObj = { col, t, max: t }; }
    function burst(x, y, col, n) { for (let i = 0; i < (n || 10); i++) parts.push({ x, y, vx: U.rand(-2, 2), vy: U.rand(-3, 1), life: U.rand(0.3, 0.8), col }); }
    function updateParts(dt) { parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= dt; }); parts = parts.filter((p) => p.life > 0); }
    function drawParts() { parts.forEach((p) => gfx.rect(p.x, p.y, 2, 2, p.col)); }

    /* --------------------------- mini-game api ---------------------- */
    const api = {
      W, H, gfx, ctx, input, audio, util: U, pointer: ptr, colors: PAL, engine,
      t: 0, dt: 0, score: 0,
      addScore(n) { this.score += n; },
      win() { endChapter(true); },
      lose() { endChapter(false); },
      shake, flash, burst,
      clear, txt, txtC, lines, vignette, scanlines, panel, topBar,
      rnd: U.rand, rint: U.randInt, chance: (p) => Math.random() < p, choice: U.choice,
      confirm: confirmPressed,
      // expose key helpers
      keyDown: (b) => input.down(b), keyPressed: (b) => input.pressed(b),
    };

    /* ----------------------- scene state machine -------------------- */
    let scene = 'boot', sceneT = 0, curIndex = 0, cur = null, result = null;
    let menuSel = 0;
    function setScene(s) { scene = s; sceneT = 0; parts = []; }

    function startChapter(i) {
      curIndex = i; cur = chapters[i]; setScene('intro');
    }
    function playChapter() {
      api.t = 0; api.score = 0; api.dt = 0;
      if (cur.init) cur.init.call(cur, api);
      setScene('play');
    }
    function endChapter(won) {
      const sc = Math.max(0, Math.round(api.score));
      if (won) save.done[cur.id] = true;
      if (!save.best[cur.id] || sc > save.best[cur.id]) save.best[cur.id] = sc;
      persist();
      result = { won, score: sc, justFinished: cur.id, finale: won && allDone() };
      setScene('result');
      audio.sfx(won ? 'win' : 'lose');
    }

    /* ------------------------------ update -------------------------- */
    function update(dt) {
      sceneT += dt;
      if (shakeT > 0) shakeT -= dt;
      if (flashObj) { flashObj.t -= dt; if (flashObj.t <= 0) flashObj = null; }
      updateParts(dt);

      if (scene === 'boot') {
        if (confirmPressed()) { tryImmersive(); setScene('menu'); audio.sfx('select'); }
      } else if (scene === 'menu') {
        if (input.pressed('down')) { menuSel = (menuSel + 1) % chapters.length; audio.sfx('blip'); }
        if (input.pressed('up')) { menuSel = (menuSel + chapters.length - 1) % chapters.length; audio.sfx('blip'); }
        // pointer selection
        if (ptr.justDown) {
          const idx = menuIndexAt(ptr.y);
          if (idx >= 0) { menuSel = idx; startChapter(idx); audio.sfx('select'); }
        }
        if (input.pressed('a') || input.pressed('start')) { startChapter(menuSel); audio.sfx('select'); }
      } else if (scene === 'intro') {
        if (confirmPressed() && sceneT > 0.35) playChapter();
      } else if (scene === 'play') {
        api.dt = dt; api.t += dt;
        if (cur.update) cur.update.call(cur, api, dt);
      } else if (scene === 'result') {
        if (confirmPressed() && sceneT > 0.4) {
          if (result.finale) setScene('finale');
          else { menuSel = Math.min(chapters.length - 1, curIndex + 1); setScene('menu'); }
        }
      } else if (scene === 'finale') {
        if (confirmPressed() && sceneT > 0.6) setScene('menu');
      }

      // clear per-frame pointer edges AFTER everyone has read them
      ptr.justDown = false; ptr.justUp = false; ptr.dx = 0; ptr.dy = 0;
      global.__sagaScene = scene; // debug hook for headless tests
    }

    /* ------------------------------ draw ---------------------------- */
    function draw() {
      ctx.save();
      if (shakeT > 0) { const a = shakeAmt; ctx.translate((Math.random() - 0.5) * a, (Math.random() - 0.5) * a); }
      if (scene === 'boot') drawBoot();
      else if (scene === 'menu') drawMenu();
      else if (scene === 'intro') drawIntro();
      else if (scene === 'play') { if (cur.draw) cur.draw.call(cur, api); drawParts(); }
      else if (scene === 'result') drawResult();
      else if (scene === 'finale') drawFinale();
      ctx.restore();
      if (flashObj) { ctx.globalAlpha = Math.max(0, flashObj.t / flashObj.max) * 0.8; clear(flashObj.col); ctx.globalAlpha = 1; }
    }

    function drawBoot() {
      clear(PAL.ink);
      // emblem
      const cx = W / 2, cy = H * 0.32;
      ctx.globalAlpha = 0.5 + Math.sin(sceneT * 2) * 0.1;
      gfx.circle(cx, cy, 30, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 1;
      if (cfg.emblem) cfg.emblem(api, cx, cy);
      txtC((cfg.title || '').toUpperCase(), cx, H * 0.46, 22, PAL.gold, true);
      txtC(cfg.subtitle || 'A PIXEL SAGA', cx, H * 0.46 + 30, 10, PAL.dim, true);
      if (Math.floor(sceneT * 1.5) % 2 === 0) txtC('TAP TO BEGIN', cx, H * 0.66, 12, PAL.cream);
      txtC(cfg.credit || 'AN ORIGINAL PIXEL TRIBUTE', cx, H - 40, 8, PAL.dim);
      txtC(chapters.length + ' CHAPTERS · ONE LEGEND', cx, H - 26, 8, PAL.dim);
      vignette(); scanlines();
    }

    const MENU_TOP = 92, ROW_H = 52;
    function menuIndexAt(y) {
      const i = Math.floor((y - MENU_TOP) / ROW_H);
      return (i >= 0 && i < chapters.length) ? i : -1;
    }
    function drawMenu() {
      clear(PAL.dark);
      txtC((cfg.title || '').toUpperCase(), W / 2, 24, 16, PAL.gold, true);
      txtC('CHOOSE YOUR CHAPTER', W / 2, 52, 9, PAL.dim);
      txtC('RESPECT  ' + respect(), W / 2, 70, 9, PAL.cream);
      for (let i = 0; i < chapters.length; i++) {
        const c = chapters[i], y = MENU_TOP + i * ROW_H;
        const selp = (i === menuSel);
        panel(14, y, W - 28, ROW_H - 8, selp ? 'rgba(40,26,14,.92)' : 'rgba(10,7,4,.82)');
        const done = save.done[c.id];
        txt((i + 1) + '. ' + c.name, 24, y + 8, 10, done ? PAL.gold : PAL.cream);
        txt(c.sub || '', 24, y + 24, 9, PAL.dim);
        if (done) txt('✓ ' + (save.best[c.id] || 0), W - 70, y + 14, 9, PAL.gold);
        else txt('▶', W - 34, y + 14, 11, selp ? PAL.cream : PAL.dim);
      }
      if (allDone()) txtC('★ ALL CHAPTERS CLEARED ★', W / 2, H - 24, 9, PAL.gold);
      else txtC('TAP A CHAPTER TO PLAY', W / 2, H - 22, 8, PAL.dim);
      vignette(); scanlines();
    }

    function drawIntro() {
      clear(PAL.ink);
      txtC('CHAPTER ' + (curIndex + 1), W / 2, 54, 9, PAL.dim);
      txtC(cur.name, W / 2, 74, 15, PAL.gold, true);
      txtC(cur.sub || '', W / 2, 100, 9, PAL.blood);
      lines(cur.intro || [], W / 2, 150, 11, PAL.cream, 18);
      if (cur.quote) {
        const wrapped = wrapText('“' + cur.quote + '”', 30);
        lines(wrapped, W / 2, 270, 10, PAL.dim, 16);
      }
      if (cur.help) txtC(cur.help, W / 2, H - 70, 9, PAL.gold);
      if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.35) txtC('TAP TO PLAY', W / 2, H - 44, 12, PAL.cream);
      vignette(); scanlines();
    }

    function drawResult() {
      // let the chapter's last frame sit underneath, dimmed
      if (cur.draw) { ctx.globalAlpha = 0.5; cur.draw.call(cur, api); ctx.globalAlpha = 1; }
      gfx.rect(0, 0, W, H, 'rgba(8,5,3,.8)');
      const won = result.won;
      txtC(won ? 'CHAPTER CLEARED' : 'YOU FALTERED', W / 2, H * 0.3, 14, won ? PAL.gold : PAL.blood, true);
      const outcome = won ? (cur.winText || '') : (cur.loseText || '');
      if (outcome) lines(wrapText(outcome, 26), W / 2, H * 0.3 + 34, 10, PAL.cream, 15);
      txtC('SCORE  ' + result.score, W / 2, H * 0.56, 11, PAL.cream);
      txtC('RESPECT  ' + respect(), W / 2, H * 0.56 + 20, 10, PAL.gold);
      if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.4)
        txtC(result.finale ? 'TAP FOR THE FINALE' : 'TAP TO CONTINUE', W / 2, H * 0.74, 11, PAL.cream);
      vignette(); scanlines();
    }

    function drawFinale() {
      clear(PAL.ink);
      if (cfg.emblem) cfg.emblem(api, W / 2, H * 0.3);
      lines(cfg.finale || ['THE LEGEND IS COMPLETE.'], W / 2, H * 0.46, 11, PAL.gold, 18);
      txtC('FINAL RESPECT  ' + respect(), W / 2, H * 0.66, 11, PAL.cream);
      txtC('A POLECAT SAGA', W / 2, H * 0.74, 8, PAL.dim);
      if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.6) txtC('TAP TO RETURN', W / 2, H - 40, 11, PAL.cream);
      vignette(); scanlines();
    }

    function wrapText(str, max) {
      const words = str.split(' '), out = []; let line = '';
      for (const w of words) {
        if ((line + ' ' + w).trim().length > max) { out.push(line.trim()); line = w; }
        else line += ' ' + w;
      }
      if (line.trim()) out.push(line.trim());
      return out;
    }

    /* ------------------------- bar buttons -------------------------- */
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) muteBtn.addEventListener('click', () => { muteBtn.textContent = audio.toggleMute() ? '🔇' : '🔊'; });
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) restartBtn.addEventListener('click', () => { setScene('menu'); });

    function tryImmersive() { try { if (!engine._immersive) engine.toggleImmersive(); } catch (e) {} }

    engine.run(update, draw);
    return { engine, api, save };
  }

  global.RetroSaga = { create };
})(window);
