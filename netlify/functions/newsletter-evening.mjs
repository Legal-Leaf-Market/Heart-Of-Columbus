// The evening edition: the same job as newsletter.mjs, on the evening clock.
// Draft and note at 5:30 PM, send at 6:00 PM, Columbus time, every day. The
// cron wakes at both possible UTC hours (21:30 and 22:30); only the first
// wake at or after 5:30 PM acts (src/news/paper-mail.mjs, EDITIONS.evening).
import { runFor } from './newsletter.mjs';

export const config = { schedule: '30 21,22 * * *' };

export default runFor('evening');
