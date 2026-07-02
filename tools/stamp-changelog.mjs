/* ============================================================================
 * stamp-changelog.mjs — fill in empty changelog timestamps (polecat convention).
 * ----------------------------------------------------------------------------
 * The build-loop PREPENDS new entries with ts:"" (it can't know the commit
 * time). This script — run by the workflow right before committing — replaces
 * every empty ts with the current time as an ISO-8601 UTC string. LATEST_VERSION
 * is derived in the file itself (CHANGELOG.reduce(max v)), so nothing to sync.
 *
 *   node tools/stamp-changelog.mjs
 *
 * Idempotent: entries that already have a ts are left untouched. Operates only
 * on the CHANGELOG array, never the header comment / examples.
 * ============================================================================ */
import fs from 'fs';

const PATH = new URL('../js/changelog.js', import.meta.url).pathname;
let src = fs.readFileSync(PATH, 'utf8');
const now = new Date().toISOString();

const marker = 'export const CHANGELOG';
const at = src.indexOf(marker);
const head = at >= 0 ? src.slice(0, at) : '';
let arr = at >= 0 ? src.slice(at) : src;

let filled = 0;
arr = arr.replace(/ts:\s*(""|'')/g, () => { filled++; return 'ts: "' + now + '"'; });
src = head + arr;

fs.writeFileSync(PATH, src);
const firstV = src.match(/\bv:\s*(\d+)/);
console.log('stamp-changelog: filled ' + filled + ' timestamp(s) @ ' + now + (firstV ? ', top v=' + firstV[1] : ''));
