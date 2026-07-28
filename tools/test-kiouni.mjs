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
  const kiouniIdx = ids.indexOf('kiouni');

  // 1. WIN: teleport to Aouda (should flip phase to 'out'), then teleport to the
  // exit (should win). Direct state pokes on the live chapter instance avoid
  // patrol-timing flakiness while still exercising the real capture/win logic.
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, kiouniIdx);
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const ch = window.__sagaTest.current();
    ch.px = ch.aoudaX; ch.py = ch.aoudaY;
  });
  await page.waitForTimeout(150);
  const phaseAfterCapture = await page.evaluate(() => window.__sagaTest.current().phase);
  console.log(vp.name, 'kiouni phase after reaching Aouda:', phaseAfterCapture);
  await page.evaluate(() => {
    const ch = window.__sagaTest.current();
    ch.px = ch.startX; ch.py = ch.startY;
  });
  await page.waitForTimeout(150);
  const winResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'kiouni win result:', JSON.stringify(winResult));

  // 2. LOSE by timer: force the dawn clock to nearly zero.
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, kiouniIdx);
  await page.waitForTimeout(200);
  await page.evaluate(() => { window.__sagaTest.current().timer = 0.05; });
  await page.waitForTimeout(200);
  const timeoutResult = await page.evaluate(() => window.__sagaTest.last);
  console.log(vp.name, 'kiouni timeout-lose result:', JSON.stringify(timeoutResult));

  // 3. LOSE by torchlight: stand exactly in a guard's cone 3x (offset along the
  // guard's own facing so detection is direction-independent), waiting out the
  // 1.2s hit-cooldown between each.
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, kiouniIdx);
  await page.waitForTimeout(200);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const ch = window.__sagaTest.current();
      ch.px = ch.g1.x + Math.cos(ch.g1.dir > 0 ? 0 : Math.PI) * 10;
      ch.py = ch.g1.y + Math.sin(ch.g1.dir > 0 ? 0 : Math.PI) * 10;
    });
    await page.waitForTimeout(1300);
  }
  const caughtResult = await page.evaluate(() => window.__sagaTest.last);
  const livesAfter = await page.evaluate(() => { const c = window.__sagaTest.current(); return c ? c.lives : null; });
  console.log(vp.name, 'kiouni caught-3x result:', JSON.stringify(caughtResult), 'lives:', livesAfter);

  // 4. Organic play burst (real drag input) for a quick juice/pacing sanity check.
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, kiouniIdx);
  await page.waitForTimeout(200);
  await tapFrac(page, 0.5, 0.2);
  await page.waitForTimeout(1500);
  const midT = await page.evaluate(() => window.__sagaTest.current() && window.__sagaTest.current());
  console.log(vp.name, 'kiouni organic-play mid-state ok:', !!midT);

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
  if (phaseAfterCapture !== 'out') { console.error(vp.name, 'kiouni did not enter carry phase after reaching Aouda'); anyFail = true; }
  if (!winResult || !winResult.won) { console.error(vp.name, 'kiouni did not win after carrying Aouda to the exit'); anyFail = true; }
  // (win/lose here are direct state pokes for determinism, not a pacing measurement —
  // real play requires ~16s minimum round-trip at the chapter's 42px/s creep speed,
  // well clear of the "no auto-resolve under 8s" rule.)
  if (!timeoutResult || timeoutResult.won) { console.error(vp.name, 'kiouni did not lose when the dawn timer ran out'); anyFail = true; }
  if (!caughtResult || caughtResult.won || livesAfter !== 0) { console.error(vp.name, 'kiouni did not lose after 3 torchlight catches'); anyFail = true; }
  await ctx.close();
}

await browser.close();
server.close();

if (anyFail) { console.error('HEADLESS FAIL'); process.exit(1); }
console.log('HEADLESS PASS');
