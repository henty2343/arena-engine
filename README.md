# ARENA ENGINE

A localhost-only Node.js tool that turns a seeded game configuration into a finished MP4.

```
pick a game → set options → generate → watch it → download
```

No cloud, no accounts, no telemetry, no network calls after `npm install`. Binds `127.0.0.1` and writes files to `output/`.

**The purpose:** those MP4s get published to ad-supported platforms — YouTube, TikTok, Reels — and earn from the ads on them. The video file is the product; everything else in this repo is scaffolding to produce it. See the Purpose section at the top of `SPEC.md` before making any tradeoff.

**Requirements:** Node 22+ and VSCode are for the ENGINE, once Phase 0 lands — there is **no `package.json` yet**: ffmpeg, the canvas runtime and the fonts arrive with `npm install` when the engine's npm surface exists (`BUILD.md` Phase 0; `assets/fonts/` is a placeholder until then, NOT committed). The SpinClash harness (`chromecheck.mjs` · `measure.mjs` · `ingest.mjs` · `.qa/` · `scratch/`) is dependency-free and runs TODAY on bare Node.

---

## Read these

| | |
|---|---|
| **[GAMES.md](./docs/GAMES.md)** | **Read first.** Game design state: what exists, open questions, measured facts, test recipe. |
| [SPEC.md](./docs/SPEC.md) | The rules. Architecture, stack, pipeline, output specs, video-quality requirements, house style, studio UX, repo layout, what must never be introduced. |
| **[CONTRACT.md](./docs/CONTRACT.md)** | The interface a game implements. Services injected, what a game may not do, timeline shape, the eight compliance checks. |
| **[BUILD.md](./docs/BUILD.md)** | What to build next. Nine phases with pass/fail gates, the definition of done, and the full quality checklists. |
| [HANDOFF.md](./docs/HANDOFF.md) | **New agent: read after README.** The repo-organization laws: one canonical, asserted-patch method, static verification, token economy. Game/engine work state lives in the checkpoint below and `docs/GAMES.md`. |

If you are an AI assistant working on this project: read all five before writing code, and treat SPEC.md's rules as overriding any reasonable default you would otherwise choose.

---

## Starting a new chat — checkpoint 2026-11-10 (the magic era CONCLUDED — the wand's TRANSFIGURATION #710, the tome's TRIO #698, the scroll's EMBER SPILL #719; the MELEE PASS is ON — the flail's slot filled by THE LONG CHAIN `longchain-r86` #720 and REBUILT as THE ADDING-LINKS CHAIN `links-r87` #721; traits 14 of 22 — the 7 melee blanks + the orb remain; permanent laws since the last checkpoint: `allcut-r62` RETIRED THE PROJECTILE RULE — every weapon cuts on body touch, and `slowmo-r63` made the hit beat SLOW MOTION with the KO hard freeze kept)

Long chats die, so the work restarts in a fresh one. The repo IS the split now — the working-set
table below lists what a fresh session needs first; everything else is record or on-demand tooling.

