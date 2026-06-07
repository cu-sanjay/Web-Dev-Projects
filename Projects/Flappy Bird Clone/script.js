const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 320, H = 480;
canvas.width = W;
canvas.height = H;

const scoreVal = document.getElementById('scoreVal');
const velVal = document.getElementById('velVal');
const bestVal = document.getElementById('bestVal');
const overlay = document.getElementById('overlay');
const resetBtn = document.getElementById('resetBtn');
const moScore = document.getElementById('moScore');
const moBest = document.getElementById('moBest');

const STORAGE_KEY = 'flappybird_best';

const GRAVITY = 0.18;
const JUMP_FORCE = -4.5;
const PIPE_W = 40;
const GAP = 110;
const PIPE_SPEED = 1.8;
const BIRD_R = 10;
const GROUND_Y = H - 10;

let score = 0;
let bestScore = 0;
let bird = {};
let pipes = [];
let frameCount = 0;
let gameRunning = false;
let animId = null;
let shakeTimer = 0;
let started = false;

function loadBest() {
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY));
    if (!isNaN(saved) && saved > 0) { bestScore = saved; bestVal.textContent = bestScore; }
  } catch {}
}

function saveBest(v) {
  try { localStorage.setItem(STORAGE_KEY, v); } catch {}
}

function resetBird() {
  bird = { x: 60, y: H / 2, vy: 0, r: BIRD_R };
}

function resetGame() {
  score = 0; pipes = []; frameCount = 0; shakeTimer = 0; started = false;
  resetBird();
  updateHUD();
  overlay.classList.remove('active');
  gameRunning = true;
}

function updateHUD() {
  scoreVal.textContent = score;
  velVal.textContent = bird.vy.toFixed(1);
  bestVal.textContent = bestScore;
}

function spawnPipe() {
  const topH = 40 + Math.random() * (H - 150 - GAP);
  pipes.push({ x: W, topH, scored: false });
}

function circleRect(cx, cy, cr, rx, ry, rw, rh) {
  const nearX = Math.max(rx, Math.min(cx, rx + rw));
  const nearY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearX, dy = cy - nearY;
  return dx * dx + dy * dy < cr * cr;
}

function gameOver() {
  gameRunning = false;
  if (animId) cancelAnimationFrame(animId);
  if (score > bestScore) { bestScore = score; bestVal.textContent = bestScore; saveBest(bestScore); }
  moScore.textContent = score;
  moBest.textContent = bestScore;
  setTimeout(() => overlay.classList.add('active'), 400);
}

function flap() {
  if (!gameRunning) return;
  bird.vy = JUMP_FORCE;
  if (!started) {
    started = true;
    spawnPipe();
  }
}

function update() {
  if (!gameRunning) return;

  bird.vy += GRAVITY;
  bird.y += bird.vy;

  if (bird.y - bird.r < 0) { bird.y = bird.r; bird.vy = 0; }
  if (bird.y + bird.r > GROUND_Y) {
    shakeTimer = 12;
    gameOver();
    return;
  }

  frameCount++;

  const nextPipe = pipes.find(p => p.x > bird.x);
  if (started && !nextPipe && pipes.length > 0) {
    if (frameCount > 40) { spawnPipe(); frameCount = 0; }
  } else if (started && pipes.length === 0) {
    spawnPipe();
  }

  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= PIPE_SPEED;

    if (!p.scored && p.x + PIPE_W < bird.x) {
      p.scored = true;
      score++;
      updateHUD();
    }

    const topRect = { x: p.x, y: 0, w: PIPE_W, h: p.topH };
    const botRect = { x: p.x, y: p.topH + GAP, w: PIPE_W, h: H - p.topH - GAP };

    if (circleRect(bird.x, bird.y, bird.r, topRect.x, topRect.y, topRect.w, topRect.h) ||
        circleRect(bird.x, bird.y, bird.r, botRect.x, botRect.y, botRect.w, botRect.h)) {
      shakeTimer = 12;
      gameOver();
      return;
    }

    if (p.x + PIPE_W < 0) pipes.splice(i, 1);
  }

  if (shakeTimer > 0) shakeTimer--;
}

function draw() {
  ctx.save();

  if (shakeTimer > 0) {
    const sx = (Math.random() - 0.5) * shakeTimer * 0.7;
    const sy = (Math.random() - 0.5) * shakeTimer * 0.7;
    ctx.translate(sx, sy);
  }

  ctx.clearRect(-10, -10, W + 20, H + 20);
  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  for (let y = 60; y < GROUND_Y; y += 40) {
    ctx.fillRect(0, y, W, 1);
  }

  for (const p of pipes) {
    const topH = p.topH;
    const botY = topH + GAP;

    ctx.fillStyle = '#10b981';
    ctx.shadowColor = 'rgba(16, 185, 129, 0.25)';
    ctx.shadowBlur = 12;

    ctx.fillRect(p.x, 0, PIPE_W, topH);
    ctx.fillRect(p.x - 3, topH - 12, PIPE_W + 6, 12);

    ctx.fillRect(p.x, botY, PIPE_W, H - botY);
    ctx.fillRect(p.x - 3, botY, PIPE_W + 6, 12);

    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(p.x + 6, 0, 6, topH);
    ctx.fillRect(p.x + 6, botY, 6, H - botY);
  }

  ctx.shadowColor = '#ff2a5f';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ff2a5f';
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.arc(bird.x - 3, bird.y - 3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(bird.x + 3, bird.y - 2, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(bird.x + 4, bird.y - 2, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(W, GROUND_Y);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 4);
  ctx.lineTo(W, GROUND_Y + 4);
  ctx.stroke();

  ctx.restore();
}

function loop() {
  update();
  draw();
  if (gameRunning) animId = requestAnimationFrame(loop);
}

document.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Space') { e.preventDefault(); flap(); }
});

canvas.addEventListener('click', flap);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); }, { passive: false });

resetBtn.addEventListener('click', () => { resetGame(); loop(); });

loadBest();
resetGame();
loop();
