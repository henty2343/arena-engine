/* scratch/triage/patch-pair-proof.mjs — asserted-patch #3 (Item-3 triage, session 5, 2026-11-11).
 * Target: .qa/pair-proof.mjs static tripwire (:400-406). Menu item 3.
 * Defect (measured this session): the per-line regex /\b(?:COLS|TINTS|FIGHTERS|SKILL_SHORT)\[([^\]]*)\]/g
 * stops at the INNER ']' of a nested read, so the two burnfix-r84 sites
 *   COLS[(G.fighters[p.o] || { idx: p.o }).idx]     canonical :4732
 *   COLS[(G.fighters[em.o] || { idx: em.o }).idx]   canonical :4774
 * parse as truncated indices "(G.fighters[p.o" / "(G.fighters[em.o" — no idx token -> FALSE POSITIVE
 * FAIL (pair-proof red: "36/37 passed, 1 FAILED"). The code is correct; the scanner is wrong.
 * Fix: balance-aware bracket scan over `stripped` (depth counter over [ ]; string/comment mode already
 * handled by the upstream stripper). Keep reads shape {n, idx, line} so allowed()/ok() at :407-415 are
 * untouched. Honest floor: measured BEFORE patching — raw canonical yields 37 single-level regex reads;
 * after comment-stripping BOTH scanners agree on 33 sites (>= 20 floor survives with margin), and exactly
 * 5 of the 33 have nested brackets in their true extent (the 3 G.cast[st.o] sites were previously
 * double-counted inner reads; the 2 burnfix sites were the false positives).
 * Method (owner non-negotiable): exact-match + expected count, fail loudly, write nothing on mismatch.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = '.qa/pair-proof.mjs';
let src = readFileSync(FILE, 'utf8');

const patches = [
  { id: 'PP1', count: 1,
    old: `  const slines = stripped.split('\\n');
  const reads = [];
  slines.forEach((l, n) => {
    for (const m of l.matchAll(/\\b(?:COLS|TINTS|FIGHTERS|SKILL_SHORT)\\[([^\\]]*)\\]/g)) {
      reads.push({ n: n + 1, idx: m[1].trim(), line: l.trim() });
    }
  });`,
    new: `  /* RE-SEEDED 2026-11-11 (session 5, menu item 3): the superseded per-line scan
   *   slines.forEach((l, n) => { for (const m of l.matchAll(/\\b(?:COLS|TINTS|FIGHTERS|SKILL_SHORT)\\[([^\\]]*)\\]/g)) ... })
   * stopped at the INNER closing bracket of nested reads, truncating the index text. That made the two
   * burnfix-r84 sites canonical :4732/:4774 — COLS[(G.fighters[p.o] or brace-fill).idx] — parse as
   * "(G.fighters[p.o" (no idx token), so the cell FAILed on CORRECT code: a false positive. The
   * replacement below is a balance-aware scan over the whole comment-stripped text: depth counter over
   * opening/closing brackets from the match start to the matching close. Strings and comments are
   * already neutralised by the stripped scanner upstream, so bracket counting is safe there.
   * reads keeps its {n, idx, line} shape; allowed() and the >=20 floor are untouched. Measured honesty
   * of the floor: 33 sites survive comment-stripping under BOTH scanners (raw canonical: 37 regex hits,
   * 4 of them inner double-counts) — >=20 holds with margin. */
  const reads = [];
  for (const m of stripped.matchAll(/\\b(COLS|TINTS|FIGHTERS|SKILL_SHORT)\\[/g)) {
    let depth = 1, j = m.index + m[0].length;
    while (j < stripped.length && depth > 0) {
      const ch = stripped[j];
      if (ch === '[') depth++;
      else if (ch === ']') depth--;
      j++;
    }
    if (depth !== 0) continue;                       // unbalanced tail: not a read we can vouch for
    const lnStart = stripped.lastIndexOf('\\n', m.index) + 1;         // line start containing the read
    let lnEnd = stripped.indexOf('\\n', j); if (lnEnd === -1) lnEnd = stripped.length;
    reads.push({ n: stripped.slice(0, m.index).split('\\n').length,
                 idx: stripped.slice(m.index + m[0].length, j - 1).trim(),
                 line: stripped.slice(lnStart, lnEnd).trim() });
  }` },
];

let mismatches = 0;
for (const p of patches) {
  const parts = src.split(p.old);
  const found = parts.length - 1;
  if (found !== p.count) {
    console.error(`MISMATCH ${p.id}: expected ${p.count} occurrence(s), found ${found}. WRITING NOTHING.`);
    mismatches++;
  }
}
if (mismatches) process.exit(1);
for (const p of patches) {
  src = src.replace(p.old, p.new);
  console.log(`  ok ${p.id}: replaced exactly ${p.count}`);
}
writeFileSync(FILE, src);
console.log(`PATCHED ${FILE}: ${patches.length}/${patches.length} replacements, 0 mismatches`);
