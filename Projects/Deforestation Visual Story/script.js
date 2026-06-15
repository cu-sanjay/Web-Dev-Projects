'use strict';

/* ─── REGIONAL DATA DICTIONARY ─── */
const REGIONS = {
  amazon: {
    label:'Amazon Rainforest Basin', short:'Amazon',
    initCover:550,                   // million hectares
    carbonWeight:0.42,               // MtCO₂ per hectare
    decades:{1990:1,2000:0.92,2010:0.78,2020:0.70,2026:0.65}, // remaining fraction
    pop:{label:'Population', val:'~47M', desc:'9 nations'},
    bio:{label:'Tree Species', val:'~16,000', desc:'endemic 40%'},
    deforestPattern:'road',          // canyon-like clearance streaks
    color:'#00e676'
  },
  congo:{
    label:'Congo Basin Equatorial Core', short:'Congo',
    initCover:200,
    carbonWeight:0.38,
    decades:{1990:1,2000:0.96,2010:0.91,2020:0.84,2026:0.80},
    pop:{label:'Population', val:'~120M', desc:'6 nations'},
    bio:{label:'Tree Species', val:'~10,000', desc:'endemic 30%'},
    deforestPattern:'scatter',
    color:'#00e5ff'
  },
  seasia:{
    label:'Southeast Asian Archipelago', short:'SE Asia',
    initCover:250,
    carbonWeight:0.52,               // peat-rich
    decades:{1990:1,2000:0.88,2010:0.72,2020:0.63,2026:0.58},
    pop:{label:'Population', val:'~680M', desc:'11 nations'},
    bio:{label:'Tree Species', val:'~25,000', desc:'endemic 60%'},
    deforestPattern:'grid',          // plantation checkerboard
    color:'#ffb800'
  },
  boreal:{
    label:'Boreal Taiga Matrix', short:'Boreal',
    initCover:1200,
    carbonWeight:0.18,               // lower biomass per ha
    decades:{1990:1,2000:0.97,2010:0.94,2020:0.90,2026:0.88},
    pop:{label:'Population', val:'~14M', desc:'sparse'},
    bio:{label:'Tree Species', val:'~100', desc:'coniferous'},
    deforestPattern:'patchy',
    color:'#ff6d00'
  }
};

const DECADES = [1990,2000,2010,2020,2026];

/* ─── STATE ─── */
let activeRegion = 'amazon';
let currentYear = 1990;
let playing = false;
let rafId = null;
let playDir = 1;         // 1 forward, -1 backward (we keep forward-only)
let frameTick = 0;

/* ─── CANVAS GRID ─── */
let gridCols = 0;
let gridRows = 0;
let cellSize = 0;
let gridData = [];       // flat array 0|1 (1 = tree alive)
let clearOrder = [];     // indices sorted by priority (cleared first)

const canvas = document.getElementById('forestCanvas');
const ctx = canvas.getContext('2d');

/* ─── DOM REFS ─── */
const $ = id => document.getElementById(id);
const btnPlay = $('btnPlay');
const btnHalt = $('btnHalt');
const btnRestore = $('btnRestore');
const tlSlider = $('tlSlider');
const tlYear = $('tlYear');
const tlStatus = $('tlStatus');
const tmBody = $('tmBody');
const gmRemain = $('gmRemain');
const gmFrag = $('gmFrag');
const gmCarbon = $('gmCarbon');
const coverVal = $('coverVal');
const lostVal = $('lostVal');
const carbonVal = $('carbonVal');
const mapHint = $('mapHint');
const topBadge = $('topBadge');
const toastContainer = $('toastContainer');

/* ─── REGION INTERPOLATION ─── */
function remFrac(regionKey, year) {
  const r = REGIONS[regionKey];
  const d = r.decades;
  const years = Object.keys(d).map(Number).sort((a,b)=>a-b);
  if (year <= years[0]) return d[years[0]];
  if (year >= years[years.length-1]) return d[years[years.length-1]];
  for (let i=0; i<years.length-1; i++) {
    if (year >= years[i] && year <= years[i+1]) {
      const t = (year - years[i]) / (years[i+1] - years[i]);
      return d[years[i]] + (d[years[i+1]] - d[years[i]]) * t;
    }
  }
  return d[years[years.length-1]];
}

