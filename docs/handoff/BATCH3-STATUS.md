# BATCH3-STATUS — the landing ledger (newest first)

Contains: one short "## #NNN <title> - ledger" section per landing, newest first (What / Why / Approved / Deviations).
Read when: only to look up one landing's receipts; grep "^## #NNN", never read whole. Token cost: see STATE.md.

LOCATION: docs/handoff/BATCH3-STATUS.md — REPO-HOSTED, updated in the same commit as every landing; current as of HEAD
by construction. Chat attachments of older copies are OBSOLETE; the repo outranks them. Trimmed at #808 to the current
era: the landing record starts at #805 (RUNBOOK s9); the legacy Batch 2/3 preamble and older entries are git history
(recovery point: tag handoff-pre808). Freshness: `git log -1 --format='%h' -- docs/handoff/BATCH3-STATUS.md` = origin/main.

## #808 Audit Phases 5+6 (close-out): placeholder dirs and the dead history-glob code removed; LEDGER, ROADMAP and AUDIT-REPORT deleted; BATCH3 trimmed to #805+; tool-placement rule added; #807's hash recorded - ledger (this commit)

What: DOCS + TOOLS. (1) D2/F09 resolved as REMOVE: the 8 empty placeholder dirs deleted (packages/core, packages/render, packages/server, apps/studio, games/_probe, games/_template, assets/fonts, .vscode - each held only a .gitkeep; scratch/ kept, it is the live runtime dir); AGENTS.md's placeholder sentence rewritten (BUILD Phase 0 creates the tree). (2) F13: the tool/proof placement line added to the AGENTS task-to-command map. (3) The dead history-glob code #807 left inert is deleted: tools/lib/docset.mjs removed (historyFiles was its only consumed export, 4 importers), the history handling stripped from docreflow.mjs, navgen.mjs, gen-state.mjs and lint-docs.mjs; navgen lost the Frozen-eras table, the era NOTE clause and the "key above" index wording; docs/GAMES.md's nav block regenerated. (4) Phase 6 close-out: docs/handoff/ROADMAP.md and docs/handoff/AUDIT-REPORT.md deleted; the AGENTS "Audit work" row removed; lint-docs' ROADMAP routing special case removed. (5) docs/handoff/LEDGER.md (~87k tokens, frozen since #805) deleted: HANDOFF.md (table rows + old pointers), AGENTS.md (truth table) and RUNBOOK s9 updated (the landing-record rule loses the ROADMAP step and the LEDGER sentence; the new-chat prompt loses the ROADMAP sentence), and the dangling s7 pointers removed from RUNBOOK s1/s8. (6) BATCH3-STATUS.md trimmed to the current era: the legacy Batch 2/3 preamble, the follow-ups paragraph, the Batch 2 appendix and entries #749-#804 deleted (~50k to ~2k tokens); the header rewritten (its docs/history-glob warning died with the glob). (7) F14 (manifest loader annotations) and F16 (canonical comment census) CLOSED AS WON'T-DO: the audit rated both Low benefit - F14 pays only when the canonical's script layout changes (tools/lib/load-sim.mjs's header already documents the deliberate carve-outs), F16 pays only for agents that violate the grep-only rule and needs a census that gates nothing today. (8) gen-state.mjs' read-policy map lost the dead-file rows; STATE.md regenerated (handoff cost table 6 rows to 3). #807 LANDED AS 4a4f125 is recorded. The canonical, the sim, measure.mjs and every probe are untouched (canonical md5 5de162de46eb4fa3204e3ee636f2aff3 unchanged); docs+tools patch, no battery or fingerprints required (RUNBOOK s4).

Why: the 2026-11-19 audit ends at Phase 6, whose removal clause names ROADMAP.md, AUDIT-REPORT.md and the AGENTS "Audit work" row. Owner policy: "dont keep history/retired, just remove it to not add to the confusion" - the temporary audit scaffolding, the frozen LEDGER and the pre-#805 ledger entries were ~144k tokens of read-never history on every session's router.

Approved: the owner's "go" this session on the combined Phases 5+6 proposal, built under the standing "you do the decisions ... you are allowed to delete and trim where you want, and dont keep history/retired".

