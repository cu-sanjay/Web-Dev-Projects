let time1 = 300; // 5 minutes in seconds
let time2 = 300;
let activePlayer = 1;
let timer;

const timeDisplay1 = document.getElementById("time1");
const timeDisplay2 = document.getElementById("time2");
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const resetBtn = document.getElementById("resetBtn");

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function updateDisplay() {
  timeDisplay1.textContent = formatTime(time1);
  timeDisplay2.textContent = formatTime(time2);
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (activePlayer === 1) {
      time1--;
      if (time1 <= 0) {
        clearInterval(timer);
        alert("Player 1 ran out of time!");
      }
    } else {
      time2--;
      if (time2 <= 0) {
        clearInterval(timer);
        alert("Player 2 ran out of time!");
      }
    }
    updateDisplay();
  }, 1000);
}

btn1.addEventListener("click", () => {
  if (activePlayer === 1) {
    activePlayer = 2;
    startTimer();
  }
});

btn2.addEventListener("click", () => {
  if (activePlayer === 2) {
    activePlayer = 1;
    startTimer();
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(timer);
  time1 = 300;
  time2 = 300;
  activePlayer = 1;
  updateDisplay();
  startTimer();
});

updateDisplay();
startTimer();
