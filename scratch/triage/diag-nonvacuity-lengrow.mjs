/* scratch/triage/diag-nonvacuity-lengrow.mjs — mutation test of the RE-SEEDED cell in
 * .qa/lengrow-build-proof.mjs (menu item 4, session 6, 2026-11-11).
 *
 * Law (the owner's): a probe that measured nothing cannot claim PASS. Every re-seeded cell must be
 * shown FALSIFIABLE — inject a break, see the cell go red.
 *
 * Method (session 5's precedent, diag-nonvacuity-pair.mjs): the shipped cell's SOURCE is extracted
 * VERBATIM from the patched proof file and evaluated against mutated runtime objects. No hand-copied
 * re-implementation, so the proof cannot drift from what actually ships. The canonical file is never
 * touched; only the in-memory WEAPONS / LEN_LADDER objects handed to the extracted cell are mutated
 * (post-boot scalar breaks, per the session-4 lesson: prefer scalar post-boot breaks over
 * boot-guard-tripping breaks unless the guard IS the coverage).
 *
 * The runtime objects (WEAPONS / WEAPON_IDS / LEN_LADDER / LEN_STEPS) come from booting the
 * canonical through the proof file's OWN harness (its EXPORTS list + boot block are extracted
 * verbatim too), so the data under test is the shipped data.
 *
 * Scenarios (from HANDOFF-ITEM3-SESSION5 §B1/B2/B3):
 *   B1  rigid half   — a RIGID grower (spear) loses its ladder row  => "a new trait.len row forgot
 *                      its mechanism" must trip.
 *   B2  chain half   — a CHAIN grower (flail) loses/mis-shapes chain.ext => chainExtOk must trip.
 *                      B2a: ext = undefined.  B2b: ext.every = 0 (the "cap no longer covers the
 *                      steps" shape).  B2c: ext.max below floor(LEN_STEPS/every).
 *   B3  cross half   — a CHAIN grower is ALSO given a ladder row => the "and no other row grows"
 *                      completeness pair must trip (count mismatch).
 *   B4  control      — the un-mutated build must be GREEN, otherwise there is nothing to falsify.
 *
 * Writes nothing. Runs no measure.mjs.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..', '..');
const PROOF = join(ROOT, '.qa', 'lengrow-build-proof.mjs');
const CANON = join(ROOT, 'previews', 'spinclash-preview.html');

const proofSrc = readFileSync(PROOF, 'utf8');
const html = readFileSync(CANON, 'utf8');

/* ---- extract the proof file's OWN boot harness verbatim (its EXPORTS list + the new Function call) ---- */
const grab = (src, startMark, endMark, name) => {
  const a = src.indexOf(startMark);
  if (a === -1) { console.error(`cannot locate ${name} in the proof file — aborting`); process.exit(1); }
  const b = endMark === null ? -1 : src.indexOf(endMark, a);
  if (endMark !== null && b === -1) { console.error(`cannot locate end of ${name} — aborting`); process.exit(1); }
  return src.slice(a, b);
};

/* ---- extract the RE-SEEDED cell verbatim: the three consts + the ok(...) call ---- */
const cellSrc = grab(proofSrc,
  'const RIGID_GROWERS = GROWERS.filter',
  '\nok(\'ladder has LEN_STEPS+1 entries\'',
  're-seeded item-4 cell');

/* the cell needs GROWERS (the proof computes it from WEAPON_IDS/WEAPONS) */
const growersSrc = grab(proofSrc,
  'const GROWERS = WEAPON_IDS.filter',
  '\nconsole.log(`  LEN_STEPS',
  'GROWERS');

/* ---- boot the canonical through the proof's own EXPORTS surface ---- */
const exportsLine = proofSrc.match(/const EXPORTS = '([^']+)';/);
if (!exportsLine) { console.error('cannot locate EXPORTS in the proof file — aborting'); process.exit(1); }
const EXPORTS = exportsLine[1];

