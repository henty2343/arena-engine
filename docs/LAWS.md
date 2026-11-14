# LAWS — the current standing game laws (quick reference)

Contains: the distilled CURRENT mechanical laws of SPINCLASH — what every weapon/skill/hit rule must satisfy.
Read when: before any sim or game-doc edit (the "before code" tier). Token cost: see STATE.md §Documentation cost.
Canonical for: the current laws — this file is the SOLE AUTHORITY for them, for the weapon-trait count, and for which
probe checks each law. `docs/GAMES.md` §Current state is the fuller design record (owner quotes, provenance); where it
disagrees with this file, this file wins and the record is stale. `tools/lint-docs.mjs` checks the trait count and the
law-to-probe table below.
Platform rules live in `docs/SPEC.md`; agent workflow in `AGENTS.md`; mutable facts in `STATE.md`.

> These are the laws as of build `links-r87`. Retired rules are NOT listed here — they live in
> GAMES' dated entries (git history for older). If GAMES §Current state disagrees with a law below, this file wins:
> fix the record. The lint only checks the trait count and the table, so a prose conflict is found by reading, not by `verify`.

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
- **14 of 22 weapon traits landed** (8 remain: 7 melee blanks + the orb). This line is the pinned count that
  `tools/lint-docs.mjs` reads; README, AGENTS and GAMES §Current state are checked against it. The open queue and the
  per-trait history stay in `docs/GAMES.md` §Current state.

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

## Law-to-probe table

Which runnable probe checks each live law, and where its `measure.mjs` audit lives. Built by reading each probe's header
and assert labels. Every `file::anchor` item below is checked by `tools/lint-docs.mjs`: the file must exist and contain
the anchor text verbatim (so a renamed assert or a moved audit fails `verify`, not silently). The lint cannot judge
whether an assert really covers a law — that is the **Status** column, written by hand:

- **probed** — a runnable probe asserts it. **partial** — a runnable probe asserts part of it (see **Scope**).
- **owner-run only** — only `measure.mjs` audits it. Agents never run it, so no agent-runnable probe fails if the law breaks.
  The table says where the audit text is, not whether it last passed (GAMES dated entries record the sanctioned runs).
- **unprobed** — no assertion anywhere; at most `.qa/fingerprint.mjs`, which is a change detector for ALL laws on the
  default cast with no spear (it proves "did not move", never "is right") and so is not repeated per row.

| ID | Law | Runnable probe | Owner-run audit | Status | Scope |
|---|---|---|---|---|---|
| C1 | Damage requires touch (body disc = collision circle) | `.qa/inscribe.mjs::A poking circle fires hits across`; `.qa/leadproof.mjs::hit gContact` | `measure.mjs::contact law 1: damage only on weapon-touches-body` | partial | covering circles vs drawn art; hit recompute for lead-flag weapons only |
| C2 | Parry requires weapon-on-weapon touch | `.qa/inscribe.mjs::A poking circle fires hits across`; `.qa/leadproof.mjs::parry entry gap` | `measure.mjs::contact law 2: parry only on exact weapon-weapon touch` | partial | covering fidelity; entry-pose gap for lead-flag weapons only |
| C3 | Weapons are solids to each other | — | `measure.mjs::contact law 3: VISIBLE rendered interpenetration` | owner-run only | the disclosed RED band is stated in law 3 above |
| C4 | One damage per touch; re-arm gates | — | `measure.mjs::contact law 4: one damage per touch` | owner-run only | |
| C5 | Parry recoils both weapons | — | `measure.mjs::contact law 5: every parry recoils both spins` | owner-run only | `flipproof` checks the drawn flip, not the spin recoil |
| C6 | Counter-rotation from the bell | `.qa/pair-proof.mjs::rule 6 holds per SIDE` | `measure.mjs::contact law 6: every round opens counter-rotating` | partial | per side under every pairing, not swept over weapons |
| S1 | 1s damage only on shot-touches-body | — | `measure.mjs::projectile law 1s: shot damage only on shot-touches-body` | owner-run only | |
| S2 | 2s swats only on exact shot-blade touch | `.qa/leadproof.mjs::swat touch gap` | `measure.mjs::projectile law 2s: swats only on exact shot-blade touch` | partial | lead-flag weapons only |
| S3 | 3s shots never overlap blade/body/rim/shot | — | `measure.mjs::projectile law 3s: shots never overlap blade/body/rim/shot on a rendered frame` | owner-run only | |
| S4 | 4s every shot has exactly one proven departure | `.qa/seam-proof.mjs::DEPARTURE ACCOUNTING` | `measure.mjs::projectile law 4s: every shot accounted for` | partial | ricochet stars only |
| S5 | 5s substep budget audit | — | `measure.mjs::projectile law 5s: substep budget honored every tick` | owner-run only | |
| S6 | 6s launch doctrine (hold-derived launch point) | — | `measure.mjs::projectile law 6s: every shot is born at its hold-derived launch point` | owner-run only | |
| B1 | Best of 3, first to 2 round wins | — | — | unprobed | no assertion on the win threshold |
| B2 | Rounds end on K.O. only (no timer) | — | — | unprobed | |
| B3 | 1v1 only | `.qa/pair-proof.mjs::malformed casts are construction errors` | — | partial | cast-length guard only |
| B4 | `(seed)` fully determines a battle | `.qa/pair-proof.mjs::replay identically`; `.qa/fingerprint.mjs::FNV-1a` | — | partial | default cast, fixed cells vs `.qa/BASELINE` |
| B5 | Hidden forcing via `newGame(seed, {weapons})` | `.qa/lengrow-build-proof.mjs::the roll armed the spear fighter` | — | partial | spear cells only; other probes use it without asserting it |
| U1 | Uniform base: omega 3.5, damage 1, hp 100 | — | — | unprobed | change detector only |
| G1 | Every damaging hit grows the attacker (skill + trait) | `.qa/seam-proof.mjs::F1 every damaging hit grows`; `.qa/pair-proof.mjs::damage-per-hit = the weapon trait` | — | partial | dagger spin axis; damage per hit on the default pairing |
| G2 | Fighter skills: Speedy +0.30 SPD, Heavy +0.9 DMG | `.qa/seam-proof.mjs::Speedy stacks to 2.3`; `.qa/pair-proof.mjs::damage-per-hit = the weapon trait` | — | partial | Speedy via the dagger stack; Heavy via damage per hit |
| G3 | Firing is physics: one shot per full revolution | `.qa/seam-proof.mjs::CADENCE BAND LAW` | — | partial | bow only |
| T1 | Weapon traits reset every round | `.qa/lengrow-build-proof.mjs::the round transition resets lenStep to 0`; `.qa/seam-proof.mjs::traits reset every round (the LAW)` | — | probed | every growth axis with a probe: length, orb size, spin, cycle, rain |
| T2 | No combos: additive stacking only | `.qa/pair-proof.mjs::no skill reaches into a trait`; `.qa/lengrow-build-proof.mjs::no fighter carries lenSteps` | — | partial | the retired hook is gone; additivity itself via G1 |
| T3 | Trait = data, one consumer site | `.qa/seam-proof.mjs::GUARD FIRES: a new trait axis with no authored brief` | — | partial | boot guards only; "one consumer site" is a review convention |
| X1 | Slot/idx split | `.qa/pair-proof.mjs::every event actor ref`; `.qa/pair-proof.mjs::every cast-keyed table read is indexed by an IDENTITY`; `chromecheck.mjs::PAIRING section` | — | probed | fingerprints are blind to it (default cast), so these probes carry it |

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
