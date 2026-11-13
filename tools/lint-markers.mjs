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
    if (f.regions.length !== markers.length)
      errors.push(
        `marker count ${markers.length} != CODEMAP region count ${f.regions.length}`,
      );
    for (const reg of f.regions)
      if (reg.kind !== "marker")
        errors.push(`CODEMAP region ${reg.name} is not marker-based`);
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
