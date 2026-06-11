const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const bestEl = document.getElementById('best');
const timerEl = document.getElementById('timer');
const displayLabel = document.getElementById('displayLabel');
const numberDisplay = document.getElementById('numberDisplay');
const answerForm = document.getElementById('answerForm');
const answerInput = document.getElementById('answerInput');
const submitButton = document.getElementById('submitButton');
const restartButton = document.getElementById('restartButton');
const startButton = document.getElementById('startButton');
const messageEl = document.getElementById('message');
const confettiContainer = document.getElementById('confetti');

const state = {
  level: 1,
  lives: 3,
  best: 0,
  answer: '',
  running: false,
  inputEnabled: false,
  timerId: null,
  countdownId: null
};

function randomNumber(length) {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += String(Math.floor(Math.random() * 10));
  }
  return result;
}

function updateStats() {
  levelEl.textContent = state.level;
  livesEl.textContent = state.lives;
  bestEl.textContent = state.best;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function enableInput(enabled) {
  state.inputEnabled = enabled;
  answerInput.disabled = !enabled;
  submitButton.disabled = !enabled;
  if (enabled) {
    answerInput.focus();
  }
}

function clearTimers() {
  clearTimeout(state.timerId);
  clearInterval(state.countdownId);
}

function showNumber() {
  displayLabel.textContent = 'Memorize the number';
  numberDisplay.textContent = state.answer;
  timerEl.textContent = '2s';
  enableInput(false);
  setMessage(`Memorize this ${state.answer.length}-digit number.`);

  let remaining = 2;
  state.countdownId = setInterval(() => {
    remaining -= 1;
    timerEl.textContent = `${remaining}s`;
    if (remaining <= 0) {
      clearInterval(state.countdownId);
    }
  }, 1000);

  state.timerId = setTimeout(hideNumber, 2000);
}

function hideNumber() {
  displayLabel.textContent = 'Type it now';
  numberDisplay.textContent = '● ● ● ●';
  timerEl.textContent = '0s';
  enableInput(true);
  answerInput.value = '';
  setMessage('Enter the number before the round ends.');
}

function finishRound(correct) {
  state.running = false;
  enableInput(false);
  clearTimers();

  if (correct) {
    state.best = Math.max(state.best, state.level);
    setMessage('Nice work! Advancing to the next level...');
    createConfetti();
    state.level += 1;
    updateStats();
    state.timerId = setTimeout(startRound, 1100);
    return;
  }

  state.lives -= 1;
  updateStats();
  if (state.lives <= 0) {
    numberDisplay.textContent = state.answer;
    displayLabel.textContent = 'Game over';
    timerEl.textContent = '—';
    setMessage(`You lost all lives. You reached level ${state.level}. Restart to play again.`);
    startButton.textContent = 'Play Again';
    return;
  }

  numberDisplay.textContent = state.answer;
  displayLabel.textContent = 'Try again';
  timerEl.textContent = '—';
  setMessage(`Wrong answer. The correct number was ${state.answer}. ${state.lives} life${state.lives === 1 ? '' : 's'} left.`);
  state.timerId = setTimeout(startRound, 1400);
}

function startRound() {
  if (state.lives <= 0) {
    return;
  }

  state.running = true;
  state.answer = randomNumber(Math.min(6, 2 + state.level));
  updateStats();
  clearConfetti();
  showNumber();
}

function startGame() {
  clearTimers();
  state.level = 1;
  state.lives = 3;
  state.answer = '';
  state.running = false;
  updateStats();
  startButton.textContent = 'Restart Game';
  setMessage('Get ready! Your first number appears in a moment.');
  state.timerId = setTimeout(startRound, 300);
}

function restartGame() {
  clearTimers();
  state.level = 1;
  state.lives = 3;
  state.answer = '';
  state.running = false;
  updateStats();
  displayLabel.textContent = 'Ready?';
  numberDisplay.textContent = '—';
  timerEl.textContent = '2s';
  startButton.textContent = 'Start Game';
  setMessage('Press start to begin your memory run.');
  enableInput(false);
  clearConfetti();
}

function handleSubmit(event) {
  event.preventDefault();
  if (!state.running || !state.inputEnabled) {
    return;
  }

  const guess = answerInput.value.trim();
  if (!guess) {
    answerInput.focus();
    return;
  }

  state.running = false;
  const correct = guess === state.answer;
  finishRound(correct);
}

function createConfetti() {
  clearConfetti();
  const colors = ['#4f46e5', '#22c55e', '#0ea5e9', '#f59e0b', '#ec4899'];
  const count = 35;
  const width = document.body.clientWidth;

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.background = colors[i % colors.length];
    piece.style.left = `${Math.random() * width}px`;
    piece.style.top = `${Math.random() * -20}px`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.animationDelay = `${Math.random() * 200}ms`;
    piece.style.width = `${8 + Math.random() * 6}px`;
    piece.style.height = `${8 + Math.random() * 6}px`;
    confettiContainer.appendChild(piece);
  }

  setTimeout(clearConfetti, 1700);
}

function clearConfetti() {
  confettiContainer.innerHTML = '';
}

answerForm.addEventListener('submit', handleSubmit);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
answerInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !submitButton.disabled) {
    handleSubmit(event);
  }
});

updateStats();
enableInput(false);
