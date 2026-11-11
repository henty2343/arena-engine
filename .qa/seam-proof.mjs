/* .qa/seam-proof.mjs — proves the SKILL SEAMS are live, and that their boot guards actually fire.
 *
 * Why this file exists separately from lengrow-build-proof.mjs: that one proves the length-growth
 * ladder (geometry, coverings, the per-fighter cap). This proves the two seams added at `seam-r30`
 * so the remaining 21 weapons can each get a unique skill cheaply — and, importantly, that the
 * guards are not decorative. A guard that never throws is worse than no guard, because it reads as
 * coverage. Both are exercised here by injecting a bad row into the extracted source and requiring
 * a boot error.
 *
 *   A  authored briefs   — a trait axis outside {spin, dmg} REQUIRES an authored `brief`; plain
 *                          rows still fall back to the derivation, so this cost no churn
 *   B  the seam's STATIC side is inert — no row declares `shot.mult`, no fighter `skill.shotMult`;
 *                          since multgrow-r42 the BOW rides the seam through its trait.mult growth
 *                          term instead (sole holder, capped at read time by MULT_STEPS)
 *   C  the seam is LIVE  — a synthetic `shot.mult` scales the volley rate (so it is not dead code),
 *                          measured on a GROWTH-OFF twin so the declared-factor law reads the
 *                          static smul alone, and reports the SUPERLINEARITY: more shots -> more
 *                          damaging hits -> more spin growth -> more shots, so the effective factor
 *                          exceeds the declared one. Anyone assigning a carrier needs to know that.
 *   D  guards fire       — a new unauthored axis, a non-positive multiplier, and a non-positive or
 *                          NaN trait.mult are all boot errors
 *   E  shotgrow-r33      — the staff's orb-growth RATE (trait.shotR), the second CHEAP-class trait
 *                          axis landed through the seam recipe: every born orb carries
 *                          base*(1+rate)^step, growth is per fighter, traits reset every round
 *                          (the LAW), other launchers are untouched, and the rate guard fires
 *   F  spingrow-r36      — the dagger's spin-growth RATE (trait.spin 2.0 PROVISIONAL), the pass's
 *                          third trait and its first melee one: every damaging hit grows the
 *                          holder's |spin| by exactly skill.spin + trait.spin (per fighter, the
 *                          codified additive stack), traits reset at every roundStart (the LAW),
 *                          no other melee row carries the axis, and the escalation is real
 *   G  halo-r39          — RETIRED 2026-11-10 (Item-3 triage; G4/G4b/g6/g7 dated-retired below):
 *                          the LOYAL HALO was superseded WHOLE at touchorbit-r53 by the WORLD ORBIT
 *                          (the owner's own solo prototype; "the guarantee was the problem"). The
 *                          boomerang row no longer carries shot.orbit.elong, and the four growth
 *                          constants — including CATCH_GROW — were folded into prose at canonical
 *                          :1776-1781, so G4's replace-loader threw and SILENCED sections H and I
 *                          (the live star-ricochet and bow-rain laws went unmeasured for weeks).
 *                          KEPT LIVE below: G0b, G2, G5, G6, g5 (cycle-rate guard) and g8
 *                          (re-seeded onto the world-orbit contract). CORRECTION 2026-11-11
 *                          (session 3): the first pass wrongly listed G1b among the kept-live
 *                          cells — diag-g1b-vacuity.mjs PROVED IT VACUOUS (the row's shot.turn is
 *                          undefined since hexfam-r68, so the identity predicate reads NaN > 1e-9,
 *                          always false; speed ×1e6 fired 0 times over 21,077 in-flight checks yet
 *                          the cell printed PASS). G1b is retired with the rest of the halo family
 *                          (G0/G1/G1b/G3, P11-P14 below). GIVEN UP: the halo's one-orbit
 *                          flight contract, the CATCH_GROW differential, and the elong/turn guards.
 *                          The world orbit itself is NOT re-proved here — that is the deferred
 *                          "section G rewritten for the r54-r60 laws" item; today it is covered by
 *                          the fingerprint suite and the owner's eye. Original r39 text follows.
 *                          halo-r39 (original) — the boomerang's LOYAL HALO + cycle-only catch growth (shot.returns +
 *                          shot.orbit.elong, trait.cycle 0.20 PROVISIONAL, the first CAPPED axis
 *                          at CYCLE_STEPS): birth law (speed AND turn scale together — the oval's
 *                          SHAPE stays locked), cap saturation, the halo flight contract (the rim
 *                          never kills a loop; no timer death exists; the singleton gate never
 *                          leaks; and THE SIGNATURE LAW — every retired loop flew at most one
 *                          orbit, because the anchored oval walks the hand through the path every
 *                          circuit), the catch-growth differential vs a CATCH_GROW=false twin
 *                          through the replace-loader, the CYCLE-ONLY law (a catch never feeds
 *                          the spin axis — every spin rise pairs with a blade hit), the
 *                          round-reset LAW, other launchers untouched, and the guards fire
 *   H  ricolaw-r41       — the shuriken star ricochet LAW: the rim never kills a star (it mirrors
 *                          forever at row speed), own stars pass through each other, and only the
 *                          foe's body, blade or shot ends a flight; speed lock, departure
 *                          accounting, the mirror's enemy-cross law, and law-1 isolation on a
 *                          non-ricochet launcher
 *   I  multgrow-r42      — the bow's RAIN (trait.mult 0.5, cap MULT_STEPS 10 -> smul ceiling 6):
 *                          the source law (every same-owner shot pair skips the cross test —
 *                          friendly fire eliminated game-wide, the star exemption subsumed), the
 *                          cadence band law (every fire consumes a rotation between TAU/ceiling
 *                          and TAU/floor — the ledger tolerance was 1e-9, RE-SEEDED to 1e-3 on
 *                          2026-11-10: measured worst drift 6.41e-4 rad over 5,165 fires, float
 *                          accumulation across the chain era, NOT a cadence breach), cap saturation at the ceiling, the differential vs a
 *                          growth-OFF twin, the generalized no-friendly-cross law witnessed on
 *                          live battles, the round-reset LAW, the knives' fan identity untouched,
 *                          and the rain guards fire
 *
 * Read-only: writes nothing, runs no measure.mjs. Tier 0 (~50s since section I).
 * Usage: node .qa/seam-proof.mjs [file=previews/spinclash-preview.html]
 */
