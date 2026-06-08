/* ── Color Profiles ── */

const COLORS = [
  { hex: '#ef4444', name: 'Red',     warm: true,  cool: false, primary: true,  secondary: false },
  { hex: '#f97316', name: 'Orange',  warm: true,  cool: false, primary: false, secondary: true  },
  { hex: '#eab308', name: 'Yellow',  warm: true,  cool: false, primary: true,  secondary: false },
  { hex: '#22c55e', name: 'Green',   warm: false, cool: true,  primary: false, secondary: true  },
  { hex: '#3b82f6', name: 'Blue',    warm: false, cool: true,  primary: true,  secondary: false },
  { hex: '#8b5cf6', name: 'Purple',  warm: false, cool: true,  primary: false, secondary: true  },
  { hex: '#ec4899', name: 'Pink',    warm: true,  cool: false, primary: false, secondary: false },
];

/* ── Commands ── */

const COMMANDS = [
  { text: 'ELIMINATE WARM COLORS',   tag: 'warm',      filter: c => c.warm },
  { text: 'CLEAR COOL TONES',        tag: 'cool',      filter: c => c.cool },
  { text: 'TAP PRIMARY HUES',        tag: 'primary',   filter: c => c.primary },
  { text: 'PURGE SECONDARY COLORS',  tag: 'secondary', filter: c => c.secondary },
  { text: 'REMOVE WARM PIGMENTS',    tag: 'warm',      filter: c => c.warm },
  { text: 'NEUTRALIZE COOL SPECTRUM',tag: 'cool',      filter: c => c.cool },
  { text: 'SELECT PRIMARY COLORS',   tag: 'primary',   filter: c => c.primary },
];

/* ── Game Config ── */

const GRID_COLS = 5;
const TOTAL_CELLS = GRID_COLS * GRID_COLS;
const TOTAL_TIME = 60;
const COMMAND_INTERVAL = 6000;
const POINTS_CORRECT = 100;
const POINTS_WRONG = -50;
const TIME_PENALTY = 3;

/* ── DOM Refs ── */

const commandText = document.getElementById('commandText');
const commandBanner = document.getElementById('commandBanner');
const timerFill = document.getElementById('timerFill');
const scoreDisplay = document.getElementById('scoreDisplay');
const clearedDisplay = document.getElementById('clearedDisplay');
const bestDisplay = document.getElementById('bestDisplay');
const grid = document.getElementById('grid');
const restartBtn = document.getElementById('restartBtn');
const playBtn = document.getElementById('playBtn');
const overlay = document.getElementById('overlay');
const finalScore = document.getElementById('finalScore');
const finalCleared = document.getElementById('finalCleared');
const finalBest = document.getElementById('finalBest');

/* ── State ── */

let gridState = [];
let score = 0;
let cleared = 0;
let highScore = 0;
let timeRemaining = TOTAL_TIME;
let currentCommand = null;
let isRunning = false;
let isGameOver = false;
let timerId = null;
let commandTimerId = null;
let commandIndex = -1;

/* ── Helpers ── */

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ── Color / Grid ── */

function randomColorIndex() {
  return randomInt(0, COLORS.length - 1);
}

function initGrid() {
  gridState = [];
  for (let i = 0; i < TOTAL_CELLS; i++) {
    gridState.push(randomColorIndex());
  }
}

function buildGridDOM() {
  grid.innerHTML = '';
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', () => handleCellClick(i));
    grid.appendChild(cell);
  }
}

function renderGrid() {
  const cells = grid.children;
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = cells[i];
    const colorIdx = gridState[i];
    cell.style.background = COLORS[colorIdx].hex;
  }
}

function renderCell(index) {
  const cell = grid.children[index];
  cell.style.background = COLORS[gridState[index]].hex;
}

/* ── Commands ── */

function pickNewCommand() {
  let idx;
  do {
    idx = randomInt(0, COMMANDS.length - 1);
  } while (idx === commandIndex && COMMANDS.length > 1);
  commandIndex = idx;
  currentCommand = COMMANDS[idx];

  commandText.textContent = currentCommand.text;
  commandBanner.classList.remove('pulse');
  void commandBanner.offsetWidth;
  commandBanner.classList.add('pulse');

  checkAutoAdvance();
}

