#!/usr/bin/env node
/* tools/gen-codemap.mjs — GENERATES docs/CODEMAP.md, the navigation map for the ONE canonical.
 * Agents open CODEMAP before the canonical: it names every region and top-level symbol so a
 * ~148k-token file can be entered at one grep instead of read whole.
 * Usage: node tools/gen-codemap.mjs | --check (exit 1 if stale) | --json | --file <path>
 * Read-only vs the canonical. Bare Node, no dependencies.
 *
 * COMPLETENESS (audit findings D-08, D-09). The generator used to under-report its own subject:
 *   - its declaration regex matched EXACTLY two leading spaces, so a declaration at column 0
 *     (WEAPON_IDS - the 22-weapon roster id list) was missing from the symbol index;
 *   - it mapped only the first <script> block, so the 83 lines of the Chrome UI shell and the
 *     public API object (window.APP) belonged to no region at all;
 *   - it had no completeness assertion, so `--check` could only prove the output matched the
 *     generator, never that the generator's model of the file was complete.
 * It now widens the scan, covers every line of the file, and ASSERTS both properties. A map that
 * cannot prove its own completeness is a map an agent cannot trust.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const argOf = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const CANON = argOf('--file') || path.join(root, 'previews', 'spinclash-preview.html');

/* Comment scanner: strings, template literals (nested ${}), regex literals, // and /* *\/.
 * Regex-vs-division is a heuristic; tools/lib/strip-comments.mjs cross-checks it. */
import { scan, strip } from './lib/strip-comments.mjs';

const tok = s => Math.round(s.length / 4);

/* A top-level declaration of a script IIFE. Block 0's IIFE body sits at indent 2; block 1's sits
 * at indent 4. `window.APP = {` is an assignment, not a declaration, so it is matched separately. */
function declRe(indent) {
  return new RegExp('^\\s{' + indent + '}(const|let|var|function|class|async function)\\s+([A-Za-z_$][\\w$]*)');
}
function collectDecls(lines, from, to, indent, region) {
  const out = [];
  for (let L = from; L <= to; L++) {
    const mm = (lines[L - 1] || '').match(declRe(indent));
    if (mm) out.push({ name: mm[2], kind: mm[1], line: L, region });
  }
  return out;
}
/* window.APP is the canonical's PUBLIC API - the surface every probe drives - so it is indexed as a
 * symbol with its members. The members are read from the object literal itself, not hand-listed. */
function collectAppApi(lines, masked, region) {
  const out = [];
  for (let L = 1; L <= lines.length; L++) {
    if (!/^\s{2}window\.APP\s*=\s*\{/.test(lines[L - 1])) continue;
    out.push({ name: 'window.APP', kind: 'api', line: L, region });
    /* The members are read from the object literal by BRACE DEPTH, not by splitting on commas: the
     * inline `info: function () { return { seed: seed, paused: paused, ... }; }` bodies are full of
     * `key:` pairs that are NOT members of the API. Only keys at depth 1 are members. */
    let end = L;
    while (end <= lines.length && !/^\s{2}\};/.test(lines[end])) end++;
    let depth = 1, inStr = null, member = null;
    for (let k = L + 1; k <= end && k <= lines.length; k++) {
      const line = masked[k - 1];
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inStr) { if (ch === '\\') i++; else if (ch === inStr) inStr = null; continue; }
        if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
        if (ch === '{' || ch === '[' || ch === '(') { depth++; continue; }
        if (ch === '}' || ch === ']' || ch === ')') { depth--; continue; }
        if (depth === 1) {
          const mm = /^\s*([A-Za-z_$][\w$]*)\s*:/.exec(line.slice(i));
          if (mm) { out.push({ name: 'window.APP.' + mm[1], kind: 'api-member', line: k, region }); i += mm[0].length - 1; }
        }
      }
    }
    break;
  }
  return out;
}

