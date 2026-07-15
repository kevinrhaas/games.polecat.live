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
    const CUR = cfg.currency || 'SCORE'; // thematic name for the banked cross-chapter total
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
    // measure a string at a given font (for fit/wrap helpers below)
    function measure(str, size, pixel) {
      ctx.font = (pixel ? size + "px 'Press Start 2P'" : 'bold ' + size + "px 'Courier New',monospace");
      return ctx.measureText(str).width;
    }
    // largest size <= `size` whose width fits maxW (down to a floor)
    function fitSize(str, size, maxW, pixel) {
      let s = size;
      while (s > 6 && measure(str, s, pixel) > maxW) s--;
      return s;
    }
    // word-wrap by MEASURED width so a line never overflows maxW at `size`
    function wrapFit(str, size, maxW, pixel) {
      const words = String(str).split(' '), out = []; let line = '';
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (line && measure(test, size, pixel) > maxW) { out.push(line); line = w; }
        else line = test;
      }
      if (line) out.push(line);
      return out;
    }
    // centered single line that auto-shrinks to fit the screen width
    function txtCFit(str, x, y, size, color, pixel, maxW) {
      txtC(str, x, y, fitSize(str, size, maxW == null ? W - 16 : maxW, pixel), color, pixel);
    }
    // centered headline: keep `size` if it fits, else wrap to fit, shrinking
    // only if a single word is still too wide. Returns the number of lines drawn.
    function txtCHead(str, x, yTop, size, color, pixel, lh, maxW) {
      const mw = maxW == null ? W - 16 : maxW;
      let s = size;
      // shrink until the longest single word fits, so wrapping can't overflow
      const longest = String(str).split(' ').reduce((a, b) => (measure(b, s, pixel) > measure(a, s, pixel) ? b : a), '');
      while (s > 6 && measure(longest, s, pixel) > mw) s--;
      const ls = wrapFit(str, s, mw, pixel);
      lines(ls, x, yTop, s, color, lh || s + 4, 'center');
      return ls.length;
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
      t: 0, dt: 0, score: 0, state: {},
      addScore(n) { this.score += n; },
      win() { endChapter(true); },
      lose() { endChapter(false); },
      shake, flash, burst,
      clear, txt, txtC, lines, txtCFit, txtCHead, wrapFit, fitSize, vignette, scanlines, panel, topBar,
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
      api.t = 0; api.score = 0; api.dt = 0; api.state = {}; // fresh per-chapter scratch bag
      if (cur.init) cur.init.call(cur, api);
      setScene('play');
    }
    function endChapter(won) {
      const sc = Math.max(0, Math.round(api.score));
      if (won) save.done[cur.id] = true;
      if (!save.best[cur.id] || sc > save.best[cur.id]) save.best[cur.id] = sc;
      persist();
      result = { won, score: sc, justFinished: cur.id, finale: won && allDone() };
      // pacing-audit surface: record how long the chapter actually ran (api.t)
      if (global.__sagaTest) global.__sagaTest.last = { id: cur.id, won, t: Math.round(api.t * 100) / 100 };
      setScene('result');
      audio.sfx(won ? 'win' : 'lose');
    }

    /* Headless test surface for pacing/crash audits (tools/audit-saga.mjs).
       Harmless in normal play — just exposes chapter ids + a jump-to-play. */
    global.__sagaTest = {
      chapters: chapters.map((c) => c.id),
      scene: () => scene,
      jump(i) { startChapter(i); playChapter(); },
    };

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
        // pointer selection (hit-tests the actual chapter rects, custom or list)
        if (ptr.justDown) {
          const idx = menuHit(ptr.x, ptr.y);
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

    // Per-game animated background for the framed screens. A game supplies
    // cfg.scenery(api, scene, t) to make its title/menu/etc unique & on-theme.
    function backdrop(scene) {
      if (cfg.scenery) cfg.scenery(api, scene, sceneT);
      else clear(scene === 'menu' ? PAL.dark : PAL.ink);
    }
    function drawBoot() {
      backdrop('boot');
      const cx = W / 2, cy = H * 0.30;
      if (cfg.emblem) cfg.emblem(api, cx, cy);
      txtCFit((cfg.title || '').toUpperCase(), cx, H * 0.46, 22, PAL.gold, true);
      txtCFit(cfg.subtitle || (chapters.length + ' CHAPTERS'), cx, H * 0.46 + 30, 10, PAL.cream, true);
      if (Math.floor(sceneT * 1.5) % 2 === 0) txtCFit(cfg.bootCta || 'TAP TO BEGIN', cx, H * 0.66, 12, PAL.cream);
      txtCFit(cfg.credit || 'AN ORIGINAL PIXEL TRIBUTE', cx, H - 40, 8, PAL.dim);
      txtCFit(cfg.bootLine || (chapters.length + ' CHAPTERS · ONE STORY'), cx, H - 26, 8, PAL.dim);
      vignette(); scanlines();
    }

    const MENU_TOP = 92, ROW_H = 52;
    // Menu theme — games override colors via cfg.menu.colors for bold,
    // property-specific looks instead of the default gold-on-black.
    const MT = Object.assign({
      panel: 'rgba(8,6,4,.7)', panelSel: 'rgba(30,22,14,.9)', border: PAL.gold,
      name: PAL.cream, nameDone: PAL.gold, sub: PAL.dim,
      title: PAL.gold, label: PAL.dim, cur: PAL.cream, hint: PAL.dim,
    }, (cfg.menu && cfg.menu.colors) || {});

    // Screen theme — the framed chapter-intro, result/score and finale screens
    // inherit the property's palette (so they match the bespoke menu) and can be
    // fully overridden per game via cfg.screens (colors) + cfg.labels (wording).
    // Defaults derive from the menu theme so an unconfigured game still varies.
    const ST = Object.assign({
      overlay: 'rgba(8,5,3,.82)',
      win: MT.title, lose: PAL.blood,
      chapterLabel: MT.label, name: MT.title, sub: PAL.blood,
      intro: PAL.cream, quote: MT.sub, help: MT.title,
      score: PAL.cream, cur: MT.title, cta: PAL.cream,
    }, cfg.screens || {});
    const LBL = Object.assign({
      chapter: 'CHAPTER', score: 'SCORE',
      win: 'CHAPTER CLEARED', lose: 'YOU FALTERED',
      cont: 'TAP TO CONTINUE', finale: 'TAP FOR THE FINALE', toMenu: 'TAP TO RETURN',
    }, cfg.labels || {});

    // Chapter hit-rects: a game can fully re-arrange them via cfg.menu.layout
    // (e.g. map nodes, road stops) — default is the vertical list.
    function getMenuRects() {
      if (cfg.menu && cfg.menu.layout) return cfg.menu.layout(api, chapters);
      return chapters.map((_, i) => ({ x: 14, y: MENU_TOP + i * ROW_H, w: W - 28, h: ROW_H - 8 }));
    }
    function menuHit(px, py) {
      const rects = getMenuRects();
      for (let i = 0; i < rects.length; i++) { const r = rects[i]; if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i; }
      return -1;
    }
    function defaultCard(info) {
      const { ch, i, x, y, w, h, sel, done, best } = info;
      gfx.rect(x, y, w, h, sel ? MT.panelSel : MT.panel); gfx.rectO(x, y, w, h, MT.border, 1);
      let tx = x + 10;
      if (ch.icon) { ch.icon(api, x + 18, y + h / 2); tx = x + 36; }
      txt((i + 1) + '. ' + ch.name, tx, y + 8, 10, done ? MT.nameDone : MT.name);
      txt(ch.sub || '', tx, y + 24, 9, MT.sub);
      if (done) txt('✓ ' + best, x + w - 58, y + 14, 9, MT.nameDone);
      else txt('▶', x + w - 18, y + 14, 11, sel ? MT.name : MT.sub);
    }
    function drawMenu() {
      backdrop('menu');
      if (cfg.menu && cfg.menu.title) cfg.menu.title(api, respect());
      else {
        txtCFit((cfg.title || '').toUpperCase(), W / 2, 22, 16, MT.title, true);
        txtCFit(cfg.menuLabel || 'CHOOSE YOUR CHAPTER', W / 2, 50, 9, MT.label);
        txtC(CUR + '  ' + respect(), W / 2, 68, 9, MT.cur);
      }
      const rects = getMenuRects();
      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i], r = rects[i];
        const info = { ch, i, x: r.x, y: r.y, w: r.w, h: r.h, sel: i === menuSel, done: !!save.done[ch.id], best: save.best[ch.id] || 0 };
        if (cfg.menu && cfg.menu.card) cfg.menu.card(api, info);
        else defaultCard(info);
      }
      if (allDone()) txtCFit('★ ' + (cfg.menuDone || 'ALL CHAPTERS CLEARED') + ' ★', W / 2, H - 22, 9, MT.title);
      else txtCFit(cfg.menuHint || 'TAP A CHAPTER TO PLAY', W / 2, H - 20, 8, MT.hint);
      vignette(); scanlines();
    }

    function drawIntro() {
      if (cfg.renderIntro) { cfg.renderIntro(api, { ch: cur, i: curIndex, sceneT }); return; }
      backdrop('intro');
      txtCFit((LBL.chapter + ' ' + (curIndex + 1)).trim(), W / 2, 54, 9, ST.chapterLabel);
      txtCFit(cur.name, W / 2, 74, 15, ST.name, true);
      txtCFit(cur.sub || '', W / 2, 100, 9, ST.sub);
      // wrap every narrative line to the screen width so nothing clips
      const introLines = (cur.intro || []).flatMap((l) => wrapFit(l, 11, W - 24, false));
      lines(introLines, W / 2, 150, 11, ST.intro, 18);
      if (cur.quote) {
        const wrapped = wrapFit('“' + cur.quote + '”', 10, W - 24, false);
        lines(wrapped, W / 2, 270, 10, ST.quote, 16);
      }
      if (cur.help) txtCHead(cur.help, W / 2, H - 78, 9, ST.help, false, 12);
      if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.35) txtC(LBL.play || 'TAP TO PLAY', W / 2, H - 44, 12, ST.cta);
      vignette(); scanlines();
    }

    function drawResult() {
      if (cfg.renderResult) { cfg.renderResult(api, { ch: cur, result, respect: respect(), sceneT }); return; }
      // the chapter's last frame sits underneath, dimmed, so the score screen
      // still wears the world it was just played in. This is decorative — a
      // chapter whose draw isn't safe at its terminal state (e.g. a step counter
      // sitting one past its array after a win) must never crash the result
      // screen, so guard it.
      if (cur.draw) { ctx.globalAlpha = 0.5; try { cur.draw.call(cur, api); } catch (e) {} ctx.globalAlpha = 1; }
      gfx.rect(0, 0, W, H, ST.overlay);
      const won = result.won;
      // headline wraps to fit the screen; push the outcome text below it
      const headTop = H * 0.3;
      const headLines = txtCHead(won ? LBL.win : LBL.lose, W / 2, headTop, 14, won ? ST.win : ST.lose, true, 18);
      const outcome = won ? (cur.winText || '') : (cur.loseText || '');
      if (outcome) lines(wrapText(outcome, 26), W / 2, headTop + headLines * 18 + 10, 10, ST.intro, 15);
      txtC(LBL.score + '  ' + result.score, W / 2, H * 0.56, 11, ST.score);
      txtC(CUR + '  ' + respect(), W / 2, H * 0.56 + 20, 10, ST.cur);
      if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.4)
        txtC(result.finale ? LBL.finale : LBL.cont, W / 2, H * 0.74, 11, ST.cta);
      vignette(); scanlines();
    }

    function drawFinale() {
      if (cfg.renderFinale) { cfg.renderFinale(api, { respect: respect(), sceneT }); return; }
      backdrop('finale');
      if (cfg.emblem) cfg.emblem(api, W / 2, H * 0.3);
      lines(cfg.finale || ['THE LEGEND IS COMPLETE.'], W / 2, H * 0.46, 11, ST.win, 18);
      txtC('FINAL ' + CUR + '  ' + respect(), W / 2, H * 0.66, 11, ST.score);
      txtC(cfg.tagline || 'A POLECAT GAME', W / 2, H * 0.74, 8, ST.chapterLabel);
      if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.6) txtC(LBL.toMenu, W / 2, H - 40, 11, ST.cta);
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
