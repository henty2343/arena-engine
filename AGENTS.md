# AGENTS.md — start here

Contains: the entry point for AI agents — what to load per task, the standing rules, and where truth lives.
Read when: every session, first, alongside STATE.md. Token cost: see STATE.md §Documentation cost.
Canonical for: agent workflow and loading order. Mutable facts live in STATE.md (generated); design state in GAMES.md.

## What this repo is

A localhost-only Node tool that renders seeded game simulations into publishable MP4s. **The engine is PLANNED, not built** (`docs/planned/BUILD.md` Phases 0–8; `packages/`, `apps/`, `games/` are placeholders). The **only live code** is game #1, SPINCLASH: a single-file browser sim, `previews/spinclash-preview.html` (the ONE canonical), plus a dependency-free bare-Node proof harness. The video file is the product; everything else is scaffolding (see `docs/planned/SPEC.md` §Purpose before any tradeoff).

## Load by task (progressive disclosure — do NOT read everything up front)

| Tier | Files | When |
|---|---|---|
| Always | `AGENTS.md` + `STATE.md` | every session |
| Before opening the canonical | `docs/CODEMAP.md` (generated region + symbol map) | never read the canonical whole — enter at one symbol |
| Before any sim/doc edit | `docs/LAWS.md` (current laws quick ref) | the standing game laws |
| Add a weapon trait / bot | `docs/RECIPES.md` + the canonical `TRAIT / SKILL REGISTRY` | the cheap-class pattern |
| Engine work | `docs/planned/SPEC.md` · `docs/planned/CONTRACT.md` · `docs/planned/BUILD.md` | only when building the platform |
| History / a past decision | `docs/GAMES.md` (live) + `docs/history/` (frozen eras) | grep by `#NNN`, `^### <n>` or symbol — NEVER read whole |

`docs/GAMES.md` is the live record; older eras were moved verbatim into `docs/history/`. **Never load any of them whole** — costs are in `STATE.md`. Grep for the entry number (`grep -n '^### 721' docs/history/`), a symbol, or a heading, and read only that region. The nav block in `docs/GAMES.md` indexes every file by key + line. `STATE.md` carries the current md5/stamp/line-count/baseline so you never hunt for them.

## Task → file map

- **Add a weapon trait / fighter skill** → `docs/RECIPES.md`; pattern = a row field → ONE consumer site → one Tier-0 assertion; update the canonical REGISTRY. Cheap (number at an existing site) vs expensive (moves geometry → re-bake). Expensive = stop and ask first. The laws it must respect: `docs/LAWS.md`.
- **Add a bot** → `docs/RECIPES.md`; a `FIGHTERS` row + an owner-chosen colour + widen the seven 2-entry arrays; run `.qa/pair-proof.mjs`.
- **Edit weapon art / polys / scale** → `.qa/inscribe.mjs` gate + `.qa/bake-rows.mjs` re-bake; Tier 1 proofs.
- **Edit docs** → after any `GAMES.md` or `docs/history/` edit run `docreflow` then `navgen` (rule 3; both cover the whole record set); after any canonical landing run `gen-codemap`; refresh `STATE.md` if facts moved; run `node tools/verify.mjs`. Order: `docreflow → navgen → gen-codemap → gen-state → verify --quick`.
- **Check repo health** → `node tools/verify.mjs` (judges + JSON verdict; `--quick` skips the sim, `--battery` adds the full proof battery).
- **Prove a behaviour-identical edit** → `node .qa/fingerprint.mjs --compare` (8/8 vs `.qa/BASELINE`, exit 0).

## Workflow: orient, propose, change, prove, deliver (the one home for it)

