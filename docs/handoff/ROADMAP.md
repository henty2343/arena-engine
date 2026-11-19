# ROADMAP — agent-architecture audit (TEMPORARY)

Contains: the phased plan from the 2026-11-19 audit, each phase's status, the open owner decisions.
Read when: every session while this file exists. Take the next OPEN phase, propose it, wait for the owner's "go". Token cost: see STATE.md.
Removal: after Phase 6 (delete this file, AUDIT-REPORT.md and the AGENTS.md "Audit work" row). Evidence per finding: grep `^| F0` / `^| F1` in docs/handoff/AUDIT-REPORT.md (never read whole).

## Phases (update the Status cell in the same patch that finishes a phase)

| Phase | Work (finding IDs in AUDIT-REPORT.md) | Status |
|---|---|---|
| 1 | STATE cost table lists the handoff files; gen-state fails on any doc without a read policy; delete scripts/.gitkeep; drop the hand-copied verify check count (F01, F08, F10) | DONE (#802, 213c80b) |
| 2 | Lint profile for docs/handoff/*.md: 3-line header, refs resolve (ROADMAP + HANDOFF s0-s6), AGENTS routes to ROADMAP; warnings for long lines and size. Not done: md5 check (ledgers quote old md5s; enforce after the Phase 3 split in RUNBOOK/STATUS) (F05, F07) | DONE (#804) |
| T | Trim pass: cut rationale, narrative and history from LAWS.md, RECIPES.md, AGENTS.md; keep rules, commands, numbers, file paths. Propose a before/after token count first | OPEN — owner go needed per file |
| 3 | Split HANDOFF.md into router + RUNBOOK + LEDGER; derive "where we are" from the newest ledger entry (F02, F03, F04) | DONE (#805): flat files, no archive/ subfolder: HANDOFF.md = router, RUNBOOK.md = rules + delivery routes + landing record, LEDGER.md = frozen history, BATCH3-STATUS.md stays the per-landing ledger (not frozen). No STATUS.md: "where we are" = the newest ledger entry; the freshness anchor is BATCH3-STATUS.md |
| 4 | GAMES.md size budget + freeze procedure; fingerprint baseline records canonical md5 + stamp; offline fallback for the freshness check (F06, F11, F12) | OPEN (D3, D4) |
| 5 | Optional: loader annotations in the manifest, tool-placement sentence, canonical comment census before any comment edit, empty placeholder dirs (F09, F13, F14, F16) | OPTIONAL (D2) |
| 6 | Close-out: delete ROADMAP.md, AUDIT-REPORT.md and the AGENTS.md "Audit work" row; ledger entry | after 2-5 |

## Owner decisions (open)

- D1: RESOLVED by design (#805): lint profile exists (#804), no `archive/` subfolder needed (flat files).
- D2: remove the empty planned dirs (packages/, apps/, games/, assets/fonts, .vscode) until BUILD Phase 0?
- D3: GAMES.md freeze threshold (audit suggests ~40k tokens).
- D4: format for baseline metadata (sidecar file or a `_meta` key).

## Rules for this work

- Agent-facing text keeps facts, rules, commands, paths, numbers. Cut why/how narrative, history, owner quotes and anything that does not change what an agent does.
- Doc-only patch: `docreflow -> navgen -> gen-codemap -> gen-state -> verify --quick`. Anything touching the canonical: strip-hash PASS, fingerprints 8/8, `verify --battery` once.
- Do not restructure the directory tree, split the canonical, or rename `.qa/`.
