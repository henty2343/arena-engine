/* scratch/triage/patch-lengrow-proof-lg2.mjs — asserted-patch LG2 (Item-3 triage, session 6, 2026-11-11).
 * Target: .qa/lengrow-build-proof.mjs, the RE-SEEDED menu-item-4 cell's DETAIL string.
 *
 * Defect (measured this session by scratch/triage/diag-nonvacuity-lengrow.mjs, scenario B2a):
 * the re-seeded cell's verdict logic is sound — chainExtOk() null-guards `chain.ext` — but the
 * cell's DETAIL string dereferences `WEAPONS[id].chain.ext.every` UNGUARDED. A chain grower whose
 * ext is missing altogether (the "a new trait.len row forgot its mechanism" case the cell exists to
 * catch) therefore CRASHES the proof with a TypeError instead of reporting FAIL.
 *
 * Why that matters (the seam-proof G4 lesson, verbatim): a dead cell does not report red — it
 * ABORTS the run, and every assertion AFTER it never executes. This cell is section A of
 * lengrow-build-proof; a crash there silences sections B–O (ladder shape, never-thickens, authored
 * rate, rigid head, scaling shaft, no-gap, REACH, MINR, row-not-mutated, grow(), round-reset,
 * collision-follows, others-unaffected, non-vacuity, uniform cap). The catch must REPORT RED.
 *
 * Method (owner non-negotiable): exact-match + expected count, fail loudly, write nothing on mismatch.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = '.qa/lengrow-build-proof.mjs';
let src = readFileSync(FILE, 'utf8');

const patches = [
  { id: 'LG2', count: 1,
    old: "`rigid: ${RIGID_GROWERS.join(',') || '(none)'} · chain: ${CHAIN_GROWERS.map(id => id + '(ext ' + WEAPONS[id].chain.ext.every + '/' + WEAPONS[id].chain.ext.max + ')').join(',') || '(none)'}`",
    new: "`rigid: ${RIGID_GROWERS.join(',') || '(none)'} · chain: ${CHAIN_GROWERS.map(id => id + '(ext ' + (WEAPONS[id].chain.ext ? WEAPONS[id].chain.ext.every + '/' + WEAPONS[id].chain.ext.max : 'MISSING') + ')').join(',') || '(none)'}`" },
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
