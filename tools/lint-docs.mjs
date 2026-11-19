#!/usr/bin/env node
/* tools/lint-docs.mjs — documentation consistency gate (machine-readable).
 * Catches: dead live refs, stale canonical md5 slots, trait-count disagreement, retired rules stated
 * as live, missing baseline, a broken law-to-probe table (B3D: docs/LAWS.md is the sole authority).
 * Usage: node tools/lint-docs.mjs [--json]. Exit 0 = no errors; 1 = errors.
 * Scope: operational docs lint fully; GAMES.md is the record (only §Current state linted for live refs);
 * fp-*.json + scratch/ artifacts are exempt (history). Read-only, bare Node.
 *
 * THE RULE OF THIS FILE: a check must ask a question about a FACT, of a FACT. Never a check that
 * remembers a BUG. The five hard-coded English phrases this file used to match for retired rules
 * were a description of past defects, so any rewording of the prose escaped them - and a live
 * contradiction (the shield's retired "cannot damage" rule, docs/GAMES.md:84) survived two audits.
 * The vocabulary now lives in docs/laws.json, beside the laws it belongs to, and is verified against
 * docs/LAWS.md on every run.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { citableProbes, manifestErrors } from './lib/manifest.mjs';
import { wrappable, isTableRow, DEFAULT_MAX } from './lib/reflow.mjs';
import { scan } from './lib/strip-comments.mjs';
import { readMembership, weaponAxisSets, registryAxes } from './lib/weapon-traits.mjs';
import { derubLine } from './lib/archaeology.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [], warnings = [];
const err = m => errors.push(m); const warn = m => warnings.push(m);
const rd = p => readFileSync(path.join(root, p), 'utf8');

/* The operational docs: the ones an agent loads and the lint reads whole. docs/planned/* are in the
 * list (they are agent-facing) but are EXEMPT from the retired-rule check - they describe a target
 * platform, not the shipped game. */
const operational = ['README.md','AGENTS.md','STATE.md','docs/CODEMAP.md','docs/LAWS.md','docs/RECIPES.md',
  'docs/planned/SPEC.md','docs/planned/CONTRACT.md','docs/planned/BUILD.md','.github/copilot-instructions.md'];
/* The docs whose text states what is TRUE RIGHT NOW: a retired rule stated in one of these is an error. */
const liveDocs = ['README.md','AGENTS.md','STATE.md','docs/CODEMAP.md','docs/LAWS.md','docs/RECIPES.md',
  'docs/handoff/HANDOFF.md','docs/handoff/RUNBOOK.md'];
const refRe = /`([A-Za-z0-9_./\-]+\.(?:mjs|md|json|html|ts|js|svg|csv|txt|sh))`|\]\(([^)\s]+)\)/g;

const cbuf = readFileSync(path.join(root, 'previews', 'spinclash-preview.html'));
const md5 = createHash('md5').update(cbuf).digest('hex');
const basePtr = path.join(root, '.qa', 'BASELINE');
if (!existsSync(basePtr)) err('.qa/BASELINE pointer is missing');
else { const b = readFileSync(basePtr,'utf8').trim();
  if (!existsSync(path.join(root,'.qa',b))) err(`.qa/BASELINE points to missing file: ${b}`); }
// The probe registry must cover every proof that exists on disk, and every entry must point at a
// file that exists. Without this the registry goes stale silently: a new proof nobody registers is
// invisible to the battery AND to the law table.
for (const e of manifestErrors(root)) err(e);
/* THE RECORD IS docs/GAMES.md — the living design record. It used to carry the canonical md5 in its
 * newest dated entry ("the md5 slot"), and the lint checked the slot was current. The dated entries and
 * the slot are GONE (audit follow-up, 2026-11-19): the repo holds current rules, not history, and the
 * md5 lives in STATE.md, which is GENERATED from the canonical and therefore always current. The
 * fingerprint baseline's _meta carries the md5 it was recorded against and `fingerprint --compare`
 * reports a moved canonical - so "the canonical changed and nobody said so" is still caught, without a
 * hand-maintained slot. */
const RECORD_SET = ['docs/GAMES.md'];
const games = rd('docs/GAMES.md');
const GAMES_BUDGET_TOKENS = 40000; // RUNBOOK s10: over budget = trim the next doc patch (chars/4, as STATE.md)
{ const gt = Math.round(games.length / 4);
  if (gt > GAMES_BUDGET_TOKENS) warn(`docs/GAMES.md is ~${gt} tokens, over the ${GAMES_BUDGET_TOKENS} budget - trim it (RUNBOOK s10)`); }
const csEnd = games.indexOf('## Measured facts');
const currentState = games.slice(0, csEnd>0?csEnd:games.length);
/* THE WEAPON-TRAIT MEMBERSHIP IS DERIVED, NOT TYPED (audit follow-up, 2026-11-19).
 *
 * The repo used to pin "14 of 22 weapon traits landed" as a hand-typed number in docs/LAWS.md, and the
 * lint only checked that OTHER documents AGREED with LAWS.md. Nothing checked it against the code - and
 * it was in the wrong file: a project-progress counter is not a law.
 *
 * The MEMBERSHIP is derivable. A weapon is designed when its on-screen `line` says something specific
 * about its trait; the ones that are not designed yet still carry the generic placeholder line
 * ("... gains damage per hit"). The derivation reproduces the owner's count exactly (14 of 22) and names
 * the same eight a cold-start agent derived by hand. The list lives in docs/RECIPES.md next to the recipe
 * that uses it, and this check is what keeps it true.
 */
