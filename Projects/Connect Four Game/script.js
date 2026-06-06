/**
 * Gravitas Connect Four Engine
 * Architectural Core Logic & Multi-Dimensional Matrix Evaluator
 */

document.addEventListener('DOMContentLoaded', () => {
    // Structural Dimensions Configuration
    const ROWS = 6;
    const COLS = 7;

    // Runtime App Context Memory Spaces
    let boardMatrix = [];
    let currentPlayer = 1; // 1 = Player One (Red), 2 = Player Two (Amber)
    let isLocked = false;
    let scores = {
        p1: 0,
        p2: 0,
        draws: 0
    };

    // DOM Node Cache Mapping
    const boardWrapper = document.querySelector('.board-wrapper');
    const boardGrid = document.getElementById('board-grid');
    const resetBtn = document.getElementById('reset-btn');
    const currentTurnIndicator = document.getElementById('current-turn-indicator');
    const currentTurnText = document.getElementById('current-turn-text');
    const gameStatusPrompt = document.getElementById('game-status-prompt');
    const statusCard = document.querySelector('.status-card');
    const scoreP1Display = document.getElementById('score-p1');
    const scoreP2Display = document.getElementById('score-p2');
    const scoreDrawsDisplay = document.getElementById('score-draws');
    const previews = document.querySelectorAll('.column-preview');

    /**
     * Initializes state and maps UI node structures
     */
    function initializeMatrix() {
        loadScores();
        buildGridDOM();
        resetGameState();
    }

    /**
     * Instantiates visual token slot templates into core mesh container
     */
    function buildGridDOM() {
        boardGrid.innerHTML = '';
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.setAttribute('data-row', r);
                cell.setAttribute('data-col', c);
                boardGrid.appendChild(cell);
            }
        }
    }

    /**
     * Synchronizes local variables with LocalStorage systems
     */
    function loadScores() {
        const storedScores = localStorage.getItem('gravitas_scores');
        if (storedScores) {
            try {
                scores = JSON.parse(storedScores);
            } catch (e) {
                console.error("Malformed storage configuration tracking metrics wiped.", e);
            }
        }
        updateScoreboardDOM();
    }

    function saveScores() {
        localStorage.setItem('gravitas_scores', JSON.stringify(scores));
        updateScoreboardDOM();
    }

    function updateScoreboardDOM() {
        scoreP1Display.textContent = scores.p1;
        scoreP2Display.textContent = scores.p2;
        scoreDrawsDisplay.textContent = scores.draws;
    }

    /**
     * Resets runtime state bounds to pristine default parameters
     */
    function resetGameState() {
        // Initialize multi-dimensional matrix map array tracking state nodes
        boardMatrix = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
        currentPlayer = 1;
        isLocked = false;
        boardWrapper.classList.remove('locked');

        // Clean view layer structures
        const cells = boardGrid.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.className = 'cell';
        });

        clearPreviews();
        updateTurnDisplay();
        
        statusCard.style.borderColor = 'var(--text-secondary)';
        gameStatusPrompt.textContent = "Matrix live. System ready.";
    }

    /**
     * Computes down-scanning gravity vector metrics for target columns
     */
    function getLowestEmptyRow(col) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (boardMatrix[r][col] === 0) {
                return r;
            }
        }
        return -1; // Column full execution limit
    }

    /**
     * Handles UI interaction pass logic events
     */
    function handleColumnSelection(col) {
        if (isLocked) return;

        const row = getLowestEmptyRow(col);
        if (row === -1) {
            gameStatusPrompt.textContent = "Column saturated! Redirect vector.";
            return;
        }

        // Commit tracking state
        boardMatrix[row][col] = currentPlayer;
        lockInput(true);

        // Update view coordinate
        const targetCell = boardGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        // Emulate drop latency sequencing
        setTimeout(() => {
            targetCell.classList.add(currentPlayer === 1 ? 'player-one' : 'player-two');
            
            // Post-drop completion algorithmic validation pass
            if (evaluateWinCondition(row, col)) {
                handleWinState();
            } else if (evaluateDrawCondition()) {
                handleDrawState();
            } else {
                // Alternating player assignment cycles
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                updateTurnDisplay();
                lockInput(false);
                refreshPreviewState(col);
            }
        }, 30);
    }

    /**
     * Rigid multi-directional logical loop search architecture
     */
    function evaluateWinCondition(r, c) {
        const player = boardMatrix[r][c];

        // Search track directions definition vectors
        const directions = [
            { dr: 0, dc: 1 },  // Horizontal
            { dr: 1, dc: 0 },  // Vertical
            { dr: 1, dc: 1 },  // Diagonal-Up (Right-Down)
            { dr: 1, dc: -1 }  // Diagonal-Down (Left-Down)
        ];

        for (const { dr, dc } of directions) {
            let matches = [{ row: r, col: c }];

            // Search positive directional offset bounds
            let step = 1;
            while (true) {
                const nr = r + dr * step;
                const nc = c + dc * step;
                if (isValidNode(nr, nc) && boardMatrix[nr][nc] === player) {
                    matches.push({ row: nr, col: nc });
                    step++;
                } else {
                    break;
                }
            }

            // Search negative directional offset bounds
            step = 1;
            while (true) {
                const nr = r - dr * step;
                const nc = c - dc * step;
                if (isValidNode(nr, nc) && boardMatrix[nr][nc] === player) {
                    matches.push({ row: nr, col: nc });
                    step++;
                } else {
                    break;
                }
            }

            // Boundary validation extraction match rule condition
            if (matches.length >= 4) {
                highlightWinningNodes(matches);
                return true;
            }
        }
        return false;
    }

    function isValidNode(r, c) {
        return r >= 0 && r < ROWS && c >= 0 && c < COLS;
    }

    function evaluateDrawCondition() {
        return boardMatrix[0].every(cell => cell !== 0);
    }

    /**
     * Appends distinct pulse and highlight classes to winning vector array tokens
     */
    function highlightWinningNodes(coordinates) {
        coordinates.forEach(coord => {
            const cell = boardGrid.querySelector(`[data-row="${coord.row}"][data-col="${coord.col}"]`);
            if (cell) {
                cell.classList.add('winning-token');
            }
        });
    }

    /**
     * Context terminal end state actions
     */
    function handleWinState() {
        lockInput(true);
        clearPreviews();

        if (currentPlayer === 1) {
            scores.p1++;
            gameStatusPrompt.textContent = "CRIMSON DOMINANCE // P1 WIN";
            statusCard.style.borderColor = 'var(--p1-crimson)';
        } else {
            scores.p2++;
            gameStatusPrompt.textContent = "AMBER DOMINANCE // P2 WIN";
            statusCard.style.borderColor = 'var(--p2-amber)';
        }
        saveScores();
    }

    function handleDrawState() {
        lockInput(true);
        clearPreviews();
        scores.draws++;
        gameStatusPrompt.textContent = "MATRIX DEADLOCK // MATCH DRAW";
        statusCard.style.borderColor = 'var(--text-secondary)';
        saveScores();
    }

    /**
     * Updates layout nodes tracking real-time configurations
     */
    function updateTurnDisplay() {
        if (currentPlayer === 1) {
            currentTurnIndicator.className = "turn-indicator player-one-bg";
            currentTurnText.textContent = "PLAYER 1";
            gameStatusPrompt.textContent = "Awaiting Red vector input...";
        } else {
            currentTurnIndicator.className = "turn-indicator player-two-bg";
            currentTurnText.textContent = "PLAYER 2";
            gameStatusPrompt.textContent = "Awaiting Amber vector input...";
        }
    }

    function lockInput(setting) {
        isLocked = setting;
        if (setting) {
            boardWrapper.classList.add('locked');
        } else {
            boardWrapper.classList.remove('locked');
        }
    }

    /**
     * Preview row calculation operations
     */
    function refreshPreviewState(col) {
        clearPreviews();
        if (isLocked || col === null) return;
        
        const lowestRow = getLowestEmptyRow(col);
        if (lowestRow !== -1) {
            const previewTarget = previews[col];
            if (previewTarget) {
                previewTarget.classList.add(currentPlayer === 1 ? 'active-p1' : 'active-p2');
            }
        }
    }

    function clearPreviews() {
        previews.forEach(p => {
            p.classList.remove('active-p1', 'active-p2');
        });
    }

    /**
     * Declarative IO Event Subscriptions binding mechanisms
     */
    boardGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        const col = parseInt(cell.getAttribute('data-col'), 10);
        handleColumnSelection(col);
    });

    boardGrid.addEventListener('mousemove', (e) => {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        const col = parseInt(cell.getAttribute('data-col'), 10);
        refreshPreviewState(col);
    });

    boardGrid.addEventListener('mouseleave', () => {
        clearPreviews();
    });

    // Mirror events down from selector strip overlay zones
    boardWrapper.querySelector('.selector-strip').addEventListener('click', (e) => {
        const preview = e.target.closest('.column-preview');
        if (!preview) return;
        const col = parseInt(preview.getAttribute('data-col'), 10);
        handleColumnSelection(col);
    });

    boardWrapper.querySelector('.selector-strip').addEventListener('mousemove', (e) => {
        const preview = e.target.closest('.column-preview');
        if (!preview) return;
        const col = parseInt(preview.getAttribute('data-col'), 10);
        refreshPreviewState(col);
    });

    resetBtn.addEventListener('click', () => {
        resetGameState();
    });

    // Execute core layout build sequence pipeline
    initializeMatrix();
});