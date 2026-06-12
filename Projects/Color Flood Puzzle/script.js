// ============================================================
//  COLOR FLOOD PUZZLE — Core Engine
//  Flood fill pathfinding + state management + win/loss logic
// ============================================================

// ─── CONSTANTS ──────────────────────────────────────────────

const GRID_SIZE = 12;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const MAX_MOVES = 25;
const COLORS = ['#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'];

const STORAGE_KEY = 'colorflood_streak';

// ─── STATE ──────────────────────────────────────────────────

const state = {
  grid: [],
  moves: 0,
  phase: 'awaiting', // 'awaiting' | 'playing' | 'victory' | 'failed'
  streak: 0,
  originColor: 0,
};

// ─── DOM REFS ───────────────────────────────────────────────

const gridContainer = document.getElementById('grid-matrix');
const tokenStrip = document.getElementById('color-tokens');
const telemMoves = document.getElementById('telem-moves');
const telemSaturation = document.getElementById('telem-saturation');
const telemStreak = document.getElementById('telem-streak');
const diagStatus = document.getElementById('diag-status');
const btnReset = document.getElementById('btn-reset');

// ─── LOCAL STORAGE ─────────────────────────────────────────

function loadStreak() {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    state.streak = val ? parseInt(val, 10) : 0;
  } catch {
    state.streak = 0;
  }
}

function saveStreak() {
  try {
    localStorage.setItem(STORAGE_KEY, String(state.streak));
  } catch {}
}

// ─── GRID GENERATION ───────────────────────────────────────

function generateGrid() {
  const grid = [];
  for (let i = 0; i < TOTAL_CELLS; i++) {
    grid.push(Math.floor(Math.random() * COLORS.length));
  }
  return grid;
}

// ─── FLOOD FILL ENGINE ─────────────────────────────────────

function floodFill(grid, newColor) {
  const targetColor = grid[0];
  if (targetColor === newColor) return false;

  const visited = new Uint8Array(TOTAL_CELLS);
  const stack = [0];
  visited[0] = 1;

  while (stack.length > 0) {
    const idx = stack.pop();
    grid[idx] = newColor;

    const row = Math.floor(idx / GRID_SIZE);
    const col = idx % GRID_SIZE;

    // North
    if (row > 0) {
      const n = idx - GRID_SIZE;
      if (!visited[n] && grid[n] === targetColor) {
        visited[n] = 1;
        stack.push(n);
      }
    }
    // South
    if (row < GRID_SIZE - 1) {
      const s = idx + GRID_SIZE;
      if (!visited[s] && grid[s] === targetColor) {
        visited[s] = 1;
        stack.push(s);
      }
    }
    // West
    if (col > 0) {
      const w = idx - 1;
      if (!visited[w] && grid[w] === targetColor) {
        visited[w] = 1;
        stack.push(w);
      }
    }
    // East
    if (col < GRID_SIZE - 1) {
      const e = idx + 1;
      if (!visited[e] && grid[e] === targetColor) {
        visited[e] = 1;
        stack.push(e);
      }
    }
  }

  return true;
}

// ─── SATURATION CALCULATION ────────────────────────────────

function calcSaturation(grid) {
  const origin = grid[0];
  let count = 0;
  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (grid[i] === origin) count++;
  }
  return (count / TOTAL_CELLS) * 100;
}

function isFullyFlooded(grid) {
  const val = grid[0];
  for (let i = 1; i < TOTAL_CELLS; i++) {
    if (grid[i] !== val) return false;
  }
  return true;
}

// ─── RENDER ─────────────────────────────────────────────────

function renderGrid() {
  gridContainer.innerHTML = '';
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'matrix-cell c' + state.grid[i];

    if (state.phase === 'failed') {
      const origin = state.grid[0];
      if (state.grid[i] !== origin) {
        cell.classList.add('unflooded');
      }
    }

    gridContainer.appendChild(cell);
  }

  const sat = calcSaturation(state.grid);
  telemSaturation.textContent = sat.toFixed(1) + '%';

  const moveStr = String(state.moves).padStart(2, '0');
  const maxStr = String(MAX_MOVES).padStart(2, '0');
  telemMoves.textContent = moveStr + ' / ' + maxStr;

  telemStreak.textContent = String(state.streak);
}

function resetGrid() {
  state.grid = generateGrid();
  state.moves = 0;
  state.phase = 'awaiting';
  state.originColor = state.grid[0];
  gridContainer.classList.remove('victory-glow', 'fail-pulse');
  setDiagnostic('AWAITING SELECTION VECTOR', 'idle');
  renderGrid();
}

// ─── PLAY MOVE ─────────────────────────────────────────────

function playMove(colorIndex) {
  if (state.phase === 'victory' || state.phase === 'failed') return;

  if (state.moves >= MAX_MOVES) {
    state.phase = 'failed';
    gridContainer.classList.add('fail-pulse');
    setDiagnostic('CRITICAL LIMIT REACHED — SYSTEM FAILED', 'failed');
    renderGrid();
    return;
  }

  const changed = floodFill(state.grid, colorIndex);
  if (!changed) return;

  state.moves++;
  state.phase = 'playing';
  setDiagnostic('PROCESSING RECURSIVE FLOOD FILL...', 'processing');

  // Check win
  if (isFullyFlooded(state.grid)) {
    state.phase = 'victory';
    state.streak++;
    saveStreak();
    gridContainer.classList.add('victory-glow');
    setDiagnostic('VICTORY DETECTED — MATRIX SECURED', 'victory');
    renderGrid();
    return;
  }

  // Check move exhaustion
  if (state.moves >= MAX_MOVES) {
    state.phase = 'failed';
    state.streak = 0;
    saveStreak();
    gridContainer.classList.add('fail-pulse');
    setDiagnostic('CRITICAL LIMIT REACHED — SYSTEM FAILED', 'failed');
    renderGrid();
    return;
  }

  setDiagnostic('AWAITING SELECTION VECTOR', 'idle');
  renderGrid();
}

// ─── DIAGNOSTIC UPDATER ────────────────────────────────────

function setDiagnostic(msg, cls) {
  diagStatus.textContent = msg;
  diagStatus.className = 'diag-status ' + cls;
}

// ─── COLOR TOKEN BUTTONS ───────────────────────────────────

function buildTokenButtons() {
  tokenStrip.innerHTML = '';
  COLORS.forEach((hex, i) => {
    const btn = document.createElement('button');
    btn.className = 'color-token-btn';
    btn.dataset.index = i;
    btn.setAttribute('aria-label', 'Color ' + (i + 1));
    btn.addEventListener('click', () => {
      playMove(i);
    });
    tokenStrip.appendChild(btn);
  });
}

// ─── RESET BUTTON ──────────────────────────────────────────

btnReset.addEventListener('click', resetGrid);

// ─── KEYBOARD SUPPORT ──────────────────────────────────────

document.addEventListener('keydown', (e) => {
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= 6) {
    playMove(num - 1);
  }
  if (e.key === 'r' || e.key === 'R') {
    resetGrid();
  }
});

// ─── INIT ───────────────────────────────────────────────────

function init() {
  loadStreak();
  buildTokenButtons();
  resetGrid();
}

init();
