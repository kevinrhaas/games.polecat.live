/* Headless functional test for the rebuilt littlemermaid-sea Tides 2 & 5:
 * Tide 2 (witch's cave) is now a Simon-says potion-brewing memory game;
 * Tide 5 (final dawn) is now a branching courtship dialogue. Both need real,
 * ordered input to win, so the generic idle audit (audit-saga.mjs) can't
 * exercise them — this drives real taps through both chapters via the
 * __sagaTest hook and asserts zero pageerrors + a win on each. */
import http from 'node:http';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8198;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p.endsWith('/')) p += 'index.html';
  const full = path.join(ROOT, p);
  res.setHeader('Content-Type', MIME[path.extname(full)] || 'text/plain');
  createReadStream(full).on('error', () => { res.statusCode = 404; res.end(); }).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

const { chromium } = await import('playwright');
const exe = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium';
let browser;
try { browser = await chromium.launch({ executablePath: exe }); }
catch { browser = await chromium.launch(); }

const errors = [];
let failed = false;

async function runViewport(viewport, label) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`[${label}] ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${label}] ${m.text()}`); });

  await page.goto(`http://localhost:${PORT}/games/littlemermaid-sea/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(600);

  async function rect() {
    return page.evaluate(() => {
      const r = document.querySelector('canvas').getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    });
  }
  async function tap(lx, ly) {
    const r = await rect();
    await page.mouse.click(r.left + (lx / 270) * r.width, r.top + (ly / 480) * r.height);
  }

  const chapterIds = await page.evaluate(() => window.__sagaTest.chapters);

  // ── Tide 2: witch's cave (potion-brewing memory) ─────────────────────
  const witchIdx = chapterIds.indexOf('witch');
  await page.evaluate((i) => window.__sagaTest.jump(i), witchIdx);
  await page.waitForTimeout(100);

  for (let round = 0; round < 10; round++) {
    // wait until the state machine is ready for input
    let st = null;
    for (let t = 0; t < 60; t++) {
      st = await page.evaluate(() => window.__sagaTest.state());
      if (!st) break;
      if (st.state === 'input') break;
      await page.waitForTimeout(120);
    }
    if (!st) { console.log(`[${label}] witch: chapter ended (result cleared state)`); break; }
    if (st.state !== 'input') { console.log(`[${label}] witch: never reached input state, stuck at ${st.state}`); failed = true; break; }
    for (const idx of st.seq) {
      const stn = st.stations[idx];
      await tap(stn.x, stn.y);
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(150);
    const after = await page.evaluate(() => window.__sagaTest.last);
    if (after) { console.log(`[${label}] witch: finished — won=${after.won} t=${after.t}s`); if (!after.won) failed = true; break; }
  }
  const witchLast = await page.evaluate(() => window.__sagaTest.last);
  if (!witchLast || !witchLast.won) { console.log(`[${label}] witch: FAILED to win`); failed = true; }
  await page.evaluate(() => { window.__sagaTest.last = null; });
  await page.waitForTimeout(500);

  // ── Tide 5: final dawn (branching courtship dialogue) ────────────────
  const dawnIdx = chapterIds.indexOf('dawn');
  await page.evaluate((i) => window.__sagaTest.jump(i), dawnIdx);
  await page.waitForTimeout(100);

  for (let moment = 0; moment < 6; moment++) {
    let st = null;
    for (let t = 0; t < 40; t++) {
      st = await page.evaluate(() => window.__sagaTest.state());
      if (!st) break;
      if (st.phase === 'choose') break;
      await page.waitForTimeout(120);
    }
    if (!st) { console.log(`[${label}] dawn: chapter ended`); break; }
    if (st.phase !== 'choose') { await page.waitForTimeout(1500); continue; }
    const card = st.cards[moment % 3];
    await tap(card.x + card.w / 2, card.y + card.h / 2);
    await page.waitForTimeout(1300); // ride out the reaction beat
  }
  await page.waitForTimeout(2000);
  const dawnLast = await page.evaluate(() => window.__sagaTest.last);
  if (!dawnLast || !dawnLast.won) { console.log(`[${label}] dawn: FAILED to win (last=${JSON.stringify(dawnLast)})`); failed = true; }
  else console.log(`[${label}] dawn: finished — won=${dawnLast.won} t=${dawnLast.t}s`);

  await ctx.close();
}

await runViewport({ width: 390, height: 780 }, 'mobile');
await runViewport({ width: 1280, height: 800 }, 'desktop');

await browser.close();
server.close();

const filtered = errors.filter((e) => !e.includes('fonts.googleapis') && !e.includes('favicon') && !e.includes('net::ERR'));
console.log('page errors:', JSON.stringify(filtered));

if (filtered.length > 0 || failed) {
  console.error('HEADLESS FAIL');
  process.exit(1);
} else {
  console.log('HEADLESS PASS');
}
