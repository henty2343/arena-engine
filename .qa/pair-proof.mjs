/* .qa/pair-proof.mjs — proves the PAIRING STEP (pair-r31) is live, inert by default, and honest.
 *
 * Why this file exists: the standing fingerprint suite proves the SHIPPED pairing [0, 1] did not
 * move (8/8 vs .qa/archive/fp-stall-r25.json). That is exactly the half of this change it is blind to —
 * fingerprints run the default cast, where `f.slot` and `f.idx` hold the same number, so a
 * slot/idx mix-up that only shows when they DIFFER cannot appear in them. This probe is the other
 * half: it runs pairings where slot !== idx and checks the invariants the whole split rests on.
 *
 *   A  default is inert      — newGame(seed) === newGame(seed, {cast:[0,1]}); a null/undefined cast
 *                               also means "the default", which is what APP.setCast(null) relies on
 *   B  the split is real     — under [1, 0], fighters[0] is {idx:1, slot:0}: identity and side are
 *                               different numbers, and each array reads the one it means
 *   C  skills travel ACTOR   — SKILL_SHORT / COLS follow f.idx, so Heavy keeps his label and his
 *                               colour on the left; no skill reaches into a trait (nocombo-r34): SPAWN / the roll / the direction sign follow
 *                               f.slot
 *   D  the foe invariant     — fs[f.slot] === f and fs[1 - f.slot] is the other one, every tick of
 *                               every swept battle. Everything that says "the opponent" reduces to
 *                               this, so it is swept rather than spot-checked.
 *   E  events carry SLOTS    — every hit/swat/shotFire/ko actor ref is a valid slot, `to` is the
 *                               foe's slot, and `st.o` indexes fs. The renderer keys flashV and
 *                               koStill.pose off these, so a cast index here would alias two actors
 *                               into one scratch slot — the bug this split could have introduced.
 *                               Swept on battles that really finish, so the ko path is not vacuous.
 *   F  the pairing bites     — the damage rate PER HIT (weapon trait + skill) travels with the
 *                               actor and exchanges sides under the swap. Measured, not assumed.
 *   G  guards fire           — wrong length, out-of-range, non-integer and non-array casts are all
 *                               construction errors; the shipped DEFAULT_CAST is not.
 *   H  mirror is legal       — [0, 0] constructs and fights (the same bot on both sides); nothing
 *                               needs the two cast entries to differ
 *   I  the RENDERER agrees   — sections A-H are all sim-level, and that blind spot shipped a real
 *                               bug: the VS-poster reveal and the shot sigils read COLS/TINTS/
 *                               FIGHTERS by the poster half and by `st.o`, which are SLOTS, so a
 *                               swapped pairing named and coloured the wrong bot. Caught by the r32
 *                               review, not by any proof. So this section drives the REAL frame loop
 *                               against a recording canvas and asserts the poster's text follows
 *                               G.cast, plus a static tripwire over every cast-table index in the file.
 *
 * Vacuity rule (house): sections E and F assert their own sample sizes. If a future build stalls
 * the seeds they use, these FAIL rather than passing on zero observations.
 *
 * Read-only: writes nothing, runs no measure.mjs. Tier 0 (~25s).
 * Usage: node .qa/pair-proof.mjs [file=previews/spinclash-preview.html]
 */
import { readFileSync } from 'node:fs';
const FILE = process.argv[2] || 'previews/spinclash-preview.html';
const html = readFileSync(FILE, 'utf8');
const A = html.indexOf('<script>'), B = html.indexOf('</script>', A);
const base = html.slice(A + 8, B);
const op = '(function () {';
const core = base.slice(base.indexOf(op) + op.length, base.lastIndexOf('})();'));
/* harness stub (r88 era, 2026-11-10): Path2D recorder for the renderer-driven sections (parry FX
 * builds rings/rays on Path2D) — same as chromecheck. */