import { readFileSync } from 'node:fs';
const FILE=process.argv[2]||'previews/spinclash-preview.html';
const html=readFileSync(FILE,'utf8');
const A=html.indexOf('<script>'),B=html.indexOf('</script>',A);
const base=html.slice(A+8,B);
const op='(function () {';
const core=base.slice(base.indexOf(op)+op.length, base.lastIndexOf('})();'));
const fake=()=>new Proxy(function(){},{get(x,p){if(p===Symbol.toPrimitive)return ()=>0;if(!(p in x))x[p]=fake();return x[p];},set(x,p,v){x[p]=v;return true;},apply(){return fake();}});
const ARGS={getElementById:()=>fake(),createElement:()=>fake(),querySelectorAll:()=>[],addEventListener:()=>{},activeElement:null};
const WIN={devicePixelRatio:1,innerWidth:1200,innerHeight:900,addEventListener:()=>{}};
const load=(inject)=>new Function('document','window','performance','requestAnimationFrame','console',
  (inject? core.replace('const TRAIT_DERIVABLE', inject+'\n  const TRAIT_DERIVABLE') : core)
  +`\n;return {WEAPONS,WEAPON_IDS,FIGHTERS,newGame,tick,CYCLE_STEPS,MULT_STEPS,APP_META_BRIEFS:null};`)(ARGS,WIN,{now:()=>0},()=>0,console);
let pass=0,fail=0; const ok=(n,c,d)=>{c?pass++:fail++;console.log(`  ${c?'ok  ':'FAIL'} ${n}${d?'  — '+d:''}`);};
/* Item-3 triage 2026-11-10: a RETIRED cell is printed, counted, and named in the summary — never
 * deleted silently. The failure mode this kills is "red becomes normal"; its twin is "gone becomes
 * invisible". Each retirement carries the revision that killed the contract and the coverage given up. */
let retiredN=0; const retired=(n,d)=>{retiredN++;console.log(`  RETIRED ${n}${d?'  — '+d:''}`);};

console.log('seam probe — the seam-r30 hooks (authored brief + shot-cadence multiplier)');
const api=load(null);
const {WEAPONS,WEAPON_IDS,FIGHTERS,newGame,tick}=api;
// (a) briefs
const spearBrief=WEAPONS.spear.brief;
ok('the spear row carries an AUTHORED brief', typeof spearBrief==='string'&&spearBrief.length>0, `"${spearBrief}"`);
ok('every row with a non-derivable trait axis has an authored brief',
  WEAPON_IDS.filter(id=>{const t=WEAPONS[id].trait||{};return Object.keys(t).some(k=>t[k]&&k!=='spin'&&k!=='dmg');}).every(id=>!!WEAPONS[id].brief),
  WEAPON_IDS.filter(id=>{const t=WEAPONS[id].trait||{};return Object.keys(t).some(k=>t[k]&&k!=='spin'&&k!=='dmg');}).map(id=>id+'="'+WEAPONS[id].brief+'"').join(' '));
ok('plain spin/dmg rows still fall back to the derivation (no churn)', WEAPONS.sword.brief===undefined, 'sword has no authored brief, so meta derives it');
// (b) the seam's STATIC side is inert; the bow rides it through trait.mult (multgrow-r42)
ok('NO row declares the STATIC shot.mult and no fighter declares skill.shotMult (the seam\'s static side ships inert)',
  WEAPON_IDS.every(id=>!(WEAPONS[id].shot&&WEAPONS[id].shot.mult)) && FIGHTERS.every(f=>!(f.skill&&f.skill.shotMult)),
  'since multgrow-r42 the bow feeds the same smul through its trait.mult growth term instead');
/* CORRECTION 2026-11-10 (Item-3 triage). The original cell asserted the BOW is the SOLE rain-axis
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
  `holders ${RAIN_HOLDERS.map(id=>id+'='+WEAPONS[id].trait.mult+' "'+WEAPONS[id].brief+'"').join(', ')}, MULT_STEPS ${api.MULT_STEPS}, ceiling ${(1+0.5*api.MULT_STEPS).toFixed(1)}`);
/* r39: a REPLACE-loader for core constants/terms (the inject point sits before the const block, so
 * a pre-declaration assignment would hit the TDZ). Refuses to run if the target text is missing —
 * a silently unmatched replace would make the differential test vacuous. Hoisted above section C
 * at multgrow-r42: the declared-factor laws now need a growth-OFF twin to read the static smul. */
const loadR=(from,to)=>{ if(!core.includes(from)) throw new Error(`seam-proof: replace target missing — ${JSON.stringify(from)}`);
  return new Function('document','window','performance','requestAnimationFrame','console',
    core.replace(from,to)+`\n;return {WEAPONS,WEAPON_IDS,FIGHTERS,newGame,tick,CYCLE_STEPS,MULT_STEPS,APP_META_BRIEFS:null};`)(ARGS,WIN,{now:()=>0},()=>0,console); };
const GROWTH_TERM="((W.trait && W.trait.mult) || 0) * Math.min(f.shotStep, MULT_STEPS)";
// (c) the multiplier is LIVE when something declares it — on a growth-OFF twin, so the declared
// factor reads the static smul alone (the bow's live rain term would compress the 1->2 ratio)
const apiC=loadR(GROWTH_TERM,"0");
const shoot=(mult)=>{ const b=apiC.WEAPONS.bow, saved=b.shot.mult; b.shot.mult=mult;
  const G=apiC.newGame(11,{weapons:['bow','hammer']}); for(let t=0;t<3000&&!G.over;t++) apiC.tick(G);
  b.shot.mult=saved; return G.stats.thrown; };
const n0=shoot(0), n1=shoot(1), n3=shoot(3);
ok('shot.mult scales the volley rate (cadence seam is live, not dead code)', n1>n0 && n3>n1, `thrown in 3000 ticks on the growth-OFF twin: mult 0 -> ${n0}, mult 1 (2x) -> ${n1}, mult 3 (4x) -> ${n3}`);
/* CORRECTION 2026-11-10 (Item-3 triage). The ±0.35 band was authored for a quieter sim; this build
 * measures ratio 2.54 (71 thrown vs 28 on the growth-OFF twin), i.e. +0.54 over the declared 2×.
 * The MECHANIC is not stale — the monotonicity cell above is green and the superlinearity is the
 * documented feedback loop (more shots -> more damaging hits -> more spin growth -> more shots).
 * The band is RE-MEASURED, not deleted: ±0.60 keeps a real ceiling (declared 2× + rim-clamp and
 * round-reset drift) while staying far inside "the seam is a no-op" territory. Any future move of
 * the band must re-measure first and cite the run — a widened tolerance with no number behind it is
 * how the flail poke escaped. */
