/**
 * Aero Decrypter - Number Guessing Game Logic
 * Self-contained JS module employing Web Audio API soft chimes,
 * organic background bubble injectors, keypads, and local storage progress tracking.
 */

// --- Difficulty Levels Settings Map ---
const LEVEL_CONFIGS = {
  easy: { min: 1, max: 50, attempts: 8 },
  medium: { min: 1, max: 100, attempts: 6 },
  hard: { min: 1, max: 200, attempts: 5 }
};

// --- Game State Object ---
const state = {
  isPlaying: false,
  difficulty: 'medium',
  secretCode: 0,
  attemptsLeft: 0,
  totalAttemptsAllowed: 0,
  guessesList: [],
  isMuted: true, // Default muted to comply with browser gesture flags
  bestRecords: {
    easy: null,
    medium: null,
    hard: null
  }
};

// --- DOM Cache Elements ---
const bubbleContainer = document.getElementById('bubble-container');
const appWindow = document.getElementById('app-window');
const rangeDisplay = document.getElementById('range-display');
const attemptsDisplay = document.getElementById('attempts-display');
const ringFill = document.getElementById('ring-fill');
const highscoreDisplay = document.getElementById('highscore-display');
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const restartBtn = document.getElementById('restart-btn');
const keypad = document.querySelector('.keypad-panel');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const historyCounter = document.getElementById('history-counter');
const soundToggle = document.getElementById('sound-toggle');
const soundIconOn = document.getElementById('sound-icon-on');
const soundIconOff = document.getElementById('sound-icon-off');
const closeBtn = document.getElementById('close-btn');

// Difficulty Toggles
const diffInputs = document.querySelectorAll('input[name="difficulty"]');

// Modals
const successModal = document.getElementById('success-modal');
const successCode = document.getElementById('success-code');
const successAttempts = document.getElementById('success-attempts');
const highscoreBanner = document.getElementById('highscore-banner');
const modalSuccessBtn = document.getElementById('modal-success-btn');

const failureModal = document.getElementById('failure-modal');
const failureCode = document.getElementById('failure-code');
const failureLevel = document.getElementById('failure-level');
const modalFailureBtn = document.getElementById('modal-failure-btn');

// --- Web Audio API Synth Engine ---
class AudioChimeSynth {
  constructor() {
    this.ctx = null;
  }

  // Lazy initializer to bypass browser blockades
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type) {
    if (state.isMuted) return;
    this.init();
    
    const now = this.ctx.currentTime;
    
    switch (type) {
      case 'click': {
        // Soft bubble pop keypress sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
        
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      
      case 'high': {
        // High clue chime: descending soft dual-bell
        const notes = [659.25, 523.25]; // E5, C5
        let timeOffset = 0;
        
        notes.forEach(f => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + timeOffset);
          
          gain.gain.setValueAtTime(0.08, now + timeOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.12);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.start(now + timeOffset);
          osc.stop(now + timeOffset + 0.12);
          timeOffset += 0.07;
        });
        break;
      }
      
      case 'low': {
        // Low clue chime: ascending soft dual-bell
        const notes = [392.00, 493.88]; // G4, B4
        let timeOffset = 0;
        
        notes.forEach(f => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + timeOffset);
          
          gain.gain.setValueAtTime(0.08, now + timeOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.12);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.start(now + timeOffset);
          osc.stop(now + timeOffset + 0.12);
          timeOffset += 0.07;
        });
        break;
      }
      
      case 'tick': {
        // Low firewall alert chime
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      
      case 'success': {
        // Classic Vista logon arpeggio chime (E maj / A maj chords)
        const arpeggio = [
          { f: 329.63, delay: 0 },    // E4
          { f: 440.00, delay: 0.08 }, // A4
          { f: 554.37, delay: 0.16 }, // C#5
          { f: 659.25, delay: 0.24 }, // E5
          { f: 880.00, delay: 0.32 }  // A5
        ];
        
        arpeggio.forEach(note => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.f, now + note.delay);
          
          // Smooth long release
          gain.gain.setValueAtTime(0.12, now + note.delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + 0.65);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.start(now + note.delay);
          osc.stop(now + note.delay + 0.7);
        });
        break;
      }
      
      case 'failure': {
        // Classic Vista shutdown chime (descending minor arpeggio)
        const arpeggio = [
          { f: 392.00, delay: 0 },    // G4
          { f: 349.23, delay: 0.09 }, // F4
          { f: 311.13, delay: 0.18 }, // Eb4
          { f: 233.08, delay: 0.32 }  // Bb3
        ];
        
        arpeggio.forEach(note => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.f, now + note.delay);
          
          gain.gain.setValueAtTime(0.12, now + note.delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + 0.65);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.start(now + note.delay);
          osc.stop(now + note.delay + 0.7);
        });
        break;
      }
    }
  }
}

