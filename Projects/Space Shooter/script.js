const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 360, H = 480;
canvas.width = W;
canvas.height = H;

const scoreVal = document.getElementById('scoreVal');
const shieldVal = document.getElementById('shieldVal');
const waveVal = document.getElementById('waveVal');
const bestVal = document.getElementById('bestVal');
const overlay = document.getElementById('overlay');
const resetBtn = document.getElementById('resetBtn');
const moScore = document.getElementById('moScore');
const moWave = document.getElementById('moWave');
const moKills = document.getElementById('moKills');
const moBest = document.getElementById('moBest');

const STORAGE_KEY = 'spaceshooter_best';

const PLAYER_W = 28, PLAYER_H = 22;
const LASER_W = 3, LASER_H = 12;
const ENEMY_BASIC_W = 26, ENEMY_BASIC_H = 20;
const ENEMY_TANK_W = 34, ENEMY_TANK_H = 28;
const BULLET_R = 3;

let score = 0;
let bestScore = 0;
let shield = 100;
let wave = 1;
let kills = 0;
let player = { x: W / 2 - PLAYER_W / 2, y: H - 60 };
let lasers = [];
let enemies = [];
let enemyBullets = [];
let stars = [];
let particles = [];
let floatTexts = [];
let spawnTimer = 0;
let spawnInterval = 50;
let globalSpeed = 1;
let fireTimer = 0;
let fireCooldown = 10;
let gameRunning = false;
let animId = null;
let flashTimer = 0;
let shakeTimer = 0;
let keys = { up: false, down: false, left: false, right: false, fire: false };

for (let i = 0; i < 80; i++) {
  stars.push({ x: Math.random() * W, y: Math.random() * H, r: 0.3 + Math.random() * 1.2, s: 0.2 + Math.random() * 0.6 });
}

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
  score = 0; shield = 100; wave = 1; kills = 0;
  lasers = []; enemies = []; enemyBullets = []; particles = []; floatTexts = [];
  spawnTimer = 0; spawnInterval = 50; globalSpeed = 1; fireTimer = 0;
  flashTimer = 0; shakeTimer = 0;
  player.x = W / 2 - PLAYER_W / 2; player.y = H - 60;
  updateHUD();
  overlay.classList.remove('active');
  gameRunning = true;
}

function updateHUD() {
  scoreVal.textContent = score;
  shieldVal.textContent = Math.max(0, shield);
  waveVal.textContent = wave;
  bestVal.textContent = bestScore;
}

function fireLaser() {
  lasers.push({ x: player.x + PLAYER_W / 2 - LASER_W / 2, y: player.y - 6, w: LASER_W, h: LASER_H });
}

function spawnEnemy() {
  const isTank = Math.random() < 0.2 + wave * 0.01;
  const ew = isTank ? ENEMY_TANK_W : ENEMY_BASIC_W;
  const eh = isTank ? ENEMY_TANK_H : ENEMY_BASIC_H;
  enemies.push({
    x: Math.random() * (W - ew - 20) + 10, y: -eh,
    w: ew, h: eh, hp: isTank ? 2 : 1,
    speed: (1 + Math.random() * 1.2) * globalSpeed,
    type: isTank ? 'tank' : 'basic',
    fireTimer: 0, fireInterval: 40 + Math.random() * 60,
  });
}

function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function addSplash(x, y, color, count) {
  for (let i = 0; i < (count || 8); i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1 + Math.random() * 2.5;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color, r: 1.5 + Math.random() * 2.5 });
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
  moWave.textContent = wave;
  moKills.textContent = kills;
  moBest.textContent = bestScore;
  setTimeout(() => overlay.classList.add('active'), 400);
}

