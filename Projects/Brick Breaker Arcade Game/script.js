const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = 600, H = 400;
canvas.width = W;
canvas.height = H;

const scoreVal = document.getElementById('scoreVal');
const highScoreVal = document.getElementById('highScoreVal');
const livesVal = document.getElementById('livesVal');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const resetBtn = document.getElementById('resetBtn');

const BRICK_W = 60, BRICK_H = 18, BRICK_GAP = 4;
const COLS = 8, ROWS = 6;
const PADDLE_W = 90, PADDLE_H = 12;
const BALL_R = 6;
const MAX_LIVES = 3;
const TIER_COLORS = ['#f43f5e', '#fb7185', '#06b6d4'];

const STORAGE_KEY = 'brickbreaker_high';

let score = 0;
let highScore = 0;
let lives = MAX_LIVES;
let bricks = [];
let paddle = { x: W / 2 - PADDLE_W / 2, y: H - 30 };
let ball = { x: W / 2, y: H - 44, dx: 3, dy: -3 };
let running = false;
let animId = null;
let keys = { left: false, right: false };

function createBricks() {
  bricks = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const hp = r < 3 ? 2 : 1;
      bricks.push({
        x: c * (BRICK_W + BRICK_GAP) + BRICK_GAP,
        y: r * (BRICK_H + BRICK_GAP) + BRICK_GAP + 30,
        w: BRICK_W,
        h: BRICK_H,
        hp,
        maxHp: hp,
        alive: true,
      });
    }
  }
}

function getBrickColor(b) {
  const t = b.maxHp === 2 ? 0 : 2;
  if (b.hp === b.maxHp) return TIER_COLORS[t];
  return TIER_COLORS[t + 1];
}

function resetBall() {
  ball.x = W / 2;
  ball.y = H - 44;
  const angle = (Math.random() * 0.8 - 0.4);
  const speed = 4;
  ball.dx = Math.sin(angle) * speed;
  ball.dy = -Math.cos(angle) * speed;
}

function resetGame() {
  score = 0;
  lives = MAX_LIVES;
  paddle.x = W / 2 - PADDLE_W / 2;
  createBricks();
  resetBall();
  updateHUD();
  overlay.classList.remove('active');
  running = true;
}

function updateHUD() {
  scoreVal.textContent = score;
  livesVal.textContent = lives;
  highScoreVal.textContent = highScore;
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    highScoreVal.textContent = highScore;
    try { localStorage.setItem(STORAGE_KEY, highScore); } catch {}
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, BALL_R);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.6, '#e2e8f0');
  grad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowColor = 'rgba(255,255,255,0.4)';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawPaddle() {
  const r = 6;
  const x = paddle.x, y = paddle.y, w = PADDLE_W, h = PADDLE_H;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, '#06b6d4');
  grad.addColorStop(0.5, '#0891b2');
  grad.addColorStop(1, '#0e7490');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowColor = 'rgba(6,182,212,0.3)';
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawBricks() {
  for (const b of bricks) {
    if (!b.alive) continue;
    const x = b.x, y = b.y, w = b.w, h = b.h;
    const r = 3;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    const color = getBrickColor(b);
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, color);
    grad.addColorStop(1, b.maxHp === 2 ? '#9f1239' : '#0e7490');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = color + '66';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (b.maxHp === 2 && b.hp === 2) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x + 4, y + 3, w - 8, h / 3);
    }
  }
}

