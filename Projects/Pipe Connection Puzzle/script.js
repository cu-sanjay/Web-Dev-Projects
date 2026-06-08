document.addEventListener('DOMContentLoaded', () => {
  // Handcrafted Game Maps Presets
  const LEVELS = {
    easy: [
      {
        id: "easy-1",
        name: "First Joint",
        cols: 4,
        rows: 4,
        grid: [
          // Types: 'I' (straight), 'L' (elbow), 'T' (three-way), '+' (cross), 'E' (endpoint)
          // connections order: [Top, Right, Bottom, Left] -> 1 (connected), 0 (disconnected)
          // initialRotation: 0 (0°), 1 (90°), 2 (180°), 3 (270°)
          { type: 'E', connections: [0, 1, 0, 0], id: 1, initialRotation: 1 },
          { type: 'I', connections: [0, 1, 0, 1], id: null, initialRotation: 0 },
          { type: 'L', connections: [0, 1, 1, 0], id: null, initialRotation: 2 },
          { type: 'E', connections: [0, 0, 1, 0], id: 2, initialRotation: 2 },
          
          { type: 'I', connections: [1, 0, 1, 0], id: null, initialRotation: 1 },
          { type: 'L', connections: [1, 1, 0, 0], id: null, initialRotation: 0 },
          { type: 'T', connections: [1, 1, 1, 0], id: null, initialRotation: 3 },
          { type: 'I', connections: [1, 0, 1, 0], id: null, initialRotation: 1 },
          
          { type: 'L', connections: [0, 0, 1, 1], id: null, initialRotation: 2 },
          { type: 'T', connections: [0, 1, 1, 1], id: null, initialRotation: 1 },
          { type: 'L', connections: [1, 0, 0, 1], id: null, initialRotation: 3 },
          { type: 'L', connections: [0, 1, 1, 0], id: null, initialRotation: 0 },
          
          { type: 'E', connections: [1, 0, 0, 0], id: 3, initialRotation: 0 },
          { type: 'I', connections: [0, 1, 0, 1], id: null, initialRotation: 1 },
          { type: 'E', connections: [0, 0, 0, 1], id: 4, initialRotation: 3 },
          { type: 'E', connections: [1, 0, 0, 0], id: 5, initialRotation: 0 }
        ]
      },
      {
        id: "easy-2",
        name: "Loop Grid",
        cols: 4,
        rows: 4,
        grid: [
          { type: 'E', connections: [0, 1, 0, 0], id: 1, initialRotation: 1 },
          { type: 'L', connections: [0, 1, 1, 0], id: null, initialRotation: 1 },
          { type: 'I', connections: [0, 1, 0, 1], id: null, initialRotation: 0 },
          { type: 'E', connections: [0, 0, 1, 0], id: 2, initialRotation: 2 },

          { type: 'I', connections: [1, 0, 1, 0], id: null, initialRotation: 1 },
          { type: 'L', connections: [1, 0, 0, 1], id: null, initialRotation: 3 },
          { type: 'L', connections: [0, 1, 1, 0], id: null, initialRotation: 0 },
          { type: 'I', connections: [1, 0, 1, 0], id: null, initialRotation: 1 },

          { type: 'L', connections: [1, 1, 0, 0], id: null, initialRotation: 2 },
          { type: 'I', connections: [0, 1, 0, 1], id: null, initialRotation: 0 },
          { type: 'T', connections: [1, 1, 1, 0], id: null, initialRotation: 1 },
          { type: 'L', connections: [0, 0, 1, 1], id: null, initialRotation: 3 },

          { type: 'E', connections: [1, 0, 0, 0], id: 3, initialRotation: 0 },
          { type: 'I', connections: [0, 1, 0, 1], id: null, initialRotation: 1 },
          { type: 'E', connections: [0, 0, 0, 1], id: 4, initialRotation: 3 },
          { type: 'E', connections: [1, 0, 0, 0], id: 5, initialRotation: 0 }
        ]
      }
    ],
    medium: [
      {
        id: "medium-1",
        name: "Hex Valve",
        cols: 6,
        rows: 6,
        grid: Array.from({ length: 36 }, (_, i) => {
          // Construct 6x6 programmatically with endpoints at borders
          const isEndpoint = i === 0 || i === 5 || i === 30 || i === 35;
          const type = isEndpoint ? 'E' : (i % 3 === 0 ? 'T' : (i % 2 === 0 ? 'L' : 'I'));
          const conns = type === 'E' ? [0, 1, 0, 0] : (type === 'I' ? [1, 0, 1, 0] : [1, 1, 0, 0]);
          return {
            type,
            connections: conns,
            id: isEndpoint ? i + 1 : null,
            initialRotation: Math.floor(Math.random() * 4)
          };
        })
      }
    ],
    hard: [
      {
        id: "hard-1",
        name: "Matrix Nexus",
        cols: 8,
        rows: 8,
        grid: Array.from({ length: 64 }, (_, i) => {
          const isEndpoint = i === 0 || i === 7 || i === 56 || i === 63;
          const type = isEndpoint ? 'E' : (i % 4 === 0 ? '+' : (i % 3 === 0 ? 'T' : (i % 2 === 0 ? 'L' : 'I')));
          const conns = type === '+' ? [1,1,1,1] : (type === 'E' ? [0, 1, 0, 0] : [1, 1, 0, 0]);
          return {
            type,
            connections: conns,
            id: isEndpoint ? i + 1 : null,
            initialRotation: Math.floor(Math.random() * 4)
          };
        })
      }
    ]
  };

  // OOP Pipe Piece representation class
  class PipePiece {
    constructor(data, index) {
      this.type = data.type; // 'I', 'L', 'T', '+', 'E'
      this.baseConnections = [...data.connections]; // original [T, R, B, L]
      this.connections = [...data.connections]; // rotated [T, R, B, L]
      this.id = data.id; // endpoint numbered id
      this.index = index;
      
      // Rotation state
      this.rotation = 0; // 0=0°, 1=90°, 2=180°, 3=270°
      this.rotate(data.initialRotation || 0);

      this.connected = false; // Flow state
    }

    rotate(steps = 1) {
      this.rotation = (this.rotation + steps) % 4;
      
      // Shift connections array elements circularly to the right
      for (let s = 0; s < steps; s++) {
        const last = this.connections.pop();
        this.connections.unshift(last);
      }
    }

    resetRotation() {
      this.connections = [...this.baseConnections];
      this.rotation = 0;
    }
  }

  // OOP Puzzle Grid state manager
  class PuzzleGrid {
    constructor() {
      this.activeDiff = 'easy';
      this.activeLevelIdx = 0;

      this.cols = 4;
      this.rows = 4;
      this.pieces = [];

      this.moves = 0;
      this.elapsedSeconds = 0;
      this.timerInterval = null;
      this.hasWon = false;

      // Stats
      this.bestMoves = JSON.parse(localStorage.getItem('pcp_best_moves')) || {};
      this.bestTime = JSON.parse(localStorage.getItem('pcp_best_time')) || {};
      this.unlockedLevels = JSON.parse(localStorage.getItem('pcp_unlocked_levels')) || {
        easy: 0,
        medium: 0,
        hard: 0
      };
    }

    loadLevel(diff, idx) {
      this.activeDiff = diff;
      this.activeLevelIdx = idx;
      
      const lvl = LEVELS[diff][idx];
      this.cols = lvl.cols;
      this.rows = lvl.rows;
      this.pieces = lvl.grid.map((pData, index) => new PipePiece(pData, index));

      this.moves = 0;
      this.elapsedSeconds = 0;
      this.hasWon = false;

      this.startTimer();
      this.solveConnectivity();
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

    rotatePiece(index) {
      if (this.hasWon) return;

      const piece = this.pieces[index];
      if (piece) {
        piece.rotate(1);
        this.moves++;
        this.solveConnectivity();
        this.onGridStateChange();

        // Check victory status
        if (this.checkVictory()) {
          this.winLevel();
        }
      }
    }

    // Solve water flow connectivity using Depth-First Search (DFS)
    solveConnectivity() {
      // Clear connected state
      this.pieces.forEach(p => p.connected = false);

      // Find all sources (Endpoints)
      const sources = this.pieces.filter(p => p.type === 'E');
      if (sources.length === 0) return;

      const visited = new Set();

      const dfs = (index) => {
        visited.add(index);
        const piece = this.pieces[index];
        piece.connected = true;

        const row = Math.floor(index / this.cols);
        const col = index % this.cols;

        // Neighbor alignments mapping: [Top, Right, Bottom, Left]
        const directions = [
          { r: -1, c: 0, fromDir: 2, toDir: 0 }, // Up (needs Top con on current, Bottom con on target)
          { r: 0, c: 1, fromDir: 3, toDir: 1 },  // Right
          { r: 1, c: 0, fromDir: 0, toDir: 2 },  // Down
          { r: 0, c: -1, fromDir: 1, toDir: 3 }  // Left
        ];

        directions.forEach((dir, dirIdx) => {
          // If current piece has a connection opening in this direction
          if (piece.connections[dirIdx] === 1) {
            const nextRow = row + dir.r;
            const nextCol = col + dir.c;

            if (nextRow >= 0 && nextRow < this.rows && nextCol >= 0 && nextCol < this.cols) {
              const nextIndex = nextRow * this.cols + nextCol;
              const neighbor = this.pieces[nextIndex];

              // If neighbor exists, has matching connection facing current, and not visited
              if (neighbor && neighbor.connections[dir.fromDir] === 1 && !visited.has(nextIndex)) {
                dfs(nextIndex);
              }
            }
          }
        });
      };

      // Start DFS from the first endpoint source
      if (sources[0]) {
        dfs(sources[0].index);
      }
    }

    checkVictory() {
      // 1. All endpoints must be connected to the flow network
      const endpoints = this.pieces.filter(p => p.type === 'E');
      const allEndpointsConnected = endpoints.every(p => p.connected);

      if (!allEndpointsConnected) return false;

      // 2. Ensure zero leak connections (No active connectors pointing to empty borders or disconnected pieces)
      for (let index = 0; index < this.pieces.length; index++) {
        const piece = this.pieces[index];
        const row = Math.floor(index / this.cols);
        const col = index % this.cols;

        // Neighbor check directions
        const checkDirs = [
          { r: -1, c: 0, opp: 2 }, // Top
          { r: 0, c: 1, opp: 3 },  // Right
          { r: 1, c: 0, opp: 0 },  // Bottom
          { r: 0, c: -1, opp: 1 }  // Left
        ];

        for (let d = 0; d < 4; d++) {
          if (piece.connections[d] === 1) {
            const nextRow = row + checkDirs[d].r;
            const nextCol = col + checkDirs[d].c;

            // Border Leak
            if (nextRow < 0 || nextRow >= this.rows || nextCol < 0 || nextCol >= this.cols) {
              return false;
            }

            // Unmatched connector Leak
            const neighbor = this.pieces[nextRow * this.cols + nextCol];
            if (!neighbor || neighbor.connections[checkDirs[d].opp] !== 1) {
              return false;
            }
          }
        }
      }

      return true;
    }

    winLevel() {
      this.hasWon = true;
      clearInterval(this.timerInterval);

      const levelId = LEVELS[this.activeDiff][this.activeLevelIdx].id;

      // Lock unlocked records
      if (this.unlockedLevels[this.activeDiff] === this.activeLevelIdx) {
        this.unlockedLevels[this.activeDiff] = Math.min(
          this.activeLevelIdx + 1,
          LEVELS[this.activeDiff].length - 1
        );
        localStorage.setItem('pcp_unlocked_levels', JSON.stringify(this.unlockedLevels));
      }

      // Record best metrics
      if (!this.bestMoves[levelId] || this.moves < this.bestMoves[levelId]) {
        this.bestMoves[levelId] = this.moves;
        localStorage.setItem('pcp_best_moves', JSON.stringify(this.bestMoves));
      }

      if (!this.bestTime[levelId] || this.elapsedSeconds < this.bestTime[levelId]) {
        this.bestTime[levelId] = this.elapsedSeconds;
        localStorage.setItem('pcp_best_time', JSON.stringify(this.bestTime));
      }

      this.onVictory();
    }

    // Callbacks to be bound by UI Controller
    onTimerTick() {}
    onGridStateChange() {}
    onVictory() {}
  }

  // UI Renderer & Interaction Controller
  class GameUI {
    constructor(engine) {
      this.engine = engine;

      // DOM Elements
      this.gridContainer = document.getElementById('grid-container');
      this.movesCounter = document.getElementById('moves-counter');
      this.timerCounter = document.getElementById('timer-counter');
      this.levelSelect = document.getElementById('level-select');
      this.difficultyToggle = document.getElementById('difficulty-toggle');
      
      // Control buttons
      this.resetBtn = document.getElementById('reset-level-btn');
      this.shuffleBtn = document.getElementById('shuffle-level-btn');

      // Modals
      this.victoryModal = document.getElementById('victory-modal');
      this.victoryMoves = document.getElementById('victory-moves');
      this.victoryTime = document.getElementById('victory-time');
      this.nextLevelBtn = document.getElementById('next-level-btn');
      this.modalCloseBtn = document.getElementById('modal-close-btn');

      this.init();
    }

    init() {
      // Bind controls listeners
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
        this.renderGrid();
      });

      this.shuffleBtn.addEventListener('click', () => {
        // Shuffle rotations randomly
        this.engine.pieces.forEach(p => p.rotate(Math.floor(Math.random() * 4)));
        this.engine.moves = 0;
        this.engine.solveConnectivity();
        this.renderGrid();
      });

      // Modals actions
      this.nextLevelBtn.addEventListener('click', () => {
        this.victoryModal.classList.remove('open');
        const nextIdx = this.engine.activeLevelIdx + 1;
        
        if (nextIdx < LEVELS[this.engine.activeDiff].length) {
          this.levelSelect.value = nextIdx;
          this.loadSelectedLevel();
        } else {
          // Loop difficulty or reset
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

      this.engine.onGridStateChange = () => {
        this.movesCounter.textContent = this.engine.moves;
        this.updatePipesFlow();
      };

      this.engine.onVictory = () => {
        this.victoryMoves.textContent = this.engine.moves;
        this.victoryTime.textContent = this.formatTime(this.engine.elapsedSeconds);
        this.victoryModal.classList.add('open');
        this.updatePipesFlow();
      };

      // Load initial state
      this.populateLevelsList('easy');
      this.loadSelectedLevel();
    }

    populateLevelsList(diff) {
      this.levelSelect.innerHTML = '';
      const levels = LEVELS[diff];
      
      levels.forEach((lvl, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        
        // Show locks check status
        const unlockedIdx = this.engine.unlockedLevels[diff];
        const isLocked = idx > unlockedIdx;
        option.textContent = `${lvl.name}${isLocked ? ' 🔒' : ''}`;
        
        this.levelSelect.appendChild(option);
      });
    }

    loadSelectedLevel() {
      const idx = parseInt(this.levelSelect.value) || 0;
      const diff = this.difficultyToggle.querySelector('.active').dataset.diff;
      
      this.engine.loadLevel(diff, idx);
      this.movesCounter.textContent = '0';
      this.timerCounter.textContent = '00:00';
      
      this.renderGrid();
    }

    renderGrid() {
      this.gridContainer.innerHTML = '';
      this.gridContainer.style.gridTemplateColumns = `repeat(${this.engine.cols}, 1fr)`;

      this.engine.pieces.forEach((piece, index) => {
        const tile = document.createElement('div');
        tile.className = 'pipe-tile';
        tile.id = `tile-${index}`;
        tile.style.transform = `rotate(${piece.rotation * 90}deg)`;

        // Setup SVG Pipe markup representing the connectors
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('class', 'pipe-svg');
        svg.setAttribute('viewBox', '0 0 100 100');

        // Draw connections
        this.drawPipeConnections(svg, piece);

        tile.appendChild(svg);
        tile.addEventListener('click', () => {
          this.engine.rotatePiece(index);
          // Apply transformation rotation visually
          tile.style.transform = `rotate(${piece.rotation * 90}deg)`;
        });

        this.gridContainer.appendChild(tile);
      });

      this.updatePipesFlow();
    }

    drawPipeConnections(svg, piece) {
      const paths = [];

      switch (piece.type) {
        case 'I': // Straight [Top to Bottom]
          paths.push({ d: 'M 50 0 L 50 100' });
          break;
        case 'L': // Elbow [Top to Right]
          paths.push({ d: 'M 50 0 Q 50 50 100 50' });
          break;
        case 'T': // Three-way [Left, Right, Bottom]
          paths.push({ d: 'M 0 50 L 100 50' });
          paths.push({ d: 'M 50 50 L 50 100' });
          break;
        case '+': // Cross [All directions]
          paths.push({ d: 'M 0 50 L 100 50' });
          paths.push({ d: 'M 50 0 L 50 100' });
          break;
        case 'E': // Endpoint connector
          paths.push({ d: 'M 50 50 L 50 0' });
          
          // Draw endpoint node
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute('cx', '50');
          circle.setAttribute('cy', '50');
          circle.setAttribute('r', '16');
          circle.setAttribute('fill', 'var(--energy-idle)');
          circle.setAttribute('class', 'pipe-endpoint-node');
          svg.appendChild(circle);

          if (piece.id) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute('x', '50');
            text.setAttribute('y', '51');
            text.setAttribute('class', 'pipe-endpoint-text');
            text.textContent = piece.id;
            svg.appendChild(text);
          }
          break;
      }

      paths.forEach(pData => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute('d', pData.d);
        path.setAttribute('class', 'pipe-line');
        svg.appendChild(path);
      });
    }

    updatePipesFlow() {
      this.engine.pieces.forEach((piece, index) => {
        const tile = document.getElementById(`tile-${index}`);
        if (!tile) return;

        const lines = tile.querySelectorAll('.pipe-line');
        const node = tile.querySelector('.pipe-endpoint-node');

        lines.forEach(line => {
          if (piece.connected) {
            line.classList.add('connected');
          } else {
            line.classList.remove('connected');
          }
        });

        if (node) {
          if (piece.connected) {
            node.setAttribute('fill', 'var(--energy-active)');
            node.style.filter = 'drop-shadow(0 0 5px var(--accent-glow-intense))';
          } else {
            node.setAttribute('fill', 'var(--energy-idle)');
            node.style.filter = 'none';
          }
        }
      });
    }

    formatTime(totalSecs) {
      const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
      const secs = (totalSecs % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    }
  }

  // Ignite Engine
  const engine = new PuzzleGrid();
  new GameUI(engine);
});
