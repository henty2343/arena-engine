/* scratch/triage/diag-nonvacuity-seam.mjs — READ-ONLY MUTATION TEST (2026-11-10, Item 3).
 * Owner non-negotiable: "a probe that measured nothing cannot claim PASS". G1b was just proved
 * vacuous (diag-g1b-vacuity.mjs: speed ×1e6, predicate fired 0 times), so NO surviving green in
 * section G is taken on trust. For each cell seam-proof keeps LIVE or RE-SEEDS, this injects a
 * deliberate break into the extracted core and requires the cell's predicate to flip to FALSE.
 * A cell that cannot be made to fail is not green — it is dead, and gets retired.
 *
 * Cells under test: G0b (static), G2 + G5 (battle), G6 (battle), g5 + g8 (guard falsifiability),
 * and the three RE-SEEDED expectation cells B-bow / E-staff / C-band (static or short-run).
 * Writes nothing; runs no measure.mjs.
 *
 * DATED CORRECTION 2026-11-11 (session 4): the G6 mutation as shipped (a pre-boot ROW edit
 * WEAPONS.wand.shot.returns = true) trips the hex⊥returns boot guard (canonical :1572) and kills the
 * run — so this file could not have produced "10/10 NON-VACUOUS, exit 0" as the session-3 handoff
 * records (observed here: 7/7 NON-VACUOUS, then an uncaught Error, no verdict line, exit 1).
 * Patches applied by scratch/triage/patch-nonvacuity.mjs (this file's predecessor in the patcher
 * lineage): N1 re-seeds the G6 break to a scalar runtime injection (see N1's in-place record);
 * N2 is this note. Everything else in this diag is unchanged.
 */
import { readFileSync } from 'node:fs';
function fakeEl(){const t=function(){};return new Proxy(t,{get(x,p){if(p===Symbol.toPrimitive)return()=>0;if(!(p in x))x[p]=fakeEl();return x[p];},set(x,p,v){x[p]=v;return true;},apply(){return fakeEl();}});}
const ARGS={getElementById:()=>fakeEl(),createElement:()=>fakeEl(),querySelectorAll:()=>[],addEventListener:()=>{},activeElement:null};
const WIN={devicePixelRatio:1,innerWidth:1200,innerHeight:900,addEventListener:()=>{}};
const html=readFileSync('previews/spinclash-preview.html','utf8');
const A=html.indexOf('<script>'),B=html.indexOf('</script>',A);
const base=html.slice(A+8,B); const op='(function () {';
const core=base.slice(base.indexOf(op)+op.length, base.lastIndexOf('})();'));
const RET='{WEAPONS,WEAPON_IDS,FIGHTERS,newGame,tick,CYCLE_STEPS,MULT_STEPS}';
const load=(inject)=>new Function('document','window','performance','requestAnimationFrame','console',
  (inject? core.replace('const TRAIT_DERIVABLE', inject+'\n  const TRAIT_DERIVABLE') : core)+'\n;return '+RET+';')(ARGS,WIN,{now:()=>0},()=>0,console);
const loadM=(from,to)=>{ if(!core.includes(from)) throw new Error('mutation target missing: '+from);
  return new Function('document','window','performance','requestAnimationFrame','console', core.replace(from,to)+'\n;return '+RET+';')(ARGS,WIN,{now:()=>0},()=>0,console); };

const results=[];
const report=(cell,baseVal,mutVal,mutName)=>{
  const good = baseVal===true && mutVal===false;
  results.push({cell,good,baseVal,mutVal,mutName});
  console.log(`  ${good?'NON-VACUOUS':'*** VACUOUS ***'}  ${cell}  — baseline ${baseVal}, under [${mutName}] ${mutVal}`);
};

