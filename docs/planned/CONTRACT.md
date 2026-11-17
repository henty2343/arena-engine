# ARENA ENGINE — Game Contract

Contains: the interface a game implements in the PLANNED engine — services, hooks, timeline shape, compliance checks.
Read when: engine work only. Canonical for: the game interface. Token cost: see STATE.md §Documentation cost.

> **STATUS: PLANNED — not implemented.** This is the target interface for the future engine (BUILD.md Phases 0–8). No `games/<id>/` modules exist yet; the one live game is `previews/spinclash-preview.html` (a single-file `newGame`/`tick` sim). Read this as the goal, not as shipped code.

The interface a game implements. The platform knows nothing about any specific game: **zero `gameId` conditionals in platform code, ever.** If you find yourself adding one, the contract is wrong — fix the contract.

---

## A game is a folder

```
games/<id>/
├─ index.ts      # default-exports the GameModule
├─ sim.ts        # pure simulation
├─ render.ts     # frame drawing
├─ config.ts     # Zod schema
└─ README.md     # what it is, what the knobs do
```

Discovery is convention-based: the registry imports every `games/*/index.ts` at boot, validates the export, and rejects malformed modules with a readable error surfaced in the UI. No registration file, no platform edits.

---

## The interface

```ts
export interface GameModule<C = unknown, S = unknown> {
  meta: {
    id: string;                 // kebab-case, unique, stable forever
    name: string;
    tagline: string;
    category: 'race' | 'elimination' | 'competition' | 'accumulation'
            | 'prediction' | 'spectacle' | 'other';
    tags: string[];
    targets: ExportTargetId[];  // 'vertical' | 'vertical-30' | 'horizontal'
    version: string;            // bump on any output-affecting change
  };

  /** Single source of truth for every knob. Drives the UI panel,
   *  CLI flags, validation and defaults. */
  configSchema: z.ZodType<C>;

  /** The platform asks the game how long it is — never the reverse. */
  getDuration(config: C): number;   // seconds

  /** Pure: no drawing, no I/O, no globals. */
  createGame(config: C, svc: SimServices): GameInstance<S>;

  /** Draw one frame. May not mutate sim state. */
  render(ctx: Surface, snap: S, t: number, svc: RenderServices): void;
}

export interface GameInstance<S> {
  step(dt: number): void;       // advance exactly one fixed tick (1/120)
  snapshot(): S;                // serializable state at the current tick
  events(): GameEvent[];        // events since the last call
  finished(): boolean;
  result(): ResultSummary;      // valid once finished()
}
```

Five required members, nothing optional. Every extra hook is a promise the platform keeps forever — add nothing until a real game needs it.

`getDuration` is a function because length usually depends on config. `createGame` returns a stepping instance, not a whole timeline, so memory stays bounded. `snapshot()` must be plain serializable data — it's stored at keyframes. `render` gets a snapshot rather than the instance, which makes the sim/render split physical: the renderer cannot advance the game.

---

## Injected services

A game touches **only** its own module and these.

### `SimServices` (in `createGame`)

| | |
|---|---|
| `rng` | `.next()` `.range(a,b)` `.int(a,b)` `.pick(arr)` `.weighted(entries)` `.shuffle(arr)` `.fork(label)` |
| `config` | Validated, frozen config object |
| `clock` | `{ tick, ticksPerSec, time }` — the only permitted time source |
| `emit(event)` | Record a discrete event. Use the core vocabulary where it applies; custom kinds are permitted and ignored by the platform. |
| `say(text, style, window)` | On-screen text as part of the game's graphics — a callout, caption bar, status line. **Not** a subtitle system; produces no caption file. |
| `sfx(name, at?, gain?)` | Queue an audio cue against a timeline time |

`rng.fork(label)` gives each subsystem its own deterministic stream, so adding a random call in one place doesn't shift every later outcome.

### `RenderServices` (in `render`)

| | |
|---|---|
| `gfx` | `bar` `chip` `badge` `meter` `countdown` `leaderboard` `bracket` `swoosh` `flash` `vignette` `grid` `body(player, opts)`, plus camera moves `zoom()` `pan()`. No `particles`, no `confetti`, no `shake` — the locked frame punctuates with flash and type only (house style). |
| `type` | `display()` `ui()` `mono()` at the house scale; `fit(text, maxWidth)` `wrap()` `measure()` |
| `palette` | Tokens, semantic colors, and per-match player color assignment |
| `layout` | Canvas dims, **`arena`** (the fixed play-area rectangle, identical in every game), `safe.titleBox` / `safe.scoreBox` / `safe.captionBox`, column and row grids |
| `anim` | `tween(from, to, t, ease)` `stagger(i, n, offset)` `spring()`, the house easing set |
| `beat(ms)` | The 3-beat helper: anticipation → strike → settle, synced to an event time |
| `theme` | This render's accent color and package settings |

### `Surface`

A ~40-method interface over `CanvasRenderingContext2D`. Games draw against `Surface`, never a concrete canvas — that's what lets the same render code run on Node's Skia and in a browser `OffscreenCanvas`.

