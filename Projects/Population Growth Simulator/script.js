const state = {
params: { N0: 100, b: 0.8, d: 0.2, r: 0.6, K: 1000, tMax: 50, model: 'logistic' },
sim: { running: false, paused: false, step: 0, totalSteps: 50, popData: [], velData: [], strData: [], frameId: null, computed: false }
};

let lastStepTime = 0;
const STEP_INTERVAL = 80;

function formatNum(n) {
if (n == null || !isFinite(n)) return '0';
if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(2) + 'K';
return Math.round(n).toString();
}

function formatFloat(n, d) {
if (n == null || !isFinite(n)) return Number(0).toFixed(d);
return n.toFixed(d);
}

function updateStatus(text, type) {
document.getElementById('statusText').textContent = text;
const ind = document.getElementById('statusIndicator');
ind.className = 'status-indicator';
if (type) ind.classList.add(type);
}

function hardReset() {
if (state.sim.frameId) { cancelAnimationFrame(state.sim.frameId); state.sim.frameId = null; }
state.sim.running = false;
state.sim.paused = false;
state.sim.step = 0;
state.sim.computed = false;
state.sim.popData = [];
state.sim.velData = [];
state.sim.strData = [];
document.getElementById('btnRun').disabled = false;
document.getElementById('telemetryBody').innerHTML = '';
document.getElementById('teleNt').textContent = state.params.N0.toString();
document.getElementById('teleDndt').textContent = '0.00';
document.getElementById('teleStress').textContent = '0.0%';
document.getElementById('simState').textContent = 'Generations: 0 / ' + state.params.tMax;
const chart = window.popChart;
if (chart) {
chart.data.labels = [];
chart.data.datasets[0].data = [];
chart.data.datasets[1].data = [];
chart.update('none');
}
updateStatus('AWAITING INITIALIZATION', 'idle');
}

function computeSimulation() {
const { N0, r, K, tMax, model } = state.params;
const popData = [], velData = [], strData = [];
for (let t = 0; t <= tMax; t++) {
let N;
if (model === 'exponential') {
N = N0 * Math.exp(r * t);
} else {
const e = Math.exp(r * t);
N = (K * N0 * e) / (K + N0 * (e - 1));
}
if (!isFinite(N) || isNaN(N)) N = model === 'logistic' ? K : 1e12;
N = Math.max(0, N);
let dndt;
if (model === 'logistic') dndt = r * N * (1 - N / K);
else dndt = r * N;
const stress = K > 0 ? (N / K) * 100 : 0;
popData.push(N);
velData.push(dndt);
strData.push(Math.min(100, Math.max(0, stress)));
}
state.sim.popData = popData;
state.sim.velData = velData;
state.sim.strData = strData;
state.sim.totalSteps = tMax;
state.sim.computed = true;
}

function updateChart() {
const chart = window.popChart;
if (!chart || state.sim.popData.length === 0) return;
const tMax = state.params.tMax;
const step = state.sim.step;
const model = state.params.model;
chart.data.labels = Array.from({ length: tMax + 1 }, (_, i) => i);
const popData = new Array(tMax + 1).fill(null);
for (let i = 0; i <= step && i < state.sim.popData.length; i++) popData[i] = state.sim.popData[i];
if (model === 'logistic' && state.params.K > 0) {
chart.data.datasets[1].data = new Array(tMax + 1).fill(state.params.K);
chart.data.datasets[1].hidden = false;
} else {
chart.data.datasets[1].data = new Array(tMax + 1).fill(null);
chart.data.datasets[1].hidden = true;
}
chart.data.datasets[0].data = popData;
chart.update('none');
}

function addTelemetryRow(t, N, dndt, stress) {
const tbody = document.getElementById('telemetryBody');
const tr = document.createElement('tr');
tr.innerHTML = '<td>' + t + '</td><td>' + formatNum(N) + '</td><td>' + formatFloat(dndt, 2) + '</td><td>' + formatFloat(stress, 1) + '%</td>';
tbody.appendChild(tr);
tbody.closest('.telemetry-log').scrollTop = tbody.closest('.telemetry-log').scrollHeight;
}

