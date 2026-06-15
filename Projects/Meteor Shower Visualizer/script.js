'use strict';

/* ─── STREAM DATA ─── */
const STREAMS = {
  perseids: { label:'Perseids', color:'#00e5ff', speed:2.5, size:1.5, trailLen:25, intensity:1.0 },
  leonids:  { label:'Leonids',  color:'#00e676', speed:3.0, size:1.0, trailLen:20, intensity:0.9 },
  geminids: { label:'Geminids', color:'#ffd600', speed:1.8, size:2.5, trailLen:35, intensity:1.2 },
  custom:   { label:'Custom',   color:'#b388ff', speed:2.0, size:1.8, trailLen:22, intensity:1.0 }
};

/* ─── DOM REFS ─── */
const $ = id => document.getElementById(id);
const canvas = $('skyCanvas');
const ctx = canvas.getContext('2d');
const streamSelect = $('streamSelect');
const sliderRate = $('sliderRate');
const sliderVel = $('sliderVel');
const sliderAngle = $('sliderAngle');
const sliderDensity = $('sliderDensity');
const unitRate = $('unitRate');
const unitVel = $('unitVel');
const unitAngle = $('unitAngle');
const unitDensity = $('unitDensity');
const canvasHint = $('canvasHint');
const telemHint = $('telemHint');
const topBadge = $('topBadge');
const countVal = $('countVal');
const keVal = $('keVal');
const lumVal = $('lumVal');
const tmCount = $('tmCount');
const tmKE = $('tmKE');
const tmLum = $('tmLum');
const tmPeak = $('tmPeak');
const tmStream = $('tmStream');
const btnStart = $('btnStart');
const btnBolide = $('btnBolide');
const btnFlush = $('btnFlush');

/* ─── STATE ─── */
let running = false;
let rafId = null;
let bgStars = [];
let meteors = [];
let trails = []; // independent trail segments for fade
let explosions = []; // bolide explosion particles
let bolideActive = false;
let totalCount = 0;
let totalKE = 0;
let totalLum = 0;
let peakMag = 0;
let frameTick = 0;

/* ─── PARAMS ─── */
function getParams() {
  return {
    rate: parseInt(sliderRate.value),
    vel: parseFloat(sliderVel.value),
    angle: parseInt(sliderAngle.value),
    density: parseInt(sliderDensity.value) / 100
  };
}

function updateUnits() {
  const p = getParams();
  unitRate.textContent = p.rate+'/hr';
  unitVel.textContent = p.vel.toFixed(1)+'×';
  unitAngle.textContent = p.angle+'°';
  unitDensity.textContent = Math.round(p.density*100)+'%';
}

/* ─── BACKGROUND STARS ─── */
function initBgStars() {
  bgStars = [];
  const p = getParams();
  const count = Math.round(80 + p.density * 250);
  for (let i=0; i<count; i++) {
    bgStars.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.2 + Math.random()*0.6,
      phase: Math.random()*Math.PI*2,
      speed: 0.3 + Math.random()*1.2
    });
  }
}

/* ─── METEOR CLASS ─── */
function createMeteor(x, y, vx, vy, stream, overrideSize) {
  const s = STREAMS[stream];
  const speedScale = getParams().vel;
  return {
    x, y,
    vx: vx * speedScale,
    vy: vy * speedScale,
    size: overrideSize || s.size,
    color: s.color,
    trail: [],
    maxTrail: Math.round(s.trailLen * speedScale),
    alpha: 0.9,
    life: 0,
    maxLife: 80 + Math.random()*40,
    intensity: s.intensity,
    stream
  };
}

function spawnMeteor() {
  const p = getParams();
  const stream = streamSelect.value;
  const s = STREAMS[stream];
  const angleRad = p.angle * Math.PI / 180;
  const baseSpeed = s.speed * (0.6 + Math.random()*0.8) * p.vel;

  // spawn from top edge
  const x = Math.random() * (canvas.width / window.devicePixelRatio || 500);
  const y = -10;
  const vx = Math.sin(angleRad) * baseSpeed * (Math.random()*0.5 + 0.5);
  const vy = Math.cos(angleRad) * baseSpeed * (0.5 + Math.random()*0.5);

  meteors.push(createMeteor(x, y, vx, vy, stream));
}

