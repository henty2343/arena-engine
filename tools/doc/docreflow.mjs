/* tools/doc/docreflow.mjs — readability reflow for GAMES.md's monster paragraphs
 * (2026-10-23 hygiene pass, owner pick "hygiene"). Several Measured-facts
 * entries are single 4–13 KB lines: unreadable in any editor or viewer.
 *
 * This splits them into paragraphs. It is a WHITESPACE-ONLY edit, proven three
 * ways before the file is written:
 *   1. the whole-file non-whitespace byte stream is identical
 *   2. every resulting line has balanced `**` and backtick counts (no break
 *      inside a bold/code span — the first attempt did exactly that)
 *   3. every entry heading still starts a paragraph (no break may swallow a
 *      following entry — the first attempt merged two entries because they are
 *      adjacent lines with no blank between them)
 *
 * usage: node tools/doc/docreflow.mjs [file] [--check] [--max N]
 *        --check = report what WOULD change, write nothing (idempotency proof) */
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { historyFiles } from '../lib/docset.mjs';

const args = process.argv.slice(2);
const FILE = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--max') || 'docs/GAMES.md';
const CHECK = args.includes('--check');
const mi = args.indexOf('--max');
const MAX = mi >= 0 ? +args[mi + 1] : 600;      // target paragraph length, chars
const MIN_BREAK = 200;                            // never break a short tail off
const BIG = 600;   // B3-REFLOW: lower threshold - most long lines were never eligible                                 // only reflow lines above this, bytes

/* B3C: with no explicit path the record set is GAMES.md + docs/history/*.md. Each era file
 * is reflowed by re-invoking this same script, so the per-file whitespace proofs below are
 * unchanged; --check reports pending work in ANY file and exits 1 (it used to always exit 0,
 * which made the gate unable to fail — verify judges by exit code). */
const SELF = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SELF), '..', '..');
const EXPLICIT = args.some((a, i) => !a.startsWith('--') && args[i - 1] !== '--max');
let histPending = 0, histFiles = 0;
if (!EXPLICIT) {
  for (const f of historyFiles(ROOT)) {
    histFiles++;
    const a = [SELF, f, ...(args.includes('--max') ? ['--max', String(MAX)] : []), ...(CHECK ? ['--check'] : [])];
    const r = spawnSync(process.execPath, a, { cwd: ROOT, encoding: 'utf8' });
    process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
    if (r.status !== 0 && !CHECK) process.exit(r.status || 2);
    if ((r.stdout || '').includes('CHANGES PENDING')) histPending++;
  }
}

const src = readFileSync(FILE, 'utf8');
const nl = src.includes('\r\n') ? '\r\n' : '\n';
const lines = src.split(/\r?\n/);

/* entry heading = line-leading bold span whose opening sentence carries a date
 * or an owner attribution (matches navgen's detector) */
function isNewEntry(l) {
  if (l.startsWith('### ')) return /\((20\d\d-\d\d-\d\d|owner)/.test(l);   // B3A: ### heading form
  if (!/^\*\*[^*]/.test(l)) return false;
  const c = l.indexOf('**', 2);
  return c > 0 && /\((20\d\d-\d\d-\d\d|owner)/.test(l.slice(0, c + 2));
}

/* in which sections may we reflow? the record sections only */
const secs = lines.map((l, i) => (l.startsWith('## ') ? [i, l] : null)).filter(Boolean);
function inSection(i, names) {
  let cur = null;
  for (const [j, t] of secs) { if (j <= i) cur = t; else break; }
  return cur !== null && (names.some(n => cur.startsWith(n)) || /^## 20\d\d-\d\d-\d\d/.test(cur));
}
const SECTIONS = ['## Measured facts', '## Current state', '## Weapon art', '## Design principles', '## Open design questions', '## Testing recipe'];

function safePoints(t) {
  const pts = [];
  let depth = 0, code = false, quote = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '`') { code = !code; continue; }
    if (code) continue;
    /* B3-REFLOW: quote state is no longer tracked. An odd double-quote count (nested
     * owner quotes) used to make the rest of the line unbreakable. A break may now fall
     * inside a quote; content identity is still proven by the three whole-file proofs. */
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && (c === '.' || c === ':') && i > MIN_BREAK && t[i + 1] === ' ') {
      const pre = t.slice(0, i + 2);
      const rest = t.slice(i + 2);
      if ((pre.match(/\*\*/g) || []).length % 2 !== 0) continue;      // inside a bold span
      if ((pre.match(/`/g) || []).length % 2 !== 0) continue;          // inside a code span
      if (isNewEntry(rest)) continue;                                  // would swallow an entry
      if (rest.trim().length < MIN_BREAK) continue;                    // pointless tail
      pts.push(i + 2);
    }
  }
  return pts;
}

function reflow(t) {
  const out = [];
  let start = 0;
  for (const q of safePoints(t)) {
    if (q - start >= MAX) { out.push(t.slice(start, q).trimEnd()); start = q; }
  }
  out.push(t.slice(start).trimEnd());
  return out.filter(x => x.trim());
}

const strip = s => s.replace(/\s+/g, '');
const words = s => s.match(/\S+/g) || [];

const outLines = [];
let changed = 0, skippedFence = false;
let inFence = false;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (/^```/.test(l.trim())) inFence = !inFence;
  const eligible = !inFence && !l.startsWith('|') && !l.startsWith('#') &&
    Buffer.byteLength(l) > BIG && inSection(i, SECTIONS);
  if (eligible) {
    let parts = reflow(l);
    /* B3-REFLOW: iterate to a fixed point. Bracket/code state resets per line, so a part
     * can expose NEW break points the whole-line pass suppressed; one pass is therefore
     * not idempotent at a lower MAX. Iterate until no part splits, so --check stays green. */
    if (parts.length > 1) {
      let stable = false;
      for (let pass = 0; pass < 16; pass++) {
        const next = []; let grew = false;
        for (const q of parts) { const a = reflow(q); if (a.length > 1) grew = true; next.push(...a); }
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
          console.error(`reflow: span parity broken at line ${i + 1} — refusing`);
          process.exit(2);
        }
        if (!isNewEntry(l) && isNewEntry(q)) {
          console.error(`reflow: entry heading orphaned at line ${i + 1} — refusing`);
          process.exit(2);
        }
      }
      if (isNewEntry(l) && !isNewEntry(parts[0])) {
        console.error(`reflow: entry heading lost at line ${i + 1} — refusing`);
        process.exit(2);
      }
      outLines.push(...parts);
      changed++;
      console.log(`  line ${i + 1}: ${(Buffer.byteLength(l) / 1024).toFixed(0)} KB → ${parts.length} paragraphs`);
      continue;
    }
    if (safePoints(l).length === 0) { skippedFence = true; console.log(`  line ${i + 1}: ${l.length} chars - no safe break point, left alone`); }
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

console.log(`reflow: ${changed} paragraph(s) split, ${headsAfter} entry headings preserved, whitespace-only edit proven${skippedFence ? ' (some long lines had no safe break point — left alone)' : ''}`);
if (CHECK) {
  const pending = changed || histPending;
  console.log(`docreflow --check: ${pending ? 'CHANGES PENDING' : 'already reflowed (idempotent)'} — ${histFiles + 1} file(s) in the record set`);
  process.exit(pending ? 1 : 0);
}
writeFileSync(FILE, out);
console.log(`wrote ${FILE} — ${outLines.length} lines, ${(Buffer.byteLength(out) / 1024) | 0} KB`);
console.log(`docreflow: ${histFiles + 1} file(s) in the record set (GAMES.md + docs/history/)`);
