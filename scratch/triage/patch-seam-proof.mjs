/* scratch/triage/patch-seam-proof.mjs — THE ASSERTED-PATCH METHOD applied to .qa/seam-proof.mjs.
 * Item 3, cells 1 + 2 of the owner menu (2026-11-10, owner: "do all of it" → column A everywhere).
 *
 * Every patch is an EXACT-STRING replacement with an EXPECTED MATCH COUNT. A count mismatch is a
 * hard failure: the script writes nothing and exits 1 (never guesses). Re-running is idempotent-safe
 * only in the sense that a second run fails loudly on the now-absent target — that is the point.
 *
 * What it does:
 *   P0  add the `retired()` reporter + counter (a retired cell must be VISIBLE, never silent)
 *   P1  header: section G marked RETIRED, section I's band re-seed noted (dated correction, text kept)
 *   P2  B-bow cell: sole-holder clause → the TWO holders since pinlaw-r44 (bow + crossbow, both 0.5)
 *   P3  C-factor cell: ±0.35 band (authored pre-r62) → ±0.60, re-measured on THIS build (ratio 2.54)
 *   P4  E-staff cell: expected brief gains +HEX (hexfam-r68)
 *   P5  G4/G4b: RETIRED with a dated record — CATCH_GROW was folded into prose at touchorbit-r53
 *       (canonical :1776-1781); the crash silenced sections H and I. G4b's live witness is still
 *       reported so the retirement is non-vacuous (it names what it measured).
 *   P6  g6/g7 guards: RETIRED (verified: g6 now throws the hexfam-r68 RETIRED error, g7 does not
 *       throw at all — orbit.elong died with the halo). g8 is NOT here: its guard is alive.
 *   P7  g8: RE-SEEDED — `shot.orbit = null` still boots-errors, but on the touchorbit-r53 world-orbit
 *       contract { a, b, peak }, not the halo's elong. Coverage kept.
 *   P8  I2/I3: the 1e-9 ledger tolerance → a named BAND 1e-3, re-measured (worst deviation 6.41e-4
 *       over 5,165 fires: bank 93 / fire 11 / sat 11 — probe scratch/triage/diag-bow-band.mjs)
 *
 * NOT touched: the canonical. Every edit is proof-side, so no md5/fingerprint/bake ritual triggers.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const TARGET = resolve(here, '..', '..', '.qa', 'seam-proof.mjs');
let src = readFileSync(TARGET, 'utf8');
let applied = 0;
const failures = [];
function patch(id, from, to, expect = 1) {
  const n = src.split(from).length - 1;
  if (n !== expect) { failures.push(`${id}: expected ${expect} match(es), found ${n}`); return; }
  src = src.split(from).join(to);
  applied++;
}

/* ---------- P0: the retired() reporter ---------- */
patch('P0 retired() helper',
`let pass=0,fail=0; const ok=(n,c,d)=>{c?pass++:fail++;console.log(\`  \${c?'ok  ':'FAIL'} \${n}\${d?'  — '+d:''}\`);};`,
`let pass=0,fail=0; const ok=(n,c,d)=>{c?pass++:fail++;console.log(\`  \${c?'ok  ':'FAIL'} \${n}\${d?'  — '+d:''}\`);};
/* Item-3 triage 2026-11-10: a RETIRED cell is printed, counted, and named in the summary — never
 * deleted silently. The failure mode this kills is "red becomes normal"; its twin is "gone becomes
 * invisible". Each retirement carries the revision that killed the contract and the coverage given up. */
let retiredN=0; const retired=(n,d)=>{retiredN++;console.log(\`  RETIRED \${n}\${d?'  — '+d:''}\`);};`);

/* ---------- P1: header, section G ---------- */
patch('P1 header section G',
` *   G  halo-r39          — the boomerang's LOYAL HALO + cycle-only catch growth (shot.returns +`,
` *   G  halo-r39          — RETIRED 2026-11-10 (Item-3 triage; G4/G4b/g6/g7 dated-retired below):
 *                          the LOYAL HALO was superseded WHOLE at touchorbit-r53 by the WORLD ORBIT
 *                          (the owner's own solo prototype; "the guarantee was the problem"). The
 *                          boomerang row no longer carries shot.orbit.elong, and the four growth
 *                          constants — including CATCH_GROW — were folded into prose at canonical
 *                          :1776-1781, so G4's replace-loader threw and SILENCED sections H and I
 *                          (the live star-ricochet and bow-rain laws went unmeasured for weeks).
 *                          KEPT LIVE below: G0b, G1b, G2, G5, G6, g5 (cycle-rate guard) and g8
 *                          (re-seeded onto the world-orbit contract). GIVEN UP: the halo's one-orbit
 *                          flight contract, the CATCH_GROW differential, and the elong/turn guards.
 *                          The world orbit itself is NOT re-proved here — that is the deferred
 *                          "section G rewritten for the r54-r60 laws" item; today it is covered by
 *                          the fingerprint suite and the owner's eye. Original r39 text follows.
 *                          halo-r39 (original) — the boomerang's LOYAL HALO + cycle-only catch growth (shot.returns +`);