/* ─── BOLIDE FIREBALL ─── */
function spawnBolide() {
  if (bolideActive) return;
  bolideActive = true;
  const p = getParams();
  const stream = streamSelect.value;
  const x = Math.random() * 0.4 * (canvas.width / window.devicePixelRatio || 500) + 50;
  const y = -30;
  const vx = 0.3 + Math.random()*0.5;
  const vy = 0.8 + Math.random()*0.4;

  const bolide = createMeteor(x, y, vx, vy, stream, 4);
  bolide.isBolide = true;
  bolide.maxLife = 150;
  bolide.maxTrail = 45;
  bolide.alpha = 1.0;
  meteors.push(bolide);
  toast('⚡ Bolide fireball incoming!');
}

function explodeBolide(m) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  // radial explosion burst
  const count = 20 + Math.floor(Math.random()*15);
  for (let i=0; i<count; i++) {
    const angle = (Math.PI*2 * i) / count + (Math.random()-0.5)*0.3;
    const speed = 1 + Math.random()*3;
    explosions.push({
      x: m.x, y: m.y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      size: 1 + Math.random()*2,
      alpha: 0.9,
      life: 0,
      maxLife: 30 + Math.random()*20,
      color: '#ff1744'
    });
  }
  totalCount += 50; // bonus
  toast('💥 Bolide detonated — large energy release');
}

/* ─── UPDATE ─── */
function updateMeteors() {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  totalKE = 0;
  totalLum = 0;
  let peak = 0;

  // spawn new meteors
  const prob = getParams().rate * 0.002;
  if (Math.random() < prob && running) {
    spawnMeteor();
    totalCount++;
  }

  for (let i=meteors.length-1; i>=0; i--) {
    const m = meteors[i];
    m.life++;

    // store trail
    m.trail.push({ x: m.x, y: m.y });
    if (m.trail.length > m.maxTrail) m.trail.shift();

    // move
    m.x += m.vx;
    m.y += m.vy;
    // slight gravity
    m.vy += 0.01;

    // bolide check
    if (m.isBolide && m.y > h * 0.45 && !m.exploded) {
      m.exploded = true;
      explodeBolide(m);
    }

    // fade
    const lifeRatio = m.life / m.maxLife;
    m.alpha = Math.max(0, 0.9 * (1 - lifeRatio));

    // energy
    const ke = m.size * (Math.abs(m.vx) + Math.abs(m.vy)) * 10;
    totalKE += ke;

    // luminosity
    const lum = m.intensity * m.size * m.alpha * 20;
    totalLum += lum;
    if (m.alpha > 0.1 && m.intensity * m.size > peak) peak = m.intensity * m.size;

    // remove
    if (m.life >= m.maxLife || m.alpha <= 0.01 || m.x < -50 || m.x > w+50 || m.y > h+50) {
      meteors.splice(i, 1);
    }
  }

  // update explosions
  for (let i=explosions.length-1; i>=0; i--) {
    const e = explosions[i];
    e.x += e.vx;
    e.y += e.vy;
    e.vy += 0.02;
    e.alpha *= 0.96;
    e.life++;
    if (e.life >= e.maxLife || e.alpha < 0.01) explosions.splice(i, 1);
  }

  // bolive active check
  if (bolideActive && !meteors.some(m => m.isBolide)) bolideActive = false;

  peakMag = peak;
  updateTelemetry();
}