function cumLoss(regionKey, year) {
  return 1 - remFrac(regionKey, year);
}

/* ─── CANVAS SETUP ─── */
function initCanvas() {
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth - 4;
  const aspect = 0.6;
  const dpr = window.devicePixelRatio || 1;
  const dispW = Math.max(300, w);
  const dispH = Math.max(300, dispW * aspect);
  canvas.style.width = dispW + 'px';
  canvas.style.height = dispH + 'px';
  canvas.width = dispW * dpr;
  canvas.height = dispH * dpr;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr, dpr);

  const pad = 16;
  const availW = dispW - pad*2;
  const availH = dispH - pad*2;
  cellSize = Math.max(2.8, Math.floor(availW / 85));
  gridCols = Math.floor(availW / cellSize);
  gridRows = Math.floor(availH / cellSize);
  generateClearOrder();
  seedGrid();
  drawCanvas();
}

function seedGrid() {
  const n = gridCols * gridRows;
  gridData = new Uint8Array(n);
  for (let i=0; i<n; i++) gridData[i] = 1;
  applyLoss(grdFlatten(cumLoss(activeRegion, currentYear)));
}

/* ─── CLEAR ORDER (region-dependent patterns) ─── */
function generateClearOrder() {
  const n = gridCols * gridRows;
  const indices = Array.from({length:n}, (_,i)=>i);
  const pattern = REGIONS[activeRegion].deforestPattern;

  const cx = gridCols/2, cy = gridRows/2;
  const vals = new Float64Array(n);

  for (let i=0; i<n; i++) {
    const row = Math.floor(i / gridCols);
    const col = i % gridCols;
    const nx = (col - cx)/cx, ny = (row - cy)/cy;
    const dist = Math.sqrt(nx*nx + ny*ny);
    const angle = Math.atan2(ny, nx);
    let v = 0;
    switch (pattern) {
      case 'road':
        // canyon streaks: diagonal band + distance from center
        const band = Math.abs(Math.sin(angle*3 + dist*4));
        v = band * 0.6 + (1 - dist*0.7) * 0.4;
        break;
      case 'scatter':
        // Congo: scattered small patches
        v = Math.sin(col*0.7)*Math.cos(row*0.5)*0.5 + noise2D(col,row)*0.5;
        break;
      case 'grid':
        // SE Asia: checkerboard plantation blocks
        const bx = Math.floor(col/4), by = Math.floor(row/4);
        v = ((bx+by)%2)*0.5 + noise2D(col,row)*0.5;
        break;
      case 'patchy':
        // Boreal: large irregular patches
        v = Math.sin(col*0.15)*Math.cos(row*0.2)*0.6 + noise2D(col,row)*0.4;
        break;
      default: v = Math.random();
    }
    vals[i] = Math.max(0,Math.min(1, v));
  }

  // sort by value descending (higher = cleared first)
  clearOrder = indices.sort((a,b)=>vals[b]-vals[a]);
}

function noise2D(x,y) {
  // simple deterministic hash noise
  let h = (x*374761393 + y*668265263) & 0xffffffff;
  h = ((h ^ (h>>13)) * 1274126177) & 0xffffffff;
  return (h ^ (h>>16)) / 0xffffffff;
}

/* ─── GRID DEFORESTATION ─── */
function grdFlatten(lossFrac) {
  return Math.max(0, Math.min(1, lossFrac));
}

function applyLoss(lossFrac) {
  const n = gridData.length;
  const stayAlive = Math.round(n * (1 - lossFrac));
  for (let i=0; i<n; i++) gridData[i] = 0;
  for (let i=0; i<Math.min(stayAlive, clearOrder.length); i++) {
    gridData[clearOrder[i]] = 1;
  }
}

