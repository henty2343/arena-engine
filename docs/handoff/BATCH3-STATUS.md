# BATCH 3 — GAMES.md usability and docs authority: STATUS — COMPLETE

LOCATION: docs/handoff/BATCH3-STATUS.md — REPO-HOSTED alongside HANDOFF.md (v11+). Updated in the same
commit as every landing; current as of HEAD by construction. Chat attachments of older copies are
OBSOLETE; the repo outranks them. Never move these files into docs/history/ (globbed by the doc
tools; an unlisted file there fails lint). Freshness: `git log -1 --format='%h %s' -- docs/handoff/`.

Status as of 2026-11-14: (a) DONE (0ddd7f5, #746) · (b) DONE (9e017bb, #742) · (d) DONE (f756e21, #747)
· (c) DONE (68e29f9, #748). Nothing remains in Batch 3. Its follow-ups: #749 DONE (4cc98d5) · #750 DONE (4f38866) ·
#751 DONE (63bb91c) · #752 DONE (361cbcb, the law-table completion + the probe registry) ·
#753 DONE (477c34a, the RENDERED-FRAME proof) · #754 DONE (46ffcd7, the measure.mjs header + the owner-go solidity run) · #755 DONE (ffc90ef, Batch 4a: RECIPES Traps -> short rules + AGENTS as the one workflow home) · #756 DONE (24e1e67, the measure.mjs stride fix) · #757 DONE (0d0be4d, docs only - the lenStep finding and the retraction of #756's law 3 claim) · #758 DONE (a3d484c, the lenStep fix, harness-side) - #759 DONE (708d4b9, docs only - the 2026-11-15 solidity re-run on the lenStep fix and the defect-tracker ruling) - #760 DONE (77cc38d, docs only - sequence item (a) complete; D2/D3 reclassified as substep displacement artifacts) - #761 DONE (41f6445, removes the three throwaway diagnostics #760's git add -A swept in; adds the scratch-before-add gotcha) - #762 DONE (a2efbb1, docs only - the rotdof open-loop finding, rotation clears the D1 pin; the band-dump comment's resolver line numbers are stale) - #763 DONE (324aa3e, docs only - the bladeVsBlade body read recorded) - #764 DONE (c42db5a, docs only - the D1 evidence correction: the anchor pair is bloom-transfigured and solid-free; the (b2) controller is withdrawn) - #765 DONE (3b11f34: D1 ruled an audit artifact; the harness-side bloom exemption in measure.mjs and frame-proof; new bloom-proof; the non-bloom remainder classified) - #766 DONE (ea20c13: docs only - the owner's 2026-11-16 --solidity re-run on the bloom exemption recorded) - #767 DONE (242f7f8: docs only - the #766 hash and post-push receipts, and the lenStep grow-tick candidate REFUTED; the law-3/3s verdict-line ruling was then open and is made in #768) - #768 DONE (994650a: harness-side - the law-3/3s verdict lines become a DEFECT TRACKER, new .qa/verdict-proof.mjs; the canonical is untouched) - #769 DONE (953f850: docs only - #768's hash and post-push receipts; the tracker is unexercised, no --solidity run yet) - #770 DONE (42bd4bd: docs only - the resolver diagnostic finding and the owner's defect ruling) - #771 DONE (3d52799: docs only - the owner's --solidity run on the defect tracker recorded, the prior-agent closed-loop trial recorded, and the s6.7 / s9 delivery sentences rewritten to the one-patch-FILE route) - #772 DONE (this commit: docs only - #771's hash and post-push receipts recorded, and the variant C trial recorded: C FAILS the owner's gate).
Next: #772 recorded (1) #771's landing hash 3d52799 with its post-push receipts and (2) the VARIANT C TRIAL: C FAILS the owner's gate (clear the deepening with NO new visible overlap) - deepening 78 -> 10 events (none over 0.5px) but 4 NEW visible tick-entry overlaps on the naturals (all latched at entry; three are axe/flail and staff/nunchaku pairs, the families the prior trial called chain-weapon latched pairs), the longest latched-entry run 39 -> 59, fingerprint 6/8, and the one-tick replay of the 19 hold decisions worse in 19 of 19; so NO (b2) proposal exists. The one-step rotation-only gap is a poor proxy for the closed-loop outcome and hold is harmful in sustained binds (consistent with the prior-agent finding). PROPOSED next step, NOT approved - propose it again and WAIT for the owner's "go": a read-only trial of the multi-step capped controller (#763 sketch) through the same loadSim transform hook (scratch only, no canonical touch); optionally, first, a C WITHOUT hold (UNTESTED: it is not measured whether dropping hold removes the 19 worse replays). If a variant clears the deepening with no new visible overlap, the agent brings the (b2) proposal - a canonical edit = the owner's rule-5 decision, with the full battery, a new probe in the bloom-proof pattern and a fingerprint re-baseline - and the owner rules. Infinity (a non-finite parryGap = blades clear by more than parryPad, 4px) is the BEST outcome; #762's 'non-finite degeneracy' is a MISREADING (superseded, not rewritten). Any measure.mjs edit, Batch 4(b)'s owner-go flag included, still needs the owner's explicit go. Work that touches neither measure.mjs, the canonical nor the audit counters can proceed: Batch 4(b)'s verify.mjs as a manifest reader (no frozen-text edits); Batch 4(a), the .qa rename + the SPEC/CONTRACT/BUILD move to docs/planned/, needs the owner's explicit OK for the frozen era files. Other open items (tracked, not blockers): the drawn joke object's own silhouette vs the foe's weapon is UNMEASURED; D4 / law 3s visible subset; frame-proof's 2,500-tick horizon; the law-3 info line's stale resolver line numbers (the 2026-11-16 report still prints 'sim :1697-98' and ':1713'); AGENTS.md workflow step 5 still says the patch is 'pasted in chat' and contradicts HANDOFF s6.7 as rewritten by #771 (AGENTS.md was NOT edited by #771 or #772; HANDOFF s6.7 wins until a later landing aligns it - the owner has not said go).
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

## #772 #771's hash and post-push receipts + the variant C trial recorded - ledger (this commit)

What: DOCS ONLY, both handoff files. (1) Records #771's landing hash 3d52799 and its post-push receipts (the owner's hand-over; labelled prior-agent where the #772 agent did not re-run them: the pushed diff vs 42bd4bd byte-identical to the delivered patch, md5 8c687169731a056ca90886755e94f728; the #772 agent re-measured the freshness hashes, the two handoff md5s, the canonical, verify --quick and verdict-proof on its own clone at 3d52799). (2) Records the VARIANT C TRIAL (agent-run, read-only, scratch scripts not in the repo): base reproduced the prior-agent figures exactly; C cuts the deepening 78 -> 10 events but adds 4 NEW visible tick-entry overlaps on the naturals, lengthens the longest latched-entry run 39 -> 59, moves fingerprint cells 6/8, and its pair-wide hold is worse in the one-tick replay in 19 of 19 - C fails the owner's gate; the fallback (multi-step capped controller, #763 sketch) is PROPOSED, NOT BUILT. (3) Renames the #771 ledger header to its hash, adds the #772 status/Next/State-after/s7/s9/s10 entries.

Why: the next agent must start from measured C results and from the fact that the one-step gap is a poor proxy and hold is harmful, not re-run C; and the #771 entries still said their hash was unknown.

Approved: the owner's "go" on variant C (read-only, scratch only), then the owner's "go" on the landing as #772 (2026-11-16). AGENTS.md was NOT touched (out of scope, flagged again).

Deviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES, STATE or generated file touched; earlier dated entries are not rewritten (the #771 status entry gains its hash only; the prior-agent trial entry stays as recorded and is now partly re-measured by the s7 C entry). The trial scripts are throwaway (scratch/, gitignored) and are NOT in the repo, so the numbers are not re-runnable from the repo; the method is in HANDOFF s7. The agent's first chat summary said '18 of the 19 hold events are one s23 bind' and 'worse on the next entry gap in 19 of 19'; the measured figures are 17 of 19 and, for the next entry gap alone, 18 of 19 (19 of 19 on the 7-entry minimum) - this file carries the corrected figures.

Not verified: measure.mjs never run; the effect of any controller beyond 40 naturals + s101; why later-ending seeds end later; the mechanism of the 4 NEW overlaps; a C without hold; the drawn joke object's silhouette; the patch md5 and pushed-diff identity of #771 (hand-over only). The battery and strip-hash not run (the canonical is untouched).

Rollback: `git revert` this commit.

## #771 the owner's solidity run on the defect tracker + the prior-agent closed-loop trial + the file-delivery rewrite recorded - ledger (commit 3d52799)

What: DOCS ONLY, both handoff files. (1) Records the owner's 2026-11-16 --solidity run on 994650a (the owner's statement; cmd.exe, plain > redirects, exit=0 per the owner, 589.9s wall, 8 workers, 109 battles; solidity-report.txt md5 18708379e4b230736a19302ded0a0ab1, 216 lines; neither file is in the repo): integrity [PASS] (0 missing across 229971 / 4585065 / 310536); the defect tracker's first real output is [TRACK] for law 3 (band visible 42/1243128 vs baseline 42, worst 14.185px vs 14.185, mirror 27 / 10 / 11.559px vs 27 / 10 / 11.559) and [TRACK] for law 3s (blade 1296 / body 19609 / rim 54605 / pair 1061228 / worst 74.971px, each equal to its baseline) - the #768 prediction held; every other counter in the report equals the #766 record (checked string by string against the report this session); the only difference is the wall time, 589.9s vs 366.5s (cause not investigated). (2) Records the prior-agent closed-loop trial of nudge-sign variants A and B from the owner's hand-over prompt, every figure labelled prior-agent and NOT re-measured by this agent: deepening 78 -> 2 / 0, new visible tick-entry overlaps A 7 / B 6, the NEITHER ticks gone, fingerprint 6/8 on both scratch variants, the s24 t7617 pop unchanged by the variant, the 20 no-sign-improves events, the conclusion that neither variant meets the owner's gate, and the proposed (not approved) variant C. (3) Rewrites HANDOFF s6.7 and the s9 new-chat prompt (and the Next / Delivery lines, the s9 per-patch sentence and the 6.4 pointer) to the one-patch-FILE route, as the owner authorised; the old chat-paste / base64 route is kept only as a labelled fallback with its measured reason. (4) Adds the #771 status entry, the State-after-#771 block, the dated s7 entries, renames #770's ledger header to its hash 42bd4bd (and its status entry gains it), rewrites the Next line, the new-chat prompt context and section 10.

Why: the defect tracker was recorded as unexercised and its output a prediction; the owner's run turns that into a measured outcome, and the next agent must start from it. The prior-agent trial numbers lived only in a hand-over prompt and would be lost; they fold into the record with their provenance. The delivery rewrite aligns the repo with the route the owner now uses (the #770 patch was applied as a file).

Approved: the owner's "go" (2026-11-16): read the four docs, read the report, build ONE docs-only patch as #771 recording the run, the prior-agent trial (labelled), and the delivery rewrite (authorised), deliver it as a patch file with the fresh-clone proof, and NOT run variant C yet.

Deviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES, STATE or generated file touched; earlier dated entries are not rewritten (the #768/#769 'unexercised' wording is superseded by the new s7 entry). FLAGGED: AGENTS.md workflow step 5 still says 'Deliver ONE patch, pasted in chat ... the owner has no download channel' and now contradicts HANDOFF s6.7; the owner's scope for #771 was the two handoff files, so AGENTS.md (and its STATE token cost) was NOT edited - to be aligned in a later landing with the owner's go. The Next line also lifts nothing by itself: the #769 hold on measure.mjs edits is stated as satisfied, but any such edit still needs the owner's explicit go. The exit=0 and the commit 994650a are the owner's statements; the report and progress files carry neither.

Not verified: the prior-agent trial figures (not re-measured; scratch scripts not in the repo); the cause of the wall-time difference; that the run was on 994650a (the report prints no commit); the PASS and FAIL paths of the tracker on a real run; measure.mjs never run by the agent. The battery and strip-hash not run (the canonical is untouched).

Rollback: `git revert` this commit.

## #770 the resolver diagnostic finding + the owner's defect ruling recorded - ledger (commit 42bd4bd)

What: DOCS ONLY, both handoff files. Records the read-only resolver diagnostic for the NEITHER class (agent-run 2026-11-16, headless on the canonical 5de162de46eb4fa3204e3ee636f2aff3, throwaway scratch scripts, NOT measure.mjs): the resolver ran and stalled at all six targets (never the 16-pass cap) and the first latched, spin-opposed nudge in the tick deepened the gap by rotation alone (10/10 distinct events at the targets; population seeds 1-40: 78 of 165, latched 76/133 vs unlatched 2/32; all 5 NEITHER visible ticks follow one, none of the 8 mirror-class ticks does); #762's non-finite 'degeneracy' is a misreading (non-finite = clear by more than 4px; 462,651 of 465,772 entry poses; the rebuilt grid reproduces #762's 1,421); the s101 pop is the resolver's own 93.68px snap-apart at t8011; and the owner's ruling (CONFIRMED PRODUCT DEFECT, tunneling-shaped, no canonical edit yet) with the closed-loop trial as the next step. Adds the #770 status entry, the State-after-#770 block, the dated s7 entry, renames #769's ledger header to its hash 953f850 (and its status entry gains it), rewrites the Next line, the new-chat prompt context and section 10.

Why: the cause of the five NEITHER ticks, which #767 left UNKNOWN, is now measured, and the owner has ruled on it; the next agent must start from the ruling and the trial scope, not re-derive them, and must not carry #762's degeneracy reading into a controller design.

Approved: the owner's "go" (2026-11-16) on the read-only diagnostic and on the population diagnostic, then the owner's rulings ("DEFECT, treat as such - in direction", then "confirmed product defect") and the order to record the finding and the ruling as #770, docs only, with the trial as next and its results folded into a later landing.

Deviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES or generated file touched; #762's text is superseded here, not rewritten. The diagnostic scripts are throwaway (scratch/, gitignored) and NOT in the repo, so these numbers are not re-runnable from the repo until the (b2) probe exists; the method is in HANDOFF s7. The delivery sentences inside the new-chat prompt were left exactly as written (the owner's earlier instruction not to change s6.7 / the s9 delivery block), although the owner's current instruction for this chat series is a downloadable file - flagged to the owner, not edited.

Not verified: measure.mjs never run; the closed-loop effect of any controller (the trial is the next step); the forced matrix beyond s101; why the resolver clears only at about -24px; why the loop's own exit gap understates the true post-resolver gap; the rotation-only counterfactual is a one-step probe on the mid-loop pose. The battery and strip-hash not run (the canonical is untouched).

Rollback: `git revert` this commit.

## #769 #768's hash and post-push receipts recorded; the tracker is unexercised - ledger (commit 953f850)

What: DOCS ONLY, both handoff files. Records #768's landing hash 994650a and its post-push re-measurement on a fresh clone of origin (agent-run, read-only): the pushed commit's diff vs 242f7f8 is byte-identical to the delivered patch (md5 6970abcbad7e6f06542de33a138611ab, 75,581 bytes); the six shipped files match what was built (measure.mjs 37c772e226ad63347f6cc161e3508978, .qa/verdict-proof.mjs 863202c480c0f2efd95ffc910343ccb9, manifest.json 8eff44cef2583c6d641a74067e4a3493, STATE 8f86002cb73aaade4b5f344d8b3df762, HANDOFF 4153e10c075c78fb1d2261c755562f6e, BATCH3-STATUS 60b780d89115967357e3ba5d323b0d52); canonical 5de162de46eb4fa3204e3ee636f2aff3 untouched; verify --quick PASS (6 checks) and verdict-proof 4/4 on origin; freshness hashes match; tree clean. States plainly that the tracker is UNEXERCISED (no --solidity run on 994650a). Adds the State-after-#769 block and the dated s7 entry, renames #768's ledger header to its hash, rewrites the Next line, the new-chat prompt and section 10.
Why: every landing carries its hash and post-push receipts, and the next agent must not mistake a prediction for a result. The Next line now sequences the work around the owed run: no further measure.mjs edit until it exists, so an odd result stays attributable.
Approved: the owner's "go 769" (2026-11-16) after the proposal: land #769 as a docs-only record and leave the --solidity run for a later gap.
Deviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES or generated file touched; no run result is recorded because none exists; earlier dated entries are not rewritten (the #768 status entry gains its hash only). The one procedural note recorded (git apply --index then commit with no separate git add) is harmless and measured.
Not verified: measure.mjs never run - the tracker's real-run output, label text and the [TRACK]/[TRACK] prediction are unmeasured; no proofs re-run beyond verify --quick and the post-push verdict-proof (docs only); the battery and strip-hash not run (the canonical is untouched).
Rollback: `git revert` this commit.

## #768 the law-3/3s verdict lines become a DEFECT TRACKER + verdict-proof - ledger (commit 994650a)

What: HARNESS-SIDE + DOCS (the canonical, LAWS.md and frame-proof are untouched). (1) measure.mjs (owner-go read from the delegation; node --check OK; NOT run): LAW3_BASE / LAW3S_BASE / VEPS / verdict3 / verdict3s added after the f2 helper between VERDICT-BLOCK markers; the law-3 and law-3s verdict lines take their tag from them (PASS at goal 0, FAIL on a regression of any counter vs the 2026-11-16 baseline checked BEFORE the goal, TRACK otherwise); the retired 6px / 2% gate and the 3s zero-count / <1px gate are gone from those two lines; the header tier comment updated; polyTicks and every counter computation unchanged (diff review: 8 lines deleted - five law-3 header lines, one law-3s header line and the two old verdict lines - and nothing else). Bloom counters not ratcheted. (2) New .qa/verdict-proof.mjs (4/4; read-only, never runs measure.mjs). (3) tools/manifest.json registers verdict-proof (battery step, citable false); STATE.md regenerated. (4) Both handoff files: the #768 status entry, the State-after-#768 block, the dated s7 ruling entry, this ledger, #767's ledger header renamed to 242f7f8 (and its status entry gains the hash), the Next line, the new-chat prompt, section 10, and the s4 battery list gains verdict-proof.
Why: the two verdict lines gated bounds the owner's defect-tracker ruling (#759) had already retired, so they read [FAIL] on every run and carried no information; the ruling was open since #766. As a tracker they keep the goal visible and make any regression loud while layout work (Batch 4) proceeds.
Approved: the owner's delegation of the ruling (2026-11-16, "you do what you think is best for the project"; the previous agent ruled, the owner accepted) and the owner's "go" in this chat on the rebuild. The previous agent's patch and its md5s were REFERENCE only: this is a rebuild gated on the contract, so its files do not match those hashes by construction.
Deviations: (a) px floats are compared at the baseline's 3-decimal precision as well as with the 1e-6 epsilon (the delegated text said only the epsilon); reason in HANDOFF s7; one-line revert (the r3() call in worsePx). (b) The first build dropped the label anchors LAWS.md's C3 and S3 rows cite; verify --quick (lint-docs) caught it and the labels now carry them verbatim; verdict-proof V1 now asserts them. (c) The 21 V2 cases are this build's own enumeration of the contract (11 law 3, 10 law 3s; the last case is non-finite fails closed), not the previous agent's list. (d) No canonical, LAWS, GAMES, frame-proof or other generated file touched; delivery rules (s6.7 / the s9 delivery block) unchanged.
Not verified: measure.mjs was never run, so the label text and the [TRACK]/[TRACK] outcome on a real run are a PREDICTION (counters identical to #766 on the deterministic population), not a measurement; the owner's next --solidity run is the first exercise. The baseline is the owner's report (not in the repo), quoted. The full battery and strip-hash were not re-run (the canonical is untouched). Whether any px counter's true value sits above its rounded baseline is unknown, which is why the compare is at the baseline's precision.
Rollback: `git revert` this commit.

## #767 the lenStep grow-tick candidate refuted + the #766 hash and post-push receipts - ledger (commit 242f7f8)

What: DOCS ONLY, both handoff files. (1) Records #766's landing hash ea20c13 and its post-push re-measurement on a fresh clone of origin: the pushed commit's diff is byte-identical to the delivered patch (md5 431c6cf7d5190560029bba6e2d26ca28, 51,476 bytes), HANDOFF 6b3286cf3e142213f595d59334d51722, BATCH3-STATUS 9217c92dd10719961c2af4d407ec91a1, canonical 5de162de46eb4fa3204e3ee636f2aff3 / 4,716 lines untouched, verify --quick PASS (6 checks) on origin, freshness hashes match, tree clean. (2) Records the lenStep GROW-TICK TEST (owner go 2026-11-16; agent-run headless, read-only, throwaway scratch/lengrow-766-diag.mjs, NOT measure.mjs): all six targets reproduce to 3 decimals (forced flail+hammer s101 our t8011 = measure's t8012 14.185px; the 5 NEITHER naturals 6.978 / 8.512 / 2.986 / 6.394 / 8.352px) and at every one lenStep is UNCHANGED across the tick and the previous tick, no link added, so the post-grow gap is identical and clears nothing; entry lenStep [12,0] / [12,0] / [0,10] / [0,0] / [0,0]; figT 0 at all six. THE CANDIDATE IS REFUTED - the NEITHER class and the s101 band worst are real entry-pose overlaps of the actual geometry, cause UNKNOWN; the next read-only step is the resolver's behaviour on those poses (bladeVsBlade :2206+), not chain length. (3) HANDOFF s6.7 gains the chat-paste corruption gotcha (base64-of-gzip + md5 gates, and the workspace-wipe failure mode). Adds the State-after-#767 block and the dated s7 entry, renames #766's ledger header to its hash (ea20c13) and appends its post-push line, refreshes both Next lines, the new-chat prompt and section 10.
Why: the handoff listed the lenStep grow residue as the standing candidate for the 5 NEITHER visible ticks; the test closes it, so the next agent does not re-run it and looks at the resolver instead. The #766 hash and its post-push receipts belong in the record for the same reason every landing carries them.
Approved: the owner's "go" (2026-11-16) on the proposal: record the test refutation and the #766 hash/receipts as #767, docs only.
Deviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES or generated file touched; one NEW s6.7 process bullet (the delivery corruption measured this session) is beyond the two recorded items and is flagged here; the scratch test script is NOT committed; earlier dated entries are not rewritten (the #766 entries gain their hash and an appended post-push line only); no GAMES entry (the canonical did not move).
Not verified: the CAUSE of the 5 NEITHER ticks and of the s101 band worst (unknown; the resolver diagnostic is not started); six ticks, not a population; the owner's report numbers are quoted, not agent-measured; measure.mjs never run; the verdict-line ruling is open; the joke-object silhouette still unmeasured; no proofs re-run beyond verify --quick (docs only).
Rollback: `git revert` this commit.

## #766 the owner's solidity re-run on the bloom exemption recorded - ledger (commit ea20c13)

What: DOCS ONLY, both handoff files. Records the owner's own 2026-11-16 run of measure.mjs --solidity on the #765 build (HEAD 3b11f34, cmd.exe, plain > redirects, exit=0, 366.5s wall, 8 workers, 109 battles; the full report is NOT in the repo): integrity PASS (0 missing across 229,971 chain ticks, 4,585,065 chain substeps, 310,536 chain-foe shot checks; 40/40 naturals and 69/69 forced terminated); law 3 overlaps 2,656/1,243,128 (0.21%), visible 52 (0.00%), worst 14.185px (flail+hammer s101 t8012 r1, spins -8.3/3.5, visible, no lead/headLead, no previous-tick parry - a chain cell beyond frame-proof's 2,500-tick horizon), mirror unchanged 27/10/11.559px, band visible 42, band population 2,629 (211 with a previous-tick parry but not its last substep / 2,003 with neither lead/headLead); the bloom line 26,640 bloomed-at-entry ticks, 457 real-geometry overlaps, 401 visible, worst 26.100px (the D1 anchor), and 52 + 401 = 453 = the pre-exemption visible count (nothing lost); law 3s 472 bloomed-blade overlaps apart, remaining blade 1,296 / body 19,609 / rim 54,605 / pair 1,061,228 over 439,143 shot-bearing frames, worst 74.971px (NO decomposition claim: 1,296 + 472 = 1,768 != 1,888, the 2026-11-14 pre-lenStep figure; the pre-exemption blade count on the lenStep build was never recorded; body/rim/pair/worst identical to 2026-11-14); laws 1 (12/7,293), 2 (3/2,868), 2s (43/1,837), 4 (66 + 94,476), 5 (10, flip 0/2,868), 1s (495/2,849, worst death gap 54.08), 4s (60: 57 + 3) and stall (5.26s) unchanged; PASS laws 6, 5s, 6s, integrity. Notes the [FAIL] verdict lines still gate the RETIRED bounds (measure.mjs :1225 the 6px/2% band bounds, :1233 the zero-count/<1px - agent grep at 3b11f34); the owner's ruling is open. Adds the State-after-#766 block and the dated s7 entry, renames #765's ledger header to its hash (3b11f34), refreshes both Next lines, the new-chat prompt and section 10.
Why: the #765 exemption shipped with measure.mjs NOT run; the owner's re-run is the first 109-battle measurement under it, and the handoff must carry it before the next step (the lenStep grow-tick test) builds on it. The 52 + 401 = 453 conservation is the exemption's own arithmetic check on the full population.
Approved: the owner's "go" (2026-11-16) on the proposal: record the run as #766, then test the lenStep grow-tick candidate headlessly (read-only, scratch/), then ask for the verdict-line ruling.
Deviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES or generated file touched; the numbers are the owner's report, quoted (NOT agent-measured; the report is not in the repo); earlier dated entries NOT rewritten (the #765 status entries gain their hash only); no GAMES entry (the canonical did not move).
Not verified: the agent did not run measure.mjs (agents never run it); the lenStep grow-tick candidate is UNTESTED at this landing (the test is the next step, go given); the verdict-line ruling is open; the drawn joke object's silhouette is still unmeasured; no proofs re-run beyond verify --quick (docs only).
Post-push re-measurement (#767, fresh clone of origin at ea20c13): the pushed commit's diff is byte-identical to the delivered patch (md5 431c6cf7d5190560029bba6e2d26ca28, 51,476 bytes); HANDOFF 6b3286cf3e142213f595d59334d51722 and BATCH3-STATUS 9217c92dd10719961c2af4d407ec91a1 as built; canonical 5de162de46eb4fa3204e3ee636f2aff3 / 4,716 lines untouched; verify --quick PASS (6 checks) on origin; the freshness hashes match; tree clean. Delivery note: the raw diff paste arrived corrupted; the base64-of-gzip route with md5 gates localized 3 single-character transcription errors, which were re-sent and fixed before the push (HANDOFF s6.7).
Rollback: `git revert` this commit.

## #765 D1 ruled an audit artifact; the harness-side bloom exemption + bloom-proof - ledger (commit 3b11f34)

What: (1) measure.mjs (owner-go edit, node --check OK, NOT run): entryFig stash beside entryLs; the law-3 entry pass counts a pair with a bloomed fighter at tick entry in bloomPairTicks/bloomOverlap/bloomVis/bloomWorst instead of the band counters; the law-3s blade test counts a bloomed foe blade in shotRenderBladeBloom; all five in ACC_ADD/ACC_MAX/accSnapshot/the merge; one new [----] report line. (2) .qa/frame-proof.mjs: figT in the pose, the same routing for C3 and S3, a bloom report line, and the CALIBRATION NOTE made conditional (it said the 6px bound does not hold; on the re-baselined gauntlet the band worst is 0.579px). (3) new .qa/bloom-proof.mjs (6/6) registered in tools/manifest.json (battery step; STATE regenerated). (4) HANDOFF s7 D1 RULING AND THE BLOOM EXEMPTION, State-after-#765, s4 battery list, new-chat prompt, s10; #764's ledger header renamed to its hash.
Why: the owner delegated the D1 ruling to the agent ("go, you decide if its an artifact or not"). The agent rules D1 an audit artifact: the pair is solid-free by the sim's own design (bladeVsBlade :2209), the resolver never ran there, the drawn weapon is the joke object; so the audit should count such pairs apart instead of reading them as interpenetration.
Approved: the owner's go (2026-11-15), including the owner-only measure.mjs edit (as #758 did) and the delegated D1 ruling.
Deviations: (a) measure.mjs edited, NOT run; the 109-battle population under the exemption is unmeasured and the owner's re-run is owed. (b) polyTicks is deliberately unchanged. (c) The ruling also ACCEPTS, by design, a viewer-visible crossing of a joke object and a weapon: that rests on bloom-r73's solid-free spec, not on a measurement - the drawn silhouette vs the foe's weapon is unmeasured. (d) bloom-proof B4 is near-tautological by construction (labelled so in its header). (e) The 40-natural classification was a throwaway scratch script (scratch/, not committed), agent-run headless, reproducing #764's numbers exactly (465,772 fight ticks, 923/291/274/261).
Not verified: measure.mjs's own run (never run); the lenStep grow residue as the cause of the 5 neither-class ticks (candidate only); the full battery and strip-hash (canonical untouched, not re-run); the other 19 weapons' bloom pairs beyond the 40 naturals and the 31 frame-proof cells.
Rollback: `git revert` this commit.
## #764 D1 evidence correction - the anchor pair is bloom-transfigured and solid-free; the resolver never ran there - ledger (commit c42db5a)

What: DOCS ONLY, both handoff files. Records the read-only pre-check the owner approved (REACH and G.clash at the anchor) and what it found instead (HANDOFF s7, D1 EVIDENCE CORRECTION): the anchor reproduces headless (26.100px at G.t 4941, 119 overlap ticks), but the axe is bloom-transfigured there (figT 670 / 591), the pair is solid-free by design (bladeVsBlade returns at :2209), the resolver logged zero calls at the anchor ticks, and 261 of 274 visible overlap ticks in 40 natural seeds are bloom ticks (worst with bloom 26.100px, worst without 11.559px). Withdraws the capped-controller sketch (#763) and the (b2) canonical edit as the next step; D1 is an audit artifact on this evidence (owner to rule). Also: REACH axe 212.1457894293687 / wand 139.64, nudge caps 0.0566 / 0.0859 rad, 2 nudges in 6,000 ticks. Adds the State-after-#764 block, renames #763's ledger header to its hash, refreshes the new-chat prompt and section 10.
Why: the handoff pointed the next agent at a canonical controller edit for a defect the sim does not have; the record must carry the correction before anyone builds on it.
Approved: the owner's go (2026-11-15) for the REACH and G.clash pre-check; this docs-only record follows the handoff rule that every finding lands in both files.
Deviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES or generated file touched; the probes were throwaway scratch scripts (not committed, not on the owner's machine); #762 and #763 are NOT rewritten - this entry supersedes their D1 conclusion; D1 stays listed as open until the owner rules.
Not verified: a 40-natural headless sample, not measure.mjs's 109-battle population; the 13 non-bloom visible ticks are unclassified; the drawn joke object's own geometry vs the foe's weapon is unmeasured; no proofs re-run (docs only).
Rollback: `git revert` this commit.
## #763 the bladeVsBlade body read recorded - ledger (commit 324aa3e)

What: DOCS ONLY, both handoff files. Records the read-only read of bladeVsBlade's body (:2206-2340) and the controller sketch (HANDOFF s7, RESOLVER BODY READ): where the nudge writes wAngle (:2306-07), its trigger, gate, magnitude and sign rule, that the band-dump comment's torque/Math.sign description is confirmed (only its line numbers were stale), two unverified hypotheses for why the D1 pin persists, and a proposed (unapproved) capped controller. Adds the State-after-#763 block, renames #762's ledger header to its hash, refreshes the new-chat prompt and section 10.
Why: #762 left the resolver body marked UNREAD; a fresh agent would repeat the read. The record should carry the result.
Approved: the owner's instruction (2026-11-15) to read the body read-only; the owner asked that the handoff be current for a next agent.
Deviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES or generated file touched. The sketch is a proposal; nothing is approved or started.
Not verified: the two hypotheses (latched at the anchor? spin-opposed net-zero?); the REACH values for axe and wand; whether the controller fits the nudge budget closed-loop; no proofs re-run (docs only).
Rollback: `git revert` this commit.
## #762 sequence item (b) open-loop result - rotation clears the D1 pin; the band-dump comment's resolver line numbers are stale - ledger (commit a2efbb1)

What: DOCS ONLY, both handoff files. (1) Records the read-only open-loop rotation probe for D1 (throwaway scratch/rotdof-diag.mjs rev 5, owner-run, NOT committed; seed 27 natural, axe vs wand round 1): the 26.100px anchor reproduces at OUR t4941 = measure's t4942; the +/-0.40 rad rotation grid (bodies fixed, wAngle free, geom.parryGap) clears all 5 deepest pins with a FINITE rotation (min-clear 0.18 / 0.30 / 0.26 / 0.14 / 0.14 rad, worst 0.30 at t5020, 12.4-17.3px of real separation); 1421 grid cells were NON-FINITE, so a real controller must cap below the degeneracy. D1 is a MISSING-ROTATIONAL-DOF defect, not a geometric hard limit - the fix direction is proven open-loop (an optimistic bound; the real nudge caps rotation, so the budget is proven viable, not yet sized). (2) Records the RESOLVER LOCATION CORRECTION: the law-3 band-dump comment's line numbers (torque :1697-98, Math.sign :1713) are stale - those lines are rollWeapons/startFight; the resolver is bladeVsBlade at :2206 and its body is UNREAD. (3) Updates the Next line and section 7 to: (b) OPEN-LOOP DONE - read bladeVsBlade's body (:2206+) and design the capped controller, then (b2) canonical = rule-5 owner decision; adds the State-after-#762 block; renames #761's and #760's ledger headers to their commit hashes; refreshes the new-chat prompt and section 10.
Why: the owner's defect sequence (HANDOFF s7) needed to know whether D1 is a geometric limit or a missing degree of freedom before any canonical edit is proposed; the open-loop probe answers it and names the controller constraint (cap below the non-finite boundary, fit the nudge budget).
Approved: the owner's instruction (2026-11-15) to land #762, docs only, as the first action of the session, with the finding text given verbatim.
Deviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES or generated file touched; the throwaway probe is local-only in scratch/ (gitignored) and was NOT committed; D1 stays OPEN (now with a proven fix direction), D2/D3 stay closed as audit artifacts (#760), D4 (law 3s visible subset) stays open and unprobed. The finding text was taken verbatim from the owner's instruction; the agent did NOT re-run or re-derive the probe.
Not verified: the probe numbers are the owner's run, not re-measured by the agent; contiguity of the rotation budget per pin is unmeasured; the resolver body (:2206 onward) is unread, so the band-dump comment's torque/Math.sign description is unverified against current code; no proofs re-run (docs only).
Rollback: `git revert` this commit.
## #761 removal of the throwaway diagnostics #760 swept in + the scratch-before-add gotcha - ledger (commit 41f6445)

What: (1) removal of diag-1s.cjs, land-760.cjs and scratch-measure.mjs - three throwaway diagnostics that #760's `git add -A` committed by accident (they sat in the repo root; the .txt reports had already been moved to scratch/ so they escaped). (2) HANDOFF section 8 gains the owner-machine hygiene gotcha: move scratch to scratch/ (gitignored) or add explicit paths before committing; measure/diag reports never enter the repo. (3) Both handoff files record #760's commit hash (read from git at script run time) and this landing.
Why: the repo root must stay free of throwaway instruments (gen-state's census and the record's cleanliness depend on it), and #760's message says docs-only while the commit carried three scripts - this ledger corrects the record.
Approved: owner's cleanup instruction (2026-11-15) after `git status` showed the tracked deletions.
Deviations: removals are normally TAGGED first; these three are throwaway diagnostics introduced two commits ago, never released and cited by no proof or doc anchor, so tagging would add noise - flagged here in the same message per the go-against-doctrine rule.
Not verified: no proofs re-run; the three scripts are inert (land-760.cjs is idempotence-guarded and now refuses; scratch-measure.mjs is a logging copy of measure.mjs; diag-1s.cjs is a patcher).
Rollback: `git revert` this commit restores the three scripts.
## #760 sequence item (a) complete - D2/D3 reclassified as substep displacement artifacts - ledger (commit 77cc38d)

What: DOCS ONLY, both handoff files. (1) Records the read-only diagnostic of laws 1s/2s (scratch-measure.mjs, a throwaway copy of measure.mjs with two console.log injections at the shotPhantom/swatNoTouch sites; wand+bow, 8 seeds, 50 battles, 784.8s, run by the owner in cmd.exe): it logged the stored event coordinates for the first 10 phantom shot hits and 10 whiff-swats. (2) THE FINDING: the sim fired each land/swat event correctly (its substep contact test saw the overlap), but the event stores the shot's POST-SUBSTEP position while the recomputed victim centre is the stored death-pose centre, so recomputing the gap from stored fields shows false positives (logged gaps 0.05px to 52.20px; population worst 54.08px). Same root-cause family as the lenStep drift (#757): the event payload cannot reconstruct the contact instant. The viewer never sees damage or a swat without contact, so these are AUDIT artifacts, not product defects. (3) Reclassifies D2 (495/2,849 phantom shot hits) and D3 (43/1,837 whiff-swats) from open defects to disclosed audit artifacts; D1 (infeasible pin 26.100px at axe vs wand) and D4 (visible shot-render overlaps) remain open. (4) Sequence item (a) is CLOSED; next is (b) the rotational-DOF design probe for D1.
Why: the owner ruled (2026-11-15) that only VIEWER-VISIBLE interpenetration or damage-without-contact is a defect; the diagnostic proved the 1s/2s reds are not viewer-visible. For a game that will keep adding weapons, a hard 0-phantom shot law would chase audit artifacts forever.
Approved: owner's "do what you think is the best, with scaling in mind" (2026-11-15).
Deviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES or generated file touched; the throwaway diagnostic was NOT committed (scratch only); the law table Status column is unchanged (1s/2s stay owner-run laws, now with a disclosed artifact class).
Not verified: no proofs re-run (docs only); the diagnostic ran on wand+bow only (the highest-shot cell), not the full 109-battle population.
Rollback: `git revert` this commit.
## #759 the 2026-11-15 solidity re-run on the lenStep fix + the defect-tracker ruling - ledger (commit 708d4b9)

What: DOCS ONLY, both handoff files. (1) Records the owner's 2026-11-15 --solidity re-run on the #758 lenStep fix (cmd.exe, exit=0, 657.2s wall, 109 battles, 8 workers, canonical md5 unchanged): law 1 phantom hits 111 -> 12, law 2 parries-without-touch 117 -> 3, law 2s swats-without-touch 116 -> 43, law 4 replica mismatches 283 -> 66 and stuck flags 123,260 -> 94,476; law 3 worst 27.399px -> 26.100px at natural seed 27 t4942 (axe vs wand, spins 6.5/-12.6, non-chain) with visible 614 -> 453; unchanged law 1s 495/2,849, law 3s 74.971px, law 4s 60, law 5 10, stall 5.26s. (2) Records the OWNER'S RULING: contact-exactness and solidity are hard product requirements - a viewer must never see weapons tunnel through each other or damage/parry/swat fire without visible contact; the calibrated band (6px / 20.754px) is RETIRED; law 3 becomes a DEFECT TRACKER. Open defects: D1 infeasible pin (26.100px, axe vs wand, translation-only projection with no rotational DOF), D2 phantom shot hits (495/2,849, cause unknown), D3 whiff-swats (43/1,837), D4 visible shot-render overlaps (law 3s body/blade subset). (3) Rewrites HANDOFF section 7 next-items as the sequence: (a) read-only probe of 1s/2s (classify real-vs-artifact), (b) read-only rotational-DOF design probe for D1, (c) canonical fixes one at a time with re-baseline, (d) balance/trait pass afterwards.
Why: the re-run proved the lenStep fix removed ~90% of the phantom contacts and isolated the remaining reds to real defects; the old band stance described a limit the owner now rejects as product-acceptable.
Approved: "go" after the ruling proposal (defect-tracker stance + sequence).
Deviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES or generated file touched; the law table Status column unchanged (C3 partial, S3 owner-run only).
Not verified: no proofs re-run (docs only); the run numbers are the owner's report, quoted verbatim.
Rollback: `git revert` this commit.
## #758 the lenStep fix (harness-side) + lenstep-proof - ledger (commit a3d484c)

What: (1) measure.mjs: `entryLs`, each fighter's lenStep stashed at the pre-tick instant beside `entryFl`; passed as bladeCircles' 8th argument / the pose's `ls` at every chain-aware site (gapAt, gapAtFp, bandDump, the shot entry pass, the law 4 substep replica, and the hit, parry and swat event recomputes). (2) .qa/frame-proof.mjs: the C3 pose passes the `ls` it already captured, plus one comment. (3) New .qa/lenstep-proof.mjs (5 checks), registered in tools/manifest.json as battery step 15; STATE.md regenerated. (4) Both handoff files. No canonical, LAWS, GAMES or record file touched.
Why: #757 found that a grown chain was rebuilt short by the harness (law 1 phantoms 24 -> 2 and law 2 parries without touch 25 -> 0 once lenStep is used), and that #756's law 3 red was an artifact; the S3 and band rulings are held until this is fixed and re-run.
Approved: "go" after the read-only proposal (the lenStep fix, HANDOFF s7 item 1).
Deviations (flagged at delivery): (1) A code edit to an owner-only tool (measure.mjs), syntax-checked (`node --check`) and covered by lenstep-proof's source check, but measure.mjs was NOT run. (2) The proof battery grew from 14 to 15 steps. (3) frame-proof's C3 numbers moved (worst 18.041 -> 15.505px, visible 43 -> 35) and no gate had to change: the envelope (20.754px) and the 2% rate are unchanged text; the S3 counters did not move. (4) No GAMES entry and no regen of GAMES/CODEMAP: the canonical did not move; GAMES' #753 entry keeps its short-chain numbers as history.
Findings: (1) On flail+hammer, flail+scythe, nunchaku+scythe, seeds 101-103, 10,000 ticks: with the pre-tick lenStep 84 grown-chain hits give 0 phantoms (36 without it), 165 parries give 0 without touch (47 without it). (2) The residue is measured, not guessed: 24 hits that ADDED a link (9 read as phantoms) and 1 parry in a grow tick (1 without touch). The event stores the post-grow chain pose, the contact used the pre-grow geometry, so no harness-side stash is exact there. (3) frame-proof C3 on the fixed pose: overlaps 287 (unchanged), visible 43 -> 35 = 0.0513%, worst 18.041 -> 15.505px, the crossed cells' band worst 18.041 -> 9.764px; the gauntlet worst 15.505px (wand+bow, no chain weapon) did not move, so the owner's 6px band calibration still fails independent of lenStep. (4) frame-proof's S3 pass already passed ls, so its counters (85/757/2,422/6,745) are unchanged.
Controls (measured, on throwaway edits restored byte-identical afterwards): the pre-tick stash removed -> L1 FAILS; the C3 pose's ls removed from frame-proof -> L1 FAILS; the `ls:` removed from a measure.mjs parry pose literal -> L1 FAILS; and the probe's own in-source control (one lenStep argument removed from a copy of measure.mjs) fails the site check. L4 proves the sample contains grown chains (36 phantom hits and 47 parries without touch when lenStep is omitted).
Not verified: measure.mjs was not run (the owner's re-run is owed, in cmd.exe); the 109-battle population is untested against lenStep; laws 4, 5, 1s, 3s have no lenStep numbers; a second hit in the same tick and substeps after an in-tick grow use the ENTRY lenStep (inexact); no rendered-markdown check; the full battery result is in the delivery message.
Rollback: `git revert` this commit.

## #756 measure.mjs stride fix + stride-proof - ledger (commit 24e1e67)

What: (1) measure.mjs: FL_SLOTS = 18 and STRF = 1 + 2 * FL_SLOTS = 37 replace STRF = 13 and the hard-coded 6 slots (flAt, the entry-pose stash, the two rest-pose constants); a guard exits 2 if G.auditFl is not a whole number of STRF rows. (2) New .qa/stride-proof.mjs (4 checks) lifts measure.mjs's own FL_SLOTS/STRF/flAt text and runs it on real tapes from the shipped sim: fl.u 18 wide and the tape 37 per row (P1), flAt resolves every substep row, 18,170/18,170 (P2), the stash copies FL_SLOTS slots (P3), and a pre-links-r87 control (6 slots, stride 13) resolves 2,060/18,170 and fails. Registered in tools/manifest.json (battery true, citable false), so the battery is 14 steps. (3) STATE.md regenerated. (4) Both handoff files updated, recording the read-only findings: frame-proof's 2,500-tick horizon explains the law-3 disagreement (the cell's worst, 27.399px at t15936, reproduces and is band class), and the stale stride is the chain-pose integrity failure.
Why: the owner-go --solidity run failed `harness chain-pose integrity` and nothing an agent could run caught the width change.
Approved: "do a" - the owner named option A after the read-only findings.
Deviations (flagged at delivery): (1) A code edit to an owner-only tool (measure.mjs), not comment-only; it was syntax-checked (`node --check`) and its changed blocks are exercised by stride-proof, but measure.mjs was NOT run. (2) The proof battery grew from 13 to 14 steps. (3) No GAMES entry and no regen of GAMES/CODEMAP: the canonical did not move.
Not verified: that laws 1, 2, 4, 5, 1s, 2s go green on the fixed harness (needs the owner's one-run re-measure); the new exit-2 guard has never fired in a real run; the full battery was not run (canonical untouched).
Correction (#757): this ledger's item (4) says the law 3 worst "reproduces and is band class", and the handoff files it landed said law 3 is a real band red. That was WRONG: the recompute omitted the fighter's lenStep, as measure.mjs does. See the #757 ledger and HANDOFF §7.
Rollback: `git revert` this commit.

## #757 the lenStep finding + the retraction + the handoff refresh - ledger (commit 0d0be4d)

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