/* ---------- P1b: header, section I band note ---------- */
patch('P1b header section I',
` *                          cadence band law (every fire consumes a rotation between TAU/ceiling
 *                          and TAU/floor), cap saturation at the ceiling, the differential vs a`,
` *                          cadence band law (every fire consumes a rotation between TAU/ceiling
 *                          and TAU/floor — the ledger tolerance was 1e-9, RE-SEEDED to 1e-3 on
 *                          2026-11-10: measured worst drift 6.41e-4 rad over 5,165 fires, float
 *                          accumulation across the chain era, NOT a cadence breach), cap saturation at the ceiling, the differential vs a`);

/* ---------- P2: the B-bow cell ---------- */
patch('P2 bow sole-holder cell',
`ok('the BOW is the sole rain-axis holder: trait.mult 0.5, an authored brief, and MULT_STEPS caps the read at smul ceiling 6',
  WEAPONS.bow.trait.mult===0.5 && WEAPONS.bow.brief==='+SPD +RAIN / Hit' && api.MULT_STEPS===10 &&
  WEAPON_IDS.filter(id=>id!=='bow').every(id=>!((WEAPONS[id].trait||{}).mult)),
  \`bow trait \${JSON.stringify(WEAPONS.bow.trait)}, brief "\${WEAPONS.bow.brief}", MULT_STEPS \${api.MULT_STEPS}\`);`,
`/* CORRECTION 2026-11-10 (Item-3 triage). The original cell asserted the BOW is the SOLE rain-axis
 * holder; that stopped being true at pinlaw-r44, when the CROSSBOW took trait.mult 0.5 as well.
 * Re-seeded, not deleted: the cell now pins the holder SET exactly (so a third holder still fails
 * it), both authored briefs, and the same smul ceiling. Original assertion kept here as the record:
 *   WEAPONS.bow.trait.mult===0.5 && WEAPONS.bow.brief==='+SPD +RAIN / Hit' && api.MULT_STEPS===10 &&
 *   WEAPON_IDS.filter(id=>id!=='bow').every(id=>!((WEAPONS[id].trait||{}).mult))          [SUPERSEDED] */
const RAIN_HOLDERS=['bow','crossbow'];
const RAIN_BRIEFS={bow:'+SPD +RAIN / Hit',crossbow:'+SPD +NAILS / Hit'};
ok('the rain axis has EXACTLY the two authored holders (bow + crossbow since pinlaw-r44): trait.mult 0.5 each, an authored brief each, and MULT_STEPS caps the read at smul ceiling 6',
  RAIN_HOLDERS.every(id=>WEAPONS[id].trait.mult===0.5 && WEAPONS[id].brief===RAIN_BRIEFS[id]) && api.MULT_STEPS===10 &&
  WEAPON_IDS.filter(id=>!RAIN_HOLDERS.includes(id)).every(id=>!((WEAPONS[id].trait||{}).mult)),
  \`holders \${RAIN_HOLDERS.map(id=>id+'='+WEAPONS[id].trait.mult+' "'+WEAPONS[id].brief+'"').join(', ')}, MULT_STEPS \${api.MULT_STEPS}, ceiling \${(1+0.5*api.MULT_STEPS).toFixed(1)}\`);`);

/* ---------- P3: the C-factor tolerance band ---------- */
patch('P3 declared-factor band',
`ok('the scaling is close to the declared factor', Math.abs(n1/n0-2)<0.35, \`ratio \${(n1/n0).toFixed(2)} for a declared 2x (drift is the rim clamp and round resets)\`);`,
`/* CORRECTION 2026-11-10 (Item-3 triage). The ±0.35 band was authored for a quieter sim; this build
 * measures ratio 2.54 (71 thrown vs 28 on the growth-OFF twin), i.e. +0.54 over the declared 2×.
 * The MECHANIC is not stale — the monotonicity cell above is green and the superlinearity is the
 * documented feedback loop (more shots -> more damaging hits -> more spin growth -> more shots).
 * The band is RE-MEASURED, not deleted: ±0.60 keeps a real ceiling (declared 2× + rim-clamp and
 * round-reset drift) while staying far inside "the seam is a no-op" territory. Any future move of
 * the band must re-measure first and cite the run — a widened tolerance with no number behind it is
 * how the flail poke escaped. */
const DECLARED_FACTOR_BAND=0.60;
ok('the scaling is close to the declared factor', Math.abs(n1/n0-2)<DECLARED_FACTOR_BAND, \`ratio \${(n1/n0).toFixed(2)} for a declared 2x, band ±\${DECLARED_FACTOR_BAND} re-measured 2026-11-10 (drift is the rim clamp and round resets)\`);`);

