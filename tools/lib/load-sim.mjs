#!/usr/bin/env node
/* tools/lib/load-sim.mjs — shared sim loader for proof tools.
 * Extracts a <script> block from the canonical HTML, strips the IIFE wrapper,
 * optionally transforms the source, and returns the requested exports wrapped
 * in new Function with fake DOM stubs.
 *
 * Usage:
 *   import { loadSim, extractScript } from '../tools/lib/load-sim.mjs';
 *   const api = loadSim(FILE, ['newGame','tick','CFG']);
 *   const api = loadSim(FILE, exports, {
 *     scriptIndex: 0,          // which <script> block (chromecheck runs both)
 *     transform: body => ...,  // inject/rewrite source before eval (seam-proof)
 *     stubs: { document, window, performance, requestAnimationFrame, console }
 *   });
 *
 * Backward compatible: loadSim(path, arrayOfExports) behaves exactly as v1.
 */
import { readFileSync } from "node:fs";

function fakeEl() {
  const t = function () {};
  return new Proxy(t, {
    get(x, p) {
      if (p === Symbol.toPrimitive) return () => 0;
      if (!(p in x)) x[p] = fakeEl();
      return x[p];
    },
    set(x, p, v) {
      x[p] = v;
      return true;
    },
    apply() {
      return fakeEl();
    },
  });
}

const DEFAULT_DOC = {
  getElementById: () => fakeEl(),
  createElement: () => fakeEl(),
  querySelectorAll: () => [],
  addEventListener: () => {},
  activeElement: null,
};
const DEFAULT_WIN = {
  devicePixelRatio: 1,
  innerWidth: 1200,
  innerHeight: 900,
  addEventListener: () => {},
};
const DEFAULT_PERF = { now: () => 0 };
const DEFAULT_RAF = () => 0;

export function extractScript(html, index = 0) {
  let from = 0,
    found = -1;
  for (let i = 0; i <= index; i++) {
    found = html.indexOf("<script>", from);
    if (found < 0)
      throw new Error(`extractScript: no <script> block #${index}`);
    if (i < index) from = html.indexOf("</script>", found) + 9;
  }
  const end = html.indexOf("</script>", found);
  let body = html.slice(found + 8, end);
  const opener = "(function () {";
  const oi = body.indexOf(opener);
  if (oi >= 0) {
    body = body.slice(oi + opener.length);
    const ci = body.lastIndexOf("})();");
    if (ci >= 0) body = body.slice(0, ci);
  }
  return body;
}

export function loadSim(htmlPath, exports, opts = {}) {
  const html = readFileSync(htmlPath, "utf8");
  let body = extractScript(html, opts.scriptIndex ?? 0);
  if (opts.transform) body = opts.transform(body);
  const list = Array.isArray(exports) ? exports.join(", ") : exports;
  const s = opts.stubs || {};
  const fn = new Function(
    "document",
    "window",
    "performance",
    "requestAnimationFrame",
    "console",
    body + `\n;return { ${list} };`,
  );
  return fn(
    s.document ?? DEFAULT_DOC,
    s.window ?? DEFAULT_WIN,
    s.performance ?? DEFAULT_PERF,
    s.requestAnimationFrame ?? DEFAULT_RAF,
    s.console ?? console,
  );
}
