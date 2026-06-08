/* ── Audio Constants ── */

const FREQUENCIES = [
  261.63,  // C4
  329.63,  // E4
  392.00,  // G4
  523.25,  // C5
];
const DISSONANCE_FREQ = 120;
const DISSONANCE_TYPE = 'square';
const TONE_TYPE = 'sine';
const TONE_VOLUME = 0.25;
const TONE_DURATION_S = 0.6;
const GAP_S = 0.3;
const TAP_TONE_DURATION_S = 0.35;
const FEEDBACK_DELAY_MS = 1400;
const INITIAL_LENGTH = 3;

/* ── DOM Refs ── */

const lengthDisplay = document.getElementById('lengthDisplay');
const peakDisplay = document.getElementById('peakDisplay');
const attemptDisplay = document.getElementById('attemptDisplay');
const statusMessage = document.getElementById('statusMessage');
const grid = document.getElementById('grid');
const blocks = document.querySelectorAll('.block');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const resultsOverlay = document.getElementById('resultsOverlay');
const resultSpan = document.getElementById('resultSpan');
const resultPeak = document.getElementById('resultPeak');
const resultCorrect = document.getElementById('resultCorrect');
const resultSummary = document.getElementById('resultSummary');

/* ── Audio Engine ── */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(frequency, duration, type, volume) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = type || TONE_TYPE;
  osc.frequency.setValueAtTime(frequency, now);

  const vol = volume !== undefined ? volume : TONE_VOLUME;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.005);
  gain.gain.setValueAtTime(vol, now + duration - 0.025);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

function playBlockTone(index) {
  playTone(FREQUENCIES[index], TAP_TONE_DURATION_S);
}

function playDissonance() {
  playTone(DISSONANCE_FREQ, 0.3, DISSONANCE_TYPE, 0.18);
}

/* ── State ── */

const PHASE = {
  IDLE: 'idle',
  LISTENING: 'listening',
  INPUT: 'input',
  FEEDBACK: 'feedback',
  DONE: 'done',
};

let phase = PHASE.IDLE;
let sequenceLength = INITIAL_LENGTH;
let peakSpan = 0;
let trialAtLength = 0;
let totalCorrect = 0;
let currentSequence = [];
let userSequence = [];
let cancelled = false;

/* ── Delay ── */

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ── Status ── */

function setStatus(text, cls) {
  statusMessage.textContent = text;
  statusMessage.className = cls || '';
}

/* ── HUD ── */

function updateHUD() {
  lengthDisplay.textContent = String(sequenceLength);
  peakDisplay.textContent = String(peakSpan);
  attemptDisplay.textContent = `${trialAtLength + 1} / 2`;
}

/* ── Block Controls ── */

function setBlocksEnabled(enabled) {
  blocks.forEach(el => el.classList.toggle('disabled', !enabled));
}

function resetBlocks() {
  blocks.forEach(el => {
    el.classList.remove('active', 'correct-tap', 'error-tap');
  });
}

/* ── Sequence Generation ── */

function generateSequence(length) {
  const seq = [];
  for (let i = 0; i < length; i++) {
    seq.push(Math.floor(Math.random() * 4));
  }
  return seq;
}

/* ── Playback Engine ── */

async function runPlayback() {
  phase = PHASE.LISTENING;
  setBlocksEnabled(false);
  resetBlocks();
  setStatus('LISTENING TO FREQUENCIES', 'listening');

  for (let i = 0; i < currentSequence.length; i++) {
    if (cancelled) return;
    const id = currentSequence[i];
    const el = blocks[id];

    el.classList.add('active');
    playTone(FREQUENCIES[id], TONE_DURATION_S);
    await delay(TONE_DURATION_S * 1000);
    if (cancelled) return;
    el.classList.remove('active');

    if (i < currentSequence.length - 1) {
      await delay(GAP_S * 1000);
      if (cancelled) return;
    }
  }

  if (cancelled) return;

  phase = PHASE.INPUT;
  userSequence = [];
  setBlocksEnabled(true);
  setStatus('REPLICATE MELODY', 'input');
}

/* ── Tap Handler ── */

function handleBlockTap(index) {
  if (phase !== PHASE.INPUT) return;

  const el = blocks[index];
  const expectedIdx = userSequence.length;
  const expectedId = currentSequence[expectedIdx];

  if (index === expectedId) {
    playBlockTone(index);
    el.classList.add('correct-tap');
    userSequence.push(index);

    if (userSequence.length === currentSequence.length) {
      onTrialCorrect();
    }
  } else {
    playDissonance();
    el.classList.add('error-tap');
    setBlocksEnabled(false);
    onTrialIncorrect();
  }
}

/* ── Trial Outcomes ── */

