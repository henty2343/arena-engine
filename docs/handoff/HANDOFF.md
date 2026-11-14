# HANDOFF v11 — arena-engine: make the repo token-friendly for AI agents

LOCATION: docs/handoff/HANDOFF.md — REPO-HOSTED. This file and BATCH3-STATUS.md live in the repo and
are updated IN THE SAME COMMIT as every landing, so they are current as of HEAD by construction.
Chat attachments of older handoffs (v7, v8, v9, v10) are OBSOLETE. If any attached or pasted copy contradicts
this file, THIS FILE WINS. Never put handoff files in docs/history/ — that folder is the frozen
record, globbed by the doc tools; an extra file there fails lint (control C5).

FRESHNESS CHECK (run first, every session):
    git fetch origin && git rev-parse --short origin/main     # origin HEAD (short)
    git log -1 --format='%h' -- docs/handoff/HANDOFF.md       # the landing that last updated this file
    node tools/verify.mjs --quick                            # expect VERIFY PASS — 6 checks
    node .qa/strip-hash.mjs --base canonical-prediet-2c      # expect PASS + the three hashes (§5)
THE FIRST TWO HASHES MUST MATCH. This file is updated in the same commit as every landing, so the
commit that last updated it IS origin HEAD — that equality is the freshness invariant. If they differ,
either this file is stale or something else landed: re-baseline from STATE.md and say what moved. Never
trust this file over the repo. As of the #752 landing the origin HEAD was 361cbcb.
The REPO outranks every prose document, including this one. STATE.md and docs/CODEMAP.md are
generated and authoritative for all numbers.

Status 2026-11-14: Batch 1 DONE. Batch 2 DONE. Batch 3 (a)(b)(c)(d) ALL DONE — Batch 3 CLOSED.
  3a = 0ddd7f5 #746 · 3b = 9e017bb #742 · 3d = f756e21 #747 · 3c = 68e29f9 #748
