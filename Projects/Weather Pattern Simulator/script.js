/* METEO-OS // Weather Pattern Simulator Engine */

// DOM Elements
const presetSelect = document.getElementById('weather-preset');
const telemetryTime = document.getElementById('telemetry-time');
const solarFill = document.getElementById('telemetry-solar-fill');
const solarVal = document.getElementById('telemetry-solar-val');
const brushBtns = document.querySelectorAll('.brush-btn');
const sliderBrushSize = document.getElementById('slider-brush-size');
const valBrushSize = document.getElementById('val-brush-size');
const toggleDiurnal = document.getElementById('toggle-diurnal');
const toggleCoastline = document.getElementById('toggle-coastline');
const sliderShear = document.getElementById('slider-shear');
const valShear = document.getElementById('val-shear');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');
const tabBtns = document.querySelectorAll('.tab-btn');
const mapCanvas = document.getElementById('map-canvas');
const chkWindVectors = document.getElementById('chk-wind-vectors');
const skyCanvas = document.getElementById('sky-canvas');
const selectedCellCoord = document.getElementById('selected-cell-coord');
const telemetryCellTemp = document.getElementById('telemetry-cell-temp');
const telemetryCellPressure = document.getElementById('telemetry-cell-pressure');
const telemetryCellHumidity = document.getElementById('telemetry-cell-humidity');
const telemetryCellClouds = document.getElementById('telemetry-cell-clouds');
const valMaxWind = document.getElementById('val-max-wind');
const barMaxWind = document.getElementById('bar-max-wind');
const valAvgClouds = document.getElementById('val-avg-clouds');
const barAvgClouds = document.getElementById('bar-avg-clouds');
const valCape = document.getElementById('val-cape');
const barCape = document.getElementById('bar-cape');
const alertsLog = document.getElementById('alerts-log');
const shakeEnvelope = document.getElementById('shake-envelope');

// Canvas Contexts
const mCtx = mapCanvas.getContext('2d');
const sCtx = skyCanvas.getContext('2d');

// Grid configuration
const GRID_SIZE = 20;
const NUM_CELLS = GRID_SIZE * GRID_SIZE;
let cells = [];

// Selected Cell Coordinate
let selectedX = 10;
let selectedY = 10;

// Interactive Brush settings
let brushProperty = 'temp'; // temp, pressure, moisture
let brushValue = 'hot';     // hot, cold, high, low, wet, dry
let brushRadius = 2;

// Map settings
let activeLayer = 'temp'; // temp, pressure, moisture, clouds
let showWindVectors = true;
let diurnalCycleActive = true;
let coastlineEnabled = true;
let globalWindShear = 0; // easterly wind shear (0 to 100)
let isRunning = true;
let timeOfDay = 12.0; // 0.0 to 24.0 hours
let frameCount = 0;

// Sky Particle Arrays
let skyParticles = [];
let tornadoDebris = [];
let lightningBolt = null;
let lightningFlashFrame = 0;

// Setup coordinates and dimensions on window resizing
let mW = 400;
let mH = 400;
let sW = 400;
let sH = 300;

function resizeCanvases() {
  const mParent = mapCanvas.parentElement;
  mapCanvas.width = mParent.clientWidth;
  mapCanvas.height = mParent.clientHeight || 300;
  mW = mapCanvas.width;
  mH = mapCanvas.height;

  const sParent = skyCanvas.parentElement;
  skyCanvas.width = sParent.clientWidth;
  skyCanvas.height = sParent.clientHeight || 260;
  sW = skyCanvas.width;
  sH = skyCanvas.height;
}

// Map Presets Setup configurations
const presets = {
  afternoon_storm: {
    temp: 35.0,
    pressure: 1010.0,
    moisture: 80.0,
    diurnal: true,
    coastline: true,
    shear: 0,
    description: "High thermal convection creates strong updrafts and severe rain storms over land cells."
  },
  cyclone: {
    temp: 28.0,
    pressure: 1008.0,
    moisture: 95.0,
    diurnal: false,
    coastline: false, // open ocean
    shear: 10,
    description: "Coriolis deflection spins winds around a central oceanic deep low pressure eye."
  },
  tornado_alley: {
    temp: 20.0,
    pressure: 1012.0,
    moisture: 50.0,
    diurnal: false,
    coastline: false,
    shear: 65,
    description: "Cold dry air mass from the north collides with warm humid air from the south, creating extreme shear."
  },
  blizzard: {
    temp: -8.0,
    pressure: 1015.0,
    moisture: 75.0,
    diurnal: true,
    coastline: true,
    shear: 80,
    description: "Freezing sub-zero gale force winds carry dense blowing snow clouds."
  },
  desert_heatwave: {
    temp: 45.0,
    pressure: 1028.0,
    moisture: 2.0,
    diurnal: true,
    coastline: false,
    shear: 5,
    description: "A stable high-pressure dome blocks cloud formation over arid desert plains."
  }
};

// Initial cells grid layout instantiations
function initGrid() {
  cells = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const idx = y * GRID_SIZE + x;
      // coastline divides water (x < 8) and land (x >= 8)
      const isOcean = x < 8;
      
      cells.push({
        x: x,
        y: y,
        temp: isOcean ? 22.0 : 25.0,
        pressure: 1013.0,
        moisture: isOcean ? 85.0 : 45.0,
        clouds: 0.1,
        vx: 0.0,
        vy: 0.0,
        rain: 0.0,
        snow: 0.0,
        terrain: isOcean ? 0 : 1 // 0: ocean, 1: land
      });
    }
  }
}

// Reset grid back to default initial layout
function resetSimulation() {
  initGrid();
  timeOfDay = 12.0;
  frameCount = 0;
  skyParticles = [];
  tornadoDebris = [];
  lightningBolt = null;
  lightningFlashFrame = 0;
  
  presetSelect.value = 'afternoon_storm';
  applyPreset('afternoon_storm');
}

