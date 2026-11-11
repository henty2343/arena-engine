/* scratch/triage/append-games-729.mjs — asserted append of GAMES #729 (session 7, 2026-11-11).
 * Appends ONE new entry. Refuses (writes nothing) unless the file ends with the #728 tail and has no #729. */
import { readFileSync, writeFileSync } from 'node:fs';
const F = 'docs/GAMES.md';
const t = readFileSync(F, 'utf8');
if (t.includes('#729 ·')) { console.error('#729 already present — WRITING NOTHING'); process.exit(1); }
if (!/the `64f2ef7`\/`1ff647d` equivalence\.\n$/.test(t)) { console.error('file does not end with the expected #728 tail — WRITING NOTHING'); process.exit(1); }
const entry = `
## 2026-11-11 — #729 · THE FULL BATTERY RE-RUN ON THE SESSION-7 BYTES — ALL AS EXPECTED, CANONICAL UNTOUCHED (Item 3 follow-on, session 7)

- **DATED ADDENDUM — SUPERSEDES ONE CLAIM IN #728 (the original stays visible above).** #728's *"What this entry does not claim"* said \`seam-proof\`, \`pair-proof\`, \`flipproof\`, \`leadproof\` and \`chromecheck\` were **not re-run** this session. They have now been, on the committed session-7 bytes (\`09fb202\`), plus \`lengrow-gate\`. Nothing they read had changed, so every verdict is the expected one — but it is now **measured, not inferred**.
- **THE RESULTS (logs: \`scratch/triage/runs-session7/battery-*.log\`, each ending with its exit code, duration and md5-after).** \`seam-proof\` **47/55 passed, 8 retired, 0 failed**, exit 0 (232 s) · \`pair-proof\` **37/37**, exit 0 (19 s) · \`flipproof\` **ALL PASS**, exit 0 (17 s; the T4 ledger line reads 14 sweeps, 14 arms) · \`leadproof\` **ALL PASS**, exit 0 (22 s; hits 442 / parries 311 / swats 154 = touch 139 + cut-window 15) · \`chromecheck\` **2× PASS** (chrome + pairing), exit 0 (12 s) · \`lengrow-gate\` **exit 1 BY DESIGN** (4 s) — *"the uniform stretch first breaks the gate at k=1.0778 (+7.8%)"*, i.e. the pre-baked ladder IS required, the recorded design point, not a failure. Earlier in the session: \`inscribe\` **GATE: PASS**, \`lengrow-build-proof\` **57 passed, 0 failed**, \`lengrow-bake --verify\` **exit 0, 12/12** (#728).
- **THE MD5 AFTER EVERY RUN is \`e431d344347a55da51e1f4604cbeb4ed\` / 5,392 lines** — canonical untouched, never written by anything in this session.
- **A FIRST ATTEMPT WAS KILLED AND IS NOT COUNTED.** The first launch of this battery was backgrounded without detaching and died when the tool call that started it ended: its \`seam-proof\` log stops mid-section H with **no exit line**, and no process was left running. It proves nothing and is kept, labelled, as \`battery-seam-proof.KILLED-partial.log\`. The reported run was relaunched fully detached (\`setsid\`) via \`scratch/triage/run-battery-session7.sh\` and ran to completion. (Only the \`seam-proof\` log of the first attempt existed; the others never started.)
- **WHAT THIS ENTRY DOES NOT CLAIM.** \`measure.mjs\` did not run (standing owner rule). The fingerprint suite was not re-based (canonical byte-identical). **Item 3 and its follow-on remain closed; the open items are the owner's** and unchanged: the stale \`LEN_CIRCLES\` provenance comment (needs \`--write\`, moves the md5), the runner scripts' exec bits, PR #3's base, the \`.orig\` backups, and \`64f2ef7\`/\`1ff647d\`. Nothing here is pushed.
`;
writeFileSync(F, t + entry);
console.log('appended #729:', entry.length, 'bytes');
