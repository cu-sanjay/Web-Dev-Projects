document.addEventListener('DOMContentLoaded', () => {
  // Handcrafted Level Data Config
  // Each levels represents a slice of rectangles mapping the grid perfectly.
  const LEVELS = {
    easy: [
      {
        id: "easy-1",
        name: "Intro Grid",
        cols: 4,
        rows: 4,
        // Numbered cells representing origin start points. Format: { r, c, val }
        numbers: [
          { r: 0, c: 0, val: 4 }, // Solution: 2x2 square from (0,0) to (1,1)
          { r: 0, c: 2, val: 4 }, // Solution: 1x4 horizontal from (0,2) to (0,3) (or 2x2 etc. depending on partitioning)
          { r: 2, c: 0, val: 2 }, 
          { r: 2, c: 2, val: 6 }
        ],
        // Solution layout mapping for hints verification
        solution: [
          { r1: 0, c1: 0, r2: 1, c2: 1, origin: { r: 0, c: 0 } },
          { r1: 0, c1: 2, r2: 1, c2: 3, origin: { r: 0, c: 2 } },
          { r1: 2, c1: 0, r2: 3, c2: 0, origin: { r: 2, c: 0 } },
          { r1: 2, c1: 1, r2: 3, c2: 3, origin: { r: 2, c: 2 } }
        ]
      },
      {
        id: "easy-2",
        name: "Symmetric Split",
        cols: 4,
        rows: 4,
        numbers: [
          { r: 0, c: 0, val: 6 },
          { r: 0, c: 3, val: 2 },
          { r: 3, c: 0, val: 2 },
          { r: 2, c: 2, val: 6 }
        ],
        solution: [
          { r1: 0, c1: 0, r2: 2, c2: 1, origin: { r: 0, c: 0 } },
          { r1: 0, c1: 2, r2: 1, c2: 3, origin: { r: 0, c: 3 } },
          { r1: 3, c1: 0, r2: 3, c2: 1, origin: { r: 3, c: 0 } },
          { r1: 2, c1: 2, r2: 3, c2: 3, origin: { r: 2, c: 2 } }
        ]
      }
    ],
    medium: [
      {
        id: "medium-1",
        name: "Cross Partition",
        cols: 6,
        rows: 6,
        numbers: [
          { r: 0, c: 0, val: 4 },
          { r: 0, c: 2, val: 6 },
          { r: 0, c: 5, val: 8 },
          { r: 3, c: 0, val: 9 },
          { r: 3, c: 3, val: 3 },
          { r: 5, c: 4, val: 6 }
        ],
        solution: [
          { r1: 0, c1: 0, r2: 1, c2: 1, origin: { r: 0, c: 0 } },
          { r1: 0, c1: 2, r2: 2, c2: 3, origin: { r: 0, c: 2 } },
          { r1: 0, c1: 4, r2: 3, c2: 5, origin: { r: 0, c: 5 } },
          { r1: 2, c1: 0, r2: 4, c2: 2, origin: { r: 3, c: 0 } },
          { r1: 3, c1: 3, r2: 3, c2: 5, origin: { r: 3, c: 3 } },
          { r1: 4, c1: 3, r2: 5, c2: 5, origin: { r: 5, c: 4 } }
        ]
      }
    ],
    hard: [
      {
        id: "hard-1",
        name: "Nexus Cover",
        cols: 8,
        rows: 8,
        numbers: [
          { r: 0, c: 0, val: 8 },
          { r: 0, c: 4, val: 8 },
          { r: 2, c: 0, val: 8 },
          { r: 2, c: 4, val: 8 },
          { r: 4, c: 0, val: 8 },
          { r: 4, c: 4, val: 8 },
          { r: 6, c: 0, val: 8 },
          { r: 6, c: 4, val: 8 }
        ],
        solution: [
          { r1: 0, c1: 0, r2: 1, c2: 3, origin: { r: 0, c: 0 } },
          { r1: 0, c1: 4, r2: 1, c2: 7, origin: { r: 0, c: 4 } },
          { r1: 2, c1: 0, r2: 3, c2: 3, origin: { r: 2, c: 0 } },
          { r1: 2, c1: 4, r2: 3, c2: 7, origin: { r: 2, c: 4 } },
          { r1: 4, c1: 0, r2: 5, c2: 3, origin: { r: 4, c: 0 } },
          { r1: 4, c1: 4, r2: 5, c2: 7, origin: { r: 4, c: 4 } },
          { r1: 6, c1: 0, r2: 7, c2: 3, origin: { r: 6, c: 0 } },
          { r1: 6, c1: 4, r2: 7, c2: 7, origin: { r: 6, c: 4 } }
        ]
      }
    ]
  };

  // OOP Shape representation class
  class ShapeBlock {
    constructor(r1, c1, r2, c2, originCell) {
      this.r1 = Math.min(r1, r2);
      this.c1 = Math.min(c1, c2);
      this.r2 = Math.max(r1, r2);
      this.c2 = Math.max(c1, c2);
      
      this.origin = originCell; // { r, c, val }
      this.valid = false;
      this.validate();
    }

    validate() {
      const area = (this.r2 - this.r1 + 1) * (this.c2 - this.c1 + 1);
      // Valid if area matches value
      this.valid = (area === this.origin.val);
    }

    contains(r, c) {
      return r >= this.r1 && r <= this.r2 && c >= this.c1 && c <= this.c2;
    }
  }

  // OOP Game State Manager
  class PuzzleBoard {
    constructor() {
      this.activeDiff = 'easy';
      this.activeLevelIdx = 0;

      this.cols = 4;
      this.rows = 4;
      this.numbers = []; // Level preset numbers
      this.shapes = []; // Placed blocks

      this.elapsedSeconds = 0;
      this.timerInterval = null;
      this.hasWon = false;

      // Local storage states
      this.unlockedLevels = JSON.parse(localStorage.getItem('sb_unlocked_levels')) || {
        easy: 0,
        medium: 0,
        hard: 0
      };
      this.bestTime = JSON.parse(localStorage.getItem('sb_best_time')) || {};
    }

    loadLevel(diff, idx) {
      this.activeDiff = diff;
      this.activeLevelIdx = idx;

      const lvl = LEVELS[diff][idx];
      this.cols = lvl.cols;
      this.rows = lvl.rows;
      this.numbers = lvl.numbers.map(n => ({ ...n }));
      this.shapes = [];
      this.hasWon = false;
      this.elapsedSeconds = 0;

      this.startTimer();
      this.onBoardChange();
    }

    startTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (!this.hasWon) {
          this.elapsedSeconds++;
          this.onTimerTick();
        }
      }, 1000);
    }

    addShape(r1, c1, r2, c2, originCell) {
      if (this.hasWon) return;

      // Remove any existing shape originating from this cell
      this.clearShapeByOrigin(originCell);

      const block = new ShapeBlock(r1, c1, r2, c2, originCell);
      this.shapes.push(block);

      this.onBoardChange();

      if (this.checkVictory()) {
        this.winLevel();
      }
    }

    clearShapeByOrigin(originCell) {
      this.shapes = this.shapes.filter(s => s.origin.r !== originCell.r || s.origin.c !== originCell.c);
    }

    getNumberAt(r, c) {
      return this.numbers.find(n => n.r === r && n.c === c);
    }

    getShapeAt(r, c) {
      return this.shapes.find(s => s.contains(r, c));
    }

    checkVictory() {
      // 1. Every number must have exactly one valid shape representing it
      if (this.shapes.length !== this.numbers.length) return false;
      
      const allValid = this.shapes.every(s => s.valid);
      if (!allValid) return false;

      // 2. No overlaps: Shapes check logic guarantees no overlaps
      // 3. Grid Coverage: Total area of shapes must equal grid dimensions
      const totalGridCells = this.cols * this.rows;
      let coveredCells = 0;
      this.shapes.forEach(s => {
        coveredCells += (s.r2 - s.r1 + 1) * (s.c2 - s.c1 + 1);
      });

      return coveredCells === totalGridCells;
    }

    winLevel() {
      this.hasWon = true;
      clearInterval(this.timerInterval);

      const levelId = LEVELS[this.activeDiff][this.activeLevelIdx].id;

      // Progression
      if (this.unlockedLevels[this.activeDiff] === this.activeLevelIdx) {
        this.unlockedLevels[this.activeDiff] = Math.min(
          this.activeLevelIdx + 1,
          LEVELS[this.activeDiff].length - 1
        );
        localStorage.setItem('sb_unlocked_levels', JSON.stringify(this.unlockedLevels));
      }

      // Time score
      if (!this.bestTime[levelId] || this.elapsedSeconds < this.bestTime[levelId]) {
        this.bestTime[levelId] = this.elapsedSeconds;
        localStorage.setItem('sb_best_time', JSON.stringify(this.bestTime));
      }

      this.onVictory();
    }

    // Callbacks to bind
    onTimerTick() {}
    onBoardChange() {}
    onVictory() {}
  }

  // UI Renderer and Event Manager
  class GameUI {
    constructor(engine) {
      this.engine = engine;

      // Elements
      this.gridContainer = document.getElementById('grid-container');
      this.shapesCompleted = document.getElementById('shapes-completed');
      this.timerCounter = document.getElementById('timer-counter');
      this.levelSelect = document.getElementById('level-select');
      this.difficultyToggle = document.getElementById('difficulty-toggle');

      // Buttons
      this.resetBtn = document.getElementById('reset-level-btn');
      this.hintBtn = document.getElementById('hint-level-btn');

      // Modals
      this.victoryModal = document.getElementById('victory-modal');
      this.victoryShapes = document.getElementById('victory-shapes');
      this.victoryTime = document.getElementById('victory-time');
      this.nextLevelBtn = document.getElementById('next-level-btn');
      this.modalCloseBtn = document.getElementById('modal-close-btn');

      // Drag State trackers
      this.dragStart = null; // { r, c, originCell }
      this.dragCurrent = null; // { r, c }
      this.isDragging = false;
      this.dragOverlay = null; // DOM overlay div

      this.hintActive = false;

      this.init();
    }

    init() {
      // Toggle preset click listeners
      this.difficultyToggle.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          this.difficultyToggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          this.populateLevelsList(btn.dataset.diff);
          this.loadSelectedLevel();
        });
      });

      this.levelSelect.addEventListener('change', () => this.loadSelectedLevel());

      this.resetBtn.addEventListener('click', () => {
        this.engine.loadLevel(this.engine.activeDiff, this.engine.activeLevelIdx);
        this.renderBoard();
      });

      this.hintBtn.addEventListener('click', () => this.toggleHint());

      // Modals controls
      this.nextLevelBtn.addEventListener('click', () => {
        this.victoryModal.classList.remove('open');
        const nextIdx = this.engine.activeLevelIdx + 1;
        
        if (nextIdx < LEVELS[this.engine.activeDiff].length) {
          this.levelSelect.value = nextIdx;
          this.loadSelectedLevel();
        } else {
          this.levelSelect.value = 0;
          this.loadSelectedLevel();
        }
      });

      this.modalCloseBtn.addEventListener('click', () => {
        this.victoryModal.classList.remove('open');
      });

      // Bind callbacks
      this.engine.onTimerTick = () => {
        this.timerCounter.textContent = this.formatTime(this.engine.elapsedSeconds);
      };

      this.engine.onBoardChange = () => {
        this.shapesCompleted.textContent = `${this.engine.shapes.filter(s => s.valid).length} / ${this.engine.numbers.length}`;
        this.renderShapes();
      };

      this.engine.onVictory = () => {
        this.victoryShapes.textContent = `${this.engine.shapes.length} / ${this.engine.numbers.length}`;
        this.victoryTime.textContent = this.formatTime(this.engine.elapsedSeconds);
        this.victoryModal.classList.add('open');
      };

      // Drag event bindings
      this.gridContainer.addEventListener('mousedown', (e) => this.handleDragStart(e));
      window.addEventListener('mousemove', (e) => this.handleDragMove(e));
      window.addEventListener('mouseup', (e) => this.handleDragEnd(e));

      // Touch events support
      this.gridContainer.addEventListener('touchstart', (e) => this.handleDragStart(e));
      window.addEventListener('touchmove', (e) => this.handleDragMove(e));
      window.addEventListener('touchend', (e) => this.handleDragEnd(e));

      // Theme dots switcher
      document.querySelectorAll('.theme-picker button').forEach(btn => {
        btn.addEventListener('click', () => {
          document.body.className = '';
          document.body.classList.add(`theme-${btn.dataset.theme}`);
        });
      });

      // Initial loader
      this.populateLevelsList('easy');
      this.loadSelectedLevel();
    }

    populateLevelsList(diff) {
      this.levelSelect.innerHTML = '';
      const levels = LEVELS[diff];
      
      levels.forEach((lvl, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        
        const unlockedIdx = this.engine.unlockedLevels[diff];
        const isLocked = idx > unlockedIdx;
        option.textContent = `${lvl.name}${isLocked ? ' 🔒' : ''}`;
        
        this.levelSelect.appendChild(option);
      });
    }

    loadSelectedLevel() {
      const idx = parseInt(this.levelSelect.value) || 0;
      const diff = this.difficultyToggle.querySelector('.active').dataset.diff;
      
      this.hintActive = false;
      this.engine.loadLevel(diff, idx);
      this.timerCounter.textContent = '00:00';
      
      this.renderBoard();
    }

    renderBoard() {
      this.gridContainer.innerHTML = '';
      this.gridContainer.style.gridTemplateColumns = `repeat(${this.engine.cols}, 1fr)`;

      for (let r = 0; r < this.engine.rows; r++) {
        for (let c = 0; c < this.engine.cols; c++) {
          const cell = document.createElement('div');
          cell.className = 'grid-cell';
          cell.dataset.row = r;
          cell.dataset.col = c;

          const numCell = this.engine.getNumberAt(r, c);
          if (numCell) {
            cell.classList.add('number-cell');
            cell.textContent = numCell.val;
          }

          // Double click removal listener
          cell.addEventListener('dblclick', () => {
            const shape = this.engine.getShapeAt(r, c);
            if (shape) {
              this.engine.clearShapeByOrigin(shape.origin);
              this.engine.onBoardChange();
            }
          });

          this.gridContainer.appendChild(cell);
        }
      }

      this.renderShapes();
    }

    // Real-time Drag handler logic coordinates mapping
    handleDragStart(e) {
      if (this.engine.hasWon) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const target = document.elementFromPoint(clientX, clientY);
      if (!target || !target.classList.contains('grid-cell')) return;

      const r = parseInt(target.dataset.row);
      const c = parseInt(target.dataset.col);

      // Verify if starting cell contains a number or is already covered
      let originCell = this.engine.getNumberAt(r, c);
      
      // If clicked on an existing shape, reset/resize originating from that shape's origin
      if (!originCell) {
        const existing = this.engine.getShapeAt(r, c);
        if (existing) {
          originCell = existing.origin;
        }
      }

      if (originCell) {
        e.preventDefault(); // Prevent text highlights
        this.isDragging = true;
        this.dragStart = { r: originCell.r, c: originCell.c, originCell };
        this.dragCurrent = { r, c };

        // Create overlay container
        this.dragOverlay = document.createElement('div');
        this.dragOverlay.className = 'board-shape dragging';
        this.gridContainer.appendChild(this.dragOverlay);

        this.updateDragOverlay();
      }
    }

    handleDragMove(e) {
      if (!this.isDragging) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const target = document.elementFromPoint(clientX, clientY);
      if (!target || !target.classList.contains('grid-cell')) return;

      const r = parseInt(target.dataset.row);
      const c = parseInt(target.dataset.col);

      if (this.dragCurrent.r !== r || this.dragCurrent.c !== c) {
        this.dragCurrent = { r, c };
        this.updateDragOverlay();
      }
    }

    handleDragEnd() {
      if (!this.isDragging) return;
      this.isDragging = false;

      // Extract coordinates
      const r1 = this.dragStart.r;
      const c1 = this.dragStart.c;
      const r2 = this.dragCurrent.r;
      const c2 = this.dragCurrent.c;

      // Remove DOM overlays
      if (this.dragOverlay) {
        this.dragOverlay.remove();
        this.dragOverlay = null;
      }

      // Add shape state to board
      this.engine.addShape(r1, c1, r2, c2, this.dragStart.originCell);
    }

    updateDragOverlay() {
      if (!this.dragOverlay) return;

      const bounds = this.getCellsBounds(
        this.dragStart.r,
        this.dragStart.c,
        this.dragCurrent.r,
        this.dragCurrent.c
      );

      this.dragOverlay.style.left = `${bounds.left}px`;
      this.dragOverlay.style.top = `${bounds.top}px`;
      this.dragOverlay.style.width = `${bounds.width}px`;
      this.dragOverlay.style.height = `${bounds.height}px`;
    }

    // Geometry dimension offset mapper
    getCellsBounds(r1, c1, r2, c2) {
      const minR = Math.min(r1, r2);
      const maxR = Math.max(r1, r2);
      const minC = Math.min(c1, c2);
      const maxC = Math.max(c1, c2);

      const cell1 = this.getCellDOM(minR, minC);
      const cell2 = this.getCellDOM(maxR, maxC);

      if (!cell1 || !cell2) return { left: 0, top: 0, width: 0, height: 0 };

      const gridRect = this.gridContainer.getBoundingClientRect();
      const rect1 = cell1.getBoundingClientRect();
      const rect2 = cell2.getBoundingClientRect();

      return {
        left: rect1.left - gridRect.left,
        top: rect1.top - gridRect.top,
        width: rect2.right - rect1.left,
        height: rect2.bottom - rect1.top
      };
    }

    getCellDOM(r, c) {
      return this.gridContainer.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
    }

    renderShapes() {
      // Clear previously drawn overlays
      this.gridContainer.querySelectorAll('.board-shape:not(.dragging)').forEach(el => el.remove());

      this.engine.shapes.forEach(shape => {
        const bounds = this.getCellsBounds(shape.r1, shape.c1, shape.r2, shape.c2);
        
        const shapeDiv = document.createElement('div');
        shapeDiv.className = `board-shape ${shape.valid ? 'valid' : 'invalid'}`;
        shapeDiv.style.left = `${bounds.left}px`;
        shapeDiv.style.top = `${bounds.top}px`;
        shapeDiv.style.width = `${bounds.width}px`;
        shapeDiv.style.height = `${bounds.height}px`;

        this.gridContainer.appendChild(shapeDiv);
      });
    }

    toggleHint() {
      if (this.engine.hasWon) return;
      this.hintActive = !this.hintActive;

      // Clear hints
      this.gridContainer.querySelectorAll('.board-shape.hint').forEach(el => el.remove());

      if (this.hintActive) {
        this.hintBtn.classList.add('active');
        const lvl = LEVELS[this.engine.activeDiff][this.engine.activeLevelIdx];
        
        lvl.solution.forEach(sol => {
          const bounds = this.getCellsBounds(sol.r1, sol.c1, sol.r2, sol.c2);
          const hintDiv = document.createElement('div');
          hintDiv.className = 'board-shape hint';
          hintDiv.style.left = `${bounds.left}px`;
          hintDiv.style.top = `${bounds.top}px`;
          hintDiv.style.width = `${bounds.width}px`;
          hintDiv.style.height = `${bounds.height}px`;

          this.gridContainer.appendChild(hintDiv);
        });
      } else {
        this.hintBtn.classList.remove('active');
      }
    }

    formatTime(totalSecs) {
      const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
      const secs = (totalSecs % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    }
  }

  // Ignite Engine
  const engine = new PuzzleBoard();
  new GameUI(engine);
});
