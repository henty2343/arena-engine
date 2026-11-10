/* scratch/triage/patch-leadproof.mjs — asserted-patch (Item-3 triage, session 6, 2026-11-11).
 * Target: .qa/leadproof.mjs. Menu item 6: the javelin's CUT-FREE WINDOW made 15 swat cells red.
 *
 * LP1 — SKEWER into the extracted return list. The cut law's constant lives in the canonical
 *   (SKEWER.cutCos = 0.75, canonical :1614) and the proof's harness returned
 *   { newGame, tick, CFG, WEAPONS, WEAPON_IDS, geom, drawWeaponOn } — no SKEWER, so the re-seeded
 *   cell could not read the law it has to audit. (The session-2 handoff flagged exactly this.)
 *
 * LP2 — the swat cell, re-seeded into TWO classes discriminated by the STORED gap:
 *   - the TOUCH class (canonical :3663): killShot stores `best - st.r` with best < st.r, so the
 *     stored gap is STRICTLY NEGATIVE. The circle recompute applies, unchanged.
 *   - the CUT class (canonical :3654): the skewer's cut-free window — the victim's blade cuts the
 *     anchored spear on an ANGLE test and there is NO circle contact, so the touch recompute
 *     cannot apply. killShot stores exactly 0.
 *   The cell used to assert that EVERY swat is a circle touch; that law predates skewer-r46 /
 *   impale-r48 (the cut-free window was added at skewer-r46, AFTER Part B was written), so it
 *   FAILed on correct code — 15 javelin swats, 0 true contact failures. Both classes stay audited
 *   from stored fields alone: the cut class by the angle law
 *     cos(fAng)·wx + sin(fAng)·wy  over  wd  >  SKEWER.cutCos,
 *   the touch class by the circle recompute. Nothing becomes unauditable — the menu's retire
 *   option (drop the 15 javelin cells) would have lost EVERY flagged-swat audit, which r64's
 *   lesson says never to fly blind on.
 *
 * LP3 — the class counters + their non-vacuity asserts: a branch that measured nothing cannot
 *   claim a pass, so both classes must be exercised in the run (the cut class is the whole point
 *   of the re-seed; the touch class must not be silently dropped in the process).
 *
 * LP4 — the header's Part B sentence, so the file's own summary names both classes.
 *
 * Method (owner non-negotiable): exact-match + expected count, fail loudly, write nothing on mismatch.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = '.qa/leadproof.mjs';
let src = readFileSync(FILE, 'utf8');

const patches = [
  { id: 'LP1a-exports', count: 1,
    old: `  body + '\\n;return { newGame, tick, CFG, WEAPONS, WEAPON_IDS, geom, drawWeaponOn };')(`,
    new: `  body + '\\n;return { newGame, tick, CFG, WEAPONS, WEAPON_IDS, geom, drawWeaponOn, SKEWER };')(` },

  { id: 'LP1b-destructure', count: 1,
    old: `const { newGame, tick, CFG, WEAPONS, geom } = api;`,
    new: `/* RE-SEEDED 2026-11-11 (session 6, menu item 6): SKEWER joins the extracted surface — the
 * cut-free window's law constant (SKEWER.cutCos, canonical :1614) is what the cut-class swat cell
 * has to audit against. It was NOT in the returned set, so the cell could not read its own law. */
