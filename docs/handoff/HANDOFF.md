# HANDOFF — router for the process docs

Contains: where the process rules live, and the freshness check.
Read when: orienting, or looking for a process rule. Token cost: see STATE.md.

LOCATION: docs/handoff/ is REPO-HOSTED. Chat attachments of older handoffs (v7-v11) are OBSOLETE; the repo outranks every pasted note and every prose document, this one included. STATE.md and docs/CODEMAP.md are generated and authoritative for all numbers.

FRESHNESS CHECK (run first, every session):
    node tools/verify.mjs --orient    # freshness + verify --quick + strip-hash; expect ORIENT PASS
Freshness = `git fetch origin && git rev-parse --short origin/main` must equal `git rev-parse --short HEAD` — your tree is what is on the remote. Offline, --orient says so. If they differ, your tree is not what is on the remote: push it, or pull what landed.

## Which file

| Need | File |
|---|---|
| Rules, orientation, proof sequence, delivery routes, gotchas, report format | RUNBOOK.md (read s1 and s6 before delivering) |
| What is next | the open queue in `docs/GAMES.md` §Open design questions |
| What the current rules are | `docs/LAWS.md` (sole authority) |

The repo holds NO landing history: no ledger, no dated entries, no archive. Git is the history. "Where we are" is the CURRENT state — `docs/GAMES.md` §Current state and `docs/LAWS.md` — not a record of how it got there.

Old pointers: "HANDOFF s0-s6, s8, s9" mean RUNBOOK.md with the same section number. Older history = git (recovery point: tag `handoff-pre808`).
