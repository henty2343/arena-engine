# HANDOFF — router for the process docs

Contains: where the process rules, delivery routes and landing history live, and the freshness check.
Read when: orienting, or looking for a process rule. Token cost: see STATE.md.

LOCATION: docs/handoff/ is REPO-HOSTED. Chat attachments of older handoffs (v7-v11) are OBSOLETE; the repo outranks every pasted note and every prose document, this one included. STATE.md and docs/CODEMAP.md are generated and authoritative for all numbers.

FRESHNESS CHECK (run first, every session):
    node tools/verify.mjs --orient    # freshness + verify --quick + strip-hash; expect ORIENT PASS
Freshness = `git fetch origin && git rev-parse --short origin/main` must equal `git log -1 --format='%h' -- docs/handoff/BATCH3-STATUS.md`
(every landing adds a ledger entry in the same commit). Offline, --orient compares local HEAD instead and says so. If they differ,
something else landed: re-baseline from STATE.md and say what moved.

## Which file

| Need | File |
|---|---|
| Rules, orientation, proof sequence, delivery routes, gotchas, report format, landing record | RUNBOOK.md (read s1 and s6 before delivering) |
| What landed last, or one landing's receipts | BATCH3-STATUS.md, newest first (`grep -m1 '^## #'`); grep only |
| Next planned work (temporary) | ROADMAP.md; evidence in AUDIT-REPORT.md, grep only |
| Old history: dated ledger, s7 What remains, s10, State-after blocks, pre-#805 s9 | LEDGER.md; frozen, grep only |

Old pointers: "HANDOFF s0-s6, s8, s9" mean RUNBOOK.md with the same section number; "HANDOFF s7" and "s10" mean LEDGER.md.
