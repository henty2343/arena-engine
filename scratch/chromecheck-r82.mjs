// chromecheck-r82 — THE EMBER SPILL in a real browser: witness drops/pops, the lane machinery GONE,
// 0 errors, frame health, build label + menu copy. Reuses the r81 harness shape (APP levers + rAF hook).
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
    window.__s = { frames: 0, emberFrames: 0, emberMax: 0, frozenFrames: 0, poolsO0: false, poolsO1: false, bothFires: 0, wispFrames: 0, burstFrames: 0 };
    window.__fr = [];
    let prev = performance.now();
    const hook = () => {
      const now = performance.now(); const d = now - prev; prev = now;
      window.__fr.push(d);
      const G = APP.state(); const s = window.__s; s.frames++;
      if (G.embers.length > 0) s.emberFrames++;
      if (G.emberFx.some(f => f.k === 1)) s.wispFrames++;
      if (G.emberFx.some(f => f.k === 0)) s.burstFrames++;
      if (G.pools.some(p => p.o === 0)) s.poolsO0 = true;
      if (G.pools.some(p => p.o === 1)) s.poolsO1 = true;
      if (G.pools.some(p => p.o === 0) && G.pools.some(p => p.o === 1)) s.bothFires++;
      s.emberMax = Math.max(s.emberMax, G.embers.length);
      requestAnimationFrame(hook);
    };
    requestAnimationFrame(hook);
    if (ff && !APP.info().fast) APP.toggleFF();
  }, force, seed, ff);
  await new Promise(r => setTimeout(r, wall));
  const report = await page.evaluate(() => {
    const scan = el => { for (const t of el.querySelectorAll('*')) if (t.scrollWidth > t.clientWidth + 2) return true; return false; };
    const fr = window.__fr;
    const G = APP.state(); const mw = APP.meta.weapons;
    return { build: document.getElementById('build').textContent, title: document.title,
      over: !document.getElementById('win').hidden,
      fullFrames: fr.filter(d => d >= 6).length, frozenFrames: fr.filter(d => d === 0).length,
      fitBad: [document.getElementById('lg'), document.getElementById('st'), document.getElementById('bug')].filter(scan).length,
      briefs: { wand: mw.wand.brief, tome: mw.tome.brief, scroll: mw.scroll.brief, staff: mw.staff.brief },
      kindlingLine: (mw.scroll.line || '').includes('SPILLS KINDLING'),
      poolLine: (mw.scroll.line || '').includes('POOL'),
      figLine: (mw.wand.line || '').includes('TRANSFIGURES'),
      laneGone: G.lanes === undefined && G.strokes === undefined && G.stats.lanes === undefined && G.stats.singes === undefined,
      mstats: { embers: G.stats.embers, emberPops: G.stats.emberPops, pools: G.stats.pools, poolBurns: G.stats.poolBurns },
      s: window.__s };
  });
  console.log(label, JSON.stringify({ over: report.over, errs: errs.slice(0, 3), ...report }));
  return { ...report, errs };
}

const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox', '--mute-audio', '--disable-dev-shm-usage'], protocolTimeout: 120000 });
const page = await browser.newPage();
page.setDefaultNavigationTimeout(120000);
const p1 = await run(page, { force: ['scroll', 'hammer'], seed: 22459, wall: 60000, ff: true }, 'P1 scroll×hammer (the ember spill: coals raining off the flight, pops, the pool beside them):');
const p2 = await run(page, { force: null, seed: 0, wall: 45000, ff: true }, 'P2 natural:');
const p3 = await run(page, { force: ['scroll', 'scroll'], seed: 777, wall: 45000, ff: true }, "P3 scroll×scroll (the owner-colour read: BOTH sides fires on the floor at once):");
await browser.close();
const ok = r => r.errs.length === 0 && r.build === 'build emberfix-r85' && r.title.includes('emberfix-r85') && r.fitBad === 0 && r.laneGone &&
  r.briefs.wand === '+SPD +FIG +HEX / Hit' && r.briefs.tome === '+SPD +TRIO +HEX / Hit' &&
  r.briefs.scroll === '+SPD +EMBER +HEX / Hit' && r.briefs.staff === '+SPD +SIZE +HEX / Hit' &&
  r.kindlingLine && r.poolLine && r.figLine;
const p1ok = p1.mstats.embers > 0 && p1.mstats.emberPops > 0 && p1.s.emberMax <= 14 && p1.s.emberMax > 4 && p1.frozenFrames < p1.s.frames * 0.5 && p1.s.wispFrames > 0 && p1.s.burstFrames > 0;
const p2ok = p2.s.frames > 100;
const p3ok = p3.s.poolsO0 && p3.s.poolsO1 && p3.s.bothFires > 0 && ok(p3);
console.log(p1ok && p2ok && p3ok && ok(p1) && ok(p2) ? 'CHROMECHECK-R82 PASS' : 'CHROMECHECK-R82 FAIL');
process.exit(p1ok && p2ok && p3ok && ok(p1) && ok(p2) ? 0 : 1);
