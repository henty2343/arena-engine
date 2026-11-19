#!/usr/bin/env node
/* tools/gen-tree.mjs — GENERATES the repository tree, so a hand-written tree can never go stale.
 *
 * WHY THIS EXISTS (audit finding D-03). docs/planned/SPEC.md carried a hand-written tree of the
 * repository. It claimed five directories existed as Phase-0 placeholders (.vscode/, assets/fonts/,
 * packages/, apps/studio/, games/) — all of which had been DELETED, in the very commit that was
 * supposed to update the doc. Nothing checked it, because nothing derived it.
 *
 * The tree is now generated from the filesystem. The STRUCTURE is read from disk; only the per-entry
 * CAPTIONS are hand-written (a small map below), and a caption for a path that no longer exists is
 * simply dropped — the map can be stale, the tree cannot.
 *
 * Usage: node tools/gen-tree.mjs | --check (exit 1 if stale) | --json
 * Read-only. Bare Node, no dependencies.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

/* The captions: what each entry IS, in one line. A caption whose path no longer exists is ignored. */
const CAPTIONS = {
  'README.md': 'the router: where to start (agents start at AGENTS.md)',
  'AGENTS.md': 'THE agent entry point — loading order, standing rules, task→file map',
  'STATE.md': 'GENERATED mutable facts (md5/stamp/lines/baseline/inventory) — tools/gen-state.mjs',
  '.gitignore': 'scratch/ (+ .qa/fingerprint.json, the fingerprint tool\'s scratch output)',
  '.gitattributes': 'LF enforcement for md/mjs/html — the md5 and fingerprint checks depend on it',
  'docs': 'LAWS.md (current laws) · RECIPES.md (add trait/bot) · GAMES.md (design record) · CODEMAP.md (generated) · laws.json (machine form of the laws) · token-costs.json (measured token costs)',
  'docs/planned': 'SPEC.md · CONTRACT.md · BUILD.md — the PLANNED platform (no code yet)',
  'docs/handoff': 'HANDOFF.md (router) · RUNBOOK.md (rules)',
  'previews': 'spinclash-preview.html — THE canonical game (single file, dependency-free)',
  'chromecheck.mjs': 'fast boot + pairing check (~4s) — runs today on bare Node',
  'measure.mjs': 'the sanctioned law matrix — OWNER-GATED, never runs without his explicit go',
  'ingest.mjs': 'weapon-art merge gate — DORMANT and OWNER-GATED (same --owner-go gate as measure.mjs)',
  '.qa': 'proof probes + BASELINE (pointer to the active baseline; judge with `fingerprint --compare`)',
  '.qa/BASELINE': 'pointer to the standing fingerprint baseline (one line, read by fingerprint --compare)',
  'tools': 'LIVE agent tooling: verify.mjs (health judge, JSON verdict) · lint-docs.mjs · lint-markers.mjs · lint-controls.mjs · gen-state.mjs · gen-codemap.mjs · gen-tree.mjs · manifest.json (the probe registry) · doc/ (navgen · docreflow) · lib/ (load-sim.mjs, shared sim loader)',
  'scripts': 'run-battery.mjs (LIVE — one-command proof battery)',
  'scratch': 'gitignored, TEMPORARY ONLY (per-build smokes live here until the next purge)',
  'output': 'gitignored, created at runtime; one folder per render; also the stats source',
  '.github': 'copilot-instructions.md — a second entry point for a different agent (points, never duplicates)',
};

/* What the tree lists. Directories that exist but carry nothing an agent needs are not listed;
 * the point of the map is to answer "where does X live", not to be a directory listing. */
const LIST = [
  { path: 'README.md' }, { path: 'AGENTS.md' }, { path: 'STATE.md' },
  { path: '.gitignore' }, { path: '.gitattributes' },
  { path: 'docs' }, { path: 'docs/planned' }, { path: 'docs/handoff' },
  { path: 'previews' },
  { path: 'chromecheck.mjs' }, { path: 'measure.mjs' }, { path: 'ingest.mjs' },
  { path: '.qa' }, { path: '.qa/BASELINE' },
  { path: 'tools' }, { path: 'scripts' }, { path: 'scratch' }, { path: 'output' },
  { path: '.github' },
];

function build() {
  const rows = [];
  for (const e of LIST) {
    const p = path.join(root, e.path);
    if (!existsSync(p)) continue;                       // a listed path that is gone is simply not listed
    const isDir = statSync(p).isDirectory();
    const cap = CAPTIONS[e.path];
    rows.push({ path: e.path, isDir, caption: cap || null });
  }
  return rows;
}

function render(rows) {
  const L = [];
  L.push('```');
  L.push('arena-engine/');
  rows.forEach((r, i) => {
    const last = i === rows.length - 1;
    const cap = r.caption ? '  # ' + r.caption : '';
    L.push(`${last ? '\u2514\u2500' : '\u251c\u2500'} ${r.path}${r.isDir ? '/' : ''}${cap}`);
  });
  L.push('```');
  return L.join('\n');
}

const BEGIN = '<!-- BEGIN GENERATED TREE - tools/gen-tree.mjs -->';
const END = '<!-- END GENERATED TREE -->';

const rows = build();
const out = render(rows);
if (args.includes('--json')) { console.log(JSON.stringify({ rows })); process.exit(0); }
const target = path.join(root, 'docs', 'planned', 'SPEC.md');
if (args.includes('--check')) {
  const cur = existsSync(target) ? readFileSync(target, 'utf8') : '';
  const a = cur.indexOf(BEGIN), b = cur.indexOf(END);
  const block = a >= 0 && b > a ? cur.slice(a + BEGIN.length, b).trim() : '';
  if (block === out.trim()) { console.log('gen-tree --check: the generated tree in docs/planned/SPEC.md is CURRENT'); console.log(JSON.stringify({ check:'gen-tree', ok:true })); process.exit(0); }
  console.log('gen-tree --check: the generated tree in docs/planned/SPEC.md is STALE - run node tools/gen-tree.mjs');
  console.log(JSON.stringify({ check:'gen-tree', ok:false, errors:['the generated tree in docs/planned/SPEC.md is stale'] }));
  process.exit(1);
}
const cur = existsSync(target) ? readFileSync(target, 'utf8') : '';
const a = cur.indexOf(BEGIN), b = cur.indexOf(END);
if (a < 0 || b <= a) { console.error('gen-tree: docs/planned/SPEC.md has no BEGIN/END GENERATED TREE block'); process.exit(1); }
writeFileSync(target, cur.slice(0, a + BEGIN.length) + '\n' + out + '\n' + cur.slice(b));
console.log('gen-tree: wrote the generated tree into docs/planned/SPEC.md - ' + rows.length + ' entries');
console.log(JSON.stringify({ check:'gen-tree', ok:true, entries: rows.length }));
