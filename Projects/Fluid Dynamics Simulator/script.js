/**
 * Fluid Dynamics Simulator & Visualizer
 * Core Navier-Stokes Grid Solver & Rendering Engine
 */

// Grid Solver Constants
const N = 45;                     // Solver grid resolution (N x N)
const size = (N + 2) * (N + 2);   // 1D array length including boundaries
let iterCount = 16;               // Jacobi iterations for linear solver

// Fluid Grid Arrays
let u = new Float32Array(size);        // Velocity X
let v = new Float32Array(size);        // Velocity Y
let u_prev = new Float32Array(size);   // Old Velocity X
let v_prev = new Float32Array(size);   // Old Velocity Y

// Multi-color Dye density channels (Red, Green, Blue)
let d_r = new Float32Array(size);
let d_g = new Float32Array(size);
let d_b = new Float32Array(size);
let d_r_prev = new Float32Array(size);
let d_g_prev = new Float32Array(size);
let d_b_prev = new Float32Array(size);

// Pressure and Divergence fields (used for Helmholtz-Hodge projection)
let pressure = new Float32Array(size);
let divergence = new Float32Array(size);

// Obstacle boundary flags
let is_obstacle = new Uint8Array(size);

// Physics Parameters
let viscosity = 0.0001;
let diffusion = 0.0001;
let decayRate = 0.005;

// Simulation State
let elements = [];            // Active Emitters & Obstacles
let particles = [];           // Weightless tracers
let selectedElement = null;
let activeDrag = null;
let isPaused = false;
let fps = 60;
let lastTime = performance.now();
let frames = 0;
let mouseX = 0, mouseY = 0, prevMouseX = 0, prevMouseY = 0;
let isMouseDown = false;
let activeDyeColor = 'cyan';  // Currently selected dye color in settings

// DOM Elements
let canvas, ctx;
let hudPeakVel, hudEmitterCount, hudParticleCount, hudFps;
let btnAddFaucet, btnAddDye, btnAddDrain;
let btnAddCircle, btnAddSquare, btnAddAirfoil;
let editorPlaceholder, editorControls, editorElementType, btnDeleteElement;
let inputSize, valSize;
let inputStrength, valStrength;
let inputColor, groupColor;
let inputAngle, valAngle, groupAngle;
let selectHeatmap;
let checkVectors, checkParticles, checkGrid, checkProbe;
let valViscosity, inputViscosity;
let valDiffusion, inputDiffusion;
let valDecay, inputDecay;
let valSolverIter, inputSolverIter;
let btnPausePlay, playPauseIcon, playPauseText, btnClearDye, btnResetAll, consoleLogs;
let simStatusText, probeHud, probeValCoord, probeValVel, probeValDens, probeValPress, probeValAngle;

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

// Convert 2D grid index to 1D flat array coordinate
function IX(i, j) {
  i = Math.max(0, Math.min(N + 1, i));
  j = Math.max(0, Math.min(N + 1, j));
  return i + (N + 2) * j;
}

// Set boundary conditions and obstacle reflection
function set_bnd(b, x) {
  // 1. Enforce outer frame bounding box walls
  for (let i = 1; i <= N; i++) {
    x[IX(0, i)]     = b === 1 ? -x[IX(1, i)] : x[IX(1, i)];
    x[IX(N + 1, i)] = b === 1 ? -x[IX(N, i)] : x[IX(N, i)];
    x[IX(i, 0)]     = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
    x[IX(i, N + 1)] = b === 2 ? -x[IX(i, N)] : x[IX(i, N)];
  }
  x[IX(0, 0)]         = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
  x[IX(0, N + 1)]     = 0.5 * (x[IX(1, N + 1)] + x[IX(0, N)]);
  x[IX(N + 1, 0)]     = 0.5 * (x[IX(N, 0)] + x[IX(N + 1, 1)]);
  x[IX(N + 1, N + 1)] = 0.5 * (x[IX(N, N + 1)] + x[IX(N + 1, N)]);

  // 2. Enforce internal solid boundary reflection conditions
  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= N; j++) {
      const idx = IX(i, j);
      if (is_obstacle[idx]) {
        if (b === 1) {
          // Horizontal velocity reflection (no-penetration bounce)
          let sum = 0, count = 0;
          if (!is_obstacle[IX(i - 1, j)]) { sum += -x[IX(i - 1, j)]; count++; }
          if (!is_obstacle[IX(i + 1, j)]) { sum += -x[IX(i + 1, j)]; count++; }
          x[idx] = count > 0 ? sum / count : 0;
        } else if (b === 2) {
          // Vertical velocity reflection
          let sum = 0, count = 0;
          if (!is_obstacle[IX(i, j - 1)]) { sum += -x[IX(i, j - 1)]; count++; }
          if (!is_obstacle[IX(i, j + 1)]) { sum += -x[IX(i, j + 1)]; count++; }
          x[idx] = count > 0 ? sum / count : 0;
        } else {
          // Scalars (Density, Pressure) match surrounding fluid values
          let sum = 0, count = 0;
          if (!is_obstacle[IX(i - 1, j)]) { sum += x[IX(i - 1, j)]; count++; }
          if (!is_obstacle[IX(i + 1, j)]) { sum += x[IX(i + 1, j)]; count++; }
          if (!is_obstacle[IX(i, j - 1)]) { sum += x[IX(i, j - 1)]; count++; }
          if (!is_obstacle[IX(i, j + 1)]) { sum += x[IX(i, j + 1)]; count++; }
          x[idx] = count > 0 ? sum / count : 0;
        }
      }
    }
  }
}

// Linear Jacobi/Gauss-Seidel relaxation solver
function linearSolve(b, x, x0, a, c) {
  const cRecip = 1.0 / c;
  for (let k = 0; k < iterCount; k++) {
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        const idx = IX(i, j);
        if (is_obstacle[idx]) continue;
        x[idx] = (x0[idx] + a * (
          x[IX(i - 1, j)] +
          x[IX(i + 1, j)] +
          x[IX(i, j - 1)] +
          x[IX(i, j + 1)]
        )) * cRecip;
      }
    }
    set_bnd(b, x);
  }
}