function updateDisplay() {
const step = state.sim.step;
updateChart();
const Nt = state.sim.popData[step], dndt = state.sim.velData[step], stress = state.sim.strData[step];
document.getElementById('teleNt').textContent = formatNum(Nt);
document.getElementById('teleDndt').textContent = formatFloat(dndt, 2);
document.getElementById('teleStress').textContent = formatFloat(stress, 1) + '%';
document.getElementById('simState').textContent = 'Generations: ' + step + ' / ' + state.sim.totalSteps;
addTelemetryRow(step, Nt, dndt, stress);
}

function finishSimulation() {
state.sim.running = false;
document.getElementById('btnRun').disabled = false;
const lastStr = state.sim.strData[state.sim.step] || 0;
if (lastStr > 90) updateStatus('RESOURCE COLLAPSE WARNING', 'collapse');
else updateStatus('STABLE EQUILIBRIUM ACHIEVED', 'complete');
}

function simulationLoop(timestamp) {
if (!state.sim.running || state.sim.paused) return;
if (timestamp - lastStepTime < STEP_INTERVAL) {
state.sim.frameId = requestAnimationFrame(simulationLoop);
return;
}
lastStepTime = timestamp;
if (state.sim.step >= state.sim.totalSteps) { finishSimulation(); return; }
state.sim.step++;
updateDisplay();
if (state.sim.step >= state.sim.totalSteps) { finishSimulation(); return; }
const stress = state.sim.strData[state.sim.step];
if (stress > 90) updateStatus('RESOURCE COLLAPSE WARNING', 'collapse');
else updateStatus('PROPAGATING GENERATIONAL ITERATIONS...', 'running');
state.sim.frameId = requestAnimationFrame(simulationLoop);
}

function runSimulation() {
if (state.sim.running && !state.sim.paused) return;
if (state.sim.paused) {
state.sim.paused = false;
document.getElementById('btnRun').disabled = true;
updateStatus('PROPAGATING GENERATIONAL ITERATIONS...', 'running');
lastStepTime = performance.now();
state.sim.frameId = requestAnimationFrame(simulationLoop);
return;
}
hardReset();
computeSimulation();
state.sim.running = true;
state.sim.step = 0;
document.getElementById('btnRun').disabled = true;
updateDisplay();
updateStatus('PROPAGATING GENERATIONAL ITERATIONS...', 'running');
lastStepTime = performance.now();
state.sim.frameId = requestAnimationFrame(simulationLoop);
}

function togglePause() {
if (!state.sim.running) return;
if (!state.sim.computed) return;
state.sim.paused = !state.sim.paused;
if (state.sim.paused) {
updateStatus('SIMULATION PAUSED', 'idle');
} else {
updateStatus('PROPAGATING GENERATIONAL ITERATIONS...', 'running');
lastStepTime = performance.now();
state.sim.frameId = requestAnimationFrame(simulationLoop);
}
}

function stepSimulation() {
if (state.sim.running && !state.sim.paused) {
state.sim.paused = true;
updateStatus('SIMULATION PAUSED', 'idle');
}
if (!state.sim.computed) {
hardReset();
computeSimulation();
state.sim.running = true;
state.sim.paused = true;
state.sim.step = 0;
document.getElementById('btnRun').disabled = true;
updateDisplay();
updateStatus('SIMULATION PAUSED (STEP 0)', 'idle');
return;
}
if (state.sim.step >= state.sim.totalSteps) { updateStatus('STABLE EQUILIBRIUM ACHIEVED', 'complete'); return; }
if (!state.sim.running) {
state.sim.running = true;
document.getElementById('btnRun').disabled = true;
}
state.sim.step++;
updateDisplay();
if (state.sim.step >= state.sim.totalSteps) { finishSimulation(); return; }
updateStatus('SIMULATION PAUSED', 'idle');
}

function resetSimulation() {
hardReset();
document.getElementById('btnRun').disabled = false;
}

function exportCSV() {
if (!state.sim.computed || state.sim.popData.length === 0) return;
const maxIdx = Math.min(state.sim.step, state.sim.popData.length - 1);
let csv = 'Generation,Population,Growth Velocity,Environmental Stress\n';
for (let i = 0; i <= maxIdx; i++) {
const v = state.sim.popData[i] != null ? state.sim.popData[i] : '';
const w = state.sim.velData[i] != null ? state.sim.velData[i] : '';
const s = state.sim.strData[i] != null ? state.sim.strData[i] : '';
csv += i + ',' + v + ',' + w + ',' + s + '\n';
}
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'epoch_growth_data.csv';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
}

