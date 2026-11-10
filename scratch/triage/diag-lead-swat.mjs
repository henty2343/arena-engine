/* scratch/triage/diag-lead-swat.mjs — READ-ONLY: classify every failing leadproof swat cell.
 * Hypothesis: all 15 are the skewer CUT-FREE class (killShot(...,'swat',vf,0), canonical :3654) —
 * an angle-window escape with NO circle touch, added at skewer-r46 AFTER leadproof Part B was built.
 * Test: for every swat with stored gap===0, recompute the cut law from stored fields alone:
 *   cos(fAng)*wx + sin(fAng)*wy over wd  >  SKEWER.cutCos   (wx,wy = spear pos - victim pos). */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(here, '..', '..', 'previews', 'spinclash-preview.html');
function fakeEl() {
  const t = function () {};
  return new Proxy(t, {
    get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl(); return x[p]; },
    set(x, p, v) { x[p] = v; return true; },
    apply() { return fakeEl(); },
  });
}
const html = readFileSync(FILE, 'utf8');
const a = html.indexOf('<script>'), b = html.indexOf('</script>', a);
let body = html.slice(a + 8, b);
const opener = '(function () {';
body = body.slice(body.indexOf(opener) + opener.length);
body = body.slice(0, body.lastIndexOf('})();'));
const api = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
  body + '\n;return { newGame, tick, CFG, WEAPONS, geom, SKEWER };')(
  { getElementById: () => fakeEl(), createElement: () => fakeEl(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
  { now: () => 0 }, () => 0, console);
const { newGame, tick, CFG, WEAPONS, geom, SKEWER } = api;

const gapOf = (circ, x, y, sr) => { let best = Infinity;
  for (let ci = 0; ci < circ.length; ci += 3) { const d = Math.hypot(x - circ[ci], y - circ[ci + 1]) - circ[ci + 2]; if (d < best) best = d; }
  return best - sr; };

console.log(`SKEWER.cutCos = ${SKEWER && SKEWER.cutCos}`);
let touchBad = 0, cutSeen = 0, cutLawOK = 0, cutLawBad = 0;
for (const [name, seed, w] of [['javelin+bow', 5, ['javelin', 'bow']], ['javelin+javelin', 7, ['javelin', 'javelin']]]) {
  const G = newGame(seed, { weapons: w });
  let t = 0;
  while (!G.over && t < 18000) {
    tick(G); t++;
    for (const e of G.events) {
      if (e.kind !== 'swat') continue;
      const fp = geom.leadFlip(e.fW, e.fSp);
      const circ = geom.bladeCircles(e.fx, e.fy, e.fAng, e.fW, [], undefined, fp);
      const g = gapOf(circ, e.x, e.y, e.sr);
      if (g <= 1e-4) continue;                    // the touch class recomputes fine
      if (e.gap !== 0) { touchBad++; console.log(`!! TOUCH-class failure: ${name} s${seed} t${e.tick} recompute ${g.toFixed(2)} stored gap ${e.gap}`); continue; }
      cutSeen++;
      const wx = e.x - e.fx, wy = e.y - e.fy, wd = Math.hypot(wx, wy) || 1;
      const cosv = (Math.cos(e.fAng) * wx + Math.sin(e.fAng) * wy) / wd;
      if (cosv > SKEWER.cutCos) cutLawOK++;
      else { cutLawBad++; console.log(`!! CUT law mismatch: ${name} s${seed} t${e.tick} cos ${cosv.toFixed(3)} <= cutCos ${SKEWER.cutCos} (recompute gap ${g.toFixed(2)})`); }
      if (cutSeen <= 3) console.log(`cut sample: ${name} s${seed} t${e.tick} fW=${e.fW} stored gap 0, touch-recompute ${g.toFixed(2)}px, cut-law cos ${cosv.toFixed(3)} > ${SKEWER.cutCos} → ${cosv > SKEWER.cutCos}`);
    }
    G.events.length = 0;
  }
}
console.log(`SUMMARY: touch-class failures ${touchBad} | cut-class swats among the red cells ${cutSeen} (angle law recomputes: ${cutLawOK} OK, ${cutLawBad} BAD)`);
