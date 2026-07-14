/* ============================================================================
 * Home page controller — the arcade on Polecat Shell.
 * Renders the catalog, draws procedural pixel thumbnails, powers search /
 * genre-family / style filtering, and builds the shared shell chrome (left
 * rail + topbar + right-panel What's New + fleet app switcher) from
 * vendor/polecat-shell (read-only — see the platform repo to change it).
 * The catalog stays a classic global; the changelog is an ES module (shared
 * polecat convention).
 * ============================================================================ */
import { CHANGELOG, LATEST_VERSION } from './changelog.js';
import { configure as themeConfigure, applyTheme, toggleMode, effectiveMode } from '../vendor/polecat-shell/theme.js';
import { initShell, rightPanel, appSwitcher } from '../vendor/polecat-shell/shell.js';
import { el } from '../vendor/polecat-shell/ui.js';
import { icon } from '../vendor/polecat-shell/icons.js';
import { initWhatsNew, hasUnseen, markSeen } from '../vendor/polecat-shell/whatsnew.js';
import { FLEET } from '../vendor/polecat-shell/catalog.js';

(function () {
  'use strict';
  const catalog = window.POLECAT_CATALOG || [];
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const search = document.getElementById('search');
  const familyChips = document.getElementById('familyChips');
  const styleChips = document.getElementById('styleChips');

  const state = { q: '', family: 'All', style: 'All' };

  // The home grid & search only surface finished, multi-chapter STORY-MODE games.
  const shown = (g) => g.status === 'live' && !g.legacy;
  const shownGames = () => catalog.filter(shown);

  // Console-history generation for the card badge (8-bit = Gen 3, 16-bit = Gen 4).
  const genOf = (g) => g.gen || (g.style === '16-bit' ? 4 : g.style === '3d' ? 5 : 3);

  /* ----------- genre FAMILIES -----------
   * The catalog carries ~70 bespoke genre strings (great flavor on cards,
   * hopeless as navigation). The rail and chips filter by ~10 curated
   * families instead; first matching rule wins, so order matters. */
  const FAMILIES = [
    { key: 'Horror',    icon: 'eyeOff',  re: /horror|dark descent|sanity|decay/i },
    { key: 'Stealth',   icon: 'eye',     re: /stealth|pickpocket|heist|night chase/i },
    { key: 'Puzzle',    icon: 'grid',    re: /puzzle|swap|mining|garden|spell|transformation|collect/i },
    { key: 'Rhythm',    icon: 'activity', re: /rhythm/i },
    { key: 'Racing',    icon: 'bolt',    re: /racing|driving|race|sled|flight|joust|runner|time attack|chase/i },
    { key: 'Combat',    icon: 'target',  re: /brawler|boss|combat|duel|shooter|shmup|harpoon|cannon|aim|archery|fencing|swashbuckler|battle/i },
    { key: 'Survival',  icon: 'fire',    re: /survival|convoy|island|climb/i },
    { key: 'Strategy',  icon: 'layers',  re: /strategy|tactics|defense|manager|sim\b|tycoon/i },
    { key: 'Story',     icon: 'book',    re: /narrative|drama|mystery|romance|story|dialogue|journey|tragedy/i },
    { key: 'Adventure', icon: 'compass', re: /./ },   // everything else
  ];
  const familyOf = (g) => FAMILIES.find((f) => f.re.test(g.genre || '')).key;
  const familyCount = (key) => shownGames().filter((g) => familyOf(g) === key).length;

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

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, shade(accent, -120));
    g.addColorStop(1, '#06010f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255,255,255,.7)';
    for (let i = 0; i < 26; i++) ctx.fillRect((rng() * W) | 0, (rng() * H * 0.6) | 0, 1, 1);

    ctx.fillStyle = shade(accent, 60);
    const mx = 20 + rng() * 120, my = 14 + rng() * 22, mr = 8 + rng() * 8;
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(mx, my, mr + 4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;

    const kind = seedFrom(game.genre) % 4;
    ctx.fillStyle = '#0a0420';
    if (kind === 0) {
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) ctx.lineTo(x, H - 26 - rng() * 34);
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    } else if (kind === 1) {
      for (let x = 0; x < W; x += 14) {
        const th = 24 + rng() * 46; ctx.fillRect(x, H - th, 11, th);
      }
    } else if (kind === 2) {
      ctx.fillRect(0, H - 34, W, 34);
      ctx.fillStyle = shade(accent, -60);
      for (let x = 0; x < W; x += 8) ctx.fillRect(x, H - 34 + ((x / 8) % 2 ? 2 : 5), 8, 2);
    } else {
      ctx.fillRect(0, H - 22, W, 22);
      for (let i = 0; i < 9; i++) {
        const tx = rng() * W, th = 18 + rng() * 26;
        ctx.fillRect(tx, H - 22 - th, 4, th);
        ctx.beginPath(); ctx.moveTo(tx - 9, H - 22 - th + 8); ctx.lineTo(tx + 2, H - 22 - th - 10); ctx.lineTo(tx + 13, H - 22 - th + 8); ctx.fill();
      }
    }

    const hx = (W / 2 + (rng() - 0.5) * 40) | 0, hy = H - 30;
    ctx.fillStyle = accent;
    ctx.fillRect(hx - 4, hy - 8, 8, 8);
    ctx.fillRect(hx - 3, hy, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(hx - 2, hy - 6, 2, 2); ctx.fillRect(hx + 1, hy - 6, 2, 2);

    ctx.strokeStyle = 'rgba(123,92,255,.5)'; ctx.lineWidth = 1;
    for (let x = -2; x < 14; x++) { ctx.beginPath(); ctx.moveTo((x / 12) * W, H); ctx.lineTo(W / 2, H - 14); ctx.stroke(); }

    const v = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 90);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  /* ----------- thumbnail media ----------- */
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

  /* ----------- card builder (unchanged from the pre-shell arcade) ----------- */
  function card(variants) {
    const list = variants.slice().sort((a, b) => genOf(b) - genOf(a));
    const g = list[0];
    const multi = list.length > 1;

    const node = document.createElement(multi ? 'div' : 'a');
    node.className = 'card' + (multi ? ' multi' : '');
    if (!multi) node.href = 'games/' + g.id + '/';
    node.dataset.genre = g.genre;
    node.dataset.style = g.style;

    const thumb = document.createElement(multi ? 'a' : 'div');
    thumb.className = 'thumb';
    if (multi) thumb.href = 'games/' + g.id + '/';
    thumb.appendChild(thumbMedia(g));

    const badges = document.createElement('div');
    badges.className = 'badges';
    const genBadges = list.map((v) => `<span class="badge gen gen${genOf(v)}">GEN ${genOf(v)}</span>`).join('');
    badges.innerHTML = genBadges + (multi ? '' : `<span class="badge">${g.style}</span>`) +
      `<span class="badge genre">${g.genre}</span>`;
    thumb.appendChild(badges);

    const body = document.createElement('div');
    body.className = 'body';
    const meta = multi
      ? `<div class="meta"><span class="src">${g.source.split('—')[0].trim()}</span>` +
        `<span class="gen-switch">` +
        list.map((v) => `<a class="gen-play gen${genOf(v)}" href="games/${v.id}/">▶ ${v.style}</a>`).join('') +
        `</span></div>`
      : `<div class="meta"><span class="src">${g.source.split('—')[0].trim()}</span><span class="play">▶ PLAY</span></div>`;
    body.innerHTML = `<h3>${g.title}</h3><p>${g.blurb}</p>` + meta;

    node.appendChild(thumb);
    node.appendChild(body);
    return node;
  }

  /* ----------- filtering ----------- */
  function visible(game) {
    if (!shown(game)) return false;
    if (state.family !== 'All' && familyOf(game) !== state.family) return false;
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
    const groups = new Map();
    items.forEach((g) => { const k = g.property || g.id; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(g); });
    const cards = [...groups.values()];
    cards.forEach((variants) => grid.appendChild(card(variants)));
    empty.hidden = cards.length > 0;
  }

  /* ----------- family selection (rail + chips stay in sync) ----------- */
  let shell; // set below
  function setFamily(key, { scroll = false } = {}) {
    state.family = key;
    familyChips.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.key === key)));
    shell && shell.setActive(key === 'All' ? 'all' : key);
    render();
    if (scroll) document.getElementById('games').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildChips() {
    const fams = ['All', ...FAMILIES.map((f) => f.key).filter((k) => familyCount(k) > 0)];
    fams.forEach((k) => {
      const c = document.createElement('button');
      c.className = 'chip';
      c.dataset.key = k;
      c.textContent = k;
      c.setAttribute('aria-pressed', String(k === state.family));
      c.addEventListener('click', () => setFamily(k));
      familyChips.appendChild(c);
    });
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
    const titles = [...new Set([...shownGames(), ...catalog.filter((g) => !shown(g))].map((g) => g.title))];
    const marquee = document.getElementById('marquee');
    marquee.textContent = '★ ' + titles.join('  ★  ') + '  ★  NEW LEGENDS EVERY HOUR  ★  ';
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
    const hour = new Date().getHours();
    const pick = (n, offset) => {
      const out = [];
      for (let i = 0; i < n && i < live.length; i++) out.push(live[(hour + offset + i) % live.length]);
      return out;
    };
    document.querySelectorAll('.ad-slot[data-ad]').forEach((slot) => {
      const n = slot.classList.contains('billboard') ? 3 : 2;
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

  /* ----------- "What's New" (fleet-format changelog → shell right panel) ---- */
  const SEEN_KEY = 'polecat.updates.seen';
  function fmtCT(ts) {
    if (!ts) return 'Just now';
    if (/CT$/.test(ts)) return ts;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' CT';
  }
  function openWhatsNew(btn) {
    rightPanel({
      title: "What's New",
      body: initWhatsNew({ entries: CHANGELOG, latest: LATEST_VERSION, storageKey: SEEN_KEY }),
    });
    markSeen(SEEN_KEY, LATEST_VERSION);
    btn.classList.remove('has-unseen');
  }

  /* ----------- the shell: rail + topbar + waffle ----------- */
  themeConfigure({ storageKey: 'games.theme', defaultTheme: 'neon:dark' });
  applyTheme();

  const arcade = document.getElementById('arcade');
  const wnBtn = el('button', { class: 'btn icon ghost', title: "What's new", 'aria-label': "What's new", html: icon('sparkle', 18) });
  wnBtn.addEventListener('click', () => openWhatsNew(wnBtn));
  if (hasUnseen(SEEN_KEY, LATEST_VERSION)) wnBtn.classList.add('has-unseen');

  const themeBtn = el('button', { class: 'btn icon ghost', title: 'Day / night arcade', 'aria-label': 'Toggle light or dark', html: icon(effectiveMode() === 'dark' ? 'sun' : 'moon', 18) });
  themeBtn.addEventListener('click', () => {
    toggleMode();
    themeBtn.innerHTML = icon(effectiveMode() === 'dark' ? 'sun' : 'moon', 18);
  });

  const sections = [
    { group: 'Arcade' },
    { key: 'all', label: 'All Games', icon: icon('gamepad', 18) },
    { key: 'surprise', label: 'Surprise Me', icon: icon('sparkle', 18) },
    { group: 'Genres' },
    ...FAMILIES.filter((f) => familyCount(f.key) > 0).map((f) => ({ key: f.key, label: f.key, icon: icon(f.icon, 18) })),
    { group: 'More' },
    { key: 'about', label: 'About', icon: icon('info', 18) },
  ];

  shell = initShell({
    app: { id: 'games', name: 'games.polecat.live', wordmark: '<img src="assets/logo.svg" alt="">' },
    sections,
    onNav(key) {
      if (key === 'surprise') {
        const live = shownGames();
        if (live.length) location.href = 'games/' + live[Math.floor(Math.random() * live.length)].id + '/';
        return;
      }
      if (key === 'about') {
        shell.setActive('about');
        document.getElementById('about').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      setFamily(key === 'all' ? 'All' : key, { scroll: true });
    },
    rail: { storageKey: 'games.rail' },
    topbar: {
      left: [el('h1', { text: 'ARCADE OF LEGENDS' })],
      right: [appSwitcher(FLEET, { current: 'games' }), wnBtn, themeBtn],
    },
  });
  // adopt the arcade content into the shell's scrolling view
  shell.els.main.append(arcade);
  // live counts on the genre rail
  FAMILIES.forEach((f) => { const n = familyCount(f.key); if (n) shell.setBadge(f.key, n); });
  shell.setActive('all');

  /* ----------- wire up ----------- */
  search.addEventListener('input', () => { state.q = search.value.trim().toLowerCase(); render(); });
  const randBtn = document.getElementById('randomBtn');
  if (randBtn) randBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const live = shownGames();
    if (live.length) location.href = 'games/' + live[Math.floor(Math.random() * live.length)].id + '/';
  });
  const lu = document.getElementById('lastUpdated');
  if (lu && CHANGELOG[0]) lu.textContent = fmtCT(CHANGELOG[0].ts);

  buildChips();
  meta();
  render();
  buildPromos();
})();
