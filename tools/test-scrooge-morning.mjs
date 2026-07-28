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

// Read the live 'morning' chapter instance's state via the __sagaTest.current() hook.
async function readState(page) {
  return page.evaluate(() => {
    const ch = window.__sagaTest.current();
    if (!ch) return null;
    return {
      phase: ch.phase, onGround: ch.onGround, scrX: ch.scrX, dist: ch.dist, lives: ch.lives,
      obstacles: (ch.obstacles || []).map((o) => o.x),
      verb: ch.phase === 'station' ? ch.checklist[ch.stationIdx].verb : null,
      barPos: ch.barPos, beatPhase: ch.beatPhase, beatPeriod: ch.beatPeriod,
      checklist: ch.checklist ? ch.checklist.map((c) => ({ key: c.key, done: c.done, hit: c.hit })) : null,
    };
  });
}

// Drive one full playthrough: reactive jump-dodge in the run phase, verb-aware
// taps during each checklist station. Returns { last, finalState }.
async function playToEnd(page, budgetMs) {
  const t0 = Date.now();
  let last = null, st = null;
  while (!last && Date.now() - t0 < budgetMs) {
    st = await readState(page);
    if (!st) break;
    if (st.phase === 'station') {
      let doTap = false;
      if (st.verb === 'tap') doTap = true; // shutter opens on a short repeating cycle; keep tapping
      else if (st.verb === 'bar') doTap = st.barPos >= 0.6 && st.barPos <= 0.92;
      else if (st.verb === 'rhythm') doTap = Math.abs(st.beatPhase - st.beatPeriod * 0.5) < 0.12;
      if (doTap) await tapFrac(page, 0.5, 0.5);
      await page.waitForTimeout(30);
    } else {
      const near = st.obstacles.some((x) => x - st.scrX > 4 && x - st.scrX < 60);
      if (st.onGround && near) await tapFrac(page, 0.5, 0.5);
      await page.waitForTimeout(35);
    }
    last = await page.evaluate(() => window.__sagaTest.last);
  }
  return { last, finalState: st };
}

const viewports = [{ name: '390x780 mobile', width: 390, height: 780 }, { name: '1280x800 desktop', width: 1280, height: 800 }];
let anyFail = false;

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(`http://localhost:${PORT}/games/scrooge-carol/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(600);
  await tapFrac(page, 0.5, 0.5); // boot tap
  await page.waitForTimeout(400);

  const ids = await page.evaluate(() => window.__sagaTest.chapters);
  const morningIdx = ids.indexOf('morning');
  if (morningIdx < 0) { console.error(vp.name, 'no "morning" chapter found'); anyFail = true; continue; }

  // --- WIN: dodge every obstacle and keep all three checklist promises ---
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, morningIdx);
  await page.waitForTimeout(200);
  const { last: winResult, finalState } = await playToEnd(page, 60000);
  console.log(vp.name, 'morning WIN result:', JSON.stringify(winResult), 'checklist:', JSON.stringify(finalState && finalState.checklist));
  if (!winResult || !winResult.won) { console.error(vp.name, 'morning chapter did not win within the time budget'); anyFail = true; }
  if (finalState && finalState.checklist && !finalState.checklist.every((c) => c.done && c.hit)) {
    console.error(vp.name, 'morning chapter won without keeping every promise:', JSON.stringify(finalState.checklist));
    anyFail = true;
  }

  // --- Miss path: reach a station, then deliberately do nothing so its
  // timer lapses — confirm that costs a life and the dash resumes cleanly. ---
  await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, morningIdx);
  await page.waitForTimeout(200);
  let reachedStation = false;
  const t1 = Date.now();
  while (!reachedStation && Date.now() - t1 < 20000) {
    const s = await readState(page);
    if (!s) break;
    if (s.phase === 'station') { reachedStation = true; break; }
    const near = s.obstacles.some((x) => x - s.scrX > 4 && x - s.scrX < 60);
    if (s.onGround && near) await tapFrac(page, 0.5, 0.5);
    await page.waitForTimeout(35);
  }
  const livesBeforeMiss = (await readState(page))?.lives;
  let missResolved = false;
  const t2 = Date.now();
  while (!missResolved && Date.now() - t2 < 8000) {
    await page.waitForTimeout(200);
    const s = await readState(page);
    if (s && s.phase === 'run') missResolved = true;
  }
  const livesAfterMiss = (await readState(page))?.lives;
  console.log(vp.name, 'reached a station:', reachedStation, 'miss resolved cleanly:', missResolved,
    'lives before/after miss:', livesBeforeMiss, '/', livesAfterMiss);
  if (!reachedStation || !missResolved) { console.error(vp.name, 'station timeout path did not resolve cleanly'); anyFail = true; }
  if (reachedStation && missResolved && !(livesAfterMiss < livesBeforeMiss)) {
    console.error(vp.name, 'a missed station promise did not cost a life');
    anyFail = true;
  }

  const filtered = errors.filter((e) => !e.includes('fonts.googleapis') && !e.includes('net::ERR'));
  console.log(vp.name, 'errors:', JSON.stringify(filtered));
  if (filtered.length) anyFail = true;
  await ctx.close();
}

await browser.close();
server.close();

if (anyFail) { console.error('HEADLESS FAIL'); process.exit(1); }
console.log('HEADLESS PASS');
