#!/usr/bin/env node
/* tools/lint-markers.mjs — canonical region-marker lint. Read-only. */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lines = readFileSync(
  path.join(root, "previews", "spinclash-preview.html"),
  "utf8",
).split("\n");
const errors = [];
const markerRe = /^\s*\/\/\s*@@([a-z0-9-]+\/[a-z0-9-]+)\s*$/;
const markers = [];
lines.forEach((l, i) => {
  if (!l.includes("@@")) return;
  const m = l.match(markerRe);
  if (!m) errors.push(`line ${i + 1}: malformed @@ marker`);
  else markers.push({ name: m[1], line: i + 1 });
});
const seen = new Set();
for (const m of markers) {
  if (seen.has(m.name))
    errors.push(`duplicate marker ${m.name} at line ${m.line}`);
  seen.add(m.name);
}
if (!markers.length) errors.push("no @@ region markers found");
const r = spawnSync(process.execPath, ["tools/gen-codemap.mjs", "--json"], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
if (r.status !== 0) errors.push("gen-codemap --json failed");
else {
  try {
    const f = JSON.parse(r.stdout.trim().split("\n").pop());
    /* The CODEMAP carries two SYNTHETIC regions that no @@ marker can own: `head/shell` (the markup
     * before the first script block) and `app/chrome` (the Chrome UI shell after it). They exist so
     * the region table covers EVERY line of the file - the map used to omit 83 lines, including the
     * whole public API surface (audit finding D-09). The invariant is therefore: every @@ marker is a
     * region, every region is marker-based or synthetic, and the two counts differ by exactly the
     * number of synthetic regions. */
    const synthetic = f.regions.filter((r) => r.kind === "synthetic");
    const markerRegions = f.regions.filter((r) => r.kind === "marker");
    if (markerRegions.length !== markers.length)
      errors.push(
        `marker count ${markers.length} != CODEMAP marker-based region count ${markerRegions.length}`,
      );
    if (f.regions.length !== markers.length + synthetic.length)
      errors.push(
        `CODEMAP region count ${f.regions.length} != markers ${markers.length} + synthetic ${synthetic.length}`,
      );
    for (const reg of f.regions)
      if (reg.kind !== "marker" && reg.kind !== "synthetic")
        errors.push(`CODEMAP region ${reg.name} is neither marker-based nor synthetic`);
    for (const m of markers)
      if (!f.regions.some((r) => r.name === m.name && r.kind === "marker"))
        errors.push(`@@ marker ${m.name} has no CODEMAP region`);
    for (const s of f.symbols)
      if (s.region === "(unmapped)")
        errors.push(
          `symbol ${s.name} at line ${s.line} is outside marked regions`,
        );
  } catch (e) {
    errors.push("cannot parse gen-codemap JSON: " + e.message);
  }
}
const ok = errors.length === 0;
console.log(
  ok
    ? `lint-markers: PASS (${markers.length} markers)`
    : "lint-markers: FAIL\n" + errors.map((e) => "  - " + e).join("\n"),
);
console.log(
  JSON.stringify({
    check: "lint-markers",
    ok,
    markers: markers.length,
    errors,
  }),
);
process.exit(ok ? 0 : 1);
