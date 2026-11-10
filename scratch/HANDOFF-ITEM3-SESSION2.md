# HANDOFF — Item 3 stale-proof triage (2026-11-10, session 2, STOPPED AT 10% TOKENS)

Owner go given this session: **"do all of it"** → take **column A (re-seed/extend)** on every menu
item; retire only where the contract is genuinely dead. Plus: prioritise tokens, checkpoint and ask
when low. **Pushes remain the owner's.** Nothing here has been pushed; no commit was made.

## Workspace state (read this first)

- Files are all present, but **`.git/` was stripped by the workspace snapshot** — `git status` does
  not work. Re-clone `https://github.com/henty2343/arena-engine` (main, was at `c1c20e1`) into a
  clean dir and copy these files over, or `git init` + re-add, to recover a diff view.
- **Canonical is UNTOUCHED**: `previews/spinclash-preview.html` md5
  `e431d344347a55da51e1f4604cbeb4ed`, **5,392 lines**, stamp `links-r87`. Verified by md5sum at the
  end of this session. ⇒ **No md5 / fingerprint / bake ritual is triggered by anything on this menu**
  (every repair is `.qa/*.mjs` proof-side). Confirm with md5sum after each run.
- Baseline re-established GREEN before any edit: `.qa/inscribe.mjs` → **GATE: PASS**;
  `chromecheck.mjs` → **2× PASS** (chrome + pairing).