// Set slider parameters matching selections
function applyPreset(presetName) {
  const p = presets[presetName];
  if (!p) return;
  
  toggleDiurnal.checked = p.diurnal;
  toggleCoastline.checked = p.coastline;
  sliderShear.value = p.shear;
  
  diurnalCycleActive = p.diurnal;
  coastlineEnabled = p.coastline;
  globalWindShear = p.shear;
  valShear.textContent = `${globalWindShear}%`;
  
  // Custom presets instantiations
  initGrid();
  
  if (presetName === 'afternoon_storm') {
    timeOfDay = 13.0; // Early afternoon peak heating
    for (let i = 0; i < NUM_CELLS; i++) {
      const c = cells[i];
      c.terrain = coastlineEnabled && c.x < 8 ? 0 : 1;
      c.temp = c.terrain === 1 ? 34.0 : 22.0;
      c.pressure = c.terrain === 1 ? 1008.0 : 1014.0;
      c.moisture = c.terrain === 1 ? 75.0 : 85.0;
      c.clouds = c.terrain === 1 ? 0.35 : 0.1;
    }
  } else if (presetName === 'cyclone') {
    // Whole map is warm tropical ocean, low pressure eye at center
    for (let i = 0; i < NUM_CELLS; i++) {
      const c = cells[i];
      c.terrain = 0; // water
      c.temp = 28.0;
      c.moisture = 95.0;
      
      const dx = c.x - 10;
      const dy = c.y - 10;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Eye is extremely low pressure
      c.pressure = 982.0 + dist * 2.8;
      c.clouds = Math.max(0, 0.95 - dist * 0.06);
      if (dist < 1.5) {
        c.clouds = 0.05; // eye is clear
        c.pressure = 978.0;
      }
    }
  } else if (presetName === 'tornado_alley') {
    // Northern cold front colliding with southern humid jet
    for (let i = 0; i < NUM_CELLS; i++) {
      const c = cells[i];
      c.terrain = 1; // plains
      if (c.y < 10) {
        // Cold front
        c.temp = 6.0 + (10 - c.y) * 0.5;
        c.moisture = 15.0;
        c.pressure = 1018.0;
        c.vy = 2.0; // blowing south
        c.vx = 0.5;
      } else {
        // Warm moist front
        c.temp = 32.0 - (c.y - 10) * 0.4;
        c.moisture = 85.0;
        c.pressure = 1004.0;
        c.vy = -1.8; // blowing north
        c.vx = 1.0;
      }
      c.clouds = c.y === 10 ? 0.8 : 0.2;
    }
  } else if (presetName === 'blizzard') {
    timeOfDay = 23.0; // Night gale
    for (let i = 0; i < NUM_CELLS; i++) {
      const c = cells[i];
      c.terrain = coastlineEnabled && c.x < 8 ? 0 : 1;
      c.temp = c.terrain === 1 ? -9.0 : -2.0;
      c.pressure = 1010.0 + (c.x * 0.5);
      c.moisture = 80.0;
      c.clouds = 0.85;
      c.vx = -3.5; // strong westerly gale
    }
  } else if (presetName === 'desert_heatwave') {
    timeOfDay = 14.0;
    for (let i = 0; i < NUM_CELLS; i++) {
      const c = cells[i];
      c.terrain = 1; // dry desert land
      c.temp = 44.0;
      c.pressure = 1026.0;
      c.moisture = 3.0;
      c.clouds = 0.0;
    }
  }
}

// Update settings readouts from slider elements
function updateParamsFromSliders() {
  brushRadius = parseInt(sliderBrushSize.value);
  valBrushSize.textContent = `${brushRadius} Cell${brushRadius > 1 ? 's' : ''}`;
  
  globalWindShear = parseInt(sliderShear.value);
  valShear.textContent = `${globalWindShear}%`;
}

// Paint Brush actions
function applyPaintBrush(gx, gy) {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const dx = x - gx;
      const dy = y - gy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist <= brushRadius) {
        const idx = y * GRID_SIZE + x;
        const cell = cells[idx];
        const falloff = 1 - (dist / (brushRadius + 1));
        
        if (brushProperty === 'temp') {
          if (brushValue === 'hot') {
            cell.temp = cell.temp + (46.0 - cell.temp) * falloff;
          } else {
            cell.temp = cell.temp + (-6.0 - cell.temp) * falloff;
          }
        } else if (brushProperty === 'pressure') {
          if (brushValue === 'high') {
            cell.pressure = cell.pressure + (1038.0 - cell.pressure) * falloff;
          } else {
            cell.pressure = cell.pressure + (976.0 - cell.pressure) * falloff;
          }
        } else if (brushProperty === 'moisture') {
          if (brushValue === 'wet') {
            cell.moisture = cell.moisture + (100.0 - cell.moisture) * falloff;
          } else {
            cell.moisture = cell.moisture + (0.0 - cell.moisture) * falloff;
          }
        }
      }
    }
  }
}

// Clausius-Clapeyron Approximation (humidity capacity based on temp)
function getSaturationCapacity(temp) {
  // vapor pressure capacities double roughly every 10 degrees
  return Math.max(4.0, 10.0 * Math.pow(1.065, temp - 12.0));
}

