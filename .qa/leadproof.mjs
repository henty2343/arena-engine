/* .qa/leadproof.mjs — birth proof + standing regression for the edge-leading
 * mirror (owner decision 2026-10-22). NOT measure.mjs. Seconds.
 * Extend PROBES/CELLS for every new `lead` weapon.
 * EXTENDED 2026-10-28 (the facing pass): dagger and staff joined the flagged set at owner word
 * ("it should have same behaviour as scythe and katana" + the scope pick "dagger + staff
 * together"), so both are probed below and both get Part A2 and Part B cells — this harness
 * hardcodes its roster by design, and an unextended run is VACUOUS for a new flag (it passed
 * ALL PASS on the landing's first run while covering only katana/scythe/javelin).
 *
 * Part A  — the rule's promise: with flip = leadFlip(w, spin), the weapon's
 *   BUSINESS CONTOUR faces the direction of motion at EVERY angle and both
 *   spin signs — the cutting edge for a chisel blade, the BEAK for a hook
 *   (owner playtest 2026-10-22: a mouth-forward hook reads as "spinning the
 *   wrong way from the beginning"; the beak must lead, the mouth scoops
 *   behind).
 *   Criterion: the cross-blade vector e = P_business − Q_reference (spine-
 *   local, probe pair quoted from each weapon's art — see PROBES) maps to
 *   world lateral e.l·fp; the motion's lateral side is
 *   sign(spin) (+l leads when spin > 0 — the kinematic fact proven at 64
 *   angles pre-build). Contour faces motion ⟺ sign(e.l·fp) === sign(spin).
 * Part A2 — art == hitbox under the mirror: every point drawWeapon logs
 *   through the recording ctx satisfies the SAME world mapping the circles
 *   use (X = ox + c·d − s·(l·m), Y = oy + s·d + c·(l·m), m = fp) — checked
 *   against the weapon's own local vertices at fp = 1 and fp = −1.
 * Part B  — flagged battles stay auditable from stored events: every hit's
 *   contact recomputes to ≤0.3px, every parry's ENTRY poses to gap ≤ EPS,
 *   every swat to ≤ EPS — using ONLY the event fields (aSp/bSp/fSp),
 *   the way measure.mjs's laws do. No new unauditable class.
 *   RE-SEEDED 2026-11-11 (session 6, menu item 6): a swat is audited by the class its STORED
 *   gap names — the TOUCH class (gap strictly negative) by the circle recompute, the CUT class
 *   (gap exactly 0, the skewer's cut-free window) by the ANGLE law. Both are audited; neither is
 *   dropped. The one-class law that predated skewer-r46 FAILed on correct code.
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
const api = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
  body + '\n;return { newGame, tick, CFG, WEAPONS, WEAPON_IDS, geom, drawWeaponOn, SKEWER };')(
  { getElementById: () => fakeEl(), createElement: () => fakeEl(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
  { now: () => 0 }, () => 0, console);
/* RE-SEEDED 2026-11-11 (session 6, menu item 6): SKEWER joins the extracted surface — the
 * cut-free window's law constant (SKEWER.cutCos, canonical :1614) is what the cut-class swat cell
 * has to audit against. It was NOT in the returned set, so the cell could not read its own law. */
const { newGame, tick, CFG, WEAPONS, geom, SKEWER } = api;

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  FAIL ' + msg); } };