function update() {
  if (!gameRunning) return;

  const pm = 3;
  if (keys.left) player.x -= pm;
  if (keys.right) player.x += pm;
  if (keys.up) player.y -= pm;
  if (keys.down) player.y += pm;
  player.x = Math.max(0, Math.min(W - PLAYER_W, player.x));
  player.y = Math.max(H * 0.3, Math.min(H - PLAYER_H - 10, player.y));

  fireTimer++;
  if ((keys.fire || fireHeld) && fireTimer >= fireCooldown) {
    fireTimer = 0;
    fireLaser();
  }

  for (let i = lasers.length - 1; i >= 0; i--) {
    lasers[i].y -= 5 * globalSpeed;
    if (lasers[i].y + lasers[i].h < 0) lasers.splice(i, 1);
  }

  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnEnemy();
    if (Math.random() < 0.15 + wave * 0.01) spawnEnemy();
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y += e.speed;
    e.fireTimer++;
    if (e.fireTimer >= e.fireInterval) {
      e.fireTimer = 0;
      enemyBullets.push({ x: e.x + e.w / 2 - BULLET_R, y: e.y + e.h, r: BULLET_R, vy: 2 + Math.random() * 0.8 });
    }
    if (e.y > H + 20) { enemies.splice(i, 1); continue; }

    for (let j = lasers.length - 1; j >= 0; j--) {
      const l = lasers[j];
      if (aabb(l.x, l.y, l.w, l.h, e.x, e.y, e.w, e.h)) {
        e.hp--;
        addSplash(l.x + l.w / 2, l.y, '#3b82f6', 4);
        lasers.splice(j, 1);
        if (e.hp <= 0) {
          const pts = e.type === 'tank' ? 25 : 10;
          score += pts; kills++;
          addSplash(e.x + e.w / 2, e.y + e.h / 2, '#f97316', 14);
          addFloatText(e.x + e.w / 2, e.y, '+' + pts, '#facc15');
          enemies.splice(i, 1);
          if (score > 0 && score % 100 === 0) {
            wave = Math.floor(score / 100) + 1;
            globalSpeed = Math.min(globalSpeed + 0.08, 2);
            spawnInterval = Math.max(spawnInterval - 3, 18);
          }
          updateHUD();
        }
        break;
      }
    }
  }

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    b.y += b.vy * globalSpeed;
    if (b.y > H + 10) { enemyBullets.splice(i, 1); continue; }

    if (aabb(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2, player.x, player.y, PLAYER_W, PLAYER_H)) {
      shield -= 16; flashTimer = 8; shakeTimer = 10;
      addSplash(b.x, b.y, '#ef4444', 10);
      enemyBullets.splice(i, 1);
      updateHUD();
      if (shield <= 0) { gameOver(); return; }
      continue;
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (aabb(player.x, player.y, PLAYER_W, PLAYER_H, e.x, e.y, e.w, e.h)) {
      shield -= 25; flashTimer = 12; shakeTimer = 14;
      addSplash(e.x + e.w / 2, e.y + e.h / 2, '#ef4444', 18);
      enemies.splice(i, 1);
      updateHUD();
      if (shield <= 0) { gameOver(); return; }
    }
  }

  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life -= 0.03;
  }

  floatTexts = floatTexts.filter(f => f.life > 0);
  for (const f of floatTexts) { f.y -= 0.8; f.life -= 0.02; }

  if (flashTimer > 0) flashTimer--;
  if (shakeTimer > 0) shakeTimer--;
}

