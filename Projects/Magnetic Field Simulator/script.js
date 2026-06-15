// Global physics constants
const MU_0 = 1.0; // Permeability of free space (normalized for simulation scale)
const K_DIPOLE = 8000; // Dipole strength constant
const K_WIRE = 10; // Wire current field constant

// Simulator State
let sources = [];
let particles = [];
let selectedSource = null;
let isPlaying = true;
let lineDensity = 12; // lines per pole

// View flags
let drawFieldLines = true;
let drawVectors = true;
let drawProbe = true;

// Compass Sensor Probe
let probe = { x: 340, y: 350, r: 20, isDragging: false };

// Draggable state variables
let draggedSource = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Peak field metric
let peakFieldStrength = 0;

// DOM Selectors
const canvas = document.getElementById("physics-canvas");
const ctx = canvas.getContext("2d");
const sourceTypeSelect = document.getElementById("source-type-select");
const btnAddSource = document.getElementById("btn-add-source");
const selectedSourceControls = document.getElementById("selected-source-controls");
const selectedSourceTitle = document.getElementById("selected-source-title");
const btnRemoveSource = document.getElementById("btn-remove-source");

const sliderStrength = document.getElementById("slider-strength");
const valStrength = document.getElementById("val-strength");
const angleInputGroup = document.getElementById("angle-input-group");
const sliderAngle = document.getElementById("slider-angle");
const valAngle = document.getElementById("val-angle");
const solenoidLoopsGroup = document.getElementById("solenoid-loops-group");
const sliderLoops = document.getElementById("slider-loops");
const valLoops = document.getElementById("val-loops");

const checkLines = document.getElementById("check-lines");
const checkVectors = document.getElementById("check-vectors");
const checkProbe = document.getElementById("check-probe");
const linesDensityGroup = document.getElementById("lines-density-group");
const sliderDensity = document.getElementById("slider-density");
const valDensity = document.getElementById("val-density");

const probeHud = document.getElementById("probe-hud");
const probeXLabel = document.getElementById("probe-x");
const probeYLabel = document.getElementById("probe-y");
const probeBxLabel = document.getElementById("probe-bx");
const probeByLabel = document.getElementById("probe-by");
const probeBMagLabel = document.getElementById("probe-b-mag");

const selectCharge = document.getElementById("particle-charge");
const sliderVelocity = document.getElementById("slider-velocity");
const valVelocity = document.getElementById("val-velocity");
const sliderMass = document.getElementById("slider-mass");
const valMass = document.getElementById("val-mass");
const btnInject = document.getElementById("btn-inject");
const btnClearParticles = document.getElementById("btn-clear-particles");

const btnPause = document.getElementById("btn-pause");
const btnReset = document.getElementById("btn-reset");
const consoleLogs = document.getElementById("console-logs");
const btnClearConsole = document.getElementById("btn-clear-console");

const metricSources = document.getElementById("metric-sources");
const metricStrength = document.getElementById("metric-strength");
const metricParticles = document.getElementById("metric-particles");
const metricFps = document.getElementById("metric-fps");

// Magnetic Source Classes
class BarMagnet {
  constructor(x, y, strength = 60, angle = 0) {
    this.type = "bar";
    this.x = x;
    this.y = y;
    this.strength = strength; // Dipole moment
    this.angle = angle; // Degrees
    this.length = 70; // Distance between poles
    this.width = 24;
    this.r = 30; // Collision drag radius
  }

  getPoles() {
    const rad = (this.angle * Math.PI) / 180;
    const dx = (this.length / 2) * Math.cos(rad);
    const dy = (this.length / 2) * Math.sin(rad);
    return {
      north: { x: this.x + dx, y: this.y + dy },
      south: { x: this.x - dx, y: this.y - dy }
    };
  }

  // Calculate field contribution at point P(px, py)
  getFieldAt(px, py) {
    const poles = this.getPoles();
    const rxN = px - poles.north.x;
    const ryN = py - poles.north.y;
    const rN2 = rxN * rxN + ryN * ryN;
    const rN3 = Math.max(rN2 * Math.sqrt(rN2), 100);

    const rxS = px - poles.south.x;
    const ryS = py - poles.south.y;
    const rS2 = rxS * rxS + ryS * ryS;
    const rS3 = Math.max(rS2 * Math.sqrt(rS2), 100);

    // B = k * (r_hat_N / rN^2 - r_hat_S / rS^2)
    const bx = this.strength * K_DIPOLE * (rxN / rN3 - rxS / rS3);
    const by = this.strength * K_DIPOLE * (ryN / rN3 - ryS / rS3);

    return { bx, by };
  }
}