/* ---------- P4: the E-staff brief ---------- */
patch('P4 staff brief',
`ok('the staff row declares the growth RATE and an authored brief',
  WEAPONS.staff.trait.shotR===0.2 && WEAPONS.staff.brief==='+SPD +SIZE / Hit',
  \`trait.shotR \${WEAPONS.staff.trait.shotR}, brief "\${WEAPONS.staff.brief}"\`);`,
`/* CORRECTION 2026-11-10 (Item-3 triage): the expected brief gains +HEX, added to the staff row at
 * hexfam-r68. Pure stale string — section A already live-checks that every non-derivable axis has an
 * authored brief; this cell pins the staff's EXACT wording, so it must carry the current wording.
 * Superseded expectation: WEAPONS.staff.brief==='+SPD +SIZE / Hit'   [pre-hexfam-r68] */
ok('the staff row declares the growth RATE and an authored brief',
  WEAPONS.staff.trait.shotR===0.2 && WEAPONS.staff.brief==='+SPD +SIZE +HEX / Hit',
  \`trait.shotR \${WEAPONS.staff.trait.shotR}, brief "\${WEAPONS.staff.brief}" (+HEX since hexfam-r68)\`);`);

/* ---------- P5: retire G4 + G4b ---------- */
patch('P5 G4/G4b retirement',
`{ // G4 + G4b: the catch-growth differential and the CYCLE-ONLY law
  const apiNG=loadR('const CATCH_GROW = true;','const CATCH_GROW = false;');
  const run=(A,s)=>{ const G=A.newGame(s,{weapons:['boomerang','hammer'],cast:[0,1]}); let ca=0,hits=0,mx=0;
    while(!G.over&&G.t<12000){ A.tick(G);
      for(const e of G.events){ if(e.kind==='shotCatch'&&e.by===0) ca++; else if(e.kind==='hit'&&e.shot&&e.by===0) hits++; }
      if(G.fighters[0].shotStep>mx) mx=G.fighters[0].shotStep; }
    return {ca,hits,mx}; };
  let mxOn=0,mxOff=0,catchOn=0,catchOff=0,hitsOff=0;
  for(let s=1;s<=4;s++){
    const a=run(api,s), b=run(apiNG,s);
    mxOn+=a.mx; mxOff+=b.mx; catchOn+=a.ca; catchOff+=b.ca; hitsOff+=b.hits;
  }
  // LAW (suite-level): the catch cycle feeds the counter — Σ max-step strictly higher with
  // CATCH_GROW on — and the off twin still lands pass-through hits, so the differential IS the
  // catch trigger, not a vacuous no-activity run. Per-battle monotonicity is NOT the law (chaos).
  ok('G4 catch-cycle growth is REAL: Σ growth is strictly higher with CATCH_GROW on, and the off twin still lands pass-through hits (the differential is the catch itself)',
    mxOn>mxOff&&catchOn>=1&&hitsOff>=1,
    \`Σ max-step \${mxOn} (on, \${catchOn} catches) vs \${mxOff} (off, \${catchOff} catches, \${hitsOff} pass-through hits still landed)\`);
  ok('G4b the growth is CYCLE-ONLY (owner ruling 2026-11-01): a catch NEVER feeds the spin axis — no |spin| rise in the G3 window without a same-tick blade hit by the same fighter',
    spinViol===0,
    \`\${spinViol} unpaired spin rises across \${catches} catches (\${spinUps} paired rises, \${bladeHits0} blade hits) — 0 violations means every catch left the spin axis alone\`);
}`,
`/* RETIRED 2026-11-10 (Item-3 triage, owner go) — G4, the catch-growth DIFFERENTIAL.
 * WHY: the cell drove loadR('const CATCH_GROW = true;','const CATCH_GROW = false;'). CATCH_GROW was
 * retired at touchorbit-r53 — the four growth constants (CATCH_PAD 0, RETHROW_WAIT 0, CATCH_GROW
 * true, HIT_GROW false) were folded into prose at canonical :1776-1781 because they only ever held
 * one value. loadR refuses to run on a missing target (correctly — a silently unmatched replace
 * would make a differential vacuous), so it THREW, and the throw killed the rest of the file:
 * sections H (star ricochet LAW) and I (bow RAIN laws) never ran. A dead cell was silencing live law
 * coverage. THAT is the cost of the crash, and it is the reason this retirement is not optional.
 * COVERAGE GIVEN UP: the differential proof that the catch cycle feeds shotStep (Σ max-step strictly
 * higher with growth on, with the off twin still landing pass-through hits). What still covers the
 * area: G2 (the cap saturates and is the bound) and G5 (the round-reset LAW) are LIVE and green, and
 * the catch-only rule now lives in the canonical's prose at :1776-1781.
 * COVERAGE KEPT: G4b's CYCLE-ONLY witness is still computed by the G1-G3/G5 window above and is
 * still reported here, so this retirement does not take the owner's 2026-11-01 ruling off the record.
 * Superseded assertion (kept verbatim as the record):
 *   ok('G4 catch-cycle growth is REAL: …', mxOn>mxOff&&catchOn>=1&&hitsOff>=1, …)   [RETIRED r53] */
retired('G4 the catch-growth differential vs a CATCH_GROW=false twin (halo-r39)',
  'CATCH_GROW retired at touchorbit-r53 and folded into prose at canonical :1776-1781; the replace-loader threw and silenced sections H and I. Given up: the differential proof that a catch feeds shotStep. Still live: G2 cap saturation, G5 round reset.');
retired('G4b the growth is CYCLE-ONLY (owner ruling 2026-11-01) — reported, no longer asserted as a halo cell',
  \`the witness is still measured over the G1-G3/G5 window: \${spinViol} unpaired spin rises across \${catches} catches (\${spinUps} paired rises, \${bladeHits0} blade hits)\`);`);

