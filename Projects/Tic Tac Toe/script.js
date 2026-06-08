const STORAGE_KEY = 'tictactoe_stats';

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameMode = 'pvp';
let gameOver = false;
let aiTimeout = null;
let scores = loadScores();

const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const xScoreEl = document.getElementById('xScore');
const oScoreEl = document.getElementById('oScore');
const drawScoreEl = document.getElementById('drawScore');
const resetBtn = document.getElementById('resetBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const winLine = document.getElementById('winLine');

function loadScores() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { xWins: 0, oWins: 0, draws: 0 };
  } catch {
    return { xWins: 0, oWins: 0, draws: 0 };
  }
}

function saveScores() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {}
}

function updateScoreboard() {
  xScoreEl.textContent = scores.xWins;
  oScoreEl.textContent = scores.oWins;
  drawScoreEl.textContent = scores.draws;
}

function setStatus(msg) {
  statusEl.textContent = msg;
}

function checkWinnerOn(arr) {
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (arr[a] && arr[a] === arr[b] && arr[a] === arr[c]) {
      return { winner: arr[a], combo };
    }
  }
  return null;
}

function checkWinner() {
  return checkWinnerOn(board);
}

function isDrawOn(arr) {
  return arr.every((cell) => cell !== null);
}

function isDraw() {
  return isDrawOn(board);
}

function highlightWin(combo) {
  combo.forEach((i) => cells[i].classList.add('win-highlight'));
  drawWinLine(combo);
}

function drawWinLine(combo) {
  const boardEl = document.getElementById('board');
  const boardRect = boardEl.getBoundingClientRect();
  const cell0 = cells[combo[0]];
  const cell2 = cells[combo[2]];
  const r0 = cell0.getBoundingClientRect();
  const r2 = cell2.getBoundingClientRect();

  const x1 = r0.left + r0.width / 2 - boardRect.left;
  const y1 = r0.top + r0.height / 2 - boardRect.top;
  const x2 = r2.left + r2.width / 2 - boardRect.left;
  const y2 = r2.top + r2.height / 2 - boardRect.top;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  const token = board[combo[0]];
  const color = token === 'X' ? '#06b6d4' : '#ec4899';

  winLine.style.width = `${length}px`;
  winLine.style.height = '4px';
  winLine.style.background = `linear-gradient(90deg, ${color}, ${color}88)`;
  winLine.style.left = `${x1}px`;
  winLine.style.top = `${y1 - 2}px`;
  winLine.style.transform = `rotate(${angle}deg)`;
  winLine.style.transformOrigin = '0 50%';
  winLine.style.borderRadius = '2px';
  winLine.style.boxShadow = `0 0 12px ${color}`;
  winLine.classList.add('show');
}

function endGame(result) {
  gameOver = true;
  document.querySelectorAll('.cell').forEach((c) => c.classList.add('game-over'));

  if (result.winner) {
    const name = result.winner === 'X'
      ? (gameMode === 'ai' ? 'You' : 'Player X')
      : (gameMode === 'ai' ? 'AI' : 'Player O');
    setStatus(`${name} wins!`);
    highlightWin(result.combo);
    if (result.winner === 'X') scores.xWins++;
    else scores.oWins++;
  } else {
    setStatus("It's a draw!");
    scores.draws++;
  }
  saveScores();
  updateScoreboard();
}

function makeMove(index) {
  if (gameOver || board[index] !== null) return false;

  board[index] = currentPlayer;
  cells[index].textContent = currentPlayer;
  cells[index].classList.add('taken', currentPlayer.toLowerCase());

  const result = checkWinner();
  if (result) {
    endGame(result);
    return true;
  }

  if (isDraw()) {
    endGame({ winner: null });
    return true;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
  return true;
}

function updateStatus() {
  if (gameOver) return;
  if (gameMode === 'ai') {
    setStatus(currentPlayer === 'X' ? 'Your turn (X)' : 'AI is thinking...');
  } else {
    setStatus(`Player ${currentPlayer}'s turn`);
  }
}

function handleCellClick(e) {
  const index = parseInt(e.currentTarget.dataset.index);
  if (gameOver || board[index] !== null) return;
  if (gameMode === 'ai' && currentPlayer === 'O') return;

  makeMove(index);

  if (gameMode === 'ai' && !gameOver && currentPlayer === 'O') {
    aiTimeout = setTimeout(aiMove, 400);
  }
}

function aiMove() {
  if (gameOver || currentPlayer !== 'O') return;
  const index = getBestMove();
  if (index !== -1) makeMove(index);
  if (!gameOver && currentPlayer === 'O') {
    aiTimeout = setTimeout(aiMove, 400);
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let bestIndex = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) continue;
    board[i] = 'O';
    const score = minimax(board, 0, false);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function minimax(boardArr, depth, isMaximizing) {
  const result = checkWinnerOn(boardArr);
  if (result) {
    return result.winner === 'O' ? 10 - depth : depth - 10;
  }
  if (isDrawOn(boardArr)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardArr[i] !== null) continue;
      boardArr[i] = 'O';
      best = Math.max(best, minimax(boardArr, depth + 1, false));
      boardArr[i] = null;
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardArr[i] !== null) continue;
      boardArr[i] = 'X';
      best = Math.min(best, minimax(boardArr, depth + 1, true));
      boardArr[i] = null;
    }
    return best;
  }
}

function resetGame() {
  if (aiTimeout) {
    clearTimeout(aiTimeout);
    aiTimeout = null;
  }
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;
  winLine.classList.remove('show');
  winLine.style.width = '0';
  cells.forEach((cell) => {
    cell.textContent = '';
    cell.className = 'cell';
  });
  updateStatus();
  updateScoreboard();
}

cells.forEach((cell) => cell.addEventListener('click', handleCellClick));

resetBtn.addEventListener('click', resetGame);

modeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    gameMode = btn.dataset.mode;
    resetGame();
  });
});

updateStatus();
updateScoreboard();
