/* DEMO-OS // Population Growth Analyzer Engine */

// DOM Elements
const presetSelect = document.getElementById('demography-preset');
const telemetryYear = document.getElementById('telemetry-year');
const telemetryGrowthFill = document.getElementById('telemetry-growth-fill');
const telemetryGrowthVal = document.getElementById('telemetry-growth-val');

const sliderTfr = document.getElementById('slider-tfr');
const valTfr = document.getElementById('val-tfr');
const sliderLifespan = document.getElementById('slider-lifespan');
const valLifespan = document.getElementById('val-lifespan');
const sliderInfant = document.getElementById('slider-infant-mortality');
const valInfant = document.getElementById('val-infant-mortality');
const sliderMigration = document.getElementById('slider-migration');
const valMigration = document.getElementById('val-migration');

const sliderSpeed = document.getElementById('slider-speed');
const valSpeed = document.getElementById('val-speed');
const btnPlay = document.getElementById('btn-play');
const btnStep = document.getElementById('btn-step');
const btnReset = document.getElementById('btn-reset');

const pyramidCanvas = document.getElementById('pyramid-canvas');
const telemetryPop = document.getElementById('telemetry-pop');
const telemetryMedianAge = document.getElementById('telemetry-median-age');

const dtmCanvas = document.getElementById('dtm-canvas');
const dtmStageBadge = document.getElementById('dtm-stage-badge');

const chartCanvas = document.getElementById('chart-canvas');

const telemetryCbr = document.getElementById('telemetry-cbr');
const telemetryCdr = document.getElementById('telemetry-cdr');
const telemetryDependency = document.getElementById('telemetry-dependency');
const telemetryChildPct = document.getElementById('telemetry-child-pct');
const telemetryRetireePct = document.getElementById('telemetry-retiree-pct');
const shakeEnvelope = document.getElementById('shake-envelope');

// Canvas Contexts
const pCtx = pyramidCanvas.getContext('2d');
const dCtx = dtmCanvas.getContext('2d');
const cCtx = chartCanvas.getContext('2d');

// Cohort Groups Labels
const COHORT_LABELS = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'];
const NUM_COHORTS = COHORT_LABELS.length;

// Baseline survival rates for lifespan = 76
const SURVIVAL_BASE = [0.992, 0.995, 0.990, 0.985, 0.978, 0.945, 0.880, 0.720, 0.380];

// Active State
let currentMales = new Array(NUM_COHORTS).fill(0);
let currentFemales = new Array(NUM_COHORTS).fill(0);

let startMales = new Array(NUM_COHORTS).fill(0);
let startFemales = new Array(NUM_COHORTS).fill(0);

let targetMales = new Array(NUM_COHORTS).fill(0);
let targetFemales = new Array(NUM_COHORTS).fill(0);

// Timeline year
let baseYear = 0;
let subStepYear = 0; // 0 to 10 sub-steps within 10-year generation
let frameCount = 0;

let tfr = 2.1;
let lifeExpectancy = 76;
let infantMortality = 0.5; // in %
let netMigration = 0;      // in thousands per generation

let isPlaying = false;
let playSpeed = 1.0; // seconds per generation step

// History tracker for projections chart (up to 10 steps = 100 years)
let historyYears = [];
let historyPop = [];
let historyDependency = [];

// Dimension globals
let pW = 400, pH = 300;
let dW = 400, dH = 250;
let cW = 400, cH = 250;

function resizeCanvases() {
  pW = pyramidCanvas.width = pyramidCanvas.parentElement.clientWidth;
  pH = pyramidCanvas.height = pyramidCanvas.parentElement.clientHeight || 280;

  dW = dtmCanvas.width = dtmCanvas.parentElement.clientWidth;
  dH = dtmCanvas.height = dtmCanvas.parentElement.clientHeight || 240;

  cW = chartCanvas.width = chartCanvas.parentElement.clientWidth;
  cH = chartCanvas.height = chartCanvas.parentElement.clientHeight || 240;
}