function facts() {
  const buf = readFileSync(CANON); const html = buf.toString('utf8');
  const md5 = createHash('md5').update(buf).digest('hex');
  const lines = html.split('\n');
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1];
  const stamp = (title.match(/build\s+([A-Za-z0-9._-]+)/) || [, '(unknown)'])[1];
  // script blocks, with 1-based file line of the opening tag
  const blocks = [];
  const re = /<script[^>]*>([\s\S]*?)<\/script>/g; let m;
  while ((m = re.exec(html))) {
    const startLine = html.slice(0, m.index).split('\n').length;
    const body = m[1];
    const bodyLine = startLine + (m[0].slice(0, m[0].indexOf('>') + 1).split('\n').length - 1);
    blocks.push({ startLine: bodyLine, body, comments: scan(body) });
  }
  const main = blocks[0];
  const stripped = strip(main.body, main.comments);
  /* A COMMENT-BLANKED copy of the file: every comment character becomes a space, newlines are kept,
   * so line numbers stay exact. The API-member scan runs on this, because a trailing comment like
   * "// pairing: pick 2 of the cast" would otherwise be read as a member named "pairing" - and a
   * quote inside a comment ("the owner's own eyes") would throw the brace-depth scan off entirely. */
  const maskedChars = html.split('');
  for (const blk of blocks) {
    const bodyOffsetInFile = html.indexOf(blk.body, html.indexOf('<script'));
    for (const c of blk.comments) {
      for (let i = bodyOffsetInFile + c.s; i < bodyOffsetInFile + c.e && i < maskedChars.length; i++)
        if (maskedChars[i] !== '\n') maskedChars[i] = ' ';
    }
  }
  const masked = maskedChars.join('').split('\n');
  // comment char count per file line (for per-region code-only cost)
  const commentChars = new Array(lines.length + 2).fill(0);
  const bodyLineStart = [0];
  for (let k = 0; k < main.body.length; k++) if (main.body[k] === '\n') bodyLineStart.push(k + 1);
  const lineOf = off => { let lo = 0, hi = bodyLineStart.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (bodyLineStart[mid] <= off) lo = mid; else hi = mid - 1; } return lo; };
  for (const c of main.comments) {
    let L = lineOf(c.s);
    while (L < bodyLineStart.length && bodyLineStart[L] < c.e) {
      const a = Math.max(c.s, bodyLineStart[L]);
      const b = Math.min(c.e, L + 1 < bodyLineStart.length ? bodyLineStart[L + 1] - 1 : main.body.length);
      if (b > a) commentChars[main.startLine + L] += b - a;
      L++;
    }
  }
  // regions: @@ markers win; else banner block-comments at indent <= 2
  const marks = [];
  for (let L = main.startLine + 1; L < main.startLine + main.body.split('\n').length; L++) {
    const t = lines[L - 1] || '';
    const mk = t.match(/^\s*\/\/\s*@@([a-z0-9-]+\/[a-z0-9-]+)\s*$/);
    if (mk) { marks.push({ line: L, name: mk[1], kind: 'marker' }); continue; }
    const bn = t.match(/^(\s{0,2})\/\*\s*(.*)$/);
    if (!bn) continue;
    // a marker directly above a banner wins; do not double-count the banner
    if (/^\s*\/\/\s*@@[a-z0-9-]+\/[a-z0-9-]+\s*$/.test(lines[L - 2] || '')) continue;
    const head = bn[2];
    if (!(/^-{3,}\s*\S/.test(head) || /^={5,}/.test(head))) continue;
    let name = head.replace(/^[-=\s]+/, '').replace(/[-=\s]*\*?\/?$/, '').trim();
    if (!name) { // ===== banner: title lives on the next line
      const nxt = (lines[L] || '').replace(/^\s*\*?\s*/, '').trim();
      name = nxt.split(/\s+—\s+|\s+-\s+/)[0].trim();
    }
    name = name.replace(/\s*----.*$/, '').replace(/\s*=+\s*$/, '').trim();
    // short, stable handle: first clause only, so the map stays scannable
    name = name.split(/\s+—\s+|\s+–\s+|\s*\(|\s+\d{4}-/)[0].trim();
    if (name.length > 48) name = name.slice(0, 48).replace(/\s+\S*$/, '') + '…';
    marks.push({ line: L, name: name || '(unnamed)', kind: 'banner' });
  }
  const endLine = main.startLine + main.body.split('\n').length - 2;
  /* Two SYNTHETIC regions so the region table covers the WHOLE file: the markup before the first
   * script block, and the Chrome UI shell after it. Without them the map silently omitted 83 lines
   * of the file - including the whole public API surface. */
  const chromeStart = endLine + 1;
  marks.unshift({ line: 1, name: 'head/shell', kind: 'synthetic' });
  marks.push({ line: chromeStart, name: 'app/chrome', kind: 'synthetic' });
  const regions = marks.map((mk, i) => {
    const from = mk.line, to = (i + 1 < marks.length ? marks[i + 1].line - 1 : lines.length - 1);
    const text = lines.slice(from - 1, to).join('\n');
    const cc = commentChars.slice(from, to + 1).reduce((a, b) => a + b, 0);
    return { name: mk.name, kind: mk.kind, from, to, tokens: tok(text), codeTokens: Math.max(0, tok(text) - Math.round(cc / 4)) };
  });
  /* Symbols of the sim IIFE: indent 0 (a module-level const) OR indent 2 (the IIFE body). */
  const symbols = [];
  symbols.push(...collectDecls(lines, main.startLine + 1, endLine, 0, null));
  symbols.push(...collectDecls(lines, main.startLine + 1, endLine, 2, null));
  symbols.push(...collectAppApi(lines, masked, null));
  /* The Chrome shell IIFE: its body is at indent 4. */
  if (blocks[1]) {
    const b1 = blocks[1];
    const b1End = b1.startLine + b1.body.split('\n').length - 2;
    symbols.push(...collectDecls(lines, b1.startLine + 1, b1End, 4, 'app/chrome'));
  }
  for (const s of symbols) {
    if (s.region) continue;
    const r = regions.find(r => s.line >= r.from && s.line <= r.to);
    s.region = r ? r.name : '(unmapped)';
  }
  // generated data: never read these ranges
  const data = [];
  const beg = lines.findIndex(l => l.includes('LEN_CIRCLES BEGIN')) + 1;
  const end = lines.findIndex(l => l.includes('LEN_CIRCLES END')) + 1;
  if (beg && end) data.push({ name: 'LEN_CIRCLES (baked ladder)', from: beg, to: end, why: 'generated by .qa/lengrow-bake.mjs — never hand-edit' });
  const cv = lines.findIndex(l => /^  const CIRCLES_V2 = \{/.test(l)) + 1;
  if (cv) { let e = cv; while (e < lines.length && !/^  \};/.test(lines[e])) e++; data.push({ name: 'CIRCLES_V2 rows', from: cv, to: e + 1, why: 'baked covering circles — re-bake, never hand-edit' }); }
  const long = [];
  for (let L = 1; L <= lines.length; L++) if ((lines[L - 1] || '').length > 800) long.push(L);
  const runs = [];
  for (const L of long) {
    const last = runs[runs.length - 1];
    if (last && L === last.to + 1) last.to = L; else runs.push({ from: L, to: L });
  }
  return { md5, stamp, lineCount: lines.length - 1, blocks: blocks.length, regions, symbols, data, runs,
    canonicalTokens: tok(html), commentSpans: main.comments.length,
    commentTokens: Math.round(main.comments.reduce((a, c) => a + (c.e - c.s), 0) / 4) };
}

