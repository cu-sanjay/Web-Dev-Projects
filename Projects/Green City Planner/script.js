'use strict';

/* ─── STRUCTURE DEFINITIONS ─── */
const STRUCTURES = {
  park:    { label:'Eco-Park',     icon:'🌿', color:'#00e676', gc:+8,  aqi:-15, energy:0,   pop:0,    desc:'+8% GC · −15 AQI' },
  tree:    { label:'Urban Trees',  icon:'🌳', color:'#00c853', gc:+5,  aqi:-8,  energy:0,   pop:0,    desc:'+5% GC · −8 AQI' },
  house:   { label:'Smart Housing',icon:'🏘️',color:'#ffd600', gc:+2,  aqi:+5,  energy:5,   pop:150,  desc:'+150 pop · +5 MW' },
  road:    { label:'Multi-Lane Road',icon:'🛣️',color:'#00e5ff', gc:-2, aqi:+12, energy:0,   pop:0,    desc:'+12 AQI · −2% GC' },
  factory: { label:'Industrial Factory',icon:'🏭',color:'#ff1744', gc:-5,  aqi:+30, energy:0,   pop:500,  desc:'+500 pop · +30 AQI' }
};

const GRID_SIZE = 10;
const STORE_KEY = 'greenCity_Grid';

/* ─── DOM REFS ─── */
const $ = id => document.getElementById(id);
const canvas = $('cityCanvas');
const ctx = canvas.getContext('2d');
const gridCoords = $('gridCoords');
const telemBody = $('telemBody');
const alertChip = $('alertChip');
const gridHint = $('gridHint');
const telemHint = $('telemHint');
const topBadge = $('topBadge');

const popVal = $('popVal');
const renewVal = $('renewVal');
const sustainVal = $('sustainVal');

const tmGreen = $('tmGreen');
const tmAQI = $('tmAQI');
const tmEnergy = $('tmEnergy');
const tmCarbon = $('tmCarbon');
const tmPop = $('tmPop');

const btnRate = $('btnRate');
const btnBlueprint = $('btnBlueprint');
const btnPurge = $('btnPurge');
const toolClear = $('toolClear');

/* ─── STATE ─── */
let grid = []; // GRID_SIZE×GRID_SIZE array of { type: string|null } or null
let activeTool = null; // 'park' | 'tree' | 'house' | 'road' | 'factory' | null
let rafId = null;
let particles = [];
let hoverCol = -1, hoverRow = -1;

/* ─── GRID HELPERS ─── */
function initGrid() {
  grid = Array.from({length:GRID_SIZE}, () => Array(GRID_SIZE).fill(null));
}

function getCell(row, col) {
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
  return grid[row][col];
}

function setCell(row, col, type) {
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;
  grid[row][col] = type ? { type } : null;
  saveGrid();
  updateAll();
}

/* ─── STORAGE ─── */
function saveGrid() {
  try {
    const data = grid.map(row => row.map(c => c ? c.type : null));
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch(e) {}
}

function loadGrid() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length !== GRID_SIZE) return false;
    for (let r=0; r<GRID_SIZE; r++) {
      for (let c=0; c<GRID_SIZE; c++) {
        grid[r][c] = data[r] && data[r][c] ? { type: data[r][c] } : null;
      }
    }
    return true;
  } catch(e) { return false; }
}

/* ─── COMPUTE ─── */
function computeStats() {
  let gc = 0, aqi = 50, energy = 0, pop = 0, greenTiles = 0, totalTiles = 0;

  for (let r=0; r<GRID_SIZE; r++) {
    for (let c=0; c<GRID_SIZE; c++) {
      const cell = grid[r][c];
      if (!cell) continue;
      const s = STRUCTURES[cell.type];
      if (!s) continue;
      totalTiles++;
      gc += s.gc;
      aqi += s.aqi;
      energy += s.energy;
      pop += s.pop;
      if (s.gc > 0) greenTiles++;
    }
  }

  gc = Math.max(0, Math.min(100, gc));
  aqi = Math.max(0, aqi);
  const greenPct = totalTiles > 0 ? Math.round((greenTiles / totalTiles) * 100) : 0;

  // carbon balance
  let carbonLabel, carbonColor;
  if (aqi <= 60 && gc >= 30) { carbonLabel = 'SINK'; carbonColor = '#00e676'; }
  else if (aqi <= 100) { carbonLabel = 'NEUTRAL'; carbonColor = '#ffd600'; }
  else if (aqi <= 150) { carbonLabel = 'SOURCE'; carbonColor = '#ff6d00'; }
  else { carbonLabel = 'CRITICAL'; carbonColor = '#ff1744'; }

  return { gc, aqi, energy, pop, carbonLabel, carbonColor, greenPct, totalTiles, greenTiles };
}

