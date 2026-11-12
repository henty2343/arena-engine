# Phase C (part 1) — LAWS.md + RECIPES.md + README slim (archived record)

Contains: the landing record for audit Phase C part 1. Read when: you need the history of this change.
Approx token cost: ~0.4k. Archive note, NOT a current instruction.

Landed 2026-11-12 on top of Phase B. Docs + tooling only; canonical UNTOUCHED
(md5 99bb910d74d7390a435ce3354fb9320f, 5,392 lines, links-r87). GAMES.md was NOT edited this batch
(so its nav stays current); the GAMES current-state -> pointer migration and the dated-entry archive
split are the next sub-batch.

Added: docs/LAWS.md (distilled current-laws quick reference, ~2.2k tok; must agree with GAMES §Current state,
lint-checked) and docs/RECIPES.md (add-trait / add-bot / stamp-discipline recipes moved out of README, ~1.9k tok).
Changed: README slimmed (recipes moved out, ~6.8 KB); AGENTS.md loading tiers + task map now point to LAWS/RECIPES;
SPEC repo tree + law 6; tools/lint-docs.mjs now lints LAWS.md (retired rules, trait count) + RECIPES.md refs;
tools/gen-state.mjs + STATE.md doc-cost table include LAWS/RECIPES.

Onboarding (AGENTS + STATE + LAWS) now ~4k tokens; a trait landing adds RECIPES (~2k) -> ~6k, vs ~195k before.
Next: Phase C part 2 (GAMES current-state -> LAWS pointers, dated-entry grep-first archive split, stable #NNN anchors).
