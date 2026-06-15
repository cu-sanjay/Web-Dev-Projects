/**
 * Rocket Launch Simulator & Visualizer
 * Core Flight Dynamics & Telemetry Plotter
 */

// Earth & Physics Constants
const RE = 6371000;          // Earth radius in meters
const ME = 5.972e24;         // Earth mass in kg
const G_CONST = 6.6743e-11;   // Gravitational constant
const RHO_0 = 1.225;         // Sea-level atmospheric density in kg/m³
const SCALE_HEIGHT = 8500;   // Atmosphere scale height in meters
const G0 = 9.80665;          // Standard gravitational acceleration m/s²
const CD = 0.28;             // Aerodynamic drag coefficient
const AREA = 9.6;            // Cross-sectional core area in m²

// Flight state variables
let flightState = 'PRE_LAUNCH'; // PRE_LAUNCH | COUNTDOWN | STAGE1_ACTIVE | STAGE1_COAST | STAGE2_ACTIVE | ORBITAL | CRASHED | ABORTED
let countdownTime = 5;          // Seconds before ignition
let flightTime = 0;             // Time since liftoff (seconds)
let timeWarp = 1;
let isPaused = false;


// Rocket Kinematics
let altitude = 0;            // Altitude above sea level (meters)
let downrange = 0;           // Horizontal distance from launchpad (meters)
let vx = 0;                  // Velocity X (m/s)
let vy = 0;                  // Velocity Y (m/s)
let mass = 0;                // Total rocket mass (kg)
let thrustForce = 0;         // Thrust (N)
let dragForce = 0;           // Drag (N)
let accelX = 0, accelY = 0;  // Acceleration (m/s²)
let gforce = 1.0;            // G-Force felt
let qPress = 0;              // Dynamic pressure (Pa)

// Rocket Configuration State
let s1_fuelMax = 40000;
let s1_fuel = 40000;
let s1_dry = 5000;
let s1_thrust = 820000;      // Stage 1 sea-level booster thrust (N)
let s1_isp = 282;            // Stage 1 specific impulse (seconds)
let s1_burnRate = 0;

let s2_fuelMax = 12000;
let s2_fuel = 12000;
let s2_dry = 1500;
let s2_thrust = 115000;      // Stage 2 vacuum sustainer thrust (N)
let s2_isp = 348;            // Stage 2 specific impulse (seconds)
let s2_burnRate = 0;

let payloadMass = 1500;      // Satellite payload mass (kg)
let throttle = 1.0;          // Engine throttle scale (0.0 to 1.0)
let steeringAngle = 90;      // Pitch steering angle in degrees (90° is straight up)

// Max-Q indicators
let maxQVal = 0;
let maxQAlt = 0;
let maxQTime = 0;
let maxQLogged = false;

// History points for telemetry charts
let trajectoryHistory = [];  // Array of {x: downrange(km), y: altitude(km)}
let velocityHistory = [];    // Array of {x: time(s), y: speed(km/s)}

// Stage release debris animations
let debris = [];

// DOM Elements
let canvas, ctx;
let hudAltitude, hudVelocity, hudDownrange, hudGforce;
let inputThrottle, valThrottle;
let inputSteering, valSteering;
let btnIgnition, btnSeparate, btnAbort;
let inputS1Fuel, inputS1Dry, inputS2Fuel, inputS2Dry, selectPayload;
let simStatusText, statusDot, maxqBadge;
let hudValQ, hudValAcc, hudValS1Fuel, hudValS2Fuel;
let btnPresetLeo, btnPresetSuborbital, btnPresetHeavy;
let canvasTrajectory, canvasVelocity, ctxTrajectory, ctxVelocity;
let btnPausePlay, playPauseIcon, playPauseText, selectWarp, btnResetFlight, consoleLogs;

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

// Map payload configuration selection
function getPayloadMass() {
  const pType = selectPayload.value;
  if (pType === 'weather') return 1500;
  if (pType === 'lunar') return 4000;
  if (pType === 'telescope') return 6000;
  return 1500;
}

