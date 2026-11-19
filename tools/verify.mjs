#!/usr/bin/env node
/* tools/verify.mjs — the one-command health judge. Judges checks, emits a concise summary plus ONE
 * machine-readable JSON verdict line. Exit 0 = healthy.
 * Usage: node tools/verify.mjs [--quick] [--orient] [--battery] [--json]
 *   --orient: the session-start check = freshness (origin/main vs the commit that last touched
 *   docs/handoff/BATCH3-STATUS.md; OFFLINE it compares local HEAD and says so) + the quick tier +
 *   strip-hash against canonical-prediet-2c. Prints ORIENT PASS / ORIENT FAIL.
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
const orient = args.includes('--orient');
const quick = args.includes('--quick') || orient, battery = args.includes('--battery'), jsonOnly = args.includes('--json');
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
/* F12: freshness row. Online: fetch, compare origin/main to the ledger's last commit. Offline (no remote, no network,
 * fetch fails): compare local HEAD and SAY the remote was not checked. Never silent, never vacuous. */
function freshnessRow() {
  const t0 = Date.now();
  const git = a => spawnSync('git', a, { encoding:'utf8', timeout:20000 });
  const secs = () => ((Date.now()-t0)/1000).toFixed(1);
  const inside = git(['rev-parse','--is-inside-work-tree']);
  if (inside.status !== 0) return { name:'freshness', ok:false, code:1, secs:secs(), detail:'not a git work tree - cannot check freshness' };
  const ledger = git(['log','-1','--format=%h','--','docs/handoff/BATCH3-STATUS.md']).stdout.trim();
  const fetched = git(['fetch','origin']).status === 0;
  const ref = fetched ? git(['rev-parse','--short','origin/main']).stdout.trim() : git(['rev-parse','--short','HEAD']).stdout.trim();
  const ok = !!ref && ref === ledger;
  const what = fetched ? 'origin/main' : 'local HEAD (OFFLINE: origin not checked)';
  return { name:'freshness', ok, code:ok?0:1, secs:secs(), detail: ok ? `${what} ${ref} = ledger commit` : `${what} ${ref} != ledger commit ${ledger}: something else landed - re-baseline from STATE.md and say what moved` };
}
const results = [];
say('verify: judging repository health…');
if (orient) results.push(freshnessRow());
results.push(registryRow());
const tiers = quick ? ['quick'] : ['quick','standard'];
const steps = verifySteps(root, tiers);
if (!steps || !steps.length) {
  results.push({ name:'registry', ok:false, code:null, secs:'0.0', detail:'tools/manifest.json is missing, unreadable, or lists no runnable check for the tiers ['+tiers.join(', ')+'] - refusing to fall back to a hand-kept list' });
} else {
  for (const s of steps) results.push(run(s.name, s.file, s.args, s.exit));
}
if (orient) results.push(run('strip-hash', '.qa/strip-hash.mjs', ['--base','canonical-prediet-2c']));
if (battery) results.push(run('battery','scripts/run-battery.mjs'));
const ok = results.every(r=>r.ok);
const failed = results.filter(r=>!r.ok).length;
for (const r of results) say(`  ${r.ok?'PASS':'FAIL'}  ${r.name.padEnd(12)} (${r.secs}s)  ${r.detail}`);
say(ok?`${orient?'ORIENT':'VERIFY'} PASS — ${results.length} checks`:`${orient?'ORIENT':'VERIFY'} FAIL — ${failed} of ${results.length} checks failed — see the FAIL rows above`);
console.log(JSON.stringify({ check:'verify', ok, quick, orient, battery, tiers, checks:results.length, results }));
process.exit(ok?0:1);
