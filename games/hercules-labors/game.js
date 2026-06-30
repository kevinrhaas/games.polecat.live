/* ============================================================================
 * HERCULES — THE TWELVE LABORS
 * Five chapters of Greek myth, each a different mini-game:
 *   1. THE NEMEAN LION    — timing-strike: tap when the lion enters the gold zone
 *   2. THE LERNAEAN HYDRA — reaction-tap: sever heads before they multiply
 *   3. STYMPHALIAN BIRDS  — dodge bronze feathers; bang clappers to scatter
 *   4. THE AUGEAN STABLES — tap stalls to steer the river and wash them clean
 *   5. CERBERUS           — three-head boss: tap each glowing head before it bites
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Emblem: knotted club of Hercules ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    g.rect(cx - 2, cy - 26, 5, 34, '#6B3A1A');
    g.circle(cx, cy - 29, 10, '#7A4520');
    g.circle(cx + 7, cy - 22, 6, '#6B3A1A');
    g.circle(cx - 6, cy - 22, 6, '#6B3A1A');
    g.circle(cx + 3, cy - 36, 5, '#8A5530');
    g.circle(cx - 3, cy - 33, 4, '#7A4520');
    g.circle(cx + 1, cy + 11, 4, '#5A2A10');
    g.rect(cx - 1, cy - 32, 1, 12, 'rgba(255,220,150,.3)');
  }

  /* ─── Scenery: Olympus sky, temple silhouette ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    const sky = c.createLinearGradient(0, 0, 0, H * 0.72);
    sky.addColorStop(0, '#050818');
    sky.addColorStop(0.6, '#0d1428');
    sky.addColorStop(1, '#1c1008');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 48; i++) {
      const sx = (i * 73 + 17) % W, sy = (i * 53 + 9) % Math.floor(H * 0.50);
      c.globalAlpha = 0.16 + 0.36 * Math.sin(t * 1.3 + i * 0.9);
      g.rect(sx, sy, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1, i % 3 === 0 ? '#FFE890' : '#C8DCFF');
    }
    c.globalAlpha = 1;

    // Moon (crescent)
    g.circle(44, 52, 20, '#E8D870');
    g.circle(52, 45, 17, '#0d1428');

    // Zeus lightning flash
    if (Math.sin(t * 0.61 + 1.1) > 0.94) {
      c.globalAlpha = 0.10 + 0.07 * Math.sin(t * 40);
      c.fillStyle = '#FFFFC0'; c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
    }

    // Mount Olympus silhouette
    c.fillStyle = '#080f1a';
    c.beginPath();
    c.moveTo(0, H * 0.60);
    const mp = [0,H*.60, 20,H*.48, 50,H*.34, 80,H*.24, 110,H*.18, 135,H*.28, 160,H*.22, 190,H*.30, 220,H*.38, 250,H*.50, 270,H*.60];
    for (let i = 0; i < mp.length; i += 2) c.lineTo(mp[i], mp[i+1]);
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();

    // Temple base
    const baseY = Math.floor(H * 0.68);
    c.fillStyle = '#18130c'; c.fillRect(0, baseY, W, H - baseY);
    c.fillStyle = '#221c14'; c.fillRect(4, baseY, W - 8, 8);
    c.fillStyle = '#1c1810'; c.fillRect(0, baseY + 6, W, 6);

    // Columns
    const colX = [16, 58, 100, 142, 184, 226];
    for (const cx2 of colX) {
      c.fillStyle = '#2c2418'; c.fillRect(cx2, baseY - 70, 12, 70);
      c.fillStyle = '#1e1a10';
      for (let f = 1; f < 4; f++) c.fillRect(cx2 + f * 3, baseY - 70, 1, 68);
      c.fillStyle = '#38301e'; c.fillRect(cx2 - 4, baseY - 74, 20, 6);
    }
    c.fillStyle = '#241e14'; c.fillRect(0, baseY - 80, W, 8);
    c.fillStyle = '#1a1508';
    c.beginPath(); c.moveTo(0, baseY - 80); c.lineTo(W / 2, baseY - 120); c.lineTo(W, baseY - 80); c.closePath(); c.fill();
    // Lightning bolt in pediment
    const pcy = baseY - 100;
    c.strokeStyle = '#3A3020'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(W/2-6, pcy-10); c.lineTo(W/2+2, pcy); c.lineTo(W/2-2, pcy); c.lineTo(W/2+6, pcy+10); c.stroke();

    // Foreground marble tiles
    c.fillStyle = '#0d0b08'; c.fillRect(0, H - 44, W, 44);
    for (let i = 0; i < 8; i++) { c.fillStyle = i%2 ? '#12100d' : '#0d0b08'; c.fillRect(i*36, H-44, 35, 44); }

    // Overlays
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(5,5,18,.82)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      c.fillStyle = 'rgba(4,4,16,.68)'; c.fillRect(0, 0, W, H);
      // Marble floor tiles
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 7; col++) {
          c.fillStyle = ((row + col) % 2) ? '#1c1810' : '#141210';
          c.fillRect(col * 40 - 5, H - 130 + row * 28, 39, 27);
        }
      }
      // Wall torches
      for (const tx of [18, W - 18]) {
        c.fillStyle = '#3A2A10'; c.fillRect(tx - 3, 72, 6, 22);
        c.globalAlpha = 0.7 + 0.2 * Math.sin(t * 7 + tx);
        c.fillStyle = '#FF8A20'; c.beginPath(); c.arc(tx, 66, 7, 0, 7); c.fill();
        c.fillStyle = '#FFD060'; c.beginPath(); c.arc(tx, 68, 3, 0, 7); c.fill();
        c.globalAlpha = 1;
      }
    }
  }

  /* ─── Shared hero sprite ─── */
  function drawHercules(api, hx, hy, inv) {
    const g = api.gfx;
    const vis = inv <= 0 || Math.floor(api.t * 10) % 2 === 0;
    if (!vis) return;
    g.rect(hx-5, hy-5, 4, 16, '#C89060');
    g.rect(hx+1, hy-5, 4, 16, '#C89060');
    g.rect(hx-9, hy-26, 18, 23, '#D0A070');
    g.rect(hx-13, hy-28, 26, 10, '#CD7F32');
    g.circle(hx, hy-38, 10, '#C8944C');
    g.rect(hx-10, hy-49, 20, 13, '#2A1808');
    g.rect(hx+10, hy-46, 5, 22, '#6B3A1A');
    g.circle(hx+12, hy-48, 6, '#7A4520');
  }

  /* ======================================================================
   * SAGA
   * ====================================================================== */
  RetroSaga.create({
    id: 'hercules-labors',
    title: 'Hercules',
    subtitle: 'THE TWELVE LABORS',
    currency: 'GLORY',
    screens: {
      win: '#FFD700', lose: '#8B3030',
      chapterLabel: '#9AAAC8', name: '#F0E0A0',
      sub: '#CD7F32', intro: '#E8D8A8',
      quote: '#8A7A5A', help: '#FFD700',
      score: '#E8D8A8', cur: '#FFD700',
      cta: '#F0E0A0', overlay: 'rgba(5,5,20,.88)',
    },
    labels: {
      chapter: 'LABOR', score: 'GLORY WON',
      win: 'OLYMPUS REJOICES', lose: 'HERA LAUGHS',
      cont: 'TAP TO PRESS ON', finale: 'TAP FOR YOUR FINAL TRIAL',
      toMenu: 'TAP TO RETURN', play: 'TAP TO BEGIN',
    },
    accent: '#CD7F32',
    credit: 'A PIXEL TRIBUTE · GREEK MYTHOLOGY',
    emblem,
    scenery,
    bootCta: 'TAP TO PROVE YOUR WORTH',
    bootLine: '5 TRIALS · ONE HERO',
    menuLabel: 'THE HALL OF LABORS',
    menuHint: 'CHOOSE A LABOR TO ATTEMPT',
    menuDone: 'THE GODS ARE SATISFIED',
    menu: {
      colors: { title: '#FFD700', label: '#8A7A5A', cur: '#F0E0A0' },
      // 5 bronze shields in a 3-2 arc (not a list!)
      layout(api) {
        return [
          { x: 14, y: 108, w: 72, h: 82 },
          { x: 99, y: 86, w: 72, h: 82 },
          { x: 184, y: 108, w: 72, h: 82 },
          { x: 48, y: 218, w: 72, h: 82 },
          { x: 150, y: 218, w: 72, h: 82 },
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const cx2 = x + w / 2, cy2 = y + 34, r = 30;
        // Outer bronze ring
        c.fillStyle = sel ? '#B8860B' : '#7A4818';
        c.beginPath(); c.arc(cx2, cy2, r + 5, 0, Math.PI * 2); c.fill();
        // Shield face (deep crimson leather)
        c.fillStyle = sel ? '#5A1808' : '#3A1005';
        c.beginPath(); c.arc(cx2, cy2, r + 2, 0, Math.PI * 2); c.fill();
        // Inner ring engraving
        c.strokeStyle = sel ? '#FFD700' : '#CD7F32'; c.lineWidth = 1.5;
        c.beginPath(); c.arc(cx2, cy2, r - 6, 0, Math.PI * 2); c.stroke();
        // Central boss (umbo)
        c.fillStyle = sel ? '#FFD700' : '#CD7F32';
        c.beginPath(); c.arc(cx2, cy2, 5, 0, Math.PI * 2); c.fill();
        // Chapter icon
        if (ch.icon) ch.icon(api, cx2, cy2);
        // Number badge (top-right of shield)
        api.txtC('' + (i + 1), cx2 + 18, cy2 + 19, 7, '#FFD700', true);
        // Name label below shield
        api.txtCFit(ch.name, cx2, y + h - 10, 6, done ? '#FFD700' : '#C8B070', false, w - 2);
        // Done shimmer
        if (done) {
          c.globalAlpha = 0.18; c.fillStyle = '#FFD700';
          c.beginPath(); c.arc(cx2, cy2, r + 5, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
        }
      },
    },
    finale: [
      'ALL LABORS COMPLETE.',
      'OLYMPUS OPENS ITS GATES.',
      'HERCULES ASCENDS',
      'TO JOIN THE GODS.',
      '',
      'A LEGEND MADE IMMORTAL.',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      /* ==================================================================
       * LABOR 1 — THE NEMEAN LION
       * Timing-strike: tap when the lion enters the gold zone to hit it.
       * ================================================================== */
      {
        id: 'lion',
        name: 'NEMEAN LION',
        sub: 'ITS HIDE REPELS ALL BLADES',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y-2, 11, '#8B5020');
          g.circle(x, y-2, 8, '#CD7F32');
          g.rect(x+6, y-5, 5, 4, '#D4A040');
          g.rect(x-3, y-7, 3, 3, '#FFD070');
        },
        intro: [
          'THE NEMEAN LION',
          'cannot be pierced',
          'by any weapon.',
          'Strike with bare hands!',
        ],
        quote: '"No sword could wound it." — Apollodorus',
        help: 'TAP inside the GOLD ZONE when the lion charges!',
        winText: 'THE LION FALLS — ITS HIDE BECOMES YOUR CLOAK.',
        loseText: 'THE BEAST CLAIMS YOU. TRY ONCE MORE.',
        init(api) {
          const S = api.state;
          S.lionX = -60;
          S.lionPhase = 'idle';
          S.idleTimer = 0;
          S.idleDelay = 1.5;
          S.speed = 95;
          S.hp = 6;
          S.lives = 3;
          S.invuln = 0;
          S.hitFlash = 0;
          S.inZone = false;
          S.chargesDone = 0;
        },
        update(api, dt) {
          const S = api.state;
          if (S.invuln > 0) S.invuln -= dt;
          if (S.hitFlash > 0) S.hitFlash -= dt;
          const W = api.W;

          if (S.lionPhase === 'idle') {
            S.idleTimer += dt;
            if (S.idleTimer >= S.idleDelay) {
              S.lionPhase = 'charge';
              S.lionX = -55;
              S.idleTimer = 0;
              api.audio.sfx('blip');
            }
          } else if (S.lionPhase === 'charge') {
            S.lionX += S.speed * dt;
            S.inZone = S.lionX > 110 && S.lionX < 200;

            if ((api.pointer.justDown || api.keyPressed('a')) && S.inZone) {
              S.hp--;
              S.chargesDone++;
              S.lionPhase = 'retreat';
              S.inZone = false;
              S.hitFlash = 0.28;
              S.speed = Math.min(220, 95 + S.chargesDone * 18);
              S.idleDelay = Math.max(0.55, 1.5 - S.chargesDone * 0.1);
              api.burst(S.lionX, 330, '#CD7F32', 12);
              api.shake(5, 0.25);
              api.audio.sfx('hurt');
              api.addScore(10);
              if (S.hp <= 0) { api.win(); return; }
            } else if (S.lionX > W - 20) {
              if (S.invuln <= 0) {
                S.lives--;
                S.invuln = 1.5;
                api.shake(7, 0.4);
                api.flash('rgba(180,30,30,.45)', 0.35);
                api.audio.sfx('hurt');
                if (S.lives <= 0) { api.lose(); return; }
              }
              S.lionPhase = 'retreat';
              S.inZone = false;
              S.chargesDone++;
            }
          } else { // retreat
            S.lionX -= 130 * dt;
            if (S.lionX < -60) { S.lionPhase = 'idle'; S.idleTimer = 0; }
          }
        },
        draw(api) {
          const { gfx: g, ctx: c, W, H, t, state: S } = api;
          const sky = c.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#1A1005'); sky.addColorStop(1, '#2A1A08');
          c.fillStyle = sky; c.fillRect(0, 0, W, H);
          // Arid hillside
          g.rect(0, 342, W, H - 342, '#3A2410');
          g.rect(0, 340, W, 5, '#6A4018');
          // Rocky outcrops
          for (const [rx, rr] of [[58,10],[190,8],[120,6]]) { g.circle(rx, 343, rr, '#4A3018'); }

          // Strike zone overlay
          if (S.inZone) {
            c.fillStyle = 'rgba(255,215,0,.09)';
            c.fillRect(110, 286, 90, 66);
            c.globalAlpha = 0.8 + 0.2 * Math.sin(t * 18);
            api.txtC('STRIKE!', 155, 330, 10, '#FFD700', true);
            c.globalAlpha = 1;
          } else if (S.lionPhase === 'charge' && S.lionX > -20) {
            api.txtC('WAIT...', 155, 330, 8, '#6A5020');
          }
          // Zone brackets
          g.rect(110, 290, 2, 54, '#FFD70060' );
          g.rect(196, 290, 2, 54, '#FFD70060');

          // Hit flash
          if (S.hitFlash > 0) {
            c.globalAlpha = S.hitFlash * 2.5; c.fillStyle = '#FFD700'; c.fillRect(0,0,W,H); c.globalAlpha = 1;
          }

          // Lion
          const lx = Math.floor(S.lionX), ly = 330;
          if (lx > -30) {
            g.rect(lx-22, ly-14, 38, 18, '#CD7F32');
            g.circle(lx+18, ly-10, 17, '#8B5020');
            g.circle(lx+18, ly-10, 13, '#CD7F32');
            g.rect(lx+23, ly-15, 3, 3, '#FFD700');
            g.rect(lx+28, ly-11, 8, 5, '#D4A040');
            g.rect(lx+29, ly-9, 2, 5, '#F0F0E0');
            g.rect(lx+32, ly-9, 2, 5, '#F0F0E0');
            g.rect(lx-16, ly+4, 7, 14, '#B86020');
            g.rect(lx+2, ly+4, 7, 14, '#B86020');
            g.rect(lx+15, ly+4, 7, 14, '#B86020');
            g.rect(lx-28, ly-8, 10, 3, '#8B5020');
            g.circle(lx-30, ly-8, 5, '#6A3010');
          }

          // Hercules
          drawHercules(api, 238, 328, S.invuln);

          // HUD
          api.topBar('NEMEAN LION', 'HP ' + S.hp, '#CD7F32');
          for (let i = 0; i < 3; i++) g.circle(15 + i*20, H-20, 6, i < S.lives ? '#FF6030' : '#2A1810');
          api.txtC('LIVES', 76, H-18, 6, '#8A6040');
        },
      },

      /* ==================================================================
       * LABOR 2 — THE LERNAEAN HYDRA
       * Reaction-tap: sever heads before they multiply to 7+
       * ================================================================== */
      {
        id: 'hydra',
        name: 'LERNAEAN HYDRA',
        sub: 'CUT ONE — TWO GROW BACK',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x-6, y-7, 6, '#2A8A30');
          g.circle(x+6, y-7, 6, '#2A8A30');
          g.circle(x, y-10, 5, '#3AA040');
          g.rect(x-3, y-2, 6, 10, '#2A8A30');
        },
        intro: [
          'The HYDRA has nine heads.',
          'Cut one and two grow back.',
          'Strike fast — or',
          'the swamp fills with heads.',
        ],
        quote: '"For every head cut, two sprang back." — Hyginus',
        help: 'TAP each head to sever it! Kill 20 before 7 heads crowd the swamp!',
        winText: 'THE HYDRA IS SLAIN — THE SWAMP RUNS CLEAR.',
        loseText: 'TOO MANY HEADS. THE SWAMP CLAIMS YOU.',
        init(api) {
          const S = api.state;
          S.heads = [];
          S.killed = 0;
          S.goal = 20;
          S.nextSpawn = 0.6;
          S.spawnDelay = 2.0;
          S.maxHeads = 7;
          for (let i = 0; i < 3; i++) S.heads.push(makeHydraHead());
        },
        update(api, dt) {
          const S = api.state;
          S.nextSpawn -= dt;
          for (const h of S.heads) { h.timer += dt; h.bobY = Math.sin(h.timer * h.bobSpd) * 5; }

          if (S.nextSpawn <= 0 && S.heads.length < S.maxHeads) {
            S.heads.push(makeHydraHead());
            S.nextSpawn = S.spawnDelay * (0.6 + Math.random() * 0.8);
            S.spawnDelay = Math.max(0.8, S.spawnDelay - 0.05);
          }

          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (let i = S.heads.length - 1; i >= 0; i--) {
              const h = S.heads[i];
              const dx = px - h.x, dy = py - (h.y + h.bobY);
              if (dx*dx + dy*dy < 22*22) {
                S.heads.splice(i, 1);
                S.killed++;
                api.addScore(10);
                api.burst(h.x, h.y + h.bobY, '#2A8A30', 10);
                api.audio.sfx('shoot');
                if (S.killed < 14 && S.heads.length < S.maxHeads - 2) S.heads.push(makeHydraHead());
                if (S.killed >= S.goal) { api.win(); return; }
                break;
              }
            }
          }
          if (S.heads.length >= S.maxHeads) { api.lose(); }
        },
        draw(api) {
          const { gfx: g, ctx: c, W, H, t, state: S } = api;
          c.fillStyle = '#0A1A08'; c.fillRect(0, 0, W, H);
          // Swamp water
          c.fillStyle = '#0E2010'; c.fillRect(0, H-120, W, 120);
          c.globalAlpha = 0.12;
          for (let i = 0; i < 5; i++) {
            const mx = ((t*14 + i*60) % (W+60)) - 30;
            c.fillStyle = '#90C870'; c.beginPath(); c.ellipse(mx, H-100+i*5, 44, 12, 0, 0, 7); c.fill();
          }
          c.globalAlpha = 1;
          // Lily pads
          for (let i = 0; i < 6; i++) { g.circle((i*47+10)%W, H-80+(i%3)*14, 9, '#1A5018'); }
          // Dead trees
          c.fillStyle = '#0A1508'; c.fillRect(8, H-210, 5, 80); c.fillRect(4, H-210, 14, 4);
          c.fillRect(250, H-185, 4, 64); c.fillRect(246, H-185, 12, 4);
          // Hydra body
          const bx = W/2, by = H-56;
          c.fillStyle = '#1A5A20'; c.beginPath(); c.ellipse(bx, by, 26, 32, 0, 0, 7); c.fill();
          c.strokeStyle = '#2A8A30'; c.lineWidth = 1; c.beginPath(); c.ellipse(bx, by, 26, 32, 0, 0, 7); c.stroke();
          // Heads
          for (const h of S.heads) {
            const hy2 = h.y + h.bobY;
            c.strokeStyle = '#2A7A28'; c.lineWidth = 6;
            c.beginPath(); c.moveTo(bx + h.nOff, by - 22); c.quadraticCurveTo(h.x, hy2 + 20, h.x, hy2); c.stroke();
            c.fillStyle = '#2A8A30'; c.beginPath(); c.arc(h.x, hy2, 17, 0, 7); c.fill();
            c.strokeStyle = '#1A6020'; c.lineWidth = 0.8; c.beginPath(); c.arc(h.x, hy2, 10, 0, 7); c.stroke();
            g.rect(h.x-6, hy2-6, 5, 5, '#FF6010'); g.rect(h.x+1, hy2-6, 5, 5, '#FF6010');
            g.rect(h.x-5, hy2-5, 3, 3, '#000'); g.rect(h.x+2, hy2-5, 3, 3, '#000');
            g.rect(h.x-8, hy2+4, 16, 5, '#0A3010');
            g.rect(h.x-5, hy2+3, 3, 5, '#F0F0E0'); g.rect(h.x+2, hy2+3, 3, 5, '#F0F0E0');
          }

          api.topBar('LERNAEAN HYDRA', S.killed + '/' + S.goal + ' SEVERED', '#2A8A30');
          if (S.heads.length >= S.maxHeads - 1) {
            c.globalAlpha = 0.7 + 0.3 * Math.sin(t * 10);
            api.txtC('TOO MANY HEADS!', W/2, 56, 8, '#FF4010', true);
            c.globalAlpha = 1;
          }
          // Kill progress bar
          g.rect(10, H-22, Math.floor((W-20) * S.killed / S.goal), 5, '#2A8A30');
          g.rectO(10, H-22, W-20, 5, '#1A3A10');
        },
      },

      /* ==================================================================
       * LABOR 3 — STYMPHALIAN BIRDS
       * Dodge bronze feathers; tap centre to bang clappers and scatter birds.
       * ================================================================== */
      {
        id: 'birds',
        name: 'STYMPHALIAN BIRDS',
        sub: 'BRONZE FEATHERS, IRON BEAKS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x-10, y-4, 8, 4, '#CD7F32'); g.rect(x+2, y-4, 8, 4, '#CD7F32');
          g.circle(x+8, y-2, 5, '#CD7F32');
          g.rect(x+11, y-2, 4, 2, '#3A2010');
          g.circle(x-2, y, 6, '#B86020');
        },
        intro: [
          'Man-eating birds with',
          'bronze feathers fill',
          'the Stymphalian marsh.',
          'Dodge feathers! Bang clappers!',
        ],
        quote: '"Hercules scared them with a great bronze rattle." — Apollodorus',
        help: 'LEFT/RIGHT to dodge! Tap CENTRE to bang clappers (3s cooldown)!',
        winText: 'THE BIRDS FLEE — THE MARSH IS SAFE.',
        loseText: 'BRONZE FEATHERS FIND THEIR MARK.',
        init(api) {
          const S = api.state;
          S.heroX = api.W / 2;
          S.feathers = [];
          S.birds = [];
          S.lives = 3;
          S.invuln = 0;
          S.clapCD = 0;
          S.clapActive = 0;
          S.survived = 0;
          S.goal = 28;
          S.nextF = 0.4;
          S.nextB = 1.2;
          for (let i = 0; i < 4; i++) {
            S.birds.push({ x: 30 + i*60, y: 80 + (i%2)*36, vx: (i%2?1:-1)*(32+i*8), flap: i*1.2 });
          }
        },
        update(api, dt) {
          const S = api.state;
          S.survived += dt;
          if (S.survived >= S.goal) { api.win(); return; }
          if (S.invuln > 0) S.invuln -= dt;
          if (S.clapCD > 0) S.clapCD -= dt;
          if (S.clapActive > 0) S.clapActive -= dt;

          const W = api.W, px = api.pointer.x;
          // Movement: left third / right third of screen; keyboard
          const goLeft = api.keyDown('left') || (api.pointer.down && px < W/3);
          const goRight = api.keyDown('right') || (api.pointer.down && px > 2*W/3);
          if (goLeft) S.heroX = clamp(S.heroX - 150*dt, 18, W-18);
          if (goRight) S.heroX = clamp(S.heroX + 150*dt, 18, W-18);

          // Clapper: tap middle third or press A
          const midTap = api.pointer.justDown && px >= W/3 && px <= 2*W/3;
          if ((api.keyPressed('a') || midTap) && S.clapCD <= 0) {
            S.clapActive = 0.9; S.clapCD = 3.0;
            api.audio.sfx('power'); api.shake(3, 0.2);
            for (const b of S.birds) { b.vx *= -1.2; b.y = clamp(b.y - 25, 40, 200); }
            S.feathers = [];
          }

          // Move birds
          for (const b of S.birds) {
            b.flap += dt * 8; b.x += b.vx * dt;
            if (b.x < -10) { b.x = -10; b.vx = Math.abs(b.vx); }
            if (b.x > W+10) { b.x = W+10; b.vx = -Math.abs(b.vx); }
            b.y += Math.sin(b.flap * 0.28) * dt * 12;
            b.y = clamp(b.y, 46, 190);
          }
          S.nextB -= dt;
          if (S.nextB <= 0 && S.birds.length < 8) {
            S.birds.push({ x: Math.random()<0.5?-10:W+10, y:60+Math.random()*100, vx:(Math.random()<0.5?1:-1)*(40+Math.random()*30), flap:0 });
            S.nextB = 2.5 + Math.random()*2;
          }

          // Feathers
          if (S.clapActive <= 0) {
            S.nextF -= dt;
            if (S.nextF <= 0 && S.birds.length > 0) {
              const b = S.birds[Math.floor(Math.random()*S.birds.length)];
              S.feathers.push({ x:b.x, y:b.y, vx:(Math.random()-0.5)*44, vy:110+Math.random()*70, rot:Math.random()*Math.PI*2 });
              S.nextF = 0.22 + Math.random()*0.35;
            }
          }
          for (const f of S.feathers) { f.x += f.vx*dt; f.y += f.vy*dt; f.rot += dt*5; }
          S.feathers = S.feathers.filter(f => f.y < api.H + 10);

          // Collision
          const heroY = api.H - 78;
          if (S.invuln <= 0) {
            for (const f of S.feathers) {
              if (Math.abs(f.x-S.heroX)<15 && Math.abs(f.y-heroY)<22) {
                S.lives--; S.invuln = 1.2;
                api.shake(5,0.3); api.flash('rgba(200,100,0,.4)',0.25); api.audio.sfx('hurt');
                if (S.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
        },
        draw(api) {
          const { gfx: g, ctx: c, W, H, t, state: S } = api;
          const sky = c.createLinearGradient(0,0,0,H);
          sky.addColorStop(0,'#0A1218'); sky.addColorStop(0.6,'#121A10'); sky.addColorStop(1,'#0E1A08');
          c.fillStyle = sky; c.fillRect(0,0,W,H);
          c.fillStyle = '#0A1808'; c.fillRect(0, H-58, W, 58);
          c.globalAlpha = 0.10;
          for (let i=0;i<4;i++) { g.rect(((t*20+i*70)%(W+40))-20, H-44, 36, 2, '#4A8A30'); }
          c.globalAlpha = 1;
          g.rect(0, H-62, W, 8, '#1A2A10');

          // Birds
          for (const b of S.birds) {
            const up = Math.sin(b.flap) > 0;
            c.fillStyle = '#CD7F32';
            c.beginPath();
            c.moveTo(b.x,b.y); c.lineTo(b.x+(up?-18:-16),b.y+(up?-12:8)); c.lineTo(b.x+(up?-8:-6),b.y); c.closePath(); c.fill();
            c.beginPath();
            c.moveTo(b.x,b.y); c.lineTo(b.x+(up?18:16),b.y+(up?-12:8)); c.lineTo(b.x+(up?8:6),b.y); c.closePath(); c.fill();
            g.circle(b.x, b.y, 6, '#B86020');
            c.fillStyle = '#3A2010';
            const bd = b.vx > 0 ? 1 : -1;
            c.beginPath(); c.moveTo(b.x+bd*6,b.y); c.lineTo(b.x+bd*13,b.y-2); c.lineTo(b.x+bd*13,b.y+2); c.closePath(); c.fill();
          }

          // Clapper flash
          if (S.clapActive > 0) {
            c.globalAlpha = S.clapActive * 0.28; c.fillStyle = '#FFD700'; c.fillRect(0,0,W,H); c.globalAlpha = 1;
            api.txtC('CLAPPER!', W/2, H/2-10, 13, '#FFD700', true);
          }

          // Feathers
          for (const f of S.feathers) {
            c.save(); c.translate(f.x, f.y); c.rotate(f.rot);
            c.fillStyle = '#CD7F32'; c.fillRect(-1,-7,2,14); c.fillRect(-4,-1,8,4);
            c.restore();
          }

          // Hercules (with clappers)
          drawHercules(api, Math.floor(S.heroX), H-78, S.invuln);

          // Progress bar
          g.rect(10, H-22, Math.floor((W-20)*S.survived/S.goal), 5, '#CD7F32');
          g.rectO(10, H-22, W-20, 5, '#6A4010');
          api.topBar('STYMPHALIAN BIRDS', Math.ceil(S.goal-S.survived) + 's', '#CD7F32');
          for (let i=0;i<3;i++) g.circle(15+i*20, H-32, 5, i<S.lives ? '#FF9020' : '#333');
          api.txtC(S.clapCD > 0 ? 'CLAP ' + Math.ceil(S.clapCD) + 's' : 'CLAP READY', W-48, H-30, 6, S.clapCD>0 ? '#6A4020' : '#FFD700');
        },
      },

      /* ==================================================================
       * LABOR 4 — THE AUGEAN STABLES
       * Steer the river: tap a stall to aim the water stream and clean it.
       * ================================================================== */
      {
        id: 'stables',
        name: 'AUGEAN STABLES',
        sub: '3000 CATTLE · 30 YEARS OF MUCK',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x-8, y-6, 16, 12, '#5A3A18');
          g.rect(x-6, y-4, 12, 8, '#4A7A38');
          g.circle(x-2, y-9, 3, '#21e6ff');
          g.circle(x+4, y-11, 2, '#21e6ff');
        },
        intro: [
          'King AUGEAS kept',
          '3,000 cattle — 30 years',
          'without cleaning.',
          'Divert the rivers!',
        ],
        quote: '"He diverted the Alpheus through the stables." — Diodorus Siculus',
        help: 'TAP a stall to aim the river stream at it! Clean all four in time!',
        winText: 'THE STABLES SHINE — AUGEAS STINKS OF SHAME.',
        loseText: 'THE FILTH WINS THIS TIME. TRY AGAIN.',
        init(api) {
          const S = api.state;
          S.stalls = [{ dirt: 1.0 }, { dirt: 1.0 }, { dirt: 1.0 }, { dirt: 1.0 }];
          S.aimed = 0;
          S.timer = 42;
          S.rate = 0.55;
        },
        update(api, dt) {
          const S = api.state;
          S.timer -= dt;
          if (S.timer <= 0) { api.lose(); return; }

          // Tap a stall (stall areas are in the mid-section of canvas)
          if (api.pointer.justDown) {
            const py = api.pointer.y, H = api.H;
            const stallY0 = 158, stallH = 62;
            for (let i = 0; i < 4; i++) {
              if (py >= stallY0 + i * stallH && py < stallY0 + (i+1) * stallH) {
                S.aimed = i; api.audio.sfx('blip'); break;
              }
            }
          }
          if (api.keyPressed('up')) { S.aimed = Math.max(0, S.aimed - 1); api.audio.sfx('blip'); }
          if (api.keyPressed('down')) { S.aimed = Math.min(3, S.aimed + 1); api.audio.sfx('blip'); }

          const t2 = S.stalls[S.aimed];
          if (t2.dirt > 0) {
            t2.dirt = Math.max(0, t2.dirt - S.rate * dt);
            if (t2.dirt === 0) {
              api.burst(api.W - 30, 158 + S.aimed * 62 + 30, '#21e6ff', 14);
              api.audio.sfx('coin');
              api.addScore(20);
            }
          }
          if (S.stalls.every(s => s.dirt === 0)) { api.win(); }
        },
        draw(api) {
          const { gfx: g, ctx: c, W, H, t, state: S } = api;
          c.fillStyle = '#1A0E06'; c.fillRect(0,0,W,H);
          // Wooden ceiling planks
          for (let i=0;i<6;i++) { g.rect(0, i*16, W, 14, i%2 ? '#2A1A08' : '#241608'); }
          // Stone wall
          for (let row=0;row<4;row++) {
            for (let col=0;col<8;col++) {
              const bx = col*34 + (row%2?17:0);
              c.fillStyle = row%2 ? '#2A200E' : '#241808'; c.fillRect(bx, 94+row*22, 32, 20);
            }
          }
          // River source channel (left)
          g.rect(0, 148, 26, 262, '#1A3A5A');
          c.globalAlpha = 0.75;
          for (let i=0;i<5;i++) { g.rect(4, 152+((t*38+i*30)%248), 18, 8, '#21e6ff'); }
          c.globalAlpha = 1;

          const stallY0 = 158, stallH = 62;
          for (let i=0;i<4;i++) {
            const sy = stallY0 + i * stallH, s = S.stalls[i], sel = S.aimed === i;
            g.rect(26, sy, W-34, stallH-4, sel ? '#282010' : '#1E1808');
            g.rectO(26, sy, W-34, stallH-4, sel ? '#CD7F32' : '#3A2810');
            // Dirt
            const dH = Math.floor((stallH-10) * s.dirt);
            if (dH > 0) {
              c.fillStyle = '#3A2008'; c.fillRect(28, sy+stallH-6-dH, W-38, dH);
              c.globalAlpha = 0.3;
              for (let j=0;j<3;j++) { c.fillStyle = '#6A3010'; c.beginPath(); c.arc(40+j*50, sy+stallH-12-Math.floor(dH*0.3), 6, 0, 7); c.fill(); }
              c.globalAlpha = 1;
            }
            if (s.dirt === 0) {
              c.fillStyle = '#0A2A18'; c.fillRect(28, sy+2, W-38, stallH-8);
              api.txtC('CLEAN  ✓', W/2+10, sy+stallH/2, 8, '#2A8A30');
            }
            api.txtC('STALL '+(i+1), 56, sy+stallH/2, 6, sel ? '#FFD700' : '#6A5030');
          }

          // Water stream (aimed row)
          const streamY = stallY0 + S.aimed * stallH + stallH/2 - 2;
          c.globalAlpha = 0.80;
          c.strokeStyle = '#21e6ff'; c.lineWidth = 7;
          c.setLineDash([10,5]); c.lineDashOffset = -t * 32;
          c.beginPath(); c.moveTo(26, streamY); c.lineTo(W-8, streamY); c.stroke();
          c.setLineDash([]); c.lineDashOffset = 0;
          c.globalAlpha = 1;

          // Aim arrows
          api.txtC('◀', W-14, streamY, 9, '#FFD700');

          // Timer bar
          const tp = S.timer / 42;
          g.rect(10, H-22, Math.floor((W-20)*tp), 5, tp>0.35 ? '#21e6ff' : '#FF4020');
          g.rectO(10, H-22, W-20, 5, '#1A3050');
          const clean = S.stalls.filter(s=>s.dirt===0).length;
          api.topBar('AUGEAN STABLES', clean+'/4 CLEAN', '#21e6ff');
        },
      },

      /* ==================================================================
       * LABOR 5 — CERBERUS
       * Three-head boss: tap each head while it glows red; all 3 must fall.
       * ================================================================== */
      {
        id: 'cerberus',
        name: 'CERBERUS',
        sub: 'GUARDIAN OF THE UNDERWORLD',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x-7, y-3, 6, '#5A1818');
          g.circle(x,   y-6, 7, '#6A2020');
          g.circle(x+7, y-3, 6, '#5A1818');
          g.rect(x-5, y+2, 10, 7, '#4A1818');
        },
        intro: [
          'At the gates of HADES',
          'stands three-headed',
          'CERBERUS — the final',
          'and greatest labor.',
        ],
        quote: '"Hercules wrestled Cerberus without weapons." — Apollodorus',
        help: 'TAP a glowing head before it bites! Defeat all three!',
        winText: 'CERBERUS IS BOUND — YOU STAND IN HADES AND LIVE.',
        loseText: 'THE THREE-HEADED BEAST DEVOURS YOU.',
        init(api) {
          const S = api.state;
          S.heads = [
            { id:0, hp:4, state:'idle', timer:0, x:60,  glow:0 },
            { id:1, hp:4, state:'idle', timer:0, x:135, glow:0 },
            { id:2, hp:4, state:'idle', timer:0, x:210, glow:0 },
          ];
          S.lives = 3;
          S.invuln = 0;
          S.nextAtk = 0.9;
          S.atkDelay = 2.4;
        },
        update(api, dt) {
          const S = api.state;
          if (S.invuln > 0) S.invuln -= dt;

          S.nextAtk -= dt;
          const idle = S.heads.filter(h => h.hp > 0 && h.state === 'idle');
          if (S.nextAtk <= 0 && idle.length > 0) {
            const att = idle[Math.floor(Math.random() * idle.length)];
            att.state = 'windup'; att.timer = 0; att.glow = 1;
            S.nextAtk = S.atkDelay * (0.5 + Math.random() * 0.9);
            api.audio.sfx('blip');
          }

          for (const h of S.heads) {
            if (h.hp <= 0) continue;
            h.timer += dt;
            if (h.glow > 0) h.glow = Math.max(0, h.glow - dt * 0.4);
            if (h.state === 'windup' && h.timer >= 1.1) {
              h.state = 'bite'; h.timer = 0; h.glow = 0;
            } else if (h.state === 'bite') {
              if (S.invuln <= 0) {
                S.lives--;
                S.invuln = 1.2;
                api.shake(8, 0.4); api.flash('rgba(180,20,20,.45)', 0.3); api.audio.sfx('hurt');
                if (S.lives <= 0) { api.lose(); return; }
              }
              h.state = 'idle'; h.timer = 0; h.glow = 0;
            }
          }

          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (const h of S.heads) {
              if (h.hp <= 0 || h.state !== 'windup') continue;
              const dx = px - h.x, dy = py - 202;
              if (dx*dx + dy*dy < 38*38) {
                h.hp--;
                h.state = 'idle'; h.timer = 0; h.glow = 0;
                api.burst(h.x, 202, '#FF4010', 12);
                api.shake(4, 0.2); api.audio.sfx('shoot'); api.addScore(20);
                const dead = S.heads.filter(h => h.hp <= 0).length;
                S.atkDelay = Math.max(0.8, 2.4 - dead * 0.4);
                if (S.heads.every(h => h.hp <= 0)) { api.win(); return; }
                break;
              }
            }
          }
        },
        draw(api) {
          const { gfx: g, ctx: c, W, H, t, state: S } = api;
          const sky = c.createLinearGradient(0,0,0,H);
          sky.addColorStop(0,'#0A0408'); sky.addColorStop(0.5,'#180808'); sky.addColorStop(1,'#300808');
          c.fillStyle = sky; c.fillRect(0,0,W,H);
          // River Styx
          c.fillStyle = '#0A0408'; c.fillRect(0, H-62, W, 62);
          c.globalAlpha = 0.25;
          for (let i=0;i<5;i++) { g.rect(((t*18+i*56)%(W+40))-20, H-42, 30, 2, '#6030A0'); }
          c.globalAlpha = 1;
          // Stone gate pillars
          c.fillStyle = '#180C0C'; c.fillRect(0, 80, 28, H-140); c.fillRect(W-28, 80, 28, H-140);
          c.fillRect(0, 80, W, 22);
          g.circle(14, 112, 8, '#2A1810'); g.circle(W-14, 112, 8, '#2A1810');
          // Underworld fires
          for (let i=0;i<8;i++) {
            const fx = 20+i*32, fy = H-68;
            c.globalAlpha = 0.5+0.3*Math.sin(t*7+i);
            c.fillStyle = i%2 ? '#FF4010' : '#FF8010'; c.beginPath(); c.arc(fx, fy, 6+Math.sin(t*9+i)*2, 0, 7); c.fill();
            c.globalAlpha = 1;
          }
          // Cerberus body
          const bx = W/2, bY = 290;
          c.fillStyle = '#2A0808'; c.beginPath(); c.ellipse(bx, bY, 65, 45, 0, 0, 7); c.fill();
          c.strokeStyle = '#4A1010'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(bx, bY, 65, 45, 0, 0, 7); c.stroke();
          for (const [lx,ly] of [[bx-40,bY+37],[bx-16,bY+44],[bx+16,bY+44],[bx+40,bY+37]]) {
            c.fillStyle = '#220606'; c.fillRect(lx-6, ly, 12, 24); c.fillRect(lx-8, ly+22, 16, 6);
          }
          // Serpent tail
          c.strokeStyle = '#3A0A0A'; c.lineWidth = 8;
          c.beginPath(); c.moveTo(bx+56, bY); c.bezierCurveTo(bx+88,bY-22,W-18,bY-42,W-14,bY-72); c.stroke();
          g.circle(W-14, bY-74, 7, '#3A8A20'); g.rect(W-11, bY-75, 5, 2, '#F0F0C0');

          // Three necks
          const nBaseX = [bx-40, bx, bx+40];
          for (let i=0;i<3;i++) {
            c.strokeStyle = '#2A0808'; c.lineWidth = 14;
            c.beginPath(); c.moveTo(nBaseX[i], bY-30);
            c.bezierCurveTo(nBaseX[i]-8, bY-80, S.heads[i].x-8, 162, S.heads[i].x, 202);
            c.stroke();
            c.strokeStyle = '#4A1010'; c.lineWidth = 2; c.stroke();
          }

          // Three heads
          for (const h of S.heads) {
            const hx = h.x, hy = 202;
            if (h.hp <= 0) {
              c.globalAlpha = 0.3; g.circle(hx, hy+18, 26, '#1A0404'); c.globalAlpha = 1;
              api.txtC('✕', hx, hy+19, 11, '#4A1010', true);
              continue;
            }
            const winding = h.state === 'windup';
            if (winding) {
              c.globalAlpha = 0.32+0.28*Math.sin(t*16); c.fillStyle = '#FF2020';
              c.beginPath(); c.arc(hx, hy, 38, 0, 7); c.fill(); c.globalAlpha = 1;
            }
            c.fillStyle = winding ? '#6A1010' : '#3A0A0A';
            c.beginPath(); c.arc(hx, hy, 26, 0, 7); c.fill();
            c.strokeStyle = winding ? '#FF4010' : '#5A1010'; c.lineWidth = winding ? 2.5 : 1; c.stroke();
            g.rect(hx-10, hy-9, 7, 7, '#FF2010'); g.rect(hx+3, hy-9, 7, 7, '#FF2010');
            g.rect(hx-9, hy-8, 5, 5, '#1A0A0A'); g.rect(hx+4, hy-8, 5, 5, '#1A0A0A');
            if (winding) {
              c.fillStyle = '#0A0404'; c.beginPath(); c.arc(hx, hy+9, 16, 0.1, Math.PI-0.1); c.fill();
              c.fillStyle = '#E0E0D8'; c.fillRect(hx-10, hy+11, 4, 9); c.fillRect(hx-3, hy+11, 4, 7); c.fillRect(hx+5, hy+11, 4, 9);
              api.txtC('TAP!', hx, hy-44, 8, '#FFD700', true);
            } else {
              g.rect(hx-10, hy+6, 20, 5, '#0A0404');
            }
            c.fillStyle = '#2A0606';
            c.beginPath(); c.moveTo(hx-20,hy-20); c.lineTo(hx-28,hy-38); c.lineTo(hx-10,hy-22); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(hx+20,hy-20); c.lineTo(hx+28,hy-38); c.lineTo(hx+10,hy-22); c.closePath(); c.fill();
            for (let p=0;p<4;p++) g.rect(hx-14+p*10, hy+32, 8, 4, p<h.hp ? '#FF2010' : '#2A0808');
          }

          // Hercules (small, at bottom)
          drawHercules(api, W/2, H-78, S.invuln);

          for (let i=0;i<3;i++) g.circle(15+i*20, H-20, 6, i<S.lives ? '#FF4010' : '#2A0808');
          const alive = S.heads.filter(h=>h.hp>0).length;
          api.topBar('CERBERUS', alive + (alive===1?' HEAD':' HEADS') + ' REMAIN', '#FF4010');
        },
      },
    ],
  });

  /* ─── Hydra head factory ─── */
  function makeHydraHead() {
    return {
      x: 50 + Math.random() * 170,
      y: 200 + Math.random() * 80,
      timer: Math.random() * Math.PI * 2,
      bobSpd: 1.5 + Math.random() * 1.5,
      bobY: 0,
      nOff: (Math.random() - 0.5) * 30,
    };
  }
})();
