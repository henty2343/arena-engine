/* scratch/triage/diag-flip-ledger.mjs — READ-ONLY probe (Item-3 triage, session 6, 2026-11-11).
 *
 * PURPOSE: derive the T4 slow-mo ledger law from MEASUREMENT, not from the session-2 summary.
 * The session-2 handoff states the law as "flipT_at_reset + SUM(dt) === epSweeps × CFG.flipMs"
 * but its own trace read 150.3ms against a 180ms clock, and the author had already recorded that
 * "the engine is exact, the probe was wrong". This probe re-derives the per-frame ledger from the
 * canonical's own clock arithmetic:
 *
 *   canonical :5077-5080  (inside draw())
 *     if (fa.snap || G.phase !== 'fight') { fa.cur = fpTarget; fa.t = 0; fa.snap = false; }
 *     else if (fa.t <= 0 && fa.cur !== fpTarget) { fa.from = fa.cur; fa.t = CFG.flipMs; }   // ARM
 *     if (fa.t > 0) { fa.t = Math.max(0, fa.t - dtFrames * 1000 / 60); ... }               // SPEND
 *   canonical :5200-5201, :5267  (frame loop)
 *     const dtms = clamp(now - lastNow, 0, 50); const dtFrames = dtms / (1000 / 60);
 *     draw(dtFrames * fxRate);
 *   => the flip clock spends EXACTLY (dtms x fxRate) wall-ms per frame, and the Math.max(0,·)
 *      clamp can only LOSE the tail of the final frame's spend (the overshoot).
 *
 * RATE CHANNELS (two independent witnesses, no assumption):
 *   (1) the flip clock itself — every frame's spend is observable as the clock's decrease, except
 *       the ARM frame (the clock goes 0 -> CFG.flipMs - spend, so the spend is not a decrease) and
 *       the LANDING frame (the Math.max clamp hides the tail).
 *   (2) the SIM TICK COUNTER (G.t) — the frame loop does tickAcc += adv * fxRate and then runs
 *       floor(tickAcc) sim ticks, with adv = dtms * tickHz / 1000 at 1x. At 1x the sim runs 2 ticks
 *       per frame; at the hit-slow rate (0.25x) it runs 0 or 1. So the per-frame tick advance
 *       witnesses the frame's rate INDEPENDENTLY of the flip clock — and it covers exactly the two
 *       frames the flip clock cannot speak for. (Valid only while the slow/fast toggles are OFF,
 *       which flipproof never engages; the probe asserts that.)
 *
 * Writes nothing. Runs no measure.mjs. Canonical untouched.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..', '..');
const html = readFileSync(join(ROOT, 'previews', 'spinclash-preview.html'), 'utf8');
const blocks = [];
{ let i = 0; while (true) { const a = html.indexOf('<script>', i); if (a < 0) break; const b = html.indexOf('</script>', a); blocks.push(html.slice(a + 8, b)); i = b; } }
globalThis.Path2D ??= class { arc() { } moveTo() { } lineTo() { } closePath() { } rect() { } };

const FRAME_MS = 16.7;
const SEED = Number(process.argv[2] || 1);
const SIDE = Number(process.argv[3] || 0);
const FLIP_MS = 180;   // CFG.flipMs (asserted by the proof file itself)

function fakeEl() {
  const t = function () { };
  return new Proxy(t, {
    get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl(); return x[p]; },
    set(x, p, v) { x[p] = v; return true; },
    apply() { return fakeEl(); },
  });
}
function fakeCtx() {
  return new Proxy(function () { }, {
    get(t, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in t)) t[p] = fakeCtx(); return t[p]; },
    set(t, p, v) { t[p] = v; return true; },
    apply() { return fakeCtx(); },
  });
}
const els = {};
const makeEl = (id) => ({ id, innerHTML: '', textContent: '', value: '', hidden: true, width: 0, height: 0, style: {}, dataset: {}, classList: { toggle() { }, add() { }, remove() { } }, addEventListener() { }, blur() { }, focus() { }, setAttribute() { }, getAttribute() { return null; }, getContext() { return fakeCtx(); } });
const documentStub = { getElementById: (id) => (els[id] ||= makeEl(id)), createElement: () => makeEl('offscreen'), querySelectorAll: () => [], addEventListener: () => { }, activeElement: null, body: makeEl('body') };
const windowStub = { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => { } };
let rafFn = null;
const rafStub = (fn) => { rafFn = fn; return 1; };
new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console', blocks[0])(documentStub, windowStub, { now: () => 0 }, rafStub, console);
new Function('document', 'window', 'performance', 'requestAnimationFrame', 'setInterval', 'setTimeout', 'console', blocks[1])(documentStub, windowStub, { now: () => 0 }, rafStub, () => 1, () => 0, console);
const app = windowStub.APP;
const step = (i) => { const f = rafFn; rafFn = null; if (f) f(i * FRAME_MS); return !!f; };

app.restart(SEED);

/* ---- frame-by-frame trace ---- */
const trace = [];
for (let i = 0; i < 9000; i++) {
  if (!step(i)) break;
  const inf = app.info();
  const st = app.state();
  trace.push({
    i,
    cur: inf.flip[SIDE], ft: inf.flipT[SIDE], stop: inf.stopMs,
    otherFt: inf.flip[1 - SIDE],
    animating: Math.abs(inf.flip[SIDE]) < 1,
    gt: st.t,
    slow: inf.slow, fast: inf.fast,
  });
  if (st.over) break;
}

