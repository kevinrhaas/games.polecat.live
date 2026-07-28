import http from 'node:http';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8199;

const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon' };

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p.endsWith('/')) p += 'index.html';
  const full = path.join(ROOT, p);
  const ext = path.extname(full);
  res.setHeader('Content-Type', MIME[ext] || 'text/plain');
  createReadStream(full).on('error', () => { res.statusCode = 404; res.end(); }).pipe(res);
});
await new Promise(r => server.listen(PORT, r));

const { chromium } = await import('playwright');
const exe = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium';
let browser;
try { browser = await chromium.launch({ executablePath: exe }); }
catch { browser = await chromium.launch(); }

const page = await browser.newPage({ viewport: { width: 400, height: 820 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));

await page.goto(`http://localhost:${PORT}/games/notld-survive/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.waitForTimeout(600);

// Jump straight into chapter index 3 (THE NIGHT SIEGE) via the saga test hook.
await page.evaluate(() => { window.__sagaTest.last = null; window.__sagaTest.jump(3); });
await page.waitForTimeout(200);

const box = await page.locator('.re-canvas').boundingBox();
const sx = box.width / 270, sy = box.height / 480;
const toPage = (gx, gy) => ({ x: box.x + gx * sx, y: box.y + gy * sy });

async function dragDefender(idx, targetGameX, targetGameY) {
  // Real drags span many animation frames; pace the synthetic events with
  // small waits so the rAF-gated pointer state machine sees a down frame
  // (at the grab point) distinct from the later move/up frames — firing
  // down+move+up back-to-back can collapse into one update() tick, where
  // justDown and justUp both read the FINAL position and the grab misses.
  const s0 = await page.evaluate((i) => window.__sagaTest.current().defenders[i], idx);
  const from = toPage(s0.x, s0.y);
  const to = toPage(targetGameX, targetGameY);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.waitForTimeout(60);
  await page.mouse.move(to.x, to.y, { steps: 6 });
  await page.waitForTimeout(60);
  await page.mouse.up();
  await page.waitForTimeout(100);
}

async function tapPoint(gx, gy) {
  const p = toPage(gx, gy);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(100);
}

// --- Verify initial state ---
let state = await page.evaluate(() => window.__sagaTest.current());
console.log('initial ammo:', state.ammo, 'defenders:', state.defenders.map(d => d.station));
if (state.ammo !== 6) throw new Error('expected ammoMax start of 6, got ' + state.ammo);
if (state.defenders.some(d => d.station !== -1)) throw new Error('defenders should start unstationed');

// --- Drag HARRY onto window 0, TOM onto door 1 ---
const p0 = state.pts[0], p1 = state.pts[1];
await dragDefender(0, p0.x + p0.w / 2, p0.y + p0.h / 2);
await dragDefender(1, p1.x + p1.w / 2, p1.y + p1.h / 2);

state = await page.evaluate(() => window.__sagaTest.current());
console.log('after drag: pts.defender =', state.pts.map(p => p.defender), 'defenders.station =', state.defenders.map(d => d.station));
if (state.pts[0].defender !== 0) throw new Error('HARRY did not station at point 0');
if (state.pts[1].defender !== 1) throw new Error('TOM did not station at point 1');
if (state.defenders[0].station !== 0 || state.defenders[1].station !== 1) throw new Error('defender station bookkeeping wrong');

// --- Fire rationed ammo at the undefended point 2 ---
const p2 = state.pts[2];
const ammoBefore = state.ammo;
await tapPoint(p2.x + p2.w / 2, p2.y + p2.h / 2);
state = await page.evaluate(() => window.__sagaTest.current());
console.log('after ammo shot: ammo=', state.ammo, 'pt2.pressure=', state.pts[2].pressure);
if (state.ammo !== ammoBefore - 1) throw new Error('ammo did not decrement on shot, was ' + ammoBefore + ' now ' + state.ammo);
if (state.pts[2].pressure > 5) throw new Error('shot did not clear pressure at point 2, got ' + state.pts[2].pressure);

// --- Exhaust ammo, verify it floors at 0 and stops decrementing ---
for (let i = 0; i < 6; i++) await tapPoint(p2.x + p2.w / 2, p2.y + p2.h / 2);
state = await page.evaluate(() => window.__sagaTest.current());
console.log('ammo after exhausting:', state.ammo);
if (state.ammo !== 0) throw new Error('ammo should floor at 0, got ' + state.ammo);

// --- Pick HARRY back up (drag off window 0) and confirm the point un-defends ---
await dragDefender(0, 135, 358);
state = await page.evaluate(() => window.__sagaTest.current());
console.log('after pickup: pt0.defender=', state.pts[0].defender, 'harry.station=', state.defenders[0].station);
if (state.pts[0].defender !== -1) throw new Error('point 0 should be vacated after picking HARRY back up');
if (state.defenders[0].station !== -1) throw new Error('HARRY should be unstationed while carried');
// release over empty ground (not a point) — should return home, not re-station
await page.mouse.up().catch(() => {});
state = await page.evaluate(() => window.__sagaTest.current());
console.log('harry after release on empty ground: station=', state.defenders[0].station);

// Re-station HARRY at point 0 for the remainder of the run.
await dragDefender(0, p0.x + p0.w / 2, p0.y + p0.h / 2);

// --- Let the chapter play out to a natural end (win or lose), reinforcing as needed ---
let outcome = null;
let iterations = 0;
while (iterations++ < 200) {
  const last = await page.evaluate(() => window.__sagaTest.last);
  if (last) { outcome = last; break; }
  const s = await page.evaluate(() => window.__sagaTest.current());
  if (!s || !s.pts) { await page.waitForTimeout(150); continue; }
  // Keep point 2 (unstationed) from breaching once ammo regenerates via chapter reset — it won't
  // mid-chapter (ammo is rationed, not regenerating), so just let danger ride; only re-station
  // any defender that got knocked back to base.
  for (let d = 0; d < s.defenders.length; d++) {
    if (s.defenders[d].station === -1 && d !== s._dragTest) {
      const target = s.pts[d === 0 ? 0 : 1];
      if (target.defender === -1 && target.bTimer <= 0) {
        await dragDefender(d, target.x + target.w / 2, target.y + target.h / 2);
      }
    }
  }
  await page.waitForTimeout(200);
}
console.log('outcome:', JSON.stringify(outcome));
console.log('page errors:', JSON.stringify(errors));

await browser.close();
server.close();

if (errors.length > 0) {
  console.error('HEADLESS FAIL: page errors');
  process.exit(1);
} else if (!outcome) {
  console.error('HEADLESS FAIL: chapter never reached an end state');
  process.exit(1);
} else {
  console.log('HEADLESS PASS (won=' + outcome.won + ')');
}