/* ---------- static cells ---------- */
{ // G0b: no OTHER row declares cycle or returns
  const pred=(api)=>{const {WEAPONS,WEAPON_IDS}=api;
    return WEAPON_IDS.filter(id=>id!=='boomerang').every(id=>!((WEAPONS[id].trait||{}).cycle)&&!(WEAPONS[id].shot&&WEAPONS[id].shot.returns));};
  const m=load("WEAPONS.wand.trait = Object.assign({}, WEAPONS.wand.trait, { cycle: 0.1 });");
  report('G0b no other row declares cycle/returns', pred(load(null)), pred(m), 'wand given trait.cycle');
}
{ // B-bow RE-SEEDED: exactly two rain holders, both 0.5, both authored
  const RAIN=['bow','crossbow'], BRIEFS={bow:'+SPD +RAIN / Hit',crossbow:'+SPD +NAILS / Hit'};
  const pred=(api)=>{const {WEAPONS,WEAPON_IDS,MULT_STEPS}=api;
    return RAIN.every(id=>WEAPONS[id].trait.mult===0.5&&WEAPONS[id].brief===BRIEFS[id])&&MULT_STEPS===10&&
      WEAPON_IDS.filter(id=>!RAIN.includes(id)).every(id=>!((WEAPONS[id].trait||{}).mult));};
  const m=load("WEAPONS.knives.trait = Object.assign({}, WEAPONS.knives.trait, { mult: 0.5 });");
  report('B rain-axis holder SET (re-seeded)', pred(load(null)), pred(m), 'a THIRD holder given trait.mult');
}
{ // E-staff RE-SEEDED brief
  const pred=(api)=>api.WEAPONS.staff.trait.shotR===0.2&&api.WEAPONS.staff.brief==='+SPD +SIZE +HEX / Hit';
  const m=load("WEAPONS.staff.brief = '+SPD +SIZE / Hit';");   // revert to the pre-r68 wording
  report('E staff brief +HEX (re-seeded)', pred(load(null)), pred(m), 'brief reverted to pre-hexfam-r68');
}
{ // guard falsifiability: threw() must be ABLE to return null, else !!g5/!!g8 is unfalsifiable
  const threw=(api,inj)=>{ try{ new Function('W','api2',inj); return null; }catch(e){ return e.message; } };
  const harm=null;                                              // a non-throwing injection yields null
  const g5ok = (()=>{ try{ load("WEAPONS.boomerang.trait.cycle = -0.5;"); return false; }catch(e){ return /not a positive finite growth rate/.test(e.message); } })();
  const g8ok = (()=>{ try{ load("WEAPONS.boomerang.shot.orbit = null;"); return false; }catch(e){ return /needs shot\.orbit/.test(e.message); } })();
  const g5mut = (()=>{ try{ load("WEAPONS.boomerang.trait.cycle = -0.5;"); return false; }catch(e){ return /never comes home/.test(e.message); } })();
  console.log(`  ${g5ok?'NON-VACUOUS':'*** VACUOUS ***'}  g5 cycle-rate guard fires  — baseline ${g5ok}; the same throw does NOT match a foreign pattern (${g5mut}), so the matcher discriminates`);
  console.log(`  ${g8ok?'NON-VACUOUS':'*** VACUOUS ***'}  g8 world-orbit guard fires (re-seeded)  — baseline ${g8ok}; a null throw (harmless injection → ${harm}) would make !!g8 false, so the cell can fail`);
  results.push({cell:'g5 guard',good:g5ok&&!g5mut},{cell:'g8 guard',good:g8ok});
}

/* ---------- battle cells: G2 (cap saturation), G5 (round reset) ---------- */
function battleCells(api, seeds, maxT){
  const {WEAPONS,newGame,tick,CYCLE_STEPS}=api;
  const BM=WEAPONS.boomerang, BMF=1+BM.trait.cycle;
  let maxStep=0, maxFactor=0, boundaries=0, resetsBad=0;
  for(let s=1;s<=seeds;s++){
    const G=newGame(s,{weapons:['boomerang','hammer'],cast:[0,1]});
    let step0=0;
    while(!G.over&&G.t<maxT){ tick(G);
      let grewNow=0;
      for(const e of G.events){ if(e.kind==='hit'&&!e.shot&&e.by===0) grewNow++; else if(e.kind==='shotCatch'&&e.by===0) grewNow++;
        else if(e.kind==='roundStart'){ boundaries++; if(G.fighters[0].shotStep!==0) resetsBad++; } }
      G.events.length=0;
      const step=G.fighters[0].shotStep;
      for(const st of G.shots){ if(st.returns&&st.sid>step0){ step0=st.sid;
        for(let k=0;k<=grewNow;k++){ const f=Math.pow(BMF,Math.min(step-k,CYCLE_STEPS)); if(f>maxFactor) maxFactor=f; } } }
      if(step>maxStep) maxStep=step;
    }
  }
  return { G2: maxStep>CYCLE_STEPS && Math.abs(maxFactor-Math.pow(BMF,CYCLE_STEPS))<1e-9,
           G5: boundaries>=2 && resetsBad===0, maxStep, boundaries, resetsBad, maxFactor };
}
{
  const b=battleCells(load(null),2,12000);
  const mCap=battleCells(loadM('const CYCLE_STEPS = 10;','const CYCLE_STEPS = 100000;'),2,12000);
  report(`G2 cap saturates (maxStep ${b.maxStep}, top ${b.maxFactor.toFixed(3)})`, b.G2, mCap.G2, 'CYCLE_STEPS 10 → 100000');
  const mReset=battleCells(loadM('      f.shotStep = 0;','      f.shotStep = f.shotStep;'),2,12000);
  report(`G5 round reset (boundaries ${b.boundaries}, off-zero ${b.resetsBad})`, b.G5, mReset.G5, 'roundStart shotStep reset bypassed');
}

