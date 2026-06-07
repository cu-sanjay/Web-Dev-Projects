// ============================================================
//  BLOCK-STACK MATRIX — Drop-Line Cleansing (#841)
//  Pure vanilla JS. No external libraries.
// ============================================================

const COLS = 10;
const ROWS = 20;

// ── Tetromino definitions ──

const TETROMINOS = {
  I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#00e5f0' },
  O: { shape: [[1,1],[1,1]], color: '#f0e000' },
  T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: '#a855f7' },
  S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: '#22cc66' },
  Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: '#ee3355' },
  J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: '#3366ff' },
  L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: '#f0a030' },
};

const TYPES = Object.keys(TETROMINOS);
const SCORE_TABLE = [0, 100, 300, 500, 800];

// ── DOM refs ──

const boardGridEl = document.getElementById('board-grid');
const nextGridEl = document.getElementById('next-grid');
const scoreEl = document.getElementById('score-value');
const linesEl = document.getElementById('lines-value');
const levelEl = document.getElementById('level-value');
const highScoreEl = document.getElementById('highscore-value');
const actionBtn = document.getElementById('action-btn');
const restartBtn = document.getElementById('restart-btn');
const gameoverOverlay = document.getElementById('gameover-overlay');
const finalScoreEl = document.getElementById('final-score');

// ── Game state ──

let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let highScore = 0;
let gameState = 'menu'; // menu | playing | paused | gameover
let dropCounter = 0;
let lastTime = 0;
let isAnimating = false;
let clearingRows = [];
let rafId = null;
let softDropping = false;

// ── localStorage ──

function loadHighScore() {
  try { return parseInt(localStorage.getItem('bst-high-score') || '0', 10); }
  catch { return 0; }
}

function saveHighScore(val) {
  try { localStorage.setItem('bst-high-score', String(val)); }
  catch { /* noop */ }
}

// ── Board operations ──

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function initBoardElements() {
  boardGridEl.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell empty';
      boardGridEl.appendChild(cell);
    }
  }
}

function initNextElements() {
  nextGridEl.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell empty';
    nextGridEl.appendChild(cell);
  }
}

// ── Piece helpers ──

function randomType() {
  return TYPES[Math.floor(Math.random() * TYPES.length)];
}

function createPiece(type) {
  const def = TETROMINOS[type];
  const shape = def.shape.map(r => [...r]);
  return {
    type,
    shape,
    color: def.color,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: type === 'I' ? -1 : 0,
  };
}

function rotateMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
}

function isValid(shape, offsetX, offsetY) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const x = offsetX + c;
      const y = offsetY + r;
      if (x < 0 || x >= COLS || y >= ROWS) return false;
      if (y < 0) continue;
      if (board[y][x] !== null) return false;
    }
  }
  return true;
}

// ── Piece movement ──

function movePiece(dx, dy) {
  if (!currentPiece || isAnimating) return false;
  if (isValid(currentPiece.shape, currentPiece.x + dx, currentPiece.y + dy)) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    render();
    return true;
  }
  return false;
}

function rotatePiece() {
  if (!currentPiece || isAnimating) return false;
  const rotated = rotateMatrix(currentPiece.shape);
  if (isValid(rotated, currentPiece.x, currentPiece.y)) {
    currentPiece.shape = rotated;
    render();
    return true;
  }
  // Wall kick: try shifting left/right
  for (const kick of [-1, 1, -2, 2]) {
    if (isValid(rotated, currentPiece.x + kick, currentPiece.y)) {
      currentPiece.shape = rotated;
      currentPiece.x += kick;
      render();
      return true;
    }
  }
  return false;
}

function hardDrop() {
  if (!currentPiece || isAnimating) return;
  while (isValid(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
    currentPiece.y++;
  }
  lockPiece();
}

function getGhostY() {
  if (!currentPiece) return 0;
  let gy = currentPiece.y;
  while (isValid(currentPiece.shape, currentPiece.x, gy + 1)) gy++;
  return gy;
}

// ── Lock / line clear / spawn ──

function lockPiece() {
  if (!currentPiece) return;
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (!currentPiece.shape[r][c]) continue;
      const y = currentPiece.y + r;
      const x = currentPiece.x + c;
      if (y < 0 || y >= ROWS || x < 0 || x >= COLS) continue;
      board[y][x] = currentPiece.color;
    }
  }
  currentPiece = null;
  checkLines();
}

function checkLines() {
  const fullRows = [];
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every(cell => cell !== null)) {
      fullRows.push(r);
    }
  }

  if (fullRows.length > 0) {
    isAnimating = true;
    clearingRows = fullRows;
    render();

    setTimeout(() => {
      fullRows.sort((a, b) => b - a);
      for (const r of fullRows) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
      }
      clearingRows = [];
      isAnimating = false;

      const n = fullRows.length;
      lines += n;
      score += (SCORE_TABLE[n] || 0) * level;
      level = Math.floor(lines / 10) + 1;

      if (score > highScore) {
        highScore = score;
        saveHighScore(highScore);
      }

      updateStats();
      render();

      if (!spawnPiece()) {
        gameOver();
      }
    }, 370);
  } else {
    if (!spawnPiece()) {
      gameOver();
    }
  }
}

