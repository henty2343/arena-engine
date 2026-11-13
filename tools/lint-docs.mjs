#!/usr/bin/env node
/* tools/lint-docs.mjs — documentation consistency gate (machine-readable).
 * Catches: dead live refs, stale canonical md5 slots, trait-count disagreement, retired rules stated
 * as live, missing baseline. Usage: node tools/lint-docs.mjs [--json]. Exit 0 = no errors; 1 = errors.
 * Scope: operational docs lint fully; GAMES.md is the archive (only §Current state linted for live refs);
 * fp-*.json + scratch/ artifacts are exempt (history). Read-only, bare Node.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [], warnings = [];
const err = m => errors.push(m); const warn = m => warnings.push(m);
const rd = p => readFileSync(path.join(root, p), 'utf8');
const cbuf = readFileSync(path.join(root, 'previews', 'spinclash-preview.html'));
const md5 = createHash('md5').update(cbuf).digest('hex');
const basePtr = path.join(root, '.qa', 'BASELINE');
if (!existsSync(basePtr)) err('.qa/BASELINE pointer is missing');
else { const b = readFileSync(basePtr,'utf8').trim();
  if (!existsSync(path.join(root,'.qa',b))) err(`.qa/BASELINE points to missing file: ${b}`); }
for (const f of ['README.md','docs/GAMES.md'])
  if (!rd(f).includes(md5)) err(`${f} lacks the current canonical md5 ${md5} (stale slot?)`);
const games = rd('docs/GAMES.md');
const csEnd = games.indexOf('## Measured facts');
const currentState = games.slice(0, csEnd>0?csEnd:games.length);
const m = currentState.match(/(\d+)\s+of\s+22\s+weapon\s+traits\s+landed/);
const canonicalTraits = m ? parseInt(m[1],10) : null;
if (canonicalTraits==null) warn('could not read canonical trait count from GAMES §Current state');
else for (const f of ['README.md','AGENTS.md','docs/LAWS.md']) {
  if (!existsSync(path.join(root,f))) continue;
  const txt = rd(f);
  for (const mm of txt.matchAll(/(\d+)\s+of\s+22/g)) {
    const n = parseInt(mm[1],10);
    if (n!==canonicalTraits && n<=22) {
      const line = txt.slice(0,mm.index).split('\n').length;
      err(`${f}:${line} says "${mm[0]}" but GAMES §Current state says ${canonicalTraits} of 22`);
    }
  }
}
const retiredSignatures = ['spine never damages','deals no damage and emits no hit event',
  'zero melee hits by projectile weapons','Seven shot-law checks','The projectile-rule exception (owner 2026-10-19)'];
function checkRetired(text, label) {
  text.split('\n').forEach((line,i) => {
    for (const sig of retiredSignatures)
      if (line.includes(sig) && !/retired|RETIRED|was |no longer|former|history/i.test(line))
        err(`${label} (line ${i+1}) states a retired rule as live: "${sig}"`);
  });
}
checkRetired(currentState, 'GAMES §Current state');
if (!currentState.includes('LAWS.md')) err('GAMES §Current state does not point to LAWS.md (the current-laws quick reference)');
if (existsSync(path.join(root,'docs/LAWS.md'))) checkRetired(rd('docs/LAWS.md'), 'docs/LAWS.md');
const PLANNED = new Set(['package.json','render.json','targets.ts','characters.json','tasks.json',
  'launch.json','settings.json','extensions.json','doctor.mjs','generate.mjs','inspect.mjs']);
const PLANNED_DIR = /^(packages|apps|games|output|assets\/pools|assets\/fonts|\.vscode)\//;
const HIST = /retired|purged|recover|git show|docs-precleanup|item3-closed|never committed|unrecoverable|former|removed|deleted|was\b|tombstone|archived|RETIRED|DORMANT|reverted|parked|pruned|gone|no longer|since retired/i;
const SEARCH_DIRS = ['', '.qa','docs','tools','scripts','scratch','previews'];
function resolves(ref) {
  const clean = ref.split('#')[0]; if (!clean) return true;
  if (PLANNED.has(path.basename(clean)) || PLANNED_DIR.test(clean)) return true;
  if (clean.includes('/')) {
    if (existsSync(path.join(root,clean))) return true;
    for (const d of ['docs','tools']) if (existsSync(path.join(root,d,clean))) return true;
    return false;
  }
  for (const d of SEARCH_DIRS) if (existsSync(path.join(root,d,clean))) return true;
  return false;
}
const refRe = /`([A-Za-z0-9_./\-]+\.(?:mjs|md|json|html|ts|js|svg|csv|txt|sh))`|\]\(([^)\s]+)\)/g;
const operational = ['README.md','AGENTS.md','STATE.md','docs/LAWS.md','docs/RECIPES.md','docs/SPEC.md','docs/CONTRACT.md','docs/BUILD.md'];
function lintRefs(f, text, off=0) {
  text.split('\n').forEach((line,i) => {
    for (const mm of line.matchAll(refRe)) {
      const ref = mm[1]||mm[2];
      if (!ref || /^(https?:|#|mailto:)/.test(ref)) continue;
      if (/^fp-.*\.json$/.test(path.basename(ref)) || ref.startsWith('scratch/')) continue;
      if (resolves(ref)) continue;
      if (HIST.test(line)) continue;
      err(`${f}:${off+i+1} references missing path: ${ref}`);
    }
  });
}
for (const f of operational) if (existsSync(path.join(root,f))) lintRefs(f, rd(f));
lintRefs('docs/GAMES.md', currentState);
if (existsSync(path.join(root,'AGENTS.md'))) {
  if (!rd('README.md').includes('AGENTS.md')) warn('README does not point to the AGENTS.md entry point');
  if (/read all four before writing code/.test(rd('README.md'))) err('README still says "read all four before writing code"');
} else warn('AGENTS.md entry point is missing');
  // README router guard (Phase G): README must route agents, not archive them.
  const readmeText = rd('README.md');
  if (!readmeText.includes('AGENTS.md')) err('README does not point to AGENTS.md');
  if (!readmeText.includes('STATE.md')) err('README does not point to STATE.md');
  if (/read all (four|five) (?:docs? )?before writing code/i.test(readmeText)) {
    err('README still tells agents to read all docs before writing code');
  }
  if (/^## Starting a new chat/m.test(readmeText) && !/Historical chat checkpoints are preserved/.test(readmeText)) {
    err('README contains an unexplained stale Starting-a-chat section');
  }

  // README slim guard (Phase H fixed): README is a router, not an archive.
  const readmeSlim = rd('README.md');
  if (Buffer.byteLength(readmeSlim) > 3000) err('README is too large to be a router: ' + Buffer.byteLength(readmeSlim) + ' bytes');

  const requiredPointers = ['AGENTS.md', 'STATE.md', 'docs/LAWS.md', 'docs/RECIPES.md', 'docs/GAMES.md', '.qa/BASELINE'];
  for (const needle of requiredPointers) {
    if (!readmeSlim.includes(needle)) err('README missing router pointer: ' + needle);
  }

  const stateSlim = rd('STATE.md');
  const md5LineSlim = stateSlim.split('\n').find(l => l.includes('- md5:')) || '';
  const currentMd5Slim = md5LineSlim.split('`').filter(Boolean).pop();
  if (currentMd5Slim && !readmeSlim.includes(currentMd5Slim)) err('README lacks current canonical md5');

  const staleTexts = [
    'Starting a new chat',
    'scratch/docreflow',
    'scratch/navgen',
    'read all five',
    'read all four',
    '9 of 22',
    '13 remaining',
    'fp-multgrow-r42.json',
    'docs/HANDOFF.md',
    'docs-precleanup'
  ];
  for (const stale of staleTexts) {
    if (readmeSlim.includes(stale)) err('README contains stale/non-router text: ' + stale);
  }

const ok = errors.length===0;
const verdict = { check:'lint-docs', ok, errors, warnings, canonicalMd5:md5, canonicalTraits };
if (process.argv.includes('--json')) console.log(JSON.stringify(verdict));
else {
  console.log(`lint-docs: ${errors.length} error(s), ${warnings.length} warning(s)`);
  for (const e of errors) console.log('  ERROR  '+e);
  for (const w of warnings) console.log('  WARN   '+w);
  console.log(ok?'LINT PASS':'LINT FAIL');
  console.log(JSON.stringify(verdict));
}
process.exit(ok?0:1);
