const canvas = document.getElementById('simulation-canvas');
const ctx = canvas.getContext('2d');
const viewport = document.getElementById('viewport');

const pauseBtn = document.getElementById('pause-btn');
const speedSlider = document.getElementById('speed-slider');
const speedDisplay = document.getElementById('speed-display');
const telemetrySpeed = document.getElementById('telemetry-speed');
const telemetryTime = document.getElementById('telemetry-time');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const planetInfo = document.getElementById('planet-info');
const planetName = document.getElementById('planet-name');
const planetPeriod = document.getElementById('planet-period');
const planetDistance = document.getElementById('planet-distance');
const planetFact = document.getElementById('planet-fact');

let paused = false;
let speedMultiplier = 1;
let selectedPlanetIndex = null;
let simulationTime = 0;
let lastTimestamp = 0;

const PLANETS = [
  {
    name: 'Mercury',
    radius: 5,
    color: '#b5b5b5',
    orbitalRadius: 70,
    angularVelocity: 0.015,
    angle: Math.random() * Math.PI * 2,
    orbitalPeriod: '87.97 days',
    distance: '0.39 AU',
    funFact: 'Smallest planet in the solar system, only slightly larger than Earth\'s moon.'
  },
  {
    name: 'Venus',
    radius: 7,
    color: '#e8cda0',
    orbitalRadius: 115,
    angularVelocity: 0.006,
    angle: Math.random() * Math.PI * 2,
    orbitalPeriod: '224.7 days',
    distance: '0.72 AU',
    funFact: 'Hottest planet with surface temperatures reaching 465\u00b0C, hot enough to melt lead.'
  },
  {
    name: 'Earth',
    radius: 8,
    color: '#4b8bbe',
    orbitalRadius: 160,
    angularVelocity: 0.0035,
    angle: Math.random() * Math.PI * 2,
    orbitalPeriod: '365.25 days',
    distance: '1.00 AU',
    funFact: 'The only known planet to harbor life, with 71% of its surface covered in water.'
  },
  {
    name: 'Mars',
    radius: 6,
    color: '#c1440e',
    orbitalRadius: 210,
    angularVelocity: 0.0022,
    angle: Math.random() * Math.PI * 2,
    orbitalPeriod: '687.0 days',
    distance: '1.52 AU',
    funFact: 'Home to Olympus Mons, the largest volcano in the solar system at 21.9 km tall.'
  },
  {
    name: 'Jupiter',
    radius: 14,
    color: '#d4a574',
    orbitalRadius: 275,
    angularVelocity: 0.0007,
    angle: Math.random() * Math.PI * 2,
    orbitalPeriod: '4,332.59 days',
    distance: '5.20 AU',
    funFact: 'The largest planet with a mass more than twice all other planets combined.'
  }
];

const SUN = { radius: 22, color: '#FDB813' };

