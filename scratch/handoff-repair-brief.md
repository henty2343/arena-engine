# REPAIR BRIEF — SpinClash harness & flail rows (2026-11-10, r88-era)

**STATUS 2026-11-10 (late): ITEMS 1 AND 2 ARE DONE.** The flail `CIRCLES_V2` row is re-baked with
the FIXED baker (`bake-rows` chain-less twin now also zeroes `trait.len` — the r86-era bug that made
the flail bake impossible is repaired), `inscribe` reports **GATE: PASS** (flail: poke −0.25px, tie
0px, dots-off-ink 0/60), and the whole suite was re-proved with FAIL COUNTS IDENTICAL to the known
stale sets (zero new reds). Fingerprint baseline: `.qa/fp-flailfix-r88.json`. #722 recorded in
GAMES.md; live md5 slots re-recorded (README ×2; HANDOFF's `afc301…` KEPT as its dated amendment
record). Canonical: `previews/spinclash-preview.html` @ **`e431d344347a55da51e1f4604cbeb4ed`**,
5,392 lines, stamp stays `links-r87`. **Only Item 3 (stale-proof triage, policy calls) remains —
see its list below; every entry in it was ALREADY red on the r86 build.** The Item 2 section below
is KEPT VERBATIM as the recipe/record.

---

Handoff for a fresh session. Item 1 (harness contract) is **DONE and committed** (see `git log`,
commit after `d928bed`). Item 2 (flail covering rows) is the **ship-blocking** one. Item 3 (stale
proofs) is deferred policy work. A review session did the full diagnosis with executed evidence —
re-derive nothing, start here.

## Current state — read before touching anything

- Canonical: `previews/spinclash-preview.html`, build stamp **still `links-r87`** (the edits were
  behaviour-neutral in the browser; no new mechanics), md5 **`f2faa4cd9345134389b3f35ca33b6dad`**,
  5,392 lines.
- Docs still record the PRE-guard md5 `afc30118054c81265ade159224c9f03f` (README ~line 37, README
  working-set table ~line 269, HANDOFF ~line 32 — `grep -rn afc301 docs README.md`). **Re-record
  all of it in one pass as part of a #722 entry; do not patch records one by one.**
