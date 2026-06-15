/**
 * Heat Transfer Simulator & Visualizer
 * Core Thermodynamic Finite-Difference Solver
 */

// Grid Solver Constants
const N = 45;                     // Solver grid resolution (N x N)
const size = (N + 2) * (N + 2);   // 1D flat array length including borders
let iterCount = 16;               // Jacobi iterations count

// Solver Arrays
let T = new Float32Array(size);            // Current Temperature field (°C)
let T_prev = new Float32Array(size);       // Old Temperature field
let k_cond = new Float32Array(size);       // Thermal Conductivity field
let capacity = new Float32Array(size);     // Heat Capacity field
let is_fixed = new Uint8Array(size);       // Fixed node flags (heater/cooler)
let fixed_T = new Float32Array(size);      // Target temperatures of fixed nodes

// State parameters
let ambientTemp = 25;
let convectionRate = 0.05;
let dt = 1.5;                              // Solver diffusivity time step scale
let activeBrush = 'copper';
let brushRadius = 2;
let targetTemp = 100;                      // Target temp for hot/cold node painting
let isPaused = false;
let fps = 60;
let lastTime = performance.now();
let frames = 0;

// Mouse coordinates
let mouseX = 0, mouseY = 0;
let isMouseDown = false;

// Probe Thermometer history tracking
let probeHistory = [];
const maxHistoryLength = 120;

// Elements drawing configuration colors
const MATERIAL_NAMES = {
  copper: 'Copper (Conductor)',
  iron: 'Iron (Conductor)',
  glass: 'Glass (Insulator)',
  wood: 'Wood (Insulator)',
  air: 'Ambient Air Gap',
  hot: 'Heater Source Node',
  cold: 'Cooler Sink Node'
};

// DOM elements
let canvas, ctx;
let hudPeakTemp, hudAvgTemp, hudSourceCount, hudFps;
let selectColormap;
let checkIsotherms, checkFlux, checkBorders, checkGrid, checkBoundary;
let valAmbient, inputAmbient;
let valConvection, inputConvection;
let valDiffusivity, inputDiffusivity;
let btnPausePlay, playPauseIcon, playPauseText, btnClearHeat, btnResetAll, consoleLogs;
let valBrushSize, inputBrushSize;
let valTargetTemp, inputTargetTemp, groupTargetTemp;
let probePlaceholder, probeStats, probeValCoords, probeValMat, probeValTemp, probeValCond, probeValCap, miniTempChartCanvas, miniTempChartCtx;
let btnPresetFins, btnPresetBridge, btnPresetInsulated;

// Logging Utility
function logToConsole(message, type = 'info') {
  const line = document.createElement('div');
  line.className = `log-line text-${type}`;
  line.innerHTML = `&gt; ${message}`;
  consoleLogs.appendChild(line);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
  while (consoleLogs.childNodes.length > 50) {
    consoleLogs.removeChild(consoleLogs.firstChild);
  }
}

// Convert 2D index to flat array offset
function IX(i, j) {
  i = Math.max(0, Math.min(N + 1, i));
  j = Math.max(0, Math.min(N + 1, j));
  return i + (N + 2) * j;
}

// Set boundary conditions (Insulated vs Convective boundaries)
function set_bnd(x) {
  const h = convectiveBoundaryEnabled() ? convectionRate : 0;
  
  for (let i = 1; i <= N; i++) {
    // Left Boundary
    x[IX(0, i)]     = h > 0 ? (x[IX(1, i)] + h * ambientTemp) / (1 + h) : x[IX(1, i)];
    // Right Boundary
    x[IX(N + 1, i)] = h > 0 ? (x[IX(N, i)] + h * ambientTemp) / (1 + h) : x[IX(N, i)];
    // Top Boundary
    x[IX(i, 0)]     = h > 0 ? (x[IX(i, 1)] + h * ambientTemp) / (1 + h) : x[IX(i, 1)];
    // Bottom Boundary
    x[IX(i, N + 1)] = h > 0 ? (x[IX(i, N)] + h * ambientTemp) / (1 + h) : x[IX(i, N)];
  }
  
  // Outer frame corners averaging
  x[IX(0, 0)]         = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
  x[IX(0, N + 1)]     = 0.5 * (x[IX(1, N + 1)] + x[IX(0, N)]);
  x[IX(N + 1, 0)]     = 0.5 * (x[IX(N, 0)] + x[IX(N + 1, 1)]);
  x[IX(N + 1, N + 1)] = 0.5 * (x[IX(N, N + 1)] + x[IX(N + 1, N)]);
}

