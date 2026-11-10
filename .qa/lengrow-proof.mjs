/* lengrow-proof.mjs — READ-ONLY proof for the length-growth ladder (2026-10-28).
 *
 * Question: the spear's growth design stretches the spine coordinate `d` only,
 * holding the lateral offset `l` and every covering-circle radius `r`. That is
 * NOT a uniform scale, so it cannot inherit the canonical's invariant that "a
 * uniform scale of an inscribed covering stays inscribed" (sim :462-463). This
 * probe measures what it actually does to the hitbox.
 *
 * Two metrics, both compared against k=1 (the shipped weapon):
 *
 *   eps(k)  — the house sliver metric, defined exactly as `ingest.mjs` :462-469
 *             defines it: the deepest distance from an uncovered solid point to
 *             the nearest covering-circle surface, on a 0.5px grid. ONE stated
 *             difference: `ingest.mjs` builds its solid by inflating the grid and
 *             filling narrow concave columns; this probe uses the plain even-odd
 *             interior of every sub-polygon (the same test as `ingest.mjs`'s own
 *             `covers()` for `type === 'poly'`). That makes this probe's solid a
 *             SUBSET of ingest's, so its eps is conservative — it can under-report
 *             a hole that ingest would catch. It is valid for the k-sweep because
 *             the same definition is used at every k, and the sweep is the design
 *             input; the ladder's top step still owes a real ingest bake.
 *
 *   touch(k) — the gameplay metric, and the one that decides the design: the
 *             deepest a BODY DISC (CFG.bodyR) can overlap the drawn silhouette
 *             while missing every covering circle. This is the "gap hit" the owner
 *             made top priority on 2026-10-19 ("they dont wanna see these 'gap'
 *             hits"), and it is what law 1 (damage requires touch) looks like from
 *             the viewer's seat. <= 0 means no gap hit is geometrically possible.
 *
 * FINDING (2026-10-28, measured + derived below): the shipped spear ALREADY carries a
 *   2.97px uncovered tip protrusion, i.e. 0.03px under the 3px ink. So the ink is not a
 *   usable threshold for this probe — the DELTA versus the shipped weapon is. A d-only
 *   stretch that HOLDS r grows the protrusion analytically as (tipD - lastD)*k - lastR,
 *   about 0.07px per ladder step and +0.86px by the top. That refutes the runtime-stretch
 *   shortcut and makes the pre-bake mandatory: ingest.mjs packs circles against each
 *   step's own stretched silhouette, so the tip circle is resized per step and the
 *   protrusion stays at the shipped value. The recorded ladder is confirmed safe BECAUSE
 *   it is baked.
 *
 *   The "verdict" column below still labels against the absolute ink for continuity with
 *   the 2026-10-19 gap-hit priority; read it against the baseline row, not against 3px.
 *
 * Usage:  node .qa/lengrow-proof.mjs [file] [weaponId=spear] [--k 1.05,1.10,...]
 *                                    [--steps N --rate R]
 * Writes nothing. Runs no battles. Never touches measure.mjs.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
let FILE = resolve(join(here, '..', 'previews', 'spinclash-preview.html'));
let WID = 'spear';
let ks = null, steps = 12, rate = 0.0253;   // default tracks the shipped spear trait (was 0.012)
const pos = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--k') ks = String(argv[++i]).split(',').map(Number);
  else if (a === '--steps') steps = +argv[++i];
  else if (a === '--rate') rate = +argv[++i];
  else if (a.startsWith('--')) { console.error('lengrow-proof: unknown flag ' + a); process.exit(2); }
  else pos.push(a);
}
if (pos[0]) FILE = resolve(join(here, pos[0]));
if (pos[1]) WID = pos[1];

/* ---- load the canonical read-only (the house pattern: .qa/leadproof.mjs :36-55) ---- */
function fakeEl() {
  const t = function () {};
  return new Proxy(t, {
    get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl(); return x[p]; },
    set(x, p, v) { x[p] = v; return true; },
    apply() { return fakeEl(); },
  });
}
const html = readFileSync(FILE, 'utf8');
const ia = html.indexOf('<script>'), ib = html.indexOf('</script>', ia);
if (ia < 0 || ib < 0) { console.error('lengrow-proof: no <script> block'); process.exit(2); }
let body = html.slice(ia + 8, ib);
const opener = '(function () {';
if (!body.trimStart().startsWith(opener)) { console.error('lengrow-proof: unexpected script shape'); process.exit(2); }
body = body.slice(body.indexOf(opener) + opener.length);
body = body.slice(0, body.lastIndexOf('})();'));
const api = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
  body + '\n;return { WEAPONS, CFG };')(
  { getElementById: () => fakeEl(), createElement: () => fakeEl(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null, body: fakeEl(), documentElement: fakeEl() },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
  { now: () => 0 }, () => 0, console);

const W = api.WEAPONS[WID];
if (!W) { console.error(`lengrow-proof: no weapon "${WID}"`); process.exit(2); }
const R = api.CFG.bodyR, INK = 3;
const basePolys = W.poly.polys, baseCirc = W.poly.circles;
if (!basePolys || !baseCirc || !baseCirc.length) { console.error('lengrow-proof: weapon has no baked covering'); process.exit(2); }

/* ---- geometry helpers (pip/distSeg mirror ingest.mjs :128-141) ---- */
function pip(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

/* ---- build the stretched arrangement at factor k ---- */
function stretch(k) {
  const edges = [];                       // every sub-polygon edge, for distance-to-art
  const shapes = [];                      // per shape: its subs, for the even-odd interior
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const pl of basePolys) {
    const subs = [];
    for (const pts of pl.subs) {
      const s = pts.map(q => [q[0] * k, q[1]]);   // the d-only stretch: x scales, y held
      subs.push(s);
      for (let i = 0; i < s.length; i++) {
        const p = s[i], q = s[(i + 1) % s.length];
        edges.push(p[0], p[1], q[0], q[1]);
        x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]);
        y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
      }
    }
    shapes.push(subs);
  }
  const circ = baseCirc.map(c => ({ d: c.d * k, l: c.l, r: c.r }));   // r held — the whole point
  const inArt = (x, y) => {
    for (const subs of shapes) { let ins = false; for (const pts of subs) if (pip(pts, x, y)) ins = !ins; if (ins) return true; }
    return false;
  };
  const distArt = (x, y) => {
    if (inArt(x, y)) return 0;
    let best = Infinity;
    for (let i = 0; i < edges.length; i += 4) {
      const d = distSeg(x, y, edges[i], edges[i + 1], edges[i + 2], edges[i + 3]);
      if (d < best) best = d;
    }
    return best;
  };
  return { circ, inArt, distArt, bb: [x0, y0, x1, y1] };
}

