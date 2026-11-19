# HANDOFF — router for the process docs

Contains: where the process rules, delivery routes and landing history live, and the freshness check.
Read when: orienting, or looking for a process rule. Token cost: see STATE.md.

LOCATION: docs/handoff/ is REPO-HOSTED. Chat attachments of older handoffs (v7-v11) are OBSOLETE; the repo outranks every pasted note and every prose document, this one included. STATE.md and docs/CODEMAP.md are generated and authoritative for all numbers. Never put handoff files in docs/history/ (the frozen record, globbed by the doc tools; an extra file there fails lint, control C5).

FRESHNESS CHECK (run first, every session):
    git fetch origin && git rev-parse --short origin/main      # origin HEAD (short)
    git log -1 --format='%h' -- docs/handoff/BATCH3-STATUS.md  # the landing that last wrote the ledger
    node tools/verify.mjs --quick                              # expect VERIFY PASS
    node .qa/strip-hash.mjs --base canonical-prediet-2c        # expect PASS + the three hashes (RUNBOOK s5)
The first two hashes MUST MATCH: every landing adds a ledger entry in the same commit, so the commit that last touched BATCH3-STATUS.md IS origin HEAD. If they differ, something else landed: re-baseline from STATE.md and say what moved. If you have no network, say so and compare against local HEAD instead.

## Which file

| Need | File |
|---|---|
| Rules, orientation, proof sequence, delivery routes, gotchas, report format, landing record | RUNBOOK.md (read s1 and s6 before delivering) |
| What landed last, or one landing's receipts | BATCH3-STATUS.md, newest first (`grep -m1 '^## #'`); grep only |
| Next planned work (temporary) | ROADMAP.md; evidence in AUDIT-REPORT.md, grep only |
| Old history: dated ledger, s7 What remains, s10, State-after blocks, pre-#805 s9 | LEDGER.md; frozen, grep only |

Old pointers: "HANDOFF s0-s6, s8, s9" mean RUNBOOK.md with the same section number; "HANDOFF s7" and "s10" mean LEDGER.md.
