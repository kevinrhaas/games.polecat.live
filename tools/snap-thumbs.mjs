/* ============================================================================
 * snap-thumbs.mjs — capture a real gameplay frame from each LIVE game and save
 * it as games/<id>/thumb.png, so the home-page cards show the actual game.
 *
 * Usage:  node tools/snap-thumbs.mjs            (captures every live game)
 *         node tools/snap-thumbs.mjs sherlock-hound dracula-castle   (subset)
 *
 * Self-contained: it spins up a tiny static server over the repo root and
 * drives headless Chromium (Playwright). Run it from the repo root after
 * building/altering a game; the hourly build-loop calls it when shipping.
 * ============================================================================ */
import http from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8123;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };

// --- tiny static file server -------------------------------------------------
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

// --- per-game "get it into a representative playing state" inputs ------------
async function kickoff(page) {
  // Most games start on a key/tap and then animate on their own. Press the
  // common start buttons, then hold a direction briefly so there's some action
  // in frame, and let the world populate before the snapshot.
  for (const k of ['Space', 'ArrowUp', 'ArrowRight']) await page.keyboard.down(k);
  await page.waitForTimeout(160);
  for (const k of ['Space', 'ArrowUp']) await page.keyboard.up(k);
  await page.waitForTimeout(1100);
  await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(120);
}

async function main() {
  const { chromium } = await import('playwright');
  const server = await serve();
  const base = `http://localhost:${PORT}`;
  // Prefer the preinstalled Chromium if present; otherwise let Playwright resolve it.
  const exe = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium';
  let browser;
  try { browser = await chromium.launch({ executablePath: exe }); }
  catch { browser = await chromium.launch(); }
  const page0 = await browser.newPage();
  await page0.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
  const catalog = await page0.evaluate(() => window.POLECAT_CATALOG || []);
  await page0.close();

  const want = process.argv.slice(2);
  const live = catalog.filter((g) => g.status === 'live' && (!want.length || want.includes(g.id)));
  console.log(`Capturing ${live.length} thumbnail(s)...`);

  for (const g of live) {
    const ctx = await browser.newContext({ viewport: { width: 800, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(`${base}/games/${g.id}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const canvas = page.locator('.re-canvas');
    await canvas.scrollIntoViewIfNeeded();
    // Saga games (8-bit AND 16-bit shells): capture the epic title screen (no
    // input). Single-mechanic games: kick off and grab a live gameplay frame.
    const isSaga = await page.evaluate(() => typeof window.__sagaScene !== 'undefined' || typeof window.__saga2Scene !== 'undefined');
    if (isSaga) {
      await page.waitForTimeout(900);
    } else {
      await canvas.click({ position: { x: 10, y: 10 } }).catch(() => {});
      await kickoff(page);
    }
    // read the canvas at its native resolution → crisp pixels
    const dataUrl = await page.evaluate(() => {
      const c = document.querySelector('.re-canvas');
      return c ? c.toDataURL('image/png') : null;
    });
    if (!dataUrl) { console.log(`  ✗ ${g.id}: no canvas`); await ctx.close(); continue; }
    const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
    const out = path.join(ROOT, 'games', g.id, 'thumb.png');
    await writeFile(out, buf);
    console.log(`  ✓ ${g.id}  (${(buf.length / 1024).toFixed(1)} KB)${errs.length ? '  [pageerror!]' : ''}`);
    await ctx.close();
  }

  await browser.close();
  server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