const lawsText = existsSync(path.join(root,'docs/LAWS.md')) ? rd('docs/LAWS.md') : '';
{
  const canon = path.join(root,'previews/spinclash-preview.html');
  const recipes = path.join(root,'docs/RECIPES.md');
  if (existsSync(canon) && existsSync(recipes)) {
    const derived = readMembership(canon);
    const txt = rd('docs/RECIPES.md');
    const block = txt.match(/<!-- WEAPON-TRAIT-MEMBERSHIP -->([\s\S]*?)<!-- \/WEAPON-TRAIT-MEMBERSHIP -->/);
    if (!block)
      err('docs/RECIPES.md has no WEAPON-TRAIT-MEMBERSHIP block - the weapon-trait membership must be stated there (it is derived from the canonical; the lint checks it)');
    else {
      const stated = [...block[1].matchAll(/`([a-z]+)`/g)].map((x) => x[1]);
      const want = derived.blank.slice().sort();
      const got = stated.slice().sort();
      if (JSON.stringify(want) !== JSON.stringify(got))
        err(`docs/RECIPES.md lists the weapons that still need a trait as [${got.join(', ')}] but the canonical derives [${want.join(', ')}] - the canonical is the truth; fix the list in docs/RECIPES.md`);
      const said = block[1].match(/\((\d+) of (\d+)\)/);
      if (said && (+said[1] !== derived.blank.length || +said[2] !== derived.total))
        err(`docs/RECIPES.md says "${said[0]}" but the canonical derives ${derived.blank.length} of ${derived.total}`);
    }
  }
  /* The count is a progress counter, not a law: it must not creep back into a document. A document that
   * needs it points at docs/RECIPES.md. */
  for (const f of ['README.md','AGENTS.md','docs/LAWS.md','docs/GAMES.md']) {
    if (!existsSync(path.join(root,f))) continue;
    const txt = rd(f);
    for (const mm of txt.matchAll(/(\d+)\s+of\s+22\s+weapon\s+traits?\s+landed/g)) {
      const line = txt.slice(0, mm.index).split('\n').length;
      err(`${f}:${line} carries the weapon-trait progress count ("${mm[0]}") - it is a project fact, not a law; it is derived from the canonical and stated in docs/RECIPES.md`);
    }
  }
}

/* THE RETIRED-RULE CHECK IS DERIVED FROM A MACHINE-READABLE SOURCE, NOT FROM A LIST OF PAST BUGS.
 * It used to match five hard-coded English phrases copied from the text as it stood when each bug was
 * found - so any rewording escaped it, and a live contradiction (the shield's retired "cannot damage"
 * rule, docs/GAMES.md:84) survived two audits. The vocabulary now lives in docs/laws.json, beside the
 * laws it belongs to, and is verified against docs/LAWS.md on every run (see the laws.json check below).
 * The check has two halves:
 *   NEGATIVE  a current-state section must not state a retired form affirmatively;
 *   POSITIVE  docs/LAWS.md (the authority) must state the LIVE form affirmatively.
 * The second half matters as much as the first: it catches the live rule being deleted. */
const lawsPath = path.join(root, 'docs', 'laws.json');
let LAWREG = null;
if (!existsSync(lawsPath)) err('docs/laws.json is missing - the retired-rule check is derived from it');
else {
  try { LAWREG = JSON.parse(readFileSync(lawsPath, 'utf8')); }
  catch (e) { err('docs/laws.json is not valid JSON: ' + e.message); }
}
/* A PARAGRAPH (a blank-line-separated block) is the unit a reader sees - and the unit docreflow
 * operates on. Every MARKER EXEMPTION below is therefore evaluated over the whole paragraph, not
 * over one line: docreflow is a whitespace-only rewrap, so a "retired"/"was" marker that used to sit
 * on the same line as the claim it qualifies can legitimately move to a neighbouring line of the
 * same paragraph. The PATTERN scope deliberately stays line-tight (no new false positives); only the
 * exemption scope widened (no new false errors). */
function paragraphs(text) {
  const paras = [];
  let cur = null;
  text.split('\n').forEach((l, i) => {
    if (!l.trim()) { if (cur) { paras.push(cur); cur = null; } return; }
    if (!cur) cur = { start: i + 1, lines: [], text: '' };
    cur.lines.push(l);
    cur.text += (cur.text ? '\n' : '') + l;
  });
  if (cur) paras.push(cur);
  return paras;
}

