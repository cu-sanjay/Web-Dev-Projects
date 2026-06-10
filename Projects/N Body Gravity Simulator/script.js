var nextId = 0;
var bodies = [];
var mouse = { down: false, sx: 0, sy: 0, cx: 0, cy: 0 };

var state = {
params: { G: 1, dt: 0.1, soft: 1 },
sim: { running: false, paused: false, frameId: null, lastTime: 0, time: 0, steps: 0, zoom: 1 },
collisions: [],
energyHist: { t: [], KE: [], PE: [], E: [] }
};

var MAX_TRAIL = 800;
var MAX_EPTS = 3000;
var CHART_STEP = 5;
var chartCounter = 0;
var epiChart = null;

function vecLen(dx, dy) { return Math.sqrt(dx * dx + dy * dy); }

function computeAccels() {
var N = bodies.length, G = state.params.G, eps2 = state.params.soft;
if (N === 0) return;
for (var i = 0; i < N; i++) { bodies[i].ax = 0; bodies[i].ay = 0; }
for (var i = 0; i < N; i++) {
for (var j = i + 1; j < N; j++) {
var dx = bodies[j].x - bodies[i].x;
var dy = bodies[j].y - bodies[i].y;
var d2 = dx * dx + dy * dy + eps2;
var d = Math.sqrt(d2);
var f = G / (d2 * d);
var fx = f * dx, fy = f * dy;
bodies[i].ax += fx * bodies[j].mass;
bodies[i].ay += fy * bodies[j].mass;
bodies[j].ax -= fx * bodies[i].mass;
bodies[j].ay -= fy * bodies[i].mass;
}
}
}

function simulate(dt) {
var N = bodies.length;
if (N === 0) return;
computeAccels();
for (var i = 0; i < N; i++) {
bodies[i].vx += 0.5 * bodies[i].ax * dt;
bodies[i].vy += 0.5 * bodies[i].ay * dt;
bodies[i].x += bodies[i].vx * dt;
bodies[i].y += bodies[i].vy * dt;
}
checkCollisions();
computeAccels();
for (var i = 0; i < N; i++) {
bodies[i].vx += 0.5 * bodies[i].ax * dt;
bodies[i].vy += 0.5 * bodies[i].ay * dt;
}
N = bodies.length;
for (var i = 0; i < N; i++) {
var trail = bodies[i].trail;
var last = trail.length > 0 ? trail[trail.length - 1] : null;
if (!last || vecLen(bodies[i].x - last.x, bodies[i].y - last.y) > 2) {
trail.push({ x: bodies[i].x, y: bodies[i].y });
if (trail.length > MAX_TRAIL) trail.splice(0, 1);
}
}
state.sim.time += dt;
state.sim.steps++;
}

function checkCollisions() {
var N = bodies.length;
var dead = new Array(N).fill(false);
for (var i = 0; i < N; i++) {
if (dead[i]) continue;
for (var j = i + 1; j < N; j++) {
if (dead[j]) continue;
var dx = bodies[j].x - bodies[i].x;
var dy = bodies[j].y - bodies[i].y;
var dist = vecLen(dx, dy);
if (dist < bodies[i].radius + bodies[j].radius) {
var m1 = bodies[i].mass, m2 = bodies[j].mass;
var mt = m1 + m2;
bodies[i].x = (bodies[i].x * m1 + bodies[j].x * m2) / mt;
bodies[i].y = (bodies[i].y * m1 + bodies[j].y * m2) / mt;
bodies[i].vx = (bodies[i].vx * m1 + bodies[j].vx * m2) / mt;
bodies[i].vy = (bodies[i].vy * m1 + bodies[j].vy * m2) / mt;
bodies[i].mass = mt;
bodies[i].radius = Math.cbrt(bodies[i].radius * bodies[i].radius * bodies[i].radius + bodies[j].radius * bodies[j].radius * bodies[j].radius);
state.collisions.push({ t: state.sim.time, id1: bodies[i].id, id2: bodies[j].id });
if (state.collisions.length > 50) state.collisions.splice(0, 1);
dead[j] = true;
}
}
}
for (var k = bodies.length - 1; k >= 0; k--) {
if (dead[k]) bodies.splice(k, 1);
}
}