// Physics Loop equations
function updateAtmosphericPhysics() {
  // 1. Cycle Diurnal Solar Insolation
  if (diurnalCycleActive) {
    timeOfDay = (timeOfDay + 0.03) % 24.0;
  }
  
  const solarInsolation = Math.max(0, Math.sin((timeOfDay - 6.0) / 12.0 * Math.PI));
  telemetryTime.textContent = `${Math.floor(timeOfDay).toString().padStart(2, '0')}:${Math.floor((timeOfDay % 1.0) * 60).toString().padStart(2, '0')}`;
  solarFill.style.width = `${Math.round(solarInsolation * 100)}%`;
  solarVal.textContent = `${Math.round(solarInsolation * 100)}%`;
  
  // 2. Local Heating & Cooling
  for (let i = 0; i < NUM_CELLS; i++) {
    const c = cells[i];
    
    // Coastal terrain override
    c.terrain = coastlineEnabled && c.x < 8 ? 0 : 1;
    
    if (c.terrain === 1) {
      // Land heats rapidly under insolation, cools at night
      c.temp += solarInsolation * 0.16;
      c.temp -= 0.082; // nocturnal radiative cooling
    } else {
      // Ocean maintains higher heat inertia, decays slowly to baseline 22°C
      c.temp += (21.5 - c.temp) * 0.008;
    }
    
    // Clamp temperature limits
    c.temp = Math.max(-12.0, Math.min(48.0, c.temp));
    
    // 3. Thermal feedback to surface pressure (Warm air expands -> Low Pressure)
    const targetPressure = 1013.0 - (c.temp - 18.0) * 0.8;
    c.pressure += (targetPressure - c.pressure) * 0.08;
    c.pressure = Math.max(970.0, Math.min(1045.0, c.pressure));
    
    // 4. Evaporation cycle
    const evapRate = c.terrain === 0 ? 0.055 : 0.015;
    if (c.temp > 0) {
      c.moisture += c.temp * evapRate;
    }
    c.moisture = Math.max(0.0, Math.min(100.0, c.moisture));
  }
  
  // 5. Calculate wind velocities via Pressure Gradient Force (-grad P) & Coriolis
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const idx = y * GRID_SIZE + x;
      const c = cells[idx];
      
      const leftP = cells[y * GRID_SIZE + Math.max(0, x - 1)].pressure;
      const rightP = cells[y * GRID_SIZE + Math.min(GRID_SIZE - 1, x + 1)].pressure;
      const upP = cells[Math.max(0, y - 1) * GRID_SIZE + x].pressure;
      const downP = cells[Math.min(GRID_SIZE - 1, y + 1) * GRID_SIZE + x].pressure;
      
      // Wind accelerates from High P to Low P
      const pgfx = (leftP - rightP) * 0.13;
      const pgfy = (upP - downP) * 0.13;
      
      c.vx += pgfx;
      c.vy += pgfy;
      
      // Coriolis deflection (clockwise deflection in Northern Hemisphere)
      const coriolisFactor = 0.075;
      const vxOld = c.vx;
      c.vx += c.vy * coriolisFactor;
      c.vy -= vxOld * coriolisFactor;
      
      // Friction damping drag
      c.vx *= 0.88;
      c.vy *= 0.88;
      
      // Westerly global wind shear overlay
      c.vx += globalWindShear * 0.012;
    }
  }
  
  // 6. Upwind Semi-Lagrangian Advection Transport (Heat, Moisture, Clouds advected by wind vectors)
  let nextTemp = new Array(NUM_CELLS);
  let nextMoisture = new Array(NUM_CELLS);
  let nextClouds = new Array(NUM_CELLS);
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const idx = y * GRID_SIZE + x;
      const c = cells[idx];
      
      // Trace back wind coordinate vector
      const srcX = Math.max(0, Math.min(GRID_SIZE - 1, x - c.vx * 0.45));
      const srcY = Math.max(0, Math.min(GRID_SIZE - 1, y - c.vy * 0.45));
      
      // Bilinear interpolation
      const x0 = Math.floor(srcX);
      const x1 = Math.min(GRID_SIZE - 1, x0 + 1);
      const y0 = Math.floor(srcY);
      const y1 = Math.min(GRID_SIZE - 1, y0 + 1);
      
      const tx = srcX - x0;
      const ty = srcY - y0;
      
      const bilinearInterp = (prop) => {
        const val00 = cells[y0 * GRID_SIZE + x0][prop];
        const val10 = cells[y0 * GRID_SIZE + x1][prop];
        const val01 = cells[y1 * GRID_SIZE + x0][prop];
        const val11 = cells[y1 * GRID_SIZE + x1][prop];
        return val00 * (1 - tx) * (1 - ty) +
               val10 * tx * (1 - ty) +
               val01 * (1 - tx) * ty +
               val11 * tx * ty;
      };
      
      nextTemp[idx] = bilinearInterp('temp');
      nextMoisture[idx] = bilinearInterp('moisture');
      nextClouds[idx] = bilinearInterp('clouds');
    }
  }
  
  // Copy back
  for (let i = 0; i < NUM_CELLS; i++) {
    cells[i].temp = nextTemp[i];
    cells[i].moisture = nextMoisture[i];
    cells[i].clouds = nextClouds[i];
  }
  
  // 7. Thermal conduction diffusion & Relative humidity condensation
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const idx = y * GRID_SIZE + x;
      const c = cells[idx];
      
      // Conduction averaging neighbors
      let sumTemp = 0;
      let sumMoist = 0;
      let count = 0;
      
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            sumTemp += cells[ny * GRID_SIZE + nx].temp;
            sumMoist += cells[ny * GRID_SIZE + nx].moisture;
            count++;
          }
        }
      }
      
      c.temp += (sumTemp / count - c.temp) * 0.085;
      c.moisture += (sumMoist / count - c.moisture) * 0.085;
      
      // Dew Point Condensation (Relative humidity caps)
      const capacity = getSaturationCapacity(c.temp);
      if (c.moisture > capacity) {
        const condense = (c.moisture - capacity) * 0.28;
        c.moisture -= condense;
        c.clouds += condense * 0.55;
      }
      
      // Cloud evaporation in dry air
      if (c.clouds > 0 && c.moisture < capacity * 0.75) {
        const evap = Math.min(c.clouds, (capacity * 0.75 - c.moisture) * 0.08);
        c.clouds -= evap;
        c.moisture += evap;
      }
      
      c.clouds = Math.max(0.0, Math.min(1.0, c.clouds));
      
      // Precipitation triggers (Clouds > 0.45 threshold)
      if (c.clouds > 0.45) {
        const rate = (c.clouds - 0.45) * 0.2;
        c.clouds -= rate * 0.45;
        if (c.temp < 1.0) {
          c.snow = rate;
          c.rain = 0.0;
        } else {
          c.rain = rate;
          c.snow = 0.0;
        }
      } else {
        c.rain = 0.0;
        c.snow = 0.0;
      }
    }
  }
}