// Preset Profiles initial databases
const initialProfiles = {
  expansive: {
    tfr: 6.2,
    lifespan: 55,
    infant: 6.5,
    migration: 0,
    males: [6.8, 5.2, 4.0, 3.0, 2.1, 1.4, 0.8, 0.4, 0.1], // In Millions
    females: [6.6, 5.0, 3.8, 2.9, 2.0, 1.3, 0.8, 0.4, 0.15]
  },
  stable: {
    tfr: 1.9,
    lifespan: 79,
    infant: 0.5,
    migration: 15,
    males: [21.5, 22.0, 23.0, 22.5, 21.0, 20.0, 18.0, 12.0, 6.0],
    females: [20.5, 21.0, 22.0, 21.5, 20.5, 19.5, 18.5, 13.5, 8.5]
  },
  contracting: {
    tfr: 1.3,
    lifespan: 84,
    infant: 0.2,
    migration: 2,
    males: [5.2, 6.0, 6.6, 7.3, 8.2, 9.6, 10.0, 7.6, 4.2],
    females: [5.0, 5.7, 6.3, 6.9, 7.8, 9.3, 10.2, 8.6, 6.3]
  },
  baby_boom: {
    tfr: 4.2, // spike
    lifespan: 74,
    infant: 1.2,
    migration: 0,
    males: [15.2, 10.1, 10.1, 10.1, 10.1, 9.1, 7.1, 4.1, 1.6],
    females: [14.6, 9.9, 9.9, 9.9, 9.9, 8.9, 7.3, 4.6, 2.3]
  }
};

// Reset values matching preset configurations
function applyPreset(presetName) {
  const p = initialProfiles[presetName];
  if (!p) return;
  
  sliderTfr.value = Math.round(p.tfr * 10);
  sliderLifespan.value = p.lifespan;
  sliderInfant.value = Math.round(p.infant * 10);
  sliderMigration.value = p.migration * 10;
  
  updateParamsFromSliders();
  
  // Clone baseline arrays
  currentMales = [...p.males];
  currentFemales = [...p.females];
  
  startMales = [...currentMales];
  startFemales = [...currentFemales];
  
  // Calculate first target step projection
  calculateNextGenerationTarget();
  
  baseYear = 0;
  subStepYear = 0;
  
  // Reset projections chart history
  historyYears = [0];
  historyPop = [getTotalPopulation(currentMales, currentFemales)];
  historyDependency = [getDependencyRatio(currentMales, currentFemales)];
}

// Update digital label text readouts from inputs values
function updateParamsFromSliders() {
  tfr = parseFloat(sliderTfr.value) / 10.0;
  lifeExpectancy = parseInt(sliderLifespan.value);
  infantMortality = parseFloat(sliderInfant.value) / 10.0;
  netMigration = parseInt(sliderMigration.value); // in thousands
  
  valTfr.textContent = tfr.toFixed(2);
  valLifespan.textContent = `${lifeExpectancy} yrs`;
  valInfant.textContent = `${infantMortality.toFixed(1)}%`;
  valMigration.textContent = `${netMigration >= 0 ? '+' : ''}${netMigration}k`;
  
  playSpeed = parseInt(sliderSpeed.value) / 10.0;
  valSpeed.textContent = `${playSpeed.toFixed(1)}s / step`;
}

// Get total population sum (M)
function getTotalPopulation(m, f) {
  let sum = 0;
  for (let i = 0; i < NUM_COHORTS; i++) {
    sum += m[i] + f[i];
  }
  return sum;
}

// Get child dependency ratios (<20 and retiree >60 vs working 20-59)
function getDependencyRatio(m, f) {
  let dependents = 0;
  let working = 0;
  
  for (let i = 0; i < NUM_COHORTS; i++) {
    const pop = m[i] + f[i];
    if (i < 2 || i >= 6) {
      dependents += pop; // 0-19 and 60+
    } else {
      working += pop; // 20-59
    }
  }
  
  if (working === 0) return 0;
  return (dependents / working) * 100.0;
}

