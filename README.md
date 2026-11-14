# Arena Engine

> **AI agents:** start at [`AGENTS.md`](./AGENTS.md) and [`STATE.md`](./STATE.md). This README is intentionally only a router. Do not treat it as the project overview.

## Where to go
- Mutable facts (canonical md5, lines, build stamp, baseline, tool inventory, doc token costs): [`STATE.md`](./STATE.md), generated. The fingerprint baseline pointer file is `.qa/BASELINE`.
- Canonical game (the only live code): `previews/spinclash-preview.html`
- Current game laws: [`docs/LAWS.md`](./docs/LAWS.md)
- Landing recipes: [`docs/RECIPES.md`](./docs/RECIPES.md)
- Design history / provenance: grep [`docs/GAMES.md`](./docs/GAMES.md) (live) and `docs/history/` (frozen eras); never read whole
- Session handoff (process authority, repo-hosted; outranks any chat note): [`docs/handoff/HANDOFF.md`](./docs/handoff/HANDOFF.md)
- Platform/engine rules (PLANNED engine): [`docs/SPEC.md`](./docs/SPEC.md), only for engine/platform work

## Non-negotiables
The standing rules and the whole workflow (orient, propose, change, prove, deliver) live in [`AGENTS.md`](./AGENTS.md), the one home for them. The three that matter before you touch anything: propose before writing code; never run `measure.mjs` without the owner's explicit go; do not split the canonical.