/* ---- Part A: edge faces motion, every angle × both signs ---- */
/* Probe pairs (spine-local PRE-scale art units, quoted from the INGR art).
 * The criterion is the BUSINESS CONTOUR — the part that must face the motion:
 * for a chisel blade it is the cutting edge; for a HOOK it is the BEAK (owner
 * playtest 2026-10-22: a mouth-forward hook reads as "spinning the wrong way"
 * — the beak must lead, the mouth scoops behind). The original scythe probe
 * (strip side at a constant-d cut) was degenerate: a hook's edge faces −d,
 * not ±l, so it "proved" a criterion that was not the visible reading.
 * katana: P = KP strip on the blade's -l boundary at d 75 ([75, 0.01]);
 *         Q = the blade's +l boundary at d 75 ([75, 7.74])  → e.l < 0.
 * scythe: P = the hook's beak vertex ([80, -75]);
 *         Q = the spine axis at the same d ([80, 0])        → e.l < 0.
 * javelin (headLead — the ALONG-CHORD sibling, owner 2026-10-22: "the
 *         javelin should also flip around like scythe and katana"): P = the
 *         head tip ([113.44, 0] = len), h = the centred rim grip (len/2 =
 *         56.72); the criterion is the chord-axis offset (P.d − h)·fp vs
 *         sign(spin) — the kinematic fact here is v·d̂ = bodyR·spin (the head
 *         travels the way it points when spin > 0), proven 64/64 both signs.
 * dagger (2026-10-28 facing pass; owner playtest: "the dagger is not
 *         symmetrical, it has this white line which hints which way it is
 *         facing"): P = the KP bevel strip's −l-most vertex ([35.69, −5.54],
 *         the strip runs authored d 30.54..69.08 at l −5.54..−1.38 — one side
 *         only, and KP IS the convention's cutting/striking-face paint);
 *         Q = the steel's +l boundary at the SAME d ([35.69, 6.77]) — the
 *         katana's constant-d cut, single bevel → e.l = −12.31 < 0.
 * staff (same landing, owner scope pick "dagger + staff together"): P = the
 *         KP tip band's −l-most vertex ([87.00, −6.60], band authored d
 *         84.00..87.60 at l −6.60..−4.00); Q = the forked head's +l prong tip
 *         at the same station ([86.50, 14.00]) → e.l = −20.60 < 0. DISCLOSED:
 *         the staff's remaining l-asymmetry is spiral grip wrap, not a face —
 *         the probe quotes the only striking-face paint the row has, and the
 *         wrap mirrors along with it. */
const PROBES = {
  katana: { P: [75, 0.01], Q: [75, 7.74], axis: 'l' },
  scythe: { P: [80, -75], Q: [80, 0], axis: 'l' },
  javelin: { P: [113.44, 0], h: 56.72, axis: 'd' },
  dagger: { P: [35.69, -5.54], Q: [35.69, 6.77], axis: 'l' },
  staff: { P: [87.00, -6.60], Q: [86.50, 14.00], axis: 'l' },
};
for (const [wId, pr] of Object.entries(PROBES)) {
  const L = WEAPONS[wId].lead !== undefined ? WEAPONS[wId].lead : WEAPONS[wId].headLead;
  ok(L === 1 || L === -1, `${wId}: lead/headLead declared`);
  const eL = pr.axis === 'd' ? pr.P[0] - pr.h : pr.P[1] - pr.Q[1];   // the business-contour offset on the weapon's declared mirror axis
  let n = 0;
  for (const spin of [3.5, -3.5, 11.3, -27.1]) {
    const fp = geom.leadFlip(wId, spin);
    for (let ai = 0; ai < 64; ai++) {
      // motion side = sign(spin) on BOTH axes: +l leads when spin > 0 (lateral
      // kinematics, 64 angles pre-build) and the chord head travels +d̂ when
      // spin > 0 (v·d̂ = bodyR·spin, proven 64/64 both signs for the javelin)
      const eWorldLat = eL * fp;                       // e maps through the SAME axis factor the placement uses
      const motionSide = spin > 0 ? 1 : -1;
      if (Math.sign(eWorldLat) === motionSide) n++;
    }
  }
  const total = 4 * 64;
  ok(n === total, `${wId}: business contour faces motion at ${n}/${total} angle×sign samples`);
  console.log(`  ${wId.padEnd(8)} ${pr.axis === 'd' ? 'headLead' : 'lead    '} ${L > 0 ? '+' : '−'} → contour faces motion: ${n}/${total}`);
}