// Leslie Cohort Projection Matrix mathematical solver
function calculateNextGenerationTarget() {
  // 1. Calculate age-specific fertility rates
  const fertRates = new Array(NUM_COHORTS).fill(0);
  fertRates[1] = tfr * 0.10; // 10-19 cohort
  fertRates[2] = tfr * 0.45; // 20-29
  fertRates[3] = tfr * 0.35; // 30-39
  fertRates[4] = tfr * 0.10; // 40-49
  
  // Calculate births over a 10-year generation span
  let totalBirths = 0;
  for (let c = 1; c <= 4; c++) {
    totalBirths += startFemales[c] * fertRates[c];
  }
  
  // Apply Infant mortality survival rate
  const survivingBirths = totalBirths * (1.0 - infantMortality / 100.0);
  const newbornMales = survivingBirths * 0.51; // slightly higher male birth ratio
  const newbornFemales = survivingBirths * 0.49;
  
  // 2. Calculate scaled survival rates based on Life Expectancy slider
  const scaleRatio = lifeExpectancy / 76.0;
  const survival = SURVIVAL_BASE.map(s => Math.max(0.15, Math.min(0.999, Math.pow(s, 1.0 / scaleRatio))));
  
  // 3. Age cohorts Component aging transitions
  targetMales = new Array(NUM_COHORTS).fill(0);
  targetFemales = new Array(NUM_COHORTS).fill(0);
  
  // Older cohorts accumulate survivors
  targetMales[8] = startMales[8] * survival[8] + startMales[7] * survival[7];
  targetFemales[8] = startFemales[8] * survival[8] + startFemales[7] * survival[7];
  
  for (let c = 7; c >= 1; c--) {
    targetMales[c] = startMales[c-1] * survival[c-1];
    targetFemales[c] = startFemales[c-1] * survival[c-1];
  }
  
  targetMales[0] = newbornMales;
  targetFemales[0] = newbornFemales;
  
  // 4. Inject Net Migration vectors to young labor force (20-29 and 30-39 cohorts)
  const migrationMillions = netMigration / 1000.0; // convert thousands to Millions
  const migM = migrationMillions * 0.5;
  const migF = migrationMillions * 0.5;
  
  targetMales[2] += migM * 0.6;
  targetFemales[2] += migF * 0.6;
  
  targetMales[3] += migM * 0.4;
  targetFemales[3] += migF * 0.4;
  
  // Clamp boundaries limits
  for (let c = 0; c < NUM_COHORTS; c++) {
    targetMales[c] = Math.max(0.0, targetMales[c]);
    targetFemales[c] = Math.max(0.0, targetFemales[c]);
  }
}

// Step projection timeline 10 years forward
function stepGeneration() {
  // Copy target to start
  startMales = [...targetMales];
  startFemales = [...targetFemales];
  
  calculateNextGenerationTarget();
  
  baseYear += 10;
  subStepYear = 0;
  
  // Push projections trends history
  const currentPop = getTotalPopulation(startMales, startFemales);
  const currentDep = getDependencyRatio(startMales, startFemales);
  
  historyYears.push(baseYear);
  historyPop.push(currentPop);
  historyDependency.push(currentDep);
  
  // Limit chart history to 100 years (10 steps)
  if (historyYears.length > 11) {
    historyYears.shift();
    historyPop.shift();
    historyDependency.shift();
  }
}

