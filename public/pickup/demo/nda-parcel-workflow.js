// Reused by the restaurant API and the Legal Leaf staff preview in the HOC hub.
// Based on the NDA Parcel staff pilot (messaging@79ac83c, setup-legal-leaf-preview.sql).
const actions = { picked_up: 'assigned', handed_off: 'picked_up', failed: 'picked_up' };
export function updateParcel(delivery, body, role, { drivers, windows, reasons }, createId) {
  const { event } = body;
  const { job } = delivery;
  const includes = (options, value) => typeof value === 'string' && Object.hasOwn(options, value);
  const validAssignment = () => includes(drivers, body.driver) && includes(windows, body.window);
  if (event === 'assigned') {
    if (role !== 'dispatch') return 'Dispatch access required.';
    if (job) return null;
    if (!validAssignment()) return 'Choose a staff driver and a delivery window.';
    delivery.job = {
      id: createId(), driver: body.driver, window: body.window, attempt: 1, status: event,
      events: [{ attempt: 1, outcome: event, at: new Date().toISOString() }],
    };
    return null;
  }
  if (!job || body.job !== job.id || body.attempt !== job.attempt) return 'Delivery attempt changed. Refresh the job.';
  if (includes(actions, event)) {
    if (role !== job.driver) return 'The assigned driver records custody.';
    if (job.status !== actions[event]) return 'That stop outcome is unavailable.';
    if (event === 'handed_off' && body.handoffConfirmed !== true) return 'Confirm the handoff first.';
    if (event === 'failed' && !includes(reasons, body.reason)) return 'Choose why the handoff failed.';
    job.status = event;
  } else {
    if (role !== 'dispatch') return 'Dispatch access required.';
    if (!['assigned', 'failed'].includes(job.status)) return 'That dispatch action is unavailable.';
    if (event === 'rescheduled') {
      if (!validAssignment()) return 'Choose a staff driver and a delivery window.';
      job.attempt++;
      job.driver = body.driver;
      job.window = body.window;
      job.status = 'assigned';
    } else if (event === 'cancelled') {
      job.status = event;
    } else {
      return 'That dispatch action is unavailable.';
    }
  }
  job.events.push({
    attempt: job.attempt, outcome: event, at: new Date().toISOString(),
    ...(event === 'failed' ? { reason: body.reason } : {}),
  });
  return null;
}