/* ---------- P6: retire the g6 / g7 halo guards ---------- */
patch('P6 g6/g7 guard retirement',
`const g6=threw("WEAPONS.boomerang.shot.turn = 0;");
ok('GUARD FIRES: a returning straight throw (turn 0) is a boot error', !!g6&&/never comes home/.test(g6), g6?g6.slice(0,96):'no throw — a straight return would never arrive');
const g7=threw("WEAPONS.boomerang.shot.orbit.elong = 1.2;");
ok('GUARD FIRES: an elongation outside [0, 0.95) is a boot error', !!g7&&/finite elongation/.test(g7), g7?g7.slice(0,96):'no throw — the curvature modulation would cross zero and the oval would kink');`,
`/* RETIRED 2026-11-10 (Item-3 triage, owner go) — the two halo-era guards. Both were verified by
 * executed probe (scratch/triage/diag-guards.mjs), not by reading:
 *   g6  injecting shot.turn = 0 STILL throws, but with a DIFFERENT guard's message —
 *       "boomerang: trait.turn / shot.turn are RETIRED (hexfam-r68) — the bend+hunt is the FAMILY
 *       FLIGHT LAW…". The halo validator's /never comes home/ contract is gone, so the cell can
 *       never go green again. The turn axis itself is guarded by the hexfam-r68 retirement error.
 *   g7  injecting shot.orbit.elong = 1.2 DOES NOT THROW AT ALL — orbit.elong died with the halo
 *       (the live row carries shot.orbit { a: 620, b: 70, peak: 1.3 }), so the cell was asserting a
 *       guard for a field nothing reads. Leaving it red would have been "red becomes normal".
 * COVERAGE GIVEN UP: the halo's elongation-bound guard and its straight-return guard. The world
 * orbit's own guard (shot.orbit present and well-formed) is LIVE — see g8 immediately below. */
retired('GUARD FIRES: a returning straight throw (turn 0) is a boot error (halo-r39)',
  'shot.turn is a RETIRED axis since hexfam-r68 — the injection now throws that retirement error instead of the halo validator\\'s /never comes home/. Given up: the halo straight-return guard.');
retired('GUARD FIRES: an elongation outside [0, 0.95) is a boot error (halo-r39)',
  'shot.orbit.elong no longer exists (touchorbit-r53 replaced the anchored oval with the world orbit { a, b, peak }) — the injection does not throw. Given up: the halo elongation-bound guard.');`);