// Render dynamic Age-Gender horizontal bars pyramid
function drawAgePyramid(malesDisp, femalesDisp) {
  pCtx.clearRect(0, 0, pW, pH);
  
  // Background
  pCtx.fillStyle = '#06080d';
  pCtx.fillRect(0, 0, pW, pH);
  
  // Center division axis line
  const centerX = pW / 2;
  const paddingY = 35;
  const barHeight = (pH - paddingY - 25) / NUM_COHORTS;
  
  // Draw centerline
  pCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  pCtx.lineWidth = 1;
  pCtx.beginPath();
  pCtx.moveTo(centerX, paddingY);
  pCtx.lineTo(centerX, pH - 25);
  pCtx.stroke();
  
  // Scale factor based on max cohort pop sizes
  const maxVal = Math.max(10.0, ...malesDisp, ...femalesDisp);
  const scaleMax = maxVal * 1.12;
  const maxBarWidth = centerX - 55;
  
  pCtx.font = '500 8.5px "Inter", sans-serif';
  pCtx.textAlign = 'center';
  
  for (let c = 0; c < NUM_COHORTS; c++) {
    const y = paddingY + (NUM_COHORTS - 1 - c) * barHeight;
    
    // Draw Male Bar (Cyan, left side)
    const mVal = malesDisp[c];
    const mWidth = (mVal / scaleMax) * maxBarWidth;
    
    // Gradient fill male
    const mGrad = pCtx.createLinearGradient(centerX - 20, 0, centerX - 20 - mWidth, 0);
    mGrad.addColorStop(0, 'rgba(0, 229, 255, 0.18)');
    mGrad.addColorStop(1, 'rgba(0, 229, 255, 0.82)');
    
    pCtx.fillStyle = mGrad;
    pCtx.fillRect(centerX - 20 - mWidth, y + 2, mWidth, barHeight - 4);
    pCtx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
    pCtx.strokeRect(centerX - 20 - mWidth, y + 2, mWidth, barHeight - 4);
    
    // Draw Female Bar (Pink, right side)
    const fVal = femalesDisp[c];
    const fWidth = (fVal / scaleMax) * maxBarWidth;
    
    // Gradient fill female
    const fGrad = pCtx.createLinearGradient(centerX + 20, 0, centerX + 20 + fWidth, 0);
    fGrad.addColorStop(0, 'rgba(255, 0, 127, 0.18)');
    fGrad.addColorStop(1, 'rgba(255, 0, 127, 0.82)');
    
    pCtx.fillStyle = fGrad;
    pCtx.fillRect(centerX + 20, y + 2, fWidth, barHeight - 4);
    pCtx.strokeStyle = 'rgba(255, 0, 127, 0.3)';
    pCtx.strokeRect(centerX + 20, y + 2, fWidth, barHeight - 4);
    
    // Label age group in center axis
    pCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    pCtx.fillText(COHORT_LABELS[c], centerX, y + barHeight/2 + 3);
    
    // Hover value readouts at ends
    pCtx.fillStyle = 'rgba(0, 229, 255, 0.65)';
    pCtx.textAlign = 'right';
    pCtx.fillText(`${mVal.toFixed(1)}M`, centerX - 25 - mWidth, y + barHeight/2 + 3);
    
    pCtx.fillStyle = 'rgba(255, 0, 127, 0.65)';
    pCtx.textAlign = 'left';
    pCtx.fillText(`${fVal.toFixed(1)}M`, centerX + 25 + fWidth, y + barHeight/2 + 3);
    pCtx.textAlign = 'center';
  }
  
  // Headers Gender labels
  pCtx.fillStyle = '#00e5ff';
  pCtx.font = '700 9px "Fira Code", monospace';
  pCtx.fillText('MALES', centerX - 60, paddingY - 12);
  
  pCtx.fillStyle = '#ff007f';
  pCtx.fillText('FEMALES', centerX + 60, paddingY - 12);
  
  // Bottom scale lines representation
  pCtx.fillStyle = 'rgba(148, 163, 184, 0.3)';
  pCtx.font = '7.5px "Fira Code", monospace';
  pCtx.fillText('Population sizes in Millions (M)', centerX, pH - 8);
}

