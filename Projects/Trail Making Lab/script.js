/* ── Constants ── */

const NODE_SIZE = 46;
const MIN_NODE_DISTANCE = 58;
const PADDING = 32;
const PART_A_COUNT = 20;
const PART_B_COUNT = 10;

/* ── DOM Refs ── */

const workspace = document.getElementById('workspace');
const canvas = document.getElementById('lineCanvas');
const ctx = canvas.getContext('2d');
const nodesContainer = document.getElementById('nodes-container');
const logPanel = document.getElementById('logPanel');

const partABtn = document.getElementById('partABtn');
const partBBtn = document.getElementById('partBBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const timerDisplay = document.getElementById('timerDisplay');
const dashTime = document.getElementById('dashTime');
const dashConnected = document.getElementById('dashConnected');
const dashErrors = document.getElementById('dashErrors');

/* ── State ── */

let mode = 'A';
let nodes = [];
let connectedIndices = [];
let currentExpectedIndex = 0;
let errors = 0;
let isRunning = false;
let isComplete = false;
let timerStartTime = 0;
let timerRAF = null;
let activeNodeElements = [];

/* ── Sequence Generation ── */

function generateSequence(selectedMode) {
  const labels = [];
  if (selectedMode === 'A') {
    for (let i = 1; i <= PART_A_COUNT; i++) {
      labels.push(String(i));
    }
  } else {
    for (let i = 1; i <= PART_B_COUNT; i++) {
      labels.push(String(i));
      labels.push(String.fromCharCode(64 + i));
    }
  }
  return labels;
}

/* ── Coordinate Generation ── */

function generatePositions(count, width, height) {
  const positions = [];
  const dpr = window.devicePixelRatio || 1;
  const padding = PADDING * (dpr > 1 ? 0.7 : 1);
  const minDist = MIN_NODE_DISTANCE;

  for (let i = 0; i < count; i++) {
    let placed = false;
    let attempts = 0;
    let px, py;

    while (!placed && attempts < 300) {
      px = padding + Math.random() * (width - 2 * padding);
      py = padding + Math.random() * (height - 2 * padding);
      placed = true;

      for (let j = 0; j < positions.length; j++) {
        const dx = positions[j].x - px;
        const dy = positions[j].y - py;
        if (Math.sqrt(dx * dx + dy * dy) < minDist) {
          placed = false;
          break;
        }
      }
      attempts++;
    }

    positions.push({ x: px / width, y: py / height });
  }

  return positions;
}

/* ── Test Generation ── */

function generateTest(selectedMode) {
  const labels = generateSequence(selectedMode);
  const w = workspace.clientWidth;
  const h = workspace.clientHeight;
  const fracs = generatePositions(labels.length, w, h);

  nodes = labels.map((label, i) => ({
    label,
    index: i,
    xFrac: fracs[i].x,
    yFrac: fracs[i].y,
    connected: false
  }));

  connectedIndices = [];
  currentExpectedIndex = 0;
  errors = 0;
  isComplete = false;
}

/* ── Resize / Reflow ── */

function resizeCanvas() {
  const w = workspace.clientWidth;
  const h = workspace.clientHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
}

/* ── Rendering ── */

function renderNodes() {
  nodesContainer.innerHTML = '';
  activeNodeElements = [];

  nodes.forEach((node, i) => {
    const el = document.createElement('div');
    el.className = 'node';
    el.textContent = node.label;
    el.style.left = (node.xFrac * 100) + '%';
    el.style.top = (node.yFrac * 100) + '%';

    if (!isRunning && !isComplete) {
      el.classList.add('idle');
    }

    if (node.connected) {
      el.classList.add('connected');
      if (isComplete) el.classList.add('completed');
    } else if (i === currentExpectedIndex && isRunning && !isComplete) {
      el.classList.add('active-target');
    }

    el.dataset.index = i;
    el.addEventListener('click', () => handleNodeClick(i));
    nodesContainer.appendChild(el);
    activeNodeElements.push(el);
  });
}

function renderLines() {
  const w = workspace.clientWidth;
  const h = workspace.clientHeight;
  ctx.clearRect(0, 0, w, h);

  if (connectedIndices.length < 2) return;

  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#357abd');
  gradient.addColorStop(1, '#4a8cd4');

  ctx.beginPath();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 0; i < connectedIndices.length; i++) {
    const node = nodes[connectedIndices[i]];
    const x = node.xFrac * w;
    const y = node.yFrac * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function updateDashboard() {
  const total = nodes.length;
  const connected = connectedIndices.length;

  dashConnected.textContent = `${connected} / ${total}`;
  dashErrors.textContent = String(errors);
}

/* ── Logging ── */

function addLog(message, type) {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = message;
  logPanel.appendChild(entry);
  logPanel.scrollTop = logPanel.scrollHeight;
}

function clearLog() {
  logPanel.innerHTML = '';
}

/* ── Timer ── */

function formatTime(ms) {
  const totalMs = Math.max(0, ms);
  const minutes = String(Math.floor(totalMs / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((totalMs % 60000) / 1000)).padStart(2, '0');
  const millis = String(Math.floor(totalMs % 1000)).padStart(3, '0');
  return `${minutes}:${seconds}.${millis}`;
}

function startTimer() {
  timerStartTime = performance.now();
  tickTimer();
}

function tickTimer() {
  const elapsed = performance.now() - timerStartTime;
  const formatted = formatTime(elapsed);
  timerDisplay.textContent = formatted;
  dashTime.textContent = formatted;
  timerRAF = requestAnimationFrame(tickTimer);
}

function stopTimer() {
  if (timerRAF !== null) {
    cancelAnimationFrame(timerRAF);
    timerRAF = null;
  }
}

function resetTimer() {
  stopTimer();
  timerDisplay.textContent = '00:00.000';
  dashTime.textContent = '00:00.000';
}

/* ── Node Click Handler ── */

function handleNodeClick(index) {
  if (!isRunning || isComplete) return;
  if (nodes[index].connected) return;

  if (index === currentExpectedIndex) {
    nodes[index].connected = true;
    connectedIndices.push(index);
    currentExpectedIndex++;

    if (connectedIndices.length === 1) {
      startTimer();
      addLog('Assessment started. Sequence initiated.', 'info');
    }

    addLog(`Connected "${nodes[index].label}"`, 'success');

    renderLines();
    renderNodes();
    updateDashboard();

    if (currentExpectedIndex === nodes.length) {
      completeTest();
    }
  } else {
    errors++;
    flashNodeError(index);
    updateDashboard();
    const expected = nodes[currentExpectedIndex].label;
    const clicked = nodes[index].label;
    addLog(`ERROR: Expected "${expected}", clicked "${clicked}"`, 'error');
  }
}

/* ── Error Flash ── */

function flashNodeError(index) {
  const el = activeNodeElements[index];
  if (!el) return;
  el.classList.remove('error-flash');
  void el.offsetWidth;
  el.classList.add('error-flash');
  el.addEventListener('animationend', () => {
    el.classList.remove('error-flash');
  }, { once: true });
}

/* ── Complete ── */

function completeTest() {
  isComplete = true;
  stopTimer();

  const finalTime = timerDisplay.textContent;

  renderNodes();
  updateDashboard();

  addLog(`Test Complete! Time: ${finalTime} | Errors: ${errors}`, 'complete');

  startBtn.textContent = 'Start Assessment';
  startBtn.disabled = false;
}

/* ── Session Control ── */

function startAssessment() {
  if (isRunning) return;

  resetSession();
  generateTest(mode);

  resizeCanvas();

  clearLog();
  addLog(`Board generated — Part ${mode} (${nodes.length} targets)`, 'info');
  addLog('Click node "1" to begin timing.', 'info');

  isRunning = true;

  renderNodes();
  renderLines();
  updateDashboard();

  startBtn.textContent = 'Running...';
  startBtn.disabled = true;
}

function resetSession() {
  isRunning = false;
  isComplete = false;
  currentExpectedIndex = 0;
  errors = 0;
  connectedIndices = [];
  nodes = [];

  stopTimer();
  resetTimer();

  startBtn.textContent = 'Start Assessment';
  startBtn.disabled = false;

  nodesContainer.innerHTML = '';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  clearLog();
  addLog('Board reset. Select variant and press Start Assessment.', 'info');

  dashConnected.textContent = '0 / 20';
  dashErrors.textContent = '0';
}

/* ── Mode Switching ── */

function switchMode(newMode) {
  if (isRunning) return;

  mode = newMode;

  partABtn.classList.toggle('active', mode === 'A');
  partBBtn.classList.toggle('active', mode === 'B');

  resetSession();
}

/* ── Event Wiring ── */

partABtn.addEventListener('click', () => switchMode('A'));
partBBtn.addEventListener('click', () => switchMode('B'));
startBtn.addEventListener('click', startAssessment);
resetBtn.addEventListener('click', resetSession);

let resizeTimeout = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resizeCanvas();
    renderLines();
    renderNodes();
  }, 150);
});

/* ── Boot ── */

resetSession();
