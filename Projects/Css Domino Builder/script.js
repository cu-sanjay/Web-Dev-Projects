(function () {
  const GRID_ROWS = 14;
  const GRID_COLS = 14;

  const DIR_VEC = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1],
  };

  const DIR_ARROW = {
    up: '\u2191',
    down: '\u2193',
    left: '\u2190',
    right: '\u2192',
  };

  const gridEl = document.getElementById('grid');
  const addModeBtn = document.getElementById('addModeBtn');
  const triggerBtn = document.getElementById('triggerBtn');
  const resetBtn = document.getElementById('resetBtn');
  const dominoCounter = document.getElementById('dominoCounter');
  const chainStatus = document.getElementById('chainStatus');
  const dirBtns = document.querySelectorAll('.dir-btn');

  const grid = [];
  let selectedDir = 'right';
  let addMode = true;
  let chainRunning = false;
  let placedCount = 0;
  let timeoutIds = [];

  function initGrid() {
    gridEl.innerHTML = '';
    grid.length = 0;

    for (let r = 0; r < GRID_ROWS; r++) {
      grid[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell empty';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', () => onCellClick(r, c));
        gridEl.appendChild(cell);
        grid[r][c] = null;
      }
    }
    updateCellHover();
    updateCounter();
  }

  function updateCellHover() {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cell = gridEl.children[r * GRID_COLS + c];
        if (!grid[r][c] && addMode && !chainRunning) {
          cell.classList.add('hoverable');
        } else {
          cell.classList.remove('hoverable');
        }
      }
    }
  }

  function onCellClick(row, col) {
    if (chainRunning) return;

    const cell = gridEl.children[row * GRID_COLS + col];

    if (grid[row][col]) {
      removeDomino(row, col);
      return;
    }

    if (!addMode) return;

    placeDomino(row, col);
  }

  function placeDomino(row, col) {
    if (grid[row][col]) return;
    if (chainRunning) return;

    const cell = gridEl.children[row * GRID_COLS + col];
    cell.classList.remove('empty');
    cell.classList.add('filled');

    const domino = document.createElement('div');
    domino.className = 'domino';
    domino.dataset.dir = selectedDir;

    const body = document.createElement('div');
    body.className = 'domino-body';
    domino.appendChild(body);

    const indicator = document.createElement('span');
    indicator.className = 'direction-indicator';
    indicator.textContent = DIR_ARROW[selectedDir];
    domino.appendChild(indicator);

    cell.appendChild(domino);
    grid[row][col] = { row, col, direction: selectedDir, element: domino };
    placedCount++;
    updateCounter();
    updateCellHover();
  }

  function removeDomino(row, col) {
    const entry = grid[row][col];
    if (!entry) return;
    if (chainRunning) return;

    const cell = gridEl.children[row * GRID_COLS + col];
    entry.element.remove();
    cell.classList.remove('filled');
    cell.classList.add('empty');
    grid[row][col] = null;
    placedCount--;
    updateCounter();
    updateCellHover();
  }

  function updateCounter() {
    dominoCounter.textContent = placedCount;
  }

  function setChainStatus(status) {
    chainStatus.textContent = status;
  }

  function triggerChain() {
    if (chainRunning) return;

    const first = findFirstDomino();
    if (!first) {
      setChainStatus('\u26A0');
      setTimeout(() => setChainStatus('\u23F8'), 1200);
      return;
    }

    chainRunning = true;
    setChainStatus('\u25B6');
    addModeBtn.classList.remove('active');
    addModeBtn.dataset.active = 'false';
    addMode = false;
    updateCellHover();

    triggerBtn.disabled = true;
    const falling = new Set();
    const chain = buildChain(first.row, first.col, falling);

    chain.forEach((entry, index) => {
      const delay = index * 260;
      const id = setTimeout(() => {
        toppleDomino(entry.row, entry.col);
        if (index === chain.length - 1) {
          setTimeout(() => {
            chainRunning = false;
            setChainStatus('\u23F8');
            triggerBtn.disabled = false;
            addMode = true;
            addModeBtn.classList.add('active');
            addModeBtn.dataset.active = 'true';
            updateCellHover();
          }, 500);
        }
      }, delay);
      timeoutIds.push(id);
    });
  }

  function findFirstDomino() {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid[r][c]) return grid[r][c];
      }
    }
    return null;
  }

  function buildChain(row, col, falling) {
    const result = [];
    let currRow = row;
    let currCol = col;

    while (true) {
      const key = `${currRow},${currCol}`;
      if (falling.has(key)) break;
      const entry = grid[currRow]?.[currCol];
      if (!entry) break;

      falling.add(key);
      result.push(entry);

      const dr = DIR_VEC[entry.direction][0];
      const dc = DIR_VEC[entry.direction][1];
      currRow += dr;
      currCol += dc;
    }

    return result;
  }

  function toppleDomino(row, col) {
    const entry = grid[row]?.[col];
    if (!entry) return;

    entry.element.classList.add(`topple-${entry.direction}`);

    setTimeout(() => {
      entry.element.classList.add('fallen');
      const cell = gridEl.children[row * GRID_COLS + col];
      cell.classList.add('disabled');
    }, 450);
  }

  function resetWorkspace() {
    if (chainRunning) {
      timeoutIds.forEach(id => clearTimeout(id));
      timeoutIds = [];
      chainRunning = false;
      setChainStatus('\u23F8');
      triggerBtn.disabled = false;
    }

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid[r][c]) {
          const cell = gridEl.children[r * GRID_COLS + c];
          grid[r][c].element.remove();
          cell.classList.remove('filled', 'disabled');
          cell.classList.add('empty');
          grid[r][c] = null;
        }
      }
    }

    placedCount = 0;
    updateCounter();
    addMode = true;
    addModeBtn.classList.add('active');
    addModeBtn.dataset.active = 'true';
    updateCellHover();
  }

  addModeBtn.addEventListener('click', () => {
    if (chainRunning) return;
    addMode = !addMode;
    addModeBtn.classList.toggle('active');
    addModeBtn.dataset.active = addMode ? 'true' : 'false';
    updateCellHover();
  });

  dirBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (chainRunning) return;
      dirBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDir = btn.dataset.dir;
    });
  });

  triggerBtn.addEventListener('click', triggerChain);
  resetBtn.addEventListener('click', resetWorkspace);

  initGrid();
})();
