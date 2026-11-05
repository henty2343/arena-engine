/* measure.mjs — headless measurement harness for spinclash-preview.html
 *
 * Per GAMES.md "Testing recipe": extract the first <script> block, stub
 * document / window / performance / requestAnimationFrame + the canvas
 * context (a Proxy returning no-op-ables), strip the IIFE wrapper, run the
 * body through new Function() with a trailing export so the pure sim
 * (newGame / tick / CFG / FIGHTERS / WEAPONS / geom) is reachable, then loop
 * tick().
 *
 * Usage: node measure.mjs [file=previews/spinclash-preview.html] [seeds=40] [--verbose]
 *        [--quick | --full | --vs <weapon> | --cells a+b,c+d | --solidity]
 *        [--matrix-only] [--band-dump] [--jobs N]
 * Arena shape is locked to round (owner decision 2026-10-15) — no shape arg.
 *
 * EXECUTION (v1.2): battles run in PARALLEL across worker threads (default:
 * every core). Battles are independent and seeded; results merge in canonical
 * list order, so the report is identical at any job count (--jobs 1 is the old
 * sequential path). Run tiers:
 *   (no flag) / --full : natural rolls + the full forced matrix (484 cells x
 *                        8 seeds) + determinism — the balance-session instrument
 *   --quick            : natural rolls + determinism only — the fast law
 *                        re-proof after a rule change
 *   --vs <weapon>      : natural + only the cells involving one weapon
 *                        (2N-1 cells x 8) — after a single-weapon merge
 *   --cells a+b,c+d    : natural + the listed ordered cells only
 *   --solidity         : the owner's tunneling/overlap suite (owner request
 *                        2026-10-19, target: under 10 minutes) — naturals +
 *                        a curated 23-cell overlap gauntlet x 3 seeds (~109
 *                        battles): wide-head pin fights, worst-case substep
 *                        budgets, mixed-speed shots, ricochet/curve paths.
 *                        Every law is still audited; 3/3s/4s/5s are the point.
 *   --matrix-only      : skip naturals + determinism — splits one full
 *                        baseline across several foreground runs (sandbox
 *                        30-min tool cap); the parts' battle sets are
 *                        disjoint, so their law counters sum exactly
 *   --band-dump        : REPORT-ONLY. Attaches the resolver geometry of each
 *                        battle's deepest band-class overlap (law 3's disclosed
 *                        band) to the report: both poses, the deepest circle
 *                        pair and its normal, body/wall pin state, and ONE
 *                        read-only replica of the canonical's projection pass
 *                        (sim :1676-1701) showing how much of the multi-contact
 *                        push cancels. Touches no accumulator, so every measured
 *                        value is bit-identical with the flag on or off.
 * A change touching contact/resolver/laws always deserves a --full run.
 *
 * Metrics (standing list + game-specific):
 *   termination, winner spread, rounds distribution (2 vs 3), battle & round
 *   length (vs the 1min+ video target), ordered-combo win matrix (the balance
 *   alarm, parked by owner but recorded), ridiculousness (max spin / max dmg
 *   reached), combat stall (max gap between hit/parry/swat/bounce events —
 *   the no-round-timer alarm), event rate (the something-happens gate).
 *
 * CORE CONTACT LAW audit (folded in from the retired scratch contactaudit.mjs
 * when the mechanics package landed, 2026-10-16): every battle also runs with
 * G.audit on, and all six law rules (GAMES.md) are re-verified from the exact
 * stored poses the sim itself tested:
 *   1 no phantom hits      — every 'hit' recomputes to gap < bodyR
 *   2 exact-touch parries  — every 'parry' recomputes to gap <= 0 at its
 *                            stored ENTRY poses (no non-touching slack)
 *   3 solidity             — blade-blade gap < 0 at tick-entry poses (the
 *                            sim's ground truth; since v0.8.2 the renderer
 *                            interpolates BETWEEN tick poses — see GAMES.md
 *                            pose amendment). Acceptance (one class since
 *                            v0.9 — every weapon is a path silhouette):
 *                            worst depth < 6px on <= 2% of fight-ticks, the
 *                            disclosed infeasible-pin band. Substep
 *                            pre-resolution overlaps are reported as info:
 *                            the resolver eats them inside the same substep,
 *                            never rendered.
 *   4 one damage per touch — replica of the bladeStuck flag over every
 *                            substep pose; rising edges must equal hit events;
 *                            the replica mirrors the deep-disengage re-arm
 *                            gate (2026-10-23): pad clearance AND (peak
 *                            clearance >= reArmDeep OR >= reArmWait ticks)
 *   5 spin-recoil law      — every parry flips BOTH spins (event signs vs the
 *                            snapshot, magnitudes exact modulo same-substep
 *                            growth), no spin sign ever changes without a
 *                            parry, no zero spins ever
 *   6 counter-rotation     — every round opens with opposite spin signs at
 *                            exact base-omega magnitudes
 *   + determinism          — seed 1 replayed twice must hash identical
 *
 * PROJECTILE LAW audit (v0.7 as the sling's shot; generalised v0.9-v1.0 into
 * the shot system — arrows/orbs/sparks/bolts/boomerangs/stars; GAMES.md
 * "Projectile weapons"):
 *   1s shot damage only on shot-touches-body — every shot 'hit' recomputes
 *      to contact from its stored death pose vs the victim
 *   2s swats only on exact shot-blade touch — every 'swat' recomputes to
 *      gap <= 0 from the stored swatter pose; swats flip no spin, which core
 *      law 5's sign audit already proves (sign changes only at parries)
 *   3s shots lose every collision — at tick-entry (rendered) poses no shot
 *      overlaps the foe blade, foe body, rim, or another shot; the sim's
 *      chosen substep count is audited against the blade AND projectile
 *      budget requirements every tick (auditK — the projectile term covers
 *      the worst shot-vs-shot PAIR since the 2026-10-19 mixed-speed fix)
 *   4s every shot has exactly ONE accounted departure (landed / swatted /
 *      rim / cross / caught / cleared at the round roll) or is still in
 *      flight at the battle end — a shot vanishing without an event is the
 *      tunneling alarm. halo-r39: the boomerang's ONLY departures are
 *      catch / swat / cross / roll-clear — its body hits are pass-throughs
 *      (counted as shotPass, NOT departures) and the rim it pierces
 *   6s LAUNCH DOCTRINE (owner decision 2026-10-19: "when the weapon is
 *      radial, shoot from the tip, when it is the opposite, shoot from the
 *      middle, like bow and crossbow") — every 'shotFire' recomputes from
 *      its stored firing pose to the hold-derived launch point: radial hold
 *      -> spine tip (t = 1); tangential hold -> spine middle (t = 0.5) plus
 *      shot.off along the body radial for 'radial'-fire weapons (the
 *      bow/crossbow nock offset). Supersedes the v0.7.2 mid-spine-for-all
 *      rule (the sling is gone; the quote lives in the archive).
 *   7s RETIRED at allcut-r62 (owner ruling 2026-11-02: "all weapons from now
 *      on deals damage if they touch the opponets body… launchers are boring
 *      to watch in the beginning as they have a hard time hitting the
 *      opponents and gaining growth"). The projectile rule (owner decision
 *      2026-10-19: "ranged weapons (shooting projectiles), their weapons do
 *      not damage, only their projetiles"; itself the widened v0.7.2
 *      tangential-only rule) and the shield's no-damage clause are GONE:
 *      every latched rising edge is a damaging hit with a hit event to pair,
 *      launchers and the shield included. The core law-4 replica mirrors the
 *      gate-free bladeVsBody; rangedMeleeHits/rangedShoves survive as
 *      VISIBILITY fields (the knock-only class now counts a structural 0).
 *   Stall semantics (v0.7): the combat-stall timer counts swats as combat
 *   (hit/parry/swat/bounce). The combo matrix is FORCED per cell — every
 *   ordered pair of the roster: 484 cells with the 22-weapon roster (orb — roster COMPLETE, 2026-10-23;
 *   was 441 with 21, 400 with 20, 361 with 19, 169 with 13, 16 with 4) x a shared seed set — because natural
 *   rolls thin to a handful of rounds per cell at this roster size.
 *
 * KNOWN EXPECTED REDS until the balance pass (open question 1, owner-deferred
 * 2026-10-19): shield+shield never terminates (the shield cannot damage);
 * pure-projectile mirror cells (bow+crossbow, wand+bow, ...) routinely run
 * past the 300s line (2026-10-19 probe: 3/18 no winner in 300s). The
 * termination and battle-length checks will flag them — recorded, not judged.
 *
 * Run after every rule change — but ONLY on the owner's explicit go (standing
 * rule, owner 2026-10-19: "dont run measure.mjs ... ever. ask if you want
 * to"). A full run is ≈3,900 battles (40 natural + 484x8 forced + 2
 * determinism) — ~2 hours sequential; the parallel runner divides the wall
 * clock by the worker count (tier timings — --quick ≈3 min, --solidity ≈9 min
 * at 2 jobs — are recorded in GAMES.md; the full-matrix number awaits its
 * first run).
 * TIER-TIME TARGET (retargeted 2026-10-23, owner pick): the ~10-min line is the
 * OWNER'S-MACHINE target, not the sandbox's — it is met today (--solidity ≈3-4
 * min at 6-8 cores). The sandbox's ≈11 min at 2 jobs is a core-count artifact,
 * not an inefficiency: battles already run one loadSim per worker against an
 * atomic work-stealing cursor, jobs defaults to availableParallelism(), and the
 * cost is dominated by the handful of battles that exhaust BUDGET_SEC 420 (a
 * capped battle is ≈7x a typical one). Coverage was NOT cut to chase a sandbox
 * number; the tradeoff levers are recorded in GAMES.md (Testing recipe).
 * The owner never runs this; the assistant does, when told to.
 * Fast targeted checks go through .qa/projectile-fix.mjs instead.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { availableParallelism } from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const here = dirname(fileURLToPath(import.meta.url));
let FILE = resolve(join(here, 'previews', 'spinclash-preview.html'));   // parseArgs overrides; main-side only (workers get the path via workerData)
let SEEDS = 40;
let verbose = false;
let BAND_DUMP = false;                       // --band-dump: capture resolver geometry at each battle's deepest band-class overlap
const BUDGET_SEC = 420;                      // per-battle harness budget

/* ---------------- DOM stubs ---------------- */
function fakeEl() {
  const target = function () {};
  return new Proxy(target, {
    get(t, p) {
      if (p === Symbol.toPrimitive) return () => 0;
      if (!(p in t)) t[p] = fakeEl();
      return t[p];
    },
    set(t, p, v) { t[p] = v; return true; },
    apply() { return fakeEl(); },
  });
}
const documentStub = {
  getElementById: () => fakeEl(),
  createElement: () => fakeEl(),
  querySelectorAll: () => [],
  addEventListener: () => {},
  activeElement: null,
};
const windowStub = {
  devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900,
  addEventListener: () => {},
};

function loadSim(file) {
  const html = readFileSync(file, 'utf8');
  const a = html.indexOf('<script>');
  if (a < 0) throw new Error('no <script> block found');
  const b = html.indexOf('</script>', a);
  if (b < 0) throw new Error('unterminated <script> block');
  let body = html.slice(a + 8, b);
  const opener = '(function () {';
  if (!body.trimStart().startsWith(opener)) throw new Error('unexpected script shape: no IIFE opener');
  body = body.slice(body.indexOf(opener) + opener.length);
  const end = body.lastIndexOf('})();');
  if (end < 0) throw new Error('unexpected script shape: no IIFE closer');
  body = body.slice(0, end);
  const factory = new Function(
    'document', 'window', 'performance', 'requestAnimationFrame', 'console',
    body + '\n;return { newGame, tick, CFG, FIGHTERS, WEAPONS, WEAPON_IDS, geom };'
  );
  return factory(documentStub, windowStub, { now: () => 0 }, () => 0, console);
}

/* ---------------- contact-law accumulators (battle-count weighted) ---- */
const STR = 13;                              // snapAudit stride
const A_X = 1, A_Y = 2, A_ANG = 3, A_STUCK = 4, A_SPIN = 5, A_ALIVE = 6;
const B_X = 7, B_Y = 8, B_ANG = 9, B_STUCK = 10, B_SPIN = 11, B_ALIVE = 12;
const STRF = 13;                             // G.auditFl stride: [sub, A's 6 chain-pose slots, B's 6] — one row per SUBSTEP only
const _flScr = [[1, 0, 1, 0, 1, 0], [1, 0, 1, 0, 1, 0]];
/* The chain pose the sim's contact tests saw at substep `sub` (fighter fi), in
 * reusable scratch — null when the row is absent. Chain weapons place their
 * covering circles on the articulated segment frames; without this pose
 * bladeCircles silently falls back to the rigid spine, which is up to ~177px
 * off (measured, .qa/chainlaw.mjs 2026-10-28) and was the whole 2026-10-27 red
 * set. Rigid weapons ignore the argument, so passing it is always safe. */
function flAt(FL, sub, fi) {
  const o = sub * STRF;
  if (sub < 0 || o + STRF > FL.length || FL[o] !== sub) return null;
  const d = _flScr[fi], b = o + 1 + fi * 6;
  for (let q = 0; q < 6; q++) d[q] = FL[b + q];
  return d;
}
const EPS = 1e-9;

