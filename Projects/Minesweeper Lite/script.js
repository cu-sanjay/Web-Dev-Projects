document.addEventListener('DOMContentLoaded', () => {
  // Preset Game Difficulties Configuration
  const DIFFICULTIES = {
    easy: { cols: 9, rows: 9, mines: 10, cellSize: 36 },
    medium: { cols: 16, rows: 16, mines: 40, cellSize: 28 },
    hard: { cols: 20, rows: 20, mines: 80, cellSize: 24 }
  };

  // OOP Individual Cell state representation
  class MinesweeperCell {
    constructor(row, col) {
      this.row = row;
      this.col = col;

      this.isMine = false;
      this.isRevealed = false;
      this.isFlagged = false;
      this.neighborMines = 0;
    }
  }

  // OOP Puzzle Board state calculator
  class MinesweeperBoard {
    constructor() {
      this.activeDiff = 'easy';
      this.cols = 9;
      this.rows = 9;
      this.minesCount = 10;
      this.flagsCount = 0;
      this.cells = [];

      this.firstClick = true;
      this.isGameOver = false;
      this.isGameWon = false;
      this.elapsedSeconds = 0;
      this.timerInterval = null;

      // Stats
      this.bestTime = JSON.parse(localStorage.getItem('ms_best_time')) || {};
    }

    initBoard(diff) {
      this.activeDiff = diff;
      const config = DIFFICULTIES[diff];
      this.cols = config.cols;
      this.rows = config.rows;
      this.minesCount = config.mines;
      this.flagsCount = 0;

      this.firstClick = true;
      this.isGameOver = false;
      this.isGameWon = false;
      this.elapsedSeconds = 0;
      clearInterval(this.timerInterval);

      // Construct empty cells array
      this.cells = [];
      for (let r = 0; r < this.rows; r++) {
        const rowArr = [];
        for (let c = 0; c < this.cols; c++) {
          rowArr.push(new MinesweeperCell(r, c));
        }
        this.cells.push(rowArr);
      }

      this.onBoardStateChange();
    }

    startTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (!this.isGameOver && !this.isGameWon) {
          this.elapsedSeconds = Math.min(this.elapsedSeconds + 1, 999);
          this.onTimerTick();
        }
      }, 1000);
    }

    // Dynamic mines layout re-shuffled dynamically to protect first-click
    generateMines(excludeRow, excludeCol) {
      let minesPlaced = 0;
      while (minesPlaced < this.minesCount) {
        const r = Math.floor(Math.random() * this.rows);
        const c = Math.floor(Math.random() * this.cols);

        // Ensure target is not a mine and not inside coordinates of the initial click
        const isExcluded = (r === excludeRow && c === excludeCol);
        
        // Also exclude all immediate adjacent cells of the first click for clean start
        let isAdjacent = false;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (excludeRow + dr === r && excludeCol + dc === c) {
              isAdjacent = true;
            }
          }
        }

        if (!this.cells[r][c].isMine && !isExcluded && !isAdjacent) {
          this.cells[r][c].isMine = true;
          minesPlaced++;
        }
      }

      // Calculate neighbor counts
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (!this.cells[r][c].isMine) {
            this.cells[r][c].neighborMines = this.countNeighborMines(r, c);
          }
        }
      }
    }

    countNeighborMines(row, col) {
      let count = 0;
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          const checkR = row + r;
          const checkC = col + c;
          if (checkR >= 0 && checkR < this.rows && checkC >= 0 && checkC < this.cols) {
            if (this.cells[checkR][checkC].isMine) {
              count++;
            }
          }
        }
      }
      return count;
    }

    revealCell(row, col) {
      if (this.isGameOver || this.isGameWon) return;

      const cell = this.cells[row][col];
      if (cell.isRevealed || cell.isFlagged) return;

      // Ensure safe start on first-click
      if (this.firstClick) {
        this.firstClick = false;
        this.generateMines(row, col);
        this.startTimer();
      }

      cell.isRevealed = true;

      if (cell.isMine) {
        this.triggerGameOver(row, col);
        return;
      }

      // Recursively reveal neighbors if cell contains zero adjacent mines
      if (cell.neighborMines === 0) {
        this.revealNeighbors(row, col);
      }

      this.checkVictory();
      this.onBoardStateChange();
    }

    // Depth-First recursive blank sweeps
    revealNeighbors(row, col) {
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          const checkR = row + r;
          const checkC = col + c;
          if (checkR >= 0 && checkR < this.rows && checkC >= 0 && checkC < this.cols) {
            const neighbor = this.cells[checkR][checkC];
            if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
              neighbor.isRevealed = true;
              if (neighbor.neighborMines === 0) {
                this.revealNeighbors(checkR, checkC);
              }
            }
          }
        }
      }
    }

    toggleFlag(row, col) {
      if (this.isGameOver || this.isGameWon) return;

      const cell = this.cells[row][col];
      if (cell.isRevealed) return;

      cell.isFlagged = !cell.isFlagged;
      this.flagsCount += cell.isFlagged ? 1 : -1;

      this.onBoardStateChange();
    }

    triggerGameOver(explodedRow, explodedCol) {
      this.isGameOver = true;
      clearInterval(this.timerInterval);

      // Reveal all mines visually
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.cells[r][c].isMine) {
            this.cells[r][c].isRevealed = true;
          }
        }
      }

      this.onGameOver(explodedRow, explodedCol);
    }

    checkVictory() {
      // Game won if all non-mine cells are revealed
      let win = true;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const cell = this.cells[r][c];
          if (!cell.isMine && !cell.isRevealed) {
            win = false;
          }
        }
      }

      if (win) {
        this.isGameWon = true;
        clearInterval(this.timerInterval);

        // Record stats
        if (!this.bestTime[this.activeDiff] || this.elapsedSeconds < this.bestTime[this.activeDiff]) {
          this.bestTime[this.activeDiff] = this.elapsedSeconds;
          localStorage.setItem('ms_best_time', JSON.stringify(this.bestTime));
        }

        this.onVictory();
      }
    }

    // Callbacks to bind
    onBoardStateChange() {}
    onTimerTick() {}
    onGameOver() {}
    onVictory() {}
  }

  // UI Renderer and Click Controller
  class GameUI {
    constructor(engine) {
      this.engine = engine;

      // DOM Elements
      this.boardGrid = document.getElementById('board-grid');
      this.mineCountLabel = document.getElementById('mine-count');
      this.timerLabel = document.getElementById('timer');
      this.faceResetBtn = document.getElementById('face-reset');
      this.diffSelect = document.getElementById('diff-select');
      this.bestTimeVal = document.getElementById('best-time-val');

      // Mobile Touch helper controls
      this.modeDigBtn = document.getElementById('mode-dig');
      this.modeFlagBtn = document.getElementById('mode-flag');
      this.isMobileFlagMode = false;

      this.init();
    }

    init() {
      this.diffSelect.addEventListener('change', (e) => this.resetGame(e.target.value));
      this.faceResetBtn.addEventListener('click', () => this.resetGame(this.engine.activeDiff));

      // Mobile Mode helpers click settings
      this.modeDigBtn.addEventListener('click', () => {
        this.isMobileFlagMode = false;
        this.modeDigBtn.classList.add('active');
        this.modeFlagBtn.classList.remove('active');
      });

      this.modeFlagBtn.addEventListener('click', () => {
        this.isMobileFlagMode = true;
        this.modeFlagBtn.classList.add('active');
        this.modeDigBtn.classList.remove('active');
      });

      // Bind engine callbacks
      this.engine.onTimerTick = () => {
        this.timerLabel.textContent = this.formatNumber(this.engine.elapsedSeconds);
      };

      this.engine.onBoardStateChange = () => {
        const remaining = Math.max(this.engine.minesCount - this.engine.flagsCount, 0);
        this.mineCountLabel.textContent = this.formatNumber(remaining);
        this.renderGrid();
      };

      this.engine.onGameOver = (explodedRow, explodedCol) => {
        this.faceResetBtn.textContent = '😵';
        this.renderGrid();
        
        // Highlight specific mine cell that exploded
        const cellDOM = this.getCellDOM(explodedRow, explodedCol);
        if (cellDOM) {
          cellDOM.classList.add('mine');
        }
      };

      this.engine.onVictory = () => {
        this.faceResetBtn.textContent = '😎';
        this.renderGrid();
        this.updateBestTimeDisplay();
      };

      this.resetGame('easy');
    }

    resetGame(diff) {
      this.faceResetBtn.textContent = '😊';
      this.timerLabel.textContent = '000';
      this.engine.initBoard(diff);
      this.updateBestTimeDisplay();
    }

    updateBestTimeDisplay() {
      const best = this.engine.bestTime[this.engine.activeDiff];
      this.bestTimeVal.textContent = best ? `${best}s` : '-';
    }

    renderGrid() {
      this.boardGrid.innerHTML = '';
      this.boardGrid.style.gridTemplateColumns = `repeat(${this.engine.cols}, 1fr)`;
      
      const config = DIFFICULTIES[this.engine.activeDiff];

      for (let r = 0; r < this.engine.rows; r++) {
        for (let c = 0; c < this.engine.cols; c++) {
          const cell = this.engine.cells[r][c];
          
          const cellDOM = document.createElement('div');
          cellDOM.className = 'grid-cell';
          cellDOM.style.width = `${config.cellSize}px`;
          cellDOM.style.height = `${config.cellSize}px`;
          cellDOM.dataset.row = r;
          cellDOM.dataset.col = c;

          if (cell.isRevealed) {
            cellDOM.classList.add('revealed');
            
            if (cell.isMine) {
              cellDOM.textContent = '💣';
            } else if (cell.neighborMines > 0) {
              cellDOM.textContent = cell.neighborMines;
              cellDOM.dataset.val = cell.neighborMines;
            }
          } else if (cell.isFlagged) {
            cellDOM.classList.add('flagged');
            cellDOM.textContent = '🚩';
          }

          // Left Click Dig
          cellDOM.addEventListener('click', (e) => {
            if (this.isMobileFlagMode) {
              this.engine.toggleFlag(r, c);
            } else {
              this.engine.revealCell(r, c);
            }
          });

          // Right Click Flag toggle
          cellDOM.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.engine.toggleFlag(r, c);
          });

          this.boardGrid.appendChild(cellDOM);
        }
      }
    }

    getCellDOM(r, c) {
      return this.boardGrid.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
    }

    formatNumber(num) {
      return num.toString().padStart(3, '0');
    }
  }

  // Ignite Engine
  const engine = new MinesweeperBoard();
  new GameUI(engine);
});
