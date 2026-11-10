# HANDOFF — session handoff for the next AI agent

Written 2026-11-05 by the session that performed THE RESTRUCTURE.
**AMENDED 2026-11-10** by the alignment session (owner rulings in chat): the restructure push
landed PARTIAL, `uploads/` is RETIRED, `previews/` is the ONE canonical, and `combine.js` +
`project_dump.txt` are retired. **Where the 2026-11-05 text below and the amendment disagree,
the amendment wins.**
**Scope: this file covers repo-organization work ONLY.** The game/engine work
state lives in README.md ("Starting a new chat — checkpoint") and `docs/GAMES.md` —
those are the authority for anything SpinClash-mechanics; this doc does not supersede them.

## 2026-11-10 AMENDMENT — what actually landed, and the owner's rulings

- **The push happened** as the single commit `0392bf8 "update"` — and it was PARTIAL against
  the 2026-11-05 plan: `previews/spinclash-preview.html` landed; `previews/project_dump.txt`
  did **not**; **`combine.js` was never committed and is RETIRED** (owner 2026-11-10:
  *"remove the combine.js and the other stuff ... which was misaligned/out of date"*). The
  dump is retired with it — nothing in the committed tree reads either, and Law #3 below is
  retired accordingly.
- **Owner ruling 2026-11-10: `uploads/` is the OLD local working folder; `previews/` is the
  NEW one and the ONE canonical** (*"uploads folder is old, previews folder is the new one"*).
  Law #1 below is REPEALED: every `.qa/` + `scratch/` default that resolved
  `../uploads/spinclash-preview.html` now resolves `../previews/spinclash-preview.html`, and
  `navgen`/`docreflow` default to `docs/GAMES.md`. `.gitignore` lists `uploads/` so the
  retired folder can never be re-committed by accident. Verified statically per Law #4
  (grep sweep + `node --check`) — the game harness was NOT run to "test" the layout change.
- **Scratch hygiene** per the `review-r60` purge precedent: the 6 superseded per-build smokes
  (`smoke-r62/r68/r73/r79/r82/r86`) and 3 superseded chromecheck variants
  (`chromecheck-r73/r82/r86`) were PURGED; `navgen.mjs`, `docreflow.mjs` and `loader-r54.mjs`
  are KEPT (live tools). Record: GAMES.md #721.
- **The canonical at amendment time:** `previews/spinclash-preview.html` @ **`links-r87`**,
  md5 `afc30118054c81265ade159224c9f03f`, 5,392 lines — the owner's own invention (*"i have
  invented the link stretch, just not documented it"*), recorded retroactively as GAMES #721.

## What THIS session was about (2026-11-05 record)

The owner asked for the flat repo root to be structured: **all docs into `docs/`,
preview/dump artifacts into `previews/`** — done, verified, awaiting his manual push.
**[2026-11-10: the push landed as `0392bf8`, partial — see the amendment above.]**
No game code was touched (none is in this repo yet — the scaffolding dirs are
`.gitkeep` placeholders; the canonical code lived in his local `uploads/`
**[2026-11-10: `uploads/` is retired; `previews/spinclash-preview.html` is the canonical]**).

## THE RESTRUCTURE — COMPLETED AND PROVEN (2026-11-05 record of the rehearsed plan)

**Moved (pure renames, zero content change):** SPEC.md · CONTRACT.md · BUILD.md ·
GAMES.md · CHRONICLE-archive.md → `docs/`  |  spinclash-preview.html ·
project_dump.txt → `previews/`  |  README.md STAYS AT ROOT (GitHub renders only that one).
**[2026-11-10: only `spinclash-preview.html` actually landed; `project_dump.txt` never
entered git and is retired.]**

