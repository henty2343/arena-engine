/* .qa/lengrow-gate.mjs — does a runtime d-stretch survive the house inscription gate?
 *
 * The length-growth ladder stretches the spear along its spine coordinate `d` only, holding
 * `l` and `r` so the weapon never thickens. Two candidate geometries:
 *
 *   uniform — every d scales by k. The head elongates with the shaft, which SHALLOWS every
 *             tapered edge: perpendicular clearance from the spine to that edge shrinks while
 *             r holds, so circles sized for the original taper may escape the ink (poke).
 *   rigid   — the shaft region (d <= J) scales by k; everything beyond TRANSLATES by (k-1)*J.
 *             The head keeps its exact shape and simply sits further out, so its taper and its
 *             circles' clearance are unchanged. Continuous at J (both branches give J*k).
 *
 * !!! THE TRAP THIS SCRIPT EXISTS TO RESPECT !!!
 * Canonical :452-455 uniformly rescales INGR_HAMMER/AXE/SPEAR so maxD == LT. That
 * normalisation is SCALE-INVARIANT: stretching the authored INGR coordinates is divided
 * straight back out at boot, so the booted poly does not move. A first version of this script
 * stretched the INGR block and reported large `poke` failures — those were an artefact of
 * circles marching outward past art that had never moved. The stretch is therefore injected
 * AFTER the normalisation loop, on INGR_SPEAR's already-normalised polys, which is exactly
 * what a runtime stretch of the booted `W.poly.polys` would do.
 *
 * J is expressed as a FRACTION of the tip (75.38/113.38, the authored shaft-end / tip) so it
 * survives the normalisation and the weaponScale multiplication without a hardcoded constant.
 *
 * The gate's own tolerances are the authority, not lengrow-proof.mjs's re-implementation:
 *   POKE_TOL 0.12px — a covering circle must not escape the drawn ink
 *   MISS_TOL 4.6px  — deepest ink point outside every circle ("tapered tips + thin paint")
 *
 * Writes only scratch/.lengrow-gate-temp.html. Never touches the canonical or measure.mjs.
 * Usage: node .qa/lengrow-gate.mjs [--mode uniform|rigid] [--steps N] [--rate R] [--k k1,k2,...]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const MODE = flag('mode', 'uniform');
const STEPS = +flag('steps', 12), RATE = +flag('rate', 0.0253);   // default tracks the shipped spear trait (was 0.012 until the owner's "more ridiculous" raise, 2026-10-28)
const CANON = join(root, 'previews', 'spinclash-preview.html');
const TEMP = join(root, 'scratch', '.lengrow-gate-temp.html');

/* the shaft/head junction as a fraction of the authored tip — invariant under :452-455's
 * normalisation and under the weaponScale multiply, so no baked-in world-px constant. */
const JFRAC = +flag('jfrac', 75.38 / 113.38);   // junction as a fraction of the authored tip (default: the shaft rect's end)
const TIP_WORLD = 113.44 * 1.3;            // LT (the mace's tip) x CFG.weaponScale = 147.472
const J_WORLD = TIP_WORLD * JFRAC;         // the same junction, in the circle row's world px

let ks = flag('k', null);
ks = ks ? ks.split(',').map(Number) : [1, ...Array.from({ length: STEPS }, (_, i) => Math.pow(1 + RATE, i + 1))];

const src = readFileSync(CANON, 'utf8');
const lines0 = src.split('\n');

/* the normalisation loop's closing brace — the injection point, so the stretch is applied to
 * already-normalised coordinates and cannot be cancelled */
const normStart = lines0.findIndex(l => l.includes('for (const P of [INGR_HAMMER'));
if (normStart < 0) throw new Error('the :452-455 LT normalisation loop was not found — this script is stale');
let normEnd = normStart;
while (lines0[normEnd].trim() !== '}') normEnd++;

const spearRowIdx = lines0.findIndex(l => l.trim().startsWith('spear: [') && l.includes('"d":'));
if (spearRowIdx < 0) throw new Error('CIRCLES_V2 spear row not found');
const widIdx = lines0.findIndex(l => l.trim().startsWith('const WEAPON_IDS ='));

/* circles live in world px as {"d":..,"l":..,"r":..}; only d is mapped, at the row's own 1dp */
const mapCircleD = (s, k) => s.replace(/"d":\s*(-?\d+(?:\.\d+)?)/g, (m, a) => {
  const d = +a, J = MODE === 'rigid' ? J_WORLD : Infinity;
  const nd = d <= J ? d * k : d + (k - 1) * J;
  return `"d":${Math.round(nd * 10) / 10}`;
});

