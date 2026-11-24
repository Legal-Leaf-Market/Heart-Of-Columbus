// The signup box and share bar (src/news/share.mjs). Everything works as a
// plain link or form without this; this adds an in-page signup reply, the
// phone's share sheet and copy buttons.
(() => {
  for (const form of document.querySelectorAll('form[data-subscribe]')) {
    const msg = form.parentElement.querySelector('[data-subscribe-msg]');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button'); btn.disabled = true;
      try {
        const res = await fetch(form.action, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
        const data = await res.json().catch(() => ({}));
        msg.textContent = data.message || (res.ok ? 'Check your email to confirm.' : 'Something went wrong. Try again in a minute.');
        msg.dataset.ok = res.ok ? '1' : '0';
        if (res.ok) form.reset();
      } catch { msg.textContent = 'You seem to be offline. Try again in a minute.'; msg.dataset.ok = '0'; }
      btn.disabled = false;
    });
  }
  for (const bar of document.querySelectorAll('[data-share]')) {
    const msg = bar.querySelector('[data-share-msg]');
    const native = bar.querySelector('[data-share-native]');
    if (navigator.share && native) {
      native.hidden = false;
      native.addEventListener('click', () => navigator.share({ title: bar.dataset.title, text: bar.dataset.text, url: bar.dataset.url }).catch(() => {}));
    }
    for (const b of bar.querySelectorAll('[data-copy]')) {
      b.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(b.dataset.copy); msg.textContent = 'Copied. Paste it anywhere.'; }
        catch { msg.textContent = b.dataset.copy; }
      });
    }
  }
})();
