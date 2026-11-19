# RUNBOOK — process rules for AI sessions

Contains: ground rules, getting live state, orientation, proof sequence, comment-only proof kit, delivery routes, gotchas, report format and landing record. Section numbers are kept from the old HANDOFF (s0-s6, s8, s9).
Read when: before the first delivery of a session (s1 and s6) or when a rule here is needed; grep the "## " headings, do not read whole. Token cost: see STATE.md.

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
- NEVER run measure.mjs. Read-only grep is permitted; execution is not. Since #780 it also exits 2 unless the owner passes --owner-go (or sets ARENA_OWNER_GO=1); an agent never passes either. EXCEPTION (owner, 2026-11-14): the owner may give an
  explicit go for ONE run; it covers that run only and never carries over (one --solidity run was authorised that way, s7).
- DO NOT SPLIT THE CANONICAL previews/spinclash-preview.html (rule 5). Owner-only decision.
- Removals are TAGGED first (`git tag <name> HEAD`). Never force-push. Pushes are the owner's.
- Terminology: a fighter has a SKILL, a weapon has a TRAIT. Never the bare nouns.
- No balancing talk, no win-rate tables.
- Don't rewrite or drop record content (owner quotes, provenance). Reflow, re-heading and MOVING
  are fine; deleting is not. Stale-but-historical entries stay. Covers docs/history/ too.
- Deliver ONE artifact (§6): Route A a patch file, Route B a Node one-shot. Commit style: `docs: Phase I Batch N — <what>` / `tools: <what>`.
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

    node tools/verify.mjs --quick      # VERIFY PASS
    node tools/verify.mjs --battery    # ~15 min; once per canonical-touching patch

Since #778 verify's checks come from tools/manifest.json (the entries with a `tier`): the `manifest` row first (the registry's
completeness check, fail-closed), then the quick tier in manifest order: gen-state, lint-docs, navgen, docreflow, gen-codemap,
lint-markers; the default run adds the standard tier (fingerprint); --battery adds run-battery. The check count is not stated here - read the verify output. Adding a check =
one manifest line with a tier.
After any canonical edit: `node .qa/strip-hash.mjs --base canonical-prediet-2c` + `verify --battery`.
Battery expected exits (the STEP LIST now lives in tools/manifest.json — the probe registry; read it to
see what proves what): inscribe 0 · lengrow-build-proof 0 · pair-proof 0 · flipproof 0 · leadproof 0 ·
seam-proof 0 · law-proof 0 · contact-proof 0 · shot-proof 0 · frame-proof 0 · stride-proof 0 · lenstep-proof 0 · bloom-proof 0 · verdict-proof 0 · chromecheck 0 ·
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

## 6. Delivery — one artifact, two routes

One artifact per landing. The ledger entry (BATCH3-STATUS.md) lands in the same commit. The gate is the PER-FILE
md5s. Pushes are the owner's. Build in a clone whose HEAD equals origin HEAD; include generated
files (STATE.md, the nav block, CODEMAP if it moved); a canonical edit carries a dated entry (§8).
Never publish an md5 you did not measure on the exact bytes you handed over; lost tool output is
UNVERIFIED and must be said. NO EXECUTION means NO DELIVERY: report and wait.

ROUTE A — file-capable agents. One patch file: git diff --binary --cached, LF only, saved outside
the repo, presented as a downloadable file. Prove it on an INDEPENDENT fresh clone of origin:
git apply --check, git apply --index, node tools/verify.mjs --quick (expect VERIFY PASS).
Give the per-file md5s and these commands in the SAME message:
    git fetch origin && git rev-parse --short origin/main   # expect the BASE hash
    git apply --check <patch> && git apply --index <patch>
    node tools/verify.mjs --quick                           # expect VERIFY PASS
    md5sum <each changed file>                              # expect the per-file md5s
    git commit -m "<message>" && git push
An apply --check failure changes nothing: paste the message, do not retry blindly. Red after
apply: git reset --hard HEAD, paste the output.

