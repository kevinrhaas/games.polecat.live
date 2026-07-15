/* ============================================================================
 * RetroSaga2 — the "Gen 2" (16-bit) epic shell for games.polecat.live
 * ----------------------------------------------------------------------------
 * A richer, more dynamic shell than the flat 5-chapter RetroSaga. Built on
 * RetroEngine + RetroGfx2 (js/retro-gfx2.js). A Gen-2 game is:
 *
 *   - a navigable HUB MAP you explore — every node is playable from the start
 *     (needs[] only orders the suggested path unless cfg.gateNodes), the hub IS
 *     the menu, with optional side-challenges
 *   - each node is a CHAPTER of multiple escalating PHASES ending in a mini-boss
 *   - PERSISTENT upgrades + currency carried across the whole run
 *   - CHOICES that set flags, and MULTIPLE ENDINGS chosen from those flags
 *
 * Config (see games/<id>/game.js for a full example):
 *   RetroSaga2.create({
 *     id, title, subtitle, accent, palette, currency,
 *     emblem(api,cx,cy), scenery(api,scene,t),
 *     map: { layout(api,nodes)->rects, node(api,info), title(api,st), links... },
 *     upgrades: { key:{name,icon,desc} },
 *     nodes: [ { id,name,sub,icon,intro,quote,help, needs:[ids], optional,
 *                choice:{prompt,options:[{label,flag}]}, grant:'key', reward:n,
 *                phases:[ {name,help,boss,init,update,draw,winText,loseText} ] } ],
 *     endings: [ { when(flags,save)->bool, title, lines:[...] } ],
 *     screens, labels, bootCta, ...
 *   })
 * Each phase's init/update/draw gets the same `api` as RetroSaga PLUS:
 *   api.g2 (Gfx2), api.up (upgrades owned), api.has(key), api.flags,
 *   api.phase (index), api.node (current node), api.grant(key).
 * The mini-game calls api.win()/api.lose() to end the current PHASE.
 * ============================================================================ */
