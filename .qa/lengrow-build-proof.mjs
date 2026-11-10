/* .qa/lengrow-build-proof.mjs — proves the BUILT length-growth ladder does what the design says.
 *
 * lengrow-gate.mjs proved the GEOMETRY passes the inscription gate. This proves the WIRING:
 * that the ladder the sim actually carries is the geometry that was gated, and that the
 * owner's rulings hold in the running build rather than on paper.
 *
 * Asserted:
 *   A  ladder shape      — one ladder per growing weapon, LEN_STEPS+1 entries, step 0 is the
 *                           shipped data BY IDENTITY,
 *                           and each grown step is its baked LEN_CIRCLES row BY IDENTITY
 *   B  never thickens    — the ART invariant: no poly point's lateral coordinate ever moves, so
 *                           the drawn envelope is identical at every step. The COVERING is re-baked
 *                           past the d-remap ceiling, so its radii are the packer's; inscription is
 *                           proven per step by `lengrow-bake.mjs --verify`, sanity here
 *   C  authored rate     — the drawn tip grows exactly (1 + trait.len)^s, not a linearised drift
 *   D  rigid head        — every point past the junction translates by ONE shared delta
 *   E  scaling shaft     — every point at or behind the junction scales by ONE shared factor
 *   F  no gap opens      — the shaft's end still reaches past the head cluster's rear
 *   G  REACH raised      — to the top step (it is the parryGap prune bound; stale would cull hits)
 *   H  MINR ladder-min   — the ladder-wide minimum, NOT the base row's: a re-baked step can pack
 *                           thinner, and MINR sizes the parry substep budget
 *   I  row not mutated   — WEAPONS.spear.len and its base poly/circles are the shipped objects
 *   J  grow() advances   — one step per damaging hit, clamped at the UNIFORM cap (LEN_STEPS —
 *                           per-fighter caps retired at nocombo-r34), never past the baked geometry
 *   K  round resets it   — lenStep is 0 at the start of the next round (the round IS the cap);
 *                           sampled one tick after G.round++, which is when rollWeapons() runs
 *   L  collision follows — bladeCircles at step s emits the ladder's step-s circles
 *   M  others unaffected — a non-growing weapon has no ladder and ignores a step entirely
 *   N  not vacuous       — a growth-OFF control diverges from the built sim on forced-spear
 *                           cells, which the 8-cell fingerprint suite structurally cannot show
 *   O  uniform cap       — nocombo-r34: `skill.lenSteps` is GONE from every skill object, the
 *                           ladder is exactly LEN_STEPS+1 rows (the 18-step era is purged), grow()
 *                           clamps EVERY fighter at the SAME top, real battles saturate it and
 *                           never pass it, labels are authored, and REACH is the step-12 reach
 *                           for every holder
 *
 * Written to loop over GROWERS and FIGHTERS rather than naming the spear and Heavy, so a second
 * length-growing weapon or a second fighter is covered by the same assertions without a rewrite.
 *
 * Read-only: writes nothing, runs no measure.mjs. Usage: node .qa/lengrow-build-proof.mjs [file]
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(process.argv[2] ? join(here, '..', process.argv[2]) : join(here, '..', 'previews', 'spinclash-preview.html'));

function fakeEl() {
  const t = function () {};
  return new Proxy(t, {
    get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl(); return x[p]; },
    set(x, p, v) { x[p] = v; return true; },
    apply() { return fakeEl(); },
  });
}
const html = readFileSync(FILE, 'utf8');
const a = html.indexOf('<script>'), b = html.indexOf('</script>', a);
let body = html.slice(a + 8, b);
const opener = '(function () {';
body = body.slice(body.indexOf(opener) + opener.length);
body = body.slice(0, body.lastIndexOf('})();'));
const EXPORTS = 'newGame, tick, CFG, WEAPONS, WEAPON_IDS, FIGHTERS, LEN_LADDER, LEN_STEPS, LEN_CIRCLES, LEN_REMAP_CEIL, REACH, MINR, SPAN, bladeCircles, grow, spineFrame, SKILL_SHORT';
const api = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
  body + `\n;return { ${EXPORTS} };`)(
  { getElementById: () => fakeEl(), createElement: () => fakeEl(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
  { now: () => 0 }, () => 0, console);
const { newGame, tick, CFG, WEAPONS, WEAPON_IDS, FIGHTERS, LEN_LADDER, LEN_STEPS, LEN_CIRCLES, LEN_REMAP_CEIL, REACH, MINR, bladeCircles, grow, SKILL_SHORT } = api;

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}${detail ? '  — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? '  — ' + detail : ''}`); }
};
const near = (x, y, t = 1e-9) => Math.abs(x - y) <= t;

console.log(`lengrow-build-proof — ${FILE.split('/').pop()}`);
const GROWERS = WEAPON_IDS.filter(id => WEAPONS[id].trait && WEAPONS[id].trait.len);
console.log(`  LEN_STEPS ${LEN_STEPS} (uniform cap, nocombo-r34) · growing weapons: ${GROWERS.join(', ') || '(none)'}`);
console.log('');

const WID = 'spear';
const W = WEAPONS[WID], L = LEN_LADDER[WID], rate = W.trait.len;
const baseC = W.poly.circles, baseP = W.poly.polys;
const tipOf = (polys) => { let t = 0; for (const pl of polys) for (const pts of pl.subs) for (const q of pts) if (q[0] > t) t = q[0]; return t; };
const tip0 = tipOf(baseP), J = L.J;

/* ---------- A: ladder shape ---------- */
console.log('A  ladder shape');
ok('every growing weapon has a ladder, and no other does', GROWERS.every(id => LEN_LADDER[id]) && WEAPON_IDS.filter(id => LEN_LADDER[id]).length === GROWERS.length, GROWERS.join(',') || '(none)');
ok('ladder has LEN_STEPS+1 entries', L.circles.length === LEN_STEPS + 1 && L.polys.length === LEN_STEPS + 1,
  `${L.circles.length} circle sets, ${L.polys.length} poly sets`);