let battles = 0, rounds = 0, hitsTotal = 0, parriesTotal = 0, subSnaps = 0;
let phantomHits = 0, worstHitGap = -Infinity;
let parryNoTouch = 0, parryGapMax = -Infinity, parryGapMin = Infinity;
let cMismatch = 0, stuckFlagMismatch = 0;
let polyOverlap = 0, polyTicks = 0, polyWorst = 0;   // law 3: rendered fight-ticks / overlaps / worst depth — one class, every weapon is a path silhouette since v0.9
let polyOverlapVis = 0;   // law 3 (2026-10-21 whip amendment): overlaps DEEPER than the 3px ink outline (>2.5px) — the visible class; sub-ink depths are the disclosed whip transient
let subOverlap = 0, subOverlapWorst = 0;
/* chain-pose coverage (2026-10-28 chain fix). The law recomputes read the
 * sim's chain poses from three stores: the events (aFl/bFl/fFl), G.auditFl
 * (one row per substep), and — for the sub=-1 ENTRY record, which has no
 * auditFl row — the live fl.u stashed immediately before tick() (fl.u is
 * written only by flailStep inside the substep loop and by flailInit at
 * spawn/round reset, so the stash IS the entry pose; proven tick-by-tick by
 * .qa/chainlaw.mjs Part E against the entry record's own body fields).
 * The three coverage counters keep a green law provably non-vacuous; flMissing
 * must stay 0 — a missing pose would silently degrade that recompute to the
 * rigid spine, i.e. reintroduce the blindness this fix removes. */
let chainPoseTicks = 0, chainPoseSubs = 0, chainShotEntries = 0, flMissing = 0;
/* law 3's edge-leading MIRROR class (2026-10-28, from the chainlaw attribution of
 * the fix's own residual). A parry flips BOTH spins at the END of bladeVsBlade, and
 * leadFlip mirrors a flagged weapon's covering instantly while the bodies stay put —
 * so a parry landing in the tick's LAST substep hands the rendered frame a mirrored
 * interpenetration that no resolver pass ever saw (measured: 10.092px on
 * katana+shuriken, natural s5 tick 2690, where the pre-flip pose is a −0.149px clean
 * touch). This is sim TRUTH, and the audits are specified to read truth: CFG.flipMs
 * (canonical :129) records the owner-accepted trade — the art sweeps old→edge-on→
 * mirrored over 180ms "while the sim's hitbox is already at its new (true) pose ...
 * the sim/laws/audits never see it". .qa/chainlaw.mjs Part F measured what the
 * renderer actually draws across that sweep: worst drawn gap −0.149px, i.e. sub-ink,
 * so the class is never a visible defect. It is therefore named and disclosed rather
 * than folded into the band — the band's own 6px/2% calibration (seeds 7/8, the
 * infeasible-pin class) is untouched, and anything the mechanism does NOT explain
 * stays in the band and still fails it. Membership is proven per occurrence, never
 * inferred: (1) a parry fired at the previous tick's last substep — the same
 * condition the spin law already carves out via prevParrySubs — with a flagged
 * weapon in play, and (2) the identical body pose under the PRE-flip mirror clears
 * the 3px ink. */
let polyFlipOverlap = 0, polyFlipVis = 0, polyFlipWorst = 0, polyBandWorst = 0;
/* 2026-10-28 attribution: the band-class population, and WHY the mirror test declined to claim
 * each member. `bandParryNotLastSub` = a parry happened in the previous tick but not in its last
 * substep (the mirror test's narrow condition); `bandNoLead` = neither weapon can flip at all.
 * Counters only — no measured value changes. */
let bandN = 0, bandParryNotLastSub = 0, bandNoLead = 0;
let spinSameDir = 0, spinOppDir = 0, openMagMismatch = 0;
let flipViol = 0, signLawViol = 0, zeroSpins = 0, magViol = 0;
const circA = [], circB = [];
// v0.7 projectile-law accumulators
let shotThrown = 0, shotLanded = 0, shotSwats = 0, shotRims = 0, shotCross = 0, shotCleared = 0;
let shotCatch = 0, shotPass = 0;   // halo-r39: the boomerang's catch departure, and its pass-through body hits (damage without departure)
let shotBounce = 0;                // ricolaw-r41: star ricochets (the law is eternal since the budget retired — a ricochet is NEVER a departure); counted for report visibility only
let shotPin = 0;                   // pinlaw-r44: bolts nailed into the rim (a pin is NEVER a departure — the nail waits as a shot at rest until body/swat/in-flight cross/roll); counted for report visibility only
let shotPhantom = 0, shotWorstGap = -Infinity;
let swatNoTouch = 0, swatWorstGap = -Infinity, swatBestGap = Infinity;
let shotRenderBlade = 0, shotRenderBody = 0, shotRenderRim = 0, shotRenderPair = 0, shotRenderWorst = 0, shotEntryFrames = 0;
let shotLost = 0, shotOrphan = 0, shotDeathDup = 0;
let budgetViol = 0, maxSubEngaged = 0;
// v0.7.2 ranged class-rule accumulators
let launchOffMid = 0, launchWorst = 0;
let rangedMeleeHits = 0, rangedShoves = 0;
const FORCED_SEEDS = 8;                      // forced runs per combo cell (484 cells with the 22-weapon roster)

/* --solidity tier (owner request 2026-10-19: "only focus on tunnelling/
 * overlap ... no longer than 10 [minutes] to run"): the natural rolls plus
 * this curated gauntlet, SOLIDITY_SEEDS each. Cells are chosen for OVERLAP
 * risk, not balance:
 *   - wide-head x wide-head pins and scissors — the historic worst depths
 *     (the 9.9px X-cross, the 25.7px corner pins) were found in hammer/axe/
 *     mace fights and their mirrors;
 *   - the tiny-MINR ingested weapons (axe/hammer/dagger min circle 1.2,
 *     bow 2.0) = the worst-case substep budget k, i.e. the detection
 *     guarantee under maximum stress;
 *   - mixed projectile speeds = the worst-pair budget (law 5s): spark 800 +
 *     arrow 620, orb 430 + bolt 860;
 *   - bounce/curve shot paths (the shuriken ricochet, the boomerang turn);
 *   - melee-vs-shot swat windows on tiny circles (hammer+bow).
 * Roster-dependent: main() refuses with the offender named if a name goes
 * stale — update the list when the roster changes. */
const SOLIDITY_CELLS = ['hammer+axe', 'axe+hammer', 'hammer+hammer', 'axe+axe', 'mace+mace', 'mace+axe',
  'dagger+hammer', 'wand+bow', 'staff+crossbow', 'shuriken+boomerang', 'boomerang+boomerang', 'hammer+bow',
  /* 2026-10-22, batch-4 roster change (nunchaku/scythe/katana/knives) + the flail merge's missed update:
   * flail+hammer (chain vs rigid, the promotion cell) · nunchaku+nunchaku (chain mirror — tie/bent-pose
   * dynamics under pins) · scythe+scythe (wide-hook mirror; the scythe carries the roster min MINR 1.9)
   * · nunchaku+scythe (chain × wide head) · wand+crossbow (the true worst-speed shot pair: spark 800 +
   * bolt 860 — the 5s budget's hardest case) · knives+shuriken (ricochet + swat, two shot kinds).
   * 18 cells × 3 seeds + 40 naturals = 94 battles (was 76): ≈9 min at 2 sandbox jobs, ~3 min on 6–8 cores. */
  'flail+hammer', 'nunchaku+nunchaku', 'scythe+scythe', 'nunchaku+scythe', 'wand+crossbow', 'knives+shuriken',
  /* 2026-10-22, javelin merge (roster 19): javelin+javelin — the longest tangential chords in a mirror, and the projectile-mirror termination red's newest member. 19 cells x 3 + 40 naturals = 97 battles. */
  'javelin+javelin',
  /* 2026-10-22, tome merge (roster 20): tome+tome — the page launcher's mirror joins the projectile-length red family it stresses. 20 cells x 3 + 40 naturals = 100 battles. */
  'tome+tome',
  /* 2026-10-23, scroll merge (roster 21): scroll+scroll — the 10th launcher's mirror, the red family's newest member. 21 cells x 3 + 40 naturals = 103 battles. */
  'scroll+scroll',
  /* 2026-10-23, orb merge (roster 22 — COMPLETE): orb+orb (mirror pins between two long-reach spheres) + orb+hammer (big-head x big-head, the hammer+axe family's successor). 23 cells x 3 + 40 naturals = 109 battles ≈11 min at 2 sandbox jobs, ≈3-4 min on 6-8 cores — the 10-min line is the owner's-machine target and is met (retargeted 2026-10-23, owner pick; see the header). */
  'orb+orb', 'orb+hammer'];
const SOLIDITY_SEEDS = 3;

/* ---------------- parallel merge machinery ----------------
 * The law counters are module-level `let`s mutated by runMatch. A worker runs
 * its battles against its OWN copy of this module, then returns a snapshot;
 * main merges the snapshots in spawn order. Integers add; extremes max/min
 * (order-insensitive); a worker that ran nothing contributes exactly the
 * sequential init values, so the merged report is byte-identical to a
 * --jobs 1 run. */
const ACC_ADD = ['battles', 'rounds', 'hitsTotal', 'parriesTotal', 'subSnaps',
  'phantomHits', 'parryNoTouch', 'cMismatch', 'stuckFlagMismatch',
  'polyOverlap', 'polyTicks', 'subOverlap', 'polyOverlapVis',
  'spinSameDir', 'spinOppDir', 'openMagMismatch', 'flipViol', 'signLawViol', 'zeroSpins', 'magViol',
  'shotThrown', 'shotLanded', 'shotSwats', 'shotRims', 'shotCross', 'shotCleared', 'shotCatch', 'shotPass', 'shotBounce', 'shotPin',
  'shotPhantom', 'swatNoTouch', 'shotRenderBlade', 'shotRenderBody', 'shotRenderRim',
  'shotRenderPair', 'shotEntryFrames', 'shotLost', 'shotOrphan', 'shotDeathDup',
  'budgetViol', 'maxSubEngaged', 'launchOffMid', 'rangedMeleeHits', 'rangedShoves',
  'chainPoseTicks', 'chainPoseSubs', 'chainShotEntries', 'flMissing',
  'polyFlipOverlap', 'polyFlipVis',
  'bandN', 'bandParryNotLastSub', 'bandNoLead'];
const ACC_MAX = ['worstHitGap', 'parryGapMax', 'polyWorst', 'polyFlipWorst', 'polyBandWorst', 'subOverlapWorst',
  'shotWorstGap', 'swatWorstGap', 'shotRenderWorst', 'launchWorst'];
const ACC_MIN = ['parryGapMin', 'swatBestGap'];
function accSnapshot() {
  return { battles, rounds, hitsTotal, parriesTotal, subSnaps,
    phantomHits, worstHitGap, parryNoTouch, parryGapMax, parryGapMin,
    cMismatch, stuckFlagMismatch,
    polyOverlap, polyTicks, polyWorst, subOverlap, subOverlapWorst, polyOverlapVis,
    spinSameDir, spinOppDir, openMagMismatch, flipViol, signLawViol, zeroSpins, magViol,
    shotThrown, shotLanded, shotSwats, shotRims, shotCross, shotCleared, shotCatch, shotPass, shotBounce, shotPin,
    shotPhantom, shotWorstGap, swatNoTouch, swatWorstGap, swatBestGap,
    shotRenderBlade, shotRenderBody, shotRenderRim, shotRenderPair, shotRenderWorst, shotEntryFrames,
    shotLost, shotOrphan, shotDeathDup, budgetViol, maxSubEngaged,
    launchOffMid, launchWorst, rangedMeleeHits, rangedShoves,
    chainPoseTicks, chainPoseSubs, chainShotEntries, flMissing,
    polyFlipOverlap, polyFlipVis, polyFlipWorst, polyBandWorst,
    bandN, bandParryNotLastSub, bandNoLead };
}
function accZero() {
  const t = {};
  for (const k of ACC_ADD) t[k] = 0;
  for (const k of ACC_MAX) t[k] = -Infinity;
  for (const k of ACC_MIN) t[k] = Infinity;
  return t;
}
/* Guard A1 (2026-10-28 — the polyOverlapVis class): a field named in a merge table but absent
 * from accSnapshot() arrives at the merge as `undefined`, sums to NaN, and silently kills
 * whatever law reads it. That is exactly how contact law 3 stayed red for seven days with no
 * visible cause. Fail at startup, in main and in every worker, naming the fields. */
{
  const snapKeys = new Set(Object.keys(accSnapshot()));
  const missing = [...ACC_ADD, ...ACC_MAX, ...ACC_MIN].filter(k => !snapKeys.has(k));
  if (missing.length) throw new Error('measure: accSnapshot() omits merged field(s): ' + missing.join(', '));
  const extra = [...snapKeys].filter(k => !ACC_ADD.includes(k) && !ACC_MAX.includes(k) && !ACC_MIN.includes(k));
  if (extra.length) throw new Error('measure: accSnapshot() returns field(s) no merge table names: ' + extra.join(', '));
}
function accMergeInto(t, s) {
  for (const k of ACC_ADD) t[k] += s[k];
  for (const k of ACC_MAX) t[k] = Math.max(t[k], s[k]);
  for (const k of ACC_MIN) t[k] = Math.min(t[k], s[k]);
}

