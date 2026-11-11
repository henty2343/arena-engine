# ARENA ENGINE — Spec

A localhost-only Node.js tool: pick a game → set options → generate → watch it → download the MP4.

Read this with `CONTRACT.md` (the game interface) and `BUILD.md` (what to build next).

---

## Purpose — read this before anything else

This tool exists to produce one thing: **a video that gets published to ad-supported platforms** — YouTube, TikTok, Instagram Reels — and earns money from the ads placed on it.

Ad revenue follows watch time. A video earns when people watch it, keep watching it, and come back for more. That single fact explains almost every rule in this document.

**The video file is the product.** Everything else here — the contract, the server, the studio, the CLI — is scaffolding whose only job is to produce that file. No feature justifies itself by being elegant, general-purpose, or convenient. It justifies itself by making the video better, or by making a video faster to produce without making it worse.

Five consequences to hold onto when making tradeoffs:

1. **Output quality outranks everything.** A technically flawed video — stuttery, banded, illegible, quiet, wrong colorspace — costs revenue directly and cannot be fixed after the fact. Nothing in the codebase is more important than the file that comes out.
2. **Platform compliance is revenue, not pedantry.** Resolution, framerate, codec, loudness, duration and safe zones decide whether a video is eligible and how it's treated. These are hard requirements, not preferences.
3. **Consistent house style is a growth mechanism.** Recognisable videos convert a one-off viewer into a subscriber, and subscribers are what turn watch time into compounding watch time. Ten unrelated-looking games is ten times worse than one channel.
4. **"Works on my machine" is failure.** The bar is: published, watched by a stranger on a phone, monetized. A video is not done when it renders — it's done when it would survive being uploaded.
5. **The tool never touches publishing, accounts or revenue.** It makes the file; a human publishes it. Don't build upload automation, analytics, scheduling or account features — they are permanently out of scope, both because platforms prohibit them and because they distract from the only thing that matters.

---

## Rules that override everything else

1. **Localhost only.** Bind `127.0.0.1`; abort at startup if the resolved bind address isn't loopback. No CORS. Static serving restricted to `apps/studio/dist` and `output/`. No auth, no telemetry, no runtime network calls.
2. **Zero system dependencies.** `npm install` is the entire setup. ffmpeg from `ffmpeg-static`, canvas from `@napi-rs/canvas`, fonts committed to `assets/fonts/`.
3. **Deterministic.** Same game + config + seed = byte-identical MP4. No `Math.random`, `Date.now`, `performance.now`, env or fs reads in `packages/core` or `games/`. Seeded PRNG (sfc32) with `fork(label)` per subsystem. Tested by SHA-256.
4. **Sim and render are separate layers.** Sim never draws; renderer never decides outcomes. `render()` receives a snapshot, not the game instance, so it _cannot_ advance state.
5. **`packages/core` is pure TypeScript.** No `node:`, no DOM, no I/O. Enforced by ESLint.
6. **The platform knows nothing about any game.** Zero `gameId` conditionals in platform code, ever. All mechanics and visuals live in `games/<id>/`.
7. **Render offline, frame by frame.** Never capture in real time. Frame N is drawn, handed to ffmpeg, then N+1 begins. A slow frame delays the render; it can never drop out of the video.
8. **One render → any shape.** Aspect ratio is chosen afterwards. 9:16 and 16:9 are two encodes of one timeline, never two simulations.
9. **Design system = canvas drawing functions**, injected as services. Not CSS. Anything styled in CSS cannot appear in a video frame.
10. **One render job at a time.** No queue, no parallelism, no batch mode.
11. **CLI parity.** Everything the studio does, `npm run generate` does headless.

---

## Stack