(function (global) {
  'use strict';
  const Retro = global.Retro;
  if (!Retro) { console.error('RetroSaga2 requires retro-engine.js'); return; }
  if (!Retro.Gfx2) { console.error('RetroSaga2 requires retro-gfx2.js'); return; }
  const U = Retro.util;

  function create(cfg) {
    const W = cfg.width || 270, H = cfg.height || 480;
    const accent = cfg.accent || '#ffd966';
    const PAL = Object.assign({
      ink: '#0a0812', dark: '#141024', panel: '#0e0b18', gold: accent,
      cream: '#e8e0f0', dim: '#8a86a6', blood: '#c8102e', white: '#f4f0ff',
      shadow: 'rgba(0,0,0,.55)',
    }, cfg.palette || {});
    const nodes = cfg.nodes || [];
    const byId = {}; nodes.forEach((n) => { byId[n.id] = n; });
    const CUR = cfg.currency || 'SCORE';
    const SAVE_KEY = 'saga2.' + (cfg.id || cfg.title || 'game');

    // 16-bit tier: super-sample the buffer so type & lighting render crisp
    // (higher-resolution than the 8-bit grid) while pixel art stays hard-edged.
    const engine = new Retro.Engine({ width: W, height: H, parent: cfg.parent || '#game', touch: false, superSample: cfg.superSample || 3 });
    const ctx = engine.ctx, gfx = engine.gfx, input = engine.input, audio = engine.audio;
    const g2 = new Retro.Gfx2(ctx, W, H);

    /* ------------------------------ save ---------------------------------- */
    let save = { best: {}, done: {}, up: {}, flags: {}, cur: 0 };
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) save = Object.assign(save, s); } catch (e) {}
    const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} };
    const banked = () => save.cur || 0;
    const allDone = () => nodes.filter((n) => !n.optional).every((n) => save.done[n.id]);
    // 16-bit tier is an open journey — every level is reachable from the hub so
    // nothing blocks play. A game can opt back into prerequisite gating with
    // cfg.gateNodes:true (then node.needs locks apply as before).
    const nodeAvailable = (n) => !cfg.gateNodes || !n.needs || n.needs.every((id) => save.done[id]);

    /* ----------------------------- pointer -------------------------------- */
    const ptr = { x: W / 2, y: H / 2, down: false, justDown: false, justUp: false, dx: 0, dy: 0 };
    function mapPt(cx, cy) {
      const r = engine.canvas.getBoundingClientRect();
      ptr.x = U.clamp((cx - r.left) / r.width * W, 0, W);
      ptr.y = U.clamp((cy - r.top) / r.height * H, 0, H);
    }
    function pDown(x, y) { mapPt(x, y); ptr.down = true; ptr.justDown = true; audio.resume(); }
    function pMove(x, y) { const ox = ptr.x, oy = ptr.y; mapPt(x, y); ptr.dx = ptr.x - ox; ptr.dy = ptr.y - oy; }
    function pUp() { ptr.down = false; ptr.justUp = true; }
    const cv = engine.canvas;
    cv.addEventListener('mousedown', (e) => pDown(e.clientX, e.clientY));
    cv.addEventListener('mousemove', (e) => { if (ptr.down) pMove(e.clientX, e.clientY); });
    global.addEventListener('mouseup', () => pUp());
    cv.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.changedTouches[0]; pDown(t.clientX, t.clientY); }, { passive: false });
    cv.addEventListener('touchmove', (e) => { e.preventDefault(); const t = e.changedTouches[0]; pMove(t.clientX, t.clientY); }, { passive: false });
    cv.addEventListener('touchend', (e) => { e.preventDefault(); pUp(); }, { passive: false });
    const confirmPressed = () => ptr.justDown || input.pressed('a') || input.pressed('start') || input.pressed('b');

    /* --------------------------- text helpers ----------------------------- */
    // Three type roles for the 16-bit tier (all render crisp thanks to the
    // super-sampled buffer): pixel=true → chunky 8-bit face; pixel==='title' →
    // the game's higher-res display face (cfg.titleFont, e.g. an engraved serif)
    // for hero titles; else a clean high-res UI face for body/labels.
    // Period-correct default: a clean higher-res PIXEL face (not a modern vector
    // sans) — crisp on the super-sampled buffer but unmistakably 16-bit-era.
    const UIFONT = cfg.uiFont || "'Pixelify Sans','Press Start 2P',monospace";
    function fontFor(pixel, size) {
      if (pixel === 'title') return cfg.titleFont ? ('bold ' + size + "px " + cfg.titleFont) : (size + "px 'Press Start 2P'");
      if (pixel) return size + "px 'Press Start 2P'";
      return 'bold ' + size + 'px ' + UIFONT;
    }
    function txt(str, x, y, size, color, align, pixel) {
      ctx.fillStyle = color;
      ctx.font = fontFor(pixel, size);
      ctx.textAlign = align || 'left'; ctx.textBaseline = 'top';
      ctx.fillText(str, x, y); ctx.textAlign = 'left';
    }
    const txtC = (s, x, y, sz, c, pix) => txt(s, x, y, sz, c, 'center', pix);
    function lines(arr, x, y, size, color, lh, align) {
      arr.forEach((l, i) => txt(l, x, y + i * (lh || size + 4), size, color, align || 'center'));
    }
    function measure(str, size, pixel) {
      ctx.font = fontFor(pixel, size);
      return ctx.measureText(str).width;
    }
    function fitSize(str, size, maxW, pixel) { let s = size; while (s > 6 && measure(str, s, pixel) > maxW) s--; return s; }
    function wrapFit(str, size, maxW, pixel) {
      const words = String(str).split(' '), out = []; let line = '';
      for (const w of words) { const test = line ? line + ' ' + w : w; if (line && measure(test, size, pixel) > maxW) { out.push(line); line = w; } else line = test; }
      if (line) out.push(line); return out;
    }
    function txtCFit(str, x, y, size, color, pixel, maxW) { txtC(str, x, y, fitSize(str, size, maxW == null ? W - 16 : maxW, pixel), color, pixel); }
    function txtCHead(str, x, yTop, size, color, pixel, lh, maxW) {
      const mw = maxW == null ? W - 16 : maxW; let s = size;
      const longest = String(str).split(' ').reduce((a, b) => (measure(b, s, pixel) > measure(a, s, pixel) ? b : a), '');
      while (s > 6 && measure(longest, s, pixel) > mw) s--;
      const ls = wrapFit(str, s, mw, pixel); lines(ls, x, yTop, s, color, lh || s + 4, 'center'); return ls.length;
    }
    const clear = (c) => gfx.clear(c || PAL.ink);
    function vignette() {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.22, W / 2, H / 2, H * 0.62);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, PAL.shadow);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    function scanlines() { ctx.fillStyle = 'rgba(0,0,0,.06)'; for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1); }

    /* ------------------------------- juice -------------------------------- */
    let shakeT = 0, shakeAmt = 0, flashObj = null, parts = [];
    function shake(a, t) { shakeAmt = a; shakeT = t; }
    function flash(col, t) { flashObj = { col, t, max: t }; }
    function burst(x, y, col, n) { for (let i = 0; i < (n || 10); i++) parts.push({ x, y, vx: U.rand(-2, 2), vy: U.rand(-3, 1), life: U.rand(0.3, 0.8), col }); }
    function updateParts(dt) { parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= dt; }); parts = parts.filter((p) => p.life > 0); }
    function drawParts() { parts.forEach((p) => gfx.rect(p.x, p.y, 2, 2, p.col)); }

    /* ---------------------------- screen theme ---------------------------- */
    const ST = Object.assign({
      overlay: 'rgba(8,6,16,.82)', win: PAL.gold, lose: PAL.blood,
      chapterLabel: PAL.dim, name: PAL.gold, sub: PAL.blood,
      intro: PAL.cream, quote: PAL.dim, help: PAL.gold,
      score: PAL.cream, cur: PAL.gold, cta: PAL.cream,
    }, cfg.screens || {});
    const LBL = Object.assign({
      chapter: 'CHAPTER', phase: 'PHASE', score: 'SCORE',
      win: 'CHAPTER CLEARED', lose: 'YOU FALTERED', boss: 'FINAL TRIAL',
      cont: 'TAP TO CONTINUE', toMap: 'TAP FOR THE MAP', play: 'TAP TO PLAY',
      nextPhase: 'TAP TO PRESS ON',
    }, cfg.labels || {});

    /* --------------------------- mini-game api ---------------------------- */
    const api = {
      W, H, gfx, ctx, g2, input, audio, util: U, pointer: ptr, colors: PAL, engine,
      t: 0, dt: 0, score: 0,
      up: save.up, flags: save.flags,
      has(k) { return !!save.up[k]; },
      grant(k) { save.up[k] = true; persist(); },
      addScore(n) { this.score += n; },
      win() { endPhase(true); },
      lose() { endPhase(false); },
      shake, flash, burst,
      clear, txt, txtC, lines, txtCFit, txtCHead, wrapFit, fitSize, vignette, scanlines,
      rnd: U.rand, rint: U.randInt, chance: (p) => Math.random() < p, choice: U.choice,
      confirm: confirmPressed, keyDown: (b) => input.down(b), keyPressed: (b) => input.pressed(b),
      phase: 0, node: null,
    };

    /* ----------------------- scene state machine -------------------------- */
    let scene = 'boot', sceneT = 0, curNode = null, curNodeIdx = 0, phaseIdx = 0;
    let sel = 0, result = null, pendingChoice = null, endingChosen = null;
    function setScene(s) { scene = s; sceneT = 0; parts = []; }

    function firstAvailableIndex() {
      for (let i = 0; i < nodes.length; i++) if (nodeAvailable(nodes[i]) && !save.done[nodes[i].id]) return i;
      return 0;
    }
    function openNode(i) {
      const n = nodes[i]; if (!n || !nodeAvailable(n)) { audio.sfx('hurt'); return; }
      curNode = n; curNodeIdx = i; api.node = n;
      if (n.choice && !save.done[n.id]) { pendingChoice = n.choice; setScene('choice'); }
      else { phaseIdx = 0; setScene('intro'); }
    }
    function startPhase() {
      api.t = 0; api.score = 0; api.dt = 0; api.phase = phaseIdx; api.node = curNode;
      const ph = curNode.phases[phaseIdx];
      if (ph.init) ph.init.call(ph, api);
      setScene('play');
    }
    function endPhase(won) {
      const ph = curNode.phases[phaseIdx];
      const sc = Math.max(0, Math.round(api.score));
      const bestKey = curNode.id;
      if (!save.best[bestKey]) save.best[bestKey] = 0;
      save.best[bestKey] += sc;
      if (won) {
        const last = phaseIdx >= curNode.phases.length - 1;
        if (last) {
          save.done[curNode.id] = true;
          save.cur = banked() + (curNode.reward || 0) + sc;
          if (curNode.grant) save.up[curNode.grant] = true;
          result = { won: true, node: curNode, sc, nodeDone: true, finale: allDone() };
        } else {
          save.cur = banked() + sc;
          result = { won: true, node: curNode, sc, nodeDone: false, ph };
        }
      } else {
        result = { won: false, node: curNode, sc, ph };
      }
      persist();
      // pacing-audit surface: record how long the phase actually ran (api.t)
      if (global.__saga2Test) global.__saga2Test.last = { id: curNode.id, phase: phaseIdx, won, t: Math.round(api.t * 100) / 100 };
      setScene('result');
      audio.sfx(won ? 'win' : 'lose');
    }
    /* Headless test surface for pacing/crash audits (mirrors saga.js
       __sagaTest). Harmless in normal play — exposes node/phase ids plus a
       jump-straight-to-play so audits can reach boss phases directly. */
    global.__saga2Test = {
      nodes: nodes.map((n) => ({ id: n.id, phases: n.phases.length })),
      scene: () => scene,
      jump(i, p) {
        const n = nodes[i]; if (!n) return;
        curNode = n; curNodeIdx = i; api.node = n; pendingChoice = null;
        phaseIdx = Math.min(p || 0, Math.max(0, n.phases.length - 1));
        startPhase();
      },
    };
    function pickEnding() {
      const list = cfg.endings || [];
      for (const e of list) { try { if (e.when && e.when(save.flags, save)) return e; } catch (x) {} }
      return list[list.length - 1] || { title: cfg.finaleTitle || 'THE END', lines: cfg.finale || ['THE LEGEND IS COMPLETE.'] };
    }

    /* ------------------------------ update -------------------------------- */
    function update(dt) {
      sceneT += dt;
      if (shakeT > 0) shakeT -= dt;
      if (flashObj) { flashObj.t -= dt; if (flashObj.t <= 0) flashObj = null; }
      updateParts(dt);

      if (scene === 'boot') {
        if (confirmPressed()) { tryImmersive(); sel = firstAvailableIndex(); setScene('hub'); audio.sfx('select'); }
      } else if (scene === 'hub') {
        if (input.pressed('down') || input.pressed('right')) { sel = (sel + 1) % nodes.length; audio.sfx('blip'); }
        if (input.pressed('up') || input.pressed('left')) { sel = (sel + nodes.length - 1) % nodes.length; audio.sfx('blip'); }
        if (ptr.justDown) { const idx = hubHit(ptr.x, ptr.y); if (idx >= 0) { sel = idx; openNode(idx); } }
        if (input.pressed('a') || input.pressed('start')) openNode(sel);
      } else if (scene === 'choice') {
        if (ptr.justDown) {
          const idx = choiceHit(ptr.x, ptr.y);
          if (idx >= 0) {
            const opt = pendingChoice.options[idx];
            if (opt.flag) save.flags[opt.flag] = true; persist();
            pendingChoice = null; phaseIdx = 0; audio.sfx('select'); setScene('intro');
          }
        }
      } else if (scene === 'intro') {
        if (confirmPressed() && sceneT > 0.3) startPhase();
      } else if (scene === 'play') {
        api.dt = dt; api.t += dt;
        const ph = curNode.phases[phaseIdx];
        if (ph.update) ph.update.call(ph, api, dt);
      } else if (scene === 'result') {
        if (confirmPressed() && sceneT > 0.4) {
          if (!result.won) { phaseIdx = 0; setScene('hub'); }
          else if (result.finale) { endingChosen = pickEnding(); setScene('ending'); }
          else if (result.nodeDone) { sel = firstAvailableIndex(); setScene('hub'); }
          else { phaseIdx++; setScene('intro'); }
        }
      } else if (scene === 'ending') {
        if (confirmPressed() && sceneT > 0.6) setScene('hub');
      }
      ptr.justDown = false; ptr.justUp = false; ptr.dx = 0; ptr.dy = 0;
      global.__saga2Scene = scene; global.__saga2Phase = phaseIdx;
    }

    /* ------------------------------- draw --------------------------------- */
    function backdrop(s) { if (cfg.scenery) cfg.scenery(api, s, sceneT); else clear(s === 'hub' ? PAL.dark : PAL.ink); }

    function draw() {
      ctx.save();
      if (shakeT > 0) { const a = shakeAmt; ctx.translate((Math.random() - 0.5) * a, (Math.random() - 0.5) * a); }
      if (scene === 'boot') drawBoot();
      else if (scene === 'hub') drawHub();
      else if (scene === 'choice') drawChoice();
      else if (scene === 'intro') drawIntro();
      else if (scene === 'play') { const ph = curNode.phases[phaseIdx]; if (ph.draw) ph.draw.call(ph, api); drawParts(); drawHud(); }
      else if (scene === 'result') drawResult();
      else if (scene === 'ending') drawEnding();
      ctx.restore();
      if (flashObj) { ctx.globalAlpha = Math.max(0, flashObj.t / flashObj.max) * 0.8; clear(flashObj.col); ctx.globalAlpha = 1; }
    }

    function drawBoot() {
      if (cfg.renderBoot) { cfg.renderBoot(api, { sceneT, blink: Math.floor(sceneT * 1.5) % 2 === 0 }); return; }
      backdrop('boot');
      const cx = W / 2;
      if (cfg.emblem) cfg.emblem(api, cx, H * 0.30);
      // animated gleaming logo (16-bit standard) instead of flat pixel text
      const title = (cfg.title || '').toUpperCase();
      const tsize = fitSize(title, 24, W - 24, true);
      g2.gleamText(title, cx, H * 0.44, tsize, PAL.gold, sceneT, { bevel: g2.mix(PAL.gold, '#ffffff', 0.4), shadow: 'rgba(0,0,0,.7)', font: cfg.titleFont });
      txtCFit(cfg.subtitle || 'A 16-BIT EPIC', cx, H * 0.44 + tsize + 10, 10, PAL.cream, true);
      if (Math.floor(sceneT * 1.5) % 2 === 0) txtCFit(cfg.bootCta || 'TAP TO BEGIN', cx, H * 0.66, 12, PAL.cream);
      txtCFit(cfg.credit || 'A 16-BIT TRIBUTE', cx, H - 40, 8, PAL.dim);
      txtCFit(cfg.bootLine || (nodes.length + ' CHAPTERS · ONE LEGEND'), cx, H - 26, 8, PAL.dim);
      vignette(); scanlines();
    }

    // hub node rects: cfg.map.layout, else an auto grid
    function hubRects() {
      if (cfg.map && cfg.map.layout) return cfg.map.layout(api, nodes);
      return nodes.map((_, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        return { x: 30 + col * 120, y: 100 + row * 78, w: 100, h: 62 };
      });
    }
    function hubHit(px, py) {
      const r = hubRects();
      for (let i = 0; i < r.length; i++) { const q = r[i]; if (px >= q.x && px <= q.x + q.w && py >= q.y && py <= q.y + q.h) return i; }
      return -1;
    }
    function drawHub() {
      backdrop('hub');
      if (cfg.map && cfg.map.title) cfg.map.title(api, save, sceneT);
      else { txtCFit((cfg.title || '').toUpperCase(), W / 2, 20, 16, PAL.gold, 'title'); txtCFit(CUR + '  ' + banked(), W / 2, 46, 9, PAL.cream); }
      const rects = hubRects();
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i], r = rects[i];
        const info = { node: n, i, x: r.x, y: r.y, w: r.w, h: r.h, sel: i === sel, done: !!save.done[n.id], locked: !nodeAvailable(n), available: nodeAvailable(n), t: sceneT };
        if (cfg.map && cfg.map.node) cfg.map.node(api, info); else defaultNode(info);
      }
      if (allDone()) txtCFit('★ ' + (cfg.mapDone || 'THE TALE IS TOLD') + ' ★', W / 2, H - 22, 9, PAL.gold);
      else txtCFit(cfg.mapHint || 'CHOOSE WHERE TO GO', W / 2, H - 20, 8, PAL.dim);
      vignette(); scanlines();
    }
    function defaultNode(info) {
      const { node, i, x, y, w, h, sel: s, done, locked } = info;
      g2.roundRect(x, y, w, h, 8, locked ? 'rgba(20,16,32,.7)' : (s ? 'rgba(40,32,60,.95)' : 'rgba(18,14,28,.85)'), done ? PAL.gold : (s ? PAL.cream : PAL.dim), s ? 2 : 1);
      if (node.icon && !locked) node.icon(api, x + 20, y + h / 2);
      txtCFit((locked ? '🔒 ' : (i + 1) + '. ') + node.name, x + w / 2, y + 10, 9, locked ? PAL.dim : (done ? PAL.gold : PAL.cream), false, w - 12);
      txtCFit(locked ? 'LOCKED' : (node.sub || ''), x + w / 2, y + 28, 7, PAL.dim, false, w - 12);
      if (done) txtC('✓', x + w - 14, y + h - 18, 10, PAL.gold);
    }

    function drawChoice() {
      backdrop('intro');
      txtCFit((curNode.name || '').toUpperCase(), W / 2, 60, 13, ST.name, 'title');
      txtCHead(pendingChoice.prompt, W / 2, 110, 11, ST.intro, false, 16);
      const rects = choiceRects();
      pendingChoice.options.forEach((o, i) => {
        const r = rects[i];
        g2.roundRect(r.x, r.y, r.w, r.h, 8, 'rgba(20,16,34,.9)', ST.cta, 2);
        txtCHead(o.label, r.x + r.w / 2, r.y + r.h / 2 - 8, 9, ST.cta, false, 13, r.w - 14);
      });
      txtCFit('CHOOSE YOUR PATH', W / 2, H - 40, 9, ST.chapterLabel);
      vignette(); scanlines();
    }
    function choiceRects() {
      const n = pendingChoice.options.length, out = [], bw = W - 60, bh = 54, gap = 14;
      const total = n * bh + (n - 1) * gap, y0 = H / 2 - total / 2 + 20;
      for (let i = 0; i < n; i++) out.push({ x: 30, y: y0 + i * (bh + gap), w: bw, h: bh });
      return out;
    }
    function choiceHit(px, py) { const r = choiceRects(); for (let i = 0; i < r.length; i++) { const q = r[i]; if (px >= q.x && px <= q.x + q.w && py >= q.y && py <= q.y + q.h) return i; } return -1; }

    function drawIntro() {
      backdrop('intro');
      const ph = curNode.phases[phaseIdx];
      const many = curNode.phases.length > 1;
      txtCFit(LBL.chapter + ' ' + (curNodeIdx + 1) + (many ? (' · ' + (ph.boss ? LBL.boss : LBL.phase + ' ' + (phaseIdx + 1))) : ''), W / 2, 52, 9, ST.chapterLabel);
      txtCFit(ph.name || curNode.name, W / 2, 72, 15, ST.name, 'title');
      txtCFit(curNode.sub || '', W / 2, 98, 9, ST.sub);
      const intro = phaseIdx === 0 ? (curNode.intro || []) : [];
      const introLines = intro.flatMap((l) => wrapFit(l, 11, W - 24, false));
      lines(introLines, W / 2, 146, 11, ST.intro, 18);
      if (phaseIdx === 0 && curNode.quote) lines(wrapFit('“' + curNode.quote + '”', 10, W - 24, false), W / 2, 264, 10, ST.quote, 16);
      const help = ph.help || curNode.help;
      if (help) txtCHead(help, W / 2, H - 80, 9, ST.help, false, 12);
      if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.3) txtCFit(LBL.play, W / 2, H - 46, 12, ST.cta);
      vignette(); scanlines();
    }

    // in-play HUD: currency + phase pips + owned upgrades
    function drawHud() {
      // games whose phases draw their own status bar opt out so the two don't collide
      if (cfg.ownPhaseHud) return;
      g2.roundRect(4, 4, 92, 15, 5, 'rgba(8,6,16,.6)', null);
      txt(CUR + ' ' + banked(), 9, 8, 8, PAL.gold);
      if (curNode.phases.length > 1) {
        for (let i = 0; i < curNode.phases.length; i++) gfx.rect(W - 12 - i * 9, 8, 6, 6, i < phaseIdx ? PAL.gold : (i === phaseIdx ? PAL.cream : 'rgba(255,255,255,.2)'));
      }
    }

    function drawResult() {
      const ph = curNode.phases[phaseIdx];
      if (ph.draw) { ctx.globalAlpha = 0.4; ph.draw.call(ph, api); ctx.globalAlpha = 1; }
      gfx.rect(0, 0, W, H, ST.overlay);
      const won = result.won;
      let header = won ? (result.nodeDone ? LBL.win : (LBL.nextPhaseWin || 'PHASE CLEARED')) : LBL.lose;
      const headLines = txtCHead(header, W / 2, H * 0.28, 14, won ? ST.win : ST.lose, 'title', 18);
      const outcome = won ? (result.nodeDone ? (curNode.winText || '') : (ph.winText || '')) : (ph.loseText || curNode.loseText || '');
      if (outcome) lines(wrapFit(outcome, 10, W - 40, false), W / 2, H * 0.28 + headLines * 18 + 10, 10, ST.intro, 15);
      if (won && result.nodeDone && curNode.grant && cfg.upgrades && cfg.upgrades[curNode.grant]) {
        txtCFit('NEW: ' + cfg.upgrades[curNode.grant].name, W / 2, H * 0.52, 9, PAL.gold);
      }
      txtCFit(LBL.score + '  ' + result.sc, W / 2, H * 0.58, 11, ST.score);
      txtCFit(CUR + '  ' + banked(), W / 2, H * 0.58 + 20, 10, ST.cur);
      const cta = !won ? LBL.toMap : (result.finale ? (LBL.toFinale || 'TAP FOR THE END') : (result.nodeDone ? LBL.toMap : LBL.nextPhase));
      if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.4) txtCFit(cta, W / 2, H * 0.74, 11, ST.cta);
      vignette(); scanlines();
    }

    function drawEnding() {
      backdrop('finale');
      const e = endingChosen || pickEnding();
      if (cfg.emblem) cfg.emblem(api, W / 2, H * 0.26);
      txtCFit(e.title || 'THE END', W / 2, H * 0.42, 15, ST.win, 'title');
      lines((e.lines || []).flatMap((l) => wrapFit(l, 11, W - 30, false)), W / 2, H * 0.50, 11, ST.intro, 18);
      txtCFit('FINAL ' + CUR + '  ' + banked(), W / 2, H * 0.72, 11, ST.score);
      if (Math.floor(sceneT * 1.5) % 2 === 0 && sceneT > 0.6) txtCFit(LBL.toMap, W / 2, H - 40, 11, ST.cta);
      vignette(); scanlines();
    }

    /* ---------------------------- bar buttons ----------------------------- */
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) muteBtn.addEventListener('click', () => { muteBtn.textContent = audio.toggleMute() ? '🔇' : '🔊'; });
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) restartBtn.addEventListener('click', () => { setScene('hub'); });
    function tryImmersive() { try { if (!engine._immersive) engine.toggleImmersive(); } catch (e) {} }

    engine.run(update, draw);
    return { engine, api, save };
  }

  global.RetroSaga2 = { create };
})(window);
