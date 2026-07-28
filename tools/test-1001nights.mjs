/* ============================================================================
 * test-1001nights.mjs — headless functional test for the rebuilt 1001nights
 * point-and-click branching adventure (REBUILD_QUEUE #25). Drives each of the
 * 5 chapters to a WIN via real pointer clicks against the fixed hit-rects in
 * game.js, plus one deliberate miss (Sinbad) to exercise the lose path, and
 * asserts zero pageerrors at both mobile and desktop viewports.
 * ============================================================================ */
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

// Coordinate constants mirrored from game.js (logical 270×480 canvas coords).
const FRAG_CARDS = [{ x: 51, y: 404 }, { x: 135, y: 404 }, { x: 219, y: 404 }];
const ISLANDS = [{ x: 52, y: 150 }, { x: 150, y: 118 }, { x: 222, y: 186 }, { x: 96, y: 250 }, { x: 186, y: 288 }];
const JARS = [{ x: 50, y: 170 }, { x: 135, y: 170 }, { x: 220, y: 170 }, { x: 50, y: 270 }, { x: 135, y: 270 }, { x: 220, y: 270 }];
const WISH_CARDS = [{ x: 135, y: 242 }, { x: 135, y: 316 }, { x: 135, y: 390 }];
const LAT_COLX = [40, 87, 134, 181, 228];
const LAT_ROWY = [150, 220, 290];

async function clickLogical(page, canvas, lx, ly) {
  const box = await canvas.boundingBox();
  const sx = box.width / 270, sy = box.height / 480;
  await canvas.click({ position: { x: lx * sx, y: ly * sy } });
}

async function runViewport(vp) {
  const errors = [];
  const page = await browser.newPage({ viewport: vp });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${PORT}/games/1001nights-magic/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);
  const hasHook = await page.evaluate(() => !!window.__sagaTest);
  if (!hasHook) throw new Error('no __sagaTest hook found');
  const canvas = page.locator('.re-canvas');
  const outcomes = [];

  // Chapter 0: scheherazade — click any fragment card repeatedly to win.
  await page.evaluate(() => { window.__sagaTest.last = null; window.__sagaTest.jump(0); });
  await page.waitForTimeout(150);
  for (let i = 0; i < 20; i++) {
    const last = await page.evaluate(() => window.__sagaTest.last);
    if (last) break;
    await clickLogical(page, canvas, FRAG_CARDS[i % 3].x, FRAG_CARDS[i % 3].y);
    await page.waitForTimeout(500);
  }
  outcomes.push(['scheherazade', await page.evaluate(() => window.__sagaTest.last)]);

  // Chapter 1: sinbad — one deliberate wrong tap (lose-path smoke), then a
  // fresh run following the shown sequence exactly to win.
  await page.evaluate(() => { window.__sagaTest.last = null; window.__sagaTest.jump(1); });
  await page.waitForTimeout(150);
  for (let tries = 0; tries < 20; tries++) {
    const st = await page.evaluate(() => { const c = window.__sagaTest.current(); return { phase: c.phase, seq: c.sequence }; });
    if (st.phase === 'input') {
      const wrong = st.seq[0] === 0 ? 1 : 0;
      await clickLogical(page, canvas, ISLANDS[wrong].x, ISLANDS[wrong].y);
      break;
    }
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(400);
  const missState = await page.evaluate(() => { const c = window.__sagaTest.current(); return { lives: c.lives }; });
  if (missState.lives !== 2) throw new Error('sinbad wrong-tap did not cost a life: ' + JSON.stringify(missState));
  await page.evaluate(() => { window.__sagaTest.last = null; window.__sagaTest.jump(1); });
  await page.waitForTimeout(150);
  for (let i = 0; i < 220; i++) {
    const last = await page.evaluate(() => window.__sagaTest.last);
    if (last) break;
    const st = await page.evaluate(() => { const c = window.__sagaTest.current(); return { phase: c.phase, seq: c.sequence, idx: c.inputIdx }; });
    if (st.phase === 'input') {
      const target = ISLANDS[st.seq[st.idx]];
      await clickLogical(page, canvas, target.x, target.y);
      await page.waitForTimeout(220);
    } else {
      await page.waitForTimeout(120);
    }
  }
  outcomes.push(['sinbad', await page.evaluate(() => window.__sagaTest.last)]);

  // Chapter 2: alibaba — wait for the hunt phase, tap the true jars in order.
  await page.evaluate(() => { window.__sagaTest.last = null; window.__sagaTest.jump(2); });
  await page.waitForTimeout(150);
  for (let i = 0; i < 60; i++) {
    const last = await page.evaluate(() => window.__sagaTest.last);
    if (last) break;
    const st = await page.evaluate(() => { const c = window.__sagaTest.current(); return { phase: c.phase, trueIdx: c.trueIdx, found: c.foundIdx }; });
    if (st.phase === 'hunt') {
      const next = st.trueIdx.find((i) => !st.found.includes(i));
      if (next !== undefined) {
        await clickLogical(page, canvas, JARS[next].x, JARS[next].y);
        await page.waitForTimeout(250);
        continue;
      }
    }
    await page.waitForTimeout(150);
  }
  outcomes.push(['alibaba', await page.evaluate(() => window.__sagaTest.last)]);

  // Chapter 3: aladdin — always pick the safe (index 0) option, 6 rounds.
  await page.evaluate(() => { window.__sagaTest.last = null; window.__sagaTest.jump(3); });
  await page.waitForTimeout(150);
  for (let i = 0; i < 8; i++) {
    const last = await page.evaluate(() => window.__sagaTest.last);
    if (last) break;
    await clickLogical(page, canvas, WISH_CARDS[0].x, WISH_CARDS[0].y);
    await page.waitForTimeout(800);
  }
  outcomes.push(['aladdin', await page.evaluate(() => window.__sagaTest.last)]);

  // Chapter 4: carpet — each leg, pick a non-storm node in the current column.
  await page.evaluate(() => { window.__sagaTest.last = null; window.__sagaTest.jump(4); });
  await page.waitForTimeout(150);
  for (let i = 0; i < 8; i++) {
    const last = await page.evaluate(() => window.__sagaTest.last);
    if (last) break;
    const st = await page.evaluate(() => { const c = window.__sagaTest.current(); return { col: c.col, nodes: c.nodes[c.col] }; });
    const pick = st.nodes.find((n) => n.type !== 'storm') || st.nodes[0];
    await clickLogical(page, canvas, LAT_COLX[st.col], LAT_ROWY[pick.row]);
    await page.waitForTimeout(1050);
  }
  outcomes.push(['carpet', await page.evaluate(() => window.__sagaTest.last)]);

  await page.close();
  return { errors, outcomes };
}

const mobile = await runViewport({ width: 390, height: 780 });
const desktop = await runViewport({ width: 1280, height: 800 });

console.log('mobile outcomes:', JSON.stringify(mobile.outcomes));
console.log('desktop outcomes:', JSON.stringify(desktop.outcomes));
console.log('mobile errors:', JSON.stringify(mobile.errors));
console.log('desktop errors:', JSON.stringify(desktop.errors));

await browser.close();
server.close();

const allErrors = [...mobile.errors, ...desktop.errors];
const allWon = [...mobile.outcomes, ...desktop.outcomes].every(([, o]) => o && o.won);
if (allErrors.length > 0) {
  console.error('HEADLESS FAIL: page errors');
  process.exit(1);
} else if (!allWon) {
  console.error('HEADLESS FAIL: not every chapter reached a win');
  process.exit(1);
} else {
  console.log('HEADLESS PASS');
}
