import http from 'node:http';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8196;

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
// own bounding box — more reliable than page.mouse.click() for hitting exact
// in-canvas UI rects under headless Chromium.
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

  await page.goto(`http://localhost:${PORT}/games/greatexpect-pip/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(600);

  await tapFrac(page, 0.5, 0.5);
  await page.waitForTimeout(500);
  console.log(vp.name, 'scene after boot tap:', await page.evaluate(() => window.__sagaScene));

  const ids = await page.evaluate(() => window.__sagaTest.chapters);
  console.log(vp.name, 'chapters:', ids.join(', '));

  // exercise 'satis' specifically: tap the first choice button through all 5 rounds
  const satisIdx = ids.indexOf('satis');
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, satisIdx);
  await page.waitForTimeout(300);
  for (let round = 0; round < 5; round++) {
    await tapFrac(page, 0.5, 0.78);            // first choice rect (y: H-130..H-86)
    await page.waitForTimeout(1100);           // feedback holds 0.9s — wait it out before the next tap
  }
  const satisResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'satis result after 5 taps:', JSON.stringify(satisResult));

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
  if (!satisResult || !satisResult.won) { console.error(vp.name, 'satis chapter did not win after 5 valid taps'); anyFail = true; }
  await ctx.close();
}

await browser.close();
server.close();

if (anyFail) { console.error('HEADLESS FAIL'); process.exit(1); }
console.log('HEADLESS PASS');
