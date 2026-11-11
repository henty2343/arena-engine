/* scratch/triage/patch-nonvacuity.mjs — asserted-patch #2 (Item-3 triage, session 4, 2026-11-11).
 * Target: scratch/triage/diag-nonvacuity-seam.mjs (the fixed diag the session-3 handoff claims ran
 * 10/10 NON-VACUOUS, exit 0 — NOT reproducible in this workspace snapshot: it runs 7/7 NON-VACUOUS
 * and then CRASHES at its G6 mutation, which trips the hex ⊥ returns boot guard before the row
 * mutation can ever be observed; the script's own header law says a crash is not a proof).
 * Method (owner non-negotiable): exact-match + expected count, fail loudly, write nothing on mismatch.
 * N1: the G6 break re-seeded from a BOOT-GUARD injection (which proves the GUARD, not the cell) to
 *     a scalar runtime injection that the cell's own predicate reads — the handoff's recorded lesson:
 *     "prefer breaks that mutate scalars over breaks that trip boot guards, unless the guard IS the
 *     coverage" (for g5/g8 the guard IS the coverage — those stay untouched).
 * N2: dated correction appended to the header (history is never rewritten; the original text stands).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'scratch/triage/diag-nonvacuity-seam.mjs';
let src = readFileSync(FILE, 'utf8');

const patches = [
  { id: 'N1', count: 1,
    old: `  const m=load("WEAPONS.wand.shot.returns = true;");
  report('G6 non-cycle launcher untouched', pred(load(null)), pred(m), 'wand shot given returns:true');`,
    new: `  /* CORRECTION 2026-11-11 (session 4): the original break here was load("WEAPONS.wand.shot.returns = true;")
   * — a ROW edit injected before boot, which trips the hexfam-r68 guard at canonical :1572
   * ("shot.hex requires a PLAIN flight path — ... rides no other law's shot"; the wand is a hex row)
   * BEFORE the mutation can ever reach the predicate. The diag crashed: 7 cells reported, NO VERDICT
   * line, exit 1 — the session-3 claim "fixed diag runs 10/10 NON-VACUOUS, exit 0" is NOT reproducible
   * as shipped (recorded here as a dated correction; the superseded line kept visible below in comment):
   *   const m=load("WEAPONS.wand.shot.returns = true;");            [SUPERSEDED — trips the boot guard]
   * Re-seeded per the owner's lesson: prefer a break that MUTATES A SCALAR over one that trips a boot
   * guard, unless the guard IS the coverage (true for g5/g8 — they keep their guard injections).
   * The scalar break forges return-state onto every NON-returning shot at birth — exactly what G6
   * asserts never happens (s.returns!==undefined ⇒ wbad++ ⇒ predicate false). */
  const m=loadM('      else if (!st.pinned && !st.returns) { st.x += st.vx * sdt; st.y += st.vy * sdt; }',
                '      else if (!st.pinned && !st.returns) { st.x += st.vx * sdt; st.y += st.vy * sdt; st.returns = true; }');
  report('G6 non-cycle launcher untouched', pred(load(null)), pred(m), 'runtime forge: non-returning shots stamped with return state');` },
  { id: 'N2', count: 1,
    old: ` * Writes nothing; runs no measure.mjs.
 */`,
    new: ` * Writes nothing; runs no measure.mjs.
 *
 * DATED CORRECTION 2026-11-11 (session 4): the G6 mutation as shipped (a pre-boot ROW edit
 * WEAPONS.wand.shot.returns = true) trips the hex⊥returns boot guard (canonical :1572) and kills the
 * run — so this file could not have produced "10/10 NON-VACUOUS, exit 0" as the session-3 handoff
 * records (observed here: 7/7 NON-VACUOUS, then an uncaught Error, no verdict line, exit 1).
 * Patches applied by scratch/triage/patch-nonvacuity.mjs (this file's predecessor in the patcher
 * lineage): N1 re-seeds the G6 break to a scalar runtime injection (see N1's in-place record);
 * N2 is this note. Everything else in this diag is unchanged.
 */` },
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
