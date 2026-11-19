# RECIPES — add a weapon trait / fighter skill / bot

Contains: the recipes for adding a weapon trait, a fighter skill, or a bot, plus stamp discipline.
Read when: you are adding a trait / skill / bot (task tier). Token cost: see STATE.md §Documentation cost.
Canonical for: the landing recipes. The mechanics they must respect are in `docs/LAWS.md`.

---

## Adding a weapon trait (or a fighter skill)

Axis list, consumer sites and guards: the canonical's `TRAIT / SKILL REGISTRY` comment block immediately above
`const WEAPONS = {` (keyed to symbols, not line numbers). Read it first.

**Step 0 — cost class.** A trait that is a _number read at an existing site_ is **CHEAP**. A trait that moves _geometry_
(drawn art or a covering) is **EXPENSIVE**: per-step coverings re-baked through `.qa/lengrow-bake.mjs`, every row gated
against its stretched art. Only the spear's `len` is expensive so far. Expensive = **stop and ask the owner before starting**.

**Cheap-class steps.**
1. Add the field to the weapon row (`trait.*` / `shot.*`) or the fighter row (`skill.*`).
2. Add **ONE** consumer line at the site that already handles that moment. No such site = a new seam: add it there, no framework.
3. Add a boot guard if the value could break something silently (a division, an index past the baked rows, an unauthored label).
4. Author `brief` (weapon) / `short` (fighter) if the axis is not plain spin/dmg; the guard throws without it.
5. Add an assertion to `.qa/seam-proof.mjs`, **including one that proves the guard FIRES** by injecting a bad row.
6. Update the REGISTRY block.

**Proofs — Tier 0 unless geometry moved.** `.qa/seam-proof.mjs` (~5min), then `.qa/lengrow-build-proof.mjs` (~60s);
`chromecheck` if a label changed; `fingerprint.mjs` if the landing is meant to be behaviour-identical (0 of 8 IS meaningful there).
Tier 1 (`inscribe`, `bake --verify`, `leadproof`, `flipproof`) only if art, polys, coverings or scale moved.
Tier 2 (differential sweeps, cost, the 484-cell run) only on suspicion or once at the end of the pass.

**Traps (story: `git log -S` the tag; `pair-r31`, `shot.mult`, `cleanup #4`).**
1. **Author the label for any axis the derivation does not know.** A derived label prints the WRONG text; the step-4 guard throws.
2. **A declared multiplier is not the realised one.** `shot.mult` 2 realises as 2.15x, 4 as ~7x. Measure; never quote the declared figure.
3. **Prove every boot guard fires** (step 5). An unproven guard reads as coverage.
4. **`emit()` is not an event bus.** Append-only log, no subscribers.
5. **Event actor refs carry SLOTS, not identities.** Every consumer is a slot-keyed array (`measure.mjs` indexes `curW = [e.w0, e.w1]`
   with `e.by`); identity = `G.cast[slot]`. Slot-vs-idx reads of `hit.to` (`flashV[e.to]` vs `koStill.pose[e.to]`) and `st.o`
   (`fs[st.o]`, `fs[1 - st.o]`, `G.fighters[st.o]`) agree only while `idx === slot`.
6. **A mechanism inert under the default is invisible to every default-playing suite.** Give it a probe that runs it non-default.
   Audit a slot/idx split in the renderer too, driving a canvas (`COLS[i]` / `TINTS[i]` / `FIGHTERS[i]` / `COLS[st.o]` read by slot
   were 13 wrong sites under `[1, 0]`).
7. **Never audit references by counting bare tokens** (`rect` is also a canvas method and a CSS function). Scan word-bounded,
   exclude property access, strip comments and strings first.

## Adding a bot

A row edit plus a colour. Nothing reads `1 - x.idx`; `SKILL_SHORT` already `.map`s over `FIGHTERS`. What remains is sizing:
seven arrays hold exactly two entries. **The renderer is part of this:** a third bot makes every slot-keyed cast-table read observable.

1. Add the `FIGHTERS` row: `id`, `name`, `skill` (axes it owns), **`short`** (authored legend label; a boot guard throws without it), `line`.
2. **Ask the owner for its colour:** a raw cast fill for `COLS` and a >=4.5:1 deep tint for `TINTS`. The six-colour frame economy is his call.
3. Widen `COLS`, `TINTS`, `SPAWN`, `VIEW`, `flashV`, `flipAnim` and `C0`/`C1` from two entries to N. `C0`/`C1` should become one
   array-of-buffers indexed by slot (the parry resolver and the hitbox overlay share them).
4. Pick the pairing: `DEFAULT_CAST` or `APP.setCast([i, j])`.
5. Run `.qa/pair-proof.mjs` (foe invariant and every event actor ref over `slot ≠ idx` pairings; the new bot's skill via the
   damage-per-hit check; **section I** = the VS poster names and colours the actor, not the half). With three bots, also drive
   `APP.setCast` over all six ordered pairings and eyeball the poster each time.

**Do not** add a cast-selection UI while N = 2, and **do not** widen the arrays for a bot that has not been chosen.

---

**Stamp discipline.** A _visible_ landing bumps the build stamp; a behaviour-identical one does not. "Visible" = _observable by the
owner_ (e.g. `pair-r31` added `APP.setCast`: behaviour-identical, 0 of 8, and it DID bump the stamp). Comment-only or
metadata-only landings do not bump.
