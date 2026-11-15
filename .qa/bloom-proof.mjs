#!/usr/bin/env node
/* .qa/bloom-proof.mjs - the harness-side BLOOM EXEMPTION for law 3 / 3s (bloom-r73, #765).
 *
 * WHY THIS FILE EXISTS: the sim makes a pair with a bloomed (transfigured, figT > 0) fighter SOLID-FREE on
 * purpose - bladeVsBlade returns on figT > 0 (a joke object parries nothing and is parried by nothing) - and
 * the viewer sees the small joke object, not the real weapon. measure.mjs and frame-proof rebuilt the REAL
 * weapon geometry for every pair, so a solid-free pair read as an interpenetration. The D1 "infeasible pin"
 * (axe vs wand, natural seed 27, 26.100px, G.t 4941) was exactly that (HANDOFF s7, #764). The harnesses now
 * classify such a tick by figT AT TICK ENTRY (the same pre-tick instant as the pose) and COUNT it apart.
 * This probe keeps the exemption honest: if it is removed, mis-wired or stops reading the right instant,
 * something an agent can run fails.
 *
 * WHAT IT ASSERTS (read-only; it never runs measure.mjs):
 *   B1  SITES, by source: measure.mjs stashes figT at the pre-tick instant (entryFig), routes a bloom-pair
 *       law-3 overlap to the bloom counters BEFORE the band counters, routes a shot-vs-bloomed-blade overlap
 *       apart in law 3s, and carries every bloom counter through the merge tables; frame-proof captures figT
 *       in its pose and routes the same way;
 *   B2  PREMISE, on real fights: on every tick where a fighter is bloomed at entry AND at exit, the sim fired
 *       no parry (the resolver gate holds), over a floor of such ticks;
 *   B3  NON-VACUITY / ANCHOR: natural seed 27 reproduces D1's anchor - the deepest real-geometry overlap is
 *       26.100px at G.t 4941 with the AXE bloomed (figT > 0) and the wand not - and it is classified bloom;
 *   B4  CONSISTENCY (near-tautological BY CONSTRUCTION - the classifier is figT at entry - so it guards
 *       against a future edit that decouples them, not against the idea being wrong): every bloom-class
 *       overlap has figT > 0 on a fighter at entry, every other overlap has none; floor on the bloom sample;
 *   CONTROL: the B1 checker, run on copies of measure.mjs with one site mutated each, must report each.
 *
 * REPORTED, NOT ASSERTED: the NON-BLOOM visible remainder on the sample (mirror class vs neither) and the
 * bloom-expiry boundary (overlaps with no bloom at entry but a bloom on the previous tick). The drawn joke
 * object's own silhouette vs the foe's weapon is NOT measured here.
 *
 * Read-only, Tier 0. Usage: node .qa/bloom-proof.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
import { loadSim } from '../tools/lib/load-sim.mjs';
const api = loadSim(join(here, '..', 'previews', 'spinclash-preview.html'), ['newGame', 'tick', 'WEAPONS', 'geom']);
const { newGame, tick, WEAPONS, geom } = api;

let pass = 0, fail = 0;
const ok = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${d ? '  - ' + d : ''}`); };

/* ---- B1: the static site check (a function, so the control can run it on a mutated copy) ---- */
const COUNTERS = ['bloomPairTicks', 'bloomOverlap', 'bloomVis', 'shotRenderBladeBloom'];
function checkMeasure(src) {
  const bad = [];
  if (!/entryFig\[fi\] = f\.figT > 0;/.test(src)) bad.push('no pre-tick entryFig stash');
  const ex = src.indexOf('if (g < 0 && (entryFig[0] || entryFig[1])) {');
  const band = src.indexOf('} else if (g < 0) {\n              polyOverlap++;');
  if (ex < 0) bad.push('no bloom-pair branch in the law-3 entry pass');
  if (band < 0) bad.push('the band branch is not the else of the bloom branch');
  if (ex >= 0 && band >= 0 && !(ex < band)) bad.push('bloom branch does not precede the band counters');
  if (!/if \(gB < 0 && entryFig\[foeI\]\) shotRenderBladeBloom\+\+;/.test(src)) bad.push('law 3s blade test has no bloomed-foe branch');
  const addList = (src.match(/const ACC_ADD = \[[\s\S]*?\];/) || [''])[0];
  const maxList = (src.match(/const ACC_MAX = \[[\s\S]*?\];/) || [''])[0];
  const snap = (src.match(/function accSnapshot\(\) \{[\s\S]*?\n\}/) || [''])[0];
  for (const c of COUNTERS) {
    if (!addList.includes(`'${c}'`)) bad.push(`${c} missing from ACC_ADD`);
    if (!snap.includes(c)) bad.push(`${c} missing from accSnapshot`);
  }
  if (!maxList.includes("'bloomWorst'")) bad.push('bloomWorst missing from ACC_MAX');
  if (!snap.includes('bloomWorst')) bad.push('bloomWorst missing from accSnapshot');
  const merged = (src.match(/\(\{ battles, rounds[\s\S]*?\} = merged\);/) || [''])[0];
  for (const c of [...COUNTERS, 'bloomWorst']) if (!merged.includes(c)) bad.push(`${c} missing from the merge destructure`);
  return bad;
}
function checkFrameProof(src) {
  const bad = [];
  if (!/figT: f\.figT/.test(src)) bad.push('frame-proof pose does not capture figT');
  if (!/g < 0 && bloomPair/.test(src)) bad.push('frame-proof C3 has no bloom-pair branch');
  if (!/gB < 0 && p\[foeI\]\.figT > 0/.test(src)) bad.push('frame-proof S3 blade test has no bloomed-foe branch');
  return bad;
}
console.log('B1 - the exemption sites');
const mSrc = readFileSync(join(here, '..', 'measure.mjs'), 'utf8');
const fSrc = readFileSync(join(here, 'frame-proof.mjs'), 'utf8');
const bm = checkMeasure(mSrc), bf = checkFrameProof(fSrc);
ok('B1 measure.mjs carries every bloom-exemption site', bm.length === 0, bm.length ? bm.join('; ') : 'stash, law-3 branch order, law-3s branch, merge tables');
ok('B1 frame-proof carries the pose capture and both branches', bf.length === 0, bf.length ? bf.join('; ') : 'figT capture, C3 branch, S3 branch');