---

## Players

A player is one participant in a match — always a single named thing, never a crowd. Matches are 1v1 or a four-way free-for-all, so at most four appear at once.

```ts
type Player = {
  id: string;              // stable forever, used by the sim
  name: string;            // what the audience reads
  color: string;             // permanent and unique — the same in every game
  mark?: Mark;             // glyph, flag, or image. Optional.
};
```

**Players live in data files, not in code.** A pool is a JSON file of players — `assets/pools/characters.json`, and others as needed. A game declares which pool it draws from, or supplies its own list. Adding player #41 is a one-line data change; the platform never learns their name.

**Color is permanent.** Speedy is green in every game, forever — that's what makes them recognisable, and it's worth more than any other visual consistency. `mark` is the detailed identity drawn on the body: a glyph for a character, a flag for a nation. Color is what the *system* uses (bar, chip, territory fill); the mark is what the *body* wears. They're separate because a flag can't fill a progress bar.

### Colors never collide

**No two players in a pool share a color.** It's a constraint on the data, checked at load — not something resolved at runtime. There is no priority order, no reassignment, no per-match logic. A player's color is simply theirs.

This is easy because the numbers are small. A match shows at most four players, so only four colors ever need to be separable *at the same time* — and they're backed by names, marks and scoreboard positions, so color is reinforcement rather than the sole identifier. The palette only needs to be at least as large as the pool.

The palette is **~24 colors**, differing in lightness as well as hue so they survive grayscale and red-green color vision deficiency (~8% of men). The practical ceiling on pool size is not color availability but memory: past roughly 24–30 named players, a cast stops being something an audience can hold in its head. Choose colors you can *name* — "green" and "red" are characters people discuss in comments; "chartreuse" and "olive" are not.

### What the platform provides

- `palette` exposes the player colors for this match.
- `gfx.body(player, opts)` draws a default body — a colored form carrying the mark and name — which a game may override where its subject demands.
- The scoreboard, leaderboard and result summary refer to players by `id`.

Nothing else. The platform has no concept of a cast, a character, or a nation.

---

## Skills — how players differ

A player's identity (name, color, mark) never changes. What makes them behave differently is their **skill**, and a skill is a set of **hooks** into one game's mechanics.

The split is strict:

- **Player data holds no behaviour.** Just `id`, `name`, `color`, optional `mark`.
- **Behaviour lives only in hooks**, defined inside each game.
- **Identity is global; skill is local.** The same player is reinterpreted per game — the identity stays recognisable, the mechanical effect does not have to be identical.

**One skill per player per game.** A player has exactly one skill in each game they appear in, and that skill may be expressed through one hook or several. Not zero, not two.

### Rules for a hook

1. It **reads** the player and a small context, and **returns a modified value**. It never mutates state.
2. It is **optional**. Where a game calls a hook a player doesn't implement, the base value passes through unchanged — so adding a hook never means editing every player that doesn't use it.

   Optionality is a **safety net, not a design choice**. Because of it, a player can appear in a game *before* their skill is authored — they simply run on base values and the game still works. Adding player #12 therefore doesn't block on writing twelve skills; they can appear immediately and get theirs later.
3. It **never depends on another player's hook.**
4. It **modifies an existing mechanic**; it never introduces a new one.
5. It may consume the game's seeded RNG, but must **never create or seed one.**
6. Anything time-dependent — a cycle, a timer, a cooldown — is advanced by the game's own per-tick logic. The hook only reads whatever has already been decided.

A game may bind its hooks tighter than these six rules. SPINCLASH's standing ruling (owner, 2026-10-31, recorded in its `GAMES.md`): a player **skill** and an equipment **trait** may stack **only by addition on a shared axis** — neither may reach into the other's mechanic, and no unique player×equipment combinations may exist.

### Hook names belong to the game

Each game defines its own hook interface. Names are local to it, never shared between games, and **the platform never learns any of them.** It supplies only the generic shape of a hook — a context in, a value out — and nothing more.

That's what keeps rule 6 true: adding a game never edits the platform, and adding a player never edits a game they don't appear in.

A consequence worth stating, because it settles a question we'd deferred: **there is no platform-level skill system, no archetype taxonomy, and no ability registry.** The platform provides the shape; games provide the content.

An earlier design had six archetypes as buckets implying behaviour. They were dropped: **a well-chosen name does the same job and is visible to the audience.** "Heavy" tells a viewer what to expect; `front-runner` never would. See SPEC.md for the naming rules.

---

## Event vocabulary

`emit()` takes a `kind`. Seven kinds are **core** — the platform reacts to these with shared visuals and audio, so every game punctuates moments the same way:

| Kind | Platform reaction |
|---|---|
| `win` | Outro, result card |
| `eliminated` | Desaturate the player, strike it from the scoreboard, impact sound |
| `lead` | Position swoosh, scoreboard reorder |
| `nearMiss` | Brief tension beat |
| `impact` | Shake + impact sound |
| `milestone` | Callout |
| `phaseChange` | Transition wipe |

