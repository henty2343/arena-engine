# AUDIT REPORT — agent-architecture audit snapshot (TEMPORARY)

Contains: the 2026-11-19 audit of this repo at commit 4584583: findings F01-F16, proposed architecture, metrics, a handoff prompt.
Read when: only to see the evidence behind a ROADMAP.md phase; grep by finding ID, never read whole. Status lives in ROADMAP.md, not here. Token cost: see STATE.md.

# arena-engine: AI-agent architecture audit

Audit of `henty2343/arena-engine` at commit `4584583` (branch `main`, working tree clean before and after; nothing was modified). Token figures are chars/4, the same method `STATE.md` uses, so they are approximate and comparable to it.

## 0. Scope, method, and what I did not inspect

**Run (read-only):** `node tools/verify.mjs --quick` (VERIFY PASS, 7 checks), `node .qa/fingerprint.mjs --compare` (8/8 vs `fp-flailfix-r88.json`, exit 0), `node .qa/strip-hash.mjs --base canonical-prediet-2c` (PASS), `node tools/lint-docs.mjs` (0 errors, 0 warnings), `md5sum` of the canonical (`5de162de...`, matches `STATE.md`). I never ran `measure.mjs` (owner-go rule).

**Read in full:** `README.md`, `AGENTS.md`, `STATE.md`, `.qa/BASELINE`, `.gitignore`, `.gitattributes`, `.github/copilot-instructions.md`, first/last screens of `HANDOFF.md`, head of `BATCH3-STATUS.md`, `tools/lib/load-sim.mjs` header, heads of `CONTRACT.md` and `BUILD.md`.

**Measured by script only (not read):** sizes, line lengths, heading maps, grep counts for every doc and the canonical.

**NOT inspected, so no claims about them:** the canonical's contents (4,717 lines; I measured comment share only), `.qa/*` proof logic, `measure.mjs`/`ingest.mjs`/`chromecheck.mjs` internals, `docs/LAWS.md` and `RECIPES.md` bodies (grepped only), `SPEC.md`, `GAMES.md` and `docs/history/*` bodies, `verify --battery` (about 15 min; not run).

**Headline:** the preliminary findings are largely stale. Most listed defects were already fixed. The dominant remaining problem is one the preliminary list did not contain: the handoff files.

## 1. Executive assessment

**Works well.** The entry layer is now excellent. `README.md` is a 321-token router. `AGENTS.md` (2.1k) + `STATE.md` (0.9k) give a 3.0k-token start, far below the 12k target. `LAWS.md` and `CODEMAP.md` bring a code-editing session to about 9.5k. Mutable facts are generated and checked (`gen-state --check`, `navgen --check`, `lint-docs`, `manifest`). `verify.mjs` emits a judged pass/fail plus one JSON line, and `fingerprint --compare` is machine-judged against `.qa/BASELINE`. Planned and implemented work are separated by directory (`docs/planned/`) and by header text.

**Still costly.** `docs/handoff/HANDOFF.md` is ~91k tokens and `BATCH3-STATUS.md` ~48k, together ~140k, which is **40% of all documentation tokens (~348k)**. AGENTS routes delivery work through HANDOFF, labels it "process authority that outranks chat", and it sits outside every lint glob. It also has no header, 52 lines over 2,000 characters (max 12,025), and a stale title ("v11 ... make the repo token-friendly", a task that is largely done). `STATE.md`'s cost table omits both files, so the project's own accounting understates the onboarding risk by 40%.

**Architectural risk.** The handoff is updated in the same commit as every landing, and its "where we are" and "what remains" sections are prose ledgers. It therefore grows without bound and is the single most likely source of agents loading 90k tokens or acting on a stale paragraph.

**Verdict.** The structure is fundamentally sound; do **not** restructure the repo tree. The needed work is (a) fix the handoff, (b) close lint coverage gaps, (c) a handful of small hygiene items. The canonical-comment cleanup and loader unification are low priority.

## 2. Status of the preliminary findings (independently re-checked)