function spawnBody(mass, x, y, vx, vy, radius, color) {
var body = {
id: nextId++, mass: mass, x: x, y: y, vx: vx, vy: vy,
radius: radius, color: color || '#2e7d32',
ax: 0, ay: 0, trail: []
};
bodies.push(body);
return body;
}

function getCenter() {
var N = bodies.length;
if (N === 0) return { x: 0, y: 0 };
var cx = 0, cy = 0, tm = 0;
for (var i = 0; i < N; i++) { cx += bodies[i].x * bodies[i].mass; cy += bodies[i].y * bodies[i].mass; tm += bodies[i].mass; }
return { x: cx / tm, y: cy / tm };
}

function getEnergies() {
var KE = 0, PE = 0, N = bodies.length, G = state.params.G;
for (var i = 0; i < N; i++) {
KE += 0.5 * bodies[i].mass * (bodies[i].vx * bodies[i].vx + bodies[i].vy * bodies[i].vy);
for (var j = i + 1; j < N; j++) {
var dx = bodies[j].x - bodies[i].x, dy = bodies[j].y - bodies[i].y;
PE -= G * bodies[i].mass * bodies[j].mass / vecLen(dx, dy);
}
}
return { KE: KE, PE: PE, E: KE + PE };
}

function formatNum(n) {
if (n == null || !isFinite(n)) return '0';
if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
if (Number.isInteger(n)) return n.toString();
return n.toFixed(2);
}

function updateStatus(text, type) {
document.getElementById('statusText').textContent = text;
var ind = document.getElementById('statusIndicator');
ind.className = 'status-indicator';
if (type) ind.classList.add(type);
}

function resizeCanvas() {
var cw = document.getElementById('canvasWrapper');
var cv = document.getElementById('spaceViewport');
cv.width = cw.clientWidth;
cv.height = cw.clientHeight;
var ew = document.querySelector('.energy-chart-wrapper');
var ec = document.getElementById('energyChart');
ec.width = ew.clientWidth;
ec.height = ew.clientHeight;
}

function render() {
var canvas = document.getElementById('spaceViewport');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;
ctx.clearRect(0, 0, W, H);
var N = bodies.length;
if (N === 0) {
if (!mouse.down) { ctx.fillStyle = '#557a61'; ctx.font = '12px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillText('Load a preset or spawn bodies to begin', W / 2, H / 2); }
return;
}
var center = getCenter();
var px = W / 2, py = H / 2;
var scale = state.sim.zoom;
for (var i = 0; i < N; i++) {
var body = bodies[i];
var trail = body.trail;
if (trail.length > 1) {
for (var t = 1; t < trail.length; t++) {
var alpha = 0.08 + 0.35 * (t / trail.length);
ctx.beginPath();
ctx.moveTo(px + (trail[t - 1].x - center.x) * scale, py + (trail[t - 1].y - center.y) * scale);
ctx.lineTo(px + (trail[t].x - center.x) * scale, py + (trail[t].y - center.y) * scale);
ctx.strokeStyle = 'rgba(46, 125, 50, ' + alpha + ')';
ctx.lineWidth = 1.2;
ctx.stroke();
}
}
}
for (var i = 0; i < N; i++) {
var body = bodies[i];
var sx = px + (body.x - center.x) * scale;
var sy = py + (body.y - center.y) * scale;
var r = Math.max(2, body.radius * scale * 0.4);
ctx.beginPath();
ctx.arc(sx, sy, r, 0, 2 * Math.PI);
ctx.fillStyle = body.color;
ctx.fill();
ctx.strokeStyle = 'rgba(27, 58, 36, 0.3)';
ctx.lineWidth = 1;
ctx.stroke();
}
if (mouse.down) {
ctx.strokeStyle = 'rgba(0, 150, 136, 0.4)';
ctx.lineWidth = 1.5;
ctx.setLineDash([4, 4]);
ctx.beginPath();
ctx.moveTo(px + (mouse.sx - center.x) * scale, py + (mouse.sy - center.y) * scale);
ctx.lineTo(px + (mouse.cx - center.x) * scale, py + (mouse.cy - center.y) * scale);
ctx.stroke();
ctx.setLineDash([]);
var angle = Math.atan2(mouse.sy - mouse.cy, mouse.sx - mouse.cx);
var len = 12;
ctx.beginPath();
ctx.moveTo(px + (mouse.cx - center.x) * scale, py + (mouse.cy - center.y) * scale);
ctx.lineTo(px + (mouse.cx - center.x) * scale - len * Math.cos(angle - 0.4), py + (mouse.cy - center.y) * scale - len * Math.sin(angle - 0.4));
ctx.moveTo(px + (mouse.cx - center.x) * scale, py + (mouse.cy - center.y) * scale);
ctx.lineTo(px + (mouse.cx - center.x) * scale - len * Math.cos(angle + 0.4), py + (mouse.cy - center.y) * scale - len * Math.sin(angle + 0.4));
ctx.stroke();
}
}

function initChart() {
var ctx = document.getElementById('energyChart').getContext('2d');
epiChart = new Chart(ctx, {
type: 'line',
data: { labels: [], datasets: [
{ label: 'Total E', data: [], borderColor: '#795548', borderWidth: 2, borderDash: [4, 3], pointRadius: 0, tension: 0.3, fill: false },
{ label: 'KE', data: [], borderColor: '#4caf50', borderWidth: 2, pointRadius: 0, tension: 0.3, fill: false },
{ label: 'PE', data: [], borderColor: '#2e7d32', borderWidth: 2, pointRadius: 0, tension: 0.3, fill: false }
] },
options: {
responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
interaction: { mode: 'nearest', intersect: false },
plugins: {
legend: { display: true, position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'line', padding: 10, font: { size: 9, weight: '600' }, color: '#557a61', boxWidth: 12 } },
tooltip: { backgroundColor: '#ffffff', titleColor: '#1b3a24', bodyColor: '#557a61', borderColor: '#e2ebd9', borderWidth: 1, padding: 8, cornerRadius: 6 }
},
scales: {
x: { display: true, grid: { color: 'rgba(226,235,217,0.3)' }, ticks: { color: '#557a61', font: { size: 8 }, maxTicksLimit: 6 } },
y: { display: true, grid: { color: 'rgba(226,235,217,0.3)' }, ticks: { color: '#557a61', font: { size: 8 } } }
}
}
});
}