ok('step 0 IS the shipped data by identity', L.circles[0] === baseC && L.polys[0] === baseP);
const BAKED = (LEN_CIRCLES && LEN_CIRCLES[WID]) || null;
ok('the baked row set is complete (one per grown step)', !BAKED || BAKED.length === LEN_STEPS,
  BAKED ? `${BAKED.length} rows for ${LEN_STEPS} steps` : 'no baked rows — this ladder is d-remapped');
ok('every grown step IS its baked row by identity',
  L.circles.every((row, s) => (s === 0 ? row === baseC : !BAKED || row === BAKED[s - 1])),
  BAKED ? `${L.circles.map(c => c.length).join('/')} circles per step (step 0 = the shipped ${baseC.length})` : 'd-remapped from the shipped row');
ok('circle counts never shrink as the spear lengthens',
  L.circles.every((row, s) => s === 0 || row.length >= L.circles[s - 1].length),
  `${L.circles.map(c => c.length).join('/')} — a longer shaft needs at least as many circles`);
ok('junction strictly inside the tip', J > 0 && J < tip0, `J ${J.toFixed(3)} of tip ${tip0.toFixed(3)} (${(J / tip0 * 100).toFixed(1)}%)`);

/* ---------- B: never thickens ---------- */
/* What "never thickens" guarantees changed when the covering started being re-baked, and the
   distinction matters. The owner's fear was the ART fattening ("im scared the spear will become
   'thick'"), and that is still guaranteed STRUCTURALLY: the ladder remaps only the spine
   coordinate d and never writes a poly's l, so the drawn silhouette stays exactly as wide at every
   step. The COVERING is no longer the base row's radii held — past the +39.5% d-remap ceiling each
   step is re-packed by the house packer, so its l/r are that packer's output and are NOT expected
   to match step 0. That circles stay inside the ink is the gate's job and is proven per step by
   `node .qa/lengrow-bake.mjs --verify`; what belongs here is the art invariant plus sanity on the
   rows actually in use. */
