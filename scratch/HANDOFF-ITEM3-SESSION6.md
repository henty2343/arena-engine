# HANDOFF — Item-3 stale-proof triage, SESSION 6 (2026-11-11) — THE CLOSE-OUT (Item 3 IS CLOSED)

Read in order: scratch/HANDOFF-ITEM3-SESSION5.md (authoritative prior state, with the dated
post-stop correction at its GIT STATE block) → scratch/HANDOFF-ITEM3-SESSION4.md (prior state +
the session-3 corrections, the 9/9 rule) → scratch/HANDOFF-ITEM3-SESSION2.md (the original
diagnosis + the measured facts). Supporting: scratch/stale-triage-menu.md,
scratch/handoff-repair-brief.md, docs/GAMES.md (#723–#727 are this menu's record).

## WHERE SESSION 6 ENDED (honest status — a COMPLETED run, unlike sessions 2–5)

Item 3 is **CLOSED**. Every menu item is either done-and-proven or was closed with a dated,
recorded decision. The canonical was never touched: **md5 `e431d344347a55da51e1f4604cbeb4ed`,
5,392 lines — verified before and after EVERY run in this session.**

### DONE + COMMITTED (branch `spinclash-item-three-triage-80aa6`)

- **MENU ITEM 4 — lengrow-build-proof's re-seed, PROVEN FALSIFIABLE (6/6).**
  `scratch/triage/diag-nonvacuity-lengrow.mjs` extracts the shipped cell's SOURCE VERBATIM and
  evaluates it against mutated runtime objects (the shipped cell cannot drift from the proof):
  B4 control green · B1 a rigid grower without its ladder row → clean FAIL · B2a a chain grower
  with `chain.ext = undefined` → clean FAIL · B2b `ext.every = 0` → clean FAIL · B2c `ext.max`
  under-covering the steps → clean FAIL · B3 a chain grower wrongly given a ladder → clean FAIL.
  **LG2 (asserted patch) hardened the cell's DETAIL string**, which dereferenced `chain.ext.every`
  UNGUARDED: the very case the cell exists to catch (a chain grower with NO ext) CRASHED the
  proof instead of reporting red — and a dead cell ABORTS the run, silencing every assertion
  after it (the seam-proof G4 lesson, verbatim). It now reports `ext MISSING` and the catch
  reports RED. Suite: **57 passed, 0 failed**.
- **MENU ITEM 5 — flipproof's SEEDS and T4, both re-seeded.**
  - Seeds: **FLAG → s1**, **CTRL → s7** (the measured naturals). The old pair had both rotted:
    s2 puts a flagged weapon on BOTH sides (the javelin's `headLead`), s4 rolls the STAFF so the
    control battle was not a control. The argv override stays, the `rollsFlagged` tripwire stays
    a hard assert, and a pinned seed that stops holding now **fails loudly**. Re-pick:
    `node scratch/triage/diag-flip-seeds.mjs`.
  - T4: the FRAME-COUNT budget became the flip clock's own LEDGER, per sweep — A1 ARM (armed at
    exactly `CFG.flipMs`), A2 LAND (lands on exactly 0), A3 SPEND (raw spend covers the budget and
    no more), A4 TAIL (the `Math.max(0,…)` clamp's masked tail is bounded), A5 RESET (arms ===
    sweeps), A6 RATE (full-rate frames ≤ 13/sweep). The RAW spend comes from two independent
    channels — the clock's own decrease and the sim tick counter `G.t`. **Measured over 14 sweeps:**
    the ARM law exact (180.000), the clock lands on 0 every time, raw spend 183.7–188.1ms against
    the 180ms budget, worst full-rate frame count 10 (budget 13).
  - Non-vacuity **12/12**, with the couplings MEASURED rather than hidden (TAIL is strictly
    stronger than SPEND; RATE is implied by SPEND).
- **MENU ITEM 6 — leadproof's swat cell now audits BOTH classes.** The stored gap discriminates:
  the physical path stores a strictly negative gap (circle recompute, unchanged); the cut-free
  window stores exactly 0 (the ANGLE law). Nothing becomes unauditable. `SKEWER` joined the
  harness's extracted surface — it was MISSING, so the cell could not read its own law constant.
  Non-vacuity **6/6**, including a SOURCE check on the canonical's two `killShot('swat')` paths.
- **CLOSE-OUT (item 7) — COMPLETE.** The full battery on the final bytes, the README's stale
  tallies corrected to the live numbers, and GAMES.md entries **#723–#727** (one per session, the
  corrections dated with the superseded claims left visible — session 3's false **10/10** stands
  visible in #724, superseded by the honest **9/9** in #725).

### THE CLOSE-OUT BATTERY (final bytes, canonical never touched)

| probe | verdict |
|---|---|
| `.qa/seam-proof.mjs` | **47/55 passed, 8 retired, 0 failed** |
| `.qa/lengrow-build-proof.mjs` | **57 passed, 0 failed** |
| `.qa/pair-proof.mjs` | **37/37** |
| `.qa/flipproof.mjs` | **ALL PASS** (14 sweeps, arms === sweeps) |
| `.qa/leadproof.mjs` | **ALL PASS** (hits 442 / parries 311 / swats 154 — touch 139, cut-window 15) |
| `.qa/inscribe.mjs` | **GATE: PASS** |
| `chromecheck.mjs` | **2× PASS** (chrome + pairing) |
| `.qa/lengrow-gate.mjs` | **exit 1 BY DESIGN** — the uniform runtime stretch first breaks the inscribed gate at **k = 1.0778 (+7.8 %)**, i.e. the pre-baked ladder IS required: the tool proves the ceiling of the remap route (the recorded design point, not a failing build) |
| `.qa/lengrow-bake.mjs --verify` | **exit 2, writes nothing** — the guard: *"expected exactly one growing weapon (spear), found [spear, flail] — this tool bakes the spear only; extend it deliberately if that changes"*. **Pre-existing since `links-r87`** (the flail's `trait.len` link-adder — the very fact Item 4's re-seed encodes) and the canonical is byte-identical to the pre-session commit, so nothing here caused it. **THE NEXT OPEN ITEM: the baker must learn the chain case, deliberately.** |

Logs: `scratch/triage/runs-closeout/*.log`, `scratch/triage/runs-after/*-session6.log`.
**The md5 after EVERY one of the ten runs is `e431d344347a55da51e1f4604cbeb4ed` / 5,392 lines.**
**`measure.mjs` did NOT run** — standing owner rule, it never runs without the owner's explicit go.
The fingerprint suite was not re-based: the canonical is byte-identical, so no fingerprint moved
by construction.

## GIT STATE AT HANDOFF

- **Branch: `spinclash-item-three-triage-80aa6`** — the owner's continuation branch, pushed at
  `556e34c`; this session's commits sit on top of it. **It has a remote here**
  (`origin` → `https://github.com/henty2343/arena-engine.git`), so the session-5 "no remote, cannot
  push" verdict no longer holds.
- **THE 64f2ef7 NOTE (the one divergence to know about).** The owner's LOCAL tip `64f2ef7` — which
  adds only the handoff-name correction — is **not reachable from the remote** (it is on no ref and
  could not be fetched by SHA). Session 6 therefore fast-forwarded from `556e34c` and applied the
  SAME content correction as its own commit (`1ff647d`), with the superseded session-5 text kept
  visible in the file. **The two carry the same tree change under different SHAs: if the owner
  pushes `64f2ef7` later, keep whichever commit — DO NOT force-push.**
- `other-agent-branch` was ABSENT again in the session-6 snapshot (the remote has four branches:
  `main`, `item-3--stale-proof-triage-46812`, `item-three-stale-proof-triage-237df`,
  `spinclash-item-three-triage-80aa6`). If it appears: `git merge --no-commit --no-ff
  other-agent-branch`, resolve the `.mjs` seams semantically keeping BOTH sides' intent, then
  re-run inscribe GATE: PASS + chromecheck 2× PASS + the md5 check.
- `scratch/` is gitignored but force-tracked by convention: `git add -f` for new scratch files.
- PR **#3** (`https://github.com/henty2343/arena-engine/pull/3`) is OPEN and targets
  `item-three-stale-proof-triage-237df` (NOT `main`) — correct for this menu's lineage, but worth
  the owner's eye before it is merged anywhere else. It also still carries the two `.orig` backup
  copies (`scratch/triage/lengrow-build-proof.mjs.orig`, `scratch/triage/pair-proof.mjs.orig`) —
  house convention keeps them, but they are noise in a diff.

## NON-NEGOTIABLES (unchanged — restated for continuity)

Asserted-patch method only (exact-match + expected count, loud on mismatch, write nothing on
mismatch); every re-seeded cell proven falsifiable by an injected break — prefer SCALAR post-boot
breaks over boot-guard-tripping breaks unless the guard IS the coverage (session-3's G6 trap
caused the false 10/10); never hand-edit baked rows (the row-splice baker only); history is never
rewritten (dated corrections, superseded claims stay visible, each turn = a new GAMES entry);
pushes are the owner's job; **NEVER run `measure.mjs` without explicit owner go**; grep/sed the
big docs; checkpoint early and often; the canonical md5 must remain
`e431d344347a55da51e1f4604cbeb4ed` / 5,392 lines.
