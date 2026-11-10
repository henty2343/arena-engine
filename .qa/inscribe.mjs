/* .qa/inscribe.mjs — PERMANENT inscription gate + regenerator (owner directive
 * 2026-10-19: "this should be a top priority to always make weapons visibly
 * touch something else before something happens, like nobody wants to see
 * parry fire or body taking damage when there is a visible gap between etc").
 * NOT measure.mjs (owner-go rule); audit mode runs in seconds.
 *
 * Doctrine under test ("what you see is what hits", both directions):
 *   ink  = union over polys of (even-odd fill of ALL sub-rings) dilated by the
 *          drawn outline half-stroke (drawWeapon: lineWidth 3 world px, round
 *          joins, 1:1 world scale). Ground truth is a raster + exact distance
 *          transform (RES 0.0625px): analytic edge-distance is WRONG twice —
 *          decoration rings inside a shape (the staff pommel, mace boss, vis
 *          highlights) are not union boundary, and polygon junctions merge.
 *   POKE = max over covering circles of r - S(centre) - 1.5, S = signed
 *          distance to the undilated union. A poking circle fires hits across
 *          a visible gap (seed-63230 K.O. frame, 2026-10-19). Gate: <= 0.12px
 *          (raster quantisation budget).
 *   MISS = deepest ink point outside every circle — visible contact that
 *          fires nothing (whiff). House compromise: the covering targets the
 *          polys dilated by MARGIN=1.2px, so the outer 0.3px ink band stays
 *          uncovered/disclosed (cover-era doctrine, 2026-10-16); tapered tips
 *          and paint thinner than 2*RMIN also whiff (regen prints the depth).
 *          Gate: <= MISS_TOL, a regression lock at the 2026-10-19 regen level
 *          (was up to 13.1px on the shipped coverings).
 *
 * Consumers covered: bladeVsBody hits and parry triggers both read
 * bladeCircles (these circles); the victim disc ink (bodyR + 2px stroke) is a
 * superset of its bodyR hitbox, so circles-inside-ink => no event before
 * visible contact. Projectile inks are the renderer's job (drawShot halos,
 * 2026-10-19) — not gated here.
 *
 * Usage:
 *   node .qa/inscribe.mjs            audit the file; exit 1 on violation
 *   node .qa/inscribe.mjs --regen    print the CIRCLES_V2 constant body
 *       (WORLD px — applied after the weaponScale boot loop; generated from
 *       the same booted poly data the audit reads).
 *       !! WHOLE-BLOCK RE-DERIVATION ONLY — NOT A SPLICE SOURCE !!
 *       Lesson of the orb-r14 incident (2026-10-27): a whole-block regen
 *       re-bakes EVERY row with this tool's chain handling, which differs
 *       from the landing-era row-splice bakes — pasting it after a PARTIAL
 *       art edit silently re-bakes untouched weapons (crossbow, boomerang
 *       and both chain rows moved once before the catch). For partial art
 *       edits use the row-splice baker, which keeps every unnamed row
 *       byte-identical:
 *           node .qa/bake-rows.mjs <file> <id,id,...>
 *       then run this gate. Reserve --regen for whole-fleet re-derivation
 *       (bake-parameter changes), and diff the rows against the stored
 *       block before pasting anything. New/edited weapon => bake-rows that
 *       row, gate, audit.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const REGEN = args[0] === '--regen';
if (REGEN) args.shift();
const FILE = resolve(join(here, '..', args[0] || 'previews/spinclash-preview.html'));   // default follows the workspace layout (canonical in previews/); an explicit arg still resolves from the repo root, so .qa/bake-rows.mjs's 'scratch/.bake-temp.html' is unchanged
const html = readFileSync(FILE, 'utf8');

/* ---------- boot the sim block with DOM stubs (house pattern) ---------- */
function fakeEl() {
  const t = function () {};
  return new Proxy(t, {
    get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl(); return x[p]; },
    set(x, p, v) { x[p] = v; return true; },
    apply() { return fakeEl(); },
  });
}
const a0 = html.indexOf('<script>'), b0 = html.indexOf('</script>', a0);
const opener = '(function () {';
let body = html.slice(a0 + 8, b0);
body = body.slice(body.indexOf(opener) + opener.length);
body = body.slice(0, body.lastIndexOf('})();'));
const api = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
  body + '\n;return { WEAPONS, WEAPON_IDS, CFG };')(
  { getElementById: () => fakeEl(), createElement: () => fakeEl(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
  { now: () => 0 }, () => 0, console);
const { WEAPONS, WEAPON_IDS, CFG } = api;

const STROKE = 1.5;      // world-px ink half-stroke (drawWeapon lineWidth 3)
const MARGIN = 1.2;      // world-px: covering targets polys(+1.2); outer 0.3px band disclosed uncovered
const RMIN = 2.0;        // world-px floor on regenerated circle radii — MINR sizes the parry substep budget (2.0 keeps worst-case pairs at the INGR weapons' current cost)
const RMIN_BY_W = { scythe: 1.8, scroll: 1.6, axe: 1.8 };   // + scroll 2026-10-25 (roster-r12 bake): the return-1 ribbon tail is ~3u wide — at floor 2.0 the greedy cover leaves 4.89px miss (gate FAIL); at 1.6 the tail covers inside tolerance. Audit thresholds untouched; MINR cost: scroll-pair substep k rises (law 5s audits k at the next sanctioned measure run) — disclosed, scythe precedent.  // per-weapon floor override (2026-10-22, batch-4 bake): the scythe beak is a ~25° wedge — at floor 2.0 its natural r≈1.9 tip circle is rejected and the tip whiffs 5.23px (gate FAIL); at 1.8 it fits → miss 2.57px, minR 1.9 ≈ the crossbow's owner-accepted 1.96, +1 circle, ≤+5% substep k on scythe pairs (law 5s audits k either way). Recorded in the GAMES.md batch-4 entry; audit thresholds untouched.
const POKE_TOL = 0.12;   // world px (raster quantisation budget)
const MISS_TOL = 4.6;    // world px — regression lock at the 2026-10-19 regen level (worst 4.3-ish: tapered tips +
                         // thin paint narrower than 2*RMIN + the disclosed 0.3px band; was up to 13.1px before)
const RES = 0.0625;      // raster resolution, world px
const PAD = 4;           // raster padding beyond the poly bbox, world px

/* ---------- raster + exact EDT signed distance to the poly union ---------- */
function edt1d(f, n, out) {
  // Felzenszwalb squared-distance transform of a 1-D sampled function
  const v = new Int32Array(n), z = new Float64Array(n + 1);
  let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const dq = q - v[k];
    out[q] = dq * dq + f[v[k]];
  }
}
function makeInk(poly) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const pl of poly.polys) for (const pts of pl.subs) for (const q of pts) {
    x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]);
  }
  x0 -= PAD; y0 -= PAD; x1 += PAD; y1 += PAD;
  const W = Math.ceil((x1 - x0) / RES), H = Math.ceil((y1 - y0) / RES);
  const inside = new Uint8Array(W * H);
  // scanline even-odd per poly, union across polys
  const xs = [];
  for (let iy = 0; iy < H; iy++) {
    const y = y0 + (iy + 0.5) * RES;
    let lo = W, hi = -1;
    for (const pl of poly.polys) {
      xs.length = 0;
      for (const pts of pl.subs) {
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const ya = pts[i][1], yb = pts[j][1];
          if ((ya > y) !== (yb > y)) xs.push(pts[i][0] + (pts[j][0] - pts[i][0]) * (y - ya) / (yb - ya));
        }
      }
      if (!xs.length) continue;
      xs.sort((p, q) => p - q);
      for (let s = 0; s + 1 < xs.length; s += 2) {           // even-odd spans of THIS poly
        const ia = Math.max(0, Math.ceil((xs[s] - x0) / RES - 0.5)), ib = Math.min(W - 1, Math.floor((xs[s + 1] - x0) / RES - 0.5));
        for (let ix = ia; ix <= ib; ix++) inside[iy * W + ix] = 1;
        if (ia < lo) lo = ia; if (ib > hi) hi = ib;
      }
    }
    void lo; void hi;
  }
  const INF = 1e18;
  const dIn = new Float64Array(W * H), dOut = new Float64Array(W * H);   // sq-dist to nearest outside / inside cell
  {
    const f = new Float64Array(Math.max(W, H)), o = new Float64Array(Math.max(W, H));
    for (let pass = 0; pass < 2; pass++) {                 // 0: seeds = outside cells; 1: seeds = inside cells
      const dst = pass === 0 ? dIn : dOut;
      for (let ix = 0; ix < W; ix++) {
        for (let iy = 0; iy < H; iy++) { const on = inside[iy * W + ix] === 1; f[iy] = (pass === 0 ? !on : on) ? 0 : INF; }
        edt1d(f, H, o);
        for (let iy = 0; iy < H; iy++) dst[iy * W + ix] = o[iy];
      }
      for (let iy = 0; iy < H; iy++) {
        for (let ix = 0; ix < W; ix++) f[ix] = dst[iy * W + ix];
        edt1d(f, W, o);
        for (let ix = 0; ix < W; ix++) dst[iy * W + ix] = o[ix];
      }
    }
  }
  const cell = (x, y) => {
    const ix = Math.floor((x - x0) / RES), iy = Math.floor((y - y0) / RES);
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) return null;
    return iy * W + ix;
  };
  // conservative S: min over the 4 cells touching the point (never overstates inscribed radius)
  function S(x, y) {
    const fx = (x - x0) / RES, fy = (y - y0) / RES;
    const ix = Math.floor(fx), iy = Math.floor(fy);
    let best = -Infinity;
    for (let dy = 0; dy <= 1; dy++) {
      for (let dx = 0; dx <= 1; dx++) {
        const jx = ix + dx, jy = iy + dy;
        if (jx < 0 || jy < 0 || jx >= W || jy >= H) continue;
        const i = jy * W + jx;
        const s = inside[i] ? Math.sqrt(dIn[i]) * RES : -Math.sqrt(dOut[i]) * RES;
        if (best === -Infinity || s < best) best = s;
      }
    }
    return best === -Infinity ? -Infinity : best;
  }
  return { S, box: [x0, y0, x1, y1], W, H, inside, cell };
}

