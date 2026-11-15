const fs = require("fs"),
  crypto = require("crypto");
const md5 = (f) =>
  crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex");
const F = ["docs/handoff/HANDOFF.md", "docs/handoff/BATCH3-STATUS.md"];
let bad = 0;
for (const f of F) {
  const b = fs.readFileSync(f);
  if (b.includes(13)) {
    console.log("CRLF REFUSED " + f);
    bad++;
  }
  const s = b.toString("utf8");
  if (s.includes("#760")) {
    console.log("ALREADY LANDED " + f);
    bad++;
  }
}
if (bad) {
  console.log("refused, nothing written");
  process.exit(1);
}
console.log("BEFORE " + F.map((f) => f + " " + md5(f)).join(" | "));
function edit(f, edits) {
  let s = fs.readFileSync(f, "utf8");
  for (const [o, n] of edits) {
    const c =
      o instanceof RegExp ? (s.match(o) || []).length : s.split(o).length - 1;
    if (c !== 1) {
      console.log(
        "FAIL " + f + " [" + c + " matches]: " + String(o).slice(0, 60),
      );
      bad++;
      return;
    }
    s = s.replace(o, n);
  }
  fs.writeFileSync(f, s);
}
const LEDGER =
  "## #760 sequence item (a) complete - D2/D3 reclassified as substep displacement artifacts - ledger (this commit)\n\nWhat: DOCS ONLY, both handoff files. (1) Records the read-only diagnostic of laws 1s/2s (scratch-measure.mjs, a throwaway copy of measure.mjs with two console.log injections at the shotPhantom/swatNoTouch sites; wand+bow, 8 seeds, 50 battles, 784.8s, run by the owner in cmd.exe): it logged the stored event coordinates for the first 10 phantom shot hits and 10 whiff-swats. (2) THE FINDING: the sim fired each land/swat event correctly (its substep contact test saw the overlap), but the event stores the shot's POST-SUBSTEP position while the recomputed victim centre is the stored death-pose centre, so recomputing the gap from stored fields shows false positives (logged gaps 0.05px to 52.20px; population worst 54.08px). Same root-cause family as the lenStep drift (#757): the event payload cannot reconstruct the contact instant. The viewer never sees damage or a swat without contact, so these are AUDIT artifacts, not product defects. (3) Reclassifies D2 (495/2,849 phantom shot hits) and D3 (43/1,837 whiff-swats) from open defects to disclosed audit artifacts; D1 (infeasible pin 26.100px at axe vs wand) and D4 (visible shot-render overlaps) remain open. (4) Sequence item (a) is CLOSED; next is (b) the rotational-DOF design probe for D1.\nWhy: the owner ruled (2026-11-15) that only VIEWER-VISIBLE interpenetration or damage-without-contact is a defect; the diagnostic proved the 1s/2s reds are not viewer-visible. For a game that will keep adding weapons, a hard 0-phantom shot law would chase audit artifacts forever.\nApproved: owner's \"do what you think is the best, with scaling in mind\" (2026-11-15).\nDeviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES or generated file touched; the throwaway diagnostic was NOT committed (scratch only); the law table Status column is unchanged (1s/2s stay owner-run laws, now with a disclosed artifact class).\nNot verified: no proofs re-run (docs only); the diagnostic ran on wand+bow only (the highest-shot cell), not the full 109-battle population.\nRollback: `git revert` this commit.\n";