/* THE COMPLETENESS ASSERTIONS. --check used to ask only "does the output match the generator?".
 * These ask the question an agent actually depends on: does the map cover the file? */
function completeness(f, lines) {
  const problems = [];
  // 1. every line of the file belongs to some region
  const covered = new Array(f.lineCount + 2).fill(false);
  for (const r of f.regions) for (let L = r.from; L <= r.to && L <= f.lineCount; L++) covered[L] = true;
  const gaps = [];
  for (let L = 1; L <= f.lineCount; L++) if (!covered[L]) gaps.push(L);
  if (gaps.length) problems.push(`${gaps.length} line(s) of the canonical are in no region (first: ${gaps.slice(0, 6).join(', ')})`);
  // 2. every symbol is mapped to a real region
  const unmapped = f.symbols.filter(s => s.region === '(unmapped)');
  if (unmapped.length) problems.push(`${unmapped.length} symbol(s) are in no region: ${unmapped.slice(0, 6).map(s => s.name).join(', ')}`);
  // 3. an independent declaration scan must find exactly as many top-level declarations as the map lists
  const independent = [];
  for (let L = 1; L <= lines.length; L++) {
    const t = lines[L - 1] || '';
    if (/^\s{0,2}(const|let|var|function|class|async function)\s+[A-Za-z_$]/.test(t)) independent.push(L);
  }
  const mapped = new Set(f.symbols.filter(s => s.kind !== 'api-member').map(s => s.line + ':' + s.name));
  const missing = independent.filter(L => {
    const t = lines[L - 1];
    const mm = t.match(declRe(0)) || t.match(declRe(2));
    return mm && !mapped.has(L + ':' + mm[2]);
  });
  if (missing.length) problems.push(`${missing.length} top-level declaration(s) are not in the symbol index (first at line ${missing[0]})`);
  return problems;
}

