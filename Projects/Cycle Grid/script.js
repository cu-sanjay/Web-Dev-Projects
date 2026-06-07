const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const playerScoreEl = document.getElementById('player-score');
const aiScoreEl = document.getElementById('ai-score');
const statusEl = document.getElementById('game-status');

const SPEED = 150;
const TRAIL_GLOW = 10;
const TRAIL_CORE = 2.5;
const AI_LOOKAHEAD = 100;
const AI_STEP = 10;

const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };
const DIRS = [UP, DOWN, LEFT, RIGHT];

function turnLeft(dir) {
  if (dir === UP) return LEFT;
  if (dir === LEFT) return DOWN;
  if (dir === DOWN) return RIGHT;
  return UP;
}

function turnRight(dir) {
  if (dir === UP) return RIGHT;
  if (dir === RIGHT) return DOWN;
  if (dir === DOWN) return LEFT;
  return LEFT;
}

function segmentsCross(a, b) {
  const d1x = a.x2 - a.x1;
  const d1y = a.y2 - a.y1;
  const d2x = b.x2 - b.x1;
  const d2y = b.y2 - b.y1;
  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-10) return false;
  const t = ((b.x1 - a.x1) * d2y - (b.y1 - a.y1) * d2x) / cross;
  const u = ((b.x1 - a.x1) * d1y - (b.y1 - a.y1) * d1x) / cross;
  return t > 1e-8 && t < 1 && u > 0 && u < 1;
}

class Cycle {
  constructor(x, y, dir, color, glowColor) {
    this.x = x;
    this.y = y;
    this.dir = { x: dir.x, y: dir.y };
    this.color = color;
    this.glowColor = glowColor;
    this.segments = [];
    this.segStart = { x, y };
    this.alive = true;
    this.nextDir = { x: dir.x, y: dir.y };
    this.spawnX = x;
    this.spawnY = y;
    this.spawnDir = { x: dir.x, y: dir.y };
  }

  get head() {
    return { x1: this.segStart.x, y1: this.segStart.y, x2: this.x, y2: this.y };
  }

  reset(x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = { x: dir.x, y: dir.y };
    this.nextDir = { x: dir.x, y: dir.y };
    this.segments = [];
    this.segStart = { x, y };
    this.alive = true;
  }

  turn(dir) {
    if (!this.alive) return;
    if (dir.x === -this.dir.x && dir.y === -this.dir.y) return;
    this.nextDir = { x: dir.x, y: dir.y };
  }

  update(dt) {
    if (!this.alive) return;

    if (this.nextDir.x !== this.dir.x || this.nextDir.y !== this.dir.y) {
      const dx = this.x - this.segStart.x;
      const dy = this.y - this.segStart.y;
      if (dx * dx + dy * dy > 1) {
        this.segments.push({
          x1: this.segStart.x,
          y1: this.segStart.y,
          x2: this.x,
          y2: this.y,
        });
      }
      this.segStart = { x: this.x, y: this.y };
      this.dir = { x: this.nextDir.x, y: this.nextDir.y };
    }

    const d = SPEED * dt;
    this.x += this.dir.x * d;
    this.y += this.dir.y * d;
  }

  hitsBoundary() {
    const h = this.head;
    return h.x2 <= 0 || h.x2 >= W || h.y2 <= 0 || h.y2 >= H;
  }

  hitsOwnTrail() {
    const h = this.head;
    for (const s of this.segments) {
      if (segmentsCross(h, s)) return true;
    }
    return false;
  }

  hitsTrailOf(other) {
    const h = this.head;
    for (const s of other.segments) {
      if (segmentsCross(h, s)) return true;
    }
    if (segmentsCross(h, other.head)) return true;
    return false;
  }
}

function evaluateDir(cycle, opponent, dir) {
  let sx = cycle.x;
  let sy = cycle.y;
  let dist = 0;
  const totalSteps = Math.ceil(AI_LOOKAHEAD / AI_STEP);

  for (let i = 0; i < totalSteps; i++) {
    const nx = sx + dir.x * AI_STEP;
    const ny = sy + dir.y * AI_STEP;
    dist += AI_STEP;

    if (nx <= 0 || nx >= W || ny <= 0 || ny >= H) break;

    const seg = { x1: sx, y1: sy, x2: nx, y2: ny };
    let hit = false;

    for (const s of cycle.segments) {
      if (segmentsCross(seg, s)) { hit = true; break; }
    }
    if (!hit) {
      for (const s of opponent.segments) {
        if (segmentsCross(seg, s)) { hit = true; break; }
      }
    }
    if (!hit) {
      if (segmentsCross(seg, opponent.head)) hit = true;
    }
    if (hit) break;

    sx = nx;
    sy = ny;
  }

  return dist;
}