console.log('B  never thickens (the owner\'s stated fear) — the ART invariant');
const envOf = (polys) => { let m = 0; for (const pl of polys) for (const pts of pl.subs) for (const q of pts) m = Math.max(m, Math.abs(q[1])); return m; };
let envBad = 0, worstEnv = 0;
for (let s = 1; s <= LEN_STEPS; s++) { const d = Math.abs(envOf(L.polys[s]) - envOf(baseP)); if (!(d < 1e-12)) { envBad++; worstEnv = Math.max(worstEnv, d); } }
ok('drawn lateral envelope identical at EVERY step', envBad === 0,
  envBad ? `${envBad} step(s) drift, worst ${worstEnv}` : `|l|max ${envOf(baseP).toFixed(4)} at all ${LEN_STEPS + 1} steps`);
const lat0 = baseP.map(pl => pl.subs.map(pts => pts.map(q => q[1])));
let latMove = 0, latN = 0;
for (let s = 1; s <= LEN_STEPS; s++) for (let pi = 0; pi < lat0.length; pi++) for (let si = 0; si < lat0[pi].length; si++) for (let qi = 0; qi < lat0[pi][si].length; qi++) {
  latN++; if (!Object.is(L.polys[s][pi].subs[si][qi][1], lat0[pi][si][qi])) latMove++;
}
ok('no poly point\'s lateral coordinate ever moves', latMove === 0,
  latMove ? `${latMove} of ${latN} l values drift` : `${latN} l values compared across ${LEN_STEPS} steps, 0 drift — only d is remapped`);
const allC = L.circles.flat();
ok('every covering circle respects the packer\'s RMIN floor (2.0)', allC.every(c => c.r >= 2.0 - 1e-12),
  `${allC.length} circles across the ladder, min r ${Math.min(...allC.map(c => c.r)).toFixed(2)}, max r ${Math.max(...allC.map(c => c.r)).toFixed(2)}`);
ok('no covering circle is wider than the shipped row\'s widest',
  Math.max(...allC.map(c => c.r)) <= Math.max(...baseC.map(c => c.r)) + 1e-12,
  `ladder max r ${Math.max(...allC.map(c => c.r)).toFixed(2)} vs shipped max r ${Math.max(...baseC.map(c => c.r)).toFixed(2)}`);

/* ---------- C: the authored rate is what the tip actually gets ---------- */
console.log('C  observable growth rate');
let worstRate = 0;
for (let s = 1; s <= LEN_STEPS; s++) {
  const got = tipOf(L.polys[s]) / tip0, want = Math.pow(1 + rate, s);
  worstRate = Math.max(worstRate, Math.abs(got - want));
}
ok('tip grows exactly (1+rate)^s at every step', worstRate < 1e-12, `worst deviation ${worstRate.toExponential(2)}`);
/* the target is derived from the row's own rate, never hardcoded — it went stale once already,
   when the owner raised 0.012 (+15.4%) to 0.0253 (+35.0%) and this line still asserted 1.012^12 */
const TOPK = Math.pow(1 + rate, LEN_STEPS);
ok(`top step matches the authored rate over ${LEN_STEPS} steps`, near(tipOf(L.polys[LEN_STEPS]) / tip0, TOPK, 1e-9),
  `rate ${(rate * 100).toFixed(2)}%/hit -> tip ${tip0.toFixed(3)} -> ${tipOf(L.polys[LEN_STEPS]).toFixed(3)}px (+${((tipOf(L.polys[LEN_STEPS]) / tip0 - 1) * 100).toFixed(2)}%)`);
ok('top step is under the d-remap ceiling OR carries baked rows',
  tipOf(L.polys[LEN_STEPS]) / tip0 <= LEN_REMAP_CEIL + 1e-12 || !!BAKED,
  `+${((TOPK - 1) * 100).toFixed(2)}% vs the +${((LEN_REMAP_CEIL - 1) * 100).toFixed(1)}% d-remap ceiling — ${BAKED ? `${BAKED.length} re-baked rows carry it` : 'remapped, inside the ceiling'}`);
ok('shaft factor exceeds the tip factor (derived, not authored)', L.k[LEN_STEPS] > L.tipK[LEN_STEPS],
  `shaft k ${L.k[LEN_STEPS].toFixed(4)} vs tip ${(L.tipK[LEN_STEPS]).toFixed(4)}`);