edit("docs/handoff/BATCH3-STATUS.md", [
  [
    "#759 DONE (this commit: docs only - the 2026-11-15 solidity re-run on the lenStep fix and the defect-tracker ruling).",
    "#759 DONE (708d4b9, docs only - the 2026-11-15 solidity re-run on the lenStep fix and the defect-tracker ruling) - #760 DONE (this commit: docs only - sequence item (a) complete; D2/D3 reclassified as substep displacement artifacts).",
  ],
  [
    "Next: the DEFECT SEQUENCE - (a) read-only probe of 1s/2s, (b) rotational-DOF design probe for the infeasible pin, (c) canonical fixes, (d) balance/trait pass - or frame-proof's 2,500-tick horizon, or the rest of Batch 4's tool moves",
    "Next: the DEFECT SEQUENCE - (b) rotational-DOF design probe for the infeasible pin (D1), (c) canonical fixes one at a time with re-baseline, (d) balance/trait pass - or frame-proof's 2,500-tick horizon, or the rest of Batch 4's tool moves",
  ],
  [
    "## #759 the 2026-11-15 solidity re-run on the lenStep fix + the defect-tracker ruling - ledger (this commit)",
    LEDGER +
      "## #759 the 2026-11-15 solidity re-run on the lenStep fix + the defect-tracker ruling - ledger (commit 708d4b9)",
  ],
]);
edit("docs/handoff/HANDOFF.md", [
  [
    "#759 (this file's last update): DOCS ONLY - the 2026-11-15 solidity re-run on the lenStep fix (exit 0, 657.2s, 109 battles) and the owner's defect-tracker ruling (no calibrated band; viewer-visible interpenetration or damage-without-contact is a tracked defect; D1 infeasible pin 26.100px at axe vs wand, D2 phantom shot hits 495, D3 whiff-swats 43, D4 visible shot-render overlaps; sequence: probe 1s/2s, rotational-DOF design probe, canonical fixes, balance pass). Its own commit hash is not known to",
    "#759 = 708d4b9: DOCS ONLY - the 2026-11-15 solidity re-run on the lenStep fix (exit 0, 657.2s, 109 battles) and the owner's defect-tracker ruling (no calibrated band; viewer-visible interpenetration or damage-without-contact is a tracked defect; D1 infeasible pin 26.100px at axe vs wand, D2 phantom shot hits 495, D3 whiff-swats 43, D4 visible shot-render overlaps; sequence: probe 1s/2s, rotational-DOF design probe, canonical fixes, balance pass). Confirmed on origin as 708d4b9.\n  #760 (this file's last update): DOCS ONLY - sequence item (a) CLOSED: the read-only 1s/2s diagnostic (throwaway scratch-measure.mjs, wand+bow 8 seeds) proved D2/D3 are substep displacement artifacts - the sim fires land/swat events correctly but the event stores the shot's post-substep position, so recomputes from stored fields show false positives (logged gaps 0.05px to 52.20px); the viewer never sees damage without contact. D2/D3 reclassified as disclosed audit artifacts; D1 (26.100px pin) and D4 stay open; next is (b) the rotational-DOF design probe. Its own commit hash is not known to",
  ],
  [
    "Next: the DEFECT SEQUENCE - (a) read-only probe of 1s/2s (classify real-vs-artifact), (b) read-only rotational-DOF design probe for the infeasible pin (D1), (c) canonical fixes one at a time with re-baseline, (d) balance/trait pass - or frame-proof's 2,500-tick horizon, or the rest of Batch 4's tool MOVES",
    "Next: the DEFECT SEQUENCE - (b) read-only rotational-DOF design probe for the infeasible pin (D1), (c) canonical fixes one at a time with re-baseline, (d) balance/trait pass - or frame-proof's 2,500-tick horizon, or the rest of Batch 4's tool MOVES",
  ],
  [
    "\n\n## 0. The record is a SET (since 3c)",
    "\n\nState after the #760 patch (BASE 708d4b9; re-measure, do not trust): DOCS ONLY. Every file other than the two handoff files is byte-identical to the #758/#759 blocks above (measure.mjs a383fe19cdf7cfdc642c3565bfa0d9fe, frame-proof b736f099b42acfb8d096c9c4ff43ee3f, lenstep-proof 0b83efa69f70f0ddb6c2f264dfa6dea2, manifest.json a2b47333be5ad7f9cd9c2c4a4e1e8752, STATE 62c2d508632313cbbb0dfa156bea1085). The two handoff files are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); no code, probe or generated file touched, so no controls; the battery was not run (the canonical is untouched); the 1s/2s diagnostic was a throwaway scratch run, not a probe.\n\n## 0. The record is a SET (since 3c)",
  ],
  [
    "(c) canonical fixes one at a time with re-baseline, (d) balance/trait pass.",
    "(c) canonical fixes one at a time with re-baseline, (d) balance/trait pass. SEQUENCE ITEM (a) CLOSED (2026-11-15, read-only diagnostic, throwaway scratch-measure.mjs, wand+bow 8 seeds, 50 battles, owner-run in cmd.exe): the first 10 logged phantom shot hits and 10 whiff-swats all show the sim fired the event correctly (its substep contact test saw the overlap) while the event stores the shot's POST-SUBSTEP position, so recomputes from stored fields give false positives (logged gaps 0.05px to 52.20px; population worst 54.08px). D2 and D3 are therefore AUDIT artifacts (same family as the lenStep drift #757), NOT product defects - the viewer never sees damage or a swat without contact. Reclassified as disclosed audit artifacts; for a game that keeps adding weapons a hard 0-phantom shot law would chase audit artifacts forever. D1 and D4 remain the open defects.",
  ],
  [
    "    and the commit that last updated docs/handoff/HANDOFF.md MUST MATCH. The last landing is #759 (docs\n    only: the 2026-11-15 solidity re-run and the defect-tracker ruling), whose parent is a3d484c (#758, the\n    harness-side lenStep fix); re-measure the hash, and if the two differ, something else landed -",
    "    and the commit that last updated docs/handoff/HANDOFF.md MUST MATCH. The last landing is #760 (docs\n    only: sequence item (a) closed, D2/D3 reclassified as substep displacement artifacts), whose parent is\n    708d4b9 (#759, docs only: the 2026-11-15 solidity re-run and the defect-tracker ruling); re-measure the hash, and if the two differ, something else landed -",
  ],
  [
    '    Context: #758 landed the harness-side lenStep fix and #759 records my 2026-11-15 re-run on it: law 1 111 -> 12,\n    law 2 117 -> 3, law 2s 116 -> 43, law 4 283 -> 66, law 3 worst 27.399px -> 26.100px at axe vs wand (non-chain,\n    a real defect), visible 614 -> 453; unchanged law 1s 495, law 3s 74.971px, law 4s 60, law 5 10, stall 5.26s. I ruled\n    contact-exactness and solidity hard product requirements: no calibrated band, viewer-visible interpenetration or\n    damage-without-contact is a tracked defect (D1 infeasible pin 26.100px, D2 phantom shot hits 495, D3 whiff-swats 43,\n    D4 visible shot-render overlaps). #759 recorded the run and the ruling.\n    Open, none started: (1) read-only probe of 1s/2s (classify real-vs-artifact); (2) read-only rotational-DOF design\n    probe for the infeasible pin (D1); (3) frame-proof\'s 2,500-tick horizon; (4) Batch 4: the .qa rename and the\n    SPEC/CONTRACT/BUILD move (both need my OK for non-whitespace edits to frozen era files), verify.mjs as a manifest\n    reader, the measure.mjs owner-go flag. Do not start any work until I say "go".',
    "    Context: #759 recorded my 2026-11-15 re-run on the lenStep fix and the defect-tracker ruling. #760 closed sequence\n    item (a): a read-only diagnostic (throwaway scratch-measure.mjs, wand+bow 8 seeds) proved D2 (495 phantom shot hits)\n    and D3 (43 whiff-swats) are substep displacement artifacts - the sim fires land/swat events correctly but the event\n    stores the shot's post-substep position, so recomputes from stored fields show false positives (logged gaps 0.05px\n    to 52.20px); the viewer never sees damage without contact. D2/D3 are disclosed audit artifacts now; D1 (infeasible\n    pin 26.100px at axe vs wand) and D4 (visible shot-render overlaps) remain the open defects.\n    Open, none started: (1) read-only rotational-DOF design probe for the infeasible pin (D1); (2) frame-proof's\n    2,500-tick horizon; (3) Batch 4: the .qa rename and the SPEC/CONTRACT/BUILD move (both need my OK for non-whitespace\n    edits to frozen era files), verify.mjs as a manifest reader, the measure.mjs owner-go flag. Do not start any work\n    until I say \"go\".",
  ],
  [
    "Landed through the #759 patch (docs only: the 2026-11-15 solidity re-run and the defect-tracker ruling), on top of #758 (a3d484c, the harness-side lenStep fix), #757 (0d0be4d, docs only: the lenStep finding), #756 (24e1e67, the measure.mjs stride fix), #755 (ffc90ef, Batch 4a), #754 (46ffcd7) and #753 (the RENDERED-FRAME proof ",
    "Landed through the #760 patch (docs only: sequence item (a) closed, D2/D3 reclassified as substep displacement artifacts), on top of #759 (708d4b9, docs only: the 2026-11-15 solidity re-run and the defect-tracker ruling), #758 (a3d484c, the harness-side lenStep fix), #757 (0d0be4d, docs only: the lenStep finding), #756 (24e1e67, the measure.mjs stride fix), #755 (ffc90ef, Batch 4a), #754 (46ffcd7) and #753 (the RENDERED-FRAME proof ",
  ],
  [
    "(the handoff refresh). This file was last updated by #759 ",
    "(the handoff refresh). This file was last updated by #760 ",
  ],
  [
    /^Then propose the next item from section 7 .*$/m,
    "Then propose the next item from section 7 - the DEFECT SEQUENCE: (b) read-only rotational-DOF design probe for the infeasible pin (D1), (c) canonical fixes one at a time, (d) balance/trait pass - or frame-proof's 2,500-tick horizon, or the rest of Batch 4's tool MOVES - and WAIT for \"go\".",
  ],
]);
console.log("AFTER  " + F.map((f) => f + " " + md5(f)).join(" | "));
console.log(bad ? "FAILED - do not commit" : "OK - both files updated");
process.exit(bad ? 1 : 0);
