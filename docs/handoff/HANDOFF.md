# HANDOFF v9 — arena-engine: make the repo token-friendly for AI agents

LOCATION: docs/handoff/HANDOFF.md — REPO-HOSTED. This file and BATCH3-STATUS.md live in the repo and
are updated IN THE SAME COMMIT as every landing, so they are current as of HEAD by construction.
Chat attachments of older handoffs (v7, v8) are OBSOLETE. If any attached or pasted copy contradicts
this file, THIS FILE WINS. Never put handoff files in docs/history/ — that folder is the frozen
record, globbed by the doc tools; an extra file there fails lint (control C5).

FRESHNESS CHECK (run first, every session):
    git log -1 --format='%h %s' -- docs/handoff/HANDOFF.md   # the landing that last updated this file
    node tools/verify.mjs --quick                            # expect VERIFY PASS — 6 checks
    node .qa/strip-hash.mjs --base canonical-prediet-2c      # expect PASS + the three hashes (§5)
The REPO outranks every prose document, including this one. STATE.md and docs/CODEMAP.md are
generated and authoritative for all numbers.

Status 2026-11-14: Batch 1 DONE. Batch 2 DONE. Batch 3 (a)(b)(c)(d) ALL DONE — Batch 3 CLOSED.
  3a = 0ddd7f5 #746 · 3b = 9e017bb #742 · 3d = f756e21 #747 · 3c = 68e29f9 #748
Follow-ups: the #749 patch (index titles, mf-2 line re-paragraphed, AGENTS/README pointers, #749 entry) is DONE;
  its commit hash is not known to this file (a file cannot contain its own commit) — verify origin.
Next: Batch 4 (tool layout, §7) or the optional law-table follow-ups.
Delivery: ONE patch (§6) — read §6.7 first: the owner copies patches out of CHAT.

State at the 3c landing (re-measure, do not trust): HEAD 68e29f9, parent f756e21; canonical md5
5de162de46eb4fa3204e3ee636f2aff3, 4,716 lines, stamp links-r87 (unchanged by ALL of Batch 3).
As pushed by 3c: GAMES df56830cce89f4040aea2f41359c810d · mf-1 73c5cb96ee06fa914f80db07951af0f2 ·
mf-2 bd74516ab4019e21fa6e735dc4525f31 · chronicle 2a9798f21e7765f4960b5d1e4bbad352 ·
STATE 97c933eac308bbf93b8385ac091de387 · AGENTS d15855f344f021e32b8a9181faf2e4ed ·
README 1622682eda67fe056b7af11a0d0b82ee · copilot 4e1932801a44d7d2a6a34e6c447cb5ab ·
navgen 6154479b122dc81f8a3441bc2b9c8afb · docreflow 88363bddef65dc779ad4c51d2d25c94d ·
gen-state 5dd8bf7d11ba6fee7c282e7e36c64056 · lint-docs daf5ae8f6125e6a92c9be80c399897c6 ·
docset 03e418e846c71122e7c86106d33c8cfd · LAWS 1588876f4abcdaa3f04d8ad97738d188 (unchanged) ·
CODEMAP b334d3553a938801e25df32efe2e62f9 (unchanged).

State after the #749 patch (BASE 24ce531; re-measure, do not trust): canonical, chronicle, mf-1, docreflow, gen-state,
lint-docs, docset, LAWS, CODEMAP all unchanged from the 3c block above. As built by the one-shot: GAMES 8f602745ee4a583af935884330415bb0 ·
mf-2 7a268c717d727216e5c93782d3e6a985 · STATE bb6c529358ff5a58ded571f9a2efba28 · AGENTS bd170ac0d1655b07e446140c3f46adca ·
README 1cb73e7751c2999f9f763e2b74c9b54d · navgen b27164470bbe5d5303839d5bbc408bdb. The two handoff files are not listed (a file cannot hold its own md5).

## 0. The record is a SET (since 3c)

docs/GAMES.md is the live file; three frozen era files live in docs/history/:
  mf-1-pre667.md        34 unnumbered measured-facts entries (2026-10-28 -> 11-01)
  mf-2-667-721.md       54 numbered entries #667-#721 (the #671 tombstone included)
  chronicle-722-747.md  26 dated landings #722-#747
