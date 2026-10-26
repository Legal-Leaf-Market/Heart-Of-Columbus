// Builds the morning newsletter for an editor to review:
//   node scripts/morning-edition.mjs [YYYY-MM-DD]
// Writes content/drafts/morning-<date>.html. The editor reads it, fixes
// anything, and sends it through the newsletter service.
// TODO(owner): once a service is chosen, add its API call here behind a
// --send flag that refuses to run without the editor's go-ahead.
import { writeFileSync, mkdirSync } from 'node:fs';
import { morningEdition } from '../src/news/morning.mjs';

const date = process.argv[2] || new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Indiana/Indianapolis' }).format(new Date());
const dir = new URL('../content/drafts/', import.meta.url);
mkdirSync(dir, { recursive: true });
const ed = morningEdition({ date });
const file = new URL(`morning-${date}.html`, dir);
writeFileSync(file, ed.html);
console.log(`Wrote ${file.pathname}: ${ed.stories.length} stories, ${ed.events.length} events, ${ed.early.length} open early. An editor reviews it before it goes out.`);
