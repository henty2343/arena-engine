// scratch/smoke-r68.mjs — hexfam-r68 landing smoke: THE FAMILY FLIGHT LAW. Every shot.hex row
// (wand, tome, scroll, staff) is born bent on the DERIVED ladder — (0.9 + 0.15×min(shotStep,10))
// × speed/800 — the wand's blessed numbers scaled by row speed: one radius language family-wide
// (~889px birth arc, ~333px hunt floor), the wand bit-identical (k=1). Cells: the four family rows
// × hammer. Lean asserts per #674; rates PROVISIONAL. Steel control: bow flies straight (turn===0).
import { loadAPI } from './loader-r54.mjs';
const { newGame, tick, WEAPONS } = loadAPI();
const TS = 10, BASE = 0.9, GROW = 0.15, REF = 800, FLOOR = REF / (BASE + GROW * TS);   // 333.33px

function run(label, seed, w, secs) {
  const G = newGame(seed, { weapons: [w, 'hammer'] });
  const speed = WEAPONS[w].shot.speed, k = speed / REF;
  const allowed = []; for (let s = 0; s <= TS; s++) allowed.push((BASE + GROW * s) * k);   // flick-r72 alignment: the wand's birth turn carries the soft fraction (the birth RADIUS stays on the ladder — see below)
  const R = { shots: 0, hexBad: 0, ladderBad: 0, capBad: 0, floorBad: 0, turnFrozenBad: 0,
              huntClose: 0, huntSamples: 0, maxStep: 0, nan: 0, hits: 0 };
  const signs = new Set(); const born = new Map(); const lastD = new Map();
  for (let t = 0; t < 120 * secs && !G.over; t++) {
    tick(G);
    const fam = G.fighters.find(f => f.weapon === w);
    const foe = G.fighters.find(f => f.weapon !== w);
    if (fam) R.maxStep = Math.max(R.maxStep, fam.shotStep);
    for (const st of G.shots) {
      const own = G.fighters[st.o];
      if (!own || own.weapon !== w) continue;
      R.shots++;
      if (!st.hex) R.hexBad++;
      if (!Number.isFinite(st.x) || !Number.isFinite(st.turn)) R.nan++;
      signs.add(Math.sign(st.turn));
      const at = Math.abs(st.turn) / ((WEAPONS[w].trait && WEAPONS[w].trait.flick) ? 0.55 : 1);   // flick-r72: divide the soft fraction back out — the LADDER language itself is unchanged
      if (!allowed.some(a => Math.abs(a - at) < 1e-12)) R.ladderBad++;
      if (at > allowed[TS] + 1e-12) R.capBad++;
      if (at > 0 && speed / at < FLOOR - 1e-6) R.floorBad++;
      if (born.has(st.sid)) { if (born.get(st.sid) !== st.turn) R.turnFrozenBad++; }   // st.turn frozen at birth (the r61/r65 law)
      else born.set(st.sid, st.turn);
      if (fam && fam.shotStep > 0 && foe && foe.alive) {   // THE HUNT: a marked foe + a live hex shot — closing samples (the r65 witness style)
        const d = Math.hypot(foe.pos.x - st.x, foe.pos.y - st.y);
        const pd = lastD.get(st.sid);
        if (pd != null) { R.huntSamples++; if (d < pd - 1e-9) R.huntClose++; }
        lastD.set(st.sid, d);
      }
    }
    for (const e of G.events) if (e.kind === 'hit') R.hits++;
  }
  const signOK = signs.has(1) && signs.has(-1);
  console.log(label.padEnd(16), JSON.stringify({ ...R, signOK, k: +k.toFixed(4) }));
  return { ...R, signOK };
}

const cells = [
  run('wand×hammer', 4321, 'wand', 60),
  run('tome×hammer', 21, 'tome', 60),
  run('scroll×hammer', 22, 'scroll', 60),
  run('staff×hammer', 23, 'staff', 60),
];
// steel control: the bow must fly STRAIGHT — zero turn on every shot (no rng spend, no curve branch)
{
  const G = newGame(7, { weapons: ['bow', 'hammer'] });
  var steelN = 0, steelBad = 0;
  for (let t = 0; t < 120 * 20 && !G.over; t++) { tick(G); for (const st of G.shots) { steelN++; if (st.turn !== 0) steelBad++; } }
}
const agg = cells.reduce((a, c) => ({ shots: a.shots + c.shots, hexBad: a.hexBad + c.hexBad, ladderBad: a.ladderBad + c.ladderBad,
  capBad: a.capBad + c.capBad, floorBad: a.floorBad + c.floorBad, turnFrozenBad: a.turnFrozenBad + c.turnFrozenBad,
  huntClose: a.huntClose + c.huntClose, huntSamples: a.huntSamples + c.huntSamples, nan: a.nan + c.nan,
  signOK: a.signOK && c.signOK }), { shots: 0, hexBad: 0, ladderBad: 0, capBad: 0, floorBad: 0, turnFrozenBad: 0, huntClose: 0, huntSamples: 0, nan: 0, signOK: true });
const bad = agg.hexBad + agg.ladderBad + agg.capBad + agg.floorBad + agg.turnFrozenBad + agg.nan + steelBad;
const ok = agg.shots > 0 && cells.every(c => c.shots > 0) && bad === 0 && agg.signOK &&
           agg.huntClose > 0 && cells.every(c => c.signOK) && steelN > 0;
console.log('SMOKE-R68', ok ? 'PASS' : 'FAIL', JSON.stringify({ ...agg, bad, steelN, steelBad }));
process.exit(ok ? 0 : 1);
