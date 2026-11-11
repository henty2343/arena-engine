/* scratch/triage/patch-flipproof.mjs — asserted-patch (Item-3 triage, session 6, 2026-11-11).
 * Target: .qa/flipproof.mjs. Menu item 5: the flipproof SEEDS (stale) and the T4 budget (stale).
 *
 * FP1 — SEEDS. FLAG_SEED 2 / CTRL_SEED 4 had both rotted:
 *   - s2 rolls [[scythe,tome],[hammer,javelin]] — BOTH sides carry a flagged weapon (the javelin's
 *     headLead joined the mirror at skewer-r46), so T2's "the unflagged side never leaves ±1" law
 *     drowned in false reds;
 *   - s4 now rolls the STAFF, which joined the edge-leading mirror at the 2026-10-28 facing pass,
 *     so the CONTROL battle was not a control (T2b's own rollsFlagged tripwire fired).
 *   The measured naturals (scratch/triage/diag-flip-seeds.mjs, the session-2 scan redone with the
 *   one-side criterion) are FLAG -> s1 (spear+flail / scythe+shield, 38 parries, the flagged spear
 *   on ONE side only) and CTRL -> s7 (orb+orb / bow+boomerang, 13 parries, nothing flagged in any
 *   rolled round). The argv override stays; the tripwire stays a hard assert; a pinned seed that
 *   stops holding FAILS LOUDLY (never a silent fallback).
 *
 * FP2 — SCAN. track which side ever held a flagged weapon IN A PARRY, so the one-side criterion
 *   is checkable (this is the criterion s2 fails).
 *
 * FP3 — T4. The old cell counted FRAMES (epLen - epFrozen <= epSweeps * 13). That budget predates
 *   slowmo-r63: the flip clock is a WALL clock (canonical :5080) and the hit-slow window stretches
 *   it (the draw call gets dtFrames*fxRate, canonical :5267), so a slowed sweep legitimately spans
 *   more than 13 frames — session 2 measured episode 2 at 17 frames with 0 hitstop-frozen and the
 *   old cell called it red. The old epFrozen counter could not help: inf.stopMs is the KO HARD
 *   FREEZE (stopTicks), NOT the hit-slow window. The law becomes the clock's own LEDGER, measured
 *   per SWEEP (an arm event through its landing):
 *     A1 ARM   the clock is armed at exactly CFG.flipMs
 *     A2 LAND  the clock lands at exactly 0
 *     A3 SPEND the RAW spend covers the budget and no more (CFG.flipMs <= raw < CFG.flipMs + 1 frame)
 *     A4 TAIL  the clamp's masked tail is bounded (0 <= raw - CFG.flipMs <= the landing frame's spend)
 *     A5 RESET the number of ARMS equals the number of SWEEPS
 *     A6 RATE  the FULL-RATE frame count per sweep <= 13 (the old budget, honestly scoped)
 *   A3/A4 use the RAW per-frame spend, NOT the clamped residual: the canonical's Math.max(0,...)
 *   (canonical :5080) drops the last frame's tail, so a clamped sum reads SHORT and the law would
 *   fail spuriously. The raw spend comes from TWO independent channels: the flip clock's own
 *   decrease (exact for every frame except the arm and the landing) and the SIM TICK COUNTER G.t
 *   (the frame loop runs floor(tickAcc) sim ticks with tickAcc += adv*fxRate, so a frame that
 *   advanced >= 2 ticks ran FULL RATE — any slower rate advances at most 1 tick per frame at
 *   tickHz 120 / 16.7ms — and its spend is exactly the wall dt). Every measured sweep agrees to
 *   1e-6 (scratch/triage/diag-flip-ledger.mjs); A1 carries 0.5ms of tolerance because the tick
 *   channel resolves a rate only to {1, 0.25} and the hit-slow window's EDGE frame blends its rate.
 *
 * FP4 — SEED VALIDATION. The one-side criterion becomes a hard assert, and a pinned seed that
 *   stops holding prints a loud, actionable failure instead of silently drifting.
 *
 * Method (owner non-negotiable): exact-match + expected count, fail loudly, write nothing on mismatch.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = '.qa/flipproof.mjs';
let src = readFileSync(FILE, 'utf8');

const patches = [
  { id: 'FP1-seeds', count: 1,
    old: `const FLAG_SEED = Number(process.argv[3] || 2);    // natural s2: flail+javelin — the javelin's headLead drives the flagged side (s11 retired at the tome merge: the pool-20 re-roll landed it on shield+knives, no flagged weapon)
const CTRL_SEED = Number(process.argv[4] || 4);    // natural s4: crossbow+wand — no flagged weapon in ANY rolled round at pool 20 (s7 → s1 → s4: each roster growth re-rolls the naturals; Part A's rollsFlagged assertion below is the tripwire that catches the next re-roll)`,
    new: `/* SEEDS — RE-SEEDED 2026-11-11 (session 6, menu item 5): the hardcoded pair had rotted.
 *   s2 rolls [[scythe,tome],[hammer,javelin]] — BOTH sides carry a flagged weapon (the javelin's
 *   headLead joined the mirror at skewer-r46), so T2's "the unflagged side never leaves ±1" law
 *   drowned in false reds; and s4 now rolls the STAFF, which joined the mirror at the 2026-10-28
 *   facing pass, so the CONTROL battle was not a control (T2b's own rollsFlagged tripwire fired).
 *   The measured naturals (scratch/triage/diag-flip-seeds.mjs — the session-2 scan redone with the
 *   one-side criterion) are FLAG -> s1 (spear+flail / scythe+shield, 38 parries, the flagged spear
 *   on ONE side only) and CTRL -> s7 (orb+orb / bow+boomerang, 13 parries, nothing flagged in any
 *   rolled round). The argv override stays, the rollsFlagged tripwire stays a HARD assert, and a
 *   pinned seed that stops holding FAILS LOUDLY (it never silently substitutes a fallback) — the
 *   re-pick procedure is \`node scratch/triage/diag-flip-seeds.mjs\`.
 */
