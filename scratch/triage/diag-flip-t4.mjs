/* scratch/triage/diag-flip-t4.mjs — READ-ONLY probe (2026-11-10, Item 3).
 * Two questions, one run:
 *  (1) T4: WHY is episode 2 17 frames > 1×13? Is it slow-mo (fxRate) stretching the flip clock,
 *      as the triage menu hypothesised? And does an EXACT flip-clock ledger hold —
 *      Σ consumed clock-ms === sweeps × CFG.flipMs, with full-rate frames inside the old budget?
 *      The clock decrements by dtFrames*1000/60 (canonical :5080) and draw() is called with
 *      dtFrames*fxRate (:5267), so per-frame consumption is measurable from info().flipT alone.
 *  (2) seeds: can a boot-time scan find (a) a natural seed whose rolls contain a flagged weapon
 *      AND which parries, and (b) a natural seed with NO flagged weapon in any roll that parries?
 *      CTRL_SEED 4 now rolls the staff (flagged since the 2026-10-28 facing pass) — T2b's own
 *      tripwire fired exactly as designed.
 * Writes nothing. Runs no measure.mjs.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(here, '..', '..', 'previews', 'spinclash-preview.html');
const html = readFileSync(FILE, 'utf8');
const blocks = [];
{ let i = 0; while (true) { const a = html.indexOf('<script>', i); if (a < 0) break; const b = html.indexOf('</script>', a); blocks.push(html.slice(a + 8, b)); i = b; } }
globalThis.Path2D ??= class { arc() {} moveTo() {} lineTo() {} closePath() {} rect() {} };

const FRAME_MS = 16.7;
function fakeEl() {
  const t = function () {};
  return new Proxy(t, { get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl(); return x[p]; },
    set(x, p, v) { x[p] = v; return true; }, apply() { return fakeEl(); } });
}
const opener = '(function () {';
let simBody = blocks[0].slice(blocks[0].indexOf(opener) + opener.length);
simBody = simBody.slice(0, simBody.lastIndexOf('})();'));
const sim = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
  simBody + '\n;return { newGame, tick, CFG, WEAPONS };')(
  { getElementById: () => fakeEl(), createElement: () => fakeEl(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
  { now: () => 0 }, () => 0, console);
const { newGame, tick, CFG, WEAPONS } = sim;
const flagged = (w) => !!(WEAPONS[w].lead || WEAPONS[w].headLead);

/* ---------- (2) the seed scan ---------- */
function scan(seed, frames) {
  const G = newGame(seed);
  let t = 0; const maxT = Math.round(frames * FRAME_MS * CFG.tickHz / 1000);
  let parries = 0, firstFlaggedParry = { tick: Infinity, side: -1 };
  while (!G.over && t < maxT) {
    tick(G); t++;
    for (const e of G.events) if (e.kind === 'parry') {
      parries++;
      const sides = [flagged(e.aW) ? 0 : -1, flagged(e.bW) ? 1 : -1];
      for (const s of sides) if (s >= 0 && e.tick < firstFlaggedParry.tick) firstFlaggedParry = { tick: e.tick, side: s };
    }
    G.events.length = 0;
  }
  return { parries, firstFlaggedParry, rolls: G.rolls.map(r => r.w), rollsFlagged: G.rolls.some(r => r.w.some(flagged)) };
}
const SCAN_MAX = Number(process.argv[2] || 24);
let pickFlag = null, pickCtrl = null;
const table = [];
for (let s = 1; s <= SCAN_MAX && !(pickFlag && pickCtrl); s++) {
  const r = scan(s, 9000);
  table.push([s, r.parries, r.rollsFlagged, r.firstFlaggedParry.side >= 0, JSON.stringify(r.rolls)]);
  if (!pickFlag && r.parries > 0 && r.firstFlaggedParry.side >= 0) pickFlag = s;
  if (!pickCtrl && r.parries > 0 && !r.rollsFlagged) pickCtrl = s;
}
console.log('SEED SCAN  seed | parries | rollsFlagged | hasFlaggedParry | rolls');
for (const [s, p, rf, fp, rolls] of table) console.log(`  s${String(s).padStart(2)}  ${String(p).padStart(5)}  ${String(rf).padStart(6)}  ${String(fp).padStart(7)}  ${rolls}`);
console.log(`PICKED: FLAG_SEED ${pickFlag} (was hardcoded 2) · CTRL_SEED ${pickCtrl} (was hardcoded 4 — now rolls a flagged weapon)`);
if (pickFlag === null || pickCtrl === null) { console.log('!! the scan did NOT find both — a hardcoded fallback is required'); process.exit(1); }

/* ---------- (1) the T4 episode drive with a flip-clock ledger ---------- */
const els = {};
function makeEl(id) {
  return { id, innerHTML: '', textContent: '', value: '', hidden: true, width: 0, height: 0, style: {}, dataset: {},
    classList: { toggle() {}, add() {}, remove() {} }, addEventListener() {}, blur() {}, focus() {},
    setAttribute() {}, getAttribute() { return null; }, getContext() { return fakeEl(); } };
}
const documentStub = { getElementById: (id) => (els[id] ||= makeEl(id)), createElement: () => makeEl('offscreen'),
  querySelectorAll: () => [], addEventListener: () => {}, activeElement: null, body: makeEl('body') };
