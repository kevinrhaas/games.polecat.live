/* ============================================================================
 * THE ILIAD — WRATH OF ACHILLES
 * Five books of Homer's epic (c. 750 BCE):
 *   1. THE MUSTER      — tap Greek ships sailing into Aulis bay
 *   2. THE PLAIN       — steer a hoplite past Trojan spears
 *   3. HOLD THE LINE   — lane-switch to block Trojan warriors at the gates
 *   4. PATROCLUS FALLS — tap to intercept Apollo's arrows before they strike
 *   5. WRATH           — chase Hector round Troy's walls, then duel to the end
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Palette ─── */
  const C = {
    ink:    '#060a1e',
    navy:   '#0a1030',
    aegean: '#0e1a48',
    wall:   '#0c1428',
    dusk:   '#1a2448',
    bronze: '#c87a20',
    copper: '#b06a10',
    ivory:  '#f0e8d0',
    bone:   '#d8c8a0',
    slate:  '#8090b8',
    shield: '#1a3060',
    blue:   '#3a5088',
    sea:    '#4ab8e8',
    blood:  '#cc1a10',
    crimson:'#8b1a08',
    plume:  '#9b5cff',
    gold:   '#ffda60',
    green:  '#5dff8f',
    fire:   '#ff6020',
  };

  /* ─── Emblem: Corinthian helmet with horsehair crest ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Crest base bar
    g.rect(cx - 12, cy - 30, 24, 4, C.copper);
    // Horsehair plume
    for (let i = -9; i <= 9; i += 3) {
      const h = 10 - Math.abs(i) * 0.6;
      g.rect(cx + i - 1, cy - 32 - h, 2, h + 2, i % 2 === 0 ? C.blood : C.crimson);
    }
    // Helmet dome
    c.fillStyle = C.bronze;
    c.beginPath();
    c.arc(cx, cy - 10, 22, Math.PI, 0);
    c.lineTo(cx + 22, cy + 6);
    c.lineTo(cx + 14, cy + 18);
    c.lineTo(cx - 14, cy + 18);
    c.lineTo(cx - 22, cy + 6);
    c.closePath(); c.fill();
    // Highlights
    c.fillStyle = C.copper;
    c.beginPath(); c.arc(cx, cy - 10, 20, Math.PI, 0);
    c.lineTo(cx + 20, cy + 6); c.lineTo(cx - 20, cy + 6); c.closePath(); c.fill();
    // Cheek guards
    c.fillStyle = C.copper;
    c.fillRect(cx - 22, cy, 9, 16);
    c.fillRect(cx + 13, cy, 9, 16);
    // Nasal guard
    g.rect(cx - 2, cy - 10, 4, 22, C.copper);
    // Eye openings
    c.fillStyle = C.ink;
    c.fillRect(cx - 18, cy - 2, 11, 9);
    c.fillRect(cx + 7, cy - 2, 11, 9);
    // Inner shine
    c.globalAlpha = 0.22;
    c.fillStyle = '#ffffff';
    c.beginPath(); c.arc(cx - 6, cy - 18, 8, Math.PI * 1.1, Math.PI * 1.9); c.fill();
    c.globalAlpha = 1;
  }

  /* ─── Scenery ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Dawn over the Aegean — Troy's battlements on the horizon
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#06091e');
      sky.addColorStop(0.38, '#0e1838');
      sky.addColorStop(0.7,  '#1a2848');
      sky.addColorStop(1,    '#0e1430');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);
      // Stars
      for (let i = 0; i < 40; i++) {
        const sx = (i * 71 + 17) % W, sy = (i * 43 + 9) % Math.floor(H * 0.45);
        c.globalAlpha = 0.15 + 0.28 * Math.sin(t * 1.1 + i * 0.9);
        g.rect(sx, sy, 1, 1, C.ivory);
      }
      c.globalAlpha = 1;
      // Dawn glow on horizon
      c.globalAlpha = 0.28 + 0.08 * Math.sin(t * 0.25);
      const grd = c.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.55);
      grd.addColorStop(0, '#ff9a40'); grd.addColorStop(0.5, C.bronze); grd.addColorStop(1, 'transparent');
      c.fillStyle = grd; c.fillRect(0, H * 0.32, W, H * 0.25);
      c.globalAlpha = 1;
      // Troy battlements silhouette on horizon
      c.fillStyle = C.wall;
      c.beginPath(); c.moveTo(0, H * 0.5);
      const batt = [0,14,18,14,18,6,34,6,34,14,52,14,52,6,68,6,68,14,88,14,88,6,102,6,102,20,118,20,118,6,132,6,132,14,148,14,148,6,162,6,162,18,178,18,178,6,196,6,196,14,212,14,212,6,230,6,230,14,248,14,248,6,270,6];
      for (let k = 0; k < batt.length; k += 2) c.lineTo(batt[k], H * 0.5 - batt[k + 1]);
      c.lineTo(W, H * 0.5); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      // Aegean sea reflection
      const sea = c.createLinearGradient(0, H * 0.5, 0, H);
      sea.addColorStop(0, '#0a2040'); sea.addColorStop(1, '#040e20');
      c.fillStyle = sea; c.fillRect(0, H * 0.5, W, H * 0.5);
      // Wave shimmer
      for (let w = 0; w < 6; w++) {
        const wy = H * 0.54 + w * 22 + Math.sin(t * 1.3 + w) * 4;
        c.globalAlpha = 0.1; g.rect(0, wy, W, 2, C.sea); c.globalAlpha = 1;
      }
      // Greek ships at anchor
      for (let sh = 0; sh < 4; sh++) {
        const shx = 28 + sh * 62, shy = H * 0.64 + Math.sin(t * 0.7 + sh * 1.3) * 3;
        c.fillStyle = '#0c1828';
        c.beginPath();
        c.moveTo(shx - 18, shy); c.lineTo(shx - 12, shy + 10); c.lineTo(shx + 12, shy + 10); c.lineTo(shx + 18, shy);
        c.closePath(); c.fill();
        g.rect(shx - 1, shy - 20, 2, 20, '#0a1020');
        c.fillStyle = 'rgba(200,122,32,0.35)';
        c.beginPath(); c.moveTo(shx, shy - 18); c.lineTo(shx + 15, shy - 4); c.lineTo(shx, shy + 2); c.closePath(); c.fill();
        // Oars
        for (let o = -2; o <= 2; o++) g.rect(shx + o * 6 - 1, shy + 8, 2, 9, '#0e1828');
      }
    } else {
      // Burning Troy at dusk — backdrop for intro / result / finale
      const bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0e0804'); bg.addColorStop(0.5, '#180c06'); bg.addColorStop(1, '#0a0602');
      c.fillStyle = bg; c.fillRect(0, 0, W, H);
      // Fire glow
      c.globalAlpha = 0.22 + 0.1 * Math.sin(t * 2.8);
      const fire = c.createRadialGradient(W / 2, H, 0, W / 2, H, H * 0.9);
      fire.addColorStop(0, 'rgba(220,80,12,0.5)'); fire.addColorStop(0.6, 'rgba(180,50,8,0.2)'); fire.addColorStop(1, 'transparent');
      c.fillStyle = fire; c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
      // Rising embers
      for (let e = 0; e < 14; e++) {
        const ex = ((t * (26 + e * 5) + e * 43) % (W + 10)) - 5;
        const ey = H - 10 - ((t * (55 + e * 9) + e * 65) % H);
        c.globalAlpha = 0.28 + 0.4 * Math.sin(t * 3.8 + e);
        g.rect(ex, ey, 2, 2, e % 3 === 0 ? C.fire : e % 3 === 1 ? '#ff4008' : '#ff8030');
      }
      c.globalAlpha = 1;
      // Troy wall at base
      c.fillStyle = '#0c0804';
      c.fillRect(0, H * 0.65, W, H * 0.35);
      for (let b = 0; b < 14; b++) c.fillRect(b * 20, H * 0.65 - 12, 12, 12);
      if (scene === 'intro' || scene === 'result' || scene === 'finale') {
        c.fillStyle = 'rgba(4,5,12,.76)'; c.fillRect(0, 0, W, H);
      }
    }
  }

  RetroSaga.create({
    id: 'iliad',
    title: 'WRATH OF ACHILLES',
    subtitle: 'THE ILIAD OF HOMER',
    currency: 'GLORY',
    screens: {
      win: C.bronze, lose: C.crimson,
      chapterLabel: '#4a6898', name: C.ivory, sub: C.slate,
      intro: C.bone, quote: '#607898', help: C.bronze,
      score: C.ivory, cur: C.bronze, cta: C.ivory,
      overlay: 'rgba(4,6,18,.88)',
    },
    labels: {
      chapter: 'BOOK', score: 'GLORY EARNED',
      win: 'GLORY TO OLYMPUS',
      lose: 'THE FATES HAVE SPOKEN',
      cont: 'TAP TO PRESS ON',
      finale: 'TAP FOR THE FINAL DUEL',
      toMenu: 'RETURN TO THE FLEET',
      play: 'TAKE UP YOUR SHIELD',
    },
    accent: C.bronze,
    credit: 'HOMER · c. 750 BCE',
    emblem: emblem,
    scenery: scenery,
    bootCta: 'TAKE UP YOUR SHIELD',
    menuLabel: 'THE BOOKS OF THE ILIAD',
    menuHint: 'CHOOSE A BATTLE',
    menuDone: '★ TROY HAS FALLEN ★',
    palette: { gold: C.bronze, blood: C.crimson },
    menu: {
      colors: { title: C.bronze, label: '#4a6898', cur: C.ivory, hint: C.slate },
      // Five round hoplite shields — 2 top, 2 middle, 1 bottom (like a phalanx)
      layout: function (api) {
        return [
          { x: 16,  y: 68,  w: 110, h: 120 },
          { x: 144, y: 68,  w: 110, h: 120 },
          { x: 16,  y: 212, w: 110, h: 120 },
          { x: 144, y: 212, w: 110, h: 120 },
          { x: 80,  y: 356, w: 110, h: 112 },
        ];
      },
      card: function (api, info) {
        const g = api.gfx, c = api.ctx;
        const ch = info.ch, i = info.i, x = info.x, y = info.y, w = info.w, h = info.h;
        const sel = info.sel, done = info.done;
        const cx = x + w / 2, cy = y + h / 2 - 4;
        const rx = w * 0.44, ry = h * 0.42;

        // Outer rim shadow
        c.fillStyle = '#020408';
        c.beginPath(); c.ellipse(cx + 2, cy + 3, rx + 2, ry + 2, 0, 0, Math.PI * 2); c.fill();

        // Shield body (Argive hoplite shield)
        c.fillStyle = sel ? '#1a3068' : (done ? '#162850' : '#0e1e40');
        c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.fill();

        // Bronze rim
        c.strokeStyle = sel ? C.bronze : (done ? C.copper : '#2a4080');
        c.lineWidth = sel ? 3.5 : 2;
        c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.stroke();

        // Inner decorative ring
        c.beginPath(); c.ellipse(cx, cy, rx * 0.78, ry * 0.78, 0, 0, Math.PI * 2);
        c.strokeStyle = done ? C.bronze : '#1e3060'; c.lineWidth = 1.5; c.stroke();

        // Concentric inner circles (Argive pattern)
        c.beginPath(); c.ellipse(cx, cy, rx * 0.55, ry * 0.55, 0, 0, Math.PI * 2);
        c.strokeStyle = done ? C.copper : '#162040'; c.lineWidth = 1; c.stroke();

        // Armband cross (center detail)
        c.globalAlpha = done ? 0.5 : 0.22;
        g.rect(cx - 1, cy - ry * 0.35, 2, ry * 0.7, C.bronze);
        g.rect(cx - rx * 0.35, cy - 1, rx * 0.7, 2, C.bronze);
        c.globalAlpha = 1;

        // Chapter icon (in upper portion)
        if (ch.icon) ch.icon(api, cx, cy - 16);

        // Chapter name
        api.txtCFit((i + 1) + '. ' + ch.name, cx, cy + 18, 7, done ? C.bronze : C.ivory, false, w - 18);
        if (ch.sub) api.txtCFit(ch.sub, cx, cy + 34, 6, C.slate, false, w - 24);

        // Done badge
        if (done) {
          c.globalAlpha = 0.18;
          c.fillStyle = C.bronze;
          c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          api.txtC('★', cx, cy + 48, 9, C.bronze);
        }
        // Selected highlight
        if (sel) {
          c.globalAlpha = 0.10;
          c.fillStyle = C.bronze;
          c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
        }
      },
    },
    finale: [
      'HECTOR FALLS.',
      'ACHILLES\' RAGE IS SPENT.',
      '',
      'OLD PRIAM WEEPS FOR HIS SON.',
      'THE GREEKS BURN THEIR DEAD.',
      '',
      'TROY AWAITS THE WOODEN HORSE.',
    ],
    width: 270, height: 480, parent: '#game',

    chapters: [

      // ═══════════════════ BOOK I — THE MUSTER ═══════════════════
      {
        id: 'muster', name: 'THE MUSTER', sub: 'AULIS BAY',
        icon: function (api, x, y) {
          const g = api.gfx, c = api.ctx;
          c.fillStyle = C.bronze;
          c.beginPath();
          c.moveTo(x - 12, y); c.lineTo(x - 8, y + 8); c.lineTo(x + 8, y + 8); c.lineTo(x + 12, y);
          c.closePath(); c.fill();
          g.rect(x - 1, y - 13, 2, 13, C.slate);
          c.fillStyle = C.sea;
          c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + 11, y - 3); c.lineTo(x, y + 1); c.closePath(); c.fill();
        },
        intro: [
          'A THOUSAND SHIPS RIDE AT ANCHOR.',
          'THE GREEKS HAVE MUSTERED',
          'FROM EVERY CORNER OF THE AEGEAN',
          'to sail for glorious Troy.',
        ],
        quote: '"Tell me now, you Muses — who were the leaders and lords of the Greeks?" — Homer',
        help: 'TAP Greek ships as they sail past. Muster 15 to make sail for Troy!',
        winText: 'The fleet is complete. Agamemnon gives the order. A thousand bronze-tipped prows turn toward Troy.',
        loseText: 'The ships scatter in the night wind. Without the full fleet, Troy cannot fall.',

        init: function (api) {
          this.ships = [];
          this.mustered = 0;
          this.need = 15;
          this.t = 0;
          this.spawnT = 0.3;
          this.timeLeft = 26;
          this.rings = [];
        },
        update: function (api, dt) {
          this.t += dt;
          this.timeLeft -= dt;
          if (this.timeLeft <= 0) { api.lose(); return; }

          // Spawn ships
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            const fromLeft = api.rint(0, 1) === 0;
            this.ships.push({
              x: fromLeft ? -22 : api.W + 22,
              y: 70 + api.rint(0, 6) * 42,
              vx: fromLeft ? 28 + api.rint(0, 3) * 6 : -(28 + api.rint(0, 3) * 6),
              hit: false,
            });
            this.spawnT = 0.72 + api.rint(0, 3) * 0.08;
          }

          // Move ships
          for (let i = 0; i < this.ships.length; i++) this.ships[i].x += this.ships[i].vx * dt;

          // Remove off-screen
          this.ships = this.ships.filter(s => !s.hit && s.x > -35 && s.x < api.W + 35);

          // Tap to collect
          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (let j = 0; j < this.ships.length; j++) {
              const s = this.ships[j];
              if (Math.abs(px - s.x) < 28 && Math.abs(py - s.y) < 22) {
                s.hit = true;
                this.mustered++;
                this.rings.push({ x: s.x, y: s.y, r: 0, t: 0.55 });
                api.burst(s.x, s.y, C.bronze, 7);
                api.audio.sfx('coin');
                api.addScore(10);
                if (this.mustered >= this.need) { api.win(); return; }
                break;
              }
            }
          }
          this.rings = this.rings.filter(r => { r.t -= dt; r.r += 44 * dt; return r.t > 0; });
        },
        draw: function (api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Sea
          const sea = c.createLinearGradient(0, 0, 0, H);
          sea.addColorStop(0, '#0a1830'); sea.addColorStop(1, '#04101e');
          c.fillStyle = sea; c.fillRect(0, 0, W, H);
          // Dawn glow
          c.globalAlpha = 0.15 + 0.05 * Math.sin(this.t * 0.3);
          const hor = c.createLinearGradient(0, H * 0.22, 0, H * 0.5);
          hor.addColorStop(0, C.bronze); hor.addColorStop(1, 'transparent');
          c.fillStyle = hor; c.fillRect(0, H * 0.22, W, H * 0.28);
          c.globalAlpha = 1;
          // Wave lines
          for (let wi = 0; wi < 9; wi++) {
            const wy = 42 + wi * 46 + Math.sin(this.t * 1.2 + wi * 0.7) * 5;
            c.globalAlpha = 0.09; g.rect(0, wy, W, 2, C.sea); c.globalAlpha = 1;
          }
          // Ships
          for (let i = 0; i < this.ships.length; i++) {
            const s = this.ships[i];
            // Hull shadow
            c.globalAlpha = 0.3;
            c.beginPath(); c.ellipse(s.x, s.y + 14, 18, 5, 0, 0, Math.PI * 2);
            c.fillStyle = '#000020'; c.fill(); c.globalAlpha = 1;
            // Hull
            c.fillStyle = '#1a3050';
            c.beginPath();
            if (s.vx > 0) {
              c.moveTo(s.x - 18, s.y); c.lineTo(s.x - 14, s.y + 9);
              c.lineTo(s.x + 14, s.y + 9); c.lineTo(s.x + 20, s.y);
            } else {
              c.moveTo(s.x + 18, s.y); c.lineTo(s.x + 14, s.y + 9);
              c.lineTo(s.x - 14, s.y + 9); c.lineTo(s.x - 20, s.y);
            }
            c.closePath(); c.fill();
            // Keel stripe
            g.rect(s.x - 12, s.y + 7, 24, 2, '#0e2038');
            // Mast
            g.rect(s.x - 1, s.y - 16, 2, 16, '#263a58');
            // Sail (red-ochre)
            c.fillStyle = C.bronze; c.globalAlpha = 0.9;
            if (s.vx > 0) {
              c.beginPath(); c.moveTo(s.x, s.y - 14); c.lineTo(s.x + 15, s.y - 4); c.lineTo(s.x, s.y + 1); c.closePath(); c.fill();
            } else {
              c.beginPath(); c.moveTo(s.x, s.y - 14); c.lineTo(s.x - 15, s.y - 4); c.lineTo(s.x, s.y + 1); c.closePath(); c.fill();
            }
            c.globalAlpha = 1;
            // Oar tips
            for (let o = -2; o <= 2; o++) g.rect(s.x + o * 6 - 1, s.y + 7, 2, 8, '#1a2840');
          }
          // Tap rings
          for (let ri = 0; ri < this.rings.length; ri++) {
            const r = this.rings[ri];
            c.globalAlpha = r.t * 1.5;
            c.strokeStyle = C.bronze; c.lineWidth = 2;
            c.beginPath(); c.arc(r.x, r.y, r.r, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }
          // HUD
          api.topBar('BOOK I — THE MUSTER');
          api.txt('SHIPS: ' + this.mustered + '/' + this.need, 6, 20, 8, C.bronze);
          const tc = this.timeLeft < 8 ? C.blood : C.sea;
          api.txt('TIME ' + Math.ceil(this.timeLeft), W - 70, 20, 7, tc);
          g.rect(6, H - 10, W - 12, 6, '#0c1428');
          g.rect(6, H - 10, (W - 12) * clamp(this.mustered / this.need, 0, 1), 6, C.bronze);
        },
      },

      // ═══════════════════ BOOK II — THE PLAIN ═══════════════════
      {
        id: 'the-plain', name: 'THE PLAIN', sub: 'ADVANCE ON TROY',
        icon: function (api, x, y) {
          const g = api.gfx;
          g.rect(x - 14, y - 1, 26, 3, C.slate);
          g.rect(x + 10, y - 5, 6, 10, C.ivory);
          g.rect(x - 14, y - 4, 5, 8, C.bronze);
        },
        intro: [
          'THE ARMIES CLASH ON THE PLAIN',
          'BEFORE TROY\'S HIGH WALLS.',
          'A GREEK HOPLITE CHARGES FORWARD',
          'through a hail of Trojan spears.',
        ],
        quote: '"As when the West Wind drives the rain against the mountains — so rang the battle between Greeks and Trojans." — Homer',
        help: 'DRAG or tap LEFT / RIGHT to dodge Trojan spears. Reach the walls!',
        winText: 'The hoplite reaches Troy\'s massive gates. The siege begins in earnest.',
        loseText: 'The Trojan spears find their mark. Another hero falls on the dusty plain.',

        init: function (api) {
          this.x = api.W / 2;
          this.dist = 0;
          this.need = 550;
          this.spears = [];
          this.spawnT = 0.5;
          this.lives = 3;
          this.hitCool = 0;
          this.t = 0;
          this.dustP = [];
        },
        update: function (api, dt) {
          const f = dt * 60;
          this.t += dt;

          // Distance (22–26s to win)
          const spd = 22 + (this.dist / this.need) * 10;
          this.dist += spd * dt;

          // Steer
          if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.12 * f;
          if (api.keyDown('left'))  this.x -= 3.6 * f;
          if (api.keyDown('right')) this.x += 3.6 * f;
          this.x = clamp(this.x, 18, api.W - 18);

          // Spawn spears
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            const intensity = this.dist / this.need;
            this.spawnT = Math.max(0.48, 1.15 - intensity * 0.5);
            const n = intensity > 0.65 ? 2 : 1;
            for (let k = 0; k < n; k++) {
              this.spears.push({ x: 14 + api.rint(0, 24) * 10, y: -22, spd: 185 + intensity * 65 });
            }
          }
          for (let i = 0; i < this.spears.length; i++) this.spears[i].y += this.spears[i].spd * dt;

          // Dust puffs
          if (api.rint(0, 5) === 0) this.dustP.push({ x: this.x + api.rnd(-12, 12), y: api.H - 60, t: 0.4 });
          this.dustP = this.dustP.filter(p => { p.y -= 12 * dt; p.t -= dt; return p.t > 0; });

          // Collision
          this.hitCool = Math.max(0, this.hitCool - dt);
          if (this.hitCool <= 0) {
            const wy = api.H - 64;
            for (let j = 0; j < this.spears.length; j++) {
              const sp = this.spears[j];
              if (Math.abs(this.x - sp.x) < 14 && Math.abs(wy - sp.y) < 18) {
                this.lives--;
                this.hitCool = 0.85;
                this.spears.splice(j, 1);
                api.shake(5, 0.25); api.flash(C.blood, 0.18); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
          this.spears = this.spears.filter(sp => sp.y < api.H + 24);

          if (this.dist >= this.need) { api.addScore(80); api.win(); }
          api.score = Math.floor(this.dist * 0.18);
        },
        draw: function (api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Sky
          const sky = c.createLinearGradient(0, 0, 0, H * 0.48);
          sky.addColorStop(0, '#0c1428'); sky.addColorStop(1, '#1a2840');
          c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.48);
          // Troy walls background
          c.fillStyle = '#0c1828';
          for (let b = 0; b < 12; b++) c.fillRect(b * 24, H * 0.24 - 12, 16, 28);
          c.fillStyle = '#08101e'; c.fillRect(0, H * 0.24 + 14, W, 8);
          // Dusty plain
          const plain = c.createLinearGradient(0, H * 0.48, 0, H);
          plain.addColorStop(0, '#1e1408'); plain.addColorStop(1, '#100c06');
          c.fillStyle = plain; c.fillRect(0, H * 0.48, W, H * 0.52);
          // Ground texture
          for (let row = 0; row < 6; row++) {
            c.globalAlpha = 0.06;
            g.rect(0, H * 0.52 + row * 22, W, 1, '#c8a060');
            c.globalAlpha = 1;
          }
          // Dust puffs
          for (let d = 0; d < this.dustP.length; d++) {
            const p = this.dustP[d];
            c.globalAlpha = p.t * 0.5;
            c.beginPath(); c.ellipse(p.x, p.y, 8, 4, 0, 0, Math.PI * 2);
            c.fillStyle = '#b89060'; c.fill(); c.globalAlpha = 1;
          }
          // Spears
          for (let i = 0; i < this.spears.length; i++) {
            const sp = this.spears[i];
            g.rect(sp.x - 1, sp.y - 24, 2, 26, C.slate);
            // Spearhead triangle
            c.fillStyle = C.ivory;
            c.beginPath(); c.moveTo(sp.x, sp.y); c.lineTo(sp.x - 4, sp.y - 8); c.lineTo(sp.x + 4, sp.y - 8); c.closePath(); c.fill();
          }
          // Trojan archers on wall
          const numArch = 5;
          for (let a = 0; a < numArch; a++) {
            const ax = 20 + a * 52;
            g.rect(ax - 3, H * 0.24 - 28, 6, 16, C.blue);
            g.rect(ax - 4, H * 0.24 - 36, 8, 8, C.bronze);
          }
          // Warrior
          const wy = H - 64;
          const col = this.hitCool > 0 ? C.blood : C.bronze;
          // Dust underfoot
          c.globalAlpha = 0.25;
          c.beginPath(); c.ellipse(this.x, wy + 14, 14, 5, 0, 0, Math.PI * 2);
          c.fillStyle = '#b89060'; c.fill(); c.globalAlpha = 1;
          // Shield (left side)
          c.fillStyle = C.shield;
          c.beginPath(); c.ellipse(this.x - 9, wy - 8, 11, 16, -0.25, 0, Math.PI * 2); c.fill();
          c.strokeStyle = col; c.lineWidth = 2; c.stroke();
          // Shield boss
          g.circle(this.x - 9, wy - 8, 4, col);
          // Body
          g.rect(this.x - 5, wy - 22, 10, 20, C.slate);
          // Greaves
          g.rect(this.x - 5, wy, 5, 14, C.slate);
          g.rect(this.x + 2, wy, 5, 14, C.slate);
          // Helmet
          c.fillStyle = col;
          c.beginPath(); c.arc(this.x, wy - 28, 8, Math.PI, 0);
          c.lineTo(this.x + 8, wy - 20); c.lineTo(this.x - 8, wy - 20); c.closePath(); c.fill();
          // Crest
          g.rect(this.x - 2, wy - 38, 4, 10, C.blood);
          // Spear
          g.rect(this.x + 7, wy - 38, 2, 50, C.slate);
          // HUD
          api.topBar('BOOK II — THE PLAIN');
          api.txt('ADVANCE ' + Math.min(100, Math.floor(this.dist / this.need * 100)) + '%', 6, 20, 8, C.bronze);
          for (let li = 0; li < 3; li++) g.rect(W - 52 + li * 16, 4, 11, 9, li < this.lives ? C.green : '#1a2040');
          g.rect(6, H - 10, W - 12, 6, '#0c1428');
          g.rect(6, H - 10, (W - 12) * clamp(this.dist / this.need, 0, 1), 6, C.bronze);
        },
      },

      // ═══════════════════ BOOK III — HOLD THE LINE ═══════════════════
      {
        id: 'hold-line', name: 'HOLD THE LINE', sub: 'THE PHALANX',
        icon: function (api, x, y) {
          const g = api.gfx;
          // Three overlapping shields
          g.circle(x - 7, y, 7, C.shield);
          g.circle(x,     y, 7, C.dusk);
          g.circle(x + 7, y, 7, C.shield);
          g.rect(x - 10, y - 1, 20, 2, C.bronze);
        },
        intro: [
          'TROJAN WARRIORS CHARGE THREE',
          'BREACH POINTS IN THE GREEK LINE.',
          'THE PHALANX MUST HOLD —',
          'shift your weight and block them.',
        ],
        quote: '"As a wall of stone they stood — no man could break through, though the Trojans came at them again and again." — Homer',
        help: 'TAP left / center / right zone to switch lanes and block incoming warriors!',
        winText: 'The phalanx holds! Trojan shields shatter on Greek bronze. The line is unbroken.',
        loseText: 'The phalanx breaks. Trojans pour through the gap shouting in triumph.',

        init: function (api) {
          this.lane = 1;
          this.trojans = [];
          this.spawnT = 0.6;
          this.blocked = 0;
          this.need = 14;
          this.lives = 3;
          this.t = 0;
          this.pops = [];
          this.laneX = [45, api.W / 2, api.W - 45];
          this.hitCool = 0;
          this.lastKey = 0;
        },
        update: function (api, dt) {
          this.t += dt;
          this.hitCool = Math.max(0, this.hitCool - dt);
          this.lastKey = Math.max(0, this.lastKey - dt);

          // Key lane switch
          if (this.lastKey <= 0) {
            if (api.keyPressed('left')  && this.lane > 0) { this.lane--; this.lastKey = 0.18; api.audio.sfx('blip'); }
            if (api.keyPressed('right') && this.lane < 2) { this.lane++; this.lastKey = 0.18; api.audio.sfx('blip'); }
          }
          // Touch zone lane select
          if (api.pointer.justDown) {
            const px = api.pointer.x, W = api.W;
            const prev = this.lane;
            this.lane = px < W / 3 ? 0 : px < 2 * W / 3 ? 1 : 2;
            if (this.lane !== prev) api.audio.sfx('blip');
          }

          // Spawn Trojans
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            const intensity = this.blocked / this.need;
            this.spawnT = Math.max(0.62, 1.05 - intensity * 0.28);
            this.trojans.push({ lane: api.rint(0, 2), y: -28, spd: 115 + intensity * 48, hit: false });
          }
          for (let i = 0; i < this.trojans.length; i++) this.trojans[i].y += this.trojans[i].spd * dt;

          // Clash zone at y = 295
          if (this.hitCool <= 0) {
            for (let j = this.trojans.length - 1; j >= 0; j--) {
              const tr = this.trojans[j];
              if (!tr.hit && tr.y >= 295) {
                tr.hit = true;
                if (tr.lane === this.lane) {
                  this.blocked++;
                  api.burst(this.laneX[tr.lane], 295, C.bronze, 9);
                  api.audio.sfx('coin');
                  api.addScore(14);
                  this.pops.push({ x: this.laneX[tr.lane], y: 295, t: 0.45 });
                  if (this.blocked >= this.need) { api.win(); return; }
                } else {
                  this.lives--;
                  this.hitCool = 0.65;
                  api.shake(5, 0.25); api.flash(C.blood, 0.2); api.audio.sfx('hurt');
                  if (this.lives <= 0) { api.lose(); return; }
                }
              }
            }
          }
          this.trojans = this.trojans.filter(tr => tr.y < api.H + 24);
          this.pops = this.pops.filter(p => { p.t -= dt; return p.t > 0; });
        },
        draw: function (api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Backdrop: Troy's gate arch
          c.fillStyle = '#080e1c'; c.fillRect(0, 0, W, H);
          c.fillStyle = '#0e1828'; c.fillRect(0, 0, W, H * 0.62);
          // Three arched gate openings
          for (let gi = 0; gi < 3; gi++) {
            const gx = 6 + gi * 88, gw = 74;
            c.fillStyle = '#06091a';
            c.beginPath();
            c.moveTo(gx, H * 0.62);
            c.lineTo(gx, H * 0.28);
            c.arc(gx + gw / 2, H * 0.28, gw / 2, Math.PI, 0);
            c.lineTo(gx + gw, H * 0.62);
            c.closePath(); c.fill();
          }
          // Wall battlements
          c.fillStyle = '#0c1420';
          for (let b = 0; b < 16; b++) c.fillRect(b * 18, 0, 10, 20);
          // Torchlight
          const fl = 0.62 + 0.38 * Math.sin(this.t * 5.5);
          c.globalAlpha = fl * 0.14;
          c.fillStyle = '#ff8a20';
          c.beginPath(); c.ellipse(W / 2, H * 0.5, W * 0.6, H * 0.4, 0, 0, Math.PI * 2); c.fill();
          c.globalAlpha = 1;
          // Lane guides
          for (let li = 1; li < 3; li++) {
            c.globalAlpha = 0.12; g.rect(li * 90, 0, 1, H, C.slate); c.globalAlpha = 1;
          }
          // Clash line
          c.globalAlpha = 0.28; g.rect(0, 295, W, 2, C.bronze); c.globalAlpha = 1;
          // Trojans
          for (let ti = 0; ti < this.trojans.length; ti++) {
            const tr = this.trojans[ti];
            const tx = this.laneX[tr.lane];
            // Shadow
            c.globalAlpha = 0.22;
            c.beginPath(); c.ellipse(tx, tr.y + 14, 12, 4, 0, 0, Math.PI * 2);
            c.fillStyle = '#000'; c.fill(); c.globalAlpha = 1;
            // Shield (left)
            c.fillStyle = '#2a4078';
            c.beginPath(); c.ellipse(tx - 10, tr.y - 8, 9, 14, -0.2, 0, Math.PI * 2); c.fill();
            c.strokeStyle = C.bronze; c.lineWidth = 1.5; c.stroke();
            // Body
            g.rect(tx - 6, tr.y - 18, 12, 18, C.blue);
            // Helmet
            c.fillStyle = '#2a4078';
            c.beginPath(); c.arc(tx, tr.y - 26, 8, Math.PI, 0);
            c.lineTo(tx + 8, tr.y - 18); c.lineTo(tx - 8, tr.y - 18); c.closePath(); c.fill();
            g.rect(tx - 1, tr.y - 34, 3, 10, C.plume);
            // Spear
            g.rect(tx + 8, tr.y - 36, 2, 54, C.slate);
            // Legs
            g.rect(tx - 4, tr.y, 4, 12, C.blue);
            g.rect(tx + 2, tr.y, 4, 12, C.blue);
          }
          // Pop effects
          for (let pi = 0; pi < this.pops.length; pi++) {
            const p = this.pops[pi];
            c.globalAlpha = p.t * 2.2;
            c.strokeStyle = C.bronze; c.lineWidth = 3;
            c.beginPath(); c.arc(p.x, p.y, (0.45 - p.t) * 80, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }
          // Player shield (large hoplite)
          const px = this.laneX[this.lane];
          c.fillStyle = C.shield;
          c.beginPath(); c.ellipse(px, H - 44, 30, 36, 0, 0, Math.PI * 2); c.fill();
          c.strokeStyle = C.bronze; c.lineWidth = 4; c.stroke();
          // Inner ring
          c.beginPath(); c.ellipse(px, H - 44, 24, 30, 0, 0, Math.PI * 2);
          c.strokeStyle = C.copper; c.lineWidth = 2; c.stroke();
          // Shield boss
          g.circle(px, H - 44, 7, C.bronze);
          // Arms
          g.rect(px - 4, H - 80, 8, 36, C.slate);
          // Helmet crest above shield
          c.fillStyle = C.bronze;
          c.beginPath(); c.arc(px, H - 82, 10, Math.PI, 0);
          c.lineTo(px + 10, H - 70); c.lineTo(px - 10, H - 70); c.closePath(); c.fill();
          g.rect(px - 2, H - 96, 4, 14, C.blood);
          // Lane hint
          for (let li = 0; li < 3; li++) {
            const lx = this.laneX[li];
            c.globalAlpha = li === this.lane ? 0.0 : 0.08;
            c.fillStyle = C.bronze;
            c.fillRect(lx - 38, H - 100, 76, 100);
            c.globalAlpha = 1;
          }
          // HUD
          api.topBar('BOOK III — HOLD THE LINE');
          api.txt('BLOCKED: ' + this.blocked + '/' + this.need, 6, 20, 8, C.bronze);
          for (let hl = 0; hl < 3; hl++) g.rect(W - 52 + hl * 16, 4, 11, 9, hl < this.lives ? C.green : '#1a2040');
          g.rect(6, H - 10, W - 12, 6, '#0c1428');
          g.rect(6, H - 10, (W - 12) * clamp(this.blocked / this.need, 0, 1), 6, C.bronze);
        },
      },

      // ═══════════════════ BOOK IV — PATROCLUS FALLS ═══════════════════
      {
        id: 'patroclus', name: 'PATROCLUS FALLS', sub: 'SHIELD THE HERO',
        icon: function (api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Helmet with X struck through it
          c.fillStyle = C.ivory;
          c.beginPath(); c.arc(x, y - 4, 9, Math.PI, 0);
          c.lineTo(x + 9, y + 4); c.lineTo(x - 9, y + 4); c.closePath(); c.fill();
          g.rect(x - 2, y - 2, 4, 8, C.bronze);
          c.strokeStyle = C.blood; c.lineWidth = 2.5;
          c.beginPath(); c.moveTo(x - 8, y - 10); c.lineTo(x + 8, y + 4); c.stroke();
          c.beginPath(); c.moveTo(x + 8, y - 10); c.lineTo(x - 8, y + 4); c.stroke();
        },
        intro: [
          'PATROCLUS DONS ACHILLES\' ARMOR',
          'AND CHARGES INTO BATTLE.',
          'APOLLO BREAKS HIS SHIELD.',
          'Deflect the god\'s arrows before they strike!',
        ],
        quote: '"Apollo struck Patroclus between the shoulders — his eyes went dim, and he sank to his knees." — Homer',
        help: 'TAP each spear or arrow before it reaches Patroclus! 3 hits and he falls.',
        winText: 'Patroclus drove the Trojans back to their very walls. What glory — at what cost.',
        loseText: 'Hector strikes the killing blow. Achilles will hear of this too late.',

        init: function (api) {
          this.projectiles = [];
          this.spawnT = 0.5;
          this.lives = 3;
          this.t = 0;
          this.timeLeft = 22;
          this.hitCool = 0;
          this.pPos = { x: api.W / 2, y: api.H - 72 };
          this.pats = []; // particles for deflected shots
        },
        update: function (api, dt) {
          this.t += dt;
          this.timeLeft -= dt;
          if (this.timeLeft <= 0) { api.addScore(80); api.win(); return; }

          const intensity = 1 - this.timeLeft / 22;

          // Spawn projectiles arcing toward Patroclus
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = Math.max(0.42, 0.92 - intensity * 0.28);
            const ox = api.rnd(-80, 80), oy = api.rnd(-110, -60);
            const sx = this.pPos.x + ox, sy = this.pPos.y + oy;
            const dx = this.pPos.x - sx + api.rnd(-14, 14);
            const dy = this.pPos.y - sy;
            const dist = Math.hypot(dx, dy) || 1;
            const spd = 125 + intensity * 55;
            this.projectiles.push({
              x: sx, y: sy,
              vx: dx / dist * spd,
              vy: dy / dist * spd,
              gone: false,
            });
          }
          for (let i = 0; i < this.projectiles.length; i++) {
            const p = this.projectiles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
          }

          // Tap to deflect
          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (let j = 0; j < this.projectiles.length; j++) {
              const pr = this.projectiles[j];
              if (!pr.gone && Math.hypot(px - pr.x, py - pr.y) < 26) {
                pr.gone = true;
                this.pats.push({ x: pr.x, y: pr.y, t: 0.5 });
                api.burst(pr.x, pr.y, C.bronze, 6);
                api.audio.sfx('coin');
                api.addScore(12);
                break;
              }
            }
          }

          // Projectile hits Patroclus
          this.hitCool = Math.max(0, this.hitCool - dt);
          if (this.hitCool <= 0) {
            for (let k = 0; k < this.projectiles.length; k++) {
              const pk = this.projectiles[k];
              if (!pk.gone && Math.hypot(this.pPos.x - pk.x, this.pPos.y - pk.y) < 18) {
                pk.gone = true;
                this.lives--;
                this.hitCool = 0.45;
                api.shake(7, 0.3); api.flash(C.blood, 0.22); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
            }
          }
          this.projectiles = this.projectiles.filter(p =>
            !p.gone && p.y < api.H + 12 && p.y > -12 && p.x > -12 && p.x < api.W + 12);
          this.pats = this.pats.filter(p => { p.t -= dt; return p.t > 0; });
        },
        draw: function (api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Battlefield glow backdrop
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#0e0818'); bg.addColorStop(1, '#060412');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);
          // Sun glare (Apollo's domain)
          c.globalAlpha = 0.12 + 0.06 * Math.sin(this.t * 0.6);
          const sun = c.createRadialGradient(W / 2, -20, 0, W / 2, -20, W * 0.8);
          sun.addColorStop(0, '#ffda60'); sun.addColorStop(0.5, C.bronze); sun.addColorStop(1, 'transparent');
          c.fillStyle = sun; c.fillRect(0, 0, W, H * 0.5);
          c.globalAlpha = 1;
          // Trojan archers (6) at top
          for (let a = 0; a < 6; a++) {
            const ax = 16 + a * 42;
            g.rect(ax - 3, 8, 6, 18, C.blue);
            c.fillStyle = '#2a4070';
            c.beginPath(); c.arc(ax, 6, 7, Math.PI, 0);
            c.lineTo(ax + 7, 8); c.lineTo(ax - 7, 8); c.closePath(); c.fill();
            g.rect(ax - 1, -2, 3, 12, C.plume);
            // Bow
            c.strokeStyle = '#6a5030'; c.lineWidth = 2;
            c.beginPath(); c.arc(ax + 8, 12, 10, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
          }
          // Dust on ground
          c.fillStyle = '#1e1408'; c.fillRect(0, H - 55, W, 55);
          // Patroclus deflect rings (from pats)
          for (let pi = 0; pi < this.pats.length; pi++) {
            const p = this.pats[pi];
            c.globalAlpha = p.t * 1.8;
            c.strokeStyle = C.gold; c.lineWidth = 2;
            c.beginPath(); c.arc(p.x, p.y, (0.5 - p.t) * 50, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }
          // Projectiles
          for (let i = 0; i < this.projectiles.length; i++) {
            const p = this.projectiles[i];
            const angle = Math.atan2(p.vy, p.vx);
            c.save();
            c.translate(p.x, p.y);
            c.rotate(angle);
            g.rect(-12, -1, 22, 2, C.bronze);
            c.fillStyle = C.ivory;
            c.beginPath(); c.moveTo(10, 0); c.lineTo(14, -4); c.lineTo(14, 4); c.closePath(); c.fill();
            c.restore();
          }
          // Patroclus (wearing Achilles' divine gold armor)
          const px = this.pPos.x, py = this.pPos.y;
          // Shadow
          c.globalAlpha = 0.3;
          c.beginPath(); c.ellipse(px, py + 16, 16, 5, 0, 0, Math.PI * 2);
          c.fillStyle = '#000'; c.fill(); c.globalAlpha = 1;
          // Shield (left)
          c.fillStyle = C.shield;
          c.beginPath(); c.ellipse(px - 12, py - 12, 12, 18, -0.2, 0, Math.PI * 2); c.fill();
          c.strokeStyle = C.gold; c.lineWidth = 2.5; c.stroke();
          // Body (bright gold — divine armor)
          g.rect(px - 6, py - 28, 12, 24, C.ivory);
          // Greaves
          g.rect(px - 6, py - 4, 5, 20, C.ivory);
          g.rect(px + 3, py - 4, 5, 20, C.ivory);
          // Helmet (Achilles' golden — with big crest)
          c.fillStyle = C.gold;
          c.beginPath(); c.arc(px, py - 36, 10, Math.PI, 0);
          c.lineTo(px + 10, py - 26); c.lineTo(px - 10, py - 26); c.closePath(); c.fill();
          g.rect(px - 3, py - 52, 6, 16, C.blood);
          // Spear
          g.rect(px + 10, py - 50, 2, 68, C.slate);
          // Lives indicator (hearts above Patroclus)
          for (let li = 0; li < 3; li++) {
            const heartColor = li < this.lives ? C.green : C.crimson;
            g.rect(px - 14 + li * 13, py - 68, 8, 7, heartColor);
          }
          // Timer bar
          api.topBar('BOOK IV — PATROCLUS FALLS');
          api.txt('TAP TO DEFLECT!', 6, 20, 7, C.bronze);
          g.rect(6, H - 10, W - 12, 6, '#0c1428');
          g.rect(6, H - 10, (W - 12) * clamp(this.timeLeft / 22, 0, 1), 6, C.sea);
        },
      },

      // ═══════════════════ BOOK V — WRATH OF ACHILLES ═══════════════════
      {
        id: 'wrath', name: 'WRATH OF ACHILLES', sub: 'THE FINAL DUEL',
        icon: function (api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Flaming helmet
          c.fillStyle = C.blood;
          c.beginPath(); c.arc(x, y - 6, 9, Math.PI, 0);
          c.lineTo(x + 9, y + 2); c.lineTo(x - 9, y + 2); c.closePath(); c.fill();
          g.rect(x - 2, y - 5, 4, 10, C.copper);
          // Flame crest
          for (let fi = -4; fi <= 4; fi += 2) {
            c.globalAlpha = 0.85;
            c.fillStyle = fi % 4 === 0 ? C.gold : C.fire;
            c.fillRect(x + fi - 1, y - 22, 2, 8 - Math.abs(fi));
          }
          c.globalAlpha = 1;
        },
        intro: [
          'ACHILLES RAGES AT THE NEWS.',
          'HE DONS DIVINE NEW ARMOR',
          'AND HUNTS HECTOR ROUND THE WALLS.',
          'Close the gap. Then land the killing blow.',
        ],
        quote: '"As a star comes forth at evening, brightest of all — so flashed the point of Achilles\' spear." — Homer',
        help: 'HOLD or tap RAPIDLY to sprint. Close the gap, then TAP in the GOLD ZONE!',
        winText: 'Achilles stands over the fallen hero of Troy. The wrath of Peleus\' son is spent.',
        loseText: 'Hector circles Troy three times uncaught. Apollo shields him from the dawn.',

        init: function (api) {
          this.phase = 'chase';
          this.stamina = 100;
          this.t = 0;
          this.timeLeft = 26;
          // Hector runs around an oval path; we store angular position. update()
          // recomputes this.gap from the angle difference every frame, so the
          // REAL starting distance is set here by achillesAng — the old -0.22
          // put Achilles ~24px behind and the chase was over in a blink.
          this.hectorAng = 0;
          this.achillesAng = -1.6; // a real lap-and-a-half of pursuit round the walls
          this.gap = 178;          // first-frame display (overwritten each update)
          this.trackCx = api.W / 2;
          this.trackCy = api.H / 2 + 18;
          this.trackRx = 92;
          this.trackRy = 130;
          // Duel phase
          this.gauge = 0.0;
          this.gaugeDir = 1;
          this.strikes = 0;
          this.strikeFlash = 0;
          this.msgs = [];
          this.catchFlash = 0;
        },
        update: function (api, dt) {
          this.t += dt;

          if (this.phase === 'chase') {
            this.timeLeft -= dt;
            if (this.timeLeft <= 0) { api.lose(); return; }

            // Sprint when pointer held or up/a key
            const boosting = api.pointer.down || api.keyDown('a') || api.keyDown('up');
            if (boosting && this.stamina > 0) {
              this.stamina = Math.max(0, this.stamina - 62 * dt);
            } else {
              this.stamina = Math.min(100, this.stamina + 26 * dt);
            }
            const boost = boosting && this.stamina > 0;

            // Hector: 58 deg/s, Achilles: 52 deg/s base + 60 boost
            // Angular speeds (in radians/s scaled by track circumference)
            const hSpd = 0.58; // rad/s on normalized unit circle
            const aSpd = boost ? 0.52 + 0.60 : 0.52;
            this.hectorAng += hSpd * dt;
            this.achillesAng += aSpd * dt;

            // Gap = angular difference * track length (approx circumference)
            const circumference = 2 * Math.PI * ((this.trackRx + this.trackRy) / 2);
            const angDiff = this.hectorAng - this.achillesAng;
            this.gap = angDiff * circumference / (2 * Math.PI);
            this.gap = Math.max(0, this.gap);

            if (this.gap <= 0) {
              this.phase = 'duel';
              this.catchFlash = 0.6;
              api.shake(8, 0.4); api.audio.sfx('power');
              api.burst(this.trackCx, this.trackCy, C.bronze, 16);
            }
          } else {
            // DUEL
            this.catchFlash = Math.max(0, this.catchFlash - dt);
            this.strikeFlash = Math.max(0, this.strikeFlash - dt);

            // Gauge oscillates faster per strike
            const gaugeSpd = 0.88 + this.strikes * 0.32;
            this.gauge += this.gaugeDir * gaugeSpd * dt;
            if (this.gauge >= 1) { this.gauge = 1; this.gaugeDir = -1; }
            if (this.gauge <= 0) { this.gauge = 0; this.gaugeDir = 1; }

            if (api.pointer.justDown || api.keyPressed('a')) {
              if (this.gauge >= 0.54 && this.gauge <= 0.94) {
                this.strikes++;
                this.strikeFlash = 0.6;
                api.shake(9, 0.35); api.flash('#ff9a20', 0.18); api.audio.sfx('shoot');
                api.addScore(100);
                api.burst(this.trackCx + 30, this.trackCy - 40, '#ff9a20', 14);
                this.msgs.push({ txt: 'STRIKE!', x: this.trackCx, y: this.trackCy - 70, t: 1.0, col: C.gold });
                if (this.strikes >= 3) { api.addScore(150); api.win(); return; }
              } else {
                api.shake(3, 0.15); api.audio.sfx('hurt');
                this.msgs.push({ txt: 'MISS', x: this.trackCx, y: this.trackCy - 50, t: 0.7, col: C.blood });
              }
            }
            this.msgs = this.msgs.filter(m => { m.t -= dt; m.y -= 28 * dt; return m.t > 0; });
          }
          api.score = this.strikes * 100 + Math.floor(Math.max(0, 175 - this.gap));
        },
        draw: function (api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Night sky over Troy — fires burning
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#060410'); bg.addColorStop(1, '#180c04');
          c.fillStyle = bg; c.fillRect(0, 0, W, H);
          // Fire glow from Troy's direction
          c.globalAlpha = 0.2 + 0.08 * Math.sin(this.t * 2.2);
          const fire = c.createRadialGradient(W / 2, H, 0, W / 2, H, H);
          fire.addColorStop(0, 'rgba(220,80,10,0.6)'); fire.addColorStop(0.5, 'rgba(180,50,8,0.25)'); fire.addColorStop(1, 'transparent');
          c.fillStyle = fire; c.fillRect(0, 0, W, H);
          c.globalAlpha = 1;
          // Wall battlement at top (with fire)
          c.fillStyle = '#0e0c08';
          for (let b = 0; b < 14; b++) c.fillRect(b * 20, 0, 12, 18);
          c.fillStyle = '#100e0a'; c.fillRect(0, 16, W, 10);
          // Torch flicker
          const tf = 0.6 + 0.4 * Math.sin(this.t * 4.8);
          for (let bt = 0; bt < 4; bt++) {
            const bx = bt * 70 + 20;
            c.globalAlpha = tf * 0.25;
            c.fillStyle = '#ff8020';
            c.beginPath(); c.ellipse(bx, 10, 14, 36, 0, 0, Math.PI * 2); c.fill();
            c.globalAlpha = 1;
            g.rect(bx - 3, 14, 6, 8, '#2a1808');
            g.rect(bx - 2, 6, 4, 10, '#ff7020');
          }

          if (this.phase === 'chase') {
            // Draw oval track (Troy's walls perimeter)
            c.strokeStyle = '#1a2440'; c.lineWidth = 10;
            c.beginPath(); c.ellipse(this.trackCx, this.trackCy, this.trackRx, this.trackRy, 0, 0, Math.PI * 2); c.stroke();
            c.strokeStyle = '#2a3860'; c.lineWidth = 4;
            c.beginPath(); c.ellipse(this.trackCx, this.trackCy, this.trackRx, this.trackRy, 0, 0, Math.PI * 2); c.stroke();
            c.strokeStyle = '#101828'; c.lineWidth = 1;
            c.beginPath(); c.ellipse(this.trackCx, this.trackCy, this.trackRx - 5, this.trackRy - 5, 0, 0, Math.PI * 2); c.stroke();
            // "TROY" label at center
            api.txtC('TROY', this.trackCx, this.trackCy - 8, 8, '#1a2448');
            api.txtC('WALLS', this.trackCx, this.trackCy + 8, 7, '#141e38');

            // Hector position on track
            const hx = this.trackCx + Math.cos(this.hectorAng) * this.trackRx;
            const hy = this.trackCy + Math.sin(this.hectorAng) * this.trackRy;
            // Hector
            c.fillStyle = C.blue;
            c.beginPath(); c.arc(hx, hy - 14, 8, Math.PI, 0);
            c.lineTo(hx + 8, hy - 6); c.lineTo(hx - 8, hy - 6); c.closePath(); c.fill();
            g.rect(hx - 4, hy - 6, 8, 14, C.blue);
            g.rect(hx - 3, hy - 22, 6, 8, C.plume);
            c.fillStyle = '#1a3060';
            c.beginPath(); c.ellipse(hx - 10, hy - 8, 7, 11, -0.2, 0, Math.PI * 2); c.fill();
            c.strokeStyle = C.slate; c.lineWidth = 1.5; c.stroke();
            g.rect(hx - 2, hy, 4, 12, C.blue);
            g.rect(hx + 5, hy - 28, 2, 40, C.slate);

            // Achilles position
            const ax = this.trackCx + Math.cos(this.achillesAng) * this.trackRx;
            const ay = this.trackCy + Math.sin(this.achillesAng) * this.trackRy;
            const isBoost = api.pointer.down || api.keyDown('a') || api.keyDown('up');
            // Achilles glow when sprinting
            if (isBoost && this.stamina > 0) {
              c.globalAlpha = 0.2; c.fillStyle = C.gold;
              c.beginPath(); c.arc(ax, ay - 10, 22, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
            }
            c.fillStyle = C.bronze;
            c.beginPath(); c.arc(ax, ay - 14, 8, Math.PI, 0);
            c.lineTo(ax + 8, ay - 6); c.lineTo(ax - 8, ay - 6); c.closePath(); c.fill();
            g.rect(ax - 4, ay - 6, 8, 14, C.ivory);
            g.rect(ax - 3, ay - 22, 6, 8, C.blood);
            c.fillStyle = C.bronze;
            c.beginPath(); c.ellipse(ax - 10, ay - 8, 7, 11, -0.2, 0, Math.PI * 2); c.fill();
            c.strokeStyle = C.gold; c.lineWidth = 1.5; c.stroke();
            g.rect(ax - 2, ay, 4, 12, C.ivory);
            g.rect(ax + 5, ay - 30, 2, 44, C.bronze);

            // Gap indicator line (faint)
            c.globalAlpha = 0.35;
            c.strokeStyle = '#ff9a20'; c.lineWidth = 1.5;
            c.setLineDash([4, 4]);
            c.beginPath(); c.moveTo(ax, ay - 8); c.lineTo(hx, hy - 8); c.stroke();
            c.setLineDash([]);
            c.globalAlpha = 1;

            // Stamina bar
            g.rect(6, H - 22, W - 12, 6, '#0c1428');
            g.rect(6, H - 22, (W - 12) * clamp(this.stamina / 100, 0, 1), 6, isBoost ? C.gold : '#ff9a20');

            api.topBar('BOOK V — THE CHASE');
            api.txt('GAP: ' + Math.ceil(this.gap), 6, 20, 8, C.bronze);
            api.txt('TIME ' + Math.ceil(this.timeLeft), W - 75, 20, 7,
              this.timeLeft < 8 ? C.blood : C.sea);
            api.txtC('HOLD TO SPRINT', W / 2, H - 28, 7, C.slate);

          } else {
            // DUEL PHASE
            // Catch flash
            if (this.catchFlash > 0) {
              c.globalAlpha = Math.min(1, this.catchFlash * 1.5);
              c.fillStyle = '#ff9a20'; c.fillRect(0, 0, W, H);
              c.globalAlpha = 1;
            }

            // Ground
            c.fillStyle = '#140e06'; c.fillRect(0, H * 0.58, W, H * 0.42);
            c.globalAlpha = 0.15; g.rect(0, H * 0.58, W, 1, C.bronze); c.globalAlpha = 1;

            // Achilles (left, large warrior)
            const axd = W * 0.28, ayd = H * 0.44;
            c.fillStyle = C.bronze;
            c.beginPath(); c.arc(axd, ayd, 18, Math.PI, 0);
            c.lineTo(axd + 18, ayd + 10); c.lineTo(axd - 18, ayd + 10); c.closePath(); c.fill();
            g.rect(axd - 3, ayd - 38, 6, 16, C.blood); // crest
            g.rect(axd - 9, ayd + 8, 18, 36, C.ivory); // body
            g.rect(axd - 10, ayd + 44, 9, 22, C.ivory); // left leg
            g.rect(axd + 1, ayd + 44, 9, 22, C.ivory); // right leg
            // Spear (animated during strike)
            if (this.strikeFlash > 0) {
              const extLen = 30 + (0.6 - this.strikeFlash) * 90;
              g.rect(axd + 18, ayd - 10, 3, Math.min(80, extLen), C.gold);
              // Glow
              c.globalAlpha = this.strikeFlash * 1.2;
              c.strokeStyle = '#ffee60'; c.lineWidth = 6;
              c.beginPath(); c.moveTo(axd + 20, ayd - 10); c.lineTo(axd + 20, ayd - 10 + Math.min(80, extLen)); c.stroke();
              c.globalAlpha = 1;
            } else {
              g.rect(axd + 18, ayd - 10, 2, 68, C.slate);
            }

            // Hector (right)
            const hxd = W * 0.72, hyd = H * 0.44;
            c.fillStyle = C.blue;
            c.beginPath(); c.arc(hxd, hyd, 18, Math.PI, 0);
            c.lineTo(hxd + 18, hyd + 10); c.lineTo(hxd - 18, hyd + 10); c.closePath(); c.fill();
            g.rect(hxd - 3, hyd - 38, 6, 16, C.plume);
            g.rect(hxd - 9, hyd + 8, 18, 36, C.slate);
            g.rect(hxd - 10, hyd + 44, 9, 22, C.slate);
            g.rect(hxd + 1, hyd + 44, 9, 22, C.slate);
            // Hector's shield
            c.fillStyle = C.shield;
            c.beginPath(); c.ellipse(hxd - 22, hyd + 4, 14, 22, 0.15, 0, Math.PI * 2); c.fill();
            c.strokeStyle = C.bronze; c.lineWidth = 2; c.stroke();
            g.circle(hxd - 22, hyd + 4, 5, C.bronze);
            // Hector spear
            g.rect(hxd + 18, hyd - 14, 2, 70, C.slate);

            // Strike messages
            for (let mi = 0; mi < this.msgs.length; mi++) {
              const m = this.msgs[mi];
              c.globalAlpha = Math.min(1, m.t * 2);
              api.txtC(m.txt, m.x, m.y, 13, m.col);
              c.globalAlpha = 1;
            }

            // Strike count stars
            for (let si = 0; si < 3; si++) {
              const sc = si < this.strikes ? C.gold : '#1a2440';
              api.txtC('★', W / 2 + (si - 1) * 22, H - 92, 12, sc);
            }

            // GAUGE
            const gaugeY = H - 68, gaugeW = W - 36;
            g.rect(18, gaugeY, gaugeW, 20, '#0c1428');
            // Strike zone (gold)
            const zoneStart = gaugeW * 0.54, zoneW = gaugeW * 0.40;
            g.rect(18 + zoneStart, gaugeY, zoneW, 20, '#142808');
            c.strokeStyle = C.green; c.lineWidth = 1;
            c.strokeRect(18 + zoneStart, gaugeY, zoneW, 20);
            api.txtC('STRIKE ZONE', 18 + zoneStart + zoneW / 2, gaugeY + 13, 5, C.green);
            // Needle
            const needleX = 18 + this.gauge * gaugeW;
            g.rect(needleX - 4, gaugeY - 5, 8, 30, '#ff9a20');
            c.fillStyle = C.gold;
            c.beginPath(); c.moveTo(needleX, gaugeY - 9); c.lineTo(needleX - 5, gaugeY - 2); c.lineTo(needleX + 5, gaugeY - 2); c.closePath(); c.fill();

            api.topBar('BOOK V — THE DUEL');
            api.txtC('STRIKES: ' + this.strikes + ' / 3', W / 2, 20, 8, C.gold);
            api.txtC('TAP IN THE ZONE!', W / 2, H - 32, 7, C.slate);
          }
        },
      },

    ],
  });

})();