/* ─── DRAW CANVAS ─── */
function drawCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  ctx.clearRect(0,0,w,h);

  // background
  ctx.fillStyle='#060a0e';
  ctx.fillRect(0,0,w,h);

  const pad = 16;
  const n = gridData.length;
  const r = REGIONS[activeRegion];
  const lossFrac = cumLoss(activeRegion, currentYear);

  // draw cells
  for (let i=0; i<n; i++) {
    if (!gridData[i]) continue;
    const col = i % gridCols;
    const row = Math.floor(i / gridCols);
    const x = pad + col * cellSize;
    const y = pad + row * cellSize;

    // proximity to cleared areas: check neighbors
    let neighborDead = 0;
    for (let dy=-2; dy<=2; dy++) {
      for (let dx=-2; dx<=2; dx++) {
        if (dx===0 && dy===0) continue;
        const nc = col+dx, nr = row+dy;
        if (nc<0||nc>=gridCols||nr<0||nr>=gridRows) continue;
        const ni = nr*gridCols + nc;
        if (ni<n && !gridData[ni]) neighborDead++;
      }
    }
    const stress = Math.min(1, neighborDead/12);

    // color interpolation: green → amber → red based on stress + loss
    if (lossFrac < 0.15) {
      ctx.fillStyle = `rgb(0,${160+Math.floor(95*(1-stress))},${80+Math.floor(40*(1-stress))})`;
    } else if (lossFrac < 0.35) {
      const r2 = Math.floor(0 + stress*180);
      const g2 = Math.floor(200 - lossFrac*250 - stress*80);
      ctx.fillStyle = `rgb(${r2},${Math.max(0,g2)},${Math.floor(50*(1-stress))})`;
    } else {
      const r3 = Math.floor(180 + stress*75);
      const g3 = Math.floor(Math.max(0, 120 - lossFrac*200 - stress*100));
      ctx.fillStyle = `rgb(${r3},${g3},${Math.floor(20*(1-stress))})`;
    }

    ctx.fillRect(x, y, cellSize-0.5, cellSize-0.5);
  }

  // draw overlay grid lines
  ctx.strokeStyle='rgba(255,255,255,0.015)';
  ctx.lineWidth=0.5;
  for (let col=0; col<=gridCols; col++) {
    const x = pad + col*cellSize;
    ctx.beginPath(); ctx.moveTo(x,pad); ctx.lineTo(x,pad+gridRows*cellSize); ctx.stroke();
  }
  for (let row=0; row<=gridRows; row++) {
    const y = pad + row*cellSize;
    ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(pad+gridCols*cellSize,y); ctx.stroke();
  }

  // corner coordinates
  ctx.font='4px JetBrains Mono, monospace';
  ctx.fillStyle='rgba(255,255,255,0.08)';
  ctx.fillText(`${currentYear} · ${r.short}`, pad+2, pad+gridRows*cellSize-2);
  ctx.fillText(`loss ${(lossFrac*100).toFixed(1)}%`, pad+2, pad+8);
}

/* ─── TELEMETRY COMPUTATION ─── */
function computeTelemetry() {
  const r = REGIONS[activeRegion];
  const lossFrac = cumLoss(activeRegion, currentYear);
  const initArea = r.initCover;
  const lostArea = initArea * lossFrac;
  const remainArea = initArea * (1 - lossFrac);

  // Loss velocity: year-over-year loss rate
  const prevLoss = cumLoss(activeRegion, Math.max(1990, currentYear-1));
  const lossVelocity = (lossFrac - prevLoss) * 100; // % per year

  // Fragmentation index: based on loss pattern
  // Count perimeter of cleared areas in grid
  const n = gridData.length;
  let edges = 0;
  for (let i=0; i<n; i++) {
    if (gridData[i]) continue; // count cleared cells that border alive
    const col = i % gridCols;
    const row = Math.floor(i / gridCols);
    for (let dy=-1; dy<=1; dy++) {
      for (let dx=-1; dx<=1; dx++) {
        if (dx===0 && dy===0) continue;
        const nc = col+dx, nr = row+dy;
        if (nc<0||nc>=gridCols||nr<0||nr>=gridRows) continue;
        if (gridData[nr*gridCols+nc]) edges++;
      }
    }
  }
  const totalPossibleEdges = n * 4;
  const fragIdx = Math.min(100, (edges / Math.max(1,totalPossibleEdges)) * 300);

  // Carbon loss: C_loss = A_lost * W_biomass
  const carbonLoss = lostArea * r.carbonWeight; // MtCO₂

  return { lossFrac, lostArea, remainArea, lossVelocity, fragIdx, carbonLoss, initArea };
}

