/* Headless functional test for the rebuilt snowwhite-apple POISONED APPLE
 * chapter: it used to be a dodge/catch-falling-apples lane game (one of the
 * queue's "3 dodge lanes"); now it's the Queen's potion-brewing crafting
 * puzzle — tap jars to add the EXACT recipe amounts to the cauldron before
 * the timer runs out or too many mismatched taps spend all 3 lives. Drives
 * a read-state/tap-the-right-jar loop and asserts it can actually be won,
 * plus a zero-pageerror pass on both viewports. */
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

async function tapFrac(page, fx, fy) {
  await page.evaluate(([fx, fy]) => {
    const cv = document.querySelector('.re-canvas');
    const r = cv.getBoundingClientRect();
    const x = r.left + r.width * fx, y = r.top + r.height * fy;
    cv.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, bubbles: true }));
    cv.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, bubbles: true }));
  }, [fx, fy]);
}

const JAR_FX = [38 / 270, 106 / 270, 174 / 270, 242 / 270];
const JAR_FY = 350 / 480;

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
  const appleIdx = ids.indexOf('apple');
  await page.evaluate((i) => { window.__sagaTest.last = null; window.__sagaTest.jump(i); }, appleIdx);
  await page.waitForTimeout(200);

  // brew-the-exact-recipe strategy: read the live chapter state each round,
  // tap only jars that still need more of their target, one at a time.
  let result = null;
  for (let round = 0; round < 40 && !result; round++) {
    const st = await page.evaluate(() => {
      const c = window.__sagaTest.current();
      return { active: c.active, have: c.have, target: c.target };
    });
    let tapped = false;
    for (const i of st.active) {
      if (st.have[i] < st.target[i]) {
        await tapFrac(page, JAR_FX[i], JAR_FY);
        tapped = true;
        await page.waitForTimeout(120);
        break;
      }
    }
    if (!tapped) await page.waitForTimeout(120);
    result = await page.evaluate(() => window.__sagaTest.last);
  }
  console.log(`[${label}] apple result:`, JSON.stringify(result));
  if (!result || !result.won) { console.error(`[${label}] apple FAILED to win via exact-recipe strategy`); anyFail = true; }

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
