import { getDeployStore } from '@netlify/blobs';
import QRCode from 'qrcode';

export const config = { path: '/api/pickup-demo' };

const keyPattern = /^[a-f0-9]{32}$/;
const slugPattern = /^[a-z0-9-]{1,100}$/;
const next = { new: ['accepted', 'declined'], accepted: ['ready', 'declined'], ready: ['collected'] };
const response = (body, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const error = (message, status) => response({ error: message }, status);

const validIndex = index => Number.isInteger(index) && index >= 0 && index < 25;
function validChoice(choice) {
  return validIndex(choice) || (Array.isArray(choice) && choice.length <= 24 &&
    choice.every((index, i) => validIndex(index) && (i === 0 || index > choice[i - 1])));
}

const validPickup = slot => Array.isArray(slot) && slot.length === 2 &&
  Number.isInteger(slot[0]) && slot[0] >= 0 && slot[0] <= 6 &&
  Number.isInteger(slot[1]) && slot[1] >= 0 && slot[1] < 1440;

function validLines(lines) {
  return Array.isArray(lines) && lines.length > 0 && lines.length <= 24 &&
    lines.every(line => Array.isArray(line) && (line.length === 2 || line.length === 3) &&
      Number.isInteger(line[0]) && line[0] >= 0 && line[0] < 1000 &&
      Number.isInteger(line[1]) && line[1] >= 1 && line[1] <= 12 &&
      (line.length === 2 || (Array.isArray(line[2]) && line[2].length > 0 && line[2].length <= 12 &&
        line[2].every(validChoice)))) &&
    new Set(lines.map(([id, , choices]) => JSON.stringify([id, choices || []]))).size === lines.length;
}

// The room contains only menu indices, quantities, and demo status. It is
// separate from live pickup tickets and never accepts names or contact details.
export function demoPickup(getStore) {
  return async (request) => {
    const url = new URL(request.url);
    const { searchParams } = url;
    const slug = searchParams.get('business');
    const code = request.headers.get('x-hoc-demo');
    if (!slugPattern.test(slug ?? '') || !keyPattern.test(code ?? '')) return error('Open the demo session link again.', 400);
    if (!['GET', 'POST'].includes(request.method)) return error('Method unavailable.', 405);
    const key = slug + '/' + code;

    try {
      const store = getStore();
      const read = () => store.getWithMetadata(key, { type: 'json', consistency: 'strong' });
      if (request.method === 'GET') {
        const current = await read();
        if (!current || Date.now() >= current.data.until) return error('This session expired. Start a new demo.', 410);
        const view = searchParams.get('qr');
        if (view === 'shopper' || view === 'tablet') {
          const link = new URL('/pickup/demo/' + slug + '/', url);
          if (view === 'tablet') link.searchParams.set('view', view);
          link.hash = 'session=' + code;
          return response({ image: await QRCode.toDataURL(link.href, { width: 240, margin: 2 }) });
        }
        return response({ tickets: current.data.tickets });
      }
      if (!request.body) return error('Missing demo action.', 400);
      const reader = request.body.getReader();
      const chunks = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 4096) { await reader.cancel(); return error('Demo action is too large.', 413); }
        chunks.push(value);
      }
      const body = (() => { try { return JSON.parse(Buffer.concat(chunks)); } catch { return null; } })();
      if (!body || typeof body !== 'object') return error('Invalid demo action.', 400);
      if (body.action === 'start') {
        await store.setJSON(key, { until: Date.now() + 6 * 3600_000, tickets: [] }, { onlyIfNew: true });
        return response({ ok: true });
      }
      if (!['order', 'update'].includes(body.action) || typeof body.id !== 'string' || !keyPattern.test(body.id)) return error('Invalid demo action.', 400);
      if (body.action === 'order') {
        if (!validLines(body.lines)) return error('Choose up to 24 menu items.', 400);
        if (body.pickup !== undefined && !validPickup(body.pickup)) return error('Choose a valid demo pickup day and time.', 400);
        if (body.coupon !== undefined && !['HOCDEMO10', 'HOCDEMO5'].includes(body.coupon)) return error('Sample code not recognized.', 400);
      }

      // Retry conditional writes so two phones placing tickets or two tablet
      // taps cannot overwrite a different ticket or reverse a status change.
      for (let attempt = 0; attempt < 6; attempt++) {
        const current = await read();
        if (!current || Date.now() >= current.data.until) return error('This session expired. Start a new demo.', 410);
        const { tickets } = current.data;
        const ticket = tickets.find(item => item.id === body.id);
        if (body.action === 'order') {
          if (ticket) return response({ ticket });
          if (tickets.length >= 50) return error('Start a new session to place more test orders.', 409);
          tickets.unshift({
            id: body.id, lines: body.lines, status: 'new',
            ...(body.pickup ? { pickup: body.pickup } : {}),
            ...(body.coupon ? { coupon: body.coupon } : {}),
          });
        } else {
          if (!ticket) return error('That demo ticket is missing.', 404);
          if (ticket.status === body.status) return response({ ticket });
          if (!next[ticket.status]?.includes(body.status)) return error('That ticket has already moved. Refreshing the queue.', 409);
          if (body.status === 'accepted') {
            if (![10, 15, 20, 30, 45].includes(body.minutes)) return error('Choose a prep time.', 400);
            ticket.readyAt = Date.now() + body.minutes * 60_000;
          }
          ticket.status = body.status;
        }
        const result = await store.setJSON(key, current.data, { onlyIfMatch: current.etag });
        if (result.modified) return response({ ticket: body.action === 'order' ? tickets[0] : ticket });
      }
      return error('Another demo action is in progress. Try again.', 409);
    } catch {
      return error('The demo service is unavailable. Try again in a moment.', 503);
    }
  };
}

export default demoPickup(() => getDeployStore('pickup-demo'));
