/* scratch/triage/diag-nonvacuity-lengrow-bake.mjs — non-vacuity proof for the SCOPED lengrow-bake guard
 * (session 7, 2026-11-11). READ-ONLY: it reads the canonical and the baker, writes nothing.
 *
 * Method (the session-6 pattern): extract the SHIPPED guard source VERBATIM out of .qa/lengrow-bake.mjs and
 * evaluate it against the real roster and mutated copies of it, so the proof cannot drift from what ships.
 * A guard that never refuses, or one that refuses the shipped roster, would both be vacuous — this proves it
 * does neither.
 *   C0 control: the real roster {spear rigid, flail chain}            -> passes, chain grower REPORTED
 *   C1 spear loses trait.len (no growers)                             -> exit 2
 *   C2 a SECOND rigid grower (katana gets trait.len)                  -> exit 2   (the guard IS the coverage)
 *   C3 the only rigid grower is not the spear                         -> exit 2
 *   C4 flail loses chain (becomes a rigid grower — the regression class) -> exit 2
 *   C5 a SECOND chain grower (nunchaku gets trait.len)                -> passes, BOTH chain growers reported
 *   C6 flail.chain.ext = undefined                                    -> passes the guard but the line says MISSING (never silent)
 *   C7 old-vs-new witness: the PRE-patch guard, run on the real roster -> exit 2 (the defect this patch fixes)
 */
import { readFileSync } from 'node:fs';

const CANON = 'previews/spinclash-preview.html';
const NEW_SRC = readFileSync('.qa/lengrow-bake.mjs', 'utf8');
const OLD_SRC = readFileSync('scratch/triage/lengrow-bake.mjs.orig', 'utf8');

