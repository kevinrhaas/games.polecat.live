/* ============================================================================
 * stamp-changelog.mjs — stamp + CANONICALIZE the changelog (polecat convention).
 * ----------------------------------------------------------------------------
 * Runs in the push step every build. It:
 *   1. reads js/changelog.js and evaluates its CHANGELOG array (lenient JS),
 *   2. fills any empty `ts` with the current ISO-8601 UTC time (never fabricated
 *      — it's the real commit time of this push),
 *   3. re-serializes the WHOLE file in manager.polecat.live's exact canonical
 *      style — an ES module, one entry per block, unquoted keys, single-quoted
 *      strings (with escaping), trailing commas — so the fleet "Sync changelog"
 *      importer (built for that format) parses ours identically, no matter what
 *      style the build loop happened to write a new entry in.
 *
 *   node tools/stamp-changelog.mjs
 *
 * Idempotent: entries that already have a `ts` keep it; running twice is a no-op.
 * ============================================================================ */
import fs from 'fs';

const PATH = new URL('../js/changelog.js', import.meta.url).pathname;
const src = fs.readFileSync(PATH, 'utf8');

// Evaluate the existing module's CHANGELOG array (tolerates single/double
// quotes, unquoted keys, trailing commas — whatever the loop wrote).
const code = src.replace(/export\s+const/g, 'const') + '\n;return CHANGELOG;';
const CHANGELOG = new Function(code)();

const now = new Date().toISOString();
let filled = 0;
for (const e of CHANGELOG) {
  if (!e.ts) { e.ts = now; filled++; }
  if (!e.kind) e.kind = 'feature';
}

// single-quoted JS string, manager style
const sq = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const entry = (e) => {
  const items = e.items || [];
  return [
    '  {',
    '    v: ' + e.v + ',',
    '    title: ' + sq(e.title) + ',',
    '    kind: ' + sq(e.kind) + ',',
    '    ts: ' + sq(e.ts) + ',',
    '    items: [',
    ...items.map((it) => '      ' + sq(it) + ','),
    '    ],',
    '  },',
  ].join('\n');
};

const header = `// Changelog powering the "What's New" panel on games.polecat.live. Newest first.
// Shared polecat convention (see manager.polecat.live): an ES module exposing a
// CHANGELOG array of versioned entries with an ISO-8601 UTC \`ts\`.
//
// The hourly build loop appends a new entry at the TOP for each user-visible
// change (bump \`v\`, short \`title\`, a \`kind\` of 'game' | 'feature' | 'fix', and
// 1-4 \`items\`). Leave \`ts\` as an EMPTY string on the new entry — this script
// (run by the push step) stamps it with the real commit time and rewrites the
// whole file in this canonical style, so timestamps are never fabricated and the
// format stays identical to the rest of the fleet.
`;

const out = header +
  'export const CHANGELOG = [\n' +
  CHANGELOG.map(entry).join('\n') + '\n' +
  '];\n\nexport const LATEST_VERSION = CHANGELOG.reduce((m, e) => Math.max(m, e.v), 0);\n';

fs.writeFileSync(PATH, out);
const latest = CHANGELOG.reduce((m, e) => Math.max(m, e.v), 0);
console.log('stamp-changelog: ' + CHANGELOG.length + ' entries canonicalized, filled ' + filled + ' ts @ ' + now + ', latest v=' + latest);
