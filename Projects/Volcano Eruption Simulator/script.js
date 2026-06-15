/* VOLCANO-OS // Volcano Eruption Simulator Engine */

// DOM Elements
const eruptionPresetSelect = document.getElementById('eruption-preset');
const telemetryVei = document.getElementById('telemetry-vei');
const telemetryPressureFill = document.getElementById('telemetry-pressure-fill');
const telemetryPressureVal = document.getElementById('telemetry-pressure-val');
const sliderViscosity = document.getElementById('slider-viscosity');
const valViscosity = document.getElementById('val-viscosity');
const sliderGas = document.getElementById('slider-gas');
const valGas = document.getElementById('val-gas');
const sliderVent = document.getElementById('slider-vent');
const valVent = document.getElementById('val-vent');
const sliderWind = document.getElementById('slider-wind');
const valWind = document.getElementById('val-wind');
const togglePressurize = document.getElementById('toggle-pressurize');
const btnErupt = document.getElementById('btn-erupt');
const btnCool = document.getElementById('btn-cool');
const statusIndicator = document.getElementById('system-status-indicator');
const volcanoCanvas = document.getElementById('volcano-canvas');
const telemetryPlumeVel = document.getElementById('telemetry-plume-vel');
const telemetryFlowRate = document.getElementById('telemetry-flow-rate');
const telemetryTemp = document.getElementById('telemetry-temp');
const seismographCanvas = document.getElementById('seismograph-canvas');
const seismicAlarmHud = document.getElementById('seismic-alarm-hud');
const lblTremorAmp = document.getElementById('lbl-tremor-amp');
const lblTremorFreq = document.getElementById('lbl-tremor-freq');
const hazardsAlertLog = document.getElementById('hazards-alert-log');
const shakeEnvelope = document.getElementById('shake-envelope');

// Canvas Contexts
const ctx = volcanoCanvas.getContext('2d');
const sCtx = seismographCanvas.getContext('2d');

// Simulation parameters
let viscosity = 1;      // 1: Low, 2: Medium, 3: High
let gasContent = 15;    // 5% to 100%
let ventDiameter = 15;  // 5m to 50m
let windSpeed = 10;     // -100 km/h (West) to 100 km/h (East)

let pressure = 20;      // 0% to 100% chamber pressure
let isErupting = false;
let currentTemperature = 720; // Starts warm in °C

let frameCount = 0;

// Particle arrays
let magmaBubbles = [];
let lavaParticles = [];
let ashParticles = [];
let pyroclasts = [];
let sparks = [];

// Seism history
let seismicHistory = [];

// Dimension globals
let W = 800;
let H = 500;
let centerX = W / 2;
let craterY = H * 0.45;
let chamberY = H - 80;
const chamberRadius = 35;

// Eruption presets mapping
const presets = {
  hawaiian: {
    viscosity: 1,
    gas: 15,
    vent: 25,
    wind: 10
  },
  strombolian: {
    viscosity: 2,
    gas: 45,
    vent: 15,
    wind: -20
  },
  plinian: {
    viscosity: 3,
    gas: 85,
    vent: 10,
    wind: 40
  }
};

// Canvas Resizing
function resizeCanvases() {
  const parent = volcanoCanvas.parentElement;
  volcanoCanvas.width = parent.clientWidth;
  volcanoCanvas.height = parent.clientHeight || 480;
  W = volcanoCanvas.width;
  H = volcanoCanvas.height;
  
  centerX = W / 2;
  craterY = H * 0.45;
  chamberY = H - 80;
  
  const sParent = seismographCanvas.parentElement;
  seismographCanvas.width = sParent.clientWidth;
  seismographCanvas.height = sParent.clientHeight || 120;
  
  // Keep seismic history padded to match canvas width
  const targetHistoryLength = seismographCanvas.width;
  if (seismicHistory.length < targetHistoryLength) {
    while (seismicHistory.length < targetHistoryLength) {
      seismicHistory.unshift(0);
    }
  } else if (seismicHistory.length > targetHistoryLength) {
    seismicHistory = seismicHistory.slice(seismicHistory.length - targetHistoryLength);
  }
}

// Terrain elevation height solver (Stratovolcano curved silhouette)
function getTerrainHeight(x) {
  const ventRadius = ventDiameter * 0.6;
  const leftLimit = centerX - ventRadius;
  const rightLimit = centerX + ventRadius;
  const bottomY = H - 40;
  
  if (x < leftLimit) {
    const u = (leftLimit - x) / leftLimit; // 0 at vent, 1 at edge
    return craterY + (bottomY - craterY) * Math.pow(u, 1.3);
  } else if (x > rightLimit) {
    const u = (x - rightLimit) / (W - rightLimit); // 0 at vent, 1 at edge
    return craterY + (bottomY - craterY) * Math.pow(u, 1.3);
  } else {
    // inside the crater flat bottom
    return craterY;
  }
}

