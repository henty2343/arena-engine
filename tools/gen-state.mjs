#!/usr/bin/env node
/* tools/gen-state.mjs — GENERATES STATE.md, the single source of mutable project facts.
 * Mutable facts are generated, never hand-pinned (SPEC repo-organization law 7).
 * Usage: node tools/gen-state.mjs | --check (exit 0 if current) | --json. Read-only vs canonical.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANON = path.join(root, 'previews', 'spinclash-preview.html');
function facts() {
  const buf = readFileSync(CANON); const html = buf.toString('utf8');
  const md5 = createHash('md5').update(buf).digest('hex');
  const lines = (html.match(/\n/g) || []).length;
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1];
  const stamp = (title.match(/build\s+([A-Za-z0-9._-]+)/) || [, '(unknown)'])[1];
  const basePtr = path.join(root, '.qa', 'BASELINE');
  const baseline = existsSync(basePtr) ? readFileSync(basePtr, 'utf8').trim() : '(missing)';
  const baselineOk = existsSync(path.join(root, '.qa', baseline));
  const list = (d, re) => existsSync(d) ? readdirSync(d).filter(f => re.test(f)).sort() : [];
  const proofs = list(path.join(root, '.qa'), /\.mjs$/);
  const baselines = list(path.join(root, '.qa'), /^fp-.*\.json$/);
  const archived = list(path.join(root, '.qa', 'archive'), /^fp-.*\.json$/);
  const bl = (baseline.match(/-r(\d+)\.json$/) || [])[1], st = (stamp.match(/-r(\d+)$/) || [])[1];
  let bmeta = null;
  try { bmeta = JSON.parse(readFileSync(path.join(root, '.qa', baseline), 'utf8'))._meta || null; } catch {}
  const labelNote = bmeta ? `Recorded on: canonical md5 \`${bmeta.canonicalMd5}\`, stamp \`${bmeta.stamp}\` (the baseline file's label is a checkpoint name, not a build stamp).`
    : 'Baseline file records no build metadata (`_meta` missing).';
  const rootTools = list(root, /\.mjs$/);
  const scripts = list(path.join(root, 'scripts'), /\.mjs$/);
  const tools = [...list(path.join(root, 'tools'), /\.mjs$/),
    ...list(path.join(root, 'tools', 'doc'), /\.mjs$/).map(x => 'doc/' + x),
    ...list(path.join(root, 'tools', 'lib'), /\.mjs$/).map(x => 'lib/' + x)];
  /* THE TOKEN MODEL. chars/4 is an ESTIMATE and it is wrong for the file that dominates the budget:
   * the canonical is dense JavaScript, so its real token cost is ~29% ABOVE chars/4 (measured with a
   * real BPE tokenizer), while prose Markdown is within ~8%. The repo has no dependencies and no
   * package.json (SPEC repo-organization law 7), so no tokenizer can be shipped - instead the MEASURED
   * costs live in docs/token-costs.json, keyed by the file's md5. A measured entry is used only while
   * its md5 still matches the file on disk; the moment the file changes, the row falls back to the
   * estimate automatically, so a stale measurement can never be quoted as fact. */
  let COSTS = { files: {} };
  try { COSTS = JSON.parse(readFileSync(path.join(root, 'docs', 'token-costs.json'), 'utf8')); } catch {}
  const md5Of = p => createHash('md5').update(readFileSync(p)).digest('hex');
  const tokenCost = (rel) => {
    const p = path.join(root, rel);
    if (!existsSync(p)) return { tokens: 0, exact: false };
    const bytes = readFileSync(p, 'utf8').length;
    const m = (COSTS.files || {})[rel];
    if (m && m.md5 === md5Of(p)) return { tokens: m.tokens, exact: true };
    return { tokens: Math.round(bytes / 4), exact: false };
  };
  const POLICY = { 'README.md': 'router only', 'AGENTS.md': 'always', 'docs/CODEMAP.md': 'before opening the canonical', 'docs/LAWS.md': 'before any sim/doc edit',
    'docs/RECIPES.md': 'adding a trait/skill/bot', 'docs/GAMES.md': 'GREP ONLY — never load whole',
    'docs/planned/INDEX.md': 'PLANNED engine work only — the island\'s entry point',
    'docs/planned/SPEC.md': 'PLANNED engine work only', 'docs/planned/CONTRACT.md': 'PLANNED engine work only', 'docs/planned/BUILD.md': 'PLANNED engine work only' };
  const policy = { ...POLICY };
  // Handoff files: listed so their cost is visible; read one section, never whole.
  const handoff = list(path.join(root, 'docs', 'handoff'), /\.md$/).map(x => 'docs/handoff/' + x);
  const HP = { 'docs/handoff/HANDOFF.md': 'router: freshness check, which handoff file to read', 'docs/handoff/RUNBOOK.md': 'before the first delivery (s1, s6); else grep headings',
    'docs/handoff/BATCH3-STATUS.md': 'GREP ONLY — landing ledger, newest entry first' };
  for (const f of handoff) policy[f] = HP[f] || 'SLICE ONLY — grep headings, read one section';
  // Completeness gate: every docs/**/*.md and root *.md (except this generated file) must have a read policy above.
  const walk = d => existsSync(d) ? readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name))
    : e.name.endsWith('.md') ? [path.relative(root, path.join(d, e.name)).split(path.sep).join('/')] : []) : [];
  const unlisted = [...list(root, /\.md$/).filter(x => x !== 'STATE.md'), ...walk(path.join(root, 'docs'))].filter(x => !(x in policy)).sort();
  const docs = Object.keys(policy).map(f => {
    const c = tokenCost(f);
    return { file: f, policy: policy[f], approxTokens: c.tokens, exact: c.exact };
  });
  return { canonical:'previews/spinclash-preview.html', md5, lines, stamp, baseline, baselineOk,
    labelNote, archivedBaselines: archived.length, unlisted,
    counts:{proofs:proofs.length,baselines:baselines.length,rootTools:rootTools.length,scripts:scripts.length,tools:tools.length},
    proofs, baselines, rootTools, scripts, tools, docs,
    approxCanonicalTokens: tokenCost('previews/spinclash-preview.html').tokens,
    canonicalTokensExact: tokenCost('previews/spinclash-preview.html').exact };
}
function render(f, cost = '~0.7k') {
  const L = [];
  L.push('<!-- GENERATED by tools/gen-state.mjs — DO NOT EDIT BY HAND. Run `node tools/gen-state.mjs` to refresh. -->');
  L.push('# STATE — current project facts'); L.push('');
  L.push('Contains: the mutable facts of the repo, derived from the canonical and the tree.');
  L.push('Read when: every session, alongside AGENTS.md. Approx token cost: ' + cost + ' (computed).'); L.push('');
  L.push('## Canonical (the one live game)');
  L.push(`- File: \`${f.canonical}\``); L.push(`- md5: \`${f.md5}\``);
  L.push(`- Lines: ${f.lines.toLocaleString('en-US')}`);
  L.push(`- Build stamp (\`<title>\`): \`${f.stamp}\``);
  L.push(`- Token cost: **${f.approxCanonicalTokens.toLocaleString('en-US')}**${f.canonicalTokensExact ? ' (MEASURED with a real BPE tokenizer)' : ' (chars/4 ESTIMATE — the measured value is in docs/token-costs.json)'}`); L.push('');
  L.push('## Fingerprint baseline');
  L.push(`- Pointer: \`.qa/BASELINE\` → \`${f.baseline}\`${f.baselineOk ? '' : '  ⚠ MISSING'}`);
  L.push('- Judge: `node .qa/fingerprint.mjs --compare` (8/8 = behaviour-identical, exit 0).');
  if (f.labelNote) L.push('- ' + f.labelNote);
  L.push(`- Older baselines (${f.archivedBaselines}) live in \`.qa/archive/\` as history only — they prove nothing about the current build.`); L.push('');
  L.push('## Tooling inventory');
  L.push(`- Root tools (${f.counts.rootTools}): ${f.rootTools.map(x => '`'+x+'`').join(' · ')}`);
  L.push(`- scripts/ (${f.counts.scripts}): ${f.scripts.map(x => '`'+x+'`').join(' · ')}`);
  L.push(`- tools/ (${f.counts.tools}, incl. doc/ and lib/): ${f.tools.map(x => '`'+x+'`').join(' · ')}`);
  L.push('- scratch/: gitignored RUNTIME temp dir (bake/gate temp copies, battery logs) — not source; nothing in it is tracked except `.gitkeep`.');
  L.push(`- .qa/ proofs (${f.counts.proofs}): ${f.proofs.map(x => '`'+x+'`').join(' · ')}`);
  L.push(`- .qa/ baselines (${f.counts.baselines}): ${f.baselines.map(x => '`'+x+'`').join(' · ')}`);
  L.push('- Probe registry: `tools/manifest.json` — every proof and tool in one list: what it asserts, whether the battery runs it, whether a law row may cite it, whether an agent may run it. Read it before running anything; `tools/lib/manifest.mjs` loads it and checks it is complete.'); L.push('');
  L.push('## Documentation cost');
  L.push('**MEASURED** = counted with a real BPE tokenizer (see `docs/token-costs.json` for the method). **estimate** = the');
  L.push('`chars/4` heuristic, which is accurate for prose Markdown but ~29% LOW for dense code. A measured');
  L.push('number is used only while the file it describes is unchanged; otherwise the row falls back to the');
  L.push('estimate, so a stale figure is never presented as fact.');
  L.push('');
  L.push('| file | tokens | basis | read policy |'); L.push('|---|---:|---|---|');
  for (const d of f.docs) L.push(`| ${d.file} | ${d.approxTokens.toLocaleString('en-US')} | ${d.exact ? 'measured' : 'estimate'} | ${d.policy} |`); L.push('');
  L.push('## Design state (canonical source: LAWS.md; history: GAMES.md §Current state)');
  L.push('- The current laws, the weapon-trait count and the law-to-probe table are design facts, NOT generated here.');
  L.push('  `docs/LAWS.md` is the sole authority for them; the open queue and owner quotes are in `docs/GAMES.md` §Current state. `tools/lint-docs.mjs` checks the count and the table.');
  L.push('- Implemented: the SpinClash harness (this canonical + bare-Node tools).');
  L.push('- Planned (no code yet): the engine — `docs/planned/BUILD.md` Phases 0–8 (PLANNED).'); L.push('');
  return L.join('\n');
}
const mode = process.argv[2] || '';
const f = facts();
if (f.unlisted.length && mode !== '--json') {
  console.log('gen-state: UNLISTED doc(s) with no read policy: ' + f.unlisted.join(', ') + ' — add each to POLICY in tools/gen-state.mjs');
  process.exit(1);
}
if (mode === '--json') { console.log(JSON.stringify(f)); process.exit(0); }
const costOf = t => '~' + (Math.round(t.length / 400) / 10).toFixed(1) + 'k';
const out = render(f, costOf(render(f))); const target = path.join(root, 'STATE.md');
if (mode === '--check') {
  const cur = existsSync(target) ? readFileSync(target, 'utf8') : '';
  if (cur === out) { console.log('gen-state --check: STATE.md CURRENT'); process.exit(0); }
  console.log('gen-state --check: STATE.md STALE — run node tools/gen-state.mjs'); process.exit(1);
}
writeFileSync(target, out);
console.log(`gen-state: wrote STATE.md — canonical ${f.stamp} md5 ${f.md5} (${f.lines} lines)`);
