const STORAGE_KEY = 'island_game_level';

const levels = [
  {
    name: 'Tropical 5×5',
    size: 5,
    roots: [[1, 1, 3], [3, 3, 2]],
  },
  {
    name: 'Archipelago 7×7',
    size: 7,
    roots: [[1, 1, 4], [3, 5, 2], [5, 1, 3]],
  },
  {
    name: 'Continent 10×10',
    size: 10,
    roots: [[1, 1, 5], [1, 8, 3], [5, 5, 6], [8, 1, 4], [8, 8, 2]],
  },
];

let currentLevel = 0;
let grid = [];
let placed = 0;
let blank = 0;
let cellElements = [];

const gridEl = document.getElementById('grid');
const levelSelect = document.getElementById('levelSelect');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');
const placedEl = document.getElementById('placedCount');
const blankEl = document.getElementById('blankCount');
const islandEl = document.getElementById('islandCount');
const banner = document.getElementById('banner');

function initLevels() {
  levelSelect.innerHTML = levels.map((l, i) => `<option value="${i}">${l.name}</option>`).join('');
  try {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY));
    if (!isNaN(saved) && saved >= 0 && saved < levels.length) currentLevel = saved;
  } catch {}
  levelSelect.value = currentLevel;
}

function buildGrid() {
  const lv = levels[currentLevel];
  grid = Array.from({ length: lv.size }, () => Array(lv.size).fill('E'));
  for (const [r, c] of lv.roots) grid[r][c] = 'R';
  placed = 0;
  calculateBlank();
  renderAll();
  hideBanner();
}

function calculateBlank() {
  blank = grid.reduce((sum, row) => sum + row.filter((c) => c === 'E').length, 0);
}

function cycleCell(r, c) {
  if (grid[r][c] === 'R') return;
  if (grid[r][c] === 'E') { grid[r][c] = 'L'; placed++; }
  else if (grid[r][c] === 'L') { grid[r][c] = 'O'; }
  else { grid[r][c] = 'E'; placed--; }
  calculateBlank();
  renderCell(r, c);
  updateStats();
  hideBanner();
}

function renderAll() {
  const lv = levels[currentLevel];
  gridEl.style.gridTemplateColumns = `repeat(${lv.size}, 1fr)`;
  gridEl.innerHTML = '';
  cellElements = [];

  for (let r = 0; r < lv.size; r++) {
    for (let c = 0; c < lv.size; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      applyCellState(cell, grid[r][c], r, c);
      cell.addEventListener('click', () => cycleCell(r, c));
      cell.style.animationDelay = `${(r * lv.size + c) * 12}ms`;
      gridEl.appendChild(cell);
      cellElements.push(cell);
    }
  }

  updateStats();
}

function renderCell(r, c) {
  const idx = r * levels[currentLevel].size + c;
  const cell = cellElements[idx];
  if (!cell) return;
  cell.className = 'cell';
  void cell.offsetWidth;
  applyCellState(cell, grid[r][c], r, c);
}

function applyCellState(cell, val, r, c) {
  const lv = levels[currentLevel];
  if (val === 'R') {
    cell.classList.add('root');
    const rootVal = lv.roots.find(([rr]) => rr === r)?.[2];
    cell.textContent = rootVal || '';
  } else if (val === 'L') {
    cell.classList.add('land');
    cell.textContent = '';
  } else if (val === 'O') {
    cell.classList.add('ocean');
    cell.textContent = '';
  } else {
    cell.textContent = '';
  }
}

function updateStats() {
  placedEl.textContent = placed;
  blankEl.textContent = blank;
  islandEl.textContent = levels[currentLevel].roots.length;

  placedEl.parentElement.style.transform = 'scale(1.05)';
  setTimeout(() => {
    if (placedEl) placedEl.parentElement.style.transform = '';
  }, 200);
}

function showBanner(msg, type) {
  banner.textContent = msg;
  banner.className = 'banner show ' + type;
}

function hideBanner() {
  banner.className = 'banner';
}

function checkSolution() {
  const lv = levels[currentLevel];
  const size = lv.size;
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const territories = [];
  const errors = [];

  for (const [rr, cc, expected] of lv.roots) {
    const cells = [];
    const stack = [[rr, cc]];
    visited[rr][cc] = true;

    while (stack.length) {
      const [cr, c2] = stack.pop();
      cells.push([cr, c2]);

      for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const nr = cr + dr, nc = c2 + dc;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (visited[nr][nc]) continue;
        if (grid[nr][nc] !== 'L' && grid[nr][nc] !== 'R') continue;
        if (grid[nr][nc] === 'R' && (nr !== rr || nc !== cc)) continue;
        visited[nr][nc] = true;
        stack.push([nr, nc]);
      }
    }

    territories.push({ rr, cc, cells, expected });
  }

  for (const { rr, cc, cells, expected } of territories) {
    if (cells.length !== expected) {
      errors.push(`Island at (${rr},${cc}): ${cells.length} tiles, needs ${expected}`);
      cells.forEach(([r, c]) => {
        const idx = r * size + c;
        const el = cellElements[idx];
        if (el) el.classList.add('error');
      });
    } else {
      cells.forEach(([r, c]) => {
        const idx = r * size + c;
        const el = cellElements[idx];
        if (el) el.classList.add('success');
      });
    }
  }

  for (let i = 0; i < territories.length; i++) {
    for (let j = i + 1; j < territories.length; j++) {
      outer:
      for (const [r1, c1] of territories[i].cells) {
        for (const [r2, c2] of territories[j].cells) {
          if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
            errors.push(`Islands at (${territories[i].rr},${territories[i].cc}) and (${territories[j].rr},${territories[j].cc}) are touching`);
            break outer;
          }
        }
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (visited[r][c]) continue;
      if (grid[r][c] === 'L') {
        errors.push(`Orphan land at (${r},${c}) not connected to any root`);
        const idx = r * size + c;
        const el = cellElements[idx];
        if (el) el.classList.add('error');
      }
    }
  }

  if (errors.length === 0) {
    showBanner('Perfect Expansion! 🏝️', 'success');
  } else {
    showBanner(errors[0] + ' ⚠️', 'error');
  }
}

function handleLevelChange() {
  currentLevel = parseInt(levelSelect.value);
  try { localStorage.setItem(STORAGE_KEY, currentLevel); } catch {}
  buildGrid();
}

resetBtn.addEventListener('click', buildGrid);
checkBtn.addEventListener('click', checkSolution);
levelSelect.addEventListener('change', handleLevelChange);

initLevels();
buildGrid();
