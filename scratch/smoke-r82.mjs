// scratch/smoke-r82.mjs — kindling-r82 THE EMBER SPILL laws (the scroll's trait FILLED; the lane retired).
// Lean asserts per #674; all rates PROVISIONAL — the owner's eye judges. Run FROM ROOT: node scratch/smoke-r82.mjs
//   the cadence law      every fresh scroll shot is born with st.eiv = max(6, 14 − min(shotStep, 8)) (the
//                        effR birth snapshot — the step may move inside the birth tick, so the formula is
//                        checked across {prevStep, curStep}); NO other weapon's shot ever carries eiv/emb
//   the path law         every 'ember' drop event lands on a live scroll shot's prev→cur travel segment
//   the snapshot law     every fresh coal carries glow ∈ {prev,cur step capped}, t = life+lifeAdd·glow
//                        (± the birth tick's own decrement), r = r+rAdd·glow, dmg = max(0.3, dmg×0.125)
//                        off {prevDmg, curDmg} — snapshots at the DROP
//   the disappearance law a coal leaves only three ways: EXPIRY (last-seen t 1), the CAP shift (oldest, at
//                        cap, on a drop tick) or a POP ('emberPop' event at its exact position)
//   the pop law          stats.emberPops moves exactly with the pop events; on pop-only ticks (no hits, no
//                        pool burns, no roll) the foe's hp drops by EXACTLY the summed snapshot dmgs
//   THE GROWTH BRAKE     any fighter's shotStep moves ONLY on a tick where stats.hits moved (the owner's
//                        law: growth rides the meteor's hit alone — a pop grows NOTHING); pop-only ticks
//                        leave shotStep/landed/hits untouched
//   the cap + roll laws  never more than EMBER.cap 14 live coals; the roll clears the floor
//   controls             hammer×hammer: zero drops/pops/coals, no shot ever carries eiv; scroll×wand:
//                        coals + blooms + pools coexist
import { loadAPI } from './loader-r54.mjs';
const { newGame, tick, CFG } = loadAPI();
const HZ = CFG.tickHz;
const ARENA_C = CFG.size / 2;
const EMBER = { drop: 30, dropCut: 2, dropMin: 14, life: 300, lifeAdd: 24, steps: 8, r: 15, rAdd: 0.8, rate: 0.5, cap: 14, scatter: 44 };   // kindlingfix-r83 mirror
const POOLRATE = 0.25, REACH = 0.5;
const eivOf = (step) => Math.max(EMBER.dropMin, EMBER.drop - EMBER.dropCut * Math.min(step, EMBER.steps));

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