function updateChart() {
if (!epiChart) return;
var eh = state.energyHist;
var maxPts = MAX_EPTS;
var len = Math.min(eh.t.length, maxPts);
var start = eh.t.length - len;
epiChart.data.labels = eh.t.slice(start);
epiChart.data.datasets[0].data = eh.E.slice(start);
epiChart.data.datasets[1].data = eh.KE.slice(start);
epiChart.data.datasets[2].data = eh.PE.slice(start);
epiChart.update('none');
}

function updateTelemetry() {
var N = bodies.length;
var en = N > 0 ? getEnergies() : { KE: 0, PE: 0, E: 0 };
document.getElementById('teleN').textContent = N;
document.getElementById('teleKE').textContent = formatNum(en.KE);
document.getElementById('telePE').textContent = formatNum(en.PE);
document.getElementById('teleE').textContent = formatNum(en.E);
document.getElementById('modelState').textContent = 'N-Body: ' + N + ' bod' + (N === 1 ? 'y' : 'ies') + ' | t: ' + state.sim.time.toFixed(1);
document.getElementById('simState').textContent = 't: ' + state.sim.time.toFixed(2) + ' | E: ' + formatNum(en.E);
}

function updateTable() {
var tbody = document.getElementById('telemetryBody');
tbody.innerHTML = '';
var N = bodies.length;
for (var i = 0; i < N; i++) {
var b = bodies[i];
var nearest = Infinity;
for (var j = 0; j < N; j++) {
if (i === j) continue;
var d = vecLen(b.x - bodies[j].x, b.y - bodies[j].y);
if (d < nearest) nearest = d;
}
var v = vecLen(b.vx, b.vy);
var tr = document.createElement('tr');
tr.innerHTML = '<td>#' + b.id + '</td><td>' + formatNum(b.mass) + '</td><td>' + b.x.toFixed(1) + ', ' + b.y.toFixed(1) + '</td><td>' + v.toFixed(2) + '</td><td>' + (nearest < Infinity ? nearest.toFixed(1) : '—') + '</td>';
tbody.appendChild(tr);
}
}

