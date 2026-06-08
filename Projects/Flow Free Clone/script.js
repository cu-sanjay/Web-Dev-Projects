document.addEventListener('DOMContentLoaded', () => {
  // Level Preset Layouts
  // Colors code dictionary mapping: red, blue, green, orange, yellow, magenta, cyan
  const LEVELS = {
    "5": [
      {
        id: "5-1",
        name: "Intro Loops",
        size: 5,
        dots: [
          { r: 0, c: 0, color: '#ef4444' }, // Red Pair
          { r: 4, c: 0, color: '#ef4444' },
          
          { r: 0, c: 2, color: '#3b82f6' }, // Blue Pair
          { r: 3, c: 3, color: '#3b82f6' },
          
          { r: 1, c: 1, color: '#10b981' }, // Green Pair
          { r: 2, c: 4, color: '#10b981' },
          
          { r: 2, c: 2, color: '#f59e0b' }, // Yellow Pair
          { r: 4, c: 3, color: '#f59e0b' }
        ]
      },
      {
        id: "5-2",
        name: "Squeeze Grid",
        size: 5,
        dots: [
          { r: 0, c: 1, color: '#ef4444' }, { r: 3, c: 2, color: '#ef4444' },
          { r: 1, c: 0, color: '#3b82f6' }, { r: 4, c: 1, color: '#3b82f6' },
          { r: 2, c: 3, color: '#10b981' }, { r: 4, c: 3, color: '#10b981' },
          { r: 0, c: 4, color: '#ec4899' }, { r: 3, c: 4, color: '#ec4899' }
        ]
      }
    ],
    "6": [
      {
        id: "6-1",
        name: "Hex Spiral",
        size: 6,
        dots: [
          { r: 0, c: 0, color: '#ef4444' }, { r: 5, c: 5, color: '#ef4444' },
          { r: 1, c: 1, color: '#3b82f6' }, { r: 4, c: 4, color: '#3b82f6' },
          { r: 2, c: 2, color: '#10b981' }, { r: 3, c: 3, color: '#10b981' },
          { r: 0, c: 5, color: '#f59e0b' }, { r: 5, c: 0, color: '#f59e0b' }
        ]
      }
    ],
    "7": [
      {
        id: "7-1",
        name: "Classic Overpass",
        size: 7,
        dots: [
          { r: 0, c: 0, color: '#ef4444' }, { r: 6, c: 6, color: '#ef4444' },
          { r: 1, c: 1, color: '#3b82f6' }, { r: 5, c: 5, color: '#3b82f6' },
          { r: 2, c: 2, color: '#10b981' }, { r: 4, c: 4, color: '#10b981' },
          { r: 0, c: 6, color: '#f59e0b' }, { r: 6, c: 0, color: '#f59e0b' },
          { r: 3, c: 0, color: '#ec4899' }, { r: 3, c: 6, color: '#ec4899' }
        ]
      }
    ]
  };

  // OOP Individual Color Flow Path model
  class FlowPath {
    constructor(color) {
      this.color = color;
      this.points = []; // Array of coordinates: [{ r, c }]
      this.isCompleted = false;
    }

    addPoint(r, c) {
      this.points.push({ r, c });
    }

    contains(r, c) {
      return this.points.some(p => p.r === r && p.c === c);
    }

    indexOf(r, c) {
      return this.points.findIndex(p => p.r === r && p.c === c);
    }

    truncate(index) {
      this.points = this.points.slice(0, index + 1);
      this.isCompleted = false;
    }

    clear() {
      this.points = [];
      this.isCompleted = false;
    }
  }

  // OOP Puzzle Board State Manager
  class PuzzleBoard {
    constructor() {
      this.activeSize = 5;
      this.activeLevelIdx = 0;

      this.dots = [];
      this.paths = {}; // Map of color values to FlowPath objects
      
      this.elapsedSeconds = 0;
      this.timerInterval = null;
      this.hasWon = false;

      // Local storage states
      this.unlockedLevels = JSON.parse(localStorage.getItem('ff_unlocked_levels')) || {
        "5": 0,
        "6": 0,
        "7": 0
      };
      this.bestTime = JSON.parse(localStorage.getItem('ff_best_time')) || {};
    }

    loadLevel(size, idx) {
      this.activeSize = size;
      this.activeLevelIdx = idx;

      const lvl = LEVELS[size][idx];
      this.dots = lvl.dots.map(d => ({ ...d }));
      
      // Initialize empty path models for each unique color dot pair
      this.paths = {};
      this.dots.forEach(dot => {
        if (!this.paths[dot.color]) {
          this.paths[dot.color] = new FlowPath(dot.color);
        }
      });

      this.elapsedSeconds = 0;
      this.hasWon = false;

      this.startTimer();
      this.onBoardStateChange();
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

    getDotAt(r, c) {
      return this.dots.find(d => d.r === r && d.c === c);
    }

    // Handles path drawing start
    beginDrawing(r, c, color) {
      const path = this.paths[color];
      if (!path) return;

      // Clear any existing path of this color
      path.clear();
      path.addPoint(r, c);
      
      this.onBoardStateChange();
    }

    extendDrawing(r, c, color) {
      const path = this.paths[color];
      if (!path || path.isCompleted || path.points.length === 0) return;

      const last = path.points[path.points.length - 1];

      // Check adjacency
      const isAdjacent = (Math.abs(last.r - r) + Math.abs(last.c - c) === 1);
      if (!isAdjacent) return;

      const crossedIndex = path.indexOf(r, c);
      if (crossedIndex !== -1) {
        // Truncate path if backtracking
        path.truncate(crossedIndex);
        this.onBoardStateChange();
        return;
      }

      // Check collision/cross paths with different colors
      this.handlePathCrossing(r, c, color);

      // Check if coordinate is a dot
      const targetDot = this.getDotAt(r, c);
      if (targetDot) {
        if (targetDot.color === color) {
          // Connected matching dots successfully
          path.addPoint(r, c);
          path.isCompleted = true;
          this.onBoardStateChange();
          this.checkVictory();
        }
        return; // End path when hitting any dot
      }

      // Append standard path point
      path.addPoint(r, c);
      this.onBoardStateChange();
    }

    handlePathCrossing(r, c, currentColor) {
      Object.keys(this.paths).forEach(color => {
        if (color !== currentColor) {
          const otherPath = this.paths[color];
          const crossIndex = otherPath.indexOf(r, c);
          
          if (crossIndex !== -1) {
            // Break and truncate the crossed path
            otherPath.truncate(crossIndex);
            
            // If the crossed index was the origin dot itself, clear the path completely
            const originDot = otherPath.points[0];
            const targetDot = this.getDotAt(r, c);
            if (targetDot && targetDot.color === color) {
              otherPath.clear();
            }
          }
        }
      });
    }

    clearAllPaths() {
      Object.keys(this.paths).forEach(color => this.paths[color].clear());
      this.onBoardStateChange();
    }

    calculateCoverage() {
      const totalCells = this.activeSize * this.activeSize;
      const occupied = new Set();

      // Add dot positions to coverage occupied set
      this.dots.forEach(d => occupied.add(`${d.r},${d.c}`));

      // Add path points to coverage occupied set
      Object.keys(this.paths).forEach(color => {
        this.paths[color].points.forEach(p => occupied.add(`${p.r},${p.c}`));
      });

      return Math.round((occupied.size / totalCells) * 100);
    }

    checkVictory() {
      // 1. All paths completed
      const allPathsConnected = Object.keys(this.paths).every(color => this.paths[color].isCompleted);
      if (!allPathsConnected) return false;

      // 2. 100% board fill coverage completed
      const coverage = this.calculateCoverage();
      if (coverage < 100) return false;

      this.winLevel();
      return true;
    }

    winLevel() {
      this.hasWon = true;
      clearInterval(this.timerInterval);

      const levelId = LEVELS[this.activeSize][this.activeLevelIdx].id;

      // Lock records
      if (this.unlockedLevels[this.activeSize] === this.activeLevelIdx) {
        this.unlockedLevels[this.activeSize] = Math.min(
          this.activeLevelIdx + 1,
          LEVELS[this.activeSize].length - 1
        );
        localStorage.setItem('ff_unlocked_levels', JSON.stringify(this.unlockedLevels));
      }

      // Best time
      if (!this.bestTime[levelId] || this.elapsedSeconds < this.bestTime[levelId]) {
        this.bestTime[levelId] = this.elapsedSeconds;
        localStorage.setItem('ff_best_time', JSON.stringify(this.bestTime));
      }

      this.onVictory();
    }

    // Callbacks to bind
    onTimerTick() {}
    onBoardStateChange() {}
    onVictory() {}
  }

  // UI Renderer and Touch/Mouse Controller
  class GameUI {
    constructor(engine) {
      this.engine = engine;

      // DOM Elements
      this.gridContainer = document.getElementById('grid-container');
      this.flowsCount = document.getElementById('flows-count');
      this.coveragePercentage = document.getElementById('coverage-percentage');
      this.timerCounter = document.getElementById('timer-counter');
      this.levelSelect = document.getElementById('level-select');
      this.sizeToggle = document.getElementById('size-toggle');

      // Overlay SVG lines group
      this.linesOverlay = document.getElementById('lines-overlay');
      this.pathsGroup = document.getElementById('paths-group');
      
      // Control buttons
      this.resetBtn = document.getElementById('reset-level-btn');
      this.clearPathsBtn = document.getElementById('clear-paths-btn');

      // Victory Modals
      this.victoryModal = document.getElementById('victory-modal');
      this.victoryFlows = document.getElementById('victory-flows');
      this.victoryTime = document.getElementById('victory-time');
      this.nextLevelBtn = document.getElementById('next-level-btn');
      this.modalCloseBtn = document.getElementById('modal-close-btn');

      // Interaction State
      this.isDrawing = false;
      this.activeColor = null;

      this.init();
    }

    init() {
      // Toggle button size selections
      this.sizeToggle.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          this.sizeToggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          this.populateLevelsList(btn.dataset.size);
          this.loadSelectedLevel();
        });
      });

      this.levelSelect.addEventListener('change', () => this.loadSelectedLevel());

      this.resetBtn.addEventListener('click', () => {
        this.engine.loadLevel(this.engine.activeSize, this.engine.activeLevelIdx);
        this.renderBoard();
      });

      this.clearPathsBtn.addEventListener('click', () => {
        this.engine.clearAllPaths();
      });

      // Modals
      this.nextLevelBtn.addEventListener('click', () => {
        this.victoryModal.classList.remove('open');
        const nextIdx = this.engine.activeLevelIdx + 1;
        
        if (nextIdx < LEVELS[this.engine.activeSize].length) {
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

      // Bind Engine Callbacks
      this.engine.onTimerTick = () => {
        this.timerCounter.textContent = this.formatTime(this.engine.elapsedSeconds);
      };

      this.engine.onBoardStateChange = () => {
        const completedFlows = Object.keys(this.engine.paths).filter(c => this.engine.paths[c].isCompleted).length;
        const totalFlows = Object.keys(this.engine.paths).length;
        
        this.flowsCount.textContent = `${completedFlows} / ${totalFlows}`;
        this.coveragePercentage.textContent = `${this.engine.calculateCoverage()}%`;
        this.renderPathLines();
      };

      this.engine.onVictory = () => {
        const totalFlows = Object.keys(this.engine.paths).length;
        this.victoryFlows.textContent = `${totalFlows} / ${totalFlows}`;
        this.victoryTime.textContent = this.formatTime(this.engine.elapsedSeconds);
        this.victoryModal.classList.add('open');
      };

      // Mouse drag event triggers
      this.gridContainer.addEventListener('mousedown', (e) => this.handleDragStart(e));
      window.addEventListener('mousemove', (e) => this.handleDragMove(e));
      window.addEventListener('mouseup', () => this.handleDragEnd());

      // Touch events support
      this.gridContainer.addEventListener('touchstart', (e) => this.handleDragStart(e));
      window.addEventListener('touchmove', (e) => this.handleDragMove(e));
      window.addEventListener('touchend', () => this.handleDragEnd());

      // Theme toggle dot triggers overrides
      document.querySelectorAll('.theme-picker button').forEach(btn => {
        btn.addEventListener('click', () => {
          document.body.className = '';
          document.body.classList.add(`theme-${btn.dataset.theme}`);
        });
      });

      // Initial loads
      this.populateLevelsList('5');
      this.loadSelectedLevel();
    }

    populateLevelsList(size) {
      this.levelSelect.innerHTML = '';
      const levels = LEVELS[size];
      
      levels.forEach((lvl, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        
        const unlockedIdx = this.engine.unlockedLevels[size];
        const isLocked = idx > unlockedIdx;
        option.textContent = `${lvl.name}${isLocked ? ' 🔒' : ''}`;
        
        this.levelSelect.appendChild(option);
      });
    }

    loadSelectedLevel() {
      const idx = parseInt(this.levelSelect.value) || 0;
      const size = this.sizeToggle.querySelector('.active').dataset.size;
      
      this.engine.loadLevel(size, idx);
      this.timerCounter.textContent = '00:00';
      
      this.renderBoard();
    }

    renderBoard() {
      this.gridContainer.innerHTML = '';
      this.gridContainer.style.gridTemplateColumns = `repeat(${this.engine.activeSize}, 1fr)`;

      for (let r = 0; r < this.engine.activeSize; r++) {
        for (let c = 0; c < this.engine.activeSize; c++) {
          const cell = document.createElement('div');
          cell.className = 'grid-cell';
          cell.dataset.row = r;
          cell.dataset.col = c;

          const dot = this.engine.getDotAt(r, c);
          if (dot) {
            const dotDiv = document.createElement('div');
            dotDiv.className = 'dot';
            dotDiv.style.backgroundColor = dot.color;
            dotDiv.style.boxShadow = `0 0 12px ${dot.color}`;
            cell.appendChild(dotDiv);
          }

          this.gridContainer.appendChild(cell);
        }
      }

      this.renderPathLines();
    }

    // Touch/Mouse coordinate tracking drag systems
    handleDragStart(e) {
      if (this.engine.hasWon) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const target = document.elementFromPoint(clientX, clientY);
      if (!target || !target.classList.contains('grid-cell')) return;

      const r = parseInt(target.dataset.row);
      const c = parseInt(target.dataset.col);

      // Verify if starting coordinate contains a dot
      const dot = this.engine.getDotAt(r, c);
      if (dot) {
        e.preventDefault();
        this.isDrawing = true;
        this.activeColor = dot.color;
        this.engine.beginDrawing(r, c, dot.color);
      }
    }

    handleDragMove(e) {
      if (!this.isDrawing) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const target = document.elementFromPoint(clientX, clientY);
      if (!target || !target.classList.contains('grid-cell')) return;

      const r = parseInt(target.dataset.row);
      const c = parseInt(target.dataset.col);

      this.engine.extendDrawing(r, c, this.activeColor);
    }

    handleDragEnd() {
      this.isDrawing = false;
      this.activeColor = null;
    }

    renderPathLines() {
      this.pathsGroup.innerHTML = '';
      
      Object.keys(this.engine.paths).forEach(color => {
        const path = this.engine.paths[color];
        if (path.points.length < 2) return;

        let dPath = "";
        path.points.forEach((p, idx) => {
          const center = this.getCellCenter(p.r, p.c);
          
          if (idx === 0) {
            dPath += `M ${center.x} ${center.y}`;
          } else {
            dPath += ` L ${center.x} ${center.y}`;
          }
        });

        const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        svgPath.setAttribute('d', dPath);
        svgPath.setAttribute('stroke', color);
        svgPath.style.setProperty('--line-glow-color', color);
        
        if (path.isCompleted) {
          svgPath.setAttribute('class', 'completed');
        }

        this.pathsGroup.appendChild(svgPath);
      });
    }

    // Geometry center offset calculators
    getCellCenter(r, c) {
      const cell = this.gridContainer.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
      if (!cell) return { x: 0, y: 0 };

      const gridRect = this.gridContainer.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();

      return {
        x: (cellRect.left + cellRect.width / 2) - gridRect.left,
        y: (cellRect.top + cellRect.height / 2) - gridRect.top
      };
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