// Map Render Canvas Visualizer
function drawMapGrid() {
  mCtx.clearRect(0, 0, mW, mH);
  
  const cellW = mW / GRID_SIZE;
  const cellH = mH / GRID_SIZE;
  
  // Render Layer maps
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const idx = y * GRID_SIZE + x;
      const c = cells[idx];
      
      if (activeLayer === 'temp') {
        // HSL temperature: Cold Blue (240) to Hot Red (0)
        // range scaled -10°C to 45°C
        const tempClamped = Math.max(-10.0, Math.min(45.0, c.temp));
        const ratio = (tempClamped + 10.0) / 55.0; // 0 to 1
        const hue = 240 - ratio * 240;
        mCtx.fillStyle = `hsl(${hue}, 85%, 42%)`;
        mCtx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
      } else if (activeLayer === 'pressure') {
        // Low P: Deep Violet (#8b5cf6) to High P: Amber (#f59e0b)
        const pressClamped = Math.max(980.0, Math.min(1038.0, c.pressure));
        const ratio = (pressClamped - 980.0) / 58.0;
        
        // Linear LERP colors
        const r = Math.floor(139 + (245 - 139) * ratio);
        const g = Math.floor(92 + (158 - 92) * ratio);
        const b = Math.floor(246 + (11 - 246) * ratio);
        
        mCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        mCtx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
      } else if (activeLayer === 'moisture') {
        // Dry Brown (#78350f) to Humid Cyan (#06b6d4)
        const ratio = c.moisture / 100.0;
        const r = Math.floor(120 + (6 - 120) * ratio);
        const g = Math.floor(53 + (182 - 53) * ratio);
        const b = Math.floor(15 + (212 - 15) * ratio);
        
        mCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        mCtx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
      } else if (activeLayer === 'clouds') {
        // Draw physical terrain baseline first
        if (c.terrain === 0) {
          mCtx.fillStyle = '#0a1428'; // Dark ocean
        } else {
          mCtx.fillStyle = '#122518'; // Dark land plains
        }
        mCtx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
        
        // Overlay cloud cover
        if (c.clouds > 0.05) {
          mCtx.fillStyle = `rgba(255, 255, 255, ${c.clouds * 0.88})`;
          mCtx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
      
      // If snow falls, add a small white flake texture
      if (c.snow > 0.02 && activeLayer !== 'clouds') {
        mCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        mCtx.fillRect(x * cellW + cellW/2 - 1.5, y * cellH + cellH/2 - 1.5, 3, 3);
      }
      
      // If rain falls, add small blue overlay
      if (c.rain > 0.02 && activeLayer !== 'clouds' && activeLayer !== 'moisture') {
        mCtx.fillStyle = 'rgba(6, 182, 212, 0.3)';
        mCtx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);
      }
    }
  }

  // Draw Coastline overlay indicator
  if (coastlineEnabled) {
    mCtx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    mCtx.lineWidth = 2;
    mCtx.setLineDash([4, 4]);
    mCtx.beginPath();
    mCtx.moveTo(8 * cellW, 0);
    mCtx.lineTo(8 * cellW, mH);
    mCtx.stroke();
    mCtx.setLineDash([]);
  }

  // Draw Wind Vector arrows overlay
  if (showWindVectors) {
    mCtx.strokeStyle = 'rgba(0, 229, 255, 0.42)';
    mCtx.fillStyle = 'rgba(0, 229, 255, 0.42)';
    mCtx.lineWidth = 1;
    
    // Grid skip to prevent density overlap
    const step = 1;
    
    for (let y = 0; y < GRID_SIZE; y += step) {
      for (let x = 0; x < GRID_SIZE; x += step) {
        const idx = y * GRID_SIZE + x;
        const c = cells[idx];
        
        const cx = x * cellW + cellW / 2;
        const cy = y * cellH + cellH / 2;
        
        const mag = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
        if (mag > 0.1) {
          const dx = (c.vx / mag) * Math.min(cellW * 0.9, mag * 2.2);
          const dy = (c.vy / mag) * Math.min(cellH * 0.9, mag * 2.2);
          
          mCtx.beginPath();
          mCtx.moveTo(cx, cy);
          mCtx.lineTo(cx + dx, cy + dy);
          mCtx.stroke();
          
          // Draw mini arrowhead
          const angle = Math.atan2(dy, dx);
          mCtx.beginPath();
          mCtx.moveTo(cx + dx, cy + dy);
          mCtx.lineTo(cx + dx - 3 * Math.cos(angle - Math.PI/6), cy + dy - 3 * Math.sin(angle - Math.PI/6));
          mCtx.lineTo(cx + dx - 3 * Math.cos(angle + Math.PI/6), cy + dy - 3 * Math.sin(angle + Math.PI/6));
          mCtx.closePath();
          mCtx.fill();
        }
      }
    }
  }

  // Draw selected cell highlight cursor
  mCtx.strokeStyle = '#00e5ff';
  mCtx.lineWidth = 2.2;
  mCtx.shadowColor = '#00e5ff';
  mCtx.shadowBlur = 6;
  mCtx.strokeRect(selectedX * cellW, selectedY * cellH, cellW, cellH);
  mCtx.shadowBlur = 0; // reset
}

// Blends Sky colors matching cycle
function getSkyColors(time, cloudsVal) {
  // Clear skies colors base
  let topClear, bottomClear;
  
  if (time >= 6.0 && time < 10.0) {
    // Dawn/Sunrise orange/yellow transitions
    const u = (time - 6.0) / 4.0;
    topClear = lerpColor('#1e1b4b', '#60a5fa', u); // dark indigo to light sky blue
    bottomClear = lerpColor('#b83a14', '#fef08a', u); // deep fiery orange to yellow
  } else if (time >= 10.0 && time < 16.0) {
    // Full Day blue sky
    topClear = '#2563eb';
    bottomClear = '#93c5fd';
  } else if (time >= 16.0 && time < 19.5) {
    // Dusk/Sunset
    const u = (time - 16.0) / 3.5;
    topClear = lerpColor('#2563eb', '#31103f', u);
    bottomClear = lerpColor('#93c5fd', '#f97316', u);
  } else {
    // Night stars darkness
    let u = 0;
    if (time >= 19.5) u = (time - 19.5) / 4.5; // sunset to midnight
    else u = (time / 6.0); // midnight to sunrise
    topClear = lerpColor('#181028', '#020308', u);
    bottomClear = lerpColor('#0c0714', '#05070e', u);
  }
  
  // Overcast storm slate colors LERP
  const topOvercast = '#334155'; // slate-700
  const bottomOvercast = '#1e293b'; // slate-800
  
  return {
    top: lerpColor(topClear, topOvercast, cloudsVal),
    bottom: lerpColor(bottomClear, bottomOvercast, cloudsVal)
  };
}

