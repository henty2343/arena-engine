# HANDOFF — session handoff for the next AI agent

Written 2026-11-05 by the session that performed THE RESTRUCTURE.
**Scope: this file covers repo-organization work ONLY.** The game/engine work
state lives in README.md ("Starting a new chat — checkpoint") and `docs/GAMES.md` —
those are the authority for anything SpinClash-mechanics; this doc does not supersede them.

## What THIS session was about

The owner asked for the flat repo root to be structured: **all docs into `docs/`,
preview/dump artifacts into `previews/`** — done, verified, awaiting his manual push.
No game code was touched (none is in this repo yet — the scaffolding dirs are
`.gitkeep` placeholders; the canonical code lives in his local `uploads/`).

## THE RESTRUCTURE — COMPLETED AND PROVEN

**Moved (pure renames, zero content change):** SPEC.md · CONTRACT.md · BUILD.md ·
GAMES.md · CHRONICLE-archive.md → `docs/`  |  spinclash-preview.html ·
project_dump.txt → `previews/`  |  README.md STAYS AT ROOT (GitHub renders only that one).

**Twelve asserted patches** (exact-match string replacements; a count mismatch must WARN,
never guess): README's four `](./X.md)` links → `](./docs/X.md)`; the `## Repo` layout
tree in docs/SPEC.md (now names README/docs//previews/); `measure.mjs` default target
`join(here,'previews','spinclash-preview.html')` + its usage header; `chromecheck.mjs`
default target; `ingest.mjs` usage example `--into previews/spinclash-preview.html`;
`combine.js` now writes the dump to `previews/project_dump.txt` (mkdirSync; the walk
skips it by filename, so it can never ingest its own output).

**Verification performed:** full rehearsal in a scratch git repo built from the pre-move
tree → all 7 moves staged as renames, 12/12 patches OK, output byte-identical to the
hand-built tree; `node --check` clean on the four patched JS tools; a live `combine.js`
run produced the dump in `previews/` with nothing leaking to root and new `FILE: docs/…`
headers. Residual sweep: no markdown link or tool default points at a moved root file.

## THE LAW — things the next agent must not break

1. **`uploads/` is the canonical working set** — README's batch tables, the canonical
   md5s, and EVERY `.qa/` + `scratch/` default resolve `../uploads/spinclash-preview.html`.
   NEVER repoint those to `previews/` "for consistency" — that is a different, local file.
   The repo-root tools are GitHub *mirrors* arranged to run bare from the repo root.
   If a future push re-mirrors `uploads/measure.mjs` → root, the one-line default patch
   must be re-applied to the root copy (the uploads copy stays as-is).
2. **History is never rewritten.** GAMES.md and CHRONICLE-archive.md keep their dated
   bare-filename mentions by design; filenames did not change, only locations.
3. **`previews/project_dump.txt` is GENERATED** — stale by construction the moment any
   file moves again. NEVER hand-patch it; `node combine.js` regenerates it.
4. **Verify path changes statically** (grep sweeps, `node --check`, rehearsal diff) —
   do NOT run the game harness to "test" a layout change: `measure.mjs` never runs
   without the owner's explicit go (standing rule, owner 2026-10-19).
5. Every structural edit follows THE ASSERTED-PATCH METHOD: grep for functional
   references first (markdown links, `join(...)`, default paths, usage examples),
   patch exact strings with expected match counts, rehearsal on a throwaway copy
   before touching the real tree.
6. Token economy is law: pull via API/curl into local files and grep/sed them —
   do not read multi-hundred-KB docs into chat context.

## OPEN / PENDING (as of 2026-11-05)

- **The push is the owner's to make** (force-push caveat: the restructured tree is a
  fresh single commit replacing the two batch commits; if his local files ran ahead
  of the GitHub push, their deltas must be ported onto the new paths first).
- The four root tools (`chromecheck` · `combine` · `ingest` · `measure`) could still
  group into `tools/` — discussed, NOT done, owner's call.
- Consider whether the 1.7 MB dump and 483 KB preview belong in git long-term
  (gitignore / Releases / LFS) — raised, undecided.
- New content convention going forward: docs → `docs/`, preview/dump artifacts →
  `previews/`, README stays root. SPEC.md's `## Repo` tree is now the layout authority.
