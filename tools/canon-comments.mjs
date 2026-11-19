#!/usr/bin/env node
/* tools/canon-comments.mjs — the canonical comment archivist (audit Phase 4).
 *
 * THE PROBLEM (audit finding W-01). The canonical's comments were 47.07% of its tokens — 49,329 of
 * 147,768 — and the canonical is loaded IN FULL by every agent that touches the game. The comments
 * had drifted into three kinds of text:
 *
 *   KEEP  the WHY   — the rationale, the law, the invariant, the geometry fact. This is the comment's
 *                     job and the thing an agent cannot reconstruct from the code.
 *   DELETE the ARCHAEOLOGY — "what was tried and rejected", "who/when", and the verbatim owner
 *                     quotes. Git holds the history; the owner's ruling was explicit: "you are free
 *                     to remove and delete all of that, an agent doesnt need to know it." Left in place
 *                     it reads as a live option and it costs a third of the file.
 *
 * WHAT THIS TOOL DOES. It extracts every comment with the repo's OWN comment scanner
 * (tools/lib/strip-comments.mjs — the same one the comment-only proof kit uses, so the tool and the
 * proof can never disagree about where a comment is), classifies it, and rewrites the comment TEXT.
 *
 * THE SAFETY INVARIANT. Only comment text changes. No code token moves, no line is re-indented, and
 * the build stamp is not touched. The proof is the repo's own: `.qa/strip-hash.mjs` hashes the
 * normalized (comment-free) code and must report the same three hashes, and
 * `.qa/fingerprint.mjs --compare` must report 8/8.
 *
 * usage:
 *   node tools/canon-comments.mjs --audit     report the classification and the budget; write nothing
 *   node tools/canon-comments.mjs --report    the same, plus every changed comment, before and after
 *   node tools/canon-comments.mjs --apply     rewrite the comment text in place
 *   node tools/canon-comments.mjs --rules     print the rule catalogue
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { scan } from './lib/strip-comments.mjs';
import { RULES as ARCH_RULES, tidyLine, removeRawQuotes, protectGameOwner, restoreGameOwner } from './lib/archaeology.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REL = 'previews/spinclash-preview.html';
const args = process.argv.slice(2);

/* ───────────────────────── THE RULE CATALOGUE ─────────────────────────
 * Each rule is a named, auditable transformation. The order matters: attribution and quotes go
 * first (they are the loudest and the most numerous), then dates, then the mechanical cleanup.
 */
const RULES = ARCH_RULES;

/* Transform a comment body LINE BY LINE: a block comment's frame (" * ") is preserved, and a
 * rule can never join two lines that the author separated. */
function transform(inner) {
  /* A raw quote can span several lines of a block comment, and the frame (" * ") sits INSIDE the
   * quoted span. So the quotes are removed at COMMENT level first - removing the whole span takes
   * the interior frame with it and leaves one clean line. */
  let whole = protectGameOwner(removeRawQuotes(inner));
  const lines = whole.split('\n');
  const outLines = lines.map((l) => {
    const lead = l.match(/^[ \t]*/)[0];
    let t = l.slice(lead.length);
    for (const r of RULES) {
      if (r.id === 'raw-quote') continue;          // already done at comment level
      t = t.replace(r.re, r.to);
      if (r.alt) t = t.replace(r.alt, r.to);
    }
    t = tidyLine(t);
    /* a comment that now opens with punctuation reads as broken: drop the orphaned colon/dash */
    t = t.replace(/^[:;.,\-—\s]+/, '');
    return lead + t;
  });
  /* The last cleanup runs on the WHOLE comment: a dangling ", )" can straddle two lines of a block
   * comment, and the per-line pass cannot see it. */
  return restoreGameOwner(outLines.join('\n')
    .replace(/,\s*\)/g, ')')
    .replace(/\(\s*,/g, '('));
}

/* A comment that has become ONLY archaeology after the rules ran is removed entirely. The block
 * comment's " * " frame is stripped first, so the test sees the text a reader sees. */
