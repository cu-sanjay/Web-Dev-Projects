const canvas = document.getElementById('simulation-canvas');
const ctx = canvas.getContext('2d');
const viewport = document.getElementById('viewport');

const lengthSlider = document.getElementById('length-slider');
const lengthReadout = document.getElementById('length-readout');
const gravityBtns = document.querySelectorAll('.gravity-btn');
const dampingSlider = document.getElementById('damping-slider');
const dampingReadout = document.getElementById('damping-readout');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const periodValue = document.getElementById('period-value');
const omegaValue = document.getElementById('omega-value');
const thetaValue = document.getElementById('theta-value');
const peValue = document.getElementById('pe-value');
const keValue = document.getElementById('ke-value');
const totalValue = document.getElementById('total-value');
const peFill = document.getElementById('pe-fill');
const keFill = document.getElementById('ke-fill');
const totalFill = document.getElementById('total-fill');
const conservationNote = document.getElementById('conservation-note');

let L = 1.5;
let g = 9.81;
let damping = 0;
let theta = 0.52;
let omega = 0;
let isPaused = false;
let isDragging = false;
let accumulator = 0;
let lastTimestamp = 0;
let animId = null;

const mass = 1;
const PHYSICS_DT = 1 / 120;

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

function calcPeriod(len, grav) {
  return 2 * Math.PI * Math.sqrt(len / grav);
}

function computeAcceleration(angle, angVel) {
  return -(g / L) * Math.sin(angle) - damping * angVel;
}

function physicsStep(dt) {
  if (isPaused || isDragging) return;

  const thetaHalf = theta + omega * dt * 0.5;
  const omegaHalf = omega + computeAcceleration(theta, omega) * dt * 0.5;

  const thetaNew = theta + omegaHalf * dt;
  const omegaNew = omega + computeAcceleration(thetaHalf, omegaHalf) * dt;

  theta = thetaNew;
  omega = omegaNew;
}

function getEnergy() {
  const pe = mass * g * L * (1 - Math.cos(theta));
  const ke = 0.5 * mass * L * L * omega * omega;
  const total = pe + ke;
  return { pe, ke, total };
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
  return { w: canvas.width / dpr, h: canvas.height / dpr };
}

function getPendulumCoords() {
  const size = getCanvasSize();
  const pivotX = size.w / 2;
  const pivotY = 50;
  const maxPixels = size.h * 0.55;
  const pixelLength = (L / 3.0) * maxPixels;
  const bobX = pivotX + pixelLength * Math.sin(theta);
  const bobY = pivotY + pixelLength * Math.cos(theta);
  return { pivotX, pivotY, bobX, bobY, pixelLength };
}

function drawBackground() {
  const size = getCanvasSize();
  ctx.fillStyle = '#070a13';
  ctx.fillRect(0, 0, size.w, size.h);
}

function drawGrid(size) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let x = 0; x < size.w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size.h);
    ctx.stroke();
  }
  for (let y = 0; y < size.h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size.w, y);
    ctx.stroke();
  }
}

function drawAnchor(pivotX, pivotY) {
  const aw = 40, ah = 16;
  ctx.fillStyle = '#1f2937';
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 2;
  roundRect(ctx, pivotX - aw / 2, pivotY - ah / 2, aw, ah, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '8px ui-monospace, Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ANCHOR', pivotX, pivotY + ah / 2 + 14);
}

function roundRect(ctx2, x, y, w, h, r) {
  ctx2.beginPath();
  ctx2.moveTo(x + r, y);
  ctx2.lineTo(x + w - r, y);
  ctx2.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx2.lineTo(x + w, y + h - r);
  ctx2.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx2.lineTo(x + r, y + h);
  ctx2.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx2.lineTo(x, y + r);
  ctx2.quadraticCurveTo(x, y, x + r, y);
  ctx2.closePath();
}

