import { deliveryDemo } from '../../../src/data/delivery-demo.mjs';
import { updateParcel } from '../../../public/pickup/demo/nda-parcel-workflow.js';

export function applyDemoParcel(ticket, body, role, createId) {
  if (!ticket.delivery || ticket.status !== 'ready') return 'Mark the delivery order ready first.';
  return updateParcel(ticket.delivery, body, role, deliveryDemo, createId);
}

export function visibleDemoTicket(ticket, role) {
  if (role && role !== 'dispatch') {
    const { id, status, delivery } = ticket;
    return { id, status, delivery };
  }
  if (!ticket.delivery || role) return ticket;
  const { delivery: { dropoff, job }, ...order } = ticket;
  return { ...order, delivery: { dropoff, ...(job ? { status: job.status } : {}) } };
}
