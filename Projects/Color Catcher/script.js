const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 400, H = 500;
canvas.width = W;
canvas.height = H;

const scoreVal = document.getElementById('scoreVal');
const comboVal = document.getElementById('comboVal');
const livesVal = document.getElementById('livesVal');
const bestVal = document.getElementById('bestVal');
const overlay = document.getElementById('overlay');
const resetBtn = document.getElementById('resetBtn');
const moScore = document.getElementById('moScore');
const moCombo = document.getElementById('moCombo');
const moBest = document.getElementById('moBest');

const STORAGE_KEY = 'colorcatcher_best';
const COLORS = ['#ff2a5f', '#00f0ff', '#facc15'];
const COLOR_NAMES = ['pink', 'cyan', 'yellow'];
const CATCHER_W = 80, CATCHER_H = 14;
const ITEM_R = 12;
const BASE_GRAVITY = 0.15;
const BASE_SPAWN = 50;
const MAX_LIVES = 3;

let score = 0;
let bestScore = 0;
let combo = 1;
let maxCombo = 1;
let lives = MAX_LIVES;
let catcher = { x: W / 2 - CATCHER_W / 2, y: H - 28, colorIdx: 0 };
let items = [];
let particles = [];
let spawnTimer = 0;
let spawnInterval = BASE_SPAWN;
let gravity = BASE_GRAVITY;
let flashTimer = 0;
let gameRunning = false;
let animId = null;
let keys = { left: false, right: false };

function loadBest() {
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY));
    if (!isNaN(saved) && saved > 0) { bestScore = saved; bestVal.textContent = bestScore; }
  } catch {}
}

function saveBest(v) {
  try { localStorage.setItem(STORAGE_KEY, v); } catch {}
}

function resetGame() {
  score = 0; combo = 1; maxCombo = 1; lives = MAX_LIVES;
  items = []; particles = [];
  spawnTimer = 0; spawnInterval = BASE_SPAWN; gravity = BASE_GRAVITY;
  flashTimer = 0;
  catcher.colorIdx = 0;
  catcher.x = W / 2 - CATCHER_W / 2;
  updateHUD();
  overlay.classList.remove('active');
  gameRunning = true;
}

function updateHUD() {
  scoreVal.textContent = score;
  comboVal.textContent = combo + '×';
  livesVal.textContent = lives;
  bestVal.textContent = bestScore;
}

function spawnItem() {
  const ci = Math.floor(Math.random() * COLORS.length);
  items.push({
    x: ITEM_R + Math.random() * (W - ITEM_R * 2),
    y: -ITEM_R,
    r: ITEM_R,
    colorIdx: ci,
    vy: 0.5 + Math.random() * 1,
  });
}

function aabb(ax, ay, aw, ah, bx, by, br) {
  return ax < bx + br && ax + aw > bx - br && ay < by + br && ay + ah > by - br;
}

function addSplash(x, y, color) {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      color,
      r: 2 + Math.random() * 3,
    });
  }
}

function gameOver() {
  gameRunning = false;
  if (animId) cancelAnimationFrame(animId);

  if (score > bestScore) {
    bestScore = score;
    bestVal.textContent = bestScore;
    saveBest(bestScore);
  }

  moScore.textContent = score;
  moCombo.textContent = maxCombo + '×';
  moBest.textContent = bestScore;

  setTimeout(() => overlay.classList.add('active'), 300);
}

function update() {
  if (!gameRunning) return;

  if (keys.left) catcher.x -= 4;
  if (keys.right) catcher.x += 4;
  catcher.x = Math.max(0, Math.min(W - CATCHER_W, catcher.x));

  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnItem();
    if (Math.random() < 0.3) spawnItem();
  }

  items = items.filter(i => i.y < H + 20);
  for (const i of items) {
    i.vy += gravity;
    i.y += i.vy;

    if (aabb(catcher.x, catcher.y, CATCHER_W, CATCHER_H, i.x, i.y, i.r)) {
      if (i.colorIdx === catcher.colorIdx) {
        const pts = 10 * combo;
        score += pts;
        combo = Math.min(combo + 1, 20);
        maxCombo = Math.max(maxCombo, combo);
        addSplash(i.x, i.y, COLORS[i.colorIdx]);
        i.y = H + 30;
        if (score % 50 === 0) {
          gravity = Math.min(gravity + 0.04, 0.6);
          spawnInterval = Math.max(spawnInterval - 3, 18);
        }
      } else {
        combo = 1;
        lives--;
        flashTimer = 12;
        i.y = H + 30;
        if (lives <= 0) { gameOver(); return; }
      }
      updateHUD();
    }

    if (i.y > H - 20 && i.y < H + 20) {
      combo = 1;
      lives--;
      flashTimer = 12;
      updateHUD();
      if (lives <= 0) { gameOver(); return; }
    }
  }

  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life -= 0.035;
  }

  if (flashTimer > 0) flashTimer--;
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#080c18';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let y = 0; y < H; y += 30) { ctx.fillRect(0, y, W, 1); }

  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  for (const i of items) {
    ctx.beginPath();
    ctx.arc(i.x, i.y, i.r, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[i.colorIdx];
    ctx.shadowColor = COLORS[i.colorIdx];
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(i.x - i.r * 0.25, i.y - i.r * 0.25, i.r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  const cx = catcher.x, cy = catcher.y, cw = CATCHER_W, ch = CATCHER_H;
  ctx.shadowColor = COLORS[catcher.colorIdx];
  ctx.shadowBlur = 16;
  ctx.fillStyle = COLORS[catcher.colorIdx];
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + cw, cy);
  ctx.lineTo(cx + cw - 8, cy + ch);
  ctx.lineTo(cx + 8, cy + ch);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(cx + 12, cy + 2, cw - 24, 3);

  if (flashTimer > 0 && flashTimer % 4 < 2) {
    ctx.fillStyle = 'rgba(255, 42, 95, 0.06)';
    ctx.fillRect(0, 0, W, H);
  }
}

function loop() {
  update();
  draw();
  if (gameRunning) animId = requestAnimationFrame(loop);
}

function cycleColor() {
  if (!gameRunning) return;
  catcher.colorIdx = (catcher.colorIdx + 1) % COLORS.length;
}

function handleKeyDown(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') { keys.left = true; e.preventDefault(); }
  if (e.key === 'ArrowRight' || e.key === 'd') { keys.right = true; e.preventDefault(); }
  if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); cycleColor(); }
}

function handleKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
}

canvas.addEventListener('mousemove', (e) => {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  catcher.x = Math.max(0, Math.min(W - CATCHER_W, mx - CATCHER_W / 2));
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.touches[0].clientX - rect.left) * (W / rect.width);
  catcher.x = Math.max(0, Math.min(W - CATCHER_W, mx - CATCHER_W / 2));
}, { passive: false });

canvas.addEventListener('click', cycleColor);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); cycleColor(); }, { passive: false });

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
resetBtn.addEventListener('click', () => { resetGame(); loop(); });

loadBest();
resetGame();
loop();
