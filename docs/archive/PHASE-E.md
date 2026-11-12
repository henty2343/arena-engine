# Phase E — tool consolidation (archived record)

Contains: the landing record for audit Phase E. Read when: you need the history of this change.
Approx token cost: ~0.4k. Archive note, NOT a current instruction.

Landed 2026-11-12 on top of Phase C part 2. Docs + tooling only; canonical UNTOUCHED
(md5 99bb910d74d7390a435ce3354fb9320f, 5,392 lines, links-r87).

Added:
- tools/lib/load-sim.mjs — shared sim loader (extracts <script>, unwraps IIFE, wraps in new Function with fake DOM stubs).
  For future use by proof tools; fingerprint.mjs still uses its own battle-tested extraction (md5-move deferred).
- tools/doc/navgen.mjs — moved from scratch/navgen.mjs
- tools/doc/docreflow.mjs — moved from scratch/docreflow.mjs

Removed:
- scratch/loader-r54.mjs (unused shared-loader prototype, no tool imported it)
- scratch/.fp-r87-fixtest.json (stray duplicate of fp-flailfix-r88.json, no refs)
- chromecheck-2 duplicate entry in scripts/run-battery.mjs + its EXPECTED table

Changed:
- tools/verify.mjs: navgen + docreflow paths updated to tools/doc/
- scripts/run-battery.mjs: chromecheck deduped (single entry, not double)
- README.md: doc tool paths updated (working-set table)
- docs/GAMES.md: live refs updated (L19 navgen, L1038 navgen+docreflow in Testing recipe); historical dated-entry
  refs preserved (L554, L569, L1184)
- docs/SPEC.md: repo tree updated (scratch = TEMPORARY ONLY, tools/ = LIVE); law 1 updated (.qa/ + tools/ not scratch/)
- AGENTS.md: no changes (just says "docreflow" and "navgen" without paths)

Regen: docreflow + navgen + gen-state re-run after GAMES edit (standing rule 3). STATE.md updated (tools inventory now
includes tools/doc/navgen.mjs + tools/doc/docreflow.mjs; .fp-r87-fixtest.json gone from baselines list).

Deferred (md5-move risk): migrating fingerprint.mjs to use tools/lib/load-sim.mjs (would replace 13 duplicated extraction
implementations). Deferred to a future md5-sanctioned landing.

Closes audit findings: W7 (live tools in gitignored namespace), W8 (battery chromecheck dedupe), D11 (stray .fp-r87-fixtest).