function spawnPiece() {
  if (!nextPiece) {
    nextPiece = createPiece(randomType());
  }
  const type = nextPiece.type;
  currentPiece = createPiece(type);
  nextPiece = createPiece(randomType());
  renderNext();
  dropCounter = 0;
  return isValid(currentPiece.shape, currentPiece.x, currentPiece.y);
}

// ── Game loop ──

function getDropInterval() {
  return Math.max(80, 800 - (level - 1) * 75);
}

function gameLoop(time) {
  if (lastTime === 0) lastTime = time;
  const delta = time - lastTime;
  lastTime = time;

  if (gameState === 'playing' && !isAnimating && currentPiece) {
    dropCounter += delta;
    const interval = softDropping ? 30 : getDropInterval();
    if (dropCounter > interval) {
      if (!movePiece(0, 1)) {
        lockPiece();
      }
      dropCounter = 0;
    }
  }

  render();
  rafId = requestAnimationFrame(gameLoop);
}

// ── Game state transitions ──

function startGame() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  currentPiece = null;
  nextPiece = null;
  isAnimating = false;
  clearingRows = [];
  dropCounter = 0;
  lastTime = 0;
  softDropping = false;
  gameState = 'playing';
  gameoverOverlay.classList.add('hidden');

  initBoardElements();
  initNextElements();
  spawnPiece();
  updateStats();
  actionBtn.textContent = 'PAUSE';
  render();
}

function togglePause() {
  if (gameState === 'playing') {
    gameState = 'paused';
    actionBtn.textContent = 'RESUME';
  } else if (gameState === 'paused') {
    gameState = 'playing';
    lastTime = 0;
    actionBtn.textContent = 'PAUSE';
    if (!rafId) {
      rafId = requestAnimationFrame(gameLoop);
    }
  }
}

function gameOver() {
  gameState = 'gameover';
  actionBtn.textContent = 'PLAY AGAIN';
  finalScoreEl.textContent = score;
  gameoverOverlay.classList.remove('hidden');
  if (score >= highScore) {
    highScore = score;
    saveHighScore(highScore);
    updateStats();
  }
  render();
}

// ── Rendering ──

function render() {
  if (!boardGridEl || !currentPiece && gameState === 'menu') return;

  const display = board.map(row => row.slice());

  if (currentPiece) {
    const ghostY = getGhostY();
    const ghostShape = currentPiece.shape;
    for (let r = 0; r < ghostShape.length; r++) {
      for (let c = 0; c < ghostShape[r].length; c++) {
        if (!ghostShape[r][c]) continue;
        const y = ghostY + r;
        const x = currentPiece.x + c;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS && display[y][x] === null) {
          display[y][x] = 'ghost';
        }
      }
    }

    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (!currentPiece.shape[r][c]) continue;
        const y = currentPiece.y + r;
        const x = currentPiece.x + c;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
          display[y][x] = currentPiece.color;
        }
      }
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const el = boardGridEl.children[idx];
      if (!el) continue;

      const val = display[r][c];
      const isClearing = clearingRows.includes(r);

      el.className = 'cell';
      if (val === null) {
        el.className += ' empty';
        el.style.backgroundColor = '';
      } else if (val === 'ghost') {
        el.className += ' ghost';
        el.style.backgroundColor = '';
      } else {
        el.className += ' filled';
        el.style.backgroundColor = val;
      }

      if (isClearing) el.classList.add('clearing');
    }
  }
}

function renderNext() {
  if (!nextGridEl || !nextPiece) return;
  const shape = nextPiece.shape;
  for (let i = 0; i < 16; i++) {
    const r = Math.floor(i / 4);
    const c = i % 4;
    const el = nextGridEl.children[i];
    if (!el) continue;
    if (shape[r] && shape[r][c]) {
      el.className = 'cell filled';
      el.style.backgroundColor = nextPiece.color;
    } else {
      el.className = 'cell empty';
      el.style.backgroundColor = '';
    }
  }
}

function updateStats() {
  if (scoreEl) scoreEl.textContent = score;
  if (linesEl) linesEl.textContent = lines;
  if (levelEl) levelEl.textContent = level;
  if (highScoreEl) highScoreEl.textContent = highScore;
}

// ── Event handlers ──

document.addEventListener('keydown', (e) => {
  if (gameState === 'menu') return;
  if (gameState === 'gameover') {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startGame();
    }
    return;
  }

  if (e.key === 'p' || e.key === 'P') {
    togglePause();
    return;
  }

  if (gameState === 'paused' || isAnimating) return;

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      movePiece(-1, 0);
      break;
    case 'ArrowRight':
      e.preventDefault();
      movePiece(1, 0);
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (!softDropping) {
        softDropping = true;
      }
      movePiece(0, 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      rotatePiece();
      break;
    case ' ':
      e.preventDefault();
      hardDrop();
      break;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowDown') {
    softDropping = false;
    dropCounter = 0;
  }
});

if (actionBtn) {
  actionBtn.addEventListener('click', () => {
    if (gameState === 'menu' || gameState === 'gameover') {
      startGame();
    } else {
      togglePause();
    }
  });
}

if (restartBtn) {
  restartBtn.addEventListener('click', startGame);
}

// ── Boot ──

highScore = loadHighScore();
if (highScoreEl) highScoreEl.textContent = highScore;
initBoardElements();
initNextElements();
updateStats();
rafId = requestAnimationFrame(gameLoop);
