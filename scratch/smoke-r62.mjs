// scratch/smoke-r62.mjs — allcut-r62 landing smoke (lean, asserted, ~30s budget per the process law)
// PART A — THE BEND AT THE r62 RATES (the owner's eye: "i think it should bend more and also the
//   wand projectiles should be a bit bigger"): the r61 law suite re-asserted at base 0.9 / rate
//   0.15 / cap 2.4 (all read LIVE off the row, so the mirror can never drift from the build),
//   plus the BIGGER-SPARK law: every spark's birth radius === the runtime-scaled W.shot.r (8 × 1.3).
// PART B — ALLCUT, THE NEW CORE LAW (owner ruling 2026-11-02: "all weapons from now on deals
//   damage if they touch the opponets body… launchers are boring to watch in the beginning as they
//   have a hard time hitting the opponents and gaining growth"): the projectile rule and the
//   shield's tangential no-damage clause are RETIRED —
//   law B1: launcher-holders land SPINE hits (hit events without e.shot) that deal damage > 0
//   law B2: the shield cuts — spine hits by the shield holder, and its trait.dmg 0.7 (inert since
//          birth: grow() only fires on a damaging hit and the shield could never land one) is
//          LIVE — some shield-holder hit event carries e.dmg > 1 (grown past the WDEF base 1)
//   law B3: the spine hit feeds growth — every damaging hit (spine included) advances the shared
//          counter, so the wand's bend mirror counts spine hits exactly as grow() does, and some
//          spark bends strictly past base in cells where spines landed
//   law B4: regressions stand — parries still fire, the boomerang's catch still fires, hp never
//          NaNs, no vanish without an end event on the wand sparks
import { loadAPI } from './loader-r54.mjs';
const { newGame, tick, WEAPONS, CFG } = loadAPI();

const BASE = 0.9, RATE = 0.15;   // ALIGNED (hexfam-r68 — the measure.mjs / r65-hex precedent): was `WEAPONS.wand.shot.turn` / `.trait.turn` live off the row; hexfam-r68 RETIRED both fields — the bend is derived in bornBend as (HEXFAM.base 0.9 + HEXFAM.grow 0.15 × min(shotStep, TURN_STEPS 10)) × speed ÷ HEXFAM.ref 800. For the WAND k = 800/800 = 1 exactly, so the r62 rates (0.9 / 0.15 / cap 2.4) stand as literals here and this smoke pins them exactly as before — the family derivation itself is smoke-r68's job.
const CAP = BASE + RATE * 10;                                          // TURN_STEPS mirrored = 10 → 2.4
const SPARK_R = WEAPONS.wand.shot.r;                                   // runtime-scaled birth radius (8 × weaponScale)

let sparks = 0, signPos = 0, signNeg = 0, formulaViol = 0, frozenViol = 0, capViol = 0, rViol = 0;
let grewPastBase = 0, curveChecked = 0, curveViol = 0, speedViol = 0, controlViol = 0;
let rimEnds = 0, swatEnds = 0, hitEnds = 0, vanish = 0;
let parries = 0, catches = 0, nan = 0;
const spineHits = {};        // per-cell label: spine (non-shot) hits by launcher/shield holders
let shieldCut = 0, shieldGrewDmg = 0, spineZeroDmg = 0;

