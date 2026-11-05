/* ingest.mjs — the weapon merge gate (v0.8-step1, reframed 2026-10-18)
 *
 * Born as the owner-paste path; the owner has since closed the external taps
 * and made the assistant the sole weapon supplier (owner decision
 * 2026-10-18: consistency of style across the roster). The gate's job did
 * not change: NO weapon SVG enters spinclash-preview.html — authored or
 * found — until validation passes and a headless combat gauntlet (termination
 * + contact laws 1/2/3 of the candidate against every roster member) is
 * green on a temp copy. Supplier art gets no privilege; that is the point.
 *
 * Usage:
 *   node ingest.mjs <file.svg> [--len N] [--id name] [--name Name]
 *                    [--into previews/spinclash-preview.html] [--seeds N]
 * Without --into: dry run (validate + cover + report, no gauntlet, no merge).
 *
 * What the model can own (disclosed on every report):
 *   - one connected solid silhouette (or a persistent two-strand open design,
 *     the bow class); concave mouths narrower than any blade circle are
 *     filled in the COLLISION solid while the drawing keeps them — every
 *     incursion into such a cavity visually contacts both lips;
 *   - the drawn polygons are verbatim; the covering circles packed inside
 *     them are the hitbox; uncovered sliver depth epsilon is reported;
 *   - crossed long blades reach a translation-only fixed point ~10px deep;
 *     the v0.8-step1 bound of "<=6px for <=2 ticks" was FALSIFIED 2026-10-28
 *     (20.754px flail+scythe, 14.673px crossbow+katana, both visible). See
 *     measure.mjs --band-dump and the GAMES.md entry of that date.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
mkdirSync('.qa', { recursive: true });

const argv = process.argv.slice(2);
const flags = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) flags[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
const SRC = argv[0] && !argv[0].startsWith('--') ? argv[0] : null;
if (!SRC) { console.error('usage: node ingest.mjs <file.svg|-> [--len N] [--id name] [--name Name] [--into preview.html] [--seeds N]'); process.exit(2); }
const LEN = +(flags.len || 96);
const SEEDS = +(flags.seeds || 4);
const raw = SRC === '-' ? readFileSync(0, 'utf8') : readFileSync(SRC, 'utf8');

const say = (s) => console.log(s);
const die = (why) => { say('REJECT: ' + why); process.exit(1); };

/* ---------------- safety validation ---------------- */
if (/<script/i.test(raw)) die('contains <script> — previews and the game never execute uploaded code');
if (/\son\w+\s*=/.test(raw)) die('contains event handlers');
if (/<(image|foreignObject|animate\w*|video|audio)\b/i.test(raw)) die('contains external/animated content — weapons are static vector solids');
if (/href\s*=\s*["'](https?:)?\/\//i.test(raw)) die('references external resources — the tool is offline by rule');

/* ---------------- parse (single source of SVG truth) ---------------- */
const ST = 2;   // raster step in svg units, refined below
function attrs(tag) { const o = {}; const re = /([\w:-]+)\s*=\s*"([^"]*)"/g; let m; while ((m = re.exec(tag))) o[m[1]] = m[2]; return o; }
function parseTransform(t) {
  let M = [1, 0, 0, 1, 0, 0];
  if (!t) return M;
  const mul = (p, q) => [p[0]*q[0]+p[2]*q[1], p[1]*q[0]+p[3]*q[1], p[0]*q[2]+p[2]*q[3], p[1]*q[2]+p[3]*q[3], p[0]*q[4]+p[2]*q[5]+p[4], p[1]*q[4]+p[3]*q[5]+p[5]];
  const re = /(matrix|translate|scale|rotate)\s*\(([^)]*)\)/g; let m;
  while ((m = re.exec(t))) {
    const n = (m[2].match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
    let Q = [1,0,0,1,0,0];
    if (m[1] === 'matrix') Q = n;
    else if (m[1] === 'translate') Q = [1,0,0,1,n[0]||0,n[1]||0];
    else if (m[1] === 'scale') Q = [n[0],0,0,n[1]===undefined?n[0]:n[1],0,0];
    else if (m[1] === 'rotate') { const r = n[0]*Math.PI/180, c = Math.cos(r), s = Math.sin(r); Q = [c,s,-s,c,0,0];
      if (n.length >= 3) Q = mul([1,0,0,1,n[1],n[2]], mul(Q, [1,0,0,1,-n[1],-n[2]])); }
    M = mul(M, Q);
  }
  return M;
}
const xf = (M, x, y) => [M[0]*x+M[2]*y+M[4], M[1]*x+M[3]*y+M[5]];
function pathPolys(d) {
  const toks = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  const out = []; let cur = [], i = 0, cx = 0, cy = 0, px = 0, py = 0, pcmd = '';
  const num = () => Number(toks[i++]);
  const push = (x, y) => cur.push([x, y]);
  const line = (x1,y1,x2,y2) => { for (let s=1;s<=8;s++) push(x1+(x2-x1)*s/8, y1+(y2-y1)*s/8); };
  const cubic = (x1,y1,c1x,c1y,c2x,c2y,x2,y2) => { for (let s=1;s<=24;s++){const t=s/24,u=1-t; push(u*u*u*x1+3*u*u*t*c1x+3*u*t*t*c2x+t*t*t*x2, u*u*u*y1+3*u*u*t*c1y+3*u*t*t*c2y+t*t*t*y2);} };
  const quad = (x1,y1,qx,qy,x2,y2) => { for (let s=1;s<=16;s++){const t=s/16,u=1-t; push(u*u*x1+2*u*t*qx+t*t*x2, u*u*y1+2*u*t*qy+t*t*y2);} };
  const arc = (x1,y1,rx,ry,rot,laf,sf,x2,y2) => {
    if (!rx || !ry) { line(x1,y1,x2,y2); return; }
    const p = rot*Math.PI/180, cp = Math.cos(p), sp = Math.sin(p);
    const dx = (x1-x2)/2, dy = (y1-y2)/2;
    const x1p = cp*dx+sp*dy, y1p = -sp*dx+cp*dy;
    let rxs = rx*rx, rys = ry*ry;
    const lam = (x1p*x1p)/rxs+(y1p*y1p)/rys;
    if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); rxs = rx*rx; rys = ry*ry; }
    const num = rxs*rys-rxs*y1p*y1p-rys*x1p*x1p, den = rxs*y1p*y1p+rys*x1p*x1p;
    const co = num <= 0 ? 0 : Math.sqrt(num/den)*(laf === sf ? -1 : 1);
    const cxp = co*rx*y1p/ry, cyp = -co*ry*x1p/rx;
    const cx0 = cp*cxp-sp*cyp+(x1+x2)/2, cy0 = sp*cxp+cp*cyp+(y1+y2)/2;
    const ang = (ux,uy,vx,vy) => { const dot = ux*vx+uy*vy, len = Math.hypot(ux,uy)*Math.hypot(vx,vy); let a = Math.acos(Math.max(-1,Math.min(1,dot/len))); if (ux*vy-uy*vx < 0) a = -a; return a; };
    const th1 = ang(1,0,(x1p-cxp)/rx,(y1p-cyp)/ry);
    let dth = ang((x1p-cxp)/rx,(y1p-cyp)/ry,(-x1p-cxp)/rx,(-y1p-cyp)/ry);
    if (!sf && dth > 0) dth -= 2*Math.PI;
    if (sf && dth < 0) dth += 2*Math.PI;
    for (let s2 = 1; s2 <= 24; s2++) { const th = th1+dth*s2/24; const X = rx*Math.cos(th), Y = ry*Math.sin(th); push(cp*X-sp*Y+cx0, sp*X+cp*Y+cy0); }
  };
  while (i < toks.length) {
    const cmd = toks[i++]; const C = cmd.toUpperCase(), rel = cmd !== C;
    if (C === 'Z') { if (cur.length) { out.push(cur); cur = []; } pcmd = 'Z'; continue; }
    if (C === 'M') { let x = num(), y = num(); if (rel) { x += cx; y += cy; } if (cur.length) out.push(cur); cur = [[x,y]]; cx = x; cy = y; pcmd = 'M'; continue; }
    if (C === 'L' || C === 'H' || C === 'V') {
      let x = cx, y = cy;
      if (C === 'H') x = num()+(rel?cx:0); else if (C === 'V') y = num()+(rel?cy:0);
      else { x = num(); y = num(); if (rel) { x += cx; y += cy; } }
      line(cx,cy,x,y); cx = x; cy = y; pcmd = C; continue;
    }
    if (C === 'C' || C === 'S') {
      let c1x, c1y;
      if (C === 'S' && /[CS]/.test(pcmd)) { c1x = 2*cx-px; c1y = 2*cy-py; } else if (C === 'S') { c1x = cx; c1y = cy; }
      else { c1x = num(); c1y = num(); if (rel) { c1x += cx; c1y += cy; } }
      let c2x = num(), c2y = num(); if (rel) { c2x += cx; c2y += cy; }
      let x = num(), y = num(); if (rel) { x += cx; y += cy; }
      cubic(cx,cy,c1x,c1y,c2x,c2y,x,y); px = c2x; py = c2y; cx = x; cy = y; pcmd = C; continue;
    }
    if (C === 'Q' || C === 'T') {
      let qx, qy;
      if (C === 'T' && /[QT]/.test(pcmd)) { qx = 2*cx-px; qy = 2*cy-py; } else if (C === 'T') { qx = cx; qy = cy; }
      else { qx = num(); qy = num(); if (rel) { qx += cx; qy += cy; } }
      let x = num(), y = num(); if (rel) { x += cx; y += cy; }
      quad(cx,cy,qx,qy,x,y); px = qx; py = cy = y; py = qy; cx = x; cy = y; pcmd = C; continue;
    }
    if (C === 'A') { const rx = num(), ry = num(), rot = num(), laf = num(), sf = num(); let x = num(), y = num(); if (rel) { x += cx; y += cy; } arc(cx,cy,rx,ry,rot,laf,sf,x,y); cx = x; cy = y; pcmd = C; continue; }
  }
  if (cur.length) out.push(cur);
  return out;
}
function pip(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length-1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if ((yi > y) !== (yj > y) && x < (xj-xi)*(y-yi)/(yj-yi)+xi) inside = !inside;
  }
  return inside;
}
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx-ax, dy = by-ay, L = dx*dx+dy*dy;
  let t = L ? ((px-ax)*dx+(py-ay)*dy)/L : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px-(ax+dx*t), py-(ay+dy*t));
}
function covers(sh, x, y) {
  if (x < sh.bb[0] || x > sh.bb[2] || y < sh.bb[1] || y > sh.bb[3]) return false;
  if (sh.type === 'poly') {
    let inside = false;
    for (const pts of sh.subs) if (pip(pts, x, y)) inside = !inside;   // even-odd: holes stay holes
    return inside;
  }
  for (let i = 0; i < sh.pts.length-1; i++) if (distSeg(x, y, sh.pts[i][0], sh.pts[i][1], sh.pts[i+1][0], sh.pts[i+1][1]) <= sh.r) return true;
  return false;
}
function bbox(pts, pad) {
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  for (const p of pts) { x0=Math.min(x0,p[0]); y0=Math.min(y0,p[1]); x1=Math.max(x1,p[0]); y1=Math.max(y1,p[1]); }
  return [x0-pad,y0-pad,x1+pad,y1+pad];
}
let src = raw.replace(/<metadata[\s\S]*?(?:<\/metadata>|\/>)/, '').replace(/<!--[\s\S]*?-->/g, '');
const styles = {};
const sm = src.match(/<style>([\s\S]*?)<\/style>/);
if (sm) for (const m of sm[1].matchAll(/\.([\w-]+)\s*\{([^}]*)\}/g)) {
  const fill = m[2].match(/fill:\s*(#[0-9a-f]{3,8}|none)/i);
  const stroke = m[2].match(/stroke:\s*(#[0-9a-f]{3,8}|none)/i);
  const sw = m[2].match(/stroke-width:\s*([\d.]+)/);
  styles[m[1]] = { fill: fill?fill[1]:null, stroke: stroke?stroke[1]:null, sw: sw?+sw[1]:0 };
}
const defs = {};
const dm = src.match(/<defs>([\s\S]*?)<\/defs>/);
const defSrc = dm ? dm[1] : '';
{ let i = 0;
  while (i < defSrc.length) {
    const lt = defSrc.indexOf('<', i); if (lt < 0) break;
    const gt = defSrc.indexOf('>', lt); const tag = defSrc.slice(lt, gt+1);
    const mm = tag.match(/^<(\w+)/); if (!mm) { i = gt+1; continue; }
    const name = mm[1]; const selfClose = tag.endsWith('/>');
    let inner = '';
    if (!selfClose) { const close = defSrc.indexOf('</'+name+'>', gt);
      if (close < 0) { inner = defSrc.slice(gt+1); i = defSrc.length; } else { inner = defSrc.slice(gt+1, close); i = close+name.length+3; } }
    else i = gt+1;
    const a = attrs(tag); if (a.id) defs[a.id] = { name, a, inner };
  } }
const body = src.replace(/<defs>[\s\S]*?<\/defs>/, '').replace(/<style>[\s\S]*?<\/style>/, '');
const vbm = body.match(/viewBox\s*=\s*"([^"]+)"/);
let vb;
if (vbm) vb = vbm[1].split(/\s+/).map(Number);
else {
  const wm = body.match(/width\s*=\s*"([\d.]+)"/), hm = body.match(/height\s*=\s*"([\d.]+)"/);
  vb = [0, 0, wm ? +wm[1] : 400, hm ? +hm[1] : 400];
}
const shapes = [];
const notes = [];
function shapeFromTag(name, a, M, inh) {
  const cls = (a.class || '').split(/\s+/).filter(Boolean);
  let fill = a.fill || inh.fill || null, stroke = a.stroke || inh.stroke || null, sw = a['stroke-width'] ? +a['stroke-width'] : (inh.sw || 0);
  let op = a.opacity !== undefined ? +a.opacity : 1;
  for (const c of cls) { const st = styles[c]; if (!st) continue; if (!a.fill && st.fill) fill = st.fill; if (!a.stroke && st.stroke) { stroke = st.stroke; sw = sw || st.sw; } }
  if (op < 1 && fill && fill !== 'none') notes.push('opacity ' + op + ' flattened to solid on a ' + fill + ' shape');
  const addPoly = (subs, f) => {
    const S = subs.map(pts => pts.map(p => xf(M, p[0], p[1]))).filter(pts => pts.length >= 3);
    if (!S.length) return;
    const all = S.flat();
    shapes.push({ type: 'poly', kind: 'fill', subs: S, pts: all, bb: bbox(all, 0), mat: f });
  };
  const addStroke = (pts, r, f) => { if (pts.length < 2) return; const P = pts.map(p => xf(M, p[0], p[1])); shapes.push({ type: 'stroke', kind: 'stroke', pts: P, r, bb: bbox(P, r), mat: f }); };
  let polys = [];
  if (name === 'rect') {
    const x = +a.x||0, y = +a.y||0, w = +a.width||0, h = +a.height||0, rx = Math.min(+(a.rx||0), w/2, h/2);
    if (rx > 0) {
      const pts = [];
      const corner = (cx, cy, a0) => { for (let k = 0; k <= 6; k++) { const t = a0 + k/6*Math.PI/2; pts.push([cx+rx*Math.cos(t), cy+rx*Math.sin(t)]); } };
      pts.push([x+rx, y]); pts.push([x+w-rx, y]); corner(x+w-rx, y+rx, -Math.PI/2);
      pts.push([x+w, y+h-rx]); corner(x+w-rx, y+h-rx, 0);
      pts.push([x+rx, y+h]); corner(x+rx, y+h-rx, Math.PI/2);
      pts.push([x, y+rx]); corner(x+rx, y+rx, Math.PI);
      polys = [pts];
    } else polys = [[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]];
  }
  else if (name === 'circle') { const cx = +a.cx||0, cy = +a.cy||0, r = +a.r||0; const pts = []; for (let k = 0; k < 48; k++) pts.push([cx+r*Math.cos(k/48*2*Math.PI), cy+r*Math.sin(k/48*2*Math.PI)]); polys = [pts]; }
  else if (name === 'ellipse') { const cx = +a.cx||0, cy = +a.cy||0, rx = +a.rx||0, ry = +a.ry||0; const pts = []; for (let k = 0; k < 48; k++) pts.push([cx+rx*Math.cos(k/48*2*Math.PI), cy+ry*Math.sin(k/48*2*Math.PI)]); polys = [pts]; }
  else if (name === 'polygon' || name === 'polyline') { const n = (a.points.match(/-?\d*\.?\d+/g) || []).map(Number); const pts = []; for (let k = 0; k+1 < n.length; k += 2) pts.push([n[k], n[k+1]]); polys = [pts]; }
  else if (name === 'path') polys = pathPolys(a.d || '');
  if (fill && fill !== 'none') addPoly(polys, fill);
  if (stroke && stroke !== 'none' && sw > 0) for (const p of polys) addStroke(p, sw/2, stroke);
}
function resolve(inner, M, inh, depth) {
  if (depth > 6) return;
  let i = 0;
  while (i < inner.length) {
    const lt = inner.indexOf('<', i); if (lt < 0) break;
    const gt = inner.indexOf('>', lt); const tag = inner.slice(lt, gt+1);
    const mm = tag.match(/^<(\w+)/); if (!mm) { i = gt+1; continue; }
    const name = mm[1]; const selfClose = tag.endsWith('/>');
    let child = ''; let end = gt+1;
    if (!selfClose) { const close = inner.indexOf('</'+name+'>', gt);
      if (close < 0) { child = inner.slice(gt+1); end = inner.length; } else { child = inner.slice(gt+1, close); end = close+name.length+3; } }
    const a = attrs(tag);
    const Mt = parseTransform(a.transform);
    const M2 = [M[0]*Mt[0]+M[2]*Mt[1], M[1]*Mt[0]+M[3]*Mt[1], M[0]*Mt[2]+M[2]*Mt[3], M[1]*Mt[2]+M[3]*Mt[3], M[0]*Mt[4]+M[2]*Mt[5]+M[4], M[1]*Mt[4]+M[3]*Mt[5]+M[5]];
    const cst = {};
    for (const c of (a.class || '').split(/\s+/).filter(Boolean)) { const st = styles[c]; if (!st) continue; if (cst.fill == null && st.fill) cst.fill = st.fill; if (cst.stroke == null && st.stroke) { cst.stroke = st.stroke; cst.sw = st.sw; } }
    const inh2 = { fill: a.fill ? a.fill : (cst.fill || inh.fill), stroke: a.stroke ? a.stroke : (cst.stroke || inh.stroke), sw: a['stroke-width'] ? +a['stroke-width'] : (cst.sw || inh.sw) };
    if (name === 'svg') resolve(child, M2, inh2, depth+1);
    else if (name === 'use') {
      const id = (a.href || a['xlink:href'] || '').replace('#', '');
      const target = defs[id];
      if (target) { if (target.name === 'g') resolve(target.inner, M2, inh2, depth+1); else shapeFromTag(target.name, target.a, M2, inh2); }
    } else if (name === 'g') resolve(child, M2, inh2, depth+1);
    else if (['rect','path','circle','polygon','polyline','ellipse'].includes(name)) shapeFromTag(name, a, M2, inh2);
    i = end;
  }
}
resolve(body, [1,0,0,1,0,0], { fill: null, stroke: null, sw: 0 }, 0);
if (!shapes.length) die('no drawable shapes found');

/* background drop: a shape covering ~the whole viewBox with no stroke */
const kept = [];
for (const s of shapes) {
  const w = s.bb[2]-s.bb[0], h = s.bb[3]-s.bb[1];
  if (s.type === 'poly' && w >= vb[2]*0.9 && h >= vb[3]*0.9) { notes.push('dropped a full-canvas background shape'); continue; }
  kept.push(s);
}
if (!kept.length) die('nothing left after dropping the background');

/* ---------------- raster, components, axis ---------------- */
let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
for (const s of kept) { x0=Math.min(x0,s.bb[0]); x1=Math.max(x1,s.bb[2]); y0=Math.min(y0,s.bb[1]); y1=Math.max(y1,s.bb[3]); }
const longSide = Math.max(x1-x0, y1-y0);
if (Math.max(x1-x0, y1-y0) / Math.min(x1-x0, y1-y0) < 1.5) die('silhouette is near-square (aspect ' + ((x1-x0)/(y1-y0)).toFixed(2) + ') — a weapon needs a long axis; the model reads grip->tip');
const GS = Math.max(0.5, longSide / 1200);
const NW = Math.ceil((x1-x0)/GS)+2, NH = Math.ceil((y1-y0)/GS)+2;
const grid = new Uint8Array(NW*NH);
for (const s of kept) {
  const r0 = Math.max(0, Math.floor((s.bb[1]-y0)/GS)), r1 = Math.min(NH-1, Math.ceil((s.bb[3]-y0)/GS));
  for (let ry = r0; ry <= r1; ry++) {
    const y = y0+ry*GS; const runs = [];
    if (s.type === 'poly') {
      const xs = [];
      for (let i = 0, j = s.pts.length-1; i < s.pts.length; j = i++) {
        const ya = s.pts[j][1], yb = s.pts[i][1];
        if ((ya <= y && yb > y) || (yb <= y && ya > y)) { const t = (y-ya)/(yb-ya); xs.push(s.pts[j][0]+t*(s.pts[i][0]-s.pts[j][0])); }
      }
      xs.sort((a,b) => a-b);
      for (let k = 0; k+1 < xs.length; k += 2) runs.push([xs[k], xs[k+1]]);
    } else {
      for (let i = 0; i < s.pts.length-1; i++) {
        const ax = s.pts[i][0], ay = s.pts[i][1], bx = s.pts[i+1][0], by = s.pts[i+1][1];
        const lo = Math.min(ax,bx)-s.r, hi = Math.max(ax,bx)+s.r;
        if (y < Math.min(ay,by)-s.r || y > Math.max(ay,by)+s.r) continue;
        let rs = NaN;
        for (let x = lo; x <= hi+GS; x += GS) {
          const cov = x <= hi && distSeg(x, y, ax, ay, bx, by) <= s.r;
          if (cov && rs !== rs) rs = x;
          if (!cov && rs === rs) { runs.push([rs, x]); rs = NaN; }
        }
      }
    }
    for (const [ra, rb] of runs) {
      const ca = Math.max(0, Math.round((ra-x0)/GS)), cb = Math.min(NW-1, Math.round((rb-x0)/GS));
      for (let cx = ca; cx <= cb; cx++) grid[ry*NW+cx] = 1;
    }
  }
}
/* connected components (4-neighbour) */
const lab = new Int32Array(NW*NH).fill(0);
let ncomp = 0; const compSize = [];
for (let i = 0; i < NW*NH; i++) {
  if (!grid[i] || lab[i]) continue;
  ncomp++; let size = 0; const st = [i]; lab[i] = ncomp;
  while (st.length) {
    const j = st.pop(); size++;
    const jx = j % NW, jy = (j / NW) | 0;
    for (const [nx, ny] of [[jx+1,jy],[jx-1,jy],[jx,jy+1],[jx,jy-1]]) {
      if (nx < 0 || ny < 0 || nx >= NW || ny >= NH) continue;
      const k = ny*NW+nx;
      if (grid[k] && !lab[k]) { lab[k] = ncomp; st.push(k); }
    }
  }
  compSize.push(size);
}
const totalCells = compSize.reduce((a,b) => a+b, 0);
const bigComps = compSize.filter(c => c > totalCells * 0.04).length;
if (bigComps > 2) die(bigComps + ' disconnected pieces — the model owns one solid silhouette (or a bow-class two-strand design); weld or remove the floaters');
if (bigComps === 2) notes.push('two persistent strands detected (bow class) — both get covering circles');

/* axis: PCA on solid cells */
let mx = 0, my = 0, n = 0;
for (let iy = 0; iy < NH; iy++) for (let ix = 0; ix < NW; ix++) if (grid[iy*NW+ix]) { mx += ix; my += iy; n++; }
mx /= n; my /= n;
let sxx = 0, sxy = 0, syy = 0;
for (let iy = 0; iy < NH; iy++) for (let ix = 0; ix < NW; ix++) if (grid[iy*NW+ix]) { const dx = ix-mx, dy = iy-my; sxx += dx*dx; sxy += dx*dy; syy += dy*dy; }
const ang = 0.5 * Math.atan2(2*sxy, sxx-syy);
if (Math.abs(ang) > 0.17) die('long axis is tilted ' + (ang*57.3).toFixed(0) + '° — rotate the art horizontal and re-export (the model does not spin silhouettes at ingest)');

/* scale, orientation, local coords */
const s = LEN / ((x1-x0) * Math.cos(ang) + (y1-y0) * Math.sin(ang) || (x1-x0));
const ca = Math.cos(-ang), sa = Math.sin(-ang);
const toLocal = (X, Y) => { const dx = X-x0, dy = Y-y0; return [((dx*ca + dy*sa)) * s, ((-dx*sa + dy*ca) + (y1-y0)/2 * 0) * s]; };
/* lateral recentre: axis line = width-weighted centreline */
const colC = [];
for (let ix = 0; ix < NW; ix++) {
  let top = -1, bot = -1;
  for (let iy = 0; iy < NH; iy++) if (grid[iy*NW+ix]) { if (top < 0) top = iy; bot = iy; }
  colC.push(top < 0 ? null : (top+bot)/2);
}
const firstC = colC.find(c => c !== null);
const polys = kept.filter(sh => sh.kind === 'fill').map(sh => ({
  subs: sh.subs.map(pts => pts.map(p => { const L = toLocal(p[0], p[1]); return [+L[0].toFixed(2), +L[1].toFixed(2)]; })),
  fill: sh.mat,
}));
/* recentre laterally about the grip-end centreline */
{
  const axisL = (() => { for (let ix = 0; ix < NW; ix++) if (colC[ix] !== null) { const y = y0 + colC[ix]*GS; return toLocal(x0 + ix*GS, y)[1]; } return 0; })();
  for (const pl of polys) pl.subs = pl.subs.map(pts => pts.map(p => [p[0], +(p[1] - axisL).toFixed(2)]));
}
/* orientation: an end tapering to ~zero width is the TIP (business end);
   only when neither end tapers does the thinner end read as the grip
   (bug found by the first pointed weapon: tips were mirrored to grips) */
{
  const wEnd = (from, to) => { let acc = 0, c = 0; for (let ix = from; ix < to; ix++) { let t2 = -1, b2 = -1; for (let iy = 0; iy < NH; iy++) if (grid[iy*NW+ix]) { if (t2 < 0) t2 = iy; b2 = iy; } if (t2 >= 0) { acc += (b2-t2+1)*GS*s; c++; } } return c ? acc/c/2 : 0; };
  // orientation: the art contract PLACES the grip at x=20 — trust it, and
  // only mirror when the tapered tail (half-width < max(1.5u, 25% of max))
  // is clearly on the left while the right end is blunt (author error).
  const halfAt = (ix) => { let t2 = -1, b2 = -1; for (let iy = 0; iy < NH; iy++) if (grid[iy*NW+ix]) { if (t2 < 0) t2 = iy; b2 = iy; } return t2 < 0 ? 0 : (b2-t2+1)*GS*s/2; };
  let maxHalf = 0;
  for (let ix = 0; ix < NW; ix++) maxHalf = Math.max(maxHalf, halfAt(ix));
  const thr = 1.5;   // absolute: tip tapers to ~0; hafts and butts stay above
  const tail = (from, step) => { let c = 0; for (let ix = from; ix >= 0 && ix < NW; ix += step) { if (halfAt(ix) < thr) c++; else break; } return c / NW; };
  const tailL = tail(0, 1), tailR = tail(NW-1, -1);
  if (tailL > 0.06 && tailR < 0.03) {
    for (const pl of polys) pl.subs = pl.subs.map(pts => pts.map(p => [+(LEN - p[0]).toFixed(2), p[1]]));
    notes.push('mirrored: tapered tail was on the left, grip moved to d=0');
  } else {
    notes.push('orientation: grip-left per art contract (tail L ' + (tailL*100).toFixed(0) + '% / R ' + (tailR*100).toFixed(0) + '%)');
  }
}
/* ---------------- notch fill + covering, in game units ---------------- */
const RMIN = 2.0, RCAP = 10, INK = 3, HALF = INK/2;
/* rebuild a game-unit solid grid from the polygons, inflating by HALF (the
   ink stroke's outer half is body) and filling narrow concave mouths.
   Grid self-sizes to the art (gate fix at the axe2-D merge): the old fixed
   ±28u rows silently clipped tall silhouettes — D's ink-inflated crescent
   horns reach ±29.1u at len 110 — so rim coverage packed blind and epsilon
   under-measured. Epsilons recorded before this fix stand for their merges. */
let latMax = 0;
for (const pl of polys) for (const pts of pl.subs) for (const p of pts) latMax = Math.max(latMax, Math.abs(p[1]));
const LATH = Math.ceil(latMax + HALF + 1) + 2;
const GW = Math.ceil((LEN+4)/0.5)+2, GH = Math.ceil(2*LATH/0.5)+2, GX0 = -2, GY0 = -LATH;
const gsolid = new Uint8Array(GW*GH);
const dseg = distSeg;
for (let iy = 0; iy < GH; iy++) for (let ix = 0; ix < GW; ix++) {
  const x = GX0+ix*0.5, y = GY0+iy*0.5;
  let in_ = false;
  for (const pl of polys) {
    let inner = false;
    for (const pts of pl.subs) if (pip(pts, x, y)) inner = !inner;
    if (inner) { in_ = true; break; }
    for (const pts of pl.subs) {
      let hit = false;
      for (let i2 = 0; i2 < pts.length; i2++) {
        const a = pts[i2], b = pts[(i2+1)%pts.length];
        if (dseg(x, y, a[0], a[1], b[0], b[1]) <= HALF) { hit = true; break; }
      }
      if (hit) { in_ = true; break; }
    }
    if (in_) break;
  }
  gsolid[iy*GW+ix] = in_ ? 1 : 0;
}
/* fill concave mouths narrower than any blade circle (2*RMIN): the collision
   solid becomes the filled union; the drawing keeps the cavity (disclosed) */
let filled = 0;
for (let ix = 0; ix < GW; ix++) {
  const runs = [];
  let top = -1;
  for (let iy = 0; iy <= GH; iy++) {
    const cov = iy < GH && gsolid[iy*GW+ix];
    if (cov && top < 0) top = iy;
    if (!cov && top >= 0) { runs.push([top, iy-1]); top = -1; }
  }
  for (let r = 0; r+1 < runs.length; r++) {
    const gap = (runs[r+1][0] - runs[r][1]) * 0.5;
    if (gap < 2*RMIN) { for (let iy = runs[r][1]; iy <= runs[r+1][0]; iy++) gsolid[iy*GW+ix] = 1; filled++; }
  }
}
if (filled) notes.push('filled ' + filled + ' narrow concave column(s) in the COLLISION solid (mouth < any blade circle); the drawing keeps the cavity — every incursion visually contacts both lips');
/* greedy maximal-inscribed covering */
const dist = new Float32Array(GW*GH).fill(-1);
{ const q = []; for (let i = 0; i < GW*GH; i++) if (!gsolid[i]) { dist[i] = 0; q.push(i); }
  for (let h = 0; h < q.length; h++) { const i = q[h], ix = i % GW, iy = (i/GW)|0;
    for (const [nx, ny] of [[ix+1,iy],[ix-1,iy],[ix,iy+1],[ix,iy-1]]) {
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const j = ny*GW+nx; if (dist[j] < 0) { dist[j] = dist[i]+0.5; q.push(j); } } } }
const covered = new Uint8Array(GW*GH);
const processed = new Uint8Array(GW*GH);
const circles = [];
for (;;) {
  let best = -1, bi = -1;
  for (let i = 0; i < GW*GH; i++) { if (gsolid[i] && !covered[i] && !processed[i] && dist[i] > best) { best = dist[i]; bi = i; } }
  if (bi < 0) break;
  if (best < RMIN) { processed[bi] = 1; continue; }
  const r = Math.min(RCAP, best);
  const cx = GX0+(bi % GW)*0.5, cy = GY0+((bi/GW)|0)*0.5;
  circles.push({ d: +cx.toFixed(2), l: +cy.toFixed(2), r: +r.toFixed(2) });
  for (let iy = 0; iy < GH; iy++) for (let ix = 0; ix < GW; ix++) {
    const i = iy*GW+ix;
    if (gsolid[i] && !covered[i] && Math.hypot(GX0+ix*0.5-cx, GY0+iy*0.5-cy) <= r) covered[i] = 1;
  }
}
/* decimate */
const keepIdx = [];
for (let ci = 0; ci < circles.length; ci++) {
  const c = circles[ci]; let needed = false;
  for (let iy = 0; iy < GH && !needed; iy++) for (let ix = 0; ix < GW; ix++) {
    const i = iy*GW+ix;
    if (!gsolid[i] || Math.hypot(GX0+ix*0.5-c.d, GY0+iy*0.5-c.l) > c.r) continue;
    let other = false;
    for (let cj = 0; cj < circles.length; cj++) { if (cj === ci) continue; const o = circles[cj]; if ((cj < ci && keepIdx.includes(cj)) || cj > ci) { if (Math.hypot(GX0+ix*0.5-o.d, GY0+iy*0.5-o.l) <= o.r) { other = true; break; } } }
    if (!other) { needed = true; break; }
  }
  if (needed) keepIdx.push(ci);
}
const circ = keepIdx.map(i => circles[i]);
let eps = 0;
for (let iy = 0; iy < GH; iy++) for (let ix = 0; ix < GW; ix++) {
  const i = iy*GW+ix;
  if (!gsolid[i]) continue;
  let inside = false, bg = Infinity;
  for (const c of circ) { const g = Math.hypot(GX0+ix*0.5-c.d, GY0+iy*0.5-c.l)-c.r; if (g <= 0) { inside = true; break; } if (g < bg) bg = g; }
  if (!inside && bg > eps) eps = bg;
}

/* ---------------- report ---------------- */
const id = String(flags.id || 'ingest').toLowerCase().replace(/[^a-z0-9-]/g, '-');
const name = flags.name || id[0].toUpperCase() + id.slice(1);
say('VALID: ' + (SRC === '-' ? '<stdin>' : SRC));
say('  silhouette: ' + (x1-x0).toFixed(0) + 'x' + (y1-y0).toFixed(0) + ' svg units -> len ' + LEN + ' game units');
say('  polygons: ' + polys.length + '   covering circles: ' + circ.length + '   min r ' + Math.min(...circ.map(c=>c.r)).toFixed(1) + '   epsilon ' + eps.toFixed(2) + 'u');
for (const nt of notes) say('  note: ' + nt);
const DATA = { polys, circles: circ };
writeFileSync('.qa/ingest-out.js', 'const INGR = ' + JSON.stringify(DATA) + ';\n');
say('  data written to .qa/ingest-out.js');
if (!flags.into) { say('DRY RUN (no --into): gauntlet + merge skipped'); process.exit(0); }

/* ---------------- merge + gauntlet ---------------- */
const PREVIEW = flags.into;
const prevSrc = readFileSync(PREVIEW, 'utf8');
if (new RegExp("\\b" + id + ":").test(prevSrc.slice(prevSrc.indexOf('const WEAPONS = {'), prevSrc.indexOf('const WEAPON_IDS')))) die('weapon id "' + id + '" already exists in ' + PREVIEW);
function mergeInto(text, constName) {
  if (text.includes('const ' + constName + ' =')) die('const ' + constName + ' already present in target — refusing double-merge');
  const idsLine = text.match(/const WEAPON_IDS = \[([^\]]*)\]/);
  if (idsLine && idsLine[1].split(',').map(s => s.trim().replace(/'/g, '')).includes(id)) {
    die('id "' + id + '" already in WEAPON_IDS — replacement flow: strip the legacy entry AND its id first, then ingest');
  }
  const block = '  const ' + constName + ' = ' + JSON.stringify(DATA) + ';\n';
  let out = text.replace('  const WEAPONS = {', block + '  const WEAPONS = {');
  const wiIdx = out.indexOf('const WEAPON_IDS');
  const closeIdx = out.lastIndexOf('  };', wiIdx);
  const entry = '    ' + id + ': {\n      name: \'' + name + '\', omega: 3.5, len: ' + LEN + ', dmg: 5,\n      trait: { spin: 0.0, dmg: 0.7 }, line: \'gains damage per damaging hit\',\n      poly: ' + constName + ',\n    },\n';
  out = out.slice(0, closeIdx) + entry + out.slice(closeIdx);
  out = out.replace(/const WEAPON_IDS = \[([^\]]*)\];/, (m, g1) => 'const WEAPON_IDS = [' + g1 + ", '" + id + "'];");
  return out;
}
const tempPath = '.qa/gauntlet-preview.html';
writeFileSync(tempPath, mergeInto(prevSrc, 'INGR_TMP'));
say('  gauntlet preview written to ' + tempPath + ' — running combat gauntlet...');

/* gauntlet: termination + laws 1/2/3 for the new weapon vs every roster member */
const gsrc = readFileSync(tempPath, 'utf8');
const ga = gsrc.indexOf('<script>'), gb = gsrc.indexOf('</script>', ga);
let gbody = gsrc.slice(ga+8, gb);
const opener = '(function () {';
gbody = gbody.slice(gbody.indexOf(opener)+opener.length);
gbody = gbody.slice(0, gbody.lastIndexOf('})();'));
gbody += '\n;return { newGame, tick, CFG, geom, WEAPONS, WEAPON_IDS };';
function fakeEl() { const t = function () {}; return new Proxy(t, { get(x,p){ if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl(); return x[p]; }, set(x,p,v){ x[p]=v; return true; }, apply(){ return fakeEl(); } }); }
const api = new Function('document','window','performance','requestAnimationFrame','console', gbody)(
  { getElementById: () => fakeEl(), createElement: () => fakeEl(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
  { now: () => 0 }, () => 0, console);
const fails = [];
let battles = 0;
for (const opp of api.WEAPON_IDS) {
  for (let seed = 1; seed <= SEEDS; seed++) {
    const G = api.newGame(seed, { weapons: [id, opp] });
    G.audit = true;
    let t = 0, phantom = 0, noTouchParry = 0, polyWorst = 0, polyTicks = 0, polyOver = 0;
    while (!G.over && t < 300 * api.CFG.tickHz) {
      api.tick(G); t++;
      const f = G.fighters;
      if (f[0].alive && f[1].alive && f[0].weapon && f[1].weapon) {
        const pg = api.geom.parryGap({ x: f[0].pos.x, y: f[0].pos.y, ang: f[0].wAngle, w: f[0].weapon }, { x: f[1].pos.x, y: f[1].pos.y, ang: f[1].wAngle, w: f[1].weapon });
        if (api.WEAPONS[f[0].weapon].poly || api.WEAPONS[f[1].weapon].poly) { polyTicks++; if (pg.gap < 0) { polyOver++; if (-pg.gap > polyWorst) polyWorst = -pg.gap; } }
      }
      for (const e of G.events) {
        if (e.kind === 'hit' && !e.shot) {
          const cc = [];
          api.geom.bladeCircles(e.ax, e.ay, e.aAng, e.aW, cc);
          if (!(api.geom.bladeBodyGap(cc, e.x, e.y) < api.CFG.bodyR + 1e-9)) phantom++;
        }
        if (e.kind === 'parry') {
          const pg = api.geom.parryGap({ x: e.ax, y: e.ay, ang: e.aAng, w: e.aW }, { x: e.bx, y: e.by, ang: e.bAng, w: e.bW });
          if (pg.gap > 1e-9) noTouchParry++;
        }
      }
    }
    battles++;
    if (!G.over) fails.push(id + '+' + opp + ' seed ' + seed + ': no winner in 300s');
    if (phantom) fails.push(id + '+' + opp + ' seed ' + seed + ': ' + phantom + ' phantom hits (law 1)');
    if (noTouchParry) fails.push(id + '+' + opp + ' seed ' + seed + ': ' + noTouchParry + ' parries without touch (law 2)');
    if (polyWorst >= 6 || (polyTicks && polyOver / polyTicks > 0.02)) fails.push(id + '+' + opp + ' seed ' + seed + ': solidity outside the disclosed band (worst ' + polyWorst.toFixed(2) + 'px, ' + (100*polyOver/Math.max(1,polyTicks)).toFixed(2) + '%)');
  }
}
say('  gauntlet: ' + battles + ' battles vs ' + api.WEAPON_IDS.join('/'));
if (fails.length) {
  say('GAUNTLET FAIL — nothing merged:');
  for (const f of fails.slice(0, 12)) say('  ' + f);
  process.exit(1);
}
writeFileSync(PREVIEW, mergeInto(prevSrc, 'INGR_' + id.replace(/-/g, '_').toUpperCase()));
say('GAUNTLET PASS — merged ' + id + ' into ' + PREVIEW);
say('record for GAMES.md: ingest ' + id + ' len ' + LEN + ', ' + circ.length + ' circles, epsilon ' + eps.toFixed(2) + 'u, gauntlet ' + battles + ' battles green');
