# STALE-PROOF TRIAGE — ITEM 3 — OWNER MENU (2026-11-10)

Baseline re-established green FIRST, this session: `inscribe` **GATE: PASS**, `chromecheck` **2× PASS**
(canonical `previews/spinclash-preview.html` @ `e431d344347a55da51e1f4604cbeb4ed`, 5,392 lines, `links-r87`).
Every cell below reproduced red on THIS build; none is a new regression. **No canonical edits are proposed —
every repair below is proof-side.** Non-vacuity: each re-seed option keeps the cell MEASURING something.

## Root causes (all verified by executed probes, not by reading)

### 1. `.qa/seam-proof.mjs` — 6 FAILs + one CRASH
- **crash**: G4's replace-loader targets `const CATCH_GROW = true;` — retired at `touchorbit-r53` (the four
  constants folded into prose at canonical :1776). The throw KILLS everything after it: **sections H
  (star ricochet LAW) and I (bow RAIN laws) never run** — live-law coverage is currently silenced by a dead
  cell. Unblocking is not a menu item; it is the price of honesty. Whether H/I then PASS is being measured now.
- **B-bow cell** ("BOW is the sole rain-axis holder"): fails the NO-OTHER-ROW clause — `crossbow` declares
  `trait.mult 0.5` since `pinlaw-r44`. The rain axis has two holders now. Re-seed = assert {bow, crossbow}
  both 0.5 with authored briefs. (Header text says "MULT_STEPS 10, ceiling 6" — the live ceiling IS
  `1+0.5·10=6` at MULT_STEPS 10; the name is consistent, only the sole-holder clause is stale.)
- **C-factor cell** (ratio 2.54 vs ±0.35 of declared 2×): the tolerance is stale, not the mechanic —
  rim-clamp/round-reset drift grew after the r62+ ripples. Re-seed = re-measure and re-set the band; or
  retire the numeric band and keep the (green) monotonicity cell.
- **E-staff cell**: expects brief `'+SPD +SIZE / Hit'`; the row reads `'+SPD +SIZE +HEX / Hit'` since
  `hexfam-r68`. Pure stale string; section A already live-checks briefs. Re-seed = update the string;
  retire = drop the clause.
