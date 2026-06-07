/**
 * Hungama Word-Guessing Core Simulation Engine
 * Architecture: Set-Driven Memory Matrices & SVG Vector Path Interceptors
 */

const DICTIONARY = [
    { word: "VARIABLE", category: "Programming Terms" },
    { word: "COMPILER", category: "Programming Terms" },
    { word: "CALLBACK", category: "Programming Terms" },
    { word: "PROMISE", category: "Programming Terms" },
    { word: "CLOSURE", category: "Programming Terms" },
    { word: "ASYNCHRONOUS", category: "Programming Terms" },
    { word: "ALGORITHM", category: "Computer Science" },
    { word: "RECURSION", category: "Computer Science" },
    { word: "DATABASE", category: "Computer Science" },
    { word: "ENCRYPTION", category: "Cyber Security" },
    { word: "FIREWALL", category: "Cyber Security" },
    { word: "DESTRUCTURING", category: "EcmaScript Standards" },
    { word: "PROTOTYPE", category: "EcmaScript Standards" },
    { word: "HYPERTEXT", category: "Web Architectures" },
    { word: "DECORATOR", category: "Design Patterns" }
];

// Configuration Bounds Matrix
const CONFIG = {
    maxAttempts: 6,
    victoryDelay: 1500,
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
};

// Global Central Memory Engine State
let state = {
    secretWord: "",
    chosenCategory: "",
    guessedLetters: new Set(),
    remainingAttempts: CONFIG.maxAttempts,
    score: 0,
    highScore: 0
};

// DOM Node Cache Mappings
const DOM = {
    score: document.getElementById("score-display"),
    highScore: document.getElementById("highscore-display"),
    attempts: document.getElementById("attempts-display"),
    category: document.getElementById("category-hint"),
    status: document.getElementById("status-prompt"),
    wordDock: document.getElementById("word-dock"),
    keyboard: document.getElementById("keyboard-matrix"),
    resetBtn: document.getElementById("reset-btn"),
    appContainer: document.querySelector(".app-container"),
    limbs: [
        document.querySelector(".limb-head"),
        document.querySelector(".limb-body"),
        document.querySelector(".limb-left-arm"),
        document.querySelector(".limb-right-arm"),
        document.querySelector(".limb-left-leg"),
        document.querySelector(".limb-right-leg")
    ]
};

// Initialize Application Engine Pipeline
document.addEventListener("DOMContentLoaded", () => {
    loadPersistentMetrics();
    buildVirtualKeyboardMatrix();
    attachGlobalInterceptors();
    bootSimulationInstance();
});

function loadPersistentMetrics() {
    const savedHighScore = localStorage.getItem("hungama_high_score");
    if (savedHighScore !== null) {
        state.highScore = parseInt(savedHighScore, 10);
        formatNumericDisplay(DOM.highScore, state.highScore);
    }
}

function buildVirtualKeyboardMatrix() {
    DOM.keyboard.innerHTML = "";
    CONFIG.alphabet.forEach(character => {
        const keyButton = document.createElement("button");
        keyButton.textContent = character;
        keyButton.classList.add("key-btn");
        keyButton.setAttribute("data-key", character);
        keyButton.addEventListener("click", () => handleInputVector(character));
        DOM.keyboard.appendChild(keyButton);
    });
}

function attachGlobalInterceptors() {
    DOM.resetBtn.addEventListener("click", () => {
        state.score = 0;
        formatNumericDisplay(DOM.score, state.score);
        bootSimulationInstance();
    });

    // Capture standard physical desktop key entries
    document.addEventListener("keydown", (event) => {
        const parsedKey = event.key.toUpperCase();
        if (CONFIG.alphabet.includes(parsedKey) && !state.guessedLetters.has(parsedKey)) {
            // Assert matrix isn't explicitly locked before processing entry
            if (!DOM.keyboard.classList.contains("locked-matrix")) {
                handleInputVector(parsedKey);
            }
        }
    });
}

/**
 * Game Execution Loop Controllers
 */
function bootSimulationInstance() {
    // Select random entity packet from configuration data array
    const dataSeed = DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)];
    
    state.secretWord = dataSeed.word;
    state.chosenCategory = dataSeed.category;
    state.guessedLetters.clear();
    state.remainingAttempts = CONFIG.maxAttempts;

    // Reset Core UI Elements
    DOM.category.textContent = state.chosenCategory;
    formatNumericDisplay(DOM.attempts, state.remainingAttempts);
    updateStatusBanner("SIMULATION ACTIVE", "status-running");
    DOM.keyboard.classList.remove("locked-matrix");
    DOM.appContainer.classList.remove("victory-flash");

    // Clear UI Keyboard states
    document.querySelectorAll(".key-btn").forEach(btn => {
        btn.className = "key-btn";
    });

    // Reset SVG vector configurations 
    DOM.limbs.forEach(limb => {
        limb.classList.remove("revealed", "failure-color");
    });

    renderWordPlaceholders();
}