/* ---------------- one battle ---------------- */
function runMatch(api, seed, weapons) {
  const { newGame, tick, CFG, FIGHTERS, WEAPONS, geom } = api;
  const hz = CFG.tickHz;
  const G = newGame(seed, weapons ? { weapons: weapons } : undefined);
  G.audit = true;
  const maxTicks = BUDGET_SEC * hz;

  let hits = 0, parries = 0;
  let lastCombatTick = 0, maxCombatGap = 0;
  let fightStart = 0, fightEvents = 0, fightTicksHere = 0;
  const roundsHere = [];
  let pendingCombo = null;
  let t = 0;

  // audit state (per battle)
  battles++;
  let curW = [null, null];
  const stuckRep = [false, false];
  const stuckLatchT = [0, 0], stuckPeak = [0, 0];   // deep-disengage gate replica state (law 4's re-arm extension, owner 2026-10-23) — mirrors the sim's bladeLatchTick/bladeClearPeak
  /* 2026-10-28 attribution: shotGoneSids becomes a Map sid -> {t, kind} of the FIRST proven
   * departure, so a duplicate departure can be named by mechanism instead of merely counted.
   * `.has()` is identical on Set and Map, but iteration is NOT — a Map yields [key,value] pairs,
   * so the orphan scan at the battle end must use .keys() (see the trap note there). */
  const shotFireSids = new Set(), shotGoneSids = new Map();
  const dupHere = [];
  const addGone = (sid, kind) => {
    if (shotGoneSids.has(sid)) {
      shotDeathDup++;
      dupHere.push({ mech: 'A-doubleGone', sid, t: G.t, kind, first: shotGoneSids.get(sid) });
    } else shotGoneSids.set(sid, { t: G.t, kind });
  };
  let bandWorstHere = null;   // 2026-10-28 attribution: this battle's deepest band-class overlap
  let prevPhase = G.phase;
  // cross-tick spin-law carry: the previous fight tick's last snapshot record + its parry substeps
  let havePrev = false, prevSub = 0, prevS0 = 0, prevS1 = 0;
  let prevParrySubs = null;
  let lastTickSeen = -1;
  // per-tick scratch — hoisted out of the tick loop; cleared, not reallocated (~1.7M ticks per run)
  const hitsBySub = new Map();       // sub -> Set(attacker idx)
  const hitSpinAt = new Map();       // "sub:f" -> post-growth |spin| from the hit event
  const parrySubs = new Set();
  const parryAt = new Map();         // sub -> parry event (at most one per substep)
  const hitSets = [new Set(), new Set()];
  const edgeSeen = [new Set(), new Set()];
  const idxOfSub = new Map();
  const entry = [];                  // shot entry-frame slots (objects reused)
  const entryFl = [[1, 0, 1, 0, 1, 0], [1, 0, 1, 0, 1, 0]];   // the sub=-1 entry record's chain poses — flailInit's rest constant until the first stash

  const gapAt = (S, i, fl0, fl1) => geom.parryGap(
    { x: S[i + A_X], y: S[i + A_Y], ang: S[i + A_ANG], w: curW[0], fl: fl0, fp: geom.leadFlip(curW[0], S[i + A_SPIN]) },
    { x: S[i + B_X], y: S[i + B_Y], ang: S[i + B_ANG], w: curW[1], fl: fl1, fp: geom.leadFlip(curW[1], S[i + B_SPIN]) }
  ).gap;   // fp: the edge-leading mirror (owner 2026-10-22), derived from the substep record's own signed spins — the sim's collision passes the same factor
  /* the same, with EXPLICIT displayed factors — law 3's mirror class recomputes
   * the entry pose with the PRE-flip spins (law 3 only; every other channel reads
   * the record's own spins). */
  const gapAtFp = (S, i, fp0, fp1, fl0, fl1) => geom.parryGap(
    { x: S[i + A_X], y: S[i + A_Y], ang: S[i + A_ANG], w: curW[0], fl: fl0, fp: fp0 },
    { x: S[i + B_X], y: S[i + B_Y], ang: S[i + B_ANG], w: curW[1], fl: fl1, fp: fp1 }
  ).gap;
   // fl: the chain pose from the SAME source the record's body fields come from
    // (stashed live fl.u for the sub=-1 entry record, G.auditFl for a substep) —
    // the sim's bladeVsBlade passes f.fl.u into exactly these pose objects (:1529-30)

  /* --band-dump (2026-10-28): resolver geometry at this battle's deepest band-class
   * overlap. REPORT-ONLY — it attaches one extra property to bandWorstHere, which
   * rides the per-battle result object and never an accumulator, so no measured
   * value changes with the flag on or off. It replicates ONE pass of the canonical's
   * projection loop read-only (sim :1676-1701, faithful to the accumulated-delta
   * ordering and the raw-position axis prefilter) to expose how much of the
   * multi-contact push CANCELS: v0.8-step1's claim is that opposed laterals cancel
   * and the axial components add, which is the direction that opens scissors. This
   * measures whether they actually do at the depth law 3 stalls at. */
  const _bdA = [], _bdB = [], _bdR = [], _bdRc = {};
  function reachOf(w) {                       // CFG.nudgePx / REACH is the pin-escape cap; REACH is not exported, so derive it
    if (_bdRc[w] !== undefined) return _bdRc[w];
    geom.bladeCircles(0, 0, 0, w, _bdR, null, 1);
    let m = 0;
    for (let q = 0; q < _bdR.length; q += 3) m = Math.max(m, Math.hypot(_bdR[q], _bdR[q + 1]) + _bdR[q + 2]);
    return (_bdRc[w] = m);
  }
  function bandDump(S, i, fl0, fl1) {
    const r3 = (v) => +v.toFixed(3), r4 = (v) => +v.toFixed(4);
    const pA = { x: S[i + A_X], y: S[i + A_Y], ang: S[i + A_ANG], w: curW[0], fl: fl0, fp: geom.leadFlip(curW[0], S[i + A_SPIN]) };
    const pB = { x: S[i + B_X], y: S[i + B_Y], ang: S[i + B_ANG], w: curW[1], fl: fl1, fp: geom.leadFlip(curW[1], S[i + B_SPIN]) };
    const pg = geom.parryGap(pA, pB);
    geom.bladeCircles(pA.x, pA.y, pA.ang, pA.w, _bdA, pA.fl, pA.fp);
    geom.bladeCircles(pB.x, pB.y, pB.ang, pB.w, _bdB, pB.fl, pB.fp);
    let daX = 0, daY = 0, dbX = 0, dbY = 0, deep = 0, tqA = 0, tqB = 0;
    let nCon = 0, gross = 0, bi = -1, bj = -1, bra = 0, brb = 0;
    for (let ii = 0; ii < _bdA.length; ii += 3) {
      const ra = _bdA[ii + 2];
      for (let jj = 0; jj < _bdB.length; jj += 3) {
        const sum = ra + _bdB[jj + 2];
        const dx0 = _bdB[jj] - _bdA[ii], dy0 = _bdB[jj + 1] - _bdA[ii + 1];
        if (dx0 > sum || dx0 < -sum || dy0 > sum || dy0 < -sum) continue;
        const ax = _bdA[ii] + daX, ay = _bdA[ii + 1] + daY;
        const bx = _bdB[jj] + dbX, by = _bdB[jj + 1] + dbY;
        const dx = bx - ax, dy = by - ay;
        const dc = Math.hypot(dx, dy);
        const d = dc - sum;
        if (d >= 0) continue;
        const ux = dc > 1e-9 ? dx / dc : 0, uy = dc > 1e-9 ? dy / dc : -1;
        const ov = -d * 0.4;
        nCon++; gross += ov;
        daX -= ux * ov; daY -= uy * ov;
        dbX += ux * ov; dbY += uy * ov;
        tqA += (ax - pA.x) * -uy - (ay - pA.y) * -ux;
        tqB += (bx - pB.x) * uy - (by - pB.y) * ux;
        if (d < deep) { deep = d; bi = ii / 3; bj = jj / 3; bra = ra; brb = _bdB[jj + 2]; }
      }
    }
    const net = Math.hypot(daX, daY);
    const bd = Math.hypot(pB.x - pA.x, pB.y - pA.y);
    const half = CFG.size / 2, R = CFG.bodyR;
    /* Both stall-test variants, run read-only on THIS pose, to compare what the
     * canonical's loop actually does with what its own comment (sim :1671-75) says
     * it does. Faithful to sim :1676-1732: same accumulated-delta sweep, same 0.4
     * relaxation, same separateBodiesPos + clampToArenaPos per pass, same one-nudge
     * allowance (the rotational kick is skipped — its direction needs tqA/tqB and it
     * only ever fires on a real stall, so omitting it makes both variants compare on
     * projection alone). The resolver never changes the chain pose (sim :1756), so
     * fl stays fixed across passes. */
    function runLoop(stalled) {
      let ax = pA.x, ay = pA.y, bx = pB.x, by = pB.y;
      let gap = pg.gap, gapPrev = pg.gap, iters = 0, nudges = 0;
      const D0 = [], D1 = [];
      for (let it = 0; it < 16 && gap < 0; it++) {
        iters++;
        geom.bladeCircles(ax, ay, pA.ang, pA.w, D0, pA.fl, pA.fp);
        geom.bladeCircles(bx, by, pB.ang, pB.w, D1, pB.fl, pB.fp);
        let daX2 = 0, daY2 = 0, dbX2 = 0, dbY2 = 0, deep = 0;
        for (let ii = 0; ii < D0.length; ii += 3) {
          const ra = D0[ii + 2];
          for (let jj = 0; jj < D1.length; jj += 3) {
            const sum = ra + D1[jj + 2];
            const dx0 = D1[jj] - D0[ii], dy0 = D1[jj + 1] - D0[ii + 1];
            if (dx0 > sum || dx0 < -sum || dy0 > sum || dy0 < -sum) continue;
            const px = D0[ii] + daX2, py = D0[ii + 1] + daY2;
            const qx = D1[jj] + dbX2, qy = D1[jj + 1] + dbY2;
            const dx = qx - px, dy = qy - py;
            const dc = Math.hypot(dx, dy), d = dc - sum;
            if (d >= 0) continue;
            const ux = dc > 1e-9 ? dx / dc : 0, uy = dc > 1e-9 ? dy / dc : -1, ov = -d * 0.4;
            daX2 -= ux * ov; daY2 -= uy * ov; dbX2 += ux * ov; dbY2 += uy * ov;
            if (d < deep) deep = d;
          }
        }
        ax += daX2; ay += daY2; bx += dbX2; by += dbY2;
        let dd = Math.hypot(bx - ax, by - ay);                    // separateBodiesPos (sim :1625-33)
        if (dd > 1e-9 && dd < 2 * R) {
          const ov2 = (2 * R - dd) / 2, ux2 = (bx - ax) / dd, uy2 = (by - ay) / dd;
          ax -= ux2 * ov2; ay -= uy2 * ov2; bx += ux2 * ov2; by += uy2 * ov2;
        }
        const cl = (v, w) => {                                      // clampToArenaPos (sim :1616-24)
          const ex = v[0] - half, ey = v[1] - half, ed = Math.hypot(ex, ey);
          if (ed > 1e-9 && ed + R > half) { const sc = (half - R) / ed; v[0] = half + ex * sc; v[1] = half + ey * sc; }
        };
        const pA2 = [ax, ay], pB2 = [bx, by]; cl(pA2); cl(pB2);
        ax = pA2[0]; ay = pA2[1]; bx = pB2[0]; by = pB2[1];
        gap = deep;
        if (deep === 0) break;
        if (stalled(deep, gapPrev)) {
          if (nudges === 0 && deep < -1) { nudges++; gapPrev = deep; continue; }
          break;
        }
        gapPrev = deep;
      }
      return { iters, nudges, gap: +gap.toFixed(3) };
    }
    /* sim :1708 as written, versus the test its own comment describes: progress is
     * the penetration SHRINKING (deep rising toward 0), so a stall is progress
     * below the 0.02px audit rate — `deep - gapPrev < 0.02`. */
    const loopAsWritten = runLoop((deep, gp) => deep - gp > -0.02);
    const loopAsIntended = runLoop((deep, gp) => deep - gp < 0.02);
    return {
      gap: r3(pg.gap), cx: r3(pg.x), cy: r3(pg.y), nx: r4(pg.nx), ny: r4(pg.ny),
      nC0: _bdA.length / 3, nC1: _bdB.length / 3, nCon,
      /* net/gross is the alignment of the multi-contact push: 1 = every contact
       * pushes the same way, 0 = fully opposed and the pass does nothing. */
      gross: r3(gross), net: r3(net), align: gross > 1e-12 ? r4(net / gross) : null,
      deep: r3(deep), bi, bj, bra: +bra.toFixed(2), brb: +brb.toFixed(2),
      daX: r3(daX), daY: r3(daY), dbX: r3(dbX), dbY: r3(dbY), tqA: +tqA.toFixed(2), tqB: +tqB.toFixed(2),
      ax: r3(pA.x), ay: r3(pA.y), bx: r3(pB.x), by: r3(pB.y),
      bodyD: r3(bd), body2R: 2 * R, bodyOv: r3(2 * R - bd),
      wallA: r3(half - R - Math.hypot(pA.x - half, pA.y - half)),
      wallB: r3(half - R - Math.hypot(pB.x - half, pB.y - half)),
      spin0: r4(S[i + A_SPIN]), spin1: r4(S[i + B_SPIN]),
      ang0: r4(pA.ang), ang1: r4(pB.ang), fp0: r4(pA.fp), fp1: r4(pB.fp),
      stuck0: S[i + A_STUCK], stuck1: S[i + B_STUCK],
      reach0: +reachOf(pA.w).toFixed(2), reach1: +reachOf(pB.w).toFixed(2),
      nudgeCap0: r4(CFG.nudgePx / reachOf(pA.w)), nudgeCap1: r4(CFG.nudgePx / reachOf(pB.w)),
      pad: CFG.parryPad,
      loopAsWritten, loopAsIntended,
    };
  }

  while (!G.over && t < maxTicks) {
    /* entry chain pose: fl.u is written ONLY by flailStep (inside the substep
     * loop) and flailInit (spawn/round reset), so the live pose captured here —
     * the same instant the tick's sub=-1 snapshot reads the bodies — IS the
     * entry record's chain pose. G.auditFl has no entry row, which is why laws
     * 3 and 3s need this stash rather than a lookup. */
    for (let fi = 0; fi < 2; fi++) {
      const f = G.fighters[fi];
      if (f && f.fl) { const u = f.fl.u, d = entryFl[fi]; for (let q = 0; q < 6; q++) d[q] = u[q]; }
    }
    tick(G); t++;
    if (G.phase === 'fight') fightTicksHere++;

    /* ---- events pass ---- */
    hitsBySub.clear(); hitSpinAt.clear(); parrySubs.clear(); parryAt.clear();
    hitSets[0].clear(); hitSets[1].clear(); edgeSeen[0].clear(); edgeSeen[1].clear();
    idxOfSub.clear();
    let killBy0At = -1;
    for (const e of G.events) {
      if (G.phase === 'fight' || e.kind === 'ko') fightEvents++;
      if (e.kind === 'roll') {
        pendingCombo = e.w0 + '+' + e.w1;
        curW = [e.w0, e.w1];
        stuckRep[0] = stuckRep[1] = false;
        stuckLatchT[0] = stuckLatchT[1] = 0; stuckPeak[0] = stuckPeak[1] = 0;   // the round roll resets the sim's gate state — the replica follows
        shotCleared += e.shotsCleared || 0;
        for (const sid of e.clearedSids || []) addGone(sid, 'roll-clear');   // round change: in-flight shots leave play, accounted
      }
      else if (e.kind === 'roundStart') { rounds++; fightStart = G.t; lastCombatTick = G.t; }
      else if (e.kind === 'hit') {
        hits++; hitsTotal++; lastCombat(e);
        if (e.shot) {
          // Shot kills land AFTER both blade passes of their substep, so they must
          // not feed killBy0At (that skip models blade-order deaths only), and they
          // don't pair with the bladeStuck replica — the shot is consumed by the
          // hit, so law 4 is structural for shots (accounted via sid departure).
          shotLanded++;
          /* halo-r39: a RETURNING shot's body hit is a PASS-THROUGH — damage + knock, no
           * departure (the flight continues; law 4's row-gated exception). The replica mirrors
           * the sim's own gate: only a non-returns row is consumed by the hit. The shot-hit
           * event carries no weapon field, so the row is read via the owner's slot. */
          if (WEAPONS[curW[e.by]].shot.returns) shotPass++;
          else addGone(e.sid, 'land');
          // law 1 shot variant — recompute the touch from the shot's death pose vs the victim
          const gap = Math.hypot(e.sx - e.x, e.sy - e.y) - CFG.bodyR - e.sr;
          if (!(gap <= EPS)) shotPhantom++;
          if (gap > shotWorstGap) shotWorstGap = gap;
        } else {
          // law-5 magnitude pairing: a blade hit grows the attacker BEFORE the
          // same substep's parry flips it, so the parry event carries the
          // grown magnitude. (Shot hits grow AFTER — deliberately unpaired.)
          hitSpinAt.set(e.sub + ':' + e.by, e.spin);
          if (WEAPONS[e.aW].shot) rangedMeleeHits++;   // law 7s RETIRED at allcut-r62 — a projectile weapon's spine cuts like any weapon (owner 2026-11-02); the counter is now VISIBILITY (spine melee hits by launchers), not a must-be-0 law
          if (e.kill && e.by === 0) killBy0At = e.sub;
          if (!hitsBySub.has(e.sub)) hitsBySub.set(e.sub, new Set());
          hitsBySub.get(e.sub).add(e.by);
          // law 1 — phantom-hit check: recompute the touch from the stored contact pose
          if (WEAPONS[e.aW].chain && !e.aFl) flMissing++;
          geom.bladeCircles(e.ax, e.ay, e.aAng, e.aW, circA, e.aFl, geom.leadFlip(e.aW, e.aSp));   // edge-leading mirror from the hit's stored signed spin (2026-10-22); e.aFl = the attacker's stored chain pose (sim :1460) — chain-aware since the 2026-10-28 fix, which closed the disclosed gap
          const gap = geom.bladeBodyGap(circA, e.x, e.y);
          if (!(gap < CFG.bodyR + EPS)) phantomHits++;
          if (gap > worstHitGap) worstHitGap = gap;
        }
      }
      else if (e.kind === 'parry') {
        parries++; parriesTotal++; lastCombat(e);
        parrySubs.add(e.sub);
        parryAt.set(e.sub, e);
        // law 2 — exact touch at the stored ENTRY poses (no slack allowed)
        if ((WEAPONS[e.aW].chain && !e.aFl) || (WEAPONS[e.bW].chain && !e.bFl)) flMissing++;
        const pg = geom.parryGap(
          { x: e.ax, y: e.ay, ang: e.aAng, w: e.aW, fl: e.aFl, fp: geom.leadFlip(e.aW, e.aSp) },
          { x: e.bx, y: e.by, ang: e.bAng, w: e.bW, fl: e.bFl, fp: geom.leadFlip(e.bW, e.bSp) }
        );   // aSp/bSp = the ENTRY spin signs (pre-recoil) — the mirror the blades had when they touched
             // aFl/bFl = the entry chain poses the event stored (sim :1648: "the resolver never changes them, only the bodies move")
        if (pg.gap > EPS) parryNoTouch++;
        if (pg.gap > parryGapMax) parryGapMax = pg.gap;
        if (pg.gap < parryGapMin) parryGapMin = pg.gap;
      }
      else if (e.kind === 'bounce') lastCombat(e);
      else if (e.kind === 'shotFire') {
        shotThrown++; shotFireSids.add(e.sid);
        // law 6s — LAUNCH DOCTRINE (owner 2026-10-19): radial hold -> spine
        // tip (t = 1); tangential hold -> spine middle (t = 0.5) plus shot.off
        // along the body radial for 'radial'-fire weapons (bow/crossbow nock
        // offset). Recomputed from the stored firing pose (spineFrame's
        // scratch _fr — read before recall).
        const W = WEAPONS[curW[e.by]];
        const fr = geom.spineFrame(e.fx, e.fy, e.fAng, curW[e.by]);
        /* law 6s, phase-3 doctrines (2026-10-25, edited NOT run — owner-go rule):
           knives = three tip anchors (volley ruling b) with the rim clamp
           replayed; copy kinds = art centre (copy rule); else hold-derived. */
        const cands = [];
        if (curW[e.by] === 'knives') {
          for (const ka of [[50.7, -73.8], [17.69, -60.95], [83.71, -60.95]]) {
            let px = fr.ox + ka[0] * fr.dx - ka[1] * fr.dy, py = fr.oy + ka[0] * fr.dy + ka[1] * fr.dx;
            const hx = px - CFG.size / 2, hy = py - CFG.size / 2, hr = Math.hypot(hx, hy);
            if (hr + W.shot.r > CFG.size / 2 - 0.5) { const k2 = (CFG.size / 2 - 0.5 - W.shot.r) / hr; px = CFG.size / 2 + hx * k2; py = CFG.size / 2 + hy * k2; }
            cands.push([px, py]);
          }
        } else if ({ shuriken: 1, boomerang: 1, javelin: 1 }[curW[e.by]]) {
          const ps = W.poly.polys; let A = 0, ax = 0, ay = 0;
          for (const pl of ps) { const ring = pl.subs[0]; let sa = 0, sx = 0, sy = 0;
            for (let i = 0; i < ring.length; i++) { const p = ring[i], q = ring[(i + 1) % ring.length]; const cr = p[0] * q[1] - q[0] * p[1]; sa += cr; sx += (p[0] + q[0]) * cr; sy += (p[1] + q[1]) * cr; }
            if (sa) { ax += sx / (3 * sa) * Math.abs(sa); ay += sy / (3 * sa) * Math.abs(sa); A += Math.abs(sa); } }
          let cx = A ? ax / A : 0, cy = A ? ay / A : 0, inside = false;
          for (const pl of ps) { const ring = pl.subs[0];
            for (let i = 0, j = ring.length - 1; i < ring.length && !inside; j = i++) { const pi = ring[i], pj = ring[j];
              if ((pi[1] > cy) !== (pj[1] > cy) && cx < (pj[0] - pi[0]) * (cy - pi[1]) / (pj[1] - pi[1]) + pi[0]) inside = true; }
            if (inside) break; }
          if (!inside) { let ring = ps[0].subs[0]; for (const pl of ps) if (pl.subs[0].length > ring.length) ring = pl.subs[0];
            const m1 = ring[Math.floor(ring.length * 0.25)], m2 = ring[Math.floor(ring.length * 0.75)]; cx = (m1[0] + m2[0]) / 2; cy = (m1[1] + m2[1]) / 2; }
          cands.push([fr.ox + cx * fr.dx - cy * fr.dy, fr.oy + cx * fr.dy + cy * fr.dx]);
        } else {
          const tPt = W.hold === 'tangential' ? 0.5 : 1;
          let ex = fr.ox + fr.dx * fr.span * tPt, ey = fr.oy + fr.dy * fr.span * tPt;
          if (W.hold === 'tangential' && W.shot && W.shot.off) { ex += Math.cos(e.fAng) * W.shot.off; ey += Math.sin(e.fAng) * W.shot.off; }
          cands.push([ex, ey]);
        }
        const d = Math.min(...cands.map(c2 => Math.hypot(e.x - c2[0], e.y - c2[1])));
        if (!(d <= EPS)) launchOffMid++;
        if (d > launchWorst) launchWorst = d;
      }
      else if (e.kind === 'swat') {
        // a swat is combat for the stall timer (a visible, attributable clash) —
        // v0.7 stall semantics: hit/parry/swat/bounce
        lastCombat(e);
        shotSwats++; addGone(e.sid, 'swat');
        // law 2 shot variant — the swat recomputes to an exact touch from the stored swatter pose
        if (WEAPONS[e.fW].chain && !e.fFl) flMissing++;
        geom.bladeCircles(e.fx, e.fy, e.fAng, e.fW, circA, e.fFl, geom.leadFlip(e.fW, e.fSp));   // edge-leading mirror from the swat's stored signed spin (2026-10-22); e.fFl = the swatter's stored chain pose (sim :1765)
        let best = Infinity;
        for (let ci = 0; ci < circA.length; ci += 3) {
          const d = Math.hypot(e.x - circA[ci], e.y - circA[ci + 1]) - circA[ci + 2];
          if (d < best) best = d;
        }
        const g = best - e.sr;
        if (!(g <= EPS)) swatNoTouch++;
        if (g > swatWorstGap) swatWorstGap = g;
        if (g < swatBestGap) swatBestGap = g;
      }
      else if (e.kind === 'shotCatch') { shotCatch++; addGone(e.sid, 'catch'); }   // halo-r39: the owner-catch is a proven departure (every circuit, by the hand-on-path guarantee); no 'expire' exists — the halo has no timer death
      else if (e.kind === 'shotBounce') { shotBounce++; }   // ricolaw-r41: a ricochet is not a departure and not a combat resolution — the eternal-ricochet law is audited by seam-proof section H
      else if (e.kind === 'shotPin') { shotPin++; }   // pinlaw-r44: a pin is not a departure and not a combat resolution — the nail waits; the pin law was audited by the landing smoke (a seam-proof section J is DEFERRED to the next full-battery milestone, per the #674 process law)
      else if (e.kind === 'shotRim') { shotRims++; addGone(e.sid, 'rim'); }
      else if (e.kind === 'shotCross') { shotCross++; addGone(e.sid, 'cross'); }
      else if (e.kind === 'ko') {
        roundsHere.push({
          round: e.round, combo: pendingCombo, winner: e.winner,
          sec: (G.t - fightStart) / hz,
        });
      }
    }

    /* ---- law 6 — opening spins (reveal -> fight transition) ---- */
    if (prevPhase === 'reveal' && G.phase === 'fight') {
      const s0 = G.fighters[0].spin, s1 = G.fighters[1].spin;
      if (s0 * s1 > 0) spinSameDir++; else spinOppDir++;
      if (Math.abs(s0) !== WEAPONS[curW[0]].omega || Math.abs(s1) !== WEAPONS[curW[1]].omega) openMagMismatch++;
    }
    prevPhase = G.phase;

    /* ---- snapshot pass (laws 3, 4, 5) ---- */
    const S = G.auditSubs;
    const FL = G.auditFl;              // per-substep chain poses, stride STRF — no row for the sub=-1 entry record
    if (S.length) {
      if (G.t !== lastTickSeen + 1) { havePrev = false; prevParrySubs = null; }   // phase gap: no carry
      lastTickSeen = G.t;
      let kill0Sub = killBy0At;
      let firstEntryDone = false;

      for (let i = 0; i < S.length; i += STR) {
        const sub = S[i];
        const aAlive = S[i + A_ALIVE] === 1, bAlive = S[i + B_ALIVE] === 1;
        idxOfSub.set(sub, i);

        /* cross-tick spin carry: previous tick's last record -> this tick's entry */
        if (!firstEntryDone) {
          firstEntryDone = true;
          if (havePrev && !(prevParrySubs && prevParrySubs.has(prevSub))) {
            if (Math.sign(S[i + A_SPIN]) !== Math.sign(prevS0)) signLawViol++;
            if (Math.sign(S[i + B_SPIN]) !== Math.sign(prevS1)) signLawViol++;
          }
        }

        if (sub === -1) {
          /* law 3 — rendered pose (tick entry = post-resolution state of the
           * previous tick's last substep — what the viewer's frame shows).
           * Single representation class since v0.9 (every weapon is a path
           * silhouette) — audited against the disclosed band in the checks. */
          if (aAlive && bAlive) {
            polyTicks++;
            if (WEAPONS[curW[0]].chain || WEAPONS[curW[1]].chain) chainPoseTicks++;
            const g = gapAt(S, i, entryFl[0], entryFl[1]);   // the RENDERED pose — entry chain poses from the pre-tick stash
            if (g < 0) {
              polyOverlap++; if (-g > polyWorst) polyWorst = -g;
              const vis = -g > 2.5;
              if (vis) polyOverlapVis++;
              /* mirror-class membership, proven per occurrence (see the accumulator
               * header). prevSub/prevS0/prevS1/prevParrySubs still hold the PREVIOUS
               * tick's last record here — the entry record is this loop's first. */
              let mirror = false;
              if (havePrev && prevParrySubs && prevParrySubs.has(prevSub)) {
                const W0 = WEAPONS[curW[0]], W1 = WEAPONS[curW[1]];
                if (W0.lead || W0.headLead || W1.lead || W1.headLead) {
                  const gPre = gapAtFp(S, i, geom.leadFlip(curW[0], prevS0), geom.leadFlip(curW[1], prevS1), entryFl[0], entryFl[1]);
                  mirror = gPre > -2.5;
                }
              }
              if (mirror) { polyFlipOverlap++; if (vis) polyFlipVis++; if (-g > polyFlipWorst) polyFlipWorst = -g; }
              else {
                if (-g > polyBandWorst) polyBandWorst = -g;
                bandN++;
                /* 2026-10-28 attribution: was this a flip the mirror test declined to claim, or a
                 * genuine resolver miss? The mirror test needs a parry in the PREVIOUS tick's LAST
                 * substep AND a lead/headLead weapon; record both axes for the band population.
                 * G carries no round field, so the round index is derived from completed wins. */
                const BL0 = WEAPONS[curW[0]], BL1 = WEAPONS[curW[1]];
                const leady = !!(BL0.lead || BL0.headLead || BL1.lead || BL1.headLead);
                const parryPrev = !!(havePrev && prevParrySubs && prevParrySubs.size);
                if (parryPrev && !prevParrySubs.has(prevSub)) bandParryNotLastSub++;
                if (!leady) bandNoLead++;
                if (!bandWorstHere || -g > bandWorstHere.d) {
                  bandWorstHere = {
                    d: -g, t: G.t, rnd: G.wins[0] + G.wins[1] + 1, w0: curW[0], w1: curW[1], vis,
                    s0: +G.fighters[0].spin.toFixed(3), s1: +G.fighters[1].spin.toFixed(3),
                    leady, parryPrev, prevSub,
                    parryLastSub: !!(parryPrev && prevParrySubs.has(prevSub)),
                  };
                  if (BAND_DUMP) bandWorstHere.g = bandDump(S, i, entryFl[0], entryFl[1]);
                }
              }
            }
          }
        } else {
          subSnaps++;
          const fl0 = flAt(FL, sub, 0), fl1 = flAt(FL, sub, 1);   // the poses this substep's contact tests saw (sim :1201)
          if ((WEAPONS[curW[0]].chain && !fl0) || (WEAPONS[curW[1]].chain && !fl1)) flMissing++;
          if (WEAPONS[curW[0]].chain || WEAPONS[curW[1]].chain) chainPoseSubs++;
          /* law 3 info — substep pre-resolution overlap (the resolver eats it in this same substep) */
          if (aAlive && bAlive) {
            const g = gapAt(S, i, fl0, fl1);
            if (g < 0) { subOverlap++; if (-g > subOverlapWorst) subOverlapWorst = -g; }
          }
          /* law 4 — stuck-flag replica, both attackers, same order as the sim */
          for (let atk = 0; atk <= 1; atk++) {
            if (atk === 1 && kill0Sub === sub) continue;        // victim died earlier this substep
            const aX = S[i + A_X], aY = S[i + A_Y];
            const bX = S[i + B_X], bY = S[i + B_Y];
            const wx = atk === 0 ? aX : bX, wy = atk === 0 ? aY : bY;
            const wAng = atk === 0 ? S[i + A_ANG] : S[i + B_ANG];
            const vx = atk === 0 ? bX : aX, vy = atk === 0 ? bY : aY;
            const vAlive = atk === 0 ? bAlive : aAlive, aAliveAtk = atk === 0 ? aAlive : bAlive;
            const flagStored = atk === 0 ? S[i + A_STUCK] : S[i + B_STUCK];
            if (!aAliveAtk || !vAlive) continue;
            geom.bladeCircles(wx, wy, wAng, curW[atk], atk === 0 ? circA : circB, atk === 0 ? fl0 : fl1, geom.leadFlip(curW[atk], S[i + (atk === 0 ? A_SPIN : B_SPIN)]));   // the replica mirrors the sim's exact gate — flip included (the sim's bladeVsBody passes leadFlip from the same substep's spin) and chain pose included (bladeVsBody passes a.fl.u, sim :1403)
            const gap = geom.bladeBodyGap(atk === 0 ? circA : circB, vx, vy);
            if (stuckRep[atk] !== (flagStored === 1)) stuckFlagMismatch++;
            if (stuckRep[atk]) {
              /* deep-disengage gate mirror (owner option 1 2026-10-23): the sim's
               * bladeVsBody block in its exact order — peak update first, then
               * pad AND (deep OR waited). G.t here is the same tick the sim's
               * physics saw (G.t++ runs at the top of tick(), before
               * stepPhysics). */
              const clear = gap - CFG.bodyR;
              if (clear > stuckPeak[atk]) stuckPeak[atk] = clear;
              if (clear > CFG.reArmPad && (stuckPeak[atk] >= CFG.reArmDeep || G.t - stuckLatchT[atk] >= CFG.reArmWait)) stuckRep[atk] = false;
            } else if (gap < CFG.bodyR) {
              stuckRep[atk] = true;
              stuckLatchT[atk] = G.t; stuckPeak[atk] = 0;
              /* allcut-r62 (owner 2026-11-02): law 7s / the projectile rule
               * are RETIRED — every weapon cuts on body touch, so every
               * latched rising edge pairs with a hit event, launchers and the
               * shield included. Mirrors the gate-free bladeVsBody; the old
               * knock-only class (rangedShoves) is a structural 0. */
              edgeSeen[atk].add(sub);
            }
          }
          /* law 5 — zero spin is impossible */
          if (S[i + A_SPIN] === 0 || S[i + B_SPIN] === 0) zeroSpins++;
        }

        /* law 5 — within-tick spin-sign law: a sign change between consecutive
         * records must be explained by a parry at the earlier record's substep
         * (physics runs AFTER each snapshot; -1 -> 0 has no physics between) */
        if (i + STR < S.length) {
          const j = i + STR;
          for (let f = 0; f < 2; f++) {
            const off = f === 0 ? A_SPIN : B_SPIN;
            if (Math.sign(S[i + off]) !== Math.sign(S[j + off]) && !parrySubs.has(sub)) signLawViol++;
          }
        }
        havePrev = true; prevSub = sub; prevS0 = S[i + A_SPIN]; prevS1 = S[i + B_SPIN];
      }

      /* ---- shot entry-frame pass (projectile laws 3s + budget) ----
       * The shots at tick entry ARE the rendered shots: none may overlap the
       * foe blade, foe body, rim, or another shot — and because a shot dies
       * on its first contact substep, an entry-frame overlap would also prove
       * a missed kill last tick. Together with the death-pose recomputes on
       * the event side (gap <= 0 at death), every shot kill is bracketed by
       * "outside at entry" and "biting at death" — no teleport kills, no
       * tunneling survivors. auditK carries the sim's chosen substep count vs
       * its blade and projectile requirements: the detection guarantee is
       * relative travel per substep <= half the narrowest window. */
      const ST = G.auditShots;
      if (ST.length) {
        const K = G.auditK;
        if (K.length === 3) {
          if (K[0] < K[1] || K[0] < K[2]) budgetViol++;
          if (K[0] >= CFG.maxSub) maxSubEngaged++;
        }
        const n = ST[0];
        for (let si = 0; si < n; si++) {                 // reuse slot objects — no per-tick allocation
          let slot = entry[si];
          if (!slot) slot = entry[si] = {};
          slot.sid = ST[1 + si * 5]; slot.x = ST[2 + si * 5]; slot.y = ST[3 + si * 5]; slot.o = ST[4 + si * 5]; slot.r = ST[5 + si * 5];
        }
        entry.length = n;
        if (n > 0) shotEntryFrames++;
        const half = CFG.size / 2;
        for (const st of entry) {
          const foeI = 1 - st.o;
          const FX = foeI === 0 ? A_X : B_X, FY = foeI === 0 ? A_Y : B_Y, FA = foeI === 0 ? A_ANG : B_ANG, FS = foeI === 0 ? A_SPIN : B_SPIN;
          const foeAlive = (foeI === 0 ? S[A_ALIVE] : S[B_ALIVE]) === 1;
          if (foeAlive) {
            if (WEAPONS[curW[foeI]].chain) chainShotEntries++;
            geom.bladeCircles(S[FX], S[FY], S[FA], curW[foeI], circB, entryFl[foeI], geom.leadFlip(curW[foeI], S[FS]));   // edge-leading mirror from the entry record's signed spin (2026-10-22); entry chain pose from the pre-tick stash (this pass reads the sub=-1 record, which has no auditFl row)
            let best = Infinity;
            for (let ci = 0; ci < circB.length; ci += 3) {
              const d = Math.hypot(st.x - circB[ci], st.y - circB[ci + 1]) - circB[ci + 2];
              if (d < best) best = d;
            }
            const gB = best - st.r;
            if (gB < 0) { shotRenderBlade++; if (-gB > shotRenderWorst) shotRenderWorst = -gB; }
            const gBody = Math.hypot(st.x - S[FX], st.y - S[FY]) - CFG.bodyR - st.r;
            if (gBody < 0) { shotRenderBody++; if (-gBody > shotRenderWorst) shotRenderWorst = -gBody; }
          }
          if (Math.hypot(st.x - half, st.y - half) + st.r > half + 0.25) shotRenderRim++;
        }
        for (let i2 = 0; i2 < entry.length; i2++) {
          for (let j2 = i2 + 1; j2 < entry.length; j2++) {
            const A2 = entry[i2], B2 = entry[j2];
            if (Math.hypot(A2.x - B2.x, A2.y - B2.y) < A2.r + B2.r - 0.25) shotRenderPair++;
          }
        }
      }

      /* law 4 — rising edges vs hit events, both directions */
      for (const [sub, set] of hitsBySub) { for (const by of set) hitSets[by].add(sub); }
      for (let atk = 0; atk <= 1; atk++) {
        for (const s of hitSets[atk]) if (!edgeSeen[atk].has(s)) cMismatch++;   // hit without a rising edge
        for (const s of edgeSeen[atk]) if (!hitSets[atk].has(s)) cMismatch++;   // rising edge without a hit
      }

      /* law 5 — every parry must flip BOTH spins: event carries the signed
       * post-flip spins; the snapshot at its substep carries the pre-physics
       * spins. Magnitudes are exact unless a same-substep hit grew the spin
       * first (growth precedes the flip; the hit event carries its value). */
      for (const [sub, e] of parryAt) {
        const i = idxOfSub.get(sub);
        if (i === undefined) { flipViol++; continue; }
        const s0 = S[i + A_SPIN], s1 = S[i + B_SPIN];
        if (Math.sign(e.spin0) !== -Math.sign(s0) || Math.sign(e.spin1) !== -Math.sign(s1)) flipViol++;
        const h0 = hitSpinAt.get(sub + ':0'), h1 = hitSpinAt.get(sub + ':1');
        if (Math.abs(Math.abs(e.spin0) - (h0 !== undefined ? h0 : Math.abs(s0))) > EPS) magViol++;
        if (Math.abs(Math.abs(e.spin1) - (h1 !== undefined ? h1 : Math.abs(s1))) > EPS) magViol++;
      }
      prevParrySubs = parrySubs.size ? new Set(parrySubs) : null;   // copy — the scratch is cleared next tick; null when empty
    } else {
      havePrev = false; prevParrySubs = null; lastTickSeen = G.t;   // non-fight tick breaks any carry
    }

    if (G.phase === 'fight' && G.t - lastCombatTick > maxCombatGap && lastCombatTick > 0) {
      maxCombatGap = G.t - lastCombatTick;
    }
  }
  function lastCombat() {
    if (G.phase === 'fight' && lastCombatTick > 0 && G.t - lastCombatTick > maxCombatGap) {
      maxCombatGap = G.t - lastCombatTick;
    }
    lastCombatTick = G.t;
  }

  /* projectile law 4s — every fired shot must have exactly one accounted
   * departure (landed / swatted / rim / cross / caught / cleared at the round
   * roll) or still be in flight at the battle end. halo-r39: a returning
   * shot departs ONLY via catch / swat / cross / roll-clear — pass-through
   * body hits and rim pierces are not departures. */
  const inFlightEnd = new Set(G.shots.map(st => st.sid));
  for (const sid of shotFireSids) if (!shotGoneSids.has(sid) && !inFlightEnd.has(sid)) shotLost++;
  /* TRAP (2026-10-28): shotGoneSids is now a Map and iterating a Map yields [key,value] PAIRS.
   * Without .keys() this test would compare arrays against a Set, never match, and silently drive
   * shotOrphan to zero — trading a visible bug for an invisible one. */
  for (const sid of shotGoneSids.keys()) if (!shotFireSids.has(sid)) shotOrphan++;
  /* mechanism B: a shot already marked gone is STILL in G.shots at battle end. Distinct from
   * mechanism A (addGone firing twice); both were previously conflated in shotDeathDup. */
  for (const sid of inFlightEnd) if (shotGoneSids.has(sid)) {
    shotDeathDup++;
    dupHere.push({ mech: 'B-goneYetInFlight', sid, t: G.t, over: !!G.over, first: shotGoneSids.get(sid) });
  }

  return {
    seed, terminated: !!G.over, ticks: t,
    winner: G.over ? FIGHTERS[G.winner].id : null,
    wins: G.wins.slice(),
    roundsPlayed: G.wins[0] + G.wins[1],
    battleSec: t / hz,
    rounds: roundsHere,
    hits, parries,
    maxCombatGapSec: maxCombatGap / hz,
    fightEventsPerSec: fightTicksHere > 0 ? fightEvents / (fightTicksHere / hz) : 0,
    maxSpin: G.maxSpin, maxDmg: G.maxDmg,
    shots: { thrown: G.stats.thrown, landed: G.stats.landed, swatted: G.stats.swatted, rim: G.stats.rim, crossed: G.stats.crossed },
    bandWorst: bandWorstHere, dups: dupHere,   /* 2026-10-28 attribution — hashBattle() names its
     * fields explicitly, so neither joins the determinism hash and stays comparable with every
     * previously recorded run. */
  };

  /* determinism spot-check lives in the aggregation (re-run seed 1) */
}

