# Phase C (part 2) — nav/doc rot auto-detection + LAWS canonical pointer (archived record)

Contains: the landing record for audit Phase C part 2. Read when: you need the history of this change.
Approx token cost: ~0.3k. Archive note, NOT a current instruction.

Landed 2026-11-12 on top of Phase C part 1. Docs + tooling only; canonical UNTOUCHED
(md5 99bb910d74d7390a435ce3354fb9320f, 5,392 lines, links-r87).

Changed:
- tools/verify.mjs now also runs `navgen --check` + `docreflow --check`, so GAMES nav / doc-reflow staleness is a
  hard verification failure (closes the audit's W9 "line-number nav rots silently" class via detection, not surgery).
- docs/GAMES.md §Current state gained a pointer establishing LAWS.md as the canonical current-laws quick reference
  (GAMES = fuller design record). Run docreflow + navgen after applying (standing rule 3).
- tools/lint-docs.mjs now fails if GAMES §Current state loses the LAWS.md pointer.

Deferred (riskier, optional follow-up): physically splitting GAMES' dated entries into per-era grep-first archive
files with stable #NNN anchors (audit R3/O6). GAMES is already grep-first via AGENTS.md; the split is an optimization.
