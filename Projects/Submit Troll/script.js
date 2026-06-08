const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const difficultySelect = document.getElementById("difficulty");
const attemptsEl = document.getElementById("attempts");
const catchesEl = document.getElementById("catches");
const escapesEl = document.getElementById("escapes");

let attempts = 0, catches = 0, escapes = 0;
let difficulty = "medium";

difficultySelect.addEventListener("change", e => {
  difficulty = e.target.value;
});

// Escape logic
yesBtn.addEventListener("mouseover", () => {
  attempts++;
  attemptsEl.textContent = attempts;

  // Fake catch chance (20%)
  if (Math.random() < 0.2) {
    catches++;
    catchesEl.textContent = catches;
    alert("You caught it... or did you? 😏");
    return;
  }

  // Move button
  const container = document.querySelector(".buttons");
  const bounds = container.getBoundingClientRect();
  const btnWidth = yesBtn.offsetWidth;
  const btnHeight = yesBtn.offsetHeight;

  let offset = difficulty === "easy" ? 50 : difficulty === "medium" ? 150 : 300;

  const newX = Math.random() * (bounds.width - btnWidth - offset);
  const newY = Math.random() * (bounds.height - btnHeight - offset);

  yesBtn.style.left = newX + "px";
  yesBtn.style.top = newY + "px";

  escapes++;
  escapesEl.textContent = escapes;
});

// Mobile support (touch)
yesBtn.addEventListener("touchstart", () => {
  attempts++;
  attemptsEl.textContent = attempts;
  escapes++;
  escapesEl.textContent = escapes;
  alert("Too slow! The button escaped 🏃‍♂️");
});
