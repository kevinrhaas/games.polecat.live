/* ===========================================================================
 * RetroGfx2 — the 16-bit ("Gen 2") graphics layer for games.polecat.live
 * ---------------------------------------------------------------------------
 * An ADDITIVE extension of RetroEngine's Graphics. Gen-1 (8-bit) games never
 * load this; Gen-2 games load retro-gfx2.js on top of retro-engine.js and get
 * the richer visual vocabulary that separates SNES/Genesis-era games from NES:
 *
 *   - gradient & ordered-dithered skies              (skyGradient / dither)
 *   - a parallax layer stack (multi-speed scrolling)  (parallax)
 *   - a Mode-7 pseudo-3D ground plane (scroll+turn)    (mode7)
 *   - additive glow / bloom                            (glow)
 *   - big sprites with drop shadow + outline           (bigSprite)
 *   - rounded panels & soft shadows                    (roundRect / softShadow)
 *
 * Construct one from a 2D context + logical size:
 *   const g2 = new Retro.Gfx2(ctx, W, H);
 * It's pure-draw and stateless between calls, so it composes with the plain
 * gfx/ctx a game already has. Everything is tuned for chunky, readable pixels
 * (block sampling), not photoreal — this is 16-bit, not 3D.
 * ======================================================================== */
(function (global) {
  'use strict';
  const Retro = global.Retro || (global.Retro = {});

  // 4x4 Bayer matrix (normalized 0..1) for ordered dithering
  const BAYER = [
    [0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5],
  ].map((row) => row.map((v) => (v + 0.5) / 16));

  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const mix = (a, b, t) => {
    const ca = hexToRgb(a), cb = hexToRgb(b);
    const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
    const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
    const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  };

  class Gfx2 {
    constructor(ctx, W, H) {
      this.ctx = ctx;
      this.W = W;
      this.H = H;
    }

    /* -------- smooth vertical gradient (fast, native) -------- */
    verticalGradient(x, y, w, h, stops) {
      const c = this.ctx;
      const g = c.createLinearGradient(0, y, 0, y + h);
      stops.forEach((s) => g.addColorStop(s[0], s[1]));
      c.fillStyle = g;
      c.fillRect(x, y, w, h);
    }
    // fill the whole canvas (or a top band) with a sky gradient
    skyGradient(stops, h) {
      this.verticalGradient(0, 0, this.W, h == null ? this.H : h, stops);
    }

    /* -------- ordered-dither band: retro two-tone blend over a range -------- */
    // Blends colorTop->colorBot across [y0,y1) with a Bayer pattern so it reads
    // as chunky 16-bit shading rather than a smooth CSS gradient.
    dither(y0, y1, colorTop, colorBot, cell) {
      const c = this.ctx, cs = cell || 2, W = this.W;
      for (let y = y0; y < y1; y += cs) {
        const t = (y - y0) / (y1 - y0);
        const by = Math.floor(y / cs) & 3;
        for (let x = 0; x < W; x += cs) {
          const bx = Math.floor(x / cs) & 3;
          c.fillStyle = t > BAYER[by][bx] ? colorBot : colorTop;
          c.fillRect(x, y, cs, cs);
        }
      }
    }

    /* -------- parallax layer stack -------- */
    // layers: [{ speed, draw(offsetX, self) }, ...] back-to-front.
    // offsetX = -camX*speed (wrap your own tiling inside draw for seamless scroll).
    parallax(camX, layers) {
      for (const L of layers) {
        const ox = -camX * (L.speed == null ? 1 : L.speed);
        L.draw(ox, L);
      }
    }
    // helper: draw `fn(x)` repeated every `tileW` to cover the screen given ox
    tiled(ox, tileW, fn) {
      const start = ((ox % tileW) + tileW) % tileW - tileW;
      for (let x = start; x < this.W + tileW; x += tileW) fn(x);
    }

    /* -------- Mode-7 pseudo-3D ground plane -------- */
    // Renders a flat textured plane receding to a horizon, with scroll + turn.
    // opts:
    //   horizon   screen Y of the horizon line (plane fills horizon..H)
    //   camX,camZ world scroll position (camZ = forward travel)
    //   angle     heading in radians (turn the plane)
    //   height    camera height factor (bigger = flatter/further view)
    //   rowStep,colStep  block size for chunky sampling (perf + retro look)
    //   tex(wx,wz,depth,t01) -> css color (t01: 0 near horizon .. 1 at bottom)
    //   fog       optional css color blended in with distance
    mode7(opts) {
      const c = this.ctx, W = this.W, H = this.H;
      const horizon = opts.horizon == null ? H * 0.42 : opts.horizon;
      const rowStep = opts.rowStep || 2, colStep = opts.colStep || 4;
      const height = opts.height == null ? 1 : opts.height;
      const camX = opts.camX || 0, camZ = opts.camZ || 0, ang = opts.angle || 0;
      const tex = opts.tex, fog = opts.fog;
      const sn = Math.sin(ang), cs = Math.cos(ang);
      const span = H - horizon;
      for (let y = Math.floor(horizon); y < H; y += rowStep) {
        const py = y - horizon + 0.5;
        const depth = (height * H) / py;         // near horizon -> huge depth
        const t01 = (y - horizon) / span;
        for (let x = 0; x < W; x += colStep) {
          const sx = (x - W / 2) * depth / (W * 0.5);
          const wx = camX + sx * cs - depth * sn;
          const wz = camZ + sx * sn + depth * cs;
          let col = tex(wx, wz, depth, t01);
          if (!col) continue;
          if (fog) {
            const f = Math.min(1, depth / (height * 20)); // fade far tiles
            col = mix(col, fog, f * 0.85);
          }
          c.fillStyle = col;
          c.fillRect(x, y, colStep, rowStep);
        }
      }
    }

    /* -------- additive glow / bloom -------- */
    glow(x, y, r, color, alpha) {
      const c = this.ctx;
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = alpha == null ? 0.6 : alpha;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      c.restore();
    }

    /* -------- rounded panel + soft drop shadow -------- */
    roundRect(x, y, w, h, r, fill, stroke, lw) {
      const c = this.ctx;
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
      if (fill) { c.fillStyle = fill; c.fill(); }
      if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
    }
    softShadow(x, y, w, h, blur, color) {
      const c = this.ctx;
      c.save();
      c.shadowColor = color || 'rgba(0,0,0,.5)';
      c.shadowBlur = blur == null ? 8 : blur;
      c.shadowOffsetY = 3;
      c.fillStyle = color || 'rgba(0,0,0,.5)';
      c.fillRect(x, y, w, h);
      c.restore();
    }

    /* -------- big sprite: scaled pixel art + drop shadow + outline -------- */
    // rows/palette as RetroEngine sprites. opts: { shadow, outline, flip }
    bigSprite(rows, x, y, palette, scale, opts) {
      const c = this.ctx, s = scale || 1, o = opts || {};
      const w = rows[0].length * s, h = rows.length * s;
      if (o.shadow) {
        c.save();
        c.globalAlpha = 0.35; c.fillStyle = '#000';
        c.beginPath();
        c.ellipse(x + w / 2, y + h + s, w * 0.5, s * 1.6, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
      const put = (px, py, col) => { c.fillStyle = col; c.fillRect(px, py, s, s); };
      const cell = (col, row) => (o.flip ? rows[row].length - 1 - col : col);
      // outline: draw a 1-cell dark border around opaque pixels
      if (o.outline) {
        const oc = o.outline === true ? '#0a0a12' : o.outline;
        for (let r = 0; r < rows.length; r++) {
          for (let col = 0; col < rows[r].length; col++) {
            const ch = rows[r][cell(col, r)];
            if (ch === '.' || ch === ' ' || !palette[ch]) continue;
            const bx = x + col * s, by = y + r * s;
            put(bx - s, by, oc); put(bx + s, by, oc);
            put(bx, by - s, oc); put(bx, by + s, oc);
          }
        }
      }
      for (let r = 0; r < rows.length; r++) {
        for (let col = 0; col < rows[r].length; col++) {
          const ch = rows[r][cell(col, r)];
          if (ch === '.' || ch === ' ') continue;
          const color = palette[ch];
          if (color) put(x + col * s, y + r * s, color);
        }
      }
    }

    /* ===================== animated "16-bit juice" helpers ==================
     * Cheap, deterministic (time-driven) effects that make title & menu screens
     * feel alive — the SNES/Genesis standard for Gen-2 games. All take a time
     * value `t` (seconds) so they animate without per-frame state. */

    // twinkling starfield
    stars(t, n, h, color) {
      const c = this.ctx, W = this.W, H = h == null ? this.H * 0.6 : h;
      for (let i = 0; i < n; i++) {
        const x = (i * 79 + 13) % W, y = (i * 131 + 7) % Math.floor(H);
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * (1 + (i % 5) * 0.3) + i));
        c.globalAlpha = a; c.fillStyle = color || '#dfe6ff';
        c.fillRect(x, y, (i % 7 === 0) ? 2 : 1, (i % 7 === 0) ? 2 : 1);
      }
      c.globalAlpha = 1;
    }

    // rising ember / dust motes (great for torches, fires, magic)
    embers(t, n, opts) {
      const o = opts || {}, c = this.ctx, W = this.W, H = this.H;
      const x0 = o.x0 == null ? 0 : o.x0, x1 = o.x1 == null ? W : o.x1;
      const yb = o.yBottom == null ? H : o.yBottom, yt = o.yTop == null ? 0 : o.yTop;
      const col = o.color || '#ffae4a', spd = o.speed || 0.14, size = o.size || 2;
      const span = yb - yt;
      for (let i = 0; i < n; i++) {
        const seed = (i * 2654435761) >>> 0;
        const bx = x0 + ((seed % 1000) / 1000) * (x1 - x0);
        const ph = (t * spd + (seed % 100) / 100) % 1;
        const y = yb - ph * span;
        const x = bx + Math.sin(t * (0.6 + (i % 4) * 0.2) + i) * 6;
        const a = Math.sin(ph * Math.PI); // fade in/out over its life
        c.globalAlpha = a * (o.alpha == null ? 0.8 : o.alpha);
        c.fillStyle = col; c.fillRect(x | 0, y | 0, size, size);
      }
      c.globalAlpha = 1;
    }

    // scrolling translucent fog bands
    fog(t, opts) {
      const o = opts || {}, c = this.ctx, W = this.W;
      const y0 = o.y0 == null ? this.H * 0.5 : o.y0, y1 = o.y1 == null ? this.H : o.y1;
      const bands = o.bands || 4, col = o.color || '#9b7bbf', al = o.alpha == null ? 0.08 : o.alpha;
      c.save(); c.fillStyle = col;
      for (let b = 0; b < bands; b++) {
        const y = y0 + (y1 - y0) * (b / bands) + Math.sin(t * 0.4 + b) * 5;
        c.globalAlpha = al * (0.7 + 0.3 * Math.sin(t + b));
        const off = ((t * (6 + b * 3)) % 60) - 30;
        c.fillRect(off, y, W + 60, 10 + b * 3);
      }
      c.restore();
    }

    // a flickering torch/candle flame with glow, centered at (x,y) base
    flame(x, y, t, scale, cols) {
      const c = this.ctx, s = scale || 1;
      const co = cols || {};
      const f = 0.7 + 0.3 * Math.sin(t * 13 + x) + 0.15 * Math.sin(t * 29 + y);
      this.glow(x, y - 6 * s, 16 * s * f, co.glow || 'rgba(255,150,40,.9)', 0.6);
      const h = (10 + 4 * f) * s;
      const flick = Math.sin(t * 17 + x) * 1.5 * s;
      c.fillStyle = co.outer || '#ff7a1a';
      c.beginPath(); c.moveTo(x, y - h); c.quadraticCurveTo(x + 4 * s + flick, y - h * 0.4, x, y); c.quadraticCurveTo(x - 4 * s + flick, y - h * 0.4, x, y - h); c.fill();
      c.fillStyle = co.inner || '#ffd24a';
      c.beginPath(); c.moveTo(x, y - h * 0.72); c.quadraticCurveTo(x + 2 * s + flick * 0.5, y - h * 0.3, x, y - 1 * s); c.quadraticCurveTo(x - 2 * s + flick * 0.5, y - h * 0.3, x, y - h * 0.72); c.fill();
    }

    // a moving-gleam pixel-font headline with drop shadow + optional bevel.
    // Draws centered at (cx, y). Great for animated title logos.
    gleamText(str, cx, y, size, color, t, opts) {
      const c = this.ctx, o = opts || {};
      c.save();
      c.font = size + "px 'Press Start 2P'";
      c.textAlign = 'center'; c.textBaseline = 'top';
      const w = c.measureText(str).width;
      if (o.shadow !== false) { c.fillStyle = o.shadow || 'rgba(0,0,0,.6)'; c.fillText(str, cx + Math.max(2, size * 0.08), y + Math.max(2, size * 0.08)); }
      if (o.bevel) { c.fillStyle = o.bevel; c.fillText(str, cx, y - 1); }
      c.fillStyle = color; c.fillText(str, cx, y);
      // moving vertical specular gleam
      const gx = cx - w / 2 + ((t * (o.gleamSpeed || 90)) % (w + 40)) - 20;
      c.beginPath(); c.rect(gx - 7, y - 4, 14, size + 8); c.clip();
      c.fillStyle = o.gleam || 'rgba(255,255,255,.85)'; c.fillText(str, cx, y);
      c.restore();
    }

    // occasional lightning flash intensity 0..1 (irregular via two frequencies)
    lightning(t, period) {
      const p = period || 6.5;
      const phase = (t % p) / p;
      const strike = (0.5 + 0.5 * Math.sin(t * 0.7)) > 0.85; // gate windows
      if (phase < 0.06 && strike) return 1 - phase / 0.06;
      if (phase > 0.10 && phase < 0.14 && strike) return (0.14 - phase) / 0.04 * 0.7;
      return 0;
    }

    // ornate double-bevel frame (for menu medallions / panels)
    ornateFrame(x, y, w, h, r, fill, gold) {
      const g = gold || '#e3c567';
      this.roundRect(x, y, w, h, r, fill || 'rgba(10,7,18,.9)', null);
      this.roundRect(x + 2, y + 2, w - 4, h - 4, Math.max(1, r - 2), null, g, 2);
      this.roundRect(x + 5, y + 5, w - 10, h - 10, Math.max(1, r - 4), null, 'rgba(255,255,255,.12)', 1);
      // corner studs
      const c = this.ctx; c.fillStyle = g;
      [[x + 6, y + 6], [x + w - 6, y + 6], [x + 6, y + h - 6], [x + w - 6, y + h - 6]].forEach((p) => { c.beginPath(); c.arc(p[0], p[1], 1.6, 0, 7); c.fill(); });
    }

    // detailed multi-tone masonry — the kind of layered, lit stonework that
    // separates a 16-bit background from a flat 8-bit brick loop. pal keys:
    // base, light, dark, mortar, moss (any omitted are derived).
    stoneWall(x0, y0, w, h, pal, scrollY) {
      const c = this.ctx, p = pal || {};
      const base = p.base || '#2a2432', light = p.light || mix(base, '#ffffff', 0.18),
        dark = p.dark || mix(base, '#000000', 0.4), mortar = p.mortar || mix(base, '#000000', 0.6),
        moss = p.moss || '#2a3a20';
      const bw = 34, bh = 20, sy = ((scrollY || 0) % bh);
      c.fillStyle = mortar; c.fillRect(x0, y0, w, h);
      for (let ry = -1; ry * bh < h + bh; ry++) {
        const rowY = y0 + ry * bh + sy, off = (ry & 1) ? bw / 2 : 0;
        for (let rx = -1; rx * bw < w + bw; rx++) {
          const bx = x0 + rx * bw + off, by = rowY;
          const seed = (((rx * 73 + ry * 131) >>> 0) % 6);
          const tone = seed < 1 ? dark : seed > 4 ? light : base;
          c.fillStyle = tone; c.fillRect(bx, by, bw - 2, bh - 2);
          c.fillStyle = light; c.fillRect(bx, by, bw - 2, 2);          // top-lit edge
          c.fillStyle = dark; c.fillRect(bx, by + bh - 4, bw - 2, 2);   // bottom shadow
          if (seed === 2) { c.fillStyle = moss; c.fillRect(bx + 4, by + bh - 6, 7, 3); }
          if (seed === 4) { c.fillStyle = dark; c.fillRect(bx + bw - 8, by + 4, 1, bh - 8); } // crack
        }
      }
    }

    // expose the color mixer for games (fog tints, health bars, etc.)
    mix(a, b, t) { return mix(a, b, t); }
  }

  Retro.Gfx2 = Gfx2;
})(window);
