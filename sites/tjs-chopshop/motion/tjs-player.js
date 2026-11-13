/* TJ's ChopShop "After Hours" player. No dependencies, no tracking, and no
   network request until a visitor presses play (browsers block sound before
   that anyway). The 60s master plays once, then an 8-bar loop repeats with
   no gaps.

   Why the loop is built here: an MP3 carries encoder padding, so looping an
   MP3 file clicks. audio/after-hours-loop.mp3 is the loop with 0.25s of real
   audio on each side; the seam is crossfaded into an in-memory buffer that
   the Web Audio API loops sample-accurately. */
(() => {
  'use strict';
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC || document.querySelector('.tj-player')) return;

  const BASE = (document.currentScript && document.currentScript.src) ? new URL('../audio/', document.currentScript.src) : new URL('audio/', location.href);
  const MASTER = new URL('after-hours.mp3', BASE).href;
  const LOOP = new URL('after-hours-loop.mp3', BASE).href;
  const BPM = 82.03, LOOP_SECONDS = 1032192 / 44100, LEAD = 0.25, SEAM = 0.06;
  const BAR = 4 * 60 / BPM;

  const root = document.documentElement, body = document.body;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // UI: a record that spins, the track name, and five level bars.
  const dock = document.createElement('div');
  dock.className = 'tj-player';
  dock.innerHTML =
    '<button type="button" class="tj-rec" aria-pressed="false">' +
      '<span class="tj-disc" aria-hidden="true"><img src="brand/logos/monogram.svg" alt="" width="22" height="22"></span>' +
      '<span class="tj-glyph" aria-hidden="true"></span>' +
    '</button>' +
    '<span class="tj-meta"><b>After Hours</b><small>Original soundtrack &middot; TJ&rsquo;s ChopShop</small></span>' +
    '<span class="tj-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' +
    '<span class="tj-sr" role="status" aria-live="polite"></span>';
  body.append(dock);
  const btn = dock.querySelector('.tj-rec'), meta = dock.querySelector('.tj-meta small'), sr = dock.querySelector('.tj-sr');
  const bars = [...dock.querySelectorAll('.tj-eq i')];
  const label = (s) => { btn.setAttribute('aria-label', s); btn.title = s; };
  label('Play After Hours, the shop soundtrack');

  let ctx, out, analyser, master, loop, state = 'idle', raf = 0, startedAt = 0;

  async function fetchBuffer(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    const data = await res.arrayBuffer();
    // Old Safari only has the callback form of decodeAudioData.
    return new Promise((ok, bad) => { const p = ctx.decodeAudioData(data, ok, bad); if (p && p.then) p.then(ok, bad); });
  }

  // Crossfade the loop source's tail handle into its head, equal power,
  // centred on the bar line, so a native loop over the result never clicks.
  function seamless(src) {
    const rate = src.sampleRate, n = Math.round(LOOP_SECONDS * rate), x = Math.round(SEAM * rate);
    const lead = Math.max(0, Math.round(LEAD * rate) - (x >> 1));
    const buf = ctx.createBuffer(src.numberOfChannels, n, rate);
    for (let c = 0; c < src.numberOfChannels; c++) {
      const a = src.getChannelData(c), b = buf.getChannelData(c);
      for (let i = 0; i < n; i++) b[i] = a[lead + i] || 0;
      for (let i = 0; i < x; i++) {
        const t = (i / x) * Math.PI / 2;
        b[i] = (a[lead + i] || 0) * Math.sin(t) + (a[lead + n + i] || 0) * Math.cos(t);
      }
    }
    return buf;
  }

  async function load() {
    ctx = new AC();
    // iOS: play through the ringer switch like a music app would.
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
    out = ctx.createGain(); out.gain.value = 0;
    analyser = ctx.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0.72;
    out.connect(analyser); analyser.connect(ctx.destination);
    const [m, l] = await Promise.all([fetchBuffer(MASTER), fetchBuffer(LOOP)]);
    master = m; loop = seamless(l);
  }

  function schedule() {
    const t = ctx.currentTime + 0.05;
    const a = ctx.createBufferSource(); a.buffer = master; a.connect(out); a.start(t);
    const b = ctx.createBufferSource(); b.buffer = loop; b.loop = true; b.connect(out);
    b.start(t + master.duration);
    startedAt = t;
  }

  function fade(to, secs) {
    const now = ctx.currentTime;
    out.gain.cancelScheduledValues(now);
    out.gain.setValueAtTime(out.gain.value, now);
    out.gain.linearRampToValueAtTime(to, now + secs);
  }

  function set(next) {
    state = next;
    const on = next === 'playing';
    btn.setAttribute('aria-pressed', String(on));
    dock.classList.toggle('tj-on', on);
    dock.classList.toggle('tj-loading', next === 'loading');
    body.classList.toggle('tj-playing', on);
    label(on ? 'Pause After Hours' : next === 'loading' ? 'Loading After Hours' : 'Play After Hours, the shop soundtrack');
    if (next === 'error') { meta.textContent = 'Could not load. Tap to try again.'; sr.textContent = 'The soundtrack could not load.'; }
    if (on) { sr.textContent = 'Playing After Hours.'; tick(); } else { cancelAnimationFrame(raf); reset(); }
    if (next === 'paused') sr.textContent = 'Paused.';
  }

  async function toggle() {
    if (state === 'loading') return;
    if (state === 'playing') {
      fade(0, 0.25); set('paused');
      setTimeout(() => { if (state === 'paused') ctx.suspend(); }, 280);
      return;
    }
    if (state === 'paused') {
      await ctx.resume(); fade(1, 0.35); set('playing'); return;
    }
    // idle or error: load on this tap, which also unlocks audio on phones.
    set('loading');
    try {
      if (!ctx) await load(); else if (!master) { ctx.close(); ctx = null; await load(); }
      await ctx.resume();
      schedule(); fade(1, 0.6); set('playing');
    } catch (e) {
      console.warn('After Hours player:', e); master = null; set('error');
    }
  }
  btn.addEventListener('click', toggle);

  // Audio-reactive extras: neon swells with the low end, bars dance, and the
  // barber pole turns one stripe per bar. Off when effects are paused or the
  // device asks for reduced motion; the music still plays.
  const freq = new Uint8Array(512);
  let level = 0;
  function tick() {
    raf = requestAnimationFrame(tick);
    if (reduced.matches || body.classList.contains('tj-paused') || document.hidden) { reset(); return; }
    analyser.getByteFrequencyData(freq);
    // Bins are ~43 Hz wide: 1..4 is the kick and bass.
    const low = (freq[1] + freq[2] + freq[3] + freq[4]) / (4 * 255);
    level += ((low > level ? 0.55 : 0.12)) * (low - level);
    root.style.setProperty('--tj-beat', Math.max(0, (level - 0.45) / 0.5).toFixed(3));
    const bands = [3, 8, 18, 40, 90];
    bars.forEach((el, i) => { el.style.transform = `scaleY(${(0.18 + 0.82 * freq[bands[i]] / 255).toFixed(3)})`; });
    if (loop && ctx.currentTime > startedAt + master.duration) meta.textContent = 'On repeat · TJ’s ChopShop';
  }
  function reset() {
    root.style.setProperty('--tj-beat', '0');
    bars.forEach((el) => { el.style.transform = ''; });
  }
  root.style.setProperty('--tj-bar', `${BAR.toFixed(4)}s`);

  // Lock screen and headset buttons where supported.
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'After Hours', artist: 'TJ’s ChopShop', album: 'Original soundtrack',
        artwork: [{ src: new URL('brand/logos/icon-512.png', location.href).href, sizes: '512x512', type: 'image/png' }],
      });
      navigator.mediaSession.setActionHandler('play', () => { if (state !== 'playing') toggle(); });
      navigator.mediaSession.setActionHandler('pause', () => { if (state === 'playing') toggle(); });
    } catch {}
  }
})();