function initChart() {
const ctx = document.getElementById('populationChart').getContext('2d');
window.popChart = new Chart(ctx, {
type: 'line',
data: { labels: [], datasets: [
{ label: 'Population N(t)', data: [], borderColor: '#2e7d32', backgroundColor: 'rgba(46,125,50,0.08)', borderWidth: 2.5, pointRadius: 0, pointHitRadius: 5, tension: 0.35, fill: true },
{ label: 'Carrying Capacity K', data: [], borderColor: '#c62828', backgroundColor: 'rgba(198,40,40,0.05)', borderWidth: 2, borderDash: [6, 4], pointRadius: 0, fill: false }
] },
options: {
responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
interaction: { mode: 'index', intersect: false },
plugins: {
legend: { display: true, position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'line', padding: 16, font: { size: 11, weight: '600' }, color: '#557a61' } },
tooltip: { backgroundColor: '#ffffff', titleColor: '#1b3a24', bodyColor: '#557a61', borderColor: '#e2ebd9', borderWidth: 1, padding: 10, cornerRadius: 6 }
},
scales: {
x: { title: { display: true, text: 'Generation (t)', color: '#557a61', font: { size: 11, weight: '600' } }, grid: { color: 'rgba(226,235,217,0.5)' }, ticks: { color: '#557a61', font: { size: 10 }, maxTicksLimit: 15 } },
y: { title: { display: true, text: 'Population (N)', color: '#557a61', font: { size: 11, weight: '600' } }, grid: { color: 'rgba(226,235,217,0.5)' }, ticks: { color: '#557a61', font: { size: 10 }, callback: function(v) { return v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v; } }, beginAtZero: true }
}
}
});
}

function setupSliders() {
const config = [
{ id: 'sliderN0', key: 'N0', display: 'valN0', fmt: function(v) { return Math.round(v).toString(); } },
{ id: 'sliderB', key: 'b', display: 'valB', fmt: function(v) { return v.toFixed(2); } },
{ id: 'sliderD', key: 'd', display: 'valD', fmt: function(v) { return v.toFixed(2); } },
{ id: 'sliderK', key: 'K', display: 'valK', fmt: function(v) { return Math.round(v).toString(); } },
{ id: 'sliderTMax', key: 'tMax', display: 'valTMax', fmt: function(v) { return Math.round(v).toString(); } }
];
config.forEach(function(c) {
var el = document.getElementById(c.id);
if (!el) return;
el.addEventListener('input', function() {
var val = parseFloat(this.value);
state.params[c.key] = val;
document.getElementById(c.display).textContent = c.fmt(val);
if (c.key === 'b' || c.key === 'd') {
state.params.r = state.params.b - state.params.d;
document.getElementById('valR').textContent = formatFloat(state.params.r, 2);
var pct = Math.max(0, Math.min(100, ((state.params.r + 2) / 4) * 100));
document.getElementById('rateFill').style.width = pct + '%';
}
hardReset();
});
});
}

function setupModelToggle() {
var btns = document.querySelectorAll('.toggle-btn');
btns.forEach(function(btn) {
btn.addEventListener('click', function() {
btns.forEach(function(b) { b.classList.remove('active'); });
this.classList.add('active');
state.params.model = this.dataset.model;
document.getElementById('modelState').textContent = 'Model: ' + this.textContent.trim();
var sliderK = document.getElementById('sliderK');
if (state.params.model === 'exponential') { sliderK.disabled = true; sliderK.style.opacity = '0.4'; }
else { sliderK.disabled = false; sliderK.style.opacity = '1'; }
hardReset();
});
});
}

function setupButtons() {
document.getElementById('btnRun').addEventListener('click', runSimulation);
document.getElementById('btnPause').addEventListener('click', togglePause);
document.getElementById('btnStep').addEventListener('click', stepSimulation);
document.getElementById('btnReset').addEventListener('click', resetSimulation);
document.getElementById('btnExport').addEventListener('click', exportCSV);
}

document.addEventListener('DOMContentLoaded', function() {
initChart();
setupSliders();
setupModelToggle();
setupButtons();
var pct = Math.max(0, Math.min(100, ((state.params.r + 2) / 4) * 100));
document.getElementById('rateFill').style.width = pct + '%';
});
