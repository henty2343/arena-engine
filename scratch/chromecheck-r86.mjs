// chromecheck-r86 — THE LONG CHAIN in a real browser: witness the flail's reach GROWING on canvas
// (lenStep climbs, the ball rides further out), flail×flail both growing, nunchaku never grows,
// 0 errors, frame health, build label + row copy. Reuses the r82 harness shape (APP levers + rAF hook).
import puppeteer from '/tmp/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
const URL = 'file://' + process.cwd() + '/uploads/spinclash-preview.html';

async function run(page, opts, label) {
  const { force, seed, wall, ff } = opts;
  const errs = [];
  page.removeAllListeners('pageerror'); page.removeAllListeners('console');
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate((force, seed, ff) => {
    if (force) { APP.setSeed(seed); APP.state().weapons = force; }
    window.__s = { frames: 0, growFrames: 0, maxStep: 0, earlyTip: 0, lateTip: 0, earlyN: 0, lateN: 0, bothGrow: 0, nunStepBad: 0 };
    window.__fr = [];
    let prev = performance.now();
    const hook = () => {
      const now = performance.now(); const d = now - prev; prev = now;
      window.__fr.push(d);
      const G = APP.state(); const s = window.__s; s.frames++;
      for (const f of G.fighters) {
        if (f.weapon === 'nunchaku' && f.lenStep !== 0) s.nunStepBad++;
        if (!f.fl || f.weapon !== 'flail') continue;
        s.maxStep = Math.max(s.maxStep, f.lenStep);
        if (f.lenStep >= 6) s.growFrames++;
        const np = f.fl.x.length / 1; // x is a packed array; ball = last particle
        const bx = f.fl.x[2], by = f.fl.y[2];
        if (bx === undefined) continue;
        const tip = Math.hypot(bx - f.pos.x, by - f.pos.y);
        if (f.lenStep === 0 && s.earlyN < 3000) { s.earlyTip += tip; s.earlyN++; }
        if (f.lenStep >= 8 && s.lateN < 3000) { s.lateTip += tip; s.lateN++; }
      }
      if (G.fighters[0].weapon === 'flail' && G.fighters[1].weapon === 'flail'
        && G.fighters[0].lenStep >= 4 && G.fighters[1].lenStep >= 4) s.bothGrow++;
      requestAnimationFrame(hook);
    };
    requestAnimationFrame(hook);
    if (ff && !APP.info().fast) APP.toggleFF();
  }, force, seed, ff);
  await new Promise(r => setTimeout(r, wall));
  const report = await page.evaluate(() => {
    const scan = el => { for (const t of el.querySelectorAll('*')) if (t.scrollWidth > t.clientWidth + 2) return true; return false; };
    const fr = window.__fr;
    const G = APP.state(); const mw = APP.meta.weapons; const s = window.__s;
    return { build: document.getElementById('build').textContent, title: document.title,
      fullFrames: fr.filter(d => d >= 6).length, frozenFrames: fr.filter(d => d === 0).length,
      fitBad: [document.getElementById('lg'), document.getElementById('st'), document.getElementById('bug')].filter(scan).length,
      flailBrief: mw.flail.brief, flailLine: mw.flail.line,
      earlyTip: s.earlyN ? +(s.earlyTip / s.earlyN).toFixed(1) : null,
      lateTip: s.lateN ? +(s.lateTip / s.lateN).toFixed(1) : null,
      s };
  });
  console.log(label, JSON.stringify({ errs: errs.slice(0, 3), ...report }));
  return { ...report, errs };
}

const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox', '--mute-audio', '--disable-dev-shm-usage'], protocolTimeout: 120000 });
const page = await browser.newPage();
page.setDefaultNavigationTimeout(120000);
const p1 = await run(page, { force: ['flail', 'hammer'], seed: 11, wall: 55000, ff: true }, 'P1 flail×hammer (THE LONG CHAIN: the ball rides further out as the steps climb):');
const p2 = await run(page, { force: ['flail', 'flail'], seed: 444, wall: 45000, ff: true }, 'P2 flail×flail (both chains grow — per-fighter state):');
const p3 = await run(page, { force: ['nunchaku', 'katana'], seed: 33, wall: 30000, ff: true }, 'P3 nunchaku×katana (control: the other chain weapon never grows):');
await browser.close();
let fail = 0;
if (p1.errs.length) { console.log('FAIL P1 errors'); fail++; }
if (!p1.build.includes('longchain-r86') || !p1.title.includes('longchain-r86')) { console.log('FAIL label'); fail++; }
if (p1.flailBrief !== '+DMG +LEN / Hit') { console.log('FAIL brief'); fail++; }
if (!p1.flailLine.includes('LENGTHENS')) { console.log('FAIL line copy'); fail++; }
if (!(p1.s.maxStep >= 6) || p1.s.growFrames < 100) { console.log('FAIL P1 growth witness'); fail++; }
if (!(p1.earlyTip != null && p1.lateTip != null && p1.lateTip > p1.earlyTip * 1.1)) { console.log('FAIL P1 reach witness'); fail++; }
if (p1.fitBad || p1.frozenFrames > 30) { console.log('FAIL P1 frame health'); fail++; }
if (p2.errs.length || p2.s.bothGrow < 30) { console.log('FAIL P2 both-grow'); fail++; }
if (p3.errs.length || p3.s.nunStepBad !== 0) { console.log('FAIL P3 control'); fail++; }
console.log(fail ? `CHROMECHECK-R86 FAIL (${fail})` : 'CHROMECHECK-R86 PASS · the chain grows on canvas, the control holds, 0 errors');
process.exit(fail ? 1 : 0);