function runBendCell(label, seed, weapons, ticks, spineSlots) {
  const G = newGame(seed, { weapons });
  const stepMirror = [0, 0];
  const sidOwn = new Map(), sidWand = new Map(), sidExpect = new Map(), sidTurn = new Map(), sidHead = new Map(), sidAlive = new Map();
  spineHits[label] = [0, 0];
  for (let t = 0; t < 120 * ticks; t++) {
    tick(G);
    for (const e of G.events) {
      if (e.kind === 'shotFire') {
        sidOwn.set(e.sid, e.by);
        // the expected magnitude is LATCHED AT EVENT TIME: fireShots runs before shotStep, so a
        // spark born in the same tick as its holder's hit carries the PRE-hit counter
        if (WEAPONS[G.fighters[e.by].weapon] === WEAPONS.wand) {
          sidWand.set(e.sid, true);
          sidExpect.set(e.sid, BASE + RATE * Math.min(stepMirror[e.by], 10));
        }
      }
      else if (e.kind === 'hit') {
        const row = G.fighters[e.by] && WEAPONS[G.fighters[e.by].weapon];
        if (e.shot) { if (sidWand.has(e.sid)) hitEnds++; sidAlive.delete(e.sid); }   // a body hit is a flight END — prune so the vanish scan below stays honest
        else {
          // ALLCUT: a spine hit — legal for EVERY weapon now (law B1)
          if (!(e.dealt > 0)) { spineZeroDmg++; console.log('  B1 zero-damage spine hit', label, t, JSON.stringify(e).slice(0, 120)); }
          if (row && (row.shot || row.hold === 'tangential')) spineHits[label][e.by]++;
          if (label === 'shield' && row === WEAPONS.shield) {
            shieldCut++;
            if (e.dmg > 1) shieldGrewDmg++;   // law B2: f.dmg grown past the WDEF base 1 by trait.dmg 0.7 (+ Heavy's skill when the shield rides Heavy)
          }
        }
        if (e.by !== undefined) stepMirror[e.by]++;   // grow() rode this hit — the shared counter (spine hits included since allcut-r62: law B3 is exactly this mirror)
      }
      else if (e.kind === 'parry') parries++;
      else if (e.kind === 'shotCatch') catches++;
      else if (e.kind === 'swat') { if (sidWand.has(e.sid)) swatEnds++; sidAlive.delete(e.sid); }
      else if (e.kind === 'shotRim') { if (sidWand.has(e.sid)) rimEnds++; sidAlive.delete(e.sid); }
      else if (e.kind === 'shotCross') sidAlive.delete(e.sid);
      else if (e.kind === 'roll') { sidOwn.clear(); sidWand.clear(); sidExpect.clear(); sidTurn.clear(); sidHead.clear(); sidAlive.clear(); stepMirror[0] = 0; stepMirror[1] = 0; spineHits[label] = [0, 0]; }
    }
    if (G.phase === 'fight') for (const st of G.shots) {   // the curve law governs the LIVE fight: during the 'ko' pause (and 'over') the fight step never runs and shots deliberately freeze — the round-ending stall rulings
      const row = WEAPONS[G.fighters[st.o].weapon];
      const isWand = row.shot && row.shot.kind === 'spark';
      if (!isWand) { if (st.turn !== 0) { controlViol++; console.log('  CONTROL turn!=0', label, t, st.sid, st.turn); } continue; }
      if (!sidTurn.has(st.sid)) {
        sparks++;
        const mag = sidExpect.has(st.sid) ? sidExpect.get(st.sid) : BASE + RATE * Math.min(stepMirror[st.o], 10);   // flick-r72 alignment below: the wand's birth turn carries the soft fraction
        const magF = mag * ((row.trait && row.trait.flick) ? 0.55 : 1);   // flick-r72: the birth turn scales with the soft launch speed (the birth RADIUS stays on the ladder)
        if (Math.abs(Math.abs(st.turn) - magF) > 1e-12) { formulaViol++; console.log('  FORMULA', label, t, st.sid, st.turn, 'expected ±', magF, 'step', stepMirror[st.o]); }
        if (st.turn > 0) signPos++; else if (st.turn < 0) signNeg++; else { formulaViol++; console.log('  ZERO SIGN', label, t, st.sid); }
        if (Math.abs(st.turn) > CAP + 1e-12) { capViol++; console.log('  CAP', label, t, st.sid, st.turn); }
        if (Math.abs(st.turn) > BASE + 1e-12) grewPastBase++;
        if (Math.abs(st.r - SPARK_R) > 1e-9) { rViol++; console.log('  SPARK-R', label, t, st.sid, st.r, 'want', SPARK_R); }
        sidTurn.set(st.sid, st.turn);
        sidHead.set(st.sid, Math.atan2(st.vy, st.vx));
        sidAlive.set(st.sid, true);
      } else {
        if (st.turn !== sidTurn.get(st.sid)) { frozenViol++; console.log('  REFROZEN', label, t, st.sid); }
        const h = Math.atan2(st.vy, st.vx), prev = sidHead.get(st.sid);
        let dh = h - prev; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
        const want = st.turn / CFG.tickHz;
        curveChecked++;
        /* hexspark-r65 alignment (edited like measure.mjs, per the r62 precedent): the hex's seek shares
         * the SAME turn budget with the birth bend. spellform-r69 RE-ALIGNMENT: the h=0 byte-identical
         * case is RETIRED by the owner's flight-tuning ruling ("i just want it to hit the opponent more")
         * — SEEK_H0 0.3 gives every spell a hunting floor, so the applied rate is ALWAYS the blend
         * (1−h)·turn + h·|turn|·seek and the surviving smoke-level law is the AUTHORITY BOUND
         * |dh| ≤ |want| at every tick (authority is conserved — the never-orbit ceiling; the hunt
         * DIRECTION itself is asserted by smoke-r65's witnesses). */
        if (Math.abs(dh) > Math.abs(want) * 1.05 + 1e-9) { curveViol++; if (curveViol <= 4) console.log('  CURVE-AUTH', label, t, st.sid, dh, 'bound', want); }
        sidHead.set(st.sid, h);
        const sp = Math.hypot(st.vx, st.vy);
        if (row.trait && row.trait.flick ? (sp < WEAPONS.wand.shot.speed * 0.55 - 1e-6 || sp > WEAPONS.wand.shot.speed * 1.45 + 1e-6) : Math.abs(sp - WEAPONS.wand.shot.speed) > 1e-6) { speedViol++; console.log('  SPEED', label, t, st.sid, sp); }   // flick-r72: the crack band [soft, cap-crack]; non-flick rows keep the exact check
      }
    }
    for (const f of G.fighters) if (!isFinite(f.hp) || !isFinite(f.pos.x) || !isFinite(f.pos.y)) nan++;
    const alive = new Set(G.shots.filter(s => s.kind === 'spark').map(s => s.sid));
    for (const sid of [...sidAlive.keys()]) if (!alive.has(sid)) { if (G.phase === 'fight') { vanish++; console.log('  VANISH', label, t, sid); } sidAlive.delete(sid); }   // a spark left the air with NO end event (rim/swat/hit/cross all counted above; battle-end clears are not vanishes)
    for (const sid of alive) sidAlive.set(sid, true);
  }
}

