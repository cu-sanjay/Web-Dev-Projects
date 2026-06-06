/**
 * Chromance Color Isolation & Game Core Loop Architecture
 * Verification Standard Target Engine Code Assembly
 */

document.addEventListener('DOMContentLoaded', () => {

    // Persistent Local Cache Identity Access Mapping keys
    const STREAK_CACHE_KEY = 'CHROMANCE_PERSISTIST_STREAK_V1';

    // Central Application Data Matrix State Engine Object
    let gameState = {
        mode: 'easy',       // easy (3 nodes) | hard (6 nodes)
        score: 0,
        highStreak: 0,
        round: 1,
        targetColor: '',
        winningIndex: 0,
        activeOptions: []
    };

    // UI Cache DOM Reference Vector Mapping
    const DOM = {
        scoreDisplay: document.getElementById('stat-score'),
        streakDisplay: document.getElementById('stat-streak'),
        roundDisplay: document.getElementById('stat-round'),
        easyBtn: document.getElementById('btn-easy'),
        hardBtn: document.getElementById('btn-hard'),
        resetBtn: document.getElementById('btn-reset'),
        targetString: document.getElementById('rgb-target-string'),
        statusPrompt: document.getElementById('game-status-prompt'),
        colorGrid: document.getElementById('color-grid'),
        densityBadge: document.getElementById('grid-density-badge'),
        displayOverlay: document.getElementById('display-color-overlay'),
        displayPanel: document.getElementById('target-display-panel')
    };

    /**
     * Mathematical Numeric Logic Utility Pipeline Arrays
     */
    const generateRandomChannel = () => Math.floor(Math.random() * 256);

    const generateRGBString = () => {
        return `rgb(${generateRandomChannel()}, ${generateRandomChannel()}, ${generateRandomChannel()})`;
    };

    const padStringNumber = (num) => {
        return num < 10 ? `0${num}` : num;
    };

    /**
     * Application System Telemetry Metric Storage Controllers
     */
    const loadCachedTelemetry = () => {
        const cachedStreak = localStorage.getItem(STREAK_CACHE_KEY);
        if (cachedStreak) {
            gameState.highStreak = parseInt(cachedStreak, 10);
            DOM.streakDisplay.textContent = padStringNumber(gameState.highStreak);
        }
    };

    const updateCachedTelemetry = () => {
        if (gameState.score > gameState.highStreak) {
            gameState.highStreak = gameState.score;
            localStorage.setItem(STREAK_CACHE_KEY, gameState.highStreak);
            DOM.streakDisplay.textContent = padStringNumber(gameState.highStreak);
        }
    };

    /**
     * Core Architectural Game Loop State Updates
     */
    const initializeRoundMatrix = () => {
        // Unlock user interface grid and reset metadata labels
        DOM.colorGrid.classList.remove('lock-board');
        DOM.displayOverlay.style.backgroundColor = 'transparent';
        DOM.statusPrompt.style.color = 'var(--text-secondary)';
        DOM.statusPrompt.textContent = "Select matching data frequency...";
        
        // Configuration variable tuning bound checks
        const density = gameState.mode === 'easy' ? 3 : 6;
        DOM.densityBadge.textContent = `${density} options loaded`;

        // Flush past options data array contents
        gameState.activeOptions = [];
        for (let i = 0; i < density; i++) {
            gameState.activeOptions.push(generateRGBString());
        }

        // Randomly assign a winning index target array allocation bound
        gameState.winningIndex = Math.floor(Math.random() * density);
        gameState.targetColor = gameState.activeOptions[gameState.winningIndex];

        // Format system text metrics target array display
        DOM.targetString.textContent = gameState.targetColor;

        renderGridContent();
    };

    const renderGridContent = () => {
        DOM.colorGrid.innerHTML = '';
        
        // Dynamically shift class layout structures based on mode criteria rules
        if (gameState.mode === 'easy') {
            DOM.colorGrid.className = 'color-grid mode-easy';
        } else {
            DOM.colorGrid.className = 'color-grid mode-hard';
        }

        gameState.activeOptions.forEach((color, index) => {
            const tile = document.createElement('div');
            tile.className = 'color-tile';
            tile.style.backgroundColor = color;
            tile.dataset.index = index;

            // Interactive Tile Selection Matrix Evaluator Hook
            tile.addEventListener('click', () => handleTileEvaluation(tile, index));

            DOM.colorGrid.appendChild(tile);
        });
    };

    /**
     * Interactive Core Game Verification Rules Engine Logic
     */
    const handleTileEvaluation = (selectedTile, index) => {
        // Check structural lockout before processing logic metrics
        if (DOM.colorGrid.classList.contains('lock-board')) return;

        if (index === gameState.winningIndex) {
            // MATCH CONDITION IDENTIFIED SUCCESS
            DOM.colorGrid.classList.add('lock-board');
            selectedTile.classList.add('correct');
            
            // Apply overlay panel glow parameters synchronously
            DOM.displayOverlay.style.backgroundColor = gameState.targetColor;
            
            DOM.statusPrompt.textContent = "Frequency Match Confirmed. Restructuring...";
            DOM.statusPrompt.style.color = 'var(--system-success)';
            
            gameState.score++;
            gameState.round++;
            
            DOM.scoreDisplay.textContent = padStringNumber(gameState.score);
            DOM.roundDisplay.textContent = padStringNumber(gameState.round);
            
            updateCachedTelemetry();

            // Schedule standard latency sweep before rendering following matrix round
            setTimeout(() => {
                initializeRoundMatrix();
            }, 1200);

        } else {
            // MISMATCH FAILURE ERROR CONDITION EXECUTED
            selectedTile.classList.add('incorrect');
            DOM.displayPanel.classList.remove('shake-animation');
            
            // Trigger quick paint refresh window loop initialization to handle shaking
            void DOM.displayPanel.offsetWidth; 
            DOM.displayPanel.classList.add('shake-animation');
            
            DOM.statusPrompt.textContent = "Data Conflict Detected. Retrying Matrix...";
            DOM.statusPrompt.style.color = 'var(--system-error)';
            
            // Erase baseline progress streak history logs completely back down
            gameState.score = 0;
            DOM.scoreDisplay.textContent = "00";
        }
    };

    /**
     * Event Interface Routing Handlers Binding Stack Registry
     */
    const updateGameModeConfiguration = (selectedMode) => {
        if (gameState.mode === selectedMode) return;
        
        gameState.mode = selectedMode;
        
        if (selectedMode === 'easy') {
            DOM.easyBtn.classList.add('active');
            DOM.hardBtn.classList.remove('active');
        } else {
            DOM.hardBtn.classList.add('active');
            DOM.easyBtn.classList.remove('active');
        }

        // Flush and hard reboot structural array loops
        gameState.score = 0;
        gameState.round = 1;
        DOM.scoreDisplay.textContent = "00";
        DOM.roundDisplay.textContent = "01";
        
        initializeRoundMatrix();
    };

    DOM.easyBtn.addEventListener('click', () => updateGameModeConfiguration('easy'));
    DOM.hardBtn.addEventListener('click', () => updateGameModeConfiguration('hard'));
    
    DOM.resetBtn.addEventListener('click', () => {
        gameState.score = 0;
        gameState.round = 1;
        DOM.scoreDisplay.textContent = "00";
        DOM.roundDisplay.textContent = "01";
        
        DOM.displayPanel.classList.remove('shake-animation');
        initializeRoundMatrix();
    });

    /**
     * Engine Bootstrapper Initialization
     */
    const bootEngine = () => {
        loadCachedTelemetry();
        initializeRoundMatrix();
    };

    bootEngine();
});