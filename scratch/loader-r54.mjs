// scratch/loader-r54.mjs — rebuild of the working SIM loader recipe (tmp-volatile; /tmp harnesses die between sessions)
import fs from 'node:fs';

export function loadAPI(htmlPath = 'previews/spinclash-preview.html') {
  const html = fs.readFileSync(htmlPath, 'utf8');
  // the SIM block is the script that defines newGame (the boot/UI block comes later)
  let at = 0, tag = -1;
  while (true) {
    const t = html.indexOf('<script>', at);
    if (t < 0) break;
    const s = html.indexOf('>', t) + 1, e = html.indexOf('</script>', s);
    if (html.slice(s, e).includes('function newGame')) { tag = t; break; }
    at = e;
  }
  if (tag < 0) throw new Error('SIM script block not found');
  const start = html.indexOf('>', tag) + 1;
  const end = html.indexOf('</script>', start);
  let src = html.slice(start, end);
  const idx = src.lastIndexOf('})();');
  if (idx < 0) throw new Error('IIFE close not found');
  src = src.slice(0, idx) + 'globalThis.__SC_API={newGame,tick,WEAPONS,CFG,FIGHTERS,WEAPON_IDS,bladeCircles,leadFlip};\n' + src.slice(idx);

  // ---- fake DOM: generic proxy, numeric coercion, empty iteration ----
  const cache = new Map();
  function mk(name) {
    if (cache.has(name)) return cache.get(name);
    const f = function () {};
    const p = new Proxy(f, {
      get(t, prop) {
        if (prop === Symbol.toPrimitive) return () => 0;
        if (prop === Symbol.iterator) return function* () {};
        if (prop === 'then') return undefined;
        if (prop === 'length') return 0;
        if (prop in t) return t[prop];
        return mk(name + '.' + String(prop));
      },
      set(t, prop, v) { t[prop] = v; return true; },
      apply() { return mk(name + '()'); },
      construct() { return mk('new ' + name); },
    });
    cache.set(name, p);
    return p;
  }
  globalThis.document = mk('document');
  globalThis.window = globalThis;
  globalThis.requestAnimationFrame = () => 0;
  globalThis.cancelAnimationFrame = () => {};
  globalThis.performance = { now: () => 0 };
  globalThis.addEventListener = () => {};
  globalThis.removeEventListener = () => {};
  globalThis.devicePixelRatio = 1;

  (0, eval)(src);
  const api = globalThis.__SC_API;
  if (!api) throw new Error('API injection failed');
  return api;
}
