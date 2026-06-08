/* ── Constants ── */

const TOTAL_BLOCKS = 9;
const INITIAL_SPAN = 2;
const TRIALS_PER_LEVEL = 2;
const HIGHLIGHT_MS = 950;
const GAP_MS = 350;
const PRE_INPUT_BUFFER_MS = 500;
const FEEDBACK_MS = 1400;

const BLOCK_POSITIONS = [
  { x: 12, y: 11 },
  { x: 46, y: 5  },
  { x: 77, y: 13 },
  { x: 17, y: 40 },
  { x: 53, y: 36 },
  { x: 83, y: 44 },
  { x: 7,  y: 68 },
  { x: 41, y: 72 },
  { x: 73, y: 75 },
];

/* ── DOM Refs ── */

const blocksContainer = document.getElementById('blocksContainer');
const spanDisplay = document.getElementById('spanDisplay');
const maxSpanDisplay = document.getElementById('maxSpanDisplay');
const trialDisplay = document.getElementById('trialDisplay');
const statusMessage = document.getElementById('statusMessage');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const resultsOverlay = document.getElementById('resultsOverlay');
const resultSpan = document.getElementById('resultSpan');
const resultLongest = document.getElementById('resultLongest');
const resultCorrect = document.getElementById('resultCorrect');

/* ── State ── */

const PHASE = {
  IDLE: 'idle',
  PLAYBACK: 'playback',
  INPUT: 'input',
  FEEDBACK: 'feedback',
  DONE: 'done',
};

let phase = PHASE.IDLE;
let spanLevel = INITIAL_SPAN;
let maxSpanAchieved = 0;
let trialIndex = 0;
let correctThisLevel = 0;
let totalCorrectTrials = 0;
let currentSequence = [];
let userSequence = [];
let blockElements = [];
let cancelled = false;

/* ── Delay Utility ── */

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ── Block Creation ── */

function createBlocks() {
  blocksContainer.innerHTML = '';
  blockElements = [];

  for (let i = 0; i < TOTAL_BLOCKS; i++) {
    const el = document.createElement('div');
    el.className = 'block disabled';
    el.dataset.index = i;
    el.style.left = BLOCK_POSITIONS[i].x + '%';
    el.style.top = BLOCK_POSITIONS[i].y + '%';
    el.addEventListener('click', () => handleBlockTap(i));
    blocksContainer.appendChild(el);
    blockElements.push(el);
  }
}

function setBlocksEnabled(enabled) {
  blockElements.forEach(el => {
    el.classList.toggle('disabled', !enabled);
  });
}

function resetBlockStyles() {
  blockElements.forEach(el => {
    el.classList.remove('active', 'correct-tap', 'error-tap');
  });
}

/* ── Status Banner ── */

function setStatus(text, cls) {
  statusMessage.textContent = text;
  statusMessage.className = cls || 'info';
}

/* ── HUD Update ── */

function updateHUD() {
  spanDisplay.textContent = String(spanLevel);
  maxSpanDisplay.textContent = String(maxSpanAchieved);
  trialDisplay.textContent = `${trialIndex + 1} / ${TRIALS_PER_LEVEL}`;
}

/* ── Sequence Generation ── */

function generateSequence(length) {
  const pool = [];
  for (let i = 0; i < TOTAL_BLOCKS; i++) pool.push(i);
  const seq = [];
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    seq.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return seq;
}

/* ── Playback Engine ── */

async function playSequence() {
  phase = PHASE.PLAYBACK;
  setBlocksEnabled(false);
  resetBlockStyles();
  setStatus('WATCH THE SEQUENCE...', 'watch');

  for (let i = 0; i < currentSequence.length; i++) {
    if (cancelled) return;
    const id = currentSequence[i];
    const el = blockElements[id];

    el.classList.add('active');
    await delay(HIGHLIGHT_MS);
    if (cancelled) return;
    el.classList.remove('active');

    if (i < currentSequence.length - 1) {
      await delay(GAP_MS);
      if (cancelled) return;
    }
  }

  if (cancelled) return;
  await delay(PRE_INPUT_BUFFER_MS);
  if (cancelled) return;

  phase = PHASE.INPUT;
  userSequence = [];
  setBlocksEnabled(true);
  setStatus('YOUR TURN — Tap the blocks in order', 'turn');
}