// Sync specifications input forms with variables
function updateSpecConfig() {
  if (flightState !== 'PRE_LAUNCH') return;
  s1_fuelMax = parseFloat(inputS1Fuel.value);
  s1_fuel = s1_fuelMax;
  s1_dry = parseFloat(inputS1Dry.value);
  s1_burnRate = s1_thrust / (s1_isp * G0);
  
  s2_fuelMax = parseFloat(inputS2Fuel.value);
  s2_fuel = s2_fuelMax;
  s2_dry = parseFloat(inputS2Dry.value);
  s2_burnRate = s2_thrust / (s2_isp * G0);
  
  payloadMass = getPayloadMass();
  mass = s1_fuel + s1_dry + s2_fuel + s2_dry + payloadMass;
}

// 2D Flight Equations Solver (Runge-Kutta/Euler step)
function updateFlightDynamics(dtStep) {
  // 1. Gravity Vector (decreases with altitude, points towards Earth center)
  // Position coordinate is relative to Earth center: X=downrange, Y=altitude+RE
  const rx = downrange;
  const ry = altitude + RE;
  const dist = Math.sqrt(rx * rx + ry * ry);
  
  // Gravitational acceleration magnitude: g = G * ME / dist^2
  const gMag = (G_CONST * ME) / (dist * dist);
  const gx = -gMag * (rx / dist);
  const gy = -gMag * (ry / dist);
  
  // 2. Atmospheric Density & Aerodynamic Drag
  const density = RHO_0 * Math.exp(-altitude / SCALE_HEIGHT);
  const speed = Math.sqrt(vx * vx + vy * vy);
  
  // Dynamic Pressure: q = 0.5 * rho * v^2
  qPress = 0.5 * density * speed * speed;
  
  // Peak dynamic pressure logging
  if (flightState.startsWith('STAGE') && qPress > maxQVal) {
    maxQVal = qPress;
    maxQAlt = altitude;
    maxQTime = flightTime;
  }
  
  // Trigger Max-Q badge warning at peak stress window (altitude between 10km and 20km)
  if (altitude > 10000 && altitude < 18000 && qPress > 15000) {
    maxqBadge.classList.remove('hidden');
    if (!maxQLogged) {
      logToConsole('Max-Q reached! Structural load peaking.', 'danger');
      maxQLogged = true;
    }
  } else {
    maxqBadge.classList.add('hidden');
  }
  
  // Drag Force vector (opposes velocity direction)
  let fDx = 0, fDy = 0;
  if (speed > 0.1) {
    const fDragMag = 0.5 * CD * AREA * density * speed * speed;
    fDx = -fDragMag * (vx / speed);
    fDy = -fDragMag * (vy / speed);
    dragForce = fDragMag;
  } else {
    dragForce = 0;
  }
  
  // 3. Engine Thrust calculations
  let fTx = 0, fTy = 0;
  thrustForce = 0;
  const radAngle = (steeringAngle * Math.PI) / 180;
  
  if (flightState === 'STAGE1_ACTIVE' && s1_fuel > 0) {
    // Stage 1 engine burning
    thrustForce = s1_thrust * throttle;
    s1_fuel -= s1_burnRate * throttle * dtStep;
    if (s1_fuel <= 0) {
      s1_fuel = 0;
      flightState = 'STAGE1_COAST';
      btnSeparate.classList.remove('hidden');
      logToConsole('Stage 1 fuel depleted. MECO (Main Engine Cutoff).', 'warning');
    }
  } else if (flightState === 'STAGE2_ACTIVE' && s2_fuel > 0) {
    // Stage 2 engine burning
    thrustForce = s2_thrust * throttle;
    s2_fuel -= s2_burnRate * throttle * dtStep;
    if (s2_fuel <= 0) {
      s2_fuel = 0;
      logToConsole('Stage 2 fuel depleted. SECO (Second Engine Cutoff).', 'warning');
    }
  }
  
  if (thrustForce > 0) {
    fTx = thrustForce * Math.cos(radAngle);
    fTy = thrustForce * Math.sin(radAngle);
  }
  
  // 4. Update Mass
  if (flightState === 'STAGE1_ACTIVE' || flightState === 'STAGE1_COAST') {
    mass = s1_dry + s1_fuel + s2_dry + s2_fuel + payloadMass;
  } else {
    // Stage 1 booster is jettisoned
    mass = s2_dry + s2_fuel + payloadMass;
  }
  
  // 5. Acceleration: F_net / M
  accelX = (fTx + fDx) / mass + gx;
  accelY = (fTy + fDy) / mass + gy;
  
  // 6. G-Force (F_felt / M / g0)
  const feltForceX = fTx + fDx;
  const feltForceY = fTy + fDy;
  const accelFelt = Math.sqrt(feltForceX * feltForceX + feltForceY * feltForceY) / mass;
  gforce = Math.max(0, accelFelt / G0);
  
  // 7. Integrate Velocity & Position
  vx += accelX * dtStep;
  vy += accelY * dtStep;
  
  downrange += vx * dtStep;
  altitude += vy * dtStep;
  
  // Boundary clamps (Ground impact check)
  if (altitude <= 0) {
    altitude = 0;
    
    if (flightState.startsWith('STAGE')) {
      if (vy < -12) {
        flightState = 'CRASHED';
        logToConsole(`Rocket crashed. Impact velocity: ${Math.abs(vy).toFixed(1)} m/s`, 'danger');
      } else {
        flightState = 'PRE_LAUNCH';
        vx = 0; vy = 0; downrange = 0;
        logToConsole('Rocket soft landed.', 'success');
      }
    }
  }
  
  // 8. Orbital insertion verification check
  // Orbit is circularized if at space altitude (> 130km) and horizontal orbital speed reached
  if (altitude > 130000 && Math.abs(vx) >= 7700 && flightState === 'STAGE2_ACTIVE') {
    flightState = 'ORBITAL';
    logToConsole(`Orbital Insertion Successful! Altitude: ${(altitude/1000).toFixed(1)} km, Speed: ${(speed/1000).toFixed(2)} km/s`, 'success');
    logToConsole('Payload satellite successfully deployed.', 'success');
  }
  
  // Decay separated booster debris
  debris.forEach((d, idx) => {
    d.x += d.vx * dtStep;
    d.y += d.vy * dtStep;
    
    // Debris falls under gravity
    const dDist = Math.hypot(d.x, d.y + RE);
    const dgMag = (G_CONST * ME) / (dDist * dDist);
    d.vy -= dgMag * dtStep;
    
    d.life--;
    if (d.life <= 0) debris.splice(idx, 1);
  });
}