|          |                                                                                      |
| -------- | ------------------------------------------------------------------------------------ |
| Runtime  | Node 22, ESM, TypeScript 5 `strict`                                                  |
| Monorepo | npm workspaces: `packages/core`, `packages/render`, `packages/server`, `apps/studio` |
| Raster   | `@napi-rs/canvas` (Skia, prebuilt, deterministic)                                    |
| Encode   | `ffmpeg-static` + `child_process` spawn. Fallback: `ARENA_FFMPEG` env → PATH         |
| Schema   | Zod — one schema drives validation, defaults, UI panel and CLI flags                 |
| Server   | Fastify + `@fastify/static`                                                          |
| UI       | Vite + React 18 + Zustand + plain CSS custom properties                              |
| Dev/test | tsx, Vitest, concurrently, ESLint, Prettier                                          |

**Never introduce:** Playwright/Puppeteer, Remotion, Electron/Tauri, ffmpeg.wasm, SQLite, Tailwind, WebSockets, nanoid, a job queue library, or any auth.

---

## Pipeline

```
game + config + seed
   → SIMULATE (pure, 120Hz fixed timestep, milliseconds, no pixels)
   → TIMELINE (keyframes every 0.5s, events, audio cues, ResultSummary)
   → RENDER (forward-only frame loop, interpolate ticks → target fps, @napi-rs/canvas)
   → ENCODE (raw RGBA piped to ffmpeg stdin; audio synthesised + mixed + muxed)
   → VERIFY (ffprobe) → output/<render-id>/video.<target>.mp4 + render.json
```

The simulation always completes before rendering starts, because the renderer needs the future: the outro card shows final standings, audio cues must land on exact frames. It runs ~1000× faster than playback, so this is invisible.

**Only one timeline is held in memory** — the current game/config/seed. Changing anything discards it and re-simulates. Option changes are debounced ~120ms and cancel any in-flight sim. Nothing accumulates; nothing writes to disk until Generate.

---

## Output

| Target        | Resolution | fps    |
| ------------- | ---------- | ------ |
| `vertical`    | 1080×1920  | **60** |
| `vertical-30` | 1080×1920  | 30     |
| `horizontal`  | 1920×1080  | **60** |

Defined in `packages/render/targets.ts`. Games declare which they support; nothing hardcodes a dimension.

**Encode:** H.264 High, CRF 18 with a per-target bitrate floor, `yuv420p`, BT.709 limited range, `-movflags +faststart`, AAC 192k/48kHz stereo, loudnorm I=−14 TP=−1.5. Constant framerate.

**Verify every render with `ffprobe`:** exact frame count, CFR, no duplicate/dropped frames. A failed check fails the render — never write a bad file.

**Output is the MP4 and nothing else.** No thumbnail, no caption file, no title/description text. `render.json` sits beside it (game, version, seed, config, duration, full `ResultSummary`) as a reproducibility receipt and the stats source. Not a deliverable.

---

## Video quality — non-negotiable

Smoothness:

- Offline frame-stepped render (rule 7). 60fps default. CFR verified.
- 120Hz sim interpolated to output rate.
- Optional motion blur per game: 4 temporal sub-samples averaged. Off by default. Never faked.

Cleanliness — **built into the primitives so an author cannot opt out:**