function drawTrail() {
  for (let i = 4; i >= 1; i--) {
    ctx.beginPath();
    ctx.arc(ball.x - ball.dx * i * 1.2, ball.y - ball.dy * i * 1.2, BALL_R * (1 - i * 0.15), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.08 - i * 0.015})`;
    ctx.fill();
  }
}

function update() {
  if (!running) return;

  if (keys.left) paddle.x -= 5;
  if (keys.right) paddle.x += 5;
  paddle.x = Math.max(0, Math.min(W - PADDLE_W, paddle.x));

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x - BALL_R <= 0) { ball.x = BALL_R; ball.dx = -ball.dx; }
  if (ball.x + BALL_R >= W) { ball.x = W - BALL_R; ball.dx = -ball.dx; }
  if (ball.y - BALL_R <= 0) { ball.y = BALL_R; ball.dy = -ball.dy; }

  if (ball.y + BALL_R >= H) {
    lives--;
    updateHUD();
    if (lives <= 0) {
      endGame(false);
      return;
    }
    resetBall();
    updateHUD();
    return;
  }

  if (
    ball.dy > 0 &&
    ball.y + BALL_R >= paddle.y &&
    ball.y + BALL_R <= paddle.y + PADDLE_H + 4 &&
    ball.x >= paddle.x - BALL_R &&
    ball.x <= paddle.x + PADDLE_W + BALL_R
  ) {
    ball.y = paddle.y - BALL_R;
    const hitPos = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2);
    const angle = hitPos * (Math.PI / 3);
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    ball.dx = Math.sin(angle) * speed;
    ball.dy = -Math.cos(angle) * speed;
    ball.dy = Math.min(ball.dy, -2.5);
  }

  let allCleared = true;
  for (const b of bricks) {
    if (!b.alive) continue;
    allCleared = false;
    if (
      ball.x + BALL_R > b.x &&
      ball.x - BALL_R < b.x + b.w &&
      ball.y + BALL_R > b.y &&
      ball.y - BALL_R < b.y + b.h
    ) {
      const overlapX = Math.min(ball.x + BALL_R - b.x, b.x + b.w - (ball.x - BALL_R));
      const overlapY = Math.min(ball.y + BALL_R - b.y, b.y + b.h - (ball.y - BALL_R));

      if (overlapX < overlapY) {
        ball.dx = -ball.dx;
      } else {
        ball.dy = -ball.dy;
      }

      b.hp--;
      if (b.hp <= 0) {
        b.alive = false;
        score += b.maxHp === 2 ? 15 : 10;
        updateHighScore();
      }
      updateHUD();
      break;
    }
  }

  if (allCleared) {
    endGame(true);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(6, 7, 19, 0.15)';
  for (let i = 0; i < W; i += 20) {
    for (let j = 0; j < H; j += 20) {
      if ((i + j) % 40 === 0) {
        ctx.fillRect(i, j, 1, 1);
      }
    }
  }

  drawTrail();
  drawBricks();
  drawPaddle();
  drawBall();
}

function loop() {
  update();
  draw();
  animId = requestAnimationFrame(loop);
}

function endGame(won) {
  running = false;
  if (animId) cancelAnimationFrame(animId);
  if (won) {
    modalTitle.textContent = 'Victory!';
    modalTitle.className = 'modal-title win';
    modalBody.innerHTML = 'All bricks destroyed!<span>Score: ' + score + '</span>';
  } else {
    modalTitle.textContent = 'Game Over';
    modalTitle.className = 'modal-title';
    modalBody.innerHTML = 'You ran out of lives.<span>Score: ' + score + '</span>';
  }
  overlay.classList.add('active');
}

function handleMouseMove(e) {
  if (!running) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const mx = (e.clientX - rect.left) * scaleX;
  paddle.x = Math.max(0, Math.min(W - PADDLE_W, mx - PADDLE_W / 2));
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!running) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const tx = (e.touches[0].clientX - rect.left) * scaleX;
  paddle.x = Math.max(0, Math.min(W - PADDLE_W, tx - PADDLE_W / 2));
}

function handleKeyDown(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
}

function handleKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
}

function loadHighScore() {
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY));
    if (!isNaN(saved) && saved >= 0) {
      highScore = saved;
      highScoreVal.textContent = highScore;
    }
  } catch {}
}

canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
resetBtn.addEventListener('click', resetGame);

loadHighScore();
resetGame();
loop();
