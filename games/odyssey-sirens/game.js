/* ============================================================================
 * SONG OF THE SIRENS — ODYSSEUS' PERILOUS PASSAGE
 * Five crossings from the treacherous heart of Homer's Odyssey (c. 800 BCE):
 *   1. THE BAG OF WINDS    — balance the storm-tossed ship (hold tilt meter)
 *   2. THE BOOK OF THE DEAD — tap sacred shades at the underworld's edge
 *   3. LASHED TO THE MAST   — catch silver notes, resist siren gold (rhythm)
 *   4. SCYLLA'S MAW         — dodge six-headed snaps in the straits (pattern)
 *   5. WRATH OF POSEIDON    — steer a raft home through divine fury (lane dodge)
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── Palette: wine-dark Aegean, terracotta, ivory & siren gold ─── */
  const C = {
    ink:    '#000000',
    navy:   '#0000BC',
    deep:   '#0000FC',
    sea:    '#0078F8',
    foam:   '#3CBCFC',
    stars:  '#F8F8F8',
    ivory:  '#FCE0A8',
    bone:   '#BCBCBC',
    gold:   '#F8B800',
    amber:  '#AC7C00',
    terra:  '#F83800',
    crimson:'#A81000',
    dusk:   '#881400',
    olive:  '#503000',
    green:  '#00B800',
    pink:   '#F878F8',
    plum:   '#940084',
  };

  /* ─── Emblem: siren's lyre over a wine-dark wave ─── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Lyre body
    c.fillStyle = C.amber;
    c.beginPath();
    c.moveTo(cx - 14, cy + 16);
    c.lineTo(cx - 18, cy - 6);
    c.lineTo(cx + 18, cy - 6);
    c.lineTo(cx + 14, cy + 16);
    c.closePath(); c.fill();
    // Cross-bar (gold)
    g.rect(cx - 18, cy - 10, 36, 4, C.gold);
    // Arms reaching upward
    c.strokeStyle = C.gold; c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx - 18, cy - 6); c.lineTo(cx - 14, cy - 34); c.stroke();
    c.beginPath(); c.moveTo(cx + 18, cy - 6); c.lineTo(cx + 14, cy - 34); c.stroke();
    // Top cross-bar
    g.rect(cx - 14, cy - 38, 28, 4, C.amber);
    // Strings (5)
    for (let i = 0; i < 5; i++) {
      const sx = cx - 10 + i * 5;
      g.rect(sx, cy - 34, 1, 46, i % 2 === 0 ? C.ivory : C.foam);
    }
    // Wave at base
    c.strokeStyle = C.sea; c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx - 30, cy + 26);
    for (let wx = -30; wx <= 30; wx += 8) {
      c.lineTo(cx + wx + 4, cy + 22);
      c.lineTo(cx + wx + 8, cy + 26);
    }
    c.stroke();
  }

  /* ─── Scenery: wine-dark Aegean night sky ─── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // STAR CONSTELLATION MAP — 5 nodes as stars in the Aegean sky
      c.fillStyle = C.ink; c.fillRect(0, 0, W, H);
      // Stars (60 scattered)
      for (let i = 0; i < 62; i++) {
        const sx = (i * 73 + 11) % W;
        const sy = (i * 47 + 5) % Math.floor(H * 0.82);
        const blink = 0.25 + 0.55 * Math.abs(Math.sin(t * 1.1 + i * 0.73));
        c.globalAlpha = blink;
        g.rect(sx, sy, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1, C.stars);
        c.globalAlpha = 1;
      }
      // Wine-dark sea at base
      c.fillStyle = C.navy; c.fillRect(0, H * 0.83, W, H * 0.17);
      for (let wi = 0; wi < 3; wi++) {
        const wy = H * 0.85 + wi * 14 + Math.sin(t * 1.4 + wi) * 3;
        c.globalAlpha = 0.32; g.rect(0, wy, W, 2, C.foam); c.globalAlpha = 1;
      }
      // Constellation lines between chapter stars
      // Node centers: 0=(70,102), 1=(200,142), 2=(135,232), 3=(58,334), 4=(205,390)
      const NODES = [[70,102],[200,142],[135,232],[58,334],[205,390]];
      const LINKS = [[0,1],[1,2],[2,3],[3,4]];
      c.lineWidth = 1;
      for (const [a, b] of LINKS) {
        const [ax,ay] = NODES[a], [bx,by] = NODES[b];
        c.setLineDash([4, 6]);
        c.globalAlpha = 0.42 + 0.18 * Math.sin(t * 0.8 + a);
        c.strokeStyle = C.amber;
        c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
        c.globalAlpha = 1;
        c.setLineDash([]);
      }
    } else {
      // Night sea — for boot, intro, result, finale
      c.fillStyle = C.ink; c.fillRect(0, 0, W, H);
      // Stars
      for (let i = 0; i < 40; i++) {
        const sx = (i * 71 + 17) % W;
        const sy = (i * 43 + 9) % Math.floor(H * 0.40);
        c.globalAlpha = 0.18 + 0.48 * Math.abs(Math.sin(t * 0.9 + i * 0.6));
        g.rect(sx, sy, 1, 1, C.stars);
        c.globalAlpha = 1;
      }
      // Crescent moon
      g.circle(W - 46, 42, 16, C.ivory);
      g.circle(W - 40, 36, 13, C.ink);
      // Horizon sea
      c.fillStyle = C.navy; c.fillRect(0, H * 0.44, W, H * 0.56);
      for (let wi = 0; wi < 6; wi++) {
        const wy = H * 0.47 + wi * 22 + Math.sin(t * 1.3 + wi * 0.8) * 5;
        c.globalAlpha = 0.14; g.rect(0, wy, W, 2, C.foam); c.globalAlpha = 1;
      }
      // Ship silhouette bobbing
      const shx = W * 0.35 + Math.sin(t * 0.48) * 9;
      const shy = H * 0.44;
      c.fillStyle = C.olive;
      c.beginPath();
      c.moveTo(shx - 24, shy); c.lineTo(shx - 18, shy + 10);
      c.lineTo(shx + 18, shy + 10); c.lineTo(shx + 28, shy);
      c.closePath(); c.fill();
      g.rect(shx - 2, shy - 34, 4, 34, C.amber);
      c.fillStyle = C.stars; c.globalAlpha = 0.65;
      c.beginPath(); c.moveTo(shx, shy - 32); c.lineTo(shx + 24, shy - 12); c.lineTo(shx, shy - 4); c.closePath(); c.fill();
      c.globalAlpha = 1;

      if (scene === 'intro' || scene === 'result' || scene === 'finale') {
        c.fillStyle = 'rgba(0,0,14,.78)'; c.fillRect(0, 0, W, H);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════
   * RETROSAGA CONFIG
   * ══════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id: 'odyssey-sirens',
    title: 'SONG OF THE SIRENS',
    subtitle: 'THE ODYSSEY',
    currency: 'GLORY',

    screens: {
      win:          C.gold,
      lose:         C.terra,
      chapterLabel: C.amber,
      name:         C.ivory,
      sub:          C.foam,
      intro:        C.ivory,
      quote:        C.bone,
      help:         C.gold,
      score:        C.ivory,
      cur:          C.gold,
      cta:          C.ivory,
      overlay:      'rgba(0,0,14,.88)',
    },
    labels: {
      chapter:  'CROSSING',
      score:    'GLORY EARNED',
      win:      'THE SEA OPENS BEFORE YOU',
      lose:     'THE WINE-DARK SEA CLAIMS YOU',
      cont:     'TAP TO SAIL ON',
      finale:   'TAP FOR THE FINAL CROSSING',
      toMenu:   'RETURN TO THE STARS',
      play:     'TAP TO SAIL',
    },

    accent:   C.gold,
    credit:   'THE ODYSSEY · HOMER · c. 800 BCE',
    emblem,
    scenery,
    bootCta:  'TAP TO SAIL',
    bootLine: 'FIVE CROSSINGS · ONE JOURNEY HOME',
    menuLabel:'THE STARS OF THE VOYAGE',
    menuHint: 'CHOOSE A CROSSING',
    menuDone: '★  ITHACA REACHED  ★',

    /* ── Menu: constellation star map ── */
    menu: {
      colors: { title: C.gold, label: C.bone, cur: C.ivory, hint: C.bone },

      layout: function () {
        return [
          { x: 28,  y: 60,  w: 84, h: 84 },   // Aeolus    center (70, 102)
          { x: 158, y: 100, w: 84, h: 84 },   // Nekyia    center (200, 142)
          { x: 93,  y: 190, w: 84, h: 84 },   // Sirens    center (135, 232)
          { x: 16,  y: 292, w: 84, h: 84 },   // Scylla    center (58, 334)
          { x: 163, y: 348, w: 84, h: 84 },   // Poseidon  center (205, 390)
        ];
      },

      title: function (api, glory) {
        const g = api.gfx, W = api.W;
        g.rect(0, 0, W, 54, C.ink);
        api.txtC('SONG OF THE SIRENS', W / 2, 8,  9, C.gold, true);
        api.txtC('THE VOYAGE',         W / 2, 28, 8, C.bone);
        api.txtC('GLORY  ' + glory,    W / 2, 42, 8, C.ivory);
        g.rect(0, 54, W, 1, C.amber);
      },

      card: function (api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2, cy = y + h / 2;
        const r = Math.min(w, h) * 0.44;

        // Selection outer glow
        if (sel) {
          c.globalAlpha = 0.28;
          g.circle(cx, cy, r + 7, C.gold);
          c.globalAlpha = 1;
        }

        // Circle fill
        c.fillStyle = done ? '#503000' : (sel ? C.navy : C.ink);
        c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();

        // Outer ring
        c.strokeStyle = (sel || done) ? C.gold : C.amber;
        c.lineWidth = sel ? 3 : 2;
        c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();

        // Inner dashed ring (Greek meander approximation)
        c.strokeStyle = done ? C.amber : '#0000BC';
        c.lineWidth = 1;
        c.setLineDash([3, 4]);
        c.beginPath(); c.arc(cx, cy, r * 0.76, 0, Math.PI * 2); c.stroke();
        c.setLineDash([]);

        // Centre star dot
        g.rect(cx - 1, cy - 1, 3, 3, done ? C.gold : (sel ? C.ivory : C.bone));

        // Chapter icon
        if (ch.icon) ch.icon(api, cx, cy - 8);

        // Name
        api.txtCFit(ch.name, cx, cy + 16, 7, done ? C.gold : C.ivory, false, w - 14);
        if (done) api.txtC('★', cx, cy + 32, 9, C.gold);
        else if (sel) api.txtC('▶', cx, cy + 32, 8, C.ivory);
      },
    },

    finale: [
      'THE SEA PARTS FOR ODYSSEUS.',
      'ITHACA GLEAMS ON THE HORIZON.',
      '',
      'TWENTY YEARS OF WANDERING DONE.',
      'THE LYRE OF THE SIRENS FADES.',
      '',
      'HOME AT LAST.',
    ],

    width: 270, height: 480, parent: '#game',

    /* ══════════════════════════════════════════════════════════════════
     * CHAPTERS
     * ══════════════════════════════════════════════════════════════════ */
    chapters: [

      /* ═══ CROSSING I — THE BAG OF WINDS ═══ */
      {
        id: 'aeolus', name: 'BAG OF WINDS', sub: 'AEOLUS\' ISLE',

        icon: function (api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Bag
          c.fillStyle = C.amber;
          c.beginPath(); c.arc(x, y - 4, 9, 0, Math.PI * 2); c.fill();
          g.rect(x - 4, y + 4, 8, 6, C.amber);
          g.rect(x - 2, y - 15, 4, 4, C.gold);
          // Wind lines
          c.strokeStyle = C.foam; c.lineWidth = 1.5;
          for (let wi = 0; wi < 3; wi++) {
            c.beginPath();
            c.moveTo(x + 8, y - 4 + wi * 5);
            c.lineTo(x + 18, y - 5 + wi * 5);
            c.stroke();
          }
        },

        intro: [
          'AEOLUS, KEEPER OF THE WINDS,',
          'GAVE ODYSSEUS A LEATHER BAG',
          'CONTAINING EVERY HOSTILE GALE.',
          'The crew opened it while he slept.',
        ],
        quote: '"Fools — they thought there was gold inside, and let loose all the winds. The sea seethed." — Homer, Odyssey X',
        help: 'Hold LEFT / RIGHT (or tap sides) to balance the tiller! Keep the marker in the safe zone for 22 seconds!',
        winText: 'The gale dies. Odysseus lashes the tattered sail and points the prow eastward once more.',
        loseText: 'The ship rolls broadside. Walls of dark water crash over the hull.',

        init: function (api) {
          this.tilt     = 0;      // -100 = lean left, +100 = lean right
          this.lives    = 3;
          this.hitCool  = 0;
          this.timeLeft = 22;
          this.gustDir  = 1;
          this.gustStr  = 0;
          this.nextGust = 1.0;
          this.t        = 0;
          this.wind     = [];     // visual wind streaks
        },

        update: function (api, dt) {
          this.t += dt;
          this.timeLeft -= dt;
          if (this.timeLeft <= 0) { api.win(); return; }

          // Spawn gusts
          this.nextGust -= dt;
          if (this.nextGust <= 0) {
            this.gustDir = api.chance(0.5) ? 1 : -1;
            this.gustStr = 22 + api.rnd(0, 24);
            this.nextGust = 0.9 + api.rnd(0, 1.0);
            for (let i = 0; i < 5; i++) {
              const fromLeft = this.gustDir < 0;
              this.wind.push({
                x: fromLeft ? -12 : api.W + 12,
                y: 50 + api.rnd(0, api.H - 120),
                vx: this.gustDir * (38 + api.rnd(0, 28)),
                t: 1.1,
              });
            }
          }
          this.tilt += this.gustDir * this.gustStr * dt;
          this.wind = this.wind.filter(p => { p.x += p.vx * dt; p.t -= dt; return p.t > 0 && p.x > -20 && p.x < api.W + 20; });

          // Player control
          let ctrl = 0;
          if (api.keyDown('left'))  ctrl -= 1;
          if (api.keyDown('right')) ctrl += 1;
          if (api.pointer.down) ctrl += api.pointer.x < api.W / 2 ? -1 : 1;
          this.tilt += ctrl * 58 * dt;
          this.tilt = clamp(this.tilt, -100, 100);

          // Damage when tilt too extreme
          this.hitCool = Math.max(0, this.hitCool - dt);
          if (this.hitCool <= 0 && Math.abs(this.tilt) > 80) {
            this.lives--;
            this.hitCool = 1.9;
            this.tilt *= 0.22;
            api.shake(7, 0.35); api.flash(C.terra, 0.22); api.audio.sfx('hurt');
            if (this.lives <= 0) { api.lose(); return; }
          }
          api.score = Math.floor((22 - this.timeLeft) * 5);
        },

        draw: function (api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Stormy sky
          c.fillStyle = C.ink; c.fillRect(0, 0, W, H * 0.44);
          // Storm clouds (chunky rects, NES-style)
          for (let ci = 0; ci < 6; ci++) {
            const cw = 44 + (ci * 17) % 28;
            const cx2 = (ci * 52 + this.t * 10) % (W + 60) - 30;
            const cy2 = 20 + (ci * 13) % 50;
            g.rect(cx2, cy2, cw, 14, C.navy);
            g.rect(cx2 + 8, cy2 - 7, cw - 16, 8, C.navy);
          }
          // Faint stars
          for (let i = 0; i < 12; i++) {
            g.rect((i * 47 + 11) % W, 4 + (i * 31) % 28, 1, 1, C.stars);
          }
          // Sea
          c.fillStyle = C.navy; c.fillRect(0, H * 0.44, W, H * 0.56);
          for (let wi = 0; wi < 9; wi++) {
            const wy = H * 0.47 + wi * 24 + Math.sin(this.t * 2.3 + wi * 0.9) * 9;
            c.globalAlpha = 0.16; g.rect(0, wy, W, 3, C.foam); c.globalAlpha = 1;
          }
          // Wind streaks
          for (const p of this.wind) {
            c.globalAlpha = p.t * 0.45;
            g.rect(p.x, p.y, 10, 2, C.foam);
            g.rect(p.x - 5, p.y - 1, 6, 1, C.foam);
            c.globalAlpha = 1;
          }
          // Ship tilted by tilt value
          const tiltAng = this.tilt / 100 * 0.44;
          c.save();
          c.translate(W / 2, H * 0.40);
          c.rotate(tiltAng);
          // Hull
          c.fillStyle = this.hitCool > 0 ? C.terra : C.amber;
          c.beginPath();
          c.moveTo(-38, 8); c.lineTo(-30, 20); c.lineTo(30, 20); c.lineTo(40, 8);
          c.closePath(); c.fill();
          g.rect(-30, 18, 60, 7, C.olive);
          g.rect(-2, -50, 4, 52, C.amber);
          // Torn sail
          c.fillStyle = C.bone; c.globalAlpha = 0.65;
          c.beginPath(); c.moveTo(0,-48); c.lineTo(26,-28); c.lineTo(0,-12); c.closePath(); c.fill();
          c.globalAlpha = 1;
          for (let oi = -2; oi <= 2; oi++) g.rect(oi * 10 - 1, 18, 2, 12, C.olive);
          c.restore();

          // Balance bar
          const barX = 16, barY = H - 28, barW = W - 32, barH = 10;
          g.rect(barX, barY, barW, barH, C.ink);
          // Danger zones (red)
          g.rect(barX, barY, Math.floor(barW * 0.18), barH, C.crimson);
          g.rect(barX + Math.floor(barW * 0.82), barY, Math.ceil(barW * 0.18), barH, C.crimson);
          // Safe zone
          g.rect(barX + Math.floor(barW * 0.18), barY, Math.floor(barW * 0.64), barH, C.navy);
          // Indicator
          const indX = Math.floor(barX + barW * (this.tilt + 100) / 200);
          g.rect(indX - 3, barY - 3, 6, barH + 6, Math.abs(this.tilt) > 80 ? C.terra : C.gold);

          // HUD
          api.topBar('CROSSING I — BAG OF WINDS');
          api.txt('TIME ' + Math.ceil(this.timeLeft), 6, 20, 8, this.timeLeft < 8 ? C.terra : C.foam);
          for (let li = 0; li < 3; li++) g.rect(W - 52 + li * 16, 4, 11, 9, li < this.lives ? C.green : C.crimson);
          api.txtC('BALANCE THE TILLER', W / 2, H - 42, 7, C.bone);
        },
      },

      /* ═══ CROSSING II — THE BOOK OF THE DEAD ═══ */
      {
        id: 'nekyia', name: 'BOOK OF THE DEAD', sub: 'OCEAN\'S EDGE',

        icon: function (api, x, y) {
          const g = api.gfx;
          g.circle(x, y - 8, 7, C.bone);
          g.rect(x - 4, y - 2, 8, 12, C.bone);
          g.rect(x - 5, y + 8, 4, 6, C.bone);
          g.rect(x + 1, y + 8, 4, 6, C.bone);
        },

        intro: [
          'ON THE FAR SHORE OF THE OCEAN',
          'ODYSSEUS POURS BLOOD INTO THE TRENCH',
          'to summon the shades of the dead.',
          'Call the sacred ones — and none other.',
        ],
        quote: '"First came Elpenor — then wise Tiresias with his golden staff." — Homer, Odyssey XI',
        help: 'TAP the glowing sacred shades: Tiresias (white staff), Achilles (gold armour), Anticlea (pink veil). Avoid grey shades!',
        winText: 'Tiresias speaks the prophecy. Odysseus turns back to the ship, heart heavy with what he now knows.',
        loseText: 'The wrong shades crowd the pit. Tiresias cannot speak, and Odysseus flees without his answer.',

        init: function (api) {
          this.shades    = [];
          this.spawnT    = 0.1;
          this.summoned  = 0;
          this.need      = 8;
          this.wrong     = 0;
          this.maxWrong  = 4;
          this.timeLeft  = 30;
          this.t         = 0;
          this.rings     = [];
        },

        update: function (api, dt) {
          this.t += dt;
          this.timeLeft -= dt;
          if (this.timeLeft <= 0) {
            if (this.summoned >= this.need) api.win(); else api.lose();
            return;
          }

          // Spawn shades
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            const fromLeft = api.chance(0.5);
            const sacred   = api.chance(0.36);
            const type     = sacred ? api.rint(0, 2) : 3; // 0=Tiresias,1=Achilles,2=Anticlea,3=common
            this.shades.push({
              x: fromLeft ? -20 : api.W + 20,
              y: 80 + api.rnd(0, api.H - 150),
              vx: fromLeft ? (26 + api.rnd(0, 18)) : -(26 + api.rnd(0, 18)),
              type,
              hit: false,
              w: 0,
            });
            this.spawnT = 0.80 + api.rnd(0, 0.45);
          }
          for (let i = 0; i < this.shades.length; i++) {
            const s = this.shades[i]; s.x += s.vx * dt; s.w += dt * 2.4;
          }
          this.shades = this.shades.filter(s => !s.hit && s.x > -32 && s.x < api.W + 32);
          this.rings  = this.rings.filter(r => { r.t -= dt; r.r += 42 * dt; return r.t > 0; });

          // Tap
          if (api.pointer.justDown) {
            const px = api.pointer.x, py = api.pointer.y;
            for (let j = this.shades.length - 1; j >= 0; j--) {
              const s = this.shades[j];
              if (Math.abs(px - s.x) < 22 && Math.abs(py - s.y) < 22) {
                s.hit = true;
                if (s.type < 3) {
                  this.summoned++;
                  const col = [C.ivory, C.gold, C.pink][s.type];
                  this.rings.push({ x: s.x, y: s.y, r: 4, t: 0.55, col });
                  api.burst(s.x, s.y, col, 8);
                  api.audio.sfx('coin'); api.addScore(20);
                  if (this.summoned >= this.need) { api.win(); return; }
                } else {
                  this.wrong++;
                  api.shake(4, 0.2); api.flash(C.terra, 0.14); api.audio.sfx('hurt');
                  if (this.wrong >= this.maxWrong) { api.lose(); return; }
                }
                break;
              }
            }
          }
        },

        draw: function (api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Underworld: deep black
          c.fillStyle = C.ink; c.fillRect(0, 0, W, H);
          // Asphodel field
          c.fillStyle = C.olive; c.fillRect(0, H * 0.82, W, H * 0.18);
          for (let i = 0; i < 22; i++) {
            const ax = (i * 13) % W;
            g.rect(ax, H * 0.82 - 10, 1, 12, C.bone);
            g.circle(ax, H * 0.82 - 10, 3, C.bone);
          }
          // Blood trench (red)
          g.circle(W / 2, H * 0.84 + 8, 22, C.crimson);
          g.circle(W / 2, H * 0.84 + 8, 14, C.terra);
          g.circle(W / 2, H * 0.84 + 8, 6, C.dusk);
          // Wisps of fog
          for (let fi = 0; fi < 5; fi++) {
            const fx = ((this.t * (7 + fi * 3) + fi * 50) % (W + 60)) - 30;
            const fy = H * 0.52 + fi * 28 + Math.sin(this.t * 0.8 + fi) * 10;
            c.globalAlpha = 0.1 + 0.04 * Math.sin(this.t + fi);
            g.rect(fx, fy, 52, 14, C.bone); c.globalAlpha = 1;
          }

          // Shades
          for (let i = 0; i < this.shades.length; i++) {
            const s = this.shades[i];
            const wobY = Math.sin(s.w) * 3;
            const col = [C.ivory, C.gold, C.pink, C.bone][s.type];
            // Sacred halo
            if (s.type < 3) {
              c.globalAlpha = 0.28 + 0.18 * Math.sin(this.t * 3 + i);
              g.circle(s.x, s.y + wobY, 18, col); c.globalAlpha = 1;
            }
            // Ghost body
            const sz = s.type < 3 ? 9 : 7;
            g.circle(s.x, s.y - 8 + wobY, sz, col);
            g.rect(s.x - sz + 1, s.y - 2 + wobY, sz * 2 - 2, 13, col);
            g.rect(s.x - sz + 1, s.y + 9 + wobY, sz - 2, 6, col);
            g.rect(s.x + 1, s.y + 9 + wobY, sz - 2, 6, col);
            // Type details
            if (s.type === 0) { g.rect(s.x + sz, s.y - 18 + wobY, 2, 22, C.gold); g.circle(s.x + sz + 1, s.y - 20 + wobY, 3, C.gold); }
            else if (s.type === 1) { g.rect(s.x - sz + 1, s.y - 3 + wobY, sz * 2 - 2, 6, C.amber); }
            else if (s.type === 2) { g.rect(s.x - sz - 1, s.y - 2 + wobY, sz * 2 + 2, 2, C.pink); }
          }

          // Tap rings
          for (const r of this.rings) {
            c.globalAlpha = r.t * 1.6;
            c.strokeStyle = r.col; c.lineWidth = 2;
            c.beginPath(); c.arc(r.x, r.y, r.r, 0, Math.PI * 2); c.stroke();
            c.globalAlpha = 1;
          }

          // HUD
          api.topBar('CROSSING II — BOOK OF THE DEAD');
          api.txt('SUMMONED ' + this.summoned + '/' + this.need, 6, 20, 7, C.ivory);
          api.txt('WRONG ' + this.wrong + '/' + this.maxWrong, W - 80, 20, 7, this.wrong > 2 ? C.terra : C.bone);
          g.rect(6, H - 10, W - 12, 6, C.ink);
          g.rect(6, H - 10, Math.floor((W - 12) * clamp(this.summoned / this.need, 0, 1)), 6, C.ivory);
        },
      },

      /* ═══ CROSSING III — LASHED TO THE MAST ═══ */
      {
        id: 'sirens', name: 'LASHED TO MAST', sub: 'THE SIREN\'S ISLE',

        icon: function (api, x, y) {
          const g = api.gfx;
          g.circle(x - 5, y, 7, C.gold);
          g.rect(x + 1, y - 10, 2, 12, C.gold);
          g.rect(x + 1, y - 12, 6, 3, C.gold);
        },

        intro: [
          'THE SIREN\'S ISLE DRAWS NEAR.',
          'ODYSSEUS COMMANDS THE CREW:',
          '\'LASH ME TO THE MAST!\'',
          'They stop their ears. He alone will hear.',
        ],
        quote: '"They sang with ravishing beauty — and I commanded my crew to free me, but they rowed on." — Homer, Odyssey XII',
        help: 'Move LEFT / RIGHT between columns. CATCH the silver seafoam notes. AVOID the golden siren notes!',
        winText: 'The isle falls astern. Odysseus screams and strains at his ropes — but the song fades into the sea.',
        loseText: 'The golden song overwhelms you. Odysseus tears at his bonds and the ship turns toward the rocks.',

        init: function (api) {
          this.lane      = 1;
          this.LANES     = [45, 135, 225];
          this.notes     = [];
          this.spawnT    = 0.7;
          this.caught    = 0;
          this.need      = 15;
          this.lured     = 0;
          this.maxLured  = 4;
          this.timeLeft  = 32;
          this.t         = 0;
          this.lastKeyT  = 0;
        },

        update: function (api, dt) {
          this.t += dt;
          this.timeLeft -= dt;
          if (this.timeLeft <= 0) {
            if (this.caught >= this.need) api.win(); else api.lose();
            return;
          }

          // Movement
          this.lastKeyT = Math.max(0, this.lastKeyT - dt);
          if (this.lastKeyT <= 0) {
            if (api.keyPressed('left')  && this.lane > 0) { this.lane--; this.lastKeyT = 0.16; api.audio.sfx('blip'); }
            if (api.keyPressed('right') && this.lane < 2) { this.lane++; this.lastKeyT = 0.16; api.audio.sfx('blip'); }
          }
          if (api.pointer.justDown) {
            const px = api.pointer.x, W = api.W;
            const nl = px < W / 3 ? 0 : px < 2 * W / 3 ? 1 : 2;
            if (nl !== this.lane) { this.lane = nl; api.audio.sfx('blip'); }
          }

          // Spawn notes
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            const intensity = this.t / 22;
            this.spawnT = Math.max(0.48, 0.88 - intensity * 0.24);
            this.notes.push({
              lane: api.rint(0, 2),
              y: -16,
              isSiren: api.chance(0.40 + intensity * 0.08),
              spd: 92 + intensity * 30,
              wob: api.rnd(0, Math.PI * 2),
              counted: false,
            });
          }

          // Move notes and check hits
          for (let i = 0; i < this.notes.length; i++) {
            const n = this.notes[i];
            n.y += n.spd * dt;
            n.wob += dt * 3;
            if (!n.counted && n.y >= api.H - 58) {
              n.counted = true;
              if (n.lane === this.lane) {
                if (!n.isSiren) {
                  this.caught++;
                  api.burst(this.LANES[n.lane], api.H - 58, C.foam, 7);
                  api.audio.sfx('coin'); api.addScore(14);
                  if (this.caught >= this.need) { api.win(); return; }
                } else {
                  this.lured++;
                  api.shake(5, 0.22); api.flash(C.gold, 0.18); api.audio.sfx('hurt');
                  if (this.lured >= this.maxLured) { api.lose(); return; }
                }
              }
            }
          }
          this.notes = this.notes.filter(n => n.y < api.H + 22);
        },

        draw: function (api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Dark sea approaching the isle
          c.fillStyle = C.navy; c.fillRect(0, 0, W, H);
          // Stars
          for (let i = 0; i < 24; i++) {
            const sx = (i * 59 + 13) % W, sy = 4 + (i * 37) % 58;
            c.globalAlpha = 0.28 + 0.38 * Math.sin(this.t * 0.9 + i * 0.8);
            g.rect(sx, sy, 1, 1, C.stars); c.globalAlpha = 1;
          }
          // Moon
          g.circle(W - 40, 36, 14, C.ivory);
          g.circle(W - 34, 30, 11, C.navy);
          // Sea below
          c.fillStyle = '#000030'; c.fillRect(0, H * 0.46, W, H * 0.54);
          for (let wi = 0; wi < 7; wi++) {
            const wy = H * 0.48 + wi * 22 + Math.sin(this.t * 1.8 + wi) * 5;
            c.globalAlpha = 0.12; g.rect(0, wy, W, 2, C.foam); c.globalAlpha = 1;
          }
          // Distant siren isle (rocks)
          c.fillStyle = C.olive;
          c.beginPath();
          c.moveTo(95, H * 0.46); c.lineTo(104, H * 0.46 - 24); c.lineTo(116, H * 0.46 - 10);
          c.lineTo(134, H * 0.46 - 32); c.lineTo(148, H * 0.46 - 14); c.lineTo(164, H * 0.46);
          c.closePath(); c.fill();
          // Siren silhouette (woman + wings)
          g.circle(134, H * 0.46 - 40, 6, C.plum);
          g.rect(130, H * 0.46 - 35, 8, 10, C.plum);
          g.rect(118, H * 0.46 - 36, 12, 6, C.plum);
          g.rect(140, H * 0.46 - 36, 12, 6, C.plum);

          // Lane dividers
          c.globalAlpha = 0.10;
          g.rect(90, 56, 1, H - 112, C.bone);
          g.rect(180, 56, 1, H - 112, C.bone);
          c.globalAlpha = 1;

          // Notes
          for (let ni = 0; ni < this.notes.length; ni++) {
            const n = this.notes[ni];
            const nx = this.LANES[n.lane];
            const ny = n.y + Math.sin(n.wob) * 3;
            if (n.isSiren) {
              // Gold siren note: filled circle
              g.circle(nx, ny, 9, C.gold);
              g.rect(nx + 2, ny - 10, 2, 10, C.gold);
              g.rect(nx + 2, ny - 12, 6, 3, C.gold);
            } else {
              // Silver seafoam note: hollow ring
              c.strokeStyle = C.foam; c.lineWidth = 2;
              c.beginPath(); c.arc(nx, ny, 8, 0, Math.PI * 2); c.stroke();
              g.rect(nx - 1, ny - 1, 3, 3, C.foam);
            }
          }

          // Odysseus lashed to mast (at bottom of active lane)
          const px = this.LANES[this.lane];
          const py = H - 56;
          g.rect(px - 2, py - 50, 4, 54, C.amber);
          // Ropes
          g.rect(px - 12, py - 38, 24, 3, C.olive);
          g.rect(px - 10, py - 22, 20, 3, C.olive);
          g.rect(px - 8, py - 8, 16, 3, C.olive);
          // Odysseus figure
          g.circle(px, py - 60, 8, C.ivory);
          g.rect(px - 6, py - 52, 12, 14, C.sea);
          // Arms straining
          g.rect(px - 16, py - 46, 10, 3, C.ivory);
          g.rect(px + 6, py - 46, 10, 3, C.ivory);

          // HUD
          api.topBar('CROSSING III — LASHED TO THE MAST');
          api.txt('SILVER ' + this.caught + '/' + this.need, 6, 20, 7, C.foam);
          api.txt('LURED ' + this.lured + '/' + this.maxLured, W - 82, 20, 7, this.lured > 2 ? C.terra : C.bone);
          g.rect(6, H - 10, W - 12, 6, C.ink);
          g.rect(6, H - 10, Math.floor((W - 12) * clamp(this.caught / this.need, 0, 1)), 6, C.foam);
        },
      },

      /* ═══ CROSSING IV — SCYLLA'S MAW ═══ */
      {
        id: 'scylla', name: 'SCYLLA\'S MAW', sub: 'THE STRAITS',

        icon: function (api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Three serpent heads
          for (let hi = 0; hi < 3; hi++) {
            const hx = x - 8 + hi * 8, hy = y - 8;
            g.rect(hx - 1, hy - 8, 6, 9, C.terra);
            c.fillStyle = C.crimson;
            c.beginPath(); c.moveTo(hx - 1, hy); c.lineTo(hx + 2, hy + 6); c.lineTo(hx + 5, hy); c.closePath(); c.fill();
          }
        },

        intro: [
          'BETWEEN TWO CLIFF-FACES ROAR',
          'SCYLLA\'S SIX SERPENT HEADS ABOVE',
          'AND CHARYBDIS\' DARK WHIRLPOOL BELOW.',
          'Row fast. Do not look up.',
        ],
        quote: '"Six of my men were seized — I watched them screaming, reaching back toward me." — Homer, Odyssey XII',
        help: 'TAP LEFT / RIGHT to change lanes. When a head GLOWS RED it is about to strike — dodge it fast!',
        winText: 'The ship bursts clear of the straits. Six men are gone. Odysseus does not look back.',
        loseText: 'Scylla strikes from above with all six heads. The screams blend with Charybdis\' roar.',

        init: function (api) {
          this.lane     = 1;
          this.LANEX    = [45, 135, 225];
          this.lives    = 3;
          this.timeLeft = 22;
          this.t        = 0;
          this.heads    = [];     // { lane, phase:'warn'|'snap', t, warnDur, snapDur }
          this.nextHead = 1.6;
          this.lastKeyT = 0;
          this.hitCool  = 0;
          this.pops     = [];
        },

        update: function (api, dt) {
          this.t += dt;
          this.timeLeft -= dt;
          if (this.timeLeft <= 0) { api.win(); return; }

          // Lane switching
          this.lastKeyT = Math.max(0, this.lastKeyT - dt);
          if (this.lastKeyT <= 0) {
            if (api.keyPressed('left')  && this.lane > 0) { this.lane--; this.lastKeyT = 0.14; api.audio.sfx('blip'); }
            if (api.keyPressed('right') && this.lane < 2) { this.lane++; this.lastKeyT = 0.14; api.audio.sfx('blip'); }
          }
          if (api.pointer.justDown) {
            const px = api.pointer.x, W = api.W;
            const nl = px < W / 3 ? 0 : px < 2 * W / 3 ? 1 : 2;
            if (nl !== this.lane) { this.lane = nl; api.audio.sfx('blip'); }
          }

          // Spawn heads
          this.nextHead -= dt;
          if (this.nextHead <= 0) {
            const intensity = this.t / 18;
            this.nextHead = Math.max(0.85, 1.7 - intensity * 0.5);
            const n = intensity > 0.5 ? 2 : 1;
            const used = new Set();
            for (let hi = 0; hi < n; hi++) {
              let ln;
              let tries = 0;
              do { ln = api.rint(0, 2); tries++; } while (used.has(ln) && tries < 8);
              used.add(ln);
              this.heads.push({ lane: ln, phase: 'warn', t: 0, warnDur: 1.45, snapDur: 0.48 });
            }
          }

          // Update heads + collision
          this.hitCool = Math.max(0, this.hitCool - dt);
          for (let i = this.heads.length - 1; i >= 0; i--) {
            const h = this.heads[i];
            h.t += dt;
            if (h.phase === 'warn' && h.t >= h.warnDur) { h.phase = 'snap'; h.t = 0; api.audio.sfx('blip'); }
            if (h.phase === 'snap') {
              if (this.hitCool <= 0 && h.lane === this.lane && h.t < h.snapDur) {
                this.lives--;
                this.hitCool = 0.85;
                this.pops.push({ lane: h.lane, t: 0.5 });
                api.shake(6, 0.3); api.flash(C.crimson, 0.22); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
              }
              if (h.t >= h.snapDur) this.heads.splice(i, 1);
            }
          }
          this.pops = this.pops.filter(p => { p.t -= dt; return p.t > 0; });
          api.score = Math.floor((22 - this.timeLeft) * 7);
        },

        draw: function (api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Background
          c.fillStyle = C.navy; c.fillRect(0, 0, W, H);
          // Cliff walls
          c.fillStyle = C.olive; c.fillRect(0, 0, 20, H * 0.65); c.fillRect(W - 20, 0, 20, H * 0.65);
          // Water below cliffs
          c.fillStyle = C.ink; c.fillRect(20, H * 0.52, W - 40, H * 0.48);
          // Charybdis whirlpool (right)
          const wx = W - 28, wy = H * 0.72;
          for (let ri = 3; ri >= 1; ri--) {
            c.strokeStyle = ri === 3 ? C.deep : ri === 2 ? C.sea : C.foam;
            c.lineWidth = 2; c.globalAlpha = 0.55;
            c.beginPath();
            c.arc(wx, wy, ri * 11 + Math.sin(this.t * 3) * 2, 0, Math.PI * 1.6 + (this.t % (Math.PI * 2)));
            c.stroke(); c.globalAlpha = 1;
          }
          // Lane dim strips
          for (let li = 0; li < 3; li++) {
            c.globalAlpha = 0.06;
            g.rect(this.LANEX[li] - 30, 0, 60, H, li % 2 ? C.ink : C.navy);
            c.globalAlpha = 1;
          }

          // Scylla heads
          for (let i = 0; i < this.heads.length; i++) {
            const h = this.heads[i];
            const hx = this.LANEX[h.lane];
            const warnPct = h.phase === 'warn' ? h.t / h.warnDur : 1;
            const neckLen = h.phase === 'warn' ? Math.floor(40 + warnPct * 62) : Math.floor(102 - (h.t / h.snapDur) * 40);
            // Neck segments
            for (let nk = 0; nk < neckLen; nk += 8) {
              g.rect(hx - 6, nk + 2, 12, 7, nk % 16 === 0 ? C.terra : C.crimson);
            }
            // Head circle
            const headY = neckLen + 2;
            const col = h.phase === 'snap' ? C.crimson : C.terra;
            c.fillStyle = col;
            c.beginPath(); c.arc(hx, headY, 14, 0, Math.PI * 2); c.fill();
            g.rect(hx - 7, headY - 4, 4, 4, C.gold);
            g.rect(hx + 3, headY - 4, 4, 4, C.gold);
            if (h.phase === 'snap') {
              c.fillStyle = C.ivory;
              for (let ti = -9; ti <= 9; ti += 6) {
                c.beginPath(); c.moveTo(hx + ti, headY + 9); c.lineTo(hx + ti + 3, headY + 18); c.lineTo(hx + ti + 6, headY + 9); c.closePath(); c.fill();
              }
            }
            // Warn flash
            if (h.phase === 'warn' && Math.floor(warnPct * 8) % 2 === 0) {
              c.globalAlpha = 0.42;
              g.circle(hx, headY, 19, C.gold); c.globalAlpha = 1;
            }
          }

          // Hit pops
          for (const p of this.pops) {
            c.globalAlpha = p.t * 1.4;
            g.circle(this.LANEX[p.lane], H * 0.64, 20, C.crimson); c.globalAlpha = 1;
          }

          // Player ship (bottom center)
          const px = this.LANEX[this.lane];
          const py = H - 62;
          c.fillStyle = this.hitCool > 0 ? C.terra : C.amber;
          c.beginPath();
          c.moveTo(px - 26, py); c.lineTo(px - 20, py + 12); c.lineTo(px + 20, py + 12); c.lineTo(px + 28, py);
          c.closePath(); c.fill();
          g.rect(px - 2, py - 36, 4, 36, C.amber);
          c.fillStyle = C.bone; c.globalAlpha = 0.65;
          c.beginPath(); c.moveTo(px, py - 34); c.lineTo(px + 22, py - 15); c.lineTo(px, py - 6); c.closePath(); c.fill();
          c.globalAlpha = 1;
          for (let oi = -2; oi <= 2; oi++) g.rect(px + oi * 9 - 1, py + 10, 2, 10, C.olive);

          // HUD
          api.topBar('CROSSING IV — SCYLLA\'S MAW');
          api.txt('TIME ' + Math.ceil(this.timeLeft), 6, 20, 8, this.timeLeft < 8 ? C.terra : C.foam);
          for (let li = 0; li < 3; li++) g.rect(W - 52 + li * 16, 4, 11, 9, li < this.lives ? C.green : C.crimson);
        },
      },

      /* ═══ CROSSING V — WRATH OF POSEIDON ═══ */
      {
        id: 'poseidon', name: 'WRATH OF POSEIDON', sub: 'RAFT TO SCHERIA',

        icon: function (api, x, y) {
          const g = api.gfx, c = api.ctx;
          // Trident
          g.rect(x - 1, y - 14, 2, 22, C.sea);
          g.rect(x - 6, y - 12, 12, 2, C.sea);
          g.rect(x - 7, y - 20, 2, 10, C.sea);
          g.rect(x - 1, y - 18, 2, 8, C.sea);
          g.rect(x + 5, y - 20, 2, 10, C.sea);
        },

        intro: [
          'CALYPSO\'S ISLE FADES ASTERN.',
          'ODYSSEUS SAILS ON A MAKESHIFT RAFT.',
          'POSEIDON, GOD OF THE SEA, SPIES HIM',
          'and raises every storm against him.',
        ],
        quote: '"The earth-shaker lashed the sea with both hands and raised a wave of terrible height." — Homer, Odyssey V',
        help: 'TAP LEFT / RIGHT to steer the raft between lanes. Dodge Poseidon\'s waves and reach Scheria!',
        winText: 'Odysseus drags himself ashore on Phaeacia. He falls asleep under two olive trees. Safe at last.',
        loseText: 'Poseidon\'s fury rips the raft apart. Odysseus clings to a single timber in the darkness.',

        init: function (api) {
          this.lane     = 1;
          this.LANEX    = [45, 135, 225];
          this.dist     = 0;
          this.need     = 640;
          this.obs      = [];
          this.spawnT   = 1.0;
          this.lives    = 3;
          this.t        = 0;
          this.hitCool  = 0;
          this.lastKeyT = 0;
          this.wake     = [];
        },

        update: function (api, dt) {
          this.t += dt;
          const spd = 24 + (this.dist / this.need) * 10;
          this.dist += spd * dt;
          if (this.dist >= this.need) { api.addScore(100); api.win(); return; }

          // Lane control
          this.lastKeyT = Math.max(0, this.lastKeyT - dt);
          if (this.lastKeyT <= 0) {
            if (api.keyPressed('left')  && this.lane > 0) { this.lane--; this.lastKeyT = 0.14; api.audio.sfx('blip'); }
            if (api.keyPressed('right') && this.lane < 2) { this.lane++; this.lastKeyT = 0.14; api.audio.sfx('blip'); }
          }
          if (api.pointer.justDown) {
            const px = api.pointer.x, W = api.W;
            const nl = px < W / 3 ? 0 : px < 2 * W / 3 ? 1 : 2;
            if (nl !== this.lane) { this.lane = nl; api.audio.sfx('blip'); }
          }

          // Spawn waves
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            const intensity = this.dist / this.need;
            this.spawnT = Math.max(0.52, 1.18 - intensity * 0.44);
            this.obs.push({
              lane: api.rint(0, 2),
              y: -20,
              spd: 118 + intensity * 52,
              isWave: api.chance(0.65),
              hit: false,
            });
          }
          for (let i = 0; i < this.obs.length; i++) this.obs[i].y += this.obs[i].spd * dt;

          // Collision
          this.hitCool = Math.max(0, this.hitCool - dt);
          if (this.hitCool <= 0) {
            const raftY = api.H - 66;
            for (let j = 0; j < this.obs.length; j++) {
              const ob = this.obs[j];
              if (!ob.hit && ob.lane === this.lane && Math.abs(ob.y - raftY) < 28) {
                ob.hit = true;
                this.lives--;
                this.hitCool = 0.95;
                api.shake(6, 0.3); api.flash(C.sea, 0.2); api.audio.sfx('hurt');
                if (this.lives <= 0) { api.lose(); return; }
                break;
              }
            }
          }
          this.obs = this.obs.filter(ob => !ob.hit && ob.y < api.H + 26);

          // Wake particles
          if (api.rint(0, 4) === 0) this.wake.push({ x: this.LANEX[this.lane], y: api.H - 66, t: 0.42 });
          this.wake = this.wake.filter(p => { p.y += 18 * dt; p.t -= dt; return p.t > 0; });
          api.score = Math.floor(this.dist * 0.18);
        },

        draw: function (api) {
          const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
          // Stormy sky
          c.fillStyle = C.ink; c.fillRect(0, 0, W, H * 0.36);
          // Lightning flicker
          if (Math.sin(this.t * 7.4) > 0.88) {
            c.globalAlpha = 0.10; c.fillStyle = C.ivory; c.fillRect(0, 0, W, H * 0.36); c.globalAlpha = 1;
          }
          // Faint stars
          for (let i = 0; i < 8; i++) {
            g.rect((i * 47 + 11) % W, 4 + (i * 31) % 26, 1, 1, C.stars);
          }
          // Sea
          c.fillStyle = C.navy; c.fillRect(0, H * 0.36, W, H * 0.64);
          for (let wi = 0; wi < 10; wi++) {
            const wy = H * 0.38 + wi * 28 + Math.sin(this.t * 2.1 + wi * 0.7) * 8;
            c.globalAlpha = 0.16 + 0.08 * Math.sin(this.t * 1.4 + wi);
            g.rect(0, wy, W, 4, C.foam); c.globalAlpha = 1;
          }
          // Lane guides
          c.globalAlpha = 0.07;
          g.rect(90, 0, 1, H, C.bone); g.rect(180, 0, 1, H, C.bone);
          c.globalAlpha = 1;

          // Wake
          for (const p of this.wake) {
            c.globalAlpha = p.t * 0.55;
            g.rect(p.x - 9, p.y, 18, 3, C.foam); c.globalAlpha = 1;
          }

          // Obstacles
          for (let i = 0; i < this.obs.length; i++) {
            const ob = this.obs[i];
            const ox = this.LANEX[ob.lane];
            if (ob.isWave) {
              c.fillStyle = C.sea; c.fillRect(ox - 32, ob.y - 7, 64, 13);
              c.fillStyle = C.foam; c.fillRect(ox - 28, ob.y - 10, 56, 5);
              for (let fi = -3; fi <= 3; fi++) g.rect(ox + fi * 9, ob.y - 14, 3, 5, C.stars);
            } else {
              // Driftwood debris
              g.rect(ox - 15, ob.y - 4, 30, 8, C.olive);
              for (let di = 0; di < 3; di++) g.rect(ox - 10 + di * 10, ob.y - 8, 2, 5, C.amber);
            }
          }

          // Raft
          const rx = this.LANEX[this.lane];
          const ry = H - 66;
          for (let li = 0; li < 4; li++) g.rect(rx - 24 + li * 6, ry, 5, 18, this.hitCool > 0 ? C.terra : C.olive);
          g.rect(rx - 26, ry, 52, 4, C.amber);
          g.rect(rx - 26, ry + 14, 52, 4, C.amber);
          g.rect(rx - 1, ry - 32, 3, 32, C.amber);
          c.fillStyle = C.bone; c.globalAlpha = 0.58;
          c.beginPath(); c.moveTo(rx, ry - 30); c.lineTo(rx + 20, ry - 14); c.lineTo(rx, ry - 4); c.closePath(); c.fill();
          c.globalAlpha = 1;
          // Odysseus on raft
          g.circle(rx - 2, ry - 8, 6, C.ivory);
          g.rect(rx - 5, ry - 2, 9, 10, C.sea);

          // HUD
          api.topBar('CROSSING V — WRATH OF POSEIDON');
          const pct = clamp(this.dist / this.need, 0, 1);
          api.txt('SCHERIA ' + Math.floor(pct * 100) + '%', 6, 20, 7, C.foam);
          for (let li = 0; li < 3; li++) g.rect(W - 52 + li * 16, 4, 11, 9, li < this.lives ? C.green : C.crimson);
          g.rect(6, H - 10, W - 12, 6, C.ink);
          g.rect(6, H - 10, Math.floor((W - 12) * pct), 6, C.sea);
        },
      },

    ], // end chapters
  });

})();