/* ---- Part A2: the drawn art mirrors through the SAME mapping as the hitbox ---- */
{
  const logged = [];
  const g = new Proxy({}, {
    get(x, p) {
      if (p === 'moveTo') return (X, Y) => logged.push([X, Y]);
      if (p === 'lineTo') return (X, Y) => logged.push([X, Y]);
      if (p === 'beginPath' || p === 'closePath' || p === 'stroke' || p === 'fill' || p === 'save' || p === 'restore') return () => {};
      return typeof x[p] === 'undefined' ? (x[p] = fakeEl2()) : x[p];
    },
    set(x, p, v) { x[p] = v; return true; },
  });
  function fakeEl2() { return function () {}; }
  for (const wId of ['katana', 'scythe', 'javelin', 'dagger', 'staff']) {   // dagger+staff added 2026-10-28 (the facing pass)
    for (const fp of [1, -1]) {
      logged.length = 0;
      const ang = 0.7, X = 500, Y = 300;
      api.drawWeaponOn(g, wId, X, Y, ang, undefined, null, fp);
      const fr = geom.spineFrame(X, Y, ang, wId);
      const c = Math.cos(Math.atan2(fr.dy, fr.dx)), s = Math.sin(Math.atan2(fr.dy, fr.dx));
      // replay: every logged point must equal the mapping of SOME local vertex with the weapon's mirror axis applied — the EXACT formula polyPath/bladeCircles use (same float ops, so equality is bit-exact)
      const verts = [];
      for (const pl of WEAPONS[wId].poly.polys) for (const pts of pl.subs) for (const pt of pts) verts.push(pt);
      let matched = 0;
      const m = fp === -1 ? -1 : 1;
      const hd = WEAPONS[wId].headLead !== undefined, h = WEAPONS[wId].len / 2;
      for (const [LX, LY] of logged) {
        for (const [d0, l0] of verts) {
          let d = d0, l = l0;
          if (m !== 1) { if (hd) d = h + (d - h) * m; else l = l * m; }
          const WX = fr.ox + c * d - s * l, WY = fr.oy + s * d + c * l;
          if (Math.abs(WX - LX) < 1e-9 && Math.abs(WY - LY) < 1e-9) { matched++; break; }
        }
      }
      ok(logged.length > 20 && matched === logged.length, `${wId} fp=${fp}: all ${logged.length} drawn points satisfy the mirrored hitbox mapping (matched ${matched})`);
      console.log(`  ${wId.padEnd(8)} fp ${fp > 0 ? '+1' : '−1'}: ${matched}/${logged.length} drawn points on the mirrored mapping`);
    }
  }
}