function run(label, seed, weapons, seconds) {
  const G = newGame(seed, { weapons });
  const R = { label, drops: 0, pops: 0, burns: 0, blooms: 0, cadenceBad: 0, pathBad: 0, snapBad: 0,
    vanishBad: 0, popHpBad: 0, growBad: 0, capBad: 0, rollBad: 0, statBad: 0, nan: 0, embersMax: 0, fadePops: 0, fxMax: 0, wisps: 0 };
  const liveShots = new Map();   // sid -> { x, y } (the previous tick's position)
  const liveEmbers = new Map();  // eid -> { t, x, y }
  const ticks = seconds * HZ;
  for (let t = 0; t < ticks && !G.over; t++) {
    const caster = G.fighters[0], foe = G.fighters[1];
    const pre = { step0: caster.shotStep, step1: foe.shotStep, dmg: caster.dmg, hp: foe.hp,
      embers: G.stats.embers, pops: G.stats.emberPops, hits: G.stats.hits, landed: G.stats.landed,
      burns: G.stats.poolBurns, rolls: G.rolls.length };
    const prevEmberEids = new Set(liveEmbers.keys());
    tick(G);
    const rolled = G.rolls.length > pre.rolls;
    const fight = G.phase === 'fight';
    if (!Number.isFinite(foe.pos.x) || !Number.isFinite(foe.hp) || !Number.isFinite(caster.spin)) R.nan++;
    const drops = G.events.filter(e => e.kind === 'ember');
    const pops = G.events.filter(e => e.kind === 'emberPop');
    R.drops += drops.length; R.pops += pops.length;
    R.fxMax = Math.max(R.fxMax, G.emberFx.length);
    if (G.emberFx.some(f => f.k === 1)) R.wisps++;
    if (G.stats.embers - pre.embers !== drops.length || G.stats.emberPops - pre.pops !== pops.length) R.statBad++;
    if (rolled) { if (G.embers.length !== 0 || G.emberFx.length !== 0) R.rollBad++; liveEmbers.clear(); }
    R.embersMax = Math.max(R.embersMax, G.embers.length);
    if (G.embers.length > EMBER.cap) R.capBad++;
    // cadence law: fresh shots
    const seenSids = new Set();
    for (const st of G.shots) {
      seenSids.add(st.sid);
      const owner = G.fighters[st.o];
      if (owner.weapon === 'scroll') {
        if (!liveShots.has(st.sid)) {
          const okEiv = st.eiv === eivOf(pre.step0) || st.eiv === eivOf(owner.shotStep);
          if (!okEiv || !(st.emb >= 0 && st.emb < 1)) R.cadenceBad++;
          liveShots.set(st.sid, { x: st.x0, y: st.y0, o: st.o });
        }
      } else if (st.eiv !== undefined || st.emb !== undefined) R.cadenceBad++;
    }
    // path law: every drop sits on a live shot's travel segment this tick
    for (const d of drops) {
      let onPath = false;
      for (const st of G.shots) if (st.o === d.by) {
        const pv = liveShots.get(st.sid) || { x: st.x0, y: st.y0 };
        if (segDist(d.x, d.y, pv.x, pv.y, st.x, st.y) <= 26 + EMBER.scatter) { onPath = true; break; }
      }
      if (!onPath) for (const [, pv] of liveShots) {   // the dropper died inside this tick (hit/rim/swat) — its last known position still bounds the drop
        if (pv.o === d.by && Math.hypot(d.x - pv.x, d.y - pv.y) <= 40 + EMBER.scatter) { onPath = true; break; }
      }
      if (!onPath) R.pathBad++;
      if (Math.hypot(d.x - 600, d.y - 600) > 0) { /* arena centre read below */ }
    }
    for (const d of drops) if (Math.hypot(d.x - ARENA_C, d.y - ARENA_C) > ARENA_C - 9) R.pathBad++;   // rim clamp law
    for (const st of G.shots) liveShots.set(st.sid, { x: st.x, y: st.y, o: st.o });
    for (const sid of [...liveShots.keys()]) if (!seenSids.has(sid)) liveShots.delete(sid);
    // snapshot law: fresh coals
    const nowEids = new Set();
    for (const em of G.embers) {
      nowEids.add(em.eid);
      if (!prevEmberEids.has(em.eid)) {
        const gA = Math.min(pre.step0, EMBER.steps), gB = Math.min(caster.shotStep, EMBER.steps);
        const okGlow = em.glow === gA || em.glow === gB;
        const full = EMBER.life + EMBER.lifeAdd * em.glow;
        const okT = em.t === full || em.t === full - 1;   // the birth tick's own decrement
        const okR = em.r === EMBER.r + EMBER.rAdd * em.glow;
        const dA = Math.max(0.3, pre.dmg * POOLRATE * EMBER.rate), dB = Math.max(0.3, caster.dmg * POOLRATE * EMBER.rate);
        const okDmg = em.dmg === dA || em.dmg === dB;
        if (!okGlow || !okT || !okR || !okDmg) R.snapBad++;
      }
      liveEmbers.set(em.eid, { t: em.t, x: em.x, y: em.y, glow: em.glow });
    }
    // disappearance law: expiry | cap shift (oldest, at cap, drop tick) | pop (event at exact position)
    if (!rolled) {
      const popPos = pops.map(p => p.x + ',' + p.y);
      const ejects = [];
      for (const eid of prevEmberEids) {
        if (nowEids.has(eid)) continue;
        const last = liveEmbers.get(eid);
        const pi = popPos.indexOf(last.x + ',' + last.y);
        if (pi >= 0) { popPos.splice(pi, 1); R.fadePops += (last.t / (EMBER.life + EMBER.lifeAdd * last.glow)) < 1 / 1.8 ? 1 : 0; continue; }   // a pop at its exact position — first, because emberfix-r85 lets a coal pop on its LAST tick
        if (last.t === 1) continue;                                     // honest expiry
        ejects.push(eid);
      }
      if (ejects.length > 0) {                                          // the lace guard: only the OLDEST, only under cap pressure, at most one per drop
        const sortedPrev = [...prevEmberEids].sort((a, b) => a - b).slice(0, ejects.length);
        if (ejects.length > drops.length || !ejects.every(e => sortedPrev.includes(e)) ||
            prevEmberEids.size + drops.length < EMBER.cap) R.vanishBad++;
      }
      // every pop event either matches a seen coal or was a same-tick birth+pop (never seen — allowed)
      // hp law + GROWTH BRAKE on pop-only ticks
      const dHits = G.stats.hits - pre.hits, dBurns = G.stats.burns - pre.burns;
      if (fight && pops.length > 0 && dHits === 0 && dBurns === 0) {
        const dealt = pops.reduce((s2, p) => s2 + p.dealt, 0);
        if (Math.abs((pre.hp - foe.hp) - Math.min(dealt, pre.hp)) > 1e-9) R.popHpBad++;   // the killing pop floors at 0 — honest overkill is not a violation
        if (caster.shotStep !== pre.step0 || foe.shotStep !== pre.step1 || G.stats.landed !== pre.landed) R.growBad++;
      }
      // THE GROWTH BRAKE, global: shotStep moves ONLY where hits moved
      if ((caster.shotStep > pre.step0 || foe.shotStep > pre.step1) && dHits === 0) R.growBad++;
    }
    for (const eid of [...liveEmbers.keys()]) if (!nowEids.has(eid)) liveEmbers.delete(eid);
    R.burns = G.stats.poolBurns;
    if (caster.figT > 0 || foe.figT > 0) R.blooms++;
  }
  return R;
}

const A = run('A scroll×hammer s22459 90s', 22459, ['scroll', 'hammer'], 90);
const B = run('B scroll×wand s4321 60s', 4321, ['scroll', 'wand'], 60);
const C = run('C hammer×hammer s999 30s', 999, ['hammer', 'hammer'], 30);

const struct = R => R.cadenceBad === 0 && R.pathBad === 0 && R.snapBad === 0 && R.vanishBad === 0 &&
  R.popHpBad === 0 && R.growBad === 0 && R.capBad === 0 && R.rollBad === 0 && R.statBad === 0 && R.nan === 0;
const okA = struct(A) && A.drops > 50 && A.pops > 0 && A.burns > 0 && A.fadePops > 0 && A.fxMax > 0 && A.wisps > 0;
const okB = struct(B) && B.drops > 0 && B.blooms > 0;
const okC = struct(C) && C.drops === 0 && C.pops === 0 && C.embersMax === 0;
console.log('A', JSON.stringify(A));
console.log('B', JSON.stringify(B));
console.log('C', JSON.stringify(C));
console.log('SMOKE-R82', okA && okB && okC ? 'PASS' : 'FAIL');
process.exit(okA && okB && okC ? 0 : 1);
