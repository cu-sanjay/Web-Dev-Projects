/**
 * Planetary Motion Simulator & Keplerian Sandbox
 * Core Physics Engine & Visualizer
 */

// Gravity parameter in scaled units:
// Distance in Astronomical Units (AU), Time in Years
// Under these units, G * M_sun = 4 * PI^2
const MU_SUN = 4 * Math.PI * Math.PI;

// Simulator states
let planets = [];
let selectedPlanetName = 'Sun'; // Name of planet to track (Sun = center)
let isPaused = false;
let timeWarp = 100;            // Speed multiplier
let keplerMode = 'none';      // 'none' | 'law1' | 'law2' | 'law3'

// Viewport Zoom & Pan
let zoomScale = 120;          // Pixels per AU (Default: 1 AU is 120px)
const zoomMin = 12;           // Zoomed out to outer solar system
const zoomMax = 600;          // Zoomed in to inner planets
let panX = 0;
let panY = 0;
let isPanning = false;
let startPanX = 0, startPanY = 0;

// Vector overlays options
let showVelocityVector = true;
let showGravityVector = true;
let showLabels = true;
let showApsides = false;
let activeColor = '#38bdf8';   // Active color swatch

// DOM Elements
let numSemimajor, rangeSemimajor;
let numEccentricity, rangeEccentricity;
let numArgument, rangeArgument;
let btnDeploy, btnClearTrails, btnRemoveCustom;
let selectKeplerMode, keplerHelperText;
let selectWarp, btnPausePlay, btnReset;
let planetCountBadge, targetNameBadge, keplerModeBadge;
let consoleLogs;

// Telemetry Dossier Panel
let telName, telDist, telSpeed, telEcc, telAxis, telPeri, telApo, telPeriod;

// Custom Logging Utility
function logToConsole(message, type = 'info') {
  if (!consoleLogs) return;
  const line = document.createElement('div');
  line.className = `log-line text-${type}`;
  line.innerHTML = `&gt; ${message}`;
  consoleLogs.appendChild(line);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
  while (consoleLogs.childNodes.length > 40) {
    consoleLogs.removeChild(consoleLogs.firstChild);
  }
}

// 2D Vector operations
const Vector = {
  magnitude: (v) => Math.hypot(v.x, v.y),
  normalize: (v) => {
    const m = Math.hypot(v.x, v.y);
    return m > 0 ? { x: v.x / m, y: v.y / m } : { x: 0, y: 0 };
  }
};

/**
 * Solves Kepler's Equation M = E - e*sin(E) for Eccentric Anomaly E
 */
function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 5; i++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

/**
 * Calculates planetary coordinates, velocity, and orbital period
 */
function updatePlanetKinematics(planet, dt) {
  // 1. Advance Mean Anomaly M = M0 + n * dt
  // Mean motion n = 2 * PI / Period
  const n = (2 * Math.PI) / planet.period;
  if (!isPaused) {
    planet.meanAnomaly += n * dt;
    if (planet.meanAnomaly > 2 * Math.PI) {
      planet.meanAnomaly -= 2 * Math.PI;
    }
  }

  const M = planet.meanAnomaly;
  const e = planet.ecc;
  const a = planet.a;
  const w = (planet.argument * Math.PI) / 180; // lines of apsides argument

  // 2. Solve Kepler
  const E = solveKepler(M, e);

  // 3. Position in local orbit coordinates (Focus at Sun center)
  const xLocal = a * (Math.cos(E) - e);
  const yLocal = a * Math.sqrt(1.0 - e * e) * Math.sin(E);

  // Rotate by Line of Apsides tilt w
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  planet.x = xLocal * cosW - yLocal * sinW;
  planet.y = xLocal * sinW + yLocal * cosW;

  // 4. Velocity vector (differentiate orbit positions relative to time)
  const r = a * (1.0 - e * Math.cos(E));
  const vxLocal = -(a * a * n * Math.sin(E)) / r;
  const vyLocal = (a * a * n * Math.sqrt(1.0 - e * e) * Math.cos(E)) / r;

  planet.vx = vxLocal * cosW - vyLocal * sinW;
  planet.vy = vxLocal * sinW + vyLocal * cosW;

  // Record historical trail
  planet.trail.push({ x: planet.x, y: planet.y });
  if (planet.trail.length > planet.maxTrailLen) planet.trail.shift();

  // Highlight sweeps for Kepler's 2nd Law
  if (keplerMode === 'law2') {
    planet.sweepTimer += dt;
    const sweepInterval = planet.period / 12; // 12 wedges per period
    
    if (!planet.lastSweepPos) {
      planet.lastSweepPos = { x: planet.x, y: planet.y };
    }

    if (planet.sweepTimer >= sweepInterval) {
      planet.sweeps.push({
        p1: { x: planet.lastSweepPos.x, y: planet.lastSweepPos.y },
        p2: { x: planet.x, y: planet.y }
      });

      if (planet.sweeps.length > 12) planet.sweeps.shift();

      planet.lastSweepPos = { x: planet.x, y: planet.y };
      planet.sweepTimer = 0;
    }
  } else {
    planet.sweeps = [];
    planet.lastSweepPos = null;
    planet.sweepTimer = 0;
  }
}