// Particle factory constructors
function createLavaParticle(side, speedScale = 1.0) {
  const ventRadius = ventDiameter * 0.6;
  const startX = side === 'left' ? centerX - ventRadius : centerX + ventRadius;
  return {
    x: startX + (Math.random() - 0.5) * 4,
    y: craterY,
    side: side,
    speed: (Math.random() * 0.45 + 0.15) * (1.6 / viscosity) / speedScale,
    size: Math.random() * 6 + 5,
    maxLife: Math.random() * 280 + 140,
    life: Math.random() * 280 + 140
  };
}

function createAshParticle(scale = 1.0) {
  const ventRadius = ventDiameter * 0.6;
  const maxLife = (Math.random() * 110 + 70) * (scale + 0.2);
  return {
    x: centerX + (Math.random() - 0.5) * ventRadius * 0.8,
    y: craterY - Math.random() * 6,
    vx: (Math.random() - 0.5) * 1.3 * scale + (windSpeed * 0.015),
    vy: -Math.random() * 1.6 - 1.2,
    size: (Math.random() * 5 + 3) * scale,
    growth: (Math.random() * 0.09 + 0.04) * scale,
    maxLife: maxLife,
    life: maxLife
  };
}

function createPyroclast(scale = 1.0, baseSize = 5) {
  const ventRadius = ventDiameter * 0.6;
  const launchForce = (gasContent * 0.13 + 4.5) * (20 / ventDiameter) * scale;
  return {
    x: centerX + (Math.random() - 0.5) * ventRadius * 0.7,
    y: craterY - 2,
    vx: (Math.random() - 0.5) * launchForce * 0.38 + (windSpeed * 0.025),
    vy: -Math.random() * launchForce - 5,
    size: Math.random() * 4 + baseSize - 2,
    gravity: 0.16,
    drag: 0.99,
    maxLife: Math.random() * 170 + 90,
    life: Math.random() * 170 + 90,
    trail: []
  };
}

// Apply Selected Preset
function applyPreset(presetName) {
  if (presets[presetName]) {
    const p = presets[presetName];
    sliderViscosity.value = p.viscosity;
    sliderGas.value = p.gas;
    sliderVent.value = p.vent;
    sliderWind.value = p.wind;
    
    // Reset simulation particles & tremors on preset reload
    magmaBubbles = [];
    lavaParticles = [];
    ashParticles = [];
    pyroclasts = [];
    sparks = [];
    isErupting = false;
    togglePressurize.checked = true; // Auto-pressurize by default on preset switch
    
    if (presetName === 'hawaiian') {
      pressure = 20;
      currentTemperature = 1120; // basaltic high temp
    } else if (presetName === 'strombolian') {
      pressure = 40;
      currentTemperature = 950;  // andesitic mid temp
    } else if (presetName === 'plinian') {
      pressure = 65;
      currentTemperature = 820;  // rhyolitic lower temp but highly viscous
    }
    
    updateParamsFromSliders();
  }
}

// Update settings readouts from slider elements
function updateParamsFromSliders() {
  viscosity = parseInt(sliderViscosity.value);
  gasContent = parseInt(sliderGas.value);
  ventDiameter = parseInt(sliderVent.value);
  windSpeed = parseInt(sliderWind.value);
  
  if (viscosity === 1) {
    valViscosity.textContent = 'Low (Basaltic)';
    valViscosity.className = 'value text-success';
  } else if (viscosity === 2) {
    valViscosity.textContent = 'Medium (Andesitic)';
    valViscosity.className = 'value text-warning';
  } else {
    valViscosity.textContent = 'High (Rhyolitic)';
    valViscosity.className = 'value text-danger';
  }
  
  valGas.textContent = `${gasContent}%`;
  valVent.textContent = `${ventDiameter} m`;
  
  if (windSpeed > 0) {
    valWind.textContent = `${windSpeed} km/h (East)`;
  } else if (windSpeed < 0) {
    valWind.textContent = `${Math.abs(windSpeed)} km/h (West)`;
  } else {
    valWind.textContent = 'Calm';
  }
}

// Insert Custom option if sliders adjusted away from standard presets
function addCustomOption() {
  let customOption = eruptionPresetSelect.querySelector('option[value="custom"]');
  if (!customOption) {
    customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Custom Settings';
    customOption.disabled = true;
    customOption.hidden = true;
    eruptionPresetSelect.appendChild(customOption);
  }
  eruptionPresetSelect.value = 'custom';
}

