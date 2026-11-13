#!/usr/bin/env node
/* tools/verify.mjs — the one-command health judge. Judges checks, emits a concise summary plus ONE
 * machine-readable JSON verdict line. Exit 0 = healthy.
 * Usage: node tools/verify.mjs [--quick] [--battery] [--json]
 *   default: gen-state + lint-docs + fingerprint (~40s); --quick: docs only; --battery: + full battery.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const args = process.argv.slice(2);
const quick = args.includes('--quick'), battery = args.includes('--battery'), jsonOnly = args.includes('--json');
const say = s => { if (!jsonOnly) console.log(s); };
function run(name, file, extra=[]) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [file, ...extra], { encoding:'utf8', maxBuffer:64*1024*1024 });
  const secs = ((Date.now()-t0)/1000).toFixed(1);
  const out = (r.stdout||'')+(r.stderr||'');
  const ok = r.status===0;
  let detail = '';
  const jl = out.trim().split('\n').filter(l=>l.trim().startsWith('{')).pop();
  if (jl) { try { const j = JSON.parse(jl); detail = j.ok===true ? 'ok' : (j.errors ? j.errors.join('; ') : 'see log'); } catch { detail = out.trim().split('\n').pop(); } }
  else detail = out.trim().split('\n').pop()||'';
  return { name, ok, code:r.status, secs, detail: detail.slice(0,200) };
}
const results = [];
say('verify: judging repository health…');
results.push(run('gen-state','tools/gen-state.mjs',['--check']));
results.push(run('lint-docs','tools/lint-docs.mjs'));
results.push(run('navgen','tools/doc/navgen.mjs',['--check']));
results.push(run('docreflow','tools/doc/docreflow.mjs',['--check']));
results.push(run('gen-codemap','tools/gen-codemap.mjs',['--check']));
if (!quick) results.push(run('fingerprint','.qa/fingerprint.mjs',['--compare']));
if (battery) results.push(run('battery','scripts/run-battery.mjs'));
const ok = results.every(r=>r.ok);
for (const r of results) say(`  ${r.ok?'PASS':'FAIL'}  ${r.name.padEnd(12)} (${r.secs}s)  ${r.detail}`);
say(ok?'VERIFY PASS — repository healthy':'VERIFY FAIL — see the FAIL rows above');
console.log(JSON.stringify({ check:'verify', ok, quick, battery, results }));
process.exit(ok?0:1);
