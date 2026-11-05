// scratch/smoke-r79.mjs — emberpool-r79 laws: the projectile is back (family flight), the pool is
// the payload. Lean asserts per #674; all rates PROVISIONAL — the owner's eye judges.
// Run FROM ROOT: node scratch/smoke-r79.mjs
//   the projectile law    every scroll shot is the family spell again: kind 'spell', bent (turn ≠ 0),
//                         no meteor flag — the called fall is gone wholesale
//   the spawn law         a damaging scroll hit leaves exactly one pool where the victim stood AT
//                         THE HIT (tick-end position within 20px: the knock moves them after the
//                         hit substep), owner slot 0, floor never holds more than POOL.cap 6
//   the clock law         each pool's t decrements per fight tick (KO freeze holds the fire)
//   the burn law          a pool burns exactly when its acc was at POOL.tick−1 and the foe's centre
//                         stands within r + half a body: poolBurns moves by exactly that count, the
//                         hp drop equals the sum of their snapshot dmgs (on ticks without a shot
//                         hit), and beats are at least POOL.tick fight ticks apart per pool
//   the zone law          a burn beat grows NOTHING: the caster's shotStep never moves on a burn-only tick
//   the roll law          the roll clears every pool
//   controls              hammer×hammer: zero pools, zero burns; scroll×wand: blooms still bloom
import { loadAPI } from './loader-r54.mjs';
const { newGame, tick, WEAPONS, CFG, FIGHTERS } = loadAPI();
const HZ = CFG.tickHz;
const POOL = { life: 540, r: 62, reach: 0.75, tick: 12, rate: 0.25, cap: 6 };   // mirror of the sim const (burnfix-r84: faster beat + the touch bite)