/* ─── UPDATE UI ─── */
function updateAll() {
  const s = computeStats();

  // top metrics
  popVal.textContent = s.pop.toLocaleString();
  renewVal.textContent = s.energy;
  const sustainLabel = s.aqi <= 60 ? 'GREEN' : s.aqi <= 100 ? 'STABLE' : s.aqi <= 150 ? 'STRESSED' : 'CRITICAL';
  sustainVal.textContent = sustainLabel;
  const sustainColor = s.aqi <= 60 ? '#00e676' : s.aqi <= 100 ? '#ffd600' : s.aqi <= 150 ? '#ff6d00' : '#ff1744';
  sustainVal.style.color = sustainColor;
  document.getElementById('chipSustain').style.borderColor = sustainColor+'44';

  // telemetry
  tmGreen.textContent = s.gc + '%';
  tmGreen.style.color = s.gc >= 40 ? '#00e676' : s.gc >= 20 ? '#ffd600' : '#ff1744';
  tmAQI.textContent = s.aqi;
  tmAQI.style.color = s.aqi <= 60 ? '#00e5ff' : s.aqi <= 100 ? '#ffd600' : s.aqi <= 150 ? '#ff6d00' : '#ff1744';
  tmEnergy.textContent = s.energy + ' MW';
  tmEnergy.style.color = s.energy > 0 ? '#ffd600' : '#4a5268';
  tmCarbon.textContent = s.carbonLabel;
  tmCarbon.style.color = s.carbonColor;
  tmPop.textContent = s.pop.toLocaleString();

  // alert chip
  if (s.aqi > 120) {
    alertChip.style.display = 'block';
  } else {
    alertChip.style.display = 'none';
  }

  // badge
  topBadge.textContent = sustainLabel;
  topBadge.style.color = sustainColor;
  topBadge.style.borderColor = sustainColor+'33';

  gridHint.textContent = `${s.totalTiles} PLACED`;
  telemHint.textContent = s.aqi <= 60 ? 'CLEAN' : s.aqi <= 100 ? 'MODERATE' : 'UNHEALTHY';
  telemHint.style.color = tmAQI.style.color;
}

