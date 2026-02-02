const zone = document.getElementById("zone");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const result = document.getElementById("result");
const hint = document.getElementById("hint");
const replayBtn = document.getElementById("replayBtn");

const fxCanvas = document.getElementById("fxCanvas");
const confettiInstance = confetti.create(fxCanvas, { resize: true, useWorker: true });

/* ---------- Ambient floating particles (subtle, designer-y) ---------- */
const ctx = fxCanvas.getContext("2d");
let W = 0, H = 0, DPR = 1;
let dots = [];

function resize() {
  DPR = Math.max(1, window.devicePixelRatio || 1);
  W = fxCanvas.width = Math.floor(window.innerWidth * DPR);
  H = fxCanvas.height = Math.floor(window.innerHeight * DPR);
  fxCanvas.style.width = "100vw";
  fxCanvas.style.height = "100vh";

  dots = Array.from({ length: Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 18000)) }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: (Math.random() * 2.2 + 0.8) * DPR,
    a: Math.random() * 0.22 + 0.05,
    vx: (Math.random() * 0.22 + 0.05) * DPR,
    vy: (Math.random() * 0.10 + 0.02) * DPR,
  }));
}
resize();
window.addEventListener("resize", resize);

function tick() {
  ctx.clearRect(0, 0, W, H);
  for (const d of dots) {
    d.x += d.vx;
    d.y += d.vy;

    if (d.x > W + 20) d.x = -20;
    if (d.y > H + 20) d.y = -20;

    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 20, 102, ${d.a})`;
    ctx.fill();
  }
  requestAnimationFrame(tick);
}
tick();

/* ---------- Confetti "art-directed" ---------- */
function fullScreenConfetti() {
  const end = Date.now() + 1600;

  (function frame() {
    confettiInstance({
      particleCount: 12,
      spread: 90,
      startVelocity: 42,
      ticks: 170,
      origin: { x: Math.random(), y: Math.random() * 0.35 }
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  setTimeout(() => {
    confettiInstance({
      particleCount: 260,
      spread: 140,
      startVelocity: 62,
      ticks: 210,
      origin: { x: 0.5, y: 0.6 }
    });
  }, 280);
}

/* ---------- YES grows (but not ridiculous) ---------- */
let yesScale = 1;
function growYes() {
  yesScale = Math.min(2.05, yesScale + 0.10);
  yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;
}

/* ---------- NO "frog hops away" ---------- */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function hopNo(px, py) {
  const z = zone.getBoundingClientRect();
  const b = noBtn.getBoundingClientRect();

  let dx = (b.left + b.width / 2) - px;
  let dy = (b.top + b.height / 2) - py;

  let mag = Math.hypot(dx, dy) || 1;
  dx /= mag;
  dy /= mag;

  // hop distance (a bit chaotic but controlled)
  const hop = 160;
  let newLeft = (b.left - z.left) + dx * hop;
  let newTop  = (b.top - z.top) + dy * hop;

  newLeft = clamp(newLeft, 0, z.width - b.width);
  newTop  = clamp(newTop, 0, z.height - b.height);

  noBtn.style.left = newLeft + "px";
  noBtn.style.top = newTop + "px";
  noBtn.style.transform = "none";

  growYes();
}

zone.addEventListener("pointermove", (e) => {
  const b = noBtn.getBoundingClientRect();
  const d = Math.hypot(
    (b.left + b.width / 2) - e.clientX,
    (b.top + b.height / 2) - e.clientY
  );
  if (d < 150) hopNo(e.clientX, e.clientY);
});

noBtn.addEventListener("click", (e) => e.preventDefault());

/* ---------- YES click ---------- */
yesBtn.addEventListener("click", () => {
  zone.style.display = "none";
  hint.style.display = "none";
  result.style.display = "block";
  fullScreenConfetti();
});

/* ---------- Replay ---------- */
replayBtn?.addEventListener("click", () => fullScreenConfetti());
