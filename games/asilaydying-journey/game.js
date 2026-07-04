/* ============================================================================
 * AS I LAY DYING — THE BUNDREN JOURNEY
 * Five Mississippi chapters through Faulkner's 1930 masterpiece:
 *   1. THE CROSSING   — steer the raft across the flooding Yoknapatawpha
 *   2. THE LONG ROAD  — drive the mule wagon through Mississippi dust
 *   3. THE VULTURES   — tap buzzards off Addie's coffin before they win
 *   4. BURNING BARN   — escape Gillespie's barn as Darl sets it ablaze
 *   5. JEFFERSON      — navigate town streets to reach the cemetery
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * NES-honest: flat fills + dithering, no gradients or alpha glows.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ---- NES-honest palette (snapped to NES 2C02) ---- */
  const P = {
    skyDay:    '#6888FC',
    skyNight:  '#000088',
    river:     '#0078F8',
    riverDeep: '#0000BC',
    earth:     '#503000',
    earthMid:  '#7C5810',
    earthLight:'#AC7C00',
    mud:       '#281408',
    grassDry:  '#587000',
    grassGreen:'#006800',
    wood:      '#5C3018',
    woodLight: '#7C4828',
    coffin:    '#241008',
    fire:      '#F83800',
    fireBright:'#F8B800',
    smoke:     '#7C7C7C',
    white:     '#F8F8F8',
    gold:      '#F8B800',
    amber:     '#D4A020',
    parchment: '#F0C878',
    skin:      '#F0D0B0',
    mule:      '#7C5830',
    badge:     '#D4A020',
    clothGray: '#BCBCBC',
    bldgGray:  '#9C8C84',
    darkBrown: '#281408',
    buzz:      '#000000',
    buzzWing:  '#3C2800',
    red:       '#A80020',
  };

  /* ========================= EMBLEM ========================= */
  function emblem(api, cx, cy) {
    const g = api.gfx;
    /* wagon wheels */
    g.circle(cx - 17, cy + 9, 9, P.wood);   g.circle(cx - 17, cy + 9, 4, P.coffin);
    g.circle(cx + 17, cy + 9, 9, P.wood);   g.circle(cx + 17, cy + 9, 4, P.coffin);
    /* wagon bed */
    g.rect(cx - 22, cy - 9, 44, 18, P.woodLight);
    g.rect(cx - 18, cy - 9, 4, 18, P.wood);
    g.rect(cx + 14, cy - 9, 4, 18, P.wood);
    /* coffin on wagon */
    g.rect(cx - 15, cy - 22, 30, 14, P.coffin);
    g.rect(cx - 10, cy - 28, 20, 8, P.coffin);
    /* cross */
    g.rect(cx - 1, cy - 27, 2, 18, P.earthMid);
    g.rect(cx - 6, cy - 20, 12, 2, P.earthMid);
    /* mule */
    g.rect(cx - 40, cx - cy - 2, 14, 12, P.mule);   /* intentional minor glitch in y for charm */
    g.rect(cx - 38, cy - 2, 14, 12, P.mule);
    g.rect(cx - 44, cy - 6, 8, 8, P.mule);
  }

  /* ========================= SCENERY ========================= */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      /* perspective dirt road vanishing to horizon */
      c.fillStyle = P.skyDay; c.fillRect(0, 0, W, Math.round(H * 0.46));
      c.fillStyle = P.earth;  c.fillRect(0, Math.round(H * 0.46), W, H);
      g.rect(0, Math.round(H * 0.44), W, 10, P.grassDry);
      /* road trapezoid */
      c.fillStyle = P.earthMid;
      c.beginPath();
      c.moveTo(W * 0.34, Math.round(H * 0.45));
      c.lineTo(W * 0.66, Math.round(H * 0.45));
      c.lineTo(W, H); c.lineTo(0, H);
      c.closePath(); c.fill();
      /* animated center dashes */
      for (let i = 0; i < 7; i++) {
        const fr = ((i / 7) + t * 0.045) % 1.0;
        const ry = H * 0.45 + (H - H * 0.45) * fr;
        const rw = 2 + fr * 14;
        g.rect(W / 2 - rw / 2, ry, rw, 3 + fr * 10, P.earthLight);
      }
      /* left fence posts */
      for (let i = 0; i < 6; i++) {
        const fr = i / 5;
        const fy = H * 0.45 + (H - H * 0.45) * fr;
        const fx = W * 0.34 - fr * W * 0.30;
        const fh = 6 + fr * 28;
        const fw = 2 + Math.round(fr * 2);
        g.rect(fx - fw, fy - fh, fw, fh, P.wood);
        if (i > 0) {
          const pr = (i - 1) / 5;
          const py2 = H * 0.45 + (H - H * 0.45) * pr;
          const px2 = W * 0.34 - pr * W * 0.30;
          const pfh = 6 + pr * 28;
          const lx = Math.min(fx, px2), lw2 = Math.abs(fx - px2) + fw;
          g.rect(lx, fy - fh * 0.45, lw2, 1, P.woodLight);
        }
      }
      /* right fence posts */
      for (let i = 0; i < 6; i++) {
        const fr = i / 5;
        const fy = H * 0.45 + (H - H * 0.45) * fr;
        const fx = W * 0.66 + fr * W * 0.30;
        const fh = 6 + fr * 28;
        const fw = 2 + Math.round(fr * 2);
        g.rect(fx, fy - fh, fw, fh, P.wood);
        if (i > 0) {
          const pr = (i - 1) / 5;
          const py2 = H * 0.45 + (H - H * 0.45) * pr;
          const px2 = W * 0.66 + pr * W * 0.30;
          const pfh = 6 + pr * 28;
          const lx = Math.min(fx, px2), lw2 = Math.abs(fx - px2) + fw;
          g.rect(lx, py2 - pfh * 0.45, lw2, 1, P.woodLight);
        }
      }
      /* distant horizon trees */
      for (let ti = 0; ti < 9; ti++) {
        const tx = (ti * 34 + 6) % W;
        g.rect(tx, Math.round(H * 0.34), 8, 14, P.grassGreen);
        g.rect(tx - 4, Math.round(H * 0.25), 16, 13, P.grassGreen);
      }
      /* tiny wagon silhouette on road */
      const wx = W / 2 + Math.sin(t * 0.35) * 6;
      const wy = Math.round(H * 0.51);
      g.rect(wx - 9, wy - 3, 18, 8, P.darkBrown);
      g.circle(wx - 6, wy + 5, 3, P.wood);
      g.circle(wx + 6, wy + 5, 3, P.wood);
      return;
    }

    /* all other scenes — Mississippi flatland */
    const night = scene === 'intro' || scene === 'result' || scene === 'finale';
    c.fillStyle = night ? P.skyNight : P.skyDay;
    c.fillRect(0, 0, W, H);
    g.rect(0, Math.round(H * 0.44), W, 10, P.grassDry);
    g.rect(0, Math.round(H * 0.44) + 10, W, H, P.earth);
    /* horizon trees */
    for (let tx = 0; tx < W + 20; tx += 24) {
      const th = 18 + ((tx * 7 + 13) % 16);
      g.rect(tx - 2, Math.round(H * 0.44) - th, 10, th, P.grassGreen);
      g.rect(tx, Math.round(H * 0.44) - th - 8, 6, 9, P.grassGreen);
    }
    /* flat NES clouds */
    for (let ci = 0; ci < 3; ci++) {
      const cx2 = ((t * 10 + ci * 97) % (W + 72)) - 36;
      const cy2 = 14 + ci * 22;
      g.rect(cx2, cy2, 54, 10, P.white);
      g.rect(cx2 + 8, cy2 - 8, 34, 10, P.white);
    }
    /* dither horizon blend */
    for (let x = 0; x < W; x += 2) g.rect(x, Math.round(H * 0.42), 1, 6, P.grassDry);
    if (night) { c.fillStyle = 'rgba(0,0,0,.74)'; c.fillRect(0, 0, W, H); }
  }

  /* ====================== CHAPTER ICONS ====================== */
  function iconCrossing(api, x, y) {
    const g = api.gfx;
    g.rect(x - 13, y + 1, 26, 8, P.river);
    g.rect(x - 9, y - 4, 7, 6, P.river);
    g.rect(x + 2, y - 2, 7, 4, P.river);
    g.rect(x - 11, y - 1, 22, 5, P.wood); /* raft */
  }
  function iconRoad(api, x, y) {
    const g = api.gfx;
    g.rect(x - 14, y + 1, 28, 12, P.earthMid);
    g.rect(x - 2, y + 4, 4, 6, P.earthLight);
    g.circle(x - 9, y + 12, 4, P.wood);
    g.circle(x + 9, y + 12, 4, P.wood);
  }
  function iconVultures(api, x, y) {
    const g = api.gfx;
    g.rect(x - 11, y + 3, 22, 10, P.coffin);
    g.rect(x - 7, y - 2, 14, 6, P.coffin);
    g.rect(x - 2, y - 12, 4, 9, P.buzz);
    g.rect(x - 15, y - 7, 13, 4, P.buzz);
    g.rect(x + 2, y - 7, 13, 4, P.buzz);
  }
  function iconFire(api, x, y) {
    const g = api.gfx;
    g.rect(x - 13, y - 2, 26, 14, P.wood);
    g.rect(x - 7, y - 14, 14, 14, P.fire);
    g.rect(x - 3, y - 20, 6, 8, P.fireBright);
  }
  function iconJefferson(api, x, y) {
    const g = api.gfx;
    g.rect(x - 2, y - 15, 4, 20, P.smoke);
    g.rect(x - 9, y - 8, 18, 3, P.smoke);
    g.rect(x - 15, y + 5, 30, 8, P.earthMid);
  }

  /* ======================== MENU (ROAD SIGNS) ======================== */
  const MENU = {
    colors: { title: P.amber, label: P.parchment, cur: P.fireBright, done: '#58D854', locked: P.smoke },
    layout(api) {
      /* zigzag road signs — left / right alternating, Jefferson at bottom center */
      return [
        { x: 10,  y: 74,  w: 118, h: 70 },
        { x: 142, y: 156, w: 118, h: 70 },
        { x: 10,  y: 244, w: 118, h: 70 },
        { x: 142, y: 326, w: 118, h: 70 },
        { x: 55,  y: 404, w: 160, h: 66 },
      ];
    },
    card(api, info) {
      const g = api.gfx, c = api.ctx;
      const { ch, i, x, y, w, h, sel, done } = info;
      const cx = x + w / 2, cy = y + h / 2;
      /* post */
      g.rect(cx - 3, y + h - 2, 6, 22, P.wood);
      /* shadow board */
      g.rect(x + 5, y + 5, w - 8, h - 8, P.darkBrown);
      /* sign face */
      const bg = sel ? P.amber : done ? '#3A5020' : P.woodLight;
      const bdr = sel ? P.fireBright : done ? '#58D854' : P.wood;
      g.rect(x + 2, y + 2, w - 8, h - 8, bg);
      g.rectO(x + 2, y + 2, w - 8, h - 8, bdr, sel ? 2 : 1);
      /* bolt corners */
      for (const [bx2, by2] of [[x+7,y+7],[x+w-13,y+7],[x+7,y+h-13],[x+w-13,y+h-13]])
        g.circle(bx2, by2, 3, sel ? P.gold : P.wood);
      /* icon */
      const icons = [iconCrossing, iconRoad, iconVultures, iconFire, iconJefferson];
      if (icons[i]) icons[i](api, cx - 3, cy - 10);
      /* label */
      api.txtCFit(ch.name, cx - 3, cy + 16, 6, sel ? P.darkBrown : P.parchment, true, w - 18);
      if (done) {
        c.fillStyle = 'rgba(0,70,0,.42)'; c.fillRect(x + 2, y + 2, w - 8, h - 8);
        api.txtCFit('DONE', cx - 3, cy, 9, '#58D854', true);
      }
    },
  };

  /* ====================== SCREENS & LABELS ====================== */
  const SCREENS = {
    win:          P.grassDry,
    lose:         P.earthMid,
    chapterLabel: P.amber,
    name:         P.parchment,
    sub:          P.gold,
    intro:        P.parchment,
    quote:        P.amber,
    help:         P.white,
    score:        P.gold,
    cur:          P.amber,
    cta:          P.fireBright,
    overlay:      'rgba(16,8,2,.88)',
  };

  const LABELS = {
    chapter: 'CHAPTER',
    score:   'MILES EARNED',
    win:     'The road holds',
    lose:    'The road takes you',
    cont:    'KEEP MOVING',
    finale:  'TAP TO REST',
    toMenu:  'BACK TO THE ROAD',
    play:    'HIT THE ROAD',
  };

  /* ========================= CHAPTERS ========================= */

  /* -------- 1. THE CROSSING — steer raft, dodge debris -------- */
  const chCrossing = {
    id: 'crossing', name: 'THE CROSSING', sub: 'Ford the flooding Yoknapatawpha',
    icon: iconCrossing,
    intro: [
      'THE BRIDGE IS OUT.',
      'Three days of rain.',
      'Anse will not be turned back.',
      'The Yoknapatawpha rages.',
    ],
    quote: '"It was the bridge. The river was up." — Faulkner',
    help: 'Steer LEFT / RIGHT. Dodge logs and debris crossing the flooding river.',
    winText: 'We reach the far bank. The coffin is safe. On to Jefferson.',
    loseText: 'The flooding river takes the wagon. Cash loses his tools.',
    init(api) {
      this.raftX = api.W / 2;
      this.raftVx = 0;
      this.progress = 0;
      this.hp = 3;
      this.debris = [];
      this.spawnT = 1.6;
      this.invT = 0;
      this.done = false;
    },
    update(api, dt) {
      if (this.done) return;
      const W = api.W, H = api.H;
      if (api.keyDown('left'))  this.raftVx -= 230 * dt;
      if (api.keyDown('right')) this.raftVx += 230 * dt;
      if (api.pointer.down) this.raftVx += (api.pointer.x - this.raftX) * 4.5 * dt;
      this.raftVx *= 0.82;
      this.raftX = clamp(this.raftX + this.raftVx * dt, 22, W - 22);
      /* advance crossing progress (~22 seconds at constant rate) */
      this.progress = clamp(this.progress + dt * 0.046, 0, 1);
      if (this.progress >= 1) { this.done = true; api.win(); return; }
      /* spawn debris */
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = api.rnd(0.65, 1.35);
        this.debris.push({
          x: api.rnd(14, W - 14),
          y: -22, vy: api.rnd(52, 98),
          vx: api.rnd(-22, 22),
          w: api.rnd(14, 34), h: api.rnd(7, 13),
          type: Math.floor(Math.random() * 3),
          hit: false,
        });
      }
      this.invT = Math.max(0, this.invT - dt);
      const raftY = H * 0.68;
      this.debris = this.debris.filter(d => {
        d.x += d.vx * dt; d.y += d.vy * dt;
        if (d.y > H + 30) return false;
        if (!d.hit && this.invT <= 0 &&
            Math.abs(d.x - this.raftX) < d.w / 2 + 14 &&
            Math.abs(d.y - raftY) < d.h / 2 + 12) {
          d.hit = true; this.hp--;
          this.invT = 1.1;
          api.shake(6, 0.3); api.flash(P.river, 0.22);
          api.burst(this.raftX, raftY, P.earth, 8);
          if (this.hp <= 0) { this.done = true; api.lose(); }
        }
        return !d.hit;
      });
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
      /* river — dithered ripple pattern */
      c.fillStyle = P.river; c.fillRect(0, 0, W, H);
      for (let ry = 0; ry < H; ry += 6)
        for (let rx = 0; rx < W; rx += 8)
          if (Math.sin(t * 2.2 + rx * 0.11 + ry * 0.09) > 0.34)
            g.rect(rx, ry, 3, 3, P.riverDeep);
      /* far bank */
      g.rect(0, 0, W, 22, P.earth); g.rect(0, 14, W, 12, P.grassDry);
      /* near bank */
      g.rect(0, H - 22, W, 22, P.earth); g.rect(0, H - 30, W, 12, P.grassDry);
      /* debris */
      for (const d of this.debris) {
        const col = d.type === 0 ? P.woodLight : d.type === 1 ? P.wood : P.earthMid;
        g.rect(d.x - d.w / 2, d.y - d.h / 2, d.w, d.h, col);
        if (d.type === 0) g.rect(d.x - d.w / 4, d.y - 2, d.w / 2, 3, P.wood);
      }
      /* progress bar */
      const barW = 150, barX = (W - barW) / 2;
      g.rect(barX, H - 40, barW, 7, P.riverDeep);
      g.rect(barX, H - 40, Math.round(barW * this.progress), 7, P.earthLight);
      api.txtCFit('HOME', barX - 4, H - 52, 6, P.white, true, 36);
      api.txtCFit('SHORE', barX + barW + 4, H - 52, 6, P.white, true, 42);
      /* raft + coffin */
      const raftY = Math.round(H * 0.68);
      const blink = this.invT > 0 && Math.floor(t * 8) % 2 === 0;
      if (!blink) {
        g.rect(this.raftX - 26, raftY - 8, 52, 14, P.wood);
        g.rect(this.raftX - 14, raftY - 24, 28, 13, P.coffin);
        g.rect(this.raftX - 9, raftY - 30, 18, 8, P.coffin);
        g.rect(this.raftX - 1, raftY - 28, 2, 14, P.earthMid);
        g.rect(this.raftX - 5, raftY - 22, 10, 2, P.earthMid);
      }
      /* HP */
      for (let i = 0; i < 3; i++)
        g.rect(8 + i * 18, 10, 12, 12, i < this.hp ? P.fire : P.darkBrown);
      api.vignette(); api.scanlines();
    },
  };

  /* -------- 2. THE LONG ROAD — side-scroll wagon dodge -------- */
  const chRoad = {
    id: 'road', name: 'THE LONG ROAD', sub: 'Nine days through Mississippi',
    icon: iconRoad,
    intro: [
      'NINE DAYS ON THE ROAD.',
      'The mules pull through dust.',
      'Buzzards circle overhead.',
      'Every mile, a battle.',
    ],
    quote: '"My mother is a fish." — Vardaman',
    help: 'Steer the wagon UP / DOWN. Dodge potholes, rocks, and fallen branches.',
    winText: 'Miles behind us now. Jefferson lies ahead on the horizon.',
    loseText: 'The wagon breaks down. The mules sit down in the road.',
    init(api) {
      this.wagY = api.H / 2;
      this.wagVy = 0;
      this.progress = 0;
      this.hp = 3;
      this.obs = [];
      this.spawnT = 1.8;
      this.invT = 0;
      this.spd = 62;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      if (api.keyDown('up'))   this.wagVy -= 240 * dt;
      if (api.keyDown('down')) this.wagVy += 240 * dt;
      if (api.pointer.down) this.wagVy += (api.pointer.y - this.wagY) * 4.5 * dt;
      this.wagVy *= 0.80;
      this.wagY = clamp(this.wagY + this.wagVy * dt, H * 0.14, H * 0.82);
      /* advance progress — ~23 seconds to complete */
      this.spd = Math.min(this.spd + dt * 4.5, 108);
      this.progress = clamp(this.progress + dt * 0.043, 0, 1);
      if (this.progress >= 1) { api.win(); return; }
      /* spawn obstacles */
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = api.rnd(0.85, 1.9);
        const kind = Math.floor(Math.random() * 3);
        this.obs.push({
          x: W + 22,
          y: H * 0.13 + Math.random() * (H * 0.70),
          w: kind === 0 ? 26 : kind === 1 ? 13 : 38,
          h: kind === 0 ? 14 : kind === 1 ? 12 : 7,
          kind, hit: false,
        });
      }
      this.invT = Math.max(0, this.invT - dt);
      const wagX = Math.round(W * 0.28);
      this.obs = this.obs.filter(o => {
        o.x -= this.spd * dt;
        if (o.x < -44) return false;
        if (!o.hit && this.invT <= 0 &&
            Math.abs(o.x - wagX) < o.w / 2 + 14 &&
            Math.abs(o.y - this.wagY) < o.h / 2 + 14) {
          o.hit = true; this.hp--;
          this.invT = 1.1;
          api.shake(6, 0.3); api.flash(P.earth, 0.22);
          api.burst(wagX, this.wagY, P.earthMid, 8);
          if (this.hp <= 0) { api.lose(); }
        }
        return !o.hit;
      });
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
      const wagX = Math.round(W * 0.28);
      /* sky strip */
      g.rect(0, 0, W, Math.round(H * 0.13), P.skyDay);
      /* grass shoulders */
      g.rect(0, Math.round(H * 0.09), W, 10, P.grassDry);
      g.rect(0, Math.round(H * 0.89), W, H, P.grassDry);
      /* road surface */
      g.rect(0, Math.round(H * 0.12), W, Math.round(H * 0.78), P.earthMid);
      /* scrolling center dashes */
      const dashO = (t * this.spd * 0.7) % 40;
      for (let dx = -dashO; dx < W + 40; dx += 40)
        g.rect(dx, Math.round(H * 0.5) - 3, 24, 4, P.earthLight);
      /* distant trees scrolling */
      for (let ti = 0; ti < 5; ti++) {
        const tx = ((ti * 62 + t * 14) % (W + 40)) - 20;
        g.rect(tx, Math.round(H * 0.04), 8, 16, P.grassGreen);
        g.rect(tx - 6, Math.round(H * 0), 20, 12, P.grassGreen);
      }
      /* obstacles */
      for (const o of this.obs) {
        const col = o.kind === 0 ? P.mud : o.kind === 1 ? P.smoke : P.wood;
        g.rect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h, col);
        if (o.kind === 0) g.rect(o.x - o.w/2 + 4, o.y - o.h/2 + 3, o.w - 8, o.h - 6, P.darkBrown);
      }
      /* wagon */
      const blink = this.invT > 0 && Math.floor(t * 8) % 2 === 0;
      if (!blink) {
        g.circle(wagX - 17, this.wagY + 13, 9, P.wood);
        g.circle(wagX - 17, this.wagY + 13, 4, P.darkBrown);
        g.circle(wagX + 17, this.wagY + 13, 9, P.wood);
        g.circle(wagX + 17, this.wagY + 13, 4, P.darkBrown);
        g.rect(wagX - 22, this.wagY - 8, 44, 18, P.woodLight);
        g.rect(wagX - 16, this.wagY - 22, 32, 16, P.coffin);
        g.rect(wagX - 10, this.wagY - 29, 20, 9, P.coffin);
        g.rect(wagX - 1, this.wagY - 27, 2, 18, P.earthMid);
        g.rect(wagX - 5, this.wagY - 20, 10, 2, P.earthMid);
        g.rect(wagX - 38, this.wagY - 2, 16, 12, P.mule);
        g.rect(wagX - 44, this.wagY - 6, 8, 8, P.mule);
      }
      /* progress bar */
      const barW = W - 44;
      g.rect(22, 8, barW, 7, P.darkBrown);
      g.rect(22, 8, Math.round(barW * this.progress), 7, P.earthLight);
      api.txtCFit('JEFFERSON', 22 + barW + 4, 10, 6, P.amber, false, 72);
      /* HP */
      for (let i = 0; i < 3; i++)
        g.rect(8 + i * 18, H - 30, 12, 12, i < this.hp ? P.fire : P.darkBrown);
      api.vignette(); api.scanlines();
    },
  };

  /* -------- 3. THE VULTURES — tap buzzards off the coffin -------- */
  const chVultures = {
    id: 'vultures', name: 'THE VULTURES', sub: "Keep the buzzards off Addie",
    icon: iconVultures,
    intro: [
      'THE BODY HAS BEEN',
      'IN THE SUN FOR DAYS.',
      'The smell draws vultures',
      'from miles around.',
    ],
    quote: '"Jewel, it\'s the buzzards." — Darl',
    help: "TAP the buzzards to swat them away. Don't let THREE settle on the coffin at once!",
    winText: "We drive them off. The neighbors stop talking. We press on.",
    loseText: "The birds have won the day. Even the mules look disgusted.",
    init(api) {
      this.timer = 28.0;
      this.buzzards = [];
      this.spawnT = 1.7;
      this.shame = 0;
      this.done = false;
    },
    update(api, dt) {
      if (this.done) return;
      const W = api.W, H = api.H;
      this.timer -= dt;
      if (this.timer <= 0) { this.done = true; api.win(); return; }
      /* spawn buzzards */
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = api.rnd(0.9, 2.0);
        const angle = api.rnd(0, Math.PI * 2);
        const r = 115;
        this.buzzards.push({
          x: W / 2 + Math.cos(angle) * r,
          y: H * 0.42 + Math.sin(angle) * 64,
          tx: W / 2 + api.rnd(-28, 28),
          ty: H * 0.60 + api.rnd(-10, 14),
          phase: 'flying', landT: 0, hit: false,
        });
      }
      /* update buzzards */
      let landed = 0;
      this.buzzards = this.buzzards.filter(b => {
        if (b.hit) return false;
        if (b.phase === 'flying') {
          const dx = b.tx - b.x, dy = b.ty - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 7) { b.phase = 'landed'; }
          else { const s = 56; b.x += dx / d * s * dt; b.y += dy / d * s * dt; }
        } else if (b.phase === 'landed') {
          landed++;
          b.landT += dt;
          if (b.landT > 5.0) b.phase = 'leaving';
        } else {
          b.y -= 42 * dt;
          if (b.y < -32) return false;
        }
        return true;
      });
      this.shame = landed;
      if (this.shame >= 3) { this.done = true; api.lose(); return; }
      /* tap detection */
      if (api.pointer.justDown) {
        const px = api.pointer.x, py = api.pointer.y;
        for (const b of this.buzzards) {
          if (b.hit) continue;
          if (Math.sqrt((b.x - px) ** 2 + (b.y - py) ** 2) < 24) {
            b.hit = true;
            api.burst(b.x, b.y, P.buzz, 6);
            api.audio.sfx('hurt');
            break;
          }
        }
      }
      api.addScore(this.shame === 0 ? 1 : 0);
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
      /* dusty farmyard */
      g.rect(0, 0, W, Math.round(H * 0.52), P.skyDay);
      g.rect(0, Math.round(H * 0.52), W, H, P.earth);
      /* farmhouse backdrop */
      g.rect(14, Math.round(H * 0.26), 58, 50, P.bldgGray);
      g.rect(12, Math.round(H * 0.19), 62, 14, P.smoke);
      g.rect(34, Math.round(H * 0.30), 16, 30, P.woodLight);
      /* tree */
      g.rect(W - 38, Math.round(H * 0.30), 10, 38, P.wood);
      g.rect(W - 54, Math.round(H * 0.16), 40, 30, P.grassGreen);
      /* coffin on sawhorses */
      const cofX = W / 2, cofY = Math.round(H * 0.62);
      g.rect(cofX - 10, cofY + 12, 4, 20, P.wood);
      g.rect(cofX + 6, cofY + 12, 4, 20, P.wood);
      g.rect(cofX - 34, cofY - 8, 68, 22, P.coffin);
      g.rect(cofX - 26, cofY - 16, 52, 10, P.coffin);
      g.rect(cofX - 1, cofY - 14, 2, 22, P.darkBrown);
      g.rect(cofX - 7, cofY - 6, 14, 2, P.darkBrown);
      /* hot sun shimmer (dither) */
      for (let sx = 0; sx < W; sx += 6) {
        const sy = Math.round(H * 0.50) + Math.floor(Math.sin(t * 3 + sx * 0.3) * 2);
        g.rect(sx, sy, 3, 2, P.earthLight);
      }
      /* buzzards */
      for (const b of this.buzzards) {
        if (b.hit) continue;
        const flap = b.phase !== 'landed' && Math.sin(t * 9 + b.x * 0.1) > 0;
        g.rect(b.x - 7, b.y - 4, 14, 8, P.buzz);
        if (flap) {
          g.rect(b.x - 20, b.y - 2, 13, 5, P.buzz);
          g.rect(b.x + 7, b.y - 2, 13, 5, P.buzz);
        } else {
          g.rect(b.x - 24, b.y - 7, 17, 5, P.buzzWing);
          g.rect(b.x + 7, b.y - 7, 17, 5, P.buzzWing);
        }
        g.rect(b.x + 5, b.y - 7, 5, 6, P.mule);
      }
      /* timer bar */
      const fr = Math.max(0, this.timer / 28.0);
      const tW = 160, tX = (W - tW) / 2;
      g.rect(tX, 8, tW, 7, P.darkBrown);
      g.rect(tX, 8, Math.round(tW * fr), 7, fr > 0.35 ? P.grassDry : P.fire);
      /* shame indicator */
      api.txtCFit('ON COFFIN:', W / 2 - 36, H - 44, 6, P.amber, false, 76);
      for (let i = 0; i < 3; i++)
        g.rect(W / 2 + 40 + i * 16, H - 48, 12, 12, i < this.shame ? P.buzz : '#3C3C3C');
      api.vignette(); api.scanlines();
    },
  };

  /* -------- 4. BURNING BARN — dodge falling embers -------- */
  const chFire = {
    id: 'fire', name: 'BURNING BARN', sub: "Darl sets Gillespie's barn alight",
    icon: iconFire,
    intro: [
      'DARL SETS THE BARN ON FIRE.',
      'He wants to give their mother',
      'a dignified end to this',
      'mad, reckless journey.',
    ],
    quote: '"It was me that done it." — Darl',
    help: 'Move LEFT / RIGHT. Dodge the burning beams. Escape through the far door!',
    winText: "Jewel drags the coffin free on his horse. The barn collapses behind him.",
    loseText: "The smoke overcomes you. Cash's broken leg is badly burned.",
    init(api) {
      this.playerX = api.W / 2;
      this.playerVx = 0;
      this.progress = 0;
      this.hp = 3;
      this.embers = [];
      this.spawnT = 1.2;
      this.invT = 0;
      this.fireLine = 0;
      this.done = false;
    },
    update(api, dt) {
      if (this.done) return;
      const W = api.W, H = api.H;
      if (api.keyDown('left'))  this.playerVx -= 230 * dt;
      if (api.keyDown('right')) this.playerVx += 230 * dt;
      if (api.pointer.down) this.playerVx += (api.pointer.x - this.playerX) * 4.5 * dt;
      this.playerVx *= 0.80;
      this.playerX = clamp(this.playerX + this.playerVx * dt, 16, W - 16);
      /* escape progress — ~19 seconds */
      this.progress = clamp(this.progress + dt * 0.053, 0, 1);
      this.fireLine = Math.min(this.fireLine + dt * 18, H * 0.60);
      if (this.progress >= 1) { this.done = true; api.win(); return; }
      /* spawn falling embers / beams */
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = api.rnd(0.5, 1.15);
        const big = Math.random() < 0.28;
        this.embers.push({
          x: api.rnd(12, W - 12),
          y: -18, vy: api.rnd(62, 108),
          vx: api.rnd(-26, 26),
          size: big ? api.rnd(14, 22) : api.rnd(6, 11),
          big, hit: false,
        });
      }
      this.invT = Math.max(0, this.invT - dt);
      const pY = Math.round(H * 0.58);
      this.embers = this.embers.filter(e => {
        e.x += e.vx * dt; e.y += e.vy * dt;
        if (e.y > H + 22) return false;
        if (!e.hit && this.invT <= 0 &&
            Math.abs(e.x - this.playerX) < e.size / 2 + 12 &&
            Math.abs(e.y - pY) < e.size / 2 + 16) {
          e.hit = true; this.hp--;
          this.invT = 1.1;
          api.shake(7, 0.35); api.flash(P.fire, 0.28);
          api.burst(this.playerX, pY, P.fire, 12);
          if (this.hp <= 0) { this.done = true; api.lose(); }
        }
        return !e.hit;
      });
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
      /* smoky barn interior */
      c.fillStyle = '#180c04'; c.fillRect(0, 0, W, H);
      /* wood plank walls */
      for (let bx = 0; bx < W; bx += 18) {
        g.rect(bx, 0, 16, H, bx % 36 < 18 ? P.wood : P.woodLight);
        g.rect(bx + 16, 0, 2, H, P.darkBrown);
      }
      /* fire rising from bottom */
      const fH = this.fireLine;
      for (let fx = 0; fx < W; fx += 14) {
        const fl = fH + Math.sin(t * 7 + fx * 0.4) * 16;
        g.rect(fx, H - fl, 10, fl * 0.55, P.fire);
        g.rect(fx + 2, H - fl * 0.52, 6, fl * 0.52, P.fireBright);
      }
      /* smoke canopy */
      c.fillStyle = 'rgba(8,5,2,.60)'; c.fillRect(0, 0, W, Math.round(H * 0.28));
      /* embers / beams */
      for (const e of this.embers) {
        g.rect(e.x - e.size / 2, e.y - e.size / 2, e.size, e.size, e.big ? P.wood : P.fire);
        if (!e.big) g.rect(e.x - 2, e.y - 2, 4, 4, P.fireBright);
      }
      /* escape door (top center — glow from outside) */
      const doorX = W / 2 - 22;
      g.rect(doorX, 14, 44, 52, '#003800');
      g.rect(doorX + 6, 20, 14, 36, P.skyDay);
      g.rect(doorX + 24, 20, 14, 36, P.skyDay);
      c.fillStyle = `rgba(0,200,60,${0.18 + this.progress * 0.30})`;
      c.fillRect(doorX - 10, 10, 64, 60);
      /* escape progress bar */
      const bW = W - 46;
      g.rect(23, H - 46, bW, 7, '#301400');
      g.rect(23, H - 46, Math.round(bW * this.progress), 7, '#00B800');
      api.txtCFit('ESCAPE', 23, H - 58, 7, P.fireBright, false, 60);
      /* player (Jewel carrying coffin) */
      const pY = Math.round(H * 0.58);
      const blink = this.invT > 0 && Math.floor(t * 8) % 2 === 0;
      if (!blink) {
        g.rect(this.playerX - 8, pY - 22, 16, 24, P.clothGray);
        g.circle(this.playerX, pY - 26, 8, P.skin);
        g.rect(this.playerX - 11, pY + 2, 22, 8, P.coffin);
      }
      /* HP */
      for (let i = 0; i < 3; i++)
        g.rect(8 + i * 18, 8, 12, 12, i < this.hp ? P.fire : P.darkBrown);
      api.vignette(); api.scanlines();
    },
  };

  /* -------- 5. JEFFERSON — navigate town to the cemetery -------- */
  const chJefferson = {
    id: 'jefferson', name: 'JEFFERSON', sub: 'Find the cemetery before it\'s too late',
    icon: iconJefferson,
    intro: [
      'JEFFERSON, MISSISSIPPI.',
      'Ten days after Addie died.',
      'The sheriff\'s men are watching.',
      'Anse needs new teeth.',
    ],
    quote: '"She is my cross and she will be my salvation." — Anse',
    help: 'STEER the wagon to the cemetery gate. Watch out for the sheriff!',
    winText: "Addie Bundren rests at last in Jefferson soil. Anse eyes the dentist's office.",
    loseText: "Caught by the law. Darl is taken to the asylum in Jackson.",
    init(api) {
      const W = api.W, H = api.H;
      this.wagX = W / 2;
      this.wagY = H * 0.82;
      this.wagVx = 0;
      this.wagVy = 0;
      this.timer = 36.0;
      /* cemetery goal — top center */
      this.goalX = W / 2;
      this.goalY = H * 0.10;
      /* sheriffs start off left/right */
      this.sheriffs = [
        { x: W * 0.08, y: H * 0.35 },
        { x: W * 0.92, y: H * 0.55 },
      ];
      this.shSpeed = 34;
      /* buildings — leave corridors on x≈72 and x≈196 */
      this.buildings = [
        { x: 10,  y: 62,  w: 58, h: 60 },  /* upper left  (right edge x=68) */
        { x: 202, y: 54,  w: 58, h: 70 },  /* upper right (left  edge x=202) */
        { x: 10,  y: 206, w: 52, h: 66 },  /* lower left  (right edge x=62) */
        { x: 208, y: 192, w: 52, h: 68 },  /* lower right (left  edge x=208) */
        { x: 90,  y: 300, w: 90, h: 54 },  /* center bottom blocker */
      ];
      this.done = false;
    },
    update(api, dt) {
      if (this.done) return;
      const W = api.W, H = api.H;
      this.timer -= dt;
      if (this.timer <= 0) { this.done = true; api.lose(); return; }
      if (api.keyDown('up'))    this.wagVy -= 220 * dt;
      if (api.keyDown('down'))  this.wagVy += 220 * dt;
      if (api.keyDown('left'))  this.wagVx -= 220 * dt;
      if (api.keyDown('right')) this.wagVx += 220 * dt;
      if (api.pointer.down) {
        this.wagVx += (api.pointer.x - this.wagX) * 4.2 * dt;
        this.wagVy += (api.pointer.y - this.wagY) * 4.2 * dt;
      }
      this.wagVx *= 0.78; this.wagVy *= 0.78;
      let nx = clamp(this.wagX + this.wagVx * dt, 14, W - 14);
      let ny = clamp(this.wagY + this.wagVy * dt, 14, H - 14);
      /* building collision */
      for (const b of this.buildings) {
        if (nx + 14 > b.x && nx - 14 < b.x + b.w &&
            ny + 14 > b.y && ny - 14 < b.y + b.h) {
          this.wagVx *= -0.5; this.wagVy *= -0.5;
          nx = this.wagX; ny = this.wagY;
          break;
        }
      }
      this.wagX = nx; this.wagY = ny;
      /* goal reached */
      const gd = Math.sqrt((this.wagX - this.goalX) ** 2 + (this.wagY - this.goalY) ** 2);
      if (gd < 28) { this.done = true; api.win(); return; }
      /* sheriffs pursue */
      this.shSpeed = Math.min(this.shSpeed + dt * 4.5, 70);
      for (const sh of this.sheriffs) {
        const dx = this.wagX - sh.x, dy = this.wagY - sh.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 1) { sh.x += dx / d * this.shSpeed * dt; sh.y += dy / d * this.shSpeed * dt; }
        if (d < 20) { this.done = true; api.shake(8, 0.4); api.flash('#CC2222', 0.3); api.lose(); return; }
      }
    },
    draw(api) {
      const g = api.gfx, c = api.ctx, W = api.W, H = api.H, t = api.t;
      /* town streets */
      g.rect(0, 0, W, H, P.earthMid);
      /* buildings */
      const bcols = [P.bldgGray, '#6C5844', '#8C7C6C', '#847C7C', P.smoke];
      for (let bi = 0; bi < this.buildings.length; bi++) {
        const b = this.buildings[bi];
        g.rect(b.x, b.y, b.w, b.h, bcols[bi]);
        g.rectO(b.x, b.y, b.w, b.h, P.wood, 1);
        for (let wx = b.x + 8; wx < b.x + b.w - 14; wx += 18)
          for (let wy = b.y + 8; wy < b.y + b.h - 12; wy += 18)
            g.rect(wx, wy, 10, 10, P.fireBright);
      }
      /* cemetery goal */
      const gx = this.goalX, gy = this.goalY;
      g.rect(gx - 26, gy - 14, 52, 28, '#003800');
      g.rectO(gx - 26, gy - 14, 52, 28, P.gold, 2);
      g.rect(gx - 26, gy - 20, 4, 34, P.smoke);
      g.rect(gx + 22, gy - 20, 4, 34, P.smoke);
      g.rect(gx - 2, gy - 12, 4, 20, P.smoke);
      g.rect(gx - 9, gy - 5, 18, 3, P.smoke);
      /* proximity glow */
      const gdist = Math.sqrt((this.wagX - gx) ** 2 + (this.wagY - gy) ** 2);
      if (gdist < 90) {
        c.fillStyle = `rgba(0,255,80,${0.10 + (1 - gdist / 90) * 0.20})`;
        c.fillRect(gx - 30, gy - 18, 60, 36);
      }
      /* sheriffs */
      for (const sh of this.sheriffs) {
        g.rect(sh.x - 8, sh.y - 15, 16, 20, '#C8881C');
        g.circle(sh.x, sh.y - 18, 6, P.skin);
        g.rect(sh.x - 8, sh.y - 25, 16, 8, '#C8881C');
        g.rect(sh.x - 3, sh.y - 8, 6, 5, P.badge);
      }
      /* wagon + coffin */
      g.circle(this.wagX - 14, this.wagY + 12, 7, P.wood);
      g.circle(this.wagX + 14, this.wagY + 12, 7, P.wood);
      g.rect(this.wagX - 20, this.wagY - 7, 40, 18, P.woodLight);
      g.rect(this.wagX - 14, this.wagY - 18, 28, 13, P.coffin);
      g.rect(this.wagX - 9, this.wagY - 25, 18, 8, P.coffin);
      g.rect(this.wagX - 1, this.wagY - 23, 2, 14, P.earthMid);
      g.rect(this.wagX - 5, this.wagY - 17, 10, 2, P.earthMid);
      /* timer bar */
      const tf = Math.max(0, this.timer / 36.0);
      g.rect(10, H - 28, W - 20, 6, P.darkBrown);
      g.rect(10, H - 28, Math.round((W - 20) * tf), 6, tf > 0.35 ? P.grassDry : P.fire);
      api.txtCFit('TIME', 10, H - 40, 6, P.amber, false, 40);
      api.vignette(); api.scanlines();
    },
  };

  /* ========================= SAGA BOOT ========================= */
  RetroSaga.create({
    id: 'asilaydying-journey',
    title: 'As I Lay Dying',
    subtitle: 'THE BUNDREN JOURNEY',
    currency: 'MILES',
    accent: P.amber,
    credit: 'AN 8-BIT TRIBUTE · WILLIAM FAULKNER · 1930',
    emblem, scenery,
    bootCta: 'TAP TO BEGIN THE JOURNEY',
    menuLabel: 'THE BUNDREN ROAD',
    menuHint: 'CHOOSE YOUR CHAPTER',
    menuDone: 'ADDIE RESTS',
    screens: SCREENS,
    labels: LABELS,
    menu: MENU,
    finale: [
      'ADDIE BUNDREN RESTS',
      'in Jefferson soil at last.',
      '',
      'DARL IS SENT TO JACKSON.',
      'Cash gets a gramophone.',
      'Anse has his new teeth —',
      'and already a new wife.',
      '',
      '"My mother is a fish."',
    ],
    width: 270, height: 480, parent: '#game',
    chapters: [chCrossing, chRoad, chVultures, chFire, chJefferson],
  });
})();