globalThis.Path2D ??= class { arc() { } moveTo() { } lineTo() { } closePath() { } rect() { } };
const fake = () => new Proxy(function () { }, { get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fake(); return x[p]; }, set(x, p, v) { x[p] = v; return true; }, apply() { return fake(); } });
const ARGS = { getElementById: () => fake(), createElement: () => fake(), querySelectorAll: () => [], addEventListener: () => { }, activeElement: null };
const WIN = { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => { } };
const load = () => new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
  core + `\n;return {WEAPONS,WEAPON_IDS,FIGHTERS,newGame,tick,SPAWN,COLS,SKILL_SHORT,DEFAULT_CAST,checkCast};`
)(ARGS, WIN, { now: () => 0 }, () => 0, console);

let pass = 0, fail = 0;
const ok = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${d ? '  — ' + d : ''}`); };

/* A recording 2d context: captures (fillStyle, text, x, y) for every fillText and no-ops the rest.
 * `measureText` returns a real width so the poster's centring arithmetic takes its measured branch
 * rather than the headless fallback — the same branch a browser takes. */
function recCtx(sink) {
  const t = { fillStyle: '#000', strokeStyle: '#000', globalAlpha: 1, font: '', textAlign: '', textBaseline: '', lineWidth: 1, lineJoin: '', lineCap: '', letterSpacing: '0px', globalCompositeOperation: 'source-over' };
  return new Proxy(t, {
    get(x, p) {
      if (p === 'fillText') return (txt, xx, yy) => { sink.push({ fs: String(x.fillStyle), t: String(txt), x: xx, y: yy }); };
      if (p === 'strokeText') return () => { };
      if (p === 'measureText') return () => ({ width: 100 });
      // r88 era stub: medal/reveal art calls gradient builders — a bare no-op would return undefined
      if (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient') return () => ({ addColorStop() { } });
      if (p in x) return x[p];
      return () => { };
    },
    set(x, p, v) { x[p] = v; return true; },
  });
}
/* Load block 1 with the recording canvas and a CAPTURED requestAnimationFrame, so the real frame
 * loop can be driven by hand (the same trick chromecheck uses). Returns { app, step }. */
function loadRenderer() {
  const sink = [];
  const main = recCtx(sink);
  const off = recCtx([]);
  const el = (id) => ({ id, style: {}, dataset: {}, width: 0, height: 0, hidden: true, innerHTML: '', textContent: '', value: '', classList: { toggle() { }, add() { }, remove() { } }, addEventListener() { }, blur() { }, focus() { }, setAttribute() { }, getAttribute: () => null, getContext: () => (id === 'c' ? main : off) });
  const doc = { getElementById: (id) => el(id), createElement: () => el('offscreen'), querySelectorAll: () => [], addEventListener() { }, activeElement: null, body: el('body') };
  const win = { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener() { } };
  let raf = null;
  new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console', core)(
    doc, win, { now: () => 0 }, (fn) => { raf = fn; return 1; }, console);
  return { app: win.APP, sink, step(n) { for (let i = 0; i < n && raf; i++) { const f = raf; raf = null; f(i * 16.7); } } };
}
const api = load();
const { WEAPONS, FIGHTERS, newGame, tick, SPAWN, COLS, SKILL_SHORT, DEFAULT_CAST, checkCast } = api;

/* One battle, fully instrumented. Growth is summed as POSITIVE deltas only, which survives the
 * per-round reset (a reset is a negative delta) and never assumes a base value. */
function battle(seed, cast, weapons, budget) {
  const g = newGame(seed, { cast: cast, weapons: weapons || null });
  const hits = [0, 0], growth = [0, 0], prev = [null, null], kos = [];
  const bad = { foe: 0, ref: 0, to: 0, owner: 0, rollw: 0, dir: 0 };
  let t = 0;
  for (; t < budget && !g.over; t++) {
    tick(g);
    const fs = g.fighters;
    for (const f of fs) { if (fs[f.slot] !== f || fs[1 - f.slot] === f) bad.foe++; }
    if (g.phase === 'fight' && g.phaseT === 1 && Math.sign(fs[0].spin) === Math.sign(fs[1].spin)) bad.dir++;
    for (const e of g.events) {
      if (e.kind === 'hit') {
        hits[e.by]++;
        if (!(e.by === 0 || e.by === 1) || !(e.to === 0 || e.to === 1)) bad.ref++;
        else if (e.to !== 1 - e.by) bad.to++;
      } else if (e.kind === 'swat' || e.kind === 'shotFire' || e.kind === 'wall' || e.kind === 'shotRim') {
        if (!(e.by === 0 || e.by === 1)) bad.ref++;
      } else if (e.kind === 'ko') {
        kos.push([e.winner, e.loser]);
        if (!(e.winner === 0 || e.winner === 1) || !(e.loser === 0 || e.loser === 1)) bad.ref++;
        else if (e.loser !== 1 - e.winner) bad.to++;
      } else if (e.kind === 'roll') {
        const rolled = [e.w0, e.w1];   // the roll event is slot-ordered: w0 -> slot 0, w1 -> slot 1
        for (const f of fs) if (f.weapon !== rolled[f.slot]) bad.rollw++;
      }
    }
    for (const st of g.shots) if (!(st.o === 0 || st.o === 1) || !fs[st.o]) bad.owner++;
    for (let s = 0; s < 2; s++) {
      const d = fs[s].dmg;
      if (prev[s] !== null && d > prev[s]) growth[s] += d - prev[s];
      prev[s] = d;
    }
  }
  return {
    g, ticks: t, over: g.over, hits, growth, kos, bad,
    winner: g.winner, wins: g.wins.slice(), castOf: g.cast.slice(),
  };
}

console.log('pair-r31 probe — the pairing step');

/* ---- A. the default pairing is inert -------------------------------------------- */
console.log('\nA  the shipped default is inert');
ok('DEFAULT_CAST is [0, 1] — the pairing every battle so far has played',
  JSON.stringify(DEFAULT_CAST) === '[0,1]', `DEFAULT_CAST ${JSON.stringify(DEFAULT_CAST)}`);
{
  const g1 = newGame(4242), g2 = newGame(4242, { cast: [0, 1] });
  let same = true, firstDiff = '';
  for (let t = 0; t < 2500 && same; t++) {
    tick(g1); tick(g2);
    for (let i = 0; i < 2; i++) {
      const a = g1.fighters[i], b = g2.fighters[i];
      if (a.pos.x !== b.pos.x || a.pos.y !== b.pos.y || a.spin !== b.spin || a.dmg !== b.dmg ||
        a.hp !== b.hp || a.weapon !== b.weapon || a.lenStep !== b.lenStep) {
        same = false; firstDiff = `tick ${t} fighter ${i}`; break;
      }
    }
    if (g1.over !== g2.over) { same = false; firstDiff = `over flag at tick ${t}`; }
  }
  ok('newGame(seed) and newGame(seed, {cast:[0,1]}) replay identically (2500 ticks, exact float)',
    same, same ? `no difference in pos/spin/dmg/hp/weapon/lenStep/over through tick ${g1.t}` : `first difference: ${firstDiff}`);
}
{
  const g = newGame(7);
  ok('G.cast is present, slot-ordered, and G.cast[slot] is the only slot->idx map',
    Array.isArray(g.cast) && g.cast.length === 2 && g.fighters.every((f, s) => g.cast[s] === f.idx),
    `cast ${JSON.stringify(g.cast)} vs fighters idx ${g.fighters.map(f => f.idx).join(',')}`);
  ok('newGame snapshots the cast, so a caller mutating its own array cannot reach into the game',
    (() => { const c = [0, 1]; const g2 = newGame(7, { cast: c }); c[0] = 1; return g2.cast[0] === 0; })(),
    'cast is copied at construction');
  ok('an omitted / undefined / null cast all mean "the default" (APP.setCast(null) relies on this)',
    JSON.stringify(newGame(7).cast) === '[0,1]' &&
    JSON.stringify(newGame(7, { cast: undefined }).cast) === '[0,1]' &&
    JSON.stringify(newGame(7, { cast: null }).cast) === '[0,1]',
    'all three resolve to DEFAULT_CAST rather than throwing');
}

/* ---- B/C. under a swapped pairing, identity and side are different numbers ------- */
console.log('\nB  the slot/idx split is real (cast [1, 0])');
{
  const g = newGame(99, { cast: [1, 0] });
  const [L, R] = g.fighters;
  ok('fighters[0] = { idx: 1, slot: 0 } — the second cast member playing the LEFT side',
    L.idx === 1 && L.slot === 0, `idx ${L.idx} slot ${L.slot} (${FIGHTERS[L.idx].name})`);
  ok('fighters[1] = { idx: 0, slot: 1 }', R.idx === 0 && R.slot === 1,
    `idx ${R.idx} slot ${R.slot} (${FIGHTERS[R.idx].name})`);
  ok('fighters[] stays SLOT-ordered, so fs[0]/fs[1] and `1 - f.slot` still mean left/right',
    g.fighters.every((f, s) => f.slot === s), `slots ${g.fighters.map(f => f.slot).join(',')}`);
  ok('SPAWN follows the SLOT: each fighter starts on its own side whatever cast fills it',
    L.pos.x === SPAWN[0].x && L.pos.y === SPAWN[0].y && R.pos.x === SPAWN[1].x && R.pos.y === SPAWN[1].y,
    `slot 0 at (${L.pos.x},${L.pos.y}) = SPAWN[0]; slot 1 at (${R.pos.x},${R.pos.y}) = SPAWN[1]`);
}

console.log('\nC  skills and colours travel with the ACTOR, not the side');
{
  const g = newGame(99, { cast: [1, 0] });
  const [L, R] = g.fighters;
  ok('no skill reaches into a trait: lenSteps is GONE from every skill object (nocombo-r34)',
    FIGHTERS.every(f => !('lenSteps' in (f.skill || {}))),
    FIGHTERS.map(f => `${f.name}: ${Object.keys(f.skill).join('+')}`).join(' · ') + ' — the cap is uniform at LEN_STEPS, so there is no per-actor cap left to travel');
  ok('COLS follows f.idx: identity colour is permanent, so the left body now wears the other colour',
    COLS[L.idx] === '#ff6b4a' && COLS[R.idx] === '#a8892f',
    `slot 0 wears ${COLS[L.idx]} (${FIGHTERS[L.idx].name}); slot 1 wears ${COLS[R.idx]} (${FIGHTERS[R.idx].name})`);
  ok('SKILL_SHORT follows f.idx: the legend row reads its own actor\'s label on either side',
    SKILL_SHORT[L.idx] === '+DMG / Hit' && SKILL_SHORT[R.idx] === '+SPD / Hit',
    `slot 0 "${SKILL_SHORT[L.idx]}"; slot 1 "${SKILL_SHORT[R.idx]}"`);
  ok('G.cast[slot] resolves back to the actor that side is playing',
    FIGHTERS[g.cast[0]].id === 'heavy' && FIGHTERS[g.cast[1]].id === 'speedy',
    `cast ${JSON.stringify(g.cast)} -> ${g.cast.map(c => FIGHTERS[c].id).join(' / ')}`);
}

/* ---- D/E. swept invariants ------------------------------------------------------ */
console.log('\nD+E  swept invariants (the foe lookup, the roll order, and every event actor ref)');
{
  /* Sweep 1: NATURAL rolls, so the weapon mix (and the shot paths) varies. Stalls are deliberate
   * in this build (owner law), so this sweep buys coverage, not decisions. */
  const NAT = [3, 11, 27, 64, 130];
  let ticks = 0, hits = 0, kos = 0;
  const bad = { foe: 0, ref: 0, to: 0, owner: 0, rollw: 0, dir: 0 };
  for (const sd of NAT) for (const cast of [[1, 0], [0, 0]]) {
    const r = battle(sd, cast, null, 4000);
    ticks += r.ticks; hits += r.hits[0] + r.hits[1]; kos += r.kos.length;
    for (const k of Object.keys(bad)) bad[k] += r.bad[k];
  }
  /* Sweep 2: FORCED mirror hammers on seeds verified to finish, so the ko / battleWin / winner
   * path is actually exercised. Without this, sweep 1 reports 0 kos and those checks are vacuous.
   * Re-seeded at bindfix-r35 (was [1, 4]): the bind fix shifted chaotic battle lengths and both old
   * seeds' swapped casts landed in the DELIBERATE stall class (2/4 decided), which the vacuity
   * assertion below correctly FAILED rather than passing on a thin sample. [4, 21] verified on the
   * landed build: all four battles decide (9844/14672 and 12632/10534 ticks). */
  const FIN = [4, 21];
  let fTicks = 0, fHits = 0, fKos = 0, fOver = 0, fBattles = 0, winnerBad = 0;
  const fbad = { foe: 0, ref: 0, to: 0, owner: 0, rollw: 0, dir: 0 };
  for (const sd of FIN) for (const cast of [[0, 1], [1, 0]]) {
    const r = battle(sd, cast, ['hammer', 'hammer'], 18000);
    fBattles++; fTicks += r.ticks; fHits += r.hits[0] + r.hits[1]; fKos += r.kos.length;
    if (r.over) {
      fOver++;
      if (!(r.winner === 0 || r.winner === 1)) winnerBad++;
      else if (r.castOf[r.winner] === undefined) winnerBad++;
      else if (r.wins[r.winner] < r.wins[1 - r.winner]) winnerBad++;
    }
    for (const k of Object.keys(fbad)) fbad[k] += r.bad[k];
  }
  const tot = { ...bad }; for (const k of Object.keys(fbad)) tot[k] += fbad[k];
  ok('fs[f.slot] === f and fs[1 - f.slot] is the OTHER fighter, every tick of every battle',
    tot.foe === 0, `${ticks + fTicks} ticks swept (${NAT.length * 2} natural battles + ${fBattles} finishing), ${tot.foe} violations`);
  ok('every event actor ref (hit/swat/shotFire/wall/shotRim .by, hit.to, ko.winner/loser) is a SLOT',
    tot.ref === 0, `${hits + fHits} hits, ${kos + fKos} kos across both sweeps — ${tot.ref} out-of-range refs`);
  ok('the victim is always the other side: hit.to === 1 - hit.by, ko.loser === 1 - ko.winner',
    tot.to === 0, `${tot.to} violations — the invariant flashV[e.to] and koStill.pose[e.to] rely on`);
  ok('every in-flight shot\'s owner st.o indexes fs (fs[st.o] and fs[1 - st.o] are live reads)',
    tot.owner === 0, `${tot.owner} bad owners`);
  ok('each fighter wears the weapon the roll gave its SLOT (w0 -> slot 0, w1 -> slot 1)',
    tot.rollw === 0, `${tot.rollw} mismatches across round rolls`);
  ok('rule 6 holds per SIDE under every pairing: slot 0 and slot 1 open counter-rotating',
    tot.dir === 0, `${tot.dir} same-sign openings`);
  ok('SAMPLE IS REAL: the finishing sweep produced K.O.s, so the ko/winner checks above are not vacuous',
    fKos > 0 && fOver === fBattles, `${fKos} kos in ${fBattles} battles, ${fOver}/${fBattles} reached a decision (${fTicks} ticks)`);
  ok('G.winner is a slot, G.cast[G.winner] resolves, and it really holds the round wins',
    winnerBad === 0 && fOver > 0, `${winnerBad} bad winners of ${fOver} finished battles`);
}

/* ---- F. the pairing is load-bearing --------------------------------------------- */
console.log('\nF  the pairing bites (measured, not assumed)');
{
  /* Forced mirror hammers remove the weapon from the comparison: both slots carry the SAME trait,
   * so any difference in damage-per-hit is the ACTOR's skill. Predicted from the rows:
   *   rate = WEAPONS.hammer.trait.dmg + FIGHTERS[idx].skill.dmg
   * Heavy 0.9, Speedy 0.0 — so 1.6 follows Heavy to whichever slot he occupies. */
  const traitDmg = WEAPONS.hammer.trait.dmg;
  const rate = (r, s) => (r.hits[s] ? r.growth[s] / r.hits[s] : NaN);
  const SEED = 7;   // re-seeded at bindfix-r35 (was 1): seed 1's mirror-hammer battles both stall at the budget now (deliberate stall class), making the "genuinely different battle" assert vacuous; seed 7 decides on both casts AND exchanges the winner (2-0 / 0-2), the strongest form of "the cast is not dead weight"
  const def = battle(SEED, [0, 1], ['hammer', 'hammer'], 18000);
  const swp = battle(SEED, [1, 0], ['hammer', 'hammer'], 18000);
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  ok('both pairings land hits on BOTH sides, so a per-hit rate is measurable (not 0/0)',
    def.hits[0] > 0 && def.hits[1] > 0 && swp.hits[0] > 0 && swp.hits[1] > 0,
    `default hits ${def.hits.join('/')}, swapped hits ${swp.hits.join('/')}`);
  ok('damage-per-hit = the weapon trait + the ACTOR\'s skill.dmg, exactly, on the default pairing',
    near(rate(def, 0), traitDmg + FIGHTERS[0].skill.dmg) && near(rate(def, 1), traitDmg + FIGHTERS[1].skill.dmg),
    `slot 0 (Speedy) ${rate(def, 0).toFixed(2)}/hit, slot 1 (Heavy) ${rate(def, 1).toFixed(2)}/hit; hammer trait.dmg ${traitDmg}`);
  ok('and the rates EXCHANGE SIDES under the swap — the skill travels with the actor',
    near(rate(swp, 0), traitDmg + FIGHTERS[1].skill.dmg) && near(rate(swp, 1), traitDmg + FIGHTERS[0].skill.dmg),
    `swapped: slot 0 (now Heavy) ${rate(swp, 0).toFixed(2)}/hit, slot 1 (now Speedy) ${rate(swp, 1).toFixed(2)}/hit`);
  ok('a swapped pairing is a genuinely different battle on the same seed (the cast is not dead weight)',
    def.ticks !== swp.ticks || def.wins.join() !== swp.wins.join(),
    `default ran ${def.ticks} ticks, wins ${def.wins.join('-')}, winner slot ${def.winner}; swapped ran ${swp.ticks} ticks, wins ${swp.wins.join('-')}, winner slot ${swp.winner}`);
}

/* ---- G. the guard fires --------------------------------------------------------- */
console.log('\nG  GUARDS FIRE (a guard that never throws reads as coverage and is worse than none)');
{
  const bad = [
    [[0], 'one entry'],
    [[0, 1, 1], 'three entries'],
    [[], 'empty'],
    [[5, 0], 'index past the cast'],
    [[0, -1], 'negative index'],
    [[0.5, 1], 'non-integer index'],
    ['01', 'a string, not an array'],
    [[0, undefined], 'an undefined entry'],
    [[true, false], 'booleans'],
  ];
  let threw = 0; const msgs = [];
  for (const [c, label] of bad) {
    let err = null;
    try { newGame(1, { cast: c }); } catch (e) { err = e; }
    if (err) { threw++; msgs.push(`${label}: ${String(err.message).slice(0, 62)}`); }
    else console.log(`  FAIL   cast ${label} was ACCEPTED — ${JSON.stringify(c)}`);
  }
  ok(`all ${bad.length} malformed casts are construction errors`, threw === bad.length, `${threw}/${bad.length} threw`);
  console.log(msgs.slice(0, 3).map(m => `       · ${m}`).join('\n'));
  let bootThrew = false;
  try { checkCast([9, 9]); } catch (e) { bootThrew = true; }
  ok('checkCast rejects an out-of-range pairing on its own (boot validates DEFAULT_CAST with it)',
    bootThrew, 'checkCast([9,9]) throws — DEFAULT_CAST is validated at load, not on first use');
  let def = true;
  try { checkCast(DEFAULT_CAST); } catch (e) { def = false; }
  ok('the shipped DEFAULT_CAST passes its own guard', def, `DEFAULT_CAST ${JSON.stringify(DEFAULT_CAST)}`);
}

/* ---- H. mirror pairing ---------------------------------------------------------- */
console.log('\nH  a mirror pairing is legal (the same cast member on both sides)');
{
  const g = newGame(555, { cast: [0, 0] });
  ok('cast [0, 0] constructs: one actor on both sides',
    g.fighters[0].idx === 0 && g.fighters[1].idx === 0 && g.fighters[0].slot === 0 && g.fighters[1].slot === 1,
    `${FIGHTERS[0].name} vs ${FIGHTERS[0].name}`);
  const r = battle(555, [0, 0], ['hammer', 'hammer'], 18000);
  ok('it fights to a decision, and the foe invariant holds when both idx are EQUAL (nothing keys the foe off idx)',
    r.bad.foe === 0 && r.over && r.ticks > 100,
    `${r.ticks} ticks, over=${r.over}, ${r.bad.foe} violations, wins ${r.wins.join('-')}, winner slot ${r.winner}`);
  ok('the mirror winner resolves to the same cast member either way (G.cast[G.winner] is well defined)',
    r.castOf[r.winner] === 0 && r.castOf[1 - r.winner] === 0,
    `cast ${JSON.stringify(r.castOf)}, winner slot ${r.winner} -> ${FIGHTERS[r.castOf[r.winner]].id}`);
}

/* ---- I. the renderer agrees with the sim ---------------------------------------- */
console.log('\nI  the RENDERER names and colours the ACTOR, not the side');
{
  /* The bug this section exists for (found by the r32 review, invisible to A-H): the VS-poster
   * reveal read COLS[i] / TINTS[i] / FIGHTERS[i] where `i` is the POSTER HALF = the slot, and the
   * shot sigils read COLS[st.o] where st.o is a slot. Under [0, 1] those coincide, so the poster was
   * right by accident. Both now go through G.cast. Drive the real loop and read what it drew. */
  const NAME_Y = 258, LINE_Y = 306;                       // VS.nameY / VS.skillY, the poster's two label rows
  const poster = (cast) => {
    const r = loadRenderer();
    r.app.setSeed(4321);                                   // same seed both ways, so only the pairing differs
    r.app.setCast(cast);
    r.step(120);                                           // ~mid-reveal: the labels draw every reveal frame
    const g = r.app.state();
    const at = (y, left) => r.sink.filter((e) => e.y === y && (left ? e.x < 500 : e.x > 500)).map((e) => e.t);
    return { g, names: [at(NAME_Y, true), at(NAME_Y, false)], lines: [at(LINE_Y, true), at(LINE_Y, false)], sink: r.sink };
  };
  const d = poster(null), w = poster([1, 0]);
  const want = (g) => [0, 1].map((sl) => FIGHTERS[g.cast[sl]].name.toUpperCase());
  ok('SAMPLE IS REAL: the recording canvas actually captured the poster\'s two name labels per half',
    d.names[0].length > 0 && d.names[1].length > 0 && w.names[0].length > 0 && w.names[1].length > 0,
    `default ${d.names[0].length}/${d.names[1].length} draws, swapped ${w.names[0].length}/${w.names[1].length} draws`);
  ok('the default pairing posters Speedy left / Heavy right',
    d.names[0][0] === 'SPEEDY' && d.names[1][0] === 'HEAVY',
    `left "${d.names[0][0]}", right "${d.names[1][0]}"`);
  ok('under cast [1, 0] the poster EXCHANGES: Heavy left / Speedy right — it names the actor, not the half',
    w.names[0][0] === 'HEAVY' && w.names[1][0] === 'SPEEDY',
    `left "${w.names[0][0]}", right "${w.names[1][0]}" (cast ${JSON.stringify(w.g.cast)})`);
  ok('the skill prose under each name travels with the same actor',
    d.lines[0][0] === FIGHTERS[0].line && d.lines[1][0] === FIGHTERS[1].line &&
    w.lines[0][0] === FIGHTERS[1].line && w.lines[1][0] === FIGHTERS[0].line,
    `default left "${String(d.lines[0][0]).slice(0, 28)}…"; swapped left "${String(w.lines[0][0]).slice(0, 28)}…"`);
  ok('both posters agree with G.cast[slot] for their own half',
    d.names[0][0] === want(d.g)[0] && d.names[1][0] === want(d.g)[1] &&
    w.names[0][0] === want(w.g)[0] && w.names[1][0] === want(w.g)[1],
    'the poster reads the pairing, not a hard-coded order');

  /* Static tripwire: the bug class is "a cast-keyed table indexed by a slot". Every index into
   * COLS/TINTS/FIGHTERS/SKILL_SHORT must be an IDENTITY. Comments are stripped first with a
   * string-aware scanner, so prose that mentions COLS[carrier] is not audited as code — an earlier
   * version of this check flagged three things that were not reads at all. */
  const stripped = (() => {
    let out = '', i = 0, mode = 0;                       // 0 code, 1 line comment, 2 block comment, 3 string
    const q = [];
    while (i < html.length) {
      const c = html[i], d = html[i + 1];
      if (mode === 0) {
        if (c === '/' && d === '/') { mode = 1; out += '  '; i += 2; continue; }
        if (c === '/' && d === '*') { mode = 2; out += '  '; i += 2; continue; }
        if (c === '"' || c === "'" || c === '`') { mode = 3; q.push(c); out += c; i++; continue; }
        out += c; i++; continue;
      }
      if (mode === 1) { if (c === '\n') { mode = 0; out += c; } else out += ' '; i++; continue; }
      if (mode === 2) { if (c === '*' && d === '/') { mode = 0; out += '  '; i += 2; continue; } out += (c === '\n' ? c : ' '); i++; continue; }
      out += c;                                           // mode 3: inside a string
      if (c === '\\') { out += html[i + 1] || ''; i += 2; continue; }
      if (c === q[q.length - 1]) { q.pop(); mode = 0; }
      i++;
    }
    return out;
  })();
  /* RE-SEEDED 2026-11-11 (session 5, menu item 3): the superseded per-line scan
   *   slines.forEach((l, n) => { for (const m of l.matchAll(/\b(?:COLS|TINTS|FIGHTERS|SKILL_SHORT)\[([^\]]*)\]/g)) ... })
   * stopped at the INNER closing bracket of nested reads, truncating the index text. That made the two
   * burnfix-r84 sites canonical :4732/:4774 — COLS[(G.fighters[p.o] or brace-fill).idx] — parse as
   * "(G.fighters[p.o" (no idx token), so the cell FAILed on CORRECT code: a false positive. The
   * replacement below is a balance-aware scan over the whole comment-stripped text: depth counter over
   * opening/closing brackets from the match start to the matching close. Strings and comments are
   * already neutralised by the stripped scanner upstream, so bracket counting is safe there.
   * reads keeps its {n, idx, line} shape; allowed() and the >=20 floor are untouched. Measured honesty
   * of the floor: 33 sites survive comment-stripping under BOTH scanners (raw canonical: 37 regex hits,
   * 4 of them inner double-counts) — >=20 holds with margin. */
  const reads = [];
  for (const m of stripped.matchAll(/\b(COLS|TINTS|FIGHTERS|SKILL_SHORT)\[/g)) {
    let depth = 1, j = m.index + m[0].length;
    while (j < stripped.length && depth > 0) {
      const ch = stripped[j];
      if (ch === '[') depth++;
      else if (ch === ']') depth--;
      j++;
    }
    if (depth !== 0) continue;                       // unbalanced tail: not a read we can vouch for
    const lnStart = stripped.lastIndexOf('\n', m.index) + 1;         // line start containing the read
    let lnEnd = stripped.indexOf('\n', j); if (lnEnd === -1) lnEnd = stripped.length;
    reads.push({ n: stripped.slice(0, m.index).split('\n').length,
                 idx: stripped.slice(m.index + m[0].length, j - 1).trim(),
                 line: stripped.slice(lnStart, lnEnd).trim() });
  }
  /* Allowed: anything naming idx or cast; `ci`, the poster half's documented actor local
   * (`const ci = G.cast[i]`); and `i` inside the roster build `FIGHTERS.map((f, i) => …)`, where
   * `i` IS the cast index because it iterates FIGHTERS itself. */
  const allowed = (r) => /idx|cast/.test(r.idx) || r.idx === 'ci' || (r.idx === 'i' && /FIGHTERS\.map/.test(r.line));
  const bad = reads.filter((r) => !allowed(r));
  ok(`every cast-keyed table read is indexed by an IDENTITY (${reads.length} code reads audited, comments stripped)`,
    bad.length === 0 && reads.length >= 20,
    bad.length ? bad.map((b) => `:${b.n} [${b.idx}] ${b.line.slice(0, 70)}`).join(' | ')
      : `all ${reads.length} index by f.idx / ci / G.cast[…] / the roster map — a slot-keyed read is what this catches`);
}

console.log(`\n${pass}/${pass + fail} passed`);
if (fail) { console.log(`${fail} FAILED`); process.exit(1); }
console.log('Read-only: nothing written, measure.mjs untouched.');
