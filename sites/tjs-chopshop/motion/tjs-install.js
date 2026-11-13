/* "Get the app": puts TJ's ChopShop on a home screen, dock or app list as a
   light installed app (manifest.webmanifest + sw.js). Where the browser
   offers a real install prompt (Chrome and Edge on Android, Windows, Mac and
   Chromebook) the button installs in one tap; everywhere else it shows the
   steps for that device. Hidden once installed or when opened as the app. */
(() => {
  'use strict';
  const here = document.currentScript ? new URL('../', document.currentScript.src) : new URL('./', location.href);
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register(new URL('sw.js', here), { scope: here.pathname }).catch(() => {}));
  }

  const standalone = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: window-controls-overlay)').matches || navigator.standalone === true;
  if (standalone || document.querySelector('.tj-install')) return;
  const KEY = 'tj-install-hidden-until';
  try { if (Number(localStorage.getItem(KEY)) > Date.now()) return; } catch {}

  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua), mac = /Macintosh/.test(ua) && !ios, win = /Windows/.test(ua), cros = /CrOS/.test(ua);
  const edge = /Edg\//.test(ua), samsung = /SamsungBrowser/.test(ua), firefox = /Firefox|FxiOS/.test(ua);
  const chrome = /Chrome|CriOS/.test(ua) && !edge && !samsung;
  const safari = !chrome && !edge && !firefox && !samsung && /Safari/.test(ua);

  // Steps per device. Written without dashes (house rule for visible text).
  const STEPS = {
    ios: { name: 'iPhone or iPad', steps: ['Tap the Share button, the square with an arrow pointing up. In Safari it is at the bottom of the screen; in Chrome it is at the top right.', 'Scroll down and tap <b>Add to Home Screen</b>.', 'Tap <b>Add</b>. TJ&rsquo;s ChopShop now opens from your home screen like an app.'] },
    android: { name: 'Android (Chrome)', steps: ['Tap the <b>&#8942;</b> menu at the top right.', 'Tap <b>Add to Home screen</b> or <b>Install app</b>.', 'Tap <b>Install</b>. The icon lands on your home screen and in your app drawer.'] },
    samsung: { name: 'Samsung Internet', steps: ['Tap the <b>&#9776;</b> menu at the bottom right.', 'Tap <b>Add page to</b>, then <b>Home screen</b>.', 'Tap <b>Add</b>.'] },
    firefoxAndroid: { name: 'Firefox on Android', steps: ['Tap the <b>&#8942;</b> menu.', 'Tap <b>Install</b> or <b>Add to Home screen</b>.', 'Confirm, and the icon lands on your home screen.'] },
    chromeDesktop: { name: 'Chrome on Windows, Mac or Chromebook', steps: ['Click the install icon at the right end of the address bar, a small screen with a down arrow.', 'No icon? Open the <b>&#8942;</b> menu, then <b>Cast, save and share</b>, then <b>Install page as app</b>.', 'Click <b>Install</b>. It opens in its own window and shows up in your Start menu, Dock, Launchpad or Chromebook launcher.'] },
    edge: { name: 'Microsoft Edge', steps: ['Open the <b>&middot;&middot;&middot;</b> menu at the top right.', 'Choose <b>Apps</b>, then <b>Install this site as an app</b>.', 'Click <b>Install</b>. You can pin it to the taskbar or Start.'] },
    macSafari: { name: 'Safari on a Mac', steps: ['In the menu bar, choose <b>File</b>, then <b>Add to Dock</b>. You can also use the Share button and pick <b>Add to Dock</b>.', 'Click <b>Add</b>. TJ&rsquo;s ChopShop sits in your Dock and opens in its own window.'] },
    firefoxDesktop: { name: 'Firefox on a computer', steps: ['Firefox on a computer does not install sites as apps.', 'Open this page in Chrome, Edge or Safari and follow their steps, or bookmark it.'] },
  };
  const mine = ios ? 'ios' : android ? (samsung ? 'samsung' : firefox ? 'firefoxAndroid' : 'android')
    : edge ? 'edge' : firefox ? 'firefoxDesktop' : mac && safari ? 'macSafari' : 'chromeDesktop';
  const deviceWord = ios || android ? 'phone' : 'computer';
  const list = (k) => `<ol>${STEPS[k].steps.map((s) => `<li>${s}</li>`).join('')}</ol>`;

  const pill = document.createElement('div');
  pill.className = 'tj-install';
  pill.innerHTML = '<button type="button" class="tj-install-open"><img src="app/icon-192.png" alt="" width="26" height="26"><span>Get the app</span></button>' +
    '<button type="button" class="tj-install-x" aria-label="Hide for now">&times;</button>';
  const dlg = document.createElement('dialog');
  dlg.className = 'tj-install-sheet';
  dlg.setAttribute('aria-labelledby', 'tj-install-title');
  dlg.innerHTML =
    '<form method="dialog" class="tj-install-close"><button aria-label="Close">&times;</button></form>' +
    '<img class="tj-install-icon" src="app/icon-192.png" alt="" width="64" height="64">' +
    `<h2 id="tj-install-title">Put TJ&rsquo;s ChopShop on your ${deviceWord}</h2>` +
    '<p class="tj-install-lede">One tap to book, see the menu or find the shop. No app store, nothing to update, and it takes almost no space.</p>' +
    '<button type="button" class="btn tj-install-now" hidden>Install the app</button>' +
    `<div class="tj-install-mine"><h3>${STEPS[mine].name}</h3>${list(mine)}</div>` +
    '<details class="tj-install-other"><summary>Another phone or computer?</summary>' +
    Object.keys(STEPS).filter((k) => k !== mine).map((k) => `<h3>${STEPS[k].name}</h3>${list(k)}`).join('') +
    '</details>';
  document.body.append(pill, dlg);

  const nowBtn = dlg.querySelector('.tj-install-now');
  let deferred = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferred = e; nowBtn.hidden = false;
    dlg.querySelector('.tj-install-mine').classList.add('tj-install-alt');
  });
  nowBtn.addEventListener('click', async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice.catch(() => ({ outcome: 'dismissed' }));
    deferred = null; nowBtn.hidden = true;
    if (outcome === 'accepted') { dlg.close(); pill.remove(); }
  });
  window.addEventListener('appinstalled', () => { pill.remove(); if (dlg.open) dlg.close(); });

  pill.querySelector('.tj-install-open').addEventListener('click', () => {
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  pill.querySelector('.tj-install-x').addEventListener('click', () => {
    try { localStorage.setItem(KEY, String(Date.now() + 14 * 864e5)); } catch {}
    pill.remove();
  });
})();