function aiThink(cycle, opponent) {
  if (!cycle.alive) return;

  const opts = [cycle.dir, turnLeft(cycle.dir), turnRight(cycle.dir)];
  let bestDir = cycle.dir;
  let bestScore = -1;
  const isFirst = cycle.segments.length === 0;

  for (const dir of opts) {
    if (dir.x === -cycle.dir.x && dir.y === -cycle.dir.y) continue;
    const dist = evaluateDir(cycle, opponent, dir);


    const dx = opponent.x - cycle.x;
    const dy = opponent.y - cycle.y;
    const dot = dir.x * Math.sign(dx) + dir.y * Math.sign(dy);
    const trapBonus = dist > 0 && dot > 0 ? 20 : 0;
    const straightBonus = dir.x === cycle.dir.x && dir.y === cycle.dir.y ? 5 : 0;
    const score = dist + trapBonus + straightBonus;

    if (score > bestScore) {
      bestScore = score;
      bestDir = dir;
    }
  }

  if (!isFirst && Math.random() < 0.08) {
    const alt = opts.filter(d =>
      (d.x !== -cycle.dir.x || d.y !== -cycle.dir.y) &&
      (d.x !== bestDir.x || d.y !== bestDir.y)
    );
    if (alt.length > 0) {
      bestDir = alt[Math.floor(Math.random() * alt.length)];
    }
  }

  cycle.turn(bestDir);
}

let player, ai;
let playerScore = 0;
let aiScore = 0;
let gameState = 'paused';
let lastTime = 0;
let flashTimer = 0;

function startRace() {
  player = new Cycle(120, H / 2, RIGHT, '#0af', 'rgba(0,170,255,0.15)');
  ai = new Cycle(W - 120, H / 2, LEFT, '#f06', 'rgba(255,0,102,0.15)');
  gameState = 'playing';
  statusEl.textContent = '';
  flashTimer = 0;
}

function endRace(winner) {
  gameState = 'over';
  if (winner === 'player') {
    playerScore++;
    statusEl.textContent = 'PLAYER WINS';
    flashTimer = 1;
  } else if (winner === 'ai') {
    aiScore++;
    statusEl.textContent = 'AI WINS';
    flashTimer = 1;
  } else {
    statusEl.textContent = 'DRAW';
    flashTimer = 1;
  }
  playerScoreEl.textContent = playerScore;
  aiScoreEl.textContent = aiScore;
}

function update(dt) {
  if (gameState !== 'playing') {
    if (flashTimer > 0) flashTimer -= dt;
    return;
  }

  aiThink(ai, player);

  player.update(dt);
  ai.update(dt);

  let playerDead = false;
  let aiDead = false;

  if (player.hitsBoundary()) playerDead = true;
  if (ai.hitsBoundary()) aiDead = true;

  if (!playerDead && player.hitsOwnTrail()) playerDead = true;
  if (!aiDead && ai.hitsOwnTrail()) aiDead = true;

  if (!playerDead && player.hitsTrailOf(ai)) playerDead = true;
  if (!aiDead && ai.hitsTrailOf(player)) aiDead = true;

  if (playerDead && aiDead) {
    endRace('draw');
  } else if (playerDead) {
    endRace('ai');
  } else if (aiDead) {
    endRace('player');
  }
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const spacing = 40;
  for (let x = 0; x <= W; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(W, y + 0.5);
    ctx.stroke();
  }
}

function drawTrail(cycle) {
  if (cycle.segments.length === 0 && cycle.segStart.x === cycle.x && cycle.segStart.y === cycle.y) return;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  for (const s of cycle.segments) {
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
  }
  ctx.moveTo(cycle.segStart.x, cycle.segStart.y);
  ctx.lineTo(cycle.x, cycle.y);

  const alpha = gameState === 'playing' || gameState === 'over' ? 1 : 0.3;

  ctx.save();
  ctx.strokeStyle = cycle.glowColor;
  ctx.lineWidth = TRAIL_GLOW;
  ctx.globalAlpha = alpha * 0.6;
  ctx.stroke();

  ctx.strokeStyle = cycle.color;
  ctx.lineWidth = TRAIL_CORE;
  ctx.globalAlpha = alpha;
  ctx.stroke();
  ctx.restore();
}

function drawBike(cycle) {
  if (!cycle.alive) return;

  const size = 6;
  const angle = Math.atan2(cycle.dir.y, cycle.dir.x);
  const bx = cycle.x;
  const by = cycle.y;

  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.6, -size * 0.5);
  ctx.lineTo(-size * 0.6, size * 0.5);
  ctx.closePath();

  ctx.shadowColor = cycle.color;
  ctx.shadowBlur = 15;
  ctx.fillStyle = cycle.color;
  ctx.globalAlpha = 1;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.6;
  ctx.fill();

  ctx.restore();
}

function drawFlash() {
  if (flashTimer <= 0) return;
  ctx.fillStyle = `rgba(255, 255, 255, ${flashTimer * 0.3})`;
  ctx.fillRect(0, 0, W, H);
}

function render() {
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, W, H);

  drawGrid();
  drawTrail(ai);
  drawTrail(player);
  drawBike(ai);
  drawBike(player);
  drawFlash();
}

function gameLoop(timestamp) {
  const now = performance.now() / 1000;
  if (lastTime === 0) lastTime = now;
  let dt = now - lastTime;
  lastTime = now;
  dt = Math.min(dt, 0.05);

  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (key === ' ' || key === 'Space') {
    e.preventDefault();
    if (gameState === 'paused' || gameState === 'over') {
      startRace();
    }
    return;
  }

  if (gameState !== 'playing') return;

  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      e.preventDefault();
      player.turn(UP);
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      e.preventDefault();
      player.turn(DOWN);
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      e.preventDefault();
      player.turn(LEFT);
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      e.preventDefault();
      player.turn(RIGHT);
      break;
  }
});

startRace();
gameState = 'paused';
statusEl.textContent = 'PRESS SPACE TO START';
requestAnimationFrame(gameLoop);
