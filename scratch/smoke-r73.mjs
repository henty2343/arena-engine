// scratch/smoke-r73.mjs — the bloom laws (bloom-r73 → bloomfix-r76), amended each round at the
// owner's eye. Lean asserts per #674; all rates PROVISIONAL — the owner's eye judges.
//   the do-nothing law   a bloomed slot emits no melee hit, no shotFire, no swat, no catch, no parry
//                        (window-START tick exempt: the bloom may land after the slot's own action
//                        inside one tick); shot:true hits BY a bloomed slot are LEGAL (in-flight honesty)
//   the rotation law     window figObjs follow the G.figIdx cycle 0,1,2,3,4,5,0,… (zero rng draws)
//   the cap law          figT never exceeds FIG.cap × Hz (6.0s); same object for the whole window
//   the close law        natural expiry: poof arms at 20 AND figWait = immune×Hz−1 (the 2s silence);
//                        rim shake-off (bloomfix-r76: the OBJECT's silhouette touches the rim): poof
//                        arms at 20 AND figWait = 0 (no silence — he knocked it off himself)
//   the stored-shot law  a bloomed WAND's fireAcc never passes need; at need when the poof lands, a
//                        shotFire by that slot follows within 3 ticks
//   THE DEAD-HIT LAW (bloomfix-r76, owner seed 22459: "wand hit it and nothing happend") — a wand hit
//                        on a foe that stood at figT 0 and figWait ≤ 1 at the previous tick's end MUST
//                        leave that foe bloomed at this tick's end (kills exempt); the immunity may
//                        never eat a hit it has no business eating
//   controls             hammer×hammer: zero blooms; every cell: NaN sanity
import { loadAPI } from './loader-r54.mjs';
const { newGame, tick, WEAPONS, CFG, FIGHTERS } = loadAPI();
const HZ = CFG.tickHz;
const DOSE = WEAPONS.wand.trait.fig;            // 3.0
const CAP = 6.0 * HZ, IMMUNE = 2.0 * HZ, POOF = 20, SLOW = 0.35;   // bloomfix-r77: FIG.slow — the bloomed sweep fraction
const TAU = Math.PI * 2;

function needOf(f) {
  const W = WEAPONS[f.weapon];
  if (!W.shot) return Infinity;
  const smul = 1 + (W.shot.mult || 0) + ((FIGHTERS[f.idx].skill && FIGHTERS[f.idx].skill.shotMult) || 0)
    + ((W.trait && W.trait.mult) || 0) * Math.min(f.shotStep, 10);
  return TAU * (W.shot.revs || 1) / (smul > 0 ? smul : 1);
}