tools/lib/docset.mjs exports the sorted glob (historyFiles(root)); navgen, docreflow, gen-state and
lint-docs all consume it — a new era file needs NO tool edit (proven, control C9). gen-codemap and
verify were not touched. GAMES keeps the preface, The documents, the nav block, §Current state
(owner quotes, open queue, CURRENT BUILD), Weapon art, Design principles, Open design questions, a
`## Measured facts` STUB (original tombstone + pointers), the Testing recipe, and the live landing
area. New measured facts and dated entries are appended to GAMES; a later pass freezes them into a
new era file. Era boundaries are POSITIONAL, never date-sorted (#711-#720 are dated 10-31 but sit
after #706-#710 of 11-03; a date sort would reorder the record — forbidden).
Nav block: a Frozen eras table (key · file · covers · items · size) + a `file` column on the 88-row
entry index; line numbers are PER FILE; keys are basenames without .md; GAMES = the live file.
Era files are READ-ONLY inputs to navgen.
Token effect (STATE.md authoritative): GAMES 168,385 -> 50,170 (-70.2%); eras 45,547 / 52,445 /
21,598; record set +1,375 tokens of navigation overhead for a 70% smaller live file.

## 1. Ground rules (owner-enforced — non-negotiable)

- PROPOSE BEFORE WRITING; wait for the owner's explicit "go". Read-only checks need no go.
- NEVER run measure.mjs. Read-only grep is permitted; execution is not.
- DO NOT SPLIT THE CANONICAL previews/spinclash-preview.html (rule 5). Owner-only decision.
- Removals are TAGGED first (`git tag <name> HEAD`). Never force-push. Pushes are the owner's.
- Terminology: a fighter has a SKILL, a weapon has a TRAIT. Never the bare nouns.
- No balancing talk, no win-rate tables.
- Don't rewrite or drop record content (owner quotes, provenance). Reflow, re-heading and MOVING
  are fine; deleting is not. Stale-but-historical entries stay. Covers docs/history/ too.
- Deliver ONE patch (§6), subject to §6.7. Commit style: `docs: Phase I Batch N — <what>` / `tools: <what>`.
- Go-against-doctrine is allowed but must be flagged IN THE SAME MESSAGE, with why.
- Quote only numbers you measured on the artifact you are shipping. Never say a check passed
  unless you ran it this session and SAW the output.

## 2. Getting live state

    git clone https://github.com/henty2343/arena-engine.git && cd arena-engine
    git log -6 --format='%h %ad %s' --date=short ; git ls-remote origin HEAD ; git ls-remote --tags origin

HEAD may be newer than anything quoted here — re-verify before acting.
Node bootstrap (only if node is absent): Node 22+, no package.json, no dependencies.

    curl -s -m 90 -o /tmp/node.tar.gz \
      https://cdn.npmmirror.com/binaries/node/v22.23.5/node-v22.23.5-linux-x64.tar.gz
    # extract bin/node only, chmod 755 -> /tmp/nodebin/node

Use cdn.npmmirror.com/binaries/... (not npmmirror.com/mirrors/..., a redirect stub). Tarball
56,856,114 bytes. If git clone stalls (it does, repeatedly), this works:
    curl -sL -o /tmp/ae.tar.gz https://codeload.github.com/henty2343/arena-engine/tar.gz/<sha>
but a tarball has NO .git: strip-hash --base and git-show proofs CANNOT run there. Say so.

## 3. Orientation

A localhost Node tool meant to render seeded game sims into MP4s. The engine is PLANNED, not built.
The only live code is game #1, SPINCLASH: one browser file (the ONE canonical) + a bare-Node harness.
Read first: AGENTS.md, STATE.md (generated), docs/CODEMAP.md before opening the canonical, then
docs/LAWS.md (sole authority for the current laws, the trait count, the law-to-probe table),
docs/RECIPES.md.
Enter the record by grepping the SET: `grep -rn '^### 721' docs/GAMES.md docs/history/` — or use the
nav block's Frozen eras table + entry index (file + line). All record files are GREP ONLY.
The old worst line (mf-2 line 526 at 68e29f9, 14,343 bytes, entry #721's AT THIS LANDING sub-paragraph) was re-paragraphed by
#749 into 26 soft-wrapped lines, each <= 560 bytes; its bold spans now CROSS soft newlines (valid CommonMark, not render-checked).
No line in the record set exceeds 3,000 bytes. Do not re-join them. Grep for the sub-paragraph; never hand-copy a line number.
Law-to-probe table (LAWS §Law-to-probe table): 25 rows; 2 probed, 13 partial, 7 owner-run only,
3 unprobed. The 7 owner-run rows (contact 3/4/5; shot 1s/3s/5s/6s) are audited ONLY by measure.mjs.
The 3 unprobed: B1 best-of-3, B2 K.O.-only rounds, U1 uniform base stats. .qa/fingerprint.mjs is a
change detector on the default cast with no spear, not a per-law assertion. Rows cite file::anchor
items that lint-docs verifies; Status/Scope are hand-written judgement.
The canonical is ~105k tokens — never read whole; enter via CODEMAP at one symbol grep. CODEMAP line
numbers are valid only at the md5 in its header. Doc costs live in STATE.md §Documentation cost;
never hand-type a token cost (lint rejects it, era files included).

## 4. Health baseline + proof sequence

    node tools/verify.mjs --quick      # VERIFY PASS — 6 checks
    node tools/verify.mjs --battery    # ~9 min; once per canonical-touching patch

Quick checks in order: gen-state, lint-docs, navgen, docreflow, gen-codemap, lint-markers.
After any canonical edit: `node .qa/strip-hash.mjs --base canonical-prediet-2c` + `verify --battery`.
Battery expected exits: inscribe 0 · lengrow-build-proof 0 · pair-proof 0 · flipproof 0 · leadproof 0 ·
seam-proof 0 · chromecheck 0 · lengrow-gate 1 (BY DESIGN; normalised stdout md5
a31a68c4d19d68a2988c792b481be4d5, 23 lines, 10 GATE FAIL rows) · lengrow-bake --verify 0.
Doc regen after ANY edit to GAMES or docs/history/ (both doc tools cover the set):

    node tools/doc/docreflow.mjs && node tools/doc/navgen.mjs && node tools/gen-codemap.mjs \
      && node tools/gen-state.mjs
    node tools/verify.mjs --quick

## 5. Comment-only proof kit

tools/lib/strip-comments.mjs (scan/strip/normalizeCode) is shared by gen-codemap and
.qa/strip-hash.mjs (--self-test: 5 fixtures + 2 negative controls). Invariant hashes — identical
through all eight 2c patches and all of Batch 3:
    non-script md5   c2cd01ef082e4b49101447dc2e2073d0
    script 0 code    e9b6f8d6eb7f442c390c6cdb6517895b
    script 1 code    600097a7b52d7d40b00797581e6d35a6
PASS means "no code token moved", NOT "the comments are correct". After every canonical edit also
read `git diff previews/spinclash-preview.html` for mojibake. Cheap census (canonical + record files):
count non-ASCII codepoints; the mangling signatures U+E2 (â), U+20AC (€), U+C3 (Ã) must be absent.
The canonical md5 legitimately changes on every diet — never use md5 as the diet proof.

## 6. Delivery playbook — ONE patch

6.1 Build in a clone. BASE=$(git rev-parse HEAD) must equal origin HEAD. All edits + regens + proofs
there, §4 order. Include generated files (STATE.md, nav block, CODEMAP if moved). Canonical edits
carry a dated entry (§8). `git add -A && git diff --cached --binary > <name>.patch`.
6.2 Prove on a FRESH clone: apply --check, apply --index, verify --quick, compare --stat and every
changed file's md5 against the working clone. Canonical edit: also strip-hash, census, battery (or
say plainly it was not run and give the command).
6.3 Patch stays LF, saved OUTSIDE the repo. apply --check failure changes nothing — paste the
message, don't retry blindly.
6.4 Owner commands (VS Code + Git Bash on Windows; ~/Desktop worked):
    git status                                   # clean
    git pull && git log -1 --format='%h %s'      # must start with BASE
    git apply --check ~/Desktop/<name>.patch
    git apply --index ~/Desktop/<name>.patch
    node tools/verify.mjs --quick
    git commit -m "<repo-style message>"
    git push
Red after apply: `git reset --hard HEAD`, paste output.
6.5 Patch vs installer: apply --check is atomic (BASE is the pre-condition); per-file `md5sum -c`
is the real gate (§6.7); run code gates in the clone BEFORE shipping; census patched files.
6.6 One-shot tool inside the patch (used by 3c) when a change cannot be a chat-sized patch:
md5-gate every read BEFORE writing; content anchors, never line numbers; validate in memory, write
once; prove the round trip; reject CRLF; write -> dated entry -> unlinkSync(self) -> THEN regenerate;
idempotent; print the numbers.
6.7 CHAT DELIVERY — mandatory. The owner copies patches out of chat into a file; no download channel.
- Never publish a patch-file md5 you did not measure on the exact bytes you handed over. Lost tool
  output + reconstructed text = UNVERIFIED; say so.
- Gate on per-file md5s (`md5sum -c` expectations for every changed file), not the patch hash.
- Never hand-write hunk context from memory — re-read the file. Invented trailing context caused
  `patch does not apply`; a lone-space blank line at EOF caused `corrupt patch at line N`.
- End the patch with a NON-BLANK line; a new-file-only diff is the safest form (no context at all).
- The owner's terminal COLLAPSES NEWLINES on paste: single-line commands only
  (`printf '%s\n' "a" "b" > file`), or have them create files in VS Code and run by path.
- Bare `!` in pasted commands triggers bash history expansion (`event not found`) — avoid, or `set +H`.
- Prefer pure ASCII with \u escapes for scripts the owner pastes.
- If a patch fails twice, ship a small gated ASCII script that md5-gates input AND output.
6.8 NEW-FILE-ONLY ONE-SHOT (used by #749): the patch holds ONE new file — a gated, self-deleting tools/doc/land-NNN.mjs — so there is
no hunk context to get wrong. It md5-gates every input, edits by ASCII content anchor, proves the edits in memory, writes, unlinks
itself, regenerates, then md5-checks every output. Owner flow: awk-extract (or git apply) the script, check its md5, run it,
git add -A, verify --quick, commit, push. It is idempotent (prints "already landed") and refuses on any input md5 or CRLF.

## 7. What remains

Batch 3 CLOSED. Optional items — propose first, wait for "go", ONE patch:
- Index titles: DONE in #749 (navgen rowTitle(); the 54 numbered rows now carry the heading text).
- The 14,343-byte line: DONE in #749 (26 soft-wrapped lines ≤ 560 bytes; the frozen era file edit was flagged).
- AGENTS grep hint: DONE in 3c.
- Law-table follow-ups (owner's call): runnable assertions for B1/B2/U1 and the 7 owner-run-only
  laws; touches .qa/ probes; needs a proposal.
- Handoff follow-ups (AGENTS/README docs/handoff pointers, #749 entry): DONE in #749.
Batch 4 — tool layout: one home tools/ with proof/, doc/, measure/, lib/; rename .qa visibly;
tools/manifest.json read by verify + run-battery; propose an owner-go flag for measure.mjs; move
SPEC/CONTRACT/BUILD to docs/planned/; RECIPES "Traps" -> short rules; AGENTS = the one workflow home.
tools/lib/docset.mjs is a dependency of four tools and resolves paths from the repo root — keep that
contract. Leave record content alone.

## 8. Gotchas & known bugs

- STATE.md, CODEMAP and the GAMES nav block are GENERATED — edit generators, never output.
- Canonical-md5 slot = UNION check over GAMES + docs/history/*.md (>= 1 carrier). GAMES carries it
  once (#748), the chronicle twice (#745/#746). A canonical edit MUST carry a dated entry in the
  LIVE file — a build requirement.
- 3c lint checks: every docs/history/*.md must be named in GAMES; every docs/history path GAMES
  names must exist. lintRefs only scans §Current state — the nav block needed its own check.
  Renaming an era file without regenerating navgen fails the build (C6). An extra file in
  docs/history/ fails too (C5) — that is why handoff files live in docs/handoff/, NOT docs/history/.
- Era files are archive-exempt for live-ref/retired-rule/trait lint; covered by preface + token-cost
  guards. docs/handoff/ is outside every lint glob (verify stays green with these two files present).
- lint-docs §Current state slice = games.slice(0, indexOf('## Measured facts')) — keep the stub heading.
- docreflow --check EXITS 1 on pending work in any file (v7's "always exits 0" is fixed). verify
  judges by EXIT CODE only; it never parsed docreflow's text.
- navgen/docreflow treat dated `###` lines as entry headings (B3A:). docreflow never reflows lines
  starting with `#`. Its heading count includes the 9 dated ### in GAMES §Current state.
- Baked data blocks are R4-protected: LEN_CIRCLES (BEGIN/END), CIRCLES_V2, POOL/EMBER, HALO/SHOT ART.
  Re-bake, never hand-edit. Harnesses extract the sim by text position, not banners.
- Don't "restore" retired rules in LAWS. Don't "fix" gen-codemap preferring markers over banners.
- Tags on origin: games-presplit-3c -> f756e21 (pre-split monolith), canonical-prediet-2c (the fixed
  2c base — compare, don't retag), canonical-precomments, docs-precleanup{,2,3}, item3-closed,
  pre-phase-a, scratch-precleanup.
- Dated chronicle entry per landing is convention (last #748; next #749); REQUIRED only when the
  canonical md5 moves. Append to GAMES, then regenerate; docreflow may re-wrap it (whitespace-only).
- Law table: renaming a quoted assert fails lint until the anchor is updated (by design). New law =
  new row; ids C1-C6, S1-S6 required, unique; status in {probed, partial, owner-run only, unprobed};
  six cells; consistency rules; anchors without backtick or |. Retire = remove row + LAWS "Retired
  rules" + dated entry.
- Trait count: bump `N of 22 weapon traits landed` in LAWS AND the CURRENT BUILD paragraph in GAMES
  §Current state; lint checks both.
- New lint check => negative controls (one mutation per control + a passing control). 3c ran 9 + C9.
- Stale-but-historical: chronicle says lengrow-bake --verify exits 2 (true then, now 0) — leave it.
- mf-2's old 14 KB line is 26 soft-wrapped lines since #749 (bold spans cross newlines on purpose); NOTHING GUARDS THIS: re-joining two of the lines leaves verify --quick green (docreflow reports no safe break point and exits 0; measured in a control). Do not re-join.
- Cosmetic: .qa/fingerprint.mjs (~line 33) mentions many dated checkpoints; one live baseline. Harmless.
- Sandbox: the execution tool can vanish for whole turns; /tmp gets wiped between calls — re-bootstrap
  and WRITE RECEIPTS INTO YOUR REPLY IMMEDIATELY. Dropped tool output (`execute error`) = UNVERIFIED.
  pkill patterns can match your own command line — use [h]ttps-style brackets. Long runs: setsid + poll.

## 9. Report format + keeping the handoff alive

Per patch: what changed, before/after token costs, exact verification commands WITH results, anything
NOT verified, the patch + §6.4 commands + BASE hash, next proposed step. Wait for "go". Flag
deviations in the same message. Quote only measured numbers.
HOSTING RULE (v9): docs/handoff/HANDOFF.md and docs/handoff/BATCH3-STATUS.md are part of the repo.
Every landing patch UPDATES BOTH FILES in the same commit (state, hashes, ledgers, next action).
There is no attachment step anymore — do not ask the owner to swap chat files. After the owner
confirms a push, re-measure origin in a fresh clone and deliver the updated handoff files as part of
the NEXT patch (or as a docs-only patch if nothing else is pending).
New-chat prompt (the whole thing):
    Clone https://github.com/henty2343/arena-engine.git and read docs/handoff/HANDOFF.md and
    docs/handoff/BATCH3-STATUS.md fully. Run the freshness check at the top of HANDOFF.md. The repo
    outranks any attached or pasted notes. Then propose the next item from HANDOFF §7 and wait for
    my explicit "go". Hard rules: never run measure.mjs; one patch per delivery, pasted in chat,
    gated per HANDOFF §6.7; pushes are mine (VS Code + Git Bash on Windows).

## 10. Where we are / next action

Landed through the #749 patch (index titles, mf-2 line re-paragraphed, AGENTS/README handoff pointers, #749 entry) on top of
24ce531 (Batch 3c + the handoff-hosting commit). This file cannot name the #749 commit hash: verify origin HEAD; anything beyond
24ce531 + one commit means more landed — re-baseline from STATE.md and say what moved.
First: run the FRESHNESS CHECK, then §2. If the invariant hashes differ, STOP and tell the owner.
Then propose the next item from §7 — Batch 4 (tool layout) or the law-table follow-ups — and WAIT for "go".
After "go": the whole job in one pass (edits, regen, proofs, controls, fresh-clone proof), delivered per §6 + §6.7/§6.8,
with both handoff files updated in the same patch.
