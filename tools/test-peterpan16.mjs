/* Headless smoke + pacing audit for games/peterpan-16 (Peter Pan Gen-4).
 * Not part of the committed test suite — run manually, mirrors the pattern used
 * for other Gen-4 games' own dev-time test scripts. */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8199;
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

async function auditViewport(browser, base, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto(`${base}/games/peterpan-16/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);

  const hasCanvas = await page.locator('.re-canvas').count();
  const nodeInfo = await page.evaluate(() => window.__saga2Test && window.__saga2Test.nodes);

  const results = [];
  for (let i = 0; i < (nodeInfo ? nodeInfo.length : 0); i++) {
    const n = nodeInfo[i];
    for (let p = 0; p < n.phases; p++) {
      await page.evaluate(([idx, ph]) => window.__saga2Test.jump(idx, ph), [i, p]);
      await page.waitForTimeout(120);
      // simulate ~2s of varied input: taps + a hold-drag, to exercise win/lose paths
      for (let k = 0; k < 8; k++) {
        await page.mouse.move(width / 2 + (k % 3 - 1) * 20, height / 2 + (k % 2) * 10);
        await page.mouse.down();
        await page.waitForTimeout(60);
        await page.mouse.move(width / 2 + 10, height / 2 + 5);
        await page.waitForTimeout(40);
        await page.mouse.up();
        await page.waitForTimeout(120);
      }
      const scene = await page.evaluate(() => window.__saga2Test.scene());
      const last = await page.evaluate(() => window.__saga2Test.last);
      results.push({ node: n.id, phase: p, scene, last });
    }
  }

  await ctx.close();
  return { width, height, hasCanvas, errs, results };
}

async function main() {
  const { chromium } = await import('playwright');
  const server = await serve();
  const base = `http://localhost:${PORT}`;
  const exe = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium';
  let browser;
  try { browser = await chromium.launch({ executablePath: exe }); }
  catch { browser = await chromium.launch(); }

  for (const [w, h] of [[390, 780], [1280, 800]]) {
    const r = await auditViewport(browser, base, w, h);
    console.log(`\n=== ${w}x${h} ===`);
    console.log('canvas present:', r.hasCanvas > 0);
    console.log('pageerrors:', r.errs.length ? r.errs : 'none');
    console.log('phase exercise results:', JSON.stringify(r.results, null, 2));
  }

  await browser.close();
  server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
