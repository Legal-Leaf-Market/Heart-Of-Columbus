// Writes the business beat's lead list after a data refresh.
//
//   node scripts/import-web.mjs ...        (refresh the listings as usual)
//   node scripts/diff-directory.mjs        (compare with the last snapshot)
//   node scripts/diff-directory.mjs --holiday 2026-11-26   (who to call about holiday hours)
//
// Writes content/drafts/business-changes-<date>.md for a reporter, then
// saves the new snapshot (content/drafts/directory-snapshot.json) so the
// next run compares with today. Drafts are never built into the site.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { directory } from '../src/data/directory.mjs';
import { WEB } from '../src/data/web.mjs';
import { snapshotOf, diffDirectory, draftMarkdown, holidayCalls } from '../src/news/leads.mjs';

const dir = new URL('../content/drafts/', import.meta.url);
mkdirSync(dir, { recursive: true });
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Indiana/Indianapolis' }).format(new Date());
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };

if (arg('--holiday')) {
  const day = arg('--holiday');
  const list = holidayCalls(directory, day);
  const file = new URL(`holiday-hours-${day}.md`, dir);
  writeFileSync(file, `---\ndraft: true\nleads: true\ndate: ${today}\n---\n# Holiday hours to confirm, ${day}\n\nOur listings carry regular hours only. These ${list.length} places are usually open on that weekday. Call each one; publish only what they tell you, with the date you called and "call ahead."\n\n${list.map((b) => `- [ ] [${b.name}](/b/${b.slug}/), ${b.phone}`).join('\n')}\n`);
  console.log(`Wrote ${file.pathname}: ${list.length} calls`);
  process.exit(0);
}

const snapFile = new URL('directory-snapshot.json', dir);
const before = existsSync(snapFile) ? JSON.parse(readFileSync(snapFile, "utf8")) : null;
const after = Object.fromEntries(directory.map((b) => [b.slug, snapshotOf(b)]));
if (before) for (const [slug, w] of Object.entries(WEB)) if (w.closed && before[slug] && !after[slug]) after[slug] = { ...before[slug], closed: true };
// One listing per line, so the snapshot's git diff reads like the change list.
const snapshotText = () => `{"date":${JSON.stringify(today)},"businesses":{\n${Object.entries(after).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n')}\n}}\n`;

if (!before) {
  writeFileSync(snapFile, snapshotText());
  console.log(`First run: saved a snapshot of ${directory.length} listings. Run again after the next refresh.`);
} else {
  // Closed listings stay in the snapshot so a closing is reported once, not every run.
  const d = diffDirectory(before.businesses, after);
  const file = new URL(`business-changes-${today}.md`, dir);
  writeFileSync(file, draftMarkdown(d, { date: today, since: before.date }));
  writeFileSync(snapFile, snapshotText());
  console.log(`Wrote ${file.pathname}`);
}
