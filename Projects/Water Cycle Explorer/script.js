'use strict';

/* ─── PHASE DATA ─── */
const PHASE_INFO = {
  all: {
    tag:'ALL PHASES ACTIVE',
    desc:'Complete water cycle simulation across evaporation, condensation, precipitation, and surface runoff.',
    mass:'-- g/s',
    density:'-- g/m³',
    badge:'HYDROLOGICAL_CYCLE_ACTIVE',
    tagColor:'var(--aq)'
  },
  evap: {
    tag:'PHASE CHANGE: LIQUID → GAS',
    desc:'Solar radiation heats surface water, imparting kinetic energy to H₂O molecules. When surface energy exceeds latent heat of vaporization (2.26 MJ/kg), molecules escape as water vapor. Evaporation rate follows E_v = α · T where α is the mass-transfer coefficient.',
    mass:'+0.42 g/s',
    density:'17.3 g/m³',
    badge:'PHASE_TRANSITION_EVAPORATION',
    tagColor:'var(--am)'
  },
  cond: {
    tag:'PHASE CHANGE: GAS → LIQUID',
    desc:'Rising vapor reaches dew point altitude where air temperature drops below saturation. Latent heat is released (2.26 MJ/kg condensed). Microscopic aerosols (CCN — cloud condensation nuclei) seed droplet formation. Droplets aggregate at 1-50 µm radius.',
    mass:'-- g/s',
    density:'0.8 g/m³',
    badge:'ADIABATIC_COOLING_CONVECTION',
    tagColor:'var(--pu)'
  },
  precip: {
    tag:'PRECIPITATION CASCADE EVENT',
    desc:'When cloud droplets reach 100-200 µm, collision-coalescence and Bergeron ice-crystal processes trigger fall speeds of 2-9 m/s. Terminal velocity = sqrt((2mg)/(ρ·A·Cd)). Raindrop diameter ranges 0.5-4 mm with a Marshall-Palmer distribution.',
    mass:'−0.38 g/s',
    density:'-- g/m³',
    badge:'COLLISION_COALESCENCE_TRIGGER',
    tagColor:'var(--aq)'
  },
  runoff: {
    tag:'SURFACE HYDROLOGIC COLLECTION',
    desc:'Precipitation exceeding infiltration capacity flows as Hortonian overland flow. Sheet flow converges into rills and channels, following steepest descent gradient. Velocity follows Manning\'s equation: V = (1/n)R^(2/3)√S. Collected water returns to basin, closing the loop.',
    mass:'+0.15 g/s',
    density:'-- g/m³',
    badge:'GRAVITY_DRIVEN_CATCHMENT',
    tagColor:'var(--gr)'
  }
};

/* ─── DOM ─── */
const $ = id => document.getElementById(id);
const sliderSolar = $('sliderSolar');
const sliderHumidity = $('sliderHumidity');
const sliderWind = $('sliderWind');
const sliderBasin = $('sliderBasin');
const unitSolar = $('unitSolar');
const unitHumidity = $('unitHumidity');
const unitWind = $('unitWind');
const unitBasin = $('unitBasin');
const canvas = $('terrainCanvas');
const ctx = canvas.getContext('2d');
const phaseTag = $('phaseTag');
const infoDesc = $('infoDesc');
const infoMass = $('infoMass');
const infoDensity = $('infoDensity');
const infoBadge = $('infoBadge');
const canvasHint = $('canvasHint');
const infoHint = $('infoHint');
const topBadge = $('topBadge');
const phaseCount = $('phaseCount');
const waterCount = $('waterCount');
const vaporCount = $('vaporCount');

const btnStart = $('btnStart');
const btnStorm = $('btnStorm');
const btnReset = $('btnReset');

/* ─── STATE ─── */
let running = false;
let rafId = null;
let time = 0;
let activePhase = 'all';
let particles = [];
let stormActive = false;

