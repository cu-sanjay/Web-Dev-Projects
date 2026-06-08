/* ── Constants ── */

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const INITIAL_LEVEL = 9;
const MAX_LEVEL = TOTAL_CELLS;

/* ── DOM Refs ── */

const grid = document.getElementById('grid');
const levelDisplay = document.getElementById('levelDisplay');
const highestDisplay = document.getElementById('highestDisplay');
const trialDisplay = document.getElementById('trialDisplay');
const statusMessage = document.getElementById('statusMessage');
const overlay = document.getElementById('overlay');
const modalTitle = document.getElementById('modalTitle');
const modalLevel = document.getElementById('modalLevel');
const modalRecalled = document.getElementById('modalRecalled');
const modalHighest = document.getElementById('modalHighest');
const modalBtn = document.getElementById('modalBtn');

/* ── State ── */

const PHASE = { MEMORIZE: 'memorize', RECALL: 'recall', DONE: 'done' };

let phase = PHASE.MEMORIZE;
let level = INITIAL_LEVEL;
let highestCleared = 0;
let cellValues = [];
let nextExpected = 1;
let correctCount = 0;
let errorMade = false;

/* ─── Shuffle ─── */

function fisherYates(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/* ── Grid / Value Generation ── */

function generateValues(numCount) {
  const indices = [];
  for (let i = 0; i < TOTAL_CELLS; i++) indices.push(i);
  fisherYates(indices);

  const selected = indices.slice(0, numCount);
  const values = new Array(TOTAL_CELLS).fill(0);
  selected.forEach((cellIdx, pos) => {
    values[cellIdx] = pos + 1;
  });
  return values;
}

/* ── Build Grid DOM ── */

function buildGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    const span = document.createElement('span');
    span.className = 'number';
    cell.appendChild(span);
    cell.addEventListener('click', () => handleCellClick(i));
    grid.appendChild(cell);
  }
}

/* ── Populate Grid with Numbers ── */

function populateGrid(values) {
  const cells = grid.children;
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = cells[i];
    const span = cell.querySelector('.number');
    const val = values[i];

    span.textContent = val > 0 ? String(val) : '';
    cell.className = 'cell';
    cell.dataset.index = i;

    if (val > 0) {
      cell.classList.add('has-number');
    }
  }
}

/* ── Masking ── */

function maskNumberCells() {
  const cells = grid.children;
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = cells[i];
    if (cell.classList.contains('has-number') && !cell.classList.contains('found')) {
      cell.classList.add('masked');
    }
  }
}

/* ── Reveal All Numbers (after error) ── */

function revealAll() {
  const cells = grid.children;
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = cells[i];
    cell.classList.remove('masked');
    if (cell.classList.contains('has-number')) {
      cell.classList.add('revealed');
    }
  }
}

/* ── Mark Correct Cell ── */

function markFound(index) {
  const cell = grid.children[index];
  cell.classList.remove('masked');
  cell.classList.remove('has-number');
  cell.classList.add('found');
}

/* ── Grid Phase Class ── */

function setGridPhase(p) {
  grid.className = '';
  if (p === PHASE.RECALL) {
    grid.classList.add('phase-recall');
  }
}

/* ── Status ── */

function setStatus(text, cls) {
  statusMessage.textContent = text;
  statusMessage.className = cls || '';
}

/* ── HUD ── */

function updateHUD() {
  levelDisplay.textContent = String(level);
  highestDisplay.textContent = String(highestCleared);
  if (phase === PHASE.MEMORIZE) {
    trialDisplay.textContent = 'MEMORIZE';
    trialDisplay.style.color = '#94a3b8';
  } else if (phase === PHASE.RECALL) {
    trialDisplay.textContent = 'RECALL';
    trialDisplay.style.color = '#f1f5f9';
  } else {
    trialDisplay.textContent = 'DONE';
    trialDisplay.style.color = '#64748b';
  }
}

