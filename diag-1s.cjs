const fs = require("fs");
let src = fs.readFileSync("measure.mjs", "utf8");

// Inject diagnostic logging at shotPhantom++
src = src.replace(
  /if \(!\(gap <= EPS\)\) shotPhantom\+\+;/,
  `if (!(gap <= EPS)) {
    if (typeof globalThis.phantomDiag === 'undefined') globalThis.phantomDiag = 0;
    if (globalThis.phantomDiag < 10) {
      console.log(JSON.stringify({
        type: 'shotPhantom',
        sid: e.sid, sub: e.sub, t: G.t,
        shot: { sx: e.sx, sy: e.sy, sr: e.sr },
        victim: { x: e.x, y: e.y },
        gap: gap,
        bodyR: CFG.bodyR
      }));
      globalThis.phantomDiag++;
    }
    shotPhantom++;
  }`,
);

// Inject diagnostic logging at swatNoTouch++
src = src.replace(
  /if \(!\(g <= EPS\)\) swatNoTouch\+\+;/,
  `if (!(g <= EPS)) {
    if (typeof globalThis.swatDiag === 'undefined') globalThis.swatDiag = 0;
    if (globalThis.swatDiag < 10) {
      console.log(JSON.stringify({
        type: 'swatNoTouch',
        sid: e.sid, sub: e.sub, t: G.t,
        shot: { sx: e.sx, sy: e.sy, sr: e.sr },
        swatter: { x: e.x, y: e.y, ang: e.aAng, w: e.aW },
        best: best,
        g: g
      }));
      globalThis.swatDiag++;
    }
    swatNoTouch++;
  }`,
);

fs.writeFileSync("scratch-measure.mjs", src);
console.log("scratch-measure.mjs updated with globalThis diagnostics.");