function updateCollisionLog() {
var container = document.getElementById('collisionEntries');
if (state.collisions.length === 0) {
container.innerHTML = '<em class="empty-log">No collisions yet</em>';
return;
}
var html = '';
var cols = state.collisions.slice(-10);
for (var i = 0; i < cols.length; i++) {
var c = cols[i];
html += '<div class="collision-entry"><span class="c-time">[' + c.t.toFixed(1) + 's]</span> Body #' + c.id1 + ' + #' + c.id2 + '</div>';
}
container.innerHTML = html;
}

function addEnergyPoint() {
if (bodies.length === 0) return;
var en = getEnergies();
var eh = state.energyHist;
eh.t.push(state.sim.time);
eh.KE.push(en.KE);
eh.PE.push(en.PE);
eh.E.push(en.E);
if (eh.t.length > MAX_EPTS) { eh.t.shift(); eh.KE.shift(); eh.PE.shift(); eh.E.shift(); }
}

function gameLoop(timestamp) {
if (!state.sim.running || state.sim.paused) { state.sim.frameId = requestAnimationFrame(gameLoop); return; }
if (state.sim.lastTime === 0) { state.sim.lastTime = timestamp; state.sim.frameId = requestAnimationFrame(gameLoop); return; }
var elapsed = (timestamp - state.sim.lastTime) / 1000;
state.sim.lastTime = timestamp;
var dt = Math.min(elapsed, 0.05);
var steps = Math.max(1, Math.ceil(dt / Math.max(state.params.dt, 0.005)));
var stepDt = dt / steps;
for (var i = 0; i < steps; i++) simulate(stepDt);
render();
chartCounter++;
if (chartCounter >= CHART_STEP) {
chartCounter = 0;
addEnergyPoint();
updateChart();
updateTelemetry();
updateTable();
updateCollisionLog();
var lastCol = state.collisions.length > 0 ? state.collisions[state.collisions.length - 1] : null;
if (lastCol && state.sim.time - lastCol.t < 0.5) updateStatus('INELASTIC COLLISION REGISTERED', 'collision');
else updateStatus('PROPAGATING ORBITAL CALCULATION LOOPS...', 'running');
}
state.sim.frameId = requestAnimationFrame(gameLoop);
}

function togglePause() {
if (!state.sim.running) { startSimulation(); return; }
state.sim.paused = !state.sim.paused;
if (state.sim.paused) {
updateStatus('SIMULATION PAUSED', 'idle');
document.querySelector('.pause-btn').innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14"><polygon points="3,1 13,7 3,13" fill="currentColor"/></svg> RESUME';
} else {
state.sim.lastTime = 0;
updateStatus('PROPAGATING ORBITAL CALCULATION LOOPS...', 'running');
document.querySelector('.pause-btn').innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="0.8" fill="currentColor"/><rect x="8.5" y="1" width="3.5" height="12" rx="0.8" fill="currentColor"/></svg> PAUSE';
state.sim.frameId = requestAnimationFrame(gameLoop);
}
}

function startSimulation() {
if (bodies.length === 0) { updateStatus('AWAITING CAUSAL MASS', 'idle'); return; }
state.sim.running = true;
state.sim.paused = false;
state.sim.lastTime = 0;
state.sim.time = 0;
state.sim.steps = 0;
state.energyHist = { t: [], KE: [], PE: [], E: [] };
addEnergyPoint();
updateChart();
document.querySelector('.pause-btn').innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="0.8" fill="currentColor"/><rect x="8.5" y="1" width="3.5" height="12" rx="0.8" fill="currentColor"/></svg> PAUSE';
updateStatus('PROPAGATING ORBITAL CALCULATION LOOPS...', 'running');
state.sim.frameId = requestAnimationFrame(gameLoop);
}

function clearSystem() {
state.sim.running = false;
if (state.sim.frameId) { cancelAnimationFrame(state.sim.frameId); state.sim.frameId = null; }
state.sim.paused = false;
state.sim.time = 0;
state.sim.steps = 0;
state.collisions = [];
state.energyHist = { t: [], KE: [], PE: [], E: [] };
nextId = 0;
bodies = [];
mouse.down = false;
render();
updateTelemetry();
updateTable();
updateCollisionLog();
if (epiChart) { epiChart.data.labels = []; epiChart.data.datasets[0].data = []; epiChart.data.datasets[1].data = []; epiChart.data.datasets[2].data = []; epiChart.update('none'); }
document.querySelector('.pause-btn').innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14"><polygon points="3,1 13,7 3,13" fill="currentColor"/></svg> PAUSE';
updateStatus('AWAITING CAUSAL MASS', 'idle');
}

