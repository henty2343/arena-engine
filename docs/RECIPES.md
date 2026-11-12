# RECIPES — add a weapon trait / fighter skill / bot

Contains: the step-by-step recipes for adding a weapon trait, a fighter skill, or a bot, plus stamp discipline.
Read when: you are adding a trait / skill / bot (task tier). Approx token cost: ~2.5k.
Canonical for: the landing recipes (moved here from README in Phase C). The mechanics they must respect are in `docs/LAWS.md`.

---

## Adding a weapon trait (or a fighter skill) — the recipe

The full axis list, consumer sites and guards live **in the canonical**, in the `TRAIT / SKILL
REGISTRY` comment block immediately above `const WEAPONS = {`. Read that first — it is keyed to
symbol names, not line numbers, so it cannot rot. This is the process around it.

**Step 0 — which cost class?** A trait that is a _number read at an existing site_ is **CHEAP**
(minutes). A trait that moves _geometry_ (drawn art or a covering) is **EXPENSIVE** (days), because
it needs per-step coverings re-baked through `.qa/lengrow-bake.mjs` with every row gated against its
own stretched art. Only the spear's `len` is in the expensive class so far. If your trait is
expensive, **stop and say so before starting** — that is a conversation, not a task.

**Cheap-class steps.** (1) add the field to the weapon row (`trait.*` / `shot.*`) or the fighter row
(`skill.*`) · (2) add **ONE** consumer line at the site that already handles that moment; if no site
handles it, that is a new seam — add it _there_, do not build a framework · (3) add a boot guard if
the value could break something silently (a division, an index past the baked rows, an unauthored
label) · (4) author `brief` (weapon) / `short` (fighter) if the new axis is not plain spin/dmg — the
derivation cannot express it and the guard will throw · (5) add an assertion to `.qa/seam-proof.mjs`,
**including one that proves the guard FIRES** by injecting a bad row · (6) update the REGISTRY block.

**Proofs — Tier 0 only unless geometry moved.** `.qa/seam-proof.mjs` (~5min) then
`.qa/lengrow-build-proof.mjs` (~60s); `chromecheck` if a label changed; `fingerprint.mjs` if the
landing is _meant_ to be behaviour-identical (an inert seam, a comment) — where 0 of 8 IS meaningful.
Tier 1 (`inscribe`, `bake --verify`, `leadproof`, `flipproof`) only if art, polys, coverings or scale
moved. Tier 2 (differential sweeps, cost, the 484-cell run) only on suspicion, or once at the end of
the pass.

**Traps that have already bitten, so you do not repeat them.** A _derived_ label silently prints the
WRONG text for any axis the derivation does not know — it did, for the spear, for a whole build. A
declared multiplier is not the realised one: `shot.mult` 2 realises as 2.15× and 4 as ~7×, because
more shots → more hits → more spin growth → more shots. A boot guard never proven to throw reads as
coverage and is worse than none. `emit()` looks like an event bus and is not — it is an append-only
log with no subscribers. **One field was being read two ways**, and only a non-default pairing could
show it: the `hit` event's `to` fed `flashV[e.to]` (identity-coloured) _and_ `koStill.pose[e.to]`
(slot-keyed, because `view[i]` is built by iterating `fighters[i]`) — identical while `idx === slot`,
aliasing two actors into one scratch entry the moment they differ. The same ambiguity sat on `st.o`,
read as `fs[st.o]`, `fs[1 - st.o]` and `G.fighters[st.o]` in three different places. **The rule that
came out of it: event actor refs carry SLOTS**, because every consumer is a slot-keyed array
(`measure.mjs` indexes `curW = [e.w0, e.w1]` with `e.by`); a cast identity is recoverable as
`G.cast[slot]` and the reverse is not. **And the general trap: a mechanism that ships inert under its
default is invisible to every standing suite that plays that default** — it needs a probe that runs
it non-default, or the suite keeps reporting a pass it is not entitled to. That trap fired for real
one landing later: `pair-r31` converted the sim's slot sites and **stopped at the renderer**, so the
VS poster and the shot sigils still read `COLS[i]` / `TINTS[i]` / `FIGHTERS[i]` / `COLS[st.o]` by
slot — 13 sites, all correct under `[0, 1]`, all wrong under `[1, 0]`, and invisible to fingerprints
(sim state only), to chromecheck's default section, and to a sim-level pair-proof alike. **The rule:
a slot/idx split has to be audited in the renderer too, and the audit has to drive a canvas.**
**Second lesson, about scanning itself:** cleanup #4 recorded that "exactly ONE top-level
declaration has no in-file reference". Wrong — `rect` (an art helper) has none either, and the scan
that cleared it counted bare tokens, so `g.rect(…)`, two `ctx.rect(…)` and the CSS `clip: rect(…)`
all read as references. **Token-counting a short identifier that is also a canvas method name and a
CSS function always yields a false "referenced"**; scan word-bounded and excluding property access,
and strip comments and strings before auditing reads.

## Adding a bot — the recipe (rewritten by `pair-r31`)

Before the pairing step this was a structural change; it is now a row edit plus a colour. **The
sim's identity assumptions are gone** — nothing left reads `1 - x.idx`, and `SKILL_SHORT`
already `.map`s over `FIGHTERS` (`LEN_CAP` was retired with `lenSteps` at `nocombo-r34`). What remains is _sizing_: seven arrays hold exactly two entries.

**The renderer is part of this, not an afterthought** — that is exactly where `pair-r31` left 13
slot-keyed reads of cast tables, and a third bot makes every one of them observable.

(1) add the `FIGHTERS` row — `id`, `name`, `skill` (the axes it owns), **`short`** (the authored
legend label; a boot guard throws without it), `line` · (2) **ask the owner for its colour** — a raw
cast fill for `COLS` and a ≥4.5:1 deep tint for `TINTS`; the six-colour frame economy is his call,
not the assistant's · (3) widen `COLS`, `TINTS`, `SPAWN`, `VIEW`, `flashV`, `flipAnim` and `C0`/`C1`
from two entries to N — `C0`/`C1` should become one array-of-buffers indexed by slot, since they are
the scratch the parry resolver and the hitbox overlay share · (4) pick the pairing, either
`DEFAULT_CAST` or `APP.setCast([i, j])` · (5) run `.qa/pair-proof.mjs` — it sweeps the foe invariant
and every event actor ref over pairings where `slot ≠ idx`, shows a new bot's skill travelling with
it via the damage-per-hit check, and its **section I** proves the VS poster names and colours the
actor rather than the half. With three cast members, also drive `APP.setCast` over all six ordered
pairings and eyeball the poster each time.

**Do not** add a cast-selection UI while N = 2 (the console lever is deliberate), and **do not**
widen those arrays speculatively for a bot that has not been chosen — the owner is allergic to
over-engineering, and step (2) is a conversation that has to happen first anyway.

---

**Stamp discipline.** A _visible_ landing bumps the build stamp; a behaviour-identical one does not.
The REGISTRY block landed under `seam-r30` for that reason — comments are not visible, and
fingerprints confirmed 0 of 8. **Clarified 2026-10-28 by `pair-r31`, which is behaviour-identical
(fingerprints 0 of 8) and DID bump the stamp:** "visible" means _observable by the owner_, not
"changes a pixel on load". `pair-r31` adds `APP.setCast([i, j])`, which he can call and watch the
fighters change sides, so a stamp reading `seam-r30` on a file that has the lever would mislead him
at the console. A comment-only or metadata-only landing still does not bump.

---
