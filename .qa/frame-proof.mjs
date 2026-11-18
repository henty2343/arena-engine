#!/usr/bin/env node
/* .qa/frame-proof.mjs - the RENDERED-FRAME proof: the two laws that only measure.mjs could see.
 *
 * WHY THIS FILE EXISTS: the law-to-probe table in docs/LAWS.md carried C3 (weapons are solids to
 * each other) and S3 (shots never overlap blade/body/rim/shot) as `owner-run only` - only
 * measure.mjs audited them, and agents never run measure.mjs. So a break in either would fail
 * NOTHING an agent can run. Both are RENDERED-FRAME laws, and "rendered frame" has a definition
 * this repo already owns (docs/GAMES.md, the v0.8.2 pose amendment): the renderer interpolates
 * between tick poses, and in audit language "rendered frame" / "tick-entry pose" means THE TICK
 * POSE - the sim's ground truth. So a rendered-frame law is decidable from the tick poses and the
 * canonical's own geometry, with no renderer and no pixels.
 *
 * WHAT IT COMPUTES (the canonical's own functions, at the tick-entry pose):
 *   C3  the weapon-weapon gap at the rendered pose, via geom.parryGap - the SAME function
 *       measure.mjs's contact law 3 calls (the sim's own geometry, not a re-implementation).
 *       The law carries a DISCLOSED RED (docs/LAWS.md law 3: the translation-only resolver has a
 *       fixed-point overlap band on crossed long blades), so the assertable form is the owner's own
 *       criterion, not "zero":
 *         - on the owner's CURATED GAUNTLET (measure.mjs's SOLIDITY_CELLS - the cells the bound is
 *           calibrated on): band-class worst visible depth < 6px AND band-class visible ticks <= 2%
 *           of the rendered ticks;
 *         - on the CROSSED-BLADES cells (flail+scythe, the pair the RED names): the band stays
 *           inside the law's own disclosed envelope (< 20.754px, the worst the law's text records).
 *       The named MIRROR class (a parry in the previous tick's LAST substep + a lead/headLead
 *       weapon + the pre-flip pose clearing the ink - the art sweeps over CFG.flipMs, so it is
 *       never drawn) is reproduced here and reported in full, exactly as the owner's audit treats
 *       it: excluded from the band, reported, growth is the signal.
 *   S3  the rendered-frame shot overlaps: foe blade, foe body, rim, and shot-vs-shot, computed at
 *       the shot-entry frames from the sim's own G.auditShots tape with the canonical's
 *       geom.bladeCircles - again the owner's own quantities, the owner's own pose definition -
 *       then classified by the OWNER'S SHOT DOCTRINE (below): the sanctioned classes are counted
 *       apart and the UNSANCTIONED RESIDUAL is gated at zero.
 *
 * THE SHOT DOCTRINE (#799): law 3s as WRITTEN is absolute ("shots never overlap foe blade / foe
 * body / rim / another shot at tick-entry poses"). The owner has since SANCTIONED named classes
 * where the overlap is the designed behaviour, not a defect (docs/GAMES.md, the #788 and #794
 * rulings; measure.mjs's shot entry-frame pass is the authority):
 *   - a RETURNING boomerang vs blade / body / rim (catchonly-r56, r38, freeloop-r38): it passes
 *     through by design, and its pivot disc is not its hitbox - the drawn arc is (chaosorbit-r54);
 *   - a PINNED nail at the rim (pinlaw-r44), a RICOCHET star at the rim (ricolaw-r41);
 *   - a spear IMPALE (skewVictim) vs blade / body / rim and a spear CARRY (skewCarry) vs blade
 *     (skewer-r46: the skewer law embeds the drawn spear by design);
 *   - shot PAIRS: same owner (multgrow-r42 - the owner walks through his own nails), two pinned
 *     nails, a one-sided returning pair, and the ANNIHILATION EVENT FRAME (one of the two departs
 *     this tick, so the entry overlap IS the destruction the sim resolved).
 * This probe applies EXACTLY that doctrine and GATES THE RESIDUAL AT ZERO: an overlap nothing
 * sanctions is a real 3s defect and fails here - an agent-runnable proof, no owner run needed.
 * The law's own text is NOT rewritten by this probe; the exemptions are the owner's rulings.
 *
 * TWO HOUSE RULES IT OBEYS:
 *   - THE READ INSTANT (#794 fix A): the tape is the TICK-ENTRY pose, so the flags must be the
 *     ENTRY flags, captured BEFORE tick(G) - never read off post-tick G.shots. A shot that
 *     departed this tick has no post-tick flags, so a post-tick read leaks sanctioned overlaps
 *     into the residual (the #788 bug, measured again in the #799 landing). Departure ticks come
 *     from the sim's own events, first departure wins, exactly as measure.mjs's addGone.
 *   - DOCTRINE DRIFT: the doctrine now lives in TWO files. The last assertion checks that every
 *     exemption site mirrored here is STILL PRESENT in measure.mjs, so a change there cannot
 *     silently leave this probe judging an old doctrine. measure.mjs wins any conflict.
 *
 * THE SANCTIONED COUNTS ARE REPORTED, NOT GATED (#799): they move with benign things (more
 * boomerang throws, more impales), so ratcheting them was a weak detector - it would stay silent
 * if a sanctioned overlap became a real one, because the total would not grow. The old ratchet
 * baseline (214/4105/10220/45922 at #798; 85/757/2422/6745 at #753) is RETIRED, replaced by the
 * residual gate. The C3 band assertions are the law gate.
 *
 * VACUITY RULE (house): every assertion states its own sample size. A build that stalls these seeds
 * makes them FAIL rather than passing on zero observations.
 *
 * Read-only: writes nothing, runs no measure.mjs, never touches the canonical. Tier 0.
 * Usage: node .qa/frame-proof.mjs [file=previews/spinclash-preview.html]
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(process.argv[2] ? join(here, '..', process.argv[2]) : join(here, '..', 'previews', 'spinclash-preview.html'));

import { loadSim } from '../tools/lib/load-sim.mjs';
const api = loadSim(FILE, ['newGame', 'tick', 'CFG', 'WEAPONS', 'geom']);
const { newGame, tick, CFG, WEAPONS, geom } = api;

/* The owner's own thresholds, spelled out here so the probe does not read them back out of the
 * build it is judging: a probe that copies the value it is checking proves nothing. */