/* ---- Part B: flagged battles stay auditable from stored events ---- */
{
  const EPS = 1e-6, KISS = 0.3;
  const CELLS = [
    ['katana+katana', 1, ['katana', 'katana']],
    ['scythe+katana', 2, ['scythe', 'katana']],
    ['scythe+hammer', 3, ['scythe', 'hammer']],
    ['katana+bow', 4, ['katana', 'bow']],
    ['scythe+scythe', 6, ['scythe', 'scythe']],
    ['javelin+javelin', 7, ['javelin', 'javelin']],   // headLead: parries carry aSp/bSp through the d-mirror
    ['javelin+bow', 5, ['javelin', 'bow']],           // headLead swats: the javelin's spine swats arrows (fSp)
    ['dagger+dagger', 8, ['dagger', 'dagger']],       // 2026-10-28 facing pass: both sides flagged — hits and parries carry aSp/bSp through the l-mirror
    ['dagger+bow', 9, ['dagger', 'bow']],             // the dagger's spine swats arrows -> flagged fSp on a melee row
    ['staff+staff', 10, ['staff', 'staff']],          // flagged LAUNCHER mirror: spines parry and swat orbs (no spine damage — the shot gate), so this cell is parry/swat-only by construction
    ['staff+bow', 11, ['staff', 'bow']],              // flagged swats both directions: the staff's spine vs arrows, against an unflagged launcher
  ];
  let hits = 0, parries = 0, swats = 0, flaggedHits = 0, flaggedParrySides = 0, flaggedSwats = 0;
  let cutSwats = 0, touchSwats = 0;   // RE-SEEDED 2026-11-11 (session 6, LP3): the two swat classes, counted separately — a branch that measured nothing cannot claim a pass
  for (const [name, seed, w] of CELLS) {
    const G = newGame(seed, { weapons: w });
    let t = 0;
    while (!G.over && t < 18000) {
      tick(G); t++;
      for (const e of G.events) {
        if (e.kind === 'hit' && !e.shot) {
          hits++;
          const flagged = WEAPONS[e.aW].lead;
          if (flagged) flaggedHits++;
          if (e.aSp === undefined) ok(!flagged, `${name}: flagged hit stored aSp`);
          const circ = geom.bladeCircles(e.ax, e.ay, e.aAng, e.aW, [], undefined, geom.leadFlip(e.aW, e.aSp));
          const gap = geom.bladeBodyGap(circ, e.x, e.y) - CFG.bodyR;
          ok(gap <= KISS, `${name} s${seed} t${e.tick}: hit gContact ${gap.toFixed(2)} <= ${KISS}`);
        } else if (e.kind === 'parry') {
          parries++;
          if (WEAPONS[e.aW].lead) flaggedParrySides++;
          if (WEAPONS[e.bW].lead) flaggedParrySides++;
          const pg = geom.parryGap(
            { x: e.ax, y: e.ay, ang: e.aAng, w: e.aW, fp: geom.leadFlip(e.aW, e.aSp) },
            { x: e.bx, y: e.by, ang: e.bAng, w: e.bW, fp: geom.leadFlip(e.bW, e.bSp) }
          );
          ok(pg.gap <= 1e-4, `${name} s${seed} t${e.tick}: parry entry gap ${pg.gap.toExponential(2)} <= 0`);
        } else if (e.kind === 'swat') {
          swats++;
          if (WEAPONS[e.fW].lead) flaggedSwats++;
          /* RE-SEEDED 2026-11-11 (session 6, menu item 6): TWO swat classes, discriminated by the
           * STORED gap. SUPERSEDED (kept visible): the cell used to assert that EVERY swat is a
           * circle touch —
           *   ok(best - e.sr <= 1e-4, '... swat touch gap ...')
           * That law predates the skewer's CUT-FREE WINDOW (skewer-r46 / impale-r48, canonical
           * :3654): the victim's blade cuts the anchored spear on an ANGLE test, with NO circle
           * contact at all, so the touch recompute cannot apply to that class. It FAILed on CORRECT
           * code — 15 javelin swats, and 0 true contact failures anywhere in the suite (verified by
           * scratch/triage/diag-lead-swat.mjs — pruned from HEAD 2026-11-11, docs-cleanup; recover with `git show docs-precleanup:scratch/triage/diag-lead-swat.mjs`).
           * The stored gap tells the classes apart:
           *   - TOUCH class (canonical :3663): killShot stores `best - st.r` with best < st.r, so
           *     the stored gap is STRICTLY NEGATIVE. The circle recompute applies, unchanged.
           *   - CUT class (canonical :3654): the cut-free window. killShot stores exactly 0.
           * Both classes stay audited from stored fields alone — the cut class by the ANGLE law
           * (cos(fAng)·wx + sin(fAng)·wy over wd > SKEWER.cutCos), the touch class by the circle
           * recompute — so NO swat becomes unauditable. */
          if (e.gap === 0) {
            cutSwats++;
            const wx = e.x - e.fx, wy = e.y - e.fy, wd = Math.hypot(wx, wy) || 1;
            const cosv = (Math.cos(e.fAng) * wx + Math.sin(e.fAng) * wy) / wd;
            ok(cosv > SKEWER.cutCos, `${name} s${seed} t${e.tick}: cut-window swat — the blade's outward radial cos ${cosv.toFixed(3)} > cutCos ${SKEWER.cutCos}`);
          } else {
            touchSwats++;
            const circ = geom.bladeCircles(e.fx, e.fy, e.fAng, e.fW, [], undefined, geom.leadFlip(e.fW, e.fSp));
            let best = Infinity;
            for (let ci = 0; ci < circ.length; ci += 3) {
              const d = Math.hypot(e.x - circ[ci], e.y - circ[ci + 1]) - circ[ci + 2];
              if (d < best) best = d;
            }
            ok(best - e.sr <= 1e-4, `${name} s${seed} t${e.tick}: swat touch gap ${(best - e.sr).toExponential(2)} <= 0`);
          }
        }
      }
      G.events.length = 0;
    }
  }
  ok(flaggedHits > 50, `non-vacuity: flagged-weapon hits exercised (${flaggedHits})`);
  ok(flaggedParrySides > 20, `non-vacuity: flagged parry sides (${flaggedParrySides})`);
  /* RE-SEEDED 2026-11-11 (session 6, LP3): BOTH swat classes must be exercised — the cut class is
   * the whole point of the re-seed, and the touch class must not have been silently dropped. */
  ok(cutSwats > 0, `non-vacuity: cut-window swats exercised (${cutSwats})`);
  ok(touchSwats > 0, `non-vacuity: touch-class swats exercised (${touchSwats})`);
  console.log(`  Part B: hits ${hits} (flagged ${flaggedHits}), parries ${parries} (flagged sides ${flaggedParrySides}), swats ${swats} (flagged ${flaggedSwats}) — touch-class ${touchSwats}, cut-window ${cutSwats}; every one recomputed from stored fields`);
}

console.log(fails ? `LEADPROOF: ${fails} FAILURES` : 'LEADPROOF: ALL PASS — the edge faces the motion, art mirrors with the hitbox, flagged battles auditable from stored events');
process.exit(fails ? 1 : 0);