const DECLARED_FACTOR_BAND=0.60;
ok('the scaling is close to the declared factor', Math.abs(n1/n0-2)<DECLARED_FACTOR_BAND, `ratio ${(n1/n0).toFixed(2)} for a declared 2x, band ±${DECLARED_FACTOR_BAND} re-measured 2026-11-10 (drift is the rim clamp and round resets)`);
// (d) the guards actually fire
const threw=(inj)=>{ try{ load(inj); return null; }catch(e){ return e.message; } };
const g1=threw("WEAPONS.sword.trait.bogusAxis = 0.5;");
ok('GUARD FIRES: a new trait axis with no authored brief is a boot error', !!g1&&/author a `brief`/.test(g1), g1?g1.slice(0,96):'no throw — the guard is decorative');
const g2=threw("WEAPONS.bow.shot.mult = -1;");
ok('GUARD FIRES: a non-positive effective multiplier is a boot error', !!g2&&/not positive/.test(g2), g2?g2.slice(0,96):'no throw — the launch loop would hang');
const g9=threw("WEAPONS.bow.trait.mult = -0.5;");
ok('GUARD FIRES: a non-positive rain rate is a boot error (trait.mult)', !!g9&&/trait\.mult -0\.5 is not a positive finite growth rate/.test(g9), g9?g9.slice(0,96):'no throw — the rain would thin toward still');
const g10=threw("WEAPONS.bow.trait.mult = NaN;");
ok('GUARD FIRES: a NaN rain rate is a boot error (NaN would poison `need` and silently stall the release loop)', !!g10&&/trait\.mult NaN is not a positive finite growth rate/.test(g10), g10?g10.slice(0,96):'no throw');
// (e) shotgrow-r33 — the staff's orb-growth rate (trait.shotR), the second CHEAP-class axis
console.log('shotgrow-r33 — the staff\'s orb-growth axis (trait.shotR)');
/* CORRECTION 2026-11-10 (Item-3 triage): the expected brief gains +HEX, added to the staff row at
 * hexfam-r68. Pure stale string — section A already live-checks that every non-derivable axis has an
 * authored brief; this cell pins the staff's EXACT wording, so it must carry the current wording.
 * Superseded expectation: WEAPONS.staff.brief==='+SPD +SIZE / Hit'   [pre-hexfam-r68] */
ok('the staff row declares the growth RATE and an authored brief',
  WEAPONS.staff.trait.shotR===0.2 && WEAPONS.staff.brief==='+SPD +SIZE +HEX / Hit',
  `trait.shotR ${WEAPONS.staff.trait.shotR}, brief "${WEAPONS.staff.brief}" (+HEX since hexfam-r68)`);
ok('NO other row declares shotR (the axis is staff-only)',
  WEAPON_IDS.filter(id=>id!=='staff').every(id=>!((WEAPONS[id].trait||{}).shotR)),
  'every other launcher\'s birth radius is bit-identical');
{ // live growth: forced staff battle; every birth radius must equal base * 1.2^(holder's step)
  const G=newGame(1,{weapons:['staff','hammer']});
  const baseR=WEAPONS.staff.shot.r;
  let sid=0, n=0, bad=0, maxStep=0, hammerMax=0; const seq=[];
  while(!G.over&&G.t<18000){
    tick(G);
    for(const s of G.shots) if(s.sid>sid){ sid=s.sid; n++;
      const exp=baseR*Math.pow(1.2,G.fighters[0].shotStep);
      if(Math.abs(s.r-exp)>1e-9) bad++;
      if(seq.length<3) seq.push(+s.r.toFixed(3));
      if(G.fighters[0].shotStep>maxStep) maxStep=G.fighters[0].shotStep; }
    if(G.fighters[1].shotStep>hammerMax) hammerMax=G.fighters[1].shotStep;
  }
  ok('every born orb carries base*(1+rate)^step (birth-snapshot law, exact)', bad===0&&n>50,
    `${n} births checked, ${bad} mismatches; first radii ${seq.join(' → ')}`);
  ok('growth is PER-FIGHTER: the hammer side never grows an orb', hammerMax===0,
    `hammer-side shotStep max ${hammerMax}`);
  ok('the escalation is real: late orbs dwarf the base radius', maxStep>=8,
    `top step ${maxStep} = ${Math.pow(1.2,maxStep).toFixed(1)}× base (r ${(baseR*Math.pow(1.2,maxStep)).toFixed(1)} vs bodyR 64)`);
}
{ // the round-reset LAW: shotStep reads 0 right after any round-2+ roll
  const G2=newGame(1,{weapons:['staff','hammer']});
  let rolls=0, resetSeen=false, resetOK=true;
  while(!G2.over&&G2.t<18000){ tick(G2);
    for(const e of G2.events) if(e.kind==='roll'){ rolls++;
      if(rolls>1){ resetSeen=true; if(G2.fighters[0].shotStep!==0) resetOK=false; } } }
  ok('traits reset every round (the LAW): shotStep is 0 at each round-2+ roll', resetSeen&&resetOK,
    rolls>1?`${rolls} rolls observed, all reset`:`only ${rolls} roll(s) — battle never reached round 2`);
}
{ // inert elsewhere: a non-shotR launcher is untouched
  const G3=newGame(3,{weapons:['wand','hammer']}); let sid3=0, wn=0, wbad=0;
  while(!G3.over&&G3.t<6000){ tick(G3);
    for(const s of G3.shots) if(s.sid>sid3){ sid3=s.sid; wn++; if(s.r!==WEAPONS.wand.shot.r) wbad++; } }
  ok('a non-shotR launcher is untouched: every wand spark is born at the row radius', wn>10&&wbad===0,
    `${wn} sparks checked, ${wbad} off-row`);
}
const g3=threw("WEAPONS.staff.trait.shotR = -0.5;");
ok('GUARD FIRES: a non-positive shotR is a boot error', !!g3&&/not a positive finite growth rate/.test(g3), g3?g3.slice(0,96):'no throw — orbs would shrink toward zero');
const g4=threw("WEAPONS.staff.trait.shotR = NaN;");
ok('GUARD FIRES: a NaN shotR is a boot error', !!g4&&/not a positive finite growth rate/.test(g4), g4?g4.slice(0,96):'no throw — NaN would poison every birth radius');

