# Phase B — agent front door + generated state + machine-readable verification (archived record)

Contains: the landing record for audit Phase B (Batch 2). Read when: you need the history of this change.
Approx token cost: ~0.5k. This is an archive note; it is NOT a current instruction.

Landed 2026-11-12 on top of Phase A (f6dd11b). Docs + tooling only; the canonical was NOT touched
(md5 99bb910d74d7390a435ce3354fb9320f, 5,392 lines, links-r87).

Added: AGENTS.md (agent entry point); tools/gen-state.mjs + generated STATE.md (mutable facts generated,
never hand-pinned); tools/lint-docs.mjs (doc consistency gate, JSON verdict); tools/verify.mjs (one-command
health judge, --quick / --battery); scripts/run-battery.mjs upgraded to JUDGE vs an expected-exit table + JSON.
Changed: README de-padded (~27 KB) + entry pointer to AGENTS.md; SPEC repo tree + repo-organization laws 6-10.

Note: the GAMES.md dated-entry record for this batch was deferred (it would require a navgen pass); this archive
note is the landing record instead. The run-battery EXPECTED exit-code table is the passing state on links-r87;
run the battery once to confirm/calibrate it on your machine.

Next: Phase C (LAWS.md + RECIPES.md distillation, grep-first archive split, README slim) toward ~12k onboarding.
