/* ============================================================================
 * BLACK BEAUTY — FIVE RIDES
 * Five chapters from Anna Sewell's 1877 novel:
 *   1. BIRTWICK PARK    — galloping runner: jump fences, collect rosettes (~22s)
 *   2. THE BEARING REIN — catch apples, freeze when groom watches (~24s)
 *   3. STORM RIDE       — vertical dodge: race to the doctor through the storm (~20s)
 *   4. LONDON CAB       — rhythm energy: tap to keep pace, dodge potholes (~24s)
 *   5. THE MEADOW       — gentle catch: flower petals, final peace (~22s)
 * Built on RetroSaga (js/saga.js). NES-honest palette — flat fills, no gradients.
 * ============================================================================ */
(function () {
  'use strict';
  const clamp = Retro.util.clamp;

  /* ===================== NES-HONEST PALETTE ===================== */
  const C = {
    black:    '#000000',
    nearBk:   '#080808',
    chestnut: '#C84000',
    chestnDk: '#802800',
    bay:      '#601800',
    bayLt:    '#A04020',
    cream:    '#F0E0B8',
    straw:    '#D8B860',
    hay:      '#C09030',
    goldBrt:  '#F8D848',
    gold:     '#D8A000',
    skyBrt:   '#60A8F8',
    sky:      '#3070C0',
    skyDk:    '#103080',
    grassBrt: '#38B830',
    grass:    '#208018',
    grassDk:  '#0C4008',
    nightBg:  '#000028',
    nightMid: '#001040',
    storm:    '#304050',
    stormDk:  '#18202C',
    cobble:   '#686060',
    cobbleDk: '#403C38',
    cobbleLt: '#888078',
    white:    '#F8F8F8',
    grey:     '#A09080',
    greyDk:   '#584840',
    red:      '#D82000',
    redBrt:   '#F84020',
    fenceBr:  '#A07848',
    fenceDk:  '#604828',
    bark:     '#583010',
    floral:   '#F060A8',
    floralDk: '#A02060',
    lilac:    '#C070E8',
    petalYel: '#F8D040',
    teal:     '#00A890',
    lightGrn: '#80D040',
    sunlit:   '#F8F088',
    mud:      '#604828',
    mudDk:    '#401808',
  };

  /* ===================== HORSE DRAW ===================== */
  function drawHorse(api, x, y, frame, col, facingLeft) {
    const c = api.ctx, g = api.gfx;
    const fc = col || C.chestnut;
    const dk = C.chestnDk;
    const dir = facingLeft ? -1 : 1;

    // Gallop leg animation (4-frame cycle)
    const legAnim = [
      [{ox:-10,h:14},{ox:-4,h:10},{ox:4,h:14},{ox:10,h:10}],
      [{ox:-10,h:10},{ox:-4,h:14},{ox:4,h:10},{ox:10,h:14}],
      [{ox:-8, h:14},{ox:0, h:8}, {ox:6,h:14},{ox:12,h:8}],
      [{ox:-12,h:8}, {ox:-2,h:14},{ox:2,h:8}, {ox:8, h:14}],
    ];
    const legs = legAnim[frame % 4];

    // Body
    c.fillStyle = fc;
    c.fillRect(x - 18, y - 10, 36, 14);
    // Rump highlight
    c.fillStyle = dk;
    c.fillRect(x - 18, y - 2, 8, 6);

    // Neck
    c.fillStyle = fc;
    c.fillRect(x + dir * 10, y - 20, dir * 10, 14);

    // Head
    g.circle(x + dir * 20, y - 16, 9, fc);
    // Muzzle
    c.fillStyle = C.cream;
    c.fillRect(x + dir * 24, y - 18, dir * 6, 6);
    // Nostril
    c.fillStyle = dk;
    c.fillRect(x + dir * 27, y - 16, 2, 2);
    // Eye
    c.fillStyle = C.black;
    c.fillRect(x + dir * 19, y - 20, 2, 2);
    // Ear
    c.fillStyle = fc;
    c.fillRect(x + dir * 18, y - 26, 3, 5);

    // Mane
    c.fillStyle = dk;
    for (let m = 0; m < 3; m++) {
      c.fillRect(x + dir * (8 - m * 4), y - 22, 3, 8);
    }

    // Legs
    for (let i = 0; i < 4; i++) {
      const lx = x + legs[i].ox * dir;
      c.fillStyle = fc;
      c.fillRect(lx - 2, y + 4, 4, legs[i].h);
      // Hoof
      c.fillStyle = C.black;
      c.fillRect(lx - 2, y + 4 + legs[i].h - 3, 4, 3);
    }

    // Tail
    c.fillStyle = dk;
    c.fillRect(x - dir * 16, y - 8, dir * -4, 6);
    c.fillRect(x - dir * 18, y - 3, dir * -4, 8);
    c.fillRect(x - dir * 17, y + 4,  dir * -3, 5);
  }

  /* ===================== EMBLEM (horseshoe + rearing Beauty) ===================== */
  function emblem(api, cx, cy) {
    const g = api.gfx, c = api.ctx;
    // Horseshoe
    c.fillStyle = C.gold;
    // Outer arc (approximated with rects)
    for (let a = 0; a <= 180; a += 10) {
      const rad = a * Math.PI / 180;
      const rx = cx + Math.cos(rad) * 22, ry = cy - Math.sin(rad) * 20;
      c.fillRect(rx - 4, ry - 4, 8, 8);
    }
    // Inner arc
    c.fillStyle = C.chestnDk;
    for (let a = 0; a <= 180; a += 10) {
      const rad = a * Math.PI / 180;
      const rx = cx + Math.cos(rad) * 14, ry = cy - Math.sin(rad) * 12;
      c.fillRect(rx - 3, ry - 3, 6, 6);
    }
    // Prongs at bottom
    c.fillStyle = C.gold;
    c.fillRect(cx - 26, cy - 4, 8, 18);
    c.fillRect(cx + 18, cy - 4, 8, 18);
    // Nail holes
    c.fillStyle = C.chestnDk;
    for (let ni = 0; ni < 3; ni++) {
      const rad = (30 + ni * 60) * Math.PI / 180;
      c.fillRect(cx + Math.cos(rad) * 19 - 1, cy - Math.sin(rad) * 17 - 1, 3, 3);
    }
    // Rearing horse silhouette inside
    c.fillStyle = C.chestnut;
    // Body
    c.fillRect(cx - 5, cy - 28, 10, 16);
    // Head (raised up)
    g.circle(cx + 4, cy - 36, 6, C.chestnut);
    // Neck
    c.fillRect(cx + 2, cy - 34, 6, 10);
    // Front legs raised
    c.fillRect(cx - 2, cy - 16, 3, 8);
    c.fillRect(cx + 4,  cy - 18, 3, 10);
    // Rear legs
    c.fillRect(cx - 4, cy - 12, 3, 12);
    c.fillRect(cx + 2, cy - 10, 3, 12);
  }

  /* ===================== SCENERY ===================== */
  function scenery(api, scene, t) {
    const g = api.gfx, c = api.ctx, W = api.W, H = api.H;

    if (scene === 'menu' || scene === 'boot') {
      // Birtwick Park stable yard — warm afternoon light
      // Sky
      c.fillStyle = C.skyBrt; c.fillRect(0, 0, W, H * 0.46);
      // Sun
      c.fillStyle = C.goldBrt; c.fillRect(W - 50, 12, 22, 22);
      c.fillStyle = C.sunlit;  c.fillRect(W - 46, 8, 14, 4);
      c.fillRect(W - 46, 34, 14, 4);
      c.fillRect(W - 56, 18, 4, 14);
      c.fillRect(W - 32, 18, 4, 14);
      // Rolling hills
      c.fillStyle = C.grassBrt;
      c.fillRect(0, H * 0.38, W, H * 0.08);
      // Barn in background
      c.fillStyle = C.fenceBr;
      c.fillRect(16, H * 0.14, 56, 36);
      c.fillStyle = C.chestnDk;
      // Barn roof triangle (use small rects)
      for (let row = 0; row < 8; row++) c.fillRect(16 + row * 2, H * 0.06 + row * 3, 56 - row * 4, 4);
      c.fillStyle = C.bay;
      c.fillRect(32, H * 0.22, 10, 20); // barn door
      c.fillRect(44, H * 0.22, 10, 20);
      // Window
      c.fillStyle = C.goldBrt; c.fillRect(52, H * 0.16, 8, 8);
      // Trees
      c.fillStyle = C.bark;
      c.fillRect(W - 56, H * 0.24, 6, 24);
      c.fillRect(W - 40, H * 0.28, 6, 20);
      c.fillStyle = C.grassDk;
      g.circle(W - 53, H * 0.18, 14, C.grass);
      g.circle(W - 37, H * 0.22, 12, C.grass);
      g.circle(W - 53, H * 0.18, 9, C.grassBrt);
      // Ground / cobblestone yard
      c.fillStyle = C.cobbleDk; c.fillRect(0, H * 0.44, W, H * 0.56);
      c.fillStyle = C.cobble;
      for (let row = 0; row < 8; row++) {
        const yy = H * 0.44 + row * 22;
        const off = row % 2 === 0 ? 0 : 16;
        for (let col = -1; col < 10; col++) c.fillRect(off + col * 32, yy + 2, 28, 18);
      }
      c.fillStyle = C.cobbleLt;
      for (let row = 0; row < 8; row++) {
        const yy = H * 0.44 + row * 22;
        const off = row % 2 === 0 ? 0 : 16;
        for (let col = -1; col < 10; col++) {
          c.fillRect(off + col * 32, yy + 2, 28, 1);
          c.fillRect(off + col * 32, yy + 2, 1, 18);
        }
      }
      // Hay bales
      c.fillStyle = C.hay;
      c.fillRect(14, H * 0.80, 26, 18);
      c.fillRect(W - 40, H * 0.80, 26, 18);
      c.fillStyle = C.straw;
      c.fillRect(14, H * 0.78, 26, 4);
      c.fillRect(W - 40, H * 0.78, 26, 4);
      // Flickering lanterns
      const flk = Math.floor(t * 7) % 2;
      c.fillStyle = C.fenceDk; c.fillRect(4, H * 0.54, 8, 26);
      c.fillStyle = C.goldBrt;  c.fillRect(3, H * 0.48, 10, 10);
      c.fillStyle = flk ? C.gold : C.goldBrt; c.fillRect(5, H * 0.44, 6, 7);
      c.fillStyle = C.fenceDk; c.fillRect(W - 12, H * 0.54, 8, 26);
      c.fillStyle = C.goldBrt;  c.fillRect(W - 13, H * 0.48, 10, 10);
      c.fillStyle = flk ? C.goldBrt : C.gold; c.fillRect(W - 11, H * 0.44, 6, 7);

    } else if (scene === 'birtwick' || scene === 'intro' || scene === 'result') {
      // English countryside, sunny day
      c.fillStyle = C.sky; c.fillRect(0, 0, W, H * 0.55);
      c.fillStyle = C.white;
      // Puffy clouds
      g.circle(50, 40, 14, C.white);  g.circle(70, 34, 18, C.white);  g.circle(90, 40, 14, C.white);
      g.circle(W - 60, 50, 12, C.white); g.circle(W - 42, 44, 16, C.white);
      c.fillStyle = C.grassBrt; c.fillRect(0, H * 0.54, W, H * 0.46);
      c.fillStyle = C.grass;
      for (let fx = 0; fx < W; fx += 18) c.fillRect(fx, H * 0.54, 1, H * 0.46);
      // Rolling hedge rows
      c.fillStyle = C.grassDk;
      c.fillRect(0, H * 0.62, W, 8);
      // Fence
      c.fillStyle = C.fenceBr;
      for (let px = 0; px < W; px += 30) {
        c.fillRect(px, H * 0.58, 4, 24);
      }
      c.fillRect(0, H * 0.60, W, 3);
      c.fillRect(0, H * 0.66, W, 3);
      if (scene === 'intro' || scene === 'result') {
        c.fillStyle = '#0A0C18'; c.fillRect(0, 0, W, H);
        c.fillStyle = '#100E20'; c.fillRect(6, 6, W - 12, H - 12);
      }

    } else if (scene === 'bearingrein') {
      // Manor stable yard, grey overcast
      c.fillStyle = '#304058'; c.fillRect(0, 0, W, H * 0.5);
      c.fillStyle = C.cobbleDk; c.fillRect(0, H * 0.5, W, H * 0.5);
      for (let row = 0; row < 6; row++) {
        const yy = H * 0.5 + row * 22;
        const off = row % 2 === 0 ? 0 : 16;
        for (let col = -1; col < 10; col++) {
          c.fillStyle = row % 2 === 0 ? C.cobble : C.cobbleDk;
          c.fillRect(off + col * 32, yy + 2, 28, 18);
        }
      }
      // Manor wall
      c.fillStyle = '#283040'; c.fillRect(0, H * 0.08, W, H * 0.44);
      c.fillStyle = '#1C2230';
      for (let row = 0; row < 6; row++) {
        const yy = H * 0.08 + row * 22;
        const off = row % 2 === 0 ? 0 : 18;
        for (let col = -1; col < 9; col++) c.fillRect(off + col * 36, yy + 1, 32, 20);
      }

    } else if (scene === 'stormride') {
      // Stormy night — galloping to the doctor
      c.fillStyle = C.stormDk; c.fillRect(0, 0, W, H);
      // Lightning flash
      const lFlash = Math.floor(t * 0.7) % 8 === 0;
      if (lFlash) { c.fillStyle = '#8090B8'; c.fillRect(0, 0, W, H); }
      // Rain streaks
      c.fillStyle = '#3050688';
      for (let r = 0; r < 30; r++) {
        const rx = ((r * 37 + Math.floor(t * 80)) % W);
        const ry = ((r * 53 + Math.floor(t * 120)) % H);
        c.fillStyle = '#405868';
        c.fillRect(rx, ry, 1, 8);
      }
      // Ground
      c.fillStyle = C.grassDk; c.fillRect(0, H * 0.80, W, H * 0.20);
      c.fillStyle = C.mud;
      for (let px = 0; px < W; px += 24) c.fillRect(px, H * 0.82, 16, 3);

    } else if (scene === 'londoncab') {
      // London streets — overcast, cobblestones
      c.fillStyle = '#283040'; c.fillRect(0, 0, W, H * 0.55);
      // Building facades
      c.fillStyle = '#303838';
      c.fillRect(0, H * 0.1, 60, H * 0.46);
      c.fillRect(W - 64, H * 0.12, 64, H * 0.44);
      c.fillRect(72, H * 0.16, 50, H * 0.40);
      c.fillStyle = '#202828';
      // Windows lit warm
      const winFlk = Math.floor(t * 3) % 2;
      c.fillStyle = winFlk ? C.goldBrt : C.gold;
      for (let wx = 8; wx < 56; wx += 14) for (let wy = H * 0.15; wy < H * 0.42; wy += 16) c.fillRect(wx, wy, 8, 10);
      c.fillStyle = winFlk ? C.gold : C.goldBrt;
      for (let wx = W - 60; wx < W - 8; wx += 14) for (let wy = H * 0.17; wy < H * 0.44; wy += 16) c.fillRect(wx, wy, 8, 10);
      // Street
      c.fillStyle = C.cobbleDk; c.fillRect(0, H * 0.55, W, H * 0.45);
      c.fillStyle = C.cobble;
      for (let row = 0; row < 7; row++) {
        const yy = H * 0.55 + row * 18;
        const off = row % 2 === 0 ? 0 : 14;
        for (let col = -1; col < 12; col++) c.fillRect(off + col * 26, yy + 2, 22, 14);
      }
      // Gas lamps
      c.fillStyle = C.fenceDk;
      c.fillRect(W / 2 - 2, H * 0.46, 4, 22);
      c.fillStyle = C.goldBrt; c.fillRect(W / 2 - 6, H * 0.40, 12, 10);
      c.fillStyle = winFlk ? C.gold : C.goldBrt;
      c.fillRect(W / 2 - 3, H * 0.36, 6, 8);

    } else if (scene === 'meadow' || scene === 'finale') {
      // The peaceful final meadow — bright spring day
      c.fillStyle = C.skyBrt; c.fillRect(0, 0, W, H * 0.52);
      // Soft clouds
      g.circle(40, 36, 16, C.white);  g.circle(60, 28, 20, C.white);  g.circle(82, 36, 16, C.white);
      g.circle(W - 50, 44, 14, C.white); g.circle(W - 32, 36, 18, C.white);
      // Sun
      c.fillStyle = C.goldBrt; c.fillRect(W - 44, 14, 22, 22);
      c.fillStyle = C.sunlit;
      c.fillRect(W - 40, 9, 14, 4); c.fillRect(W - 40, 40, 14, 4);
      c.fillRect(W - 50, 20, 4, 10); c.fillRect(W - 26, 20, 4, 10);
      // Meadow
      c.fillStyle = C.grassBrt; c.fillRect(0, H * 0.50, W, H * 0.50);
      // Flowers scattered (deterministic positions)
      const flowers = [[20,H*0.54],[55,H*0.62],[90,H*0.58],[130,H*0.66],[170,H*0.56],
                        [210,H*0.64],[248,H*0.52],[35,H*0.72],[100,H*0.76],[180,H*0.70]];
      for (let fi = 0; fi < flowers.length; fi++) {
        const [fx, fy] = flowers[fi];
        c.fillStyle = fi % 3 === 0 ? C.floral : fi % 3 === 1 ? C.petalYel : C.lilac;
        c.fillRect(fx - 3, fy - 3, 6, 6);
        c.fillStyle = C.goldBrt; c.fillRect(fx - 1, fy - 1, 3, 3);
        c.fillStyle = C.grass; c.fillRect(fx - 1, fy + 3, 2, 6);
      }
      // Rolling far hedgerow
      c.fillStyle = C.grassDk; c.fillRect(0, H * 0.50, W, 6);

    } else {
      // Generic dark panel fallback
      c.fillStyle = '#0A0A0C'; c.fillRect(0, 0, W, H);
    }
  }

  /* ===================== MENU — STABLE STALL DOORS (2+1+2 rhombus) ===================== */
  const STALL_LAYOUT = [
    { x: 8,   y: 108, w: 118, h: 88 }, // Ch 1
    { x: 144, y: 108, w: 118, h: 88 }, // Ch 2
    { x: 76,  y: 212, w: 118, h: 88 }, // Ch 3 (center)
    { x: 8,   y: 316, w: 118, h: 88 }, // Ch 4
    { x: 144, y: 316, w: 118, h: 88 }, // Ch 5
  ];

  const STALL_NAMES = ['BIRTWICK PARK', 'BEARING REIN', 'STORM RIDE', 'LONDON CAB', 'THE MEADOW'];
  const STALL_COLORS = [C.fenceBr, C.chestnDk, C.storm, C.cobbleDk, C.grassBrt];
  const STALL_DOOR_COLORS = [C.fenceDk, C.bay, C.stormDk, C.cobble, C.grass];

  function drawMenuHeader(api, respectVal) {
    const c = api.ctx, W = api.W;
    // Warm barn-wood header panel
    c.fillStyle = C.chestnDk; c.fillRect(0, 0, W, 104);
    c.fillStyle = C.hay;       c.fillRect(0, 0, W, 3);
    c.fillStyle = C.fenceDk;   c.fillRect(0, 100, W, 4);
    // Wood grain lines
    c.fillStyle = C.bay;
    for (let wy = 10; wy < 100; wy += 18) c.fillRect(0, wy, W, 2);
    // Corner nail heads
    for (const nx of [8, W - 8]) {
      for (const ny of [10, 88]) {
        c.fillStyle = C.gold; c.fillRect(nx - 3, ny - 3, 6, 6);
        c.fillStyle = C.goldBrt; c.fillRect(nx - 1, ny - 1, 3, 3);
      }
    }
    // Horseshoe emblem (small)
    c.fillStyle = C.gold;
    for (let a = 0; a <= 180; a += 15) {
      const rad = a * Math.PI / 180;
      c.fillRect(W / 2 + Math.cos(rad) * 14 - 2, 18 - Math.sin(rad) * 12 - 2, 5, 5);
    }
    c.fillStyle = C.gold;
    c.fillRect(W / 2 - 18, 15, 5, 12);
    c.fillRect(W / 2 + 13, 15, 5, 12);
    // Title
    api.txtCFit('BLACK BEAUTY', W / 2, 34, 12, C.goldBrt, true);
    api.txtC('ANNA SEWELL  1877', W / 2, 52, 7, C.cream, false);
    api.txtC('PRIDE  ' + respectVal, W / 2, 66, 8, C.gold, false);
    api.txtC('CHOOSE YOUR STABLE', W / 2, 82, 7, C.straw, false);
    // Rope connectors between stalls (ch1→ch3, ch2→ch3, ch3→ch4, ch3→ch5)
    const pairs = [[0, 2], [1, 2], [2, 3], [2, 4]];
    for (const [ai, bi] of pairs) {
      const ra = STALL_LAYOUT[ai], rb = STALL_LAYOUT[bi];
      const ax = ra.x + ra.w / 2, ay = ra.y + ra.h / 2;
      const bx = rb.x + rb.w / 2, by = rb.y + rb.h / 2;
      const dx = bx - ax, dy = by - ay, len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len, ny = dy / len;
      for (let d = 38; d < len - 38; d += 8) {
        const even = Math.floor(d / 8) % 2 === 0;
        c.fillStyle = even ? C.fenceBr : C.hay;
        c.fillRect(ax + nx * d - 1, ay + ny * d - 1, even ? 4 : 3, even ? 4 : 3);
      }
    }
  }

  function drawStallCard(api, info) {
    const { ch, i, x, y, w, h, sel, done } = info;
    const c = api.ctx, g = api.gfx;
    const cx = x + w / 2, cy = y + h / 2;
    const t = api.t;
    const frameColor = STALL_COLORS[i] || C.fenceBr;
    const doorColor  = STALL_DOOR_COLORS[i] || C.fenceDk;

    // Wood frame outer
    c.fillStyle = frameColor;
    c.fillRect(x, y, w, h);
    // Wood grain
    c.fillStyle = doorColor;
    for (let gy = y + 6; gy < y + h - 4; gy += 10) c.fillRect(x + 3, gy, w - 6, 2);
    // Door border (darker)
    c.fillStyle = C.black;
    c.fillRect(x, y, w, 3);
    c.fillRect(x, y + h - 3, w, 3);
    c.fillRect(x, y, 3, h);
    c.fillRect(x + w - 3, y, 3, h);
    // Inner door frame
    c.fillStyle = doorColor;
    c.fillRect(x + 6, y + 6, w - 12, h - 12);
    // Dutch door split line
    c.fillStyle = C.black;
    c.fillRect(x + 3, y + Math.floor(h * 0.48), w - 6, 3);
    // Door latch bolt
    c.fillStyle = C.gold;
    c.fillRect(cx - 3, y + Math.floor(h * 0.44), 6, 8);

    // Selection glow border
    if (sel) {
      const pulse = Math.floor(t * 4) % 2;
      c.fillStyle = pulse ? C.goldBrt : C.gold;
      c.fillRect(x, y, w, 3);
      c.fillRect(x, y + h - 3, w, 3);
      c.fillRect(x, y, 3, h);
      c.fillRect(x + w - 3, y, 3, h);
    }

    // Nameplate at top of door
    c.fillStyle = sel ? C.goldBrt : C.hay;
    c.fillRect(x + 8, y + 8, w - 16, 16);
    c.fillStyle = C.black;
    c.fillRect(x + 8, y + 8, w - 16, 1);
    c.fillRect(x + 8, y + 23, w - 16, 1);
    api.txtCFit(STALL_NAMES[i], cx, y + 10, 6, sel ? C.chestnDk : C.chestnDk, true, w - 18);

    // Chapter icon (in upper half of door interior)
    if (ch.icon) ch.icon(api, cx, y + Math.floor(h * 0.35));

    // Chapter name (lower half)
    api.txtCFit(ch.name || '', cx, y + Math.floor(h * 0.62), 6, sel ? C.goldBrt : C.cream, true, w - 14);
    if (ch.sub) api.txtCFit(ch.sub, cx, y + Math.floor(h * 0.74), 5, sel ? C.straw : C.greyDk, true, w - 14);

    // Done checkmark as horseshoe nail
    if (done) {
      g.circle(x + w - 14, y + 14, 9, C.gold);
      g.circle(x + w - 14, y + 14, 6, C.hay);
      api.txtC('✓', x + w - 14, y + 8, 8, C.chestnDk, false);
    }
  }

  /* ===================== CHAPTER 1: BIRTWICK PARK =====================
   * Horizontal runner. Beauty auto-gallops right; obstacles scroll in from the right.
   * Tap UP / up-arrow to jump over fences; low fences and high fences.
   * Rosettes (gold stars) appear to collect. Win: collect 5 rosettes or survive 24s. Lose: 3 stumbles.
   * Pacing: obstacles every 2-3s; rosettes every 4s. Total ~22-28s.
   */
  const chBirtwick = {
    id: 'birtwick',
    name: 'BIRTWICK PARK',
    sub: 'Gallop the open fields',
    intro: [
      'At Squire Gordon\'s',
      'estate, Black Beauty',
      'gallops free across',
      'the Birtwick meadows.',
      '',
      'Jump fences to earn',
      'your rosettes.',
      '3 stumbles = done!',
    ],
    quote: '"I was well-born and well-bred." — Black Beauty',
    help: 'TAP UP or press UP ARROW to jump fences. Low fences = small jump. Tall post = hold longer! Collect gold ROSETTES for points. 3 stumbles = chapter over.',
    winText: 'Five rosettes won — Beauty gallops home!',
    loseText: 'Beauty stumbles and must rest...',
    icon(api, x, y) {
      const c = api.ctx, g = api.gfx;
      // Rosette / ribbon
      g.circle(x, y, 10, C.redBrt);
      g.circle(x, y, 6,  C.gold);
      c.fillStyle = C.goldBrt; c.fillRect(x - 1, y - 1, 3, 3);
      // Ribbons
      c.fillStyle = C.redBrt;
      c.fillRect(x - 4, y + 6, 4, 10);
      c.fillRect(x + 1, y + 6, 4, 10);
    },
    _obstacles: [],
    _rosettes: [],
    _nextObs: 0,
    _nextRos: 0,
    init(api) {
      const W = api.W, H = api.H;
      this.bx = W * 0.28;
      this.by = H * 0.72;
      this.vy = 0;
      this.onGround = true;
      this.lives = 3;
      this.rosettes = 0;
      this.runT = 0;
      this.frame = 0;
      this.frameT = 0;
      this.iframes = 0;
      this._obstacles = [];
      this._rosettes = [];
      this._nextObs = 1.5;
      this._nextRos = 3.0;
      this.groundY = H * 0.72;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      this.iframes = Math.max(0, this.iframes - dt);
      this.frameT += dt;
      if (this.frameT > 0.12) { this.frame++; this.frameT = 0; }

      // Jump input
      const jumpPressed = api.keyPressed('up') || api.keyDown('up') || api.pointer.justDown;
      if (this.onGround && jumpPressed) {
        this.vy = -420;
        this.onGround = false;
        api.audio.sfx('jump');
      }

      // Gravity
      this.vy += 900 * dt;
      this.by += this.vy * dt;
      if (this.by >= this.groundY) {
        this.by = this.groundY;
        this.vy = 0;
        this.onGround = true;
      }

      // Spawn obstacles
      this._nextObs -= dt;
      if (this._nextObs <= 0) {
        const tall = Math.random() < 0.35;
        this._obstacles.push({ x: W + 20, tall, w: 14, h: tall ? 40 : 22 });
        this._nextObs = 1.8 + Math.random() * 1.2;
      }

      // Spawn rosettes
      this._nextRos -= dt;
      if (this._nextRos <= 0 && this.rosettes < 5) {
        this._rosettes.push({ x: W + 20, y: H * 0.52, collected: false });
        this._nextRos = 3.5 + Math.random() * 1.5;
      }

      const speed = 160 + this.runT * 4;

      // Move obstacles
      for (const obs of this._obstacles) obs.x -= speed * dt;
      this._obstacles = this._obstacles.filter(o => o.x > -40);

      // Move rosettes
      for (const ros of this._rosettes) ros.x -= speed * dt;
      this._rosettes = this._rosettes.filter(r => r.x > -20);

      // Collision with obstacles
      if (this.iframes <= 0) {
        for (const obs of this._obstacles) {
          const obsBottom = H * 0.74;
          const obsTop = obsBottom - obs.h;
          if (Math.abs(obs.x - this.bx) < 20 && this.by > obsTop + 4) {
            this.lives--;
            this.iframes = 1.5;
            api.audio.sfx('hurt');
            api.shake(5, 0.3);
            api.flash('#FF4020', 0.2);
            if (this.lives <= 0) { api.lose(); return; }
          }
        }
      }

      // Collect rosettes
      for (const ros of this._rosettes) {
        if (!ros.collected && Math.abs(ros.x - this.bx) < 24 && Math.abs(ros.y - this.by) < 30) {
          ros.collected = true;
          this.rosettes++;
          api.addScore(200);
          api.audio.sfx('coin');
          api.burst(ros.x, ros.y, C.goldBrt, 10);
          if (this.rosettes >= 5) { api.addScore(500); api.win(); return; }
        }
      }
    },
    draw(api) {
      const c = api.ctx, g = api.gfx, W = api.W, H = api.H;
      // Sky + ground
      c.fillStyle = C.sky; c.fillRect(0, 0, W, H * 0.56);
      c.fillStyle = C.white;
      g.circle(60, 36, 16, C.white); g.circle(80, 28, 20, C.white); g.circle(100, 36, 16, C.white);
      c.fillStyle = C.grassBrt; c.fillRect(0, H * 0.56, W, H * 0.44);
      c.fillStyle = C.grassDk;  c.fillRect(0, H * 0.74, W, H * 0.26);
      // Ground line
      c.fillStyle = C.grass; c.fillRect(0, H * 0.72, W, 3);

      // Fence posts (background decoration)
      c.fillStyle = C.fenceBr;
      for (let fp = (Math.floor(this.runT * 60) % 30); fp < W; fp += 30) {
        c.fillRect(fp, H * 0.56, 4, 22);
      }
      c.fillRect(0, H * 0.60, W, 3);
      c.fillRect(0, H * 0.66, W, 3);

      // Rosettes
      for (const ros of this._rosettes) {
        if (!ros.collected) {
          c.fillStyle = C.redBrt; g.circle(ros.x, ros.y, 8, C.redBrt);
          c.fillStyle = C.gold;   g.circle(ros.x, ros.y, 5, C.gold);
          c.fillStyle = C.goldBrt; c.fillRect(ros.x - 1, ros.y - 1, 3, 3);
        }
      }

      // Obstacles
      const groundBase = H * 0.74;
      for (const obs of this._obstacles) {
        c.fillStyle = C.fenceBr;
        c.fillRect(obs.x - 6, groundBase - obs.h, 12, obs.h);
        // Top rail
        c.fillStyle = C.fenceDk;
        c.fillRect(obs.x - 10, groundBase - obs.h - 4, 20, 6);
        if (obs.tall) {
          c.fillRect(obs.x - 10, groundBase - obs.h / 2 - 2, 20, 4);
        }
        // Hazard stripe on tall fences
        if (obs.tall) {
          c.fillStyle = C.redBrt;
          c.fillRect(obs.x - 8, groundBase - obs.h + 4, 5, obs.h - 10);
        }
      }

      // Beauty
      const iblk = this.iframes > 0 && Math.floor(this.iframes * 8) % 2 === 0;
      if (!iblk) drawHorse(api, this.bx, this.by, this.frame, C.chestnut, false);

      // HUD
      api.topBar('BIRTWICK  ROSETTES ' + this.rosettes + '/5');
      for (let li = 0; li < 3; li++) {
        c.fillStyle = li < this.lives ? C.redBrt : C.greyDk;
        c.fillRect(W - 14 - li * 14, 3, 10, 10);
      }
      api.addScore(1);
    },
  };

  /* ===================== CHAPTER 2: THE BEARING REIN =====================
   * Left-right to position under falling apples. Freeze (don't move) when
   * the groom sweeps his WATCH over the yard. 8 apples to win. 3 rein-pulls = lose.
   * Pacing: apple every ~2.5s; groom watch every ~6s. Total ~22-28s.
   */
  const chBearingRein = {
    id: 'bearingrein',
    name: 'THE BEARING REIN',
    sub: "Lady Anne's stable yard",
    intro: [
      'Lady Anne forces a',
      'cruel bearing rein on',
      'Black Beauty — the',
      'head yanked high,',
      'neck strained.',
      '',
      'Catch fallen apples.',
      'FREEZE when the groom',
      'is watching!',
    ],
    quote: '"I was no longer allowed to hold my head naturally." — Black Beauty',
    help: 'LEFT/RIGHT to move under apples and catch them. When the GROOM watches (ORANGE WARNING), FREEZE — do NOT move! Moving while watched = rein yanked. 3 yanks = chapter over. Catch 8 apples to win.',
    winText: 'Eight apples secretly eaten — small comfort!',
    loseText: 'The bearing rein pulls tight — Beauty cannot bear it.',
    icon(api, x, y) {
      const c = api.ctx, g = api.gfx;
      // Apple
      g.circle(x, y - 2, 9, C.redBrt);
      g.circle(x, y - 4, 6, C.red);
      c.fillStyle = C.bark; c.fillRect(x - 1, y - 12, 2, 6); // stem
      c.fillStyle = C.grass; c.fillRect(x + 1, y - 13, 7, 3); // leaf
      // Rein (horizontal line above)
      c.fillStyle = C.fenceBr;
      c.fillRect(x - 14, y - 22, 28, 3);
    },
    _apples: [],
    _groomWatch: false,
    _watchTimer: 0,
    _nextWatch: 0,
    _nextApple: 0,
    init(api) {
      const W = api.W;
      this.bx = W / 2;
      this.lives = 3;
      this.caught = 0;
      this.runT = 0;
      this.frame = 0;
      this.frameT = 0;
      this._apples = [];
      this._groomWatch = false;
      this._watchTimer = 0;
      this._nextWatch = 5.0;
      this._nextApple = 1.5;
      this._wasMoving = false;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      this.frameT += dt;
      if (this.frameT > 0.15) { this.frame++; this.frameT = 0; }

      const groundY = H * 0.72;
      const spd = 140;

      // Check player movement
      let moving = false;
      if (api.keyDown('left'))  { this.bx -= spd * dt; moving = true; }
      if (api.keyDown('right')) { this.bx += spd * dt; moving = true; }
      if (api.pointer.down) {
        const dx = api.pointer.x - this.bx;
        if (Math.abs(dx) > 10) { this.bx += Math.sign(dx) * spd * dt; moving = true; }
      }
      this.bx = clamp(this.bx, 20, W - 20);

      // Groom watch event
      this._nextWatch -= dt;
      if (this._nextWatch <= 0 && !this._groomWatch) {
        this._groomWatch = true;
        this._watchTimer = 2.5;
        this._nextWatch = 5.0 + Math.random() * 3;
        api.flash('#F08030', 0.1);
        api.audio.sfx('blip');
      }
      if (this._groomWatch) {
        this._watchTimer -= dt;
        if (this._watchTimer <= 0) this._groomWatch = false;
        // Penalize for moving while watched
        if (moving && !this._wasMoving) {
          this.lives--;
          api.audio.sfx('hurt');
          api.shake(6, 0.3);
          api.flash('#FF2000', 0.25);
          if (this.lives <= 0) { api.lose(); return; }
        }
      }
      this._wasMoving = moving;

      // Spawn apples
      this._nextApple -= dt;
      if (this._nextApple <= 0) {
        this._apples.push({
          x: 20 + Math.random() * (W - 40),
          y: 0,
          vy: 90 + Math.random() * 60,
        });
        this._nextApple = 1.8 + Math.random() * 1.2;
      }

      // Move apples
      for (const ap of this._apples) ap.y += ap.vy * dt;
      this._apples = this._apples.filter(a => a.y < H + 10);

      // Catch apples
      for (const ap of this._apples) {
        if (ap.y > groundY - 20 && Math.abs(ap.x - this.bx) < 28) {
          this._apples = this._apples.filter(a => a !== ap);
          this.caught++;
          api.addScore(150);
          api.audio.sfx('coin');
          api.burst(ap.x, groundY, C.redBrt, 6);
          if (this.caught >= 8) { api.addScore(400); api.win(); return; }
        }
      }
    },
    draw(api) {
      const c = api.ctx, g = api.gfx, W = api.W, H = api.H;
      const groundY = H * 0.72;
      // Background — overcast manor yard
      c.fillStyle = '#304058'; c.fillRect(0, 0, W, groundY - 20);
      c.fillStyle = '#283040';
      for (let wy = 24; wy < groundY - 20; wy += 20) c.fillRect(0, wy, W, 1);
      // Apple tree source at top
      g.circle(W / 2, 12, 20, C.grass);
      g.circle(W / 2, 12, 14, C.grassBrt);
      c.fillStyle = C.bark; c.fillRect(W / 2 - 3, 28, 6, 16);
      // Ground
      c.fillStyle = C.cobbleDk; c.fillRect(0, groundY - 20, W, H - groundY + 20);
      c.fillStyle = C.cobble;
      for (let cx = 0; cx < W; cx += 28) c.fillRect(cx, groundY - 18, 24, 14);

      // Groom watcher (right side)
      const gx = W - 28;
      const gy = groundY - 36;
      c.fillStyle = C.chestnDk;
      c.fillRect(gx - 8, gy, 16, 26); // body
      g.circle(gx, gy - 8, 10, C.cream); // head
      // Groom watch cone
      if (this._groomWatch) {
        c.fillStyle = '#F08030';
        // Watch sweep triangle
        c.fillRect(gx - 30, gy - 4, 32, 6);
        // Warning text
        api.txtC('GROOM WATCHES!', W / 2, groundY - 60, 8, C.goldBrt, false);
        const pulse = Math.floor(this._watchTimer * 8) % 2;
        if (pulse) {
          c.fillStyle = '#F08030';
          c.fillRect(0, groundY - 72, W, 3);
          c.fillRect(0, groundY - 50, W, 3);
        }
      }

      // Apples
      for (const ap of this._apples) {
        g.circle(ap.x, ap.y, 7, C.redBrt);
        g.circle(ap.x, ap.y - 1, 4, C.red);
        c.fillStyle = C.bark; c.fillRect(ap.x - 1, ap.y - 9, 2, 4);
      }

      // Beauty (bearing rein keeps head up — draw slightly stiff)
      drawHorse(api, this.bx, groundY, this.frame, C.chestnut, false);
      // Bearing rein indicator (red line from bit to back)
      c.fillStyle = C.redBrt;
      c.fillRect(this.bx - 6, groundY - 24, 18, 2);

      // HUD
      api.topBar('BEARING REIN  APPLES ' + this.caught + '/8');
      for (let li = 0; li < 3; li++) {
        c.fillStyle = li < this.lives ? C.redBrt : C.greyDk;
        c.fillRect(W - 14 - li * 14, 3, 10, 10);
      }
      api.addScore(1);
    },
  };

  /* ===================== CHAPTER 3: STORM RIDE =====================
   * Vertical scroller. Beauty gallops upward; player steers left/right.
   * Storm obstacles scroll down: fallen logs, deep puddles, lightning forks.
   * Must cover 1200m. Speed ~68m/s. Baseline ~18s. Obstacles add ~4-6s.
   * Win: cover 1200m. Lose: 3 stumbles.
   */
  const chStorm = {
    id: 'stormride',
    name: 'STORM RIDE',
    sub: 'Race to the doctor!',
    intro: [
      'Midnight. The squire\'s',
      'wife is gravely ill.',
      'Groom John rides Black',
      'Beauty through the',
      'raging storm to fetch',
      'the doctor.',
      '',
      'Left/right to steer.',
      'Reach the town!',
    ],
    quote: '"Beauty did his best, and we got through safe." — John Manly',
    help: 'Steer LEFT/RIGHT (drag or arrow keys) to dodge fallen trees, puddles and lightning strikes. Reach 1200m through the storm. 3 stumbles = chapter over.',
    winText: 'Through the storm! The doctor is reached in time.',
    loseText: 'Beauty stumbles in the dark — try the night road again.',
    icon(api, x, y) {
      const c = api.ctx, g = api.gfx;
      // Lightning bolt
      c.fillStyle = C.goldBrt;
      c.fillRect(x - 1, y - 14, 6, 8);
      c.fillRect(x - 5, y - 6,  6, 8);
      c.fillRect(x - 1, y + 2,  6, 8);
      // Rain
      c.fillStyle = C.sky;
      for (let ri = 0; ri < 4; ri++) c.fillRect(x - 12 + ri * 8, y - 12 + ri * 4, 2, 7);
    },
    _obstacles: [],
    _nextObs: 0,
    init(api) {
      const W = api.W;
      this.bx = W / 2;
      this.lives = 3;
      this.dist = 0;
      this.runT = 0;
      this.frame = 0;
      this.frameT = 0;
      this.iframes = 0;
      this._obstacles = [];
      this._nextObs = 2.0;
      this._lightningT = 0;
      this._rainOffset = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      this.iframes = Math.max(0, this.iframes - dt);
      this.frameT += dt;
      if (this.frameT > 0.10) { this.frame++; this.frameT = 0; }
      this._rainOffset = (this._rainOffset + dt * 120) % H;
      this._lightningT += dt;

      const spd = 68 + this.runT * 1.5; // units/s
      this.dist += spd * dt;

      // Steer
      const steerSpd = 160;
      if (api.keyDown('left'))  this.bx -= steerSpd * dt;
      if (api.keyDown('right')) this.bx += steerSpd * dt;
      if (api.pointer.down) {
        const dx = api.pointer.x - this.bx;
        if (Math.abs(dx) > 10) this.bx += Math.sign(dx) * steerSpd * dt;
      }
      this.bx = clamp(this.bx, 22, W - 22);

      // Spawn obstacles
      this._nextObs -= dt;
      if (this._nextObs <= 0) {
        const type = Math.random() < 0.4 ? 'log' : Math.random() < 0.5 ? 'puddle' : 'lightning';
        const side = Math.random() < 0.5 ? 'left' : Math.random() < 0.5 ? 'center' : 'right';
        const ox = side === 'left' ? 40 + Math.random() * 60
                 : side === 'right' ? W - 100 + Math.random() * 60
                 : W * 0.3 + Math.random() * W * 0.4;
        this._obstacles.push({ x: ox, y: -30, type, w: type === 'log' ? 70 : type === 'puddle' ? 50 : 16, h: type === 'log' ? 14 : type === 'puddle' ? 10 : 50 });
        this._nextObs = 1.4 + Math.random() * 1.0;
      }

      // Move obstacles down
      const obsSpd = 200;
      for (const obs of this._obstacles) obs.y += obsSpd * dt;
      this._obstacles = this._obstacles.filter(o => o.y < H + 40);

      // Collision
      if (this.iframes <= 0) {
        for (const obs of this._obstacles) {
          const hit = Math.abs(obs.x - this.bx) < (obs.w / 2 + 14) && Math.abs(obs.y - H * 0.68) < 20;
          if (hit) {
            this.lives--;
            this.iframes = 1.2;
            api.audio.sfx('hurt');
            api.shake(6, 0.3);
            api.flash('#4060A0', 0.2);
            if (this.lives <= 0) { api.lose(); return; }
          }
        }
      }

      if (this.dist >= 1200) { api.addScore(600); api.win(); }
    },
    draw(api) {
      const c = api.ctx, g = api.gfx, W = api.W, H = api.H;
      // Storm night sky
      const lFlash = this._lightningT % 6 < 0.08;
      c.fillStyle = lFlash ? '#60708A' : C.stormDk;
      c.fillRect(0, 0, W, H);
      // Rain (scrolling diagonal streaks)
      c.fillStyle = '#3C4C5C';
      for (let ri = 0; ri < 32; ri++) {
        const rx = (ri * 41 + Math.floor(this._rainOffset * 0.4)) % W;
        const ry = (ri * 67 + this._rainOffset) % H;
        c.fillRect(rx, ry, 1, 9);
      }
      // Lightning fork
      if (lFlash) {
        c.fillStyle = C.goldBrt;
        const lx = W * 0.6;
        c.fillRect(lx, 0, 3, H * 0.3);
        c.fillRect(lx - 8, H * 0.18, 12, 3);
        c.fillRect(lx + 3, H * 0.26, 10, 3);
      }
      // Road lanes
      c.fillStyle = '#283038'; c.fillRect(30, 0, W - 60, H);
      c.fillStyle = '#1E2830'; c.fillRect(30, 0, 4, H);
      c.fillStyle = '#1E2830'; c.fillRect(W - 34, 0, 4, H);
      // Centre lane dashes
      c.fillStyle = '#3C4C5A';
      const dashOff = Math.floor(this._rainOffset * 1.5) % 32;
      for (let dy = -dashOff; dy < H; dy += 32) c.fillRect(W / 2 - 2, dy, 4, 18);
      // Mud splashes
      c.fillStyle = C.mud;
      for (let mi = 0; mi < 5; mi++) c.fillRect(40 + mi * 40, H * 0.86 + mi * 3, 24, 4);
      // Trees on sides (scrolling)
      c.fillStyle = C.bark;
      for (let ti = 0; ti < 4; ti++) {
        const tx = 14 + ti * 10;
        const ty = (ti * 110 + Math.floor(this._rainOffset)) % H;
        c.fillRect(tx, ty, 6, 24);
        g.circle(tx + 3, ty - 8, 10, C.grassDk);
      }
      for (let ti = 0; ti < 4; ti++) {
        const tx = W - 20 + ti * 10;
        const ty = (ti * 97 + Math.floor(this._rainOffset) + 50) % H;
        c.fillRect(tx - W + 14, ty, 6, 24);
        g.circle(tx - W + 17, ty - 8, 10, C.grassDk);
      }

      // Obstacles
      for (const obs of this._obstacles) {
        if (obs.type === 'log') {
          c.fillStyle = C.bark;
          c.fillRect(obs.x - obs.w / 2, obs.y - 6, obs.w, 12);
          c.fillStyle = C.fenceDk;
          c.fillRect(obs.x - obs.w / 2, obs.y - 3, obs.w, 2);
        } else if (obs.type === 'puddle') {
          c.fillStyle = C.nightMid;
          c.fillRect(obs.x - obs.w / 2, obs.y - 5, obs.w, 10);
          c.fillStyle = C.sky;
          c.fillRect(obs.x - obs.w / 2 + 4, obs.y - 3, obs.w - 8, 4);
        } else {
          // Lightning strike on road
          c.fillStyle = C.goldBrt;
          c.fillRect(obs.x - 3, obs.y - obs.h, 6, obs.h);
          c.fillRect(obs.x - 10, obs.y - obs.h / 2, 10, 3);
          c.fillRect(obs.x + 3, obs.y - obs.h * 0.4, 8, 3);
        }
      }

      // Beauty (running upward, centered)
      const bx = this.bx, by = H * 0.68;
      const iblk = this.iframes > 0 && Math.floor(this.iframes * 8) % 2 === 0;
      if (!iblk) {
        // Draw facing up (simplified: use side horse, slightly adjusted)
        c.fillStyle = C.chestnut;
        c.fillRect(bx - 10, by - 28, 20, 32); // body
        g.circle(bx, by - 32, 10, C.chestnut); // head
        c.fillStyle = C.chestnDk;
        // Gallop legs
        const lf = this.frame % 4;
        const lOff = [[-8, 8], [8, 8], [-6, 6], [6, 6]][lf];
        c.fillRect(bx + lOff[0], by + 4, 5, 12);
        c.fillRect(bx + lOff[1], by + 4, 5, 12);
        c.fillStyle = C.black;
        c.fillRect(bx + lOff[0], by + 14, 5, 4);
        c.fillRect(bx + lOff[1], by + 14, 5, 4);
        // Rider silhouette
        c.fillStyle = C.greyDk;
        c.fillRect(bx - 8, by - 44, 16, 18);
        g.circle(bx, by - 50, 8, C.greyDk);
      }

      // Progress bar
      const prog = Math.min(this.dist / 1200, 1);
      c.fillStyle = C.greyDk; c.fillRect(4, H - 18, W - 8, 8);
      c.fillStyle = C.gold;   c.fillRect(4, H - 18, (W - 8) * prog, 8);
      c.fillStyle = C.goldBrt; c.fillRect(4 + (W - 8) * prog - 3, H - 22, 6, 14);
      api.txtC('DOCTOR: ' + Math.floor(prog * 100) + '%', W / 2, H - 32, 7, C.cream, false);

      api.topBar('STORM RIDE  ' + Math.floor(this.dist) + 'm / 1200m');
      for (let li = 0; li < 3; li++) {
        c.fillStyle = li < this.lives ? C.redBrt : C.greyDk;
        c.fillRect(W - 14 - li * 14, 3, 10, 10);
      }
      api.addScore(1);
    },
  };

  /* ===================== CHAPTER 4: LONDON CAB =====================
   * Rhythm timing: a pendulum swings; tap in the gold zone to keep stamina up.
   * Potholes appear and drain stamina on impact (dodge left/right).
   * Win: survive 25s. Lose: stamina hits 0.
   * Pacing: ~24-28s with occasional misses.
   */
  const chLondon = {
    id: 'londoncab',
    name: 'LONDON CAB',
    sub: 'Haul the cab up Ludgate Hill',
    intro: [
      'The cab-stand years.',
      'Black Beauty hauls',
      'heavy loads through',
      'London\'s streets.',
      '',
      'Keep the PACE BAR full',
      'by tapping in the',
      'GOLD ZONE!',
      'Dodge potholes too.',
    ],
    quote: '"I had to work very hard and was often weary." — Black Beauty',
    help: 'TAP A / SPACE (or tap screen) when the needle is in the GOLD ZONE to refill the pace bar. LEFT/RIGHT to dodge potholes in the road. Pace bar empty = chapter over. Survive 25s.',
    winText: 'Up Ludgate Hill and home — a hard-won day!',
    loseText: 'Beauty is exhausted. She cannot pull any more.',
    icon(api, x, y) {
      const c = api.ctx, g = api.gfx;
      // Cab wheel
      g.circle(x, y, 12, C.cobble);
      g.circle(x, y, 8,  C.cobbleDk);
      // Spokes
      c.fillStyle = C.cobbleLt;
      c.fillRect(x - 12, y - 1, 24, 3);
      c.fillRect(x - 1, y - 12, 3, 24);
      c.fillRect(x - 9, y - 9, 3, 3);
      c.fillRect(x + 6, y + 6, 3, 3);
      g.circle(x, y, 3, C.gold);
    },
    _potholes: [],
    _nextPothole: 0,
    init(api) {
      const W = api.W;
      this.bx = W / 2;
      this.stamina = 0.75;
      this.needle = 0;
      this.needleDir = 1;
      this.needleSpd = 0.6;
      this.hitFeedback = 0;
      this.runT = 0;
      this.frame = 0;
      this.frameT = 0;
      this._potholes = [];
      this._nextPothole = 3.0;
      this.iframes = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      this.iframes = Math.max(0, this.iframes - dt);
      this.frameT += dt;
      if (this.frameT > 0.14) { this.frame++; this.frameT = 0; }
      this.hitFeedback = Math.max(0, this.hitFeedback - dt * 4);

      // Pendulum
      this.needle += this.needleDir * this.needleSpd * dt;
      if (this.needle >= 1) { this.needle = 1; this.needleDir = -1; }
      if (this.needle <= 0) { this.needle = 0; this.needleDir = 1; }

      // Stamina drains (per-SECOND). The old `* dt * 60` drained per-frame and
      // emptied the 0.75 start in ~0.5s — an instant loss before you could tap.
      this.stamina -= 0.045 * dt;

      // Tap in gold zone (0.38–0.62)
      const inGold = this.needle >= 0.38 && this.needle <= 0.62;
      const tapped = api.keyPressed('a') || api.keyPressed('start') || api.pointer.justDown;
      if (tapped) {
        if (inGold) {
          this.stamina = Math.min(1, this.stamina + 0.18);
          api.addScore(80);
          api.audio.sfx('coin');
          this.hitFeedback = 0.4;
        } else {
          this.stamina = Math.max(0, this.stamina - 0.06);
          api.audio.sfx('hurt');
          this.hitFeedback = -0.4;
        }
      }

      // Steer
      const spd = 130;
      if (api.keyDown('left'))  this.bx -= spd * dt;
      if (api.keyDown('right')) this.bx += spd * dt;
      if (api.pointer.down && !tapped) {
        const dx = api.pointer.x - this.bx;
        if (Math.abs(dx) > 12) this.bx += Math.sign(dx) * spd * dt;
      }
      this.bx = clamp(this.bx, 24, W - 24);

      // Potholes
      this._nextPothole -= dt;
      if (this._nextPothole <= 0) {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        this._potholes.push({
          x: side === 'left' ? 30 + Math.random() * 80 : W - 110 + Math.random() * 80,
          y: -20,
          w: 26, h: 12,
        });
        this._nextPothole = 2.2 + Math.random() * 1.4;
      }
      for (const ph of this._potholes) ph.y += 170 * dt;
      this._potholes = this._potholes.filter(p => p.y < H + 20);

      if (this.iframes <= 0) {
        for (const ph of this._potholes) {
          const groundY = H * 0.72;
          if (Math.abs(ph.x - this.bx) < ph.w / 2 + 16 && Math.abs(ph.y - groundY) < 18) {
            this.stamina = Math.max(0, this.stamina - 0.14);
            this.iframes = 0.8;
            api.audio.sfx('hurt');
            api.shake(4, 0.2);
          }
        }
      }

      if (this.stamina <= 0) { this.stamina = 0; api.lose(); return; }
      if (this.runT >= 25) { api.addScore(500); api.win(); }
    },
    draw(api) {
      const c = api.ctx, g = api.gfx, W = api.W, H = api.H;
      const groundY = H * 0.72;
      // London street scene
      c.fillStyle = '#283040'; c.fillRect(0, 0, W, H * 0.55);
      c.fillStyle = '#303838';
      c.fillRect(0, H * 0.08, 60, H * 0.48);
      c.fillRect(W - 64, H * 0.1, 64, H * 0.46);
      c.fillStyle = C.goldBrt;
      for (let wx = 8; wx < 52; wx += 14) for (let wy = H * 0.13; wy < H * 0.46; wy += 16) c.fillRect(wx, wy, 9, 11);
      for (let wx = W - 58; wx < W - 8; wx += 14) for (let wy = H * 0.14; wy < H * 0.46; wy += 16) c.fillRect(wx, wy, 9, 11);
      c.fillStyle = C.cobbleDk; c.fillRect(0, groundY - 20, W, H - groundY + 20);
      c.fillStyle = C.cobble;
      for (let row = 0; row < 7; row++) {
        const yy = groundY - 20 + row * 18;
        const off = row % 2 === 0 ? 0 : 13;
        for (let cx = -1; cx < 12; cx++) c.fillRect(off + cx * 26, yy + 2, 22, 14);
      }

      // Potholes
      for (const ph of this._potholes) {
        c.fillStyle = C.cobbleDk;
        g.circle(ph.x, ph.y, ph.w / 2, '#1A1410');
        c.fillStyle = '#0A0C0E';
        g.circle(ph.x, ph.y, ph.w / 2 - 4, '#0A0C0E');
      }

      // Cab behind Beauty
      c.fillStyle = C.chestnDk;
      c.fillRect(this.bx - 30, groundY - 52, 26, 36); // cab body
      c.fillStyle = C.cobble;
      g.circle(this.bx - 24, groundY - 14, 10, C.cobble); // wheel
      g.circle(this.bx - 24, groundY - 14, 6, C.cobbleDk);
      c.fillStyle = C.gold; c.fillRect(this.bx - 26, groundY - 52, 22, 6); // cab roof
      // Shaft
      c.fillStyle = C.bark;
      c.fillRect(this.bx - 6, groundY - 22, 30, 4);

      // Beauty
      drawHorse(api, this.bx + 20, groundY, this.frame, C.chestnut, false);

      // Stamina bar
      c.fillStyle = C.greyDk; c.fillRect(8, H - 52, W - 16, 14);
      const sc = this.stamina;
      c.fillStyle = sc > 0.5 ? C.grassBrt : sc > 0.25 ? C.gold : C.redBrt;
      c.fillRect(8, H - 52, (W - 16) * sc, 14);
      c.fillStyle = C.goldBrt; c.fillRect(8, H - 52, W - 16, 2);
      api.txtC('STAMINA', W / 2, H - 68, 7, C.cream, false);

      // Pendulum meter
      const mX = W / 2 - 76, mY = H - 30, mW = 152, mH = 20;
      c.fillStyle = C.cobbleDk; c.fillRect(mX, mY, mW, mH);
      c.fillStyle = C.red;      c.fillRect(mX, mY, mW * 0.38, mH);
      c.fillRect(mX + mW * 0.62, mY, mW * 0.38, mH);
      c.fillStyle = this.hitFeedback > 0 ? C.goldBrt : this.hitFeedback < 0 ? C.redBrt : C.gold;
      c.fillRect(mX + mW * 0.38, mY, mW * 0.24, mH);
      const nx = mX + this.needle * mW;
      c.fillStyle = C.white; c.fillRect(nx - 2, mY - 4, 4, mH + 8);
      api.txtC('TAP IN GOLD ZONE', W / 2, H - 46, 7, C.straw, false);

      api.topBar('LONDON CAB  ' + Math.floor(this.runT) + 's / 25s');
      api.addScore(1);
    },
  };

  /* ===================== CHAPTER 5: THE MEADOW =====================
   * Gentle catch: flower petals and butterflies drift down peacefully.
   * Left/right to catch them. Avoid thistles (prickly).
   * Win: collect 12 petals. Lose: 3 thistle hits.
   * Pacing: items every 1.2-1.8s; ~22-28s for 12 petals.
   */
  const chMeadow = {
    id: 'meadow',
    name: 'THE MEADOW',
    sub: 'Peace and freedom at last',
    intro: [
      'At last, Black Beauty',
      'finds kind masters and',
      'the green meadow of',
      'rest she has always',
      'deserved.',
      '',
      'Catch the flower',
      'petals drifting by.',
      'Avoid the thistles!',
    ],
    quote: '"My troubles are all over, and I am at home." — Black Beauty',
    help: 'Move LEFT/RIGHT (drag/arrows) to catch drifting FLOWER PETALS and BUTTERFLIES. Avoid THISTLES (spiky purple). 3 thistle pricks = chapter over. Collect 12 flowers for a happy ending.',
    winText: 'The meadow blooms — Beauty is home at last!',
    loseText: 'The thistles sting! Beauty needs a moment.',
    icon(api, x, y) {
      const c = api.ctx, g = api.gfx;
      // Flower
      g.circle(x, y,     10, C.floral);
      g.circle(x, y - 6, 5,  C.floralDk);
      g.circle(x + 5, y + 4, 5, C.floralDk);
      g.circle(x - 5, y + 4, 5, C.floralDk);
      g.circle(x, y,     5, C.goldBrt);
      // Butterfly wings
      c.fillStyle = C.lilac;
      c.fillRect(x + 10, y - 8, 8, 8);
      c.fillRect(x + 10, y, 6, 6);
    },
    _items: [],
    _nextItem: 0,
    init(api) {
      const W = api.W;
      this.bx = W / 2;
      this.lives = 3;
      this.petals = 0;
      this.runT = 0;
      this.frame = 0;
      this.frameT = 0;
      this._items = [];
      this._nextItem = 1.0;
      this.iframes = 0;
      this.beautyBobT = 0;
    },
    update(api, dt) {
      const W = api.W, H = api.H;
      this.runT += dt;
      this.iframes = Math.max(0, this.iframes - dt);
      this.frameT += dt;
      if (this.frameT > 0.18) { this.frame++; this.frameT = 0; }
      this.beautyBobT += dt;

      // Move
      const spd = 120;
      if (api.keyDown('left'))  this.bx -= spd * dt;
      if (api.keyDown('right')) this.bx += spd * dt;
      if (api.pointer.down) {
        const dx = api.pointer.x - this.bx;
        if (Math.abs(dx) > 8) this.bx += Math.sign(dx) * spd * dt;
      }
      this.bx = clamp(this.bx, 22, W - 22);

      // Spawn items
      this._nextItem -= dt;
      if (this._nextItem <= 0) {
        const type = Math.random() < 0.15 ? 'thistle' : Math.random() < 0.5 ? 'petal' : 'butterfly';
        this._items.push({
          x: 18 + Math.random() * (W - 36),
          y: -16,
          vx: (Math.random() - 0.5) * 40,
          vy: 55 + Math.random() * 35,
          type,
          bobOffset: Math.random() * Math.PI * 2,
        });
        this._nextItem = 1.1 + Math.random() * 0.8;
      }

      // Move items (with gentle bob for petals/butterflies)
      for (const it of this._items) {
        it.y += it.vy * dt;
        it.x += it.vx * dt + Math.sin(this.runT * 2 + it.bobOffset) * 0.8;
        it.x = clamp(it.x, 8, W - 8);
      }
      this._items = this._items.filter(it => it.y < H + 20);

      const groundY = H * 0.70;
      for (const it of this._items) {
        if (it.y > groundY - 20 && Math.abs(it.x - this.bx) < 28) {
          if (it.type === 'thistle') {
            if (this.iframes <= 0) {
              this.lives--;
              this.iframes = 1.0;
              api.audio.sfx('hurt');
              api.shake(4, 0.2);
              api.flash('#C030C8', 0.2);
              this._items = this._items.filter(i => i !== it);
              if (this.lives <= 0) { api.lose(); return; }
            }
          } else {
            this._items = this._items.filter(i => i !== it);
            this.petals++;
            api.addScore(120);
            api.audio.sfx('coin');
            api.burst(it.x, groundY, it.type === 'butterfly' ? C.lilac : C.floral, 8);
            if (this.petals >= 12) { api.addScore(600); api.win(); return; }
          }
        }
      }
    },
    draw(api) {
      const c = api.ctx, g = api.gfx, W = api.W, H = api.H;
      const groundY = H * 0.70;
      // Sky
      c.fillStyle = C.skyBrt; c.fillRect(0, 0, W, groundY);
      g.circle(50, 36, 16, C.white); g.circle(70, 28, 20, C.white); g.circle(92, 36, 16, C.white);
      g.circle(W - 50, 44, 14, C.white); g.circle(W - 32, 36, 18, C.white);
      // Sun
      c.fillStyle = C.goldBrt; c.fillRect(W - 44, 14, 22, 22);
      c.fillStyle = C.sunlit;
      c.fillRect(W - 40, 9, 14, 4); c.fillRect(W - 40, 40, 14, 4);
      c.fillRect(W - 50, 20, 4, 10); c.fillRect(W - 26, 20, 4, 10);
      // Meadow
      c.fillStyle = C.grassBrt; c.fillRect(0, groundY, W, H - groundY);
      c.fillStyle = C.grass; c.fillRect(0, groundY, W, 6);
      // Far hedge
      c.fillStyle = C.grassDk; c.fillRect(0, groundY - 4, W, 8);
      // Background flowers
      for (let fi = 0; fi < 8; fi++) {
        const fx = 20 + fi * 32;
        const fy = groundY + 14 + (fi % 3) * 8;
        c.fillStyle = fi % 3 === 0 ? C.floral : fi % 3 === 1 ? C.petalYel : C.lilac;
        c.fillRect(fx - 3, fy - 4, 7, 7);
        c.fillStyle = C.goldBrt; c.fillRect(fx - 1, fy - 2, 3, 3);
        c.fillStyle = C.grass; c.fillRect(fx, fy + 3, 2, 8);
      }

      // Items
      for (const it of this._items) {
        if (it.type === 'petal') {
          c.fillStyle = C.floral;
          c.fillRect(it.x - 5, it.y - 5, 10, 10);
          c.fillStyle = C.floralDk;
          c.fillRect(it.x - 3, it.y - 3, 6, 6);
          c.fillStyle = C.goldBrt; c.fillRect(it.x - 1, it.y - 1, 3, 3);
        } else if (it.type === 'butterfly') {
          c.fillStyle = C.lilac;
          const bob = Math.sin(this.runT * 6 + it.bobOffset) * 3;
          c.fillRect(it.x - 10, it.y - 6 + bob, 9, 8);
          c.fillRect(it.x + 2, it.y - 6 + bob, 9, 8);
          c.fillRect(it.x - 8, it.y + 2 + bob, 7, 6);
          c.fillRect(it.x + 2, it.y + 2 + bob, 7, 6);
          c.fillStyle = C.black; c.fillRect(it.x - 1, it.y - 8 + bob, 3, 16);
        } else {
          // Thistle
          c.fillStyle = C.lilac;
          g.circle(it.x, it.y, 7, C.lilac);
          g.circle(it.x, it.y, 4, C.floralDk);
          c.fillStyle = C.grassBrt;
          // Spiky leaves
          for (let si = 0; si < 4; si++) {
            const sr = si * Math.PI / 2;
            c.fillRect(it.x + Math.cos(sr) * 8 - 1, it.y + Math.sin(sr) * 8 - 1, 3, 3);
          }
        }
      }

      // Beauty with gentle bob
      const bob = Math.sin(this.beautyBobT * 1.5) * 2;
      const iblk = this.iframes > 0 && Math.floor(this.iframes * 8) % 2 === 0;
      if (!iblk) drawHorse(api, this.bx, groundY + bob, this.frame % 2, C.chestnut, false);

      // HUD
      api.topBar('THE MEADOW  PETALS ' + this.petals + '/12');
      for (let li = 0; li < 3; li++) {
        c.fillStyle = li < this.lives ? C.redBrt : C.greyDk;
        c.fillRect(W - 14 - li * 14, 3, 10, 10);
      }
      api.addScore(1);
    },
  };

  /* ===================== RETROSAGA CREATE ===================== */
  RetroSaga.create({
    id:       'blackbeauty-rider',
    title:    'Black Beauty',
    subtitle: 'Five Rides',
    accent:   '#D8A000',
    credit:   'Anna Sewell — 1877',
    currency: 'PRIDE',

    emblem,
    scenery,

    bootCta:   'RIDE',
    bootLine:  'A life of service, suffering, and grace.',
    menuLabel: 'CHOOSE YOUR STABLE',
    menuHint:  'Five chapters of Beauty\'s life',
    menuDone:  'All rides complete!',
    finale:    'From the open fields of Birtwick to the peaceful meadow, Black Beauty has lived her full story — sorrow, toil, and at last, rest.',

    screens: {
      win:          C.grassBrt,
      lose:         C.redBrt,
      chapterLabel: C.hay,
      name:         C.cream,
      sub:          C.straw,
      intro:        C.cream,
      quote:        C.gold,
      help:         C.grey,
      score:        C.goldBrt,
      cur:          C.gold,
      cta:          C.grassBrt,
      overlay:      '#100808',
    },

    labels: {
      chapter: 'RIDE',
      score:   'PRIDE EARNED',
      win:     'Well ridden!',
      lose:    'Thrown to the ground',
      cont:    'RIDE AGAIN',
      finale:  'FOREVER FREE',
      toMenu:  'STABLES',
      play:    'RIDE',
    },

    menu: {
      colors: {
        title: C.goldBrt,
        label: C.cream,
        cur:   C.gold,
      },
      layout(_api, _chapters) {
        return STALL_LAYOUT;
      },
      title(api, info) {
        drawMenuHeader(api, info.respect);
      },
      card(api, info) {
        drawStallCard(api, info);
      },
    },

    chapters: [
      chBirtwick,
      chBearingRein,
      chStorm,
      chLondon,
      chMeadow,
    ],
  });
})();
