/* ============================================================================
 * ZORRO — THE MARK OF ZORRO
 * Five chapters through the legend of El Zorro:
 *   1. CARVE THE MARK   — trace Zorro's blazing Z on three walls
 *   2. MIDNIGHT RIDE    — steer Tornado through the dark canyon
 *   3. BLADE OF JUSTICE — parry and counter in a sword duel
 *   4. FREE THE PEONS   — free prisoners before the guards' torches find you
 *   5. THE ALCALDE      — dodge and strike in the final showdown
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Emblem: Zorro's blazing Z ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Shadow
    c.globalAlpha = 0.35;
    g.rect(cx - 22, cy - 18, 46, 4, '#000');
    g.rect(cx + 2,  cy - 14, 4,  34, '#000');
    g.rect(cx - 24, cy + 16, 48, 4,  '#000');
    c.globalAlpha = 1;
    // Z strokes in gold
    const Z = '#d4a020';
    g.rect(cx - 22, cy - 18, 44, 4, Z);
    g.rect(cx + 18, cy - 14, 4,  10, Z);
    g.rect(cx + 8,  cy - 4,  10, 4,  Z);
    g.rect(cx - 4,  cy + 0,  12, 4,  Z);
    g.rect(cx - 16, cy + 4,  12, 4,  Z);
    g.rect(cx - 22, cy + 8,  4,  10, Z);
    g.rect(cx - 22, cy + 18, 44, 4,  Z);
    // Glint
    g.rect(cx - 20, cy - 18, 6, 2, '#f8e880');
  }

  /* ─── Scenery: California night — hacienda, hills, cactus ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    // Night sky gradient
    const sky = c.createLinearGradient(0, 0, 0, H * 0.62);
    sky.addColorStop(0, '#05080e');
    sky.addColorStop(0.5, '#0e0810');
    sky.addColorStop(1, '#1a0c08');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 48; i++) {
      const sx = (i * 61 + 13) % W;
      const sy = (i * 43 + 9) % Math.floor(H * 0.48);
      c.globalAlpha = 0.18 + 0.45 * Math.sin(t * 0.8 + i * 1.7);
      g.rect(sx, sy, i % 7 === 0 ? 2 : 1, 1, '#e8d4a0');
    }
    c.globalAlpha = 1;

    // Moon — warm gold
    g.circle(W - 52, 48, 20, '#d4a030');
    g.circle(W - 48, 43, 17, '#100808');
    g.circle(W - 50, 50, 20, '#c49020');

    // Rolling hills silhouette
    const hillY = H * 0.52;
    c.fillStyle = '#12080a';
    c.beginPath(); c.moveTo(0, H);
    c.lineTo(0, hillY + 10);
    for (let x = 0; x <= W; x += 14) {
      c.lineTo(x, hillY - 12 - ((x * 11 + 17) % 22));
    }
    c.lineTo(W, H); c.closePath(); c.fill();

    // Hacienda silhouette
    const hx = 14, hy = H * 0.52 - 46;
    c.fillStyle = '#0d0608';
    c.fillRect(hx, hy, 62, 46);
    c.fillRect(hx + 14, hy - 18, 36, 20);
    c.fillRect(hx + 22, hy - 24, 20, 8);
    // windows
    g.rect(hx + 8,  hy + 10, 12, 14, '#c49020');
    g.rect(hx + 42, hy + 10, 12, 14, '#c49020');
    g.rect(hx + 23, hy - 14, 16, 10, '#c49020');

    // Cacti
    const cacti = [[190, 0], [220, 8], [246, -4], [148, 4]];
    for (const [cx2, offset] of cacti) {
      const cy2 = hillY - 2 + offset;
      c.fillStyle = '#0d1a08';
      c.fillRect(cx2 - 4, cy2 - 30, 8, 32);
      c.fillRect(cx2 - 14, cy2 - 20, 10, 6);
      c.fillRect(cx2 + 4,  cy2 - 16, 10, 6);
    }

    // Torch glow in hacienda window
    c.globalAlpha = 0.18 + 0.10 * Math.sin(t * 3.1);
    c.fillStyle = '#e87820';
    c.beginPath(); c.ellipse(hx + 14, hy + 10, 18, 12, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;

    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(5,2,4,.72)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // Tavern wall — warm planked wood, dimmer
      const woodGrad = c.createLinearGradient(0, 0, 0, H);
      woodGrad.addColorStop(0, '#1e0c06');
      woodGrad.addColorStop(1, '#120806');
      c.fillStyle = woodGrad; c.fillRect(0, 0, W, H);
      // Wood plank lines
      c.globalAlpha = 0.12;
      c.fillStyle = '#8a5020';
      for (let py = 0; py < H; py += 38) c.fillRect(0, py, W, 2);
      for (let px = 0; px < W; px += 54) c.fillRect(px, 0, 1, H);
      c.globalAlpha = 1;
    }
  }

  /* ======================================================================
   * SAGA
   * ====================================================================== */
  RetroSaga.create({
    id: 'zorro',
    title: 'The Mark of Zorro',
    subtitle: 'FIVE TALES OF THE FOX',
    currency: 'HONOR',
    screens: {
      win:          '#d4a020',
      lose:         '#8a2010',
      chapterLabel: '#8a6030',
      name:         '#f0d890',
      sub:          '#c8102e',
      intro:        '#d8c080',
      quote:        '#8a6030',
      help:         '#d4a020',
      score:        '#f0d890',
      cur:          '#c8102e',
      cta:          '#f0d890',
      overlay:      'rgba(8,3,2,.86)',
    },
    labels: {
      chapter:  'CHAPTER',
      score:    'HONOR WON',
      win:      'THE FOX RIDES FREE',
      lose:     'THEY HAVE THE MASK',
      cont:     'TAP TO PRESS ON',
      finale:   'TAP FOR THE RECKONING',
      toMenu:   'TAP TO RETURN',
      play:     'TAP TO BEGIN',
    },
    accent:    '#d4a020',
    credit:    'A PIXEL TRIBUTE · J. McCULLEY, 1919',
    emblem,
    scenery,
    bootCta:   'TAP TO ENTER',
    bootLine:  'THE FOX STRIKES AGAIN',
    menuLabel: 'THE LEGEND OF EL ZORRO',
    menuHint:  'CHOOSE A CHAPTER',
    menuDone:  'THE Z IS WRITTEN',
    menu: {
      colors: { title: '#d4a020', label: '#8a6030', cur: '#f0d890', hint: '#7a5028' },
      /* Five WANTED POSTERS pinned to the tavern wall — 2 top, 1 center, 2 bottom */
      layout(api) {
        return [
          { x: 8,   y: 72,  w: 116, h: 118 },  // ch1: upper-left
          { x: 146, y: 65,  w: 116, h: 118 },  // ch2: upper-right
          { x: 77,  y: 192, w: 116, h: 118 },  // ch3: center
          { x: 8,   y: 322, w: 116, h: 118 },  // ch4: lower-left
          { x: 146, y: 316, w: 116, h: 118 },  // ch5: lower-right
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;

        // Slight tilt angle per poster
        const tilts = [-0.04, 0.035, -0.02, 0.05, -0.03];
        const tilt = tilts[i] || 0;

        c.save();
        c.translate(x + w / 2, y + h / 2);
        c.rotate(tilt);
        const px = -w / 2, py = -h / 2;

        // Parchment background
        c.fillStyle = sel ? '#e8d07a' : '#c8b060';
        c.fillRect(px, py, w, h);
        // Parchment texture
        c.globalAlpha = 0.10;
        c.fillStyle = '#7a4a18';
        for (let fy = 0; fy < h; fy += 6) c.fillRect(px, py + fy, w, 1);
        c.globalAlpha = 1;
        // Border
        c.strokeStyle = sel ? '#c8102e' : '#7a4a18';
        c.lineWidth = sel ? 3 : 2;
        c.strokeRect(px + 4, py + 4, w - 8, h - 8);
        c.strokeStyle = sel ? '#c8102e' : '#5a3010';
        c.lineWidth = 1;
        c.strokeRect(px + 7, py + 7, w - 14, h - 14);

        // "WANTED" header
        api.txtC('WANTED', x, py + 14, 7, '#8a1008', true);
        // Thin rule
        g.rect(px + 12, 14 + 7, w - 24, 1, '#8a1008');

        // Zorro silhouette (simple cape-and-hat pixel figure)
        const fx = 0, fy2 = py + 34;
        // Hat
        g.rect(fx - 14, fy2, 28, 4, '#1a0a04');
        g.rect(fx - 10, fy2 - 10, 20, 10, '#1a0a04');
        g.rect(fx - 12, fy2 - 12, 4, 4, '#1a0a04');
        g.rect(fx + 8,  fy2 - 12, 4, 4, '#1a0a04');
        // Mask
        g.rect(fx - 6, fy2 + 4, 12, 5, '#1a0a04');
        // Body / cape
        g.rect(fx - 8, fy2 + 9, 16, 22, '#1a0a04');
        g.rect(fx - 14, fy2 + 9, 6, 18, '#280e08');
        g.rect(fx + 8,  fy2 + 9, 6, 18, '#280e08');
        // Sword arm
        g.rect(fx + 8, fy2 + 14, 20, 3, '#8a8070');

        // Chapter label
        api.txtCFit((i + 1) + '. ' + ch.name, x, py + 82, 6, '#3a1e08', false, w - 16);
        if (ch.sub) api.txtCFit(ch.sub, x, py + 94, 5, '#5a3010', false, w - 16);

        // Tack / pin dot at top center
        g.circle(0, py + 2, 4, '#c8102e');
        g.circle(-1, py + 1, 2, '#e83020');

        // CAPTURED stamp for completed chapters
        if (done) {
          c.save();
          c.globalAlpha = 0.82;
          c.rotate(0.18);
          c.strokeStyle = '#c8102e';
          c.lineWidth = 3;
          c.strokeRect(-34, -18, 68, 36);
          c.fillStyle = '#c8102e';
          c.globalAlpha = 0.18;
          c.fillRect(-34, -18, 68, 36);
          c.globalAlpha = 0.82;
          api.txtC('JUSTICE', 0, -10, 8, '#c8102e', true);
          api.txtC('DONE', 0, 2, 8, '#c8102e', true);
          c.restore();
        }

        c.restore();
      },
    },
    finale: ['THE FOX RIDES FREE.', 'CALIFORNIA BREATHES', 'EASY TONIGHT.', '', 'DON DIEGO SMILES.'],
    width: 270, height: 480, parent: '#game',

    chapters: [
      /* ================================================================
       * 1. CARVE THE MARK — trace the Z on three walls
       * ================================================================ */
      {
        id: 'mark', name: 'CARVE THE MARK', sub: 'THE FOX LEAVES HIS SIGN',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 10, y - 8,  20, 3, '#d4a020');
          g.rect(x + 2,  y - 5,  3,  6, '#d4a020');
          g.rect(x - 4,  y + 1,  6,  3, '#d4a020');
          g.rect(x - 10, y + 4,  3,  6, '#d4a020');
          g.rect(x - 10, y + 10, 20, 3, '#d4a020');
        },
        intro: ['THREE HACIENDA WALLS.', 'THREE CHANCES TO', 'CARVE THE MARK.', 'TAP EACH POINT IN ORDER.'],
        quote: '"I am Zorro — the fox!" — Johnston McCulley, 1919',
        help: 'TAP the glowing dots in order to carve each Z. Complete 3 walls.',
        winText: 'THE Z IS WRITTEN',
        loseText: 'THE MARK IS LOST',
        init(api) {
          const s = api._zs = {
            wall: 0,        // 0-2
            step: 0,        // which waypoint we're waiting for (0-4)
            flash: 0,
            err: 0,
            done: false,
            t: 0,
            walls: 3,
          };
          // Build the 5 waypoints of a Z for a given wall index
          s.buildZ = function (wi) {
            const cx = 135, cy = 240;
            const offsets = [
              [-30, 0], [0, -20], [20, 0],
            ]; // slight variation per wall
            const ox = offsets[wi % 3][0], oy = offsets[wi % 3][1];
            return [
              { x: cx - 44 + ox, y: cy - 36 + oy },
              { x: cx + 44 + ox, y: cy - 36 + oy },
              { x: cx - 44 + ox, y: cy + 36 + oy },
              { x: cx + 44 + ox, y: cy + 36 + oy },
              { x: cx + 44 + ox, y: cy - 36 + oy },  // dummy end of first line (same as [1])
            ];
            // Z sequence: 0->1 (top), 1->2 (diagonal), 2->3 (bottom)
          };
          // The points the player must tap in order: top-left, top-right, bottom-left, bottom-right
          // Plus a "line" connecting them:
          s.sequence = [
            { x: 91, y: 204 },   // top-left
            { x: 179, y: 204 },  // top-right
            { x: 91, y: 276 },   // bottom-left
            { x: 179, y: 276 },  // bottom-right
          ];
          s.active = 0;
          s.wallsDone = 0;
          s.timeLeft = 35;
          api._zs = s;
        },
        update(api, dt) {
          const s = api._zs;
          s.t += dt;
          s.timeLeft -= dt;
          if (s.flash > 0) s.flash -= dt;
          if (s.err > 0) s.err -= dt;
          if (s.timeLeft <= 0) { api.lose(); return; }

          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            const seq = s.sequence;
            const tp = seq[s.active];
            const dist = Math.hypot(px - tp.x, py - tp.y);
            if (dist < 30) {
              s.active++;
              s.flash = 0.25;
              api.audio.sfx('coin');
              api.burst(tp.x, tp.y, '#d4a020', 8);
              if (s.active >= seq.length) {
                // Completed one Z
                s.wallsDone++;
                api.shake(6, 0.3);
                api.flash('#d4a020', 0.3);
                api.audio.sfx('win');
                if (s.wallsDone >= 3) {
                  api.win();
                } else {
                  s.active = 0;
                  s.timeLeft += 10;
                }
              }
            } else {
              // Wrong tap — flash red
              s.err = 0.4;
              api.audio.sfx('hurt');
              api.shake(3, 0.2);
            }
          }
        },
        draw(api) {
          const s = api._zs;
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Adobe wall background
          const wallGrad = c.createLinearGradient(0, 0, 0, H);
          wallGrad.addColorStop(0, '#3a1c0a');
          wallGrad.addColorStop(1, '#1e0c06');
          c.fillStyle = wallGrad; c.fillRect(0, 0, W, H);

          // Stone/adobe texture blocks
          c.globalAlpha = 0.15;
          c.fillStyle = '#7a4820';
          for (let row = 0; row < 12; row++) {
            const offset = row % 2 === 0 ? 0 : 36;
            for (let col = 0; col < 5; col++) {
              c.fillRect(col * 72 + offset - 10, row * 40 + 10, 68, 36);
            }
          }
          c.globalAlpha = 1;

          // Wall progress label
          api.txtC('WALL ' + (s.wallsDone + 1) + ' / 3', W / 2, 22, 8, '#d4a020', true);

          // Timer bar
          const tw = (s.timeLeft / 35) * (W - 40);
          g.rect(20, 44, W - 40, 8, '#3a2010');
          g.rect(20, 44, Math.max(0, tw), 8, s.timeLeft < 8 ? '#c8102e' : '#d4a020');

          // Draw Z outline (dotted lines)
          const seq = s.sequence;
          const zLines = [
            [seq[0], seq[1]],  // top
            [seq[1], seq[2]],  // diagonal
            [seq[2], seq[3]],  // bottom
          ];
          c.globalAlpha = 0.28;
          c.setLineDash([6, 6]);
          c.strokeStyle = '#c8a040';
          c.lineWidth = 3;
          for (const [a, b] of zLines) {
            c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
          }
          c.setLineDash([]);
          c.globalAlpha = 1;

          // Draw completed lines
          c.strokeStyle = '#d4a020';
          c.lineWidth = 4;
          for (let li = 0; li < zLines.length; li++) {
            if (li < Math.floor(s.active / (4 / 3))) {
              const [a, b] = zLines[li];
              c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
            }
          }
          // Partial line in progress
          if (s.active > 0 && s.active < seq.length) {
            const lineIdx = s.active <= 1 ? 0 : s.active <= 2 ? 1 : 2;
            const [la, lb] = zLines[lineIdx];
            c.globalAlpha = 0.6;
            c.beginPath(); c.moveTo(la.x, la.y); c.lineTo(lb.x, lb.y); c.stroke();
            c.globalAlpha = 1;
          }

          // Draw waypoints
          for (let pi = 0; pi < seq.length; pi++) {
            const pt = seq[pi];
            const isActive = pi === s.active;
            const isDone = pi < s.active;
            const pulse = 0.6 + 0.4 * Math.sin(s.t * 5);

            if (isDone) {
              g.circle(pt.x, pt.y, 10, '#d4a020');
              api.txtC('✓', pt.x, pt.y - 5, 8, '#1a0c04', true);
            } else if (isActive) {
              c.globalAlpha = 0.3 * pulse;
              g.circle(pt.x, pt.y, 22, '#d4a020');
              c.globalAlpha = 1;
              g.circle(pt.x, pt.y, 14, '#c8102e');
              g.circle(pt.x, pt.y, 9, '#f0d030');
              // Number label
              api.txtC('' + (pi + 1), pt.x, pt.y - 5, 9, '#1a0a04', true);
            } else {
              c.globalAlpha = 0.45;
              g.circle(pt.x, pt.y, 12, '#8a6030');
              api.txtC('' + (pi + 1), pt.x, pt.y - 5, 8, '#d8c080', true);
              c.globalAlpha = 1;
            }
          }

          // Walls completed orbs at top
          for (let wi = 0; wi < 3; wi++) {
            const wox = 105 + wi * 22;
            g.circle(wox, 70, 7, wi < s.wallsDone ? '#d4a020' : '#3a2010');
            if (wi < s.wallsDone) g.circle(wox, 70, 4, '#f0e040');
          }

          // Error flash
          if (s.err > 0) {
            c.globalAlpha = s.err * 0.35;
            c.fillStyle = '#c8102e';
            c.fillRect(0, 0, W, H);
            c.globalAlpha = 1;
          }
        },
      },

      /* ================================================================
       * 2. MIDNIGHT RIDE — steer Tornado through the dark canyon
       * ================================================================ */
      {
        id: 'ride', name: 'MIDNIGHT RIDE', sub: 'TORNADO FLIES',
        icon(api, x, y) {
          const g = api.gfx;
          // Simple horse silhouette
          g.rect(x - 12, y - 4, 24, 10, '#1a0a04');
          g.rect(x - 8,  y - 10, 8, 6, '#1a0a04');
          g.rect(x + 6,  y - 2, 8, 4, '#1a0a04');
          g.rect(x - 14, y + 4, 4, 8, '#1a0a04');
          g.rect(x + 8,  y + 4, 4, 8, '#1a0a04');
        },
        intro: ['THE CANYON IS DARK.', 'RIDE TORNADO', 'THROUGH THE NIGHT.', 'REACH THE HACIENDA.'],
        quote: '"He rides like a shadow, like the wind." — Johnston McCulley',
        help: 'DRAG or use LEFT/RIGHT arrows to steer Tornado. Dodge rocks and guards. 3 lives.',
        winText: 'TORNADO CLEARS THE CANYON',
        loseText: 'THE HORSE STUMBLES',
        init(api) {
          api._ride = {
            x: 135, y: 380,
            vx: 0,
            lives: 3,
            t: 0,
            runTime: 0,
            goalTime: 28,
            obstacles: [],
            coins: [],
            spawnTimer: 0,
            spawnRate: 1.4,
            hitCool: 0,
            score: 0,
            dust: [],
          };
        },
        update(api, dt) {
          const s = api._ride;
          s.t += dt;
          s.runTime += dt;
          if (s.hitCool > 0) s.hitCool -= dt;

          if (s.runTime >= s.goalTime) { api.win(); return; }

          // Steer
          const W = api.W;
          let dx = 0;
          if (api.pointer.down) dx = (api.pointer.x - s.x) * 0.18;
          if (api.keyDown('left'))  dx -= 3.5;
          if (api.keyDown('right')) dx += 3.5;
          s.vx = clamp(s.vx * 0.7 + dx, -5, 5);
          s.x = clamp(s.x + s.vx, 24, W - 24);

          // Dust particles
          if (Math.random() < 0.3) {
            s.dust.push({ x: s.x + (Math.random() - 0.5) * 16, y: s.y + 10, vx: (Math.random() - 0.5) * 1.5, vy: Math.random() * 0.8, life: 0.4 });
          }
          for (const d of s.dust) { d.x += d.vx; d.y += d.vy; d.life -= dt; }
          s.dust = s.dust.filter(d => d.life > 0);

          // Spawn obstacles and coins
          s.spawnTimer -= dt;
          const progress = s.runTime / s.goalTime;
          s.spawnRate = 1.4 - progress * 0.6;
          if (s.spawnTimer <= 0) {
            s.spawnTimer = s.spawnRate * (0.7 + Math.random() * 0.6);
            const type = Math.random() < 0.25 ? 'coin' : (Math.random() < 0.5 ? 'rock' : 'guard');
            const ox = 24 + Math.random() * (W - 48);
            if (type === 'coin') {
              s.coins.push({ x: ox, y: -16, vy: 180 + progress * 60 });
            } else {
              s.obstacles.push({ x: ox, y: -20, vy: 140 + progress * 80 + Math.random() * 40, type, w: type === 'rock' ? 22 : 18, h: type === 'rock' ? 16 : 26 });
            }
          }

          // Move obstacles
          for (const ob of s.obstacles) ob.y += ob.vy * dt;
          for (const co of s.coins) co.y += co.vy * dt;
          s.obstacles = s.obstacles.filter(o => o.y < api.H + 30);
          s.coins = s.coins.filter(c => c.y < api.H + 20);

          // Collision: horse bounding box
          const hx = s.x, hy = s.y;
          for (const ob of s.obstacles) {
            if (s.hitCool > 0) continue;
            if (Math.abs(ob.x - hx) < 20 && Math.abs(ob.y - hy) < 22) {
              s.lives--;
              s.hitCool = 1.5;
              api.shake(8, 0.4);
              api.flash('#c8102e', 0.3);
              api.audio.sfx('hurt');
              ob.y = 600; // remove
              if (s.lives <= 0) { api.lose(); return; }
            }
          }
          // Collect coins
          for (const co of s.coins) {
            if (Math.abs(co.x - hx) < 18 && Math.abs(co.y - hy) < 18) {
              s.score += 10;
              api.addScore(10);
              api.audio.sfx('coin');
              api.burst(co.x, co.y, '#d4a020', 6);
              co.y = 600;
            }
          }
        },
        draw(api) {
          const s = api._ride;
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Canyon night background
          c.fillStyle = '#080410'; c.fillRect(0, 0, W, H);

          // Stars
          for (let i = 0; i < 30; i++) {
            const sx = (i * 73 + 5) % W, sy = (i * 37 + 11) % (H * 0.4);
            c.globalAlpha = 0.3 + 0.4 * Math.sin(s.t * 0.9 + i);
            g.rect(sx, sy, 1, 1, '#e8d4a0');
          }
          c.globalAlpha = 1;

          // Moon
          g.circle(W - 40, 36, 16, '#d4a030');
          g.circle(W - 36, 31, 14, '#080410');
          g.circle(W - 38, 38, 16, '#c49020');

          // Canyon walls
          const wallH = H * 0.38;
          c.fillStyle = '#1a0c08';
          c.beginPath(); c.moveTo(0, 0); c.lineTo(0, wallH);
          for (let x = 0; x < 60; x += 14) c.lineTo(x, wallH - 10 - (x * 7) % 28);
          c.lineTo(60, 0); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(W, 0); c.lineTo(W, wallH);
          for (let x = W; x > W - 60; x -= 14) c.lineTo(x, wallH - 10 - ((W - x) * 9) % 22);
          c.lineTo(W - 60, 0); c.closePath(); c.fill();

          // Ground
          c.fillStyle = '#1e1008'; c.fillRect(0, H - 60, W, 60);
          // Ground texture
          c.globalAlpha = 0.2;
          for (let gx = 0; gx < W; gx += 22) {
            c.fillStyle = '#3a1e0a';
            c.fillRect(gx, H - 60, 10, 2);
          }
          c.globalAlpha = 1;

          // Scrolling path lines
          const pathOff = (s.t * 200) % 60;
          c.globalAlpha = 0.22;
          c.fillStyle = '#c8a040';
          for (let py = -60; py < H; py += 60) {
            c.fillRect(W / 2 - 2, py + pathOff - 60, 4, 30);
          }
          c.globalAlpha = 1;

          // Dust
          for (const d of s.dust) {
            c.globalAlpha = d.life * 1.5;
            g.rect(d.x, d.y, 4, 4, '#a06830');
            c.globalAlpha = 1;
          }

          // Coins
          for (const co of s.coins) {
            g.circle(co.x, co.y, 8, '#d4a020');
            g.circle(co.x, co.y, 5, '#f0d040');
            api.txtC('$', co.x, co.y - 4, 6, '#8a5010', true);
          }

          // Obstacles
          for (const ob of s.obstacles) {
            if (ob.type === 'rock') {
              g.rect(ob.x - 11, ob.y - 8, 22, 16, '#4a3820');
              g.rect(ob.x - 9,  ob.y - 6, 18, 5, '#6a5030');
              g.rect(ob.x - 6,  ob.y - 10, 12, 5, '#4a3820');
            } else {
              // Guard in sombrero
              g.rect(ob.x - 9, ob.y - 13, 18, 26, '#2a1408');
              g.rect(ob.x - 12, ob.y - 13, 24, 5, '#3a1c0a');
              g.rect(ob.x - 6, ob.y - 18, 12, 6, '#3a1c0a');
              g.rect(ob.x - 4, ob.y - 7, 8, 6, '#e8c080');
              g.rect(ob.x + 6, ob.y - 4, 12, 4, '#8a8070');
            }
          }

          // Tornado (horse) sprite — with gallop animation
          const gallop = Math.sin(s.t * 12) > 0;
          const hx = s.x, hy = s.y;
          const hitFlash = s.hitCool > 0 && Math.sin(s.t * 20) > 0;
          const bodyCol = hitFlash ? '#c8102e' : '#1a0a04';
          const riderCol = hitFlash ? '#c85030' : '#0a0810';

          // Horse body
          g.rect(hx - 18, hy - 10, 36, 18, bodyCol);
          g.rect(hx - 14, hy - 18, 14, 10, bodyCol);
          g.rect(hx - 14, hy - 22, 8, 6, bodyCol);
          // Legs (animated)
          g.rect(hx - 12, hy + 8, 6, gallop ? 12 : 8, bodyCol);
          g.rect(hx - 2,  hy + 8, 6, gallop ? 8 : 12, bodyCol);
          g.rect(hx + 6,  hy + 8, 6, gallop ? 12 : 8, bodyCol);
          g.rect(hx + 14, hy + 8, 6, gallop ? 8 : 12, bodyCol);
          // Tail
          g.rect(hx + 18, hy - 6, 6, gallop ? 16 : 10, bodyCol);
          // Zorro rider
          g.rect(hx - 10, hy - 32, 14, 14, riderCol);
          g.rect(hx - 14, hy - 36, 22, 5, riderCol);
          g.rect(hx - 16, hy - 38, 4, 4, riderCol);
          g.rect(hx + 6, hy - 38, 4, 4, riderCol);
          // Cape flowing
          g.rect(hx - 18, hy - 28, 8, 18, '#2a0808');
          g.rect(hx + 4,  hy - 28, 8, 14, '#2a0808');

          // HUD
          api.txtC('RIDE: ' + Math.ceil(s.goalTime - s.runTime) + 's', W / 2, 16, 8, '#d4a020', true);
          for (let li = 0; li < 3; li++) {
            g.rect(12 + li * 22, 14, 16, 10, li < s.lives ? '#c8102e' : '#3a1010');
          }
          g.rect(12, 10, 66, 2, '#5a1008');
        },
      },

      /* ================================================================
       * 3. BLADE OF JUSTICE — parry and counter in a sword duel
       * ================================================================ */
      {
        id: 'blade', name: 'BLADE OF JUSTICE', sub: 'STEEL MEETS STEEL',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 12, y - 2, 24, 3, '#8a8070');
          g.rect(x - 2, y - 14, 3, 28, '#8a8070');
          g.rect(x - 1, y - 14, 2, 26, '#c0c0a8');
        },
        intro: ['THE COMMANDANTE', 'BLOCKS YOUR PATH.', 'PARRY HIS BLADE,', 'THEN STRIKE BACK!'],
        quote: '"The sword is mightier than the chain." — Johnston McCulley',
        help: 'WATCH for LEFT / RIGHT / HIGH attack signals, then TAP the matching direction. Strike when you see STRIKE!',
        winText: 'THE CAPTAIN YIELDS',
        loseText: 'THE BLADE FINDS YOU',
        init(api) {
          api._duel = {
            phase: 'wait',   // wait | attack | parry | counter | flinch
            phaseT: 0,
            phaseDur: 1.4,
            attackDir: 'left',
            captainHP: 5,
            zorroHP: 3,
            t: 0,
            strikes: 0,
            msg: '',
            msgT: 0,
            combo: 0,
          };
        },
        update(api, dt) {
          const d = api._duel;
          d.t += dt;
          d.phaseT += dt;
          if (d.msgT > 0) d.msgT -= dt;

          if (d.phase === 'wait') {
            if (d.phaseT > 1.0) {
              d.phase = 'attack';
              d.phaseT = 0;
              const dirs = ['left', 'right', 'high'];
              d.attackDir = dirs[Math.floor(Math.random() * 3)];
              d.phaseDur = Math.max(0.7, 1.3 - d.strikes * 0.06);
            }
          } else if (d.phase === 'attack') {
            // Player must tap correct direction before phaseDur
            let parried = false;
            if (d.attackDir === 'left' && (api.keyPressed('left') || (api.pointer.justDown && api.pointer.x < api.W * 0.4))) parried = true;
            if (d.attackDir === 'right' && (api.keyPressed('right') || (api.pointer.justDown && api.pointer.x > api.W * 0.6))) parried = true;
            if (d.attackDir === 'high' && (api.keyPressed('up') || (api.pointer.justDown && api.pointer.y < api.H * 0.45))) parried = true;

            if (parried) {
              d.phase = 'counter';
              d.phaseT = 0;
              d.phaseDur = 0.9;
              d.msg = 'PARRY!';
              d.msgT = 0.6;
              api.audio.sfx('shoot');
              api.shake(3, 0.15);
            } else if (d.phaseT > d.phaseDur) {
              // Hit by captain
              d.zorroHP--;
              d.phase = 'flinch';
              d.phaseT = 0;
              d.phaseDur = 0.8;
              d.msg = 'HIT!';
              d.msgT = 0.6;
              api.flash('#c8102e', 0.25);
              api.audio.sfx('hurt');
              api.shake(6, 0.3);
              if (d.zorroHP <= 0) { api.lose(); return; }
            }
          } else if (d.phase === 'counter') {
            // Tap center to strike
            let struck = false;
            if (api.keyPressed('a') || api.keyPressed('start') ||
                (api.pointer.justDown && api.pointer.x > api.W * 0.35 && api.pointer.x < api.W * 0.65 && api.pointer.y > api.H * 0.35)) {
              struck = true;
            }
            if (struck) {
              d.captainHP--;
              d.strikes++;
              d.combo++;
              d.msg = d.combo > 1 ? 'COMBO x' + d.combo + '!' : 'TOUCHE!';
              d.msgT = 0.7;
              api.addScore(20 * d.combo);
              api.audio.sfx('power');
              api.burst(api.W * 0.72, api.H * 0.38, '#d4a020', 10);
              api.shake(4, 0.2);
              if (d.captainHP <= 0) { api.win(); return; }
              d.phase = 'wait';
              d.phaseT = 0;
            } else if (d.phaseT > d.phaseDur) {
              d.combo = 0;
              d.phase = 'wait';
              d.phaseT = 0;
            }
          } else if (d.phase === 'flinch') {
            d.combo = 0;
            if (d.phaseT > d.phaseDur) {
              d.phase = 'wait';
              d.phaseT = 0;
            }
          }
        },
        draw(api) {
          const d = api._duel;
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Courtyard background — warm adobe
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#1a1004');
          bg.addColorStop(1, '#0e0804');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);

          // Arch architecture
          c.fillStyle = '#2a1a08';
          c.fillRect(0, 0, 40, H);
          c.fillRect(W - 40, 0, 40, H);
          c.fillStyle = '#1e1206';
          c.beginPath(); c.arc(40, 140, 40, Math.PI * 0.5, Math.PI * 1.5); c.closePath(); c.fill();
          c.beginPath(); c.arc(W - 40, 140, 40, -Math.PI * 0.5, Math.PI * 0.5); c.closePath(); c.fill();
          // Floor
          c.fillStyle = '#2a1808'; c.fillRect(0, H - 80, W, 80);
          c.globalAlpha = 0.15;
          for (let fx = 0; fx < W; fx += 28) c.fillRect(fx, H - 80, 1, 80);
          for (let fy = H - 80; fy < H; fy += 28) c.fillRect(0, fy, W, 1);
          c.globalAlpha = 1;
          // Torches
          const torchFlicker = Math.sin(d.t * 7) * 0.08;
          c.globalAlpha = 0.35 + torchFlicker;
          c.fillStyle = '#e87820';
          c.beginPath(); c.ellipse(44, 80, 22, 32, 0, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.ellipse(W - 44, 80, 22, 32, 0, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          g.rect(40, 62, 8, 24, '#5a3010');
          g.rect(W - 48, 62, 8, 24, '#5a3010');
          g.rect(38, 56, 12, 10, '#d4a020');
          g.rect(W - 50, 56, 12, 10, '#d4a020');

          // Captain (right side)
          const captX = W * 0.72, captY = H * 0.48;
          const captFlinch = d.phase === 'flinch' && d.phaseT < 0.3;
          const captColor = d.captainHP <= 2 ? '#8a1008' : '#c8102e';
          g.rect(captX - 14, captY - 50, 28, 54, captColor);
          g.rect(captX - 10, captY - 62, 20, 14, '#1a0c04');
          g.rect(captX - 14, captY - 66, 28, 8, '#2a1408');
          g.rect(captX - 6, captY - 58, 12, 6, '#d4a020');
          g.rect(captX - 8, captY + 4, 8, 18, captColor);
          g.rect(captX + 2, captY + 4, 8, 18, captColor);
          // Captain sword
          if (d.phase === 'attack') {
            const sxt = d.attackDir === 'left' ? -36 : d.attackDir === 'right' ? 0 : 0;
            const syt = d.attackDir === 'high' ? -36 : 0;
            const prog = Math.min(1, d.phaseT / d.phaseDur);
            const sx2 = captX - 22 + sxt * prog;
            const sy2 = captY - 20 + syt * prog;
            g.rect(sx2 - 2, sy2, 4, 28, '#c0c0a8');
            g.rect(sx2 - 8, sy2 + 10, 16, 3, '#8a8070');
          } else {
            g.rect(captX - 20, captY - 20, 4, 28, '#c0c0a8');
            g.rect(captX - 26, captY - 10, 12, 3, '#8a8070');
          }
          // HP pips
          for (let i = 0; i < 5; i++) {
            g.rect(captX - 12 + i * 8, captY - 76, 6, 6, i < d.captainHP ? '#c8102e' : '#2a0808');
          }

          // Zorro (left side)
          const zx = W * 0.28, zy = H * 0.48;
          const zCol = d.zorroHP <= 0 ? '#5a1008' : '#0a0810';
          g.rect(zx - 12, zy - 48, 24, 52, zCol);
          g.rect(zx - 8,  zy - 60, 16, 14, zCol);
          g.rect(zx - 12, zy - 64, 24, 7, zCol);
          g.rect(zx - 10, zy - 56, 20, 5, '#1a1030');
          g.rect(zx - 6, zy - 54, 12, 4, zCol);
          g.rect(zx - 14, zy - 44, 6, 16, '#2a0808');
          g.rect(zx + 8, zy - 44, 6, 16, '#2a0808');
          g.rect(zx + 4, zy + 4, 8, 18, zCol);
          g.rect(zx - 12, zy + 4, 8, 18, zCol);
          // Zorro's sword
          if (d.phase === 'counter') {
            g.rect(zx + 10, zy - 28, 4, 34, '#c0c0a8');
            g.rect(zx + 4, zy - 18, 16, 3, '#8a8070');
          } else {
            g.rect(zx + 10, zy - 18, 4, 28, '#c0c0a8');
            g.rect(zx + 4, zy - 8, 16, 3, '#8a8070');
          }
          // Zorro HP pips
          for (let i = 0; i < 3; i++) {
            g.rect(zx - 14 + i * 10, zy - 74, 8, 6, i < d.zorroHP ? '#d4a020' : '#2a1a04');
          }

          // Attack signal
          if (d.phase === 'attack') {
            const prog = d.phaseT / d.phaseDur;
            const warnColor = prog > 0.6 ? '#c8102e' : '#d4a020';
            let label = d.attackDir === 'left' ? '◀ PARRY LEFT' : d.attackDir === 'right' ? 'PARRY RIGHT ▶' : '▲ PARRY HIGH';
            api.txtC(label, W / 2, H * 0.72, 8, warnColor, true);
            // Progress bar showing remaining time
            const barW = (1 - prog) * (W - 60);
            g.rect(30, H * 0.72 + 14, W - 60, 6, '#1a0a04');
            g.rect(30, H * 0.72 + 14, barW, 6, warnColor);
          } else if (d.phase === 'counter') {
            const pulse = 0.7 + 0.3 * Math.sin(d.t * 8);
            c.globalAlpha = pulse;
            api.txtC('TAP CENTER — STRIKE!', W / 2, H * 0.72, 8, '#f0d030', true);
            c.globalAlpha = 1;
          } else if (d.phase === 'wait') {
            api.txtC('GUARD YOUR GROUND...', W / 2, H * 0.72, 7, '#8a6030', true);
          } else if (d.phase === 'flinch') {
            api.txtC('HOLD FIRM!', W / 2, H * 0.72, 9, '#c8102e', true);
          }

          // Floating message
          if (d.msgT > 0) {
            c.globalAlpha = Math.min(1, d.msgT * 3);
            api.txtC(d.msg, W / 2, H * 0.6, 11, '#f0d030', true);
            c.globalAlpha = 1;
          }

          // Captain HP label
          api.txtC('CAPTAIN', captX, captY - 84, 6, '#c8102e', true);
          api.txtC('ZORRO', zx, zy - 84, 6, '#d4a020', true);
        },
      },

      /* ================================================================
       * 4. FREE THE PEONS — tap prisoners before torch beams find them
       * ================================================================ */
      {
        id: 'peons', name: 'FREE THE PEONS', sub: 'FROM TYRANNY\'S CHAINS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 10, 12, 12, '#6a4020');
          g.rect(x - 6, y - 4, 3, 4, '#c0a060');
          g.rect(x + 2,  y - 4, 3, 4, '#c0a060');
          g.rect(x - 8, y + 2, 16, 3, '#3a1a08');
        },
        intro: ['FIVE PEONS IN CHAINS.', 'FREE THEM ALL.', 'BUT THE GUARD\'S TORCH', 'MUST NOT FIND YOU.'],
        quote: '"The poor peons of California had a champion." — Johnston McCulley',
        help: 'TAP a prisoner to begin freeing them. STOP if the torch sweeps their way. Free all 5 to win.',
        winText: 'THE PEOPLE ARE FREE',
        loseText: 'THE ALCALDE WATCHES',
        init(api) {
          const W = api.W, H = api.H;
          // 5 prisoner positions
          const positions = [
            { x: 68,  y: 180 },
            { x: 200, y: 160 },
            { x: 68,  y: 290 },
            { x: 200, y: 290 },
            { x: 135, y: 235 },
          ];
          api._peons = {
            prisoners: positions.map((p, i) => ({
              x: p.x, y: p.y, freed: false, freeing: false, progress: 0,
              id: i,
            })),
            guards: [
              { x: 135, y: 80,   angle: -Math.PI / 2, speed: 0.9, dir: 1, sweep: 0.7 },
              { x: 135, y: 430,  angle: Math.PI / 2,  speed: 0.7, dir: -1, sweep: 0.7 },
            ],
            active: -1,  // which prisoner is being freed
            lives: 3,
            freed: 0,
            t: 0,
            caught: 0,
            caughtCool: 0,
          };
        },
        update(api, dt) {
          const s = api._peons;
          s.t += dt;
          if (s.caughtCool > 0) s.caughtCool -= dt;

          // Move guards
          for (const guard of s.guards) {
            guard.angle += guard.speed * guard.dir * dt;
          }

          // Torch beam intersection check
          const torchLength = 90;
          function inBeam(gd, px, py) {
            const dx = px - gd.x, dy = py - gd.y;
            const dist = Math.hypot(dx, dy);
            if (dist > torchLength) return false;
            const angle = Math.atan2(dy, dx);
            let diff = angle - gd.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            return Math.abs(diff) < gd.sweep / 2;
          }

          // Handle tap: start freeing a prisoner
          if (api.pointer.justDown && s.caughtCool <= 0) {
            const px = api.pointer.x, py = api.pointer.y;
            for (const pr of s.prisoners) {
              if (!pr.freed && Math.hypot(px - pr.x, py - pr.y) < 28) {
                s.active = pr.id;
                pr.freeing = true;
                break;
              }
            }
          }
          if (!api.pointer.down && s.active >= 0) {
            // Release — stop freeing
            const pr = s.prisoners[s.active];
            if (pr && !pr.freed) pr.freeing = false;
            s.active = -1;
          }

          // Progress freeing
          for (const pr of s.prisoners) {
            if (pr.freed) continue;
            let inAnyBeam = s.guards.some(g => inBeam(g, pr.x, pr.y));
            if (pr.freeing) {
              if (inAnyBeam) {
                // Caught!
                pr.freeing = false;
                pr.progress = Math.max(0, pr.progress - 0.3);
                s.active = -1;
                s.caughtCool = 1.2;
                s.lives--;
                api.shake(7, 0.35);
                api.flash('#c8102e', 0.3);
                api.audio.sfx('hurt');
                if (s.lives <= 0) { api.lose(); return; }
              } else {
                pr.progress += dt * 0.6;
                if (pr.progress >= 1) {
                  pr.freed = true;
                  pr.freeing = false;
                  s.freed++;
                  s.active = -1;
                  api.addScore(30);
                  api.audio.sfx('power');
                  api.burst(pr.x, pr.y, '#d4a020', 12);
                  if (s.freed >= 5) { api.win(); return; }
                }
              }
            }
          }
        },
        draw(api) {
          const s = api._peons;
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Prison courtyard — night
          c.fillStyle = '#0e0a06'; c.fillRect(0, 0, W, H);
          // Stone floor
          c.fillStyle = '#1a1208';
          c.fillRect(0, H * 0.12, W, H * 0.78);
          c.globalAlpha = 0.1;
          for (let fy = H * 0.12; fy < H * 0.9; fy += 32) {
            for (let fx = 0; fx < W; fx += 44) {
              c.fillRect(fx, fy, 40, 28, '#8a6030');
            }
          }
          c.globalAlpha = 1;
          // Wall top and bottom
          c.fillStyle = '#1e1408'; c.fillRect(0, 0, W, H * 0.12);
          c.fillStyle = '#1e1408'; c.fillRect(0, H * 0.9, W, H * 0.1);
          // Bars
          c.fillStyle = '#3a2810';
          for (let bx = 20; bx < W; bx += 30) c.fillRect(bx, 0, 4, H * 0.12);

          const torchLength = 90;

          // Draw torch beams (cone of light)
          for (const gd of s.guards) {
            c.save();
            c.translate(gd.x, gd.y);
            c.rotate(gd.angle);
            const beamGrad = c.createRadialGradient(0, 0, 4, 0, 0, torchLength);
            beamGrad.addColorStop(0, 'rgba(255,200,80,.38)');
            beamGrad.addColorStop(0.6, 'rgba(255,160,40,.14)');
            beamGrad.addColorStop(1, 'rgba(255,120,20,0)');
            c.fillStyle = beamGrad;
            c.beginPath();
            c.moveTo(0, 0);
            c.arc(0, 0, torchLength, -gd.sweep / 2, gd.sweep / 2);
            c.closePath();
            c.fill();
            c.restore();
          }

          // Guard figures
          for (const gd of s.guards) {
            g.rect(gd.x - 6, gd.y - 16, 12, 22, '#2a1a08');
            g.rect(gd.x - 8, gd.y - 20, 16, 6, '#3a2010');
            g.rect(gd.x - 5, gd.y - 14, 10, 7, '#e8c880');
            // Torch
            const tx = gd.x + Math.cos(gd.angle) * 18;
            const ty = gd.y + Math.sin(gd.angle) * 18;
            g.rect(tx - 2, ty - 2, 4, 12, '#6a3810');
            c.globalAlpha = 0.7 + 0.2 * Math.sin(s.t * 7);
            g.circle(tx, ty - 4, 6, '#e87820');
            g.circle(tx, ty - 6, 3, '#f0c040');
            c.globalAlpha = 1;
          }

          // Prisoners
          for (const pr of s.prisoners) {
            if (pr.freed) {
              // Freed: running figure
              c.globalAlpha = 0.55;
              g.rect(pr.x - 5, pr.y - 14, 10, 18, '#a07850');
              g.circle(pr.x, pr.y - 18, 6, '#c0a070');
              api.txtC('FREE!', pr.x, pr.y - 28, 7, '#d4a020', true);
              c.globalAlpha = 1;
            } else {
              // Prisoner crouched in stocks
              g.rect(pr.x - 12, pr.y + 2, 24, 6, '#4a3010');
              g.rect(pr.x - 6, pr.y - 10, 12, 14, '#8a6840');
              g.circle(pr.x, pr.y - 14, 7, '#c0a070');
              g.rect(pr.x - 5, pr.y - 18, 10, 5, '#2a1808');
              // Chain links
              g.rect(pr.x - 8, pr.y - 2, 3, 6, '#6a6860');
              g.rect(pr.x + 4, pr.y - 2, 3, 6, '#6a6860');

              // Freeing progress arc
              if (pr.freeing || pr.progress > 0) {
                c.strokeStyle = '#d4a020';
                c.lineWidth = 3;
                c.beginPath();
                c.arc(pr.x, pr.y, 22, -Math.PI / 2, -Math.PI / 2 + pr.progress * Math.PI * 2);
                c.stroke();
              }
              // Tap indicator
              if (!pr.freeing && s.caughtCool <= 0) {
                c.globalAlpha = 0.4 + 0.3 * Math.sin(s.t * 3 + pr.id);
                g.circle(pr.x, pr.y, 26, '#d4a020');
                c.globalAlpha = 1;
              }
            }
          }

          // HUD
          api.txtC('FREED: ' + s.freed + ' / 5', W / 2, 16, 8, '#d4a020', true);
          for (let li = 0; li < 3; li++) {
            g.rect(10 + li * 20, 14, 14, 10, li < s.lives ? '#c8102e' : '#2a0a04');
          }

          if (s.caughtCool > 0) {
            api.txtC('GUARD SAW YOU!', W / 2, H * 0.88, 8, '#c8102e', true);
          }
        },
      },

      /* ================================================================
       * 5. THE ALCALDE — dodge and strike in the final showdown
       * ================================================================ */
      {
        id: 'alcalde', name: 'THE ALCALDE', sub: 'FINAL RECKONING',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 10, y - 10, 20, 20, '#c8102e');
          g.rect(x - 7, y - 8, 14, 16, '#e83020');
          g.rect(x - 5, y - 10, 10, 4, '#d4a020');
          g.rect(x - 2, y - 14, 4, 6, '#d4a020');
          g.rect(x - 7, y + 6, 5, 8, '#c8102e');
          g.rect(x + 2, y + 6, 5, 8, '#c8102e');
        },
        intro: ['ALCALDE RAMON', 'STANDS BEFORE YOU.', 'DODGE HIS FURY.', 'STRIKE FOR CALIFORNIA!'],
        quote: '"I have come to unmask a tyrant." — Zorro',
        help: 'DODGE left/right by tapping that side. TAP CENTER when STRIKE! flashes. Hit the Alcalde 5 times.',
        winText: 'CALIFORNIA IS FREE',
        loseText: 'THE ALCALDE LAUGHS',
        init(api) {
          api._boss = {
            phase: 'idle',
            phaseT: 0,
            alcaldeHP: 5,
            zorroHP: 3,
            t: 0,
            strikeDir: 'left',
            zorroX: api.W / 2,
            zorroTargetX: api.W / 2,
            alcaldeAnim: 0,
            msg: '',
            msgT: 0,
            particles: [],
            idleDur: 1.2,
            hitCount: 0,
          };
        },
        update(api, dt) {
          const b = api._boss;
          b.t += dt;
          b.phaseT += dt;
          if (b.msgT > 0) b.msgT -= dt;

          // Smooth Zorro movement
          b.zorroX += (b.zorroTargetX - b.zorroX) * Math.min(1, dt * 12);

          // Particles
          for (const p of b.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
          b.particles = b.particles.filter(p => p.life > 0);

          const W = api.W;

          if (b.phase === 'idle') {
            b.idleDur = Math.max(0.7, 1.2 - b.hitCount * 0.08);
            if (b.phaseT > b.idleDur) {
              const dirs = ['left', 'right', 'center'];
              // center = overhead strike
              b.strikeDir = dirs[Math.floor(Math.random() * 3)];
              b.phase = 'telegraph';
              b.phaseT = 0;
            }
          } else if (b.phase === 'telegraph') {
            // Show telegraph for 0.85s
            if (b.phaseT > Math.max(0.55, 0.85 - b.hitCount * 0.03)) {
              b.phase = 'strike';
              b.phaseT = 0;
            }
          } else if (b.phase === 'strike') {
            // Player has 0.65s to dodge
            const dodgeWindow = Math.max(0.45, 0.65 - b.hitCount * 0.02);
            let dodged = false;
            if (b.strikeDir === 'left') {
              if (api.keyPressed('right') || (api.pointer.justDown && api.pointer.x > W * 0.6)) {
                b.zorroTargetX = W * 0.72;
                dodged = true;
              }
            } else if (b.strikeDir === 'right') {
              if (api.keyPressed('left') || (api.pointer.justDown && api.pointer.x < W * 0.4)) {
                b.zorroTargetX = W * 0.28;
                dodged = true;
              }
            } else {
              // center overhead — dodge left OR right
              if (api.keyPressed('left') || api.keyPressed('right') ||
                  (api.pointer.justDown && (api.pointer.x < W * 0.4 || api.pointer.x > W * 0.6))) {
                b.zorroTargetX = api.pointer.x < W / 2 ? W * 0.28 : W * 0.72;
                dodged = true;
              }
            }
            if (dodged) {
              b.phase = 'counter';
              b.phaseT = 0;
              b.msg = 'DODGE!';
              b.msgT = 0.5;
              api.audio.sfx('shoot');
            } else if (b.phaseT > dodgeWindow) {
              // Hit
              b.zorroHP--;
              b.zorroTargetX = W / 2;
              b.phase = 'stagger';
              b.phaseT = 0;
              b.msg = 'STRUCK!';
              b.msgT = 0.6;
              api.flash('#c8102e', 0.3);
              api.audio.sfx('hurt');
              api.shake(8, 0.4);
              if (b.zorroHP <= 0) { api.lose(); return; }
            }
          } else if (b.phase === 'counter') {
            // Tap center to counter-strike
            const strikeWindow = Math.max(0.6, 0.9 - b.hitCount * 0.03);
            let hit = false;
            if (api.keyPressed('a') || api.keyPressed('start') ||
                (api.pointer.justDown && api.pointer.x > W * 0.35 && api.pointer.x < W * 0.65)) {
              hit = true;
            }
            if (hit) {
              b.alcaldeHP--;
              b.hitCount++;
              b.msg = 'TOUCHE!';
              b.msgT = 0.7;
              api.addScore(50);
              api.audio.sfx('power');
              api.shake(5, 0.3);
              for (let pi = 0; pi < 14; pi++) {
                const angle = Math.random() * Math.PI * 2;
                b.particles.push({ x: W * 0.5, y: 200, vx: Math.cos(angle) * 80, vy: Math.sin(angle) * 80 - 20, life: 0.6, col: Math.random() < 0.5 ? '#d4a020' : '#c8102e' });
              }
              if (b.alcaldeHP <= 0) { api.win(); return; }
              b.zorroTargetX = W / 2;
              b.phase = 'idle';
              b.phaseT = 0;
            } else if (b.phaseT > strikeWindow) {
              b.zorroTargetX = W / 2;
              b.phase = 'idle';
              b.phaseT = 0;
            }
          } else if (b.phase === 'stagger') {
            if (b.phaseT > 0.7) {
              b.zorroTargetX = W / 2;
              b.phase = 'idle';
              b.phaseT = 0;
            }
          }
        },
        draw(api) {
          const b = api._boss;
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

          // Grand hall background
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#12060a');
          bg.addColorStop(1, '#0a0406');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);
          // Columns
          c.fillStyle = '#2a1412';
          c.fillRect(0, 0, 28, H);
          c.fillRect(W - 28, 0, 28, H);
          // Column details
          for (let cy2 = 30; cy2 < H - 30; cy2 += 60) {
            g.rect(2, cy2, 24, 3, '#3a1e18');
            g.rect(W - 26, cy2, 24, 3, '#3a1e18');
          }
          // Floor
          c.fillStyle = '#1a0a08'; c.fillRect(0, H - 70, W, 70);
          c.globalAlpha = 0.2;
          for (let fx = 0; fx < W; fx += 36) c.fillRect(fx, H - 70, 1, 70);
          c.globalAlpha = 1;
          // Torch glow
          const tFlicker = Math.sin(b.t * 7);
          c.globalAlpha = 0.25 + tFlicker * 0.05;
          c.fillStyle = '#e87820';
          c.beginPath(); c.ellipse(22, 60, 28, 44, 0, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.ellipse(W - 22, 60, 28, 44, 0, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          g.rect(16, 40, 12, 28, '#5a3010');
          g.rect(W - 28, 40, 12, 28, '#5a3010');
          g.rect(14, 34, 16, 10, '#d4a020');
          g.rect(W - 30, 34, 16, 10, '#d4a020');

          // Particles
          for (const p of b.particles) {
            c.globalAlpha = p.life * 1.5;
            g.rect(p.x - 3, p.y - 3, 6, 6, p.col);
            c.globalAlpha = 1;
          }

          // Alcalde — center
          const ax = W / 2, ay = H * 0.38;
          const alcStruck = b.msg === 'TOUCHE!' && b.msgT > 0.4;
          const alcCol = alcStruck ? '#e83020' : (b.alcaldeHP <= 2 ? '#8a1008' : '#c8102e');
          // Body
          g.rect(ax - 18, ay - 56, 36, 58, alcCol);
          // Epaulettes
          g.rect(ax - 22, ay - 54, 8, 6, '#d4a020');
          g.rect(ax + 14, ay - 54, 8, 6, '#d4a020');
          // Head
          g.rect(ax - 10, ay - 72, 20, 18, '#d0a870');
          // Hat
          g.rect(ax - 14, ay - 80, 28, 10, alcCol);
          g.rect(ax - 10, ay - 92, 20, 14, alcCol);
          g.rect(ax - 6, ay - 76, 12, 4, '#d4a020');
          // Sword
          if (b.phase === 'telegraph' || b.phase === 'strike') {
            const swX = b.strikeDir === 'left' ? ax - 46 : b.strikeDir === 'right' ? ax + 18 : ax - 2;
            const swY = b.strikeDir === 'center' ? ay - 88 : ay - 36;
            g.rect(swX, swY, 4, 36, '#c0c0a8');
            g.rect(swX - 8, swY + 12, 20, 4, '#8a8070');
            // Warning arrow
            const wCol = b.phase === 'strike' ? '#c8102e' : '#d4a020';
            if (b.strikeDir === 'left') api.txtC('◀ DODGE RIGHT', W / 2, H * 0.7, 7, wCol, true);
            else if (b.strikeDir === 'right') api.txtC('DODGE LEFT ▶', W / 2, H * 0.7, 7, wCol, true);
            else api.txtC('▼ DODGE EITHER SIDE', W / 2, H * 0.7, 6, wCol, true);
          } else {
            g.rect(ax + 16, ay - 36, 4, 36, '#c0c0a8');
            g.rect(ax + 8,  ay - 24, 20, 4, '#8a8070');
          }
          // HP pips
          for (let i = 0; i < 5; i++) {
            g.rect(ax - 14 + i * 8, ay - 100, 6, 6, i < b.alcaldeHP ? '#c8102e' : '#1a0404');
          }
          api.txtC('ALCALDE', ax, ay - 110, 6, '#c8102e', true);

          // Zorro (mobile — moves left/right)
          const zx = b.zorroX, zy = H * 0.72;
          const isHit = b.phase === 'stagger';
          const zBodyCol = isHit ? '#5a1008' : '#0a0810';
          g.rect(zx - 12, zy - 46, 24, 48, zBodyCol);
          g.rect(zx - 8,  zy - 58, 16, 14, zBodyCol);
          g.rect(zx - 12, zy - 62, 24, 7, zBodyCol);
          g.rect(zx - 10, zy - 54, 20, 5, '#1a1030');
          g.rect(zx - 16, zy - 42, 6, 16, '#2a0808');
          g.rect(zx + 10, zy - 42, 6, 16, '#2a0808');
          g.rect(zx + 8, zy + 2, 8, 18, zBodyCol);
          g.rect(zx - 16, zy + 2, 8, 18, zBodyCol);
          // Sword
          if (b.phase === 'counter') {
            c.globalAlpha = 0.6 + 0.4 * Math.sin(b.t * 8);
            g.rect(zx - 4, zy - 72, 4, 40, '#c0c0a8');
            g.rect(zx - 14, zy - 56, 24, 4, '#8a8070');
            c.globalAlpha = 1;
            api.txtC('TAP CENTER — STRIKE!', W / 2, H * 0.88, 7, '#f0d030', true);
          } else {
            g.rect(zx - 4, zy - 50, 4, 30, '#c0c0a8');
            g.rect(zx - 14, zy - 38, 24, 4, '#8a8070');
          }

          // Zorro HP
          for (let i = 0; i < 3; i++) {
            g.rect(10 + i * 20, H - 18, 14, 10, i < b.zorroHP ? '#d4a020' : '#2a1604');
          }
          api.txtC('ZORRO', zx, zy - 72, 6, '#d4a020', true);

          // Floating message
          if (b.msgT > 0) {
            c.globalAlpha = Math.min(1, b.msgT * 2.5);
            api.txtC(b.msg, W / 2, H * 0.56, 12, '#f0d030', true);
            c.globalAlpha = 1;
          }

          // Phase reminder HUD
          if (b.phase === 'idle') {
            api.txtC('BRACE YOURSELF...', W / 2, H * 0.88, 7, '#6a4020', true);
          }
        },
      },
    ],
  });
}());