/* ---------- D/E/F: the piecewise map ---------- */
console.log('D/E/F  piecewise map: rigid head, scaling shaft, no gap');
let headBad = 0, shaftBad = 0, gapBad = 0;
for (let s = 1; s <= LEN_STEPS; s++) {
  const delta = (L.k[s] - 1) * J;
  let headD = null, shaftK = null;
  const shapes0 = baseP.map(pl => pl.subs.map(pts => pts.map(q => q[0])));
  for (let pi = 0; pi < baseP.length; pi++) {
    for (let si = 0; si < baseP[pi].subs.length; si++) {
      for (let qi = 0; qi < baseP[pi].subs[si].length; qi++) {
        const d0 = shapes0[pi][si][qi], d1 = L.polys[s][pi].subs[si][qi][0];
        if (d0 > J) { const t = d1 - d0; if (headD === null) headD = t; else if (!near(t, headD, 1e-9)) headBad++; }
        else { const r = d0 === 0 ? null : d1 / d0; if (r !== null) { if (shaftK === null) shaftK = r; else if (!near(r, shaftK, 1e-9)) shaftBad++; } }
      }
    }
  }
  if (headD !== null && !near(headD, delta, 1e-9)) headBad++;
  if (shaftK !== null && !near(shaftK, L.k[s], 1e-9)) shaftBad++;
  /* the shaft's end must still reach past the head cluster's rear, or a gap opens in the art */
  const shaftEnd = L.polys[s][0].subs[0].reduce((m, q) => Math.max(m, q[0]), 0);
  const headRear = Math.min(...L.polys[s].slice(1).flatMap(pl => pl.subs.flat()).map(q => q[0]));
  if (headRear > shaftEnd) gapBad++;
}
ok('every point past the junction translates by ONE delta', headBad === 0, headBad ? `${headBad} deviations` : 'the head cluster is a rigid body');
ok('every point at/behind the junction scales by ONE factor', shaftBad === 0, shaftBad ? `${shaftBad} deviations` : 'the shaft stays a rectangle');
ok('no gap opens between shaft and head', gapBad === 0,
  `shaft end ${L.polys[LEN_STEPS][0].subs[0].reduce((m, q) => Math.max(m, q[0]), 0).toFixed(2)} >= head rear ${Math.min(...L.polys[LEN_STEPS].slice(1).flatMap(pl => pl.subs.flat()).map(q => q[0])).toFixed(2)} at the top step`);

/* ---------- G/H: the derived tables ---------- */
console.log('G/H  REACH raised, MINR is the ladder-wide minimum');
const topReach = (() => { let r = 0; for (const pl of L.polys[LEN_STEPS]) for (const pts of pl.subs) for (const pt of pts) { const rd = Math.hypot(CFG.bodyR * 0.96 + pt[0], Math.abs(pt[1])) + 1.5; if (rd > r) r = rd; } return r; })();
ok('REACH equals the TOP step, not the base', near(REACH[WID], topReach, 1e-9), `REACH ${REACH[WID].toFixed(3)} vs top-step ${topReach.toFixed(3)}`);
ok('REACH grew by the tip growth', REACH[WID] > tip0, `+${(REACH[WID] - (CFG.bodyR * 0.96 + tip0 + 1.5)).toFixed(2)}px of prune-bound headroom`);
const baseMinR = Math.min(...baseC.map(c => c.r));
const ladMinR = Math.min(...L.circles.flat().map(c => c.r));
ok('MINR is the LADDER-WIDE minimum, not the base row\'s', near(MINR[WID], Math.min(baseMinR, ladMinR), 1e-12),
  `MINR ${MINR[WID].toFixed(2)} = min(base ${baseMinR.toFixed(2)}, ladder ${ladMinR.toFixed(2)}) — a re-baked step can pack thinner, and MINR sizes the substep delta`);

