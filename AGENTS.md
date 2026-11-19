# AGENTS.md — start here

Contains: the entry point for AI agents — what to load per task, the standing rules, and where truth lives.
Read when: every session, first, alongside STATE.md. Token cost: see STATE.md §Documentation cost.
Canonical for: agent workflow and loading order. Mutable facts live in STATE.md (generated); design state in GAMES.md.

## What this repo is

A localhost-only Node tool that renders seeded game simulations into publishable MP4s. **The engine is PLANNED, not built**
(`docs/planned/BUILD.md` Phases 0–8; `packages/`, `apps/`, `games/` are placeholders). The **only live code** is game #1, SPINCLASH:
a single-file browser sim, `previews/spinclash-preview.html` (the ONE canonical), plus a dependency-free bare-Node proof harness.
The video file is the product; everything else is scaffolding (`docs/planned/SPEC.md` §Purpose before any tradeoff).

## Load by task (do NOT read everything up front)

| Tier | Files | When |
|---|---|---|
| Always | `AGENTS.md` + `STATE.md` | every session |
| Deliver a patch / process rules | `docs/handoff/RUNBOOK.md` §1 + §6 | before the first delivery of a session |
| Audit work (temporary) | `docs/handoff/ROADMAP.md` | every session while it exists: it names the next open phase; evidence by finding ID in `docs/handoff/AUDIT-REPORT.md` (grep only) |
| Before opening the canonical | `docs/CODEMAP.md` | never read the canonical whole — enter at one symbol |
| Before any sim/doc edit | `docs/LAWS.md` | the standing game laws |
| Add a weapon trait / bot | `docs/RECIPES.md` + the canonical `TRAIT / SKILL REGISTRY` | the cheap-class pattern |
| Engine work | `docs/planned/SPEC.md` · `CONTRACT.md` · `BUILD.md` | only when building the platform |
| History / a past decision | `docs/GAMES.md` (live) + `docs/history/` (frozen eras) | grep by `#NNN`, `^### <n>` or symbol — NEVER read whole |

Never load `docs/GAMES.md`, `docs/history/` or the ledgers whole (costs in `STATE.md`). Grep the entry number
(`grep -n '^### 721' docs/history/`), a symbol or a heading, and read only that region. The nav block in `docs/GAMES.md` indexes
every file by key + line. `STATE.md` carries the current md5/stamp/line-count/baseline.

## Task → command map

- **Add a weapon trait / fighter skill** → `docs/RECIPES.md`: row field → ONE consumer site → one Tier-0 assertion; update the
  canonical REGISTRY. Cheap (a number at an existing site) vs expensive (moves geometry → re-bake): expensive = stop and ask first.
- **Add a bot** → `docs/RECIPES.md`: a `FIGHTERS` row + an owner-chosen colour + widen the seven 2-entry arrays; run `.qa/pair-proof.mjs`.
- **Edit weapon art / polys / scale** → `.qa/inscribe.mjs` gate + `.qa/bake-rows.mjs` re-bake; Tier 1 proofs.
- **Edit docs** → after any `GAMES.md` or `docs/history/` edit run `docreflow` then `navgen` (rule 3); after any canonical landing run
  `gen-codemap`; refresh `STATE.md` if facts moved; run `node tools/verify.mjs`.
  Order: `docreflow → navgen → gen-codemap → gen-state → verify --quick`.
- **Check repo health** → `node tools/verify.mjs` (`--quick` skips the sim, `--battery` adds the full proof battery).
- **Prove a behaviour-identical edit** → `node .qa/fingerprint.mjs --compare` (8/8 vs `.qa/BASELINE`, exit 0).

## Workflow: orient, propose, change, prove, deliver

1. **Orient (every session).** `git fetch origin && git rev-parse --short origin/main` must equal
   `git log -1 --format='%h' -- docs/handoff/BATCH3-STATUS.md`. If they differ, something else landed: re-baseline from `STATE.md`
   and say what moved. Then `node tools/verify.mjs --quick` (expect VERIFY PASS) and
   `node .qa/strip-hash.mjs --base canonical-prediet-2c` (expect PASS and its three invariant hashes).
