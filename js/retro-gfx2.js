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

    // expose the color mixer for games (fog tints, health bars, etc.)
    mix(a, b, t) { return mix(a, b, t); }
  }

  Retro.Gfx2 = Gfx2;
})(window);
