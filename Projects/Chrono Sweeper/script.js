// ============================================================
//  CHRONO-SWEEPER — Proximity Vector Analytics (#842)
//  Pure vanilla JS. No external libraries.
// ============================================================

const ROWS = 10;
const COLS = 10;
const MINES = 15;
const TIMER_DURATION = 5;

// ── DOM refs ──
const gridEl = document.getElementById('grid-container');
const timerBarEl = document.getElementById('timer-bar');
const timerTextEl = document.getElementById('timer-text');
const safeCountEl = document.getElementById('safe-count');
const flagCountEl = document.getElementById('flag-count');
const statusTextEl = document.getElementById('status-text');
const logEntriesEl = document.getElementById('log-entries');
const restartBtn = document.getElementById('restart-btn');
const appEl = document.getElementById('app');

// ── Game state ──
let grid = [];
let gameState = 'idle';         // idle | playing | won | lost
let safeCellsRemaining = 0;
let flagsPlaced = 0;
let timerRemaining = TIMER_DURATION;
let timerInterval = null;
let lastActionTime = 0;
let gameInitialised = false;
let explosionQueued = false;

// ── Mine / flag symbols ──
const SYM_MINE = '\u2297';
const SYM_FLAG = '\u2691';
const SYM_EXPLODED = '\u2298';

// ── Log helpers ──
const MAX_LOG = 12;

function addLog(msg, type) {
  if (!logEntriesEl) return;
  const entry = document.createElement('div');
  entry.className = 'log-entry type-' + (type || 'info');
  entry.textContent = '\u203A ' + msg;
  logEntriesEl.insertBefore(entry, logEntriesEl.firstChild);
  while (logEntriesEl.children.length > MAX_LOG) {
    logEntriesEl.removeChild(logEntriesEl.lastChild);
  }
}

function setStatus(text, cls) {
  if (!statusTextEl) return;
  statusTextEl.textContent = text;
  statusTextEl.className = 'stat-value' + (cls ? ' status-' + cls : '');
}

// ── Grid generation ──

function createEmptyGrid() {
  const g = [];
  for (let r = 0; r < ROWS; r++) {
    g[r] = [];
    for (let c = 0; c < COLS; c++) {
      g[r][c] = {
        mine: false,
        revealed: false,
        flagged: false,
        proximity: 0,
        row: r,
        col: c,
      };
    }
  }
  return g;
}

function generateMines(safeRow, safeCol) {
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
    if (grid[r][c].mine) continue;
    grid[r][c].mine = true;
    placed++;
  }
  calcProximity();
}

function calcProximity() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c].mine) { grid[r][c].proximity = -1; continue; }
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].mine) count++;
        }
      }
      grid[r][c].proximity = count;
    }
  }
}

function initGame() {
  grid = createEmptyGrid();
  safeCellsRemaining = ROWS * COLS;
  flagsPlaced = 0;
  gameState = 'idle';
  gameInitialised = false;
  explosionQueued = false;
  timerRemaining = TIMER_DURATION;
  stopTimer();
  clearGrid();
  renderGrid();
  updateStats();
  setStatus('SYSTEM STABLE');
  if (logEntriesEl) logEntriesEl.innerHTML = '';
  appEl.classList.remove('glitching');
  gridEl.classList.remove('detonating', 'secured');
  addLog('System boot — grid initialised', 'system');
  addLog(MINES + ' mines deployed across ' + (ROWS * COLS) + ' cells', 'system');
  addLog('Awaiting first scan command', 'info');
}

function clearGrid() {
  if (gridEl) gridEl.innerHTML = '';
}

// ── Rendering ──

function renderGrid() {
  if (!gridEl) return;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell hidden';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener('click', () => onLeftClick(r, c));
      cell.addEventListener('contextmenu', (e) => { e.preventDefault(); onRightClick(r, c); });
      gridEl.appendChild(cell);
    }
  }
}

function updateCellDOM(r, c) {
  const idx = r * COLS + c;
  const el = gridEl.children[idx];
  if (!el) return;
  const data = grid[r][c];

  el.className = 'cell';

  if (data.revealed) {
    el.classList.add('revealed');
    if (data.mine) {
      el.classList.add('mine-exploded');
      el.textContent = SYM_EXPLODED;
    } else if (data.proximity === 0) {
      el.classList.add('empty');
      el.textContent = '';
    } else {
      el.classList.add('prox-' + data.proximity);
      el.textContent = data.proximity;
    }
  } else {
    el.classList.add('hidden');
    if (data.flagged) {
      el.classList.add('flagged');
      el.textContent = SYM_FLAG;
    } else {
      el.textContent = '';
    }
  }
}

function updateStats() {
  if (safeCountEl) safeCountEl.textContent = safeCellsRemaining;
  if (flagCountEl) flagCountEl.textContent = flagsPlaced + ' / ' + MINES;
}

// ── Timer ──

function startTimer() {
  lastActionTime = performance.now();
  timerRemaining = TIMER_DURATION;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(timerTick, 50);
  updateTimerBar();
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  lastActionTime = performance.now();
  timerRemaining = TIMER_DURATION;
  updateTimerBar();
}