| Preliminary finding | Status now | Evidence |
|---|---|---|
| README claims baseline `fp-multgrow-r42.json`, 8/8 false alarm | **Fixed** | `.qa/BASELINE` -> `fp-flailfix-r88.json`; compare run: 8/8 PASS, exit 0; README no longer names a baseline |
| ~198k-token mandatory reading | **Fixed for the entry path**, **not for handoff** | AGENTS+STATE ~3.0k; README no longer instructs reading all docs; see F01/F02 |
| Retired projectile-spine law repeated ~12 times | **Fixed in current docs** | `LAWS.md` lines 30-31, 60, 163-169 state it as RETIRED at `allcut-r62`; `AGENTS.md`/`RECIPES.md`: 0 hits; GAMES: 1 regex hit (history). `lint-docs` has a retired-rule check |
| GAMES MD5 stale; ~90 pins | **Changed** | GAMES now has 5 unique 32-hex values (was ~90 claimed); `STATE.md` md5 matches `md5sum`; lint checks md5 in operational docs |
| Trait count 14/22 vs 9/22 | **Fixed** | `LAWS.md:85` says 14 of 22, 8 remain; `lint-docs` reports `canonicalTraits: 14` and checks it |
| Six missing paths in README | **Fixed in README**; some names persist in archives | `HANDOFF.md` exists; `package.json` is deliberately mentioned as absent; old names (`projectile-fix`, `CHRONICLE-archive`, `design-shots`, `boomvars`) still appear in history/handoff/BATCH3 and also in `SPEC.md`/`BUILD.md`. I did not trace each; Hypothesis that they are historical or planned |
| `run-battery.mjs` undocumented | **Fixed** | in `STATE.md` inventory; reached via `verify --battery` |
| CONTRACT describes nonexistent `createGame` as implemented | **Fixed by labeling** | headers say "PLANNED engine"; `createGame` still appears (line 50) as planned interface. Not verified that every planned doc has a banner beyond the header line |
| Reading order conflict | **Fixed** | AGENTS.md is the single loading-order owner |
| GAMES 386 KB diary, 44 lines >2,000 chars | **Reduced** | GAMES 222 KB (55k tok), 2 lines >2,000 (max 2,675), 266 lines >300; eras moved to `docs/history/` (3 files, ~119k tok) |
| Canonical ~55% comments, ~124k tok | **Partly different** | 419,882 bytes ~105k tok; 29.8% of lines are whole-line comments (method excludes inline/trailing comments, so not comparable to 55%) |
| Scattered tooling, `.fp-r87-fixtest.json` tracked, `loader-r54.mjs` orphan | **Fixed** | neither is in `git ls-files`; `scratch/` documented as runtime temp dir |
| ~15 tools each slice `<script>` | **Reduced to 10** | 10 files use `load-sim.mjs`; 10 still use `indexOf('<script>')`; header documents deliberate carve-outs for several |
| 9 empty `.gitkeep` dirs | **Still true (10)** | 10 tracked `.gitkeep`, see F08/F09 |
| Machine-unreadable verdicts | **Fixed** | `verify.mjs` JSON verdict, `fingerprint --compare`, `lint-docs` JSON |

Preliminary Phase 1 and most of Phase 3 are therefore **done**. The roadmap below replaces them.

## 3. Findings register

Categories: **D** defect, **W** weakness, **O** opportunity, **R** redesign. Each entry carries the required fields in compact form (current situation + problem are merged into *Evidence*). Confidence: V verified, S strongly supported, H hypothesis.