// PART A+B cells: the bend suite on two wand cells; ALLCUT on the launcher pair + the shield; the
// boomerang catch regression rides the hammer cell (the loop's laws are shot-side and untouched)
runBendCell('wandMirror', 83230, ['wand', 'wand'], 40, true);
runBendCell('wandHammer', 3593, ['wand', 'hammer'], 40, true);
runBendCell('wandBow', 4711, ['wand', 'bow'], 40, true);
runBendCell('shield', 555, ['shield', 'sword'], 40, true);
runBendCell('boom', 777, ['boomerang', 'hammer'], 30, true);

const launcherSpines = spineHits.wandMirror[0] + spineHits.wandMirror[1] + spineHits.wandBow[0] + spineHits.wandBow[1];
console.log('A) bend at r62 rates: sparks', sparks, '| BASE', BASE, 'RATE', RATE, 'CAP', CAP.toFixed(2), '| spark r', SPARK_R);
console.log('   formula', formulaViol, 'frozen', frozenViol, 'cap', capViol, 'control', controlViol, 'sparkR', rViol, '(all MUST be 0) | signs +', signPos, '−', signNeg, '| grew past base', grewPastBase, '| curve', curveChecked, 'checks /', curveViol, 'viol | speed viol', speedViol);
console.log('B) ALLCUT: launcher spine hits', launcherSpines, '(MUST be > 0) | zero-damage spines', spineZeroDmg, '(MUST be 0)');
console.log('   shield: spine cuts', shieldCut, '(MUST be > 0) | grown-dmg hits (e.dmg > 1)', shieldGrewDmg, '(MUST be > 0 — trait.dmg 0.7 is LIVE)');
console.log('   per-cell spine hits by shot/tangential holders:', JSON.stringify(spineHits));
console.log('regressions: parries', parries, '| boomerang catches', catches, '(both MUST be > 0) | old spark ends rim/swat/hit', rimEnds, swatEnds, hitEnds, '(all MUST be > 0) | vanish', vanish, '| NaN', nan, '(both MUST be 0)');
const ok = sparks > 20 && formulaViol === 0 && frozenViol === 0 && capViol === 0 && controlViol === 0 && rViol === 0 &&
  signPos > 0 && signNeg > 0 && grewPastBase > 0 && curveChecked > 20 && curveViol === 0 && speedViol === 0 &&
  rimEnds > 0 && swatEnds > 0 && hitEnds > 0 && vanish === 0 && nan === 0 &&
  launcherSpines > 0 && spineZeroDmg === 0 && shieldCut > 0 && shieldGrewDmg > 0 && parries > 0 && catches > 0;
console.log(ok ? 'SMOKE PASS' : 'SMOKE FAIL');
process.exit(ok ? 0 : 1);