function fakeEl() {
  const t = function () {};
  return new Proxy(t, {
    get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl(); return x[p]; },
    set(x, p, v) { x[p] = v; return true; },
    apply() { return fakeEl(); },
  });
}
const src = readFileSync(CANON, 'utf8');
const a = src.indexOf('<script>'), b = src.indexOf('</script>', a);
let body = src.slice(a + 8, b);
const opener = '(function () {';
body = body.slice(body.indexOf(opener) + opener.length);
body = body.slice(0, body.lastIndexOf('})();'));
const api = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
  body + '\n;return { WEAPONS };')(
  { getElementById: () => fakeEl(), createElement: () => fakeEl(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
  { now: () => 0 }, () => 0, console);

/* ---- extract the shipped guard source verbatim ---- */
function slice(text, from, toIncl) {
  const i = text.indexOf(from); if (i < 0) throw new Error('extract: start marker not found: ' + from.slice(0, 60));
  const j = text.indexOf(toIncl, i); if (j < 0) throw new Error('extract: end marker not found: ' + toIncl.slice(0, 60));
  return text.slice(i, j + toIncl.length);
}
/* NEW: the three const lines, then the guard block + the chain report line (contiguous in the file). */
const newDefs = slice(NEW_SRC, 'const ALL_GROWERS =', 'const CHAIN_GROWERS = ALL_GROWERS.filter(id => api.WEAPONS[id].chain);');
const newGuard = slice(NEW_SRC, "if (GROWERS.length !== 1 || GROWERS[0] !== 'spear') {", "' (chain.ext MISSING)'); }).join(', ')}`);");
/* OLD: the unscoped filter line and its guard block. */
const oldDefs = slice(OLD_SRC, 'const GROWERS = Object.keys(api.WEAPONS)', 'api.WEAPONS[id].trait.len);');
const oldGuard = slice(OLD_SRC, "if (GROWERS.length !== 1 || GROWERS[0] !== 'spear') {", '  process.exit(2);\n}');

function runGuard(defs, guard, WEAPONS) {
  const out = { exit: null, log: [], err: [] };
  const cons = { log: (...x) => out.log.push(x.join(' ')), error: (...x) => out.err.push(x.join(' ')) };
  const proc = { exit: (c) => { const e = new Error('exit'); e.exitCode = c; throw e; } };
  try { new Function('api', 'console', 'process', defs + '\n' + guard)({ WEAPONS }, cons, proc); out.exit = 0; }
  catch (e) { if (e && e.exitCode !== undefined) out.exit = e.exitCode; else throw e; }
  return out;
}
function mutate(fn) {
  const W = {};
  for (const id of Object.keys(api.WEAPONS)) {
    const o = api.WEAPONS[id];
    W[id] = Object.assign({}, o, { trait: o.trait ? Object.assign({}, o.trait) : o.trait, chain: o.chain ? Object.assign({}, o.chain, o.chain.ext ? { ext: Object.assign({}, o.chain.ext) } : {}) : o.chain });
  }
  if (fn) fn(W);
  return W;
}
for (const id of ['spear', 'flail', 'katana', 'nunchaku']) if (!api.WEAPONS[id]) throw new Error('roster id missing: ' + id);
if (api.WEAPONS.katana.chain || api.WEAPONS.katana.trait && api.WEAPONS.katana.trait.len) throw new Error('premise broken: katana must start as a plain rigid non-grower');
if (!api.WEAPONS.nunchaku.chain) throw new Error('premise broken: nunchaku must be a chain weapon');

let bad = 0;
const cell = (name, pass, detail) => { console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!pass) bad++; };

const C0 = runGuard(newDefs, newGuard, mutate());
cell('C0 control: real roster passes, chain grower reported', C0.exit === 0 && C0.log.some(l => /flail/.test(l) && /skipped by design/.test(l)), C0.log.join(' | ').slice(0, 130));
const C1 = runGuard(newDefs, newGuard, mutate(W => { delete W.spear.trait.len; }));
cell('C1 no rigid grower -> refuses', C1.exit === 2, (C1.err[0] || '').slice(0, 90));
const C2 = runGuard(newDefs, newGuard, mutate(W => { W.katana.trait = Object.assign({}, W.katana.trait, { len: 0.05 }); }));
cell('C2 SECOND rigid grower -> refuses (the guard IS the coverage)', C2.exit === 2 && /spear, katana|katana, spear/.test(C2.err[0] || ''), (C2.err[0] || '').slice(0, 90));
const C3 = runGuard(newDefs, newGuard, mutate(W => { delete W.spear.trait.len; W.katana.trait = Object.assign({}, W.katana.trait, { len: 0.05 }); }));
cell('C3 sole rigid grower is not the spear -> refuses', C3.exit === 2 && /katana/.test(C3.err[0] || ''), (C3.err[0] || '').slice(0, 90));
const C4 = runGuard(newDefs, newGuard, mutate(W => { delete W.flail.chain; }));
cell('C4 flail loses its chain (rigid grower #2) -> refuses', C4.exit === 2 && /flail/.test(C4.err[0] || ''), (C4.err[0] || '').slice(0, 90));
const C5 = runGuard(newDefs, newGuard, mutate(W => { W.nunchaku.trait = Object.assign({}, W.nunchaku.trait, { len: 0.02 }); }));
cell('C5 SECOND chain grower -> passes, BOTH reported', C5.exit === 0 && C5.log.some(l => /flail/.test(l) && /nunchaku/.test(l)), C5.log.join(' | ').slice(0, 130));
const C6 = runGuard(newDefs, newGuard, mutate(W => { W.flail.chain.ext = undefined; }));
cell('C6 chain.ext missing -> never silent (line says MISSING)', C6.exit === 0 && C6.log.some(l => /chain\.ext MISSING/.test(l)), C6.log.join(' | ').slice(0, 130));
const C7 = runGuard(oldDefs, oldGuard, mutate());
cell('C7 old-vs-new witness: PRE-patch guard refuses the real roster', C7.exit === 2 && /spear, flail/.test(C7.err[0] || ''), (C7.err[0] || '').slice(0, 110));

console.log(bad === 0 ? '\nNON-VACUITY: 8/8 — the scoped guard refuses what it must, passes what it must, and the defect is witnessed on the old guard.' : `\nNON-VACUITY: ${bad} cell(s) FAILED`);
process.exit(bad ? 1 : 0);