/* ---------- I: the shared row is not mutated ---------- */
console.log('I  the shared WEAPONS row is never mutated');
ok('W.len is still the shipped ceiling', near(W.len, 113.44 * CFG.weaponScale, 1e-9), `len ${W.len.toFixed(4)}`);
ok('base polys still hold the shipped tip', near(tipOf(W.poly.polys), tip0, 1e-12), `tip ${tipOf(W.poly.polys).toFixed(4)}`);
ok('base circles still hold the shipped outermost d', near(Math.max(...baseC.map(c => c.d)), 141.8, 0.05),
  `outermost d ${Math.max(...baseC.map(c => c.d)).toFixed(1)}`);

/* ---------- J/K: grow() and the round reset ---------- */
console.log('J/K  grow() advances, the round resets');
const G = newGame(12345, { weapons: [WID, 'sword'] });
tick(G);                                  // the roll assigns weapons; grow() reads f.weapon
const f = G.fighters[0];
ok('the roll armed the spear fighter', f.weapon === WID, `f.weapon ${f.weapon}`);
ok('lenStep starts at 0', f.lenStep === 0);
for (let i = 0; i < 5; i++) grow(G, f);
ok('5 damaging hits -> step 5', f.lenStep === 5, `lenStep ${f.lenStep}`);
for (let i = 0; i < 40; i++) grow(G, f);
ok('clamped at the UNIFORM cap, never past it', f.lenStep === LEN_STEPS,
  `45 hits total -> lenStep ${f.lenStep} of the uniform cap ${LEN_STEPS} (per-fighter caps retired at nocombo-r34)`);
const before = f.lenStep;
grow(G, f);
ok('further hits do not overrun the baked geometry', f.lenStep === before, `lenStep stays ${f.lenStep}`);
/* the round reset: run a real battle until the round advances and check lenStep is 0 there */
const G2 = newGame(777, { weapons: [WID, 'sword'] });
/* Sampling point: G.round++ happens at the END of the 'ko' phase (phase set to 'reveal',
   phaseT = 0), but rollWeapons() — which zeroes lenStep — only runs on the NEXT tick, via
   the reveal branch's `if (G.phaseT === 0) rollWeapons(G)`. Reading on the transition tick
   itself sees last round's step; read one tick later, once the roll has landed. */
let resetSeen = false, resetBad = 0, grew = 0, prevRound = G2.round, atTick = -1, saw = null, pre = null, post = null;
for (let t = 0; t < 40000 && !resetSeen; t++) {
  if (G2.fighters[0].lenStep > grew) grew = G2.fighters[0].lenStep;
  tick(G2);
  if (G2.round !== prevRound) {
    prevRound = G2.round; atTick = t;
    pre = G2.fighters.map(q => q.lenStep);          // carried into 'reveal', pre-roll
    tick(G2);                                        // the first reveal tick runs rollWeapons()
    post = G2.fighters.map(q => q.lenStep);
    for (const q of G2.fighters) if (q.lenStep !== 0) resetBad++;
    resetSeen = true;
    console.log(`       (debug) round -> ${G2.round} at t=${t}: lenStep [${pre.join(', ')}] pre-roll -> [${post.join(', ')}] post-roll, phase ${G2.phase} phaseT ${G2.phaseT}`);
  }
}
ok('the round transition resets lenStep to 0', resetSeen && resetBad === 0,
  resetSeen ? `round -> ${G2.round} at t=${atTick}: [${pre ? pre.join(', ') : '?'}] -> [${post ? post.join(', ') : '?'}]` : 'no round transition within 40k ticks');
ok('a real spear battle actually grows', grew > 0, `reached step ${grew} in round 1`);
ok('the reset is not vacuous (a step was actually carried in)', resetSeen && (pre || []).some(v => v > 0),
  resetSeen ? `max carried-in step ${Math.max(...pre)}` : 'n/a');

/* ---------- L: the collision reads the ladder ---------- */
console.log('L  collision follows the step');
const out0 = [], out7 = [];
bladeCircles(500, 500, 0.0, WID, out0, undefined, 1, 0);
bladeCircles(500, 500, 0.0, WID, out7, undefined, 1, 7);
const maxD0 = Math.max(...out0.filter((_, i) => i % 3 === 0)), maxD7 = Math.max(...out7.filter((_, i) => i % 3 === 0));
ok('step 7 emits further-out circles than step 0', maxD7 > maxD0, `outermost circle x ${maxD0.toFixed(2)} -> ${maxD7.toFixed(2)}`);
ok('step 7 emits EXACTLY the ladder\'s step-7 row', out7.length / 3 === L.circles[7].length &&
  out7.filter((_, i) => i % 3 === 2).every((r, j) => Object.is(r, L.circles[7][j].r)),
  `${out7.length / 3} circles emitted = LEN_LADDER.circles[7].length ${L.circles[7].length}, all radii matched (step 0 emits ${out0.length / 3})`);
