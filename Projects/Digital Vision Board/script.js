const board = document.getElementById("board");
const addGoalBtn = document.getElementById("addGoalBtn");
const toggleThemeBtn = document.getElementById("toggleTheme");

function saveBoard() {
  localStorage.setItem("visionBoard", board.innerHTML);
}

function loadBoard() {
  const data = localStorage.getItem("visionBoard");
  if (data) board.innerHTML = data;
}

addGoalBtn.addEventListener("click", () => {
  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.innerHTML = `
    <h3 contenteditable="true">New Goal</h3>
    <p contenteditable="true">Describe your goal...</p>
    <div class="progress"><div class="progress-bar"></div></div>
    <button onclick="updateProgress(this)">Mark Complete</button>
    <button onclick="deleteCard(this)">🗑️ Delete</button>
  `;
  board.appendChild(card);
  saveBoard();
});

function updateProgress(btn) {
  const bar = btn.parentElement.querySelector(".progress-bar");
  bar.style.width = "100%";
  saveBoard();
}

function deleteCard(btn) {
  btn.parentElement.remove();
  saveBoard();
}

// Drag & Drop
board.addEventListener("dragstart", e => {
  if (e.target.classList.contains("card")) {
    e.target.classList.add("dragging");
  }
});
board.addEventListener("dragend", e => {
  if (e.target.classList.contains("card")) {
    e.target.classList.remove("dragging");
    saveBoard();
  }
});
board.addEventListener("dragover", e => {
  e.preventDefault();
  const dragging = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(board, e.clientY);
  if (afterElement == null) {
    board.appendChild(dragging);
  } else {
    board.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".card:not(.dragging)")];
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Theme toggle
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  saveBoard();
});

loadBoard();