const PURE_ARCHAEOLOGY = /^(?:[a-z][a-z0-9]*-r\d+\s*[-—:,]?\s*)*(?:supersedes|replaces|reverted|retired|no longer|used to|formerly|owner|owners'?|20\d\d-\d\d-\d\d|was\b|the\s+owner|landing|at\b|per\b|v\d)/i;
function frameStrip(t) {
  return t.split('\n').map(l => l.replace(/^[ \t]*\*?[ \t]?/, '')).join('\n').trim();
}

/* A comment that is too short to carry a rule is not automatically archaeology. The `@@` REGION
 * MARKERS are load-bearing - tools/lint-markers.mjs and tools/gen-codemap.mjs resolve every region
 * from them - and the first version of this rule deleted them all (a 13-character marker is under
 * any length threshold). So a comment is removed only when it is short AND has no substantive word
 * in it AND carries no marker-like token. */
const LOAD_BEARING = /@@|[_$]|[a-zA-Z]{4,}/;
function classify(original, transformed) {
  if (transformed === original) return 'keep';
  if (!frameStrip(transformed)) return 'delete';
  const plain = frameStrip(transformed);
  if (LOAD_BEARING.test(plain)) return 'trim';
  if (plain.length < 22) return 'delete';
  if (PURE_ARCHAEOLOGY.test(plain)) return 'delete';
  return 'trim';
}

/* ───────────────────────────── THE PASS ───────────────────────────── */
const file = path.join(root, REL);
const html = readFileSync(file, 'utf8');

/* Locate the script blocks and their spans inside the HTML. */
const scriptRe = /<script[^>]*>([\s\S]*?)<\/script>/g;
const edits = [];        // {start, end, text} in FILE coordinates
const report = [];
let m;
while ((m = scriptRe.exec(html))) {
  const body = m[1];
  const bodyStart = m.index + m[0].indexOf(body);
  for (const c of scan(body)) {
    const isLine = c.kind === 'line';
    const inner = body.slice(c.s + 2, isLine ? c.e : c.e - 2);
    const original = inner;
    let t = transform(inner);
    /* THE LENGTH INVARIANT. The repo's comment-only proof hashes the comment-stripped code, and
     * `normalizeCode` preserves the interior whitespace of a line that has code AFTER a comment.
     * So a comment that is shortened while code follows it on the same line moves that code and
     * breaks the proof — even though nothing semantic changed. The fix is precise: a comment whose
     * line has code after it keeps its exact length (the difference is made up with spaces); a
     * comment at the end of its line, or alone on it, is free (the proof trims trailing whitespace
     * and drops blank lines, so its length does not reach the hash). */
    const after = body.slice(c.e, (body.indexOf('\n', c.e) < 0 ? body.length : body.indexOf('\n', c.e)));
    if (after.trim().length > 0 && t.length !== original.length) {
      if (t.length < original.length) {
        const nl = t.lastIndexOf('\n');
        t = (nl < 0 ? t : t.slice(0, nl + 1)) + (nl < 0 ? '' : t.slice(nl + 1)) + ' '.repeat(original.length - t.length);
      } else {
        console.error(`canon-comments: line ${c.s}: the transform LENGTHENED a comment with code after it — refusing`);
        process.exit(2);
      }
    }
    const verdict = classify(original, t);
    report.push({
      line: body.slice(0, c.s).split('\n').length,
      kind: c.kind,
      verdict,
      before: original,
      after: t,
      chars: original.length,
    });
    if (verdict === 'keep') continue;
    if (verdict === 'delete') {
      /* A deleted comment is blanked, not spliced out: the proof hashes the comment-stripped code,
       * and the interior whitespace of a line with code AFTER a comment reaches that hash. Blanking
       * with the same number of characters keeps every code token exactly where it was. */
      const span = body.slice(c.s, c.e).replace(/[^\n]/g, ' ');
      edits.push({ start: bodyStart + c.s, end: bodyStart + c.e, text: span, dropLine: isLine });
    } else {
      /* The delimiters are reproduced EXACTLY (no added spaces): the span length must equal the
       * original span length, or the code after the comment moves and the proof's hash changes.
       * The scanner's inner text already carries the original spacing, so the two delimiters plus
       * t restore the original byte for byte when t is the original text. */
      const marker = isLine ? '//' : '/*';
      const closer = isLine ? '' : '*/';
      edits.push({ start: bodyStart + c.s, end: bodyStart + c.e, text: marker + t + closer, dropLine: false });
    }
  }
}

/* Apply the edits back-to-front so the offsets stay valid. */
let out = html;
for (const e of edits.slice().sort((a, b) => b.start - a.start)) {
  out = out.slice(0, e.start) + e.text + out.slice(e.end);
  if (e.dropLine) {
    /* a line comment that left nothing behind takes its line with it */
    const lineStart = out.lastIndexOf('\n', e.start) + 1;
    let lineEnd = out.indexOf('\n', e.start);
    if (lineEnd < 0) lineEnd = out.length;
    if (out.slice(lineStart, lineEnd).trim() === '') out = out.slice(0, lineStart) + out.slice(lineEnd + 1);
  }
}

const kept = report.filter((r) => r.verdict === 'keep');
const trimmed = report.filter((r) => r.verdict === 'trim');
const deleted = report.filter((r) => r.verdict === 'delete');
const beforeChars = report.reduce((a, r) => a + r.chars, 0);
const afterChars = report.reduce((a, r) => a + (r.verdict === 'keep' ? r.chars : r.verdict === 'delete' ? 0 : r.after.length), 0);

console.log(`canonical comments: ${report.length}  (keep ${kept.length}, trim ${trimmed.length}, delete ${deleted.length})`);
console.log(`comment characters: ${beforeChars} → ${afterChars}  (-${(100 * (1 - afterChars / beforeChars)).toFixed(1)}%)`);
console.log(`comment tokens (chars/4 model): ${Math.round(beforeChars / 4)} → ${Math.round(afterChars / 4)}`);

if (args.includes('--rules')) {
  console.log('\nTHE RULE CATALOGUE');
  for (const r of RULES) console.log(`  ${r.id.padEnd(18)} ${r.what}`);
  process.exit(0);
}

if (args.includes('--audit') && !args.includes('--report')) {
  console.log('\n(audit only - no file was written; pass --report for the per-comment listing)');
  process.exit(0);
}
if (args.includes('--report')) {
  console.log('\n--- every changed comment ---');
  for (const r of report.filter((x) => x.verdict !== 'keep')) {
    console.log(`\nL${r.line} [${r.verdict}]`);
    console.log('  BEFORE: ' + r.before.replace(/\n/g, ' / ').slice(0, 400));
    if (r.verdict === 'trim') console.log('  AFTER : ' + r.after.replace(/\n/g, ' / ').slice(0, 400));
  }
  process.exit(0);
}

if (!args.includes('--apply')) { console.log('\n(dry run — pass --apply to write)'); process.exit(0); }

/* The comment-free code must be byte-identical to the file's current comment-free code. */
const { normalizeCode } = await import('./lib/strip-comments.mjs');
const before = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((x) => normalizeCode(x[1]));
const after = [...out.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((x) => normalizeCode(x[1]));
if (JSON.stringify(before) !== JSON.stringify(after)) {
  console.error('canon-comments: the comment-free code CHANGED — refusing to write');
  for (let i = 0; i < Math.max(before.length, after.length); i++) {
    const b = (before[i] || '').split('\n'), a = (after[i] || '').split('\n');
    for (let j = 0; j < Math.max(b.length, a.length); j++) {
      if ((b[j] || '') !== (a[j] || '')) {
        console.error(`  script ${i} line ${j + 1}\n    BEFORE: ${JSON.stringify((b[j] || '').slice(0, 160))}\n    AFTER : ${JSON.stringify((a[j] || '').slice(0, 160))}`);
        break;
      }
    }
  }
  process.exit(2);
}
const nonBefore = html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
const nonAfter = out.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
if (nonBefore !== nonAfter) {
  console.error('canon-comments: the NON-SCRIPT part of the file changed — refusing to write');
  process.exit(2);
}
writeFileSync(file, out);
console.log(`\nwrote ${REL} — ${out.split('\n').length} lines (was ${html.split('\n').length})`);