// Telemetry History Plotter
function updateCharts() {
  if (flightState === 'PRE_LAUNCH') {
    trajectoryHistory = [];
    velocityHistory = [];
    return;
  }
  
  // Save points to array
  trajectoryHistory.push({ x: downrange / 1000, y: altitude / 1000 });
  
  const currentSpeed = Math.sqrt(vx * vx + vy * vy);
  velocityHistory.push({ x: flightTime, y: currentSpeed / 1000 });
  
  // Limit points to prevent chart lag
  if (trajectoryHistory.length > 500) trajectoryHistory.shift();
  if (velocityHistory.length > 500) velocityHistory.shift();
  
  // Renders the curves
  drawTrajectoryChart();
  drawVelocityChart();
}

function drawTrajectoryChart() {
  const w = canvasTrajectory.width;
  const h = canvasTrajectory.height;
  ctxTrajectory.fillStyle = '#020306';
  ctxTrajectory.fillRect(0, 0, w, h);
  
  if (trajectoryHistory.length < 2) return;
  
  // Find limits
  let maxX = 10;
  let maxY = 10;
  trajectoryHistory.forEach(pt => {
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  });
  
  ctxTrajectory.strokeStyle = '#00f2fe';
  ctxTrajectory.lineWidth = 1.5;
  ctxTrajectory.beginPath();
  
  trajectoryHistory.forEach((pt, i) => {
    const cx = (pt.x / maxX) * (w - 20) + 10;
    const cy = h - (pt.y / maxY) * (h - 20) - 10;
    if (i === 0) ctxTrajectory.moveTo(cx, cy);
    else ctxTrajectory.lineTo(cx, cy);
  });
  ctxTrajectory.stroke();
  
  // Label values
  ctxTrajectory.fillStyle = 'rgba(255,255,255,0.4)';
  ctxTrajectory.font = '8px Share Tech Mono';
  ctxTrajectory.fillText(`Max Alt: ${maxY.toFixed(0)} km`, 6, 12);
  ctxTrajectory.fillText(`Downrange: ${maxX.toFixed(0)} km`, w - 90, h - 6);
}

