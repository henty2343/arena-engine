#!/usr/bin/env node
/* tools/verify.mjs — the one-command health judge. Judges checks, emits a concise summary plus ONE
 * machine-readable JSON verdict line. Exit 0 = healthy.
 * Usage: node tools/verify.mjs [--quick] [--battery] [--json]
 *   default: manifest + the quick tier + the standard tier (fingerprint, ~40s); --quick: manifest + the
 *   quick tier only (docs, no sim); --battery: + the full proof battery.
 * THE CHECKS COME FROM tools/manifest.json - the probe registry - not from a list kept here. Each
 * entry with tier "quick" or "standard" is a check (run in manifest order; an ownerOnly or
 * runnable:false entry is never run, whatever its tier). Adding a check = adding one line there.
 * The first row, "manifest", is the registry's own completeness check (every proof and checker on
 * disk is registered, every entry's file exists, every tier is valid). If the manifest is missing or
 * unreadable verify FAILS CLOSED: it has no hand-kept fallback list. The battery's own step list is
 * read from the same file by scripts/run-battery.mjs.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { manifestErrors, readManifest, verifySteps } from './lib/manifest.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const args = process.argv.slice(2);
const quick = args.includes('--quick'), battery = args.includes('--battery'), jsonOnly = args.includes('--json');
const say = s => { if (!jsonOnly) console.log(s); };
function run(name, file, extra=[], expect=0) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [file, ...extra], { encoding:'utf8', maxBuffer:64*1024*1024 });
  const secs = ((Date.now()-t0)/1000).toFixed(1);
  const out = (r.stdout||'')+(r.stderr||'');
  const ok = r.status===expect;
  let detail = '';
  const jl = out.trim().split('\n').filter(l=>l.trim().startsWith('{')).pop();
  if (jl) { try { const j = JSON.parse(jl); detail = j.ok===true ? 'ok' : (j.errors ? j.errors.join('; ') : 'see log'); } catch { detail = out.trim().split('\n').pop(); } }
  else detail = out.trim().split('\n').pop()||'';
  return { name, ok, code:r.status, secs, detail: detail.slice(0,200) };
}
/* The registry's own completeness check, in-process. */
function registryRow() {
  const t0 = Date.now();
  const errs = manifestErrors(root);
  const secs = ((Date.now()-t0)/1000).toFixed(1);
  const m = readManifest(root);
  const n = m && Array.isArray(m.probes) ? m.probes.length : 0;
  const detail = errs.length ? `${errs.length} problem(s): ${errs[0]}`.slice(0,200) : `${n} entries registered, every file present`;
  return { name:'manifest', ok:errs.length===0, code:errs.length===0?0:1, secs, detail, errors:errs };
}
const results = [];
say('verify: judging repository health…');
results.push(registryRow());
const tiers = quick ? ['quick'] : ['quick','standard'];
const steps = verifySteps(root, tiers);
if (!steps || !steps.length) {
  results.push({ name:'registry', ok:false, code:null, secs:'0.0', detail:'tools/manifest.json is missing, unreadable, or lists no runnable check for the tiers ['+tiers.join(', ')+'] - refusing to fall back to a hand-kept list' });
} else {
  for (const s of steps) results.push(run(s.name, s.file, s.args, s.exit));
}
if (battery) results.push(run('battery','scripts/run-battery.mjs'));
const ok = results.every(r=>r.ok);
const failed = results.filter(r=>!r.ok).length;
for (const r of results) say(`  ${r.ok?'PASS':'FAIL'}  ${r.name.padEnd(12)} (${r.secs}s)  ${r.detail}`);
say(ok?`VERIFY PASS — ${results.length} checks`:`VERIFY FAIL — ${failed} of ${results.length} checks failed — see the FAIL rows above`);
console.log(JSON.stringify({ check:'verify', ok, quick, battery, tiers, checks:results.length, results }));
process.exit(ok?0:1);
