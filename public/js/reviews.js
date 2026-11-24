(() => {
  const filter = document.querySelector('[data-review-filter]');
  if (!filter) return;
  const field = filter.querySelector('input');
  const status = filter.querySelector('[data-review-status]');
  const cards = [...document.querySelectorAll('[data-review-card]')];
  const normalize = (value) => value.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const entries = cards.map((card) => [card, normalize(card.dataset.reviewName)]);
  function update() {
    const terms = normalize(field.value).split(' ').filter(Boolean);
    let visible = 0;
    for (const [card, name] of entries) {
      card.hidden = !terms.every((term) => name.includes(term));
      if (!card.hidden) visible++;
    }
    status.textContent = visible ? `${visible} ${visible === 1 ? 'business' : 'businesses'}` : 'No businesses match your search.';
  }
  field.addEventListener('input', update);
  filter.hidden = false;
  update();
})();
