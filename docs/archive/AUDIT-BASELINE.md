# AUDIT BASELINE — pre-restructure snapshot

Contains: the measured repository state at the audit commit, before any restructuring.
Read when: comparing before/after metrics, or checking that a step did not regress the baseline.
Approx token cost: ~1.3k (chars/4 estimate).

## Identity
- Branch: main
- HEAD commit: 22aa041d3cc4aa51d092670c3682e5f15cf6e03d
- HEAD subject: docs: merge HANDOFF laws into SPEC repo section; delete HANDOFF.md
- Working tree: clean
- Tracked files: 50

## Canonical (previews/spinclash-preview.html)
- md5: 99bb910d74d7390a435ce3354fb9320f
- lines: 5392
- bytes: 498275
- build stamp (<title>): links-r87

## Verification status (Node v20.18.1, run during audit)
- fingerprint.mjs: 8/8 vs .qa/fp-flailfix-r88.json ; 0/8 vs .qa/fp-multgrow-r42.json (README's named baseline = STALE)
- navgen.mjs --check: exit 1 (navigation block STALE)
- docreflow.mjs --check: exit 0 (idempotent; some long lines have no safe break point)
- Full proof battery: NOT re-run in the audit sandbox (time limits). Counts reported in GAMES #729: build-proof 57/0, seam-proof 47/55 + 8 retired, pair-proof 37/37.

## Documentation sizes (token estimate = chars/4, approximate)
| file | chars | approx tokens |
|---|---:|---:|
| README.md | 80748 | 20187 |
| docs/GAMES.md | 619667 | 154916 |
| docs/SPEC.md | 49165 | 12291 |
| docs/CONTRACT.md | 16384 | 4096 |
| docs/BUILD.md | 17875 | 4468 |
| previews/spinclash-preview.html | 495311 | 123827 |
| README+GAMES+SPEC+CONTRACT+BUILD | 783839 | 195958 |

## Structural metrics at baseline
- GAMES.md: 626495 bytes, 1163 lines; 44 lines >2000 chars; longest line 14154 chars (L1005); 561 lines >300 chars.
- Canonical comments: 187868 chars (~47k tokens); 38.7% of lines; SIM block 44.4% comment lines.
- TRAIT/SKILL REGISTRY (L519-904): 386 lines, 35875 chars (~9k tokens).
- README working-set table (L123-135): 36282 chars (~9k tokens).
- Duplicated sim loaders: 13 tools; scratch/loader-r54.mjs imported by nothing.
- Empty .gitkeep placeholder dirs: 8.
- GAMES markers: AMENDED 5, SUPERSEDED 6, RETIRED 30, REVERTED 28 (+14 lowercase), PARKED 11, PROVISIONAL 33.
- Entries: 88 measured-facts + 13 dated = 101.

## Verified defects present at baseline (see audit register)
- D1 standing fingerprint baseline contradicted across README / GAMES Testing recipe / GAMES #722; actual match = fp-flailfix-r88.json.
- D2 retired projectile-spine law stated as current (GAMES L217, L198, L337); code retired it at allcut-r62.
- D3 GAMES "YOU ARE HERE" (L1005) md5 afc30118... is stale; actual 99bb910d...
- D4 trait count contradicted: 14/22 vs 9/22.
- D5 dead live refs: docs/HANDOFF.md (deleted), scratch/boomvars/seam-proof-freeloop-r38.mjs (absent).
- D6 "read all five" lists four docs. D7 three conflicting read-first instructions.
- D8 nav block stale (navgen --check exit 1). D9 SPEC repo tree stale. D10 run-battery undocumented in README/SPEC/BUILD.
- D11 CONTRACT/SPEC describe planned engine with no status banner. D12 stale fingerprint.mjs header.
- D13 stray tracked scratch/.fp-r87-fixtest.json (duplicate of fp-flailfix-r88.json). D14 long lines. D15 BUILD "this folder".

## Reproduce the key checks
    node .qa/fingerprint.mjs /tmp/fp-current.json   # then diff vs .qa/fp-flailfix-r88.json (8/8) and .qa/fp-multgrow-r42.json (0/8)
    node scratch/navgen.mjs --check                  # exit 1 at baseline
    node scratch/docreflow.mjs --check               # exit 0 at baseline
    md5sum previews/spinclash-preview.html           # 99bb910d74d7390a435ce3354fb9320f