function drawCable(pivotX, pivotY, bobX, bobY) {
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(bobX, bobY);
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawBob(x, y) {
  const bobRadius = Math.max(8, Math.min(22, 10 + L * 3));

  const grad = ctx.createRadialGradient(x - bobRadius * 0.3, y - bobRadius * 0.3, 0, x, y, bobRadius);
  grad.addColorStop(0, '#94a3b8');
  grad.addColorStop(0.6, '#64748b');
  grad.addColorStop(1, '#1f2937');
  ctx.beginPath();
  ctx.arc(x, y, bobRadius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, bobRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (isDragging) {
    ctx.beginPath();
    ctx.arc(x, y, bobRadius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawAngleArc(pivotX, pivotY, bobX, bobY) {
  const angle = Math.abs(theta);
  if (angle < 0.02) return;

  const dir = theta >= 0 ? 1 : -1;
  const arcRadius = 30;
  const startAngle = Math.PI / 2;
  const endAngle = Math.PI / 2 - dir * angle;

  ctx.beginPath();
  ctx.arc(pivotX, pivotY, arcRadius, Math.min(startAngle, endAngle), Math.max(startAngle, endAngle));
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  const labelAngle = Math.PI / 2 - dir * angle / 2;
  const lx = pivotX + (arcRadius + 14) * Math.cos(labelAngle);
  const ly = pivotY + (arcRadius + 14) * Math.sin(labelAngle);
  ctx.fillStyle = '#f59e0b';
  ctx.font = '9px ui-monospace, Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(toDeg(theta).toFixed(1) + '\u00b0', lx, ly);
}

function drawTrail(pivotX, pivotY) {
  if (isDragging || isPaused) return;
  const size = getCanvasSize();
  const maxPixels = size.h * 0.55;
  const pixelLength = (L / 3.0) * maxPixels;

  ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps - 0.5) * Math.PI * 1.2;
    const cx = pivotX + pixelLength * Math.sin(a);
    const cy = pivotY + pixelLength * Math.cos(a);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.stroke();
}

function updateTelemetry() {
  const period = calcPeriod(L, g);
  periodValue.textContent = period.toFixed(2) + ' s';
  omegaValue.textContent = omega.toFixed(2) + ' rad/s';
  thetaValue.innerHTML = toDeg(theta).toFixed(1) + '&deg;';
}

function updateEnergyDisplay() {
  const e = getEnergy();
  const total = Math.max(e.total, 0.001);
  const pePct = Math.min((e.pe / total) * 100, 100);
  const kePct = Math.min((e.ke / total) * 100, 100);

  peFill.style.width = pePct + '%';
  keFill.style.width = kePct + '%';
  totalFill.style.width = '100%';

  peValue.textContent = e.pe.toFixed(2) + ' J';
  keValue.textContent = e.ke.toFixed(2) + ' J';
  totalValue.textContent = e.total.toFixed(2) + ' J';
}

function render(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  if (!isPaused && !isDragging) {
    accumulator += deltaTime;
    let steps = 0;
    while (accumulator >= PHYSICS_DT && steps < 10) {
      physicsStep(PHYSICS_DT);
      accumulator -= PHYSICS_DT;
      steps++;
    }
    if (steps >= 10) accumulator = 0;
  }

  const size = getCanvasSize();
  const coords = getPendulumCoords();

  drawBackground();
  drawGrid(size);
  drawTrail(coords.pivotX, coords.pivotY);
  drawAngleArc(coords.pivotX, coords.pivotY, coords.bobX, coords.bobY);
  drawAnchor(coords.pivotX, coords.pivotY);
  drawCable(coords.pivotX, coords.pivotY, coords.bobX, coords.bobY);
  drawBob(coords.bobX, coords.bobY);

  updateTelemetry();
  updateEnergyDisplay();

  animId = requestAnimationFrame(render);
}

function getMouseAngle(event) {
  const rect = canvas.getBoundingClientRect();
  const size = getCanvasSize();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const pivotX = size.w / 2;
  const pivotY = 50;
  const dx = mouseX - pivotX;
  const dy = mouseY - pivotY;
  return Math.atan2(dx, dy);
}

function getBobDistance(event) {
  const rect = canvas.getBoundingClientRect();
  const coords = getPendulumCoords();
  const mx = event.clientX - rect.left;
  const my = event.clientY - rect.top;
  const dx = mx - coords.bobX;
  const dy = my - coords.bobY;
  return Math.sqrt(dx * dx + dy * dy);
}

function handleMouseDown(event) {
  event.preventDefault();
  const dist = getBobDistance(event);
  const bobRadius = Math.max(8, Math.min(22, 10 + L * 3));
  if (dist < bobRadius + 12) {
    isDragging = true;
    canvas.style.cursor = 'grabbing';
  }
}

function handleMouseMove(event) {
  if (isDragging) {
    event.preventDefault();
    const newAngle = getMouseAngle(event);
    theta = newAngle;
    omega = 0;
    accumulator = 0;
  }
}

function handleMouseUp(event) {
  if (isDragging) {
    isDragging = false;
    omega = 0;
    canvas.style.cursor = 'grab';
  }
}

lengthSlider.addEventListener('input', function() {
  L = parseFloat(this.value);
  lengthReadout.textContent = L.toFixed(1) + ' m';
  if (!isDragging) {
    accumulator = 0;
  }
});

gravityBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    gravityBtns.forEach(function(b) { b.classList.remove('active'); });
    this.classList.add('active');
    g = parseFloat(this.dataset.g);
    if (!isDragging) {
      accumulator = 0;
    }
  });
});

dampingSlider.addEventListener('input', function() {
  damping = parseFloat(this.value);
  dampingReadout.textContent = damping.toFixed(3);
});

pauseBtn.addEventListener('click', function() {
  isPaused = !isPaused;
  if (isPaused) {
    this.textContent = 'RESUME MOTION';
    this.classList.add('paused');
  } else {
    this.textContent = 'PAUSE SIMULATION';
    this.classList.remove('paused');
    lastTimestamp = 0;
  }
});

resetBtn.addEventListener('click', function() {
  theta = 0.52;
  omega = 0;
  accumulator = 0;
  lastTimestamp = 0;
  isPaused = false;
  pauseBtn.textContent = 'PAUSE SIMULATION';
  pauseBtn.classList.remove('paused');
});

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseleave', function() {
  if (isDragging) {
    isDragging = false;
    omega = 0;
    canvas.style.cursor = 'grab';
  }
});

window.addEventListener('resize', function() {
  resizeCanvas();
});

resizeCanvas();
animId = requestAnimationFrame(render);