**Games use only the kinds that apply.** Most will use two or three, and that's expected — nothing requires a game to emit all seven.

Games may also emit **custom kinds** for their own rendering. The platform ignores any kind it doesn't recognise, and never branches on `gameId` to work one out.

---

## Matchup config

Every game is *X versus Y*, so every game needs to know which players from the pool are competing. One standard config helper does this:

```ts
const config = z.object({
  matchup: MatchupSchema,   // { mode: 'headToHead' | 'freeForAll' | 'random', ids?: string[] }
  // ...the game's own options
});
```

The platform resolves `matchup` into a list of player ids and hands them to the game. The studio renders `MatchupSchema` as the same control in every game — a grid of the available players you tick, plus a "random" option — so the picker looks and behaves identically everywhere and no game writes matchup UI. Display names come from the game.

---

## A game may **not**

Enforced by ESLint and CI:

- Import `node:*`, `fs`, `path`, `child_process`, or anything from `packages/render` / `packages/server`
- Reference `window`, `document`, `process`, or mutate `globalThis`
- Call `Math.random`, `Date.now`, `performance.now`, `new Date()` without an argument
- Perform I/O, network calls, or dynamic `import()`
- Mutate state inside `render`
- Hardcode a resolution, framerate, safe zone, font or color — those come from services
- Define its own easing curves
- Draw action outside `layout.arena`, or restyle the platform-injected frame overlay
- Exceed its declared duration, or emit events after `finished()`

---

## Timeline

Produced by the platform from a completed simulation. Games never construct it.

```ts
type Timeline<S> = {
  meta: { gameId: string; gameVersion: string; seed: number; config: C;
          durationSec: number; ticksPerSec: number };
  keyframes: { tick: number; snap: S }[];   // every 0.5s → enables re-entry
  events: GameEvent[];
  audio: AudioCue[];                        // { at, sound, gain }
  result: ResultSummary;
};

type GameEvent = {
  tick: number;
  kind: string;                             // game-defined, e.g. 'overtake'
  subjectId: string;
  otherId?: string;
  data?: Record<string, string | number>;
  label?: string;                           // human-readable, may be shown on screen
};

type ResultSummary = {
  standings: { id: string; place: number; value?: number }[];   // required
  winnerId: string;                                             // required
  margin?: number;                          // game-defined units
  leadChanges?: number;
  biggestComeback?: { id: string; from: number; to: number };
  records?: string[];                       // e.g. "fastest final"
  highlights?: { tick: number; label: string }[];
};
```

Keyframes every 0.5s, not every tick — 7,200 full snapshots for a 60s match would be hundreds of megabytes. Sparse keyframes let the renderer re-enter cheaply, which is what makes a second aspect ratio a re-encode rather than a fresh simulation.

`ResultSummary` feeds exactly three things: the outcome panel, the per-render stats breakdown, and `render.json` (which is where per-game aggregate stats come from). The platform displays these facts and does not interpret them. **There is no drama score** — an earlier weighted composite was removed; invented weights presented as measurement, when the underlying facts are more useful.

---

## Fixed timestep

- Simulation: **120 Hz**, `dt = 1/120`, never variable.
- Output: 30 or 60 fps per target; the renderer interpolates between ticks.
- The platform drives the loop. `step()` must be safe to call exactly `duration × 120` times, and `finished()` must be true at or before that point.

---

## Contract validation suite

One Vitest file loops over every registered game and runs these eight. A game isn't done until all pass.

1. **Purity lint** — no forbidden imports or globals.
2. **Schema check** — config parses, defaults valid, every field has UI metadata.
3. **Determinism** — simulate twice with one seed → identical timeline hash.
4. **Duration** — sim finishes within 2% of `getDuration()`.
5. **Snapshot serializability** — `structuredClone` round-trip.
6. **Safe zones and arena** — render 20 sampled frames; no meaningful ink outside the safe boxes, and no action outside `layout.arena`.
7. **Output completeness** — a 5-second render produces a valid MP4 at every declared target plus `render.json`, and nothing else.
8. **Golden frame** — one committed reference PNG hash per game per version.

---

## The two probes

The contract must be validated by two mechanically unrelated games before any real game is built. Both stay in the repo as compliance fixtures; neither is content.

- **`_probe` A** — the simplest thing that exercises the whole pipe: N players advancing to a finish line. Continuous motion.
- **`_probe` B** — deliberately the opposite: discrete rounds, phases, elimination, a bracket graphic, no continuous motion.

If B fits without contract changes, the contract is real. If it needs a special case, fix the contract then — before ten games depend on it.

---

## Reserved for later

Only one speculative extension is worth leaving room for, because it affects the timeline format:

- **`interactive` mode** — an optional flag plus an `input` event stream. A local player plays the game; the input is recorded as a deterministic log and replayed through the same pipeline into a video. Cheap to allow for now, expensive to retrofit.

Also possible later with no contract change: in-browser sim preview (needs only a `Surface` shim over `OffscreenCanvas`), and thumbnails (just "encode one chosen frame").
