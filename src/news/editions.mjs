// The newsletter's editions, written by the build to dist/newsletter/editions/
// for the next fourteen days: <date>.json holds the subject, the email HTML from
// morningEdition() and how many stories are new. netlify/functions/newsletter.mjs
// reads today's file each weekday morning and creates a DRAFT in the newsletter
// service. A person reads the draft and presses send; nothing here sends email.
import { morningEdition } from './morning.mjs';
import { localOffset } from './content.mjs';
import { PAPER } from '../data/paper.mjs';

const TZ = 'America/Indiana/Indianapolis';
const ymd = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const pretty = (date) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00Z`));

// Each edition is built as of 6 AM in Columbus on its own day.
export function edition(date, opts = {}) {
  const noon = new Date(`${date}T12:00:00Z`);
  const now = new Date(`${date}T06:00:00${localOffset(noon)}`);
  const ed = morningEdition({ date, now, ...opts });
  const fresh = ed.stories.filter((s) => now - new Date(s.published) < 36 * 3600e3).length;
  return { date, subject: `${PAPER.name}, ${pretty(date)}`, html: ed.html, fresh, stories: ed.stories.map((s) => s.href) };
}

// Fourteen days, so a quiet stretch with no publish (batched deploys,
// CLAUDE.md "Publishing") never leaves the morning job without a file.
export function upcomingEditions(from = new Date(), days = 14) {
  return Array.from({ length: days }, (_, i) => ymd(new Date(from.getTime() + i * 86400e3))).map((d) => edition(d));
}

export { ymd as columbusDate, pretty as prettyDate };

// Minutes past midnight in Columbus, for the morning job's clock.
export const columbusMinutes = (d) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(d).map((x) => [x.type, x.value]));
  return Number(p.hour) * 60 + Number(p.minute);
};
