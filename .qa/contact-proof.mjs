#!/usr/bin/env node
/* .qa/contact-proof.mjs - agent-runnable assertions for the CONTACT laws that had no runnable probe.
 *
 * Why this file exists: the law-to-probe table in docs/LAWS.md carried C4 (one damage per touch; the
 * re-arm gates) and C5 (a parry recoils both weapons) as `owner-run only` - only measure.mjs audited
 * them, and agents never run measure.mjs. So a break in either law would fail NOTHING an agent can
 * run. Both are pure SIM logic, so the house loader (tools/lib/load-sim.mjs) can assert them
 * headlessly in seconds.
 *
 *   C4  one damage per touch; the re-arm gates
 *       The blade latch (f.bladeStuck) is set by the touch that damages. While it is set the touch
 *       returns early, so a latched blade deals nothing more. It re-arms only when the blade has
 *       cleared the body by more than CFG.reArmPad AND either the peak clearance since the latch
 *       reached CFG.reArmDeep (a genuine disengagement) OR CFG.reArmWait ticks have passed (the
 *       poke rhythm). That is the whole law, and every term of it is readable state.
 *       The probe checks all three: no fighter deals two damaging touches in one tick; every
 *       re-arm it can observe satisfies the gate (read back off the fighter's own peak/latch
 *       counters, so the sim's arithmetic is the sim's own); and every hit after a fighter's first
 *       is preceded by a re-arm - i.e. one damage per latch.
 *   C5  a parry recoils both weapons
 *       The law's own audit text is "every parry recoils both SPINS": the touch flips both
 *       fighters' spin signs (rule 5) and shoves both apart. The probe reads the sign flip on both
 *       fighters and checks the event carries both post-flip spins.
 *
 * THE OBSERVATION WINDOW (read this before "fixing" the probe): the probe samples the fighters'
 * state once per TICK, while the sim resolves every SUBSTEP. A re-arm that happens and is
 * immediately re-latched inside one tick is therefore invisible to the probe - and it is exactly
 * the case the "two hits in one tick" assertion covers, so nothing is lost. A re-arm observed at a
 * tick boundary with no hit in that tick carries the peak/latch counters the sim actually used, so
 * the gate can be checked exactly.
 *
 * VACUITY RULE (house): every assertion states its own sample size. A build that stalls these seeds
 * makes them FAIL rather than passing on zero observations.
 *
 * Read-only: writes nothing, runs no measure.mjs, never touches the canonical. Tier 0.
 * Usage: node .qa/contact-proof.mjs [file=previews/spinclash-preview.html]
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(process.argv[2] ? join(here, '..', process.argv[2]) : join(here, '..', 'previews', 'spinclash-preview.html'));

import { loadSim } from '../tools/lib/load-sim.mjs';
const api = loadSim(FILE, ['newGame', 'tick', 'CFG', 'WEAPONS']);
const { newGame, tick, CFG } = api;

/* The law constants, spelled out here so the probe does not read them back out of the build it is
 * judging: a probe that copies the value it is checking proves nothing. */
const RE_ARM_PAD = 12, RE_ARM_DEEP = 85, RE_ARM_WAIT = 90;

/* Tick budget per cell. A melee needs thousands of ticks before the blades actually touch. */
const TICK_BUDGET = 6000;
/* Minimum observations, so an assertion cannot pass on an empty sample. */
const MIN_HITS = 20, MIN_REARMS = 10, MIN_PARRIES = 10;

/* The cells: melee pairs whose geometry differs (spin 0.7 vs 2.0 traits, a length-growth spear),
 * over several seeds, so the latch is exercised in more than one shape. */
const CELLS = [
  ['sword+sword s3', ['sword', 'sword'], 3],
  ['sword+sword s11', ['sword', 'sword'], 11],
  ['sword+sword s21', ['sword', 'sword'], 21],
  ['axe+sword s7', ['axe', 'sword'], 7],
  ['hammer+sword s9', ['hammer', 'sword'], 9],
  ['dagger+sword s5', ['dagger', 'sword'], 5],
  ['mace+sword s2', ['mace', 'sword'], 2],
  ['spear+sword s4', ['spear', 'sword'], 4],
];