function convectiveBoundaryEnabled() {
  return checkBoundary ? checkBoundary.checked : true;
}

// 2D Heat Equation Implicit Solver (Gauss-Seidel relaxation)
function solveHeatDiffusion() {
  // Save current temperatures to prev
  T_prev.set(T);
  
  for (let k = 0; k < iterCount; k++) {
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        const idx = IX(i, j);
        
        // Locked nodes (heater/cooler elements) hold their target temperatures
        if (is_fixed[idx]) {
          T[idx] = fixed_T[idx];
          continue;
        }
        
        const C_val = capacity[idx];
        
        // Calculate diffusivity coefficients relative to the 4 adjacent neighbors
        // H = dt * k_avg / (2 * C_cell * dx^2)
        const Hr = (dt / (2 * C_val)) * (k_cond[idx] + k_cond[IX(i + 1, j)]);
        const Hl = (dt / (2 * C_val)) * (k_cond[idx] + k_cond[IX(i - 1, j)]);
        const Hd = (dt / (2 * C_val)) * (k_cond[idx] + k_cond[IX(i, j + 1)]);
        const Hu = (dt / (2 * C_val)) * (k_cond[idx] + k_cond[IX(i, j - 1)]);
        
        // Implicit finite difference equation:
        // T_cell = (T_old + Hr*T_right + Hl*T_left + Hd*T_down + Hu*T_up) / (1 + Hr + Hl + Hd + Hu)
        T[idx] = (
          T_prev[idx] +
          Hr * T[IX(i + 1, j)] +
          Hl * T[IX(i - 1, j)] +
          Hd * T[IX(i, j + 1)] +
          Hu * T[IX(i, j - 1)]
        ) / (1 + Hr + Hl + Hd + Hu);
      }
    }
    set_bnd(T);
  }
}

// Paint Brush Element on Grid
function paintBrush(gi, gj) {
  const rCells = brushRadius;
  
  // Material coefficients map
  const config = {
    copper: { k: 0.95, C: 0.9, fixed: 0 },
    iron:   { k: 0.28, C: 1.2, fixed: 0 },
    glass:  { k: 0.02, C: 0.8, fixed: 0 },
    wood:   { k: 0.003, C: 0.4, fixed: 0 },
    air:    { k: 0.01, C: 1.0, fixed: 0 },
    hot:    { k: 0.5, C: 1.0, fixed: 1, temp: targetTemp },
    cold:   { k: 0.5, C: 1.0, fixed: 1, temp: targetTemp }
  };
  
  const activeMat = config[activeBrush];
  if (!activeMat) return;
  
  for (let dj = -rCells; dj <= rCells; dj++) {
    for (let di = -rCells; di <= rCells; di++) {
      if (di * di + dj * dj <= rCells * rCells) {
        const i = gi + di;
        const j = gj + dj;
        
        if (i >= 1 && i <= N && j >= 1 && j <= N) {
          const idx = IX(i, j);
          
          k_cond[idx] = activeMat.k;
          capacity[idx] = activeMat.C;
          is_fixed[idx] = activeMat.fixed;
          
          if (activeMat.fixed) {
            fixed_T[idx] = activeMat.temp;
            T[idx] = activeMat.temp;
          } else {
            fixed_T[idx] = 0;
            // If erasing back to air, set temperature back to ambient
            if (activeBrush === 'air') {
              T[idx] = ambientTemp;
            }
          }
        }
      }
    }
  }
  
  // Re-establish outer boundary
  set_bnd(T);
}

// Initialize Solver arrays to base state
function initPlate() {
  T.fill(ambientTemp);
  T_prev.fill(ambientTemp);
  k_cond.fill(0.01);     // Default air gap conductivity
  capacity.fill(1.0);    // Default air gap capacity
  is_fixed.fill(0);
  fixed_T.fill(0);
  set_bnd(T);
}

