/* ============================================================================
 * DRACULA — A PIXEL SAGA
 * Five chapters through Bram Stoker's novel, each a different mini-game:
 *   1. THE CARPATHIAN ROAD — night carriage dodge
 *   2. THE CASTLE WALL     — timing-based climb
 *   3. THE DEMETER         — defend the doomed ship
 *   4. LUCY'S TOMB         — precision stake-strike
 *   5. THE RECKONING       — sunset chase + final blow
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  // shared bat emblem for title / finale
  function emblem(api, cx, cy) {
    const g = api.gfx;
    g.sprite([
      'r..........r',
      'rr...rr...rr',
      'rrr.rrrr.rrr',
      '.rrrrrrrrrr.',
      '..rr.rr.rr..',
      '...r....r...',
    ], cx - 36, cy - 18, { r: '#c8102e' }, 6);
  }

  RetroSaga.create({
    id: 'dracula',
    title: 'Dracula',
    subtitle: 'A SAGA IN FIVE CHAPTERS',
    accent: '#e3c567',
    credit: 'AN ORIGINAL 8-BIT TRIBUTE · B. STOKER, 1897',
    emblem,
    finale: ['THE COUNT IS DUST.', 'THE CRIMSON DAWN', 'BREAKS CLEAN.', '', 'HARKER GOES HOME.'],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#e3c567', blood: '#c8102e' },

    chapters: [
      /* ============================ 1. THE ROAD ========================= */
      {
        id: 'road', name: 'THE CARPATHIAN ROAD', sub: 'TO CASTLE DRACULA',
        intro: ['JONATHAN HARKER RIDES', 'THE NIGHT ROAD INTO', 'THE CARPATHIANS —', 'and wolves give chase.'],
        quote: 'Listen to them — the children of the night. What music they make!',
        help: 'DRAG or ◀ ▶ to steer · survive the road',
        winText: 'The gates of Castle Dracula loom from the dark. Harker arrives.',
        loseText: 'The wolves take the horses. The night road swallows all.',
        init(api) { this.x = api.W / 2; this.hits = 0; this.obs = []; this.timer = 26; this.spawn = 0.6; this.dist = 0; },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt; this.dist += dt * 12; api.score = Math.floor(this.dist);
          const p = api.pointer;
          if (p.down) this.x = p.x;
          if (api.keyDown('left')) this.x -= 3 * f;
          if (api.keyDown('right')) this.x += 3 * f;
          this.x = clamp(this.x, 30, api.W - 30);
          this.spawn -= dt;
          const rate = Math.max(0.42, 1.05 - this.dist / 380);
          if (this.spawn <= 0) { this.spawn = rate; this.obs.push({ x: api.rnd(26, api.W - 26), y: -14, kind: api.chance(0.5) ? 'wolf' : 'rock', vy: api.rnd(2.6, 3.8), ph: api.rnd(0, 6) }); }
          const cy = api.H - 64;
          for (const o of this.obs) {
            o.y += o.vy * f; o.ph += 0.2 * f;
            if (!o.dead && Math.abs(o.x - this.x) < 18 && Math.abs(o.y - cy) < 16) {
              o.dead = true; this.hits++; api.shake(6, 0.3); api.flash(api.colors.blood, 0.18); api.burst(o.x, o.y, api.colors.blood, 10); api.audio.sfx('hurt');
              if (this.hits >= 3) { api.lose(); return; }
            }
          }
          this.obs = this.obs.filter((o) => o.y < api.H + 20 && !o.dead);
          if (this.timer <= 0) { api.score += 120; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#0a0a16');
          // moon
          g.circle(W - 44, 48, 16, '#cdd3e6'); g.circle(W - 38, 44, 13, '#0a0a16');
          // road
          g.rect(W / 2 - 60, 0, 120, H, '#15131f');
          g.rect(W / 2 - 60, 0, 5, H, '#2a2740'); g.rect(W / 2 + 55, 0, 5, H, '#2a2740');
          const sc = (api.t * 220) % 40;
          for (let y = -40 + sc; y < H; y += 40) g.rect(W / 2 - 2, y, 4, 20, '#3a3760');
          // passing pines
          for (let i = 0; i < 6; i++) { const ty = (api.t * 200 + i * 90) % (H + 40) - 20; const tx = i % 2 ? 18 : W - 26; g.sprite(['..g..', '.ggg.', 'ggggg', '..w..'], tx - 8, ty, { g: '#13261a', w: '#2a1a10' }, 3); }
          // obstacles
          for (const o of this.obs) {
            if (o.kind === 'wolf') { const step = Math.sin(o.ph) > 0 ? 0 : 1; g.sprite(['k.k', 'kkk', 'k.k'], o.x - 9 + step, o.y - 9, { k: '#2a2a33' }, 6); g.rect(o.x - 6, o.y - 4, 2, 2, '#ff3b3b'); g.rect(o.x + 4, o.y - 4, 2, 2, '#ff3b3b'); }
            else g.sprite(['.kk.', 'kkkk', 'kkkk'], o.x - 8, o.y - 8, { k: '#3a3340' }, 4);
          }
          // carriage
          const cyy = H - 64;
          g.sprite([
            '.bbbbbb.',
            'bbbbbbbb',
            'b.bwwb.b',
            'bbbbbbbb',
            '.k....k.',
            '.kk..kk.',
          ], this.x - 16, cyy - 18, { b: '#241018', w: '#e3c567', k: '#3a2a1a' }, 4);
          api.topBar('THE CARPATHIAN ROAD');
          api.txt('DIST ' + Math.floor(this.dist), 6, 20, 9, api.colors.gold);
          for (let i = 0; i < 3; i++) g.rect(W - 50 + i * 14, 5, 10, 8, i < 3 - this.hits ? api.colors.blood : '#3a1a1a');
          // survive bar
          g.rect(6, H - 12, W - 12, 5, '#2a2230'); g.rect(6, H - 12, (W - 12) * (1 - clamp(this.timer / 26, 0, 1)), 5, api.colors.gold);
          api.vignette(); api.scanlines();
        },
      },

      /* ============================ 2. THE WALL ======================== */
      {
        id: 'wall', name: 'THE CASTLE WALL', sub: 'A THING OF DARKNESS',
        intro: ['HARKER SEES THE COUNT', 'CRAWL DOWN THE SHEER', 'WALL LIKE A LIZARD.', 'He must climb it too.'],
        quote: 'I saw the whole man slowly emerge and begin to crawl down the castle wall.',
        help: 'TAP when the grip lines up with the green',
        winText: 'Hand over hand, Harker gains the black window. He is inside.',
        loseText: 'His grip fails. The stones rush up to meet him.',
        init(api) { this.h = 0; this.need = 12; this.m = 0; this.dir = 1; this.spd = 1.1; this.band = 0.18; this.miss = 0; },
        update(api, dt) {
          const f = dt * 60;
          this.m += this.dir * this.spd * 0.03 * f;
          if (this.m > 1) { this.m = 1; this.dir = -1; } if (this.m < 0) { this.m = 0; this.dir = 1; }
          if (api.confirm()) {
            if (Math.abs(this.m - 0.5) < this.band) {
              this.h++; api.score += 25; api.audio.sfx('coin'); api.burst(api.W / 2, api.H - 40, api.colors.gold, 6);
              this.spd = Math.min(2.2, this.spd + 0.12); this.band = Math.max(0.09, this.band - 0.008);
              if (this.h >= this.need) { api.score += 60; api.win(); }
            } else { this.miss++; api.shake(5, 0.25); api.audio.sfx('hurt'); if (this.miss >= 4) { api.lose(); } }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#0c0a12');
          // wall bricks
          for (let y = 0; y < H; y += 18) for (let x = 0; x < W; x += 30) g.rect(x + ((Math.floor(y / 18) % 2) ? 15 : 0), y, 28, 16, '#1b1726');
          // moon glow window near top
          g.rect(W / 2 - 14, 26, 28, 34, '#241018'); g.rect(W / 2 - 10, 30, 20, 26, '#e3c567'); g.rect(W / 2 - 10, 30, 20, 26, 'rgba(20,10,10,.4)');
          // climber position by height
          const cy = H - 70 - (H - 150) * (this.h / this.need);
          g.sprite(['.hh.', 'hffh', '.cc.', 'c..c'], W / 2 - 8, cy, { h: '#3a2f1a', f: '#caa07a', c: '#6a2a2a' }, 4);
          // grip meter
          const my = H - 40, mx = 24, mw = W - 48;
          g.rect(mx, my, mw, 12, '#241a26');
          g.rect(mx + mw * (0.5 - this.band), my, mw * this.band * 2, 12, 'rgba(93,255,143,.35)');
          g.rect(mx + mw * 0.5 - 1, my - 3, 2, 18, '#5dff8f');
          g.rect(mx + mw * this.m - 2, my - 4, 4, 20, api.colors.gold);
          api.topBar('THE CASTLE WALL');
          api.txt('HOLD ' + this.h + '/' + this.need, 6, 20, 9, api.colors.gold);
          api.txt('SLIP ' + this.miss + '/4', W - 70, 20, 9, this.miss > 2 ? api.colors.blood : api.colors.dim);
          api.vignette(); api.scanlines();
        },
      },

      /* ============================ 3. THE DEMETER ===================== */
      {
        id: 'demeter', name: 'THE DEMETER', sub: 'A SHIP OF THE DEAD',
        intro: ['DRACULA SAILS TO ENGLAND', 'IN THE HOLD OF THE DEMETER.', 'ONE BY ONE THE CREW', 'vanish in the dark.'],
        quote: 'God seems to have deserted us... the men are gone, all gone.',
        help: 'TAP the glowing hatch before the shadow takes the crew',
        winText: 'Dawn — and Whitby harbour. The ship runs aground, but you held.',
        loseText: 'The last of the crew is gone. The wheel turns alone.',
        init(api) {
          this.crew = 5; this.timer = 26; this.warded = 0; this.active = null; this.next = 1.0;
          this.hatch = [[60, 150], [200, 150], [70, 250], [200, 250], [135, 340]];
        },
        update(api, dt) {
          this.timer -= dt; api.score = this.warded * 10 + Math.floor((26 - this.timer));
          if (this.active) {
            this.active.t -= dt;
            if (this.active.t <= 0) { this.crew--; api.shake(6, 0.3); api.flash(api.colors.blood, 0.2); api.audio.sfx('hurt'); this.active = null; this.next = api.rnd(0.5, 1.0); if (this.crew <= 0) { api.lose(); return; } }
          } else { this.next -= dt; if (this.next <= 0) { this.active = { i: api.rint(0, this.hatch.length - 1), t: Math.max(0.8, 1.7 - (26 - this.timer) / 26) }; api.audio.sfx('blip'); } }
          if (api.pointer.justDown && this.active) {
            const h = this.hatch[this.active.i];
            if (Math.hypot(api.pointer.x - h[0], api.pointer.y - h[1]) < 26) { this.warded++; api.score += 10; api.burst(h[0], h[1], api.colors.gold, 10); api.audio.sfx('coin'); this.active = null; this.next = api.rnd(0.4, 0.9); }
          }
          if (this.timer <= 0) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#0a1018');
          // sea + sky
          g.rect(0, 0, W, 70, '#141022');
          for (let i = 0; i < 30; i++) g.rect((i * 53) % W, (i * 31) % 60, 1, 1, '#3a3550');
          // deck
          g.rect(0, 80, W, H - 80, '#3a2a1a');
          for (let y = 90; y < H; y += 16) g.rect(0, y, W, 1, '#2a1d12');
          // mast
          g.rect(W / 2 - 3, 80, 6, H - 80, '#241a10');
          // hatches
          for (let i = 0; i < this.hatch.length; i++) {
            const h = this.hatch[i], on = this.active && this.active.i === i;
            g.rect(h[0] - 18, h[1] - 14, 36, 28, on ? '#3a1414' : '#241a12');
            g.rectO(h[0] - 18, h[1] - 14, 36, 28, on ? api.colors.blood : '#4a3a24', 1);
            if (on) { const r = 22 * this.active.t / 1.7 + 6; g.circle(h[0], h[1], r, 'rgba(200,16,46,0.0)'); g.rectO(h[0] - r, h[1] - r, r * 2, r * 2, api.colors.blood, 1); api.txtC('!', h[0], h[1] - 6, 12, '#ff3b3b'); }
          }
          api.topBar('THE DEMETER');
          api.txt('WARDED ' + this.warded, 6, 20, 9, api.colors.gold);
          for (let i = 0; i < 5; i++) g.rect(W - 70 + i * 13, 5, 9, 8, i < this.crew ? '#5dff8f' : '#2a1a1a');
          g.rect(6, H - 12, W - 12, 5, '#2a2230'); g.rect(6, H - 12, (W - 12) * (1 - clamp(this.timer / 26, 0, 1)), 5, api.colors.gold);
          api.vignette(); api.scanlines();
        },
      },

      /* ============================ 4. LUCY'S TOMB ===================== */
      {
        id: 'lucy', name: "LUCY'S TOMB", sub: 'RELEASE HER SOUL',
        intro: ['LUCY WALKS AS THE', 'BLOOFER LADY. VAN HELSING', 'GIVES ARTHUR THE STAKE.', 'Strike true. Strike clean.'],
        quote: 'The thing in the coffin writhed... but Arthur never faltered.',
        help: 'TAP when the ring meets the heart',
        winText: 'One last shudder — then peace. Lucy is herself again, and free.',
        loseText: 'Your nerve breaks. The creature slips back into the dark.',
        init(api) { this.strikes = 0; this.need = 5; this.r = 40; this.dir = -1; this.spd = 0.9; this.bad = 0; this.heartR = 12; },
        update(api, dt) {
          const f = dt * 60;
          this.r += this.dir * this.spd * f;
          if (this.r < 8) { this.r = 8; this.dir = 1; } if (this.r > 46) { this.r = 46; this.dir = -1; }
          if (api.confirm()) {
            if (Math.abs(this.r - this.heartR) < 6) {
              this.strikes++; api.score += 30; api.audio.sfx('power'); api.shake(4, 0.2); api.burst(api.W / 2, api.H / 2, api.colors.blood, 12); api.flash('#3a0000', 0.15);
              this.spd = Math.min(2.0, this.spd + 0.18);
              if (this.strikes >= this.need) { api.score += 70; api.win(); }
            } else { this.bad++; api.audio.sfx('hurt'); api.shake(3, 0.15); if (this.bad >= 4) api.lose(); }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, cx = W / 2, cy = H / 2;
          api.clear('#0a0810');
          // tomb walls
          for (let y = 0; y < H; y += 22) for (let x = 0; x < W; x += 34) g.rect(x + ((Math.floor(y / 22) % 2) ? 17 : 0), y, 32, 20, '#161420');
          // coffin
          g.rect(cx - 50, cy - 70, 100, 150, '#241a14'); g.rectO(cx - 50, cy - 70, 100, 150, '#4a3420', 2);
          // heart target (pulsing)
          const hp = this.heartR + Math.sin(api.t * 6) * 1.5;
          g.circle(cx, cy, hp, api.colors.blood); g.circle(cx - 3, cy - 3, 3, '#ff6b6b');
          // closing ring
          g.ctx.strokeStyle = Math.abs(this.r - this.heartR) < 6 ? '#5dff8f' : api.colors.cream;
          g.ctx.lineWidth = 2; g.ctx.beginPath(); g.ctx.arc(cx, cy, this.r, 0, Math.PI * 2); g.ctx.stroke();
          api.topBar("LUCY'S TOMB");
          api.txt('STAKE ' + this.strikes + '/' + this.need, 6, 20, 9, api.colors.gold);
          api.txt('NERVE ' + (3 - Math.min(3, this.bad)), W - 78, 20, 9, this.bad > 1 ? api.colors.blood : api.colors.dim);
          api.vignette(); api.scanlines();
        },
      },

      /* ============================ 5. THE RECKONING =================== */
      {
        id: 'reckoning', name: 'THE RECKONING', sub: 'RACE THE SUNSET',
        intro: ['THE BOX IS HAULED TO', 'CASTLE DRACULA. IF THE SUN', 'SETS, THE COUNT WAKES.', 'Catch the cart. End it.'],
        quote: 'If we are not in time, he will wake — and never sleep again.',
        help: 'Steer to catch the cart · TAP to strike at the heart',
        winText: 'The kukri and the bowie fall as one. The Count crumbles to dust.',
        loseText: 'The sun dips below the peaks. Two red eyes snap open.',
        init(api) { this.x = api.W / 2; this.sun = 0; this.gap = 100; this.obs = []; this.spawn = 0.7; this.phase = 'chase'; this.m = 0; this.dir = 1; this.tries = 0; },
        update(api, dt) {
          const f = dt * 60;
          this.sun += dt / 30;
          if (this.sun >= 1) { api.lose(); return; }
          if (this.phase === 'chase') {
            const p = api.pointer; if (p.down) this.x = p.x;
            if (api.keyDown('left')) this.x -= 3 * f; if (api.keyDown('right')) this.x += 3 * f;
            this.x = clamp(this.x, 28, api.W - 28);
            this.gap -= dt * 8; // closing
            api.score = Math.floor((100 - this.gap));
            this.spawn -= dt;
            if (this.spawn <= 0) { this.spawn = api.rnd(0.6, 1.1); this.obs.push({ x: api.rnd(26, api.W - 26), y: -12, vy: api.rnd(2.4, 3.4) }); }
            for (const o of this.obs) {
              o.y += o.vy * f;
              if (!o.dead && Math.abs(o.x - this.x) < 16 && Math.abs(o.y - (api.H - 60)) < 16) { o.dead = true; this.gap += 10; api.shake(5, 0.25); api.flash(api.colors.blood, 0.15); api.audio.sfx('hurt'); }
            }
            this.obs = this.obs.filter((o) => o.y < api.H + 20 && !o.dead);
            if (this.gap <= 0) { this.phase = 'strike'; api.audio.sfx('select'); }
          } else {
            this.m += this.dir * 1.6 * 0.03 * f;
            if (this.m > 1) { this.m = 1; this.dir = -1; } if (this.m < 0) { this.m = 0; this.dir = 1; }
            if (api.confirm()) {
              if (Math.abs(this.m - 0.5) < 0.12) { api.score += Math.floor((1 - this.sun) * 200) + 100; api.shake(8, 0.5); api.flash('#fff', 0.3); api.burst(api.W / 2, api.H / 2, api.colors.blood, 24); api.audio.sfx('explode'); api.win(); }
              else { this.tries++; api.audio.sfx('hurt'); api.shake(4, 0.2); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          // sky reddens with the sun meter
          const t = this.sun;
          g.clear('#0a0a16');
          g.rect(0, 0, W, 90, `rgb(${Math.floor(20 + t * 180)},${Math.floor(10 + t * 60)},${Math.floor(30 - t * 20)})`);
          g.circle(W / 2, 90 - t * 10, 20, `rgb(255,${Math.floor(200 - t * 120)},80)`);
          // mountain road
          g.rect(W / 2 - 64, 0, 128, H, '#15131f');
          const sc = (api.t * 200) % 40; for (let y = -40 + sc; y < H; y += 40) g.rect(W / 2 - 2, y, 4, 20, '#3a3760');
          if (this.phase === 'chase') {
            // the cart ahead, size grows as gap closes
            const cs = 2 + (100 - this.gap) / 40;
            g.sprite(['kkkk', 'k..k', 'kwwk', 'kkkk'], W / 2 - 8, 60, { k: '#241018', w: '#c8102e' }, cs);
            for (const o of this.obs) g.sprite(['.kk.', 'kkkk', 'k..k'], o.x - 8, o.y - 8, { k: '#2a2a33' }, 4);
            // our carriage
            g.sprite(['.bbbb.', 'bbbbbb', 'b.ww.b', 'bbbbbb', '.k..k.'], this.x - 12, H - 78, { b: '#241018', w: '#e3c567', k: '#3a2a1a' }, 4);
            api.txt('GAP ' + Math.max(0, Math.floor(this.gap)), 6, 20, 9, api.colors.gold);
          } else {
            // strike QTE on the coffin
            g.rect(W / 2 - 54, H / 2 - 70, 108, 150, '#241a14'); g.rectO(W / 2 - 54, H / 2 - 70, 108, 150, '#4a3420', 2);
            g.circle(W / 2, H / 2, 13 + Math.sin(api.t * 8) * 2, api.colors.blood); g.circle(W / 2 - 3, H / 2 - 3, 4, '#ff6b6b');
            const mx = 24, mw = W - 48, my = H - 44;
            g.rect(mx, my, mw, 12, '#241a26');
            g.rect(mx + mw * (0.5 - 0.12), my, mw * 0.24, 12, 'rgba(93,255,143,.35)');
            g.rect(mx + mw * this.m - 2, my - 4, 4, 20, api.colors.gold);
            api.txtC('STRIKE!', W / 2, H / 2 + 90, 12, api.colors.blood, true);
          }
          api.topBar('THE RECKONING');
          // sun/sunset meter
          api.txt('SUNSET', W - 92, 20, 9, '#ff8a3d');
          g.rect(W - 50, 21, 44, 7, '#2a2230'); g.rect(W - 50, 21, 44 * t, 7, '#ff8a3d');
          api.vignette(); api.scanlines();
        },
      },
    ],
  });
})();
