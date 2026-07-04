/* ============================================================================
 * HUCKLEBERRY FINN — DOWN THE MISSISSIPPI
 * Oregon-Trail-style river journey: GRUB & TRUST economy shape every stop.
 * Five distinct mechanics: fishing reaction, text-choice bluffing, fog
 * navigation, evidence sorting, and a rope-throw rescue.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ── Journey resources (shared across all chapters via closure) ─────────── */
  const J = { grub: 6, trust: 5 };   // grub: food/supplies; trust: Jim's faith

  /* ── Palette ────────────────────────────────────────────────────────────── */
  const C = {
    river: '#3a6888', riverL: '#5898b8', riverD: '#1a3848',
    mud:   '#7a5a28', land:   '#4a7a28', landD:  '#2a5018',
    log:   '#8a5c28', logD:   '#5a3810',
    gold:  '#f0c020', goldL:  '#ffd84a',
    raft:  '#9a6a30', raftD:  '#6a4818',
    huck:  '#d09050', huckH:  '#7a4018',
    jim:   '#5a3818', jimH:   '#3a2010',
    cream: '#f4e8cc', amber:  '#e09030',
    dark:  '#0c1008', grn:    '#60e840',
    grubC: '#50a820', trustC: '#4888d0', warn: '#e04020',
  };

  /* ── Meter bar helper ───────────────────────────────────────────────────── */
  function meterBar(api, x, y, val, max, col, label) {
    const c = api.ctx;
    for (let i = 0; i < max; i++) {
      c.fillStyle = i < val ? col : '#181410';
      c.fillRect(x + i * 9, y, 7, 7);
    }
    api.txtCFit(label, x + max * 9 + 6, y, 5, col, true, 36);
  }

  /* ── Emblem ─────────────────────────────────────────────────────────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    c.strokeStyle = C.riverL; c.lineWidth = 1.5; c.globalAlpha = 0.55;
    c.beginPath(); c.ellipse(cx, cy + 20, 30, 9, 0, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = 1;
    g.rect(cx - 22, cy + 6, 44, 8, C.raft);
    g.rect(cx - 20, cy + 4, 40, 5, C.raftD);
    c.strokeStyle = C.log; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 8, cy + 6); c.lineTo(cx - 20, cy - 18); c.stroke();
    g.rect(cx - 12, cy - 9,  7, 17, C.huck);
    g.rect(cx - 13, cy - 18, 9,  8, C.huckH);
    g.rect(cx + 5,  cy - 2,  7, 10, C.jim);
    g.rect(cx + 4,  cy - 9,  9,  7, C.jimH);
    c.globalAlpha = 0.5 + 0.5 * (Math.floor(api.t * 2) % 2);
    g.rect(cx - 1, cy - 28, 2, 2, '#fffce8');
    c.globalAlpha = 1;
  }

  /* ── Scenery ────────────────────────────────────────────────────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      c.fillStyle = C.land; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) {
        c.fillStyle = C.landD; c.globalAlpha = 0.07;
        c.fillRect((i * 43 + 9) % W, (i * 61 + 13) % H, 3, 2);
      }
      c.globalAlpha = 1;
      c.fillStyle = C.river;
      c.beginPath();
      c.moveTo(94, 0);
      c.bezierCurveTo(100, 50, 120, 90, 118, 115);
      c.bezierCurveTo(116, 140, 148, 162, 148, 198);
      c.bezierCurveTo(148, 234, 116, 252, 116, 280);
      c.bezierCurveTo(116, 308, 150, 330, 150, 360);
      c.bezierCurveTo(150, 390, 128, 420, 118, H);
      c.lineTo(136, H);
      c.bezierCurveTo(142, 420, 164, 390, 164, 360);
      c.bezierCurveTo(164, 330, 132, 308, 132, 280);
      c.bezierCurveTo(132, 252, 162, 234, 162, 198);
      c.bezierCurveTo(162, 162, 132, 140, 130, 115);
      c.bezierCurveTo(128, 90, 108, 50, 112, 0);
      c.closePath(); c.fill();
      // Shimmer (flat flicker)
      if (Math.floor(t * 3) % 2 === 0) {
        c.fillStyle = C.riverL;
        for (let i = 0; i < 6; i++) {
          c.fillRect(100 + (i * 19) % 42, 15 + (i * 58) % (H - 30), 4, 1);
        }
      }
      // Trees
      [[6,28],[196,44],[6,200],[195,218],[4,380],[196,362]].forEach(([tx,ty]) => {
        c.fillStyle = C.landD;
        c.beginPath(); c.arc(tx + 12, ty + 12, 13, 0, Math.PI * 2); c.fill();
      });
      // Animated raft
      const bx = 114 + Math.sin(t * 0.15) * 8;
      const by = 50 + (t * 9 % 400);
      g.rect(bx - 8, by - 3, 16, 6, C.raft);
      // Trail connectors
      c.strokeStyle = C.amber; c.lineWidth = 1.5; c.setLineDash([3, 4]);
      [[115, 91, 148, 198],[148, 224, 118, 280],[118, 306, 148, 360],[152, 384, 135, 418]].forEach(([x1,y1,x2,y2]) => {
        c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
      });
      c.setLineDash([]);
      c.strokeStyle = C.mud; c.lineWidth = 4; c.strokeRect(5, 5, W - 10, H - 10);
      c.strokeStyle = C.goldL; c.lineWidth = 1; c.strokeRect(8, 8, W - 16, H - 16);
      return;
    }

    if (scene === 'boot' || scene === 'intro' || scene === 'result' || scene === 'finale') {
      // Flat-banded sunset (NES-style no smooth gradient)
      const bands = ['#a84010','#c86020','#d87820','#e89828','#f0bf58'];
      bands.forEach((col, i) => {
        c.fillStyle = col; c.fillRect(0, i * H * 0.11, W, H * 0.11);
      });
      c.fillStyle = '#ffb800';
      c.beginPath(); c.arc(W * 0.5, H * 0.56, 18, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#5888a8'; c.fillRect(0, H * 0.54, W, H * 0.20);
      c.fillStyle = '#3a6888'; c.fillRect(0, H * 0.74, W, H * 0.14);
      c.fillStyle = '#2a5878'; c.fillRect(0, H * 0.88, W, H * 0.12);
      c.fillStyle = C.landD; c.fillRect(0, H * 0.50, W * 0.20, H * 0.10);
      c.fillStyle = C.land;  c.fillRect(0, H * 0.53, W * 0.17, H * 0.06);
      c.fillStyle = C.landD; c.fillRect(W * 0.82, H * 0.50, W * 0.18, H * 0.10);
      c.fillStyle = C.land;  c.fillRect(W * 0.83, H * 0.53, W * 0.17, H * 0.06);
      const rx = W * 0.5 + Math.sin(t * 0.4) * 8, ry = H * 0.68;
      g.rect(rx - 20, ry - 4, 40, 8, C.raft);
      g.rect(rx - 10, ry - 15, 6, 12, C.dark);
      g.rect(rx + 5,  ry - 10, 6, 10, C.dark);
      return;
    }

    // Gameplay default: flat river
    c.fillStyle = C.river; c.fillRect(0, 0, W, H);
    if (Math.floor(t * 2) % 2 === 0) {
      c.fillStyle = C.riverL;
      for (let i = 0; i < 5; i++) c.fillRect(0, (i * 90 + Math.floor(t * 60)) % H, W, 1);
    }
  }

  /* ── Menu: winding-river map with dock signs + resource meters ──────────── */
  const MAP_LAYOUT = [
    { x: 8,   y: 45,  w: 106, h: 44 },
    { x: 156, y: 152, w: 106, h: 44 },
    { x: 8,   y: 258, w: 106, h: 44 },
    { x: 156, y: 360, w: 106, h: 44 },
    { x: 50,  y: 416, w: 172, h: 44 },
  ];

  const menu = {
    colors: { title: C.goldL, label: C.amber, cur: C.gold },
    layout() { return MAP_LAYOUT; },
    title(api, miles) {
      const g = api.gfx, c = api.ctx, W = api.W;
      g.rect(6, 4, W - 12, 38, C.mud);
      g.rect(8, 6, W - 16, 34, '#4a2808');
      api.txtCFit('DOWN THE MISSISSIPPI', W / 2, 9, 8, C.goldL, true, W - 28);
      meterBar(api, 14, 22, J.grub,  10, C.grubC,  'GRUB');
      meterBar(api, 14, 31, J.trust, 10, C.trustC, 'TRUST');
    },
    card(api, { ch, i, x, y, w, h, sel, done, best }) {
      const g = api.gfx, c = api.ctx;
      const cx = x + w / 2, cy = y + h / 2;
      g.rect(cx - 2, y + h - 3, 4, 11, C.logD);
      c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(x + 3, y + 4, w - 1, h - 7);
      const bCol = sel ? '#c89040' : (done ? '#a07830' : '#8a5c28');
      g.rect(x, y, w, h - 5, bCol);
      c.strokeStyle = '#5a3010'; c.lineWidth = 1; c.globalAlpha = 0.16;
      for (let k = 0; k < 2; k++) {
        c.beginPath(); c.moveTo(x + 4, y + 11 + k * 14); c.lineTo(x + w - 4, y + 11 + k * 14); c.stroke();
      }
      c.globalAlpha = 1;
      c.strokeStyle = sel ? C.gold : (done ? C.amber : C.logD);
      c.lineWidth = sel ? 2.5 : 1.5;
      c.strokeRect(x + 2, y + 2, w - 4, h - 9);
      api.txtCFit(ch.name, cx, y + 6,  7, sel ? C.goldL : C.cream, true, w - 10);
      api.txtCFit(ch.sub,  cx, y + 19, 6, sel ? C.gold  : '#c8aa78', true, w - 10);
      if (done) { g.circle(x + w - 12, y + 5, 6, '#3a8018'); api.txtC('★', x + w - 12, y + 1, 8, C.goldL, true); }
      if (best > 0) api.txtC('' + best, cx, y + 31, 6, '#d8c880', true);
      if (sel && Math.floor(api.t * 4) % 2 === 0) {
        c.strokeStyle = C.goldL; c.lineWidth = 2; c.strokeRect(x - 1, y - 1, w + 2, h - 3);
      }
    },
  };

  const screens = {
    win: '#60d880', lose: '#6888a8', chapterLabel: C.amber,
    name: C.goldL, sub: C.gold, intro: C.cream, quote: '#d0c890',
    help: '#b8cca0', score: C.goldL, cur: C.gold, cta: C.riverL,
    overlay: 'rgba(6,10,8,.88)',
  };
  const labels = {
    chapter: 'STOP', score: 'MILES',
    win: 'The river carries you on', lose: 'The raft runs aground',
    cont: 'TAP TO PUSH ON', finale: 'TAP FOR THE FINALE',
    toMenu: 'BACK TO THE RIVER', play: 'TAP TO PUSH OFF',
  };

  /* ==========================================================================
   *  CHAPTERS
   * ========================================================================== */
  RetroSaga.create({
    id: 'huckfinn-raft', title: 'DOWN THE MISSISSIPPI',
    subtitle: 'Huckleberry Finn', currency: 'MILES',
    bootLine: 'MARK TWAIN · 1884', bootCta: 'TAP TO LIGHT OUT',
    menuLabel: 'THE MISSISSIPPI', menuHint: 'CHOOSE YOUR STOP',
    menuDone: 'FREEDOM FOUND!', accent: '#f0c020',
    credit: 'AN 8-BIT TRIBUTE · MARK TWAIN 1884',
    emblem, scenery, menu, screens, labels,
    finale: [
      'THE RAFT DRIFTS ON.',
      '',
      'Jim is free.',
      '',
      '"You can\'t pray a lie."',
      '— Huckleberry Finn',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ======================================================================
       * 1. JACKSON'S ISLAND — Fishing reaction game
       *    Watch the bobber. TAP when it dips fast. Catch 8 fish in 25s.
       *    Win → GRUB +2
       * ====================================================================== */
      {
        id: 'island', name: "JACKSON'S ISLAND", sub: "Gone fishin'",
        icon(api, x, y) {
          const c = api.ctx;
          c.strokeStyle = C.log; c.lineWidth = 2;
          c.beginPath(); c.moveTo(x - 5, y - 8); c.lineTo(x + 8, y + 2); c.stroke();
          c.strokeStyle = '#c0c8b0'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x + 8, y + 2); c.lineTo(x + 6, y + 9); c.stroke();
          api.gfx.circle(x + 6, y + 10, 3, '#e02020');
        },
        intro: [
          'FIRST NIGHT FREE.',
          'You and Jim hole up',
          'on Jackson\'s Island.',
          'Fish for SUPPLIES before',
          'the sheriff\'s boat passes!',
        ],
        quote: '"We\'d watch the lonesomeness of the river, and kind of lazy along."',
        help: 'TAP or press A when the BOBBER dips! Catch 8 fish in 25 seconds.',
        winText: 'Eight fish! Jim smiles for the first time in years. Grub secured.',
        loseText: 'Hungry night. The river can be stingy.',

        init(api) {
          this.caught  = 0;
          this.timer   = 25;
          this.state   = 'idle';   // idle|ripple|dip|gone
          this.stateT  = 0;
          this.nextDip = 1.8 + Math.random();
          this.tapWin  = 0;
          this.feedback = null; this.feedT = 0;
          this.stars   = Array.from({length: 22}, (_, i) => ({ x: (i * 29 + 8) % (api.W - 16) + 8, y: (i * 41) % (api.H * 0.36) }));
          this.BOB_X   = api.W * 0.62;
          this.BOB_Y   = api.H * 0.52;
        },

        update(api, dt) {
          this.timer -= dt;
          if (this.timer <= 0 && this.caught < 8) { api.lose(); return; }
          this.stateT  += dt;
          this.nextDip -= dt;

          // State machine
          if (this.state === 'idle' && this.nextDip <= 0) {
            this.state = 'ripple'; this.stateT = 0;
          }
          if (this.state === 'ripple' && this.stateT > 0.55) {
            this.state = 'dip'; this.stateT = 0;
            this.tapWin = 0.60;   // generous window
            api.audio.sfx('blip');
          }
          if (this.state === 'dip') {
            this.tapWin -= dt;
            if (this.tapWin <= 0) {
              this.state = 'idle'; this.stateT = 0;
              this.nextDip = 1.4 + Math.random() * 1.6;
              this.feedback = 'miss'; this.feedT = 0.5;
            }
          }
          if (this.state === 'gone' && this.stateT > 0.3) {
            this.state = 'idle'; this.stateT = 0;
            this.nextDip = 1.0 + Math.random() * 1.4;
          }

          if (this.feedT > 0) this.feedT -= dt;

          if (api.confirm()) {
            if (this.state === 'dip') {
              this.caught++;
              this.feedback = 'hit'; this.feedT = 0.55;
              this.state = 'gone'; this.stateT = 0;
              api.audio.sfx('coin');
              api.burst(this.BOB_X, this.BOB_Y + 10, C.riverL, 8);
              api.addScore(20);
              if (this.caught >= 8) { J.grub = Math.min(10, J.grub + 2); api.win(); }
            } else {
              this.feedback = 'miss'; this.feedT = 0.4;
              api.shake(2, 0.15);
            }
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Night sky
          c.fillStyle = '#08100c'; c.fillRect(0, 0, W, H);
          for (const s of this.stars) {
            if (Math.floor(api.t * 1.5 + s.x * 0.3) % 4 !== 0) g.rect(s.x, s.y, 2, 1, '#f0e8c0');
          }
          // Crescent moon (flat)
          g.circle(W * 0.80, H * 0.10, 13, '#f8f0c0');
          g.circle(W * 0.80 + 5, H * 0.10 - 2, 11, '#08100c');
          // River
          c.fillStyle = '#1a3040'; c.fillRect(0, H * 0.38, W, H * 0.26);
          c.fillStyle = '#102030'; c.fillRect(0, H * 0.64, W, H * 0.36);
          // Shore + island
          c.fillStyle = C.mud;   c.fillRect(0, H * 0.60, W, H * 0.10);
          c.fillStyle = C.land;  c.fillRect(0, H * 0.66, W, H * 0.34);
          // Tree silhouettes
          [30, 70, 145, 215].forEach(tx => {
            g.rect(tx - 3, H * 0.48, 6, H * 0.13, C.logD);
            c.fillStyle = '#1a2810';
            c.beginPath(); c.arc(tx, H * 0.48, 14, 0, Math.PI * 2); c.fill();
          });
          // Huck sitting on shore
          const HX = W * 0.30, HY = H * 0.60;
          g.rect(HX - 9, HY - 12, 15, 13, C.huck);
          g.rect(HX - 9, HY - 21, 13,  9, C.huckH);
          // Rod + line
          c.strokeStyle = C.log; c.lineWidth = 2;
          c.beginPath(); c.moveTo(HX + 5, HY - 10); c.lineTo(HX + 46, H * 0.44); c.stroke();
          c.strokeStyle = '#b0b898'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(HX + 46, H * 0.44); c.lineTo(this.BOB_X, this.BOB_Y); c.stroke();
          // Bobber
          if (this.state !== 'gone') {
            const dip = this.state === 'dip' ? 8 : (this.state === 'ripple' ? 3 : 0);
            g.circle(this.BOB_X, this.BOB_Y + dip, 5, '#e02020');
            g.circle(this.BOB_X, this.BOB_Y + dip, 3, '#f84040');
            if (this.state === 'dip' || this.state === 'ripple') {
              c.strokeStyle = C.riverL; c.lineWidth = 1; c.globalAlpha = 0.5;
              c.beginPath(); c.ellipse(this.BOB_X, this.BOB_Y + dip + 4, 9, 4, 0, 0, Math.PI * 2); c.stroke();
              c.globalAlpha = 1;
            }
            if (this.state === 'dip' && Math.floor(api.t * 5) % 2 === 0) {
              api.txtCFit('TAP!', this.BOB_X, this.BOB_Y - 20, 9, C.gold, true, 50);
            }
          }
          // Feedback
          if (this.feedT > 0) {
            const col = this.feedback === 'hit' ? C.grn : C.warn;
            api.txtCFit(this.feedback === 'hit' ? 'GOT ONE!' : 'TOO SLOW!', W / 2, H * 0.28, 8, col, true, W - 20);
          }
          // HUD
          api.topBar("JACKSON'S ISLAND · " + Math.ceil(this.timer) + 's');
          for (let i = 0; i < 8; i++) {
            c.fillStyle = i < this.caught ? C.gold : '#181408';
            c.fillRect(W - 8 - (7 - i) * 8, 2, 6, 8);
          }
          api.vignette();
        },
      },

      /* ======================================================================
       * 2. THE RAFTSMEN — Oregon-Trail text events
       *    4 moral choices. Each affects GRUB & TRUST. Always wins after all 4.
       * ====================================================================== */
      {
        id: 'raftsmen', name: 'THE RAFTSMEN', sub: 'Talk your way through',
        icon(api, x, y) {
          const c = api.ctx;
          c.strokeStyle = C.cream; c.lineWidth = 1.5;
          c.strokeRect(x - 9, y - 8, 18, 12);
          g: api.gfx.rect(x - 2, y + 4, 4, 4, C.cream);
          api.txtC('?', x, y - 4, 7, C.gold, true);
        },
        intro: [
          'A KEELBOAT LOOMS.',
          'Rough men everywhere.',
          'They\'ll ask hard questions.',
          'Every answer changes',
          'your GRUB and TRUST.',
        ],
        quote: '"All right, then, I\'ll go to hell."',
        help: 'TAP A or B for each situation. Your choices shape the journey. 4 decisions.',
        winText: "You talked your way through. The raftsmen never suspected a thing.",
        loseText: "The raftsmen grow suspicious. Better move on.",

        init(api) {
          // 4 Oregon-Trail events
          this.events = [
            {
              sit: ['"Where ya headed,', 'boy?"'],
              opts: [
                { lbl: 'A) "Just fishin\', sir."', fx: '+1 GRUB — safe',  dG:  1, dT:  0 },
                { lbl: 'B) "Upriver. Jim\'s ill."', fx: '+1 TRUST — risky', dG:  0, dT:  1 },
              ],
            },
            {
              sit: ['"That your man', 'on the raft?"'],
              opts: [
                { lbl: 'A) "My pa\'s hired hand."', fx: '+1 GRUB — cover',   dG:  1, dT: -1 },
                { lbl: 'B) "No slave here."',      fx: '+2 TRUST — bold',    dG: -1, dT:  2 },
              ],
            },
            {
              sit: ['A raftsman offers food', 'for a story.'],
              opts: [
                { lbl: 'A) Spin a tall tale.',   fx: '+2 GRUB — easy',   dG:  2, dT:  0 },
                { lbl: 'B) Decline. Move on.', fx: '+1 TRUST — safe',   dG:  0, dT:  1 },
              ],
            },
            {
              sit: ['"Any runaways on', 'this stretch?"'],
              opts: [
                { lbl: 'A) "Smallpox aboard!"', fx: '+2 TRUST — bold bluff', dG:  0, dT:  2 },
                { lbl: 'B) "Not that I seen."', fx: '+1 GRUB — quiet',        dG:  1, dT:  0 },
              ],
            },
          ];
          this.eIdx   = 0;
          this.sel    = -1;
          this.state  = 'choose';   // choose | feedback
          this.fb     = null;
          this.feedT  = 0;
          this.cool   = 0;
        },

        update(api, dt) {
          if (this.cool > 0) { this.cool -= dt; return; }
          if (this.feedT > 0) {
            this.feedT -= dt;
            if (this.feedT <= 0) {
              this.eIdx++;
              if (this.eIdx >= this.events.length) { api.win(); return; }
              this.state = 'choose'; this.sel = -1; this.fb = null;
            }
            return;
          }

          // Highlight hover
          const H = api.H;
          const ey = [H - 152, H - 100];
          if (api.pointer.down) {
            for (let i = 0; i < 2; i++) {
              if (api.pointer.y >= ey[i] && api.pointer.y <= ey[i] + 46 &&
                  api.pointer.x >= 14 && api.pointer.x <= api.W - 14) {
                this.sel = i;
              }
            }
          }
          // Keyboard
          if (api.input.pressed('up')   || api.input.pressed('left'))  this.sel = 0;
          if (api.input.pressed('down') || api.input.pressed('right')) this.sel = 1;

          if (api.confirm() && this.sel >= 0) {
            const opt = this.events[this.eIdx].opts[this.sel];
            J.grub  = Math.min(10, Math.max(1, J.grub  + opt.dG));
            J.trust = Math.min(10, Math.max(1, J.trust + opt.dT));
            this.fb    = opt;
            this.state = 'feedback';
            this.feedT = 1.8;
            this.cool  = 0.3;
            api.audio.sfx(opt.dT >= 2 ? 'power' : opt.dG >= 2 ? 'coin' : 'blip');
            api.addScore(30);
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const ev = this.events[Math.min(this.eIdx, this.events.length - 1)];
          // Night river
          c.fillStyle = '#06090e'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#1a2030'; c.fillRect(0, H * 0.52, W, H * 0.48);
          // Stars
          for (let i = 0; i < 14; i++) {
            const sx = (i * 29 + 10) % (W - 20) + 10, sy = (i * 41 + 5) % (H * 0.42);
            if (Math.floor(api.t * 2 + i) % 4 !== 0) g.rect(sx, sy, 2, 1, '#f0e8c0');
          }
          // Keelboat silhouette
          const bx = W * 0.72, by = H * 0.50;
          g.rect(bx - 28, by - 6, 56, 14, '#2a1808');
          g.rect(bx - 16, by - 22, 32, 16, '#1a1008');
          g.rect(bx - 2, by - 30, 4, 10, '#0e0804');
          // Torch glow (flat)
          c.fillStyle = '#f08020'; c.globalAlpha = 0.10;
          c.fillRect(bx - 24, by - 28, 48, 22);
          c.globalAlpha = 1;
          // Huck + Jim on raft (left)
          const hx = W * 0.22, hy = H * 0.56;
          g.rect(hx - 20, hy, 40, 7, C.raft);
          g.rect(hx - 7, hy - 16, 12, 16, C.huck);
          g.rect(hx - 8, hy - 25, 14,  9, C.huckH);
          g.rect(hx + 6, hy - 10, 9,   10, C.jimH);

          // Situation panel
          g.rect(10, H * 0.10, W - 20, H * 0.30, '#160e06');
          c.strokeStyle = C.amber; c.lineWidth = 1; c.strokeRect(10, H * 0.10, W - 20, H * 0.30);
          ev.sit.forEach((ln, i) => api.txtCFit(ln, W / 2, H * 0.13 + i * 16, 8, C.cream, true, W - 28));
          // Event dots
          for (let i = 0; i < 4; i++) {
            c.fillStyle = i < this.eIdx ? C.gold : (i === this.eIdx ? C.goldL : '#2a1808');
            c.fillRect(W / 2 - 22 + i * 12, H * 0.09, 8, 5);
          }

          const ey = [H - 152, H - 100];
          if (this.state === 'choose') {
            ev.opts.forEach((opt, i) => {
              const sel = this.sel === i;
              g.rect(14, ey[i], W - 28, 46, sel ? '#3a2008' : '#200e04');
              c.strokeStyle = sel ? C.gold : C.amber; c.lineWidth = sel ? 2 : 1;
              c.strokeRect(14, ey[i], W - 28, 46);
              api.txtCFit(opt.lbl, W / 2, ey[i] + 6, 7, sel ? C.goldL : C.amber, true, W - 36);
              api.txtCFit(opt.fx, W / 2, ey[i] + 24, 6, sel ? C.grn : '#607858', true, W - 36);
            });
            api.txtCFit('TAP TO DECIDE', W / 2, H - 52, 6, C.riverL, true, W - 20);
          } else if (this.fb) {
            g.rect(16, H - 166, W - 32, 96, '#0e1408');
            c.strokeStyle = C.gold; c.lineWidth = 2; c.strokeRect(16, H - 166, W - 32, 96);
            api.txtCFit(this.fb.lbl, W / 2, H - 162, 7, C.goldL, true, W - 44);
            const dG = this.fb.dG, dT = this.fb.dT;
            if (dG !== 0) api.txtCFit('GRUB '  + (dG > 0 ? '+' : '') + dG, W / 2, H - 142, 7, dG > 0 ? C.grubC  : C.warn, true, W - 44);
            if (dT !== 0) api.txtCFit('TRUST ' + (dT > 0 ? '+' : '') + dT, W / 2, H - 122, 7, dT > 0 ? C.trustC : C.warn, true, W - 44);
            meterBar(api, 22, H - 102, J.grub,  10, C.grubC, 'GRB');
            meterBar(api, 22, H -  91, J.trust, 10, C.trustC, 'TRS');
          }

          api.topBar('RAFTSMEN · ' + (this.eIdx + 1) + '/4');
          api.vignette();
        },
      },

      /* ======================================================================
       * 3. THE CAIRO FOG — Navigation: steer toward North Star gap
       *    Not just dodge — align raft with star to build distance.
       *    Banks push from sides. GRUB → lives.
       * ====================================================================== */
      {
        id: 'cairo', name: 'THE CAIRO FOG', sub: 'Find the crossing',
        icon(api, x, y) {
          api.gfx.circle(x, y, 6, '#203858');
          api.gfx.circle(x, y, 3, '#f0e050');
          api.gfx.rect(x - 1, y - 10, 2, 6, '#f0e050');
          api.gfx.rect(x + 4, y - 1, 6, 2, '#f0e050');
        },
        intro: [
          'FOG SWALLOWS THE RIVER.',
          'Cairo lies ahead—',
          'where the Ohio joins in.',
          'Align with the NORTH STAR',
          'to build your distance.',
        ],
        quote: '"There warn\'t no home like a raft, after all."',
        help: 'DRAG or ARROWS to steer. Stay under the NORTH STAR gap to advance. Avoid the banks. Reach 300 miles!',
        winText: 'Cairo! The Ohio joins here. A free state lies ahead.',
        loseText: 'Lost in the fog. You drifted south, deep into danger.',

        init(api) {
          this.rx   = api.W / 2;
          this.dist = 0;        // 0 → 300
          this.goal = 300;
          this.timer = 30;
          this.lives = Math.max(2, Math.min(4, Math.round(J.grub / 3)));
          this.banks = [];
          this.spawnB = 2.0;
          this.elapsed = 0;
          this.invT  = 0;
          this.starX = api.W * 0.4 + Math.random() * api.W * 0.2;
          // Fog blocks (large flat rectangles)
          this.fog = Array.from({length: 10}, (_, i) => ({
            x: Math.random() * api.W,
            y: Math.random() * api.H,
            w: 50 + Math.random() * 80,
            h: 20 + Math.random() * 30,
            vx: (Math.random() - 0.5) * 12,
          }));
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          const spd = 90;
          if (api.keyDown('left'))  this.rx -= spd * dt;
          if (api.keyDown('right')) this.rx += spd * dt;
          if (api.pointer.down) this.rx += clamp(api.pointer.x - this.rx, -spd * dt * 2.5, spd * dt * 2.5);
          this.rx = clamp(this.rx, 20, W - 20);

          this.timer   -= dt;
          this.elapsed += dt;
          if (this.timer <= 0 && this.dist < this.goal) { api.lose(); return; }

          // Advance distance when aligned with star gap
          const aligned = Math.abs(this.rx - this.starX) < 32;
          if (aligned) {
            this.dist += 50 * dt;
            if (this.dist >= this.goal) { api.win(); return; }
          }

          // Drift fog
          for (const f of this.fog) {
            f.x += f.vx * dt;
            f.y += 18 * dt;
            if (f.y > H + 40) { f.y = -40; f.x = Math.random() * W; }
            if (f.x < -80) f.x = W + 10;
            if (f.x > W + 10) f.x = -80;
          }

          // Spawn banks from sides
          this.spawnB -= dt;
          if (this.spawnB <= 0) {
            this.spawnB = Math.max(1.3, 2.0 - this.elapsed * 0.018);
            const left = Math.random() < 0.5;
            this.banks.push({ x: left ? 0 : W, y: -16, w: 40 + Math.random() * 20, vy: 65 + this.elapsed * 1.5, left });
          }
          for (const b of this.banks) b.y += b.vy * dt;
          this.banks = this.banks.filter(b => b.y < H + 30);

          if (this.invT > 0) { this.invT -= dt; return; }
          const RY = H * 0.72;
          for (const b of this.banks) {
            const bx = b.left ? b.w / 2 : W - b.w / 2;
            if (!b.hit && Math.abs(bx - this.rx) < b.w / 2 + 18 && Math.abs(b.y - RY) < 18) {
              b.hit = true; this.lives--;
              this.invT = 0.7;
              api.flash('#7a5020', 0.3); api.shake(5, 0.28); api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
          api.addScore(Math.floor(dt * (aligned ? 30 : 10)));
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          c.fillStyle = '#101820'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#1a2030'; c.fillRect(0, H * 0.38, W, H * 0.62);

          // North Star gap (clear corridor)
          const gapW = 50;
          c.fillStyle = '#080e18'; c.fillRect(this.starX - gapW / 2, 0, gapW, H * 0.42);
          g.circle(this.starX, H * 0.07, 5, '#f8f060');
          if (Math.floor(api.t * 3) % 2 === 0) {
            c.fillStyle = '#f8f060'; c.globalAlpha = 0.20;
            c.beginPath(); c.arc(this.starX, H * 0.07, 12, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          }

          // Banks from sides
          for (const b of this.banks) {
            const bx = b.left ? 0 : W - b.w;
            c.fillStyle = C.mud; c.fillRect(bx, b.y - 10, b.w, 20);
            c.fillStyle = '#5a3810'; c.fillRect(bx + 2, b.y - 6, b.w - 4, 12);
          }

          // Raft
          const RY = H * 0.72;
          const flicker = this.invT > 0 && Math.floor(api.t * 8) % 2 === 0;
          g.rect(this.rx - 18, RY - 4, 36, 8, C.raft);
          g.rect(this.rx - 16, RY - 2, 32, 5, C.raftD);
          if (!flicker) {
            g.rect(this.rx - 8, RY - 14, 8, 12, C.huck);
            g.rect(this.rx - 9, RY - 22, 10, 8, C.huckH);
            g.rect(this.rx + 3, RY - 10, 7, 9, C.jim);
          }
          c.strokeStyle = C.log; c.lineWidth = 2;
          c.beginPath(); c.moveTo(this.rx - 4, RY - 14); c.lineTo(this.rx - 14, RY - 28); c.stroke();

          // Fog blocks (flat opaque)
          c.fillStyle = '#607090'; c.globalAlpha = 0.50;
          for (const f of this.fog) c.fillRect(f.x, f.y, f.w, f.h);
          c.globalAlpha = 1;

          // Arrow guide to star
          const diff = this.starX - this.rx;
          if (Math.abs(diff) > 18) {
            const dir = diff > 0 ? '►' : '◄';
            api.txtC(dir, this.rx + clamp(diff * 0.5, -38, 38), RY - 34, 9, '#f8f060', true);
          }

          // Distance bar
          const bw = W - 20, filled = Math.floor(bw * (this.dist / this.goal));
          g.rect(10, H - 16, bw, 8, '#101828');
          g.rect(10, H - 16, filled, 8, C.trustC);
          c.strokeStyle = C.riverL; c.lineWidth = 1; c.strokeRect(10, H - 16, bw, 8);
          api.txtC('CAIRO ' + Math.floor(this.dist) + '/' + this.goal, W / 2, H - 28, 6, C.riverL, true);

          api.topBar('CAIRO FOG · ' + Math.ceil(this.timer) + 's');
          for (let i = 0; i < 4; i++) {
            c.fillStyle = i < this.lives ? C.gold : '#181408';
            c.fillRect(W - 8 - (3 - i) * 12, 2, 9, 9);
          }
          api.vignette();
        },
      },

      /* ======================================================================
       * 4. THE WILKS HOUSE — Evidence sorting (catch truth, dodge lies)
       *    Expose the King's fraud. TRUST → fewer lies spawned.
       *    Need 10 truth clues. Lives: 3.
       * ====================================================================== */
      {
        id: 'wilks', name: 'THE WILKS HOUSE', sub: 'A liar uncovered',
        icon(api, x, y) {
          const c = api.ctx;
          c.strokeStyle = C.gold; c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(x, y - 9); c.lineTo(x, y + 5); c.stroke();
          c.beginPath(); c.moveTo(x - 10, y - 2); c.lineTo(x + 10, y - 2); c.stroke();
          api.gfx.circle(x - 10, y + 3, 5, '#3a8018');
          api.gfx.circle(x + 10, y + 5, 5, '#801010');
        },
        intro: [
          'THE KING PRETENDS',
          'to be dead Harvey Wilks\'',
          'English brother.',
          'Catch the TRUTH clues.',
          'Expose the fraud!',
        ],
        quote: '"It was enough to make a body ashamed of the human race."',
        help: 'DRAG or ARROWS. Catch GREEN TRUE clues. Dodge RED LIAR clues. Catch 10 to expose the King!',
        winText: "The crowd sees through the King. He is run out of town!",
        loseText: 'The King slips away with the gold. Wickedness wins this round.',

        init(api) {
          this.px     = api.W / 2;
          this.clues  = [];
          this.lies   = [];
          this.caught = 0;
          this.lives  = 3;
          this.spawnC = 0.85;
          // High TRUST → lies spawn less frequently
          this.spawnL = Math.max(1.6, 2.2 - (J.trust - 5) * 0.10);
          this.invT   = 0;
          this.elapsed = 0;
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          const spd = 100;
          if (api.keyDown('left'))  this.px -= spd * dt;
          if (api.keyDown('right')) this.px += spd * dt;
          if (api.pointer.down) this.px += clamp(api.pointer.x - this.px, -spd * dt * 2.5, spd * dt * 2.5);
          this.px = clamp(this.px, 14, W - 14);
          this.elapsed += dt;

          this.spawnC -= dt;
          if (this.spawnC <= 0) {
            this.spawnC = Math.max(0.50, 0.85 - this.elapsed * 0.012);
            this.clues.push({ x: 14 + Math.random() * (W - 28), y: -12, vy: 80 + Math.random() * 40 });
          }
          this.spawnL -= dt;
          if (this.spawnL <= 0) {
            this.spawnL = Math.max(1.0, 2.2 - this.elapsed * 0.014);
            this.lies.push({ x: 14 + Math.random() * (W - 28), y: -12, vy: 78 + Math.random() * 52 });
          }

          for (const co of this.clues) co.y += co.vy * dt;
          for (const li of this.lies)  li.y += li.vy * dt;
          this.clues = this.clues.filter(co => co.y < H + 14 && !co.caught);
          this.lies  = this.lies.filter(li => li.y < H + 14 && !li.hit);

          const PY = H * 0.78;
          for (const co of this.clues) {
            if (!co.caught && co.y > PY - 14 && co.y < PY + 20 && Math.abs(co.x - this.px) < 22) {
              co.caught = true; this.caught++;
              api.audio.sfx('coin'); api.burst(co.x, co.y, C.grn, 6); api.addScore(15);
              if (this.caught >= 10) { J.trust = Math.min(10, J.trust + 1); api.win(); return; }
            }
          }

          if (this.invT > 0) { this.invT -= dt; return; }
          for (const li of this.lies) {
            if (!li.hit && li.y > PY - 14 && li.y < PY + 20 && Math.abs(li.x - this.px) < 18) {
              li.hit = true; this.lives--;
              this.invT = 0.7;
              api.flash('#c02010', 0.28); api.shake(4, 0.22); api.audio.sfx('hurt');
              if (this.lives <= 0) { api.lose(); return; }
            }
          }
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Victorian parlor (flat patterned wallpaper)
          for (let i = 0; i < 8; i++) for (let j = 0; j < 10; j++) {
            c.fillStyle = (i + j) % 2 ? '#1c1008' : '#140c06';
            c.fillRect(i * 34, j * 48, 34, 48);
          }
          c.fillStyle = '#281808'; c.fillRect(0, H * 0.82, W, H * 0.18);
          // Window
          g.rect(W * 0.35, H * 0.08, W * 0.30, H * 0.20, '#1a2848');
          c.strokeStyle = '#8a6028'; c.lineWidth = 2; c.strokeRect(W * 0.35, H * 0.08, W * 0.30, H * 0.20);
          // King (fraud)
          const kx = W * 0.74;
          g.rect(kx - 10, H * 0.30, 20, 34, '#6a3810');
          g.circle(kx, H * 0.27, 12, C.huck);
          g.rect(kx - 8, H * 0.20, 16, 6, C.gold);  // crown
          api.txtC('$', kx, H * 0.10, 8, '#e02010', true);
          // Huck (catcher)
          const PY = H * 0.78;
          const flicker = this.invT > 0 && Math.floor(api.t * 8) % 2 === 0;
          if (!flicker) {
            g.rect(this.px - 8, PY - 12, 16, 18, C.huck);
            g.rect(this.px - 9, PY - 21, 18,  9, C.huckH);
            g.rect(this.px - 22, PY - 8, 14, 4, C.huck);
            g.rect(this.px + 8,  PY - 8, 14, 4, C.huck);
          }
          // Truth clues (green papers)
          for (const co of this.clues) {
            g.rect(co.x - 9, co.y - 7, 18, 12, '#143010');
            c.strokeStyle = C.grn; c.lineWidth = 1; c.strokeRect(co.x - 9, co.y - 7, 18, 12);
            api.txtC('TRUE', co.x, co.y - 5, 5, C.grn, true);
          }
          // Lie clues (red)
          for (const li of this.lies) {
            g.rect(li.x - 9, li.y - 7, 18, 12, '#3a0808');
            c.strokeStyle = C.warn; c.lineWidth = 1; c.strokeRect(li.x - 9, li.y - 7, 18, 12);
            api.txtC('LIAR', li.x, li.y - 5, 5, C.warn, true);
          }
          // Progress bar
          const bw = W - 20, filled = Math.floor(bw * (this.caught / 10));
          g.rect(10, H - 14, bw, 7, '#180e08');
          g.rect(10, H - 14, filled, 7, C.grn);
          c.strokeStyle = '#3a8018'; c.lineWidth = 1; c.strokeRect(10, H - 14, bw, 7);
          api.txtC('TRUTH ' + this.caught + '/10', W / 2, H - 26, 6, C.grn, true);

          api.topBar('THE WILKS HOUSE');
          for (let i = 0; i < 3; i++) {
            c.fillStyle = i < this.lives ? C.gold : '#2a1808';
            c.fillRect(W - 8 - (2 - i) * 14, 2, 11, 9);
          }
          api.vignette();
        },
      },

      /* ======================================================================
       * 5. THE PHELPS FARM — Rope-throw rescue (aim + timing)
       *    Jim is in the shed. When his window opens, THROW the rope.
       *    TRUST → longer window open; GRUB → more attempts.
       *    Need 3 successful catches to free Jim.
       * ====================================================================== */
      {
        id: 'phelps', name: 'THE PHELPS FARM', sub: 'Free Jim!',
        icon(api, x, y) {
          const c = api.ctx;
          c.strokeStyle = C.log; c.lineWidth = 2;
          c.beginPath(); c.ellipse(x, y + 2, 7, 4, 0, 0, Math.PI * 2); c.stroke();
          c.beginPath(); c.moveTo(x + 7, y + 2); c.lineTo(x + 13, y - 6); c.stroke();
        },
        intro: [
          'JIM IS LOCKED UP',
          'at the Phelps farm.',
          'When his window opens,',
          'throw the rope!',
          'The guard must not see.',
        ],
        quote: '"Human beings can be awful cruel to one another."',
        help: 'Watch Jim\'s WINDOW. When it OPENS (lit yellow), TAP to throw the rope! 3 catches free Jim.',
        winText: 'The rope pulls taut. Jim slides free into the night. Freedom!',
        loseText: 'So close. The guard spotted you. Try again — Jim is counting on you.',

        init(api) {
          this.windowOpen  = false;
          this.winDur      = 0.5 + (J.trust / 10) * 0.55;  // TRUST: 0.5-1.05s window
          this.winT        = 0;
          this.nextOpen    = 2.0 + Math.random();
          this.attempts    = Math.max(3, Math.min(6, J.grub - 1));  // GRUB → attempts
          this.successes   = 0;   // need 3
          this.guardX      = api.W * 0.50;
          this.guardDir    = 1;
          this.rope        = null;   // { t, hit }
          this.ropeT       = 0;
          this.result      = null;  // 'hit' | 'miss'
          this.resultT     = 0;
          this.throwCool   = 0;
          this.jimAnim     = 0;
          this.elapsed     = 0;
          this.SHED_X      = api.W * 0.72;
          this.SHED_Y      = api.H * 0.28;
          this.HUCK_X      = api.W * 0.22;
          this.HUCK_Y      = api.H * 0.75;
          this.stars       = Array.from({length: 18}, (_, i) => ({ x: (i * 31 + 10) % (api.W - 16) + 8, y: (i * 43 + 4) % (api.H * 0.38) }));
        },

        update(api, dt) {
          const W = api.W, H = api.H;
          this.elapsed    += dt;
          this.throwCool   = Math.max(0, this.throwCool - dt);
          if (this.resultT > 0) {
            this.resultT -= dt;
            return;
          }
          // Guard patrol
          this.guardX += this.guardDir * 52 * dt;
          if (this.guardX > W - 20) { this.guardX = W - 20; this.guardDir = -1; }
          if (this.guardX < 20)     { this.guardX = 20;     this.guardDir = 1; }
          // Window cycle
          if (!this.windowOpen) {
            this.nextOpen -= dt;
            if (this.nextOpen <= 0) { this.windowOpen = true; this.winT = this.winDur; api.audio.sfx('blip'); }
          } else {
            this.winT -= dt;
            if (this.winT <= 0) { this.windowOpen = false; this.nextOpen = 1.8 + Math.random() * 1.4; }
          }
          // Rope arc
          if (this.rope) {
            this.ropeT += dt * 2.2;
            if (this.ropeT >= 1 && this.rope.hit === undefined) {
              if (this.windowOpen) {
                this.rope.hit  = true;
                this.result    = 'hit';
                this.resultT   = 0.9;
                this.successes++;
                this.jimAnim   = 1.2;
                api.audio.sfx('power');
                api.burst(this.SHED_X, this.SHED_Y + 14, C.gold, 10);
                api.addScore(50);
                if (this.successes >= 3) { J.trust = Math.min(10, J.trust + 2); api.win(); return; }
              } else {
                this.rope.hit = false;
                this.result   = 'miss';
                this.resultT  = 0.7;
                this.attempts--;
                api.shake(4, 0.22); api.audio.sfx('hurt');
                if (this.attempts <= 0) { api.lose(); return; }
              }
            }
            if (this.ropeT > 1.6) { this.rope = null; this.ropeT = 0; }
          }
          // Throw
          if (api.confirm() && !this.rope && this.throwCool <= 0) {
            this.rope = { hit: undefined };
            this.ropeT = 0;
            this.throwCool = 1.0;
            api.audio.sfx('shoot');
          }
          if (this.jimAnim > 0) this.jimAnim -= dt;
          api.addScore(Math.floor(dt * 6));
        },

        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          const SX = this.SHED_X, SY = this.SHED_Y;
          const HX = this.HUCK_X, HY = this.HUCK_Y;
          // Night farmyard
          c.fillStyle = '#040804'; c.fillRect(0, 0, W, H);
          for (const s of this.stars) {
            if (Math.floor(api.t * 1.5 + s.x * 0.2) % 4 !== 0) g.rect(s.x, s.y, 2, 1, '#f0e8c0');
          }
          g.circle(W * 0.14, H * 0.09, 12, '#f0e8a0');
          g.circle(W * 0.14 + 4, H * 0.09 - 3, 10, '#040804');

          // Shed
          g.rect(SX - 32, SY, 64, 56, '#3a1808');
          g.rect(SX - 28, SY + 4, 56, 48, '#4a2010');
          c.fillStyle = '#2a1008';
          c.beginPath(); c.moveTo(SX - 36, SY); c.lineTo(SX, SY - 20); c.lineTo(SX + 36, SY); c.closePath(); c.fill();
          // Window
          const winCol = this.windowOpen ? '#f0c040' : '#140a04';
          g.rect(SX - 11, SY + 14, 22, 16, winCol);
          c.strokeStyle = C.logD; c.lineWidth = 1; c.strokeRect(SX - 11, SY + 14, 22, 16);
          if (this.windowOpen) {
            g.circle(SX, SY + 20, 7, C.jimH);
            g.circle(SX, SY + 19, 5, C.jim);
            if (Math.floor(api.t * 5) % 2 === 0) api.txtC('!', SX, SY + 8, 7, C.gold, true);
          }

          // Ground
          c.fillStyle = '#182210'; c.fillRect(0, H * 0.82, W, H * 0.18);
          c.fillStyle = '#203018'; c.fillRect(0, H * 0.85, W, H * 0.06);

          // Guard (patrolling)
          const GY = H * 0.76;
          g.rect(this.guardX - 7, GY - 24, 14, 24, '#4a5830');
          g.circle(this.guardX, GY - 28, 9, '#c09060');
          // Guard torch glow (flat rectangle)
          c.fillStyle = '#f08020'; c.globalAlpha = 0.10;
          const tDir = this.guardDir;
          c.fillRect(this.guardX + (tDir > 0 ? 7 : -39), GY - 18, 32, 16);
          c.globalAlpha = 1;

          // Huck (thrower, left side)
          g.rect(HX - 8, HY - 20, 14, 20, C.huck);
          g.rect(HX - 9, HY - 30, 16, 10, C.huckH);

          // Rope arc
          if (this.rope && this.ropeT < 1.6) {
            const t = Math.min(1, this.ropeT);
            const midX = (HX + SX) / 2, midY = Math.min(HY, SY) - 42;
            for (let k = 0; k <= 8; k++) {
              const kt = k / 8;
              if (kt > t) break;
              const kx = (1-kt)*(1-kt)*HX + 2*(1-kt)*kt*midX + kt*kt*SX;
              const ky = (1-kt)*(1-kt)*HY + 2*(1-kt)*kt*midY + kt*kt*(SY+16);
              g.rect(kx - 1, ky - 1, 3, 2, C.log);
            }
          }

          // Jim celebration
          if (this.jimAnim > 0) {
            api.txtCFit('FREE!', SX, SY - 34, 9, C.goldL, true, 70);
          }

          // Result flash
          if (this.resultT > 0) {
            const col = this.result === 'hit' ? C.grn : C.warn;
            api.txtCFit(this.result === 'hit' ? 'GOT IT!' : 'MISSED!', W / 2, H * 0.52, 9, col, true, W - 20);
          }

          // Window open indicator (blink pulse when about to open)
          if (!this.windowOpen && this.nextOpen < 1.0 && Math.floor(api.t * 6) % 2 === 0) {
            api.txtCFit('READY...', W / 2, H * 0.12, 7, C.amber, true, W - 20);
          }

          // Progress (3 catches needed)
          for (let i = 0; i < 3; i++) {
            c.fillStyle = i < this.successes ? C.gold : '#1a1808';
            c.fillRect(W / 2 - 18 + i * 18, H - 20, 13, 11);
          }
          api.txtC(this.successes + '/3', W / 2, H - 35, 6, C.amber, true);

          api.topBar('PHELPS FARM');
          // Attempts left
          for (let i = 0; i < 6; i++) {
            c.fillStyle = i < this.attempts ? C.trustC : '#101828';
            c.fillRect(W - 8 - (5 - i) * 10, 2, 8, 9);
          }
          api.vignette();
        },
      },

    ], // end chapters
  }); // end RetroSaga.create

})();
