/* Targeted mechanic checks for scrooge-16's riskier phases: does the core verb
 * actually register progress (not just "no crash")? Ad-hoc, not committed to CI. */
import http from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8200;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
function serve() {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        let p = decodeURIComponent(req.url.split('?')[0]);
        if (p.endsWith('/')) p += 'index.html';
        const fp = path.join(ROOT, p);
        if (!fp.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
        await stat(fp);
        res.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'application/octet-stream' });
        createReadStream(fp).pipe(res);
      } catch { res.writeHead(404); res.end('not found'); }
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function main() {
  const { chromium } = await import('playwright');
  const server = await serve();
  const base = `http://localhost:${PORT}`;
  const exe = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium';
  let browser;
  try { browser = await chromium.launch({ executablePath: exe }); }
  catch { browser = await chromium.launch(); }
  const ctx = await browser.newContext({ viewport: { width: 390, height: 780 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto(`${base}/games/scrooge-16/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);

  // --- STONE ITSELF (future, phase 1): drag should raise this.clear ---
  await page.evaluate(() => window.__saga2Test.jump(3, 1));
  await page.waitForTimeout(100);
  const before = await page.evaluate(() => window.__saga2Phase);
  const box = await page.locator('.re-canvas').boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height * 0.4;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  for (let i = 0; i < 40; i++) { await page.mouse.move(cx + (i % 5) - 2, cy + (i % 3), { steps: 2 }); await page.waitForTimeout(30); }
  await page.mouse.up();
  const clearPct = await page.evaluate(() => { const ph = document.querySelector('.re-canvas'); return window.__saga2Test.scene(); });
  console.log('stoneItself: scene after 1.2s of dragging =', clearPct, '(expect play or result, not stuck at 0 forever — checked via console below)');

  // --- CRATCHIT'S TABLE (present, phase 0): tapping falling gifts should score ---
  await page.evaluate(() => window.__saga2Test.jump(2, 0));
  await page.waitForTimeout(200);
  for (let i = 0; i < 20; i++) {
    for (const lane of [0.22, 0.5, 0.78]) {
      await page.mouse.click(box.x + box.width * lane, box.y + box.height * 0.55);
    }
    await page.waitForTimeout(250);
  }
  const presentScene = await page.evaluate(() => window.__saga2Test.scene());
  const presentLast = await page.evaluate(() => window.__saga2Test.last);
  console.log('cratchitsTable: scene =', presentScene, 'last =', presentLast);

  // --- REDEMPTION DASH (morning): rapid taps should progress stations ---
  await page.evaluate(() => window.__saga2Test.jump(4, 0));
  await page.waitForTimeout(200);
  for (let i = 0; i < 30; i++) { await page.mouse.click(cx, cy); await page.waitForTimeout(200); }
  const morningScene = await page.evaluate(() => window.__saga2Test.scene());
  const morningLast = await page.evaluate(() => window.__saga2Test.last);
  console.log('redemptionDash: scene =', morningScene, 'last =', morningLast);

  console.log('pageerrors:', errs.length ? errs : 'none');
  await browser.close();
  server.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