/* ─── PARAMS ─── */
function getParams() {
  return {
    solar: parseInt(sliderSolar.value) / 100,
    humidity: parseInt(sliderHumidity.value) / 100,
    wind: parseFloat(sliderWind.value),
    basin: parseInt(sliderBasin.value) / 100
  };
}

function updateUnits() {
  const p = getParams();
  unitSolar.textContent = Math.round(p.solar*100)+'%';
  unitHumidity.textContent = Math.round(p.humidity*100)+'%';
  unitWind.textContent = p.wind.toFixed(1)+' m/s';
  unitBasin.textContent = Math.round(p.basin*100)+'%';
}

/* ─── TERRAIN ─── */
function terrainY(x, w, h) {
  // returns ground Y at fraction x of width
  const nx = x / w;
  if (nx < 0.35) return h * 0.7 + Math.sin(nx*8)*3; // ocean surface
  // beach slope
  const beach = (nx - 0.35) / 0.1;
  const baseY = h * 0.7 - beach * h * 0.25;
  // mountain
  const mountain = Math.max(0, Math.sin((nx - 0.45) * Math.PI / 0.5));
  const peak = mountain * h * 0.35;
  return baseY - peak;
}

function isOcean(x, w) {
  return (x / w) < 0.35;
}

function getSlope(x, w, h) {
  // approximate terrain slope at x (positive = going down)
  const dx = 2;
  const y1 = terrainY(x-dx, w, h);
  const y2 = terrainY(x+dx, w, h);
  return (y2 - y1) / (dx * 2);
}

/* ─── PARTICLES ─── */
function spawnEvap(p) {
  const pObj = getParams();
  const w = canvas.width, h = canvas.height;
  const oceanEnd = 0.35 * w;
  const x = 20 + Math.random() * (oceanEnd - 40);
  const speed = 0.3 + pObj.solar * 1.2 + (stormActive ? 2 : 0);
  particles.push({
    x, y: terrainY(x, w, h) - Math.random()*4,
    vx: (Math.random()-0.5)*0.2,
    vy: -(speed + Math.random()*0.4),
    phase: 'evap',
    size: 1 + Math.random()*2,
    alpha: 0.6 + Math.random()*0.4,
    life: 0,
    maxLife: 200 + Math.random()*100,
    origX: x
  });
}

function updateEvap(part, w, h) {
  const p = getParams();
  part.y += part.vy;
  part.x += part.vx + (p.wind * 0.02);
  part.life++;

  // transition to condensation at altitude
  if (part.y < h * 0.25) {
    part.phase = 'cond';
    part.vy = (Math.random()-0.5)*0.15;
    part.vx = p.wind * 0.05;
    part.alpha = 0.3;
    part.size = 2 + Math.random()*3;
    part.life = 0;
    part.maxLife = 150 + Math.random()*100;
  }

  // fade near top
  if (part.y < 10) part.alpha *= 0.98;
}

/* ─── CLOUDS / CONDENSATION ─── */
let cloudCenters = [];

function initCloudsIfNeeded(w) {
  if (cloudCenters.length > 0) return;
  for (let i = 0; i < 6; i++) {
    cloudCenters.push({
      x: 0.2*w + Math.random()*0.6*w,
      y: 20 + Math.random()*40,
      radius: 30 + Math.random()*60,
      droplets: 0
    });
  }
}

function spawnCond(p) {
  const w = canvas.width, h = canvas.height;
  // spawn around cloud centers
  if (cloudCenters.length === 0) return;
  const cloud = cloudCenters[Math.floor(Math.random()*cloudCenters.length)];
  const spread = cloud.radius * 0.6;
  const pObj = getParams();
  particles.push({
    x: cloud.x + (Math.random()-0.5)*spread,
    y: cloud.y + (Math.random()-0.5)*spread*0.3,
    vx: getParams().wind * 0.02 + (Math.random()-0.5)*0.1,
    vy: (Math.random()-0.5)*0.08,
    phase: 'cond',
    size: 2 + Math.random()*3,
    alpha: 0.2 + Math.random()*0.3,
    life: 0,
    maxLife: 120 + Math.random()*80,
    cloudId: cloudCenters.indexOf(cloud)
  });
}

