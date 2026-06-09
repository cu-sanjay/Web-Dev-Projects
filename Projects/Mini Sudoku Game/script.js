const grid = document.getElementById("sudoku-grid");

// Puzzle
let puzzle = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],

  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],

  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];

// Solution (for check + hints)
let solution = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],

  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],

  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9]
];

// CREATE GRID (FIXED INPUT ISSUE)
function createGrid() {
  grid.innerHTML = "";

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {

      const input = document.createElement("input");

      input.type = "text";
      input.maxLength = 1;

      if (puzzle[r][c] !== 0) {
        input.value = puzzle[r][c];
        input.disabled = true;
      }

      // ✅ FIX: allow only 1–9 digits
      input.addEventListener("input", (e) => {
        let val = e.target.value;

        if (!/^[1-9]$/.test(val)) {
          e.target.value = "";
        }
      });

      grid.appendChild(input);
    }
  }
}

// CHECK
function checkSolution() {
  const inputs = document.querySelectorAll("#sudoku-grid input");
  let correct = true;

  inputs.forEach((input, i) => {
    let r = Math.floor(i / 9);
    let c = i % 9;

    if (input.value != solution[r][c]) {
      correct = false;
    }
  });

  document.getElementById("message").innerText =
    correct ? "🎉 Correct Solution!" : "❌ Try Again!";
}

// HINT (FIXED)
function fillHints() {
  const inputs = document.querySelectorAll("#sudoku-grid input");

  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value === "" && !inputs[i].disabled) {
      let r = Math.floor(i / 9);
      let c = i % 9;

      inputs[i].value = solution[r][c];
      document.getElementById("message").innerText = "💡 Hint used!";
      return;
    }
  }
}

// RESET
function resetGame() {
  createGrid();
  document.getElementById("message").innerText = "";
}

createGrid();