// Preset Configurations
function loadPreset(type) {
  initPlate();
  
  const mid = Math.floor(N / 2);
  
  if (type === 'fins') {
    // 1. Hot radiator base plate at bottom
    for (let i = 1; i <= N; i++) {
      for (let j = N - 3; j <= N; j++) {
        const idx = IX(i, j);
        is_fixed[idx] = 1;
        fixed_T[idx] = 180;
        T[idx] = 180;
        k_cond[idx] = 0.5;
        capacity[idx] = 1.0;
      }
    }
    
    // 2. Copper fins extending upwards
    const finXOffsets = [6, 14, 22, 30, 38];
    finXOffsets.forEach(fx => {
      for (let j = 6; j < N - 3; j++) {
        for (let i = fx - 1; i <= fx + 1; i++) {
          const idx = IX(i, j);
          k_cond[idx] = 0.95; // Copper
          capacity[idx] = 0.9;
        }
      }
    });
    
    convectionRate = 0.08;
    inputConvection.value = convectionRate;
    valConvection.textContent = convectionRate.toString();
    logToConsole('Preset loaded: Radiator Heat Sink Fins (high-area copper strips radiating heat convective loss).', 'info');
    
  } else if (type === 'bridge') {
    // Insulated thermal bridge (metal leak through wood insulation)
    // 1. Hot element on left boundary
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= 3; i++) {
        const idx = IX(i, j);
        is_fixed[idx] = 1;
        fixed_T[idx] = 200;
        T[idx] = 200;
        k_cond[idx] = 0.5;
      }
    }
    
    // 2. Cold element on right boundary
    for (let j = 1; j <= N; j++) {
      for (let i = N - 2; i <= N; i++) {
        const idx = IX(i, j);
        is_fixed[idx] = 1;
        fixed_T[idx] = 0;
        T[idx] = 0;
        k_cond[idx] = 0.5;
      }
    }
    
    // 3. Thick wood insulator wall in the center
    for (let j = 1; j <= N; j++) {
      for (let i = 4; i < N - 2; i++) {
        const idx = IX(i, j);
        k_cond[idx] = 0.003; // Wood
        capacity[idx] = 0.4;
      }
    }
    
    // 4. Heavy iron bolt bridging across the center
    for (let j = mid - 2; j <= mid + 2; j++) {
      for (let i = 2; i < N - 1; i++) {
        const idx = IX(i, j);
        is_fixed[idx] = 0;
        k_cond[idx] = 0.28; // Iron
        capacity[idx] = 1.2;
      }
    }
    
    convectionRate = 0.01;
    inputConvection.value = convectionRate;
    valConvection.textContent = convectionRate.toString();
    logToConsole('Preset loaded: Insulating Thermal Bridge (heat leaks past wood barrier along the iron bridge).', 'info');
    
  } else if (type === 'insulated') {
    // Insulated Pipe (Concentric rings)
    const cx = mid + 0.5;
    const cy = mid + 0.5;
    
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        const dist = Math.hypot(i - cx, j - cy);
        const idx = IX(i, j);
        
        if (dist < 4) {
          // Central Hot pipe core
          is_fixed[idx] = 1;
          fixed_T[idx] = 300;
          T[idx] = 300;
          k_cond[idx] = 0.5;
        } else if (dist >= 4 && dist < 12) {
          // Core steel liner
          k_cond[idx] = 0.28;
          capacity[idx] = 1.2;
        } else if (dist >= 12 && dist < 20) {
          // Thick fiber glass insulator layer
          k_cond[idx] = 0.02;
          capacity[idx] = 0.8;
        } else {
          // Wood shell boundary protection
          k_cond[idx] = 0.003;
          capacity[idx] = 0.4;
        }
      }
    }
    
    convectionRate = 0.06;
    inputConvection.value = convectionRate;
    valConvection.textContent = convectionRate.toString();
    logToConsole('Preset loaded: Concentric Pipe Insulation (radial thermal gradient dropping through fiber shell).', 'info');
  }
  
  set_bnd(T);
  saveState();
}