function onTrialCorrect() {
  phase = PHASE.FEEDBACK;
  totalCorrect++;

  if (sequenceLength > peakSpan) {
    peakSpan = sequenceLength;
    savePeakSpan();
  }

  updateHUD();
  setStatus('CORRECT', 'correct');

  setTimeout(() => {
    if (cancelled) return;
    sequenceLength++;
    trialAtLength = 0;
    updateHUD();
    startNextTrial();
  }, FEEDBACK_DELAY_MS);
}

function onTrialIncorrect() {
  phase = PHASE.FEEDBACK;
  triggerErrorFeedback();
  setStatus('INCORRECT', 'error');

  setTimeout(() => {
    if (cancelled) return;
    trialAtLength++;
    if (trialAtLength < 2) {
      updateHUD();
      startNextTrial();
    } else {
      finishSession();
    }
  }, FEEDBACK_DELAY_MS);
}

/* ── Error Feedback ── */

function triggerErrorFeedback() {
  const app = document.getElementById('app');
  app.classList.remove('shake');
  void app.offsetWidth;
  app.classList.add('shake');

  grid.classList.remove('amber-fade');
  void grid.offsetWidth;
  grid.classList.add('amber-fade');

  app.addEventListener('animationend', () => {
    app.classList.remove('shake');
  }, { once: true });
  grid.addEventListener('animationend', () => {
    grid.classList.remove('amber-fade');
  }, { once: true });
}

/* ── Trial Runner ── */

function startNextTrial() {
  if (cancelled) return;
  currentSequence = generateSequence(sequenceLength);
  userSequence = [];
  resetBlocks();
  runPlayback();
}

/* ── Session Lifecycle ── */

function startSession() {
  if (phase === PHASE.LISTENING || phase === PHASE.INPUT) return;

  getAudioContext();

  cancelled = false;
  sequenceLength = INITIAL_LENGTH;
  trialAtLength = 0;
  totalCorrect = 0;
  currentSequence = [];
  userSequence = [];

  resultsOverlay.classList.add('hidden');
  startBtn.disabled = true;
  startBtn.textContent = 'RUNNING...';
  resetBlocks();

  updateHUD();
  startNextTrial();
}

function cancelSession() {
  cancelled = true;
  phase = PHASE.IDLE;
  setBlocksEnabled(false);
  resetBlocks();
  startBtn.disabled = false;
  startBtn.textContent = 'START SESSION';
  setStatus('PRESS START TO BEGIN', '');
}

function finishSession() {
  phase = PHASE.DONE;
  setBlocksEnabled(false);
  setStatus('SESSION COMPLETE', 'done');
  startBtn.disabled = false;
  startBtn.textContent = 'START SESSION';
  showResults();
}

/* ── Results ── */

function showResults() {
  const finalSpan = peakSpan;
  const peakSeq = peakSpan;
  const interpret = getInterpretation(finalSpan);

  resultSpan.textContent = String(finalSpan);
  resultPeak.textContent = String(peakSeq);
  resultCorrect.textContent = String(totalCorrect);
  resultSummary.textContent = interpret;

  resultsOverlay.classList.remove('hidden');
}

function getInterpretation(span) {
  if (span >= 9) return 'Exceptional auditory-spatial working memory capacity.';
  if (span >= 7) return 'Above average audio recall performance.';
  if (span >= 5) return 'Average musical memory span for neurotypical adults.';
  if (span >= 3) return 'Below average; consistent practice may improve retention.';
  return 'Limited span detected; short-term auditory memory may benefit from rehearsal training.';
}

/* ── localStorage Persistence ── */

function loadPeakSpan() {
  try {
    const saved = localStorage.getItem('simonAudioSpan');
    if (saved !== null) {
      peakSpan = parseInt(saved, 10) || 0;
    }
  } catch (_) {}
  peakDisplay.textContent = String(peakSpan);
}

function savePeakSpan() {
  try {
    localStorage.setItem('simonAudioSpan', String(peakSpan));
  } catch (_) {}
}

/* ── Full Reset ── */

function fullReset() {
  cancelSession();
  resultsOverlay.classList.add('hidden');
  sequenceLength = INITIAL_LENGTH;
  trialAtLength = 0;
  totalCorrect = 0;
  currentSequence = [];
  userSequence = [];
  loadPeakSpan();
  updateHUD();
  resetBlocks();
  setBlocksEnabled(false);
  setStatus('PRESS START TO BEGIN', '');
  startBtn.disabled = false;
  startBtn.textContent = 'START SESSION';
}

/* ── Event Wiring ── */

blocks.forEach((el) => {
  el.addEventListener('click', () => {
    const idx = parseInt(el.dataset.index, 10);
    handleBlockTap(idx);
  });
});

startBtn.addEventListener('click', startSession);
restartBtn.addEventListener('click', fullReset);

/* ── Boot ── */

loadPeakSpan();
fullReset();
