/* scratch/triage/patch-lengrow-proof.mjs — asserted-patch #4 (Item-3 triage, session 5, 2026-11-11).
 * Target: .qa/lengrow-build-proof.mjs :91. Menu item 4.
 * Defect (measured this session): the cell asserts GROWERS.every(id => LEN_LADDER[id]) with
 * GROWERS = rows declaring trait.len (:79). Since longchain-r86/links-r87 the flail is a LINK-ADDER:
 * boot (canonical :1810-1815) SKIPS chain rows before building any ladder and instead requires
 * chain.ext { pitch, unit, every, max, ring, bar }. So the assert FAILs on correct code
 * ("spear,flail", 56/1 red) — the same false-positive class as pair-proof item 3.
 * Re-seed per column A: split growers into RIGID (no W.chain -> must have a ladder row) and CHAIN
 * (W.chain -> must have chain.ext with positive every/max/unit AND ext.max >= floor(LEN_STEPS/every),
 * mirroring the boot gate's law). The catch "a new trait.len row forgot its mechanism" SURVIVES both
 * ways: a rigid row without a ladder trips half 1; a chain row without ext trips half 2; a chain row
 * whose cap under-covers the steps trips half 3.
 * Method (owner non-negotiable): exact-match + expected count, fail loudly, write nothing on mismatch.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = '.qa/lengrow-build-proof.mjs';
let src = readFileSync(FILE, 'utf8');

const patches = [
  { id: 'LG1', count: 1,
    old: `ok('every growing weapon has a ladder, and no other does', GROWERS.every(id => LEN_LADDER[id]) && WEAPON_IDS.filter(id => LEN_LADDER[id]).length === GROWERS.length, GROWERS.join(',') || '(none)');`,
    new: `/* RE-SEEDED 2026-11-11 (session 5, menu item 4): SUPERSEDED assertion kept visible —
   *   ok('every growing weapon has a ladder, and no other does', GROWERS.every(id => LEN_LADDER[id]) && ...)
   * It FAILed on CORRECT code since links-r87: the flail declares trait.len but is a LINK-ADDER —
   * boot (canonical :1810) skips chain rows before the ladder loop and requires chain.ext instead.
   * Re-seed keeps BOTH halves of the original catch alive: RIGID growers must have a ladder row
   * ("new trait.len row forgot its mechanism"), CHAIN growers must carry a well-formed chain.ext
   * whose unit cap covers every step (the same law boot gates, canonical :1812-1814). */
const RIGID_GROWERS = GROWERS.filter(id => !WEAPONS[id].chain);
const CHAIN_GROWERS = GROWERS.filter(id => WEAPONS[id].chain);
const chainExtOk = (id) => { const ex = WEAPONS[id].chain.ext; return !!ex && ex.every >= 1 && ex.max >= 1 && ex.unit > 0 && ex.max >= Math.floor(LEN_STEPS / ex.every); };
ok('every growing weapon has ITS mechanism: rigid growers a ladder row, chain growers a covering chain.ext — and no other row grows',
  GROWERS.every(id => WEAPONS[id].chain ? chainExtOk(id) : !!LEN_LADDER[id]) &&
  WEAPON_IDS.filter(id => LEN_LADDER[id]).length === RIGID_GROWERS.length &&
  WEAPON_IDS.filter(id => WEAPONS[id].chain && WEAPONS[id].chain.ext).length === CHAIN_GROWERS.length,
  \`rigid: \${RIGID_GROWERS.join(',') || '(none)'} · chain: \${CHAIN_GROWERS.map(id => id + '(ext ' + WEAPONS[id].chain.ext.every + '/' + WEAPONS[id].chain.ext.max + ')').join(',') || '(none)'}\`);` },
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