/* ---------- audit ---------- */
function audit(id) {
  const P = WEAPONS[id].poly;
  const ink = makeInk(P);
  let worstPoke = -Infinity, wpC = null, minR = Infinity;
  for (const c of P.circles) {
    minR = Math.min(minR, c.r);
    const poke = c.r - (ink.S(c.d, c.l) + STROKE);
    if (poke > worstPoke) { worstPoke = poke; wpC = c; }
  }
  // miss: deepest ink point (S >= -STROKE) outside every circle; cell-centre scan + local refine
  const [x0, y0, x1, y1] = ink.box;
  let worstMiss = 0, wmP = null;
  const hot = [];
  const GS = 0.5;
  for (let x = x0; x <= x1; x += GS) {
    for (let y = y0; y <= y1; y += GS) {
      if (ink.S(x, y) < -STROKE) continue;
      let u = Infinity;
      for (const c of P.circles) u = Math.min(u, Math.hypot(x - c.d, y - c.l) - c.r);
      if (u > worstMiss) { worstMiss = u; wmP = [x, y]; }
      if (u > 0.1) hot.push([u, x, y]);
    }
  }
  hot.sort((p, q) => q[0] - p[0]);
  for (const [, cx, cy] of hot.slice(0, 30)) {
    for (let x = cx - GS; x <= cx + GS; x += RES) {
      for (let y = cy - GS; y <= cy + GS; y += RES) {
        if (ink.S(x, y) < -STROKE) continue;
        let u = Infinity;
        for (const c of P.circles) u = Math.min(u, Math.hypot(x - c.d, y - c.l) - c.r);
        if (u > worstMiss) { worstMiss = u; wmP = [x, y]; }
      }
    }
  }
  return { id, n: P.circles.length, minR, worstPoke, wpC, worstMiss, wmP };
}