/**
 * Instantiates and deploys a planet
 */
function createPlanet(name, a, e, arg, color, isCustom = false) {
  // Period T = a^1.5 (Years) in Keplerian units
  const period = Math.pow(a, 1.5);
  
  const planet = {
    name: name,
    a: a,
    ecc: e,
    argument: arg,
    color: color,
    period: period,
    meanAnomaly: Math.random() * 2 * Math.PI, // random starting positions
    trail: [],
    maxTrailLen: 1200,
    x: 0, y: 0, vx: 0, vy: 0,
    isCustom: isCustom,
    // Kepler 2nd Law sweeps
    sweeps: [],
    lastSweepPos: null,
    sweepTimer: 0
  };
  
  planets.push(planet);
  selectedPlanetName = planet.name;
  logToConsole(`Deployed planet ${planet.name} at orbital radius ${planet.a.toFixed(2)} AU.`, 'success');
  updateHUDValues();
  saveStateToLocalStorage();
}

/**
 * Loads default planetary presets
 */
function loadPresetSolarSystem() {
  planets = [];
  selectedPlanetName = 'Sun';
  zoomScale = 120;
  panX = 0; panY = 0;
  
  // Real Solar System (visual distances compressed for screen sizing)
  createPlanet('Mercury', 0.45, 0.206, 29, '#94a3b8');
  createPlanet('Venus', 0.8, 0.007, 76, '#f97316');
  createPlanet('Earth', 1.2, 0.017, 102, '#38bdf8');
  createPlanet('Mars', 1.8, 0.093, 286, '#f87171');
  createPlanet('Jupiter', 3.2, 0.048, 273, '#d946ef');
  createPlanet('Saturn', 4.5, 0.054, 339, '#ffcc00');
  
  logToConsole('Preset Loaded: Real Solar System (compressed scales).', 'info');
}

function loadPresetSystem(type) {
  planets = [];
  selectedPlanetName = 'Sun';
  
  if (type === 'solar') {
    loadPresetSolarSystem();
  } else if (type === 'eccentric') {
    zoomScale = 120;
    createPlanet('Inner Comet', 0.8, 0.45, 30, '#38bdf8');
    createPlanet('Mid Planet', 1.6, 0.25, 120, '#10b981');
    createPlanet('Outer Oval', 3.0, 0.35, 270, '#ffcc00');
    logToConsole('Preset Loaded: Highly eccentric planetary paths.', 'warning');
  } else if (type === 'comet') {
    zoomScale = 85;
    loadPresetSolarSystem();
    // Halley Comet path (extreme eccentricity e=0.967, but clamped to 0.7 for canvas bounds)
    createPlanet('Comet Halley', 2.6, 0.65, 110, '#ffffff');
    logToConsole('Preset Loaded: Comet Halley crossing inner planet orbits.', 'warning');
  } else if (type === 'conjunction') {
    zoomScale = 160;
    createPlanet('Planet Alpha', 1.2, 0.02, 0, '#38bdf8');
    createPlanet('Planet Beta', 1.26, 0.05, 180, '#ff007f');
    logToConsole('Preset Loaded: Twin planets on overlapping tracks (conjunction test).', 'info');
  }
}

/**
 * Interactive canvas drawings Sun and Planet orbits
 */
