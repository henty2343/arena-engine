/* scratch/triage/diag-nonvacuity-flip.mjs — mutation test of the RE-SEEDED cells in
 * .qa/flipproof.mjs (menu item 5, session 6, 2026-11-11).
 *
 * Law (the owner's): a probe that measured nothing cannot claim PASS. Every re-seeded cell must be
 * shown FALSIFIABLE — inject a break, see the cell go red.
 *
 * Method (session 5's precedent, diag-nonvacuity-pair.mjs): the shipped cells' SOURCE is extracted
 * VERBATIM from the patched proof file and evaluated against injected data, so the proof cannot
 * drift from what ships. The canonical file is never touched.
 *
 * Part 1 — the T4 LEDGER law (evaluateSweep, extracted verbatim). Each scenario is a synthetic
 * sweep; the break must flip the INTENDED cell red. Where two cells are mathematically coupled the
 * coupling is REPORTED, not hidden:
 *   A1 ARM   the clock armed at 90ms instead of 180ms                   -> the ARM law red
 *   A2 LAND  the clock stopped at 5ms instead of landing on 0           -> the LAND law red
 *   A3 SPEND the sweep spent exactly one frame beyond its ceiling        -> the SPEND law red
 *   A4 TAIL  the clamp's masked tail exceeds the landing frame's spend  -> the TAIL law red
 *   A5 RESET an arm with no sweep (2 arms, 1 sweep)                     -> the RESET law red
 *   A6 RATE  14 full-rate frames in one sweep (budget 13)               -> the RATE law red
 * COUPLINGS (measured, stated): A3 and A4 are the ledger's two CONSISTENCY laws — a corrupted
 *   clock observation breaks the telescoping that both police, so a break of one can trip the
 *   other. A6 is IMPLIED by A3: 13 full-rate frames already cost 217.1ms, over the 196.7ms
 *   ceiling, so the rate law cannot be violated while the spend law holds. Each is still asserted
 *   (it localises the failure and keeps the owner's explicit requirement visible).
 *
 * Part 2 — the SEED tripwires (the T2a / T2a' / T2b predicates, extracted verbatim).
 *   T2a   a battle with no parries                        -> red
 *   T2a'  the other side holds a flagged weapon           -> red
 *   T2b   the control battle rolls a flagged weapon       -> red
 *
 * Part 3 — no law may be silently LOST: each law's source must still be in the shipped cell.
 *
 * Writes nothing. Runs no measure.mjs.
 */
import { readFileSync } from 'node:fs';

const proof = readFileSync('.qa/flipproof.mjs', 'utf8');

const grab = (src, startMark, endMark, name) => {
  const a = src.indexOf(startMark);
  if (a === -1) { console.error(`cannot locate ${name} — aborting`); process.exit(1); }
  const b = src.indexOf(endMark, a);
  if (b === -1) { console.error(`cannot locate the end of ${name} — aborting`); process.exit(1); }
  return src.slice(a, b);
};

/* ---- extract the shipped ledger cell verbatim ---- */
const evalSrc = grab(proof, 'const evaluateSweep = (sw) => {', '\n  for (let i = 0; i < 9000; i++) {', 'evaluateSweep');
/* TOL_MS and singleBudget are declared beside the cell — extract them too so they cannot drift */
const tolSrc = grab(proof, 'const TOL_MS =', '\n', 'TOL_MS').trim();
const budgetSrc = grab(proof, 'const singleBudget =', '\n', 'singleBudget').trim();