/* ---- the real-fight sample: natural seeds, no forced weapons ---- */
const INK = 2.5, STR = 13, A_SPIN = 5, B_SPIN = 11;
const SEEDS = [27, 20, 2, 10, 23];
const R = { fight: 0, ov: 0, bloomOv: 0, bloomVis: 0, bloomTicks: 0, premiseTicks: 0, premiseParries: 0,
  classLeak: 0, nonBloomLeak: 0, nonVis: 0, nonVisMirror: 0, nonVisOther: 0, expiry: 0,
  anchor: null, anchorWorst: 0 };
for (const seed of SEEDS) {
  const G = newGame(seed); G.audit = true;
  let prevParry = new Set(), prevSub = -1, prevS0 = 1, prevS1 = 1, have = false, prevBloom = false, guard = 0;
  while (!G.over && guard++ < 60000 && !(seed === 27 && G.t > 5100)) {
    const before = G.phase, p = [];
    for (let i = 0; i < 2; i++) {
      const f = G.fighters[i];
      p.push({ x: f.pos.x, y: f.pos.y, ang: f.wAngle, w: f.weapon, spin: f.spin, fl: f.fl ? f.fl.u.slice() : null,
        ls: f.lenStep, alive: f.alive, figT: f.figT });
    }
    const t0 = G.t;
    tick(G);
    const bloomEntry = p[0].figT > 0 || p[1].figT > 0;
    if (before === 'fight' && p[0].alive && p[1].alive && p[0].w && p[1].w) {
      R.fight++;
      if (bloomEntry) R.bloomTicks++;
      if (p[0].figT > 0 && G.fighters[0].figT > 0 || p[1].figT > 0 && G.fighters[1].figT > 0) {
        R.premiseTicks++;
        for (const e of G.events) if (e.kind === 'parry') R.premiseParries++;
      }
      const qA = { x: p[0].x, y: p[0].y, ang: p[0].ang, w: p[0].w, fl: p[0].fl, fp: geom.leadFlip(p[0].w, p[0].spin), ls: p[0].ls };
      const qB = { x: p[1].x, y: p[1].y, ang: p[1].ang, w: p[1].w, fl: p[1].fl, fp: geom.leadFlip(p[1].w, p[1].spin), ls: p[1].ls };
      const g = geom.parryGap(qA, qB).gap;
      if (g < 0) {
        R.ov++;
        const d = -g;
        if (bloomEntry) {
          R.bloomOv++; if (d > INK) R.bloomVis++;
          if (!(p[0].figT > 0 || p[1].figT > 0)) R.classLeak++;
          if (seed === 27 && d > R.anchorWorst) { R.anchorWorst = d; R.anchor = { t: t0, axeBloom: p[0].w === 'axe' ? p[0].figT > 0 : p[1].figT > 0, wandBloom: p[0].w === 'wand' ? p[0].figT > 0 : p[1].figT > 0, w: p[0].w + '/' + p[1].w }; }
        } else {
          if (p[0].figT > 0 || p[1].figT > 0) R.nonBloomLeak++;
          if (prevBloom) R.expiry++;
          if (d > INK) {
            R.nonVis++;
            let mirror = false;
            if (have && prevParry.has(prevSub)) {
              const W0 = WEAPONS[p[0].w], W1 = WEAPONS[p[1].w];
              if (W0.lead !== undefined || W0.headLead !== undefined || W1.lead !== undefined || W1.headLead !== undefined) {
                mirror = geom.parryGap({ ...qA, fp: geom.leadFlip(p[0].w, prevS0) }, { ...qB, fp: geom.leadFlip(p[1].w, prevS1) }).gap > -INK;
              }
            }
            if (mirror) R.nonVisMirror++; else R.nonVisOther++;
          }
        }
      }
    }
    prevBloom = bloomEntry;
    const S = G.auditSubs;
    if (S.length) { const l = S.length - STR; prevSub = S[l]; prevS0 = S[l + A_SPIN]; prevS1 = S[l + B_SPIN]; have = true; }
    prevParry = new Set(); for (const e of G.events) if (e.kind === 'parry') prevParry.add(e.sub);
  }
}

