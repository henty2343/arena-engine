const fs = require("fs"),
  crypto = require("crypto");
const md5 = (f) =>
  crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex");
const IN = {
  "docs/handoff/HANDOFF.md": "75903f54888b418d2fb2ef5400d2c177",
  "docs/handoff/BATCH3-STATUS.md": "5ce1e6c85125492d53cd2c96aa652db0",
};
let bad = 0;
for (const f in IN) {
  const b = fs.readFileSync(f);
  if (b.includes(13)) {
    console.log("CRLF REFUSED " + f);
    bad++;
  }
  const m = crypto.createHash("md5").update(b).digest("hex");
  if (m !== IN[f]) {
    console.log("INPUT MISMATCH " + f + " got " + m);
    bad++;
  }
}
if (bad) {
  console.log("refused, nothing written");
  process.exit(1);
}
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
  console.log(f + " -> " + md5(f));
}
const LEDGER =
  "## #759 the 2026-11-15 solidity re-run on the lenStep fix + the defect-tracker ruling - ledger (this commit)\n\nWhat: DOCS ONLY, both handoff files. (1) Records the owner's 2026-11-15 --solidity re-run on the #758 lenStep fix (cmd.exe, exit=0, 657.2s wall, 109 battles, 8 workers, canonical md5 unchanged): law 1 phantom hits 111 -> 12, law 2 parries-without-touch 117 -> 3, law 2s swats-without-touch 116 -> 43, law 4 replica mismatches 283 -> 66 and stuck flags 123,260 -> 94,476; law 3 worst 27.399px -> 26.100px at natural seed 27 t4942 (axe vs wand, spins 6.5/-12.6, non-chain) with visible 614 -> 453; unchanged law 1s 495/2,849, law 3s 74.971px, law 4s 60, law 5 10, stall 5.26s. (2) Records the OWNER'S RULING: contact-exactness and solidity are hard product requirements - a viewer must never see weapons tunnel through each other or damage/parry/swat fire without visible contact; the calibrated band (6px / 20.754px) is RETIRED; law 3 becomes a DEFECT TRACKER. Open defects: D1 infeasible pin (26.100px, axe vs wand, translation-only projection with no rotational DOF), D2 phantom shot hits (495/2,849, cause unknown), D3 whiff-swats (43/1,837), D4 visible shot-render overlaps (law 3s body/blade subset). (3) Rewrites HANDOFF section 7 next-items as the sequence: (a) read-only probe of 1s/2s (classify real-vs-artifact), (b) read-only rotational-DOF design probe for D1, (c) canonical fixes one at a time with re-baseline, (d) balance/trait pass afterwards.\nWhy: the re-run proved the lenStep fix removed ~90% of the phantom contacts and isolated the remaining reds to real defects; the old band stance described a limit the owner now rejects as product-acceptable.\nApproved: \"go\" after the ruling proposal (defect-tracker stance + sequence).\nDeviations: DOCS ONLY - no code, probe, canonical, LAWS, GAMES or generated file touched; the law table Status column unchanged (C3 partial, S3 owner-run only).\nNot verified: no proofs re-run (docs only); the run numbers are the owner's report, quoted verbatim.\nRollback: `git revert` this commit.\n";
