# The retired projectile-spine rule (archived)

Contains: the verbatim projectile-rule text removed from GAMES' current-state sections at Step 1.5.
Read when: you need the historical 2026-10-19 rule wording; it is NOT a current instruction.
Approx token cost: ~0.5k.

RETIRED at `allcut-r62` (owner 2026-11-02): every weapon cuts on body touch, launchers and shield included. The landing (with the owner's quote) is recorded at GAMES #694. The shipped gate-free law is in `bladeVsBody`.

## Former Core contact law #1 sentence (verbatim)

The projectile rule narrows the converse: a projectile weapon's spine touching the body deals **no** damage (shot only) — damage still requires touch; touch no longer guarantees damage from such a spine (law 7s audits it).

## Former classes clauses (verbatim)

*launchers* = fire a shot, spine never damages (the projectile rule):

*shield* = tangential, no shot, no damage — the odd one out, awaiting design.

Hold is placement + launch point; **damage capability is decided by the projectile rule, not the hold** (owner 2026-10-19 — this replaced the v0.7.x "ranged = tangential = no spine damage" class rule, under which staff/wand wrongly damaged with their spines; fixed in v1.2).

## Former shot-system rule paragraph (verbatim)

**The projectile rule (owner 2026-10-19, restating and widening the 2026-10-17 rule):** "ranged weapons (shooting projectiles), their weapons do not damage, only their projetiles." A weapon with a shot config deals **no spine damage**, whatever its hold — the radial-hold launchers (staff, wand) included. The spine stays a full solid: it latches and knocks the body (zero-damage shove), parries weapon-vs-weapon, and swats enemy shots. Its shot is its only damage.


## Former Core contact law #4 exception (verbatim — retired at Phase A / GAMES #735, 2026-11-12)

**The projectile-rule exception (owner 2026-10-19):** a projectile weapon's spine touching the body still latches and shoves (same re-arm + knock — solidity survives), but deals no damage and emits no hit event, so the replica pairs only damaging edges — the replica mirrors the sim's exact gate (`shot || tangential`; the tangential half now covers only the shield). Law 7s proves no projectile weapon ever emits a melee hit.

## Former shot-law 7s clause (verbatim — retired at Phase A / GAMES #735, 2026-11-12)

7s the projectile rule — zero melee hits by projectile weapons, any hold; the core law-4 replica mirrors the sim gate (a gated rising edge is a flag-audited zero-damage shove with no hit event to pair).

The shipped gate-free law is in `bladeVsBody`; `measure.mjs` keeps `rangedMeleeHits` as a visibility counter only (law 7s retired at `allcut-r62`, owner 2026-11-02; landing #694).