2. **Propose, then wait for the owner's "go"** (rule 1). Read-only checks need no go.
3. **Change.** Doc regeneration order is under "Edit docs". A canonical edit also carries a dated entry in `docs/GAMES.md` (the md5 slot is checked).
4. **Prove.** Before running any probe read `tools/manifest.json` (what each proof/tool asserts, whether the battery runs it,
   `ownerOnly: true` = never run it; rule 2). Comment-only canonical edit: `strip-hash` PASS plus a mojibake census.
   Behaviour-identical edit: fingerprints 8/8 (rule 4). Any canonical-touching patch: `node tools/verify.mjs --battery` once (~15 min).
   Quote only numbers you measured on the artifact you ship; never say a check passed unless you saw it.
5. **Deliver ONE artifact; the owner pushes.** Read `docs/handoff/RUNBOOK.md` §6 first. Two routes, per-agent capability, never aligned:
   file-capable agents ship one patch file as a downloadable file, proven on an independent fresh clone; agents with no file channel
   (Qwen is one) ship one md5-gated **Node** one-shot **as chat text** (Route B, not a deviation from §6.7); the owner saves it as
   `scratch/land.mjs` (gitignored) and runs it from the repo root — Node only, the owner has no Python.
   Gate = per-file md5s; the ledger entry lands in the same commit; **no execution means no delivery**.

## Standing rules (owner-enforced; this list is the canonical text; README and copilot-instructions only point here)

1. **Discuss before writing.** Proposals first; nothing lands without the owner's "go".
2. **`measure.mjs` NEVER runs without the owner's explicit go.** It refuses to start unless the owner passes `--owner-go`
   (or sets `ARENA_OWNER_GO=1`); an agent never passes it.
3. **After any GAMES.md or `docs/history/` edit: `docreflow` FIRST, then `navgen`.** Both idempotent, both cover the whole record set.
4. **Behaviour-identical edits prove fingerprints 8/8** vs `.qa/BASELINE`; the canonical md5 must not move unless sanctioned + recorded. 8/8 can be VACUOUS — establish coverage first.
5. **One canonical.** `previews/spinclash-preview.html` is the single source; do not split it, do not repoint tool defaults.
6. **Terminology:** a fighter has a SKILL, a weapon has a TRAIT. Always "fighter skill" / "weapon trait".
7. **No balancing during the skills pass.** No win-rate tables; the 484-cell re-run / resolver rework / spear fingerprint cell are deferred to the end.
8. **Weapon traits reset every round** (a law). Stacking is additive only — NO unique combos.
9. **Proof battery is tiered:** Tier 0 every landing; Tier 1 only if geometry moved; Tier 2 only on suspicion / end of pass.
10. **Tagged removals; pushes are the owner's; never force-push.** Recover with `git show <tag>:<path>`.

## Implemented vs planned

- **Implemented:** SpinClash canonical + the bare-Node harness (`.qa/`, `tools/`, `scripts/`, root `.mjs`). Runs today, no `package.json`.
- **Planned (no code):** the engine, studio, CLI, render pipeline (`SPEC.md`/`CONTRACT.md`/`BUILD.md` carry PLANNED banners). `npm run dev` etc. do NOT run yet.

## Where truth lives (one canonical source per fact)

- Mutable facts (md5, stamp, lines, baseline, inventory, doc costs) → `STATE.md` (generated by `tools/gen-state.mjs`).
- Current game laws, weapon-trait count, law-to-probe table → `docs/LAWS.md` (sole authority; wins on conflict). Design record, owner quotes, open queue → `docs/GAMES.md` §Current state.
- Landing recipes → `docs/RECIPES.md`. Workflow and loading order → this file. Platform rules → `docs/planned/SPEC.md`.
- Decisions, owner quotes, measured history → `docs/GAMES.md` (live), `docs/history/` (frozen eras; git history for older).
- AI-session process: `docs/handoff/HANDOFF.md` (router + freshness check), `docs/handoff/RUNBOOK.md` (rules, delivery routes),
  `docs/handoff/BATCH3-STATUS.md` (landing ledger, newest first); `docs/handoff/LEDGER.md` is frozen history. The repo outranks any
  chat attachment; lint-docs covers them; they never go in `docs/history/`.
- `tools/lint-docs.mjs` fails the build on drift (dead refs, stale md5, trait-count disagreement, retired rules stated as live, a broken law-to-probe table).
