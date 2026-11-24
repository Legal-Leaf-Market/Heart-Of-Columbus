// The 30-second shootaround (/games/shootaround/). Pull the ball back away
// from the hoop and let go, or aim with the arrow keys and press Space. No
// network, no storage, no accounts. A pull sets the same angle and power the
// arrow keys do, and the dotted arc shows the shot while you drag, so aiming
// is something you can see. The on-screen controls work without a keyboard.
(() => {
  const root = document.querySelector('[data-sa]');
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const c = $('canvas'), ctx = c.getContext('2d');
  const scoreEl = $('[data-sa-score]'), timeEl = $('[data-sa-time]'), tagEl = $('[data-sa-tag]'), statusEl = $('[data-sa-status]');
  const startBtn = $('[data-sa-start]'), shootBtn = $('[data-sa-shoot]'), againBtn = $('[data-sa-again]');
  const aimControls = $('[data-sa-aim]');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 960, H = 540, home = { x: 255, y: 420 }, hoop = { x: 730, y: 236 };
  const PULL = 0.16, GRAVITY = 0.43;
  const startingAim = { angle: 60, power: 17.4 };
  let ball, score = 0, running = false, pointer = null, drag = { x: 0, y: 0 }, origin = { x: 0, y: 0 }, aim = { ...startingAim }, last = 0, raf = 0, swish = 0, timer = 0;
  const stars = Array.from({ length: 46 }, (_, i) => ({ x: (i * 197 + 43) % W, y: (i * 89 + 30) % 310, r: (i % 3) * 0.65 + 0.8, phase: i * 0.9 }));
  const resetBall = () => { ball = { x: home.x, y: home.y, vx: 0, vy: 0, r: 28, air: false }; pointer = null; };
  resetBall();

  function draw() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#152952'); sky.addColorStop(0.62, '#276d9e'); sky.addColorStop(1, '#e2a143');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    const t = still ? 0 : performance.now();
    for (const s of stars) { ctx.globalAlpha = 0.38 + 0.3 * Math.sin(t / 900 + s.phase); ctx.fillStyle = s.phase % 2 ? '#fff0b8' : '#b9dcff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(154,216,255,.33)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(490, 130, 380, 80, -0.12, Math.PI * 1.08, Math.PI * 1.95); ctx.stroke();
    for (let i = 0; i < 45; i++) { ctx.fillStyle = ['#f4be48', '#e9e4d5', '#4fa2d4', '#d65b57'][i % 4]; ctx.beginPath(); ctx.arc(i * 22 + 4, 314 + (i % 3) * 7, 4 + (i % 2), 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#fff3d9'; ctx.fillRect(779, 158, 9, 117); ctx.strokeStyle = '#ffcf58'; ctx.lineWidth = 5; ctx.strokeRect(741, 175, 48, 34); ctx.fillStyle = '#f04f44'; ctx.fillRect(694, 232, 51, 7);
    ctx.strokeStyle = '#fff0d3'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(696, 239); ctx.lineTo(702, 273); ctx.lineTo(737, 273); ctx.lineTo(744, 239); ctx.stroke();
    ctx.fillStyle = '#d58a39'; ctx.fillRect(0, 401, W, 139); ctx.fillStyle = '#efad55'; ctx.fillRect(0, 402, W, 6);
    ctx.strokeStyle = '#ffe1a0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 485); ctx.lineTo(W, 485); ctx.stroke();
    ctx.beginPath(); ctx.arc(255, 480, 132, Math.PI, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(255, 480, 50, Math.PI, Math.PI * 2); ctx.stroke();
    if (running && !ball.air) {
      const vx = Math.cos(aim.angle * Math.PI / 180) * aim.power, vy = -Math.sin(aim.angle * Math.PI / 180) * aim.power;
      ctx.fillStyle = 'rgba(255,244,200,.63)';
      for (let k = 5; k <= 64; k += 3.5) { const x = ball.x + vx * k, y = ball.y + vy * k + GRAVITY * k * k / 2; if (y > home.y || x > W) break; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill(); }
    }
    if (pointer !== null) { ctx.strokeStyle = 'rgba(255,241,190,.7)'; ctx.lineWidth = 3; ctx.setLineDash([7, 8]); ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(ball.x + drag.x - origin.x, ball.y + drag.y - origin.y); ctx.stroke(); ctx.setLineDash([]); }
    ctx.save(); ctx.translate(ball.x, ball.y); ctx.shadowColor = 'rgba(16,26,45,.47)'; ctx.shadowBlur = 9; ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#f29424'; ctx.beginPath(); ctx.arc(0, 0, ball.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#552d17'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
    ctx.moveTo(-27, 0); ctx.quadraticCurveTo(0, -9, 27, 0); ctx.moveTo(0, -27); ctx.quadraticCurveTo(-9, 0, 0, 27); ctx.moveTo(-19, -19); ctx.quadraticCurveTo(7, 0, 19, 19); ctx.stroke(); ctx.restore();
    if (swish > 0) { ctx.globalAlpha = swish / 30; ctx.fillStyle = '#ffe381'; ctx.font = '900 34px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SWISH!', hoop.x, hoop.y - 45); ctx.globalAlpha = 1; swish--; }
  }

  function tick(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 16.67 || 1, 2); last = now;
    if (ball.air) {
      const prevX = ball.x, prevY = ball.y;
      ball.x += ball.vx * dt;
      ball.y += (ball.vy + GRAVITY * dt / 2) * dt;
      ball.vy += GRAVITY * dt;
      const crossesRim = ball.vy > 0 && prevY <= hoop.y && ball.y > hoop.y;
      const rimX = crossesRim ? prevX + (ball.x - prevX) * (hoop.y - prevY) / (ball.y - prevY) : null;
      if (rimX !== null && rimX > hoop.x - 25 && rimX < hoop.x + 12) {
        score++; scoreEl.textContent = score; statusEl.textContent = 'Swish! Keep it going.'; swish = 24; resetBall();
      } else if ((ball.vy > 0 && ball.y > home.y) || ball.x > W + 40 || ball.x < -40) {
        statusEl.textContent = 'Next one is yours.'; resetBall();
      }
    }
    draw(); raf = requestAnimationFrame(tick);
  }

  function finish() {
    running = false; cancelAnimationFrame(raf); clearInterval(timer);
    const focusInGame = root.contains(document.activeElement);
    tagEl.textContent = 'TIME'; shootBtn.hidden = true; aimControls.hidden = true; againBtn.hidden = false;
    statusEl.textContent = `Final score: ${score}. Nice run!`; draw();
    if (focusInGame) againBtn.focus({ preventScroll: true });
  }
  function start({ detail }) {
    cancelAnimationFrame(raf); clearInterval(timer);
    score = 0; running = true; aim = { ...startingAim }; swish = 0; last = performance.now();
    scoreEl.textContent = '0'; timeEl.textContent = '30'; tagEl.textContent = 'SHOOT';
    statusEl.textContent = 'Tap Shoot or pull back and let it fly.';
    startBtn.hidden = true; shootBtn.hidden = false; aimControls.hidden = false; againBtn.hidden = true;
    resetBall(); raf = requestAnimationFrame(tick);
    if (detail === 0) c.focus({ preventScroll: true });
    const end = Date.now() + 30000;
    timer = setInterval(() => { const left = Math.max(0, Math.ceil((end - Date.now()) / 1000)); timeEl.textContent = left; if (!left) finish(); }, 100);
  }
  function shoot(vx, vy) { if (!running || ball.air) return; ball.vx = vx; ball.vy = vy; ball.air = true; statusEl.textContent = 'Up it goes!'; }
  function aimedShot() { const a = aim.angle * Math.PI / 180; shoot(Math.cos(a) * aim.power, -Math.sin(a) * aim.power); }
  function point(e) { const b = c.getBoundingClientRect(); return { x: (e.clientX - b.left) * W / b.width, y: (e.clientY - b.top) * H / b.height }; }

  // Press anywhere on the court and pull back, like a slingshot: on a phone
  // the ball is a small target, so the pull is measured from where you pressed.
  c.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || e.button !== 0) return;
    e.preventDefault();
    if (!running) { start(e); return; }
    if (ball.air || pointer !== null) return;
    origin = point(e); drag = origin; pointer = e.pointerId; c.setPointerCapture(pointer);
  });
  // A pull down and away from the hoop aims the shot the other way.
  const pullAim = () => {
    const dx = origin.x - drag.x, dy = drag.y - origin.y;
    if (dx < 10 || dy < 10) return false;
    aim.angle = Math.max(22, Math.min(70, Math.atan2(dy, dx) * 180 / Math.PI));
    aim.power = Math.max(13, Math.min(21, Math.hypot(dx, dy) * PULL));
    return true;
  };
  c.addEventListener('pointermove', (e) => { if (e.pointerId === pointer) { drag = point(e); pullAim(); draw(); } });
  c.addEventListener('pointerup', (e) => {
    if (e.pointerId !== pointer) return;
    drag = point(e);
    pointer = null;
    if (pullAim()) aimedShot();
    else statusEl.textContent = 'Pull down and away from the hoop, then let go.';
  });
  const cancelPull = (e) => { if (e.pointerId === pointer) pointer = null; };
  c.addEventListener('pointercancel', cancelPull);
  c.addEventListener('lostpointercapture', cancelPull);

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const directions = {
    ArrowLeft: [2, 0], ArrowRight: [-2, 0], ArrowUp: [0, 0.4], ArrowDown: [0, -0.4],
  };
  function adjust([angle, power]) {
    if (!running || ball.air) return;
    aim.angle = clamp(aim.angle + angle, 22, 70);
    aim.power = clamp(aim.power + power, 13, 21);
    draw();
  }
  aimControls.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-sa-direction]');
    if (button) adjust(directions[button.dataset.saDirection]);
  });
  c.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (running) aimedShot(); else start({ detail: 0 });
    } else if (Object.hasOwn(directions, e.key)) {
      e.preventDefault();
      adjust(directions[e.key]);
    }
  });
  startBtn.addEventListener('click', start);
  shootBtn.addEventListener('click', aimedShot);
  againBtn.addEventListener('click', start);
  draw();
})();
