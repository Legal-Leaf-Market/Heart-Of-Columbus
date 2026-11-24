export function countActivity(orders, clicks, now = Date.now()) {
  const start = now - 7 * 24 * 60 * 60 * 1000;
  return orders.filter((order) => {
    const placed = Date.parse(order.at);
    return order.test === false && order.status !== 'cancelled' &&
      placed >= start && placed <= now && clicks.has(order.click);
  }).length;
}
