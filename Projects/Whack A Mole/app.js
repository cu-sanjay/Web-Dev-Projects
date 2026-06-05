/**
 * Cyber Whack-A-Mole Game Logic
 * Fully self-contained vanilla JS engine utilizing Web Audio API for retro SFX,
 * LocalStorage for state persistence, and DOM injection for particle/point animations.
 */

// --- Difficulty Parameters Configuration ---
const DIFFICULTY_SETTINGS = {
  easy: {
    spawnInterval: 1300,   // ms between mole pops
    activeDuration: 1100,  // ms mole remains up
  },
  medium: {
    spawnInterval: 950,
    activeDuration: 800,
  },
  hard: {
    spawnInterval: 650,
    activeDuration: 550,
  }
};

// --- Game State Object ---
const state = {
  score: 0,
  highScore: 0,
  timeLeft: 30, // 30-second rounds
  isPlaying: false,
  difficulty: 'medium',
  isMuted: true, // Default muted due to browser gesture requirements
  activeHole: null,
};

// --- DOM Cache Elements ---
const gameGrid = document.getElementById('game-grid');
const holes = document.querySelectorAll('.hole');
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const timerProgress = document.getElementById('timer-progress');
const highScoreDisplay = document.getElementById('high-score-display');
const startBtn = document.getElementById('start-btn');
const soundToggle = document.getElementById('sound-toggle');
const soundIconOn = document.getElementById('sound-icon-on');
const soundIconOff = document.getElementById('sound-icon-off');
const gameOverModal = document.getElementById('game-over-modal');
const finalScore = document.getElementById('final-score');
const finalLevel = document.getElementById('final-level');
const highScoreBanner = document.getElementById('high-score-banner');
const restartBtn = document.getElementById('restart-btn');
const cabinetContainer = document.querySelector('.arcade-container');
const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');

// --- Retimer Identifiers ---
let gameTimerInterval = null;
let moleSpawnTimeout = null;
let moleRetractTimeout = null;

// --- Sound Effects Synthesizer using Web Audio API ---
class WebAudioSynth {
  constructor() {
    this.ctx = null;
  }

  // Lazy initializer to bypass browser gesture blockade
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(effectType) {
    if (state.isMuted) return;
    this.init();
    
    const now = this.ctx.currentTime;
    
    switch (effectType) {
      case 'pop': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(550, now + 0.12);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      
      case 'whack': {
        // Neon zap + mechanical hit drop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
        
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      
      case 'miss': {
        // Comical sad buzz
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.22);
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }
      
      case 'tick': {
        // High mechanical click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1300, now);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      
      case 'gameover': {
        // Celebratory victory sweep (synthesized melody)
        const notes = [
          { freq: 261.63, dur: 0.12 }, // C4
          { freq: 329.63, dur: 0.12 }, // E4
          { freq: 392.00, dur: 0.12 }, // G4
          { freq: 523.25, dur: 0.12 }, // C5
          { freq: 659.25, dur: 0.12 }, // E5
          { freq: 783.99, dur: 0.35 }  // G5
        ];
        
        let startOffset = 0;
        notes.forEach(note => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.freq, now + startOffset);
          
          gain.gain.setValueAtTime(0.15, now + startOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + note.dur - 0.01);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.start(now + startOffset);
          osc.stop(now + startOffset + note.dur);
          
          startOffset += note.dur;
        });
        break;
      }
    }
  }
}

const sound = new WebAudioSynth();

// --- Local Storage Management ---
function loadPersistedState() {
  const savedHighScore = localStorage.getItem('cyber_whack_highscore');
  if (savedHighScore !== null) {
    state.highScore = parseInt(savedHighScore, 10);
    highScoreDisplay.textContent = state.highScore;
  }
  
  const savedMuteState = localStorage.getItem('cyber_whack_muted');
  if (savedMuteState !== null) {
    state.isMuted = (savedMuteState === 'true');
    applyMuteState();
  }
}

function persistHighScore(newScore) {
  if (newScore > state.highScore) {
    state.highScore = newScore;
    localStorage.setItem('cyber_whack_highscore', newScore);
    highScoreDisplay.textContent = newScore;
    return true; // Flag indicating a beat record
  }
  return false;
}