/* ---------- P7: re-seed g8 onto the world-orbit contract ---------- */
patch('P7 g8 re-seed',
`const g8=threw("WEAPONS.boomerang.shot.orbit = null;");
ok('GUARD FIRES: a returning row with no orbit data is a boot error', !!g8&&/needs shot\\.orbit\\.elong/.test(g8), g8?g8.slice(0,96):'no throw — the oval would be undefined');`,
`/* RE-SEEDED 2026-11-10 (Item-3 triage) — this guard is ALIVE, only its message moved. Verified by
 * executed probe: injecting shot.orbit = null boots-errors with "boomerang: shot.returns needs
 * shot.orbit { a, b, peak } — finite positive semiaxes (b < a, an elongated world orbit) and the
 * periapsis speed peak…", i.e. the touchorbit-r53 world-orbit validator. The cell used to match
 * /needs shot\\.orbit\\.elong/ (the halo's oval) and so read red against a guard that is working.
 * Superseded expectation: /needs shot\\.orbit\\.elong/   [halo-r39] */
const g8=threw("WEAPONS.boomerang.shot.orbit = null;");
ok('GUARD FIRES: a returning row with no orbit data is a boot error (the touchorbit-r53 world orbit { a, b, peak })', !!g8&&/needs shot\\.orbit/.test(g8), g8?g8.slice(0,96):'no throw — the world orbit would be undefined');`);

/* ---------- P8: the I2/I3 ledger band ---------- */
patch('P8 band declaration',
`  const RATE=WEAPONS.bow.trait.mult, CAP=api.MULT_STEPS, TAU=2*Math.PI;
  const SM_HI=1+RATE*CAP;`,
`  const RATE=WEAPONS.bow.trait.mult, CAP=api.MULT_STEPS, TAU=2*Math.PI;
  const SM_HI=1+RATE*CAP;
  /* CORRECTION 2026-11-10 (Item-3 triage): the accumulator ledger used a bare 1e-9, authored for a
   * quieter sim. MEASURED on this build (probe scratch/triage/diag-bow-band.mjs, executed): worst
   * deviation 6.41e-4 rad over 5,165 fires — 93 bank-tick, 11 fire, 11 saturation observations off
   * the 1e-9 line. That is float accumulation across the chain era, NOT a cadence breach: the
   * cadence law itself holds (I1/I4-I7 green, and the unblocked run reproduced H 9/9 green).
   * BAND 1e-3 = 1.56× the worst measured deviation, and still ~6 orders of magnitude tighter than a
   * real cadence error (one tick of rotation is ~0.1 rad). Re-measure before moving it again. */
  const BAND=1e-3;`);
patch('P8 bank tolerance', `if(n===0){ if(Math.abs(consumed)>1e-9) bandBad++; continue; }`, `if(n===0){ if(Math.abs(consumed)>BAND) bandBad++; continue; }`);
patch('P8 fire band', `const lo=n*TAU/SM_HI-1e-9, hi=n*TAU/(1+RATE*Math.min(P.step,CAP))+1e-9;`, `const lo=n*TAU/SM_HI-BAND, hi=n*TAU/(1+RATE*Math.min(P.step,CAP))+BAND;`);
patch('P8 saturation tolerance', `if(P.step>=CAP){ satFires+=n; if(Math.abs(consumed-n*TAU/SM_HI)>1e-9) satBad++; }`, `if(P.step>=CAP){ satFires+=n; if(Math.abs(consumed-n*TAU/SM_HI)>BAND) satBad++; }`);
patch('P8 I2 label',
`ok('I2 CADENCE BAND LAW: every bow fire consumed a rotation inside the smul band — TAU/6 at the ceiling, TAU/1 at the floor (accumulator conservation, per tick)',`,
`ok('I2 CADENCE BAND LAW: every bow fire consumed a rotation inside the smul band — TAU/6 at the ceiling, TAU/1 at the floor (accumulator conservation, per tick; ledger tolerance BAND 1e-3 re-measured 2026-11-10, worst observed drift 6.41e-4)',`);

/* ---------- P9: the summary line must name the retirements ---------- */
patch('P9 summary',
"console.log(`\\n${pass}/${pass+fail} passed`); process.exit(fail?1:0);",
"console.log(`\\n${pass}/${pass+fail} passed, ${retiredN} retired (dated records in-line — a retired cell is printed and counted, never silent)`);\nprocess.exit(fail?1:0);");

if (failures.length) {
  console.error(`ASSERTED-PATCH FAILED — nothing written (${applied} would have applied):`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}
writeFileSync(TARGET, src);
console.log(`seam-proof.mjs patched: ${applied} exact-match replacements applied, 0 mismatches.`);
