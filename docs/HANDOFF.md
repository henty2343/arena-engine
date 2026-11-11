# HANDOFF — repo-organization laws

Scope: repo organization ONLY. Game/engine work state lives in README.md
("Starting a new chat — checkpoint") and docs/GAMES.md — those are the authority
for anything SpinClash; this file does not supersede them.

## The laws
1. ONE canonical: `previews/spinclash-preview.html` — a single copy, in git.
   Every `.qa/` + `scratch/` default resolves `../previews/spinclash-preview.html`;
   the doc tools default to `docs/GAMES.md`. Do not repoint them.
2. Asserted-patch method for every structural edit: grep functional references
   first (links, join(...), default paths, usage examples); patch exact strings
   with expected match counts — a mismatch WARNS, never guesses; rehearse on a
   throwaway copy before touching the real tree.
3. Verify path changes statically (grep, `node --check`, rehearsal diff). Do NOT
   run the game harness to "test" a layout change. `measure.mjs` never runs
   without the owner's explicit go.
4. Token economy: pull big files via API/curl and grep/sed them; don't read
   multi-hundred-KB docs into chat.
5. Removals are owner-ruled and tagged BEFORE the cleanup commit; recover with
   `git show <tag>:<path>`. Pushes are the owner's to make.

## Layout convention
docs → `docs/` · preview artifacts → `previews/` · README stays at root.
`docs/SPEC.md`'s `## Repo` tree is the layout authority.
