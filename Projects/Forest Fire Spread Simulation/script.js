(function () {
  'use strict';

  const ROWS = 25, COLS = 40;
  const STATES = { EMPTY: 0, TREE: 1, FIRE: 2, ASH: 3 };

  let grid = [];
  let running = false;
  let tick = 0;
  let timer = null;
  let painting = false;
  let paintMode = null;

  /* === DOM REFS === */
  const canvas = document.getElementById('forestCanvas');
  const ctx = canvas.getContext('2d');
  const gridWrap = document.getElementById('gridWrap');

  const sliderWind = document.getElementById('sliderWind');
  const sliderMoisture = document.getElementById('sliderMoisture');
  const sliderDelay = document.getElementById('sliderDelay');
  const valWind = document.getElementById('valWind');
  const valMoisture = document.getElementById('valMoisture');
  const valDelay = document.getElementById('valDelay');
  const tickDisplay = document.getElementById('tickDisplay');
  const valHealthy = document.getElementById('valHealthy');
  const valFire = document.getElementById('valFire');
  const valAsh = document.getElementById('valAsh');
  const valPct = document.getElementById('valPct');
  const btnIgnite = document.getElementById('btnIgnite');
  const btnContain = document.getElementById('btnContain');
  const btnHalt = document.getElementById('btnHalt');
  const haltLabel = document.getElementById('haltLabel');
  const btnReseed = document.getElementById('btnReseed');
  const compassBtns = document.querySelectorAll('.compass-btn');

  let windDir = 'S';
  let windSpeed = 0.4;
  let moisture = 0.3;
  let delay = 50;

  /* === SLIDER FEEDBACK === */
  sliderWind.addEventListener('input', () => { valWind.textContent = sliderWind.value + '%'; windSpeed = sliderWind.value / 100; });
  sliderMoisture.addEventListener('input', () => { valMoisture.textContent = sliderMoisture.value + '%'; moisture = sliderMoisture.value / 100; });
  sliderDelay.addEventListener('input', () => { valDelay.textContent = sliderDelay.value + 'ms'; delay = parseInt(sliderDelay.value) * 10; });

  /* === COMPASS === */
  compassBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      compassBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      windDir = btn.dataset.dir;
    });
  });

  /* === GRID HELPERS === */
  function createGrid(density) {
    density = density || 0.7;
    const g = [];
    for (let r = 0; r < ROWS; r++) {
      g[r] = [];
      for (let c = 0; c < COLS; c++) {
        g[r][c] = Math.random() < density ? STATES.TREE : STATES.EMPTY;
      }
    }
    return g;
  }

  function seedForest() {
    grid = createGrid(0.75);
    tick = 0;
    tickDisplay.textContent = 'TICK 0';
    running = false;
    haltLabel.textContent = 'Halt';
    if (timer) { clearInterval(timer); timer = null; }
    render();
    updateTelemetry();
  }

  /* === RENDER === */
  function render() {
    const wrapRect = gridWrap.getBoundingClientRect();
    const availW = wrapRect.width - 12;
    const cellW = Math.floor(availW / COLS);
    const cellH = Math.floor(cellW * 0.625);
    const w = cellW * COLS;
    const h = cellH * ROWS;

    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * cellW;
        const y = r * cellH;
        const state = grid[r][c];

        let color;
        switch (state) {
          case STATES.EMPTY: color = '#05060b'; break;
          case STATES.TREE: color = '#1a3a2a'; break;
          case STATES.FIRE: color = '#ff4500'; break;
          case STATES.ASH: color = '#2a2a2a'; break;
          default: color = '#05060b';
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellW, cellH);

        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.strokeRect(x, y, cellW, cellH);

        if (state === STATES.FIRE) {
          ctx.shadowColor = 'rgba(255,69,0,0.3)';
          ctx.shadowBlur = 4;
          ctx.fillStyle = '#ff4500';
          ctx.fillRect(x, y, cellW, cellH);
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  /* === UPDATE === */
  function step() {
    const next = [];
    for (let r = 0; r < ROWS; r++) {
      next[r] = grid[r].slice();
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const s = grid[r][c];

        if (s === STATES.FIRE) {
          next[r][c] = STATES.ASH;
          continue;
        }

        if (s !== STATES.TREE) continue;

        let fireNeighbors = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
            if (grid[nr][nc] === STATES.FIRE) {
              let weight = 1.0;
              if (dr === -1 && windDir === 'N') weight += windSpeed * 2;
              if (dr === 1 && windDir === 'S') weight += windSpeed * 2;
              if (dc === -1 && windDir === 'W') weight += windSpeed * 2;
              if (dc === 1 && windDir === 'E') weight += windSpeed * 2;
              if (dr !== 0 && dc !== 0) weight *= 0.7;
              fireNeighbors += weight;
            }
          }
        }

        if (fireNeighbors > 0) {
          const baseProb = Math.min(fireNeighbors * 0.3, 0.95);
          const damped = baseProb * (1 - moisture * 0.85);
          if (Math.random() < damped) {
            next[r][c] = STATES.FIRE;
          }
        }
      }
    }

    grid = next;
    tick++;
    tickDisplay.textContent = 'TICK ' + tick;
    render();
    updateTelemetry();
  }

  /* === TELEMETRY === */
  function updateTelemetry() {
    let healthy = 0, fire = 0, ash = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const s = grid[r][c];
        if (s === STATES.TREE) healthy++;
        else if (s === STATES.FIRE) fire++;
        else if (s === STATES.ASH) ash++;
      }
    }
    const totalBurnable = healthy + ash;
    const pct = totalBurnable > 0 ? (ash / totalBurnable) * 100 : 0;

    const acreageCoeff = 0.62;
    valHealthy.textContent = healthy;
    valFire.textContent = fire;
    valAsh.textContent = (ash * acreageCoeff).toFixed(1) + ' ac';
    valPct.textContent = pct.toFixed(1) + '%';
  }

  /* === IGNITE === */
  function igniteRandom() {
    let targets = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === STATES.TREE) targets.push([r, c]);
      }
    }
    if (targets.length === 0) return;
    const count = Math.min(3, targets.length);
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * targets.length);
      const [r, c] = targets.splice(idx, 1)[0];
      grid[r][c] = STATES.FIRE;
    }
    render();
    updateTelemetry();
  }

  /* === CONTAINMENT BURN === */
  function containmentBurn() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
          if (grid[r][c] === STATES.TREE) {
            grid[r][c] = STATES.EMPTY;
          }
        }
      }
    }
    render();
    updateTelemetry();
  }

  /* === START / STOP === */
  function startLoop() {
    if (timer) clearInterval(timer);
    running = true;
    haltLabel.textContent = 'Halt';
    timer = setInterval(step, delay);
  }

  function stopLoop() {
    if (timer) { clearInterval(timer); timer = null; }
    running = false;
    haltLabel.textContent = 'Resume';
  }

  function toggleLoop() {
    if (running) { stopLoop(); }
    else { startLoop(); }
  }

  /* === MOUSE INTERACTION === */
  function getGridCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;
    const c = Math.floor(x / cellW);
    const r = Math.floor(y / cellH);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    return { r, c };
  }

  canvas.addEventListener('mousedown', (e) => {
    const coords = getGridCoords(e);
    if (!coords) return;
    const { r, c } = coords;

    if (e.detail === 2) {
      if (grid[r][c] === STATES.TREE) {
        grid[r][c] = STATES.FIRE;
        render();
        updateTelemetry();
      }
      return;
    }

    painting = true;
    if (grid[r][c] === STATES.TREE) {
      grid[r][c] = STATES.EMPTY;
      paintMode = 'clear';
    } else if (grid[r][c] === STATES.EMPTY) {
      grid[r][c] = STATES.TREE;
      paintMode = 'plant';
    }
    render();
    updateTelemetry();
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!painting) return;
    const coords = getGridCoords(e);
    if (!coords) return;
    const { r, c } = coords;

    if (paintMode === 'clear' && grid[r][c] === STATES.TREE) {
      grid[r][c] = STATES.EMPTY;
      render();
      updateTelemetry();
    } else if (paintMode === 'plant' && grid[r][c] === STATES.EMPTY) {
      grid[r][c] = STATES.TREE;
      render();
      updateTelemetry();
    }
  });

  document.addEventListener('mouseup', () => { painting = false; paintMode = null; });
  canvas.addEventListener('mouseleave', () => { painting = false; paintMode = null; });

  canvas.addEventListener('dblclick', (e) => e.preventDefault());

  /* === BUTTON EVENTS === */
  btnIgnite.addEventListener('click', igniteRandom);
  btnContain.addEventListener('click', containmentBurn);
  btnHalt.addEventListener('click', toggleLoop);
  btnReseed.addEventListener('click', seedForest);

  /* === DELAY UPDATE === */
  let delayTimer = null;
  sliderDelay.addEventListener('input', () => {
    delay = parseInt(sliderDelay.value) * 10;
    if (running) {
      if (delayTimer) clearTimeout(delayTimer);
      delayTimer = setTimeout(() => {
        if (timer) { clearInterval(timer); timer = null; }
        timer = setInterval(step, delay);
      }, 300);
    }
  });

  /* === INIT === */
  seedForest();

})();
