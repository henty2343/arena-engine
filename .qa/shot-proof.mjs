#!/usr/bin/env node
/* .qa/shot-proof.mjs - agent-runnable assertions for the PROJECTILE laws that had no runnable probe.
 *
 * Why this file exists: the law-to-probe table in docs/LAWS.md carried S1 (damage only on
 * shot-touches-body), S5 (the substep budget is honoured every tick) and S6 (every shot is born at
 * its hold-derived launch point) as `owner-run only` - only measure.mjs audited them, and agents
 * never run measure.mjs. So a break in any of the three would fail NOTHING an agent can run. All
 * three are pure SIM logic and all three are decidable from what the sim already emits, so the
 * house loader (tools/lib/load-sim.mjs) asserts them headlessly in seconds.
 *
 *   S1  damage only on shot-touches-body
 *       A shot hits the body when the gap between the shot's circle and the body's circle is
 *       NEGATIVE, and that is the only way it damages. The hit event carries the shot at its death
 *       instant (sx, sy, sr) and the victim's centre (x, y), so the probe RECOMPUTES the gap
 *       itself and checks it against the event's own number - the arithmetic is the probe's, not
 *       the sim's. The returning boomerang is the one row whose hitbox is the drawn ARC rather
 *       than the shot's circle (chaosorbit-r54), so for that row the probe checks the sign of the
 *       sim's own arc gap and says so.
 *   S5  the substep budget is honoured every tick
 *       The substep count is sized from the blade and projectile requirements and then clamped to
 *       CFG.maxSub - the emergency brake, which the perception audit says should never engage.
 *       The probe reads the chosen count and both requirements out of the audit tape and checks
 *       BOTH halves: the brake never engaged (chosen < maxSub), and the budget was never
 *       UNDER-allocated (chosen >= the requirement - an under-allocated budget is the tunneling
 *       ghost the sizing rule exists to prevent).
 *   S6  every shot is born at its hold-derived launch point
 *       The birth point is derived from the fighter's pose and the row's HOLD: the weapon's middle
 *       (spine t=0.5) for a grip launch, the TIP for the radial-hold launchers, the art centre for
 *       the copy rows, the grip plus the belly offset for the radial rows, and the per-anchor
 *       points for the volley row. The probe recomputes the launch point from the shotFire event's
 *       own fighter pose, using the sim's own spineFrame / copyCtr geometry helpers, and checks it
 *       against the event's birth coordinates.
 *
 * WHAT S6 DOES NOT COVER: the volley row (the knives) grows its fan with the holder's hit count,
 * so the probe cannot know WHICH tier was live from the event alone. It therefore matches every
 * volley shot against the FULL anchor set (the base three plus every tier the fan can reach) and
 * asserts the shot is born at one of them - which still catches a wrong launch point, but cannot
 * catch a shot born at the right anchor of the WRONG tier. Every other shot row is recomputed
 * exactly.
 *
 * VACUITY RULE (house): every assertion states its own sample size.
 *
 * Read-only: writes nothing, runs no measure.mjs, never touches the canonical. Tier 0.
 * Usage: node .qa/shot-proof.mjs [file=previews/spinclash-preview.html]
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(process.argv[2] ? join(here, '..', process.argv[2]) : join(here, '..', 'previews', 'spinclash-preview.html'));

import { loadSim } from '../tools/lib/load-sim.mjs';
const api = loadSim(FILE, ['newGame', 'tick', 'CFG', 'WEAPONS', 'spineFrame', 'copyCtr', 'grownVolley', 'FAN_STEPS', 'FAN_SPREAD']);
const { newGame, tick, CFG, WEAPONS, spineFrame, copyCtr, FAN_STEPS, FAN_SPREAD } = api;

/* Tick budget per cell - a launcher needs thousands of ticks before it fires and lands. */
const TICK_BUDGET = 2500;
/* Minimum observations, so an assertion cannot pass on an empty sample. */
const MIN_SHOT_HITS = 20, MIN_FIRES = 20, MIN_TICKS = 2000;
/* The substep floor: the budget must be EXERCISED, not merely never breached - otherwise
 * "the brake never engaged" would pass on a budget that never needed a brake. Measured on this
 * build at this tick budget: the chosen count peaks at 39 against a cap of 512. */
const MIN_BUDGET_K = 12;

