const attemptsVal = document.getElementById('attemptsVal');
const rangeVal = document.getElementById('rangeVal');
const bestVal = document.getElementById('bestVal');
const feedback = document.getElementById('feedback');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const resetBtn = document.getElementById('resetBtn');
const log = document.getElementById('log');
const overlay = document.getElementById('overlay');
const playAgainBtn = document.getElementById('playAgainBtn');
const moAttempts = document.getElementById('moAttempts');
const moBest = document.getElementById('moBest');

const STORAGE_KEY = 'numberguess_best';

let secret = 0;
let attempts = 0;
let bestScore = null;
let lowBound = 1;
let highBound = 100;
let gameOver = false;

function loadBest() {
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY));
    if (!isNaN(saved) && saved > 0) { bestScore = saved; bestVal.textContent = bestScore; }
  } catch {}
}

function saveBest(v) {
  try { localStorage.setItem(STORAGE_KEY, String(v)); } catch {}
}

function initGame() {
  secret = Math.floor(Math.random() * 100) + 1;
  attempts = 0;
  lowBound = 1;
  highBound = 100;
  gameOver = false;
  log.innerHTML = '';
  guessInput.value = '';
  guessInput.disabled = false;
  guessBtn.disabled = false;
  feedback.textContent = 'Guess a number between 1 and 100';
  feedback.className = 'feedback';
  updateHUD();
  overlay.classList.remove('active');
  guessInput.focus();
}

function updateHUD() {
  attemptsVal.textContent = attempts;
  rangeVal.textContent = lowBound + ' \u2013 ' + highBound;
  bestVal.textContent = bestScore !== null ? bestScore : '\u2014';
}

function addLog(guess, result) {
  const entry = document.createElement('div');
  entry.className = 'log-entry ' + result;
  entry.innerHTML = '<span>' + guess + '</span><span>' +
    (result === 'high' ? '\u2191 High' : result === 'low' ? '\u2193 Low' : '\u2713 Correct') + '</span>';
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function handleGuess() {
  if (gameOver) return;

  const raw = guessInput.value.trim();
  if (raw === '') {
    feedback.textContent = 'Enter a number.';
    feedback.className = 'feedback error';
    return;
  }

  const val = Number(raw);
  if (!Number.isInteger(val) || val < 1 || val > 100) {
    feedback.textContent = 'Must be a whole number between 1 and 100.';
    feedback.className = 'feedback error';
    guessInput.value = '';
    return;
  }

  attempts++;
  guessInput.value = '';
  guessInput.focus();

  if (val === secret) {
    gameOver = true;
    guessInput.disabled = true;
    guessBtn.disabled = true;
    feedback.textContent = 'Correct! The number was ' + secret + '.';
    feedback.className = 'feedback correct';
    addLog(val, 'correct');
    updateHUD();

    if (bestScore === null || attempts < bestScore) {
      bestScore = attempts;
      bestVal.textContent = bestScore;
      saveBest(bestScore);
    }

    moAttempts.textContent = attempts;
    moBest.textContent = bestScore;
    setTimeout(() => overlay.classList.add('active'), 400);
    return;
  }

  if (val < secret) {
    feedback.textContent = 'Too Low \u2193';
    feedback.className = 'feedback low';
    addLog(val, 'low');
    lowBound = Math.max(lowBound, val + 1);
  } else {
    feedback.textContent = 'Too High \u2191';
    feedback.className = 'feedback high';
    addLog(val, 'high');
    highBound = Math.min(highBound, val - 1);
  }

  updateHUD();
}

guessBtn.addEventListener('click', handleGuess);
guessInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleGuess(); });
resetBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

loadBest();
initGame();