function checkAutoAdvance() {
  if (!isRunning || isGameOver) return;
  let hasMatch = false;
  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (currentCommand.filter(COLORS[gridState[i]])) {
      hasMatch = true;
      break;
    }
  }
  if (!hasMatch) {
    pickNewCommand();
    restartCommandTimer();
  }
}

function restartCommandTimer() {
  if (commandTimerId !== null) {
    clearInterval(commandTimerId);
  }
  commandTimerId = setInterval(pickNewCommand, COMMAND_INTERVAL);
}

/* ── Timer ── */

function startTimer() {
  timeRemaining = TOTAL_TIME;
  updateTimerBar();
  if (timerId !== null) clearInterval(timerId);
  timerId = setInterval(() => {
    timeRemaining -= 0.05;
    if (timeRemaining < 0) timeRemaining = 0;
    updateTimerBar();
    if (timeRemaining <= 0) {
      endGame();
    }
  }, 50);
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function updateTimerBar() {
  const pct = (timeRemaining / TOTAL_TIME) * 100;
  timerFill.style.width = Math.max(0, pct) + '%';
}

/* ── HUD ── */

function updateHUD() {
  scoreDisplay.textContent = String(score);
  clearedDisplay.textContent = String(cleared);
  bestDisplay.textContent = String(highScore);
}

/* ── Cell Click ── */

function handleCellClick(index) {
  if (!isRunning || isGameOver) return;

  const cell = grid.children[index];
  if (cell.classList.contains('eliminating') || cell.classList.contains('wrong')) return;

  const colorIdx = gridState[index];
  const color = COLORS[colorIdx];
  const isMatch = currentCommand.filter(color);

  if (isMatch) {
    onCorrectClick(index, cell);
  } else {
    onWrongClick(cell);
  }
}

function onCorrectClick(index, cell) {
  cell.classList.add('eliminating');

  score += POINTS_CORRECT;
  cleared++;
  updateHUD();

  setTimeout(() => {
    gridState[index] = randomColorIndex();
    renderCell(index);
    cell.classList.remove('eliminating');
    cell.classList.add('spawning');

    setTimeout(() => {
      cell.classList.remove('spawning');
      checkAutoAdvance();
    }, 250);
  }, 350);
}

function onWrongClick(cell) {
  cell.classList.add('wrong');

  score = Math.max(0, score + POINTS_WRONG);
  timeRemaining = Math.max(0, timeRemaining - TIME_PENALTY);
  updateTimerBar();
  updateHUD();

  const app = document.getElementById('app');
  app.classList.remove('error-tint');
  void app.offsetWidth;
  app.classList.add('error-tint');

  setTimeout(() => {
    cell.classList.remove('wrong');
  }, 400);
}

/* ── Game Lifecycle ── */

function startGame() {
  isGameOver = false;
  isRunning = true;
  score = 0;
  cleared = 0;
  commandIndex = -1;

  initGrid();
  renderGrid();

  overlay.classList.add('hidden');
  updateHUD();
  startTimer();
  pickNewCommand();
  restartCommandTimer();
}

function endGame() {
  isGameOver = true;
  isRunning = false;
  stopTimer();
  if (commandTimerId !== null) {
    clearInterval(commandTimerId);
    commandTimerId = null;
  }

  if (score > highScore) {
    highScore = score;
    saveHighScore();
  }

  finalScore.textContent = String(score);
  finalCleared.textContent = String(cleared);
  finalBest.textContent = String(highScore);

  overlay.classList.remove('hidden');
}

/* ── High Score ── */

function loadHighScore() {
  try {
    const saved = localStorage.getItem('paletteDropperHigh');
    if (saved !== null) {
      highScore = parseInt(saved, 10) || 0;
    }
  } catch (_) {}
  bestDisplay.textContent = String(highScore);
}

function saveHighScore() {
  try {
    localStorage.setItem('paletteDropperHigh', String(highScore));
  } catch (_) {}
}

/* ── Event Wiring ── */

restartBtn.addEventListener('click', startGame);
playBtn.addEventListener('click', startGame);

/* ── Boot ── */

buildGridDOM();
loadHighScore();
startGame();