// Convert temperature values to color hex strings
function getTemperatureColor(val, mode) {
  // Map value boundaries [-50°C, 350°C] to [0, 1]
  const minT = -50;
  const maxT = 350;
  const t = Math.max(0, Math.min(1.0, (val - minT) / (maxT - minT)));
  
  if (mode === 'fireice') {
    // Custom blue (cold) -> black (ambient) -> orange/red (hot) -> white (hotter)
    if (val < ambientTemp) {
      // Cold mapping [blue -> dark blue]
      const scale = Math.max(0, Math.min(1.0, (ambientTemp - val) / (ambientTemp - minT)));
      const b = Math.floor(scale * 200 + 55);
      const g = Math.floor(scale * 120);
      return `rgb(0, ${g}, ${b})`;
    } else {
      // Hot mapping [dark orange -> red -> white]
      const scale = Math.max(0, Math.min(1.0, (val - ambientTemp) / (maxT - ambientTemp)));
      const r = Math.floor(scale * 200 + 55);
      const g = Math.floor(scale * scale * 255);
      const b = Math.floor(scale * scale * scale * 255);
      return `rgb(${r}, ${g}, ${b})`;
    }
  } else if (mode === 'neon') {
    // Cyan -> Magenta -> Laser Orange
    const r = Math.floor(t * 255);
    const g = Math.floor(Math.sin(t * Math.PI) * 140 + (1 - t) * 50);
    const b = Math.floor((1.0 - t) * 200 + t * 50);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (mode === 'grayscale') {
    const gray = Math.floor(t * 255);
    return `rgb(${gray}, ${gray}, ${gray})`;
  }
  return '#000';
}

// Renders the color-coded materials grid and isotherms
function drawHeatmap() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const cellW = width / N;
  const cellH = height / N;
  const mapMode = selectColormap.value;
  
  for (let j = 1; j <= N; j++) {
    const py = (j - 1) * cellH;
    for (let i = 1; i <= N; i++) {
      const px = (i - 1) * cellW;
      const idx = IX(i, j);
      
      // Paint Background Heatmap
      if (mapMode !== 'none') {
        ctx.fillStyle = getTemperatureColor(T[idx], mapMode);
        ctx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
      }
      
      // Paint material borders if enabled
      if (checkBorders.checked && k_cond[idx] > 0.015) {
        let matColor = 'rgba(255,255,255,0.06)';
        if (k_cond[idx] > 0.9) matColor = 'rgba(200, 117, 51, 0.4)';       // Copper Outline
        else if (k_cond[idx] > 0.2) matColor = 'rgba(122, 136, 155, 0.4)';  // Iron Outline
        else if (k_cond[idx] > 0.015 && capacity[idx] < 0.5) matColor = 'rgba(161, 112, 67, 0.4)'; // Wood
        else if (k_cond[idx] > 0.015) matColor = 'rgba(92, 194, 220, 0.4)'; // Glass
        
        ctx.strokeStyle = matColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, cellW, cellH);
      }
      
      // Paint Heater/Cooler Nodes indicator circles
      if (is_fixed[idx]) {
        ctx.strokeStyle = fixed_T[idx] > ambientTemp ? '#ff3300' : '#00bfff';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(px + 1, py + 1, cellW - 2, cellH - 2);
      }
    }
  }
}

// Draw Isothermal contours (cross-boundary isothermal rings)
function drawIsothermalContours() {
  if (!checkIsotherms.checked) return;
  
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const cellW = width / N;
  const cellH = height / N;
  
  // Temperature contour values to map
  const contourLevels = [-80, -40, -10, 0, 10, 35, 60, 90, 130, 180, 240, 310, 400];
  
  ctx.lineWidth = 1.2;
  
  for (let j = 1; j < N; j++) {
    const y0 = (j - 0.5) * cellH;
    const y1 = (j + 0.5) * cellH;
    for (let i = 1; i < N; i++) {
      const x0 = (i - 0.5) * cellW;
      const x1 = (i + 0.5) * cellW;
      
      const p00 = T[IX(i, j)];       // Top-Left
      const p10 = T[IX(i + 1, j)];   // Top-Right
      const p11 = T[IX(i + 1, j + 1)]; // Bottom-Right
      const p01 = T[IX(i, j + 1)];   // Bottom-Left
      
      contourLevels.forEach(val => {
        const points = [];
        
        // Top Edge
        if ((p00 >= val && p10 < val) || (p00 < val && p10 >= val)) {
          const t = (val - p00) / (p10 - p00);
          points.push({ x: x0 + t * (x1 - x0), y: y0 });
        }
        // Right Edge
        if ((p10 >= val && p11 < val) || (p10 < val && p11 >= val)) {
          const t = (val - p10) / (p11 - p10);
          points.push({ x: x1, y: y0 + t * (y1 - y0) });
        }
        // Bottom Edge
        if ((p01 >= val && p11 < val) || (p01 < val && p11 >= val)) {
          const t = (val - p01) / (p11 - p01);
          points.push({ x: x0 + t * (x1 - x0), y: y1 });
        }
        // Left Edge
        if ((p00 >= val && p01 < val) || (p00 < val && p01 >= val)) {
          const t = (val - p00) / (p01 - p00);
          points.push({ x: x0, y: y0 + t * (y1 - y0) });
        }
        
        if (points.length >= 2) {
          ctx.strokeStyle = val > ambientTemp ? 'rgba(255, 119, 0, 0.4)' : 'rgba(0, 191, 255, 0.4)';
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          ctx.lineTo(points[1].x, points[1].y);
          ctx.stroke();
          
          if (points.length === 4) {
            ctx.beginPath();
            ctx.moveTo(points[2].x, points[2].y);
            ctx.lineTo(points[3].x, points[3].y);
            ctx.stroke();
          }
        }
      });
    }
  }
}