// Color interpolator LERP helper
function lerpColor(c1, c2, ratio) {
  // Parse hex
  const parse = (c) => {
    if (c.startsWith('#')) {
      if (c.length === 4) {
        return [
          parseInt(c[1]+c[1], 16),
          parseInt(c[2]+c[2], 16),
          parseInt(c[3]+c[3], 16)
        ];
      }
      return [
        parseInt(c.substring(1,3), 16),
        parseInt(c.substring(3,5), 16),
        parseInt(c.substring(5,7), 16)
      ];
    }
    return [0,0,0];
  };
  
  const rgb1 = parse(c1);
  const rgb2 = parse(c2);
  
  const r = Math.floor(rgb1[0] + (rgb2[0] - rgb1[0]) * ratio);
  const g = Math.floor(rgb1[1] + (rgb2[1] - rgb1[1]) * ratio);
  const b = Math.floor(rgb1[2] + (rgb2[2] - rgb1[2]) * ratio);
  
  return `rgb(${r}, ${g}, ${b})`;
}

// Micro sky viewport particle engine
function drawLocalSky() {
  // sCtx clear
  sCtx.clearRect(0, 0, sW, sH);
  
  const sIdx = selectedY * GRID_SIZE + selectedX;
  const cell = cells[sIdx];
  
  // Get interpolated sky background
  const colors = getSkyColors(timeOfDay, cell.clouds);
  const skyGrad = sCtx.createLinearGradient(0, 0, 0, sH);
  skyGrad.addColorStop(0, colors.top);
  skyGrad.addColorStop(1, colors.bottom);
  sCtx.fillStyle = skyGrad;
  sCtx.fillRect(0, 0, sW, sH);
  
  // Draw stars if clear night
  if (cell.clouds < 0.65 && (timeOfDay > 19.5 || timeOfDay < 6.0)) {
    sCtx.fillStyle = '#ffffff';
    sCtx.globalAlpha = 0.55 * (1.0 - cell.clouds);
    // Render static random points
    const starCount = 30;
    for (let i = 0; i < starCount; i++) {
      const sx = (Math.sin(i * 4325.2) * 0.5 + 0.5) * sW;
      const sy = (Math.cos(i * 123.5) * 0.5 + 0.5) * (sH * 0.6);
      const sr = Math.sin(frameCount * 0.05 + i) * 0.8 + 1.2;
      sCtx.beginPath();
      sCtx.arc(sx, sy, sr, 0, Math.PI * 2);
      sCtx.fill();
    }
    sCtx.globalAlpha = 1.0;
  }
  
  // Draw Sun or Moon
  const isDay = timeOfDay >= 6.0 && timeOfDay < 19.5;
  if (cell.clouds < 0.8) {
    sCtx.save();
    sCtx.globalAlpha = 1.0 - cell.clouds * 0.95;
    
    // Sine arcs
    const u = isDay ? (timeOfDay - 6.0) / 13.5 : (timeOfDay >= 19.5 ? (timeOfDay - 19.5)/10.5 : (timeOfDay + 4.5)/10.5);
    const bodyX = sW * 0.15 + u * (sW * 0.7);
    const bodyY = sH * 0.45 - Math.sin(u * Math.PI) * (sH * 0.28);
    
    if (isDay) {
      // Glow yellow sun
      const sunGrad = sCtx.createRadialGradient(bodyX, bodyY, 2, bodyX, bodyY, 22);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, '#fef08a');
      sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      sCtx.fillStyle = sunGrad;
      sCtx.beginPath();
      sCtx.arc(bodyX, bodyY, 22, 0, Math.PI * 2);
      sCtx.fill();
    } else {
      // Moon crescent
      sCtx.fillStyle = '#e2e8f0';
      sCtx.beginPath();
      sCtx.arc(bodyX, bodyY, 10, 0, Math.PI * 2);
      sCtx.fill();
      // shade crescent overlap
      sCtx.fillStyle = colors.top;
      sCtx.beginPath();
      sCtx.arc(bodyX - 4, bodyY - 2, 9, 0, Math.PI * 2);
      sCtx.fill();
    }
    sCtx.restore();
  }
  
  // Draw rolling horizon mountain hills landscape
  sCtx.fillStyle = '#0d111c';
  sCtx.beginPath();
  sCtx.moveTo(0, sH);
  sCtx.quadraticCurveTo(sW * 0.35, sH - 42, sW * 0.7, sH - 25);
  sCtx.quadraticCurveTo(sW * 0.85, sH - 18, sW, sH - 32);
  sCtx.lineTo(sW, sH);
  sCtx.lineTo(0, sH);
  sCtx.closePath();
  sCtx.fill();
  
  // Spawn local sky particle assets based on selected cell values
  const currentWind = cell.vx;
  const currentRain = cell.rain;
  const currentSnow = cell.snow;
  
  // Detect Severe storm features (Instability CAPE triggers lightning)
  const cellCape = Math.max(0, (cell.temp - 22.0) * cell.moisture * 1.6);
  const isSevereTornado = (cellCape > 2000 && Math.abs(globalWindShear) > 55 && cell.pressure < 998.0);
  
  // Hail triggers in convective unstable grids
  const isHailActive = (cellCape > 1400 && currentRain > 0.04 && cell.temp > 5.0 && cell.temp < 25.0);
  
  if (isRunning) {
    // Spawn wind streaks
    if (Math.abs(currentWind) > 0.8 && Math.random() < 0.12) {
      skyParticles.push({
        type: 'wind',
        x: currentWind > 0 ? -40 : sW + 40,
        y: Math.random() * (sH - 50) + 15,
        speed: (Math.random() * 3.5 + 2.0) * Math.sign(currentWind) + currentWind,
        length: Math.random() * 50 + 40,
        life: 140
      });
    }
    
    // Spawn Rain
    if (currentRain > 0.02) {
      const count = Math.floor(currentRain * 75);
      for (let r = 0; r < count; r++) {
        skyParticles.push({
          type: 'rain',
          x: Math.random() * sW,
          y: -10 - Math.random() * 20,
          speed: Math.random() * 6 + 11,
          size: Math.random() * 1.5 + 1.2,
          life: 80
        });
      }
    }
    
    // Spawn Snow
    if (currentSnow > 0.02) {
      const count = Math.floor(currentSnow * 45);
      for (let s = 0; s < count; s++) {
        skyParticles.push({
          type: 'snow',
          x: Math.random() * sW,
          y: -10 - Math.random() * 20,
          speed: Math.random() * 1.1 + 0.9,
          size: Math.random() * 3.2 + 1.2,
          offset: Math.random() * 100,
          life: 180
        });
      }
    }
    
    // Spawn Hail
    if (isHailActive && Math.random() < 0.28) {
      skyParticles.push({
        type: 'hail',
        x: Math.random() * sW,
        y: -10,
        vy: Math.random() * 5 + 9,
        vx: currentWind * 1.2,
        size: Math.random() * 2.5 + 2.0,
        bounceCount: 0,
        life: 90
      });
    }
    
    // Generate Lightning arcs in unstable cloud cover
    if (cell.clouds > 0.75 && cellCape > 1500 && Math.random() < 0.007) {
      triggerLightningBolt();
    }
  }
  
  // Render and update active particles
  for (let i = skyParticles.length - 1; i >= 0; i--) {
    const p = skyParticles[i];
    p.life--;
    
    if (p.life <= 0 || p.x < -100 || p.x > sW + 100) {
      skyParticles.splice(i, 1);
      continue;
    }
    
    if (p.type === 'wind') {
      p.x += p.speed;
      sCtx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      sCtx.lineWidth = 1;
      sCtx.beginPath();
      sCtx.moveTo(p.x, p.y);
      sCtx.lineTo(p.x - p.length * Math.sign(p.speed), p.y);
      sCtx.stroke();
    } else if (p.type === 'rain') {
      p.y += p.speed;
      // wind drift displacement offset
      p.x += currentWind * 0.8;
      
      if (p.y >= sH - 30) {
        // splash splash
        skyParticles.splice(i, 1);
        continue;
      }
      
      sCtx.strokeStyle = 'rgba(6, 182, 212, 0.55)';
      sCtx.lineWidth = p.size;
      sCtx.beginPath();
      sCtx.moveTo(p.x, p.y);
      sCtx.lineTo(p.x + currentWind * 0.45, p.y + 12);
      sCtx.stroke();
    } else if (p.type === 'snow') {
      p.y += p.speed;
      p.x += currentWind * 0.7 + Math.sin(frameCount * 0.04 + p.offset) * 0.6;
      
      if (p.y >= sH - 28) {
        skyParticles.splice(i, 1);
        continue;
      }
      
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      sCtx.beginPath();
      sCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      sCtx.fill();
    } else if (p.type === 'hail') {
      p.y += p.vy;
      p.x += p.vx;
      
      const horizonY = sH - 30 + Math.sin(p.x * 0.01) * 10;
      if (p.y >= horizonY) {
        p.bounceCount++;
        if (p.bounceCount >= 2) {
          skyParticles.splice(i, 1);
          continue;
        }
        // bounce vertical velocity invert
        p.vy = -p.vy * 0.32;
        p.y = horizonY - 3;
      }
      
      sCtx.fillStyle = 'rgba(226, 232, 240, 0.9)';
      sCtx.beginPath();
      sCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      sCtx.fill();
    }
  }
  
  // Render rotating Tornado funnel
  if (isSevereTornado) {
    drawTornadoViewport();
  }
  
  // Render Lightning flashes
  if (lightningBolt && lightningFlashFrame > 0) {
    lightningFlashFrame--;
    
    // Draw sky flashes
    sCtx.fillStyle = `rgba(224, 242, 254, ${lightningFlashFrame / 6 * 0.7})`;
    sCtx.fillRect(0, 0, sW, sH);
    
    // Draw fork path
    sCtx.strokeStyle = '#ffffff';
    sCtx.shadowColor = '#00e5ff';
    sCtx.shadowBlur = 15;
    sCtx.lineWidth = 2.5;
    sCtx.beginPath();
    sCtx.moveTo(lightningBolt.x, 0);
    for (let pt of lightningBolt.path) {
      sCtx.lineTo(pt.x, pt.y);
    }
    sCtx.stroke();
    sCtx.shadowBlur = 0;
    
    if (lightningFlashFrame <= 0) {
      lightningBolt = null;
    }
  }
}

