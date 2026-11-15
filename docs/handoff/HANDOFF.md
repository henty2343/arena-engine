# HANDOFF v11 — arena-engine: make the repo token-friendly for AI agents

LOCATION: docs/handoff/HANDOFF.md — REPO-HOSTED. This file and BATCH3-STATUS.md live in the repo and
are updated IN THE SAME COMMIT as every landing, so they are current as of HEAD by construction.
Chat attachments of older handoffs (v7, v8, v9, v10) are OBSOLETE. If any attached or pasted copy contradicts
this file, THIS FILE WINS. Never put handoff files in docs/history/ — that folder is the frozen
record, globbed by the doc tools; an extra file there fails lint (control C5).

FRESHNESS CHECK (run first, every session):
    git fetch origin && git rev-parse --short origin/main     # origin HEAD (short)
    git log -1 --format='%h' -- docs/handoff/HANDOFF.md       # the landing that last updated this file
    node tools/verify.mjs --quick                            # expect VERIFY PASS — 6 checks
    node .qa/strip-hash.mjs --base canonical-prediet-2c      # expect PASS + the three hashes (§5)
THE FIRST TWO HASHES MUST MATCH. This file is updated in the same commit as every landing, so the
commit that last updated it IS origin HEAD — that equality is the freshness invariant. If they differ,
either this file is stale or something else landed: re-baseline from STATE.md and say what moved. Never
trust this file over the repo. As of the #752 landing the origin HEAD was 361cbcb.
The REPO outranks every prose document, including this one. STATE.md and docs/CODEMAP.md are
generated and authoritative for all numbers.

Status 2026-11-15: Batch 1 DONE. Batch 2 DONE. Batch 3 (a)(b)(c)(d) ALL DONE — Batch 3 CLOSED.
  3a = 0ddd7f5 #746 · 3b = 9e017bb #742 · 3d = f756e21 #747 · 3c = 68e29f9 #748
Follow-ups: #749 = 4cc98d5 (index titles, mf-2 line re-paragraphed, AGENTS/README pointers, #749 entry), confirmed on origin.
  #750 = 4f38866 (the 3,000-byte line-cap lint B3E plus the record of the #749 hash) — confirmed on origin.
  #751 = 63bb91c (the law-table follow-up — new .qa/law-proof.mjs asserts B1/B2/U1, the three laws
  that had NO assertion anywhere; the LAWS table now has no `unprobed` row) — confirmed on origin.
  #752 = 361cbcb (the law-table COMPLETION + the probe registry — new .qa/contact-proof.mjs (C4, C5)
  and .qa/shot-proof.mjs (S1, S5, S6) assert the last five laws that had no agent-runnable proof, and
  tools/manifest.json becomes the single registry run-battery and lint-docs read) — confirmed on origin.
  #753 = 477c34a: the RENDERED-FRAME proof — new .qa/frame-proof.mjs proves C3's band
  at the tick-entry pose (C3 → `partial`) and MEASURES law 3s, which does NOT hold on the current build
  (S3 stays `owner-run only`; the owner's ruling is open). Landed as 477c34a.
  #754 = 46ffcd7: measure.mjs's header now says who really runs it (it named .qa/projectile-fix.mjs,
  which does not exist, and said the assistant runs it), and the ONE owner-go --solidity run is recorded in s7. Landed as 46ffcd7.
  #755: Batch 4a - RECIPES "Traps" became seven short rules, AGENTS became the one home for
  the workflow (orient, propose, change, prove, deliver) and README now points to it. Landed as ffc90ef.
  #756 = 24e1e67: the measure.mjs STRIDE FIX - measure.mjs read the sim's chain-pose tape at the pre-links-r87 width (6 slots, stride 13; the sim's fl.u is 18 wide, the tape 37), so ~90% of substep rows came back null and every chain recompute degraded to the rigid spine: the cause of the failed `harness chain-pose integrity` check. New .qa/stride-proof.mjs asserts it. Confirmed on origin as 24e1e67.
  #757 = 0d0be4d: DOCS ONLY - records the owner's 2026-11-15 --solidity re-run on the fixed stride (integrity check PASS; every other count unchanged), the SECOND harness drift it led to (measure.mjs and frame-proof's C3 pose never pass the fighter's lenStep, so a grown chain is rebuilt short), and RETRACTS #756's claim that law 3 is a real band red at 27.399px (with lenStep that tick has 2.415px of clearance). Confirmed on origin as 0d0be4d.
  #758 = a3d484c: the lenStep FIX, HARNESS-SIDE ONLY (the canonical is untouched) - measure.mjs stashes each fighter's lenStep at the pre-tick instant (entryLs, beside entryFl) and passes it to every chain-aware bladeCircles/parryGap recompute; frame-proof's C3 pose passes the ls it already captured; new .qa/lenstep-proof.mjs (battery step 15) asserts the sites and the method. Re-measured frame-proof C3 (the re-baseline): worst 18.041px -> 15.505px, visible band ticks 43 -> 35 (0.0630% -> 0.0513%), crossed-cell band worst 18.041px -> 9.764px, overlaps 287 unchanged, the S3 counters unchanged. measure.mjs was NOT run; the owner's re-run is owed. Confirmed on origin as a3d484c.
  #759 = 708d4b9: DOCS ONLY - the 2026-11-15 solidity re-run on the lenStep fix (exit 0, 657.2s, 109 battles) and the owner's defect-tracker ruling (no calibrated band; viewer-visible interpenetration or damage-without-contact is a tracked defect; D1 infeasible pin 26.100px at axe vs wand, D2 phantom shot hits 495, D3 whiff-swats 43, D4 visible shot-render overlaps; sequence: probe 1s/2s, rotational-DOF design probe, canonical fixes, balance pass). Confirmed on origin as 708d4b9.
  #760 = 77cc38d: DOCS ONLY - sequence item (a) CLOSED: the read-only 1s/2s diagnostic (throwaway scratch-measure.mjs, wand+bow 8 seeds) proved D2/D3 are substep displacement artifacts - the sim fires land/swat events correctly but the event stores the shot's post-substep position, so recomputes from stored fields show false positives (logged gaps 0.05px to 52.20px); the viewer never sees damage without contact. D2/D3 reclassified as disclosed audit artifacts; D1 (26.100px pin) and D4 stay open; next is (b) the rotational-DOF design probe. Confirmed on origin as 77cc38d.
  #761 = 41f6445: chore+docs - removes diag-1s.cjs, land-760.cjs and scratch-measure.mjs, the three throwaway diagnostics #760's git add -A committed by accident; section 8 gains the scratch-before-add gotcha. Confirmed on origin as 41f6445.
  #762 = a2efbb1: DOCS ONLY - sequence item (b) OPEN-LOOP result: the +/-0.40 rad rotation grid clears all 5 deepest D1 pins (axe vs wand, seed 27, 26.100px) with a finite rotation (0.14-0.30 rad), so D1 is a missing rotational DOF, not a geometric hard limit; the law-3 band-dump comment's resolver line numbers are stale (the resolver is bladeVsBlade at :2206, body unread). Confirmed on origin as a2efbb1.
  #763 = 324aa3e: DOCS ONLY - records the read-only read of bladeVsBlade's body (nudge writes wAngle at :2306-07; spin-opposed when latched; two unverified hypotheses; an unapproved capped-controller sketch). Confirmed on origin as 324aa3e.
  #764 = c42db5a: DOCS ONLY - the D1 EVIDENCE CORRECTION: the anchor pair (axe vs wand, seed 27) is bloom-transfigured (axe figT 670/591) and solid-free by design, the resolver never ran there, 261 of 274 visible overlap ticks in 40 natural seeds are bloom ticks, so D1 is an audit artifact on this evidence (owner to rule); the capped-controller sketch and (b2) are withdrawn. Confirmed on origin as c42db5a.
  #765: HARNESS-SIDE bloom exemption (the canonical is untouched). D1 RULED an AUDIT ARTIFACT (the owner delegated the ruling to the agent, 2026-11-15, "you decide"): the anchor pair is bloom-transfigured and solid-free by design, the resolver never ran there. measure.mjs (owner-go edit; NOT run) and .qa/frame-proof.mjs now classify a pair with a bloomed fighter at tick entry (figT > 0) and COUNT it apart from the law 3 band/visible counters and the law 3s blade counter; new .qa/bloom-proof.mjs (6/6) asserts the sites, the solid-free premise and the D1 anchor, with a mutated-source control. The 13 non-bloom visible ticks are classified: 8 mirror class, 5 neither. See HANDOFF s7 (D1 RULING AND THE BLOOM EXEMPTION). Its own commit hash is not known to
  this file (a file cannot contain its own commit) - verify origin.