function hashBattle(r) {
  return JSON.stringify([r.winner, r.rounds, r.hits, r.parries, r.maxSpin.toFixed(3), r.maxDmg.toFixed(3), r.ticks, r.shots]);
}

/* ---------------- aggregation ---------------- */
const median = a => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
const p90 = a => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.ceil(s.length * 0.9) - 1)]; };
const pf = ok => ok ? 'PASS' : 'FAIL';
const f2 = x => Number.isFinite(x) ? x.toFixed(2) : 'n/a';

async function runAll(api, opts) {
  const ids = [...api.WEAPON_IDS].sort();
  const list = buildBattleList(ids, opts);
  opts.jobsUsed = Math.max(1, Math.min(opts.jobs, list.length));
  console.error(`measure: ${list.length} battles across ${opts.jobsUsed} workers (mode: ${opts.modeLabel})`);
  const t0 = Date.now();
  const msgs = await runOnWorkers(FILE, list, opts.jobsUsed, opts.bandDump);
  const wallSec = ((Date.now() - t0) / 1000).toFixed(1);

  /* Merge the workers' law accumulators (integers add, extremes max/min),
   * then assemble per-battle results in CANONICAL list order — the same order
   * the old sequential loop produced, so the float aggregations
   * (mean/median/p90) are bit-identical to a --jobs 1 run. */
  const merged = accZero();
  const byIdx = new Map();
  for (const m of msgs) {
    if (!m || m.acc === undefined) throw new Error('a worker exited without reporting — its battles are lost');
    accMergeInto(merged, m.acc);
    for (const o of m.out) byIdx.set(o.idx, o.r);
  }
  if (byIdx.size !== list.length) throw new Error(`lost ${list.length - byIdx.size} battle result(s) — a worker died mid-run?`);
  /* Guard A2 (2026-10-28 — second net for the polyOverlapVis class). Every ACC_ADD field is a
   * sum of integer counters, so a non-integer here means a value never arrived from a worker
   * snapshot. ACC_MAX/ACC_MIN are excluded deliberately: they legitimately still hold their
   * ±Infinity init when nothing touched them. This replaces the drafted blanket
   * "report text must not contain NaN" grep, which was falsified by scratch/m-05.txt — the
   * shield+shield cell completes zero rounds and legitimately prints `med NaNs` (median of an
   * empty list). A zero-round cell is a real result, not a defect. */
  for (const k of ACC_ADD) {
    if (!Number.isInteger(merged[k])) throw new Error(`measure: merged accumulator "${k}" is ${merged[k]}, not a finite integer — it never arrived from a worker snapshot`);
  }
  ({ battles, rounds, hitsTotal, parriesTotal, subSnaps,
     phantomHits, worstHitGap, parryNoTouch, parryGapMax, parryGapMin,
     cMismatch, stuckFlagMismatch,
     polyOverlap, polyTicks, polyWorst, subOverlap, subOverlapWorst, polyOverlapVis,
     spinSameDir, spinOppDir, openMagMismatch, flipViol, signLawViol, zeroSpins, magViol,
     shotThrown, shotLanded, shotSwats, shotRims, shotCross, shotCleared, shotCatch, shotPass, shotBounce, shotPin,
     shotPhantom, shotWorstGap, swatNoTouch, swatWorstGap, swatBestGap,
     shotRenderBlade, shotRenderBody, shotRenderRim, shotRenderPair, shotRenderWorst, shotEntryFrames,
     shotLost, shotOrphan, shotDeathDup, budgetViol, maxSubEngaged,
     launchOffMid, launchWorst, rangedMeleeHits, rangedShoves,
     chainPoseTicks, chainPoseSubs, chainShotEntries, flMissing,
     polyFlipOverlap, polyFlipVis, polyFlipWorst, polyBandWorst,
     bandN, bandParryNotLastSub, bandNoLead } = merged);

  const results = [], detR = [];
  const forcedCells = {};
  let forcedTerm = 0, forcedTotal = 0;
  const forcedLens = [];
  for (let i = 0; i < list.length; i++) {
    const b = list[i], r = byIdx.get(i);
    if (b.kind === 'natural') results.push(r);
    else if (b.kind === 'det') detR.push(r);
    else {
      forcedTotal++;
      if (r.terminated) forcedTerm++;
      forcedLens.push(r.battleSec);
      const cell = forcedCells[b.cell] || (forcedCells[b.cell] = { n: 0, speedy: 0, heavy: 0, sec: [], thrown: 0, landed: 0, swatted: 0 });
      for (const rd of r.rounds) {
        cell.n++;
        if (api.FIGHTERS[rd.winner].id === 'speedy') cell.speedy++; else cell.heavy++;
        cell.sec.push(rd.sec);
      }
      cell.thrown += r.shots.thrown; cell.landed += r.shots.landed; cell.swatted += r.shots.swatted;
    }
  }

  /* 2026-10-28 attribution: select the single worst band-class overlap and collect every
   * duplicate departure, both in CANONICAL list order with a strict > so the winner is
   * job-count independent (first battle wins ties). */
  let bandTop = null, bandTopRef = null;
  const dupAll = [];
  for (let i = 0; i < list.length; i++) {
    const rr = byIdx.get(i), bb = list[i];
    if (rr.bandWorst && (!bandTop || rr.bandWorst.d > bandTop.d)) { bandTop = rr.bandWorst; bandTopRef = bb; }
    if (rr.dups) for (const d of rr.dups) dupAll.push({ d, ref: bb });
  }

  // determinism spot check: seed 1 twice → identical hash (the two replays may
  // land in different workers — an even sharper test: identical across
  // processes). Matrix-only parts carry no det slots → null → [SKIP] line.
  const deterministic = detR.length === 2 ? hashBattle(detR[0]) === hashBattle(detR[1]) : null;
  console.error(`\nmeasure: done in ${wallSec}s wall`);

  const term = results.filter(r => r.terminated).length;
  const wins = {};
  for (const r of results) if (r.winner) wins[r.winner] = (wins[r.winner] || 0) + 1;
  const r2 = results.filter(r => r.roundsPlayed === 2).length;
  const r3 = results.filter(r => r.roundsPlayed === 3).length;
  const bLens = results.map(r => r.battleSec);
  const roundLens = results.flatMap(r => r.rounds.map(x => x.sec));
  const gaps = results.map(r => r.maxCombatGapSec);
  const spins = results.map(r => r.maxSpin);
  const dmgs = results.map(r => r.maxDmg);
  const buzz = results.filter(r => r.maxSpin >= 25).length;
  const combos = {};
  for (const r of results) for (const rd of r.rounds) {
    const c = combos[rd.combo] || (combos[rd.combo] = { n: 0, speedy: 0, heavy: 0, sec: [] });
    c.n++;
    if (api.FIGHTERS[rd.winner].id === 'speedy') c.speedy++; else c.heavy++;
    c.sec.push(rd.sec);
  }

  const L = [];
  L.push(`file: ${FILE.split('/').pop()}   seeds: 1..${SEEDS}   arena: round (locked)   budget: ${BUDGET_SEC}s/battle`);
  L.push(`mode: ${opts.modeLabel}   jobs: ${opts.jobsUsed}   wall: ${wallSec}s (parallel workers; merged in canonical order — identical to a sequential run)`);
  L.push(`determinism     seed 1 twice identical: ${deterministic === null ? 'n/a (this tier carries no det replays)' : deterministic ? 'yes' : 'NO — BUG'}`);
  if (results.length) {
    L.push(`terminated      ${term}/${SEEDS}`);
    L.push(`winner spread   ${Object.entries(wins).map(([k, v]) => `${k}:${v}`).join('  ')}`);
    L.push(`rounds          2-round battles ${r2}   3-round ${r3}`);
    L.push(`battle length   median ${median(bLens).toFixed(1)}s   mean ${mean(bLens).toFixed(1)}s   min ${Math.min(...bLens).toFixed(1)}s   max ${Math.max(...bLens).toFixed(1)}s   ≥60s in ${results.filter(r => r.battleSec >= 60).length}/${SEEDS}`);
    L.push(`round length    median ${median(roundLens).toFixed(1)}s   mean ${mean(roundLens).toFixed(1)}s   max ${Math.max(...roundLens).toFixed(1)}s`);
    L.push(`combat          hits/round mean ${(mean(results.map(r => r.hits / Math.max(1, r.roundsPlayed)))).toFixed(1)}   parries/round mean ${(mean(results.map(r => r.parries / Math.max(1, r.roundsPlayed)))).toFixed(1)}   events/sec mean ${mean(results.map(r => r.fightEventsPerSec)).toFixed(1)}`);
    L.push(`combat stall    max gap between hit/parry/swat/bounce: median ${median(gaps).toFixed(2)}s   p90 ${p90(gaps).toFixed(2)}s   worst ${Math.max(...gaps).toFixed(2)}s`);
    L.push(`ridiculousness  max spin reached: median ${median(spins).toFixed(1)}   p90 ${p90(spins).toFixed(1)}   max ${Math.max(...spins).toFixed(1)} rad/s   buzzsaw (≥25) in ${buzz}/${SEEDS} battles   max dmg: median ${median(dmgs).toFixed(0)}   max ${Math.max(...dmgs).toFixed(0)}`);
  } else {
    L.push(`natural rolls   (skipped — matrix-only part)`);
  }
  L.push(`combo matrix    (FORCED ${opts.mode === 'solidity' ? SOLIDITY_SEEDS : FORCED_SEEDS} seeds/cell — ordered Speedy-weapon + Heavy-weapon → rounds, winner split, median round sec, shots thrown/landed/swatted)`);
  for (const [k, c] of Object.entries(forcedCells).sort()) {
    L.push(`  ${k.padEnd(16)} n=${String(c.n).padStart(3)}   speedy ${c.speedy} / heavy ${c.heavy}   med ${median(c.sec).toFixed(1)}s   shots ${c.thrown}/${c.landed}/${c.swatted}`);
  }
  if (forcedTotal) L.push(`forced battles  terminated ${forcedTerm}/${forcedTotal}   length median ${median(forcedLens).toFixed(1)}s   max ${Math.max(...forcedLens).toFixed(1)}s   (shield+shield and the long mirrors live here)`);
  if (results.length) {
    L.push(`combo matrix    (natural rolls, seeds 1..${SEEDS})`);
    for (const [k, c] of Object.entries(combos).sort()) {
      L.push(`  ${k.padEnd(16)} n=${String(c.n).padStart(3)}   speedy ${c.speedy} / heavy ${c.heavy}   med ${median(c.sec).toFixed(1)}s`);
    }
  }

  L.push('');
  L.push(`== core contact law == (${battles} battles · ${rounds} rounds · ${hitsTotal} hits · ${parriesTotal} parries · ${polyTicks} rendered fight-ticks · ${subSnaps} substep poses)`);
  L.push(`1 damage-on-touch   phantom hits ${phantomHits}/${hitsTotal}   worst hit gap ${f2(worstHitGap)} (bodyR=${api.CFG.bodyR})`);
  L.push(`2 exact-touch parry parries without touch ${parryNoTouch}/${parriesTotal}   entry-gap range [${f2(parryGapMin)}, ${f2(parryGapMax)}] (must be <= 0)`);
  L.push(`3 solidity          rendered fight-ticks ${polyTicks}  overlaps ${polyOverlap} (${f2(100 * polyOverlap / Math.max(1, polyTicks))}%, of which visible (>2.5px, through the 3px ink) ${polyOverlapVis} (${f2(100 * polyOverlapVis / Math.max(1, polyTicks))}%)  worst depth ${Number.isFinite(polyWorst) ? polyWorst.toFixed(3) : 'n/a'}px  — disclosed band, BOUND CORRECTED 2026-10-28 (--band-dump geometry at both worst cases): translation-only projection on crossed long blades has a fixed point ~10px deep that more passes do not improve; the loop has NO rotational DOF (wAngle is written only by the nudge, capped nudgePx/REACH, gated one per tick per fighter) and it accumulates contact torque at sim :1697-98 then reads only Math.sign of it at :1713. The old bound "<=6px for <=2 ticks, infeasible pin (bodies touching + buried wide head), traced seeds 7/8" is FALSIFIED — measured 20.754px (flail+scythe) and 14.673px (crossbow+katana), both flagged visible, with bodies at exactly 2R (zero overlap), 45/169px of wall clearance, and a healthy 9-contact push at 90% alignment   substep pre-resolution overlaps ${subOverlap}/${subSnaps} (info — resolved in-substep, never rendered) worst ${f2(subOverlapWorst)}px   mirror class (a parry flipping a flagged weapon in the tick's last substep — sim truth, never drawn; Part F worst drawn gap -0.149px) ${polyFlipOverlap} overlap(s), ${polyFlipVis} visible, worst ${polyFlipWorst.toFixed(3)}px   band class worst ${polyBandWorst.toFixed(3)}px   chain-pose coverage (2026-10-28 fix): rendered ticks with a chain side ${chainPoseTicks}/${polyTicks} · substep records ${chainPoseSubs}/${subSnaps} · missing poses ${flMissing} (must be 0 — a missing pose silently falls back to the rigid spine)`);
  if (bandTop) L.push(`   band worst ATTRIBUTED  ${bandTop.d.toFixed(3)}px at ${bandTopRef.cell || 'natural'} seed ${bandTopRef.seed} t${bandTop.t} round ${bandTop.rnd} — ${bandTop.w0} vs ${bandTop.w1}, spins ${bandTop.s0}/${bandTop.s1}, visible ${bandTop.vis}, lead/headLead ${bandTop.leady}, parry in previous tick ${bandTop.parryPrev} (in its LAST substep: ${bandTop.parryLastSub}, prevSub ${bandTop.prevSub})`);
  L.push(`   band population  band-class overlaps ${bandN} · parry in previous tick but NOT its last substep ${bandParryNotLastSub} · neither weapon lead/headLead ${bandNoLead}`);
  if (bandTop && bandTop.g) {
    /* --band-dump: the resolver geometry behind the worst band-class overlap. Report-only. */
    const g = bandTop.g;
    const faithful = Math.abs(g.gap + bandTop.d) < 1e-3;
    L.push(`   band GEOMETRY  (--band-dump · report-only · no measured value touched)`);
    L.push(`     self-check    recomputed gap ${g.gap.toFixed(3)}px vs measured ${(-bandTop.d).toFixed(3)}px — ${faithful ? 'FAITHFUL' : 'MISMATCH (the dump does not reproduce the law-3 measurement — do not trust it)'}`);
    L.push(`     pose A        ${bandTop.w0}  body (${g.ax}, ${g.ay})  ang ${g.ang0}  spin ${g.spin0}  fp ${g.fp0}  stuck ${g.stuck0}  reach ${g.reach0}  nudgeCap ${g.nudgeCap0} rad  ${g.nC0} circles`);
    L.push(`     pose B        ${bandTop.w1}  body (${g.bx}, ${g.by})  ang ${g.ang1}  spin ${g.spin1}  fp ${g.fp1}  stuck ${g.stuck1}  reach ${g.reach1}  nudgeCap ${g.nudgeCap1} rad  ${g.nC1} circles`);
    L.push(`     pin state     bodies ${g.bodyD}px apart vs 2R ${g.body2R} → body overlap ${g.bodyOv}px   wall clearance A ${g.wallA} / B ${g.wallB}   parryPad ${g.pad}`);
    L.push(`     deepest pair  A#${g.bi} (r ${g.bra}) vs B#${g.bj} (r ${g.brb})  entry gap ${g.gap.toFixed(3)}px  normal (${g.nx}, ${g.ny})  contact (${g.cx}, ${g.cy})`);
    L.push(`     1 proj pass   ${g.nCon} contacting pairs · gross push ${g.gross}px · net ${g.net}px · ALIGNMENT ${g.align === null ? 'n/a' : (100 * g.align).toFixed(1) + '%'}${g.align !== null && g.align < 0.5 ? '  ← the multi-contact push is mostly CANCELLING' : ''}`);
    L.push(`                   A displaced (${g.daX}, ${g.daY}) · B (${g.dbX}, ${g.dbY}) · post-pass deepest ${g.deep}px · torque A ${g.tqA} / B ${g.tqB}`);
    const lw = g.loopAsWritten, li = g.loopAsIntended;
    L.push(`     full loop     AS WRITTEN (sim :1708, stall when deep - gapPrev > -0.02)  ${lw.iters} pass(es) · ${lw.nudges} nudge · exits at ${lw.gap.toFixed(3)}px`);
    L.push(`                   AS COMMENTED (sim :1671-75, stall when progress < 0.02px, i.e. deep - gapPrev < 0.02)  ${li.iters} pass(es) · ${li.nudges} nudge · exits at ${li.gap.toFixed(3)}px`);
  }
  L.push(`4 one-damage        replica/event mismatches ${cMismatch}   stuck-flag mismatches ${stuckFlagMismatch}`);
  L.push(`5 spin recoil       flip violations ${flipViol}/${parriesTotal}   magnitude violations ${magViol}   unexplained sign changes ${signLawViol}   zero spins ${zeroSpins}`);
  L.push(`6 counter-rotation  same-dir openings ${spinSameDir}/${spinSameDir + spinOppDir} rounds   base-omega magnitude mismatches ${openMagMismatch}`);

  L.push('');
  L.push(`== projectile law (shots — arrows/orbs/sparks/bolts/boomerangs/stars; sim-internal name 'shot') == (${shotThrown} thrown · ${shotLanded} landed · ${shotSwats} swatted · ${shotRims} rim deaths · ${shotCross} crossed · ${shotCleared} cleared at round rolls · ${shotCatch} caught · ${shotPass} pass-through hits (halo-r39, not departures) · ${shotBounce} ricochets (ricolaw-r41, not departures) · ${shotPin} nailed (pinlaw-r44, not departures))`);
  L.push(`1s damage-on-touch  phantom shot hits ${shotPhantom}/${shotLanded}   worst death gap ${f2(shotWorstGap)} (must be <= 0)`);
  L.push(`2s swat = touch     swats without touch ${swatNoTouch}/${shotSwats}   swat-gap range [${f2(swatBestGap)}, ${f2(swatWorstGap)}] (must be <= 0)`);
  L.push(`3s shots lose all  rendered-frame shot overlaps: blade ${shotRenderBlade} · body ${shotRenderBody} · rim ${shotRenderRim} · pair ${shotRenderPair} over ${shotEntryFrames} shot-bearing frames   worst depth ${shotRenderWorst ? shotRenderWorst.toFixed(3) + 'px' : 'n/a'}   chain-foe shot checks ${chainShotEntries}`);
  L.push(`4s accounting       shots lost without an event ${shotLost}   departures without a fire ${shotOrphan}   double departures ${shotDeathDup}`);
  if (dupAll.length) {
    const A = dupAll.filter(x => x.d.mech === 'A-doubleGone').length, Bm = dupAll.length - A;
    L.push(`   duplicate mechanisms  A addGone fired twice ${A} · B gone-yet-still-in-flight at battle end ${Bm}`);
    for (const { d, ref } of dupAll.slice(0, 50)) L.push(`   4s duplicate ATTRIBUTED  ${d.mech} sid ${d.sid} at ${ref.cell || 'natural'} seed ${ref.seed} t${d.t} — first marked gone by "${d.first.kind}" at t${d.first.t}${d.kind ? `, then again by "${d.kind}" at t${d.t}` : ''}${d.over !== undefined ? `, battle over: ${d.over}` : ''}`);
    if (dupAll.length > 50) L.push(`   …and ${dupAll.length - 50} more duplicate departure(s)`);
  }
  L.push(`5s substep budget   budget violations ${budgetViol}   maxSub engagements ${maxSubEngaged}`);
  L.push(`6s launch doctrine  off-point launches ${launchOffMid}/${shotThrown}   worst offset ${launchWorst.toFixed(4)}px (must be 0) — radial hold: tip; tangential: middle (+off for radial-fire); knives: three volley tips with rim clamp; copy kinds: art centre (phase-3 doctrines 2026-10-25)`);
  L.push(`7s RETIRED (allcut-r62)  melee hits by projectile-weapon spines ${rangedMeleeHits}/${hitsTotal} (visibility — legal since the owner's 2026-11-02 ruling)   knock-only shoves ${rangedShoves} (structural 0 — the class is gone)`);

  L.push('');
  L.push('== checks ==');
  L.push(results.length
    ? `[${pf(term === SEEDS)}] ${term}/${SEEDS} battles end with a winner inside the ${BUDGET_SEC}s budget (KO-only, no timer) — EXPECTED RED until the balance pass: shield+shield cannot terminate (open question 1, owner-deferred 2026-10-19)`
    : `[SKIP] natural-roll termination (matrix-only part)`);
  L.push(deterministic === null
    ? `[SKIP] determinism (not in this tier's battle set — the replays ride with --quick/--full runs)`
    : `[${pf(deterministic)}] determinism: same seed → identical battle`);
  L.push(results.length
    ? `[${pf(Math.max(...gaps) <= 5)}] no combat stall >5s (worst ${Math.max(...gaps).toFixed(2)}s)`
    : `[SKIP] combat stall (matrix-only part)`);
  L.push(results.length
    ? `[${pf(Math.max(...bLens) <= 300)}] no battle longer than 300s (max ${Math.max(...bLens).toFixed(1)}s) — EXPECTED RED until the balance pass: pure-projectile mirror cells (2026-10-19 probe: 3/18 no winner in 300s)`
    : `[SKIP] battle length (matrix-only part)`);
  if (forcedTotal) L.push(`[${pf(forcedTerm === forcedTotal)}] all ${forcedTotal} forced-cell battles terminate inside the ${BUDGET_SEC}s budget — EXPECTED RED until the balance pass: shield+shield cannot terminate and some projectile mirrors exhaust it (open question 1)`);
  L.push(`[${pf(phantomHits === 0)}] contact law 1: damage only on weapon-touches-body (0 phantom hits)`);
  L.push(`[${pf(parryNoTouch === 0)}] contact law 2: parry only on exact weapon-weapon touch (0 fired with slack)`);
  if (polyTicks) L.push(`[${pf(polyBandWorst < 6 && (polyOverlapVis - polyFlipVis) / Math.max(1, polyTicks) <= 0.02)}] contact law 3: VISIBLE rendered interpenetration (deeper than the 3px ink outline, >2.5px) worst ${polyWorst.toFixed(3)}px (<6px) on ${polyOverlapVis}/${polyTicks} fight-ticks (<=2%) — the disclosed infeasible-pin band (calibration history in the archive); mutation-tested with the resolver disabled at 22.83px worst. Sub-ink overlaps (<=2.5px, inks crossing = contact visible, depth inside the outline) are the disclosed pin-whip transient (2026-10-21 amendment): ${polyOverlap}/${polyTicks} (${f2(100 * polyOverlap / Math.max(1, polyTicks))}%), worst ${polyWorst.toFixed(3)}px. BOTH figures now exclude the named edge-leading MIRROR class (2026-10-28): the band is judged on the ${polyTicks} rendered ticks, excluding the overlaps the mechanism explains (worst ${polyBandWorst.toFixed(3)}px, visible ${polyOverlapVis - polyFlipVis}), and the mirror class is disclosed separately at ${polyFlipOverlap} overlap(s) / ${polyFlipVis} visible / worst ${polyFlipWorst.toFixed(3)}px — proven per occurrence (a parry at the previous tick's last substep + a flagged weapon + the pre-flip pose clearing the ink), a consequence of the owner-accepted CFG.flipMs trade (sim hitbox at truth, art sweeping over 180ms), and measured never drawn: .qa/chainlaw.mjs Part F's worst drawn gap across the sweep is -0.149px, sub-ink. The class is NOT depth-gated — a shift bound would be vacuous (the javelin's mirror moves its butt circles 144px) — so it is reported in full and any growth in its count is the regression signal`);
  L.push(`[${pf(flMissing === 0)}] harness chain-pose integrity (2026-10-28): every chain-weapon law recompute got the sim's own stored pose — events aFl/bFl/fFl, G.auditFl rows per substep, the stashed entry pose for laws 3/3s — 0 missing across ${chainPoseTicks} rendered chain ticks + ${chainPoseSubs} chain substeps + ${chainShotEntries} chain-foe shot checks, so no recompute silently degraded to the rigid spine (the cause of the 2026-10-27 red set; instrument .qa/chainlaw.mjs)`);
  L.push(`[${pf(cMismatch === 0 && stuckFlagMismatch === 0)}] contact law 4: one damage per touch, re-arm only after clearing the body AND deep-disengaging (peak clearance >= reArmDeep or >= reArmWait ticks out — owner 2026-10-23; projectile-weapon spines and the shield shove without damage, gate included — replica mirrors the sim gate exactly, owner 2026-10-19)`);
  L.push(`[${pf(flipViol === 0 && magViol === 0 && signLawViol === 0 && zeroSpins === 0)}] contact law 5: every parry recoils both spins; spins change sign ONLY at parries; never zero`);
  L.push(`[${pf(spinSameDir === 0 && openMagMismatch === 0)}] contact law 6: every round opens counter-rotating`);
  L.push(`[${pf(shotPhantom === 0)}] projectile law 1s: shot damage only on shot-touches-body (0 phantom shot hits)`);
  L.push(`[${pf(swatNoTouch === 0)}] projectile law 2s: swats only on exact shot-blade touch (core law 5's sign audit proves swats flip nothing)`);
  L.push(`[${pf(shotRenderBlade + shotRenderBody + shotRenderRim + shotRenderPair === 0 && shotRenderWorst < 1)}] projectile law 3s: shots never overlap blade/body/rim/shot on a rendered frame`);
  L.push(`[${pf(shotLost === 0 && shotOrphan === 0 && shotDeathDup === 0)}] projectile law 4s: every shot accounted for — exactly one proven departure per shot`);
  L.push(`[${pf(budgetViol === 0 && maxSubEngaged === 0)}] projectile law 5s: substep budget honored every tick — the shot detection guarantee holds (projectile term covers the worst shot-vs-shot PAIR since the 2026-10-19 mixed-speed fix)`);
  L.push(`[${pf(launchOffMid === 0)}] projectile law 6s: every shot is born at its hold-derived launch point (radial: spine tip · tangential: middle +off — launch doctrine, owner 2026-10-19)`);
  L.push(`[----] projectile law 7s RETIRED at allcut-r62 — every weapon cuts on body touch (owner 2026-11-02); rangedMeleeHits ${rangedMeleeHits} is visibility, not a law (parry + swat unchanged)`);
  L.push('');
  if (results.length) {
    L.push(`== targets (descriptive — owner-deferred, not hygiene) ==`);
    L.push(`battle length   median ${median(bLens).toFixed(1)}s vs the 1min+ video target (battle only; platform intro/outro add time)`);
    L.push(`ridiculousness  buzzsaw spin (≥25 rad/s) reached in ${buzz}/${SEEDS} battles`);
  }

  if (verbose) {
    L.push('');
    L.push('== per seed ==');
    for (const r of results) {
      L.push(`seed ${String(r.seed).padStart(3)}  winner ${String(r.winner).padEnd(7)} rounds ${r.roundsPlayed}  len ${r.battleSec.toFixed(0).padStart(3)}s  [${r.rounds.map(x => `${x.combo}:${api.FIGHTERS[x.winner].id.slice(0, 4)}@${x.sec.toFixed(0)}s`).join(' ')}]  hits ${r.hits} parries ${r.parries} gap ${r.maxCombatGapSec.toFixed(1)}s spin ${r.maxSpin.toFixed(0)} dmg ${r.maxDmg.toFixed(0)} shots ${r.shots.thrown}/${r.shots.landed}/${r.shots.swatted}`);
    }
  }
  const reportText = L.join('\n');
  /* Guard A2b (2026-10-28, third net): NaN/undefined INSIDE THE LAW BLOCK means a counter never
   * merged. Scoped on purpose — the combo-matrix table precedes this marker and legitimately
   * prints `med NaNs` for a cell that completes zero rounds (shield+shield). */
  const lawAt = reportText.indexOf('== core contact law ==');
  if (lawAt >= 0) {
    const lawText = reportText.slice(lawAt);
    for (const bad of ['NaN', 'undefined']) {
      const at = lawText.split('\n').findIndex(l => l.includes(bad));
      if (at >= 0) throw new Error(`measure: law block line ${at + 1} contains "${bad}" — a counter never merged:\n  ` + lawText.split('\n')[at].slice(0, 200));
    }
  }
  console.log(reportText);
}

