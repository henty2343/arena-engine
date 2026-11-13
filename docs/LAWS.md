# LAWS — the current standing game laws (quick reference)

Contains: the distilled CURRENT mechanical laws of SPINCLASH — what every weapon/skill/hit rule must satisfy.
Read when: before any sim or game-doc edit (the "before code" tier). Token cost: see STATE.md §Documentation cost.
Canonical for: the current-laws quick reference. Derived from `docs/GAMES.md` §Current state (the fuller design
record, with owner quotes and provenance); the two MUST agree — `tools/lint-docs.mjs` checks the drift-prone parts.
Platform rules live in `docs/SPEC.md`; agent workflow in `AGENTS.md`; mutable facts in `STATE.md`.

> These are the laws as of build `links-r87`. Retired rules are NOT listed here — they live in
> GAMES' dated entries (git history for older). If a law below conflicts with GAMES §Current state, stop and
> reconcile (that is a lint error), do not silently pick one.

## Battle structure

- **Best of 3 rounds**, first to 2 round wins. Video target: 1min+ of battle.
- **Per-round dice roll:** the seeded roll assigns each fighter a weapon from the 22-weapon roster;
  **duplicates allowed** (mirror duels are deliberate). Fixed draw order (2 weapon draws + 1 opening-spin
  direction draw + 2 launch draws per round), so `(seed)` fully determines a battle.
- **Stats reset every round** — each round is a fresh snowball; escalation is the series situation, not stat carry-over.
- **Rounds end on K.O. only** — no timer (owner decision). Stalls are watched, not "fixed" (open question).
- **1v1 only** (owner decision). A 3-man brawl is a wanted future mode; SPEC's match shape already allows up to four.
- **Hidden forcing:** the viewer sees the roll as random; `newGame(seed, {weapons})` forces a combo silently.

## Core contact law (owner 2026-10-16) — every weapon/skill/hit rule must satisfy all six

1. **Damage requires touch.** A bot takes damage only when the opponent's weapon overlaps its body disc; the drawn
   disc IS the collision circle (radius 64). Nothing else writes HP (walls, body-vs-body, spin growth never damage).
   **Since `allcut-r62` (owner 2026-11-02) the converse holds for EVERY weapon: a spine touching the body deals
   damage — launchers and the shield included.** (The old "projectile spines deal no damage" rule is RETIRED.)
2. **Parry requires weapon-on-weapon collision.** Only the blade-vs-blade gap triggers a parry; body proximity is
   irrelevant. Trigger = exact touch (surface gap ≤ 0); the 4px `parryPad` is hysteresis re-arm, not a gameplay window.
   **Flutter gate:** after a parry, the latch cannot re-arm for `parryGate` 16 ticks; contacts inside the gate stay
   solid but fire nothing. A blade touching a SHOT is a *swat*, not a parry.
3. **Weapons are solids to each other.** No tunneling, no interpenetration, on any rendered frame or between frames.
   A per-substep resolver de-overlaps along the true contact normal, kills approaching velocity, recoils spins on
   fresh contact. Substeps are sized so any real crossing spans ≥2 tests. **Disclosed RED:** the translation-only
   resolver has a fixed-point overlap band on crossed long blades (measured ~20.75px worst); the rotational-DOF
   rework is DEFERRED to the end of the skills pass. Nothing in the skills pass may depend on the resolver being correct.
4. **One damage per touch.** First touch deals damage once; no further damage while in contact; re-eligible only after
   the blade clears the body by the 12px re-arm margin. Blades pass through bodies (solid to each other only).
   **Deep-disengage gate:** re-arm also needs a genuine disengagement (peak clearance ≥ `reArmDeep` 85px) OR
   `reArmWait` 90 ticks out. **Since `allcut-r62` there is NO projectile exception** — every latched rising edge pairs
   a hit, launchers and shield included. A shot is consumed by the body it hits, so it can never double-damage.
5. **Parry recoils both weapons.** On a parry both spin directions flip; with law 6 the pair stays counter-rotating
   all round (growth preserves sign; zero-spin cannot occur). Any future exception must be a named, documented weapon trait.
6. **Counter-rotation from the bell.** Every round starts with the two weapons spinning opposite directions; one seeded
   roll decides fighter 0, fighter 1 gets the opposite. Rolled, not fixed per cast.

## Shot laws (the projectile system) — 1s–6s live; 7s RETIRED

- **1s** damage only on shot-touches-body (recomputed from the stored death pose).
- **2s** swats only on exact shot-blade touch (swats flip no spin).
- **3s** shots never overlap foe blade / foe body / rim / another shot at tick-entry poses (anti-teleport bracket).
- **4s** accounting — every fired shot has exactly one proven departure (landed / swatted / rim / cross / cleared at roll)
  or is still in flight at battle end; a shot vanishing without an event is the tunneling alarm.
- **5s** the substep budget audit (0 violations).
- **6s** launch doctrine — every launch recomputes to its hold-derived point (radial → tip; tangential → middle).
- **7s RETIRED at `allcut-r62`** — was "zero melee hits by projectile weapons"; every spine now cuts, so the counter
  survives as visibility only (`rangedMeleeHits`). See §Retired rules below.
