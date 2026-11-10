/* headless chrome check: runs BOTH script blocks of the preview with DOM
 * stubs, fires the poll interval once, and asserts the scorebug + legend
 * actually render and the fight clock (G.phaseT) really advances past the
 * reveal. Also runs the stub battle to its end for two v0.7.3 display-fix
 * guards: the sim clock freezes once the battle is over (the winner
 * overlay's battle time used to drift upward). The K.O. card and its
 * fillText guard were removed at owner word 2026-10-21 ("i dont want it to
 * be announced") — the round's end is now the kill-still freeze, the faded
 * disc and the scorebug tick; the fight-clock and battle-over guards
 * remain. Catches chrome-only breakage measure.mjs can't see.
 *
 * PAIRING section (pair-r31): the chrome is the one surface the sim-level pair-proof cannot see —
 * the scorebug names, the identity colours and the winner overlay all read the cast through
 * `G.cast[slot]`. This drives APP.setCast([1, 0]) and asserts the names/colours EXCHANGE SIDES
 * while the slot-keyed score stays put, then that setCast(null) restores the shipped pairing.
 * A cast index used where a slot was meant shows up here and nowhere else. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(process.argv[2] ? join(here, process.argv[2]) : join(here, 'previews', 'spinclash-preview.html')), 'utf8');
const blocks = [];
let i = 0;
while (true) {
  const a = html.indexOf('<script>', i);
  if (a < 0) break;
  const b = html.indexOf('</script>', a);
  blocks.push(html.slice(a + 8, b));
  i = b;
}
if (blocks.length !== 2) { console.error('expected 2 script blocks, got', blocks.length); process.exit(1); }

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
  querySelectorAll: () => [],
  addEventListener: () => {},
  activeElement: null,
  body: makeEl('body'),
};
const windowStub = { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} };
let intervalFn = null;
const setIntervalStub = (fn) => { intervalFn = fn; return 1; };
let rafFn = null;
const rafStub = (fn) => { rafFn = fn; return 1; };
const perfStub = { now: () => 0 };

/* harness stub (r88 era, 2026-11-10): the canonical draw code builds Path2D rings/rays for the
 * parry FX (drawParryFx) — Node has no canvas globals. No-op recorder: every assertion reads the
 * ctx calls, and ctx.fill/stroke swallow the path object untouched. */
globalThis.Path2D ??= class { arc() { } moveTo() { } lineTo() { } closePath() { } rect() { } };
const f1 = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console', blocks[0]);
f1(documentStub, windowStub, perfStub, rafStub, console);
const f2 = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'setInterval', 'setTimeout', 'console', blocks[1]);
f2(documentStub, windowStub, perfStub, rafStub, setIntervalStub, () => 0, console);
if (!intervalFn) { console.error('FAIL: poll interval never registered'); process.exit(1); }
const app = windowStub.APP;
// advance the real frame loop past the dice reveal so weapons get assigned,
// then poll — otherwise the legend is only ever checked in its rolling state
// (250 stub frames ≈ 4.2s ≈ 500 ticks: the reveal is 285 ticks since the
// owner's +1s tune 2026-10-19, and the fight-clock guard below wants ≥100
// fight ticks on top of it. Hitstop (same day) eats at most a hit or two of
// that slack — 60ms per stop, no hits during the reveal — the ~950ms margin
// still covers it.)
for (let i = 0; i < 250 && rafFn; i++) { const f = rafFn; rafFn = null; f(i * 16.7); }
intervalFn();
intervalFn();
const bug = els['bug'] ? els['bug'].innerHTML : '';
const lg = els['lg'] ? els['lg'].innerHTML : '';
// fight-clock guard: past the reveal (285 ticks) ~4.2s of stub frames leave
// G.phaseT well into round 1 — a frozen G.phaseT in tick() also collapses
// the weapon pop-in ramp to 12.5% (tiny-sprite bug, 2026-10-16). This guard
// read the chrome phase line until the line was removed (owner, 2026-10-19).
const Gc = app.state();
const clockOk = Gc.phase === 'fight' && Gc.phaseT >= 100;

// battle-over guard: run the stub battle to its end, then 10 more frames —
// G.t must be frozen (tick() early-returns and the frame loop skips a
// finished game). The stats line on the winner overlay reads G.t.
// Hitstop guard (owner decision 2026-10-19, trigger policy 1): over the
// battle-to-end run the frame loop must enter hitstop at least once
// (info().stopMs > 0), and G.t must NEVER advance while a freeze is in
// flight — the accumulator gate's whole contract. (The KO's long stop means
// freeze frames are guaranteed on any battle that ends in a kill.)
let stopSeen = false, stopFrozenOk = true, prevStopMs = 0, prevT = -1;
for (let i = 0; i < 40000 && rafFn && !app.state().over; i++) {
  const f = rafFn; rafFn = null; f(i * 16.7);
  const inf = app.info(), t = app.state().t;
  if (inf.stopMs > 0) stopSeen = true;
  if (prevStopMs > 0 && t !== prevT) stopFrozenOk = false;
  prevStopMs = inf.stopMs; prevT = t;
}
const stopOk = stopSeen && stopFrozenOk;
const Gend = app.state(), tEnd = Gend.t;
for (let i = 0; i < 10 && rafFn; i++) { const f = rafFn; rafFn = null; f(i * 16.7); }
const overOk = !!Gend.over && Gend.t === tEnd;

