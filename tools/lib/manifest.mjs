#!/usr/bin/env node
/* tools/lib/manifest.mjs - the loader and validator for tools/manifest.json (THE PROBE REGISTRY).
 *
 * Why this file exists: the proof inventory used to live in THREE places that had to be kept in step
 * by hand - the STEPS and EXPECTED arrays in scripts/run-battery.mjs, and the set of citable probes
 * that tools/lint-docs.mjs DERIVED BY REGEX-PARSING run-battery.mjs's source. That last one is the
 * brittle one: a reformatted array or a renamed file changes the law table's verdict without anyone
 * touching a law. The manifest replaces all three with one JSON file, so the inventory is data, not
 * a pattern in somebody's code.
 *
 * The manifest also answers the question an agent actually has - "which probe proves this law, and
 * may I run it?" - in one small file instead of by grepping.
 *
 * Consumers:
 *   scripts/run-battery.mjs  - the battery steps and their expected exit codes
 *   tools/lint-docs.mjs      - the law table's runnable set (the citable entries) and the
 *                              completeness check (every proof on disk is registered)
 *   tools/verify.mjs         - the health judge: its checks are the entries that carry a tier
 *                              (quick = every run, standard = the default run), plus its own
 *                              completeness row (manifestErrors)
 *
 * Ownership rules live in the data, not in this file: an entry with ownerOnly is the owner's alone
 * and an agent must never run it (measure.mjs is permanently banned - HANDOFF section 1).
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

export const MANIFEST_REL = 'tools/manifest.json';

/* The verify tiers. quick = every verify run (no sim); standard = the default run, not --quick. An
 * entry with no tier is never run by verify (the battery is separate: battery:true). */
export const TIERS = ['quick', 'standard'];

/* Where the repo's own checkers live. Every .mjs in these directories must be registered (so a new
 * checker cannot be left out of verify silently), except the judge itself. tools/lib is libraries,
 * not checks, and is not scanned. */
export const TOOL_DIRS = ['tools', 'tools/doc'];
export const TOOLS_NOT_REGISTERED = new Set(['tools/verify.mjs']);

/* Read + parse the registry. Returns null when it is missing or malformed - callers decide whether
 * that is fatal (it is, for the battery and the law lint). */
export function readManifest(root) {
  const p = path.join(root, MANIFEST_REL);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); }
  catch { return null; }
}

/* The entries the proof battery runs, as [label, argv] pairs plus the expected exit code. */
export function batterySteps(root) {
  const m = readManifest(root);
  if (!m || !Array.isArray(m.probes)) return null;
  return m.probes
    .filter(p => p.battery === true)
    .map(p => ({ name: p.name, args: [p.file, ...(p.args || [])], exit: p.exit }));
}

/* The files a law row may cite as a runnable probe (file::anchor). */
export function citableProbes(root) {
  const m = readManifest(root);
  if (!m || !Array.isArray(m.probes)) return null;
  return new Set(m.probes.filter(p => p.citable === true).map(p => p.file));
}

/* The entries verify runs for the given tiers, in manifest order, as {name, file, args, exit, tier}.
 * An ownerOnly entry or a runnable:false entry is never returned, whatever its tier says. Returns
 * null when the manifest is missing or malformed - verify then fails closed, it has no fallback list. */
export function verifySteps(root, tiers) {
  const m = readManifest(root);
  if (!m || !Array.isArray(m.probes)) return null;
  return m.probes
    .filter(p => tiers.includes(p.tier) && p.ownerOnly !== true && p.runnable !== false)
    .map(p => ({ name: p.name, file: p.file, args: p.args || [], exit: p.exit, tier: p.tier }));
}

/* Every file the registry knows about, citable or not. */
export function registeredFiles(root) {
  const m = readManifest(root);
  if (!m || !Array.isArray(m.probes)) return null;
  return new Set(m.probes.map(p => p.file));
}

/* The completeness check: the registry must cover every proof that exists on disk, and every entry
 * must point at a file that exists. Returns a list of human-readable errors (empty = healthy). */
export function manifestErrors(root) {
  const errs = [];
  const m = readManifest(root);
  if (!m) { errs.push(`${MANIFEST_REL} is missing or is not valid JSON`); return errs; }
  if (!Array.isArray(m.probes) || m.probes.length === 0) { errs.push(`${MANIFEST_REL} has no probes`); return errs; }

  const names = new Set(), files = new Set();
  for (const p of m.probes) {
    const at = `${MANIFEST_REL}: ${p && p.name ? p.name : '(unnamed)'}`;
    if (!p || typeof p !== 'object') { errs.push(`${at} is not an object`); continue; }
    if (!p.name || typeof p.name !== 'string') errs.push(`${at} has no name`);
    else if (names.has(p.name)) errs.push(`${at} repeats a name`);
    else names.add(p.name);
    if (!p.file || typeof p.file !== 'string') errs.push(`${at} has no file`);
    else {
      if (files.has(p.file)) errs.push(`${at} repeats the file ${p.file}`);
      files.add(p.file);
      if (!existsSync(path.join(root, p.file))) errs.push(`${at} points at a missing file: ${p.file}`);
    }
    if (p.tier !== undefined) {
      if (!TIERS.includes(p.tier)) errs.push(`${at} has tier ${JSON.stringify(p.tier)} - expected one of ${TIERS.join(', ')} (verify would skip it silently)`);
      else if (p.ownerOnly === true || p.runnable === false) errs.push(`${at} carries tier ${p.tier} but an agent may not run it (ownerOnly or runnable:false) - remove the tier`);
    }
    if (!Number.isInteger(p.exit)) errs.push(`${at} has no integer exit code`);
    if (typeof p.about !== 'string' || !p.about.trim()) errs.push(`${at} has no about line`);
  }

  /* Every proof on disk must be registered, or the registry goes stale silently. */
  const qaDir = path.join(root, '.qa');
  if (existsSync(qaDir)) {
    for (const f of readdirSync(qaDir).filter(f => f.endsWith('.mjs')).sort()) {
      if (!files.has(`.qa/${f}`)) errs.push(`${MANIFEST_REL} does not register the proof .qa/${f} - add it (battery: whether the battery runs it, citable: whether a law row may cite it)`);
    }
  }
  /* verify judges the quick tier; with none, it would pass having judged nothing. */
  if (!m.probes.some(p => p && p.tier === 'quick' && p.ownerOnly !== true && p.runnable !== false)) {
    errs.push(`${MANIFEST_REL} has no runnable entry with tier "quick" - verify would judge nothing`);
  }
  /* Every checker in tools/ must be registered, or verify stops covering it without anyone noticing. */
  for (const d of TOOL_DIRS) {
    const dir = path.join(root, d);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter(f => f.endsWith('.mjs')).sort()) {
      const rel = `${d}/${f}`;
      if (!files.has(rel) && !TOOLS_NOT_REGISTERED.has(rel)) errs.push(`${MANIFEST_REL} does not register the tool ${rel} - add it (tier: quick if verify should run it)`);
    }
  }
  /* The root-level tools are part of the same surface - register them too, so the registry is total. */
  for (const f of ['chromecheck.mjs', 'ingest.mjs', 'measure.mjs']) {
    if (!files.has(f)) errs.push(`${MANIFEST_REL} does not register ${f} - add it`);
  }
  return errs;
}
