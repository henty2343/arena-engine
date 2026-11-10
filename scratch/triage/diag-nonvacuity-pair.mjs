/* scratch/triage/diag-nonvacuity-pair.mjs — mutation test of the RE-SEEDED static tripwire in
 * .qa/pair-proof.mjs (section I, menu item 3 fix, session 5, 2026-11-11).
 * Law: a probe that measured nothing cannot claim PASS. The re-seeded balance-aware scan must still
 * FIRE on real slot-keyed violations. Each scenario injects one break into the canonical text passed
 * to the scanner ONLY (canonical file untouched), runs the exact shipped scan+allowed() logic from
 * the patched pair-proof source, and requires the verdict to flip FALSE under the break.
 * Writes nothing; runs no measure.mjs.
 */
import { readFileSync } from 'node:fs';

const html = readFileSync('previews/spinclash-preview.html', 'utf8');

/* extract the shipped pieces verbatim from the PATCHED proof file (no drift possible) */
const proof = readFileSync('.qa/pair-proof.mjs', 'utf8');
const grab = (startMark, endMark, name) => {
  const a = proof.indexOf(startMark), b = proof.indexOf(endMark, a);
  if (a === -1 || b === -1) { console.error(`cannot locate ${name} in .qa/pair-proof.mjs — aborting`); process.exit(1); }
  return proof.slice(a, b);
};
const stripperSrc = grab('const stripped = (() => {', '\n  const reads = [];', 'stripper');
const scanSrc = grab('const reads = [];', '  /* Allowed:', 'scan');
const allowedSrc = grab('const allowed = (r) =>', '  const bad = reads.filter', 'allowed');

const runScan = (text) => new Function('htmlSrc', `
  const html = htmlSrc;
  ${stripperSrc}
  ${scanSrc}
  ${allowedSrc}
  const bad = reads.filter((r) => !allowed(r));
  return { count: reads.length, bad: bad.length, floorOk: reads.length >= 20,
           verdict: bad.length === 0 && reads.length >= 20 };
`)(text);

const scenarios = [
  { name: 'B1 slot-keyed COLS read (burnfix shape)',
    inject: (t) => t.replace('const oc = COLS[(G.fighters[p.o] || { idx: p.o }).idx];',
                             'const oc = COLS[p.o];') },
  { name: 'B2 slot-keyed COLS read (st.o shape)',
    inject: (t) => t.replace('COLS[G.cast[st.o]]', 'COLS[st.o]') },
  { name: 'B3 slot-keyed SKILL_SHORT read',
    inject: (t) => t.replace('skill: SKILL_SHORT[i]', 'skill: SKILL_SHORT[slot]') },
  { name: 'B4 slot-keyed FIGHTERS read',
    inject: (t) => t.replace('FIGHTERS[f.idx]', 'FIGHTERS[f.slot]') },
  /* B5: the class of bug the OLD scanner could not even see — a read whose index nests deeper.
   * Old regex truncated it to "(G.fighters[p.o" and flagged correct code; new scan reads the full
   * extent "...).idx" and allows it. Witness below checks BOTH halves: old flags it, new does not. */
  { name: 'B5 nested-extent witness (old truncates -> false flag; new reads full -> allowed)',
    inject: (t) => t.replace('const oc = COLS[(G.fighters[p.o] || { idx: p.o }).idx];',
                             'const oc = COLS[(G.fighters[p.o] || { idx: p.o }).idx + (f.idx)];'),
    expectNewBad: 0 },
];

const OLD_RE = /\b(?:COLS|TINTS|FIGHTERS|SKILL_SHORT)\[([^\]]*)\]/g;
const oldScan = (text) => {
  let out = '', i = 0, mode = 0; const q = [];   // same stripper semantics
  while (i < text.length) {
    const c = text[i], d = text[i + 1];
    if (mode === 0) {
      if (c === '/' && d === '/') { mode = 1; out += '  '; i += 2; continue; }
      if (c === '/' && d === '*') { mode = 2; out += '  '; i += 2; continue; }
      if (c === '"' || c === "'" || c === '`') { mode = 3; q.push(c); out += c; i++; continue; }
      out += c; i++; continue;
    }
    if (mode === 1) { if (c === '\n') { mode = 0; out += c; } else out += ' '; i++; continue; }
    if (mode === 2) { if (c === '*' && d === '/') { mode = 0; out += '  '; i += 2; continue; } out += (c === '\n' ? c : ' '); i++; continue; }
    out += c;
    if (c === '\\') { out += text[i + 1] || ''; i += 2; continue; }
    if (c === q[q.length - 1]) { q.pop(); mode = 0; }
    i++;
  }
  const slines = out.split('\n');
  const reads = [];
  slines.forEach((l, n) => { for (const m of l.matchAll(OLD_RE)) reads.push({ n: n + 1, idx: m[1].trim(), line: l.trim() }); });
  const allowed = (r) => /idx|cast/.test(r.idx) || r.idx === 'ci' || (r.idx === 'i' && /FIGHTERS\.map/.test(r.line));
  return reads.filter((r) => !allowed(r)).length;
};

let good = 0, total = 0;
const base = runScan(html);
console.log(`BASELINE clean canonical: ${base.count} reads audited, ${base.bad} bad, verdict=${base.verdict}, floor(>=20)=${base.floorOk}`);
if (!base.verdict) { console.log('ABORT: baseline not green on clean canonical — nothing to falsify.'); process.exit(1); }

for (const s of scenarios) {
  total++;
  const mutated = s.inject(html);
  if (mutated === html) { console.log(`  INJECT-FAILED ${s.name}: anchor not found — this is not a pass`); continue; }
  const r = runScan(mutated);
  if (s.expectNewBad !== undefined) {
    /* B5: the new scanner must NOT flag it (reads full extent, idx token present) while the OLD
     * scanner DOES (truncation artifact). Both halves required — that is the false-positive proof. */
    const oldBadHere = oldScan(mutated);
    const ok = r.bad === s.expectNewBad && oldBadHere >= 1;
    if (ok) good++;
    console.log(`  ${ok ? 'WITNESS-OK ' : 'WITNESS-BAD'} ${s.name} — new bad=${r.bad} (want ${s.expectNewBad}), old bad=${oldBadHere} (want >=1)`);
    continue;
  }
  const fired = !r.verdict;
  if (fired) good++;
  console.log(`  ${fired ? 'NON-VACUOUS' : 'VACUOUS   '} ${s.name} — reads=${r.count}, bad=${r.bad}, verdict=${r.verdict}`);
}

/* regression witness: prove the defect this patch fixes was real — old scanner flags 2 false
 * positives on the CLEAN canonical; new scanner flags 0; both agree the audit size stays >= 20. */
total++;
{
  const oldBad = oldScan(html);
  const okWitness = oldBad === 2 && base.bad === 0 && base.count >= 20;
  if (okWitness) good++;
  console.log(`  ${okWitness ? 'WITNESS-OK ' : 'WITNESS-BAD'} old-vs-new delta on clean canonical — old scanner bad=${oldBad} (the 2 burnfix false positives), new bad=${base.bad}, new count=${base.count} (>=20 honest)`);
}

console.log(`\nPAIR-TRIPWIRE NON-VACUITY VERDICT: ${good}/${total} scenarios proven falsifiable/witnessed.`);
if (good !== total) process.exit(1);
