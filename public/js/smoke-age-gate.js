(() => {
  const gate = document.querySelector('[data-age-gate]');
  const content = document.querySelector('[data-age-content]');
  const confirm = gate?.querySelector('[data-age-confirm]');
  if (!gate || !content || !confirm) return;

  const key = 'hoc-smoke-age-confirmed';
  function reveal() {
    content.hidden = false;
    gate.hidden = true;
  }

  try {
    if (sessionStorage.getItem(key) === 'yes') {
      reveal();
      return;
    }
  } catch {
    // Visitors can still confirm if their browser blocks storage.
  }

  confirm.hidden = false;
  confirm.addEventListener('click', () => {
    try {
      sessionStorage.setItem(key, 'yes');
    } catch {
      // Confirmation still applies on the current page.
    }
    reveal();
    const heading = content.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  });
})();
