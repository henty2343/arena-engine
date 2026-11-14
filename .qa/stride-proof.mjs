#!/usr/bin/env node
/* .qa/stride-proof.mjs - measure.mjs reads the sim's chain-pose tape at the sim's own width.
 *
 * WHY THIS FILE EXISTS: links-r87 widened the sim's chain pose (fl.u) from 6 to 18 slots, so the per-substep
 * tape G.auditFl became 37 wide (sub + 18 + 18) while measure.mjs kept STRF = 13 and 6 slots. flAt() then
 * resolved only ~10% of the substep rows, every other row came back null, flMissing counted them, and each
 * chain recompute silently fell back to the rigid spine - the "harness chain-pose integrity" failure in the
 * owner-go --solidity run (HANDOFF s7), the same signature the file names as the cause of the 2026-10-27 red.
 * Nothing an agent can run failed when the width moved. This probe makes it fail.
 *
 * WHAT IT ASSERTS (it never runs measure.mjs; it lifts measure.mjs's own FL_SLOTS / STRF / flAt text and runs
 * THAT against a real tape from the shipped sim, so a regression in the file is what turns it red):
 *   P1  the sim's fl.u is FL_SLOTS wide for both fighters, and the tape is exactly STRF wide per substep row;
 *   P2  measure.mjs's own flAt resolves 100% of the substep rows on real tapes (chain pairs, fight ticks);
 *   P3  measure.mjs's entry-pose stash copies FL_SLOTS slots, not a hard-coded 6 (the sub=-1 entry record
 *       has no tape row; the stash is its only source).
 *   Controls (each must FAIL its intended check, so the probe cannot pass vacuously): the pre-links-r87 values
 *   (FL_SLOTS 6, STRF 13) lifted into the same harness resolve far under 100% of the rows.
 *
 * VACUITY RULE: P2 states its sample and fails under MIN_ROWS rows. Read-only. Tier 0.
 * Usage: node .qa/stride-proof.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
import { loadSim } from '../tools/lib/load-sim.mjs';
const api = loadSim(join(here, '..', 'previews', 'spinclash-preview.html'), ['newGame', 'tick']);
const { newGame, tick } = api;

const MSRC = readFileSync(join(here, '..', 'measure.mjs'), 'utf8');
const a = MSRC.indexOf('const FL_SLOTS'), b = MSRC.indexOf('const EPS = 1e-9;');
if (a < 0 || b < a) { console.log(JSON.stringify({ check: 'stride-proof', ok: false, error: 'measure.mjs no longer carries the FL_SLOTS ... flAt block this probe lifts' })); process.exit(1); }
const BLOCK = MSRC.slice(a, b);
const lift = (src) => new Function(src + '\nreturn { STRF, FL_SLOTS, flAt };')();
const real = lift(BLOCK);

const MIN_ROWS = 2000, TICKS = 800;
const tapeStats = (L, pairs) => {
  let rows = 0, resolved = 0, widthOk = true, uOk = true;
  for (const weapons of pairs) {
    const G = newGame(101, { weapons }); G.audit = true;
    for (let k = 0; k < TICKS && !G.over; k++) {
      tick(G);
      if (G.phase !== 'fight' || !G.auditSubs.length) continue;
      for (const f of G.fighters) if (!f.fl || f.fl.u.length !== L.FL_SLOTS) uOk = false;
      const FL = G.auditFl, nsub = G.auditSubs.length / 13 - 1;   // the state tape: stride 13, one sub=-1 entry record first
      if (FL.length !== nsub * L.STRF) widthOk = false;
      for (let s = 0; s < nsub; s++) { rows++; if (L.flAt(FL, s, 0) && L.flAt(FL, s, 1)) resolved++; }
    }
  }
  return { rows, resolved, widthOk, uOk };
};
const PAIRS = [['flail', 'hammer'], ['nunchaku', 'scythe']];

let pass = 0, fail = 0;
const ok = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${d ? '  - ' + d : ''}`); };

const R = tapeStats(real, PAIRS);
ok('P1 fl.u is FL_SLOTS wide and the tape is STRF wide per row', R.uOk && R.widthOk, `FL_SLOTS ${real.FL_SLOTS}, STRF ${real.STRF}`);
ok('P2 measure.mjs flAt resolves every substep row', R.rows >= MIN_ROWS && R.resolved === R.rows, `${R.resolved}/${R.rows} rows (min ${MIN_ROWS})`);
ok('P3 the entry-pose stash copies FL_SLOTS slots (no hard-coded 6)', /d\[q\] = u\[q\]/.test(MSRC) && /q < FL_SLOTS; q\+\+\) d\[q\] = u\[q\]/.test(MSRC) && !/q < 6/.test(MSRC) && !/fi \* 6/.test(MSRC));

const stale = lift(BLOCK.replace(/const FL_SLOTS = \d+;/, 'const FL_SLOTS = 6;').replace(/const STRF = [^;]+;/, 'const STRF = 13;'));
const C = tapeStats(stale, PAIRS);
ok('CONTROL the pre-links-r87 width (6 slots, stride 13) fails P1 and P2', !(C.uOk && C.widthOk) && C.resolved < 0.5 * C.rows, `${C.resolved}/${C.rows} rows resolved, width ok ${C.widthOk}`);

console.log(JSON.stringify({ check: 'stride-proof', pass, fail, ok: fail === 0, FL_SLOTS: real.FL_SLOTS, STRF: real.STRF, rows: R.rows, resolved: R.resolved, controlResolved: C.resolved }));
process.exit(fail === 0 ? 0 : 1);