// Triggers active eruption cycle
function triggerEruption() {
  if (isErupting) return;
  isErupting = true;
  
  // Burst initial explosive debris
  const numBombs = Math.floor(gasContent * 0.2) + 8;
  for (let i = 0; i < numBombs; i++) {
    pyroclasts.push(createPyroclast(1.2, 5));
  }
  
  // Burst initial ash plume
  const numAsh = Math.floor(gasContent * 0.35) + 12;
  for (let i = 0; i < numAsh; i++) {
    ashParticles.push(createAshParticle(1.3));
  }
  
  // Volcanic sparks flash
  const numSparks = 25;
  for (let i = 0; i < numSparks; i++) {
    const ventRadius = ventDiameter * 0.6;
    sparks.push({
      x: centerX + (Math.random() - 0.5) * ventRadius * 1.1,
      y: craterY - 4,
      vx: (Math.random() - 0.5) * 8 + (windSpeed * 0.02),
      vy: -Math.random() * 7 - 2,
      life: Math.random() * 35 + 20,
      size: Math.random() * 2.5 + 1.2,
      color: '#ffd8a8'
    });
  }
}

// Cool down simulation variables
function coolDown() {
  isErupting = false;
  pressure = 20;
  currentTemperature = 720;
  togglePressurize.checked = false;
  
  magmaBubbles = [];
  lavaParticles = [];
  ashParticles = [];
  pyroclasts = [];
  sparks = [];
  
  shakeEnvelope.classList.remove('shaking-mild', 'shaking-intense');
  seismicAlarmHud.textContent = 'NORMAL';
  seismicAlarmHud.className = 'badge tech-badge';
  
  // Set preset back to custom if modified
  addCustomOption();
}

// Draw indicator dial representing atmospheric wind vector
function drawWindIndicator() {
  ctx.save();
  const indX = W - 55;
  const indY = 45;
  
  // Base dial outline
  ctx.fillStyle = 'rgba(12, 14, 20, 0.65)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(indX, indY, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // cross grids
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.beginPath();
  ctx.moveTo(indX - 24, indY);
  ctx.lineTo(indX + 24, indY);
  ctx.moveTo(indX, indY - 24);
  ctx.lineTo(indX, indY + 24);
  ctx.stroke();
  
  // Wind vector arrow
  const dir = windSpeed >= 0 ? 0 : Math.PI;
  const magnitude = Math.min(21, Math.abs(windSpeed) * 0.21);
  
  if (magnitude > 1) {
    const arrowEndX = indX + Math.cos(dir) * magnitude;
    const arrowEndY = indY;
    
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(indX, indY);
    ctx.lineTo(arrowEndX, arrowEndY);
    ctx.stroke();
    
    // head
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    if (windSpeed >= 0) {
      ctx.moveTo(arrowEndX, arrowEndY);
      ctx.lineTo(arrowEndX - 4, arrowEndY - 3);
      ctx.lineTo(arrowEndX - 4, arrowEndY + 3);
    } else {
      ctx.moveTo(arrowEndX, arrowEndY);
      ctx.lineTo(arrowEndX + 4, arrowEndY - 3);
      ctx.lineTo(arrowEndX + 4, arrowEndY + 3);
    }
    ctx.fill();
  }
  
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.font = '8px "Fira Code", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WIND DRIFT', indX, indY - 28);
  ctx.restore();
}

// Populate Dynamic Hazards Feed
function updateHazards(veiRating) {
  let html = '';
  
  if (isErupting) {
    if (veiRating >= 5) {
      html += `
        <div class="hazard-alert danger">
          <span class="hazard-icon">🌋</span>
          <div>
            <strong>Plinian Ash Column:</strong> Colossal plume rising to the stratosphere (${(veiRating * 6).toFixed(0)} km height). Severe regional flight closures and respiratory hazard warnings.
          </div>
        </div>
        <div class="hazard-alert danger">
          <span class="hazard-icon">💨</span>
          <div>
            <strong>Pyroclastic Flows:</strong> Superheated high-velocity currents of gas and rock rushing down flanks at 100+ km/h. Complete evacuation within 8km.
          </div>
        </div>
        <div class="hazard-alert warn">
          <span class="hazard-icon">📢</span>
          <div>
            <strong>Severe Tremors:</strong> Strong continuous tremors triggers structural risk on slopes. Ground ruptures detected.
          </div>
        </div>
      `;
    } else if (viscosity === 2 || veiRating >= 3) {
      html += `
        <div class="hazard-alert warn">
          <span class="hazard-icon">☄️</span>
          <div>
            <strong>Ballistic Pyroclasts:</strong> Large volcanic bombs flying from vent on parabolic arcs. Dangerous impact zone within 3km.
          </div>
        </div>
        <div class="hazard-alert warn">
          <span class="hazard-icon">⚠️</span>
          <div>
            <strong>Tephra Fallout:</strong> Moderate ash density dispersing downwind. Dust masks recommended for local biomes.
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="hazard-alert warn">
          <span class="hazard-icon">🔥</span>
          <div>
            <strong>Effusive Basalt Rivers:</strong> Low viscosity lava flows traveling down volcano slopes at ${(8.0/viscosity).toFixed(1)} m/s. Threat to structures and vegetation.
          </div>
        </div>
        <div class="hazard-alert safe">
          <span class="hazard-icon">💨</span>
          <div>
            <strong>Gas Vapour:</strong> Carbon Dioxide and Sulphur Dioxide degassing detected. Stay clear of low depressions.
          </div>
        </div>
      `;
    }
  } else {
    if (pressure > 70) {
      html += `
        <div class="hazard-alert warn">
          <span class="hazard-icon">⚠️</span>
          <div>
            <strong>High Pressure Accumulation:</strong> Viscous dome or clogged channel is compressing gas phase. Seismograph indicates vent rupture threshold imminent.
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="hazard-alert safe">
          <span class="hazard-icon">✅</span>
          <div>
            <strong>Chamber Stable:</strong> Seismic activity is normal. No pyroclastic threat or effusive risks detected.
          </div>
        </div>
      `;
    }
  }
  
  hazardsAlertLog.innerHTML = html;
}

