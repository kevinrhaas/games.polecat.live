/* ============================================================================
 * NO STRINGS — A PUPPET'S TALE IN FIVE SCENES
 * Pinocchio (Carlo Collodi, 1883) as a RetroSaga.
 *   1. A WISH UPON A STAR  — tap-to-catch falling sparkles (fill life meter)
 *   2. THE ROAD TO RUIN    — left/right dodge runner (bandits fall from trees)
 *   3. STROMBOLI'S CAGE    — timing bar escape (turn the key in the lock)
 *   4. PLEASURE ISLAND     — tap escape doors, avoid temptations
 *   5. INSIDE MONSTRO      — collect driftwood then timing-bar ignite fire
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ─── EMBLEM: Pinocchio's face with Blue Fairy sparkles ──────────────── */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Hat
    g.rect(cx - 12, cy - 46, 24, 6, '#2a3a8a');
    g.rect(cx - 8, cy - 60, 16, 18, '#2a3a8a');
    g.rect(cx - 4, cy - 62, 8, 4, '#4ab8e8'); // hat band
    // Head
    c.fillStyle = '#c8a870';
    c.beginPath(); c.arc(cx, cy - 22, 22, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#8a5a20'; c.lineWidth = 2;
    c.beginPath(); c.arc(cx, cy - 22, 22, 0, Math.PI * 2); c.stroke();
    // Eyes
    g.rect(cx - 9, cy - 28, 5, 5, '#2a1808');
    g.rect(cx + 4, cy - 28, 5, 5, '#2a1808');
    // Eye shines
    g.rect(cx - 8, cy - 28, 2, 2, '#fff5dc');
    g.rect(cx + 5, cy - 28, 2, 2, '#fff5dc');
    // Long nose
    g.rect(cx, cy - 20, 32, 4, '#a07040');
    g.rect(cx + 32, cy - 22, 5, 8, '#8a5a28');
    // Smile
    for (let xi = -6; xi <= 6; xi += 2) g.rect(cx + xi, cy - 10, 2, 2, '#6a3a18');
    // Blue Fairy sparkles orbiting
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const r = 34;
      const sx = cx + Math.cos(ang) * r, sy = cy - 22 + Math.sin(ang) * r;
      g.rect(sx - 2, sy - 2, 4, 4, i % 2 === 0 ? '#4ab8e8' : '#f5c060');
    }
  }

  /* ─── SCENERY: puppet theater backdrop ───────────────────────────────── */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu') {
      // Theater interior — deep burgundy with stage curtains
      c.fillStyle = '#100818';
      c.fillRect(0, 0, W, H);
      // Stage floor
      c.fillStyle = '#2a1808';
      c.fillRect(0, H - 48, W, 48);
      c.fillStyle = '#3a2010';
      c.fillRect(0, H - 52, W, 6);
      // Stage floorboards
      for (let fx = 0; fx < W; fx += 22) {
        c.fillStyle = '#1e1206';
        c.fillRect(fx, H - 50, 1, 48);
      }
      // Left curtain (with scallops)
      c.fillStyle = '#6a1010';
      c.fillRect(0, 0, 26, H - 48);
      c.fillStyle = '#8a1818';
      for (let i = 0; i < 6; i++) {
        c.beginPath(); c.arc(13, i * 26 + 13, 13, 0, Math.PI * 2); c.fill();
      }
      // Right curtain
      c.fillStyle = '#6a1010';
      c.fillRect(W - 26, 0, 26, H - 48);
      c.fillStyle = '#8a1818';
      for (let i = 0; i < 6; i++) {
        c.beginPath(); c.arc(W - 13, i * 26 + 13, 13, 0, Math.PI * 2); c.fill();
      }
      // Gold fringe on curtains
      for (let fy = 4; fy < H - 48; fy += 8) {
        g.rect(24, fy, 4, 4, '#c8901a');
        g.rect(W - 28, fy, 4, 4, '#c8901a');
      }
      // Spotlight from above center
      c.fillStyle = 'rgba(255,220,120,.04)';
      c.beginPath();
      c.moveTo(W / 2, 0); c.lineTo(W / 2 - 90, H - 50); c.lineTo(W / 2 + 90, H - 50);
      c.closePath(); c.fill();
      // Theater control bar (marionette rig bar)
      c.fillStyle = '#8a5820';
      c.fillRect(26, 80, W - 52, 8);
      c.strokeStyle = '#c8901a'; c.lineWidth = 1;
      c.strokeRect(26, 80, W - 52, 8);
      // Gold finials on bar ends
      g.circle(26, 84, 5, '#c8901a');
      g.circle(W - 26, 84, 5, '#c8901a');
      // Strings from bar down to each puppet card (cx values match layout)
      const STRINGS = [[52, 118], [135, 106], [218, 122], [84, 228], [186, 238]];
      c.strokeStyle = '#6a4018'; c.lineWidth = 1;
      for (const [sx, sy] of STRINGS) {
        c.beginPath(); c.moveTo(sx, 88); c.lineTo(sx, sy); c.stroke();
      }
    } else {
      // Night sky with stars — workshop / wishing sky
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#050412'); sky.addColorStop(0.55, '#150c28'); sky.addColorStop(1, '#080318');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);
      // Stars
      for (let i = 0; i < 55; i++) {
        const sx = (i * 47 + 11) % W, sy = (i * 89 + 5) % Math.floor(H * 0.65);
        c.globalAlpha = 0.2 + 0.55 * Math.sin(t * 1.6 + i);
        g.rect(sx, sy, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1, i % 5 === 0 ? '#f5c060' : '#d8e8ff');
      }
      c.globalAlpha = 1;
      // Big evening star
      g.circle(W / 2, 24, 9 + Math.sin(t * 2.5) * 2, '#4ab8e8');
      g.circle(W / 2, 24, 4, '#ffffff');
      c.globalAlpha = 0.18 + 0.12 * Math.sin(t * 2.5);
      c.fillStyle = '#4ab8e8';
      c.beginPath(); c.arc(W / 2, 24, 24, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      // Shooting star
      const sa = (t * 0.28) % 1;
      if (sa < 0.45) {
        c.globalAlpha = (0.45 - sa) / 0.45;
        c.fillStyle = '#4ab8e8';
        c.fillRect(sa / 0.45 * (W + 50) - 25, sa / 0.45 * 50, 20, 2);
        c.globalAlpha = 1;
      }
      // Workshop glow at bottom
      const wg = c.createRadialGradient(W / 2, H, 0, W / 2, H, 100);
      wg.addColorStop(0, 'rgba(240,160,50,.22)'); wg.addColorStop(1, 'rgba(240,160,50,0)');
      c.fillStyle = wg; c.fillRect(0, H - 100, W, 100);
      // Workshop bench/floor at bottom
      c.fillStyle = '#2a1808'; c.fillRect(0, H - 28, W, 28);
      c.fillStyle = '#3a2010'; c.fillRect(0, H - 32, W, 6);
    }

    if (scene === 'intro' || scene === 'result' || scene === 'finale') {
      c.fillStyle = 'rgba(8,4,18,.62)'; c.fillRect(0, 0, W, H);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════ */
  RetroSaga.create({
    id: 'pinocchio',
    title: 'No Strings',
    subtitle: "A PUPPET'S TALE IN FIVE SCENES",
    currency: 'WISHES',
    screens: {
      win: '#4ab8e8', lose: '#c84818',
      chapterLabel: '#8a7050', name: '#fff5dc',
      sub: '#4ab8e8', intro: '#e8d8b0', quote: '#8a7a58',
      help: '#f5c060', score: '#fff5dc', cur: '#f5c060',
      cta: '#fff5dc', overlay: 'rgba(8,4,18,.86)',
    },
    labels: {
      chapter: 'SCENE', score: 'WISHES GRANTED',
      win: 'THE FAIRY SMILES', lose: 'THE NOSE GROWS',
      cont: 'TAP TO PRESS ON', finale: 'TAP FOR THE LAST WISH',
      toMenu: 'TAP TO RETURN', play: 'TAP TO BEGIN',
    },
    accent: '#f5c060',
    credit: 'AN ORIGINAL 8-BIT TRIBUTE · C. COLLODI, 1883',
    emblem,
    scenery,
    bootCta: 'WISH UPON A STAR',
    menuLabel: "THE WOODEN BOY'S JOURNEY",
    menuHint: 'CHOOSE A SCENE TO PLAY',
    menuDone: 'PINOCCHIO IS REAL AT LAST',
    menu: {
      colors: { title: '#4ab8e8', label: '#8a7050', cur: '#fff5dc' },
      // Five marionette puppets hanging at varied heights from a theater bar
      layout(api, chapters) {
        return [
          { x: 16, y: 118, w: 72, h: 80 },  // Scene 1 — left, mid-high
          { x: 99, y: 106, w: 72, h: 80 },  // Scene 2 — center, highest
          { x: 182, y: 122, w: 72, h: 80 }, // Scene 3 — right, mid-high
          { x: 48, y: 228, w: 72, h: 80 },  // Scene 4 — left, low
          { x: 150, y: 238, w: 72, h: 80 }, // Scene 5 — right, lowest
        ];
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx;
        const { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2;
        // Mini marionette control bar
        c.fillStyle = sel ? '#c8901a' : '#6a4018';
        c.fillRect(cx - 20, y, 40, 4);
        // Upper strings to cross-bar
        c.strokeStyle = sel ? '#f5c060' : '#6a4018'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - 10, y + 4); c.lineTo(cx - 10, y + 11); c.stroke();
        c.beginPath(); c.moveTo(cx + 10, y + 4); c.lineTo(cx + 10, y + 11); c.stroke();
        // Cross-bar
        c.fillStyle = sel ? '#c8901a' : '#6a4018';
        c.fillRect(cx - 18, y + 11, 36, 4);
        // Center string to head
        c.strokeStyle = sel ? '#f5c060' : '#6a4018';
        c.beginPath(); c.moveTo(cx, y + 15); c.lineTo(cx, y + 20); c.stroke();
        // Head
        c.fillStyle = sel ? '#f0d890' : '#c8a870';
        c.beginPath(); c.arc(cx, y + 30, 11, 0, Math.PI * 2); c.fill();
        c.strokeStyle = sel ? '#f5c060' : '#8a5a20'; c.lineWidth = sel ? 2 : 1;
        c.beginPath(); c.arc(cx, y + 30, 11, 0, Math.PI * 2); c.stroke();
        // Eyes
        g.rect(cx - 5, y + 27, 3, 3, '#2a1808');
        g.rect(cx + 2, y + 27, 3, 3, '#2a1808');
        // Nose (long = not yet done, short = cleared)
        const nLen = done ? 3 : 8;
        g.rect(cx - 1, y + 41, 2, nLen, '#a07040');
        // Body (red puppet tunic)
        c.fillStyle = sel ? '#e03020' : '#8a1c10';
        c.fillRect(cx - 12, y + 47, 24, 22);
        c.strokeStyle = sel ? '#f5c060' : '#5a1008'; c.lineWidth = 1;
        c.strokeRect(cx - 12, y + 47, 24, 22);
        // Chapter text
        api.txtCFit((i + 1) + '. ' + ch.name, cx, y + 52, 5, done ? '#f5c060' : '#fff5dc', false, w - 8);
        if (ch.sub) api.txtCFit(ch.sub, cx, y + 62, 4, '#c8a060', false, w - 8);
        // Done: golden star on head
        if (done) { g.rect(cx + 6, y + 19, 6, 6, '#f5c060'); g.rect(cx + 8, y + 21, 2, 2, '#fff5dc'); }
      },
    },
    finale: [
      'THE FAIRY KEPT HER WORD.',
      'PINOCCHIO IS REAL.',
      '',
      'GEPPETTO WEEPS FOR JOY',
      'AND KISSES HIS BOY.',
    ],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#f5c060', blue: '#4ab8e8', wood: '#c8a870' },

    chapters: [

      /* ═══════════════ SCENE 1: A WISH UPON A STAR ══════════════════════ */
      {
        id: 'wish', name: 'A WISH UPON A STAR', sub: 'THE BLUE FAIRY COMES',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 1, y + 4, 2, 7, '#f5c060');
          g.circle(x, y, 5, '#4ab8e8'); g.circle(x, y, 2, '#ffffff');
        },
        intro: ['GEPPETTO WISHES ON', 'THE EVENING STAR.', 'THE BLUE FAIRY DESCENDS', 'to give his puppet life.'],
        quote: 'Tonight I have made you a real boy — whenever you are brave, truthful, and unselfish.',
        help: 'TAP the blue sparkles — fill the life meter! Avoid the grey ones.',
        winText: 'Pinocchio blinks. He sits up. "Father!" The wish is granted.',
        loseText: "The sparkles fade. Geppetto's little puppet stays perfectly still.",
        init(api) {
          this.life = 0; this.need = 20; this.timer = 28;
          this.sparks = []; this.spawnT = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.28, 0.58);
            const blue = api.chance(0.62);
            this.sparks.push({
              x: api.rnd(22, api.W - 22), y: -12,
              vx: api.rnd(-0.5, 0.5), vy: api.rnd(1.3, 2.4),
              blue, r: blue ? api.rnd(9, 13) : api.rnd(6, 9),
            });
          }
          for (const s of this.sparks) { s.x += s.vx * f; s.y += s.vy * f; }
          this.sparks = this.sparks.filter((s) => s.y < api.H + 20);
          if (api.pointer.justDown) {
            let hit = false;
            for (let i = this.sparks.length - 1; i >= 0; i--) {
              const s = this.sparks[i];
              if (Math.hypot(api.pointer.x - s.x, api.pointer.y - s.y) < s.r + 8) {
                if (s.blue) {
                  this.life++; api.score += 8;
                  api.burst(s.x, s.y, '#4ab8e8', 8); api.audio.sfx('coin');
                  if (this.life >= this.need) { api.score += 60; api.win(); }
                } else {
                  this.life = Math.max(0, this.life - 1);
                  api.flash('#5a1a00', 0.22); api.shake(3, 0.2); api.audio.sfx('hurt');
                }
                this.sparks.splice(i, 1); hit = true; break;
              }
            }
            if (!hit) api.audio.sfx('blip');
          }
          if (this.timer <= 0 && this.life < this.need) api.lose();
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#070415');
          // Stars
          for (let i = 0; i < 55; i++) {
            const sx = (i * 47 + 11) % W, sy = (i * 89 + 5) % Math.floor(H * 0.7);
            g.ctx.globalAlpha = 0.2 + 0.6 * Math.sin(api.t * 1.8 + i);
            g.rect(sx, sy, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1, '#d8e8ff');
          }
          g.ctx.globalAlpha = 1;
          // Evening star at top
          g.circle(W / 2, 26, 9 + Math.sin(api.t * 3) * 2, '#4ab8e8');
          g.circle(W / 2, 26, 4, '#ffffff');
          // Glow around star
          g.ctx.globalAlpha = 0.2 + 0.15 * Math.sin(api.t * 3);
          g.ctx.fillStyle = '#4ab8e8';
          g.ctx.beginPath(); g.ctx.arc(W / 2, 26, 24, 0, Math.PI * 2); g.ctx.fill();
          g.ctx.globalAlpha = 1;
          // Workshop bench
          g.rect(0, H - 56, W, 56, '#2a1808'); g.rect(0, H - 60, W, 6, '#3a2010');
          // Geppetto (pixel person, left)
          g.sprite(['.hh.', 'hffh', 'hbbh', '.ll.', '.ll.'],
            24, H - 58, { h: '#5a3a20', f: '#c8a070', b: '#4a2a8a', l: '#3a2010' }, 4);
          // Pinocchio lying on bench (wooden puppet)
          const px = W / 2 - 22, py = H - 50;
          g.rect(px, py + 6, 40, 12, '#c8a870');  // body
          g.rect(px + 32, py + 2, 14, 10, '#c8a870'); // head
          g.rect(px + 46, py + 5, 8, 2, '#a07040');   // nose
          // Life glow pulse around puppet
          g.ctx.globalAlpha = Math.min(0.75, (this.life / this.need) * 0.8);
          g.ctx.fillStyle = '#4ab8e8';
          g.ctx.beginPath(); g.ctx.arc(px + 38, py + 7, 22, 0, Math.PI * 2); g.ctx.fill();
          g.ctx.globalAlpha = 1;
          // Sparkles
          for (const s of this.sparks) {
            if (s.blue) {
              g.circle(s.x, s.y, s.r, '#4ab8e8');
              g.circle(s.x, s.y, Math.max(3, s.r - 4), '#a8e0ff');
            } else {
              g.circle(s.x, s.y, s.r, '#4a4a5a');
              g.circle(s.x, s.y, Math.max(2, s.r - 3), '#6a6a7a');
            }
          }
          // Life meter
          const mx = 24, my = H - 14, mw = W - 48;
          g.rect(mx, my, mw, 8, '#1a1032');
          g.rect(mx, my, mw * clamp(this.life / this.need, 0, 1), 8, '#4ab8e8');
          g.rectO(mx, my, mw, 8, '#2a2054', 1);
          api.topBar('A WISH UPON A STAR');
          api.txt('LIFE ' + this.life + '/' + this.need, 6, 20, 9, '#4ab8e8');
          g.rect(W - 66, 21, 60, 6, '#1a1032');
          g.rect(W - 66, 21, 60 * clamp(1 - this.timer / 28, 0, 1), 6, '#f5c060');
          api.vignette();
        },
      },

      /* ═══════════════ SCENE 2: THE ROAD TO RUIN ════════════════════════ */
      {
        id: 'road', name: 'THE ROAD TO RUIN', sub: 'THE FOX AND THE CAT',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 6, y - 7, 4, 7, '#c86030'); g.rect(x + 2, y - 7, 4, 7, '#c86030');
          g.rect(x - 3, y, 6, 4, '#c86030');
        },
        intro: ['THE FOX AND THE CAT', 'LEAD PINOCCHIO TOWARD', 'THE FIELD OF MIRACLES.', 'Bandits lurk in the dark.'],
        quote: '"Bury your coins here tonight and by morning there will be a tree of pure gold."',
        help: 'STEER left and right — dodge the masked bandits! Collect coins.',
        winText: 'Pinocchio reaches the Red Crawfish Inn, coins still in his pocket.',
        loseText: 'The bandits catch him on the dark road. His gold coins are gone.',
        init(api) {
          this.x = api.W / 2; this.y = api.H - 80;
          this.dist = 0; this.need = 300;
          this.speed = 1.8;
          this.obs = []; this.spawnT = 1.0;
          this.coins = []; this.coinT = 0.6;
          this.collected = 0; this.hits = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          this.dist += this.speed * f * 0.2;
          this.speed = Math.min(4.0, 1.8 + this.dist / 90);
          api.score = this.collected * 10 + Math.floor(this.dist / 3);
          // Steer
          if (api.pointer.down) this.x = clamp(api.pointer.x, 26, api.W - 26);
          if (api.keyDown('left')) this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 26, api.W - 26);
          // Spawn bandits
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.9, 1.6) / (1 + this.dist / 70);
            this.obs.push({ x: api.rnd(28, api.W - 28), y: -22, vy: this.speed * 0.85 });
          }
          // Spawn coins
          this.coinT -= dt;
          if (this.coinT <= 0) {
            this.coinT = api.rnd(0.5, 0.9);
            this.coins.push({ x: api.rnd(30, api.W - 30), y: -10, vy: this.speed * 0.65 });
          }
          for (const o of this.obs) o.y += o.vy * f;
          for (const cn of this.coins) cn.y += cn.vy * f;
          // Bandit collisions
          for (const o of this.obs) {
            if (!o.hit && Math.hypot(o.x - this.x, o.y - this.y) < 22) {
              o.hit = true; this.hits++;
              api.shake(5, 0.3); api.flash(api.colors.blood, 0.18); api.audio.sfx('hurt');
              if (this.hits >= 3) { api.lose(); return; }
            }
          }
          // Coin collect
          for (const cn of this.coins) {
            if (!cn.got && Math.hypot(cn.x - this.x, cn.y - this.y) < 18) {
              cn.got = true; this.collected++; api.score += 10;
              api.burst(cn.x, cn.y, '#f5c060', 6); api.audio.sfx('coin');
            }
          }
          this.obs = this.obs.filter((o) => o.y < api.H + 30);
          this.coins = this.coins.filter((cn) => cn.y < api.H + 20 && !cn.got);
          if (this.dist >= this.need) { api.score += 80; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#050a06');
          // Dark forest sky
          g.rect(0, 0, W, H / 2, '#060c08');
          // Moon
          g.circle(W - 38, 32, 14, '#d8e0c0'); g.circle(W - 30, 27, 11, '#060c08');
          // Forest trees lining the sides
          for (let i = 0; i < 5; i++) {
            const tx = i * 20, ty = 15 + (i % 3) * 24;
            g.rect(tx + 4, ty, 12, H, '#0a1808');
            g.circle(tx + 10, ty - 8, 14, '#0c2010');
          }
          for (let i = 0; i < 5; i++) {
            const tx = W - 18 - i * 20, ty = 20 + (i % 3) * 20;
            g.rect(tx + 2, ty, 12, H, '#0a1808');
            g.circle(tx + 8, ty - 8, 14, '#0c2010');
          }
          // Road (center strip)
          g.rect(W / 2 - 46, 0, 92, H, '#1a1408');
          // Road markings (scrolling)
          const scroll = (api.t * this.speed * 60) % 40;
          for (let ry = -40 + scroll; ry < H; ry += 40) g.rect(W / 2 - 2, ry, 4, 22, '#2a2010');
          // Bandits
          for (const o of this.obs) {
            if (!o.hit) {
              g.circle(o.x, o.y - 7, 8, '#1a1010');
              g.rect(o.x - 8, o.y, 16, 14, '#1a1010');
              g.rect(o.x - 4, o.y - 10, 3, 2, '#e8e0d0'); // mask eyes
              g.rect(o.x + 1, o.y - 10, 3, 2, '#e8e0d0');
            }
          }
          // Gold coins
          for (const cn of this.coins) {
            if (!cn.got) { g.circle(cn.x, cn.y, 7, '#f5c060'); g.circle(cn.x, cn.y, 3, '#fff5a0'); }
          }
          // Pinocchio (puppet walking)
          g.circle(this.x, this.y - 18, 9, '#c8a870');
          g.rect(this.x - 1, this.y - 10, 2, 7, '#a07040');  // nose
          g.rect(this.x - 7, this.y - 6, 14, 16, '#e03020'); // shirt
          g.rect(this.x - 6, this.y + 10, 5, 10, '#2a2050'); // left leg
          g.rect(this.x + 1, this.y + 10, 5, 10, '#2a2050'); // right leg
          // Hit hearts
          for (let hi = 0; hi < 3; hi++) {
            g.circle(14 + hi * 18, 22, 6, hi < this.hits ? '#c84040' : '#5dff8f');
          }
          // Progress bar
          g.rect(26, H - 12, W - 52, 6, '#1a1408');
          g.rect(26, H - 12, (W - 52) * clamp(this.dist / this.need, 0, 1), 6, '#5dff8f');
          api.topBar('THE ROAD TO RUIN');
          api.txt('COINS ' + this.collected, 6, 20, 9, '#f5c060');
          api.vignette();
        },
      },

      /* ═══════════════ SCENE 3: STROMBOLI'S CAGE ════════════════════════ */
      {
        id: 'cage', name: "STROMBOLI'S CAGE", sub: 'ESCAPE THE PUPPET MASTER',
        icon(api, x, y) {
          const g = api.gfx;
          g.rectO(x - 7, y - 7, 14, 14, '#8a5020', 1);
          g.rect(x - 2, y - 7, 1, 14, '#8a5020');
          g.rect(x + 1, y - 7, 1, 14, '#8a5020');
        },
        intro: ['STROMBOLI LOCKS PINOCCHIO', 'IN A GILDED CAGE.', 'THE BLUE FAIRY BRINGS A KEY.', 'But the lock is tricky.'],
        quote: '"You will earn me lots of money, my little marionette — and when you are no longer of use, I will use you for firewood."',
        help: 'TAP when the key lines up with the BLUE zone to turn the lock!',
        winText: 'Click! The cage swings open. "Thank you!" Pinocchio runs into the night.',
        loseText: 'The key breaks. Stromboli finds him still in the cage at dawn.',
        init(api) {
          this.turns = 0; this.need = 5;
          this.miss = 0; this.maxMiss = 5;
          this.m = 0; this.dir = 1; this.spd = 1.0; this.band = 0.14;
        },
        update(api, dt) {
          const f = dt * 60;
          this.m += this.dir * this.spd * 0.025 * f;
          if (this.m > 1) { this.m = 1; this.dir = -1; }
          if (this.m < 0) { this.m = 0; this.dir = 1; }
          if (api.confirm()) {
            if (Math.abs(this.m - 0.5) < this.band) {
              this.turns++; api.score += 28;
              api.burst(api.W / 2, api.H / 2, '#4ab8e8', 10);
              api.flash('#002030', 0.12); api.audio.sfx('coin');
              this.spd = Math.min(2.4, this.spd + 0.2);
              this.band = Math.max(0.06, this.band - 0.012);
              if (this.turns >= this.need) { api.score += 80; api.win(); }
            } else {
              this.miss++; api.shake(4, 0.22); api.audio.sfx('hurt');
              if (this.miss >= this.maxMiss) api.lose();
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, cx = W / 2, cy = H / 2;
          // Stage backstage — dark burgundy with curtains
          api.clear('#180608');
          g.rect(0, 0, 22, H, '#5a0e0e'); g.rect(W - 22, 0, 22, H, '#5a0e0e');
          // Backdrop planks
          for (let bx = 22; bx < W - 22; bx += 18) g.rect(bx, 0, 1, H - 40, '#200c08');
          // Stage floor
          g.rect(0, H - 40, W, 40, '#2a1808');
          // The cage
          const cw = 100, ch = 128, cx0 = cx - 50, cy0 = cy - 64;
          g.rect(cx0, cy0, cw, ch, '#1a0e06');
          for (let bx = cx0; bx <= cx0 + cw; bx += 13) g.rect(bx, cy0, 2, ch, '#7a5020');
          g.rect(cx0, cy0, cw, 5, '#9a6228');
          g.rect(cx0, cy0 + ch, cw, 5, '#9a6228');
          g.rect(cx0, cy0 + ch / 2, cw, 2, '#8a5a22');
          // Pinocchio inside
          g.circle(cx, cy - 20, 11, '#c8a870');
          g.rect(cx - 1, cy - 9, 2, 7, '#a07040');
          g.rect(cx - 9, cy - 4, 18, 22, '#e03020');
          // Stromboli watching from right
          g.circle(W - 38, cy - 12, 14, '#8a3a22');
          g.rect(W - 52, cy + 2, 28, 26, '#2a1008');
          // Blue fairy (left, glowing, bobbing)
          const fy = cy0 - 22 + Math.sin(api.t * 3) * 6;
          g.circle(28, fy, 11, '#4ab8e8'); g.circle(28, fy, 5, '#a8e4ff');
          // Wand line from fairy toward lock
          const lockX = cx0 + cw + 4, lockY = cy - 10;
          g.ctx.strokeStyle = '#f5c060'; g.ctx.lineWidth = 1;
          g.ctx.beginPath(); g.ctx.moveTo(36, fy + 6); g.ctx.lineTo(lockX - 8, lockY); g.ctx.stroke();
          // Lock on cage door
          g.circle(lockX, lockY, 9, this.turns > 0 ? '#4ab8e8' : '#6a4018');
          g.circle(lockX, lockY, 4, this.turns > 0 ? '#a8e4ff' : '#2a1808');
          // Timing bar
          const mx = 26, mw = W - 52, my = H - 50;
          g.rect(mx, my, mw, 14, '#200a06');
          g.rect(mx + mw * (0.5 - this.band), my, mw * this.band * 2, 14, 'rgba(74,184,232,.4)');
          g.rect(mx + mw * 0.5 - 1, my - 3, 2, 20, '#4ab8e8');
          g.rect(mx + mw * this.m - 2, my - 4, 4, 22, '#f5c060');
          api.txtC('TURN THE KEY', W / 2, my - 12, 8, '#f5c060');
          api.topBar("STROMBOLI'S CAGE");
          api.txt('TURNS ' + this.turns + '/' + this.need, 6, 20, 9, '#f5c060');
          api.txt('TRIES ' + (this.maxMiss - this.miss), W - 84, 20, 9, this.miss > 2 ? '#c84040' : '#888');
          api.vignette();
        },
      },

      /* ═══════════════ SCENE 4: PLEASURE ISLAND ══════════════════════════ */
      {
        id: 'island', name: 'PLEASURE ISLAND', sub: "DON'T BE A JACKASS",
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 7, y - 9, 4, 10, '#c8a870'); g.rect(x + 3, y - 9, 4, 10, '#c8a870');
          g.rect(x - 4, y, 8, 5, '#c8a870');
        },
        intro: ['LAMPWICK LEADS PINOCCHIO', 'TO PLEASURE ISLAND.', 'BOYS ARE TURNING INTO', 'DONKEYS. Escape now!'],
        quote: '"They are all turning into donkeys — every one of them!"',
        help: 'TAP the green EXIT doors! Avoid the temptations — or you\'ll bray!',
        winText: "Pinocchio dives into the sea and swims away — still a boy!",
        loseText: 'The transformation is complete. A little donkey stands in the circus.',
        init(api) {
          this.escaped = 0; this.need = 10;
          this.transform = 0;
          this.timer = 32;
          this.doors = []; this.doorT = 1.4;
          this.tempts = []; this.temptT = 0.7;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          // Natural slow transform over time
          this.transform = clamp(1 - (this.timer / 32) * 0.55, 0, 0.95);
          api.score = this.escaped * 18 + Math.floor(Math.max(0, 32 - this.timer) * 1.5);
          // Spawn exit doors
          this.doorT -= dt;
          if (this.doorT <= 0) {
            this.doorT = api.rnd(1.2, 2.2);
            this.doors.push({ x: api.rnd(30, api.W - 30), y: -22, vy: api.rnd(1.2, 2.0) });
          }
          // Spawn temptations
          this.temptT -= dt;
          if (this.temptT <= 0) {
            this.temptT = api.rnd(0.45, 0.85);
            this.tempts.push({ x: api.rnd(22, api.W - 22), y: -14, vy: api.rnd(1.5, 2.6), k: api.rint(0, 2) });
          }
          for (const d of this.doors) d.y += d.vy * f;
          for (const t of this.tempts) t.y += t.vy * f;
          if (api.pointer.justDown) {
            let hit = false;
            for (let i = this.doors.length - 1; i >= 0; i--) {
              const d = this.doors[i];
              if (!d.gone && Math.abs(api.pointer.x - d.x) < 24 && Math.abs(api.pointer.y - d.y) < 26) {
                d.gone = true; this.escaped++; api.score += 18;
                api.burst(d.x, d.y, '#5dff8f', 8); api.audio.sfx('coin');
                hit = true; break;
              }
            }
            if (!hit) {
              for (let i = this.tempts.length - 1; i >= 0; i--) {
                const t = this.tempts[i];
                if (!t.gone && Math.abs(api.pointer.x - t.x) < 18 && Math.abs(api.pointer.y - t.y) < 18) {
                  t.gone = true;
                  this.transform = Math.min(1, this.transform + 0.18);
                  api.shake(4, 0.3); api.flash('#8a1a00', 0.2); api.audio.sfx('hurt');
                  hit = true; break;
                }
              }
            }
          }
          this.doors = this.doors.filter((d) => d.y < api.H + 30 && !d.gone);
          this.tempts = this.tempts.filter((t) => t.y < api.H + 22 && !t.gone);
          if (this.escaped >= this.need) { api.score += 100; api.win(); }
          if (this.transform >= 1) { api.lose(); return; }
          if (this.timer <= 0) api.lose();
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#1a0608');
          // Carnival lights across top
          for (let i = 0; i < 14; i++) {
            const bx = (i * 20 + 4) % W;
            g.circle(bx, 10, 6, ['#ff2060', '#f5c060', '#4ab8e8', '#5dff8f', '#ff8a3d'][i % 5]);
          }
          // Carnival tents in background
          g.rect(22, H / 2 - 18, 36, 48, '#8a1a1a'); g.rect(22, H / 2 - 28, 36, 12, '#c82020');
          g.rect(W - 58, H / 2 - 18, 36, 48, '#1a1a8a'); g.rect(W - 58, H / 2 - 28, 36, 12, '#2020c8');
          // Donkey transformation meter (bar at right side)
          const dk = this.transform;
          const mh = Math.floor((H - 40) * dk);
          g.rect(W - 14, H - 20 - mh, 10, mh, dk > 0.65 ? '#c84040' : '#ff8a3d');
          g.rectO(W - 14, 20, 10, H - 40, '#4a2808', 1);
          api.txtC('🐴', W - 9, 20, 8, '#c84040');
          // Pinocchio center (slowly transforming)
          const ppx = W / 2, ppy = H - 78;
          g.rect(ppx - 9, ppy + 2, 18, 20, '#e03020');  // body
          const hcol = dk < 0.3 ? '#c8a870' : dk < 0.6 ? '#c89840' : '#c87028';
          g.circle(ppx, ppy - 10, 12, hcol);
          // Ears grow with transformation
          if (dk > 0.2) {
            const eLen = Math.floor(dk * 14);
            g.rect(ppx - 9, ppy - 22 - eLen, 5, eLen, '#c8a070');
            g.rect(ppx + 4, ppy - 22 - eLen, 5, eLen, '#c8a070');
          }
          const nLen = 5 + Math.floor(dk * 8);
          g.rect(ppx - 1, ppy - 4, 2, nLen, dk > 0.4 ? '#886040' : '#a07040');
          // Exit doors
          for (const d of this.doors) {
            if (!d.gone) {
              g.rect(d.x - 18, d.y - 20, 36, 44, '#142a14');
              g.rectO(d.x - 18, d.y - 20, 36, 44, '#5dff8f', 2);
              api.txtC('EXIT', d.x, d.y, 7, '#5dff8f');
            }
          }
          // Temptations
          const TCOL = ['#d4a020', '#e03060', '#7a5020'];
          const TLBL = ['ALE', 'SWEET', 'CIGAR'];
          for (const t of this.tempts) {
            if (!t.gone) {
              g.circle(t.x, t.y, 13, '#5a1010');
              api.txtC(TLBL[t.k], t.x, t.y - 4, 6, TCOL[t.k]);
            }
          }
          // Meters
          g.rect(26, H - 14, W - 50, 7, '#2a0808');
          g.rect(26, H - 14, (W - 50) * clamp(this.escaped / this.need, 0, 1), 7, '#5dff8f');
          api.topBar('PLEASURE ISLAND');
          api.txt('EXITS ' + this.escaped + '/' + this.need, 6, 20, 9, '#5dff8f');
          api.txt('DONKEY ' + Math.floor(dk * 100) + '%', W - 108, 20, 9, dk > 0.5 ? '#ff4040' : '#888');
          api.vignette();
        },
      },

      /* ═══════════════ SCENE 5: INSIDE MONSTRO ════════════════════════════ */
      {
        id: 'monstro', name: 'INSIDE MONSTRO', sub: 'LIGHT THE FIRE',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 2, y - 8, 4, 10, '#ff6a00'); g.rect(x - 4, y - 5, 8, 6, '#ff8a3d');
          g.rect(x - 2, y - 7, 4, 4, '#fff060');
        },
        intro: ['PINOCCHIO FINDS GEPPETTO', 'INSIDE THE GREAT WHALE.', 'THEY MUST BUILD A FIRE', 'to make Monstro sneeze!'],
        quote: '"Light the fire, Pinocchio! Make it large — large enough to make him sneeze!"',
        help: 'TAP driftwood logs as they float past — collect 8, then tap the fire pit!',
        winText: 'ACHOO! Monstro sneezes them both out into the sea. Father and son, free!',
        loseText: "The wood is too wet. The fire won't catch. The whale swims ever deeper.",
        init(api) {
          this.wood = 0; this.needWood = 8; this.phase = 'collect';
          this.timer = 32; this.logs = []; this.logT = 0.65;
          this.m = 0; this.dir = 1; this.spd = 0.85; this.goodTaps = 0;
          this.fireLevel = 0; this.parts = [];
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          api.score = this.wood * 12;
          if (this.phase === 'collect') {
            this.logT -= dt;
            if (this.logT <= 0) {
              this.logT = api.rnd(0.5, 1.0);
              this.logs.push({ x: -22, y: api.rnd(api.H * 0.35, api.H - 100), vx: api.rnd(1.6, 2.8) });
            }
            for (const l of this.logs) l.x += l.vx * f;
            this.logs = this.logs.filter((l) => l.x < api.W + 30 && !l.got);
            if (api.pointer.justDown) {
              let hit = false;
              for (const l of this.logs) {
                if (!l.got && Math.hypot(api.pointer.x - l.x, api.pointer.y - l.y) < 22) {
                  l.got = true; this.wood++;
                  api.burst(l.x, l.y, '#c8a060', 6); api.audio.sfx('coin'); hit = true; break;
                }
              }
              // Tap fire pit when enough wood
              if (!hit && this.wood >= this.needWood) {
                const fpx = api.W / 2, fpy = api.H - 68;
                if (Math.hypot(api.pointer.x - fpx, api.pointer.y - fpy) < 32) {
                  this.phase = 'ignite'; this.m = 0; api.audio.sfx('power');
                }
              }
            }
            if (this.timer <= 0 && this.wood < this.needWood) api.lose();
          } else {
            // Ignite timing bar: good zone is m in [0.38, 0.62]
            this.m += this.dir * this.spd * 0.026 * f;
            if (this.m > 1) { this.m = 1; this.dir = -1; }
            if (this.m < 0) { this.m = 0; this.dir = 1; }
            this.fireLevel = Math.min(1, this.fireLevel + dt * 0.4);
            // Particle fire embers
            if (Math.random() < 0.3) {
              this.parts.push({
                x: api.W / 2 + api.rnd(-22, 22),
                y: api.H - 68 - this.fireLevel * 30,
                vx: api.rnd(-1, 1), vy: api.rnd(-2.5, -0.5),
                life: api.rnd(0.3, 0.8),
                col: api.chance(0.5) ? '#ff6a00' : '#f5c060',
              });
            }
            for (const p of this.parts) { p.x += p.vx * f; p.y += p.vy * f; p.vy += 0.08 * f; p.life -= dt; }
            this.parts = this.parts.filter((p) => p.life > 0);
            if (api.confirm()) {
              if (this.m > 0.38 && this.m < 0.62) {
                this.goodTaps++;
                this.spd = Math.min(2.6, this.spd + 0.42);
                api.score += 28; api.audio.sfx('coin');
                api.burst(api.W / 2, api.H - 68, '#ff6a00', 8);
                if (this.goodTaps >= 3) {
                  api.score += 120; api.shake(9, 0.7);
                  api.flash('#ffffff', 0.45); api.audio.sfx('explode'); api.win();
                }
              } else {
                api.shake(3, 0.2); api.audio.sfx('blip');
              }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          // Inside the whale — dark teal cavern
          api.clear('#020c10');
          // Whale ribs
          g.ctx.strokeStyle = '#0a2828'; g.ctx.lineWidth = 4;
          for (let i = 0; i < 7; i++) {
            const rx = 14 + i * 38;
            g.ctx.beginPath();
            g.ctx.moveTo(rx, 20); g.ctx.quadraticCurveTo(rx - 14, H / 2, rx, H - 30);
            g.ctx.stroke();
          }
          // Stomach walls
          g.rect(0, 0, 14, H, '#091814'); g.rect(W - 14, 0, 14, H, '#091814');
          g.rect(0, H - 22, W, 22, '#091814');
          // Water on floor
          for (let wx = 14; wx < W - 14; wx += 16) {
            g.rect(wx, H - 18, 14, 8, wx % 32 === 0 ? '#0e2830' : '#0a2028');
          }
          // Fire pit (center)
          const fpx = W / 2, fpy = H - 68;
          g.rect(fpx - 24, fpy + 14, 48, 8, '#2a1408'); // pit base
          if (this.phase === 'collect') {
            // Unlit fire pit
            g.rect(fpx - 16, fpy, 32, 18, '#1a0a06');
            if (this.wood >= this.needWood) {
              g.rectO(fpx - 16, fpy, 32, 18, '#f5c060', 2);
              api.txtC('LIGHT!', fpx, fpy + 7, 7, '#f5c060');
            }
          } else {
            // Fire burning
            const fl = this.fireLevel;
            const fh = 18 + Math.floor(fl * 36);
            g.rect(fpx - 16, fpy + 18 - fh, 32, fh, '#c83010');
            g.rect(fpx - 11, fpy + 10 - fh, 22, fh, '#ff6a00');
            g.rect(fpx - 6, fpy + 2 - fh, 12, fh, '#f5c060');
          }
          // Logs floating
          for (const l of this.logs) {
            if (!l.got) {
              g.rect(l.x - 16, l.y - 5, 32, 10, '#8a5028');
              g.rect(l.x - 14, l.y - 3, 28, 6, '#a06030');
            }
          }
          // Geppetto (left)
          g.circle(36, H - 54, 10, '#c8a070'); g.rect(28, H - 44, 16, 20, '#3a3a8a');
          // Pinocchio (right of fire)
          const ppx = fpx + 38, ppy = H - 68;
          g.circle(ppx, ppy - 12, 9, '#c8a870'); g.rect(ppx - 1, ppy - 3, 2, 5, '#a07040');
          g.rect(ppx - 7, ppy + 2, 14, 16, '#e03020');
          // Ember particles
          for (const p of this.parts) {
            g.ctx.globalAlpha = clamp(p.life * 2, 0, 1);
            g.rect(p.x - 1, p.y - 1, 3, 3, p.col);
          }
          g.ctx.globalAlpha = 1;
          // Timing bar (ignite phase)
          if (this.phase === 'ignite') {
            const mx = 26, mw = W - 52, my = H - 22;
            g.rect(mx, my, mw, 12, '#180806');
            g.rect(mx + mw * 0.38, my, mw * 0.24, 12, 'rgba(255,106,0,.4)'); // hot zone
            g.rect(mx + mw * this.m - 2, my - 3, 4, 18, '#f5c060');
            api.txtC('FAN THE FLAMES — ' + this.goodTaps + '/3', W / 2, my - 12, 7, '#ff8a3d');
          }
          api.topBar('INSIDE MONSTRO');
          api.txt('WOOD ' + this.wood + '/' + this.needWood, 6, 20, 9, '#c8a060');
          if (this.phase === 'collect') {
            g.rect(W - 66, 21, 60, 6, '#180806');
            g.rect(W - 66, 21, 60 * clamp(1 - this.timer / 32, 0, 1), 6, '#4ab8e8');
          }
          api.vignette();
        },
      },

    ],
  });
})();