function updateCond(part, w, h) {
  const p = getParams();
  part.x += part.vx + p.wind * 0.03;
  part.y += part.vy * 0.5;
  part.life++;
  part.alpha = Math.min(0.5, part.alpha + 0.002);

  // transition to precipitation when humidity high or storm
  const humidThresh = stormActive ? 0.3 : p.humidity;
  if (part.life > part.maxLife * (1 - humidThresh * 0.6) && Math.random() < 0.005) {
    part.phase = 'precip';
    part.vy = 1 + Math.random()*0.5 + (stormActive?2:0);
    part.vx = p.wind * 0.08;
    part.alpha = 0.9;
    part.size = 1;
    part.life = 0;
    part.maxLife = 80 + Math.random()*40;
  }
}

/* ─── PRECIPITATION ─── */
function spawnPrecip(p) {
  const w = canvas.width, h = canvas.height;
  if (cloudCenters.length === 0) return;
  const cloud = cloudCenters[Math.floor(Math.random()*cloudCenters.length)];
  const spread = cloud.radius * 0.4;
  const pObj = getParams();
  const prob = stormActive ? 0.15 : pObj.humidity * 0.08;
  if (Math.random() > prob) return;
  particles.push({
    x: cloud.x + (Math.random()-0.5)*spread,
    y: cloud.y + cloud.radius * 0.3,
    vx: pObj.wind * 0.12,
    vy: 1.5 + Math.random()*0.8 + (stormActive?3:0),
    phase: 'precip',
    size: 0.5 + Math.random()*0.8,
    alpha: 0.7 + Math.random()*0.3,
    life: 0,
    maxLife: 60 + Math.random()*30,
    length: 6 + Math.random()*8
  });
}

function updatePrecip(part, w, h) {
  const p = getParams();
  part.x += part.vx + p.wind * 0.05;
  part.y += part.vy;
  part.vy += 0.02; // gravity
  part.life++;

  // hit terrain
  const groundY = terrainY(part.x, w, h);
  if (part.y >= groundY - 2) {
    if (isOcean(part.x, w)) {
      // hit ocean, just die
      part.alpha = 0;
      part.life = part.maxLife;
    } else {
      // transition to runoff
      part.phase = 'runoff';
      part.y = groundY - 1;
      part.vy = 0;
      part.vx = 0.15 + getSlope(part.x, w, h) * 2;
      part.alpha = 0.7;
      part.size = 1.5;
      part.life = 0;
      part.maxLife = 150 + Math.random()*100;
    }
  }
}

/* ─── RUNOFF ─── */
function spawnRunoff(p) {
  // spawned from precipitation hitting land, not directly
}

function updateRunoff(part, w, h) {
  const p = getParams();
  const slope = getSlope(part.x, w, h);
  const speed = 0.3 + Math.abs(slope) * 2;
  part.x += (part.vx > 0 ? part.vx : 0.15) + speed * 0.5;
  part.y = terrainY(part.x, w, h) - 1;
  part.life++;

  // reached ocean
  if (isOcean(part.x, w)) {
    part.phase = 'evap'; // recycle
    part.y = terrainY(part.x, w, h) - Math.random()*5;
    part.vy = -(0.3 + getParams().solar * 0.8);
    part.vx = (Math.random()-0.5)*0.2;
    part.alpha = 0.6;
    part.size = 1 + Math.random()*2;
    part.life = 0;
    part.maxLife = 150 + Math.random()*100;
  }

  // fade if too far
  if (part.x > w * 0.95) part.alpha *= 0.95;
}