- **Firing is physics:** one shot per full revolution (`fireAcc += |spin|·sdt`, releases at 2π) — spin rate IS fire rate.
  Shot damage snapshots the thrower's CURRENT damage at launch. The combo matrix is forced: 484 ordered cells × 8 seeds
  at the 22-weapon roster.

## Uniform base stats + growth (owner 2026-10-16 / 2026-10-28)

- **One uniform base for every weapon:** ω **3.5** rad/s, damage **1** (`WDEF`); hp **100**. Base damage 1 is explicitly
  a TEST ("just a test") — not to be re-tuned during the skills pass. Only on-hit growth moves spin/damage.
- **What differentiates a weapon:** length, drawn shape, hold, growth axis, special effects (shot behaviour) — not base numbers.
- **Growth, uncapped:** every damaging hit grows the attacker — the fighter's skill AND the weapon's trait both apply.
  The only ceilings are sim stability (`omegaCap` 140 rad/s, DORMANT — the real ceiling is structural: hp ÷ damage = 100
  hits → max spin 103.5). Fights are meant to get ridiculous.
- **Fighter skills (placeholder cast):** Speedy = +0.30 SPD per damaging hit; Heavy = +0.9 DMG per damaging hit.
  One skill per fighter per game. Cast stays at two until the bot pass.

## Weapon traits — the skills-pass laws

- **A weapon has a TRAIT; a fighter has a SKILL.** Always "weapon trait" / "fighter skill", never the bare nouns.
- **Weapon traits RESET every round** (owner law 2026-10-28) — no trait growth carries across a round boundary.
- **NO COMBOS / additive stacking only** (`nocombo-r34`): a skill may ADD on a shared axis, never reach into a trait's
  mechanic. Retired `skill.lenSteps`.
- **Trait = data, skill = contract hook.** The cheap pattern is a row field → ONE consumer site → one Tier-0 assertion
  (see `docs/RECIPES.md`). No general hook/plugin framework was built — do not add one.
- **Weapon-trait count and the open queue are design facts** — read them in `docs/GAMES.md` §Current state / `STATE.md`,
  not here (this file does not pin them).

## The slot/idx split (internalise before touching a fighter)

- `f.slot` = the SIDE (0 = left spawn, 1 = right). `f.idx` = the CAST IDENTITY (the row in `FIGHTERS`).
  **`G.cast[slot]` is the only map between them.**
- Slot-keyed: `SPAWN`, roll order, direction sign, `wins`/`winner`, `1 - f.slot`, `view`/`flashV`/`flipAnim`/`koStill.pose`,
  `C0`/`C1`, `fs[st.o]`, and **every event actor ref** (`by`/`to`/`o`/`winner`/`loser`).
- Idx-keyed: `COLS`, `TINTS`, `SKILL_SHORT`, `FIGHTERS[idx].skill`, `meta.fighters` — **including in the renderer**.
- **Event actor refs carry SLOTS** (every consumer is a slot-keyed array); a cast identity is recoverable as `G.cast[slot]`,
  the reverse is not. A slot/idx split must be audited in the renderer too, driving a canvas (`.qa/pair-proof.mjs` §I).
  They hold the same number under `DEFAULT_CAST=[0,1]`, which is why the fingerprint suite can never check any of it.

## Verification laws (how a change proves itself)

- **One canonical:** `previews/spinclash-preview.html`; its md5 must not move unless sanctioned + recorded.
- **Behaviour-identical edits prove fingerprints 8/8** vs `.qa/BASELINE` (`node .qa/fingerprint.mjs --compare`).
  8/8 can be VACUOUS — establish coverage before reading neutrality into it.
- **Tiered proof battery:** Tier 0 every landing; Tier 1 only if geometry moved; Tier 2 only on suspicion / end of pass.
  `measure.mjs` NEVER runs without the owner's explicit go. Judge health with `node tools/verify.mjs`.
- **No balancing during the skills pass** (no win-rate tables); the 484-cell re-run, resolver rework and spear-bearing
  fingerprint cell are deferred to the end.

## Retired rules (kept as provenance, NOT current)

The following rules were once live and were retired. They are recorded here so they never get "fixed" as bugs.
Full verbatim text is in git history; GAMES dated entries record the landings.

- **The projectile rule** (retired `allcut-r62`, owner 2026-11-02): formerly "a projectile weapon's spine deals
  no damage, only its projectiles do." Now every weapon cuts on body touch, launchers and shield included. The
  gate-free law is in `bladeVsBody`; `measure.mjs` keeps `rangedMeleeHits` as visibility only.
- **Former law 4 exception** (retired Phase A, GAMES #735, 2026-11-12): formerly "a projectile spine touching
  the body latches/shoves but emits no hit event." Now every latched rising edge pairs a hit.
- **Former law 7s clause** (retired Phase A, GAMES #735, 2026-11-12): formerly "zero melee hits by projectile
  weapons." Now every spine can hit; law 7s is removed from the live suite.

If you're tempted to "restore" any of these, stop — they were retired for reasons recorded in the dated entries.