/* ---------- regenerator: union-inscribed greedy cover in WORLD px ----------
 * The house algorithm (ingest.mjs's "greedy maximal-inscribed covering",
 * 2026-10-16) rebuilt on the raster-EDT union SDF: repeatedly place the
 * LARGEST circle whose centre is not yet covered, mark every target sample
 * inside its full radius, prune circles no sample depends on. Margin 1.2
 * world px => poke -0.3 by construction; RMIN floors the radii so MINR (the
 * parry substep budget driver) stays >= 2.0. Interstices between tangent
 * circles and paint thinner than 2*RMIN stay uncovered — the audit's MISS
 * metric reports the depth (disclosed whiff zones: tips/thin paint). */
function regen(id) {
  const rminW = RMIN_BY_W[id] || RMIN;
  const P = WEAPONS[id].poly;
  const ink = makeInk(P);
  const [x0, y0, x1, y1] = ink.box;
  const SR = 0.45, B = 1.5;
  // target samples: polys (+MARGIN) — the region circles must cover
  const samples = [];
  const sIndex = new Map();
  const bkey = (x, y) => (Math.floor(x / B) + 512) * 4096 + (Math.floor(y / B) + 512);
  for (let x = x0; x <= x1; x += SR) {
    for (let y = y0; y <= y1; y += SR) {
      if (ink.S(x, y) < -MARGIN) continue;
      const si = samples.length; samples.push([x, y, false]);
      const k = bkey(x, y); let arr = sIndex.get(k); if (!arr) sIndex.set(k, arr = []); arr.push(si);
    }
  }
  // candidates: r = S + MARGIN floored to 0.1 (never pokes: poke <= -0.3 + quantisation).
  // Seeds on a coarse grid, then hill-climbed onto the local S maximum (medial axis):
  // thin paint (vis strips, strings, guards) is a viable corridor narrower than the
  // seed spacing — without the climb those features get zero circles.
  const byKey = new Map();
  const addCand = (px, py) => {
    let x = px, y = py;
    for (let it = 0; it < 14; it++) {                       // hill-climb S in 0.15px steps
      const s0 = ink.S(x, y);
      let bx = x, by = y, bs = s0;
      for (const [ox, oy] of [[0.15, 0], [-0.15, 0], [0, 0.15], [0, -0.15], [0.1, 0.1], [-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1]]) {
        const s = ink.S(x + ox, y + oy);
        if (s > bs) { bs = s; bx = x + ox; by = y + oy; }
      }
      if (bx === x && by === y) break;
      x = bx; y = by;
    }
    const r0 = ink.S(x, y) + MARGIN;
    if (r0 < rminW) return;
    const cx = Math.round(x * 10) / 10, cy = Math.round(y * 10) / 10;
    const r = Math.floor(Math.min(r0, ink.S(cx, cy) + MARGIN) * 10) / 10;
    if (r < rminW) return;
    const k = (cx + 512) * 4096 + (cy + 512);
    const o = byKey.get(k); if (!o || o.r < r) byKey.set(k, { d: cx, l: cy, r, dead: false });
  };
  for (let x = x0 + RES; x <= x1; x += 0.9) {
    for (let y = y0 + RES; y <= y1; y += 0.9) {
      if (ink.S(x, y) < -MARGIN + 0.3) continue;            // seeds only near/inside the target
      addCand(x, y);
    }
  }
  const list = [...byKey.values()];
  const markCovered = (c) => {
    const rr = c.r + 1e-9;
    for (let bx = Math.floor((c.d - rr) / B); bx <= Math.floor((c.d + rr) / B); bx++) {
      for (let by = Math.floor((c.l - rr) / B); by <= Math.floor((c.l + rr) / B); by++) {
        const arr = sIndex.get((bx + 512) * 4096 + (by + 512)); if (!arr) continue;
        for (const si of arr) { const s = samples[si]; if (!s[2] && Math.hypot(s[0] - c.d, s[1] - c.l) <= rr) s[2] = true; }
      }
    }
  };
  // greedy maximal-inscribed covering (ingest.mjs pattern)
  const chosen = [];
  for (;;) {
    let best = null;
    for (const c of list) {
      if (c.dead) continue;
      if (!best || c.r > best.r) best = c;
      if (best.r >= 999) break;
    }
    if (!best) break;
    best.dead = true;
    chosen.push(best);
    markCovered(best);
    // retire candidates whose centre is now covered (they can only shrink)
    for (const c of list) {
      if (c.dead) continue;
      if (Math.hypot(c.d - best.d, c.l - best.l) <= best.r) c.dead = true;
    }
  }
  // prune: drop circles no sample depends on
  const covers = (c, x, y) => Math.hypot(x - c.d, y - c.l) <= c.r + 1e-9;
  for (let i = chosen.length - 1; i >= 0; i--) {
    const c = chosen[i];
    let needed = false;
    for (const s of samples) {
      if (!covers(c, s[0], s[1])) continue;
      let other = false;
      for (let j = 0; j < chosen.length; j++) { if (j !== i && covers(chosen[j], s[0], s[1])) { other = true; break; } }
      if (!other) { needed = true; break; }
    }
    if (!needed) chosen.splice(i, 1);
  }
  let miss = 0;
  for (const s of samples) {
    if (s[2]) continue;
    let u = Infinity;
    for (const c of chosen) u = Math.min(u, Math.hypot(s[0] - c.d, s[1] - c.l) - c.r);
    if (u > miss) miss = u;
  }
  chosen.sort((p, q) => q.r - p.r || p.d - q.d || p.l - q.l);
  console.error(`regen ${id}: ${chosen.length} circles, minR ${Math.min(...chosen.map(c => c.r)).toFixed(1)}, leftover miss ${miss.toFixed(2)}px`);
  return chosen;
}

