const addBtn = document.getElementById("addBtn");
const avoidInput = document.getElementById("avoidInput");
const avoidList = document.getElementById("avoidList");
const streakDisplay = document.getElementById("streak");

let streak = 0;
let today = new Date().toDateString();
let avoidedToday = [];

addBtn.addEventListener("click", () => {
  const distraction = avoidInput.value.trim();
  if (distraction) {
    const li = document.createElement("li");
    li.textContent = `Avoided: ${distraction}`;
    avoidList.appendChild(li);

    avoidedToday.push(distraction);
    avoidInput.value = "";

    // Update streak if first entry today
    if (avoidedToday.length === 1) {
      streak++;
      streakDisplay.textContent = `Streak: ${streak} days`;
      localStorage.setItem("streak", streak);
      localStorage.setItem("lastDate", today);
    }
  }
});

// Load streak from localStorage
window.onload = () => {
  const savedStreak = localStorage.getItem("streak");
  const lastDate = localStorage.getItem("lastDate");

  if (savedStreak) {
    if (lastDate === today) {
      streak = parseInt(savedStreak);
    } else {
      streak = parseInt(savedStreak);
    }
    streakDisplay.textContent = `Streak: ${streak} days`;
  }
};
