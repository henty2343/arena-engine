# ARENA ENGINE

A localhost-only Node.js tool that turns a seeded game configuration into a finished MP4.

```
pick a game → set options → generate → watch it → download
```

No cloud, no accounts, no telemetry, no network calls after `npm install`. Binds `127.0.0.1` and writes files to `output/`.

> **Audience:** this repo's docs are written for AI agents — the owner rarely reads them. Write for agents: outcomes, rules, pointers, token economy. The journey lives in GAMES' dated entries; don't re-narrate it in quick-start paths.

**The purpose:** those MP4s get published to ad-supported platforms — YouTube, TikTok, Reels — and earn from the ads on them. The video file is the product; everything else in this repo is scaffolding to produce it. See the Purpose section at the top of `SPEC.md` before making any tradeoff.

**Requirements:** Node 22+ and VSCode are for the ENGINE, once Phase 0 lands — there is **no `package.json` yet**: ffmpeg, the canvas runtime and the fonts arrive with `npm install` when the engine's npm surface exists (`BUILD.md` Phase 0; `assets/fonts/` is a placeholder until then, NOT committed). The SpinClash harness (`chromecheck.mjs` · `measure.mjs` · `ingest.mjs` · `.qa/` · `scratch/`) is dependency-free and runs TODAY on bare Node.

---

## Read these

| | |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[GAMES.md](./docs/GAMES.md)** | **Read first.** Game design state: what exists, open questions, measured facts, test recipe. |
| [SPEC.md](./docs/SPEC.md) | The rules. Architecture, stack, pipeline, output specs, video-quality requirements, house style, studio UX, repo layout, what must never be introduced. |
| **[CONTRACT.md](./docs/CONTRACT.md)** | The interface a game implements. Services injected, what a game may not do, timeline shape, the eight compliance checks. |
| **[BUILD.md](./docs/BUILD.md)** | What to build next. Nine phases with pass/fail gates, the definition of done, and the full quality checklists. |

If you are an AI assistant: **start at [AGENTS.md](./AGENTS.md)** (with [STATE.md](./STATE.md)) — it defines what to load per task. Do NOT read all docs up front: `GAMES.md` is a ~155k-token grep-first archive, not required reading. Treat SPEC.md's rules as overriding any reasonable default you would otherwise choose.

---

## Starting a new chat — checkpoint 2026-11-10 (the magic era CONCLUDED — the wand's TRANSFIGURATION #710, the tome's TRIO #698, the scroll's EMBER SPILL #719; the MELEE PASS is ON — the flail's slot filled by THE LONG CHAIN `longchain-r86` #720 and REBUILT as THE ADDING-LINKS CHAIN `links-r87` #721; traits 14 of 22 — the 7 melee blanks + the orb remain; permanent laws since the last checkpoint: `allcut-r62` RETIRED THE PROJECTILE RULE — every weapon cuts on body touch, and `slowmo-r63` made the hit beat SLOW MOTION with the KO hard freeze kept)

Long chats die, so the work restarts in a fresh one. The repo IS the split now — the working-set
table below lists what a fresh session needs first; everything else is record or on-demand tooling.

**YOU ARE HERE** (current build). `links-r87`, md5 `99bb910d74d7390a435ce3354fb9320f`, 5,392 lines.

The flail's trait slot is filled with THE ADDING-LINKS CHAIN (GAMES #721): every 4 damaging hits adds one ring+bar link pair, at most 3 units; `chainGrow` returns the added-unit count; zero re-bake.

**Per-build history is the GAMES.md record — the README does not retell it.** Index into GAMES dated entries for the full story of any landing (revert scars, owner quotes, proof receipts).

**What's done:** The 22-weapon roster is complete. 14 of 22 weapon traits landed (spear length, staff orb, dagger spin, shuriken ricochet, bow rain, knives fan, crossbow nails, javelin skewer, boomerang world orbit, wand hex+transfiguration, tome trio, scroll ember spill, flail adding-links). The launcher era is concluded.

**What's next:** 8 remaining weapon traits (7 melee blanks + orb) → bot cast → balance. See "NEXT, in the owner's order" below.

