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

// Marley's Chains lays out its 4 link buttons in a 2x2 grid at fractional
// canvas coords (game canvas is 270x480) — centers of each button.
const BTN_FRAC = [
  { fx: (11 + 60) / 270, fy: (170 + 47) / 480 },  // 0 box
  { fx: (139 + 60) / 270, fy: (170 + 47) / 480 }, // 1 ledger
  { fx: (11 + 60) / 270, fy: (275 + 47) / 480 },  // 2 lock
  { fx: (139 + 60) / 270, fy: (275 + 47) / 480 }, // 3 purse
];

// With Math.random pinned to 0.5, every Math.floor(Math.random()*4) === 2,
// so the whole chain is the 'lock' link at every position/round.
const STEP = 0.62, ON = 0.42, ROUND_PAUSE = 0.5, needRounds = 4;
function watchMs(len) { return Math.ceil((len * STEP + 0.3 + 0.35) * 1000); }

const viewports = [{ name: '390x780 mobile', width: 390, height: 780 }, { name: '1280x800 desktop', width: 1280, height: 800 }];
let anyFail = false;

for (const vp of viewports) {
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
  const marleyIdx = ids.indexOf('marley');
  if (marleyIdx < 0) { console.error(vp.name, 'no "marley" chapter found'); anyFail = true; continue; }

  // --- WIN: reproduce all 4 rounds of the (all-'lock') chain in order ---
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, marleyIdx);
  let seqLen = 3;
  let winResult = null;
  for (let round = 0; round < needRounds && !winResult; round++) {
    await page.waitForTimeout(watchMs(seqLen));
    for (let i = 0; i < seqLen; i++) {
      await tapFrac(page, BTN_FRAC[2].fx, BTN_FRAC[2].fy); // always the 'lock' button
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(Math.ceil(ROUND_PAUSE * 1000) + 150);
    winResult = await page.evaluate(() => window.__sagaTest.last);
    seqLen++;
  }
  console.log(vp.name, 'marley WIN result after 4 correct rounds:', JSON.stringify(winResult));

  // --- LOSE: tap the wrong link 3 times in a row ---
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, marleyIdx);
  let loseResult = null;
  for (let i = 0; i < 3 && !loseResult; i++) {
    await page.waitForTimeout(watchMs(3));
    await tapFrac(page, BTN_FRAC[0].fx, BTN_FRAC[0].fy); // always the wrong ('box') button
    await page.waitForTimeout(150);
    loseResult = await page.evaluate(() => window.__sagaTest.last);
  }
  console.log(vp.name, 'marley LOSE result after 3 wrong taps:', JSON.stringify(loseResult));

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
  if (!winResult || !winResult.won) { console.error(vp.name, 'marley chapter did not win after 4 correct rounds'); anyFail = true; }
  if (!loseResult || loseResult.won) { console.error(vp.name, 'marley chapter did not lose after 3 wrong taps'); anyFail = true; }
  await ctx.close();
}

await browser.close();
server.close();

if (anyFail) { console.error('HEADLESS FAIL'); process.exit(1); }
console.log('HEADLESS PASS');