function drawScene() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  
  // Space canvas BG
  ctx.fillStyle = '#020205';
  ctx.fillRect(0, 0, w, h);
  
  // Camera Lock tracking offset
  let targetX = 0, targetY = 0;
  if (selectedPlanetName !== 'Sun') {
    const lockedPlanet = planets.find(p => p.name === selectedPlanetName);
    if (lockedPlanet) {
      targetX = lockedPlanet.x;
      targetY = lockedPlanet.y;
    }
  }

  // Draw coordinate grids
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  
  const stepAu = 1.0;
  const cx = w / 2 + panX - targetX * zoomScale;
  const cy = h / 2 + panY - targetY * zoomScale;
  
  // Radial grid lines
  for (let r = 1; r <= 8; r++) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * zoomScale, 0, 2 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();

  // 1. Render Kepler's 1st Law centers/axes overlays
  if (keplerMode === 'law1') {
    planets.forEach(p => {
      ctx.save();
      const angleRad = (p.argument * Math.PI) / 180;
      const cosA = Math.cos(angleRad);
      const sinA = Math.sin(angleRad);
      
      // Ellipse center is at -a*e from Sun along apsides direction
      const centerX = cx - (p.a * p.ecc * cosA) * zoomScale;
      const centerY = cy - (p.a * p.ecc * sinA) * zoomScale;
      
      // Draw center marker
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Draw second focus: located at -2*a*e from Sun focus (cx, cy)
      const focus2X = cx - (2.0 * p.a * p.ecc * cosA) * zoomScale;
      const focus2Y = cy - (2.0 * p.a * p.ecc * sinA) * zoomScale;
      
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(focus2X, focus2Y, 5, 0, 2 * Math.PI);
      ctx.moveTo(focus2X - 8, focus2Y);
      ctx.lineTo(focus2X + 8, focus2Y);
      ctx.moveTo(focus2X, focus2Y - 8);
      ctx.lineTo(focus2X, focus2Y + 8);
      ctx.stroke();
      
      ctx.fillStyle = '#a855f7';
      ctx.font = '8px Share Tech Mono';
      ctx.fillText(`Focus 2 (${p.name})`, focus2X + 10, focus2Y - 4);
      ctx.restore();
    });
  }

  // 2. Render Kepler's 2nd Law Area Shaded Wedges
  if (keplerMode === 'law2') {
    planets.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color + '26'; // semi-transparent
      ctx.strokeStyle = p.color + '59';
      ctx.lineWidth = 0.8;
      
      p.sweeps.forEach(sw => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + sw.p1.x * zoomScale, cy + sw.p1.y * zoomScale);
        ctx.lineTo(cx + sw.p2.x * zoomScale, cy + sw.p2.y * zoomScale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    });
  }

  // 3. Draw Orbit Trails
  planets.forEach(p => {
    if (p.trail.length < 2) return;
    
    ctx.save();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = selectedPlanetName === p.name ? 1.8 : 0.8;
    ctx.globalAlpha = selectedPlanetName === p.name ? 0.9 : 0.35;
    
    ctx.beginPath();
    ctx.moveTo(cx + p.trail[0].x * zoomScale, cy + p.trail[0].y * zoomScale);
    for (let i = 1; i < p.trail.length; i++) {
      ctx.lineTo(cx + p.trail[i].x * zoomScale, cy + p.trail[i].y * zoomScale);
    }
    ctx.stroke();
    ctx.restore();
  });
  
  // 4. Draw Lines of Apsides
  if (showApsides) {
    planets.forEach(p => {
      ctx.save();
      ctx.strokeStyle = p.color;
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.4;
      
      const angleRad = (p.argument * Math.PI) / 180;
      const cosA = Math.cos(angleRad);
      const sinA = Math.sin(angleRad);
      
      const periX = cx + (p.a * (1 - p.ecc) * cosA) * zoomScale;
      const periY = cy + (p.a * (1 - p.ecc) * sinA) * zoomScale;
      
      const apoX = cx - (p.a * (1 + p.ecc) * cosA) * zoomScale;
      const apoY = cy - (p.a * (1 + p.ecc) * sinA) * zoomScale;
      
      ctx.beginPath();
      ctx.moveTo(apoX, apoY);
      ctx.lineTo(periX, periY);
      ctx.stroke();
      ctx.restore();
    });
  }

  // 5. Draw Central Sun
  ctx.save();
  const sunGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 22);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.2, '#fff6ab');
  sunGrad.addColorStop(0.7, '#ffaa00');
  sunGrad.addColorStop(1, 'rgba(255, 170, 0, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 25, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();

  // 6. Draw Planets
  planets.forEach(p => {
    const px = cx + p.x * zoomScale;
    const py = cy + p.y * zoomScale;
    
    // Draw body
    ctx.save();
    ctx.fillStyle = p.color;
    ctx.shadowBlur = selectedPlanetName === p.name ? 10 : 4;
    ctx.shadowColor = p.color;
    
    ctx.beginPath();
    ctx.arc(px, py, selectedPlanetName === p.name ? 7 : 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    
    // Label
    if (showLabels) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px Share Tech Mono';
      ctx.fillText(p.name, px + 8, py - 4);
    }
    
    // Vector Overlay Arrows
    const speed = Vector.magnitude({ x: p.vx, y: p.vy });
    
    // A. Velocity Vector (Cyan)
    if (showVelocityVector && speed > 0.1) {
      ctx.save();
      ctx.strokeStyle = '#00f2fe';
      ctx.fillStyle = '#00f2fe';
      ctx.lineWidth = 1.5;
      
      const vdx = (p.vx / speed) * 30;
      const vdy = (p.vy / speed) * 30;
      
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + vdx, py + vdy);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(px + vdx, py + vdy, 2.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }
    
    // B. Gravity Force Vector (Fuchsia)
    if (showGravityVector) {
      const dist = Math.hypot(p.x, p.y);
      if (dist > 0.1) {
        ctx.save();
        ctx.strokeStyle = '#ff007f';
        ctx.fillStyle = '#ff007f';
        ctx.lineWidth = 1.5;
        
        const gdx = (-p.x / dist) * 30;
        const gdy = (-p.y / dist) * 30;
        
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + gdx, py + gdy);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(px + gdx, py + gdy, 2.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }
    }
  });
}

