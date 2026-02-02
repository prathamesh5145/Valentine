/* =========================
   $10K FEEL: heart pop + burst background
   + anime frog micro-interactions
   + playful button behavior
   ========================= */

const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

/* ---------- Motion toggle ---------- */
let motionEnabled = !prefersReducedMotion;
const motionBtn = document.getElementById("motionBtn");
motionBtn.addEventListener("click", () => {
  motionEnabled = !motionEnabled;
  motionBtn.classList.toggle("off", !motionEnabled);
});

/* ---------- Heart Engine (Canvas) ---------- */
const canvas = document.getElementById("hearts");
const ctx = canvas.getContext("2d", { alpha: true });

let W = 0, H = 0, DPR = 1;

function resize() {
  DPR = Math.max(1, window.devicePixelRatio || 1);
  W = canvas.width = Math.floor(window.innerWidth * DPR);
  H = canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
}
resize();
window.addEventListener("resize", resize);

/* Object pools for performance */
const hearts = [];
const sparks = [];

function rand(min, max){ return min + Math.random() * (max - min); }
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

function spawnHeart(x = rand(0, W), y = rand(0, H)) {
  const h = {
    x, y,
    // pop scale
    s0: rand(0.25, 0.55) * DPR,
    s1: rand(0.9, 1.35) * DPR,
    rot: rand(-0.8, 0.8),
    vr: rand(-0.015, 0.015),
    // float
    vx: rand(-0.25, 0.25) * DPR,
    vy: rand(-0.65, -0.25) * DPR,
    // lifetime
    t: 0,
    life: rand(120, 220),
    // states: "pop" -> "float" -> "burst"
    state: "pop",
    hue: rand(330, 360), // pinkish
    sat: rand(70, 92),
    light: rand(58, 68),
    alpha: rand(0.45, 0.75),
    burstAt: rand(0.55, 0.92) // point in life to burst
  };
  hearts.push(h);
}

function spawnSparks(x, y, baseHue){
  const count = Math.floor(rand(10, 18));
  for (let i = 0; i < count; i++){
    sparks.push({
      x, y,
      vx: rand(-2.6, 2.6) * DPR,
      vy: rand(-3.4, 1.6) * DPR,
      g: rand(0.06, 0.12) * DPR,
      r: rand(1.2, 2.4) * DPR,
      t: 0,
      life: rand(40, 75),
      hue: baseHue + rand(-8, 10),
      alpha: rand(0.55, 0.9)
    });
  }
}

function drawHeartShape(x, y, s, rot, color, a){
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = a;

  // Heart path (normalized) scaled by s
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, -2.2);
  ctx.bezierCurveTo(-2.6, -4.6, -7.2, -2.0, -6.0, 2.0);
  ctx.bezierCurveTo(-5.0, 5.4, -2.0, 7.0, 0, 9.0);
  ctx.bezierCurveTo(2.0, 7.0, 5.0, 5.4, 6.0, 2.0);
  ctx.bezierCurveTo(7.2, -2.0, 2.6, -4.6, 0, -2.2);
  ctx.closePath();

  // subtle glow
  ctx.shadowColor = "rgba(255, 42, 122, 0.35)";
  ctx.shadowBlur = 18 * (s / DPR);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