Next: the DEFECT SEQUENCE - D1 is RULED an AUDIT ARTIFACT (#765, the agent's ruling on the owner's delegation; the harness-side bloom exemption landed: measure.mjs and frame-proof count bloom-pair overlaps apart, bloom-proof asserts it; measure.mjs was NOT run, so the owner's --solidity re-run on the exemption is OWED and the real numbers are not yet in the repo). Open: (1) the owner's re-run of measure.mjs --solidity to re-baseline law 3 / 3s with the exemption; (2) the 5 non-bloom, non-mirror visible ticks in 40 naturals (flail/staff s10 t10193 6.978px; axe/flail s23 t4470 8.512px and t4471 2.986px; staff/nunchaku s23 t6308 6.394px; dagger/javelin s25 t497 8.352px; 3 of the 4 episodes involve a chain weapon - the lenStep grow-tick residue is a CANDIDATE, untested); (3) the drawn joke object's own silhouette vs the foe's weapon is UNMEASURED (the exemption rests on bloom-r73's solid-free design, not on a measurement of what is drawn); (4) D4 / law 3s visible subset, frame-proof's 2,500-tick horizon, Batch 4's tool MOVES - HANDOFF s7.
Delivery: ONE patch (§6) — read §6.7 first: the owner copies patches out of CHAT. IN THE CURRENT CHAT SERIES (owner, 2026-11-15) the patch is ONE FILE (git diff --binary, LF, saved outside the repo, presented as a downloadable file), proven with apply --check and --index on an independent fresh clone plus verify --quick there, with per-file md5s and the patch md5.

State at the 3c landing (re-measure, do not trust): HEAD 68e29f9, parent f756e21; canonical md5
5de162de46eb4fa3204e3ee636f2aff3, 4,716 lines, stamp links-r87 (unchanged by ALL of Batch 3).
As pushed by 3c: GAMES df56830cce89f4040aea2f41359c810d · mf-1 73c5cb96ee06fa914f80db07951af0f2 ·
mf-2 bd74516ab4019e21fa6e735dc4525f31 · chronicle 2a9798f21e7765f4960b5d1e4bbad352 ·
STATE 97c933eac308bbf93b8385ac091de387 · AGENTS d15855f344f021e32b8a9181faf2e4ed ·
README 1622682eda67fe056b7af11a0d0b82ee · copilot 4e1932801a44d7d2a6a34e6c447cb5ab ·
navgen 6154479b122dc81f8a3441bc2b9c8afb · docreflow 88363bddef65dc779ad4c51d2d25c94d ·
gen-state 5dd8bf7d11ba6fee7c282e7e36c64056 · lint-docs daf5ae8f6125e6a92c9be80c399897c6 ·
docset 03e418e846c71122e7c86106d33c8cfd · LAWS 1588876f4abcdaa3f04d8ad97738d188 (unchanged) ·
CODEMAP b334d3553a938801e25df32efe2e62f9 (unchanged).

State after the #749 patch (BASE 24ce531; re-measure, do not trust): canonical, chronicle, mf-1, docreflow, gen-state,
lint-docs, docset, LAWS, CODEMAP all unchanged from the 3c block above. As built by the one-shot: GAMES 8f602745ee4a583af935884330415bb0 ·
mf-2 7a268c717d727216e5c93782d3e6a985 · STATE bb6c529358ff5a58ded571f9a2efba28 · AGENTS bd170ac0d1655b07e446140c3f46adca ·
README 1cb73e7751c2999f9f763e2b74c9b54d · navgen b27164470bbe5d5303839d5bbc408bdb. The two handoff files are not listed (a file cannot hold its own md5).
State after the #750 patch (BASE 4cc98d5; re-measure, do not trust): canonical, chronicle, mf-1, mf-2, LAWS, CODEMAP, navgen, docreflow,
gen-state, docset, AGENTS, README, copilot all unchanged from the blocks above. As built by the one-shot: GAMES 61cb9bcebea89bc34dbe298b8b4d09a5 ·
lint-docs 182019c42f8a34de2582d3bcdd853678 · STATE a4eb9e2574fb78195e8fdb3848cc2f24. The two handoff files are not listed (a file cannot hold its own md5).
State after the #751 patch (BASE 4f38866, LANDED AS 63bb91c; re-measure, do not trust): canonical, CODEMAP,
chronicle, mf-1, mf-2, AGENTS, README, navgen, docreflow, gen-state, lint-docs and docset all unchanged from the
blocks above. Re-measured in a fresh clone AFTER the push and byte-identical to what was built: law-proof
e0ac0b51139165f4081e5a7ed54a8252 · GAMES 09079f3450e7fed25122c51b026f6b9b ·
LAWS a58eb28b72cf7347c66b767584ad35b8 · run-battery 4ee58ec2b1044c3b57a7c416c68c1afd ·
STATE e3484d7d7cd0c7d9c88836c1aaf472f9. On origin: verify --quick PASS (6 checks), strip-hash PASS with the
three invariants unchanged, and the probe 12/12. The two handoff files are not listed (a file cannot hold its
own md5).
State after the #752 patch (BASE c2bcf57, LANDED AS 361cbcb; re-measure, do not trust): canonical, CODEMAP,
chronicle, mf-1, mf-2, AGENTS, README, navgen, docreflow, lint-markers, docset unchanged. Re-measured in a
fresh clone AFTER the push and byte-identical to what was built. As built: contact-proof 388eeea0a06cf6dab1dff40a46fe5518 · shot-proof 96b2f0169bf73160e32555a6e448e925 ·
manifest.json 8db66e1aa0a4c3fd0c50235f20b50c4a · manifest.mjs dfa3b95c2d591d778c1e7c195548eabd ·
run-battery b2b9707d8b4c1d9a68c378e590448807 · lint-docs 19065ad69de0e96c48ce4798991fc86b ·
gen-state 15481648e3cae178c02a45d8b0edf7dc · LAWS f3f4c0be5b32c908c68f1eced6a870b1 ·
GAMES e7570b01a58072d192c33f5315742f6b · STATE 05f1fb0ec3fe1a411d98e246308e3dce. The two handoff files
are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); the proof battery
PASS — 12/12 steps matched their expected exit code (lengrow-gate 1 BY DESIGN, the other eleven 0), canonical
md5 and line count identical before and after the run.
Post-push re-measurement (fresh clone of origin at 361cbcb): all twelve shipped files are byte-identical to
what was built — the pushed commit's diff is byte-identical to the delivered patch (md5
f5e552e4e7c78b6396bbc5c29d4d4f4f); `verify --quick` PASS (6 checks); `strip-hash` PASS with the three
invariants unchanged (c2cd01ef... / e9b6f8d6... / 600097a7...); contact-proof 5/5, shot-proof 6/6, law-proof
12/12 on origin; canonical md5 5de162de... / 4716 lines; the record-set era files unchanged.
State after the #753 patch (BASE 361cbcb; re-measure, do not trust): canonical, CODEMAP, chronicle, mf-1,
mf-2, AGENTS, README, navgen, docreflow, lint-markers, docset, run-battery, lint-docs, gen-state, manifest.mjs,
contact-proof and shot-proof all unchanged from the blocks above. As built: frame-proof
6cd9a437557f740ec939918250e9ffb5 · manifest.json 166ad5d6dbad7a5b39cae99813e759af · LAWS
73f9894261435d0a7fc5ed9f81c3ef91 · GAMES 5782eab54cadf715f41df5afa71e46ff · STATE
f3c3da6a22b422c1a283dee98438b1a0. The two handoff files are not listed (a file cannot hold its own md5).
Receipts: verify --quick PASS (6 checks); frame-proof 4/4 (68,275 rendered fight-ticks over 31 cells, the band's
worst 18.041px inside the law's 20.754px envelope, 43 visible band ticks = 0.0630%, the mirror class
reproduced: 2; the law-3s counters measured and ratcheted: blade 85 / body 757 / rim 2,422 / pair 6,745);
the proof battery PASS - 13 steps, every step matched its expected exit code (lengrow-gate 1 BY DESIGN, the
other twelve 0), canonical md5 and line count identical before and after the run; 4 canonical controls each
FAIL their intended check; strip-hash PASS with the three invariant hashes unchanged.

State after the #755 patch (BASE 46ffcd7; re-measure, do not trust): everything not named here is unchanged from the
blocks above, including the canonical, CODEMAP, LAWS, GAMES, the three record files, every tool and every probe. As built:
AGENTS 47addf2e5d592e3daa6c339f275425a1 · README 29e4e43ddd68f49531841df91097c2ac · RECIPES 0f0cda7df5dc64089d71089a4207cc9f · STATE 1e080656c5956a02f7fd109183ac1d5e. The two handoff files are not listed (a file
cannot hold its own md5). Receipts: verify --quick PASS (6 checks); no new lint check, so no negative controls; the
battery was not run (the canonical is untouched).

State after the #756 patch (BASE ffc90ef; re-measure, do not trust): everything not named here is unchanged from the
blocks above, including the canonical, CODEMAP, LAWS, GAMES, the record files, AGENTS, README and every other probe. As built:
measure.mjs 9d186ea1c27036535d21c3b81cff10b4 · stride-proof a0ceb8cc088f6f29d7a91474049219c0 · manifest.json 4e6bb049ba98e31361a860aa7877e43b · STATE 91cc15c19b31749142bdd22ef579d891. The two handoff files are not listed (a file
cannot hold its own md5). Receipts: verify --quick PASS (6 checks); stride-proof 4/4 (18,170 substep rows, all resolved by measure.mjs's own flAt; the pre-links-r87 control resolves 2,060 of them and fails P1); node --check measure.mjs OK. measure.mjs was NOT run; the battery was not run (canonical untouched).

State after the #757 patch (BASE 24e1e67; re-measure, do not trust): DOCS ONLY. Every file other than the two handoff files is byte-identical to the #756 block above (measure.mjs 9d186ea1c27036535d21c3b81cff10b4, stride-proof a0ceb8cc088f6f29d7a91474049219c0, manifest.json 4e6bb049ba98e31361a860aa7877e43b, STATE 91cc15c19b31749142bdd22ef579d891 - re-measured on origin after the #756 push). The two handoff files are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); no code, probe or generated file touched, so no controls; the battery was not run (the canonical is untouched).

State after the #758 patch (BASE 0d0be4d; re-measure, do not trust): everything not named here is unchanged from the blocks above, including the canonical, CODEMAP, LAWS, GAMES, the record files, AGENTS, README, stride-proof and every other probe. As built:
measure.mjs a383fe19cdf7cfdc642c3565bfa0d9fe · frame-proof b736f099b42acfb8d096c9c4ff43ee3f · lenstep-proof 0b83efa69f70f0ddb6c2f264dfa6dea2 · manifest.json a2b47333be5ad7f9cd9c2c4a4e1e8752 · STATE 62c2d508632313cbbb0dfa156bea1085. The two handoff files are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); lenstep-proof 5/5 (84 grown-chain hits, 0 phantoms with the pre-tick lenStep, 36 without; 165 parries, 0 without touch with it, 47 without); stride-proof 4/4; frame-proof 4/4; node --check measure.mjs OK; measure.mjs was NOT run. The proof battery: see the #758 ledger in BATCH3-STATUS.

