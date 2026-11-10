/* .qa/bake-rows.mjs — the RE-DERIVED row-splice CIRCLES_V2 baker (2026-10-25).
 * Successor to the purged .qa/bake-row.mjs and the spent bake-circles-v2.mjs:
 * bakes covering rows for weapons whose rows were deleted (ghosts) and splices
 * them back into CIRCLES_V2 at WEAPON_IDS-order positions (trailing-comma
 * rows, comma-safe — the dry-run-purge entry's rehearsed shape).
 *
 * Non-chain ids: one temp copy with WEAPON_IDS trimmed to the batch;
 * `inscribe.mjs --regen` bakes from the booted polys.
 * Chain ids: PER SEGMENT (a union bake straddles joints — forbidden): temp
 * copies with the INGR block trimmed to one segment's shapes; the concatenated
 * circles form the row; boot tie v2 re-binds circles to segments and the
 * inscribe chain-tie + bent-pose audits prove the bind.
 *
 * usage: node .qa/bake-rows.mjs <file> <id,id,...>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const FILE = process.argv[2];
const IDS = process.argv[3].split(',').filter(Boolean);
if (!FILE || !IDS.length) throw new Error('usage: bake-rows.mjs <file> <ids>');

let src = readFileSync(FILE, 'utf8');
const NAME = {
  bow: 'INGR_BOW', hammer: 'INGR_HAMMER', dagger: 'INGR_DAGGER', axe: 'INGR_AXE',
  sword: 'INGR_SWORD', spear: 'INGR_SPEAR', mace: 'INGR_MACE', shield: 'INGR_SHIELD',
  staff: 'INGR_STAFF', wand: 'INGR_WAND', crossbow: 'INGR_XBOW', shuriken: 'INGR_SHUR',
  flail: 'INGR_FLAIL', nunchaku: 'INGR_NUNCHAKU', scythe: 'INGR_SCYTHE', katana: 'INGR_KATANA',
  knives: 'INGR_KNIVES', javelin: 'INGR_JAVELIN', scroll: 'INGR_SCROLL', orb: 'INGR_ORB',
  tome: 'INGR_TOME', boomerang: 'INGR_BOOM',
};
const lines0 = src.split('\n');
const widLine = lines0.findIndex(l => l.trim().startsWith('const WEAPON_IDS ='));
const ALL_IDS = JSON.parse(lines0[widLine].slice(lines0[widLine].indexOf('[')).replace(/;\s*$/, '').replace(/'/g, '"'));
const chLine = id => {
  if (id !== 'flail' && id !== 'nunchaku') return null;   // ONLY the chain weapons bake per segment (2026-10-25: a missing guard split six plain weapons on nunchaku segs — valid but not the union bake)
  const nm = id === 'flail' ? 'FLAIL_CH' : 'NUNCHAKU_CH';
  const l = lines0.find(x => x.trim().startsWith('const ' + nm + ' ='));
  if (!l) return null;
  const s0 = l.indexOf('segs: '), j0 = l.indexOf('], j:');
  return JSON.parse(l.slice(s0 + 6, j0 + 1));
};
function blockRange(lines, id) {
  const start = lines.findIndex(l => l.trim().startsWith('const ' + NAME[id] + ' ='));
  if (start < 0) throw new Error(id + ': block not found');
  let end = start;
  const iife = lines[start].includes('(() =>');
  while (!(lines[end] || '').trim().endsWith(iife ? '})();' : ']);')) end++;
  return [start, end];
}
function shapeLines(lines, id) {
  const [s, e] = blockRange(lines, id);
  return lines.slice(s + 1, e).filter(l => l.trim().startsWith('['));
}
function tempWith(ids, id, subsetLines) {
  let lines = src.split('\n');
  const wi = lines.findIndex(l => l.trim().startsWith('const WEAPON_IDS ='));
  lines[wi] = '  const WEAPON_IDS = ' + JSON.stringify(ids) + ';';
  if (subsetLines) {
    const [s, e] = blockRange(lines, id);
    lines.splice(s, e - s + 1, '  const ' + NAME[id] + ' = build([', ...subsetLines, '  ]);');
    /* per-segment temps drop the chain ref (batch-4 trick): regen then bakes the
       trimmed shapes as an ordinary weapon; the merged row re-ties at boot. */
    const ri = lines.findIndex(l => l.trim().startsWith(id + ': {') && l.includes('chain:'));
    if (ri >= 0) lines[ri] = lines[ri].replace(/chain: \w+, /, '')
      /* r88-era fix (2026-11-10): the chain-less twin must ALSO zero trait.len. Since longchain-r86
       * the flail carries trait.len, so a chain-less trait.len weapon falls into the SPEAR lenJ boot
       * gate and throws — the flail per-segment bake has been broken since r86 (verified on both the
       * r86 and r87 builds). With len zeroed the trimmed shapes bake as an ordinary weapon again. */
      .replace(/trait:\s*\{([^}]*)\}/, (m, t) => 'trait: {' + t.replace(/,\s*len:\s*[\d.]+/, '') + '}');
  }
  const p = join(here, '..', 'scratch', '.bake-temp.html');
  writeFileSync(p, lines.join('\n'));
  return p;
}
function regenRows(temp) {
  const out = execFileSync(process.execPath, [join(here, 'inscribe.mjs'), '--regen', 'scratch/.bake-temp.html'], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const rows = {};
  for (const l of out.split('\n')) {
    const m = l.match(/^(\w+): (\[.*\]),?$/);
    if (m) rows[m[1]] = m[2];
  }
  return rows;
}

const baked = {};
const plain = IDS.filter(id => !chLine(id));
if (plain.length) {
  const rows = regenRows(tempWith(plain, null, null));
  for (const id of plain) {
    if (!rows[id]) throw new Error(id + ': regen produced no row');
    let circles = JSON.parse(rows[id]);
    if (id === 'crossbow') {   // boot re-applies KX to crossbow circles: store pre-KX (shipped-row convention, line 525)
      const KX = 113.44 / 116;
      const r1 = v => Math.round(v / KX * 10) / 10;
      circles = circles.map(c => ({ d: r1(c.d), l: r1(c.l), r: r1(c.r) }));
    }
    baked[id] = JSON.stringify(circles);
    console.log(id + ': ' + circles.length + ' circles');
  }
}
for (const id of IDS.filter(id => chLine(id))) {
  const segs = chLine(id);
  const shapes = shapeLines(src.split('\n'), id);
  const parts = [];
  for (let k = 0; k < segs.length; k++) {
    const sub = shapes.slice(segs[k][0], segs[k][1] + 1);
    if (!sub.length) throw new Error(id + ' seg ' + k + ': empty shape range');
    const rows = regenRows(tempWith([id], id, sub));
    const circles = JSON.parse(rows[id]);
    console.log(id + ' seg ' + k + ': ' + circles.length + ' circles');
    parts.push(...circles);
  }
  baked[id] = JSON.stringify(parts);
  console.log(id + ': row = ' + parts.length + ' circles over ' + segs.length + ' segments');
}

/* splice rows into CIRCLES_V2 in roster order */
const lines = src.split('\n');
const c0 = lines.findIndex(l => l.trim().startsWith('const CIRCLES_V2 = {'));
let c1 = c0;
while (!/^\s*\};/.test(lines[c1])) c1++;
const existing = {};
for (let i = c0 + 1; i < c1; i++) {
  const m = lines[i].match(/^    (\w+): (\[.*\]),$/);
  if (m) existing[m[1]] = m[2];
}
const out = ['  const CIRCLES_V2 = {'];
for (const id of ALL_IDS) {
  const row = baked[id] || existing[id];
  if (!row) throw new Error(id + ': no row baked and none existing');
  out.push('    ' + id + ': ' + row + ',');
}
out.push('  };');
lines.splice(c0, c1 - c0 + 1, ...out);
writeFileSync(FILE, lines.join('\n'));
console.log('CIRCLES_V2 rebuilt: ' + ALL_IDS.length + ' rows (' + IDS.length + ' baked, ' + (ALL_IDS.length - IDS.length) + ' kept byte-identical)');
