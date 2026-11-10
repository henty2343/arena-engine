# OWNER PUSH TUTORIAL — landing session 6 on `spinclash-item-three-triage-80aa6`

*Written by the session-6 agent, for bash in VS Code. Read it once, then run the blocks in order.*

## WHY THIS RECIPE (read this before you type anything)

The remote branch has **moved ahead** of your local branch: the connected GitHub App wrote
session 6's commits there (this sandbox had no git credentials, so `git push` was impossible).
Two consequences:

| Your local tip | What it holds | What happens if you push it |
|---|---|---|
| `64f2ef7` | the handoff-name correction **only** — NOT items 4–7's code | `git push` → **rejected** (non-fast-forward) |
| the same, with `--force` | ditto | **silently reverts items 4–7 off the branch** — the code changes disappear from the remote |

So: **merge first, then push.** Never force-push this branch.

The only thing the merge cannot bring you is `docs/GAMES.md`'s new entries (#723–#727): the file
is ~690KB and the App's tool-call payload cap is 512KiB, and a file must be written whole. Its
**delta is 38.8KB** and travels as `scratch/triage/games-entries.patch`, which arrives *with* the
merge.

---

## STEP 0 — get oriented (1 min)

Open the terminal in VS Code: **Ctrl+`** (backtick) → pick your shell → `cd` into the repo:

```bash
cd /path/to/arena-engine          # ← yours; find it with: ls -d ~/repos/arena-engine ~/arena-engine
```

Confirm you are on the right branch and that nothing is half-done:

```bash
git rev-parse --abbrev-ref HEAD     # expect: spinclash-item-three-triage-80aa6
git status                          # expect: nothing to commit, working tree clean
```

### STEP 0a — IF IT SAYS `main` (or any other branch)

**Do not push from `main`.** The work belongs on `spinclash-item-three-triage-80aa6`, and the
push command below names that branch explicitly — but the merge, the patch and the commit must
happen **on that branch**, so switch to it first.

```bash
git branch -a                 # what exists locally?
git status                    # clean? (a dirty tree can block the switch)
```

**If `spinclash-item-three-triage-80aa6` is listed** (it usually is, with your local tip
`64f2ef7` on it):

```bash
git checkout spinclash-item-three-triage-80aa6
git log --oneline -1          # expect: 64f2ef7 ... (the handoff-name correction)
```

**If it is NOT listed** (you never had the branch locally):

```bash
git fetch origin
git checkout -b spinclash-item-three-triage-80aa6 origin/spinclash-item-three-triage-80aa6
```

That is SAFE even though it skips your local `64f2ef7`: the remote's lineage already carries the
same handoff-name correction (the App's own commit for it), so nothing is lost.

Either way you end on the right branch with a clean tree — then continue at **STEP 1**.

If `git status` shows edits you want to keep, park them first:

```bash
git stash push -m "wip before session-6 push"
```

(`scratch/` is gitignored, so untracked scratch files are NOT stashed — leave them alone.)

## STEP 1 — fetch the App's commits

```bash
git fetch origin
```

**Good output:** `From https://github.com/henty2343/arena-engine` … a line like
`556e34c..9c48a44  spinclash-item-three-triage-80aa6 -> origin/spinclash-item-three-triage-80aa6`.

## STEP 2 — look before you leap (dry run)

```bash
git log --oneline HEAD..origin/spinclash-item-three-triage-80aa6
```

**Good output:** ~8 lines — the App's commits for menu items 4, 5, 6, the close-out, the push
mechanics, and the GAMES patch. These are the session-6 changes you are about to absorb.

## STEP 3 — merge them in

```bash
git merge --no-ff origin/spinclash-item-three-triage-80aa6
```

**Good output:** `Merge made by the 'ort' strategy.` and a list of the files that came over
(`.qa/flipproof.mjs`, `.qa/leadproof.mjs`, `.qa/lengrow-build-proof.mjs`, `README.md`,
`docs/HANDOFF.md`, the handoffs, the battery logs, `scratch/triage/games-entries.patch`).

### STEP 3a — only if it stops on a conflict

