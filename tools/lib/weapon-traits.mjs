/* tools/lib/weapon-traits.mjs — WHO HAS A DESIGNED WEAPON TRAIT, DERIVED FROM THE CODE.
 *
 * WHY (audit follow-up, 2026-11-19). The repo pinned "14 of 22 weapon traits landed" as a hand-typed
 * number in docs/LAWS.md, and `tools/lint-docs.mjs` only checked that OTHER documents agreed with
 * LAWS.md — nothing checked it against the code. It was also in the wrong file: a project-progress
 * counter is not a law, and the owner's own ruling is that the repo holds current rules, not history.
 *
 * But the MEMBERSHIP is derivable, and the derivation reproduces the owner's count exactly:
 *
 *   A weapon is LANDED when its on-screen `line` says something specific about its trait.
 *   The ones that are not designed yet still carry the generic placeholder line
 *   ("... gains damage per hit"), which is the default text for a plain damage-growth trait.
 *
 * That rule yields exactly 8 not-yet-designed (hammer, axe, sword, mace, nunchaku, scythe, katana,
 * orb) and 14 landed — the same 8 a cold-start agent derived by hand from the 22 rows, and the same
 * count the owner had. It also has the right failure mode: design the hammer's line and the hammer
 * becomes landed automatically, so the list cannot silently rot.
 *
 * The list itself lives in docs/RECIPES.md, next to the recipe that uses it, and
 * tools/lint-docs.mjs checks the two against each other on every run.
 */
import { readFileSync } from 'node:fs';

/* The placeholder text: a line that ends with the generic damage-growth description. */
export const GENERIC_LINE = /gains damage per (?:damaging )?hit\.?$/;

/* The roster rows live between `const WEAPONS = {` and the id list that follows it. */
export function weaponRows(src) {
  const start = src.indexOf('const WEAPONS = {');
  if (start < 0) return [];
  const end = src.indexOf('const WEAPON_IDS', start);
  const block = src.slice(start, end < 0 ? undefined : end);
  const rows = [...block.matchAll(/^ {4}(\w+):\s*\{/gm)];
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const from = rows[i].index;
    const to = i + 1 < rows.length ? rows[i + 1].index : block.length;
    out.push({ name: rows[i][1], body: block.slice(from, to) });
  }
  return out;
}

/* The on-screen line of a weapon row. */
export function weaponLine(body) {
  const m = body.match(/\bline:\s*'([^']*)'/);
  return m ? m[1].trim() : '';
}

/* THE PLACEHOLDER TRAIT - what an UNDESIGNED weapon carries: no spin growth, the plain +0.7 damage
 * growth, and no other axis. A weapon is DESIGNED when its trait differs from this.
 *
 * The membership used to be decided by the LINE (a designed weapon's line says something specific
 * about its trait; an undesigned one still carries the generic placeholder sentence). That was the
 * wrong signal, and it hid a real case: the SHIELD's line is bespoke ("parries - and cuts on touch
 * like every weapon") while its trait was still the placeholder, so the split counted the Shield as
 * landed and an agent reading the list would have skipped it. The TRAIT is the truth - it is the
 * thing that has to be designed - and the line is the label for it. */
const PLACEHOLDER_TRAIT = { spin: 0.0, dmg: 0.7 };

/* The trait object a weapon row declares, or null if it declares none. */
export function weaponTrait(body) {
  const m = body.match(/\btrait:\s*\{([^}]*)\}/);
  if (!m) return null;
  const t = {};
  for (const [, k, v] of m[1].matchAll(/(\w+)\s*:\s*(-?[\d.]+)/g)) t[k] = Number(v);
  return t;
}

/* True when the trait IS the placeholder - nothing designed about it. */
export function isPlaceholderTrait(t) {
  if (!t) return true;
  const keys = Object.keys(t).sort();
  if (keys.length !== 2 || keys[0] !== 'dmg' || keys[1] !== 'spin') return false;
  return t.spin === PLACEHOLDER_TRAIT.spin && t.dmg === PLACEHOLDER_TRAIT.dmg;
}

/* The membership: which weapons are landed, and which still need a designed trait. */
export function weaponTraitMembership(src) {
  const landed = [], blank = [];
  for (const row of weaponRows(src)) {
    (isPlaceholderTrait(weaponTrait(row.body)) ? blank : landed).push(row.name);
  }
  return { landed, blank, total: landed.length + blank.length };
}

/* The membership, read from the canonical on disk. */
export function readMembership(canonicalPath) {
  return weaponTraitMembership(readFileSync(canonicalPath, 'utf8'));
}

/* ── THE AXIS INVENTORY ──────────────────────────────────────────────────────────────────────
 * The canonical's TRAIT / SKILL REGISTRY block is the list every agent reads first when it adds a
 * trait (docs/RECIPES.md says so). It had drifted: it named six trait axes while the weapon rows
 * declare nine, and it named three shot axes (shot.damage, shot.lifespan, shot.curve) that no row
 * declares at all, while missing four live ones. A stale inventory there is worse than none - the
 * agent trusts it and writes a row the guard has never seen.
 *
 * So the inventory is DERIVED from the rows and compared with what the block says, by
 * tools/lint-docs.mjs:
 *   - an axis a row declares but the block does not name is an error;
 *   - an axis the block names that no row declares is an error (a phantom axis).
 */
export const NON_AXIS_SHOT_FIELDS = new Set(['what', 'kind', 'copy']);

/* Every field a row declares under `trait:`, `skill:` or `shot:`. */
export function weaponAxisSets(src) {
  const i = src.indexOf('const WEAPONS = {');
  const j = src.indexOf('const WEAPON_IDS', i);
  const rows = src.slice(i, j < 0 ? undefined : j);
  const grab = (key, text) => {
    const set = new Set();
    for (const m of text.matchAll(new RegExp(key + ':\\s*\\{([^}]*)\}', 'g'))) {
      for (const a of m[1].matchAll(/(\w+)\s*:/g)) set.add(a[1]);
    }
    return set;
  };
  const trait = grab('trait', rows);
  const shot = grab('shot', rows);
  const k = src.indexOf('const FIGHTERS');
  const skill = grab('skill', src.slice(k, k + 20000));
  for (const f of NON_AXIS_SHOT_FIELDS) shot.delete(f);
  return { trait, skill, shot };
}

/* The axes the REGISTRY block names, and the ones it explicitly declares NOT axes.
 *
 * The "NOT axes:" line is read separately, so a field that is genuinely a non-axis (the on-screen
 * name, the art kind, the copy rule) can be named there without being a phantom - and so that
 * putting a REAL axis on that line is caught. */
export function registryAxes(src) {
  const a = src.indexOf('TRAIT / SKILL REGISTRY');
  if (a < 0) return null;
  const b = src.indexOf('*/', a);
  if (b < 0) return null;
  const block = src.slice(a, b);
  const axisLines = [], notAxisLines = [];
  for (const line of block.split('\n')) {
    if (/NOT\s+axes/i.test(line)) notAxisLines.push(line); else axisLines.push(line);
  }
  const grab = (prefix, lines) => {
    const set = new Set();
    for (const l of lines) for (const m of l.matchAll(new RegExp('\\b' + prefix + '\\.(\\w+)', 'g'))) set.add(m[1]);
    return set;
  };
  return {
    trait: grab('trait', axisLines), skill: grab('skill', axisLines), shot: grab('shot', axisLines),
    notAxis: grab('shot', notAxisLines),
  };
}