const { newGame, tick, CFG, WEAPONS, geom, SKEWER } = api;` },

  { id: 'LP2-swat-cell', count: 1,
    old: `        } else if (e.kind === 'swat') {
          swats++;
          if (WEAPONS[e.fW].lead) flaggedSwats++;
          const circ = geom.bladeCircles(e.fx, e.fy, e.fAng, e.fW, [], undefined, geom.leadFlip(e.fW, e.fSp));
          let best = Infinity;
          for (let ci = 0; ci < circ.length; ci += 3) {
            const d = Math.hypot(e.x - circ[ci], e.y - circ[ci + 1]) - circ[ci + 2];
            if (d < best) best = d;
          }
          ok(best - e.sr <= 1e-4, \`\${name} s\${seed} t\${e.tick}: swat touch gap \${(best - e.sr).toExponential(2)} <= 0\`);
        }`,
    new: `        } else if (e.kind === 'swat') {
          swats++;
          if (WEAPONS[e.fW].lead) flaggedSwats++;
          /* RE-SEEDED 2026-11-11 (session 6, menu item 6): TWO swat classes, discriminated by the
           * STORED gap. SUPERSEDED (kept visible): the cell used to assert that EVERY swat is a
           * circle touch —
           *   ok(best - e.sr <= 1e-4, '... swat touch gap ...')
           * That law predates the skewer's CUT-FREE WINDOW (skewer-r46 / impale-r48, canonical
           * :3654): the victim's blade cuts the anchored spear on an ANGLE test, with NO circle
           * contact at all, so the touch recompute cannot apply to that class. It FAILed on CORRECT
           * code — 15 javelin swats, and 0 true contact failures anywhere in the suite (verified by
           * scratch/triage/diag-lead-swat.mjs).
           * The stored gap tells the classes apart:
           *   - TOUCH class (canonical :3663): killShot stores \`best - st.r\` with best < st.r, so
           *     the stored gap is STRICTLY NEGATIVE. The circle recompute applies, unchanged.
           *   - CUT class (canonical :3654): the cut-free window. killShot stores exactly 0.
           * Both classes stay audited from stored fields alone — the cut class by the ANGLE law
           * (cos(fAng)·wx + sin(fAng)·wy over wd > SKEWER.cutCos), the touch class by the circle
           * recompute — so NO swat becomes unauditable. */
          if (e.gap === 0) {
            cutSwats++;
            const wx = e.x - e.fx, wy = e.y - e.fy, wd = Math.hypot(wx, wy) || 1;
            const cosv = (Math.cos(e.fAng) * wx + Math.sin(e.fAng) * wy) / wd;
            ok(cosv > SKEWER.cutCos, \`\${name} s\${seed} t\${e.tick}: cut-window swat — the blade's outward radial cos \${cosv.toFixed(3)} > cutCos \${SKEWER.cutCos}\`);
          } else {
            touchSwats++;
            const circ = geom.bladeCircles(e.fx, e.fy, e.fAng, e.fW, [], undefined, geom.leadFlip(e.fW, e.fSp));
            let best = Infinity;
            for (let ci = 0; ci < circ.length; ci += 3) {
              const d = Math.hypot(e.x - circ[ci], e.y - circ[ci + 1]) - circ[ci + 2];
              if (d < best) best = d;
            }
            ok(best - e.sr <= 1e-4, \`\${name} s\${seed} t\${e.tick}: swat touch gap \${(best - e.sr).toExponential(2)} <= 0\`);
          }
        }` },

  { id: 'LP3-counters', count: 1,
    old: `  let hits = 0, parries = 0, swats = 0, flaggedHits = 0, flaggedParrySides = 0, flaggedSwats = 0;`,
    new: `  let hits = 0, parries = 0, swats = 0, flaggedHits = 0, flaggedParrySides = 0, flaggedSwats = 0;
  let cutSwats = 0, touchSwats = 0;   // RE-SEEDED 2026-11-11 (session 6, LP3): the two swat classes, counted separately — a branch that measured nothing cannot claim a pass` },

  { id: 'LP4-nonvacuity', count: 1,
    old: `  ok(flaggedHits > 50, \`non-vacuity: flagged-weapon hits exercised (\${flaggedHits})\`);
  ok(flaggedParrySides > 20, \`non-vacuity: flagged parry sides (\${flaggedParrySides})\`);
  console.log(\`  Part B: hits \${hits} (flagged \${flaggedHits}), parries \${parries} (flagged sides \${flaggedParrySides}), swats \${swats} (flagged \${flaggedSwats}) — every one recomputed from stored fields\`);`,
    new: `  ok(flaggedHits > 50, \`non-vacuity: flagged-weapon hits exercised (\${flaggedHits})\`);
  ok(flaggedParrySides > 20, \`non-vacuity: flagged parry sides (\${flaggedParrySides})\`);
  /* RE-SEEDED 2026-11-11 (session 6, LP3): BOTH swat classes must be exercised — the cut class is
   * the whole point of the re-seed, and the touch class must not have been silently dropped. */
  ok(cutSwats > 0, \`non-vacuity: cut-window swats exercised (\${cutSwats})\`);
  ok(touchSwats > 0, \`non-vacuity: touch-class swats exercised (\${touchSwats})\`);
  console.log(\`  Part B: hits \${hits} (flagged \${flaggedHits}), parries \${parries} (flagged sides \${flaggedParrySides}), swats \${swats} (flagged \${flaggedSwats}) — touch-class \${touchSwats}, cut-window \${cutSwats}; every one recomputed from stored fields\`);` },

  { id: 'LP5-header', count: 1,
    old: ` * Part B  — flagged battles stay auditable from stored events: every hit's
 *   contact recomputes to ≤0.3px, every parry's ENTRY poses to gap ≤ EPS,
 *   every swat's touch to ≤ EPS — using ONLY the event fields (aSp/bSp/fSp),
 *   the way measure.mjs's laws do. No new unauditable class.`,
    new: ` * Part B  — flagged battles stay auditable from stored events: every hit's
 *   contact recomputes to ≤0.3px, every parry's ENTRY poses to gap ≤ EPS,
 *   every swat to ≤ EPS — using ONLY the event fields (aSp/bSp/fSp),
 *   the way measure.mjs's laws do. No new unauditable class.
 *   RE-SEEDED 2026-11-11 (session 6, menu item 6): a swat is audited by the class its STORED
 *   gap names — the TOUCH class (gap strictly negative) by the circle recompute, the CUT class
 *   (gap exactly 0, the skewer's cut-free window) by the ANGLE law. Both are audited; neither is
 *   dropped. The one-class law that predated skewer-r46 FAILed on correct code.` },
];

let mismatches = 0;
for (const p of patches) {
  const parts = src.split(p.old);
  const found = parts.length - 1;
  if (found !== p.count) {
    console.error(`MISMATCH ${p.id}: expected ${p.count} occurrence(s), found ${found}. WRITING NOTHING.`);
    mismatches++;
  }
}
if (mismatches) process.exit(1);
for (const p of patches) {
  src = src.replace(p.old, p.new);
  console.log(`  ok ${p.id}: replaced exactly ${p.count}`);
}
writeFileSync(FILE, src);
console.log(`PATCHED ${FILE}: ${patches.length}/${patches.length} replacements, 0 mismatches`);