/* ---------------- battle list + worker pool ---------------- */

/* The canonical battle list — one source of truth for what runs, in the old
 * sequential order: natural rolls first (seeds 1..SEEDS), then the forced
 * matrix in sorted-ids cell order x shared seed order (101..108), then the
 * two determinism replays. Slot order = execution-order history, so the
 * assembled result arrays (and their float aggregations) are identical to
 * the pre-parallel harness. Tiers (--quick/--vs/--cells) filter the matrix;
 * natural + determinism always run. */
function buildBattleList(ids, opts) {
  const list = [];
  if (!opts.matrixOnly) for (let s = 1; s <= SEEDS; s++) list.push({ kind: 'natural', seed: s, weapons: null, cell: null });
  if (opts.mode === 'solidity') {
    for (const key of SOLIDITY_CELLS) {
      const [w0, w1] = key.split('+');
      for (let s = 101; s < 101 + SOLIDITY_SEEDS; s++) list.push({ kind: 'forced', seed: s, weapons: [w0, w1], cell: key });
    }
  } else if (opts.mode !== 'quick') {
    for (const w0 of ids) for (const w1 of ids) {
      const key = w0 + '+' + w1;
      if (opts.mode === 'vs' && w0 !== opts.arg && w1 !== opts.arg) continue;
      if (opts.mode === 'cells' && !opts.arg.has(key)) continue;
      for (let s = 101; s < 101 + FORCED_SEEDS; s++) list.push({ kind: 'forced', seed: s, weapons: [w0, w1], cell: key });
    }
  }
  if (!opts.matrixOnly && opts.mode !== 'solidity') {   // determinism replays ride with the naturals/full parts
    list.push({ kind: 'det', seed: 1, weapons: null, cell: null });
    list.push({ kind: 'det', seed: 1, weapons: null, cell: null });
  }
  return list;
}

