#!/usr/bin/env node
/* .qa/law-proof.mjs - agent-runnable assertions for the three laws that had NO assertion anywhere.
 *
 * Why this file exists: the law-to-probe table in docs/LAWS.md carried three rows whose "Runnable
 * probe" cell was empty. B1 (best of 3, first to 2 round wins), B2 (a round ends only on a K.O.)
 * and U1 (uniform base: omega 3.5, damage 1, hp 100) were the only live laws with no runnable
 * assertion in ANY probe - not even measure.mjs audited them, because they are not rendering laws.
 * A law nothing can fail is a law nothing protects. These three are pure SIM logic, so the house
 * loader (tools/lib/load-sim.mjs, the pattern fingerprint / leadproof / lengrow-build-proof use)
 * can assert them headlessly in seconds, with no rendering and no measure.mjs.
 *
 *   U1  uniform base      - every weapon row carries omega 3.5 / damage 1 (none overrides the
 *                           shared WDEF), and every fighter starts a round on spin 3.5 / damage 1 /
 *                           hp 100 - the ROUND-LEVEL truth, read off the live game state.
 *                           Measured on this build: 22 weapon rows, none overriding the base.
 *   B1  best of 3         - the battle does not end on the first round win, does not end at one win
 *                           apiece, ends exactly on the second round win, takes at most three
 *                           rounds, and names the side that took its second win. Checked from BOTH
 *                           sides, because a threshold that only holds for the left fighter is not
 *                           a threshold.
 *   B2  K.O.-only rounds   - the fight phase has no timer (it survives a long tick run with no
 *                           K.O. at all), and every exit from the fight phase is a K.O. exit.
 *
 * HOW THE ROUNDS ARE ENDED (read this before "simplifying" it): the probe stages the kill as GAME
 * STATE (f.alive = false, f.hp = 0) BEFORE the first fight-phase tick runs, then lets the shipped
 * tick() drive it. So the sim's own checkKO() credits the win, sets the ko phase and checks the
 * battle-end condition - no sim code is patched, transformed or re-implemented here. The dead
 * fighter is skipped by stepPhysics and cannot deal damage, so the only K.O. in that tick is ours:
 * the probe is not racing a natural knock-out.
 *
 * VACUITY RULE (house): every section asserts its own sample size. A future build that stalls the
 * seeds used here makes these FAIL rather than passing on zero observations.
 *
 * Read-only: writes nothing, runs no measure.mjs, never touches the canonical. Tier 0 (seconds).
 * Usage: node .qa/law-proof.mjs [file=previews/spinclash-preview.html]
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(process.argv[2] ? join(here, '..', process.argv[2]) : join(here, '..', 'previews', 'spinclash-preview.html'));

import { loadSim } from '../tools/lib/load-sim.mjs';
const api = loadSim(FILE, ['newGame', 'tick', 'CFG', 'WEAPONS', 'WEAPON_IDS', 'DEFAULT_CAST']);
const { newGame, tick, CFG, WEAPONS } = api;

/* The law constants, spelled out here so the probe does not read them back out of the build it is
 * judging: a probe that copies the value it is checking proves nothing. */
const BASE_OMEGA = 3.5, BASE_DMG = 1, BASE_HP = 100, ROUNDS_TO_WIN = 2;

/* Tick ceilings for every wait loop. A hung sim must FAIL, never hang the battery. */
const CAP = 60000;
/* B2a: the no-timer window. 20000 ticks at CFG.tickHz (120) is ~167 s of game time - two orders of
 * magnitude past any plausible round timer, and past the whole reveal + ko + round-2 cycle. */
const NO_TIMER_TICKS = 20000;
/* B2b: the natural-fight sample floor. A round that ended within a handful of ticks would make
 * "the round ends only on a K.O." vacuous. Measured on this build: the natural fight runs 12,684
 * ticks, so this floor sits 6x under it - far enough above "the fight ended at once" to mean
 * something, far enough under the measurement not to be brittle. */
const MIN_FIGHT_TICKS = 2000;

const SEED = 4242;      // the law cells - deterministic, forced weapons, no natural K.O. race
const SEED_FIGHT = 7;   // the B2b natural fight
const SEED_TIMER = 11;  // the B2a no-timer window

