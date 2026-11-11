/* scratch/triage/patch-lengrow-bake.mjs — asserted-patch #5 (Item-3 follow-on, session 7, 2026-11-11).
 * Target: .qa/lengrow-bake.mjs (the GROWERS guard). Open item 1 of NEXT-AGENT-PROMPT.md.
 * Defect (measured this session, read-only): the guard counts EVERY row declaring trait.len, so since
 * links-r87 it reports [spear, flail] and exits 2 before baking anything. But the flail is a LINK-ADDER:
 * boot (canonical :1810-1815) `continue`s past chain rows before the ladder loop — a chain grower has NO
 * LEN_CIRCLES row and NO ladder, only a chain.ext that boot gates and lengrow-build-proof audits. There is
 * nothing for this tool to bake for it. Measured: with the guard scoped to RIGID growers the tool runs and
 * its emitted LEN_CIRCLES block is BYTE-IDENTICAL to the shipped one except for two stale provenance
 * comment lines ("skill-r29 / LEN_STEPS 18"). So the "chain case" is a too-broad guard, not missing logic.
 * Fix: GROWERS = rigid growers only (still must be exactly [spear] — a SECOND rigid grower still refuses,
 * loudly); chain growers are listed on a visible line, never silently dropped.
 * Method (owner non-negotiable): exact-match + expected count, fail loudly, write nothing on mismatch.
 * This patches .qa/ only. The canonical is not read for writing by this script.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';

const FILE = '.qa/lengrow-bake.mjs';
const BACKUP = 'scratch/triage/lengrow-bake.mjs.orig';
let src = readFileSync(FILE, 'utf8');

const patches = [
  { id: 'LB1', count: 1,
    old: [
      "const GROWERS = Object.keys(api.WEAPONS).filter(id => api.WEAPONS[id].trait && api.WEAPONS[id].trait.len);",
    ].join('\n'),
    new: [
      "/* SCOPED 2026-11-11 (session 7): SUPERSEDED line kept visible —",
      " *   const GROWERS = Object.keys(api.WEAPONS).filter(id => api.WEAPONS[id].trait && api.WEAPONS[id].trait.len);",
      " * It counted the flail (trait.len since r86) and refused to run since links-r87. The flail is a LINK-ADDER:",
      " * boot (canonical :1810) skips chain rows — no ladder, no LEN_CIRCLES row, only a chain.ext that boot and",
      " * lengrow-build-proof gate. A covering to re-pack exists only for RIGID growers, so only they are counted. */",
      "const ALL_GROWERS = Object.keys(api.WEAPONS).filter(id => api.WEAPONS[id].trait && api.WEAPONS[id].trait.len);",
      "const GROWERS = ALL_GROWERS.filter(id => !api.WEAPONS[id].chain);",
      "const CHAIN_GROWERS = ALL_GROWERS.filter(id => api.WEAPONS[id].chain);",
    ].join('\n') },

  { id: 'LB2', count: 1,
    old: [
      "if (GROWERS.length !== 1 || GROWERS[0] !== 'spear') {",
      "  console.error(`lengrow-bake: expected exactly one growing weapon (spear), found [${GROWERS.join(', ')}] — this tool bakes the spear only; extend it deliberately if that changes.`);",
      "  process.exit(2);",
      "}",
    ].join('\n'),
    new: [
      "if (GROWERS.length !== 1 || GROWERS[0] !== 'spear') {",
      "  console.error(`lengrow-bake: expected exactly one RIGID growing weapon (spear), found [${GROWERS.join(', ')}] — this tool bakes the spear only; extend it deliberately if that changes. (chain growers [${CHAIN_GROWERS.join(', ')}] are not counted: they carry no ladder row.)`);",
      "  process.exit(2);",
      "}",
      "/* Chain growers are reported, never silently dropped: a visible line is the difference between",
      " * \"scoped by design\" and \"gone becomes invisible\". Their coverage lives elsewhere (boot's chain.ext",
      " * gate, lengrow-build-proof's chain half, inscribe's chain tie). */",
      "if (CHAIN_GROWERS.length) console.log(`lengrow-bake: chain growers skipped by design (link-adders: no ladder row to bake) — ${CHAIN_GROWERS.map(id => { const ex = api.WEAPONS[id].chain.ext; return id + (ex ? ` (chain.ext every ${ex.every}, max ${ex.max})` : ' (chain.ext MISSING)'); }).join(', ')}`);",
    ].join('\n') },

  { id: 'LB3', count: 1,
    old: [
      " * baking at all: they are data on a row plus a hook, with no covering to re-pack.",
      " */",
    ].join('\n'),
    new: [
      " * baking at all: they are data on a row plus a hook, with no covering to re-pack.",
      " *",
      " * DATED CORRECTION (2026-11-11, session 7) — the paragraph above stays visible as the record. A second",
      " * length-growing weapon DID land (the flail, trait.len, longchain-r86/links-r87), but it grows by ADDING",
      " * LINKS (chain.ext), not by stretching, so it has no covering to re-pack and nothing here to bake: boot",
      " * (canonical :1810) skips chain rows. The GROWERS guard therefore counts RIGID growers only and must",
      " * still be exactly [spear]; chain growers are listed on a visible line. A second RIGID grower still",
      " * refuses (exit 2), by design — that is when tempFor() would need generalising.",
      " */",
    ].join('\n') },
];

let mismatches = 0;
for (const p of patches) {
  const found = src.split(p.old).length - 1;
  if (found !== p.count) {
    console.error(`MISMATCH ${p.id}: expected ${p.count} occurrence(s), found ${found}. WRITING NOTHING.`);
    mismatches++;
  }
}
if (mismatches) process.exit(1);
if (!existsSync(BACKUP)) copyFileSync(FILE, BACKUP);
for (const p of patches) {
  src = src.replace(p.old, () => p.new);
  console.log(`  ok ${p.id}: replaced exactly ${p.count}`);
}
writeFileSync(FILE, src);
console.log(`PATCHED ${FILE}: ${patches.length}/${patches.length} replacements, 0 mismatches (pre-patch copy: ${BACKUP})`);