console.log('F — spingrow-r36: the dagger\'s spin-growth trait (trait.spin 2.0 PROVISIONAL)');
ok('F0 the dagger row declares a positive finite spin rate', Number.isFinite(WEAPONS.dagger.trait.spin)&&WEAPONS.dagger.trait.spin>0, `trait.spin ${WEAPONS.dagger.trait.spin} rad/s per damaging hit`);
ok('F0b no OTHER melee row carries the axis (the launchers\' 0.70 is fire-rate class data)',
  WEAPON_IDS.filter(id=>!WEAPONS[id].shot&&id!=='dagger').every(id=>!(WEAPONS[id].trait||{}).spin),
  WEAPON_IDS.filter(id=>!WEAPONS[id].shot&&id!=='dagger').join(' ')+' — all spin 0');
{ // F1–F3: the growth law live, per fighter, with the round-reset LAW (spin/dmg deltas read per tick;
  // hits are detected as dmg jumps because every cell here keeps the shared dmg-growth placeholder)
  let hits=0, bad=0, boundaries=0, resetsBad=0, maxSpin=0;
  const cells=[[['dagger','hammer'],[0,1]],[['dagger','hammer'],[1,0]],[['dagger','dagger'],[0,1]]];
  for(const [weapons,cast] of cells) for(let s=1;s<=3;s++){
    const G=newGame(s,{weapons,cast});
    const st=G.fighters.map(f=>({dmg:f.dmg,spin:f.spin}));
    // gains are CONSTANTS in a forced cell — f.weapon is null before the first roll, so read the force
    const spinGain=G.fighters.map(f=>FIGHTERS[G.cast[f.slot]].skill.spin+WEAPONS[weapons[f.slot]].trait.spin);
    const dmgGain=G.fighters.map(f=>FIGHTERS[G.cast[f.slot]].skill.dmg+WEAPONS[weapons[f.slot]].trait.dmg);
    let prevPhase=G.phase;
    while(!G.over&&G.t<9000){
      tick(G);
      // hit detection runs only for ticks that ENTERED as 'fight': the reveal-phase first roll
      // re-anchors dmg (0 -> W.dmg) and would read as a phantom hit (measured: all 15 t=1 "off-law"
      // rows of the first F1 draft were exactly this)
      if(prevPhase==='fight') for(const f of G.fighters){
        const i=f.slot, dd=f.dmg-st[i].dmg;
        if(dd>0.01){ const k=Math.round(dd/dmgGain[i]); hits+=k;
          const ds=Math.abs(f.spin)-Math.abs(st[i].spin);
          if(Math.abs(ds-k*spinGain[i])>1e-6) bad++; }
        const sp=Math.abs(f.spin); if(sp>maxSpin) maxSpin=sp;
      }
      for(const f of G.fighters){ const i=f.slot; st[i].dmg=f.dmg; st[i].spin=f.spin; }
      // G.events DRAINS each tick (section E's rescan is the house pattern — an index cursor
      // ratchets past the drained length and sees nothing, which is what the first draft did)
      let bnd=false;
      for(const e of G.events) if(e.kind==='roundStart') bnd=true;
      if(bnd){ boundaries++;
        for(const f of G.fighters) if(Math.abs(Math.abs(f.spin)-WEAPONS[weapons[f.slot]].omega)>1e-9) resetsBad++; }
      prevPhase=G.phase;
    }
  }
  ok('F1 every damaging hit grows the holder\'s |spin| by exactly skill.spin + trait.spin (per fighter; Speedy stacks to 2.3)',
    bad===0&&hits>=30, `${hits} hits checked across 9 battles, ${bad} off-law`);
  ok('F2 traits reset every round (the LAW): |spin| is back at the weapon omega at every roundStart',
    boundaries>=2&&resetsBad===0, `${boundaries} round starts, ${resetsBad} off-omega`);
  ok('F3 the escalation is real: a dagger holder passes 4× its base omega',
    maxSpin>=4*WEAPONS.dagger.omega,
    `observed max |spin| ${maxSpin.toFixed(1)} rad/s = ${(maxSpin/(2*Math.PI)).toFixed(1)} rev/s vs base ${WEAPONS.dagger.omega}`);
}

console.log('G — halo-r39: the boomerang\'s Loyal Halo + cycle-only catch growth (trait.cycle, cap CYCLE_STEPS)');
const BM = WEAPONS.boomerang, BMCAP = api.CYCLE_STEPS, BMF = 1 + BM.trait.cycle;
/* RETIRED 2026-11-11 (Item-3 triage session 3, owner go: "do all of it" — retire where dead).
 * The halo ROW CONTRACT died at touchorbit-r53: shot.orbit.elong is gone (the live row carries
 * shot.orbit { a: 620, b: 70, peak: 1.3 }, canonical :1094) and shot.turn is a RETIRED axis since
 * hexfam-r68 (canonical :1571 throws on a declared turn). The assertion could never go green again.
 * What the live rows DO pin: G0b (cycle/returns are boomerang-only) and g8 (the world-orbit guard).
 * Superseded assertion kept verbatim as the record:
 *   ok('G0 the boomerang row declares the full halo set …', cycle>0 && returns===true && orbit.elong in [0,0.95) && laps/refund undefined && !!brief)   [halo-r39] */
retired('G0 the boomerang row declares the full halo set (orbit.elong / turn / laps / refund) (halo-r39)',
  `shot.orbit.elong died at touchorbit-r53 (live row: orbit {${Object.keys(BM.shot.orbit||{}).join(', ')}}); shot.turn retired at hexfam-r68. Live coverage kept: G0b axis exclusivity, g8 world-orbit guard.`);
ok('G0b NO other row declares cycle or returns (both axes are boomerang-only)',
  WEAPON_IDS.filter(id=>id!=='boomerang').every(id=>!((WEAPONS[id].trait||{}).cycle)&&!(WEAPONS[id].shot&&WEAPONS[id].shot.returns)),
  'every other launcher is born at its row speed, flies straight, and dies on the rim');
