/* ============================================================================
 * ROBIN HOOD — THE SHERWOOD SAGA
 * Five chapters through the legends of Sherwood:
 *   1. THE TOURNAMENT  — dual-axis archery aim (split the shaft)
 *   2. SHERWOOD RIDE   — horseback dodge runner
 *   3. THE LOG BRIDGE  — staff-duel watch-and-strike timing
 *   4. ROB THE RICH    — catch falling gold coins
 *   5. THE RECKONING   — dodge arrows, counter-strike the Sheriff
 * Built on RetroSaga (js/saga.js) + RetroEngine.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Longbow arc
    c.strokeStyle = '#8b5e3c'; c.lineWidth = 5;
    c.beginPath(); c.arc(cx - 6, cy, 30, -Math.PI * 0.58, Math.PI * 0.58); c.stroke();
    // Bowstring
    c.strokeStyle = '#e3c567'; c.lineWidth = 2;
    const a0 = -Math.PI * 0.58, a1 = Math.PI * 0.58;
    c.beginPath();
    c.moveTo(cx - 6 + 30 * Math.cos(a0), cy + 30 * Math.sin(a0));
    c.lineTo(cx - 6 + 30 * Math.cos(a1), cy + 30 * Math.sin(a1));
    c.stroke();
    // Arrow shaft
    g.rect(cx - 30, cy - 1, 62, 2, '#e3c567');
    // Arrowhead
    g.sprite(['.t', 'tt', '.t'], cx + 28, cy - 3, { t: '#5dff8f' }, 2);
    // Fletching
    g.sprite(['f.', 'ff', 'f.'], cx - 32, cy - 3, { f: '#c8102e' }, 2);
  }

  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;
    // Deep forest canopy
    c.fillStyle = '#0b1a06'; c.fillRect(0, 0, W, H);
    // Sunbeam shafts filtering through canopy
    c.globalAlpha = 0.055 + 0.02 * Math.sin(t * 0.5);
    c.fillStyle = '#c8e070';
    c.beginPath(); c.moveTo(W * 0.65, 0); c.lineTo(W * 0.85, 0); c.lineTo(W * 0.42, H * 0.6); c.lineTo(W * 0.28, H * 0.6); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(W * 0.15, 0); c.lineTo(W * 0.28, 0); c.lineTo(W * 0.12, H * 0.5); c.lineTo(W * 0.04, H * 0.5); c.closePath(); c.fill();
    c.globalAlpha = 1;
    // Dappled light pools on ground
    for (let i = 0; i < 5; i++) {
      const lx = (i * 67 + 18) % W, ly = H * 0.5 + (i * 41) % (H * 0.35);
      c.globalAlpha = 0.06 + 0.03 * Math.sin(t * 0.7 + i);
      c.fillStyle = '#c8e070';
      c.beginPath(); c.ellipse(lx, ly, 22, 12, 0, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
    // Ground
    c.fillStyle = '#101e08'; c.fillRect(0, H * 0.52, W, H * 0.48);
    // Undergrowth ferns
    c.fillStyle = '#183010';
    for (let i = 0; i < 10; i++) { const fx = (i * 29 + 4) % W; c.fillRect(fx, H * 0.52 - 8, 12, 14); }
    // Tree trunks and canopy silhouettes (layers)
    const trees = [[6,72],[44,88],[88,62],[130,82],[172,70],[212,84],[250,58]];
    c.fillStyle = '#09140a';
    for (const [tx, th] of trees) {
      c.fillRect(tx + 8, H * 0.52 - th, 9, th);
      c.beginPath(); c.arc(tx + 12, H * 0.52 - th, 20, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(tx + 6, H * 0.52 - th + 10, 14, 0, Math.PI * 2); c.fill();
    }
    // Animated drifting leaves
    for (let i = 0; i < 8; i++) {
      const lx = ((t * 14 + i * 41) % (W + 20)) - 10;
      const ly = 30 + Math.sin(t * 1.3 + i * 1.8) * 22 + i * 22;
      c.globalAlpha = 0.5;
      g.rect(lx, ly, 4, 4, i % 2 ? '#3ab840' : '#288a28');
    }
    c.globalAlpha = 1;
    // Overlay dimming for narrative / menu screens
    if (scene === 'intro' || scene === 'finale' || scene === 'result') {
      c.fillStyle = 'rgba(3,8,2,.70)'; c.fillRect(0, 0, W, H);
    } else if (scene === 'menu') {
      // a BRIGHT Sherwood clearing — totally unlike the dark in-game forest
      const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#aee07a'); sky.addColorStop(0.45, '#7ec24a'); sky.addColorStop(1, '#3e7a26');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);
      c.fillStyle = '#fff6c0'; c.beginPath(); c.arc(W - 40, 46, 20, 0, 7); c.fill();
      c.globalAlpha = 0.3; c.beginPath(); c.arc(W - 40, 46, 32, 0, 7); c.fill(); c.globalAlpha = 1;
      c.fillStyle = '#3a7a2a'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(i * 34 + 8, 118, 24, 0, 7); c.fill(); }
      c.fillStyle = '#2f6320'; c.fillRect(0, 128, W, H - 128);
      c.fillStyle = '#3f8a2c'; for (let i = 0; i < 70; i++) { const gx = (i * 31) % W, gy = 138 + (i * 53) % (H - 150); c.fillRect(gx, gy, 1, 4); }
    }
  }

  RetroSaga.create({
    id: 'robinhood',
    title: 'Robin Hood',
    subtitle: 'FIVE TALES OF SHERWOOD',
    currency: 'GLORY',
    // framed-screen palette + wording (Sherwood green, archer's gold)
    screens: { win: '#9be84a', lose: '#8b3a1a', chapterLabel: '#b8a86a', name: '#e3c567',
      sub: '#5dff8f', intro: '#d8e8b0', quote: '#8b9e5a', help: '#9be84a',
      score: '#e8e0c0', cur: '#9be84a', cta: '#e3c567', overlay: 'rgba(10,20,8,.84)' },
    labels: { chapter: 'TALE', score: 'PURSE WON', win: 'A CLEAN SHOT',
      lose: 'WIDE OF THE MARK', cont: 'TAP TO RIDE ON', finale: 'TAP FOR THE GRAND CONTEST',
      toMenu: 'TAP TO RETURN', play: 'TAP TO LOOSE' },
    accent: '#5dff8f',
    credit: 'AN 8-BIT TRIBUTE · ENGLISH FOLKLORE',
    emblem,
    scenery,
    bootCta: 'TAP TO RIDE',
    menuLabel: 'LEGENDS OF SHERWOOD',
    menuHint: 'CHOOSE YOUR CHAPTER',
    menuDone: 'SHERWOOD IS FREE',
    menu: {
      // chapters are ARCHERY TARGETS scattered in a zigzag across the clearing
      title(api, glory) {
        const g = api.gfx, W = api.W;
        g.rect(40, 22, W - 80, 4, '#3e2c18');                      // hang rope
        g.rect(54, 26, W - 108, 34, '#5a3f22'); g.rectO(54, 26, W - 108, 34, '#e8c84a', 2); // wooden banner
        api.txtCFit('LEGENDS OF SHERWOOD', W / 2, 32, 9, '#f0e6c0', false, W - 116);
        api.txtCFit('GLORY  ' + glory, W / 2, 48, 9, '#ffe14d', false, W - 116);
      },
      layout(api) {
        const C = [[58, 152], [206, 214], [70, 280], [198, 346], [84, 414]];
        return C.map((p) => ({ x: p[0] - 30, y: p[1] - 30, w: 60, h: 60 }));
      },
      card(api, info) {
        const g = api.gfx, c = api.ctx, { ch, i, x, y, w, h, sel, done } = info;
        const cx = x + w / 2, cy = y + h / 2;
        const rings = ['#f6f0dc', '#3a6abf', '#f6f0dc', '#e03030', '#f6f0dc'];
        for (let r = 0; r < 5; r++) { c.fillStyle = rings[r]; c.beginPath(); c.arc(cx, cy, 28 - r * 5, 0, 7); c.fill(); }
        c.fillStyle = '#d8a020'; c.beginPath(); c.arc(cx, cy, 4, 0, 7); c.fill();
        api.txtC('' + (i + 1), cx, cy - 4, 8, '#1a1008', true);
        if (sel) { g.rect(cx - 1, cy - 30, 2, 18, '#caa15a'); g.sprite(['f.', 'ff', 'f.'], cx - 4, cy - 30, { f: '#c8102e' }, 2); } // arrow stuck in
        if (done) { c.strokeStyle = '#e8c84a'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 31, 0, 7); c.stroke(); }
        const left = cx < api.W / 2;
        const tw = ch.name.length * 6 + 10, bx = left ? cx + 34 : cx - 34 - tw;
        g.rect(bx, cy - 9, tw, 18, '#3e2c18'); g.rectO(bx, cy - 9, tw, 18, sel ? '#e8c84a' : '#6a4a28', 1);
        api.txt(ch.name, bx + 5, cy - 4, 8, done ? '#e8c84a' : '#f0e6c0');
      },
    },
    finale: ['THE SHERIFF FALLS.', 'MAID MARIAN WALKS', 'FREE IN THE SUNLIGHT.', '', 'SHERWOOD SINGS.'],
    width: 270, height: 480, parent: '#game',
    palette: { gold: '#e3c567', green: '#5dff8f', brown: '#8b5e3c', blood: '#c8102e' },

    chapters: [

      /* ===================== 1. THE TOURNAMENT ======================== */
      {
        id: 'tournament', name: 'THE TOURNAMENT', sub: 'SPLIT THE SHAFT',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 8, '#c8102e');
          g.circle(x, y, 5, '#e8d9b0');
          g.circle(x, y, 2, '#c8102e');
          g.rect(x - 10, y - 1, 13, 2, '#e3c567');
        },
        intro: [
          'THE SHERIFF OF NOTTINGHAM',
          'HOLDS AN ARCHERY CONTEST.',
          'ROBIN ENTERS IN DISGUISE',
          'to claim the golden arrow.',
        ],
        quote: 'He notched his shaft and loosed — and split his rival\'s arrow clean down the middle.',
        help: 'TAP when BOTH aim bars glow green',
        winText: 'The crowd roars. Robin tears off his hood. The Sheriff grabs for his sword — too late.',
        loseText: 'The arrows fly wide. A guard\'s eyes narrow under his helm.',
        init(api) {
          this.shots = 0; this.need = 3; this.misses = 0;
          this.hPos = 0; this.vPos = 0;
          this.hDir = 1; this.vDir = 1;
          this.hSpd = 0.9; this.vSpd = 0.65;
          this.flying = false; this.flyT = 0;
        },
        update(api, dt) {
          const f = dt * 60;
          if (this.flying) {
            this.flyT += dt;
            if (this.flyT > 0.5) { this.flying = false; if (this.shots >= this.need) { api.score += 80; api.win(); } }
            return;
          }
          this.hPos += this.hDir * this.hSpd * 0.035 * f;
          if (this.hPos > 1) { this.hPos = 1; this.hDir = -1; }
          if (this.hPos < 0) { this.hPos = 0; this.hDir = 1; }
          this.vPos += this.vDir * this.vSpd * 0.035 * f;
          if (this.vPos > 1) { this.vPos = 1; this.vDir = -1; }
          if (this.vPos < 0) { this.vPos = 0; this.vDir = 1; }
          if (api.confirm()) {
            const zone = Math.max(0.09, 0.14 - this.shots * 0.022);
            const hOff = Math.abs(this.hPos - 0.5), vOff = Math.abs(this.vPos - 0.5);
            if (hOff < zone && vOff < zone) {
              this.shots++;
              api.score += Math.round((1 - (hOff + vOff) / (zone * 2)) * 60 + 25);
              api.audio.sfx('power'); api.shake(4, 0.2);
              api.burst(api.W / 2, Math.round(api.H * 0.35), '#e3c567', 14);
              this.hSpd = Math.min(2.2, this.hSpd + 0.22);
              this.vSpd = Math.min(1.8, this.vSpd + 0.17);
              this.flying = true; this.flyT = 0;
            } else {
              this.misses++; api.audio.sfx('hurt'); api.shake(3, 0.15);
              if (this.misses >= 4) { api.lose(); }
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#160e06');
          // Crowd silhouettes at bottom
          for (let i = 0; i < 15; i++) {
            const px = i * 18 + 2, ph = 18 + (i * 11 % 14);
            g.rect(px, H - 46 - ph, 11, ph, '#0d0904');
            g.circle(px + 5, H - 48 - ph, 5, '#0d0904');
          }
          // Archery target on far end
          const tx = W / 2, ty = Math.round(H * 0.35);
          g.circle(tx, ty, 30, '#1a0a06');
          g.circle(tx, ty, 24, '#c8102e');
          g.circle(tx, ty, 16, '#e8d9b0');
          g.circle(tx, ty, 9, '#c8102e');
          g.circle(tx, ty, 4, '#e3c567');
          // Stuck arrows (previous shots)
          for (let i = 0; i < this.shots; i++) {
            g.rect(tx - 26 + i * 8, ty - 1, 28, 2, '#e3c567');
            g.sprite(['.t', 'tt', '.t'], tx - 2 + i * 8, ty - 3, { t: '#5dff8f' }, 2);
          }
          // Crosshair (if not flying)
          if (!this.flying) {
            const zone = Math.max(0.09, 0.14 - this.shots * 0.022);
            const ox = (this.hPos - 0.5) * 48, oy = (this.vPos - 0.5) * 48;
            const cx2 = tx + ox, cy2 = ty + oy;
            const inH = Math.abs(this.hPos - 0.5) < zone;
            const inV = Math.abs(this.vPos - 0.5) < zone;
            const col = (inH && inV) ? '#5dff8f' : (inH || inV) ? '#e3c567' : '#e8d9b0';
            c.strokeStyle = col; c.lineWidth = 1.5; c.globalAlpha = 0.9;
            c.beginPath(); c.arc(cx2, cy2, 11, 0, Math.PI * 2); c.stroke();
            c.beginPath(); c.moveTo(cx2 - 16, cy2); c.lineTo(cx2 + 16, cy2); c.stroke();
            c.beginPath(); c.moveTo(cx2, cy2 - 16); c.lineTo(cx2, cy2 + 16); c.stroke();
            c.globalAlpha = 1;
          }
          // Arrow in flight
          if (this.flying) {
            const prog = this.flyT / 0.5;
            const ay = H * 0.6 + (ty - H * 0.6) * prog;
            g.rect(W / 2 - 18, ay - 1, 36, 2, '#e3c567');
            g.sprite(['.t', 'tt', '.t'], W / 2 + 14, ay - 3, { t: '#5dff8f' }, 2);
          }
          // Aim bars at bottom
          const mw = W - 48, mx = 24, zone2 = Math.max(0.09, 0.14 - this.shots * 0.022);
          // Horizontal bar
          g.rect(mx, H - 52, mw, 10, '#1e1206');
          g.rect(mx + mw * (0.5 - zone2), H - 52, mw * zone2 * 2, 10, 'rgba(93,255,143,.25)');
          g.rect(mx + mw * 0.5 - 1, H - 55, 2, 16, '#5dff8f');
          g.rect(mx + mw * this.hPos - 2, H - 56, 4, 18, '#e3c567');
          api.txt('H', mx - 14, H - 50, 8, api.colors.dim);
          // Vertical bar
          g.rect(mx, H - 34, mw, 10, '#1e1206');
          g.rect(mx + mw * (0.5 - zone2), H - 34, mw * zone2 * 2, 10, 'rgba(93,255,143,.25)');
          g.rect(mx + mw * 0.5 - 1, H - 37, 2, 16, '#5dff8f');
          g.rect(mx + mw * this.vPos - 2, H - 38, 4, 18, api.colors.gold);
          api.txt('V', mx - 14, H - 32, 8, api.colors.dim);
          api.topBar('THE TOURNAMENT');
          api.txt('SHOT ' + this.shots + '/' + this.need, 6, 20, 9, api.colors.gold);
          api.txt('MISS ' + this.misses + '/4', W - 80, 20, 9, this.misses > 2 ? '#c8102e' : api.colors.dim);
          api.vignette(); api.scanlines();
        },
      },

      /* ===================== 2. SHERWOOD RIDE ======================== */
      {
        id: 'ride', name: 'SHERWOOD RIDE', sub: 'THROUGH THE GREENWOOD',
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite([
            '.hh.',
            'hbbh',
            '.hh.',
            '.ll.',
          ], x - 8, y - 8, { h: '#6b3c14', b: '#2a5218', l: '#4a2c10' }, 4);
        },
        intro: [
          'THE SHERIFF\'S MEN GIVE',
          'CHASE THROUGH SHERWOOD.',
          'ROBIN RIDES HARD THROUGH',
          'the ancient greenwood.',
        ],
        quote: 'Come, Merry Men! Ride swift as the north wind through the good trees of Sherwood!',
        help: 'TAP left/right side of screen · arrow keys to steer',
        winText: 'Robin shakes his pursuers in the deep forest. The men scatter laughing into the oaks.',
        loseText: 'A lance clips his shoulder — Robin tumbles from the saddle.',
        init(api) {
          this.x = api.W / 2; this.timer = 28;
          this.obs = []; this.spawnT = 0.9; this.speed = 2.8;
          this.sceneTrees = []; this.treeSpawnT = 0.3;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          api.score = Math.max(0, Math.floor((28 - this.timer) * 5));
          this.speed = Math.min(5.0, this.speed + dt * 0.06);
          // Steer
          const p = api.pointer;
          if (p.down) { this.x += (p.x < api.W / 2 ? -1 : 1) * 4.2 * f; }
          if (api.keyDown('left')) this.x -= 3.5 * f;
          if (api.keyDown('right')) this.x += 3.5 * f;
          this.x = clamp(this.x, 22, api.W - 22);
          // Spawn obstacles
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.5, 1.1);
            const kind = api.chance(0.38) ? 'arrow' : 'guard';
            this.obs.push({ x: api.rnd(24, api.W - 24), y: -24, vy: this.speed * (kind === 'arrow' ? 1.6 : 1.0), kind });
          }
          // Spawn scenery trees
          this.treeSpawnT -= dt;
          if (this.treeSpawnT <= 0) {
            this.treeSpawnT = api.rnd(0.18, 0.45);
            const side = api.chance(0.5);
            this.sceneTrees.push({ x: side ? api.rnd(4, 38) : api.rnd(api.W - 38, api.W - 4), y: -36, vy: this.speed * 0.75 });
          }
          for (const o of this.obs) o.y += o.vy * f;
          for (const tr of this.sceneTrees) tr.y += tr.vy * f;
          this.sceneTrees = this.sceneTrees.filter(tr => tr.y < api.H + 50);
          // Collision
          const playerY = api.H - 62;
          this.obs = this.obs.filter(o => {
            if (o.y > api.H + 20) return false;
            if (!o.hit && Math.abs(o.x - this.x) < 18 && Math.abs(o.y - playerY) < 18) {
              o.hit = true; api.shake(5, 0.25); api.flash('#c8102e', 0.15);
              api.audio.sfx('hurt'); this.timer -= 5;
              if (this.timer <= 0) { api.lose(); return false; }
            }
            return !o.hit;
          });
          if (this.timer <= 0) { api.score += 70; api.win(); }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H;
          api.clear('#0a1606');
          // Forest floor
          g.rect(0, H - 46, W, 46, '#0c1806');
          for (let i = 0; i < 18; i++) g.rect(i * 15, H - 48, 9, 9, '#121e08');
          // Scrolling dirt path (center)
          for (let yi = -30; yi < H; yi += 38) {
            const ry = (yi + api.t * (this.speed * 12)) % (H + 38) - 30;
            g.rect(W / 2 - 22, ry, 44, 20, '#1a1208');
          }
          // Scenery trees (parallax)
          for (const tr of this.sceneTrees) {
            g.rect(tr.x - 5, tr.y, 10, 44, '#090e06');
            const cc = api.ctx; cc.fillStyle = '#0a1008';
            cc.beginPath(); cc.arc(tr.x, tr.y, 18, 0, Math.PI * 2); cc.fill();
          }
          // Obstacles
          for (const o of this.obs) {
            if (o.kind === 'guard') {
              g.sprite(['.rr.', 'rrrr', '.rr.', 'r..r'], o.x - 8, o.y - 14, { r: '#c8102e' }, 4);
            } else {
              g.rect(o.x - 14, o.y - 1, 28, 2, '#e3c567');
              g.sprite(['.t', 'tt', '.t'], o.x + 12, o.y - 3, { t: '#e3c567' }, 2);
            }
          }
          // Robin on horseback
          g.sprite([
            '..hh..',
            '.hGGh.',
            'hGGGGG',
            '.hhh..',
            '.g..g.',
          ], this.x - 12, H - 84, { h: '#6b3c14', G: '#2a5218', g: '#1a0c06' }, 4);
          api.topBar('SHERWOOD RIDE');
          api.txt('TIME ' + Math.max(0, Math.ceil(this.timer)), 6, 20, 9, api.colors.gold);
          const tw = W - 86;
          g.rect(W - tw - 6, 21, tw, 6, '#1a1a08');
          g.rect(W - tw - 6, 21, tw * clamp(this.timer / 28, 0, 1), 6, '#5dff8f');
          api.vignette(); api.scanlines();
        },
      },

      /* ===================== 3. THE LOG BRIDGE ======================== */
      {
        id: 'bridge', name: 'THE LOG BRIDGE', sub: 'HONOUR AMONG OUTLAWS',
        icon(api, x, y) {
          const g = api.gfx;
          g.rect(x - 9, y - 1, 18, 2, '#8b5e3c');
          g.rect(x - 1, y - 9, 2, 18, '#8b5e3c');
        },
        intro: [
          'A GIANT STRANGER BLOCKS',
          'THE NARROW LOG BRIDGE.',
          '"CROSS IF YOU DARE."',
          'Robin takes up his staff.',
        ],
        quote: 'He fell with such a crash into the cold water that the sound of it made Robin\'s heart merry.',
        help: 'TAP when STRIKE! glows — too early or too late and you slip',
        winText: '"Well struck! I am John Little — call me Little John." And so a Merry Man was made.',
        loseText: 'Robin goes head-first into the river. Little John extends a laughing hand.',
        init(api) {
          this.pos = 0.5; this.hits = 0; this.need = 5; this.misses = 0;
          this.phase = 'watch'; this.phaseT = 0;
          this.windowOpen = false; this.windowT = 0;
          this.attackT = api.rnd(1.0, 1.6);
        },
        update(api, dt) {
          const f = dt * 60;
          this.phaseT += dt;
          if (this.phase === 'watch') {
            // John slowly pushes Robin back
            this.pos = Math.max(0.12, this.pos - 0.006 * f);
            this.attackT -= dt;
            if (this.attackT <= 0) {
              this.phase = 'strike'; this.phaseT = 0;
              this.windowOpen = true; this.windowT = 0.5 - this.hits * 0.04;
              api.audio.sfx('blip');
            }
            if (this.pos <= 0.12 && !this.windowOpen) { api.lose(); return; }
          } else {
            this.windowT -= dt;
            if (api.confirm()) {
              if (this.windowOpen) {
                this.windowOpen = false; this.hits++;
                this.pos = Math.min(0.88, this.pos + 0.2);
                api.score += 40; api.audio.sfx('power');
                api.shake(5, 0.25); api.burst(api.W / 2, api.H * 0.52, '#5dff8f', 10);
                if (this.hits >= this.need) { api.score += 80; api.win(); return; }
                this.phase = 'watch'; this.attackT = api.rnd(0.8, 1.4) - this.hits * 0.06;
              } else {
                // Too early
                this.misses++; api.audio.sfx('hurt'); api.shake(3, 0.18);
                this.pos = Math.max(0.12, this.pos - 0.08);
                if (this.misses >= 4) { api.lose(); return; }
                this.phase = 'watch'; this.attackT = api.rnd(0.9, 1.5);
              }
            } else if (this.windowT <= 0) {
              // Missed window
              this.windowOpen = false; this.misses++;
              api.audio.sfx('hurt'); api.shake(3, 0.18);
              this.pos = Math.max(0.12, this.pos - 0.1);
              if (this.misses >= 4) { api.lose(); return; }
              this.phase = 'watch'; this.attackT = api.rnd(0.9, 1.5);
            }
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#0a1828');
          // Sky
          g.rect(0, 0, W, H * 0.4, '#0d2235');
          // Distant trees
          for (let i = 0; i < 9; i++) {
            const tx = i * 30 + 5;
            c.fillStyle = '#09180a';
            c.beginPath(); c.arc(tx + 10, H * 0.4 - 12, 14, 0, Math.PI * 2); c.fill();
          }
          // River (animated)
          for (let y = H * 0.5; y < H; y += 5) {
            c.globalAlpha = 0.55 + 0.1 * Math.sin(api.t * 2.5 + y * 0.08);
            g.rect(0, y, W, 4, y % 10 < 5 ? '#0f2840' : '#0c2035');
          }
          c.globalAlpha = 1;
          // Log bridge
          g.rect(0, H * 0.5 - 9, W, 9, '#6b3c10');
          for (let i = 0; i < 9; i++) g.rect(i * 30, H * 0.5 - 11, 24, 7, '#5a3010');
          // Robin (left)
          g.sprite(['.gg.', 'gggg', '.gg.', 'g..g'], 28, H * 0.5 - 42, { g: '#2a5218' }, 6);
          g.rect(38, H * 0.5 - 64, 4, 72, '#8b5e3c');
          // Little John (right, larger)
          g.sprite(['.bb.', 'bbbb', '.bb.', 'b..b'], W - 72, H * 0.5 - 58, { b: '#5a3820' }, 8);
          g.rect(W - 58, H * 0.5 - 82, 4, 86, '#6b4028');
          // Push meter
          const mw = W - 36, mx = 18, my = H - 28;
          g.rect(mx, my, mw, 14, '#1a120a');
          g.rect(mx, my, mw * this.pos, 14, '#5dff8f');
          g.rect(mx + mw * 0.5 - 1, my - 3, 2, 20, '#e3c567');
          g.rectO(mx, my, mw, 14, '#4a3820', 1);
          api.txt('R', mx - 14, my + 2, 8, '#5dff8f');
          api.txt('J', mx + mw + 4, my + 2, 8, '#c8102e');
          // Strike indicator
          if (this.windowOpen) {
            const urgency = this.windowT / (0.5 - this.hits * 0.04);
            const wc = urgency > 0.4 ? '#5dff8f' : '#e3c567';
            api.txtCFit('STRIKE!', W / 2, H - 50, 14, wc, true);
            c.strokeStyle = wc; c.lineWidth = 2;
            c.strokeRect(mx - 2, my - 2, mw + 4, 18);
          } else if (this.phase === 'watch') {
            api.txtCFit('WATCH...', W / 2, H - 50, 9, api.colors.dim);
          }
          api.topBar('THE LOG BRIDGE');
          api.txt('PUSH ' + this.hits + '/' + this.need, 6, 20, 9, api.colors.gold);
          api.txt('SLIP ' + this.misses + '/4', W - 82, 20, 9, this.misses > 2 ? '#c8102e' : api.colors.dim);
          api.vignette(); api.scanlines();
        },
      },

      /* ===================== 4. ROB THE RICH ========================== */
      {
        id: 'rob', name: 'ROB THE RICH', sub: 'FOR THE POOR OF SHERWOOD',
        icon(api, x, y) {
          const g = api.gfx;
          g.circle(x, y, 5, '#e3c567');
          g.circle(x - 8, y + 2, 3, '#e3c567');
          g.circle(x + 8, y + 2, 3, '#e3c567');
          g.circle(x, y + 5, 3, '#e3c567');
        },
        intro: [
          'THE SHERIFF\'S TAX CARRIAGE',
          'ROLLS THROUGH SHERWOOD.',
          'ROBIN AND HIS MEN',
          'drop from the branches.',
        ],
        quote: 'Twelve score gold pieces — every groat wrung from the necks of the poor of Nottinghamshire.',
        help: 'DRAG or use arrow keys to catch the falling coins',
        winText: 'Bags of gold change hands in the greenwood. The poor of Sherwood eat tonight.',
        loseText: 'The carriage breaks free, scattering gold in the mud.',
        init(api) {
          this.x = api.W / 2; this.caught = 0; this.need = 20; this.missed = 0;
          this.coins = []; this.spawnT = 0.45; this.timer = 32;
          this.cartX = api.W / 2; this.cartDir = 1;
        },
        update(api, dt) {
          const f = dt * 60;
          this.timer -= dt;
          api.score = this.caught * 6;
          // Carriage sways
          this.cartX += this.cartDir * 0.5 * f;
          if (this.cartX > api.W - 40) this.cartDir = -1;
          if (this.cartX < 40) this.cartDir = 1;
          // Move Robin
          if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.2 * f;
          if (api.keyDown('left')) this.x -= 4.2 * f;
          if (api.keyDown('right')) this.x += 4.2 * f;
          this.x = clamp(this.x, 20, api.W - 20);
          // Spawn coins from carriage
          this.spawnT -= dt;
          if (this.spawnT <= 0) {
            this.spawnT = api.rnd(0.28, 0.62);
            this.coins.push({ x: this.cartX + api.rnd(-28, 28), y: 68, vy: api.rnd(1.8, 3.0), spin: api.rnd(-1, 1) });
          }
          const catchY = api.H - 48;
          this.coins = this.coins.filter(coin => {
            coin.y += coin.vy * f; coin.x += coin.spin * 0.4 * f;
            if (Math.abs(coin.x - this.x) < 24 && Math.abs(coin.y - catchY) < 16) {
              this.caught++; api.score += 6;
              api.audio.sfx('coin'); api.burst(coin.x, coin.y, '#e3c567', 6);
              if (this.caught >= this.need) { api.score += 80; api.win(); return false; }
              return false;
            }
            if (coin.y > api.H + 10) { this.missed++; api.audio.sfx('blip'); if (this.missed >= 10) { api.lose(); return false; } return false; }
            return true;
          });
          if (this.timer <= 0) {
            if (this.caught >= this.need) { api.score += 50; api.win(); } else api.lose();
          }
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#0c1a06');
          // Forest wall top
          for (let i = 0; i < 8; i++) {
            const tx = i * 34 + 2;
            c.fillStyle = '#091006';
            c.beginPath(); c.arc(tx + 14, 4, 24, 0, Math.PI * 2); c.fill();
            g.rect(tx + 10, 0, 8, 28, '#09100a');
          }
          // Road
          g.rect(0, H - 38, W, 38, '#1a1208');
          for (let i = 0; i < 10; i++) g.rect(i * 28, H - 40, 20, 5, '#22180c');
          // Tax carriage
          const cx = this.cartX;
          g.sprite([
            '.CCCC.',
            'CCCCCC',
            'C.rr.C',
            'CCCCCC',
            '.w..w.',
          ], cx - 18, 32, { C: '#4a2010', r: '#c8102e', w: '#3a2810' }, 6);
          // Coins (spinning gold)
          for (const coin of this.coins) {
            g.circle(coin.x, coin.y, 5, '#e3c567');
            g.circle(coin.x + 1, coin.y - 1, 2, '#c8a020');
          }
          // Robin (catcher)
          g.sprite(['.gg.', 'gggg', '.gg.', 'g..g', '.bb.'], this.x - 8, H - 74, { g: '#2a5218', b: '#4a3820' }, 4);
          // Catch zone indicator
          g.rect(this.x - 24, H - 46, 48, 14, 'rgba(93,255,143,.14)');
          g.rectO(this.x - 24, H - 46, 48, 14, '#5dff8f', 1);
          // Progress bar
          g.rect(18, H - 18, W - 36, 8, '#1a1206');
          g.rect(18, H - 18, (W - 36) * (this.caught / this.need), 8, '#e3c567');
          g.rectO(18, H - 18, W - 36, 8, '#4a3820', 1);
          api.topBar('ROB THE RICH');
          api.txt('COINS ' + this.caught + '/' + this.need, 6, 20, 9, api.colors.gold);
          const trem = Math.max(0, Math.ceil(this.timer));
          api.txt('TIME ' + trem, W - 72, 20, 9, trem < 8 ? '#c8102e' : api.colors.dim);
          api.vignette(); api.scanlines();
        },
      },

      /* ===================== 5. THE RECKONING ========================= */
      {
        id: 'reckoning', name: 'THE RECKONING', sub: 'DOWN WITH THE SHERIFF',
        icon(api, x, y) {
          const g = api.gfx;
          g.sprite(['.ss.', 'ssss', 's.Ws', '.ss.'], x - 8, y - 8, { s: '#c8102e', W: '#e8d9b0' }, 4);
        },
        intro: [
          'THE SHERIFF OF NOTTINGHAM',
          'STANDS IN THE COURTYARD.',
          'MAID MARIAN WATCHES',
          'from the tower above.',
        ],
        quote: 'I am the law of Nottinghamshire — and you, Hood, are nothing but an outlaw and a thief.',
        help: 'DODGE the arrows · TAP to counter when the Sheriff reloads',
        winText: 'The last arrow falls. The Sheriff of Nottingham lies in the mud. Marian is free.',
        loseText: 'An arrow finds its mark. Robin retreats, bleeding, to Sherwood.',
        init(api) {
          this.x = api.W / 2; this.hits = 0; this.need = 4;
          this.arrows = []; this.spawnT = 1.1;
          this.shotsFired = 0; this.shotsPerVolley = 3;
          this.reloading = false; this.reloadT = 0;
          this.shieldT = 0; this.health = 4;
          this.sheriffX = api.W / 2 - 12; this.sheriffY = 80;
        },
        update(api, dt) {
          const f = dt * 60;
          this.shieldT = Math.max(0, this.shieldT - dt);
          api.score = this.hits * 60 + Math.floor(api.t * 2);
          // Move Robin
          if (api.pointer.down) this.x += (api.pointer.x - this.x) * 0.22 * f;
          if (api.keyDown('left')) this.x -= 3.8 * f;
          if (api.keyDown('right')) this.x += 3.8 * f;
          this.x = clamp(this.x, 18, api.W - 18);
          // Sheriff fires
          if (!this.reloading) {
            this.spawnT -= dt;
            if (this.spawnT <= 0) {
              this.spawnT = Math.max(0.35, 0.7 - this.hits * 0.08);
              const speed = 3.0 + this.hits * 0.45;
              const sx = this.sheriffX + 12 + api.rnd(-28, 28);
              const aimed = api.chance(0.45);
              const vx = aimed ? (this.x - sx) * 0.03 : api.rnd(-0.5, 0.5);
              this.arrows.push({ x: sx, y: this.sheriffY + 38, vy: speed, vx });
              this.shotsFired++;
              if (this.shotsFired >= this.shotsPerVolley) {
                this.reloading = true;
                this.reloadT = Math.max(0.9, 1.8 - this.hits * 0.2);
                this.shotsFired = 0; api.audio.sfx('blip');
              }
            }
          } else {
            this.reloadT -= dt;
            if (api.confirm() && this.shieldT <= 0) {
              this.hits++; this.shieldT = 0.4;
              api.score += 60; api.audio.sfx('power');
              api.shake(6, 0.3); api.flash('#5dff8f', 0.15);
              api.burst(this.sheriffX + 12, this.sheriffY + 10, '#5dff8f', 14);
              if (this.hits >= this.need) { api.score += 120; api.win(); return; }
            }
            if (this.reloadT <= 0) { this.reloading = false; }
          }
          // Move arrows + collision
          const robinY = api.H - 62;
          this.arrows = this.arrows.filter(a => {
            a.y += a.vy * f; a.x += a.vx * f;
            if (a.y > api.H + 12) return false;
            if (!a.hit && Math.abs(a.x - this.x) < 14 && Math.abs(a.y - robinY) < 16) {
              a.hit = true; api.shake(5, 0.3); api.flash('#c8102e', 0.2);
              api.audio.sfx('hurt'); this.health--;
              if (this.health <= 0) { api.lose(); return false; }
            }
            return !a.hit;
          });
        },
        draw(api) {
          const g = api.gfx, W = api.W, H = api.H, c = api.ctx;
          api.clear('#160e06');
          // Castle courtyard
          g.rect(0, 0, W, H * 0.42, '#121008');
          for (let y = 0; y < H * 0.42; y += 22) {
            for (let x = 0; x < W; x += 34) {
              g.rect(x + ((Math.floor(y / 22) % 2) ? 17 : 0), y, 32, 20, '#181410');
            }
          }
          // Maid Marian in tower window
          g.rect(W - 38, 12, 28, 36, '#1a100a');
          g.rectO(W - 38, 12, 28, 36, '#4a3820', 1);
          g.sprite(['.mm.', 'mmmm', '.mm.'], W - 34, 16, { m: '#ff2e97' }, 4);
          // Ground
          g.rect(0, H * 0.42, W, H * 0.58, '#1a1008');
          for (let i = 0; i < 9; i++) g.rect(i * 30, H * 0.42, 22, 6, '#221408');
          // Sheriff
          const sv = this.sheriffX, sy = this.sheriffY;
          const reloadProg = this.reloading ? 1 - this.reloadT / Math.max(0.9, 1.8 - this.hits * 0.2) : 0;
          g.sprite([
            '.ss.',
            'ssss',
            's.Ws',
            'ssss',
            '.ll.',
          ], sv, sy, { s: '#c8102e', W: '#e8e8e8', l: '#801010' }, 6);
          // Reload bar above Sheriff
          if (this.reloading) {
            g.rect(sv - 4, sy - 14, 40, 7, '#1a0a06');
            const bc = reloadProg > 0.65 ? '#5dff8f' : '#e3c567';
            g.rect(sv - 4, sy - 14, 40 * reloadProg, 7, bc);
            if (reloadProg > 0.65) api.txtCFit('TAP!', sv + 18, sy - 26, 10, '#5dff8f', true);
          }
          // Arrows
          for (const a of this.arrows) {
            g.rect(a.x - 14, a.y - 1, 28, 2, '#e3c567');
            g.sprite(['.t', 'tt', '.t'], a.x + 12, a.y - 3, { t: '#e3c567' }, 2);
          }
          // Robin at bottom
          g.sprite(['.gg.', 'gggg', '.gg.', 'g..g'], this.x - 8, H - 70, { g: '#2a5218' }, 4);
          // Arrow indicator (nocked)
          g.rect(this.x - 14, H - 58, 18, 2, '#e3c567');
          api.topBar('THE RECKONING');
          api.txt('HIT ' + this.hits + '/' + this.need, 6, 20, 9, api.colors.gold);
          for (let i = 0; i < 4; i++) { g.rect(W - 16 - i * 14, 20, 10, 8, i < this.health ? '#5dff8f' : '#2a1206'); }
          api.vignette(); api.scanlines();
        },
      },

    ],
  });
})();
