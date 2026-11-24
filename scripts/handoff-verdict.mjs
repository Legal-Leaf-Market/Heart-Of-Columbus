// node scripts/handoff-verdict.mjs <tonight.json> [last-night.json] [report.md]
// Reads a run of scripts/check-handoff.mjs and says which shops in the one
// cart a shopper would find broken tonight, and which of those are new since
// the last run. Writes a short Markdown report and exits 1 when anything is
// broken, so the nightly workflow goes red and opens an issue.
//
// A shop is broken when the deployed /api/shop could not read it, when it read
// no products at all, or when one of our WooCommerce add-to-cart links did not
// put the item in the shop's own cart. A catalog that shrank by more than half
// since last night (from 10 or more products) is flagged too: a store closing
// its catalog usually looks like that before it looks like zero.
import { readFileSync, writeFileSync } from 'node:fs';

export function problemsOf(row, before) {
  const out = [];
  if (row.error || (row.api && row.api !== 200)) out.push(`could not be read (${row.api || 'no answer'}${row.error ? `: ${row.error}` : ''})`);
  else if (!row.items) out.push('read no products');
  for (const a of row.adds || []) if (!a.pass) out.push(`add to cart failed for "${a.item}"${a.option ? ` (${a.option})` : ''}${a.notice ? `: ${a.notice}` : ''}`);
  if (before && before.items >= 10 && row.items > 0 && row.items < before.items / 2) out.push(`catalog shrank from ${before.items} to ${row.items} products`);
  return out;
}

export function verdict(now, last) {
  const broken = {}, fresh = [];
  for (const [slug, row] of Object.entries(now.shops || {})) {
    const before = last && last.shops ? last.shops[slug] : null;
    const p = problemsOf(row, before);
    if (!p.length) continue;
    broken[slug] = p;
    if (!before || !problemsOf(before, null).length) fresh.push(slug);
  }
  const total = Object.keys(now.shops || {}).length;
  return { total, healthy: total - Object.keys(broken).length, broken, fresh };
}

export function report(v, now) {
  const lines = [`Cart check of ${now.checked} against ${now.site}: ${v.healthy} of ${v.total} shops work.`, ''];
  if (!Object.keys(v.broken).length) return lines.concat('Every shop in the one cart read and handed off.').join('\n') + '\n';
  for (const [slug, p] of Object.entries(v.broken)) lines.push(`- **${slug}**${v.fresh.includes(slug) ? ' (new since the last run)' : ''}: ${p.join('; ')}`);
  lines.push('', 'Open the shop\'s own website first: a store that closed its catalog or changed platform needs the next store crawl, not a code fix. Full results are on the `checks/handoff` branch.');
  return lines.join('\n') + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [nowPath, lastPath, mdPath] = process.argv.slice(2);
  const now = JSON.parse(readFileSync(nowPath, 'utf8'));
  let last = null;
  try { if (lastPath) last = JSON.parse(readFileSync(lastPath, 'utf8')); } catch { /* first run */ }
  const v = verdict(now, last);
  const md = report(v, now);
  if (mdPath) writeFileSync(mdPath, md);
  console.log(md);
  process.exit(Object.keys(v.broken).length ? 1 : 0);
}