function renderTelemetry(tm) {
  const r = REGIONS[activeRegion];
  const pct = (tm.lossFrac*100).toFixed(1);
  const remainPct = ((1-tm.lossFrac)*100).toFixed(1);

  tmBody.innerHTML = `
    <div class="tm-card">
      <div class="tm-lbl">● Region Overview</div>
      <div class="tm-val" style="color:${r.color}">${r.short}</div>
      <div class="tm-sub">${r.label} · era ${currentYear}</div>
    </div>
    <div class="tm-card">
      <div class="tm-row"><span class="tm-rl">Total Area</span><span class="tm-rv">${tm.initArea.toFixed(0)} Mha</span></div>
      <div class="tm-row"><span class="tm-rl">Remaining</span><span class="tm-rv">${tm.remainArea.toFixed(1)} Mha</span></div>
      <div class="tm-row"><span class="tm-rl">Destroyed</span><span class="tm-rv">${tm.lostArea.toFixed(1)} Mha (${pct}%)</span></div>
    </div>
    <div class="tm-card">
      <div class="tm-lbl">● Loss Dynamics</div>
      <div class="tm-row"><span class="tm-rl">Loss Velocity</span><span class="tm-rv" style="color:${tm.lossVelocity>2.5?'#ff1744':tm.lossVelocity>1?'#ffb800':'#00e676'}">${tm.lossVelocity.toFixed(2)} %/yr</span></div>
      <div class="tm-row"><span class="tm-rl">Fragmentation Index</span><span class="tm-rv" style="color:${tm.fragIdx>30?'#ff1744':tm.fragIdx>15?'#ffb800':'#00e676'}">${tm.fragIdx.toFixed(1)}%</span></div>
    </div>
    <div class="tm-card">
      <div class="tm-lbl">● Carbon Accounting</div>
      <div class="tm-val" style="${currentYear>2005?'color:#ff1744':'color:#ffb800'}">${tm.carbonLoss.toFixed(1)}</div>
      <div class="tm-sub">Megatons CO₂ equivalent released</div>
    </div>
    <div class="tm-card">
      <div class="tm-row"><span class="tm-rl">${r.pop.label}</span><span class="tm-rv">${r.pop.val}</span></div>
      <div class="tm-row"><span class="tm-rl">${r.bio.label}</span><span class="tm-rv">${r.bio.val}</span></div>
      <div class="tm-row"><span class="tm-rl">Deforestation Pattern</span><span class="tm-rv">${r.deforestPattern.toUpperCase()}</span></div>
      <div class="tm-row"><span class="tm-rl">Carbon Weight</span><span class="tm-rv">${r.carbonWeight.toFixed(2)} MtCO₂/ha</span></div>
    </div>
  `;

  // top metrics
  coverVal.textContent = remainPct + '%';
  lostVal.textContent = pct + '%';
  carbonVal.textContent = tm.carbonLoss.toFixed(0) + ' Mt';

  // gauges
  gmRemain.style.width = remainPct + '%';
  gmRemain.style.background = `hsl(${parseInt(remainPct)*1.2},80%,50%)`;
  gmFrag.style.width = Math.min(100, tm.fragIdx) + '%';
  gmFrag.style.background = tm.fragIdx>30?'#ff1744':tm.fragIdx>15?'#ffb800':'#00e676';
  const carbonPct = Math.min(100, (tm.carbonLoss / (tm.initArea * REGIONS[activeRegion].carbonWeight * 0.5))*100);
  gmCarbon.style.width = carbonPct + '%';
  gmCarbon.style.background = `#ff1744`;
}

/* ─── UPDATE ALL ─── */
function updateAll() {
  applyLoss(grdFlatten(cumLoss(activeRegion, currentYear)));
  drawCanvas();
  const tm = computeTelemetry();
  renderTelemetry(tm);
  tlYear.textContent = currentYear;
  tlSlider.value = currentYear;
  mapHint.textContent = `YEAR ${currentYear}`;
}

/* ─── TOAST ─── */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  toastContainer.appendChild(el);
  setTimeout(() => { el.classList.add('leave'); setTimeout(() => el.remove(), 300); }, 2000);
}

