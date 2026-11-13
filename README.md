# Arena Engine

> **AI agents:** start at [`AGENTS.md`](./AGENTS.md) and [`STATE.md`](./STATE.md). This README is intentionally only a router. Do not treat it as the project overview.

## Where to go
- Mutable facts (canonical md5, lines, build stamp, baseline, tool inventory, doc token costs): [`STATE.md`](./STATE.md), generated. The fingerprint baseline pointer file is `.qa/BASELINE`.
- Canonical game (the only live code): `previews/spinclash-preview.html`
- Current game laws: [`docs/LAWS.md`](./docs/LAWS.md)
- Landing recipes: [`docs/RECIPES.md`](./docs/RECIPES.md)
- Design history / provenance: grep [`docs/GAMES.md`](./docs/GAMES.md); never read it whole
- Platform/engine rules (PLANNED engine): [`docs/SPEC.md`](./docs/SPEC.md), only for engine/platform work

## Non-negotiables
- Propose before writing code.
- Do not run `measure.mjs` without the owner's explicit go.
- Do not split the canonical.
- After any `docs/GAMES.md` edit, run `node tools/doc/docreflow.mjs` then `node tools/doc/navgen.mjs`, then `node tools/gen-state.mjs`.
