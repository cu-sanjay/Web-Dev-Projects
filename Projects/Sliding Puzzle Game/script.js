const SIZE = 4;
const TOTAL = SIZE * SIZE;
const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null];

const gridEl = document.getElementById('grid');
const movesVal = document.getElementById('movesVal');
const timeVal = document.getElementById('timeVal');
const bestVal = document.getElementById('bestVal');
const overlay = document.getElementById('overlay');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn = document.getElementById('resetBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const moMoves = document.getElementById('moMoves');
const moTime = document.getElementById('moTime');
const moBest = document.getElementById('moBest');

const STORAGE_KEY = 'slidingpuzzle_best';

let tiles = [];
let moves = 0;
let timer = 0;
let timerInterval = null;
let started = false;
let gameOver = false;
let bestScore = null;

function loadBest() {
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY));
    if (!isNaN(saved) && saved > 0) {
      bestScore = saved;
      bestVal.textContent = bestScore;
    }
  } catch {}
}

function saveBest(v) {
  try { localStorage.setItem(STORAGE_KEY, v); } catch {}
}

function countInversions(arr) {
  let inv = 0;
  const nums = arr.filter(v => v !== null);
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) inv++;
    }
  }
  return inv;
}

function isSolvable(arr) {
  const inv = countInversions(arr);
  const blankIdx = arr.indexOf(null);
  const blankRow = Math.floor(blankIdx / SIZE);
  const blankFromBottom = SIZE - blankRow;
  if (SIZE % 2 === 1) return inv % 2 === 0;
  return (inv + blankFromBottom) % 2 === 0;
}

function shuffleArray() {
  let arr;
  let attempts = 0;
  do {
    arr = [...GOAL];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    attempts++;
  } while (!isSolvable(arr) && attempts < 200);
  return arr;
}

function isAdjacent(i1, i2) {
  const r1 = Math.floor(i1 / SIZE), c1 = i1 % SIZE;
  const r2 = Math.floor(i2 / SIZE), c2 = i2 % SIZE;
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

function getEmptyIndex() {
  return tiles.indexOf(null);
}

function moveTile(index) {
  if (gameOver) return;
  const emptyIdx = getEmptyIndex();
  if (!isAdjacent(index, emptyIdx)) return;

  tiles[emptyIdx] = tiles[index];
  tiles[index] = null;
  moves++;
  movesVal.textContent = moves;

  if (!started) {
    started = true;
    timerInterval = setInterval(() => {
      timer++;
      timeVal.textContent = timer + 's';
    }, 1000);
  }

  render();
  checkWin();
}

function checkWin() {
  for (let i = 0; i < TOTAL; i++) {
    if (tiles[i] !== GOAL[i]) return;
  }
  gameOver = true;
  if (timerInterval) clearInterval(timerInterval);

  if (bestScore === null || moves < bestScore) {
    bestScore = moves;
    bestVal.textContent = bestScore;
    saveBest(bestScore);
  }

  moMoves.textContent = moves;
  moTime.textContent = timer + 's';
  moBest.textContent = bestScore;

  setTimeout(() => {
    overlay.classList.add('active');
  }, 300);
}

function render() {
  gridEl.innerHTML = '';
  for (let i = 0; i < TOTAL; i++) {
    const val = tiles[i];
    const cell = document.createElement('div');
    cell.className = 'tile';

    if (val === null) {
      cell.classList.add('empty');
    } else {
      cell.classList.add('active');
      cell.textContent = val;
      if (val === i + 1) cell.classList.add('correct');

      cell.addEventListener('click', () => {
        const emptyIdx = getEmptyIndex();
        if (isAdjacent(i, emptyIdx)) {
          cell.style.transform = getSlideTransform(i, emptyIdx);
          requestAnimationFrame(() => {
            cell.style.transition = 'transform 0.12s ease';
            moveTile(i);
          });
        }
      });
    }

    gridEl.appendChild(cell);
  }
}

function getSlideTransform(fromIdx, toIdx) {
  const rf = Math.floor(fromIdx / SIZE), cf = fromIdx % SIZE;
  const rt = Math.floor(toIdx / SIZE), ct = toIdx % SIZE;
  const cellSize = (100 / SIZE);
  const dx = (ct - cf) * cellSize;
  const dy = (rt - rf) * cellSize;
  return 'translate(' + dx + '%, ' + dy + '%)';
}

function newGame() {
  if (timerInterval) clearInterval(timerInterval);
  overlay.classList.remove('active');
  tiles = shuffleArray();
  moves = 0;
  timer = 0;
  started = false;
  gameOver = false;
  movesVal.textContent = '0';
  timeVal.textContent = '0s';
  render();
}

function resetPuzzle() {
  if (timerInterval) clearInterval(timerInterval);
  overlay.classList.remove('active');
  const goalTiles = [...GOAL];
  tiles = [...goalTiles];
  moves = 0;
  timer = 0;
  started = false;
  gameOver = false;
  movesVal.textContent = '0';
  timeVal.textContent = '0s';
  render();
}

function handleKey(e) {
  if (gameOver) return;
  const keyMap = {
    ArrowUp: -4, ArrowDown: 4, ArrowLeft: -1, ArrowRight: 1,
    w: -4, s: 4, a: -1, d: 1,
  };
  const dir = keyMap[e.key];
  if (!dir) return;
  e.preventDefault();

  const emptyIdx = getEmptyIndex();
  const r = Math.floor(emptyIdx / SIZE), c = emptyIdx % SIZE;
  let targetIdx;

  if (dir === -4 && r > 0) targetIdx = emptyIdx - 4;
  else if (dir === 4 && r < SIZE - 1) targetIdx = emptyIdx + 4;
  else if (dir === -1 && c > 0) targetIdx = emptyIdx - 1;
  else if (dir === 1 && c < SIZE - 1) targetIdx = emptyIdx + 1;
  else return;

  moveTile(targetIdx);
}

document.addEventListener('keydown', handleKey);
shuffleBtn.addEventListener('click', newGame);
resetBtn.addEventListener('click', resetPuzzle);
playAgainBtn.addEventListener('click', newGame);

loadBest();
newGame();