function draw() {
  ctx.save();

  if (shakeTimer > 0) {
    const sx = (Math.random() - 0.5) * shakeTimer * 0.6;
    const sy = (Math.random() - 0.5) * shakeTimer * 0.6;
    ctx.translate(sx, sy);
  }

  ctx.clearRect(-10, -10, W + 20, H + 20);
  ctx.fillStyle = '#04050a';
  ctx.fillRect(0, 0, W, H);

  for (const s of stars) {
    s.y += s.s;
    if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
    ctx.globalAlpha = 0.3 + s.r * 0.3;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const f of floatTexts) {
    ctx.globalAlpha = f.life;
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 8;
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
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  for (const l of lasers) {
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
    ctx.shadowBlur = 14;
    ctx.fillRect(l.x, l.y, l.w, l.h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(l.x + 1, l.y - 2, l.w - 2, 4);
  }

  for (const b of enemyBullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = '#f97316';
    ctx.shadowColor = 'rgba(249, 115, 22, 0.6)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  for (const e of enemies) {
    const isTank = e.type === 'tank';
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;

    ctx.fillStyle = isTank ? '#dc2626' : '#f97316';
    ctx.shadowColor = isTank ? 'rgba(220, 38, 38, 0.3)' : 'rgba(249, 115, 22, 0.3)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(cx, e.y);
    ctx.lineTo(e.x + e.w, cy);
    ctx.lineTo(cx, e.y + e.h);
    ctx.lineTo(e.x, cy);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(cx, e.y + 3);
    ctx.lineTo(e.x + e.w - 4, cy);
    ctx.lineTo(cx, e.y + e.h - 3);
    ctx.lineTo(e.x + 4, cy);
    ctx.closePath();
    ctx.fill();

    if (isTank) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(cx - 5, cy - 4, 10, 8);
    }
  }

  const px = player.x, py = player.y, cx = px + PLAYER_W / 2;

  ctx.fillStyle = '#3b82f6';
  ctx.shadowColor = 'rgba(59, 130, 246, 0.35)';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(cx, py);
  ctx.lineTo(px + PLAYER_W, py + PLAYER_H);
  ctx.lineTo(px + PLAYER_W - 6, py + PLAYER_H);
  ctx.lineTo(cx, py + PLAYER_H - 4);
  ctx.lineTo(px + 6, py + PLAYER_H);
  ctx.lineTo(px, py + PLAYER_H);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(cx, py + 4);
  ctx.lineTo(px + PLAYER_W - 6, py + PLAYER_H - 2);
  ctx.lineTo(cx, py + PLAYER_H - 8);
  ctx.lineTo(px + 6, py + PLAYER_H - 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.arc(cx, py + PLAYER_H - 6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e3a5f';
  ctx.beginPath();
  ctx.arc(cx, py + PLAYER_H - 6, 2, 0, Math.PI * 2);
  ctx.fill();

  if (flashTimer > 0 && flashTimer % 4 < 2) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.06)';
    ctx.fillRect(-10, -10, W + 20, H + 20);
  }

  ctx.restore();
}

let fireHeld = false;

function loop() {
  update();
  draw();
  if (gameRunning) animId = requestAnimationFrame(loop);
}

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft': case 'a': keys.left = true; e.preventDefault(); break;
    case 'ArrowRight': case 'd': keys.right = true; e.preventDefault(); break;
    case 'ArrowUp': case 'w': keys.up = true; e.preventDefault(); break;
    case 'ArrowDown': case 's': keys.down = true; e.preventDefault(); break;
    case ' ': case 'Space': e.preventDefault(); fireHeld = true; break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'ArrowLeft': case 'a': keys.left = false; break;
    case 'ArrowRight': case 'd': keys.right = false; break;
    case 'ArrowUp': case 'w': keys.up = false; break;
    case 'ArrowDown': case 's': keys.down = false; break;
    case ' ': case 'Space': fireHeld = false; break;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const my = (e.clientY - rect.top) * (H / rect.height);
  player.x = Math.max(0, Math.min(W - PLAYER_W, mx - PLAYER_W / 2));
  player.y = Math.max(H * 0.3, Math.min(H - PLAYER_H - 10, my - PLAYER_H / 2));
});

canvas.addEventListener('click', () => { fireHeld = true; setTimeout(() => fireHeld = false, 120); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); fireHeld = true; }, { passive: false });
canvas.addEventListener('touchend', (e) => { e.preventDefault(); fireHeld = false; }, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.touches[0].clientX - rect.left) * (W / rect.width);
  const my = (e.touches[0].clientY - rect.top) * (H / rect.height);
  player.x = Math.max(0, Math.min(W - PLAYER_W, mx - PLAYER_W / 2));
  player.y = Math.max(H * 0.3, Math.min(H - PLAYER_H - 10, my - PLAYER_H / 2));
}, { passive: false });

resetBtn.addEventListener('click', () => { resetGame(); loop(); });

loadBest();
resetGame();
loop();
