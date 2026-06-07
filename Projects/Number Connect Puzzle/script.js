const gridSize = 5;
const gridElement = document.getElementById("grid");
const resetBtn = document.getElementById("reset");

// Example puzzle layout (0 = empty, numbers = endpoints)
let puzzle = [
  [1, 0, 0, 0, 2],
  [0, 0, 0, 0, 0],
  [0, 3, 0, 4, 0],
  [0, 0, 0, 0, 0],
  [1, 0, 0, 0, 2]
];

let selectedNumber = null;
let pathCells = [];

function renderGrid() {
  gridElement.innerHTML = "";
  gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
  gridElement.style.gridTemplateRows = `repeat(${gridSize}, 60px)`;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (puzzle[r][c] !== 0) {
        cell.textContent = puzzle[r][c];
        cell.classList.add("number");
      }

      cell.addEventListener("click", () => handleCellClick(r, c));
      gridElement.appendChild(cell);
    }
  }
}

function handleCellClick(r, c) {
  const value = puzzle[r][c];

  if (value !== 0) {
    // Start a new path
    selectedNumber = value;
    pathCells = [[r, c]];
  } else if (selectedNumber) {
    // Extend path
    pathCells.push([r, c]);
    markPath();
  }
}

function markPath() {
  document.querySelectorAll(".cell").forEach(cell => {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    if (pathCells.some(([pr, pc]) => pr === r && pc === c)) {
      cell.classList.add("path");
    }
  });
}

resetBtn.addEventListener("click", () => {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("path");
  });
  selectedNumber = null;
  pathCells = [];
});

renderGrid();