console.log('B2 - the solid-free premise');
ok('B2 no parry fires on a tick where a fighter is bloomed at entry and at exit', R.premiseTicks >= 200 && R.premiseParries === 0,
  `${R.premiseParries} parry event(s) over ${R.premiseTicks} such tick(s) (floor 200), seeds ${SEEDS.join(',')}`);
console.log('B3 - the D1 anchor (non-vacuity)');
const a = R.anchor;
ok('B3 seed 27 reproduces the anchor: deepest overlap 26.100px at G.t 4941, axe bloomed, wand not, classified bloom',
  !!a && a.t === 4941 && Math.abs(R.anchorWorst - 26.1) < 0.0006 && a.axeBloom === true && a.wandBloom === false,
  a ? `${R.anchorWorst.toFixed(3)}px at G.t ${a.t}, ${a.w}, axe figT>0 ${a.axeBloom}, wand figT>0 ${a.wandBloom}` : 'no bloom overlap found on seed 27');
console.log('B4 - consistency of the classifier');
ok('B4 bloom-class overlaps all have figT > 0 at entry, the rest have none (consistency)',
  R.bloomOv >= 50 && R.classLeak === 0 && R.nonBloomLeak === 0,
  `${R.bloomOv} bloom-class overlap(s) (floor 50), ${R.bloomVis} visible; class leaks ${R.classLeak}/${R.nonBloomLeak}`);

console.log('CONTROL - the B1 checker must report each mutated copy');
const MUT = [
  ['stash removed', s => s.replace('entryFig[fi] = f.figT > 0;', '/* removed */')],
  ['bloom branch removed', s => s.replace('if (g < 0 && (entryFig[0] || entryFig[1])) {', 'if (false) {')],
  ['law 3s branch removed', s => s.replace('if (gB < 0 && entryFig[foeI]) shotRenderBladeBloom++;', 'if (false) shotRenderBladeBloom++;')],
  ['counter dropped from ACC_ADD', s => s.replace("'bloomPairTicks', 'bloomOverlap'", "'bloomOverlap'")],
  ['counter dropped from the merge', s => s.replace('bloomPairTicks, bloomOverlap, bloomVis, bloomWorst, shotRenderBladeBloom } = merged);', 'bloomOverlap, bloomVis, bloomWorst, shotRenderBladeBloom } = merged);')],
];
let caught = 0;
for (const [n, f] of MUT) {
  const m = f(mSrc);
  const changed = m !== mSrc;
  const r = changed ? checkMeasure(m) : [];
  if (changed && r.length) caught++;
  console.log(`  ${changed && r.length ? 'caught' : 'MISSED'} ${n}${r.length ? ' -> ' + r[0] : ''}`);
}
ok('CONTROL every mutated copy is reported by the B1 checker', caught === MUT.length, `${caught}/${MUT.length}`);

console.log(`\n${pass}/${pass + fail} passed`);
console.log(`REPORTED (not asserted): sample ${R.fight} fight tick(s) over seeds ${SEEDS.join(',')} (seed 27 stops at G.t 5100): ${R.ov} overlap(s), ${R.bloomOv} bloom-class, ${R.ov - R.bloomOv} not; non-bloom VISIBLE ${R.nonVis} = mirror class ${R.nonVisMirror} + neither ${R.nonVisOther}; bloom-expiry boundary overlaps (no bloom at entry, a bloom on the previous tick) ${R.expiry}.`);
console.log('NOT MEASURED: the drawn joke object\'s own silhouette against the foe\'s weapon.');
if (fail) { console.log(`${fail} FAILED`); process.exit(1); }
console.log(JSON.stringify({ check: 'bloom-proof', pass, fail, ok: fail === 0, fight: R.fight, bloomOv: R.bloomOv, nonVis: R.nonVis, nonVisMirror: R.nonVisMirror, nonVisOther: R.nonVisOther, expiry: R.expiry, anchorWorst: +R.anchorWorst.toFixed(3) }));