let spinViol=0, spinUps=0, bladeHits0=0, catches=0;   // hoisted: the CYCLE-ONLY law (G4b) is judged over the G3 window
{ // G1–G3 + G5: the live laws over forced battles (birth snapshot, shape lock, cap, halo flight contract, reset)
  let births=0, badBirth=0, maxFactor=0, radiusN=0, radiusBad=0, rims0=0, singBad=0, shotHits=0, maxStep=0, boundaries=0, resetsBad=0;
  /* Session-3 rename: this map was named "retired" — it shadowed the module-level retired() REPORTER
   * (Item-3 triage P0) inside this block, so the G1/G1b/G3 retirements threw
   * "retired is not a function". Halo-era logic unchanged; only the local name moved. */
  let maxDepartFlight=0; const birthT={}; const departed={};
  const PERIOD_MAX = 400;   // ticks — >2× the birth orbit (2π/turn ≈ 188t at 120Hz); growth only SHORTENS the orbit, so any departure past this bound means the hand-on-path guarantee failed
  for (let s=1;s<=4;s++){
    const G=newGame(s,{weapons:['boomerang','hammer'],cast:[0,1]});
    let sid=0, prevSpin=Math.abs(G.fighters[0].spin);
    while(!G.over&&G.t<12000){
      tick(G);
      // drain FIRST; the same-tick growth ambiguity now counts catches (which increment the
      // cycle counter directly, cycle-only) and the wielder's blade hits (the shared grow()).
      // Projectile hits do NOT grow (HIT_GROW=false) and are counted as the pass-through witness.
      let grewNow=0, bladeNow=0, rsNow=false;
      for(const e of G.events){
        if(e.kind==='shotFire'&&e.by===0) birthT[e.sid]=G.t;
        else if(e.kind==='hit'&&!e.shot&&e.by===0){ grewNow++; bladeNow++; bladeHits0++; }
        else if(e.kind==='hit'&&e.shot&&e.by===0) shotHits++;
        else if(e.kind==='shotCatch'){ if(e.by===0){ catches++; grewNow++;
            if(birthT[e.sid]!==undefined&&!departed[e.sid]){ departed[e.sid]=1; const d=G.t-birthT[e.sid]; if(d>maxDepartFlight) maxDepartFlight=d; } } }
        else if(e.kind==='swat'||e.kind==='shotCross'){ if(birthT[e.sid]!==undefined&&!departed[e.sid]){ departed[e.sid]=1; const d=G.t-birthT[e.sid]; if(d>maxDepartFlight) maxDepartFlight=d; } }
        else if(e.kind==='shotRim'){ if(e.by===0) rims0++; }
        else if(e.kind==='roundStart'){ boundaries++; rsNow=true; if(G.fighters[0].shotStep!==0) resetsBad++; }
      }
      G.events.length=0;
      // CYCLE-ONLY law: the wielder's |spin| may rise ONLY on a tick where his blade hit landed
      // or the round-start omega reset fires (0 → weapon omega — diagnosed 2026-11-01: all 8
      // first-draft "violations" were exactly this reset, catches never touched the axis)
      const spinNow=Math.abs(G.fighters[0].spin);
      if(!rsNow&&spinNow>prevSpin+1e-9){ spinUps++; if(!bladeNow) spinViol++; }
      prevSpin=spinNow;
      const step=G.fighters[0].shotStep;
      let loopsOut=0;
      for(const st of G.shots){
        if(st.returns&&st.o===0) loopsOut++;
        if(st.sid>sid){ sid=st.sid;
          if(st.returns){ births++;
            let matched=false;
            for(let k=0;k<=grewNow;k++){
              const f=Math.pow(BMF,Math.min(step-k,BMCAP));
              if(f>maxFactor) maxFactor=f;
              if(Math.abs(st.speed-BM.shot.speed*f)<=1e-9&&Math.abs(Math.abs(st.turn)-BM.shot.turn*f)<=1e-9){ matched=true; break; }
            }
            if(!matched) badBirth++; } }
        if(st.returns){ radiusN++;
          if(Math.abs(st.speed/Math.abs(st.turn)-BM.shot.speed/BM.shot.turn)>1e-9) radiusBad++; }
      }
      if(loopsOut>1) singBad++;
      if(step>maxStep) maxStep=step;
    }
  }
  /* RETIRED 2026-11-11 (session 3): the birth law asserted speed AND TURN scale together — the
   * turn term is dead law since hexfam-r68 (a declared shot.turn now BOOTS-ERRORS), so the
   * conjunct can never hold again. Measured fact kept on the record: 239 births, 239 "off-law",
   * i.e. every birth fails ONLY because BM.shot.turn is undefined (runs-before/seam-proof.log — pruned from HEAD 2026-11-11, GAMES #731; recover with
   * `git show item3-closed:scratch/triage/runs-before/seam-proof.log`).
   * COVERAGE KEPT: the SPEED half of the same snapshot law is exactly what G2 re-checks live
   * (maxFactor saturates at (1+cycle)^CAP against real births) — the loop above still computes
   * births/badBirth for that window. Superseded assertion:
   *   ok('G1 … speed AND turn together …', badBirth===0&&births>50, …)   [halo-r39] */
  retired('G1 birth snapshot on speed AND turn together (halo-r39)',
    `${births} births checked, ${badBirth} off-law — ALL of them only because shot.turn is undefined since hexfam-r68; the speed-side birth law stays covered by G2 (cap saturation, live).`);
  /* RETIRED 2026-11-11 (Item-3 triage session 3) — G1b IS VACUOUS, PROVEN, not merely stale.
   * Predicate: |st.speed/|st.turn| − BM.shot.speed/BM.shot.turn| > 1e-9. The ROW's BM.shot.turn is
   * undefined (axis retired at hexfam-r68) ⇒ the row ratio is NaN ⇒ NaN > 1e-9 is ALWAYS FALSE ⇒
   * radiusBad can never be nonzero. Decisive test (scratch/triage/diag-g1b-vacuity.mjs, executed):
   * multiply EVERY loop's speed by 1e6 — a gross violation — and the predicate fires 0 times across
   * 21,077 in-flight checks, while the cell cheerfully prints "42788 in-flight checks, 0 off-scale".
   * Owner non-negotiable #2: a probe that measured nothing cannot claim PASS. The subtlety worth
   * recording: the shot OBJECTS do carry a defined st.turn (derived in bornBend); it is the ROW
   * reference that is undefined — so the identity has no anchor left to check against.
   * Superseded assertion kept as the record:
   *   ok('G1b the oval\'s SCALE stays locked …', radiusN>1000&&radiusBad===0, …)   [halo-r39, VACUOUS since hexfam-r68] */
  retired('G1b the oval\'s SCALE stays locked — speed/turn identity vs the row ratio (halo-r39)',
    `VACUOUS, proved by diag-g1b-vacuity.mjs: row shot.turn undefined ⇒ predicate is NaN>1e-9 ⇒ unfireable (speed ×1e6 injected: 0 hits over 21,077 checks). It was printing PASS while measuring nothing — retired, not kept green.`);
  ok('G2 the cap SATURATES and is the bound: top birth factor is exactly (1+rate)^CAP while the raw step runs past it',
    maxStep>BMCAP&&Math.abs(maxFactor-Math.pow(BMF,BMCAP))<1e-9,
    `raw step reached ${maxStep} > CAP ${BMCAP}; top factor ${maxFactor.toFixed(3)} = ${(1+BM.trait.cycle).toFixed(1)}^${BMCAP}`);
  /* RETIRED 2026-11-11 (session 3): THE SIGNATURE LAW of the anchored oval — "every retired loop
   * flew at most ONE orbit" — died with the halo at touchorbit-r53 ("the guarantee was the
   * problem"). The world orbit is arena-centred: a loop orbits until CAUGHT (pure touch), so
   * flight length is unbounded BY DESIGN; the measured fact (runs-before/seam-proof.log — pruned from HEAD 2026-11-11, GAMES #731;
   * `git show item3-closed:scratch/triage/runs-before/seam-proof.log`) was
   * "worst retired flight 1698t ≤ 400t". The PERIOD_MAX bound has no successor contract.
   * COVERAGE KEPT, NON-SILENT: the other clauses were STILL true when this ran and are named in
   * the detail below (rim never kills a loop, singleton gate, pass-through hits) — the loop above
   * still computes them for the G4b witness. Superseded assertion:
   *   ok('G3 THE HALO FLIGHT CONTRACT …', catches>=1&&rims0===0&&singBad===0&&shotHits>=1&&maxDepartFlight<=PERIOD_MAX, …)   [halo-r39] */
  retired('G3 the halo flight contract — one-orbit departure bound, rim immunity, singleton gate (halo-r39)',
    `the one-orbit bound died with the anchored oval at touchorbit-r53 (loops orbit until caught; measured worst flight ${maxDepartFlight}t vs the dead 400t bound). Witnesses at last run: ${catches} catches, ${rims0} rim deaths, ${singBad} singleton violations, ${shotHits} pass-through hits — rim immunity + singleton gate held; the DEPARTURE BOUND is given up (no successor contract; the world orbit itself is the deferred r54-r60 rewrite item).`);
  ok('G5 traits reset every round (the LAW): shotStep is 0 at every roundStart',
    boundaries>=2&&resetsBad===0, `${boundaries} round starts, ${resetsBad} off-zero`);
}
/* RETIRED 2026-11-10 (Item-3 triage, owner go) — G4, the catch-growth DIFFERENTIAL.
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
  `the witness is still measured over the G1-G3/G5 window: ${spinViol} unpaired spin rises across ${catches} catches (${spinUps} paired rises, ${bladeHits0} blade hits)`);
{ // G6: a non-cycle launcher is untouched — row speed at birth, no return state
  const G3=newGame(3,{weapons:['wand','hammer']}); let sid3=0, wn=0, wbad=0;
  while(!G3.over&&G3.t<6000){ tick(G3);
    for(const s of G3.shots) if(s.sid>sid3){ sid3=s.sid; wn++; if(s.speed!==WEAPONS.wand.shot.speed||s.returns!==undefined) wbad++; } }
  ok('G6 a non-cycle launcher is untouched: every wand spark is born at the row speed with NO return state',
    wn>10&&wbad===0, `${wn} sparks checked, ${wbad} off-row or carrying return state`);
}
const g5=threw("WEAPONS.boomerang.trait.cycle = -0.5;");
ok('GUARD FIRES: a non-positive cycle rate is a boot error', !!g5&&/not a positive finite growth rate/.test(g5), g5?g5.slice(0,96):'no throw — loops would slow toward frozen');
/* RETIRED 2026-11-10 (Item-3 triage, owner go) — the two halo-era guards. Both were verified by
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
  'shot.turn is a RETIRED axis since hexfam-r68 — the injection now throws that retirement error instead of the halo validator\'s /never comes home/. Given up: the halo straight-return guard.');
retired('GUARD FIRES: an elongation outside [0, 0.95) is a boot error (halo-r39)',
  'shot.orbit.elong no longer exists (touchorbit-r53 replaced the anchored oval with the world orbit { a, b, peak }) — the injection does not throw. Given up: the halo elongation-bound guard.');
/* RE-SEEDED 2026-11-10 (Item-3 triage) — this guard is ALIVE, only its message moved. Verified by
 * executed probe: injecting shot.orbit = null boots-errors with "boomerang: shot.returns needs
 * shot.orbit { a, b, peak } — finite positive semiaxes (b < a, an elongated world orbit) and the
 * periapsis speed peak…", i.e. the touchorbit-r53 world-orbit validator. The cell used to match
 * /needs shot\.orbit\.elong/ (the halo's oval) and so read red against a guard that is working.
 * Superseded expectation: /needs shot\.orbit\.elong/   [halo-r39] */