// Diffusion step
function diffuse(b, x, x0, diff, dt) {
  const a = dt * diff * N * N;
  linearSolve(b, x, x0, a, 1 + 4 * a);
}

// Semi-Lagrangian Advection step
function advect(b, d, d0, u_field, v_field, dt) {
  const dt0 = dt * N;
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      const idx = IX(i, j);
      if (is_obstacle[idx]) continue;
      
      // Look backward in time along local velocity vector
      let x = i - dt0 * u_field[idx];
      let y = j - dt0 * v_field[idx];
      
      // Clamp boundaries
      if (x < 0.5) x = 0.5;
      if (x > N + 0.5) x = N + 0.5;
      if (y < 0.5) y = 0.5;
      if (y > N + 0.5) y = N + 0.5;
      
      const i0 = Math.floor(x);
      const i1 = i0 + 1;
      const j0 = Math.floor(y);
      const j1 = j0 + 1;
      
      const s1 = x - i0;
      const s0 = 1 - s1;
      const t1 = y - j0;
      const t0 = 1 - t1;
      
      // Bilinear interpolation from surrounding cells
      d[idx] = 
        s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) +
        s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
    }
  }
  set_bnd(b, d);
}

// Pressure Poisson projection step to enforce mass-conserving flow
function project(u_field, v_field, p_field, div_field) {
  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      const idx = IX(i, j);
      if (is_obstacle[idx]) {
        div_field[idx] = 0;
        p_field[idx] = 0;
        continue;
      }
      div_field[idx] = -0.5 * (
        u_field[IX(i + 1, j)] - u_field[IX(i - 1, j)] +
        v_field[IX(i, j + 1)] - v_field[IX(i, j - 1)]
      ) / N;
      p_field[idx] = 0;
    }
  }
  set_bnd(0, div_field);
  set_bnd(0, p_field);
  
  // Solve Poisson pressure gradient
  linearSolve(0, p_field, div_field, 1, 4);
  
  // Subtract gradient of pressure field from velocity
  for (let j = 1; j <= N; j++) {
    for (let i = 1; i <= N; i++) {
      const idx = IX(i, j);
      if (is_obstacle[idx]) continue;
      u_field[idx] -= 0.5 * N * (p_field[IX(i + 1, j)] - p_field[IX(i - 1, j)]);
      v_field[idx] -= 0.5 * N * (p_field[IX(i, j + 1)] - p_field[IX(i, j - 1)]);
    }
  }
  set_bnd(1, u_field);
  set_bnd(2, v_field);
}

// Navier-Stokes Solver cycle step
function step(dt) {
  // 1. Velocity Solver (momentum transport, viscosity, projection)
  diffuse(1, u_prev, u, viscosity, dt);
  diffuse(2, v_prev, v, viscosity, dt);
  
  project(u_prev, v_prev, pressure, divergence);
  
  advect(1, u, u_prev, u_prev, v_prev, dt);
  advect(2, v, v_prev, u_prev, v_prev, dt);
  
  project(u, v, pressure, divergence);
  
  // 2. Density Solver (dye advection and diffusion)
  diffuse(0, d_r_prev, d_r, diffusion, dt);
  diffuse(0, d_g_prev, d_g, diffusion, dt);
  diffuse(0, d_b_prev, d_b, diffusion, dt);
  
  advect(0, d_r, d_r_prev, u, v, dt);
  advect(0, d_g, d_g_prev, u, v, dt);
  advect(0, d_b, d_b_prev, u, v, dt);
  
  // 3. Fade density over time (evaporation)
  const dMult = 1.0 - decayRate;
  for (let i = 0; i < size; i++) {
    d_r[i] *= dMult;
    d_g[i] *= dMult;
    d_b[i] *= dMult;
  }
}

// Rasterize active obstacles onto the grid
function rasterizeObstacles() {
  is_obstacle.fill(0);
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  elements.filter(el => el.type === 'circle' || el.type === 'square' || el.type === 'airfoil').forEach(obs => {
    // Convert obstacle bounds to grid indexes
    const cx = obs.x;
    const cy = obs.y;
    const rad = obs.size;
    const radSq = rad * rad;
    const angleRad = (obs.angle || 0) * Math.PI / 180;
    const cosA = Math.cos(-angleRad);
    const sinA = Math.sin(-angleRad);
    
    for (let j = 1; j <= N; j++) {
      const gy = (j - 0.5) * (height / N);
      for (let i = 1; i <= N; i++) {
        const gx = (i - 0.5) * (width / N);
        const idx = IX(i, j);
        
        if (obs.type === 'circle') {
          // Circle distance equation
          const dx = gx - cx;
          const dy = gy - cy;
          if (dx * dx + dy * dy < radSq) {
            is_obstacle[idx] = 1;
          }
        } else if (obs.type === 'square') {
          // Rotated box collision boundaries
          const rx = (gx - cx) * cosA - (gy - cy) * sinA;
          const ry = (gx - cx) * sinA + (gy - cy) * cosA;
          if (Math.abs(rx) < rad && Math.abs(ry) < rad) {
            is_obstacle[idx] = 1;
          }
        } else if (obs.type === 'airfoil') {
          // NACA aerofoil profile bounds check
          const rx = (gx - cx) * cosA - (gy - cy) * sinA;
          const ry = (gx - cx) * sinA + (gy - cy) * cosA;
          
          const chord = rad * 2.5; // Scale chord length
          const halfChord = chord / 2;
          
          if (rx >= -halfChord && rx <= halfChord) {
            // Normalize chord parameter t from [0, 1]
            const t = (rx + halfChord) / chord;
            
            // Standard aerodynamic thickness profiling
            const thickness = 0.3 * rad * (
              0.2969 * Math.sqrt(t) -
              0.1260 * t -
              0.3516 * t * t +
              0.2843 * Math.pow(t, 3) -
              0.1015 * Math.pow(t, 4)
            );
            
            // Camber curve offset
            const camber = 0.08 * chord * t * (1.0 - t); // Simple parabolic camber
            const localY = ry - camber;
            
            if (Math.abs(localY) < thickness) {
              is_obstacle[idx] = 1;
            }
          }
        }
      }
    }
  });
}