function spawnFromUI() {
var mass = parseFloat(document.getElementById('newMass').value) || 50;
var r = parseFloat(document.getElementById('newRadius').value) || 6;
var vx = parseFloat(document.getElementById('newVx').value) || 0;
var vy = parseFloat(document.getElementById('newVy').value) || 0;
var color = document.getElementById('newColor').value || '#2e7d32';
var center = bodies.length > 0 ? getCenter() : { x: 0, y: 0 };
var spawnX = center.x + (Math.random() - 0.5) * 100;
var spawnY = center.y + (Math.random() - 0.5) * 100;
spawnBody(mass, spawnX, spawnY, vx, vy, r, color);
if (!state.sim.running) { render(); }
updateTelemetry();
updateTable();
}

function loadPreset() {
clearSystem();
var sel = document.getElementById('presetSelect').value;
state.sim.zoom = 1;
if (sel === 'binary') {
state.params.G = 1; state.params.dt = 0.05; state.params.soft = 1;
document.getElementById('sliderG').value = 1; document.getElementById('valG').textContent = '1.00';
document.getElementById('sliderDt').value = 0.05; document.getElementById('valDt').textContent = '0.05';
spawnBody(500, 250, 400, 0, 1.83, 16, '#eab308');
spawnBody(500, 550, 400, 0, -1.83, 16, '#eab308');
state.sim.zoom = 0.8;
} else if (sel === 'solar') {
state.params.G = 1; state.params.dt = 0.08; state.params.soft = 1;
document.getElementById('sliderG').value = 1; document.getElementById('valG').textContent = '1.00';
document.getElementById('sliderDt').value = 0.08; document.getElementById('valDt').textContent = '0.08';
spawnBody(1000, 400, 400, 0, 0, 18, '#eab308');
spawnBody(10, 400, 250, 2.58, 0, 6, '#2e7d32');
spawnBody(5, 650, 400, 0, -2.0, 4.5, '#81c784');
spawnBody(3, 400, 580, -1.83, 0, 3.5, '#a5d6a7');
spawnBody(2, 180, 400, 0, 1.49, 3, '#4caf50');
spawnBody(1, 400, 150, 3.16, 0, 2.5, '#009688');
state.sim.zoom = 0.6;
} else if (sel === 'threebody') {
state.params.G = 1; state.params.dt = 0.03; state.params.soft = 1;
document.getElementById('sliderG').value = 1; document.getElementById('valG').textContent = '1.00';
document.getElementById('sliderDt').value = 0.03; document.getElementById('valDt').textContent = '0.03';
spawnBody(100, 300, 350, 0, 2.0, 8, '#2e7d32');
spawnBody(100, 500, 350, 0, -2.0, 8, '#81c784');
spawnBody(100, 400, 470, -1.0, 0, 8, '#4caf50');
state.sim.zoom = 0.7;
}
updateTelemetry();
updateTable();
updateStatus('AWAITING CAUSAL MASS — press PAUSE to start', 'idle');
setTimeout(function () { render(); }, 10);
}

function exportCSV() {
if (bodies.length === 0) return;
var csv = 'Body ID,Mass,Position X,Position Y,Velocity X,Velocity Y,Radius,Color\n';
for (var i = 0; i < bodies.length; i++) {
var b = bodies[i];
csv += b.id + ',' + b.mass + ',' + b.x.toFixed(4) + ',' + b.y.toFixed(4) + ',' + b.vx.toFixed(4) + ',' + b.vy.toFixed(4) + ',' + b.radius + ',"' + b.color + '"\n';
}
csv += '\nTrail Data\nBody ID,Frame,X,Y\n';
for (var i = 0; i < bodies.length; i++) {
var b = bodies[i];
for (var t = 0; t < b.trail.length; t++) {
csv += b.id + ',' + t + ',' + b.trail[t].x.toFixed(4) + ',' + b.trail[t].y.toFixed(4) + '\n';
}
}
var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
var url = URL.createObjectURL(blob);
var a = document.createElement('a');
a.href = url; a.download = 'nbody_orbital_data.csv';
document.body.appendChild(a); a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
}

