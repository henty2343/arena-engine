/* diag-flip-frames.mjs — READ-ONLY: per-frame trace of the first 2 flip episodes on s1.
 * The ledger probe showed Σconsumed ≈ 150.3ms for a 180ms clock — I need the exact per-frame
 * dt before I write a law on top of it. Non-vacuity discipline: don't codify a number I can't explain. */
import { readFileSync } from 'node:fs';
const html = readFileSync('previews/spinclash-preview.html','utf8');
const blocks=[]; { let i=0; while(true){ const a=html.indexOf('<script>',i); if(a<0)break; const b=html.indexOf('</script>',a); blocks.push(html.slice(a+8,b)); i=b; } }
globalThis.Path2D ??= class { arc(){} moveTo(){} lineTo(){} closePath(){} rect(){} };
const FRAME_MS=16.7;
function fakeEl(){const t=function(){};return new Proxy(t,{get(x,p){if(p===Symbol.toPrimitive)return()=>0;if(!(p in x))x[p]=fakeEl();return x[p];},set(x,p,v){x[p]=v;return true;},apply(){return fakeEl();}});}
const els={}; const makeEl=(id)=>({id,innerHTML:'',textContent:'',value:'',hidden:true,width:0,height:0,style:{},dataset:{},classList:{toggle(){},add(){},remove(){}},addEventListener(){},blur(){},focus(){},setAttribute(){},getAttribute(){return null;},getContext(){return fakeEl();}});
const documentStub={getElementById:(id)=>(els[id]||=makeEl(id)),createElement:()=>makeEl('offscreen'),querySelectorAll:()=>[],addEventListener:()=>{},activeElement:null,body:makeEl('body')};
const windowStub={devicePixelRatio:1,innerWidth:1200,innerHeight:900,addEventListener:()=>{}};
let rafFn=null; const rafStub=(fn)=>{rafFn=fn;return 1;};
new Function('document','window','performance','requestAnimationFrame','console',blocks[0])(documentStub,windowStub,{now:()=>0},rafStub,console);
new Function('document','window','performance','requestAnimationFrame','setInterval','setTimeout','console',blocks[1])(documentStub,windowStub,{now:()=>0},rafStub,()=>1,()=>0,console);
const app=windowStub.APP, step=(i)=>{const f=rafFn;rafFn=null;if(f)f(i*FRAME_MS);return !!f;};
const SEED=Number(process.argv[2]||1), SIDE=Number(process.argv[3]||0), MAXEP=Number(process.argv[4]||2);
app.restart(SEED);
let ep=0,prevAnimating=false,prevT=0,consumed=0,inEp=false,fr=0;
for(let i=0;i<9000;i++){
  if(!step(i))break;
  const inf=app.info(); const cur=inf.flip[SIDE], ft=inf.flipT[SIDE];
  const animating=Math.abs(cur)<1;
  if(animating){
    if(!inEp){inEp=true;consumed=0;fr=0;console.log(`--- episode ${ep+1} begins at frame ${i} ---`);}
    const dt=prevT-ft; fr++;
    if(dt<-1e-9) console.log(`  f${i}: cur ${cur.toFixed(4)} flipT ${ft.toFixed(2)} dt ${dt.toFixed(2)} → CLOCK RESET (new sweep); stopMs ${inf.stopMs.toFixed(1)}`);
    else { consumed+=Math.max(0,dt); console.log(`  f${i}: cur ${cur.toFixed(4)} flipT ${ft.toFixed(2)} dt ${dt.toFixed(2)} Σconsumed ${consumed.toFixed(2)} stopMs ${inf.stopMs.toFixed(1)} ${dt<FRAME_MS-0.05?'SLOW':'full'}`); }
  } else if(inEp){
    console.log(`  f${i}: LANDED cur ${cur} flipT ${ft.toFixed(2)} | episode ${ep+1}: ${fr} frames, Σconsumed ${consumed.toFixed(2)}ms (last dt ${(prevT-ft).toFixed(2)} not counted — animating went false)`);
    inEp=false; ep++; if(ep>=MAXEP)break;
  }
  prevAnimating=animating; prevT=ft;
  if(app.state().over)break;
}
