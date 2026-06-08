let sequence = [];
let userSequence = [];
let level = 0;
let highScore = 0;
let isPlaying = false;

const colors = ["red", "blue", "green", "yellow"];

// 🔊 sound generator
function playSound(freq) {
  const audio = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audio.createOscillator();
  osc.frequency.value = freq;
  osc.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.15);
}

function startGame() {
  sequence = [];
  userSequence = [];
  level = 0;
  isPlaying = true;

  document.getElementById("status").innerText = "Watch carefully...";
  nextLevel();
}

function nextLevel() {
  userSequence = [];
  level++;

  document.getElementById("level").innerText = "Level: " + level;

  let randomColor = colors[Math.floor(Math.random() * colors.length)];
  sequence.push(randomColor);

  playSequence();
}

function playSequence() {
  let i = 0;

  let interval = setInterval(() => {
    flash(sequence[i]);
    i++;
    if (i >= sequence.length) clearInterval(interval);
  }, 600);
}

function flash(color) {
  const btn = document.getElementById(color);
  btn.classList.add("active");

  // sound per color
  const soundMap = {
    red: 300,
    blue: 400,
    green: 500,
    yellow: 600
  };
  playSound(soundMap[color]);

  setTimeout(() => btn.classList.remove("active"), 300);
}

// disable clicks during playback
let canClick = false;

setTimeout(() => {
  canClick = true;
}, 2000);

document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    if (!isPlaying || !canClick) return;

    const color = e.target.id;
    userSequence.push(color);

    flash(color);
    checkAnswer(userSequence.length - 1);
  });
});

function checkAnswer(index) {
  if (userSequence[index] !== sequence[index]) {
    gameOver();
    return;
  }

  if (userSequence.length === sequence.length) {
    document.getElementById("status").innerText = "Correct! Next level...";
    setTimeout(nextLevel, 1000);
  }
}

function gameOver() {
  isPlaying = false;

  document.getElementById("status").innerText =
    "Game Over! Score: " + level;

  if (level > highScore) {
    highScore = level;
    document.getElementById("highScore").innerText =
      "High Score: " + highScore;
  }
}