/* Worker pool with a dynamic pull queue: battle costs vary more than 10x
 * (shot-mirror cells burn the whole budget), so a static split would idle
 * most workers behind one straggler. A shared cursor (SharedArrayBuffer +
 * Atomics) hands the next battle to whichever worker is free. Each worker
 * accumulates the law counters locally and returns them with its per-battle
 * results, keyed by list index. Progress goes to stderr; the report on
 * stdout stays clean copy-paste material. */
function runOnWorkers(file, list, n, bandDump) {
  return new Promise((res, rej) => {
    const sab = new SharedArrayBuffer(4);
    const msgs = new Array(n);
    const progress = new Array(n).fill(0);
    let exited = 0, failed = false;
    for (let w = 0; w < n; w++) {
      const worker = new Worker(fileURLToPath(import.meta.url), { workerData: { file, list, sab, bandDump } });
      worker.on('message', m => {
        if (m.acc === undefined) { progress[w] = m.p; printProgress(progress, list.length); return; }
        msgs[w] = m; progress[w] = m.n; printProgress(progress, list.length);
      });
      worker.on('error', e => { if (!failed) { failed = true; rej(e); } });
      worker.on('exit', code => {
        if (failed) return;
        if (code !== 0) { failed = true; rej(new Error(`worker ${w} exited with code ${code}`)); return; }
        if (++exited === n) res(msgs);
      });
    }
  });
}
function printProgress(progress, total) {
  const done = progress.reduce((a, b) => a + b, 0);
  process.stderr.write(`\rmeasure: ${done}/${total} battles   `);
}

