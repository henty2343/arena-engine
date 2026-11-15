# BATCH 3 — GAMES.md usability and docs authority: STATUS — COMPLETE

LOCATION: docs/handoff/BATCH3-STATUS.md — REPO-HOSTED alongside HANDOFF.md (v11+). Updated in the same
commit as every landing; current as of HEAD by construction. Chat attachments of older copies are
OBSOLETE; the repo outranks them. Never move these files into docs/history/ (globbed by the doc
tools; an unlisted file there fails lint). Freshness: `git log -1 --format='%h %s' -- docs/handoff/`.

Status as of 2026-11-14: (a) DONE (0ddd7f5, #746) · (b) DONE (9e017bb, #742) · (d) DONE (f756e21, #747)
· (c) DONE (68e29f9, #748). Nothing remains in Batch 3. Its follow-ups: #749 DONE (4cc98d5) · #750 DONE (4f38866) ·
#751 DONE (63bb91c) · #752 DONE (361cbcb, the law-table completion + the probe registry) ·
#753 DONE (477c34a, the RENDERED-FRAME proof) · #754 DONE (46ffcd7, the measure.mjs header + the owner-go solidity run) · #755 DONE (ffc90ef, Batch 4a: RECIPES Traps -> short rules + AGENTS as the one workflow home) · #756 DONE (24e1e67, the measure.mjs stride fix) · #757 DONE (this commit: docs only - the lenStep finding and the retraction of #756's law 3 claim).
Next: the lenStep fix (a harness-side pre-tick stash, then the owner's re-run), then the S3 and band RULINGS (held until re-measured), then Batch 4's tool moves — HANDOFF §7.
The Batch 2 ledger is the appendix below, carried verbatim. STATE.md and docs/CODEMAP.md
are authoritative for every number.

Follow-ups: #749 = 4cc98d5 landed the optional doc items (index titles, the mf-2 14 KB line, AGENTS/README pointers, the #749 entry).
#750 = 4f38866 added the 3,000-byte line-cap lint and recorded that hash - see the ledger below; its own hash is not known
to this file. #751 = 63bb91c is the LAW-TABLE FOLLOW-UP: new .qa/law-proof.mjs asserts the three laws that had NO
assertion anywhere (B1/B2/U1), so the LAWS table now has no `unprobed` row - see the ledger below.
#752 = 361cbcb is the LAW-TABLE COMPLETION + THE PROBE REGISTRY: .qa/contact-proof.mjs (C4, C5) and
.qa/shot-proof.mjs (S1, S5, S6) assert the last five laws that had no agent-runnable proof, and
tools/manifest.json becomes the single registry that run-battery and lint-docs read (verify.mjs is NOT a reader yet - it stays at 6 checks).
#753 (this commit) is the RENDERED-FRAME PROOF: .qa/frame-proof.mjs proves C3's band at the tick-entry
pose (C3 → `partial`) and MEASURES law 3s, which does NOT hold on the current build (S3 stays
`owner-run only`; the owner's ruling is open).
Next: the S3 RULING, or Batch 4's tool moves.

## #756 measure.mjs stride fix + stride-proof - ledger (commit 24e1e67)

What: (1) measure.mjs: FL_SLOTS = 18 and STRF = 1 + 2 * FL_SLOTS = 37 replace STRF = 13 and the hard-coded 6 slots (flAt, the entry-pose stash, the two rest-pose constants); a guard exits 2 if G.auditFl is not a whole number of STRF rows. (2) New .qa/stride-proof.mjs (4 checks) lifts measure.mjs's own FL_SLOTS/STRF/flAt text and runs it on real tapes from the shipped sim: fl.u 18 wide and the tape 37 per row (P1), flAt resolves every substep row, 18,170/18,170 (P2), the stash copies FL_SLOTS slots (P3), and a pre-links-r87 control (6 slots, stride 13) resolves 2,060/18,170 and fails. Registered in tools/manifest.json (battery true, citable false), so the battery is 14 steps. (3) STATE.md regenerated. (4) Both handoff files updated, recording the read-only findings: frame-proof's 2,500-tick horizon explains the law-3 disagreement (the cell's worst, 27.399px at t15936, reproduces and is band class), and the stale stride is the chain-pose integrity failure.
Why: the owner-go --solidity run failed `harness chain-pose integrity` and nothing an agent could run caught the width change.
Approved: "do a" - the owner named option A after the read-only findings.
Deviations (flagged at delivery): (1) A code edit to an owner-only tool (measure.mjs), not comment-only; it was syntax-checked (`node --check`) and its changed blocks are exercised by stride-proof, but measure.mjs was NOT run. (2) The proof battery grew from 13 to 14 steps. (3) No GAMES entry and no regen of GAMES/CODEMAP: the canonical did not move.
Not verified: that laws 1, 2, 4, 5, 1s, 2s go green on the fixed harness (needs the owner's one-run re-measure); the new exit-2 guard has never fired in a real run; the full battery was not run (canonical untouched).
Correction (#757): this ledger's item (4) says the law 3 worst "reproduces and is band class", and the handoff files it landed said law 3 is a real band red. That was WRONG: the recompute omitted the fighter's lenStep, as measure.mjs does. See the #757 ledger and HANDOFF §7.
Rollback: `git revert` this commit.

## #757 the lenStep finding + the retraction + the handoff refresh - ledger (this commit)

What: DOCS ONLY, both handoff files. (1) HANDOFF §7 records the owner's 2026-11-15 re-run on the fixed stride (exit 0, 109 battles, 8 workers, 365.0s; integrity check PASS; laws 1, 2, 3, 5, 1s, 2s, 4s counts identical to the 2026-11-14 run; law 4 moved), and THE lenStep DRIFT: measure.mjs and frame-proof's C3 pose never pass the fighter's lenStep, so a grown chain is rebuilt short (seed 101 x 23 cells: law 1 phantoms 24 -> 2, law 2 parries without touch 25 -> 0). (2) RETRACTS #756's "law 3 is a real band red at 27.399px": with lenStep that tick has 2.415px of clearance, and the cell's worst falls from 27.399px to 14.185px (61 visible ticks -> 2). (3) The S3 and band-calibration rulings are marked HELD. (4) §8 gets a gotcha for the drift and the cmd.exe run rule, plus a corrected stale line; §0 status date; §9 carries the new-chat prompt; §10 re-points the next action. (5) This ledger and a correction line on #756's.
Why: #756 put a wrong claim on origin, and the re-run changed what is known.
Approved: "go 757" after the owner asked for the law 1 investigation first.
Deviations (flagged at delivery): (1) The #756 ledger's text is kept and corrected by an appended line, not rewritten; HANDOFF's own #756 paragraphs were replaced because they are status, not record. (2) No code, probe or generated file touched.
Not verified: the lenStep numbers come from throwaway scripts (not committed) over seed 101 and the 23 gauntlet cells only, not the 109-battle population; the link-add explanation for the 2 residual phantoms is inference; the owner's report is not in the repo; laws 4, 5, 1s, 2s, 3s, 4s were not tested against lenStep. The fix patch will carry a probe.
Rollback: `git revert` this commit.

## #755 Batch 4a - RECIPES traps as rules, AGENTS as the one workflow home - ledger (commit ffc90ef)

What: (1) docs/RECIPES.md: the "Traps that have already bitten" paragraph became seven numbered rules, each a bolded rule plus its why. Every fact is kept (2.15x and ~7x, the 13 renderer sites, curW, koStill, st.o, the rect scan story) and a pointer says where the full stories live (grep pair-r31, shot.mult, cleanup #4). NOT a size win: 7,580 -> 7,523 bytes; the gain is structure. (2) AGENTS.md: a new Workflow section (orient, propose, change, prove, deliver) holding the freshness check, manifest-first before any probe, proof by edit class, and ONE patch in chat with a pointer to HANDOFF s6/s6.7; the Where-truth-lives line names it; 6,060 -> 7,828 bytes. (3) README: the Non-negotiables list became a pointer to AGENTS, so the doc regen order is no longer stated in two places; 1,282 -> 1,268 bytes. (4) STATE.md regenerated (cost table only). (5) Both handoff files updated. Nothing else is touched.
Why: HANDOFF s7 Batch 4 listed these two as the items that need no frozen-text edit, and the workflow lived in three places (AGENTS, README, HANDOFF).
Approved: "go 4a" - the owner named the item after the read-only proposal.
Deviations (flagged at delivery): (1) No GAMES entry and no regen: the canonical did not move (as in #754). (2) HANDOFF s4 and s6 keep the detailed playbooks; AGENTS points there instead of absorbing them, so "one home" means one entry point and one summary, not a move of the playbooks. (3) .github/copilot-instructions.md still repeats three rules; left so Copilot sees them without following a link.
Not verified: no rendered-markdown check; the battery was not run (canonical untouched); no new lint check, so no negative controls.
Rollback: `git revert` this commit.

## #754 measure.mjs header + the owner-go solidity run - ledger (commit 46ffcd7)

What: (1) measure.mjs's header comment (lines 148-149 only) said "The owner never runs this; the assistant does, when told to" and pointed at .qa/projectile-fix.mjs, which does not exist in the repo; it now says the owner runs it, an agent runs it only on an explicit owner go for that one run, and names the runnable .qa probes. Comment-only; node --check passes; no code token moved. (2) The one owner-go `node measure.mjs --solidity` run is recorded in HANDOFF s7. (3) HANDOFF s1 carries the one-run exception. Both handoff files updated; nothing else is touched (no canonical, tool, GAMES, STATE or generated file).
Why: the header contradicted the standing ban and named a missing file; and the run gave the first audit result since the weapons pass.
Approved: "ok can you update it and also run soliditty then?" - an explicit owner go for both.
Deviations (flagged at delivery): (1) measure.mjs was EXECUTED, against HANDOFF s1 - by the owner's explicit go, for that one run. (2) A tool file (measure.mjs) was edited, comment-only. (3) No GAMES entry and no regen: the canonical did not move, so none is required; the measured result lives in HANDOFF s7 until the owner decides where it belongs.
Not verified: WHY the audit is red (the chain-pose integrity check failing is the lead, not a proof); the exit code was not captured; the full report was not committed.
Rollback: `git revert` this commit.

## #753 rendered-frame proof - ledger (commit 477c34a)

What: (1) New `.qa/frame-proof.mjs` - 4 assertions on the two RENDERED-FRAME laws, the last two `owner-run only` rows. The repo already defines a rendered frame as the tick-entry pose (the v0.8.2 pose amendment: the renderer interpolates, but in audit language "rendered frame" means the tick pose - the sim's ground truth), so the last rendered-frame law IS headlessly assertable, with the canonical's OWN geometry (`geom.parryGap`, `geom.bladeCircles`) - the same functions `measure.mjs` calls. (2) C3 → `partial`: the band's worst (18.041px measured over 68,275 rendered fight-ticks across 31 cells) stays inside the envelope the law itself records (20.754px) and the visible band ticks (43 = 0.0630%) stay under the owner's 2% rate; the named MIRROR class is reproduced per occurrence (2, worst 9.056px) and excluded from the band, as the owner excludes it. (3) S3 stays `owner-run only` and is REPORTED: a faithful reproduction of the owner's own law-3s pass measures blade 85 · body 757 · rim 2,422 · pair 6,745 (worst 73.099px) over 17,079 shot-bearing frames, in named classes (a nail at rest, two shots crossing, the boomerang's covering circle, an impaled skewer). The probe gates only the GROWTH of those counters (a ratchet, the fingerprint.mjs tradition) - it does not assert the law. (4) The probe is registered in `tools/manifest.json` (battery + citable), so the battery grew from 12 steps to 13 and the law table's citable set reads it from the same registry. (5) #753 appended to GAMES. Both handoff files updated. The canonical, CODEMAP, the three record files, AGENTS, README and every other tool are untouched.
Why: a law nothing can fail is a law nothing protects, and the last two were exactly that - only measure.mjs saw them, and agents never run it. The rendered-frame definition the repo already owns is what makes them assertable without a renderer and without pixels.
Approved: "ok go ... two remaining rendered-frame laws" - the owner named the item.
Deviations (flagged at delivery): (1) C3's Status moved `owner-run only` → `partial`; S3's Scope now carries the finding and its Status stays `owner-run only` ON PURPOSE (the probe reports the law, so the row may carry no runnable anchor). (2) The proof battery grew from 12 steps to 13. (3) The S3 channel is a ratchet, not a law gate - a sim change that moves the counters turns the probe red so they are re-measured and updated deliberately. (4) The owner's own 6px band calibration no longer holds on the curated gauntlet (15.505px measured, `wand+bow` seed 101) - a second law channel that has drifted since the last sanctioned run; the probe gates the envelope the LAW records (20.754px) and reports the 6px calibration. (5) The rate assertion is measured and reported but no canonical mutation I could find exceeds the owner's 2% bound: a visible band overlap only survives to the tick entry when the resolver cannot separate the blades inside the tick, and then it is also deep, so the depth assertion fires first (the rate does move: 0.0630% clean, 0.63% with the resolver disabled). (6) Batch 4's tool MOVES are still NOT in this commit (75 path substitutions inside the three FROZEN era files).
Controls (measured): 4 canonical mutations, each must FAIL its intended check - a closed spawn gap → the RED envelope fails; the resolver's de-overlap loop disabled → the envelope fails; the body radius grown → the S3 ratchet fails; the reveal never ends → the vacuity fails. A fifth control (resolver disabled + closed spawn) shows the RATE moving 10x (0.0630% → 0.63%) without crossing the owner's 2% bound - reported, not gated. The unmutated tree is 4/4.
Not verified: no rendered-markdown check; measure.mjs NOT run (permanently banned); the canonical was untouched, so no canonical-specific proof was required. The S3 overlap CLASSES are the probe's classification, not a ruling - the owner's.
Rollback: `git revert` this commit.

## #752 law-table completion + the probe registry - ledger (commit 361cbcb)

What: (1) Two new probes: `.qa/contact-proof.mjs` asserts C4 (one damage per touch; the re-arm gates) and C5 (a parry recoils BOTH weapons' spins); `.qa/shot-proof.mjs` asserts S1 (damage only on shot-touches-body), S5 (the substep budget is honoured every tick) and S6 (every shot is born at its hold-derived launch point). All five were `owner-run only` - audited ONLY by measure.mjs, which agents never run - so a break in any of them failed nothing an agent could run. They are now `probed` (C4, C5, S5) or `partial` (S1, S6). After this the LAWS table has NO `unprobed` row and only TWO `owner-run only` rows: C3 and S3, both rendered-frame laws. (2) `tools/manifest.json` is the new PROBE REGISTRY - every proof and tool in one list: what it asserts, whether the battery runs it, whether a law row may cite it, whether an agent may run it. `tools/lib/manifest.mjs` loads it and checks it is COMPLETE (every proof on disk registered; every entry's file exists). `scripts/run-battery.mjs` takes its steps and expected exit codes from it; `tools/lint-docs.mjs` takes the law table's citable probe set from it. (3) `tools/gen-state.mjs` adds one STATE line naming the registry. (4) #752 appended to GAMES. Both handoff files updated. The canonical, CODEMAP, the three record files, AGENTS, README and every other tool are untouched.
Why: the law table's citable probe set was derived by REGEX-PARSING run-battery.mjs's SOURCE - a reformatted array changed the law table's verdict without anyone touching a law - and the proof inventory lived in three hand-kept lists. Adding two more probes was the moment to make the inventory data instead of a pattern in somebody's code, and to give an agent one small file that says which proof stands behind which law.
Approved: "ok go, do a proposal, try and do bigger patches, but only if it makes sense" - a blanket delegation. The bigger patch makes sense here because the two halves are causally linked: the registry exists to make the new proofs discoverable.
Deviations (flagged at delivery): (1) the law table's Status column changed on five rows; Status is hand-written judgement and the lint cannot judge coverage - the probes are the evidence. (2) The proof battery grew from 9 steps to 12 and its step list moved from code to data, so a probe is registered by editing one JSON file. (3) `tools/manifest.json` now also registers the owner's own tools (`measure.mjs`, `ingest.mjs`) with `ownerOnly: true` - the registry is total, and the flag is what says agents must not run them. (4) Batch 4's tool MOVES are NOT in this commit: their measured blast radius is 75 path substitutions inside the three FROZEN era files plus 26 in live GAMES.md - non-whitespace edits to frozen historical text, a bigger doctrine collision than #749's whitespace-only era edit. (5) S1's returning boomerang and S6's volley row are only partly covered, and the Scope column says exactly how.
Findings: (1) The re-arm gate can be read back EXACTLY from the fighter's own counters: `bladeClearPeak > reArmPad` AND (`bladeClearPeak >= reArmDeep` OR `elapsed >= reArmWait`) - the sim's arithmetic, checked against the sim's own state, so the probe needs no re-implementation of the gate. (2) The round reset (law T1) also clears the latch, and it is NOT a re-arm - the probe must exclude it or it reads as a gate violation. (3) A parry flips both spin SIGNS, but the MAGNITUDE may also change in the same tick (a growth event adds to the spin and keeps its sign), so the assertion is on the sign, not on an exact negation. (4) The shot's hit event carries the shot at its death instant (sx, sy, sr) and the victim's centre, so the probe RECOMPUTES the touch itself instead of trusting the sim's number - 96/96 exact on the non-returning rows. (5) The substep tape carries [chosen, blade-required, projectile-required], so the budget can be checked in BOTH directions: the brake never engaged AND the budget was never under-allocated (the tunneling ghost). (6) The launch point is derivable from the launch event's own fighter pose plus the row's hold, using the sim's own spineFrame/copyCtr geometry - 561 launches recomputed exactly. The volley row's fan grows with the holder's hit count, so it is matched against the FULL anchor set instead (a shot at the right anchor of the WRONG tier would still pass).
Controls (measured): 9 negative controls, all behaved as intended. Six mutate a COPY of the canonical and each one must FAIL its intended check: (1) the deep-disengage half of the re-arm gate opens early -> "C4 every re-arm satisfies the deep-disengage gate" fails; (2) the latch stops blocking -> "C4 a fighter never deals two damaging blade hits in one tick" + "C4 every hit after the first is preceded by a re-arm" fail; (3) only one weapon recoils on a parry -> "C5 every parry flips BOTH weapons spins" fails; (4) a shot damages without touching -> both S1 checks fail; (5) the substep cap is set to 4 -> "S5 the emergency brake never engaged" fails; (6) the launch point moves off its hold -> "S6 every hold-derived row launches where its hold says" fails. Three mutate the registry in a copied tree: an unregistered proof, an entry pointing at a missing file, and a law row citing an unregistered probe -> lint-docs fails with the intended message each time. Passing control: the unmutated tree is 5/5 and 6/6.
Receipts: verify --quick PASS (6 checks) in the build tree AND in a fresh clone of the base commit after `git apply --index`; the proof battery PASS - 12/12 steps matched their expected exit code (lengrow-gate 1 BY DESIGN, the other eleven 0), canonical md5 and line count identical before and after the run; per-file md5 identical between the build tree and the fresh clone; the staged diff byte-identical in both (its md5 cannot be written here - a file cannot contain the md5 of the patch that carries it; the advisory md5 goes in the delivery message); strip-hash PASS against canonical-prediet-2c with the three invariant hashes unchanged; the canonical, CODEMAP, the three frozen record files, AGENTS and README untouched by the patch.
Not verified: no rendered-markdown check; measure.mjs NOT run (permanently banned); the canonical was untouched, so no canonical-specific proof was required.
Post-push re-measurement (fresh clone of origin at 361cbcb): all twelve shipped files are byte-identical to what was built - the pushed commit's diff is byte-identical to the delivered patch (md5 f5e552e4e7c78b6396bbc5c29d4d4f4f); `verify --quick` PASS (6 checks); `strip-hash` PASS with the three invariants unchanged (c2cd01ef... / e9b6f8d6... / 600097a7...); contact-proof 5/5, shot-proof 6/6, law-proof 12/12 on origin; canonical md5 5de162de... / 4716 lines; the record-set era files unchanged. The law table on origin tallies 8 probed / 15 partial / 2 owner-run only / 0 unprobed - COUNT the rows, do not carry a tally.
Rollback: `git revert 361cbcb`.

## #751 law-table follow-up - ledger (commit 63bb91c)

What: (1) New `.qa/law-proof.mjs` - 12 assertions on the three laws that had NO assertion anywhere: **B1** (best of 3, first to 2 round wins), **B2** (a round ends only on a K.O.) and **U1** (uniform base: omega 3.5, damage 1, hp 100). All three were `unprobed` in the law-to-probe table; they are now `probed`, and the table has **no `unprobed` row left**. (2) The probe is registered in `scripts/run-battery.mjs` as a battery step - the law-table lint requires every cited runnable probe to be a battery step. (3) `docs/LAWS.md` gained one legend line. (4) #751 appended to GAMES. Both handoff files updated. The canonical, CODEMAP, the three record files, AGENTS, README and every tool except run-battery are untouched.
Why: a law nothing can fail is a law nothing protects. These three are pure SIM logic, so the house loader (`tools/lib/load-sim.mjs` - the pattern fingerprint / leadproof / lengrow-build-proof use) can assert them headlessly in seconds, with no rendering and no measure.mjs.
Approved: "go do what you think is best, you are the ai agent and the repo is meant for that" - a blanket delegation, after the read-only proposal in which BOTH of the owner's proposed items were found ALREADY LANDED (#749 / #750) and the law-table follow-up was recommended instead.
Deviations (flagged at delivery): (1) the law table's Status column changed on three rows (`unprobed` -> `probed`); Status is hand-written judgement and the lint cannot judge coverage - the probe's assertions are the evidence behind it. (2) The five sim-logic owner-run-only laws (C4, C5, S1, S5, S6) are NOT in this commit: their sites were LOCATED, not asserted, and moving a row off `owner-run only` requires the Status AND the Scope column to change together (the lint requires that status to carry no runnable anchor). (3) C3 and S3 stay `owner-run only` - they are rendered-frame laws and there is no render path (measure.mjs is never run), so claiming them would be dishonest. (4) Batch 4 is NOT in this commit: its measured blast radius is 75 path substitutions inside the three FROZEN era files plus 26 in live GAMES.md - non-whitespace edits to frozen historical text, a bigger doctrine collision than #749's whitespace-only era edit.
Findings: (1) The three unprobed laws are decided by one line each in the canonical - the battle-end check `G.wins[0] >= CFG.roundsToWin || G.wins[1] >= CFG.roundsToWin`, the fight phase's only exit `checkKO(G)`, and the shared base `WDEF = { omega: 3.5, dmg: 1 }` with `CFG.hp: 100`. (2) A round can be ended WITHOUT touching sim code: staging `f.alive = false; f.hp = 0` BEFORE the first fight-phase tick makes the shipped `checkKO()` credit the win, and the dead fighter is skipped by `stepPhysics`, so the probe never races a natural knock-out. (3) The fight phase survives a 20,000-tick window with no K.O. and no phase change - no timer can end a round. (4) The natural fight runs 12,684 ticks (2 K.O. exits, 0 non-K.O. exits); the vacuity floor is set at 2,000. (5) The WEAPONS table has 22 rows, not the 13 a first quick count suggested - every row spreads the shared `WDEF` and none overrides omega or dmg (the in-table `dmg:` values are all `trait.dmg` growth rates).
Controls (the probe only, on throwaway copies of the canonical, one mutation each): C0 clean PASS 12/12; C1 `WDEF.omega 3.5 -> 3.6` fails exactly the 2 U1 assertions (10 pass); C2 `roundsToWin 2 -> 3` fails the 4 B1 threshold assertions plus the U1 config assertion that pins roundsToWin; C3 the battle-end condition changed to `wins >= 1` fails ALL 7 B1 assertions; C4 an injected 5,000-tick round timer fails both B2 assertions (B1 and U1 unaffected); C5 the `ko` event emission removed fails "the round ends only on a K.O." while the no-timer assertion still PASSES - the two checks are independent.
Receipts (this session, build clone at BASE 4f38866): the probe passes 12/12 in 5.0 s; `verify --quick` PASS (6 checks); `strip-hash` PASS with the three invariants unchanged (c2cd01ef... / e9b6f8d6... / 600097a7...) and canonical md5 5de162de...; `verify --battery` PASS - 10 steps, every step matched its expected exit code (law-proof exit 0 in 5.0 s; lengrow-gate exit 1 BY DESIGN), canonical before == after; mojibake census clean on every patched file (the only signature characters anywhere in the repo sit on HANDOFF.md's own rule line, which NAMES them, and that line is unchanged from HEAD); per-file md5s are in the HANDOFF state block and in the delivery message.
Not verified: no rendered-markdown check; measure.mjs NOT run (permanently banned); the battery ran, but the canonical was untouched so no canonical-specific proof was required.
Post-push re-measurement (fresh clone of origin at 63bb91c): the five shipped files are byte-identical to what was built (per-file md5sum -c 5/5 OK), `verify --quick` PASS (6 checks), `strip-hash` PASS with the three invariants unchanged (c2cd01ef... / e9b6f8d6... / 600097a7...), the probe 12/12 on origin, canonical md5 5de162de... and the record-set era files unchanged.
Rollback: `git revert 63bb91c`.

## #750 line cap + hash record - ledger (commit 4f38866)

What: (1) lint-docs B3E - any line over 3,000 bytes in docs/GAMES.md or docs/history/*.md fails (Buffer.byteLength; check-only; no record file edited; a new era file is covered through docset). (2) Both handoff files record 4cc98d5 as the #749 landing. (3) #750 appended to GAMES. Every other file, including the canonical, LAWS, CODEMAP and the record files, is untouched.
Why: the #749 finding - nothing guarded the 26-line mf-2 paragraph against a re-join, and a 14 KB line defeats docreflow and editors.
Approved: "go" on the read-only proposal ("a and c as you recommended").
Deviations (flagged at delivery): (1) a new lint rule applies to FROZEN era files (check-only). (2) NOT a diff of the changed files: a new-file-only patch holding one gated self-deleting one-shot (tools/doc/land-750.mjs, HANDOFF §6.8); the regenerated files are produced on the owner's machine, so `git add -A` is required. (3) The law-table follow-ups (B1/B2/U1 + 7 owner-run-only laws) are NOT in this commit; the earlier "A and C" wording was read as the combined hash-record + line-cap patch.
Findings: the cap catches a re-join only once the joined line passes 3,000 bytes. On a copy of the 26-line region, 2 and 5 re-joined lines stay green (1,120 / 2,789 bytes); 6 (3,348) and 26 (14,343) fail. Multibyte text is counted in bytes (1,501 two-byte characters = 3,002 bytes = FAIL).
Controls (lint-docs only, throwaway copies, one mutation each): C0 clean PASS; C1 3,001 B in mf-1 FAIL; C2 3,000 B PASS; C3 3,001 B in GAMES FAIL; C4 3,002 B multibyte FAIL; C5 3,000 B multibyte PASS; re-join 2 / 5 PASS, 6 / 26 FAIL.
Not verified: no rendered-markdown check; battery and measure.mjs not run (canonical untouched). Command results and per-file md5s are in the delivery message and in the HANDOFF state block.
Rollback: `git revert` this commit.

## #749 follow-ups — ledger (commit 4cc98d5)

What: the optional items of HANDOFF §7 as ONE commit. (1) navgen rowTitle(): the 54 numbered entries of mf-2 show `NNN — <heading text>` in the entry index instead of a bare number; every other row is unchanged. (2) mf-2 line 526 (entry #721's AT THIS LANDING sub-paragraph, 14,343 bytes, the only line over 3,000 bytes in the record set) became 26 lines, each ≤ 560 bytes, by turning existing spaces into newlines — no byte added or removed, no blank line. (3) AGENTS "Where truth lives" and the README router point at docs/handoff/HANDOFF.md. (4) #749 appended to GAMES. Both handoff files updated. Canonical, LAWS, CODEMAP, docreflow, gen-state, lint-docs, docset untouched.
Why: the index is the front door to two era files and showed 54 bare numbers; the 14 KB line was unreadable in an editor and the one thing docreflow could not break; the hosting patch deferred the pointers and the entry to stay new-file-only.
Approved: "go" after the read-only proposal.
Deviations (flagged at delivery): (1) a FROZEN era file was edited, whitespace-only; the rejoin, non-whitespace, word, byte, heading and line-count proofs run in memory before anything is written. (2) NOT a diff of the changed files: a new-file-only patch holding one gated self-deleting one-shot (tools/doc/land-749.mjs, HANDOFF §6.8), because replacing a 14 KB line is about 29 KB of diff to transcribe; the regenerated files are produced on the owner's machine, so `git add -A` is required. (3) Bold spans in the re-paragraphed line now cross soft newlines: valid CommonMark, NOT render-checked.
Findings: docreflow could not split that line because every break point sits inside a bold span; no tool compares a frozen era file with its pre-edit self, so the one-shot's in-memory proofs are the only guard on the edit, and nothing guards the result against a later re-join (control: joining two of the 26 lines keeps verify --quick green).
Not verified here: no rendered-markdown check; battery and measure.mjs not run (canonical untouched). Command results, negative controls and per-file md5s are in the delivery message and in the HANDOFF state block.
Rollback: `git revert` this commit.

## Handoff hosting — ledger (commit 24ce531)

What: HANDOFF.md (v9) and this file moved INTO the repo at docs/handoff/, as two NEW files. No tool,
record, canonical or generated file changed. Why: after 3(c) landed, the owner's chat still attached
the v7 pair ("3(c) NOT STARTED") twice; each new chat restarted with a stale-notes contradiction and
cost a turn. Repo-hosting makes the notes current as of HEAD by construction and removes the
attachment swap entirely. Approved by the owner as: "can you fix it?".
Deviations flagged: (1) HANDOFF v8 §9 said handoff files are NOT part of the repo — reversed here,
with the owner's ask; §9 now requires updating both files in every landing patch. (2) No #749
chronicle entry and no AGENTS/README pointer in THIS patch — deferred to the next docs patch so this
delivery is a new-file-only diff (the safest chat-paste form, §6.7). (3) docs/handoff/ is outside
every lint glob and outside STATE's cost table by design; verify --quick stays green untouched.
Receipts: measured on a fresh clone at BASE 68e29f9 before the change (verify --quick PASS 6 checks;
strip-hash PASS, self-test PASS, invariants c2cd01ef… / e9b6f8d6… / 600097a7…; canonical 5de162de…);
after adding the two files, verify --quick re-run (result recorded in the delivery message).
Rollback: `git revert <this commit>` removes docs/handoff/ entirely; nothing else is touched.

## 3(c) — ledger

What: docs/GAMES.md split by era into docs/history/. Three frozen era files, cut on entry boundaries,
content moved VERBATIM: mf-1-pre667.md (34 unnumbered measured-facts entries, 2026-10-28 -> 11-01),
mf-2-667-721.md (54 numbered entries #667-#721, the #671 tombstone included), chronicle-722-747.md
(26 dated landings #722-#747). GAMES keeps the preface, The documents, the nav block, §Current state,
Weapon art, Design principles, Open design questions, a `## Measured facts` STUB (original tombstone
+ pointers), the Testing recipe, and the live landing area. New tools/lib/docset.mjs exports the
sorted glob of the record set; navgen, docreflow, gen-state, lint-docs all consume it. gen-codemap
and verify untouched. navgen gained a Frozen eras table and a `file` column on the 88-row entry index
(line numbers per file; era files are read-only inputs). docreflow re-invokes itself per era file, so
its three whitespace proofs stay per-file. gen-state prices the era files. lint-docs: canonical-md5
slot became a UNION check; preface + token-cost guards cover era files; two NEW checks (every era
file named in GAMES; every docs/history path GAMES names exists). Routing prose updated in README,
AGENTS, copilot-instructions. #748 appended. 13 files (+1,460 / -1,341); CODEMAP and LAWS did not
move; canonical untouched.
Approved: "go, do what you think is best", then "just write the patch here in the chat", then "can we
start over again with the patch".
Deviations (all flagged at delivery): (1) NOT one self-contained patch — a verbatim 482 KB move => a
~1 MB diff, impossible to paste into chat; shipped as a patch PLUS tools/doc/split-games.mjs, a
gated self-deleting one-shot (§6.6), so docs/history/* and STATE.md were produced on the owner's
machine (`git add -A` required). (2) lint-docs ultimately shipped as a separate pure-ASCII gated
script after three failed patch pastes. (3) New navigation prose only (era prefaces, MF stub, The
documents bullet, nav NOTE, #748); no record rewritten/reworded/reordered/deleted. (4) docreflow
--check exit-code fix (always 0 -> 1 on pending); v7 §8's "verify parses its text" was wrong.
(5) AGENTS' stale "~155k tokens" became a STATE pointer; the grep hint added. (6) Tag
games-presplit-3c before the move.
Findings: (1) the live md5 was carried ONLY by the chronicle (#745/#746) — §Current state's CURRENT
BUILD holds a HISTORICAL md5 (83867fb7…, 5,034 lines, #721) — hence the union check. (2) Dates NOT
monotonic (#711-#720 dated 10-31 sit after #706-#710 of 11-03) — era cuts must be positional.
(3) The chronicle is 26 landings, not 28 — the splitter's gate refused the first run over that.
(4) lintRefs only scans §Current state, so the nav block needed its own history check. (5) The only
GAMES § pointer in operational docs is §Current state — moving records broke no section pointer.
(6) The four doc tools were the ONLY readers of GAMES. (7) The unbreakable line is 14,157 CHARS /
14,343 BYTES, now mf-2 line 526. (8) Delivery failures, all agent-side: an unverified patch-file md5
published; a hunk's trailing context invented from memory (`patch does not apply`); a lone-space
blank line at EOF (`corrupt patch`). The owner's terminal collapses newlines on paste; `!` triggers
history expansion. All encoded in HANDOFF §6.7. (9) Process failure after the landing: stale v7
attachments kept re-entering new chats — fixed by repo-hosting (this commit).
Receipts (fresh clone at 68e29f9): verify --quick PASS (6 checks; docreflow "4 file(s) in the record
set"); strip-hash PASS + self-test PASS (c2cd01ef… / e9b6f8d6… / 600097a7…), also run by the owner;
all 13 shipped files byte-identical to the build (GAMES df56830c…, mf-1 73c5cb96…, mf-2 bd74516a…,
chronicle 2a9798f2…, STATE 97c933ea…, AGENTS d15855f3…, README 1622682e…, copilot 4e193280…,
navgen 6154479b…, docreflow 88363bdd…, gen-state 5dd8bf7d…, lint-docs daf5ae8f…, docset 03e418e8…);
moved spans 183,530 / 211,900 / 86,562 bytes byte-identical in their new homes; §Current state, the
Testing recipe and the tombstone verbatim; 97 ### headings (9+34+54) and 26 dated landings preserved;
index exactly 88 rows in 2 files; mojibake census clean on all four record files; splitter absent
from HEAD; tools/ = 10 incl. lib/docset.mjs. TEN controls behaved as intended: C0 pass; C1 md5 absent
everywhere FAIL; C2 md5 only in history PASS; C3 token cost in era preface FAIL; C4 read-whole era
preface FAIL; C5 orphan era file FAIL; C6 renamed era file FAIL; C7 pending reflow in era file
verify FAIL; C8 stale nav block verify FAIL; C9 new era file auto-picked-up with no tool edit
(index "89 entries in 3 file(s)"). STATE costs: GAMES 168,385 -> 50,170 (-70.2%); mf-1 45,547;
mf-2 52,445; chronicle 21,598; AGENTS 1,354 -> 1,434; README 263 -> 288; set +1,375 navigation tokens.
Sizes: GAMES 569 lines / 202,486 B; mf-1 362 / 184,056; mf-2 529 / 212,439; chronicle 315 / 87,057.
Not verified: battery + measure.mjs NOT run (canonical untouched); no rendered-markdown check; era
prefaces and #748 are new prose no tool validates; numbered index titles still bare numbers.
Rollback: `git revert 68e29f9`; `git show games-presplit-3c:docs/GAMES.md` recovers the monolith.

## 3(d) — ledger

What: docs/LAWS.md became SOLE AUTHORITY for the current laws, the weapon-trait count (pinned line
"14 of 22 weapon traits landed") and which probe checks each law. lint-docs trait-count direction
reversed (LAWS is the source; README, AGENTS, LAWS and the explicit "N of 22 weapon traits" phrase in
GAMES §Current state checked against it). New `## Law-to-probe table`: 25 rows (C1-C6, S1-S6, B1-B5,
U1, G1-G3, T1-T3, X1); every file::anchor verified by lint-docs. Also: GAMES preface callout, AGENTS
(Where truth lives + lint line), gen-state design-state pointer, #747 entry. Six files; CODEMAP did
not move; canonical untouched. Approved: "go" (pin in LAWS rather than derive from REGISTRY).
Delivered as ONE patch, applied and pushed as f756e21.
Deviations (flagged): LAWS now pins the count; the GAMES preface callout edited (navigation prose);
the table is hand-built (no probe tags asserts by law ID) — lint verifies anchors, Status/Scope are
judgement.
Findings: the OLD count check guarded nothing in README/AGENTS/LAWS (none held "N of 22"); the only
live statement was CURRENT BUILD in GAMES §Current state. Contact 3/4/5 and shot 1s/3s/5s/6s are
audited ONLY by measure.mjs. B1/B2/U1 have no assertion anywhere; fingerprint is a change detector.
Statuses: 2 probed, 13 partial, 7 owner-run only, 3 unprobed (36 anchors).
Receipts: nine negative controls each failed with the intended message + passing control. Fresh
clone at 0ddd7f5: apply --check/--index OK, six md5s identical, verify --quick PASS, strip-hash PASS.
Re-measured at f756e21 after the push: six files byte-identical (AGENTS b602d6e4…, STATE 92ad71dd…,
GAMES 28a9775b…, LAWS 1588876f…, gen-state 87d680b8…, lint-docs 82482a06…), verify PASS, strip-hash
PASS. Costs: LAWS 2,473 -> 3,989; AGENTS 1,327 -> 1,354; GAMES 167,486 -> 168,385. docreflow re-wrapped
#747's long line (whitespace-only).
Not verified: battery, measure.mjs (canonical untouched); coverage judgement rests on probe reads;
no census (canonical untouched).
Rollback: `git revert f756e21`.

## 3(a) — ledger

What: all 88 Measured-facts entries `**X** body` -> `### X` + body. navgen (isNew, title) and
docreflow (isNewEntry) recognise the ### form (B3A:). #746 appended. Canonical untouched.
Approved: go with both recommendations (heading = whole old bold span verbatim; append #746).
Deviations (flagged): 88 entries, not ~104 (other bold-led lines are sub-paragraph labels + 4
tombstones, left alone); long headings (median 229 chars, p90 563, max 794; 23 without same-line
body; 12 nested bold); delivered as finished files, then patches became the standing format; #746
added on the owner's yes.
Receipts: byte-neutral 674,062 -> 674,062 before #746; lines outside Measured facts byte-identical;
per-entry round trip; identical content stream modulo markers/whitespace; 88-row index identical in
date/title/KB; docreflow --check 0 pending. At 0ddd7f5 after push: four files byte-identical
(GAMES 7595c82b…, navgen b49f778f…, docreflow ebf90bbc…, STATE 16465deb…); verify PASS; strip-hash
PASS. measure.mjs NOT run.
Not verified: battery (not required); no rendered check; numbered titles still bare (open item).
Findings: 54 of 88 entries already carried chronicle numbers 667-721 as the first title token —
#742's "no numbers" claim was wrong for them. The 14,343-byte line unchanged (break points inside
bold spans).
Rollback: `git revert 0ddd7f5`.

## What is next

Batch 3 CLOSED; its follow-ups (#749, #750, #751, #752, #753) are DONE. Per HANDOFF §7, what remains: (1) the S3
RULING — law 3s does not hold on the current build (the probe measures overlaps in named classes: a nail at rest,
two shots crossing, the boomerang's covering circle, an impaled skewer). The owner may rewrite the law, narrow
the sim (the nail placement, the boomerang's arc circle, the skewer) or accept the classes; the probe reports S3
and ratchets it either way, so the next work does not depend on the ruling. Also open on the owner's side: the
measure.mjs band calibration (6px) no longer holds on the curated gauntlet (15.505px measured) and the full law
re-proof is owed on the owner's machine. (2) Batch 4's tool MOVES — one home tools/ with proof/, doc/, measure/,
lib/; the .qa rename; the measure.mjs owner-go flag; SPEC/CONTRACT/BUILD to docs/planned/; RECIPES "Traps" ->
short rules and AGENTS as the one workflow home (both DONE in #755). Measured blast radius: 75 path substitutions in the three FROZEN
era files + 26 in live GAMES.md, i.e. non-whitespace edits to frozen historical text; docset.mjs is a dependency
of four tools and its repo-root contract must be kept. The REGISTRY half of that item is DONE in #752, so the
inventory is already agent-readable without a single file moving. Propose first; wait for "go"; ONE patch per
HANDOFF §6 + §6.7/§6.8, updating both handoff files in the same commit.

## APPENDIX — BATCH2-STATUS.md, carried forward verbatim

Its §8 ("Next: Batch 3 — see HANDOFF v5 §7") is superseded by the section above. Its figures are the
post-2c7 values; the canonical has not changed since.

BATCH 2 — canonical navigation (items 7, 8, 9): STATUS — COMPLETE

Was BATCH2-PROPOSAL.md, then STATUS in progress. Now: APPROVED AND EXECUTED TO COMPLETION.
D1-D6 are answered (§1). All patches are landed and pushed: 2a, 2b, and 2c1 through 2c7.
Nothing remains in Batch 2.

Final authoritative canonical state after 2c7:
canonical md5: 5de162de46eb4fa3204e3ee636f2aff3
lines: 4,716
stamp: links-r87
canonical ≈ 104,970 tokens
script block 0 carries 901 comment spans ≈ 49,330 tokens
(The last two are projections from the 2c7 dry run; the authoritative figures live in
STATE.md and docs/CODEMAP.md — re-read them, don't trust this prose.)

1. Decisions D1-D6 — ANSWERED

The owner's answer was a blanket delegation: "do what you think is the best for ai agents, this
repo is meant for ai agents. you are allowed to go against the doctrine if that's what you need,
just give me a heads up if you do, also do not run measure.mjs."

| # | Question | Answer | Basis |
| ---|---|---|---|
| D1 | Approve 2a? | Yes | 2a landed |
| D2 | Pointer style | // ref: <build-tag> | 62/67 tags resolve in GAMES. #NNN deferred until Batch 3(a) |
| D3 | Comment-ratio target | 20-30% band | CLOSED as unreachable-by-diet — see §4. ~48% is the floor with law kept |
| D4 | Owner quotes not found in GAMES | Keep them in the canonical | applied in every patch |
| D5 | CSS head + 2nd script block | Out of scope | ≈2.6k tokens |
| D6 | Grep measure.mjs read-only | Approved (grep yes, execute no) | §2 |

2. measure.mjs — grep findings (read-only, never executed)

It extracts the first <script> IIFE by text position, does not match canonical comment text,
and contains no writeFileSync. Comment-only canonical edits are safe from it. Indicative, not
exhaustive. Execution remains permanently banned.

3. Cumulative Batch 2 result (post-2b -> final)

The three strip-hash invariant hashes stayed identical through all eight canonical patches —
the accumulating proof that no code token moved anywhere in Batch 2:
non-script md5   c2cd01ef082e4b49101447dc2e2073d0
script 0 code    e9b6f8d6eb7f442c390c6cdb6517895b
script 1 code    600097a7b52d7d40b00797581e6d35a6

| metric | post-2b | final | Δ |
| ---|---|---|---|
| lines | 5,058 | 4,716 | -342 |
| canonical tokens | 115,356 | ~104,970 | -~10,400 |
| comment tokens | 59,736 | ~49,330 | -~10,400 |
| comment spans | 905 | 901 | -4 |
| comment ratio | ~52% | ~48% | |

Per-patch receipts (canonical md5 -> result):

| patch | scope | result |
| ---|---|---|
| 2c1 | loop/input/APP | bedca518… , 5,031 lines, -27 |
| 2c2 | circles/chain/geometry | 0776b237… , 4,999 lines, -31 |
| 2c3 | REGISTRY block comments | 7b0e6a3d… , 4,932 lines, -67 |
| 2c3b | REGISTRY trailing giants | 09f85c50… , 4,841 lines (0 net) |
| 2c4 | length growth | dcaa64b3… , 4,841 lines, -92 net |
| 2c5a | consts + poly builder | 29520663… , 4,857 lines, +16 net |
| 2c6 | SIM (all six markers) | 0b7fd414… , 4,765 lines, -92 |
| 2c7 | RENDERER (all six markers) | 5de162de… , 4,716 lines, -49 |

Note 2c4 and 2c5a moved lines UP: single-line art headers and the javelin/tome/scroll/orb
giants became readable multi-line blocks. Fewer tokens, more lines — the same trade Batch 3
makes in GAMES. Line count is not a diet goal; token cost and law-preservation are.

Each patch: strip-hash PASS (three invariants), verify --quick PASS, fingerprint 8/8,
verify --battery PASS. measure.mjs NOT run. Mojibake census clean on the final artifact.

4. Why the D3 band is closed (yield math, measured not assumed)

Code is invariant at ≈53.0k tokens (strip-hash's whole job). Comments landed at ≈49.3k. To reach
the band:
30% comments -> comments <= 22.7k -> remove another ≈26.6k tokens
20% comments -> comments <= 13.3k -> remove another ≈36.0k tokens
Every landed region removed 18-48% of its big-comment mass and left its law intact; the
remainder across the canonical is almost entirely rationale the code cannot express. That
≈26.6k is not coming from diet. The diet stopped at ≈48% by design.

Options, for the owner:
A (done, recommended): close the band at ~48%, law kept. Repo is navigable via the 1.5k
CODEMAP; agents rarely read the canonical whole.
B: relocate law into docs/LAWS.md as the sole authority, canonical law comments become
pointers. The only honest path toward 30%, but moves the problem and grows LAWS.md to ~20k+.
C: structural split (owner-only, rule 5). Highest payoff, highest blast radius.
A is the current state. B/C are not scheduled and require explicit owner sign-off.

5. Diet rules (battle-tested across eight patches)

R1 Keep comments stating a law, invariant, or a "why" the code can't show; tighten them.
R2 Replace provenance with `// ref: <build-tag>[, …]`, greppable in GAMES.md.
R3 Quote gate: every owner quote removed must be found (whitespace-normalised) in GAMES.md, or it
stays in the canonical (D4).
R4 Never touch data blocks (CIRCLES_V2, LEN_CIRCLES incl. BEGIN/END, POOL/EMBER,
SHOTS_ART), any code token, or any §4 anchor.
R5 Trailing comments stay unless pure provenance.

6. What Batch 2 did NOT verify

No browser or visual check. chromecheck uses DOM stubs.
8/8 fingerprints can be vacuous (the suite never rolls a spear and plays only the default
cast); the stripped hash covers it.
strip-hash cannot detect a corrupted character inside a replacement comment — mitigated by
git diff review and the mojibake census.
Unaudited: ingest.mjs write-back, the second script block, any reader not in §4.
measure.mjs was grepped, not fully read.
Rationale loss is a judgement call no tool can prove. Mitigated by the quote gate, the
canonical-prediet-2c tag, and the owner's per-patch review.

7. Rollback

Every canonical patch is independent: `git revert <commit>` restores it.
`git show canonical-prediet-2c:previews/spinclash-preview.html` recovers the pre-diet canonical
with all 2b markers intact. `git show canonical-precomments:<path>` recovers the pre-marker
canonical, so any single removed comment is reachable. Nothing is force-pushed. Pushes are the
owner's. Reminder: push canonical-prediet-2c and canonical-precomments to origin so a
fresh clone can reproduce strip-hash.

8. Next

Batch 3 — see HANDOFF v5 §7. Start with (a): Measured-facts entries -> ### headings.