/**
 * Updates telemetry outputs
 */
function updateHUDValues() {
  planetCountBadge.textContent = planets.length;
  targetNameBadge.textContent = selectedPlanetName;
  
  const targetPlanet = planets.find(p => p.name === selectedPlanetName);
  
  if (targetPlanet) {
    const dist = Math.hypot(targetPlanet.x, targetPlanet.y);
    const speedVal = Vector.magnitude({ x: targetPlanet.vx, y: targetPlanet.vy });
    
    // Convert speed to km/s: 1 AU/Year = 4.74 km/s
    const speedKms = speedVal * 4.743;
    
    telName.textContent = targetPlanet.name;
    telDist.textContent = `${dist.toFixed(3)} AU`;
    telSpeed.textContent = `${speedKms.toFixed(2)} km/s`;
    telEcc.textContent = targetPlanet.ecc.toFixed(4);
    telAxis.textContent = `${targetPlanet.a.toFixed(2)} AU`;
    
    const peri = targetPlanet.a * (1 - targetPlanet.ecc);
    const apo = targetPlanet.a * (1 + targetPlanet.ecc);
    
    telPeri.textContent = `${peri.toFixed(3)} AU`;
    telApo.textContent = `${apo.toFixed(3)} AU`;
    telPeriod.textContent = `${targetPlanet.period.toFixed(2)} Years`;
  } else {
    telName.textContent = 'Sun';
    telDist.textContent = '0.000 AU';
    telSpeed.textContent = '0.00 km/s';
    telEcc.textContent = '0.0000';
    telAxis.textContent = '0.00 AU';
    telPeri.textContent = '0.000 AU';
    telApo.textContent = '0.000 AU';
    telPeriod.textContent = '0.00 Years';
  }
}

/**
 * Interactive click selection logic on Canvas
 */
function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  let targetX = 0, targetY = 0;
  if (selectedPlanetName !== 'Sun') {
    const lockedPlanet = planets.find(p => p.name === selectedPlanetName);
    if (lockedPlanet) {
      targetX = lockedPlanet.x;
      targetY = lockedPlanet.y;
    }
  }

  const cx = canvas.width / 2 + panX - targetX * zoomScale;
  const cy = canvas.height / 2 + panY - targetY * zoomScale;
  
  // Click check on planets
  let clickedPlanet = null;
  planets.forEach(p => {
    const px = cx + p.x * zoomScale;
    const py = cy + p.y * zoomScale;
    if (Math.hypot(mouseX - px, mouseY - py) < 15) {
      clickedPlanet = p;
    }
  });

  if (clickedPlanet) {
    selectedPlanetName = clickedPlanet.name;
    logToConsole(`Camera lock target changed: ${clickedPlanet.name}`, 'info');
  } else if (Math.hypot(mouseX - cx, mouseY - cy) < 20) {
    selectedPlanetName = 'Sun';
    logToConsole('Camera lock target changed: Sun (Center)', 'info');
  }
  updateHUDValues();
}

