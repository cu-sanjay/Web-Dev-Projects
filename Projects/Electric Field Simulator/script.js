/**
 * Electric Field Simulator & Visualizer
 * Core Physics and Visualization Engine
 */

// Global Constants
const Ke = 40000;         // Electrostatic constant scaled for canvas space
const EPSILON_SQ = 400;   // Smoothing factor squared (20px) to prevent singularities
const TIME_STEP = 0.5;    // Physics dt

// State Management
let elements = [];
let particles = [];
let selectedElement = null;
let activeDrag = null;    // Can be: { type: 'element', index }, { type: 'probe' }, { type: 'injector' }
let isPaused = false;
let fps = 60;
let lastTime = performance.now();
let frames = 0;

// Sensor Probe Coordinates
let probe = { x: 300, y: 250, radius: 12 };

// Particle Injector Coordinates and Angle
let injector = { x: 150, y: 150, radius: 15, angle: 45 };

// DOM Elements
let canvas, ctx;
let hudPeakField, hudChargeCount, hudParticleCount, hudFps;
let btnAddPos, btnAddNeg, btnAddLine, btnAddPlates;
let editorPlaceholder, editorControls, editorElementType, btnDeleteElement;
let inputCharge, valCharge;
let groupLength, inputLength, valLength;
let groupSpacing, inputSpacing, valSpacing;
let groupAngle, inputAngle, valAngle;
let checkHeatmap, checkVectors, checkFieldlines, checkContours, checkProbe, checkGrid;
let simStatusText, probeHud, probeValCoord, probeValV, probeValE, probeValEx, probeValEy;
let btnPresetDipole, btnPresetCapacitor, btnPresetQuadrupole;
let inputPartCharge, groupCustomPartCharge, inputPartChargeVal, inputPartMass, inputPartSpeed, valPartSpeed, inputPartAngle, valPartAngle, btnInjectParticle;
let btnPausePlay, playPauseIcon, playPauseText, btnClearTrails, btnResetAll, consoleLogs;

// Logging Utility
function logToConsole(message, type = 'info') {
  const line = document.createElement('div');
  line.className = `log-line text-${type}`;
  line.innerHTML = `&gt; ${message}`;
  consoleLogs.appendChild(line);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
  // Keep only last 50 logs
  while (consoleLogs.childNodes.length > 50) {
    consoleLogs.removeChild(consoleLogs.firstChild);
  }
}

// Save State to LocalStorage
function saveState() {
  const state = {
    elements,
    probe,
    injector,
    settings: {
      heatmap: checkHeatmap.checked,
      vectors: checkVectors.checked,
      fieldlines: checkFieldlines.checked,
      contours: checkContours.checked,
      probe: checkProbe.checked,
      grid: checkGrid.checked
    }
  };
  localStorage.setItem('electric_field_sim_state', JSON.stringify(state));
}

// Load State from LocalStorage
function loadState() {
  try {
    const saved = localStorage.getItem('electric_field_sim_state');
    if (saved) {
      const state = JSON.parse(saved);
      elements = state.elements || [];
      probe = state.probe || probe;
      injector = state.injector || injector;
      
      if (state.settings) {
        checkHeatmap.checked = state.settings.heatmap !== false;
        checkVectors.checked = state.settings.vectors !== false;
        checkFieldlines.checked = state.settings.fieldlines !== false;
        checkContours.checked = state.settings.contours !== false;
        checkProbe.checked = state.settings.probe !== false;
        checkGrid.checked = state.settings.grid !== false;
      }
      logToConsole('Saved sandbox layout restored.', 'success');
    } else {
      loadPreset('dipole');
    }
  } catch (e) {
    console.error('Failed to load state', e);
    loadPreset('dipole');
  }
}

// Initialize Canvas
function initCanvas() {
  canvas = document.getElementById('sim-canvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const rect = canvas.parentNode.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
}

// Compute all virtual charges representing the layout
function getVirtualCharges() {
  const virtuals = [];
  
  elements.forEach(el => {
    if (el.type === 'point') {
      virtuals.push({ x: el.x, y: el.y, q: el.q });
    } else if (el.type === 'line') {
      // Discretize line charge
      const dx = Math.cos(el.angle * Math.PI / 180);
      const dy = Math.sin(el.angle * Math.PI / 180);
      const startX = el.x - dx * el.length / 2;
      const startY = el.y - dy * el.length / 2;
      
      const numCharges = Math.max(8, Math.floor(el.length / 15));
      const step = el.length / (numCharges - 1);
      const subCharge = el.q / numCharges;
      
      for (let i = 0; i < numCharges; i++) {
        virtuals.push({
          x: startX + dx * i * step,
          y: startY + dy * i * step,
          q: subCharge
        });
      }
    } else if (el.type === 'plates') {
      // Discretize parallel plates
      const dx = Math.cos(el.angle * Math.PI / 180);
      const dy = Math.sin(el.angle * Math.PI / 180);
      
      // Normal vector perpendicular to the plate orientation
      const nx = -dy;
      const ny = dx;
      
      // Centers of positive and negative plates
      const xPos = el.x + nx * el.spacing / 2;
      const yPos = el.y + ny * el.spacing / 2;
      const xNeg = el.x - nx * el.spacing / 2;
      const yNeg = el.y - ny * el.spacing / 2;
      
      const numCharges = Math.max(12, Math.floor(el.length / 12));
      const step = el.length / (numCharges - 1);
      const subCharge = el.q / numCharges;
      
      // Pos plate line
      const posStartX = xPos - dx * el.length / 2;
      const posStartY = yPos - dy * el.length / 2;
      // Neg plate line
      const negStartX = xNeg - dx * el.length / 2;
      const negStartY = yNeg - dy * el.length / 2;
      
      for (let i = 0; i < numCharges; i++) {
        // +q plate
        virtuals.push({
          x: posStartX + dx * i * step,
          y: posStartY + dy * i * step,
          q: subCharge
        });
        // -q plate
        virtuals.push({
          x: negStartX + dx * i * step,
          y: negStartY + dy * i * step,
          q: -subCharge
        });
      }
    }
  });
  
  return virtuals;
}

// Compute Electric Field Vector E at any point (x, y)
function getElectricField(x, y) {
  const vCharges = getVirtualCharges();
  let Ex = 0;
  let Ey = 0;
  
  vCharges.forEach(vc => {
    const dx = x - vc.x;
    const dy = y - vc.y;
    const distSq = dx * dx + dy * dy;
    
    // Coulomb field term with softening smoothing factor to prevent singularity at zero distance
    const denom = Math.pow(distSq + EPSILON_SQ, 1.5);
    const fieldStrength = (Ke * vc.q) / denom;
    
    Ex += fieldStrength * dx;
    Ey += fieldStrength * dy;
  });
  
  return { Ex, Ey };
}

// Compute Potential V at any point (x, y)
function getPotential(x, y) {
  const vCharges = getVirtualCharges();
  let V = 0;
  
  vCharges.forEach(vc => {
    const dx = x - vc.x;
    const dy = y - vc.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Scalar addition: V = ∑ K q / r
    V += (Ke * vc.q) / Math.sqrt(dist * dist + EPSILON_SQ);
  });
  
  return V;
}

// Render Potential Heatmap Background
function drawHeatmap() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const step = 8; // Size of heatmap grid cells
  
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const V = getPotential(x, y);
      
      // Set color intensity based on potential value
      let color = '';
      if (V > 0) {
        const alpha = Math.min(0.65, V / 800);
        color = `rgba(0, 242, 254, ${alpha})`; // Cyan for Positive potential
      } else if (V < 0) {
        const alpha = Math.min(0.65, -V / 800);
        color = `rgba(255, 0, 127, ${alpha})`; // Magenta/Pink for Negative potential
      }
      
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, step, step);
      }
    }
  }
}