Follow-ups: #749 = 4cc98d5 (index titles, mf-2 line re-paragraphed, AGENTS/README pointers, #749 entry), confirmed on origin.
  #750 = 4f38866 (the 3,000-byte line-cap lint B3E plus the record of the #749 hash) — confirmed on origin.
  #751 = 63bb91c (the law-table follow-up — new .qa/law-proof.mjs asserts B1/B2/U1, the three laws
  that had NO assertion anywhere; the LAWS table now has no `unprobed` row) — confirmed on origin.
  #752 = 361cbcb (the law-table COMPLETION + the probe registry — new .qa/contact-proof.mjs (C4, C5)
  and .qa/shot-proof.mjs (S1, S5, S6) assert the last five laws that had no agent-runnable proof, and
  tools/manifest.json becomes the single registry run-battery and lint-docs read) — confirmed on origin.
  #753 (this file's last update): the RENDERED-FRAME proof — new .qa/frame-proof.mjs proves C3's band
  at the tick-entry pose (C3 → `partial`) and MEASURES law 3s, which does NOT hold on the current build
  (S3 stays `owner-run only`; the owner's ruling is open). Its own commit hash is not known to this file
  (a file cannot contain its own commit) - verify origin.
Next: the S3 RULING (the owner's) or Batch 4's tool MOVES — §7.
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
State after the #750 patch (BASE 4cc98d5; re-measure, do not trust): canonical, chronicle, mf-1, mf-2, LAWS, CODEMAP, navgen, docreflow,
gen-state, docset, AGENTS, README, copilot all unchanged from the blocks above. As built by the one-shot: GAMES 61cb9bcebea89bc34dbe298b8b4d09a5 ·
lint-docs 182019c42f8a34de2582d3bcdd853678 · STATE a4eb9e2574fb78195e8fdb3848cc2f24. The two handoff files are not listed (a file cannot hold its own md5).
State after the #751 patch (BASE 4f38866, LANDED AS 63bb91c; re-measure, do not trust): canonical, CODEMAP,
chronicle, mf-1, mf-2, AGENTS, README, navgen, docreflow, gen-state, lint-docs and docset all unchanged from the
blocks above. Re-measured in a fresh clone AFTER the push and byte-identical to what was built: law-proof
e0ac0b51139165f4081e5a7ed54a8252 · GAMES 09079f3450e7fed25122c51b026f6b9b ·
LAWS a58eb28b72cf7347c66b767584ad35b8 · run-battery 4ee58ec2b1044c3b57a7c416c68c1afd ·
STATE e3484d7d7cd0c7d9c88836c1aaf472f9. On origin: verify --quick PASS (6 checks), strip-hash PASS with the
three invariants unchanged, and the probe 12/12. The two handoff files are not listed (a file cannot hold its
own md5).
State after the #752 patch (BASE c2bcf57, LANDED AS 361cbcb; re-measure, do not trust): canonical, CODEMAP,
chronicle, mf-1, mf-2, AGENTS, README, navgen, docreflow, lint-markers, docset unchanged. Re-measured in a
fresh clone AFTER the push and byte-identical to what was built. As built: contact-proof 388eeea0a06cf6dab1dff40a46fe5518 · shot-proof 96b2f0169bf73160e32555a6e448e925 ·
manifest.json 8db66e1aa0a4c3fd0c50235f20b50c4a · manifest.mjs dfa3b95c2d591d778c1e7c195548eabd ·
run-battery b2b9707d8b4c1d9a68c378e590448807 · lint-docs 19065ad69de0e96c48ce4798991fc86b ·
gen-state 15481648e3cae178c02a45d8b0edf7dc · LAWS f3f4c0be5b32c908c68f1eced6a870b1 ·
GAMES e7570b01a58072d192c33f5315742f6b · STATE 05f1fb0ec3fe1a411d98e246308e3dce. The two handoff files
are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); the proof battery
PASS — 12/12 steps matched their expected exit code (lengrow-gate 1 BY DESIGN, the other eleven 0), canonical
md5 and line count identical before and after the run.
Post-push re-measurement (fresh clone of origin at 361cbcb): all twelve shipped files are byte-identical to
what was built — the pushed commit's diff is byte-identical to the delivered patch (md5
f5e552e4e7c78b6396bbc5c29d4d4f4f); `verify --quick` PASS (6 checks); `strip-hash` PASS with the three
invariants unchanged (c2cd01ef... / e9b6f8d6... / 600097a7...); contact-proof 5/5, shot-proof 6/6, law-proof
12/12 on origin; canonical md5 5de162de... / 4716 lines; the record-set era files unchanged.
State after the #753 patch (BASE 361cbcb; re-measure, do not trust): canonical, CODEMAP, chronicle, mf-1,
mf-2, AGENTS, README, navgen, docreflow, lint-markers, docset, run-battery, lint-docs, gen-state, manifest.mjs,
contact-proof and shot-proof all unchanged from the blocks above. As built: frame-proof
6cd9a437557f740ec939918250e9ffb5 · manifest.json 166ad5d6dbad7a5b39cae99813e759af · LAWS
73f9894261435d0a7fc5ed9f81c3ef91 · GAMES 5782eab54cadf715f41df5afa71e46ff · STATE
f3c3da6a22b422c1a283dee98438b1a0. The two handoff files are not listed (a file cannot hold its own md5).
Receipts: verify --quick PASS (6 checks); frame-proof 4/4 (68,275 rendered fight-ticks over 31 cells, the band's
worst 18.041px inside the law's 20.754px envelope, 43 visible band ticks = 0.0630%, the mirror class
reproduced: 2; the law-3s counters measured and ratcheted: blade 85 / body 757 / rim 2,422 / pair 6,745);
the proof battery PASS - 13 steps, every step matched its expected exit code (lengrow-gate 1 BY DESIGN, the
other twelve 0), canonical md5 and line count identical before and after the run; 4 canonical controls each
FAIL their intended check; strip-hash PASS with the three invariant hashes unchanged.

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
No line in the record set exceeds 3,000 bytes, and since #750 lint-docs ENFORCES that cap (B3E, check-only). Do not re-join the 26 lines. Grep for the sub-paragraph; never hand-copy a line number.
Law-to-probe table (LAWS §Law-to-probe table): 25 rows; as of #753: 8 probed, 16 partial, 1 owner-run only,
0 unprobed. The ONLY owner-run row left is S3 (shots never overlap blade/body/rim/shot) - and it is RED:
.qa/frame-proof.mjs reproduces the owner's own law-3s pass and measures overlaps on the current build, so
the law does not hold here (the named classes are in GAMES, the #753 entry). B1/B2/U1 were asserted by
.qa/law-proof.mjs (#751); C4/C5 by .qa/contact-proof.mjs and S1/S5/S6 by .qa/shot-proof.mjs (#752); C3 by
.qa/frame-proof.mjs (#753, `partial`). .qa/fingerprint.mjs is a change detector on the default cast with no
spear, not a per-law assertion. Rows cite file::anchor items that lint-docs verifies; Status/Scope are
hand-written judgement. RE-COUNT the rows before quoting the tally - a carried tally was wrong once (it said
7/16/2 at the #752 landing; the table was 8/15/2).
The canonical is ~105k tokens — never read whole; enter via CODEMAP at one symbol grep. CODEMAP line
numbers are valid only at the md5 in its header. Doc costs live in STATE.md §Documentation cost;
never hand-type a token cost (lint rejects it, era files included).

## 4. Health baseline + proof sequence

    node tools/verify.mjs --quick      # VERIFY PASS — 6 checks
    node tools/verify.mjs --battery    # ~15 min; once per canonical-touching patch

Quick checks in order: gen-state, lint-docs, navgen, docreflow, gen-codemap, lint-markers.
After any canonical edit: `node .qa/strip-hash.mjs --base canonical-prediet-2c` + `verify --battery`.
Battery expected exits (the STEP LIST now lives in tools/manifest.json — the probe registry; read it to
see what proves what): inscribe 0 · lengrow-build-proof 0 · pair-proof 0 · flipproof 0 · leadproof 0 ·
seam-proof 0 · law-proof 0 · contact-proof 0 · shot-proof 0 · frame-proof 0 · chromecheck 0 ·
lengrow-gate 1 (BY DESIGN;
normalised stdout md5 a31a68c4d19d68a2988c792b481be4d5, 23 lines, 10 GATE FAIL rows) ·
lengrow-bake --verify 0.
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
- Law-table follow-ups: DONE except ONE row. #751 added .qa/law-proof.mjs (B1/B2/U1); #752 added
  .qa/contact-proof.mjs (C4, C5) and .qa/shot-proof.mjs (S1, S5, S6); #753 added .qa/frame-proof.mjs -
  the RENDERED-FRAME proof (the repo already defines a rendered frame as the tick-entry pose, the v0.8.2
  pose amendment, so the last rendered-frame law IS headlessly assertable). C3 is `partial`: the band's
  worst (18.041px measured) stays inside the envelope the law records (20.754px) and the visible band
  ticks (0.0630%) stay under the owner's 2%. **S3 is the last `owner-run only` row and it is RED**: the
  probe reproduces the owner's own law-3s pass and measures overlaps (blade 85 - body 757 - rim 2,422 -
  pair 6,745) in named classes. The probe REPORTS S3 and ratchets it; it does not assert it, so the row
  stays owner-run only. THE OWNER'S RULING IS OPEN: rewrite law 3s, narrow the sim, or accept the
  classes. NOTE the owner's own 6px band calibration no longer holds on the curated gauntlet (15.505px
  measured) - the second law channel that has drifted since the last sanctioned run (the re-proof is
  owed on the owner's machine, GAMES §Current state).
- Handoff follow-ups (AGENTS/README docs/handoff pointers, #749 entry): DONE in #749.
- Line-cap lint: DONE in #750 (lint-docs B3E; 3,000 bytes per line over GAMES + docs/history/*.md; check-only).
Batch 4 — tool layout: the REGISTRY half is DONE in #752 (tools/manifest.json is the single list of every
proof and tool; run-battery and lint-docs read it, and lint-docs checks it is complete — adding a probe
is now one JSON line instead of three hand-kept lists). Still open there: verify.mjs is not yet a reader
(it stays at 6 checks; lint-docs is the completeness gate). Also still open: one home tools/ with proof/,
doc/, measure/, lib/; the .qa rename; the measure.mjs owner-go flag; moving SPEC/CONTRACT/BUILD to
docs/planned/; RECIPES "Traps" -> short rules; AGENTS = the one workflow home.
  MEASURED BLAST RADIUS (2026-11-14, read-only counts — re-measure before quoting): renaming `.qa/` needs a path
  substitution in 43 refs in mf-1 + 23 in the chronicle + 9 in mf-2 (75 in the three FROZEN era files) + 26 in
  live GAMES.md; moving SPEC/CONTRACT/BUILD needs 10 in GAMES.md + 2 in mf-1 + 1 in LAWS.md + 5 in AGENTS/README
  + 2 each in gen-state.mjs (cost-table keys) and lint-docs.mjs (operational lists). Those are NON-whitespace
  edits to frozen historical text — a bigger doctrine collision than #749's whitespace-only era edit. The
  registry (done) removes the need to move anything for the inventory to be agent-readable.
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
- Dated chronicle entry per landing is convention (last #750; next #751); REQUIRED only when the
  canonical md5 moves. Append to GAMES, then regenerate; docreflow may re-wrap it (whitespace-only).
- Law table: renaming a quoted assert fails lint until the anchor is updated (by design). New law =
  new row; ids C1-C6, S1-S6 required, unique; status in {probed, partial, owner-run only, unprobed};
  six cells; consistency rules; anchors without backtick or |. Retire = remove row + LAWS "Retired
  rules" + dated entry.
- Trait count: bump `N of 22 weapon traits landed` in LAWS AND the CURRENT BUILD paragraph in GAMES
  §Current state; lint checks both.
- New lint check => negative controls (one mutation per control + a passing control). 3c ran 9 + C9.
- Stale-but-historical: chronicle says lengrow-bake --verify exits 2 (true then, now 0) — leave it.
- mf-2's old 14 KB line is 26 soft-wrapped lines since #749 (bold spans cross newlines on purpose). Since #750 lint-docs B3E fails any record-set line over 3,000 bytes, so a FULL re-join fails.
  The cap is per line, so a PARTIAL re-join slips through (measured in controls on a copy): 2 or 5 re-joined lines stay green (1,120 / 2,789 bytes), 6 (3,348) or 26 (14,343) fail. Do not re-join.
- Line cap (B3E): LINE_CAP = 3000 BYTES (Buffer.byteLength, so 1,501 two-byte characters fail), applied to docs/GAMES.md + docs/history/*.md via the docset glob. Check-only; never edit an era file to satisfy it except whitespace-only. Run docreflow before lint if a new GAMES entry trips it.
- Cosmetic: .qa/fingerprint.mjs (~line 33) mentions many dated checkpoints; one live baseline. Harmless.
- Sandbox: the execution tool can vanish for whole turns; /tmp gets wiped between calls — re-bootstrap
  and WRITE RECEIPTS INTO YOUR REPLY IMMEDIATELY. Dropped tool output (`execute error`) = UNVERIFIED.
  pkill patterns can match your own command line — use [h]ttps-style brackets. Long runs: setsid + poll.

## 9. Report format + keeping the handoff alive

Per patch: what changed, before/after token costs, exact verification commands WITH results, anything
NOT verified, the patch + §6.4 commands + BASE hash, next proposed step. Wait for "go". Flag
deviations in the same message. Quote only measured numbers.
HOSTING RULE (introduced in v9, still in force in v11): docs/handoff/HANDOFF.md and docs/handoff/BATCH3-STATUS.md
are part of the repo.
Every landing patch UPDATES BOTH FILES in the same commit (state, hashes, ledgers, next action).
There is no attachment step anymore — do not ask the owner to swap chat files. After the owner
confirms a push, re-measure origin in a fresh clone and deliver the updated handoff files as part of
the NEXT patch (or as a docs-only patch if nothing else is pending).
New-chat prompt (the whole thing):
    Clone https://github.com/henty2343/arena-engine.git and read docs/handoff/HANDOFF.md and
    docs/handoff/BATCH3-STATUS.md fully. Run the freshness check at the top of HANDOFF.md — origin HEAD
    and the commit that last updated docs/handoff/HANDOFF.md MUST MATCH; if they differ, something else
    landed, re-baseline from STATE.md and say what moved. The repo outranks any attached or pasted notes.
    Then propose the next item from HANDOFF §7 and wait for my explicit "go". Hard rules: never run
    measure.mjs; one patch per delivery, pasted in chat, gated per HANDOFF §6.7; pushes are mine
    (VS Code + Git Bash on Windows).

## 10. Where we are / next action

Landed through the #753 patch (the RENDERED-FRAME proof — new .qa/frame-proof.mjs proving C3's band and
measuring law 3s), on top of 361cbcb (#752, the law-table completion + the probe registry) and c2bcf57
(the handoff refresh). This file was last updated by the commit AFTER #753 — that is the patch below. The
freshness check's two hashes always match ON ORIGIN, because this file is updated in the same commit as
every landing. Verify origin HEAD against the hash that last updated this file; if they differ, more
landed — re-baseline from STATE.md and say what moved.
First: run the FRESHNESS CHECK, then §2. If the invariant hashes differ, STOP and tell the owner.
Then propose the next item from §7 — the S3 RULING (the owner may want the probe's findings turned into a
sim fix or a law rewrite; the probe reports it either way) or Batch 4's tool MOVES — and WAIT for "go".
After "go": the whole job in one pass (edits, regen, proofs, controls, fresh-clone proof), delivered per §6 + §6.7/§6.8,
with both handoff files updated in the same patch.
