// ============================================================
//  SWATCH MEMORY MASTER — Core Engine
//  Async state machine, 3D card matching, hue perception timer
// ============================================================

// ─── COLOR PAIRS ────────────────────────────────────────────

const COLOR_POOL = [
  // Ocean Teal proximities
  { pair: 0, hex: '#14b8a6' },
  { pair: 0, hex: '#0d9488' },
  // Rose Pink proximities
  { pair: 1, hex: '#f43f5e' },
  { pair: 1, hex: '#e11d48' },
  // Amber proximities
  { pair: 2, hex: '#f59e0b' },
  { pair: 2, hex: '#d97706' },
  // Violet proximities
  { pair: 3, hex: '#a855f7' },
  { pair: 3, hex: '#9333ea' },
  // Cyan proximities
  { pair: 4, hex: '#06b6d4' },
  { pair: 4, hex: '#0891b2' },
  // Emerald proximities
  { pair: 5, hex: '#10b981' },
  { pair: 5, hex: '#059669' },
];

// ─── STATE ──────────────────────────────────────────────────

const state = {
  cards: [],
  flipped: [],
  matched: 0,
  totalPairs: 6,
  mistakes: 0,
  totalClicks: 0,
  isInputLocked: false,
  phase: 'idle', // 'idle' | 'memorize' | 'play' | 'victory'
};

// ─── DOM REFS ───────────────────────────────────────────────

const cardGrid = document.getElementById('card-grid');
const telemPairs = document.getElementById('telem-pairs');
const telemAccuracy = document.getElementById('telem-accuracy');
const telemMistakes = document.getElementById('telem-mistakes');
const diagStatus = document.getElementById('diag-status');
const btnInit = document.getElementById('btn-init');
const timerDisplay = document.getElementById('timer-display');

// ─── FISHER-YATES SHUFFLE ──────────────────────────────────

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── SET DIAGNOSTIC ────────────────────────────────────────

function setDiagnostic(msg, cls) {
  diagStatus.textContent = msg;
  diagStatus.className = 'diag-status ' + cls;
}

// ─── UPDATE TELEMETRY ──────────────────────────────────────

function updateTelemetry() {
  telemPairs.textContent = state.matched + ' / ' + state.totalPairs + ' FOUND';
  telemMistakes.textContent = state.mistakes;

  const accuracy = state.totalClicks > 0
    ? Math.round((state.matched * 2 / state.totalClicks) * 100)
    : 100;
  telemAccuracy.textContent = accuracy + '%';
}

// ─── BUILD GRID ─────────────────────────────────────────────

function buildGrid() {
  cardGrid.innerHTML = '';
  cardGrid.classList.remove('victory-glow');

  state.cards = [];
  state.flipped = [];
  state.matched = 0;
  state.mistakes = 0;
  state.totalClicks = 0;
  state.isInputLocked = true;
  state.phase = 'idle';
  btnInit.disabled = true;

  // Shuffle the color pool
  const shuffled = shuffle([...COLOR_POOL]);

  for (let i = 0; i < shuffled.length; i++) {
    const color = shuffled[i];
    state.cards.push({
      index: i,
      pair: color.pair,
      hex: color.hex,
      flipped: false,
      matched: false,
    });

    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">
          <div class="card-back-pattern"></div>
        </div>
        <div class="card-face card-front" style="background:${color.hex}"></div>
      </div>
    `;

    card.addEventListener('click', () => onCardClick(i));
    cardGrid.appendChild(card);
  }

  updateTelemetry();
}

// ─── ASYNC PREVIEW SEQUENCE ────────────────────────────────

async function startPreview() {
  state.phase = 'memorize';
  setDiagnostic('MEMORIZE SWATCH MATRIX (1.0s)', 'memorize');
  timerDisplay.textContent = 'PREVIEW';

  // Flip all cards face-up
  const cards = cardGrid.querySelectorAll('.card');
  cards.forEach(c => c.classList.add('flipped'));

  // Wait exactly 1000ms
  await new Promise(r => setTimeout(r, 1000));

  // Flip all cards face-down
  cards.forEach(c => c.classList.remove('flipped'));

  // Unlock input for play
  state.isInputLocked = false;
  state.phase = 'play';
  setDiagnostic('MATRIX UNLOCKED — CHOOSE PAIR', 'play');
  timerDisplay.textContent = 'PLAY';
  btnInit.disabled = false;
  btnInit.textContent = 'RESTART MEMORY MATRIX';
}

// ─── CARD CLICK HANDLER ─────────────────────────────────────

function onCardClick(index) {
  if (state.isInputLocked) return;
  if (state.phase !== 'play') return;

  const cardState = state.cards[index];
  if (cardState.matched) return;
  if (cardState.flipped) return;

  // Flip the card
  cardState.flipped = true;
  const el = cardGrid.children[index];
  el.classList.add('flipped');

  state.flipped.push(index);
  state.totalClicks++;

  if (state.flipped.length === 2) {
    // Two cards selected — lock input and check
    state.isInputLocked = true;
    checkMatch();
  }

  updateTelemetry();
}

// ─── MATCH CHECK ────────────────────────────────────────────

function checkMatch() {
  const i1 = state.flipped[0];
  const i2 = state.flipped[1];
  const c1 = state.cards[i1];
  const c2 = state.cards[i2];
  const el1 = cardGrid.children[i1];
  const el2 = cardGrid.children[i2];

  if (c1.pair === c2.pair) {
    // Match found
    c1.matched = true;
    c2.matched = true;
    state.matched++;

    el1.classList.add('matched');
    el2.classList.add('matched');

    state.flipped = [];
    state.isInputLocked = false;
    updateTelemetry();

    if (state.matched === state.totalPairs) {
      state.phase = 'victory';
      cardGrid.classList.add('victory-glow');
      setDiagnostic('VICTORY — ALL PAIRS IDENTIFIED', 'victory');
      timerDisplay.textContent = 'COMPLETE';
    }
  } else {
    // Mismatch
    state.mistakes++;
    setDiagnostic('CRITICAL MISMATCH DETECTED', 'mismatch');
    updateTelemetry();

    el1.classList.add('shake');
    el2.classList.add('shake');

    // Wait 800ms for brain to process hue deviation, then flip back
    setTimeout(() => {
      const cs1 = state.cards[i1];
      const cs2 = state.cards[i2];
      cs1.flipped = false;
      cs2.flipped = false;

      el1.classList.remove('flipped', 'shake');
      el2.classList.remove('flipped', 'shake');

      state.flipped = [];
      state.isInputLocked = false;

      if (state.phase === 'play') {
        setDiagnostic('MATRIX UNLOCKED — CHOOSE PAIR', 'play');
      }
    }, 800);
  }
}

// ─── INIT BUTTON ────────────────────────────────────────────

btnInit.addEventListener('click', () => {
  btnInit.disabled = true;
  btnInit.textContent = 'INITIALIZING...';
  buildGrid();
  // Small delay for DOM paint, then start preview
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      startPreview();
    });
  });
});

// ─── INIT ───────────────────────────────────────────────────

function init() {
  buildGrid();
}

init();