class CurrentWire {
  constructor(x, y, current = 40) {
    this.type = "wire";
    this.x = x;
    this.y = y;
    this.current = current; // positive: out of page (odot), negative: into page (otimes)
    this.r = 15; // Drag radius
  }

  getFieldAt(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(r2);

    if (r < 5) return { bx: 0, by: 0 };

    // Biot-Savart formula magnitude: B = mu_0 * I / (2 * pi * r)
    const magnitude = (K_WIRE * this.current) / r;
    
    // Perpendicular vector (-dy, dx)
    const bx = -magnitude * (dy / r);
    const by = magnitude * (dx / r);

    return { bx, by };
  }
}

class Solenoid {
  constructor(x, y, current = 50, loops = 12, angle = 0) {
    this.type = "solenoid";
    this.x = x;
    this.y = y;
    this.current = current;
    this.loops = loops;
    this.angle = angle;
    this.length = 100;
    this.r = 40; // Collision drag radius
  }

  getFieldAt(px, py) {
    // Model solenoid as a sequence of loop wires carrying currents
    // To make calculations fast, we sum loops count of magnetic dipoles or wire coils
    const rad = (this.angle * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    let bx = 0;
    let by = 0;

    // Sum loops
    const step = this.length / (this.loops - 1 || 1);
    const startX = this.x - (this.length / 2) * cosA;
    const startY = this.y - (this.length / 2) * sinA;

    for (let i = 0; i < this.loops; i++) {
      // Position of loop center
      const lx = startX + i * step * cosA;
      const ly = startY + i * step * sinA;

      // Modeled as a small dipole at this loop offset
      // North pole slightly offset along axis, South pole opposite
      const poleOffset = 4;
      const nPos = { x: lx + poleOffset * cosA, y: ly + poleOffset * sinA };
      const sPos = { x: lx - poleOffset * cosA, y: ly - poleOffset * sinA };

      const rxN = px - nPos.x;
      const ryN = py - nPos.y;
      const rN2 = rxN * rxN + ryN * ryN;
      const rN3 = Math.max(rN2 * Math.sqrt(rN2), 100);

      const rxS = px - sPos.x;
      const ryS = py - sPos.y;
      const rS2 = rxS * rxS + ryS * ryS;
      const rS3 = Math.max(rS2 * Math.sqrt(rS2), 100);

      // Add contribution
      bx += this.current * 800 * (rxN / rN3 - rxS / rS3);
      by += this.current * 800 * (ryN / rN3 - ryS / rS3);
    }

    return { bx, by };
  }
}

// Charged Particle Class
class Particle {
  constructor(x, y, vx, vy, charge, mass) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.charge = charge;
    this.mass = mass;
    this.trail = [];
    this.maxTrailLength = 120;
    this.color = charge > 0 ? "#10b981" : charge < 0 ? "#ef4444" : "#9ca3af";
  }

