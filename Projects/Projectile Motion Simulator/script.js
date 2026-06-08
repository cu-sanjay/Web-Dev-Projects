const canvas = document.getElementById('simulation-canvas');
const ctx = canvas.getContext('2d');
const viewport = document.getElementById('viewport');

const angleSlider = document.getElementById('angle-slider');
const angleReadout = document.getElementById('angle-readout');
const velocitySlider = document.getElementById('velocity-slider');
const velocityReadout = document.getElementById('velocity-readout');
const gravityBtns = document.querySelectorAll('.gravity-btn');
const rangeValue = document.getElementById('range-value');
const heightValue = document.getElementById('height-value');
const timeValue = document.getElementById('time-value');
const coordX = document.getElementById('coord-x');
const coordY = document.getElementById('coord-y');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const fireBtn = document.getElementById('fire-btn');

let theta = 45;
let u = 50;
let g = 9.81;
let isAnimating = false;
let currentTime = 0;
let trajectoryPoints = [];
let maxRange = 0;
let maxHeight = 0;
let flightTime = 0;
let animId = null;
let lastTimestamp = 0;

function toRad(deg) {
  return deg * Math.PI / 180;
}

function calcRange(thetaDeg, vel, grav) {
  return (vel * vel * Math.sin(2 * toRad(thetaDeg))) / grav;
}

function calcMaxHeight(thetaDeg, vel, grav) {
  const s = Math.sin(toRad(thetaDeg));
  return (vel * vel * s * s) / (2 * grav);
}

function calcFlightTime(thetaDeg, vel, grav) {
  return (2 * vel * Math.sin(toRad(thetaDeg))) / grav;
}

function computeTrajectory() {
  const T = calcFlightTime(theta, u, g);
  const thetaRad = toRad(theta);
  const steps = 500;
  const dt = T / steps;
  const points = [];

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const x = u * Math.cos(thetaRad) * t;
    const y = u * Math.sin(thetaRad) * t - 0.5 * g * t * t;

    if (y >= 0) {
      points.push({ x, y, t });
    } else {
      if (points.length > 0) {
        const prev = points[points.length - 1];
        const frac = prev.y / (prev.y - y);
        points.push({
          x: prev.x + (x - prev.x) * frac,
          y: 0,
          t: prev.t + (t - prev.t) * frac
        });
      }
      break;
    }
  }

  return points;
}

function getKinematicState(t) {
  const thetaRad = toRad(theta);
  const x = u * Math.cos(thetaRad) * t;
  const y = u * Math.sin(thetaRad) * t - 0.5 * g * t * t;
  return { x: Math.max(0, x), y: Math.max(0, y) };
}