// Render Alignment Grid
function drawGrid() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const gridSpacing = 40;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  for (let x = 0; x < width; x += gridSpacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y < height; y += gridSpacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
}

// Render Electric Field Vectors Grid (Arrows)
function drawVectors() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const gridSpacing = 35;
  
  ctx.lineWidth = 1.5;
  
  for (let x = gridSpacing / 2; x < width; x += gridSpacing) {
    for (let y = gridSpacing / 2; y < height; y += gridSpacing) {
      // Calculate field at arrow center
      const { Ex, Ey } = getElectricField(x, y);
      const E_mag = Math.sqrt(Ex * Ex + Ey * Ey);
      
      if (E_mag < 0.1) continue;
      
      // Calculate arrow parameters
      const dx = Ex / E_mag;
      const dy = Ey / E_mag;
      
      // Scale length with field strength (capped)
      const maxLen = 22;
      const minLen = 5;
      const len = Math.min(maxLen, minLen + E_mag * 0.04);
      
      // Set opacity depending on field strength
      const alpha = Math.min(0.7, E_mag * 0.02);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      
      // Draw Vector Arrow
      const arrowStartX = x - (dx * len) / 2;
      const arrowStartY = y - (dy * len) / 2;
      const arrowEndX = x + (dx * len) / 2;
      const arrowEndY = y + (dy * len) / 2;
      
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(arrowEndX, arrowEndY);
      ctx.stroke();
      
      // Arrowhead
      const headlen = Math.max(3, len * 0.25);
      const angle = Math.atan2(arrowEndY - arrowStartY, arrowEndX - arrowStartX);
      ctx.beginPath();
      ctx.moveTo(arrowEndX, arrowEndY);
      ctx.lineTo(arrowEndX - headlen * Math.cos(angle - Math.PI / 6), arrowEndY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(arrowEndX - headlen * Math.cos(angle + Math.PI / 6), arrowEndY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }
  }
}

// Trace Electric Field Lines
function drawFieldLines() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const stepSize = 4;
  const maxSteps = 250;
  
  const vCharges = getVirtualCharges();
  if (vCharges.length === 0) return;
  
  ctx.lineWidth = 1.2;
  
  vCharges.forEach(vc => {
    // We trace lines starting outward from point charges
    // For positive charges: trace forward along E field vector
    // For negative charges: trace backward along -E field vector (if we want full density, or just positive)
    // Tracing from positive charges is usually sufficient unless there are only negative charges.
    // Let's trace from both!
    const isPositive = vc.q > 0;
    const numLines = Math.min(12, Math.max(4, Math.floor(Math.abs(vc.q) * 8)));
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i * 2 * Math.PI) / numLines;
      const startRadius = 15;
      let curX = vc.x + startRadius * Math.cos(angle);
      let curY = vc.y + startRadius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(curX, curY);
      
      const linePoints = [{ x: curX, y: curY }];
      let stopTrace = false;
      
      // Color gradient or tone
      ctx.strokeStyle = isPositive ? 'rgba(0, 242, 254, 0.22)' : 'rgba(255, 0, 127, 0.22)';
      
      for (let step = 0; step < maxSteps; step++) {
        const { Ex, Ey } = getElectricField(curX, curY);
        const E_mag = Math.sqrt(Ex * Ex + Ey * Ey);
        
        if (E_mag < 0.1) break; // field too weak (vacuum boundary)
        
        // Step along/against field direction
        const mult = isPositive ? 1 : -1;
        const dx = (Ex / E_mag) * stepSize * mult;
        const dy = (Ey / E_mag) * stepSize * mult;
        
        curX += dx;
        curY += dy;
        
        // Boundaries check
        if (curX < 0 || curX > width || curY < 0 || curY > height) {
          linePoints.push({ x: curX, y: curY });
          break;
        }
        
        // Collision with other charges check
        for (let j = 0; j < vCharges.length; j++) {
          const other = vCharges[j];
          const dist = Math.hypot(curX - other.x, curY - other.y);
          if (dist < 10) {
            linePoints.push({ x: other.x, y: other.y });
            stopTrace = true;
            break;
          }
        }
        
        linePoints.push({ x: curX, y: curY });
        if (stopTrace) break;
      }
      
      // Draw the path
      if (linePoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(linePoints[0].x, linePoints[0].y);
        for (let p = 1; p < linePoints.length; p++) {
          ctx.lineTo(linePoints[p].x, linePoints[p].y);
        }
        ctx.stroke();
      }
    }
  });
}