function timerTick() {
  if (gameState === 'won' || gameState === 'lost') { stopTimer(); return; }
  const elapsed = (performance.now() - lastActionTime) / 1000;
  timerRemaining = Math.max(0, TIMER_DURATION - elapsed);
  updateTimerBar();
  if (timerRemaining <= 0 && !explosionQueued) {
    explosionQueued = true;
    triggerDetonation('TIMER_EXPIRED');
  }
}

function updateTimerBar() {
  const pct = (timerRemaining / TIMER_DURATION) * 100;
  if (timerBarEl) {
    timerBarEl.style.width = pct + '%';
    timerBarEl.classList.toggle('critical', timerRemaining <= 1);
  }
  if (timerTextEl) timerTextEl.textContent = timerRemaining.toFixed(1) + 's';
}

// ── Game actions ──

function onLeftClick(r, c) {
  if (gameState === 'won' || gameState === 'lost') return;
  if (gameState === 'idle') {
    gameState = 'playing';
    generateMines(r, c);
    safeCellsRemaining = (ROWS * COLS) - MINES;
    gameInitialised = true;
    startTimer();
    addLog('First scan initiated — chrono timer active', 'system');
  }
  const data = grid[r][c];
  if (data.revealed || data.flagged) return;

  if (data.mine) {
    triggerDetonation('MINE_HIT', r, c);
    return;
  }

  revealCell(r, c);
  resetTimer();
  addLog('Cell scan [' + r + ',' + c + '] — Proximity: ' + data.proximity, 'info');

  if (safeCellsRemaining <= 0) {
    triggerWin();
  }
}

function onRightClick(r, c) {
  if (gameState === 'won' || gameState === 'lost') return;
  if (!gameInitialised) return;
  const data = grid[r][c];
  if (data.revealed) return;

  if (data.flagged) {
    data.flagged = false;
    flagsPlaced--;
    updateCellDOM(r, c);
    updateStats();
    resetTimer();
    addLog('Flag removed [' + r + ',' + c + ']', 'info');
  } else if (flagsPlaced < MINES) {
    data.flagged = true;
    flagsPlaced++;
    updateCellDOM(r, c);
    updateStats();
    resetTimer();
    addLog('Flag set [' + r + ',' + c + '] — mine suspected', 'warning');
  }
}

function revealCell(r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
  const data = grid[r][c];
  if (data.revealed || data.flagged || data.mine) return;

  data.revealed = true;
  safeCellsRemaining--;
  updateCellDOM(r, c);

  if (data.proximity === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        revealCell(r + dr, c + dc);
      }
    }
  }
}

// ── Game over ──

function triggerDetonation(cause, mineR, mineC) {
  gameState = 'lost';
  stopTimer();

  if (cause === 'MINE_HIT') {
    grid[mineR][mineC].revealed = true;
    addLog('MINE DETONATED at [' + mineR + ',' + mineC + ']', 'danger');
    addLog('Critical failure — grid compromised', 'danger');
  } else {
    addLog('TIMER EXPIRED — auto-detonation initiated', 'danger');
    addLog('System critical — chrono failure', 'danger');
  }

  setStatus('GRID COMPROMISED', 'danger');
  appEl.classList.add('glitching');
  gridEl.classList.add('detonating');

  setTimeout(() => {
    revealAllMines(mineR, mineC);
    gridEl.classList.remove('detonating');
  }, 850);
}

function revealAllMines(highlightR, highlightC) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const data = grid[r][c];
      if (data.mine && !data.revealed) {
        data.revealed = true;
        const idx = r * COLS + c;
        const el = gridEl.children[idx];
        if (el) {
          el.className = 'cell mine-shown';
          el.textContent = SYM_MINE;
        }
        if (data.flagged) {
          if (el) el.classList.add('wrong-flag');
        }
      }
      if (!data.mine && data.flagged) {
        const idx = r * COLS + c;
        const el = gridEl.children[idx];
        if (el) {
          el.className = 'cell mine-shown wrong-flag';
          el.textContent = SYM_FLAG;
        }
      }
    }
  }

  if (highlightR !== undefined && highlightC !== undefined) {
    const idx = highlightR * COLS + highlightC;
    const el = gridEl.children[idx];
    if (el) {
      el.className = 'cell mine-exploded';
      el.textContent = SYM_EXPLODED;
    }
  }
}

function triggerWin() {
  gameState = 'won';
  stopTimer();
  setStatus('GRID SECURED', 'secured');
  gridEl.classList.add('secured');
  addLog('All safe cells identified', 'success');
  addLog('GRID SECURED — sector clean', 'success');
  addLog('Mines neutralised: ' + flagsPlaced + ' / ' + MINES, 'success');
}

// ── Keyboard shortcut ──

document.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') {
    restartGame();
  }
});

// ── Restart ──

function restartGame() {
  stopTimer();
  initGame();
  addLog('Terminal rebooted — new scan initiated', 'system');
}

if (restartBtn) restartBtn.addEventListener('click', restartGame);

// ── Boot ──

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});
