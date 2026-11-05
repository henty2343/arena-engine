/* .qa/flipproof.mjs — proof for the edge-leading flip TRANSITION (owner
 * decision 2026-10-22, replacing the glint: "i thought something else, like
 * a fast transition not an instant snap"). NOT measure.mjs. Seconds.
 *
 * The trade (disclosed, owner-accepted, recorded in GAMES.md): for ~CFG.flipMs
 * after a flagged parry the DRAWN art eases old → edge-on → mirrored
 * (l · cos(π·p)) while the sim's hitbox is already at its new true pose.
 * This probe pins the renderer side:
 *   T1 the transition happens — the displayed factor leaves ±1 only for the
 *      flagged fighter, only after its side's first flagged parry, passes
 *      through near edge-on (|cur| ≤ 0.3), and lands on EXACTLY the opposite
 *      ±1 within the frame budget (no permanent squash, no drift);
 *   T2 the unflagged side (and an all-unflagged control battle) never leaves
 *      ±1 — non-vacuity: the sim scan proves both battles really parry;
 *   T3 the bell snap — round rolls never animate (resetFx snaps): no |cur|<1
 *      is observed before the first flagged parry;
 *   T4 the window is bounded — per sweep (a mid-sweep re-parry concatenates a
 *      second continuous sweep: two clangs = two flips), excluding hitstop-
 *      frozen frames (the transition clock freezes with the frame by design).
 * The sim side (leadFlip binary, events, audits) is proven by leadproof +
 * the fingerprint ritual (renderer-only ⇒ 8/8 byte-identical).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(process.argv[2] ? join(here, '..', process.argv[2]) : join(here, '..', 'uploads', 'spinclash-preview.html'));
const html = readFileSync(FILE, 'utf8');
const blocks = [];
{ let i = 0; while (true) { const a = html.indexOf('<script>', i); if (a < 0) break; const b = html.indexOf('</script>', a); blocks.push(html.slice(a + 8, b)); i = b; } }

let fail = 0;
const chk = (ok, msg) => { console.log((ok ? 'ok  ' : 'FAIL') + '  ' + msg); if (!ok) fail = 1; };

/* ---------- Part A: sim scan (non-vacuity + the first flagged parry) ---------- */
function fakeEl2() {
  const t = function () {};
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
  { getElementById: () => fakeEl2(), createElement: () => fakeEl2(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null },
  { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
  { now: () => 0 }, () => 0, console);
const { newGame, tick, CFG, WEAPONS } = sim;

const FRAME_MS = 16.7;
const FLAG_SEED = Number(process.argv[3] || 2);    // natural s2: flail+javelin — the javelin's headLead drives the flagged side (s11 retired at the tome merge: the pool-20 re-roll landed it on shield+knives, no flagged weapon)
const CTRL_SEED = Number(process.argv[4] || 4);    // natural s4: crossbow+wand — no flagged weapon in ANY rolled round at pool 20 (s7 → s1 → s4: each roster growth re-rolls the naturals; Part A's rollsFlagged assertion below is the tripwire that catches the next re-roll)
function scan(seed, frames) {
  const G = newGame(seed);
  let t = 0; const maxT = Math.round(frames * FRAME_MS * CFG.tickHz / 1000);
  let parries = 0, firstFlaggedParry = { tick: Infinity, side: -1 };
  while (!G.over && t < maxT) {
    tick(G); t++;
    for (const e of G.events) if (e.kind === 'parry') {
      parries++;
      const sides = [(WEAPONS[e.aW].lead || WEAPONS[e.aW].headLead) ? 0 : -1, (WEAPONS[e.bW].lead || WEAPONS[e.bW].headLead) ? 1 : -1];   // flagged = EITHER mirror trait (the headLead blind spot is what broke this probe at the tome merge)
      for (const s of sides) if (s >= 0 && e.tick < firstFlaggedParry.tick) firstFlaggedParry = { tick: e.tick, side: s };
    }
    G.events.length = 0;
  }
  const rollsFlagged = G.rolls.some(r => r.w.some(w => WEAPONS[w].lead || WEAPONS[w].headLead));
  return { parries, firstFlaggedParry, rolls: G.rolls.map(r => r.w), rollsFlagged };
}
const A = scan(FLAG_SEED, 9000), C = scan(CTRL_SEED, 6000);
console.log(`sim scan: s${FLAG_SEED} rolls ${JSON.stringify(A.rolls)} — ${A.parries} parries, first flagged at tick ${A.firstFlaggedParry.tick} (side ${A.firstFlaggedParry.side})`);
console.log(`          s${CTRL_SEED} rolls ${JSON.stringify(C.rolls)} — ${C.parries} parries, none flagged`);
chk(A.parries > 0 && A.firstFlaggedParry.side >= 0, 'T2a flagged battle really parries with a lead weapon (non-vacuous)');
chk(C.parries > 0 && !C.rollsFlagged, 'T2b control battle really parries with NO flagged weapon in any rolled round (rollsFlagged = the pool-growth tripwire)');

/* ---------- Part B: the real frame loop ---------- */
function fakeCtx() {
  return new Proxy(function () {}, {
    get(t, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in t)) t[p] = fakeCtx(); return t[p]; },
    set(t, p, v) { t[p] = v; return true; },
    apply() { return fakeCtx(); },
  });
}
const els = {};
function makeEl(id) {
  return {
    id, innerHTML: '', textContent: '', value: '', hidden: true, width: 0, height: 0,
    style: {}, dataset: {},
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {}, blur() {}, focus() {},
    setAttribute() {}, getAttribute() { return null; },
    getContext() { return fakeCtx(); },
  };
}
const documentStub = {
  getElementById: (id) => (els[id] ||= makeEl(id)),
  createElement: () => makeEl('offscreen'),
  querySelectorAll: () => [], addEventListener: () => {}, activeElement: null, body: makeEl('body'),
};
const windowStub = { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} };
function bootApp() {
  for (const k of Object.keys(els)) delete els[k];
  let rafFn = null;
  const rafStub = (fn) => { rafFn = fn; return 1; };
  const f1 = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console', blocks[0]);
  f1(documentStub, windowStub, { now: () => 0 }, rafStub, console);
  const f2 = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'setInterval', 'setTimeout', 'console', blocks[1]);
  f2(documentStub, windowStub, { now: () => 0 }, rafStub, () => 1, () => 0, console);
  return { app: windowStub.APP, step(i) { const f = rafFn; rafFn = null; if (f) f(i * FRAME_MS); return !!f; } };
}