State after the #759 patch (BASE a3d484c; re-measure, do not trust): DOCS ONLY. Every file other than the two handoff files is byte-identical to the #758 block above (measure.mjs a383fe19cdf7cfdc642c3565bfa0d9fe, frame-proof b736f099b42acfb8d096c9c4ff43ee3f, lenstep-proof 0b83efa69f70f0ddb6c2f264dfa6dea2, manifest.json a2b47333be5ad7f9cd9c2c4a4e1e8752, STATE 62c2d508632313cbbb0dfa156bea1085). The two handoff files are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); no code, probe or generated file touched, so no controls; the battery was not run (the canonical is untouched).

State after the #760 patch (BASE 708d4b9; re-measure, do not trust): DOCS ONLY. Every file other than the two handoff files is byte-identical to the #758/#759 blocks above (measure.mjs a383fe19cdf7cfdc642c3565bfa0d9fe, frame-proof b736f099b42acfb8d096c9c4ff43ee3f, lenstep-proof 0b83efa69f70f0ddb6c2f264dfa6dea2, manifest.json a2b47333be5ad7f9cd9c2c4a4e1e8752, STATE 62c2d508632313cbbb0dfa156bea1085). The two handoff files are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); no code, probe or generated file touched, so no controls; the battery was not run (the canonical is untouched); the 1s/2s diagnostic was a throwaway scratch run, not a probe.

State after the #761 patch (BASE 77cc38d; re-measure, do not trust): the three throwaway scripts are gone (diag-1s.cjs, land-760.cjs, scratch-measure.mjs); every other file is byte-identical to the #758/#759/#760 blocks above (measure.mjs a383fe19cdf7cfdc642c3565bfa0d9fe, frame-proof b736f099b42acfb8d096c9c4ff43ee3f, lenstep-proof 0b83efa69f70f0ddb6c2f264dfa6dea2, manifest.json a2b47333be5ad7f9cd9c2c4a4e1e8752, STATE 62c2d508632313cbbb0dfa156bea1085). The two handoff files are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); no code, probe or generated file touched beyond the removals, so no controls; the battery was not run (the canonical is untouched).

State after the #762 patch (BASE 41f6445; re-measure, do not trust): DOCS ONLY. Every file other than the two handoff files is byte-identical to the #758/#759/#760/#761 blocks above (measure.mjs a383fe19cdf7cfdc642c3565bfa0d9fe, frame-proof b736f099b42acfb8d096c9c4ff43ee3f, lenstep-proof 0b83efa69f70f0ddb6c2f264dfa6dea2, manifest.json a2b47333be5ad7f9cd9c2c4a4e1e8752, STATE 62c2d508632313cbbb0dfa156bea1085). The two handoff files are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); no code, probe or generated file touched, so no controls; the battery was not run (the canonical is untouched); the rotation probe was a throwaway scratch run (scratch/, gitignored), not a probe.

State after the #763 patch (BASE a2efbb1; re-measure, do not trust): DOCS ONLY. Every file other than the two handoff files is byte-identical to the #762 block above and to the #758-#761 blocks it cites (measure.mjs a383fe19cdf7cfdc642c3565bfa0d9fe, frame-proof b736f099b42acfb8d096c9c4ff43ee3f, lenstep-proof 0b83efa69f70f0ddb6c2f264dfa6dea2, manifest.json a2b47333be5ad7f9cd9c2c4a4e1e8752, STATE 62c2d508632313cbbb0dfa156bea1085). The two handoff files are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); no code, probe or generated file touched, so no controls; the battery was not run (the canonical is untouched).

State after the #764 patch (BASE 324aa3e; re-measure, do not trust): DOCS ONLY. Every file other than the two handoff files is byte-identical to the #762/#763 blocks above and to the #758-#761 blocks they cite (measure.mjs a383fe19cdf7cfdc642c3565bfa0d9fe, frame-proof b736f099b42acfb8d096c9c4ff43ee3f, lenstep-proof 0b83efa69f70f0ddb6c2f264dfa6dea2, manifest.json a2b47333be5ad7f9cd9c2c4a4e1e8752, STATE 62c2d508632313cbbb0dfa156bea1085). The two handoff files are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); no code, probe or generated file touched, so no controls; the battery was not run (the canonical is untouched).

State after the #765 patch (BASE c42db5a; re-measure, do not trust): everything not named here is unchanged from the blocks above, including the canonical (5de162de46eb4fa3204e3ee636f2aff3), CODEMAP, LAWS, GAMES, the record files, AGENTS, README, stride-proof and lenstep-proof. As built: measure.mjs a0c98af753667a8d501a910e437fb5e5 · frame-proof 5297c6ca0aabc84d828055371cfa745f · bloom-proof 9de03e2431e6b20a8aed9b4569f1f362 · manifest.json e4ccd843b3dc69f54c8de80ef2d3d1b3 · STATE 790c56668af49927345f40bfd9c7474d. The two handoff files are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); bloom-proof 6/6 (55,745 fight ticks over seeds 27,20,2,10,23; anchor 26.100px at G.t 4941 with the axe bloomed; 0 parries over 1,353 bloomed-at-entry-and-exit ticks; 5/5 mutated copies caught); frame-proof 4/4 (68,275 rendered ticks, 31 cells); lenstep-proof 5/5; stride-proof 4/4; node --check measure.mjs OK; measure.mjs was NOT run; the canonical is untouched, so the full battery and strip-hash were not re-run.

## 0. The record is a SET (since 3c)

docs/GAMES.md is the live file; three frozen era files live in docs/history/:
  mf-1-pre667.md        34 unnumbered measured-facts entries (2026-10-28 -> 11-01)
  mf-2-667-721.md       54 numbered entries #667-#721 (the #671 tombstone included)
  chronicle-722-747.md  26 dated landings #722-#747