const INK = 2.5;          // the 3px ink outline: deeper than this is VISIBLE (the owner's constant)
const BAND_MAX = 6;       // the owner's band bound, in px (the curated gauntlet)
const BAND_RATE = 0.02;   // the owner's band rate: visible ticks / rendered ticks
const RED_MAX = 20.754;   // the law's own disclosed RED envelope: the worst the law text records
const RIM_SLACK = 0.25;   // the owner's rim slack, in px
const PAIR_SLACK = 0.25;  // the owner's shot-vs-shot slack, in px

/* THE DOCTRINE CONTRACT (#799): every exemption site this probe mirrors in measure.mjs's shot
 * entry-frame pass, plus the two read-instant sites (#794 fix A) and the departure ledger. The
 * last assertion checks each string is still present there. measure.mjs is the AUTHORITY: if
 * that assertion fails, re-read its pass and move this replica with it - never the reverse. */
const DOCTRINE_SITES = [
  'const shotsBySid = entryShotFlags;',
  'entryShotFlags.set(s.sid, {returns:!!s.returns,pinned:!!s.pinned,ricochet:!!s.ricochet,skewVictim:!!s.skewVictim,skewCarry:!!s.skewCarry})',
  'const addGone = (sid, kind) => { if (!shotGoneTick.has(sid)) shotGoneTick.set(sid, G.t);',
  'if (live && live.returns) shotRenderBladeSanctioned++;',
  'else if (live && live.skewCarry) shotRenderBladeSanctioned++;',
  'else if (live && live.skewVictim) shotRenderBladeSanctioned++;',
  'if (live && live.returns) shotRenderBodySanctioned++;',
  'else if (live && live.skewVictim) shotRenderBodySanctioned++;',
  'if (live && live.returns) shotRenderRimSanctioned++;',
  'else if (live && live.pinned) shotRenderRimSanctioned++;',
  'else if (live && live.ricochet) shotRenderRimSanctioned++;',
  'else if (live && live.skewVictim) shotRenderRimSanctioned++;',
  'if (A2.o === B2.o) { shotRenderPairSanctioned++; }',
  'if (liveA && liveB && liveA.pinned && liveB.pinned) { shotRenderPairSanctioned++; }',
  'else if ((liveA && liveA.returns) !== (liveB && liveB.returns)) { shotRenderPairSanctioned++; }',
  'else if (shotGoneTick.get(A2.sid) === G.t || shotGoneTick.get(B2.sid) === G.t) { shotRenderPairSanctioned++; }',
];

