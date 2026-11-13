#!/usr/bin/env node
/* .qa/strip-hash.mjs — comment-only canonical proof. PASS means no code token moved. */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { normalizeCode } from "../tools/lib/strip-comments.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : null;
};
const REL = "previews/spinclash-preview.html";
const hash = (s) => createHash("md5").update(s).digest("hex");
function splitHtml(html) {
  const re = /<script[^>]*>([\s\S]*?)<\/script>/g;
  const non = [],
    scripts = [];
  let last = 0,
    m;
  while ((m = re.exec(html))) {
    non.push(html.slice(last, m.index));
    scripts.push(m[1]);
    last = m.index + m[0].length;
  }
  non.push(html.slice(last));
  return { non, scripts };
}
function fingerprint(html) {
  const { non, scripts } = splitHtml(html);
  const norm = scripts.map(normalizeCode);
  const nonHash = hash(non.join("\u0000"));
  const scriptHashes = norm.map(hash);
  return {
    nonHash,
    scriptHashes,
    all: hash(JSON.stringify({ nonHash, scriptHashes })),
    norm,
  };
}
function selfTest() {
  const cases = [
    [
      "const re = /\\/\\/ not comment/; // real",
      "const re = /\\/\\/ not comment/;",
    ],
    [
      'const s = "/* not comment */"; /* real */',
      'const s = "/* not comment */";',
    ],
    ["const t = `a${`b${c}d`}e`; // real", "const t = `a${`b${c}d`}e`;"],
    ["const x = a / b / c; // real", "const x = a / b / c;"],
    ["const/*c*/x=1;", "const     x=1;"],
  ];
  for (const [src, want] of cases) {
    const got = normalizeCode(src);
    if (got !== want) throw new Error(`self-test failed: ${src} -> ${got}`);
  }
  const base = "const x = 1; // hello";
  if (
    hash(normalizeCode(base)) === hash(normalizeCode("const x = 2; // hello"))
  )
    throw new Error("negative control: code flip not detected");
  if (
    hash(normalizeCode(base)) !== hash(normalizeCode("const x = 1; // world"))
  )
    throw new Error("negative control: comment flip changed hash");
  console.log("strip-hash self-test: PASS");
}
if (args.includes("--self-test")) {
  selfTest();
  console.log(
    JSON.stringify({ check: "strip-hash", ok: true, selfTest: true }),
  );
  process.exit(0);
}
const base = argOf("--base") || "canonical-precomments";
let baseHtml;
try {
  baseHtml = execFileSync("git", ["show", `${base}:${REL}`], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
} catch (e) {
  console.error(`strip-hash: cannot read base ${base}:${REL}`);
  console.log(
    JSON.stringify({
      check: "strip-hash",
      ok: false,
      errors: ["base unreadable"],
    }),
  );
  process.exit(1);
}
const workHtml = readFileSync(path.join(root, REL), "utf8");
selfTest();
const b = fingerprint(baseHtml),
  w = fingerprint(workHtml);
const errors = [];
if (b.nonHash !== w.nonHash) errors.push("non-script HTML bytes changed");
if (b.scriptHashes.length !== w.scriptHashes.length)
  errors.push("script block count changed");
else
  for (let i = 0; i < b.scriptHashes.length; i++)
    if (b.scriptHashes[i] !== w.scriptHashes[i])
      errors.push(`script block ${i} code hash changed`);
for (let i = 0; i < w.norm.length; i++) {
  try {
    new vm.Script(w.norm[i]);
  } catch (e) {
    errors.push(`stripped script ${i} does not parse: ${e.message}`);
  }
}
const ok = errors.length === 0;
console.log(`strip-hash: ${ok ? "PASS" : "FAIL"} vs ${base}`);
console.log(`  non-script md5 ${w.nonHash}`);
w.scriptHashes.forEach((h, i) => console.log(`  script ${i} code md5 ${h}`));
if (!ok) console.log(errors.map((e) => "  - " + e).join("\n"));
console.log(
  JSON.stringify({
    check: "strip-hash",
    ok,
    base,
    nonHash: w.nonHash,
    scriptHashes: w.scriptHashes,
    errors,
  }),
);
process.exit(ok ? 0 : 1);
