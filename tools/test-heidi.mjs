import http from 'node:http';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8210;

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

  await page.goto(`http://localhost:${PORT}/games/heidi-alps/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);

  const hasHook = await page.evaluate(() => !!window.__heidiTest);
  console.log(vp.name, 'test hook present:', hasHook);
  if (!hasHook) { anyFail = true; console.error(vp.name, 'MISSING __heidiTest hook'); }

  // --- Real interactive smoke: tap through boot -> choose -> one real chore ---
  await tapFrac(page, 0.5, 0.6); // boot -> begin
  await page.waitForTimeout(500);
  const s1 = await page.evaluate(() => window.__heidiTest.scene());
  console.log(vp.name, 'scene after tap-begin:', s1);
  await tapFrac(page, 0.5, 0.6); // daybrief -> choose
  await page.waitForTimeout(200);
  const s2 = await page.evaluate(() => window.__heidiTest.scene());
  console.log(vp.name, 'scene after tap-daybrief:', s2);
  // tap the HERD GOATS tile (top-left, fractional coords within the 270x480 canvas)
  await tapFrac(page, 0.28, 0.42);
  await page.waitForTimeout(200);
  const s3 = await page.evaluate(() => window.__heidiTest.scene());
  console.log(vp.name, 'scene after tap-tile:', s3);
  if (s3 !== 'play') { anyFail = true; console.error(vp.name, 'tapping a chore tile did not start play, scene=', s3); }
  // tap a few times during play (herd mini reacts to taps) then let it run out
  for (let i = 0; i < 3; i++) { await tapFrac(page, 0.5, 0.5); await page.waitForTimeout(200); }
  await page.waitForTimeout(9500); // herd mini's fixed 9s duration
  const s4 = await page.evaluate(() => window.__heidiTest.scene());
  console.log(vp.name, 'scene after herd mini timeout:', s4);
  if (s4 !== 'result') { anyFail = true; console.error(vp.name, 'herd mini did not end into result, scene=', s4); }

  // --- Fast-forward hooks: a well-tended year should reach the epilogue ---
  await page.evaluate(() => {
    const T = window.__heidiTest;
    T.begin();
    for (let d = 0; d < 4; d++) {
      T.doAction('herd', 0.8, 6);
      T.doAction('forage', 0.8, 6);
      T.doAction('tend', 0.8);
      T.forceNight();
    }
    T.forceFinale();
    T.finishClara();
  });
  await page.waitForTimeout(300);
  const goodResult = await page.evaluate(() => ({ scene: window.__heidiTest.scene(), stats: window.__heidiTest.stats(), day: window.__heidiTest.day() }));
  console.log(vp.name, 'well-tended year result:', JSON.stringify(goodResult));
  if (goodResult.scene !== 'finale') { anyFail = true; console.error(vp.name, 'well-tended year did not reach finale, scene=', goodResult.scene); }
  if (goodResult.stats.health <= 0) { anyFail = true; console.error(vp.name, 'well-tended year still hit game-over health'); }
  // Clara's steps are already forced to GOAL — tap through to the epilogue,
  // which is where the year's score gets banked as a high score.
  await page.waitForTimeout(700); // finale requires sceneT > 0.6 before a tap advances it
  await tapFrac(page, 0.5, 0.5);
  await page.waitForTimeout(300);
  const epi = await page.evaluate(() => window.__heidiTest.scene());
  console.log(vp.name, 'scene after tap-through-finale:', epi);
  if (epi !== 'epilogue') { anyFail = true; console.error(vp.name, 'tapping the completed finale did not reach the epilogue, scene=', epi); }
  const highScore = await page.evaluate(() => localStorage.getItem('polecat.heidi.high'));
  console.log(vp.name, 'banked high score:', highScore);
  if (!highScore || Number(highScore) <= 0) { anyFail = true; console.error(vp.name, 'no high score banked after the epilogue rendered'); }

  // --- Critically low stats going into a night should trigger real game-over ---
  await page.evaluate(() => {
    const T = window.__heidiTest;
    T.begin();
    T.setStats(1, 1, 1);
    T.forceNight();
  });
  await page.waitForTimeout(300);
  const badResult = await page.evaluate(() => ({ scene: window.__heidiTest.scene(), stats: window.__heidiTest.stats() }));
  console.log(vp.name, 'critical-health night result:', JSON.stringify(badResult));
  if (badResult.scene !== 'over') { anyFail = true; console.error(vp.name, 'critically low stats going into a night did not trigger game-over, scene=', badResult.scene); }
  // and the "try again" tap on the game-over screen should return to a fresh year
  // (the over scene ignores taps until sceneT > 0.5s, so wait it out first)
  await page.waitForTimeout(400);
  await tapFrac(page, 0.5, 0.75);
  await page.waitForTimeout(700);
  const revived = await page.evaluate(() => ({ scene: window.__heidiTest.scene(), stats: window.__heidiTest.stats() }));
  console.log(vp.name, 'after tap-to-retry:', JSON.stringify(revived));
  if (revived.stats.health !== 55 || revived.scene !== 'daybrief') { anyFail = true; console.error(vp.name, 'tap-to-retry from game-over did not reset the year, got', JSON.stringify(revived)); }

  const filtered = errors.filter((e) => !e.includes('fonts.googleapis') && !e.includes('net::ERR'));
  console.log(vp.name, 'errors:', JSON.stringify(filtered));
  if (filtered.length) anyFail = true;
  await ctx.close();
}

await browser.close();
server.close();

if (anyFail) { console.error('HEADLESS FAIL'); process.exit(1); }
console.log('HEADLESS PASS');
