/* ============================================================================
 * audit-saga.mjs — headless pacing & crash audit for the 8-bit RetroSaga games.
 *
 * For every live, non-legacy 8-bit game it loads the page, then jumps straight
 * into each chapter's PLAY scene with NO input and watches what happens. It
 * flags the failure modes we keep hitting:
 *   CRASH      — a pageerror on load or during a chapter (unplayable)
 *   IDLE-WIN   — the chapter WINS with zero input (pacing/logic bug: you can
 *                "win" by doing nothing — e.g. distance accrues to target too
 *                fast, like the old Hispaniola)
 *   INSTANT    — the chapter ends (win OR lose) in under ~1.5s (too short to play)
 *   IDLE-LOSE-FAST — loses in <1s with no input (often legit "must act", but
 *                worth an eyeball)
 *
 * Usage:
 *   node tools/audit-saga.mjs                 # audit every live 8-bit game
 *   node tools/audit-saga.mjs sherlock-hound  # audit a subset
 *
 * Needs Playwright + the pre-installed Chromium. Requires the __sagaTest hook
 * in js/saga.js. Writes a JSON report next to the repo and prints a summary.
 * ============================================================================ */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXEC = '/opt/pw-browsers/chromium';
const IDLE_MS = 6500;         // max idle watch per chapter
const CONCURRENCY = 6;
const INSTANT = 1.5;          // seconds — "ended too fast"
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

async function auditGame(browser, id) {
  const rec = { id, chapters: [], flags: [], loadError: null };
  const ctx = await browser.newContext({ viewport: { width: 400, height: 820 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).split('\n')[0]));
  try {
    await page.goto('file://' + path.join(ROOT, 'games', id, 'index.html'), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const ok = await page.evaluate(() => !!window.__sagaTest);
    if (!ok) { rec.loadError = errs[0] || 'no __sagaTest (not a saga game?)'; rec.flags.push('NO-HOOK'); await ctx.close(); return rec; }
    if (errs.length) { rec.loadError = errs[0]; rec.flags.push('CRASH'); }
    const ids = await page.evaluate(() => window.__sagaTest.chapters);
    for (let i = 0; i < ids.length; i++) {
      const before = errs.length;
      await page.evaluate((idx) => { window.__sagaTest.last = null; window.__sagaTest.jump(idx); }, i);
      // watch idle until the chapter ends or IDLE_MS elapses
      const t0 = Date.now(); let last = null;
      while (Date.now() - t0 < IDLE_MS) {
        last = await page.evaluate(() => window.__sagaTest.last);
        if (last) break;
        await page.waitForTimeout(120);
      }
      const chErr = errs.length - before;
      const c = { id: ids[i], ended: !!last, won: last ? last.won : null, t: last ? last.t : null, err: chErr };
      if (chErr) { c.flags = ['CRASH']; rec.flags.push('CRASH'); }
      else if (last && last.won) { c.flags = ['IDLE-WIN']; rec.flags.push('IDLE-WIN'); }        // won doing nothing
      else if (last && last.t < INSTANT) { c.flags = ['INSTANT']; rec.flags.push('INSTANT'); }  // ended too fast
      else if (last && !last.won && last.t < 1.0) { c.flags = ['LOSE-FAST']; rec.flags.push('LOSE-FAST'); }
      rec.chapters.push(c);
      // Flush any pending setTimeout(win/lose) this chapter scheduled (games delay
      // their result for a death/win animation) so a stale timer can't fire inside
      // the NEXT chapter and mis-flag it as an instant end.
      await page.evaluate(() => { window.__sagaTest.last = null; });
      await page.waitForTimeout(900);
    }
  } catch (e) {
    rec.loadError = String(e).split('\n')[0]; rec.flags.push('LOAD-FAIL');
  }
  rec.flags = [...new Set(rec.flags)];
  await ctx.close();
  return rec;
}

(async () => {
  const games = liveGames();
  console.log(`Auditing ${games.length} live 8-bit games (idle pacing/crash pass)...\n`);
  const browser = await chromium.launch({ executablePath: EXEC });
  const out = [];
  for (let i = 0; i < games.length; i += CONCURRENCY) {
    const batch = games.slice(i, i + CONCURRENCY);
    const res = await Promise.all(batch.map((g) => auditGame(browser, g.id).catch((e) => ({ id: g.id, flags: ['HARNESS-ERR'], err: String(e) }))));
    for (const r of res) {
      out.push(r);
      const tag = r.flags.length ? '⚠ ' + r.flags.join(',') : 'ok';
      process.stdout.write(`${tag === 'ok' ? '·' : '⚠'} ${r.id.padEnd(24)} ${tag}\n`);
    }
  }
  await browser.close();
  const flagged = out.filter((r) => r.flags.length);
  writeFileSync(path.join(ROOT, 'tools', 'audit-report.json'), JSON.stringify(out, null, 2));
  console.log(`\n===== ${flagged.length}/${out.length} games flagged =====`);
  for (const r of flagged) {
    const detail = (r.chapters || []).filter((c) => c.flags).map((c) => `${c.id}[${c.flags}${c.t != null ? ' ' + c.t + 's' : ''}]`).join(' ');
    console.log(`  ${r.id.padEnd(24)} ${r.flags.join(',')}  ${detail}${r.loadError ? '  :: ' + r.loadError : ''}`);
  }
  console.log('\nfull report → tools/audit-report.json');
})();