  update(dt, totalFieldFunc) {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // Get magnetic field at current position
    const field = totalFieldFunc(this.x, this.y);
    const B_mag = Math.sqrt(field.bx * field.bx + field.by * field.by);

    // Lorentz force perpendicular calculation (F = q * (v x B))
    // We simulate 2D motion with out-of-plane B scalar representation
    // Let's assume Bz component is proportional to the local field scalar magnitude and alignment
    // This allows visual orbital deflections
    const B_scalar = (field.bx * -this.vy + field.by * this.vx) / (Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1);

    // Force vector
    const Fx = this.charge * this.vy * B_scalar * 0.005;
    const Fy = -this.charge * this.vx * B_scalar * 0.005;

    // Accelerations (a = F/m)
    const ax = Fx / this.mass;
    const ay = Fy / this.mass;

    // Verlet/Euler velocity step updates
    this.vx += ax * dt;
    this.vy += ay * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}

// Sum all field sources at target coordinate (Superposition)
function calculateTotalField(px, py) {
  let bx = 0;
  let by = 0;

  sources.forEach(src => {
    const f = src.getFieldAt(px, py);
    bx += f.bx;
    by += f.by;
  });

  return { bx, by };
}

// Init Setup
function initSimulator() {
  // Add initial default Bar Magnet in center
  sources.push(new BarMagnet(340, 220, 60, 0));
  selectedSource = sources[0];

  // UI Event bindings
  btnAddSource.addEventListener("click", handleAddSource);
  btnRemoveSource.addEventListener("click", handleRemoveSource);
  btnPause.addEventListener("click", handleTogglePlay);
  btnReset.addEventListener("click", handleResetSandbox);
  btnInject.addEventListener("click", handleInjectParticle);
  btnClearParticles.addEventListener("click", () => {
    particles = [];
    addConsoleLog("PARTICLE INJECTOR", "Cleared all particle trails.", "particle");
  });
  btnClearConsole.addEventListener("click", () => consoleLogs.innerHTML = "");

  // Slide parameters sliders
  sliderStrength.addEventListener("input", updateSelectedSourceParams);
  sliderAngle.addEventListener("input", updateSelectedSourceParams);
  sliderLoops.addEventListener("input", updateSelectedSourceParams);

  // Check visual toggles
  checkLines.addEventListener("change", (e) => drawFieldLines = e.target.checked);
  checkVectors.addEventListener("change", (e) => drawVectors = e.target.checked);
  checkProbe.addEventListener("change", (e) => {
    drawProbe = e.target.checked;
    if (drawProbe) probeHud.classList.remove("hide");
    else probeHud.classList.add("hide");
  });
  sliderDensity.addEventListener("input", (e) => {
    lineDensity = parseInt(e.target.value);
    valDensity.textContent = lineDensity;
  });

  // Canvas Mouse Hooks
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);

  // Start Animation ticks
  requestAnimationFrame(tick);
  
  updateSourceControlsUI();
  addConsoleLog("SYSTEM", "Genesis dipole magnet deployed in workspace.", "bar");
}

// Add new source into sandbox
function handleAddSource() {
  const type = sourceTypeSelect.value;
  let newSrc = null;

  const cx = 340 + (Math.random() - 0.5) * 100;
  const cy = 250 + (Math.random() - 0.5) * 100;

  if (type === "bar") {
    newSrc = new BarMagnet(cx, cy, 50, 0);
    addConsoleLog("SANDBOX", "Added new Bar Magnet.", "bar");
  } else if (type === "wire") {
    newSrc = new CurrentWire(cx, cy, 40);
    addConsoleLog("SANDBOX", "Added new Current-Carrying Wire.", "wire");
  } else if (type === "solenoid") {
    newSrc = new Solenoid(cx, cy, 50, 12, 0);
    addConsoleLog("SANDBOX", "Added new Solenoid Coil.", "solenoid");
  }

  if (newSrc) {
    sources.push(newSrc);
    selectedSource = newSrc;
    updateSourceControlsUI();
    updateMetrics();
  }
}

// Remove Selected Source
function handleRemoveSource() {
  if (!selectedSource) return;
  
  sources = sources.filter(s => s !== selectedSource);
  addConsoleLog("SANDBOX", `Removed selected source.`, "system");
  
  selectedSource = sources.length > 0 ? sources[sources.length - 1] : null;
  updateSourceControlsUI();
  updateMetrics();
}

function handleTogglePlay() {
  isPlaying = !isPlaying;
  btnPause.textContent = isPlaying ? "Pause Physics" : "Play Physics";
  if (isPlaying) {
    btnPause.classList.remove("paused");
    addConsoleLog("SYSTEM", "Physics simulator resumed.", "system");
  } else {
    btnPause.classList.add("paused");
    addConsoleLog("SYSTEM", "Physics simulator paused.", "error");
  }
}

function handleResetSandbox() {
  sources = [new BarMagnet(340, 220, 60, 0)];
  selectedSource = sources[0];
  particles = [];
  probe = { x: 340, y: 350, r: 20, isDragging: false };
  isPlaying = true;
  btnPause.textContent = "Pause Physics";
  btnPause.classList.remove("paused");
  
  updateSourceControlsUI();
  updateMetrics();
  addConsoleLog("SYSTEM", "Simulator sandbox reset complete.", "system");
}