/* --- the flagged battle: shape, bounds, bell snap, control side --- */
{
  const { app, step } = bootApp();
  app.restart(FLAG_SEED);
  const side = A.firstFlaggedParry.side, other = 1 - side;
  let episodes = 0, animFrames = 0, edgeOnSeen = false, landedExact = 0, before = true;
  let prevAnimating = false, maxEpisode = 0, epLen = 0, epSweeps = 0, prevInZone = false, maxSweeps = 1, epFrozen = 0;
  const singleBudget = Math.ceil(CFG.flipMs / FRAME_MS) + 2;   // one sweep; a mid-sweep re-parry CONCATENATES a second continuous sweep (two clangs = two flips), so the episode budget is per sweep
  const minFrameForParry = Math.floor(A.firstFlaggedParry.tick / (FRAME_MS * CFG.tickHz / 1000)) - 3;   // ~2 sim ticks per frame, minus slack
  let signBefore = null, signAfter = null;
  for (let i = 0; i < 9000; i++) {
    if (!step(i)) break;
    const inf = app.info();
    const cur = inf.flip[side], oth = inf.flip[other];
    if (Math.abs(oth) !== 1) chk(false, `T2 unflagged side left ±1 (${oth}) at frame ${i}`);
    const animating = Math.abs(cur) < 1;
    if (animating) {
      if (before && i < minFrameForParry) chk(false, `T3 transition before the first flagged parry (frame ${i} < ${minFrameForParry})`);
      before = false;
      animFrames++; epLen++;
      if (inf.stopMs > 0) epFrozen++;   // a hitstop overlapping the sweep freezes the transition clock with the frame (by design) — frozen frames extend the episode but are not sweep time
      const inZone = Math.abs(cur) <= 0.3;
      if (inZone) { edgeOnSeen = true; if (!prevInZone) epSweeps++; }   // each edge-on entry = one sweep
      prevInZone = inZone;
      if (signBefore === null) signBefore = -Math.sign(cur) || 1;
    } else {
      if (prevAnimating) {   // episode just ended
        episodes++;
        chk(epLen - epFrozen <= epSweeps * singleBudget, `T4 episode ${episodes}: ${epLen} frames (${epFrozen} hitstop-frozen) ≤ ${epSweeps} sweep(s) × ${singleBudget}`);
        if (epLen > maxEpisode) maxEpisode = epLen;
        if (epSweeps > maxSweeps) maxSweeps = epSweeps;
        if (Math.abs(cur) === 1) { landedExact++; signAfter = Math.sign(cur); }
        epLen = 0; epSweeps = 0; epFrozen = 0; prevInZone = false;
      }
      if (cur !== 1 && cur !== -1) chk(false, `T1 flagged side at rest is not exactly ±1 (${cur}) at frame ${i}`);
    }
    prevAnimating = animating;
    if (app.state().over) break;
  }
  chk(episodes > 0, `T1 transitions observed (${episodes} episodes, ${animFrames} animating frames)`);
  chk(edgeOnSeen, 'T1 passes through near edge-on (|cur| ≤ 0.3)');
  chk(landedExact === episodes, `T1 every episode lands on exactly ±1 (${landedExact}/${episodes})`);
  console.log(`     (T4: max episode ${maxEpisode} frames, max sweeps in one episode ${maxSweeps}, per-sweep budget ${singleBudget} at flipMs ${CFG.flipMs})`);
  chk(signAfter === -signBefore || episodes > 1, `T1 the flip really re-presents (sign ${signBefore} → ${signAfter})`);
}

/* --- the control battle: the displayed factor is ALWAYS exactly ±1 --- */
{
  const { app, step } = bootApp();
  app.restart(CTRL_SEED);
  let minAbs = 1;
  for (let i = 0; i < 6000; i++) {
    if (!step(i)) break;
    const inf = app.info();
    minAbs = Math.min(minAbs, Math.abs(inf.flip[0]), Math.abs(inf.flip[1]));
    if (app.state().over) break;
  }
  chk(minAbs === 1, `T2 control battle never animates (min |cur| ${minAbs})`);
}

console.log(fail ? 'FLIPPROOF: FAIL' : 'FLIPPROOF: ALL PASS — the transition animates flagged parries only, passes through edge-on, lands exactly, stays inside its window, and never touches unflagged weapons or round rolls');
process.exit(fail);