// Equipotential Contours using simple Marching Squares grid checking
function drawEquipotentialContours() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  const step = 15; // Grid spacing for evaluating potential boundaries
  const cols = Math.ceil(width / step) + 1;
  const rows = Math.ceil(height / step) + 1;
  
  // Volt thresholds to map contour lines
  const contourLevels = [
    -1200, -800, -500, -300, -180, -100, -50, -25,
    25, 50, 100, 180, 300, 500, 800, 1200
  ];
  
  // Cache potentials at grid points
  const grid = [];
  for (let c = 0; c < cols; c++) {
    grid[c] = [];
    const x = c * step;
    for (let r = 0; r < rows; r++) {
      grid[c][r] = getPotential(x, r * step);
    }
  }
  
  ctx.lineWidth = 1;
  
  // Loop through grid cells
  for (let c = 0; c < cols - 1; c++) {
    const x0 = c * step;
    const x1 = (c + 1) * step;
    
    for (let r = 0; r < rows - 1; r++) {
      const y0 = r * step;
      const y1 = (r + 1) * step;
      
      const p00 = grid[c][r];     // Top-Left
      const p10 = grid[c + 1][r]; // Top-Right
      const p11 = grid[c + 1][r + 1]; // Bottom-Right
      const p01 = grid[c][r + 1]; // Bottom-Left
      
      contourLevels.forEach(val => {
        const points = [];
        
        // Check Top Edge
        if ((p00 >= val && p10 < val) || (p00 < val && p10 >= val)) {
          const t = (val - p00) / (p10 - p00);
          points.push({ x: x0 + t * (x1 - x0), y: y0 });
        }
        // Check Right Edge
        if ((p10 >= val && p11 < val) || (p10 < val && p11 >= val)) {
          const t = (val - p10) / (p11 - p10);
          points.push({ x: x1, y: y0 + t * (y1 - y0) });
        }
        // Check Bottom Edge
        if ((p01 >= val && p11 < val) || (p01 < val && p11 >= val)) {
          const t = (val - p01) / (p11 - p01);
          points.push({ x: x0 + t * (x1 - x0), y: y1 });
        }
        // Check Left Edge
        if ((p00 >= val && p01 < val) || (p00 < val && p01 >= val)) {
          const t = (val - p00) / (p01 - p00);
          points.push({ x: x0, y: y0 + t * (y1 - y0) });
        }
        
        // Draw segment if boundary is crossed
        if (points.length >= 2) {
          ctx.strokeStyle = val > 0 ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 0, 127, 0.15)';
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

// Render Simulation Elements
function drawElements() {
  elements.forEach((el, index) => {
    const isSelected = el === selectedElement;
    
    if (el.type === 'point') {
      // Draw glowing background for point charge
      const glowGrad = ctx.createRadialGradient(el.x, el.y, 2, el.x, el.y, 25);
      if (el.q > 0) {
        glowGrad.addColorStop(0, 'rgba(0, 242, 254, 1)');
        glowGrad.addColorStop(0.2, 'rgba(0, 242, 254, 0.8)');
        glowGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(255, 0, 127, 1)');
        glowGrad.addColorStop(0.2, 'rgba(255, 0, 127, 0.8)');
        glowGrad.addColorStop(1, 'rgba(255, 0, 127, 0)');
      }
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(el.x, el.y, 25, 0, 2 * Math.PI);
      ctx.fill();
      
      // Core Circle
      ctx.fillStyle = el.q > 0 ? '#00f2fe' : '#ff007f';
      ctx.beginPath();
      ctx.arc(el.x, el.y, 14, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw '+' or '-' symbol inside point charges
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 15px Outfit';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(el.q > 0 ? '+' : '-', el.x, el.y);
      
    } else if (el.type === 'line') {
      const dx = Math.cos(el.angle * Math.PI / 180);
      const dy = Math.sin(el.angle * Math.PI / 180);
      const startX = el.x - dx * el.length / 2;
      const startY = el.y - dy * el.length / 2;
      const endX = el.x + dx * el.length / 2;
      const endY = el.y + dy * el.length / 2;
      
      // Draw Line glow
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.strokeStyle = el.q > 0 ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 0, 127, 0.2)';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Line Core
      ctx.lineWidth = 6;
      ctx.strokeStyle = el.q > 0 ? '#00f2fe' : '#ff007f';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Draw little tick marks along line to denote polarities
      ctx.fillStyle = '#0a0f1d';
      ctx.font = 'bold 9px Outfit';
      const ticks = Math.min(8, Math.max(3, Math.floor(el.length / 40)));
      for (let i = 0; i < ticks; i++) {
        const t = ticks > 1 ? i / (ticks - 1) : 0.5;
        const tx = startX + t * (endX - startX);
        const ty = startY + t * (endY - startY);
        ctx.fillText(el.q > 0 ? '+' : '-', tx, ty);
      }
      
    } else if (el.type === 'plates') {
      const dx = Math.cos(el.angle * Math.PI / 180);
      const dy = Math.sin(el.angle * Math.PI / 180);
      const nx = -dy;
      const ny = dx;
      
      const xPos = el.x + nx * el.spacing / 2;
      const yPos = el.y + ny * el.spacing / 2;
      const xNeg = el.x - nx * el.spacing / 2;
      const yNeg = el.y - ny * el.spacing / 2;
      
      // Positive Plate
      ctx.lineWidth = 8;
      ctx.lineCap = 'square';
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
      ctx.beginPath();
      ctx.moveTo(xPos - dx * el.length / 2, yPos - dy * el.length / 2);
      ctx.lineTo(xPos + dx * el.length / 2, yPos + dy * el.length / 2);
      ctx.stroke();
      
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00f2fe';
      ctx.stroke();
      
      // Negative Plate
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.3)';
      ctx.beginPath();
      ctx.moveTo(xNeg - dx * el.length / 2, yNeg - dy * el.length / 2);
      ctx.lineTo(xNeg + dx * el.length / 2, yNeg + dy * el.length / 2);
      ctx.stroke();
      
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ff007f';
      ctx.stroke();
      
      // Draw plus/minus indicators
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Outfit';
      const ticks = Math.min(6, Math.max(3, Math.floor(el.length / 55)));
      for (let i = 0; i < ticks; i++) {
        const t = ticks > 1 ? i / (ticks - 1) : 0.5;
        // Plus symbols
        const px = (xPos - dx * el.length / 2) + t * dx * el.length;
        const py = (yPos - dy * el.length / 2) + t * dy * el.length;
        ctx.fillText('+', px, py);
        
        // Minus symbols
        const mx = (xNeg - dx * el.length / 2) + t * dx * el.length;
        const my = (yNeg - dy * el.length / 2) + t * dy * el.length;
        ctx.fillText('-', mx, my);
      }
    }
    
    // Renders active selection dashed ring around charge element
    if (isSelected) {
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      
      if (el.type === 'point') {
        ctx.beginPath();
        ctx.arc(el.x, el.y, 22, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (el.type === 'line') {
        ctx.beginPath();
        // Draw bounding box outline around line
        const dx = Math.cos(el.angle * Math.PI / 180);
        const dy = Math.sin(el.angle * Math.PI / 180);
        const nx = -dy;
        const ny = dx;
        
        const hWidth = el.length / 2 + 10;
        const hHeight = 12;
        
        ctx.moveTo(el.x - dx * hWidth - nx * hHeight, el.y - dy * hWidth - ny * hHeight);
        ctx.lineTo(el.x + dx * hWidth - nx * hHeight, el.y + dy * hWidth - ny * hHeight);
        ctx.lineTo(el.x + dx * hWidth + nx * hHeight, el.y + dy * hWidth + ny * hHeight);
        ctx.lineTo(el.x - dx * hWidth + nx * hHeight, el.y - dy * hWidth + ny * hHeight);
        ctx.closePath();
        ctx.stroke();
      } else if (el.type === 'plates') {
        ctx.beginPath();
        // Bounding box around plates
        const dx = Math.cos(el.angle * Math.PI / 180);
        const dy = Math.sin(el.angle * Math.PI / 180);
        const nx = -dy;
        const ny = dx;
        
        const hWidth = el.length / 2 + 10;
        const hHeight = el.spacing / 2 + 12;
        
        ctx.moveTo(el.x - dx * hWidth - nx * hHeight, el.y - dy * hWidth - ny * hHeight);
        ctx.lineTo(el.x + dx * hWidth - nx * hHeight, el.y + dy * hWidth - ny * hHeight);
        ctx.lineTo(el.x + dx * hWidth + nx * hHeight, el.y + dy * hWidth + ny * hHeight);
        ctx.lineTo(el.x - dx * hWidth + nx * hHeight, el.y - dy * hWidth + ny * hHeight);
        ctx.closePath();
        ctx.stroke();
      }
      
      ctx.setLineDash([]); // Reset
    }
  });
}

// Render Probe Sensor Crosshair
function drawProbe() {
  if (!checkProbe.checked) return;
  
  // Draw outer dashed indicator
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(probe.x, probe.y, probe.radius + 6, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Core target crosshair
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(probe.x, probe.y, probe.radius, 0, 2 * Math.PI);
  ctx.moveTo(probe.x - probe.radius - 4, probe.y);
  ctx.lineTo(probe.x + probe.radius + 4, probe.y);
  ctx.moveTo(probe.x, probe.y - probe.radius - 4);
  ctx.lineTo(probe.x, probe.y + probe.radius + 4);
  ctx.stroke();
  
  // Core center dot
  ctx.fillStyle = '#00f2fe';
  ctx.beginPath();
  ctx.arc(probe.x, probe.y, 2, 0, 2 * Math.PI);
  ctx.fill();
}

// Render Particle Injector Cursor
function drawInjector() {
  // Dashed Circle
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(injector.x, injector.y, injector.radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Launcher arrow representation
  const radians = (injector.angle * Math.PI) / 180;
  const arrowLength = 28;
  const arrowX = injector.x + Math.cos(radians) * arrowLength;
  const arrowY = injector.y + Math.sin(radians) * arrowLength;
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(injector.x, injector.y);
  ctx.lineTo(arrowX, arrowY);
  ctx.stroke();
  
  // Arrowhead
  const headlen = 6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY);
  ctx.lineTo(arrowX - headlen * Math.cos(radians - Math.PI / 6), arrowY - headlen * Math.sin(radians - Math.PI / 6));
  ctx.lineTo(arrowX - headlen * Math.cos(radians + Math.PI / 6), arrowY - headlen * Math.sin(radians + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  
  // Core dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(injector.x, injector.y, 3, 0, 2 * Math.PI);
  ctx.fill();
  
  // Floating label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '9px Share Tech Mono';
  ctx.textAlign = 'center';
  ctx.fillText('INJECTOR', injector.x, injector.y - injector.radius - 6);
}

// Render Active Particle Trails & Particle Dots
function drawParticles() {
  particles.forEach(p => {
    // 1. Draw Fading trail
    if (p.trail.length > 1) {
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      
      for (let i = 1; i < p.trail.length; i++) {
        const pt1 = p.trail[i - 1];
        const pt2 = p.trail[i];
        const alpha = i / p.trail.length;
        
        ctx.strokeStyle = p.q > 0 ? `rgba(0, 242, 254, ${alpha * 0.75})` : p.q < 0 ? `rgba(255, 0, 127, ${alpha * 0.75})` : `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
      }
    }
    
    // 2. Draw glowing particle core
    const radGrad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.radius + 3);
    const mainColor = p.q > 0 ? '0, 242, 254' : p.q < 0 ? '255, 0, 127' : '255, 255, 255';
    
    radGrad.addColorStop(0, `rgba(${mainColor}, 1)`);
    radGrad.addColorStop(0.3, `rgba(${mainColor}, 0.8)`);
    radGrad.addColorStop(1, `rgba(${mainColor}, 0)`);
    
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius + 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Core dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius - 1, 0, 2 * Math.PI);
    ctx.fill();
  });
}

// Particle Solver (Euler-Verlet Integration)
function updateParticles() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const vCharges = getVirtualCharges();
  
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    
    // Get field E at particle coords
    const { Ex, Ey } = getElectricField(p.x, p.y);
    
    // Force F = q * E
    const Fx = p.q * Ex;
    const Fy = p.q * Ey;
    
    // Acceleration a = F / m
    const ax = Fx / p.m;
    const ay = Fy / p.m;
    
    // Verlet/Euler step: Update velocity
    p.vx += ax * TIME_STEP;
    p.vy += ay * TIME_STEP;
    
    // Update position
    p.x += p.vx * TIME_STEP;
    p.y += p.vy * TIME_STEP;
    
    // Append coordinates to path trail
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 140) {
      p.trail.shift();
    }
    
    // Check out-of-bounds deactivation
    if (p.x < -100 || p.x > width + 100 || p.y < -100 || p.y > height + 100) {
      logToConsole(`Particle escaped boundaries. Terminated.`, 'info');
      particles.splice(i, 1);
      continue;
    }
    
    // Check collisions with charge elements (deactivates trace)
    let collided = false;
    for (let c = 0; c < vCharges.length; c++) {
      const vc = vCharges[c];
      const dist = Math.hypot(p.x - vc.x, p.y - vc.y);
      if (dist < 15) {
        logToConsole(`Particle collided with charge node. Captured.`, 'warning');
        particles.splice(i, 1);
        collided = true;
        break;
      }
    }
    if (collided) continue;
  }
}

// Update HUD & Probe Metrics
function updateHUD() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  // 1. Calculate Peak E-Field on grid
  let maxField = 0;
  // Sample a sparse grid to keep FPS high
  for (let x = 40; x < width - 40; x += 60) {
    for (let y = 40; y < height - 40; y += 60) {
      const { Ex, Ey } = getElectricField(x, y);
      const E_mag = Math.sqrt(Ex * Ex + Ey * Ey);
      if (E_mag > maxField) maxField = E_mag;
    }
  }
  hudPeakField.textContent = `${maxField.toFixed(1)} V/m`;
  hudChargeCount.textContent = elements.length;
  hudParticleCount.textContent = particles.length;
  
  // 2. Compute FPS
  const now = performance.now();
  frames++;
  if (now - lastTime >= 1000) {
    fps = (frames * 1000) / (now - lastTime);
    hudFps.textContent = fps.toFixed(1);
    frames = 0;
    lastTime = now;
  }
  
  // 3. Update Probe reading
  if (checkProbe.checked) {
    probeValCoord.textContent = `(x: ${Math.round(probe.x)}, y: ${Math.round(probe.y)})`;
    const V = getPotential(probe.x, probe.y);
    const { Ex, Ey } = getElectricField(probe.x, probe.y);
    const E_mag = Math.sqrt(Ex * Ex + Ey * Ey);
    
    probeValV.textContent = `${V.toFixed(1)} V`;
    probeValE.textContent = `${E_mag.toFixed(1)} V/m`;
    probeValEx.textContent = `${Ex.toFixed(1)} V/m`;
    probeValEy.textContent = `${Ey.toFixed(1)} V/m`;
  }
}

// Element Selection and Left Sidebar Editor Sync
function selectElement(el) {
  selectedElement = el;
  if (!el) {
    editorPlaceholder.classList.remove('hidden');
    editorControls.classList.add('hidden');
    return;
  }
  
  editorPlaceholder.classList.add('hidden');
  editorControls.classList.remove('hidden');
  
  // Update control inputs
  editorElementType.textContent = el.type === 'point' ? 'Point Charge' : el.type === 'line' ? 'Line Charge' : 'Parallel Plates';
  
  inputCharge.value = el.q;
  valCharge.textContent = `${el.q > 0 ? '+' : ''}${el.q.toFixed(1)} nC`;
  
  if (el.type === 'point') {
    groupLength.classList.add('hidden');
    groupSpacing.classList.add('hidden');
    groupAngle.classList.add('hidden');
  } else if (el.type === 'line') {
    groupLength.classList.remove('hidden');
    groupSpacing.classList.add('hidden');
    groupAngle.classList.remove('hidden');
    
    inputLength.value = el.length;
    valLength.textContent = `${el.length} px`;
    inputAngle.value = el.angle;
    valAngle.textContent = `${el.angle}°`;
  } else if (el.type === 'plates') {
    groupLength.classList.remove('hidden');
    groupSpacing.classList.remove('hidden');
    groupAngle.classList.remove('hidden');
    
    inputLength.value = el.length;
    valLength.textContent = `${el.length} px`;
    inputSpacing.value = el.spacing;
    valSpacing.textContent = `${el.spacing} px`;
    inputAngle.value = el.angle;
    valAngle.textContent = `${el.angle}°`;
  }
}

// Main Animation Loop
function tick() {
  // Update physics unless simulation is paused
  if (!isPaused) {
    updateParticles();
  }
  
  // Clear Canvas
  ctx.fillStyle = '#02060f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Rendering Toggles
  if (checkHeatmap.checked) drawHeatmap();
  if (checkGrid.checked) drawGrid();
  if (checkContours.checked) drawEquipotentialContours();
  if (checkFieldlines.checked) drawFieldLines();
  if (checkVectors.checked) drawVectors();
  
  drawElements();
  drawProbe();
  drawInjector();
  drawParticles();
  
  updateHUD();
  
  requestAnimationFrame(tick);
}

// Add New Elements
function addPointCharge(chargeVal) {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const newEl = {
    type: 'point',
    x: width / 2 + (Math.random() * 80 - 40),
    y: height / 2 + (Math.random() * 80 - 40),
    q: chargeVal,
    radius: 14
  };
  elements.push(newEl);
  selectElement(newEl);
  logToConsole(`Added Point Charge: ${chargeVal} nC`, 'success');
  saveState();
}

function addLineCharge() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const newEl = {
    type: 'line',
    x: width / 2,
    y: height / 2,
    q: 3.0,
    length: 150,
    angle: 0
  };
  elements.push(newEl);
  selectElement(newEl);
  logToConsole('Added Line Charge segment (3.0 nC, 150px)', 'success');
  saveState();
}

function addParallelPlates() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const newEl = {
    type: 'plates',
    x: width / 2,
    y: height / 2,
    q: 6.0,
    length: 180,
    spacing: 70,
    angle: 0
  };
  elements.push(newEl);
  selectElement(newEl);
  logToConsole('Added Parallel Plates capacitor configuration (6.0 nC)', 'success');
  saveState();
}

// Preset Layout Configurations
function loadPreset(type) {
  elements = [];
  particles = [];
  selectElement(null);
  
  const width = canvas.width / (window.devicePixelRatio || 1) || 800;
  const height = canvas.height / (window.devicePixelRatio || 1) || 500;
  
  const cx = width / 2;
  const cy = height / 2;
  
  if (type === 'dipole') {
    elements.push({ type: 'point', x: cx - 110, y: cy, q: 2.5, radius: 14 });
    elements.push({ type: 'point', x: cx + 110, y: cy, q: -2.5, radius: 14 });
    probe = { x: cx, y: cy - 60, radius: 12 };
    injector = { x: cx - 150, y: cy - 100, radius: 15, angle: 30 };
    logToConsole('Preset loaded: Dipole layout (symmetric +2.5 nC and -2.5 nC point charges)', 'info');
  } else if (type === 'capacitor') {
    elements.push({
      type: 'plates',
      x: cx,
      y: cy,
      q: 7.0,
      length: 220,
      spacing: 65,
      angle: 0
    });
    probe = { x: cx, y: cy, radius: 12 };
    injector = { x: cx - 170, y: cy - 10, radius: 15, angle: 0 };
    logToConsole('Preset loaded: Parallel plate capacitor (electric field is uniform between plates)', 'info');
  } else if (type === 'quadrupole') {
    elements.push({ type: 'point', x: cx - 80, y: cy - 80, q: 2.0, radius: 14 });
    elements.push({ type: 'point', x: cx + 80, y: cy - 80, q: -2.0, radius: 14 });
    elements.push({ type: 'point', x: cx + 80, y: cy + 80, q: 2.0, radius: 14 });
    elements.push({ type: 'point', x: cx - 80, y: cy + 80, q: -2.0, radius: 14 });
    probe = { x: cx, y: cy, radius: 12 };
    injector = { x: cx, y: cy - 150, radius: 15, angle: 90 };
    logToConsole('Preset loaded: Quadrupole layout (alternating positive/negative points)', 'info');
  }
  
  saveState();
}

// Particle Injector Action
function injectParticle() {
  let qValue = 1.0;
  const chargeType = inputPartCharge.value;
  
  if (chargeType === 'custom') {
    qValue = parseFloat(inputPartChargeVal.value);
  } else {
    qValue = parseFloat(chargeType);
  }
  
  const massVal = parseFloat(inputPartMass.value);
  const speed = parseFloat(inputPartSpeed.value);
  const launchAngle = parseFloat(inputPartAngle.value);
  
  const radians = (launchAngle * Math.PI) / 180;
  const vx = Math.cos(radians) * speed;
  const vy = Math.sin(radians) * speed;
  
  const p = {
    x: injector.x,
    y: injector.y,
    vx,
    vy,
    q: qValue,
    m: massVal,
    radius: 5,
    trail: [{ x: injector.x, y: injector.y }]
  };
  
  particles.push(p);
  logToConsole(`Injected Particle: q = ${qValue}e, m = ${massVal} amu, v0 = ${speed} px/frame`, 'success');
}

// DOM Setup & Interaction Bindings
document.addEventListener('DOMContentLoaded', () => {
  // Bind Telemetry & HUD elements
  hudPeakField = document.getElementById('hud-peak-field');
  hudChargeCount = document.getElementById('hud-charge-count');
  hudParticleCount = document.getElementById('hud-particle-count');
  hudFps = document.getElementById('hud-fps');
  
  // Add Elements buttons
  btnAddPos = document.getElementById('btn-add-pos');
  btnAddNeg = document.getElementById('btn-add-neg');
  btnAddLine = document.getElementById('btn-add-line');
  btnAddPlates = document.getElementById('btn-add-plates');
  
  // Editor
  editorPlaceholder = document.getElementById('editor-placeholder');
  editorControls = document.getElementById('editor-controls');
  editorElementType = document.getElementById('editor-element-type');
  btnDeleteElement = document.getElementById('btn-delete-element');
  inputCharge = document.getElementById('input-charge');
  valCharge = document.getElementById('val-charge');
  
  groupLength = document.getElementById('group-length');
  inputLength = document.getElementById('input-length');
  valLength = document.getElementById('val-length');
  
  groupSpacing = document.getElementById('group-spacing');
  inputSpacing = document.getElementById('input-spacing');
  valSpacing = document.getElementById('val-spacing');
  
  groupAngle = document.getElementById('group-angle');
  inputAngle = document.getElementById('input-angle');
  valAngle = document.getElementById('val-angle');
  
  // Checkboxes
  checkHeatmap = document.getElementById('check-heatmap');
  checkVectors = document.getElementById('check-vectors');
  checkFieldlines = document.getElementById('check-fieldlines');
  checkContours = document.getElementById('check-contours');
  checkProbe = document.getElementById('check-probe');
  checkGrid = document.getElementById('check-grid');
  
  // Float HUD
  simStatusText = document.getElementById('sim-status-text');
  probeHud = document.getElementById('probe-hud');
  probeValCoord = document.getElementById('probe-val-coord');
  probeValV = document.getElementById('probe-val-v');
  probeValE = document.getElementById('probe-val-e');
  probeValEx = document.getElementById('probe-val-ex');
  probeValEy = document.getElementById('probe-val-ey');
  
  // Presets
  btnPresetDipole = document.getElementById('btn-preset-dipole');
  btnPresetCapacitor = document.getElementById('btn-preset-capacitor');
  btnPresetQuadrupole = document.getElementById('btn-preset-quadrupole');
  
  // Particle Injector Controls
  inputPartCharge = document.getElementById('input-part-charge');
  groupCustomPartCharge = document.getElementById('group-custom-part-charge');
  inputPartChargeVal = document.getElementById('input-part-charge-val');
  inputPartMass = document.getElementById('input-part-mass');
  inputPartSpeed = document.getElementById('input-part-speed');
  valPartSpeed = document.getElementById('val-part-speed');
  inputPartAngle = document.getElementById('input-part-angle');
  valPartAngle = document.getElementById('val-part-angle');
  btnInjectParticle = document.getElementById('btn-inject-particle');
  
  // General Actions
  btnPausePlay = document.getElementById('btn-pause-play');
  playPauseIcon = document.getElementById('play-pause-icon');
  playPauseText = document.getElementById('play-pause-text');
  btnClearTrails = document.getElementById('btn-clear-trails');
  btnResetAll = document.getElementById('btn-reset-all');
  consoleLogs = document.getElementById('console-logs');
  
  // Canvas initialization
  initCanvas();
  
  // Event listeners for Add buttons
  btnAddPos.addEventListener('click', () => addPointCharge(1.5));
  btnAddNeg.addEventListener('click', () => addPointCharge(-1.5));
  btnAddLine.addEventListener('click', addLineCharge);
  btnAddPlates.addEventListener('click', addParallelPlates);
  
  // Preset buttons
  btnPresetDipole.addEventListener('click', () => loadPreset('dipole'));
  btnPresetCapacitor.addEventListener('click', () => loadPreset('capacitor'));
  btnPresetQuadrupole.addEventListener('click', () => loadPreset('quadrupole'));
  
  // Toggle Custom Particle Charge inputs
  inputPartCharge.addEventListener('change', () => {
    if (inputPartCharge.value === 'custom') {
      groupCustomPartCharge.classList.remove('hidden');
    } else {
      groupCustomPartCharge.classList.add('hidden');
    }
  });
  
  // Sync sliders text
  inputPartSpeed.addEventListener('input', () => {
    valPartSpeed.textContent = `${parseFloat(inputPartSpeed.value).toFixed(1)} px/frame`;
  });
  
  inputPartAngle.addEventListener('input', () => {
    valPartAngle.textContent = `${inputPartAngle.value}°`;
    injector.angle = parseInt(inputPartAngle.value);
  });
  
  // Inject Particle Action
  btnInjectParticle.addEventListener('click', injectParticle);
  
  // Sim Actions
  btnPausePlay.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      btnPausePlay.classList.add('paused');
      playPauseIcon.textContent = '▶️';
      playPauseText.textContent = 'Resume Engine';
      simStatusText.textContent = 'Physics Engine: PAUSED';
      logToConsole('Physics simulation paused.', 'warning');
    } else {
      btnPausePlay.classList.remove('paused');
      playPauseIcon.textContent = '⏸️';
      playPauseText.textContent = 'Pause Engine';
      simStatusText.textContent = 'Physics Engine: ACTIVE';
      logToConsole('Physics simulation resumed.', 'info');
    }
  });
  
  btnClearTrails.addEventListener('click', () => {
    particles.forEach(p => p.trail = [{ x: p.x, y: p.y }]);
    logToConsole('Particle trails cleared.', 'info');
  });
  
  btnResetAll.addEventListener('click', () => {
    elements = [];
    particles = [];
    selectElement(null);
    logToConsole('Simulator canvas wiped clean.', 'warning');
    saveState();
  });
  
  // Element Delete Action
  btnDeleteElement.addEventListener('click', () => {
    if (selectedElement) {
      const idx = elements.indexOf(selectedElement);
      if (idx !== -1) {
        elements.splice(idx, 1);
        logToConsole(`Removed charge element from sandbox.`, 'warning');
        selectElement(null);
        saveState();
      }
    }
  });
  
  // Editor values bindings
  inputCharge.addEventListener('input', () => {
    if (selectedElement) {
      selectedElement.q = parseFloat(inputCharge.value);
      valCharge.textContent = `${selectedElement.q > 0 ? '+' : ''}${selectedElement.q.toFixed(1)} nC`;
      saveState();
    }
  });
  
  inputLength.addEventListener('input', () => {
    if (selectedElement && (selectedElement.type === 'line' || selectedElement.type === 'plates')) {
      selectedElement.length = parseInt(inputLength.value);
      valLength.textContent = `${selectedElement.length} px`;
      saveState();
    }
  });
  
  inputSpacing.addEventListener('input', () => {
    if (selectedElement && selectedElement.type === 'plates') {
      selectedElement.spacing = parseInt(inputSpacing.value);
      valSpacing.textContent = `${selectedElement.spacing} px`;
      saveState();
    }
  });
  
  inputAngle.addEventListener('input', () => {
    if (selectedElement && (selectedElement.type === 'line' || selectedElement.type === 'plates')) {
      selectedElement.angle = parseInt(inputAngle.value);
      valAngle.textContent = `${selectedElement.angle}°`;
      saveState();
    }
  });
  
  // Toggle elements visibility
  checkProbe.addEventListener('change', () => {
    if (checkProbe.checked) {
      probeHud.classList.remove('hidden');
    } else {
      probeHud.classList.add('hidden');
    }
    saveState();
  });
  
  // Toggles save state
  [checkHeatmap, checkVectors, checkFieldlines, checkContours, checkGrid].forEach(ch => {
    ch.addEventListener('change', saveState);
  });
  
  // Canvas Mouse Interactions (Drag & Drop, Selection, Probe repositioning)
  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // Check if clicked Sensor Probe
    if (checkProbe.checked && Math.hypot(mx - probe.x, my - probe.y) < probe.radius + 5) {
      activeDrag = { type: 'probe' };
      return;
    }
    
    // Check if clicked Particle Injector
    if (Math.hypot(mx - injector.x, my - injector.y) < injector.radius + 5) {
      activeDrag = { type: 'injector' };
      return;
    }
    
    // Check if clicked any Charge Element
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      let clickHit = false;
      
      if (el.type === 'point') {
        clickHit = Math.hypot(mx - el.x, my - el.y) < 18;
      } else if (el.type === 'line' || el.type === 'plates') {
        // Drag center handles of line/plate charges
        clickHit = Math.hypot(mx - el.x, my - el.y) < 22;
      }
      
      if (clickHit) {
        selectElement(el);
        activeDrag = { type: 'element', index: i, offsetX: mx - el.x, offsetY: my - el.y };
        return;
      }
    }
    
    // If clicked empty space, deselect active element
    selectElement(null);
  });
  
  canvas.addEventListener('mousemove', e => {
    if (!activeDrag) return;
    
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // Boundary clamps
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const clampX = Math.max(15, Math.min(width - 15, mx));
    const clampY = Math.max(15, Math.min(height - 15, my));
    
    if (activeDrag.type === 'probe') {
      probe.x = clampX;
      probe.y = clampY;
    } else if (activeDrag.type === 'injector') {
      injector.x = clampX;
      injector.y = clampY;
    } else if (activeDrag.type === 'element') {
      const el = elements[activeDrag.index];
      el.x = Math.max(20, Math.min(width - 20, mx - activeDrag.offsetX));
      el.y = Math.max(20, Math.min(height - 20, my - activeDrag.offsetY));
      
      // Update form values dynamically during drag if selected
      if (el === selectedElement) {
        selectElement(el);
      }
    }
  });
  
  const clearDrag = () => {
    if (activeDrag) {
      activeDrag = null;
      saveState();
    }
  };
  
  canvas.addEventListener('mouseup', clearDrag);
  canvas.addEventListener('mouseleave', clearDrag);
  
  // Touch support for mobile layouts
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.touches[0].clientX - rect.left;
    const my = e.touches[0].clientY - rect.top;
    
    // Reuse mouse logic with simulated event
    const mockEvent = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    const mousedownHandler = canvas.getEventListeners ? canvas.getEventListeners('mousedown')[0].listener : null;
    
    // Fallback manual checks
    if (checkProbe.checked && Math.hypot(mx - probe.x, my - probe.y) < probe.radius + 12) {
      activeDrag = { type: 'probe' };
      e.preventDefault();
      return;
    }
    if (Math.hypot(mx - injector.x, my - injector.y) < injector.radius + 12) {
      activeDrag = { type: 'injector' };
      e.preventDefault();
      return;
    }
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      let clickHit = false;
      if (el.type === 'point') clickHit = Math.hypot(mx - el.x, my - el.y) < 24;
      else if (el.type === 'line' || el.type === 'plates') clickHit = Math.hypot(mx - el.x, my - el.y) < 28;
      
      if (clickHit) {
        selectElement(el);
        activeDrag = { type: 'element', index: i, offsetX: mx - el.x, offsetY: my - el.y };
        e.preventDefault();
        return;
      }
    }
    selectElement(null);
  });
  
  canvas.addEventListener('touchmove', e => {
    if (!activeDrag || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.touches[0].clientX - rect.left;
    const my = e.touches[0].clientY - rect.top;
    
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const clampX = Math.max(15, Math.min(width - 15, mx));
    const clampY = Math.max(15, Math.min(height - 15, my));
    
    if (activeDrag.type === 'probe') {
      probe.x = clampX;
      probe.y = clampY;
    } else if (activeDrag.type === 'injector') {
      injector.x = clampX;
      injector.y = clampY;
    } else if (activeDrag.type === 'element') {
      const el = elements[activeDrag.index];
      el.x = Math.max(20, Math.min(width - 20, mx - activeDrag.offsetX));
      el.y = Math.max(20, Math.min(height - 20, my - activeDrag.offsetY));
      if (el === selectedElement) selectElement(el);
    }
    e.preventDefault();
  });
  
  canvas.addEventListener('touchend', clearDrag);
  
  // Load State & Presets
  loadState();
  
  // Start Main loop
  tick();
});