function drawVelocityChart() {
  const w = canvasVelocity.width;
  const h = canvasVelocity.height;
  ctxVelocity.fillStyle = '#020306';
  ctxVelocity.fillRect(0, 0, w, h);
  
  if (velocityHistory.length < 2) return;
  
  let maxX = 30;
  let maxY = 1;
  velocityHistory.forEach(pt => {
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  });
  
  ctxVelocity.strokeStyle = '#10b981';
  ctxVelocity.lineWidth = 1.5;
  ctxVelocity.beginPath();
  
  velocityHistory.forEach((pt, i) => {
    const cx = (pt.x / maxX) * (w - 20) + 10;
    const cy = h - (pt.y / maxY) * (h - 20) - 10;
    if (i === 0) ctxVelocity.moveTo(cx, cy);
    else ctxVelocity.lineTo(cx, cy);
  });
  ctxVelocity.stroke();
  
  ctxVelocity.fillStyle = 'rgba(255,255,255,0.4)';
  ctxVelocity.font = '8px Share Tech Mono';
  ctxVelocity.fillText(`Max Speed: ${maxY.toFixed(2)} km/s`, 6, 12);
  ctxVelocity.fillText(`Time: ${maxX.toFixed(0)} s`, w - 60, h - 6);
}

// Render the 2D rocket ascent visualizer
function drawScene() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  // 1. Dynamic sky background colors based on altitude
  // 0km: Bright sky blue. 25km: Deep Indigo. 80km+: Pitch black space
  let gradient = ctx.createLinearGradient(0, 0, 0, height);
  if (altitude < 20000) {
    const t = altitude / 20000;
    const r = Math.floor(16 + (4 - 16) * t);
    const g = Math.floor(134 + (10 - 134) * t);
    const b = Math.floor(242 + (28 - 242) * t);
    gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    gradient.addColorStop(1, '#66b2ff');
  } else if (altitude < 80000) {
    const t = (altitude - 20000) / 60000;
    const r = Math.floor(4 * (1 - t));
    const g = Math.floor(10 * (1 - t));
    const b = Math.floor(28 * (1 - t));
    gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    gradient.addColorStop(1, '#060a1c');
  } else {
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#03050a');
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Draw space stars when high enough
  if (altitude > 40000) {
    const starOpacity = Math.min(1.0, (altitude - 40000) / 40000);
    ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity * 0.45})`;
    
    // Pseudo-random star coordinates
    for (let s = 0; s < 50; s++) {
      const sx = (s * 333 + 45) % width;
      const sy = (s * 543 + 77) % height;
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }
  }
  
  // 2. Earth curvature horizon line representation
  if (altitude < 100000) {
    const earthDepth = height - (altitude / 100000) * height * 0.5;
    ctx.fillStyle = '#012809'; // Dark forest green Earth boundary
    ctx.beginPath();
    ctx.arc(width / 2, height + RE / 100, RE / 100 - (height - earthDepth), 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw launching pad structures if rocket is near ground
    if (altitude < 400) {
      const groundY = height - (RE / 100 - (height - earthDepth)) + 15;
      const padY = height - 15 - (altitude / 400) * 80;
      
      ctx.fillStyle = '#334155';
      ctx.fillRect(width / 2 - 30, padY, 4, 80); // launching tower
      ctx.fillRect(width / 2 - 15, padY + 70, 30, 10); // launcher base
    }
  }
  
  // 3. Render Rocket Debris (booster shell separation)
  debris.forEach(d => {
    ctx.save();
    ctx.translate(d.x - downrange + width/2, height/2 - (d.y - altitude));
    ctx.rotate((d.life * 4 * Math.PI) / 180);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-2, -8, 4, 16);
    ctx.restore();
  });
  
  // 4. Render active Rocket Body
  ctx.save();
  ctx.translate(width / 2, height / 2);
  
  // Rotate rocket orientation to match pitch angle
  // Pitch slider: 90 is straight up, 0 is horizontal right.
  // Rotational coordinates: 0 rad is pointing straight up.
  const visualAngle = (90 - steeringAngle) * Math.PI / 180;
  ctx.rotate(visualAngle);
  
  // Drawing parameters
  const rWidth = 8;
  const rHeight = 35;
  
  // Draw flame exhaust plume if throttle active and fuels left
  const currentFuel = (flightState === 'STAGE1_ACTIVE') ? s1_fuel : (flightState === 'STAGE2_ACTIVE') ? s2_fuel : 0;
  if (throttle > 0 && currentFuel > 0 && flightState.startsWith('STAGE')) {
    // Thrust nozzle flames. Exhaust expands larger in vacuum (thin atmosphere)
    const density = RHO_0 * Math.exp(-altitude / SCALE_HEIGHT);
    const expansion = Math.max(1.0, 3.5 - (density / RHO_0) * 2.5);
    const fLen = 15 + throttle * 25 * (1 + Math.random() * 0.3);
    const fWid = (rWidth * 0.7) * expansion;
    
    const flameGrad = ctx.createLinearGradient(0, rHeight/2, 0, rHeight/2 + fLen);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.2, '#ffcc00'); // Yellow
    flameGrad.addColorStop(0.6, '#ff3300'); // Orange-Red
    flameGrad.addColorStop(1, 'rgba(255, 51, 0, 0)');
    
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-fWid, rHeight / 2);
    ctx.lineTo(fWid, rHeight / 2);
    ctx.lineTo(0, rHeight / 2 + fLen);
    ctx.closePath();
    ctx.fill();
  }
  
  // Rocket Shell body
  ctx.fillStyle = '#f8fafc'; // White body casing
  ctx.fillRect(-rWidth / 2, -rHeight / 2, rWidth, rHeight);
  
  // Nose Cone (cone head)
  ctx.fillStyle = '#ef4444'; // Red nose
  ctx.beginPath();
  ctx.moveTo(-rWidth / 2, -rHeight / 2);
  ctx.lineTo(rWidth / 2, -rHeight / 2);
  ctx.lineTo(0, -rHeight / 2 - 8);
  ctx.closePath();
  ctx.fill();
  
  // Stage 2 dividing marker line
  if (flightState === 'STAGE1_ACTIVE' || flightState === 'STAGE1_COAST') {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-rWidth / 2, -rHeight / 6);
    ctx.lineTo(rWidth / 2, -rHeight / 6);
    ctx.stroke();
    
    // Stage 1 markings
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 6px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.fillText('S1', 0, rHeight/4);
  }
  
  ctx.restore();
  
  // 5. Draw dynamic vector information indicators
  if (flightState.startsWith('STAGE')) {
    // Draw small steering indicator compass
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(width - 50, height - 50, 22, 0, 2 * Math.PI);
    ctx.stroke();
    
    const radAngle = (steeringAngle * Math.PI) / 180;
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width - 50, height - 50);
    ctx.lineTo(width - 50 + Math.cos(radAngle) * 20, height - 50 - Math.sin(radAngle) * 20);
    ctx.stroke();
  }
}

// Setup Telemetry HUD display
function updateHUD() {
  const speed = Math.sqrt(vx * vx + vy * vy);
  
  hudAltitude.textContent = `${(altitude / 1000).toFixed(2)} km`;
  hudVelocity.textContent = `${(speed / 1000).toFixed(2)} km/s`;
  hudDownrange.textContent = `${(downrange / 1000).toFixed(2)} km`;
  hudGforce.textContent = `${gforce.toFixed(2)} G`;
  
  hudValQ.textContent = `${(qPress / 1000).toFixed(2)} kPa`;
  hudValAcc.textContent = `${Math.hypot(accelX, accelY).toFixed(2)} m/s²`;
  
  // Fuel Bars
  const s1Pct = Math.round((s1_fuel / s1_fuelMax) * 100);
  hudValS1Fuel.style.width = `${s1Pct}%`;
  hudValS1Fuel.textContent = `${s1Pct}%`;
  
  const s2Pct = Math.round((s2_fuel / s2_fuelMax) * 100);
  hudValS2Fuel.style.width = `${s2Pct}%`;
  hudValS2Fuel.textContent = `${s2Pct}%`;
}

// Active button handlers
function launchRocket() {
  if (flightState !== 'PRE_LAUNCH') return;
  updateSpecConfig();
  
  flightState = 'COUNTDOWN';
  countdownTime = 5;
  logToConsole('Ignition sequence initiated. T-minus 5 seconds.', 'warning');
  
  const countdownInterval = setInterval(() => {
    if (flightState !== 'COUNTDOWN') {
      clearInterval(countdownInterval);
      return;
    }
    countdownTime--;
    if (countdownTime > 0) {
      logToConsole(`T-minus ${countdownTime}...`, 'warning');
    } else {
      clearInterval(countdownInterval);
      flightState = 'STAGE1_ACTIVE';
      flightTime = 0;
      maxQVal = 0;
      maxQLogged = false;
      logToConsole('IGNITION! Liftoff! We have a liftoff.', 'success');
      btnIgnition.classList.add('hidden');
    }
  }, 1000);
}

// Stage Separation execution
function triggerStageSeparation() {
  if (flightState === 'STAGE1_COAST' || flightState === 'STAGE1_ACTIVE') {
    flightState = 'STAGE2_ACTIVE';
    btnSeparate.classList.add('hidden');
    
    // Inject booster separation debris particles
    const radAngle = (steeringAngle * Math.PI) / 180;
    // Jettison booster backwards relative to angle
    const bx = downrange - Math.cos(radAngle) * 5;
    const by = altitude - Math.sin(radAngle) * 5;
    
    debris.push({
      x: bx,
      y: by,
      vx: vx - Math.cos(radAngle) * 1.5,
      vy: vy - Math.sin(radAngle) * 1.5,
      life: 180
    });
    
    logToConsole('Booster staging confirmed. Stage 1 separated.', 'success');
    logToConsole('Stage 2 sustainer ignited.', 'info');
  }
}

// Flight Abort destruct
function triggerAbort() {
  if (flightState === 'PRE_LAUNCH' || flightState === 'CRASHED' || flightState === 'ABORTED') return;
  flightState = 'ABORTED';
  btnSeparate.classList.add('hidden');
  btnIgnition.classList.remove('hidden');
  
  // Inject massive debris fields
  const radAngle = (steeringAngle * Math.PI) / 180;
  for (let i = 0; i < 8; i++) {
    debris.push({
      x: downrange,
      y: altitude,
      vx: vx + (Math.random() - 0.5) * 8,
      vy: vy + (Math.random() - 0.5) * 8,
      life: 120 + Math.random() * 60
    });
  }
  
  vx = 0; vy = 0;
  logToConsole('FLIGHT TERMINATION COMMAND RECEIVED. Self-destruct activated.', 'danger');
}

// Load Presets
function loadPreset(type) {
  flightState = 'PRE_LAUNCH';
  btnIgnition.classList.remove('hidden');
  btnSeparate.classList.add('hidden');
  
  vx = 0; vy = 0; downrange = 0; altitude = 0;
  trajectoryHistory = [];
  velocityHistory = [];
  
  if (type === 'leo') {
    inputS1Fuel.value = 45000;
    inputS1Dry.value = 5000;
    inputS2Fuel.value = 14000;
    inputS2Dry.value = 1500;
    selectPayload.value = 'weather';
    logToConsole('Preset loaded: LEO satellite insertion setup.', 'info');
  } else if (type === 'suborbital') {
    inputS1Fuel.value = 15000;
    inputS1Dry.value = 3000;
    inputS2Fuel.value = 4000;
    inputS2Dry.value = 800;
    selectPayload.value = 'weather';
    logToConsole('Preset loaded: Suborbital booster hopper test configuration.', 'info');
  } else if (type === 'heavy') {
    inputS1Fuel.value = 65000;
    inputS1Dry.value = 8000;
    inputS2Fuel.value = 22000;
    inputS2Dry.value = 2500;
    selectPayload.value = 'lunar';
    logToConsole('Preset loaded: Heavy cargo lunar launcher (higher payload mass require high fuel burn).', 'info');
  }
  
  updateSpecConfig();
}

// Reset Flight variables
function resetFlight() {
  flightState = 'PRE_LAUNCH';
  btnIgnition.classList.remove('hidden');
  btnSeparate.classList.add('hidden');
  vx = 0; vy = 0; downrange = 0; altitude = 0;
  trajectoryHistory = [];
  velocityHistory = [];
  debris = [];
  
  inputThrottle.value = 100;
  throttle = 1.0;
  valThrottle.textContent = '100%';
  
  inputSteering.value = 90;
  steeringAngle = 90;
  valSteering.textContent = '90° (Vertical)';
  
  updateSpecConfig();
  logToConsole('Launch deck reset. Rocket returned to launcher pad.', 'warning');
}

// Simulation Tick cycle
function tick() {
  const currentWarp = parseInt(selectWarp.value);
  const baseDT = 0.018; // base integration dt (seconds)
  
  if (!isPaused) {
    if (flightState.startsWith('STAGE') || flightState === 'ORBITAL' || flightState === 'ABORTED') {
      // Run integration steps matching time warp
      for (let w = 0; w < currentWarp; w++) {
        updateFlightDynamics(baseDT);
        flightTime += baseDT;
      }
    }
  }
  
  // Render Scene
  drawScene();
  updateHUD();
  updateCharts();
  
  // Update status labels
  statusDot.className = 'badge-dot pulse ';
  if (flightState === 'PRE_LAUNCH') {
    simStatusText.textContent = 'Flight Deck: PRE-FLIGHT';
    statusDot.style.backgroundColor = '#94a3b8'; // grey
  } else if (flightState === 'COUNTDOWN') {
    simStatusText.textContent = `T-MINUS ${countdownTime}s`;
    statusDot.style.backgroundColor = '#f59e0b'; // orange
  } else if (flightState === 'STAGE1_ACTIVE') {
    simStatusText.textContent = 'STAGE 1 BOOSTING';
    statusDot.style.backgroundColor = '#00f2fe'; // cyan
  } else if (flightState === 'STAGE1_COAST') {
    simStatusText.textContent = 'STAGE 1 COASTING (MECO)';
    statusDot.style.backgroundColor = '#e2e8f0';
  } else if (flightState === 'STAGE2_ACTIVE') {
    simStatusText.textContent = 'STAGE 2 SUSTAINER BURNING';
    statusDot.style.backgroundColor = '#ff007f'; // magenta
  } else if (flightState === 'ORBITAL') {
    simStatusText.textContent = 'ORBIT ACHIEVED';
    statusDot.style.backgroundColor = '#10b981'; // green
  } else if (flightState === 'CRASHED') {
    simStatusText.textContent = 'VEHICLE LOST (CRASHED)';
    statusDot.style.backgroundColor = '#ef4444'; // red
  } else if (flightState === 'ABORTED') {
    simStatusText.textContent = 'VEHICLE JETTISONED (ABORT)';
    statusDot.style.backgroundColor = '#ef4444';
  }
  
  requestAnimationFrame(tick);
}

// Bind HTML events
document.addEventListener('DOMContentLoaded', () => {
  // Bind Telemetry HUD DOM
  hudAltitude = document.getElementById('hud-altitude');
  hudVelocity = document.getElementById('hud-velocity');
  hudDownrange = document.getElementById('hud-downrange');
  hudGforce = document.getElementById('hud-gforce');
  
  inputThrottle = document.getElementById('input-throttle');
  valThrottle = document.getElementById('val-throttle');
  inputSteering = document.getElementById('input-steering');
  valSteering = document.getElementById('val-steering');
  
  btnIgnition = document.getElementById('btn-ignition');
  btnSeparate = document.getElementById('btn-separate');
  btnAbort = document.getElementById('btn-abort');
  
  inputS1Fuel = document.getElementById('input-s1-fuel');
  inputS1Dry = document.getElementById('input-s1-dry');
  inputS2Fuel = document.getElementById('input-s2-fuel');
  inputS2Dry = document.getElementById('input-s2-dry');
  selectPayload = document.getElementById('select-payload');
  
  simStatusText = document.getElementById('sim-status-text');
  statusDot = document.getElementById('status-dot');
  maxqBadge = document.getElementById('maxq-badge');
  
  hudValQ = document.getElementById('hud-val-q');
  hudValAcc = document.getElementById('hud-val-acc');
  hudValS1Fuel = document.getElementById('hud-val-s1-fuel');
  hudValS2Fuel = document.getElementById('hud-val-s2-fuel');
  
  btnPresetLeo = document.getElementById('btn-preset-leo');
  btnPresetSuborbital = document.getElementById('btn-preset-suborbital');
  btnPresetHeavy = document.getElementById('btn-preset-heavy');
  
  // Analytics charts setup
  canvasTrajectory = document.getElementById('chart-trajectory');
  ctxTrajectory = canvasTrajectory.getContext('2d');
  
  canvasVelocity = document.getElementById('chart-velocity');
  ctxVelocity = canvasVelocity.getContext('2d');
  
  btnPausePlay = document.getElementById('btn-pause-play');
  playPauseIcon = document.getElementById('play-pause-icon');
  playPauseText = document.getElementById('play-pause-text');
  selectWarp = document.getElementById('select-warp');
  btnResetFlight = document.getElementById('btn-reset-flight');
  consoleLogs = document.getElementById('console-logs');
  
  // Canvas Setup
  canvas = document.getElementById('sim-canvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Slider listeners
  inputThrottle.addEventListener('input', () => {
    throttle = parseFloat(inputThrottle.value) / 100;
    valThrottle.textContent = `${inputThrottle.value}%`;
  });
  
  inputSteering.addEventListener('input', () => {
    steeringAngle = parseInt(inputSteering.value);
    let stText = `${steeringAngle}°`;
    if (steeringAngle === 90) stText += ' (Vertical)';
    else if (steeringAngle === 0) stText += ' (Horizontal)';
    valSteering.textContent = stText;
  });
  
  // Specs change handlers
  [inputS1Fuel, inputS1Dry, inputS2Fuel, inputS2Dry, selectPayload].forEach(el => {
    el.addEventListener('change', updateSpecConfig);
  });
  
  // Actions
  btnIgnition.addEventListener('click', launchRocket);
  btnSeparate.addEventListener('click', triggerStageSeparation);
  btnAbort.addEventListener('click', triggerAbort);
  
  // Presets
  btnPresetLeo.addEventListener('click', () => loadPreset('leo'));
  btnPresetSuborbital.addEventListener('click', () => loadPreset('suborbital'));
  btnPresetHeavy.addEventListener('click', () => loadPreset('heavy'));
  
  // Simulator state triggers
  btnPausePlay.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      btnPausePlay.classList.add('paused');
      playPauseIcon.textContent = '▶️';
      playPauseText.textContent = 'Resume physics';
      logToConsole('Ascent calculations suspended.', 'warning');
    } else {
      btnPausePlay.classList.remove('paused');
      playPauseIcon.textContent = '⏸️';
      playPauseText.textContent = 'Pause physics';
      logToConsole('Ascent calculations resumed.', 'info');
    }
  });
  
  btnResetFlight.addEventListener('click', resetFlight);
  
  // Initialize specifications
  updateSpecConfig();
  
  // Start loop
  tick();
});

function resizeCanvas() {
  const rect = canvas.parentNode.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
}
