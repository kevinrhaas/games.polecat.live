/* Headless functional test for the rebuilt snowwhite-apple HI-HO MINE chapter:
 * it used to be a catch-gems/dodge-boulders lane game (one of the queue's "3
 * dodge lanes"); now it's a resource-management chapter — tap a shaft to send
 * an idle dwarf in, tap again to pull him out before instability caves the
 * shaft in. Drives a rotate-in/rotate-out strategy across all three shafts and
 * asserts it can actually be won, plus a zero-pageerror pass on both viewports. */
import http from 'node:http';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8199;
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

const SHAFT_FX = [0.2, 0.5, 0.8];
const SHAFT_FY = 0.27;

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
  const mineIdx = ids.indexOf('mine');
  await page.evaluate((i) => { window.__sagaTest.last = null; window.__sagaTest.jump(i); }, mineIdx);
  await page.waitForTimeout(200);

  // rotate-in / rotate-out strategy: send all 3 dwarfs in, work ~5s (well
  // under the ~8s idle-collapse point), pull all 3 out, let instability
  // decay ~3s, repeat until a result lands.
  let result = null;
  for (let cycle = 0; cycle < 12 && !result; cycle++) {
    for (const fx of SHAFT_FX) { await tapFrac(page, fx, SHAFT_FY); await page.waitForTimeout(80); }
    await page.waitForTimeout(5000);
    for (const fx of SHAFT_FX) { await tapFrac(page, fx, SHAFT_FY); await page.waitForTimeout(80); }
    await page.waitForTimeout(3000);
    result = await page.evaluate(() => window.__sagaTest.last);
  }
  console.log(`[${label}] mine result:`, JSON.stringify(result));
  if (!result || !result.won) { console.error(`[${label}] mine FAILED to win via rotate-in/out strategy`); anyFail = true; }

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
