/* ============================================================================
 * audit-active.mjs — ACTIVE-PLAY audit for the 8-bit RetroSaga games.
 *
 * Companion to audit-saga.mjs (which is an idle pass). This one drives each
 * chapter with a synthetic "chaotic competent" player — it holds & steers the
 * pointer across the playfield, taps ~4x/s (to hit timing/aim windows), and
 * presses arrow/action keys — retrying on death within a per-chapter time
 * budget. It flags:
 *   CRASH    — a pageerror during active play
 *   TRIVIAL  — a chaotic masher WINS in under ~2.5s (too easy / too short)
 *   NO-WIN   — never won within the budget across retries (likely too hard or
 *              broken — REVIEW by hand; skill games can false-positive here)
 *
 * Usage:
 *   node tools/audit-active.mjs                 # all live 8-bit games
 *   node tools/audit-active.mjs peterpan-flight # a subset
 *
 * The NO-WIN list is a REVIEW queue, not a verdict — a generic driver can't
 * play precise skill games, so eyeball each before "fixing".
 * ============================================================================ */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXEC = '/opt/pw-browsers/chromium';
const BUDGET_MS = 30000;      // per-chapter budget (covers most in-chapter timers; longer ones show as NEVER-ENDS = review, not bug)
const CONCURRENCY = 4;
const TRIVIAL = 2.5;          // seconds — a mash-win this fast is too easy/short
const argv = process.argv.slice(2);

function liveGames() {
  const s = readFileSync(path.join(ROOT, 'js/catalog.js'), 'utf8');
  return s.split(/\n  \{ id: "/).slice(1).map((chunk) => {
    const id = chunk.match(/^([^"]+)/)[1];
    const style = (chunk.match(/style: "([^"]+)"/) || [])[1] || '8-bit';
    const status = (chunk.match(/status: "([^"]+)"/) || [])[1] || '?';
    const legacy = /legacy:\s*true/.test(chunk.slice(0, 500));
    return { id, style, status, legacy };
  }).filter((e) => e.status === 'live' && e.style !== '16-bit' && !e.legacy)
    .filter((e) => !argv.length || argv.includes(e.id));
}

// injected in-page driver: dispatches synthetic pointer + key events every 50ms
const START_DRIVE = (mode) => {
  const c = document.querySelector('canvas'); if (!c) return;
  const r = c.getBoundingClientRect();
  const cf = (type, x, y) => c.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
  const wf = (type, x, y) => window.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
  const key = (code, down) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: code, bubbles: true }));
  const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyZ', 'KeyX', 'Space'];
  let t = 0, n = 0, down = false;
  const tick = () => {
    t += 0.05; n++;
    const fx = mode === 1 ? (0.5 + 0.42 * Math.sin(t * 2.3)) : (0.5 + 0.3 * Math.sin(t * 1.5) + 0.16 * Math.sin(t * 4.1));
    const fy = mode === 1 ? (0.6 + 0.16 * Math.sin(t * 1.7 + 1)) : (0.5 + 0.28 * Math.sin(t * 1.1));
    const x = r.left + r.width * Math.max(0.05, Math.min(0.95, fx));
    const y = r.top + r.height * Math.max(0.1, Math.min(0.9, fy));
    if (!down) { cf('mousedown', x, y); down = true; }
    cf('mousemove', x, y);
    const tapEvery = mode === 1 ? 4 : 3;                 // ~4-5 taps/s → fires ptr.justDown
    if (n % tapEvery === 0) { wf('mouseup', x, y); cf('mousedown', x, y); }
    if (n % 9 === 0) { const k = keys[(n / 9 | 0) % keys.length]; key(k, true); setTimeout(() => key(k, false), 90); }
  };
  window.__driveId = setInterval(tick, 50);
  window.__driveStop = () => { clearInterval(window.__driveId); try { window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true })); } catch (e) {} };
};

