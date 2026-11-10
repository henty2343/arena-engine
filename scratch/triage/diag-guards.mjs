import { readFileSync } from 'node:fs';
function fakeEl(){const t=function(){};return new Proxy(t,{get(x,p){if(p===Symbol.toPrimitive)return()=>0;if(!(p in x))x[p]=fakeEl();return x[p];},set(x,p,v){x[p]=v;return true;},apply(){return fakeEl();}});}
const html=readFileSync('previews/spinclash-preview.html','utf8');
const a=html.indexOf('<script>'),b=html.indexOf('</script>',a);
const base=html.slice(a+8,b);const op='(function () {';
const core=base.slice(base.indexOf(op)+op.length, base.lastIndexOf('})();'));
const load=(inject)=>new Function('document','window','performance','requestAnimationFrame','console',(inject? core.replace('const TRAIT_DERIVABLE', inject+'\n  const TRAIT_DERIVABLE') : core)+'\n;return {WEAPONS};')({getElementById:()=>fakeEl(),createElement:()=>fakeEl(),querySelectorAll:()=>[],addEventListener:()=>{},activeElement:null},{devicePixelRatio:1,innerWidth:1200,innerHeight:900,addEventListener:()=>{}},{now:()=>0},()=>0,console);
const threw=(inj)=>{try{load(inj);return null;}catch(e){return e.message;}};
for(const [n,inj] of [['g5 cycle<0','WEAPONS.boomerang.trait.cycle = -0.5;'],['g6 turn=0','WEAPONS.boomerang.shot.turn = 0;'],['g7 elong=1.2','WEAPONS.boomerang.shot.orbit.elong = 1.2;'],['g8 orbit=null','WEAPONS.boomerang.shot.orbit = null;']]){
  const m=threw(inj); console.log(`${n}: ${m? 'THREW — '+m.slice(0,150) : 'NO THROW'}`);
}
