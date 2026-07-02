/* ============================================================================
 * THE WAR OF THE WORLDS — FIVE DISPATCHES FROM THE FRONT
 * Five chapters across H. G. Wells' Martian invasion:
 *   1. THE CYLINDER    — dodge the sweeping heat-ray on Horsell Common (dodge/survive)
 *   2. FLEE LONDON     — runner through the burning, panicked city (dodge runner)
 *   3. THUNDER CHILD   — man the guns as the ironclad charges tripods (aim/shoot)
 *   4. THE BLACK SMOKE — pick the open door before the gas fills the room (timing)
 *   5. THE BACTERIA    — herd survivors to safety past the falling tripods (guide)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  // tripod silhouette emblem for title / finale
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // pulsing body
    g.circle(cx, cy - 12, 14, '#330a00');
    g.circle(cx, cy - 12, 10, '#881800');
    c.globalAlpha = 0.6 + 0.35 * Math.sin(api.t * 4);
    g.circle(cx, cy - 12, 4, '#ff6600');
    c.globalAlpha = 1;
    // three legs spreading down
    c.strokeStyle = '#551500'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 3, cy - 2); c.lineTo(cx - 22, cy + 28); c.stroke();
    c.beginPath(); c.moveTo(cx, cy + 2);     c.lineTo(cx,       cy + 30); c.stroke();
    c.beginPath(); c.moveTo(cx + 3, cy - 2); c.lineTo(cx + 22,  cy + 28); c.stroke();
  }

  // smoky London backdrop for title / menu / story screens
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    // burnt sky gradient
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#050a04'); sky.addColorStop(0.5, '#101408'); sky.addColorStop(1, '#1a1006');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // drifting smoke
    c.globalAlpha = 0.12;
    c.fillStyle = '#445533';
    for (let i = 0; i < 4; i++) {
      const sx = ((t * (4 + i * 2) + i * 80) % (W + 100)) - 50;
      const sy = 18 + i * 22;
      c.beginPath(); c.ellipse(sx, sy, 52, 13, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(sx + 32, sy - 8, 34, 9, 0, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;

    // orange fire glow on horizon
    c.globalAlpha = 0.15 + 0.07 * Math.sin(t * 0.8);
    c.fillStyle = '#ff4400';
    c.fillRect(0, H - 76, W, 46);
    c.globalAlpha = 1;

    // London skyline silhouette
    c.fillStyle = '#0c0904';
    const blds = [[0,56,26],[26,40,20],[46,68,28],[74,36,17],[91,54,24],[115,32,18],[133,62,20],[153,44,22],[175,70,26],[201,38,18],[219,56,30],[249,44,21]];
    for (const [bx, bh, bw] of blds) {
      c.fillRect(bx, H - 70 - bh, bw, bh + 70);
      for (let wy = H - 62 - bh; wy < H - 72; wy += 11) {
        for (let wx = bx + 3; wx < bx + bw - 3; wx += 7) {
          if ((Math.floor(wy / 4) + Math.floor(wx / 3) + Math.floor(t * 0.03)) % 5 !== 0) {
            c.globalAlpha = 0.09 + 0.04 * Math.sin(t * 0.4 + wx);
            c.fillStyle = '#ffcc44'; c.fillRect(wx, wy, 4, 6);
            c.globalAlpha = 1;
          }
        }
      }
    }

    // distant tripod silhouette
    const tx = W - 52;
    c.fillStyle = '#0e0602';
    c.beginPath(); c.moveTo(tx, H - 138); c.lineTo(tx - 18, H - 70); c.lineTo(tx - 13, H - 70); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(tx, H - 138); c.lineTo(tx + 4,  H - 70); c.lineTo(tx + 8,  H - 70); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(tx, H - 138); c.lineTo(tx + 24, H - 70); c.lineTo(tx + 27, H - 70); c.closePath(); c.fill();
    g.circle(tx, H - 142, 13, '#0e0602');
    c.globalAlpha = 0.4 + 0.3 * Math.sin(t * 3);
    g.circle(tx, H - 142, 4, '#ff5500');
    c.globalAlpha = 1;

    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(4,8,2,.88)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // darkened backdrop for the dispatch papers
      c.fillStyle = 'rgba(8,12,6,.72)'; c.fillRect(0, 0, W, H);
      // editorial board header / footer strips
      c.fillStyle = '#1a1006'; c.fillRect(0, 0, W, 82);
      c.fillStyle = '#1a1006'; c.fillRect(0, H - 28, W, 28);
    }
  }

  // draw a single tripod at (tx,ty) with given scale
  function drawTripod(api, tx, ty, bodyR, legLen, bodyCol, glowCol, glowA) {
    const g = api.gfx, c = api.ctx;
    c.fillStyle = bodyCol || '#331100';
    c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx - legLen * 0.6, ty + legLen); c.lineTo(tx - legLen * 0.5, ty + legLen); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + legLen * 0.6, ty + legLen); c.lineTo(tx + legLen * 0.5, ty + legLen); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + 2, ty + legLen * 1.1); c.lineTo(tx + 5, ty + legLen * 1.1); c.closePath(); c.fill();
    g.circle(tx, ty, bodyR, '#441500');
    g.circle(tx, ty, bodyR - 4, '#662200');
    if (glowCol) {
      c.globalAlpha = glowA !== undefined ? glowA : 0.6;
      g.circle(tx, ty + 3, 4, glowCol);
      c.globalAlpha = 1;
    }
  }

  RetroSaga.create({
    id: 'warworlds',
    title: 'The War of the Worlds',
    subtitle: 'FIVE DISPATCHES FROM THE FRONT',
    currency: 'SURVIVORS',
    screens: {
      win: '#44ee44', lose: '#ff4400',
      chapterLabel: '#557744', name: '#88dd88',
      sub: '#44aa44', intro: '#88cc77',
      quote: '#557744', help: '#44ee44',
      score: '#88dd88', cur: '#44ee44',
      cta: '#aaddaa', overlay: 'rgba(4,8,2,.90)',
    },
    labels: {
      chapter: 'DISPATCH',
      score: 'SURVIVORS',
      win: 'HUMANITY ENDURES',
      lose: 'LONDON FALLS',
      cont: 'TAP TO ADVANCE',
      finale: 'TAP FOR THE FINAL REPORT',
      toMenu: 'TAP TO RETURN',
      play: 'TAP TO ENGAGE',
    },
    accent: '#44ee44',
    credit: 'THE WAR OF THE WORLDS · H. G. WELLS, 1898',
    bootLine: 'FIVE DISPATCHES · ONE INVASION',
    emblem,
    scenery,
    bootCta: 'TAP TO TRANSMIT',
    menuLabel: 'MARTIAL DISPATCHES',
    menuHint: 'SELECT A DISPATCH TO ENGAGE',
    menuDone: 'THE MARTIANS ARE DEFEATED',
    menu: {
      colors: { title: '#44ee44', label: '#668855', cur: '#aaddaa' },
      // scattered telegraph dispatch papers on an editorial board
      layout() {
        return [
          { x: 16,  y: 90,  w: 112, h: 76 },
          { x: 142, y: 106, w: 112, h: 76 },
          { x: 10,  y: 224, w: 112, h: 76 },
          { x: 148, y: 236, w: 108, h: 76 },
          { x: 76,  y: 360, w: 118, h: 74 },
        ];
      },
      title(api, score) {
        const g = api.gfx, c = api.ctx, W = api.W;
        g.rect(14, 18, W - 28, 58, '#cfc39a');
        g.rectO(14, 18, W - 28, 58, '#887722', 1);
        g.rect(20, 32, W - 40, 1, '#886622');
        api.txtC('— MARTIAL DISPATCHES —', W / 2, 24, 8, '#331100');
        api.txtC('SURVIVORS REACHED: ' + score, W / 2, 44, 8, '#553300');
        api.txtC('H. G. WELLS — 1898', W / 2, 62, 7, '#886633');
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        // yellowed telegraph paper
        g.rect(x, y, w, h, sel ? '#ece0b8' : '#cfc39a');
        g.rectO(x, y, w, h, sel ? '#aa8833' : '#887722', sel ? 2 : 1);
        // horizontal rules
        for (let ly = y + 24; ly < y + h - 6; ly += 9) g.rect(x + 6, ly, w - 12, 1, 'rgba(0,0,0,.07)');
        // brass tack
        g.circle(x + w / 2, y + 5, 5, '#cc8822');
        g.circle(x + w / 2, y + 5, 2, '#ffcc44');
        // dispatch header
        api.txtC('DISPATCH №' + (i + 1), x + w / 2, y + 12, 7, '#552200');
        g.rect(x + 8, y + 24, w - 16, 1, '#886622');
        // chapter name + subtitle
        api.txtCFit(ch.name, x + w / 2, y + 30, 8, done ? '#1a5511' : '#221100', false, w - 10);
        if (ch.sub) api.txtCFit(ch.sub, x + w / 2, y + 48, 7, '#664422', false, w - 10);
        // cleared stamp
        if (done) {
          c.globalAlpha = 0.78;
          g.rectO(x + 10, y + h - 22, w - 20, 14, '#1a5511', 2);
          api.txtC('✔ CLEARED', x + w / 2, y + h - 19, 7, '#1a5511');
          c.globalAlpha = 1;
        }
      },
    },
    finale: [
      'THE MARTIANS LIE DEAD.',
      'NO WEAPON OF MAN',
      'COULD STOP THEM —',
      'BUT EARTH\'S OWN BACTERIA',
      'ENDURED. SO DID YOU.',
    ],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#44ee44', blood: '#ff4400' },

    chapters: [

      /* ======================== 1. THE CYLINDER ========================= */
      {
        id: 'cylinder', name: 'THE CYLINDER', sub: 'HORSELL COMMON',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 7, '#331100');
          g.circle(x, y, 4, '#882200');
          g.circle(x, y, 1, '#ff5500');
        },
        intro: [
          'THE CYLINDER OPENS.',
          'A HEAT-RAY SWEEPS THE COMMON.',
          'The crowd stands, transfixed.',
          'Run — or burn.',
        ],
        quote: 'I saw the flash of light and all the people about me heaving and falling.',
        help: 'DODGE the heat-ray sweep · DRAG or arrow keys',
        winText: 'You flee as Horsell burns. The invasion has begun.',
        loseText: 'The heat-ray finds you in the crowd. Another casualty of the first night.',
        init(api) {
          this.px = api.W / 2;
          this.health = 3;
          this.timer = 24;
          this.rayX = 20;
          this.rayDir = 1;
          this.raySpd = 48;
          this.hitCd = 0;
          api.score = 0;
        },
        update(api, dt) {
          const f = dt * 60, W = api.W;
          this.timer -= dt;
          api.score = Math.max(0, Math.floor(this.timer * 5));
          // move ray — accelerates as time passes
          this.rayX += this.rayDir * this.raySpd * dt;
          if (this.rayX > W - 14) { this.rayX = W - 14; this.rayDir = -1; }
          if (this.rayX < 14)     { this.rayX = 14;     this.rayDir =  1; }
          this.raySpd = Math.min(150, 48 + (24 - this.timer) * 5.5);
          // player movement
          if (api.pointer.down) this.px = clamp(api.pointer.x, 14, W - 14);
          if (api.keyDown('left'))  this.px = clamp(this.px - 3 * f, 14, W - 14);
          if (api.keyDown('right')) this.px = clamp(this.px + 3 * f, 14, W - 14);
          // hit
          if (this.hitCd > 0) { this.hitCd -= dt; }
          else if (Math.abs(this.px - this.rayX) < 16) {
            this.health--;
            this.hitCd = 0.9;
            api.shake(6, 0.3); api.flash('#ff5500', 0.2); api.audio.sfx('hurt');
            if (this.health <= 0) { api.lose(); return; }
          }
          if (this.timer <= 0) { api.score += 200; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#060c06');
          // ground
          g.rect(0, H - 50, W, 50, '#1a1808');
          g.rect(0, H - 52, W, 2, '#2a2414');
          // fire glow
          c.globalAlpha = 0.22; g.rect(0, H - 110, W, 60, '#ff4400'); c.globalAlpha = 1;
          // heat-ray beam (vertical, sweeping)
          const grd = c.createLinearGradient(this.rayX - 22, 0, this.rayX + 22, 0);
          grd.addColorStop(0,   'rgba(255,80,0,0)');
          grd.addColorStop(0.38,'rgba(255,110,0,.55)');
          grd.addColorStop(0.5, 'rgba(255,220,0,.96)');
          grd.addColorStop(0.62,'rgba(255,110,0,.55)');
          grd.addColorStop(1,   'rgba(255,80,0,0)');
          c.fillStyle = grd; c.fillRect(0, 0, W, H - 50);
          // tripod at top
          drawTripod(api, W / 2, 14, 16, 46, '#1a0800', '#ff5500', 0.55 + 0.35 * Math.sin(api.t * 7));
          // player sprite
          const hitF = this.hitCd > 0 && Math.sin(api.t * 22) > 0;
          g.sprite(['.pp.', 'pppp', '.pp.', 'p..p'], this.px - 8, H - 70, { p: hitF ? '#ff4400' : '#ccbb88' }, 4);
          // health pips
          for (let i = 0; i < 3; i++) g.circle(16 + i * 14, 22, 4, i < this.health ? '#44ee44' : '#2a2a1a');
          // survive timer bar
          g.rect(6, H - 10, W - 12, 6, '#1a2010');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 24, 0, 1), 6, '#44ee44');
          api.topBar('THE CYLINDER'); api.txt('SURVIVE', W - 80, 19, 8, '#44ee44');
          api.vignette(); api.scanlines();
        },
      },

      /* ======================== 2. FLEE LONDON ========================== */
      {
        id: 'flee', name: 'FLEE LONDON', sub: 'THE BURNING CITY',
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite(['.r.', 'rrr', '.r.', 'r.r'], x - 4, y - 7, { r: '#ccbb88' }, 3);
        },
        intro: [
          'LONDON IS IN PANIC.',
          'TRIPODS MARCH FROM THE NORTH.',
          'The roads are choked.',
          'Push through. Do not stop.',
        ],
        quote: 'The whole population of the great six-million city was stirring, slipping, running.',
        help: 'DRAG up/down to steer through the fleeing crowd',
        winText: 'You reach the outskirts. Behind you, London burns under the heat-rays.',
        loseText: 'The crowd swallows you. You cannot break free before the tripods arrive.',
        init(api) {
          this.py = api.H * 0.5;
          this.health = 3;
          this.dist = 0;
          this.need = 560;
          this.speed = 22;
          this.obs = [];
          this.spawnT = 0;
          this.hitCd = 0;
          api.score = 0;
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;
          this.dist += this.speed * dt;
          this.speed = Math.min(40, 22 + this.dist * 0.022);
          api.score = Math.floor(this.dist * 0.3);
          // player
          if (api.pointer.down) this.py = clamp(api.pointer.y, 52, H - 52);
          if (api.keyDown('up'))   this.py = clamp(this.py - 3 * f, 52, H - 52);
          if (api.keyDown('down')) this.py = clamp(this.py + 3 * f, 52, H - 52);
          // spawn obstacles
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = 0.4 + Math.random() * 0.5;
            const kinds = ['cart', 'rubble', 'person', 'person', 'person'];
            this.obs.push({
              kind: kinds[Math.floor(Math.random() * kinds.length)],
              x: W + 22,
              y: 56 + Math.random() * (H - 112),
              spd: 55 + Math.random() * 30,
            });
          }
          for (const o of this.obs) o.x -= (o.spd + this.speed) * dt;
          this.obs = this.obs.filter((o) => o.x > -32);
          // collision
          if (this.hitCd > 0) { this.hitCd -= dt; }
          else {
            for (const o of this.obs) {
              const r = o.kind === 'cart' ? 18 : 12;
              if (Math.abs(o.x - 52) < r && Math.abs(o.y - this.py) < r) {
                this.health--;
                this.hitCd = 0.9;
                api.shake(5, 0.25); api.flash('#cc4400', 0.15); api.audio.sfx('hurt');
                if (this.health <= 0) { api.lose(); return; }
                break;
              }
            }
          }
          if (this.dist >= this.need) { api.score += 200; api.win(); }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#080c06');
          // fire sky
          c.globalAlpha = 0.28; g.rect(0, 0, W, H * 0.5, '#ff4400'); c.globalAlpha = 1;
          // scrolling road
          const sc = (this.dist * 1.2) % 60;
          g.rect(0, 40, W, H - 40, '#1a1808');
          for (let y = 40 - sc; y < H; y += 60) g.rect(0, y, W, 2, '#2a2412');
          // building silhouettes at edges
          for (let i = 0; i < 5; i++) {
            const bh = 46 + (i * 37) % 50;
            g.rect(0,     H - 42 - bh - i * 3, 10, bh, '#0c0906');
            g.rect(W - 10, H - 42 - bh - i * 4, 10, bh, '#0c0906');
          }
          // obstacles
          for (const o of this.obs) {
            if (o.kind === 'cart') {
              g.rect(o.x - 16, o.y - 10, 32, 18, '#4a3010');
              g.circle(o.x - 10, o.y + 8, 6, '#2a1a08');
              g.circle(o.x + 10, o.y + 8, 6, '#2a1a08');
            } else if (o.kind === 'rubble') {
              g.rect(o.x - 10, o.y - 6, 20, 12, '#3a3020');
              g.rect(o.x - 6,  o.y - 10, 12, 6,  '#4a4030');
            } else {
              g.sprite(['.p.', 'ppp', '.p.', 'p.p'], o.x - 4, o.y - 9, { p: '#9a8855' }, 3);
            }
          }
          // player
          const hitF = this.hitCd > 0 && Math.sin(api.t * 18) > 0;
          g.sprite(['.pp.', 'pppp', '.pp.', 'p..p'], 44, this.py - 9, { p: hitF ? '#ff4400' : '#ddcc99' }, 4);
          // health pips
          for (let i = 0; i < 3; i++) g.circle(16 + i * 14, 22, 4, i < this.health ? '#44ee44' : '#2a2a1a');
          // distance bar
          g.rect(6, H - 10, W - 12, 6, '#1a2010');
          g.rect(6, H - 10, (W - 12) * clamp(this.dist / this.need, 0, 1), 6, '#44ee44');
          api.topBar('FLEE LONDON'); api.txt('DIST ' + Math.floor(this.dist), W - 92, 19, 8, '#44ee44');
          api.vignette(); api.scanlines();
        },
      },

      /* ======================== 3. THUNDER CHILD ======================== */
      {
        id: 'thunder', name: 'THUNDER CHILD', sub: 'THE IRONCLAD CHARGES',
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite(['.sss.', 'sssss', '.s.s.'], x - 7, y - 4, { s: '#224488' }, 3);
          g.rect(x + 2, y - 9, 3, 7, '#334455');
        },
        intro: [
          'THE IRONCLAD THUNDER CHILD',
          'CHARGES INTO THE TRIPODS',
          'SO THE FERRIES CAN ESCAPE.',
          'Man the guns. Make it count.',
        ],
        quote: '"Fired her guns at the Martians! Glorious! — Glorious!"',
        help: 'TAP tripods to shoot · DRAG ship (bottom) to dodge',
        winText: 'The Thunder Child rams the lead tripod. The ferries reach open sea.',
        loseText: 'The heat-ray finds the ammunition store. The Thunder Child is lost.',
        init(api) {
          this.shipX = api.W / 2;
          this.health = 3;
          this.killed = 0;
          this.need = 5;
          this.tripods = [];
          this.shots = [];
          this.rays = [];
          this.spawnT = 0.6;
          this.timer = 40;
          this.hitCd = 0;
          api.score = 0;
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;
          this.timer -= dt;
          if (this.timer <= 0) { api.lose(); return; }
          api.score = this.killed * 40;
          const seaY = Math.floor(H * 0.52);
          // ship movement (bottom zone)
          if (api.pointer.down && api.pointer.y > seaY)
            this.shipX = clamp(api.pointer.x, 26, W - 26);
          if (api.keyDown('left'))  this.shipX = clamp(this.shipX - 3 * f, 26, W - 26);
          if (api.keyDown('right')) this.shipX = clamp(this.shipX + 3 * f, 26, W - 26);
          // spawn tripods
          this.spawnT -= dt;
          if (this.spawnT <= 0 && this.tripods.length < 3) {
            this.spawnT = 2.6 + Math.random() * 1.8;
            this.tripods.push({
              x: 32 + Math.random() * (W - 64),
              y: 50 + Math.random() * 80,
              hp: 2,
              shootT: 2.4 + Math.random() * 2,
              dead: false,
            });
          }
          // tripods fire
          for (const t of this.tripods) {
            if (t.dead) continue;
            t.shootT -= dt;
            if (t.shootT <= 0) {
              t.shootT = 2.4 + Math.random() * 2;
              this.rays.push({ x: t.x, y: t.y + 18, vy: 290, life: 0.6 });
              api.audio.sfx('shoot');
            }
          }
          // update rays + shots
          for (const r of this.rays) { r.y += r.vy * dt; r.life -= dt; }
          this.rays = this.rays.filter((r) => r.life > 0);
          for (const s of this.shots) s.y -= 400 * dt;
          this.shots = this.shots.filter((s) => s.y > 28 && !s.dead);
          // shot hits tripod
          for (const s of this.shots) {
            for (const t of this.tripods) {
              if (t.dead || s.dead) continue;
              if (Math.abs(s.x - t.x) < 22 && Math.abs(s.y - t.y) < 22) {
                t.hp--; s.dead = true;
                api.burst(t.x, t.y, '#ff8833', 8); api.audio.sfx('power');
                if (t.hp <= 0) {
                  t.dead = true; this.killed++;
                  api.burst(t.x, t.y, '#ff5500', 16); api.audio.sfx('explode'); api.shake(5, 0.25);
                  if (this.killed >= this.need) { api.score += 200; api.win(); return; }
                }
                break;
              }
            }
          }
          this.tripods = this.tripods.filter((t) => !t.dead);
          // ray hits ship
          const shipY = H - 80;
          if (this.hitCd > 0) { this.hitCd -= dt; }
          else {
            for (const r of this.rays) {
              if (Math.abs(r.x - this.shipX) < 22 && r.y > shipY - 10) {
                this.health--;
                this.hitCd = 1.0;
                api.shake(6, 0.3); api.flash('#ff5500', 0.25); api.audio.sfx('hurt');
                if (this.health <= 0) { api.lose(); return; }
                break;
              }
            }
          }
          // tap top half = shoot
          if (api.pointer.justDown && api.pointer.y < seaY) {
            this.shots.push({ x: this.shipX, y: shipY - 8, dead: false });
            api.audio.sfx('blip');
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#06080e');
          const seaY = Math.floor(H * 0.52);
          // stormy sky
          g.rect(0, 0, W, seaY, '#0a0e1a');
          for (let i = 0; i < 5; i++) {
            c.globalAlpha = 0.08;
            c.fillStyle = '#334455';
            c.beginPath(); c.ellipse((i * 63 + api.t * 4) % W, 20 + i * 14, 40, 10, 0, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
          }
          // sea
          g.rect(0, seaY, W, H - seaY, '#08121e');
          const woff = (api.t * 12) % 40;
          for (let wx = woff; wx < W; wx += 40) g.rect(wx, seaY + 7, 20, 1, '#101c2e');
          // tripods
          for (const t of this.tripods) {
            if (t.dead) continue;
            drawTripod(api, t.x, t.y, 16, 48, '#221000', '#ff6600', 0.5 + 0.3 * Math.sin(api.t * 5));
            if (t.hp < 2) {
              c.globalAlpha = 0.55;
              g.circle(t.x, t.y, 14, '#ff5500');
              c.globalAlpha = 1;
            }
          }
          // heat rays
          for (const r of this.rays) {
            c.globalAlpha = Math.min(1, r.life * 2.2);
            g.rect(r.x - 3, r.y - 22, 6, 44, '#ff8822');
            g.rect(r.x - 1, r.y - 22, 2, 44, '#ffdd44');
            c.globalAlpha = 1;
          }
          // cannon shots
          for (const s of this.shots) {
            if (!s.dead) g.rect(s.x - 2, s.y - 6, 4, 12, '#88aaff');
          }
          // ship
          const sy = H - 80;
          const hitF = this.hitCd > 0 && Math.sin(api.t * 20) > 0;
          const sc = hitF ? '#882244' : '#334488';
          const sd = hitF ? '#882244' : '#224466';
          g.rect(this.shipX - 26, sy,      52, 16, sc);
          g.rect(this.shipX - 20, sy - 10, 40, 10, sd);
          g.rect(this.shipX - 5,  sy - 22,  10, 12, '#334455');
          g.rect(this.shipX + 6,  sy - 18,   5,  8, '#334455');
          // health pips
          for (let i = 0; i < 3; i++) g.circle(16 + i * 14, 22, 4, i < this.health ? '#44ee44' : '#2a2a1a');
          // kill counter + timer
          api.txt('SUNK ' + this.killed + '/' + this.need, W - 110, 19, 8, '#44ee44');
          g.rect(6, H - 10, W - 12, 6, '#1a2010');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 40, 0, 1), 6, '#44ee44');
          api.topBar('THUNDER CHILD'); api.vignette(); api.scanlines();
        },
      },

      /* ======================== 4. THE BLACK SMOKE ====================== */
      {
        id: 'smoke', name: 'THE BLACK SMOKE', sub: 'THE RUINED HOUSE',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x - 4, y + 2, 6, '#334433');
          g.circle(x + 4, y + 2, 7, '#334433');
          g.circle(x,     y - 3, 7, '#445544');
        },
        intro: [
          'THE MARTIANS RELEASE',
          'THE BLACK SMOKE —',
          'A DEADLY POISON GAS.',
          'Find the gap. Move fast.',
        ],
        quote: 'The black smoke rose in vast billowing clouds, smothering all life it touched.',
        help: 'TAP the OPEN door before the smoke fills the room',
        winText: 'You emerge from the ruins, gasping. The air beyond the village is clear.',
        loseText: 'The black smoke fills the last room. You collapse, choking.',
        init(api) {
          this.room = 0;
          this.need = 8;
          this.health = 3;
          this.openDoor = Math.floor(Math.random() * 3);
          this.choiceT = 0;
          this.nextRoom = false;
          this.chosen = -1;
          this.doorMax = 3.6;
          this.doorTimer = 3.6;
          api.score = 0;
        },
        update(api, dt) {
          const H = api.H, W = api.W;
          // transition delay between rooms
          if (this.choiceT > 0) {
            this.choiceT -= dt;
            if (this.choiceT <= 0 && this.nextRoom) {
              this.room++;
              if (this.room >= this.need) { api.score += 200; api.win(); return; }
              this.openDoor = Math.floor(Math.random() * 3);
              this.doorMax = Math.max(2.1, 3.6 - this.room * 0.17);
              this.doorTimer = this.doorMax;
              this.chosen = -1;
              this.nextRoom = false;
            }
            return;
          }
          // smoke timer counts down
          this.doorTimer -= dt;
          if (this.doorTimer <= 0) {
            // smoke reached you
            this.health--;
            api.shake(5, 0.3); api.flash('#334422', 0.35); api.audio.sfx('hurt');
            if (this.health <= 0) { api.lose(); return; }
            // reset room timer, slightly faster
            this.doorMax = Math.max(2.1, this.doorMax - 0.1);
            this.doorTimer = this.doorMax;
            this.openDoor = Math.floor(Math.random() * 3);
          }
          // tap a door
          if (api.pointer.justDown) {
            const doorYs = [H * 0.22, H * 0.5, H * 0.78];
            for (let d = 0; d < 3; d++) {
              const dy = doorYs[d];
              if (api.pointer.y > dy - 28 && api.pointer.y < dy + 28 &&
                  api.pointer.x > W - 62 && api.pointer.x < W - 10) {
                this.chosen = d;
                if (d === this.openDoor) {
                  api.score += 30; api.audio.sfx('coin');
                  api.burst(W - 36, dy, '#44ee44', 8);
                  this.nextRoom = true;
                } else {
                  this.health--;
                  api.shake(5, 0.3); api.flash('#334422', 0.3); api.audio.sfx('hurt');
                  if (this.health <= 0) { api.lose(); return; }
                  this.nextRoom = false;
                  // wrong choice — randomise open door again
                  this.openDoor = Math.floor(Math.random() * 3);
                  this.doorTimer = this.doorMax;
                }
                this.choiceT = 0.5;
                break;
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#080e08');
          // room walls
          g.rect(0, 0, W, H, '#0e160c');
          g.rectO(8, 42, W - 16, H - 52, '#1a2818', 2);
          g.rect(8,  42, W - 16, 3, '#2a3820');
          g.rect(8, H - 12, W - 16, 3, '#2a3820');
          // three doors on the right wall
          const doorYs = [H * 0.22, H * 0.5, H * 0.78];
          for (let d = 0; d < 3; d++) {
            const dy = doorYs[d];
            const isOpen = d === this.openDoor;
            const isChosen = d === this.chosen && this.choiceT > 0;
            const col = isOpen ? '#0a1a0a' : '#1a0a0a';
            const border = isOpen ? '#44ee44' : (isChosen ? '#ff4400' : '#773322');
            g.rect(W - 62, dy - 26, 54, 52, col);
            g.rectO(W - 62, dy - 26, 54, 52, border, 2);
            if (isOpen) {
              api.txtC('OPEN', W - 35, dy - 6, 8, '#44ee44');
            } else {
              g.rect(W - 52, dy - 16, 34, 32, '#331100');
              api.txtC('×', W - 35, dy - 8, 14, '#cc3300');
            }
          }
          // black smoke fills from left based on timer
          const smokeProgress = 1 - clamp(this.doorTimer / this.doorMax, 0, 1);
          const smokeW = smokeProgress * (W - 70);
          if (smokeW > 0) {
            c.globalAlpha = 0.78;
            c.fillStyle = '#1a2c1a';
            c.fillRect(8, 44, smokeW, H - 56);
            c.globalAlpha = 1;
            // wisps at the smoke edge
            for (let i = 0; i < 5; i++) {
              c.globalAlpha = 0.22;
              c.fillStyle = '#3a5a3a';
              c.beginPath();
              c.ellipse(8 + smokeW + (i * 7 % 16), 52 + i * ((H - 60) / 5), 14, 8, 0, 0, Math.PI * 2);
              c.fill(); c.globalAlpha = 1;
            }
          }
          // HUD
          api.topBar('THE BLACK SMOKE');
          api.txt('ROOM ' + (this.room + 1) + '/' + this.need, 18, 19, 8, '#44ee44');
          for (let i = 0; i < 3; i++) g.circle(W - 50 + i * 14, 22, 4, i < this.health ? '#44ee44' : '#2a2a1a');
          // countdown bar
          g.rect(6, H - 10, W - 12, 6, '#1a2010');
          g.rect(6, H - 10, (W - 12) * clamp(this.doorTimer / this.doorMax, 0, 1), 6, '#44ee44');
          api.vignette(); api.scanlines();
        },
      },

      /* ======================== 5. THE BACTERIA ========================= */
      {
        id: 'bacteria', name: 'THE BACTERIA', sub: 'THE FALL OF THE TRIPODS',
        icon(api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.strokeStyle = '#884422'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x - 10, y + 8); c.stroke();
          c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x + 10, y + 8); c.stroke();
          c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x, y + 10); c.stroke();
          g.circle(x, y - 8, 5, '#552200');
        },
        intro: [
          'THE MARTIANS HAVE FALLEN —',
          'FELLED BY EARTH\'S BACTERIA.',
          'BUT TRIPODS STILL CRASH DOWN.',
          'Lead the survivors to safety.',
        ],
        quote: 'Slain, after all man\'s efforts, by the humblest things that God has put upon this earth.',
        help: 'DRAG to lead survivors to the GREEN safe zone',
        winText: 'The last tripod crashes. The survivors are clear. England lives.',
        loseText: 'The falling tripods claim the last survivors. The roads fall silent.',
        init(api) {
          const W = api.W, H = api.H;
          this.px = W * 0.55;
          this.py = H * 0.5;
          this.survivors = [
            { x: W * 0.22, y: H * 0.24, saved: false, dead: false },
            { x: W * 0.72, y: H * 0.20, saved: false, dead: false },
            { x: W * 0.16, y: H * 0.62, saved: false, dead: false },
            { x: W * 0.78, y: H * 0.68, saved: false, dead: false },
            { x: W * 0.50, y: H * 0.34, saved: false, dead: false },
          ];
          // three tripods with staggered fall times
          this.tripods = [
            { x: W * 0.28, y: H * 0.14, fallT: 9,  fallen: false, boom: 0 },
            { x: W * 0.72, y: H * 0.11, fallT: 16, fallen: false, boom: 0 },
            { x: W * 0.50, y: H * 0.09, fallT: 24, fallen: false, boom: 0 },
          ];
          // safe zone at left edge
          this.szX = 0; this.szY = H - 76; this.szW = 54; this.szH = 72;
          this.timer = 32;
          api.score = 0;
        },
        update(api, dt) {
          const f = dt * 60, W = api.W, H = api.H;
          this.timer -= dt;
          // player
          if (api.pointer.down) {
            this.px = clamp(api.pointer.x, 10, W - 10);
            this.py = clamp(api.pointer.y, 42, H - 16);
          }
          if (api.keyDown('left'))  this.px = clamp(this.px - 3 * f, 10, W - 10);
          if (api.keyDown('right')) this.px = clamp(this.px + 3 * f, 10, W - 10);
          if (api.keyDown('up'))    this.py = clamp(this.py - 3 * f, 42, H - 16);
          if (api.keyDown('down'))  this.py = clamp(this.py + 3 * f, 42, H - 16);
          // survivors follow player
          for (const s of this.survivors) {
            if (s.saved || s.dead) continue;
            const dx = this.px - s.x, dy = this.py - s.y;
            const d = Math.hypot(dx, dy);
            if (d < 90 && d > 1) {
              const spd = 52 * dt;
              s.x += (dx / d) * spd;
              s.y += (dy / d) * spd;
            }
            // check safe zone
            if (s.x < this.szX + this.szW && s.y > this.szY) {
              s.saved = true;
              api.score += 40;
              api.audio.sfx('coin');
              api.burst(s.x, s.y, '#44ee44', 10);
            }
          }
          // tripod countdowns
          for (const t of this.tripods) {
            if (t.fallen) { t.boom = Math.max(0, t.boom - dt); continue; }
            t.fallT -= dt;
            if (t.fallT <= 0) {
              t.fallen = true; t.boom = 1.6;
              api.shake(8, 0.5); api.flash('#ff5500', 0.3); api.audio.sfx('explode');
              // crush survivors in blast radius
              for (const s of this.survivors) {
                if (!s.saved && !s.dead && Math.hypot(s.x - t.x, s.y - (t.y + 48)) < 58) {
                  s.dead = true;
                  api.burst(s.x, s.y, '#ff4400', 6);
                }
              }
            }
          }
          // win / lose checks
          const savedN = this.survivors.filter((s) => s.saved).length;
          const deadN  = this.survivors.filter((s) => s.dead).length;
          if (savedN >= 5) { api.score += Math.floor(this.timer * 5) + 200; api.win(); return; }
          if (deadN >= 5)  { api.lose(); return; }
          if (this.timer <= 0) {
            if (savedN > 0) { api.score += savedN * 40; api.win(); } else api.lose();
          }
        },
        draw(api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          api.clear('#060c06');
          // ground
          g.rect(0, H - 36, W, 36, '#101808');
          g.rect(0, H - 38, W, 2,  '#1a2412');
          // rubble
          for (let i = 0; i < 9; i++) {
            const rx = (i * 41 + 12) % (W - 20), ry = H - 46 - (i * 13) % 24;
            g.rect(rx, ry, 12 + (i % 3) * 4, 7, '#2a2010');
          }
          // safe zone
          g.rect(this.szX, this.szY, this.szW, this.szH, '#0a1e0a');
          g.rectO(this.szX, this.szY, this.szW, this.szH, '#44ee44', 2);
          api.txtC('SAFE', this.szX + this.szW / 2, this.szY + 5, 7, '#44ee44');
          // tripods
          for (const t of this.tripods) {
            if (t.fallen) {
              if (t.boom > 0) {
                c.globalAlpha = Math.min(0.8, t.boom * 0.65);
                g.circle(t.x, t.y + 50, 58, '#ff5500');
                c.globalAlpha = 1;
                // wreck
                g.rect(t.x - 22, t.y + 38, 52, 14, '#330800');
              }
              continue;
            }
            const maxT = this.tripods.indexOf(t) === 0 ? 9 : (this.tripods.indexOf(t) === 1 ? 16 : 24);
            const pct = clamp(t.fallT / maxT, 0, 1);
            const urgent = t.fallT < 4 && Math.sin(api.t * 10) > 0;
            c.globalAlpha = urgent ? 0.5 : 1;
            drawTripod(api, t.x, t.y, 14, 48, '#221000', null, 0);
            c.globalAlpha = 1;
            // countdown arc
            c.strokeStyle = pct > 0.3 ? '#44ee44' : '#ff4400';
            c.lineWidth = 2;
            c.beginPath(); c.arc(t.x, t.y - 2, 10, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2); c.stroke();
          }
          // survivors
          for (const s of this.survivors) {
            if (s.dead) continue;
            if (s.saved) {
              g.circle(s.x, s.y, 5, '#44ee44');
            } else {
              c.globalAlpha = 0.25; g.circle(s.x, s.y, 8, '#ffcc44'); c.globalAlpha = 1;
              g.circle(s.x, s.y, 5, '#ccbb88');
            }
          }
          // player leader
          c.globalAlpha = 0.28; g.circle(this.px, this.py, 10, '#88ddff'); c.globalAlpha = 1;
          g.circle(this.px, this.py, 6, '#88ddff');
          // HUD
          const savedN = this.survivors.filter((s) => s.saved).length;
          api.topBar('THE BACTERIA');
          api.txt('SAFE ' + savedN + '/5', W - 94, 19, 8, '#44ee44');
          g.rect(6, H - 10, W - 12, 6, '#1a2010');
          g.rect(6, H - 10, (W - 12) * clamp(this.timer / 32, 0, 1), 6, '#44ee44');
          api.vignette(); api.scanlines();
        },
      },

    ],
  });
})();
