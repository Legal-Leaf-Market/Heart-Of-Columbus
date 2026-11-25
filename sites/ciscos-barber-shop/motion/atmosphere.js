const stage = document.querySelector('.hero');
const control = stage.querySelector('.motion-control');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

let paused = false;
try {
  paused = localStorage.getItem('ciscos-motion') === 'paused';
} catch {
  // Motion controls still work when storage is unavailable.
}

function setDrift(x = 0, y = 0) {
  stage.style.setProperty('--drift-x', `${x}px`);
  stage.style.setProperty('--drift-y', `${y}px`);
}

function updateMotion() {
  control.hidden = reducedMotion.matches;
  stage.dataset.motion = paused || reducedMotion.matches ? 'paused' : 'playing';
  control.textContent = paused ? 'Play effects' : 'Pause effects';
  if (stage.dataset.motion === 'paused') setDrift();
}

control.addEventListener('click', () => {
  paused = !paused;
  try {
    localStorage.setItem('ciscos-motion', paused ? 'paused' : 'playing');
  } catch {
    // Keep the current choice for this page.
  }
  updateMotion();
});

reducedMotion.addEventListener('change', updateMotion);
stage.addEventListener('pointermove', (event) => {
  if (!finePointer.matches || stage.dataset.motion !== 'playing') return;
  const bounds = stage.getBoundingClientRect();
  setDrift(
    (event.clientX - bounds.left) / bounds.width * 20 - 10,
    (event.clientY - bounds.top) / bounds.height * 14 - 7,
  );
}, { passive: true });
stage.addEventListener('pointerleave', () => setDrift());
updateMotion();
