# NEXT-AGENT PROMPT — paste this into a fresh chat to continue the arena-engine work

*Paste everything between the two `---` rules into a new session.*

---

You are continuing the **arena-engine / SpinClash** work. Read this whole brief before touching
anything, and do not start a task until you have verified the state it claims.

## THE STATE, IN ONE PARAGRAPH

Item 3 — the stale-proof triage — is **CLOSED and on the remote**. Repo `henty2343/arena-engine`,
branch `spinclash-item-three-triage-80aa6`, remote tip `bd420e9`. Menu items 4 (the lengrow
re-seed, proven falsifiable 6/6), 5 (flipproof's seeds + the T4 clock ledger, 12/12) and 6
(leadproof's two swat classes, 6/6) are done, as is item 7 (the close-out). `docs/GAMES.md`
entries **#723–#727** record sessions 2–6, and the remote's `docs/GAMES.md` is **byte-identical**
to the session's file (blob `86bcb36c234319fa8fd6fa80a5765c5b9c83f93b`).

## THE CANONICAL — NEVER TOUCH IT

`previews/spinclash-preview.html` — md5 `e431d344347a55da51e1f4604cbeb4ed`, **5,392 lines**,
stamp `links-r87`. (There is **NO** `arena-engine.html` at repo root.) Verify the md5 and the line
count **before and after every run**; if either moved, **STOP and report** — do not "fix" it.
Everything Item 3 touched was **proof-side** (`.qa/*.mjs`). A canonical edit is a separate owner
matter: the baker writes the canonical, so it needs the owner's explicit go.

## THE HOUSE RULES (breaking these is worse than not finishing)

1. **Asserted-patch method only** — exact-match + an expected count; a count mismatch fails
   loudly and writes **nothing**. Templates: `scratch/triage/patch-seam-proof.mjs`,
   `patch-nonvacuity.mjs`, `patch-pair-proof.mjs`, `patch-lengrow-proof.mjs`.
2. **Every re-seeded cell must be proven falsifiable** by an injected break, and prefer
   **scalar post-boot breaks** over boot-guard-tripping ones — unless the guard *is* the
   coverage. (Session 3's G6 guard trap produced a false "10/10".)
3. **Never hand-edit baked rows** — the row-splice baker only.
4. **History is never rewritten.** Dated corrections; superseded claims stay visible; each turn
   gets a **new GAMES entry**; the old text is never deleted.
5. **`measure.mjs` NEVER runs** without the owner's explicit go. Never.
6. **Never force-push this branch.** Merge instead.
7. Grep/sed the big docs; checkpoint early and often; `scratch/` is gitignored but force-tracked
   by convention → `git add -f`.

## HOW TO START (and prove the state before believing it)

```bash
git clone https://github.com/henty2343/arena-engine.git && cd arena-engine
git fetch origin && git checkout spinclash-item-three-triage-80aa6
md5sum previews/spinclash-preview.html && wc -l previews/spinclash-preview.html
# expect: e431d344347a55da51e1f4604cbeb4ed / 5392
node .qa/inscribe.mjs          # expect: GATE: PASS
```

Then read, in order: `scratch/HANDOFF-ITEM3-SESSION6.md` (the authoritative NOW state),
`scratch/HANDOFF-ITEM3-SESSION5.md`, `scratch/HANDOFF-ITEM3-SESSION4.md`,
`scratch/HANDOFF-ITEM3-SESSION2.md`, `scratch/stale-triage-menu.md`, `scratch/handoff-repair-brief.md`,
and `docs/GAMES.md` #723–#727.

## THE BATTERY (what "green" looks like, and the two exits that are NOT failures)

| command | expected |
|---|---|
| `node .qa/seam-proof.mjs` | `47/55 passed, 8 retired, 0 failed`, exit 0 (~233 s) |
| `node .qa/lengrow-build-proof.mjs` | `57 passed, 0 failed`, exit 0 (~42 s) |
| `node .qa/pair-proof.mjs` | `37/37`, exit 0 (~21 s) |
| `node .qa/flipproof.mjs` | `ALL PASS`, exit 0 — 14 sweeps, arms === sweeps (~16 s) |
| `node .qa/leadproof.mjs` | `ALL PASS`, exit 0 — 442 hits / 311 parries / 154 swats (139 touch + 15 cut-window) (~23 s) |
| `node .qa/inscribe.mjs` | `GATE: PASS`, exit 0 |
| `node chromecheck.mjs` | **2× PASS** (chrome + pairing), exit 0 |
| `node .qa/lengrow-gate.mjs` | **exit 1 BY DESIGN** — the uniform stretch first breaks the inscribed gate at k = 1.0778 (+7.8 %), i.e. the pre-baked ladder IS required. Not a failure. |
| `node .qa/lengrow-bake.mjs --verify` | **exit 2, writes nothing** — its guard says "expected exactly one growing weapon (spear), found [spear, flail] — this tool bakes the spear only". **Pre-existing since `links-r87`**, not a regression. **THIS IS THE NEXT OPEN ITEM.** |

Logs of the last full run: `scratch/triage/runs-closeout/*.log` (each carries its md5-after line).

## THE OPEN ITEMS, in the order they should be taken

1. **`lengrow-bake` must learn the chain case — and it needs an OWNER DECISION FIRST.** The baker
   refuses because the roster has two growing weapons (the spear, and the flail's link-adder
   `trait.len`). Item 4's re-seed encodes the same fact (a chain grower needs a well-formed
   `chain.ext`, not a ladder row). The baker writes the canonical (`LEN_CIRCLES`), so this is a
   **canonical-touching** change: present the options (extend the baker to the chain case, or
   scope it and say so) and wait for the owner's word. Do not quietly change the canonical.
2. **The two runner scripts' exec bits** on the remote (`100644` vs local `100755` — the
   contents API cannot carry mode bits). Cosmetic; `bash script.sh` works either way.
3. **PR #3's base** is `item-three-stale-proof-triage-237df`, **not `main`** — an owner decision.
4. **Two `.orig` backups** sit in the branch (`scratch/triage/lengrow-build-proof.mjs.orig`,
   `pair-proof.mjs.orig`) — house convention keeps them, but they are diff noise.
5. **`64f2ef7` vs `1ff647d`**: the owner's local handoff-name correction and the session's
   equivalent carry the **same tree change under different SHAs**. Keep whichever; never
   force-push to "fix" it.

## THE PUSH MECHANICS (if you need to write to the remote)

This sandbox has **no git credentials** (`git push` → *"could not read Username"*), so writes go
through the **connected GitHub App's `push_files`** tool. Its tool-call payload cap is **512KiB**
(523,102 bytes accepted, 524,302 rejected) and a file must be written whole — so **a file over
~500KB cannot cross** (`docs/GAMES.md` is ~690KB; it travelled as a 38.8KB **patch** instead:
`scratch/triage/games-entries.patch`). Big-file deltas are the way through. The App's commits are
its own objects (same trees, different SHAs), so after writing, `git fetch` + `git merge --no-ff
origin/spinclash-item-three-triage-80aa6` to keep the local branch a descendant of the remote tip.
**On Windows:** the repo has no `.gitattributes`, so `core.autocrlf=true` puts CRLF in the working
copy and plain `git apply` fails at `docs/GAMES.md:23` — use `git apply --ignore-whitespace` and
then `sed -i 's/\r$//'` the file before staging, and check the result with
`git rev-parse :docs/GAMES.md` (expect `86bcb36c234319fa8fd6fa80a5765c5b9c83f93b`).

## THE TOOLS THAT PROVED THEMSELVES (reuse them)

- `scratch/triage/diag-nonvacuity-*.mjs` — extract the **shipped** cell's source **verbatim** and
  evaluate it against mutated runtime objects, so a proof cannot drift from what ships.
- `scratch/triage/diag-flip-ledger.mjs` — the two-channel ledger measurement (the flip clock's own
  decrease + the sim tick counter `G.t`), which is how the RAW spend is separated from the
  canonical's `Math.max(0,…)` clamp at :5080.
- `scratch/triage/diag-flip-seeds.mjs` — re-pick the flipproof seeds if they ever rot again.
- `scratch/docreflow.mjs` + `scratch/navgen.mjs` — run on `docs/GAMES.md` **after** any edit (they
  default to `uploads/GAMES.md`, so pass the path explicitly). They reflow whitespace and
  regenerate the nav block; they rewrite no record.
- `scratch/triage/run-suite.sh` / `run-final-suite.sh` — the battery runners; each log records its
  exit code, duration and the md5-after.

## STOP RULES

If the canonical md5 moves → stop and report. If a probe reports a number you cannot explain →
stop and report. If a repair would make a cell *silent* instead of *red* → that is a regression
(the seam-proof G4 lesson: a dead cell aborts the run and every assertion after it never
executes). If you are about to change the canonical → ask the owner first. If you are about to
claim PASS → make sure the cell measured something.

---
