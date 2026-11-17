#!/usr/bin/env node
/* .qa/verdict-proof.mjs - the DEFECT-TRACKER VERDICTS for law 3 / 3s (owner-delegated ruling 2026-11-16, #768).
 *
 * WHY THIS FILE EXISTS: measure.mjs's law-3 and law-3s verdict lines used to gate RETIRED bounds (law 3:
 * band worst < 6px on <= 2% of ticks; 3s: zero count and worst < 1px), so they read [FAIL] on every run
 * while the defects they measure were already ruled open and tracked. They are now a DEFECT TRACKER with
 * three states - PASS (the goal is met: law 3 has 0 band-visible ticks; 3s has 0 blade+body+rim+pair),
 * FAIL (a REGRESSION of any tracked counter vs the recorded baseline, checked BEFORE the goal), TRACK
 * (otherwise). Goal 0 stays the hard product requirement; the baseline is a regression TRIPWIRE, not an
 * acceptance band. This probe keeps that honest: measure.mjs is owner-run only, so an agent-runnable proof
 * has to fail if the tracker is removed, mis-wired, reordered or gets a wrong baseline.
 *
 * WHAT IT ASSERTS (read-only; it NEVER runs measure.mjs - it reads its source and runs the LIFTED verdict
 * functions, which are self-contained between the VERDICT-BLOCK markers):
 *   V1  SITES, by source: the law-3 and 3s verdict lines call verdict3 / verdict3s with the right counters
 *       wired; the retired gates (polyBandWorst < 6, the 2% rate, the 3s worst < 1 gate) are gone from those
 *       lines; regression is tested BEFORE the goal inside both functions; pf() still gates the other
 *       laws; no bloom counter reaches the tracker (#765: they stay on the exempt line, not ratcheted);
 *       polyTicks is still incremented (the counter computation is untouched);
 *   V2  SEMANTICS, on the lifted functions: 21 enumerated cases (listed below);
 * V3 BASELINE PINS: LAW3_BASE / LAW3S_BASE / VEPS equal the recorded baselines (law 3: the owner's 2026-11-16 --solidity run on 3b11f34; law 3s: re-baselined #794 to 0/0/0/0)
 *       (HANDOFF s7, #766);
 *   CONTROL: six mutated copies of measure.mjs, each of which V1 + V2 + V3 must report (the unmutated
 *       source must report nothing, so the control is not vacuous).
 *
 * PX COMPARISON: integer counters compare exactly. A px float is compared at the 3-decimal precision the
 * baseline was recorded at (the report prints toFixed(3)) with a 1e-6 epsilon, and a non-finite value fails
 * closed. See the comment above the VERDICT block in measure.mjs for why.
 *
 * Read-only, Tier 0, no sim run. Usage: node .qa/verdict-proof.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(join(here, '..', 'measure.mjs'), 'utf8');

let pass = 0, fail = 0;
const ok = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${d ? '  - ' + d : ''}`); };

const EXPECT3 = { bandVis: 42, bandWorst: 14.185, flipOverlap: 27, flipVis: 10, flipWorst: 11.559 };
const EXPECT3S = { blade: 0, body: 0, rim: 0, pair: 0, worst: 0 };   // #794: re-baselined to 0 with LAW3S_BASE (the read-instant fix + pair sanction closed D4 / law 3s)

/* ---- lift the self-contained verdict block out of a measure.mjs source ---- */
function lift(src) {
  const a = src.indexOf('/*VERDICT-BLOCK-BEGIN*/');
  const b = src.indexOf('/*VERDICT-BLOCK-END*/');
  if (a < 0 || b < 0 || b < a) return { err: 'verdict block markers missing or out of order' };
  const text = src.slice(a, b);
  try {
    const api = new Function(text + '\nreturn { verdict3, verdict3s, LAW3_BASE, LAW3S_BASE, VEPS };')();
    return { text, api };
  } catch (e) { return { err: 'verdict block does not evaluate: ' + e.message }; }
}