const baseOk = clockOk && overOk && stopOk && bug.includes('–') && bug.includes('Speedy') && bug.includes('Heavy') && lg.includes('ccard') && lg.includes('table') && lg.includes('qn');

/* ---- pairing: the chrome reads the cast through G.cast[slot] ---- */
// scorebug order: <side i+b> LEFT name </side> <mid>wins</mid> <side b+i> RIGHT name </side>
const names = (h) => (h.match(/<b[^>]*>([^<]*)<\/b>/g) || []).map((m) => m.replace(/<[^>]*>/g, ''));
const swatches = (h) => (h.match(/background:(#[0-9a-f]{6})/gi) || []).map((m) => m.split(':')[1].toLowerCase());
const legendNames = (h) => (h.match(/class="qn"[^>]*>([^<]*)</g) || []).map((m) => m.replace(/^.*?>/, ''));
const dNames = names(bug), dSw = swatches(bug), dLeg = legendNames(lg);

app.setCast([1, 0]);
for (let i = 0; i < 250 && rafFn; i++) { const f = rafFn; rafFn = null; f(i * 16.7); }
intervalFn(); intervalFn();
const sBug = els['bug'].innerHTML, sLg = els['lg'].innerHTML, sG = app.state();
const sNames = names(sBug), sSw = swatches(sBug), sLeg = legendNames(sLg);
const castOk = JSON.stringify(sG.cast) === '[1,0]';
// the actors EXCHANGE sides; the slot-keyed score and the mid separator do not move
const swapOk = sNames.length === 2 && sNames[0] === dNames[1] && sNames[1] === dNames[0];
// identity colour is permanent, so it travels with the actor, not with the side
const colOk = sSw.length === 2 && sSw[0] === dSw[1] && sSw[1] === dSw[0];
const legOk = sLeg.length === 2 && sLeg[0] === dLeg[1] && sLeg[1] === dLeg[0];
const scoreOk = sBug.includes('0 – 0');   // a fresh pairing starts level, on the same slot-keyed wins

// run the swapped battle out, then check the winner overlay names the ACTOR G.cast[G.winner]
for (let i = 0; i < 40000 && rafFn && !app.state().over; i++) { const f = rafFn; rafFn = null; f(i * 16.7); }
for (let i = 0; i < 10 && rafFn; i++) { const f = rafFn; rafFn = null; f(i * 16.7); }
intervalFn();
const sEnd = app.state(), wnTxt = els['wn'] ? els['wn'].textContent : '';
const expectName = sEnd.over ? app.meta.fighters[sEnd.cast[sEnd.winner]].name : null;
const winOk = !sEnd.over || wnTxt === expectName;

// setCast(null) restores the shipped default
app.setCast(null);
for (let i = 0; i < 250 && rafFn; i++) { const f = rafFn; rafFn = null; f(i * 16.7); }
intervalFn(); intervalFn();
const rBug = els['bug'].innerHTML;
const restoreOk = JSON.stringify(app.state().cast) === '[0,1]' &&
  names(rBug).join('|') === dNames.join('|') && swatches(rBug).join('|') === dSw.join('|');

const ok = baseOk && castOk && swapOk && colOk && legOk && scoreOk && winOk && restoreOk;
console.log((ok ? 'PASS' : 'FAIL') + ' chrome: bug=' + bug.length + 'B legend=' + lg.length + 'B clock=' + clockOk + ' over=' + overOk + ' hitstop=' + stopOk + ' (seen=' + stopSeen + ' frozen=' + stopFrozenOk + ')');
console.log((ok ? 'PASS' : 'FAIL') + ' pairing: cast=' + castOk + ' namesSwap=' + swapOk + ' colsSwap=' + colOk + ' legendSwap=' + legOk + ' scoreSlotKeyed=' + scoreOk + ' winnerNamesActor=' + winOk + ' restore=' + restoreOk);
console.log('       default ' + dNames.join(' / ') + ' [' + dSw.join(' ') + ']  ->  swapped ' + sNames.join(' / ') + ' [' + sSw.join(' ') + ']' + (expectName ? '  winner overlay "' + wnTxt + '" = cast[' + sEnd.winner + '] ' + expectName : ''));
if (!ok) {
  console.log('bug:', bug.slice(0, 120)); console.log('legend:', lg.slice(0, 200));
  if (!baseOk) console.log('  (base chrome checks failed)');
  else console.log('  pairing detail:', JSON.stringify({ castOk, swapOk, colOk, legOk, scoreOk, winOk, restoreOk, dNames, sNames, dSw, sSw, dLeg, sLeg, wnTxt, expectName }));
  process.exit(1);
}