function renderWordPlaceholders() {
    DOM.wordDock.innerHTML = "";
    
    for (let i = 0; i < state.secretWord.length; i++) {
        const char = state.secretWord[i];
        const tile = document.createElement("div");
        tile.classList.add("char-tile");
        tile.setAttribute("data-index", i);
        
        if (state.guessedLetters.has(char)) {
            tile.textContent = char;
            tile.classList.add("revealed");
        } else {
            tile.textContent = "";
        }
        
        DOM.wordDock.appendChild(tile);
    }
}

/**
 * String Processing Pipeline & Input Vectors Interceptor
 */
function handleInputVector(character) {
    if (state.guessedLetters.has(character) || state.remainingAttempts <= 0) return;

    state.guessedLetters.add(character);
    const targetKeyNode = DOM.keyboard.querySelector(`[data-key="${character}"]`);
    
    if (state.secretWord.includes(character)) {
        if (targetKeyNode) targetKeyNode.classList.add("correct");
        processCorrectGuess(character);
    } else {
        if (targetKeyNode) targetKeyNode.classList.add("incorrect");
        processIncorrectGuess();
    }
}

function processCorrectGuess(character) {
    const tiles = DOM.wordDock.querySelectorAll(".char-tile");
    
    for (let i = 0; i < state.secretWord.length; i++) {
        if (state.secretWord[i] === character) {
            const tile = tiles[i];
            tile.textContent = character;
            tile.classList.add("revealed");
        }
    }

    evalGameStateBoundary();
}

function processIncorrectGuess() {
    state.remainingAttempts--;
    formatNumericDisplay(DOM.attempts, state.remainingAttempts);
    
    // Trigger Real-time Canvas Limb Modifier Injection
    const limbIndex = CONFIG.maxAttempts - 1 - state.remainingAttempts;
    if (DOM.limbs[limbIndex]) {
        DOM.limbs[limbIndex].classList.add("revealed");
    }

    evalGameStateBoundary();
}

/**
 * Evaluation Boundary Matrices
 */
function evalGameStateBoundary() {
    // Condition A: User has completely unmasked the secret word vector array
    const wordIsComplete = state.secretWord.split("").every(char => state.guessedLetters.has(char));

    if (wordIsComplete) {
        executeVictoryState();
        return;
    }

    // Condition B: Attempt counter scale limits completely depleted
    if (state.remainingAttempts <= 0) {
        executeDefeatState();
    }
}

function executeVictoryState() {
    DOM.keyboard.classList.add("locked-matrix");
    state.score++;
    formatNumericDisplay(DOM.score, state.score);

    if (state.score > state.highScore) {
        state.highScore = state.score;
        localStorage.setItem("hungama_high_score", state.highScore);
        formatNumericDisplay(DOM.highScore, state.highScore);
    }

    updateStatusBanner("VICTORY DETECTED", "status-victory");
    DOM.appContainer.classList.add("victory-flash");

    // Wait and advance seamlessly into next tracking entry
    setTimeout(bootSimulationInstance, CONFIG.victoryDelay);
}

function executeDefeatState() {
    DOM.keyboard.classList.add("locked-matrix");
    state.score = 0; // Clear running sequence streaks
    formatNumericDisplay(DOM.score, state.score);
    
    updateStatusBanner("CRITICAL FAILURE", "status-failed");

    // Force failure tint updates across vector segments
    DOM.limbs.forEach(limb => {
        if (limb.classList.contains("revealed")) {
            limb.classList.add("failure-color");
        }
    });

    // Mask revealed tiles with red styling markers showing the missed layout
    const tiles = DOM.wordDock.querySelectorAll(".char-tile");
    for (let i = 0; i < state.secretWord.length; i++) {
        if (!state.guessedLetters.has(state.secretWord[i])) {
            tiles[i].textContent = state.secretWord[i];
            tiles[i].classList.add("failed-reveal");
        }
    }
}

/**
 * Typography Formatting Padding Helpers
 */
function formatNumericDisplay(element, numericValue) {
    element.textContent = numericValue < 10 ? `0${numericValue}` : numericValue;
}

function updateStatusBanner(text, systemClass) {
    DOM.status.textContent = text;
    DOM.status.className = "status-prompt"; // Flush existing state configurations
    if (systemClass) {
        DOM.status.classList.add(systemClass);
    }
}