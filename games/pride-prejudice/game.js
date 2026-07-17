/* ============================================================================
 * PRIDE & PREJUDICE — A MATTER OF PRIDE
 * A Regency courtship across four turns of the heart:
 *   1. FIRST IMPRESSIONS — branching banter with Darcy at the Meryton Assembly
 *   2. THE ASSEMBLY DANCE — a minuet: step in time with Darcy's lead
 *   3. DARCY'S LETTER — a word puzzle: complete his letter of explanation
 *   4. THE SECOND PROPOSAL — branching dialogue that decides the ending
 * AFFECTION and REPUTATION meters persist across every scene and gate the
 * finale. Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── Persistent relationship meters (survive across scenes + replays) ── */
  const STATS_KEY = 'pride-prejudice.stats.v2';
  function loadStats() {
    let s = { affection: 30, reputation: 50 };
    try {
      const saved = JSON.parse(localStorage.getItem(STATS_KEY));
      if (saved) s = Object.assign(s, saved);
    } catch (e) {}
    return s;
  }
  const stats = loadStats();
  function saveStats() { try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (e) {} }
  function applyDelta(aff, rep) {
    stats.affection = clamp(stats.affection + aff, 0, 100);
    stats.reputation = clamp(stats.reputation + rep, 0, 100);
    saveStats();
  }
  function drawMeters(api) {
    const g = api.gfx, W = api.W, y = 18, h = 5, w = 76;
    g.rect(4, y, w, h, '#2a1a2a');
    g.rect(4, y, w * clamp(stats.affection / 100, 0, 1), h, '#c85a7a');
    api.txtCFit('AFFECTION', 4 + w / 2, y + 6, 6, '#c85a7a', false, w);
    g.rect(W - 4 - w, y, w, h, '#2a1a2a');
    g.rect(W - 4 - w, y, w * clamp(stats.reputation / 100, 0, 1), h, '#8a9a7a');
    api.txtCFit('REPUTATION', W - 4 - w + w / 2, y + 6, 6, '#8a9a7a', false, w);
  }

  /* ── Emblem: a rose in bloom ── */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    g.circle(cx, cy - 14, 10, '#c85a7a');
    g.circle(cx + 12, cy - 6, 10, '#c85a7a');
    g.circle(cx + 10, cy + 8, 10, '#c85a7a');
    g.circle(cx - 10, cy + 8, 10, '#c85a7a');
    g.circle(cx - 12, cy - 6, 10, '#c85a7a');
    g.circle(cx, cy - 8, 8, '#e07a9a');
    g.circle(cx + 7, cy - 2, 8, '#e07a9a');
    g.circle(cx + 5, cy + 8, 8, '#e07a9a');
    g.circle(cx - 5, cy + 8, 8, '#e07a9a');
    g.circle(cx - 7, cy - 2, 8, '#e07a9a');
    g.circle(cx, cy, 7, '#f0c0d0');
    g.circle(cx, cy, 3, '#f8e8f0');
    g.rect(cx - 2, cy + 18, 4, 22, '#4a7a4a');
    g.rect(cx + 2, cy + 26, 10, 3, '#4a7a4a');
    g.rect(cx - 12, cy + 32, 10, 3, '#4a7a4a');
  }

  /* ── Scenery: Longbourn estate at dusk / dawn ── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    const sky = c.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, '#18102a');
    sky.addColorStop(0.5, '#220f1e');
    sky.addColorStop(1, '#1a2614');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    if (scene !== 'menu') {
      for (let i = 0; i < 38; i++) {
        const sx = (i * 67 + 11) % W, sy = (i * 43 + 7) % Math.floor(H * 0.5);
        c.globalAlpha = 0.2 + 0.35 * Math.sin(t * 1.4 + i * 1.6);
        g.rect(sx, sy, i % 5 === 0 ? 2 : 1, 1, '#e8d8d0');
      }
      c.globalAlpha = 1;
      g.circle(W - 54, 46, 19, '#c8a0b0');
      g.circle(W - 48, 40, 16, '#18102a');
      g.circle(W - 52, 48, 19, '#b8909e');
    }

    const hillY = Math.floor(H * 0.62);
    c.fillStyle = '#1a3020';
    c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W; x += 14) c.lineTo(x, hillY - 10 - Math.sin(x * 0.035 + 0.8) * 14);
    c.lineTo(W, H); c.closePath(); c.fill();

    c.fillStyle = '#1e3818';
    c.fillRect(0, hillY + 2, W, H - hillY - 2);

    const mx = 60, my = hillY - 52;
    c.fillStyle = '#0e1a0e';
    c.fillRect(mx, my, 88, 52);
    c.fillRect(mx + 18, my - 20, 52, 22);
    c.fillRect(mx + 28, my - 28, 12, 10);
    c.fillRect(mx + 52, my - 28, 12, 10);
    g.rect(mx + 10, my + 14, 12, 16, '#d4900a');
    g.rect(mx + 32, my + 14, 12, 16, '#d4900a');
    g.rect(mx + 54, my + 14, 12, 16, '#d4900a');
    g.rect(mx + 30, my - 14, 10, 12, '#d4900a');

    for (let i = 0; i < 7; i++) {
      const fx = 12 + i * 38, fy = hillY + 10;
      g.rect(fx, fy, 2, 12, '#3a6030');
      g.circle(fx + 1, fy - 1, 5, '#c85a7a');
    }

    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(10,6,18,.64)';
      c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(10,6,18,.54)';
      c.fillRect(0, 0, W, H);
      const cg = c.createRadialGradient(W / 2, H + 20, 0, W / 2, H + 20, 180);
      cg.addColorStop(0, 'rgba(200,150,60,.18)');
      cg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = cg; c.fillRect(0, H - 180, W, 200);
    }
  }

  /* ── Shared dialogue engine: a run of two-option beats that shift the
     AFFECTION/REPUTATION meters and decide the scene's outcome. ── */
  function dialogueOptRects(api) {
    const W = api.W, H = api.H, y0 = H * 0.62, h = 54, gap = 10;
    return {
      a: { x: 14, y: y0, w: W - 28, h },
      b: { x: 14, y: y0 + h + gap, w: W - 28, h },
      mid: y0 + h + gap / 2,
    };
  }

  function makeDialogueChapter(spec) {
    return {
      id: spec.id, name: spec.name, sub: spec.sub, icon: spec.icon,
      intro: spec.intro, quote: spec.quote,
      help: spec.help || 'TAP a reply below · or ↑/↓ + A',
      winText: spec.winText, loseText: spec.loseText,
      init(api) {
        this.beat = 0;
        this.sel = 0;
        this.localDelta = 0;
        this.timeLeft = 9;
        this.trans = 0;
        this.picked = -1;
        this.finished = false;
      },
      update(api, dt) {
        const beats = spec.beats;
        if (this.finished) return;
        if (this.trans > 0) {
          this.trans -= dt;
          if (this.trans <= 0) {
            if (this.beat + 1 >= beats.length) {
              this.finished = true;
              let win;
              if (spec.applyEnding) win = spec.applyEnding(this, this.localDelta);
              else win = this.localDelta >= spec.threshold;
              if (win) api.win(); else api.lose();
              return;
            }
            this.beat++; this.sel = 0; this.timeLeft = 9; this.picked = -1;
          }
          return;
        }
        const b = beats[this.beat];
        if (api.keyPressed('up') || api.keyPressed('left')) { this.sel = 0; api.audio.sfx('blip'); }
        if (api.keyPressed('down') || api.keyPressed('right')) { this.sel = 1; api.audio.sfx('blip'); }
        let choose = -1;
        if (api.pointer.justDown) {
          const r = dialogueOptRects(api);
          choose = api.pointer.y < r.mid ? 0 : 1;
        }
        if (api.keyPressed('a') || api.keyPressed('start')) choose = this.sel;
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) choose = this.sel;
        if (choose >= 0) {
          const opt = b.options[choose];
          applyDelta(opt.aff, opt.rep);
          this.localDelta += opt.aff + opt.rep;
          const good = (opt.aff + opt.rep) >= 0;
          api.score += 15 + Math.max(0, opt.aff + opt.rep) * 4;
          this.picked = choose;
          this.trans = 1.1;
          api.flash(good ? '#c85a7a' : '#4a2a6a', 0.15);
          api.burst(api.W / 2, api.H * 0.55, good ? '#c85a7a' : '#6a4a8a', 10);
          api.audio.sfx(good ? 'coin' : 'hurt');
        }
      },
      draw(api) {
        const g = api.gfx, W = api.W, H = api.H;
        spec.bg(api);
        api.topBar(spec.name.toUpperCase());
        drawMeters(api);
        const beats = spec.beats;
        const b = beats[Math.min(this.beat, beats.length - 1)];

        const py = H * 0.34;
        g.rect(16, py, W - 32, 78, 'rgba(16,10,20,.82)');
        g.rectO(16, py, W - 32, 78, '#c85a7a', 1);
        api.txt(b.speaker.toUpperCase(), 24, py + 8, 8, '#d4a020');
        api.txtCHead(b.line, W / 2, py + 22, 9, '#f0e8d8', false, 12, W - 48);

        if (this.trans > 0 && this.picked >= 0) {
          const opt = b.options[this.picked];
          const good = (opt.aff + opt.rep) >= 0;
          api.txtCFit(good ? opt.reactGood || '“How very true.”' : opt.reactBad || '“...Indeed.”',
            W / 2, py + 60, 8, good ? '#c85a7a' : '#8a7a9a', false, W - 48);
        } else {
          const r = dialogueOptRects(api);
          [['a', 0], ['b', 1]].forEach(([k, i]) => {
            const rect = r[k], sel = this.sel === i;
            g.rect(rect.x, rect.y, rect.w, rect.h, sel ? '#f8f0f4' : '#f0e8d8');
            g.rectO(rect.x, rect.y, rect.w, rect.h, sel ? '#c85a7a' : '#b8a898', sel ? 2 : 1);
            api.txtCHead(b.options[i].label, rect.x + rect.w / 2, rect.y + 8, 8, '#2a1a1a', false, 11, rect.w - 16);
          });
          g.rect(14, H - 16, W - 28, 4, '#2a1a2a');
          g.rect(14, H - 16, (W - 28) * clamp(this.timeLeft / 9, 0, 1), 4, '#d4a020');
        }
        api.vignette(); api.scanlines();
      },
    };
  }

  function ballroomBg(api) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    api.clear('#1a1020');
    g.rect(0, 0, W, H - 140, '#1a1a2e');
    for (let fx = 14; fx < W - 14; fx += 50) g.rectO(fx, 22, 36, H - 210, '#2a2a42', 1);
    for (let fy = H - 140; fy < H; fy += 22) {
      for (let fx = 0; fx < W; fx += 44) {
        const off = Math.floor((fy - H + 140) / 22) % 2 * 22;
        g.rect(fx + off, fy, 42, 20, '#2a1a10');
        g.rectO(fx + off, fy, 42, 20, '#1a1008', 1);
      }
    }
    g.rect(W / 2 - 2, 0, 4, 24, '#b09060');
    g.circle(W / 2, 26, 16, '#d4a020');
    c.globalAlpha = 0.3;
    const lgt = c.createRadialGradient(W / 2, 26, 0, W / 2, 26, 120);
    lgt.addColorStop(0, '#d4a020'); lgt.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = lgt; c.fillRect(0, 0, W, H - 140);
    c.globalAlpha = 1;
  }

  function pemberleyBg(api) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    api.clear('#12182a');
    const dawn = c.createLinearGradient(0, 0, 0, H * 0.55);
    dawn.addColorStop(0, '#1a1e30'); dawn.addColorStop(0.6, '#2a2440'); dawn.addColorStop(1, '#20301e');
    c.fillStyle = dawn; c.fillRect(0, 0, W, H * 0.55);
    g.rect(0, H * 0.55, W, H - H * 0.55, '#1e3018');
    for (let i = 0; i < 7; i++) {
      const fx = 8 + i * 40, fy = H * 0.58;
      g.rect(fx, fy, 3, 16, '#2a4020'); g.circle(fx + 1, fy - 4, 12, '#1e3416');
    }
    c.globalAlpha = 0.18;
    const sg = c.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, 140);
    sg.addColorStop(0, '#f0a040'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = sg; c.fillRect(0, 0, W, H);
    c.globalAlpha = 1;
  }

  /* menu "dance card" layout — 4 scenes */
  const CARDS = [
    [16, 96, 108, 76],
    [144, 82, 108, 76],
    [16, 210, 108, 76],
    [144, 196, 108, 76],
  ];
  const CARD_ROT = [-0.11, 0.08, 0.05, -0.07];

  RetroSaga.create({
    id: 'pride-prejudice',
    title: 'Pride & Prejudice',
    subtitle: 'FOUR TURNS OF THE HEART',
    currency: 'HEARTS',
    screens: {
      win: '#c85a7a', lose: '#6a4a8a', chapterLabel: '#8a9a7a', name: '#f0e8d8',
      sub: '#c85a7a', intro: '#e8d8c0', quote: '#9a8a9a', help: '#c85a7a',
      score: '#f0e8d8', cur: '#c85a7a', cta: '#f0e8d8', overlay: 'rgba(10,6,20,.86)',
    },
    labels: {
      chapter: 'SCENE', score: 'HEARTS WON', win: 'PROPRIETY PREVAILS',
      lose: 'FIRST IMPRESSIONS FAIL', cont: 'TAP TO CONTINUE',
      finale: 'TAP FOR THE FINALE', toMenu: 'TAP TO RETURN', play: 'TAP TO BEGIN',
    },
    accent: '#c85a7a',
    credit: 'PRIDE AND PREJUDICE · JANE AUSTEN, 1813',
    bootLine: 'FOUR SCENES · ONE GREAT ROMANCE',
    bootCta: 'TAP TO ENTER',
    menuLabel: 'THE DANCE CARDS',
    menuHint: 'TAP A CARD TO PLAY',
    menuDone: '✦ PRIDE AND PREJUDICE OVERCOME ✦',
    emblem, scenery,
    finale: ['IT IS A TRUTH', 'UNIVERSALLY ACKNOWLEDGED', '', 'THAT DARCY & ELIZABETH', 'ARE HAPPY AT LAST.'],
    palette: { gold: '#d4a020', blood: '#c85a7a', cream: '#f0e8d8', dim: '#8a7a8a' },
    width: 270, height: 480, parent: '#game',

    menu: {
      colors: { title: '#c85a7a', label: '#9a8a9a', cur: '#f0e8d8', hint: '#9a8a9a' },
      title(api, hearts) {
        const g = api.gfx, c = api.ctx, W = api.W;
        g.rect(40, 12, W - 80, 62, '#f0e4d0');
        g.rectO(40, 12, W - 80, 62, '#b89070', 1);
        g.rectO(43, 15, W - 86, 56, '#d4b080', 1);
        api.txtCFit('PRIDE & PREJUDICE', W / 2, 20, 9, '#3a2a18', false, W - 90);
        api.txtCFit('THE DANCE CARDS', W / 2, 36, 8, '#7a5a3a', false, W - 90);
        api.txtC('HEARTS  ' + hearts, W / 2, 50, 8, '#c85a7a');
        const bw = 84;
        g.rect(W / 2 - bw - 4, 64, bw, 4, '#d4c0a8');
        g.rect(W / 2 - bw - 4, 64, bw * clamp(stats.affection / 100, 0, 1), 4, '#c85a7a');
        g.rect(W / 2 + 4, 64, bw, 4, '#d4c0a8');
        g.rect(W / 2 + 4, 64, bw * clamp(stats.reputation / 100, 0, 1), 4, '#5a7a4a');
      },
      layout() { return CARDS.map((p) => ({ x: p[0], y: p[1], w: p[2], h: p[3] })); },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done, best } = info;
        const cx = x + w / 2, cy = y + h / 2, rot = CARD_ROT[i] || 0;
        c.save(); c.translate(cx, cy); c.rotate(rot); c.translate(-cx, -cy);
        g.rect(x, y, w, h, sel ? '#f8f0f4' : '#f0e8d8');
        g.rectO(x, y, w, h, sel ? '#c85a7a' : '#b8a898', sel ? 2 : 1);
        g.rectO(x + 3, y + 3, w - 6, h - 6, sel ? '#e07a9a' : '#d4c0b0', 1);
        api.txtC(String(i + 1), cx, y + 9, 7, '#8a6a5a');
        if (!done) g.circle(cx - w / 2 + 12, y + 12, 4, '#c85a7a');
        else api.txtC('✦', cx - w / 2 + 12, y + 10, 8, '#c85a7a');
        api.txtCFit(ch.name, cx, y + 30, 8, done ? '#c85a7a' : '#2a1a1a', false, w - 14);
        if (ch.sub) api.txtCFit(ch.sub, cx, y + 46, 7, '#6a5a5a', false, w - 14);
        if (done && best) api.txtC(String(best), cx + w / 2 - 14, y + h - 14, 7, '#c85a7a');
        c.restore();
      },
    },

    chapters: [

      /* ═══════════════════ SCENE 1 — FIRST IMPRESSIONS (dialogue) ═══════════ */
      makeDialogueChapter({
        id: 'impressions',
        name: 'FIRST IMPRESSIONS',
        sub: 'THE MERYTON ASSEMBLY',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y - 2, 16, 10, '#c85a7a');
          g.rect(x - 6, y - 5, 12, 4, '#e07a9a');
          g.rect(x - 2, y + 8, 4, 4, '#f0e8d8');
        },
        intro: [
          'MR DARCY SNUBS THE ROOM.',
          'ELIZABETH OVERHEARS HIS',
          'SLIGHT — AND CROSSES HIS',
          'path again before the night is out.',
        ],
        quote: 'She was too much occupied in wondering... to answer him with much civility.',
        winText: 'Darcy watches her leave, unable to look away.',
        loseText: "Elizabeth's pride keeps pace with his — the evening ends frostier than it began.",
        threshold: 10,
        bg: ballroomBg,
        beats: [
          { speaker: 'Mr Darcy', line: '"She is tolerable, but not handsome enough to tempt me."',
            options: [
              { label: 'Laugh it off, and dance the reel with Charlotte instead.', aff: 3, rep: 1, reactGood: '“Well! There is a disappointment.”' },
              { label: 'Turn cold, and let everyone see your contempt.', aff: -3, rep: -1, reactBad: '“How uncivil of us both.”' },
            ] },
          { speaker: 'Sir William', line: '"Mr Darcy dances divinely — you simply must stand up with him!"',
            options: [
              { label: 'Decline sweetly — he looked far too proud for a set.', aff: 1, rep: 2, reactGood: '“As you wish, my dear.”' },
              { label: 'Refuse rudely, loud enough for the room to hear.', aff: -2, rep: -2, reactBad: '“Oh! Well then.”' },
            ] },
          { speaker: 'Mr Darcy', line: '"Do you talk by rule, then, while you are dancing?"',
            options: [
              { label: 'Answer him plainly, and with good humor.', aff: 4, rep: 1, reactGood: '“Sometimes — once in half an hour.”' },
              { label: 'Freeze him out with silence and a glare.', aff: -1, rep: 1, reactBad: '“...”' },
            ] },
          { speaker: 'Caroline Bingley', line: '"I hope you are not disappointed your sister remains at Netherfield?"',
            options: [
              { label: "Answer plainly — you're glad Jane is so well cared for.", aff: 2, rep: 2, reactGood: '“How generous of you to say.”' },
              { label: 'Match her sharpness with your own.', aff: -3, rep: -1, reactBad: '“How very droll.”' },
            ] },
          { speaker: 'Charlotte Lucas', line: '"Well, Eliza — what do you make of the proud Mr Darcy?"',
            options: [
              { label: 'Admit he is not so bad as his manner suggests.', aff: 3, rep: 1, reactGood: '“High praise, from you.”' },
              { label: "Declare him the last man on earth you'd ever marry.", aff: -2, rep: 3, reactBad: '“We shall see, Eliza.”' },
            ] },
        ],
      }),

      /* ═══════════════════ SCENE 2 — THE ASSEMBLY DANCE (minuet rhythm) ═════ */
      {
        id: 'minuet',
        name: 'THE ASSEMBLY DANCE',
        sub: 'STEP IN TIME WITH DARCY',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x - 3, y + 3, 3, '#d4a020');
          g.rect(x, y - 8, 2, 11, '#d4a020');
          g.rect(x, y - 8, 6, 2, '#d4a020');
        },
        intro: [
          'THE MUSICIANS STRIKE UP',
          'A MINUET. DARCY OFFERS',
          'HIS HAND — SHE MUST MATCH',
          'his measured, formal steps.',
        ],
        quote: 'Every savage can dance.',
        help: 'TAP the beat as each step reaches the line',
        winText: 'Four-and-twenty couples, and not one so well matched in step.',
        loseText: 'She stumbles the figure twice — a small, mortifying scandal.',
        init(api) {
          this.stepInterval = 0.9;
          this.travel = 1.4;
          this.total = 20;
          this.startDelay = 1.2;
          this.nextIdx = 0;
          this.notes = [];
          this.hits = 0; this.misses = 0; this.combo = 0; this.maxCombo = 0;
          this.finished = false;
        },
        update(api, dt) {
          if (this.finished) return;
          const t = api.t;
          while (this.nextIdx < this.total &&
                 t >= this.startDelay + this.nextIdx * this.stepInterval - this.travel) {
            this.notes.push({ hitT: this.startDelay + this.nextIdx * this.stepInterval, judged: false });
            this.nextIdx++;
          }
          if (api.confirm()) {
            let best = null, bestDiff = 999;
            for (const n of this.notes) {
              if (n.judged) continue;
              const diff = Math.abs(t - n.hitT);
              if (diff < bestDiff) { bestDiff = diff; best = n; }
            }
            if (best && bestDiff <= 0.22) {
              best.judged = true;
              const perfect = bestDiff <= 0.09;
              this.hits++; this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo);
              api.score += perfect ? 30 : 18;
              api.audio.sfx(perfect ? 'power' : 'coin');
              api.burst(api.W / 2, api.H * 0.72, perfect ? '#d4a020' : '#c85a7a', perfect ? 12 : 7);
              if (perfect) api.flash('#d4a020', 0.08);
            }
          }
          for (const n of this.notes) {
            if (!n.judged && t - n.hitT > 0.22) {
              n.judged = true; this.misses++; this.combo = 0;
              api.shake(3, 0.15); api.audio.sfx('hurt');
              if (this.misses > 6) { this.finished = true; api.lose(); return; }
            }
          }
          this.notes = this.notes.filter((n) => t - n.hitT < 0.6);
          if (this.nextIdx >= this.total && this.notes.every((n) => n.judged)) {
            this.finished = true;
            api.score += Math.max(0, this.total - this.misses) * 5;
            applyDelta(this.misses <= 2 ? 4 : 1, this.misses <= 2 ? 2 : 0);
            api.win();
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H, cx = W / 2;
          ballroomBg(api);
          const laneTop = 46, laneBot = H - 96;
          g.rect(cx - 30, laneTop, 60, laneBot - laneTop, 'rgba(200,90,122,.08)');
          g.rectO(cx - 30, laneTop, 60, laneBot - laneTop, '#4a2a3a', 1);
          g.rect(cx - 34, laneBot, 68, 3, '#d4a020');

          const t = api.t;
          for (const n of this.notes) {
            const prog = 1 - (n.hitT - t) / this.travel;
            if (prog < -0.1 || prog > 1.15 || n.judged) continue;
            const ny = laneTop + prog * (laneBot - laneTop);
            const near = Math.abs(n.hitT - t) < 0.22;
            g.circle(cx, ny, near ? 8 : 6, near ? '#d4a020' : '#e07a9a');
            g.circle(cx, ny, near ? 4 : 3, '#f8e8f0');
          }

          const bob = Math.sin(t * 4) * 2;
          g.sprite(['.hh.', 'hffh', '.rr.', 'rrrr', '.r.r'],
            cx - 34, laneBot - 26 + bob, { h: '#2a1810', f: '#d8a880', r: '#e07a9a' }, 3);
          g.sprite(['.kk.', 'kffk', '.kk.', 'kbbk', 'k..k'],
            cx + 14, laneBot - 26 - bob, { k: '#18120e', f: '#c8a080', b: '#2a1810' }, 3);

          api.topBar('THE ASSEMBLY DANCE');
          drawMeters(api);
          api.txt('STEPS  ' + this.hits + '/' + this.total, 6, 30, 8, '#d4a020');
          api.txt('COMBO ' + this.combo, W - 70, 30, 8, this.combo >= 5 ? '#d4a020' : '#8a7a9a');
          for (let i = 0; i < 6; i++) g.rect(W - 6 - (i + 1) * 9, H - 12, 6, 6, i < this.misses ? '#6a2a4a' : '#2a1a2a');
          api.vignette(); api.scanlines();
        },
      },

      /* ═══════════════════ SCENE 3 — DARCY'S LETTER (word puzzle) ═══════════ */
      {
        id: 'letter',
        name: "DARCY'S LETTER",
        sub: 'READ BETWEEN THE LINES',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          g.rect(x - 8, y - 5, 16, 11, '#e8d8c0');
          g.rectO(x - 8, y - 5, 16, 11, '#8a7050', 1);
          c.strokeStyle = '#8a7050'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x - 8, y - 5); c.lineTo(x, y + 1); c.lineTo(x + 8, y - 5); c.stroke();
        },
        intro: [
          'AFTER THE REFUSED PROPOSAL,',
          'DARCY WRITES TO EXPLAIN',
          'HIMSELF. ELIZABETH READS',
          'closely, and re-reads.',
        ],
        quote: 'I will not sooner expose myself to the danger of your penetration.',
        help: 'TAP the word that best completes the line',
        winText: 'Every word reread, her certainties come undone — she understands him now.',
        loseText: 'The page is smudged with too many wrong turns; the meaning slips away.',
        blanks: [
          { text: 'Be not alarmed, Madam, on receiving this ____.',
            choices: ['letter', 'invitation'], correct: 0 },
          { text: "Mr Wickham's chief object was unquestionably my sister's ____.",
            choices: ['fortune', 'friendship'], correct: 0 },
          { text: 'I have been selfish all my life, in practice, though not in ____.',
            choices: ['principle', 'appearance'], correct: 0 },
          { text: 'I believed your sister ____ to my friend.',
            choices: ['indifferent', 'devoted'], correct: 0 },
          { text: 'The gravest charge you laid against me concerned my treatment of Mr ____.',
            choices: ['Wickham', 'Collins'], correct: 0 },
          { text: 'I will only add, God bless ____.',
            choices: ['you', 'them'], correct: 0 },
        ],
        init(api) {
          this.idx = 0;
          this.lives = 5;
          this.order = this.blanks.map(() => (api.chance(0.5) ? [0, 1] : [1, 0]));
          this.sel = 0;
          this.flashWrong = 0;
          this.triedWrong = new Set();
        },
        update(api, dt) {
          if (this.flashWrong > 0) this.flashWrong -= dt;
          if (this.idx >= this.blanks.length) return;
          const order = this.order[this.idx];
          if (api.keyPressed('up') || api.keyPressed('down')) { this.sel = (this.sel + 1) % 2; api.audio.sfx('blip'); }
          let choose = -1;
          if (api.pointer.justDown) {
            const rects = this.optRects(api);
            for (let i = 0; i < 2; i++) {
              const r = rects[i];
              if (api.pointer.x >= r.x && api.pointer.x <= r.x + r.w && api.pointer.y >= r.y && api.pointer.y <= r.y + r.h) choose = i;
            }
          }
          if (api.keyPressed('a') || api.keyPressed('start')) choose = this.sel;
          if (choose >= 0) {
            const b = this.blanks[this.idx];
            const pickedWordIdx = order[choose];
            if (pickedWordIdx === b.correct) {
              api.score += 25; api.audio.sfx('coin');
              api.burst(api.W / 2, api.H * 0.5, '#d4a020', 8);
              this.idx++; this.sel = 0; this.triedWrong = new Set();
              if (this.idx >= this.blanks.length) {
                applyDelta(3, 3);
                api.score += 40;
                api.win();
              }
            } else if (!this.triedWrong.has(choose)) {
              this.triedWrong.add(choose);
              this.lives--; this.flashWrong = 0.3;
              api.shake(4, 0.2); api.audio.sfx('hurt'); api.flash('#4a2a6a', 0.15);
              if (this.lives <= 0) { applyDelta(-1, 0); api.lose(); }
            }
          }
        },
        optRects(api) {
          const W = api.W, y0 = api.H * 0.62, h = 44, gap = 12;
          return [0, 1].map((i) => ({ x: 20, y: y0 + i * (h + gap), w: W - 40, h }));
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          pemberleyBg(api);
          api.topBar("DARCY'S LETTER");
          drawMeters(api);

          const py = H * 0.28;
          g.rect(18, py, W - 36, 100, '#f0e4d0');
          g.rectO(18, py, W - 36, 100, '#8a7050', 1);
          if (this.idx < this.blanks.length) {
            api.txtCHead(this.blanks[this.idx].text, W / 2, py + 12, 9, '#3a2818', false, 13, W - 52);
          } else {
            api.txtCFit('...I am, Madam, D.', W / 2, py + 40, 9, '#3a2818', false, W - 52);
          }
          for (let i = 0; i < this.blanks.length; i++) {
            g.rect(20 + i * 12, py + 90, 8, 4, i < this.idx ? '#d4a020' : '#c8b898');
          }

          if (this.idx < this.blanks.length) {
            const order = this.order[this.idx], b = this.blanks[this.idx];
            const rects = this.optRects(api);
            for (let i = 0; i < 2; i++) {
              const r = rects[i], sel = this.sel === i, tried = this.triedWrong.has(i);
              g.rect(r.x, r.y, r.w, r.h, tried ? '#c8b8a8' : (sel ? '#f8f0f4' : '#f0e8d8'));
              g.rectO(r.x, r.y, r.w, r.h, tried ? '#8a7060' : (sel ? '#c85a7a' : '#b8a898'), sel && !tried ? 2 : 1);
              api.txtC(b.choices[order[i]], r.x + r.w / 2, r.y + 14, 10, tried ? '#8a7060' : '#2a1a1a');
              if (tried) api.txtC('✕', r.x + r.w - 16, r.y + 14, 10, '#9a2a4a');
            }
          }
          for (let i = 0; i < 5; i++) g.rect(W - 8 - (i + 1) * 11, 30, 8, 8, i < this.lives ? '#c85a7a' : '#2a1a2a');
          api.vignette(); api.scanlines();
        },
      },

      /* ═══════════════════ SCENE 4 — THE SECOND PROPOSAL (dialogue, finale) ═ */
      makeDialogueChapter({
        id: 'proposal',
        name: 'THE SECOND PROPOSAL',
        sub: 'PEMBERLEY, AT LAST',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x - 3, y - 1, 4, '#c85a7a');
          g.circle(x + 3, y - 1, 4, '#c85a7a');
          g.circle(x, y + 3, 4, '#c85a7a');
        },
        intro: [
          'MONTHS HAVE PASSED.',
          'DARCY FINDS HER AGAIN,',
          'HIS PRIDE HUMBLED BY',
          'everything that came between.',
        ],
        quote: 'You must allow me to tell you how ardently I admire and love you.',
        winText: '', loseText: '',
        bg: pemberleyBg,
        applyEnding(chapterThis, localDelta) {
          const bonus = Math.floor((stats.affection + stats.reputation - 70) / 15);
          const win = (localDelta + bonus) >= 8;
          if (win) {
            chapterThis.winText = stats.affection >= 70
              ? '"I love you." No pride, no prejudice left between them — only two people, finally honest.'
              : 'She says yes — quietly, but she means it with her whole heart.';
          } else {
            chapterThis.loseText = 'The words come, but too carefully guarded. He leaves uncertain, and so does she.';
          }
          return win;
        },
        beats: [
          { speaker: 'Mr Darcy', line: '"My affections and wishes are unchanged. Tell me plainly, if your feelings remain as they were."',
            options: [
              { label: 'Admit your feelings have undergone a total change.', aff: 5, rep: 1, reactGood: '“You have made me happier than I deserve.”' },
              { label: 'Tease him a little before you answer.', aff: 2, rep: 3, reactGood: '“As impertinent as ever — I would have it no other way.”' },
            ] },
          { speaker: 'Mr Darcy', line: '"I was properly humbled. I came to Pemberley to learn what I might ask of you."',
            options: [
              { label: 'Thank him for his honesty, and mean it.', aff: 4, rep: 2, reactGood: '“Then we begin as equals.”' },
              { label: 'Remind him, gently, of his past pride.', aff: 0, rep: 3, reactGood: '“I deserved that, I think.”' },
            ] },
          { speaker: 'Mr Darcy', line: '"Will you make me the happiest of men?"',
            options: [
              { label: "Say yes, without a moment's pride standing between you.", aff: 5, rep: 0, reactGood: '“Then I am the happiest.”' },
              { label: 'Accept — but insist he make his peace with your family first.', aff: 1, rep: 4, reactGood: '“Gladly, and gratefully.”' },
            ] },
        ],
      }),

    ], // end chapters
  }); // end RetroSaga.create
})();