let pass = 0, fail = 0;
const ok = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${d ? '  - ' + d : ''}`); };

const T = { hits: 0, doubleHitTicks: 0, unArmedHits: 0, reArms: 0, gateViolations: 0, parries: 0, bothFlipped: 0, eventSpinOk: 0, eventSpinMismatch: 0 };
const notes = [];

for (const [name, weapons, seed] of CELLS) {
  const G = newGame(seed, { weapons });
  const armed = [true, true];          // a fighter may hit until it has latched once
  let t = 0;
  while (!G.over && t < TICK_BUDGET) {
    const preSpin = [G.fighters[0].spin, G.fighters[1].spin];
    const wasStuck = [G.fighters[0].bladeStuck, G.fighters[1].bladeStuck];
    /* rollWeapons() runs on the first tick of a reveal: it resets the fighters (bladeStuck, the peak,
     * the latch clock). That is law T1 (traits reset every round), NOT a re-arm - the fighter did
     * not disengage, the round ended. The gate does not apply to it. */
    const rolling = G.phase === 'reveal' && G.phaseT === 0;
    tick(G);
    t++;
    const hits = G.events.filter(e => e.kind === 'hit' && !e.shot);
    const perSlot = [0, 0];
    for (const h of hits) perSlot[h.by]++;
    for (let s = 0; s < 2; s++) {
      const f = G.fighters[s];
      if (perSlot[s] > 0) {
        T.hits += perSlot[s];
        if (perSlot[s] > 1) { T.doubleHitTicks++; notes.push(`${name} t=${t} slot ${s} dealt ${perSlot[s]} hits in one tick`); }
        if (!armed[s]) { T.unArmedHits++; notes.push(`${name} t=${t} slot ${s} hit while NOT armed`); }
        armed[s] = false;
      }
      if (rolling) { armed[s] = true; continue; }   // the round reset re-arms by law T1
      /* A re-arm observed at a tick boundary with no hit in that tick: the peak/latch counters are
       * the ones the sim used for the gate, so the gate can be read back exactly. */
      const isStuck = f.bladeStuck;
      if (wasStuck[s] && !isStuck) {
        T.reArms++;
        const elapsed = t - f.bladeLatchTick;
        const gateOk = f.bladeClearPeak > RE_ARM_PAD && (f.bladeClearPeak >= RE_ARM_DEEP || elapsed >= RE_ARM_WAIT);
        if (!gateOk) { T.gateViolations++; notes.push(`${name} t=${t} slot ${s} re-armed outside the gate: peak=${f.bladeClearPeak.toFixed(2)} (pad ${RE_ARM_PAD}, deep ${RE_ARM_DEEP}), elapsed=${elapsed} (wait ${RE_ARM_WAIT})`); }
        armed[s] = true;
      }
    }
    /* C5 - a parry flips both spins, and the event carries both flipped spins.
     * The SIGN is the law (rule 5 flips both spin signs); the MAGNITUDE may also change in the same
     * tick, because a growth event adds to the spin and keeps its sign. So the assertion is on the
     * sign, not on the exact negation. */
    for (const p of G.events) {
      if (p.kind !== 'parry') continue;
      T.parries++;
      const post = [G.fighters[0].spin, G.fighters[1].spin];
      if (post[0] * preSpin[0] < 0 && post[1] * preSpin[1] < 0) T.bothFlipped++;
      else notes.push(`${name} t=${t} parry did not flip both spins: pre=${preSpin} post=${post}`);
      if (p.spin0 * preSpin[0] < 0 && p.spin1 * preSpin[1] < 0) T.eventSpinOk++;
      else { T.eventSpinMismatch++; notes.push(`${name} t=${t} parry event spins (${p.spin0},${p.spin1}) are not the flipped pre-tick spins ${preSpin}`); }
    }
  }
}

console.log('C4 - one damage per touch; the re-arm gates');
ok('C4 a fighter never deals two damaging blade hits in one tick',
   T.doubleHitTicks === 0 && T.hits >= MIN_HITS,
   `${T.hits} blade hits over ${CELLS.length} cell(s), ${T.doubleHitTicks} double-hit tick(s)`);
ok('C4 every hit after the first is preceded by a re-arm (one damage per latch)',
   T.unArmedHits === 0 && T.hits >= MIN_HITS,
   `${T.unArmedHits} hit(s) landed with the blade still latched`);
ok('C4 every re-arm satisfies the deep-disengage gate',
   T.gateViolations === 0 && T.reArms >= MIN_REARMS,
   `${T.reArms} re-arm(s) observed, ${T.gateViolations} outside the gate (pad ${RE_ARM_PAD}, deep ${RE_ARM_DEEP}, wait ${RE_ARM_WAIT})`);

console.log('C5 - a parry recoils both weapons');
ok('C5 every parry flips BOTH weapons spins',
   T.bothFlipped === T.parries && T.parries >= MIN_PARRIES,
   `${T.bothFlipped}/${T.parries} parries flipped both spins`);
ok('C5 the parry event carries both flipped spins',
   T.eventSpinMismatch === 0 && T.eventSpinOk === T.parries && T.parries >= MIN_PARRIES,
   `${T.eventSpinOk}/${T.parries} events carried both flipped spins`);

console.log(`\n${pass}/${pass + fail} passed`);
if (notes.length) { console.log('notes:'); notes.slice(0, 8).forEach(n => console.log('   ' + n)); }
if (fail) { console.log(`${fail} FAILED`); process.exit(1); }
console.log(`Read-only: nothing written, measure.mjs untouched. ${T.hits} blade hits, ${T.reArms} re-arms, ${T.parries} parries over ${CELLS.length} cell(s).`);
console.log(JSON.stringify({ check: 'contact-proof', pass, fail, ok: fail === 0, hits: T.hits, reArms: T.reArms, parries: T.parries }));