/* ─── PARTICLE MANAGER ─── */
function spawnParticles() {
  const p = getParams();
  const w = canvas.width, h = canvas.height;

  // evaporation from ocean
  for (let i=0; i<1+Math.floor(p.solar*3)+(stormActive?5:0); i++) {
    if (Math.random() < 0.3 + p.solar*0.5) spawnEvap();
  }

  // condensation
  if (p.humidity > 0.2) {
    spawnCond();
  }

  // precipitation
  spawnPrecip();

  // cap particles
  if (particles.length > 1200) {
    particles = particles.slice(-1000);
  }
}

function updateParticles() {
  const w = canvas.width, h = canvas.height;
  const p = getParams();

  for (let i = particles.length-1; i >= 0; i--) {
    const part = particles[i];
    part.life++;

    switch (part.phase) {
      case 'evap': updateEvap(part, w, h); break;
      case 'cond': updateCond(part, w, h); break;
      case 'precip': updatePrecip(part, w, h); break;
      case 'runoff': updateRunoff(part, w, h); break;
    }

    // remove dead
    if (part.life >= part.maxLife || part.alpha <= 0.01) {
      particles.splice(i, 1);
    }
  }
}

/* ─── DRAW ─── */
function drawScene() {
  const dpr = window.devicePixelRatio || 1;
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth || 600;
  const h = Math.max(240, w * 0.55);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr,dpr);

  // background gradient
  const skyGrad = ctx.createLinearGradient(0,0,0,h);
  skyGrad.addColorStop(0,'#0a1628');
  skyGrad.addColorStop(0.5,'#0d1e35');
  skyGrad.addColorStop(1,'#081018');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0,0,w,h);

  // stars at top
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let i=0; i<40; i++) {
    const sx = (i*137.5+50)%w;
    const sy = (i*97.3+20)%(h*0.15);
    ctx.fillRect(sx,sy,1,1);
  }

  // terrain profile
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 1) {
    ctx.lineTo(x, terrainY(x, w, h));
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  const landGrad = ctx.createLinearGradient(0,h*0.5,0,h);
  landGrad.addColorStop(0,'#1a2e1a');
  landGrad.addColorStop(0.3,'#1f3a1f');
  landGrad.addColorStop(0.7,'#152515');
  landGrad.addColorStop(1,'#0d1a0d');
  ctx.fillStyle = landGrad;
  ctx.fill();

  // mountain snow caps
  for (let x = 0; x < w; x++) {
    const nx = x/w;
    if (nx < 0.45 || nx > 0.85) continue;
    const y = terrainY(x, w, h);
    const peakH = h*0.35;
    const snowLine = h*0.52;
    if (y < snowLine) {
      const snowW = 3;
      const snowH = snowLine - y;
      ctx.fillStyle = 'rgba(200,220,255,0.15)';
      ctx.fillRect(x, y, snowW, snowH);
    }
  }

  // ocean waves
  drawOcean(w, h);

  // phase filter
  const show = (phase) => activePhase === 'all' || activePhase === phase;

  // draw particles
  for (const part of particles) {
    if (!show(part.phase)) continue;

    if (part.phase === 'precip') {
      // rain streak
      ctx.beginPath();
      ctx.moveTo(part.x, part.y);
      ctx.lineTo(part.x - part.vx*1.5, part.y + part.length);
      ctx.strokeStyle = `rgba(0,229,255,${part.alpha*0.7})`;
      ctx.lineWidth = part.size;
      ctx.stroke();
    } else if (part.phase === 'evap') {
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,184,0,${part.alpha*0.6})`;
      ctx.fill();
      // glow
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size*2.5, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,184,0,${part.alpha*0.08})`;
      ctx.fill();
    } else if (part.phase === 'cond') {
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI*2);
      ctx.fillStyle = `rgba(179,136,255,${part.alpha*0.4})`;
      ctx.fill();
    } else if (part.phase === 'runoff') {
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI*2);
      ctx.fillStyle = `rgba(0,230,118,${part.alpha*0.6})`;
      ctx.fill();
    }
  }

  // cloud clusters (drawn as background shapes)
  if (show('cond') || show('all')) {
    for (const cloud of cloudCenters) {
      if (!show('cond') && activePhase !== 'all') continue;
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.radius, cloud.radius*0.35, 0, 0, Math.PI*2);
      const alpha = stormActive ? 0.25 : 0.08 + getParams().humidity * 0.12;
      ctx.fillStyle = `rgba(179,136,255,${alpha})`;
      ctx.fill();
      // highlight
      ctx.beginPath();
      ctx.ellipse(cloud.x-4, cloud.y-2, cloud.radius*0.6, cloud.radius*0.15, 0, 0, Math.PI*2);
      ctx.fillStyle = `rgba(220,200,255,${alpha*0.3})`;
      ctx.fill();
    }
  }

  // phase labels on canvas
  ctx.font = '4.5px JetBrains Mono, monospace';
  const labels = [
    {x:w*0.08, y:h*0.9, txt:'OCEAN BASIN', col:'rgba(0,229,255,0.15)'},
    {x:w*0.6, y:h*0.82, txt:'TERRAIN', col:'rgba(0,230,118,0.12)'},
    {x:w*0.72, y:h*0.28, txt:'PEAK', col:'rgba(200,220,255,0.12)'}
  ];
  for (const l of labels) {
    ctx.fillStyle = l.col;
    ctx.textAlign = 'center';
    ctx.fillText(l.txt, l.x, l.y);
  }
}

