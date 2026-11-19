/* tools/lib/archaeology.mjs — the shared "decision archaeology" rule catalogue.
 *
 * WHY IT IS A LIBRARY (audit findings W-01, W-02; owner ruling 2026-11-19). The repo's doctrine is
 * "Current docs state current rules; dated entries + git history hold history" - and the canonical's
 * COMMENT layer broke it: 47% of the file (49,329 tokens) was comments, and a third of that was
 * decision archaeology - owner quotes, who/when, and the record of approaches that were rejected.
 * The owner's ruling was explicit: "you are free to remove and delete all of that, an agent doesnt
 * need to know it."
 *
 * The same three kinds of text appear in the documentation, so ONE catalogue serves both surfaces:
 *   tools/canon-comments.mjs   the canonical's comment layer
 *   tools/docs-archaeology.mjs the prose of a markdown document
 * One catalogue means the two surfaces cannot drift into different standards of "what is archaeology".
 *
 * Each rule is a named, auditable transformation. The order matters: attribution and quotes go
 * first, then dates, then the mechanical cleanup.
 */
export const RULES = [
  {
    id: 'attrib-paren',
    what: 'an owner-attribution parenthetical - "(owner option 1, 2026-10-21)", "(owner law)", "(owner: ...)"',
    re: /[ \t]*[([]\s*(?:the\s+)?owner(?:'s)?\b[^()[\]]*[)\]]/gi,
    to: '',
  },
  {
    id: 'attrib-inline',
    what: 'an owner attribution inside a parenthetical that also carries content - "(owner ruling M2, two languages)"',
    re: /\(\s*(?:the\s+)?owner(?:'s)?\b[^()]*?\)/gi,
    to: '',
  },
  {
    id: 'owner-quote',
    what: 'a verbatim owner quote - owner: "...", owner word "...", owner\'s eye: "..."',
    re: /[ \t]*\(?\s*\bowner(?:'s)?(?:\s+(?:word|eye|ruling|decision|request|playtest|catch|heads-up|bug seed|approval|approved|eye-rulings|eye-judgment|flight tuning|playtest eye-ruling))?\s*[:\-]\s*\*?["\u201c][^"\u201d]*["\u201d]\*?\)?/gi,
    to: '',
  },
  {
    id: 'owner-quote-bare',
    what: 'a verbatim owner quote with no colon - owner word "...", owner playtest "..."',
    re: /[ \t]*\bowner(?:'s)?\s+(?:word|playtest|eye|catch|head|request|approval)\s+\*?["\u201c][^"\u201d]*["\u201d]\*?/gi,
    to: '',
  },
  {
    id: 'date',
    what: 'an explicit date - 2026-10-21 (with any trailing tag and colon)',
    re: /[ \t]*\b20\d\d-\d\d-\d\d\b(?:[ \t]*\([^)\n]{1,30}\))?[ \t]*:/g,
    to: '',
    alt: /[ \t]*\b20\d\d-\d\d-\d\d\b/g,
  },
  {
    id: 'owner-phrase',
    what: 'a bare owner attribution phrase - "owner ruling", "owner word", "the owner\'s eye"',
    re: /\b(?:the\s+)?owner(?:'s)?\s+(?:word|words|eye|eyes|ruling|rulings|decision|decisions|request|requests|playtest|catch|go|bug seed|heads-up|approval|approved|tune|pick\s*\d+|option\s*\d+|volley ruling|eye-ruling|eye-rulings|shape grammar|flight tuning|prototype|solo prototype|eye-judgment toggle)\b/gi,
    to: '',
  },
  {
    id: 'owner-quote-colon',
    what: 'a verbatim quote that introduces an explanation - ("same shape except their color": one page design in three inks)',
    re: /\*?["\u201c][^"\u201d]{4,200}["\u201d]\s*:/g,
    to: '',
  },
  {
    id: 'supersedes',
    what: 'a supersession statement - SUPERSEDES halo-r39\'s owner-anchored oval',
    re: /[ \t]*SUPERSEDES\s+[^(\n]*?(?=\(|,|\.|;|\n|$)/gi,
    to: '',
  },
  {
    id: 'retired-inline',
    what: 'an inline retirement marker - trait.shotR RETIRED',
    re: /[ \t]*RETIRED\b(?=\s*[-—:])/gi,
    to: '',
  },
  {
    id: 'reverted-clause',
    what: 'a reversion clause - (lane-r81\'s scorched lane REVERTED whole)',
    re: /[ \t]*\([^)]*\bREVERTED\b[^)]*\)/gi,
    to: '',
  },
  {
    id: 'retired-paren',
    what: 'a retired-precedent aside - (both retired with the fields)',
    re: /[ \t]*\([^)]*\bretired\b[^)]*\)/gi,
    to: '',
  },
  {
    id: 'consolidated',
    what: 'a consolidation aside - (review-r60 consolidated the layered header)',
    re: /[ \t]*\([^)]*\bconsolidat\w*\b[^)]*\)/gi,
    to: '',
  },
  {
    id: 'replaces-paren',
    what: 'a replacement aside - (v0.9, replaces the sling)',
    re: /[ \t]*\([^)]*\breplaces\b[^)]*\)/gi,
    to: '',
  },
  {
    id: 'was-number',
    what: 'a superseded number - len was 116',
    re: /[ \t]*[-—]?[ \t]*\bwas\s+[0-9][0-9.,]*/gi,
    to: '',
  },
  {
    id: 'formerly',
    what: 'a "formerly" aside - formerly four constants (CATCH_PAD 0, ...)',
    re: /[ \t]*formerly\s+[^,.;\n]*[,;]?/gi,
    to: '',
  },
  {
    id: 'owner-verb',
    what: 'a verb attributed to the owner - "the owner asked for" -> "asked for"',
    re: /\bthe\s+owner\s+(asked|wanted|said|picked|chose|decided|ruled|approved|requested|held|meant)\b/gi,
    to: '$1',
  },
  {
    id: 'owner-word',
    what: 'the bare word "owner" wherever it attributes a decision - "are owner rulings", "the owner\'s eye"',
    re: /\bowner(?:'s)?\b/gi,
    to: '',
  },
  {
    id: 'used-to',
    what: 'a rejected-approach sentence - "used to do X"',
    re: /[ \t]*\bused to\b[^.\n]*(?=\.|$)/gi,
    to: '',
  },
  {
    id: 'raw-quote',
    what: 'a raw quote of the owner\'s words - "i really like this pattern for bomerang"',
    re: /"[^"\n]{12,}"/g,
    to: '',
  },
  {
    id: 'previously',
    what: 'a superseded aside - "previously Y"',
    re: /[ \t]*\bpreviously\b[^,.;\n]*[,;]?/gi,
    to: '',
  },
  {
    id: 'ref-trailer',
    what: 'a build-tag provenance trailer - "ref: hexfam-r68, catchonly-r56, ricolaw-r41"',
    re: /[ \t]*ref:[ \t]*[a-z0-9][a-z0-9-]*(?:[ \t]*,[ \t]*[a-z0-9][a-z0-9-]*)*/gi,
    to: '',
  },
  {
    id: 'his-her',
    what: 'a possessive attribution - "his reference", "her option"',
    re: /[ \t]*\b(?:his|her)\b/gi,
    to: '',
  },
];

/* The mechanical cleanup that follows the rules: empty parens, doubled commas, dangling commas and
 * spaces left behind by a removal. Applied PER LINE so a block comment keeps its " * " frame, and
 * it never touches the line's LEADING whitespace (that is the frame). */
export function tidyLine(t) {
  return t
    .replace(/\(\s*,/g, '(')
    .replace(/,\s*\)/g, ')')
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+([,.;:!?])/g, '$1')
    .replace(/([,;:])\s*([,.;:!?])/g, '$1')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/[ \t]+\)/g, ')')
    .replace(/\([ \t]+/g, '(')
    .replace(/[ \t]+$/, '');
}

/* Apply every rule to one line of prose. */
export function derubLine(line) {
  const lead = line.match(/^[ \t]*/)[0];
  let t = protectGameOwner(line.slice(lead.length));
  for (const r of RULES) {
    if (r.id === 'raw-quote') continue;          // handled at comment level
    t = t.replace(r.re, r.to);
    if (r.alt) t = t.replace(r.alt, r.to);
  }
  t = tidyLine(t);
  return lead + restoreGameOwner(t);
}

/* THE QUOTE REMOVAL, DONE PROPERLY.
 *
 * A regex that matches `"..."` pairs quotes by POSITION, and a design record mixes short labels
 * with long quotes: `"ring = bot" vocabulary) + name at y 258 ... ("for bot skill i think ...")`.
 * The positional match then runs from the first quote to the second and DELETES 250 characters of
 * real content between them. That is the worst possible failure for a tool whose whole job is to
 * delete archaeology, so the pairing is explicit:
 *
 *   - the text is split on the quote character, which pairs them unambiguously;
 *   - an ODD number of quotes cannot be paired safely, so such a text is left completely alone;
 *   - a paired span is removed only when it READS like raw speech: at least 25 characters, a
 *     lowercase start, and whitespace inside. A short label ("ring = bot") and a proper noun
 *     ("SPEEDY HAMMER") therefore survive, and a raw sentence does not.
 */
export function removeRawQuotes(text, opts = {}) {
  const parts = text.split('"');
  if (parts.length % 2 === 0) return text;          // an odd quote count cannot be paired
  let out = parts[0];
  for (let i = 1; i < parts.length; i += 2) {
    const content = parts[i];
    const raw = content.length >= 25 && /[a-z]/.test(content) && /\s/.test(content) && !/^\s*[A-Z0-9]/.test(content);
    out += raw ? '' : '"' + content + '"';
    out += parts[i + 1] ?? '';
  }
  return out;
}

/* THE OWNER WORD IS AMBIGUOUS, AND ONE MEANING IS A GAME TERM.
 *
 * "owner" in these documents is either the human who rules the design (the archaeology) or the
 * FIGHTER WHO HOLDS A WEAPON - a real concept in the game, written in capitals: "the OWNER walks
 * through his own nails". A case-insensitive strip removes the human AND the game term, and the
 * game term is a RULE, not history. So the capitals are protected before any rule runs and restored
 * afterwards. The placeholder carries no letters, so no rule can match it.
 */
const OWNER_TOKEN = '\u0001\u0002';
export function protectGameOwner(t) { return t.replace(/\bOWNER\b/g, OWNER_TOKEN); }
export function restoreGameOwner(t) { return t.split(OWNER_TOKEN).join('OWNER'); }