/* ─── DRAW ─── */
function drawScene() {
  const dpr = window.devicePixelRatio || 1;
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth || 500;
  const h = Math.max(280, w * 0.55);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);

  // background
  const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w*0.7);
  grad.addColorStop(0,'#0a0e1a');
  grad.addColorStop(1,'#05060b');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,w,h);

  // horizon glow
  const hGrad = ctx.createLinearGradient(0, h*0.8, 0, h);
  hGrad.addColorStop(0,'transparent');
  hGrad.addColorStop(1,'rgba(0,50,80,0.05)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, h*0.8, w, h*0.2);

  // background stars
  frameTick++;
  for (const s of bgStars) {
    const alpha = 0.02 + Math.sin(frameTick*0.02 * s.speed + s.phase) * 0.02 + 0.01;
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0, alpha)})`;
    ctx.fill();
  }

  // trails
  for (const m of meteors) {
    for (let t=0; t<m.trail.length; t++) {
      const pt = m.trail[t];
      const ta = m.alpha * (t / m.trail.length) * 0.5;
      const sz = m.size * (t / m.trail.length) * 0.8;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(0.3, sz), 0, Math.PI*2);
      ctx.fillStyle = m.color.replace('1)', ta+')');
      ctx.fill();
    }
  }

  // explosions
  for (const e of explosions) {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size * e.alpha, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,23,68,${e.alpha*0.8})`;
    ctx.fill();
    // glow
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size * e.alpha * 3, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,23,68,${e.alpha*0.1})`;
    ctx.fill();
  }

  // meteor heads
  for (const m of meteors) {
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI*2);
    ctx.fillStyle = m.color;
    ctx.fill();
    // glow
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size*3, 0, Math.PI*2);
    ctx.fillStyle = m.color + '22';
    ctx.fill();
  }
}

/* ─── TELEMETRY ─── */
function updateTelemetry() {
  countVal.textContent = totalCount;
  keVal.textContent = Math.round(totalKE);
  lumVal.textContent = Math.round(totalLum);

  tmCount.textContent = totalCount;
  tmKE.textContent = Math.round(totalKE) + ' GJ';
  tmLum.textContent = Math.round(totalLum);
  tmPeak.textContent = peakMag > 0 ? peakMag.toFixed(1) : '--';
  tmStream.textContent = STREAMS[streamSelect.value].label.toUpperCase();
  tmStream.style.color = STREAMS[streamSelect.value].color;
}

/* ─── LOOP ─── */
function loop() {
  if (!running) return;
  updateMeteors();
  drawScene();
  rafId = requestAnimationFrame(loop);
}

function startShower() {
  if (running) return;
  running = true;
  initBgStars();
  btnStart.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> HALT INFLOW';
  btnStart.style.opacity = '0.6';
  canvasHint.textContent = 'METEOR STREAM ACTIVE';
  canvasHint.style.color = STREAMS[streamSelect.value].color;
  telemHint.textContent = 'TRACKING';
  telemHint.style.color = '#ffd600';
  topBadge.textContent = 'ACTIVE';
  topBadge.style.color = STREAMS[streamSelect.value].color;
  topBadge.style.borderColor = STREAMS[streamSelect.value].color+'33';
  toast('Atmospheric inflow initiated');
  loop();
}

function stopShower() {
  running = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  btnStart.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><polygon points="5 3 19 12 5 21 5 3"/></svg> Initiate Atmospheric Inflow Run';
  btnStart.style.opacity = '1';
  canvasHint.textContent = 'HALTED';
  canvasHint.style.color = '#ffb800';
  telemHint.textContent = 'PAUSED';
  topBadge.textContent = 'HALTED';
  topBadge.style.color = '#ffb800';
  topBadge.style.borderColor = 'rgba(255,184,0,0.2)';
}

/* ─── FLUSH ─── */
function flushChannels() {
  stopShower();
  meteors = [];
  explosions = [];
  trails = [];
  bolideActive = false;
  totalCount = 0;
  totalKE = 0;
  totalLum = 0;
  peakMag = 0;

  sliderRate.value = 15;
  sliderVel.value = 1.0;
  sliderAngle.value = 45;
  sliderDensity.value = 50;
  updateUnits();
  initBgStars();

  countVal.textContent = '0';
  keVal.textContent = '0';
  lumVal.textContent = '0';
  tmCount.textContent = '0';
  tmKE.textContent = '0 GJ';
  tmLum.textContent = '0';
  tmPeak.textContent = '--';

  canvasHint.textContent = 'STANDBY';
  canvasHint.style.color = '';
  telemHint.textContent = 'IDLE';
  telemHint.style.color = '';
  topBadge.textContent = 'STANDBY';
  topBadge.style.color = '#4a5268';
  topBadge.style.borderColor = 'rgba(255,255,255,0.1)';

  drawScene();
  toast('Starfield channels flushed');
}

/* ─── STREAM CHANGE ─── */
function onStreamChange() {
  const s = STREAMS[streamSelect.value];
  if (running) {
    canvasHint.textContent = s.label.toUpperCase();
    canvasHint.style.color = s.color;
    topBadge.style.color = s.color;
    topBadge.style.borderColor = s.color+'33';
  }
  totast('Stream: ' + s.label);
}

/* ─── TOAST ─── */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('leave'); setTimeout(() => el.remove(), 300); }, 2500);
}

function totast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('leave'); setTimeout(() => el.remove(), 300); }, 2000);
}

/* ─── INIT ─── */
function init() {
  updateUnits();
  initBgStars();
  drawScene();

  [sliderRate, sliderVel, sliderAngle, sliderDensity].forEach(sl => {
    sl.addEventListener('input', () => {
      updateUnits();
      if (sl === sliderDensity) initBgStars();
    });
  });

  streamSelect.addEventListener('change', onStreamChange);

  btnStart.addEventListener('click', () => running ? stopShower() : startShower());
  btnBolide.addEventListener('click', spawnBolide);
  btnFlush.addEventListener('click', flushChannels);

  window.addEventListener('resize', () => { if (!running) drawScene(); });

  toast('Meteor Shower Visualizer ready');
}

document.addEventListener('DOMContentLoaded', init);