const outTop = [];
bladeCircles(500, 500, 0.0, WID, outTop, undefined, 1, LEN_STEPS);
const wantTop = 500 + CFG.bodyR * 0.96 + L.circles[LEN_STEPS][0].d;
ok('the top step matches the ladder table exactly', near(Math.max(...outTop.filter((_, i) => i % 3 === 0)), 500 + CFG.bodyR * 0.96 + Math.max(...L.circles[LEN_STEPS].map(c => c.d)), 1e-9),
  `outermost x ${Math.max(...outTop.filter((_, i) => i % 3 === 0)).toFixed(3)}`);
void wantTop;

/* ---------- M: everyone else is untouched ---------- */
console.log('M  non-growing weapons are unaffected');
ok('no ladder entry for any other weapon', WEAPON_IDS.filter(id => id !== WID).every(id => !LEN_LADDER[id]));
const oA = [], oB = [];
bladeCircles(500, 500, 0.3, 'sword', oA, undefined, 1, 0);
bladeCircles(500, 500, 0.3, 'sword', oB, undefined, 1, 9);
ok('a bogus step on a non-grower changes nothing', oA.length === oB.length && oA.every((v, i) => Object.is(v, oB[i])),
  `${oA.length / 3} sword circles identical at step 0 and step 9`);
ok('the sword has no trait.len', !WEAPONS.sword.trait.len);

/* ---------- N: the build is behaviour-affecting where the house suite cannot see it ---------- */
/* The 8-cell fingerprint suite returned 8/8 BYTE-IDENTICAL for this build, and that result is
   vacuous rather than reassuring: 6 of the 8 cells are forced non-spear matchups, and neither
   natural cell rolls a spear (s7 -> orb+orb, bow+boomerang; s11 -> shield+javelin). No cell can
   observe length growth, exactly as no cell could observe the shot-cross path that cross-r24
   fixed. This section supplies the missing evidence: a growth-OFF control — trait.len zeroed so
   grow() never advances, REACH restored to its base value — against the built sim, same seed,
   forced spear. Because step 0 of the ladder IS the shipped data by identity (A), the control
   reproduces the pre-build geometry exactly.
   WHAT THIS DOES AND DOES NOT ISOLATE (corrected at skill-r29, after a misattribution was caught by
   the non-carrier control below). The control differs from the built sim in TWO ways at once — no
   growth, and base REACH — so divergence here is growth-PLUS-substep-budget, not growth alone.
   That matters because REACH is raised to the TOP of the ladder, and since skill-r29 the top is the
   CARRIER's cap (18), so REACH rises for every spear battle even when the holder cannot grow past
   12. Measured directly: with the spear in the NON-carrier's slot, where both builds cap at 12 and
   the baked rows 1..12 are byte-identical, 10/10 cells still diverge from the previous build, at
   the first fight-phase tick, with lenStep 0 in both. So a taller ladder changes the NUMERICS of
   every spear battle, and no spear cell can be claimed behaviour-identical across a ladder raise. */
console.log('N  the build really changes battles (the 8-cell suite structurally cannot show it)');
const reachOf = (polys) => { let r = 0; for (const pl of polys) for (const pts of pl.subs) for (const pt of pts) { const rd = Math.hypot(CFG.bodyR * 0.96 + pt[0], Math.abs(pt[1])) + 1.5; if (rd > r) r = rd; } return r; };
const baseReach = reachOf(baseP);
ok('REACH is raised above its own base value', REACH[WID] > baseReach, `base ${baseReach.toFixed(3)} -> built ${REACH[WID].toFixed(3)}`);

