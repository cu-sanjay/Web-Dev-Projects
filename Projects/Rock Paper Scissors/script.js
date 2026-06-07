// Dynamic Score & Streak State Logic
let scores = {
    player: parseInt(localStorage.getItem('rps_player_score')) || 0,
    computer: parseInt(localStorage.getItem('rps_computer_score')) || 0,
    streak: parseInt(localStorage.getItem('rps_streak')) || 0
};

const emojiMap = { rock: "✊", paper: "✋", scissors: "✌️" };

// Core Interactive DOM Elements
const containerEl = document.querySelector(".game-container");
const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const streakEl = document.getElementById("streak-counter");
const historyLogEl = document.getElementById("history-log");
const playerChoiceView = document.getElementById("player-choice-view");
const computerChoiceView = document.getElementById("computer-choice-view");
const gameStatusEl = document.getElementById("game-status");
const weaponButtons = document.querySelectorAll(".weapon-btn");
const resetBtn = document.getElementById("reset-btn");

function updateDOMState() {
    playerScoreEl.textContent = scores.player;
    computerScoreEl.textContent = scores.computer;
    streakEl.textContent = `🔥 Current Streak: ${scores.streak}`;
    if (scores.streak >= 3) {
        streakEl.classList.add("active");
    } else {
        streakEl.classList.remove("active");
    }
}
updateDOMState();

// Isolated Synthesized Sound Synthesizer (Zero asset breakdown dependency)
function playBeep(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'win') {
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        } else if (type === 'lose') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        }
    } catch (e) { console.log("Audio contexts blocked"); }
}

function appendHistory(char) {
    const badge = document.createElement('span');
    badge.className = `history-badge ${char}`;
    badge.textContent = char;
    if (historyLogEl.children.length >= 5) {
        historyLogEl.removeChild(historyLogEl.firstChild);
    }
    historyLogEl.appendChild(badge);
}

function getComputerChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
}

function playRound(playerChoice) {
    const computerChoice = getComputerChoice();
    
    containerEl.className = "game-container"; // Clean FX resets
    playerChoiceView.classList.remove("pulse");
    computerChoiceView.classList.remove("pulse");
    void playerChoiceView.offsetWidth; // Force Reflow Matrix

    playerChoiceView.textContent = emojiMap[playerChoice];
    computerChoiceView.textContent = emojiMap[computerChoice];
    playerChoiceView.classList.add("pulse");
    computerChoiceView.classList.add("pulse");

    if (playerChoice === computerChoice) {
        gameStatusEl.textContent = `It's a tie! Both picked ${emojiMap[playerChoice]}`;
        gameStatusEl.style.color = "#fbc531";
        appendHistory('T');
    } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        scores.player++;
        scores.streak++;
        gameStatusEl.textContent = `You won! ${emojiMap[playerChoice]} beats ${emojiMap[computerChoice]}`;
        gameStatusEl.style.color = "#4cd137";
        containerEl.classList.add("win-glow");
        playBeep('win');
        appendHistory('W');
    } else {
        scores.computer++;
        scores.streak = 0; // Breakdown streak reset
        gameStatusEl.textContent = `CPU won! ${emojiMap[computerChoice]} beats ${emojiMap[playerChoice]}`;
        gameStatusEl.style.color = "#e84118";
        containerEl.classList.add("lose-glow");
        playBeep('lose');
        appendHistory('L');
    }

    localStorage.setItem('rps_player_score', scores.player);
    localStorage.setItem('rps_computer_score', scores.computer);
    localStorage.setItem('rps_streak', scores.streak);
    updateDOMState();
}

weaponButtons.forEach(button => {
    button.addEventListener("click", () => playRound(button.getAttribute("data-choice")));
});

resetBtn.addEventListener("click", () => {
    scores = { player: 0, computer: 0, streak: 0 };
    localStorage.clear();
    updateDOMState();
    historyLogEl.innerHTML = "";
    containerEl.className = "game-container";
    playerChoiceView.textContent = "❓";
    computerChoiceView.textContent = "❓";
    playerChoiceView.classList.remove("pulse");
    computerChoiceView.classList.remove("pulse");
    gameStatusEl.textContent = "Choose your weapon to start!";
    gameStatusEl.style.color = "#e0e0e0";
});