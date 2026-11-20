#!/usr/bin/env node
/* tools/lint-controls.mjs — NEGATIVE CONTROLS for the docs lint.
 *
 * THE REPO'S OWN RULE (docs/handoff/RUNBOOK.md s8): "New lint check => negative controls (one
 * mutation per control + a passing control). 3c ran 9 + C9."
 *
 * A lint that never fails is not a lint. This harness proves each new check actually fires: it
 * copies the tree to a temp dir, applies ONE mutation per check, runs the lint there, and asserts
 * that the lint REPORTS THE EXPECTED ERROR. The repository itself is never touched - the copy is
 * made with fs.cpSync into os.tmpdir() and removed afterwards, so a crash cannot leave the working
 * tree dirty.
 *
 * Usage: node tools/lint-controls.mjs [--json]
 * Exit 0 = every control fired as designed; 1 = a control did NOT fire (the check is vacuous).
 */
import { cpSync, mkdirSync, mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonOnly = process.argv.includes('--json');

/* Each control: name, the file to mutate, how to mutate it, the check it exercises, and a substring
 * that MUST appear in the lint's error output. */
const CONTROLS = [
  {
    name: 'retired-rule (D-01)',
    file: 'docs/GAMES.md',
    expect: 'states a retired rule as live',
    mutate: (s) => s.replace('## Current state', '## Current state\n\nThe shield cannot damage at all.'),
  },
  {
    name: 'law tally is derived (D-02)',
    file: 'docs/handoff/RUNBOOK.md',
    expect: 'quotes the law tally',
    mutate: (s) => s.replace('## 3. Orientation', '## 3. Orientation\n\nTally: 9 probed, 16 partial, 1 owner-run only, 0 unprobed.'),
  },
  {
    name: 'the weapon-trait membership is derived (2026-11-19)',
    file: 'docs/RECIPES.md',
    expect: 'the canonical derives',
    /* The membership is not typed: it is read out of the canonical's weapon rows. This control adds a
     * weapon to the list that the canonical says is already designed - the lint must catch it. */
    mutate: (s) => s.replace('`hammer`, `axe`', '`hammer`, `axe`, `wand`'),
  },
  {
    name: 'the progress count must not creep back (2026-11-19)',
    file: 'docs/GAMES.md',
    expect: 'carries the weapon-trait progress count',
    /* A project-progress counter is not a law and must not reappear in a document; the membership in
     * docs/RECIPES.md is the one place it is allowed to live. */
    mutate: (s) => s.replace('## Current state', '## Current state\n\n14 of 22 weapon traits landed.'),
  },
  {
    name: 'path resolves where it is written (D-05)',
    file: 'AGENTS.md',
    expect: 'references missing path',
    mutate: (s) => s + '\n\nSee `CONTRACT.md` for the interface.\n',
  },
  {
    name: 'section pointer exists (D-04)',
    file: 'docs/GAMES.md',
    expect: 'has no such heading',
    mutate: (s) => s.replace('## Current state', '## Current state\n\nSee `docs/LAWS.md` §Weapon art table for the roster.'),
  },
  {
    name: 'the prose cap is enforced (2026-11-19)',
    file: 'docs/GAMES.md',
    expect: 'over the 300-char prose cap',
    /* The 300-character prose rule was stated in the repo and enforced nowhere, for two audits. The
     * control adds a long prose line and requires the lint to fire on it. */
    /* The line must be WRAPPABLE by the shared wrapper (it breaks at sentence ends), because the lint
     * distinguishes "a tool could split this" (an error) from "this resists wrapping" (a warning that
     * needs an author). A control that mutates an unwrappable line proves nothing. */
    mutate: (s) => s.replace('## Current state',
      '## Current state\n\n' + 'This sentence is filler prose for the prose-cap control. '.repeat(8) + '\n'),
  },
  {
    name: 'manifest covers scripts/ (D-10)',
    file: 'scripts/rogue-tool.mjs',
    create: true,
    expect: 'does not register the tool scripts/rogue-tool.mjs',
    mutate: () => '// a tool nobody registered\n',
  },
  {
    name: 'planned docs carry a banner (D-15)',
    file: 'docs/planned/BUILD.md',
    expect: 'has no "STATUS: PLANNED" banner',
    mutate: (s) => s.replace(/^> \*\*STATUS:.*$/m, '> (banner removed by the control)'),
  },
  {
    name: 'copilot file points, never duplicates',
    file: '.github/copilot-instructions.md',
    expect: 'may POINT at AGENTS.md',
    mutate: (s) => s + '\n- Never squash the geometry tolerances when re-baking the polygon rows.\n',
  },
  {
    name: 'laws.json agrees with LAWS.md',
    file: 'docs/laws.json',
    expect: 'docs/laws.json says',
    /* The mutation must match the file as it is WRITTEN: laws.json is pretty-printed, so the id and
     * the status are on different lines. A control whose mutation no longer lands is VACUOUS - it
     * reports "the mutation did not change the file" and proves nothing. */
    mutate: (s) => s.replace(/("id":\s*"C1"[\s\S]{0,120}?"status":\s*")partial(")/, '$1probed$2'),
  },
  {
    name: "the canonical's axis inventory matches its rows (2026-11-19)",
    file: 'previews/spinclash-preview.html',
    expect: 'does not name the trait axis',
    /* The REGISTRY block is what every agent reads first when it adds a trait. It had drifted: six
     * trait axes named, nine declared. The control removes one line from the registry and requires
     * the lint to catch the disagreement with the rows. */
    mutate: (s) => s.replace(/^ \* trait\.mult   shot-cadence growth rate.*\n/m, ''),
  },
  {
    name: 'no document carries decision archaeology (2026-11-19)',
    file: 'docs/LAWS.md',
    expect: 'carries decision archaeology',
    /* The doctrine is "current docs state current rules; git history holds history". The check is the
     * derub's own catalogue run over the prose, so a line the derub would rewrite is an error. The
     * control puts one owner quote back into a live document and requires the lint to name it. */
    mutate: (s) => s.replace('## Battle structure',
      '## Battle structure\n\nThe round timer was (owner word: "i want it slower") set to 5s.'),
  },
  {
    name: 'a designed trait must not wear the placeholder label',
    file: 'previews/spinclash-preview.html',
    expect: 'carries a designed trait but its line is still the generic placeholder',
    /* The membership is decided by the TRAIT, and the line is the label the audience reads. A weapon
     * whose trait is designed but whose line is still the generic placeholder sentence is invisible on
     * screen. The control strips the spear's line back to the generic one - its trait stays designed,
     * so the membership is unchanged - and the lint must catch the label. */
    mutate: (s) => s.replace("line: 'grows 9.6% longer per damaging hit'", "line: 'gains damage per damaging hit'"),
  },
  {
    name: 'a retired rule must not be quoted as a live count',
    file: 'docs/GAMES.md',
    expect: 'quotes a stale count',
    mutate: (s) => s.replace('## Current state', '## Current state\n\nSeven shot-law checks are still live.'),
  },
];

const results = [];

for (const c of CONTROLS) {
  const tmp = mkdtempSync(path.join(tmpdir(), 'lint-ctl-'));
  let fired = false, detail = '';
  try {
    cpSync(root, tmp, {
      recursive: true,
      filter: (src) => {
        const rel = path.relative(root, src);
        if (!rel) return true;
        const top = rel.split(path.sep)[0];
        return top !== '.git' && top !== 'scratch' && top !== 'node_modules';
      },
    });
    const target = path.join(tmp, c.file);
    if (c.create) {
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, c.mutate(''));
      const r0 = spawnSync(process.execPath, ['tools/lint-docs.mjs', '--json'], { cwd: tmp, encoding: 'utf8' });
      const out0 = (r0.stdout || '') + (r0.stderr || '');
      let e0 = [];
      try { e0 = JSON.parse(out0.trim().split('\n').filter(l => l.trim().startsWith('{')).pop()).errors || []; } catch { e0 = []; }
      fired = r0.status !== 0 && e0.some(e => e.includes(c.expect));
      if (!fired) detail = `lint exited ${r0.status} but did not report "${c.expect}". Errors seen: ${JSON.stringify(e0.slice(0, 6))}`;
    } else if (!existsSync(target)) {
      detail = `target file missing in the copy: ${c.file}`;
    } else {
      const before = readFileSync(target, 'utf8');
      const after = c.mutate(before);
      if (after === before) {
        detail = `the mutation did not change ${c.file} - the control is stale`;
      } else {
        writeFileSync(target, after);
        const r = spawnSync(process.execPath, ['tools/lint-docs.mjs', '--json'], { cwd: tmp, encoding: 'utf8' });
        const out = (r.stdout || '') + (r.stderr || '');
        let errors = [];
        try { errors = JSON.parse(out.trim().split('\n').filter(l => l.trim().startsWith('{')).pop()).errors || []; }
        catch { errors = []; }
        fired = r.status !== 0 && errors.some(e => e.includes(c.expect));
        if (!fired) {
          detail = fired ? '' :
            `lint exited ${r.status} but did not report "${c.expect}". Errors seen: ${JSON.stringify(errors.slice(0, 6))}`;
        }
      }
    }
  } catch (e) {
    detail = 'control threw: ' + e.message;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  results.push({ name: c.name, file: c.file, expect: c.expect, fired, detail });
}

/* The PASSING CONTROL: an unmutated copy must still pass. A lint that fails on the clean tree is
 * broken, and every other control would then be meaningless. */
const tmp2 = mkdtempSync(path.join(tmpdir(), 'lint-ctl-pass-'));
let passOk = false, passDetail = '';
try {
  cpSync(root, tmp2, { recursive: true, filter: (src) => {
    const rel = path.relative(root, src); if (!rel) return true;
    const top = rel.split(path.sep)[0];
    return top !== '.git' && top !== 'scratch' && top !== 'node_modules';
  }});
  const r = spawnSync(process.execPath, ['tools/lint-docs.mjs', '--json'], { cwd: tmp2, encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  let errors = [];
  try { errors = JSON.parse(out.trim().split('\n').filter(l => l.trim().startsWith('{')).pop()).errors || []; }
  catch { errors = []; }
  passOk = r.status === 0;
  if (!passOk) passDetail = `the clean tree fails the lint: ${JSON.stringify(errors.slice(0, 6))}`;
} catch (e) {
  passDetail = 'passing control threw: ' + e.message;
} finally {
  rmSync(tmp2, { recursive: true, force: true });
}

const ok = results.every(r => r.fired) && passOk;
const verdict = { check: 'lint-controls', ok, controls: results, passingControl: { ok: passOk, detail: passDetail } };
if (jsonOnly) console.log(JSON.stringify(verdict));
else {
  for (const r of results) console.log(`  ${r.fired ? 'FIRED  ' : 'VACUOUS'} ${r.name.padEnd(46)} ${r.fired ? '' : '-> ' + r.detail}`);
  console.log(`  ${passOk ? 'PASS   ' : 'FAIL   '} passing control (an unmutated tree must still pass the lint)${passOk ? '' : ' -> ' + passDetail}`);
  console.log(ok ? `LINT CONTROLS PASS — ${results.length} control(s) fired as designed` : 'LINT CONTROLS FAIL');
  console.log(JSON.stringify(verdict));
}
process.exit(ok ? 0 : 1);