// Spawns lighting coordinates path
function triggerLightningBolt() {
  const startX = Math.random() * sW;
  const path = [];
  let curX = startX;
  let curY = 0;
  
  const step = 10;
  while (curY < sH - 45) {
    curX += (Math.random() - 0.5) * 22;
    curY += Math.random() * 12 + 6;
    path.push({ x: curX, y: curY });
    
    // minor fork branch chance
    if (Math.random() < 0.15) {
      let forkX = curX;
      let forkY = curY;
      for (let f = 0; f < 3; f++) {
        forkX += (Math.random() - 0.2) * 12;
        forkY += 8;
      }
    }
  }
  
  lightningBolt = { x: startX, path: path };
  lightningFlashFrame = 6;
  
  // Trigger short violent container shake
  shakeEnvelope.classList.add('shaking-mild');
  setTimeout(() => {
    if (!shakeEnvelope.classList.contains('shaking-intense')) {
      shakeEnvelope.classList.remove('shaking-mild');
    }
  }, 180);
}

// 2.5D Tornado funnel vector rotators
function drawTornadoViewport() {
  sCtx.save();
  
  const tCenterX = sW / 2 + Math.sin(frameCount * 0.035) * 45;
  const cloudY = sH * 0.22;
  const floorY = sH - 30;
  
  // Draw base dust cloud
  const dustGrad = sCtx.createRadialGradient(tCenterX, floorY, 2, tCenterX, floorY, 35);
  dustGrad.addColorStop(0, 'rgba(30, 41, 59, 0.75)');
  dustGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  sCtx.fillStyle = dustGrad;
  sCtx.beginPath();
  sCtx.arc(tCenterX, floorY, 35, 0, Math.PI * 2);
  sCtx.fill();
  
  // Draw spinning columns layers
  sCtx.strokeStyle = 'rgba(71, 85, 105, 0.42)';
  sCtx.fillStyle = 'rgba(51, 65, 85, 0.15)';
  sCtx.lineWidth = 1.6;
  
  const steps = 38;
  for (let j = 0; j < steps; j++) {
    const ratio = j / steps; // 0: top clouds, 1: ground base
    const y = cloudY + (floorY - cloudY) * ratio;
    const w = 75 * (1.0 - ratio * 0.88) + Math.sin(frameCount * 0.28 + j) * 4.5;
    
    // rotational sine displacement
    const spinX = Math.sin(frameCount * 0.38 + j * 0.55) * w * 0.48;
    
    sCtx.beginPath();
    sCtx.ellipse(tCenterX + spinX * 0.2, y, w, w * 0.18, 0, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.stroke();
  }
  
  // Spawn debris particles spinning
  if (Math.random() < 0.65) {
    tornadoDebris.push({
      angle: Math.random() * Math.PI * 2,
      y: floorY - Math.random() * 90,
      radius: Math.random() * 2 + 1,
      speed: Math.random() * 0.16 + 0.12,
      color: Math.random() < 0.35 ? '#0f172a' : '#475569'
    });
  }
  
  for (let i = tornadoDebris.length - 1; i >= 0; i--) {
    const d = tornadoDebris[i];
    d.angle += d.speed;
    d.y -= 0.6; // ascend up funnel
    
    const ratio = (d.y - cloudY) / (floorY - cloudY);
    const w = 75 * (1.0 - ratio * 0.88);
    
    const dx = tCenterX + Math.cos(d.angle) * w;
    const dy = d.y;
    
    if (d.y < cloudY) {
      tornadoDebris.splice(i, 1);
      continue;
    }
    
    sCtx.fillStyle = d.color;
    sCtx.beginPath();
    sCtx.arc(dx, dy, d.radius, 0, Math.PI * 2);
    sCtx.fill();
  }
  
  sCtx.restore();
}

// Compute metrics averages and warnings advisories
function updateMeteoTelemetry() {
  let totalClouds = 0;
  let maxWindVal = 0.0;
  let maxInstability = 0.0;
  
  for (let i = 0; i < NUM_CELLS; i++) {
    const c = cells[i];
    totalClouds += c.clouds;
    
    const windSpeedClamped = Math.sqrt(c.vx * c.vx + c.vy * c.vy) * 20.0; // scaled representational value
    if (windSpeedClamped > maxWindVal) {
      maxWindVal = windSpeedClamped;
    }
    
    // CAPE Instability formula based on Temperature and humidity:
    // Convection increases with high temperature (>22) and moisture content
    const instabilityVal = Math.max(0, (c.temp - 21.0) * c.moisture * 1.85);
    if (instabilityVal > maxInstability) {
      maxInstability = instabilityVal;
    }
  }
  
  const avgCloudsVal = (totalClouds / NUM_CELLS) * 100.0;
  
  // 1. Max Wind Speed Updates
  valMaxWind.textContent = `${maxWindVal.toFixed(0)} km/h`;
  // progress scaling cap at 120 km/h for 100% fill
  const windFill = Math.min(100, (maxWindVal / 120) * 100);
  barMaxWind.style.width = `${windFill}%`;
  
  // 2. Avg Cloud Cover updates
  valAvgClouds.textContent = `${avgCloudsVal.toFixed(0)}%`;
  barAvgClouds.style.width = `${avgCloudsVal}%`;
  
  // 3. CAPE Instability Index updates
  let capeText = '';
  let capeFill = 0;
  
  if (maxInstability < 500) {
    capeText = `Low (${maxInstability.toFixed(0)} J)`;
    capeFill = (maxInstability / 500) * 20; // 0 to 20%
    barCape.className = 'progress-fill cyan';
  } else if (maxInstability < 1500) {
    capeText = `Moderate (${maxInstability.toFixed(0)} J)`;
    capeFill = 20 + ((maxInstability - 500) / 1000) * 40; // 20% to 60%
    barCape.className = 'progress-fill white';
  } else if (maxInstability < 2500) {
    capeText = `High (${maxInstability.toFixed(0)} J)`;
    capeFill = 60 + ((maxInstability - 1500) / 1000) * 30; // 60% to 90%
    barCape.className = 'progress-fill yellow';
  } else {
    capeText = `Extreme (${maxInstability.toFixed(0)} J)`;
    capeFill = 90 + Math.min(10, ((maxInstability - 2500) / 1500) * 10);
    barCape.className = 'progress-fill yellow'; // amber
  }
  valCape.textContent = capeText;
  barCape.style.width = `${capeFill}%`;
  
  // 4. Update NWS alerts log
  updateAlertsLog(maxWindVal, avgCloudsVal, maxInstability);
}

// Generate severe weather alerts matching meteorology thresholds
function updateAlertsLog(maxWind, avgClouds, maxInstability) {
  let html = '';
  
  // Get active cell indicators
  const sIdx = selectedY * GRID_SIZE + selectedX;
  const sc = cells[sIdx];
  const scInstability = Math.max(0, (sc.temp - 21.0) * sc.moisture * 1.85);
  
  // Conditions triggers
  const isTornado = (maxInstability > 2200 && globalWindShear >= 60 && sc.pressure < 999.0);
  const isBlizzard = (sc.temp < 1.0 && maxWind > 55.0 && sc.snow > 0.05);
  const isSevereStorm = (scInstability > 1500 && sc.clouds > 0.8 && sc.rain > 0.06);
  const isCyclone = (sc.terrain === 0 && sc.pressure < 992.0 && maxWind > 65.0);
  const isHeatwave = (sc.temp > 41.0);
  
  // Container shaker checks
  shakeEnvelope.classList.remove('shaking-mild', 'shaking-intense');
  if (isTornado || isCyclone) {
    shakeEnvelope.classList.add('shaking-intense');
  } else if (isBlizzard || isSevereStorm) {
    shakeEnvelope.classList.add('shaking-mild');
  }
  
  if (isTornado) {
    html += `
      <div class="alert-item danger">
        <span class="alert-icon">🌪️</span>
        <div>
          <strong>TORNADO WARNING:</strong> Extreme wind shear and high instability (CAPE > 2000 J/kg) have spawned a rotating convective vortex. Immediate shelter advised!
        </div>
      </div>
    `;
  }
  
  if (isCyclone) {
    html += `
      <div class="alert-item danger">
        <span class="alert-icon">🌀</span>
        <div>
          <strong>CYCLONE WATCH:</strong> Sub-pressure eye (${sc.pressure.toFixed(0)} hPa) over warm ocean water exhibits organized Coriolis spiral winds exceeding 65 km/h.
        </div>
      </div>
    `;
  }
  
  if (isBlizzard) {
    html += `
      <div class="alert-item danger">
        <span class="alert-icon">❄️</span>
        <div>
          <strong>BLIZZARD WARNING:</strong> Sub-freezing temperatures (${sc.temp.toFixed(1)}°C) accompanied by gale force wind shear. Visibility is near zero in dense blowing snow.
        </div>
      </div>
    `;
  }
  
  if (isSevereStorm && !isTornado && !isCyclone) {
    html += `
      <div class="alert-item warn">
        <span class="alert-icon">⚡</span>
        <div>
          <strong>SEVERE THUNDERSTORM WARNING:</strong> Rapid updrafts and high atmospheric vapor condensation. Severe precipitation and dangerous lightning discharge active.
        </div>
      </div>
    `;
  }
  
  if (isHeatwave) {
    html += `
      <div class="alert-item warn">
        <span class="alert-icon">☀️</span>
        <div>
          <strong>EXCESSIVE HEAT ADVISORY:</strong> High temperature dome peaking at ${sc.temp.toFixed(1)}°C. Avoid outdoor operations under extreme thermal load index.
        </div>
      </div>
    `;
  }
  
  if (html === '') {
    // Normal / stable state
    html = `
      <div class="alert-item safe">
        <span class="alert-icon">✅</span>
        <div>
          <strong>Advisories Normal:</strong> Atmospheric grids are stable. No active geophysics alerts or warning advisories are in effect for this coordinates deck.
        </div>
      </div>
    `;
  }
  
  alertsLog.innerHTML = html;
}

// Telemetry overlay readouts update
function updateTelemetryOverlay() {
  const sIdx = selectedY * GRID_SIZE + selectedX;
  const c = cells[sIdx];
  
  selectedCellCoord.textContent = `CELL: (${c.x}, ${c.y})`;
  telemetryCellTemp.textContent = `${c.temp.toFixed(1)} °C`;
  telemetryCellPressure.textContent = `${c.pressure.toFixed(0)} hPa`;
  
  // Calculate relative humidity: moisture relative to Clausius-Clapeyron capacity
  const cap = getSaturationCapacity(c.temp);
  const rh = Math.round(Math.min(100, (c.moisture / cap) * 100));
  telemetryCellHumidity.textContent = `${rh}%`;
  
  telemetryCellClouds.textContent = `${Math.round(c.clouds * 100)}%`;
  
  // Change overlay label colors based on threshold values
  telemetryCellTemp.style.color = c.temp > 38.0 ? '#ef4444' : (c.temp < 1.0 ? '#3b82f6' : '#00e5ff');
  telemetryCellPressure.style.color = c.pressure < 996.0 ? '#b380ff' : (c.pressure > 1024.0 ? '#f59e0b' : '#00e5ff');
}

// Tick Simulation animation runner frame loop
function tick() {
  frameCount++;
  
  if (isRunning) {
    updateAtmosphericPhysics();
  }
  
  drawMapGrid();
  drawLocalSky();
  updateMeteoTelemetry();
  updateTelemetryOverlay();
  
  requestAnimationFrame(tick);
}

// Event Listeners
// Paint brush property button clicks
brushBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    brushBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    brushProperty = btn.getAttribute('data-property');
    brushValue = btn.getAttribute('data-value');
  });
});

