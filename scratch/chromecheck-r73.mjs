// scratch/chromecheck-r73.mjs — bloom-r73 chrome check, re-stamped emberpool-r79: P1 wand×hammer proves
// the bloom live in the browser (frames with figT>0, the rotation chain, poof rings); P2 natural proves
// the round still ends clean; P3 scroll×hammer proves THE BURNING POOL live in the browser: pools on
// the floor, burn beats dealt, the family projectile bent and hunting (renderer edits ⇒ mandatory).
// Recipe: multi-process args, protocolTimeout 120000, ONE page reused, in-page rAF hook, NUMERIC lbl asserts.
import puppeteer from 'puppeteer';
const URL = 'file://' + process.cwd() + '/uploads/spinclash-preview.html';

async function run(page, { force, seed, wall, ff }, label) {
  const errs = [];
  page.removeAllListeners('pageerror'); page.removeAllListeners('console');
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate((force, seed, ff, FAMKIND) => {
    if (force) { APP.setSeed(seed); APP.state().weapons = force; }
    window.__s = { frames: 0, bentFrames: 0, bentShots: 0, straightBad: 0, huntClose: 0, huntSamples: 0,
                   maxStep: 0, capTurn: 0, bloomFrames: 0, bloomStarts: 0, poofFrames: 0, maxFigT: 0,
                   rotChain: 0, rotBad: 0, lastObj: null, liveBloom: 0,
                   poolFrames: 0, poolMax: 0 };
    window.__last = new Map();
    window.__fr = [];
    window.__prevBloom = { 0: false, 1: false };
    let prev = performance.now();
    const hook = () => {
      const now = performance.now(); window.__fr.push(now - prev); prev = now;
      const G = APP.state(); const s = window.__s; s.frames++;
      let bent = false;
      for (const sh of G.shots) {
        if (!FAMKIND[sh.kind]) { if (sh.turn !== 0) s.straightBad++; continue; }
        if (sh.turn !== 0) { s.bentShots++; bent = true; s.capTurn = Math.max(s.capTurn, Math.abs(sh.turn)); }
        const foe = G.fighters[1 - sh.o];
        if (foe && foe.alive && G.fighters[sh.o] && G.fighters[sh.o].shotStep > 0) {
          const d = Math.hypot(foe.pos.x - sh.x, foe.pos.y - sh.y);
          const pd = window.__last.get(sh.sid);
          if (pd != null) { s.huntSamples++; if (d < pd - 1e-9) s.huntClose++; }
          window.__last.set(sh.sid, d);
        }
      }
      if (bent) s.bentFrames++;
      if (G.pools.length) { s.poolFrames++; s.poolMax = Math.max(s.poolMax, G.pools.length); }
      for (const f of G.fighters) {
        s.maxStep = Math.max(s.maxStep, f.shotStep || 0);
        const bl = f.figT > 0;
        if (bl) {
          s.bloomFrames++; s.liveBloom = 1;
          s.maxFigT = Math.max(s.maxFigT, f.figT);
          if (!window.__prevBloom[f.slot]) {
            s.bloomStarts++;
            if (s.lastObj === null) { s.rotChain++; s.lastObj = f.figObj; }
            else if (f.figObj === (s.lastObj + 1) % 6) { s.rotChain++; s.lastObj = f.figObj; }
            else { s.rotBad++; s.lastObj = f.figObj; }
          }
        } else if (window.__prevBloom[f.slot]) s.liveBloom = 0;
        window.__prevBloom[f.slot] = bl;
        if (f.figPoof > 0) s.poofFrames++;
      }
      requestAnimationFrame(hook);
    };
    requestAnimationFrame(hook);
    if (ff && !APP.state().fast) APP.toggleFF();
  }, force, seed, ff, { orb: 1, spark: 1, spell: 1, halo: 1, nova: 1, vortex: 1 });
  await new Promise(r => setTimeout(r, wall));
  const report = await page.evaluate(() => {
    const scan = el => { for (const t of el.querySelectorAll('*')) if (t.scrollWidth > t.clientWidth + 2) return true; return false; };
    const fr = window.__fr;
    const mw = APP.meta.weapons;
    return { build: document.getElementById('build').textContent, title: document.title,
      over: !document.getElementById('win').hidden,
      fullFrames: fr.filter(d => d >= 6).length, slowFrames: fr.filter(d => d > 0 && d <= 3).length, frozenFrames: fr.filter(d => d === 0).length,
      fitBad: [document.getElementById('lg'), document.getElementById('st'), document.getElementById('bug')].filter(scan).length,
      briefs: { wand: mw.wand.brief, tome: mw.tome.brief, scroll: mw.scroll.brief, staff: mw.staff.brief },
      poolLine: (mw.scroll.line || '').includes('POOL'),
      mstats: { pools: APP.state().stats.pools, poolBurns: APP.state().stats.poolBurns },
      linesHex: ['wand', 'tome', 'scroll', 'staff'].every(id => (mw[id].line || '').includes('HEX')),
      figLine: (mw.wand.line || '').includes('TRANSFIGURES'),
      flickGone: !(mw.wand.line || '').includes('FLICKS') && !(mw.wand.brief || '').includes('FLICK'),
      s: window.__s };
  });
  console.log(label, JSON.stringify({ over: report.over, errs: errs.slice(0, 3), ...report }));
  return { ...report, errs };
}