const RETIRED_MARK = /\b(retired|retirement|formerly|former|no longer|not any more|used to|instead|history|since allcut-r62)\b|\bwas\b/i;
function rulePattern(r) {
  const subj = r.subjects.join('|'), neg = r.negations.join('|'), dam = r.damages.join('|');
  /* The gaps matter. The negation must sit CLOSE to the damage verb (<=14 chars, no sentence
   * break): "the shield cannot damage" is the retired claim; "the shield cannot do is WIN: its
   * damage and spin are the lowest" is a statement about BALANCE and must not match. */
  return {
    negative: new RegExp('\\b(' + subj + ')\\b[^.\\n]{0,50}?\\b(' + neg + ')\\b[^.\\n]{0,14}?\\b(' + dam + ')\\b', 'i'),
    positive: new RegExp('\\b(' + subj + ')\\b[^.\\n]{0,80}?\\b(' + dam + ')\\b', 'i'),
  };
}
function checkRetired(text, label) {
  if (!LAWREG || !LAWREG.retiredRules) return;
  for (const [rid, r] of Object.entries(LAWREG.retiredRules)) {
    const pat = rulePattern(r);
    for (const para of paragraphs(text)) {
      for (const line of para.lines) {
        if (!pat.negative.test(line)) continue;
        if (RETIRED_MARK.test(para.text)) break;                 // the PARAGRAPH marks it as history
        err(`${label} (line ${para.start}) states a retired rule as live (${rid}, retired at ${r.since}): ${r.what}`);
      }
    }
  }
}
checkRetired(currentState, 'GAMES §Current state');
if (!currentState.includes('LAWS.md')) err('GAMES §Current state does not point to LAWS.md (the current-laws quick reference)');
for (const f of liveDocs) if (existsSync(path.join(root, f))) checkRetired(rd(f), f);
/* POSITIVE half: the authority must state the live form of every rule that has a retired form. */
if (LAWREG && LAWREG.retiredRules && existsSync(path.join(root,'docs/LAWS.md'))) {
  for (const [rid, r] of Object.entries(LAWREG.retiredRules)) {
    if (!r.authorityMustState) continue;
    const pat = rulePattern(r);
    const stated = lawsText.split('\n').some(line => pat.positive.test(line) && !pat.negative.test(line));
    if (!stated) err(`docs/LAWS.md does not state the LIVE form of ${rid} (${r.what}) - the authority must state what is true, not only what was retired`);
  }
}
/* Stale counts: a retired law leaves a number behind. The retired counts live in laws.json too. */
if (LAWREG && LAWREG.staleCounts) {
  const scope = [['docs/GAMES.md', currentState], ...liveDocs.map(f => [f, rd(f)])];
  for (const [f, text] of scope) {
    if (!text) continue;
    for (const c of LAWREG.staleCounts) {
      for (const para of paragraphs(text)) {
        if (!para.lines.some(l => l.includes(c.text))) continue;
        if (RETIRED_MARK.test(para.text)) continue;
        err(`${f}:${para.start} quotes a stale count "${c.text}" (${c.since}): ${c.why}`);
      }
    }
  }
}

/* THE LAW-TO-PROBE TALLY IS DERIVED, NEVER HAND-COPIED. It used to be quoted in prose
 * (docs/handoff/RUNBOOK.md said 8/16/1 when the table said 8 probed / 17 partial / 0 owner-run only).
 * Any document that quotes a tally is now compared against the derived one. */
(function lintTally() {
  const start = lawsText.indexOf('## Law-to-probe table');
  if (start < 0) return;
  const rows = lawsText.slice(start).split('\n').filter(l => /^\|\s*[A-Z]\d+\s*\|/.test(l));
  const tally = { probed: 0, partial: 0, 'owner-run only': 0, unprobed: 0 };
  for (const r of rows) {
    const c = r.split('|').map(x => x.trim());
    if (tally[c[4]] !== undefined) tally[c[4]]++;
  }
  const total = rows.length;
  const derived = `probed ${tally.probed}, partial ${tally.partial}, owner-run only ${tally['owner-run only']}, unprobed ${tally.unprobed}`;
  const scope = [['docs/GAMES.md', currentState], ...liveDocs.map(f => [f, rd(f)])];
  for (const [f, text] of scope) {
    if (!text) continue;
    for (const para of paragraphs(text)) {
      const mm = para.text.match(/(\d+)\s+probed\b[^\n]*?(\d+)\s+partial\b[^\n]*?(\d+)\s+owner-run only\b[^\n]*?(\d+)\s+unprobed\b/);
      if (!mm) continue;
      if (RETIRED_MARK.test(para.text)) continue;
      const got = { probed: +mm[1], partial: +mm[2], 'owner-run only': +mm[3], unprobed: +mm[4] };
      if (got.probed !== tally.probed || got.partial !== tally.partial ||
          got['owner-run only'] !== tally['owner-run only'] || got.unprobed !== tally.unprobed)
        err(`${f}:${para.start} quotes the law tally "${mm[0].trim()}" but the table in docs/LAWS.md says ${derived} (${total} rows). Read the table; do not carry a tally.`);
    }
  }
})();

const PLANNED = new Set(['package.json','render.json','targets.ts','characters.json','tasks.json',
  'launch.json','settings.json','extensions.json','doctor.mjs','generate.mjs','inspect.mjs']);
const PLANNED_DIR = /^(packages|apps|games|output|assets\/pools|assets\/fonts|\.vscode)\//;
const HIST = /retired|purged|recover|git show|docs-precleanup|item3-closed|never committed|unrecoverable|former|removed|deleted|was\b|tombstone|archived|RETIRED|DORMANT|reverted|parked|pruned|gone|no longer|since retired/i;
/* A path reference must resolve WHERE IT IS WRITTEN. The rule:
 *   - a path with a slash is repo-root relative (and a leading ./ or ../ is honoured as written);
 *   - a BARE name may name a TOOL (the repo's tool directories) or a file in the referrer's own
 *     directory or at the repo root;
 *   - a bare name may NOT name a DOCUMENT under docs/ - documents must carry their directory.
 * The old resolver accepted a bare name found ANYWHERE in the tree, which is why 32 references to the
 * relocated platform docs (bare `CONTRACT.md`, `BUILD.md`, `SPEC.md`) went unnoticed - `cat
 * CONTRACT.md` from the repo root fails. (D-05) */