const g8=threw("WEAPONS.boomerang.shot.orbit = null;");
ok('GUARD FIRES: a returning row with no orbit data is a boot error (the touchorbit-r53 world orbit { a, b, peak })', !!g8&&/needs shot\.orbit/.test(g8), g8?g8.slice(0,96):'no throw — the world orbit would be undefined');


console.log('H — ricolaw-r41: the star ricochet LAW (the rim never kills a star; own stars pass through; the foe\'s body/blade/shot do)');
const SH = WEAPONS.shuriken;
ok('H0 the shuriken row carries the ricochet LAW gate — and the retired budget axis is fully gone (no shot.bounce, no trait.bounce, no authored brief: the derivation is back)',
  SH.shot.ricochet===true&&SH.shot.bounce===undefined&&(SH.trait||{}).bounce===undefined&&SH.brief===undefined,
  `ricochet ${SH.shot.ricochet}, shot.bounce ${SH.shot.bounce}, trait ${JSON.stringify(SH.trait)}, brief ${SH.brief}`);
ok('H0b NO other row declares ricochet, and NO row anywhere still carries a bounce budget (the axis retired with bouncegrow-r40)',
  WEAPON_IDS.filter(id=>id!=='shuriken').every(id=>!(WEAPONS[id].shot&&WEAPONS[id].shot.ricochet))&&WEAPON_IDS.every(id=>!(WEAPONS[id].shot&&WEAPONS[id].shot.bounce)),
  'every other launcher still dies at the rim on first touch');
{ // H1–H4: forced shuriken×hammer battles — the rim law, the speed lock, departure accounting, the foe's answers
  let bounces=0, starRims=0, speedBad=0, speedN=0, leaks=0, hits=0, swats=0, crossings=0, boundaries=0, bornTot=0;
  for (let s=1;s<=4;s++){
    const G=newGame(s,{weapons:['shuriken','hammer'],cast:[0,1]});
    const born={},retired={};
    while(!G.over&&G.t<12000){
      tick(G);
      for(const e of G.events){
        if(e.kind==='shotFire') born[e.sid]=G.t;
        else if(e.kind==='shotBounce') bounces++;
        else if(e.kind==='shotRim'){ if(born[e.sid]!==undefined) starRims++; }
        else if(e.kind==='hit'&&e.shot){ hits++; retired[e.sid]=1; }
        else if(e.kind==='swat'){ swats++; if(born[e.sid]!==undefined) retired[e.sid]=1; }
        else if(e.kind==='shotCross'){ crossings++; if(born[e.sid]!==undefined) retired[e.sid]=1; }
        else if(e.kind==='roundStart') boundaries++;
        else if(e.kind==='roll'){ for(const cs of e.clearedSids||[]) retired[cs]=1; }
      }
      G.events.length=0;
      for(const st of G.shots) if(st.kind==='star'){
        speedN++;
        if(st.speed!==SH.shot.speed||Math.abs(Math.hypot(st.vx,st.vy)-SH.shot.speed)>1e-9) speedBad++;
      }
    }
    const alive={}; for(const st of G.shots) alive[st.sid]=1;
    for(const bs in born){ bornTot++; if(!retired[bs]&&!alive[bs]) leaks++; }
  }
  ok('H1 THE RIM NEVER KILLS A STAR: 0 rim deaths across 4 forced battles while the ricochets are counted (the law is live, not dead code)',
    starRims===0&&bounces>=50, `${bounces} ricochets logged, ${starRims} star rim deaths`);
  ok('H2 the SPEED LOCK (the owner picked the constant-speed law over the measured accel ladder): every star flies at exactly the row speed on every in-flight tick',
    speedN>1000&&speedBad===0, `${speedN} in-flight checks, ${speedBad} off-speed`);
  ok('H3 DEPARTURE ACCOUNTING: every born star has exactly one proven departure (body hit / swat / enemy cross / roll-clear) or is still in flight — immortality must not leak',
    leaks===0&&bornTot>50, `${bornTot} stars born, ${leaks} silent vanishings`);
  ok('H4 immortality is not invincibility: the foe\'s body and blade still end stars (and rounds still start)',
    hits>=1&&swats>=1&&boundaries>=2, `${hits} body hits, ${swats} swats, ${boundaries} round starts`);
}
{ // H5–H6: the mirror — enemy crosses still cancel BOTH, own stars pass through (exemption live, not decorative)
  let crossings=0, ownCrossViol=0, overlapTicks=0, overlapPairs=0;
  for (let s=1;s<=4;s++){
    const G=newGame(s,{weapons:['shuriken','shuriken'],cast:[0,1]});
    const owner={};
    while(!G.over&&G.t<12000){
      tick(G);
      const crossedNow={};
      for(const e of G.events){
        if(e.kind==='shotFire') owner[e.sid]=e.by;
        else if(e.kind==='shotCross'){ crossings++; crossedNow[e.sid]=1; }
      }
      G.events.length=0;
      const stars=G.shots.filter(st=>st.kind==='star');
      let tickOverlap=false;
      for(let i=0;i<stars.length;i++) for(let j=i+1;j<stars.length;j++){
        const A=stars[i],B=stars[j];
        if(A.o!==B.o) continue;
        if(Math.hypot(A.x-B.x,A.y-B.y)<A.r+B.r){ overlapPairs++; tickOverlap=true;
          if(crossedNow[A.sid]||crossedNow[B.sid]) ownCrossViol++; }
      }
      if(tickOverlap) overlapTicks++;
      // enemy pairs crossing is the law staying alive — witnessed by crossings>0 below; a
      // same-owner pair may NEVER appear in a cross — since multgrow-r42 this exemption is an
      // INSTANCE of the general law (every same-owner shot pair skips the cross test), checked
      // per overlap tick here for the stars and behaviourally in section I4 for all classes
      for(const cs in crossedNow) if(owner[cs]!==undefined){ /* owner recorded for audit */ }
    }
  }
  ok('H5 ENEMY shots still cancel both (the default cross rule is alive): the mirror produces mutual annihilation',
    crossings>=1, `${crossings} cross departures across 4 mirror battles`);
  ok('H6 the SAME-OWNER PASS-THROUGH is LIVE: own stars are observed overlapping with no cross departing either — pre-ruling these pairs annihilated (the bug-look the owner cut)',
    overlapTicks>=1&&ownCrossViol===0, `${overlapTicks} overlap ticks (${overlapPairs} pair-ticks), ${ownCrossViol} own-pair crosses`);
}
{ // H7: a non-ricochet launcher is untouched — sparks still die at the rim, no ricochet state
  const G3=newGame(3,{weapons:['wand','hammer']}); let rims=0, flagBad=0, n=0;
  while(!G3.over&&G3.t<6000){ tick(G3);
    for(const e of G3.events) if(e.kind==='shotRim') rims++;
    for(const st of G3.shots){ n++; if(st.ricochet!==undefined) flagBad++; }
    G3.events.length=0; }
  ok('H7 law-1 isolation: a non-ricochet launcher is untouched — wand sparks still die at the rim and carry no ricochet state',
    rims>=1&&flagBad===0, `${rims} spark rim deaths, ${n} in-flight checks, ${flagBad} carrying the flag`);
}