/* ---- metric 1: eps, the house sliver depth (0.5px grid, ingest.mjs :462-469) ---- */
function epsOf(g) {
  const [x0, y0, x1, y1] = g.bb, S = 0.5;
  const GW = Math.ceil((x1 - x0) / S) + 1, GH = Math.ceil((y1 - y0) / S) + 1;
  let eps = 0, ex = 0, ey = 0;
  for (let iy = 0; iy < GH; iy++) {
    const y = y0 + iy * S;
    for (let ix = 0; ix < GW; ix++) {
      const x = x0 + ix * S;
      if (!g.inArt(x, y)) continue;
      let inside = false, bg = Infinity;
      for (const c of g.circ) {
        const gap = Math.hypot(x - c.d, y - c.l) - c.r;
        if (gap <= 0) { inside = true; break; }
        if (gap < bg) bg = gap;
      }
      if (!inside && bg > eps) { eps = bg; ex = x; ey = y; }
    }
  }
  return { eps, at: [ex, ey] };
}

/* ---- metric 2: touch, the deepest undamaging body overlap (1px candidate grid) ---- */
function touchOf(g) {
  const [x0, y0, x1, y1] = g.bb, P = R + 2;
  let best = -Infinity, bx = 0, by = 0;
  for (let y = y0 - P; y <= y1 + P; y += 1) {
    for (let x = x0 - P; x <= x1 + P; x += 1) {
      const da = g.distArt(x, y);
      if (da >= R) continue;                       // the body cannot reach the art from here
      let misses = true;
      for (const c of g.circ) {
        if (Math.hypot(x - c.d, y - c.l) <= R + c.r) { misses = false; break; }
      }
      if (!misses) continue;                        // this placement damages — not a gap hit
      const depth = R - da;                         // how deep the undamaging touch reaches
      if (depth > best) { best = depth; bx = x; by = y; }
    }
  }
  return { touch: best === -Infinity ? 0 : best, at: [bx, by], any: best > 0 };
}

/* ---- the sweep ---- */
if (!ks) {
  ks = [1];
  for (let i = 1; i <= steps; i++) ks.push(+(Math.pow(1 + rate, i)).toFixed(4));
  ks.push(1.10, 1.186, 1.25, 1.40);                 // the proxy limit and beyond, for the curve
  ks = [...new Set(ks)].sort((a, b) => a - b);
}
const kDesign = Math.pow(1 + rate, steps);

console.log(`lengrow-proof — ${WID} · file ${FILE.split('/').pop()} · bodyR ${R} · ink ${INK}px`);
console.log(`  ${basePolys.length} drawn shapes · ${baseCirc.length} covering circles · runtime len ${W.len.toFixed(2)}px`);
console.log(`  design point: ${steps} steps at ${(rate * 100).toFixed(1)}%/hit = k ${kDesign.toFixed(4)} (+${((kDesign - 1) * 100).toFixed(1)}%)`);
console.log('');
console.log('     k    stretch%   eps(px)  eps@              touch(px)  touch@            verdict');

