import http from 'node:http';
import { readFile } from 'node:fs/promises';
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

const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(`http://localhost:${PORT}/games/robinhood-archer/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.waitForTimeout(1200);

const canvas = page.locator('.re-canvas');
const scene1 = await page.evaluate(() => window.__sagaScene);
console.log('scene at load:', scene1);

// Tap to go boot -> menu
await canvas.click({ position: { x: 135, y: 240 } });
await page.waitForTimeout(600);
const scene2 = await page.evaluate(() => window.__sagaScene);
console.log('after tap -> menu:', scene2);

// Tap chapter 1 row
await canvas.click({ position: { x: 135, y: 120 } });
await page.waitForTimeout(500);
const scene3 = await page.evaluate(() => window.__sagaScene);
console.log('after chapter tap -> intro:', scene3);

// Tap to play
await canvas.click({ position: { x: 135, y: 300 } });
await page.waitForTimeout(800);
const scene4 = await page.evaluate(() => window.__sagaScene);
console.log('after play tap -> play:', scene4);

const filteredErrors = errors.filter(e => !e.includes('fonts.googleapis') && !e.includes('favicon') && !e.includes('net::ERR'));
console.log('page errors:', JSON.stringify(filteredErrors));

await browser.close();
server.close();

if (filteredErrors.length > 0) {
  console.error('HEADLESS FAIL');
  process.exit(1);
} else {
  console.log('HEADLESS PASS');
}