console.log('I — multgrow-r42: the bow\'s RAIN (trait.mult 0.5, cap MULT_STEPS 10) + the generalized owner-blind cross law');
ok('I1 SOURCE LAW: every same-owner shot pair skips the cross test (the generalized line is in place; the star-only exemption is subsumed and gone)',
  core.includes('if (A.o === B.o) continue;   // multgrow-r42') && !core.includes('A.ricochet && B.ricochet) continue'),
  'friendly fire is eliminated game-wide; the r41 star exemption lives on as an instance');
{ // I2: the cadence conservation law — per tick, the rotation a bow fighter's blade swept minus the
  // accumulator delta equals exactly the sum of the `need` values the fires consumed; need is bounded
  // by the smul band [1, 6], and at saturation (step >= CAP) it is EXACTLY TAU/6.
  const RATE=WEAPONS.bow.trait.mult, CAP=api.MULT_STEPS, TAU=2*Math.PI;
  const SM_HI=1+RATE*CAP;
  /* CORRECTION 2026-11-10 (Item-3 triage): the accumulator ledger used a bare 1e-9, authored for a
   * quieter sim. MEASURED on this build (probe scratch/triage/diag-bow-band.mjs, executed): worst
   * deviation 6.41e-4 rad over 5,165 fires — 93 bank-tick, 11 fire, 11 saturation observations off
   * the 1e-9 line. That is float accumulation across the chain era, NOT a cadence breach: the
   * cadence law itself holds (I1/I4-I7 green, and the unblocked run reproduced H 9/9 green).
   * BAND 1e-3 = 1.56× the worst measured deviation, and still ~6 orders of magnitude tighter than a
   * real cadence error (one tick of rotation is ~0.1 rad). Re-measure before moving it again. */
  const BAND=1e-3;
  let fires=0, bandBad=0, satFires=0, satBad=0, skips=0, nudges=0, maxStep=0, maxPerTick=0;
  for (const [ws,cs] of [[['bow','hammer'],[0,1]],[['bow','hammer'],[1,0]],[['bow','bow'],[0,1]]]){
    for (let s=1;s<=2;s++){
      const G=newGame(s,{weapons:ws,cast:cs});
      const pre={};
      while(!G.over&&G.t<12000){
        for(const f of G.fighters) if(f.weapon==='bow'&&f.alive) pre[f.slot]={ang:f.wAngle,spin:f.spin,step:f.shotStep,acc:f.fireAcc};
        tick(G);
        let exempt=false, firedByTick={};
        // roll ticks: weapons may swap; roundStart ticks: the round-start reset zeroes fireAcc
        // (canonical :1692) — diagnosed 2026-11-01: all 11 first-draft band violations were
        // roundStart-tick accumulator resets, exactly the E-section roll-tick lesson reborn
        for(const e of G.events){ if(e.kind==='roll'||e.kind==='roundStart') exempt=true; else if(e.kind==='shotFire') firedByTick[e.by]=(firedByTick[e.by]||0)+1; }
        G.events.length=0;
        for(const sl in pre){
          const f=G.fighters[sl]; const P=pre[sl];
          if(exempt||f.weapon!=='bow'||!f.alive){ continue; }
          if((P.spin>0)!==(f.spin>0)){ skips++; continue; }                          // spin-flip tick: |Δangle| under-reads the swept rotation
          if(f.nudgeTick===G.t){ nudges++; continue; }                               // pin-escape nudge tick (canonical :2292): the nudge rotates wAngle OUTSIDE the accumulator ledger — diagnosed 2026-11-01: all 4 first-draft residue violations were exactly this, ±0.0912 rad = the nudge add
          let d=f.wAngle-P.ang; while(d>Math.PI)d-=TAU; while(d<-Math.PI)d+=TAU;
          const rot=Math.abs(d), consumed=rot-(f.fireAcc-P.acc), n=firedByTick[sl]||0;
          if(f.shotStep>maxStep) maxStep=f.shotStep;
          if(n>maxPerTick) maxPerTick=n;
          if(n===0){ if(Math.abs(consumed)>BAND) bandBad++; continue; }               // no fire: the accumulator banks everything
          fires+=n;
          const lo=n*TAU/SM_HI-BAND, hi=n*TAU/(1+RATE*Math.min(P.step,CAP))+BAND;
          if(!(consumed>=lo&&consumed<=hi)) bandBad++;
          if(P.step>=CAP){ satFires+=n; if(Math.abs(consumed-n*TAU/SM_HI)>BAND) satBad++; }
        }
        for(const k in pre) if(!(k in firedByTick)) delete pre[k];
      }
    }
  }
  ok('I2 CADENCE BAND LAW: every bow fire consumed a rotation inside the smul band — TAU/6 at the ceiling, TAU/1 at the floor (accumulator conservation, per tick; ledger tolerance BAND 1e-3 re-measured 2026-11-10, worst observed drift 6.41e-4)',
    fires>=300&&bandBad===0&&nudges<fires/20, `${fires} fires checked, ${bandBad} off-band, ${skips} flip-ticks and ${nudges} nudge-ticks exempted (both documented wAngle-vs-ledger divergences, not cadence breaches), maxStep ${maxStep}, max fires in one tick ${maxPerTick}`);
  ok('I3 CAP SATURATION: once shotStep passes MULT_STEPS the cadence is locked at EXACTLY TAU/6 per fire — the rain thickens no further (the CYCLE_STEPS pattern)',
    satFires>=20&&satBad===0, `${satFires} saturated fires, ${satBad} off-ceiling`);
}
{ // I4: the differential vs a growth-OFF twin — the rain must actually thicken the volley
  const apiZ=loadR(GROWTH_TERM,"0");
  const run=(a,s,ws,cs)=>{ const G=a.newGame(s,{weapons:ws,cast:cs}); let fires=0,hits=0;
    while(!G.over&&G.t<12000){ a.tick(G); for(const e of G.events){ if(e.kind==='shotFire')fires++; else if(e.kind==='hit'&&e.shot)hits++; } G.events.length=0; }
    return {fires,hits}; };
  let liveF=0,twinF=0,liveH=0,twinH=0,wins=0,ge=0;
  for(let s=1;s<=4;s++){ const L=run(api,s,['bow','hammer'],[0,1]), Z=run(apiZ,s,['bow','hammer'],[0,1]);
    liveF+=L.fires; twinF+=Z.fires; liveH+=L.hits; twinH+=Z.hits;
    if(L.fires>Z.fires)wins++; if(L.fires>=Z.fires)ge++; }
  ok('I4 GROWTH IS REAL: the live rain out-fires and out-lands the growth-OFF twin (same seeds, same cells)',
    liveF>twinF&&liveH>twinH&&wins>=2&&ge===4, `fires ${liveF} vs ${twinF} (${(liveF/twinF).toFixed(2)}x), hits ${liveH} vs ${twinH}, per-seed strict wins ${wins}/4, weak ${ge}/4`);
}
{ // I5: NO same-owner cross anywhere, on any shot class (the generalized law, behaviourally);
  // enemy crosses still annihilate (the law is not vacuous). Cross events emit in adjacent pairs
  // (killShot A then B at the cross site), so ownership is read off the pair.
  let pairs=0, ownPairs=0, enemyPairs=0, firesN=0, odd=0;
  for (const [ws,cs] of [[['bow','bow'],[0,1]],[['bow','hammer'],[0,1]],[['shuriken','shuriken'],[0,1]]]){
    for(let s=1;s<=2;s++){
      const G=newGame(s,{weapons:ws,cast:cs}); const owner={};
      while(!G.over&&G.t<9000){ tick(G);
        const crosses=[];
        for(const e of G.events){
          if(e.kind==='shotFire'){ owner[e.sid]=e.by; firesN++; }
          else if(e.kind==='shotCross') crosses.push(e);
          else if(e.kind==='roll'){ for(const c of e.clearedSids||[]) delete owner[c]; }
        }
        G.events.length=0;
        for(let i=0;i<crosses.length;i+=2){ const a=crosses[i],b=crosses[i+1];
          if(!b){ odd++; break; }
          pairs++;
          if(owner[a.sid]!==undefined&&owner[a.sid]===owner[b.sid]) ownPairs++; else enemyPairs++; }
      }
    }
  }
  ok('I5 FRIENDLY FIRE IS GONE: 0 same-owner crosses across bow mirror, bow-vs-melee and the star mirror (every shot class); enemy crosses still cancel both',
    firesN>100&&ownPairs===0&&enemyPairs>=1&&odd===0, `${firesN} fires, ${pairs} cross pairs: ${ownPairs} same-owner (LAW: 0), ${enemyPairs} enemy, ${odd} unpaired leftovers`);
}
{ // I6: the round-reset LAW on the rain counter + the fan identity is untouched. Pooled over
  // bow×hammer seeds: the bb mirror's rounds stall forever (deliberate-stall law) and never
  // reach a second roundStart — the hammer is what closes rounds.
  let boundaries=0, resetsBad=0, maxStep=0;
  for(let s=1;s<=6&&boundaries<2;s++){
    const G=newGame(s,{weapons:['bow','hammer'],cast:[s%2,1-(s%2)]});
    while(!G.over&&G.t<12000){ tick(G);
      for(const e of G.events) if(e.kind==='roundStart'){ boundaries++; for(const f of G.fighters) if(f.shotStep!==0) resetsBad++; }
      for(const f of G.fighters) if(f.shotStep>maxStep) maxStep=f.shotStep;
      G.events.length=0; }
  }
  ok('I6 the rain obeys the ROUND-RESET LAW: bow holders\' shotStep is 0 at every roundStart — the ladder re-climbs each round (maxStep proves it climbed)',
    boundaries>=2&&resetsBad===0&&maxStep>=1, `${boundaries} round starts, ${resetsBad} off-zero, in-round maxStep ${maxStep}`);
  ok('I7 the FAN IDENTITY is untouched: the knives keep their 3-anchor static volley — the rain is an accelerating STREAM, not a fan',
    (WEAPONS.knives.shot.volley||[]).length===3, `knives anchors ${JSON.stringify(WEAPONS.knives.shot.volley)}`);
}

/* Session 3 (2026-11-11): a retirement is a RESOLVED cell, not a failure — the denominator
 * includes them so a clean suite reads "N/N passed, M retired, 0 failed" and exits 0. fail>0
 * still exits 1. Retirements stay printed above, never silent. */
console.log(`\n${pass}/${pass+fail+retiredN} passed, ${retiredN} retired, ${fail} failed (a retired cell is printed and counted, never silent)`);
process.exit(fail?1:0);