Deviations: (a) the deletions (LEDGER.md, ROADMAP.md, AUDIT-REPORT.md, ledger entries #749-#804, the placeholder dirs, tools/lib/docset.mjs) are recoverable only from git: the rule-10 tag handoff-pre808 on BASE 4a4f125 is the owner's first command; `git show handoff-pre808:<path>`. (b) RUNBOOK s1/s8/s9/s10 edited although "this file changes only when a rule changes" - the landing-record rule itself changed (no ROADMAP step, no LEDGER), and s1/s8/s10 carried pointers into deleted content. (c) Route A delivery by a Qwen session: RUNBOOK s6 assumes Qwen has no file channel; this session has one and the owner's session instruction asked for "one patch proven on a fresh clone"; s6's text is unchanged (route renomination is the owner's).

## #807 Audit Phase 4: GAMES.md budget, baseline _meta, verify --orient, docs/history deleted; #806's hash recorded - ledger (commit 4a4f125)

What: DOCS + TOOLS. (1) GAMES.md budget 40,000 tokens: tools/lint-docs.mjs warns above it; RUNBOOK s10 gives the trim procedure (delete oldest dated entries and superseded sections; no archive; keep the newest dated entry, it carries the canonical md5). GAMES.md deleted: the duplicated core contact law and uniform base sections (LAWS.md is the authority), the reverted movement-speed section, the #748-#753 process entries, the intro bullets restating laws (one stated the retired projectile rule as live). docs/history/ (3 era files) deleted; RUNBOOK s0/s1/s3/s8 and AGENTS, README, copilot-instructions, HANDOFF, RECIPES lose their references. (2) .qa/fp-flailfix-r88.json gains `_meta` {canonicalMd5, stamp}; fingerprint.mjs writes it and prints it on --compare (8/8 confirmed on 5de162de, links-r87); gen-state prints it. (3) `node tools/verify.mjs --orient` = freshness (online: origin/main vs the ledger's last commit; offline: local HEAD, stated as unchecked) + --quick + strip-hash. AGENTS step 1 and HANDOFF use it. ROADMAP: Phase 4 DONE, D3/D4 resolved. #806 LANDED AS 730a56b is recorded. The canonical, the sim, measure.mjs and every probe are untouched.

Why: the live record was ~55k tokens with a stale CURRENT BUILD, duplicate laws and a retired rule stated as live; the baseline did not say what build it was taken on; the orient step needed a network.

Approved: the owner's "you do the decisions ... delete and trim where you want, dont keep history/retired".

Deviations: docs/history/ (frozen, ~120k tokens) is deleted although RUNBOOK s1 forbade dropping record content; the owner overrode it and the rule is rewritten. Recover with `git show <commit-before-#807>:docs/history/<file>`. The history-glob code (tools/lib/docset.mjs and its callers) is left in place, inert with no directory.

## #806 Audit Phase T: trim pass on LAWS.md, RECIPES.md, AGENTS.md; #805's hash recorded - ledger

What: DOCS. Agent-facing rationale, narrative and history cut from docs/LAWS.md (Retired-rules section dropped; Scope cells of C3 and S3 shortened; all 25 law-table rows keep columns 1-5 byte-identical), docs/RECIPES.md (trap "Why" stories, bot-recipe and stamp-discipline narrative) and AGENTS.md (prose tightened, no rule dropped). Rules, commands, numbers and paths kept. Approx tokens (chars/4) before -> after: LAWS 5,037 -> 3,962; RECIPES 1,868 -> 1,254; AGENTS 2,177 -> 1,972 (STATE.md cost table, before and after). RUNBOOK s8 loses its pointer to the dropped LAWS section. ROADMAP: Phase T DONE. STATE.md regenerated. #805 LANDED AS 92dd2ae is recorded. The canonical, the sim, measure.mjs and every probe are untouched.

Why: Phase T of the audit: the three always-or-often-loaded docs carried rationale an agent never acts on.

Approved: the owner's "phase t go", then "drop it" (LAWS Retired-rules section) and "fold recipes and agents in the patch".

Deviations: RUNBOOK s8 edited (one clause) although no rule changed, because it named the removed LAWS section. RUNBOOK s1 forbids dropping record content; LAWS is a rules file, not the record, and the owner approved the drop.

## #805 Audit Phase 3: HANDOFF.md split into router + RUNBOOK + LEDGER; #804's hash recorded - ledger

What: DOCS + TOOLS. docs/handoff/HANDOFF.md (~92k tokens) is split: HANDOFF.md is now a ~0.5k router with the freshness check; RUNBOOK.md (~5k) holds old s0-s5, the live s6 delivery routes, s8 and a new short s9 (landing record, owner environment, the short new-chat prompt); LEDGER.md (~87k, frozen, grep-only) holds the old dated status ledger, the s6 "State after" blocks, s7, the old s9 and s10 verbatim. A script proved every old line from the status ledger onward appears in the new files, except one s6 sentence changed on purpose ("Both handoff files update in the same commit" -> "The ledger entry lands in the same commit"). The freshness anchor moves from HANDOFF.md to BATCH3-STATUS.md (AGENTS.md step 1 and 5 and the truth-lives line updated; a "Deliver a patch / process rules" row added). tools/lint-docs.mjs: the handoff profile lints HANDOFF.md and RUNBOOK.md refs whole, requires RUNBOOK s1/s6 and a BATCH3 "## #NNN" entry, and exempts the archives from size warnings. tools/gen-state.mjs: read policies for the new files. ROADMAP.md: Phase 3 DONE, D1 resolved. #804 LANDED AS 886438c is recorded. The canonical, the sim, measure.mjs and every probe are untouched.

Why: the handoff was ~140k tokens with the delivery rules (~0.7k) buried between 29k of preamble ledger and 41k of s7; every landing rewrote it.

Approved: the owner's "continue" after Phase 2.

Deviations: STATUS.md and DELIVERY.md from the audit design were not created (the newest ledger entry is the status; the delivery routes are only ~0.7k tokens and sit in RUNBOOK s6). Old comments saying "HANDOFF s7" or "HANDOFF section 1" now map to LEDGER.md and RUNBOOK.md s1; HANDOFF.md says so. Per-landing edits shrink to: one ledger entry, ROADMAP if a phase moved, STATE regen.