- Harness truth after Item 1 (all verified by execution on Node 20; README claims Node 22+):
  - `chromecheck.mjs` — PASS chrome, PASS pairing.
  - `.qa/inscribe.mjs` — LOADS, **GATE: FAIL — flail only** (that's Item 2; every other weapon green).
  - `.qa/pair-proof.mjs` — 36/37; the 1 FAIL is a stale static-audit cell (Item 3).
  - `.qa/flipproof.mjs` — runs to verdict; stale hardcoded-seed cells (Item 3).
  - `.qa/leadproof.mjs` / `.qa/seam-proof.mjs` — run; stale cells identical on the r86 build too (Item 3).
  - `.qa/fingerprint.mjs` — works; pre-repair r87 baseline kept at `scratch/.fp-r87-fixtest.json`.
  - `.qa/lengrow-gate.mjs` — now measures all 13 cells and reports an honest `[FAIL]` (MISS binds
    at k=1.0778) + exit 1. Context: this probe tests the *runtime uniform-stretch alternative* to
    spear's pre-baked ladder; its FAIL is the design answer ("a pre-baked ladder is required"),
    consistent with what ships. Not a law violation — but it used to print `[PASS]` while every
    cell crash-booted (13× BOOT/RUN FAILURE, vacuous). Fixed: boot failures counted, all-fail ⇒
    `[FAIL] VACUOUS`, real gate FAIL ⇒ exit 1.

## What Item 1 landed (this commit)

- `previews/spinclash-preview.html:3907` — `REVEAL_CLASSIC` guarded with
  `typeof location !== 'undefined' && …`. The unguarded `location.search` (introduced at `0392bf8`)
  crashed EVERY extraction harness: the bare-Node contract ("dependency-free, runs TODAY") was dead.
- `chromecheck.mjs`, `.qa/flipproof.mjs`, `.qa/pair-proof.mjs` — `globalThis.Path2D` no-op recorder
  stub (parry-FX rings/rays, new in the r87 era; Node has no canvas globals), plus in pair-proof's
  `recCtx`: `createLinear/Radial/ConicGradient → { addColorStop(){} }` (the medal/reveal gradients).
- `.qa/lengrow-gate.mjs` — non-vacuity fix described above.

## ITEM 2 — flail covering rows (ship-blocking; do this next)

Symptom (`node .qa/inscribe.mjs`, current canonical):
- static row audit: `flail n=65 poke=+1.71px POKE-FAIL {"d":81.9,"l":0,"r":2.4}` — gate is
  poke ≤ 0.12px; a poking circle fires hits across a visible gap (the top-priority permanent law).
- chain tie: `worst-fallback 1.1px`; bent-pose `dots-off-ink 2/65` (straight/bend/zigzag).
- The r86 build passes this gate: 56 circles, `0px`, `0/56`, GATE: PASS.

Root cause: `links-r87` (#721) hand-extended the `CIRCLES_V2` flail row with link-type circles.
Forensics: the added block contains `"l":0.0` values — a JSON round-trip NEVER emits `0.0`, so the
row was hand-edited, which the house doctrine forbids for baked rows. The #721 claim "zero re-bake,
the inscribe gate holds by construction" was never executed against the landed file.

Repair path:
1. Fix `.qa/bake-rows.mjs` FIRST — its per-segment chain trick strips `chain: FLAIL_CH,` from the
   row, but since r86 the flail carries `trait.len 0.025`, so the chain-less twin falls into the
   spear `lenJ` boot gate and throws (`lenJ must put the junction strictly inside the drawn tip`).
   The flail bake has been broken since r86 (verified on both builds). Fix: in `tempWith`'s
   subset path, ALSO zero the `len` term in the flail row's trait (or strip `trait.len`) so the
   trimmed shapes bake as an ordinary weapon; re-tie happens at boot as before.
2. `node .qa/bake-rows.mjs previews/spinclash-preview.html flail`, then `node .qa/inscribe.mjs`
   until `GATE: PASS` (flail: poke ≤ 0.12, worst-fallback 0px, dots-off-ink 0/N).
   If the per-segment bake cannot represent r87's added-link geometry, adjust the covering circles
   minimally IN DATA and prove with the gate — and record the method honestly in #722 (no silent
   hand-edits).
3. Re-run `.qa/seam-proof.mjs` (~60s+) and `.qa/lengrow-build-proof.mjs` (~60s) — the README testing
   recipe for any landing that moves geometry. Expected: the same known-red stale cells from Item 3,
   NO new ones.
4. `node .qa/fingerprint.mjs .qa/fp-links-r87.json` — regenerate AFTER the row repair (hitbox
   circles feed the sim, so the fingerprint WILL move from `scratch/.fp-r87-fixtest.json`; name it
   per the house convention and cite it in #722).
5. Record **#722** in `docs/GAMES.md` (dated entry, SUPERSEDED-marker pattern of #720→#721): covers
   the location guard, the harness stubs, the lengrow-gate non-vacuity fix, the bake-rows fix, the
   flail re-bake, the new fingerprint. Per Law #2 (history is never rewritten), ADD a dated
   correction to #721's "holds by construction" claim — do not edit the original text.
6. Re-record the canonical md5 + line count EVERYWHERE the old md5 appears (grep first; README ×2,
   HANDOFF, GAMES #721 current-build line). Consider whether the stamp stays `links-r87` (behaviour-
   neutral + data repair) or the flail re-bake warrants its own stamp — owner call; record whichever
   you take.
7. Scratch hygiene: delete `scratch/.bake-temp.html`, `scratch/.lengrow-gate-temp.html`, and this
   brief once its work is done; keep `scratch/.fp-r87-fixtest.json` until the new baseline lands.

**Definition of done:** `node .qa/inscribe.mjs` → `GATE: PASS`; flail chain-tie and bent-pose lines
zero; #722 recorded; md5 re-recorded; fingerprint baseline in `.qa/`.

## ITEM 3 — deferred stale-proof triage (known-red on BOTH builds; policy calls for the owner)

Either re-seed/re-widen the cells or formally RETIRE them with dated records. The failure mode to
kill is "red becomes normal" — that is how the flail poke escaped.
- `seam-proof`: ~8 stale cells — BOW `MULT_STEPS` expectation (build: MULT_STEPS 10, ceiling 6);
  superlinearity ratio 2.54 vs declared 2x; staff `shotR` brief text; boomerang halo G0/G1/G3 +
  the retired `trait.turn` guards (stale since `hexfam-r68`).
- `flipproof`: hardcoded naturals (FLAG_SEED 2 / CTRL_SEED 4) drifted — T2b tripwire + T2/T4.
  Options: re-seed, or let the script pick its own naturals and assert the invariants.
- `leadproof`: 15 stale cells (e.g. `javelin+bow s5 t10707 swat gap`) — its header says an
  unextended run is vacuous by design; extend CELLS or retire the drifted seeds.
- `pair-proof`: 1 static-audit cell (:4553/:4595 cast-keyed reads) — line anchors moved.
- `lengrow-gate`: honest FAIL now (see above) — decide if the uniform-vs-rigid probe text/verdict
  should be reframed against the shipped pre-baked ladder.

## Laws in force (do not break)

- **NEVER run `measure.mjs`** without the owner's explicit go (standing rule, 2026-10-19). Everything
  in `.qa/` + `chromecheck.mjs` is safe and designed to run; the suite is slow (~1–4 min per script)
  but second-scale results are greppable — pipe through `tail`/`grep -c`.
- Asserted-patch method: grep consumers first; exact-match replacements with expected counts; a
  count mismatch WARNS, never guesses.
- History is never rewritten; dated corrections + SUPERSEDED markers only.
- Non-vacuity: a probe that measured nothing cannot claim PASS.
- Baked rows: row-splice baker only (never whole-block regen for partial edits — the orb-r14
  incident), and now proven: **never hand-edit** (the `"l":0.0` forensics above).
- md5/line re-record everywhere after any canonical change.
- Pushes remain the owner's to make (this session committed on `main` locally only).

## Where the evidence lives

- The two commits before this one: `0392bf8` (links-r87 + REVEAL_CLASSIC landed together),
  `d928bed` (alignment — statically accurate; its md5/paths/purges all verified; but "inscribe
  holds by construction" was never executed and is FALSE — see Item 2).
- Old-vs-new flail row diff: `git show c728c68:previews/spinclash-preview.html` vs current, the
  `flail: [` line in `CIRCLES_V2` (~line 1236+). Old n=56 rows end at d≈139.9 with baked ball art;
  new n=65 adds ring/bar link-type circles (`{"d":81.9,"l":0.0,…}` region = the poke failure).
