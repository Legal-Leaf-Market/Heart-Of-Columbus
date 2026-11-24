const counter = document.querySelector('[data-counter-activity]');
if (counter) {
  fetch('/api/counter-activity')
    .then((response) => response.ok ? response.json() : [])
    .then((rows) => {
      const activity = rows[0];
      if (!activity) return;
      const merchant = counter.querySelector('a');
      merchant.textContent = activity.name;
      merchant.href = '/b/' + encodeURIComponent(activity.slug) + '/';
      counter.querySelector('[data-counter-count]').textContent =
        activity.count + ' orders through Heart of Columbus in the past 7 days.';
      counter.hidden = false;
    })
    .catch(() => {});
}