const trace = (seed, pair, growthOn) => {
  const savedLen = W.trait.len, savedReach = REACH[WID];
  if (!growthOn) { W.trait.len = 0; REACH[WID] = baseReach; }
  let out = [], mx = 0, Gx = null;
  try {
    Gx = newGame(seed, { weapons: pair });
    for (let t = 0; t < 18000 && !Gx.over; t++) {
      tick(Gx);
      const p = Gx.fighters[0], q = Gx.fighters[1];
      out.push([Gx.t, Gx.round, Gx.phase, Gx.wins[0], Gx.wins[1], p.hp, p.pos.x.toFixed(6), p.pos.y.toFixed(6),
        q.hp, q.pos.x.toFixed(6), q.pos.y.toFixed(6), Gx.events.length].join(','));
      for (const f of Gx.fighters) if (f.lenStep > mx) mx = f.lenStep;
    }
  } finally { W.trait.len = savedLen; REACH[WID] = savedReach; }
  return { out, mx, over: Gx.over, wins: Gx.wins.slice(), t: Gx.t };
};

const NCELLS = [[9, ['spear', 'hammer']], [21, ['spear', 'sword']], [33, ['spear', 'scythe']]];
let ctrlMax = 0, diverged = 0, growthMax = 0;
for (const [seed, pair] of NCELLS) {
  const on = trace(seed, pair, true), off = trace(seed, pair, false);
  ctrlMax = Math.max(ctrlMax, off.mx); growthMax = Math.max(growthMax, on.mx);
  let first = -1;
  for (let i = 0; i < Math.max(on.out.length, off.out.length); i++) if (on.out[i] !== off.out[i]) { first = i; break; }
  if (first >= 0) diverged++;
  const verdict = (r) => r.over ? `wins ${r.wins.join('-')}` : `undecided at t=${r.t}`;
  ok(`spear+${pair[1]} s${seed}: growth changes the battle`, first >= 0,
    first < 0 ? `identical across ${on.out.length} ticks — growth reached step ${on.mx}`
      : `first divergence at t=${(on.out[first] || '').split(',')[0]} of ${on.out.length} rows · growth ${verdict(on)} (top step ${on.mx}) vs control ${verdict(off)}`);
}
ok('the control is genuinely growth-free', ctrlMax === 0, `max lenStep in the control across ${NCELLS.length} cells: ${ctrlMax}`);
ok('the growth side really grows in real battles', growthMax > 0, `top step reached ${growthMax} of ${LEN_STEPS}`);
ok('every forced-spear cell diverges', diverged === NCELLS.length, `${diverged}/${NCELLS.length}`);
ok('the shared row is restored after the control', near(W.trait.len, rate, 0) && near(REACH[WID], topReach, 1e-12),
  `trait.len ${W.trait.len}, REACH ${REACH[WID].toFixed(3)}`);

/* ---------- O: the uniform cap (nocombo-r34) ---------- */
console.log('O  the cap is UNIFORM — no skill reaches into the trait');
ok('no fighter carries lenSteps: the retired hook is GONE from every skill object',
  FIGHTERS.every(f => !('lenSteps' in (f.skill || {}))),
  FIGHTERS.map(f => `${f.name}: ${Object.keys(f.skill || {}).join('+') || '(no numbers)'}`).join(' · '));
ok('the ladder is exactly LEN_STEPS+1 rows — the 18-step era (steps 13-18) is PURGED',
  L.circles.length === LEN_STEPS + 1 && L.polys.length === LEN_STEPS + 1 &&
  L.tipK.length === LEN_STEPS + 1 && (!BAKED || BAKED.length === LEN_STEPS),
  `${L.circles.length} circle sets, ${BAKED ? BAKED.length : 0} baked rows, tipK ${L.tipK.length} entries`);
