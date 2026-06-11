const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let obj1 = {}, obj2 = {};
let score = 0;
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

const actualDistanceEl = document.getElementById("actualDistance");
const userGuessEl = document.getElementById("userGuess");
const accuracyEl = document.getElementById("accuracy");
const scoreEl = document.getElementById("score");
const scoresList = document.getElementById("scoresList");

document.getElementById("submitBtn").addEventListener("click", submitGuess);
document.getElementById("newBtn").addEventListener("click", newScenario);
document.getElementById("resetBtn").addEventListener("click", resetScore);

// Generate random scenario
function newScenario() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  obj1 = { x: Math.random() * 600 + 50, y: Math.random() * 350 + 50 };
  obj2 = { x: Math.random() * 600 + 50, y: Math.random() * 350 + 50 };

  drawObject(obj1.x, obj1.y, "red");
  drawObject(obj2.x, obj2.y, "blue");

  actualDistanceEl.textContent = "-";
  userGuessEl.textContent = "-";
  accuracyEl.textContent = "-";
}

function drawObject(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function calculateDistance(o1, o2) {
  const dx = o2.x - o1.x;
  const dy = o2.y - o1.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

function submitGuess() {
  const guess = parseInt(document.getElementById("guessInput").value);
  if (isNaN(guess)) {
    alert("Please enter a valid number!");
    return;
  }

  const actual = calculateDistance(obj1, obj2);
  const accuracy = Math.max(0, 100 - Math.abs(actual - guess) / actual * 100);

  actualDistanceEl.textContent = actual;
  userGuessEl.textContent = guess;
  accuracyEl.textContent = accuracy.toFixed(2);

  score += Math.round(accuracy);
  scoreEl.textContent = score;

  updateLeaderboard(accuracy);
}

function updateLeaderboard(accuracy) {
  const entry = {
    date: new Date().toLocaleString(),
    score: score,
    accuracy: accuracy.toFixed(2)
  };

  leaderboard.push(entry);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
}

function renderLeaderboard() {
  scoresList.innerHTML = "";
  leaderboard.slice(-5).forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.date} → Score: ${entry.score}, Accuracy: ${entry.accuracy}%`;
    scoresList.appendChild(li);
  });
}

function resetScore() {
  score = 0;
  scoreEl.textContent = score;
  leaderboard = [];
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
}

// Initialize
newScenario();
renderLeaderboard();