// Map CBR/CDR to Demographic Transition Model Stages
function getDTMStage(cbr, cdr) {
  let stageVal = 1.0;
  if (cbr > 35 && cdr > 25) {
    stageVal = 0.5; // Stage 1 (High Births/Deaths)
  } else if (cbr > 28 && cdr > 13) {
    // Stage 2: Death rates fall, birth rate stays high
    const u = (25 - cdr) / 12;
    stageVal = 1.0 + Math.max(0, Math.min(1, u)) * 1.0;
  } else if (cbr > 15 && cdr <= 13) {
    // Stage 3: Birth rates drops
    const u = (28 - cbr) / 13;
    stageVal = 2.0 + Math.max(0, Math.min(1, u)) * 1.0;
  } else if (cbr <= 15 && cbr >= cdr) {
    // Stage 4: Birth and death rate balances low
    const u = (15 - cbr) / (15 - cdr || 1);
    stageVal = 3.0 + Math.max(0, Math.min(1, u)) * 1.0;
  } else {
    // Stage 5: Birth rate drops below death rate (declining)
    const diff = cdr - cbr;
    const u = Math.min(1.0, diff / 4.0);
    stageVal = 4.0 + u * 1.0;
  }
  return Math.max(0.1, Math.min(4.9, stageVal));
}

// Render Demographic Transition curves and cursor highlights
function drawDTM() {
  dCtx.clearRect(0, 0, dW, dH);
  
  dCtx.fillStyle = '#06080d';
  dCtx.fillRect(0, 0, dW, dH);
  
  const pad = 35;
  const graphW = dW - 2 * pad;
  const graphH = dH - 2 * pad;
  
  // DTM Stage vertical bounds division lines
  dCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  dCtx.lineWidth = 1;
  const stageWidth = graphW / 5;
  
  for (let s = 1; s <= 4; s++) {
    const x = pad + s * stageWidth;
    dCtx.beginPath();
    dCtx.moveTo(x, pad);
    dCtx.lineTo(x, pad + graphH);
    dCtx.stroke();
  }
  
  // Label DTM Stages at bottom
  dCtx.fillStyle = 'rgba(148, 163, 184, 0.4)';
  dCtx.font = '7.5px "Fira Code", monospace';
  dCtx.textAlign = 'center';
  const stageLabels = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'];
  for (let s = 0; s < 5; s++) {
    dCtx.fillText(stageLabels[s], pad + s * stageWidth + stageWidth/2, pad + graphH + 11);
  }
  
  // Plot CBR line curve (Red)
  dCtx.strokeStyle = '#10b981'; // Green CBR
  dCtx.lineWidth = 2.0;
  dCtx.beginPath();
  // Stage 1 to 5 values CBR
  dCtx.moveTo(pad, pad + graphH * 0.1);
  dCtx.lineTo(pad + stageWidth, pad + graphH * 0.1);
  dCtx.quadraticCurveTo(pad + 2.5 * stageWidth, pad + graphH * 0.1, pad + 3 * stageWidth, pad + graphH * 0.5);
  dCtx.lineTo(pad + 4 * stageWidth, pad + graphH * 0.7);
  dCtx.quadraticCurveTo(pad + 4.5 * stageWidth, pad + graphH * 0.8, pad + graphW, pad + graphH * 0.85);
  dCtx.stroke();
  
  // Plot CDR line curve (Blue)
  dCtx.strokeStyle = '#ef4444'; // Red CDR
  dCtx.beginPath();
  dCtx.moveTo(pad, pad + graphH * 0.15);
  dCtx.quadraticCurveTo(pad + 1.2 * stageWidth, pad + graphH * 0.15, pad + 2 * stageWidth, pad + graphH * 0.65);
  dCtx.lineTo(pad + 3 * stageWidth, pad + graphH * 0.7);
  dCtx.lineTo(pad + 4 * stageWidth, pad + graphH * 0.72);
  dCtx.quadraticCurveTo(pad + 4.6 * stageWidth, pad + graphH * 0.7, pad + graphW, pad + graphH * 0.65);
  dCtx.stroke();
  
  // Legends
  dCtx.fillStyle = '#10b981';
  dCtx.font = '8px "Inter", sans-serif';
  dCtx.fillText('CBR (Births)', pad + 40, pad + 15);
  dCtx.fillStyle = '#ef4444';
  dCtx.fillText('CDR (Deaths)', pad + 40, pad + 25);
  
  // Compute active DTM stage of current population
  const activePopMales = currentMales;
  const activePopFemales = currentFemales;
  const pop = getTotalPopulation(activePopMales, activePopFemales);
  
  // CBR, CDR formulas representation
  const fertilityRates = new Array(NUM_COHORTS).fill(0);
  fertilityRates[1] = tfr * 0.10;
  fertilityRates[2] = tfr * 0.45;
  fertilityRates[3] = tfr * 0.35;
  fertilityRates[4] = tfr * 0.10;
  
  let births = 0;
  for (let c = 1; c <= 4; c++) {
    births += activePopFemales[c] * fertilityRates[c];
  }
  // births and deaths per generation scaled to yearly Crude representation
  const crudeBirth = (births / pop) * 100.0; 
  
  const scale = lifeExpectancy / 76.0;
  const survival = SURVIVAL_BASE.map(s => Math.max(0.15, Math.min(0.999, Math.pow(s, 1.0 / scale))));
  
  let deaths = 0;
  for (let c = 0; c < NUM_COHORTS; c++) {
    deaths += (activePopMales[c] + activePopFemales[c]) * (1.0 - survival[c]);
  }
  const crudeDeath = (deaths / pop) * 100.0;
  
  const stageVal = getDTMStage(crudeBirth, crudeDeath);
  
  // Render DTM highlight indicator line
  const cursorX = pad + (stageVal / 5) * graphW;
  dCtx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
  dCtx.lineWidth = 1.6;
  dCtx.setLineDash([3, 3]);
  dCtx.beginPath();
  dCtx.moveTo(cursorX, pad);
  dCtx.lineTo(cursorX, pad + graphH);
  dCtx.stroke();
  dCtx.setLineDash([]);
  
  // Draw glow indicator circle
  dCtx.fillStyle = '#00e5ff';
  dCtx.beginPath();
  dCtx.arc(cursorX, pad + graphH/2, 5, 0, Math.PI * 2);
  dCtx.fill();
  
  // Update DTM layout label
  const stageNum = Math.floor(stageVal) + 1;
  dtmStageBadge.textContent = `STAGE ${stageNum}`;
  
  // Update alert status
  dtmStageBadge.className = 'badge';
  if (stageNum === 2) dtmStageBadge.classList.add('live-badge'); // high growth
  else if (stageNum === 5) dtmStageBadge.classList.add('hazard-badge'); // decline
  else dtmStageBadge.classList.add('tech-badge');
}

