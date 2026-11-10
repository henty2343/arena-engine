import { readFileSync } from 'node:fs';
function fakeEl(){const t=function(){};return new Proxy(t,{get(x,p){if(p===Symbol.toPrimitive)return()=>0;if(!(p in x))x[p]=fakeEl();return x[p];},set(x,p,v){x[p]=v;return true;},apply(){return fakeEl();}});}
const html=readFileSync('previews/spinclash-preview.html','utf8');
const a=html.indexOf('<script>'),b=html.indexOf('</script>',a);
let body=html.slice(a+8,b);const op='(function () {';body=body.slice(body.indexOf(op)+op.length);body=body.slice(0,body.lastIndexOf('})();'));
const api=new Function('document','window','performance','requestAnimationFrame','console',body+'\n;return {WEAPONS,WEAPON_IDS,MULT_STEPS,CYCLE_STEPS,SKEWER};')({getElementById:()=>fakeEl(),createElement:()=>fakeEl(),querySelectorAll:()=>[],addEventListener:()=>{},activeElement:null},{devicePixelRatio:1,innerWidth:1200,innerHeight:900,addEventListener:()=>{}},{now:()=>0},()=>0,console);
const {WEAPONS,WEAPON_IDS,MULT_STEPS,CYCLE_STEPS,SKEWER}=api;
console.log('MULT_STEPS',MULT_STEPS,'CYCLE_STEPS',CYCLE_STEPS,'SKEWER.cutCos',SKEWER.cutCos);
for(const id of WEAPON_IDS){const t=WEAPONS[id].trait||{}; if(t.mult) console.log(`trait.mult holder: ${id} = ${t.mult} brief "${WEAPONS[id].brief}"`);}
console.log('staff brief  :',JSON.stringify(WEAPONS.staff.brief),'shotR',WEAPONS.staff.trait.shotR);
console.log('bow   brief  :',JSON.stringify(WEAPONS.bow.brief),'trait',JSON.stringify(WEAPONS.bow.trait));
console.log('boomerang    :',JSON.stringify(WEAPONS.boomerang.brief),'trait',JSON.stringify(WEAPONS.boomerang.trait));
console.log('  shot keys  :',Object.keys(WEAPONS.boomerang.shot).join(','));
console.log('  shot.orbit :',JSON.stringify(WEAPONS.boomerang.shot.orbit),'returns',WEAPONS.boomerang.shot.returns,'turn',WEAPONS.boomerang.shot.turn,'laps',WEAPONS.boomerang.shot.laps,'refund',WEAPONS.boomerang.shot.refund);
console.log('flail chain  :',JSON.stringify(WEAPONS.flail.chain),'trait.len',WEAPONS.flail.trait.len);
console.log('spear trait  :',JSON.stringify(WEAPONS.spear.trait),'chain',JSON.stringify(WEAPONS.spear.chain));
