#!/usr/bin/env node
/* tools/lib/load-sim.mjs — shared sim loader for proof tools.
 * Extracts the first <script> block from the canonical HTML, strips the IIFE wrapper,
 * and returns the requested exports wrapped in new Function with fake DOM stubs.
 * 
 * Usage (from a tool in .qa/): 
 *   import { loadSim } from '../tools/lib/load-sim.mjs';
 *   const { newGame, tick, CFG } = loadSim('../previews/spinclash-preview.html', 
 *                                            ['newGame', 'tick', 'CFG']);
 *
 * The loader handles:
 *   - HTML reading + <script> extraction
 *   - IIFE unwrapping (removes `(function () {` opener and `})();` closer)
 *   - new Function wrapping with specified exports
 *   - Fake DOM stubs (document, window, performance, requestAnimationFrame, console)
 *
 * Why this exists: 13 proof tools duplicated this extraction logic. Now they can import it.
 * Migrated from scratch/loader-r54.mjs (which was unused; that file is now retired).
 * 
 * Note: fingerprint.mjs still uses its own battle-tested extraction (to avoid md5 move risk).
 * Migration is deferred to a future md5-sanctioned landing.
 */

import { readFileSync } from 'node:fs';

function fakeEl() {
  const t = function () {};
  return new Proxy(t, {
    get(x, p) { if (p === Symbol.toPrimitive) return () => 0; if (!(p in x)) x[p] = fakeEl(); return x[p]; },
    set(x, p, v) { x[p] = v; return true; },
    apply() { return fakeEl(); },
  });
}

export function loadSim(htmlPath, exports) {
  const html = readFileSync(htmlPath, 'utf8');
  if (!html.includes('<script>')) {
    throw new Error(`loadSim: ${htmlPath} contains no <script> tag`);
  }
  const a = html.indexOf('<script>'), b = html.indexOf('</script>', a);
  let body = html.slice(a + 8, b);
  const opener = '(function () {';
  body = body.slice(body.indexOf(opener) + opener.length);
  body = body.slice(0, body.lastIndexOf('})();'));
  const returnStmt = `
;return { ${exports.join(', ')} };`;
  const fn = new Function('document', 'window', 'performance', 'requestAnimationFrame', 'console',
    body + returnStmt);
  return fn(
    { getElementById: () => fakeEl(), createElement: () => fakeEl(), querySelectorAll: () => [], addEventListener: () => {}, activeElement: null },
    { devicePixelRatio: 1, innerWidth: 1200, innerHeight: 900, addEventListener: () => {} },
    { now: () => 0 },
    () => 0,
    console
  );
}
