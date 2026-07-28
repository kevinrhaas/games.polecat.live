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
  const ext = path.extname(full);
  res.setHeader('Content-Type', MIME[ext] || 'text/plain');
  createReadStream(full).on('error', () => { res.statusCode = 404; res.end(); }).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

const { chromium } = await import('playwright');
const exe = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium';
let browser;
try { browser = await chromium.launch({ executablePath: exe }); }
catch { browser = await chromium.launch(); }

// Dispatch a synthetic mousedown/mouseup pair at a FRACTION of the canvas's
// own bounding box — reliable for hitting exact in-canvas UI rects headless.
async function tapFrac(page, fx, fy) {
  await page.evaluate(([fx, fy]) => {
    const cv = document.querySelector('.re-canvas');
    const r = cv.getBoundingClientRect();
    const x = r.left + r.width * fx, y = r.top + r.height * fy;
    cv.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, bubbles: true }));
    cv.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, bubbles: true }));
  }, [fx, fy]);
}

const FAST = 0.78, SAFE = 0.88; // fractions matching the two choiceRects

async function pickRoute(page, frac) {
  await tapFrac(page, 0.5, frac);
  await page.waitForTimeout(1100); // feedback holds 0.9s
}

const viewports = [{ name: '390x780 mobile', width: 390, height: 780 }, { name: '1280x800 desktop', width: 1280, height: 800 }];
let anyFail = false;

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(`http://localhost:${PORT}/games/around80days-race/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(600);

  const ids = await page.evaluate(() => window.__sagaTest.chapters);
  console.log(vp.name, 'chapters:', ids.join(', '));
  const mongoliaIdx = ids.indexOf('mongolia');

  // All-STEAM (fast) 4x should exhaust the coal reserve (70 - 22-24-20-18 = -14) and lose
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, mongoliaIdx);
  await page.waitForTimeout(300);
  for (let i = 0; i < 4; i++) await pickRoute(page, FAST);
  const allFastResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'mongolia all-STEAM result:', JSON.stringify(allFastResult));

  // All-SAFE 4x should blow the 6-day budget (2+2+2+2=8) and lose on the last leg
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, mongoliaIdx);
  await page.waitForTimeout(300);
  for (let i = 0; i < 4; i++) await pickRoute(page, SAFE);
  const allSafeResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'mongolia all-SAFE result:', JSON.stringify(allSafeResult));

  // FAST, FAST, SAFE(refuel), FAST: days=1+1+2+1=5<=6, coal=70-22-24+10-18=16>=0 — should win
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, mongoliaIdx);
  await page.waitForTimeout(300);
  await pickRoute(page, FAST); await pickRoute(page, FAST); await pickRoute(page, SAFE); await pickRoute(page, FAST);
  const winResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'mongolia FAST/FAST/SAFE/FAST result:', JSON.stringify(winResult));

  // quick smoke of every chapter (jump + a little input, check no crash)
  for (let i = 0; i < ids.length; i++) {
    await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, i);
    await page.waitForTimeout(300);
    await tapFrac(page, 0.5, 0.6);
    await page.waitForTimeout(150);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(150);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
  }

  const filtered = errors.filter((e) => !e.includes('fonts.googleapis') && !e.includes('net::ERR'));
  console.log(vp.name, 'errors:', JSON.stringify(filtered));
  if (filtered.length) anyFail = true;
  if (!allFastResult || allFastResult.won) { console.error(vp.name, 'mongolia did not lose after 4 STEAM picks (coal should run dry)'); anyFail = true; }
  if (!allSafeResult || allSafeResult.won) { console.error(vp.name, 'mongolia did not lose after 4 SAFE picks (day budget should overrun)'); anyFail = true; }
  if (!winResult || !winResult.won) { console.error(vp.name, 'mongolia did not win on FAST/FAST/SAFE/FAST'); anyFail = true; }
  await ctx.close();
}

await browser.close();
server.close();

if (anyFail) { console.error('HEADLESS FAIL'); process.exit(1); }
console.log('HEADLESS PASS');