/* ─── CANVAS DRAWING ─── */
function drawGrid() {
  const dpr = window.devicePixelRatio || 1;
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth || 400;
  const h = Math.max(280, w);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);

  const pad = 10;
  const cw = (w - pad*2) / GRID_SIZE;
  const ch = (h - pad*2) / GRID_SIZE;

  // draw cells
  for (let r=0; r<GRID_SIZE; r++) {
    for (let c=0; c<GRID_SIZE; c++) {
      const x = pad + c * cw;
      const y = pad + r * ch;
      const cell = grid[r][c];
      const isHover = r === hoverRow && c === hoverCol;

      // fill
      let fill = 'rgba(255,255,255,0.015)';
      let border = 'rgba(255,255,255,0.04)';
      if (cell) {
        const s = STRUCTURES[cell.type];
        if (s) {
          fill = s.color + '22';
          border = s.color + '44';
        }
      }
      if (isHover && activeTool) {
        fill = 'rgba(255,255,255,0.05)';
        border = 'rgba(255,255,255,0.15)';
      }

      ctx.fillStyle = fill;
      ctx.fillRect(x, y, cw, ch);
      ctx.strokeStyle = border;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, cw, ch);

      // structure icon
      if (cell) {
        const s = STRUCTURES[cell.type];
        if (s) {
          ctx.font = `${Math.max(10, cw*0.5)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(s.icon, x + cw/2, y + ch/2);
        }
      }
    }
  }

  // grid border
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.strokeRect(pad, pad, cw*GRID_SIZE, ch*GRID_SIZE);

  // coordinate labels
  ctx.font = '4.5px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.textAlign = 'center';
  for (let c=0; c<GRID_SIZE; c++) {
    ctx.fillText(c, pad + c*cw + cw/2, pad - 5);
  }
  ctx.textAlign = 'right';
  for (let r=0; r<GRID_SIZE; r++) {
    ctx.fillText(r, pad - 4, pad + r*ch + ch/2 + 1.5);
  }
}

/* ─── PARTICLES ─── */
function spawnParticlesForCell(row, col, type) {
  const dpr = window.devicePixelRatio || 1;
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth || 400;
  const h = Math.max(280, w);
  const pad = 10;
  const cw = (w - pad*2) / GRID_SIZE;
  const ch = (h - pad*2) / GRID_SIZE;
  const cx = pad + col * cw + cw/2;
  const cy = pad + row * ch + ch/2;

  const s = STRUCTURES[type];
  if (!s) return;

  const count = type === 'factory' ? 3 : type === 'park' ? 2 : 0;
  for (let i=0; i<count; i++) {
    particles.push({
      x: cx + (Math.random()-0.5)*cw*0.6,
      y: cy + (Math.random()-0.5)*ch*0.6,
      vx: (Math.random()-0.5)*0.3,
      vy: type === 'factory' ? -(0.2+Math.random()*0.4) : (Math.random()-0.5)*0.2,
      life: 0,
      maxLife: 80 + Math.random()*40,
      type,
      size: type === 'factory' ? 1.5+Math.random()*2 : 1+Math.random()*1.5,
      alpha: 0.3+Math.random()*0.4
    });
  }
}

function updateParticles() {
  for (let i=particles.length-1; i>=0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
    p.alpha *= 0.99;
    if (p.life >= p.maxLife || p.alpha < 0.01) {
      particles.splice(i, 1);
    }
  }
  // spawn new particles based on grid
  for (let r=0; r<GRID_SIZE; r++) {
    for (let c=0; c<GRID_SIZE; c++) {
      const cell = grid[r][c];
      if (!cell) continue;
      if (cell.type === 'factory' || cell.type === 'park') {
        if (Math.random() < 0.02) spawnParticlesForCell(r, c, cell.type);
      }
    }
  }
  // cap particles
  if (particles.length > 200) particles = particles.slice(-150);
}

function drawParticles() {
  for (const p of particles) {
    const color = p.type === 'factory' ? `rgba(255,109,0,${p.alpha*0.5})` : `rgba(0,230,118,${p.alpha*0.5})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

/* ─── RENDER LOOP ─── */
function render() {
  drawGrid();
  updateParticles();
  drawParticles();
  rafId = requestAnimationFrame(render);
}

function startRender() {
  if (rafId) return;
  render();
}

function stopRender() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

/* ─── CANVAS COORDINATE LOOKUP ─── */
function getCellFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  const mx = (e.clientX - rect.left) * (w / rect.width);
  const my = (e.clientY - rect.top) * (h / rect.height);
  const pad = 10;
  const cw = (w - pad*2) / GRID_SIZE;
  const ch = (h - pad*2) / GRID_SIZE;
  const col = Math.floor((mx - pad) / cw);
  const row = Math.floor((my - pad) / ch);
  if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return null;
  return { row, col };
}

/* ─── ACTIONS ─── */
function placeStructure(row, col, type) {
  if (!type) return;
  if (grid[row][col]) {
    toast('Cell already occupied — clear it first');
    return;
  }
  setCell(row, col, type);
  toast(`Placed ${STRUCTURES[type].label} at [${col},${row}]`);
}

function clearCell(row, col) {
  if (!grid[row][col]) return;
  const label = grid[row][col].type;
  setCell(row, col, null);
  toast(`Cleared [${col},${row}]`);
}

function purgeGrid() {
  stopRender();
  initGrid();
  particles = [];
  activeTool = null;
  document.querySelectorAll('.tool-item').forEach(t => t.classList.remove('active'));
  saveGrid();
  updateAll();
  drawGrid();
  startRender();
  toast('Municipal matrix purged — terrain flattened');
}

function loadBlueprint() {
  // Industrial metropolis: factories clustered center, roads grid, housing surround, parks scattered
  const bp = [
    ['p',null,null,'h','h','h','h',null,null,'p'],
    [null,'t',null,'h','f','f','h',null,'t',null],
    [null,null,'r','r','r','r','r','r',null,null],
    ['t',null,'h','f','f','f','f','h',null,'t'],
    ['h','h','r','f','f','f','f','r','h','h'],
    ['h','h','r','f','f','f','f','r','h','h'],
    [null,'t','h','f','f','f','f','h',null,'t'],
    [null,null,'r','r','r','r','r','r',null,null],
    [null,'t',null,'h','h','h','h',null,'t',null],
    ['p',null,null,'h',null,null,'h',null,null,'p']
  ];
  for (let r=0; r<GRID_SIZE; r++) {
    for (let c=0; c<GRID_SIZE; c++) {
      const type = bp[r] && bp[r][c] ? bp[r][c] : null;
      grid[r][c] = type ? { type } : null;
    }
  }
  saveGrid();
  updateAll();
  drawGrid();
  toast('Industrial Metropolis blueprint loaded');
}

function calculateRating() {
  const s = computeStats();
  let grade, gradeColor;
  if (s.aqi <= 50) { grade = 'S·TIER — ECO UTOPIA'; gradeColor = '#00e676'; }
  else if (s.aqi <= 80) { grade = 'A·TIER — SUSTAINABLE'; gradeColor = '#00e5ff'; }
  else if (s.aqi <= 120) { grade = 'B·TIER — MODERATE'; gradeColor = '#ffd600'; }
  else if (s.aqi <= 180) { grade = 'C·TIER — STRESSED'; gradeColor = '#ff6d00'; }
  else { grade = 'D·TIER — CRITICAL'; gradeColor = '#ff1744'; }

  toast(`CITY RATING: ${grade} (AQI:${s.aqi} GC:${s.gc}% POP:${s.pop})`);
  gridHint.textContent = grade;
  gridHint.style.color = gradeColor;
}

/* ─── TOAST ─── */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('leave'); setTimeout(() => el.remove(), 300); }, 2500);
}