// Slider updates listeners
sliderBrushSize.addEventListener('input', updateParamsFromSliders);
sliderShear.addEventListener('input', () => {
  updateParamsFromSliders();
});

// Operations controls checkboxes toggles
toggleDiurnal.addEventListener('change', () => {
  diurnalCycleActive = toggleDiurnal.checked;
});
toggleCoastline.addEventListener('change', () => {
  coastlineEnabled = toggleCoastline.checked;
});

// Button events
btnPause.addEventListener('click', () => {
  isRunning = !isRunning;
  btnPause.textContent = isRunning ? 'Pause' : 'Resume';
  btnPause.classList.toggle('secondary');
});

btnReset.addEventListener('click', resetSimulation);

// Scenario dropdown preset selector listener
presetSelect.addEventListener('change', () => {
  applyPreset(presetSelect.value);
});

// Layers tabs button selectors listener
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeLayer = btn.getAttribute('data-layer');
  });
});

// Wind overlay checkbox listener
chkWindVectors.addEventListener('change', () => {
  showWindVectors = chkWindVectors.checked;
});

// Handle Mouse Clicks and Drags on map grid to paint variables
let isDrawing = false;

function getGridCoords(e) {
  const rect = mapCanvas.getBoundingClientRect();
  const scaleX = mapCanvas.width / rect.width;
  const scaleY = mapCanvas.height / rect.height;
  
  const clientX = (e.clientX - rect.left) * scaleX;
  const clientY = (e.clientY - rect.top) * scaleY;
  
  const cellW = mW / GRID_SIZE;
  const cellH = mH / GRID_SIZE;
  
  const gx = Math.floor(clientX / cellW);
  const gy = Math.floor(clientY / cellH);
  
  return { gx: Math.max(0, Math.min(GRID_SIZE - 1, gx)), gy: Math.max(0, Math.min(GRID_SIZE - 1, gy)) };
}

mapCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const { gx, gy } = getGridCoords(e);
  
  // Right-click or meta keys selects coordinates index, normal clicks draws brush
  if (e.shiftKey || e.button === 2) {
    selectedX = gx;
    selectedY = gy;
  } else {
    selectedX = gx;
    selectedY = gy;
    applyPaintBrush(gx, gy);
  }
});

mapCanvas.addEventListener('mousemove', (e) => {
  const { gx, gy } = getGridCoords(e);
  if (isDrawing && !e.shiftKey) {
    applyPaintBrush(gx, gy);
  }
});

window.addEventListener('mouseup', () => {
  isDrawing = false;
});

// Prevent default context menu on right clicks on map grid canvas
mapCanvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const { gx, gy } = getGridCoords(e);
  selectedX = gx;
  selectedY = gy;
});

// Page Initialization triggers on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvases();
  resetSimulation();
  
  // Window resize binds
  window.addEventListener('resize', () => {
    resizeCanvases();
  });
  
  tick();
});