function render(f) {
  const L = [];
  L.push('<!-- GENERATED by tools/gen-codemap.mjs — DO NOT EDIT BY HAND. Run `node tools/gen-codemap.mjs` to refresh. -->');
  L.push('# CODEMAP — the canonical, by name');
  L.push('');
  L.push('Contains: region map, top-level symbol index and no-read data ranges for `previews/spinclash-preview.html`.');
  L.push('Read when: before opening the canonical. Token cost: see STATE.md §Documentation cost.');
  L.push('');
  L.push(`Built from md5 \`${f.md5}\` · stamp \`${f.stamp}\` · ${f.lineCount.toLocaleString('en-US')} lines.`);
  L.push('**Line numbers are valid only at that md5.** Symbol names are the durable handle — grep the name.');
  L.push('');
  L.push(`Canonical ≈ ${f.canonicalTokens.toLocaleString('en-US')} tokens; script block 0 carries ${f.commentSpans} comment spans ≈ ${f.commentTokens.toLocaleString('en-US')} tokens.`);
  L.push('');
  L.push('## Regions');
  L.push('');
  L.push('Every line of the file belongs to exactly one region — the generator asserts it.');
  L.push('');
  L.push('| region | lines | ~tokens | ~code-only |');
  L.push('|---|---|---:|---:|');
  for (const r of f.regions) L.push(`| ${r.name} | ${r.from}–${r.to} | ${r.tokens.toLocaleString('en-US')} | ${r.codeTokens.toLocaleString('en-US')} |`);
  L.push('');
  L.push('## GENERATED DATA — do not read');
  L.push('');
  L.push('Baked numeric blocks. Reading them costs thousands of tokens and teaches nothing; re-bake instead.');
  L.push('');
  for (const d of f.data) L.push(`- **${d.name}** — lines ${d.from}–${d.to}: ${d.why}`);
  if (f.runs.length) {
    L.push('');
    L.push('Lines over 800 chars (mostly baked rows):');
    L.push('');
    L.push(f.runs.map(r => r.from === r.to ? `${r.from}` : `${r.from}–${r.to}`).join(' · '));
  }
  L.push('');
  L.push('## Symbol index');
  L.push('');
  L.push('Top-level declarations of the sim IIFE, grouped by region. Grep the name in the canonical.');
  L.push('');
  const byRegion = new Map();
  for (const s of f.symbols) { if (!byRegion.has(s.region)) byRegion.set(s.region, []); byRegion.get(s.region).push(s); }
  for (const [reg, list] of byRegion) {
    L.push(`### ${reg}`);
    L.push('');
    L.push(list.map(s => '`' + s.name + '`').join(' · '));
    L.push('');
  }
  return L.join('\n');
}

const f = facts();
const out = render(f);
if (args.includes('--json')) { console.log(JSON.stringify(f)); process.exit(0); }
const target = path.join(root, 'docs', 'CODEMAP.md');
if (args.includes('--check')) {
  const cur = existsSync(target) ? readFileSync(target, 'utf8') : '';
  const problems = completeness(f, readFileSync(CANON, 'utf8').split('\n'));
  const ok = cur === out && problems.length === 0;
  if (ok) { console.log('gen-codemap --check: CODEMAP.md CURRENT'); console.log(JSON.stringify({ check:'gen-codemap', ok:true, regions:f.regions.length, symbols:f.symbols.length })); process.exit(0); }
  if (cur !== out) console.log('gen-codemap --check: CODEMAP.md STALE — run node tools/gen-codemap.mjs');
  for (const p of problems) console.log('gen-codemap --check: INCOMPLETE — ' + p);
  console.log(JSON.stringify({ check:'gen-codemap', ok:false, errors: problems.length ? problems : ['CODEMAP.md stale'] }));
  process.exit(1);
}
writeFileSync(target, out);
console.log(`gen-codemap: wrote docs/CODEMAP.md — ${f.regions.length} regions, ${f.symbols.length} symbols, md5 ${f.md5}`);
console.log(JSON.stringify({ check:'gen-codemap', ok:true, regions:f.regions.length, symbols:f.symbols.length }));
