const board = document.getElementById("board");
const pieceContainer = document.getElementById("pieceContainer");
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");
const restartBtn = document.getElementById("restartBtn");

const BOARD_SIZE = 8;

const shapes = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 0], [1, 1]],
  [[0, 1], [1, 1]]
];

let grid = [];
let currentPieces = [];

let selectedPiece = null;
let selectedPieceIndex = null;

let score = 0;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;

bestScoreElement.textContent = bestScore;

function initGrid() {
  grid = Array.from(
    { length: BOARD_SIZE },
    () => Array(BOARD_SIZE).fill(0)
  );
}

function renderBoard() {

  board.innerHTML = "";

  for (let row = 0; row < BOARD_SIZE; row++) {

    for (let col = 0; col < BOARD_SIZE; col++) {

      const cell = document.createElement("div");

      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;

      cell.addEventListener("mouseenter", () => {

        if (!selectedPiece) {
          clearPreview();
          return;
        }

        clearPreview();

        previewPiece(
          selectedPiece,
          row,
          col,
          canPlace(selectedPiece, row, col)
        );

      });

      cell.addEventListener("click", () => {

        if (!selectedPiece) {
          return;
        }

        if (!canPlace(selectedPiece, row, col)) {
          return;
        }

        placePiece(
          selectedPiece,
          row,
          col,
          selectedPieceIndex
        );

        selectedPiece = null;
        selectedPieceIndex = null;

        clearPreview();

      });

      board.appendChild(cell);

    }

  }

  renderGrid();

}

function renderGrid() {

  const cells = document.querySelectorAll(".cell");

  cells.forEach((cell) => {

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    cell.style.backgroundColor =
      grid[row][col]
        ? "#0ea5e9"
        : "#475569";

  });

}

function randomShape() {

  return shapes[
    Math.floor(
      Math.random() * shapes.length
    )
  ];

}

function generatePieces() {

  currentPieces = [];

  for (let i = 0; i < 3; i++) {
    currentPieces.push(randomShape());
  }

  renderPieces();

}

function renderPieces() {

  pieceContainer.innerHTML = "";

  currentPieces.forEach((shape, index) => {

    const wrapper = document.createElement("div");

    wrapper.className = "piece";

    if (!shape) {

      pieceContainer.appendChild(wrapper);
      return;

    }

    wrapper.style.display = "grid";
    wrapper.style.gridTemplateColumns =
      `repeat(${shape[0].length},20px)`;

    wrapper.style.gap = "3px";

    wrapper.addEventListener("click", () => {

      selectedPiece = shape;
      selectedPieceIndex = index;

      document.querySelectorAll(".piece")
        .forEach(piece =>
          piece.classList.remove("selected")
        );

      wrapper.classList.add("selected");

    });

    shape.forEach(row => {

      row.forEach(value => {

        const block = document.createElement("div");

        block.style.width = "20px";
        block.style.height = "20px";
        block.style.borderRadius = "4px";

        if (value) {
          block.style.backgroundColor = "#38bdf8";
        } else {
          block.style.visibility = "hidden";
        }

        wrapper.appendChild(block);

      });

    });

    pieceContainer.appendChild(wrapper);

  });

}

function canPlace(shape, row, col) {

  for (let r = 0; r < shape.length; r++) {

    for (let c = 0; c < shape[r].length; c++) {

      if (!shape[r][c]) {
        continue;
      }

      const nr = row + r;
      const nc = col + c;

      if (
        nr >= BOARD_SIZE ||
        nc >= BOARD_SIZE
      ) {
        return false;
      }

      if (grid[nr][nc]) {
        return false;
      }

    }

  }

  return true;

}

function updateScore(points) {

  score += points;
  scoreElement.textContent = score;

  if (score > bestScore) {

    bestScore = score;

    localStorage.setItem(
      "bestScore",
      bestScore
    );

    bestScoreElement.textContent = bestScore;

  }

}

function clearLines() {

  let rows = [];
  let cols = [];

  for (let row = 0; row < BOARD_SIZE; row++) {

    if (grid[row].every(cell => cell)) {
      rows.push(row);
    }

  }

  for (let col = 0; col < BOARD_SIZE; col++) {

    let full = true;

    for (let row = 0; row < BOARD_SIZE; row++) {

      if (!grid[row][col]) {
        full = false;
        break;
      }

    }

    if (full) {
      cols.push(col);
    }

  }

  rows.forEach(row => {

    for (let col = 0; col < BOARD_SIZE; col++) {
      grid[row][col] = 0;
    }

  });

  cols.forEach(col => {

    for (let row = 0; row < BOARD_SIZE; row++) {
      grid[row][col] = 0;
    }

  });

  const totalLines = rows.length + cols.length;

  if (totalLines > 0) {
    updateScore(totalLines * 10);
  }

}

function canFitAnywhere(shape) {

  for (let row = 0; row < BOARD_SIZE; row++) {

    for (let col = 0; col < BOARD_SIZE; col++) {

      if (canPlace(shape, row, col)) {
        return true;
      }

    }

  }

  return false;

}

function checkGameOver() {

  const remainingPieces =
    currentPieces.filter(piece => piece);

  if (
    remainingPieces.length &&
    !remainingPieces.some(canFitAnywhere)
  ) {

    setTimeout(() => {

      alert(
        `Game Over!\n\nScore: ${score}`
      );

    }, 100);

  }

}

function placePiece(shape, row, col, index) {

  let blocksPlaced = 0;

  for (let r = 0; r < shape.length; r++) {

    for (let c = 0; c < shape[r].length; c++) {

      if (!shape[r][c]) {
        continue;
      }

      grid[row + r][col + c] = 1;
      blocksPlaced++;

    }

  }

  updateScore(blocksPlaced);

  clearLines();

  currentPieces[index] = null;

  renderGrid();
  renderPieces();

  if (
    currentPieces.every(piece => piece === null)
  ) {
    generatePieces();
  }

  checkGameOver();

}

function previewPiece(shape, row, col, valid) {

  const cells = document.querySelectorAll(".cell");

  for (let r = 0; r < shape.length; r++) {

    for (let c = 0; c < shape[r].length; c++) {

      if (!shape[r][c]) {
        continue;
      }

      const nr = row + r;
      const nc = col + c;

      if (
        nr >= BOARD_SIZE ||
        nc >= BOARD_SIZE
      ) {
        continue;
      }

      const index =
        nr * BOARD_SIZE + nc;

      cells[index].classList.add(
        valid
          ? "preview-valid"
          : "preview-invalid"
      );

    }

  }

}

function clearPreview() {

  document.querySelectorAll(".cell")
    .forEach(cell => {

      cell.classList.remove(
        "preview-valid",
        "preview-invalid"
      );

    });

}

function restartGame() {

  score = 0;
  scoreElement.textContent = 0;

  selectedPiece = null;
  selectedPieceIndex = null;

  initGrid();
  renderBoard();
  generatePieces();

}

restartBtn.addEventListener(
  "click",
  restartGame
);

initGrid();
renderBoard();
generatePieces();