tools/lib/docset.mjs exports the sorted glob (historyFiles(root)); navgen, docreflow, gen-state and
lint-docs all consume it — a new era file needs NO tool edit (proven, control C9). gen-codemap and
verify were not touched. GAMES keeps the preface, The documents, the nav block, §Current state
(owner quotes, open queue, CURRENT BUILD), Weapon art, Design principles, Open design questions, a
`## Measured facts` STUB (original tombstone + pointers), the Testing recipe, and the live landing
area. New measured facts and dated entries are appended to GAMES; a later pass freezes them into a
new era file. Era boundaries are POSITIONAL, never date-sorted (#711-#720 are dated 10-31 but sit
after #706-#710 of 11-03; a date sort would reorder the record — forbidden).
Nav block: a Frozen eras table (key · file · covers · items · size) + a `file` column on the 88-row
entry index; line numbers are PER FILE; keys are basenames without .md; GAMES = the live file.
Era files are READ-ONLY inputs to navgen.
Token effect (STATE.md authoritative): GAMES 168,385 -> 50,170 (-70.2%); eras 45,547 / 52,445 /
21,598; record set +1,375 tokens of navigation overhead for a 70% smaller live file.

## 1. Ground rules (owner-enforced — non-negotiable)

- PROPOSE BEFORE WRITING; wait for the owner's explicit "go". Read-only checks need no go.
- NEVER run measure.mjs. Read-only grep is permitted; execution is not. EXCEPTION (owner, 2026-11-14): the owner may give an
  explicit go for ONE run; it covers that run only and never carries over (one --solidity run was authorised that way, s7).
- DO NOT SPLIT THE CANONICAL previews/spinclash-preview.html (rule 5). Owner-only decision.
- Removals are TAGGED first (`git tag <name> HEAD`). Never force-push. Pushes are the owner's.
- Terminology: a fighter has a SKILL, a weapon has a TRAIT. Never the bare nouns.
- No balancing talk, no win-rate tables.
- Don't rewrite or drop record content (owner quotes, provenance). Reflow, re-heading and MOVING
  are fine; deleting is not. Stale-but-historical entries stay. Covers docs/history/ too.
- Deliver ONE patch (§6), subject to §6.7. Commit style: `docs: Phase I Batch N — <what>` / `tools: <what>`.
- Go-against-doctrine is allowed but must be flagged IN THE SAME MESSAGE, with why.
- Quote only numbers you measured on the artifact you are shipping. Never say a check passed
  unless you ran it this session and SAW the output.

## 2. Getting live state

    git clone https://github.com/henty2343/arena-engine.git && cd arena-engine
    git log -6 --format='%h %ad %s' --date=short ; git ls-remote origin HEAD ; git ls-remote --tags origin

HEAD may be newer than anything quoted here — re-verify before acting.
Node bootstrap (only if node is absent): Node 22+, no package.json, no dependencies.

    curl -s -m 90 -o /tmp/node.tar.gz \
      https://cdn.npmmirror.com/binaries/node/v22.23.5/node-v22.23.5-linux-x64.tar.gz
    # extract bin/node only, chmod 755 -> /tmp/nodebin/node

Use cdn.npmmirror.com/binaries/... (not npmmirror.com/mirrors/..., a redirect stub). Tarball
56,856,114 bytes. If git clone stalls (it does, repeatedly), this works:
    curl -sL -o /tmp/ae.tar.gz https://codeload.github.com/henty2343/arena-engine/tar.gz/<sha>
but a tarball has NO .git: strip-hash --base and git-show proofs CANNOT run there. Say so.

## 3. Orientation

A localhost Node tool meant to render seeded game sims into MP4s. The engine is PLANNED, not built.
The only live code is game #1, SPINCLASH: one browser file (the ONE canonical) + a bare-Node harness.
Read first: AGENTS.md, STATE.md (generated), docs/CODEMAP.md before opening the canonical, then
docs/LAWS.md (sole authority for the current laws, the trait count, the law-to-probe table),
docs/RECIPES.md.
Enter the record by grepping the SET: `grep -rn '^### 721' docs/GAMES.md docs/history/` — or use the
nav block's Frozen eras table + entry index (file + line). All record files are GREP ONLY.
The old worst line (mf-2 line 526 at 68e29f9, 14,343 bytes, entry #721's AT THIS LANDING sub-paragraph) was re-paragraphed by
#749 into 26 soft-wrapped lines, each <= 560 bytes; its bold spans now CROSS soft newlines (valid CommonMark, not render-checked).
No line in the record set exceeds 3,000 bytes, and since #750 lint-docs ENFORCES that cap (B3E, check-only). Do not re-join the 26 lines. Grep for the sub-paragraph; never hand-copy a line number.
Law-to-probe table (LAWS §Law-to-probe table): 25 rows; as of #753: 8 probed, 16 partial, 1 owner-run only,
0 unprobed. The ONLY owner-run row left is S3 (shots never overlap blade/body/rim/shot) - and it is RED:
.qa/frame-proof.mjs reproduces the owner's own law-3s pass and measures overlaps on the current build, so
the law does not hold here (the named classes are in GAMES, the #753 entry). B1/B2/U1 were asserted by
.qa/law-proof.mjs (#751); C4/C5 by .qa/contact-proof.mjs and S1/S5/S6 by .qa/shot-proof.mjs (#752); C3 by
.qa/frame-proof.mjs (#753, `partial`). .qa/fingerprint.mjs is a change detector on the default cast with no
spear, not a per-law assertion. Rows cite file::anchor items that lint-docs verifies; Status/Scope are
hand-written judgement. RE-COUNT the rows before quoting the tally - a carried tally was wrong once (it said
7/16/2 at the #752 landing; the table was 8/15/2).
The canonical is ~105k tokens — never read whole; enter via CODEMAP at one symbol grep. CODEMAP line
numbers are valid only at the md5 in its header. Doc costs live in STATE.md §Documentation cost;
never hand-type a token cost (lint rejects it, era files included).

## 4. Health baseline + proof sequence

    node tools/verify.mjs --quick      # VERIFY PASS — 6 checks
    node tools/verify.mjs --battery    # ~15 min; once per canonical-touching patch

Quick checks in order: gen-state, lint-docs, navgen, docreflow, gen-codemap, lint-markers.
After any canonical edit: `node .qa/strip-hash.mjs --base canonical-prediet-2c` + `verify --battery`.
Battery expected exits (the STEP LIST now lives in tools/manifest.json — the probe registry; read it to
see what proves what): inscribe 0 · lengrow-build-proof 0 · pair-proof 0 · flipproof 0 · leadproof 0 ·
seam-proof 0 · law-proof 0 · contact-proof 0 · shot-proof 0 · frame-proof 0 · stride-proof 0 · lenstep-proof 0 · bloom-proof 0 · chromecheck 0 ·
lengrow-gate 1 (BY DESIGN;
normalised stdout md5 a31a68c4d19d68a2988c792b481be4d5, 23 lines, 10 GATE FAIL rows) ·
lengrow-bake --verify 0.
Doc regen after ANY edit to GAMES or docs/history/ (both doc tools cover the set):

    node tools/doc/docreflow.mjs && node tools/doc/navgen.mjs && node tools/gen-codemap.mjs \
      && node tools/gen-state.mjs
    node tools/verify.mjs --quick

## 5. Comment-only proof kit

tools/lib/strip-comments.mjs (scan/strip/normalizeCode) is shared by gen-codemap and
.qa/strip-hash.mjs (--self-test: 5 fixtures + 2 negative controls). Invariant hashes — identical
through all eight 2c patches and all of Batch 3:
    non-script md5   c2cd01ef082e4b49101447dc2e2073d0
    script 0 code    e9b6f8d6eb7f442c390c6cdb6517895b
    script 1 code    600097a7b52d7d40b00797581e6d35a6
PASS means "no code token moved", NOT "the comments are correct". After every canonical edit also
read `git diff previews/spinclash-preview.html` for mojibake. Cheap census (canonical + record files):
count non-ASCII codepoints; the mangling signatures U+E2 (â), U+20AC (€), U+C3 (Ã) must be absent.
The canonical md5 legitimately changes on every diet — never use md5 as the diet proof.

## 6. Delivery playbook — ONE patch

6.1 Build in a clone. BASE=$(git rev-parse HEAD) must equal origin HEAD. All edits + regens + proofs
there, §4 order. Include generated files (STATE.md, nav block, CODEMAP if moved). Canonical edits
carry a dated entry (§8). `git add -A && git diff --cached --binary > <name>.patch`.
6.2 Prove on a FRESH clone: apply --check, apply --index, verify --quick, compare --stat and every
changed file's md5 against the working clone. Canonical edit: also strip-hash, census, battery (or
say plainly it was not run and give the command).
6.3 Patch stays LF, saved OUTSIDE the repo. apply --check failure changes nothing — paste the
message, don't retry blindly.
6.4 Owner commands (VS Code + Git Bash on Windows; ~/Desktop worked):
    git status                                   # clean
    git pull && git log -1 --format='%h %s'      # must start with BASE
    git apply --check ~/Desktop/<name>.patch
    git apply --index ~/Desktop/<name>.patch
    node tools/verify.mjs --quick
    git commit -m "<repo-style message>"
    git push
Red after apply: `git reset --hard HEAD`, paste output.
6.5 Patch vs installer: apply --check is atomic (BASE is the pre-condition); per-file `md5sum -c`
is the real gate (§6.7); run code gates in the clone BEFORE shipping; census patched files.
6.6 One-shot tool inside the patch (used by 3c) when a change cannot be a chat-sized patch:
md5-gate every read BEFORE writing; content anchors, never line numbers; validate in memory, write
once; prove the round trip; reject CRLF; write -> dated entry -> unlinkSync(self) -> THEN regenerate;
idempotent; print the numbers.
6.7 CHAT DELIVERY — mandatory. The owner copies patches out of chat into a file; no download channel.
- Never publish a patch-file md5 you did not measure on the exact bytes you handed over. Lost tool
  output + reconstructed text = UNVERIFIED; say so.
- Gate on per-file md5s (`md5sum -c` expectations for every changed file), not the patch hash.
- Never hand-write hunk context from memory — re-read the file. Invented trailing context caused
  `patch does not apply`; a lone-space blank line at EOF caused `corrupt patch at line N`.
- End the patch with a NON-BLANK line; a new-file-only diff is the safest form (no context at all).
- The owner's terminal COLLAPSES NEWLINES on paste: single-line commands only
  (`printf '%s\n' "a" "b" > file`), or have them create files in VS Code and run by path.
- Bare `!` in pasted commands triggers bash history expansion (`event not found`) — avoid, or `set +H`.
- Prefer pure ASCII with \u escapes for scripts the owner pastes.
- If a patch fails twice, ship a small gated ASCII script that md5-gates input AND output.
6.8 NEW-FILE-ONLY ONE-SHOT (used by #749): the patch holds ONE new file — a gated, self-deleting tools/doc/land-NNN.mjs — so there is
no hunk context to get wrong. It md5-gates every input, edits by ASCII content anchor, proves the edits in memory, writes, unlinks
itself, regenerates, then md5-checks every output. Owner flow: awk-extract (or git apply) the script, check its md5, run it,
git add -A, verify --quick, commit, push. It is idempotent (prints "already landed") and refuses on any input md5 or CRLF.

## 7. What remains

Batch 3 CLOSED. Optional items — propose first, wait for "go", ONE patch:
- Index titles: DONE in #749 (navgen rowTitle(); the 54 numbered rows now carry the heading text).
- The 14,343-byte line: DONE in #749 (26 soft-wrapped lines ≤ 560 bytes; the frozen era file edit was flagged).
- AGENTS grep hint: DONE in 3c.
- Law-table follow-ups: DONE except ONE row. #751 added .qa/law-proof.mjs (B1/B2/U1); #752 added
  .qa/contact-proof.mjs (C4, C5) and .qa/shot-proof.mjs (S1, S5, S6); #753 added .qa/frame-proof.mjs -
  the RENDERED-FRAME proof (the repo already defines a rendered frame as the tick-entry pose, the v0.8.2
  pose amendment, so the last rendered-frame law IS headlessly assertable). C3 is `partial`: the band's
  worst (18.041px measured) stays inside the envelope the law records (20.754px) and the visible band
  ticks (0.0630%) stay under the owner's 2%. **S3 is the last `owner-run only` row and it is RED**: the
  probe reproduces the owner's own law-3s pass and measures overlaps (blade 85 - body 757 - rim 2,422 -
  pair 6,745) in named classes. The probe REPORTS S3 and ratchets it; it does not assert it, so the row
  stays owner-run only. THE OWNER'S RULING IS OPEN: rewrite law 3s, narrow the sim, or accept the
  classes. NOTE the owner's own 6px band calibration no longer holds on the curated gauntlet (15.505px
  measured, wand+bow seed 101, a cell with NO chain weapon, so lenStep cannot move it: still 15.505px after #758's lenStep fix - see THE lenStep FIX in the --solidity record below) - the second law channel that has drifted since the last sanctioned run (the re-proof is
  owed on the owner's machine, GAMES §Current state).
- THE OWNER-GO --solidity RUN (2026-11-14; canonical md5 5de162de..., unchanged; node 22.23.4, 1 core, jobs 1, 675.9s wall,
  109 battles; this tier carries no determinism replay; the exit code was not captured; the full report is NOT in the repo).
  The audit is RED while every agent probe is GREEN on the same canonical (contact-proof 5/5, shot-proof 6/6, law-proof 12/12,
  frame-proof 4/4), so the two instruments disagree. READ THE HARNESS'S OWN INTEGRITY CHECK FIRST: `harness chain-pose
  integrity` FAILED, and measure.mjs's own comment names that failure as the cause of the 2026-10-27 red set (chain-weapon
  recomputes degrading to a rigid spine). So the red on laws 1, 2, 4, 5, 1s, 2s is LIKELY a harness-side drift, NOT yet
  proven so. Measured: law 1 phantom hits 111/7,293 - law 2 parries without touch 117/2,868 - law 4 replica mismatches
  1,335 - law 5 unexplained sign changes 10 (flip violations 0/2,868) - law 1s 495/2,849 - law 2s 116/1,837 - law 4s double
  departures 60 (57 addGone twice, 3 gone-yet-in-flight), lost without an event 0. PASS: law 6, 5s, 6s.
  LAW 3: worst 27.399px (flail+hammer seed 101 t15936 round 3), visible 614/1,243,128 = 0.05%; the 6px bound FAILS and the
  worst is ABOVE the 20.754px envelope the law records and frame-proof gates (frame-proof's own worst is 18.041px over 31
  cells that include flail+hammer at seed 101). READ-ONLY INVESTIGATION (2026-11-14; CORRECTED 2026-11-15 - #756 recorded it wrongly as a real red): (1) COVERAGE - frame-proof stops every cell at TICK_BUDGET 2,500 ticks (~21s); measure.mjs runs whole battles (flail+hammer seed 101 ends at t18,707, 17,537 fight ticks), so frame-proof never reaches t15936. (2) The 27.399px is NOT a measured sim overlap: measure.mjs, frame-proof's C3 pose and my own #756 recompute all omit the fighter's lenStep (THE lenStep DRIFT, below). With the fighters' pre-tick lenStep (5 and 0 at that tick) the same tick has 2.415px of CLEARANCE; the cell's worst overlap over its 17,537 fight ticks is 14.185px with lenStep (27.399px without) and 2 visible ticks (61 without), not classified band/mirror and still above the 6px bound. The law 3 reading, frame-proof's 18.041px worst and its 20.754px envelope gate were all computed on the short chain; none is a measured fact about the sim until re-measured with lenStep. LAW 3s: blade 1,888 - body
  19,609 - rim 54,605 - pair 1,061,228 over 439,143 frames (worst 74.971px): a DIFFERENT sample from frame-proof's
  85/757/2,422/6,745 over 17,079 (the tier adds the 40 naturals), so the two are not comparable. Law 3s is red either way.
  The S3 ruling and the band calibration remain the owner's.
  CHAIN-POSE INTEGRITY ROOT CAUSE (found 2026-11-14, FIXED in #756, confirmed on the harness 2026-11-15): measure.mjs had STRF = 13 and 6 slots per fighter; links-r87 widened fl.u to 18 slots, so the sim's G.auditFl row is 37 wide. On a real tape flAt resolved 7,430 of 76,855 substep rows (flail+hammer) and 7,430 of 60,912 (nunchaku+scythe); the rest returned null and the recompute fell back to the rigid spine. Law 3's entry pose reads a pre-tick stash, not the tape, and the stash now copies all FL_SLOTS slots. Whether the old 6-slot stash changed any law-3 reading on a GROWN chain was not measured.
  THE OWNER'S RE-RUN ON THE FIXED STRIDE (2026-11-15; cmd.exe, plain `>` to a report file and a progress file, exit=0; 109 battles, 8 workers, 365.0s wall; canonical md5 unchanged; the report is NOT in the repo): `harness chain-pose integrity` now PASSES (0 missing across 229,971 chain ticks, 4,585,065 chain substeps and 310,536 chain-foe shot checks). The stride was NOT the cause of the other reds: law 1 (111/7,293, worst gap 252.01px), law 2 (117/2,868), law 5 (10 unexplained sign changes), law 1s (495/2,849), law 2s (116/1,837), law 4s (60 double departures) and law 3 (27.399px, 614/1,243,128 visible) are IDENTICAL to the 2026-11-14 run, so those counters do not read the broken tape. Law 4 moved (283 replica/event mismatches now, 1,335 recorded before; the stuck-flag count, 123,260, has no earlier figure) and still FAILs. Still FAIL: stall (5.26s worst), laws 1, 2, 3, 4, 5, 1s, 2s. PASS: laws 6, 5s, 6s and integrity. Exit 0 means the harness ran to the end, NOT that the audit passed (measure.mjs exits 1 on a crash and 2 on bad flags or the stride guard; the [FAIL] lines are verdicts). Band population 3,014 band-class overlaps (187 with a parry in the previous tick but not its last substep; 2,341 with neither weapon lead/headLead); mirror class 27 (10 visible, worst 11.559px).
  THE lenStep DRIFT (found 2026-11-15, read-only, NOT fixed): the sim's contact tests pass the fighter's lenStep (bladeCircles' 8th argument; parryGap's pose `ls`; sim lines ~2095 and ~2210) and chainGrow(wId, ls) returns the ADDED link units, but hit and parry events do not store lenStep and measure.mjs passes none (grep: no lenStep anywhere in it), so every event recompute rebuilds the SHIPPED chain; frame-proof's C3 pose omits it too (its S3 pass includes it). Measured on the sim with each fighter's lenStep read around every tick (seed 101, the 23 gauntlet cells, 927 blade hits, 609 parries - a SUBSET, not the 109-battle population; throwaway scripts, not committed): law 1 phantom hits 24 -> 2, worst gap 163.8 -> 95.92; law 2 parries without touch 25 -> 0; all 24 phantoms were FLAIL hits at lenStep 4-12. The 2 left are flail hits at lenStep 11->12 and 7->8, the ticks where a link is added (every 4 steps - not re-read from the sim this session), where the event's stored pose is the post-grow remap but the contact used the pre-grow geometry - INFERENCE, not traced. NOT tested: laws 4, 5, 1s, 2s, 3s, 4s (laws 4, 2s and 3s also call bladeCircles without ls, so they likely share it; law 1s, 495/2,849 on shot death poses, has no known cause). Any fix beyond a harness-side pre-tick lenStep stash (exact for the tick-entry pose laws 3 and 3s; exact for events except the link-add ticks) needs lenStep on the audit tape or in the events, i.e. a CANONICAL edit (rule 5, the owner's). The S3 and band-calibration RULINGS are HELD until law 3 and 3s are re-measured with lenStep. #756's "law 3 is a real band red" was WRONG and is retracted here.
  THE lenStep FIX (#758, harness-side, NOT yet re-run by the owner): measure.mjs now stashes f.lenStep before every tick (entryLs) and passes it at every chain-aware site: the entry-pose laws 3 and 3s (gapAt, gapAtFp, bandDump, the shot entry pass), the law 2s/4 substep sites, and the hit, parry and swat event recomputes (hit/swat by e.by, parry by slot 0/1). frame-proof's C3 pose passes the ls it already captured. .qa/lenstep-proof.mjs asserts it (L1 the sites by source; L2/L3 the method on real fights: a hit or parry recomputed with the pre-tick lenStep is an exact touch when no link was added and no fighter grew in the tick; L4 without lenStep the same populations show phantoms; a mutated-source control). Measured on flail+hammer, flail+scythe and nunchaku+scythe, seeds 101-103, 10,000 ticks: 84 grown-chain hits, 0 phantoms with lenStep (36 without), 165 parries, 0 without touch with it (47 without); REPORTED, not asserted: 24 hits that ADDED a link (9 still read as phantoms: the event stores the post-grow pose, the contact used the pre-grow one) and 1 parry in a grow tick (1 without touch). Within a tick the stash is the ENTRY lenStep, so a second hit in the same tick, and a substep after an in-tick grow, are not exact either. Exactness at those ticks needs lenStep on the audit tape or in the events = a CANONICAL edit (rule 5, the owner's). RE-BASELINE of frame-proof C3 on the fixed pose (31 cells, 68,275 rendered fight-ticks): overlaps 287 (unchanged), visible 43 -> 35 (0.0630% -> 0.0513%), worst 18.041px -> 15.505px, the crossed cells' band worst 18.041px -> 9.764px, the gauntlet worst 15.505px unchanged (wand+bow, no chain), mirror class 2 unchanged; the S3 counters 85/757/2,422/6,745 unchanged (that pass already passed ls). So the 18.041px quoted by #753 and the 20.754px-envelope gate margin were short-chain numbers; the envelope itself is the law's text and is NOT edited here (the owner's). The owner's 6px band calibration is NOT rescued: it fails at 15.505px on a no-chain cell. Still untested against lenStep with real numbers: the 109-battle population (the owner's re-run), and laws 4, 5, 1s, 3s; law 1s (495/2,849) has no known cause. THE OWNER'S RE-RUN ON THE lenStep FIX (2026-11-15; cmd.exe, plain > redirects, exit=0, 657.2s wall, 109 battles, 8 workers, canonical md5 unchanged): law 1 111 -> 12 phantom hits, law 2 117 -> 3 parries-without-touch, law 2s 116 -> 43 swats-without-touch, law 4 283 -> 66 replica mismatches and 123,260 -> 94,476 stuck flags; law 3 worst 27.399px -> 26.100px (natural seed 27 t4942, axe vs wand, non-chain) visible 614 -> 453; unchanged law 1s 495/2,849, law 3s 74.971px, law 4s 60, law 5 10, stall 5.26s. THE DEFECT-TRACKER RULING (owner 2026-11-15): contact-exactness and solidity are hard product requirements - a viewer must never see weapons tunnel through each other or damage/parry/swat fire without visible contact; the 6px and 20.754px calibrations are RETIRED; law 3's row becomes a defect tracker; open defects D1 infeasible pin (26.100px), D2 phantom shot hits (495), D3 whiff-swats (43), D4 visible shot-render overlaps; sequence (a) read-only probe of 1s/2s, (b) read-only rotational-DOF design probe for D1, (c) canonical fixes one at a time with re-baseline, (d) balance/trait pass. SEQUENCE ITEM (a) CLOSED (2026-11-15, read-only diagnostic, throwaway scratch-measure.mjs, wand+bow 8 seeds, 50 battles, owner-run in cmd.exe): the first 10 logged phantom shot hits and 10 whiff-swats all show the sim fired the event correctly (its substep contact test saw the overlap) while the event stores the shot's POST-SUBSTEP position, so recomputes from stored fields give false positives (logged gaps 0.05px to 52.20px; population worst 54.08px). D2 and D3 are therefore AUDIT artifacts (same family as the lenStep drift #757), NOT product defects - the viewer never sees damage or a swat without contact. Reclassified as disclosed audit artifacts; for a game that keeps adding weapons a hard 0-phantom shot law would chase audit artifacts forever. D1 and D4 remain the open defects. SEQUENCE ITEM (b) OPEN-LOOP RESULT (read-only throwaway scratch/rotdof-diag.mjs rev 5, owner-run, NOT committed; seed 27 natural, axe vs wand round 1): the anchor reproduces - deepest overlap 26.100px at OUR t4941 = measure's t4942 (offset -1: we capture the pose before tick(), measure labels it after; measure's t is absolute from game start, so a fixed window must not assume round-local t). 119 overlap ticks in the battle. The +/-0.40 rad rotation grid (bodies fixed, wAngle free, geom.parryGap - the same fn the sim's bladeVsBlade feeds at :2210-2211) clears ALL 5 deepest pins with a FINITE rotation: min-clear radii 0.18 / 0.30 / 0.26 / 0.14 / 0.14 rad (worst 0.30 at t5020), reaching 12.4-17.3px of real separation (gains ~36-41px). 1421 grid cells returned NON-FINITE parryGap - a degeneracy a real controller must cap below (the 0.14-0.30 clearances are interior/finite; boundary cells are not safe targets). CONCLUSION: D1 is a MISSING-ROTATIONAL-DOF defect, NOT a geometric hard limit - the fix direction is proven open-loop. At ~120 Hz and buzzsaw spin 12.6 rad/s, 0.30 rad is ~3 ticks of rotation, and the pin persists ~119 ticks, so the budget exists; contiguity per pin is unmeasured (the closed-loop sim is what confirms it). This is an OPEN-LOOP optimistic bound: the real nudge caps rotation (nudgePx/REACH, gated one/tick/fighter), so the controller must fit that budget - proven viable, not yet sized. RESOLVER LOCATION CORRECTION: the law-3 band-dump comment's line numbers are STALE. It says torque at sim :1697-98 and Math.sign at :1713, but :1697-1713 land in rollWeapons/startFight (f.wAngle=0 / f.wAngle=a), NOT the resolver. The real resolver is bladeVsBlade at :2206 (pose fill _pA/_pB :2210-2211 -> geom.parryGap; entry angles eaa/eba :2223; separateBodiesPos :2197). The words "torque" and "Math.sign" do NOT appear in the first 50 grep hits up to :2223. The resolver BODY (:2206 onward) is UNREAD - that is the next read-only step, and the comment's torque/Math.sign description is unverified against current code. SEQUENCE STATUS (#762): (b) OPEN-LOOP DONE - read bladeVsBlade's body (:2206+) and design the capped controller, then (b2) canonical = rule-5 owner decision; D1 stays OPEN (now with a proven fix direction), D2/D3 stay closed as audit artifacts (#760), D4 (law 3s visible subset) stays open and unprobed. RESOLVER BODY READ (#763, read-only, 2026-11-15, canonical md5 5de162de46eb4fa3204e3ee636f2aff3; the line numbers hold at that md5 only): bladeVsBlade (:2206) runs once per SUBSTEP (call site :1851, after wAngle += spin*chillMul*bloomMul*sdt at :1845). The resolver runs only when egap < 0: up to 16 passes of translation-only sequential impulses (0.4 x overlap per contact pair; loop body :2247+), then separateBodiesPos and clampToArenaPos; no angular state enters that loop. tqA/tqB (:2247, :2265-66) are per-call sums of lever x normal over penetrating circle pairs, used ONLY to pick the nudge sign - so the band-dump comment's torque/Math.sign description is CONFIRMED present (Math.sign at :2295-96); only its line numbers were stale. The nudge writes f.wAngle at exactly two sites, :2306 (a) and :2307 (b). Trigger: a stall (deep - gapPrev < 0.02) with deep < -1, at most once per call (nudged, :2277-78). Gate: one add per tick per fighter (nudgeTick !== G.t; reset to -1 at :1706 on a new round). Magnitude: min(0.6, 0.15 + 0.02*|deep|, CFG.nudgePx / REACH[weapon]) with nudgePx 12 (:113); the REACH values for axe and wand were NOT read. Sign: when latched (G.clash) it is spinSign * k with BIND_UNWIND true (:1260, so k = -1), i.e. SPIN-OPPOSED; unlatched it is Math.sign(torque) with spinSign as the tie-break. HYPOTHESES, NOT VERIFIED: (1) if the 26.100px anchor was latched, the spin-opposed nudge fights the orbit (12.6 rad/s at 120 Hz is ~0.105 rad per tick against a cap of 12/REACH) and can net to ~zero - the freeze bindfix-r35's own comment describes (:2287-90); (2) the open-loop grid reports clearance radii, not the signed direction, so the sign each pin needs is unmeasured, and whether G.clash was true at the anchor ticks is unmeasured. CONTROLLER SKETCH (a proposal only, NOT approved): keep the magnitude formula and the one-per-tick gate; in the nudge branch only, pick each fighter's sign by evaluating parryGap at wAngle +/- the nudge and taking the direction with the larger FINITE gap (fall back to today's rule if neither improves or both are non-finite); cap cumulative rotation per episode inside the finite interior (open-loop worst 0.30 rad, with margin) so no pose reaches the non-finite boundary; deterministic (no RNG), so the fingerprint moves only in cells where the nudge fires. The closed-loop proof (b2) would be a new .qa/rotdof-proof.mjs asserting the 5 anchors clear and no non-finite pose is reached. D1 EVIDENCE CORRECTION (#764, read-only, 2026-11-15; agent-run headless on the canonical md5 5de162de46eb4fa3204e3ee636f2aff3, NOT measure.mjs; scratch scripts, not committed; method: newGame(seed) with no forced weapons, tick(G) loop, the pose captured BEFORE each tick, geom.parryGap with the pre-tick lenStep, plus figT read at tick entry and hooks injected through loadSim's transform option at the nudge sites and at the egap line of bladeVsBlade). (1) The harness REPRODUCES the anchor: seed 27 natural, axe vs wand round 1, deepest overlap 26.100px at G.t 4941 (t5020 25.517px second), 119 overlap ticks, spins 6.5 / -12.6, G.clash false at entry and end of the top-8 ticks. (2) THE ANCHOR PAIR IS BLOOM-TRANSFIGURED: at t4941 the axe's figT is 670 and at t5020 591 (the wand's is 0) - the wand's bloom (bloom-r73) turned the AXE into a joke object. The sim deliberately makes such a pair solid-free: bladeVsBlade returns at :2209 on figT > 0 (comment: a joke object parries nothing and is parried by nothing; the pair goes solid-free: no latch, no clinch), so the resolver NEVER RAN at the anchor ticks: in the window G.t 4938-4946 the hook on the egap line logged zero calls, against 71,720 calls elsewhere in 5,300 ticks (470 with egap < 0). 93 of the 119 overlap ticks have figT > 0 on a fighter; the other 26 are at most 0.22px. (3) The audit computes the gap from the REAL axe geometry while the drawn weapon is the joke object (:3718) - measure.mjs and LAWS.md contain no bloom/figT/joke rule (grep -i, no hit). (4) 40 natural seeds, headless, 465,772 fight ticks at the tick-entry pose: 923 overlap ticks, 291 with a bloomed fighter; 274 VISIBLE (deeper than the 2.5px ink) of which 261 are bloom (95%); worst WITH bloom 26.100px (seed 27 t4941, axe/wand = the anchor to 3 decimals); worst with NO bloom 11.559px (seed 20 t8360, katana/sword, equal to the mirror-class worst the owner's run recorded; the 13 non-bloom visible ticks were not classified further). (5) REACH axe 212.1457894293687, wand 139.64, so the nudge caps are 12/REACH = 0.0566 rad (axe) and 0.0859 rad (wand); in 6,000 ticks of seed 27 the nudge fired TWICE (both latched, both spin-opposed, magnitudes 0.0566 axe / 0.0859 wand) and never at an anchor tick. CONSEQUENCE: D1 as recorded (an infeasible RESOLVER pin, a missing rotational DOF) is NOT supported - the anchor is a transfigured, solid-free pair measured with the wrong geometry, an AUDIT artifact in the family of D2/D3. #762's open-loop result is a true statement about the real axe geometry but is not what the sim resolves; the capped-controller sketch above and the (b2) canonical edit are NOT warranted by this evidence (withdrawn as the next step). The reclassification of D1 and whether a viewer-visible overlap with a joke object is acceptable by design are the OWNER'S RULINGS (the drawn joke object's own geometry was not measured). CAVEATS: a 40-natural headless sample at the tick-entry pose, not measure.mjs's 109-battle population (no forced cells); figT is read at tick entry; a bloom exemption cannot be validated from the owner's audit report because the report is not in the repo.
- D1 RULING AND THE BLOOM EXEMPTION (#765, 2026-11-15; harness-side, the canonical is untouched; the line numbers below hold at canonical md5 5de162de46eb4fa3204e3ee636f2aff3 only). RULING: the owner delegated it ("you decide"); the agent rules D1 an AUDIT ARTIFACT. Reason: the pair is solid-free by the sim's own design (bladeVsBlade returns on figT > 0, :2209), the resolver logged zero calls at the anchor ticks, and the drawn weapon is the joke object at the grip (:3718), not the real axe the audit rebuilds; the 6px/20.754px calibrations were already retired. The (b2) controller stays withdrawn. WHAT CHANGED: measure.mjs stashes entryFig (f.figT > 0) at the same pre-tick instant as entryLs; the law-3 entry pass routes a bloom-pair overlap to new counters (bloomPairTicks, bloomOverlap, bloomVis, bloomWorst) BEFORE the band counters; the law-3s blade test routes a shot-vs-bloomed-blade overlap to shotRenderBladeBloom; all five carried through ACC_ADD/ACC_MAX/accSnapshot/the merge destructure; a new [----] report line prints them. polyTicks is UNCHANGED (still every rendered fight tick, so the 2% rate denominator is comparable). frame-proof C3/S3 route the same way. New .qa/bloom-proof.mjs (B1 sites by source, B2 no parry on bloomed ticks, B3 the anchor, B4 a near-tautological consistency check, CONTROL 5 mutations). MEASURED (agent-run headless, not measure.mjs): 40 natural seeds, 465,772 fight ticks reproduce #764 exactly (923 overlap ticks, 291 bloom, 274 visible, 261 bloom-visible; worst bloom 26.100px, worst non-bloom 11.559px at s20 t8360). THE NON-BLOOM REMAINDER, 13 visible ticks classified per occurrence: 8 are the MIRROR class (the pre-flip pose clears the ink; seeds 2, 11 x2, 12, 14, 20, 36, 37; worst 11.559px) and 5 are NEITHER mirror nor bloom: flail/staff s10 t10193 6.978px; axe/flail s23 t4470 8.512px and t4471 2.986px; staff/nunchaku s23 t6308 6.394px; dagger/javelin s25 t497 8.352px. None had figWait or figPoof set at tick entry. Three of the four episodes involve a chain weapon (flail, nunchaku), so the lenStep grow-tick residue (s8 THE lenStep FIX) is a CANDIDATE explanation - NOT tested. frame-proof RE-BASELINE (31 cells, 68,275 rendered ticks, unchanged): 432 rendered ticks had a bloomed fighter, 23 real-geometry overlaps (21 visible, worst 15.505px) are now counted apart; the band overlaps 287 -> 264, visible 35 -> 14 (0.0513% -> 0.0205%), worst 15.505px -> 9.764px (the former gauntlet worst, wand+bow s101, was a bloom tick: the gauntlet band worst is now 0.579px, the crossed cells' 9.764px is unchanged), mirror 2 unchanged; the S3 counters 85/757/2,422/6,745 unchanged and 0 shot-vs-bloomed-blade overlaps in that sample. CAVEATS: measure.mjs was NOT run (agents never run it), so the 109-battle population under the exemption is NOT measured and the owner's re-run is owed; the exemption classifies by figT at tick ENTRY (bloom-expiry boundary overlaps with no bloom at entry but one on the previous tick: 0 in the bloom-proof sample); the drawn joke object's own silhouette against the foe's weapon is UNMEASURED - the exemption rests on bloom-r73's solid-free design (the owner's own spec), so a viewer-visible crossing of a joke object and a weapon is accepted BY DESIGN here, not shown to be invisible; if the owner wants that measured the silhouette is FIGOBJS vertices at grip + 0.45 radii (figTouchesRim's own anchor).
- Handoff follow-ups (AGENTS/README docs/handoff pointers, #749 entry): DONE in #749.
- Line-cap lint: DONE in #750 (lint-docs B3E; 3,000 bytes per line over GAMES + docs/history/*.md; check-only).
Batch 4 — tool layout: the REGISTRY half is DONE in #752 (tools/manifest.json is the single list of every
proof and tool; run-battery and lint-docs read it, and lint-docs checks it is complete — adding a probe
is now one JSON line instead of three hand-kept lists). Still open there: verify.mjs is not yet a reader
(it stays at 6 checks; lint-docs is the completeness gate). Also still open: one home tools/ with proof/,
doc/, measure/, lib/; the .qa rename; the measure.mjs owner-go flag; moving SPEC/CONTRACT/BUILD to
docs/planned/. DONE in #755 (Batch 4a): RECIPES "Traps" -> seven short rules; AGENTS = the one workflow home, README points to it.
  MEASURED BLAST RADIUS (2026-11-14, read-only counts — re-measure before quoting): renaming `.qa/` needs a path
  substitution in 43 refs in mf-1 + 23 in the chronicle + 9 in mf-2 (75 in the three FROZEN era files) + 26 in
  live GAMES.md; moving SPEC/CONTRACT/BUILD needs 10 in GAMES.md + 2 in mf-1 + 1 in LAWS.md + 5 in AGENTS/README
  + 2 each in gen-state.mjs (cost-table keys) and lint-docs.mjs (operational lists). Those are NON-whitespace
  edits to frozen historical text — a bigger doctrine collision than #749's whitespace-only era edit. The
  registry (done) removes the need to move anything for the inventory to be agent-readable.
tools/lib/docset.mjs is a dependency of four tools and resolves paths from the repo root — keep that
contract. Leave record content alone.

## 8. Gotchas & known bugs

- STATE.md, CODEMAP and the GAMES nav block are GENERATED — edit generators, never output.
- Canonical-md5 slot = UNION check over GAMES + docs/history/*.md (>= 1 carrier). GAMES carries it
  once (#748), the chronicle twice (#745/#746). A canonical edit MUST carry a dated entry in the
  LIVE file — a build requirement.
- 3c lint checks: every docs/history/*.md must be named in GAMES; every docs/history path GAMES
  names must exist. lintRefs only scans §Current state — the nav block needed its own check.
  Renaming an era file without regenerating navgen fails the build (C6). An extra file in
  docs/history/ fails too (C5) — that is why handoff files live in docs/handoff/, NOT docs/history/.
- Era files are archive-exempt for live-ref/retired-rule/trait lint; covered by preface + token-cost
  guards. docs/handoff/ is outside every lint glob (verify stays green with these two files present).
- lint-docs §Current state slice = games.slice(0, indexOf('## Measured facts')) — keep the stub heading.
- docreflow --check EXITS 1 on pending work in any file (v7's "always exits 0" is fixed). verify
  judges by EXIT CODE only; it never parsed docreflow's text.
- navgen/docreflow treat dated `###` lines as entry headings (B3A:). docreflow never reflows lines
  starting with `#`. Its heading count includes the 9 dated ### in GAMES §Current state.
- Baked data blocks are R4-protected: LEN_CIRCLES (BEGIN/END), CIRCLES_V2, POOL/EMBER, HALO/SHOT ART.
  Re-bake, never hand-edit. Harnesses extract the sim by text position, not banners.
- Don't "restore" retired rules in LAWS. Don't "fix" gen-codemap preferring markers over banners.
- Tags on origin: games-presplit-3c -> f756e21 (pre-split monolith), canonical-prediet-2c (the fixed
  2c base — compare, don't retag), canonical-precomments, docs-precleanup{,2,3}, item3-closed,
  pre-phase-a, scratch-precleanup.
- Dated chronicle entry per landing is convention (convention; #753 was the last to append one, and #754-#757 added none because the canonical did not move); REQUIRED only when the
  canonical md5 moves. Append to GAMES, then regenerate; docreflow may re-wrap it (whitespace-only).
- Law table: renaming a quoted assert fails lint until the anchor is updated (by design). New law =
  new row; ids C1-C6, S1-S6 required, unique; status in {probed, partial, owner-run only, unprobed};
  six cells; consistency rules; anchors without backtick or |. Retire = remove row + LAWS "Retired
  rules" + dated entry.
- Trait count: bump `N of 22 weapon traits landed` in LAWS AND the CURRENT BUILD paragraph in GAMES
  §Current state; lint checks both.
- New lint check => negative controls (one mutation per control + a passing control). 3c ran 9 + C9.
- Stale-but-historical: chronicle says lengrow-bake --verify exits 2 (true then, now 0) — leave it.
- mf-2's old 14 KB line is 26 soft-wrapped lines since #749 (bold spans cross newlines on purpose). Since #750 lint-docs B3E fails any record-set line over 3,000 bytes, so a FULL re-join fails.
  The cap is per line, so a PARTIAL re-join slips through (measured in controls on a copy): 2 or 5 re-joined lines stay green (1,120 / 2,789 bytes), 6 (3,348) or 26 (14,343) fail. Do not re-join.
- Line cap (B3E): LINE_CAP = 3000 BYTES (Buffer.byteLength, so 1,501 two-byte characters fail), applied to docs/GAMES.md + docs/history/*.md via the docset glob. Check-only; never edit an era file to satisfy it except whitespace-only. Run docreflow before lint if a new GAMES entry trips it.
- Cosmetic: .qa/fingerprint.mjs (~line 33) mentions many dated checkpoints; one live baseline. Harmless.
- Owner-machine hygiene (#761): `git add -A` on the owner's Windows box sweeps throwaway diagnostics into the commit - #760 took diag-1s.cjs, land-760.cjs and scratch-measure.mjs that way (they sat in the repo root; the .txt reports had already moved to scratch/). Move scratch to scratch/ (gitignored) or `git add` explicit paths before committing; measure/diag reports never enter the repo.
- measure.mjs and frame-proof's C3 recompute contacts from stored poses and, since #758, pass the PRE-TICK lenStep (§7, THE lenStep FIX). Residue: a hit that adds a link (the event stores the post-grow chain pose; the hit event is built after grow()) and any event or substep after an in-tick grow are not exact; .qa/lenstep-proof.mjs reports the count. The 2026-11-15 owner re-run on the lenStep fix confirmed it (law 1 111 -> 12, law 2 117 -> 3, law 2s 116 -> 43, law 4 283 -> 66); the residue and the new defect tracker live in section 7 (THE OWNER'S RE-RUN / THE DEFECT-TRACKER RULING). The owner runs measure.mjs in cmd.exe with plain `>` redirects (never Git Bash `tee`, never PowerShell; GAMES) and captures `echo exit=%errorlevel%`; agents never run it.
- Sandbox: the execution tool can vanish for whole turns; /tmp gets wiped between calls — re-bootstrap
  and WRITE RECEIPTS INTO YOUR REPLY IMMEDIATELY. Dropped tool output (`execute error`) = UNVERIFIED.
  pkill patterns can match your own command line — use [h]ttps-style brackets. Long runs: setsid + poll.

## 9. Report format + keeping the handoff alive

Per patch: what changed, before/after token costs, exact verification commands WITH results, anything
NOT verified, the patch + §6.4 commands + BASE hash, next proposed step. Wait for "go". Flag
deviations in the same message. Quote only measured numbers.
HOSTING RULE (introduced in v9, still in force in v11): docs/handoff/HANDOFF.md and docs/handoff/BATCH3-STATUS.md
are part of the repo.
Every landing patch UPDATES BOTH FILES in the same commit (state, hashes, ledgers, next action).
There is no attachment step anymore — do not ask the owner to swap chat files. After the owner
confirms a push, re-measure origin in a fresh clone and deliver the updated handoff files as part of
the NEXT patch (or as a docs-only patch if nothing else is pending).
New-chat prompt (the whole thing):

    Clone https://github.com/henty2343/arena-engine.git and read docs/handoff/HANDOFF.md and
    docs/handoff/BATCH3-STATUS.md fully. Run the freshness check at the top of HANDOFF.md - origin HEAD
    and the commit that last updated docs/handoff/HANDOFF.md MUST MATCH. The last landing is #765 (the D1 ruling - audit artifact - and the harness-side bloom exemption: measure.mjs, frame-proof, new bloom-proof), whose parent is c42db5a (#764, docs only: the D1 evidence correction), grandparent 324aa3e (#763); re-measure the hash, and if the two differ, something else landed -
    re-baseline from STATE.md and say what moved. The repo outranks any attached or pasted notes. Also
    read AGENTS.md (the one workflow section: orient, propose, change, prove, deliver). Then propose the
    next item from HANDOFF s7 and wait for my explicit "go".
    Hard rules: agents never run measure.mjs (I run it, in cmd.exe: node measure.mjs --solidity > solidity-report.txt
    2> solidity-progress.txt, then echo exit=%errorlevel%; never Git Bash tee, never PowerShell); one patch
    per delivery, pasted in chat, gated per HANDOFF s6.7 with per-file md5s; pushes are mine (VS Code + Git
    Bash on Windows). Be frugal with tokens: no re-checks beyond the freshness check.
    Context: #759 recorded my 2026-11-15 re-run on the lenStep fix and the defect-tracker ruling. #760 closed sequence
    item (a): D2 (495 phantom shot hits) and D3 (43 whiff-swats) are substep displacement artifacts (disclosed audit
    artifacts, not viewer-visible); #761 removed the throwaway scripts #760 swept in. #762 recorded an open-loop rotation
    probe for D1 (axe vs wand, seed 27, 26.100px) and #763 the read of bladeVsBlade's body (the nudge writes wAngle at
    :2306-07; resolver at :2206). #764 CORRECTED D1: headless, the anchor reproduces (26.100px at G.t 4941, 119 overlap
    ticks) but the axe is BLOOM-transfigured there (figT 670/591), the pair is solid-free by design (bladeVsBlade returns
    at :2209 on figT > 0), and the resolver never ran at the anchor ticks; in 40 natural seeds 261 of 274 visible overlap
    ticks are bloom ticks (worst with bloom 26.100px, worst without 11.559px, katana/sword seed 20 t8360); measure.mjs and
    LAWS.md have no bloom rule. D1 was therefore ruled an AUDIT artifact by the agent on my delegation (#765); the capped
    controller and the (b2) canonical edit stay withdrawn. #765 landed the harness-side exemption (measure.mjs - NOT run -
    and frame-proof count a pair with a bloomed fighter at tick entry apart; bloom-proof asserts it) and classified the 13
    non-bloom visible ticks: 8 mirror class, 5 neither (3 of the 4 episodes involve a chain weapon; lenStep grow residue is an untested candidate).
    Open, none started: (1) MY re-run of measure.mjs --solidity on the exemption (owed; the 109-battle numbers are not measured); then the 5 neither-class ticks;
    the drawn joke object's own silhouette vs the foe's weapon is unmeasured; (2) D4 / law 3s visible-subset
    classification; (3) frame-proof's 2,500-tick horizon; (4) Batch 4: the .qa rename and the
    SPEC/CONTRACT/BUILD move (both need my OK for non-whitespace edits to frozen era files), verify.mjs as a manifest
    reader, the measure.mjs owner-go flag. Do not start any work until I say "go".

## 10. Where we are / next action

Landed through the #765 patch (the D1 ruling - audit artifact - and the harness-side bloom exemption), on top of #764 (c42db5a, docs only: the D1 evidence correction), on top of #763 (324aa3e, docs only: the bladeVsBlade body read), on top of #762 (a2efbb1, docs only: the rotdof open-loop finding and the stale resolver line numbers), on top of #761 (41f6445, removes the three throwaway diagnostics #760's git add -A swept in; adds the scratch-before-add gotcha), on top of #760 (77cc38d, docs only: sequence item (a) closed), on top of #759 (708d4b9, docs only: the 2026-11-15 solidity re-run and the defect-tracker ruling), #758 (a3d484c, the harness-side lenStep fix), #757 (0d0be4d, docs only: the lenStep finding), #756 (24e1e67, the measure.mjs stride fix), #755 (ffc90ef, Batch 4a), #754 (46ffcd7) and #753 (the RENDERED-FRAME proof — new .qa/frame-proof.mjs proving C3's band and
measuring law 3s), on top of 361cbcb (#752, the law-table completion + the probe registry) and c2bcf57
(the handoff refresh). This file was last updated by #765 — that is the patch below. The
freshness check's two hashes always match ON ORIGIN, because this file is updated in the same commit as
every landing. Verify origin HEAD against the hash that last updated this file; if they differ, more
landed — re-baseline from STATE.md and say what moved.
First: run the FRESHNESS CHECK, then §2. If the invariant hashes differ, STOP and tell the owner.
Then propose the next item from section 7 - the DEFECT SEQUENCE: D1 is RULED an audit artifact (#765) and the harness-side exemption landed; the owner's measure.mjs --solidity re-run is owed; then the 5 neither-class non-bloom ticks (lenStep grow residue is an untested candidate), D4, frame-proof's 2,500-tick horizon, or the rest of Batch 4's tool MOVES - and WAIT for "go".
After "go": the whole job in one pass (edits, regen, proofs, controls, fresh-clone proof), delivered per §6 + §6.7/§6.8,
with both handoff files updated in the same patch.