function run(label, seed, weapons, seconds) {
  const G = newGame(seed, { weapons });
  const R = { label, shots: 0, projBad: 0, spawns: 0, spawnBad: 0, capBad: 0, clockBad: 0,
    burnBad: 0, burnDmgBad: 0, cadenceBad: 0, burns: 0, growBad: 0, rollBad: 0, nan: 0,
    blooms: 0, poolKills: 0, maxPools: 0 };
  const prevAcc = new Map(), prevT = new Map(), prevIn = new Map(), lastBurn = new Map();   // burnfix-r84: prevIn mirrors the entry flag
  const ticks = seconds * HZ;
  for (let t = 0; t < ticks && !G.over; t++) {
    const foe = G.fighters[1], caster = G.fighters[0];
    const prePools = G.stats.pools, preBurns = G.stats.poolBurns, preLanded = G.stats.landed;
    const preStep = caster.shotStep, preHp = foe.hp, preHits = G.stats.hits, prePops = G.stats.emberPops, preAlive = foe.alive;   // kindlingfix-r83: a KILLING burn flips alive before the prediction reads it   // kindling-r82: the pop confound
    const rollsBefore = G.rolls.length;
    for (const p of G.pools) { prevAcc.set(p.sid, p.acc); prevT.set(p.sid, p.t); prevIn.set(p.sid, p.in); }
    const preFight = G.phase === 'fight';   // kindlingfix-r83: the KO tick flips the phase BEFORE the burn it carried — predict off the pre-tick phase
    tick(G);
    if (!Number.isFinite(foe.pos.x) || !Number.isFinite(foe.hp) || !Number.isFinite(caster.spin)) R.nan++;
    const rolled = G.rolls.length > rollsBefore;
    if (rolled) { if (G.pools.length !== 0) R.rollBad++; prevAcc.clear(); prevT.clear(); prevIn.clear(); lastBurn.clear(); }
    const fighting = G.phase === 'fight';
    // projectile law
    for (const st of G.shots) if (st.o === 0) {
      R.shots++;
      if (st.kind !== 'spell' || st.meteor || st.turn === 0) R.projBad++;
    }
    // spawn law + cap
    if (G.stats.pools > prePools) {
      const fresh = G.pools.filter(p => !prevT.has(p.sid));
      if (fresh.length !== G.stats.pools - prePools) R.spawnBad++;
      for (const p of fresh) {
        R.spawns++;
        if (p.o !== 0) R.spawnBad++;
        if (Math.hypot(p.x - foe.pos.x, p.y - foe.pos.y) > 20) R.spawnBad++;   // knock drift after the hit substep
      }
    }
    if (G.pools.length > POOL.cap) R.capBad++;
    R.maxPools = Math.max(R.maxPools, G.pools.length);
    // clock law + burn law (mirror the acc ladder)
    let expectBurns = 0, expectDmg = 0;
    for (const p of G.pools) {
      const pt = prevT.get(p.sid);
      if (pt !== undefined && fighting && pt - p.t !== 1) R.clockBad++;
      // burnfix-r84 — THE TOUCH BITE mirror: the sim's own entry flag is the prediction truth; a burn lands on the ENTRY EDGE
      // (inside now, not inside before — a pool born on its victim has prevIn undefined = false, so its spawn tick bites) or
      // when the acc ladder arrives (pa === tick−1). The GEOMETRY law (flag === position read) runs beside it, skipped on
      // death ticks where the poolStep-time aliveness is unknowable from outside.
      const inSim = p.in === true;
      const pa = prevAcc.get(p.sid), pin = prevIn.get(p.sid) || false;
      const fresh = inSim && !pin;
      if (preFight && inSim && (fresh || pa === POOL.tick - 1)) {
        expectBurns++; expectDmg += p.dmg;
        const lb = lastBurn.get(p.sid);
        if (!fresh && lb !== undefined && t - lb < POOL.tick - 1) R.cadenceBad++;   // entry bites are exempt — the re-arm is the law
        lastBurn.set(p.sid, t);
        if (p.acc !== 0) R.burnBad++;
      }
      if (!inSim && p.acc !== 0) R.burnBad++;                        // stepping off re-arms: outside → acc 0, in false
      if (preFight && foe.alive === preAlive) {
        const geo = preAlive && Math.hypot(foe.pos.x - p.x, foe.pos.y - p.y) <= p.r + CFG.bodyR * POOL.reach;
        if (geo !== inSim) R.burnBad++;
      }
    }
    const dBurns = G.stats.poolBurns - preBurns;
    if (dBurns !== expectBurns) R.burnBad++;
    R.burns += dBurns;
    if (dBurns > 0 && G.stats.landed === preLanded && G.stats.hits === preHits && G.stats.emberPops === prePops && !rolled) {   // burn-only tick: no shot hit, no blade trade, no ember pop (kindling-r82's bite is its own damage species)
      if (Math.abs((preHp - foe.hp) - Math.min(expectDmg, preHp)) > 1e-9) R.burnDmgBad++;   // the killing beat floors at 0 — honest overkill is not a violation
      if (caster.shotStep !== preStep) R.growBad++;          // the zone grows nothing
    }
    if (foe.hp <= 0 && dBurns > 0 && G.stats.landed === preLanded && G.stats.hits === preHits) R.poolKills++;
    for (const f of G.fighters) if (f.figT > 0) R.blooms++;
  }
  return R;
}

const A = run('A scroll×hammer s22459 90s', 22459, ['scroll', 'hammer'], 90);
const B = run('B scroll×wand s4321 60s', 4321, ['scroll', 'wand'], 60);
const C = run('C hammer×hammer s999 30s', 999, ['hammer', 'hammer'], 30);

const struct = R => R.projBad === 0 && R.spawnBad === 0 && R.capBad === 0 && R.clockBad === 0 &&
  R.burnBad === 0 && R.burnDmgBad === 0 && R.cadenceBad === 0 && R.growBad === 0 && R.rollBad === 0 && R.nan === 0;
const okA = struct(A) && A.shots > 20 && A.spawns > 3 && A.burns > 3;
const okB = struct(B) && B.spawns > 0 && B.burns > 0 && B.blooms > 0;
const okC = C.spawns === 0 && C.burns === 0 && C.maxPools === 0 && C.nan === 0 && C.shots === 0;
console.log('A', JSON.stringify(A));
console.log('B', JSON.stringify(B));
console.log('C', JSON.stringify(C));
console.log('SMOKE-R79', okA && okB && okC ? 'PASS' : 'FAIL');
process.exit(okA && okB && okC ? 0 : 1);
