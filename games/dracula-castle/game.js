/* ============================================================================
 * DRACULA — A PIXEL TALE
 * Five chapters through Bram Stoker's novel, each a different mini-game:
 *   1. THE CASTLE WALL — timing-based climb (escape the castle)
 *   2. THE DEMETER     — defend the doomed ship
 *   3. RENFIELD        — catch the flies in the asylum
 *   4. LUCY'S TOMB     — precision stake-strike
 *   5. THE RECKONING   — sunset chase + final blow
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

  // gothic night backdrop for the title / menu / story screens
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a0612'); sky.addColorStop(0.55, '#160a16'); sky.addColorStop(1, '#070409');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 44; i++) { const x = (i * 53 + 11) % W, y = (i * 97 + 7) % Math.floor(H * 0.55); c.globalAlpha = 0.25 + 0.3 * Math.sin(t * 2 + i); g.rect(x, y, 1, 1, '#cdbfe0'); } c.globalAlpha = 1;
    if (scene !== 'menu') { g.circle(W - 56, 66, 22, '#b03038'); g.circle(W - 49, 60, 19, '#160a14'); }
    const baseY = H - 84; c.fillStyle = '#0a0610';
    c.beginPath(); c.moveTo(0, baseY);
    for (let x = 0; x <= W; x += 18) c.lineTo(x, baseY - 6 - ((x * 7) % 14)); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    const towers = [[40, 44], [92, 66], [150, 52], [206, 72]];
    for (const tw of towers) { c.fillStyle = '#0a0610'; c.fillRect(tw[0], baseY - tw[1], 20, tw[1]); for (let bx = 0; bx < 20; bx += 8) c.fillRect(tw[0] + bx, baseY - tw[1] - 5, 5, 5); g.rect(tw[0] + 7, baseY - tw[1] + 12, 6, 9, '#e3a030'); }
    for (let i = 0; i < 5; i++) { const bx = (t * 26 + i * 64) % (W + 40) - 20, by = 116 + Math.sin(t * 2 + i) * 16 + i * 10; const flap = Math.sin(t * 12 + i) > 0; g.sprite(flap ? ['k.kk.k', '.kkkk.'] : ['.k..k.', 'kkkkkk'], bx, by, { k: '#120814' }, 2); }
    if (scene === 'intro' || scene === 'finale' || scene === 'result') { c.fillStyle = 'rgba(6,3,9,.62)'; c.fillRect(0, 0, W, H); }
    else if (scene === 'menu') { c.fillStyle = 'rgba(6,3,9,.42)'; c.fillRect(0, 0, W, H); }
  }

  RetroSaga.create({
    id: 'dracula',
    title: 'Dracula',
    subtitle: 'A TALE IN FIVE CHAPTERS',
    currency: 'RESOLVE',
    accent: '#e3c567',
    credit: 'AN ORIGINAL 8-BIT TRIBUTE · B. STOKER, 1897',
    emblem,
    scenery,
    bootCta: 'TAP TO ENTER',
    menuLabel: 'CHRONICLE OF THE COUNT',
    menuHint: 'CHOOSE A CHAPTER TO BEGIN',
    menuDone: 'THE COUNT IS UNDONE',
    menu: {
      colors: { title: '#e23b4a', label: '#8a6a6a', cur: '#e8c0c0' },
      card(api, info) {
        const g = api.gfx, { ch, i, x, y, w, h, sel, done, best } = info;
        g.rect(x, y, w, h, sel ? '#251016' : '#160a10');           // dark stone slab
        g.rectO(x, y, w, h, sel ? '#e23b4a' : '#5a1822', sel ? 2 : 1);
        g.rect(x, y, w, 2, '#3a1820');
        g.circle(x + 22, y + h / 2, 11, done ? '#8a1224' : '#5a0c18'); // blood-wax seal
        g.circle(x + 22, y + h / 2, 11, 'rgba(255,80,80,0)');
        if (ch.icon) ch.icon(api, x + 22, y + h / 2);
        api.txt((i + 1) + '. ' + ch.name, x + 42, y + 9, 10, done ? '#e23b4a' : '#e8d9d0');
        api.txt(ch.sub || '', x + 42, y + 25, 9, '#8a6a6a');
        if (done) api.txt('✦' + best, x + w - 52, y + 16, 9, '#e23b4a');
        else api.txt('▸', x + w - 20, y + 16, 12, sel ? '#e23b4a' : '#5a3a3a');
      },
    },
    finale: ['THE COUNT IS DUST.', 'THE CRIMSON DAWN', 'BREAKS CLEAN.', '', 'HARKER GOES HOME.'],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#e3c567', blood: '#c8102e' },

    chapters: [
      /* ============================ 2. THE WALL ======================== */
      {
        id: 'wall', name: 'THE CASTLE WALL', sub: 'A THING OF DARKNESS',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 7, y - 6, 14, 12, '#4a3f5a'); g.rect(x - 7, y - 2, 14, 1, '#1b1726'); g.rect(x - 1, y - 6, 1, 12, '#1b1726'); g.rect(x - 7, y - 6, 7, 1, '#1b1726'); },
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
        icon(api, x, y) { const g = api.gfx; g.rect(x - 1, y - 7, 2, 9, '#5a3f28'); g.sprite(['w..', 'ww.', 'www'], x + 1, y - 6, { w: '#cabfa0' }, 2); g.rect(x - 8, y + 2, 16, 3, '#3a2a1a'); },
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

      /* ========================= 3b. RENFIELD ======================== */
      {
        id: 'renfield', name: 'RENFIELD', sub: "DR SEWARD'S ASYLUM",
        icon(api, x, y) { const g = api.gfx; g.rect(x - 2, y - 1, 4, 3, '#101010'); g.rect(x - 5, y - 2, 3, 1, '#cfe0d0'); g.rect(x + 2, y - 2, 3, 1, '#cfe0d0'); },
        intro: ['IN THE ASYLUM, RENFIELD', 'DEVOURS FLIES AND SPIDERS', 'TO DRINK THEIR LIVES —', 'his Master draws near.'],
        quote: 'The blood is the life! The blood is the life!',
        help: 'TAP the flies & spiders to fill the jar',
        winText: 'The jar seethes with life. "The Master is coming," he whispers.',
        loseText: 'The orderlies wrestle him down before the jar is full.',
        init(api) { this.caught = 0; this.need = 16; this.timer = 22; this.bugs = []; this.spawn = 0; },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt; api.score = this.caught * 5 + Math.floor(22 - this.timer);
          this.spawn -= dt;
          if (this.spawn <= 0) { this.spawn = api.rnd(0.32, 0.6); const kind = api.chance(0.3) ? 'spider' : 'fly'; this.bugs.push({ x: api.rnd(20, api.W - 20), y: api.rnd(56, api.H - 40), vx: api.rnd(-1.2, 1.2), vy: api.rnd(-1.2, 1.2), kind, life: kind === 'fly' ? api.rnd(2, 3.2) : api.rnd(3, 4.2) }); }
          for (const b of this.bugs) {
            b.x += b.vx * f; b.y += b.vy * f; b.life -= dt;
            if (b.x < 14 || b.x > api.W - 14) b.vx *= -1; if (b.y < 50 || b.y > api.H - 28) b.vy *= -1;
            if (api.chance(0.02)) { b.vx = api.rnd(-1.5, 1.5); b.vy = api.rnd(-1.5, 1.5); }
          }
          this.bugs = this.bugs.filter((b) => b.life > 0);
          if (api.pointer.justDown) {
            let hit = false;
            for (const b of this.bugs) { if (!b.gone && Math.hypot(api.pointer.x - b.x, api.pointer.y - b.y) < (b.kind === 'spider' ? 17 : 13)) { b.gone = true; hit = true; this.caught++; api.score += 5; api.audio.sfx('coin'); api.burst(b.x, b.y, '#9adf6a', 6); break; } }
            this.bugs = this.bugs.filter((b) => !b.gone);
            if (!hit) api.audio.sfx('blip');
          }
          if (this.caught >= this.need) { api.score += Math.floor(this.timer * 4); api.win(); }
          else if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#15171c');
          for (let y = 20; y < H; y += 26) for (let x = 0; x < W; x += 26) { g.rect(x + 2, y + 2, 22, 22, '#23262e'); g.rectO(x + 2, y + 2, 22, 22, '#1a1c22', 1); }
          const jx = W / 2 - 22, jy = H - 70;
          g.rect(jx, jy, 44, 56, 'rgba(120,160,120,.12)'); g.rectO(jx, jy, 44, 56, '#8aa080', 1);
          const fill = Math.min(1, this.caught / this.need); g.rect(jx + 2, jy + 54 - 52 * fill, 40, 52 * fill, 'rgba(110,200,90,.45)');
          for (const b of this.bugs) {
            if (b.kind === 'fly') { g.rect(b.x - 2, b.y - 1, 4, 3, '#101010'); g.rect(b.x - 4, b.y - 2, 2, 1, '#cfe0d0'); g.rect(b.x + 3, b.y - 2, 2, 1, '#cfe0d0'); }
            else { g.rect(b.x - 3, b.y - 3, 6, 6, '#101010'); for (const sgn of [-5, 5]) { g.rect(b.x + sgn, b.y - 3, 2, 1, '#101010'); g.rect(b.x + sgn, b.y + 2, 2, 1, '#101010'); } }
          }
          api.topBar('RENFIELD');
          api.txt('JAR ' + this.caught + '/' + this.need, 6, 20, 9, '#9adf6a');
          g.rect(W - 70, 21, 64, 6, '#2a2230'); g.rect(W - 70, 21, 64 * (1 - clamp(this.timer / 22, 0, 1)), 6, api.colors.gold);
          api.vignette(); api.scanlines();
        },
      },

      /* ============================ 4. LUCY'S TOMB ===================== */
      {
        id: 'lucy', name: "LUCY'S TOMB", sub: 'RELEASE HER SOUL',
        icon(api, x, y) { const g = api.gfx; g.rect(x - 1, y - 7, 2, 14, '#caa15a'); g.rect(x - 5, y - 3, 10, 2, '#caa15a'); },
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
        icon(api, x, y) { const g = api.gfx; g.circle(x, y, 5, '#ff8a3d'); for (let a = 0; a < 8; a++) { const ang = a / 8 * Math.PI * 2; g.rect(x + Math.cos(ang) * 8 - 1, y + Math.sin(ang) * 8 - 1, 2, 2, '#ff8a3d'); } },
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
