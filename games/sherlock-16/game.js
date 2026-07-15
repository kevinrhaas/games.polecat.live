/* ============================================================================
 * SHERLOCK HOLMES — THE HOUND OF THE BASKERVILLES   (Gen 4 / 16-bit)
 * The great detective story as an open case-map: pinned photographs on a
 * sepia ordnance map of Dartmoor, each lead a run of escalating phases ending
 * in a confrontation; the lens, revolver, notebook and portrait carry across
 * the whole case; one choice on Baker Street decides how the tale is told.
 * Built on RetroEngine + RetroGfx2 + RetroSaga2.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  const C = {
    ink: '#0e0b06', night: '#0c1210', dusk: '#16201a',
    paper: '#e8dcb2', paperHi: '#f4ecd0', manila: '#cdbd8e', inkbrown: '#2a2210',
    gas: '#e8b850', gasHi: '#ffe9a8', brass: '#c9a14a',
    fog: '#9fb8a4', fogD: '#41544a', moor: '#28321f', moorD: '#18211a',
    phosphor: '#1aff6a', green: '#5dff8f', blood: '#a83028', tweed: '#7a6844',
    stone: '#4a4436', cream: '#efe2c2', dim: '#8f8060',
  };
  // woven Victorian pixel face for hero titles — period-correct 16-bit, not a
  // modern vector serif (Jacquard 12 reads like engraved newsprint).
  const TITLE = "'Jacquard 12','Press Start 2P',serif";

  /* ─── emblem: the lens over a giant pawprint ─── */
  function emblem(api, cx, cy) {
    const c = api.ctx, g2 = api.g2;
    g2.glow(cx, cy, 34, '#1aff6a', 0.35);
    // the pawprint (phosphor-tinged)
    c.fillStyle = '#173a22';
    c.beginPath(); c.arc(cx, cy + 7, 9, 0, 7); c.fill();
    [[-9, -4], [-3, -9], [4, -9], [10, -4]].forEach((p) => { c.beginPath(); c.arc(cx + p[0], cy + p[1], 3.4, 0, 7); c.fill(); });
    c.fillStyle = C.phosphor; c.globalAlpha = 0.5;
    c.beginPath(); c.arc(cx, cy + 7, 6, 0, 7); c.fill(); c.globalAlpha = 1;
    // the magnifying lens
    c.strokeStyle = C.brass; c.lineWidth = 4;
    c.beginPath(); c.arc(cx - 4, cy - 2, 17, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#8a6a3a'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(cx + 9, cy + 10); c.lineTo(cx + 24, cy + 25); c.stroke();
    c.strokeStyle = 'rgba(220,240,255,.35)'; c.lineWidth = 2;
    c.beginPath(); c.arc(cx - 9, cy - 7, 10, Math.PI * 0.9, Math.PI * 1.5); c.stroke();
  }

  /* ─── the shared night-moor scene: dusk sky, tors, the Hall, rolling fog,
   *     and a phosphoric glow that prowls the dark. ─── */
  function tors(c, W, y, step, amp, seed, color) {
    c.fillStyle = color; c.beginPath(); c.moveTo(0, y);
    for (let x = 0; x <= W; x += step) c.lineTo(x, y - amp * (0.3 + 0.7 * Math.abs(Math.sin(x * 0.045 + seed))));
    c.lineTo(W, y + 300); c.lineTo(0, y + 300); c.closePath(); c.fill();
  }
  function drawHall(api, t, baseY) {
    const c = api.ctx, g2 = api.g2, W = api.W;
    const hx = W - 92;
    c.fillStyle = '#090c08';
    c.fillRect(hx, baseY - 44, 62, 44);
    c.fillRect(hx - 10, baseY - 58, 18, 58); c.fillRect(hx + 54, baseY - 58, 18, 58); // twin towers
    c.beginPath(); c.moveTo(hx - 12, baseY - 58); c.lineTo(hx - 1, baseY - 70); c.lineTo(hx + 10, baseY - 58); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(hx + 52, baseY - 58); c.lineTo(hx + 63, baseY - 70); c.lineTo(hx + 74, baseY - 58); c.closePath(); c.fill();
    for (let x = hx + 4; x < hx + 58; x += 9) c.fillRect(x, baseY - 50, 5, 5); // battlements
    // two amber windows, one flickers like a candle carried past
    const fl = 0.6 + 0.4 * Math.sin(t * 7 + 1);
    c.fillStyle = g2.mix('#3a2a06', '#ffcf5a', fl); c.fillRect(hx + 12, baseY - 30, 7, 10);
    c.fillStyle = '#c89838'; c.fillRect(hx + 40, baseY - 34, 7, 10);
    g2.glow(hx + 15, baseY - 25, 12, '#e8a030', 0.35 * fl);
  }
  function moorScene(api, t, dim) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    g2.skyGradient([[0, '#0a100c'], [0.5, '#14231b'], [1, '#0a0f0a']]);
    g2.stars(t, 26, H * 0.4, '#c8d6c0');
    // gibbous moon behind thin cloud
    g2.glow(52, 58, 34, '#c8d6c0', 0.35);
    c.fillStyle = '#dfe8d8'; c.beginPath(); c.arc(52, 58, 17, 0, 7); c.fill();
    c.fillStyle = '#14231b'; c.beginPath(); c.arc(59, 52, 14, 0, 7); c.fill();
    tors(c, W, H * 0.56, 14, 30, 2.4, '#0d1510');
    tors(c, W, H * 0.66, 11, 22, 5.1, '#0a100b');
    drawHall(api, t, H * 0.66);
    // the prowling phosphoric glow, far off in the fog
    const gx = W / 2 + Math.sin(t * 0.35) * (W * 0.34), gy = H * 0.62 + Math.cos(t * 0.5) * 8;
    g2.glow(gx, gy, 20, C.phosphor, 0.16 + 0.08 * Math.sin(t * 3));
    g2.fog(t, { y0: H * 0.5, y1: H, bands: 6, color: '#7a927e', alpha: 0.07 });
    g2.embers(t, 10, { yBottom: H, yTop: H * 0.4, color: '#9fb8a4', speed: 0.05, size: 2, alpha: 0.25 });
    if (dim) { c.fillStyle = 'rgba(6,9,6,' + dim + ')'; c.fillRect(0, 0, W, H); }
  }
  function scenery(api, scene, t) {
    if (scene === 'hub') { drawMapBoard(api, t); return; }
    moorScene(api, t, (scene === 'intro' || scene === 'result' || scene === 'finale') ? 0.55 : 0);
  }

  /* ─── HUB: a sepia ordnance-survey map of Dartmoor on the study desk ─── */
  const NODES_XY = { baker: [24, 92], hall: [150, 142], naturalist: [22, 226], mire: [150, 272], hound: [82, 384] };
  const ORDER = ['baker', 'hall', 'mire', 'hound'];
  function drawMapBoard(api, t) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H;
    // desk beneath, then the aged chart
    c.fillStyle = '#241608'; c.fillRect(0, 0, W, H);
    c.fillStyle = C.paper; c.fillRect(8, 8, W - 16, H - 16);
    c.fillStyle = C.paperHi; c.fillRect(8, 8, W - 16, 3);
    // foxing / age stains (deterministic)
    for (let i = 0; i < 90; i++) {
      const x = (i * 67 + 21) % (W - 30) + 12, y = (i * 113 + 37) % (H - 30) + 12;
      c.fillStyle = 'rgba(120,90,40,' + (0.04 + (i % 5) * 0.012) + ')';
      c.beginPath(); c.arc(x, y, 2 + (i % 4), 0, 7); c.fill();
    }
    // contour rings around each tor site
    c.strokeStyle = 'rgba(120,100,50,.4)'; c.lineWidth = 1;
    [[70, 190, 3], [210, 110, 2], [200, 350, 3], [50, 330, 2], [130, 60, 2]].forEach((tor) => {
      for (let r = 1; r <= tor[2]; r++) { c.beginPath(); c.ellipse(tor[0], tor[1], r * 9, r * 6, 0.3, 0, 7); c.stroke(); }
    });
    // the Grimpen Mire — hatched marsh with a phosphor tinge
    c.save(); c.beginPath(); c.ellipse(196, 322, 56, 42, -0.2, 0, 7); c.clip();
    c.fillStyle = 'rgba(90,120,70,.18)'; c.fillRect(120, 270, 160, 110);
    c.strokeStyle = 'rgba(70,100,60,.5)';
    for (let yy = 276; yy < 372; yy += 7) { c.beginPath(); c.moveTo(130, yy); c.lineTo(262, yy + 3); c.stroke(); }
    c.restore();
    const gl = 0.1 + 0.05 * Math.sin(t * 2);
    g2.glow(196, 322, 30, C.phosphor, gl);
    // compass rose
    c.strokeStyle = 'rgba(90,70,30,.7)'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(W - 34, H - 40, 13, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(W - 34, H - 56); c.lineTo(W - 30, H - 40); c.lineTo(W - 34, H - 24); c.lineTo(W - 38, H - 40); c.closePath();
    c.fillStyle = 'rgba(120,50,40,.75)'; c.fill();
    // red case-string between the pinned leads
    c.save(); c.setLineDash([5, 6]); c.lineDashOffset = -(t * 18) % 1000;
    c.strokeStyle = 'rgba(176,40,40,.8)'; c.lineWidth = 2;
    c.beginPath(); ORDER.forEach((id, i) => { const p = NODES_XY[id], px = p[0] + 48, py = p[1] + 32; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke();
    c.restore();
    // burnt vignette edges
    g2.fog(t * 0.3, { y0: H - 60, y1: H, bands: 2, color: '#c8b880', alpha: 0.05 });
  }
  const ART = {
    baker(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#171310'; c.fillRect(x, y, w, h); c.fillStyle = '#241c12'; c.fillRect(x, y + h - 8, w, 8); const lx = x + w * 0.22; c.fillStyle = '#2a2418'; c.fillRect(lx - 1, y + 6, 3, h - 10); c.fillStyle = g2.mix('#3a2c08', '#ffd97a', 0.6 + 0.4 * Math.sin(t * 6)); c.fillRect(lx - 3, y + 4, 7, 6); g2.glow(lx, y + 7, 11, '#e8b040', 0.5); c.fillStyle = '#0c0a06'; c.fillRect(x + w - 30, y + 8, 22, h - 14); c.fillStyle = '#e8c060'; c.fillRect(x + w - 26, y + 12, 6, 8); },
    hall(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#0d1410'; c.fillRect(x, y, w, h); c.fillStyle = '#080b07'; c.fillRect(x + w / 2 - 18, y + 8, 36, h - 8); c.fillRect(x + w / 2 - 26, y + 4, 10, h - 4); c.fillRect(x + w / 2 + 16, y + 4, 10, h - 4); const fl = 0.5 + 0.5 * Math.sin(t * 5); c.fillStyle = g2.mix('#241c04', '#ffd97a', fl); c.fillRect(x + w / 2 - 8, y + 18, 5, 7); g2.glow(x + w / 2 - 6, y + 21, 9, '#e8a030', 0.4 * fl); g2.fog(t, { y0: y + h - 12, y1: y + h, bands: 2, color: '#7a927e', alpha: 0.15 }); },
    naturalist(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#7ab2c8'); gr.addColorStop(1, '#5a8a4a'); c.fillStyle = gr; c.fillRect(x, y, w, h); g2.glow(x + w * 0.8, y + 6, 10, '#fff0b0', 0.6); c.fillStyle = '#f4e8b0'; c.beginPath(); c.arc(x + w * 0.8, y + 6, 5, 0, 7); c.fill(); const bx = x + w / 2 + Math.sin(t * 2.2) * 10, by = y + h / 2 + Math.cos(t * 3.1) * 5; const wf = Math.sin(t * 16) > 0; c.fillStyle = '#e8a030'; c.fillRect(bx - (wf ? 5 : 3), by, 4, 3); c.fillRect(bx + 1, by, 4, 3); c.fillStyle = '#3a2a10'; c.fillRect(bx - 1, by, 2, 4); },
    mire(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#131a10'; c.fillRect(x, y, w, h); for (let i = 0; i < 3; i++) { const px = x + 12 + i * (w / 3), py = y + h - 10 - (i % 2) * 8; g2.glow(px, py, 9, C.phosphor, 0.25 + 0.15 * Math.sin(t * 3 + i * 2)); c.fillStyle = '#1d2c17'; c.beginPath(); c.ellipse(px, py, 9, 4, 0, 0, 7); c.fill(); } g2.fog(t, { y0: y + 4, y1: y + h, bands: 3, color: '#7a927e', alpha: 0.12 }); },
    hound(api, x, y, w, h, t) { const c = api.ctx, g2 = api.g2; c.fillStyle = '#060a07'; c.fillRect(x, y, w, h); g2.fog(t, { y0: y + 2, y1: y + h, bands: 3, color: '#41544a', alpha: 0.2 }); const ex = x + w / 2 + Math.sin(t * 0.8) * 8; const blink = Math.sin(t * 1.7) > -0.85; if (blink) { g2.glow(ex, y + h / 2, 13, C.phosphor, 0.6); c.fillStyle = C.phosphor; c.fillRect(ex - 6, y + h / 2 - 2, 4, 4); c.fillRect(ex + 3, y + h / 2 - 2, 4, 4); } },
  };
  const menu = {
    title(api, save, t) {
      const c = api.ctx, g2 = api.g2, W = api.W;
      // manila case-file tab as the header
      g2.roundRect(20, 12, W - 40, 40, 4, '#d8c89a', '#8a7648', 2);
      c.fillStyle = '#c4b078'; c.fillRect(20, 12, W - 40, 5);
      g2.gleamText('THE BASKERVILLE CASE', W / 2, 19, api.fitSize('THE BASKERVILLE CASE', 13, W - 56, 'title'), '#3a2c10', t, { shadow: 'rgba(255,250,220,.5)', gleam: 'rgba(140,96,30,.9)', gleamSpeed: 60, font: TITLE });
      c.fillStyle = '#a83028'; c.beginPath(); c.arc(W / 2 - 42, 44, 3, 0, 7); c.fill();
      api.txtCFit('INSIGHT  ' + (save.cur || 0), W / 2 + 6, 39, 9, '#7a1818');
    },
    layout() { return ['baker', 'hall', 'naturalist', 'mire', 'hound'].map((id) => ({ x: NODES_XY[id][0], y: NODES_XY[id][1], w: 96, h: 70 })); },
    node(api, info) {
      const c = api.ctx, g2 = api.g2, { node, x, y, w, h, sel, done, t } = info;
      const cx = x + w / 2;
      if (sel) g2.glow(cx, y + (h - 14) / 2, 50, '#c8a030', 0.3 + 0.15 * Math.sin(t * 4));
      // a sepia photograph pinned to the chart
      g2.softShadow(x + 2, y + 4, w, h - 12, 6, 'rgba(40,25,5,.45)');
      c.fillStyle = sel ? '#fffdf0' : '#f2ead2'; c.fillRect(x, y, w, h - 14);
      c.strokeStyle = sel ? '#a83028' : '#a89468'; c.lineWidth = sel ? 2 : 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 15);
      c.save(); c.beginPath(); c.rect(x + 5, y + 5, w - 10, h - 32); c.clip();
      if (ART[node.id]) ART[node.id](api, x + 5, y + 5, w - 10, h - 32, t);
      c.restore();
      // brass pin
      c.fillStyle = '#c9a14a'; c.beginPath(); c.arc(cx, y + 3, 4, 0, 7); c.fill();
      c.fillStyle = '#8a6a2a'; c.beginPath(); c.arc(cx + 1, y + 4, 2, 0, 7); c.fill();
      // pencilled caption
      api.txtCFit((node.optional ? '◆ ' : '') + node.name, cx, y + h - 25, 7, '#3a2c10', false, w - 10);
      if (done) { // red SOLVED stamp
        c.save(); c.translate(cx, y + (h - 14) / 2); c.rotate(-0.22); c.globalAlpha = 0.85;
        c.strokeStyle = '#a83028'; c.lineWidth = 2; c.strokeRect(-30, -8, 60, 16);
        api.txtC('SOLVED', 0, -6, 9, '#a83028'); c.restore();
      }
      if (sel) { // the lens hovers over the chosen lead
        const ly = y - 7 + Math.sin(t * 5) * 2;
        c.strokeStyle = C.brass; c.lineWidth = 2.5; c.beginPath(); c.arc(cx + 30, ly, 7, 0, 7); c.stroke();
        c.strokeStyle = '#8a6a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx + 35, ly + 5); c.lineTo(cx + 41, ly + 11); c.stroke();
      }
    },
  };

  /* ─── animated title: fog, the Hall, green eyes, pawprints tracking in ─── */
  function renderBoot(api, info) {
    const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = info.sceneT;
    moorScene(api, t, 0.15);
    // pawprints stalk across the foreground, one by one
    for (let i = 0; i < 7; i++) {
      const ph = (t * 0.55 - i * 0.4) % 3;
      if (ph > 0 && ph < 2.2) {
        const a = Math.min(1, ph) * (ph > 1.7 ? (2.2 - ph) * 2 : 1);
        const px = 22 + i * 36, py = H - 54 - (i % 2) * 14;
        c.globalAlpha = a * 0.75; c.fillStyle = C.phosphor;
        c.beginPath(); c.arc(px, py + 3, 4, 0, 7); c.fill();
        [[-4, -3], [0, -5], [4, -3]].forEach((p) => { c.beginPath(); c.arc(px + p[0], py + p[1], 1.7, 0, 7); c.fill(); });
        c.globalAlpha = 1;
      }
    }
    // green eyes open in the far fog
    if (Math.sin(t * 0.9) > -0.4) {
      const ex = W * 0.72 + Math.sin(t * 0.5) * 12;
      g2.glow(ex, H * 0.58, 16, C.phosphor, 0.5);
      c.fillStyle = C.phosphor; c.fillRect(ex - 7, H * 0.58 - 2, 5, 4); c.fillRect(ex + 3, H * 0.58 - 2, 5, 4);
    }
    emblem(api, W / 2, H * 0.20);
    const ts = api.fitSize('SHERLOCK', 30, W - 24, 'title');
    g2.gleamText('SHERLOCK', W / 2, H * 0.31, ts, C.cream, t, { bevel: '#fff8e0', shadow: 'rgba(0,0,0,.8)', gleamSpeed: 55, font: TITLE });
    const hs = api.fitSize('HOLMES', 26, W - 60, 'title');
    g2.gleamText('HOLMES', W / 2, H * 0.31 + ts + 4, hs, C.brass, t + 0.5, { bevel: '#ffe9a8', shadow: 'rgba(0,0,0,.8)', gleamSpeed: 55, font: TITLE });
    api.txtCFit('THE HOUND OF THE BASKERVILLES', W / 2, H * 0.31 + ts + hs + 14, 9, C.green, true);
    if (info.blink) api.txtCFit('▸ TAP TO TAKE THE CASE ◂', W / 2, H * 0.70, 12, C.cream);
    api.txtCFit('A 16-BIT MYSTERY · A. C. DOYLE, 1902', W / 2, H - 28, 8, C.dim);
    api.vignette(); api.scanlines();
  }

  /* ============================ 16-bit sprites ============================ */
  const HOLMES_A = [ // deerstalker, caped greatcoat, pipe — 2 stride frames
    '..hhhh..', '.hhHHhh.', '.hsffsh.', '..ff.p..', '.kTTTTk.',
    'kTTttTTk', 'kTt..tTk', '.kT..Tk.', '.bb..bb.', 'oo....oo',
  ];
  const HOLMES_B = [
    '..hhhh..', '.hhHHhh.', '.hsffsh.', '..ff.p..', '.kTTTTk.',
    'kTTttTTk', '.kTttTk.', 'bkT..Tkb', 'o.b..b.o', '.o....o.',
  ];
  const HPAL = { h: '#4a3c22', H: '#6a5834', s: '#3a2e18', f: '#d8b088', p: '#5a4426', k: '#241c10', T: '#4e4228', t: '#6a5a38', b: '#1c160c', o: '#141008' };
  const HENRY = ['..cccc..', '.chffhc.', '.cffffc.', '..ffff..', '.kCCCCk.', 'kCCggCCk', 'kCg..gCk', '.kC..Ck.', '.bb..bb.'];
  const HENRYPAL = { c: '#5a4830', h: '#7a6444', f: '#e0b890', k: '#1a140a', C: '#3c3424', g: '#5a5038', b: '#241c10' };
  const HANSOM = ['...kkkk...', '..kKKKKk..', '.kKKKKKKk.', '.kKwKKwKk.', 'ykKKKKKKky', '.y.kkkk.y.', '..y.....y.'];
  const HANSOMPAL = { k: '#141008', K: '#241c12', w: '#e8c060', y: '#8a6a2a' };
  const SELDEN_AWAY = ['..kk..', '.kJJk.', '.kJJk.', 'kJJJJk', 'kJsJsk', 'kJJJJk', '.k..k.'];
  const SELDEN_WATCH = ['..kk..', '.kffk.', '.kffk.', 'kJJJJk', 'kJsJsk', 'kJJJJk', '.k..k.'];
  const SELDENPAL = { k: '#12100a', J: '#7a7258', s: '#3a3626', f: '#d8b088' };
  const HOUND_A = [
    'k........k', 'kk......kk', 'kkk....kkk', 'kkkkkkkkkk', 'gkkkkkkkkg',
    'kkkkkkkkkk', 'kkKKkkKKkk', 'k.kk..kk.k', 'k.k....k.k', '.k......k.',
  ];
  const HOUND_B = [
    'k........k', 'kk......kk', 'kkk....kkk', 'kkkkkkkkkk', 'gkkkkkkkkg',
    'kkkkkkkkkk', 'kkKKkkKKkk', 'kk.k..k.kk', '.k.k..k.k.', 'k........k',
  ];
  const HOUNDPAL = { k: '#0a1a0e', K: '#132a16', g: '#1aff6a' };
  const STAPLETON = ['..ss..', '.sffs.', '.sffs.', 'sGGGGs', 'sG..Gs', '.b..b.'];
  const STAPLETONPAL = { s: '#c8b878', f: '#e0b890', G: '#8a9a68', b: '#3a3424' };

  /* ====================== BAKER STREET p1: the stick ===================== */
  function stick() {
    return {
      name: 'THE WALKING STICK', boss: false, help: 'TAP the four telling details on the cane',
      winText: '"A country doctor — and he keeps a dog." Mortimer, to the life.',
      loseText: 'The details swim in the lamplight. The visitor returns first.',
      init(api) {
        this.clues = [
          { x: 96, y: 148, r: 22, found: false, t: '"C.C.H." — a hunt club gift' },
          { x: 128, y: 218, r: 22, found: false, t: 'Engraved 1884 — a parting gift' },
          { x: 160, y: 290, r: 22, found: false, t: 'Worn ferrule — a great walker' },
          { x: 190, y: 356, r: 20, found: false, t: 'Tooth-marks — he keeps a dog' },
        ];
        this.timer = 40; this.wrong = 0; this.msg = ''; this.msgT = 0;
      },
      update(api, dt) {
        this.timer -= dt; if (this.msgT > 0) this.msgT -= dt;
        if (api.pointer.justDown) {
          let hit = false;
          for (const cl of this.clues) {
            if (!cl.found && Math.hypot(api.pointer.x - cl.x, api.pointer.y - cl.y) < cl.r) {
              cl.found = true; hit = true; api.addScore(60); api.audio.sfx('coin'); api.burst(cl.x, cl.y, C.brass, 8); this.msg = cl.t; this.msgT = 2.4;
            }
          }
          if (!hit && api.pointer.y > 100 && api.pointer.y < 400) {
            this.wrong++; api.shake(4, 0.2); api.audio.sfx('hurt');
            if (this.wrong >= 5) return api.lose();
          }
        }
        if (this.clues.every((cl) => cl.found)) { api.addScore(Math.floor(this.timer * 4)); api.win(); }
        else if (this.timer <= 0) api.lose();
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        // the study at 221B — striped wallpaper, wainscot, fire and fogged window
        g2.verticalGradient(0, 0, W, H, [[0, '#2a1f12'], [1, '#17110a']]);
        c.fillStyle = 'rgba(90,60,30,.25)'; for (let x = 8; x < W; x += 26) c.fillRect(x, 0, 9, H - 82);
        c.fillStyle = '#241808'; c.fillRect(0, H - 82, W, 82); c.fillStyle = '#3a2a12'; c.fillRect(0, H - 82, W, 5);
        // fireplace, left
        c.fillStyle = '#1c1208'; c.fillRect(10, H - 168, 62, 86);
        c.fillStyle = '#0c0804'; c.fillRect(20, H - 148, 42, 66);
        g2.flame(41, H - 104, t, 1.5, { glow: 'rgba(255,150,40,.8)' });
        g2.glow(41, H - 110, 52, '#e08030', 0.35 + 0.06 * Math.sin(t * 8));
        // window, right — fog beyond the panes
        c.fillStyle = '#0a0e10'; c.fillRect(W - 76, 26, 58, 92);
        g2.fog(t, { y0: 30, y1: 114, bands: 3, color: '#7a8a90', alpha: 0.12 });
        c.fillStyle = '#3a2c14'; c.fillRect(W - 78, 24, 62, 4); c.fillRect(W - 78, 114, 62, 4);
        c.fillRect(W - 50, 26, 3, 92); c.fillRect(W - 78, 68, 62, 3); c.fillRect(W - 78, 24, 3, 92); c.fillRect(W - 19, 24, 3, 92);
        // Holmes in his armchair, pipe smoke curling
        c.fillStyle = '#241a0e'; c.fillRect(14, H - 236, 58, 70);
        c.fillStyle = '#2e2212'; c.fillRect(10, H - 240, 66, 12);
        g2.bigSprite(['..hh..', '.hffh.', '.ffp..', '.kkkk.', 'kkkkkk'], 26, H - 226, { h: '#4a3c22', f: '#d8b088', p: '#5a4426', k: '#302416' }, 5, { outline: '#0c0804' });
        for (let i = 0; i < 4; i++) { const sp = (t * 0.5 + i * 0.25) % 1; c.globalAlpha = (1 - sp) * 0.3; c.fillStyle = '#b8c0c8'; c.beginPath(); c.arc(56 + Math.sin(t * 2 + i * 2) * 5, H - 224 - sp * 46, 2.5 + sp * 4, 0, 7); c.fill(); c.globalAlpha = 1; }
        // the cane, laid diagonal on the examination table (lamplit)
        g2.glow(150, 250, 88, '#e8b850', 0.16);
        c.save(); c.translate(80, 130); c.rotate(0.62);
        c.fillStyle = '#6a4a1c'; c.fillRect(0, -5, 240, 10);
        c.fillStyle = '#8a6430'; c.fillRect(0, -5, 240, 3);
        c.fillStyle = '#c9a14a'; c.fillRect(-16, -8, 26, 16); // silver band
        c.fillStyle = '#e8d090'; c.fillRect(-16, -8, 26, 4);
        c.fillStyle = '#4a3010'; c.fillRect(214, -7, 26, 14); // ferrule
        c.fillStyle = '#2a1a08'; [186, 196, 204].forEach((bx) => { c.fillRect(bx, -7, 4, 4); c.fillRect(bx + 2, 3, 4, 4); }); // tooth-marks
        c.restore();
        c.fillStyle = '#9a7a3a'; c.beginPath(); c.arc(88, 128, 13, 0, 7); c.fill();
        c.fillStyle = '#caa15a'; c.beginPath(); c.arc(86, 126, 9, 0, 7); c.fill();
        // clue rings
        for (const cl of this.clues) {
          if (cl.found) { c.strokeStyle = C.brass; c.lineWidth = 2; c.beginPath(); c.arc(cl.x, cl.y, cl.r - 5, 0, 7); c.stroke(); api.txtC('✓', cl.x, cl.y - 6, 11, C.brass); }
          else {
            const pu = 0.16 + Math.sin(t * 3 + cl.y) * 0.09;
            g2.glow(cl.x, cl.y, cl.r, '#cde8b0', pu);
            c.strokeStyle = 'rgba(205,232,176,.55)'; c.lineWidth = 1.5; c.beginPath(); c.arc(cl.x, cl.y, cl.r, 0, 7); c.stroke();
          }
        }
        // HUD + deduction panel
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(20,14,6,.8)', '#5a482a', 1);
        const found = this.clues.filter((cl) => cl.found).length;
        api.txt('DETAILS ' + found + '/4', 11, 8, 8, C.brass);
        g.rect(W - 76, 9, 66, 6, '#241c10'); g.rect(W - 76, 9, 66 * clamp(this.timer / 40, 0, 1), 6, C.brass);
        if (this.msgT > 0) { g2.roundRect(14, H - 44, W - 28, 30, 5, 'rgba(240,230,200,.95)', '#8a7648', 1); api.txtCFit(this.msg, W / 2, H - 34, 9, '#2a2210', false, W - 40); }
        else api.txtCFit('READ THE MAN FROM HIS STICK', W / 2, H - 36, 8, C.dim);
        api.vignette();
      },
    };
  }
  /* ================== BAKER STREET p2 (boss): the spy's cab ============== */
  function hansom() {
    return {
      name: 'THE BEARDED SPY', boss: true, help: 'DRAG to run the pavement · keep the cab in sight',
      winText: 'Cab No. 2704 — the number is yours before the fog takes him.',
      loseText: 'The hansom melts into the yellow fog of Regent Street.',
      init(api) { this.x = api.W / 2; this.z = 0; this.need = 320; this.lives = 3; this.imm = 0; this.obs = []; this.spawnT = 0.8; this.cab = api.W / 2; this.cd = 1; },
      update(api, dt) {
        const W = api.W, H = api.H; this.z += 0.36 * dt * 60; this.imm = Math.max(0, this.imm - dt);
        this.cab += this.cd * 28 * dt; if (this.cab < 46 || this.cab > W - 46) this.cd *= -1;
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.25; this.x = clamp(this.x, 20, W - 20);
        this.spawnT -= dt; if (this.spawnT <= 0) { this.obs.push({ x: api.rnd(20, W - 20), y: H * 0.42, s: api.rnd(2.0, 3.0), kind: api.rint(0, 2) }); this.spawnT = api.rnd(0.55, 1.0); }
        for (const o of this.obs) o.y += o.s * dt * 60; this.obs = this.obs.filter((o) => o.y < H + 14);
        const py = H - 72;
        if (this.imm <= 0) for (const o of this.obs) if (Math.abs(o.x - this.x) < 15 && Math.abs(o.y - py) < 16) { o.y = H + 99; this.lives--; this.imm = 1.3; api.shake(6, 0.3); api.flash('#3a3020', 0.2); api.audio.sfx('hurt'); if (this.lives <= 0) return api.lose(); }
        api.score = Math.floor(this.z); if (this.z >= this.need) { api.addScore(70); api.win(); }
      },
      draw(api) {
        const W = api.W, H = api.H, c = api.ctx, g2 = api.g2, t = api.t;
        const hz = H * 0.42;
        // gaslit Regent Street at night, fog above the rooftops
        g2.skyGradient([[0, '#0b0d12'], [0.7, '#1a1a14'], [1, '#2a2415']], hz);
        g2.parallax(this.z * 2, [
          { speed: 0.3, draw: (ox) => { c.fillStyle = '#12100c'; g2.tiled(ox, 110, (x) => { c.fillRect(x + 6, hz - 74, 44, 74); c.fillRect(x + 58, hz - 58, 40, 58); c.fillStyle = '#e8c060'; for (let wy = hz - 64; wy < hz - 14; wy += 16) { c.fillRect(x + 14, wy, 5, 7); c.fillRect(x + 32, wy, 5, 7); } c.fillStyle = '#12100c'; }); } },
          { speed: 0.7, draw: (ox) => { c.fillStyle = '#0a0906'; g2.tiled(ox, 90, (x) => { c.fillRect(x + 4, hz - 40, 60, 40); c.fillStyle = '#c89838'; c.fillRect(x + 16, hz - 30, 6, 8); c.fillStyle = '#0a0906'; }); } },
        ]);
        // gas lamps marching down both pavements
        g2.tiled(this.z * 4, 92, (x) => {
          c.fillStyle = '#1a1710'; c.fillRect(x + 8, hz - 34, 3, 34);
          g2.glow(x + 9, hz - 36, 16, '#ffd97a', 0.5); c.fillStyle = '#ffe9a8'; c.fillRect(x + 6, hz - 40, 7, 8);
        });
        g2.fog(t, { y0: 0, y1: hz, bands: 4, color: '#8a8468', alpha: 0.08 });
        // mode-7 wet cobbles, lamplight caught in the gutter
        g2.mode7({ horizon: hz, camZ: this.z * 2, angle: Math.sin(t * 0.4) * 0.12, height: 1.15, fog: '#26221a', tex: (wx, wz) => { const kerb = Math.abs(wx) > 92 && Math.abs(wx) < 110; if (kerb) return '#4c4434'; const wet = ((Math.floor(wx / 24) * 7 + Math.floor(wz / 24) * 13) % 9) === 0; if (wet) return '#4a4030'; return ((Math.floor(wx / 24) + Math.floor(wz / 24)) & 1) ? '#332e22' : '#262218'; } });
        // the fleeing hansom near the horizon
        const cby = hz + 8 + Math.sin(t * 9) * 1.4;
        g2.glow(this.cab, cby + 4, 14, '#e8c060', 0.3);
        g2.bigSprite(HANSOM, this.cab - 15, cby - 12, HANSOMPAL, 3, { shadow: true, outline: '#080604' });
        // street obstacles: barrows & crossing sweepers
        for (const o of this.obs) {
          if (o.kind === 0) { c.fillStyle = '#3a2c14'; c.fillRect(o.x - 12, o.y - 6, 24, 10); c.fillStyle = '#5a4424'; c.fillRect(o.x - 12, o.y - 6, 24, 3); c.fillStyle = '#141008'; c.beginPath(); c.arc(o.x - 7, o.y + 6, 4, 0, 7); c.arc(o.x + 7, o.y + 6, 4, 0, 7); c.fill(); }
          else { g2.bigSprite(['.kk.', 'kffk', 'kkkk', 'k..k'], o.x - 6, o.y - 10, { k: '#1c1810', f: '#c8a078' }, 3, { outline: '#0a0806' }); }
        }
        // Holmes at full stride
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) g2.bigSprite(Math.floor(t * 8) % 2 ? HOLMES_B : HOLMES_A, this.x - 16, H - 88, HPAL, 4, { shadow: true, outline: '#0a0806' });
        g2.embers(t, 8, { yBottom: H, yTop: hz, color: '#a89868', speed: 0.1, size: 2, alpha: 0.3 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(14,12,6,.75)', '#5a482a', 1);
        api.txt('❤'.repeat(Math.max(0, this.lives)), 11, 8, 9, C.blood);
        api.txtCFit('THE CAB ' + Math.floor(this.z / this.need * 100) + '%', W - 50, 8, 8, C.cream, false, 90);
        api.vignette();
      },
    };
  }
  /* ==================== THE HALL p1: the pasted warning =================== */
  function warning() {
    return {
      name: 'THE PASTED WARNING', boss: false, help: 'TAP the cut-out words in reading order',
      winText: 'The warning reads whole. Someone fears for Sir Henry — or of him.',
      loseText: 'The paste-up scrambles to nonsense under the lamp.',
      init() {
        this.target = ['AS', 'YOU', 'VALUE', 'YOUR', 'LIFE', 'KEEP', 'AWAY', 'FROM', 'THE', 'MOOR'];
        this.placed = 0; this.wrong = 0;
        const order = this.target.map((w, i) => i);
        for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
        this.tiles = order.map((idx, k) => ({ idx, word: this.target[idx], x: 18 + (k % 3) * 80, y: 252 + Math.floor(k / 3) * 46, w: 74, h: 34, gone: false }));
      },
      update(api) {
        if (api.pointer.justDown) {
          for (const tl of this.tiles) {
            if (tl.gone) continue;
            if (api.pointer.x > tl.x && api.pointer.x < tl.x + tl.w && api.pointer.y > tl.y && api.pointer.y < tl.y + tl.h) {
              if (tl.idx === this.placed) { tl.gone = true; this.placed++; api.addScore(30); api.audio.sfx('coin'); api.burst(tl.x + tl.w / 2, tl.y + tl.h / 2, C.brass, 6); if (this.placed >= this.target.length) { api.addScore(80); api.win(); } }
              else { this.wrong++; api.shake(4, 0.2); api.audio.sfx('hurt'); if (this.wrong >= 4) api.lose(); }
              break;
            }
          }
        }
      },
      draw(api) {
        const g = api.gfx, c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        // the Northumberland Hotel desk — lamplight pooled on rich wood
        g2.verticalGradient(0, 0, W, H, [[0, '#1c1408'], [1, '#0e0a04']]);
        c.fillStyle = 'rgba(120,80,30,.14)'; for (let yy = 0; yy < H; yy += 18) c.fillRect(0, yy, W, 7);
        g2.glow(W / 2, 130, 130, '#e8b850', 0.2);
        // the brass lamp, top right
        c.fillStyle = '#1a5a3a'; c.beginPath(); c.ellipse(W - 42, 34, 26, 12, 0, Math.PI, 0); c.fill();
        c.fillStyle = '#c9a14a'; c.fillRect(W - 45, 34, 6, 20);
        g2.glow(W - 42, 40, 34, '#ffd97a', 0.4 + 0.05 * Math.sin(t * 9));
        // the letter itself
        g2.softShadow(18, 42, W - 36, 152, 8, 'rgba(0,0,0,.5)');
        c.fillStyle = '#e8dcb2'; c.fillRect(16, 40, W - 32, 152);
        c.fillStyle = '#f4ecd0'; c.fillRect(16, 40, W - 32, 4);
        c.strokeStyle = '#a89468'; c.lineWidth = 1; c.strokeRect(16.5, 40.5, W - 33, 151);
        // gleam sweeping the paper
        const gx = ((t * 40) % (W + 160)) - 80;
        const gr = c.createLinearGradient(gx - 40, 0, gx + 40, 0);
        gr.addColorStop(0, 'rgba(255,250,220,0)'); gr.addColorStop(0.5, 'rgba(255,250,220,.14)'); gr.addColorStop(1, 'rgba(255,250,220,0)');
        c.fillStyle = gr; c.fillRect(16, 40, W - 32, 152);
        // slots — pasted words appear as newsprint scraps
        let x = 26, y = 56;
        for (let i = 0; i < this.target.length; i++) {
          const wd = this.target[i], wpx = wd.length * 9 + 10;
          if (x + wpx > W - 26) { x = 26; y += 26; }
          if (i < this.placed) {
            c.save(); c.translate(x + wpx / 2, y + 10); c.rotate((i % 2 ? -1 : 1) * 0.04);
            c.fillStyle = '#f8f4e4'; c.fillRect(-wpx / 2, -10, wpx, 20); c.strokeStyle = '#b0a070'; c.strokeRect(-wpx / 2 + 0.5, -9.5, wpx - 1, 19);
            api.txtC(wd, 0, -6, 9, '#181408'); c.restore();
          } else { c.strokeStyle = 'rgba(140,120,70,.6)'; c.strokeRect(x + 0.5, y + 0.5, wpx - 1, 19); }
          x += wpx + 6;
        }
        // 'MOOR' in ink, per the book — the last word was hand-written
        api.txtCFit('— words cut from The Times', W / 2, 176, 8, '#8a7648');
        // loose scraps below
        for (const tl of this.tiles) {
          if (tl.gone) continue;
          g2.softShadow(tl.x + 2, tl.y + 3, tl.w, tl.h, 4, 'rgba(0,0,0,.45)');
          c.save(); c.translate(tl.x + tl.w / 2, tl.y + tl.h / 2); c.rotate(((tl.idx % 3) - 1) * 0.05);
          c.fillStyle = '#f2ead2'; c.fillRect(-tl.w / 2, -tl.h / 2, tl.w, tl.h);
          c.strokeStyle = '#9a8a58'; c.strokeRect(-tl.w / 2 + 0.5, -tl.h / 2 + 0.5, tl.w - 1, tl.h - 1);
          api.txtC(tl.word, 0, -6, 9, '#181408'); c.restore();
        }
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(14,10,4,.8)', '#5a482a', 1);
        api.txt('WORD ' + this.placed + '/' + this.target.length, 11, 8, 8, C.brass);
        for (let i = 0; i < 4; i++) g.rect(W - 58 + i * 13, 8, 9, 8, i < 4 - this.wrong ? C.green : '#3a2a1a');
        api.vignette();
      },
    };
  }
  /* ============== THE HALL p2 (boss): the candle at the window ============ */
  function candles() {
    return {
      name: 'THE NIGHT SIGNAL', boss: true, help: 'TAP the window the moment the candle shows',
      winText: 'Barrymore\'s secret is out — the light was for Selden, the convict.',
      loseText: 'The house goes dark. The signaller keeps his secret.',
      init(api) {
        this.wins = [];
        for (let r = 0; r < 2; r++) for (let col = 0; col < 3; col++) this.wins.push({ x: 44 + col * 70, y: 168 + r * 92, w: 44, h: 58 });
        this.lit = -1; this.litT = 0; this.hold = api.has('lens') ? 1.7 : 1.3; this.gap = api.rnd(0.8, 1.4);
        this.caught = 0; this.need = 8; this.missed = 0; this.max = 3;
      },
      update(api, dt) {
        if (this.lit < 0) {
          this.gap -= dt;
          if (this.gap <= 0) { this.lit = api.rint(0, this.wins.length - 1); this.litT = this.hold; api.audio.sfx('blip'); }
        } else {
          this.litT -= dt;
          if (this.litT <= 0) { this.lit = -1; this.gap = api.rnd(0.7, 1.3); this.missed++; api.audio.sfx('hurt'); api.shake(3, 0.15); if (this.missed >= this.max) return api.lose(); }
        }
        if (api.pointer.justDown) {
          const p = api.pointer;
          for (let i = 0; i < this.wins.length; i++) {
            const wn = this.wins[i];
            if (p.x > wn.x - 6 && p.x < wn.x + wn.w + 6 && p.y > wn.y - 6 && p.y < wn.y + wn.h + 6) {
              if (i === this.lit) {
                this.caught++; this.lit = -1; this.gap = api.rnd(0.6, 1.2); this.hold = Math.max(0.8, this.hold - 0.06);
                api.addScore(35); api.audio.sfx('coin'); api.burst(wn.x + wn.w / 2, wn.y + wn.h / 2, C.gasHi, 10);
                if (this.caught >= this.need) { api.addScore(70); api.win(); }
              } else { api.shake(3, 0.15); api.audio.sfx('hurt'); }
              break;
            }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // Baskerville Hall's stone face by moonlight
        g2.skyGradient([[0, '#0a0f0c'], [1, '#111a12']], 120);
        g2.stars(t, 20, 100, '#c8d6c0');
        g2.glow(W - 48, 44, 30, '#c8d6c0', 0.35); c.fillStyle = '#dfe8d8'; c.beginPath(); c.arc(W - 48, 44, 15, 0, 7); c.fill();
        c.fillStyle = '#14231b'; c.beginPath(); c.arc(W - 42, 39, 12, 0, 7); c.fill();
        g2.stoneWall(14, 120, W - 28, H - 170, { base: '#2c2a20', light: '#403c2e', dark: '#1a1812', mortar: '#100e0a', moss: '#26301e' }, 0);
        c.fillStyle = '#0e0c08'; c.fillRect(10, 112, W - 20, 10);
        for (let x = 20; x < W - 20; x += 16) c.fillRect(x, 104, 9, 9); // battlements
        // ivy patches
        c.fillStyle = 'rgba(40,70,35,.55)';
        [[20, 140, 30, 80], [W - 52, 210, 34, 110], [110, 300, 26, 70]].forEach((iv) => { for (let i = 0; i < 14; i++) { const px = iv[0] + ((i * 37) % iv[2]), py = iv[1] + ((i * 61) % iv[3]); c.beginPath(); c.arc(px, py, 4, 0, 7); c.fill(); } });
        // windows
        for (let i = 0; i < this.wins.length; i++) {
          const wn = this.wins[i], litNow = i === this.lit;
          c.fillStyle = '#0a0806'; c.fillRect(wn.x - 4, wn.y - 4, wn.w + 8, wn.h + 8);
          if (litNow) {
            const a = clamp(this.litT / this.hold, 0, 1);
            g2.glow(wn.x + wn.w / 2, wn.y + wn.h / 2, 44, '#ffd97a', 0.55 * (0.5 + 0.5 * a));
            c.fillStyle = g2.mix('#1a1206', '#e8b850', 0.4 + 0.6 * a); c.fillRect(wn.x, wn.y, wn.w, wn.h);
            // the candle itself
            c.fillStyle = '#f4ecd0'; c.fillRect(wn.x + wn.w / 2 - 2, wn.y + wn.h - 22, 4, 14);
            g2.flame(wn.x + wn.w / 2, wn.y + wn.h - 24, t, 0.8);
          } else { c.fillStyle = '#10130e'; c.fillRect(wn.x, wn.y, wn.w, wn.h); c.fillStyle = 'rgba(200,220,230,.05)'; c.fillRect(wn.x + 3, wn.y + 3, 10, wn.h - 8); }
          c.fillStyle = '#241c10'; c.fillRect(wn.x + wn.w / 2 - 2, wn.y, 4, wn.h); c.fillRect(wn.x, wn.y + wn.h / 2 - 2, wn.w, 4);
        }
        g2.fog(t, { y0: H - 90, y1: H, bands: 4, color: '#7a927e', alpha: 0.12 });
        // Watson watching from the lawn (foreground silhouette)
        g2.bigSprite(['.hh.', 'hffh', 'kkkk', 'kkkk'], W / 2 - 8, H - 52, { h: '#241c10', f: '#8a6a4a', k: '#181208' }, 4, { outline: '#060404' });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,12,8,.78)', '#3a4030', 1);
        api.txt('SIGNALS ' + this.caught + '/' + this.need, 11, 8, 8, C.gasHi);
        for (let i = 0; i < this.max; i++) g.rect(W - 46 + i * 13, 8, 9, 8, i < this.max - this.missed ? C.green : '#3a2a1a');
        api.vignette();
      },
    };
  }
  /* ===================== THE MIRE p1: the tufted crossing ================= */
  function tufts() {
    return {
      name: 'THE GRIMPEN MIRE', boss: false, help: 'TAP to hop as a tuft crosses the marker',
      winText: 'Tuft by tuft, the green horror is behind you.',
      loseText: 'The mire closes over — the moor keeps its dead.',
      init(api) { this.cross = 0; this.need = 12; this.sinks = 0; this.tufts = []; this.spawn = 0; this.hop = 0; this.cx = api.W / 2; this.lineY = api.H - 108; this.band = api.has('lens') ? 16 : 12; },
      update(api, dt) {
        const f = dt * 60;
        this.spawn -= dt;
        if (this.spawn <= 0) { this.spawn = api.rnd(0.55, 0.95); this.tufts.push({ x: api.W + 16 }); }
        for (const tf of this.tufts) tf.x -= 2.1 * f;
        this.tufts = this.tufts.filter((tf) => tf.x > -18);
        if (this.hop > 0) this.hop -= dt;
        if (api.confirm()) {
          const near = this.tufts.find((tf) => Math.abs(tf.x - this.cx) < this.band && !tf.used);
          if (near) { near.used = true; this.cross++; api.addScore(20); this.hop = 0.25; api.audio.sfx('jump'); api.burst(this.cx, this.lineY, '#6a8a4a', 6); if (this.cross >= this.need) { api.addScore(60); api.win(); } }
          else { this.sinks++; api.shake(5, 0.25); api.flash('#1a2a12', 0.2); api.audio.sfx('hurt'); if (this.sinks >= 3) api.lose(); }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the great mire at dusk — phosphorescent pools under rolling fog
        g2.skyGradient([[0, '#141c14'], [0.6, '#233324'], [1, '#1a281a']], H * 0.4);
        tors(c, W, H * 0.4, 13, 26, 3.3, '#101a12');
        g2.verticalGradient(0, H * 0.4, W, H * 0.6, [[0, '#243020'], [1, '#141c10']]);
        // glowing pools with rising marsh-gas bubbles
        [[52, H * 0.56, 34], [W - 60, H * 0.62, 40], [96, H * 0.78, 30], [W - 96, H * 0.86, 36]].forEach((pl, i) => {
          g2.glow(pl[0], pl[1], pl[2] * 0.8, C.phosphor, 0.14 + 0.07 * Math.sin(t * 2.4 + i * 1.7));
          c.fillStyle = '#20301a'; c.beginPath(); c.ellipse(pl[0], pl[1], pl[2], pl[2] * 0.36, 0, 0, 7); c.fill();
          c.fillStyle = '#2c4022'; c.beginPath(); c.ellipse(pl[0] - 4, pl[1] - 2, pl[2] * 0.7, pl[2] * 0.22, 0, 0, 7); c.fill();
          const bp = (t * 0.7 + i * 0.4) % 1;
          c.globalAlpha = (1 - bp) * 0.5; c.strokeStyle = '#8adf9a'; c.beginPath(); c.arc(pl[0] + Math.sin(i * 9) * 8, pl[1] - bp * 12, 2 + bp * 3, 0, 7); c.stroke(); c.globalAlpha = 1;
        });
        // the hop line: player's tussock + marker
        c.fillStyle = '#3a4a2a'; c.beginPath(); c.ellipse(this.cx, this.lineY + 16, 22, 8, 0, 0, 7); c.fill();
        c.globalAlpha = 0.35; g.rect(this.cx - this.band, this.lineY - 20, this.band * 2, 40, C.green); c.globalAlpha = 1;
        g.rect(this.cx - this.band, this.lineY + 18, this.band * 2, 2, C.green);
        // drifting tufts
        for (const tf of this.tufts) {
          if (tf.used) continue;
          c.fillStyle = 'rgba(20,30,14,.6)'; c.beginPath(); c.ellipse(tf.x, this.lineY + 15, 13, 5, 0, 0, 7); c.fill();
          g2.bigSprite(['.ggg.', 'gGgGg', '.bbb.'], tf.x - 7, this.lineY - 2, { g: '#5a7a3a', G: '#7a9a4a', b: '#3a2a1a' }, 3, { outline: '#14200e' });
        }
        // Watson mid-hop
        const hy = this.lineY - 16 - (this.hop > 0 ? 16 : 0);
        g2.bigSprite(Math.floor(t * 7) % 2 && this.hop <= 0 ? HOLMES_A : HOLMES_B, this.cx - 16, hy - 22, HPAL, 4, { shadow: this.hop <= 0, outline: '#0a0c06' });
        g2.fog(t, { y0: H * 0.42, y1: H, bands: 6, color: '#7a927e', alpha: 0.1 });
        g2.embers(t, 12, { yBottom: H, yTop: H * 0.4, color: '#8adf9a', speed: 0.06, size: 2, alpha: 0.3 });
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,14,8,.78)', '#3a4a2a', 1);
        api.txt('CROSS ' + this.cross + '/' + this.need, 11, 8, 8, C.green);
        for (let i = 0; i < 3; i++) g.rect(W - 46 + i * 13, 8, 9, 8, i < 3 - this.sinks ? C.green : '#26301a');
        api.vignette();
      },
    };
  }
  /* ================ THE MIRE p2 (boss): the man on the tor ================ */
  function selden() {
    return {
      name: 'THE CONVICT', boss: true, help: 'HOLD to climb — FREEZE when his lantern turns',
      winText: 'Selden — the Notting Hill murderer, run to ground on the tor.',
      loseText: 'A rock whistles past your ear. The convict is gone.',
      init(api) { this.prog = 0; this.strikes = 0; this.max = 3; this.state = 'safe'; this.stT = api.rnd(2.0, 2.8); this.caughtFlash = 0; },
      update(api, dt) {
        this.stT -= dt; this.caughtFlash = Math.max(0, this.caughtFlash - dt);
        if (this.stT <= 0) {
          if (this.state === 'safe') { this.state = 'warn'; this.stT = 0.5; api.audio.sfx('blip'); }
          else if (this.state === 'warn') { this.state = 'watch'; this.stT = api.rnd(1.3, 1.8); }
          else { this.state = 'safe'; this.stT = api.rnd(1.8, 2.8); }
        }
        const moving = api.pointer.down || api.keyDown('up');
        if (moving) {
          if (this.state === 'watch') {
            this.strikes++; this.caughtFlash = 0.5; this.state = 'safe'; this.stT = api.rnd(1.8, 2.6);
            api.shake(7, 0.35); api.flash('#3a3020', 0.25); api.audio.sfx('hurt');
            this.prog = Math.max(0, this.prog - 8);
            if (this.strikes >= this.max) return api.lose();
          } else {
            this.prog += 15 * dt; api.addScore(6 * dt);
            if (this.prog >= 100) { api.addScore(90); api.win(); }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the black tor against the night, Selden's lantern atop
        g2.skyGradient([[0, '#0a0f0c'], [0.6, '#131f16'], [1, '#0c120c']]);
        g2.stars(t, 30, H * 0.5, '#c8d6c0');
        g2.glow(40, 50, 28, '#c8d6c0', 0.3); c.fillStyle = '#dfe8d8'; c.beginPath(); c.arc(40, 50, 14, 0, 7); c.fill(); c.fillStyle = '#131f16'; c.beginPath(); c.arc(46, 45, 11, 0, 7); c.fill();
        // the tor: stacked granite slabs narrowing to the top
        const topY = 96;
        c.fillStyle = '#12140e';
        c.beginPath(); c.moveTo(0, H); c.lineTo(30, H * 0.72); c.lineTo(W * 0.34, H * 0.5); c.lineTo(W * 0.42, topY + 30); c.lineTo(W * 0.62, topY + 30); c.lineTo(W * 0.72, H * 0.52); c.lineTo(W - 20, H * 0.76); c.lineTo(W, H); c.closePath(); c.fill();
        [[W * 0.40, topY + 8, 56, 24], [W * 0.36, topY + 34, 74, 26], [W * 0.32, topY + 62, 96, 30]].forEach((sl) => {
          c.fillStyle = '#1c1f16'; c.fillRect(sl[0], sl[1], sl[2], sl[3]);
          c.fillStyle = '#2c3022'; c.fillRect(sl[0], sl[1], sl[2], 4);
          c.fillStyle = '#0c0e08'; c.fillRect(sl[0], sl[1] + sl[3] - 3, sl[2], 3);
        });
        // Selden atop with the lantern
        const watching = this.state === 'watch';
        const warn = this.state === 'warn';
        const sx = W / 2;
        if (watching || (warn && Math.floor(t * 12) % 2)) {
          // sweeping beam toward the climber
          const ang = Math.PI / 2 + Math.sin(t * 1.8) * 0.5;
          c.save(); c.globalAlpha = 0.16 + 0.05 * Math.sin(t * 10);
          const bg = c.createRadialGradient(sx, topY + 4, 8, sx, topY + 4, H);
          bg.addColorStop(0, '#ffe9a8'); bg.addColorStop(1, 'rgba(255,233,168,0)');
          c.fillStyle = bg;
          c.beginPath(); c.moveTo(sx, topY + 4);
          c.arc(sx, topY + 4, H * 0.9, ang - 0.3, ang + 0.3); c.closePath(); c.fill(); c.restore();
        }
        g2.glow(sx + 8, topY - 2, watching ? 22 : 10, '#ffd97a', watching ? 0.7 : 0.3);
        g2.bigSprite(watching || warn ? SELDEN_WATCH : SELDEN_AWAY, sx - 12, topY - 26, SELDENPAL, 4, { outline: '#060604' });
        c.fillStyle = '#ffe9a8'; c.fillRect(sx + 12, topY - 8, 5, 7);
        // the climb path: the player scrambles up the scree
        const py = H - 60 - (H - 190 - 60) * (this.prog / 100);
        const px = W / 2 + Math.sin(this.prog * 0.14) * 44;
        c.strokeStyle = 'rgba(150,170,140,.16)'; c.lineWidth = 3; c.setLineDash([3, 6]);
        c.beginPath(); c.moveTo(W / 2 + Math.sin(0) * 44, H - 60);
        for (let pp = 0; pp <= 100; pp += 5) c.lineTo(W / 2 + Math.sin(pp * 0.14) * 44, H - 60 - (H - 250) * (pp / 100));
        c.stroke(); c.setLineDash([]);
        const moving = api.pointer.down || api.keyDown('up');
        g2.bigSprite(moving && Math.floor(t * 8) % 2 ? HOLMES_B : HOLMES_A, px - 16, py - 20, HPAL, 4, { shadow: true, outline: '#0a0c06' });
        if (this.caughtFlash > 0) api.txtCFit('SEEN!', px, py - 36, 11, '#ff6a4a');
        g2.fog(t, { y0: H * 0.6, y1: H, bands: 4, color: '#7a927e', alpha: 0.1 });
        // state lamp + HUD
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,12,8,.78)', '#3a4030', 1);
        const stCol = watching ? '#ff6a4a' : warn ? '#e8b850' : C.green;
        g.rect(11, 8, 8, 8, stCol);
        api.txt(watching ? 'HE WATCHES' : warn ? 'TURNING…' : 'CLIMB', 24, 8, 8, stCol);
        api.txtCFit('TOR ' + Math.floor(this.prog) + '%', W - 66, 8, 8, C.cream, false, 60);
        for (let i = 0; i < this.max; i++) g.rect(W - 46 + i * 13, 8, 9, 8, i < this.max - this.strikes ? C.green : '#26301a');
        api.vignette();
      },
    };
  }
  /* ============ MERRIPIT HOUSE (optional): the naturalist's net =========== */
  function butterflies() {
    return {
      name: 'THE NATURALIST', boss: false, help: 'TAP the Cyclopides before they flit away',
      winText: 'Stapleton\'s face, caught plain — it is the Baskerville face.',
      loseText: 'He bounds off through the sedge, net high, secret kept.',
      init(api) { this.caught = 0; this.need = 12; this.time = 24; this.flies = []; for (let i = 0; i < 5; i++) this.spawn(api); },
      spawn(api) { this.flies.push({ x: api.rnd(24, api.W - 24), y: api.rnd(90, api.H - 110), vx: api.rnd(-1, 1), vy: api.rnd(-1, 1), ph: api.rnd(0, 6), hue: api.rint(0, 2) }); },
      update(api, dt) {
        const W = api.W, H = api.H; this.time -= dt;
        for (const f of this.flies) { f.ph += dt * 6; f.x += (f.vx + Math.sin(f.ph) * 0.7) * 42 * dt; f.y += (f.vy + Math.cos(f.ph * 1.3) * 0.7) * 42 * dt; if (f.x < 18 || f.x > W - 18) f.vx *= -1; if (f.y < 84 || f.y > H - 100) f.vy *= -1; f.x = clamp(f.x, 18, W - 18); f.y = clamp(f.y, 84, H - 100); }
        if (api.pointer.justDown) for (const f of this.flies) if (!f.dead && Math.hypot(api.pointer.x - f.x, api.pointer.y - f.y) < 19) { f.dead = true; this.caught++; api.addScore(14); api.audio.sfx('coin'); api.burst(f.x, f.y, '#ffd97a', 7); this.spawn(api); if (this.caught >= this.need) { api.addScore(50); api.win(); } break; }
        this.flies = this.flies.filter((f) => !f.dead);
        if (this.time <= 0) { if (this.caught >= Math.ceil(this.need * 0.6)) api.win(); else api.lose(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the one sunlit scene of the case — the moor in rare good weather
        g2.skyGradient([[0, '#8ec8d8'], [0.55, '#b8d8b8'], [1, '#7aa860']], H * 0.5);
        g2.glow(W - 50, 46, 40, '#fff0b0', 0.6); c.fillStyle = '#f8ecb8'; c.beginPath(); c.arc(W - 50, 46, 18, 0, 7); c.fill();
        // drifting fair-weather clouds
        g2.parallax(t * 14, [
          { speed: 0.5, draw: (ox) => { c.fillStyle = 'rgba(250,252,245,.85)'; g2.tiled(ox, 150, (x) => { c.beginPath(); c.arc(x + 40, 78, 15, 0, 7); c.arc(x + 60, 72, 19, 0, 7); c.arc(x + 82, 78, 14, 0, 7); c.fill(); }); } },
        ]);
        tors(c, W, H * 0.5, 14, 22, 2.2, '#5c8848');
        g2.verticalGradient(0, H * 0.5, W, H * 0.5, [[0, '#6a9a50'], [1, '#3c5c2c']]);
        // heather + sedge
        for (let i = 0; i < 40; i++) { const px = (i * 47 + 11) % W, py = H * 0.52 + ((i * 83) % (H * 0.42)); c.fillStyle = i % 3 ? 'rgba(150,90,160,.5)' : 'rgba(230,220,120,.5)'; c.fillRect(px, py, 3, 3); }
        for (let i = 0; i < 24; i++) { const px = (i * 61 + 31) % W, py = H * 0.55 + ((i * 71) % (H * 0.38)); c.strokeStyle = 'rgba(60,100,40,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(px, py + 8); c.quadraticCurveTo(px + 3 + Math.sin(t * 2 + i) * 2, py, px + 2, py - 6); c.stroke(); }
        // Stapleton bounding at the edge, net aloft
        const stx = 30 + Math.abs(Math.sin(t * 0.7)) * 24;
        g2.bigSprite(STAPLETON, stx, H - 92, STAPLETONPAL, 4, { shadow: true, outline: '#2a2c18' });
        c.strokeStyle = '#8a7648'; c.lineWidth = 2; c.beginPath(); c.moveTo(stx + 22, H - 88); c.lineTo(stx + 36, H - 108); c.stroke();
        c.strokeStyle = '#d8d8c8'; c.beginPath(); c.arc(stx + 40, H - 112, 8, 0, 7); c.stroke();
        // the butterflies — two-frame wings, colour varies
        for (const f of this.flies) {
          const wf = Math.sin(t * 18 + f.ph) > 0;
          const hues = [['#e8a030', '#c87820'], ['#e8e0f0', '#b8b0d0'], ['#7ab2c8', '#4a82a8']][f.hue];
          c.fillStyle = 'rgba(30,40,20,.25)'; c.beginPath(); c.ellipse(f.x, f.y + 12, 5, 2, 0, 0, 7); c.fill();
          c.fillStyle = hues[0]; c.fillRect(f.x - (wf ? 6 : 4), f.y - 2, 5, 4); c.fillRect(f.x + 1, f.y - 2, 5, 4);
          c.fillStyle = hues[1]; c.fillRect(f.x - (wf ? 6 : 4), f.y + 1, 5, 2); c.fillRect(f.x + 1, f.y + 1, 5, 2);
          c.fillStyle = '#2a2210'; c.fillRect(f.x - 1, f.y - 3, 2, 7);
        }
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(40,60,30,.7)', '#6a9a50', 1);
        api.txt('NET ' + this.caught + '/' + this.need, 11, 8, 8, '#f4ecd0');
        g.rect(W - 76, 9, 66, 6, 'rgba(20,30,10,.5)'); g.rect(W - 76, 9, 66 * clamp(this.time / 24, 0, 1), 6, '#f4ecd0');
        api.vignette();
      },
    };
  }
  /* ==================== THE HOUND p1: race the fog bank =================== */
  function fogdash() {
    return {
      name: 'THE FOG ON THE MOOR', boss: false, help: 'DRAG to run the path — beat the fog to Sir Henry',
      winText: 'You break from the fog as Sir Henry passes the stile — in time.',
      loseText: 'The white wall swallows the path, and every sound in it.',
      init(api) { this.x = api.W / 2; this.z = 0; this.need = 320; this.lives = api.has('notebook') ? 4 : 3; this.imm = 0; this.obs = []; this.spawnT = 0.7; },
      update(api, dt) {
        const W = api.W, H = api.H; this.z += 0.36 * dt * 60; this.imm = Math.max(0, this.imm - dt);
        if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.25; this.x = clamp(this.x, 20, W - 20);
        this.spawnT -= dt; if (this.spawnT <= 0) { this.obs.push({ x: api.rnd(20, W - 20), y: H * 0.4, s: api.rnd(2.0, 3.0), bog: Math.random() < 0.4 }); this.spawnT = api.rnd(0.5, 0.95); }
        for (const o of this.obs) o.y += o.s * dt * 60; this.obs = this.obs.filter((o) => o.y < H + 14);
        const py = H - 72;
        if (this.imm <= 0) for (const o of this.obs) if (Math.abs(o.x - this.x) < 15 && Math.abs(o.y - py) < 16) { o.y = H + 99; this.lives--; this.imm = 1.3; api.shake(6, 0.3); api.flash('#2a3626', 0.2); api.audio.sfx('hurt'); if (this.lives <= 0) return api.lose(); }
        api.score = Math.floor(this.z); if (this.z >= this.need) { api.addScore(70); api.win(); }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t;
        const hz = H * 0.4, prog = this.z / this.need;
        g2.skyGradient([[0, '#0a100c'], [0.7, '#17251c'], [1, '#101a12']], hz);
        g2.stars(t, 18, hz * 0.8, '#c8d6c0');
        g2.parallax(this.z, [
          { speed: 0.3, draw: (ox) => { c.fillStyle = '#0d1510'; g2.tiled(ox, 130, (x) => { c.beginPath(); c.moveTo(x, hz); c.lineTo(x + 65, hz - 34); c.lineTo(x + 130, hz); c.fill(); }); } },
          { speed: 0.6, draw: (ox) => { c.fillStyle = '#0a100b'; g2.tiled(ox, 100, (x) => { c.fillRect(x + 30, hz - 18, 8, 18); c.fillRect(x + 26, hz - 12, 16, 4); }); } }, // standing stones
        ]);
        // mode-7 moor path
        g2.mode7({ horizon: hz, camZ: this.z * 2, angle: Math.sin(t * 0.4) * 0.15, height: 1.15, fog: '#26382c', tex: (wx, wz) => { const path = Math.abs(wx) < 52; if (path) return ((Math.floor(wz / 28)) & 1) ? '#3a3626' : '#2e2c1e'; return ((Math.floor(wx / 38) + Math.floor(wz / 38)) & 1) ? '#1c2a18' : '#162212'; } });
        // Merripit's lit window far ahead
        g2.glow(W / 2 + Math.sin(t * 0.3) * 6, hz - 4, 12, '#ffd97a', 0.4);
        c.fillStyle = '#e8c060'; c.fillRect(W / 2 - 3 + Math.sin(t * 0.3) * 6, hz - 7, 6, 6);
        // obstacles: granite boulders & bog pools
        for (const o of this.obs) {
          if (o.bog) { g2.glow(o.x, o.y, 12, C.phosphor, 0.3); c.fillStyle = '#1d2c17'; c.beginPath(); c.ellipse(o.x, o.y, 14, 6, 0, 0, 7); c.fill(); c.fillStyle = '#2c4022'; c.beginPath(); c.ellipse(o.x - 3, o.y - 1, 9, 3, 0, 0, 7); c.fill(); }
          else { c.fillStyle = '#2c2c24'; c.beginPath(); c.arc(o.x, o.y, 9, 0, 7); c.fill(); c.fillStyle = '#44443a'; c.fillRect(o.x - 6, o.y - 7, 9, 4); }
        }
        // Holmes at a dead run
        const blink = this.imm > 0 && Math.floor(this.imm * 10) % 2 === 0;
        if (!blink) g2.bigSprite(Math.floor(t * 9) % 2 ? HOLMES_B : HOLMES_A, this.x - 16, H - 88, HPAL, 4, { shadow: true, outline: '#0a0c06' });
        // THE FOG — a wall rolling in behind, thickening with progress
        const fogA = 0.1 + prog * 0.16;
        g2.fog(t * 1.6, { y0: hz, y1: H, bands: 7, color: '#aebfb0', alpha: fogA });
        c.fillStyle = 'rgba(174,191,176,' + (prog * 0.22) + ')'; c.fillRect(0, H - 40, W, 40);
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(10,14,10,.78)', '#3a4a3a', 1);
        api.txt('❤'.repeat(Math.max(0, this.lives)), 11, 8, 9, C.blood);
        api.txtCFit('MERRIPIT ' + Math.floor(prog * 100) + '%', W - 52, 8, 8, C.cream, false, 94);
        api.vignette();
      },
    };
  }
  /* ==================== THE HOUND p2 (boss): the hound ==================== */
  function houndBoss() {
    return {
      name: 'THE HOUND', boss: true, help: 'TAP the hound mid-charge · keep it off Sir Henry',
      winText: 'Five shots ring out. The phantom is flesh — and the flesh dies.',
      loseText: 'The great jaws close. The curse of the Baskervilles holds.',
      init(api) {
        this.hp = api.has('revolver') ? 4 : 6; this.maxHp = this.hp;
        this.grip = 3; this.state = 'prowl'; this.stT = 1.6;
        this.hx = -30; this.hy = api.H * 0.5; this.side = 1;
        this.tx = 0; this.ty = 0; this.flash = 0;
        this.rad = api.has('portrait') ? 30 : 23;
      },
      update(api, dt) {
        const W = api.W, H = api.H;
        this.stT -= dt; this.flash = Math.max(0, this.flash - dt);
        const sirX = W / 2, sirY = H - 64;
        if (this.state === 'prowl') {
          // half-seen shape arcing through the fog
          const p = 1 - Math.max(0, this.stT) / 1.8;
          this.hx = this.side > 0 ? -20 + p * 60 : W + 20 - p * 60;
          this.hy = H * 0.42 + Math.sin(p * 6) * 20;
          if (this.stT <= 0) { this.state = 'charge'; this.stT = 1.5; this.cx0 = this.hx; this.cy0 = this.hy; api.audio.sfx('power'); }
        } else if (this.state === 'charge') {
          const p = 1 - Math.max(0, this.stT) / 1.5;
          this.hx = this.cx0 + (sirX - this.cx0) * p;
          this.hy = this.cy0 + (sirY - 18 - this.cy0) * (p * p);
          if (this.stT <= 0) {
            this.grip--; this.side *= -1; this.state = 'prowl'; this.stT = api.rnd(1.4, 2.0);
            api.shake(9, 0.4); api.flash('#1aff6a', 0.2); api.audio.sfx('explode');
            if (this.grip <= 0) return api.lose();
          }
        } else if (this.state === 'reel') {
          if (this.stT <= 0) { this.side *= -1; this.state = 'prowl'; this.stT = api.rnd(1.2, 1.8); }
        }
        if (api.pointer.justDown) {
          this.flash = 0.08; this.tx = api.pointer.x; this.ty = api.pointer.y;
          api.audio.sfx('shoot'); api.shake(2, 0.1);
          if (this.state === 'charge' && Math.hypot(api.pointer.x - this.hx, api.pointer.y - this.hy) < this.rad) {
            this.hp--; api.addScore(50); api.burst(this.hx, this.hy, C.phosphor, 14); api.audio.sfx('hurt');
            this.state = 'reel'; this.stT = 0.8;
            if (this.hp <= 0) { api.addScore(120); api.flash('#fff', 0.3); api.shake(8, 0.5); return api.win(); }
          }
        }
      },
      draw(api) {
        const c = api.ctx, g2 = api.g2, W = api.W, H = api.H, t = api.t, g = api.gfx;
        // the fog-drowned moor at night — the finale
        g2.skyGradient([[0, '#070b08'], [0.6, '#0f1a12'], [1, '#0a120c']]);
        g2.glow(W - 44, 40, 26, '#c8d6c0', 0.25); c.fillStyle = '#d8e4d0'; c.beginPath(); c.arc(W - 44, 40, 12, 0, 7); c.fill(); c.fillStyle = '#0f1a12'; c.beginPath(); c.arc(W - 39, 36, 10, 0, 7); c.fill();
        tors(c, W, H * 0.44, 12, 24, 1.2, '#0a0f0a');
        g2.verticalGradient(0, H * 0.44, W, H * 0.56, [[0, '#15200f'], [1, '#0a0f08']]);
        // scattered granite + gorse
        [[36, H * 0.58], [W - 40, H * 0.62], [70, H * 0.8], [W - 84, H * 0.85]].forEach((r, i) => { c.fillStyle = '#20241a'; c.beginPath(); c.arc(r[0], r[1], 8 + (i % 3) * 3, 0, 7); c.fill(); c.fillStyle = '#33382a'; c.fillRect(r[0] - 5, r[1] - 8, 8, 4); });
        // Sir Henry, frozen mid-path
        const sirX = W / 2, sirY = H - 64;
        const shiver = Math.sin(t * 13) * 1.4;
        g2.glow(sirX, sirY + 4, 26, '#c8d6c0', 0.12);
        g2.bigSprite(HENRY, sirX - 16 + shiver, sirY - 18, HENRYPAL, 4, { shadow: true, outline: '#0a0c06' });
        // the hound
        const charging = this.state === 'charge';
        const reeling = this.state === 'reel';
        const vis = charging ? 1 : reeling ? 0.8 : 0.4;
        c.globalAlpha = vis;
        g2.glow(this.hx, this.hy, charging ? 40 : 24, C.phosphor, charging ? 0.65 : 0.3);
        g2.bigSprite(Math.floor(t * 10) % 2 ? HOUND_B : HOUND_A, this.hx - 20, this.hy - 20, HOUNDPAL, 4, { outline: '#04120a' });
        // burning eyes and jaws
        c.fillStyle = '#d8ffe8'; c.fillRect(this.hx - 8, this.hy - 8, 4, 4); c.fillRect(this.hx + 5, this.hy - 8, 4, 4);
        if (charging) { c.fillStyle = C.phosphor; c.fillRect(this.hx - 6, this.hy + 6, 12, 3); }
        c.globalAlpha = 1;
        // hit ring while charging
        if (charging) { c.strokeStyle = 'rgba(26,255,106,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(this.hx, this.hy, this.rad, 0, 7); c.stroke(); }
        // rolling fog OVER the hound (it hunts inside it)
        g2.fog(t * 1.4, { y0: H * 0.34, y1: H, bands: 7, color: '#aebfb0', alpha: charging ? 0.07 : 0.13 });
        // muzzle flash
        if (this.flash > 0) { g2.glow(this.tx, this.ty, 16, '#fff0b0', 0.8); c.fillStyle = 'rgba(255,240,180,.9)'; c.beginPath(); c.arc(this.tx, this.ty, 4, 0, 7); c.fill(); }
        // ornate HUD: hound hearts vs Sir Henry's nerve
        g2.roundRect(6, 4, W - 12, 16, 5, 'rgba(8,12,8,.8)', '#2a4030', 1);
        api.txt('HOUND', 11, 8, 8, C.phosphor);
        for (let i = 0; i < this.maxHp; i++) g.rect(58 + i * 11, 8, 8, 8, i < this.hp ? C.phosphor : '#1a2a1a');
        api.txtCFit('NERVE ' + '❤'.repeat(Math.max(0, this.grip)), W - 50, 8, 8, C.blood, false, 90);
        if (charging) api.txtCFit('▸ FIRE! ◂', this.hx, this.hy - 38, 10, C.gasHi);
        api.vignette();
      },
    };
  }

  /* =============================== the game =============================== */
  RetroSaga2.create({
    id: 'sherlock', title: 'Sherlock Holmes', subtitle: 'THE HOUND OF THE BASKERVILLES',
    currency: 'INSIGHT', accent: C.brass, ownPhaseHud: true,
    titleFont: TITLE, // woven Victorian pixel face — engraved newsprint, 16-bit honest
    uiFont: "'Pixelify Sans','Press Start 2P',monospace",
    credit: 'A 16-BIT MYSTERY · A. C. DOYLE, 1902',
    bootCta: 'TAP TO TAKE THE CASE', bootLine: 'FIVE LEADS · ONE PHANTOM HOUND',
    width: 270, height: 480, parent: '#game',
    palette: { gold: C.brass, blood: C.blood, cream: C.cream, dim: C.dim },
    emblem, scenery, menu, map: menu, renderBoot,
    mapHint: 'FOLLOW THE RED THREAD', mapDone: 'THE CASE IS CLOSED',
    screens: {
      overlay: 'rgba(12,10,4,.86)', win: '#c9a14a', lose: '#9a3a2a', chapterLabel: '#9a8a60',
      name: '#efe2c2', sub: '#b8742a', intro: '#cabb95', quote: '#8f8060', help: '#c9a14a',
      score: '#e8dcc0', cur: '#c9a14a', cta: '#efe2c2',
    },
    labels: {
      chapter: 'CASE', phase: 'LEAD', boss: 'THE CONFRONTATION', score: 'INSIGHT GAINED',
      win: 'THE TRAIL RUNS TRUE', lose: 'THE TRAIL GOES COLD', nextPhaseWin: 'A LEAD SECURED',
      cont: 'TAP FOR THE NEXT LEAD', toMap: 'TAP FOR THE CASE MAP', play: 'TAP TO INVESTIGATE',
      nextPhase: 'TAP TO FOLLOW THE LEAD', toFinale: 'TAP TO CLOSE THE CASE',
    },
    upgrades: {
      lens: { name: 'THE MAGNIFYING LENS', desc: 'wider timing windows' },
      revolver: { name: "WATSON'S REVOLVER", desc: 'the hound falls faster' },
      notebook: { name: "WATSON'S NOTEBOOK", desc: 'one more life on the moor' },
      portrait: { name: 'THE BASKERVILLE PORTRAIT', desc: 'the hound is easier to hit' },
    },
    nodes: [
      {
        id: 'baker', name: '221B BAKER STREET', sub: 'THE CASE BEGINS', reward: 60, grant: 'lens',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 1, y - 7, 2, 13, '#7a5a2a'); g.circle(x, y - 7, 3, '#caa15a'); },
        intro: ['Dr. Mortimer leaves a stick,', 'a manuscript, and a death on', 'the moor. Read the visitor —', 'then follow whoever follows him.'],
        quote: 'You know my methods, Watson. Apply them.',
        choice: { prompt: 'Who guards Sir Henry on the moor?', options: [{ label: 'Watson goes alone — Holmes stays in London', flag: 'watson' }, { label: 'Holmes hides out on the moor, unseen', flag: 'hidden' }] },
        winText: 'A doctor read from his cane; a spy read from his cab.',
        phases: [stick(), hansom()],
      },
      {
        id: 'hall', name: 'BASKERVILLE HALL', sub: 'AN OLD HOUSE, OLD FEARS', needs: ['baker'], reward: 60, grant: 'revolver',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 8, y - 6, 16, 12, '#3a3426'); g.rect(x - 2, y - 2, 4, 5, '#e8c060'); },
        intro: ['A warning pasted from The', 'Times. And past midnight, a', 'candle moves from window to', 'window in the sleeping Hall.'],
        quote: 'As you value your life or your reason, keep away from the moor.',
        winText: 'The Hall gives up its small secret — the moor keeps its great one.',
        phases: [warning(), candles()],
      },
      {
        id: 'naturalist', name: 'MERRIPIT HOUSE', sub: 'THE BUTTERFLY MAN', needs: ['hall'], optional: true, reward: 40, grant: 'portrait',
        icon(api, x, y) { const g = api.gfx; g.sprite(['w.w', 'www', 'w.w'], x - 4, y - 4, { w: '#e8a030' }, 2); },
        intro: ['Stapleton the naturalist runs', 'the moor with his net. Match', 'him — and mark his face', 'against the Hall portraits.'],
        quote: 'It is Cyclopides — very rare. You would do well to catch it.',
        winText: 'Under the collector\'s hat: the face of old Hugo Baskerville.',
        phases: [butterflies()],
      },
      {
        id: 'mire', name: 'THE GRIMPEN MIRE', sub: 'ONE FALSE STEP', needs: ['hall'], reward: 70, grant: 'notebook',
        icon(api, x, y) { const g = api.gfx; g.sprite(['.ggg.', 'ggggg', '.bbb.'], x - 5, y - 4, { g: '#5a7a3a', b: '#3a2a1a' }, 2); },
        intro: ['Only tufts of grass give safe', 'footing on the great mire.', 'And on the tor above, a light:', 'a man watches the watchers.'],
        quote: 'A false step yonder means death to man or beast.',
        winText: 'The mire is crossed, the convict run down. One shadow remains.',
        phases: [tufts(), selden()],
      },
      {
        id: 'hound', name: 'THE HOUND', sub: 'A CREATURE OF FIRE', needs: ['mire'], reward: 100,
        icon(api, x, y) { const g = api.gfx; api.ctx.globalAlpha = 0.6; g.circle(x, y, 8, '#1aff6a'); api.ctx.globalAlpha = 1; g.circle(x, y + 3, 3, '#0a1a0e'); },
        intro: ['The fog rolls in. Sir Henry', 'walks home across the moor', 'alone — and out of the white', 'wall comes the hound.'],
        quote: 'A hound it was, an enormous coal-black hound — but not such a hound as mortal eyes have ever seen.',
        winText: 'Phosphorus and malice, nothing more. Stapleton flees into the mire.',
        phases: [fogdash(), houndBoss()],
      },
    ],
    endings: [
      { when: (f) => f.hidden, title: 'THE MAN ON THE TOR', lines: ['The lone figure Watson stalked', 'across the moor was Holmes', 'himself — on the case from the', 'first, unseen until the end.', '', 'The Grimpen Mire keeps Stapleton.'] },
      { when: (f) => f.watson, title: "BY WATSON'S HAND", lines: ['Holmes stayed among the London', 'fog; it was Watson\'s steady', 'revolver on the moor at the last.', '', 'The Grimpen Mire keeps Stapleton.'] },
      { when: () => true, title: 'THE CURSE IS LIFTED', lines: ['No phantom — only phosphor,', 'malice, and a Baskerville face.', 'Sir Henry will live.'] },
    ],
    finale: ['THE CASE IS CLOSED.'],
  });
})();