1. **Orient (every session).** `git fetch origin && git rev-parse --short origin/main` must equal `git log -1 --format='%h' -- docs/handoff/HANDOFF.md` (the handoff is updated in the same commit as every landing). If they differ, something else landed: re-baseline from `STATE.md` and say what moved. Then `node tools/verify.mjs --quick` (expect VERIFY PASS, 7 checks: the manifest row plus the six quick checks) and `node .qa/strip-hash.mjs --base canonical-prediet-2c` (expect PASS and its three invariant hashes).
2. **Propose, then wait for the owner's "go"** (rule 1). Read-only checks need no go.
3. **Change.** Doc regeneration order is under "Edit docs" above. A canonical edit also carries a dated entry in `docs/GAMES.md` (the md5 slot is checked).
4. **Prove.** Before running any probe read `tools/manifest.json`, the registry of every proof and tool: what each asserts, whether the battery runs it, whether an agent may run it (`ownerOnly: true` means never; rule 2). Comment-only canonical edit: `strip-hash` PASS plus a mojibake census. Behaviour-identical edit: fingerprints 8/8 (rule 4). Any canonical-touching patch: `node tools/verify.mjs --battery` once (~15 min). Quote only numbers you measured on the artifact you ship, and never say a check passed unless you saw it.
5. **Deliver ONE artifact; the owner pushes.** Two routes, in `docs/handoff/HANDOFF.md` §6: **file-capable agents** ship one patch file as a downloadable file, proven on an independent fresh clone; **agents with no file channel (Qwen is one)** ship one md5-gated **Node** one-shot **as chat text - that IS Route B, not a deviation from §6.7**; the owner saves it as `scratch/land.mjs` (gitignored) and runs it from the repo root — Node only, the owner has no Python. Either way the gate is the **per-file md5s**, both handoff files update in the same commit, and **no execution means no delivery**. Read §6 before the first delivery of a session. The two routes are per-agent capability, deliberately different; never 'align' Route B to Route A.

## Standing rules (owner-enforced — this list is the canonical text; README and copilot-instructions only point here)

1. **Discuss before writing.** Proposals first; nothing lands without the owner's "go".
2. **`measure.mjs` NEVER runs without the owner's explicit go.** Long runs are his machine's job. It refuses to start unless the owner passes `--owner-go` (or sets `ARENA_OWNER_GO=1`); an agent never passes it.
3. **After any GAMES.md or `docs/history/` edit: `docreflow` FIRST, then `navgen`.** Both idempotent, both cover the whole record set.
4. **Behaviour-identical edits prove fingerprints 8/8** vs `.qa/BASELINE`; the canonical md5 must not move unless sanctioned + recorded. 8/8 can be VACUOUS — establish coverage first.
5. **One canonical.** `previews/spinclash-preview.html` is the single source; do not split it, do not repoint tool defaults.
6. **Terminology:** a fighter has a SKILL, a weapon has a TRAIT. Always "fighter skill" / "weapon trait".
7. **No balancing during the skills pass.** No win-rate tables; the 484-cell re-run / resolver rework / spear fingerprint cell are deferred to the end.
8. **Weapon traits reset every round** (a law). Stacking is additive only — NO unique combos.
9. **Proof battery is tiered:** Tier 0 every landing; Tier 1 only if geometry moved; Tier 2 only on suspicion / end of pass.
10. **Tagged removals; pushes are the owner's; never force-push.** Recover with `git show <tag>:<path>`.

## Implemented vs planned (never confuse them)

- **Implemented:** SpinClash canonical + the bare-Node harness (`.qa/`, `tools/`, `scripts/`, root `.mjs`). Runs today, no `package.json`.
- **Planned (no code):** the engine, studio, CLI, render pipeline. `SPEC.md`/`CONTRACT.md`/`BUILD.md` carry PLANNED banners. Commands like `npm run dev` do NOT run yet.

## Where truth lives (one canonical source per fact)

- Mutable facts (md5, stamp, lines, baseline, inventory, doc costs) → `STATE.md` (generated by `tools/gen-state.mjs`).
- Current game laws, the weapon-trait count, and which probe checks each law → `docs/LAWS.md` (sole authority; on conflict it wins). The fuller design record, owner quotes and open queue → `docs/GAMES.md` §Current state.
- Landing recipes (add trait / skill / bot, stamp discipline) → `docs/RECIPES.md`.
- Agent workflow (orient, propose, change, prove, deliver) and loading order → this file. Platform rules → `docs/planned/SPEC.md`.
- Decisions, owner quotes, measured history → `docs/GAMES.md` (live) and `docs/history/` (frozen eras; git history for older).
- Process authority for AI sessions (handoff, ledgers, delivery rules) → `docs/handoff/HANDOFF.md` and `docs/handoff/BATCH3-STATUS.md` (repo-hosted; the repo outranks any chat attachment; they sit outside every lint glob and never go in `docs/history/`).
- `tools/lint-docs.mjs` fails the build if these drift (dead refs, stale md5, trait-count disagreement, retired rules stated as live, a broken law-to-probe table).
