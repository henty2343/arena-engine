/* tools/lib/docset.mjs — the GAMES record set: the live file plus the frozen era files.
 * B3C: docs/GAMES.md holds the live record; docs/history/*.md hold eras moved out verbatim.
 * Sorted glob, so a new era file is picked up by every doc tool with no edit here. */
import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
export const LIVE = 'docs/GAMES.md';
export const HIST_DIR = 'docs/history';
export function historyFiles(root) {
  const d = path.join(root, HIST_DIR);
  return existsSync(d) ? readdirSync(d).filter(f => f.endsWith('.md')).sort().map(f => HIST_DIR + '/' + f) : [];
}
export function recordFiles(root) { return [LIVE, ...historyFiles(root)]; }
