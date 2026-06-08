const STORAGE_SCORE = 'wordscramble_high';
const TIMER_SECONDS = 30;
const HINT_PENALTY = 3;
const SKIP_PENALTY = 5;
const BASE_POINTS = 10;

const WORDS = [
  { word: 'javascript', hint: 'The language that powers interactive web pages' },
  { word: 'elephant', hint: 'The largest land animal on Earth' },
  { word: 'rainbow', hint: 'A colorful arc in the sky after rain' },
  { word: 'guitar', hint: 'A stringed musical instrument' },
  { word: 'volcano', hint: 'A mountain that erupts with lava' },
  { word: 'butterfly', hint: 'An insect with colorful wings' },
  { word: 'penguin', hint: 'A flightless bird that lives in freezing climates' },
  { word: 'astronaut', hint: 'A person trained to travel beyond the atmosphere' },
  { word: 'diamond', hint: 'The hardest naturally occurring substance' },
  { word: 'fossil', hint: 'Ancient remains preserved in rock' },
  { word: 'hurricane', hint: 'A powerful rotating tropical storm' },
  { word: 'labyrinth', hint: 'An intricate maze of passages' },
  { word: 'nebula', hint: 'A glowing cloud of interstellar gas and dust' },
  { word: 'pyramid', hint: 'A monumental structure with a square base and triangular sides' },
  { word: 'sapphire', hint: 'A precious blue gemstone' },
  { word: 'telescope', hint: 'An optical instrument used to view distant objects' },
  { word: 'umbrella', hint: 'A collapsible canopy used for rain protection' },
  { word: 'whisper', hint: 'To speak very softly without vibrating the vocal cords' },
  { word: 'symphony', hint: 'A complex orchestral composition with multiple movements' },
  { word: 'crocodile', hint: 'A large aquatic reptile with powerful jaws' },
];

let roundIndex = 0;
let roundOrder = [];
let currentWord = '';
let currentHint = '';
let scrambled = '';
let score = 0;
let highScore = 0;
let streak = 0;
let solved = 0;
let hintUsed = 0;
let hintRevealed = false;
let timer = null;
let timeLeft = TIMER_SECONDS;
let isLocked = false;

const scrambledEl = document.getElementById('scrambled');
const hintText = document.getElementById('hintText');
const hintBox = document.getElementById('hintBox');
const wordInput = document.getElementById('wordInput');
const checkBtn = document.getElementById('checkBtn');
const hintBtn = document.getElementById('hintBtn');
const skipBtn = document.getElementById('skipBtn');
const messageEl = document.getElementById('message');
const timerBar = document.getElementById('timerBar');
const timerText = document.getElementById('timerText');
const highScoreEl = document.getElementById('highScore');
const currentScoreEl = document.getElementById('currentScore');
const roundNum = document.getElementById('roundNum');
const streakCount = document.getElementById('streakCount');
const solvedCount = document.getElementById('solvedCount');
const hintsUsed = document.getElementById('hintsUsed');

function shuffle(str) {
  const arr = str.split('');
  let attempts = 0;
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    attempts++;
  } while (arr.join('') === str && attempts < 50);
  return arr.join('');
}

function generateRoundOrder() {
  roundOrder = WORDS.map((_, i) => i);
  for (let i = roundOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roundOrder[i], roundOrder[j]] = [roundOrder[j], roundOrder[i]];
  }
}

function loadWord() {
  if (roundIndex >= roundOrder.length) {
    generateRoundOrder();
    roundIndex = 0;
  }

  const idx = roundOrder[roundIndex];
  const entry = WORDS[idx];
  currentWord = entry.word;
  currentHint = entry.hint;

  do {
    scrambled = shuffle(currentWord);
  } while (scrambled === currentWord);

  roundIndex++;
  hintRevealed = false;
  isLocked = false;
  hintBox.classList.remove('revealed');
  hintText.textContent = 'Click "Get Hint" for a clue';

  renderScrambled();
  updateRound();
  resetTimer();
  wordInput.value = '';
  wordInput.disabled = false;
  wordInput.focus();
  checkBtn.disabled = false;
  hintBtn.disabled = false;
  skipBtn.disabled = false;
  messageEl.textContent = '';
  messageEl.className = 'message';
}

function renderScrambled() {
  scrambledEl.innerHTML = '';
  for (const ch of scrambled) {
    const span = document.createElement('span');
    span.className = 'letter-badge';
    span.textContent = ch;
    scrambledEl.appendChild(span);
  }
}