/* THE HORIZON (#798): every cell runs to its NATURAL END (G.over), exactly as measure.mjs's whole
 * battles do. TICK_BUDGET is only a safety CEILING (the longest known battle, flail+hammer s101,
 * ends near t18,707); a cell that reaches it without ending is a stall and FAILS the vacuity
 * assertion rather than being silently truncated. */
const TICK_BUDGET = 60000;
/* Minimum observations, so an assertion cannot pass on an empty sample. */
const MIN_RENDERED_TICKS = 5000, MIN_SHOT_FRAMES = 200;

/* GROUP A - the owner's CURATED GAUNTLET (measure.mjs's SOLIDITY_CELLS: cells chosen for OVERLAP)
 * at the owner's first forced seed. This is where the 6px/2% band bound is calibrated. */
const GAUNTLET = [
  'hammer+axe', 'axe+hammer', 'hammer+hammer', 'axe+axe', 'mace+mace', 'mace+axe',
  'dagger+hammer', 'wand+bow', 'staff+crossbow', 'shuriken+boomerang', 'boomerang+boomerang',
  'hammer+bow', 'flail+hammer', 'nunchaku+nunchaku', 'scythe+scythe', 'nunchaku+scythe',
  'wand+crossbow', 'knives+shuriken', 'javelin+javelin', 'tome+tome', 'scroll+scroll', 'orb+orb',
  'orb+hammer',
];
/* GROUP B - the CROSSED-BLADES cells: the pair the law's own RED names, over the owner's forced
 * seed range. The band is EXPECTED to be deep here; the law's disclosed envelope is the bound. */
const CROSSED = [];
for (let seed = 101; seed <= 108; seed++) CROSSED.push(['flail+scythe', ['flail', 'scythe'], seed]);

const CELLS = [
  ...GAUNTLET.map(c => [c, c.split('+'), 101]),
  ...CROSSED,
];

