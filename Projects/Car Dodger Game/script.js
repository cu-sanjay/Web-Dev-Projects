const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 360, H = 600;
canvas.width = W;
canvas.height = H;

const timeVal = document.getElementById('timeVal');
const scoreVal = document.getElementById('scoreVal');
const speedVal = document.getElementById('speedVal');
const bestVal = document.getElementById('bestVal');
const overlay = document.getElementById('overlay');
const resetBtn = document.getElementById('resetBtn');
const moTime = document.getElementById('moTime');
const moScore = document.getElementById('moScore');
const moBest = document.getElementById('moBest');

const STORAGE_KEY = 'cardodger_best';
const LANE_COUNT = 4;
const LANE_W = 70;
const ROAD_LEFT = 40;
const PLAYER_W = 36, PLAYER_H = 56;
const BASE_SPEED = 3;
const DIFFICULTY_INTERVAL = 10;

let bestScore = 0;
let score = 0;
let survivalTime = 0;
let speedMultiplier = 1;
let gameRunning = false;
let animId = null;
let roadOffset = 0;
let shake = 0;
let spawnTimer = 0;
let spawnInterval = 50;
let difficultyTimer = 0;
let player = { x: 0, y: H - 100, targetX: 0 };
let enemies = [];
let keys = { left: false, right: false };

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

function getLaneX(lane) {
  return ROAD_LEFT + lane * LANE_W + (LANE_W - PLAYER_W) / 2;
}

function resetGame() {
  score = 0;
  survivalTime = 0;
  speedMultiplier = 1;
  roadOffset = 0;
  shake = 0;
  spawnTimer = 0;
  spawnInterval = 50;
  difficultyTimer = 0;
  enemies = [];
  player.targetX = getLaneX(1);
  player.x = player.targetX;
  player.y = H - 100;
  updateHUD();
  overlay.classList.remove('active');
  gameRunning = true;
}

function updateHUD() {
  timeVal.textContent = Math.floor(survivalTime) + 's';
  scoreVal.textContent = score;
  speedVal.textContent = speedMultiplier.toFixed(1) + '×';
  bestVal.textContent = bestScore;
}

function spawnEnemy() {
  const lane = Math.floor(Math.random() * LANE_COUNT);
  const colors = ['#eab308', '#f97316', '#ef4444', '#a855f7', '#06b6d4'];
  enemies.push({
    x: ROAD_LEFT + lane * LANE_W + (LANE_W - 32) / 2,
    y: -60,
    w: 32,
    h: 50,
    speed: 1 + Math.random() * 0.8,
    color: colors[Math.floor(Math.random() * colors.length)],
    lane: lane,
  });
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function gameOver() {
  gameRunning = false;
  if (animId) cancelAnimationFrame(animId);
  shake = 8;

  if (score > bestScore) {
    bestScore = score;
    bestVal.textContent = bestScore;
    saveBest(bestScore);
  }

  moTime.textContent = Math.floor(survivalTime) + 's';
  moScore.textContent = score;
  moBest.textContent = bestScore;

  setTimeout(() => {
    overlay.classList.add('active');
    shake = 0;
  }, 400);
}

function update() {
  if (!gameRunning) return;

  if (keys.left && player.targetX > ROAD_LEFT) player.targetX -= LANE_W;
  if (keys.right && player.targetX < ROAD_LEFT + (LANE_COUNT - 1) * LANE_W) player.targetX += LANE_W;
  player.targetX = Math.max(ROAD_LEFT, Math.min(ROAD_LEFT + (LANE_COUNT - 1) * LANE_W, player.targetX));
  player.x += (player.targetX - player.x) * 0.18;

  const speed = BASE_SPEED * speedMultiplier;
  roadOffset = (roadOffset + speed) % 40;

  survivalTime += 1 / 60;
  score += Math.floor(speed * 0.5);
  difficultyTimer += 1 / 60;

  if (difficultyTimer >= DIFFICULTY_INTERVAL) {
    difficultyTimer = 0;
    speedMultiplier = Math.min(speedMultiplier + 0.3, 3.5);
    spawnInterval = Math.max(spawnInterval - 4, 18);
  }

  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    if (Math.random() < 0.75) spawnEnemy();
  }

  enemies = enemies.filter(e => e.y < H + 20);
  for (const e of enemies) {
    e.y += e.speed * speedMultiplier;
  }

  for (const e of enemies) {
    if (aabb(
      { x: player.x, y: player.y, w: PLAYER_W, h: PLAYER_H },
      { x: e.x, y: e.y, w: e.w, h: e.h }
    )) {
      gameOver();
      return;
    }
  }

  updateHUD();
}