function resetTimer() {
  if (timer) clearInterval(timer);
  timeLeft = TIMER_SECONDS;
  updateTimerUI();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timer);
      timeOut();
    }
  }, 1000);
}

function updateTimerUI() {
  const pct = (timeLeft / TIMER_SECONDS) * 100;
  timerBar.style.width = pct + '%';
  timerText.textContent = timeLeft;

  if (timeLeft <= 5) {
    timerBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
  } else if (timeLeft <= 10) {
    timerBar.style.background = 'linear-gradient(90deg, #f59e0b, #f97316)';
  } else {
    timerBar.style.background = 'linear-gradient(90deg, #10b981, #f59e0b)';
  }
}

function timeOut() {
  isLocked = true;
  wordInput.disabled = true;
  checkBtn.disabled = true;
  hintBtn.disabled = true;
  skipBtn.disabled = true;
  messageEl.textContent = `Time's Up! ⏰ The word was "${currentWord}"`;
  messageEl.className = 'message error';
  streak = 0;
  updateStats();
  setTimeout(loadWord, 2000);
}

function checkAnswer() {
  if (isLocked) return;
  const val = wordInput.value.trim().toLowerCase();
  if (!val) return;

  if (val === currentWord) {
    clearInterval(timer);
    const bonus = timeLeft;
    const hintDeduction = hintRevealed ? HINT_PENALTY : 0;
    const pts = BASE_POINTS + Math.floor(bonus / 3) - hintDeduction;
    score += Math.max(pts, 1);
    streak++;
    solved++;
    messageEl.textContent = `Correct! +${Math.max(pts, 1)} pts (${bonus}s remaining)`;
    messageEl.className = 'message success';
    scrambleSuccessAnimation();
    isLocked = true;
    wordInput.disabled = true;
    checkBtn.disabled = true;
    hintBtn.disabled = true;
    skipBtn.disabled = true;
    updateScore();
    updateStats();
    setTimeout(loadWord, 1300);
  } else {
    messageEl.textContent = 'Incorrect, try again!';
    messageEl.className = 'message error';
    streak = 0;
    updateStats();
    wordInput.value = '';
    wordInput.focus();
    setTimeout(() => {
      if (!messageEl.className.includes('success')) messageEl.textContent = '';
    }, 800);
  }
}

function scrambleSuccessAnimation() {
  const badges = scrambledEl.querySelectorAll('.letter-badge');
  badges.forEach((b, i) => {
    b.style.color = '#10b981';
    b.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    b.style.animation = 'none';
    b.style.transform = `translateY(-${(i % 2 === 0 ? 4 : 2)}px)`;
  });
}

function revealHint() {
  if (hintRevealed || isLocked) return;
  hintRevealed = true;
  hintUsed++;
  hintText.textContent = currentHint;
  hintBox.classList.add('revealed');
  hintBtn.disabled = true;
  updateStats();
}

function skipWord() {
  if (isLocked) return;
  clearInterval(timer);
  streak = 0;
  messageEl.textContent = `Skipped! The word was "${currentWord}"`;
  messageEl.className = 'message reveal';
  isLocked = true;
  wordInput.disabled = true;
  checkBtn.disabled = true;
  hintBtn.disabled = true;
  skipBtn.disabled = true;
  updateStats();
  setTimeout(loadWord, 1200);
}

function updateRound() {
  roundNum.textContent = `${Math.min(roundIndex, WORDS.length)}/${WORDS.length}`;
}

function updateScore() {
  currentScoreEl.textContent = score;
  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = highScore;
    try { localStorage.setItem(STORAGE_SCORE, highScore); } catch {}
  }
}

function updateStats() {
  streakCount.textContent = streak;
  solvedCount.textContent = solved;
  hintsUsed.textContent = hintUsed;
}

function loadHighScore() {
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_SCORE));
    if (!isNaN(saved) && saved >= 0) {
      highScore = saved;
      highScoreEl.textContent = highScore;
    }
  } catch {}
}

function handleEnter(e) {
  if (e.key === 'Enter') checkAnswer();
}

wordInput.addEventListener('keydown', handleEnter);
checkBtn.addEventListener('click', checkAnswer);
hintBtn.addEventListener('click', revealHint);
skipBtn.addEventListener('click', skipWord);

loadHighScore();
generateRoundOrder();
loadWord();