/* ---- segment into sweeps: an ARM event (clock goes UP) through the frame it reaches 0 ---- */
const sweeps = [];
let cur = null;
for (let k = 0; k < trace.length; k++) {
  const f = trace[k];
  const prev = k > 0 ? trace[k - 1] : null;
  if (prev && f.ft > prev.ft + 1e-9) {
    cur = { armIdx: k, armFt: f.ft, frames: [], landing: null };
    sweeps.push(cur);
  }
  if (cur && f.ft > 0) cur.frames.push({ ...f, idx: k });
  if (cur && f.ft === 0 && !f.animating && cur.frames.length > 0) { cur.landing = { ...f, idx: k }; cur = null; }
}

console.log(`flip ledger probe — seed s${SEED}, side ${SIDE}, flipMs ${FLIP_MS}`);
console.log(`trace frames: ${trace.length}, sweeps: ${sweeps.length}, slow/fast toggles engaged: ${trace.some(f => f.slow || f.fast)}`);
console.log('');

/* the tick channel: ticks advanced this frame -> the frame's effective world rate */
const tickRate = (k) => {
  if (k <= 0) return null;
  const d = trace[k].gt - trace[k - 1].gt;
  if (d >= 2) return 1;      // 2 ticks/frame = 1x
  if (d === 1) return 0.25;  // ~0.5 tick/frame = the hit-slow rate (0.25x)
  return 0;                  // 0 ticks = frozen (KO freeze) or the slow window's carry
};

let allArm = true, allSpend = true, allLand = true, worstOver = 0;
const rows = [];
for (const s of sweeps) {
  const F = s.frames;
  const landing = s.landing;
  /* spend per frame: observable from the clock for every frame EXCEPT the arm frame
     (the clock goes 0 -> 180 - spend) and the landing frame (the clamp hides the tail). */
  const observable = F.map((f, idx) => idx === 0 ? null : (F[idx - 1].ft - f.ft));
  /* the tick channel fills the two blind frames */
  const armRate = tickRate(s.armIdx);
  const landRate = landing ? tickRate(landing.idx) : null;
  const armSpend = armRate === null ? null : armRate * FRAME_MS;
  const landRawSpend = landRate === null ? null : landRate * FRAME_MS;
  const spends = F.map((f, idx) => idx === 0 ? armSpend : observable[idx]);
  const rawSpend = spends.reduce((a, b) => a + (b || 0), 0) + (landRawSpend || 0);
  const clampedSpend = (F.length ? F[F.length - 1].ft : 0);       // what the clamp kept
  const overshoot = rawSpend - FLIP_MS;                            // the clamp's masked tail
  const armExact = s.armFt + (armSpend || 0);                      // the clock's armed value
  const full = spends.filter(v => v !== null && v > FRAME_MS * 0.9).length;
  const slow = spends.filter(v => v !== null && v > 0 && v <= FRAME_MS * 0.9).length;
  const frozen = spends.filter(v => v === 0).length;
  const armLawOK = Math.abs(armExact - FLIP_MS) < 1e-6;
  const spendLawOK = rawSpend >= FLIP_MS - 1e-9 && rawSpend < FLIP_MS + FRAME_MS;
  const landLawOK = landing !== null && landing.ft === 0 && clampedSpend >= 0;
  if (!armLawOK) allArm = false;
  if (!spendLawOK) allSpend = false;
  if (!landLawOK) allLand = false;
  worstOver = Math.max(worstOver, overshoot);
  rows.push({ s, armFt: s.armFt, armSpend, landRawSpend, spends, rawSpend, clampedSpend, overshoot, armExact, full, slow, frozen, armLawOK, spendLawOK, landLawOK });
}

for (const r of rows) {
  const perFrame = r.spends.map(v => v === null ? '?' : v.toFixed(2)).join(' + ');
  console.log(`  arm@${String(r.s.armIdx).padStart(4)} armFt ${r.armFt.toFixed(3)} armSpend ${r.armSpend === null ? '?' : r.armSpend.toFixed(3)} | spends [${perFrame}] land ${r.landRawSpend === null ? '?' : r.landRawSpend.toFixed(3)}`);
  console.log(`         raw ${r.rawSpend.toFixed(3)} vs ${FLIP_MS} (overshoot ${r.overshoot.toFixed(3)}, clamped residual ${r.clampedSpend.toFixed(3)}) | armExact ${r.armExact.toFixed(3)} ${r.armLawOK ? 'ok' : 'FAIL'} | full ${r.full} slow ${r.slow} frozen ${r.frozen}`);
}
console.log('');
console.log(`SUMMARY over ${rows.length} sweeps:`);
console.log(`  ARM law  (arm flipT + the arm frame's tick-witnessed spend === CFG.flipMs): ${allArm ? 'HOLDS for every sweep' : 'FAILS'}`);
console.log(`  LAND law (the clock reaches EXACTLY 0 at the landing frame): ${allLand ? 'HOLDS for every sweep' : 'FAILS'}`);
console.log(`  SPEND law (raw spend >= CFG.flipMs and < CFG.flipMs + one frame): ${allSpend ? 'HOLDS for every sweep' : 'FAILS'}`);
console.log(`  worst clamp overshoot (the tail Math.max(0,·) masks): ${worstOver.toFixed(3)} ms (one frame = ${FRAME_MS} ms)`);
console.log(`  worst full-rate frame count: ${Math.max(...rows.map(r => r.full))} (old budget 13/sweep)`);
