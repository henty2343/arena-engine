#!/usr/bin/env node
/* scripts/run-battery.mjs — the one-command proof battery (read-only; never writes the canonical).
 * JUDGES each step against an expected exit code and emits a machine-readable JSON verdict.
 * Logs: scratch/battery-runs/<step>.log (scratch/ gitignored). Usage: node scripts/run-battery.mjs
 * Runner exit: 0 = every step matched its expected code · 1 = an unexpected code · 2 = canonical moved.
 * EXPECTED = the passing state on build links-r87; if a probe's design changes, update it.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const OUT = path.join("scratch", "battery-runs");
mkdirSync(OUT, { recursive: true });
const canon = () => {
  const b = readFileSync(path.join("previews", "spinclash-preview.html"));
  return createHash("md5").update(b).digest("hex") + " / " + (b.toString("utf8").match(/\n/g) || []).length + " lines";
};
const STEPS = [
  ["inscribe",            [".qa/inscribe.mjs"]],
  ["lengrow-build-proof", [".qa/lengrow-build-proof.mjs"]],
  ["pair-proof",          [".qa/pair-proof.mjs"]],
  ["flipproof",           [".qa/flipproof.mjs"]],
  ["leadproof",           [".qa/leadproof.mjs"]],
  ["seam-proof",          [".qa/seam-proof.mjs"]],
  ["chromecheck",         ["chromecheck.mjs"]],
  ["lengrow-gate",        [".qa/lengrow-gate.mjs"]],
  ["lengrow-bake-verify", [".qa/lengrow-bake.mjs", "--verify"]],
];
const EXPECTED = {
  "inscribe": 0, "lengrow-build-proof": 0, "pair-proof": 0, "flipproof": 0, "leadproof": 0,
  "seam-proof": 0, "chromecheck": 0, "lengrow-gate": 1 /* exits 1 BY DESIGN: uniform stretch first breaks the inscribed gate at k=1.0778 (+7.8%), proving the pre-baked ladder is required */, "lengrow-bake-verify": 0,
};
const before = canon();
console.log("battery start — canonical " + before);
const results = [];
for (const [label, args] of STEPS) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const after = canon();
  writeFileSync(path.join(OUT, label + ".log"),
    "=== " + label + " :: node " + args.join(" ") + " ===\n=== started " + new Date(t0).toISOString() + " ===\n" +
    (r.stdout || "") + (r.stderr || "") + "\n=== exit=" + r.status + " seconds=" + secs + " ===\n" +
    "=== canonical md5 after: " + after + " ===\n");
  const expected = EXPECTED[label] ?? 0;
  const ok = r.status === expected;
  results.push({ name: label, code: r.status, expected, ok, secs });
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}: exit=${r.status} (expected ${expected}) ${secs}s`);
  if (after !== before) console.log("WARNING: canonical moved during " + label + " — read-only; investigate.");
}
const afterAll = canon();
const canonicalMoved = afterAll !== before;
const unexpected = results.filter(r => !r.ok);
const ok = !canonicalMoved && unexpected.length === 0;
console.log("\nsummary:");
for (const r of results) console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name}: exit=${r.code} (expected ${r.expected}) ${r.secs}s`);
console.log("canonical before: " + before);
console.log("canonical after:  " + afterAll);
if (canonicalMoved) console.log("FAIL: the canonical moved — read-only invariant breached.");
console.log(ok ? "BATTERY PASS — every step matched its expected code"
  : "BATTERY FAIL — unexpected: " + unexpected.map(r => r.name).join(", ") + (canonicalMoved ? " (+ canonical moved)" : ""));
console.log(JSON.stringify({ check: "battery", ok, canonicalMoved, steps: results, unexpected: unexpected.map(r => r.name) }));
process.exit(canonicalMoved ? 2 : (ok ? 0 : 1));
