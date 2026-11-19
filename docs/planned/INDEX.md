# PLANNED — the platform island's entry point

Contains: which of the three platform documents answers which question, and the one thing to know before entering them.
Read when: only when the owner asks for ENGINE work. Token cost: see STATE.md §Documentation cost.

> **STATUS: PLANNED — not implemented.** No engine code exists yet. `docs/planned/BUILD.md` Phase 0 creates the
> engine directories; until it does, the live repository is the SpinClash harness (the canonical
> `previews/spinclash-preview.html` plus the bare-Node tools). Everything below is a **target**, not a description
> of what runs today.

## Which file

| If the question is… | Read | Do not read |
|---|---|---|
| What is the platform for, and what are its non-negotiable rules? | `docs/planned/SPEC.md` §Purpose, §Rules | the rest of SPEC — it is a platform spec, not a task list |
| What must a game implement so the platform can run it? | `docs/planned/CONTRACT.md` | SPEC — the contract stands alone |
| What gets built next, in what order, with what gate? | `docs/planned/BUILD.md` | — |
| How does a game look and feel? | `docs/GAMES.md` §Weapon art, `docs/planned/SPEC.md` §House style | — |

## Three rules before you start

1. **SPEC §Purpose and §Rules override everything else**, including any tradeoff discussed later.
2. **Everything in this directory is PLANNED.** If a document here describes a file, a directory or a command,
   it describes one that does not exist yet. `tools/lint-docs.mjs` checks that each of the three carries a
   `STATUS: PLANNED` banner, and that no document outside this directory describes a planned path as existing.
3. **The engine directories do not exist.** `packages/core`, `packages/render`, `packages/server`, `apps/studio`,
   `games/_probe`, `games/_template`, `assets/fonts` and `.vscode` are created by BUILD Phase 0 — there are no
   `.gitkeep` placeholders committed, so an agent that finds one has found a stray file.

## What is NOT here

- **The live game.** `previews/spinclash-preview.html` is the only shipped code; its laws are in `docs/LAWS.md`.
- **The live tooling.** `.qa/`, `tools/`, `scripts/` and the root `.mjs` tools — see `STATE.md` §Tooling inventory.
- **The agent's own rules.** `AGENTS.md` — it outranks every document in this directory for how to work here.
