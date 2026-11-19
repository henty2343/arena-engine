/* tools/doc/docreflow.mjs — the WHITESPACE-ONLY prose wrapper.
 *
 * WHY IT EXISTS (audit findings D-12, O-05). The repo states the policy — "Prose lines stay <= ~300
 * chars where practical (generated tables/data exempt)" (docs/planned/SPEC.md) — and enforced it
 * NOWHERE: the only cap was a 3,000-BYTE limit on one file, so 257 prose lines across the
 * documentation were over the stated limit, the worst at 2,699 characters. That is a CORRECTNESS
 * rule, not a style rule: the repository's premise is "grep the record, do not read it", and a grep
 * hit on a 2,699-char line costs ~2,100 tokens to answer a question worth ~20.
 *
 * This is a WHITESPACE-ONLY edit, proven three ways before the file is written:
 *   1. the whole-file non-whitespace byte stream is identical
 *   2. the word stream is identical
 *   3. every entry heading still starts a paragraph (no break may swallow a following entry)
 * and the breaks are only ever placed at a ". " or ": " that is OUTSIDE every bold span, code span
 * and bracketed group — so no marked span is ever cut in half.
 *
 * usage: node tools/doc/docreflow.mjs [file] [--check] [--max N]
 *        --check = report what WOULD change, write nothing (idempotency proof); exit 1 if pending
 *        --max N  = the target line length (default 300)
 * It handles ANY markdown file; the checks live in tools/lint-docs.mjs.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { reflow, isNewEntry, DEFAULT_MAX } from '../lib/reflow.mjs';

const args = process.argv.slice(2);
const FILE = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--max') || 'docs/GAMES.md';
const CHECK = args.includes('--check');
const mi = args.indexOf('--max');
const MAX = mi >= 0 ? +args[mi + 1] : DEFAULT_MAX;   // target line length, chars
const MIN_SEGMENT = 60;                        // never make a stub of a segment
const MIN_TAIL = 40;                           // never break off a short tail

const strip = s => s.replace(/\s+/g, '');
const words = s => s.match(/\S+/g) || [];

const src = readFileSync(FILE, 'utf8');
const nl = src.includes('\r\n') ? '\r\n' : '\n';
const lines = src.split(/\r?\n/);

const outLines = [];
let changed = 0, noBreak = 0;
const tooLong = [];
let inFence = false;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (/^```/.test(l.trim())) inFence = !inFence;
  const eligible = !inFence && !l.startsWith('|') && !l.startsWith('#') && l.length > MAX;
  if (eligible) {
    let parts = reflow(l, MAX);
    /* Iterate to a fixed point: bracket/code state resets per line, so a part can expose NEW break
     * points the whole-line pass suppressed; one pass is therefore not idempotent at a lower MAX. */
    if (parts.length > 1) {
      let stable = false;
      for (let pass = 0; pass < 16; pass++) {
        const next = []; let grew = false;
        for (const q of parts) { const a = reflow(q, MAX); if (a.length > 1) grew = true; next.push(...a); }
        parts = next;
        if (!grew) { stable = true; break; }
      }
      if (!stable) {
        console.log(`  line ${i + 1}: ${l.length} chars - no fixed point, left alone`);
        outLines.push(l); continue;
      }
    }
    if (parts.length > 1) {
      for (const q of parts) {
        if ((q.match(/\*\*/g) || []).length % 2 || (q.match(/`/g) || []).length % 2) {
          console.error('reflow: span parity broken at line ' + (i + 1) + ' — refusing');
          process.exit(2);
        }
        if (!isNewEntry(l) && isNewEntry(q)) {
          console.error('reflow: entry heading orphaned at line ' + (i + 1) + ' — refusing');
          process.exit(2);
        }
        if (q.length > MAX && q.trim().length > 0) {
          /* The line resists wrapping (dense marked spans). Leaving it alone is correct - the
           * lint will report it as needing an author, not a tool. */
          tooLong.push(q.length);
        }
      }
      if (isNewEntry(l) && !isNewEntry(parts[0])) {
        console.error('reflow: entry heading lost at line ' + (i + 1) + ' — refusing');
        process.exit(2);
      }
      outLines.push(...parts);
      changed++;
      continue;
    }
    noBreak++;
    console.log(`  line ${i + 1}: ${l.length} chars - no safe break point, left alone`);
  }
  outLines.push(l);
}

const out = outLines.join(nl);
if (strip(out) !== strip(src)) { console.error('reflow: non-whitespace content changed — refusing'); process.exit(2); }
if (words(out).join('|') !== words(src).join('|')) { console.error('reflow: word stream changed — refusing'); process.exit(2); }
/* every entry heading in the source must still start a line */
const headsBefore = lines.filter(isNewEntry).length;
const headsAfter = outLines.filter(isNewEntry).length;
if (headsBefore !== headsAfter) { console.error(`reflow: entry heading count ${headsBefore} → ${headsAfter} — refusing`); process.exit(2); }

console.log(`reflow: ${changed} paragraph(s) split, ${headsAfter} entry headings preserved, whitespace-only edit proven` +
  (noBreak ? ` (${noBreak} long line(s) had no safe break point — left alone)` : '') +
  (tooLong.length ? ` (${tooLong.length} segment(s) still over ${MAX} chars — they resist wrapping and need an author)` : ''));
if (CHECK) {
  console.log(`docreflow --check: ${changed ? 'CHANGES PENDING' : 'already reflowed (idempotent)'}`);
  process.exit(changed ? 1 : 0);
}
writeFileSync(FILE, out);
console.log(`wrote ${FILE} — ${outLines.length} lines, ${(Buffer.byteLength(out) / 1024) | 0} KB`);