const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox', '--mute-audio', '--disable-dev-shm-usage'], protocolTimeout: 120000 });
const page = await browser.newPage();
page.setDefaultNavigationTimeout(120000);
const p1 = await run(page, { force: ['wand', 'hammer'], seed: 4321, wall: 60000, ff: true }, 'P1 wand×hammer (the bloom: joke frames, rotation, poofs):');
const p2 = await run(page, { force: null, seed: 0, wall: 90000, ff: true }, 'P2 natural:');
const p3 = await run(page, { force: ['scroll', 'hammer'], seed: 22459, wall: 60000, ff: true }, 'P3 scroll×hammer (the burning pool: fire on the floor, burn beats, bent family flight):');
await browser.close();
const lbl = r => r.errs.length === 0 && r.build === 'build kindling-r82' && r.title.includes('kindling-r82') && r.fitBad === 0 &&
                 r.briefs.wand === '+SPD +FIG +HEX / Hit' && r.briefs.tome === '+SPD +TRIO +HEX / Hit' &&
                 r.briefs.scroll === '+SPD +EMBER +HEX / Hit' && r.briefs.staff === '+SPD +SIZE +HEX / Hit' &&
                 r.linesHex && r.figLine && r.flickGone && r.poolLine;
// bloomfix-r76: the rotation-chain ASSERT lives in smoke-r73 (deterministic, 5 cells, 81 blooms, 0 bad);
// the rAF hook samples a 120Hz sim at 60fps and same-tick pop/rebloom pairs alias it (2 mismatches in 42)
// — here it stays a WITNESS (logged), not a gate. Chrome's gates: labels, errs, fit, frames, bloom presence, cap.
const ok1 = lbl(p1) && p1.s.bloomStarts > 0 && p1.s.bloomFrames > 0 && p1.s.poofFrames > 0 &&
            p1.s.maxFigT <= 6.0 * 120 + 1e-6 &&
            p1.s.bentShots > 0 && p1.s.huntClose > 0 && p1.s.straightBad === 0;
const ok2 = lbl(p2) && p2.over && p2.s.straightBad === 0;
const ok3 = lbl(p3) && p3.s.poolMax > 0 && p3.s.poolFrames > 0 && p3.mstats.pools > 0 && p3.mstats.poolBurns > 0 &&
            p3.s.bentShots > 0 && p3.s.straightBad === 0;
console.log('CHROMECHECK-R80', ok1 && ok2 && ok3 ? 'PASS' : 'FAIL', JSON.stringify({ ok1, ok2, ok3,
  p1: { blooms: p1.s.bloomStarts, bloomFrames: p1.s.bloomFrames, poofFrames: p1.s.poofFrames, rotChain: p1.s.rotChain, rotBad: p1.s.rotBad,
        maxFigT: +p1.s.maxFigT.toFixed(1), bent: p1.s.bentShots, hunt: p1.s.huntClose + '/' + p1.s.huntSamples, rec: [p1.fullFrames, p1.slowFrames, p1.frozenFrames] },
  p2: { over: p2.over, blooms: p2.s.bloomStarts, straightBad: p2.s.straightBad },
  p3: { pools: p3.mstats.pools, burns: p3.mstats.poolBurns, poolMax: p3.s.poolMax,
        poolFrames: p3.s.poolFrames, bent: p3.s.bentShots, straightBad: p3.s.straightBad } }));
process.exit(ok1 && ok2 && ok3 ? 0 : 1);