// Render projection timeline chart
function drawProjectionsChart() {
  cCtx.clearRect(0, 0, cW, cH);
  
  cCtx.fillStyle = '#06080d';
  cCtx.fillRect(0, 0, cW, cH);
  
  const pad = 35;
  const graphW = cW - 2 * pad;
  const graphH = cH - 2 * pad;
  
  // Draw Grid lines
  cCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  cCtx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const x = pad + (g / 4) * graphW;
    cCtx.beginPath();
    cCtx.moveTo(x, pad);
    cCtx.lineTo(x, pad + graphH);
    cCtx.stroke();
    
    // Year label
    cCtx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    cCtx.font = '8px "Fira Code", monospace';
    cCtx.textAlign = 'center';
    cCtx.fillText(`+${g * 25}y`, x, pad + graphH + 11);
  }
  
  // Horizontal grids
  cCtx.textAlign = 'right';
  for (let g = 0; g <= 3; g++) {
    const y = pad + (g / 3) * graphH;
    cCtx.beginPath();
    cCtx.moveTo(pad, y);
    cCtx.lineTo(pad + graphW, y);
    cCtx.stroke();
  }
  
  // Plot Population History (Emerald Green)
  if (historyYears.length > 1) {
    const maxPop = Math.max(50.0, ...historyPop) * 1.12;
    
    // Draw Pop line
    cCtx.beginPath();
    for (let i = 0; i < historyYears.length; i++) {
      const x = pad + (historyYears[i] / 100) * graphW;
      const y = pad + graphH - (historyPop[i] / maxPop) * graphH;
      if (i === 0) cCtx.moveTo(x, y);
      else cCtx.lineTo(x, y);
    }
    cCtx.strokeStyle = '#10b981';
    cCtx.lineWidth = 2.0;
    cCtx.stroke();
    
    // Plot Dependency History (Gold)
    cCtx.beginPath();
    for (let i = 0; i < historyYears.length; i++) {
      const x = pad + (historyYears[i] / 100) * graphW;
      const y = pad + graphH - Math.max(0, Math.min(100, historyDependency[i])) / 100 * graphH;
      if (i === 0) cCtx.moveTo(x, y);
      else cCtx.lineTo(x, y);
    }
    cCtx.strokeStyle = '#f59e0b';
    cCtx.lineWidth = 1.8;
    cCtx.stroke();
    
    // Left axis label
    cCtx.fillStyle = '#10b981';
    cCtx.fillText(`${maxPop.toFixed(0)}M`, pad - 4, pad + 3);
    cCtx.fillText('0M', pad - 4, pad + graphH + 3);
    
    // Right axis label (Dependency %)
    cCtx.fillStyle = '#f59e0b';
    cCtx.textAlign = 'left';
    cCtx.fillText('100%', pad + graphW + 4, pad + 3);
    cCtx.fillText('0%', pad + graphW + 4, pad + graphH + 3);
  }
}

// Compute median age of population structure
function calculateMedianAge(m, f) {
  const total = getTotalPopulation(m, f);
  if (total === 0) return 0;
  
  let accumulated = 0;
  const target = total / 2.0;
  
  for (let c = 0; c < NUM_COHORTS; c++) {
    accumulated += m[c] + f[c];
    if (accumulated >= target) {
      // Linear interpolation within 10-year cohort bracket
      const prevAccum = accumulated - (m[c] + f[c]);
      const fraction = (target - prevAccum) / (m[c] + f[c]);
      return c * 10 + fraction * 10;
    }
  }
  return 85.0;
}

// Update telemetry dashboard dials and gauges
function updateTelemetryDials() {
  const malesDisp = currentMales;
  const femalesDisp = currentFemales;
  const pop = getTotalPopulation(malesDisp, femalesDisp);
  
  // 1. Total Pop
  telemetryPop.textContent = `${pop.toFixed(1)}M`;
  
  // 2. Median age
  const medAge = calculateMedianAge(malesDisp, femalesDisp);
  telemetryMedianAge.textContent = `${medAge.toFixed(1)} yrs`;
  
  // 3. Crude Birth / Death rates
  const fertRates = new Array(NUM_COHORTS).fill(0);
  fertRates[1] = tfr * 0.10;
  fertRates[2] = tfr * 0.45;
  fertRates[3] = tfr * 0.35;
  fertRates[4] = tfr * 0.10;
  
  let births = 0;
  for (let c = 1; c <= 4; c++) {
    births += femalesDisp[c] * fertRates[c];
  }
  const cbrVal = (births / pop) * 100.0;
  
  const scale = lifeExpectancy / 76.0;
  const survival = SURVIVAL_BASE.map(s => Math.max(0.15, Math.min(0.999, Math.pow(s, 1.0 / scale))));
  
  let deaths = 0;
  for (let c = 0; c < NUM_COHORTS; c++) {
    deaths += (malesDisp[c] + femalesDisp[c]) * (1.0 - survival[c]);
  }
  const cdrVal = (deaths / pop) * 100.0;
  
  telemetryCbr.textContent = `${cbrVal.toFixed(1)} / 1k`;
  telemetryCdr.textContent = `${cdrVal.toFixed(1)} / 1k`;
  
  // 4. Dependency ratio
  const depRatio = getDependencyRatio(malesDisp, femalesDisp);
  telemetryDependency.textContent = `${depRatio.toFixed(1)}%`;
  
  // child vs retiree percentages
  let childPop = 0;
  let retireePop = 0;
  for (let c = 0; c < NUM_COHORTS; c++) {
    const cp = malesDisp[c] + femalesDisp[c];
    if (c < 2) childPop += cp;
    if (c >= 6) retireePop += cp;
  }
  telemetryChildPct.textContent = `${((childPop / pop) * 100.0).toFixed(1)}%`;
  telemetryRetireePct.textContent = `${((retireePop / pop) * 100.0).toFixed(1)}%`;
  
  // 5. Growth rate
  const annualGrowth = (cbrVal - cdrVal) / 10.0; // representational annual growth %
  telemetryGrowthVal.textContent = `${annualGrowth >= 0 ? '+' : ''}${annualGrowth.toFixed(2)}%`;
  
  // Fill growth bar: bounds -2.0% to +4.0%
  const growthPercent = Math.max(0, Math.min(100, ((annualGrowth + 2.0) / 6.0) * 100));
  telemetryGrowthFill.style.width = `${growthPercent}%`;
  
  if (annualGrowth < 0.0) {
    telemetryGrowthFill.style.backgroundColor = 'var(--color-danger)';
  } else if (annualGrowth < 0.5) {
    telemetryGrowthFill.style.backgroundColor = 'var(--color-warning)';
  } else {
    telemetryGrowthFill.style.backgroundColor = 'var(--color-success)';
  }
}

// Smoothly interpolate cohort bars in draw tick loop
function updateInterpolation() {
  if (isPlaying) {
    subStepYear += 0.08 * playSpeed;
    if (subStepYear >= 1.0) {
      stepGeneration();
    }
  }
  
  // Interpolate displayed population bars
  const malesDisp = new Array(NUM_COHORTS);
  const femalesDisp = new Array(NUM_COHORTS);
  
  for (let c = 0; c < NUM_COHORTS; c++) {
    malesDisp[c] = startMales[c] + (targetMales[c] - startMales[c]) * subStepYear;
    femalesDisp[c] = startFemales[c] + (targetFemales[c] - startFemales[c]) * subStepYear;
  }
  
  // Update year ticker
  const displayYear = baseYear + Math.floor(subStepYear * 10);
  telemetryYear.textContent = `Year ${displayYear}`;
  
  // Render
  drawAgePyramid(malesDisp, femalesDisp);
  drawDTM();
  drawProjectionsChart();
  updateTelemetryDials();
}

// Tick Simulation animation loop
function tick() {
  frameCount++;
  
  updateInterpolation();
  
  requestAnimationFrame(tick);
}

// Event Listeners
// Sliders inputs binds
sliderTfr.addEventListener('input', () => {
  updateParamsFromSliders();
  calculateNextGenerationTarget();
});

sliderLifespan.addEventListener('input', () => {
  updateParamsFromSliders();
  calculateNextGenerationTarget();
});

sliderInfant.addEventListener('input', () => {
  updateParamsFromSliders();
  calculateNextGenerationTarget();
});

sliderMigration.addEventListener('input', () => {
  updateParamsFromSliders();
  calculateNextGenerationTarget();
});

sliderSpeed.addEventListener('input', updateParamsFromSliders);

// Operations buttons click events binds
btnPlay.addEventListener('click', () => {
  isPlaying = !isPlaying;
  btnPlay.textContent = isPlaying ? '⏸ Pause Projector' : '▶ Play Projector';
  btnPlay.classList.toggle('secondary');
});

btnStep.addEventListener('click', () => {
  if (!isPlaying) {
    stepGeneration();
  }
});

btnReset.addEventListener('click', () => {
  applyPreset(presetSelect.value);
});

presetSelect.addEventListener('change', () => {
  applyPreset(presetSelect.value);
});

// Load Page Initializations
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvases();
  
  applyPreset('stable'); // Stable Stage 4 USA defaults on load
  
  window.addEventListener('resize', () => {
    resizeCanvases();
  });
  
  tick();
});