// Add Continuous Emitter flow
function applyEmitters() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  elements.filter(el => el.type === 'faucet' || el.type === 'dye' || el.type === 'drain').forEach(em => {
    // Map emitter position to grid coords
    const gi = Math.floor((em.x / width) * N) + 1;
    const gj = Math.floor((em.y / height) * N) + 1;
    
    const radCells = Math.max(1, Math.floor((em.size / width) * N));
    
    // RGB Color conversion helper
    let rVal = 0, gVal = 0, bVal = 0;
    if (em.color === 'cyan') { rVal = 0; gVal = 242; bVal = 254; }
    else if (em.color === 'magenta') { rVal = 255; gVal = 0; bVal = 127; }
    else if (em.color === 'lime') { rVal = 16; gVal = 185; bVal = 129; }
    else if (em.color === 'orange') { rVal = 245; gVal = 158; bVal = 11; }
    
    // Normalize strength values
    const dStr = 4.0;
    const angleRad = (em.angle || 0) * Math.PI / 180;
    
    for (let dj = -radCells; dj <= radCells; dj++) {
      for (let di = -radCells; di <= radCells; di++) {
        if (di * di + dj * dj <= radCells * radCells) {
          const idx = IX(gi + di, gj + dj);
          if (idx < 0 || idx >= size || is_obstacle[idx]) continue;
          
          if (em.type === 'faucet') {
            // Constant flow vector injection
            u[idx] = Math.cos(angleRad) * em.strength;
            v[idx] = Math.sin(angleRad) * em.strength;
            
            d_r[idx] = Math.min(255, d_r[idx] + (rVal / 255) * dStr);
            d_g[idx] = Math.min(255, d_g[idx] + (gVal / 255) * dStr);
            d_b[idx] = Math.min(255, d_b[idx] + (bVal / 255) * dStr);
          } else if (em.type === 'dye') {
            // Dye reservoir only
            d_r[idx] = Math.min(255, d_r[idx] + (rVal / 255) * dStr);
            d_g[idx] = Math.min(255, d_g[idx] + (gVal / 255) * dStr);
            d_b[idx] = Math.min(255, d_b[idx] + (bVal / 255) * dStr);
          } else if (em.type === 'drain') {
            // Sucks fluid in
            const center_x = em.x;
            const center_y = em.y;
            
            const cell_x = ((gi + di) - 0.5) * (width / N);
            const cell_y = ((gj + dj) - 0.5) * (height / N);
            
            const dx = center_x - cell_x;
            const dy = center_y - cell_y;
            const dist = Math.hypot(dx, dy) || 1;
            
            // Suction pull velocity vector pointing inwards
            u[idx] = (dx / dist) * Math.abs(em.strength) * 1.5;
            v[idx] = (dy / dist) * Math.abs(em.strength) * 1.5;
            
            // Evaporate dye density inside drain
            d_r[idx] *= 0.5;
            d_g[idx] *= 0.5;
            d_b[idx] *= 0.5;
          }
        }
      }
    }
  });
}

// Inject density / forces from mouse movement drag
function applyMouseInputs() {
  if (!isMouseDown) return;
  
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  // Calculate relative movement
  const dx = mouseX - prevMouseX;
  const dy = mouseY - prevMouseY;
  const moveDist = Math.hypot(dx, dy);
  
  // If moving, interpolate coordinates to prevent gaps
  const steps = Math.max(1, Math.floor(moveDist / 5));
  
  for (let s = 0; s < steps; s++) {
    const t = s / steps;
    const mx = prevMouseX + dx * t;
    const my = prevMouseY + dy * t;
    
    // Grid coordinate
    const gi = Math.floor((mx / width) * N) + 1;
    const gj = Math.floor((my / height) * N) + 1;
    
    if (gi <= 0 || gi > N || gj <= 0 || gj > N) continue;
    
    // RGB values of active dye choice
    let rVal = 0, gVal = 0, bVal = 0;
    if (activeDyeColor === 'cyan') { rVal = 0; gVal = 242; bVal = 254; }
    else if (activeDyeColor === 'magenta') { rVal = 255; gVal = 0; bVal = 127; }
    else if (activeDyeColor === 'lime') { rVal = 16; gVal = 185; bVal = 129; }
    else if (activeDyeColor === 'orange') { rVal = 245; gVal = 158; bVal = 11; }
    
    // Add density and velocity to grid neighborhood
    const brushRadius = 1;
    for (let ndj = -brushRadius; ndj <= brushRadius; ndj++) {
      for (let ndi = -brushRadius; ndi <= brushRadius; ndi++) {
        const idx = IX(gi + ndi, gj + ndj);
        if (idx < 0 || idx >= size || is_obstacle[idx]) continue;
        
        // Add dye density (cap at 255)
        d_r[idx] = Math.min(255, d_r[idx] + (rVal / 255) * 15);
        d_g[idx] = Math.min(255, d_g[idx] + (gVal / 255) * 15);
        d_b[idx] = Math.min(255, d_b[idx] + (bVal / 255) * 15);
        
        // Add velocity force proportional to movement
        u[idx] += dx * 0.12;
        v[idx] += dy * 0.12;
      }
    }
  }
  
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

// Generate Streamline Tracer particles
function initParticles() {
  particles = [];
  const maxPart = 1200;
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  for (let i = 0; i < maxPart; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      age: Math.random() * 200,
      prevX: 0,
      prevY: 0
    });
  }
}

