/* tools/lib/reflow.mjs — the WHITESPACE-ONLY prose wrapper, shared by the writer and the linter.
 *
 * WHY A LIBRARY (audit findings D-12, O-05). The repo states the policy — "Prose lines stay <= ~300
 * chars where practical (generated tables/data exempt)" (docs/planned/SPEC.md) — and enforced it
 * NOWHERE: 257 prose lines across the documentation were over the limit, the worst at 2,699
 * characters. That is a CORRECTNESS rule, not a style rule: the repository's premise is "grep the
 * record, do not read it", and a grep hit on a 2,699-char line costs ~2,100 tokens to answer a
 * question worth ~20.
 *
 * The wrapper places a break ONLY at a ". " / ": " / "; " / ", " / " — " that lies OUTSIDE every bold
 * span, code span and bracketed group, so no marked span is ever cut in half, and it never breaks off
 * a short tail or swallow a following entry heading. A comma is a legal break because markdown
 * renders consecutive lines of a paragraph as one flowing paragraph: the rendered text is identical.
 * (A first sentence longer than the cap would otherwise have no break point at all - the SPEC's
 * visual-design paragraph runs 450 characters before its first period.)
 *
 * Both tools/doc/docreflow.mjs (which WRITES the wrapped file) and tools/lint-docs.mjs (which
 * enforces the cap) ask this module the same question, so the linter and the writer can never
 * disagree about what is wrappable: a line the writer could split is an ERROR in the lint; a line it
 * could not is a WARNING that needs an author, not a tool.
 */
export const DEFAULT_MAX = 300;
const MIN_SEGMENT = 60;   // never make a stub of a segment
const MIN_TAIL = 40;      // never break off a short tail

/* entry heading = line-leading bold span whose opening sentence carries a date or an owner
 * attribution (matches navgen's detector) */
export function isNewEntry(l) {
  if (l.startsWith('### ')) return /\((20\d\d-\d\d-\d\d|owner)/.test(l);
  if (!/^\*\*[^*]/.test(l)) return false;
  const c = l.indexOf('**', 2);
  return c > 0 && /\((20\d\d-\d\d-\d\d|owner)/.test(l.slice(0, c + 2));
}

/* The positions at which this line MAY be cut. A position is the index just after the break
 * character and its trailing space. */
export function safePoints(t) {
  const pts = [];
  let depth = 0, code = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '`') { code = !code; continue; }
    if (code) continue;
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && (c === '.' || c === ':' || c === ';' || c === ',' || c === '—') && t[i + 1] === ' ') {
      const pre = t.slice(0, i + 2);
      const rest = t.slice(i + 2);
      if ((pre.match(/\*\*/g) || []).length % 2 !== 0) continue;      // inside a bold span
      if ((pre.match(/`/g) || []).length % 2 !== 0) continue;          // inside a code span
      if (isNewEntry(rest)) continue;                                  // would swallow an entry
      if (rest.trim().length < MIN_TAIL) continue;                    // pointless tail
      pts.push(i + 2);
    }
  }
  return pts;
}

/* Greedy wrap: each produced line is at most `max` characters, cut only at a safe point. */
export function reflow(t, max = DEFAULT_MAX) {
  const pts = safePoints(t);
  const out = [];
  let start = 0;
  while (start < t.length) {
    let p = -1;
    for (const q of pts) {
      if (q <= start) continue;
      if (q - start <= max) p = q; else break;
    }
    if (p < 0 || p - start < MIN_SEGMENT) break;      // nothing worth cutting here
    out.push(t.slice(start, p).trimEnd());
    start = p;
  }
  out.push(t.slice(start).trimEnd());
  return out.filter(x => x.trim());
}

/* Is this line wrappable at all? (the linter's question: "could a tool fix this?") */
export function wrappable(t, max = DEFAULT_MAX) {
  if (t.length <= max) return false;
  const parts = reflow(t, max);
  return parts.length > 1 && parts.every(p => p.length <= max);
}

/* A markdown table row is data, not prose: its columns ARE the content. */
export function isTableRow(l) { return /^\s*\|/.test(l); }