/* ─── PLAYBACK ENGINE ─── */
function playbackLoop(timestamp) {
  if (!playing) return;
  frameTick++;

  // advance year roughly every 50ms -> 1 year per 0.5s at 60fps
  if (frameTick % 5 === 0) {
    if (currentYear < 2026) {
      currentYear++;
      updateAll();
      if (currentYear >= 2024) {
        mapHint.textContent = '⚠ CRITICAL DEFORESTATION';
        mapHint.style.color = '#ff1744';
      } else if (currentYear >= 2010) {
        mapHint.textContent = '⚠ RAPID CANOPY LOSS';
        mapHint.style.color = '#ffb800';
      } else {
        mapHint.textContent = `YEAR ${currentYear}`;
        mapHint.style.color = '';
      }
    } else {
      stopPlayback();
      toast('Playback complete — end of epoch reached (2026)');
      return;
    }
  }

  rafId = requestAnimationFrame(playbackLoop);
}

function startPlayback() {
  if (playing) return;
  if (currentYear >= 2026) {
    toast('End of timeline reached. Restore canopy arrays to replay.');
    return;
  }
  playing = true;
  frameTick = 0;
  tlStatus.textContent = '● PLAYING';
  tlStatus.style.color = '#00e676';
  btnPlay.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><polygon points="5 3 19 12 5 21 5 3"/></svg> PLAYING...`;
  btnPlay.style.opacity = '0.6';
  mapHint.textContent = '▶ PLAYBACK ACTIVE';
  mapHint.style.color = '#00e676';
  toast('Historical playback initiated');
  rafId = requestAnimationFrame(playbackLoop);
}

function stopPlayback() {
  playing = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  tlStatus.textContent = '■ HALTED';
  tlStatus.style.color = '#ffb800';
  btnPlay.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><polygon points="5 3 19 12 5 21 5 3"/></svg> Initiate Historical Playback Loop`;
  btnPlay.style.opacity = '1';
  mapHint.textContent = 'HALTED';
  mapHint.style.color = '#ffb800';
  toast('Playback halted');
}

function restoreGrid() {
  stopPlayback();
  currentYear = 1990;
  tlYear.textContent = '1990';
  tlSlider.value = '1990';
  mapHint.textContent = 'RESTORED';
  mapHint.style.color = '#00e676';
  tlStatus.textContent = 'RESTORED';
  tlStatus.style.color = '#00e676';
  seedGrid();
  updateAll();
  toast('Global canopy arrays restored to 1990 baseline');
}

/* ─── REGION SWITCH ─── */
function switchRegion(key) {
  if (key === activeRegion) return;
  stopPlayback();
  activeRegion = key;
  document.querySelectorAll('.region-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.region === key);
  });
  generateClearOrder();
  seedGrid();
  updateAll();
  topBadge.textContent = REGIONS[key].short.toUpperCase() + ' MONITOR';
  topBadge.style.color = REGIONS[key].color;
  topBadge.style.borderColor = REGIONS[key].color + '33';
  toast(`Switched to ${REGIONS[key].short}`);
}

/* ─── INIT ─── */
function init() {
  initCanvas();
  updateAll();
  topBadge.textContent = REGIONS[activeRegion].short.toUpperCase() + ' MONITOR';
  topBadge.style.color = REGIONS[activeRegion].color;
  topBadge.style.borderColor = REGIONS[activeRegion].color + '33';

  // events
  btnPlay.addEventListener('click', () => playing ? stopPlayback() : startPlayback());
  btnHalt.addEventListener('click', stopPlayback);
  btnRestore.addEventListener('click', restoreGrid);

  tlSlider.addEventListener('input', () => {
    if (playing) stopPlayback();
    currentYear = parseInt(tlSlider.value);
    updateAll();
  });

  document.querySelectorAll('.region-btn').forEach(btn => {
    btn.addEventListener('click', () => switchRegion(btn.dataset.region));
  });

  window.addEventListener('resize', () => {
    initCanvas();
    updateAll();
  });

  // keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === ' ') { e.preventDefault(); playing ? stopPlayback() : startPlayback(); }
    if (e.key === 'r' || e.key === 'R') restoreGrid();
    if (e.key === 'h' || e.key === 'H') stopPlayback();
  });
}

document.addEventListener('DOMContentLoaded', init);