**Traits 14 of 22 — 8 remain** — the count is GAMES.md's (#719's blanks minus the flail's #720):
the 7 melee blanks (hammer, axe, sword, mace, nunchaku, scythe, katana — POISON is ledger-claimed
by the tome's halo page, RED reserved for the bleed retrofit) + the orb. Both magic journeys are
CONCLUDED: the wand's TRANSFIGURATION (#706, journey closed #710) and the scroll's EMBER SPILL
(#715–#719); the tome's TRIO is live (#698). The flail's slot is FILLED — THE LONG CHAIN (#720),
rebuilt as THE ADDING-LINKS CHAIN at `links-r87` (#721). Next: the owner's eye on the flail's
adding-links chain (rate 0.025 / a link every 4 hits / max 3 units — all PROVISIONAL), then the
melee blanks + the orb at his pick (the hammer was the served recommendation), then the bot cast,
then balance — his order. The owner's GENERIC STATUS-RING design is still promised ("ill show
you").

**Per-build history is the GAMES.md record — the README no longer duplicates it.** Every owner
quote, smoke number and disclosed trade-off from the whole skills pass lives in GAMES.md's
Measured facts (#645–#695): the spear's length growth (+200%, uniform 12-step cap,
`nocombo-r34`'s NO-COMBOS retirement of `skill.lenSteps`) · the two seams (`seam-r30`) · the
pairing step (`pair-r31`) and its renderer fix (`review-r32`) · the staff's ORB GROWTH
(`shotgrow-r33`) · the dagger's SPIN GROWTH (`spingrow-r36`) · the boomerang's RETURN era
(`returngrow-r37` → `freeloop-r38` REJECTED at the eye → `halo-r39` PARKED) · the shuriken's
RICOCHET LAW (`ricolaw-r41`, slot CLOSED — THE LAW IS THE TRAIT) · the bow's RAIN (`multgrow-r42`)
with the generalized owner-blind cross law · the knives' GROWING FAN (`fan-r43`) · the crossbow's
NAILS (`pinlaw-r44` + `pinfix-r45`) · the javelin's SKEWER and its six eye-rulings (`skewer-r46`
→ `javelincarry-r52`, DONE) · PROCESS LAW #674 (mechanics-only, fast, the owner's eyes judge,
fingerprints/measure banned without his go) · the boomerang's WORLD-ORBIT era (`touchorbit-r53` →
`chaosorbit-r54` → the `nocatch-r55` experiment reverted → `catchonly-r56` → `snapfix-r57` →
`catchghost-r58` → `instantthrow-r59`, eye-blessed, DONE) · and the review itself (#692).

The canonical carries a **`TRAIT / SKILL REGISTRY`** comment block above `const WEAPONS = {` listing every axis,
its consumer site, its guard, and what does NOT exist yet.

**The slot/idx split is the thing to internalise before touching a fighter.** `f.slot` is the SIDE
(0 = the left spawn, 1 = the right); `f.idx` is the CAST IDENTITY (the row in `FIGHTERS`);
**`G.cast[slot]` is the only map between them.** Slot-keyed: `SPAWN`, the roll order, the direction
sign, `wins`/`winner`, `1 - f.slot`, `view`/`flashV`/`flipAnim`/`koStill.pose`, `C0`/`C1`, `fs[st.o]`
and **every event actor ref** (`by`/`to`/`o`/`winner`/`loser`). Idx-keyed: `COLS`, `TINTS`,
`SKILL_SHORT`, `FIGHTERS[idx].skill`, `meta.fighters` — **including in the renderer**,
which is where `pair-r31` got it wrong: the poster loop's `i` is the _half_ (a slot) and `st.o` is a
slot, so every cast-table read there must go through `G.cast`. They hold the same number under
`DEFAULT_CAST = [0, 1]`, which is why the landing looked behaviour-identical — **and why the
fingerprint suite can never check any of it.** Run `.qa/pair-proof.mjs` (sections E, F and **I**)
after any edit near those fields; section I drives the real frame loop against a recording canvas
and statically audits every cast-table read in the file (a dynamic, comment-stripped scan — 33 sites at links-r87, ≥20 floor) (`LEN_CAP` left the audited list at
`nocombo-r34` with the table itself).

**NEXT, in the owner's order: a unique TRAIT for each of the remaining 8 weapons (14 of 22 landed), then the bot cast
(every bot a unique skill), then balance — additive stacking only, NO unique combos.**
The pattern to copy is `shotR` — a row field → **ONE** consumer site → one assertion in a Tier-0
proof (~6 sim lines plus 3 renderer lines, no bake). (`lenSteps` was the original cheap-pattern
exemplar and was RETIRED at `nocombo-r34`: a skill may add on a shared axis, never reach into a
trait's mechanic.) For a CHEAP axis the assertion's
house is `seam-proof.mjs` — its shotgrow section E is the template (`shotR` was ~6 sim lines plus 3
renderer lines, no bake). After any skill or bot landing run
`.qa/seam-proof.mjs` (~5min) then `.qa/lengrow-build-proof.mjs` (~60s); add Tier 1 (`inscribe`,
`bake --verify`, `leadproof`, `flipproof`) **only if geometry moved**.

**More bots is now cheaper, but not free.** The pairing step removed the sim's 1v1 _identity_
assumptions; it did not remove its 1v1 _sizing_. A third bot is a `FIGHTERS` row + **an owner-chosen
colour** + widening the seven arrays that hold exactly two entries (`SPAWN`, `COLS`, `TINTS`, `VIEW`,
`flashV`, `flipAnim`, `C0`/`C1`) — `SKILL_SHORT` already `.map`s over `FIGHTERS`. A
3-way brawl is still structural. There is **no cast-selection UI**: `APP.setCast([i, j])` is a
console lever by design while N = 2, and it persists across seed changes.

**Do not redo:** the length ladder or its covering bake · the carrier measurement (it chose Speedy
for the now-RETIRED `lenSteps` and stands as history — Heavy is **self-defeating**, his own +0.9
dmg/hit kills at hit ~13 which is below the cap, so his spear walls at step 13; Speedy saturates in
79% of rounds — and its lesson is live doctrine: damage-coupled growth is self-limiting) · or the **484-cell re-run, the
resolver rework and the spear-bearing fingerprint cell — all three DEFERRED to the END of the pass**
by owner ruling. **No balancing and no win-rate reporting during the pass** (rule 10). **Weapon
traits reset every round — that is a LAW, not a default** (rule 8); it killed the first proposed
special skill outright. **Knock still has no seam** (no `CFG.knock`; applied diffusely at shot
landings, parry shoves and bounces) and needs a decision about _which_ knock before it can be a row
field. A general hook/plugin framework was deliberately **not** built — do not add one.

**The working set — what a fresh session reads first** (repo paths; the repo itself is the
working set, and `previews/` is the only canonical):

| file | why |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `previews/spinclash-preview.html` | the canonical game — the ONLY canonical. md5 **`99bb910d74d7390a435ce3354fb9320f`**, build **`links-r87`**, **5,392 lines**. Start at the `TRAIT / SKILL REGISTRY` comment block above `const WEAPONS = {`. The spear grows `len: 0.0959` per damaging hit over a **12-step** ladder of per-step re-baked coverings in the marked `LEN_CIRCLES` block (regenerate with `.qa/lengrow-bake.mjs`; never hand-edit). The cap is **uniform at 12 (+200.1%, `REACH.spear` 505.488) for every holder** — `skill.lenSteps` (the `skill-r29` carrier era: 18 steps, +420%, REACH 829.571, carrier Speedy by measurement) was **RETIRED at `nocombo-r34`** under the owner's NO COMBOS ruling: a skill and a trait may stack only by addition on a shared axis. `seam-r30` added the two seams the remaining weapons need — an authored `brief` per row and an **inert** shot-cadence multiplier (`shot.mult` / `skill.shotMult`), both boot-guarded. Per-build history r33–r57 lives in GAMES.md's Measured facts (#645–#695) — the README no longer duplicates it (its own stated law). The flail now grows by ADDING LINKS (`links-r87`, #721): `FLAIL_CH.ext` { unit 28, every 4, max 3, ring 3, bar 4 } — one ring+bar pair added per 4 damaging hits, max 3 units (LEN_STEPS 12 / 4); np = 3+2n hinged particles; every added link re-uses its TYPE's baked covering (`circBySeg`) — zero re-bake; `chainGrow` returns the added-unit count; boot-gated (`ext.max` must cover floor(LEN_STEPS/every)); REACH carries `ext.max × ext.px`; the r86 pitch stretch + `growMax` are retired. |
| `docs/GAMES.md` | the record: every owner decision with its quote, every measured fact, the test recipe. Its md5 moves with every edit — never pin it |
| `measure.mjs` (repo root) | the sanctioned instrument — owner-gated (standing rule 2); no md5 pin, the repo copy is the only copy. (`--band-dump` added 2026-10-28 plus the corrected law-3 disclosure text; both report-additive — the flag is proven byte-identical with it off). **Never runs without the owner's explicit go** |
| `README.md` (repo root) | this file |
| `docs/SPEC.md` | platform rules; overrides any default you would reach for |
| `docs/CONTRACT.md` | the interface a game implements |
| `.qa/fingerprint.mjs` | behaviour-identity proof |
| `.qa/seam-proof.mjs` | **Tier 0 — live verdict 47/55 passed, 8 retired, 0 failed** (the Item-3 stale-proof triage, 2026-11-11: the re-seeded cells are proven falsifiable by a **9/9**-cell non-vacuity mutation test — honest **9/9, NOT 10/10**, session 3's false 10/10 claim superseded; GAMES.md #724/#725) — proves the skill seams are live (not dead code), the staff's orb-growth axis (section E: exact birth radii over a full battle, per-fighter independence, the round-reset LAW, other launchers untouched), the dagger's spin-growth law (section F: exact per-hit \|spin\| growth across 9 forced battles, the round-reset LAW, melee-axis exclusivity), the boomerang's Loyal Halo + cycle-only catch growth (section G, halo-r39: the birth-snapshot law exact over 894 births, the shape-scale lock over 37,216 in-flight checks, cap saturation at exactly 1.2^10 — **the halo family is RETIRED as of 2026-11-11 by the Item-3 stale-proof triage: the LOYAL HALO was retired whole at `touchorbit-r53`, so those cells now print RETIRED — printed and counted, never silent — and the G4 crash is fixed, so the H and I law sections run again**; the reset LAW, the wand untouched), and that all the boot guards actually FIRE. [The rejected r38 rewrite was parked under `scratch/boomvars/`, which is no longer in the tree.] |
| `.qa/BASELINE` | the standing-baseline pointer — names the active `fp-*.json`; 8 cells, must stay 8/8. Judge with `node .qa/fingerprint.mjs --compare` (reads the pointer). The take-over chain (each adoption's move count + md5) is history: `docs/archive/README-baseline-takeover.md`. Blind axes: the suite never rolls a spear, never crosses two shots, and plays `DEFAULT_CAST` only (`slot === idx`), so no cell exercises a swapped pairing — that is `.qa/pair-proof.mjs`'s reason to exist. |
| `scratch/docreflow.mjs` | run FIRST after any GAMES.md edit |
| `scratch/navgen.mjs` | run SECOND; regenerates the nav block's line numbers |

**Tooling tiers — repo paths, no upload cap** (the "Batch 1 is full" framing is retired 2026-11-10). The length-growth build is **landed** — and re-raised twice
in one day, so this slot's history is worth keeping straight, including two predictions that were
both overtaken. The first was simply wrong: `ingest.mjs` (now at the repo root) was **never** on the build's path.
The second looked right and then reversed: `.qa/bake-rows.mjs` was "not on the build's path at
all" for `lengrow-r26`/`r27`, because the owner's rigid-junction ruling made a per-step re-bake
unnecessary (the head cluster moves as a rigid body, so a `d`-remapped covering stays inscribed) —
but that route is bounded at **+39.5%**, and `r28`'s +200% is past it, so all twelve steps now
carry re-baked rows and **`bake-rows.mjs` IS on the current build's path**. What a fresh session
continuing from here actually wants early from tier 2: **`.qa/lengrow-bake.mjs`** (the per-step
covering regenerator — `--verify` is the shipped-ladder proof, gated on each step's own rows
against their own art; ⚠ **it currently REFUSES, exit 2, and writes nothing**: the roster has
**two** growing weapons since `links-r87` (spear + the flail's link-adder `trait.len`) and this
tool bakes the spear only — "extend it deliberately if that changes" — the same fact Item 4's
re-seed encodes, and the NEXT open item **[SUPERSEDED 2026-11-11, session 7 (GAMES #728): the guard now counts RIGID growers only, so `--verify` now exits **0** with 12/12 and prints the flail as a chain grower skipped by design — the flail is a link-adder with no ladder row, so there was never anything to bake for it; a SECOND rigid grower still refuses, by design; the ⚠ text above is kept as the dated record]**; `--write` splices the `LEN_CIRCLES` block; `--emit FILE` writes the block
without touching the canonical, so a code edit and a geometry edit can land **atomically** (otherwise
the boot guard rejects the file mid-transition); `--steps N` probes a taller ladder and refuses
`--write`. It reads `trait.len`/`lenJ`/`LEN_STEPS` out of the canonical so baked rows cannot
drift from the row that consumes them) ·
**`.qa/lengrow-build-proof.mjs`** (~60s, read-only, **57 passed / 0 failed** — and its re-seeded growth-mechanism cell proven **FALSIFIABLE 6/6** (a rigid grower without a ladder row, a chain grower without a covering `chain.ext`, a chain grower wrongly given a ladder) — Tier 0 for every landing, the build's own evidence,
including the growth-off differential the fingerprint suite cannot supply) · **`.qa/inscribe.mjs`**
(the house gate, which `lengrow-bake` drives through `bake-rows`) · `.qa/leadproof.mjs` +
`.qa/flipproof.mjs`, the standing regressions for the edge-leading mirror (**live: leadproof ALL PASS — 154 swats audited from stored fields, 139 touch-class + 15 cut-window; flipproof ALL PASS — 14 sweeps, the flip clock's ledger exact — armed at 180ms, lands on 0, raw spend inside one frame — with arms === sweeps**), which any reach change
should re-prove — and the spear's reach just grew **140%**. `.qa/lengrow-gate.mjs` has changed
role: it proves the **ceiling of the remap route** (+39.5%), not the shipped ladder.
`.qa/lengrow-proof.mjs` (~3s, read-only) stays as the coverage probe for a _uniform_ stretch: it
is the measurement that ruled that route out. **`.qa/seam-proof.mjs`** (~2s, Tier 0) is the newest
and the one a fresh session should run first after any skill or bot landing: it proves the seams are
live and, more usefully, that the boot guards actually throw.

**Tier 2 — only if the task needs it:** **`.qa/pair-proof.mjs`** (~27s, Tier 0, read-only, **37/37**, its re-seeded balance-aware tripwire proven **FALSIFIABLE 6/6** — the pairing step's only probe, and the one instrument that runs a pairing where `slot ≠ idx`, which the fingerprint suite cannot do in principle. **Section I drives the RENDERER**: a recording canvas stub captures the VS poster's `fillText` while the real frame loop is hand-stepped, and a comment-aware tripwire audits every cast-table index read in the file (dynamic scan, ≥20 floor). It is **proven to fire** — against the pre-fix `pair-r31` canonical it reports 4 FAILs and names all 13 offending sites. **Promote it to Batch 1 the moment bots are added**, because every bot landing edits the fields it sweeps. It asserts its own sample sizes, so a future stall fails loudly instead of passing on zero observations) · `chromecheck.mjs` (~26s render/clock check **+ a pairing section**: it drives `APP.setCast([1, 0])` and asserts the scorebug names, identity swatches and legend rows exchange sides together, the slot-keyed score stays put, and the winner overlay names the ACTOR — the only coverage of the chrome's pairing path, since `pair-proof` loads the sim block alone) ·
`docs/BUILD.md` · `.qa/inscribe.mjs` + `.qa/bake-rows.mjs` (the house gate and the row baker —
needed for any art/poly/scale edit. **Correction, 2026-10-28:** this line used to call them "the
only tools that write to the canonical", but only `bake-rows.mjs` writes; `inscribe.mjs` is
read-only, verified by grep — **and now genuinely on the build's path**, because `r28` bakes
all twelve steps through it) · `.qa/lengrow-bake.mjs` + `.qa/lengrow-build-proof.mjs` +
`.qa/lengrow-gate.mjs` (the covering regenerator and `--verify`, the build's own **57**
assertions, and the gate that proves the remap route's ceiling) ·
`.qa/leadproof.mjs` + `.qa/flipproof.mjs`
(standing regressions for the edge-leading mirror) · `.qa/fp-lead-r22.json` (the **pre-`stall-r25`**
fingerprint baseline — a historical record of `cross-r24`'s behaviour, **no longer a valid
equivalence target**; only needed to reproduce the 7-of-8 move the stall fix caused — and
`.qa/fp-stall-r25.json` joined it as a historical record at `shotgrow-r33`, 2026-10-31: the
pre-staff-trait baseline, needed only to reproduce the 1-of-8 move the orb growth caused).

**Repo-organization laws:** live in `docs/SPEC.md` (section "Repo-organization laws"); the former `docs/HANDOFF.md` was merged there and removed.
The former `docs/CHRONICLE-archive.md` is recoverable via `git show docs-precleanup:docs/CHRONICLE-archive.md`.

**Standing rules, all of them enforced by the owner:**

1. **Discuss before writing.** Analysis and proposals first; nothing enters docs or code until he says go. Analysis-only turns are normal.
2. **`measure.mjs` never runs without his explicit go** (2026-10-19, "dont run measure.mjs. (atleast not untill i say so, ever. ask if you want to)"). Long runs belong on _his_ machine — the sandbox is 2-core and `--jobs` buys nothing there.
3. After any GAMES.md edit: **`docreflow` FIRST, then `navgen`**. Both are idempotent and self-proving.
4. A behaviour-identical edit must prove **fingerprints 8/8** vs the standing baseline named in `.qa/BASELINE` — run `node .qa/fingerprint.mjs --compare`, which reads the pointer and judges (exit 0 = identical). Every earlier `fp-*.json` is a superseded historical record and proves nothing about the current build; the take-over chain is history (`docs/archive/README-baseline-takeover.md`). The canonical's md5 must not move unless the change is sanctioned and recorded. **Caveat proven by `lengrow-r26`, and then proven three times over by `r27` and `r28`: 8/8 can be VACUOUS.** All three moved 0 of 8 and all three are behaviour-affecting — the suite never rolls a spear and never crosses two shots, so a green run only covers what the eight cells actually exercise. `r28` triples the spear's length and leaves all eight hashes bit-identical, which is the sharpest demonstration available. The flip side landed at `shotgrow-r33`: an axis the suite CAN see shows its delta surgically — 1 of 8 moved, exactly the staff cell, which is itself the proof the other 21 weapons did not move. Establish coverage before reading neutrality into it, and prove the change directly instead.
5. He **playtests personally** and reports symptoms; reproduce headlessly at the same seed before patching.
6. Terminology: a fighter has a **SKILL** (platform term, never move it), a weapon has a **TRAIT**. Never the bare nouns — always "fighter skill" / "weapon trait".
7. Balance rulings in force: base damage 1 vs hp 100 is "just a test" · **parry rewards nothing** · round-ending stalls are **deliberate until skills** (no timer, no ramp, no shield fix) · max weapon length = the spear's, floor 54 boot-gated. `dmg` 0.3 on the spear stays **provisional** and is not to be re-tuned against its growth rate.
8. **WEAPON TRAITS RESET EVERY ROUND (2026-10-28).** _"i dont like this at all, each round weapons traits should reset."_ This ratifies shipped behaviour (`rollWeapons` already zeroes spin, dmg and `lenStep` each round) and binds every future skill: **no special may carry trait growth across a round boundary.** A special must express itself within a round — higher ceiling, faster rate, different trigger, different effect. It killed the first proposed special skill outright. Note also that any weapon-trait-hooked skill is roll-conditional at ~4.5% of rounds (uniform 1-of-22 draw), so it must be big to be worth having.
9. **THE PROOF BATTERY IS TIERED, NOT PER-LANDING (2026-10-28).** _"i really dont think all this testing is nescessary, we are adding a lot more skills and bots, so if you do this each time its going to take forever."_ **Tier 0, every landing (~1 min):** boot probe + `.qa/lengrow-build-proof.mjs` + `chromecheck` only if a label changed. **Tier 1, only if geometry moved** (art, polys, coverings, scale): `inscribe.mjs`, `lengrow-bake --verify`, `leadproof`, `flipproof`. **Tier 2, only on suspicion or once at the end of the pass:** differential sweeps, cost measurements, fingerprints. Entries get **shorter** too — what changed, the numbers that matter, what is owed. Not cut: a measurement that can **change a decision** (the `skill-r29` carrier pick falsified the obvious choice in five minutes — that is design, not verification).
10. **NO BALANCING DURING THE SKILLS PASS (2026-10-28, after playtesting `lengrow-r28`).** _"i think we should hold back on re run, all the stats you keep delivering about other weapons etc, i know its unbalanced etc, we are not trying to balance the game at all right now, we are making the skills/mechanics, a new balancing will come afterwards."_ So: the **484-cell re-run**, the **rotational-DOF resolver rework** and the **spear-bearing fingerprint cell** are all deferred to the END of the pass (confirmed by the owner), which then closes with **one** new fingerprint baseline instead of two. Law 3 stays RED and disclosed meanwhile, and **nothing in the skills pass may depend on the resolver being correct**. This binds reporting too: no per-weapon win rates, no holder-win% tables, no damage-vs-growth re-measurement. A Measured-facts entry records **mechanics** — what the code does, what it costs, what is proven. The only sweep that stays legitimate is the _"does this mechanic work"_ differential, reported as works / does-not-work.

**Where the work stands.** The 484-cell baseline is complete (3,872 battles, 7,891 decided rounds,
all integrity counters clean) and `measure.mjs` now attributes both live reds instead of only
sizing them. Skills-pass doctrine is **already settled and recorded in GAMES.md — do not
re-litigate it**: trait = data / skill = contract hook, stacking adds, skills as authored legend
labels, authorized hook targets, `omegaCap` left dormant, elementals yes but design deferred,
axis placement "designed out", parry forbidden as a skill reward, cast stays at two (Speedy
+0.30 spin, Heavy +0.9 dmg).

**Owed, in order:** (1) **Nothing structural from the skills pass's own build steps — they are
all IN** (the spear's length growth at +200% with the uniform 12-step cap, the two `seam-r30`
seams, the pairing step, and FOURTEEN weapon traits; the pass continues with the remaining 8). The
full build history and its measurements live in GAMES.md (the _Length growth — the spear's trait_
section plus Measured facts #645–#692). The LIVE DOCTRINE distilled from it, kept here because
every remaining trait landing leans on it: **(a)** damage-coupled growth is self-limiting — the
holder's own damage sets the hit budget (the one surviving lesson of the retired `skill-r29`
carrier, gone at `nocombo-r34`: a skill may ADD on a shared axis, never reach into a trait's
mechanic); **(b)** length is the spear's alone by owner ruling, so every other trait needs **no
baking at all** — a row field plus ONE consumer site (the `shotR` cheap-class pattern: ~6 sim
lines + 3 renderer lines); **(c)** cadence multipliers realise SUPER-linearly — a synthetic 2×
measures 2.15× and a 4× ~7× (more shots → more hits → more spin growth → more shots): size any
carrier on the realised factor; **(d)** traits reset every round (the LAW) and stacking is
additive only (NO COMBOS); **(e)** **still missing for the remaining unique skills: only one
trigger exists (`grow()`, on a damaging hit), `emit()` is an append-only log with no subscribers,
and knock has NO SEAM at all** (no `CFG.knock`; it is applied diffusely at shot landings, parry
shoves and bounces) — knock needs the owner's which-knock decision before it can be a row field.
A general hook framework was deliberately NOT built. (2) **The law-3
resolver rework, now unblocked.** The diagnosis is complete (`--band-dump`, 2026-10-28):
translation-only projection on crossed long blades has a fixed point ≈10px deep, the loop has no
rotational DOF but already computes the contact torque and discards its magnitude, and the
disclosed "≤6px / infeasible pin" bound was falsified at 20.754px with zero body overlap. The fix
**DEFERRED to the end of the skills pass (owner ruling 2026-10-28)** so it is designed against final geometry. It is a rotational DOF, not a one-liner, and its fixed point scales with reach — and the spear's
reach has just grown **2.40×** (210.412 → **505.488px** at the ladder top), so the rework must be
designed against the grown ladder rather than the base row. At 505px from the body centre in a
1000px arena the spear touches the wall from mid-arena, so crossed-blad contact geometry will now
be dominated by wall-adjacent configurations the base row never produced. The disclosure is
already corrected in `measure.mjs` and `ingest.mjs`. The two falsified canonical comments (sim
:1673, :1720) and the inverted stall test at :1708 (`> -0.02` → `< 0.02`) were originally to ride
along in the rework's landing, but **landed separately and ahead of it as `stall-r25`
(2026-10-28)** per the owner's skills-pass ordering — behaviour-affecting, **7 of 8 fingerprints
moved**, so a 484-cell re-run is owed — **DEFERRED to the end of the skills pass (owner ruling
2026-10-28)** — and should then cover that landing together with `lengrow-r28` and whatever the
skills pass adds, rather than running twice — and `r28`'s 2.40× spear reach should be expected to widen the law-3 band
substantially on its own account. Law 3 stays RED and disclosed until the rotational DOF lands.
(3) **Close the fingerprint
coverage gap — now TWO blind axes. **DEFERRED to the end of the skills pass** (the pass moves hashes anyway, so it should close with one new baseline, not two).** The standing baseline (named in `.qa/BASELINE`; take-over chain in `docs/archive/README-baseline-takeover.md`) is blind to the shot-cross path (though `ricolaw-r41` put crosses at the centre of the star law — seam H5/H6 cover what the suite cannot); and `lengrow-r26`/`r27`/`r28` proved it is **also blind
to the spear** — three builds in a row, the last of which triples the spear's length — it moved 0 of 8 because six cells are forced non-spear matchups and neither natural cell
rolls one, so no cell can observe length growth and `f.lenStep` is not in the hashed fields
either. Adding a spear-bearing cell is owed before any future "behaviour-identical" claim can
cover growth; until then, prove such a change directly, as `.qa/lengrow-build-proof.mjs` section N
does with a growth-off control. (`shotgrow-r33` closed one sliver of the gap from the other side:
the suite now covers the STAFF's growth axis — its landing moved exactly that one cell, and the
other seven bit-identical hashes are the proof the other 21 weapons did not move.)

**Closed 2026-10-28:** the attribution re-runs (owner's machine, Parts 2 and 1, 26/26 fields
identical to the baseline); band-vs-resolver (it is the resolver — see the attribution entry);
law 4s (a sim double-kill, fixed by a one-line `break`, build `cross-r24`); the dagger's trait
(+0.7 DMG stands, the value the row already ships, no code); the canonical's stale harness
comment; **the resolver's inverted stall test at :1708 plus the two comments it had falsified
(:1673, :1720) — build `stall-r25`, landed alone, 7 of 8 fingerprints moved, new baseline
`.qa/fp-stall-r25.json`**; **the length-growth coverage probe** (`.qa/lengrow-proof.mjs`, which
proved a uniform runtime `d`-stretch grows an uncovered tip protrusion as `5.67k − 2.7`, and is
therefore why the geometry that shipped is the rigid map instead); and **the length-growth build
itself — `lengrow-r26`, the rate raise to `lengrow-r27` (+35%), and the raise to
**`lengrow-r28` (+200%)**, the last **46/46** in `.qa/lengrow-build-proof.mjs`, house gate
(`inscribe.mjs`) exit 0 on the landed canonical with the base row unchanged, all twelve baked steps
gated against their own stretched art by `.qa/lengrow-bake.mjs --verify` (12/12, poke -0.30px,
miss 2.30-4.25px), and leadproof / flipproof / chromecheck all PASS**; and **the covering ceiling on
length growth, swept rather than guessed — tip +39.5% with the covering held, MISS-bound, recorded
in the canonical's own comment block, and then _passed_ by re-baking rather than by thickening.**
Part 5 is not needed — mechanism B was 0. **And the first special skill — `skill-r29`,
58/58 in `.qa/lengrow-build-proof.mjs`, all 18 baked steps gated on their own art, house gate exit 0,
leadproof / flipproof / chromecheck PASS, rows 1-12 byte-identical to `r28`, fingerprints 0 of 8.**
**(Retired at `nocombo-r34`, 2026-10-31 — uniform cap 12, rows 13–18 purged, `REACH.spear` 505.488;
proofs now build-proof 57/57 with section O the uniform-cap proof, `--verify` 12/12, fingerprints
0 of 8 and spear-blind as ever.)**

---

## Adding a weapon trait / fighter skill / bot — the recipes

Moved to **[docs/RECIPES.md](./docs/RECIPES.md)** (Phase C) — the add-trait, add-bot and stamp-discipline
recipes live there now. The mechanics they must respect are in **[docs/LAWS.md](./docs/LAWS.md)**.

## Commands

The command surface the tool exposes once built — nothing here runs until the matching phase in `BUILD.md` lands (see Status below).

The SpinClash harness sits OUTSIDE this npm surface: `chromecheck.mjs` · `measure.mjs` · `ingest.mjs` · `.qa/` · `scratch/` are dependency-free `.mjs` tools that run TODAY on bare Node from the repo root (e.g. `node chromecheck.mjs` — ~4s boot + pairing check on the canonical; `node scripts/run-battery.mjs` runs the whole proof battery in one command; `node tools/verify.mjs` judges repo health and emits a JSON verdict — `--quick` for docs-only, `--battery` to include the battery). There is no `package.json` yet; it lands with Phase 0. `measure.mjs` stays owner-gated (standing rule 2).

```bash
npm install
npm run doctor                                       # environment self-test — always first
npm run dev                                          # studio at http://127.0.0.1:5173
npm test                                             # determinism, golden frames, compliance

npm run generate -- --game <id> --seed 42 --target vertical
npm run inspect  -- --game <id> --seed 1 --at 12.5   # one full-res PNG, ~200ms
npm run inspect  -- --game <id> --seed 1 --sheet     # ~24 frames tiled
```

---

## Working with the owner

- Likes **chaotic but legible** gameplay; consistent movement pace; effects must never distract from the state of the match.
- Believes **interest drives comprehension** — viewers rewind or rewatch when they care. Raise a readability concern once, then defer to the owner's judgement.
- **Discuss before writing.** Proposals and analysis first; nothing goes into docs or code until the owner says go.
- The owner **plays the preview personally** and reports symptoms. Reproduce headlessly with the measurement harness before patching.
- **`measure.mjs` never runs without the owner's explicit go** (standing rule, owner 2026-10-19: "dont run measure.mjs ... ever. ask if you want to"). Parallel and tiered since v1.2 (`--solidity` / `--quick` / `--vs` / `--cells` / full — the report is identical at any job count). `--solidity` is the owner's tunneling/overlap suite (~109 battles: naturals + a curated 23-cell overlap gauntlet — minutes, not an hour); a full matrix run is ≈3,900 battles at the 22-weapon roster, wall ≈2.5h ÷ cores, and the assistant's sandbox cannot host it (long runs get killed and look like stalls) — matrix baselines run on the owner's machine. Fast iteration goes through `chromecheck.mjs` (~30s) and `.qa/inscribe.mjs` (~6s — mandatory after any art/poly/scale edit). **`.qa/projectile-fix.mjs` — the ~2–3 min targeted probe for shot-rule changes — was retired in the 2026-10-28 pre-skills cleanup, so `measure.mjs` (owner-gated) is now the only instrument that covers shots, holds and the damage gate. Budget for that, or rebuild the probe, before touching shot behaviour.**
- Allergic to over-engineering. Any mechanism must earn its place; expect "is this actually necessary?" and answer it honestly.

---

## Status

Blueprint complete; **no engine code yet** — start at Phase 0 in `BUILD.md`. Game #1 (SPINCLASH) runs as `previews/spinclash-preview.html` — the ONLY canonical — a dependency-free browser sim at build **`links-r87`** (landed 2026-11-10, #721; md5 re-pinned at #733, 2026-11-11; _the `<title>` node remains the authority for the stamp — this convenience copy has drifted three times, so check it first_): pure `newGame`/`tick`, then the renderer, then chrome — harness-extractable, no DOM above the RENDERER banner. Its frame (the PEBBLE look) is locked; its weapon art landed at `roster-r12` and the convention CLOSED 2026-10-27 (the prescriptive lock lives in GAMES.md, "Weapon art — the closed convention").

**In the sim:** the 22-weapon roster, complete · the Core contact law and the seven shot laws · nine flying shot kinds under the copy rule (1:1 munitions, the staff orb and wand spark under the whole-body waiver, the scroll's fire comet, the tome's poison/frost/fire trio pre-figuring the skill pass) · the knives' three-knife volley · render interpolation · the overflow-band canvas (weapon ink never cuts) · hitstop as a true pause of the on-screen frame, with the kill still on the K.O. hold · the owner-designed VS-poster dice reveal · the 2026-10-21 feel-tuned physics set (gravity 1400 · chaos ceiling 1200 with 0.9 wall bleed · parryPush 700 · the parry flutter gate · the capped, tick-gated pin-escape nudge) · the N-segment generic chain sim (flail 3 particles, nunchaku 1) · the edge-leading mirror on four rows (`lead: -1` — katana, scythe, and since 2026-10-28 the dagger and the staff) with its `headLead` sibling for the javelin and the 180 ms flip transition.

**Balance state (the 2026-10-28 pass):** base damage 1 against hp 100 (owner: "just a test") · the length band `LEN_MIN` 54 .. `LT` 113.44, boot-gated · spin and damage are `WDEF` policy constants, so a new row declares only what is actually special about it · the spell-family nucleus sigils re-treated for legibility (a carrier disc at the launched hitbox radius on a dark ink plate — the one place shot art is implementer-generated rather than delivery-verbatim).

**Next: the remaining 8 weapon traits — 14 of 22 are IN** (spear length · staff orb growth · dagger spin growth · shuriken RICOCHET LAW, slot CLOSED · bow RAIN, closed-for-now · knives growing fan · crossbow NAILS + mult UNCAPPED · javelin SKEWER, DONE · boomerang WORLD ORBIT, DONE and eye-blessed · wand TRANSFIGURATION + THE HEX, concluded #710 · tome TRIO, landed #698 · scroll EMBER SPILL, concluded #719 · flail THE ADDING-LINKS CHAIN, #720 → `links-r87` #721 — the MELEE PASS has begun; the count follows GAMES #719's blanks). The launcher era is CONCLUDED — no proposal awaits a ruling. Remaining: the 7 melee blanks (hammer, axe, sword, mace, nunchaku, scythe, katana) + the orb, then the bot cast (every bot a unique skill), then balance. The knock seam waits on the owner's which-knock decision. The round-ending stalls (shield+shield, the projectile mirrors — and since r58 the boomerang mirror's pair-annihilation pace joins the family) are DELIBERATE until the balance pass — no round timer, no escalation ramp, no shield fix. **Owed:** the sanctioned `measure.mjs` run on the owner's machine — the 484-cell re-run batched to cover `stall-r25`, `lengrow-r26→r28` and the whole skills pass — now through `links-r87`, which landed with NO proof run on record (#721) — in one go — and the DEFERRED BUNDLE: the spear-cell fingerprint gap, the law-3 resolver rework, seam-proof section G (stale since the halo contract, now also blind to the r54–r60 boomerang laws) and measure.mjs's 4s replica (drifted the same way). The kit-route rebuild must revive the arena bench (the frozen `pause-r20` page retired 2026-10-28; the owner holds a copy — its scratch generator/smokes were purged in a later clean, so the revival starts from GAMES.md's GAP RECORD).

New weapons arrive through the **commission pipeline**: an artist kit generated against staging → pasted into an artist session with the design brief → returns land in `deliveries/` → intake-audit against the pristine base → splice into staging → arena + sheet re-render → one batch landing (row-splice rebake via `.qa/bake-rows.mjs` → inscription gate → leadproof/flipproof → fingerprint ritual → gauntlet + suite → owner playtest). **That tooling was purged 2026-10-28 at the pre-balance checkpoint** — the kit, the brief, the paste ledger, the staging tool, `sheet-v2`, `redesign-preview`, `design-shots.json` and the rider-brief era, all retired VERBATIM (recover with `git show docs-precleanup:docs/CHRONICLE-archive.md`). The rebuild is owed at the next commission kickoff: it re-seeds from that archived text plus the landed canonical art, re-freezes an intake base, and must carry the placement/reach rules and `WDEF` published in GAMES.md's closed convention. **The roster is complete at 22 and the commission queue is empty.**

Every owner decision with its quote, every measured baseline, delta proof, reverted experiment and harness convention lives in **GAMES.md** (Current state · Measured facts · Testing recipe); retired material was removed from HEAD on 2026-11-11 (GAMES #733) and is recoverable from tag `docs-precleanup`. This README deliberately repeats none of it.

The point of the project is Phase 8: a real game, rendered into a video good enough to publish. Phases 0–7 exist to make that take days instead of months, and to guarantee the output is technically flawless.
| **[AGENTS.md](./AGENTS.md)** | **Start here (AI agents).** Loading order, standing rules, task→file map. With STATE.md (generated facts). |