edit("docs/handoff/BATCH3-STATUS.md", [
  [
    "#758 DONE (this commit: the lenStep fix, harness-side).",
    "#758 DONE (a3d484c, the lenStep fix, harness-side) - #759 DONE (this commit: docs only - the 2026-11-15 solidity re-run on the lenStep fix and the defect-tracker ruling).",
  ],
  [
    "Next: the owner's re-run of --solidity on the lenStep fix, then the S3 and band RULINGS (held until re-measured), then Batch 4's tool moves",
    "Next: the DEFECT SEQUENCE - (a) read-only probe of 1s/2s, (b) rotational-DOF design probe for the infeasible pin, (c) canonical fixes, (d) balance/trait pass - or frame-proof's 2,500-tick horizon, or the rest of Batch 4's tool moves",
  ],
  [
    "## #758 the lenStep fix (harness-side) + lenstep-proof - ledger (this commit)",
    LEDGER +
      "## #758 the lenStep fix (harness-side) + lenstep-proof - ledger (commit a3d484c)",
  ],
]);
edit("docs/handoff/HANDOFF.md", [
  [
    "#758 (this file's last update): the lenStep FIX, HARNESS-SIDE ONLY (the canonical is untouched)",
    "#758 = a3d484c: the lenStep FIX, HARNESS-SIDE ONLY (the canonical is untouched)",
  ],
  [
    "measure.mjs was NOT run; the owner's re-run is owed. Its own commit hash is not known to",
    "measure.mjs was NOT run; the owner's re-run is owed. Confirmed on origin as a3d484c.\n  #759 (this file's last update): DOCS ONLY - the 2026-11-15 solidity re-run on the lenStep fix (exit 0, 657.2s, 109 battles) and the owner's defect-tracker ruling (no calibrated band; viewer-visible interpenetration or damage-without-contact is a tracked defect; D1 infeasible pin 26.100px at axe vs wand, D2 phantom shot hits 495, D3 whiff-swats 43, D4 visible shot-render overlaps; sequence: probe 1s/2s, rotational-DOF design probe, canonical fixes, balance pass). Its own commit hash is not known to",
  ],
  [
    "Next: THE OWNER'S RE-RUN of `node measure.mjs --solidity` on the lenStep fix (cmd.exe, plain `>` redirects, `echo exit=%errorlevel%`), THEN the S3 and band RULINGS (the owner's, HELD until that re-run), or frame-proof's 2,500-tick horizon, or the rest of Batch 4's tool MOVES",
    "Next: the DEFECT SEQUENCE - (a) read-only probe of 1s/2s (classify real-vs-artifact), (b) read-only rotational-DOF design probe for the infeasible pin (D1), (c) canonical fixes one at a time with re-baseline, (d) balance/trait pass - or frame-proof's 2,500-tick horizon, or the rest of Batch 4's tool MOVES",
  ],
  [
    "\n\n## 0. The record is a SET (since 3c)",
    "\n\nState after the #759 patch (BASE a3d484c; re-measure, do not trust): DOCS ONLY. Every file other than the two handoff files is byte-identical to the #758 block above (measure.mjs a383fe19cdf7cfdc642c3565bfa0d9fe, frame-proof b736f099b42acfb8d096c9c4ff43ee3f, lenstep-proof 0b83efa69f70f0ddb6c2f264dfa6dea2, manifest.json a2b47333be5ad7f9cd9c2c4a4e1e8752, STATE 62c2d508632313cbbb0dfa156bea1085). The two handoff files are not listed (a file cannot hold its own md5). Receipts: verify --quick PASS (6 checks); no code, probe or generated file touched, so no controls; the battery was not run (the canonical is untouched).\n\n## 0. The record is a SET (since 3c)",
  ],
  [
    "law 1s (495/2,849) has no known cause.",
    "law 1s (495/2,849) has no known cause. THE OWNER'S RE-RUN ON THE lenStep FIX (2026-11-15; cmd.exe, plain > redirects, exit=0, 657.2s wall, 109 battles, 8 workers, canonical md5 unchanged): law 1 111 -> 12 phantom hits, law 2 117 -> 3 parries-without-touch, law 2s 116 -> 43 swats-without-touch, law 4 283 -> 66 replica mismatches and 123,260 -> 94,476 stuck flags; law 3 worst 27.399px -> 26.100px (natural seed 27 t4942, axe vs wand, non-chain) visible 614 -> 453; unchanged law 1s 495/2,849, law 3s 74.971px, law 4s 60, law 5 10, stall 5.26s. THE DEFECT-TRACKER RULING (owner 2026-11-15): contact-exactness and solidity are hard product requirements - a viewer must never see weapons tunnel through each other or damage/parry/swat fire without visible contact; the 6px and 20.754px calibrations are RETIRED; law 3's row becomes a defect tracker; open defects D1 infeasible pin (26.100px), D2 phantom shot hits (495), D3 whiff-swats (43), D4 visible shot-render overlaps; sequence (a) read-only probe of 1s/2s, (b) read-only rotational-DOF design probe for D1, (c) canonical fixes one at a time with re-baseline, (d) balance/trait pass.",
  ],
  [
    ".qa/lenstep-proof.mjs reports the count.",
    ".qa/lenstep-proof.mjs reports the count. The 2026-11-15 owner re-run on the lenStep fix confirmed it (law 1 111 -> 12, law 2 117 -> 3, law 2s 116 -> 43, law 4 283 -> 66); the residue and the new defect tracker live in section 7 (THE OWNER'S RE-RUN / THE DEFECT-TRACKER RULING).",
  ],
  [
    "    and the commit that last updated docs/handoff/HANDOFF.md MUST MATCH. The last landing is #758 (the\n    harness-side lenStep fix), whose parent is 0d0be4d (#757, docs only: the lenStep finding and the retraction of\n    #756's law 3 claim); re-measure the hash, and if the two differ, something else landed -",
    "    and the commit that last updated docs/handoff/HANDOFF.md MUST MATCH. The last landing is #759 (docs\n    only: the 2026-11-15 solidity re-run and the defect-tracker ruling), whose parent is a3d484c (#758, the\n    harness-side lenStep fix); re-measure the hash, and if the two differ, something else landed -",
  ],
  [
    "    Context: #756 fixed a stale stride in measure.mjs; my 2026-11-15 re-run showed the integrity check passes but\n    every other count unchanged. The cause found: measure.mjs and frame-proof's C3 pose never passed the fighter's\n    lenStep (events do not carry it), so a grown chain was rebuilt short; #757 recorded it and retracted #756's\n    law 3 claim. #758 is the harness-side fix: measure.mjs stashes lenStep pre-tick (entryLs) and passes it at\n    every chain-aware site, frame-proof's C3 pose passes its ls, new .qa/lenstep-proof.mjs asserts it (84 grown-chain\n    hits 0 phantoms with lenStep / 36 without; 165 parries 0 without touch / 47 without); frame-proof C3 re-baselined\n    (worst 18.041 -> 15.505px, visible 43 -> 35, 0.0513%); my 6px band calibration still fails at 15.505px on wand+bow\n    (no chain). measure.mjs was NOT run on #758: my re-run is owed. Link-add ticks and in-tick grows stay inexact\n    unless lenStep goes on the sim's audit tape or events = a canonical edit, my call, rule 5.\n    Open, none started: (1) my re-run of --solidity on #758, then the numbers; (2) my rulings on law 3s and the\n    measure.mjs band calibration, HELD until that re-run; (3) frame-proof's 2,500-tick horizon; (4) Batch 4: the .qa\n    rename and the SPEC/CONTRACT/BUILD move (both need my OK for non-whitespace edits to frozen era files), verify.mjs\n    as a manifest reader, the measure.mjs owner-go flag. Do not start any work until I say \"go\".",
    '    Context: #758 landed the harness-side lenStep fix and #759 records my 2026-11-15 re-run on it: law 1 111 -> 12,\n    law 2 117 -> 3, law 2s 116 -> 43, law 4 283 -> 66, law 3 worst 27.399px -> 26.100px at axe vs wand (non-chain,\n    a real defect), visible 614 -> 453; unchanged law 1s 495, law 3s 74.971px, law 4s 60, law 5 10, stall 5.26s. I ruled\n    contact-exactness and solidity hard product requirements: no calibrated band, viewer-visible interpenetration or\n    damage-without-contact is a tracked defect (D1 infeasible pin 26.100px, D2 phantom shot hits 495, D3 whiff-swats 43,\n    D4 visible shot-render overlaps). #759 recorded the run and the ruling.\n    Open, none started: (1) read-only probe of 1s/2s (classify real-vs-artifact); (2) read-only rotational-DOF design\n    probe for the infeasible pin (D1); (3) frame-proof\'s 2,500-tick horizon; (4) Batch 4: the .qa rename and the\n    SPEC/CONTRACT/BUILD move (both need my OK for non-whitespace edits to frozen era files), verify.mjs as a manifest\n    reader, the measure.mjs owner-go flag. Do not start any work until I say "go".',
  ],
  [
    "Landed through the #758 patch (the lenStep fix, harness-side), on top of #757 (0d0be4d, docs only: the lenStep finding), #756 (24e1e67, the measure.mjs stride fix), #755 (ffc90ef, Batch 4a), #754 (46ffcd7) and #753 (the RENDERED-FRAME proof ",
    "Landed through the #759 patch (docs only: the 2026-11-15 solidity re-run and the defect-tracker ruling), on top of #758 (a3d484c, the harness-side lenStep fix), #757 (0d0be4d, docs only: the lenStep finding), #756 (24e1e67, the measure.mjs stride fix), #755 (ffc90ef, Batch 4a), #754 (46ffcd7) and #753 (the RENDERED-FRAME proof ",
  ],
  [
    "(the handoff refresh). This file was last updated by #758 ",
    "(the handoff refresh). This file was last updated by #759 ",
  ],
  [
    /^Then propose the next item from .*$/m,
    "Then propose the next item from section 7 - the DEFECT SEQUENCE: (a) read-only probe of 1s/2s, (b) read-only rotational-DOF design probe for the infeasible pin (D1), (c) canonical fixes one at a time, (d) balance/trait pass - or frame-proof's 2,500-tick horizon, or the rest of Batch 4's tool MOVES - and WAIT for \"go\".",
  ],
]);
console.log(
  bad
    ? "FAILED - nothing reliable written, do not commit"
    : "OK - both files updated",
);
process.exit(bad ? 1 : 0);