ROUTE B — Qwen (no working file channel). One md5-gated NODE one-shot, pasted as plain text.
The owner saves it in VS Code as `scratch/land.mjs` (gitignored — fixed name every landing) and
runs it from the repo root. Node only — the owner has no Python. The script must: edit by content
anchor, never by line number; assert every anchor occurs exactly once and throw BEFORE writing
anything; normalise CRLF; SELF-LOCATE the repo root from its own URL (the `scratch/t-lib.mjs` pattern:
`join(dirname(fileURLToPath(import.meta.url)), '..')`) so it runs equally from the repo root
and from inside scratch/; print every changed file's md5; print the ready-to-paste `git add
<paths> && git commit -m "<message>"` line; exit non-zero on any mismatch. Prove it on a
pristine checkout before handing it over. Give the per-file md5s and these commands in the SAME
message:
    node scratch/land.mjs                                   # expect the md5 gate to PASS
    node tools/gen-state.mjs                                # only if a generated file must move
    node tools/verify.mjs --quick                           # expect VERIFY PASS
    md5sum <each changed file>                              # expect the per-file md5s
    git push && rm scratch/land.mjs                         # the && keeps the artifact if the push fails

The cleanup line deletes `scratch/land.mjs` but NEVER `scratch/t-lib.mjs`, `scratch/t-run.mjs`
(the ONLY copy of the proven trial instrument, md5 3a9def67def831e663ade6a219966547) or
`scratch/out/*.json` (the seven cells behind the (b2) ruling). See s8's keep-list.

## 8. Gotchas & known bugs

- THE OWNER'S RUNTIME IS NODE, NOT PYTHON. Never hand the owner a Python script; a Node .mjs one-shot
  is the Route B artifact (§6). The artifact is pasted into VS Code, NOT the terminal.
- AN AGENT WHOSE EXECUTION TOOL VANISHES MUST NOT DELIVER. No execution means no build, no proof and
  no md5 — report and wait. Never hand-write a patch or an artifact from memory.
- SCRATCH CONVENTION (§6 Route B): the one-shot is FIXED at `scratch/land.mjs`, the script
  SELF-LOCATES the repo root from its own URL (`join(dirname(fileURLToPath(import.meta.url)), '..')`),
  and it PRINTS the ready-to-paste `git add <paths> && git commit -m "<message>"` line so the owner
  never edits a path. Cleanup is `git push && rm scratch/land.mjs` — the && keeps the artifact if
  the push fails.
- KEEP-LIST in scratch/ (never `rm -rf scratch/`): `scratch/t-lib.mjs`, `scratch/t-run.mjs`
  (the ONLY copy of the proven trial instrument, md5 3a9def67def831e663ade6a219966547; NOT in the
  repo) and `scratch/out/*.json` (the seven cells behind the (b2) ruling). Everything else in
  scratch/ is throwaway.

- THE OWNER'S RUNTIME IS NODE, NOT PYTHON. Never hand the owner a Python script; a Node .mjs one-shot
  is the Route B artifact (§6). The artifact is pasted into VS Code, NOT the terminal.
- AN AGENT WHOSE EXECUTION TOOL VANISHES MUST NOT DELIVER. No execution means no build, no proof and
  no md5 — report and wait. Never hand-write a patch or an artifact from memory.

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
- Dated chronicle entry per landing is convention (convention; #753 was the last to append one, and #754-#757 added none because the canonical did not move); REQUIRED only when the
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
- Owner-machine hygiene (#761): `git add -A` on the owner's Windows box sweeps throwaway diagnostics into the commit - #760 took diag-1s.cjs, land-760.cjs and scratch-measure.mjs that way (they sat in the repo root; the .txt reports had already moved to scratch/). Move scratch to scratch/ (gitignored) or `git add` explicit paths before committing; measure/diag reports never enter the repo.
- measure.mjs and frame-proof's C3 recompute contacts from stored poses and, since #758, pass the PRE-TICK lenStep (§7, THE lenStep FIX). Residue: a hit that adds a link (the event stores the post-grow chain pose; the hit event is built after grow()) and any event or substep after an in-tick grow are not exact; .qa/lenstep-proof.mjs reports the count. The 2026-11-15 owner re-run on the lenStep fix confirmed it (law 1 111 -> 12, law 2 117 -> 3, law 2s 116 -> 43, law 4 283 -> 66); the residue and the new defect tracker live in section 7 (THE OWNER'S RE-RUN / THE DEFECT-TRACKER RULING). The owner runs measure.mjs in cmd.exe with plain `>` redirects (never Git Bash `tee`, never PowerShell; GAMES) and captures `echo exit=%errorlevel%`; agents never run it.
- Sandbox: the execution tool can vanish for whole turns; /tmp gets wiped between calls — re-bootstrap
  and WRITE RECEIPTS INTO YOUR REPLY IMMEDIATELY. Dropped tool output (`execute error`) = UNVERIFIED.
  pkill patterns can match your own command line — use [h]ttps-style brackets. Long runs: setsid + poll.

## 9. Report format + landing record

Per patch: what changed, before/after token costs, exact verification commands WITH results, anything NOT verified, the artifact (s6) + the apply/run commands + BASE hash, next proposed step. Wait for "go". Flag deviations in the same message. Quote only measured numbers.

Landing record (since #805): every landing (1) adds ONE short "## #NNN <title> - ledger (this commit)" section at the top of docs/handoff/BATCH3-STATUS.md, newest first (What / Why / Approved / Deviations), removes "(this commit)" from the prior entry and records the prior landing's commit hash; (2) updates docs/handoff/ROADMAP.md if a phase moved; (3) regenerates STATE.md. HANDOFF.md and this file change only when a rule changes. LEDGER.md is frozen history: never append to it.
Freshness anchor: the commit that last touched BATCH3-STATUS.md must equal origin HEAD (see HANDOFF.md). "Where we are" = the newest BATCH3-STATUS.md entry plus ROADMAP.md.

Owner environment (facts, not preferences):
- The owner runs measure.mjs in cmd.exe: `node measure.mjs --owner-go --solidity > solidity-report.txt 2> solidity-progress.txt`, then `echo exit=%errorlevel%`; never Git Bash tee, never PowerShell. An agent never passes --owner-go or sets ARENA_OWNER_GO.
- Pushes are the owner's (VS Code + Git Bash on Windows). Node only: the owner has no Python. Scratch files go in scratch/ (gitignored); `git add` explicit paths only.
- Be frugal: no re-checks beyond the freshness check. Quote only numbers you measured, or that are in the owner's pasted report, or are labelled prior-agent and unverified until you re-measure. If a tool output is lost, say UNVERIFIED.

New-chat prompt (the whole thing, same every time; drop the ROADMAP sentence when ROADMAP.md is deleted):

    Repo: github.com/henty2343/arena-engine. Clone it fresh.
    Read AGENTS.md and STATE.md, then docs/handoff/ROADMAP.md while it exists. Never read big docs whole; grep them.
    Tell me: the commit you are on, what is done, and the next open phase.
    Then propose it and wait for my "go". Follow AGENTS.md: never run measure.mjs, don't touch the canonical unless asked, deliver one patch proven on a fresh clone.
