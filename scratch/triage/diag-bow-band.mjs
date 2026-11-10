/* scratch/triage/diag-bow-band.mjs — READ-ONLY: how far off-band are the I2/I3 fires?
 * tiny → tolerance issue (re-seed the 1e-9); large → the accumulator law genuinely moved (investigate). */
import { readFileSync } from 'node:fs';
const FILE='previews/spinclash-preview.html';
function fakeEl(){const t=function(){};return new Proxy(t,{get(x,p){if(p===Symbol.toPrimitive)return()=>0;if(!(p in x))x[p]=fakeEl();return x[p];},set(x,p,v){x[p]=v;return true;},apply(){return fakeEl();}});}
const html=readFileSync(FILE,'utf8');
const a=html.indexOf('<script>'),b=html.indexOf('</script>',a);
let body=html.slice(a+8,b);const opener='(function () {';body=body.slice(body.indexOf(opener)+opener.length);body=body.slice(0,body.lastIndexOf('})();'));
const api=new Function('document','window','performance','requestAnimationFrame','console',body+'\n;return {newGame,tick,WEAPONS,MULT_STEPS};')({getElementById:()=>fakeEl(),createElement:()=>fakeEl(),querySelectorAll:()=>[],addEventListener:()=>{},activeElement:null},{devicePixelRatio:1,innerWidth:1200,innerHeight:900,addEventListener:()=>{}},{now:()=>0},()=>0,console);
const {newGame,tick,WEAPONS,MULT_STEPS}=api;
const RATE=WEAPONS.bow.trait.mult,CAP=MULT_STEPS,TAU=2*Math.PI,SM_HI=1+RATE*CAP;
let worst=0,worstAt='',nOff=0,nChecked=0,offes=[];
for(const [ws,cs] of [[['bow','hammer'],[0,1]],[['bow','hammer'],[1,0]],[['bow','bow'],[0,1]]]){
 for(let s=1;s<=2;s++){
  const G=newGame(s,{weapons:ws,cast:cs});const pre={};
  while(!G.over&&G.t<12000){
   for(const f of G.fighters)if(f.weapon==='bow'&&f.alive)pre[f.slot]={ang:f.wAngle,spin:f.spin,step:f.shotStep,acc:f.fireAcc};
   tick(G);let exempt=false;const firedByTick={};
   for(const e of G.events){if(e.kind==='roll'||e.kind==='roundStart')exempt=true;else if(e.kind==='shotFire')firedByTick[e.by]=(firedByTick[e.by]||0)+1;}
   G.events.length=0;
   for(const sl in pre){const f=G.fighters[sl],P=pre[sl];
    if(exempt||f.weapon!=='bow'||!f.alive)continue;
    if((P.spin>0)!==(f.spin>0))continue;
    if(f.nudgeTick===G.t)continue;
    let d=f.wAngle-P.ang;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;
    const rot=Math.abs(d),consumed=rot-(f.fireAcc-P.acc),n=firedByTick[sl]||0;
    if(n===0){if(Math.abs(consumed)>1e-9){offes.push(['bank',Math.abs(consumed),`s${s} t${G.t}`]);if(Math.abs(consumed)>worst){worst=Math.abs(consumed);worstAt=`bank s${s} t${G.t}`;}nOff++;}continue;}
    nChecked+=n;
    const lo=n*TAU/SM_HI-1e-9,hi=n*TAU/(1+RATE*Math.min(P.step,CAP))+1e-9;
    if(!(consumed>=lo&&consumed<=hi)){nOff++;const dev=consumed<lo?lo-consumed:consumed-hi;
     offes.push(['fire',dev,`s${s} t${G.t} step ${P.step} n ${n}`]);if(dev>worst){worst=dev;worstAt=`fire s${s} t${G.t} step ${P.step} dev ${dev.toExponential(3)}`;}}
    if(P.step>=CAP){const satdev=Math.abs(consumed-n*TAU/SM_HI);if(satdev>1e-9){offes.push(['sat',satdev,`s${s} t${G.t}`]);if(satdev>worst){worst=satdev;worstAt=`sat s${s} t${G.t} dev ${satdev.toExponential(3)}`;}}}
   }
   for(const k in pre)if(!(k in firedByTick))delete pre[k];
  }
 }
}
console.log(`worst deviation ${worst.toExponential(3)} at ${worstAt}; off-observations ${nOff}, fires checked ${nChecked}`);
const cls={};for(const [c] of offes)cls[c]=(cls[c]||0)+1;console.log('by class:',JSON.stringify(cls));
const maxes={};for(const [c,v] of offes)maxes[c]=Math.max(maxes[c]||0,v);console.log('max dev by class:',JSON.stringify(Object.fromEntries(Object.entries(maxes).map(([k,v])=>[k,v.toExponential(2)]))));