/* One cell per shot row, each against a melee partner (the shot rows' own behaviour, not a
 * shot-vs-shot scrum - a separate cell below covers the shot-vs-shot budget term). */
const ROWS = ['bow', 'staff', 'wand', 'crossbow', 'boomerang', 'shuriken', 'knives', 'javelin', 'tome', 'scroll'];
const CELLS = ROWS.map(w => [`${w}+sword`, [w, 'sword'], 5]);
CELLS.push(['crossbow+tome s9', ['crossbow', 'tome'], 9]);

let pass = 0, fail = 0;
const ok = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${d ? '  - ' + d : ''}`); };

const S = { shotHits: 0, gapNeg: 0, strict: 0, strictOk: 0, strictMismatch: 0, returns: 0, returnsNeg: 0,
            fires: 0, holdOk: 0, holdBad: 0, volleyFires: 0, volleyOk: 0,
            ticks: 0, brake: 0, underAllocated: 0, maxK: 0, maxReq: 0 };
const notes = [];

/* The candidate anchor set of the volley row: the base three plus every tier the fan can reach.
 * Matching against the whole set means the probe does not have to track the growth counter. */
function volleyCandidates(wid) {
  const row = WEAPONS[wid].shot.volley;
  const cands = row.slice();
  for (let k = 1; k <= FAN_STEPS; k++) {
    const deg = 22 + k * FAN_SPREAD;
    cands.push([row[1][0], row[1][1], -deg], [row[2][0], row[2][1], deg]);
  }
  return cands;
}

/* The hold-derived launch point, recomputed from the fighter's pose and the row's hold.
 * This mirrors the launch doctrine; the GEOMETRY comes from the sim's own spineFrame / copyCtr. */
function derivedLaunchPoint(wid, fx, fy, fAng) {
  const W = WEAPONS[wid];
  const fr = spineFrame(fx, fy, fAng, wid);
  const c = Math.cos(fAng), s = Math.sin(fAng);
  const tipF = W.shot.fire === 'tip';
  const rad = W.shot.fire === 'radial' || tipF;
  let x = fr.ox + fr.dx * fr.span * 0.5, y = fr.oy + fr.dy * fr.span * 0.5;
  if (tipF) { x = fr.ox + fr.dx * fr.span; y = fr.oy + fr.dy * fr.span; }
  else if (rad) { x += c * (W.shot.off || 0); y += s * (W.shot.off || 0); }
  if (W.shot.copy) { const ctr = copyCtr(wid); x = fr.ox + ctr[0] * fr.dx - ctr[1] * fr.dy; y = fr.oy + ctr[0] * fr.dy + ctr[1] * fr.dx; }
  return { x, y, fr };
}

/* The volley launch point: a per-anchor point on the spine frame, clamped into the arena. */
function volleyLaunchPoint(wid, fx, fy, fAng, ka, effR) {
  const fr = spineFrame(fx, fy, fAng, wid);
  const wx = fr.ox + ka[0] * fr.dx - ka[1] * fr.dy, wy = fr.oy + ka[0] * fr.dy + ka[1] * fr.dx;
  let x = wx, y = wy;
  const dxc = x - CFG.size / 2, dyc = y - CFG.size / 2, dr = Math.hypot(dxc, dyc);
  if (dr + effR > CFG.size / 2 - 0.5) { const k2 = (CFG.size / 2 - 0.5 - effR) / dr; x = CFG.size / 2 + dxc * k2; y = CFG.size / 2 + dyc * k2; }
  return { x, y };
}

for (const [name, weapons, seed] of CELLS) {
  const G = newGame(seed, { weapons });
  G.audit = true;
  let t = 0;
  while (!G.over && t < TICK_BUDGET) {
    tick(G);
    t++;
    /* S5 - the audit tape: [chosen, blade-required, projectile-required] per tick. */
    const K = G.auditK;
    for (let i = 0; i + 2 < K.length; i += 3) {
      const chosen = K[i], bladeReq = K[i + 1], projReq = K[i + 2];
      S.ticks++;
      if (chosen > S.maxK) S.maxK = chosen;
      const req = Math.max(bladeReq, projReq);
      if (req > S.maxReq) S.maxReq = req;
      if (chosen >= CFG.maxSub) S.brake++;
      if (chosen < req) S.underAllocated++;
    }
    /* S1 - a shot's damage event must be a touch. */
    for (const e of G.events) {
      if (e.kind !== 'hit' || !e.shot) continue;
      S.shotHits++;
      if (e.gap < 0) S.gapNeg++;
      const wid = weapons[e.by];
      if (WEAPONS[wid].shot.returns) {
        S.returns++;
        if (e.gap < 0) S.returnsNeg++;
      } else {
        S.strict++;
        const bd = Math.hypot(e.x - e.sx, e.y - e.sy);
        const recomputed = bd - (CFG.bodyR + e.sr);
        if (recomputed < 0 && Math.abs(recomputed - e.gap) < 1e-6) S.strictOk++;
        else { S.strictMismatch++; if (notes.length < 12) notes.push(`${name} S1 mismatch: event gap ${e.gap}, recomputed ${recomputed}`); }
      }
    }
    /* S6 - a shot is born at its hold-derived launch point. */
    for (const e of G.events) {
      if (e.kind !== 'shotFire') continue;
      S.fires++;
      const wid = weapons[e.by];
      const W = WEAPONS[wid];
      if (W.shot.volley) {
        S.volleyFires++;
        const effR = W.shot.r;                 // the volley row carries no shotR growth, so the birth radius is the row's
        let best = Infinity;
        for (const ka of volleyCandidates(wid)) {
          const p = volleyLaunchPoint(wid, e.fx, e.fy, e.fAng, ka, effR);
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < best) best = d;
          if (d < 1e-6) { best = 0; break; }
        }
        if (best < 1e-6) S.volleyOk++;
        else if (notes.length < 12) notes.push(`${name} S6 volley mismatch: nearest anchor ${best.toFixed(3)} px away`);
      } else {
        const p = derivedLaunchPoint(wid, e.fx, e.fy, e.fAng);
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < 1e-6) S.holdOk++;
        else { S.holdBad++; if (notes.length < 12) notes.push(`${name} S6 ${wid}: event (${e.x.toFixed(2)},${e.y.toFixed(2)}) vs derived (${p.x.toFixed(2)},${p.y.toFixed(2)}) - ${d.toFixed(4)} px`); }
      }
    }
  }
}

console.log('S1 - damage only on shot-touches-body');
ok('S1 every shot that damaged the body was touching it',
   S.shotHits >= MIN_SHOT_HITS && S.gapNeg === S.shotHits,
   `${S.gapNeg}/${S.shotHits} shot hits had a negative gap`);
ok('S1 the probe recomputes the touch itself (non-returning rows)',
   S.strict >= MIN_SHOT_HITS && S.strictOk === S.strict && S.strictMismatch === 0,
   `${S.strictOk}/${S.strict} recomputed exactly from the event's own coordinates`);