// Real-time Seismology Waver Tracer
function updateSeismology(veiRating) {
  const sW = seismographCanvas.width;
  const sH = seismographCanvas.height;
  
  // Clear seismograph card background
  sCtx.fillStyle = '#080a11';
  sCtx.fillRect(0, 0, sW, sH);
  
  // Draw green grids
  sCtx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
  sCtx.lineWidth = 1;
  const gap = 30;
  for (let x = 0; x < sW; x += gap) {
    sCtx.beginPath();
    sCtx.moveTo(x, 0);
    sCtx.lineTo(x, sH);
    sCtx.stroke();
  }
  for (let y = 0; y < sH; y += 20) {
    sCtx.beginPath();
    sCtx.moveTo(0, y);
    sCtx.lineTo(sW, y);
    sCtx.stroke();
  }
  
  // Synthesize volcanic tremors
  let baseAmp = 0.25; // ambient background microseisms
  let frequency = 2.5; 
  
  if (togglePressurize.checked && !isErupting) {
    baseAmp += (pressure / 100) * 1.6;
    frequency = 2.5 + (pressure / 100) * 2.8;
  }
  
  if (isErupting) {
    baseAmp += 3.8 + (gasContent * 0.075) + (viscosity * 2.4);
    frequency = 4.2 + (viscosity * 1.1) + Math.sin(frameCount * 0.12) * 0.9;
  }
  
  // Calculate amplitude scale pixels
  const calculatedAmp = baseAmp;
  const waveScale = Math.min(sH * 0.46, calculatedAmp * 4.6);
  
  // Multi-frequency wave superposition
  const wave1 = Math.sin(frameCount * 0.3) * waveScale * 0.52;
  const wave2 = Math.sin(frameCount * 0.65) * waveScale * 0.28;
  const jitterNoise = (Math.random() - 0.5) * waveScale * 0.35;
  const displacement = wave1 + wave2 + jitterNoise;
  
  seismicHistory.push(displacement);
  if (seismicHistory.length > sW) {
    seismicHistory.shift();
  }
  
  // Render waveform lines
  sCtx.beginPath();
  sCtx.moveTo(0, sH / 2 + seismicHistory[0]);
  for (let i = 1; i < seismicHistory.length; i++) {
    sCtx.lineTo(i, sH / 2 + seismicHistory[i]);
  }
  
  let strokeColor = '#00e5ff'; // Safe blue
  if (isErupting) {
    strokeColor = veiRating >= 5 ? '#ef4444' : '#f59e0b';
  } else if (pressure > 70) {
    strokeColor = '#eab308'; // Tremor warning yellow
  }
  
  sCtx.strokeStyle = strokeColor;
  sCtx.lineWidth = isErupting ? (veiRating >= 5 ? 2.0 : 1.5) : 1.1;
  sCtx.shadowColor = strokeColor;
  sCtx.shadowBlur = isErupting ? 8 : 2;
  sCtx.stroke();
  sCtx.shadowBlur = 0; // reset glow shadow
  
  // Update tremor digital labels
  lblTremorAmp.textContent = `${calculatedAmp.toFixed(2)} mm/s`;
  lblTremorFreq.textContent = `${frequency.toFixed(1)} Hz`;
  
  // Toggle shaker classes on body envelope
  shakeEnvelope.classList.remove('shaking-mild', 'shaking-intense');
  if (isErupting) {
    if (veiRating >= 5) {
      shakeEnvelope.classList.add('shaking-intense');
    } else {
      shakeEnvelope.classList.add('shaking-mild');
    }
  } else if (pressure > 75) {
    shakeEnvelope.classList.add('shaking-mild');
  }
  
  // Seismogram Status Alarm Badge
  seismicAlarmHud.className = 'badge';
  if (isErupting) {
    if (veiRating >= 5) {
      seismicAlarmHud.textContent = 'CRITICAL TECTONIC';
      seismicAlarmHud.classList.add('live-badge');
    } else {
      seismicAlarmHud.textContent = 'ACTIVE TREMOR';
      seismicAlarmHud.classList.add('hazard-badge');
    }
  } else if (pressure > 70) {
    seismicAlarmHud.textContent = 'TREMOR WARNING';
    seismicAlarmHud.classList.add('hazard-badge');
  } else {
    seismicAlarmHud.textContent = 'NORMAL';
    seismicAlarmHud.classList.add('tech-badge');
  }
}