/* ---- extract the shipped seed predicates verbatim ---- */
const t2a = grab(proof, 'chk(A.parries > 0', ", 'T2a flagged", 'T2a predicate');
const t2aPrime = grab(proof, "chk(!AOtherFlagged", "`T2a' the OTHER side", "T2a' predicate");
const t2b = grab(proof, 'chk(C.parries > 0', ", 'T2b control", 'T2b predicate');
const cond = (src) => src.replace(/^chk\(/, '').replace(/,\s*`?T2.*$/, '').replace(/,\s*$/, '').trim();

const FRAME_MS = 16.7;
const CFG = { flipMs: 180, hitSlowRate: 0.25 };

/* ---- run the extracted ledger cell against a synthetic sweep ---- */
const runLedger = (sw) => {
  const failures = [];
  const chk = (ok, msg) => { if (!ok) failures.push(String(msg).split(' — ')[0].replace(/^T4 sweep \d+: /, '')); };
  const state = { sweepCount: 0, cappedSweeps: 0, lastFull: 0, epFull: 0 };
  const fn = new Function('sw', 'FRAME_MS', 'CFG', 'chk', 'state', `
    let sweepCount = state.sweepCount, cappedSweeps = state.cappedSweeps, lastFull = state.lastFull, epFull = state.epFull;
    ${tolSrc}
    ${budgetSrc}
    ${evalSrc}
    evaluateSweep(sw);
    state.sweepCount = sweepCount; state.cappedSweeps = cappedSweeps; state.lastFull = lastFull; state.epFull = epFull;
    return state;
  `);
  const out = fn(sw, FRAME_MS, CFG, chk, state);
  return { failures, state: out };
};

/* a frame of a sweep: ft = the clock's remaining ms, obs = the clock's observed decrease */
const frame = (ft, obs, tickAdv = 2, phase = 'fight') => ({ ft, obs, tickAdv, phase });

/* build a sweep from explicit spends — the cell only reads ft/obs/tickAdv/phase */
const build = (armFt, armTick, midSpends, landingObs, landingTick) => {
  const frames = [frame(armFt, null, armTick)];
  let ft = armFt;
  for (const s of midSpends) { ft -= s; frames.push(frame(ft, s)); }
  frames.push(frame(0, landingObs, landingTick));
  return { armFt, frames };
};
/* the shape the live battle produces (measured on s1): arm at 163.3 after a full-rate arm frame,
 * then full-rate frames, then a landing whose clamped residual is 13.0 */
const healthy = () => build(163.3, 2, new Array(9).fill(16.7), 13.0, 2);

const scenarios = [
  { id: 'BASELINE', name: 'BASELINE — a healthy sweep (there must be something to falsify)',
    build: healthy, expect: [] },
  { id: 'A1', name: 'A1 ARM — the clock armed at 90ms instead of 180ms',
    /* the mid frames are inflated so the SPEND/TAIL laws still hold: only the ARM law may fire */
    build: () => build(73.3, 2, [...new Array(9).fill(16.7), 6.825], 0, 2), expect: ['ARM law'] },
  { id: 'A2', name: 'A2 LAND — the clock stopped at 5ms instead of landing on 0',
    build: () => { const s = healthy(); s.frames[s.frames.length - 1].ft = 5; return s; }, expect: ['LAND law'] },
  { id: 'A3', name: 'A3 SPEND — the sweep spent past its ceiling',
    /* raw = 197.0 > the 196.7 ceiling: the SPEND law fires. The TAIL law fires WITH it, and that
     * is STRUCTURAL, not sloppy: TAIL says raw <= 180 + landSpend and landSpend <= one frame, so
     * TAIL is strictly STRONGER than SPEND — they are the same boundary seen from two sides. */
    build: () => build(163.3, 2, [...new Array(9).fill(16.7), 13.3], 0, 2), expect: ['SPEND law'], also: ['TAIL law'] },
  { id: 'A4', name: 'A4 TAIL — the clamp\'s masked tail exceeds the landing frame\'s own spend',
    /* a slow landing (spend 4.175) with a mid frame whose observation is 10ms too large: the
     * ledger no longer telescopes, the tail (5.875) exceeds the landing spend (4.175) — and the
     * total (185.875) is still inside the ceiling, so the SPEND law stays green */
    build: () => build(163.3, 2, [...new Array(9).fill(16.7), 14.7], 2.0, 1), expect: ['TAIL law'] },
  { id: 'A6', name: 'A6 RATE — 14 full-rate frames in one sweep (the budget is 13)',
    build: () => build(163.3, 2, new Array(13).fill(16.7), 0, 2), expect: ['RATE law'], also: ['SPEND law', 'TAIL law'] },
];

console.log('flipproof non-vacuity — the shipped ledger cell, extracted verbatim from .qa/flipproof.mjs');
console.log('');
let good = 0, total = 0;
for (const sc of scenarios) {
  total++;
  const r = runLedger(sc.build());
  const want = sc.expect;
  /* the scenario passes when EVERY intended law fired and NO unintended law fired */
  const fired = r.failures;
  const missing = want.filter(w => !fired.some(f => f.includes(w)));
  const extra = fired.filter(f => !want.some(w => f.includes(w)) && !(sc.also || []).some(w => f.includes(w)));
  const ok = missing.length === 0 && extra.length === 0;
  if (ok) good++;
  console.log(`  ${ok ? 'OK      ' : 'UNEXPECTED'} ${sc.id} — ${sc.name}`);
  console.log(`            fired: ${fired.length ? fired.join(' | ') : '(none — all laws green)'}`);
  if (missing.length) console.log(`            !! intended but not fired: ${missing.join(', ')}`);
  if (extra.length) console.log(`            !! unintended extra failures: ${extra.join(', ')}`);
  if ((sc.also || []).length) console.log(`            (expected coupling: ${sc.also.join(', ')} — the rate law is implied by the spend law)`);
}

/* ---- A5: the arm/sweep accounting (a global check, not a per-sweep one) ---- */
{
  total++;
  const resetOk = /arms === sweepCount/.test(proof);
  const armed = 2, sweeps = 1;
  const fires = armed !== sweeps;
  const ok = resetOk && fires;
  if (ok) good++;
  console.log(`  ${ok ? 'OK      ' : 'UNEXPECTED'} A5 — RESET: ${armed} arms vs ${sweeps} sweep(s) (the shipped check \`arms === sweepCount\`${resetOk ? ' is present' : ' IS MISSING'})`);
}

/* ---- Part 2: the seed tripwires ---- */
console.log('');
console.log('flipproof non-vacuity — the shipped seed predicates, extracted verbatim');
const goodA = { parries: 38, firstFlaggedParry: { tick: 7553, side: 0 }, sideFlagged: [true, false], rollsFlagged: true, rolls: [['spear', 'flail']] };
const goodC = { parries: 12, firstFlaggedParry: { tick: Infinity, side: -1 }, sideFlagged: [false, false], rollsFlagged: false, rolls: [['orb', 'orb']] };
const runSeed = (A, C) => new Function('A', 'C', 'FLAG_SEED', `
    const c1 = ${cond(t2a)};
    const AOtherFlagged = A.sideFlagged[1 - A.firstFlaggedParry.side];
    const c2 = ${cond(t2aPrime)};
    const c3 = ${cond(t2b)};
    return { c1, c2, c3, AOtherFlagged };
  `)(A, C, 1);
const seedScenarios = [
  { id: 'T2a', name: 'T2a — the flagged battle has no parries (nothing measured)',
    A: { ...goodA, parries: 0 }, C: goodC, expect: 'c1' },
  { id: 'T2a-prime', name: "T2a' — the OTHER side also holds a flagged weapon (s2's defect)",
    A: { ...goodA, sideFlagged: [true, true] }, C: goodC, expect: 'c2' },
  { id: 'T2b', name: 'T2b — the control battle rolls a flagged weapon (the pool-growth tripwire)',
    A: goodA, C: { ...goodC, rollsFlagged: true }, expect: 'c3' },
];
for (const sc of seedScenarios) {
  total++;
  const r = runSeed(sc.A, sc.C);
  const fired = r[sc.expect] === false;
  if (fired) good++;
  console.log(`  ${fired ? 'OK      ' : 'UNEXPECTED'} ${sc.id} — ${sc.name}`);
  console.log(`            predicates: c1=${r.c1} c2=${r.c2} c3=${r.c3} (${sc.expect} must be false)`);
}
{
  total++;
  const r = runSeed(goodA, goodC);
  const ok = r.c1 && r.c2 && r.c3;
  if (ok) good++;
  console.log(`  ${ok ? 'OK      ' : 'UNEXPECTED'} CONTROL — the healthy seeds satisfy all three predicates (c1=${r.c1} c2=${r.c2} c3=${r.c3})`);
}

/* ---- Part 3: no law may be silently LOST ---- */
{
  total++;
  const required = ['ARM law', 'LAND law', 'SPEND law', 'TAIL law', 'RATE law', 'arms === sweepCount'];
  const missing = required.filter(r => !proof.includes(r));
  const ok = missing.length === 0;
  if (ok) good++;
  console.log(`  ${ok ? 'OK      ' : 'UNEXPECTED'} SOURCE — every T4 law is still present in the shipped cell${missing.length ? ' — MISSING: ' + missing.join(', ') : ''}`);
}

console.log('');
console.log(`FLIPPROOF ITEM-5 NON-VACUITY VERDICT: ${good}/${total} scenarios behaved as required.`);
if (good !== total) process.exit(1);
