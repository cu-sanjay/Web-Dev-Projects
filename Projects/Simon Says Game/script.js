/**
 * Arcade-Accurate High-Fidelity Simon Says Engine
 * Architecture: Real-time Synchronized Web Audio API / DOM State Machine
 */

const CONFIG = {
    frequencies: {
        green: 261.63,  // C4
        red: 293.66,    // D4
        yellow: 329.63, // E4
        blue: 349.23,   // F4
        error: 110.00   // Low Harsh Sawtooth Error Freq
    },
    playbackDuration: 600, // Ms color remains lit
    intervalGap: 300,      // Ms gap between sequence items
    nextRoundDelay: 1000   // Ms pause before automatic next sequence expansion
};

// Application State Tracking Engine
let state = {
    simonSequence: [],
    userSequence: [],
    score: 0,
    highScore: 0,
    isPlayingSequence: false,
    audioContext: null
};

// Core DOM Elements Cache Matrix
const DOM = {
    board: document.getElementById('game-board'),
    pads: {
        green: document.querySelector('.pad-green'),
        red: document.querySelector('.pad-red'),
        yellow: document.querySelector('.pad-yellow'),
        blue: document.querySelector('.pad-blue')
    },
    startButton: document.getElementById('start-btn'),
    roundDisplay: document.getElementById('round-display'),
    highScoreDisplay: document.getElementById('highscore-display'),
    statusPrompt: document.getElementById('status-prompt')
};

// Setup Engine Initializers
document.addEventListener('DOMContentLoaded', () => {
    loadHighScore();
    registerInputListeners();
});

function loadHighScore() {
    const savedScore = localStorage.getItem('simon_high_score');
    if (savedScore !== null) {
        state.highScore = parseInt(savedScore, 10);
        updateDisplayValue(DOM.highScoreDisplay, state.highScore);
    }
}

function registerInputListeners() {
    DOM.startButton.addEventListener('click', initSimulation);
    
    // Process interactive user touch/click responses
    Object.entries(DOM.pads).forEach(([color, element]) => {
        element.addEventListener('mousedown', () => handleUserSelection(color));
        element.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Defend against double trigger loops
            handleUserSelection(color);
        });
    });
}

function initAudio() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

/**
 * Game Flow Control Automations
 */
function initSimulation() {
    initAudio();
    state.simonSequence = [];
    state.score = 0;
    DOM.startButton.textContent = "RESET SIMULATION";
    updateDisplayValue(DOM.roundDisplay, state.score);
    advanceToNextRound();
}

function advanceToNextRound() {
    state.userSequence = [];
    state.score++;
    updateDisplayValue(DOM.roundDisplay, state.score);
    
    // Synthesize randomized vector target
    const choices = ['green', 'red', 'yellow', 'blue'];
    const randomColor = choices[Math.floor(Math.random() * choices.length)];
    state.simonSequence.push(randomColor);
    
    executePlaybackSequence();
}

async function executePlaybackSequence() {
    state.isPlayingSequence = true;
    toggleBoardLock(true);
    updateStatusPrompt("WATCH SIMON", "status-watch");

    // Add brief preparation padding before starting playback
    await delay(400);

    for (let i = 0; i < state.simonSequence.length; i++) {
        const targetColor = state.simonSequence[i];
        await flashPad(targetColor);
        await delay(CONFIG.intervalGap);
    }

    state.isPlayingSequence = false;
    toggleBoardLock(false);
    updateStatusPrompt("YOUR TURN", "status-user");
}

/**
 * Pad Visual and Synthesizer Execution Modules
 */
function flashPad(color) {
    return new Promise((resolve) => {
        const padElement = DOM.pads[color];
        const frequency = CONFIG.frequencies[color];
        
        // Assert visual excitation triggers
        padElement.classList.add('active');
        const audioStopFn = synthesizeTone(frequency, 'triangle', CONFIG.playbackDuration / 1000);

        setTimeout(() => {
            padElement.classList.remove('active');
            audioStopFn();
            resolve();
        }, CONFIG.playbackDuration);
    });
}

function synthesizeTone(frequency, type, durationSec) {
    if (!state.audioContext) return () => {};
    
    try {
        const osc = state.audioContext.createOscillator();
        const gainNode = state.audioContext.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, state.audioContext.currentTime);
        
        // Logarithmic volume envelope mapping to control pops and clips
        gainNode.gain.setValueAtTime(0.25, state.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, state.audioContext.currentTime + durationSec);
        
        osc.connect(gainNode);
        gainNode.connect(state.audioContext.destination);
        
        osc.start();
        osc.stop(state.audioContext.currentTime + durationSec);
        
        return () => {
            try { osc.stop(); } catch(e) {}
        };
    } catch (e) {
        console.error("Synthesizer Context Error Asset Override:", e);
        return () => {};
    }
}

/**
 * Interaction Validation Logic Machine
 */
function handleUserSelection(color) {
    if (state.isPlayingSequence) return;
    
    // Real-time flash execution triggered by human physical click
    const targetPad = DOM.pads[color];
    targetPad.classList.add('active');
    const stopAudio = synthesizeTone(CONFIG.frequencies[color], 'triangle', 0.4);
    
    setTimeout(() => {
        targetPad.classList.remove('active');
        stopAudio();
    }, 200);

    state.userSequence.push(color);
    verifyUserStep(state.userSequence.length - 1);
}

function verifyUserStep(currentIndex) {
    // Structural Validation Vector Analysis
    if (state.userSequence[currentIndex] !== state.simonSequence[currentIndex]) {
        executeFailureProtocol();
        return;
    }

    // Completion Pointer Intersection Analysis
    if (state.userSequence.length === state.simonSequence.length) {
        toggleBoardLock(true);
        if (state.score > state.highScore) {
            state.highScore = state.score;
            localStorage.setItem('simon_high_score', state.highScore);
            updateDisplayValue(DOM.highScoreDisplay, state.highScore);
        }
        setTimeout(advanceToNextRound, CONFIG.nextRoundDelay);
    }
}

function executeFailureProtocol() {
    toggleBoardLock(true);
    updateStatusPrompt("GAME OVER", "status-error");
    
    // Play harsh terminal frequency tone
    synthesizeTone(CONFIG.frequencies.error, 'sawtooth', 0.6);
    
    // Trigger Critical Hardware System Flash Animation Screen Wrapper
    DOM.board.classList.add('board-failure-flash');
    setTimeout(() => {
        DOM.board.classList.remove('board-failure-flash');
    }, 400);

    DOM.startButton.textContent = "START RE-SIMULATION";
}

/**
 * Utility Formatting Infrastructure Helpers
 */
function toggleBoardLock(shouldLock) {
    if (shouldLock) {
        DOM.board.classList.add('locked');
    } else {
        DOM.board.classList.remove('locked');
    }
}

function updateDisplayValue(element, numericalData) {
    // Structural Padding Optimization to guarantee monospaced text width stability
    element.textContent = numericalData < 10 ? `0${numericalData}` : numericalData;
}

function updateStatusPrompt(text, stateClass) {
    DOM.statusPrompt.textContent = text;
    DOM.statusPrompt.className = "status-prompt"; // Flush old variables
    if (stateClass) {
        DOM.statusPrompt.classList.add(stateClass);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}