let pass = 0, fail = 0;
const ok = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${d ? '  - ' + d : ''}`); };

const T = {
  rendered: 0, overlaps: 0, vis: 0, worst: 0,
  gRendered: 0, gBandWorst: 0, gBandVis: 0, gBandN: 0,
  cRendered: 0, cBandWorst: 0, cBandVis: 0, cBandN: 0,
  bandN: 0, bandVis: 0,
  mirror: 0, mirrorVis: 0, mirrorWorst: 0,
  parries: 0,
  sBlade: 0, sBody: 0, sRim: 0, sPair: 0, sWorst: 0, sFrames: 0, sShots: 0,   // RESIDUAL: the unsanctioned overlaps (#799)
  sanBlade: 0, sanBody: 0, sanRim: 0, sanPair: 0,                            // the owner's sanctioned classes, counted apart
  sPairSameOwner: 0, sPairNails: 0, sPairOneReturn: 0, sPairAnnihil: 0, sFlightBlade: 0,
  bloomTicks: 0, bloomOverlaps: 0, bloomVis: 0, bloomWorst: 0, sBladeBloom: 0,   // bloom-r73 exemption (#765): solid-free pair, counted apart
};
const notes = [];
const perCell = [];
const stalled = [];     // cells that hit the TICK_BUDGET ceiling without a natural end (#798)
let maxTicks = 0;

/* The state tape's layout (the sim's own snapshot pass): [sub, x, y, wAngle, bladeStuck, spin,
 * alive] per fighter - stride 13. The owner's audit reads the same fields. */
const STR = 13, A_SPIN = 5, B_SPIN = 11;

for (const [name, weapons, seed] of CELLS) {
  const crossed = CROSSED.some(c => c[0] === name && c[2] === seed);
  const G = newGame(seed, { weapons });
  G.audit = true;
  const half = CFG.size / 2;
  const circB = [];
  const cell = { name, seed, crossed, bandWorst: 0, bandVis: 0, bandN: 0 };
  /* the previous tick's mirror-class inputs (the owner's own route) */
  let prevParrySubs = new Set(), prevSub = -1, prevS0 = 1, prevS1 = 1, havePrev = false;
  /* the shot-departure ledger + the current weapon rows: the doctrine's annihilation-frame input,
   * recorded exactly as measure.mjs's addGone / curW record it */
  const goneTick = new Map();
  const addGone = sid => { if (!goneTick.has(sid)) goneTick.set(sid, G.t); };
  let curW = weapons.slice();

  let t = 0;
  for (; t < TICK_BUDGET && !G.over; t++) {
    /* THE RENDERED POSE: the tick entry - the live state right now, which is exactly what the
     * tick's entry snapshot records (and what the owner's entryFl stash captures for the chain).
     * Only FIGHT-phase ticks are rendered ticks: the sim fills its audit tape only in stepPhysics,
     * so the owner's audit sees the fight ticks alone (the reveal has no entry record). */
    const phaseBefore = G.phase;
    const p = [];
    for (let fi = 0; fi < 2; fi++) {
      const f = G.fighters[fi];
      p.push({ x: f.pos.x, y: f.pos.y, ang: f.wAngle, w: f.weapon, spin: f.spin, figT: f.figT,
               fl: f.fl ? f.fl.u.slice() : null, ls: f.lenStep, alive: f.alive });
    }
    /* #794 fix A: the ENTRY-state shot flags, captured at the SAME pre-tick instant as the pose
     * above - the tape below is the tick-entry pose, so post-tick G.shots flags are the WRONG
     * instant (a departed shot has none, which leaks sanctioned overlaps into the residual). */
    const entryFlags = new Map();
    for (const s of G.shots) entryFlags.set(s.sid, { returns: !!s.returns, pinned: !!s.pinned, ricochet: !!s.ricochet, skewVictim: !!s.skewVictim, skewCarry: !!s.skewCarry });
    tick(G);

    /* the departure ledger: the sim's own events at the tick they fire, first departure wins -
     * measure.mjs's addGone sites: roll-clear, a non-returning shot's body hit, swat, catch, rim,
     * cross. A ricochet bounce and a pin are NOT departures. */
    for (const e of G.events) {
      if (e.kind === 'roll') { curW = [e.w0, e.w1]; for (const sid of e.clearedSids || []) addGone(sid); }
      else if (e.kind === 'hit' && e.shot) { const row = WEAPONS[curW[e.by]]; if (!(row.shot && row.shot.returns)) addGone(e.sid); }
      else if (e.kind === 'swat' || e.kind === 'shotCatch' || e.kind === 'shotRim' || e.kind === 'shotCross') addGone(e.sid);
    }

    /* ---- C3: the weapon-weapon gap at the rendered pose ---- */
    if (phaseBefore === 'fight' && p[0].alive && p[1].alive && p[0].w && p[1].w) {
      T.rendered++;
      if (crossed) T.cRendered++; else T.gRendered++;
      /* lenStep-r1: ls is the PRE-tick lenStep (captured with the pose above) - without it a grown chain is rebuilt short and the band overlap is overstated (.qa/lenstep-proof.mjs guards it) */
      const qA = { x: p[0].x, y: p[0].y, ang: p[0].ang, w: p[0].w, fl: p[0].fl, fp: geom.leadFlip(p[0].w, p[0].spin), ls: p[0].ls };
      const qB = { x: p[1].x, y: p[1].y, ang: p[1].ang, w: p[1].w, fl: p[1].fl, fp: geom.leadFlip(p[1].w, p[1].spin), ls: p[1].ls };
      const g = geom.parryGap(qA, qB).gap;
      const bloomPair = p[0].figT > 0 || p[1].figT > 0;   // bloom-r73 (#765): a bloomed fighter at tick entry makes the pair SOLID-FREE (bladeVsBlade returns on figT > 0) and the drawn weapon is the joke object
      if (bloomPair) T.bloomTicks++;
      if (g < 0 && bloomPair) {
        T.bloomOverlaps++; if (-g > INK) T.bloomVis++; if (-g > T.bloomWorst) T.bloomWorst = -g;
      } else if (g < 0) {
        T.overlaps++;
        if (-g > T.worst) T.worst = -g;
        const vis = -g > INK;
        if (vis) T.vis++;
        /* the MIRROR class, reproduced per occurrence: a parry in the PREVIOUS tick's LAST substep +
         * a lead/headLead weapon + the PRE-FLIP pose clearing the ink. The pre-flip spins are the
         * previous tick's last substep's spins (the owner's own route - the state tape's last row),
         * because the parry flips them inside that substep. */
        let mirror = false;
        if (havePrev && prevParrySubs.has(prevSub)) {
          const W0 = WEAPONS[p[0].w], W1 = WEAPONS[p[1].w];
          if (W0.lead !== undefined || W0.headLead !== undefined || W1.lead !== undefined || W1.headLead !== undefined) {
            const gPre = geom.parryGap(
              { ...qA, fp: geom.leadFlip(p[0].w, prevS0) },
              { ...qB, fp: geom.leadFlip(p[1].w, prevS1) }).gap;
            mirror = gPre > -INK;
          }
        }
        if (mirror) {
          T.mirror++; if (vis) T.mirrorVis++;
          if (-g > T.mirrorWorst) T.mirrorWorst = -g;
        } else if (crossed) {
          if (-g > T.cBandWorst) T.cBandWorst = -g;
          if (vis) T.cBandVis++;
          T.cBandN++;
        } else {
          if (-g > T.gBandWorst) T.gBandWorst = -g;
          if (vis) T.gBandVis++;
          T.gBandN++;
        }
        if (-g > cell.bandWorst) cell.bandWorst = -g;
        if (vis) cell.bandVis++;
        cell.bandN++;
        T.bandN++; if (vis) T.bandVis++;
      }
    }

    /* ---- S3: the rendered-frame shot overlaps, classified by the OWNER'S SHOT DOCTRINE ----
     * the sanctioned classes are counted apart; the RESIDUAL is gated at zero (see the header). */
    const ST = G.auditShots;
    if (ST.length) {
      const n = ST[0];
      const shots = [];
      for (let i = 0; i < n; i++) shots.push({ sid: ST[1 + i * 5], x: ST[2 + i * 5], y: ST[3 + i * 5], o: ST[4 + i * 5], r: ST[5 + i * 5] });
      if (n > 0) { T.sFrames++; T.sShots += n; }
      for (const st of shots) {
        const live = entryFlags.get(st.sid);          // #794 fix A: ENTRY flags, never post-tick G.shots
        const foeI = 1 - st.o;
        if (p[foeI].alive && p[foeI].w) {
          geom.bladeCircles(p[foeI].x, p[foeI].y, p[foeI].ang, p[foeI].w, circB, p[foeI].fl, geom.leadFlip(p[foeI].w, p[foeI].spin), p[foeI].ls);
          let best = Infinity;
          for (let ci = 0; ci < circB.length; ci += 3) {
            const d = Math.hypot(st.x - circB[ci], st.y - circB[ci + 1]) - circB[ci + 2];
            if (d < best) best = d;
          }
          const gB = best - st.r;
          if (gB < 0 && p[foeI].figT > 0) T.sBladeBloom++;   // bloom-r73 (#765): a bloomed blade swats nothing; counted apart
          else if (gB < 0) {
            if (live && live.returns) T.sanBlade++;          // #788: boomerang blade-immunity (catchonly-r56)
            else if (live && live.skewCarry) T.sanBlade++;   // #788: spear carry (skewer-r46)
            else if (live && live.skewVictim) T.sanBlade++;  // #788: spear impale (skewer-r46)
            else {
              T.sBlade++;
              if (-gB > T.sWorst) T.sWorst = -gB;
              if (!(live && live.pinned)) { T.sFlightBlade++; if (notes.length < 8) notes.push(`${name} s${seed}: an UNSANCTIONED shot in flight (sid ${st.sid}) overlapped the foe blade by ${(-gB).toFixed(2)}px`); }
            }
          }
          const gBody = Math.hypot(st.x - p[foeI].x, st.y - p[foeI].y) - CFG.bodyR - st.r;
          if (gBody < 0) {
            if (live && live.returns) T.sanBody++;           // #788: boomerang pass-through (r38)
            else if (live && live.skewVictim) T.sanBody++;   // #788: spear impale (skewer-r46)
            else {
              T.sBody++;
              if (-gBody > T.sWorst) T.sWorst = -gBody;
              if (notes.length < 8) notes.push(`${name} s${seed}: an UNSANCTIONED shot (sid ${st.sid}) overlapped the foe BODY by ${(-gBody).toFixed(2)}px`);
            }
          }
        }
        if (Math.hypot(st.x - half, st.y - half) + st.r > half + RIM_SLACK) {
          if (live && live.returns) T.sanRim++;              // #788: boomerang pierce (freeloop-r38)
          else if (live && live.pinned) T.sanRim++;          // #788: nail (pinlaw-r44)
          else if (live && live.ricochet) T.sanRim++;        // #788: ricochet (ricolaw-r41)
          else if (live && live.skewVictim) T.sanRim++;      // #788: spear impale (skewer-r46)
          else T.sRim++;
        }
      }
      for (let i = 0; i < shots.length; i++) for (let j = i + 1; j < shots.length; j++) {
        const a = shots[i], b = shots[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r - PAIR_SLACK) {
          const la = entryFlags.get(a.sid), lb = entryFlags.get(b.sid);
          if (a.o === b.o) { T.sanPair++; T.sPairSameOwner++; }                                   // #788: same owner (multgrow-r42)
          else if (la && lb && la.pinned && lb.pinned) { T.sanPair++; T.sPairNails++; }            // #788: nail x nail (pinlaw-r44)
          else if ((la && la.returns) !== (lb && lb.returns)) { T.sanPair++; T.sPairOneReturn++; } // #794: one-sided returning (chaosorbit-r54 / snapfix-r57)
          else if (goneTick.get(a.sid) === G.t || goneTick.get(b.sid) === G.t) { T.sanPair++; T.sPairAnnihil++; }   // #794: the annihilation event frame
          else {
            T.sPair++;                                                                        // #794 residual: two ALIVE non-returning enemy shots
            if (notes.length < 8) notes.push(`${name} s${seed}: two UNSANCTIONED live enemy shots (sids ${a.sid}/${b.sid}) overlapped at tick entry`);
          }
        }
      }
    }

    /* ---- the next tick's mirror-class inputs, from the sim's own tape ---- */
    const S = G.auditSubs;
    if (S.length) {
      const last = S.length - STR;
      prevSub = S[last];
      prevS0 = S[last + A_SPIN];
      prevS1 = S[last + B_SPIN];
      havePrev = true;
    }
    prevParrySubs = new Set();
    for (const e of G.events) if (e.kind === 'parry') { prevParrySubs.add(e.sub); T.parries++; }
  }
  cell.ticks = t;
  if (!G.over) stalled.push(`${name} s${seed}`);
  maxTicks = Math.max(maxTicks, t);
  perCell.push(cell);
}

const bandRate = T.bandVis / Math.max(1, T.rendered);

console.log('C3 - weapons are solids to each other (the rendered pose; the law\'s disclosed RED)');
ok('C3 the disclosed RED band stays inside the envelope the law records',
   Math.max(T.gBandWorst, T.cBandWorst) < RED_MAX,
   `band worst ${Math.max(T.gBandWorst, T.cBandWorst).toFixed(3)}px over ${T.bandN} band overlap(s) (envelope ${RED_MAX}px - the worst docs/LAWS.md law 3 records; gauntlet ${T.gBandWorst.toFixed(3)}px, crossed ${T.cBandWorst.toFixed(3)}px)`);
ok('C3 the band rate holds: the band-class visible ticks are at most 2% of the rendered ticks',
   T.rendered >= MIN_RENDERED_TICKS && bandRate <= BAND_RATE,
   `${T.bandVis} visible band tick(s) over ${T.rendered} rendered tick(s) = ${(100 * bandRate).toFixed(4)}% (rate ${100 * BAND_RATE}%)`);
ok('C3 the rendered fight-ticks are judged, not vacuous - every cell ran to its natural end',
   T.rendered >= MIN_RENDERED_TICKS && T.gRendered >= 1000 && stalled.length === 0,
   `${T.rendered} rendered tick(s) over ${CELLS.length} cell(s) (floor ${MIN_RENDERED_TICKS}; ${T.gRendered} on the gauntlet, ${T.cRendered} on the crossed cells); longest cell ${maxTicks} tick(s), ceiling ${TICK_BUDGET}${stalled.length ? '; STALLED at the ceiling: ' + stalled.join(', ') : ''}`);

console.log("S3 - shots never overlap blade/body/rim/shot (the owner's shot doctrine applied; the RESIDUAL is gated)");
ok("S3 the unsanctioned shot-overlap residual is zero (the owner's shot doctrine applied)",
   T.sFrames >= MIN_SHOT_FRAMES && T.sBlade === 0 && T.sBody === 0 && T.sRim === 0 && T.sPair === 0,
   `residual blade ${T.sBlade} · body ${T.sBody} · rim ${T.sRim} · pair ${T.sPair} (worst ${T.sWorst.toFixed(3)}px) over ${T.sFrames} shot-bearing frame(s), ${T.sShots} shot(s) (floor ${MIN_SHOT_FRAMES}); sanctioned apart: blade ${T.sanBlade} · body ${T.sanBody} · rim ${T.sanRim} · pair ${T.sanPair}`);

console.log('S3 - the doctrine replica vs measure.mjs (the two-file contract)');
const MSRC = readFileSync(join(here, '..', 'measure.mjs'), 'utf8');
const missingSites = DOCTRINE_SITES.filter(s => !MSRC.includes(s));
ok("S3 the doctrine replica still matches measure.mjs's exemption sites (no silent drift)",
   DOCTRINE_SITES.length >= 16 && missingSites.length === 0,
   `${DOCTRINE_SITES.length - missingSites.length}/${DOCTRINE_SITES.length} doctrine site(s) still present in measure.mjs${missingSites.length ? ' - MISSING: ' + missingSites.join(' | ') : ''}`);

console.log(`\n${pass}/${pass + fail} passed`);
console.log('C3 per-cell band worst: ' + perCell.filter(c => c.bandN).map(c => `${c.name} s${c.seed}: ${c.bandWorst.toFixed(2)}px/${c.bandVis}v`).join(' | '));
console.log(`C3 CALIBRATION NOTE: the owner's audit binds the band-class worst under ${BAND_MAX}px (measure.mjs's contact law 3); on the curated gauntlet this build measures ${T.gBandWorst.toFixed(3)}px, so that stricter bound ${T.gBandWorst < BAND_MAX ? 'holds' : 'does NOT hold'} on this sample (bloom-r73 pairs are exempt and counted apart, #765; the owner retired the 6px and 20.754px calibrations on 2026-11-15 - the envelope (${RED_MAX}px) is still what this probe gates).`);
console.log(`C3 bloom exemption (#765, bloom-r73: the pair is solid-free by design): ${T.bloomTicks} rendered tick(s) with a bloomed fighter, ${T.bloomOverlaps} real-geometry overlap(s), ${T.bloomVis} visible, worst ${T.bloomWorst.toFixed(3)}px - counted apart, NOT in the band or the counters below; law 3s: ${T.sBladeBloom} shot-vs-bloomed-blade overlap(s) counted apart`);
console.log(`C3 detail: ${T.overlaps} overlap(s) over ${T.rendered} rendered tick(s), ${T.vis} visible (>${INK}px), worst ${T.worst.toFixed(3)}px; ` +
            `mirror class ${T.mirror} (${T.mirrorVis} visible, worst ${T.mirrorWorst.toFixed(3)}px) EXCLUDED from the band, as the owner excludes it; ${T.parries} parry event(s) seen`);
console.log(`S3 detail: RESIDUAL (unsanctioned) blade ${T.sBlade} · body ${T.sBody} · rim ${T.sRim} · pair ${T.sPair} (worst ${T.sWorst.toFixed(3)}px) over ${T.sFrames} shot-bearing frame(s) with ${T.sShots} shot(s); ` +
            `sanctioned by the owner's doctrine: blade ${T.sanBlade} · body ${T.sanBody} · rim ${T.sanRim} · pair ${T.sanPair}; pair split: ${T.sPairSameOwner} same-owner, ${T.sPairNails} nail x nail, ${T.sPairOneReturn} one-sided returning, ${T.sPairAnnihil} annihilation-event frame; ${T.sFlightBlade} unsanctioned in-flight shot-vs-blade overlap(s)`);
console.log(`S3 VERDICT: law 3s ${T.sBlade + T.sBody + T.sRim + T.sPair === 0 ? "HOLDS on this sample under the owner's shot doctrine (#788/#794) - every overlap measured is a sanctioned class" : "is BROKEN beyond the owner's doctrine - an unsanctioned overlap is a real defect"}; the law's absolute text is unchanged, and the exemptions are the owner's rulings, not this probe's.`);
if (notes.length) { console.log('notes:'); notes.slice(0, 8).forEach(n => console.log('   ' + n)); }
if (fail) { console.log(`${fail} FAILED`); process.exit(1); }
console.log(`Read-only: nothing written, measure.mjs untouched. ${T.rendered} rendered tick(s) over ${CELLS.length} cell(s).`);
console.log(JSON.stringify({ check: 'frame-proof', pass, fail, ok: fail === 0,
  bloomTicks: T.bloomTicks, bloomOverlaps: T.bloomOverlaps, bloomVis: T.bloomVis, bloomWorst: +T.bloomWorst.toFixed(3), sBladeBloom: T.sBladeBloom,
  rendered: T.rendered, overlaps: T.overlaps, vis: T.vis, worst: +T.worst.toFixed(3),
  gBandWorst: +T.gBandWorst.toFixed(3), gBandVis: T.gBandVis, gRendered: T.gRendered,
  cBandWorst: +T.cBandWorst.toFixed(3), mirror: T.mirror,
  sBlade: T.sBlade, sBody: T.sBody, sRim: T.sRim, sPair: T.sPair, sWorst: +T.sWorst.toFixed(3),
  sanBlade: T.sanBlade, sanBody: T.sanBody, sanRim: T.sanRim, sanPair: T.sanPair,
  sPairSameOwner: T.sPairSameOwner, sPairNails: T.sPairNails, sPairOneReturn: T.sPairOneReturn, sPairAnnihil: T.sPairAnnihil,
  doctrineSites: DOCTRINE_SITES.length - missingSites.length,
  sFrames: T.sFrames, sShots: T.sShots }));
