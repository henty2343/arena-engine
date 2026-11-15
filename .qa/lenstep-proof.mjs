#!/usr/bin/env node
/* .qa/lenstep-proof.mjs - the audit rebuilds a GROWN chain at its true length (lenStep-r1).
 *
 * WHY THIS FILE EXISTS: the sim's contact tests pass the fighter's lenStep to bladeCircles (8th argument)
 * and parryGap (pose.ls), and a length-growing chain weapon (the flail) adds a link every few hits. Hit,
 * parry and swat events do not carry lenStep, and measure.mjs and frame-proof's C3 pose passed none, so a
 * grown chain was rebuilt SHORT: phantom hits and parries-without-touch that were harness artifacts, and
 * a law-3 "overlap" that was not one (HANDOFF s7, THE lenStep DRIFT). Nothing an agent could run failed
 * when that happened. This probe makes it fail.
 *
 * WHAT IT ASSERTS (read-only; it never runs measure.mjs):
 *   L1  every chain-aware recompute SITE in measure.mjs and .qa/frame-proof.mjs carries the lenStep: each
 *       pose literal that names a chain pose (`fl:`) also names `ls:`, each geom.bladeCircles call with a
 *       chain pose has its 8th argument, and measure.mjs stashes f.lenStep at the pre-tick instant;
 *   L2  METHOD, hits: on real fights, a blade hit recomputed from its stored pose with the PRE-TICK lenStep
 *       touches the victim - zero phantoms - on every hit that did not add a link (a hit that grew the
 *       attacker without adding a link included);
 *   L3  METHOD, parries: a parry recomputed with the pre-tick lenStep of both fighters is an exact touch on
 *       every tick in which neither fighter grew;
 *   L4  VACUITY: the same populations recomputed WITHOUT lenStep (what measure.mjs did before) show
 *       phantoms and parries without touch, so the sample really contains grown chains;
 *   CONTROL: the L1 checker, run on a copy of measure.mjs with one lenStep argument removed, must report it.
 *
 * NOT ASSERTED, REPORTED: hits that added a link and parries in a tick where a fighter grew. The event stores
 * the POST-grow chain pose (the hit event is built after grow()), the contact used the PRE-grow geometry, so
 * no harness-side stash can be exact there; exactness needs lenStep on the audit tape or in the events, a
 * canonical edit (rule 5, the owner's). The count is printed so the residue is a number, not a guess.
 * Within a tick the stash is the lenStep at ENTRY; a second hit in the same tick sees one more step, which is
 * why L2 and L3 exclude ticks in which the fighter grew (link-add or not is split for hits, not for parries).
 *
 * Read-only, Tier 0. Usage: node .qa/lenstep-proof.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
import { loadSim } from '../tools/lib/load-sim.mjs';
const api = loadSim(join(here, '..', 'previews', 'spinclash-preview.html'), ['newGame', 'tick', 'CFG', 'geom']);
const { newGame, tick, CFG, geom } = api;

let pass = 0, fail = 0;
const ok = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${d ? '  - ' + d : ''}`); };

/* ---- L1: the static site check (a function, so the control can run it on a mutated copy) ---- */
function splitTop(s) {            // split on commas at bracket depth 0
  const out = []; let d = 0, cur = '';
  for (const ch of s) {
    if ('([{'.includes(ch)) d++; else if (')]}'.includes(ch)) d--;
    if (ch === ',' && d === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur); return out;
}
function siteViolations(src) {
  const bad = [];
  let nLit = 0, nCall = 0;
  for (const m of src.matchAll(/\{[^{}]*\bfl:[^{}]*\}/g)) {            // a pose literal with a chain pose
    nLit++;
    if (!/\bls:/.test(m[0])) bad.push('pose literal without ls: ' + m[0].slice(0, 70));
  }
  for (const m of src.matchAll(/geom\.bladeCircles\(/g)) {
    let i = m.index + m[0].length, d = 1;
    for (; i < src.length && d > 0; i++) { if (src[i] === '(') d++; else if (src[i] === ')') d--; }
    const args = splitTop(src.slice(m.index + m[0].length, i - 1));
    if (args.length >= 6 && args[5].trim() === 'null') continue;        // rest-pose reach probe: no chain pose
    nCall++;
    if (args.length < 8) bad.push('bladeCircles call with ' + args.length + ' args: ' + src.slice(m.index, m.index + 70));
  }
  return { bad, nLit, nCall };
}
const MSRC = readFileSync(join(here, '..', 'measure.mjs'), 'utf8');
const FSRC = readFileSync(join(here, 'frame-proof.mjs'), 'utf8');
const M = siteViolations(MSRC), F = siteViolations(FSRC);
const stash = /if \(f\) entryLs\[fi\] = f\.lenStep/.test(MSRC);
ok('L1 every chain-aware site in measure.mjs and frame-proof carries lenStep', M.bad.length === 0 && F.bad.length === 0 && stash && M.nLit >= 6 && M.nCall >= 5 && F.nLit >= 1,
   `measure.mjs ${M.nLit} pose literals + ${M.nCall} bladeCircles calls, frame-proof ${F.nLit} + ${F.nCall}, pre-tick stash ${stash ? 'present' : 'MISSING'}${M.bad.concat(F.bad).length ? ' - ' + M.bad.concat(F.bad)[0] : ''}`);

/* ---- L2-L4: the method, on real fights ---- */
const EPS = 1e-9, TICKS = 10000, MIN = 60;
const PAIRS = [['flail', 'hammer'], ['flail', 'scythe'], ['nunchaku', 'scythe']], SEEDS = [101, 102, 103];
const rest = Array.from({ length: 18 }, (_, q) => (q & 1 ? 0 : 1));
const nCirc = (w, ls) => { const o = []; geom.bladeCircles(0, 0, 0, w, o, rest, 1, ls); return o.length; };   // grows with the link count
const circ = [];
const C = { hitExact: 0, hitBad: 0, hitBadNoLs: 0, hitLink: 0, hitLinkBad: 0, hitStableGrown: 0,
            parryExact: 0, parryBad: 0, parryBadNoLs: 0, parryGrowTick: 0, parryGrowBad: 0 };
for (const weapons of PAIRS) for (const seed of SEEDS) {
  const G = newGame(seed, { weapons }); G.audit = true;
  for (let t = 0; t < TICKS && !G.over; t++) {
    const ls0 = G.fighters.map(f => f.lenStep || 0);                    // the pre-tick stash
    tick(G);
    if (G.phase !== 'fight') continue;
    const ls1 = G.fighters.map(f => f.lenStep || 0);
    for (const e of G.events) {
      if (e.kind === 'hit' && !e.shot) {
        const grew = ls0[e.by] !== ls1[e.by];
        const link = grew && nCirc(e.aW, ls0[e.by]) !== nCirc(e.aW, ls0[e.by] + 1);
        const touch = (ls) => { geom.bladeCircles(e.ax, e.ay, e.aAng, e.aW, circ, e.aFl, geom.leadFlip(e.aW, e.aSp), ls); return geom.bladeBodyGap(circ, e.x, e.y) < CFG.bodyR + EPS; };
        const withLs = touch(ls0[e.by]);
        if (link) { C.hitLink++; if (!withLs) C.hitLinkBad++; continue; }
        if (ls0[e.by] === 0) continue;                                  // a short chain: lenStep cannot matter, not a sample
        C.hitExact++; if (grew) C.hitStableGrown++;
        if (!withLs) C.hitBad++;
        if (!touch(undefined)) C.hitBadNoLs++;
      } else if (e.kind === 'parry') {
        const pg = (a, b) => geom.parryGap(
          { x: e.ax, y: e.ay, ang: e.aAng, w: e.aW, fl: e.aFl, fp: geom.leadFlip(e.aW, e.aSp), ls: a },
          { x: e.bx, y: e.by, ang: e.bAng, w: e.bW, fl: e.bFl, fp: geom.leadFlip(e.bW, e.bSp), ls: b }).gap;
        if (ls0[0] !== ls1[0] || ls0[1] !== ls1[1]) { C.parryGrowTick++; if (pg(ls0[0], ls0[1]) > EPS) C.parryGrowBad++; continue; }
        if (ls0[0] === 0 && ls0[1] === 0) continue;
        C.parryExact++;
        if (pg(ls0[0], ls0[1]) > EPS) C.parryBad++;
        if (pg(undefined, undefined) > EPS) C.parryBadNoLs++;
      }
    }
  }
}
ok('L2 a hit recomputed with the pre-tick lenStep always touches (no link added)', C.hitExact >= MIN && C.hitBad === 0, `${C.hitBad} phantom(s) over ${C.hitExact} grown-chain hit(s), ${C.hitStableGrown} of them grew the attacker without adding a link`);
ok('L3 a parry recomputed with the pre-tick lenStep is an exact touch (no fighter grew)', C.parryExact >= MIN && C.parryBad === 0, `${C.parryBad} parr(ies) without touch over ${C.parryExact}`);
ok('L4 VACUITY: without lenStep the same populations show phantoms and parries without touch', C.hitBadNoLs > 0 && C.parryBadNoLs > 0, `${C.hitBadNoLs}/${C.hitExact} phantom hit(s), ${C.parryBadNoLs}/${C.parryExact} parr(ies) without touch`);
const mut = MSRC.replace(', entryLs[e.by]);', ');');
ok('CONTROL the site check reports a measure.mjs copy with one lenStep argument removed', mut !== MSRC && siteViolations(mut).bad.length >= 1, `${siteViolations(mut).bad.length} violation(s) reported`);
console.log(`REPORTED, not asserted: ${C.hitLink} hit(s) that added a link (${C.hitLinkBad} read as phantoms, the post-grow pose problem), ${C.parryGrowTick} parr(ies) in a tick where a fighter grew (${C.parryGrowBad} without touch).`);
console.log(JSON.stringify({ check: 'lenstep-proof', pass, fail, ok: fail === 0, ...C }));
process.exit(fail === 0 ? 0 : 1);