// Draw Heat Flux Vectors (Fourier's Law arrows)
function drawHeatFluxVectors() {
  if (!checkFlux.checked) return;
  
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const cellW = width / N;
  const cellH = height / N;
  
  ctx.lineWidth = 1;
  
  // Sample every third cell to prevent overcrowding
  for (let j = 2; j < N; j += 2) {
    const py = (j - 0.5) * cellH;
    for (let i = 2; i < N; i += 2) {
      const px = (i - 0.5) * cellW;
      const idx = IX(i, j);
      
      const cond = k_cond[idx];
      
      // Temperature gradients
      const gradX = (T[IX(i + 1, j)] - T[IX(i - 1, j)]) * 0.5;
      const gradY = (T[IX(i, j + 1)] - T[IX(i, j - 1)]) * 0.5;
      
      // Fourier heat flux: q = -k * ∇T
      const qx = -cond * gradX * 8.0;
      const qy = -cond * gradY * 8.0;
      const fluxStrength = Math.hypot(qx, qy);
      
      if (fluxStrength < 0.05) continue;
      
      const dx = qx / fluxStrength;
      const dy = qy / fluxStrength;
      const arrowLen = Math.min(20, 6 + fluxStrength * 5);
      
      const alpha = Math.min(0.65, fluxStrength * 0.4);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      
      const endX = px + dx * arrowLen;
      const endY = py + dy * arrowLen;
      
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Arrowhead
      const headlen = 3.5;
      const angle = Math.atan2(endY - py, endX - px);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }
  }
}

// Draw Grid Nodes Outline
function drawGrid() {
  if (!checkGrid.checked) return;
  
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const cellW = width / N;
  const cellH = height / N;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  
  for (let i = 0; i <= N; i++) {
    ctx.moveTo(i * cellW, 0);
    ctx.lineTo(i * cellW, height);
  }
  for (let j = 0; j <= N; j++) {
    ctx.moveTo(0, j * cellH);
    ctx.lineTo(width, j * cellH);
  }
  ctx.stroke();
}

