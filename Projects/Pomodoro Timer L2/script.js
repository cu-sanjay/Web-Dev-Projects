let workTime = 25 * 60; // 25 minutes
let breakTime = 5 * 60; // 5 minutes
let timeLeft = workTime;
let isRunning = false;
let isWorkSession = true;
let timerInterval;
let sessionsCompleted = 0;

const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const sessionCountEl = document.getElementById("sessionCount");
const beep = document.getElementById("beep");

function updateTimerDisplay() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  timerEl.textContent = `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        beep.play();
        if (isWorkSession) {
          sessionsCompleted++;
          sessionCountEl.textContent = `Sessions Completed: ${sessionsCompleted}`;
          timeLeft = breakTime;
          isWorkSession = false;
        } else {
          timeLeft = workTime;
          isWorkSession = true;
        }
        updateTimerDisplay();
        isRunning = false;
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  isWorkSession = true;
  timeLeft = workTime;
  updateTimerDisplay();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateTimerDisplay();