/**
 * EPIDEMIOLOGY SPREAD SIMULATOR PRO
 * Core Logic: SEIRHDV ODE Solver & Stochastic Agent-Based Physics Sandbox
 */

// --- Global Simulation State ---
const state = {
  // Config Mode
  engine: 'ODE', // 'ODE' or 'AGENT'
  isPlaying: false,
  day: 0,
  tickCount: 0,
  ticksPerDay: 30, // FPS/Ticks in 1 simulated day
  maxDays: 100,

  // Pathogen Parameters
  beta: 0.35,
  incubationPeriod: 5.0,
  infectiousPeriod: 8.0,
  hospitalizationRate: 12, // % of infectious needing hospital
  baseMortality: 5.0, // % of hospitalized that die
  overloadMultiplier: 3.0, // mortality multiplier when hospital is full
  hospitalDuration: 8.0, // average ICU stay

  // Healthcare Capacity
  icuCapacity: 2.5, // % of pop

  // Immunization
  vaccineEfficacy: 90, // %
  vaccineSpeed: 0.2, // % of pop vaccinated per day

  // NPI Interventions Schedule
  npis: {
    lockdown: { active: false, scheduled: false, startDay: 15 },
    masks: { active: false, scheduled: false, startDay: 10 },
    testing: { active: false, scheduled: false, startDay: 8 },
    vaccine: { active: false, scheduled: false, startDay: 25 }
  },

  // Compartment Values (ODE holds percentages 0-100; Agent holds counts 0-300)
  compartments: {
    S: 99.7,
    E: 0.0,
    I: 0.3,
    R: 0.0,
    H: 0.0,
    D: 0.0,
    V: 0.0
  },

  // Telemetry Metrics
  metrics: {
    peakInfected: 0.3,
    peakInfectedDay: 0,
    totalDeceased: 0,
    peakIcuBurden: 0.0,
    icuBreachedDay: null,
    currentRt: 0.00
  },

  // Historical logs for plotting
  history: {
    days: [],
    S: [], E: [], I: [], R: [], H: [], D: [], V: [],
    Rt: []
  },

  // Agent Population Sandbox Array
  agents: [],
  agentPopSize: 300,
  
  // Custom bed coordinates inside Hospital and Quarantine
  beds: [],
  quarantineBeds: []
};

// Preset configurations
const presets = {
  covid: {
    beta: 0.35, incubationPeriod: 5.0, infectiousPeriod: 8.0, hospitalizationRate: 12,
    icuCapacity: 2.5, baseMortality: 5.0, overloadMultiplier: 3.0,
    vaccineEfficacy: 90, vaccineSpeed: 0.2
  },
  flu: {
    beta: 0.20, incubationPeriod: 2.0, infectiousPeriod: 4.0, hospitalizationRate: 2,
    icuCapacity: 1.5, baseMortality: 1.0, overloadMultiplier: 1.5,
    vaccineEfficacy: 60, vaccineSpeed: 0.5
  },
  measles: {
    beta: 1.20, incubationPeriod: 10.0, infectiousPeriod: 7.0, hospitalizationRate: 5,
    icuCapacity: 3.0, baseMortality: 0.5, overloadMultiplier: 2.0,
    vaccineEfficacy: 95, vaccineSpeed: 0.4
  },
  zombie: {
    beta: 0.95, incubationPeriod: 1.0, infectiousPeriod: 14.0, hospitalizationRate: 40,
    icuCapacity: 1.0, baseMortality: 45.0, overloadMultiplier: 2.0,
    vaccineEfficacy: 15, vaccineSpeed: 0.0
  }
};

// Canvas references
let sandboxCanvas, sandboxCtx;
let curveCanvas, curveCtx;
let rtCanvas, rtCtx;

// Animation Frame ID
let animFrameId = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initDOMReferences();
  initSliders();
  setupCanvasElements();
  loadPreset('covid');
  resetSimulation();
  
  // Start drawing the static scene
  drawScene();
});

function initDOMReferences() {
  // Master Controls
  document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
  document.getElementById('stepBtn').addEventListener('click', stepSimulation);
  document.getElementById('resetBtn').addEventListener('click', () => {
    resetSimulation();
    logAlert('Simulation reset to initial values.', 'system');
  });
  document.getElementById('exportCsvBtn').addEventListener('click', exportCSV);
  
  // Engine Toggles
  const modeOde = document.getElementById('modeOdeBtn');
  const modeAgent = document.getElementById('modeAgentBtn');
  
  modeOde.addEventListener('click', () => {
    if (state.engine === 'ODE') return;
    state.engine = 'ODE';
    modeOde.classList.add('active');
    modeAgent.classList.remove('active');
    resetSimulation();
    logAlert('Switched to continuous ODE compartmental engine.', 'system');
  });
  
  modeAgent.addEventListener('click', () => {
    if (state.engine === 'AGENT') return;
    state.engine = 'AGENT';
    modeAgent.classList.add('active');
    modeOde.classList.remove('active');
    resetSimulation();
    logAlert('Switched to discrete agent-based sandbox engine.', 'system');
  });

  // Preset selector
  document.getElementById('presetSelect').addEventListener('change', (e) => {
    loadPreset(e.target.value);
    resetSimulation();
  });

  // Sliders
  setupSliderListener('paramBeta', 'valBeta', (v) => { state.beta = v; });
  setupSliderListener('paramIncubation', 'valIncubation', (v) => { state.incubationPeriod = v; });
  setupSliderListener('paramInfectious', 'valInfectious', (v) => { state.infectiousPeriod = v; });
  setupSliderListener('paramSeverity', 'valSeverity', (v) => { state.hospitalizationRate = parseInt(v); });
  setupSliderListener('paramHospitalCapacity', 'valHospitalCapacity', (v) => { 
    state.icuCapacity = v; 
    document.getElementById('valHospitalCapacity').innerText = v.toFixed(1) + '%';
    rebuildBeds();
  }, true);
  setupSliderListener('paramBaseMortality', 'valBaseMortality', (v) => { state.baseMortality = v; });
  setupSliderListener('paramOverloadMultiplier', 'valOverloadMultiplier', (v) => { 
    state.overloadMultiplier = v; 
    document.getElementById('valOverloadMultiplier').innerText = v.toFixed(1) + 'x';
  }, true);
  setupSliderListener('paramVaccineEfficacy', 'valVaccineEfficacy', (v) => { state.vaccineEfficacy = parseInt(v); });
  setupSliderListener('paramVaccineSpeed', 'valVaccineSpeed', (v) => { state.vaccineSpeed = v; });

  // NPI Timelines
  setupNPIControls('npiLockdownCheck', 'npiLockdownDay', 'valLockdownDay', 'lockdown');
  setupNPIControls('npiMaskCheck', 'npiMaskDay', 'valMaskDay', 'masks');
  setupNPIControls('npiTestingCheck', 'npiTestingDay', 'valTestingDay', 'testing');
  setupNPIControls('npiVaccineCheck', 'npiVaccineDay', 'valVaccineDay', 'vaccine');

  // Chart interactivity (Hover Crosshair)
  curveCanvas = document.getElementById('curveChart');
  curveCanvas.addEventListener('mousemove', handleChartHover);
  curveCanvas.addEventListener('mouseleave', clearChartHover);
}

function setupCanvasElements() {
  sandboxCanvas = document.getElementById('sandboxCanvas');
  sandboxCtx = sandboxCanvas.getContext('2d');
  
  curveCtx = curveCanvas.getContext('2d');
  
  rtCanvas = document.getElementById('rtChart');
  rtCtx = rtCanvas.getContext('2d');
}

function setupSliderListener(sliderId, valId, updateFn, manualString = false) {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(valId);
  
  slider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    updateFn(val);
    if (!manualString) {
      display.innerText = val.toFixed(slider.step.includes('.') ? slider.step.split('.')[1].length : 0);
    }
    if (state.engine === 'ODE' && !state.isPlaying) {
      // Re-run static visual or recalculate
    }
  });
}

function setupNPIControls(checkId, sliderId, displayId, key) {
  const check = document.getElementById(checkId);
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(displayId);

  check.addEventListener('change', (e) => {
    state.npis[key].scheduled = e.target.checked;
    updateNpiUIStates();
  });

  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.npis[key].startDay = val;
    display.innerText = 'Day ' + val;
  });
}

function updateNpiUIStates() {
  // Update styling based on schedule status
  Object.keys(state.npis).forEach(key => {
    const npi = state.npis[key];
    const lane = document.getElementById(`npi${key.charAt(0).toUpperCase() + key.slice(1)}Check`).closest('.npi-schedule-lane');
    const statusText = document.getElementById(`status${key.charAt(0).toUpperCase() + key.slice(1)}`);
    
    if (npi.active) {
      statusText.innerText = 'ACTIVE';
      statusText.className = 'lane-status active-npi';
    } else if (npi.scheduled) {
      statusText.innerText = `SCHED: D${npi.startDay}`;
      statusText.className = 'lane-status';
    } else {
      statusText.innerText = 'INACTIVE';
      statusText.className = 'lane-status';
    }
  });
}

function loadPreset(name) {
  const p = presets[name];
  if (!p) return;

  state.beta = p.beta;
  state.incubationPeriod = p.incubationPeriod;
  state.infectiousPeriod = p.infectiousPeriod;
  state.hospitalizationRate = p.hospitalizationRate;
  state.icuCapacity = p.icuCapacity;
  state.baseMortality = p.baseMortality;
  state.overloadMultiplier = p.overloadMultiplier;
  state.vaccineEfficacy = p.vaccineEfficacy;
  state.vaccineSpeed = p.vaccineSpeed;

  // Set sliders value
  document.getElementById('paramBeta').value = p.beta;
  document.getElementById('valBeta').innerText = p.beta.toFixed(2);

  document.getElementById('paramIncubation').value = p.incubationPeriod;
  document.getElementById('valIncubation').innerText = p.incubationPeriod.toFixed(1);

  document.getElementById('paramInfectious').value = p.infectiousPeriod;
  document.getElementById('valInfectious').innerText = p.infectiousPeriod.toFixed(1);

  document.getElementById('paramSeverity').value = p.hospitalizationRate;
  document.getElementById('valSeverity').innerText = p.hospitalizationRate;

  document.getElementById('paramHospitalCapacity').value = p.icuCapacity;
  document.getElementById('valHospitalCapacity').innerText = p.icuCapacity.toFixed(1) + '%';

  document.getElementById('paramBaseMortality').value = p.baseMortality;
  document.getElementById('valBaseMortality').innerText = p.baseMortality.toFixed(1);

  document.getElementById('paramOverloadMultiplier').value = p.overloadMultiplier;
  document.getElementById('valOverloadMultiplier').innerText = p.overloadMultiplier.toFixed(1) + 'x';

  document.getElementById('paramVaccineEfficacy').value = p.vaccineEfficacy;
  document.getElementById('valVaccineEfficacy').innerText = p.vaccineEfficacy;

  document.getElementById('paramVaccineSpeed').value = p.vaccineSpeed;
  document.getElementById('valVaccineSpeed').innerText = p.vaccineSpeed.toFixed(2);

  logAlert(`Loaded preset scenario: ${name.toUpperCase()}`, 'info');
  rebuildBeds();
}

// Rebuild visual bed matrices for quarantine and hospital ICU
function rebuildBeds() {
  state.beds = [];
  state.quarantineBeds = [];
  
  // Hospital Beds (critical units) - Grid matching ICU capacity
  const maxHospBeds = Math.max(1, Math.ceil(state.agentPopSize * (state.icuCapacity / 100)));
  const hospCols = 5;
  const hospXStart = 505;
  const hospYStart = 40;
  
  for (let i = 0; i < maxHospBeds; i++) {
    const r = Math.floor(i / hospCols);
    const c = i % hospCols;
    state.beds.push({
      x: hospXStart + c * 30 + 10,
      y: hospYStart + r * 28 + 10,
      occupied: false,
      agentId: null
    });
  }

  // Quarantine Beds - fixed matrix
  const maxQuarBeds = 20;
  const quarCols = 5;
  const quarXStart = 505;
  const quarYStart = 250;
  
  for (let i = 0; i < maxQuarBeds; i++) {
    const r = Math.floor(i / quarCols);
    const c = i % quarCols;
    state.quarantineBeds.push({
      x: quarXStart + c * 30 + 10,
      y: quarYStart + r * 28 + 10,
      occupied: false,
      agentId: null
    });
  }
}

// --- Reset & Setup ---
function resetSimulation() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  
  state.isPlaying = false;
  state.day = 0;
  state.tickCount = 0;
  
  // Setup Compartments
  if (state.engine === 'ODE') {
    state.compartments.S = 99.7;
    state.compartments.E = 0.0;
    state.compartments.I = 0.3;
    state.compartments.R = 0.0;
    state.compartments.H = 0.0;
    state.compartments.D = 0.0;
    state.compartments.V = 0.0;
  } else {
    // Agent-Based Initial Counts
    state.compartments.S = state.agentPopSize - 1;
    state.compartments.E = 0;
    state.compartments.I = 1;
    state.compartments.R = 0;
    state.compartments.H = 0;
    state.compartments.D = 0;
    state.compartments.V = 0;
  }

  // Clear timelines and UI statuses
  Object.keys(state.npis).forEach(key => {
    state.npis[key].active = false;
  });
  updateNpiUIStates();

  // Clear alert logs
  const alertLog = document.getElementById('alertLog');
  alertLog.innerHTML = '<div class="log-entry system">[SYSTEM] Workspace initialized. Ready to execute.</div>';

  // Clear metrics
  state.metrics = {
    peakInfected: state.compartments.I / (state.engine === 'ODE' ? 1 : state.agentPopSize) * 100,
    peakInfectedDay: 0,
    totalDeceased: 0,
    peakIcuBurden: 0.0,
    icuBreachedDay: null,
    currentRt: state.beta * state.infectiousPeriod
  };

  // Clear History
  state.history = {
    days: [0],
    S: [state.compartments.S],
    E: [state.compartments.E],
    I: [state.compartments.I],
    R: [state.compartments.R],
    H: [state.compartments.H],
    D: [state.compartments.D],
    V: [state.compartments.V],
    Rt: [state.metrics.currentRt]
  };

  // Spawning Agents
  initAgents();
  rebuildBeds();
  updateUI();
  drawScene();

  const playBtn = document.getElementById('playPauseBtn');
  playBtn.innerHTML = '<span class="icon">▶</span> <span class="text">RUN SIMULATOR</span>';
  playBtn.className = 'control-btn run-btn';
}

function initAgents() {
  state.agents = [];
  
  // Susceptible Agents
  for (let i = 0; i < state.compartments.S; i++) {
    state.agents.push(createAgent('S', i));
  }
  
  // 1 Infected Agent
  state.agents.push(createAgent('I', state.compartments.S));
}

function createAgent(stateCode, id) {
  // Spatial coordinates strictly in Main Arena: x[20, 460], y[20, 400]
  const x = 20 + Math.random() * 440;
  const y = 20 + Math.random() * 380;
  
  // Velocity vectors
  const speed = 1.2;
  const angle = Math.random() * Math.PI * 2;
  
  let timer = 0;
  if (stateCode === 'I') {
    timer = Math.round((state.infectiousPeriod * (0.8 + Math.random() * 0.4)) * state.ticksPerDay);
  }

  return {
    id: id,
    state: stateCode,
    x: x,
    y: y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    timer: timer,
    vaccineShieldActive: false,
    bedIndex: -1
  };
}

// --- Control Operations ---
function togglePlayPause() {
  state.isPlaying = !state.isPlaying;
  const playBtn = document.getElementById('playPauseBtn');
  
  if (state.isPlaying) {
    playBtn.innerHTML = '<span class="icon">⏸</span> <span class="text">PAUSE</span>';
    playBtn.className = 'control-btn run-btn paused';
    logAlert('Simulation started.', 'success');
    runSimulationLoop();
  } else {
    playBtn.innerHTML = '<span class="icon">▶</span> <span class="text">RUN SIMULATOR</span>';
    playBtn.className = 'control-btn run-btn';
    logAlert('Simulation paused.', 'warning');
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }
}

function runSimulationLoop() {
  if (!state.isPlaying) return;
  
  updateSimulationTick();
  drawScene();
  
  if (state.day >= state.maxDays || isEpidemicOver()) {
    state.isPlaying = false;
    const playBtn = document.getElementById('playPauseBtn');
    playBtn.innerHTML = '<span class="icon">▶</span> <span class="text">RUN SIMULATOR</span>';
    playBtn.className = 'control-btn run-btn';
    logAlert(`Outbreak terminated at Day ${state.day}. Final analysis logged.`, 'success');
    updateUI();
    return;
  }
  
  animFrameId = requestAnimationFrame(runSimulationLoop);
}

function stepSimulation() {
  if (state.isPlaying) togglePlayPause();
  
  // Run 1 complete day (ticksPerDay steps)
  for (let i = 0; i < state.ticksPerDay; i++) {
    updateSimulationTick();
  }
  
  drawScene();
  updateUI();
  logAlert(`Step completed: Day ${state.day}`, 'info');
}

function isEpidemicOver() {
  // Terminate if exposed + infectious drop to zero
  if (state.engine === 'ODE') {
    return (state.compartments.E < 0.005 && state.compartments.I < 0.005);
  } else {
    return (state.compartments.E === 0 && state.compartments.I === 0);
  }
}

// --- Main State Transitions and Solver ---
function updateSimulationTick() {
  // Check NPI schedule timeline
  checkNPISchedules();

  if (state.engine === 'ODE') {
    // ODE runs on a fractional day base (dt = 1/ticksPerDay)
    solveOdeStep(1.0 / state.ticksPerDay);
  } else {
    // Agent Sandbox runs physics update per tick
    updateAgentSandboxPhysics();
  }

  // Track sub-day progress
  state.tickCount++;
  if (state.tickCount >= state.ticksPerDay) {
    state.tickCount = 0;
    state.day++;
    
    // Day boundary operations
    recordHistoryPoint();
    updateUI();
  }
}

function checkNPISchedules() {
  Object.keys(state.npis).forEach(key => {
    const npi = state.npis[key];
    if (npi.scheduled && state.day >= npi.startDay) {
      if (!npi.active) {
        npi.active = true;
        logAlert(`Day ${state.day}: INTERVENTION ACTIVE: [${key.toUpperCase()}]`, 'success');
        updateNpiUIStates();
      }
    } else {
      if (npi.active) {
        npi.active = false;
        updateNpiUIStates();
      }
    }
  });
}

// --- ODE Solver Logic ---
function solveOdeStep(dt) {
  // Rates scaled by parameters
  const N = 100.0;
  
  // Calculate NPI efficacy reductions
  let activeBeta = state.beta;
  if (state.npis.lockdown.active) activeBeta *= 0.25; // 75% reduction
  if (state.npis.masks.active) activeBeta *= 0.30;     // 70% reduction
  if (state.npis.testing.active) activeBeta *= 0.70;   // 30% quarantine isolation effect

  // Transition Rates
  const s = state.compartments.S;
  const e = state.compartments.E;
  const i = state.compartments.I;
  const r = state.compartments.R;
  const h = state.compartments.H;
  const d = state.compartments.D;
  const v = state.compartments.V;

  // Mass action transmission
  const forceOfInfection = (activeBeta * s * i) / N;
  
  // Exposed incubation
  const rateIncub = e / state.incubationPeriod;
  
  // Leaving infectious
  const rateLosingInfectious = i / state.infectiousPeriod;
  const hospFrac = state.hospitalizationRate / 100.0;
  const rateHosp = rateLosingInfectious * hospFrac;
  const rateRecoverMild = rateLosingInfectious * (1.0 - hospFrac);

  // Vaccine campaigns
  let vSpeed = 0.0;
  if (state.npis.vaccine.active && s > 0) {
    vSpeed = state.vaccineSpeed * (state.vaccineEfficacy / 100.0);
    // bound by remaining susceptible
    vSpeed = Math.min(s, vSpeed);
  }

  // ICU Capacity breaching mortality adjustments
  let activeMortality = state.baseMortality / 100.0;
  if (h > state.icuCapacity) {
    const excess = h - state.icuCapacity;
    activeMortality *= (1.0 + (state.overloadMultiplier - 1.0) * (excess / state.icuCapacity));
    activeMortality = Math.min(0.99, activeMortality); // Cap at 99%
    
    // Log ICU breach once
    if (state.metrics.icuBreachedDay === null) {
      state.metrics.icuBreachedDay = state.day;
      logAlert(`Day ${state.day}: ICU CAPACITY OVERLOADED! Surges mortality!`, 'critical');
    }
  } else {
    if (state.metrics.icuBreachedDay !== null && h <= state.icuCapacity) {
      state.metrics.icuBreachedDay = null;
      logAlert(`Day ${state.day}: Healthcare system load normalized.`, 'info');
    }
  }

  const rateICUDuration = h / state.hospitalDuration;
  const rateDead = rateICUDuration * activeMortality;
  const rateRecoverHosp = rateICUDuration * (1.0 - activeMortality);

  // Euler derivatives
  const dS = -forceOfInfection - vSpeed;
  const dE = forceOfInfection - rateIncub;
  const dI = rateIncub - rateRecoverMild - rateHosp;
  const dH = rateHosp - rateDead - rateRecoverHosp;
  const dR = rateRecoverMild + rateRecoverHosp;
  const dD = rateDead;
  const dV = vSpeed;

  // Apply step
  state.compartments.S = Math.max(0, s + dS * dt);
  state.compartments.E = Math.max(0, e + dE * dt);
  state.compartments.I = Math.max(0, i + dI * dt);
  state.compartments.H = Math.max(0, h + dH * dt);
  state.compartments.R = Math.max(0, r + dR * dt);
  state.compartments.D = Math.max(0, d + dD * dt);
  state.compartments.V = Math.max(0, v + dV * dt);

  // Conserve total population
  const total = state.compartments.S + state.compartments.E + state.compartments.I + state.compartments.H + state.compartments.R + state.compartments.D + state.compartments.V;
  if (total > 0) {
    state.compartments.S = (state.compartments.S / total) * 100;
    state.compartments.E = (state.compartments.E / total) * 100;
    state.compartments.I = (state.compartments.I / total) * 100;
    state.compartments.H = (state.compartments.H / total) * 100;
    state.compartments.R = (state.compartments.R / total) * 100;
    state.compartments.D = (state.compartments.D / total) * 100;
    state.compartments.V = (state.compartments.V / total) * 100;
  }

  // Calculate Rt
  state.metrics.currentRt = activeBeta * state.infectiousPeriod * (state.compartments.S / 100);

  // Keep sandbox particle counts relative to ODE percentages for visualization
  syncAgentsToOde();
}

function syncAgentsToOde() {
  // Redistribute agent states randomly to visually mimic ODE percentages
  const targetCounts = {
    S: Math.round((state.compartments.S / 100) * state.agentPopSize),
    E: Math.round((state.compartments.E / 100) * state.agentPopSize),
    I: Math.round((state.compartments.I / 100) * state.agentPopSize),
    R: Math.round((state.compartments.R / 100) * state.agentPopSize),
    H: Math.round((state.compartments.H / 100) * state.agentPopSize),
    D: Math.round((state.compartments.D / 100) * state.agentPopSize),
    V: Math.round((state.compartments.V / 100) * state.agentPopSize)
  };

  // Adjust counts to sum exactly to agentPopSize
  let sum = Object.values(targetCounts).reduce((a, b) => a + b, 0);
  while (sum !== state.agentPopSize) {
    const keys = Object.keys(targetCounts);
    const diff = state.agentPopSize - sum;
    const adjustKey = keys[Math.floor(Math.random() * keys.length)];
    if (diff > 0) {
      targetCounts[adjustKey]++;
      sum++;
    } else if (targetCounts[adjustKey] > 0) {
      targetCounts[adjustKey]--;
      sum--;
    }
  }

  // Apply target states to agents
  const flatTargets = [];
  Object.keys(targetCounts).forEach(stateKey => {
    for (let c = 0; c < targetCounts[stateKey]; c++) {
      flatTargets.push(stateKey);
    }
  });

  // Shuffle targets so change is spatial-neutral
  flatTargets.sort(() => Math.random() - 0.5);

  // Reset bed allocations
  state.beds.forEach(b => { b.occupied = false; b.agentId = null; });
  state.quarantineBeds.forEach(b => { b.occupied = false; b.agentId = null; });

  state.agents.forEach((agent, idx) => {
    const newState = flatTargets[idx];
    if (agent.state !== newState) {
      agent.state = newState;
      agent.bedIndex = -1;
      
      // If transitioned to hospital/quarantine, assign positions
      if (newState === 'H') {
        assignBed(agent, state.beds);
      } else if (newState === 'I' && state.npis.testing.active) {
        assignBed(agent, state.quarantineBeds);
      } else if (newState === 'D') {
        agent.vx = 0; agent.vy = 0;
      }
    }
  });
}

// --- Agent Sandbox Physics and Contact Logic ---
function updateAgentSandboxPhysics() {
  const S_LIST = [];
  const I_LIST = [];
  
  // 1. Move and separate agents by compartment/bounds
  state.agents.forEach(agent => {
    if (agent.state === 'D') return; // Dead don't move

    let minX = 10, maxX = 475;
    let minY = 10, maxY = 410;
    let baseSpeed = state.npis.lockdown.active ? 0.15 : 1.2;

    if (agent.state === 'H') {
      // Confined to Hospital Ward ICU box
      minX = 495; maxX = 670;
      minY = 10; maxY = 200;
      baseSpeed = 0.1; // restricted ICU movement
      
      if (agent.bedIndex === -1) {
        assignBed(agent, state.beds);
      }
      
      // Pull gently towards its bed coordinate
      if (agent.bedIndex !== -1 && state.beds[agent.bedIndex]) {
        const bed = state.beds[agent.bedIndex];
        agent.x += (bed.x - agent.x) * 0.1;
        agent.y += (bed.y - agent.y) * 0.1;
      }
    } else if (agent.state === 'I' && state.npis.testing.active) {
      // Quarantine Box bounds
      minX = 495; maxX = 670;
      minY = 220; maxY = 410;
      baseSpeed = 0.2;
      
      if (agent.bedIndex === -1) {
        assignBed(agent, state.quarantineBeds);
      }

      if (agent.bedIndex !== -1 && state.quarantineBeds[agent.bedIndex]) {
        const bed = state.quarantineBeds[agent.bedIndex];
        agent.x += (bed.x - agent.x) * 0.1;
        agent.y += (bed.y - agent.y) * 0.1;
      }
    } else {
      // Normal Community Bounds
      if (agent.bedIndex !== -1) {
        // Clear bed indices
        agent.bedIndex = -1;
      }
      
      // Standard physics update
      // Add slight brownian walk
      const angleChange = (Math.random() - 0.5) * 0.5;
      const curAngle = Math.atan2(agent.vy, agent.vx) + angleChange;
      agent.vx = Math.cos(curAngle) * baseSpeed;
      agent.vy = Math.sin(curAngle) * baseSpeed;

      agent.x += agent.vx;
      agent.y += agent.vy;
    }

    // Boundary constraints with bounce
    if (agent.x < minX) { agent.x = minX; agent.vx *= -1; }
    if (agent.x > maxX) { agent.x = maxX; agent.vx *= -1; }
    if (agent.y < minY) { agent.y = minY; agent.vy *= -1; }
    if (agent.y > maxY) { agent.y = maxY; agent.vy *= -1; }

    // Partition lists for contact matching
    if (agent.state === 'S') S_LIST.push(agent);
    if (agent.state === 'I') I_LIST.push(agent);
  });

  // 2. Vaccine Campaign distribution injection
  if (state.npis.vaccine.active) {
    const dailyVaccineQuota = Math.round(state.agentPopSize * (state.vaccineSpeed / 100.0) / state.ticksPerDay);
    let injected = 0;
    
    // Attempt to immunize random susceptible
    for (let c = 0; c < dailyVaccineQuota; c++) {
      const sus = S_LIST[Math.floor(Math.random() * S_LIST.length)];
      if (sus) {
        if (Math.random() * 100 < state.vaccineEfficacy) {
          sus.state = 'V';
          sus.vaccineShieldActive = true;
          // remove from list so we don't vaccinate twice
          S_LIST.splice(S_LIST.indexOf(sus), 1);
        }
      }
    }
  }

  // 3. Collision Transmission Proximity Checks (S <-> I)
  // Mask intervention slashes probability
  const contactRadius = 8; // distance in pixels
  let tickBeta = state.beta / state.ticksPerDay * 3.0; // scale transmission velocity
  if (state.npis.masks.active) tickBeta *= 0.30; // 70% reduction

  S_LIST.forEach(sAgent => {
    I_LIST.forEach(iAgent => {
      // Ensure infected is not in quarantine/hospital
      if (iAgent.bedIndex !== -1 && (state.npis.testing.active || iAgent.state === 'H')) return;

      const dx = sAgent.x - iAgent.x;
      const dy = sAgent.y - iAgent.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < contactRadius * contactRadius) {
        if (Math.random() < tickBeta) {
          sAgent.state = 'E';
          sAgent.timer = Math.round((state.incubationPeriod * (0.8 + Math.random() * 0.4)) * state.ticksPerDay);
        }
      }
    });
  });

  // 4. Timer counters & Compartment Transitions
  state.agents.forEach(agent => {
    if (agent.state === 'E') {
      agent.timer--;
      if (agent.timer <= 0) {
        agent.state = 'I';
        agent.timer = Math.round((state.infectiousPeriod * (0.8 + Math.random() * 0.4)) * state.ticksPerDay);
        // Clear bed index if any leftover
        if (agent.bedIndex !== -1) {
          clearBed(agent.bedIndex, state.quarantineBeds);
          agent.bedIndex = -1;
        }
      }
    } else if (agent.state === 'I') {
      agent.timer--;
      if (agent.timer <= 0) {
        // Decide hospitalization vs recovery
        if (Math.random() * 100 < state.hospitalizationRate) {
          agent.state = 'H';
          agent.timer = Math.round((state.hospitalDuration * (0.8 + Math.random() * 0.4)) * state.ticksPerDay);
          if (agent.bedIndex !== -1) {
            clearBed(agent.bedIndex, state.quarantineBeds);
            agent.bedIndex = -1;
          }
        } else {
          agent.state = 'R';
          if (agent.bedIndex !== -1) {
            clearBed(agent.bedIndex, state.quarantineBeds);
            agent.bedIndex = -1;
          }
        }
      }
    } else if (agent.state === 'H') {
      agent.timer--;
      if (agent.timer <= 0) {
        // Hospitalized outcome: Deceased or Recovered
        // Check if hospital is overloaded
        const hospCount = state.agents.filter(a => a.state === 'H').length;
        const capLimit = Math.max(1, Math.ceil(state.agentPopSize * (state.icuCapacity / 100)));
        let activeMortality = state.baseMortality / 100.0;
        
        if (hospCount > capLimit) {
          activeMortality *= state.overloadMultiplier;
          activeMortality = Math.min(0.99, activeMortality);
          
          if (state.metrics.icuBreachedDay === null) {
            state.metrics.icuBreachedDay = state.day;
            logAlert(`Day ${state.day}: AGENT WARD CRITICAL CAPACITY BREACHED! Mortality surge.`, 'critical');
          }
        } else {
          if (state.metrics.icuBreachedDay !== null && hospCount <= capLimit) {
            state.metrics.icuBreachedDay = null;
            logAlert(`Day ${state.day}: Agent Hospital pressure normalized.`, 'info');
          }
        }

        // Release bed
        if (agent.bedIndex !== -1) {
          clearBed(agent.bedIndex, state.beds);
          agent.bedIndex = -1;
        }

        if (Math.random() < activeMortality) {
          agent.state = 'D';
          agent.vx = 0; agent.vy = 0;
        } else {
          agent.state = 'R';
        }
      }
    }
  });

  // Calculate counts for legend
  const counts = { S: 0, E: 0, I: 0, R: 0, H: 0, D: 0, V: 0 };
  state.agents.forEach(a => counts[a.state]++);
  
  state.compartments = {
    S: counts.S, E: counts.E, I: counts.I, R: counts.R, H: counts.H, D: counts.D, V: counts.V
  };

  // Empirical Rt
  let activeBeta = state.beta;
  if (state.npis.lockdown.active) activeBeta *= 0.25;
  if (state.npis.masks.active) activeBeta *= 0.30;
  state.metrics.currentRt = activeBeta * state.infectiousPeriod * (counts.S / state.agentPopSize);
}

function assignBed(agent, bedsList) {
  const freeBedIdx = bedsList.findIndex(b => !b.occupied);
  if (freeBedIdx !== -1) {
    bedsList[freeBedIdx].occupied = true;
    bedsList[freeBedIdx].agentId = agent.id;
    agent.bedIndex = freeBedIdx;
  }
}

function clearBed(bedIdx, bedsList) {
  if (bedIdx >= 0 && bedIdx < bedsList.length) {
    bedsList[bedIdx].occupied = false;
    bedsList[bedIdx].agentId = null;
  }
}

// --- History Tracker ---
function recordHistoryPoint() {
  const denom = state.engine === 'ODE' ? 100.0 : state.agentPopSize;
  const factor = 100.0 / denom;

  state.history.days.push(state.day);
  state.history.S.push(state.compartments.S * factor);
  state.history.E.push(state.compartments.E * factor);
  state.history.I.push(state.compartments.I * factor);
  state.history.R.push(state.compartments.R * factor);
  state.history.H.push(state.compartments.H * factor);
  state.history.D.push(state.compartments.D * factor);
  state.history.V.push(state.compartments.V * factor);
  state.history.Rt.push(state.metrics.currentRt);

  // Monitor Metrics peaks
  const activeInfectedPct = (state.compartments.I + state.compartments.E) * factor;
  if (activeInfectedPct > state.metrics.peakInfected) {
    state.metrics.peakInfected = activeInfectedPct;
    state.metrics.peakInfectedDay = state.day;
  }

  const activeHospPct = state.compartments.H * factor;
  if (activeHospPct > state.metrics.peakIcuBurden) {
    state.metrics.peakIcuBurden = activeHospPct;
  }

  state.metrics.totalDeceased = state.engine === 'ODE' 
    ? (state.compartments.D / 100 * state.agentPopSize).toFixed(1)
    : state.compartments.D;
}

// --- Telemetry Alerts ---
function logAlert(message, type) {
  const alertLog = document.getElementById('alertLog');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerText = `[${new Date().toLocaleTimeString([], { hour12: false })}] ${message}`;
  alertLog.appendChild(entry);
  alertLog.scrollTop = alertLog.scrollHeight;
}

// --- UI Indicators ---
function updateUI() {
  document.getElementById('telemetryDay').innerText = state.day;
  
  const denom = state.engine === 'ODE' ? 100.0 : state.agentPopSize;
  const factor = 100.0 / denom;

  // Compartment counters
  document.getElementById('countS').innerText = Math.round(state.compartments.S);
  document.getElementById('countE').innerText = Math.round(state.compartments.E);
  document.getElementById('countI').innerText = Math.round(state.compartments.I);
  document.getElementById('countH').innerText = Math.round(state.compartments.H);
  document.getElementById('countR').innerText = Math.round(state.compartments.R);
  document.getElementById('countD').innerText = Math.round(state.compartments.D);
  document.getElementById('countV').innerText = Math.round(state.compartments.V);

  // Telemetry KPIs
  document.getElementById('kpiPeakInfected').innerText = state.metrics.peakInfected.toFixed(1) + '%';
  document.getElementById('kpiPeakInfectedDay').innerText = 'Day ' + state.metrics.peakInfectedDay;
  
  document.getElementById('kpiTotalDeceased').innerText = Math.round(state.metrics.totalDeceased);
  const mortalityPercent = (state.metrics.totalDeceased / state.agentPopSize * 100);
  document.getElementById('kpiMortalityRate').innerText = mortalityPercent.toFixed(1) + '% mortality';

  const peakHospPct = state.metrics.peakIcuBurden;
  document.getElementById('kpiIcuBurden').innerText = peakHospPct.toFixed(1) + '%';
  
  if (peakHospPct > state.icuCapacity) {
    document.getElementById('kpiIcuBreached').innerText = 'BREACHED DAY ' + state.metrics.icuBreachedDay;
    document.getElementById('kpiIcuBreached').style.color = 'var(--color-infectious)';
  } else {
    document.getElementById('kpiIcuBreached').innerText = 'NORMAL';
    document.getElementById('kpiIcuBreached').style.color = 'var(--color-text-secondary)';
  }

  document.getElementById('kpiRt').innerText = state.metrics.currentRt.toFixed(2);
  const rtStatus = document.getElementById('kpiRtStatus');
  if (state.metrics.currentRt > 1.0) {
    rtStatus.innerText = 'EXPONENTIAL GROWTH';
    rtStatus.style.color = 'var(--color-infectious)';
  } else {
    rtStatus.innerText = 'OUTBREAK CONTAINED';
    rtStatus.style.color = 'var(--color-susceptible)';
  }

  // Draw Charts
  drawCurvesChart();
  drawRtChart();
}

// --- HTML5 Canvas Plotting ---

