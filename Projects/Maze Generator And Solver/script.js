(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#mazeCanvas');
  const ctx = canvas.getContext('2d');
  const genBtns = $$('.gen-btn');
  const solveBtns = $$('.solve-btn');
  const sizeSlider = $('#sizeSlider');
  const sizeVal = $('#sizeVal');
  const speedSlider = $('#speedSlider');
  const speedVal = $('#speedVal');
  const teleGrid = $('#teleGrid');
  const teleCells = $('#teleCells');
  const teleFrontier = $('#teleFrontier');
  const telePathCost = $('#telePathCost');
  const teleRuntime = $('#teleRuntime');
  const teleBadge = $('#teleBadge');
  const btnGenerate = $('#btnGenerate');
  const btnSolve = $('#btnSolve');
  const btnPurge = $('#btnPurge');
  const btnAutoSolve = $('#btnAutoSolve');

  let genMode = 'dfs-backtracker';
  let solveMode = 'bfs';
  let gridSize = 21;
  let speed = 20;
  let busy = false;
  let timerId = null;

  let grid = [];
  let rows = 0;
  let cols = 0;
  let startR = 1, startC = 1;
  let endR = 1, endC = 1;

  let solving = false;
  let solveTimeout = null;

  /* ─── CANVAS ─── */
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 500;
    const h = (wrap.clientHeight || 460) - 28;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = w;
    canvas._h = h;
  }

  /* ─── GRID ─── */
  function createGrid(r, c) {
    grid = [];
    rows = r;
    cols = c;
    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        const isBorder = (i === 0 || i === rows-1 || j === 0 || j === cols-1);
        grid[i][j] = {
          r: i, c: j,
          wall: isBorder,
          visited: false,
          genVisited: false,
          explored: false,
          parent: null,
          g: 0, h: 0, f: 0,
          inOpen: false,
          inClosed: false,
          inPath: false,
          walls: { top: isBorder, right: isBorder, bottom: isBorder, left: isBorder }
        };
      }
    }
    /* interior cells start with all walls */
    for (let i = 1; i < rows-1; i++) {
      for (let j = 1; j < cols-1; j++) {
        grid[i][j].walls = { top: true, right: true, bottom: true, left: true };
        grid[i][j].wall = false;
      }
    }
    startR = 1;
    startC = 1;
    endR = rows-2;
    endC = cols-2;
  }

  function clearSolveState() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const c = grid[i][j];
        c.explored = false;
        c.parent = null;
        c.visited = false;
        c.g = 0; c.h = 0; c.f = 0;
        c.inOpen = false;
        c.inClosed = false;
        c.inPath = false;
      }
    }
    frontCount = 0;
  }

  let frontCount = 0;

  /* ─── MAZE GENERATION ─── */
  function generateDFSBacktracker() {
    const stack = [];
    const start = grid[1][1];
    start.genVisited = true;
    stack.push(start);

    while (stack.length > 0) {
      const cur = stack[stack.length-1];
      const nbs = getUnvisitedNeighbors(cur);
      if (nbs.length === 0) { stack.pop(); continue; }
      const next = nbs[Math.floor(Math.random() * nbs.length)];
      removeWall(cur, next);
      next.genVisited = true;
      stack.push(next);
    }
  }

  function generateBinaryTree() {
    for (let i = 1; i < rows-1; i++) {
      for (let j = 1; j < cols-1; j++) {
        const dirs = [];
        if (i > 1) dirs.push('top');
        if (j > 1) dirs.push('left');
        if (dirs.length === 0) continue;
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        if (dir === 'top') { grid[i][j].walls.top = false; grid[i-1][j].walls.bottom = false; }
        else { grid[i][j].walls.left = false; grid[i][j-1].walls.right = false; }
      }
    }
  }

  function getUnvisitedNeighbors(cell) {
    const dirs = [
      { dr: -2, dc: 0, w: 'top', w2: 'bottom' },
      { dr: 2, dc: 0, w: 'bottom', w2: 'top' },
      { dr: 0, dc: -2, w: 'left', w2: 'right' },
      { dr: 0, dc: 2, w: 'right', w2: 'left' }
    ];
    const res = [];
    for (const d of dirs) {
      const nr = cell.r + d.dr, nc = cell.c + d.dc;
      if (nr > 0 && nr < rows-1 && nc > 0 && nc < cols-1 && !grid[nr][nc].genVisited) {
        const nb = grid[nr][nc];
        nb._dr = d.dr; nb._dc = d.dc;
        nb._w = d.w; nb._w2 = d.w2;
        res.push(nb);
      }
    }
    return res;
  }

  function removeWall(a, b) {
    const dr = b.r - a.r, dc = b.c - a.c;
    if (dr === -2) { a.walls.top = false; grid[a.r-1][a.c].wall = false; grid[a.r-1][a.c].walls.bottom = false; grid[a.r-1][a.c].walls.top = false; }
    if (dr === 2) { a.walls.bottom = false; grid[a.r+1][a.c].wall = false; grid[a.r+1][a.c].walls.top = false; grid[a.r+1][a.c].walls.bottom = false; }
    if (dc === -2) { a.walls.left = false; grid[a.r][a.c-1].wall = false; grid[a.r][a.c-1].walls.right = false; grid[a.r][a.c-1].walls.left = false; }
    if (dc === 2) { a.walls.right = false; grid[a.r][a.c+1].wall = false; grid[a.r][a.c+1].walls.left = false; grid[a.r][a.c+1].walls.right = false; }
  }

  function generateMaze() {
    if (busy) return;
    clearSolveState();
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) grid[i][j].genVisited = false;
    if (genMode === 'dfs-backtracker') generateDFSBacktracker();
    else generateBinaryTree();
    drawMaze();
    updateTelemetry();
  }

  /* ─── PATHFINDING ─── */
  function getNeighbors(cell) {
    const dirs = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];
    const res = [];
    for (const d of dirs) {
      const nr = cell.r + d.dr, nc = cell.c + d.dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].wall) {
        const nb = grid[nr][nc];
        /* check wall between */
        if (d.dr === -1 && cell.walls.top) continue;
        if (d.dr === 1 && cell.walls.bottom) continue;
        if (d.dc === -1 && cell.walls.left) continue;
        if (d.dc === 1 && cell.walls.right) continue;
        res.push(nb);
      }
    }
    return res;
  }

  async function solveBFS() {
    const start = grid[startR][startC];
    const end = grid[endR][endC];
    const queue = [start];
    start.visited = true;

    while (queue.length > 0) {
      const cur = queue.shift();
      cur.explored = true;
      frontCount++;
      if (cur === end) { reconstructPath(end); return; }
      const nbs = getNeighbors(cur);
      for (const nb of nbs) {
        if (!nb.visited) {
          nb.visited = true;
          nb.parent = cur;
          queue.push(nb);
        }
      }
      if (speed > 0) { drawMaze(); updateTelemetry(); await sleep(speed); }
    }
  }

  async function solveDFS() {
    const start = grid[startR][startC];
    const end = grid[endR][endC];
    const stack = [start];
    start.visited = true;

    while (stack.length > 0) {
      const cur = stack.pop();
      cur.explored = true;
      frontCount++;
      if (cur === end) { reconstructPath(end); return; }
      const nbs = getNeighbors(cur);
      for (const nb of nbs) {
        if (!nb.visited) {
          nb.visited = true;
          nb.parent = cur;
          stack.push(nb);
        }
      }
      if (speed > 0) { drawMaze(); updateTelemetry(); await sleep(speed); }
    }
  }

  async function solveAStar() {
    const start = grid[startR][startC];
    const end = grid[endR][endC];
    start.g = 0;
    start.h = manhattan(start, end);
    start.f = start.h;
    const open = [start];
    start.inOpen = true;

    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f);
      const cur = open.shift();
      cur.inOpen = false;
      cur.inClosed = true;
      cur.explored = true;
      frontCount++;
      if (cur === end) { reconstructPath(end); return; }
      const nbs = getNeighbors(cur);
      for (const nb of nbs) {
        if (nb.inClosed) continue;
        const gTent = cur.g + 1;
        if (!nb.inOpen) {
          nb.parent = cur;
          nb.g = gTent;
          nb.h = manhattan(nb, end);
          nb.f = nb.g + nb.h;
          nb.inOpen = true;
          open.push(nb);
        } else if (gTent < nb.g) {
          nb.parent = cur;
          nb.g = gTent;
          nb.f = nb.g + nb.h;
        }
      }
      if (speed > 0) { drawMaze(); updateTelemetry(); await sleep(speed); }
    }
  }

  function manhattan(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
  }

  function reconstructPath(end) {
    let cur = end;
    while (cur) {
      cur.inPath = true;
      cur = cur.parent;
    }
  }

  /* ─── DRAW ─── */
  function drawMaze() {
    const w = canvas._w, h = canvas._h;
    ctx.clearRect(0, 0, w, h);
    if (!w || !h || rows === 0) return;

    const cellW = w / cols;
    const cellH = h / rows;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const c = grid[i][j];
        const x = j * cellW, y = i * cellH;

        if (c.wall) {
          ctx.fillStyle = 'rgba(255,255,255,0.03)';
          ctx.fillRect(x, y, cellW, cellH);
        } else if (c.inPath) {
          ctx.fillStyle = 'rgba(0,230,118,0.25)';
          ctx.fillRect(x, y, cellW, cellH);
        } else if (c.explored) {
          ctx.fillStyle = 'rgba(0,229,255,0.08)';
          ctx.fillRect(x, y, cellW, cellH);
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.01)';
          ctx.fillRect(x, y, cellW, cellH);
        }

        /* walls */
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        if (c.walls.top) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+cellW, y); ctx.stroke(); }
        if (c.walls.bottom) { ctx.beginPath(); ctx.moveTo(x, y+cellH); ctx.lineTo(x+cellW, y+cellH); ctx.stroke(); }
        if (c.walls.left) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y+cellH); ctx.stroke(); }
        if (c.walls.right) { ctx.beginPath(); ctx.moveTo(x+cellW, y); ctx.lineTo(x+cellW, y+cellH); ctx.stroke(); }
      }
    }

    /* start/end markers */
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold clamp(8px,0.9vmin,12px) "JetBrains Mono",monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const sx = startC * cellW + cellW/2, sy = startR * cellH + cellH/2;
    ctx.fillText('S', sx, sy);
    ctx.fillStyle = '#00e676';
    const ex = endC * cellW + cellW/2, ey = endR * cellH + cellH/2;
    ctx.fillText('E', ex, ey);
  }

  /* ─── TELEMETRY ─── */
  function updateTelemetry() {
    const totalCells = (rows-2)*(cols-2);
    teleGrid.textContent = rows + '×' + cols;
    teleCells.textContent = totalCells;
    teleFrontier.textContent = frontCount;
    let pathCost = 0;
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) if (grid[i][j].inPath) pathCost++;
    telePathCost.textContent = pathCost > 0 ? pathCost : '--';
  }

  /* ─── ASYNC SOLVE ─── */
  async function runSolve() {
    if (busy || solving) return;
    clearSolveState();
    solving = true;
    const t0 = performance.now();
    teleBadge.className = 'tele-badge solving';
    teleBadge.textContent = '[ SEARCHING... ]';

    if (solveMode === 'bfs') await solveBFS();
    else if (solveMode === 'dfs') await solveDFS();
    else await solveAStar();

    const rt = (performance.now() - t0).toFixed(1);
    teleRuntime.textContent = rt + 'ms';
    solving = false;
    drawMaze();
    updateTelemetry();

    let pathCost = 0;
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) if (grid[i][j].inPath) pathCost++;

    if (pathCost > 0) {
      teleBadge.className = 'tele-badge solved';
      teleBadge.textContent = 'HEURISTIC COLLISION SUCCESSFUL';
    } else {
      teleBadge.className = 'tele-badge idle';
      teleBadge.textContent = 'NO PATH FOUND';
    }
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  /* ─── PURGE ─── */
  function purgeAll() {
    if (busy || solving) return;
    if (timerId) { clearTimeout(timerId); timerId = null; }
    if (solveTimeout) { clearTimeout(solveTimeout); solveTimeout = null; }
    const dim = gridSize;
    createGrid(dim, dim);
    frontCount = 0;
    drawMaze();
    teleGrid.textContent = dim + '×' + dim;
    teleCells.textContent = (dim-2)*(dim-2);
    teleFrontier.textContent = '--';
    telePathCost.textContent = '--';
    teleRuntime.textContent = '--';
    teleBadge.className = 'tele-badge standby';
    teleBadge.textContent = 'STANDBY';
  }

  /* ─── UI EVENTS ─── */
  genBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (solving) return;
      genBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      genMode = this.dataset.gen;
    });
  });

  solveBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (solving) return;
      solveBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      solveMode = this.dataset.solve;
    });
  });

  sizeSlider.addEventListener('input', function() {
    const v = parseInt(this.value, 10);
    const dim = v * 2 + 1;
    gridSize = dim;
    sizeVal.textContent = dim + '×' + dim;
    if (!solving) { purgeAll(); }
  });

  speedSlider.addEventListener('input', function() {
    speed = parseInt(this.value, 10);
    speedVal.textContent = speed + 'ms';
  });

  btnGenerate.addEventListener('click', function() {
    if (solving) return;
    generateMaze();
    teleBadge.className = 'tele-badge idle';
    teleBadge.textContent = 'MAZE GENERATED';
  });

  btnSolve.addEventListener('click', runSolve);

  btnPurge.addEventListener('click', purgeAll);

  btnAutoSolve.addEventListener('click', function() {
    if (solving) return;
    generateMaze();
    teleBadge.className = 'tele-badge idle';
    teleBadge.textContent = 'MAZE GENERATED';
    setTimeout(runSolve, speed + 50);
  });

  /* ─── RESIZE ─── */
  let resizeTm;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTm);
    resizeTm = setTimeout(() => { resizeCanvas(); drawMaze(); }, 100);
  });

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    const dim = gridSize;
    createGrid(dim, dim);
    drawMaze();
    teleGrid.textContent = dim + '×' + dim;
    teleCells.textContent = (dim-2)*(dim-2);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