const TOOL_DIRS = ['.qa','tools','tools/doc','tools/lib','scripts','previews'];
function resolves(ref, fromDir) {
  const clean = ref.split('#')[0]; if (!clean) return true;
  if (PLANNED.has(path.basename(clean)) || PLANNED_DIR.test(clean)) return true;
  if (clean.includes('/')) {
    if (existsSync(path.join(root,clean))) return true;
    for (const d of ['docs','tools']) if (existsSync(path.join(root,d,clean))) return true;
    return false;
  }
  if (existsSync(path.join(root, clean))) return true;                            // repo root
  if (fromDir && existsSync(path.join(root, fromDir, clean))) return true;        // the referrer's own directory
  for (const d of TOOL_DIRS) if (existsSync(path.join(root, d, clean))) return true;  // tools by short name
  return false;                                                                    // a DOCUMENT must carry its directory
}
function lintRefs(f, text, off=0) {
  const fromDir = path.dirname(f);
  for (const para of paragraphs(text)) {
    for (const line of para.lines) {
      for (const mm of line.matchAll(refRe)) {
        const ref = mm[1]||mm[2];
        if (!ref || /^(https?:|#|mailto:)/.test(ref)) continue;
        if (/^fp-.*\.json$/.test(path.basename(ref)) || ref.startsWith('scratch/')) continue;
        if (resolves(ref, fromDir)) continue;
        if (HIST.test(para.text)) continue;                       // the PARAGRAPH marks it as history
        err(`${f}:${off+para.start} references missing path: ${ref}`);
      }
    }
  }
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
      /* NO HIST EXEMPTION HERE, unlike the path check. A §-pointer is a PRECISE claim - "this file,
       * this section" - so it is dead whether or not the sentence around it talks about history. The
       * two dead `docs/LAWS.md` §Retired rules pointers in docs/GAMES.md said "Retired rule text:",
       * which the path check's HIST exemption forgave; a pointer is a pointer. */
      /* A §-pointer is resolved by PREFIX against the target's headings: the pointer must name the
       * start of a real heading. The old rule ("any heading CONTAINS the first 1-4 words") was so
       * loose that "§Weapon art table" passed because some heading merely contained the word
       * "weapon" - which is why the two dead `docs/LAWS.md` §Retired rules pointers were never
       * caught, and why the law table's own anchors were the only thing being checked.
       * Two rules keep it honest without being pedantic:
       *   - the pointer must match at least TWO leading heading words (a one-word pointer is allowed
       *     only if it is one word long: "§Purpose");
       *   - trailing prose after the section name is not part of the pointer ("§Purpose before any
       *     tradeoff" means "§Purpose"), so a connective word ends the pointer. */
      const heads = rd(target).split('\n').filter(l => /^#{1,6}\s/.test(l))
        .map(l => l.replace(/^#{1,6}\s+/, '').toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean));
      let words = mm[2].trim().split(/\s+/).map(w => w.replace(/[^A-Za-z0-9-]/g, '')).filter(Boolean).slice(0, 4);
      const CONNECTIVE = new Set(['and','or','but','that','which','before','after','when','if','so','then','because',
        'while','since','until','unless','whether','into','onto','with','without','from','for','to','at','in','on','of',
        'as','by','is','are','was','were','be','been','being','not','no','never','always','also','even','just','only','per',
        'via','versus','vs','override','overrides','everything','else','come','first','read','has','have','had']);
      for (let i = 1; i < words.length; i++) if (CONNECTIVE.has(words[i].toLowerCase())) { words = words.slice(0, i); break; }
      if (!words.length) continue;
      let best = 0;
      for (const h of heads) {
        let k = 0;
        while (k < words.length && k < h.length && h[k] === words[k].toLowerCase()) k++;
        if (k > best) best = k;
      }
      const ok = best >= 2 || (words.length === 1 && best === 1);
      if (!ok) err(`${f}:${i + 1} points to "${mm[1]} §${words.join(' ')}" but ${target} has no such heading`);
    }
  });
}
for (const f of operational) if (existsSync(path.join(root,f))) lintSectionPointers(f, rd(f));
/* The record's §Current state carries section pointers too, and two of them pointed at a
 * docs/LAWS.md section that was deleted at #806. The pointer lint now covers it. (D-04) */
lintSectionPointers('docs/GAMES.md', currentState);
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
  for (const f of RECORD_SET) {
    const head = rd(f).split('\n').slice(0, 25).join('\n');
    if (/(?<!not )(?<!never )read this file (first|whole)/i.test(head)) err(`${f} preface tells agents to read it first/whole — it is grep-only`);
  }
  // B3E: line cap. A record line over LINE_CAP bytes defeats docreflow and editors (the old 14 KB mf-2 line). Check only.
  const LINE_CAP = 3000;
  for (const f of RECORD_SET) if (existsSync(path.join(root, f)))
    rd(f).split('\n').forEach((l, i) => { const b = Buffer.byteLength(l); if (b > LINE_CAP) err(`${f}:${i + 1} is ${b} bytes, over the ${LINE_CAP}-byte line cap - re-wrap it (whitespace only)`); });

  // Hand-typed token costs drift; the only cost source is STATE.md (Phase I).
  for (const f of ['AGENTS.md','docs/CODEMAP.md','docs/LAWS.md','docs/RECIPES.md','docs/planned/SPEC.md','docs/planned/CONTRACT.md','docs/planned/BUILD.md','docs/GAMES.md'])
    if (existsSync(path.join(root,f)) && /Approx token cost:\s*~?\d/.test(rd(f).split('\n').slice(0, 12).join('\n')))
      err(f + ' header has a hand-typed token cost — point to STATE.md §Documentation cost instead');

  /* The stale-text guard was README-only, so the same stale text could live in AGENTS.md, STATE.md or
   * the platform docs. It now covers every always-or-often-loaded doc. (Audit finding: the guard
   * listed ten strings but only checked one file.) */
  const staleTexts = [
    'Starting a new chat',
    'scratch/docreflow',
    'scratch/navgen',
    'read all five',
    'read all four',
    '9 of 22',
    '13 remaining',
    'fp-multgrow-r42.json',
    'docs/HANDOFF.md'
  ];
  for (const f of ['README.md','AGENTS.md','STATE.md','docs/CODEMAP.md','docs/LAWS.md','docs/RECIPES.md',
                   'docs/planned/SPEC.md','docs/planned/CONTRACT.md','docs/planned/BUILD.md']) {
    if (!existsSync(path.join(root, f))) continue;
    const txt = rd(f);
    for (const stale of staleTexts) {
      if (txt.includes(stale)) {
        const line = txt.slice(0, txt.indexOf(stale)).split('\n').length;
        err(`${f}:${line} contains stale/non-router text: ${stale}`);
      }
    }
  }
  /* docs-precleanup is a LEGITIMATE recovery tag in the platform docs, so it is checked only where it
   * would be wrong: in README, which must stay a router. */
  if (readmeSlim.includes('docs-precleanup')) err('README contains stale/non-router text: docs-precleanup');

/* THE PLATFORM ISLAND PROFILE. docs/planned/* describes a system with no code. Three things must
 * hold, or an agent will believe the engine exists:
 *   1 every file there carries a PLANNED banner;
 *   2 no operational doc OUTSIDE the island describes a planned file as existing;
 *   3 the island is never reachable from the always-load path without the banner saying so. */
(function lintPlanned() {
  const dir = 'docs/planned';
  if (!existsSync(path.join(root, dir))) return;
  for (const f of readdirSync(path.join(root, dir)).filter(f => f.endsWith('.md')).sort()) {
    const rel = `${dir}/${f}`;
    const head = rd(rel).split('\n').slice(0, 12).join('\n');
    if (!/STATUS:.*PLANNED/i.test(head))
      err(`${rel} has no "STATUS: PLANNED" banner in its first 12 lines - it describes code that does not exist`);
  }
  const outside = operational.filter(f => !f.startsWith('docs/planned/'));
  for (const f of outside) {
    if (!existsSync(path.join(root, f))) continue;
    const text = rd(f);
    text.split('\n').forEach((line, i) => {
      for (const mm of line.matchAll(refRe)) {
        const ref = mm[1] || mm[2];
        if (!ref) continue;
        const base = path.basename(ref.split('#')[0]);
        if (!PLANNED.has(base) && !PLANNED_DIR.test(ref)) continue;
        if (/planned|phase[ -]?0|target|does not exist|do not exist|not implemented|future engine|do not run|does not run|no engine code|no\s+.?package\.json/i.test(line)) continue;
        err(`${f}:${i + 1} mentions the PLANNED path "${ref}" without marking it as planned - the engine does not exist yet`);
      }
    });
  }
})();

/* THE PROSE LINE CAP. The repo already stated the policy - "Prose lines stay <= ~300 chars where
 * practical (generated tables/data exempt)" (docs/planned/SPEC.md) - and enforced it NOWHERE: the only
 * cap was a 3,000-BYTE limit on one file, so 257 prose lines across the documentation were over the
 * stated limit, the worst at 2,699 characters. That is a CORRECTNESS rule, not a style rule: the
 * repository's premise is "grep the record, do not read it", and a grep hit on a 2,699-char line costs
 * ~2,100 tokens to answer a question worth ~20. Exempt: markdown table rows (their columns ARE the
 * content) and fenced code blocks. */
const PROSE_CAP = 300;
const PROSE_EXEMPT_FILES = new Set();
function lintProseCap(f, text) {
  if (PROSE_EXEMPT_FILES.has(f)) return;
  const all = text.split('\n');
  /* A GENERATED file is exempt: its long lines are the generator's output (a symbol index is one
   * long line by construction), and wrapping it by hand would be undone by the next regeneration. */
  if (/^<!-- GENERATED by /.test(all[0] || '')) return;
  let inFence = false, inGen = false;
  all.forEach((l, i) => {
    if (/^\s*```/.test(l)) { inFence = !inFence; return; }
    if (inFence) return;
    if (/^<!-- BEGIN GENERATED /.test(l)) { inGen = true; return; }
    if (/^<!-- END GENERATED /.test(l)) { inGen = false; return; }
    if (inGen) return;                                     // a generated block: not prose either
    if (isTableRow(l)) return;                            // a table row is data, not prose
    if (l.length <= PROSE_CAP) return;
    /* Two verdicts, one source of truth: if tools/lib/reflow.mjs CAN split the line, it is an ERROR
     * (run docreflow - a tool fixes it); if it cannot, the line resists wrapping and needs an
     * AUTHOR - a warning, so the gate never blocks on something no tool can solve. */
    if (wrappable(l, PROSE_CAP))
      err(`${f}:${i + 1} is ${l.length} chars, over the ${PROSE_CAP}-char prose cap - run \`node tools/doc/docreflow.mjs ${f}\` (whitespace-only)`);
    else
      warn(`${f}:${i + 1} is ${l.length} chars and RESISTS wrapping (dense marked spans) - it needs an author to shorten it`);
  });
}
for (const f of operational) if (existsSync(path.join(root, f))) lintProseCap(f, rd(f));
lintProseCap('docs/GAMES.md', games);
for (const f of ['docs/handoff/HANDOFF.md', 'docs/handoff/RUNBOOK.md'])
  if (existsSync(path.join(root, f))) lintProseCap(f, rd(f));

/* NO DOCUMENT CARRIES DECISION ARCHAEOLOGY (housekeep, 2026-11-19).
 *
 * The repo's doctrine is "current docs state current rules; git history holds history", and the
 * owner's ruling was explicit: "you are free to remove and delete all of that, an agent doesnt need
 * to know it." The rule was stated but NOT ENFORCED: tools/docs-archaeology.mjs removed the
 * archaeology from one file (docs/GAMES.md) and nothing checked the rest, so a line carrying an owner
 * quote, a who/when attribution or the record of a rejected approach could land in any document and
 * stay there.
 *
 * The check is the SAME catalogue the derub uses (tools/lib/archaeology.mjs), run over the prose: a
 * line the derub would change is a line that still carries archaeology. The planned island
 * (docs/planned/) is EXEMPT: it is the owner's design space for the engine that does not exist yet.
 */
{
  const LIVE_DOCS = ['AGENTS.md', 'README.md', 'docs/GAMES.md', 'docs/LAWS.md', 'docs/RECIPES.md',
                     'docs/handoff/HANDOFF.md', 'docs/handoff/RUNBOOK.md'];
  for (const f of LIVE_DOCS) {
    if (!existsSync(path.join(root, f))) continue;
    const all = rd(f).split('\n');
    let inFence = false, inGen = false, inNav = false;
    all.forEach((l, i) => {
      if (/^\s*```/.test(l)) { inFence = !inFence; return; }
      if (inFence) return;
      if (/^<!-- BEGIN GENERATED /.test(l)) { inGen = true; return; }
      if (/^<!-- END GENERATED /.test(l)) { inGen = false; return; }
      if (inGen) return;
      if (/^## How to read this file/.test(l)) { inNav = true; return; }
      if (inNav && /^## /.test(l)) { inNav = false; return; }
      if (inNav) return;                                   // the navigation layer is GENERATED
      if (/^#{1,6}\s/.test(l)) return;                    // a heading is a pointer
      if (/^\s*\|/.test(l)) return;                      // a table row is data
      if (/^( {4}|\t)/.test(l)) return;                   // an indented block is code
      const lead = l.match(/^[ \t]*/)[0];
      const body = l.slice(lead.length);
      if (derubLine(body) !== body)
        err(`${f}:${i + 1} carries decision archaeology (an owner quote, a who/when attribution, or the record of a rejected approach) - run \`node tools/docs-archaeology.mjs ${f}\``);
    });
  }
}

/* THE CANONICAL'S AXIS INVENTORY IS CHECKED AGAINST ITS OWN ROWS (audit follow-up, 2026-11-19).
 *
 * The canonical's TRAIT / SKILL REGISTRY block is what every agent reads FIRST when it adds a trait
 * (docs/RECIPES.md says so). It had drifted: it named six trait axes while the weapon rows declare
 * nine, and it named three shot axes that no row declares at all, while missing four live ones. A
 * stale inventory there is worse than none - the agent trusts it and writes a row the boot guard has
 * never seen.
 *
 * So the inventory is DERIVED from the rows and compared with the block:
 *   - an axis a row declares but the block does not name  -> error;
 *   - an axis the block names that no row declares         -> error (a phantom);
 *   - a field on the block's "NOT axes" line that IS a real axis -> error.
 */
{
  const canon = path.join(root, 'previews/spinclash-preview.html');
  if (existsSync(canon)) {
    const src = rd('previews/spinclash-preview.html');
    const reg = registryAxes(src);
    if (!reg) err('the canonical has no TRAIT / SKILL REGISTRY block - the axis inventory every agent reads first is missing');
    else {
      const ax = weaponAxisSets(src);
      for (const k of ['trait', 'skill', 'shot']) {
        const declared = [...ax[k]].sort();
        const named = [...reg[k]].sort();
        const missing = declared.filter((x) => !named.includes(x));
        const phantom = named.filter((x) => !declared.includes(x));
        if (missing.length)
          err(`the canonical's REGISTRY does not name the ${k} axis(es) the weapon rows declare: ${missing.join(', ')} - add them to the registry (or fix the row)`);
        if (phantom.length)
          err(`the canonical's REGISTRY names ${k} axis(es) no row declares: ${phantom.join(', ')} - they are phantom axes; remove them`);
      }
      const realNonAxis = [...reg.notAxis].filter((x) => ax.shot.has(x));
      if (realNonAxis.length)
        err(`the canonical's REGISTRY lists ${realNonAxis.join(', ')} as "NOT axes" but the weapon rows declare them as axes`);
    }
  }
}

/* THE CANONICAL COMMENT BUDGET (audit finding W-01; owner ruling 2026-11-19). The canonical is
 * loaded IN FULL by every agent that touches the game, and its comment layer was 47% of the file -
 * 49,329 tokens, a third of which was decision archaeology (owner quotes, who/when, and the record
 * of approaches that were rejected). The owner's ruling was explicit: "you are free to remove and
 * delete all of that, an agent doesnt need to know it." The budget exists so the layer cannot
 * re-grow: the WHY stays, the archaeology does not. The number lives in docs/laws.json, next to the
 * other machine-readable facts, so there is exactly one copy of it. */
if (LAWREG && LAWREG.budgets && LAWREG.budgets.canonicalCommentChars) {
  const budget = LAWREG.budgets.canonicalCommentChars;
  const canonPath = path.join(root, 'previews/spinclash-preview.html');
  if (existsSync(canonPath)) {
    const html = readFileSync(canonPath, 'utf8');
    let chars = 0, spans = 0;
    for (const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
      for (const c of scan(m[1])) { spans++; chars += m[1].slice(c.s + 2, c.kind === 'line' ? c.e : c.e - 2).length; }
    }
    if (chars > budget)
      err(`the canonical's comment layer is ${chars} chars over the ${budget}-char budget (${spans} comments) - the WHY stays, the archaeology does not; run tools/canon-comments.mjs --audit`);
    else
      warn(`the canonical's comment layer is ${chars} chars of the ${budget}-char budget (${spans} comments)`);
  }
}

/* THE TOKEN-COST REGISTRY. docs/token-costs.json records MEASURED token counts (a real BPE tokenizer),
 * each keyed by the md5 of the file it describes, because the repo has no dependencies and so cannot
 * ship a tokenizer. tools/gen-state.mjs uses a measured count only while its md5 matches; a file that
 * has moved falls back to the chars/4 estimate automatically. A recorded measurement that no longer
 * matches its file is therefore a stale number nobody is using - the lint says so, so it can be
 * dropped or re-measured instead of lingering. */
(function lintTokenCosts() {
  const p = path.join(root, 'docs', 'token-costs.json');
  if (!existsSync(p)) { warn('docs/token-costs.json is missing - the doc token costs fall back to the chars/4 estimate'); return; }
  let reg;
  try { reg = JSON.parse(readFileSync(p, 'utf8')); } catch (e) { err('docs/token-costs.json is not valid JSON: ' + e.message); return; }
  for (const [rel, m] of Object.entries(reg.files || {})) {
    const fp = path.join(root, rel);
    if (!existsSync(fp)) { warn(`docs/token-costs.json records ${rel}, which no longer exists - drop the entry`); continue; }
    const now = createHash('md5').update(readFileSync(fp)).digest('hex');
    if (now !== m.md5)
      warn(`docs/token-costs.json: ${rel} has changed since it was measured (md5 ${String(m.md5).slice(0,8)} -> ${now.slice(0,8)}) - its row now falls back to the chars/4 estimate; re-measure or drop the entry`);
    if (!Number.isInteger(m.tokens) || m.tokens <= 0) err(`docs/token-costs.json: ${rel} has no usable token count`);
  }
})();

/* THE COPILOT FILE MAY POINT, NEVER DUPLICATE. It is a second entry point for a different agent; if
 * it repeats rule text, the copy drifts and the agent follows the stale one. (Audit finding: the file
 * was not linted at all.) */
(function lintCopilot() {
  const f = '.github/copilot-instructions.md';
  if (!existsSync(path.join(root, f))) return;
  const agents = existsSync(path.join(root,'AGENTS.md')) ? rd('AGENTS.md').toLowerCase() : '';
  const stop = new Set(['the','and','for','with','not','you','your','that','this','into','from','only','never','must','does','when','use','its','their','them','then','than','have','will','also','each','any','all','but','can','was','are','one','two','six','ten','before','after','more','most','such','they','them','them']);
  let n = 0;
  rd(f).split('\n').forEach((line, i) => {
    const t = line.trim();
    if (!t.startsWith('- ')) return;
    const body = t.slice(2).replace(/[`*_]/g,'').toLowerCase();
    if (body.length < 8) return;
    const words = body.split(/[^a-z0-9.]+/).filter(w => w.length > 3 && !stop.has(w));
    if (!words.length) return;
    const hit = words.filter(w => agents.includes(w)).length;
    if (hit / words.length < 0.6)
      err(`${f}:${i + 1} states a rule that AGENTS.md does not carry ("${t.slice(2, 70)}") - the copilot file may POINT at AGENTS.md, never duplicate it`);
    n++;
  });
  if (!n) warn(`${f} carries no rule bullets - it should point at AGENTS.md and STATE.md`);
})();

/* docs/laws.json IS A VERIFIED COMPANION to docs/LAWS.md, not a second source of truth: every id must
 * exist in the law table, every status must agree, and every retired rule's `since` tag must appear
 * in LAWS.md. If LAWS.md changes and laws.json does not, this fails. */
(function lintLawsRegistry() {
  if (!LAWREG || !Array.isArray(LAWREG.laws)) return;
  const start = lawsText.indexOf('## Law-to-probe table');
  if (start < 0) return;
  const table = lawsText.slice(start).split('\n')
    .filter(l => /^\|\s*[A-Z]\d+\s*\|/.test(l))
    .map(l => l.split('|').slice(1, -1).map(x => x.trim()));
  const byId = new Map(table.map(c => [c[0], c]));
  for (const l of LAWREG.laws) {
    const row = byId.get(l.id);
    if (!row) { err(`docs/laws.json lists law ${l.id}, which has no row in the docs/LAWS.md law table`); continue; }
    if (row[4] !== l.status)
      err(`docs/laws.json says ${l.id} is "${l.status}" but docs/LAWS.md says "${row[4]}" - LAWS wins`);
  }
  for (const c of table) if (!LAWREG.laws.some(l => l.id === c[0]))
    err(`docs/LAWS.md law table has a row for ${c[0]} that docs/laws.json does not list`);
  for (const [rid, r] of Object.entries(LAWREG.retiredRules || {})) {
    if (!lawsText.includes(r.since))
      err(`docs/laws.json retired rule ${rid} claims it was retired at "${r.since}", which docs/LAWS.md does not mention`);
    for (const lid of r.laws || []) if (!LAWREG.laws.some(l => l.id === lid))
      err(`docs/laws.json retired rule ${rid} names law ${lid}, which it does not list`);
  }
})();

/* B3D: the law-to-probe table in docs/LAWS.md. Anchors are checked mechanically; Status is hand-written judgement.
 */
(function lintLawTable() {
  if (!lawsText) return;
  const lines = lawsText.split('\n');
  const start = lines.findIndex(l => /^##\s+Law-to-probe table/.test(l));
  if (start < 0) { err('docs/LAWS.md has no "## Law-to-probe table" section'); return; }
  let end = lines.findIndex((l, i) => i > start && /^##\s/.test(l)); if (end < 0) end = lines.length;
  /* The citable probe set comes from tools/manifest.json - the probe registry - so the law table and
   * the proof battery read the SAME list. (It used to be derived by regex-parsing run-battery.mjs's
   * source: a reformatted array changed the law table's verdict without anyone touching a law.) */
  const runnable = citableProbes(root);
  if (!runnable || runnable.size < 5) err('law table lint could not read the citable probe set from tools/manifest.json');
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
      if (!runnable.has(a.file)) err(`${at} ${id}: runnable probe ${a.file} is not a citable probe in tools/manifest.json`);
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

// docs/handoff/*.md profile. Errors: missing Contains:/Read when: header, hand-typed token cost, dead refs
// in the live files (HANDOFF, RUNBOOK), RUNBOOK losing the s1/s6 headings AGENTS relies on. Warnings only:
// lines >2000 chars and files over the size budget in the live files, and lines >400 chars in the always-load
// docs.
const ARCHIVES = new Set();
(function lintHandoff() {
  const dir = 'docs/handoff'; if (!existsSync(path.join(root, dir))) return;
  const files = readdirSync(path.join(root, dir)).filter(f => f.endsWith('.md')).sort().map(f => dir + '/' + f);
  for (const f of files) {
    const text = rd(f), lines = text.split('\n'), head = lines.slice(0, 12).join('\n');
    if (!/^Contains:/m.test(head) || !/^Read when:/m.test(head)) err(`${f} has no "Contains:" / "Read when:" header in its first 12 lines`);
    if (/token cost:\s*~?\d/i.test(head)) err(`${f} header has a hand-typed token cost - point to STATE.md §Documentation cost instead`);
    const long = ARCHIVES.has(path.basename(f)) ? [] : lines.filter(l => l.length > 2000);
    if (long.length) warn(`${f}: ${long.length} line(s) over 2000 chars (max ${Math.max(...long.map(l => l.length))}) - split into entries`);
    if (!ARCHIVES.has(path.basename(f)) && text.length / 4 > 20000) warn(`${f}: ~${Math.round(text.length / 4)} tokens, over the 20000-token handoff budget`);
  }
  for (const n of ['HANDOFF.md', 'RUNBOOK.md']) if (existsSync(path.join(root, dir, n))) lintRefs(dir + '/' + n, rd(dir + '/' + n));
  if (existsSync(path.join(root, dir, 'RUNBOOK.md'))) {
    const t = rd(dir + '/RUNBOOK.md');
    for (const h of [/^## 1\. /m, /^## 6\. /m]) if (!h.test(t)) err(dir + '/RUNBOOK.md lost a section heading AGENTS.md points to: ' + h.source);
  }
  for (const f of ['AGENTS.md', 'docs/LAWS.md', 'docs/CODEMAP.md']) {
    if (!existsSync(path.join(root, f))) continue;
    const long = rd(f).split('\n').map((l, i) => [l.length, i + 1]).filter(x => x[0] > 400);
    if (long.length) warn(`${f}: ${long.length} line(s) over 400 chars (max ${Math.max(...long.map(x => x[0]))}, first at line ${long[0][1]})`);
  }
})();

const ok = errors.length===0;
const verdict = { check:'lint-docs', ok, errors, warnings, canonicalMd5:md5 };
if (process.argv.includes('--json')) console.log(JSON.stringify(verdict));
else {
  console.log(`lint-docs: ${errors.length} error(s), ${warnings.length} warning(s)`);
  for (const e of errors) console.log('  ERROR  '+e);
  for (const w of warnings) console.log('  WARN   '+w);
  console.log(ok?'LINT PASS':'LINT FAIL');
  console.log(JSON.stringify(verdict));
}
process.exit(ok?0:1);