// Paint Brush drag handles
function drawBrushCursor() {
  if (isMouseDown) return;
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const cellW = width / N;
  
  // Convert mouse back to cell coordinate
  const gi = Math.floor((mouseX / width) * N) + 1;
  const gj = Math.floor((mouseY / height) * N) + 1;
  
  if (gi >= 1 && gi <= N && gj >= 1 && gj <= N) {
    const px = (gi - 1) * cellW;
    const py = (gj - 1) * cellW;
    const radPx = brushRadius * cellW;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(px + cellW / 2, py + cellW / 2, radPx, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// Draw the mini thermometer line graph
function drawMiniChart() {
  if (!miniTempChartCanvas) return;
  
  const w = miniTempChartCanvas.width;
  const h = miniTempChartCanvas.height;
  
  miniTempChartCtx.fillStyle = '#06080d';
  miniTempChartCtx.fillRect(0, 0, w, h);
  
  if (probeHistory.length < 2) return;
  
  // Find min/max temperature values in history to scale graph
  let maxH = -100;
  let minH = 500;
  probeHistory.forEach(val => {
    if (val > maxH) maxH = val;
    if (val < minH) minH = val;
  });
  
  // Buffer limits
  if (maxH - minH < 5) {
    maxH += 2.5;
    minH -= 2.5;
  }
  
  miniTempChartCtx.strokeStyle = '#ff7700';
  miniTempChartCtx.lineWidth = 1.5;
  miniTempChartCtx.beginPath();
  
  const step = w / (maxHistoryLength - 1);
  const startOffset = maxHistoryLength - probeHistory.length;
  
  for (let i = 0; i < probeHistory.length; i++) {
    const val = probeHistory[i];
    const x = (startOffset + i) * step;
    const y = h - ((val - minH) / (maxH - minH)) * h;
    
    if (i === 0) {
      miniTempChartCtx.moveTo(x, y);
    } else {
      miniTempChartCtx.lineTo(x, y);
    }
  }
  miniTempChartCtx.stroke();
  
  // Render text scale labels
  miniTempChartCtx.fillStyle = 'rgba(255,255,255,0.4)';
  miniTempChartCtx.font = '8px Share Tech Mono';
  miniTempChartCtx.textAlign = 'right';
  miniTempChartCtx.fillText(`${maxH.toFixed(0)}°C`, w - 4, 10);
  miniTempChartCtx.fillText(`${minH.toFixed(0)}°C`, w - 4, h - 4);
}

// Update HUD stats and inspection probe board reading
function updateHUD() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  // 1. Calculate Peak and Average Temperatures
  let maxT = -273;
  let sumT = 0;
  let fluidCount = 0;
  let sourcesCount = 0;
  
  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      const idx = IX(i, j);
      if (T[idx] > maxT) maxT = T[idx];
      sumT += T[idx];
      fluidCount++;
      if (is_fixed[idx]) sourcesCount++;
    }
  }
  
  hudPeakTemp.textContent = `${maxT.toFixed(1)} °C`;
  hudAvgTemp.textContent = `${(sumT / fluidCount).toFixed(1)} °C`;
  hudSourceCount.textContent = sourcesCount;
  
  // 2. Compute FPS
  const now = performance.now();
  frames++;
  if (now - lastTime >= 1000) {
    fps = (frames * 1000) / (now - lastTime);
    hudFps.textContent = fps.toFixed(1);
    frames = 0;
    lastTime = now;
  }
  
  // 3. Inspect Probe Board coordinates
  const gi = Math.floor((mouseX / width) * N) + 1;
  const gj = Math.floor((mouseY / height) * N) + 1;
  
  if (gi >= 1 && gi <= N && gj >= 1 && gj <= N) {
    const idx = IX(gi, gj);
    const temp = T[idx];
    const cond = k_cond[idx];
    const cap = capacity[idx];
    
    probePlaceholder.classList.add('hidden');
    probeStats.classList.remove('hidden');
    
    probeValCoords.textContent = `(x: ${gi}, y: ${gj})`;
    probeValTemp.textContent = `${temp.toFixed(2)} °C`;
    probeValCond.textContent = `${cond.toFixed(4)} W/(m·K)`;
    probeValCap.textContent = `${cap.toFixed(2)} J/(kg·K)`;
    
    // Set material label description
    let mLabel = 'Ambient Air Gap';
    if (is_fixed[idx]) {
      mLabel = fixed_T[idx] > ambientTemp ? 'Heater Source Node' : 'Cooler Sink Node';
    } else {
      if (cond > 0.9) mLabel = 'Copper (Conductor)';
      else if (cond > 0.2) mLabel = 'Iron (Conductor)';
      else if (cond > 0.015 && cap < 0.5) mLabel = 'Wood (Insulator)';
      else if (cond > 0.015) mLabel = 'Glass (Insulator)';
    }
    probeValMat.textContent = mLabel;
    
    // Save history values
    if (!isPaused) {
      probeHistory.push(temp);
      if (probeHistory.length > maxHistoryLength) {
        probeHistory.shift();
      }
    }
  } else {
    probePlaceholder.classList.remove('hidden');
    probeStats.classList.add('hidden');
    probeHistory = [];
  }
  
  drawMiniChart();
}

// Save Sandbox configuration State to LocalStorage
function saveState() {
  // Convert solver float arrays to standard arrays to fit JSON stringify
  const state = {
    ambientTemp,
    convectionRate,
    dt,
    iterCount,
    k_cond: Array.from(k_cond),
    capacity: Array.from(capacity),
    is_fixed: Array.from(is_fixed),
    fixed_T: Array.from(fixed_T),
    T: Array.from(T),
    settings: {
      colormap: selectColormap.value,
      isotherms: checkIsotherms.checked,
      flux: checkFlux.checked,
      borders: checkBorders.checked,
      grid: checkGrid.checked,
      boundary: checkBoundary.checked
    }
  };
  localStorage.setItem('heat_transfer_sim_state', JSON.stringify(state));
}