The one conflict you may hit is `scratch/HANDOFF-ITEM3-SESSION5.md` (**add/add**): your local
`64f2ef7` and the App's commit each added it, with the *same* handoff-name correction.

```bash
git checkout --ours scratch/HANDOFF-ITEM3-SESSION5.md   # ← YOUR side (the local branch)
git add -f scratch/HANDOFF-ITEM3-SESSION5.md            # -f: scratch/ is gitignored
git status                                            # expect: "all conflicts fixed but you are still merging"
git commit --no-edit
```

`git checkout --ours` is right here: both sides are the same correction, and yours is the
owner-side copy. If the merge reports any *other* conflict, stop and read the file before
resolving — do not guess.

## STEP 4 — land the GAMES entries (the one file the App couldn't carry)

```bash
git apply scratch/triage/games-entries.patch
```

**Good output:** *silence* (success). A failure here means your local `docs/GAMES.md` differs
from the remote's — see the fallback at the bottom.

Verify it landed:

```bash
grep -c "^## 2026-11-1" docs/GAMES.md          # expect: 5   (the #723-#727 headings)
git diff --stat                                 # expect: ONLY docs/GAMES.md listed
```

Optional strong check — if you saved the attached `GAMES.md` next to your repo:

```bash
diff -q ~/Downloads/GAMES.md docs/GAMES.md && echo "IDENTICAL to the session-6 file"
```

## STEP 5 — commit the GAMES entries

```bash
git add -A
git commit -m "item-3: land the GAMES entries (#723-#727) for sessions 2-6"
```

**Good output:** one new commit. (If `git add -A` complains about `scratch/`, that is the
gitignore rule, not an error — `git add -A` stages tracked files normally; only force-adding a
*new* scratch file needs `-f`.)

## STEP 6 — push (fast-forward, no force)

```bash
git push origin spinclash-item-three-triage-80aa6
```

**Good output:** `To https://github.com/henty2343/arena-engine.git
  <old>..<new>  spinclash-item-three-triage-80aa6 -> spinclash-item-three-triage-80aa6`
— a fast-forward, with **no** `forced update` line. If you see `forced update`, you typed
`--force`; abort and redo.

## STEP 7 — verify the remote really took it

```bash
git ls-remote --heads origin spinclash-item-three-triage-80aa6
```

**Good output:** one line, `refs/heads/spinclash-item-three-triage-80aa6` with a SHA **equal to**
your local tip:

```bash
git rev-parse HEAD
```

Then the content check (this is the one that matters — it is what the entries are FOR):

```bash
git show origin/spinclash-item-three-triage-80aa6:docs/GAMES.md | grep -c "#723 · THE STALE-PROOF TRIAGE BEGINS"
# expect: 1
```

If that prints `1`, the record is on the remote. PR #3 picks the new commits up automatically
(it still targets `item-three-stale-proof-triage-237df`, not `main` — keep that base in mind).

---

## IF SOMETHING GOES WRONG

| Symptom | What to run | Effect |
|---|---|---|
| merge looks wrong | `git merge --abort` | back to before STEP 3, nothing lost |
| the patch won't apply | `cp /path/to/attached/GAMES.md docs/GAMES.md` then STEP 5 | the delivered file replaces it wholesale |
| wrong commit pushed | `git reset --soft HEAD~1` | keeps the changes, undoes the commit |
| push rejected again | re-run STEP 1 then STEP 3 | someone moved the branch meanwhile |

**Never `git push --force` this branch** — your local tip does not contain items 4–7's code, so a
force-push would delete that work from the remote. If a future push of *this* branch is rejected,
merge again; do not force.

## WHAT THIS PUSH DOES **NOT** CHANGE

- **The canonical is untouched.** `previews/spinclash-preview.html` stays md5
  `e431d344347a55da51e1f4604cbeb4ed` / 5,392 lines — every session-6 proof ran against those
  bytes, and the md5 was re-verified after every one of the ten runs.
- **`measure.mjs` never ran** (it does not run without the owner's explicit go).
- **The next open item** is `lengrow-bake --verify`, which exits 2 on purpose: the roster has two
  growing weapons since `links-r87` and the baker is spear-only. The baker must learn the chain
  case — deliberately.
