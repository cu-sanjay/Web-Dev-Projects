const ROUND_TIME = 5000;
const TIMER_INTERVAL = 50;
const VARIANCE_HUE = [2, 5];
const VARIANCE_SAT = [3, 8];
const VARIANCE_LIGHT = [3, 8];

const targetBox = document.getElementById('targetBox');
const choiceTiles = document.querySelectorAll('.choice-tile');
const timerBar = document.getElementById('timerBar');
const scoreDisplay = document.getElementById('scoreDisplay');
const bestDisplay = document.getElementById('bestDisplay');
const finalScore = document.getElementById('finalScore');
const wrongColorSwatch = document.getElementById('wrongColorSwatch');
const correctColorSwatch = document.getElementById('correctColorSwatch');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const gameOverOverlay = document.getElementById('gameOverOverlay');

let currentStreak = 0;
let highestStreak = 0;
let timerId = null;
let timeStart = 0;
let isPlaying = false;
let currentTargetColor = null;
let currentOptions = [];

function loadHighScore() {
  try {
    const saved = localStorage.getItem('chromaMatchHigh');
    if (saved !== null) {
      highestStreak = parseInt(saved, 10) || 0;
    }
  } catch (_) {}
  bestDisplay.textContent = highestStreak;
}

function saveHighScore() {
  try {
    localStorage.setItem('chromaMatchHigh', String(highestStreak));
  } catch (_) {}
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hslString(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function generateTargetColor() {
  const h = randomInt(0, 360);
  const s = randomInt(40, 90);
  const l = randomInt(35, 75);
  return { h, s, l };
}

function generateDecoy(target, index) {
  const seed = index + 1;
  const hueShift = randomInt(VARIANCE_HUE[0], VARIANCE_HUE[1]) * (seed % 2 === 0 ? 1 : -1);
  const satShift = randomInt(VARIANCE_SAT[0], VARIANCE_SAT[1]) * (seed % 3 < 2 ? 1 : -1);
  const lightShift = randomInt(VARIANCE_LIGHT[0], VARIANCE_LIGHT[1]) * (seed % 2 === 0 ? 1 : -1);

  let dh = (target.h + hueShift + 360) % 360;
  let ds = clamp(target.s + satShift, 10, 95);
  let dl = clamp(target.l + lightShift, 15, 85);

  return { h: dh, s: ds, l: dl };
}

function colorsEqual(a, b) {
  return a.h === b.h && a.s === b.s && a.l === b.l;
}

function generateRound() {
  const target = generateTargetColor();
  const decoys = [];

  let attempts = 0;
  while (decoys.length < 3 && attempts < 50) {
    const d = generateDecoy(target, decoys.length + attempts);
    if (!colorsEqual(d, target) && !decoys.some(ex => colorsEqual(ex, d))) {
      decoys.push(d);
    }
    attempts++;
  }

  const options = [target, ...decoys];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { target, options };
}

function applyColors(target, options) {
  targetBox.style.backgroundColor = hslString(target.h, target.s, target.l);
  choiceTiles.forEach((tile, i) => {
    tile.style.backgroundColor = hslString(options[i].h, options[i].s, options[i].l);
    tile.disabled = false;
    tile.classList.remove('correct-flash', 'wrong-shake');
  });
}

function resetTimerBar() {
  timerBar.style.width = '100%';
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  stopTimer();
  resetTimerBar();
  timeStart = performance.now();

  timerId = setInterval(() => {
    const elapsed = performance.now() - timeStart;
    const remaining = Math.max(0, 1 - elapsed / ROUND_TIME);
    timerBar.style.width = `${remaining * 100}%`;

    if (elapsed >= ROUND_TIME) {
      stopTimer();
      handleTimeout();
    }
  }, TIMER_INTERVAL);
}

function handleTimeout() {
  if (!isPlaying) return;
  endGame(null);
}

function handleChoice(index) {
  if (!isPlaying) return;
  const tile = choiceTiles[index];
  const chosen = currentOptions[index];

  if (colorsEqual(chosen, currentTargetColor)) {
    tile.classList.add('correct-flash');
    currentStreak++;
    scoreDisplay.textContent = currentStreak;

    if (currentStreak > highestStreak) {
      highestStreak = currentStreak;
      bestDisplay.textContent = highestStreak;
      saveHighScore();
    }

    stopTimer();
    setTimeout(() => {
      if (isPlaying) startRound();
    }, 400);
  } else {
    tile.classList.add('wrong-shake');
    endGame(chosen);
  }
}

function endGame(wrongColor) {
  isPlaying = false;
  stopTimer();

  choiceTiles.forEach(t => t.disabled = true);

  finalScore.textContent = currentStreak;

  if (wrongColor) {
    wrongColorSwatch.style.backgroundColor = hslString(wrongColor.h, wrongColor.s, wrongColor.l);
  } else {
    wrongColorSwatch.style.backgroundColor = '#555';
  }
  correctColorSwatch.style.backgroundColor = hslString(
    currentTargetColor.h, currentTargetColor.s, currentTargetColor.l
  );

  gameOverOverlay.classList.remove('hidden');
}

function startRound() {
  const round = generateRound();
  currentTargetColor = round.target;
  currentOptions = round.options;

  applyColors(currentTargetColor, currentOptions);
  resetTimerBar();
  startTimer();
}

function resetGame() {
  gameOverOverlay.classList.add('hidden');
  currentStreak = 0;
  scoreDisplay.textContent = '0';
  isPlaying = true;
  startRound();
}

choiceTiles.forEach((tile) => {
  tile.addEventListener('click', () => {
    handleChoice(parseInt(tile.dataset.index, 10));
  });
});

tryAgainBtn.addEventListener('click', resetGame);

loadHighScore();

resetGame();