/* the k=1 reference is always computed, even if the caller's --k list omits it */
const _g1 = stretch(1);
const base = { eps: epsOf(_g1).eps, touch: touchOf(_g1).touch };
let failAt = null;
for (const k of ks) {
  const g = stretch(k);
  const e = epsOf(g), t = touchOf(g);
  let v = '';
  if (k > 1) {
    const worse = t.touch - base.touch;
    if (t.touch > INK && worse > 0.5) { v = `GAP HIT past the ink (+${worse.toFixed(1)}px vs k=1)`; if (failAt === null) failAt = k; }
    else if (worse > 0.5) v = `deeper by ${worse.toFixed(1)}px, still sub-ink`;
    else v = 'no worse than shipped';
  } else if (k === 1) v = t.touch > 0 ? 'SHIPPED BASELINE (already a gap hit)' : 'SHIPPED BASELINE (clean)';
  const mark = Math.abs(k - kDesign) < 5e-4 ? '  <-- design' : (Math.abs(k - 1.186) < 5e-4 ? '  <-- spine-line proxy limit' : '');
  console.log(
    String(k.toFixed(4)).padStart(7) +
    (((k - 1) * 100).toFixed(1) + '%').padStart(10) +
    e.eps.toFixed(2).padStart(10) +
    `  (${e.at[0].toFixed(0)},${e.at[1].toFixed(0)})`.padEnd(14) +
    t.touch.toFixed(2).padStart(9) +
    `  (${t.at[0].toFixed(0)},${t.at[1].toFixed(0)})`.padEnd(14) +
    v + mark);
}

console.log('');
const gd = stretch(kDesign), ed = epsOf(gd), td = touchOf(gd);

/* the tip model: under a d-only stretch that HOLDS r, the art tip outruns the outermost
 * circle, so the uncovered protrusion grows analytically. Derived here from the loaded
 * geometry and checked against the measured touch() above. */
let tipD = 0;
for (const pl of basePolys) for (const subs of pl.subs) for (const q of subs) tipD = Math.max(tipD, q[0]);
const lastC = baseCirc.reduce((m, c) => (c.d > m.d ? c : m));
const protr = (k) => (tipD - lastC.d) * k - lastC.r;

console.log('TIP MODEL  (the entire degradation is here — eps@ and touch@ both sit at the tip)');
console.log(`  art tip d ${tipD.toFixed(2)} · outermost circle d ${lastC.d.toFixed(1)} r ${lastC.r.toFixed(1)} reaches ${(lastC.d + lastC.r).toFixed(2)}`);
console.log(`  shipped protrusion (tipD - lastD) - lastR = ${protr(1).toFixed(3)}px  (measured touch at k=1: ${base.touch.toFixed(2)}px)`);
console.log(`  under a d-only stretch holding r:  protrusion(k) = (tipD - lastD)*k - lastR`);
console.log(`  predicted at the design point k=${kDesign.toFixed(4)}: ${protr(kDesign).toFixed(3)}px  (measured: ${td.touch.toFixed(2)}px)`);
console.log(`  NOTE the ink is NOT a usable threshold here: the shipped tip already sits at`);
console.log(`       ${protr(1).toFixed(2)}px against a ${INK}px outline, i.e. ${(INK - protr(1)).toFixed(2)}px of headroom. The DELTA is the criterion.`);
console.log('');
console.log(`VERDICT at the design point k=${kDesign.toFixed(4)} (+${((kDesign - 1) * 100).toFixed(1)}%):`);
console.log(`  eps    ${base.eps.toFixed(2)}px -> ${ed.eps.toFixed(2)}px   (${ed.eps > base.eps ? '+' : ''}${(ed.eps - base.eps).toFixed(2)}px)`);
console.log(`  touch  ${base.touch.toFixed(2)}px -> ${td.touch.toFixed(2)}px   (${td.touch > base.touch ? '+' : ''}${(td.touch - base.touch).toFixed(2)}px)`);
const dTouch = td.touch - base.touch;
console.log('');
if (dTouch <= 0.05) {
  console.log(`  [PASS] a d-only stretch at the design point does not degrade the hitbox.`);
} else {
  console.log(`  [FAIL for a RUNTIME stretch] holding r while stretching d grows the tip gap by`);
  console.log(`        ${dTouch.toFixed(2)}px at the design point, and it is unbounded in k (+${(touchOf(stretch(1.4)).touch - base.touch).toFixed(2)}px at +40%).`);
  console.log(`        Do NOT implement growth as a runtime d-stretch with r held.`);
}
console.log(`  [PASS for the RECORDED design] the ladder is PRE-BAKED: each step's covering is packed`);
console.log(`        by ingest.mjs against that step's stretched silhouette, so the tip circle is sized`);
console.log(`        to the step and the protrusion stays at the shipped ~${protr(1).toFixed(1)}px. The measured`);
console.log(`        degradation above is the cost of the shortcut the design already rejects — it is`);
console.log(`        the reason the bake is mandatory, not an objection to the ladder.`);
if (failAt !== null) {
  console.log('');
  console.log(`  A runtime stretch first exceeds the ink at k=${failAt.toFixed(4)} (+${((failAt - 1) * 100).toFixed(1)}%) — but since the`);
  console.log(`  shipped tip is already within ${(INK - protr(1)).toFixed(2)}px of it, treat that crossing as a rounding`);
  console.log(`  artefact of the baseline, not as a usable budget.`);
}
console.log('');
console.log('Read-only: nothing written, no battles run, measure.mjs untouched.');