console.log('S5 - the substep budget is honoured every tick');
ok('S5 the emergency brake never engaged',
   S.ticks >= MIN_TICKS && S.brake === 0,
   `${S.ticks} audited ticks, max chosen k ${S.maxK} against the cap ${CFG.maxSub}, ${S.brake} engagement(s)`);
ok('S5 the budget was never under-allocated',
   S.ticks >= MIN_TICKS && S.underAllocated === 0 && S.maxK >= MIN_BUDGET_K,
   `max requirement ${S.maxReq}, ${S.underAllocated} under-allocated tick(s), peak k ${S.maxK} (floor ${MIN_BUDGET_K})`);

console.log('S6 - every shot is born at its hold-derived launch point');
ok('S6 every hold-derived row launches where its hold says',
   S.holdOk >= MIN_FIRES && S.holdBad === 0,
   `${S.holdOk} shot(s) recomputed exactly`);
ok('S6 every volley shot is born at one of its anchors',
   S.volleyFires >= MIN_FIRES && S.volleyOk === S.volleyFires,
   `${S.volleyOk}/${S.volleyFires} volley shots matched an anchor`);

console.log(`\n${pass}/${pass + fail} passed`);
if (notes.length) { console.log('notes:'); notes.slice(0, 8).forEach(n => console.log('   ' + n)); }
if (fail) { console.log(`${fail} FAILED`); process.exit(1); }
console.log(`Read-only: nothing written, measure.mjs untouched. ${S.shotHits} shot hits, ${S.fires} shots fired, ${S.ticks} audited ticks over ${CELLS.length} cell(s).`);
console.log(JSON.stringify({ check: 'shot-proof', pass, fail, ok: fail === 0, shotHits: S.shotHits, fires: S.fires, ticks: S.ticks, maxK: S.maxK }));
