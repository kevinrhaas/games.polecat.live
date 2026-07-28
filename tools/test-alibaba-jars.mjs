import http from 'node:http';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8198;

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

await page.goto(`http://localhost:${PORT}/games/alibaba-cave/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.waitForTimeout(600);

// Jump straight into chapter index 3 (THE OIL JARS) via the saga test hook.
await page.evaluate(() => { window.__sagaTest.last = null; window.__sagaTest.jump(3); });
await page.waitForTimeout(200);

// Round 1: deliberately tap the wrong jar first (a non-thief live candidate) to
// exercise the miss path, then find and tap the thief's jar for every round
// until the chapter ends (win or lose), or bail out after too many iterations.
let iterations = 0;
let outcome = null;
let testedWrong = false;
while (iterations++ < 400) {
  const state = await page.evaluate(() => {
    const c = window.__sagaTest.current();
    if (!c || !c.positions) return null;
    function surviving(positions, clues, n) {
      const res = [];
      for (let i = 0; i < positions.length; i++) {
        let ok = true;
        for (let k = 0; k < n; k++) { if (!clues[k].test(positions[i], i)) { ok = false; break; } }
        if (ok) res.push(i);
      }
      return res;
    }
    const live = surviving(c.positions, c.clues, c.cluesShown);
    return {
      phase: c.phase, round: c.round, target: c.target, misses: c.misses, maxMiss: c.maxMiss,
      thief: c.thief, live, positions: c.positions, wrong: Object.keys(c.wrongThisRound || {}).map(Number),
      cluesShown: c.cluesShown, numClues: c.clues.length, clueTimer: c.clueTimer,
    };
  });
  const last = await page.evaluate(() => window.__sagaTest.last);
  if (last) { outcome = last; break; }
  if (!state) { await page.waitForTimeout(150); continue; }
  if (state.phase !== 'guess') { await page.waitForTimeout(150); continue; }

  const canvas = page.locator('.re-canvas');
  // Exercise the wrong-tap path once (life loss, jar marked empty) before always
  // going for the correct jar, whichever round first offers more than 1 candidate.
  if (!testedWrong && state.live.length > 1) {
    const wrongIdx = state.live.find((i) => i !== state.thief);
    if (wrongIdx !== undefined) {
      testedWrong = true;
      const p = state.positions[wrongIdx];
      await canvas.click({ position: { x: p.x, y: p.y + 3 } });
      await page.waitForTimeout(150);
      continue;
    }
  }
  const p = state.positions[state.thief];
  await canvas.click({ position: { x: p.x, y: p.y + 3 } });
  await page.waitForTimeout(150);
}
console.log('rounds/misses seen, testedWrong=', testedWrong);

console.log('outcome:', JSON.stringify(outcome));
console.log('page errors:', JSON.stringify(errors));

await browser.close();
server.close();

if (errors.length > 0) {
  console.error('HEADLESS FAIL: page errors');
  process.exit(1);
} else if (!outcome || !outcome.won) {
  console.error('HEADLESS FAIL: chapter did not end in a win — ' + JSON.stringify(outcome));
  process.exit(1);
} else {
  console.log('HEADLESS PASS');
}