// Restore Sandbox from LocalStorage
function loadState() {
  try {
    const saved = localStorage.getItem('heat_transfer_sim_state');
    if (saved) {
      const state = JSON.parse(saved);
      
      ambientTemp = state.ambientTemp !== undefined ? state.ambientTemp : ambientTemp;
      convectionRate = state.convectionRate !== undefined ? state.convectionRate : convectionRate;
      dt = state.dt !== undefined ? state.dt : dt;
      iterCount = state.iterCount !== undefined ? state.iterCount : iterCount;
      
      inputAmbient.value = ambientTemp;
      valAmbient.textContent = `${ambientTemp} °C`;
      inputConvection.value = convectionRate;
      valConvection.textContent = convectionRate.toString();
      inputDiffusivity.value = dt;
      valDiffusivity.textContent = dt.toString();
      
      if (state.k_cond) k_cond.set(state.k_cond);
      if (state.capacity) capacity.set(state.capacity);
      if (state.is_fixed) is_fixed.set(state.is_fixed);
      if (state.fixed_T) fixed_T.set(state.fixed_T);
      if (state.T) T.set(state.T);
      
      if (state.settings) {
        selectColormap.value = state.settings.colormap || 'fireice';
        checkIsotherms.checked = state.settings.isotherms !== false;
        checkFlux.checked = state.settings.flux === true;
        checkBorders.checked = state.settings.borders !== false;
        checkGrid.checked = state.settings.grid === true;
        checkBoundary.checked = state.settings.boundary !== false;
      }
      logToConsole('Saved sandbox layout restored.', 'success');
    } else {
      loadPreset('fins');
    }
  } catch (e) {
    console.error('Failed to load local storage state', e);
    loadPreset('fins');
  }
}

// Main loop
function tick() {
  if (!isPaused) {
    solveHeatDiffusion();
  }
  
  // Clear
  ctx.fillStyle = '#020306';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawHeatmap();
  drawGrid();
  drawIsothermalContours();
  drawHeatFluxVectors();
  drawBrushCursor();
  
  updateHUD();
  
  requestAnimationFrame(tick);
}

function resizeCanvas() {
  const rect = canvas.parentNode.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
}