function drawRoad() {
  ctx.fillStyle = '#1a1f33';
  ctx.fillRect(ROAD_LEFT - 4, 0, LANE_W * LANE_COUNT + 8, H);

  ctx.fillStyle = 'rgba(236, 72, 153, 0.06)';
  ctx.fillRect(ROAD_LEFT - 4, 0, 2, H);
  ctx.fillRect(ROAD_LEFT + LANE_W * LANE_COUNT + 6, 0, 2, H);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let i = 1; i < LANE_COUNT; i++) {
    const lx = ROAD_LEFT + i * LANE_W;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, H);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  for (let y = -40 + roadOffset; y < H; y += 40) {
    ctx.fillRect(W / 2 - 1.5, y, 3, 22);
  }
}

function drawPlayerCar(x, y) {
  ctx.save();
  ctx.translate(x + PLAYER_W / 2, y + PLAYER_H / 2);

  ctx.shadowColor = 'rgba(236, 72, 153, 0.3)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#ec4899';
  roundRect(ctx, -PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H, 8);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, -PLAYER_W / 2 + 5, -PLAYER_H / 2 + 5, PLAYER_W - 14, 12, 3);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  roundRect(ctx, -PLAYER_W / 2 + 5, -PLAYER_H / 2 + 24, PLAYER_W - 14, 14, 3);
  ctx.fill();

  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(-PLAYER_W / 2 + 4, -PLAYER_H / 2 + 4, 2.5, 0, Math.PI * 2);
  ctx.arc(PLAYER_W / 2 - 4, -PLAYER_H / 2 + 4, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#be123c';
  ctx.beginPath();
  ctx.arc(-PLAYER_W / 2 + 5, PLAYER_H / 2 - 4, 3, 0, Math.PI * 2);
  ctx.arc(PLAYER_W / 2 - 5, PLAYER_H / 2 - 4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawEnemyCar(e) {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);

  ctx.shadowColor = 'rgba(234, 179, 8, 0.15)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = e.color;
  roundRect(ctx, -e.w / 2, -e.h / 2, e.w, e.h, 6);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  roundRect(ctx, -e.w / 2 + 4, -e.h / 2 + 4, e.w - 12, 10, 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  roundRect(ctx, -e.w / 2 + 4, -e.h / 2 + 20, e.w - 12, 12, 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.arc(-e.w / 2 + 4, e.h / 2 - 3, 2.5, 0, Math.PI * 2);
  ctx.arc(e.w / 2 - 4, e.h / 2 - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
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
}

function draw() {
  ctx.save();
  if (shake > 0) {
    const sx = (Math.random() - 0.5) * shake;
    const sy = (Math.random() - 0.5) * shake;
    ctx.translate(sx, sy);
    shake *= 0.92;
    if (shake < 0.5) shake = 0;
  }

  ctx.clearRect(-10, -10, W + 20, H + 20);

  ctx.fillStyle = '#080c1a';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(236, 72, 153, 0.02)';
  for (let i = 0; i < W; i += 80) {
    ctx.fillRect(i, 0, 1, H);
  }

  drawRoad();
  for (const e of enemies) drawEnemyCar(e);
  drawPlayerCar(player.x, player.y);

  ctx.restore();
}

function loop() {
  update();
  draw();
  if (gameRunning) animId = requestAnimationFrame(loop);
}

function handleKeyDown(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') { keys.left = true; e.preventDefault(); }
  if (e.key === 'ArrowRight' || e.key === 'd') { keys.right = true; e.preventDefault(); }
}

function handleKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
}

function handleTouch(e) {
  e.preventDefault();
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const tx = e.touches[0].clientX - rect.left;
  const mid = rect.width / 2;
  if (tx < mid) {
    player.targetX = Math.max(ROAD_LEFT, player.targetX - LANE_W);
  } else {
    player.targetX = Math.min(ROAD_LEFT + (LANE_COUNT - 1) * LANE_W, player.targetX + LANE_W);
  }
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
resetBtn.addEventListener('click', () => { resetGame(); loop(); });

loadBest();
resetGame();
loop();