async function auditGame(browser, id) {
  const rec = { id, chapters: [], flags: [] };
  const ctx = await browser.newContext({ viewport: { width: 400, height: 820 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).split('\n')[0]));
  try {
    await page.goto('file://' + path.join(ROOT, 'games', id, 'index.html'), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    if (!(await page.evaluate(() => !!window.__sagaTest))) { rec.flags.push('NO-HOOK'); await ctx.close(); return rec; }
    const ids = await page.evaluate(() => window.__sagaTest.chapters);
    for (let i = 0; i < ids.length; i++) {
      const before = errs.length;
      const t0 = Date.now(); let won = null, tries = 0;
      await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, i);
      await page.evaluate(START_DRIVE, 1);
      while (Date.now() - t0 < BUDGET_MS && !errs.slice(before).length) {
        const last = await page.evaluate(() => window.__sagaTest.last);
        if (last && last.won) { won = last.t; break; }
        if (last && !last.won) {                          // died — retry with the other pattern
          tries++;
          await page.evaluate(() => window.__driveStop && window.__driveStop());
          await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, i);
          await page.evaluate(START_DRIVE, tries % 2 ? 2 : 1);
        }
        await page.waitForTimeout(150);
      }
      await page.evaluate(() => window.__driveStop && window.__driveStop());
      const chErr = errs.length - before;
      const c = { id: ids[i], won: won != null, t: won, tries, err: chErr };
      if (chErr) { c.flags = ['CRASH']; rec.flags.push('CRASH'); }
      else if (won != null && won < TRIVIAL) { c.flags = ['TRIVIAL']; rec.flags.push('TRIVIAL'); }
      else if (won == null && tries === 0) { c.flags = ['NEVER-ENDS']; rec.flags.push('NEVER-ENDS'); } // survived the whole budget without winning OR dying — win may be unreachable
      else if (won == null) { c.noWin = true; } // driver died without winning — usually just a skill chapter the generic driver can't beat (info only, not flagged)
      rec.chapters.push(c);
      await page.evaluate(() => { window.__sagaTest.last = null; });
      await page.waitForTimeout(700);                     // flush any delayed result timer
    }
  } catch (e) {
    rec.flags.push('HARNESS-ERR'); rec.err = String(e).split('\n')[0];
  }
  rec.flags = [...new Set(rec.flags)];
  await ctx.close();
  return rec;
}

(async () => {
  const games = liveGames();
  console.log(`Active-play audit of ${games.length} live 8-bit games (drive + retry each chapter)...\n`);
  let browser = await chromium.launch({ executablePath: EXEC });
  const out = []; let sinceRecycle = 0;
  for (let i = 0; i < games.length; i += CONCURRENCY) {
    const batch = games.slice(i, i + CONCURRENCY);
    const res = await Promise.all(batch.map((g) => auditGame(browser, g.id).catch((e) => ({ id: g.id, flags: ['HARNESS-ERR'], err: String(e) }))));
    for (const r of res) {
      out.push(r);
      process.stdout.write(`${r.flags.length ? '⚠' : '·'} ${r.id.padEnd(24)} ${r.flags.length ? r.flags.join(',') : 'ok'}\n`);
    }
    sinceRecycle += batch.length;
    if (sinceRecycle >= 16 && i + CONCURRENCY < games.length) { await browser.close(); browser = await chromium.launch({ executablePath: EXEC }); sinceRecycle = 0; }
  }
  await browser.close();
  const flagged = out.filter((r) => r.flags.length);
  writeFileSync(path.join(ROOT, 'tools', 'audit-active-report.json'), JSON.stringify(out, null, 2));
  console.log(`\n===== ${flagged.length}/${out.length} games flagged =====`);
  for (const r of flagged) {
    const detail = (r.chapters || []).filter((c) => c.flags).map((c) => `${c.id}[${c.flags}${c.t != null ? ' ' + c.t + 's' : ''}]`).join(' ');
    console.log(`  ${r.id.padEnd(24)} ${r.flags.join(',')}  ${detail}${r.err ? '  :: ' + r.err : ''}`);
  }
  console.log('\nNO-WIN is a REVIEW queue (generic driver ≠ skilled play). full report → tools/audit-active-report.json');
})();