function resizeCanvas() {
  const rect = viewport.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function getCenter() {
  const dpr = window.devicePixelRatio || 1;
  return {
    x: (canvas.width / dpr) / 2,
    y: (canvas.height / dpr) / 2
  };
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function drawOrbitalRings(cx, cy) {
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  for (let i = 0; i < PLANETS.length; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, PLANETS[i].orbitalRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawSun(cx, cy) {
  const glow = ctx.createRadialGradient(cx, cy, SUN.radius * 0.5, cx, cy, SUN.radius * 3);
  glow.addColorStop(0, 'rgba(253, 184, 19, 0.4)');
  glow.addColorStop(0.4, 'rgba(253, 184, 19, 0.15)');
  glow.addColorStop(1, 'rgba(253, 184, 19, 0)');
  ctx.beginPath();
  ctx.arc(cx, cy, SUN.radius * 3, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  const sunGrad = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, SUN.radius);
  sunGrad.addColorStop(0, '#fff5cc');
  sunGrad.addColorStop(0.3, SUN.color);
  sunGrad.addColorStop(1, '#e8a200');
  ctx.beginPath();
  ctx.arc(cx, cy, SUN.radius, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, SUN.radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(253, 184, 19, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawPlanet(planet, cx, cy, index) {
  const x = cx + Math.cos(planet.angle) * planet.orbitalRadius;
  const y = cy + Math.sin(planet.angle) * planet.orbitalRadius;

  const grad = ctx.createRadialGradient(
    x - planet.radius * 0.3, y - planet.radius * 0.3, 0,
    x, y, planet.radius
  );
  grad.addColorStop(0, lightenColor(planet.color, 60));
  grad.addColorStop(0.6, planet.color);
  grad.addColorStop(1, lightenColor(planet.color, -40));

  ctx.beginPath();
  ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  if (selectedPlanetIndex === index) {
    ctx.beginPath();
    ctx.arc(x, y, planet.radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, planet.radius + 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px ui-monospace, Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(planet.name, x, y + planet.radius + 6);

  return { x: x, y: y };
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad2 = function(v) { return String(v).padStart(2, '0'); };
  return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
}

function render(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
  }

  const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  const center = getCenter();

  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = '#070a13';
  ctx.fillRect(0, 0, w, h);

  drawOrbitalRings(center.x, center.y);

  if (!paused) {
    const dt = deltaTime * speedMultiplier;
    for (let i = 0; i < PLANETS.length; i++) {
      PLANETS[i].angle += PLANETS[i].angularVelocity * dt * 60;
    }
    simulationTime += dt;
  }

  drawSun(center.x, center.y);

  for (let i = 0; i < PLANETS.length; i++) {
    drawPlanet(PLANETS[i], center.x, center.y, i);
  }

  telemetryTime.textContent = formatTime(simulationTime);

  requestAnimationFrame(render);
}

function handleCanvasClick(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const center = getCenter();

  let foundIndex = null;

  for (let i = 0; i < PLANETS.length; i++) {
    const p = PLANETS[i];
    const px = center.x + Math.cos(p.angle) * p.orbitalRadius;
    const py = center.y + Math.sin(p.angle) * p.orbitalRadius;
    const dist = Math.sqrt((mouseX - px) * (mouseX - px) + (mouseY - py) * (mouseY - py));
    if (dist < p.radius + 6) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex !== null) {
    selectedPlanetIndex = foundIndex;
    const p = PLANETS[foundIndex];
    planetName.textContent = p.name;
    planetPeriod.textContent = p.orbitalPeriod;
    planetDistance.textContent = p.distance;
    planetFact.textContent = p.funFact;
    planetInfo.classList.remove('hidden');
    planetInfo.classList.add('visible');
  } else {
    selectedPlanetIndex = null;
    planetInfo.classList.remove('visible');
    planetInfo.classList.add('hidden');
    planetName.textContent = '\u2014';
    planetPeriod.textContent = '\u2014';
    planetDistance.textContent = '\u2014';
    planetFact.textContent = '\u2014';
  }
}

function handleCanvasMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const center = getCenter();
  let hovering = false;

  for (let i = 0; i < PLANETS.length; i++) {
    const p = PLANETS[i];
    const px = center.x + Math.cos(p.angle) * p.orbitalRadius;
    const py = center.y + Math.sin(p.angle) * p.orbitalRadius;
    const dist = Math.sqrt((mouseX - px) * (mouseX - px) + (mouseY - py) * (mouseY - py));
    if (dist < p.radius + 6) {
      hovering = true;
      break;
    }
  }
  canvas.style.cursor = hovering ? 'pointer' : 'crosshair';
}

pauseBtn.addEventListener('click', function() {
  paused = !paused;
  if (paused) {
    statusIndicator.classList.add('paused');
    statusText.textContent = 'ENGINE PAUSED';
    pauseBtn.style.background = '#f59e0b';
    pauseBtn.textContent = 'RESUME';
  } else {
    statusIndicator.classList.remove('paused');
    statusText.textContent = 'SIMULATION ACTIVE';
    pauseBtn.style.background = '#3b82f6';
    pauseBtn.textContent = 'PAUSE';
  }
});

speedSlider.addEventListener('input', function() {
  speedMultiplier = parseFloat(speedSlider.value);
  const display = speedMultiplier.toFixed(1) + 'x';
  speedDisplay.textContent = display;
  telemetrySpeed.textContent = display;
});

canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('mousemove', handleCanvasMouseMove);

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
requestAnimationFrame(render);
