# Arena Engine

> **AI agents:** start at [`AGENTS.md`](./AGENTS.md) and [`STATE.md`](./STATE.md). This README is intentionally only a router. Do not treat it as the project overview.

## Current facts
- Canonical: `previews/spinclash-preview.html`
- md5: `83867fb70ace5ea7fcdbd93e7aeda7e5`
- Lines: 5,034
- Build stamp: `links-r87`
- Fingerprint baseline: `.qa/BASELINE` → `fp-flailfix-r88.json`

## Where to go
- Current game laws: [`docs/LAWS.md`](./docs/LAWS.md)
- Landing recipes: [`docs/RECIPES.md`](./docs/RECIPES.md)
- Mutable/generated facts: [`STATE.md`](./STATE.md)
- Design history / provenance: grep [`docs/GAMES.md`](./docs/GAMES.md); never read it whole
- Platform/engine rules: [`docs/SPEC.md`](./docs/SPEC.md), only for engine/platform work

## Non-negotiables
- Propose before writing code.
- Do not run `measure.mjs` without the owner's explicit go.
- Do not split the canonical.
- After any `docs/GAMES.md` edit, run `node tools/doc/docreflow.mjs` then `node tools/doc/navgen.mjs`, then `node tools/gen-state.mjs`.
