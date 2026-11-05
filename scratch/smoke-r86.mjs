// scratch/smoke-r86.mjs — longchain-r86 THE LONG CHAIN laws (the flail's trait FILLED).
// Lean asserts per #674; the rate 0.025 is PROVISIONAL — the owner's eye judges. Run FROM ROOT: node scratch/smoke-r86.mjs
//   the row law       flail trait.len === 0.025, growMax 1.39, and 1 + rate·LEN_STEPS ≤ growMax (the boot gate's arithmetic, mirrored)
//   the pitch law     every fight-phase tick-end, a LIVE chain fighter's particles sit at EXACTLY the grown
//                     pitches: |Pk − P(k−1)| = len[k]·mul for k ≥ 1, mul = 1 + trait.len·min(lenStep, 12) —
//                     sim (flailStep rods), pose (flailPose) and frames (chainFrames → hitbox + art) read ONE factor
//   the growth law    lenStep moves ONLY on ticks where stats.hits moved (Δ ≤ Δhits), never backwards except on
//                     a roll, never past LEN_STEPS 12; cell A reaches step ≥ 3 (non-trivial growth)
//   the reset law     a roll returns lenStep to 0 (the pitches then follow via the pitch law at mul 1)
//   the controls      nunchaku: lenStep 0 forever (no trait.len → grow() skips); determinism: same seed replays identical
import { loadAPI } from './loader-r54.mjs';
const { newGame, tick, CFG, WEAPONS } = loadAPI();
const HZ = CFG.tickHz;
const LEN_STEPS = 12;

// the row law
{
  const t = WEAPONS.flail.trait, ch = WEAPONS.flail.chain;
  if (t.len !== 0.025) throw new Error(`row law: flail trait.len ${t.len} !== 0.025`);
  if (ch.growMax !== 1.39) throw new Error(`row law: flail growMax ${ch.growMax} !== 1.39`);
  if (1 + t.len * LEN_STEPS > ch.growMax) throw new Error('row law: the cap factor tops growMax');
  if (WEAPONS.nunchaku.trait.len) throw new Error('row law: nunchaku must NOT declare trait.len');
}
const mulOf = (w, s) => { const t = WEAPONS[w].trait; return t && t.len ? 1 + t.len * Math.min(s, LEN_STEPS) : 1; };

function run(label, seed, weapons, seconds) {
  const G = newGame(seed, { weapons });
  const R = { label, pitchBad: 0, growBad: 0, capBad: 0, resetBad: 0, ctrlBad: 0, nan: 0, maxStep: 0, steps: [], trail: '' };
  const ticks = seconds * HZ;
  for (let t = 0; t < ticks && !G.over; t++) {
    const pre = { hits: G.stats.hits, rolls: G.rolls.length, steps: G.fighters.map(f => f.lenStep) };
    tick(G);
    const dHits = G.stats.hits - pre.hits;
    const rolled = G.rolls.length > pre.rolls;
    for (let i = 0; i < G.fighters.length; i++) {
      const f = G.fighters[i], W = WEAPONS[f.weapon];
      if (!Number.isFinite(f.pos.x) || !Number.isFinite(f.hp)) R.nan++;
      if (f.lenStep > pre.steps[i]) {
        if (rolled || dHits <= 0 || f.lenStep - pre.steps[i] > dHits) R.growBad++;
      } else if (f.lenStep < pre.steps[i] && !rolled) R.growBad++;
      if (f.lenStep > LEN_STEPS) R.capBad++;
      if (rolled && f.lenStep !== 0) R.resetBad++;
      if (W.chain) {
        if (f.weapon === 'flail') R.maxStep = Math.max(R.maxStep, f.lenStep);
        if (f.weapon !== 'flail' && f.lenStep !== 0) R.ctrlBad++;   // no other chain weapon declares trait.len
        if (f.alive && G.phase === 'fight' && f.fl && W.chain.np >= 2) {
          const mul = mulOf(f.weapon, f.lenStep), ch = W.chain;
          for (let k = 1; k < ch.np; k++) {
            const d = Math.hypot(f.fl.x[k] - f.fl.x[k - 1], f.fl.y[k] - f.fl.y[k - 1]);
            if (Math.abs(d - ch.len[k] * mul) > 1e-6) R.pitchBad++;
          }
        }
      }
    }
    R.steps.push(G.fighters.map(f => f.lenStep).join(','));
    R.trail += `${G.stats.hits};${G.fighters.map(f => f.lenStep).join(',')}\n`;
  }
  return R;
}

let fail = 0;
const done = (R) => {
  const bad = R.pitchBad + R.growBad + R.capBad + R.resetBad + R.ctrlBad + R.nan;
  console.log(`${R.label}: pitchBad ${R.pitchBad} · growBad ${R.growBad} · capBad ${R.capBad} · resetBad ${R.resetBad} · ctrlBad ${R.ctrlBad} · nan ${R.nan} · maxStep ${R.maxStep} → ${bad ? 'FAIL' : 'ok'}`);
  if (bad) fail++;
  return R;
};

console.log('— longchain-r86 · THE LONG CHAIN battery —');
const a1 = done(run('A1 flail×hammer s11 90s', 11, ['flail', 'hammer'], 90));
const a2 = done(run('A2 flail×hammer s2222 90s', 2222, ['flail', 'hammer'], 90));
if (a1.maxStep < 3) { console.log('A1: non-triviality FAIL — flail never reached step 3'); fail++; }
done(run('B nunchaku×katana s33 60s', 33, ['nunchaku', 'katana'], 60));
done(run('C flail×flail s444 60s', 444, ['flail', 'flail'], 60));
done(run('D natural s55 90s', 55, null, 90));

// determinism: A1 replayed must produce an identical (hits, steps) trail
const a1b = run('A1-replay', 11, ['flail', 'hammer'], 90);
if (a1b.trail !== a1.trail) { console.log('determinism FAIL — same seed diverged'); fail++; }
else console.log('determinism: A1 replay identical ✓');
console.log(fail ? `SMOKE-R86 FAIL (${fail})` : 'SMOKE-R86 PASS · all laws clean');
process.exit(fail ? 1 : 0);