// Bind listeners & Setup
document.addEventListener('DOMContentLoaded', () => {
  // Bind HUD UI
  hudPeakTemp = document.getElementById('hud-peak-temp');
  hudAvgTemp = document.getElementById('hud-avg-temp');
  hudSourceCount = document.getElementById('hud-source-count');
  hudFps = document.getElementById('hud-fps');
  
  selectColormap = document.getElementById('select-colormap');
  checkIsotherms = document.getElementById('check-isotherms');
  checkFlux = document.getElementById('check-flux');
  checkBorders = document.getElementById('check-borders');
  checkGrid = document.getElementById('check-grid');
  checkBoundary = document.getElementById('check-boundary');
  
  inputAmbient = document.getElementById('input-ambient');
  valAmbient = document.getElementById('val-ambient');
  inputConvection = document.getElementById('input-convection');
  valConvection = document.getElementById('val-convection');
  inputDiffusivity = document.getElementById('input-diffusivity');
  valDiffusivity = document.getElementById('val-diffusivity');
  
  btnPausePlay = document.getElementById('btn-pause-play');
  playPauseIcon = document.getElementById('play-pause-icon');
  playPauseText = document.getElementById('play-pause-text');
  btnClearHeat = document.getElementById('btn-clear-heat');
  btnResetAll = document.getElementById('btn-reset-all');
  consoleLogs = document.getElementById('console-logs');
  
  valBrushSize = document.getElementById('val-brush-size');
  inputBrushSize = document.getElementById('input-brush-size');
  valTargetTemp = document.getElementById('val-target-temp');
  inputTargetTemp = document.getElementById('input-target-temp');
  groupTargetTemp = document.getElementById('group-target-temp');
  
  probePlaceholder = document.getElementById('probe-placeholder');
  probeStats = document.getElementById('probe-stats');
  probeValCoords = document.getElementById('probe-val-coords');
  probeValMat = document.getElementById('probe-val-mat');
  probeValTemp = document.getElementById('probe-val-temp');
  probeValCond = document.getElementById('probe-val-cond');
  probeValCap = document.getElementById('probe-val-cap');
  
  btnPresetFins = document.getElementById('btn-preset-fins');
  btnPresetBridge = document.getElementById('btn-preset-bridge');
  btnPresetInsulated = document.getElementById('btn-preset-insulated');
  
  // Thermometer history mini-canvas
  miniTempChartCanvas = document.getElementById('mini-temp-chart');
  miniTempChartCtx = miniTempChartCanvas.getContext('2d');
  
  // Canvas Setup
  canvas = document.getElementById('sim-canvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Brush Selector Button Clicks
  const brushBtns = document.querySelectorAll('.btn-brush');
  brushBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      brushBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeBrush = btn.dataset.brush;
      
      if (activeBrush === 'hot' || activeBrush === 'cold') {
        groupTargetTemp.classList.remove('hidden');
        if (activeBrush === 'hot') {
          targetTemp = 150;
          inputTargetTemp.min = 50;
          inputTargetTemp.max = 500;
          inputTargetTemp.value = 150;
        } else {
          targetTemp = 0;
          inputTargetTemp.min = -100;
          inputTargetTemp.max = 20;
          inputTargetTemp.value = 0;
        }
        valTargetTemp.textContent = `${targetTemp} °C`;
      } else {
        groupTargetTemp.classList.add('hidden');
      }
    });
  });
  
  // Sliders inputs bindings
  inputBrushSize.addEventListener('input', () => {
    brushRadius = parseInt(inputBrushSize.value);
    valBrushSize.textContent = `${brushRadius} cell${brushRadius > 1 ? 's' : ''}`;
  });
  
  inputTargetTemp.addEventListener('input', () => {
    targetTemp = parseInt(inputTargetTemp.value);
    valTargetTemp.textContent = `${targetTemp} °C`;
  });
  
  inputAmbient.addEventListener('input', () => {
    ambientTemp = parseInt(inputAmbient.value);
    valAmbient.textContent = `${ambientTemp} °C`;
    saveState();
  });
  
  inputConvection.addEventListener('input', () => {
    convectionRate = parseFloat(inputConvection.value);
    valConvection.textContent = convectionRate.toString();
    saveState();
  });
  
  inputDiffusivity.addEventListener('input', () => {
    dt = parseFloat(inputDiffusivity.value);
    valDiffusivity.textContent = dt.toString();
    saveState();
  });
  
  // Preset Clicks
  btnPresetFins.addEventListener('click', () => loadPreset('fins'));
  btnPresetBridge.addEventListener('click', () => loadPreset('bridge'));
  btnPresetInsulated.addEventListener('click', () => loadPreset('insulated'));
  
  // General controls buttons
  btnPausePlay.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      btnPausePlay.classList.add('paused');
      playPauseIcon.textContent = '▶️';
      playPauseText.textContent = 'Resume Engine';
      simStatusText.textContent = 'Heat Solver: PAUSED';
      logToConsole('Thermodynamics simulation paused.', 'warning');
    } else {
      btnPausePlay.classList.remove('paused');
      playPauseIcon.textContent = '⏸️';
      playPauseText.textContent = 'Pause Engine';
      simStatusText.textContent = 'Heat Solver: ACTIVE';
      logToConsole('Thermodynamics simulation resumed.', 'info');
    }
  });
  
  btnClearHeat.addEventListener('click', () => {
    T.fill(ambientTemp);
    T_prev.fill(ambientTemp);
    set_bnd(T);
    logToConsole('Reset all grid cell temperatures to ambient.', 'info');
  });
  
  btnResetAll.addEventListener('click', () => {
    initPlate();
    logToConsole('Thermal grid structure cleared.', 'warning');
    saveState();
  });
  
  // Checkbox saves
  [selectColormap, checkIsotherms, checkFlux, checkBorders, checkGrid, checkBoundary].forEach(ch => {
    ch.addEventListener('change', saveState);
  });
  
  // Canvas Mouse Interactions (Drawing)
  const handleDraw = e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    mouseX = mx;
    mouseY = my;
    
    if (isMouseDown) {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      
      const gi = Math.floor((mx / width) * N) + 1;
      const gj = Math.floor((my / height) * N) + 1;
      
      paintBrush(gi, gj);
    }
  };
  
  canvas.addEventListener('mousedown', e => {
    isMouseDown = true;
    handleDraw(e);
  });
  
  canvas.addEventListener('mousemove', e => {
    handleDraw(e);
  });
  
  const clearPaint = () => {
    if (isMouseDown) {
      isMouseDown = false;
      saveState();
    }
  };
  
  canvas.addEventListener('mouseup', clearPaint);
  canvas.addEventListener('mouseleave', clearPaint);
  
  // Mobile touch support
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 0) return;
    isMouseDown = true;
    const mockEvent = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    handleDraw(mockEvent);
    e.preventDefault();
  });
  
  canvas.addEventListener('touchmove', e => {
    if (e.touches.length === 0) return;
    const mockEvent = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    handleDraw(mockEvent);
    e.preventDefault();
  });
  
  canvas.addEventListener('touchend', clearPaint);
  
  // Restore sandbox or presets
  loadState();
  
  // Start loop
  tick();
});
