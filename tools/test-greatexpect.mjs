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

  // exercise 'thames': 4 BOLD picks in a row should raise suspicion past
  // the cap and trigger a loss (22 x 4 = 88 >= 70)
  const thamesIdx = ids.indexOf('thames');
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, thamesIdx);
  await page.waitForTimeout(300);
  for (let round = 0; round < 4; round++) {
    await tapFrac(page, 0.5, 0.88);             // second (BOLD) choice rect
    await page.waitForTimeout(1100);            // feedback holds 0.9s
  }
  const thamesLoseResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'thames result after 4 bold taps:', JSON.stringify(thamesLoseResult));

  // then: QUIET, QUIET, BOLD, BOLD should stay under the cap (44 suspicion) and win
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, thamesIdx);
  await page.waitForTimeout(300);
  await tapFrac(page, 0.5, 0.78); await page.waitForTimeout(1100);  // QUIET
  await tapFrac(page, 0.5, 0.78); await page.waitForTimeout(1100);  // QUIET
  await tapFrac(page, 0.5, 0.88); await page.waitForTimeout(1100);  // BOLD
  await tapFrac(page, 0.5, 0.88); await page.waitForTimeout(1100);  // BOLD
  const thamesWinResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'thames result after quiet/quiet/bold/bold:', JSON.stringify(thamesWinResult));

  // exercise 'marshes': 4 BOLD picks in a row should raise alarm past the
  // cap and trigger a loss (20 x 4 = 80 >= 65)
  const marshesIdx = ids.indexOf('marshes');
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, marshesIdx);
  await page.waitForTimeout(300);
  for (let round = 0; round < 4; round++) {
    await tapFrac(page, 0.5, 0.88);             // second (BOLD) choice rect
    await page.waitForTimeout(1100);            // feedback holds 0.9s
  }
  const marshesLoseResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'marshes result after 4 bold taps:', JSON.stringify(marshesLoseResult));

  // then: QUIET, QUIET, BOLD, BOLD should stay under the cap (40 alarm) and win
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, marshesIdx);
  await page.waitForTimeout(300);
  await tapFrac(page, 0.5, 0.78); await page.waitForTimeout(1100);  // QUIET
  await tapFrac(page, 0.5, 0.78); await page.waitForTimeout(1100);  // QUIET
  await tapFrac(page, 0.5, 0.88); await page.waitForTimeout(1100);  // BOLD
  await tapFrac(page, 0.5, 0.88); await page.waitForTimeout(1100);  // BOLD
  const marshesWinResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'marshes result after quiet/quiet/bold/bold:', JSON.stringify(marshesWinResult));

  // exercise 'wharf': round-robin a guess across LEFT/CENTER/RIGHT each
  // telegraph (can't know which side Compeyson picks — it's randomized) and
  // confirm the reactive grip-read duel actually reaches a result (hit and
  // miss both drive state; either a win or a loss is a valid outcome here).
  const wharfIdx = ids.indexOf('wharf');
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, wharfIdx);
  await page.waitForTimeout(300);
  const zoneFrac = [0.16, 0.5, 0.84];
  let wharfResult = null;
  for (let round = 0; round < 20 && !wharfResult; round++) {
    await page.waitForTimeout(200);
    await tapFrac(page, zoneFrac[round % 3], 0.86);
    await page.waitForTimeout(900);
    wharfResult = await page.evaluate(() => window.__sagaTest.last);
  }
  console.log(vp.name, 'wharf result after round-robin zone taps:', JSON.stringify(wharfResult));
  if (!wharfResult) { console.error(vp.name, 'wharf chapter never reached a result'); anyFail = true; }

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
  if (!thamesLoseResult || thamesLoseResult.won) { console.error(vp.name, 'thames chapter did not lose after 4 bold picks'); anyFail = true; }
  if (!thamesWinResult || !thamesWinResult.won) { console.error(vp.name, 'thames chapter did not win after quiet/quiet/bold/bold'); anyFail = true; }
  if (!marshesLoseResult || marshesLoseResult.won) { console.error(vp.name, 'marshes chapter did not lose after 4 bold picks'); anyFail = true; }
  if (!marshesWinResult || !marshesWinResult.won) { console.error(vp.name, 'marshes chapter did not win after quiet/quiet/bold/bold'); anyFail = true; }
  await ctx.close();
}

await browser.close();
server.close();

if (anyFail) { console.error('HEADLESS FAIL'); process.exit(1); }
console.log('HEADLESS PASS');