/* ── Block Tap Handler ── */

function handleBlockTap(id) {
  if (phase !== PHASE.INPUT) return;

  const el = blockElements[id];

  if (el.classList.contains('correct-tap') || el.classList.contains('error-tap')) {
    return;
  }

  const expectedIdx = userSequence.length;
  const expectedId = currentSequence[expectedIdx];

  if (id === expectedId) {
    el.classList.add('correct-tap');
    userSequence.push(id);

    if (userSequence.length === currentSequence.length) {
      onTrialCorrect();
    }
  } else {
    el.classList.add('error-tap');
    setBlocksEnabled(false);
    onTrialIncorrect();
  }
}

/* ── Trial Outcomes ── */

function onTrialCorrect() {
  phase = PHASE.FEEDBACK;
  totalCorrectTrials++;
  correctThisLevel++;

  setStatus('CORRECT!', 'correct');

  setTimeout(() => advanceAfterTrial(true), FEEDBACK_MS);
}

function onTrialIncorrect() {
  phase = PHASE.FEEDBACK;

  setStatus('INCORRECT', 'error');

  setTimeout(() => advanceAfterTrial(false), FEEDBACK_MS);
}

/* ── Trial / Level Advancement ── */

function advanceAfterTrial(correct) {
  if (cancelled) return;

  trialIndex++;

  if (trialIndex < TRIALS_PER_LEVEL) {
    updateHUD();
    startNextTrial();
    return;
  }

  if (correctThisLevel > 0) {
    spanLevel++;
    maxSpanAchieved = Math.max(maxSpanAchieved, spanLevel - 1);
    trialIndex = 0;
    correctThisLevel = 0;
    updateHUD();

    if (spanLevel > TOTAL_BLOCKS) {
      finishTest();
    } else {
      startNextTrial();
    }
  } else {
    finishTest();
  }
}

/* ── Trial Runner ── */

function startNextTrial() {
  if (cancelled) return;
  currentSequence = generateSequence(spanLevel);
  userSequence = [];
  resetBlockStyles();
  playSequence();
}

/* ── Test Lifecycle ── */

function startTest() {
  if (phase === PHASE.PLAYBACK || phase === PHASE.INPUT) return;

  cancelled = false;
  spanLevel = INITIAL_SPAN;
  maxSpanAchieved = 0;
  trialIndex = 0;
  correctThisLevel = 0;
  totalCorrectTrials = 0;
  currentSequence = [];
  userSequence = [];

  resultsOverlay.classList.add('hidden');
  startBtn.disabled = true;
  startBtn.textContent = 'RUNNING...';

  updateHUD();
  resetBlockStyles();
  setBlocksEnabled(false);

  startNextTrial();
}

function cancelTest() {
  cancelled = true;
  phase = PHASE.IDLE;
  setBlocksEnabled(false);
  resetBlockStyles();
  startBtn.disabled = false;
  startBtn.textContent = 'START TEST';
}

function finishTest() {
  phase = PHASE.DONE;
  setBlocksEnabled(false);
  setStatus('TEST COMPLETE', 'done');
  startBtn.disabled = false;
  startBtn.textContent = 'START TEST';

  showResults();
}

/* ── Results ── */

function showResults() {
  const finalSpan = Math.max(spanLevel - 1, 0);
  const longestSeq = currentSequence.length > 0 ? currentSequence.length : 0;

  resultSpan.textContent = String(finalSpan);
  resultLongest.textContent = String(longestSeq);
  resultCorrect.textContent = String(totalCorrectTrials);

  resultsOverlay.classList.remove('hidden');
}

/* ── Reset ── */

function fullReset() {
  cancelTest();
  resultsOverlay.classList.add('hidden');
  spanLevel = INITIAL_SPAN;
  maxSpanAchieved = 0;
  trialIndex = 0;
  correctThisLevel = 0;
  totalCorrectTrials = 0;
  currentSequence = [];
  userSequence = [];
  updateHUD();
  resetBlockStyles();
  setBlocksEnabled(false);
  setStatus('PRESS START TO BEGIN', 'info');
  startBtn.disabled = false;
  startBtn.textContent = 'START TEST';
}

/* ── Event Wiring ── */

startBtn.addEventListener('click', startTest);
restartBtn.addEventListener('click', fullReset);

/* ── Boot ── */

createBlocks();
fullReset();