/* the injected art stretch: runs at boot, after normalisation, on INGR_SPEAR only */
function injection(k) {
  const jf = (MODE === 'rigid' || MODE === 'rigidshape') ? JFRAC : 'null';
  const perShape = MODE === 'rigidshape';
  return [
    `  /* lengrow-gate injection (k=${k}, mode=${MODE}): post-normalisation d-only stretch */`,
    `  (function () {`,
    `    const k = ${k}, JF = ${jf};`,
    `    let md = 0;`,
    `    for (const pl of INGR_SPEAR.polys) for (const pts of pl.subs) for (const q of pts) md = Math.max(md, q[0]);`,
    `    const J = JF === null ? Infinity : md * JF;`,
    `    const PER_SHAPE = ${perShape};`,
    `    INGR_SPEAR.polys.forEach((pl, si) => {`,
    `      for (const pts of pl.subs) for (const q of pts)`,
    `        q[0] = (PER_SHAPE ? (si === 0 ? q[0] * k : q[0] + (k - 1) * J)`,
    `                         : (q[0] <= J ? q[0] * k : q[0] + (k - 1) * J));`,
    `    });`,
    `  })();`,
  ];
}

function tempFor(k) {
  const lines = src.split('\n');
  lines[spearRowIdx] = mapCircleD(lines[spearRowIdx], k);
  lines[widIdx] = `  const WEAPON_IDS = ['spear'];`;   // trim: audit the spear only (bake-rows' trick)
  lines.splice(normEnd + 1, 0, ...injection(k));
  writeFileSync(TEMP, lines.join('\n'));
}

console.log(`lengrow-gate — the ${MODE} runtime d-stretch against inscribe.mjs's own gate`);
console.log(`  mode: ${MODE}${MODE === 'rigid' ? ` (shaft d<=J scales, head translates by (k-1)*J; J = ${JFRAC.toFixed(4)} of the tip = ${J_WORLD.toFixed(2)}px world)` : ' (every d scales by k)'}`);
console.log(`  l and r held, so the spear never thickens · ladder ${STEPS} steps at ${(RATE * 100).toFixed(1)}%/hit`);
console.log('');
console.log('     k   stretch%    n   minR    poke      miss     verdict');

let firstFail = null, firstPoke = null, firstMiss = null;
for (const k of ks) {
  tempFor(k);
  let out = '';
  try {
    out = execFileSync(process.execPath, [join(here, 'inscribe.mjs'), 'scratch/.lengrow-gate-temp.html'],
      { encoding: 'utf8', maxBuffer: 1 << 24, cwd: root });
  } catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  const m = out.split('\n').find(l => /^spear\s/.test(l));
  if (!m) { console.log(` ${k.toFixed(4)}   BOOT/RUN FAILURE\n${out.split('\n').slice(0, 6).join('\n')}`); continue; }
  const num = (re) => { const x = re.exec(m); return x ? +x[1] : NaN; };
  const n = num(/n=\s*(\d+)/), minR = num(/minR=\s*([\d.]+)/);
  const poke = num(/poke=([+-]?[\d.]+)/), miss = num(/miss=([\d.]+)/);
  const inf = /poke=\+Infinity/.test(m);
  const bad = inf || poke > 0.12 || miss > 4.6;
  if (bad && firstFail === null) firstFail = k;
  if ((inf || poke > 0.12) && firstPoke === null) firstPoke = k;
  if (miss > 4.6 && firstMiss === null) firstMiss = k;
  const tag = k === 1 ? 'SHIPPED BASELINE' : bad ? 'GATE FAIL' : 'gate pass';
  const pk = inf ? '+Inf' : (poke >= 0 ? '+' : '') + poke.toFixed(2);
  console.log(` ${k.toFixed(4)}   ${((k - 1) * 100).toFixed(1).padStart(5)}%  ${String(n).padStart(3)}  ` +
    `${Number.isNaN(minR) ? 'NaN' : minR.toFixed(2).padStart(5)}  ${pk.padStart(6)}px  ${miss.toFixed(2).padStart(5)}px   ${tag}` +
    (Math.abs(k - Math.pow(1 + RATE, STEPS)) < 1e-9 ? '   <-- design point' : ''));
}

console.log('');
if (firstFail === null) {
  console.log('  [PASS] this stretch stays inside the house gate across the whole ladder.');
  console.log(`         Option (${MODE}) needs no bake pipeline and no extra circle rows.`);
} else {
  console.log(`  [FAIL] the ${MODE} stretch first breaks the gate at k=${firstFail.toFixed(4)} (+${((firstFail - 1) * 100).toFixed(1)}%).`);
  if (firstPoke !== null) console.log(`         POKE binds from k=${firstPoke.toFixed(4)}: circles escape the drawn ink.`);
  if (firstMiss !== null) console.log(`         MISS binds from k=${firstMiss.toFixed(4)}: ink left outside every circle.`);
  console.log('         A pre-baked ladder (re-pack each step with inscribe.mjs --regen) is required.');
}
console.log('');
console.log('Scratch temp left at scratch/.lengrow-gate-temp.html (safe to delete).');
