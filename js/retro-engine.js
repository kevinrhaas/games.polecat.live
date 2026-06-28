/* ===========================================================================
 * RetroEngine — a tiny, dependency-free 8-bit game engine for games.polecat.live
 * ---------------------------------------------------------------------------
 * Provides everything a small canvas game needs:
 *   - Pixel-perfect, auto-scaling canvas that fits desktop & mobile
 *   - Fixed-timestep game loop with delta updates
 *   - Unified input: keyboard + on-screen touch D-pad / buttons
 *   - WebAudio chiptune synth (beeps, blips, simple music)
 *   - Drawing helpers (rects, pixel text, sprites from string art)
 *   - Collision, RNG, tweening, and localStorage high scores
 *
 * Every game on the site is built on top of this so they share a consistent
 * feel and so the hourly build-loop can ship new titles quickly.
 * ======================================================================== */
(function (global) {
  'use strict';

  /* ----------------------------- Utilities ----------------------------- */
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const aabb = (a, b) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

  /* ------------------------------- Audio ------------------------------- */
  class Audio {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.muted = false;
      this._musicTimer = null;
    }
    _ensure() {
      if (this.ctx) return;
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.ctx.destination);
    }
    resume() {
      this._ensure();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
    setMuted(m) {
      this.muted = m;
      if (this.master) this.master.gain.value = m ? 0 : 0.18;
    }
    toggleMute() {
      this.setMuted(!this.muted);
      return this.muted;
    }
    // Play a tone. type: square|sine|triangle|sawtooth
    tone(freq, dur = 0.1, type = 'square', vol = 0.3, when = 0) {
      this._ensure();
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime + when;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(this.master);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }
    // Frequency slide (for jumps, power-ups, lasers)
    slide(f0, f1, dur = 0.18, type = 'square', vol = 0.3) {
      this._ensure();
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f0, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(this.master);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }
    noise(dur = 0.2, vol = 0.3) {
      this._ensure();
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const n = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = this.ctx.createBufferSource();
      const g = this.ctx.createGain();
      g.gain.value = vol;
      src.buffer = buf;
      src.connect(g);
      g.connect(this.master);
      src.start(t);
    }
    // Named one-shot SFX shortcuts
    sfx(name) {
      switch (name) {
        case 'coin': this.tone(880, 0.06, 'square', 0.3); this.tone(1320, 0.09, 'square', 0.25, 0.05); break;
        case 'jump': this.slide(300, 720, 0.16, 'square', 0.28); break;
        case 'hurt': this.slide(440, 80, 0.3, 'sawtooth', 0.3); break;
        case 'shoot': this.slide(900, 200, 0.12, 'square', 0.22); break;
        case 'power': this.tone(523, 0.08); this.tone(659, 0.08, 'square', 0.3, 0.08); this.tone(784, 0.12, 'square', 0.3, 0.16); break;
        case 'select': this.tone(660, 0.05, 'square', 0.25); break;
        case 'win': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.16, 'square', 0.3, i * 0.12)); break;
        case 'lose': [440, 349, 262, 196].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.3, i * 0.14)); break;
        case 'explode': this.noise(0.4, 0.35); break;
        case 'blip': this.tone(440, 0.04, 'square', 0.2); break;
        default: this.tone(440, 0.08); break;
      }
    }
    // Loop a simple melody: array of [freq|0, beats]
    music(notes, bpm = 120, type = 'triangle') {
      this.stopMusic();
      this._ensure();
      if (!this.ctx) return;
      const beat = 60 / bpm;
      let i = 0;
      const playNext = () => {
        const [f, b] = notes[i % notes.length];
        if (f) this.tone(f, beat * b * 0.9, type, 0.12);
        i++;
        this._musicTimer = setTimeout(playNext, beat * b * 1000);
      };
      playNext();
    }
    stopMusic() {
      if (this._musicTimer) { clearTimeout(this._musicTimer); this._musicTimer = null; }
    }
  }

  /* ------------------------------- Input ------------------------------- */
  // Unified button state. Buttons: up,down,left,right,a,b,start
  class Input {
    constructor(engine) {
      this.engine = engine;
      this.state = {};
      this.prev = {};
      this._keymap = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
        Space: 'a', KeyZ: 'a', KeyJ: 'a', Enter: 'start',
        KeyX: 'b', KeyK: 'b', ShiftLeft: 'b',
      };
      this._bind();
    }
    _bind() {
      global.addEventListener('keydown', (e) => {
        const b = this._keymap[e.code];
        if (b) { this.state[b] = true; e.preventDefault(); }
        // Resume audio on first interaction
        this.engine.audio.resume();
      });
      global.addEventListener('keyup', (e) => {
        const b = this._keymap[e.code];
        if (b) { this.state[b] = false; e.preventDefault(); }
      });
      global.addEventListener('blur', () => { this.state = {}; });
    }
    // Build on-screen controls for touch. layout: 'dpad'|'horizontal'|'minimal'
    buildTouch(container, opts = {}) {
      const layout = opts.layout || 'dpad';
      const labels = opts.labels || { a: 'A', b: 'B' };
      const wrap = document.createElement('div');
      wrap.className = 're-touch re-touch-' + layout;
      const press = (btn, on) => (e) => {
        e.preventDefault();
        this.state[btn] = on;
        this.engine.audio.resume();
      };
      const mk = (btn, label, cls) => {
        const el = document.createElement('button');
        el.className = 're-btn ' + (cls || '');
        el.textContent = label;
        el.setAttribute('aria-label', btn);
        ['touchstart', 'mousedown'].forEach((ev) => el.addEventListener(ev, press(btn, true), { passive: false }));
        ['touchend', 'touchcancel', 'mouseup', 'mouseleave'].forEach((ev) => el.addEventListener(ev, press(btn, false), { passive: false }));
        return el;
      };
      if (layout === 'horizontal') {
        const left = document.createElement('div'); left.className = 're-pad-row';
        left.appendChild(mk('left', '◀', 're-dir'));
        left.appendChild(mk('right', '▶', 're-dir'));
        const right = document.createElement('div'); right.className = 're-act';
        right.appendChild(mk('a', labels.a, 're-a'));
        if (opts.showB !== false) right.appendChild(mk('b', labels.b, 're-b'));
        wrap.appendChild(left); wrap.appendChild(right);
      } else if (layout === 'minimal') {
        const right = document.createElement('div'); right.className = 're-act';
        right.appendChild(mk('a', labels.a, 're-a'));
        wrap.appendChild(document.createElement('div'));
        wrap.appendChild(right);
      } else {
        // dpad
        const pad = document.createElement('div'); pad.className = 're-dpad';
        pad.appendChild(mk('up', '▲', 're-up'));
        pad.appendChild(mk('left', '◀', 're-left'));
        pad.appendChild(mk('right', '▶', 're-right'));
        pad.appendChild(mk('down', '▼', 're-down'));
        const act = document.createElement('div'); act.className = 're-act';
        act.appendChild(mk('a', labels.a, 're-a'));
        if (opts.showB !== false) act.appendChild(mk('b', labels.b, 're-b'));
        wrap.appendChild(pad); wrap.appendChild(act);
      }
      container.appendChild(wrap);
      this._touchWrap = wrap;
    }
    update() { this.prev = Object.assign({}, this.state); }
    down(b) { return !!this.state[b]; }
    // True only on the frame the button was first pressed
    pressed(b) { return !!this.state[b] && !this.prev[b]; }
    released(b) { return !this.state[b] && !!this.prev[b]; }
    anyPressed() { return ['up', 'down', 'left', 'right', 'a', 'b', 'start'].some((k) => this.pressed(k)); }
  }

  /* ------------------------------ Graphics ----------------------------- */
  class Graphics {
    constructor(ctx) { this.ctx = ctx; }
    clear(color) {
      const c = this.ctx;
      c.fillStyle = color || '#000';
      c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    }
    rect(x, y, w, h, color) { const c = this.ctx; c.fillStyle = color; c.fillRect(x | 0, y | 0, w | 0, h | 0); }
    rectO(x, y, w, h, color, lw = 1) { const c = this.ctx; c.strokeStyle = color; c.lineWidth = lw; c.strokeRect((x | 0) + 0.5, (y | 0) + 0.5, w | 0, h | 0); }
    circle(x, y, r, color) { const c = this.ctx; c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
    line(x0, y0, x1, y1, color, lw = 1) { const c = this.ctx; c.strokeStyle = color; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
    // Pixel text using the canvas font (Press Start 2P expected on page)
    text(str, x, y, color = '#fff', size = 8, align = 'left') {
      const c = this.ctx;
      c.fillStyle = color;
      c.font = size + "px 'Press Start 2P', monospace";
      c.textAlign = align;
      c.textBaseline = 'top';
      c.fillText(str, x, y);
      c.textAlign = 'left';
    }
    textC(str, x, y, color, size) { this.text(str, x, y, color, size, 'center'); }
    // Draw sprite from string rows + palette map. '.' or ' ' = transparent.
    sprite(rows, x, y, palette, scale = 1) {
      const c = this.ctx;
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        for (let col = 0; col < row.length; col++) {
          const ch = row[col];
          if (ch === '.' || ch === ' ') continue;
          const color = palette[ch];
          if (!color) continue;
          c.fillStyle = color;
          c.fillRect(x + col * scale, y + r * scale, scale, scale);
        }
      }
    }
  }

  /* ------------------------------- Engine ------------------------------ */
  class Engine {
    /**
     * @param {Object} opts
     *   width, height  : logical pixel resolution of the game
     *   parent         : DOM element or selector to mount into
     *   background     : CSS color behind the canvas
     *   touch          : 'dpad'|'horizontal'|'minimal'|false (auto on touch devices)
     *   buttonLabels   : { a, b }
     */
    constructor(opts = {}) {
      this.W = opts.width || 256;
      this.H = opts.height || 240;
      this.audio = new Audio();
      this.gfx = null;
      this.input = null;
      this._update = null;
      this._render = null;
      this._last = 0;
      this._acc = 0;
      this._step = 1 / 60;
      this._raf = null;
      this.time = 0;
      this.frame = 0;
      this.paused = false;
      this.opts = opts;
      this._buildDom(opts);
      this.input = new Input(this);
      this._maybeTouch(opts);
    }

    _buildDom(opts) {
      const parent = typeof opts.parent === 'string' ? document.querySelector(opts.parent) : opts.parent || document.body;
      this.parent = parent;
      // root wraps stage + controls so we can take the whole screen as one unit
      const root = document.createElement('div');
      root.className = 're-root';
      this.root = root;
      const stage = document.createElement('div');
      stage.className = 're-stage';
      const canvas = document.createElement('canvas');
      canvas.width = this.W;
      canvas.height = this.H;
      canvas.className = 're-canvas';
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      this.canvas = canvas;
      this.ctx = ctx;
      this.gfx = new Graphics(ctx);
      stage.appendChild(canvas);
      this.stage = stage;
      this.controls = document.createElement('div');
      this.controls.className = 're-controls';
      root.appendChild(stage);
      root.appendChild(this.controls);
      parent.appendChild(root);

      // Fullscreen ("immersive") toggle. Prefer a page-provided #fullscreenBtn in
      // the game bar; otherwise drop a floating button on the stage so EVERY game
      // gets fullscreen with no per-page wiring.
      this._immersive = false;
      // Floating exit affordance — CSS keeps it hidden until immersive mode, so it
      // never covers the HUD in windowed play but is always reachable to exit
      // (the game bar gets covered by the fullscreen layer).
      const fb = document.createElement('button');
      fb.type = 'button';
      fb.className = 're-fs-btn';
      fb.setAttribute('aria-label', 'Exit full screen');
      fb.innerHTML = '✕';
      fb.addEventListener('click', () => this.toggleImmersive());
      stage.appendChild(fb);
      this.fsBtn = fb;
      // Optional in-bar button (provided by the game page) to ENTER fullscreen.
      const barBtn = document.getElementById('fullscreenBtn');
      if (barBtn) barBtn.addEventListener('click', () => this.toggleImmersive());

      this._resize();
      global.addEventListener('resize', () => this._resize());
      global.addEventListener('orientationchange', () => setTimeout(() => this._resize(), 120));
      // If the user leaves real fullscreen via a system gesture / Esc, drop immersive too.
      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && this._immersive) this._setImmersive(false);
        else this._resize();
      });
      document.addEventListener('webkitfullscreenchange', () => this._resize());
    }

    _resize() {
      // Fit canvas to its container while preserving aspect ratio & crispness.
      let maxW, maxH;
      if (this._immersive) {
        const ctrlH = this.controls ? this.controls.offsetHeight : 0;
        maxW = global.innerWidth - 12;
        maxH = global.innerHeight - ctrlH - 18;
      } else {
        maxW = this.stage.clientWidth || this.parent.clientWidth || this.W;
        maxH = this.stage.clientHeight || (global.innerHeight * 0.7);
      }
      const scale = Math.max(1, Math.min(maxW / this.W, maxH / this.H));
      this.canvas.style.width = Math.floor(this.W * scale) + 'px';
      this.canvas.style.height = Math.floor(this.H * scale) + 'px';
    }

    // Toggle an immersive "fill the screen" mode. Driven by a CSS class so it
    // works everywhere (including iOS Safari, where the Fullscreen API can't
    // fullscreen a <div>); also calls the real Fullscreen API where supported
    // (Android/desktop) to hide the browser chrome.
    toggleImmersive() { this._setImmersive(!this._immersive); }
    _setImmersive(on) {
      this._immersive = on;
      this.root.classList.toggle('re-immersive', on);
      document.body.classList.toggle('re-immersive-lock', on);
      try {
        if (on && this.root.requestFullscreen && !document.fullscreenElement) {
          this.root.requestFullscreen().catch(() => {});
        } else if (!on && document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch (e) { /* fullscreen API not available — CSS mode still applies */ }
      this.audio.resume();
      // recompute after the layout settles
      setTimeout(() => this._resize(), 60);
      requestAnimationFrame(() => this._resize());
    }

    _maybeTouch(opts) {
      const isTouch = 'ontouchstart' in global || navigator.maxTouchPoints > 0;
      if (opts.touch === false) return;
      const layout = opts.touch || (isTouch ? 'dpad' : null);
      if (layout) {
        this.input.buildTouch(this.controls, { layout, labels: opts.buttonLabels, showB: opts.showB });
      }
    }

    // Register update(dt) and render(gfx) callbacks
    run(update, render) {
      this._update = update;
      this._render = render;
      this._last = performance.now();
      const loop = (now) => {
        this._raf = requestAnimationFrame(loop);
        let dt = (now - this._last) / 1000;
        this._last = now;
        if (dt > 0.25) dt = 0.25; // avoid spiral after tab switch
        if (!this.paused) {
          this._acc += dt;
          while (this._acc >= this._step) {
            this.time += this._step;
            this.frame++;
            if (this._update) this._update(this._step);
            this.input.update();
            this._acc -= this._step;
          }
        }
        if (this._render) this._render(this.gfx);
      };
      this._raf = requestAnimationFrame(loop);
    }
    stop() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = null; this.audio.stopMusic(); }
    pause(p) { this.paused = p; }
  }

  /* --------------------------- Persistence ----------------------------- */
  const Store = {
    key: (g, k) => `polecat.${g}.${k}`,
    getHigh(game) { return parseInt(localStorage.getItem(Store.key(game, 'high')) || '0', 10) || 0; },
    setHigh(game, v) {
      const h = Store.getHigh(game);
      if (v > h) { localStorage.setItem(Store.key(game, 'high'), String(v)); return true; }
      return false;
    },
    get(game, k, d) { const v = localStorage.getItem(Store.key(game, k)); return v === null ? d : v; },
    set(game, k, v) { localStorage.setItem(Store.key(game, k), String(v)); },
  };

  /* ------------------------------ Exports ------------------------------ */
  global.Retro = {
    Engine, Audio, Input, Graphics, Store,
    util: { clamp, lerp, rand, randInt, choice, aabb, dist },
  };
})(window);