/**
 * Drag and Pan viewports
 */
function handleCanvasMouseDown(e) {
  if (e.button === 0) {
    isPanning = true;
    startPanX = e.clientX - panX;
    startPanY = e.clientY - panY;
  }
}

function handleCanvasMouseMove(e) {
  if (isPanning) {
    panX = e.clientX - startPanX;
    panY = e.clientY - startPanY;
  }
}

function handleCanvasMouseUp() {
  isPanning = false;
}

/**
 * Zoom with scroll wheel
 */
function handleCanvasWheel(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  let targetX = 0, targetY = 0;
  if (selectedPlanetName !== 'Sun') {
    const lockedPlanet = planets.find(p => p.name === selectedPlanetName);
    if (lockedPlanet) {
      targetX = lockedPlanet.x;
      targetY = lockedPlanet.y;
    }
  }

  const cx = canvas.width / 2 + panX - targetX * zoomScale;
  const cy = canvas.height / 2 + panY - targetY * zoomScale;
  
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  
  const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
  const newScale = zoomScale * zoomFactor;
  
  if (newScale >= zoomMin && newScale <= zoomMax) {
    zoomScale = newScale;
    // Adjust pan coordinates so zoom pivot aligns with mouse pointer
    panX = mouseX - canvas.width / 2 - dx * zoomFactor + targetX * newScale;
    panY = mouseY - canvas.height / 2 - dy * zoomFactor + targetY * newScale;
  }
}

/**
 * Deploy custom planet from inputs
 */
function deployCustomPlanet() {
  const a = parseFloat(numSemimajor.value);
  const e = parseFloat(numEccentricity.value);
  const arg = parseFloat(numArgument.value);
  const name = `Custom-${planets.length + 1}`;
  
  // Verify duplicates
  if (planets.find(p => p.name === name)) return;
  
  createPlanet(name, a, e, arg, activeColor, true);
}

/**
 * De-orbits locked custom planet
 */
function removeCustomPlanet() {
  const target = planets.find(p => p.name === selectedPlanetName);
  if (!target) return;
  
  if (target.isCustom) {
    planets = planets.filter(p => p.name !== selectedPlanetName);
    logToConsole(`De-orbited and removed custom planet: ${selectedPlanetName}`, 'warning');
    selectedPlanetName = 'Sun';
    updateHUDValues();
    saveStateToLocalStorage();
  } else {
    logToConsole('Alert: Default system planets cannot be de-orbited.', 'danger');
  }
}

/**
 * Sync number boxes inputs with ranges
 */
function syncInputs(numEl, rangeEl, type) {
  numEl.addEventListener('input', () => {
    rangeEl.value = numEl.value;
    updateVarsFromInputs(type, parseFloat(numEl.value));
  });
  rangeEl.addEventListener('input', () => {
    numEl.value = rangeEl.value;
    updateVarsFromInputs(type, parseFloat(rangeEl.value));
  });
}

function updateVarsFromInputs(type, val) {
  saveStateToLocalStorage();
}

/**
 * Kepler Visual Ledger build for Law 3
 */