function drawOcean(w, h) {
  const p = getParams();
  const oceanLine = h * 0.7;
  const amp = 3 + p.wind * 0.5;

  // ocean fill
  ctx.beginPath();
  ctx.moveTo(0, oceanLine);
  for (let x = 0; x <= w && x <= w*0.36; x += 2) {
    const wave = Math.sin(x * 0.03 + time * 2) * amp + Math.sin(x * 0.05 + time * 1.3) * amp*0.4;
    ctx.lineTo(x, oceanLine + wave);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  const oceanGrad = ctx.createLinearGradient(0,oceanLine,0,h);
  oceanGrad.addColorStop(0,'rgba(0,60,100,0.4)');
  oceanGrad.addColorStop(0.3,'rgba(0,40,80,0.5)');
  oceanGrad.addColorStop(1,'rgba(0,20,40,0.6)');
  ctx.fillStyle = oceanGrad;
  ctx.fill();

  // surface highlight
  ctx.beginPath();
  ctx.moveTo(0, oceanLine);
  for (let x = 0; x <= w && x <= w*0.36; x += 2) {
    const wave = Math.sin(x * 0.03 + time * 2) * amp + Math.sin(x * 0.05 + time * 1.3) * amp*0.4;
    ctx.lineTo(x, oceanLine + wave);
  }
  ctx.strokeStyle = `rgba(0,229,255,${0.08 + p.wind*0.01})`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

/* ─── INFORMATICS ─── */
function updateInfo() {
  const info = PHASE_INFO[activePhase];
  phaseTag.textContent = info.tag;
  phaseTag.style.color = info.tagColor;
  phaseTag.style.borderColor = info.tagColor === 'var(--aq)' ? 'var(--aqg)' :
    info.tagColor === 'var(--am)' ? 'var(--amg)' :
    info.tagColor === 'var(--pu)' ? 'var(--pug)' :
    'rgba(0,230,118,0.2)';
  infoDesc.textContent = info.desc;
  infoMass.textContent = info.mass;
  infoDensity.textContent = info.density;
  infoBadge.textContent = info.badge;

  // particle counts
  const p = getParams();
  const evapCount = particles.filter(p2 => p2.phase==='evap').length;
  const condCount = particles.filter(p2 => p2.phase==='cond').length;
  const precipCount = particles.filter(p2 => p2.phase==='precip').length;
  const runoffCount = particles.filter(p2 => p2.phase==='runoff').length;
  phaseCount.textContent = `${evapCount+condCount+precipCount+runoffCount}`;
  waterCount.textContent = precipCount + runoffCount;
  vaporCount.textContent = evapCount + condCount;

  canvasHint.textContent = stormActive ? '⚠ STORM ACTIVE' : 'LIVE';
  canvasHint.style.color = stormActive ? '#ff1744' : '#00e5ff';
  infoHint.textContent = activePhase.toUpperCase();
  topBadge.textContent = stormActive ? '⚠ STORM MODE' : activePhase === 'all' ? 'CYCLE ACTIVE' : activePhase.toUpperCase();
  topBadge.style.color = stormActive ? '#ff1744' : activePhase === 'all' ? '#00e5ff' :
    activePhase === 'evap' ? '#ffb800' : activePhase === 'cond' ? '#b388ff' :
    activePhase === 'precip' ? '#00e5ff' : '#00e676';
}

/* ─── LOOP ─── */
function tick() {
  if (!running) return;
  time += 0.016; // ~60fps delta

  updateUnits();
  initCloudsIfNeeded(canvas.width);
  spawnParticles();
  updateParticles();
  drawScene();
  updateInfo();

  rafId = requestAnimationFrame(tick);
}

function startLoop() {
  if (running) return;
  running = true;
  initCloudsIfNeeded(canvas.width);
  toast('Continuous Earth Cycle initiated');
  tick();
}

function stopLoop() {
  running = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

/* ─── ACTIONS ─── */
function triggerStorm() {
  stormActive = !stormActive;
  if (stormActive) {
    // heavy rain mode
    toast('⚠ Flash Storm Sub-Routine triggered — heavy precipitation');
  } else {
    toast('Storm subroutine deactivated');
  }
}

function resetMatrix() {
  stopLoop();
  particles = [];
  cloudCenters = [];
  stormActive = false;
  time = 0;
  sliderSolar.value = 50;
  sliderHumidity.value = 50;
  sliderWind.value = 5;
  sliderBasin.value = 50;
  activePhase = 'all';
  document.querySelectorAll('.phase-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.phase === 'all');
  });
  updateUnits();
  drawScene();
  updateInfo();
  canvasHint.textContent = 'STANDBY';
  canvasHint.style.color = '';
  infoHint.textContent = 'IDLE';
  topBadge.textContent = 'RESET';
  topBadge.style.color = '#4a5268';
  topBadge.style.borderColor = 'rgba(255,255,255,0.1)';
  toast('Hydrological core matrix reset');
}

/* ─── TOAST ─── */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('leave'); setTimeout(() => el.remove(), 300); }, 2500);
}