- **G0/G1/G3 + g6/g7/g8 (HALO family)**: the LOYAL HALO was retired whole at `touchorbit-r53` (row has no
  `orbit.elong`/`shot.turn`; the ≤400t one-orbit bound is gone — loops orbit until caught; `shot.turn`
  injections now throw the `hexfam-r68` RETIRED error instead of the halo validator's). The whole section
  tests a dead contract. Options: **retire G whole** (dated record; the WORLD ORBIT laws are currently covered
  by the fingerprint suite + the owner's eye — and the README already lists "section G rewritten for r54–r60
  laws" as a DEFERRED end-of-pass item) vs **rewrite G now** against the settled boomerang law (real work,
  ~an afternoon).
- **UNBLOCKED-RUN FACT (this session, probe `scratch/triage/seam-proof-unblocked.mjs`)**: with the G4 crash
  stubbed, the run reaches H/I. **H is fully GREEN (9/9 — the star ricochet law is live and unbroken).**
  I runs too: I1/I4–I7 green; **I2/I3 red — 104+11 off-band fires. MEASURED: max deviation 6.4e-4 rad vs the
  cell's 1e-9 tolerance** (probe `diag-bow-band.mjs`). That is float accumulation drift — the accumulator law
  itself holds; the tolerance was authored in a quieter sim and the flail chain era moved it. Re-seed =
  widen the band (documented, honest) OR re-derive the ledger exactly; this is NOT a regression.

### 2. `.qa/pair-proof.mjs` — 1 FAIL (static audit)
The audit's regex grabs `[^\]]*` — the first `]` it sees is the INNER one, so
`COLS[(G.fighters[p.o] || { idx: p.o }).idx]` (pool/coal cast-colour reads, burnfix-r84 — canonical :4732/:4774)
parses as index `(G.fighters[p.o` — no `idx` token → flagged. **FALSE POSITIVE: the code is correct**
(slot→identity via G.fighters, with an idx-fallback). Options: re-seed = balance-aware bracket parse
(re-proven to still fire against the pre-fix `pair-r31` canonical's 13 real sites) vs retire = drop the audit
(loses the only static renderer net — pair-r31's bug class walks free).

### 3. `.qa/lengrow-build-proof.mjs` — 1 FAIL
"every growing weapon has a ladder, and no other does": GROWERS = {spear, flail} (both carry `trait.len` since
r86), but by design the flail has NO ladder — chain growth adds links; boot :1810 skips chain rows and
requires `chain.ext` instead (boot-gated by construction). Stale assumption of `links-r87`, not a regression.
Re-seed = assert rigid-growers have ladders, chain-growers have `ext` (keeps the "new trait.len row forgot its
mechanism" catch); retire = drop the cell (boot already throws for chain-without-ext — but NOT for a rigid
row without a ladder… wait: it does — the LEN_LADDER build runs for every rigid `trait.len` row; the proof's
catch is the completeness pair. Retire loses the pair).

### 4. `.qa/flipproof.mjs` — T2b/T2 (seeds) + T4 (budget) — TWO separate stale assumptions
- **seeds**: `CTRL_SEED 4` rolled no flagged weapon at pool 20; it now rolls `[tome, staff]` — the STAFF
  joined `lead:-1` at the 2026-10-28 facing pass. The script's own tripwire (`rollsFlagged`) fired EXACTLY
  as designed. Options: re-seed = script scans seeds at boot, picks a flagged natural + a truly-unflagged
  control, asserts the invariants (self-proofing, immune to the next roster change — the brief's own suggestion);
  vs re-seed = hardcode one new clean pair (cheaper, re-drifts at the next pool change) vs retire T2/T2b.
- **T4 budget**: episode 2 = 17 frames > 13 with 0 hitstop-frozen — because `slowmo-r63` legitimately
  STRETCHES the flip (the flip clock advances on the slowed wall clock, canonical :5267). The budget's
  exclusion counts only frozen frames, never slowed ones. Re-seed = budget in transition time (info()
  exposes `flipT` — assert wall-frames ≤ flipMs/FRAME_MS×sweeps + 2, or count slow frames out); retire = drop
  T4 (T1 already pins land-exact-±1).

### 5. `.qa/leadproof.mjs` — 15 FAILs, ALL the same class — NOT seed drift
The repair brief guessed "drifted seeds". Wrong, and the correction matters: every failing cell is a
**javelin swat with stored `gap === 0`** — the skewer's CUT-FREE WINDOW (`skewer-r46`/`impale-r48`, canonical
:3654): the victim's blade cuts the anchored spear on an ANGLE test (`cos(wAngle)·ŵ > cutCos 0.75`), no
circle contact, no touch to recompute. Part B's law "every swat is a circle touch" predates the cut class.
VERIFIED: all 15 recompute green under the cut law from stored fields alone (probe: `scratch/triage/diag-lead-swat.mjs`;
0 true circle-contact failures anywhere in the suite). Re-seed = split by the stored field
(`gap < 0` → circle-touch recompute, `gap === 0` → cut-window recompute) — FULL audit coverage kept for
every swat, both classes, stored-fields-only as measure.mjs's laws do; retire = drop the 15 javelin cells
(loses ALL flagged-swat auditability in these cells — the one class r64's lesson says never to fly blind on).

## The menu (one line per call, owner decides)

| # | cell family | A — re-seed/extend | B — retire (dated) |
|---|---|---|---|
| 1 | seam-proof halo section G + G4-crash | retire G whole, fix crash (H/I restored; H verified green, I 5/7 green) | rewrite G vs world-orbit laws now |
| 2 | seam-proof bow/crossbow + staff-brief + 2×-tolerance + I2/I3 float band | update all four expectations to live law (holders {bow,crossbow}; `+HEX` brief string; ratio band re-measured; 1e-9→drift-tested band) | retire the cells |
| 3 | pair-proof static audit | balance-aware matcher, re-prove it fires | drop the audit cell |
| 4 | lengrow-build-proof ladder cell | assert rigid→ladder, chain→ext | drop the cell |
| 5 | flipproof seed choice | script picks + asserts its own naturals | hardcode a new clean seed pair |
| 6 | flipproof T4 budget | budget on `flipT` (slow-mo aware) | drop T4 |
| 7 | leadproof 15 swat cells | split swat law: touch / cut-free classes | retire the javelin swat cells |

Recommendations are MINE and worth nothing until he answers: the repair-brief doctrine is that the killer
failure mode is "red becomes normal" — every retirement must be a dated record naming the coverage it gives
up; every re-seed must stay non-vacuous.
