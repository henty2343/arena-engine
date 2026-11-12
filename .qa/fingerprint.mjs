/* .qa/fingerprint.mjs — sim-fingerprint equivalence harness for refactors.
 * NOT measure.mjs (owner-go rule); runs in seconds.
 *
 * Runs a fixed set of battles and hashes the FULL per-tick sim state:
 * every fighter field (incl. interpolation bases), every shot, every event
 * (full JSON — stored poses included), phase/clock/stats/rolls, the auditK
 * triple, and an FNV-1a hash of the stride-13 auditSubs (every substep pose
 * the laws audit). If the hash set is identical before and after a change,
 * the change did not touch sim behaviour — fingerprints stable.
 *
 * Usage: node .qa/fingerprint.mjs <out.json> [file=previews/spinclash-preview.html]
 *        node .qa/fingerprint.mjs --compare [file]   (judge vs .qa/BASELINE, exit 0/1)
 * Legacy mode compares nothing itself — run it before and after, diff the JSONs.
 * --compare reads .qa/BASELINE, runs the same cells, judges 8/8 (exit 0) or lists moved cells (exit 1).
 *
 * ARG-ORDER GUARD (2026-10-28, owner go): arg 2 is the OUTPUT and arg 3 is the FILE. A
 * transposed invocation targets the canonical build as OUT and reads the JSON baseline as
 * HTML; that happened once and crashed inside `new Function` three frames before
 * writeFileSync, so the canonical survived by luck rather than by design. Both halves are
 * now refused up front: OUT must not be an .html path, and FILE must contain <script>.
 *
 * OUT PATH RULE (2026-10-28 hygiene pass): the no-arg default `.qa/fingerprint.json` is SCRATCH
 * output, never a baseline. A stale file at the default path reads like "the current fingerprint"
 * and invites a diff against the wrong build — that is exactly what happened, and the stray was
 * deleted in this pass. Write baselines to a named `.qa/fp-<stamp>.json`. Note also that
 * `.qa/fp-authoring.json` and `.qa/fp-dmg1-r21.json` are byte-identical BY DESIGN (the
 * authoring-scale pass moved no fingerprint, and a dated GAMES.md entry cites fp-authoring.json as
 * the before-half of the facing-pass kept pair): two role-names for one artifact, not a duplicate
 * to merge, and neither is a stray.
 *
 * UPDATE 2026-10-28 (pre-skills workspace cleanup, owner go): those four historical checkpoints —
 * fp-authoring.json, fp-dmg1-r21.json, fp-shotvocab.json and fp-pause-after.json — were DELETED,
 * so at that point `.qa/fp-lead-r22.json` was the only baseline on disk (a 2026-10-28 snapshot — many dated `fp-<stamp>.json` checkpoints exist now; the standing one is named in `.qa/BASELINE`, judged via `--compare`). The reasoning above is kept
 * verbatim because it records why they were never strays while they existed; the deletion reverses
 * the keeping decision, not the reasoning, and GAMES.md's Testing recipe carries the dated note.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const COMPARE = process.argv.includes('--compare');
const pos = process.argv.slice(2).filter(a => a !== '--compare');
// legacy: arg2 = OUTPUT json, arg3 = build.  --compare: optional positional = build.
const OUT = resolve(COMPARE ? '.qa/fingerprint.json' : (pos[0] || '.qa/fingerprint.json'));
const fileArg = COMPARE ? pos[0] : pos[1];
const FILE = resolve(fileArg ? join(here, '..', fileArg) : join(here, '..', 'previews', 'spinclash-preview.html'));
const USAGE = 'usage: node .qa/fingerprint.mjs <out.json> [file.html]   (arg 2 = OUTPUT json, arg 3 = the build)\n' +
              '       node .qa/fingerprint.mjs --compare [file.html]   (judge the build vs .qa/BASELINE; exit 0 = identical)';
if (/\.html?$/i.test(OUT)) {
  console.error('refusing: OUT is an HTML path (' + OUT + ') — this tool writes JSON only.\n' + USAGE);
  process.exit(1);
}
if (OUT === FILE) {
  console.error('refusing: OUT and FILE are the same path (' + OUT + ').\n' + USAGE);
  process.exit(1);
}

function fakeEl() {
  const t = function () {};
  return new Proxy(t, {
    get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl(); return x[p]; },
    set(x, p, v) { x[p] = v; return true; },
    apply() { return fakeEl(); },
  });
}
const html = readFileSync(FILE, 'utf8');
if (!html.includes('<script>')) {
  console.error('refusing: ' + FILE + ' contains no <script> tag — that is not the HTML build.\n' + USAGE);
  process.exit(1);
}
const a = html.indexOf('<script>'), b = html.indexOf('</script>', a);
let body = html.slice(a + 8, b);
const opener = '(function () {';
body = body.slice(body.indexOf(opener) + opener.length);
body = body.slice(0, body.lastIndexOf('})();'));
const api = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
  body + '\n;return { newGame, tick, CFG, FIGHTERS, WEAPONS, WEAPON_IDS, geom };')(
  { getElementById: () => fakeEl(), createElement: () => fakeEl(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
  { now: () => 0 }, () => 0, console);

const { newGame, tick, CFG } = api;
const CAP_SEC = 150;

function fnv32(arr) {
  let h = 0x811c9dc5;
  for (let i = 0; i < arr.length; i++) {
    const s = String(arr[i]);
    for (let j = 0; j < s.length; j++) { h ^= s.charCodeAt(j); h = Math.imul(h, 0x01000193); }
  }
  return (h >>> 0).toString(16);
}

function fingerprint(seed, weapons) {
  const G = newGame(seed, weapons ? { weapons } : undefined);
  G.audit = true;
  let t = 0;
  const maxTicks = CAP_SEC * CFG.tickHz;
  const parts = [];
  while (!G.over && t < maxTicks) {
    tick(G); t++;
    parts.push(JSON.stringify([
      G.t, G.phase, G.phaseT, G.round, G.wins, G.over, G.winner, G.roundWinner,
      G.clash, G.bounceT, G.deathSeq, G.shotSid, G.stats, G.maxSpin, G.maxDmg, G.rolls,
      G.fighters.map(f => [f.idx, f.weapon, f.hp, f.alive, f.pos.x, f.pos.y, f.vel.x, f.vel.y,
        f.wAngle, f.spin, f.dmg, f.prev.x, f.prev.y, f.pwAngle, f.bladeStuck, f.wallCd, f.deathSeq, f.fireAcc]),
      G.shots.map(s => [s.sid, s.o, s.x, s.y, s.px, s.py, s.vx, s.vy, s.r, s.speed, s.len, s.kind, s.turn, s.bounce, s.dmg, s.dead || 0]),
      G.events,
      G.auditK,
      fnv32(G.auditSubs),
    ]));
  }
  return createHash('sha256').update(parts.join('\n')).digest('hex').slice(0, 32) + ':' + t;
}

const CELLS = [
  ['hammer+dagger s5', 5, ['hammer', 'dagger']],
  ['staff+hammer s1', 1, ['staff', 'hammer']],
  ['bow+crossbow s2', 2, ['bow', 'crossbow']],
  ['boomerang+shuriken s1', 1, ['boomerang', 'shuriken']],
  ['wand+bow s3', 3, ['wand', 'bow']],
  ['shield+hammer s4', 4, ['shield', 'hammer']],
  ['natural s7', 7, null],
  ['natural s11', 11, null],
];
const out = {};
for (const [name, seed, weapons] of CELLS) {
  const t0 = Date.now();
  out[name] = fingerprint(seed, weapons);
  console.log(`  ${name.padEnd(24)} ${out[name]}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
if (COMPARE) {
  const ptrPath = join(here, 'BASELINE');
  let ptr;
  try { ptr = readFileSync(ptrPath, 'utf8').trim(); }
  catch { console.error('refusing: no .qa/BASELINE pointer file — create it naming the standing baseline (Step 1.1).'); process.exit(1); }
  const basePath = join(here, ptr);
  let base;
  try { base = JSON.parse(readFileSync(basePath, 'utf8')); }
  catch { console.error('refusing: BASELINE points at "' + ptr + '", not a readable JSON baseline (' + basePath + ').'); process.exit(1); }
  const moved = [];
  for (const [name] of CELLS) {
    const same = out[name] === base[name];
    if (!same) moved.push(name);
    console.log(`  ${same ? 'ok  ' : 'MOVED'} ${name.padEnd(24)} ${out[name]}${same ? '' : '  (baseline ' + (base[name] || 'MISSING') + ')'}`);
  }
  const match = CELLS.length - moved.length;
  const ok = moved.length === 0;
  console.log(`FINGERPRINT COMPARE: ${match}/${CELLS.length} vs ${ptr} — ${ok ? 'PASS' : 'FAIL'}`);
  console.log(JSON.stringify({ check: 'fingerprint', baseline: ptr, match, total: CELLS.length, moved, ok }));
  process.exit(ok ? 0 : 1);
}
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('written: ' + OUT);