function setupCanvasInteraction() {
var canvas = document.getElementById('spaceViewport');
canvas.addEventListener('mousedown', function (e) {
var rect = canvas.getBoundingClientRect();
var scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
var mx = (e.clientX - rect.left) * scaleX, my = (e.clientY - rect.top) * scaleY;
var center = bodies.length > 0 ? getCenter() : { x: 0, y: 0 };
var worldX = center.x + (mx - canvas.width / 2) / state.sim.zoom;
var worldY = center.y + (my - canvas.height / 2) / state.sim.zoom;
mouse.down = true;
mouse.sx = worldX; mouse.sy = worldY;
mouse.cx = worldX; mouse.cy = worldY;
});
canvas.addEventListener('mousemove', function (e) {
if (!mouse.down) return;
var rect = canvas.getBoundingClientRect();
var scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
var mx = (e.clientX - rect.left) * scaleX, my = (e.clientY - rect.top) * scaleY;
var center = bodies.length > 0 ? getCenter() : { x: 0, y: 0 };
mouse.cx = center.x + (mx - canvas.width / 2) / state.sim.zoom;
mouse.cy = center.y + (my - canvas.height / 2) / state.sim.zoom;
if (!state.sim.running) render();
});
canvas.addEventListener('mouseup', function () {
if (!mouse.down) return;
mouse.down = false;
var dx = mouse.sx - mouse.cx, dy = mouse.sy - mouse.cy;
var dist = vecLen(dx, dy);
var mass = parseFloat(document.getElementById('newMass').value) || 50;
var r = parseFloat(document.getElementById('newRadius').value) || 6;
var color = document.getElementById('newColor').value || '#2e7d32';
if (dist > 3) {
var speed = dist * 0.08;
var vx = (dx / dist) * speed;
var vy = (dy / dist) * speed;
spawnBody(mass, mouse.sx, mouse.sy, vx, vy, r, color);
} else {
spawnBody(mass, mouse.sx, mouse.sy, 0, 0, r, color);
}
updateTelemetry();
updateTable();
if (!state.sim.running) render();
});
canvas.addEventListener('wheel', function (e) {
e.preventDefault();
var dir = e.deltaY > 0 ? -1 : 1;
state.sim.zoom *= (1 + dir * 0.1);
state.sim.zoom = Math.max(0.2, Math.min(5, state.sim.zoom));
if (!state.sim.running) render();
});
}

function setupSliders() {
var config = [
{ id: 'sliderG', key: 'G', display: 'valG', fmt: function (v) { return parseFloat(v).toFixed(2); } },
{ id: 'sliderDt', key: 'dt', display: 'valDt', fmt: function (v) { return parseFloat(v).toFixed(2); } }
];
config.forEach(function (c) {
var el = document.getElementById(c.id);
if (!el) return;
el.addEventListener('input', function () {
var val = parseFloat(this.value);
state.params[c.key] = val;
document.getElementById(c.display).textContent = c.fmt(val);
});
});
}

function setupButtons() {
document.getElementById('btnPause').addEventListener('click', togglePause);
document.getElementById('btnClear').addEventListener('click', clearSystem);
document.getElementById('btnExport').addEventListener('click', exportCSV);
document.getElementById('btnSpawn').addEventListener('click', spawnFromUI);
document.getElementById('btnLoadPreset').addEventListener('click', loadPreset);
}

var resizeTimer = null;
function setupResize() {
window.addEventListener('resize', function () {
if (resizeTimer) clearTimeout(resizeTimer);
resizeTimer = setTimeout(function () { resizeCanvas(); if (!state.sim.running) render(); }, 100);
});
}

document.addEventListener('DOMContentLoaded', function () {
resizeCanvas();
initChart();
setupSliders();
setupButtons();
setupCanvasInteraction();
setupResize();
render();
updateTelemetry();
updateTable();
updateCollisionLog();
document.getElementById('sliderG').value = state.params.G;
document.getElementById('valG').textContent = state.params.G.toFixed(2);
document.getElementById('sliderDt').value = state.params.dt;
document.getElementById('valDt').textContent = state.params.dt.toFixed(2);
loadPreset();
});
