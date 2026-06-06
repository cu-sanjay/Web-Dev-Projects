const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 600, H = 400;
canvas.width = W;
canvas.height = H;

const scoreVal = document.getElementById('scoreVal');
const bestVal = document.getElementById('bestVal');
const arrowVal = document.getElementById('arrowVal');
const accVal = document.getElementById('accVal');
const diffSelect = document.getElementById('diffSelect');
const windArrow = document.getElementById('windArrow');
const windVal = document.getElementById('windVal');
const overlay = document.getElementById('overlay');
const resetBtn = document.getElementById('resetBtn');
const finalScore = document.getElementById('finalScore');
const finalShots = document.getElementById('finalShots');
const finalHits = document.getElementById('finalHits');
const finalAcc = document.getElementById('finalAcc');
const finalBest = document.getElementById('finalBest');
const modalTitle = document.getElementById('modalTitle');

const STORAGE_KEY = 'archery_best';
const BOW_X = 50, BOW_Y = 200;
const TARGET_X = 480;
const TARGET_R = 60;
const BULLSEYE_R = 18;
const INNER_R = 38;
const GRAVITY = 0.06;
const MAX_POWER = 12;
const MIN_POWER = 3;

const diffConfig = {
  easy: { speed: 0.6, amplitude: 30, windRange: 0.6, arrows: 12 },
  medium: { speed: 1.2, amplitude: 50, windRange: 1.2, arrows: 10 },
  hard: { speed: 2.0, amplitude: 70, windRange: 2.5, arrows: 8 },
};

let score = 0;
let bestScore = 0;
let arrowsLeft = 10;
let hits = 0;
let shots = 0;
let arrows = [];
let wind = 0;
let targetY = H / 2;
let aimX = BOW_X;
let aimY = BOW_Y;
let isAiming = false;
let locked = false;
let animId = null;
let targetPhase = 0;

function loadBest() {
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY));
    if (!isNaN(saved) && saved >= 0) {
      bestScore = saved;
      bestVal.textContent = bestScore;
    }
  } catch {}
}

function saveBest(v) {
  try { localStorage.setItem(STORAGE_KEY, v); } catch {}
}

function getDiff() {
  return diffConfig[diffSelect.value] || diffConfig.medium;
}

function newWind() {
  const d = getDiff();
  wind = (Math.random() * 2 - 1) * d.windRange;
  windArrow.textContent = wind > 0.2 ? '→' : wind < -0.2 ? '←' : '→';
  windArrow.style.transform = wind > 0.2 ? 'scaleX(1.3)' : wind < -0.2 ? 'scaleX(-1.3)' : 'scaleX(1)';
  windVal.textContent = Math.abs(wind).toFixed(1);
}

function resetGame() {
  score = 0;
  arrowsLeft = getDiff().arrows;
  hits = 0;
  shots = 0;
  arrows = [];
  locked = false;
  overlay.classList.remove('active');
  newWind();
  updateHUD();
  targetPhase = 0;
  scoreVal.textContent = '0';
  arrowVal.textContent = arrowsLeft;
  accVal.textContent = '0%';
}

function updateHUD() {
  scoreVal.textContent = score;
  arrowVal.textContent = arrowsLeft;
  accVal.textContent = shots === 0 ? '0%' : Math.round((hits / shots) * 100) + '%';
}

function fireArrow() {
  if (locked || arrowsLeft <= 0) return;

  const dx = aimX - BOW_X;
  const dy = aimY - BOW_Y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 20) return;

  const power = Math.min(dist / 8, MAX_POWER);
  const speed = Math.max(power, MIN_POWER);
  const angle = Math.atan2(dy, dx);

  arrows.push({
    x: BOW_X,
    y: BOW_Y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    alive: true,
    scored: false,
    trail: [],
  });

  arrowsLeft--;
  shots++;
  isAiming = false;
  newWind();
  updateHUD();
}

function checkArrowCollision(a) {
  if (a.scored || !a.alive) return;
  const dx = a.x - TARGET_X;
  const dy = a.y - targetY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > TARGET_R + 6) return;
  a.scored = true;
  a.alive = false;
  hits++;

  let pts = 0;
  if (dist <= BULLSEYE_R) pts = 100;
  else if (dist <= INNER_R) pts = 50;
  else pts = 20;

  score += pts;
  updateHUD();

  if (score > bestScore) {
    bestScore = score;
    bestVal.textContent = bestScore;
    saveBest(bestScore);
  }
}

function updateArrows() {
  for (const a of arrows) {
    if (!a.alive) continue;
    a.trail.push({ x: a.x, y: a.y });
    if (a.trail.length > 8) a.trail.shift();

    a.vy += GRAVITY;
    a.vx += wind * 0.008;
    a.x += a.vx;
    a.y += a.vy;

    checkArrowCollision(a);

    if (a.alive && (a.x > W + 20 || a.y > H + 20 || a.x < -20)) {
      a.alive = false;
    }
  }

  if (arrowsLeft <= 0 && arrows.every(a => !a.alive)) {
    endGame();
  }
}

function endGame() {
  locked = true;
  if (animId) cancelAnimationFrame(animId);

  const acc = shots === 0 ? 0 : Math.round((hits / shots) * 100);
  modalTitle.textContent = arrowsLeft <= 0 && score > 0 ? 'Range Complete' : 'Game Over';
  finalScore.textContent = score;
  finalShots.textContent = shots;
  finalHits.textContent = hits;
  finalAcc.textContent = acc + '%';
  finalBest.textContent = bestScore;

  if (score >= bestScore && score > 0) {
    modalTitle.textContent = 'New Best!';
  }

  overlay.classList.add('active');
  draw();
}