function tickHearts(){
  if (!motionEnabled){
    ctx.clearRect(0, 0, W, H);
    requestAnimationFrame(tickHearts);
    return;
  }

  ctx.clearRect(0, 0, W, H);

  // spawn hearts gradually
  if (hearts.length < 55 && Math.random() < 0.45) {
    spawnHeart();
  } else if (Math.random() < 0.16) {
    // occasional random pop
    spawnHeart(rand(0, W), rand(0, H));
  }

  // update hearts
  for (let i = hearts.length - 1; i >= 0; i--){
    const h = hearts[i];
    h.t++;

    const p = h.t / h.life;

    // decide burst
    if (h.state !== "burst" && p > h.burstAt){
      h.state = "burst";
      spawnSparks(h.x, h.y, h.hue);
    }

    // pop easing
    let s = h.s1;
    let a = h.alpha;

    if (h.state === "pop"){
      const tp = clamp(h.t / 26, 0, 1);
      const e = easeOutCubic(tp);
      s = (h.s0 + (h.s1 - h.s0) * e);
      a = h.alpha * (0.2 + 0.8 * e);
      if (tp >= 1) h.state = "float";
    } else if (h.state === "float"){
      // float and fade slightly
      h.x += h.vx;
      h.y += h.vy;
      h.rot += h.vr;

      // wrap gently
      if (h.x < -40 * DPR) h.x = W + 40 * DPR;
      if (h.x > W + 40 * DPR) h.x = -40 * DPR;
      if (h.y < -40 * DPR) h.y = H + 40 * DPR;

      a = h.alpha * (1 - p * 0.35);
    } else {
      // burst state fades quickly
      a = h.alpha * (1 - clamp((p - h.burstAt) / (1 - h.burstAt), 0, 1));
      a *= 0.75;
      h.x += h.vx * 0.6;
      h.y += h.vy * 0.6;
      h.rot += h.vr * 0.9;
    }

    const color = `hsla(${h.hue}, ${h.sat}%, ${h.light}%, 1)`;
    drawHeartShape(h.x, h.y, s, h.rot, color, a);

    // remove dead
    if (h.t >= h.life){
      hearts.splice(i, 1);
    }
  }

  // update sparks
  for (let i = sparks.length - 1; i >= 0; i--){
    const s = sparks[i];
    s.t++;
    s.vy += s.g;
    s.x += s.vx;
    s.y += s.vy;

    const p = s.t / s.life;
    const a = s.alpha * (1 - p);

    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = `hsla(${s.hue}, 90%, 70%, 1)`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * (1 - p * 0.3), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (s.t >= s.life) sparks.splice(i, 1);
  }

  requestAnimationFrame(tickHearts);
}
tickHearts();

/* ---------- Anime Frog micro interactions ---------- */
const frog = document.getElementById("frog");
const frogGroup = frog.querySelector("#frogGroup");
const heroHeart = frog.querySelector("#heroHeart");
const lids = frog.querySelector("#lids");
const pupils = frog.querySelector("#pupils");
const p1 = frog.querySelector("#p1");
const p2 = frog.querySelector("#p2");
const sparkles = frog.querySelector("#sparkles");
const heroFrame = document.getElementById("heroFrame");

let lastBlink = 0;
let blinkNext = rand(900, 2200);
let t = 0;

function setBlink(on){
  lids.style.opacity = on ? "1" : "0";
  pupils.style.opacity = on ? "0" : "1";
}

function animateFrog(){
  if (motionEnabled){
    t += 1;

    // breathing + micro head tilt
    const breathe = Math.sin(t / 55) * 0.010;
    const tilt = Math.sin(t / 110) * 0.8;

    frogGroup.style.transformOrigin = "410px 340px";
    frogGroup.style.transform = `translateY(${breathe * 180}px) rotate(${tilt}deg)`;

    // floating heart idle
    const floatY = Math.sin(t / 70) * 6;
    heroHeart.style.transformOrigin = "758px 170px";
    heroHeart.style.transform = `translateY(${floatY}px) rotate(${Math.sin(t / 120) * 1.2}deg)`;

    // sparkle twinkle
    sparkles.style.opacity = String(0.65 + (Math.sin(t / 40) * 0.25));

    // blink scheduler
    lastBlink += 16;
    if (lastBlink > blinkNext){
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
      lastBlink = 0;
      blinkNext = rand(900, 2600);
    }
  } else {
    // freeze to stable look
    frogGroup.style.transform = "";
    heroHeart.style.transform = "";
    sparkles.style.opacity = "0.9";
    setBlink(false);
  }

  requestAnimationFrame(animateFrog);
}
animateFrog();