// Slide changes sync
function updateSelectedSourceParams() {
  if (!selectedSource) return;

  const strength = parseFloat(sliderStrength.value);
  const angle = parseInt(sliderAngle.value);
  const loops = parseInt(sliderLoops.value);

  selectedSource.strength = strength;
  selectedSource.current = strength; // Wire/Solenoid shares strength range
  selectedSource.angle = angle;
  selectedSource.loops = loops;

  valStrength.textContent = strength;
  valAngle.textContent = angle;
  valLoops.textContent = loops;
}

// Sync UI details panel matching selected source type
function updateSourceControlsUI() {
  if (!selectedSource) {
    selectedSourceControls.classList.add("hide");
    return;
  }

  selectedSourceControls.classList.remove("hide");
  selectedSourceTitle.textContent = `Selected: ${selectedSource.type.toUpperCase()}`;

  // Read params
  const strengthVal = selectedSource.type === "bar" ? selectedSource.strength : selectedSource.current;
  sliderStrength.value = strengthVal;
  valStrength.textContent = strengthVal;

  if (selectedSource.type === "wire") {
    angleInputGroup.classList.add("hide");
    solenoidLoopsGroup.classList.add("hide");
  } else if (selectedSource.type === "bar") {
    angleInputGroup.classList.remove("hide");
    solenoidLoopsGroup.classList.add("hide");
    
    sliderAngle.value = selectedSource.angle;
    valAngle.textContent = selectedSource.angle;
  } else if (selectedSource.type === "solenoid") {
    angleInputGroup.classList.remove("hide");
    solenoidLoopsGroup.classList.remove("hide");
    
    sliderAngle.value = selectedSource.angle;
    valAngle.textContent = selectedSource.angle;
    sliderLoops.value = selectedSource.loops;
    valLoops.textContent = selectedSource.loops;
  }
}

// Inject Charged Particle
function handleInjectParticle() {
  const chargeType = selectCharge.value;
  let charge = 0;
  let mass = parseInt(sliderMass.value);
  
  if (chargeType === "proton") charge = 1.0;
  else if (chargeType === "electron") charge = -1.0;
  else if (chargeType === "alpha") charge = 2.0;

  const velocity = parseFloat(sliderVelocity.value) * 0.5; // Scale speed for canvas

  // Fire particle from bottom left pointing towards center-right
  const startX = 50;
  const startY = 380;
  
  // Angle towards center-right (around -25 degrees)
  const angleRad = (-25 * Math.PI) / 180;
  const vx = velocity * Math.cos(angleRad);
  const vy = velocity * Math.sin(angleRad);

  particles.push(new Particle(startX, startY, vx, vy, charge, mass));
  
  addConsoleLog("PARTICLE INJECTOR", `Injected ${chargeType.toUpperCase()} (q: ${charge}, m: ${mass}) from coordinates (50, 380).`, "particle");
}

// Mouse drags and selections calculations
function handleMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // 1. Check if clicking probe compass
  if (drawProbe) {
    const dx = mx - probe.x;
    const dy = my - probe.y;
    if (dx * dx + dy * dy < probe.r * probe.r) {
      probe.isDragging = true;
      dragOffsetX = dx;
      dragOffsetY = dy;
      return;
    }
  }

  // 2. Check if clicking source components to drag or select
  for (let i = sources.length - 1; i >= 0; i--) {
    const src = sources[i];
    const dx = mx - src.x;
    const dy = my - src.y;
    
    // Check hit radius
    const hitRadius = src.type === "solenoid" ? src.r + 20 : src.r;
    if (dx * dx + dy * dy < hitRadius * hitRadius) {
      draggedSource = src;
      selectedSource = src;
      dragOffsetX = dx;
      dragOffsetY = dy;
      updateSourceControlsUI();
      return;
    }
  }
}

function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // Change cursor icon if hovering over draggable elements
  let isHovering = false;

  if (drawProbe) {
    const dx = mx - probe.x;
    const dy = my - probe.y;
    if (dx * dx + dy * dy < probe.r * probe.r) isHovering = true;
  }

  if (!isHovering) {
    for (let src of sources) {
      const dx = mx - src.x;
      const dy = my - src.y;
      const hitRadius = src.type === "solenoid" ? src.r + 20 : src.r;
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        isHovering = true;
        break;
      }
    }
  }

  canvas.style.cursor = isHovering ? "move" : "crosshair";

  // Handle Dragging
  if (probe.isDragging) {
    probe.x = mx - dragOffsetX;
    probe.y = my - dragOffsetY;
    
    // Boundary checks
    probe.x = Math.max(probe.r, Math.min(canvas.width - probe.r, probe.x));
    probe.y = Math.max(probe.r, Math.min(canvas.height - probe.r, probe.y));
  } else if (draggedSource) {
    draggedSource.x = mx - dragOffsetX;
    draggedSource.y = my - dragOffsetY;

    // Boundary checks
    draggedSource.x = Math.max(20, Math.min(canvas.width - 20, draggedSource.x));
    draggedSource.y = Math.max(20, Math.min(canvas.height - 20, draggedSource.y));
  }
}