ok('the top step is the owner-approved +200% look, not the retired +420%',
  near(L.tipK[LEN_STEPS], Math.pow(1 + rate, LEN_STEPS), 1e-12) && L.tipK[LEN_STEPS] < 3.05,
  `step ${LEN_STEPS} = +${((L.tipK[LEN_STEPS] - 1) * 100).toFixed(1)}% (tipK ${L.tipK[LEN_STEPS].toFixed(4)})`);
{
  const Gx = newGame(1, { weapons: ['spear', 'hammer'] });
  const clones = FIGHTERS.map((f, i) => ({ idx: i, weapon: 'spear', spin: 0, dmg: 1, lenStep: 0 }));
  for (let n = 0; n < 60; n++) for (const cl of clones) grow(Gx, cl);
  ok('grow() clamps EVERY fighter at the SAME uniform cap after 60 damaging hits',
    clones.every(cl => cl.lenStep === LEN_STEPS),
    clones.map((cl, i) => `${FIGHTERS[i].name} ${cl.lenStep}/${LEN_STEPS}`).join(' · '));
  const C = [];
  ok('every fighter reads the SAME top-step ladder row (one bot\'s spear is never different)',
    clones.every(cl => bladeCircles(500, 500, 0, 'spear', C, 0, 1, cl.lenStep).length === L.circles[LEN_STEPS].length * 3),
    `${L.circles[LEN_STEPS].length} circles at step ${LEN_STEPS}, identical for all`);
}
ok('every ladder row is still the shipped/baked row BY IDENTITY (the purge removed rows, not remapped them)',
  L.circles.every((row, s2) => s2 === 0 ? row === baseC : !BAKED || row === BAKED[s2 - 1]),
  `steps 0..${LEN_STEPS}: step 0 shipped, the rest baked`);
ok('legend labels are AUTHORED per row, never derived',
  FIGHTERS.every(f => typeof f.short === 'string' && f.short.length > 0) &&
  SKILL_SHORT.every((s2, i) => s2 === FIGHTERS[i].short),
  SKILL_SHORT.map((s2, i) => `${FIGHTERS[i].name}="${s2}"`).join(' · '));
ok('Speedy\'s label no longer advertises the retired length gift',
  SKILL_SHORT[0] === '+SPD / Hit',
  `"${SKILL_SHORT[0]}" (the lenSteps era read "+SPD +LEN / Hit")`);
/* Synthetic grow() loops prove the clamp; saturation in REAL battles proves the uniform top is
   still reached in play (the 12-step era measured Heavy 8/8 saturated). Both slots are swept. */
{
  let top = 0, cells = 0, sat = 0;
  for (const [seed, foe, ci] of [[9, 'hammer', 0], [21, 'sword', 1], [33, 'scythe', 0], [5, 'axe', 1], [77, 'mace', 0]]) {
    const pair = ci === 0 ? ['spear', foe] : [foe, 'spear'];
    const Gx = newGame(seed, { weapons: pair });
    let peak = 0;
    for (let t = 0; t < 18000 && !Gx.over; t++) { tick(Gx); const ls = Gx.fighters[ci].lenStep; if (ls > peak) peak = ls; }
    cells++; top = Math.max(top, peak); if (peak >= LEN_STEPS) sat++;
  }
  ok('real spear battles SATURATE the uniform top and never pass it',
    top === LEN_STEPS && sat >= 1,
    `top step ${top} of ${LEN_STEPS} across ${cells} cells (both slots), saturated in ${sat}/${cells}`);
}
ok('REACH is the step-12 reach for EVERY holder (per-weapon table, uniform cap)',
  near(REACH[WID], topReach, 1e-9),
  `REACH ${REACH[WID].toFixed(3)} = the step-${LEN_STEPS} reach (505.488; the 18-step era's 829.571 is history)`);
ok('REACH is disclosed against the arena',
  REACH[WID] > 0 && REACH[WID] < CFG.size / 2 + 20,
  `REACH ${REACH[WID].toFixed(1)}px from the body centre vs a ${CFG.size / 2}px half-arena — a fully grown spear overhangs ${(REACH[WID] - CFG.size / 2).toFixed(1)}px from mid-arena (was ~330px in the 18-step era)`);

console.log('');
console.log(`${fail === 0 ? 'LENGROW-BUILD-PROOF: ALL PASS' : 'LENGROW-BUILD-PROOF: ' + fail + ' FAILED'} — ${pass} passed, ${fail} failed`);
console.log('Read-only: nothing written, measure.mjs untouched.');
process.exit(fail === 0 ? 0 : 1);
