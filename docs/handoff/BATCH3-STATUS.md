# BATCH3-STATUS — the landing ledger (newest first)

Contains: one short "## #NNN <title> - ledger" section per landing, newest first (What / Why / Approved / Deviations).
Read when: only to look up one landing's receipts; grep "^## #NNN", never read whole. Token cost: see STATE.md.

LOCATION: docs/handoff/BATCH3-STATUS.md — REPO-HOSTED, updated in the same commit as every landing; current as of HEAD
by construction. Chat attachments of older copies are OBSOLETE; the repo outranks them. Trimmed at #808 to the current
era: the landing record starts at #805 (RUNBOOK s9); the legacy Batch 2/3 preamble and older entries are git history
(recovery point: tag handoff-pre808). Freshness: `git log -1 --format='%h' -- docs/handoff/BATCH3-STATUS.md` = origin/main.

## #809 Audit Phases 0-4: the architecture remediation as ONE landing (live contradictions closed, facts derived, surfaces bounded, the canonical's archaeology deleted) - ledger (this commit)

What: DOCS + TOOLS. (1) D-01 CRITICAL: `docs/GAMES.md:84` and `:298` stated as live that "the shield cannot damage" - a rule retired at `allcut-r62`.
Both now state the live rule (every weapon cuts on body touch, LAWS core contact law 1; the shield's `trait.dmg` is live) and re-frame the shield's position as the BALANCE question it is (open question 4).
`docs/LAWS.md` was already right and remains the sole authority. (2) D-02:
the hand-typed law-to-probe tally is GONE from `docs/handoff/RUNBOOK.md` - it said 8/16/1 when the table is 8 probed / 17 partial / 0 owner-run only;
the runbook now points at the table and forbids carrying a tally (Phase 1 makes the lint derive it). (3) D-03:
`docs/planned/SPEC.md` §Repo no longer hand-writes a tree that claimed `.vscode/`, `assets/fonts/`, `packages/`,
`apps/studio/` and `games/` exist as Phase-0 placeholders - all were deleted at #808.
The tree now shows the live tree and states that Phase 0 CREATES the engine dirs (no `.gitkeep` placeholders are committed);
the stale README row ("human-facing overview + detailed standing rules", contradicting README's own "intentionally only a router") is fixed. (4) D-04:
two dead `docs/LAWS.md` §Retired rules pointers (GAMES.md:89, :218) - that section was removed at #806 - now cite the landing instead. (5) D-05:
all 32 references to SPEC/CONTRACT/BUILD are qualified with `docs/planned/`;
a bare `CONTRACT.md` no longer resolves from the repo root. (6) D-06:
the trait-count rule now says the count is pinned in `docs/LAWS.md` ONLY and that GAMES.md does not carry one (it moved to LAWS at #747);
the false "lint checks both" claim is gone. (7) D-07:
`ingest.mjs` is described as dormant in one place and "the live weapon-merge gate" in the same sentence - the parenthetical is gone. (8) D-14 (owner ruling):
`ingest.mjs` carries the SAME `--owner-go` / `ARENA_OWNER_GO=1` gate as `measure.mjs` - it exits 2 before it reads, writes or runs anything,
because with `--into` it can write the canonical. `AGENTS.md` rule 2 now covers both owner-only tools;
`tools/manifest.json`'s ingest entry says so. (9) D-11:
`.qa/fingerprint.json` (the fingerprint tool's default scratch output) is gitignored - the owner's `git add -A` has already swept diagnostics into a commit once (#760). (10) D-15:
`docs/planned/BUILD.md` carries the same `STATUS: PLANNED - not implemented.` banner as SPEC and CONTRACT,
which `AGENTS.md:77` already claimed it had. (11) D-16: the verbatim duplicated bullet block in RUNBOOK s8 is gone.

Why: an agent reading `docs/GAMES.md` got two contradictory answers about the shield from the same file, one of which the code contradicts;
the process authority quoted a proof tally the table disproves;
the platform spec described five directories the repository had just deleted.
Every one of these is a case of a hand-maintained copy drifting from its source - the same mechanism Phase 1 replaces with derived checks.

Approved: the owner's go on 2026-11-19 ("ok you can start now"), with two rulings: `ingest.mjs` gets the owner-go gate, and the canonical's archaeology (what was tried and rejected, who/when, owner quotes) is DELETED outright rather than relocated - "an agent doesnt need to know it".

Deviations: `ingest.mjs` is a dormant tool the spec would delete;
the owner chose the gate instead, so it stays.
`docs/GAMES.md` was edited outside §Current state (the §Testing recipe and §Open design questions carry the ingest and shield text);
the md5 slot is untouched because the canonical did not move,
so no dated chronicle entry is required (RUNBOOK s8).

PHASE 1 (derived checks). The machine-readable facts are now DERIVED, not hand-copied.
`docs/laws.json` (new) is the machine-readable companion to `docs/LAWS.md`: the law registry,
the retired-rule vocabulary (R1) and the stale-count list.
`tools/lint-docs.mjs` rewritten (17 changes):
the md5 slot is scoped to the NEWEST dated entry; the trait count is pinned in LAWS only;
the retired-rule check is derived from laws.json in two halves (negative - no retired form may be stated as live; positive - the authority must state the LIVE form);
the law-to-probe tally is compared against the derived one instead of being hand-typed;
the section-pointer check resolves by heading prefix (>= 2 words, or 1 word; connective words trimmed; no history exemption) and a BARE document name under docs/ must now carry its directory (the D-05 fix);
`staleTexts` covers every live doc; `docs/planned/` gets its own profile (STATUS banner, planned-path mentions);
`manifestErrors` scans the root and `scripts/`;
`docreflow` REFUSES an out-of-scope file with exit 1 instead of answering "already reflowed" for a file it never looked at (D-12 - that false green was the reason the 300-char rule had never been enforced).
`tools/lint-controls.mjs` (new) is the proof that the new checks actually fire:
it copies the tree to a temp dir, breaks 12 things, and requires every one to be caught - the repo is never touched.
`tools/manifest.json` carries 35 entries.

PHASE 2 (generators). `tools/gen-codemap.mjs` rewritten: the declaration scan widened to indent 0 and 2,
two SYNTHETIC regions (`head/shell`, `app/chrome`) make the region table cover EVERY line of the file (it used to omit 83),
`window.APP` and its 14 members are parsed by brace depth over a comment-masked copy,
and `--check` asserts completeness (no gaps, no unmapped symbols, an independent declaration scan as the cross-check). 26 regions, 278 symbols.
`tools/gen-tree.mjs` (new) writes the repo tree into `docs/planned/SPEC.md` between marker delimiters - the tree is now the filesystem,
not a hand-written list of directories that had been deleted.
`docs/planned/INDEX.md` (new) is the platform island's entry point and carries the STATUS:
PLANNED banner. `tools/gen-state.mjs` uses `docs/token-costs.json` (new, md5-keyed measured counts) when the md5 matches and falls back to chars/4 automatically when a file changes,
and labels which is which - so no hand-typed cost can drift.
`tools/lint-markers.mjs` knows the synthetic regions.

PHASE 3 (bounded surfaces). The 300-character prose cap is now ENFORCED, not stated:
`tools/lib/reflow.mjs` is the shared wrapper,
`tools/doc/docreflow.mjs` applies it to any document (it was GAMES.md-only and broke lines at 600),
and `tools/lint-docs.mjs` distinguishes a line a TOOL can split (an error) from one that resists wrapping (a warning that needs an author).
The rules live in `tools/lib/reflow.mjs` so the linter and the writer cannot disagree about what is wrappable.
Every marker exemption in the lint became PARAGRAPH-scoped,
because a whitespace-only rewrap may move a "retired" marker to a neighbouring line of the same paragraph.
The design record was derubbed with the same catalogue the canonical uses (`tools/lib/archaeology.mjs`, `tools/docs-archaeology.mjs`):
§Current state 22,204 -> 20,668 tokens, the whole file 36,549 → 33653.
`AGENTS.md` gained a "Writing conventions" section (a mutable fact is generated, never typed; prose <= ~300 chars; current text states current rules - including in CODE COMMENTS; where a document goes).
`docs/laws.json` carries the canonical comment budget (160,000 chars) and `lint-docs` checks it.

PHASE 4 (the canonical's archaeology - the owner's ruling, DELETE, not relocate).
The comment layer went from 195,690 chars (48,923 tokens, 47% of the file) to 179,605 chars (44,901 tokens);
the canonical as a whole 147,768 -> 142,931 tokens. After the pass: 0 owner references, 0 dates, 2 long quotes, 909 comments (none deleted outright - every comment carries a rule, a law or a marker).
What went is exactly what the owner named: the owner quotes, the who/when,
and the record of approaches that were rejected.
Every WHY stays. The tool is `tools/canon-comments.mjs`;
the rule catalogue is `tools/lib/archaeology.mjs` - the SAME one the docs use,
so the two surfaces cannot drift into different standards of "archaeology".
THE CODE DID NOT MOVE, and that is proven twice:
`.qa/strip-hash.mjs --base canonical-prediet-2c` PASS (non-script `c2cd01ef…`, script 0 `e9b6f8d6…`, script 1 `600097a7…`) and `.qa/fingerprint.mjs --compare` 8/8 against `fp-flailfix-r88.json`.
The build stamp is UNCHANGED at `links-r87` - a comment-only landing does not bump it (RECIPES).
The canonical md5 moved to `9b193635db219fa81fb05eed8f64fcb9`,
so `docs/GAMES.md` carries a dated entry for it, and this is that entry.

TWO DISCOVERIES WORTH THE RECORD. (1) The comment-only proof is sensitive to the LENGTH of a comment that has code AFTER it on the same line:
`normalizeCode` preserves that interior whitespace,
so shortening such a comment moves the code and breaks the hash even though nothing semantic changed.
The tool therefore preserves the length of those comments exactly and changes only comments that end their line.
(2) The `md5` slot check in `lint-docs` was scoped to the FIRST dated entry,
not the newest - it was correct only while the record carried exactly one dated entry,
and a second entry made a fresh landing unable to satisfy it. Fixed to take the LAST dated heading.

Approved: the owner's go on 2026-11-19 ("ok you can start now"),
with two rulings: `ingest.mjs` gets the owner-go gate,
and the canonical's archaeology (what was tried and rejected, who/when, owner quotes) is DELETED outright rather than relocated - "you are free to remove and delete all of that,
an agent doesnt need to know it". The owner also asked for the work as ONE patch and ONE commit, so all five phases land together.

Deviations: `ingest.mjs` is a dormant tool the spec would delete;
the owner chose the gate instead, so it stays.
The audit's 56KB estimate for the canonical's archaeology was NOT met:
it measured the owner/date-BEARING comments,
but most of those bytes are the LIVE LAW attached to an attribution,
and the owner's ruling keeps the law. The realised removal is 16,132 comment chars (4,022 tokens),
which is what "who/when/quotes/rejected approaches" actually cost.
The audit's W-02 target for §Current state (<= 17,000 tokens) was not met either:
20,666. The residue is live design prose,
and the remaining 23 lines that resist automatic wrapping need an author,
not a tool - `lint-docs` names them as warnings rather than pretending they are clean.

## #808 Audit Phases 5+6 (close-out): placeholder dirs and the dead history-glob code removed; LEDGER, ROADMAP and AUDIT-REPORT deleted; BATCH3 trimmed to #805+; tool-placement rule added; #807's hash recorded - ledger (65d3401)

What: DOCS + TOOLS. (1) D2/F09 resolved as REMOVE: the 8 empty placeholder dirs deleted (packages/core, packages/render, packages/server, apps/studio, games/_probe, games/_template, assets/fonts, .vscode - each held only a .gitkeep; scratch/ kept, it is the live runtime dir);
AGENTS.md's placeholder sentence rewritten (BUILD Phase 0 creates the tree). (2) F13:
the tool/proof placement line added to the AGENTS task-to-command map.
(3) The dead history-glob code #807 left inert is deleted:
tools/lib/docset.mjs removed (historyFiles was its only consumed export, 4 importers),
the history handling stripped from docreflow.mjs, navgen.mjs,
gen-state.mjs and lint-docs.mjs; navgen lost the Frozen-eras table,
the era NOTE clause and the "key above" index wording;
docs/GAMES.md's nav block regenerated. (4) Phase 6 close-out:
docs/handoff/ROADMAP.md and docs/handoff/AUDIT-REPORT.md deleted; the AGENTS "Audit work" row removed;
lint-docs' ROADMAP routing special case removed.
(5) docs/handoff/LEDGER.md (~87k tokens, frozen since #805) deleted:
HANDOFF.md (table rows + old pointers), AGENTS.md (truth table) and RUNBOOK s9 updated (the landing-record rule loses the ROADMAP step and the LEDGER sentence; the new-chat prompt loses the ROADMAP sentence),
and the dangling s7 pointers removed from RUNBOOK s1/s8.
(6) BATCH3-STATUS.md trimmed to the current era: the legacy Batch 2/3 preamble, the follow-ups paragraph,
the Batch 2 appendix and entries #749-#804 deleted (~50k to ~2k tokens);
the header rewritten (its docs/history-glob warning died with the glob).
(7) F14 (manifest loader annotations) and F16 (canonical comment census) CLOSED AS WON'T-DO:
the audit rated both Low benefit - F14 pays only when the canonical's script layout changes (tools/lib/load-sim.mjs's header already documents the deliberate carve-outs),
F16 pays only for agents that violate the grep-only rule and needs a census that gates nothing today.
(8) gen-state.mjs' read-policy map lost the dead-file rows;
STATE.md regenerated (handoff cost table 6 rows to 3).
#807 LANDED AS 4a4f125 is recorded. The canonical, the sim,
measure.mjs and every probe are untouched (canonical md5 5de162de46eb4fa3204e3ee636f2aff3 unchanged); docs+tools patch,
no battery or fingerprints required (RUNBOOK s4).

Why: the 2026-11-19 audit ends at Phase 6, whose removal clause names ROADMAP.md,
AUDIT-REPORT.md and the AGENTS "Audit work" row.
Owner policy: "dont keep history/retired,
just remove it to not add to the confusion" - the temporary audit scaffolding,
the frozen LEDGER and the pre-#805 ledger entries were ~144k tokens of read-never history on every session's router.

Approved: the owner's "go" this session on the combined Phases 5+6 proposal, built under the standing "you do the decisions ... you are allowed to delete and trim where you want, and dont keep history/retired".

Deviations: (a) the deletions (LEDGER.md, ROADMAP.md, AUDIT-REPORT.md, ledger entries #749-#804, the placeholder dirs, tools/lib/docset.mjs) are recoverable only from git:
the rule-10 tag handoff-pre808 on BASE 4a4f125 is the owner's first command; `git show handoff-pre808:<path>`.
(b) RUNBOOK s1/s8/s9/s10 edited although "this file changes only when a rule changes" - the landing-record rule itself changed (no ROADMAP step, no LEDGER),
and s1/s8/s10 carried pointers into deleted content. (c) Route A delivery by a Qwen session:
RUNBOOK s6 assumes Qwen has no file channel;
this session has one and the owner's session instruction asked for "one patch proven on a fresh clone";
s6's text is unchanged (route renomination is the owner's).

## #807 Audit Phase 4: GAMES.md budget, baseline _meta, verify --orient, docs/history deleted; #806's hash recorded - ledger (commit 4a4f125)

What: DOCS + TOOLS. (1) GAMES.md budget 40,000 tokens: tools/lint-docs.mjs warns above it;
RUNBOOK s10 gives the trim procedure (delete oldest dated entries and superseded sections; no archive; keep the newest dated entry, it carries the canonical md5). GAMES.md deleted:
the duplicated core contact law and uniform base sections (LAWS.md is the authority),
the reverted movement-speed section, the #748-#753 process entries,
the intro bullets restating laws (one stated the retired projectile rule as live). docs/history/ (3 era files) deleted;
RUNBOOK s0/s1/s3/s8 and AGENTS, README, copilot-instructions, HANDOFF, RECIPES lose their references.
(2) .qa/fp-flailfix-r88.json gains `_meta` {canonicalMd5, stamp};
fingerprint.mjs writes it and prints it on --compare (8/8 confirmed on 5de162de, links-r87); gen-state prints it.
(3) `node tools/verify.mjs --orient` = freshness (online: origin/main vs the ledger's last commit; offline: local HEAD, stated as unchecked) + --quick + strip-hash.
AGENTS step 1 and HANDOFF use it. ROADMAP: Phase 4 DONE, D3/D4 resolved.
#806 LANDED AS 730a56b is recorded. The canonical, the sim,
measure.mjs and every probe are untouched.

Why: the live record was ~55k tokens with a stale CURRENT BUILD, duplicate laws and a retired rule stated as live; the baseline did not say what build it was taken on; the orient step needed a network.

Approved: the owner's "you do the decisions ... delete and trim where you want, dont keep history/retired".

Deviations: docs/history/ (frozen, ~120k tokens) is deleted although RUNBOOK s1 forbade dropping record content;
the owner overrode it and the rule is rewritten.
Recover with `git show <commit-before-#807>:docs/history/<file>`.
The history-glob code (tools/lib/docset.mjs and its callers) is left in place, inert with no directory.

## #806 Audit Phase T: trim pass on LAWS.md, RECIPES.md, AGENTS.md; #805's hash recorded - ledger

What: DOCS. Agent-facing rationale, narrative and history cut from docs/LAWS.md (Retired-rules section dropped; Scope cells of C3 and S3 shortened; all 25 law-table rows keep columns 1-5 byte-identical),
docs/RECIPES.md (trap "Why" stories, bot-recipe and stamp-discipline narrative) and AGENTS.md (prose tightened, no rule dropped).
Rules, commands, numbers and paths kept.
Approx tokens (chars/4) before -> after:
LAWS 5,037 -> 3,962; RECIPES 1,868 -> 1,254;
AGENTS 2,177 -> 1,972 (STATE.md cost table, before and after).
RUNBOOK s8 loses its pointer to the dropped LAWS section.
ROADMAP: Phase T DONE. STATE.md regenerated.
#805 LANDED AS 92dd2ae is recorded. The canonical, the sim,
measure.mjs and every probe are untouched.

Why: Phase T of the audit: the three always-or-often-loaded docs carried rationale an agent never acts on.

Approved: the owner's "phase t go", then "drop it" (LAWS Retired-rules section) and "fold recipes and agents in the patch".

Deviations: RUNBOOK s8 edited (one clause) although no rule changed, because it named the removed LAWS section. RUNBOOK s1 forbids dropping record content; LAWS is a rules file, not the record, and the owner approved the drop.

## #805 Audit Phase 3: HANDOFF.md split into router + RUNBOOK + LEDGER; #804's hash recorded - ledger

What: DOCS + TOOLS. docs/handoff/HANDOFF.md (~92k tokens) is split:
HANDOFF.md is now a ~0.5k router with the freshness check;
RUNBOOK.md (~5k) holds old s0-s5, the live s6 delivery routes,
s8 and a new short s9 (landing record, owner environment, the short new-chat prompt);
LEDGER.md (~87k, frozen, grep-only) holds the old dated status ledger,
the s6 "State after" blocks, s7, the old s9 and s10 verbatim.
A script proved every old line from the status ledger onward appears in the new files,
except one s6 sentence changed on purpose ("Both handoff files update in the same commit" -> "The ledger entry lands in the same commit").
The freshness anchor moves from HANDOFF.md to BATCH3-STATUS.md (AGENTS.md step 1 and 5 and the truth-lives line updated; a "Deliver a patch / process rules" row added). tools/lint-docs.mjs:
the handoff profile lints HANDOFF.md and RUNBOOK.md refs whole,
requires RUNBOOK s1/s6 and a BATCH3 "## #NNN" entry, and exempts the archives from size warnings. tools/gen-state.mjs:
read policies for the new files. ROADMAP.md: Phase 3 DONE, D1 resolved.
#804 LANDED AS 886438c is recorded. The canonical, the sim,
measure.mjs and every probe are untouched.

Why: the handoff was ~140k tokens with the delivery rules (~0.7k) buried between 29k of preamble ledger and 41k of s7; every landing rewrote it.

Approved: the owner's "continue" after Phase 2.

Deviations: STATUS.md and DELIVERY.md from the audit design were not created (the newest ledger entry is the status; the delivery routes are only ~0.7k tokens and sit in RUNBOOK s6).
Old comments saying "HANDOFF s7" or "HANDOFF section 1" now map to LEDGER.md and RUNBOOK.md s1; HANDOFF.md says so.
Per-landing edits shrink to: one ledger entry, ROADMAP if a phase moved, STATE regen.