function handleMouseUp() {
  probe.isDragging = false;
  draggedSource = null;
}

// Diagnostic HUD updates
function updateSensorHUD() {
  if (!drawProbe) return;

  probeXLabel.textContent = Math.round(probe.x);
  probeYLabel.textContent = Math.round(probe.y);

  // Compute local B field
  const field = calculateTotalField(probe.x, probe.y);
  const magnitude = Math.sqrt(field.bx * field.bx + field.by * field.by);

  probeBxLabel.textContent = field.bx.toFixed(2);
  probeByLabel.textContent = field.by.toFixed(2);
  probeBMagLabel.textContent = Math.round(magnitude);

  // Logging Biot-Savart calculations dynamically in terminal log at intervals
  if (Math.random() < 0.005) {
    addConsoleLog("SENSOR PROBE", `Probe located at (${Math.round(probe.x)}, ${Math.round(probe.y)}) | Total intensity B: ${Math.round(magnitude)} Gauss.`, "system");
  }
}

// Update live Top stats
function updateMetrics() {
  metricSources.textContent = sources.length;
  
  // Calculate Peak field strength on canvas
  let maxStrength = 0;
  for (let x = 50; x < canvas.width; x += 50) {
    for (let y = 50; y < canvas.height; y += 50) {
      const f = calculateTotalField(x, y);
      const mag = Math.sqrt(f.bx * f.bx + f.by * f.by);
      if (mag > maxStrength) maxStrength = mag;
    }
  }
  metricStrength.textContent = `${Math.round(maxStrength)} G`;
}

