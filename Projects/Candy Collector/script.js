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

const STORAGE_KEY = 'candycollector_best';

const CANDY_TYPES = [
  { color: '#ff2a5f', pts: 10, label: 'pink' },
  { color: '#00f0ff', pts: 15, label: 'cyan' },
  { color: '#a855f7', pts: 20, label: 'purple' },
  { color: '#facc15', pts: 30, label: 'gold' },
];
const BOMB_COLOR = '#1e293b';
const BASKET_W = 80, BASKET_H = 14;
const ITEM_R = 11;
const BASE_GRAVITY = 0.12;
const BASE_SPAWN = 55;
const MAX_LIVES = 3;

let score = 0;
let bestScore = 0;
let combo = 1;
let maxCombo = 1;
let lives = MAX_LIVES;
let basket = { x: W / 2 - BASKET_W / 2, y: H - 28 };
let items = [];
let particles = [];
let floatTexts = [];
let spawnTimer = 0;
let spawnInterval = BASE_SPAWN;
let gravity = BASE_GRAVITY;
let flashTimer = 0;
let shakeTimer = 0;
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
  items = []; particles = []; floatTexts = [];
  spawnTimer = 0; spawnInterval = BASE_SPAWN; gravity = BASE_GRAVITY;
  flashTimer = 0; shakeTimer = 0;
  basket.x = W / 2 - BASKET_W / 2;
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
  const isBomb = Math.random() < 0.18;
  if (isBomb) {
    items.push({
      x: ITEM_R + Math.random() * (W - ITEM_R * 2),
      y: -ITEM_R, r: ITEM_R,
      type: 'bomb', vy: 0.5 + Math.random() * 1.2,
    });
  } else {
    const ci = Math.floor(Math.random() * CANDY_TYPES.length);
    items.push({
      x: ITEM_R + Math.random() * (W - ITEM_R * 2),
      y: -ITEM_R, r: ITEM_R,
      type: 'candy', ci, vy: 0.5 + Math.random() * 1,
    });
  }
}

function aabb(bx, by, bw, bh, cx, cy, cr) {
  return bx < cx + cr && bx + bw > cx - cr && by < cy + cr && by + bh > cy - cr;
}

function addSplash(x, y, color, count) {
  for (let i = 0; i < (count || 10); i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1 + Math.random() * 3;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color, r: 2 + Math.random() * 3 });
  }
}

function addFloatText(x, y, text, color) {
  floatTexts.push({ x, y, text, color, life: 1 });
}

function gameOver() {
  gameRunning = false;
  if (animId) cancelAnimationFrame(animId);
  if (score > bestScore) { bestScore = score; bestVal.textContent = bestScore; saveBest(bestScore); }
  moScore.textContent = score;
  moCombo.textContent = maxCombo + '×';
  moBest.textContent = bestScore;
  setTimeout(() => overlay.classList.add('active'), 300);
}

function handleMiss() {
  combo = 1; lives--; flashTimer = 10; shakeTimer = 8;
  updateHUD();
  if (lives <= 0) { gameOver(); return true; }
  return false;
}

function update() {
  if (!gameRunning) return;

  if (keys.left) basket.x -= 4.5;
  if (keys.right) basket.x += 4.5;
  basket.x = Math.max(0, Math.min(W - BASKET_W, basket.x));

  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnItem();
    if (Math.random() < 0.25) spawnItem();
  }

  items = items.filter(i => i.y < H + 20);
  for (const i of items) {
    i.vy += gravity;
    i.y += i.vy;

    if (aabb(basket.x, basket.y, BASKET_W, BASKET_H, i.x, i.y, i.r)) {
      if (i.type === 'candy') {
        const ct = CANDY_TYPES[i.ci];
        const pts = ct.pts * combo;
        score += pts;
        combo = Math.min(combo + 1, 20);
        maxCombo = Math.max(maxCombo, combo);
        addSplash(i.x, i.y, ct.color, 12);
        addFloatText(i.x, i.y - 10, '+' + pts, ct.color);
        if (score > 0 && score % 40 === 0) {
          gravity = Math.min(gravity + 0.03, 0.55);
          spawnInterval = Math.max(spawnInterval - 2, 16);
        }
      } else {
        combo = 1;
        lives--;
        flashTimer = 12;
        shakeTimer = 10;
        addSplash(i.x, i.y, '#ef4444', 16);
        addFloatText(i.x, i.y - 10, '💥', '#ef4444');
        if (lives <= 0) { gameOver(); return; }
      }
      i.y = H + 30;
      updateHUD();
      continue;
    }

    if (i.y > H - 20 && i.y < H + 20) {
      if (handleMiss()) return;
      i.y = H + 30;
    }
  }

  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.03;
  }

  floatTexts = floatTexts.filter(f => f.life > 0);
  for (const f of floatTexts) {
    f.y -= 1; f.life -= 0.025;
  }

  if (flashTimer > 0) flashTimer--;
  if (shakeTimer > 0) shakeTimer--;
}

function draw() {
  ctx.save();

  if (shakeTimer > 0) {
    const sx = (Math.random() - 0.5) * shakeTimer;
    const sy = (Math.random() - 0.5) * shakeTimer;
    ctx.translate(sx, sy);
  }

  ctx.clearRect(-10, -10, W + 20, H + 20);
  ctx.fillStyle = '#0c0918';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  for (let y = 0; y < H; y += 30) ctx.fillRect(0, y, W, 1);

  for (const f of floatTexts) {
    ctx.globalAlpha = f.life;
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  for (const i of items) {
    if (i.type === 'bomb') {
      ctx.beginPath();
      ctx.arc(i.x, i.y, i.r, 0, Math.PI * 2);
      ctx.fillStyle = BOMB_COLOR;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.08)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✕', i.x, i.y + 1);
    } else {
      const ct = CANDY_TYPES[i.ci];
      ctx.beginPath();
      ctx.arc(i.x, i.y, i.r, 0, Math.PI * 2);
      ctx.fillStyle = ct.color;
      ctx.shadowColor = ct.color;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.arc(i.x - i.r * 0.25, i.y - i.r * 0.25, i.r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const bx = basket.x, by = basket.y;
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + BASKET_W, by);
  ctx.lineTo(bx + BASKET_W - 8, by + BASKET_H);
  ctx.lineTo(bx + 8, by + BASKET_H);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(bx + 14, by + 2, BASKET_W - 28, 3);

  if (flashTimer > 0 && flashTimer % 3 < 2) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.07)';
    ctx.fillRect(-10, -10, W + 20, H + 20);
  }

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

canvas.addEventListener('mousemove', (e) => {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  basket.x = Math.max(0, Math.min(W - BASKET_W, mx - BASKET_W / 2));
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.touches[0].clientX - rect.left) * (W / rect.width);
  basket.x = Math.max(0, Math.min(W - BASKET_W, mx - BASKET_W / 2));
}, { passive: false });

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
resetBtn.addEventListener('click', () => { resetGame(); loop(); });

loadBest();
resetGame();
loop();