function workerBody() {
  const { file, list, sab, bandDump } = workerData;
  BAND_DUMP = !!bandDump;   // the only worker-side switch --band-dump needs
  const api = loadSim(file);
  const cursor = new Int32Array(sab);
  const out = [];
  let n = 0;
  for (;;) {
    const idx = Atomics.add(cursor, 0, 1);
    if (idx >= list.length) break;
    const b = list[idx];
    out.push({ idx, r: runMatch(api, b.seed, b.weapons) });
    parentPort.postMessage({ p: ++n });   // every battle — the %10 granularity once made a killed run look merely slow (2026-10-19)
  }
  parentPort.postMessage({ acc: accSnapshot(), out, n });
}

function parseArgs(argv) {
  const pos = [], modes = [];
  const opts = { jobs: availableParallelism(), matrixOnly: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--verbose') verbose = true;
    else if (a === '--quick') modes.push({ mode: 'quick' });
    else if (a === '--full') modes.push({ mode: 'full' });
    else if (a === '--vs') modes.push({ mode: 'vs', arg: argv[++i] });
    else if (a === '--cells') modes.push({ mode: 'cells', arg: argv[++i] });
    else if (a === '--solidity') modes.push({ mode: 'solidity' });
    else if (a === '--matrix-only') opts.matrixOnly = true;
    else if (a === '--band-dump') opts.bandDump = true;
    else if (a === '--jobs') { opts.jobs = +argv[++i]; if (!(opts.jobs >= 1)) { console.error('measure: --jobs needs a number >= 1'); process.exit(2); } }
    else if (a.startsWith('--')) { console.error('measure: unknown flag ' + a + ' — see the header usage'); process.exit(2); }
    else pos.push(a);
  }
  if (modes.length > 1) { console.error('measure: pick ONE tier flag (--quick | --full | --vs | --cells)'); process.exit(2); }
  opts.mode = modes.length ? modes[0].mode : 'full';
  opts.arg = modes.length ? modes[0].arg : undefined;
  if (opts.matrixOnly && (opts.mode === 'quick' || opts.mode === 'solidity')) { console.error('measure: --matrix-only works only with matrix tiers (--full/--vs/--cells)'); process.exit(2); }
  if (pos[0]) FILE = resolve(join(here, pos[0]));
  if (pos[1]) SEEDS = +pos[1];
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const api = loadSim(FILE);                 // main loads the boot data only (ids for the list); every battle runs in a worker
  const ids = [...api.WEAPON_IDS].sort();
  if (opts.mode === 'vs' && !ids.includes(opts.arg)) { console.error(`measure: --vs unknown weapon "${opts.arg}" — roster: ${ids.join(', ')}`); process.exit(2); }
  if (opts.mode === 'solidity') {
    for (const key of SOLIDITY_CELLS) {
      const [w0, w1] = key.split('+');
      if (!ids.includes(w0) || !ids.includes(w1)) { console.error(`measure: SOLIDITY_CELLS entry "${key}" names a weapon off the roster (${ids.join(', ')}) — update the list`); process.exit(2); }
    }
  }
  if (opts.mode === 'cells') {
    const set = new Set();
    for (const c of String(opts.arg || '').split(',')) {
      const key = c.trim();
      if (!key) continue;
      const [w0, w1] = key.split('+');
      if (!ids.includes(w0) || !ids.includes(w1)) { console.error(`measure: --cells unknown weapon in "${key}" — roster: ${ids.join(', ')}`); process.exit(2); }
      set.add(key);
    }
    if (!set.size) { console.error('measure: --cells needs a list like staff+wand,wand+bow'); process.exit(2); }
    opts.arg = set;
  }
  const nCells = opts.mode === 'full' ? ids.length * ids.length
    : opts.mode === 'vs' ? ids.length * 2 - 1
    : opts.mode === 'cells' ? opts.arg.size
    : opts.mode === 'solidity' ? SOLIDITY_CELLS.length : 0;
  opts.modeLabel = opts.mode === 'full' ? `FULL — forced matrix ${nCells} cells x ${FORCED_SEEDS} seeds`
    : opts.mode === 'quick' ? 'QUICK — natural rolls only (no forced matrix)'
    : opts.mode === 'vs' ? `VS ${opts.arg} — ${nCells} cells x ${FORCED_SEEDS} seeds`
    : opts.mode === 'solidity' ? `SOLIDITY — naturals ${SEEDS} + the ${nCells}-cell overlap gauntlet x ${SOLIDITY_SEEDS} seeds (tunneling/overlap focus; every law still audited)`
    : `CELLS ${[...opts.arg].join(',')} — ${nCells} cells x ${FORCED_SEEDS} seeds`;
  if (opts.matrixOnly) opts.modeLabel += ' · MATRIX-ONLY (no naturals, no determinism — a chunk of a split baseline)';
  runAll(api, opts).catch(e => { console.error('\nmeasure: ' + ((e && e.stack) || e)); process.exit(1); });
}

if (isMainThread) main();
else workerBody();