/* ---- V1: the static site check (a function, so CONTROL can run it on a mutated copy) ---- */
function checkSites(src) {
  const bad = [];
  const L = lift(src);
  if (L.err) { bad.push(L.err); return bad; }
  const lines = src.split('\n');
  const l3 = lines.filter(l => l.includes('contact law 3: VISIBLE rendered interpenetration') && l.includes('DEFECT TRACKER'));
  const l3s = lines.filter(l => l.includes('projectile law 3s: shots never overlap blade/body/rim/shot on a rendered frame') && l.includes('DEFECT TRACKER'));
  if (l3.length !== 1) bad.push(`expected 1 law-3 tracker line, found ${l3.length}`);
  if (l3s.length !== 1) bad.push(`expected 1 law-3s tracker line, found ${l3s.length}`);
  const call3 = (l3[0] || '').match(/\[\$\{(verdict3\(\{[^}]*\}\))\}\]/);
  const call3s = (l3s[0] || '').match(/\[\$\{(verdict3s\(\{[^}]*\}\))\}\]/);
  if (!call3) bad.push('the law-3 line does not take its tag from verdict3({...})');
  if (!call3s) bad.push('the law-3s line does not take its tag from verdict3s({...})');
  if (call3) {
    const w = { bandVis: 'polyOverlapVis - polyFlipVis', bandWorst: 'polyBandWorst', flipOverlap: 'polyFlipOverlap', flipVis: 'polyFlipVis', flipWorst: 'polyFlipWorst' };
    for (const [k, v] of Object.entries(w)) if (!call3[1].includes(`${k}: ${v}`)) bad.push(`law 3 call: ${k} is not wired to ${v}`);
  }
  if (call3s) {
    const w = { blade: 'shotRenderBlade', body: 'shotRenderBody', rim: 'shotRenderRim', pair: 'shotRenderPair', worst: 'shotRenderWorst' };
    for (const [k, v] of Object.entries(w)) if (!call3s[1].includes(`${k}: ${v}`)) bad.push(`law 3s call: ${k} is not wired to ${v}`);
  }
  // the LAWS.md C3 / S3 rows cite these label anchors (docs/LAWS.md is the owner's text; lint-docs checks them)
  for (const a of ['contact law 3: VISIBLE rendered interpenetration', 'projectile law 3s: shots never overlap blade/body/rim/shot on a rendered frame']) {
    if (!src.includes(a)) bad.push(`LAWS.md anchor missing from measure.mjs: "${a}"`);
  }
  // the retired gates are gone from the two verdict lines (and nothing feeds them to pf())
  for (const l of [...l3, ...l3s]) {
    const tag = (l.match(/^\s*(?:if \(polyTicks\) )?L\.push\(`\[(.*?)\] (?:contact|projectile) law/) || [, ''])[1];
    if (/\bpf\(/.test(tag)) bad.push('a tracker line still takes its tag from pf()');
  }
  if (/pf\([^`]*polyBandWorst/.test(src)) bad.push('retired law-3 gate (polyBandWorst under pf) is still in the source');
  if (/pf\([^`]*shotRenderWorst/.test(src)) bad.push('retired law-3s gate (shotRenderWorst under pf) is still in the source');
  if (/pf\([^`]*<= 0\.02/.test(src)) bad.push('retired 2% rate gate is still under pf()');
  // regression is checked BEFORE the goal inside both functions
  for (const [fn, goal] of [['verdict3', "'PASS'"], ['verdict3s', "'PASS'"]]) {
    const body = (L.text.match(new RegExp(`function ${fn}\\(c\\) \\{[\\s\\S]*?\\n\\}`)) || [''])[0];
    const iFail = body.indexOf("return 'FAIL'");
    const iGoal = body.indexOf(goal);
    if (!body) bad.push(`${fn} not found in the block`);
    else if (iFail < 0 || iGoal < 0 || !(iFail < iGoal)) bad.push(`${fn}: regression is not tested before the goal`);
  }
  // bloom counters are NOT ratcheted (#765): not in the block, not in either call
  if (/bloom/i.test(L.text)) bad.push('a bloom counter appears inside the verdict block');
  if (call3 && /bloom/i.test(call3[1])) bad.push('a bloom counter is passed to verdict3');
  if (call3s && /bloom/i.test(call3s[1])) bad.push('a bloom counter is passed to verdict3s');
  // pf() still gates the other laws
  if (!/const pf = ok => ok \? 'PASS' : 'FAIL';/.test(src)) bad.push('the pf() helper is gone');
  for (const g of ['flMissing === 0', 'cMismatch === 0 && stuckFlagMismatch === 0', 'flipViol === 0 && magViol === 0', 'spinSameDir === 0', 'shotPhantom === 0', 'swatNoTouch === 0', 'shotLost === 0', 'budgetViol === 0', 'launchOffMid === 0']) {
    if (!src.includes('${pf(' + g)) bad.push(`pf() no longer gates: ${g}`);
  }
  // the counter computation is untouched: polyTicks is still counted per fight-tick
  if (!/\bpolyTicks\+\+;/.test(src)) bad.push('polyTicks is no longer incremented');
  return bad;
}

/* ---- V2: the 21 enumerated semantics cases, on the lifted functions ---- */
const B3 = EXPECT3, B3S = EXPECT3S;
const c3 = o => ({ ...B3, ...o });
const c3s = o => ({ ...B3S, ...o });
const CASES = [
  // law 3 (11)
  ['01 law3 baseline -> TRACK', 3, c3({}), 'TRACK'],
  ['02 law3 goal (0 band-visible, mirror at baseline) -> PASS', 3, c3({ bandVis: 0, bandWorst: 0 }), 'PASS'],
  ['03 law3 sub-ink only (0 band-visible, worst 2.4px) -> PASS', 3, c3({ bandVis: 0, bandWorst: 2.4 }), 'PASS'],
  ['04 law3 improved (band 30/10px, mirror 20/5/8px) -> TRACK', 3, { bandVis: 30, bandWorst: 10, flipOverlap: 20, flipVis: 5, flipWorst: 8 }, 'TRACK'],
  ['05 law3 bandVis +1 -> FAIL', 3, c3({ bandVis: B3.bandVis + 1 }), 'FAIL'],
  ['06 law3 bandWorst +0.01px -> FAIL', 3, c3({ bandWorst: B3.bandWorst + 0.01 }), 'FAIL'],
  ['07 law3 mirror overlaps +1 -> FAIL', 3, c3({ flipOverlap: B3.flipOverlap + 1 }), 'FAIL'],
  ['08 law3 mirror visible +1 -> FAIL', 3, c3({ flipVis: B3.flipVis + 1 }), 'FAIL'],
  ['09 law3 mirror worst +0.01px -> FAIL', 3, c3({ flipWorst: B3.flipWorst + 0.01 }), 'FAIL'],
  ['10 law3 px epsilon and 3-decimal rounding noise (+5e-7, 14.1854, 11.5594) -> TRACK', 3, c3({ bandWorst: 14.1854, flipWorst: 11.5594 }), 'TRACK'],
  ['11 law3 regression outranks the goal (0 band-visible but mirror +1) -> FAIL', 3, c3({ bandVis: 0, bandWorst: 0, flipOverlap: B3.flipOverlap + 1 }), 'FAIL'],
  // law 3s (10)
  ['12 law3s baseline==goal (0/0/0/0) -> PASS', 4, c3s({}), 'PASS'],
  ['13 law3s goal (0 blade+body+rim+pair) -> PASS', 4, { blade: 0, body: 0, rim: 0, pair: 0, worst: 0 }, 'PASS'],
  ['14 law3s blade +1 -> FAIL', 4, c3s({ blade: B3S.blade + 1 }), 'FAIL'],
  ['15 law3s body +1 -> FAIL', 4, c3s({ body: B3S.body + 1 }), 'FAIL'],
  ['16 law3s rim +1 -> FAIL', 4, c3s({ rim: B3S.rim + 1 }), 'FAIL'],
  ['17 law3s pair +1 -> FAIL', 4, c3s({ pair: B3S.pair + 1 }), 'FAIL'],
  ['18 law3s worst +0.01px -> FAIL', 4, c3s({ worst: B3S.worst + 0.01 }), 'FAIL'],
  ['19 law3s px epsilon and 3-decimal rounding noise (0.0004) -> PASS', 4, c3s({ worst: 0.0004 }), 'PASS'],
  ['20 law3s regression outranks the goal (0 counts but worst 80px) -> FAIL', 4, { blade: 0, body: 0, rim: 0, pair: 0, worst: 80 }, 'FAIL'],
  ['21 non-finite value fails closed (NaN worst, law 3 and 3s) -> FAIL', 5, [c3({ bandWorst: NaN }), c3s({ worst: NaN })], 'FAIL'],
];
function runV2(api) {
  const out = [];
  for (const [name, which, input, want] of CASES) {
    let got;
    if (which === 3) got = api.verdict3(input);
    else if (which === 4) got = api.verdict3s(input);
    else got = api.verdict3(input[0]) === want && api.verdict3s(input[1]) === want ? want : 'MIXED';
    if (got !== want) out.push(`${name} (got ${got})`);
  }
  return out;
}

/* ---- V3: baseline pins ---- */
function runV3(api) {
  const bad = [];
  for (const [k, v] of Object.entries(EXPECT3)) if (api.LAW3_BASE[k] !== v) bad.push(`LAW3_BASE.${k} is ${api.LAW3_BASE[k]}, expected ${v}`);
  for (const [k, v] of Object.entries(EXPECT3S)) if (api.LAW3S_BASE[k] !== v) bad.push(`LAW3S_BASE.${k} is ${api.LAW3S_BASE[k]}, expected ${v}`);
  if (Object.keys(api.LAW3_BASE).length !== 5) bad.push('LAW3_BASE has extra or missing keys');
  if (Object.keys(api.LAW3S_BASE).length !== 5) bad.push('LAW3S_BASE has extra or missing keys');
  if (api.VEPS !== 1e-6) bad.push(`VEPS is ${api.VEPS}, expected 1e-6`);
  return bad;
}

/* everything at once, for a source string: the list of things wrong with it */
function evaluate(src) {
  const bad = [...checkSites(src).map(x => 'V1 ' + x)];
  const L = lift(src);
  if (L.api) { bad.push(...runV2(L.api).map(x => 'V2 ' + x), ...runV3(L.api).map(x => 'V3 ' + x)); }
  return bad;
}

console.log('V1 - the tracker sites, by source');
const v1 = checkSites(SRC);
ok('V1 both verdict lines call the tracker with the right counters; retired gates gone; regression before goal; pf() still gates the other laws; bloom not ratcheted; polyTicks still counted', v1.length === 0, v1.join('; '));

const LF = lift(SRC);
console.log('V2 - the 21 enumerated semantics cases, on the lifted functions');
let v2 = ['block did not lift'];
if (LF.api) {
  v2 = runV2(LF.api);
  for (const [name] of CASES) console.log(`    ${v2.some(x => x.startsWith(name)) ? 'FAIL' : 'ok  '} ${name}`);
}
ok(`V2 all ${CASES.length} cases give the expected verdict`, v2.length === 0 && CASES.length === 21, v2.join('; ') || `${CASES.length}/21`);

console.log('V3 - baseline pins (law 3: the owner\'s 2026-11-16 --solidity run on 3b11f34; law 3s: re-baselined #794 to 0/0/0/0 — D4 closed by the read-instant fix + pair sanction)');
const v3 = LF.api ? runV3(LF.api) : ['block did not lift'];
ok('V3 LAW3_BASE / LAW3S_BASE / VEPS equal the recorded baseline', v3.length === 0, v3.join('; '));

console.log('CONTROL - each mutated copy of measure.mjs must be reported by V1/V2/V3');
const clean = evaluate(SRC);
const MUT = [
  ['retired gate reinstated on the law-3 line', s => s.replace('[${verdict3({ bandVis', '[${pf(polyBandWorst < 6) && verdict3({ bandVis')],
  ['goal tested before regression in verdict3', s => s.replace("  if (regressed) return 'FAIL';\n  return c.bandVis === 0 ? 'PASS' : 'TRACK';", "  if (c.bandVis === 0) return 'PASS';\n  if (regressed) return 'FAIL';\n  return 'TRACK';")],
  ['a bloom counter ratcheted at the call site', s => s.replace('flipWorst: polyFlipWorst })}] contact law 3', 'flipWorst: polyFlipWorst, bloomVis: bloomVis })}] contact law 3')],
  ['a baseline pin moved (3s pair)', s => s.replace('rim: 0, pair: 0', 'rim: 0, pair: 1')],
  ['a counter dropped from the law-3 regression test', s => s.replace('|| worseInt(c.flipVis, LAW3_BASE.flipVis)', '')],
  ['px compare made fail-open', s => s.replace('const worsePx = (x, base) => !(r3(x) <= base + VEPS);', 'const worsePx = (x, base) => r3(x) > base + VEPS;')],
];
let caught = 0;
for (const [n, f] of MUT) {
  const m = f(SRC);
  const changed = m !== SRC;
  const r = changed ? evaluate(m) : [];
  if (changed && r.length) caught++;
  console.log(`  ${changed && r.length ? 'caught' : 'MISSED'} ${n}${r.length ? ' -> ' + r[0] : ''}`);
}
ok('CONTROL the unmutated source reports nothing (not vacuous) and every mutated copy is reported', clean.length === 0 && caught === MUT.length, `${caught}/${MUT.length} mutated copies caught; unmutated reports ${clean.length}${clean.length ? ': ' + clean.join('; ') : ''}`);

console.log(`\n${pass}/${pass + fail} passed`);
console.log('NOT RUN: measure.mjs (owner-only). The first --solidity run after this lands is the first exercise of the #794-closed tracker; the prediction is [TRACK]/[PASS] - law 3 counters identical to the #766 report, law 3s goal met (0/0/0/0) after the read-instant fix + pair sanction - which is a prediction, not a measurement.');
if (fail) { console.log(`${fail} FAILED`); process.exit(1); }
console.log(JSON.stringify({ check: 'verdict-proof', pass, fail, ok: fail === 0, cases: CASES.length, controls: `${caught}/${MUT.length}` }));
