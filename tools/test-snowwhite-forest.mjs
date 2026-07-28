/* Headless functional test for the rebuilt snowwhite-apple FOREST FLIGHT
 * chapter: it used to be a dodge-falling-tree-claws lane game (the last of the
 * queue's "3 dodge lanes"); now it's a hide-from-the-Huntsman stealth chapter
 * — the Huntsman's lantern telegraphs which of 3 hiding spots it's about to
 * sweep, and you must be somewhere else when it lands. Drives a
 * read-state/move-to-a-safe-spot strategy and asserts it can actually be won,
 * plus a zero-pageerror pass on both viewports. */
import http from 'node:http';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8197;
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

async function tapFrac(page, fx, fy) {
  await page.evaluate(([fx, fy]) => {
    const cv = document.querySelector('.re-canvas');
    const r = cv.getBoundingClientRect();
    const x = r.left + r.width * fx, y = r.top + r.height * fy;
    cv.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, bubbles: true }));
    cv.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, bubbles: true }));
  }, [fx, fy]);
}

const SPOT_FX = [50 / 270, 135 / 270, 220 / 270];
const SPOT_FY = 300 / 480;

let anyFail = false;

async function runViewport(viewport, label) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`[${label}] ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${label}] ${m.text()}`); });

  await page.goto(`http://localhost:${PORT}/games/snowwhite-apple/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(600);

  const ids = await page.evaluate(() => window.__sagaTest.chapters);
  const forestIdx = ids.indexOf('forest');
  await page.evaluate((i) => { window.__sagaTest.last = null; window.__sagaTest.jump(i); }, forestIdx);
  await page.waitForTimeout(200);

  // read-state / duck-to-a-safe-spot strategy: whenever the lantern is
  // targeting the spot Snow White is currently hiding in, tap a spot that
  // isn't targeted, then keep polling until a result lands.
  let result = null;
  for (let i = 0; i < 300 && !result; i++) {
    const st = await page.evaluate(() => {
      const c = window.__sagaTest.current();
      return { spot: c.spot, target: c.target };
    });
    if (st.target && st.target.length && st.target.indexOf(st.spot) !== -1) {
      const safe = [0, 1, 2].find((s) => st.target.indexOf(s) === -1);
      await tapFrac(page, SPOT_FX[safe], SPOT_FY);
    }
    await page.waitForTimeout(150);
    result = await page.evaluate(() => window.__sagaTest.last);
  }
  console.log(`[${label}] forest result:`, JSON.stringify(result));
  if (!result || !result.won) { console.error(`[${label}] forest FAILED to win via duck-to-safe-spot strategy`); anyFail = true; }

  await ctx.close();

  const filtered = errors.filter((e) => !e.includes('fonts.googleapis') && !e.includes('favicon') && !e.includes('net::ERR'));
  if (filtered.length) { console.error(`[${label}] page errors:`, JSON.stringify(filtered)); anyFail = true; }
}

await runViewport({ width: 390, height: 780 }, 'mobile');
await runViewport({ width: 1280, height: 800 }, 'desktop');

await browser.close();
server.close();

if (anyFail) { console.error('HEADLESS FAIL'); process.exit(1); }
console.log('HEADLESS PASS');