function fakeEl() {
  const t = function () {};
  return new Proxy(t, {
    get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl(); return x[p]; },
    set(x, p, v) { x[p] = v; return true; },
    apply() { return fakeEl(); },
  });
}
const a = html.indexOf('<script>'), b = html.indexOf('</script>', a);
let body = html.slice(a + 8, b);
const opener = '(function () {';
body = body.slice(body.indexOf(opener) + opener.length);
body = body.slice(0, body.lastIndexOf('})();'));
const api = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
  body + `\n;return { ${EXPORTS} };`)(
  { getElementById: () => fakeEl(), createElement: () => fakeEl(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
  { now: () => 0 }, () => 0, console);
const { WEAPONS, WEAPON_IDS, LEN_LADDER, LEN_STEPS } = api;

/* ---- evaluate the EXTRACTED cell against a given (possibly mutated) set of objects ---- */
const runCell = (W, IDS, LADDER, STEPS) => {
  const scope = { WEAPONS: W, WEAPON_IDS: IDS, LEN_LADDER: LADDER, LEN_STEPS: STEPS };
  const fn = new Function('WEAPONS', 'WEAPON_IDS', 'LEN_LADDER', 'LEN_STEPS',
    `${growersSrc}\n${cellSrc}\nreturn { verdict: _verdict, detail: _detail, rigid: RIGID_GROWERS, chain: CHAIN_GROWERS };`);
  /* the shipped cell calls ok(name, cond, detail) — capture the call instead of printing it */
  const srcWithCapture = `${growersSrc}\nlet _verdict = false, _detail = '';\nconst ok = (name, cond, detail) => { _verdict = !!cond; _detail = String(detail ?? ''); };\n${cellSrc}\nreturn { verdict: _verdict, detail: _detail, rigid: RIGID_GROWERS, chain: CHAIN_GROWERS };`;
  const fn2 = new Function('WEAPONS', 'WEAPON_IDS', 'LEN_LADDER', 'LEN_STEPS', srcWithCapture);
  void fn;
  return fn2(W, IDS, LADDER, STEPS);
};

/* ---- a deep-ish clone so a scenario cannot poison the next one ---- */
const clone = (o) => {
  if (Array.isArray(o)) return o.map(clone);
  if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o)) r[k] = clone(o[k]); return r; }
  return o;
};

console.log(`lengrow non-vacuity — extracted cell from ${PROOF.replace(ROOT + '/', '')}`);
console.log(`  growers: ${WEAPON_IDS.filter(id => WEAPONS[id].trait && WEAPONS[id].trait.len).join(', ')}`);
console.log(`  LEN_STEPS ${LEN_STEPS}`);
console.log('');

const scenarios = [
  { id: 'B4-control', name: 'B4 CONTROL — the un-mutated build is green (nothing to falsify otherwise)',
    expect: true,
    apply: () => ({}) },
  { id: 'B1', name: 'B1 rigid half — spear (a RIGID grower) loses its ladder row',
    expect: false,
    apply: (W, IDS, L) => { delete L.spear; } },
  { id: 'B2a', name: 'B2a chain half — flail (a CHAIN grower) has chain.ext = undefined',
    expect: false,
    apply: (W) => { W.flail.chain.ext = undefined; } },
  { id: 'B2b', name: 'B2b chain half — flail chain.ext.every = 0 (no step coverage)',
    expect: false,
    apply: (W) => { W.flail.chain.ext.every = 0; } },
  { id: 'B2c', name: 'B2c chain half — flail chain.ext.max below floor(LEN_STEPS/every)',
    expect: false,
    apply: (W, IDS, L, S) => { W.flail.chain.ext.max = Math.floor(S / W.flail.chain.ext.every) - 1; } },
  { id: 'B3', name: 'B3 cross half — flail (a CHAIN grower) is ALSO given a ladder row',
    expect: false,
    apply: (W, IDS, L) => { L.flail = L.spear; } },
];

let good = 0, total = 0;
for (const s of scenarios) {
  total++;
  const W = clone(WEAPONS), IDS = clone(WEAPON_IDS), L = clone(LEN_LADDER), S = LEN_STEPS;
  s.apply(W, IDS, L, S);
  let res, err = null;
  try {
    res = runCell(W, IDS, L, S);
  } catch (e) {
    err = e;
  }
  if (err) {
    console.log(`  CRASH    ${s.id} — ${s.name}\n            ${err.constructor.name}: ${err.message}`);
    console.log(`            (a CRASH is not a clean FAIL — see the report)`);
    continue;
  }
  const fired = res.verdict === false;
  const asExpected = fired === (s.expect === false);
  if (asExpected) good++;
  console.log(`  ${asExpected ? 'OK       ' : 'UNEXPECTED'} ${s.id} — ${s.name}`);
  console.log(`            verdict=${res.verdict} (want ${!s.expect}) · rigid=[${res.rigid.join(',')}] · chain=[${res.chain.join(',')}]`);
  console.log(`            detail: ${res.detail}`);
}

console.log(`\nLENGROW ITEM-4 CELL NON-VACUITY VERDICT: ${good}/${total} scenarios behaved as required.`);
if (good !== total) process.exit(1);