// Trace field lines numerically using Euler Integration
function drawFieldLinesCurves() {
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(0, 242, 254, 0.25)";

  sources.forEach(src => {
    if (src.type === "bar" || src.type === "solenoid") {
      // Seed lines starting from North Pole
      // Bar magnet or solenoid axis coordinates
      const poles = src.type === "bar" ? src.getPoles() : getSolenoidPoles(src);
      const seedPointsCount = lineDensity;

      // Integrate curves
      for (let i = 0; i < seedPointsCount; i++) {
        const theta = (i * 2 * Math.PI) / seedPointsCount;
        
        // Seed coordinates slightly offset from North pole
        const r_seed = 10;
        const sx = poles.north.x + r_seed * Math.cos(theta);
        const sy = poles.north.y + r_seed * Math.sin(theta);

        traceFieldLine(sx, sy, 1); // 1 = forward trace
      }
    } else if (src.type === "wire") {
      // Wire field lines are concentric circles.
      // Simply draw concentric circles centered at wire, scaled by current strength
      const loops = Math.min(Math.abs(src.current) / 5, 8);
      ctx.strokeStyle = "rgba(255, 184, 108, 0.2)";
      for (let i = 1; i <= loops; i++) {
        const radius = i * 25;
        ctx.beginPath();
        ctx.arc(src.x, src.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  });
}

function getSolenoidPoles(src) {
  const rad = (src.angle * Math.PI) / 180;
  const dx = (src.length / 2) * Math.cos(rad);
  const dy = (src.length / 2) * Math.sin(rad);
  return {
    north: { x: src.x + dx, y: src.y + dy },
    south: { x: src.x - dx, y: src.y - dy }
  };
}

// Euler trace line solver
function traceFieldLine(x, y, dir) {
  ctx.beginPath();
  ctx.moveTo(x, y);

  let px = x;
  let py = y;
  const stepSize = 8;
  const maxSteps = 150;

  for (let step = 0; step < maxSteps; step++) {
    const field = calculateTotalField(px, py);
    const magnitude = Math.sqrt(field.bx * field.bx + field.by * field.by);

    if (magnitude < 0.1 || isNaN(magnitude)) break;

    // Normalise direction vector
    const dx = (field.bx / magnitude) * stepSize * dir;
    const dy = (field.by / magnitude) * stepSize * dir;

    px += dx;
    py += dy;

    // Check canvas boundaries
    if (px < 0 || px > canvas.width || py < 0 || py > canvas.height) {
      ctx.lineTo(px, py);
      break;
    }

    // Stop if we hit a South pole to avoid infinite cycles
    if (isNearSouthPole(px, py)) {
      ctx.lineTo(px, py);
      break;
    }

    ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function isNearSouthPole(px, py) {
  for (let src of sources) {
    if (src.type === "bar" || src.type === "solenoid") {
      const poles = src.type === "bar" ? src.getPoles() : getSolenoidPoles(src);
      const dx = px - poles.south.x;
      const dy = py - poles.south.y;
      if (dx * dx + dy * dy < 80) return true; // Hitted S pole bubble
    }
  }
  return false;
}

// Draw grids vector arrows indicating field strengths
function drawVectorArrowsGrid() {
  const cellSize = 30;
  ctx.lineWidth = 1;

  for (let x = cellSize / 2; x < canvas.width; x += cellSize) {
    for (let y = cellSize / 2; y < canvas.height; y += cellSize) {
      
      // Don't draw arrows inside components bodies
      if (isInsideAnySource(x, y)) continue;

      const field = calculateTotalField(x, y);
      const magnitude = Math.sqrt(field.bx * field.bx + field.by * field.by);

      if (magnitude < 0.2) continue;

      // Draw vector arrow
      const angle = Math.atan2(field.by, field.bx);
      const length = Math.min(magnitude * 0.1, 20); // Clamp arrow size
      
      // Color intensity based on field strength
      const alpha = Math.min(magnitude / 200, 0.7);
      ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
      ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Line
      ctx.beginPath();
      ctx.moveTo(-length / 2, 0);
      ctx.lineTo(length / 2, 0);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(length / 2, 0);
      ctx.lineTo(length / 2 - 4, -3);
      ctx.lineTo(length / 2 - 4, 3);
      ctx.fill();

      ctx.restore();
    }
  }
}

function isInsideAnySource(x, y) {
  for (let src of sources) {
    const dx = x - src.x;
    const dy = y - src.y;
    if (src.type === "bar") {
      // Simple box bounds check
      const rad = (src.angle * Math.PI) / 180;
      // Rotated bounding check
      const rotX = dx * Math.cos(-rad) - dy * Math.sin(-rad);
      const rotY = dx * Math.sin(-rad) + dy * Math.cos(-rad);
      if (Math.abs(rotX) < src.length / 2 + 10 && Math.abs(rotY) < src.width / 2 + 5) return true;
    } else if (src.type === "wire") {
      if (dx * dx + dy * dy < src.r * src.r) return true;
    } else if (src.type === "solenoid") {
      if (dx * dx + dy * dy < src.r * src.r) return true;
    }
  }
  return false;
}

// Draw visual shapes (Bar Magnets, Wires, Compass)
function drawSources() {
  sources.forEach(src => {
    ctx.save();
    ctx.translate(src.x, src.y);

    if (src.type === "bar") {
      const rad = (src.angle * Math.PI) / 180;
      ctx.rotate(rad);

      // Highlight selected source
      if (src === selectedSource) {
        ctx.strokeStyle = "rgba(0, 242, 254, 0.8)";
        ctx.lineWidth = 3;
        ctx.strokeRect(-src.length / 2 - 3, -src.width / 2 - 3, src.length + 6, src.width + 6);
      }

      // Draw North side (Cyan)
      ctx.fillStyle = "#00f2fe";
      ctx.fillRect(0, -src.width / 2, src.length / 2, src.width);
      
      // Draw South side (Red)
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(-src.length / 2, -src.width / 2, src.length / 2, src.width);

      // Border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-src.length / 2, -src.width / 2, src.length, src.width);

      // Labels
      ctx.fillStyle = "#080b11";
      ctx.font = "bold 11px Outfit";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("N", src.length / 4, 0);
      ctx.fillText("S", -src.length / 4, 0);

    } else if (src.type === "wire") {
      // Bounding box selection
      if (src === selectedSource) {
        ctx.strokeStyle = "rgba(0, 242, 254, 0.8)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, src.r + 3, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Circle Wire body
      ctx.fillStyle = "#ffb86c";
      ctx.beginPath();
      ctx.arc(0, 0, src.r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.stroke();

      // Current Direction symbols
      ctx.fillStyle = "#080b11";
      ctx.strokeStyle = "#080b11";
      ctx.lineWidth = 2.5;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "14px Outfit";

      if (src.current >= 0) {
        // Dot (.) representing current out of page
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Cross (X) representing current into page
        ctx.beginPath();
        ctx.moveTo(-5, -5);
        ctx.lineTo(5, 5);
        ctx.moveTo(5, -5);
        ctx.lineTo(-5, 5);
        ctx.stroke();
      }

    } else if (src.type === "solenoid") {
      const rad = (src.angle * Math.PI) / 180;
      ctx.rotate(rad);

      // Selection bounds
      if (src === selectedSource) {
        ctx.strokeStyle = "rgba(0, 242, 254, 0.8)";
        ctx.lineWidth = 3;
        ctx.strokeRect(-src.length / 2 - 3, -24, src.length + 6, 48);
      }

      // Draw solenoid coil loops
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      const step = src.length / (src.loops - 1 || 1);
      for (let i = 0; i < src.loops; i++) {
        const lx = -src.length / 2 + i * step;
        ctx.beginPath();
        ctx.moveTo(lx, -20);
        ctx.bezierCurveTo(lx + step/2, -10, lx + step/2, 10, lx, 20);
        ctx.stroke();
      }

      // Solenoid Core outline bar
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(-src.length / 2, -15, src.length, 30);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-src.length / 2, -15, src.length, 30);
      
      // Labels
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px Outfit";
      ctx.fillText("SOLENOID", -22, 3);
    }

    ctx.restore();
  });
}

// Draw Compass Sensor Probe
function drawCompassProbe() {
  if (!drawProbe) return;

  ctx.save();
  ctx.translate(probe.x, probe.y);

  // Outer ring
  ctx.fillStyle = "rgba(10, 14, 23, 0.85)";
  ctx.beginPath();
  ctx.arc(0, 0, probe.r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw alignment needle
  const field = calculateTotalField(probe.x, probe.y);
  const angle = Math.atan2(field.by, field.bx);
  ctx.rotate(angle);

  // North needle side (Cyan)
  ctx.fillStyle = "#00f2fe";
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(probe.r - 5, 0);
  ctx.lineTo(0, 4);
  ctx.fill();

  // South needle side (Red)
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(-(probe.r - 5), 0);
  ctx.lineTo(0, 4);
  ctx.fill();

  ctx.restore();
}

// Draw Charged Particles trails
function drawParticles() {
  ctx.lineWidth = 2.5;

  particles.forEach(p => {
    // 1. Draw glowing trail lines
    if (p.trail.length > 1) {
      ctx.strokeStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let i = 1; i < p.trail.length; i++) {
        ctx.lineTo(p.trail[i].x, p.trail[i].y);
      }
      ctx.stroke();
    }

    // 2. Draw active particle dot
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

// Physics Loop Ticks
let lastFrameTime = Date.now();
function tick() {
  const now = Date.now();
  const dt = (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  // FPS metric counter
  const fps = Math.round(1 / (dt || 0.001));
  metricFps.textContent = `${fps} FPS`;

  // 1. Refresh background frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid references overlay
  ctx.strokeStyle = "rgba(255,255,255,0.01)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 2. Compute physics integrations
  if (isPlaying) {
    // Limit dt updates to avoid breaks
    const stepDt = Math.min(dt, 0.03) * 60; // scale physics updates
    particles.forEach((p, idx) => {
      p.update(stepDt, calculateTotalField);
    });

    // Filter off-screen particles
    particles = particles.filter(p => 
      p.x > -50 && p.x < canvas.width + 50 &&
      p.y > -50 && p.y < canvas.height + 50
    );
    metricParticles.textContent = particles.length;
  }

  // 3. Render Layers
  if (drawVectors) drawVectorArrowsGrid();
  if (drawFieldLines) drawFieldLinesCurves();
  
  drawSources();
  drawCompassProbe();
  drawParticles();

  // 4. Update HUD
  updateSensorHUD();

  requestAnimationFrame(tick);
}

// Logging diagnostic message
function addConsoleLog(source, message, type = "system") {
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-source">[${source}]</span> ${message}`;
  consoleLogs.appendChild(entry);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

// Boot application
window.addEventListener("DOMContentLoaded", () => {
  initSimulator();
});