/* ── Grid Shake ── */

function triggerShake() {
  grid.classList.remove('shake');
  void grid.offsetWidth;
  grid.classList.add('shake');
  grid.addEventListener('animationend', () => {
    grid.classList.remove('shake');
  }, { once: true });
}

/* ── Cell Click Handler ── */

function handleCellClick(index) {
  if (phase === PHASE.DONE) return;

  const value = cellValues[index];

  if (phase === PHASE.MEMORIZE) {
    if (value === 1) {
      phase = PHASE.RECALL;
      nextExpected = 2;
      correctCount = 1;
      markFound(index);
      maskNumberCells();
      setGridPhase(PHASE.RECALL);
      setStatus('RECALL ASCENDING PATTERN', 'recall');
      updateHUD();
    }
    return;
  }

  if (phase === PHASE.RECALL) {
    if (value === nextExpected) {
      markFound(index);
      nextExpected++;
      correctCount++;

      if (nextExpected > level) {
        onLevelClear();
      }
    } else if (value > 0 && value !== nextExpected) {
      onError(index);
    }
  }
}

/* ── Level Clear ── */

function onLevelClear() {
  phase = PHASE.DONE;

  if (level > highestCleared) {
    highestCleared = level;
    saveHighest();
  }

  setStatus('LEVEL CLEARED', 'success');
  updateHUD();

  const nextLevel = level + 1;

  overlay.classList.remove('hidden');
  modalTitle.textContent = 'MATRIX CLEAR';
  modalLevel.textContent = String(level);
  modalRecalled.textContent = `${correctCount} / ${level}`;
  modalHighest.textContent = String(highestCleared);

  if (nextLevel > MAX_LEVEL) {
    modalBtn.textContent = 'MAX LEVEL REACHED';
    modalBtn.disabled = true;
  } else {
    modalBtn.textContent = 'BEGIN NEXT TRIAL';
    modalBtn.disabled = false;
    modalBtn.onclick = () => {
      overlay.classList.add('hidden');
      level = nextLevel;
      startTrial();
    };
  }
}

/* ── Error ── */

function onError(index) {
  phase = PHASE.DONE;
  errorMade = true;

  triggerShake();

  const cell = grid.children[index];
  cell.classList.add('error-flash');

  revealAll();
  setGridPhase(PHASE.DONE);
  setStatus('INCORRECT', 'error');

  const missedCellIdx = cellValues.indexOf(nextExpected);
  if (missedCellIdx !== -1) {
    grid.children[missedCellIdx].classList.add('missed');
  }

  setTimeout(() => {
    overlay.classList.remove('hidden');
    modalTitle.textContent = 'TRIAL FAILED';
    modalLevel.textContent = String(level);
    modalRecalled.textContent = `${correctCount} / ${level}`;
    modalHighest.textContent = String(highestCleared);
    modalBtn.textContent = 'RESTART TRIAL';
    modalBtn.disabled = false;
    modalBtn.onclick = () => {
      overlay.classList.add('hidden');
      startTrial();
    };
  }, 800);
}

/* ── Trial Start ── */

function startTrial() {
  phase = PHASE.MEMORIZE;
  nextExpected = 1;
  correctCount = 0;
  errorMade = false;

  cellValues = generateValues(level);
  populateGrid(cellValues);

  grid.className = '';
  setGridPhase(PHASE.MEMORIZE);

  setStatus('Study the layout. Tap "1" to begin.', '');
  updateHUD();
}

/* ── localStorage ── */

function loadHighest() {
  try {
    const saved = localStorage.getItem('chimpMatrixHighest');
    if (saved !== null) {
      highestCleared = parseInt(saved, 10) || 0;
    }
  } catch (_) {}
}

function saveHighest() {
  try {
    localStorage.setItem('chimpMatrixHighest', String(highestCleared));
  } catch (_) {}
}

/* ── Boot ── */

buildGrid();
loadHighest();
startTrial();