function drawScene() {
  // Clear Sandbox Canvas
  sandboxCtx.fillStyle = '#05070a';
  sandboxCtx.fillRect(0, 0, sandboxCanvas.width, sandboxCanvas.height);

  // Draw Arena Divider Boundaries
  sandboxCtx.strokeStyle = 'rgba(57, 255, 20, 0.12)';
  sandboxCtx.lineWidth = 2;
  sandboxCtx.beginPath();
  sandboxCtx.moveTo(485, 0);
  sandboxCtx.lineTo(485, sandboxCanvas.height);
  sandboxCtx.stroke();

  sandboxCtx.beginPath();
  sandboxCtx.moveTo(485, 210);
  sandboxCtx.lineTo(sandboxCanvas.width, 210);
  sandboxCtx.stroke();

  // Zone Title Labels
  sandboxCtx.font = "bold 10px 'Outfit'";
  sandboxCtx.fillStyle = 'rgba(57, 255, 20, 0.4)';
  sandboxCtx.fillText("MAIN COMMUNITY CONFINEMENT", 15, 22);

  sandboxCtx.fillStyle = 'rgba(0, 240, 255, 0.5)';
  sandboxCtx.fillText("CRITICAL WARD (ICU)", 495, 22);

  // Hospital Capacity bed occupancy subtext
  const hospCount = state.engine === 'ODE'
    ? Math.round((state.compartments.H / 100) * state.agentPopSize)
    : state.agents.filter(a => a.state === 'H').length;
  const maxHospBeds = Math.max(1, Math.ceil(state.agentPopSize * (state.icuCapacity / 100)));
  sandboxCtx.font = "9px monospace";
  sandboxCtx.fillStyle = hospCount > maxHospBeds ? 'var(--color-infectious)' : 'var(--color-text-secondary)';
  sandboxCtx.fillText(`Beds Occupied: ${hospCount}/${maxHospBeds}`, 495, 33);

  sandboxCtx.font = "bold 10px 'Outfit'";
  sandboxCtx.fillStyle = 'var(--color-exposed)';
  sandboxCtx.fillText("CONTAINMENT QUARANTINE", 495, 232);
  
  const quarCount = state.engine === 'ODE'
    ? Math.round((state.compartments.I / 100) * state.agentPopSize * (state.npis.testing.active ? 1 : 0))
    : state.agents.filter(a => a.state === 'I' && a.bedIndex !== -1).length;
  sandboxCtx.font = "9px monospace";
  sandboxCtx.fillStyle = 'var(--color-text-secondary)';
  sandboxCtx.fillText(`Isolated: ${quarCount}/20`, 495, 243);

  // Draw visual bed grid frames
  drawBedSlotFrames(state.beds, sandboxCtx, 'rgba(0, 240, 255, 0.15)');
  drawBedSlotFrames(state.quarantineBeds, sandboxCtx, 'rgba(255, 170, 0, 0.15)');

  // Draw NPI lockdown status directly on canvas for premium effect
  if (state.npis.lockdown.active) {
    sandboxCtx.font = "11px monospace";
    sandboxCtx.fillStyle = 'rgba(255, 56, 56, 0.25)';
    sandboxCtx.fillText("⚠️ COMMUNITY UNDER LOCKDOWN: VELOCITIES RESTRICTED", 15, 400);
  }

  // Draw Agents
  state.agents.forEach(agent => {
    let color = 'var(--color-susceptible)';
    let radius = 3.5;
    let drawShield = false;
    let drawInfectRing = false;

    switch (agent.state) {
      case 'S': color = 'var(--color-susceptible)'; break;
      case 'E': color = 'var(--color-exposed)'; break;
      case 'I': 
        color = 'var(--color-infectious)'; 
        radius = 4;
        drawInfectRing = (agent.bedIndex === -1); // only rings in public
        break;
      case 'H': color = 'var(--color-hospitalized)'; radius = 3; break;
      case 'R': color = 'var(--color-recovered)'; break;
      case 'D': 
        // Render deceased as static small cross
        sandboxCtx.strokeStyle = 'rgba(112, 122, 138, 0.5)';
        sandboxCtx.lineWidth = 1.5;
        sandboxCtx.beginPath();
        sandboxCtx.moveTo(agent.x - 3, agent.y);
        sandboxCtx.lineTo(agent.x + 3, agent.y);
        sandboxCtx.moveTo(agent.x, agent.y - 3);
        sandboxCtx.lineTo(agent.x, agent.y + 3);
        sandboxCtx.stroke();
        return;
      case 'V': 
        color = 'var(--color-vaccinated)'; 
        drawShield = true;
        break;
    }

    // Draw active contacts ring
    if (drawInfectRing) {
      sandboxCtx.strokeStyle = 'rgba(255, 56, 56, 0.15)';
      sandboxCtx.fillStyle = 'rgba(255, 56, 56, 0.03)';
      sandboxCtx.lineWidth = 1;
      sandboxCtx.beginPath();
      sandboxCtx.arc(agent.x, agent.y, 8, 0, Math.PI * 2);
      sandboxCtx.fill();
      sandboxCtx.stroke();
    }

    // Draw particles
    sandboxCtx.fillStyle = color;
    sandboxCtx.beginPath();
    sandboxCtx.arc(agent.x, agent.y, radius, 0, Math.PI * 2);
    sandboxCtx.fill();

    // Draw Vaccine Shield ring
    if (drawShield) {
      sandboxCtx.strokeStyle = 'rgba(182, 0, 255, 0.6)';
      sandboxCtx.lineWidth = 1;
      sandboxCtx.beginPath();
      sandboxCtx.arc(agent.x, agent.y, 6, 0, Math.PI * 2);
      sandboxCtx.stroke();
    }
  });
}

function drawBedSlotFrames(beds, ctx, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  beds.forEach(bed => {
    ctx.strokeRect(bed.x - 6, bed.y - 8, 12, 16);
    // pillow
    ctx.strokeRect(bed.x - 6, bed.y - 8, 12, 4);
  });
}

// --- Custom Canvas Line Plotter ---
function drawCurvesChart() {
  const ctx = curveCtx;
  const w = curveCanvas.width;
  const h = curveCanvas.height;
  
  // Clear
  ctx.fillStyle = '#0d0f12';
  ctx.fillRect(0, 0, w, h);

  // Border & Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const y = (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(w - 10, y);
    ctx.stroke();

    ctx.font = '8px monospace';
    ctx.fillStyle = '#556270';
    ctx.fillText(`${100 - i * 25}%`, 5, y + 3);
  }

  // Draw X axis grid days
  const size = state.history.days.length;
  if (size === 0) return;

  const getX = (d) => 30 + (d / state.maxDays) * (w - 45);
  const getY = (v) => h - 15 - (v / 100.0) * (h - 25);

  // Hospital Capacity ICU overload line
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  const capY = getY(state.icuCapacity);
  ctx.beginPath();
  ctx.moveTo(30, capY);
  ctx.lineTo(w - 10, capY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
  ctx.fillText('ICU LIMIT', w - 55, capY - 4);

  // Draw Paths for Compartments
  drawChartLine(ctx, state.history.S, 'var(--color-susceptible)', getX, getY);
  drawChartLine(ctx, state.history.E, 'var(--color-exposed)', getX, getY);
  drawChartLine(ctx, state.history.I, 'var(--color-infectious)', getX, getY);
  drawChartLine(ctx, state.history.R, 'var(--color-recovered)', getX, getY);
  drawChartLine(ctx, state.history.H, 'var(--color-hospitalized)', getX, getY);
  drawChartLine(ctx, state.history.D, 'var(--color-deceased)', getX, getY);
  drawChartLine(ctx, state.history.V, 'var(--color-vaccinated)', getX, getY);

  // Border bounds
  ctx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 5, w - 40, h - 20);

  // X axis labels
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('0', 30, h - 3);
  ctx.fillText(`Day ${state.maxDays}`, w - 40, h - 3);
}