function resizeCanvas() {
  const rect = viewport.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function getCanvasSize() {
  const dpr = window.devicePixelRatio || 1;
  return {
    w: canvas.width / dpr,
    h: canvas.height / dpr
  };
}

function getGraphBounds() {
  const margin = { left: 55, right: 20, top: 20, bottom: 40 };
  const size = getCanvasSize();
  const gw = size.w - margin.left - margin.right;
  const gh = size.h - margin.top - margin.bottom;

  const xRange = maxRange * 1.15;
  const yRange = maxHeight * 1.3;

  const xScale = gw / (xRange || 1);
  const yScale = gh / (yRange || 1);

  return { margin, gw, gh, xRange, yRange, xScale, yScale, size };
}

function toPixel(x, y, bounds) {
  const px = bounds.margin.left + x * bounds.xScale;
  const py = (bounds.size.h - bounds.margin.bottom) - y * bounds.yScale;
  return { px, py };
}

function formatAxisValue(val) {
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  if (val >= 100) return val.toFixed(0);
  if (val >= 10) return val.toFixed(1);
  return val.toFixed(2);
}

function drawGrid(bounds) {
  const { margin, gw, gh, xRange, yRange, size } = bounds;
  const ctx2 = ctx;

  ctx2.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx2.lineWidth = 1;
  ctx2.font = '9px ui-monospace, Consolas, monospace';
  ctx2.fillStyle = '#94a3b8';
  ctx2.textAlign = 'center';

  const xSteps = Math.min(Math.floor(gw / 60), 10);
  const xStepVal = xRange / xSteps;
  for (let i = 0; i <= xSteps; i++) {
    const v = i * xStepVal;
    const px = margin.left + (v / xRange) * gw;
    ctx2.beginPath();
    ctx2.moveTo(px, margin.top);
    ctx2.lineTo(px, size.h - margin.bottom);
    ctx2.stroke();
    ctx2.fillText(formatAxisValue(v), px, size.h - margin.bottom + 16);
  }

  const ySteps = Math.min(Math.floor(gh / 50), 8);
  const yStepVal = yRange / ySteps;
  ctx2.textAlign = 'right';
  for (let i = 0; i <= ySteps; i++) {
    const v = i * yStepVal;
    const py = (size.h - margin.bottom) - (v / yRange) * gh;
    ctx2.beginPath();
    ctx2.moveTo(margin.left, py);
    ctx2.lineTo(size.w - margin.right, py);
    ctx2.stroke();
    ctx2.fillText(formatAxisValue(v), margin.left - 6, py + 3);
  }

  ctx2.strokeStyle = '#1f2937';
  ctx2.lineWidth = 1.5;
  ctx2.beginPath();
  ctx2.moveTo(margin.left, margin.top);
  ctx2.lineTo(margin.left, size.h - margin.bottom);
  ctx2.lineTo(size.w - margin.right, size.h - margin.bottom);
  ctx2.stroke();

  ctx2.fillStyle = '#94a3b8';
  ctx2.font = '9px ui-monospace, Consolas, monospace';
  ctx2.textAlign = 'center';
  ctx2.fillText('x (m)', margin.left + gw / 2, size.h - 2);
  ctx2.textAlign = 'center';
  ctx2.fillText('y (m)', margin.left - 35, margin.top + gh / 2);
}

function drawTrajectory(bounds, traveledCount) {
  const ctx2 = ctx;
  if (trajectoryPoints.length < 2) return;

  for (let i = 1; i < trajectoryPoints.length; i++) {
    const p0 = toPixel(trajectoryPoints[i - 1].x, trajectoryPoints[i - 1].y, bounds);
    const p1 = toPixel(trajectoryPoints[i].x, trajectoryPoints[i].y, bounds);

    if (i <= traveledCount) {
      ctx2.beginPath();
      ctx2.moveTo(p0.px, p0.py);
      ctx2.lineTo(p1.px, p1.py);
      ctx2.strokeStyle = '#3b82f6';
      ctx2.lineWidth = 2.5;
      ctx2.stroke();
    } else {
      ctx2.beginPath();
      ctx2.moveTo(p0.px, p0.py);
      ctx2.lineTo(p1.px, p1.py);
      ctx2.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx2.lineWidth = 1.5;
      ctx2.stroke();
    }
  }
}

function drawProjectile(x, y, bounds) {
  const { px, py } = toPixel(x, y, bounds);
  const ctx2 = ctx;
  const radius = 6;

  const grad = ctx2.createRadialGradient(px - 2, py - 2, 0, px, py, radius * 2.5);
  grad.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
  grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
  grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
  ctx2.beginPath();
  ctx2.arc(px, py, radius * 2.5, 0, Math.PI * 2);
  ctx2.fillStyle = grad;
  ctx2.fill();

  ctx2.beginPath();
  ctx2.arc(px, py, radius, 0, Math.PI * 2);
  ctx2.fillStyle = '#3b82f6';
  ctx2.fill();

  ctx2.beginPath();
  ctx2.arc(px, py, radius, 0, Math.PI * 2);
  ctx2.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx2.lineWidth = 1.5;
  ctx2.stroke();
}

function drawMarkers(bounds) {
  const ctx2 = ctx;
  const apogeeIdx = Math.floor(trajectoryPoints.length / 2);
  for (let i = 1; i < trajectoryPoints.length; i++) {
    if (trajectoryPoints[i].y < trajectoryPoints[i - 1].y) {
      const apex = trajectoryPoints[i - 1];
      const { px, py } = toPixel(apex.x, apex.y, bounds);

      ctx2.beginPath();
      ctx2.arc(px, py, 4, 0, Math.PI * 2);
      ctx2.fillStyle = '#f59e0b';
      ctx2.fill();

      ctx2.beginPath();
      ctx2.arc(px, py, 7, 0, Math.PI * 2);
      ctx2.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx2.lineWidth = 2;
      ctx2.stroke();

      ctx2.fillStyle = '#f59e0b';
      ctx2.font = '9px ui-monospace, Consolas, monospace';
      ctx2.textAlign = 'left';
      ctx2.fillText('APEX ' + apex.y.toFixed(1) + 'm', px + 10, py + 3);
      break;
    }
  }

  if (trajectoryPoints.length > 0) {
    const last = trajectoryPoints[trajectoryPoints.length - 1];
    if (last.y === 0) {
      const { px, py } = toPixel(last.x, 0, bounds);

      ctx2.beginPath();
      ctx2.arc(px, py, 4, 0, Math.PI * 2);
      ctx2.fillStyle = '#10b981';
      ctx2.fill();

      ctx2.beginPath();
      ctx2.arc(px, py, 7, 0, Math.PI * 2);
      ctx2.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx2.lineWidth = 2;
      ctx2.stroke();

      ctx2.fillStyle = '#10b981';
      ctx2.font = '9px ui-monospace, Consolas, monospace';
      ctx2.textAlign = 'right';
      ctx2.fillText('IMPACT ' + last.x.toFixed(1) + 'm', px - 10, py + 3);
    }
  }
}

function drawDashLineX(x, y, bounds) {
  if (!isAnimating) return;
  const { px, py } = toPixel(x, y, bounds);
  const ctx2 = ctx;

  ctx2.setLineDash([3, 4]);
  ctx2.strokeStyle = 'rgba(245, 158, 11, 0.25)';
  ctx2.lineWidth = 1;
  ctx2.beginPath();
  ctx2.moveTo(px, py);
  ctx2.lineTo(px, bounds.size.h - bounds.margin.bottom);
  ctx2.stroke();

  ctx2.beginPath();
  ctx2.moveTo(bounds.margin.left, py);
  ctx2.lineTo(px, py);
  ctx2.stroke();
  ctx2.setLineDash([]);
}

function render(timestamp) {
  if (!isAnimating) return;

  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  currentTime += deltaTime;

  if (currentTime >= flightTime) {
    currentTime = flightTime;
    isAnimating = false;
    statusIndicator.classList.remove('flight');
    statusIndicator.classList.add('impacted');
    statusText.textContent = 'TARGET IMPACTED';
    fireBtn.disabled = false;
  }

  const state = getKinematicState(currentTime);
  const bounds = getGraphBounds();

  const size = getCanvasSize();
  ctx.clearRect(0, 0, size.w, size.h);
  ctx.fillStyle = '#070a13';
  ctx.fillRect(0, 0, size.w, size.h);

  drawGrid(bounds);
  drawTrajectory(bounds, trajectoryPoints.length);

  if (state.y > 0) {
    if (currentTime > 0.01) {
      drawDashLineX(state.x, state.y, bounds);
    }
  }

  drawMarkers(bounds);
  drawProjectile(state.x, state.y, bounds);

  coordX.textContent = state.x.toFixed(2);
  coordY.textContent = state.y.toFixed(2);

  if (isAnimating) {
    animId = requestAnimationFrame(render);
  }
}

function startSimulation() {
  if (isAnimating) return;

  cancelAnimationFrame(animId);

  maxRange = calcRange(theta, u, g);
  maxHeight = calcMaxHeight(theta, u, g);
  flightTime = calcFlightTime(theta, u, g);

  rangeValue.textContent = maxRange.toFixed(2) + ' m';
  heightValue.textContent = maxHeight.toFixed(2) + ' m';
  timeValue.textContent = flightTime.toFixed(2) + ' s';

  trajectoryPoints = computeTrajectory();
  currentTime = 0;
  lastTimestamp = 0;
  isAnimating = true;

  statusIndicator.className = 'flight';
  statusText.textContent = 'SIMULATION FLIGHT ACTIVE';
  fireBtn.disabled = true;
  fireBtn.textContent = 'SIMULATION IN PROGRESS...';

  animId = requestAnimationFrame(render);
}

function resetSimulation() {
  isAnimating = false;
  cancelAnimationFrame(animId);
  currentTime = 0;
  lastTimestamp = 0;

  statusIndicator.className = '';
  statusText.textContent = 'SYSTEM READY';
  fireBtn.disabled = false;
  fireBtn.textContent = 'FIRE BALISTIC SIMULATION';

  coordX.textContent = '0.00';
  coordY.textContent = '0.00';

  const bounds = getGraphBounds();
  const size = getCanvasSize();
  ctx.clearRect(0, 0, size.w, size.h);
  ctx.fillStyle = '#070a13';
  ctx.fillRect(0, 0, size.w, size.h);

  maxRange = calcRange(theta, u, g);
  maxHeight = calcMaxHeight(theta, u, g);
  flightTime = calcFlightTime(theta, u, g);
  trajectoryPoints = computeTrajectory();

  rangeValue.textContent = maxRange.toFixed(2) + ' m';
  heightValue.textContent = maxHeight.toFixed(2) + ' m';
  timeValue.textContent = flightTime.toFixed(2) + ' s';

  drawGrid(bounds);
  drawTrajectory(bounds, 0);
  drawMarkers(bounds);
}

angleSlider.addEventListener('input', function() {
  if (isAnimating) return;
  theta = parseFloat(this.value);
  angleReadout.innerHTML = theta + '&deg;';
  resetSimulation();
});

velocitySlider.addEventListener('input', function() {
  if (isAnimating) return;
  u = parseFloat(this.value);
  velocityReadout.textContent = u.toFixed(1) + ' m/s';
  resetSimulation();
});

gravityBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    if (isAnimating) return;
    gravityBtns.forEach(function(b) { b.classList.remove('active'); });
    this.classList.add('active');
    g = parseFloat(this.dataset.g);
    resetSimulation();
  });
});

fireBtn.addEventListener('click', startSimulation);

window.addEventListener('resize', function() {
  if (!isAnimating) {
    resizeCanvas();
    resetSimulation();
  } else {
    resizeCanvas();
  }
});

resizeCanvas();
resetSimulation();
