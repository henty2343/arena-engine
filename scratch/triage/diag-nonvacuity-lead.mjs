/* scratch/triage/diag-nonvacuity-lead.mjs — mutation test of the RE-SEEDED swat cell in
 * .qa/leadproof.mjs (menu item 6, session 6, 2026-11-11).
 *
 * Law (the owner's): a probe that measured nothing cannot claim PASS. Every re-seeded cell must be
 * shown FALSIFIABLE — inject a break, see the cell go red.
 *
 * Method (session 5's precedent): the shipped cell's SOURCE is extracted VERBATIM from the patched
 * proof file and evaluated against injected events, so the proof cannot drift from what ships. The
 * canonical file is never touched.
 *
 * The re-seeded cell audits a swat by the class its STORED gap names:
 *   TOUCH class (gap strictly negative) — the circle recompute
 *   CUT class   (gap exactly 0)         — the skewer's ANGLE law, cos(fAng)·w / |w| > SKEWER.cutCos
 *
 * Scenarios:
 *   BASELINE-TOUCH  a normal touch swat                        -> green
 *   BASELINE-CUT    a normal cut-window swat                    -> green
 *   BREAK-CUT       a cut swat whose angle law does NOT hold    -> RED (the cut law fires)
 *   BREAK-TOUCH     a touch swat with no circle contact         -> RED (the touch law fires)
 *   BREAK-MISCLASS  a stored gap of exactly 0 whose angle law
 *                   does NOT hold — the discriminator must not
 *                   wave a mis-stored event through             -> RED
 *   SOURCE          the canonical's two killShot('swat') paths really do store 0 and
 *                   `best - st.r` (the latter under a `best < st.r` guard, so strictly
 *                   negative) — the discriminator's basis, asserted from the source
 *
 * Writes nothing. Runs no measure.mjs.
 */
import { readFileSync } from 'node:fs';

const proof = readFileSync('.qa/leadproof.mjs', 'utf8');
const canon = readFileSync('previews/spinclash-preview.html', 'utf8');

const grab = (src, startMark, endMark, name) => {
  const a = src.indexOf(startMark);
  if (a === -1) { console.error(`cannot locate ${name} — aborting`); process.exit(1); }
  const b = src.indexOf(endMark, a);
  if (b === -1) { console.error(`cannot locate the end of ${name} — aborting`); process.exit(1); }
  return src.slice(a, b);
};

/* ---- extract the shipped swat cell verbatim (brace-matched: the cell holds template literals
 * with ${...}, but every brace inside them is balanced, so a plain depth count is exact; the scan
 * continues past an if/else seam — when depth hits 0 and the next token is `else`, the else block
 * is part of the same statement) ---- */
const cellSrc = (() => {
  const start = proof.indexOf('if (e.gap === 0) {');
  if (start === -1) { console.error('cannot locate the re-seeded swat cell — aborting'); process.exit(1); }
  let depth = 0, i = start;
  while (i < proof.length) {
    const c = proof[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        /* an if/else seam: `} else {` continues the same statement */
        const rest = proof.slice(i + 1).match(/^\s*else\b/);
        if (rest) { i++; continue; }
        i++;
        break;
      }
    }
    i++;
  }
  if (depth !== 0) { console.error('the re-seeded swat cell did not balance — aborting'); process.exit(1); }
  const cell = proof.slice(start, i);
  if (!/else\s*\{/.test(cell)) { console.error('the extracted swat cell has no else branch — aborting'); process.exit(1); }
  return cell;
})();

/* ---- the synthetic world the extracted cell runs against ---- */
const SKEWER = { cutCos: 0.75 };
const WEAPONS = { javelin: { lead: undefined }, bow: { lead: undefined }, sword: { lead: 1 } };
/* one circle at the swatter's pose, radius 10 — enough for a touch recompute */
const geom = {
  leadFlip: () => 1,
  bladeCircles: (x, y) => [x, y, 10],
};

const runCell = (e) => {
  const failures = [];
  const ok = (cond, msg) => { if (!cond) failures.push(String(msg).split(' — ')[0]); };
  const fn = new Function('e', 'geom', 'WEAPONS', 'SKEWER', 'ok', 'name', 'seed', `
    let cutSwats = 0, touchSwats = 0;
    ${cellSrc}
    return { cutSwats, touchSwats };
  `);
  const counts = fn(e, geom, WEAPONS, SKEWER, ok, 'synthetic', 0);
  return { failures, counts };
};

/* a swat event: x/y = the spear's position, fx/fy/fAng = the swatter's pose, sr = the spear's
 * radius, gap = the STORED gap (0 = the cut class, negative = the touch class) */
const touchEvent = (dist = 19.5) => ({
  kind: 'swat', gap: -0.5, sr: 10, fx: 0, fy: 0, fAng: 0, fW: 'sword', fSp: 0,
  x: dist, y: 0,
});
const cutEvent = (fAng = 0) => ({
  kind: 'swat', gap: 0, sr: 10, fx: 0, fy: 0, fAng, fW: 'sword', fSp: 0,
  x: 100, y: 0,
});

const scenarios = [
  { id: 'BASELINE-TOUCH', name: 'BASELINE — a normal touch swat (the circle recompute holds)',
    e: touchEvent(), expect: 0 },
  { id: 'BASELINE-CUT', name: 'BASELINE — a normal cut-window swat (the angle law holds)',
    e: cutEvent(0), expect: 0 },
  { id: 'BREAK-CUT', name: 'BREAK — a cut swat whose angle law does NOT hold (the blade is not on the spear\'s radial)',
    e: cutEvent(Math.PI / 2), expect: 1 },
  { id: 'BREAK-TOUCH', name: 'BREAK — a touch swat with no circle contact at all',
    e: touchEvent(100), expect: 1 },
  { id: 'BREAK-MISCLASS', name: 'BREAK — a stored gap of exactly 0 whose angle law does NOT hold (a mis-stored event must not wave through)',
    e: cutEvent(Math.PI), expect: 1 },
];

console.log('leadproof non-vacuity — the shipped swat cell, extracted verbatim from .qa/leadproof.mjs');
console.log('');
let good = 0, total = 0;
for (const sc of scenarios) {
  total++;
  const r = runCell(sc.e);
  const fired = r.failures.length;
  const ok = fired === sc.expect;
  if (ok) good++;
  console.log(`  ${ok ? 'OK      ' : 'UNEXPECTED'} ${sc.id} — ${sc.name}`);
  console.log(`            failures: ${fired ? r.failures.join(' | ') : '(none — green)'} · class counters: cut ${r.counts.cutSwats}, touch ${r.counts.touchSwats}`);
}

/* ---- the discriminator's basis, asserted from the canonical's own source ---- */
{
  total++;
  const cutCall = /killShot\(G, st, 'swat', vf, 0\)/.test(canon);
  const touchCall = /killShot\(G, st, 'swat', foe, best - st\.r\)/.test(canon);
  const touchGuard = /if \(!st\.skewCarry && best < st\.r/.test(canon);
  const ok = cutCall && touchCall && touchGuard;
  if (ok) good++;
  console.log(`  ${ok ? 'OK      ' : 'UNEXPECTED'} SOURCE — the canonical's two killShot('swat') paths: the cut path stores 0 [${cutCall}], the touch path stores best - st.r under a \`best < st.r\` guard [${touchCall}/${touchGuard}] — the stored gap discriminates the classes`);
}

console.log('');
console.log(`LEADPROOF ITEM-6 CELL NON-VACUITY VERDICT: ${good}/${total} scenarios behaved as required.`);
if (good !== total) process.exit(1);