function drawChartLine(ctx, data, color, getX, getY) {
  if (data.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(getX(0), getY(data[0]));
  for (let i = 1; i < data.length; i++) {
    ctx.lineTo(getX(state.history.days[i]), getY(data[i]));
  }
  ctx.stroke();
}

function drawRtChart() {
  const ctx = rtCtx;
  const w = rtCanvas.width;
  const h = rtCanvas.height;

  ctx.fillStyle = '#0d0f12';
  ctx.fillRect(0, 0, w, h);

  const size = state.history.Rt.length;
  if (size === 0) return;

  const getX = (d) => 30 + (d / state.maxDays) * (w - 45);
  // Max Rt scale is 4.0
  const getY = (rt) => h - 15 - (rt / 4.0) * (h - 22);

  // Draw Rt=1 threshold dashed line
  ctx.strokeStyle = 'rgba(255, 56, 56, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(30, getY(1.0));
  ctx.lineTo(w - 10, getY(1.0));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255, 56, 56, 0.7)';
  ctx.fillText('Rt=1.0', w - 45, getY(1.0) - 2);

  // Draw Rt Curve
  ctx.strokeStyle = 'var(--color-hazard)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(getX(0), getY(state.history.Rt[0]));
  for (let i = 1; i < size; i++) {
    ctx.lineTo(getX(state.history.days[i]), getY(state.history.Rt[i]));
  }
  ctx.stroke();

  // Grid border bounds
  ctx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 5, w - 40, h - 20);

  // Y-axis markers
  ctx.font = '8px monospace';
  ctx.fillStyle = '#556270';
  ctx.fillText('4.0', 5, getY(4.0) + 6);
  ctx.fillText('2.0', 5, getY(2.0) + 3);
  ctx.fillText('0.0', 5, getY(0.0) + 0);
}

// --- Hover Interactivity Crosshairs ---
let hoverIndex = -1;

function handleChartHover(e) {
  const rect = curveCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const w = curveCanvas.width;
  
  if (mx < 30 || mx > w - 10 || state.history.days.length === 0) {
    clearChartHover();
    return;
  }
  
  // Find closest day indices
  const relativeX = (mx - 30) / (w - 45);
  const dayHover = Math.round(relativeX * state.maxDays);
  
  hoverIndex = state.history.days.indexOf(dayHover);
  if (hoverIndex === -1) {
    // find nearest
    hoverIndex = state.history.days.reduce((prev, curr, idx) => {
      return (Math.abs(curr - dayHover) < Math.abs(state.history.days[prev] - dayHover) ? idx : prev);
    }, 0);
  }

  // Draw overlay on Curve canvas
  drawCurvesChart();
  drawHoverCrosshairs(curveCtx, curveCanvas.height);
}

function drawHoverCrosshairs(ctx, h) {
  if (hoverIndex === -1 || hoverIndex >= state.history.days.length) return;
  const w = curveCanvas.width;
  const d = state.history.days[hoverIndex];

  const getX = (day) => 30 + (day / state.maxDays) * (w - 45);
  const x = getX(d);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(x, 5);
  ctx.lineTo(x, h - 15);
  ctx.stroke();
  ctx.setLineDash([]);

  // Read values
  const s = state.history.S[hoverIndex].toFixed(1);
  const e = state.history.E[hoverIndex].toFixed(1);
  const i = state.history.I[hoverIndex].toFixed(1);
  const r = state.history.R[hoverIndex].toFixed(1);
  const hVal = state.history.H[hoverIndex].toFixed(1);
  const dVal = state.history.D[hoverIndex].toFixed(1);
  const vVal = state.history.V[hoverIndex].toFixed(1);

  // Draw simple overlay popup box
  ctx.fillStyle = 'rgba(2, 6, 12, 0.95)';
  ctx.strokeStyle = 'var(--color-border)';
  ctx.lineWidth = 1.5;
  
  // Position box dynamically depending on hover side
  const boxW = 110;
  const boxH = 92;
  const boxX = x > w / 2 ? x - boxW - 10 : x + 10;
  const boxY = 15;

  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = 'var(--color-hazard)';
  ctx.fillText(`DAY ${d}`, boxX + 6, boxY + 11);

  ctx.font = '7.5px monospace';
  ctx.fillStyle = 'var(--color-susceptible)';
  ctx.fillText(`Suscept: ${s}%`, boxX + 6, boxY + 22);
  ctx.fillStyle = 'var(--color-exposed)';
  ctx.fillText(`Exposed: ${e}%`, boxX + 6, boxY + 32);
  ctx.fillStyle = 'var(--color-infectious)';
  ctx.fillText(`Infects: ${i}%`, boxX + 6, boxY + 42);
  ctx.fillStyle = 'var(--color-hospitalized)';
  ctx.fillText(`Crit/ICU: ${hVal}%`, boxX + 6, boxY + 52);
  ctx.fillStyle = 'var(--color-recovered)';
  ctx.fillText(`Recover: ${r}%`, boxX + 6, boxY + 62);
  ctx.fillStyle = 'var(--color-deceased)';
  ctx.fillText(`Deceased: ${dVal}%`, boxX + 6, boxY + 72);
  ctx.fillStyle = 'var(--color-vaccinated)';
  ctx.fillText(`Vaccines: ${vVal}%`, boxX + 6, boxY + 82);
}

function clearChartHover() {
  hoverIndex = -1;
  drawCurvesChart();
}

// --- CSV Data Exporter ---
function exportCSV() {
  if (state.history.days.length === 0) {
    logAlert('Export failed. No simulator history logged yet.', 'warning');
    return;
  }
  
  let csv = 'Day,Susceptible,Exposed,Infectious,Recovered,Hospitalized,Deceased,Vaccinated,Rt\n';
  
  for (let i = 0; i < state.history.days.length; i++) {
    csv += `${state.history.days[i]},`;
    csv += `${state.history.S[i].toFixed(2)},`;
    csv += `${state.history.E[i].toFixed(2)},`;
    csv += `${state.history.I[i].toFixed(2)},`;
    csv += `${state.history.R[i].toFixed(2)},`;
    csv += `${state.history.H[i].toFixed(2)},`;
    csv += `${state.history.D[i].toFixed(2)},`;
    csv += `${state.history.V[i].toFixed(2)},`;
    csv += `${state.history.Rt[i].toFixed(3)}\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `epidemiology_simulation_log_day_${state.day}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  logAlert('Compartmental data exported successfully.', 'success');
}