| ID | Cat | Location | Evidence | Agent impact | Proposed improvement | Pri / Effort | Depends | Conf |
|---|---|---|---|---|---|---|---|---|
| F01 | D | `STATE.md` "Documentation cost" table; `tools/gen-state.mjs` | Table lists 12 docs but omits `HANDOFF.md` (91,436) and `BATCH3-STATUS.md` (48,301); all docs total ~348k tok | Agent believes the doc set is ~208k and that read policies are complete; the two largest "authority" files have no stated read policy | Add both to the generated table with policy `SLICE ONLY by section`; have gen-state assert every `docs/**/*.md` is listed | High / S | none | V |
| F02 | W | `docs/handoff/HANDOFF.md` | 91k tok. Preamble before `## 0` is 29.8k tok. Section sizes: §6 delivery 7.9k, §7 "What remains" 41.7k, §9 5.4k, §10 2.9k, §0-5 and §8 ~3.7k. 52 lines >2,000 chars; max 12,025. No 3-line header. Title says v11 / token-friendly task | Whole-file read is 45% of a 200k window; grep returns multi-KB lines; AGENTS orient step 1 and step 5 pull agents here | Split by function (section 4): small runbook, delivery doc, short status, archive. Keep `HANDOFF.md` as a <1k-token router so existing links survive | Critical / M | F01, D1 | V |
| F03 | W | `docs/handoff/BATCH3-STATUS.md` | 48k tok, titled "STATUS — COMPLETE", 8 lines >2,000 chars, 66 headings; referenced by AGENTS and HANDOFF | A finished ledger in the live process directory; reads as current | Freeze into an archive location after the lint-glob decision (D1); leave a 5-line summary | High / S | D1 | V |
| F04 | R | HANDOFF §7, §9, §10 (prose ledger updated every landing) | §10 "Where we are" is one growing paragraph naming the last landing and prior hashes; manual freshness rule (`git log -1 -- HANDOFF.md` == `origin/main`) | Every landing rewrites the largest file; stale-paragraph risk; large diffs | Derive "where we are" from `git log` and `STATE.md`; keep only open decisions and gotchas as hand-written text; archive per-landing narrative | High / M | F02 | S |
| F05 | W | `docs/handoff/*` vs `tools/lint-docs.mjs` | AGENTS: handoff files "sit outside every lint glob" (so history-dir lint control C5 can't be tripped) | The most-read process doc has zero ref/md5/header/line-length checks; this is how F02 grew | Add a separate lint profile for handoff: header present, refs resolve, md5 values match, max line length, max size. Keep the files out of `docs/history/` | High / S | F02 | V |
| F06 | W | `docs/GAMES.md` ("live") | 55.5k tok, 622 lines, 266 >300 chars, 2 >2,000, no rotation threshold; AGENTS says never read whole | Grep-only works, but a grep hit can return 2.7 KB; live file grows until the next manual era freeze | Define a size budget (e.g. 40k tok) that triggers a freeze into `docs/history/`; lint warns above it | Medium / S | none | S |
| F07 | W | Line lengths in files agents load whole | `AGENTS.md` 7 lines >300 (max 745); `LAWS.md` 9 (max 984); `CODEMAP.md` 3; `STATE.md` 1 (440) | Small cost but these are always/often loaded; long lines also defeat targeted grep | Lint warning at 400 chars for the always-load tier only; do **not** enforce 300 on archives (section 6) | Low / S | none | V |
| F08 | D | `scripts/.gitkeep` | `scripts/` contains `run-battery.mjs`, so the placeholder is meaningless | Noise; signals "empty planned dir" where code exists | `git rm scripts/.gitkeep` | Low / S | none | V |
| F09 | W | `packages/*`, `apps/studio`, `games/_probe`, `games/_template`, `assets/fonts`, `.vscode` (empty, `.gitkeep`) | 9 empty dirs shaped like the planned engine tree; AGENTS has to explain they are placeholders | Agent may treat the tree as implemented structure or look for code there | Needs owner decision: remove until BUILD Phase 0 creates them. If kept, list them in STATE as "planned, empty" (generated) | Low / S | D2 | S |
| F10 | W | Hand-copied derived facts: `AGENTS.md:35`, `HANDOFF.md:12` ("expect ... 7 checks"); HANDOFF §10 hashes | Count is correct today, but nothing checks it; lint covers md5, traits, refs only | Adding one verify check makes two docs lie; agent may think a PASS with 8 is a failure | Drop the number ("expect VERIFY PASS") or lint it against `verify` output | Medium / S | none | V |
| F11 | O | `.qa/fp-flailfix-r88.json` + `.qa/BASELINE` | Baseline JSON holds only the 8 cells (no canonical md5/stamp). Label `r88` != build stamp `r87` (explained in STATE) | PASS proves "equals baseline", not "baseline was recorded on a known build"; the name invites the r87/r88 confusion STATE has to explain | Record `{canonicalMd5, stamp}` beside the cells (sidecar or `_meta` key; update the reader) and print it in the verdict | Medium / S | none | S |
| F12 | O | Orient step: `git fetch origin` + `rev-parse origin/main` | Requires network and a remote; in a sandbox or offline clone it fails or is vacuous | Agent may skip or misreport the freshness check | Fallback: compare to local HEAD and say so explicitly; optionally `verify --orient` combining quick + strip-hash + freshness | Low / S | F10 | H |
| F13 | W | Tool placement: root (3), `scripts/` (1), `tools/` (11), `.qa/` (21 + baseline) | Four locations; role split exists (runtime tools, battery, generators/lint, proofs) but no stated rule beyond `tools/manifest.json` | Agent adding a tool must guess where; the manifest registers but does not say where new files go | One-line placement rule in `tools/manifest.json` note/AGENTS. **Do not** rename `.qa` (evaluated and closed at #786: 446 refs in 42 files) | Low / S | none | S |
| F14 | O | 10 tools keep their own `<script>` slicing | `load-sim.mjs` header documents deliberate carve-outs (multi-block, Path2D, double-eval in seam-proof, typeof-guard in lengrow-bake). I did not see justification for `inscribe`, `ingest`, `measure` in the part I read | Mostly low: duplicated logic only matters when the canonical's script layout changes | Add a manifest field or comment per tool: `loader: shared|own (reason)`; migrate only the unjustified ones, each gated by fingerprint 8/8 and the owning proof | Low / M | none | H |
| F15 | O | `previews/spinclash-preview.html` | Name and path suggest a non-canonical preview; AGENTS/STATE state it is the one canonical | Mitigated by docs (rule 5, STATE, CODEMAP); remaining risk is a fresh agent that skips them | Keep the path (tools and md5 workflows pin it); `copilot-instructions.md` already names it | Low / — | none | S |
| F16 | O | Canonical comments (~29.8% whole-line comments, ~105k tok, longest line 1,966) | CODEMAP/symbol map already lets agents enter at one symbol; I did not measure owner-quote, build-tag, or registry share | Whole-file reads are already discouraged by AGENTS; savings accrue only to agents that violate that | Measure first (comment categories, registry tokens). Do only comment-only edits gated by `strip-hash` PASS + fingerprints | Low / L | measurement | H |

**Defects found: F01, F08.** Everything else is a weakness, opportunity, or redesign preference and is labeled as such. F04 is a redesign choice, not a defect.

## 4. Proposed architecture

**Current architecture (preserve):** one canonical HTML, bare-Node harness in `.qa/` + `tools/`, generated `STATE.md`/`CODEMAP.md`/nav block, tiered doc loading in AGENTS, `docs/planned/` for the unbuilt engine, `docs/history/` for frozen eras. No directory move is justified.

**Change only the handoff area:**

```
docs/handoff/
  HANDOFF.md      router, <1k tok, keeps the path (README/AGENTS/lint refs stay valid)
  RUNBOOK.md      ground rules, orient, proof sequence, gotchas  (~4k tok; was §1-5, §8)
  DELIVERY.md     the two delivery routes                        (~8k tok; was §6)
  STATUS.md       open decisions + next action only              (<2k tok; was §10 + live part of §7)
  archive/        old §7 ledger, §9 narrative, BATCH3-STATUS     (grep-only)
```

Why: an agent doing delivery reads 8k instead of 91k; one that is only orienting reads ~4k + 2k. Files are by *task*, not by *document history*, which is the unit an agent loads.

**Alternative considered:** keep one `HANDOFF.md` and merely add a section index plus slice rules. Cheaper to migrate, but the file stays 90k tok, still invites whole reads, and every landing still edits it. Rejected for F02/F04; acceptable as a stop-gap if the owner prefers.

**Information ownership (unchanged, plus):** facts -> `STATE.md` (generated); laws -> `LAWS.md`; recipes -> `RECIPES.md`; workflow/loading -> `AGENTS.md`; process/delivery -> `docs/handoff/*`; history -> `docs/GAMES.md` + `docs/history/`. **New rule:** any file in `docs/` that is not generated must have the 3-line header and appear in the STATE cost table.

**Load policy:** global = `AGENTS.md` + `STATE.md`; on demand = the tier table already in AGENTS plus `docs/handoff/DELIVERY.md` before delivering; never whole = GAMES, history, archive.

## 5. Documentation and instruction strategy

- **Entry point:** `AGENTS.md` (keep; `README.md` and `copilot-instructions.md` stay pointers).
- **Always loaded:** AGENTS + STATE (~3k). Trim `AGENTS.md` step 5 (the delivery paragraph) to a two-line pointer to `DELIVERY.md` after the split; it contains agent-specific branches (e.g. Qwen) that belong in the delivery doc.
- **Task-specific:** LAWS, CODEMAP, RECIPES, DELIVERY, `planned/*` as in the existing tier table.
- **Historical:** GAMES (live) with size-budget rotation, `docs/history/`, `docs/handoff/archive/`.
- **Machine-readable:** `tools/manifest.json` (keep), `.qa/BASELINE`, JSON verdict lines (keep). Do not add more metadata files.
- **Duplication control:** canonical facts stay generated; for hand-copied ones (F10) either delete or lint.
- **Progressive disclosure:** keep the 3-line header convention (already in AGENTS/STATE/CONTRACT/BUILD); extend it to handoff files and enforce it by lint.

## 6. Answers to the architecture questions in the brief

- *Single entry point?* Yes. AGENTS works at 2.1k; the benefit comes from the one-owner rule, which F02/F05 show is being undermined only by the handoff.
- *Mutable state stored, generated, or derived?* Generated (as now) for facts; derived from `git log` for "where we are" (F04). Hand-written only for open decisions.
- *Shared archive for decisions and measured facts?* Current split (GAMES + frozen eras) is fine; the same grep keys work for both.
- *300-character limit?* Too tight and too broad. Enforce a warning at ~400 for always-load files only. Archives are grepped, not read; 1.2-1.4 KB max lines in `history/` are acceptable, but lines >2,000 in live files (GAMES: 2) should be split.
- *Single-file canonical?* Keep. The dependency is real (every tool pins the path and md5; `strip-hash` and fingerprints rely on it). Cost is mitigated by CODEMAP.
- *Generated symbol registry vs manual?* CODEMAP already is generated; do not add a second index. Revisit only after F16 measurement.
- *Lint inside proof battery?* Already in `verify --quick`; correct place.
- *12k onboarding budget?* Realistic and already met for most tasks (3.0k orient, ~9.5k edit). Delivery tasks currently exceed it (F02).
- *Work without reading canonical whole?* Yes via CODEMAP; not verified end to end by a live task here.

## 7. Preserve existing strengths

1. **One canonical file, LF enforced** by `.gitattributes` (md5/fingerprint stability). Changing it breaks every pin.
2. **`README.md` as router only**; resist re-growing it.
3. **Generated, checked state** (`STATE.md`, `CODEMAP.md`, nav block) with `--check` modes.
4. **`verify.mjs` + JSON verdicts + `ALL PASS`-style proof output.** Keep human lines and machine line together.
5. **`tools/manifest.json` with `ownerOnly`**, which structurally blocks agents from running `measure.mjs` (rule 2). Keep.
6. **Tagged-removal and no-force-push rules**, and `docs/planned/` separation.
7. **`.qa/` name.** Evaluated and closed at #786; changing it costs ~446 string edits for no agent benefit.
8. **Frozen history** being verbatim; do not rewrite or reflow it beyond what `docreflow` already does.

## 8. Implementation roadmap

| Phase | Change (type) | Files | Verified by |
|---|---|---|---|
| 1 | **Accounting** (doc/tool): add handoff files to STATE cost table; gen-state asserts every `docs/**/*.md` is listed. Remove `scripts/.gitkeep`. Drop or lint the "7 checks" literal (F01, F08, F10) | `tools/gen-state.mjs`, `STATE.md`, `AGENTS.md`, `HANDOFF.md`, `scripts/.gitkeep` | `verify --quick` PASS; STATE lists 14 docs |
| 2 | **Lint coverage** (tool): handoff lint profile: header, refs, md5, max line length, size budget; warning for >400-char lines in always-load tier (F05, F07) | `tools/lint-docs.mjs`, `tools/lib/docset.mjs` | lint reports handoff files in scope; deliberate bad ref makes it fail |
| 3 | **Handoff split** (structural, needs D1): create RUNBOOK/DELIVERY/STATUS/archive, router HANDOFF.md, update AGENTS orient/step 5 pointers, freeze BATCH3 (F02, F03, F04) | `docs/handoff/*`, `AGENTS.md`, `README.md`, lint glob | verify PASS; no broken refs; DELIVERY <=9k tok; STATUS <=2k |
| 4 | **Rotation + baseline metadata** (tool/doc): GAMES size budget + freeze procedure; baseline records canonical md5/stamp (F06, F11, F12) | `tools/*`, `.qa/fingerprint.mjs`, `.qa/BASELINE`, baseline JSON | `fingerprint --compare` prints recorded md5; still exit 0 on current build |
| 5 | **Optional:** loader annotations (F14), tool-placement rule (F13), canonical comment pass after measurement (F16), placeholder dir decision (F09) | manifest, canonical | `strip-hash` PASS, fingerprints 8/8, one `verify --battery` |

Ordering rationale: Phases 1-2 first because they are cheap and make later changes checkable. Phase 3 is the real fix and depends on the human decision D1. Phase 5 touches the canonical and should wait for any feature work to settle. All phases are independent of feature development except the canonical part of Phase 5.

## 9. Before/after metrics

Method: chars/4 for tokens (**estimate**); counts via script on commit `4584583` (**measured**). Re-run with a documented script after changes.

| Metric | Baseline | Target | Verify |
|---|---|---|---|
| Orient cost (AGENTS+STATE) | 3.0k tok (measured chars/4) | <=3.5k | gen-state table |
| Edit-session cost (+LAWS+CODEMAP) | ~9.5k tok | <=10k | same |
| Delivery-session doc cost | 91k (whole HANDOFF) or ~8k+ (if slicing §6) | <=9k | size of DELIVERY.md |
| Total docs tokens | ~348k | not a target; history is grep-only | STATE table |
| Handoff-dir tokens | ~140k | <=20k live + archive | STATE table |
| Docs absent from STATE cost table | 2 | 0 | gen-state assertion |
| Lines >2,000 chars: GAMES / HANDOFF / BATCH3 / SPEC | 2 / 52 / 8 / 1 | 0 in live files; archives allowed | script |
| Lines >300 chars in AGENTS/LAWS/CODEMAP/STATE | 7 / 9 / 3 / 1 | 0 warnings at 400 | lint |
| `verify --quick` checks / result | 7 / PASS | same | JSON |
| Hand-copied derived facts known | 2 ("7 checks" in two docs) + HANDOFF §10 hashes | 0 | lint |
| Contradictory instructions | none found in what I read (reading order and baseline now single-sourced) | 0 | review, not measured |
| Canonical tokens | ~105k; 29.8% whole-line comments | decide after F16 measurement | script |

Not measured: number of files an agent actually opens per task (needs live task traces), contradictions inside unread files.

## 10. Cross-agent handoff prompt (self-contained)

> **Task.** In repo `henty2343/arena-engine` (base commit `4584583`, branch `main`), implement the documentation/tooling changes below. Deliver per `AGENTS.md` step 5 and `docs/handoff/HANDOFF.md` §6 (one artifact, owner pushes, per-file md5 gate). Propose first and wait for the owner's go; never run `measure.mjs`; do not split, rename, or edit the canonical `previews/spinclash-preview.html` (md5 `5de162de46eb4fa3204e3ee636f2aff3`, must not change); do not rename `.qa/`.
>
> **Context.** AI-agent-first repo. Entry docs are already good (AGENTS+STATE ~3k tokens). Facts are generated: run `docreflow -> navgen -> gen-codemap -> gen-state -> verify --quick` after doc edits. The problem is `docs/handoff/HANDOFF.md` (~91k tok; preamble 29.8k, §6 7.9k, §7 41.7k, §9 5.4k, §10 2.9k; 52 lines >2,000 chars) and `BATCH3-STATUS.md` (~48k): unlinted, headerless, omitted from STATE's cost table, and rewritten every landing.
>
> **Mandatory (Phases 1-2).**
> 1. `tools/gen-state.mjs`: include `docs/handoff/*.md` (and any `docs/**/*.md`) in the cost table with read policy `SLICE ONLY`; fail `--check` if any such file is unlisted.
> 2. `git rm scripts/.gitkeep`.
> 3. `AGENTS.md:35` and `docs/handoff/HANDOFF.md:12`: remove the literal "7 checks" (say "expect VERIFY PASS") or add a lint comparing it to `verify` output.
> 4. `tools/lint-docs.mjs`: add a handoff profile (3-line header present; refs resolve; md5 values equal canonical; warn on lines >400 chars). Files stay out of `docs/history/` and out of the history glob (control C5 must still pass).
> 5. Acceptance: `node tools/verify.mjs --quick` PASS; `node .qa/fingerprint.mjs --compare` 8/8; `node .qa/strip-hash.mjs --base canonical-prediet-2c` PASS; a temporary bad ref in a handoff file makes lint fail, then is removed.
>
> **Recommended (Phase 3, only after human decision D1).** Split HANDOFF into `HANDOFF.md` (router <1k), `RUNBOOK.md` (§0-5, §8), `DELIVERY.md` (§6, <=9k), `STATUS.md` (<=2k: open decisions + next action; derive the "last landing" from `git log`), `archive/` (§7 ledger, §9 narrative, BATCH3). Move content verbatim; do not rewrite rules. Update every pointer in `AGENTS.md`, `README.md`, `.github/copilot-instructions.md`, `tools/lint-docs.mjs`, `tools/manifest.json`. Acceptance: no broken refs; every new file has the 3-line header; `docreflow`/`navgen` idempotent; DELIVERY.md <=9k tokens; `AGENTS.md` step 5 reduced to a pointer plus the md5-gate rule.
>
> **Optional.** Baseline metadata (record canonical md5 + stamp with the baseline; `fingerprint --compare` prints them; keep exit codes). GAMES.md size budget with lint warning. `loader: shared|own (reason)` annotation per tool in the manifest. Tool-placement sentence. A measured comment census of the canonical before any comment edit.
>
> **Decisions requiring the owner.** D1: may handoff files be linted under a profile and an `archive/` subfolder be added (the current rule forbids them in `docs/history/`)? D2: remove empty planned directories (`packages/`, `apps/`, `games/`, `assets/fonts`, `.vscode`) until BUILD Phase 0? D3: GAMES.md freeze threshold. D4: acceptable format for baseline metadata.
>
> **Constraints.** Node only (no Python, no package.json). Do not state any check passed unless you ran it on the shipped artifact. Quote only measured numbers.

## 11. Open items and caveats

- This audit verified the doc and tooling layer and the health commands; it did not read the game code, most proofs, or the large archives. Findings about those (F14, F16) are hypotheses with the stated measurement as the first step.
- `verify --battery` was not run, so I make no claim about full-battery state.
- Numbers marked estimate use chars/4, not a model tokenizer.