// Update Telemetry Panel UI values
function updateTelemetryUI(veiRating) {
  // Update VEI Badge in header
  if (isErupting) {
    telemetryVei.textContent = `VEI ${veiRating}`;
    if (veiRating >= 5) {
      telemetryVei.className = 'text-danger font-mono';
    } else {
      telemetryVei.className = 'text-warning font-mono';
    }
  } else {
    telemetryVei.textContent = 'VEI 0 (QUIET)';
    telemetryVei.className = 'text-success font-mono';
  }
  
  // Update Chamber Pressure progress bar
  telemetryPressureFill.style.width = `${pressure}%`;
  telemetryPressureFill.className = 'pressure-fill';
  if (pressure >= 80) {
    telemetryPressureFill.classList.add('danger');
  } else if (pressure >= 50) {
    telemetryPressureFill.classList.add('critical');
  } else {
    telemetryPressureFill.classList.add('normal');
  }
  telemetryPressureVal.textContent = `${Math.round(pressure)}%`;
  
  // Update status badge
  statusIndicator.className = 'badge';
  if (isErupting) {
    statusIndicator.classList.add('live-badge');
    if (veiRating >= 5) {
      statusIndicator.textContent = 'PLINIAN ERUPTION';
    } else if (viscosity === 2) {
      statusIndicator.textContent = 'STROMBOLIAN ERUPTION';
    } else {
      statusIndicator.textContent = 'HAWAIIAN ERUPTION';
    }
  } else {
    if (pressure > 80) {
      statusIndicator.textContent = 'CHAMBER CRITICAL';
      statusIndicator.classList.add('live-badge');
    } else if (pressure > 50) {
      statusIndicator.textContent = 'CHAMBER UNSTABLE';
      statusIndicator.classList.add('hazard-badge');
    } else {
      statusIndicator.textContent = 'CHAMBER STABLE';
      statusIndicator.classList.add('tech-badge');
    }
  }
  
  // Telemetry: Plume velocity
  let plumeVelVal = 0.0;
  if (isErupting) {
    plumeVelVal = (gasContent * 0.48) * (20 / ventDiameter);
    plumeVelVal += (Math.random() - 0.5) * (plumeVelVal * 0.1);
  }
  telemetryPlumeVel.textContent = `${plumeVelVal.toFixed(1)} m/s`;
  
  // Telemetry: Lava Flow velocity
  let flowRateVal = 0.0;
  if (isErupting || lavaParticles.length > 0) {
    flowRateVal = (7.8 / viscosity);
    if (!isErupting) {
      flowRateVal *= (lavaParticles.length / 40); // decays if lava cooling down
    }
    flowRateVal += (Math.random() - 0.5) * (flowRateVal * 0.08);
  }
  telemetryFlowRate.textContent = `${flowRateVal.toFixed(1)} m/s`;
  
  // Telemetry: Temperature C
  telemetryTemp.textContent = `${Math.round(currentTemperature)} °C`;
  if (currentTemperature > 1000) {
    telemetryTemp.style.color = '#ef4444';
  } else if (currentTemperature > 850) {
    telemetryTemp.style.color = '#f59e0b';
  } else {
    telemetryTemp.style.color = '#00e5ff';
  }
  
  // update active warnings log
  updateHazards(veiRating);
}

