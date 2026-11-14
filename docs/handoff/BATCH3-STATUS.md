# BATCH 3 — GAMES.md usability and docs authority: STATUS — COMPLETE

LOCATION: docs/handoff/BATCH3-STATUS.md — REPO-HOSTED alongside HANDOFF.md (v9+). Updated in the same
commit as every landing; current as of HEAD by construction. Chat attachments of older copies are
OBSOLETE; the repo outranks them. Never move these files into docs/history/ (globbed by the doc
tools; an unlisted file there fails lint). Freshness: `git log -1 --format='%h %s' -- docs/handoff/`.

Status as of 2026-11-14: (a) DONE (0ddd7f5, #746) · (b) DONE (9e017bb, #742) · (d) DONE (f756e21, #747)
· (c) DONE (68e29f9, #748). Nothing remains in Batch 3. Next: optional doc items, then Batch 4 —
HANDOFF §7. The Batch 2 ledger is the appendix below, carried verbatim. STATE.md and docs/CODEMAP.md
are authoritative for every number.

Follow-ups: the #749 patch landed the optional doc items (index titles, the mf-2 14 KB line, AGENTS/README pointers, the #749
entry) — see the first ledger below; its commit hash is not known to this file. Next: Batch 4 or the law-table follow-ups.

## #749 follow-ups — ledger (this commit)

What: the optional items of HANDOFF §7 as ONE commit. (1) navgen rowTitle(): the 54 numbered entries of mf-2 show `NNN — <heading text>` in the entry index instead of a bare number; every other row is unchanged. (2) mf-2 line 526 (entry #721's AT THIS LANDING sub-paragraph, 14,343 bytes, the only line over 3,000 bytes in the record set) became 26 lines, each ≤ 560 bytes, by turning existing spaces into newlines — no byte added or removed, no blank line. (3) AGENTS "Where truth lives" and the README router point at docs/handoff/HANDOFF.md. (4) #749 appended to GAMES. Both handoff files updated. Canonical, LAWS, CODEMAP, docreflow, gen-state, lint-docs, docset untouched.
Why: the index is the front door to two era files and showed 54 bare numbers; the 14 KB line was unreadable in an editor and the one thing docreflow could not break; the hosting patch deferred the pointers and the entry to stay new-file-only.
Approved: "go" after the read-only proposal.
Deviations (flagged at delivery): (1) a FROZEN era file was edited, whitespace-only; the rejoin, non-whitespace, word, byte, heading and line-count proofs run in memory before anything is written. (2) NOT a diff of the changed files: a new-file-only patch holding one gated self-deleting one-shot (tools/doc/land-749.mjs, HANDOFF §6.8), because replacing a 14 KB line is about 29 KB of diff to transcribe; the regenerated files are produced on the owner's machine, so `git add -A` is required. (3) Bold spans in the re-paragraphed line now cross soft newlines: valid CommonMark, NOT render-checked.
Findings: docreflow could not split that line because every break point sits inside a bold span; no tool compares a frozen era file with its pre-edit self, so the one-shot's in-memory proofs are the only guard on the edit, and nothing guards the result against a later re-join (control: joining two of the 26 lines keeps verify --quick green).
Not verified here: no rendered-markdown check; battery and measure.mjs not run (canonical untouched). Command results, negative controls and per-file md5s are in the delivery message and in the HANDOFF state block.
Rollback: `git revert` this commit.

## Handoff hosting — ledger (commit 24ce531)

What: HANDOFF.md (v9) and this file moved INTO the repo at docs/handoff/, as two NEW files. No tool,
record, canonical or generated file changed. Why: after 3(c) landed, the owner's chat still attached
the v7 pair ("3(c) NOT STARTED") twice; each new chat restarted with a stale-notes contradiction and
cost a turn. Repo-hosting makes the notes current as of HEAD by construction and removes the
attachment swap entirely. Approved by the owner as: "can you fix it?".
Deviations flagged: (1) HANDOFF v8 §9 said handoff files are NOT part of the repo — reversed here,
with the owner's ask; §9 now requires updating both files in every landing patch. (2) No #749
chronicle entry and no AGENTS/README pointer in THIS patch — deferred to the next docs patch so this
delivery is a new-file-only diff (the safest chat-paste form, §6.7). (3) docs/handoff/ is outside
every lint glob and outside STATE's cost table by design; verify --quick stays green untouched.
Receipts: measured on a fresh clone at BASE 68e29f9 before the change (verify --quick PASS 6 checks;
strip-hash PASS, self-test PASS, invariants c2cd01ef… / e9b6f8d6… / 600097a7…; canonical 5de162de…);
after adding the two files, verify --quick re-run (result recorded in the delivery message).
Rollback: `git revert <this commit>` removes docs/handoff/ entirely; nothing else is touched.

## 3(c) — ledger

What: docs/GAMES.md split by era into docs/history/. Three frozen era files, cut on entry boundaries,
content moved VERBATIM: mf-1-pre667.md (34 unnumbered measured-facts entries, 2026-10-28 -> 11-01),
mf-2-667-721.md (54 numbered entries #667-#721, the #671 tombstone included), chronicle-722-747.md
(26 dated landings #722-#747). GAMES keeps the preface, The documents, the nav block, §Current state,
Weapon art, Design principles, Open design questions, a `## Measured facts` STUB (original tombstone
+ pointers), the Testing recipe, and the live landing area. New tools/lib/docset.mjs exports the
sorted glob of the record set; navgen, docreflow, gen-state, lint-docs all consume it. gen-codemap
and verify untouched. navgen gained a Frozen eras table and a `file` column on the 88-row entry index
(line numbers per file; era files are read-only inputs). docreflow re-invokes itself per era file, so
its three whitespace proofs stay per-file. gen-state prices the era files. lint-docs: canonical-md5
slot became a UNION check; preface + token-cost guards cover era files; two NEW checks (every era
file named in GAMES; every docs/history path GAMES names exists). Routing prose updated in README,
AGENTS, copilot-instructions. #748 appended. 13 files (+1,460 / -1,341); CODEMAP and LAWS did not
move; canonical untouched.
Approved: "go, do what you think is best", then "just write the patch here in the chat", then "can we
start over again with the patch".
Deviations (all flagged at delivery): (1) NOT one self-contained patch — a verbatim 482 KB move => a
~1 MB diff, impossible to paste into chat; shipped as a patch PLUS tools/doc/split-games.mjs, a
gated self-deleting one-shot (§6.6), so docs/history/* and STATE.md were produced on the owner's
machine (`git add -A` required). (2) lint-docs ultimately shipped as a separate pure-ASCII gated
script after three failed patch pastes. (3) New navigation prose only (era prefaces, MF stub, The
documents bullet, nav NOTE, #748); no record rewritten/reworded/reordered/deleted. (4) docreflow
--check exit-code fix (always 0 -> 1 on pending); v7 §8's "verify parses its text" was wrong.
(5) AGENTS' stale "~155k tokens" became a STATE pointer; the grep hint added. (6) Tag
games-presplit-3c before the move.
Findings: (1) the live md5 was carried ONLY by the chronicle (#745/#746) — §Current state's CURRENT
BUILD holds a HISTORICAL md5 (83867fb7…, 5,034 lines, #721) — hence the union check. (2) Dates NOT
monotonic (#711-#720 dated 10-31 sit after #706-#710 of 11-03) — era cuts must be positional.
(3) The chronicle is 26 landings, not 28 — the splitter's gate refused the first run over that.
(4) lintRefs only scans §Current state, so the nav block needed its own history check. (5) The only
GAMES § pointer in operational docs is §Current state — moving records broke no section pointer.
(6) The four doc tools were the ONLY readers of GAMES. (7) The unbreakable line is 14,157 CHARS /
14,343 BYTES, now mf-2 line 526. (8) Delivery failures, all agent-side: an unverified patch-file md5
published; a hunk's trailing context invented from memory (`patch does not apply`); a lone-space
blank line at EOF (`corrupt patch`). The owner's terminal collapses newlines on paste; `!` triggers
history expansion. All encoded in HANDOFF §6.7. (9) Process failure after the landing: stale v7
attachments kept re-entering new chats — fixed by repo-hosting (this commit).
Receipts (fresh clone at 68e29f9): verify --quick PASS (6 checks; docreflow "4 file(s) in the record
set"); strip-hash PASS + self-test PASS (c2cd01ef… / e9b6f8d6… / 600097a7…), also run by the owner;
all 13 shipped files byte-identical to the build (GAMES df56830c…, mf-1 73c5cb96…, mf-2 bd74516a…,
chronicle 2a9798f2…, STATE 97c933ea…, AGENTS d15855f3…, README 1622682e…, copilot 4e193280…,
navgen 6154479b…, docreflow 88363bdd…, gen-state 5dd8bf7d…, lint-docs daf5ae8f…, docset 03e418e8…);
moved spans 183,530 / 211,900 / 86,562 bytes byte-identical in their new homes; §Current state, the
Testing recipe and the tombstone verbatim; 97 ### headings (9+34+54) and 26 dated landings preserved;
index exactly 88 rows in 2 files; mojibake census clean on all four record files; splitter absent
from HEAD; tools/ = 10 incl. lib/docset.mjs. TEN controls behaved as intended: C0 pass; C1 md5 absent
everywhere FAIL; C2 md5 only in history PASS; C3 token cost in era preface FAIL; C4 read-whole era
preface FAIL; C5 orphan era file FAIL; C6 renamed era file FAIL; C7 pending reflow in era file
verify FAIL; C8 stale nav block verify FAIL; C9 new era file auto-picked-up with no tool edit
(index "89 entries in 3 file(s)"). STATE costs: GAMES 168,385 -> 50,170 (-70.2%); mf-1 45,547;
mf-2 52,445; chronicle 21,598; AGENTS 1,354 -> 1,434; README 263 -> 288; set +1,375 navigation tokens.
Sizes: GAMES 569 lines / 202,486 B; mf-1 362 / 184,056; mf-2 529 / 212,439; chronicle 315 / 87,057.
Not verified: battery + measure.mjs NOT run (canonical untouched); no rendered-markdown check; era
prefaces and #748 are new prose no tool validates; numbered index titles still bare numbers.
Rollback: `git revert 68e29f9`; `git show games-presplit-3c:docs/GAMES.md` recovers the monolith.

## 3(d) — ledger

What: docs/LAWS.md became SOLE AUTHORITY for the current laws, the weapon-trait count (pinned line
"14 of 22 weapon traits landed") and which probe checks each law. lint-docs trait-count direction
reversed (LAWS is the source; README, AGENTS, LAWS and the explicit "N of 22 weapon traits" phrase in
GAMES §Current state checked against it). New `## Law-to-probe table`: 25 rows (C1-C6, S1-S6, B1-B5,
U1, G1-G3, T1-T3, X1); every file::anchor verified by lint-docs. Also: GAMES preface callout, AGENTS
(Where truth lives + lint line), gen-state design-state pointer, #747 entry. Six files; CODEMAP did
not move; canonical untouched. Approved: "go" (pin in LAWS rather than derive from REGISTRY).
Delivered as ONE patch, applied and pushed as f756e21.
Deviations (flagged): LAWS now pins the count; the GAMES preface callout edited (navigation prose);
the table is hand-built (no probe tags asserts by law ID) — lint verifies anchors, Status/Scope are
judgement.
Findings: the OLD count check guarded nothing in README/AGENTS/LAWS (none held "N of 22"); the only
live statement was CURRENT BUILD in GAMES §Current state. Contact 3/4/5 and shot 1s/3s/5s/6s are
audited ONLY by measure.mjs. B1/B2/U1 have no assertion anywhere; fingerprint is a change detector.
Statuses: 2 probed, 13 partial, 7 owner-run only, 3 unprobed (36 anchors).
Receipts: nine negative controls each failed with the intended message + passing control. Fresh
clone at 0ddd7f5: apply --check/--index OK, six md5s identical, verify --quick PASS, strip-hash PASS.
Re-measured at f756e21 after the push: six files byte-identical (AGENTS b602d6e4…, STATE 92ad71dd…,
GAMES 28a9775b…, LAWS 1588876f…, gen-state 87d680b8…, lint-docs 82482a06…), verify PASS, strip-hash
PASS. Costs: LAWS 2,473 -> 3,989; AGENTS 1,327 -> 1,354; GAMES 167,486 -> 168,385. docreflow re-wrapped
#747's long line (whitespace-only).
Not verified: battery, measure.mjs (canonical untouched); coverage judgement rests on probe reads;
no census (canonical untouched).
Rollback: `git revert f756e21`.

## 3(a) — ledger

What: all 88 Measured-facts entries `**X** body` -> `### X` + body. navgen (isNew, title) and
docreflow (isNewEntry) recognise the ### form (B3A:). #746 appended. Canonical untouched.
Approved: go with both recommendations (heading = whole old bold span verbatim; append #746).
Deviations (flagged): 88 entries, not ~104 (other bold-led lines are sub-paragraph labels + 4
tombstones, left alone); long headings (median 229 chars, p90 563, max 794; 23 without same-line
body; 12 nested bold); delivered as finished files, then patches became the standing format; #746
added on the owner's yes.
Receipts: byte-neutral 674,062 -> 674,062 before #746; lines outside Measured facts byte-identical;
per-entry round trip; identical content stream modulo markers/whitespace; 88-row index identical in
date/title/KB; docreflow --check 0 pending. At 0ddd7f5 after push: four files byte-identical
(GAMES 7595c82b…, navgen b49f778f…, docreflow ebf90bbc…, STATE 16465deb…); verify PASS; strip-hash
PASS. measure.mjs NOT run.
Not verified: battery (not required); no rendered check; numbered titles still bare (open item).
Findings: 54 of 88 entries already carried chronicle numbers 667-721 as the first title token —
#742's "no numbers" claim was wrong for them. The 14,343-byte line unchanged (break points inside
bold spans).
Rollback: `git revert 0ddd7f5`.

## What is next

Batch 3 CLOSED; its follow-up patch (#749) is DONE. Per HANDOFF §7: (1) optional law-table follow-ups (B1/B2/U1 + 7 owner-run-only
laws; .qa/ probes); (2) Batch 4 tool layout (docset.mjs is a dependency of four tools; keep the repo-root contract). Propose first;
wait for "go"; ONE patch per HANDOFF §6 + §6.7/§6.8, updating both handoff files in the same commit.

## APPENDIX — BATCH2-STATUS.md, carried forward verbatim

Its §8 ("Next: Batch 3 — see HANDOFF v5 §7") is superseded by the section above. Its figures are the
post-2c7 values; the canonical has not changed since.

BATCH 2 — canonical navigation (items 7, 8, 9): STATUS — COMPLETE

Was BATCH2-PROPOSAL.md, then STATUS in progress. Now: APPROVED AND EXECUTED TO COMPLETION.
D1-D6 are answered (§1). All patches are landed and pushed: 2a, 2b, and 2c1 through 2c7.
Nothing remains in Batch 2.

Final authoritative canonical state after 2c7:
canonical md5: 5de162de46eb4fa3204e3ee636f2aff3
lines: 4,716
stamp: links-r87
canonical ≈ 104,970 tokens
script block 0 carries 901 comment spans ≈ 49,330 tokens
(The last two are projections from the 2c7 dry run; the authoritative figures live in
STATE.md and docs/CODEMAP.md — re-read them, don't trust this prose.)

1. Decisions D1-D6 — ANSWERED

The owner's answer was a blanket delegation: "do what you think is the best for ai agents, this
repo is meant for ai agents. you are allowed to go against the doctrine if that's what you need,
just give me a heads up if you do, also do not run measure.mjs."

| # | Question | Answer | Basis |
| ---|---|---|---|
| D1 | Approve 2a? | Yes | 2a landed |
| D2 | Pointer style | // ref: <build-tag> | 62/67 tags resolve in GAMES. #NNN deferred until Batch 3(a) |
| D3 | Comment-ratio target | 20-30% band | CLOSED as unreachable-by-diet — see §4. ~48% is the floor with law kept |
| D4 | Owner quotes not found in GAMES | Keep them in the canonical | applied in every patch |
| D5 | CSS head + 2nd script block | Out of scope | ≈2.6k tokens |
| D6 | Grep measure.mjs read-only | Approved (grep yes, execute no) | §2 |

2. measure.mjs — grep findings (read-only, never executed)

It extracts the first <script> IIFE by text position, does not match canonical comment text,
and contains no writeFileSync. Comment-only canonical edits are safe from it. Indicative, not
exhaustive. Execution remains permanently banned.

3. Cumulative Batch 2 result (post-2b -> final)

The three strip-hash invariant hashes stayed identical through all eight canonical patches —
the accumulating proof that no code token moved anywhere in Batch 2:
non-script md5   c2cd01ef082e4b49101447dc2e2073d0
script 0 code    e9b6f8d6eb7f442c390c6cdb6517895b
script 1 code    600097a7b52d7d40b00797581e6d35a6

| metric | post-2b | final | Δ |
| ---|---|---|---|
| lines | 5,058 | 4,716 | -342 |
| canonical tokens | 115,356 | ~104,970 | -~10,400 |
| comment tokens | 59,736 | ~49,330 | -~10,400 |
| comment spans | 905 | 901 | -4 |
| comment ratio | ~52% | ~48% | |

Per-patch receipts (canonical md5 -> result):

| patch | scope | result |
| ---|---|---|
| 2c1 | loop/input/APP | bedca518… , 5,031 lines, -27 |
| 2c2 | circles/chain/geometry | 0776b237… , 4,999 lines, -31 |
| 2c3 | REGISTRY block comments | 7b0e6a3d… , 4,932 lines, -67 |
| 2c3b | REGISTRY trailing giants | 09f85c50… , 4,841 lines (0 net) |
| 2c4 | length growth | dcaa64b3… , 4,841 lines, -92 net |
| 2c5a | consts + poly builder | 29520663… , 4,857 lines, +16 net |
| 2c6 | SIM (all six markers) | 0b7fd414… , 4,765 lines, -92 |
| 2c7 | RENDERER (all six markers) | 5de162de… , 4,716 lines, -49 |

Note 2c4 and 2c5a moved lines UP: single-line art headers and the javelin/tome/scroll/orb
giants became readable multi-line blocks. Fewer tokens, more lines — the same trade Batch 3
makes in GAMES. Line count is not a diet goal; token cost and law-preservation are.

Each patch: strip-hash PASS (three invariants), verify --quick PASS, fingerprint 8/8,
verify --battery PASS. measure.mjs NOT run. Mojibake census clean on the final artifact.

4. Why the D3 band is closed (yield math, measured not assumed)

Code is invariant at ≈53.0k tokens (strip-hash's whole job). Comments landed at ≈49.3k. To reach
the band:
30% comments -> comments <= 22.7k -> remove another ≈26.6k tokens
20% comments -> comments <= 13.3k -> remove another ≈36.0k tokens
Every landed region removed 18-48% of its big-comment mass and left its law intact; the
remainder across the canonical is almost entirely rationale the code cannot express. That
≈26.6k is not coming from diet. The diet stopped at ≈48% by design.

Options, for the owner:
A (done, recommended): close the band at ~48%, law kept. Repo is navigable via the 1.5k
CODEMAP; agents rarely read the canonical whole.
B: relocate law into docs/LAWS.md as the sole authority, canonical law comments become
pointers. The only honest path toward 30%, but moves the problem and grows LAWS.md to ~20k+.
C: structural split (owner-only, rule 5). Highest payoff, highest blast radius.
A is the current state. B/C are not scheduled and require explicit owner sign-off.

5. Diet rules (battle-tested across eight patches)

R1 Keep comments stating a law, invariant, or a "why" the code can't show; tighten them.
R2 Replace provenance with `// ref: <build-tag>[, …]`, greppable in GAMES.md.
R3 Quote gate: every owner quote removed must be found (whitespace-normalised) in GAMES.md, or it
stays in the canonical (D4).
R4 Never touch data blocks (CIRCLES_V2, LEN_CIRCLES incl. BEGIN/END, POOL/EMBER,
SHOTS_ART), any code token, or any §4 anchor.
R5 Trailing comments stay unless pure provenance.

6. What Batch 2 did NOT verify

No browser or visual check. chromecheck uses DOM stubs.
8/8 fingerprints can be vacuous (the suite never rolls a spear and plays only the default
cast); the stripped hash covers it.
strip-hash cannot detect a corrupted character inside a replacement comment — mitigated by
git diff review and the mojibake census.
Unaudited: ingest.mjs write-back, the second script block, any reader not in §4.
measure.mjs was grepped, not fully read.
Rationale loss is a judgement call no tool can prove. Mitigated by the quote gate, the
canonical-prediet-2c tag, and the owner's per-patch review.

7. Rollback

Every canonical patch is independent: `git revert <commit>` restores it.
`git show canonical-prediet-2c:previews/spinclash-preview.html` recovers the pre-diet canonical
with all 2b markers intact. `git show canonical-precomments:<path>` recovers the pre-marker
canonical, so any single removed comment is reachable. Nothing is force-pushed. Pushes are the
owner's. Reminder: push canonical-prediet-2c and canonical-precomments to origin so a
fresh clone can reproduce strip-hash.

8. Next

Batch 3 — see HANDOFF v5 §7. Start with (a): Measured-facts entries -> ### headings.
