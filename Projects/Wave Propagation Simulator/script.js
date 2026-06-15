/**
 * Wave Propagation Simulator - Core Physics Engine & UI Controller
 * Authors: Sujal
 * License: Open Source
 */

(function () {
  // --- STATE VARIABLES ---
  let mode = '1d-transverse'; // '1d-transverse' | '1d-longitudinal' | '2d-ripple'
  let isPlaying = true;
  let time = 0;
  let timeStep = 0.05;
  let speedMultiplier = 1.0;
  
  // Physics parameters
  let waveSpeed = 1.0;
  let frequency = 1.5;
  let amplitude = 1.2;
  let damping = 0.005;
  let boundary1D = 'absorbing'; // 'absorbing' | 'fixed' | 'free'
  let absorbingBoundaries2D = true;
  
  // Interactive Brush parameters
  let brushType = 'source'; // 'source' | 'wall' | 'erase' | 'inspect'
  let brushSize = 2;
  let isDrawing = false;

  // 1D String Configuration
  const N_1D = 120; // Number of particles
  let y_curr = new Float32Array(N_1D);
  let y_prev = new Float32Array(N_1D);
  let y_next = new Float32Array(N_1D);
  let isStandingWaveMode = false;
  let standingWaveN = 1;

  // 2D Grid Configuration (for real-time performance at 60 FPS)
  const W_2D = 100;
  const H_2D = 100;
  let u_curr = new Float32Array(W_2D * H_2D);
  let u_prev = new Float32Array(W_2D * H_2D);
  let u_next = new Float32Array(W_2D * H_2D);
  let obstacles = new Uint8Array(W_2D * H_2D);
  let dampingGrid = new Float32Array(W_2D * H_2D);
  let sources = []; // Array of {x, y, frequency, amplitude, phase, mode: 'sine'|'pulse', startTime, pulseDone}

  // Telemetry Probe
  let probeX = 50;
  let probeY = 50;
  let probeHistory = new Float32Array(300);
  let probeHistoryIdx = 0;

  // Canvas elements
  const mainCanvas = document.getElementById('sim-canvas');
  const mainCtx = mainCanvas.getContext('2d');
  
  const oscCanvas = document.getElementById('oscilloscope-canvas');
  const oscCtx = oscCanvas.getContext('2d');

  // Offscreen canvas for fast 2D pixel scaling
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = W_2D;
  offscreenCanvas.height = H_2D;
  const offscreenCtx = offscreenCanvas.getContext('2d');
  const offscreenImgData = offscreenCtx.createImageData(W_2D, H_2D);

  // Performance tracking
  let lastFrameTime = performance.now();
  let frameCount = 0;
  let fps = 0;
  let lastFpsUpdate = 0;

  // Audio / Visual cues
  const consoleEl = document.getElementById('logger-console');

  // --- LOGGING ---
  function log(message, type = 'sys') {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    
    let prefix = '[SYS]';
    if (type === 'phys') prefix = '[PHYSICS]';
    if (type === 'preset') prefix = '[PRESET]';
    if (type === 'warn') prefix = '[WARN]';
    
    entry.textContent = `${prefix} ${timeStr} - ${message}`;
    consoleEl.appendChild(entry);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  // --- INITIALIZE & PRECOMPUTE ---
  function initDampingGrid() {
    // Computes higher boundary absorption coefficient (PML-like boundary)
    for (let y = 0; y < H_2D; y++) {
      for (let x = 0; x < W_2D; x++) {
        let idx = y * W_2D + x;
        let distEdgeX = Math.min(x, W_2D - 1 - x);
        let distEdgeY = Math.min(y, H_2D - 1 - y);
        let distToEdge = Math.min(distEdgeX, distEdgeY);

        let cellDamping = damping;
        if (absorbingBoundaries2D && distToEdge < 12) {
          // Quadratic decay factor near edges
          let factor = (12 - distToEdge) / 12;
          cellDamping = damping + 0.18 * (factor * factor);
        }
        dampingGrid[idx] = cellDamping;
      }
    }
  }

  function reset1DSim() {
    y_curr.fill(0);
    y_prev.fill(0);
    y_next.fill(0);
    isStandingWaveMode = false;
    time = 0;
    probeHistory.fill(0);
    log('1D Simulator reset. Medium state cleared.', 'sys');
  }

  function reset2DSim() {
    u_curr.fill(0);
    u_prev.fill(0);
    u_next.fill(0);
    probeHistory.fill(0);
    time = 0;
    // Clear dynamic sources but keep obstacle walls if not resetting everything
    // Let's keep walls unless explicitly requested. But for general clear, clear sources too.
    sources = [];
    log('2D Simulator waves cleared. Active drivers reset.', 'sys');
  }

  function clearAll() {
    reset1DSim();
    reset2DSim();
    obstacles.fill(0);
    sources = [];
    log('Full simulation space cleared. All obstacle barriers deleted.', 'warn');
  }

  // --- PHYSICS ENGINE: 1D ---
  function update1D() {
    if (!isPlaying) return;

    let dt = timeStep * speedMultiplier;
    time += dt;

    // Numerical stable Courant limit coefficient C = (c * dt / dx)^2
    // For 1D string, dx=1, stability is C < 1.0. Let's clamp speed limit.
    let C = Math.min(0.9, 0.4 * waveSpeed * waveSpeed);

    // Standing Wave Analytical Mode
    if (isStandingWaveMode) {
      let L = N_1D - 1;
      let k = (standingWaveN * Math.PI) / L;
      let omega = waveSpeed * k;
      for (let i = 0; i < N_1D; i++) {
        // Enforce boundary nodes at ends
        if (i === 0 || i === N_1D - 1) {
          y_curr[i] = 0;
          continue;
        }
        y_curr[i] = amplitude * Math.sin(k * i) * Math.cos(omega * time);
      }
      return;
    }

    // Driven 1D Physical String: Solve Wave equation
    // Calculate new values for inner cells
    for (let i = 1; i < N_1D - 1; i++) {
      let cellDamping = damping;
      
      // Boundary absorption zone (right side only for driven wave)
      if (boundary1D === 'absorbing' && i > N_1D - 16) {
        let dist = i - (N_1D - 16);
        let factor = dist / 16;
        cellDamping = damping + 0.22 * (factor * factor);
      }

      let y_val = y_curr[i];
      let prev_val = y_prev[i];
      let laplacian = y_curr[i + 1] + y_curr[i - 1] - 2 * y_val;

      // Numerical integration step:
      // y_next = 2*y - y_prev + C * laplacian - damping * (y - y_prev)
      let next_val = 2 * y_val - prev_val + C * laplacian - cellDamping * (y_val - prev_val);
      y_next[i] = next_val;
    }

    // Left boundary: Driver oscillator
    let driverVal = amplitude * Math.sin(2 * Math.PI * frequency * time);
    y_next[0] = driverVal;

    // Right boundary conditions
    if (boundary1D === 'fixed') {
      y_next[N_1D - 1] = 0; // Fixed node
    } else if (boundary1D === 'free') {
      // Free boundary: Neumann boundary condition u_x = 0 -> u[N-1] = u[N-2]
      y_next[N_1D - 1] = y_next[N_1D - 2];
    } else {
      // Absorbing Boundary: simple extrapolation with high boundary damping
      y_next[N_1D - 1] = y_next[N_1D - 2] * 0.92;
    }

    // Swap pointers
    let temp = y_prev;
    y_prev = y_curr;
    y_curr = y_next;
    y_next = temp;
  }

  // --- PHYSICS ENGINE: 2D ---
  function update2D() {
    if (!isPlaying) return;

    let dt = timeStep * speedMultiplier;
    time += dt;

    // Courant Stability coefficient: C = (c * dt)^2. In 2D, C must be < 0.5.
    let C = Math.min(0.48, 0.12 * waveSpeed * waveSpeed);

    // Resolve drivers and oscillators
    sources.forEach(src => {
      let idx = src.y * W_2D + src.x;
      if (obstacles[idx]) return;

      if (src.mode === 'sine') {
        u_curr[idx] = src.amplitude * Math.sin(2 * Math.PI * src.frequency * time + src.phase);
      } else if (src.mode === 'pulse') {
        if (!src.pulseDone) {
          let tPulse = time - src.startTime;
          // Gaussian-modulated sinusoidal pulse
          if (tPulse < 3.0) {
            u_curr[idx] = src.amplitude * Math.sin(2 * Math.PI * src.frequency * tPulse) * Math.exp(-tPulse * tPulse * 1.5);
          } else {
            src.pulseDone = true;
          }
        }
      }
    });

    // Central Finite Differences loop
    for (let y = 1; y < H_2D - 1; y++) {
      for (let x = 1; x < W_2D - 1; x++) {
        let idx = y * W_2D + x;

        // Skip calculations inside rigid obstacle walls
        if (obstacles[idx]) {
          u_next[idx] = 0;
          continue;
        }

        let u_val = u_curr[idx];
        let prev_val = u_prev[idx];

        // 2D Laplacian operator (discretized 5-point stencil)
        let laplacian = u_curr[idx + 1] + u_curr[idx - 1] + u_curr[idx + W_2D] + u_curr[idx - W_2D] - 4 * u_val;
        let cellDamping = dampingGrid[idx];

        // Wave integration equation
        let next_val = 2 * u_val - prev_val + C * laplacian - cellDamping * (u_val - prev_val);
        u_next[idx] = next_val;
      }
    }

    // Boundaries updates (Neumann free reflection vs Absorbing margin)
    for (let x = 0; x < W_2D; x++) {
      u_next[x] = absorbingBoundaries2D ? u_next[W_2D + x] * 0.95 : u_next[W_2D + x];
      u_next[(H_2D - 1) * W_2D + x] = absorbingBoundaries2D ? u_next[(H_2D - 2) * W_2D + x] * 0.95 : u_next[(H_2D - 2) * W_2D + x];
    }
    for (let y = 0; y < H_2D; y++) {
      u_next[y * W_2D] = absorbingBoundaries2D ? u_next[y * W_2D + 1] * 0.95 : u_next[y * W_2D + 1];
      u_next[y * W_2D + (W_2D - 1)] = absorbingBoundaries2D ? u_next[y * W_2D + (W_2D - 2)] * 0.95 : u_next[y * W_2D + (W_2D - 2)];
    }

    // Swap pointers
    let temp = u_prev;
    u_prev = u_curr;
    u_curr = u_next;
    u_next = temp;
  }

  // --- RENDERERS ---

  // Render 1D String (Transverse & Longitudinal)
  function render1D() {
    mainCtx.fillStyle = '#020308';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    // Draw high-tech background grid lines
    mainCtx.strokeStyle = 'rgba(0, 242, 254, 0.04)';
    mainCtx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < mainCanvas.width; x += gridSpacing) {
      mainCtx.beginPath();
      mainCtx.moveTo(x, 0);
      mainCtx.lineTo(x, mainCanvas.height);
      mainCtx.stroke();
    }
    for (let y = 0; y < mainCanvas.height; y += gridSpacing) {
      mainCtx.beginPath();
      mainCtx.moveTo(0, y);
      mainCtx.lineTo(mainCanvas.width, y);
      mainCtx.stroke();
    }

    const paddingX = 50;
    const drawWidth = mainCanvas.width - (paddingX * 2);
    const centerY = mainCanvas.height / 2;
    const dx = drawWidth / (N_1D - 1);

    if (mode === '1d-transverse') {
      // 1. Draw equilibrium center dashed line
      mainCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      mainCtx.setLineDash([5, 5]);
      mainCtx.beginPath();
      mainCtx.moveTo(paddingX, centerY);
      mainCtx.lineTo(paddingX + drawWidth, centerY);
      mainCtx.stroke();
      mainCtx.setLineDash([]);

      // 2. Draw string envelope (faint blue fill)
      if (isStandingWaveMode) {
        mainCtx.fillStyle = 'rgba(0, 242, 254, 0.04)';
        mainCtx.beginPath();
        mainCtx.moveTo(paddingX, centerY);
        for (let i = 0; i < N_1D; i++) {
          let x = paddingX + i * dx;
          let L = N_1D - 1;
          let env = amplitude * 50 * Math.sin((standingWaveN * Math.PI * i) / L);
          mainCtx.lineTo(x, centerY + env);
        }
        for (let i = N_1D - 1; i >= 0; i--) {
          let x = paddingX + i * dx;
          let L = N_1D - 1;
          let env = amplitude * 50 * Math.sin((standingWaveN * Math.PI * i) / L);
          mainCtx.lineTo(x, centerY - env);
        }
        mainCtx.closePath();
        mainCtx.fill();
      }

      // 3. Draw wave string line
      mainCtx.beginPath();
      mainCtx.strokeStyle = 'url(#cyan-glow-grad)'; // Fallback: neon cyan
      const grad = mainCtx.createLinearGradient(paddingX, 0, paddingX + drawWidth, 0);
      grad.addColorStop(0, '#39ff14'); // Driver start is green
      grad.addColorStop(0.2, '#00f2fe'); // Propagating cyan
      grad.addColorStop(1, boundary1D === 'fixed' ? '#fd008e' : '#0056ff');
      
      mainCtx.strokeStyle = grad;
      mainCtx.lineWidth = 3;
      mainCtx.lineCap = 'round';
      mainCtx.lineJoin = 'round';

      for (let i = 0; i < N_1D; i++) {
        let x = paddingX + i * dx;
        let y = centerY + y_curr[i] * 50; // Scaling factor
        if (i === 0) mainCtx.moveTo(x, y);
        else mainCtx.lineTo(x, y);
      }
      mainCtx.stroke();

      // 4. Draw string particles (nodes & antinodes highlights)
      for (let i = 0; i < N_1D; i += 2) {
        let x = paddingX + i * dx;
        let y = centerY + y_curr[i] * 50;

        mainCtx.beginPath();
        mainCtx.arc(x, y, 4, 0, 2 * Math.PI);
        mainCtx.fillStyle = (i === 0) ? '#39ff14' : 'rgba(0, 242, 254, 0.8)';
        mainCtx.fill();
      }

      // Highlight Standing Wave Nodes (N) & Antinodes (A)
      if (isStandingWaveMode) {
        let L = N_1D - 1;
        // Nodes
        for (let m = 0; m <= standingWaveN; m++) {
          let i = Math.round((L * m) / standingWaveN);
          let x = paddingX + i * dx;
          mainCtx.beginPath();
          mainCtx.arc(x, centerY, 8, 0, 2*Math.PI);
          mainCtx.fillStyle = '#fd008e';
          mainCtx.fill();
          mainCtx.fillStyle = '#ffffff';
          mainCtx.font = 'bold 9px Orbitron';
          mainCtx.textAlign = 'center';
          mainCtx.textBaseline = 'middle';
          mainCtx.fillText('N', x, centerY);
        }
        // Antinodes
        for (let m = 0; m < standingWaveN; m++) {
          let i = Math.round((L * (2 * m + 1)) / (2 * standingWaveN));
          let x = paddingX + i * dx;
          let y = centerY + y_curr[i] * 50;
          mainCtx.beginPath();
          mainCtx.arc(x, y, 9, 0, 2*Math.PI);
          mainCtx.fillStyle = '#ffd700';
          mainCtx.fill();
          mainCtx.fillStyle = '#000000';
          mainCtx.font = 'bold 9px Orbitron';
          mainCtx.textAlign = 'center';
          mainCtx.textBaseline = 'middle';
          mainCtx.fillText('A', x, y);
        }
      }

      // Draw boundaries labels
      mainCtx.font = '10px Orbitron';
      mainCtx.fillStyle = '#8a9fc4';
      mainCtx.textAlign = 'center';
      mainCtx.fillText('DRIVER (SOURCE)', paddingX, centerY - 70);
      
      let endLabel = 'OPEN BOUNDARY';
      if (boundary1D === 'fixed') endLabel = 'FIXED BOUNDARY (NODE)';
      if (boundary1D === 'free') endLabel = 'FREE BOUNDARY (LOOP)';
      if (isStandingWaveMode) endLabel = 'RESONANCE BOX BOUNDARY';
      mainCtx.fillText(endLabel, paddingX + drawWidth, centerY - 70);

    } else if (mode === '1d-longitudinal') {
      // Longitudinal simulation - Compression & Rarefaction
      const boxHeight = 80;
      const boxTop = centerY - boxHeight / 2;
      
      // Draw tube boundaries
      mainCtx.strokeStyle = 'rgba(255,255,255,0.15)';
      mainCtx.lineWidth = 2;
      mainCtx.strokeRect(paddingX, boxTop, drawWidth, boxHeight);

      // Draw gas pressure gradient underneath
      let densityImgData = mainCtx.createImageData(Math.floor(drawWidth), 15);
      for (let xPixel = 0; xPixel < drawWidth; xPixel++) {
        // Map xPixel to N_1D array index
        let iFloat = (xPixel / drawWidth) * (N_1D - 1);
        let idx0 = Math.floor(iFloat);
        let idx1 = Math.min(N_1D - 1, idx0 + 1);
        let alpha = iFloat - idx0;
        
        // Find local derivative (displacement gradient) as a proxy for density compression
        // Compression = -du/dx
        let disp0 = y_curr[idx0];
        let disp1 = y_curr[idx1];
        let strain = (disp1 - disp0) * 1.5; // derivative proxy
        
        let densityVal = -strain; // negative strain means compression
        densityVal = Math.max(-1, Math.min(1, densityVal * 2.0));
        
        let r = 3, g = 5, b = 13; // default background
        if (densityVal > 0) {
          // Compression: Fuchsia (high density)
          r = Math.floor(3 * (1 - densityVal) + 253 * densityVal);
          g = Math.floor(5 * (1 - densityVal) + 0 * densityVal);
          b = Math.floor(13 * (1 - densityVal) + 142 * densityVal);
        } else {
          // Rarefaction: Cyan (low density)
          let v = -densityVal;
          r = Math.floor(3 * (1 - v) + 0 * v);
          g = Math.floor(5 * (1 - v) + 242 * v);
          b = Math.floor(13 * (1 - v) + 254 * v);
        }

        for (let yPixel = 0; yPixel < 15; yPixel++) {
          let pixelIndex = (yPixel * Math.floor(drawWidth) + xPixel) * 4;
          densityImgData.data[pixelIndex] = r;
          densityImgData.data[pixelIndex + 1] = g;
          densityImgData.data[pixelIndex + 2] = b;
          densityImgData.data[pixelIndex + 3] = 255;
        }
      }

      // Put the density gradient below the chamber
      let tempCanvas = document.createElement('canvas');
      tempCanvas.width = drawWidth;
      tempCanvas.height = 15;
      tempCanvas.getContext('2d').putImageData(densityImgData, 0, 0);
      mainCtx.drawImage(tempCanvas, paddingX, boxTop + boxHeight + 10);
      
      mainCtx.font = '9px Orbitron';
      mainCtx.fillStyle = '#8a9fc4';
      mainCtx.textAlign = 'left';
      mainCtx.fillText('RAREFACTION (CYAN)', paddingX, boxTop + boxHeight + 40);
      mainCtx.textAlign = 'right';
      mainCtx.fillText('COMPRESSION (FUCHSIA)', paddingX + drawWidth, boxTop + boxHeight + 40);

      // Draw springs / vertical sheets at actual position
      mainCtx.strokeStyle = 'rgba(0, 242, 254, 0.45)';
      mainCtx.lineWidth = 1.5;
      for (let i = 0; i < N_1D; i++) {
        let eqX = paddingX + i * dx;
        // Displacement along x-direction
        let actX = eqX + y_curr[i] * 32; // scaling factor
        
        mainCtx.beginPath();
        mainCtx.moveTo(actX, boxTop);
        mainCtx.lineTo(actX, boxTop + boxHeight);
        mainCtx.stroke();
      }

      // Draw gas molecules (small spheres) distributed inside tube
      mainCtx.fillStyle = '#00f2fe';
      for (let i = 0; i < N_1D; i++) {
        let eqX = paddingX + i * dx;
        let actX = eqX + y_curr[i] * 32;
        
        // Draw 3 molecules at different heights in this column
        for (let h = 1; h <= 3; h++) {
          let yOffset = boxTop + (boxHeight / 4) * h;
          // Add small jitter for organic fluid look
          let jitterX = Math.sin(i * 12.3 + h * 4.5) * 2;
          mainCtx.beginPath();
          mainCtx.arc(actX + jitterX, yOffset, 3, 0, 2*Math.PI);
          mainCtx.fill();
        }
      }

      // Draw piston head (driver representation)
      let pistonX = paddingX + y_curr[0] * 32;
      mainCtx.fillStyle = '#39ff14';
      mainCtx.fillRect(pistonX - 8, boxTop - 4, 8, boxHeight + 8);
    }
  }

  // Render 2D Sandbox ripples using bilinear-filtered scaling
  function render2D() {
    // Write pixels directly into image data buffer
    const data = offscreenImgData.data;
    
    // Auto-adjust displacement visual brightness based on amplitude slider
    const brightness = 1.25 / amplitude; 

    for (let i = 0; i < W_2D * H_2D; i++) {
      let isObstacle = obstacles[i];
      let r = 0, g = 0, b = 0;

      if (isObstacle) {
        // Metallic grey wall
        r = 50; g = 55; b = 68;
      } else {
        let u = u_curr[i];
        let val = u * brightness;
        val = Math.max(-1, Math.min(1, val));

        if (val > 0) {
          // Positive Wave: Cyan/Blue gradient
          r = Math.floor(3 * (1 - val) + 0 * val);
          g = Math.floor(5 * (1 - val) + 242 * val);
          b = Math.floor(13 * (1 - val) + 254 * val);
        } else {
          // Negative Wave: Fuchsia/Pink gradient
          let absVal = -val;
          r = Math.floor(3 * (1 - absVal) + 253 * absVal);
          g = Math.floor(5 * (1 - absVal) + 0 * absVal);
          b = Math.floor(13 * (1 - absVal) + 142 * absVal);
        }
      }

      let idx = i * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }

    // Write image data onto offscreen canvas
    offscreenCtx.putImageData(offscreenImgData, 0, 0);

    // Draw offscreen canvas stretched onto main canvas (enables browser bilinear filtering)
    mainCtx.fillStyle = '#020308';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    
    mainCtx.imageSmoothingEnabled = true;
    mainCtx.drawImage(offscreenCanvas, 0, 0, mainCanvas.width, mainCanvas.height);

    // Highlight wave source positions
    sources.forEach(src => {
      let canvX = (src.x / W_2D) * mainCanvas.width;
      let canvY = (src.y / H_2D) * mainCanvas.height;

      // Pulse ring animation around sources
      let glowR = 8 + 4 * Math.sin(time * 5);
      mainCtx.beginPath();
      mainCtx.arc(canvX, canvY, glowR, 0, 2*Math.PI);
      mainCtx.strokeStyle = 'rgba(57, 255, 20, 0.4)';
      mainCtx.lineWidth = 1.5;
      mainCtx.stroke();

      mainCtx.beginPath();
      mainCtx.arc(canvX, canvY, 3, 0, 2*Math.PI);
      mainCtx.fillStyle = '#39ff14';
      mainCtx.fill();
    });

    // Draw active telemetry probe cursor crosshair
    let probeCanvX = (probeX / W_2D) * mainCanvas.width;
    let probeCanvY = (probeY / H_2D) * mainCanvas.height;
    
    mainCtx.strokeStyle = '#00f2fe';
    mainCtx.lineWidth = 1;
    
    // Draw target sight
    mainCtx.beginPath();
    mainCtx.moveTo(probeCanvX - 12, probeCanvY);
    mainCtx.lineTo(probeCanvX + 12, probeCanvY);
    mainCtx.moveTo(probeCanvX, probeCanvY - 12);
    mainCtx.lineTo(probeCanvX, probeCanvY + 12);
    mainCtx.stroke();
    
    mainCtx.beginPath();
    mainCtx.arc(probeCanvX, probeCanvY, 5, 0, 2*Math.PI);
    mainCtx.stroke();
  }

  // Draw telemetry logs on right canvas
  function renderOscilloscope() {
    oscCtx.fillStyle = '#02040a';
    oscCtx.fillRect(0, 0, oscCanvas.width, oscCanvas.height);

    // Draw screen grid
    oscCtx.strokeStyle = '#08121d';
    oscCtx.lineWidth = 0.5;
    for (let x = 0; x < oscCanvas.width; x += 30) {
      oscCtx.beginPath();
      oscCtx.moveTo(x, 0);
      oscCtx.lineTo(x, oscCanvas.height);
      oscCtx.stroke();
    }
    for (let y = 0; y < oscCanvas.height; y += 20) {
      oscCtx.beginPath();
      oscCtx.moveTo(0, y);
      oscCtx.lineTo(oscCanvas.width, y);
      oscCtx.stroke();
    }

    // Draw zero amplitude center line
    const zeroY = oscCanvas.height / 2;
    oscCtx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
    oscCtx.lineWidth = 1;
    oscCtx.beginPath();
    oscCtx.moveTo(0, zeroY);
    oscCtx.lineTo(oscCanvas.width, zeroY);
    oscCtx.stroke();

    // Plot trace history
    oscCtx.beginPath();
    oscCtx.strokeStyle = '#39ff14'; // Matrix neon green trace line
    oscCtx.shadowColor = '#39ff14';
    oscCtx.shadowBlur = 3;
    oscCtx.lineWidth = 1.8;

    const scaleY = 32; // Scaling multiplier
    let length = probeHistory.length;

    for (let idx = 0; idx < length; idx++) {
      // Read values in rolling circular order
      let historyValIndex = (probeHistoryIdx + idx) % length;
      let val = probeHistory[historyValIndex];
      
      let x = (idx / (length - 1)) * oscCanvas.width;
      let y = zeroY - val * scaleY;
      
      // Clamp inside scope box
      y = Math.max(2, Math.min(oscCanvas.height - 2, y));

      if (idx === 0) oscCtx.moveTo(x, y);
      else oscCtx.lineTo(x, y);
    }
    oscCtx.stroke();
    oscCtx.shadowBlur = 0; // Reset canvas filter
  }

  // --- TELEMETRY READINGS ---
  function updateTelemetryData() {
    let activeVal = 0.0;
    if (mode === '2d-ripple') {
      let idx = probeY * W_2D + probeX;
      activeVal = u_curr[idx];
      document.getElementById('oscilloscope-coords').textContent = `PROBE X:${probeX} Y:${probeY}`;
    } else {
      // 1D Mode: inspect center particle of the string
      let i = Math.floor(N_1D / 2);
      activeVal = y_curr[i];
      document.getElementById('oscilloscope-coords').textContent = `PROBE: STRING CENTER`;
    }

    // Push into circular buffer
    probeHistory[probeHistoryIdx] = activeVal;
    probeHistoryIdx = (probeHistoryIdx + 1) % probeHistory.length;

    // Update displacement HUD value label
    document.getElementById('lbl-probe-amp').textContent = activeVal.toFixed(3);
    
    // Simple frequency detection: count zero crossings
    if (frameCount % 30 === 0) {
      let crossings = 0;
      let prevVal = probeHistory[0];
      for (let k = 1; k < probeHistory.length; k++) {
        let currVal = probeHistory[k];
        if ((prevVal >= 0 && currVal < 0) || (prevVal < 0 && currVal >= 0)) {
          crossings++;
        }
        prevVal = currVal;
      }
      // Since it crosses zero twice per cycle: cycles = crossings / 2
      // Scope holds 300 samples. Frame runs at ~60fps, so 300 samples is ~5 seconds of history.
      let estFreq = (crossings / 2) / 5.0;
      
      if (estFreq > 0.05 && activeVal !== 0) {
        document.getElementById('lbl-probe-freq').textContent = `${estFreq.toFixed(1)} Hz`;
      } else {
        document.getElementById('lbl-probe-freq').textContent = `0.0 Hz`;
      }
    }
  }

  // --- INTERACTION HANDLERS ---

  function getGridCoordinates(e) {
    const rect = mainCanvas.getBoundingClientRect();
    const canvX = e.clientX - rect.left;
    const canvY = e.clientY - rect.top;
    
    // Map to W_2D x H_2D grid
    const x = Math.floor((canvX / rect.width) * W_2D);
    const y = Math.floor((canvY / rect.height) * H_2D);
    
    return {
      gridX: Math.max(0, Math.min(W_2D - 1, x)),
      gridY: Math.max(0, Math.min(H_2D - 1, y)),
      canvX,
      canvY
    };
  }

  function handleInteraction(gridX, gridY, e) {
    if (mode === '2d-ripple') {
      if (brushType === 'source') {
        // Limit sources to prevent lag (max 10)
        if (sources.length >= 10) {
          log('Maximum 2D oscillator limit (10) reached.', 'warn');
          return;
        }
        // Check if source exists nearby
        let duplicate = sources.some(s => Math.abs(s.x - gridX) < 2 && Math.abs(s.y - gridY) < 2);
        if (!duplicate) {
          sources.push({
            x: gridX,
            y: gridY,
            frequency: frequency,
            amplitude: amplitude,
            phase: 0,
            mode: 'sine'
          });
          log(`Planted continuous oscillator at (${gridX}, ${gridY}).`, 'phys');
        }
      } else if (brushType === 'wall') {
        // Draw obstacle barrier circular region
        drawObstacleCircle(gridX, gridY, brushSize, 1);
      } else if (brushType === 'erase') {
        // Erase walls and sources
        drawObstacleCircle(gridX, gridY, brushSize, 0);
        sources = sources.filter(s => {
          let dist = Math.sqrt((s.x - gridX)**2 + (s.y - gridY)**2);
          return dist > brushSize;
        });
      } else if (brushType === 'inspect') {
        probeX = gridX;
        probeY = gridY;
      }
    } else {
      // 1D Pluck action: mouse displacement influence
      // Map click relative height
      const rect = mainCanvas.getBoundingClientRect();
      const centerY = rect.height / 2;
      const clickedY = e.clientY - rect.top;
      const deltaY = (centerY - clickedY) / 50; // Normalize amplitude displacement
      
      const paddingX = 50;
      const drawWidth = rect.width - (paddingX * 2);
      const clickedGridX = Math.floor(((e.clientX - rect.left - paddingX) / drawWidth) * N_1D);

      if (clickedGridX >= 0 && clickedGridX < N_1D) {
        y_curr[clickedGridX] = deltaY;
        y_prev[clickedGridX] = deltaY;
        log(`Plucked 1D string at particle ${clickedGridX} with displacement ${deltaY.toFixed(2)}.`, 'phys');
      }
    }
  }

  function drawObstacleCircle(cx, cy, radius, value) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx*dx + dy*dy <= radius*radius) {
          let px = cx + dx;
          let py = cy + dy;
          if (px >= 1 && px < W_2D - 1 && py >= 1 && py < H_2D - 1) {
            obstacles[py * W_2D + px] = value;
            if (value === 1) {
              // Flatten waves inside wall
              u_curr[py * W_2D + px] = 0;
              u_prev[py * W_2D + px] = 0;
            }
          }
        }
      }
    }
  }

  // --- PRESETS IMPLEMENTATIONS ---

  function applyPreset(presetName) {
    // Stop standing wave analytical mode first
    isStandingWaveMode = false;
    isStandingWaveMode = false;
    
    // De-activate current presets list highlight
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    
    const clickedBtn = document.querySelector(`.preset-btn[data-preset="${presetName}"]`);
    if (clickedBtn) clickedBtn.classList.add('active');

    log(`Initializing configuration: "${presetName.toUpperCase()}"`, 'preset');

    if (presetName.startsWith('1d-')) {
      // Set to 1D mode first
      if (presetName.includes('harmonic')) {
        let n = parseInt(presetName.split('-')[2]);
        setMode('1d-transverse');
        isStandingWaveMode = true;
        standingWaveN = n;
        time = 0;
        
        // Show boundary settings fixed
        document.getElementById('select-1d-boundary').value = 'fixed';
        boundary1D = 'fixed';
        
        log(`Activated standing wave envelope harmonic resonance n=${n}. Fixed boundary strings applied.`, 'phys');
      } else if (presetName === '1d-pulse') {
        setMode('1d-transverse');
        reset1DSim();
        boundary1D = 'fixed';
        document.getElementById('select-1d-boundary').value = 'fixed';
        
        // Launch a single pulse on the left side
        // Create Gaussian pulse
        for (let i = 0; i < 20; i++) {
          let factor = (i - 10) / 4;
          let val = amplitude * Math.exp(-factor * factor);
          y_curr[i] = val;
          y_prev[i] = val;
        }
        log('Launched single Gaussian displacement pulse moving right. Fixed reflective boundary applied.', 'phys');
      }
    } else {
      // 2D Presets
      setMode('2d-ripple');
      clearAll();

      if (presetName === '2d-double-slit') {
        // Vertical barrier in middle
        const barrierX = 35;
        // Two slits centered
        const slitWidth = 2;
        const slitSeparation = 12;
        const slit1 = 50 - Math.round(slitSeparation / 2);
        const slit2 = 50 + Math.round(slitSeparation / 2);

        for (let y = 0; y < H_2D; y++) {
          let isSlit = (y >= slit1 - slitWidth && y <= slit1 + slitWidth) ||
                       (y >= slit2 - slitWidth && y <= slit2 + slitWidth);
          if (!isSlit) {
            obstacles[y * W_2D + barrierX] = 1;
          }
        }

        // Plane wave driver: Drive column on left
        frequency = 1.6;
        amplitude = 1.3;
        updateUIValues();

        // Push continuous line oscillator logic into sources:
        // Instead of 100 source objects, we can drive the column programmatically inside the physics solver.
        // We add a single dummy source and flag that a plane wave is active.
        sources.push({
          x: 4,
          y: 50,
          frequency: frequency,
          amplitude: amplitude,
          phase: 0,
          mode: 'sine'
        });
        
        // We will drive the plane wave column inside the update loop:
        // Set state to drive column
        isPlaneWaveActive = true;
        planeWaveCol = 4;

        log("Young's double slit interference setup. Plane wave generated from left. Fringes diffract through apertures.", 'phys');

      } else if (presetName === '2d-single-slit') {
        const barrierX = 35;
        const slitWidth = 4; // width of 8px total

        for (let y = 0; y < H_2D; y++) {
          let isSlit = (y >= 50 - slitWidth && y <= 50 + slitWidth);
          if (!isSlit) {
            obstacles[y * W_2D + barrierX] = 1;
          }
        }

        frequency = 1.5;
        amplitude = 1.3;
        updateUIValues();

        sources.push({
          x: 4,
          y: 50,
          frequency: frequency,
          amplitude: amplitude,
          phase: 0,
          mode: 'sine'
        });
        isPlaneWaveActive = true;
        planeWaveCol = 4;
        
        log("Single slit diffraction. Note wave front bending into circular ripples beyond the aperture.", 'phys');

      } else if (presetName === '2d-parabolic') {
        // Draw parabolic reflector
        // Equation: x = h + k * (y - y0)^2
        const h = 82; // vertex x
        const y0 = 50; // vertex y
        const k = 0.055; // curvature

        for (let y = 4; y < H_2D - 4; y++) {
          let x = Math.round(h - k * (y - y0)**2);
          if (x >= 0 && x < W_2D) {
            // Fill mirror wall solid to the right of it
            for (let fillX = x; fillX < W_2D; fillX++) {
              obstacles[y * W_2D + fillX] = 1;
            }
          }
        }

        frequency = 1.4;
        amplitude = 1.4;
        updateUIValues();

        // Plane wave driven from left
        sources.push({
          x: 6,
          y: 50,
          frequency: frequency,
          amplitude: amplitude,
          phase: 0,
          mode: 'sine'
        });
        isPlaneWaveActive = true;
        planeWaveCol = 6;
        
        log("Parabolic Mirror Focus loaded. Incident plane waves reflect off parabola, converging constructively at the focal point.", 'phys');

      } else if (presetName === '2d-corner-reflector') {
        // Draw diagonal barriers forming 90 deg corner
        // Wall 1: y = x - 25, Wall 2: y = 125 - x (meeting at 75,50)
        for (let x = 60; x < W_2D; x++) {
          let dy = x - 60;
          let y1 = 50 + dy;
          let y2 = 50 - dy;
          if (y1 < H_2D - 2) obstacles[y1 * W_2D + x] = 1;
          if (y2 >= 2) obstacles[y2 * W_2D + x] = 1;
          // Fill right side
          for (let fy = Math.max(0, y2); fy <= Math.min(H_2D - 1, y1); fy++) {
            obstacles[fy * W_2D + x] = 1;
          }
        }

        // Set telemetry probe near the focus to watch bounce
        probeX = 30;
        probeY = 50;

        // Launch single pulse ripple
        sources.push({
          x: 25,
          y: 50,
          frequency: 1.5,
          amplitude: 2.0,
          phase: 0,
          mode: 'pulse',
          startTime: 0,
          pulseDone: false
        });
        
        log("90-degree corner reflector. Single circular pulse wave launched. It reflects back to source.", 'phys');

      } else if (presetName === '2d-standing-box') {
        // Surround boundaries with reflective wall barrier cells
        for (let x = 0; x < W_2D; x++) {
          obstacles[0 * W_2D + x] = 1;
          obstacles[(H_2D - 1) * W_2D + x] = 1;
        }
        for (let y = 0; y < H_2D; y++) {
          obstacles[y * W_2D + 0] = 1;
          obstacles[y * W_2D + (W_2D - 1)] = 1;
        }

        // Place central continuous driver
        frequency = 1.8;
        amplitude = 1.4;
        updateUIValues();

        sources.push({
          x: 50,
          y: 50,
          frequency: frequency,
          amplitude: amplitude,
          phase: 0,
          mode: 'sine'
        });
        
        log("Closed Resonator Box loaded. Boundary is 100% reflective. Watch standing nodes form from reflection harmonics.", 'phys');

      } else if (presetName === '2d-pulse-ripple') {
        sources.push({
          x: 50,
          y: 50,
          frequency: 1.2,
          amplitude: 2.2,
          phase: 0,
          mode: 'pulse',
          startTime: 0,
          pulseDone: false
        });
        log("Single impulse circular ripple triggered at the center of sandbox.", 'phys');
      }
    }
  }

  // State flag for plane wave columns
  let isPlaneWaveActive = false;
  let planeWaveCol = 5;

  function drivePlaneWave() {
    if (!isPlaneWaveActive || mode !== '2d-ripple') return;
    for (let y = 1; y < H_2D - 1; y++) {
      let idx = y * W_2D + planeWaveCol;
      if (!obstacles[idx]) {
        u_curr[idx] = amplitude * Math.sin(2 * Math.PI * frequency * time);
      }
    }
  }

  // --- UI CONTROLS MECHANICS ---

  function setMode(newMode) {
    mode = newMode;
    
    // Toggle active classes on buttons
    document.getElementById('btn-mode-1d-transverse').classList.remove('active');
    document.getElementById('btn-mode-1d-longitudinal').classList.remove('active');
    document.getElementById('btn-mode-2d-ripple').classList.remove('active');
    
    if (mode === '1d-transverse') {
      document.getElementById('btn-mode-1d-transverse').classList.add('active');
      document.getElementById('section-1d-options').classList.remove('hidden');
      document.getElementById('section-2d-options').classList.add('hidden');
      
      document.getElementById('presets-1d').classList.remove('hidden');
      document.getElementById('presets-2d').classList.add('hidden');
      
      document.getElementById('guide-text').innerHTML = "<b>1D Transverse Mode:</b> Drag/click on the canvas to pluck the green string. Observe fixed/free/absorbing reflections at the boundary post.";
      isPlaneWaveActive = false;
      reset1DSim();
    } else if (mode === '1d-longitudinal') {
      document.getElementById('btn-mode-1d-longitudinal').classList.add('active');
      document.getElementById('section-1d-options').classList.remove('hidden');
      document.getElementById('section-2d-options').classList.add('hidden');
      
      document.getElementById('presets-1d').classList.remove('hidden');
      document.getElementById('presets-2d').classList.add('hidden');
      
      document.getElementById('guide-text').innerHTML = "<b>1D Longitudinal Mode:</b> Spring gas molecules compress and expand. Fuchsia highlights show compression regions; cyan shows rarefactions.";
      isPlaneWaveActive = false;
      reset1DSim();
    } else if (mode === '2d-ripple') {
      document.getElementById('btn-mode-2d-ripple').classList.add('active');
      document.getElementById('section-1d-options').classList.add('hidden');
      document.getElementById('section-2d-options').classList.remove('hidden');
      
      document.getElementById('presets-1d').classList.add('hidden');
      document.getElementById('presets-2d').classList.remove('hidden');
      
      document.getElementById('guide-text').innerHTML = "<b>2D Sandbox:</b> Click or draw on the grid. Select <b>Add Wave Source</b> to place harmonic oscillators, or <b>Draw Wall Barrier</b> to create slits and obstacles.";
      reset2DSim();
    }

    log(`Switched to simulation architecture: ${mode.toUpperCase()}`, 'phys');
  }

  function updateUIValues() {
    document.getElementById('slider-wave-speed').value = waveSpeed;
    document.getElementById('val-wave-speed').textContent = waveSpeed.toFixed(2);
    
    document.getElementById('slider-frequency').value = frequency;
    document.getElementById('val-frequency').textContent = `${frequency.toFixed(2)} Hz`;
    
    document.getElementById('slider-amplitude').value = amplitude;
    document.getElementById('val-amplitude').textContent = amplitude.toFixed(2);
    
    document.getElementById('slider-damping').value = damping;
    document.getElementById('val-damping').textContent = damping.toFixed(4);
    
    // Recalculate stability index HUD display
    let dt = timeStep;
    let dx = 1;
    let stabilityIndex2D = (waveSpeed * dt / dx) * (waveSpeed * dt / dx) * 2; // For 2D grid stability index
    let maxStability = (mode === '2d-ripple') ? stabilityIndex2D : (waveSpeed * dt) ** 2;
    document.getElementById('hud-stability').textContent = maxStability.toFixed(3);
  }

  function registerEventListeners() {
    // Mode Toggles
    document.getElementById('btn-mode-1d-transverse').addEventListener('click', () => setMode('1d-transverse'));
    document.getElementById('btn-mode-1d-longitudinal').addEventListener('click', () => setMode('1d-longitudinal'));
    document.getElementById('btn-mode-2d-ripple').addEventListener('click', () => setMode('2d-ripple'));

    // Parameter Sliders
    document.getElementById('slider-wave-speed').addEventListener('input', (e) => {
      waveSpeed = parseFloat(e.target.value);
      updateUIValues();
    });
    
    document.getElementById('slider-frequency').addEventListener('input', (e) => {
      frequency = parseFloat(e.target.value);
      updateUIValues();
      // Update existing sources frequencies
      sources.forEach(s => s.frequency = frequency);
    });

    document.getElementById('slider-amplitude').addEventListener('input', (e) => {
      amplitude = parseFloat(e.target.value);
      updateUIValues();
      // Update existing sources amplitudes
      sources.forEach(s => s.amplitude = amplitude);
    });

    document.getElementById('slider-damping').addEventListener('input', (e) => {
      damping = parseFloat(e.target.value);
      updateUIValues();
      initDampingGrid();
    });

    // Reset Parameters button
    document.getElementById('btn-reset-params').addEventListener('click', () => {
      waveSpeed = 1.0;
      frequency = 1.5;
      amplitude = 1.2;
      damping = 0.005;
      updateUIValues();
      initDampingGrid();
      log('Reset physics variables to standard values.', 'sys');
    });

    // 1D Boundary selector
    document.getElementById('select-1d-boundary').addEventListener('change', (e) => {
      boundary1D = e.target.value;
      log(`Applied 1D Boundary condition: ${boundary1D.toUpperCase()}`, 'phys');
    });

    // 2D Absorbing Boundaries checkbox
    document.getElementById('chk-absorbing-boundaries').addEventListener('change', (e) => {
      absorbingBoundaries2D = e.target.checked;
      initDampingGrid();
      log(`Absorbing boundary zone ${absorbingBoundaries2D ? 'ENGAGED' : 'DISENGAGED'}.`, 'sys');
    });

    // Brush Tools
    document.querySelectorAll('.brush-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
        let target = e.currentTarget;
        target.classList.add('active');
        brushType = target.getAttribute('data-brush');
        log(`Equipped tool: ${brushType.toUpperCase()}`, 'sys');
      });
    });

    // Brush Radius Slider
    document.getElementById('slider-brush-size').addEventListener('input', (e) => {
      brushSize = parseInt(e.target.value);
      document.getElementById('val-brush-size').textContent = `${brushSize} px`;
    });

    // Timeline playback buttons
    document.getElementById('btn-play-pause').addEventListener('click', () => {
      isPlaying = !isPlaying;
      let badge = document.getElementById('sim-status-badge');
      let playIcon = document.getElementById('play-icon');
      let playText = document.getElementById('play-text');

      if (isPlaying) {
        badge.className = "status-badge live";
        badge.textContent = "LIVE";
        playIcon.textContent = "⏸️";
        playText.textContent = "Pause";
        log('Simulation engine running.', 'sys');
      } else {
        badge.className = "status-badge paused";
        badge.textContent = "PAUSED";
        playIcon.textContent = "▶️";
        playText.textContent = "Play";
        log('Simulation engine paused.', 'sys');
      }
    });

    document.getElementById('btn-step').addEventListener('click', () => {
      if (isPlaying) {
        isPlaying = false;
        document.getElementById('sim-status-badge').className = "status-badge paused";
        document.getElementById('sim-status-badge').textContent = "PAUSED";
        document.getElementById('play-icon').textContent = "▶️";
        document.getElementById('play-text').textContent = "Play";
      }
      
      // Simulate exactly one step forward
      isPlaying = true;
      if (mode === '2d-ripple') {
        drivePlaneWave();
        update2D();
      } else {
        update1D();
      }
      isPlaying = false;
      log('Simulated one timestep frame.', 'sys');
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      clearAll();
    });

    // Time Warp multipliers
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        speedMultiplier = parseFloat(e.target.getAttribute('data-speed'));
        log(`Time warp adjusted to ${speedMultiplier}x`, 'sys');
      });
    });

    // Presets Click Handles
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        let presetKey = e.target.getAttribute('data-preset');
        applyPreset(presetKey);
      });
    });

    // Clear logs button
    document.getElementById('btn-clear-logs').addEventListener('click', () => {
      consoleEl.innerHTML = '';
      log('Observatory logs console cleared.', 'sys');
    });

    // --- CANVAS MOUSE BINDINGS ---
    mainCanvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const coords = getGridCoordinates(e);
      handleInteraction(coords.gridX, coords.gridY, e);
    });

    mainCanvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const coords = getGridCoordinates(e);
      handleInteraction(coords.gridX, coords.gridY, e);
    });

    window.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    // Touch support for tablets/mobile screens
    mainCanvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDrawing = true;
        const rect = mainCanvas.getBoundingClientRect();
        const touch = e.touches[0];
        const canvX = touch.clientX - rect.left;
        const canvY = touch.clientY - rect.top;
        const x = Math.floor((canvX / rect.width) * W_2D);
        const y = Math.floor((canvY / rect.height) * H_2D);
        
        handleInteraction(
          Math.max(0, Math.min(W_2D - 1, x)),
          Math.max(0, Math.min(H_2D - 1, y)),
          touch
        );
      }
    });

    mainCanvas.addEventListener('touchmove', (e) => {
      if (isDrawing && e.touches.length === 1) {
        const rect = mainCanvas.getBoundingClientRect();
        const touch = e.touches[0];
        const canvX = touch.clientX - rect.left;
        const canvY = touch.clientY - rect.top;
        const x = Math.floor((canvX / rect.width) * W_2D);
        const y = Math.floor((canvY / rect.height) * H_2D);
        
        handleInteraction(
          Math.max(0, Math.min(W_2D - 1, x)),
          Math.max(0, Math.min(H_2D - 1, y)),
          touch
        );
      }
      e.preventDefault(); // Prevent standard scroll
    });

    mainCanvas.addEventListener('touchend', () => {
      isDrawing = false;
    });
  }

  // --- ANIMATION LOOP ---
  function loop(now) {
    requestAnimationFrame(loop);

    // Solve physics step
    if (mode === '2d-ripple') {
      // For smooth movement in 2D, we can run multiple sub-steps per frame if requested
      drivePlaneWave();
      update2D();
      render2D();
    } else {
      update1D();
      render1D();
    }

    // Oscilloscope updater
    updateTelemetryData();
    renderOscilloscope();

    // FPS Counter
    frameCount++;
    if (now - lastFpsUpdate >= 1000) {
      fps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
      document.getElementById('hud-fps').textContent = fps;
      document.getElementById('hud-sources').textContent = mode === '2d-ripple' ? sources.length + (isPlaneWaveActive ? 1 : 0) : 1;
      frameCount = 0;
      lastFpsUpdate = now;
    }
  }

  // --- START PROGRAM ---
  registerEventListeners();
  initDampingGrid();
  updateUIValues();
  
  // Set initial mode Transverse
  setMode('1d-transverse');

  // Trigger main animation loop
  requestAnimationFrame(loop);

})();