/* ─── INIT ─── */
function init() {
  // sliders
  [sliderSolar, sliderHumidity, sliderWind, sliderBasin].forEach(sl => {
    sl.addEventListener('input', updateUnits);
  });

  // phase buttons
  document.querySelectorAll('.phase-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.phase-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePhase = btn.dataset.phase;
      updateInfo();
      toast(`Phase isolated: ${PHASE_INFO[activePhase].tag}`);
    });
  });

  // action buttons
  btnStart.addEventListener('click', () => {
    if (running) { stopLoop(); btnStart.textContent = '⏹ STOPPED'; setTimeout(() => {
      btnStart.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><polygon points="5 3 19 12 5 21 5 3"/></svg> Initiate Continuous Earth Cycle';
    }, 1500); }
    else { startLoop(); btnStart.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Halt Cycle'; }
  });

  btnStorm.addEventListener('click', () => {
    if (!running) { toast('Start the cycle first'); return; }
    triggerStorm();
  });

  btnReset.addEventListener('click', resetMatrix);

  // window resize
  window.addEventListener('resize', () => {
    if (!running) drawScene();
  });

  // initial draw
  drawScene();
  updateInfo();
  updateUnits();
  toast('Water Cycle Explorer ready — press Start to begin');
}

document.addEventListener('DOMContentLoaded', init);