// Interpolate Velocity components at float coordinates
function getInterpolatedVelocity(x, y) {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  // Grid cell coordinates
  const gx = (x / width) * N;
  const gy = (y / height) * N;
  
  const i0 = Math.floor(gx);
  const j0 = Math.floor(gy);
  
  if (i0 < 0 || i0 > N || j0 < 0 || j0 > N) {
    return { uVal: 0, vVal: 0 };
  }
  
  const i1 = i0 + 1;
  const j1 = j0 + 1;
  
  const fx = gx - i0;
  const fy = gy - j0;
  
  // Interpolation points
  const u00 = u[IX(i0, j0)], u10 = u[IX(i1, j0)], u01 = u[IX(i0, j1)], u11 = u[IX(i1, j1)];
  const v00 = v[IX(i0, j0)], v10 = v[IX(i1, j0)], v01 = v[IX(i0, j1)], v11 = v[IX(i1, j1)];
  
  const uVal = (1 - fx) * ((1 - fy) * u00 + fy * u01) + fx * ((1 - fy) * u10 + fy * u11);
  const vVal = (1 - fx) * ((1 - fy) * v00 + fy * v01) + fx * ((1 - fy) * v10 + fy * v11);
  
  return { uVal, vVal };
}

// Update weightless particle streamline tracers
function updateParticles() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  particles.forEach(p => {
    p.prevX = p.x;
    p.prevY = p.y;
    
    // Get flow velocity at particle coords
    const { uVal, vVal } = getInterpolatedVelocity(p.x, p.y);
    
    // Drift speed scaling
    p.x += uVal * 1.5;
    p.y += vVal * 1.5;
    p.age++;
    
    // Reset criteria (out of bounds, collided with obstacles, or too old)
    const gi = Math.floor((p.x / width) * N) + 1;
    const gj = Math.floor((p.y / height) * N) + 1;
    const hitObstacle = (gi >= 0 && gi <= N + 1 && gj >= 0 && gj <= N + 1) ? is_obstacle[IX(gi, gj)] : false;
    
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.age > 200 || hitObstacle) {
      // Re-seed at a random left boundary to maintain laminar inflow curves
      p.x = Math.random() * (width * 0.05); // Left boundary inlet
      p.y = Math.random() * height;
      p.prevX = p.x;
      p.prevY = p.y;
      p.age = 0;
    }
  });
}

// Render background density, velocity magnitude, or pressure
function drawHeatmap() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const cellW = width / N;
  const cellH = height / N;
  const viewMode = selectHeatmap.value;
  
  if (viewMode === 'none') return;
  
  for (let j = 1; j <= N; j++) {
    const py = (j - 1) * cellH;
    for (let i = 1; i <= N; i++) {
      const px = (i - 1) * cellW;
      const idx = IX(i, j);
      
      if (is_obstacle[idx]) {
        // Draw solid structural boundaries in gray
        ctx.fillStyle = '#1c2842';
        ctx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
        continue;
      }
      
      if (viewMode === 'density') {
        const r = Math.min(255, Math.floor(d_r[idx] * 45));
        const g = Math.min(255, Math.floor(d_g[idx] * 45));
        const b = Math.min(255, Math.floor(d_b[idx] * 45));
        
        if (r > 2 || g > 2 || b > 2) {
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
        }
      } else if (viewMode === 'velocity') {
        // Velocity magnitude heatmap
        const velMag = Math.sqrt(u[idx] * u[idx] + v[idx] * v[idx]);
        const intensity = Math.min(1.0, velMag * 0.25);
        
        // Custom hot-blue to fire gradient mapping
        const r = Math.floor(intensity * 230);
        const g = Math.floor(intensity * 120);
        const b = Math.floor(intensity * 255 + (1 - intensity) * 30);
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
      } else if (viewMode === 'pressure') {
        // Pressure gradient mapping (red = high, blue = low)
        const pressVal = pressure[idx];
        const normalized = Math.min(1.0, Math.max(-1.0, pressVal * 3)); // Normalize
        
        let r = 0, g = 0, b = 0;
        if (normalized > 0) {
          r = Math.floor(normalized * 220);
          b = Math.floor((1.0 - normalized) * 80);
        } else {
          b = Math.floor(-normalized * 220);
          r = Math.floor((1.0 + normalized) * 80);
        }
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
      }
    }
  }
}

