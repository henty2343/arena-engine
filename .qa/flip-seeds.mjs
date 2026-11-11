/* .qa/flip-seeds.mjs (moved from scratch/triage/diag-flip-seeds.mjs, docs-cleanup 2026-11-11) — READ-ONLY probe (Item-3 triage, session 6, 2026-11-11).
 *
 * Menu item 5, the SEEDS half: .qa/flipproof.mjs hardcoded FLAG_SEED 2 and CTRL_SEED 4. Measured
 * (session 2, scratch/triage/runs-before/diag-flip-t4.out — pruned from HEAD 2026-11-11, GAMES #731; `git show item3-closed:scratch/triage/runs-before/diag-flip-t4.out`): s4 now rolls the STAFF, which joined
 * the edge-leading mirror at the 2026-10-28 facing pass — so the control battle's "no flagged weapon
 * in ANY rolled round" tripwire fires exactly as designed and the whole T2 control half is dead.
 *
 * The fix is column A of the owner menu ("script picks + asserts its own naturals"): the proof scans
 * seeds at boot and picks its own, instead of hardcoding a pair that rots at the next roster change.
 * The session-2 scan measured the naturals: FLAG -> s1 (spear+flail / scythe+shield, 38 parries),
 * CTRL -> s7 (orb+orb / bow+boomerang, 13 parries, nothing flagged).
 *
 * THIS probe adds the criterion the session-2 scan did NOT have, and which is exactly what broke the
 * s2 pair: a FLAG seed must have its flagged weapon on ONE side only. s2 rolls [[scythe,tome],
 * [hammer,javelin]] — scythe/tome on one side and the JAVELIN (headLead) on the other — so side 1
 * animates too and the probe's "the unflagged side never leaves ±1" law (T2) drowns in false reds.
 * The criterion below rejects such a seed: the side opposite the first flagged parry must NEVER hold
 * a flagged weapon in any parry.
 *
 * Writes nothing. Runs no measure.mjs. Canonical untouched.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const html = readFileSync(join(ROOT, 'previews', 'spinclash-preview.html'), 'utf8');
const blocks = [];
{ let i = 0; while (true) { const a = html.indexOf('<script>', i); if (a < 0) break; const b = html.indexOf('</script>', a); blocks.push(html.slice(a + 8, b)); i = b; } }
globalThis.Path2D ??= class { arc() { } moveTo() { } lineTo() { } closePath() { } rect() { } };

const FRAME_MS = 16.7;
const SCAN_MAX = Number(process.argv[2] || 12);

function fakeEl2() {
  const t = function () { };
  return new Proxy(t, {
    get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl2(); return x[p]; },
    set(x, p, v) { x[p] = v; return true; },
    apply() { return fakeEl2(); },
  });
}
const opener = '(function () {';
let simBody = blocks[0].slice(blocks[0].indexOf(opener) + opener.length);
simBody = simBody.slice(0, simBody.lastIndexOf('})();'));
const sim = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
  simBody + '\n;return { newGame, tick, CFG, WEAPONS };')(
  { getElementById: () => fakeEl2(), createElement: () => fakeEl2(), querySelectorAll: () => [], addEventListener: () => { }, activeElement: null },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => { } },
  { now: () => 0 }, () => 0, console);
const { newGame, tick, CFG, WEAPONS } = sim;
const flagged = (w) => !!(WEAPONS[w].lead || WEAPONS[w].headLead);

/* the scan the proof will ship — one sim battle, collecting what both criteria need */
function scan(seed, frames) {
  const G = newGame(seed);
  let t = 0; const maxT = Math.round(frames * FRAME_MS * CFG.tickHz / 1000);
  let parries = 0, firstFlaggedParry = { tick: Infinity, side: -1 };
  const sideFlagged = [false, false];   // did this side ever hold a flagged weapon IN A PARRY?
  while (!G.over && t < maxT) {
    tick(G); t++;
    for (const e of G.events) if (e.kind === 'parry') {
      parries++;
      const sides = [flagged(e.aW) ? 0 : -1, flagged(e.bW) ? 1 : -1];
      for (const s of sides) if (s >= 0 && e.tick < firstFlaggedParry.tick) firstFlaggedParry = { tick: e.tick, side: s };
      if (sides[0] >= 0) sideFlagged[0] = true;
      if (sides[1] >= 0) sideFlagged[1] = true;
    }
    G.events.length = 0;
  }
  const rollsFlagged = G.rolls.some(r => r.w.some(flagged));
  return { parries, firstFlaggedParry, rolls: G.rolls.map(r => r.w), rollsFlagged, sideFlagged };
}

/* the FLAG criterion: a real battle, a flagged parry, and the flagged weapon on ONE side only */
const flagOk = (r) => r.parries > 0 && r.firstFlaggedParry.side >= 0 &&
  r.sideFlagged[r.firstFlaggedParry.side] && !r.sideFlagged[1 - r.firstFlaggedParry.side];
/* the CTRL criterion: a real battle and NO flagged weapon in ANY rolled round */
const ctrlOk = (r) => r.parries > 0 && !r.rollsFlagged;

console.log(`flip seed scan — ${SCAN_MAX} candidate seeds`);
console.log('seed | parries | rollsFlagged | flagSide | sideFlagged | FLAG-ok | CTRL-ok | rolls');
let pickFlag = null, pickCtrl = null;
const table = [];
for (let s = 1; s <= SCAN_MAX && !(pickFlag && pickCtrl); s++) {
  const r = scan(s, 9000);
  const fOk = flagOk(r), cOk = ctrlOk(r);
  table.push([s, r.parries, r.rollsFlagged, r.firstFlaggedParry.side, r.sideFlagged, fOk, cOk, r.rolls]);
  if (!pickFlag && fOk) pickFlag = s;
  if (!pickCtrl && cOk) pickCtrl = s;
  console.log(`  s${String(s).padStart(2)} | ${String(r.parries).padStart(7)} | ${String(r.rollsFlagged).padStart(12)} | ${String(r.firstFlaggedParry.side).padStart(8)} | ${JSON.stringify(r.sideFlagged).padEnd(13)} | ${String(fOk).padStart(7)} | ${String(cOk).padStart(7)} | ${JSON.stringify(r.rolls)}`);
}
console.log('');
console.log(`PICKED: FLAG_SEED ${pickFlag} (hardcoded 2) · CTRL_SEED ${pickCtrl} (hardcoded 4 — now rolls the staff)`);
console.log(`session-2 measured naturals: FLAG 1 · CTRL 7`);

let bad = 0;
if (pickFlag === null) { console.log('!! NO FLAG SEED FOUND — the scan must loud-fail, not fall back'); bad++; }
if (pickCtrl === null) { console.log('!! NO CTRL SEED FOUND — the scan must loud-fail, not fall back'); bad++; }
if (pickFlag !== 1) { console.log(`!! the scan picked FLAG ${pickFlag}, not the session-2 measured natural 1`); bad++; }
if (pickCtrl !== 7) { console.log(`!! the scan picked CTRL ${pickCtrl}, not the session-2 measured natural 7`); bad++; }
if (bad) process.exit(1);
console.log('SEED SCAN OK — both picks found, both match the measured naturals');