const FLAG_SEED = Number(process.argv[3] || 1);    // natural s1: spear+flail / scythe+shield — the spear's lead drives the flagged side, and the OTHER side carries nothing flagged
const CTRL_SEED = Number(process.argv[4] || 7);    // natural s7: orb+orb / bow+boomerang — no flagged weapon in ANY rolled round (s2 → s1 and s4 → s7: each roster growth re-rolls the naturals; Part A's rollsFlagged assertion below is the tripwire that catches the next re-roll)` },

  { id: 'FP2-scan', count: 1,
    old: `  let parries = 0, firstFlaggedParry = { tick: Infinity, side: -1 };
  while (!G.over && t < maxT) {
    tick(G); t++;
    for (const e of G.events) if (e.kind === 'parry') {
      parries++;
      const sides = [(WEAPONS[e.aW].lead || WEAPONS[e.aW].headLead) ? 0 : -1, (WEAPONS[e.bW].lead || WEAPONS[e.bW].headLead) ? 1 : -1];   // flagged = EITHER mirror trait (the headLead blind spot is what broke this probe at the tome merge)
      for (const s of sides) if (s >= 0 && e.tick < firstFlaggedParry.tick) firstFlaggedParry = { tick: e.tick, side: s };
    }
    G.events.length = 0;
  }
  const rollsFlagged = G.rolls.some(r => r.w.some(w => WEAPONS[w].lead || WEAPONS[w].headLead));
  return { parries, firstFlaggedParry, rolls: G.rolls.map(r => r.w), rollsFlagged };`,
    new: `  let parries = 0, firstFlaggedParry = { tick: Infinity, side: -1 };
  const sideFlagged = [false, false];   // RE-SEEDED 2026-11-11 (session 6, FP2): did this side ever hold a flagged weapon IN A PARRY? — the one-side criterion that rejects s2 (both sides flagged)
  while (!G.over && t < maxT) {
    tick(G); t++;
    for (const e of G.events) if (e.kind === 'parry') {
      parries++;
      const sides = [(WEAPONS[e.aW].lead || WEAPONS[e.aW].headLead) ? 0 : -1, (WEAPONS[e.bW].lead || WEAPONS[e.bW].headLead) ? 1 : -1];   // flagged = EITHER mirror trait (the headLead blind spot is what broke this probe at the tome merge)
      for (const s of sides) if (s >= 0 && e.tick < firstFlaggedParry.tick) firstFlaggedParry = { tick: e.tick, side: s };
      if (sides[0] >= 0) sideFlagged[0] = true;
      if (sides[1] >= 0) sideFlagged[1] = true;
    }
    G.events.length = 0;
  }
  const rollsFlagged = G.rolls.some(r => r.w.some(w => WEAPONS[w].lead || WEAPONS[w].headLead));
  return { parries, firstFlaggedParry, rolls: G.rolls.map(r => r.w), rollsFlagged, sideFlagged };` },

  { id: 'FP3-t4', count: 1,
    old: `  let prevAnimating = false, maxEpisode = 0, epLen = 0, epSweeps = 0, prevInZone = false, maxSweeps = 1, epFrozen = 0;
  const singleBudget = Math.ceil(CFG.flipMs / FRAME_MS) + 2;   // one sweep; a mid-sweep re-parry CONCATENATES a second continuous sweep (two clangs = two flips), so the episode budget is per sweep
  const minFrameForParry = Math.floor(A.firstFlaggedParry.tick / (FRAME_MS * CFG.tickHz / 1000)) - 3;   // ~2 sim ticks per frame, minus slack
  let signBefore = null, signAfter = null;
  for (let i = 0; i < 9000; i++) {
    if (!step(i)) break;
    const inf = app.info();
    const cur = inf.flip[side], oth = inf.flip[other];
    if (Math.abs(oth) !== 1) chk(false, \`T2 unflagged side left ±1 (\${oth}) at frame \${i}\`);
    const animating = Math.abs(cur) < 1;
    if (animating) {
      if (before && i < minFrameForParry) chk(false, \`T3 transition before the first flagged parry (frame \${i} < \${minFrameForParry})\`);
      before = false;
      animFrames++; epLen++;
      if (inf.stopMs > 0) epFrozen++;   // a hitstop overlapping the sweep freezes the transition clock with the frame (by design) — frozen frames extend the episode but are not sweep time
      const inZone = Math.abs(cur) <= 0.3;
      if (inZone) { edgeOnSeen = true; if (!prevInZone) epSweeps++; }   // each edge-on entry = one sweep
      prevInZone = inZone;
      if (signBefore === null) signBefore = -Math.sign(cur) || 1;
    } else {
      if (prevAnimating) {   // episode just ended
        episodes++;
        chk(epLen - epFrozen <= epSweeps * singleBudget, \`T4 episode \${episodes}: \${epLen} frames (\${epFrozen} hitstop-frozen) ≤ \${epSweeps} sweep(s) × \${singleBudget}\`);
        if (epLen > maxEpisode) maxEpisode = epLen;
        if (epSweeps > maxSweeps) maxSweeps = epSweeps;
        if (Math.abs(cur) === 1) { landedExact++; signAfter = Math.sign(cur); }
        epLen = 0; epSweeps = 0; epFrozen = 0; prevInZone = false;
      }
      if (cur !== 1 && cur !== -1) chk(false, \`T1 flagged side at rest is not exactly ±1 (\${cur}) at frame \${i}\`);
    }
    prevAnimating = animating;
    if (app.state().over) break;
  }`,
    new: `  let prevAnimating = false, maxEpisode = 0, epLen = 0, epSweeps = 0, prevInZone = false, maxSweeps = 1, epFull = 0;
  const singleBudget = Math.ceil(CFG.flipMs / FRAME_MS) + 2;   // the FULL-RATE frame budget per sweep (13); the old cell counted EVERY frame, which the hit-slow window legitimately stretches — a mid-sweep re-parry CONCATENATES a second continuous sweep (two clangs = two flips), so the budget is per sweep
  const minFrameForParry = Math.floor(A.firstFlaggedParry.tick / (FRAME_MS * CFG.tickHz / 1000)) - 3;   // ~2 sim ticks per frame, minus slack
  let signBefore = null, signAfter = null;
  /* ---- T4 — RE-SEEDED 2026-11-11 (session 6, menu item 5): the flip clock's own LEDGER ----
   * SUPERSEDED (kept visible): the old cell counted FRAMES —
   *   ok(epLen - epFrozen <= epSweeps * singleBudget)
   * It FAILed on CORRECT code. The budget predates slowmo-r63: the flip clock is a WALL clock
   * (canonical :5080, fa.t -= dtFrames * 1000/60) and the hit-slow window STRETCHES it (the draw
   * call gets dtFrames * fxRate, canonical :5267), so a slowed sweep legitimately spans more than
   * 13 frames — session 2 measured episode 2 at 17 frames with 0 hitstop-frozen and the old cell
   * called it red. The old epFrozen counter could not help: inf.stopMs is the KO HARD FREEZE
   * (stopTicks), NOT the hit-slow window.
   * The law is now the clock's ledger, measured per SWEEP (an arm event through its landing):
   *   A1 ARM   the clock is armed at exactly CFG.flipMs      (arm flipT + the arm frame's spend)
   *   A2 LAND  the clock lands at exactly 0                  (the landing frame's flipT === 0)
   *   A3 SPEND the RAW spend covers the budget and no more   (CFG.flipMs <= raw < CFG.flipMs + 1 frame)
   *   A4 TAIL  the clamp's masked tail is bounded            (0 <= raw - CFG.flipMs <= the landing frame's spend)
   *   A5 RESET the number of ARMS equals the number of SWEEPS (no arm without a sweep, no sweep without an arm)
   *   A6 RATE  the FULL-RATE frame count per sweep <= 13     (the old budget, honestly scoped; with A5
   *           proving arms === sweeps and every measured sweep being one episode, this IS the old
   *           epSweeps * 13 law with the right units)
   * A3/A4 use the RAW per-frame spend, NOT the clamped residual: the canonical's Math.max(0,...)
   * (canonical :5080) silently drops the last frame's tail, so a clamped sum reads SHORT and the
   * law would fail spuriously. The raw spend is recovered from TWO independent channels: the flip
   * clock's own decrease (exact for every frame except the arm and the landing) and the SIM TICK
   * COUNTER G.t — the frame loop runs floor(tickAcc) sim ticks with tickAcc += adv*fxRate, so a
   * frame that advanced >= 2 ticks ran FULL RATE (any slower rate advances at most 1 tick per
   * frame at tickHz 120 / 16.7ms) and its spend is exactly the wall dt. Every measured sweep
   * agrees to 1e-6 (scratch/triage/diag-flip-ledger.mjs); A1 carries TOL_MS of tolerance because
   * the tick channel resolves a rate only to {1, 0.25} and the hit-slow window's EDGE frame blends
   * its rate.
   */
  const TOL_MS = 0.5;
  let prevFt = null, prevGt = null, sweep = null, arms = 0, sweepCount = 0, cappedSweeps = 0, lastFull = 0;
  const evaluateSweep = (sw) => {
    sweepCount++;
    const F = sw.frames;
    const armTick = F[0].tickAdv;
    const nextObs = F.length > 1 ? F[1].obs : null;
    /* the arm frame's own spend is not observable from the clock (it went 0 -> CFG.flipMs - spend) */
    let armSpend;
    if (armTick >= 2) armSpend = FRAME_MS;                                      // the tick channel: that frame ran FULL RATE
    else if (nextObs !== null && nextObs <= FRAME_MS * 0.75) armSpend = nextObs;  // same rate as the next frame (exact)
    else armSpend = CFG.hitSlowRate * FRAME_MS;                                 // the tick channel's slow resolution
    const landing = F[F.length - 1];
    const residual = landing.obs === null ? 0 : landing.obs;                    // the CLAMPED tail the clock kept
    const landSpend = Math.max(residual, landing.tickAdv >= 2 ? FRAME_MS : CFG.hitSlowRate * FRAME_MS);
    const mid = F.slice(1, -1).reduce((a, f) => a + (f.obs === null ? 0 : f.obs), 0);
    const raw = armSpend + mid + landSpend;
    const capped = F.some(f => f.phase !== F[0].phase);                         // a phase change snapped the clock mid-sweep
    if (capped) cappedSweeps++;
    let full = 0;
    F.forEach((f, idx) => {
      const s = idx === 0 ? armSpend : (idx === F.length - 1 ? landSpend : (f.obs === null ? 0 : f.obs));
      if (s > FRAME_MS * 0.9) full++;
    });
    lastFull = full;
    const armOk = Math.abs(sw.armFt + armSpend - CFG.flipMs) <= TOL_MS;
    const landOk = landing.ft === 0;
    const spendOk = !capped && raw >= CFG.flipMs - 1e-9 && raw < CFG.flipMs + FRAME_MS;
    const tailOk = !capped && raw - CFG.flipMs >= -1e-9 && raw - CFG.flipMs <= landSpend + 1e-9;
    const rateOk = full <= singleBudget;
    if (!armOk) chk(false, \`T4 sweep \${sweepCount}: ARM law — the clock read \${sw.armFt.toFixed(3)}ms after the arm frame, which spent \${armSpend.toFixed(3)}ms = \${(sw.armFt + armSpend).toFixed(3)}ms, expected exactly \${CFG.flipMs}ms (tol \${TOL_MS}ms)\`);
    if (!landOk) chk(false, \`T4 sweep \${sweepCount}: LAND law — the clock ended at \${landing.ft}ms, expected exactly 0\`);
    if (!spendOk) chk(false, \`T4 sweep \${sweepCount}: SPEND law — the raw spend \${raw.toFixed(3)}ms is outside [\${CFG.flipMs}, \${CFG.flipMs + FRAME_MS})ms\${capped ? ' (the sweep was capped by a phase change)' : ''}\`);
    if (!tailOk) chk(false, \`T4 sweep \${sweepCount}: TAIL law — the clamp's masked tail \${(raw - CFG.flipMs).toFixed(3)}ms is outside [0, \${landSpend.toFixed(3)}]ms\`);
    if (!rateOk) chk(false, \`T4 sweep \${sweepCount}: RATE law — \${full} full-rate frames > \${singleBudget} per sweep\`);
  };
  for (let i = 0; i < 9000; i++) {
    if (!step(i)) break;
    const inf = app.info();
    const st = app.state();
    const cur = inf.flip[side], oth = inf.flip[other];
    const ft = inf.flipT[side], gt = st.t;
    const tickAdv = prevGt === null ? 0 : gt - prevGt;
    /* ---- the flip clock ledger (T4) ---- */
    const armed = prevFt !== null && ft > prevFt + 1e-9;
    if (armed) {
      arms++;
      sweep = { armFt: ft, frames: [{ ft, tickAdv, phase: st.phase, obs: null }] };
    } else if (sweep) {
      sweep.frames.push({ ft, tickAdv, phase: st.phase, obs: (prevFt !== null && ft < prevFt) ? (prevFt - ft) : null });
      if (ft === 0) { evaluateSweep(sweep); sweep = null; }
    }
    if (Math.abs(oth) !== 1) chk(false, \`T2 unflagged side left ±1 (\${oth}) at frame \${i}\`);
    const animating = Math.abs(cur) < 1;
    if (animating) {
      if (before && i < minFrameForParry) chk(false, \`T3 transition before the first flagged parry (frame \${i} < \${minFrameForParry})\`);
      before = false;
      animFrames++; epLen++;
      const inZone = Math.abs(cur) <= 0.3;
      if (inZone) { edgeOnSeen = true; if (!prevInZone) epSweeps++; }   // each edge-on entry = one sweep
      prevInZone = inZone;
      if (signBefore === null) signBefore = -Math.sign(cur) || 1;
    } else {
      if (prevAnimating) {   // episode just ended
        episodes++;
        /* T4's episode-level statement, now in the right units: the FULL-RATE frames of the
         * episode's sweep(s) against the per-sweep budget. The old cell counted every frame. */
        chk(epFull <= epSweeps * singleBudget, \`T4 episode \${episodes}: \${epFull} full-rate frames ≤ \${epSweeps} sweep(s) × \${singleBudget}\`);
        if (epLen > maxEpisode) maxEpisode = epLen;
        if (epSweeps > maxSweeps) maxSweeps = epSweeps;
        if (Math.abs(cur) === 1) { landedExact++; signAfter = Math.sign(cur); }
        epLen = 0; epSweeps = 0; epFull = 0; prevInZone = false;
      }
      if (cur !== 1 && cur !== -1) chk(false, \`T1 flagged side at rest is not exactly ±1 (\${cur}) at frame \${i}\`);
    }
    prevAnimating = animating; prevFt = ft; prevGt = gt;
    if (st.over) break;
  }
  /* T4's ledger summary + the arm/sweep accounting (A5) */
  chk(arms === sweepCount, \`T4 RESET law — \${arms} clock arm(s) vs \${sweepCount} sweep(s) (every arm must be a sweep, every sweep an arm)\`);
  console.log(\`     (T4 ledger: \${sweepCount} sweep(s), \${arms} arm(s), \${cappedSweeps} capped by a phase change, worst episode \${maxEpisode} frames, max sweeps in one episode \${maxSweeps}, full-rate budget \${singleBudget}/sweep at flipMs \${CFG.flipMs})\`);` },

  { id: 'FP4-validation', count: 1,
    old: `chk(A.parries > 0 && A.firstFlaggedParry.side >= 0, 'T2a flagged battle really parries with a lead weapon (non-vacuous)');
chk(C.parries > 0 && !C.rollsFlagged, 'T2b control battle really parries with NO flagged weapon in any rolled round (rollsFlagged = the pool-growth tripwire)');`,
    new: `chk(A.parries > 0 && A.firstFlaggedParry.side >= 0, 'T2a flagged battle really parries with a lead weapon (non-vacuous)');
/* RE-SEEDED 2026-11-11 (session 6, FP4): the ONE-SIDE criterion — the flagged weapon must sit on
 * ONE side only, or T2's "the unflagged side never leaves ±1" law drowns in false reds (s2 rolled
 * the javelin on the far side and did exactly that). */
const AOtherFlagged = A.sideFlagged[1 - A.firstFlaggedParry.side];
chk(!AOtherFlagged, \`T2a' the OTHER side never holds a flagged weapon (s\${FLAG_SEED}: side \${A.firstFlaggedParry.side} flagged, side \${1 - A.firstFlaggedParry.side} clean)\`);
chk(C.parries > 0 && !C.rollsFlagged, 'T2b control battle really parries with NO flagged weapon in any rolled round (rollsFlagged = the pool-growth tripwire)');
/* LOUD FAIL on a pinned seed that no longer holds — the probe never silently substitutes a
 * fallback seed. The re-pick procedure is \`node scratch/triage/diag-flip-seeds.mjs\`. */
if (!A.parries || A.firstFlaggedParry.side < 0 || AOtherFlagged || !C.parries || C.rollsFlagged) {
  console.error('');
  console.error(\`!! PINNED SEED NO LONGER HOLDS — refusing to continue with a seed that fails its own criterion.\`);
  console.error(\`   FLAG_SEED \${FLAG_SEED}: parries \${A.parries}, first flagged side \${A.firstFlaggedParry.side}, sideFlagged \${JSON.stringify(A.sideFlagged)}, rolls \${JSON.stringify(A.rolls)}\`);
  console.error(\`   CTRL_SEED \${CTRL_SEED}: parries \${C.parries}, rollsFlagged \${C.rollsFlagged}, rolls \${JSON.stringify(C.rolls)}\`);
  console.error(\`   Re-pick the naturals with: node scratch/triage/diag-flip-seeds.mjs\`);
  console.error('');
  process.exit(1);
}` },
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