function applyMuteState() {
  if (state.isMuted) {
    soundIconOn.classList.add('hidden');
    soundIconOff.classList.remove('hidden');
  } else {
    soundIconOn.classList.remove('hidden');
    soundIconOff.classList.add('hidden');
  }
  localStorage.setItem('cyber_whack_muted', state.isMuted);
}

// --- Gameplay Mechanisms ---

// Pick a random hole, checking that it's different from the last one
function getRandomHole() {
  const index = Math.floor(Math.random() * holes.length);
  const selectedHole = holes[index];
  
  if (selectedHole === state.activeHole) {
    return getRandomHole();
  }
  state.activeHole = selectedHole;
  return selectedHole;
}

// Main game loop: Spawning moles
function spawnMole() {
  if (!state.isPlaying) return;
  
  // Clean up any remaining active class on holes
  holes.forEach(hole => hole.classList.remove('active'));
  
  const activeHole = getRandomHole();
  activeHole.classList.add('active');
  
  const mole = activeHole.querySelector('.mole');
  mole.classList.remove('whacked');
  mole.dataset.whacked = 'false';
  
  sound.play('pop');
  
  const settings = DIFFICULTY_SETTINGS[state.difficulty];
  
  // Set timers to automatically slide mole down if not whacked
  moleRetractTimeout = setTimeout(() => {
    activeHole.classList.remove('active');
    
    // Spawn next mole after a brief pause
    if (state.isPlaying) {
      moleSpawnTimeout = setTimeout(spawnMole, settings.spawnInterval);
    }
  }, settings.activeDuration);
}

// Update score card
function updateScore(pulse = false) {
  scoreDisplay.textContent = state.score;
  if (pulse) {
    scoreDisplay.classList.add('pulse-up');
    setTimeout(() => scoreDisplay.classList.remove('pulse-up'), 100);
  }
}

// Update timer displays and progress gauges
function updateTimer() {
  timerDisplay.textContent = `${state.timeLeft}s`;
  const percentage = (state.timeLeft / 30) * 100;
  timerProgress.style.width = `${percentage}%`;
  
  // Pulse timers red on last 5 seconds
  if (state.timeLeft <= 5) {
    timerDisplay.classList.add('text-cyber-pink');
    sound.play('tick');
  } else {
    timerDisplay.classList.remove('text-cyber-pink');
  }
}

// Core Game Initialization
function startGame() {
  if (state.isPlaying) {
    // Treat as a Reset button trigger
    endGame(false);
    return;
  }
  
  // Sound activation bootstrap on user action
  sound.init();
  
  state.isPlaying = true;
  state.score = 0;
  state.timeLeft = 30;
  
  updateScore();
  updateTimer();
  
  // Lock difficulty toggles
  difficultyInputs.forEach(input => input.disabled = true);
  
  startBtn.textContent = 'RESET';
  startBtn.classList.remove('glow-pink');
  startBtn.classList.add('glow-cyan');
  
  // Start countdown clock
  gameTimerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimer();
    
    if (state.timeLeft <= 0) {
      endGame(true);
    }
  }, 1000);
  
  // Kick off mole spawn engine
  spawnMole();
}

// Core Game Termination
function endGame(showScoreboard = true) {
  state.isPlaying = false;
  
  // Clean timers
  clearInterval(gameTimerInterval);
  clearTimeout(moleSpawnTimeout);
  clearTimeout(moleRetractTimeout);
  
  // Clean grid components
  holes.forEach(hole => {
    hole.classList.remove('active');
    const mole = hole.querySelector('.mole');
    mole.classList.remove('whacked');
  });
  
  // Unlock difficulty toggles
  difficultyInputs.forEach(input => input.disabled = false);
  
  startBtn.textContent = 'START GAME';
  startBtn.classList.remove('glow-cyan');
  startBtn.classList.add('glow-pink');
  
  if (showScoreboard) {
    // Save state
    const isNewRecord = persistHighScore(state.score);
    
    // Display Modal
    finalScore.textContent = state.score;
    finalLevel.textContent = state.difficulty.toUpperCase();
    
    if (isNewRecord) {
      highScoreBanner.classList.remove('hidden');
    } else {
      highScoreBanner.classList.add('hidden');
    }
    
    gameOverModal.classList.remove('hidden');
    sound.play('gameover');
  }
}

