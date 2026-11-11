# ARENA ENGINE — Build Order

Phases, not dates. **Advance only when the gate is genuinely green** — each phase is built on the one below it.

**Hard rule:** Phase 1 ends with a real MP4 playing on a phone. Architecture does not get to run ahead of that.

---

## Phase 0 — Foundations

- [ ] npm workspaces root: `packages/core`, `packages/render`, `packages/server`, `apps/studio`
- [ ] TypeScript strict + ESM, Vitest, ESLint (stricter override for `games/`), Prettier
- [ ] `.vscode/`: `tasks.json` (doctor / dev / build / test / generate / inspect), `launch.json`, `settings.json`, `extensions.json`
- [ ] `assets/fonts/` — Inter, JetBrains Mono (OFL), committed, loading via `GlobalFonts.registerFromPath` (no display face — the locked frame's voice is quiet print)
- [ ] `.gitignore` — `node_modules`, `output/`, `.arena-tmp/`
- [ ] `scripts/doctor.mjs` — Node ≥22, ffmpeg resolvable, canvas loads, fonts resolve, loopback bind, port free, disk space. Names the problem and the fix; never a stack trace.
- [ ] Root scripts: `doctor`, `dev`, `build`, `test`, `generate`, `inspect`

**Gate:** `npm install && npm run doctor` → all green on a clean clone with nothing installed but Node.

---

## Phase 1 — Prove the pipe ⚠️ *highest risk, do first*

Ignore architecture elegance. Get a video out.

- [ ] Seeded PRNG (sfc32) with `fork(label)`
- [ ] Fixed-timestep loop (120 Hz)
- [ ] **Probe A** — N players advancing to a finish line. Not content; a contract fixture.
- [ ] Timeline with sparse keyframes + events
- [ ] `@napi-rs/canvas` → raw RGBA → pipe to `ffmpeg-static` stdin. No temp image files.
- [ ] Correct MP4: 1080×1920, 60fps, H.264 High, CRF 18, `yuv420p`, BT.709 limited, `+faststart`
- [ ] **Determinism test:** render twice → identical SHA-256
- [ ] Serve the MP4 and play it in a bare Vite page — proof the browser shows the real file
- [ ] `npm run inspect --at <sec>` → one full-res PNG. **Build this immediately**; it's the primary tool for judging color and layout.
- [ ] `npm run inspect --sheet` → ~24 frames tiled
- [ ] Minimal output: `output/<render-id>/{video.mp4, render.json}`

**Gate:** an MP4 that looks correct **on a phone**, byte-identical across two renders, playable in the browser.

---

## Phase 2 — The contract

- [ ] `packages/core/src/contract/` — `GameModule`, `GameInstance`, `Surface`, `SimServices`, `RenderServices`, `GameEvent`, `Timeline`, `ResultSummary`, and the generic `Skill<TContext, TValue>` hook shape
- [ ] Registry: discovery of `games/*/index.ts`, validation, readable rejection errors surfaced in the UI
- [ ] Zod config schema → defaults, validation, UI metadata, CLI flags
- [ ] Services: `rng`, `config`, `clock`, `emit`, `say`, `sfx`
- [ ] `MatchupSchema` config helper → resolves to a list of player ids; display names connected by the game
- [ ] Core event vocabulary (seven kinds) and the platform's reaction to each
- [ ] Skills: games define their own local hook interface; the platform supplies only the generic hook shape and never learns a hook name (CONTRACT.md §Skills)
- [ ] Contract-compliance suite: one Vitest file looping over registered games, eight checks (CONTRACT.md)
- [ ] ESLint `no-restricted-imports` / `no-restricted-globals` for `games/` and `packages/core`

**Gate:** Probe A passes all eight checks, refactored onto the contract, with its output hash unchanged from Phase 1.

---

## Phase 3 — Design system + Probe B

- [ ] Tokens: the canonical token table for the locked theme PEBBLE (SPEC.md "The paper theme"; lift it from `spinclash-preview.html`'s `TH` object and `:root` tokens); type scale; semantic colors; player palette of ~24 colors — mid-lightness, high saturation, no pastels, no near-ink, lightness bands × hue families; grayscale + deuteranopia checked
- [ ] Pool validation at load — no two players share a color, every color is in the palette, ids unique
- [ ] `gfx`: `bar` `chip` `badge` `meter` `countdown` `leaderboard` `bracket` `swoosh` `flash` `vignette` `grid` `body` `zoom` `pan` — no particles/confetti/shake primitives (house style: flash and type only)
- [ ] `layout.arena` — one fixed square, centred in the frame at every aspect ratio, identical in every game; compliance asserts no action outside it
- [ ] Primitives enforce **pixel-grid snapping** and **2px minimum stroke** internally
- [ ] `type` enforces the scale and **28px minimum**; tabular numerals
- [ ] Renderer applies the **dither overlay** to dark backgrounds
- [ ] `layout` with safe boxes per target; primitives refuse to draw outside them
- [ ] `anim`: one house easing family, `tween`, `stagger`, `spring`, `beat()` — games may not define their own curves
- [ ] Intro, outro card and scoreboard as **platform-injected** elements with their own audio cues (scoreboard = the locked Columns legend table from `spinclash-preview.html`; phase announcements = flat type-on-floor cards in the locked theme)
- [ ] `packages/render/targets.ts` — `vertical`, `vertical-30`, `horizontal`
- [ ] **Probe B** — discrete rounds, phases, elimination, bracket, no continuous motion
- [ ] Fix whatever Probe B breaks in the contract. **This is the point of the phase.**
- [ ] Dev harness: scrub view + real-time playback + A/B, running the same renderer code in a browser canvas. Excluded from the production build.
- [ ] **Channel test** on Probes A and B

**Gate:** both probes pass compliance with **zero** `gameId` special-cases in platform code, both render correctly at two targets, and side by side they look like the same channel.

---

## Phase 4 — Audio + render engine

- [ ] Procedural SFX synth → WAV in Node (whoosh, tick, thud, ding, impact, riser, crowd swell)
- [ ] Timeline audio cues → stereo mix → loudnorm I=−14 TP=−1.5 → mux
- [ ] Encode path with per-target bitrate floor, AAC 192k/48k
- [ ] **`ffprobe` verification on every render** — exact frame count, CFR, no duplicates/drops. Failure fails the render.
- [ ] Multi-target from one timeline: no re-simulation, identical outcomes
- [ ] Single render job: progress, frame count, ETA, cancel, structured logs
- [ ] `render.json` with the full `ResultSummary`

**Gate:** one command produces a valid MP4 with in-sync audio at two targets from a single simulation, outcome identical in both.

---

## Phase 5 — Studio

- [ ] Fastify host: loopback bind assertion (aborts otherwise), no CORS, path-traversal-safe static serving, no auth
- [ ] REST: games, schema, simulate, render job, output files
- [ ] **Games** view — cards; broken module shows an error card, never crashes
- [ ] **Setup** view — Zod-generated options panel; game switcher; outcome visible by default; per-game stats from `output/*/render.json`; one **Generate** button
- [ ] Simulate-on-change, debounced ~120ms, cancelling in-flight sims
- [ ] **Render** view — single job slot, progress, ETA, cancel; survives the tab being closed
- [ ] **Watch & download** view — inline playback, shape ticks, Download / Open folder / Discard
- [ ] Keyboard shortcuts

**Gate:** `npm run dev` → choose → configure → generate → watch → download or discard, with no terminal interaction. Flicking between games and options stays instant and leaves no stray work.

---

## Phase 6 — CLI parity + hardening

- [ ] `npm run generate` at full parity with the studio
- [ ] Golden-frame tests in `npm test`
- [ ] `pre-push` hook: lint + tests + determinism + compliance
- [ ] Error quality pass — every failure explains itself and suggests a fix
- [ ] `doctor` verifies loopback-only bind and no egress
- [ ] Source audit: no `fetch`/`http`/`net`/`dns` outside the loopback server

**Gate:** the Definition of Done below passes from a clean clone, **and** the output has been watched on a phone.

---

## Phase 7 — v1 freeze

- [ ] `games/_template/` scaffold with a commented example
- [ ] README, `.vscode` tasks for every common operation
- [ ] Tag `v1.0.0`. **Stop building the platform.**

Platform work resumes only when a real game needs something it doesn't have.

---

## Design previews — every game starts here

Before any engine code exists, a game is designed as a **dependency-free HTML preview**: one file, no build step, no imports, openable directly by the owner. Naming convention: **`<game-name>-preview.html`**, kebab-case game name, living in this folder.

Why this lane exists: the owner playtests personally and reports symptoms, and rules get judged by feel plus headless measurement before a single line of engine code is written. The preview is a design toy, not a port source: when a game moves into the engine (Phase 8), it is rebuilt against the contract from `games/_template/` — the preview's *rules and measured facts* transfer, its code does not.

**Sequencing.** This lane runs parallel to the platform phases, not inside them — a preview needs nothing from the engine, so game design starts whenever the owner says go. One hard dependency exists: Phase 3's token table lifts the theme the first game's preview locks, so the first preview ideally lands before Phase 3 — if it hasn't, Phase 3 builds the tokens from SPEC.md's starting direction and re-derives them once the preview decides.

Conventions:

- **Pure sim at the top of the `<script>`** (`newGame` / `tick` / count-style helpers) with no DOM until `draw()`, so a harness can extract it, stub the DOM and loop `tick()` headlessly. The harness (`measure.mjs`) takes the preview file as its first argument; one is written for the first preview — keep one harness per preview or reuse it.
- **Metrics after every rule change** — the standing list in GAMES.md's testing recipe, plus whatever the game's own rules need (including a violation scan for every invariant the mechanics imply).
- **Design toggles are welcome during iteration, stripped at lock.** Skins, banners, scoreboard variants — as many as needed to decide; the moment a design is locked the toggle and its losers leave the file. A preview ships with one look.
- **A preview graduates when the owner says the rules feel right.** Its ruleset is written into GAMES.md before engine work begins; until then the preview and the owner's playtests are the only sources of truth.

---

## Phase 8 — The first real game

This is the point of the whole exercise. Not scheduled.

- [ ] Design one game: mechanic, pacing, what makes it worth watching — in a dependency-free preview first (see **Design previews**), graduating per that section's rules
- [ ] Author the first pool — the players, their names, permanent colors, marks
- [ ] Build it from `games/_template/`
- [ ] Tune with the dev harness — single frames for color and layout, scrub view for motion and physics
- [ ] Pass the per-game gate below in full
- [ ] Render, watch **on a phone**, then publish
- [ ] Let real retention data decide what to change; then build the second game

Retention is the revenue metric — ad money follows watch time — so audience data outranks any opinion formed while building, including the ones in these documents.

---

## Definition of done (platform v1)

On a clean clone with nothing installed but Node and VSCode:

```
npm install
npm run doctor                                 → all green
npm run generate -- --game _probe --seed 1     → output/<render-id>/video.vertical.mp4
npm run dev                                    → choose, configure, generate, watch, download
```

1. Running generate twice produces **byte-identical** video
2. Re-encoding as `--target horizontal` gives 16:9 with the **same outcome**, no re-simulation
3. The file downloaded from the browser is the file in `output/`

---

## Platform checks

**Setup**
- [ ] Clean clone + `npm install` + `doctor` → green, with nothing but Node installed
- [ ] No system ffmpeg, fonts or build tools required
- [ ] Runs on the owner's machine, not just the dev sandbox

**Localhost**
- [ ] Binds `127.0.0.1`; **aborts** if the resolved address isn't loopback; `HOST=0.0.0.0` does not expose it
- [ ] No CORS; non-loopback `Origin` rejected
- [ ] Static serving restricted to the studio build and `output/`; path traversal rejected
- [ ] Source audit: no `fetch`/`http`/`https`/`net`/`dns` outside the loopback server; no telemetry
- [ ] Zero outbound connections while running, verified with a network monitor

**Determinism**
- [ ] Same game + config + seed → identical SHA-256, twice, in CI
- [ ] No `Math.random`/`Date.now`/`performance.now`/env/fs in `core` or `games/` — enforced by lint
- [ ] RNG streams forked and labelled
- [ ] An old seed against the same game version still reproduces the original output

**Contract**
- [ ] All eight compliance checks pass for every game in `games/`
- [ ] **Zero `gameId` special-cases in platform code** — grep-clean
- [ ] Probes A and B both fit without contract changes
- [ ] A malformed module produces a readable rejection, not a crash
- [ ] `games/_template/` scaffolds a passing game in under 15 minutes

**Output**
- [ ] Plays correctly on a phone, in VLC, and in a browser — **phone check done by a human, every time**
- [ ] `ffprobe`: exact frame count, CFR, no duplicates or drops
- [ ] 60fps on `vertical` and `horizontal`
- [ ] `yuv420p`, BT.709 limited, `+faststart`, bitrate floor met
- [ ] No A/V drift over a 5-minute render; every impact within ~40ms of its visual
- [ ] −14 LUFS, true peak ≤ −1.5 dB, no clipping
- [ ] No shimmer (pixel-grid snapping verified on sampled frames)
- [ ] No 1px strokes; minimum text 28px at 1080-wide
- [ ] No banding in dark areas — dither overlay present
- [ ] No pure `#000000` / `#FFFFFF` in large areas
- [ ] Safe zones clear on every declared target, verified by sampled-frame pixel check
- [ ] Fonts render identically on a machine that doesn't have them installed
- [ ] Each render emits one MP4 per requested target plus `render.json` — **and nothing else**
- [ ] All targets encode from **one** simulation with identical outcomes
- [ ] **Channel test:** one frame per game, tiled — they look like one channel

**Performance**
- [ ] 60s of 1080×1920@60 encodes in under 3 minutes
- [ ] Simulation of a 60s match completes in under 2 seconds
- [ ] One render at a time; a second request queues politely rather than competing for CPU
- [ ] Options panel updates within ~200ms of any change or seed roll

**Robustness**
- [ ] Killing a render mid-job leaves no corrupt or partial files; the next job starts clean
- [ ] Disk-full and ffmpeg-failure produce clear errors, not silence
- [ ] 10-minute videos don't leak memory — the frame loop is forward-only
- [ ] Closing the browser tab mid-render does not kill the job

**DX**
- [ ] `npm run dev` brings up server + studio in one command
- [ ] Every capability reachable from the CLI
- [ ] `npm test` under 60 seconds
- [ ] README gets a newcomer to a rendered video in under 10 minutes

---

## Per-game checks

A game does not ship until every box is checked.

**The three tests — do these first, they kill most games**
- [ ] **Mute test.** Audio off, no narration. Can a stranger explain who's competing, what they're trying to do, who's winning, and how it ended?
- [ ] **Freeze test.** Pause on 10 random frames. In every one, is it immediately obvious who's ahead? No reliance on motion to understand state.
- [ ] **Second-watch test.** Watch twice. Does the second viewing reveal something? If it's exhausted on first watch, it won't hold a viewer.

**Retention**
- [ ] **Hook ≤1.5s** — stakes visible immediately, no long intro
- [ ] **Something happens every ~3s**
- [ ] **≥1 lead change or near-miss per 10 seconds** — visible in the timeline's event list, not assumed
- [ ] **Escalation** — the final third is visibly higher-stakes than the first
- [ ] **Discrete payoff** — a clear win/eliminate/reveal moment, punctuated with a synced 3-beat (anticipation → strike → settle)
- [ ] **Ending** — loops seamlessly or ends on a tension beat; no dead air, no fade longer than 300ms

**Craft**
- [ ] Smallest text ≥28px; names never truncate mid-word; numerics in tabular figures
- [ ] Safe zones verified against an actual platform UI overlay, not guessed
- [ ] Player colors distinguishable in grayscale and under deuteranopia simulation
- [ ] One easing family throughout; staggered entrances; nothing linear that should feel alive
- [ ] Every impact within ~40ms of its visual
- [ ] Uses the shared intro, scoreboard, caption bars and outro — identifiable from a single screenshot
- [ ] Weapon and prop art follows GAMES.md "Weapon art" — the convention **CLOSED 2026-10-27** (landed at roster-r12 2026-10-25; the prescriptive lock lives in GAMES.md, "Weapon art — the closed convention"); new art arrives through the artist-kit route and its intake audit — *the kit tooling was purged 2026-10-28 at the pre-balance checkpoint and is retired verbatim (recover with `git show docs-precleanup:docs/CHRONICLE-archive.md`), so the route is prescriptive-only until the owed kit-route rebuild (GAMES.md hygiene pass #2)*; `ingest.mjs` stands dormant/superseded (close item 2a)

**Engineering**
- [ ] Passes all eight contract-compliance checks
- [ ] Deterministic
- [ ] Config fully exposed through the schema — no magic constants that should be knobs
- [ ] Renders correctly and legibly at every target in `meta.targets`, with no per-target special-casing
- [ ] `meta.version` bumped on any output-affecting change; golden frame re-committed

**Is the mechanic actually interesting?**

Simulate 20 seeds and read the results. If margins are consistently large, lead changes are rare and comebacks never happen, **that's a mechanics problem, not a content problem.** No amount of visual polish rescues a game whose outcome is foregone. Fix the mechanic or drop the game.

---

## Backlog (not v1)

Content strategy · publishing tooling · interactive play-to-record · in-browser sim preview · 3D/WebGL · LLM assistance · UI-based game authoring · plugins · desktop packaging · i18n · saved-config presets