/* ---------- dispatch ---------- */
if (!REGEN) {
  console.log(`inscription gate (raster EDT ${RES}px) — ink = polys(even-odd) (+${STROKE}px stroke); poke <= ${POKE_TOL}px, ink miss <= ${MISS_TOL}px, covering margin ${MARGIN}px, RMIN ${RMIN}`);
  let fail = 0;
  for (const id of WEAPON_IDS) {
    const r = audit(id);
    const bad = !(r.worstPoke <= POKE_TOL) || !(r.worstMiss <= MISS_TOL);
    if (bad) fail = 1;
    console.log(
      `${r.id.padEnd(10)} n=${String(r.n).padStart(3)} minR=${r.minR.toFixed(2).padStart(5)}  poke=${r.worstPoke >= 0 ? '+' : ''}${r.worstPoke.toFixed(2)}px${r.worstPoke > POKE_TOL ? '  POKE-FAIL ' + JSON.stringify({ d: +r.wpC.d.toFixed(1), l: +r.wpC.l.toFixed(1), r: +r.wpC.r.toFixed(1) }) : ''}  miss=${r.worstMiss.toFixed(2)}px${r.worstMiss > MISS_TOL ? '  MISS-FAIL @' + r.wmP.map(v => +v.toFixed(1)).join(',') : ''}` + (bad ? '   <-- FAIL' : ''),
    );
  }
  /* ---------- chain-tie + bent-pose audit (2026-10-22, owner bug seed 52071) ----------
   * Boot tie v2 binds each covering circle to the chain segment whose OUTER ink
   * contains the circle centre (innermost segment first = paint order), nearest-
   * ink fallback, loud boot throw beyond 6px. This audit RE-DERIVES the tie
   * independently and then checks the invariant the owner saw broken: at forced
   * BENT poses every circle centre must land on its tied segment's transformed
   * ink — hitbox (and gold debug dots) ride the drawn chain, never a phantom
   * straight line. v1 history: whole-circle solid-ink containment tied 46/49
   * flail circles to segment 0; 27/49 dots floated off the chain when bent.
   */
  for (const id of WEAPON_IDS) {
    const W = WEAPONS[id];
    if (!W.chain || !W.poly || !W.poly.circles || !W.poly.circles.length) continue;
    const ch = W.chain, NS = ch.segs.length;
    const ringArea = pts => { let s = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) s += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]; return Math.abs(s) / 2; };
    const segOuter = ch.segs.map(([a, b]) => { const s = []; for (let i = a; i <= b; i++) { let best = null; for (const ring of W.poly.polys[i].subs) if (!best || ringArea(ring) > ringArea(best)) best = ring; if (best) s.push(best); } return s; });
    const inPoly = (pts, x, y) => { let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const yi = pts[i][1], yj = pts[j][1]; if ((yi > y) !== (yj > y) && x < (pts[j][0] - pts[i][0]) * (y - yi) / (yj - yi) + pts[i][0]) ins = !ins; } return ins; };
    const toWorld = (f, d, l) => ({ x: f.x + f.cos * d - f.sin * l, y: f.y + f.sin * d + f.cos * l });
    const frames = us => { const fr = []; let ang = Math.PI / 2, px = 0, py = 0; for (let k = 0; k < us.length; k++) { const u = us[k]; ang = u == null ? ang : Math.atan2(u.y, u.x); fr.push({ cos: Math.cos(ang), sin: Math.sin(ang), x: px, y: py }); px += Math.cos(ang) * ch.dj[k]; py += Math.sin(ang) * ch.dj[k]; } return fr; };
    const D2R = Math.PI / 180, uv = a => ({ x: Math.cos(a * D2R), y: Math.sin(a * D2R) });
    const bendA = [60, 150, 30, 120, 210, 330], zigA = [200, 340, 120, 260, 20, 300];
    const poses = { straight: new Array(NS).fill(null), bend: bendA.slice(0, NS - 1).map(a => uv(a)).concat([null]), zigzag: zigA.slice(0, NS - 1).map(a => uv(a)).concat([null]) };
    let bad = 0; const tally = new Array(NS).fill(0);
    for (const c of W.poly.circles) {
      if (!Number.isInteger(c.s) || c.s < 0 || c.s >= NS) { bad++; continue; }
      tally[c.s]++;
      let k = -1;
      for (let s = NS - 1; s >= 0; s--) if (segOuter[s].some(pp => inPoly(pp, c.d, c.l))) { k = s; break; }
      if (k >= 0) { if (k !== c.s) bad++; }
      else {
        let best = Infinity;
        for (let s = 0; s < NS; s++) for (const pts of segOuter[s]) for (let i = 0; i < pts.length; i++) { const A = pts[i], B = pts[(i + 1) % pts.length]; const dx = B[0] - A[0], dy = B[1] - A[1], L = dx * dx + dy * dy; let t = L ? ((c.d - A[0]) * dx + (c.l - A[1]) * dy) / L : 0; t = Math.max(0, Math.min(1, t)); best = Math.min(best, Math.hypot(c.d - (A[0] + dx * t), c.l - (A[1] + dy * t))); }
        if (best > 6) bad++;
      }
    }
    const offByPose = {};
    for (const [name, us] of Object.entries(poses)) {
      const fr = frames(us);
      const segInkW = segOuter.map((rings, k) => rings.map(pts => pts.map(pt => { const w = toWorld(fr[k], pt[0], pt[1]); return [w.x, w.y]; })));
      let off = 0;
      for (const c of W.poly.circles) { const w = toWorld(fr[c.s], c.d, c.l); if (!segInkW[c.s].some(pts => inPoly(pts, w.x, w.y))) off++; }
      offByPose[name] = off; if (off) bad++;
    }
    console.log(`${id.padEnd(10)} chain tie: segs ${tally.join('/')}, worst-fallback ${(W.chainTie ? W.chainTie.worst : -1)}px | bent-pose dots-off-ink: ${Object.entries(offByPose).map(([k2, v]) => `${k2} ${v}/${W.poly.circles.length}`).join(', ')}` + (bad ? '   <-- FAIL' : ''));
    if (bad) fail = 1;
  }
  console.log(fail ? 'GATE: FAIL' : 'GATE: PASS — every covering circle is inscribed in its drawn ink (no event can fire across a visible gap); misses stay inside the disclosed band (0.3px ink edge + tapered tips)');
  process.exit(fail);
} else {
  console.log('/* CIRCLES_V2 — regenerated by .qa/inscribe.mjs --regen (WORLD px, post-weaponScale). WHOLE-BLOCK: splice partial edits with .qa/bake-rows.mjs instead. */');
  console.log('const CIRCLES_V2 = {');
  for (const id of WEAPON_IDS) {
    const circles = regen(id);
    const arr = circles.map(c => `{"d":${c.d},"l":${c.l},"r":${c.r}}`).join(',');
    console.log(`${id}: [${arr}],`);
  }
  console.log('};');
}
