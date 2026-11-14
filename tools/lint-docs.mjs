#!/usr/bin/env node
/* tools/lint-docs.mjs — documentation consistency gate (machine-readable).
 * Catches: dead live refs, stale canonical md5 slots, trait-count disagreement, retired rules stated
 * as live, missing baseline, a broken law-to-probe table (B3D: docs/LAWS.md is the sole authority). Usage: node tools/lint-docs.mjs [--json]. Exit 0 = no errors; 1 = errors.
 * Scope: operational docs lint fully; GAMES.md is the archive (only §Current state linted for live refs);
 * fp-*.json + scratch/ artifacts are exempt (history). Read-only, bare Node.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { historyFiles } from './lib/docset.mjs';
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
// B3C: the record set is docs/GAMES.md + docs/history/*.md. The current canonical md5 must be
// carried by AT LEAST ONE of them (the landing entry may live in a frozen era file).
const HIST_FILES = historyFiles(root);
const RECORD_SET = ['docs/GAMES.md', ...HIST_FILES];
if (!RECORD_SET.some(f => existsSync(path.join(root, f)) && rd(f).includes(md5)))
  err(`no file in the GAMES record set (docs/GAMES.md + docs/history/, ${RECORD_SET.length} file(s)) carries the current canonical md5 ${md5} (stale slot?)`);
const games = rd('docs/GAMES.md');
const csEnd = games.indexOf('## Measured facts');
const currentState = games.slice(0, csEnd>0?csEnd:games.length);
// B3D: docs/LAWS.md is the SOLE AUTHORITY for the weapon-trait count (it was GAMES §Current state before #747).
const lawsText = existsSync(path.join(root,'docs/LAWS.md')) ? rd('docs/LAWS.md') : '';
const m = lawsText.match(/(\d+)\s+of\s+22\s+weapon\s+traits\s+landed/);
const canonicalTraits = m ? parseInt(m[1],10) : null;
if (canonicalTraits==null) err('docs/LAWS.md does not pin the weapon-trait count ("N of 22 weapon traits landed") — it is the sole authority for it');
else {
  for (const f of ['README.md','AGENTS.md','docs/LAWS.md']) {
    if (!existsSync(path.join(root,f))) continue;
    const txt = rd(f);
    for (const mm of txt.matchAll(/(\d+)\s+of\s+22/g)) {
      const n = parseInt(mm[1],10);
      if (n!==canonicalTraits && n<=22) {
        const line = txt.slice(0,mm.index).split('\n').length;
        err(`${f}:${line} says "${mm[0]}" but docs/LAWS.md pins ${canonicalTraits} of 22`);
      }
    }
  }
  // The GAMES record is checked only on the explicit "N of 22 weapon traits" phrase (other "of 22" prose there is unrelated).
  for (const mm of currentState.matchAll(/(\d+)\s+of\s+22\s+weapon\s+traits/g)) {
    const n = parseInt(mm[1],10);
    if (n!==canonicalTraits) {
      const line = currentState.slice(0,mm.index).split('\n').length;
      err(`docs/GAMES.md:${line} (§Current state) says "${mm[0]}" but docs/LAWS.md pins ${canonicalTraits} of 22 — LAWS wins, fix the record`);
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
const operational = ['README.md','AGENTS.md','STATE.md','docs/CODEMAP.md','docs/LAWS.md','docs/RECIPES.md','docs/SPEC.md','docs/CONTRACT.md','docs/BUILD.md'];
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
// Section pointers ("`FILE.md` §Heading words") must name a heading that exists in FILE (Phase I).
// Tolerant on purpose: the pointer passes if ANY heading contains its first 1-4 words (case-insensitive).
function lintSectionPointers(f, text) {
  text.split('\n').forEach((line, i) => {
    for (const mm of line.matchAll(/`?([A-Za-z0-9_.\/-]+\.md)`?\s+§\s*([A-Za-z][A-Za-z0-9\- ]*)/g)) {
      const target = ['', 'docs/'].map(d => d + mm[1]).find(p => existsSync(path.join(root, p)))
        || (mm[1].includes('/') ? null : ['docs/' + mm[1], mm[1]].find(p => existsSync(path.join(root, p))));
      if (!target) continue;                                  // unresolved file: lintRefs reports it
      if (HIST.test(line)) continue;
      const heads = rd(target).split('\n').filter(l => /^#{1,6}\s/.test(l)).map(l => l.toLowerCase());
      const words = mm[2].trim().split(/\s+/).slice(0, 4);
      let ok = false;
      for (let n = words.length; n >= 1 && !ok; n--) {
        const needle = words.slice(0, n).join(' ').toLowerCase();
        ok = heads.some(h => h.includes(needle));
      }
      if (!ok) err(`${f}:${i + 1} points to "${mm[1]} §${words.join(' ')}" but ${target} has no such heading`);
    }
  });
}
for (const f of operational) if (existsSync(path.join(root,f))) lintSectionPointers(f, rd(f));
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

  // README must not carry mutable facts (Phase I): they live in STATE.md only.
  if (/\b[0-9a-f]{32}\b/.test(readmeSlim)) err('README contains an md5 — mutable facts live in STATE.md only');
  if (/^\s*-\s*(Lines|md5|Build stamp)\s*:/mi.test(readmeSlim)) err('README repeats a mutable fact (Lines/md5/Build stamp) — link STATE.md instead');

  // GAMES.md's preface must not tell agents to read it whole (Phase I).
  for (const f of ['docs/GAMES.md', ...HIST_FILES]) {
    const head = rd(f).split('\n').slice(0, 25).join('\n');
    if (/(?<!not )(?<!never )read this file (first|whole)/i.test(head)) err(`${f} preface tells agents to read it first/whole — it is grep-only`);
  }
  // B3C: every frozen era file must be routed to from GAMES, and every history path GAMES
  // names must exist. (lintRefs only scans §Current state, so the nav block needs this.)
  for (const f of HIST_FILES)
    if (!games.includes(f)) err(`${f} is not named in docs/GAMES.md — the nav block must route to every era file`);
  for (const mm of games.matchAll(/`(docs\/history\/[A-Za-z0-9_.\-]+\.md)`/g))
    if (!existsSync(path.join(root, mm[1]))) err(`docs/GAMES.md references missing history file: ${mm[1]}`);

  // Hand-typed token costs drift; the only cost source is STATE.md (Phase I).
  for (const f of ['AGENTS.md','docs/CODEMAP.md','docs/LAWS.md','docs/RECIPES.md','docs/SPEC.md','docs/CONTRACT.md','docs/BUILD.md','docs/GAMES.md', ...HIST_FILES])
    if (existsSync(path.join(root,f)) && /Approx token cost:\s*~?\d/.test(rd(f).split('\n').slice(0, 12).join('\n')))
      err(f + ' header has a hand-typed token cost — point to STATE.md §Documentation cost instead');

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

// B3D: the law-to-probe table in docs/LAWS.md. Anchors are checked mechanically; Status is hand-written judgement.
(function lintLawTable() {
  if (!lawsText) return;
  const lines = lawsText.split('\n');
  const start = lines.findIndex(l => /^##\s+Law-to-probe table/.test(l));
  if (start < 0) { err('docs/LAWS.md has no "## Law-to-probe table" section'); return; }
  let end = lines.findIndex((l, i) => i > start && /^##\s/.test(l)); if (end < 0) end = lines.length;
  const battery = existsSync(path.join(root,'scripts/run-battery.mjs')) ? rd('scripts/run-battery.mjs') : '';
  const runnable = new Set([...battery.matchAll(/\["[^"]+",\s*\["([^"]+\.mjs)"/g)].map(x => x[1]));
  runnable.add('.qa/fingerprint.mjs');
  if (runnable.size < 5) err('law table lint could not read the battery steps from scripts/run-battery.mjs');
  const STATUS = new Set(['probed','partial','owner-run only','unprobed']);
  const seen = new Set(); let rows = 0;
  const anchors = cell => [...cell.matchAll(/`([^`]+?)::([^`]+?)`/g)].map(x => ({ file: x[1], anchor: x[2] }));
  for (let i = start + 1; i < end; i++) {
    const row = lines[i]; if (!/^\|/.test(row)) continue;
    const c = row.split('|').slice(1, -1).map(x => x.trim());
    if (c[0] === 'ID' || /^[-: ]+$/.test(c[0])) continue;
    const at = `docs/LAWS.md:${i + 1}`;
    if (c.length !== 6) { err(`${at} law table row has ${c.length} cells, expected 6 (ID | Law | Runnable probe | Owner-run audit | Status | Scope)`); continue; }
    rows++;
    const id = c[0];
    if (seen.has(id)) err(`${at} law table repeats id ${id}`); seen.add(id);
    if (!STATUS.has(c[4])) err(`${at} ${id}: status "${c[4]}" is not one of ${[...STATUS].join(' / ')}`);
    const run = anchors(c[2]), own = anchors(c[3]);
    for (const a of run) {
      if (!runnable.has(a.file)) err(`${at} ${id}: runnable probe ${a.file} is not a battery step or fingerprint.mjs`);
    }
    for (const a of own) if (a.file !== 'measure.mjs') err(`${at} ${id}: owner-run audit must cite measure.mjs, not ${a.file}`);
    for (const a of [...run, ...own]) {
      if (!existsSync(path.join(root, a.file))) { err(`${at} ${id}: ${a.file} does not exist`); continue; }
      if (!rd(a.file).includes(a.anchor)) err(`${at} ${id}: anchor not found in ${a.file}: "${a.anchor}"`);
    }
    if (c[4] === 'unprobed' && (run.length || own.length)) err(`${at} ${id}: status unprobed but cites an anchor`);
    if (c[4] === 'owner-run only' && (run.length || !own.length)) err(`${at} ${id}: owner-run only needs a measure.mjs anchor and no runnable probe`);
    if ((c[4] === 'probed' || c[4] === 'partial') && !run.length) err(`${at} ${id}: status ${c[4]} needs a runnable-probe anchor`);
  }
  for (const id of ['C1','C2','C3','C4','C5','C6','S1','S2','S3','S4','S5','S6'])
    if (!seen.has(id)) err(`docs/LAWS.md law table is missing a row for ${id} (contact laws 1-6 = C1-C6, shot laws 1s-6s = S1-S6)`);
  if (!/SOLE AUTHORITY/.test(lawsText.split('\n').slice(0, 12).join('\n'))) err('docs/LAWS.md header no longer declares it the SOLE AUTHORITY for the current laws');
  if (!rows) err('docs/LAWS.md law table has no rows');
})();

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
