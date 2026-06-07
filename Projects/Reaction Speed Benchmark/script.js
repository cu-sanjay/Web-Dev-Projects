const STATE = { IDLE: 'idle', WAITING: 'waiting', TRIGGERED: 'triggered', PENALTY: 'penalty', RESULTS: 'results' };

const STORAGE_BEST = 'reaction_best';

let state = STATE.IDLE;
let timeoutHandle = null;
let startTime = 0;
let bestTime = Infinity;
let attempts = [];
let canClick = false;

const pad = document.getElementById('pad');
const padIcon = document.getElementById('padIcon');
const padLabel = document.getElementById('padLabel');
const padTime = document.getElementById('padTime');
const lastVal = document.getElementById('lastVal');
const bestVal = document.getElementById('bestVal');
const historyList = document.getElementById('historyList');
const attemptCount = document.getElementById('attemptCount');

function setState(s) {
  state = s;
  pad.className = 'pad ' + s;
}

function loadBest() {
  try {
    const saved = parseFloat(localStorage.getItem(STORAGE_BEST));
    if (!isNaN(saved) && saved > 0 && saved < 2000) {
      bestTime = saved;
      bestVal.textContent = bestTime.toFixed(0) + 'ms';
    }
  } catch {}
}

function saveBest(t) {
  try { localStorage.setItem(STORAGE_BEST, t); } catch {}
}

function idle() {
  setState(STATE.IDLE);
  padIcon.textContent = '◉';
  padLabel.textContent = 'Click to Start';
  padTime.textContent = '';
  canClick = true;
}

function startWaiting() {
  setState(STATE.WAITING);
  padIcon.textContent = '◉';
  padLabel.textContent = 'Wait for green…';
  padTime.textContent = '';
  canClick = false;

  const delay = Math.floor(Math.random() * 3001) + 2000;

  timeoutHandle = setTimeout(() => {
    setState(STATE.TRIGGERED);
    padIcon.textContent = '●';
    padLabel.textContent = 'Click Now!';
    startTime = performance.now();
    canClick = true;
  }, delay);
}

function trigger() {
  if (state !== STATE.TRIGGERED || !canClick) return;
  const elapsed = performance.now() - startTime;
  canClick = false;

  attempts.push(elapsed);
  updateHistory(elapsed);

  const isBest = elapsed < bestTime;
  if (isBest) {
    bestTime = elapsed;
    bestVal.textContent = elapsed.toFixed(0) + 'ms';
    saveBest(elapsed);
  }

  lastVal.textContent = elapsed.toFixed(0) + 'ms';

  setState(STATE.RESULTS);
  padIcon.textContent = '✓';
  padLabel.textContent = isBest ? 'New Best!' : 'Click to Retry';
  padTime.textContent = elapsed.toFixed(0) + 'ms';

  setTimeout(() => {
    if (state === STATE.RESULTS) idle();
  }, 1500);
}

function penalty() {
  if (timeoutHandle) {
    clearTimeout(timeoutHandle);
    timeoutHandle = null;
  }
  setState(STATE.PENALTY);
  padIcon.textContent = '⚠';
  padLabel.textContent = 'Too Early! Tap to retry';
  padTime.textContent = '';
  canClick = false;

  setTimeout(() => {
    if (state === STATE.PENALTY) idle();
  }, 1000);
}

function handleClick() {
  if (state === STATE.IDLE) {
    startWaiting();
  } else if (state === STATE.WAITING) {
    penalty();
  } else if (state === STATE.TRIGGERED) {
    trigger();
  } else if (state === STATE.PENALTY || state === STATE.RESULTS) {
    idle();
  }
}

function updateHistory(elapsed) {
  attemptCount.textContent = attempts.length;

  const empty = historyList.querySelector('.history-empty');
  if (empty) empty.remove();

  const item = document.createElement('div');
  item.className = 'history-item';

  const num = document.createElement('span');
  num.className = 'h-num';
  num.textContent = '#' + attempts.length;

  const time = document.createElement('span');
  time.className = 'h-time';
  time.textContent = elapsed.toFixed(0) + 'ms';

  item.appendChild(num);
  item.appendChild(time);

  if (elapsed === bestTime) {
    const badge = document.createElement('span');
    badge.className = 'h-badge';
    badge.textContent = 'BEST';
    item.appendChild(badge);
  }

  historyList.appendChild(item);
  historyList.scrollTop = historyList.scrollHeight;
}

pad.addEventListener('click', handleClick);
pad.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleClick();
}, { passive: false });

loadBest();
idle();
