#!/usr/bin/env node
/* scripts/run-battery.mjs — the one-command proof battery (read-only; never writes the canonical).
 * Restored 2026-11-12 from `git show docs-precleanup:scratch/triage/run-final-suite.sh`,
 * rewritten as dependency-free .mjs: bare Node, any OS, any terminal — no Git Bash needed.
 * Usage: node scripts/run-battery.mjs
 * Logs:  scratch/battery-runs/<step>.log   (scratch/ is gitignored)
 * The canonical's md5 is printed after every step as the read-only tripwire.
 * Exit codes are reported, not judged — some probes exit non-zero by design; read the logs.
 * Runner exit: 0 = every step exited 0 · 1 = some step non-zero · 2 = the canonical moved.
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
  return createHash("md5").update(b).digest("hex") + " / " +
    (b.toString("utf8").match(/\n/g) || []).length + " lines";
};

const STEPS = [
  ["inscribe",            [".qa/inscribe.mjs"]],
  ["lengrow-build-proof", [".qa/lengrow-build-proof.mjs"]],
  ["pair-proof",          [".qa/pair-proof.mjs"]],
  ["flipproof",           [".qa/flipproof.mjs"]],
  ["leadproof",           [".qa/leadproof.mjs"]],
  ["seam-proof",          [".qa/seam-proof.mjs"]],
  ["chromecheck-1",       ["chromecheck.mjs"]],
  ["chromecheck-2",       ["chromecheck.mjs"]],
  ["lengrow-gate",        [".qa/lengrow-gate.mjs"]],
  ["lengrow-bake-verify", [".qa/lengrow-bake.mjs", "--verify"]],
];

const before = canon();
console.log("battery start — canonical " + before);
const results = [];
for (const [label, args] of STEPS) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const after = canon();
  writeFileSync(path.join(OUT, label + ".log"),
    "=== " + label + " :: node " + args.join(" ") + " ===\n" +
    "=== started " + new Date(t0).toISOString() + " ===\n" +
    (r.stdout || "") + (r.stderr || "") +
    "\n=== exit=" + r.status + " seconds=" + secs + " ===\n" +
    "=== canonical md5 after: " + after + " ===\n");
  results.push([label, r.status, secs]);
  console.log(label + ": exit=" + r.status + " " + secs + "s");
  if (after !== before) console.log("WARNING: canonical moved during " + label + " — the battery is read-only; investigate.");
}
console.log("");
console.log("summary:");
for (const [label, code, secs] of results) console.log("  " + label + ": exit=" + code + " " + secs + "s");
const afterAll = canon();
console.log("canonical before: " + before);
console.log("canonical after:  " + afterAll);
if (afterAll !== before) { console.log("FAIL: the canonical moved — read-only invariant breached."); process.exit(2); }
const nonzero = results.filter(([, c]) => c !== 0);
console.log(nonzero.length
  ? "ALLDONE — " + nonzero.length + " step(s) exited non-zero: " + nonzero.map(([l]) => l).join(", ") + " (read the logs; some probes exit non-zero by design)"
  : "ALLDONE — every step exited 0");
process.exit(nonzero.length ? 1 : 0);