- All positions snap to the pixel grid. Fractional positions shimmer in motion.
- Minimum stroke 2px at 1080-wide. No 1px lines.
- Minimum text 28px at 1080-wide. Heavy weights only. Numerics in tabular figures.
- Subtle dither overlay (~1.5%, fixed per render) on large smooth gradients — prevents banding after platform recompression. _(Deferral noted 2026-10-19: the locked PEBBLE frame is a LIGHT ground with no dark areas — at Phase 3, re-scope this to whatever gradients the theme actually ships, or drop it. Until then it stays a requirement on paper only.)_
- No pure `#000000` or `#FFFFFF` in large areas. (PEBBLE's values: page mid-stop `#bab09b`, arena floor `#e7dfca`, card cream `#ede7d6`, ink `#2e2b22`.)
- Bold simple shapes over fine detail; high contrast. Fine detail dies in platform recompression.

Safe zones — enforced by `layout`, primitives refuse to draw outside:

- Vertical 1080×1920: bottom 220px, right 140px, top 160px clear.
- Horizontal 1920×1080: 5% margins.

Audio:

- Procedurally synthesised to WAV in Node, mixed from timeline cues. No copyrighted music, ever.
- −14 LUFS, true peak ≤ −1.5 dB. Every impact within ~40ms of its visual.

**Final check, always human:** watch the finished MP4 **on a phone**. Desktop browsers hide judder, shimmer, banding and illegible text.

---

## What every game shares

Decided up front, because these are the things that make ten games read as one channel — and each one is cheap to fix now and expensive to retrofit.

**Every game is a competition with a winner.** The concept is always _X versus Y_, from a head-to-head up to a multi-player free-for-all. There are no winner-less games, no pure spectacle, no ambient visuals. `ResultSummary.winnerId` and `standings` are therefore required, and the outcome panel, outro card and stats always have something to show.

**One arena, centred.** The play area is a single fixed square, the same size in every game, **centred in the frame at every aspect ratio**. 9:16 leaves more space above and below; 16:9 leaves more at the sides. The surrounding overlay — scoreboard, title, caption bars, intro, outro card — sits in that margin at fixed positions. The fixed square is the _bounds_; the playable boundary inside it is game-defined — SPINCLASH plays in a circle inscribed in the bounds. Either way, all action stays inside the bounds and compliance verifies that.

This is better than per-target layouts: one set of arena coordinates to design against, the same framing in every video, and switching aspect ratio is a pure re-encode with nothing to re-lay-out. A viewer recognises the frame before they recognise the game.

**A shared event vocabulary.** Seven core kinds the platform reacts to. Games use only the ones that apply — most will use two or three — and may add their own kinds, which the platform ignores.

**One matchup control.** A standard config helper resolves which players from the pool are competing. Every game gets the same picker, looking and behaving identically, for free.

**One default body.** `gfx.body(player, opts)` draws a player from its color, mark and name, so a game that doesn't need a bespoke look gets a consistent one for free. Games override it only where their subject genuinely demands.

**Permanent, unique colors.** Every player has a color that is theirs in every game — Speedy is green everywhere, which is what makes them recognisable. **No two players in a pool share a color**; that's a constraint on the data, checked at load, not logic resolved at runtime. All colors are distinguishable in grayscale and under deuteranopia simulation.

**Players come from data files.** A _pool_ is a JSON file of players. A game declares which pool it draws from — so character games can share a recurring cast while other games define their own, and the platform never learns anyone's name. Adding a player is a data change, never code. Full model in `CONTRACT.md`.

**One skill per player per game.** Identity (name, color, mark) is global and lives in the pool. Skills are per-game and live in the game. So one player has as many skills as there are games they appear in, and each is that game's interpretation of the same idea about them.

### Naming rules

**Name a quality, not a mechanic.** A quality translates across games; a mechanic locks the player into one.

- "Heavy" is a quality — it means mass in a shoving game, area in a painting game, resistance in a timing game
- "Painter" is a mechanic — it means nothing anywhere else

**The name should let the audience predict the skill before they see it.** That's legibility for free, and legibility is the hardest thing to get in a muted video watched on a phone. "Heavy" winning a shoving match needs no explanation.

Practical constraints: names render on a scoreboard at 28px, so one or two syllables; visually distinct from each other with no near-homographs; and nothing that collides with an existing franchise.

> The roster itself — names, colors, marks, and how many — is not designed yet. Deferred to Phase 8.

### Shared vocabulary — the same words in every game

Every game on the channel uses these words with the same meaning, in docs, UI and harness output. They are platform property; no game may rename or overload them:

| Word                                                                                | Means                                                                                   |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Player**                                                                          | One participant in a match (name, color, scoreboard row).                               |
| **Body**                                                                            | The player's on-board presence — the moving piece the audience follows.                 |
| **Color / tint**                                                                    | The player's permanent vivid color, and its darkened text sibling.                      |
| **Background / ink**                                                                | The channel's ground and structural colors (paper theme).                               |
| **Scoreboard**                                                                      | The persistent standings table listing the players and their current score or position. |
| **Banner**                                                                          | A platform-injected phase or round announcement plate.                                  |
| **Arena, pool, mark, skill, render, target, timeline, keyframe, 3-beat, safe zone** | As defined in the glossary at the end of this document.                                 |

Game-specific mechanics get their own terms, defined once in that game's GAMES.md entry. **Synonyms are bugs:** one concept, one word, everywhere. If a word is not in this table, in the glossary below, or in a game's own GAMES.md entry, it must not appear in docs, UI or harness output.

### Game naming rules

A game's name is a channel asset: once the catalogue is bigger than one, it is what a viewer types, requests and favourites. These rules are the game-level sibling of the player naming rules above:

- **One or two words, one breath.** It must sit on the name stamp as a single plate: no punctuation, no leading "the". One word preferred; a two-word name must still sit stacked without breaking the plate, and never more than two.
- **US spelling in names.** Names use US forms (color, not colour) regardless of doc prose — search and social are the name's habitat, and they run American. Prose stays as written; a name stands as spelled.
- **Evoke the fantasy, not the ruleset.** The name says what the game feels like or what it is made of — never how it scores. Rules evolve during design; the name is forever, and the engine id (kebab-case, CONTRACT) is derived from it on day one and never changes.
- **Ownable.** Before locking, the word must not collide with an existing franchise or major title — the same check players get. Coined compounds (a material plus a verb) or real words with a double life are the cheapest way to be unique and searchable at once; the strongest names are words whose dictionary meaning _is_ the game's doctrine.
- **A set, not a template.** Names should read as volumes from one press without sharing a prefix or suffix. The channel's visual system is the family resemblance; the name is the individual volume. No forced series prefix, ever.
- **Tagline: one line, six words max, present tense.** It says what the viewer watches or feels, never the scoring rule.
- **Placement.** The name appears on the outro card and in the title and description for search — **never inside the match frame** (owner decision: no game name on screen; the match is the headline). The old name-stamp concept is retired with it.

---

## House style — why ten games look like one channel

Games compose shared primitives; they don't invent their look. Raw canvas calls only for the game's unique subject matter (the track, the pieces), and only with palette colors and house easing.

**When a game needs something the design system lacks, it becomes a new platform primitive that every game gets. Never a private helper inside one game.**

Fixed across all games (the palette is the one starting direction, locked by the first game's preview):

|                               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typefaces                     | `Inter` (all frame type, weights 400–800; numerals tabular via `font-variant-numeric`) and `JetBrains Mono` (tooling and dev output only). The locked frame uses **no display face** — its voice is quiet print, not shout, per the preview the owner approved as the channel's look. Committed to `assets/fonts/`, loaded via `GlobalFonts.registerFromPath`. No others.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Palette                       | **Locked: PEBBLE — the paper-sheet family** (owner, 2026-10-15; reference `spinclash-preview.html` — its `TH` object and `:root` tokens). Warm gray-taupe page, light sand arena floor lighter than the page, cream cards, warm-ink + gray type, teal/amber chips. Permanent regardless: a player palette of ~24 colors, distinguishable in grayscale and under deuteranopia simulation. Each player owns one color and one text tint permanently; no two in a pool share either.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Motion                        | One easing family (fast out, soft land). Index-based stagger. No game defines its own curves.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Event punctuation             | 3-beat — anticipation ~120ms → strike ~60ms (flash) → settle ~300ms (scoreboard/legend update). **No screen shake, no particles** — removed from the locked frame by owner decision; punctuation is flash and type only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Intro, outro card, scoreboard | **Platform-injected**, including their audio cues. Games cannot skip or restyle them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Arena                         | One fixed square, the same size in every game, **centred in the frame at every aspect ratio**. All action stays inside it; compliance verifies this.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Weapon art                    | **LANDED at build roster-r12** (2026-10-25; convention CLOSED 2026-10-27 — the prescriptive lock lives in GAMES.md, "Weapon art — the closed convention"). The practiced grammar is now prescribed by the landed art: flat fills, one uniform ink outline #2e2b22, no gradients/texture/glow; the locked paints (KW/KD/KS/KP/KB in art; KG RETIRED from art at sweep-r15, owner 2026-10-27, surviving only as the carrier-less sigil fallback) plus the sigil tag KC (carrier colour at draw), the scroll's four local reference colours, and the spell-family affinity locals (fire / poison / frost / fire-orange — owner word 2026-10-25, pre-figuring the skill pass). One diegetic sigil element per weapon (doctrine 2026-10-23, realized in the return-1 blocks); copy-kind throws draw the wielder's weapon polys at area-centroid pivots. The canonical art path is the in-file poly builder; `ingest.mjs` stands DORMANT/superseded (close item 2a). State lives in GAMES.md "Weapon art"; the 2026-10-18 locked convention and the rider-brief era are preserved in git history (`git show docs-precleanup:docs/CHRONICLE-archive.md`). |

**The paper theme — locked as PEBBLE (owner, 2026-10-15).** The channel's frame is settled: a quiet printed game sheet — warm gray-taupe page (radial `#c6bda9 → #bab09b → #aca18b`), a light warm-sand arena floor (`#e7dfca`) that always reads _lighter than the page but never glaring_, a thin mid-tone hairline rim (`#a99f86`, edge `#8d8369` — locked at rim cut two, toggle stripped), cream cards (`#ede7d6`) with warm-ink text (`#2e2b22`) and gray secondary (`#807a68`), teal chips with amber active (**preview tooling only — chips never render into a recorded frame**). The type system is three roles: **tint = who** (bot names in scorebug and legend — one reused deepened pair), **ink bold = facts** (series score, weapon names, growth stats), **gray = explanations** (skill and trait codes); cast colors set no type and appear only as fills (bots, swatches, bars). The reference implementation is `spinclash-preview.html` (its `TH` object and `:root` tokens — the picker and theme ids were stripped at lock); Phase 3 lifts the exact token table from it. Three color roles, never crossed: _color_ (the player's own, permanent and vivid) for actors — bodies, bars, pills, names; _secondary gray_ for explanations and numerals; _warm ink_ for everything structural — lines, borders, headlines, game-defined marks. Event punctuation on the light ground: the 3-beat strike flashes ink; the hit flash is white on the struck body. The player palette requirement stands: ~24 colors, mid-lightness, high saturation on the light ground, distinguishable in grayscale and under deuteranopia simulation; each player owns one color and one tint permanently. Frame overlays follow the preview's locked frame: the **scorebug above the arena** (mini-bot discs — cast color with the bots' ink border — beside names in the players' deep tints, the series score big in ink — a plain row on the page, no container) and the **legend rows below on cream cards** — the frame's single sanctioned container, restored at the owner's request because the cards are what group each fighter's facts (deep-tint names, subtle by size; the skill and the weapon's trait as shorthand codes — `+SPD / Hit`, `+DMG / Hit`, the reveal poster also teaching the full sentences; the weapon in ink bold at the same weight as the bot names; codes and weapons stacked in a real table (auto layout aligns every column across both rows and hugs the names); growth stats as bold tabular numbers in fixed 3ch boxes, so the stats column can never grow and nothing ever reflows; no HP, which lives only on the bot bodies). The locked layout is **Columns**: one card, two rows — identity group, air, loadout group, air, stats. In-arena moments — round banners, K.O. — are type directly on the floor (SPINCLASH's K.O. card type removed at owner word 2026-10-21, "i dont want it to be announced": the round's end reads as the kill-still freeze, the faded disc and the scorebug tick; type-on-floor remains the channel rule for banners and future in-arena moments); the winner is type on the scrim. SPINCLASH's dice reveal is the owner-designed exception (2026-10-19): the VS poster covers the arena disc for its ~2.4s, then dissolves. Everywhere else the recorded frame carries no containers: emphasis is weight, size and color only. Raw cast colors set no type — actors and fills only. A game that cannot sit on this sheet (glow, neon, darkness-as-subject) is not a game for this channel. The default body is `gfx.body`; games override it only where their subject demands.

**Channel test:** render one frame from every game, tile them in a grid. They must look like one channel. Run it whenever a game is added or the design system changes.

---

## Studio

`npm run dev` → `http://127.0.0.1:5173`. Four screens. Nothing runs until the user picks a game.

1. **Games** — card per registered module: name, tagline, category, supported shapes. A broken module renders as an error card explaining itself; it must not crash the app.
2. **Setup** — left: options auto-generated from the Zod schema. Right: duration, seed field, dice, and the **outcome, visible by default** (winner, margin, lead changes, biggest comeback) — the user is a curator judging whether a render is worth publishing, not a viewer being spoiled. Below it, **per-game stats** derived on demand from `output/*/render.json`: number of renders, closest finish, biggest margin, most lead changes, biggest upset, last render. No store, no cache. Game switcher at top. One **Generate** button.
3. **Render** — progress bar, frame count, ETA, cancel. Runs in the server, so closing the tab doesn't kill it.
4. **Watch & download** — finished MP4 inline with native controls. Shape ticks (`vertical` pre-ticked) re-encode the same timeline. Download / Open output folder / Discard.

**Deliberately absent:** library screen, render history, notes, publish tracking, batch mode, preview tier, parallel renders, saved-config presets, auth. `output/` on disk is the library.

Stats are **descriptive only** — facts about renders that already happened. No leaderboards, no "best render" ranking, no charts, no suggestions about what to generate next.

---

## CLI

```bash
npm run doctor                                       # environment self-test, always first
npm run generate -- --game <id> --seed <n> --target vertical
npm run inspect  -- --game <id> --seed <n> --at 12.5 # one full-res PNG, ~200ms
npm run inspect  -- --game <id> --seed <n> --sheet   # ~24 frames tiled, ~2s
```

`doctor` checks: Node ≥22, ffmpeg resolvable, `@napi-rs/canvas` loads, fonts resolve, loopback bind works, port free, disk space. It must name the problem and the fix, not print a stack trace.

---

## Dev harness (for building games — never in the product UI)

The product loop is slow and perfect; building a game needs hundreds of fast looks.

| Tool                        | Cost    | For                                           |
| --------------------------- | ------- | --------------------------------------------- |
| Single frame → PNG          | ~200ms  | **Colors**, layout, typography, safe zones    |
| Contact sheet               | ~2s     | Pacing, catching a broken transition anywhere |
| Scrub view                  | instant | Stepping through a moment frame by frame      |
| Real-time playback          | instant | Motion, easing, physics feel                  |
| A/B (two seeds at same `t`) | ~1s     | "Did that change help?"                       |

Scrub view and playback run the **same renderer code over the same timeline** in a browser canvas — one implementation, two backends, possible because `core` is pure and games draw against the abstract `Surface`. They capture nothing and write nothing.

Two rules: **judge color from the PNG**, not the browser (browser canvas ≠ Node Skia pixel-for-pixel). **Accept nothing until watched in the real MP4 on a phone.**

For physics-heavy games: expose physics constants in the config schema rather than hardcoding them — the auto-generated options panel becomes a tuning bench for free.

Excluded from the production build of `apps/studio`.

---

## Repo

```
arena-engine/
├─ README.md               # the entry point — GitHub renders only this one at the root
├─ .gitignore              # scratch/
├─ docs/                   # SPEC.md CONTRACT.md BUILD.md GAMES.md HANDOFF.md
├─ previews/               # spinclash-preview.html — THE canonical game (single file, dependency-free)
├─ chromecheck.mjs         # fast boot + pairing check (~4s) — runs today on bare Node
├─ measure.mjs             # the sanctioned law matrix — OWNER-GATED, never runs without his explicit go
├─ ingest.mjs              # weapon-art merge gate + combat gauntlet (DORMANT since roster-r12)
├─ .qa/                    # proof probes: inscribe · fingerprint · leadproof · flipproof · pair-proof · seam-proof · the lengrow-* suite · bake-rows + the fp-*.json baselines
├─ scratch/                # LIVE doc tools (navgen · docreflow) + the SIM loader (loader-r54); per-build smokes live here until the next purge
├─ .vscode/                # Phase-0 placeholder (.gitkeep) — tasks/launch/settings/extensions land with the engine
├─ assets/fonts/           # Phase-0 placeholder (.gitkeep) — Inter + JetBrains Mono (OFL) arrive with `npm install` at Phase 0 (NOT committed; README's Requirements line is the authority)
├─ packages/               # Phase-0 placeholders (.gitkeep): core (pure TS sim) · render (node-canvas + ffmpeg) · server (Fastify loopback, single job slot)
├─ apps/studio/            # Phase-0 placeholder (.gitkeep) — Vite + React
├─ games/                  # Phase-0 placeholders (.gitkeep) — _probe (contract fixtures) · _template (commented scaffold)
├─ scripts/                # Phase-0 placeholder (.gitkeep) — doctor.mjs, generate.mjs, inspect.mjs
└─ output/                 # gitignored, created at runtime; one folder per render; also the stats source
```

The engine dirs are Phase-0 placeholders (`.gitkeep` only) until the matching `BUILD.md` phase lands; the LIVE tree today is the SpinClash harness — the root `.mjs` tools, `.qa/`, `scratch/` and `previews/spinclash-preview.html` (the one canonical) — which runs on bare Node with no `package.json`. Realigned to the actual tree 2026-11-10.

Run IDs: `<game>-<YYYY-MM-DD>-<HHMMSS>`. Sortable, readable, no library.

---

## Testing

- **Determinism:** same seed twice → identical SHA-256 on the encoded file.
- **Golden frames:** committed reference PNG hash per game per version.
- **Contract compliance:** one Vitest file looping over registered games, running the eight checks in `CONTRACT.md`. Not a framework.
- **ESLint:** `no-restricted-imports` / `no-restricted-globals`, stricter for `games/` than platform code.

---

## Words used in this project

Plain terms only — broadcast jargon has been removed. These are the technical words that remain:

| Term                | Meaning                                                                                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Player**          | One participant in a match: `id`, `name`, `color`, optional `mark`. Always a single named thing, never a crowd. Matches are 1v1 or a four-way free-for-all. (Code may use `entity` as a variable name.)                            |
| **Body**            | The player's on-board presence — the moving piece the audience follows. `gfx.body(player, opts)` draws the default one; games override it only where their subject demands.                                                        |
| **Color**           | A player's permanent, unique color — the same in every game, so they stay recognisable. No two players in a pool share one.                                                                                                        |
| **Mark**            | The detailed visual identity drawn on a player's body — a glyph for a character, a flag for a nation. Separate from color, because a flag can't fill a progress bar.                                                               |
| **Pool**            | A JSON file of players, e.g. `assets/pools/characters.json`. A game declares which pool it draws from. Adding a player is a data change, never code.                                                                               |
| **Scoreboard**      | The persistent on-screen panel listing players and their current position or score. The thing that makes the freeze test pass.                                                                                                     |
| **Caption bar**     | A short text overlay, usually near the bottom, used for callouts. Not a subtitle file.                                                                                                                                             |
| **Arena**           | The one fixed square all action stays inside. Same size in every game, centred in the frame at every aspect ratio.                                                                                                                 |
| **Skill**           | What makes a player behave differently. A set of optional, passive **hooks** into one game's mechanics — defined by that game, never known to the platform. Player data holds no behaviour. Exactly one skill per player per game. |
| **Frame overlay**   | The fixed graphics around the arena: scoreboard, title, caption bars, intro, outro. Platform-injected; games can't restyle them.                                                                                                   |
| **Intro / outro**   | The short branded opening and the result card at the end. Same in every video.                                                                                                                                                     |
| **3-beat**          | How a significant moment is punctuated: anticipation (~120ms) → strike (~60ms, flash) → settle (~300ms, scoreboard update). No shake, no particles — the locked frame punctuates with light and type only.                         |
| **Timeline**        | The recorded result of a completed simulation: keyframes, events, audio cues, result summary. The renderer walks it to produce frames.                                                                                             |
| **Keyframe**        | A full snapshot of the simulation every 0.5s, so the renderer can re-enter the timeline cheaply.                                                                                                                                   |
| **Render** _(noun)_ | One generation, from pressing Generate to an MP4. Identified by `<game>-<date>-<time>`. Avoid "run" for this — in a racing game a _run_ means an attempt down the track, and the collision is endless confusion.                   |
| **Target**          | An export preset: `vertical`, `vertical-30`, `horizontal`.                                                                                                                                                                         |
| **CFR**             | Constant frame rate. Every frame occupies exactly the same duration; verified with `ffprobe` on every render.                                                                                                                      |
| **Dither overlay**  | Faint fixed noise over dark backgrounds. Stops them banding after a platform recompresses the video.                                                                                                                               |
| **Safe zone**       | Screen edges kept clear because platform UI covers them (bottom 220px, right 140px, top 160px on vertical).                                                                                                                        |
| **Probe**           | A throwaway game used to validate the contract. Not content, never published.                                                                                                                                                      |

---

## Deferred on purpose

Settled as "decide later," with the phase where each gets decided:

|                                                                                                                                      | When                  | Why wait                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The games** — mechanics, arenas, pacing                                                                                            | Phase 8               | Designing them before any frame has been rendered is guessing                                                                                                                               |
| **Players and pools** — the roster: names, colors, marks, how many                                                                   | Phase 8               | Depends on the games. The _mechanism_ is settled (CONTRACT.md §Skills); the cast is not                                                                                                     |
| **Concrete visual identity** — engine token table, type scale, scoreboard layout, the designed intro and outro                       | Phase 3               | Theme **locked** (PEBBLE, paper-sheet family, owner 2026-10-15); what remains is the engineered token set lifted from `spinclash-preview.html`, the type scale and the designed intro/outro |
| **Audio identity** — the sound palette, what a match's turning points and its ending sound like, whether there's a musical signature | Phase 3               | Same. Technical requirements are locked; the sounds are not                                                                                                                                 |
| **Non-Latin scripts, long player names**                                                                                             | When pools exist      | Nations were an example, not a commitment                                                                                                                                                   |
| **Standard config fields** — player count, duration, match structure                                                                 | After the second game | One game can't reveal what's common                                                                                                                                                         |
| **Sound-effect vocabulary** — the set of names games call via `sfx()`                                                                | After the second game | Same                                                                                                                                                                                        |
| **Match structure and escalation** — whether a platform-level tension system is worth having                                         | After the second game | Games may simply be designed to have shape; don't build a system to compensate for flat mechanics                                                                                           |

**Settled since this table was written:** skills are per-game hooks with no platform-level system (see `CONTRACT.md`), which resolved the "signature moves" and "escalation ownership" questions.

**The rule for the remaining ones:** the first game is built freely, with no attempt to generalise. When the second game is designed, whatever the two share gets extracted and promoted into the platform. Extracting a standard from two real examples beats inventing one upfront — and inventing one upfront is how a platform accumulates abstractions nothing uses.

None of these block Phases 0–2. The pipeline, the contract and the compliance suite need no palette, no sounds and no characters.

---

## Scope

Out, permanently or until v1 ships: content strategy, game design, publishing/upload tooling, accounts, analytics, non-loopback networking, telemetry, 3D/WebGL, LLM calls, UI-based game authoring, plugins, desktop packaging, i18n, mobile.

The tool never touches publishing or revenue. What it _does_ own is every technical property that decides whether a video is eligible and competitive: resolution, framerate, codec, loudness, safe zones, legibility, house style.

---

## Prior art

Two architectural patterns here — behaviour as optional passive hooks defined locally by each game, and a single fixed arena centred at every aspect ratio — were inspired by an existing open animation-engine project.

**No text, code, template, character, or game design was copied from it.** Both patterns are described above in our own terms and are adapted to an offline render pipeline that project does not have. The games, players and visual identity in this project are entirely our own.

The owner contacted that project's owners and received **explicit permission for any use, including commercial**. We chose original designs regardless: their specific ruleset, text and code were not copied.