let pass = 0, fail = 0;
const ok = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${d ? '  - ' + d : ''}`); };
const s = v => JSON.stringify(v);

/* ---- helpers ------------------------------------------------------------ */

/* Advance to the fight phase of the current round (through the reveal). */
function toFight(G) {
  let n = 0;
  while (G.phase !== 'fight' && !G.over && n++ < CAP) tick(G);
  return G.phase === 'fight';
}

/* Run one round to its end: stage the kill, let the shipped tick() credit it, then let the ko
 * phase run out into the next round (or the battle end). */
function koRound(G, loserSlot) {
  if (!toFight(G)) return { err: 'the round never reached the fight phase' };
  const winsBefore = G.wins.slice();
  G.fighters[loserSlot].alive = false;
  G.fighters[loserSlot].hp = 0;
  let ko = null, n = 0;
  while (G.phase === 'fight' && n++ < CAP) {
    tick(G);
    if (!ko) { const e = G.events.find(x => x.kind === 'ko'); if (e) ko = e; }
  }
  while (G.phase === 'ko' && n++ < CAP) tick(G);
  return { winsBefore, wins: G.wins.slice(), over: G.over, winner: G.winner, round: G.round, phase: G.phase, ko };
}

/* ---- U1: uniform base -------------------------------------------------- */
console.log('U1 - uniform base (omega 3.5, damage 1, hp 100)');
const rows = Object.entries(WEAPONS);
const badBase = rows.filter(([, w]) => w.omega !== BASE_OMEGA || w.dmg !== BASE_DMG);
ok('U1 every weapon carries the uniform base (omega 3.5, damage 1)',
   rows.length > 0 && badBase.length === 0,
   badBase.length ? badBase.map(([k, w]) => `${k}: omega ${w.omega} dmg ${w.dmg}`).join(' | ')
                  : `${rows.length} weapon rows, none overrides the shared base`);
ok('U1 the base is the shared constant, not a per-row copy (CFG.hp 100, roundsToWin 2)',
   CFG.hp === BASE_HP && CFG.roundsToWin === ROUNDS_TO_WIN,
   `CFG.hp ${CFG.hp}, CFG.roundsToWin ${CFG.roundsToWin}`);
const gu = newGame(SEED, { weapons: ['sword', 'sword'] });
const guInFight = toFight(gu);
const base = gu.fighters.map(f => ({ spin: Math.abs(f.spin), dmg: f.dmg, hp: f.hp }));
ok('U1 every fighter starts a round on the uniform base (spin 3.5, damage 1, hp 100)',
   guInFight && base.every(b => b.spin === BASE_OMEGA && b.dmg === BASE_DMG && b.hp === BASE_HP),
   base.length ? s(base) : 'the round never reached the fight phase');

/* ---- B1: best of 3, first to 2 round wins ------------------------------ */
console.log('B1 - best of 3, first to 2 round wins');
/* Round 1: slot 1 dies (slot 0 wins). Round 2: slot 0 dies (1-1). Round 3: slot 1 dies (2-1). */
const losers = [1, 0, 1];
const b1 = newGame(SEED, { weapons: ['sword', 'sword'] });
const r = losers.map(l => koRound(b1, l));
const rOk = r.every(x => !x.err);
ok('B1 the battle does not end on the first round win',
   rOk && r[0].wins[0] === 1 && r[0].wins[1] === 0 && r[0].over === false,
   rOk ? `wins ${s(r[0].wins)}, over ${r[0].over}, round ${r[0].round}` : r[0].err);
ok('B1 the battle does not end at one win apiece',
   rOk && r[1].wins[0] === 1 && r[1].wins[1] === 1 && r[1].over === false,
   rOk ? `wins ${s(r[1].wins)}, over ${r[1].over}, round ${r[1].round}` : r[1].err);
ok('B1 the battle ends on the second round win',
   rOk && r[2].wins[0] === 2 && r[2].over === true,
   rOk ? `wins ${s(r[2].wins)}, over ${r[2].over}` : r[2].err);
ok('B1 the battle takes at most three rounds (best of 3)',
   rOk && r[2].round === 3 && r[2].over === true,
   rOk ? `ended on round ${r[2].round}, over ${r[2].over}` : r[2].err);
ok('B1 the winner is the side that took its second round win',
   rOk && r[2].winner === 0 && r[2].wins[0] === 2 && r[2].wins[1] <= 1,
   rOk ? `winner ${r[2].winner}, wins ${s(r[2].wins)}` : r[2].err);
ok('B1 each round was ended by a real K.O. credited to the survivor',
   rOk && r.every((x, i) => x.ko && x.ko.loser === losers[i] && x.ko.winner === 1 - losers[i]),
   rOk ? r.map((x, i) => `r${i + 1}: ko loser ${x.ko && x.ko.loser} winner ${x.ko && x.ko.winner}`).join(', ') : 'a round did not run');
/* The mirror: the other side takes the first win. A threshold that only holds for one side is not
 * a threshold. */
const losersM = [0, 1, 0];
const b1m = newGame(SEED, { weapons: ['sword', 'sword'] });
const rm = losersM.map(l => koRound(b1m, l));
const rmOk = rm.every(x => !x.err);
ok('B1 the same holds when the other side takes the first win',
   rmOk && rm[0].wins[0] === 0 && rm[0].wins[1] === 1 && rm[0].over === false &&
   rm[1].wins[0] === 1 && rm[1].wins[1] === 1 && rm[1].over === false &&
   rm[2].wins[1] === 2 && rm[2].over === true && rm[2].winner === 1 && rm[2].round === 3,
   rmOk ? `wins ${s(rm.map(x => x.wins))}, over ${rm[2].over}, winner ${rm[2].winner}` : rm[0].err);

/* ---- B2: a round ends only on a K.O. ----------------------------------- */
console.log('B2 - a round ends only on a K.O.');
/* B2a - no timer. The fighters are made unkillable (hp only; no sim code is touched), so the fight
 * cannot end by a K.O. and the ONLY thing that could end it is a timer. */
const gt = newGame(SEED_TIMER, { weapons: ['sword', 'sword'] });
const gtInFight = toFight(gt);
if (gtInFight) gt.fighters.forEach(f => { f.hp = 1e9; });
let timerTicks = 0, timerLeft = false, timerKo = 0;
while (timerTicks < NO_TIMER_TICKS && !gt.over) {
  tick(gt);
  timerTicks++;
  if (gt.events.some(e => e.kind === 'ko')) timerKo++;
  if (gt.phase !== 'fight') { timerLeft = true; break; }
}
ok('B2 the fight phase has no timer',
   gtInFight && timerLeft === false && timerKo === 0 && timerTicks === NO_TIMER_TICKS &&
   gt.wins[0] === 0 && gt.wins[1] === 0 && gt.round === 1,
   gtInFight ? `${timerTicks} ticks, phase ${gt.phase}, wins ${s(gt.wins)}, round ${gt.round}, ko events ${timerKo}`
             : 'the round never reached the fight phase');
/* B2b - the only exit from the fight phase is a K.O. exit. A real fight, hp untouched. */
const gf = newGame(SEED_FIGHT, { weapons: ['sword', 'sword'] });
const gfInFight = toFight(gf);
let fightTicks = 0, koExits = 0, illegalExits = 0, sawKoPhase = false;
while (!gf.over && fightTicks < CAP) {
  const before = gf.phase;
  tick(gf);
  if (before === 'fight') {
    fightTicks++;
    if (gf.phase !== 'fight') {
      if (gf.events.some(e => e.kind === 'ko')) { koExits++; if (gf.phase === 'ko') sawKoPhase = true; }
      else illegalExits++;
    }
  }
}
ok('B2 the round ends only on a K.O.',
   gfInFight && illegalExits === 0 && koExits >= 1 && sawKoPhase && fightTicks >= MIN_FIGHT_TICKS,
   gfInFight ? `${fightTicks} fight ticks, ${koExits} K.O. exits, ${illegalExits} non-K.O. exits, ko phase seen ${sawKoPhase}`
             : 'the round never reached the fight phase');

console.log(`\n${pass}/${pass + fail} passed`);
if (fail) { console.log(`${fail} FAILED`); process.exit(1); }
console.log(`Read-only: nothing written, measure.mjs untouched. Natural fight sample ${fightTicks} ticks (floor ${MIN_FIGHT_TICKS}); no-timer window ${timerTicks} ticks.`);
console.log(JSON.stringify({ check: 'law-proof', pass, fail, ok: fail === 0, fightTicks, timerTicks }));