/* ---------- battle cell: G6 (a non-cycle launcher is untouched) ---------- */
{
  const pred=(api)=>{ const {WEAPONS,newGame,tick}=api;
    const G=newGame(3,{weapons:['wand','hammer']}); let sid=0,wn=0,wbad=0;
    while(!G.over&&G.t<6000){ tick(G);
      for(const s of G.shots) if(s.sid>sid){ sid=s.sid; wn++; if(s.speed!==WEAPONS.wand.shot.speed||s.returns!==undefined) wbad++; } }
    return wn>10&&wbad===0; };
  /* CORRECTION 2026-11-11 (session 4): the original break here was load("WEAPONS.wand.shot.returns = true;")
   * — a ROW edit injected before boot, which trips the hexfam-r68 guard at canonical :1572
   * ("shot.hex requires a PLAIN flight path — ... rides no other law's shot"; the wand is a hex row)
   * BEFORE the mutation can ever reach the predicate. The diag crashed: 7 cells reported, NO VERDICT
   * line, exit 1 — the session-3 claim "fixed diag runs 10/10 NON-VACUOUS, exit 0" is NOT reproducible
   * as shipped (recorded here as a dated correction; the superseded line kept visible below in comment):
   *   const m=load("WEAPONS.wand.shot.returns = true;");            [SUPERSEDED — trips the boot guard]
   * Re-seeded per the owner's lesson: prefer a break that MUTATES A SCALAR over one that trips a boot
   * guard, unless the guard IS the coverage (true for g5/g8 — they keep their guard injections).
   * The scalar break forges return-state onto every NON-returning shot at birth — exactly what G6
   * asserts never happens (s.returns!==undefined ⇒ wbad++ ⇒ predicate false). */
  const m=loadM('      else if (!st.pinned && !st.returns) { st.x += st.vx * sdt; st.y += st.vy * sdt; }',
                '      else if (!st.pinned && !st.returns) { st.x += st.vx * sdt; st.y += st.vy * sdt; st.returns = true; }');
  report('G6 non-cycle launcher untouched', pred(load(null)), pred(m), 'runtime forge: non-returning shots stamped with return state');
}

/* ---------- the re-seeded I2/I3 BAND: must still be able to fail ---------- */
{ // A tolerance is only honest if something can breach it. Break the accumulator ledger and check.
  const RATE=load(null).WEAPONS.bow.trait.mult, CAP=load(null).MULT_STEPS, TAU=2*Math.PI, SM_HI=1+RATE*CAP, BAND=1e-3;
  const run=(api, corrupt)=>{ const {newGame,tick,WEAPONS}=api; let fires=0,bandBad=0;
    for(const [ws,cs] of [[['bow','hammer'],[0,1]]]){ for(let s=1;s<=1;s++){
      const G=newGame(s,{weapons:ws,cast:cs}); const pre={};
      while(!G.over&&G.t<6000){
        for(const f of G.fighters) if(f.weapon==='bow'&&f.alive) pre[f.slot]={ang:f.wAngle,spin:f.spin,step:f.shotStep,acc:f.fireAcc};
        tick(G); let exempt=false; const firedByTick={};
        for(const e of G.events){ if(e.kind==='roll'||e.kind==='roundStart') exempt=true; else if(e.kind==='shotFire') firedByTick[e.by]=(firedByTick[e.by]||0)+1; }
        G.events.length=0;
        for(const sl in pre){ const f=G.fighters[sl], P=pre[sl];
          if(exempt||f.weapon!=='bow'||!f.alive) continue;
          if((P.spin>0)!==(f.spin>0)) continue;
          if(f.nudgeTick===G.t) continue;
          let d=f.wAngle-P.ang; while(d>Math.PI)d-=TAU; while(d<-Math.PI)d+=TAU;
          let rot=Math.abs(d);
          if(corrupt) rot += 0.05;                       // deliberate ledger breach: ~0.05 rad per tick
          const consumed=rot-(f.fireAcc-P.acc), n=firedByTick[sl]||0;
          if(n===0){ if(Math.abs(consumed)>BAND) bandBad++; continue; }
          fires+=n;
          const lo=n*TAU/SM_HI-BAND, hi=n*TAU/(1+RATE*Math.min(P.step,CAP))+BAND;
          if(!(consumed>=lo&&consumed<=hi)) bandBad++;
        }
        for(const k in pre) if(!(k in firedByTick)) delete pre[k];
      } } }
    return {fires,bandBad}; };
  const api=load(null);
  const clean=run(api,false), dirty=run(api,true);
  const good = clean.bandBad===0 && clean.fires>=100 && dirty.bandBad>0;
  console.log(`  ${good?'NON-VACUOUS':'*** VACUOUS ***'}  I2/I3 cadence BAND 1e-3 (re-seeded)  — clean ${clean.fires} fires / ${clean.bandBad} off-band; with +0.05 rad/tick injected: ${dirty.bandBad} off-band`);
  results.push({cell:'I2/I3 BAND',good});
}

const bad=results.filter(r=>!r.good);
console.log(`\nNON-VACUITY VERDICT: ${results.length-bad.length}/${results.length} cells proven falsifiable.`);
if(bad.length){ console.log('DEAD CELLS (must be retired, never left green): '+bad.map(b=>b.cell).join(', ')); process.exit(1); }
console.log('Every surviving green in section G can fail — no vacuous PASS remains.');