// Dynamic particle sparks trigger
function createParticles(x, y) {
  const particleCount = 12;
  for (let i = 0; i < particleCount; i++) {
    const spark = document.createElement('div');
    const isPink = Math.random() > 0.5;
    spark.className = `spark ${isPink ? 'pink' : ''}`;
    
    // Position directly at clicked point
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    
    // Compute dynamic angular projection vectors
    const angle = Math.random() * Math.PI * 2;
    const distance = 25 + Math.random() * 60;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    spark.style.setProperty('--dx', `${dx}px`);
    spark.style.setProperty('--dy', `${dy}px`);
    
    gameGrid.appendChild(spark);
    
    // Auto-prune nodes
    setTimeout(() => spark.remove(), 500);
  }
}

// Dynamic floating text indicator (+100 or -25)
function createFloatingLabel(x, y, text, isPositive = true) {
  const floater = document.createElement('span');
  floater.className = 'floating-score';
  
  if (!isPositive) {
    floater.style.color = 'var(--cyber-pink)';
    floater.style.textShadow = '0 0 6px var(--cyber-pink)';
  }
  
  floater.textContent = text;
  floater.style.left = `${x}px`;
  floater.style.top = `${y}px`;
  
  gameGrid.appendChild(floater);
  
  // Auto-prune nodes
  setTimeout(() => floater.remove(), 800);
}

// Interactive screen shake
function triggerScreenShake() {
  cabinetContainer.classList.add('shake');
  setTimeout(() => cabinetContainer.classList.remove('shake'), 180);
}

// Whack handler callback
function handleWhack(e, mole, hole) {
  mole.dataset.whacked = 'true';
  mole.classList.add('whacked');
  
  // Fetch click coordinates relative to the playing field
  const rect = gameGrid.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  // Trigger animations & zaps
  createParticles(clickX, clickY);
  createFloatingLabel(clickX, clickY, '+100', true);
  triggerScreenShake();
  sound.play('whack');
  
  // Calculate gains
  state.score += 100;
  updateScore(true);
  
  // Cancel retract timeout
  clearTimeout(moleRetractTimeout);
  
  // Drop mole back down after a tiny pause to see the X-eyes
  setTimeout(() => {
    hole.classList.remove('active');
    
    // Schedule next spawn faster than usual for flow responsiveness
    if (state.isPlaying) {
      const settings = DIFFICULTY_SETTINGS[state.difficulty];
      moleSpawnTimeout = setTimeout(spawnMole, settings.spawnInterval * 0.4);
    }
  }, 120);
}

// Miss whack handler
function handleMiss(e) {
  // Check if click was inside grid but missed active moles
  const rect = gameGrid.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  createFloatingLabel(clickX, clickY, '-25', false);
  sound.play('miss');
  
  state.score = Math.max(0, state.score - 25);
  updateScore(true);
}

// --- Event Handlers & Subscriptions ---

// Play field event delegation to prevent lag or target delays
gameGrid.addEventListener('mousedown', (e) => {
  if (!state.isPlaying) return;
  
  // Check if target is mole
  const moleTarget = e.target.closest('.mole');
  if (moleTarget) {
    const holeTarget = moleTarget.closest('.hole');
    if (holeTarget.classList.contains('active') && moleTarget.dataset.whacked === 'false') {
      handleWhack(e, moleTarget, holeTarget);
      return;
    }
  }
  
  // Otherwise it's a miss click on background, rim, or dormant mole
  handleMiss(e);
});

// Segmented difficulty controls
difficultyInputs.forEach(input => {
  input.addEventListener('change', (e) => {
    state.difficulty = e.target.value;
  });
});

// Mute Toggle Control
soundToggle.addEventListener('click', () => {
  state.isMuted = !state.isMuted;
  applyMuteState();
  
  // Warm up sound contexts on activation click
  if (!state.isMuted) {
    sound.init();
    sound.play('tick');
  }
});

// Trigger Buttons
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
  gameOverModal.classList.add('hidden');
  startGame();
});

// Close Modal when clicking outside the dialog card
gameOverModal.addEventListener('click', (e) => {
  if (e.target === gameOverModal) {
    gameOverModal.classList.add('hidden');
  }
});

// Initialize persisted parameters on page load
loadPersistedState();