const sound = new AudioChimeSynth();

// --- Bubble Background Spawner ---
function spawnBubble() {
  if (document.hidden) return; // Save resources when tab is idle
  
  // Limit concurrent bubbles to preserve engine performance
  const currentBubbles = bubbleContainer.querySelectorAll('.bubble-particle');
  if (currentBubbles.length >= 15) return;

  const bubble = document.createElement('div');
  bubble.className = 'bubble-particle';

  // Randomize sizing
  const size = 12 + Math.random() * 38;
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;

  // Randomize lateral positions
  const leftPos = Math.random() * 95;
  bubble.style.left = `${leftPos}%`;

  // Randomize float speeds
  const duration = 10 + Math.random() * 10;
  bubble.style.animationDuration = `${duration}s`;

  bubbleContainer.appendChild(bubble);

  // Safely dispose of nodes
  bubble.addEventListener('animationend', () => {
    bubble.remove();
  });
}

// Kick off bubble generation loop
setInterval(spawnBubble, 1200);

// --- Local Storage Management ---
function loadHighScoreState() {
  const savedScores = localStorage.getItem('aero_decrypt_scores');
  if (savedScores !== null) {
    try {
      state.bestRecords = JSON.parse(savedScores);
    } catch {
      state.bestRecords = { easy: null, medium: null, hard: null };
    }
  }
  
  const savedMute = localStorage.getItem('aero_decrypt_muted');
  if (savedMute !== null) {
    state.isMuted = (savedMute === 'true');
    applyMuteState();
  }
  
  updateHighScoreDisplay();
}

function persistHighScore(difficulty, attemptsUsed) {
  const currentBest = state.bestRecords[difficulty];
  
  // Record matches fewer attempts used to win
  if (currentBest === null || attemptsUsed < currentBest) {
    state.bestRecords[difficulty] = attemptsUsed;
    localStorage.setItem('aero_decrypt_scores', JSON.stringify(state.bestRecords));
    updateHighScoreDisplay();
    return true; // Flag record beaten
  }
  return false;
}

function updateHighScoreDisplay() {
  const currentBest = state.bestRecords[state.difficulty];
  if (currentBest !== null) {
    highscoreDisplay.textContent = `${currentBest} ${currentBest === 1 ? 'attempt' : 'attempts'}`;
  } else {
    highscoreDisplay.textContent = '—';
  }
}

function applyMuteState() {
  if (state.isMuted) {
    soundIconOn.classList.add('hidden');
    soundIconOff.classList.remove('hidden');
  } else {
    soundIconOn.classList.remove('hidden');
    soundIconOff.classList.add('hidden');
  }
  localStorage.setItem('aero_decrypt_muted', state.isMuted);
}

// --- Gameplay Mechanics ---

// Initialize a new round
function initGame() {
  state.isPlaying = true;
  state.guessesList = [];
  
  const config = LEVEL_CONFIGS[state.difficulty];
  state.attemptsLeft = config.attempts;
  state.totalAttemptsAllowed = config.attempts;
  
  // Generate random target code
  state.secretCode = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
  
  // Clear input
  guessInput.value = '';
  guessInput.min = config.min;
  guessInput.max = config.max;
  guessInput.placeholder = `Enter number (${config.min}-${config.max})...`;
  
  // Clear log visual elements
  historyList.replaceChildren();
  historyEmpty.classList.remove('hidden');
  historyList.appendChild(historyEmpty);
  
  // Reset visual dashboard
  rangeDisplay.textContent = `${config.min} - ${config.max}`;
  updateStatsDashboard();
  updateHighScoreDisplay();
  
  // Unlock difficulty inputs
  diffInputs.forEach(input => input.disabled = false);
  
  // Clear error banners
  clearErrorBanner();
}