function run(label, seed, weapons, ticks, opts = {}) {
  const G = newGame(seed, { weapons });
  const R = {
    label, windows: [], objSeq: [], doNothingViol: [], inflightLandings: 0, capBad: 0,
    immuneBad: [], closeBad: 0, bankBad: 0, storedOk: 0, storedBad: 0, objSwapBad: 0,
    nan: 0, extended: 0, parryDuringBloom: 0, blooms: 0, rimPops: 0, expiries: 0,
    deadHits: [], rotBad: 0, slowBad: 0,
  };
  const W = { 0: null, 1: null };                // live window per slot
  const Q = { 0: { t: 0, w: 0 }, 1: { t: 0, w: 0 } };   // current tick-end fig state
  const Qp = { 0: { t: 0, w: 0 }, 1: { t: 0, w: 0 } };  // PREVIOUS tick-end (the dead-hit law reads this one — an extension hit must not read the post-pop state of its own tick)
  const WA = { 0: null, 1: null };                       // bloomfix-r77: previous tick-end wAngle (the lazy-sweep law)
  const pending = [];                            // stored-shot proofs { slot, deadline }
  const rolls = [];                              // round-roll ticks (G.rolls grows)
  let rollsSeen = 0;
  const doseT = DOSE * HZ;

  for (let t = 0; t < ticks && !G.over; t++) {
    tick(G);
    if (G.rolls.length > rollsSeen) {            // a REAL round roll: the bloom resets (LAW)
      rolls.push(G.t); pending.length = 0; rollsSeen = G.rolls.length;
      for (const sl of [0, 1]) if (W[sl] && W[sl].end === null) { W[sl].end = G.t; W[sl] = null; }
    }
    Qp[0].t = Q[0].t; Qp[0].w = Q[0].w; Qp[1].t = Q[1].t; Qp[1].w = Q[1].w;
    const startTicks = { 0: false, 1: false };
    for (const f of G.fighters) {
      const s = f.slot;
      if (!Number.isFinite(f.pos.x) || !Number.isFinite(f.pos.y) || !Number.isFinite(f.hp) || !Number.isFinite(f.fireAcc)) R.nan++;
      if (f.figT > 0) {
        if (!W[s]) {
          W[s] = { slot: s, weapon: f.weapon, start: G.t, obj: f.figObj, maxFigT: f.figT, end: null };
          R.windows.push(W[s]); R.objSeq.push(f.figObj); R.blooms++;
          startTicks[s] = true;
        } else {
          if (f.figObj !== W[s].obj) R.objSwapBad++;                       // same object for the whole window
          W[s].maxFigT = Math.max(W[s].maxFigT, f.figT);
          if (W[s].maxFigT > CAP + 1e-6) R.capBad++;
          if (f.weapon === 'wand' && f.fireAcc > needOf(f) + 1e-9) R.bankBad++;   // the ONE stored shot
        }
      } else if (W[s] && W[s].end === null) {
        W[s].end = G.t;
        const rim = Q[s].t > 1;                                            // closed with time left = the object met the rim
        W[s].closeKind = rim ? 'rim' : 'expiry';
        if (rim) R.rimPops++; else R.expiries++;
        if (G.phase === 'fight') {
          if (f.figPoof !== POOF - 1) R.closeBad++;                        // the poof ring arms at 20, ticks down in the same pass
          if (rim ? f.figWait !== 0 : f.figWait !== IMMUNE - 1) R.closeBad++;   // the close law: silence after expiry only
        }
        if (W[s].maxFigT > doseT + 1e-6) R.extended++;
        if (W[s].weapon === 'wand' && f.fireAcc >= needOf(f) - 1e-9 && G.phase === 'fight') pending.push({ slot: s, deadline: G.t + 3 });
        W[s] = null;
      }
      if (f.figT > 0 && Q[s].t > 0 && WA[s] !== null && f.nudgeTick !== G.t && !f.chill && G.phase === 'fight') {   // bloomfix-r77 — THE LAZY SWEEP law (steady fight-phase bloom ticks only: the start tick sweeps part-tempo before the hit lands by construction, and the KO freeze stops the sweep wholesale): a bloomed sweep advances at exactly FIG.slow of tempo (nudge spikes and chilled ticks exempt — lean, witnessed elsewhere)
        let da = f.wAngle - WA[s];
        while (da > Math.PI) da -= 2 * Math.PI;
        while (da < -Math.PI) da += 2 * Math.PI;
        if (Math.abs(Math.abs(da) - Math.abs(f.spin) * SLOW / HZ) > 1e-9) R.slowBad++;
      }
      WA[s] = f.wAngle;
      Q[s].t = f.figT; Q[s].w = f.figWait;
    }
    for (const e of G.events) {
      if (e.kind === 'hit' && e.shot) {
        const shooter = G.fighters[e.by];
        if (shooter && shooter.figT > 0) R.inflightLandings++;             // legal — the past is honest
      }
      if (e.kind === 'hit' && !e.kill) {                                   // THE DEAD-HIT LAW
        const atk = G.fighters[e.by], vic = G.fighters[e.to];
        if (atk && atk.weapon === 'wand' && vic && Qp[e.to].t === 0 && Qp[e.to].w === 0 && vic.figT <= 0) {
          R.deadHits.push({ tick: e.tick, to: e.to, w: Qp[e.to].w });
        }
        continue;
      }
      let actor = -1;
      if (e.kind === 'hit' || e.kind === 'shotFire' || e.kind === 'swat' || e.kind === 'shotCatch') actor = e.by;
      if (e.kind === 'parry') {
        for (const f of G.fighters) if (f.figT > 0 && !startTicks[f.slot]) R.parryDuringBloom++;
        continue;
      }
      if (e.kind === 'shotFire' && pending.some((p) => p.slot === e.by)) { R.storedOk++; pending.splice(pending.findIndex((p) => p.slot === e.by), 1); }
      if (actor >= 0) {
        const f = G.fighters[actor];
        if (f && f.figT > 0 && !startTicks[actor]) R.doNothingViol.push({ kind: e.kind, tick: e.tick, slot: actor });
      }
    }
  }
  R.storedBad = pending.length;
  for (const s of [0, 1]) {
    const ws = R.windows.filter((w) => w.slot === s && w.end !== null);
    for (let i = 1; i < ws.length; i++) {
      if (rolls.some((rt) => rt > ws[i - 1].end && rt < ws[i].start)) continue;   // a roll resets immunity (LAW)
      if (ws[i - 1].closeKind === 'rim') continue;                                 // a shaken-off bot owns no silence — re-bloom at once is lawful (r76)
      const gap = ws[i].start - ws[i - 1].end;
      if (gap < IMMUNE - 2) R.immuneBad.push({ slot: s, gap });
    }
  }
  for (let i = 1; i < R.objSeq.length; i++) if (R.objSeq[i] !== (R.objSeq[i - 1] + 1) % 6) R.rotBad++;
  if (opts.control) {
    R.fail = R.blooms !== 0 || R.nan !== 0;
  } else {
    R.fail = R.doNothingViol.length || R.capBad || R.closeBad || R.bankBad || R.storedBad || R.deadHits.length ||
      R.objSwapBad || R.rotBad || R.immuneBad.length || R.parryDuringBloom || R.slowBad || R.nan !== 0;
    if (R.blooms === 0) R.fail = true;
  }
  console.log(`── ${label}: blooms ${R.blooms} · viol ${R.doNothingViol.length} · cap ${R.capBad} · close ${R.closeBad} · immune ${R.immuneBad.length} · bank ${R.bankBad} · stored ${R.storedOk}/${R.storedBad} · rotBad ${R.rotBad} · objSwap ${R.objSwapBad} · extended ${R.extended} · rim/exp ${R.rimPops}/${R.expiries} · slowBad ${R.slowBad} · deadHits ${R.deadHits.length} · inflight ${R.inflightLandings} · parry ${R.parryDuringBloom} · nan ${R.nan} → ${R.fail ? 'FAIL' : 'PASS'}`);
  if (R.objSeq.length) console.log(`   objSeq: ${R.objSeq.join(',')}`);
  if (R.deadHits.length) console.log('   dead hits:', JSON.stringify(R.deadHits.slice(0, 6)));
  if (R.doNothingViol.length) console.log('   first viols:', JSON.stringify(R.doNothingViol.slice(0, 5)));
  if (R.immuneBad.length) console.log('   immune gaps:', JSON.stringify(R.immuneBad.slice(0, 5)));
  return R;
}

const A = run('A wand×hammer s4321 60s', 4321, ['wand', 'hammer'], 60 * HZ);
const B = run('B wand×tome s77 45s', 77, ['wand', 'tome'], 45 * HZ);
const C = run('C hammer×hammer s9 20s (control)', 9, ['hammer', 'hammer'], 20 * HZ, { control: true });
const D = run('D wand×wand s5150 60s (stored shot)', 5150, ['wand', 'wand'], 60 * HZ);
const E = run('E wand×hammer s22459 60s (the owner\'s seed)', 22459, ['wand', 'hammer'], 60 * HZ);
const ok = !A.fail && !B.fail && !C.fail && !D.fail && !E.fail;
console.log(ok ? 'SMOKE-R73 PASS' : 'SMOKE-R73 FAIL');
process.exit(ok ? 0 : 1);