const windowStub = { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} };
function bootApp() {
  for (const k of Object.keys(els)) delete els[k];
  let rafFn = null;
  const rafStub = (fn) => { rafFn = fn; return 1; };
  new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console', blocks[0])(documentStub, windowStub, { now: () => 0 }, rafStub, console);
  new Function('document', 'window', 'performance', 'requestAnimationFrame', 'setInterval', 'setTimeout', 'console', blocks[1])(documentStub, windowStub, { now: () => 0 }, rafStub, () => 1, () => 0, console);
  return { app: windowStub.APP, step(i) { const f = rafFn; rafFn = null; if (f) f(i * FRAME_MS); return !!f; } };
}
const A = scan(pickFlag, 9000);
const { app, step } = bootApp();
app.restart(pickFlag);
const side = A.firstFlaggedParry.side, other = 1 - side;
const singleBudget = Math.ceil(CFG.flipMs / FRAME_MS) + 2;
let ep = 0, epLen = 0, epSweeps = 0, epFrozen = 0, epSlow = 0, epFull = 0, epConsumed = 0, epResets = 0;
let prevAnimating = false, prevInZone = false, prevT = 0, worstLedger = 0, worstFull = 0, ep2 = null;
console.log(`\nT4 DRIVE on s${pickFlag} (side ${side}) — flipMs ${CFG.flipMs}, hitSlowRate ${CFG.hitSlowRate}, per-sweep frame budget ${singleBudget}`);
for (let i = 0; i < 9000; i++) {
  if (!step(i)) break;
  const inf = app.info();
  const cur = inf.flip[side], ft = inf.flipT[side];
  const animating = Math.abs(cur) < 1;
  if (animating) {
    const dt = prevT - ft;                       // clock ms consumed this frame
    if (dt < -1e-9) { epResets++; epConsumed += 0; }   // the clock was re-armed to flipMs: a new sweep
    else if (dt > 0) epConsumed += dt;
    const frozen = inf.stopMs > 0;
    if (frozen) epFrozen++;
    else if (dt < FRAME_MS - 0.05) epSlow++;      // fxRate < 1 stretched the clock (slow-mo)
    else epFull++;
    epLen++;
    const inZone = Math.abs(cur) <= 0.3;
    if (inZone && !prevInZone) epSweeps++;
    prevInZone = inZone;
  } else if (prevAnimating) {
    ep++;
    const ledgerDev = Math.abs(epConsumed - epSweeps * CFG.flipMs);
    if (ledgerDev > worstLedger) worstLedger = ledgerDev;
    if (epFull > worstFull) worstFull = epFull;
    const row = { ep, frames: epLen, sweeps: epSweeps, resets: epResets, consumed: +epConsumed.toFixed(2),
      expect: epSweeps * CFG.flipMs, ledgerDev: +ledgerDev.toExponential(2), full: epFull, slow: epSlow,
      frozen: epFrozen, oldLaw: `${epLen - epFrozen} <= ${epSweeps * singleBudget}`, oldLawOK: (epLen - epFrozen) <= epSweeps * singleBudget,
      newLawOK: ledgerDev <= FRAME_MS && epResets === epSweeps && epFull <= epSweeps * singleBudget };
    console.log(`  ep${ep}: frames ${epLen} (full ${epFull}, slow ${epSlow}, frozen ${epFrozen}) sweeps ${epSweeps} resets ${epResets} | clock consumed ${row.consumed}ms vs expected ${row.expect}ms (dev ${row.ledgerDev}) | OLD law ${row.oldLaw} → ${row.oldLawOK ? 'ok' : 'FAIL'} | NEW law → ${row.newLawOK ? 'ok' : 'FAIL'}`);
    if (ep === 2) ep2 = row;
    epLen = 0; epSweeps = 0; epFrozen = 0; epSlow = 0; epFull = 0; epConsumed = 0; epResets = 0; prevInZone = false;
  }
  prevAnimating = animating; prevT = ft;
  if (app.state().over) break;
}
console.log(`\nSUMMARY: ${ep} episodes · worst ledger deviation ${worstLedger.toExponential(2)}ms (bound 1 frame = ${FRAME_MS}ms) · worst full-rate frame count ${worstFull} (bound ${singleBudget}/sweep)`);
console.log(ep2 ? `EPISODE 2 VERDICT: old frame-count law ${ep2.oldLawOK ? 'PASS' : 'FAIL'} → new ledger law ${ep2.newLawOK ? 'PASS' : 'FAIL'}; the ${ep2.frames - ep2.full} non-full-rate frames were ${ep2.slow} slow-mo + ${ep2.frozen} frozen` : 'no episode 2');