**YOU ARE HERE** (written for the next session). Build **`links-r87`**, canonical md5
`99bb910d74d7390a435ce3354fb9320f`, **5,392 lines** — which REBUILT THE FLAIL'S GROWTH: THE
CHAIN GROWS BY ADDING LINKS, NEVER BY STRETCHING ART (GAMES #721, the owner's own invention —
*"i have invented the link stretch, just not documented it"*; recorded retroactively 2026-11-10:
every `every` 4 damaging hits ADDS one ring+bar link pair further out in S2's frame, at most
`max` 3 units — the uniform LEN_STEPS 12 cap consumed in 4-hit units; the grown flail has
np = 3+2n hinged particles and every added link re-uses its TYPE's baked covering (`circBySeg`) —
zero re-bake, the inscribe gate holds by construction; `chainGrow` returns the integer added-unit
count and stays the ONE growth read for sim + hitbox + art; REACH carries `ext.max × ext.px`; a
new boot gate requires `ext.max` to cover floor(LEN_STEPS/every); `FLAIL_CH.growMax` and the whole
pitch-stretch mechanism are DELETED; the `auditFl` stride widened 13→37 for the longer chain
poses; the haft and the head never scale; the nunchaku — no trait.len — never grows). It sits on
`longchain-r86`, which opened THE MELEE PASS: THE FLAIL'S TRAIT SLOT IS FILLED (THE LONG CHAIN,
GAMES #720, owner pick *"try and make the flail first"*: every damaging hit stretched the chain's
PITCHES — trait.len 0.025, uniform cap 12 steps, the ball's orbit +30% at the top; ONE factor
`chainGrow` read by sim + hitbox + art alike; rigid segment assemblies kept the coverage
bake-frozen — zero re-bake, inscribe PASS at every step; boot-gated by FLAIL_CH.growMax 1.39,
the ring-tip art-connectivity ceiling; the haft never scales; the nunchaku — no trait.len —
never grows) — **that pitch-stretch mechanism and its growMax ceiling are SUPERSEDED WHOLE by
r87's adding-links growth (#721); this sits-on entry is the historical record**. It sits on `emberfix-r85`, which made THE
COAL'S DEATHS READABLE
(GAMES #718: every non-bite death — expiry AND the silent cap ejection his eye caught as
*"fell through 3 and only took 2 damage"* — now breathes a warm-brown WISP, while a bite BURSTS
in gold; the pop test runs on every tick of the coal's life including its last; and THE POP GETS
THE SLOW-MO — the hit's own ¼× window + the victim's flash, *"i forgot to write that it wasnt
present"* — with pop/burn KILLS taking the KO hard freeze: every killing blow freezes; the
non-kill burn beats stay unslowed by design). It sits on the r84 tuning (GAMES #717), which made THE BIG FIRE burn faster (a beat
every 0.1s), BITE ON CONTACT (the entry edge bites the very tick the body touches it — stepping off
re-arms; the pool born on the hit victim bites on the spawn tick), and wear ITS OWNER'S CAST
COLOUR on every pool rim and coal bed (GAMES #717, his scroll×scroll read: *"impossible to tell all
the circles apart"* — the hex-mark precedent; measured 5.9 burns/pool). It sits on the r83 tuning
(GAMES #716, *"this is mechanic is good i think, we just need to tweak it"*): the pool (the BIG
spot) now bites repeatedly — every ~0.13s with a 110px reach, the pinned-javelin continuous read
without stealing the javelin's pin ("only the bigger spot"; the coals keep their one-shot pop) —
the spill halves its cadence (every 30 ticks → 14 at the cap) and scatters on a RANDOM DISC
around the meteor, not in a tail, and the fading coal's bite is VISIBLE (the pop bursts: flash
ring + five sparks, 0.18 alpha fade floor — the bite never faded, the read did). It sits on
KINDLING / THE EMBER SPILL (GAMES #715, owner: *"the metoer/projectile as it travels through the
arena it 'spills' out af few embers, which lasts for a few secs and if the opponent touches then
they take damage"* + THE GROWTH BRAKE: *"growth only happens when the meteor hits the target, not
when the target steps on the embers"*): every scroll spell sheds burning coals IN FLIGHT (a
birth-snapshot cadence, 14 ticks → 6 at the stack cap); each coal lands with a flare, burns a few
seconds (2.5s → 4.1s on stacks, snapshot at the drop) and POPS under the foe — one honest bite,
the coal consumed, honest kills; a pop grows NOTHING (the pool's burns-grow-nothing twin); cap 14
live coals, oldest dies young; the roll clears; a ZONE not a status — no ring, no grow, no hex.
THE SCORCHED LANE (`lane-r81`, #714) was REVERTED WHOLE at his eye (*"no i dont like that either…
we need something visual/spectacular"*) — the scroll's SECOND revert scar after the called fall;
its machinery is retired whole. The shot payload is UNTOUCHED, on top of THE BURNING POOL (GAMES
#712–#713: r 62, 4.5s of life, breathing heart + flame ring + two ≤0.10-alpha heat-shimmer rings):
the scroll's cast is the family spell projectile again (the visible projectile, row byte-identical
to pre-r78), and every damaging scroll hit leaves a burning pool where the victim stood — 3s of
amber/orange/gold fire with a char rim and ember motes (never gray, never red), cap 6 on the
floor; stepping in burns a beat every 0.2s (quarter-damage snapshot, honest kills) — a ZONE, not
a status: no ring slot, no grow, no hex. THE CALLED FALL (meteor-r78) was REVERTED WHOLE at his
eye (*"we need to see a projectile"*) — the scroll's first revert scar. It sits on
THE FAMILY FLIGHT LAW (owner
ruling 2026-11-02: *"from now on all magic/spell users should adopt the same mechanig as wand
currently have, it looks good"* — GAMES #701): THE HEX IS WHAT MAGIC DOES. Every `shot.hex` row
(wand, tome, scroll, staff — the orb weapon is a sentinel; steel flies straight) is born bent and
hunts the hexed, on the wand's blessed ladder DERIVED off the row's own speed ÷ HEXFAM.ref 800
(base 0.9 + 0.15 × min(shotStep, TURN_STEPS 10)): one radius language family-wide (~889px birth
arc, ~333px hunt floor at the cap — the never-orbit wall by construction), and the wand
BIT-IDENTICAL (k = 1 exactly; smoke-r65 re-proved byte-identical). The grow() counter gate now
reads `shot.hex` itself — retiring `trait.turn` had silently dropped the wand off its own counter
(the discovery, disclosed in #701: when retiring a field, hunt its CONSUMERS). trait.turn +
shot.turn are RETIRED (boot guards throw); hex ⊥ returns/ricochet/pin/skewer. The victim wears the
mark in the ATTACKER's colour and the comet trails ride (the r65 renderer was row-generic as
written); the tome KEEPS its TRIO (flight × payload orthogonal). **THE WAND'S TRAIT SLOT IS FILLED — TRANSFIGURATION / THE BLOOM
(`bloom-r73`, GAMES #706)**: every damaging wand hit turns the struck weapon into a joke object
that does nothing at all for 3s (the body stays alive; re-hits extend under a 6.0s cap; 2s
immunity after the poof; six joke objects rotate slow and tangential, grip-anchored so they
touch the body and ride the sweep tangential like held weapons — at 0.35 of tempo, so viewers
read them; the object touching the rim shakes the joke off early, and only a natural expiry
carries the 2s silence). The wand trait journey concludes here (#710). Two revert scars sit before it: the grudge
(r70→r71) and the whip-crack flick (r72→r73, *"it reminds too much about the other spells"*).
The prior experiment `wordform-r67` (THE WORD REFORMS — the launcher-action menu pick A, built
revert-ready at his *"im not completely convinced"*) was REVERTED WHOLE at the same word that
ruled the family law (#700 — canon re-proven byte-identical to `affinity-r66` before r68 landed;
the headless finding: reformed pages mostly re-crossed to the rim — denial-resistance, not landed
action). It sits on
THE TOME TRIO (`affinity-r66` — the 2026-10-28 ruling executed — GAMES
#698): the pages cycle POISON → FROST → FIRE. Halo pages stack a biting DoT (cap 5, 0.35×stacks hp
per 40 ticks, 8s); nova pages chill the whole tempo (sweep + movement + cadence, 7%/stack, FLOOR 0.6
— never a full lock, 6s); vortex pages swell at birth (linear off the shared counter, capped ×1.9 —
element-gated, poison/frost pages never swell). THE SUSTENANCE LAW: any page hit refreshes both
curses, the element's own page deepens (the first smoke caught the strict cycle self-diluting).
THE SLOT LAW + THE RING GRAMMAR are the owner's design (one DoT slot + one debuff slot; one ring
design — colour=which, thickness=depth, pulse=tempo beating INWARD, cap=the MAXED inner bleed; the
BUFF slot is reserved outermost for the coming healing — he will design the generic ring himself
and show us). Round-reset applies; no new rng draws; non-tome matches bit-identical (regressions
byte-identical). Rates PROVISIONAL — his eye pending. The prior build `hexspark-r65` landed THE HEX
on the wand (EYE-BLESSED: *"i watched it and i like it a lot"*) — the owner's excitement pick out
of a five-option menu, reframed by his identity question — homing as SPITE, not guidance): the
birth bend keeps turn authority (1−h), a LIVE SEEK toward the hexed foe gets h = min(shotStep,
TURN_STEPS)/TURN_STEPS, so the whole air turns hostile at once when the hex deepens; authority is
conserved ⇒ the never-orbit law (333px radius floor) holds by construction; h=0 is the r62 bend
byte-for-byte; no new rng draws. The victim WEARS the counter (a pulsing ring in the attacker's
colour — renderer-only) and hex sparks trail comets (renderer-only, `TRAIL_N` 0 disables). Rates
PROVISIONAL, damage unchanged — the owner's eye verdict pending (GAMES #697). The prior build
`flagfix-r64` RESTORED THE THREE FLAG LAWS (the r61 bendspark comment had swallowed the
ricochet/pin/skewer birth spreads at both launch sites — stars/nails/skewer dead r61→r63; the
slow-mo exonerated 16/16; the winner overlay's frozen wall-FX fixed — GAMES #696). **THE HIT BEAT IS SLOW MOTION** (owner
2026-11-02: *"i want to change hitstop to do a brief slowmotion instead, hitstop seems laggy
sometimes, when quick multiple hits occur"*; ruling: *"keep ko hard freeze, and make the slow mo
nice and smooth"* — GAMES #695): a non-kill damaging hit opens a SLOW-MOTION WINDOW —
`CFG.hitSlowMs` 150 (wall-clock anchored: FF shortens it, the 's' mode stretches it) at
`CFG.hitSlowRate` 0.25 (the proven 's'-mode rate — v0.8.2's interpolation was built for it).
Windows max-merge, NEVER stack — a hit in slow refreshes the window, so a dense exchange reads as
one sustained intensity slow; the slideshow class is structurally gone because the sim keeps
living inside the beat. The KILL beat KEEPS its hard freeze (`koStopMs` 400 — the koStill latch +
winner overlay are built around the hold). Smoothness by construction: the expiry frame BLENDS
(no seam), interpolation stays live (pose blend, never steppy), and the tick loop never breaks on
a fresh window (no queued tick is ever dropped). Wall-time FX live in slow inside the window
(`fxRate`), hold in the KO freeze. Frame-loop layer ONLY — the sim never reads `slowTicks`/`fxRate`,
fingerprints untouched by construction; `hitStopMs` 60 DORMANT (one branch returns it). The
chromecheck caught a real bug the headless boot could not (missing `let slowTicks` — the loader
stubs rAF): frame-loop edits are chromecheck-visible or they are untested. Chromecheck PASS with a
three-class frame recorder: 125 slow / 13 frozen / 1,702 full frames on the hit-dense cell, both
passes completed, zero errors. **THE WAND CAME OFF PARK** at the owner's excitement brief (*"i
need it to be more exciting… people can easily tell ok now they are very op… there is no real
exciting snowball either"*): the menu served was A angry swarm (split-on-hit) · B hunting curse ·
C echo ritual (delayed ghost recasts) · D molasses hex (victim-side slow) · E rune wall, plus the
comet-trail garnish; he picked **B**, and his identity question (*"people understand it if the
weappn was a heatseeking missile, but i wand do they connect that with homing spell ?"*) reframed
it as **THE HEX** — `hexspark-r65`, the law above (GAMES #697). The r63-era park menu (comet pass
/ lottery bend / wobble-vs-spiral / speed ~600) is superseded; its comet garnish folded into the
landing. **THE TOME TRIO** (`affinity-r66`) then executed the sealed 2026-10-28 ruling — see the
YOU-ARE-HERE lead and GAMES #698 for the full law (slot model, sustenance, rings, proof).
**THE FAMILY FLIGHT LAW** (`hexfam-r68`) answered the launcher-action frustration as a CLASS law
(the inevitability ledger: tome/staff/scroll owned no guarantee axis; the wordform experiment
`wordform-r67` — menu pick A — was built revert-ready, headless-showed reformed pages mostly
re-crossing to the rim, and REVERTED whole at the owner's word, #699–#700): the wand's hex
mechanic became what MAGIC DOES — all four spell rows born bent and hunting on the derived ladder,
the wand bit-identical, its trait slot OPEN for the crown discussion; GAMES #701 carries the law,
the grow()-gate discovery and the full proof. The prior
landing **`allcut-r62`** was ALLCUT — EVERY WEAPON CUTS ON BODY TOUCH: bladeVsBody's gate
`if (W.shot || W.hold === 'tangential') return;` deleted (the projectile rule 2026-10-19 + the
shield's 'parries only' clause retired together — the audit: those were the ONLY exemptions);
launcher spines chip at the WDEF base damage 1 and feed EVERY shared growth counter — the
shield's `trait.dmg` 0.7, inert since birth, fired for the first time ever; measure.mjs aligned
(edited, not run; law 7s retired); the same landing carried the owner's r61 eye: bend base
0.35→0.9, growth 0.085→0.15 (ceiling 2.4 ⇒ radius floor 333px), spark r 6→8 (GAMES #694). Before
that, **`bendspark-r61`** landed THE WAND'S BENDING SPARK itself (first `trait.turn` axis,
per-throw rng sign drawn only for bent rows, replica-twin isolation 14/16 — GAMES #693). **The boomerang is DONE****The boomerang is DONE** (*"ok boomerang is done for now"*; the r58 eye verdict
was *"so it looks good now"*). **Its settled law:** THE CATCH IS THE LOOP'S ONLY OWNER-SIDE END
and it rethrows **INSTANTLY** (`RETHROW_WAIT` 0 — the r54 beat dormant in the constant, one
number from returning; killShot banks the revolution at every returns death); blades pass through
with no effect; enemy projectiles **DIE on its drawn arc** while it flies on; LOOP MEETS LOOP
**BOTH ARE DESTROYED** on their drawn arcs; SAME-BOT pairs pass through each other (the game-wide
owner-blind law — the owner's stated intent for a future multi-loop balance); the hitbox IS the
drawn arc INCLUDING its tumble; the held art draws ALWAYS; a caught loop rides home on the 0.25s
settle ghost; PURE-TOUCH catch with the arc-aware arm (no departure-tick self-catch); cycle growth
on the catch; PURE-CHAOS throws on the frozen arena-centred world orbit (b 70); r38 SINGLETON —
one loop per bot in the air. **The javelin's settled law:** STUCK at the hit → the
JAVELIN'S-DIRECTION carry with the sink to the centre and the ZERO-TURN facing → forward-only
NAIL DRIVE along the flight line; no bleed while carrying. **Traits 14 of 22 — 8 remain** — the count is GAMES.md's (#719's blanks minus the flail's #720):
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
which is where `pair-r31` got it wrong: the poster loop's `i` is the *half* (a slot) and `st.o` is a
slot, so every cast-table read there must go through `G.cast`. They hold the same number under
`DEFAULT_CAST = [0, 1]`, which is why the landing looked behaviour-identical — **and why the
fingerprint suite can never check any of it.** Run `.qa/pair-proof.mjs` (sections E, F and **I**)
after any edit near those fields; section I drives the real frame loop against a recording canvas
and statically audits all 27 cast-table reads in the file (`LEN_CAP` left the audited list at
`nocombo-r34` with the table itself).

**NEXT, in the owner's order: a unique TRAIT for each of the remaining 13 weapons (9 of 22 landed), then the bot cast
(every bot a unique skill), then balance — additive stacking only, NO unique combos.**
The pattern to copy is `shotR` — a row field → **ONE** consumer site → one assertion in a Tier-0
proof (~6 sim lines plus 3 renderer lines, no bake). (`lenSteps` was the original cheap-pattern
exemplar and was RETIRED at `nocombo-r34`: a skill may add on a shared axis, never reach into a
trait's mechanic.) For a CHEAP axis the assertion's
house is `seam-proof.mjs` — its shotgrow section E is the template (`shotR` was ~6 sim lines plus 3
renderer lines, no bake). After any skill or bot landing run
`.qa/seam-proof.mjs` (~5min) then `.qa/lengrow-build-proof.mjs` (~60s); add Tier 1 (`inscribe`,
`bake --verify`, `leadproof`, `flipproof`) **only if geometry moved**.

**More bots is now cheaper, but not free.** The pairing step removed the sim's 1v1 *identity*
assumptions; it did not remove its 1v1 *sizing*. A third bot is a `FIGHTERS` row + **an owner-chosen
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
landings, parry shoves and bounces) and needs a decision about *which* knock before it can be a row
field. A general hook/plugin framework was deliberately **not** built — do not add one.

**The working set — what a fresh session reads first** (repo paths; the repo itself is the
working set, and `previews/` is the only canonical):

| file | why |
|---|---|
| `previews/spinclash-preview.html` | the canonical game — the ONLY canonical. md5 **`99bb910d74d7390a435ce3354fb9320f`**, build **`links-r87`**, **5,392 lines**. Start at the `TRAIT / SKILL REGISTRY` comment block above `const WEAPONS = {`. The spear grows `len: 0.0959` per damaging hit over a **12-step** ladder of per-step re-baked coverings in the marked `LEN_CIRCLES` block (regenerate with `.qa/lengrow-bake.mjs`; never hand-edit). The cap is **uniform at 12 (+200.1%, `REACH.spear` 505.488) for every holder** — `skill.lenSteps` (the `skill-r29` carrier era: 18 steps, +420%, REACH 829.571, carrier Speedy by measurement) was **RETIRED at `nocombo-r34`** under the owner's NO COMBOS ruling: a skill and a trait may stack only by addition on a shared axis. `seam-r30` added the two seams the remaining weapons need — an authored `brief` per row and an **inert** shot-cadence multiplier (`shot.mult` / `skill.shotMult`), both boot-guarded. Per-build history r33–r57 lives in GAMES.md's Measured facts (#645–#695) — the README no longer duplicates it (its own stated law). The flail now grows by ADDING LINKS (`links-r87`, #721): `FLAIL_CH.ext` { unit 28, every 4, max 3, ring 3, bar 4 } — one ring+bar pair added per 4 damaging hits, max 3 units (LEN_STEPS 12 / 4); np = 3+2n hinged particles; every added link re-uses its TYPE's baked covering (`circBySeg`) — zero re-bake; `chainGrow` returns the added-unit count; boot-gated (`ext.max` must cover floor(LEN_STEPS/every)); REACH carries `ext.max × ext.px`; the r86 pitch stretch + `growMax` are retired. |
| `docs/GAMES.md` | the record: every owner decision with its quote, every measured fact, the test recipe. Its md5 moves with every edit — never pin it |
| `measure.mjs` (repo root) | the sanctioned instrument — owner-gated (standing rule 2); no md5 pin, the repo copy is the only copy. (`--band-dump` added 2026-10-28 plus the corrected law-3 disclosure text; both report-additive — the flag is proven byte-identical with it off). **Never runs without the owner's explicit go** |
| `README.md` (repo root) | this file |
| `docs/SPEC.md` | platform rules; overrides any default you would reach for |
| `docs/CONTRACT.md` | the interface a game implements |
| `.qa/fingerprint.mjs` | behaviour-identity proof |
| `.qa/seam-proof.mjs` | **Tier 0 — live verdict 47/55 passed, 8 retired, 0 failed** (the Item-3 stale-proof triage, 2026-11-11: the re-seeded cells are proven falsifiable by a **9/9**-cell non-vacuity mutation test — honest **9/9, NOT 10/10**, session 3's false 10/10 claim superseded; GAMES.md #724/#725) — proves the skill seams are live (not dead code), the staff's orb-growth axis (section E: exact birth radii over a full battle, per-fighter independence, the round-reset LAW, other launchers untouched), the dagger's spin-growth law (section F: exact per-hit \|spin\| growth across 9 forced battles, the round-reset LAW, melee-axis exclusivity), the boomerang's Loyal Halo + cycle-only catch growth (section G, halo-r39: the birth-snapshot law exact over 894 births, the shape-scale lock over 37,216 in-flight checks, cap saturation at exactly 1.2^10 — **the halo family is RETIRED as of 2026-11-11 by the Item-3 stale-proof triage: the LOYAL HALO was retired whole at `touchorbit-r53`, so those cells now print RETIRED — printed and counted, never silent — and the G4 crash is fixed, so the H and I law sections run again**; the reset LAW, the wand untouched), and that all the boot guards actually FIRE. [The r38 rewrite is parked at `scratch/boomvars/seam-proof-freeloop-r38.mjs`] |
| `.qa/fp-multgrow-r42.json` | the standing baseline — 8 cells, must stay 8/8 (adopted 2026-11-01 when `multgrow-r42` moved **exactly 2 of 8 on purpose** — the two bow cells, both flipping timeout → DECIDED; the other six bit-identical including both naturals; md5 `ba86790e5b3bad73098d5220b61114b4`; it takes this slot from `.qa/fp-ricolaw-r41.json` — adopted when `ricolaw-r41` moved exactly 1 of 8 (the forced boomerang+shuriken s1 cell, the second consecutive 1-of-8; the other seven bit-identical as the isolation proof; md5 `9cad6490263257fd64bb41789a4b8a1f`) — which took it from `.qa/fp-bouncegrow-r40.json` — adopted when `bouncegrow-r40` moved exactly 1 of 8 (the same cell), md5 `e6a451486444f865ece08a93f9511d95`, a historical record after a lifespan of one landing — which took it from `.qa/fp-halo-r39.json` — adopted when `halo-r39` moved **exactly 2 of 8 on purpose** (the forced boomerang+shuriken s1 cell and natural s7, the third consecutive landing with exactly the boomerang-bearing cells moving), md5 `23049cd9c327590c55e15d69a9c18d31`, now a historical record — which took it from `.qa/fp-returngrow-r37.json` — which re-stood through the r38 reject-and-revert at a proven 8/8 — with `.qa/fp-freeloop-r38.json` (md5 `433702dd369036c4439c63ae638f335a`, 2/8 at the rejected landing) a historical record alongside `.qa/fp-spingrow-r36.json` (1/8), `.qa/fp-bindfix-r35.json` (8/8, sanctioned) and `.qa/fp-shotgrow-r33.json` (1/8). History: when `returngrow-r37` moved **exactly 2 of 8 on purpose** — the forced boomerang+shuriken s1 cell and natural s7, which rolls the boomerang: the FIRST natural cell a growth trait has moved — and left the other six bit-identical; md5 `2317ddeb32af6fdd220ccd2d973d220d`; it takes this slot from `.qa/fp-spingrow-r36.json` (1/8 at the dagger trait), `.qa/fp-bindfix-r35.json` (8/8 moved at the bind fix, sanctioned) and `.qa/fp-shotgrow-r33.json` (1/8 at the staff trait — the first baseline that covered a growth axis; the suite **can see** all three growth traits now). Its predecessor stood through seven consecutive 0-of-8 builds (`lengrow-r26` → `review-r32`), the first four of them **vacuous** (blind to the spear — `r28` triples the spear's length and `r29` gives one fighter a 5× spear, all 8 hashes bit-identical; `r29` also shows fingerprints **cannot** cover a ladder raise even in principle — `REACH` is a per-weapon table, so a taller ladder changes every spear battle's substep budget). Two blind axes survive: the suite never rolls a spear, never crosses two shots, and plays `DEFAULT_CAST` only, where `slot === idx`, so no cell can ever exercise a swapped pairing — that is `.qa/pair-proof.mjs`'s entire reason to exist (and `review-r32` proved the point the hard way: a real renderer bug 8/8 could not see) |
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
`.qa/lengrow-proof.mjs` (~3s, read-only) stays as the coverage probe for a *uniform* stretch: it
is the measurement that ruled that route out. **`.qa/seam-proof.mjs`** (~2s, Tier 0) is the newest
and the one a fresh session should run first after any skill or bot landing: it proves the seams are
live and, more usefully, that the boot guards actually throw.

**Tier 2 — only if the task needs it:** **`.qa/pair-proof.mjs`** (~27s, Tier 0, read-only, **37/37**, its re-seeded balance-aware tripwire proven **FALSIFIABLE 6/6** — the pairing step's only probe, and the one instrument that runs a pairing where `slot ≠ idx`, which the fingerprint suite cannot do in principle. **Section I drives the RENDERER**: a recording canvas stub captures the VS poster's `fillText` while the real frame loop is hand-stepped, and a comment-aware tripwire audits all 23 cast-table index reads in the file. It is **proven to fire** — against the pre-fix `pair-r31` canonical it reports 4 FAILs and names all 13 offending sites. **Promote it to Batch 1 the moment bots are added**, because every bot landing edits the fields it sweeps. It asserts its own sample sizes, so a future stall fails loudly instead of passing on zero observations) · `chromecheck.mjs` (~26s render/clock check **+ a pairing section**: it drives `APP.setCast([1, 0])` and asserts the scorebug names, identity swatches and legend rows exchange sides together, the slot-keyed score stays put, and the winner overlay names the ACTOR — the only coverage of the chrome's pairing path, since `pair-proof` loads the sim block alone) ·
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

**Committed, but NOT part of the working set:** `docs/HANDOFF.md` (the repo-organization laws).
The former `docs/CHRONICLE-archive.md` is recoverable via `git show docs-precleanup:docs/CHRONICLE-archive.md`.

**Standing rules, all of them enforced by the owner:**

1. **Discuss before writing.** Analysis and proposals first; nothing enters docs or code until he says go. Analysis-only turns are normal.
2. **`measure.mjs` never runs without his explicit go** (2026-10-19, "dont run measure.mjs. (atleast not untill i say so, ever. ask if you want to)"). Long runs belong on *his* machine — the sandbox is 2-core and `--jobs` buys nothing there.
3. After any GAMES.md edit: **`docreflow` FIRST, then `navgen`**. Both are idempotent and self-proving.
4. A behaviour-identical edit must prove **fingerprints 8/8** vs `.qa/fp-multgrow-r42.json` (the standing baseline since 2026-11-01; it took the slot from `fp-ricolaw-r41.json`, and the full take-over chain with each adoption's move count lives in the working-set table's baseline row — every earlier `fp-*.json` is a superseded historical record and proves nothing about the current build), and the canonical's md5 must not move unless the change is sanctioned and recorded. **Caveat proven by `lengrow-r26`, and then proven three times over by `r27` and `r28`: 8/8 can be VACUOUS.** All three moved 0 of 8 and all three are behaviour-affecting — the suite never rolls a spear and never crosses two shots, so a green run only covers what the eight cells actually exercise. `r28` triples the spear's length and leaves all eight hashes bit-identical, which is the sharpest demonstration available. The flip side landed at `shotgrow-r33`: an axis the suite CAN see shows its delta surgically — 1 of 8 moved, exactly the staff cell, which is itself the proof the other 21 weapons did not move. Establish coverage before reading neutrality into it, and prove the change directly instead.
5. He **playtests personally** and reports symptoms; reproduce headlessly at the same seed before patching.
6. Terminology: a fighter has a **SKILL** (platform term, never move it), a weapon has a **TRAIT**. Never the bare nouns — always "fighter skill" / "weapon trait".
7. Balance rulings in force: base damage 1 vs hp 100 is "just a test" · **parry rewards nothing** · round-ending stalls are **deliberate until skills** (no timer, no ramp, no shield fix) · max weapon length = the spear's, floor 54 boot-gated. `dmg` 0.3 on the spear stays **provisional** and is not to be re-tuned against its growth rate.
8. **WEAPON TRAITS RESET EVERY ROUND (2026-10-28).** *"i dont like this at all, each round weapons traits should reset."* This ratifies shipped behaviour (`rollWeapons` already zeroes spin, dmg and `lenStep` each round) and binds every future skill: **no special may carry trait growth across a round boundary.** A special must express itself within a round — higher ceiling, faster rate, different trigger, different effect. It killed the first proposed special skill outright. Note also that any weapon-trait-hooked skill is roll-conditional at ~4.5% of rounds (uniform 1-of-22 draw), so it must be big to be worth having.
9. **THE PROOF BATTERY IS TIERED, NOT PER-LANDING (2026-10-28).** *"i really dont think all this testing is nescessary, we are adding a lot more skills and bots, so if you do this each time its going to take forever."* **Tier 0, every landing (~1 min):** boot probe + `.qa/lengrow-build-proof.mjs` + `chromecheck` only if a label changed. **Tier 1, only if geometry moved** (art, polys, coverings, scale): `inscribe.mjs`, `lengrow-bake --verify`, `leadproof`, `flipproof`. **Tier 2, only on suspicion or once at the end of the pass:** differential sweeps, cost measurements, fingerprints. Entries get **shorter** too — what changed, the numbers that matter, what is owed. Not cut: a measurement that can **change a decision** (the `skill-r29` carrier pick falsified the obvious choice in five minutes — that is design, not verification).
10. **NO BALANCING DURING THE SKILLS PASS (2026-10-28, after playtesting `lengrow-r28`).** *"i think we should hold back on re run, all the stats you keep delivering about other weapons etc, i know its unbalanced etc, we are not trying to balance the game at all right now, we are making the skills/mechanics, a new balancing will come afterwards."* So: the **484-cell re-run**, the **rotational-DOF resolver rework** and the **spear-bearing fingerprint cell** are all deferred to the END of the pass (confirmed by the owner), which then closes with **one** new fingerprint baseline instead of two. Law 3 stays RED and disclosed meanwhile, and **nothing in the skills pass may depend on the resolver being correct**. This binds reporting too: no per-weapon win rates, no holder-win% tables, no damage-vs-growth re-measurement. A Measured-facts entry records **mechanics** — what the code does, what it costs, what is proven. The only sweep that stays legitimate is the *"does this mechanic work"* differential, reported as works / does-not-work.

**Where the work stands.** The 484-cell baseline is complete (3,872 battles, 7,891 decided rounds,
all integrity counters clean) and `measure.mjs` now attributes both live reds instead of only
sizing them. Skills-pass doctrine is **already settled and recorded in GAMES.md — do not
re-litigate it**: trait = data / skill = contract hook, stacking adds, skills as authored legend
labels, authorized hook targets, `omegaCap` left dormant, elementals yes but design deferred,
axis placement "designed out", parry forbidden as a skill reward, cast stays at two (Speedy
+0.30 spin, Heavy +0.9 dmg).

**Owed, in order:** (1) **Nothing structural from the skills pass's own build steps — they are
all IN** (the spear's length growth at +200% with the uniform 12-step cap, the two `seam-r30`
seams, the pairing step, and NINE weapon traits; the pass continues with the remaining 13). The
full build history and its measurements live in GAMES.md (the *Length growth — the spear's trait*
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
coverage gap — now TWO blind axes. **DEFERRED to the end of the skills pass** (the pass moves hashes anyway, so it should close with one new baseline, not two).** The standing baseline — `.qa/fp-multgrow-r42.json` since `multgrow-r42` (2026-11-01), `.qa/fp-ricolaw-r41.json`, `.qa/fp-bouncegrow-r40.json`, `.qa/fp-halo-r39.json`, `.qa/fp-returngrow-r37.json` (re-stood through the r38 reject+revert), `.qa/fp-spingrow-r36.json` and `.qa/fp-bindfix-r35.json` before it — is blind to the shot-cross path (though `ricolaw-r41` put crosses at the centre of the star law — seam H5/H6 cover what the suite cannot); and `lengrow-r26`/`r27`/`r28` proved it is **also blind
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
in the canonical's own comment block, and then *passed* by re-baking rather than by thickening.**
Part 5 is not needed — mechanism B was 0. **And the first special skill — `skill-r29`,
58/58 in `.qa/lengrow-build-proof.mjs`, all 18 baked steps gated on their own art, house gate exit 0,
leadproof / flipproof / chromecheck PASS, rows 1-12 byte-identical to `r28`, fingerprints 0 of 8.**
**(Retired at `nocombo-r34`, 2026-10-31 — uniform cap 12, rows 13–18 purged, `REACH.spear` 505.488;
proofs now build-proof 57/57 with section O the uniform-cap proof, `--verify` 12/12, fingerprints
0 of 8 and spear-blind as ever.)**

---

## Adding a weapon trait (or a fighter skill) — the recipe

The full axis list, consumer sites and guards live **in the canonical**, in the `TRAIT / SKILL
REGISTRY` comment block immediately above `const WEAPONS = {`. Read that first — it is keyed to
symbol names, not line numbers, so it cannot rot. This is the process around it.

**Step 0 — which cost class?** A trait that is a *number read at an existing site* is **CHEAP**
(minutes). A trait that moves *geometry* (drawn art or a covering) is **EXPENSIVE** (days), because
it needs per-step coverings re-baked through `.qa/lengrow-bake.mjs` with every row gated against its
own stretched art. Only the spear's `len` is in the expensive class so far. If your trait is
expensive, **stop and say so before starting** — that is a conversation, not a task.

**Cheap-class steps.** (1) add the field to the weapon row (`trait.*` / `shot.*`) or the fighter row
(`skill.*`) · (2) add **ONE** consumer line at the site that already handles that moment; if no site
handles it, that is a new seam — add it *there*, do not build a framework · (3) add a boot guard if
the value could break something silently (a division, an index past the baked rows, an unauthored
label) · (4) author `brief` (weapon) / `short` (fighter) if the new axis is not plain spin/dmg — the
derivation cannot express it and the guard will throw · (5) add an assertion to `.qa/seam-proof.mjs`,
**including one that proves the guard FIRES** by injecting a bad row · (6) update the REGISTRY block.

**Proofs — Tier 0 only unless geometry moved.** `.qa/seam-proof.mjs` (~5min) then
`.qa/lengrow-build-proof.mjs` (~60s); `chromecheck` if a label changed; `fingerprint.mjs` if the
landing is *meant* to be behaviour-identical (an inert seam, a comment) — where 0 of 8 IS meaningful.
Tier 1 (`inscribe`, `bake --verify`, `leadproof`, `flipproof`) only if art, polys, coverings or scale
moved. Tier 2 (differential sweeps, cost, the 484-cell run) only on suspicion, or once at the end of
the pass.

**Traps that have already bitten, so you do not repeat them.** A *derived* label silently prints the
WRONG text for any axis the derivation does not know — it did, for the spear, for a whole build. A
declared multiplier is not the realised one: `shot.mult` 2 realises as 2.15× and 4 as ~7×, because
more shots → more hits → more spin growth → more shots. A boot guard never proven to throw reads as
coverage and is worse than none. `emit()` looks like an event bus and is not — it is an append-only
log with no subscribers. **One field was being read two ways**, and only a non-default pairing could
show it: the `hit` event's `to` fed `flashV[e.to]` (identity-coloured) *and* `koStill.pose[e.to]`
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
already `.map`s over `FIGHTERS` (`LEN_CAP` was retired with `lenSteps` at `nocombo-r34`). What remains is *sizing*: seven arrays hold exactly two entries.

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

**Stamp discipline.** A *visible* landing bumps the build stamp; a behaviour-identical one does not.
The REGISTRY block landed under `seam-r30` for that reason — comments are not visible, and
fingerprints confirmed 0 of 8. **Clarified 2026-10-28 by `pair-r31`, which is behaviour-identical
(fingerprints 0 of 8) and DID bump the stamp:** "visible" means *observable by the owner*, not
"changes a pixel on load". `pair-r31` adds `APP.setCast([i, j])`, which he can call and watch the
fighters change sides, so a stamp reading `seam-r30` on a file that has the lever would mislead him
at the console. A comment-only or metadata-only landing still does not bump.

---

## Commands

The command surface the tool exposes once built — nothing here runs until the matching phase in `BUILD.md` lands (see Status below).

The SpinClash harness sits OUTSIDE this npm surface: `chromecheck.mjs` · `measure.mjs` · `ingest.mjs` · `.qa/` · `scratch/` are dependency-free `.mjs` tools that run TODAY on bare Node from the repo root (e.g. `node chromecheck.mjs` — ~4s boot + pairing check on the canonical). There is no `package.json` yet; it lands with Phase 0. `measure.mjs` stays owner-gated (standing rule 2).

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

Blueprint complete; **no engine code yet** — start at Phase 0 in `BUILD.md`. Game #1 (SPINCLASH) runs as `previews/spinclash-preview.html` — the ONLY canonical — a dependency-free browser sim at build **`links-r87`** (recorded 2026-11-10; *the `<title>` node remains the authority for the stamp — this convenience copy has drifted three times, so check it first*): pure `newGame`/`tick`, then the renderer, then chrome — harness-extractable, no DOM above the RENDERER banner. Its frame (the PEBBLE look) is locked; its weapon art landed at `roster-r12` and the convention CLOSED 2026-10-27 (the prescriptive lock lives in GAMES.md, "Weapon art — the closed convention").

**In the sim:** the 22-weapon roster, complete · the Core contact law and the seven shot laws · nine flying shot kinds under the copy rule (1:1 munitions, the staff orb and wand spark under the whole-body waiver, the scroll's fire comet, the tome's poison/frost/fire trio pre-figuring the skill pass) · the knives' three-knife volley · render interpolation · the overflow-band canvas (weapon ink never cuts) · hitstop as a true pause of the on-screen frame, with the kill still on the K.O. hold · the owner-designed VS-poster dice reveal · the 2026-10-21 feel-tuned physics set (gravity 1400 · chaos ceiling 1200 with 0.9 wall bleed · parryPush 700 · the parry flutter gate · the capped, tick-gated pin-escape nudge) · the N-segment generic chain sim (flail 3 particles, nunchaku 1) · the edge-leading mirror on four rows (`lead: -1` — katana, scythe, and since 2026-10-28 the dagger and the staff) with its `headLead` sibling for the javelin and the 180 ms flip transition.

**Balance state (the 2026-10-28 pass):** base damage 1 against hp 100 (owner: "just a test") · the length band `LEN_MIN` 54 .. `LT` 113.44, boot-gated · spin and damage are `WDEF` policy constants, so a new row declares only what is actually special about it · the spell-family nucleus sigils re-treated for legibility (a carrier disc at the launched hitbox radius on a dark ink plate — the one place shot art is implementer-generated rather than delivery-verbatim).

**Next: the remaining 8 weapon traits — 14 of 22 are IN** (spear length · staff orb growth · dagger spin growth · shuriken RICOCHET LAW, slot CLOSED · bow RAIN, closed-for-now · knives growing fan · crossbow NAILS + mult UNCAPPED · javelin SKEWER, DONE · boomerang WORLD ORBIT, DONE and eye-blessed · wand TRANSFIGURATION + THE HEX, concluded #710 · tome TRIO, landed #698 · scroll EMBER SPILL, concluded #719 · flail THE ADDING-LINKS CHAIN, #720 → `links-r87` #721 — the MELEE PASS has begun; the count follows GAMES #719's blanks). The launcher era is CONCLUDED — no proposal awaits a ruling. Remaining: the 7 melee blanks (hammer, axe, sword, mace, nunchaku, scythe, katana) + the orb, then the bot cast (every bot a unique skill), then balance. The knock seam waits on the owner's which-knock decision. The round-ending stalls (shield+shield, the projectile mirrors — and since r58 the boomerang mirror's pair-annihilation pace joins the family) are DELIBERATE until the balance pass — no round timer, no escalation ramp, no shield fix. **Owed:** the sanctioned `measure.mjs` run on the owner's machine — the 484-cell re-run batched to cover `stall-r25`, `lengrow-r26→r28` and the whole skills pass — now through `links-r87`, which landed with NO proof run on record (#721) — in one go — and the DEFERRED BUNDLE: the spear-cell fingerprint gap, the law-3 resolver rework, seam-proof section G (stale since the halo contract, now also blind to the r54–r60 boomerang laws) and measure.mjs's 4s replica (drifted the same way). The kit-route rebuild must revive the arena bench (the frozen `pause-r20` page retired 2026-10-28; the owner holds a copy — its scratch generator/smokes were purged in a later clean, so the revival starts from GAMES.md's GAP RECORD).

New weapons arrive through the **commission pipeline**: an artist kit generated against staging → pasted into an artist session with the design brief → returns land in `deliveries/` → intake-audit against the pristine base → splice into staging → arena + sheet re-render → one batch landing (row-splice rebake via `.qa/bake-rows.mjs` → inscription gate → leadproof/flipproof → fingerprint ritual → gauntlet + suite → owner playtest). **That tooling was purged 2026-10-28 at the pre-balance checkpoint** — the kit, the brief, the paste ledger, the staging tool, `sheet-v2`, `redesign-preview`, `design-shots.json` and the rider-brief era, all retired VERBATIM (recover with `git show docs-precleanup:docs/CHRONICLE-archive.md`). The rebuild is owed at the next commission kickoff: it re-seeds from that archived text plus the landed canonical art, re-freezes an intake base, and must carry the placement/reach rules and `WDEF` published in GAMES.md's closed convention. **The roster is complete at 22 and the commission queue is empty.**

Every owner decision with its quote, every measured baseline, delta proof, reverted experiment and harness convention lives in **GAMES.md** (Current state · Measured facts · Testing recipe); retired material was removed from HEAD on 2026-11-11 (GAMES #733) and is recoverable from tag `docs-precleanup`. This README deliberately repeats none of it.

The point of the project is Phase 8: a real game, rendered into a video good enough to publish. Phases 0–7 exist to make that take days instead of months, and to guarantee the output is technically flawless.