- Red baselines captured to disk (grep them, don't re-run to find out what was red):
  `scratch/triage/runs-before/*.log` (all five suites reproduced their known-red sets exactly),
  `scratch/triage/runs-before/diag-bow-band.out`, `diag-flip-t4.out`.
- Full previous-session diagnosis (accurate, and the source of the menu): `scratch/stale-triage-menu.md`.
  Original brief: `scratch/handoff-repair-brief.md`. Read order per README: `README.md` →
  `docs/HANDOFF.md` → `scratch/handoff-repair-brief.md` → `docs/GAMES.md` #721–#722.

## DONE — `.qa/seam-proof.mjs` patched (original backed up)

Backup: `scratch/triage/seam-proof.mjs.orig`. Patcher (asserted-patch, exact string + expected
count, writes nothing on any mismatch): `scratch/triage/patch-seam-proof.mjs` — ran clean,
**15/15 replacements, 0 mismatches**, `node --check` OK.

New machinery added: a `retired(name, detail)` reporter + counter — a retired cell is **printed and
counted, never silent** (the failure mode "red becomes normal" and its twin "gone becomes invisible").
Summary line now prints `N passed, N failed, N retired`.

| Patch | Cell | What it does |
|---|---|---|
| P0 | — | adds `retired()` helper next to `ok()` |
| P1 | header §G | marks G RETIRED, names what's given up + what's still live |
| P1b | header §I | documents the I2/I3 band re-seed with the measured number |
| P2 | B-bow | "sole rain holder" → **exactly two holders {bow, crossbow}** both `trait.mult 0.5` (crossbow took it at `pinlaw-r44`), briefs `+SPD +RAIN / Hit` / `+SPD +NAILS / Hit`; a **third** holder still fails it. Old assertion kept in a comment as the record |
| P3 | C-factor | ±0.35 → named `DECLARED_FACTOR_BAND=0.60`; this build measures ratio **2.54**; mechanic live (monotonicity cell green), band re-measured not deleted |
| P4 | E-staff | expected brief `'+SPD +SIZE / Hit'` → `'+SPD +SIZE +HEX / Hit'` (`hexfam-r68`) |
| P5 | **G4 crash** | RETIRED. `CATCH_GROW` was folded into prose at canonical `:1776-1781` at `touchorbit-r53`; `loadR` correctly refuses a missing target → threw → **silenced sections H and I**. G4b's CYCLE-ONLY witness still *reported* (0 unpaired spin rises / 231 catches) so the retirement names what it measured |
| P6 | g6, g7 | RETIRED, both **verified by probe** (`diag-guards.mjs`): g6 injection now throws the *different* `hexfam-r68` RETIRED error (can never match `/never comes home/`); g7 **does not throw at all** — `shot.orbit.elong` no longer exists |
| P7 | **g8** | **RE-SEEDED, not retired.** That guard is ALIVE — `shot.orbit = null` boots-errors on the `touchorbit-r53` world orbit `{ a, b, peak }`. Matcher `/needs shot\.orbit\.elong/` → `/needs shot\.orbit/`. Coverage kept |
| P8 | I2/I3 | the bare `1e-9` ledger tolerance (3 sites) → named `BAND=1e-3`, with the measured justification: worst deviation **6.41e-4 rad over 5,165 fires** (93 bank / 11 fire / 11 sat) — float accumulation, not a cadence breach. Probe `diag-bow-band.mjs` |

**Run after patching** (`scratch/triage/runs-after/seam-proof.log`, 192s): **48/51 passed, 4 retired**
and exit 1. **Sections H (9/9 GREEN) and I (7/7 GREEN) executed for the first time in weeks** — that
was the whole point of P5. Star law and cadence law both intact; I2/I3 now green under BAND.

## STILL TO DO in seam-proof: 3 reds (and 1 false green)

Remaining FAILs are the halo family the menu says to retire whole: **G0, G1, G3**
(`.qa/seam-proof.mjs`, printed under `console.log('G — halo-r39…')`).
- G0 asserts the halo set incl. `orbit.elong` → reports `orbit.elong undefined, turn undefined`.
- G1: `239 births checked, 239 off-law` (all — `shot.turn` is gone, so the speed AND turn identity can't hold).
- G3: `worst retired flight 1698t ≤ 400t` (the hand-on-path guarantee died with the halo; loops now orbit until caught).
Retire these three with `retired()` + dated reason. **Keep the measurement loop** — it feeds G2, G5
and the G4b witness. Cells that stay LIVE and green: **G0b, G2, G5, G6, g5, g8**.

### ⚠ NEW FINDING — corrects the previous session's menu
The menu listed **G1b as a "still-valid cell" that passes. That is WRONG. G1b is VACUOUS.**
Proven by executed probe `scratch/triage/diag-g1b-vacuity.mjs`: its predicate is
`Math.abs(st.speed/Math.abs(st.turn) - BM.shot.speed/BM.shot.turn) > 1e-9`, but the **row's**
`BM.shot.turn` is `undefined` ⇒ row ratio is `NaN` ⇒ `NaN > 1e-9` is **always false**.
Decisive test: every loop's speed multiplied by **1e6** — a gross violation — predicate fired
**0 times** across 21,077 in-flight checks, yet the cell prints `ok … 42788 in-flight checks, 0
off-scale`. **G1b must be RETIRED, not kept green** — a probe that measured nothing cannot claim
PASS. (Note the subtlety: the *shot objects* do carry a defined `turn`; it's the *row* reference
that is undefined.)

**Unverified — must re-run before trusting:** `scratch/triage/diag-nonvacuity-seam.mjs` (mutation
test of every kept/re-seeded cell: injects a break, requires the predicate to flip FALSE). It was
**still running when this session was cut — its result is UNKNOWN, not a PASS.** It is read-only, so
re-running is safe; expect several minutes.

## Menu items 3–7 — NOT STARTED. Facts already derived (use these, don't re-derive)

**3. `.qa/pair-proof.mjs` — 1 FAIL, FALSE POSITIVE.** Line 403:
`/\b(?:COLS|TINTS|FIGHTERS|SKILL_SHORT)\[([^\]]*)\]/g` — `[^\]]*` stops at the **inner** `]`, so
`COLS[(G.fighters[p.o] || { idx: p.o }).idx]` parses as index `(G.fighters[p.o` → no `idx` token →
flagged by `allowed()` (line 410, `/idx|cast/`). Canonical `:4732`/`:4774`, `burnfix-r84`. The code
is correct. Fix = balance-aware bracket scan from the match start over the comment-stripped text
(the `stripped` scanner at lines 380-399 is already string-aware; `slines.forEach` at 402 is the
per-line loop to replace; keep `reads` shape `{n, idx, line}` so 410-415 are untouched).
**Non-vacuity:** re-prove the fixed matcher still fires on the pre-fix canonical (13 real sites) —
otherwise the audit is just off. That is the trap here.

**4. `.qa/lengrow-build-proof.mjs` — 1 FAIL, by design.** Line 91 asserts `GROWERS.every(id =>
LEN_LADDER[id])` (GROWERS = rows with `trait.len`, line 79 → spear **and flail** since r86). The
flail is a **link-adder**: `chain.ext { pitch, unit:28, every:4, max:3, ring:3, bar:4, px:36.4 }`,
boot `:1810` skips chain rows and requires `chain.ext`. Re-seed = rigid growers → ladder, chain
growers → `chain.ext`, so the "new `trait.len` row forgot its mechanism" catch survives. Live facts:
spear `trait.len 0.0959`, chain undefined; flail `trait.len 0.025` + chain present.

**5+6. `.qa/flipproof.mjs` — two separate stale assumptions.**
- Seeds (lines 58-59): `FLAG_SEED 2` / `CTRL_SEED 4`. s4 now rolls `[tome,staff]` — staff joined
  `lead:-1` at the 2026-10-28 facing pass — so **T2b's own tripwire fired exactly as designed**, and
  T2's 70 "unflagged side left ±1" FAILs are downstream of the same fact (staff *is* flagged).
  Column A = self-picking at boot. Measured scan (`diag-flip-t4.mjs`): **FLAG→s1**
  `[["spear","flail"],["scythe","shield"]]`, 38 parries; **CTRL→s7**
  `[["orb","orb"],["bow","boomerang"]]`, 13 parries, no flagged roll. Keep the argv override
  (`process.argv[3]/[4]`), keep the `rollsFlagged` tripwire as a hard assert on the pick, and
  **loud-fail if the scan finds nothing** (a pick that silently falls back is vacuous).
- T4 budget (line 146 `chk(epLen - epFrozen <= epSweeps * singleBudget, …)`, 125 `singleBudget =
  ceil(flipMs/FRAME_MS)+2` = 13): predates `slowmo-r63`. Mechanism verified in canonical:
  flip clock decrements `fa.t -= dtFrames*1000/60` at `:5080`, and `draw(dtFrames*fxRate)` at `:5267`
  ⇒ **slow-mo stretches the flip** (fxRate `CFG.hitSlowRate` 0.25 ⇒ 4.17ms/frame). The old budget
  counts only `stopMs>0` frozen frames, never slowed ones.
  **Derived exact law** (`diag-flip-frames.mjs` trace): `flipT_at_reset + Σ dt === epSweeps ×
  CFG.flipMs` — ep1: 175.83 + 4.17×7 + 16.7×8 = **180.00 exactly**; ep2: 163.30 + 16.7×1 = 180.00.
  My first probe missed this (didn't count the reset frame's own decrement, read 150.3) — the
  **engine is exact, the probe was wrong.** So: assert the ledger sum, plus `resets === epSweeps`,
  plus **full-rate frames ≤ epSweeps × 13** (ep1 = 16 frames but only **9** full-rate ⇒ passes).
  Beware `Math.max(0, fa.t - …)` clamping the last frame's dt.

**7. `.qa/leadproof.mjs` — 15 FAILs, NOT seed drift** (brief's guess, already corrected in the menu).
Part B (lines 160-217) asserts every swat is a circle touch (`:209` `ok(best - e.sr <= 1e-4)`). All
15 are javelin (s7 ×9, s5 ×6) **cut-free-window** swats: the skewer's angle escape added at
`skewer-r46`/`impale-r48`, **after** the check was written. Canonical `:3654`:
`if (vf.figT <= 0 && (Math.cos(vf.wAngle)*wx + Math.sin(vf.wAngle)*wy)/wd > SKEWER.cutCos)
killShot(G, st,'swat', vf, 0)` — and `killShot` (`:3347-3361`) stores `gap: gap` ⇒ **`e.gap === 0`
identifies the class**. `SKEWER.cutCos = 0.75` (canonical `:1614`). All 15 verified recomputing green
from stored fields alone by `scratch/triage/diag-lead-swat.mjs`; **0 true contact failures**.
Re-seed = branch on `e.gap === 0` → cut-law recompute, else → touch recompute. Keeps full audit
coverage. **Must add `SKEWER` to leadproof's extracted return list at `:51`** (currently
`{ newGame, tick, CFG, WEAPONS, WEAPON_IDS, geom, drawWeaponOn }`).

## Non-negotiables in force (the owner's, verbatim intent)

1. **Assert-patch method** — grep consumers first, exact-match replacements with an **expected
   match count**, a count mismatch **fails loudly and writes nothing** (never guesses).
   `patch-seam-proof.mjs` is the working template.
2. **Non-vacuity** — a probe that measured nothing cannot claim PASS. Every re-seeded cell must be
   shown falsifiable (inject a break, see it go red). G1b is the cautionary tale: it was *green*.
3. **Never hand-edit baked rows** — use the now-fixed row-splice baker (`.qa/bake-rows.mjs`).
   Not needed on this menu (canonical doesn't move), but the rule holds.
4. **History is never rewritten** — dated corrections + SUPERSEDED markers only; keep the superseded
   assertion visible in a comment (P2/P4/P7/P8 all do this). Record `docs/GAMES.md` as **#723**
   (pattern of #720→#721→#722, `docs/GAMES.md:1185`).
5. **Any canonical change** → regenerate fingerprint baseline + re-record md5/line count in **every
   live slot — grep first** (`grep -rn e431d344 README.md docs/`; live slots are README ×2 +
   GAMES current-build line; HANDOFF's `afc301…` stays as its dated amendment record).
   **This menu does not touch the canonical.**
6. **Pushes are the owner's.**
7. **NEVER run `measure.mjs`** without the owner's explicit go (standing rule, owner 2026-10-19).
   Everything in `.qa/` + `chromecheck.mjs` is safe. Suite timings: seam-proof ~190s,
   lengrow-build-proof ~60s, pair-proof ~27s, leadproof/flipproof faster, inscribe ~7s.
8. **Token economy is law** (`docs/HANDOFF.md` Law #6): grep/sed the big docs, don't read
   `docs/GAMES.md` (677 KB) or `docs/CHRONICLE-archive.md` (446 KB) into context.

## Suggested order for the next agent

1. Re-run `diag-nonvacuity-seam.mjs` to completion (result unknown — do not assume it passed).
2. Retire G0/G1/**G1b**/G3 in seam-proof (P10+ in the patcher, or a second patch script);
   re-run seam-proof → target **47 passed, 8 retired, 0 failed**.
3. Items 3–7 above, one file at a time; capture each before/after log in `scratch/triage/`.
4. Non-vacuity proof for every changed cell (the mutation-test pattern in
   `diag-nonvacuity-seam.mjs` is the template).
5. Final full-suite pass + confirm canonical md5 unchanged; `GAMES.md` **#723** with dated
   corrections; update the README's stale tallies (line 276 seam-proof "~8 stale cells",
   line 307 pair-proof "37/37", line 296 lengrow-build-proof "57 assertions" — these numbers
   describe the pre-triage state and will be wrong after).
6. Leave the commit + push to the owner.