// Eye tracking (mouse / touch)
function trackEyes(clientX, clientY){
  const r = heroFrame.getBoundingClientRect();
  const nx = (clientX - (r.left + r.width/2)) / r.width;   // -0.5..0.5
  const ny = (clientY - (r.top + r.height/2)) / r.height;

  const dx = clamp(nx * 18, -10, 10);
  const dy = clamp(ny * 14, -8, 8);

  // move pupil centers
  p1.setAttribute("cx", String(355 + dx));
  p1.setAttribute("cy", String(224 + dy));
  p2.setAttribute("cx", String(465 + dx));
  p2.setAttribute("cy", String(224 + dy));
}

window.addEventListener("pointermove", (e) => {
  if (!motionEnabled) return;
  trackEyes(e.clientX, e.clientY);
});

/* ---------- Buttons logic ---------- */
const zone = document.getElementById("zone");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const hint = document.getElementById("hint");
const result = document.getElementById("result");
const replayBtn = document.getElementById("replayBtn");
const burstBtn = document.getElementById("burstBtn");

let yesScale = 1;

function growYes(){
  yesScale = Math.min(1.75, yesScale + 0.08);
  yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;
  // tiny haptic on mobile if supported
  if (navigator.vibrate) navigator.vibrate(8);
}

function moveNoAway(px, py){
  const z = zone.getBoundingClientRect();
  const b = noBtn.getBoundingClientRect();

  let dx = (b.left + b.width/2) - px;
  let dy = (b.top + b.height/2) - py;
  let mag = Math.hypot(dx, dy) || 1;
  dx /= mag; dy /= mag;

  const hop = 190;
  let newL = (b.left - z.left) + dx * hop;
  let newT = (b.top - z.top) + dy * hop;

  newL = clamp(newL, 0, z.width - b.width);
  newT = clamp(newT, 0, z.height - b.height);

  noBtn.style.left = `${newL}px`;
  noBtn.style.top  = `${newT}px`;
  noBtn.style.transform = "none";

  growYes();

  // make hearts pop near the button move for delight
  for (let i = 0; i < 2; i++){
    spawnHeart((z.left + newL + b.width/2) * DPR, (z.top + newT + b.height/2) * DPR);
  }
}

zone.addEventListener("pointermove", (e) => {
  const b = noBtn.getBoundingClientRect();
  const d = Math.hypot(
    (b.left + b.width/2) - e.clientX,
    (b.top + b.height/2) - e.clientY
  );
  if (d < 170) moveNoAway(e.clientX, e.clientY);
});

noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  growYes();
});

function showResult(){
  zone.style.display = "none";
  hint.style.display = "none";
  result.style.display = "block";

  // celebratory heart storm
  heartStorm(22);
}

function heartStorm(seconds = 14){
  const end = performance.now() + seconds * 1000;
  function spam(){
    if (!motionEnabled) return;
    for (let i = 0; i < 4; i++){
      spawnHeart(rand(0, W), rand(0, H));
    }
    if (performance.now() < end) requestAnimationFrame(spam);
  }
  spam();
}

yesBtn.addEventListener("click", showResult);

replayBtn?.addEventListener("click", () => heartStorm(10));
burstBtn?.addEventListener("click", () => heartStorm(18));

// Initial nicer button placement for small screens (avoid overlap)
function layoutButtons(){
  const z = zone.getBoundingClientRect();
  // reset to CSS defaults when large
  if (window.innerWidth > 860){
    noBtn.style.left = "64%";
    noBtn.style.top = "40%";
    noBtn.style.transform = "translateY(-50%)";
    yesBtn.style.left = "16%";
    yesBtn.style.top = "40%";
    yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;
    return;
  }

  // smaller screens
  noBtn.style.left = "56%";
  noBtn.style.top = "40%";
  noBtn.style.transform = "translateY(-50%)";
  yesBtn.style.left = "10%";
  yesBtn.style.top = "40%";
  yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;
}
layoutButtons();
window.addEventListener("resize", layoutButtons);
