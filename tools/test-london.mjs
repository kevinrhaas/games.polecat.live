/* Headless functional test for the rebuilt around80days-race "London in Time"
 * leg (REBUILD_QUEUE #15, final of the saga's three interchangeable dodge
 * lanes): now an "urge the horses" rhythm chapter — tap in time with GOLD
 * beats sliding into the reins zone, hold off on RED ones. Direct state pokes
 * on the live chapter instance (same pattern as test-kiouni.mjs) drive the
 * win/lose/hit logic deterministically; a real synthetic tap exercises the
 * actual api.confirm() input path. */
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

async function tapFrac(page, fx, fy) {
  await page.evaluate(([fx, fy]) => {
    const cv = document.querySelector('.re-canvas');
    const r = cv.getBoundingClientRect();
    const x = r.left + r.width * fx, y = r.top + r.height * fy;
    cv.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, bubbles: true }));
    cv.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, bubbles: true }));
  }, [fx, fy]);
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
  const londonIdx = ids.indexOf('london');

  // 1. WIN: teleport distance to the finish line.
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, londonIdx);
  await page.waitForTimeout(200);
  await page.evaluate(() => { window.__sagaTest.current().dist = window.__sagaTest.current().need; });
  await page.waitForTimeout(200);
  const winResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'london win result:', JSON.stringify(winResult));

  // 2. LOSE by clock: force the countdown to nearly zero.
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, londonIdx);
  await page.waitForTimeout(200);
  await page.evaluate(() => { window.__sagaTest.current().timer = 0.05; });
  await page.waitForTimeout(200);
  const timeoutResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'london timeout-lose result:', JSON.stringify(timeoutResult));

  // 3. A GOLD beat sitting in the reins zone, tapped, should build combo + distance.
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, londonIdx);
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const ch = window.__sagaTest.current();
    ch.beats = [{ x: ch.hitX, kind: 'gold', judged: false }]; ch.combo = 0;
  });
  const distBefore = await page.evaluate(() => window.__sagaTest.current().dist);
  await tapFrac(page, 0.5, 0.5);
  await page.waitForTimeout(100);
  const afterGold = await page.evaluate(() => { const ch = window.__sagaTest.current(); return { combo: ch.combo, dist: ch.dist, beats: ch.beats.length }; });
  console.log(vp.name, 'london gold-beat hit:', JSON.stringify(afterGold), 'distBefore:', distBefore);

  // 4. A RED beat sitting in the reins zone, tapped, should reset combo and cost time.
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, londonIdx);
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const ch = window.__sagaTest.current();
    ch.beats = [{ x: ch.hitX, kind: 'red', judged: false }]; ch.combo = 5; ch.timer = 20;
  });
  await tapFrac(page, 0.5, 0.5);
  await page.waitForTimeout(100);
  const afterRed = await page.evaluate(() => { const ch = window.__sagaTest.current(); return { combo: ch.combo, timer: ch.timer }; });
  console.log(vp.name, 'london red-beat hit:', JSON.stringify(afterRed));

  // quick smoke of every chapter in the game (jump + a little input, check no crash)
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
  if (!winResult || !winResult.won) { console.error(vp.name, 'london did not win once distance reached the finish'); anyFail = true; }
  if (!timeoutResult || timeoutResult.won) { console.error(vp.name, 'london did not lose when the clock ran out'); anyFail = true; }
  if (afterGold.combo !== 1 || afterGold.dist <= distBefore || afterGold.beats !== 0) { console.error(vp.name, 'london gold beat did not register as a correct hit', JSON.stringify(afterGold)); anyFail = true; }
  if (afterRed.combo !== 0 || afterRed.timer >= 20) { console.error(vp.name, 'london red beat did not penalize the tap', JSON.stringify(afterRed)); anyFail = true; }
  await ctx.close();
}

await browser.close();
server.close();

if (anyFail) { console.error('HEADLESS FAIL'); process.exit(1); }
console.log('HEADLESS PASS');
