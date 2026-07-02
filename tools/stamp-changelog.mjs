/* ============================================================================
 * stamp-changelog.mjs — fill in empty changelog timestamps (relay convention).
 * ----------------------------------------------------------------------------
 * The build-loop PREPENDS new entries with ts:"" (it can't know the commit
 * time). This script — run by the workflow right before committing — replaces
 * every empty ts with the current time as an ISO-8601 UTC string, and keeps
 * window.POLECAT_LATEST_VERSION in sync with the newest entry's `v`.
 *
 *   node tools/stamp-changelog.mjs
 *
 * Idempotent: entries that already have a ts are left untouched.
 * ============================================================================ */
import fs from 'fs';

const PATH = new URL('../js/changelog.js', import.meta.url).pathname;
let src = fs.readFileSync(PATH, 'utf8');

const now = new Date().toISOString();

// Only operate on the entries array (never the header comment / examples).
const marker = 'window.POLECAT_CHANGELOG';
const at = src.indexOf(marker);
let head = at >= 0 ? src.slice(0, at) : '';
let arr = at >= 0 ? src.slice(at) : src;

// fill empty ts:"" (or ts:'') with the current UTC timestamp
let filled = 0;
arr = arr.replace(/ts:\s*(""|'')/g, () => { filled++; return 'ts: "' + now + '"'; });
src = head + arr;

// keep LATEST_VERSION aligned with the highest (first) entry's v
const firstV = src.match(/\bv:\s*(\d+)/);
if (firstV) {
  const latest = firstV[1];
  if (/window\.POLECAT_LATEST_VERSION\s*=/.test(src)) {
    src = src.replace(/window\.POLECAT_LATEST_VERSION\s*=\s*\d+\s*;/, 'window.POLECAT_LATEST_VERSION = ' + latest + ';');
  } else {
    src = src.replace(/;\s*$/, ';\n') + 'window.POLECAT_LATEST_VERSION = ' + latest + ';\n';
  }
}

fs.writeFileSync(PATH, src);
console.log('stamp-changelog: filled ' + filled + ' timestamp(s) @ ' + now + (firstV ? ', latest v=' + firstV[1] : ''));