// Main simulation rendering loop
function tick() {
  frameCount++;
  
  // 1. Draw Canvas background
  ctx.fillStyle = '#0a0b10';
  ctx.fillRect(0, 0, W, H);
  
  // Subtle HUD background grid lines
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.015)';
  ctx.lineWidth = 1;
  const grid = 40;
  for (let x = 0; x < W; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  
  // Altitude markings
  ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.font = '9px "Fira Code", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ALTITUDE (km)', 15, 20);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const altitudes = ['15.0', '10.0', '5.0', '0.0 (Crater)', '-5.0', '-10.0 (Chamber)'];
  const altY = [50, 110, 170, craterY, H * 0.72, H - 40];
  
  for (let i = 0; i < altitudes.length; i++) {
    ctx.fillText(altitudes[i], 15, altY[i] - 4);
    ctx.beginPath();
    ctx.moveTo(15, altY[i]);
    ctx.lineTo(40, altY[i]);
    ctx.stroke();
  }
  
  // 2. Physics logic: pressure accumulation / relief
  if (togglePressurize.checked && !isErupting) {
    const baseRate = 0.035;
    const viscosityFactor = viscosity * 0.055;
    const gasFactor = gasContent * 0.0006;
    const ventFactor = 22 / ventDiameter;
    
    pressure += (baseRate + viscosityFactor + gasFactor) * ventFactor;
    if (pressure >= 100) {
      pressure = 100;
      triggerEruption();
    }
  } else if (isErupting) {
    const reliefRate = 0.065 + (ventDiameter * 0.0025) + (gasContent * 0.0012);
    pressure -= reliefRate;
    if (pressure <= 5) {
      pressure = 5;
      isErupting = false;
      togglePressurize.checked = false;
    }
  }
  
  // Interpolate thermal temperature
  let targetTemp = 720;
  if (isErupting) {
    if (viscosity === 1) targetTemp = 1150;      // low viscosity is hot basalt
    else if (viscosity === 2) targetTemp = 980;  // medium
    else targetTemp = 820;                       // high viscosity rhyolite dome
  } else if (pressure > 50) {
    targetTemp = 720 + (pressure - 50) * 4.2;    // compression generates heat
  }
  currentTemperature += (targetTemp - currentTemperature) * 0.025;
  
  // 3. Draw Volcano Mountain Strata body
  const ventRadius = ventDiameter * 0.6;
  const leftLimit = centerX - ventRadius;
  const rightLimit = centerX + ventRadius;
  
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, getTerrainHeight(0));
  for (let x = 5; x <= W; x += 5) {
    ctx.lineTo(x, getTerrainHeight(x));
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.clip();
  
  // Geological layers inside clip
  const layers = 14;
  const layerSize = (H - craterY) / layers;
  for (let i = 0; i < layers; i++) {
    const yTop = craterY + i * layerSize;
    let col = '#1e293b'; // slate-800
    if (i % 3 === 0) col = '#0f172a'; // slate-900
    else if (i % 3 === 1) col = '#111827'; // gray-900
    else col = '#1c1917'; // brown dark layers
    
    ctx.fillStyle = col;
    ctx.fillRect(0, yTop, W, layerSize + 2);
    
    // Slanted faults / geological layers
    ctx.strokeStyle = 'rgba(255,255,255,0.015)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, yTop);
    ctx.lineTo(W, yTop);
    ctx.stroke();
  }
  
  // Draw slanted cracks in mountain rock body
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 3.5;
  for (let j = 0; j < 3; j++) {
    ctx.beginPath();
    ctx.moveTo(W * 0.12 + j * 95, H);
    ctx.lineTo(W * 0.17 + j * 95, craterY + 110);
    ctx.stroke();
  }
  ctx.restore();
  
  // Mountain outer edge highlight silhouette
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, getTerrainHeight(0));
  for (let x = 5; x <= W; x += 5) {
    ctx.lineTo(x, getTerrainHeight(x));
  }
  ctx.stroke();
  
  // 4. Draw conduit and magma chamber structures
  // Chamber glow
  const chamberGrad = ctx.createRadialGradient(centerX, chamberY - 10, 2, centerX, chamberY - 10, chamberRadius + 10);
  chamberGrad.addColorStop(0, '#ffd8a8');
  chamberGrad.addColorStop(0.38, '#f97316');
  chamberGrad.addColorStop(0.78, '#ea580c');
  chamberGrad.addColorStop(1, 'rgba(120, 20, 5, 0)');
  
  ctx.fillStyle = chamberGrad;
  ctx.beginPath();
  ctx.arc(centerX, chamberY - 10, chamberRadius + 10, 0, Math.PI * 2);
  ctx.fill();
  
  // Conduit glow
  const conduitGrad = ctx.createLinearGradient(centerX - ventRadius, 0, centerX + ventRadius, 0);
  conduitGrad.addColorStop(0, '#ea580c');
  conduitGrad.addColorStop(0.35, '#ff9045');
  conduitGrad.addColorStop(0.65, '#ff9045');
  conduitGrad.addColorStop(1, '#ea580c');
  ctx.fillStyle = conduitGrad;
  ctx.fillRect(centerX - ventRadius, craterY, ventRadius * 2, chamberY - 10 - craterY);
  
  // Spawning magma bubbles inside conduit
  if (Math.random() < 0.38) {
    const inPipe = Math.random() < 0.65;
    magmaBubbles.push({
      x: inPipe
        ? centerX + (Math.random() - 0.5) * ventRadius * 1.5
        : centerX + (Math.random() - 0.5) * chamberRadius * 1.3,
      y: inPipe
        ? craterY + Math.random() * (chamberY - 10 - craterY)
        : chamberY - 10 + (Math.random() - 0.5) * chamberRadius * 0.85,
      radius: Math.random() * 3.2 + 1.2,
      speed: Math.random() * 0.75 + 0.35,
      alpha: Math.random() * 0.7 + 0.3
    });
  }
  
  for (let i = magmaBubbles.length - 1; i >= 0; i--) {
    const b = magmaBubbles[i];
    b.y -= b.speed;
    
    if (b.y < craterY) {
      magmaBubbles.splice(i, 1);
      continue;
    }
    
    ctx.fillStyle = `rgba(254, 240, 138, ${b.alpha})`;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Magma pool inside crater
  const poolGrad = ctx.createLinearGradient(leftLimit, 0, rightLimit, 0);
  poolGrad.addColorStop(0, '#ea580c');
  poolGrad.addColorStop(0.5, '#fef08a');
  poolGrad.addColorStop(1, '#ea580c');
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.moveTo(leftLimit, craterY);
  ctx.quadraticCurveTo(centerX, craterY - (pressure / 100) * 12, rightLimit, craterY);
  ctx.lineTo(rightLimit, craterY + 5);
  ctx.lineTo(leftLimit, craterY + 5);
  ctx.closePath();
  ctx.fill();
  
  // 5. ERUPTING PARADE LOOP
  let veiRating = 0;
  if (isErupting) {
    if (viscosity === 1) {
      veiRating = Math.min(2, Math.max(1, Math.floor(gasContent / 30)));
    } else if (viscosity === 2) {
      veiRating = Math.min(4, Math.max(2, Math.floor(gasContent / 18)));
    } else {
      veiRating = Math.min(8, Math.max(5, Math.floor(5 + gasContent / 25)));
    }
    
    // Spawning particulate assets
    if (viscosity === 1) {
      // Hawaiian flows
      if (Math.random() < 0.8) {
        lavaParticles.push(createLavaParticle('left'));
        lavaParticles.push(createLavaParticle('right'));
      }
      if (Math.random() < 0.18) {
        ashParticles.push(createAshParticle(0.4));
      }
      if (Math.random() < 0.1) {
        pyroclasts.push(createPyroclast(0.45, 4));
      }
    } else if (viscosity === 2) {
      // Strombolian explodes
      if (Math.random() < 0.3) {
        lavaParticles.push(createLavaParticle('left'));
        lavaParticles.push(createLavaParticle('right'));
      }
      if (Math.random() < 0.68) {
        ashParticles.push(createAshParticle(0.8));
      }
      if (Math.random() < 0.48) {
        const numBombs = Math.floor(Math.random() * 2) + 1;
        for (let b = 0; b < numBombs; b++) {
          pyroclasts.push(createPyroclast(0.9, 6));
        }
      }
    } else {
      // Plinian towers
      if (Math.random() < 0.12) {
        lavaParticles.push(createLavaParticle('left', 2.0));
        lavaParticles.push(createLavaParticle('right', 2.0));
      }
      const numAsh = Math.floor(Math.random() * 3) + 3;
      for (let a = 0; a < numAsh; a++) {
        ashParticles.push(createAshParticle(1.4));
      }
      if (Math.random() < 0.75) {
        const numBombs = Math.floor(Math.random() * 3) + 1;
        for (let b = 0; b < numBombs; b++) {
          pyroclasts.push(createPyroclast(1.5, 9));
        }
      }
    }
    
    // Ambient gas sparks near vent
    const numSparks = Math.floor(gasContent / 8) + 1;
    for (let s = 0; s < numSparks; s++) {
      sparks.push({
        x: centerX + (Math.random() - 0.5) * ventRadius * 1.5,
        y: craterY - 2,
        vx: (Math.random() - 0.5) * 6 + windSpeed * 0.015,
        vy: -Math.random() * 5 - 2,
        life: Math.random() * 25 + 15,
        size: Math.random() * 2 + 1,
        color: Math.random() < 0.3 ? '#ff9045' : '#fef08a'
      });
    }
  }
  
  // 6. RENDER PARTICLES
  // --- Lava Particles Flow ---
  for (let i = lavaParticles.length - 1; i >= 0; i--) {
    const p = lavaParticles[i];
    p.life--;
    if (p.life <= 0 || p.x < 0 || p.x > W) {
      lavaParticles.splice(i, 1);
      continue;
    }
    
    if (p.side === 'left') {
      p.x -= p.speed;
    } else {
      p.x += p.speed;
    }
    
    p.y = getTerrainHeight(p.x) - p.size * 0.15;
    
    const lifeRatio = p.life / p.maxLife;
    let col;
    let alpha = 0.85;
    
    if (lifeRatio > 0.75) {
      col = '#fef08a';
    } else if (lifeRatio > 0.4) {
      col = '#f97316';
    } else if (lifeRatio > 0.18) {
      col = '#ef4444';
    } else {
      col = '#4b5563';
      alpha = (lifeRatio / 0.18) * 0.5;
    }
    
    ctx.fillStyle = col;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
  
  // --- Ash Clouds ---
  for (let i = ashParticles.length - 1; i >= 0; i--) {
    const p = ashParticles[i];
    p.life--;
    if (p.life <= 0 || p.x < 0 || p.x > W || p.y < -50) {
      ashParticles.splice(i, 1);
      continue;
    }
    
    p.vy -= 0.018;
    if (p.vy < -3.6) p.vy = -3.6;
    
    p.vx += (windSpeed * 0.038 - p.vx) * 0.025;
    
    p.x += p.vx;
    p.y += p.vy;
    p.size += p.growth;
    
    const lifeRatio = p.life / p.maxLife;
    const alpha = lifeRatio * 0.28;
    
    const dist = Math.max(0, craterY - p.y);
    if (dist < 65) {
      const heat = 1 - (dist / 65);
      ctx.fillStyle = `rgba(${Math.floor(220 + 35 * heat)}, ${Math.floor(65 + 40 * heat)}, 40, ${alpha * 1.55})`;
    } else {
      ctx.fillStyle = `rgba(100, 116, 139, ${alpha})`;
    }
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // --- Ballistic Pyroclastic Bombs ---
  for (let i = pyroclasts.length - 1; i >= 0; i--) {
    const p = pyroclasts[i];
    p.life--;
    if (p.life <= 0 || p.x < 0 || p.x > W || p.y > H + 50) {
      pyroclasts.splice(i, 1);
      continue;
    }
    
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 6) p.trail.shift();
    
    p.vy += p.gravity;
    p.vx += windSpeed * 0.0006;
    
    p.vx *= p.drag;
    p.vy *= p.drag;
    
    p.x += p.vx;
    p.y += p.vy;
    
    const ground = getTerrainHeight(p.x);
    if (p.y >= ground - 2) {
      // Impact sparks
      const numFSparks = Math.floor(Math.random() * 3) + 2;
      for (let s = 0; s < numFSparks; s++) {
        sparks.push({
          x: p.x,
          y: ground - 4,
          vx: (Math.random() - 0.5) * 4 - (p.vx * 0.3),
          vy: -Math.random() * 3 - 1,
          life: Math.random() * 25 + 15,
          size: Math.random() * 1.8 + 1,
          color: '#ea580c'
        });
      }
      
      const side = p.x < W / 2 ? 'left' : 'right';
      lavaParticles.push({
        x: p.x,
        y: ground,
        side: side,
        speed: (Math.random() * 0.38 + 0.16) * (1.6 / viscosity),
        size: Math.random() * 4 + 3.2,
        maxLife: Math.random() * 170 + 80,
        life: Math.random() * 170 + 80
      });
      
      pyroclasts.splice(i, 1);
      continue;
    }
    
    if (p.trail.length > 1) {
      ctx.strokeStyle = `rgba(249, 115, 22, ${p.life / p.maxLife * 0.4})`;
      ctx.lineWidth = p.size * 0.45;
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let t = 1; t < p.trail.length; t++) {
        ctx.lineTo(p.trail[t].x, p.trail[t].y);
      }
      ctx.stroke();
    }
    
    const bulletGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    bulletGlow.addColorStop(0, '#fff');
    bulletGlow.addColorStop(0.3, '#fef08a');
    bulletGlow.addColorStop(0.8, '#f97316');
    bulletGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = bulletGlow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // --- Sparks particles ---
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.life--;
    if (s.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }
    
    s.vy += 0.12;
    s.x += s.vx;
    s.y += s.vy;
    
    ctx.fillStyle = s.color || '#eab308';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Wind Direction vectors draw
  drawWindIndicator();
  
  // Draw Seismograph tremors
  updateSeismology(veiRating);
  
  // Draw telemetry logs
  updateTelemetryUI(veiRating);
  
  requestAnimationFrame(tick);
}

// Event Listeners
sliderViscosity.addEventListener('input', () => {
  addCustomOption();
  updateParamsFromSliders();
});
sliderGas.addEventListener('input', () => {
  addCustomOption();
  updateParamsFromSliders();
});
sliderVent.addEventListener('input', () => {
  addCustomOption();
  updateParamsFromSliders();
});
sliderWind.addEventListener('input', () => {
  addCustomOption();
  updateParamsFromSliders();
});

eruptionPresetSelect.addEventListener('change', () => {
  applyPreset(eruptionPresetSelect.value);
});

btnErupt.addEventListener('click', () => {
  if (!isErupting) {
    if (pressure < 50) {
      pressure = 85; // manual erupt triggers a high start pressure
    }
    triggerEruption();
  }
});

btnCool.addEventListener('click', coolDown);

// Page load initialization
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvases();
  coolDown();
  applyPreset('hawaiian'); // set defaults to hawaiian effusive
  tick();
});
