/* ============================================================================
 * ALICE IN WONDERLAND — A PIXEL TALE
 * Five chapters through Lewis Carroll's novel:
 *   1. THE RABBIT HOLE   — steer-and-fall dodge (keeps the original mechanic)
 *   2. POOL OF TEARS     — swim-and-collect
 *   3. MAD TEA PARTY     — timing-catch rhythm
 *   4. QUEEN'S CROQUET   — swing-and-aim (flamingo mallet)
 *   5. OFF WITH HER HEAD — dodge the flying cards
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const U = Retro.util;

  const SUITS = ['♥', '♠', '♦', '♣', '★'];
  const SUIT_COL = ['#cc2020', '#1a1a2e', '#cc2020', '#1a1a2e', '#9b5cff'];

  /* -------------------------------------------------------------------------- */
  /* Emblem — White Rabbit with pocket watch                                     */
  /* -------------------------------------------------------------------------- */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    // ears
    g.rect(cx - 9, cy - 54, 6, 24, '#f4f0e8');
    g.rect(cx + 3, cy - 54, 6, 24, '#f4f0e8');
    g.rect(cx - 8, cy - 53, 4, 20, '#ff9dbb');
    g.rect(cx + 4, cy - 53, 4, 20, '#ff9dbb');
    // head
    g.circle(cx, cy - 30, 11, '#f4f0e8');
    g.rect(cx - 3, cy - 34, 3, 3, '#cc2020');
    g.rect(cx + 2, cy - 34, 3, 3, '#cc2020');
    g.rect(cx - 2, cy - 27, 4, 2, '#ff9dbb');
    // waistcoat + body
    g.circle(cx, cy - 14, 14, '#f4f0e8');
    g.rect(cx - 6, cy - 22, 12, 16, '#c8a800');
    g.rect(cx - 1, cy - 22, 2, 16, '#a07800');
    // pocket watch
    g.circle(cx + 14, cy - 12, 7, '#ffe14d');
    g.circle(cx + 14, cy - 12, 5, '#c8a800');
    g.line(cx + 14, cy - 12, cx + 14, cy - 16, '#1a1a2e', 1);
    g.line(cx + 14, cy - 12, cx + 16, cy - 10, '#1a1a2e', 1);
    // legs
    g.rect(cx - 8, cy - 2, 7, 12, '#f4f0e8');
    g.rect(cx + 1, cy - 2, 7, 12, '#f4f0e8');
  }

  /* -------------------------------------------------------------------------- */
  /* Scenery — Wonderland outdoors (boot/intro/result/finale) or card table     */
  /* -------------------------------------------------------------------------- */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Green felt card table
      const felt = c.createLinearGradient(0, 0, 0, H);
      felt.addColorStop(0, '#1d5c1d'); felt.addColorStop(1, '#0b360b');
      c.fillStyle = felt; c.fillRect(0, 0, W, H);
      // subtle felt circles
      c.strokeStyle = 'rgba(255,255,255,0.04)'; c.lineWidth = 1;
      for (let i = 0; i < 10; i++) { c.beginPath(); c.arc(W / 2, H / 2, 28 + i * 22, 0, Math.PI * 2); c.stroke(); }
      // wood rim
      c.fillStyle = '#3a1a0a'; c.fillRect(0, H - 20, W, 20);
      c.fillStyle = '#5a2a10'; c.fillRect(0, H - 22, W, 4);
      // decorative scattered loose cards around the edges
      const loose = [[14, H - 70, -0.22], [W - 46, H - 68, 0.18], [8, 76, 0.28], [W - 42, 80, -0.14]];
      for (const [lx, ly, la] of loose) {
        c.save(); c.translate(lx + 16, ly + 22); c.rotate(la);
        c.fillStyle = '#f4f0e8'; c.fillRect(-16, -22, 32, 44);
        c.strokeStyle = '#ccc'; c.lineWidth = 0.5; c.strokeRect(-16, -22, 32, 44);
        c.fillStyle = 'rgba(0,0,0,0.15)'; c.font = '12px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('♥', 0, 0); c.restore();
      }
      return;
    }

    // Wonderland outdoor backdrop
    const sky = c.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, '#4db8f5'); sky.addColorStop(1, '#a8e4f0');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    // grass
    c.fillStyle = '#3dde5a'; c.fillRect(0, H - 68, W, 68);
    c.fillStyle = '#2ab84a'; c.fillRect(0, H - 70, W, 6);
    // clouds (drift rightward)
    for (let i = 0; i < 3; i++) {
      const bx = ((t * 9 + i * 88) % (W + 60)) - 30, by = 30 + i * 28;
      c.fillStyle = 'rgba(255,255,255,0.88)';
      c.beginPath(); c.arc(bx, by, 18, 0, Math.PI * 2);
      c.arc(bx + 18, by - 6, 14, 0, Math.PI * 2);
      c.arc(bx + 32, by, 12, 0, Math.PI * 2);
      c.fill();
    }
    // flowers
    const fclr = ['#ff6eb4','#ffe14d','#ff8a3d','#ff6eb4','#9b5cff','#ff2e97','#ffe14d','#21e6ff'];
    for (let i = 0; i < 8; i++) {
      const fx = 14 + i * 33, fy = H - 58;
      g.circle(fx, fy, 6, fclr[i]); g.circle(fx, fy, 3, '#fffbe0');
      g.line(fx, fy + 6, fx, fy + 18, '#2ab84a', 2);
    }
    // mushrooms
    for (let i = 0; i < 3; i++) {
      const mx = 38 + i * 92, my = H - 50;
      g.rect(mx - 4, my - 14, 8, 14, '#c8c0b0');
      g.circle(mx, my - 16, 12, '#cc2020');
      for (let d = 0; d < 3; d++) g.circle(mx - 7 + d * 7, my - 14, 2, 'rgba(255,255,255,0.7)');
    }
    // rabbit hole entrance (at far right)
    const hx = W * 0.84, hy = H - 50;
    const hg = c.createRadialGradient(hx, hy, 2, hx, hy, 18);
    hg.addColorStop(0, '#1a0a3a'); hg.addColorStop(1, '#3dde5a');
    c.fillStyle = hg; c.beginPath(); c.ellipse(hx, hy, 16, 12, 0, 0, Math.PI * 2); c.fill();
    // White rabbit hopping across field
    const rbx = ((t * 30 + 60) % (W + 50)) - 25, rby = H - 48;
    g.circle(rbx, rby - 8, 6, '#f4f0e8');
    g.circle(rbx, rby - 20, 4, '#f4f0e8');
    g.rect(rbx - 2, rby - 28, 2, 8, '#f4f0e8');
    g.rect(rbx + 1, rby - 28, 2, 8, '#f4f0e8');

    if (scene !== 'boot') { c.fillStyle = 'rgba(4,24,4,.66)'; c.fillRect(0, 0, W, H); }
  }

  /* -------------------------------------------------------------------------- */
  /* Helper: draw Alice sprite (shared across chapters)                         */
  /* -------------------------------------------------------------------------- */
  function drawAlice(g, x, y, scale) {
    const s = scale || 2;
    g.sprite(['.yyyy.', 'yyyyyy', '.ffff.', 'b.bb.b', 'bbbbbb', '.bwwb.', '.b..b.', '.l..l.'],
      x - 3 * s, y - 8 * s, { y: '#ffe14d', f: '#f2d2a8', b: '#21a0ff', w: '#ffffff', l: '#1b3a5a' }, s);
  }

  function drawBgCurio(g, x, y, kind, spin) {
    if (kind === 'clock') {
      g.circle(x, y, 6, '#caa15a'); g.circle(x, y, 4, '#160a30');
      g.line(x, y, x + Math.cos(spin) * 3, y + Math.sin(spin) * 3, '#caa15a', 1);
    } else if (kind === 'cup') {
      g.rect(x - 4, y - 2, 8, 5, '#e8e0ff'); g.rect(x + 4, y - 1, 2, 3, '#e8e0ff');
    } else if (kind === 'book') {
      g.rect(x - 5, y - 4, 10, 8, '#8e3a5a'); g.rect(x - 1, y - 4, 2, 8, '#ffd6ea');
    } else {
      g.rect(x - 5, y - 7, 10, 14, '#f4f0ff'); g.rect(x - 5, y - 7, 10, 2, '#ff2e97');
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Menu card layout — 5 playing cards scattered on the green felt             */
  /* -------------------------------------------------------------------------- */
  const CARD_RECTS = [
    { x: 18,  y: 108, w: 108, h: 74 },
    { x: 144, y: 108, w: 108, h: 74 },
    { x: 18,  y: 202, w: 108, h: 74 },
    { x: 144, y: 202, w: 108, h: 74 },
    { x: 81,  y: 308, w: 108, h: 74 },
  ];
  const CARD_ANGLES = [-0.05, 0.07, 0.06, -0.07, 0.02];

  function drawCard(api, info) {
    const g = api.gfx, c = api.ctx;
    const { ch, i, x, y, w, h, sel, done, best } = info;
    const suit = SUITS[i], suitCol = SUIT_COL[i];
    const hw = w / 2, hh = h / 2;

    c.save();
    c.translate(x + hw, y + hh);
    c.rotate(CARD_ANGLES[i]);

    // shadow
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-hw + 4, -hh + 4, w, h);

    // card face
    c.fillStyle = sel ? '#f0fff4' : '#f8f4e8';
    c.beginPath();
    const r = 5;
    c.moveTo(-hw + r, -hh); c.lineTo(hw - r, -hh); c.arcTo(hw, -hh, hw, -hh + r, r);
    c.lineTo(hw, hh - r); c.arcTo(hw, hh, hw - r, hh, r);
    c.lineTo(-hw + r, hh); c.arcTo(-hw, hh, -hw, hh - r, r);
    c.lineTo(-hw, -hh + r); c.arcTo(-hw, -hh, -hw + r, -hh, r);
    c.closePath(); c.fill();

    // border
    c.strokeStyle = sel ? '#3dde5a' : '#c8c0a0';
    c.lineWidth = sel ? 2.5 : 1; c.stroke();

    // suit corners
    c.fillStyle = suitCol; c.font = 'bold 11px serif'; c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText(suit, -hw + 4, -hh + 3);
    c.textAlign = 'right'; c.textBaseline = 'bottom';
    c.fillText(suit, hw - 4, hh - 3);

    // chapter name (up to 2 lines, bold Courier New at 8px)
    c.fillStyle = '#1a1a2e'; c.font = 'bold 8px "Courier New",monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const words = ch.name.split(' ');
    if (ch.name.length <= 13) {
      c.fillText(ch.name, 0, -10);
    } else {
      const mid = Math.ceil(words.length / 2);
      c.fillText(words.slice(0, mid).join(' '), 0, -18);
      c.fillText(words.slice(mid).join(' '), 0, -6);
    }

    // sub
    if (ch.sub) {
      c.fillStyle = '#888'; c.font = '6px "Courier New",monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(ch.sub.slice(0, 22), 0, 12);
    }

    // done / play
    if (done) {
      c.fillStyle = '#3dde5a'; c.font = 'bold 16px serif'; c.textAlign = 'right'; c.textBaseline = 'middle';
      c.fillText('✓', hw - 5, hh - 16);
      c.fillStyle = '#777'; c.font = '6px "Courier New",monospace'; c.textAlign = 'center';
      c.fillText('' + best, 0, hh - 10);
    } else {
      c.fillStyle = sel ? '#3dde5a' : '#bbb'; c.font = 'bold 14px serif'; c.textAlign = 'right'; c.textBaseline = 'middle';
      c.fillText('▶', hw - 5, 4);
    }

    c.restore();
  }

  /* ========================================================================== */
  RetroSaga.create({
    id: 'alice',
    title: 'Alice in Wonderland',
    subtitle: 'FIVE TALES FROM WONDERLAND',
    currency: 'CURIOSITY',
    accent: '#21e6ff',
    credit: 'A PIXEL TRIBUTE · LEWIS CARROLL, 1865',
    emblem,
    scenery,
    bootCta: 'TAP TO TUMBLE IN',
    bootLine: 'FIVE TALES · ONE WONDERLAND',
    menuLabel: 'CHOOSE A TALE TO BEGIN',
    menuHint: 'TAP A CARD TO PLAY',
    menuDone: 'WONDERLAND CONQUERED!',
    palette: {
      ink: '#0d1f0d', dark: '#1a3a1a', panel: '#0d2a10', gold: '#21e6ff',
      cream: '#fffbe0', dim: '#9de0a2', blood: '#cc2020', white: '#f4f0e8',
      shadow: 'rgba(0,0,0,.52)',
    },
    screens: {
      win: '#3dde5a', lose: '#cc2020', chapterLabel: '#9b5cff',
      name: '#21e6ff', sub: '#ff6eb4', intro: '#fffbe0', quote: '#9de0a2',
      help: '#ffe14d', score: '#fffbe0', cur: '#21e6ff', cta: '#fffbe0',
      overlay: 'rgba(4,22,4,.84)',
    },
    labels: {
      chapter: 'TALE', score: 'CURIOSITY GAINED',
      win: 'CURIOUSER AND CURIOUSER!', lose: 'OH DEAR, OH DEAR!',
      cont: 'TAP TO CONTINUE', finale: 'TAP FOR THE FINALE',
      toMenu: 'TAP TO RETURN', play: 'TAP TO PLAY',
    },
    menu: {
      colors: {
        title: '#ffe14d', label: '#9de0a2', cur: '#fffbe0', hint: '#9de0a2',
        panel: 'rgba(20,60,20,.7)', panelSel: 'rgba(40,100,40,.9)',
        border: '#5dff8f', name: '#fffbe0', nameDone: '#ffe14d', sub: '#9de0a2',
      },
      layout() { return CARD_RECTS; },
      card: drawCard,
      title(api, curiosity) {
        const g = api.gfx, c = api.ctx, W = api.W;
        // felt header strip with gold text
        g.rect(22, 22, W - 44, 52, 'rgba(10,40,10,.82)');
        g.rectO(22, 22, W - 44, 52, '#3dde5a', 1);
        api.txtCFit('ALICE IN WONDERLAND', W / 2, 32, 10, '#ffe14d', false, W - 52);
        api.txtCFit('CURIOSITY  ' + curiosity, W / 2, 52, 9, '#21e6ff', false, W - 52);
        // red string connecting the cards
        c.strokeStyle = 'rgba(204,32,32,.7)'; c.lineWidth = 1.5; c.setLineDash([4, 4]);
        c.beginPath();
        CARD_RECTS.forEach((r, i) => {
          const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
          if (i === 0) c.moveTo(cx, cy); else c.lineTo(cx, cy);
        });
        c.stroke(); c.setLineDash([]);
      },
    },
    finale: [
      '"IT WAS ALL A DREAM,"', 'said Alice, waking under', 'the old tree.', '',
      'But somewhere down below,', 'a White Rabbit checked his watch.',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ====================== 1. DOWN THE RABBIT HOLE ======================== */
      {
        id: 'rabbit-hole', name: 'THE RABBIT HOLE', sub: 'DOWN AND DOWN',
        icon(api, x, y) {
          const c = api.ctx;
          c.strokeStyle = '#9b5cff'; c.lineWidth = 2;
          c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.stroke();
          c.beginPath(); c.arc(x, y, 4, Math.PI * 0.2, Math.PI * 1.5); c.stroke();
          api.gfx.rect(x - 1, y - 3, 2, 6, '#1a0a3a');
        },
        intro: ['THE WHITE RABBIT darts by,', 'late for something important.', 'Alice follows — and falls', 'down, down, down...'],
        quote: 'Down, down, down. Would the fall never come to an end?',
        help: 'STEER through the gaps! Sip DRINK ME to shrink, eat EAT ME to smash!',
        winText: 'The bottom! A tiny door — and a golden key on the glass table.',
        loseText: 'The walls rush past too fast. She tumbles, lost.',
        init(api) {
          const W = api.W, H = api.H;
          this.alice = { x: W / 2, vx: 0 };
          this.walls = []; this.items = []; this.bgItems = [];
          this.depth = 0; this.speed = 1.4; this.sizeState = 'normal'; this.sizeT = 0;
          this.spawnT = 0; this.msg = ''; this.msgT = 0; this.lives = 3; this.flashT = 0;
          for (let i = 0; i < 8; i++) {
            this.bgItems.push({ x: U.rand(0, W), y: U.rand(0, H), kind: U.choice(['clock','cup','book','card']), spin: U.rand(0, 6.28) });
          }
        },
        update(api, dt) {
          const W = api.W, H = api.H, aliceY = H * 0.34;
          const aw = this.sizeState === 'small' ? 9 : this.sizeState === 'big' ? 26 : 16;
          const ah = this.sizeState === 'small' ? 11 : this.sizeState === 'big' ? 30 : 18;

          // Steer — keyboard or pointer
          if (api.keyDown('left')) this.alice.vx -= 0.7;
          if (api.keyDown('right')) this.alice.vx += 0.7;
          if (api.pointer.down) {
            const dx = api.pointer.x - this.alice.x;
            if (Math.abs(dx) > 8) this.alice.vx += U.clamp(dx * 0.08, -0.7, 0.7);
          }
          if (!api.keyDown('left') && !api.keyDown('right') && !api.pointer.down) this.alice.vx *= 0.84;
          this.alice.vx = U.clamp(this.alice.vx, -3.5, 3.5);
          this.alice.x = U.clamp(this.alice.x + this.alice.vx, aw / 2, W - aw / 2);

          this.speed = U.clamp(1.4 + this.depth / 900, 1.4, 4.2);
          this.depth += this.speed * 0.6;
          api.score = Math.floor(this.depth);

          if (this.sizeState !== 'normal') {
            this.sizeT -= dt;
            if (this.sizeT <= 0) { this.sizeState = 'normal'; this.msg = 'BACK TO NORMAL'; this.msgT = 1; }
          }

          this.spawnT -= this.speed;
          if (this.spawnT <= 0) {
            this.spawnT = U.randInt(54, 78);
            const gapW = U.clamp(64 - Math.floor(this.depth / 120) * 3, 34, 64);
            const gapX = U.randInt(10, W - gapW - 10);
            this.walls.push({ y: H + 10, gapX, gapW, fragile: Math.random() < 0.25, hit: false });
            if (Math.random() < 0.8) {
              const r = Math.random();
              const kind = r < 0.34 ? 'key' : r < 0.6 ? 'drink' : r < 0.78 ? 'cake' : 'hazard';
              this.items.push({ x: U.rand(20, W - 20), y: H + U.randInt(30, 70), kind, t: 0, got: false, vx: kind === 'hazard' ? U.rand(-0.6, 0.6) : 0 });
            }
          }

          for (const b of this.bgItems) { b.y -= this.speed * 0.5; b.spin += 0.02; if (b.y < -10) { b.y = H + 10; b.x = U.rand(0, W); } }

          const ab = { x: this.alice.x - aw / 2, y: aliceY - ah / 2, w: aw, h: ah };

          for (const wl of this.walls) {
            wl.y -= this.speed;
            if (wl.hit) continue;
            if (aliceY + ah / 2 > wl.y && aliceY - ah / 2 < wl.y + 8) {
              const inGap = ab.x > wl.gapX && ab.x + ab.w < wl.gapX + wl.gapW;
              if (!inGap) {
                if (this.sizeState === 'big' && wl.fragile) {
                  wl.hit = true; api.audio.sfx('explode'); api.burst(this.alice.x, wl.y, '#ff2e97', 8);
                  this.msg = 'SMASH!'; this.msgT = 1;
                } else {
                  this.lives--; this.flashT = 0.4; api.audio.sfx('hurt'); api.shake(5, 0.25); wl.hit = true;
                  this.msg = 'OUCH! ' + this.lives + ' left'; this.msgT = 1.2;
                  if (this.lives <= 0) { api.lose(); return; }
                }
              }
            }
          }

          for (const it of this.items) {
            it.y -= this.speed; it.t += dt;
            if (it.kind === 'hazard') it.x = U.clamp(it.x + it.vx, 10, W - 10);
            if (it.got) continue;
            const ib = { x: it.x - 7, y: it.y - 7, w: 14, h: 14 };
            if (ab.x < ib.x + ib.w && ab.x + ab.w > ib.x && ab.y < ib.y + ib.h && ab.y + ab.h > ib.y) {
              if (it.kind === 'key') { it.got = true; api.addScore(30); api.audio.sfx('coin'); api.burst(it.x, it.y, '#ffe14d', 8); this.msg = '+KEY!'; this.msgT = 1; }
              else if (it.kind === 'drink') { it.got = true; this.sizeState = 'small'; this.sizeT = 5.5; api.audio.sfx('power'); this.msg = 'DRINK ME!'; this.msgT = 1; }
              else if (it.kind === 'cake') { it.got = true; this.sizeState = 'big'; this.sizeT = 5.5; api.audio.sfx('power'); this.msg = 'EAT ME!'; this.msgT = 1; }
              else {
                if (this.sizeState !== 'big') { this.lives--; this.flashT = 0.4; api.audio.sfx('hurt'); api.shake(4, 0.2); it.got = true; if (this.lives <= 0) { api.lose(); return; } }
                else { it.got = true; api.burst(it.x, it.y, '#ff8a3d', 6); }
              }
            }
          }

          this.walls = this.walls.filter(w => w.y > -14);
          this.items = this.items.filter(i => i.y > -14 && !i.got);
          if (this.msgT > 0) this.msgT -= dt;
          if (this.flashT > 0) this.flashT -= dt;
          if (this.depth >= 500) { api.addScore(100); api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H, aliceY = H * 0.34;
          const grd = c.createRadialGradient(W/2, aliceY, 10, W/2, aliceY, 170);
          grd.addColorStop(0, '#2a1a4a'); grd.addColorStop(0.6, '#160a30'); grd.addColorStop(1, '#06010f');
          c.fillStyle = grd; c.fillRect(0, 0, W, H);
          c.strokeStyle = 'rgba(123,92,255,.18)'; c.lineWidth = 2;
          for (let i = 0; i < 6; i++) { const r = ((this.depth * 0.6 + i * 40) % 240); c.beginPath(); c.arc(W/2, aliceY, r, 0, Math.PI * 2); c.stroke(); }
          c.globalAlpha = 0.4;
          for (const b of this.bgItems) drawBgCurio(g, b.x, b.y, b.kind, b.spin);
          c.globalAlpha = 1;
          for (const wl of this.walls) {
            if (wl.hit) continue;
            const col = wl.fragile ? '#8e5a3a' : '#5a3a6e', top = wl.fragile ? '#ae7a4a' : '#7a5a8e';
            g.rect(0, wl.y, wl.gapX, 8, col); g.rect(0, wl.y, wl.gapX, 2, top);
            g.rect(wl.gapX + wl.gapW, wl.y, W - (wl.gapX + wl.gapW), 8, col);
            g.rect(wl.gapX + wl.gapW, wl.y, W - (wl.gapX + wl.gapW), 2, top);
          }
          for (const it of this.items) {
            if (it.got) continue;
            if (it.kind === 'key') { g.rect(it.x - 1, it.y - 5, 2, 8, '#ffe14d'); g.rect(it.x - 4, it.y + 1, 8, 2, '#ffe14d'); g.circle(it.x, it.y - 5, 3, '#ffe14d'); g.circle(it.x, it.y - 5, 1.5, '#1a0a3a'); }
            else if (it.kind === 'drink') { g.rect(it.x - 4, it.y - 6, 8, 12, '#21e6ff'); g.rect(it.x - 2, it.y - 9, 4, 3, '#cfeeff'); }
            else if (it.kind === 'cake') { g.rect(it.x - 6, it.y - 4, 12, 8, '#ff2e97'); g.rect(it.x - 6, it.y - 6, 12, 3, '#ffd6ea'); }
            else { g.rect(it.x - 5, it.y - 7, 10, 14, '#f4f0ff'); g.rect(it.x - 5, it.y - 7, 10, 2, '#cc2020'); }
          }
          const s = this.sizeState === 'small' ? 1.4 : this.sizeState === 'big' ? 3 : 2;
          if (!(this.flashT > 0 && Math.floor(api.t * 12) % 2 === 0)) {
            g.sprite(['.yyyy.', 'yyyyyy', '.ffff.', 'b.bb.b', 'bbbbbb', '.bwwb.', '.b..b.', '.l..l.'],
              this.alice.x - 3 * s, aliceY - 4 * s, { y:'#ffe14d',f:'#f2d2a8',b:'#21a0ff',w:'#ffffff',l:'#1b3a5a' }, s);
          }
          // progress bar
          const pct = Math.min(1, this.depth / 500);
          g.rect(W - 10, 22, 6, H - 44, 'rgba(0,0,0,.5)');
          g.rect(W - 10, 22 + (1 - pct) * (H - 44), 6, pct * (H - 44), '#3dde5a');
          g.rect(W - 12, 20, 10, 4, '#21e6ff');
          api.topBar('THE RABBIT HOLE');
          api.txt('DEPTH ' + Math.floor(this.depth) + 'm', 6, 20, 9, '#21e6ff');
          let hearts = ''; for (let i = 0; i < this.lives; i++) hearts += '♥';
          api.txt(hearts, W - 8 - this.lives * 10, 20, 9, '#ff6eb4');
          if (this.sizeState !== 'normal') api.txtC(this.sizeState === 'small' ? 'TINY!' : 'HUGE!', W/2, 20, 9, this.sizeState === 'small' ? '#21e6ff' : '#ff2e97');
          if (this.flashT > 0) { c.globalAlpha = this.flashT * 0.8; g.rect(0, 0, W, H, '#ff2e97'); c.globalAlpha = 1; }
          if (this.msgT > 0 && this.msg) api.txtCFit(this.msg, W/2, aliceY - 38, 9, '#ffe14d');
          api.vignette(); api.scanlines();
        },
      },

      /* ====================== 2. POOL OF TEARS =============================== */
      {
        id: 'pool-tears', name: 'POOL OF TEARS', sub: 'SO MUCH SALT WATER',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 7, '#21e6ff'); g.circle(x - 2, y - 1, 3, '#a8e4f0');
          g.rect(x + 4, y - 5, 2, 5, '#21e6ff'); g.circle(x + 5, y, 2, '#21e6ff');
        },
        intro: ['Alice grew so tall her', 'tears flooded the hall.', 'Now she must SWIM through', 'her own pool to escape.'],
        quote: 'Her tears had made a large pool, which spread all round the hall.',
        help: 'DRAG or STEER to swim! Collect all the golden keys!',
        winText: 'The last key! She reaches the shore and spots a tiny door.',
        loseText: 'The pool grows too wide. The creatures close in.',
        init(api) {
          const W = api.W, H = api.H;
          this.alice = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
          this.keys = []; this.creatures = []; this.waves = [];
          this.collected = 0; this.need = 8; this.timer = 38; this.lives = 3; this.flashT = 0;
          for (let i = 0; i < this.need; i++) {
            this.keys.push({ x: U.rand(22, W - 22), y: U.rand(56, H - 36), got: false, bob: U.rand(0, 6.28) });
          }
          const kinds = ['mouse','dodo','crab','mouse'];
          for (let i = 0; i < 4; i++) {
            this.creatures.push({ x: U.rand(0, W), y: U.rand(56, H - 36), vx: U.rand(-0.3, 0.3) || 0.3, vy: U.rand(-0.3, 0.3) || 0.2, kind: kinds[i] });
          }
          for (let i = 0; i < 6; i++) this.waves.push({ x: U.rand(0, W), y: U.rand(0, H), t: U.rand(0, 5) });
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer -= dt;
          api.score = this.collected * 15 + Math.max(0, Math.floor(this.timer));

          let ax = 0, ay = 0;
          if (api.keyDown('left')) ax = -1;
          if (api.keyDown('right')) ax = 1;
          if (api.keyDown('up')) ay = -1;
          if (api.keyDown('down')) ay = 1;
          if (api.pointer.down) {
            const dx = api.pointer.x - this.alice.x, dy = api.pointer.y - this.alice.y;
            const d = Math.sqrt(dx*dx + dy*dy) || 1;
            if (d > 10) { ax = dx / d; ay = dy / d; }
          }
          this.alice.vx = U.clamp(this.alice.vx + ax * 0.38, -2.8, 2.8);
          this.alice.vy = U.clamp(this.alice.vy + ay * 0.38, -2.8, 2.8);
          this.alice.vx *= 0.87; this.alice.vy *= 0.87;
          this.alice.x = U.clamp(this.alice.x + this.alice.vx, 12, W - 12);
          this.alice.y = U.clamp(this.alice.y + this.alice.vy, 38, H - 12);

          for (const k of this.keys) {
            if (k.got) continue; k.bob += dt * 2;
            if (Math.hypot(this.alice.x - k.x, this.alice.y - k.y) < 18) {
              k.got = true; this.collected++; api.addScore(15); api.audio.sfx('coin'); api.burst(k.x, k.y, '#ffe14d', 8);
              if (this.collected >= this.need) { api.addScore(80); api.win(); return; }
            }
          }

          for (const cr of this.creatures) {
            const dx = this.alice.x - cr.x, dy = this.alice.y - cr.y;
            const d = Math.sqrt(dx*dx + dy*dy) || 1;
            cr.vx += (dx / d) * 0.04; cr.vy += (dy / d) * 0.04;
            cr.vx = U.clamp(cr.vx, -1.3, 1.3); cr.vy = U.clamp(cr.vy, -1.3, 1.3);
            cr.x = U.clamp(cr.x + cr.vx, 10, W - 10); cr.y = U.clamp(cr.y + cr.vy, 38, H - 10);
            if (this.flashT <= 0 && Math.hypot(this.alice.x - cr.x, this.alice.y - cr.y) < 18) {
              this.lives--; this.flashT = 1.6; api.audio.sfx('hurt'); api.shake(5, 0.25);
              cr.vx = -cr.vx * 1.6; cr.vy = -cr.vy * 1.6;
              if (this.lives <= 0) { api.lose(); return; }
            }
          }

          for (const w of this.waves) { w.t += dt * 0.8; if (w.t > 5) { w.t = 0; w.x = U.rand(0, W); w.y = U.rand(38, H); } }
          if (this.flashT > 0) this.flashT -= dt;
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const wg = c.createLinearGradient(0, 0, 0, H);
          wg.addColorStop(0, '#0d6494'); wg.addColorStop(1, '#073050');
          c.fillStyle = wg; c.fillRect(0, 0, W, H);
          // wave shimmer
          c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1;
          for (const w of this.waves) { c.beginPath(); c.arc(w.x, w.y, 10 + Math.sin(w.t * 1.5) * 5, 0, Math.PI); c.stroke(); }
          // keys (bobbing)
          for (const k of this.keys) {
            if (k.got) continue;
            const ky = k.y + Math.sin(k.bob) * 3;
            g.circle(k.x, ky - 4, 4, '#ffe14d'); g.circle(k.x, ky - 4, 2, 'rgba(0,0,0,.4)');
            g.rect(k.x - 1, ky - 2, 2, 7, '#ffe14d'); g.rect(k.x - 3, ky + 2, 6, 2, '#ffe14d');
          }
          // creatures
          for (const cr of this.creatures) {
            if (cr.kind === 'mouse') {
              g.circle(cr.x, cr.y, 7, '#a08080'); g.circle(cr.x, cr.y - 8, 5, '#a08080');
              g.circle(cr.x - 5, cr.y - 11, 3, '#f0c0c0'); g.circle(cr.x + 4, cr.y - 11, 3, '#f0c0c0');
              g.circle(cr.x - 2, cr.y - 8, 2, '#cc2020'); g.circle(cr.x + 2, cr.y - 8, 2, '#cc2020');
            } else if (cr.kind === 'dodo') {
              g.circle(cr.x, cr.y, 9, '#9b8a7a'); g.circle(cr.x, cr.y - 11, 5, '#c0a890');
              g.rect(cr.x - 2, cr.y - 12, 4, 2, '#ffe14d'); g.circle(cr.x + 6, cr.y - 2, 3, '#9b8a7a');
            } else {
              g.rect(cr.x - 9, cr.y - 5, 18, 10, '#cc6600');
              g.rect(cr.x - 13, cr.y, 5, 4, '#cc6600'); g.rect(cr.x + 8, cr.y, 5, 4, '#cc6600');
            }
          }
          // Alice swimming
          const blink = this.flashT > 0 && Math.floor(api.t * 8) % 2 === 0;
          if (!blink) g.sprite(['.yyy.', 'yyyyy', '.fff.', 'bbbb.', '.bb..'], this.alice.x - 10, this.alice.y - 10, { y:'#ffe14d',f:'#f2d2a8',b:'#21a0ff' }, 2);
          // HUD
          g.rect(0, 0, W, 20, 'rgba(6,22,40,.9)');
          api.txt('KEYS ' + this.collected + '/' + this.need, 6, 5, 9, '#ffe14d');
          const tc = this.timer < 10 ? '#cc2020' : '#21e6ff';
          api.txtC(Math.ceil(Math.max(0, this.timer)) + 's', W/2, 5, 9, tc);
          api.txt('♥'.repeat(this.lives), W - 4 - this.lives * 11, 5, 9, '#ff6eb4');
          if (this.flashT > 0 && Math.floor(api.t * 6) % 2 === 0) { c.globalAlpha = 0.3; g.rect(0, 0, W, H, '#cc2020'); c.globalAlpha = 1; }
          api.vignette();
        },
      },

      /* ====================== 3. MAD TEA PARTY =============================== */
      {
        id: 'tea-party', name: 'MAD TEA PARTY', sub: 'NO ROOM! NO ROOM!',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 7, y - 6, 14, 3, '#1a1a2e');
          g.rect(x - 5, y - 12, 10, 8, '#1a1a2e');
          g.rect(x - 5, y - 14, 10, 2, '#ff2e97');
          g.rect(x - 3, y - 4, 6, 4, '#c8a800');
        },
        intro: ['"No room! No room!" cried', 'the Hatter and the Hare.', 'But the table was enormous.', 'Catch the flying tea cups!'],
        quote: 'Have some wine. There is no wine. Then it wasn\'t very civil of you to offer it.',
        help: 'TAP when the cup reaches your hand on the right!',
        winText: 'Splendid catching! The Hatter winks. "Have another cup!"',
        loseText: 'Crash! The cups clatter to the grass. The Hatter scowls.',
        init(api) {
          const H = api.H;
          this.cups = []; this.spawnT = 0;
          this.lanes = [H * 0.38, H * 0.55, H * 0.68];
          this.caught = 0; this.need = 16; this.miss = 0; this.maxMiss = 5;
          this.speed = 62; this.spawnGap = 2.0;
          this.cz = { x: api.W - 44, w: 30 };
          this.justCaught = 0; this.lastConfirm = false;
        },
        update(api, dt) {
          const W = api.W;
          this.spawnT -= dt;
          if (this.spawnT <= 0 && this.cups.filter(c => !c.caught && !c.missed).length < 4) {
            const lane = U.randInt(0, this.lanes.length - 1);
            const spd = this.speed + this.caught * 2.2;
            this.cups.push({ x: -24, y: this.lanes[lane], spd, sc: U.rand(0.85, 1.2), caught: false, missed: false, col: U.choice(['#e8d8a0','#d0e8d0','#e8d0e0']) });
            this.spawnT = Math.max(0.75, this.spawnGap - this.caught * 0.055);
          }

          const cfm = api.confirm();
          const czx = this.cz.x;

          for (const cup of this.cups) {
            if (cup.caught || cup.missed) continue;
            cup.x += cup.spd * dt;
            if (cup.x >= czx && cup.x <= czx + this.cz.w) {
              if (cfm && !this.lastConfirm) {
                cup.caught = true; this.caught++; api.addScore(this.caught > 10 ? 20 : 10);
                api.audio.sfx('coin'); api.burst(czx + 15, cup.y, '#ffe14d', 8); this.justCaught = 0.35;
                if (this.caught >= this.need) { api.addScore(60); api.win(); return; }
              }
            } else if (cup.x > czx + this.cz.w + 20) {
              cup.missed = true; this.miss++; api.audio.sfx('hurt'); api.shake(3, 0.12);
              if (this.miss >= this.maxMiss) { api.lose(); return; }
            }
          }

          this.lastConfirm = cfm;
          this.cups = this.cups.filter(c => !c.missed && c.x < W + 40);
          api.score = this.caught * 10;
          if (this.justCaught > 0) this.justCaught -= dt;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Outdoor tea garden
          const sky = c.createLinearGradient(0, 0, 0, H * 0.45);
          sky.addColorStop(0, '#5ac8f0'); sky.addColorStop(1, '#b0e8f5');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          g.rect(0, H - 58, W, 58, '#3dde5a');
          // table
          g.rect(16, H * 0.3, W - 32, H * 0.56, '#c8960a');
          g.rect(16, H * 0.3, W - 32, 5, '#e8b030');
          g.rect(16, H - 58, 12, 58, '#8a5a0a');
          g.rect(W - 28, H - 58, 12, 58, '#8a5a0a');
          // tablecloth pattern (alternating rects)
          for (let iy = Math.floor(H * 0.3); iy < H - 58; iy += 20) {
            for (let ix = 16; ix < W - 16; ix += 20) {
              if ((Math.floor((ix-16)/20) + Math.floor((iy-Math.floor(H * 0.3))/20)) % 2 === 0) { c.globalAlpha = 0.07; g.rect(ix, iy, 20, 20, '#ffffff'); c.globalAlpha = 1; }
            }
          }
          // catch zone highlight
          const czx = this.cz.x, czw = this.cz.w;
          c.globalAlpha = this.justCaught > 0 ? 0.55 : 0.22;
          g.rect(czx, H * 0.27, czw, H * 0.58, '#ffe14d');
          c.globalAlpha = 1;
          // Alice hand
          g.sprite(['.f.', 'fff', '.f.'], czx + czw/2 - 3, H * 0.62, { f: '#f2d2a8' }, 2);
          // Mad Hatter (left end)
          g.circle(22, H * 0.27, 10, '#f2d2a8');
          g.rect(10, H * 0.3, 24, 34, '#7a4a9a');
          g.rect(10, H * 0.17, 24, 4, '#1a1a2e'); g.rect(13, H * 0.07, 18, 26, '#1a1a2e');
          g.rect(13, H * 0.15, 18, 3, '#ff2e97');
          g.circle(18, H * 0.2, 3, '#ffe14d');
          // cups in flight
          for (const cup of this.cups) {
            if (cup.caught || cup.missed) continue;
            const cs = cup.sc, cx = cup.x, cy = cup.y;
            g.rect(cx - 8*cs, cy - 6*cs, 16*cs, 12*cs, cup.col);
            g.rect(cx - 8*cs, cy - 6*cs, 16*cs, 3*cs, '#a08040');
            g.rect(cx + 8*cs, cy - 3*cs, 4*cs, 6*cs, '#d8d0b0');
            g.rect(cx - 8*cs, cy + 6*cs, 20*cs, 2*cs, '#c0b898');
            // steam
            for (let s = 0; s < 2; s++) { c.globalAlpha = 0.45; g.rect(cx - 2 + s * 5 + Math.sin(api.t * 3 + s) * 2, cy - 10*cs - s*3, 2, 5, '#ffffff'); c.globalAlpha = 1; }
          }
          // HUD
          g.rect(0, 0, W, 20, 'rgba(8,4,2,.88)');
          api.txt('CUPS ' + this.caught + '/' + this.need, 6, 5, 9, '#ffe14d');
          api.txtC('TAP!', W/2, 5, 9, '#ff6eb4');
          api.txt('SPILL ' + this.miss + '/' + this.maxMiss, W - 96, 5, 9, this.miss > 3 ? '#cc2020' : '#c8a860');
          api.vignette(); api.scanlines();
        },
      },

      /* ====================== 4. QUEEN'S CROQUET =========================== */
      {
        id: 'queen-croquet', name: "QUEEN'S CROQUET", sub: 'FLAMINGO MALLETS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 8, y + 1, 16, 8, '#cc2020');
          g.rect(x - 8, y - 5, 2, 8, '#cc2020'); g.rect(x - 1, y - 8, 2, 10, '#ffe14d'); g.rect(x + 6, y - 5, 2, 8, '#cc2020');
          g.circle(x, y - 7, 3, '#ffe14d');
        },
        intro: ['The Queen plays CROQUET', 'with flamingos as mallets', 'and hedgehogs as balls.', '"Your turn, child!"'],
        quote: 'Off with their heads! Off with their heads!',
        help: 'WATCH the flamingo swing — TAP to stop it and fire!',
        winText: 'Five wickets! The Queen almost smiles. Your head stays on.',
        loseText: '"OFF WITH HER HEAD!" The card guards close in.',
        init(api) {
          this.swing = 0; this.swingDir = 1; this.swingSpeed = 1.8;
          this.ball = null;
          this.teeX = api.W * 0.14; this.teeY = api.H * 0.72;
          this.hoop = { x: api.W * 0.78, y: api.H * 0.5, w: 14 };
          this.scored = 0; this.need = 5; this.miss = 0; this.maxMiss = 5;
          this.soldiers = [];
          for (let i = 0; i < 3; i++) this.soldiers.push({ x: api.W * 0.35 + i * 44, y: api.H * 0.52, vx: 0.55 + i * 0.22, dir: i % 2 === 0 ? 1 : -1 });
          this.hoopBob = 0; this.result = null; this.resultT = 0;
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.hoopBob += dt;
          const hoopY = this.hoop.y + Math.sin(this.hoopBob * 1.4) * 22;

          for (const s of this.soldiers) {
            s.x += s.vx * s.dir;
            if (s.x > W - 18) s.dir = -1;
            if (s.x < 18) s.dir = 1;
          }

          if (!this.ball) {
            this.swing += this.swingDir * this.swingSpeed * dt;
            if (this.swing > Math.PI * 0.88) { this.swing = Math.PI * 0.88; this.swingDir = -1; }
            if (this.swing < -Math.PI * 0.08) { this.swing = -Math.PI * 0.08; this.swingDir = 1; }
            if (api.confirm()) {
              const angle = this.swing - Math.PI * 0.5;
              const spd = 5.8;
              this.ball = { x: this.teeX, y: this.teeY, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd };
              api.audio.sfx('shoot');
            }
          } else {
            this.ball.x += this.ball.vx;
            this.ball.y += this.ball.vy;
            this.ball.vx *= 0.992; this.ball.vy += 0.055;

            const dx = this.ball.x - this.hoop.x, dy = this.ball.y - hoopY;
            if (Math.abs(dx) < this.hoop.w / 2 + 8 && Math.abs(dy) < 14 && this.ball.vy > 0) {
              if (Math.abs(dx) < this.hoop.w / 2) {
                this.scored++; api.addScore(28); api.audio.sfx('coin'); api.burst(this.hoop.x, hoopY, '#ffe14d', 12);
                this.result = 'THROUGH!'; this.resultT = 1.2; api.shake(4, 0.18); this.swingSpeed = Math.min(3.5, this.swingSpeed + 0.2);
                if (this.scored >= this.need) { api.addScore(60); api.win(); return; }
              } else {
                this.miss++; api.audio.sfx('hurt'); this.result = 'MISS!'; this.resultT = 1.0;
                if (this.miss >= this.maxMiss) { api.lose(); return; }
              }
              this.ball = null;
            }

            for (const s of this.soldiers) {
              if (this.ball && Math.hypot(this.ball.x - s.x, this.ball.y - (s.y + 14)) < 15) {
                this.ball.vx *= -0.5; this.ball.vy = Math.abs(this.ball.vy) * -0.7 - 0.3; api.audio.sfx('blip');
              }
            }

            if (this.ball && (this.ball.x > W + 30 || this.ball.y > H + 30 || this.ball.x < -30)) {
              this.miss++; api.audio.sfx('hurt'); this.result = 'OUT!'; this.resultT = 1.0;
              if (this.miss >= this.maxMiss) { api.lose(); return; }
              this.ball = null;
            }
          }

          if (this.resultT > 0) this.resultT -= dt;
          api.score = this.scored * 28;
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const hoopY = this.hoop.y + Math.sin(this.hoopBob * 1.4) * 22;

          g.rect(0, 0, W, H * 0.45, '#87ceeb');
          g.rect(0, H * 0.45, W, H * 0.55, '#2ab84a');
          for (let i = 0; i < 4; i++) { c.globalAlpha = 0.12; g.rect(0, H * 0.5 + i * 22, W, 1, '#1a5a1a'); c.globalAlpha = 1; }

          // rose bushes
          for (let i = 0; i < 6; i++) {
            const rx = 12 + i * 44, ry = H * 0.44;
            g.rect(rx - 4, ry - 18, 8, 18, '#2ab84a');
            g.circle(rx - 4, ry - 18, 7, '#cc2020'); g.circle(rx + 4, ry - 18, 7, '#cc2020');
            g.circle(rx, ry - 24, 7, '#cc2020'); g.circle(rx, ry - 16, 4, '#ff6eb4');
          }

          // hoop
          g.rect(this.hoop.x - this.hoop.w/2 - 3, hoopY - 18, 5, 36, '#cc2020');
          g.rect(this.hoop.x + this.hoop.w/2 - 2, hoopY - 18, 5, 36, '#cc2020');
          g.rect(this.hoop.x - this.hoop.w/2 - 3, hoopY - 3, this.hoop.w + 6, 6, '#ff8ab0');

          // soldiers (card guards)
          for (const s of this.soldiers) {
            g.rect(s.x - 8, s.y, 16, 28, '#f4f0e8');
            g.rect(s.x - 8, s.y, 16, 5, '#cc2020');
            g.rect(s.x - 6, s.y + 7, 12, 8, '#cc2020');
            g.circle(s.x, s.y - 8, 7, '#f2d2a8');
            g.rect(s.x - 5, s.y - 14, 10, 2, '#1a1a2e'); g.rect(s.x - 4, s.y - 20, 8, 8, '#1a1a2e');
          }

          // Queen at top
          g.rect(W/2 - 18, 20, 36, 40, '#cc2020');
          g.rect(W/2 - 14, 16, 28, 8, '#ffe14d');
          for (let j = 0; j < 3; j++) g.rect(W/2 - 12 + j * 10, 8, 6, 12, '#ffe14d');
          g.circle(W/2, 30, 10, '#f2d2a8');
          g.rect(W/2 - 5, 24, 10, 2, '#cc2020');

          // Flamingo mallet (at tee)
          if (!this.ball) {
            const angle = this.swing - Math.PI * 0.5;
            const lx = this.teeX + Math.cos(angle) * 36, ly = this.teeY + Math.sin(angle) * 36;
            g.line(this.teeX, this.teeY, lx, ly, '#ff9dbb', 3);
            g.circle(lx, ly, 9, '#ff6eb4'); g.circle(lx + 3, ly - 3, 4, '#f2a8b8');
            // aim guide
            const gx = this.teeX + Math.cos(angle) * 80, gy = this.teeY + Math.sin(angle) * 80;
            c.strokeStyle = 'rgba(255,255,255,0.25)'; c.setLineDash([5, 6]); c.lineWidth = 1;
            c.beginPath(); c.moveTo(this.teeX, this.teeY); c.lineTo(gx, gy); c.stroke(); c.setLineDash([]);
            // hedgehog at tee
            g.circle(this.teeX, this.teeY, 9, '#8a6a4a');
            for (let j = 0; j < 6; j++) { const a = (j/6)*Math.PI*2 + api.t; g.rect(this.teeX + Math.cos(a)*8 - 1, this.teeY + Math.sin(a)*8 - 1, 2, 2, '#5a3a2a'); }
            g.circle(this.teeX + 4, this.teeY - 3, 2, '#cc2020');
          }

          if (this.ball) {
            g.circle(this.ball.x, this.ball.y, 9, '#8a6a4a');
            for (let j = 0; j < 6; j++) { const a = (j/6)*Math.PI*2 + api.t*3; g.rect(this.ball.x + Math.cos(a)*8 - 1, this.ball.y + Math.sin(a)*8 - 1, 2, 2, '#5a3a2a'); }
          }

          if (this.resultT > 0) {
            c.globalAlpha = Math.min(1, this.resultT * 2);
            api.txtC(this.result, W/2, H * 0.35, 18, this.result === 'THROUGH!' ? '#3dde5a' : '#cc2020', true);
            c.globalAlpha = 1;
          }

          // HUD
          g.rect(0, 0, W, 20, 'rgba(20,0,0,.88)');
          api.txt('WICKETS ' + this.scored + '/' + this.need, 6, 5, 9, '#ffe14d');
          api.txt('MISS ' + this.miss + '/' + this.maxMiss, W - 88, 5, 9, this.miss > 3 ? '#cc2020' : '#e8d0a0');
          api.vignette(); api.scanlines();
        },
      },

      /* ====================== 5. OFF WITH HER HEAD! ========================= */
      {
        id: 'trial', name: 'OFF WITH HER HEAD', sub: 'SENTENCE FIRST!',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 7, y - 5, 14, 10, '#f4f0e8');
          g.rect(x - 7, y - 5, 14, 3, '#cc2020');
          g.rect(x - 3, y - 3, 6, 5, '#f4f0e8');
          api.txtC('♥', x, y + 1, 7, '#cc2020');
        },
        intro: ['THE TRIAL OF ALICE!', 'The Queen orders cards flung.', 'DODGE the flying deck —', 'and collect the hearts!'],
        quote: '"Sentence first — verdict afterwards!" screamed the Queen of Hearts.',
        help: 'DODGE the flying cards! TAP / DRAG to move Alice!',
        winText: '"You\'re nothing but a pack of cards!" They scatter. Alice wakes.',
        loseText: 'The cards pile on! The Queen\'s wrath buries Alice.',
        init(api) {
          this.alice = { x: api.W / 2, y: api.H * 0.68, vx: 0, vy: 0 };
          this.cards = []; this.hearts = [];
          this.timer = 38; this.lives = 3; this.flashT = 0;
          this.cardSpawnT = 0; this.heartSpawnT = 0;
          this.collected = 0;
          for (let i = 0; i < 4; i++) {
            this.hearts.push({ x: U.rand(20, api.W - 20), y: U.rand(60, api.H - 60), bob: U.rand(0, 6.28), got: false });
          }
        },
        update(api, dt) {
          const W = api.W, H = api.H;
          this.timer -= dt;

          let ax = 0, ay = 0;
          if (api.keyDown('left')) ax = -1;
          if (api.keyDown('right')) ax = 1;
          if (api.keyDown('up')) ay = -1;
          if (api.keyDown('down')) ay = 1;
          if (api.pointer.down) {
            const dx = api.pointer.x - this.alice.x, dy = api.pointer.y - this.alice.y;
            const d = Math.sqrt(dx*dx + dy*dy) || 1;
            if (d > 10) { ax = dx/d; ay = dy/d; }
          }
          this.alice.vx = U.clamp(this.alice.vx + ax * 0.4, -3.2, 3.2);
          this.alice.vy = U.clamp(this.alice.vy + ay * 0.4, -3.2, 3.2);
          this.alice.vx *= 0.85; this.alice.vy *= 0.85;
          this.alice.x = U.clamp(this.alice.x + this.alice.vx, 12, W - 12);
          this.alice.y = U.clamp(this.alice.y + this.alice.vy, 38, H - 16);

          // Spawn cards
          this.cardSpawnT -= dt;
          if (this.cardSpawnT <= 0) {
            const elapsed = 38 - this.timer;
            const speed = 80 + elapsed * 3.5;
            const side = Math.random() < 0.5;
            const ox = side ? -22 : W + 22, oy = U.rand(44, H - 36);
            const ang = Math.atan2(this.alice.y - oy, this.alice.x - ox) + U.rand(-0.45, 0.45);
            this.cards.push({ x: ox, y: oy, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, rot: 0, rotV: U.rand(-6, 6), suit: U.choice(SUITS) });
            this.cardSpawnT = Math.max(0.28, 1.1 - elapsed * 0.02);
          }

          // Spawn hearts
          this.heartSpawnT -= dt;
          if (this.heartSpawnT <= 0 && this.hearts.filter(h => !h.got).length < 6) {
            this.hearts.push({ x: U.rand(20, W - 20), y: U.rand(56, H - 56), bob: U.rand(0, 6.28), got: false });
            this.heartSpawnT = 2.8;
          }

          for (const card of this.cards) {
            card.x += card.vx * dt; card.y += card.vy * dt; card.rot += card.rotV * dt;
            if (this.flashT <= 0 && Math.abs(card.x - this.alice.x) < 13 && Math.abs(card.y - this.alice.y) < 18) {
              this.lives--; this.flashT = 1.5; api.audio.sfx('hurt'); api.shake(5, 0.25);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          this.cards = this.cards.filter(c => c.x > -30 && c.x < W + 30 && c.y > -30 && c.y < H + 30);

          for (const h of this.hearts) {
            if (h.got) continue; h.bob += dt * 2;
            if (Math.hypot(this.alice.x - h.x, this.alice.y - h.y) < 16) {
              h.got = true; this.collected++; api.addScore(20); api.audio.sfx('coin'); api.burst(h.x, h.y, '#cc2020', 8);
            }
          }

          if (this.flashT > 0) this.flashT -= dt;
          api.score = this.collected * 20 + Math.max(0, Math.floor(this.timer));
          if (this.timer <= 0) { api.addScore(this.collected * 10 + 80); api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Courtroom — checkered floor, red drapes
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#4a0a0a'); bg.addColorStop(1, '#1a0404');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);
          for (let fy = H * 0.52; fy < H; fy += 24) {
            for (let fx = 0; fx < W; fx += 24) {
              if ((Math.floor(fx/24) + Math.floor((fy - Math.floor(H*0.52))/24)) % 2 === 0) g.rect(fx, fy, 24, 24, '#cc2020');
              else g.rect(fx, fy, 24, 24, '#1a0404');
            }
          }
          // red curtain columns
          g.rect(0, 0, 18, H, '#8a0a0a'); g.rect(W - 18, 0, 18, H, '#8a0a0a');
          for (let cy2 = 0; cy2 < H; cy2 += 28) { g.rect(0, cy2, 18, 14, '#aa1a1a'); g.rect(W - 18, cy2, 18, 14, '#aa1a1a'); }
          // card crowd
          for (let i = 0; i < 5; i++) {
            const cx = 30 + i * 44, cy2 = H * 0.52 - 24;
            g.rect(cx - 8, cy2, 16, 24, '#f4f0e8'); g.rect(cx - 8, cy2, 16, 4, '#cc2020');
            g.circle(cx, cy2 - 8, 7, '#f2d2a8');
          }
          // Queen throne
          g.rect(W/2 - 22, 18, 44, 44, '#cc2020'); g.rect(W/2 - 18, 14, 36, 8, '#ffe14d');
          for (let j = 0; j < 4; j++) g.rect(W/2 - 16 + j * 10, 6, 6, 12, '#ffe14d');
          g.circle(W/2, 30, 12, '#f2d2a8'); g.rect(W/2 - 6, 22, 12, 2, '#cc2020');
          // hearts
          for (const h of this.hearts) {
            if (h.got) continue;
            const hy = h.y + Math.sin(h.bob) * 3;
            c.fillStyle = '#cc2020'; c.font = '18px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillText('♥', h.x, hy);
          }
          // flying cards
          for (const card of this.cards) {
            c.save(); c.translate(card.x, card.y); c.rotate(card.rot);
            c.fillStyle = '#f4f0e8'; c.fillRect(-10, -14, 20, 28);
            c.strokeStyle = '#ddd'; c.lineWidth = 1; c.strokeRect(-10, -14, 20, 28);
            c.fillStyle = ['♥','♦','★'].includes(card.suit) ? '#cc2020' : '#1a1a2e';
            c.font = 'bold 10px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillText(card.suit, 0, 0); c.restore();
          }
          // Alice
          const blink = this.flashT > 0 && Math.floor(api.t * 9) % 2 === 0;
          if (!blink) drawAlice(g, this.alice.x, this.alice.y, 2);
          // HUD
          g.rect(0, 0, W, 20, 'rgba(30,0,0,.9)');
          api.txt('♥ ' + this.collected, 6, 5, 9, '#cc2020');
          api.txt('♥'.repeat(this.lives), W - 4 - this.lives * 11, 5, 9, '#ff6eb4');
          const tc = this.timer < 10 ? '#cc2020' : '#ffe14d';
          api.txtC(Math.ceil(Math.max(0, this.timer)) + 's', W/2, 5, 9, tc);
          if (this.flashT > 0 && Math.floor(api.t * 6) % 2 === 0) { c.globalAlpha = 0.35; g.rect(0, 0, W, H, '#cc2020'); c.globalAlpha = 1; }
          api.vignette();
        },
      },

    ],
  });
})();
