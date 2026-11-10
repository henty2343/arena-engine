/* diag-g1b-vacuity.mjs — READ-ONLY. Claim under test: seam-proof's G1b ("the oval's SCALE stays
 * locked", speed/turn === the row ratio) is VACUOUS on this build — it reports ok/42788 checks while
 * comparing NaN, because shot.turn died with the halo at touchorbit-r53. A probe that measured
 * nothing cannot claim PASS (owner non-negotiable), so this must be proved, not assumed. */
import { readFileSync } from 'node:fs';
function fakeEl(){const t=function(){};return new Proxy(t,{get(x,p){if(p===Symbol.toPrimitive)return()=>0;if(!(p in x))x[p]=fakeEl();return x[p];},set(x,p,v){x[p]=v;return true;},apply(){return fakeEl();}});}
const html=readFileSync('previews/spinclash-preview.html','utf8');
const a=html.indexOf('<script>'),b=html.indexOf('</script>',a);
let body=html.slice(a+8,b);const op='(function () {';body=body.slice(body.indexOf(op)+op.length);body=body.slice(0,body.lastIndexOf('})();'));
const api=new Function('document','window','performance','requestAnimationFrame','console',body+'\n;return {WEAPONS,newGame,tick};')({getElementById:()=>fakeEl(),createElement:()=>fakeEl(),querySelectorAll:()=>[],addEventListener:()=>{},activeElement:null},{devicePixelRatio:1,innerWidth:1200,innerHeight:900,addEventListener:()=>{}},{now:()=>0},()=>0,console);
const {WEAPONS,newGame,tick}=api;
const BM=WEAPONS.boomerang;
console.log(`row: BM.shot.turn = ${BM.shot.turn}  → BM.shot.speed/BM.shot.turn = ${BM.shot.speed/BM.shot.turn}`);
const rowRatio = BM.shot.speed/Math.abs(BM.shot.turn);
console.log(`G1b's row ratio is ${rowRatio} (NaN means every comparison against it is false)`);
// replicate G1b's exact predicate on live in-flight shots
let radiusN=0, radiusBad=0, sawTurn=0, sawTurnUndef=0;
for(let s=1;s<=2;s++){
  const G=newGame(s,{weapons:['boomerang','hammer'],cast:[0,1]});
  while(!G.over&&G.t<12000){ tick(G);
    for(const st of G.shots){ if(st.returns){ radiusN++;
      if(st.turn===undefined) sawTurnUndef++; else sawTurn++;
      if(Math.abs(st.speed/Math.abs(st.turn)-rowRatio)>1e-9) radiusBad++; } }
  }
}
console.log(`in-flight checks ${radiusN}: shot.turn defined ${sawTurn}, undefined ${sawTurnUndef}`);
console.log(`G1b predicate result: radiusBad=${radiusBad} → cell would report ${radiusN>1000&&radiusBad===0?'ok (PASS)':'FAIL'}`);
// the decisive test: does the predicate EVER fire? Inject a grossly wrong speed and see.
let fired=0;
{ const G=newGame(1,{weapons:['boomerang','hammer'],cast:[0,1]});
  while(!G.over&&G.t<3000){ tick(G);
    for(const st of G.shots) if(st.returns){ st.speed = st.speed*1e6;   // deliberately break the identity
      if(Math.abs(st.speed/Math.abs(st.turn)-rowRatio)>1e-9) fired++; } } }
console.log(`NON-VACUITY TEST: after multiplying every loop's speed by 1e6, the predicate fired ${fired} times.`);
console.log(fired===0 ? 'VERDICT: VACUOUS — G1b cannot fail. It is not a passing cell; it is a dead one.' : 'VERDICT: non-vacuous');