/* ─── INIT ─── */
function init() {
  initGrid();
  const loaded = loadGrid();
  if (!loaded) {
    // start with a few trees for demo
    grid[1][1] = { type:'tree' };
    grid[1][2] = { type:'tree' };
    grid[2][1] = { type:'park' };
    grid[0][0] = { type:'house' };
    saveGrid();
  }

  // tool selection
  document.querySelectorAll('.tool-item').forEach(el => {
    el.addEventListener('click', () => {
      const type = el.dataset.type;
      if (activeTool === type) {
        activeTool = null;
        document.querySelectorAll('.tool-item').forEach(t => t.classList.remove('active'));
        toast('Tool deselected');
      } else {
        activeTool = type;
        document.querySelectorAll('.tool-item').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        toast(`Selected: ${STRUCTURES[type].label}`);
      }
    });
  });

  toolClear.addEventListener('click', () => {
    activeTool = null;
    document.querySelectorAll('.tool-item').forEach(t => t.classList.remove('active'));
    toast('Selection cleared');
  });

  // canvas events
  canvas.addEventListener('mousemove', e => {
    const cell = getCellFromEvent(e);
    if (cell) {
      hoverRow = cell.row;
      hoverCol = cell.col;
      const existing = grid[cell.row][cell.col];
      const info = existing
        ? `${STRUCTURES[existing.type].icon} ${STRUCTURES[existing.type].label}`
        : 'Empty';
      gridCoords.textContent = `[${cell.col}, ${cell.row}] · ${info} · ${activeTool ? `Place: ${STRUCTURES[activeTool].icon}` : 'No tool selected'}`;
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoverRow = -1;
    hoverCol = -1;
    gridCoords.textContent = 'Hover cell to see coordinates';
  });

  canvas.addEventListener('click', e => {
    const cell = getCellFromEvent(e);
    if (!cell) return;
    const existing = grid[cell.row][cell.col];
    if (existing) {
      if (activeTool) {
        toast('Cell occupied — clear or choose another');
      } else {
        clearCell(cell.row, cell.col);
      }
    } else if (activeTool) {
      placeStructure(cell.row, cell.col, activeTool);
    } else {
      toast('Select a structure from the toolbox first');
    }
  });

  // right-click to clear
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (cell && grid[cell.row][cell.col]) clearCell(cell.row, cell.col);
  });

  // buttons
  btnRate.addEventListener('click', calculateRating);
  btnBlueprint.addEventListener('click', loadBlueprint);
  btnPurge.addEventListener('click', purgeGrid);

  // window resize
  window.addEventListener('resize', () => { drawGrid(); });

  // boot
  updateAll();
  startRender();
  toast('Green City Planner ready — select a tool and click the grid');
}

document.addEventListener('DOMContentLoaded', init);