// Render grid nodes outline
function drawGrid() {
  if (!checkGrid.checked) return;
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const cellW = width / N;
  const cellH = height / N;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
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

// Render Flow vector arrows
function drawVectors() {
  if (!checkVectors.checked) return;
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const cellW = width / N;
  const cellH = height / N;
  
  ctx.lineWidth = 1;
  
  // Sample every other grid cell to keep presentation tidy
  for (let j = 2; j < N; j += 2) {
    const py = (j - 0.5) * cellH;
    for (let i = 2; i < N; i += 2) {
      const px = (i - 0.5) * cellW;
      const idx = IX(i, j);
      
      if (is_obstacle[idx]) continue;
      
      const velX = u[idx];
      const velY = v[idx];
      const speed = Math.hypot(velX, velY);
      if (speed < 0.08) continue;
      
      const dx = velX / speed;
      const dy = velY / speed;
      const arrowLen = Math.min(22, 5 + speed * 4);
      
      const alpha = Math.min(0.7, speed * 0.3);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      
      const endX = px + dx * arrowLen;
      const endY = py + dy * arrowLen;
      
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Arrowhead
      const headlen = 4;
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

// Render Tracer Streamline Particles
function drawParticles() {
  if (!checkParticles.checked) return;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  
  particles.forEach(p => {
    ctx.moveTo(p.prevX, p.prevY);
    ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
}

// Render Elements (Emitters & Obstacles)
function drawElements() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  elements.forEach(el => {
    const isSelected = el === selectedElement;
    
    // Draw Emitters
    if (el.type === 'faucet' || el.type === 'dye' || el.type === 'drain') {
      let coreColor = '#00f2fe';
      if (el.type === 'drain') coreColor = '#a855f7';
      else if (el.type === 'dye') coreColor = '#10b981';
      
      ctx.strokeStyle = coreColor;
      ctx.lineWidth = 1.5;
      
      // Outer ring
      ctx.beginPath();
      ctx.arc(el.x, el.y, el.size, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Glow fill
      ctx.fillStyle = `rgba(${el.type === 'drain' ? '168, 85, 247' : el.type === 'dye' ? '16, 185, 129' : '0, 242, 254'}, 0.08)`;
      ctx.beginPath();
      ctx.arc(el.x, el.y, el.size, 0, 2 * Math.PI);
      ctx.fill();
      
      // Core center representation
      ctx.fillStyle = coreColor;
      ctx.beginPath();
      ctx.arc(el.x, el.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw Vector direction arrow for faucets
      if (el.type === 'faucet') {
        const radians = (el.angle || 0) * Math.PI / 180;
        const ax = el.x + Math.cos(radians) * (el.size + 10);
        const ay = el.y + Math.sin(radians) * (el.size + 10);
        
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(ax, ay);
        ctx.stroke();
        
        const headlen = 5;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - headlen * Math.cos(radians - Math.PI / 6), ay - headlen * Math.sin(radians - Math.PI / 6));
        ctx.lineTo(ax - headlen * Math.cos(radians + Math.PI / 6), ay - headlen * Math.sin(radians + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }
    }
    
    // Draw Obstacles (renders as wireframes on top of the grid block)
    if (el.type === 'circle' || el.type === 'square' || el.type === 'airfoil') {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
      
      if (el.type === 'circle') {
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (el.type === 'square') {
        // Rotated square wireframe
        const radians = (el.angle || 0) * Math.PI / 180;
        const cosA = Math.cos(radians);
        const sinA = Math.sin(radians);
        const sz = el.size;
        
        const pts = [
          { x: el.x + (-sz * cosA - -sz * sinA), y: el.y + (-sz * sinA + -sz * cosA) },
          { x: el.x + (sz * cosA - -sz * sinA), y: el.y + (sz * sinA + -sz * cosA) },
          { x: el.x + (sz * cosA - sz * sinA), y: el.y + (sz * sinA + sz * cosA) },
          { x: el.x + (-sz * cosA - sz * sinA), y: el.y + (-sz * sinA + sz * cosA) }
        ];
        
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.lineTo(pts[3].x, pts[3].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (el.type === 'airfoil') {
        // Airfoil wireframe profiling
        const radians = (el.angle || 0) * Math.PI / 180;
        const cosA = Math.cos(radians);
        const sinA = Math.sin(radians);
        
        const chord = el.size * 2.5;
        const halfChord = chord / 2;
        const step = 6;
        
        const upperPts = [];
        const lowerPts = [];
        
        for (let rx = -halfChord; rx <= halfChord; rx += step) {
          const t = (rx + halfChord) / chord;
          const thickness = 0.3 * el.size * (
            0.2969 * Math.sqrt(t) -
            0.1260 * t -
            0.3516 * t * t +
            0.2843 * Math.pow(t, 3) -
            0.1015 * Math.pow(t, 4)
          );
          const camber = 0.08 * chord * t * (1.0 - t);
          
          // Local Y coordinates
          const yTop = camber + thickness;
          const yBottom = camber - thickness;
          
          // Rotate to global
          upperPts.push({
            x: el.x + rx * cosA - yTop * sinA,
            y: el.y + rx * sinA + yTop * cosA
          });
          lowerPts.push({
            x: el.x + rx * cosA - yBottom * sinA,
            y: el.y + rx * sinA + yBottom * cosA
          });
        }
        
        // Draw airfoil shape
        ctx.beginPath();
        ctx.moveTo(upperPts[0].x, upperPts[0].y);
        for (let p = 1; p < upperPts.length; p++) {
          ctx.lineTo(upperPts[p].x, upperPts[p].y);
        }
        for (let p = lowerPts.length - 1; p >= 0; p--) {
          ctx.lineTo(lowerPts[p].x, lowerPts[p].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    
    // Draw active selection indicator dash-ring
    if (isSelected) {
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(el.x, el.y, el.size + 8, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
}

// Update HUD stats and sensor probe board reading
function updateHUD() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  // 1. Calculate Peak Velocity
  let maxVSq = 0;
  for (let i = 0; i < size; i++) {
    if (is_obstacle[i]) continue;
    const vsq = u[i] * u[i] + v[i] * v[i];
    if (vsq > maxVSq) maxVSq = vsq;
  }
  hudPeakVel.textContent = `${Math.sqrt(maxVSq).toFixed(2)} px/f`;
  hudEmitterCount.textContent = elements.filter(el => el.type === 'faucet' || el.type === 'dye' || el.type === 'drain').length;
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
  
  // 3. Sensor Probe Reading
  if (checkProbe.checked) {
    probeValCoord.textContent = `(x: ${Math.round(mouseX)}, y: ${Math.round(mouseY)})`;
    
    // Convert canvas coordinates to grid index
    const gi = Math.floor((mouseX / width) * N) + 1;
    const gj = Math.floor((mouseY / height) * N) + 1;
    
    if (gi >= 0 && gi <= N + 1 && gj >= 0 && gj <= N + 1) {
      const idx = IX(gi, gj);
      
      const velX = u[idx];
      const velY = v[idx];
      const speed = Math.hypot(velX, velY);
      const density = Math.min(100, (d_r[idx] + d_g[idx] + d_b[idx]) / 3 * 100 / 255);
      const press = pressure[idx];
      const angleDeg = Math.round((Math.atan2(velY, velX) * 180) / Math.PI + 360) % 360;
      
      probeValVel.textContent = `${speed.toFixed(2)} px/f`;
      probeValDens.textContent = `${density.toFixed(1)} %`;
      probeValPress.textContent = `${press.toFixed(3)}`;
      probeValAngle.textContent = `${angleDeg}°`;
    }
  }
}

// Sync Left Sidebar editor input values
function selectElement(el) {
  selectedElement = el;
  if (!el) {
    editorPlaceholder.classList.remove('hidden');
    editorControls.classList.add('hidden');
    return;
  }
  
  editorPlaceholder.classList.add('hidden');
  editorControls.classList.remove('hidden');
  
  // Show / Hide control inputs based on selected element type
  if (el.type === 'circle' || el.type === 'square' || el.type === 'airfoil') {
    editorElementType.textContent = el.type === 'circle' ? 'Circle Obstacle' : el.type === 'square' ? 'Square Obstacle' : 'Wing Airfoil';
    
    inputSize.value = el.size;
    valSize.textContent = `${el.size} px`;
    
    groupColor.classList.add('hidden');
    groupStrength.classList.add('hidden');
    
    if (el.type === 'circle') {
      groupAngle.classList.add('hidden');
    } else {
      groupAngle.classList.remove('hidden');
      inputAngle.value = el.angle || 0;
      valAngle.textContent = `${el.angle || 0}°`;
    }
  } else {
    editorElementType.textContent = emLabel(el.type);
    
    inputSize.value = el.size;
    valSize.textContent = `${el.size} px`;
    
    groupStrength.classList.remove('hidden');
    inputStrength.value = el.strength;
    valStrength.textContent = el.strength.toFixed(1);
    
    if (el.type === 'drain') {
      groupColor.classList.add('hidden');
      groupAngle.classList.add('hidden');
    } else {
      groupColor.classList.remove('hidden');
      inputColor.value = el.color;
      
      if (el.type === 'faucet') {
        groupAngle.classList.remove('hidden');
        inputAngle.value = el.angle || 0;
        valAngle.textContent = `${el.angle || 0}°`;
      } else {
        groupAngle.classList.add('hidden');
      }
    }
  }
}

function emLabel(type) {
  if (type === 'faucet') return 'Faucet Emitter';
  if (type === 'dye') return 'Dye Reservoir';
  if (type === 'drain') return 'Fluid Drain';
  return 'Emitter';
}

// Save Sandbox State to LocalStorage
function saveState() {
  const state = {
    elements,
    settings: {
      viscosity,
      diffusion,
      decayRate,
      iterCount,
      heatmap: selectHeatmap.value,
      vectors: checkVectors.checked,
      particles: checkParticles.checked,
      grid: checkGrid.checked,
      probe: checkProbe.checked
    }
  };
  localStorage.setItem('fluid_dynamics_sim_state', JSON.stringify(state));
}

// Restore State from LocalStorage
function loadState() {
  try {
    const saved = localStorage.getItem('fluid_dynamics_sim_state');
    if (saved) {
      const state = JSON.parse(saved);
      elements = state.elements || [];
      
      if (state.settings) {
        viscosity = state.settings.viscosity !== undefined ? state.settings.viscosity : viscosity;
        diffusion = state.settings.diffusion !== undefined ? state.settings.diffusion : diffusion;
        decayRate = state.settings.decayRate !== undefined ? state.settings.decayRate : decayRate;
        iterCount = state.settings.iterCount !== undefined ? state.settings.iterCount : iterCount;
        
        inputViscosity.value = viscosity;
        valViscosity.textContent = viscosity.toString();
        
        inputDiffusion.value = diffusion;
        valDiffusion.textContent = diffusion.toString();
        
        inputDecay.value = decayRate;
        valDecay.textContent = decayRate.toString();
        
        inputSolverIter.value = iterCount;
        valSolverIter.textContent = iterCount.toString();
        
        selectHeatmap.value = state.settings.heatmap || 'density';
        checkVectors.checked = state.settings.vectors === true;
        checkParticles.checked = state.settings.particles !== false;
        checkGrid.checked = state.settings.grid !== false;
        checkProbe.checked = state.settings.probe !== false;
      }
      
      rasterizeObstacles();
      logToConsole('Saved sandbox layout restored.', 'success');
    } else {
      loadPreset('vortex');
    }
  } catch (e) {
    console.error('Failed to restore fluid state', e);
    loadPreset('vortex');
  }
}

// Preset Layout Configs
function loadPreset(type) {
  elements = [];
  u.fill(0);
  v.fill(0);
  d_r.fill(0);
  d_g.fill(0);
  d_b.fill(0);
  selectedElement = null;
  selectElement(null);
  
  const width = canvas.width / (window.devicePixelRatio || 1) || 800;
  const height = canvas.height / (window.devicePixelRatio || 1) || 500;
  const cx = width / 2;
  const cy = height / 2;
  
  if (type === 'vortex') {
    // Karman Vortex Street Flow
    // 1. Solid Circle
    elements.push({ type: 'circle', x: cx - 120, y: cy, size: 28 });
    // 2. Linear Flow Emitter covering left boundary
    elements.push({ type: 'faucet', x: 25, y: cy, size: 140, strength: 5.5, color: 'cyan', angle: 0 });
    
    // Global parameters
    viscosity = 0.0001;
    decayRate = 0.003;
    logToConsole('Preset loaded: Kármán Vortex Street (fluid splits around cylinder generating vortex patterns).', 'info');
  } else if (type === 'cavity') {
    // Lid-Driven Cavity
    // Border obstacle walls (forming box enclosure)
    elements.push({ type: 'faucet', x: cx, y: 30, size: cx * 0.9, strength: 6.0, color: 'magenta', angle: 0 });
    // Drains in corners to maintain circulation
    elements.push({ type: 'drain', x: width - 50, y: height - 50, size: 30, strength: -2.0 });
    
    viscosity = 0.0002;
    decayRate = 0.008;
    logToConsole('Preset loaded: Lid-Driven Cavity (shear force at boundary drives internal vortex circular flow).', 'info');
  } else if (type === 'lift') {
    // Airfoil Lift profile flow
    elements.push({ type: 'airfoil', x: cx - 50, y: cy, size: 30, angle: 15 });
    elements.push({ type: 'faucet', x: 25, y: cy, size: 130, strength: 4.8, color: 'lime', angle: 0 });
    
    viscosity = 0.0001;
    decayRate = 0.004;
    logToConsole('Preset loaded: Airfoil Lift Flow (wing splits laminar streamlines, visualizing pressure offsets).', 'info');
  }
  
  // Set forms
  inputViscosity.value = viscosity;
  valViscosity.textContent = viscosity.toString();
  inputDecay.value = decayRate;
  valDecay.textContent = decayRate.toString();
  
  rasterizeObstacles();
  saveState();
}

// Add elements actions
function addObstacle(shapeType) {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  const obs = {
    type: shapeType,
    x: width / 2 + (Math.random() * 80 - 40),
    y: height / 2 + (Math.random() * 80 - 40),
    size: shapeType === 'airfoil' ? 30 : 25,
    angle: shapeType === 'circle' ? 0 : 15
  };
  
  elements.push(obs);
  rasterizeObstacles();
  selectElement(obs);
  logToConsole(`Added ${shapeType.toUpperCase()} solid boundary obstacle.`, 'success');
  saveState();
}

function addEmitter(emType) {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  const em = {
    type: emType,
    x: width / 2 + (Math.random() * 80 - 40),
    y: height / 2 + (Math.random() * 80 - 40),
    size: emType === 'drain' ? 24 : 35,
    strength: emType === 'drain' ? -3.0 : 3.0,
    color: activeDyeColor,
    angle: 0
  };
  
  elements.push(em);
  selectElement(em);
  logToConsole(`Added ${emLabel(emType)} grid element.`, 'success');
  saveState();
}

// Animation loop
function tick() {
  if (!isPaused) {
    applyEmitters();
    applyMouseInputs();
    step(0.1);
    updateParticles();
  }
  
  // Draw scene
  ctx.fillStyle = '#020409';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawHeatmap();
  drawGrid();
  drawVectors();
  drawParticles();
  drawElements();
  
  updateHUD();
  
  requestAnimationFrame(tick);
}

// Setup and Event bindings
document.addEventListener('DOMContentLoaded', () => {
  // Bind UI elements
  hudPeakVel = document.getElementById('hud-peak-vel');
  hudEmitterCount = document.getElementById('hud-emitter-count');
  hudParticleCount = document.getElementById('hud-particle-count');
  hudFps = document.getElementById('hud-fps');
  
  btnAddFaucet = document.getElementById('btn-add-faucet');
  btnAddDye = document.getElementById('btn-add-dye');
  btnAddDrain = document.getElementById('btn-add-drain');
  btnAddCircle = document.getElementById('btn-add-circle');
  btnAddSquare = document.getElementById('btn-add-square');
  btnAddAirfoil = document.getElementById('btn-add-airfoil');
  
  editorPlaceholder = document.getElementById('editor-placeholder');
  editorControls = document.getElementById('editor-controls');
  editorElementType = document.getElementById('editor-element-type');
  btnDeleteElement = document.getElementById('btn-delete-element');
  
  inputSize = document.getElementById('input-size');
  valSize = document.getElementById('val-size');
  inputStrength = document.getElementById('input-strength');
  valStrength = document.getElementById('val-strength');
  inputColor = document.getElementById('input-color');
  groupColor = document.getElementById('group-color');
  inputAngle = document.getElementById('input-angle');
  valAngle = document.getElementById('val-angle');
  groupAngle = document.getElementById('group-angle');
  
  btnPresetVortex = document.getElementById('btn-preset-vortex');
  btnPresetCavity = document.getElementById('btn-preset-cavity');
  btnPresetLift = document.getElementById('btn-preset-lift');
  
  selectHeatmap = document.getElementById('select-heatmap');
  checkVectors = document.getElementById('check-vectors');
  checkParticles = document.getElementById('check-particles');
  checkGrid = document.getElementById('check-grid');
  checkProbe = document.getElementById('check-probe');
  
  inputViscosity = document.getElementById('input-viscosity');
  valViscosity = document.getElementById('val-viscosity');
  inputDiffusion = document.getElementById('input-diffusion');
  valDiffusion = document.getElementById('val-diffusion');
  inputDecay = document.getElementById('input-decay');
  valDecay = document.getElementById('val-decay');
  inputSolverIter = document.getElementById('input-solver-iter');
  valSolverIter = document.getElementById('val-solver-iter');
  
  btnPausePlay = document.getElementById('btn-pause-play');
  playPauseIcon = document.getElementById('play-pause-icon');
  playPauseText = document.getElementById('play-pause-text');
  btnClearDye = document.getElementById('btn-clear-dye');
  btnResetAll = document.getElementById('btn-reset-all');
  consoleLogs = document.getElementById('console-logs');
  
  simStatusText = document.getElementById('sim-status-text');
  probeHud = document.getElementById('probe-hud');
  probeValCoord = document.getElementById('probe-val-coord');
  probeValVel = document.getElementById('probe-val-vel');
  probeValDens = document.getElementById('probe-val-dens');
  probeValPress = document.getElementById('probe-val-press');
  probeValAngle = document.getElementById('probe-val-angle');
  
  // Setup Canvas
  canvas = document.getElementById('sim-canvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Emitters and Obstacles adders
  btnAddFaucet.addEventListener('click', () => addEmitter('faucet'));
  btnAddDye.addEventListener('click', () => addEmitter('dye'));
  btnAddDrain.addEventListener('click', () => addEmitter('drain'));
  btnAddCircle.addEventListener('click', () => addObstacle('circle'));
  btnAddSquare.addEventListener('click', () => addObstacle('square'));
  btnAddAirfoil.addEventListener('click', () => addObstacle('airfoil'));
  
  // Preset clicks
  btnPresetVortex.addEventListener('click', () => loadPreset('vortex'));
  btnPresetCavity.addEventListener('click', () => loadPreset('cavity'));
  btnPresetLift.addEventListener('click', () => loadPreset('lift'));
  
  // Form input changes
  inputSize.addEventListener('input', () => {
    if (selectedElement) {
      selectedElement.size = parseInt(inputSize.value);
      valSize.textContent = `${selectedElement.size} px`;
      rasterizeObstacles();
      saveState();
    }
  });
  
  inputStrength.addEventListener('input', () => {
    if (selectedElement) {
      selectedElement.strength = parseFloat(inputStrength.value);
      valStrength.textContent = selectedElement.strength.toFixed(1);
      saveState();
    }
  });
  
  inputColor.addEventListener('change', () => {
    if (selectedElement) {
      selectedElement.color = inputColor.value;
      saveState();
    }
    activeDyeColor = inputColor.value;
  });
  
  inputAngle.addEventListener('input', () => {
    if (selectedElement) {
      selectedElement.angle = parseInt(inputAngle.value);
      valAngle.textContent = `${selectedElement.angle}°`;
      rasterizeObstacles();
      saveState();
    }
  });
  
  // Delete action
  btnDeleteElement.addEventListener('click', () => {
    if (selectedElement) {
      const idx = elements.indexOf(selectedElement);
      if (idx !== -1) {
        elements.splice(idx, 1);
        logToConsole(`Removed element from canvas grid.`, 'warning');
        selectElement(null);
        rasterizeObstacles();
        saveState();
      }
    }
  });
  
  // Toggles and visualization maps
  selectHeatmap.addEventListener('change', saveState);
  checkVectors.addEventListener('change', saveState);
  checkParticles.addEventListener('change', saveState);
  checkGrid.addEventListener('change', saveState);
  
  checkProbe.addEventListener('change', () => {
    if (checkProbe.checked) {
      probeHud.classList.remove('hidden');
    } else {
      probeHud.classList.add('hidden');
    }
    saveState();
  });
  
  // Sliders for physics parameters
  inputViscosity.addEventListener('input', () => {
    viscosity = parseFloat(inputViscosity.value);
    valViscosity.textContent = viscosity.toString();
    saveState();
  });
  
  inputDiffusion.addEventListener('input', () => {
    diffusion = parseFloat(inputDiffusion.value);
    valDiffusion.textContent = diffusion.toString();
    saveState();
  });
  
  inputDecay.addEventListener('input', () => {
    decayRate = parseFloat(inputDecay.value);
    valDecay.textContent = decayRate.toString();
    saveState();
  });
  
  inputSolverIter.addEventListener('input', () => {
    iterCount = parseInt(inputSolverIter.value);
    valSolverIter.textContent = iterCount.toString();
    saveState();
  });
  
  // General controls buttons
  btnPausePlay.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      btnPausePlay.classList.add('paused');
      playPauseIcon.textContent = '▶️';
      playPauseText.textContent = 'Resume Engine';
      simStatusText.textContent = 'Fluid Solver: PAUSED';
      logToConsole('Fluid solver physics updates suspended.', 'warning');
    } else {
      btnPausePlay.classList.remove('paused');
      playPauseIcon.textContent = '⏸️';
      playPauseText.textContent = 'Pause Engine';
      simStatusText.textContent = 'Fluid Solver: ACTIVE';
      logToConsole('Fluid solver physics updates resumed.', 'info');
    }
  });
  
  btnClearDye.addEventListener('click', () => {
    d_r.fill(0);
    d_g.fill(0);
    d_b.fill(0);
    logToConsole('Cleared dye density grids.', 'info');
  });
  
  btnResetAll.addEventListener('click', () => {
    elements = [];
    u.fill(0);
    v.fill(0);
    d_r.fill(0);
    d_g.fill(0);
    d_b.fill(0);
    rasterizeObstacles();
    selectElement(null);
    logToConsole('Fluid sandbox cleared and reset.', 'warning');
    saveState();
  });
  
  // Canvas Mouse Interactions
  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // Check if clicked any element (emitter/obstacle)
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const dist = Math.hypot(mx - el.x, my - el.y);
      if (dist < el.size + 8) {
        selectElement(el);
        activeDrag = { index: i, offsetX: mx - el.x, offsetY: my - el.y };
        return;
      }
    }
    
    // Otherwise drag mouse to inject dye forces
    isMouseDown = true;
    mouseX = mx;
    mouseY = my;
    prevMouseX = mx;
    prevMouseY = my;
    selectElement(null);
  });
  
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    mouseX = mx;
    mouseY = my;
    
    if (activeDrag !== null) {
      const el = elements[activeDrag.index];
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      
      el.x = Math.max(10, Math.min(width - 10, mx - activeDrag.offsetX));
      el.y = Math.max(10, Math.min(height - 10, my - activeDrag.offsetY));
      
      if (el === selectedElement) {
        selectElement(el);
      }
      rasterizeObstacles();
    }
  });
  
  const clearDrag = () => {
    isMouseDown = false;
    if (activeDrag !== null) {
      activeDrag = null;
      saveState();
    }
  };
  
  canvas.addEventListener('mouseup', clearDrag);
  canvas.addEventListener('mouseleave', clearDrag);
  
  // Mobile touch support
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.touches[0].clientX - rect.left;
    const my = e.touches[0].clientY - rect.top;
    
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const dist = Math.hypot(mx - el.x, my - el.y);
      if (dist < el.size + 15) {
        selectElement(el);
        activeDrag = { index: i, offsetX: mx - el.x, offsetY: my - el.y };
        e.preventDefault();
        return;
      }
    }
    
    isMouseDown = true;
    mouseX = mx;
    mouseY = my;
    prevMouseX = mx;
    prevMouseY = my;
    selectElement(null);
  });
  
  canvas.addEventListener('touchmove', e => {
    if (e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.touches[0].clientX - rect.left;
    const my = e.touches[0].clientY - rect.top;
    
    mouseX = mx;
    mouseY = my;
    
    if (activeDrag !== null) {
      const el = elements[activeDrag.index];
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      el.x = Math.max(10, Math.min(width - 10, mx - activeDrag.offsetX));
      el.y = Math.max(10, Math.min(height - 10, my - activeDrag.offsetY));
      if (el === selectedElement) selectElement(el);
      rasterizeObstacles();
    }
    e.preventDefault();
  });
  
  canvas.addEventListener('touchend', clearDrag);
  
  // Init particle stream
  initParticles();
  
  // Restore sandbox layout or preset
  loadState();
  
  // Trigger loops
  tick();
});