function renderKeplerLedger() {
  const ledgerDiv = document.getElementById('kepler-helper-text');
  if (keplerMode !== 'law3') return;
  
  let rowsHtml = `<table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 9px; margin-top: 6px;">
    <thead>
      <tr style="border-bottom: 1px solid var(--border-glow); color: var(--text-muted); text-align: left;">
        <th style="padding: 2px;">Planet</th>
        <th style="padding: 2px;">T (Yr)</th>
        <th style="padding: 2px;">a (AU)</th>
        <th style="padding: 2px; text-align: right;">T²/a³ ratio</th>
      </tr>
    </thead>
    <tbody>`;
  
  planets.forEach(p => {
    // In our scaled units where G*M = 4*PI^2, Period T = a^1.5. Thus T^2 / a^3 = 1.0 exactly!
    const ratio = (p.period * p.period) / (p.a * p.a * p.a);
    rowsHtml += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.03); color: ${p.color}">
      <td style="padding: 2px;">${p.name}</td>
      <td style="padding: 2px;">${p.period.toFixed(2)}</td>
      <td style="padding: 2px;">${p.a.toFixed(2)}</td>
      <td style="padding: 2px; text-align: right;">${ratio.toFixed(4)}</td>
    </tr>`;
  });
  
  rowsHtml += `</tbody></table>
  <div style="font-size: 8.5px; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
    In Keplerian units, the $T^2/a^3$ ratio resolves to exactly **1.0000** for every body orbiting the same star, confirming Kepler's Third Law.
  </div>`;
  
  ledgerDiv.innerHTML = rowsHtml;
}

/**
 * Handle Kepler mode updates
 */
function updateKeplerModeText() {
  keplerMode = selectKeplerMode.value;
  keplerModeBadge.textContent = selectKeplerMode.options[selectKeplerMode.selectedIndex].text;
  
  if (keplerMode === 'none') {
    keplerHelperText.innerHTML = `Standard simulation running. Choose a Kepler mode to highlight celestial geometry.`;
  } else if (keplerMode === 'law1') {
    keplerHelperText.innerHTML = `<strong>1st Law: Law of Orbits</strong><br>
    Orbits are ellipses with the Sun at one focus. The empty second focus is plotted as a purple crosshair: <span style="color: #a855f7;">✚</span>.`;
  } else if (keplerMode === 'law2') {
    keplerHelperText.innerHTML = `<strong>2nd Law: Law of Areas</strong><br>
    The shaded segments along each trail represent equal-time sweeps. Notice how planets speed up at perihelion (thick wedge) and slow down at aphelion (thin wedge).`;
  } else if (keplerMode === 'law3') {
    renderKeplerLedger();
  }
}

/**
 * Local storage persistence
 */
function saveStateToLocalStorage() {
  const saveArr = planets.map(p => ({
    name: p.name,
    a: p.a,
    ecc: p.ecc,
    argument: p.argument,
    color: p.color,
    isCustom: p.isCustom
  }));
  localStorage.setItem('planetary_orbits', JSON.stringify(saveArr));
}

function loadStateFromLocalStorage() {
  try {
    const raw = localStorage.getItem('planetary_orbits');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && saved.length > 0) {
        planets = [];
        saved.forEach(p => {
          createPlanet(p.name, p.a, p.ecc, p.argument, p.color, p.isCustom);
        });
        logToConsole(`Restored ${saved.length} orbits from previous session.`, 'info');
      } else {
        loadPresetSolarSystem();
      }
    } else {
      loadPresetSolarSystem();
    }
  } catch (err) {
    loadPresetSolarSystem();
  }
}

/**
 * Core loop tick cycles
 */
let lastFrameTime = performance.now();
function tick(timestamp) {
  const dtSeconds = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;
  
  // Physics step
  // dt mapping: 1 year in real-time frame would take too long, so timeWarp speeds it up.
  // 1 year = 365 days. Let's make timeWarp scale dt to years.
  // 1 Year per 30 seconds at timeWarp = 100
  const dtScaled = isPaused ? 0 : (dtSeconds * timeWarp * 0.001);
  
  planets.forEach(p => {
    updatePlanetKinematics(p, dtScaled);
  });
  
  // Render Scene
  drawScene();
  updateHUDValues();
  if (keplerMode === 'law3') {
    renderKeplerLedger();
  }
  
  requestAnimationFrame(tick);
}

function resetState() {
  planets = [];
  selectedPlanetName = 'Sun';
  zoomScale = 120;
  panX = 0; panY = 0;
  isPaused = false;
  
  btnPausePlay.classList.add('active');
  document.getElementById('lbl-pause-icon').textContent = '⏸️';
  document.getElementById('lbl-pause-text').textContent = 'Pause';
  
  loadPresetSolarSystem();
  logToConsole('Simulator reset. Restored default solar system.', 'warning');
}

function resizeCanvas() {
  const rect = canvas.parentNode.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

// Bind HTML events
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('sim-canvas');
  ctx = canvas.getContext('2d');
  
  // Elements bindings
  numSemimajor = document.getElementById('num-semimajor');
  rangeSemimajor = document.getElementById('input-semimajor');
  numEccentricity = document.getElementById('num-eccentricity');
  rangeEccentricity = document.getElementById('input-eccentricity');
  numArgument = document.getElementById('num-argument');
  rangeArgument = document.getElementById('input-argument');
  
  btnDeploy = document.getElementById('btn-deploy');
  btnClearTrails = document.getElementById('btn-clear-trails');
  btnRemoveCustom = document.getElementById('btn-remove-custom');
  
  selectKeplerMode = document.getElementById('select-kepler-mode');
  keplerHelperText = document.getElementById('kepler-helper-text');
  
  selectWarp = document.getElementById('select-warp');
  btnPausePlay = document.getElementById('btn-pause-play');
  btnReset = document.getElementById('btn-reset');
  consoleLogs = document.getElementById('console-logs');
  
  planetCountBadge = document.getElementById('hud-planet-count');
  targetNameBadge = document.getElementById('hud-target-name');
  keplerModeBadge = document.getElementById('hud-kepler-mode');
  
  // Dossier bindings
  telName = document.getElementById('tel-name');
  telDist = document.getElementById('tel-dist');
  telSpeed = document.getElementById('tel-speed');
  telEcc = document.getElementById('tel-ecc');
  telAxis = document.getElementById('tel-axis');
  telPeri = document.getElementById('tel-peri');
  telApo = document.getElementById('tel-apo');
  telPeriod = document.getElementById('tel-period');
  
  // Sync sliders
  syncInputs(numSemimajor, rangeSemimajor, 'semimajor');
  syncInputs(numEccentricity, rangeEccentricity, 'eccentricity');
  syncInputs(numArgument, rangeArgument, 'argument');
  
  // Canvas Listeners
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('mousedown', handleCanvasMouseDown);
  canvas.addEventListener('mousemove', handleCanvasMouseMove);
  canvas.addEventListener('mouseup', handleCanvasMouseUp);
  canvas.addEventListener('wheel', handleCanvasWheel);
  
  // Toggles binders
  document.getElementById('chk-toggle-vel').addEventListener('change', (e) => {
    showVelocityVector = e.target.checked;
  });
  document.getElementById('chk-toggle-grav').addEventListener('change', (e) => {
    showGravityVector = e.target.checked;
  });
  document.getElementById('chk-toggle-labels').addEventListener('change', (e) => {
    showLabels = e.target.checked;
  });
  document.getElementById('chk-toggle-apsides').addEventListener('change', (e) => {
    showApsides = e.target.checked;
  });
  
  // Swatch color picker
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('active'));
      sw.classList.add('active');
      activeColor = sw.getAttribute('data-color');
    });
  });
  
  // Presets listeners
  document.getElementById('btn-preset-solar').addEventListener('click', () => loadPresetSystem('solar'));
  document.getElementById('btn-preset-eccentric').addEventListener('click', () => loadPresetSystem('eccentric'));
  document.getElementById('btn-preset-comet').addEventListener('click', () => loadPresetSystem('comet'));
  document.getElementById('btn-preset-conjunction').addEventListener('click', () => loadPresetSystem('conjunction'));
  
  // Deploy and modifications
  btnDeploy.addEventListener('click', deployCustomPlanet);
  btnClearTrails.addEventListener('click', () => {
    planets.forEach(p => p.trail = []);
    logToConsole('Planetary orbit trails cleared.', 'info');
  });
  btnRemoveCustom.addEventListener('click', removeCustomPlanet);
  
  // Play / Pause toggler
  btnPausePlay.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      btnPausePlay.classList.remove('active');
      document.getElementById('lbl-pause-icon').textContent = '▶️';
      document.getElementById('lbl-pause-text').textContent = 'Resume';
      logToConsole('Simulator clock suspended.', 'warning');
    } else {
      btnPausePlay.classList.add('active');
      document.getElementById('lbl-pause-icon').textContent = '⏸️';
      document.getElementById('lbl-pause-text').textContent = 'Pause';
      logToConsole('Simulator clock running.', 'info');
    }
  });
  
  // Time warp
  selectWarp.addEventListener('change', () => {
    timeWarp = parseInt(selectWarp.value);
    document.getElementById('sim-warp-status').textContent = `Time Warp: ${timeWarp}x`;
  });
  
  selectKeplerMode.addEventListener('change', updateKeplerModeText);
  btnReset.addEventListener('click', resetState);
  
  // Load configuration
  loadStateFromLocalStorage();
  
  // Kickstart loop tick
  requestAnimationFrame(tick);
});
