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

async function tapFrac(page, fx, fy) {
  await page.evaluate(([fx, fy]) => {
    const cv = document.querySelector('.re-canvas');
    const r = cv.getBoundingClientRect();
    const x = r.left + r.width * fx, y = r.top + r.height * fy;
    cv.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, bubbles: true }));
    cv.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, bubbles: true }));
  }, [fx, fy]);
}

// Grab whatever gift is near (fx0,fy0), drag it to (fx1,fy1), hold briefly
// for the carry-lerp to converge, then release.
async function dragTo(page, fx0, fy0, fx1, fy1) {
  await page.evaluate(([fx0, fy0]) => {
    const cv = document.querySelector('.re-canvas');
    const r = cv.getBoundingClientRect();
    const x0 = r.left + r.width * fx0, y0 = r.top + r.height * fy0;
    cv.dispatchEvent(new MouseEvent('mousedown', { clientX: x0, clientY: y0, bubbles: true }));
  }, [fx0, fy0]);
  await page.waitForTimeout(80); // let a frame process the grab at the ORIGINAL position before we move it
  await page.evaluate(([fx1, fy1]) => {
    const cv = document.querySelector('.re-canvas');
    const r = cv.getBoundingClientRect();
    const x1 = r.left + r.width * fx1, y1 = r.top + r.height * fy1;
    cv.dispatchEvent(new MouseEvent('mousemove', { clientX: x1, clientY: y1, bubbles: true }));
  }, [fx1, fy1]);
  await page.waitForTimeout(350); // let the carry-lerp converge
  await page.evaluate(([fx1, fy1]) => {
    const cv = document.querySelector('.re-canvas');
    const r = cv.getBoundingClientRect();
    const x1 = r.left + r.width * fx1, y1 = r.top + r.height * fy1;
    cv.dispatchEvent(new MouseEvent('mouseup', { clientX: x1, clientY: y1, bubbles: true }));
  }, [fx1, fy1]);
  await page.waitForTimeout(80); // let a frame process the release before we read game state
}

const viewports = [{ name: '390x780 mobile', width: 390, height: 780 }, { name: '1280x800 desktop', width: 1280, height: 800 }];
let anyFail = false;

for (const vp of viewports) {
  // Deterministic context: pin Math.random so every gift is a known kind
  // ('table', index 1 of 3) spawned dead-center (x=135 of 270) — the same
  // column as the TABLE bin, so no horizontal steering is needed to test
  // correct-bin routing; we steer sideways only for the wrong-bin lose case.
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  await ctx.addInitScript(() => { Math.random = () => 0.5; });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(`http://localhost:${PORT}/games/scrooge-carol/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(600);
  await tapFrac(page, 0.5, 0.5); // boot tap
  await page.waitForTimeout(400);

  const ids = await page.evaluate(() => window.__sagaTest.chapters);
  const presentIdx = ids.indexOf('present');
  if (presentIdx < 0) { console.error(vp.name, 'no "present" chapter found'); anyFail = true; continue; }

  // --- WIN: sort 14 gifts into the correct (TABLE) bin ---
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, presentIdx);
  await page.waitForTimeout(200);
  let winResult = null;
  for (let i = 0; i < 14 && !winResult; i++) {
    await page.waitForTimeout(950); // let the next gift spawn near the top
    await dragTo(page, 0.5, 0.0, 0.5, 0.9); // grab near top-center, carry down into the TABLE bin (same column)
    winResult = await page.evaluate(() => window.__sagaTest.last);
  }
  console.log(vp.name, 'present WIN result after sorting into TABLE:', JSON.stringify(winResult));

  // --- LOSE: sort 5 gifts into the wrong (TINY TIM) bin ---
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, presentIdx);
  await page.waitForTimeout(200);
  let loseResult = null;
  for (let i = 0; i < 5 && !loseResult; i++) {
    await page.waitForTimeout(950);
    await dragTo(page, 0.5, 0.0, 0.16, 0.9); // grab near top-center, carry into the wrong (TINY TIM) bin
    loseResult = await page.evaluate(() => window.__sagaTest.last);
  }
  console.log(vp.name, 'present LOSE result after sorting into wrong bin:', JSON.stringify(loseResult));

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
  if (!winResult || !winResult.won) { console.error(vp.name, 'present chapter did not win after 14 correct sorts'); anyFail = true; }
  if (!loseResult || loseResult.won) { console.error(vp.name, 'present chapter did not lose after 5 wrong sorts'); anyFail = true; }
  await ctx.close();
}

await browser.close();
server.close();

if (anyFail) { console.error('HEADLESS FAIL'); process.exit(1); }
console.log('HEADLESS PASS');