// Update counters and gauges
function updateStatsDashboard() {
  attemptsDisplay.textContent = state.attemptsLeft;
  historyCounter.textContent = `(${state.guessesList.length} ${state.guessesList.length === 1 ? 'guess' : 'guesses'})`;
  
  // Compute circle progress
  const percent = (state.attemptsLeft / state.totalAttemptsAllowed) * 100;
  ringFill.style.strokeDasharray = `${percent}, 100`;
  
  // Transition gauge colors based on remaining volume
  if (state.attemptsLeft <= 2) {
    ringFill.style.stroke = 'var(--aero-red)';
  } else if (state.attemptsLeft <= Math.ceil(state.totalAttemptsAllowed / 2)) {
    ringFill.style.stroke = 'var(--aero-gold)';
  } else {
    ringFill.style.stroke = 'var(--aero-grass-green)';
  }
}

// Visual error display handling
function displayError(message) {
  clearErrorBanner();
  
  const banner = document.createElement('div');
  banner.className = 'error-banner';
  banner.textContent = message;
  
  // Insert directly above control inputs
  guessInput.parentNode.parentNode.insertBefore(banner, guessInput.parentNode);
  
  // Shake window to draw user attention
  appWindow.classList.add('shake');
  setTimeout(() => appWindow.classList.remove('shake'), 200);
}

function clearErrorBanner() {
  const existing = document.querySelector('.error-banner');
  if (existing) existing.remove();
}

// Victory handler
function handleVictory() {
  state.isPlaying = false;
  
  // Disable changes
  diffInputs.forEach(input => input.disabled = true);
  
  // Calculate attempts used
  const attemptsUsed = state.totalAttemptsAllowed - state.attemptsLeft + 1;
  const isNewRecord = persistHighScore(state.difficulty, attemptsUsed);
  
  // Show Modal details
  successCode.textContent = state.secretCode;
  successAttempts.textContent = `${attemptsUsed} / ${state.totalAttemptsAllowed}`;
  
  if (isNewRecord) {
    highscoreBanner.classList.remove('hidden');
  } else {
    highscoreBanner.classList.add('hidden');
  }
  
  successModal.classList.remove('hidden');
  sound.play('success');
  
  // Spawn binary particles overlay
  triggerVictoryParticles();
}

// Defeat handler
function handleDefeat() {
  state.isPlaying = false;
  diffInputs.forEach(input => input.disabled = true);
  
  failureCode.textContent = state.secretCode;
  failureLevel.textContent = state.difficulty.toUpperCase();
  
  failureModal.classList.remove('hidden');
  sound.play('failure');
}

// Visual victory particles (falling binary streams)
function triggerVictoryParticles() {
  const streamCount = 20;
  for (let i = 0; i < streamCount; i++) {
    setTimeout(() => {
      const bit = document.createElement('div');
      bit.className = 'binary-particle';
      bit.textContent = Math.random() > 0.5 ? '1' : '0';
      
      // Position randomly inside success modal scope
      const modalRect = successModal.getBoundingClientRect();
      const x = Math.random() * modalRect.width;
      const y = Math.random() * (modalRect.height * 0.4);
      
      bit.style.left = `${x}px`;
      bit.style.top = `${y}px`;
      
      // Vertical drop vector
      const dy = 80 + Math.random() * 120;
      bit.style.setProperty('--dy', `${dy}px`);
      
      successModal.appendChild(bit);
      
      setTimeout(() => bit.remove(), 1500);
    }, i * 75);
  }
}

// Append clues in history list
function logGuessClue(guess, type, message) {
  // Prune empty state template
  if (historyList.contains(historyEmpty)) {
    historyEmpty.classList.add('hidden');
    historyEmpty.remove();
  }
  
  const card = document.createElement('div');
  card.className = `clue-card ${type}`;
  
  const icon = type === 'too-high' ? '↓' : type === 'too-low' ? '↑' : '✓';
  
  card.innerHTML = `
    <span class="clue-guess">Guess #${state.guessesList.length}: ${guess}</span>
    <span class="clue-message">
      <span class="clue-icon">${icon}</span>
      ${message}
    </span>
  `;
  
  historyList.prepend(card); // Prepend to show latest guesses on top
}

