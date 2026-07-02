/* ============================================================================
 * Home page controller — renders the catalog, draws procedural pixel
 * thumbnails, and powers search / genre / style filtering.
 * ============================================================================ */
(function () {
  'use strict';
  const catalog = window.POLECAT_CATALOG || [];
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const search = document.getElementById('search');
  const genreChips = document.getElementById('genreChips');
  const styleChips = document.getElementById('styleChips');

  const state = { q: '', genre: 'All', style: 'All' };

  // The home grid & search only surface finished, multi-chapter STORY-MODE games.
  // That means: built (status:"live") AND not a legacy single-mechanic game.
  // Unfinished ("soon") and legacy games are hidden until they ship in story
  // mode — new story games then appear automatically (no per-game flag needed).
  const shown = (g) => g.status === 'live' && !g.legacy;
  const shownGames = () => catalog.filter(shown);

  /* ----------- tiny seeded RNG so each thumbnail is stable ----------- */
  function seedFrom(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* ----------- procedural pixel scene thumbnail per game ----------- */
  function drawThumb(canvas, game) {
    const ctx = canvas.getContext('2d');
    const W = (canvas.width = 160), H = (canvas.height = 100);
    ctx.imageSmoothingEnabled = false;
    const rng = mulberry(seedFrom(game.id));
    const accent = game.accent || '#21e6ff';

    // sky gradient
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, shade(accent, -120));
    g.addColorStop(1, '#06010f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // starfield
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    for (let i = 0; i < 26; i++) ctx.fillRect((rng() * W) | 0, (rng() * H * 0.6) | 0, 1, 1);

    // distant moon / sun
    ctx.fillStyle = shade(accent, 60);
    const mx = 20 + rng() * 120, my = 14 + rng() * 22, mr = 8 + rng() * 8;
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(mx, my, mr + 4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;

    // silhouette skyline / terrain — varied per game
    const kind = seedFrom(game.genre) % 4;
    ctx.fillStyle = '#0a0420';
    if (kind === 0) {
      // jagged mountains
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) ctx.lineTo(x, H - 26 - rng() * 34);
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    } else if (kind === 1) {
      // city towers
      for (let x = 0; x < W; x += 14) {
        const th = 24 + rng() * 46; ctx.fillRect(x, H - th, 11, th);
      }
    } else if (kind === 2) {
      // rolling sea
      ctx.fillRect(0, H - 34, W, 34);
      ctx.fillStyle = shade(accent, -60);
      for (let x = 0; x < W; x += 8) ctx.fillRect(x, H - 34 + ((x / 8) % 2 ? 2 : 5), 8, 2);
    } else {
      // forest
      ctx.fillRect(0, H - 22, W, 22);
      for (let i = 0; i < 9; i++) {
        const tx = rng() * W, th = 18 + rng() * 26;
        ctx.fillRect(tx, H - 22 - th, 4, th);
        ctx.beginPath(); ctx.moveTo(tx - 9, H - 22 - th + 8); ctx.lineTo(tx + 2, H - 22 - th - 10); ctx.lineTo(tx + 13, H - 22 - th + 8); ctx.fill();
      }
    }

    // hero sprite (accent blob) center-ish
    const hx = (W / 2 + (rng() - 0.5) * 40) | 0, hy = H - 30;
    ctx.fillStyle = accent;
    ctx.fillRect(hx - 4, hy - 8, 8, 8);
    ctx.fillRect(hx - 3, hy, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(hx - 2, hy - 6, 2, 2); ctx.fillRect(hx + 1, hy - 6, 2, 2);

    // ground grid glow
    ctx.strokeStyle = 'rgba(123,92,255,.5)'; ctx.lineWidth = 1;
    for (let x = -2; x < 14; x++) { ctx.beginPath(); ctx.moveTo((x / 12) * W, H); ctx.lineTo(W / 2, H - 14); ctx.stroke(); }

    // vignette
    const v = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 90);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  /* ----------- thumbnail media ----------- */
  // Live games show a real screenshot (games/<id>/thumb.png); if it's missing
  // we fall back to the procedural pixel scene. "Soon" games use procedural art.
  function thumbMedia(game) {
    if (game.status === 'live') {
      const img = document.createElement('img');
      img.className = 'thumb-img';
      img.loading = 'lazy';
      img.alt = game.title + ' gameplay';
      img.src = 'games/' + game.id + '/thumb.png';
      img.addEventListener('error', () => {
        const cv = document.createElement('canvas');
        drawThumb(cv, game);
        if (img.parentNode) img.replaceWith(cv);
      });
      return img;
    }
    const cv = document.createElement('canvas');
    drawThumb(cv, game);
    return cv;
  }

  /* ----------- card builder ----------- */
  function card(game) {
    const live = game.status === 'live';
    const el = document.createElement(live ? 'a' : 'div');
    el.className = 'card' + (live ? '' : ' soon');
    if (live) { el.href = 'games/' + game.id + '/'; }
    el.dataset.genre = game.genre;
    el.dataset.style = game.style;

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.appendChild(thumbMedia(game));

    const badges = document.createElement('div');
    badges.className = 'badges';
    badges.innerHTML =
      ((game.gen || 1) >= 2 ? `<span class="badge gen2">GEN ${game.gen}</span>` : '') +
      `<span class="badge">${game.style}</span>` +
      `<span class="badge genre">${game.genre}</span>` +
      (live ? '' : '<span class="badge">SOON</span>');
    thumb.appendChild(badges);

    const body = document.createElement('div');
    body.className = 'body';
    body.innerHTML =
      `<h3>${game.title}</h3>` +
      `<p>${game.blurb}</p>` +
      `<div class="meta"><span class="src">${game.source.split('—')[0].trim()}</span>` +
      `<span class="play">${live ? '▶ PLAY' : '🔒 SOON'}</span></div>`;

    el.appendChild(thumb);
    el.appendChild(body);
    return el;
  }

  /* ----------- filtering ----------- */
  function visible(game) {
    if (!shown(game)) return false;
    if (state.genre !== 'All' && game.genre !== state.genre) return false;
    if (state.style !== 'All' && game.style !== state.style) return false;
    if (state.q) {
      const hay = (game.title + ' ' + game.source + ' ' + game.genre + ' ' + (game.tags || []).join(' ')).toLowerCase();
      if (!hay.includes(state.q)) return false;
    }
    return true;
  }

  function render() {
    grid.innerHTML = '';
    const items = catalog.filter(visible);
    items.forEach((g) => grid.appendChild(card(g)));
    empty.hidden = items.length > 0;
  }

  /* ----------- chips ----------- */
  function buildChips() {
    // Only list genres that actually have a playable game, so the filter stays a
    // short, swipeable row instead of a 40-chip wall. It grows as games ship.
    const liveGenres = Array.from(new Set(shownGames().map((g) => g.genre))).sort();
    const genres = ['All', ...liveGenres];
    genres.forEach((gname) => {
      const c = document.createElement('button');
      c.className = 'chip';
      c.textContent = gname;
      c.setAttribute('aria-pressed', gname === 'All');
      c.addEventListener('click', () => {
        state.genre = gname;
        genreChips.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x === c));
        render();
      });
      genreChips.appendChild(c);
    });
    // Hide the style filter entirely until there's more than one style to pick.
    const distinctStyles = Array.from(new Set(catalog.map((g) => g.style)));
    if (distinctStyles.length <= 1) { styleChips.style.display = 'none'; return; }
    const styles = ['All', ...distinctStyles.sort()];
    styles.forEach((sname) => {
      const c = document.createElement('button');
      c.className = 'chip style';
      c.textContent = sname === 'All' ? 'All styles' : sname;
      c.setAttribute('aria-pressed', sname === 'All');
      c.addEventListener('click', () => {
        state.style = sname;
        styleChips.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x === c));
        render();
      });
      styleChips.appendChild(c);
    });
  }

  /* ----------- stats + marquee ----------- */
  function meta() {
    const liveCount = shownGames().length;
    document.getElementById('statLive').textContent = liveCount;
    document.getElementById('statTotal').textContent = catalog.length;
    const yEl = document.getElementById('year'); if (yEl) yEl.textContent = '2026';
    // marquee teases the playable story-mode games (leads), then the roadmap
    const titles = [...shownGames(), ...catalog.filter((g) => !shown(g))].map((g) => g.title);
    const marquee = document.getElementById('marquee');
    marquee.textContent = '★ ' + titles.join('  ★  ') + '  ★  NEW LEGENDS EVERY HOUR  ★  ';
    // The crawl distance grows with the catalog, so derive the duration from the
    // actual width for a calm, constant ~40px/sec speed regardless of how many
    // titles there are.
    requestAnimationFrame(() => {
      const travel = marquee.scrollWidth || 2000;
      marquee.style.animationDuration = Math.max(40, Math.round(travel / 40)) + 's';
    });
  }

  /* ----------- self-promo ad slots (cross-promote our own games) ----------- */
  function promoCard(game) {
    const a = document.createElement('a');
    a.className = 'promo-card';
    a.href = 'games/' + game.id + '/';
    const txt = document.createElement('div');
    txt.className = 'pc-txt';
    txt.innerHTML =
      `<span class="pc-eyebrow">▶ FEATURED GAME</span>` +
      `<span class="pc-title">${game.title}</span>` +
      `<span class="pc-play">PLAY NOW →</span>`;
    a.appendChild(thumbMedia(game));
    a.appendChild(txt);
    return a;
  }
  function buildPromos() {
    const live = shownGames();
    if (!live.length) return;
    // deterministic-but-rotating pick based on the hour, so it changes over time
    const hour = new Date().getHours();
    const pick = (n, offset) => {
      const out = [];
      for (let i = 0; i < n && i < live.length; i++) out.push(live[(hour + offset + i) % live.length]);
      return out;
    };
    document.querySelectorAll('.ad-slot[data-ad]').forEach((slot) => {
      const n = slot.classList.contains('billboard') ? 3 : (slot.classList.contains('rail') ? 2 : 2);
      const offset = slot.dataset.ad === 'home-billboard' ? 2 : 0;
      const games = pick(n, offset);
      if (!games.length) return;
      slot.classList.add('promo');
      slot.innerHTML = '';
      const row = document.createElement('div');
      row.className = 'promo-row';
      games.forEach((gm) => row.appendChild(promoCard(gm)));
      slot.appendChild(row);
    });
  }

  /* ----------- wire up ----------- */
  search.addEventListener('input', () => { state.q = search.value.trim().toLowerCase(); render(); });
  const randBtn = document.getElementById('randomBtn');
  if (randBtn) randBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const live = shownGames();
    if (live.length) location.href = 'games/' + live[Math.floor(Math.random() * live.length)].id + '/';
  });

  /* ----------- "What's New" updates drawer ----------- */
  // Timestamps are stored as ISO-8601 UTC (relay convention) and formatted into
  // the reader-facing US Central time here. Tolerates an empty ts (a just-added
  // entry the workflow hasn't stamped yet) and legacy pre-formatted CT strings.
  function fmtCT(ts) {
    if (!ts) return 'Just now';
    if (/CT$/.test(ts)) return ts; // legacy pre-formatted string
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' CT';
  }
  function buildChangelog() {
    const log = window.POLECAT_CHANGELOG || [];
    const lu = document.getElementById('lastUpdated');
    if (lu && log[0]) lu.textContent = fmtCT(log[0].ts);
    const list = document.getElementById('updatesList');
    if (list) list.innerHTML = log.map((e) => {
      const items = e.items || e.notes || [];
      return `<div class="update"><div class="when">${fmtCT(e.ts)}</div><h4>${e.title}</h4>` +
        (items.length ? '<ul>' + items.map((n) => `<li>${n}</li>`).join('') + '</ul>' : '') + `</div>`;
    }).join('');
    const drawer = document.getElementById('updatesDrawer');
    const scrim = document.getElementById('updatesScrim');
    const open = () => { if (drawer) drawer.hidden = false; if (scrim) scrim.hidden = false; };
    const close = () => { if (drawer) drawer.hidden = true; if (scrim) scrim.hidden = true; };
    // "unseen updates" dot: light the ✨ button when the latest version is newer
    // than what this visitor has already opened (stored locally).
    const latest = window.POLECAT_LATEST_VERSION || (log[0] && log[0].v) || 0;
    const SEEN_KEY = 'polecat.updates.seen';
    let seen = parseInt(localStorage.getItem(SEEN_KEY) || '0', 10) || 0;
    const fab = document.getElementById('updatesBtn');
    if (fab && latest > seen) fab.classList.add('has-unseen');
    const markSeen = () => { try { localStorage.setItem(SEEN_KEY, String(latest)); } catch (e) {} if (fab) fab.classList.remove('has-unseen'); };
    if (fab) fab.addEventListener('click', () => { open(); markSeen(); });
    if (scrim) scrim.addEventListener('click', close);
    const cb = document.getElementById('updatesClose'); if (cb) cb.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  buildChips();
  meta();
  render();
  buildPromos();
  buildChangelog();
})();