**Twelve asserted patches** (exact-match string replacements; a count mismatch must WARN,
never guess): README's four `](./X.md)` links → `](./docs/X.md)`; the `## Repo` layout
tree in docs/SPEC.md (now names README/docs//previews/); `measure.mjs` default target
`join(here,'previews','spinclash-preview.html')` + its usage header; `chromecheck.mjs`
default target; `ingest.mjs` usage example `--into previews/spinclash-preview.html`;
`combine.js` now writes the dump to `previews/project_dump.txt` (mkdirSync; the walk
skips it by filename, so it can never ingest its own output).
**[2026-11-10 CORRECTION: the `combine.js` patch describes the rehearsed plan, not the
pushed tree — `combine.js` never landed in the repo and is RETIRED along with the dump.
The other patches are live in `0392bf8`.]**

**Verification performed:** full rehearsal in a scratch git repo built from the pre-move
tree → all 7 moves staged as renames, 12/12 patches OK, output byte-identical to the
hand-built tree; `node --check` clean on the four patched JS tools; a live `combine.js`
run produced the dump in `previews/` with nothing leaking to root and new `FILE: docs/…`
headers. Residual sweep: no markdown link or tool default points at a moved root file.
**[2026-11-10: the single squashed `0392bf8` commit means the rename claim is not auditable
from git history; this paragraph is the record of the rehearsal.]**

## THE LAW — things the next agent must not break (amended 2026-11-10)

1. **~~`uploads/` is the canonical working set~~ — REPEALED 2026-11-10 at the owner's
   ruling.** `previews/spinclash-preview.html` is the ONE canonical; the owner's local
   `uploads/` folder is old and retired (gitignored). Every `.qa/` + `scratch/` default
   now resolves `../previews/spinclash-preview.html` (and `docs/GAMES.md` for the doc
   tools) — those repoints are DONE, verified statically; do not revert them. The
   re-mirroring clause of the old law is moot: there is one copy, in git.
2. **History is never rewritten.** GAMES.md and CHRONICLE-archive.md keep their dated
   bare-filename mentions by design; superseded mechanics stay in their dated entries
   with the new entry carrying the SUPERSEDED marker (the #720 → #721 pattern).
3. **~~`previews/project_dump.txt` is GENERATED~~ — RETIRED 2026-11-10.** The dump and
   `combine.js` never landed in the repo; neither exists, nothing reads them. If a future
   session needs a whole-repo dump again, it is a new tool with a new record — do not
   resurrect the old claims.
4. **Verify path changes statically** (grep sweeps, `node --check`, rehearsal diff) —
   do NOT run the game harness to "test" a layout change: `measure.mjs` never runs
   without the owner's explicit go (standing rule, owner 2026-10-19).
5. Every structural edit follows THE ASSERTED-PATCH METHOD: grep for functional
   references first (markdown links, `join(...)`, default paths, usage examples),
   patch exact strings with expected match counts, rehearsal on a throwaway copy
   before touching the real tree.
6. Token economy is law: pull via API/curl into local files and grep/sed them —
   do not read multi-hundred-KB docs into chat context.

## OPEN / PENDING (updated 2026-11-10)

- The restructure push is DONE (`0392bf8`); future pushes remain the owner's to make.
- The root tools (`chromecheck` · `ingest` · `measure` — `combine` retired) could still
  group into `tools/` — discussed, NOT done, owner's call. Same undecided call for
  promoting `navgen`/`docreflow` out of `scratch/` (raised in the 2026-11-10 audit).
- Whether the ~483 KB preview belongs in git long-term (Releases / LFS) — raised,
  undecided; the dump-size half of the question is moot (retired).
- New content convention going forward: docs → `docs/`, preview artifacts → `previews/`,
  README stays root. SPEC.md's `## Repo` tree is the layout authority — realigned to the
  actual tree 2026-11-10 (engine dirs marked as Phase-0 placeholders; the live SpinClash
  harness — root tools, `.qa/`, `scratch/` — now listed).
- **2026-11-10 (late) — repair sessions landed as #722** (owner push pending): the bare-Node
  harness contract RESTORED (location guard + Path2D/gradient stubs + lengrow-gate non-vacuity —
  commits after `d928bed`), `bake-rows` flail bake FIXED (broken since r86) and the flail
  `CIRCLES_V2` row RE-BAKED → `inscribe` GATE: PASS. Canonical md5 now `e431d344347a55da51e1f4604cbeb4ed`,
  5,392 lines, stamp stays `links-r87` (browser-behaviour-neutral); live README slots re-recorded —
  the `afc301…` above is kept as the dated amendment record. **NEW AGENT: read
  `scratch/handoff-repair-brief.md` after this file** — it holds the full repair record, the suite's
  known-red cells, and the ONLY outstanding item: Item 3 stale-proof triage (re-seed vs retire —
  owner policy calls; every listed cell was already red on the r86 build). Verify-green before
  touching anything: `node .qa/inscribe.mjs` → GATE: PASS; `node chromecheck.mjs` → 2× PASS.
- **2026-11-11 — Item 3 stale-proof triage is CLOSED (GAMES.md #723–#727; the line above is the
  dated record of it being OPEN — it stays visible per the house rule).** Every menu item is done
  and proven: lengrow's re-seed falsifiable **6/6** (and its DETAIL string hardened — the case it
  exists to catch was CRASHING the proof instead of reporting red); flipproof's seeds re-pinned
  (FLAG **s1** / CTRL **s7**, the one-side criterion added, a stale seed now fails loudly) and T4
  replaced by the flip clock's own LEDGER (armed ≡ 180ms, lands on exactly 0, raw spend inside one
  frame, arms === sweeps); leadproof's swat cell split into the touch / cut-window classes — both
  audited, nothing unauditable. Full battery green on the final bytes: seam-proof **47/55 + 8
  retired + 0 failed** · lengrow-build-proof **57/0** · pair-proof **37/37** · flipproof **ALL
  PASS** · leadproof **ALL PASS** · `.qa/inscribe.mjs` **GATE: PASS** · `chromecheck.mjs` **2× PASS**.
  **The canonical was never touched** — md5 `e431d344347a55da51e1f4604cbeb4ed`, 5,392 lines,
  verified before and after every run. The non-vacuity number is the honest **9/9, NOT 10/10**
  (session 3's false claim is superseded, and stays visible in GAMES.md #724). The handoff chain
  for the next agent is `scratch/HANDOFF-ITEM3-SESSION6.md`.
