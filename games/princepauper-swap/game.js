/* ============================================================================
 * THE PRINCE AND THE PAUPER — FIVE TUDOR TALES
 * Mark Twain's 1882 novel told as five mini-games:
 *   1. THE PALACE GATES  — stealth timing: slip past the guard patrols
 *   2. LIFE AT COURT     — sequence memory: copy the herald's announcements
 *   3. LONDON STREETS    — dodge runner: Edward flees the angry crowd
 *   4. MILES HENDON      — parry timing: left/right sword defence
 *   5. THE CORONATION    — race collect: reach Westminster before dawn
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── Tudor palette ── */
  const C = {
    crimson:  '#8b1515', crimsonL: '#c02828', gold: '#d4a820', goldL: '#f0c840',
    parchment:'#f0e0c0', parchD:   '#c4a870', stone:  '#706060', stoneD: '#584848',
    royal:    '#2a1060', royalL:   '#4a28a0', midnight:'#0a0614', ink: '#1a0c08',
    sky:      '#7098c8', flesh:    '#e8b880', straw: '#d8c080',
  };

  /* ── crown emblem ── */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    g.rect(cx - 16, cy + 4, 32, 8, C.gold);
    g.rect(cx - 14, cy - 2, 4, 8, C.gold);
    g.rect(cx - 2,  cy - 6, 4, 10, C.gold);
    g.rect(cx + 10, cy - 2, 4, 8, C.gold);
    g.rect(cx - 18, cy + 2, 4, 4, C.gold);
    g.rect(cx + 14, cy + 2, 4, 4, C.gold);
    g.rect(cx - 1, cy - 10, 2, 4, C.crimsonL);
    g.rect(cx - 9, cy - 6, 2, 3, C.crimsonL);
    g.rect(cx + 7, cy - 6, 2, 3, C.crimsonL);
  }

  /* ── scenery ── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      /* Throne room: deep crimson velvet walls, gold sconces, stone floor */
      c.fillStyle = '#2a0a18'; c.fillRect(0, 0, W, H);
      /* Velvet wall pattern */
      c.fillStyle = '#3a0e20';
      for (let x = 0; x < W; x += 24) {
        c.fillRect(x, 0, 2, H);
        for (let y = 0; y < H; y += 24) c.fillRect(x, y, 24, 2);
      }
      /* Stone floor */
      c.fillStyle = '#3a2818'; c.fillRect(0, H - 80, W, 80);
      c.fillStyle = '#2e2010';
      for (let x = 0; x < W; x += 32) c.fillRect(x, H - 80, 1, 80);
      for (let y = H - 80; y < H; y += 20) c.fillRect(0, y, W, 1);
      /* Gold sconces */
      const sconces = [20, W - 30];
      for (const sx of sconces) {
        g.rect(sx - 4, 30, 8, 16, C.gold); g.rect(sx - 6, 44, 12, 6, C.gold);
        c.globalAlpha = 0.25 + 0.1 * Math.sin(t * 3); g.circle(sx, 28, 10, '#ffd060'); c.globalAlpha = 1;
        g.circle(sx, 32, 3, '#fff090');
      }
      /* Throne silhouette */
      c.fillStyle = '#6a2010';
      g.rect(W/2 - 22, H - 80, 44, 72); g.rect(W/2 - 26, H - 118, 52, 40);
      g.rect(W/2 - 10, H - 124, 8, 6, C.gold); g.rect(W/2 + 2, H - 124, 8, 6, C.gold);
      return;
    }

    /* Default sky: Tudor daytime or night */
    const isNight = scene === 'result' || scene === 'finale';
    if (isNight) {
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0a0618'); sky.addColorStop(1, '#1e1030');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 30; i++) { const sx = (i * 89 + 7) % W, sy = (i * 53 + 5) % (H * 0.45); c.globalAlpha = 0.4 + 0.3 * Math.sin(t + i); g.rect(sx, sy, 1, 1, '#e8e0d0'); } c.globalAlpha = 1;
      g.circle(W - 50, 46, 20, '#d0c898'); g.circle(W - 43, 40, 17, '#1e1030');
    } else {
      const sky = c.createLinearGradient(0, 0, 0, H * 0.6);
      sky.addColorStop(0, '#5080b0'); sky.addColorStop(1, '#90b8d8');
      c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.6);
      /* Clouds */
      c.fillStyle = 'rgba(255,255,255,0.35)';
      const clouds = [[30, 60, 50, 20], [130, 45, 70, 18], [210, 70, 55, 16]];
      for (const [cx2, cy2, cw, ch] of clouds) {
        c.beginPath(); c.ellipse(cx2 + (t * 4) % (W + 80) - 40, cy2, cw, ch, 0, 0, Math.PI * 2); c.fill();
      }
    }

    /* London cobblestone ground */
    c.fillStyle = '#504040'; c.fillRect(0, H * 0.6, W, H * 0.4);
    c.fillStyle = '#3c3030';
    for (let x = 0; x < W; x += 18) c.fillRect(x, H * 0.6, 1, H * 0.4);
    for (let y = Math.floor(H * 0.6); y < H; y += 14) c.fillRect(0, y, W, 1);

    /* Westminster spire silhouette */
    c.fillStyle = '#1a1020';
    const bx = 20, by = H * 0.6 - 100;
    g.rect(bx, by, 30, 100); g.rect(bx + 10, by - 30, 10, 32);
    g.rect(bx + 8, by - 36, 14, 6);
    g.rect(bx + 12, by - 44, 6, 10);
    g.rect(bx + 14, by - 50, 2, 8);

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(10,6,20,.64)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ── parchment scroll menu card rects (arc layout) ── */
  const SCROLL_POS = [
    [85,  78, 100, 60],   /* ch1 top-center */
    [14, 168, 100, 60],   /* ch2 left-mid */
    [156, 168, 100, 60],  /* ch3 right-mid */
    [14, 258, 100, 60],   /* ch4 left-lower */
    [156, 258, 100, 60],  /* ch5 right-lower */
  ];

  /* ============================================================= */
  RetroSaga.create({
    id: 'princepauper',
    title: 'The Prince & the Pauper',
    subtitle: 'FIVE TUDOR TALES',
    currency: 'HONOURS',
    screens: {
      win:          C.goldL,
      lose:         '#c02828',
      chapterLabel: C.parchD,
      name:         C.parchment,
      sub:          C.goldL,
      intro:        '#e8d4a0',
      quote:        '#a09060',
      help:         C.gold,
      score:        C.parchment,
      cur:          C.gold,
      cta:          C.parchment,
      overlay:      'rgba(10,4,18,.88)',
    },
    labels: {
      chapter:  'TALE',
      score:    'HONOURS EARNED',
      win:      'THE CROWN SHINES',
      lose:     'LOST IN THE CROWD',
      cont:     'TAP TO CONTINUE',
      finale:   'TAP FOR THE CORONATION',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO BEGIN',
    },
    accent:    C.gold,
    credit:    'THE PRINCE AND THE PAUPER · MARK TWAIN',
    bootLine:  'FIVE TALES · TWO LIVES · ONE CROWN',
    tagline:   'A POLECAT TUDOR TALE',
    emblem,
    scenery,
    bootCta:    'TAP TO ENTER THE PALACE',
    menuLabel:  'THE ROYAL PROCLAMATIONS',
    menuHint:   'CHOOSE A TALE',
    menuDone:   'THE CROWN IS RESTORED',
    menu: {
      title(api, cur) {
        const g = api.gfx, c = api.ctx, W = api.W;
        /* Royal seal banner at top */
        c.fillStyle = C.crimson; c.fillRect(0, 0, W, 68);
        c.fillStyle = '#6a1020'; c.fillRect(0, 66, W, 2);
        g.circle(W / 2, 18, 12, C.gold);
        g.circle(W / 2, 18, 7, C.crimson);
        g.circle(W / 2, 18, 3, C.goldL);
        api.txtCFit('ROYAL PROCLAMATIONS', W / 2, 38, 9, C.goldL, true);
        api.txtCFit('HONOURS  ' + cur, W / 2, 56, 8, C.parchD, false);
        /* Connecting ribbon */
        c.strokeStyle = C.crimson; c.lineWidth = 1.5; c.globalAlpha = 0.55; c.setLineDash([3,4]);
        c.beginPath();
        SCROLL_POS.forEach(([x,y,w,h], i) => { const cx = x+w/2, cy = y+h/2; if(i===0)c.moveTo(cx,cy); else c.lineTo(cx,cy); });
        c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
      },
      layout() {
        return SCROLL_POS.map(([x,y,w,h]) => ({ x, y, w, h }));
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        /* Parchment background */
        c.fillStyle = sel ? '#f8eed8' : (done ? '#dfd0a8' : '#e8d8b0');
        c.beginPath(); c.moveTo(x+6,y); c.lineTo(x+w-6,y); c.lineTo(x+w,y+6); c.lineTo(x+w,y+h-6); c.lineTo(x+w-6,y+h); c.lineTo(x+6,y+h); c.lineTo(x,y+h-6); c.lineTo(x,y+6); c.closePath(); c.fill();
        /* Border */
        c.strokeStyle = sel ? C.crimsonL : (done ? C.gold : C.parchD);
        c.lineWidth = sel ? 2 : 1; c.stroke();
        /* Wax seal dot */
        const sealColor = (i===0||i===1||i===3) ? C.crimson : C.stoneD;
        g.circle(x + w/2, y + 8, 5, sealColor); g.circle(x + w/2, y + 8, 2, '#ffd080');
        /* Chapter title */
        api.txtCFit(ch.name, x + w/2, y + 22, 7, '#1a0c08', true, w - 10);
        api.txtCFit(ch.sub,  x + w/2, y + 36, 6, '#6a4020', false, w - 10);
        if (ch.icon) ch.icon(api, x + w - 14, y + h - 14);
        if (done) api.txtCFit('✓ DONE', x + w/2, y + h - 8, 6, C.crimson, false);
      },
    },

    finale: [
      'THE SEAL IS BROKEN —',
      'EDWARD TUDOR TAKES',
      'HIS RIGHTFUL THRONE.',
      'TOM CANTY WALKS FREE,',
      'HONOURED EVER AFTER.',
    ],
    width: 270, height: 480, parent: '#game',

    /* ================================================================
     * CHAPTER 1 — THE PALACE GATES
     * Stealth timing: wait for the guard to turn away, then dash.
     * Tom must pass 4 guard posts to reach the palace gate.
     * Pacing: each gate takes ~4-5s → total ~18-22s of tension.
     * ================================================================ */
    chapters: [
      {
        id: 'gates',
        name: 'THE PALACE GATES',
        sub: 'LONDON, 1547',
        icon(api, x, y) { const g = api.gfx; g.rect(x-5, y-8, 3, 16, '#888'); g.rect(x+2, y-8, 3, 16, '#888'); g.rect(x-7, y-8, 14, 3, '#c8a820'); },
        intro: ['TOM CANTY SPOTS THE YOUNG', 'PRINCE THROUGH THE IRON', 'GATES OF TUDOR PALACE.', 'SLIP PAST THE HALBERDIERS', 'TO REACH EDWARD!'],
        quote: 'When I am king they shall not have bread and shelter only, but also teachings out of books.',
        help: 'WAIT for the guard to turn, then TAP to dash forward',
        winText: 'Tom slips through the last gate. The Prince smiles — two boys who might be twins.',
        loseText: 'The halberdier grabs Tom\'s collar and flings him back into the mud.',
        init(api) {
          this.pos = 0;        /* how far Tom has walked (0–4 gates) */
          this.guardAngle = 0; /* guard facing oscillation */
          this.dashTimer = 0;  /* time left in dash animation */
          this.dashing = false;
          this.caught = 0;
          this.lives = 3;
          this.flash = 0;
          this.guardSpd = 0.9; /* rads/sec */
          /* Each gate: x position of the guard post */
          this.gates = [80, 140, 195, 248];
          this.tomX = 20;
        },
        update(api, dt) {
          this.flash = Math.max(0, this.flash - dt);
          this.guardAngle += this.guardSpd * dt;
          /* Guard speed ramps up as more gates cleared */
          this.guardSpd = 0.9 + this.pos * 0.18;

          if (this.dashing) {
            this.tomX += 90 * dt;
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) {
              this.dashing = false;
              /* Check: is guard facing Tom? Guard faces "right" when sin > 0 */
              const facing = Math.sin(this.guardAngle) > 0;
              const gateX = this.gates[this.pos];
              if (facing && this.tomX > gateX - 30 && this.tomX < gateX + 30) {
                /* Caught */
                this.lives--;
                api.shake(6, 0.3);
                api.flash(C.crimson, 0.2);
                api.audio.sfx('hurt');
                this.tomX = this.pos === 0 ? 20 : this.gates[this.pos - 1] + 20;
                this.flash = 0.5;
                if (this.lives <= 0) { api.lose(); return; }
              } else {
                this.pos++;
                api.addScore(30);
                api.audio.sfx('coin');
                api.burst(this.tomX, api.H * 0.62, C.gold, 5);
                if (this.pos >= this.gates.length) { api.addScore(80); api.win(); }
              }
            }
          } else if (api.confirm()) {
            /* Tap = dash to next gate */
            if (!this.dashing && this.pos < this.gates.length) {
              this.dashing = true;
              this.dashTimer = (this.gates[this.pos] - this.tomX) / 90;
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          /* Cobblestone road */
          g.rect(0, H * 0.6, W, H * 0.4, '#504040');
          for (let x2 = 0; x2 < W; x2 += 18) g.rect(x2, H * 0.6, 1, H * 0.4, '#3c3030');
          for (let y2 = Math.floor(H*0.6); y2 < H; y2 += 14) g.rect(0, y2, W, 1, '#3c3030');

          /* Palace wall */
          g.rect(0, H * 0.3, W, H * 0.32, '#9a7a5a');
          g.rect(0, H * 0.28, W, 8, '#c4a470');
          for (let bx2 = 0; bx2 < W; bx2 += 20) g.rect(bx2, H * 0.22, 12, 18, '#9a7a5a');

          /* Gates (iron bars) */
          for (let gi = 0; gi < this.gates.length; gi++) {
            const gx = this.gates[gi], cleared = gi < this.pos;
            const col = cleared ? '#5a4a2a' : '#707070';
            for (let bx3 = gx - 12; bx3 <= gx + 12; bx3 += 6) g.rect(bx3, H * 0.28, 3, H * 0.34, col);
            g.rect(gx - 14, H * 0.28, 28, 4, col);
            if (cleared) g.rect(gx - 4, H * 0.5, 8, 4, C.goldL);
          }

          /* Guards at uncleared gates */
          for (let gi = this.pos; gi < this.gates.length; gi++) {
            const gx = this.gates[gi];
            const facing = Math.sin(this.guardAngle + gi * 1.3) > 0;
            /* Body */
            g.rect(gx - 6, H * 0.52, 12, 18, '#cc3020');  /* red livery */
            g.rect(gx - 4, H * 0.48, 8, 6, '#e8b870');    /* face */
            g.rect(gx - 5, H * 0.44, 10, 5, '#808080');   /* helm */
            /* Halberd (direction indicator) */
            const hx = facing ? gx + 14 : gx - 14;
            g.rect(Math.min(gx,hx)-1, H*0.36, 2, 26, '#7a6030');
            g.rect(hx - 3, H * 0.34, 6, 6, '#c0c0c0');
            /* Safe/danger indicator dot */
            const safe = !facing;
            g.circle(gx, H * 0.36, 4, safe ? '#00e060' : '#ff2020');
          }

          /* Tom sprite */
          const ty = H * 0.55;
          const col = this.flash > 0 ? '#ff8080' : '#d4a820';
          g.rect(this.tomX - 4, ty, 8, 14, '#4a90d0');   /* body */
          g.rect(this.tomX - 3, ty - 8, 6, 8, '#e8b870'); /* face */
          g.rect(this.tomX - 4, ty - 11, 8, 4, C.straw); /* cap */

          /* Lives */
          api.topBar('GATES CLEARED: ' + this.pos + '/4', 'LIVES: ' + '♥'.repeat(this.lives));
        },
      },

      /* ================================================================
       * CHAPTER 2 — LIFE AT COURT
       * Tom must copy court gestures shown in sequence.
       * Herald shows N symbols, Tom must tap them in order.
       * 5 rounds, each adds 1 step. Lose on 3 wrong taps.
       * Pacing: ~3s show + 3-5s tap × 5 rounds ≈ 30-40s
       * ================================================================ */
      {
        id: 'court',
        name: 'LIFE AT COURT',
        sub: 'THE ROYAL BANQUET',
        icon(api, x, y) { const g = api.gfx; g.circle(x, y-3, 5, C.gold); g.rect(x-5, y+2, 10, 5, '#8b1515'); },
        intro: ['TOM SITS AT THE ROYAL', 'TABLE. THE HERALD CALLS', 'OUT COURTLY GESTURES.', 'COPY THEM IN ORDER', 'OR BE UNMASKED!'],
        quote: 'In the presence of kings, silence is safer than speech.',
        help: 'Watch the herald, then TAP the gestures in order',
        winText: 'Tom masters every form. The court bows — and never suspects.',
        loseText: 'A wrong move! Whispers ripple through the banquet hall.',
        init(api) {
          this.GESTURES = ['BOW', 'TOAST', 'WAVE', 'EAT'];
          this.COLORS = [C.crimsonL, C.gold, '#4a90d0', '#50c840'];
          this.round = 0;
          this.maxRound = 5;
          this.seq = [];
          this.phase = 'show'; /* 'show' | 'input' */
          this.showIdx = 0;
          this.showTimer = 0;
          this.showDelay = 0.7;
          this.inputIdx = 0;
          this.lives = 3;
          this.correct = 0;
          this.flash = '';
          this.flashTimer = 0;
          this._nextRound();
        },
        _nextRound() {
          this.round++;
          const rnd = Math.floor(Math.random() * 4);
          this.seq.push(rnd);
          this.phase = 'show';
          this.showIdx = 0;
          this.showTimer = this.showDelay;
          this.inputIdx = 0;
          this.flash = '';
        },
        update(api, dt) {
          this.flashTimer = Math.max(0, this.flashTimer - dt);
          if (this.phase === 'show') {
            this.showTimer -= dt;
            if (this.showTimer <= 0) {
              this.showIdx++;
              this.showTimer = this.showDelay;
              if (this.showIdx >= this.seq.length) {
                this.phase = 'input';
              }
            }
          } else {
            /* Input phase: tap buttons at bottom */
            const W = api.W, H = api.H;
            const btnW = 58, btnH = 36, gap = 8;
            const total = 4, tw = total * btnW + (total-1)*gap;
            const startX = (W - tw) / 2;
            const btnY = H - 54;
            if (api.pointer.justDown) {
              const px = api.pointer.x, py = api.pointer.y;
              for (let bi = 0; bi < 4; bi++) {
                const bx = startX + bi * (btnW + gap);
                if (px >= bx && px <= bx + btnW && py >= btnY && py <= btnY + btnH) {
                  if (bi === this.seq[this.inputIdx]) {
                    this.flash = 'good';
                    this.flashTimer = 0.3;
                    api.audio.sfx('coin');
                    api.burst(bx + btnW/2, btnY + btnH/2, this.COLORS[bi], 4);
                    this.inputIdx++;
                    this.correct++;
                    api.addScore(15);
                    if (this.inputIdx >= this.seq.length) {
                      if (this.round >= this.maxRound) { api.addScore(100); api.win(); }
                      else this._nextRound();
                    }
                  } else {
                    this.flash = 'bad';
                    this.flashTimer = 0.4;
                    api.audio.sfx('hurt');
                    api.shake(4, 0.25);
                    this.lives--;
                    if (this.lives <= 0) { api.lose(); }
                    else {
                      /* Restart this round's input */
                      this.phase = 'show';
                      this.showIdx = 0;
                      this.showTimer = this.showDelay;
                      this.inputIdx = 0;
                    }
                  }
                  break;
                }
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          /* Banquet hall */
          c.fillStyle = '#2a0a18'; c.fillRect(0, 0, W, H);
          for (let x2 = 0; x2 < W; x2 += 24) { c.fillStyle = '#3a0e20'; c.fillRect(x2, 0, 2, H * 0.7); }
          g.rect(0, H * 0.72, W, H * 0.28, '#3a2818');
          /* Table */
          g.rect(20, H * 0.55, W - 40, 14, '#6a3010'); g.rect(20, H * 0.55 + 14, W - 40, 4, '#5a2808');
          /* Candles */
          for (let cx2 = 40; cx2 < W - 30; cx2 += 45) {
            g.rect(cx2, H*0.46, 4, 10, C.parchD);
            c.globalAlpha = 0.3 + 0.15*Math.sin(api.t*4+cx2); g.circle(cx2+2, H*0.45, 6, '#ffd060'); c.globalAlpha=1;
            g.circle(cx2+2, H*0.45, 2, '#ffffa0');
          }

          /* Herald showing sequence */
          const heraldX = W / 2, heraldY = H * 0.3;
          if (this.phase === 'show') {
            const cur = this.seq[this.showIdx < this.seq.length ? this.showIdx : this.seq.length - 1];
            /* Herald figure */
            g.rect(heraldX - 8, heraldY, 16, 22, C.crimson);
            g.rect(heraldX - 5, heraldY - 10, 10, 10, C.flesh);
            g.rect(heraldX - 6, heraldY - 14, 12, 5, C.gold);
            /* Gesture label */
            const pulsing = this.showIdx < this.seq.length;
            const col2 = this.COLORS[cur];
            c.globalAlpha = pulsing ? (0.7 + 0.3 * Math.sin(api.t * 8)) : 0.4;
            api.txtCFit(this.GESTURES[cur], W/2, heraldY + 36, 12, col2, true);
            c.globalAlpha = 1;
            /* Progress dots */
            const dotStartX = W/2 - (this.seq.length * 10)/2;
            for (let di = 0; di < this.seq.length; di++) {
              g.circle(dotStartX + di * 10, heraldY + 56, 3, di < this.showIdx ? C.goldL : '#404040');
            }
          } else {
            /* Input phase: show full sequence as dots */
            api.txtCFit('YOUR TURN', W/2, heraldY - 6, 10, C.parchD, true);
            const dotStartX = W/2 - (this.seq.length * 14)/2;
            for (let di = 0; di < this.seq.length; di++) {
              const done = di < this.inputIdx;
              g.circle(dotStartX + di * 14, heraldY + 16, 5, done ? C.goldL : this.COLORS[this.seq[di]]);
              if (done) api.txtC('✓', dotStartX + di*14, heraldY + 22, 7, C.goldL);
            }
            /* Flash feedback */
            if (this.flashTimer > 0) {
              c.fillStyle = this.flash === 'good' ? 'rgba(0,200,80,.2)' : 'rgba(200,0,0,.2)';
              c.fillRect(0, 0, W, H);
            }
          }

          /* Input buttons */
          const btnW = 58, btnH = 36, gap = 8;
          const total = 4, tw = total * btnW + (total - 1) * gap;
          const startX = (W - tw) / 2, btnY = H - 54;
          for (let bi = 0; bi < 4; bi++) {
            const bx = startX + bi * (btnW + gap);
            const active = this.phase === 'input';
            g.rect(bx, btnY, btnW, btnH, active ? this.COLORS[bi] : '#303030');
            g.rectO(bx, btnY, btnW, btnH, active ? '#ffffff' : '#505050', 1);
            api.txtCFit(this.GESTURES[bi], bx + btnW/2, btnY + btnH/2 + 4, 6, active ? '#ffffff' : '#606060', true);
          }
          api.topBar('ROUND ' + this.round + '/' + this.maxRound, 'LIVES: ' + '♥'.repeat(Math.max(0,this.lives)));
        },
      },

      /* ================================================================
       * CHAPTER 3 — LONDON STREETS
       * Edward (as pauper) dodges left/right past angry citizens.
       * Survive 22 seconds. 3 lives.
       * Obstacles: thrown cabbages, dogs, market carts.
       * Pacing: spawns slow first 5s, ramp up. 22s total.
       * ================================================================ */
      {
        id: 'streets',
        name: 'LONDON STREETS',
        sub: 'EAST END, 1547',
        icon(api, x, y) { const g = api.gfx; g.rect(x-6, y-4, 12, 8, '#6a9040'); g.circle(x, y-6, 4, '#4a7020'); },
        intro: ['EDWARD TUDOR IS THROWN', 'INTO THE STREETS.', 'NO ONE BELIEVES HE\'S', 'THE PRINCE! DODGE THE', 'FURIOUS CROWD.'],
        quote: 'If you would know the value of money, go and try to borrow some.',
        help: 'LEFT / RIGHT arrow keys or TAP left / right half of screen',
        winText: 'Edward survives the London mob — battered but unbowed, still a prince at heart.',
        loseText: 'The crowd closes in. Edward falls to the muddy cobblestones.',
        init(api) {
          this.x = api.W / 2;
          this.y = api.H * 0.7;
          this.spd = 110;
          this.obstacles = [];
          this.spawnTimer = 0;
          this.spawnRate = 1.4;
          this.lives = 3;
          this.timeLeft = 22;
          this.hit = 0;
          this.hitTimer = 0;
        },
        update(api, dt) {
          this.timeLeft -= dt;
          this.hitTimer = Math.max(0, this.hitTimer - dt);
          if (this.timeLeft <= 0) { api.addScore(120); api.win(); return; }

          /* Move Edward */
          const W = api.W;
          if (api.keyDown('left') || (api.pointer.down && api.pointer.x < W/2)) this.x -= this.spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W/2)) this.x += this.spd * dt;
          this.x = clamp(this.x, 14, W - 14);

          /* Spawn obstacles */
          this.spawnTimer -= dt;
          if (this.spawnTimer <= 0) {
            const elapsed = 22 - this.timeLeft;
            this.spawnRate = Math.max(0.5, 1.4 - elapsed * 0.04);
            this.spawnTimer = this.spawnRate * (0.7 + Math.random() * 0.6);
            const type = Math.random() < 0.5 ? 'cabbage' : (Math.random() < 0.6 ? 'dog' : 'cart');
            this.obstacles.push({
              x: 20 + Math.random() * (W - 40),
              y: -16,
              spd: 80 + Math.random() * 60 + elapsed * 2.5,
              type,
              w: type === 'cart' ? 28 : 16,
              h: type === 'cart' ? 20 : 14,
            });
          }

          /* Move & collide obstacles */
          for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.y += o.spd * dt;
            if (o.y > api.H + 30) { this.obstacles.splice(i, 1); continue; }
            /* Collision */
            if (this.hitTimer <= 0 &&
                Math.abs(o.x - this.x) < (o.w/2 + 10) &&
                Math.abs(o.y - this.y) < (o.h/2 + 10)) {
              this.lives--;
              this.hitTimer = 0.8;
              api.shake(5, 0.3);
              api.flash(C.crimson, 0.2);
              api.audio.sfx('hurt');
              this.obstacles.splice(i, 1);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }

          /* Score for surviving */
          if (Math.floor((22 - this.timeLeft) * 2) > this.hit) { this.hit++; api.addScore(5); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          /* Street */
          g.rect(0, 0, W, H * 0.15, '#7098c8');
          g.rect(0, H * 0.15, W, H * 0.85, '#504040');
          for (let x2 = 0; x2 < W; x2 += 18) g.rect(x2, H * 0.15, 1, H * 0.85, '#3c3030');
          for (let y2 = Math.floor(H*0.15); y2 < H; y2 += 14) g.rect(0, y2, W, 1, '#3c3030');
          /* Timber buildings */
          const builds = [[0,120],[180,100],[60,90],[200,140]];
          for (const [bx, bh] of builds) {
            g.rect(bx, H*0.15, 55, bh, '#4a3018');
            for (let wy = H*0.15+6; wy < H*0.15+bh-10; wy += 20) {
              g.rect(bx+6, wy, 10, 12, '#5090c0'); g.rect(bx+26, wy, 10, 12, '#5090c0');
            }
            g.rect(bx, H*0.15-8, 55, 8, '#5a4020');
          }

          /* Obstacles */
          for (const o of this.obstacles) {
            if (o.type === 'cabbage') {
              g.circle(o.x, o.y, 8, '#4a8028'); g.circle(o.x-2, o.y-2, 4, '#6ab040');
            } else if (o.type === 'dog') {
              g.rect(o.x-8, o.y-4, 16, 8, '#a08040'); g.rect(o.x-10, o.y-6, 6, 6, '#a08040'); g.rect(o.x+6, o.y-8, 4, 5, '#a08040');
            } else {
              g.rect(o.x-14, o.y-10, 28, 20, '#8a5020'); g.rect(o.x-16, o.y+6, 6, 6, '#404040'); g.rect(o.x+10, o.y+6, 6, 6, '#404040');
            }
          }

          /* Edward (pauper rags) */
          const inv = this.hitTimer > 0 && Math.floor(this.hitTimer * 8) % 2 === 0;
          if (!inv) {
            g.rect(this.x-5, this.y-12, 10, 18, '#808060'); /* rags */
            g.rect(this.x-4, this.y-20, 8, 9, C.flesh);     /* face */
            g.rect(this.x-5, this.y-23, 10, 4, C.straw);    /* hair */
          }

          /* Timer bar */
          const pct = this.timeLeft / 22;
          g.rect(10, H - 18, W - 20, 8, '#303030');
          g.rect(10, H - 18, Math.floor((W-20)*pct), 8, pct > 0.4 ? C.gold : C.crimsonL);
          api.topBar('DODGE!  ' + Math.ceil(this.timeLeft) + 's', 'LIVES: ' + '♥'.repeat(Math.max(0,this.lives)));
        },
      },

      /* ================================================================
       * CHAPTER 4 — MILES HENDON'S SWORD
       * Parry timing: enemies approach from left/right.
       * Tap LEFT/RIGHT to parry. Beat 10 enemies.
       * Pacing: ~2s per enemy × 10 = ~20s of play.
       * ================================================================ */
      {
        id: 'hendon',
        name: "MILES HENDON'S SWORD",
        sub: 'OFFAL COURT, LONDON',
        icon(api, x, y) { const g = api.gfx; g.rect(x-1, y-9, 2, 18, '#c0c0c0'); g.rect(x-5, y-2, 10, 2, '#c09030'); },
        intro: ['MILES HENDON, A DISGRACED', 'KNIGHT, STEPS FORWARD TO', 'PROTECT THE SMALL BOY', 'WHO CLAIMS TO BE KING.', 'PARRY LEFT AND RIGHT!'],
        quote: 'A knight may not know his king, but he may always know a gentleman.',
        help: 'TAP LEFT or RIGHT to parry the incoming sword',
        winText: 'Hendon\'s blade holds. The ruffians scatter — none dares face a proper swordsman.',
        loseText: 'A blade slips through. Hendon grits his teeth and falls back.',
        init(api) {
          this.lives = 3;
          this.beaten = 0;
          this.need = 10;
          this.enemy = null;
          this.spawnTimer = 0.4;
          this.result = '';
          this.resultTimer = 0;
          this.hitTimer = 0;
        },
        _spawnEnemy() {
          const side = Math.random() < 0.5 ? 'left' : 'right';
          const speed = 60 + this.beaten * 6;
          return {
            side,
            x: side === 'left' ? -20 : 290,
            y: 220 + Math.random() * 30,
            spd: speed,
            parried: false,
            gone: false,
          };
        },
        update(api, dt) {
          this.hitTimer = Math.max(0, this.hitTimer - dt);
          this.resultTimer = Math.max(0, this.resultTimer - dt);
          if (!this.enemy) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) { this.enemy = this._spawnEnemy(); this.spawnTimer = 0; }
          } else {
            const e = this.enemy;
            if (!e.parried) {
              e.x += (e.side === 'left' ? 1 : -1) * e.spd * dt;
              /* Danger zone: enemy reaches middle */
              const danger = e.side === 'left' ? e.x > 90 : e.x < 180;
              if (danger) {
                /* Check parry */
                const parryLeft = api.keyPressed('left') || (api.pointer.justDown && api.pointer.x < api.W/2);
                const parryRight = api.keyPressed('right') || (api.pointer.justDown && api.pointer.x > api.W/2);
                const correct = (e.side === 'left' && parryLeft) || (e.side === 'right' && parryRight);
                const wrong = (e.side === 'left' && parryRight) || (e.side === 'right' && parryLeft);
                if (correct) {
                  e.parried = true;
                  this.beaten++;
                  api.addScore(25);
                  api.audio.sfx('shoot');
                  api.burst(api.W/2, 220, C.goldL, 8);
                  this.result = 'PARRIED!';
                  this.resultTimer = 0.5;
                  this.spawnTimer = 0.6;
                  if (this.beaten >= this.need) { api.addScore(100); api.win(); }
                } else if (wrong || (e.side === 'left' ? e.x > 160 : e.x < 110)) {
                  /* Hit or wrong parry */
                  e.gone = true;
                  this.lives--;
                  this.hitTimer = 0.5;
                  api.shake(6, 0.3);
                  api.flash(C.crimson, 0.2);
                  api.audio.sfx('hurt');
                  this.result = 'HIT!';
                  this.resultTimer = 0.5;
                  this.spawnTimer = 0.8;
                  if (this.lives <= 0) { api.lose(); return; }
                }
              }
            } else {
              /* Recoil off screen */
              e.x += (e.side === 'left' ? -1 : 1) * 160 * dt;
            }
            if (e.x < -40 || e.x > 310) this.enemy = null;
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          /* Alley backdrop */
          c.fillStyle = '#1e1408'; c.fillRect(0, 0, W, H);
          g.rect(0, H*0.75, W, H*0.25, '#3a2810');
          for (let x2 = 0; x2 < W; x2 += 18) g.rect(x2, H*0.75, 1, H*0.25, '#2e2008');
          /* Wall lantern */
          g.rect(W/2-4, 20, 8, 14, C.gold); g.rect(W/2-5, 33, 10, 4, C.gold);
          c.globalAlpha = 0.2 + 0.08*Math.sin(api.t*3); g.circle(W/2, 24, 18, '#ffc040'); c.globalAlpha=1;
          g.circle(W/2, 24, 4, '#ffee80');

          /* Hendon (center) */
          const inv = this.hitTimer > 0 && Math.floor(this.hitTimer*8)%2===0;
          if (!inv) {
            g.rect(W/2-8, H*0.55, 16, 24, '#3060a0'); /* coat */
            g.rect(W/2-6, H*0.47, 12, 10, C.flesh);   /* face */
            g.rect(W/2-7, H*0.44, 14, 4, '#404040');  /* hat */
            /* Sword held center */
            g.rect(W/2-1, H*0.44, 2, 34, '#c0c0c0');
            g.rect(W/2-8, H*0.54, 16, 2, '#c09030');
          }
          /* Left/Right prompt zones */
          c.fillStyle = 'rgba(212,168,32,.1)'; c.fillRect(0, H*0.45, W/2-10, H*0.35);
          c.fillStyle = 'rgba(212,168,32,.1)'; c.fillRect(W/2+10, H*0.45, W/2-10, H*0.35);
          api.txtC('◀ PARRY', 44, H*0.82, 7, '#d4a820');
          api.txtC('PARRY ▶', W-44, H*0.82, 7, '#d4a820');

          /* Enemy */
          if (this.enemy) {
            const e = this.enemy;
            const col2 = e.parried ? '#606060' : C.crimsonL;
            g.rect(e.x-8, e.y, 16, 22, col2);
            g.rect(e.x-5, e.y-10, 10, 10, C.flesh);
            /* Enemy sword (pointing toward center) */
            const tip = e.side === 'left' ? e.x + 22 : e.x - 22;
            const sx = Math.min(e.x, tip), sw = Math.abs(tip - e.x);
            g.rect(sx, e.y+4, sw, 2, '#d0d0d0');
          }

          /* Result flash */
          if (this.resultTimer > 0) {
            api.txtCFit(this.result, W/2, H*0.35, 16, this.result==='PARRIED!' ? C.goldL : C.crimsonL, true);
          }
          /* Progress pips */
          const pipStart = (W - this.need * 14) / 2;
          for (let pi = 0; pi < this.need; pi++) {
            g.circle(pipStart + pi*14 + 7, H - 16, 4, pi < this.beaten ? C.goldL : '#303030');
          }
          api.topBar('BEATEN: ' + this.beaten + '/' + this.need, 'LIVES: ' + '♥'.repeat(Math.max(0,this.lives)));
        },
      },

      /* ================================================================
       * CHAPTER 5 — THE CORONATION RACE
       * Edward and Miles race to Westminster Abbey.
       * Collect royal banners (score), dodge oncoming carriages.
       * Fill a distance meter to reach the Abbey in ~20s.
       * 3 lives.
       * ================================================================ */
      {
        id: 'coronation',
        name: 'THE CORONATION',
        sub: 'WESTMINSTER ABBEY',
        icon(api, x, y) { const g = api.gfx; g.rect(x-4, y-8, 8, 12, C.crimson); g.rect(x-6, y-10, 12, 3, C.gold); g.rect(x-2, y-13, 4, 4, C.gold); },
        intro: ['THE WRONG BOY IS ABOUT', 'TO BE CROWNED KING!', 'EDWARD MUST REACH', 'WESTMINSTER ABBEY', 'BEFORE THE TRUMPETS SOUND!'],
        quote: 'There is no character, howsoever good and fine, but it can be destroyed by ridicule.',
        help: 'LEFT / RIGHT to dodge carriages, collect the GOLD banners',
        winText: 'Edward bursts through the abbey doors — "I AM THE KING!" — and the crowd falls silent.',
        loseText: 'The carriage blocks the road. The trumpets sound. A moment too late!',
        init(api) {
          this.x = api.W / 2;
          this.y = api.H * 0.72;
          this.spd = 120;
          this.dist = 0;
          this.distNeed = 1000;
          this.obstacles = [];
          this.banners = [];
          this.spawnTimer = 0.5;
          this.bannerTimer = 0.8;
          this.lives = 3;
          this.hitTimer = 0;
          this.scroll = 0;
        },
        update(api, dt) {
          this.hitTimer = Math.max(0, this.hitTimer - dt);
          const W = api.W;
          /* Move Edward */
          if (api.keyDown('left') || (api.pointer.down && api.pointer.x < W/2)) this.x -= this.spd * dt;
          if (api.keyDown('right') || (api.pointer.down && api.pointer.x > W/2)) this.x += this.spd * dt;
          this.x = clamp(this.x, 14, W - 14);

          /* Advance distance */
          const elapsed = this.dist / this.distNeed;
          const roadSpd = 60 + elapsed * 80;
          this.dist += roadSpd * dt * 4;
          this.scroll += roadSpd * dt;

          if (this.dist >= this.distNeed) { api.addScore(150); api.win(); return; }

          /* Spawn carriages */
          this.spawnTimer -= dt;
          if (this.spawnTimer <= 0) {
            this.spawnTimer = Math.max(0.6, 1.2 - elapsed * 0.6) * (0.7 + Math.random() * 0.6);
            this.obstacles.push({ x: 20 + Math.random() * (W - 40), y: -20, spd: 90 + elapsed * 50, w: 26, h: 22 });
          }
          /* Spawn banners */
          this.bannerTimer -= dt;
          if (this.bannerTimer <= 0) {
            this.bannerTimer = 0.8 + Math.random() * 0.6;
            this.banners.push({ x: 20 + Math.random() * (W - 40), y: -10 });
          }

          /* Move obstacles */
          for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.y += o.spd * dt;
            if (o.y > api.H + 30) { this.obstacles.splice(i, 1); continue; }
            if (this.hitTimer <= 0 &&
                Math.abs(o.x - this.x) < 18 && Math.abs(o.y - this.y) < 16) {
              this.lives--;
              this.hitTimer = 0.8;
              api.shake(5, 0.3); api.flash(C.crimson, 0.2); api.audio.sfx('hurt');
              this.obstacles.splice(i, 1);
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          /* Move banners */
          for (let i = this.banners.length - 1; i >= 0; i--) {
            const b = this.banners[i];
            b.y += (70 + elapsed * 40) * dt;
            if (b.y > api.H + 10) { this.banners.splice(i, 1); continue; }
            if (Math.abs(b.x - this.x) < 14 && Math.abs(b.y - this.y) < 14) {
              api.addScore(10); api.audio.sfx('coin');
              api.burst(b.x, b.y, C.goldL, 4);
              this.banners.splice(i, 1);
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          /* Road */
          g.rect(0, 0, W, H * 0.12, '#7098c8');
          g.rect(0, H * 0.12, W, H * 0.88, '#504040');
          /* Road stripes */
          const stripeStep = 60;
          for (let sy = (this.scroll % stripeStep); sy < H; sy += stripeStep) {
            g.rect(W/2 - 1, sy, 2, 28, C.parchD);
          }
          /* Cobble details */
          for (let x2 = 0; x2 < W; x2 += 18) g.rect(x2, H*0.12, 1, H*0.88, '#3c3030');
          /* Westminster spire ahead */
          c.fillStyle = '#3a2a50';
          const sy2 = H * 0.12 - 80 + 60 * (1 - this.dist / this.distNeed);
          g.rect(W/2 - 22, sy2, 44, 90); g.rect(W/2 - 14, sy2 - 30, 28, 32); g.rect(W/2 - 6, sy2 - 52, 12, 24); g.rect(W/2 - 2, sy2 - 68, 4, 18);
          /* Gold cross */
          g.rect(W/2 - 1, sy2 - 74, 2, 8, C.gold); g.rect(W/2 - 4, sy2 - 70, 8, 2, C.gold);

          /* Crowds along road edge */
          for (let ci = 0; ci < 7; ci++) {
            const cx3 = 8 + ci * 37, cy3 = H * 0.55 + Math.sin(api.t * 2 + ci) * 3;
            g.rect(cx3, cy3, 8, 14, ['#cc3020','#4a8a20','#3060a0'][ci%3]);
            g.circle(cx3+4, cy3-5, 4, C.flesh);
          }
          for (let ci = 0; ci < 7; ci++) {
            const cx3 = 8 + ci * 37, cy3 = H * 0.55 + Math.sin(api.t * 2 + ci) * 3;
            g.rect(W - cx3 - 8, cy3, 8, 14, ['#804018','#cc8a20','#506090'][ci%3]);
            g.circle(W - cx3 - 4, cy3-5, 4, C.flesh);
          }

          /* Carriages */
          for (const o of this.obstacles) {
            g.rect(o.x-13, o.y-11, 26, 22, '#6a3810');
            g.rect(o.x-10, o.y-8, 20, 14, '#c09030');
            g.circle(o.x-8, o.y+12, 5, '#404040'); g.circle(o.x+8, o.y+12, 5, '#404040');
          }
          /* Banners */
          for (const b of this.banners) {
            g.rect(b.x-3, b.y-12, 2, 18, '#8b5020');
            g.rect(b.x-1, b.y-12, 10, 8, C.crimsonL);
            g.rect(b.x+1, b.y-10, 6, 4, C.goldL);
          }

          /* Edward */
          const inv = this.hitTimer > 0 && Math.floor(this.hitTimer*8)%2===0;
          if (!inv) {
            g.rect(this.x-5, this.y-14, 10, 18, '#3060a0');
            g.rect(this.x-4, this.y-22, 8, 9, C.flesh);
            g.rect(this.x-5, this.y-26, 10, 5, C.gold); /* crown */
          }

          /* Distance bar */
          const pct = this.dist / this.distNeed;
          g.rect(10, H - 18, W - 20, 8, '#303030');
          g.rect(10, H - 18, Math.floor((W-20)*pct), 8, C.crimsonL);
          g.circle(10 + (W-20)*pct, H - 14, 5, C.goldL);
          api.topBar('TO THE ABBEY!', 'LIVES: ' + '♥'.repeat(Math.max(0,this.lives)));
        },
      },
    ],
  });
}());