// Process submitted guess
function processGuess() {
  if (!state.isPlaying) return;
  
  const rawValue = guessInput.value.trim();
  const config = LEVEL_CONFIGS[state.difficulty];
  
  // 1. Validation Checks
  if (rawValue === '') {
    displayError('Input field cannot be empty. Enter a guess!');
    sound.play('click');
    return;
  }
  
  const guess = parseInt(rawValue, 10);
  if (isNaN(guess)) {
    displayError('Invalid characters detected. Please enter numeric digits.');
    return;
  }
  
  if (guess < config.min || guess > config.max) {
    displayError(`Guess out of range! Enter a number between ${config.min} and ${config.max}.`);
    return;
  }
  
  if (state.guessesList.includes(guess)) {
    displayError(`You have already guessed ${guess}! Try a different number.`);
    return;
  }
  
  // Input validated, clear any error banner
  clearErrorBanner();
  
  // Register Guess
  state.guessesList.push(guess);
  
  // 2. Evaluation
  if (guess === state.secretCode) {
    logGuessClue(guess, 'correct', 'Correct Code!');
    updateStatsDashboard();
    handleVictory();
  } else {
    // Subtract firewall attempt
    state.attemptsLeft--;
    
    if (guess > state.secretCode) {
      logGuessClue(guess, 'too-high', 'Too High!');
      sound.play('high');
    } else {
      logGuessClue(guess, 'too-low', 'Too Low!');
      sound.play('low');
    }
    
    updateStatsDashboard();
    
    // Check game over
    if (state.attemptsLeft <= 0) {
      handleDefeat();
    } else if (state.attemptsLeft <= 2) {
      sound.play('tick');
    }
  }
  
  // Focus and clear input ready for next guess
  guessInput.value = '';
  guessInput.focus();
}

// --- Keypad Digit Trigger Callbacks ---
function handleKeypadPress(val) {
  sound.play('click');
  clearErrorBanner();
  
  const currentVal = guessInput.value;
  if (currentVal.length < 4) {
    guessInput.value = currentVal + val;
  }
}

function handleKeypadClear() {
  sound.play('click');
  guessInput.value = '';
}

function handleKeypadBackspace() {
  sound.play('click');
  const currentVal = guessInput.value;
  if (currentVal.length > 0) {
    guessInput.value = currentVal.substring(0, currentVal.length - 1);
  }
}

// --- Event Listeners Subscriptions ---

// Submit Guess trigger
guessBtn.addEventListener('click', processGuess);
guessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    processGuess();
  }
});

// Control Buttons Action
restartBtn.addEventListener('click', () => {
  sound.play('click');
  initGame();
});

// Segmented level control
diffInputs.forEach(input => {
  input.addEventListener('change', (e) => {
    state.difficulty = e.target.value;
    sound.play('click');
    initGame();
  });
});

// Audio Toggle Button
soundToggle.addEventListener('click', () => {
  state.isMuted = !state.isMuted;
  applyMuteState();
  
  if (!state.isMuted) {
    sound.init();
    sound.play('click');
  }
});

// Windows titlebar close actions (Vista shutdown sound + Reset)
closeBtn.addEventListener('click', () => {
  sound.play('click');
  initGame();
});

// Keypad binding delegation
keypad.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  
  const val = btn.dataset.val;
  if (val !== undefined) {
    handleKeypadPress(val);
  } else if (btn.id === 'key-clear') {
    handleKeypadClear();
  } else if (btn.id === 'key-back') {
    handleKeypadBackspace();
  }
});

// Modal Retry Triggers
modalSuccessBtn.addEventListener('click', () => {
  successModal.classList.add('hidden');
  initGame();
});

modalFailureBtn.addEventListener('click', () => {
  failureModal.classList.add('hidden');
  initGame();
});

// Close modal clicking outside
[successModal, failureModal].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
});

// Page bootstrap
loadHighScoreState();
initGame();