function drawAimLine() {
  if (!isAiming) return;
  ctx.beginPath();
  ctx.moveTo(BOW_X, BOW_Y);
  ctx.lineTo(aimX, aimY);
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  const dx = aimX - BOW_X;
  const dy = aimY - BOW_Y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const power = Math.min(dist / 8, MAX_POWER);
  const speed = Math.max(power, MIN_POWER);

  if (dist > 20) {
    const px = Math.cos(Math.atan2(dy, dx)) * speed * 6;
    const py = Math.sin(Math.atan2(dy, dx)) * speed * 6;
    ctx.beginPath();
    ctx.moveTo(BOW_X + px, BOW_Y + py);
    ctx.lineTo(BOW_X + px + px * 0.3, BOW_Y + py + py * 0.3);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const dist2 = Math.min(dist, 120);
    ctx.beginPath();
    ctx.arc(BOW_X, BOW_Y - 30, 3 + dist2 / 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
    ctx.fill();
  }
}

function drawBow() {
  ctx.save();
  const dx = isAiming ? aimX - BOW_X : 0;
  const dy = isAiming ? aimY - BOW_Y : 0;
  const a = Math.atan2(dy, dx);
  ctx.translate(BOW_X, BOW_Y);
  ctx.rotate(a);

  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(22, 0);
  ctx.lineTo(0, 4);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 14, -0.5, 0.5);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(10, -6);
  ctx.lineTo(10, 6);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

function drawTarget() {
  const cx = TARGET_X, cy = targetY;

  ctx.beginPath();
  ctx.arc(cx, cy, TARGET_R + 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.fill();

  const zones = [
    { r: TARGET_R, color: '#1e40af' },
    { r: INNER_R, color: '#dc2626' },
    { r: BULLSEYE_R, color: '#f59e0b' },
  ];
  for (const z of zones) {
    ctx.beginPath();
    ctx.arc(cx, cy, z.r, 0, Math.PI * 2);
    ctx.fillStyle = z.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();
}

function drawArrows() {
  for (const a of arrows) {
    for (let i = 0; i < a.trail.length; i++) {
      const t = a.trail[i];
      const alpha = (i + 1) / a.trail.length * 0.12;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
      ctx.fill();
    }
    if (!a.alive && !a.scored) {
      const fade = Math.max(0, 1 - (a.x - TARGET_X) / 100);
      ctx.globalAlpha = fade * 0.4;
    }
    ctx.save();
    ctx.translate(a.x, a.y);
    const angle = Math.atan2(a.vy, a.vx);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-4, -2.5);
    ctx.lineTo(-4, 2.5);
    ctx.closePath();
    ctx.fillStyle = a.scored ? '#fbbf24' : 'rgba(226, 232, 240, 0.7)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-10, -4);
    ctx.moveTo(-4, 0);
    ctx.lineTo(-10, 4);
    ctx.strokeStyle = a.scored ? '#fbbf24' : 'rgba(226, 232, 240, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(6, 182, 212, 0.02)';
  ctx.fillRect(0, 0, 1, H);
  ctx.fillRect(W / 2, 0, 1, H);
  ctx.fillRect(W - 1, 0, 1, H);
  ctx.fillStyle = 'rgba(251, 191, 36, 0.01)';
  for (let y = 0; y < H; y += 20) {
    ctx.fillRect(BOW_X, y, 1, 1);
  }

  drawTarget();
  drawBow();
  drawAimLine();
  drawArrows();
}

function update() {
  const d = getDiff();
  targetPhase += d.speed * 0.016;
  targetY = H / 2 + Math.sin(targetPhase) * d.amplitude;
  updateArrows();

  if (!locked) draw();
  if (!locked) animId = requestAnimationFrame(update);
}

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function handlePointerDown(e) {
  e.preventDefault();
  if (locked) return;
  const pos = getCanvasPos(e);
  if (pos.x >= BOW_X + 80) {
    isAiming = true;
    aimX = Math.min(pos.x, W);
    aimY = Math.max(10, Math.min(H - 10, pos.y));
    draw();
  }
}

function handlePointerMove(e) {
  e.preventDefault();
  if (!isAiming || locked) return;
  const pos = getCanvasPos(e);
  aimX = Math.min(pos.x, W);
  aimY = Math.max(10, Math.min(H - 10, pos.y));
  draw();
}

function handlePointerUp(e) {
  e.preventDefault();
  if (isAiming && !locked) {
    fireArrow();
  }
  isAiming = false;
  draw();
}

canvas.addEventListener('mousedown', handlePointerDown);
canvas.addEventListener('mousemove', handlePointerMove);
canvas.addEventListener('mouseup', handlePointerUp);
canvas.addEventListener('mouseleave', () => { isAiming = false; });

canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
canvas.addEventListener('touchend', handlePointerUp, { passive: false });
canvas.addEventListener('touchcancel', () => { isAiming = false; }, { passive: false });

diffSelect.addEventListener('change', () => {
  if (!locked) resetGame();
});

resetBtn.addEventListener('click', resetGame);

loadBest();
resetGame();
update();
