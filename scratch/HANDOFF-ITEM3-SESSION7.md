# HANDOFF — Item-3 follow-on, SESSION 7 (2026-11-11) — the lengrow-bake guard

Read first: scratch/HANDOFF-ITEM3-SESSION6.md (the close-out state), then docs/GAMES.md #728.
This file does not replace it; it records what session 7 changed and corrects one framing.

## DATED CORRECTION (2026-11-11, session 7) — superseded text stays visible elsewhere
SESSION6's handoff and NEXT-AGENT-PROMPT.md say the open item is "the baker must learn the chain
case, deliberately". MEASURED THIS SESSION: that framing was wrong. `.qa/lengrow-bake.mjs` refused
because its GROWERS guard counted the flail, but the flail is a link-adder: boot (canonical :1810)
skips chain rows, so a chain grower has NO LEN_CIRCLES row and NO ladder — nothing to bake. The guard
was too broad; no chain logic was missing.

## DONE (local commit on spinclash-item-three-triage-80aa6; NOT pushed — the owner pushes)
- `.qa/lengrow-bake.mjs` — GROWERS scoped to RIGID growers (asserted patch
  scratch/triage/patch-lengrow-bake.mjs, LB1-LB3, 3/3; pre-patch copy lengrow-bake.mjs.orig).
  Must still be exactly [spear]; a second rigid grower still refuses (exit 2). Chain growers are
  printed on a visible "skipped by design" line (or "chain.ext MISSING").
- Non-vacuity 8/8: scratch/triage/diag-nonvacuity-lengrow-bake.mjs (shipped guard extracted verbatim).
- `node .qa/lengrow-bake.mjs --verify` -> exit 0, ALL 12 STEPS PASS (poke -0.30px, worst miss 4.25px).
  The log's "duration=0s" is meaningless (sh has no SECONDS).
- lengrow-build-proof 57/0, inscribe GATE: PASS re-run on the same bytes.
- docs/GAMES.md #728 appended (asserted append scratch/triage/append-games-728.mjs); nav block
  regenerated; old content verified an exact prefix. Logs: scratch/triage/runs-session7/.
- CANONICAL UNTOUCHED: md5 e431d344347a55da51e1f4604cbeb4ed, 5,392 lines, checked before/after.

## NOT DONE / NOT CLAIMED
- measure.mjs did not run. Fingerprint not re-based (canonical byte-identical).
- seam-proof, pair-proof, flipproof, leadproof, chromecheck were NOT re-run this session.
- `--write` and `--emit` on the PATCHED baker were not exercised (a one-line probe copy was).

## OPEN (owner)
1. The shipped LEN_CIRCLES provenance comment is stale ("skill-r29 ... LEN_STEPS 18"; live is
   links-r87, 12 steps). Rows are current (byte-identical to a fresh emit). Refreshing the comment
   needs `--write`, which moves the canonical md5 (line count holds at 5,392) and the md5 re-record
   in every live slot. Cosmetic. Owner call.
2. Unchanged from SESSION6: runner exec bits, PR #3's base, the .orig backups (now three), 64f2ef7/1ff647d.
Never force-push this branch; push via merge / the App's push_files (GAMES.md travels as a patch).
