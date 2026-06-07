/* ── Constants ── */

const POSITIONS = 30;
const TICK_MS = 1000;
const ANOMALY_WINDOW_MS = 1000;
const ANOMALY_CHANCE = 0.12;

const CANVAS_SIZE = 320;
const CENTER = CANVAS_SIZE / 2;
const CLOCK_RADIUS = 120;
const DOT_RADIUS = 4;
const BLIP_RADIUS = 8;
const HAND_RADIUS = 95;

/* ── DOM Refs ── */

const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
const statusDot = document.getElementById('statusDot');

const startBtn = document.getElementById('startBtn');
const reportBtn = document.getElementById('reportBtn');
const endBtn = document.getElementById('endBtn');

const eventsValue = document.getElementById('eventsValue');
const hitsValue = document.getElementById('hitsValue');
const missesValue = document.getElementById('missesValue');
const faValue = document.getElementById('faValue');
const rtValue = document.getElementById('rtValue');
const elapsedDisplay = document.getElementById('elapsedDisplay');

const summaryOverlay = document.getElementById('summaryOverlay');
const closeSummaryBtn = document.getElementById('closeSummaryBtn');
const summaryDuration = document.getElementById('summaryDuration');
const summaryEvents = document.getElementById('summaryEvents');
const summaryHits = document.getElementById('summaryHits');
const summaryMisses = document.getElementById('summaryMisses');
const summaryFA = document.getElementById('summaryFA');
const summaryHitRate = document.getElementById('summaryHitRate');
const summaryRT = document.getElementById('summaryRT');

/* ── State ── */

const STATE = { IDLE: 0, RUNNING: 1, PAUSED: 2, ENDED: 3 };
let state = STATE.IDLE;

let currentPos = 0;
let tickTimer = null;
let lastTickWasDouble = false;

let anomalyActive = false;
let anomalyTime = 0;
let missTimer = null;

let events = 0;
let hits = 0;
let misses = 0;
let falseAlarms = 0;
let reactionTimes = [];

let sessionStartTime = 0;
let elapsedTimer = null;
let accumulatedPauseMs = 0;
let pauseStartTime = 0;

/* ── Canvas Drawing ── */

function getPosition(index) {
  const angle = (index * (360 / POSITIONS) - 90) * Math.PI / 180;
  return {
    x: CENTER + CLOCK_RADIUS * Math.cos(angle),
    y: CENTER + CLOCK_RADIUS * Math.sin(angle)
  };
}

function getHandTip(index) {
  const angle = (index * (360 / POSITIONS) - 90) * Math.PI / 180;
  return {
    x: CENTER + HAND_RADIUS * Math.cos(angle),
    y: CENTER + HAND_RADIUS * Math.sin(angle)
  };
}

function renderClock() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const tip = getHandTip(currentPos);
  const blip = getPosition(currentPos);

  ctx.beginPath();
  ctx.moveTo(CENTER, CENTER);
  ctx.lineTo(tip.x, tip.y);
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#1a3a2a';
  ctx.fill();

  for (let i = 0; i < POSITIONS; i++) {
    const p = getPosition(i);
    const isActive = i === currentPos;
    const isCardinal = i === 0 || i === 7 || i === 15 || i === 22;

    const radius = isActive ? BLIP_RADIUS : (isCardinal ? DOT_RADIUS + 1.5 : DOT_RADIUS);

    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

    if (isActive) {
      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = isCardinal ? '#1e4a2e' : '#122218';
      ctx.fill();
    }
  }

  if (state === STATE.IDLE || state === STATE.ENDED) return;

  const tick = performance.now() / 600;
  const glowPulse = 0.5 + 0.5 * Math.sin(tick * Math.PI * 2);

  ctx.beginPath();
  ctx.arc(blip.x, blip.y, BLIP_RADIUS + 2 + glowPulse * 3, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(74, 222, 128, ${0.06 + glowPulse * 0.06})`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(blip.x, blip.y, BLIP_RADIUS + 1, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(74, 222, 128, ${0.1 + glowPulse * 0.1})`;
  ctx.fill();
}

function animationLoop(time) {
  if (state === STATE.RUNNING || state === STATE.PAUSED) {
    renderClock();
    requestAnimationFrame(animationLoop);
  }
}

/* ── Status Dot ── */

function setStatus(type) {
  statusDot.className = type;
  clearTimeout(statusDot._timer);
  statusDot._timer = setTimeout(() => {
    if (state === STATE.RUNNING) {
      statusDot.className = 'active';
    } else if (state === STATE.PAUSED) {
      statusDot.className = '';
    } else {
      statusDot.className = '';
    }
  }, 300);
}

/* ── Anomaly — Hit / Miss / Window ── */

function triggerAnomaly() {
  events++;
  anomalyActive = true;
  anomalyTime = performance.now();

  setStatus('anomaly');
  updateMetrics();

  missTimer = setTimeout(() => {
    if (anomalyActive && state === STATE.RUNNING) {
      anomalyActive = false;
      misses++;
      setStatus('miss');
      updateMetrics();
    }
  }, ANOMALY_WINDOW_MS);
}

function reportAnomaly() {
  if (state !== STATE.RUNNING) return;

  if (anomalyActive) {
    const rt = Math.round(performance.now() - anomalyTime);
    hits++;
    reactionTimes.push(rt);
    anomalyActive = false;
    clearTimeout(missTimer);

    setStatus('hit');
    updateMetrics();
  } else {
    falseAlarms++;
    setStatus('false-alarm');
    updateMetrics();
  }
}

/* ── Tick Engine ── */

function doTick() {
  if (state !== STATE.RUNNING) return;

  let isDouble = false;
  if (!lastTickWasDouble && Math.random() < ANOMALY_CHANCE) {
    isDouble = true;
  }

  if (isDouble) {
    currentPos = (currentPos + 2) % POSITIONS;
    lastTickWasDouble = true;
    triggerAnomaly();
  } else {
    currentPos = (currentPos + 1) % POSITIONS;
    lastTickWasDouble = false;
  }

  renderClock();
}

function startTickTimer() {
  stopTickTimer();
  tickTimer = setInterval(doTick, TICK_MS);
}

function stopTickTimer() {
  if (tickTimer !== null) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

/* ── Metrics UI ── */

function updateMetrics() {
  eventsValue.textContent = events;
  hitsValue.textContent = hits;
  missesValue.textContent = misses;
  faValue.textContent = falseAlarms;

  if (reactionTimes.length > 0) {
    const avg = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
    rtValue.textContent = avg + 'ms';
  } else {
    rtValue.textContent = '—';
  }
}

/* ── Session Timer ── */

function startElapsedTimer() {
  stopElapsedTimer();
  sessionStartTime = performance.now() - accumulatedPauseMs;
  elapsedTimer = setInterval(updateElapsed, 200);
  updateElapsed();
}

function stopElapsedTimer() {
  if (elapsedTimer !== null) {
    clearInterval(elapsedTimer);
    elapsedTimer = null;
  }
}

function updateElapsed() {
  const now = performance.now();
  const elapsedMs = now - sessionStartTime - accumulatedPauseMs;
  const totalSec = Math.floor(elapsedMs / 1000);
  const min = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const sec = String(totalSec % 60).padStart(2, '0');
  elapsedDisplay.textContent = `${min}:${sec}`;
}

function getElapsedSeconds() {
  const now = performance.now();
  const elapsedMs = now - sessionStartTime - accumulatedPauseMs;
  return Math.floor(elapsedMs / 1000);
}

/* ── Session Controls ── */

function startSession() {
  state = STATE.RUNNING;
  currentPos = 0;
  lastTickWasDouble = false;
  events = 0;
  hits = 0;
  misses = 0;
  falseAlarms = 0;
  reactionTimes = [];
  anomalyActive = false;
  clearTimeout(missTimer);
  accumulatedPauseMs = 0;

  updateMetrics();
  startBtn.textContent = 'PAUSE';
  reportBtn.disabled = false;
  endBtn.disabled = false;
  statusDot.className = 'active';

  renderClock();
  startTickTimer();
  startElapsedTimer();
  requestAnimationFrame(animationLoop);
}

function pauseSession() {
  if (state !== STATE.RUNNING) return;
  state = STATE.PAUSED;
  pauseStartTime = performance.now();

  stopTickTimer();
  statusDot.className = '';
  startBtn.textContent = 'RESUME';
  reportBtn.disabled = true;
}

function resumeSession() {
  if (state !== STATE.PAUSED) return;
  state = STATE.RUNNING;

  accumulatedPauseMs += performance.now() - pauseStartTime;

  statusDot.className = 'active';
  startBtn.textContent = 'PAUSE';
  reportBtn.disabled = false;

  startTickTimer();
}

function endSession() {
  if (state === STATE.IDLE) return;
  state = STATE.ENDED;

  stopTickTimer();
  stopElapsedTimer();
  clearTimeout(missTimer);

  anomalyActive = false;
  startBtn.textContent = 'START TEST';
  startBtn.disabled = false;
  reportBtn.disabled = true;
  endBtn.disabled = true;
  statusDot.className = '';

  showSummary();
  renderClock();
}

function toggleStart() {
  if (state === STATE.IDLE || state === STATE.ENDED) {
    startSession();
  } else if (state === STATE.RUNNING) {
    pauseSession();
  } else if (state === STATE.PAUSED) {
    resumeSession();
  }
}

/* ── Summary ── */

function showSummary() {
  const totalEvents = events;
  const totalHits = hits;
  const totalMisses = misses;
  const totalFA = falseAlarms;
  const hitRate = totalEvents > 0 ? Math.round((totalHits / totalEvents) * 100) : 0;
  const avgRT = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) + 'ms'
    : '—';
  const elapsedSec = getElapsedSeconds();
  const min = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
  const sec = String(elapsedSec % 60).padStart(2, '0');

  summaryDuration.textContent = `${min}:${sec}`;
  summaryEvents.textContent = totalEvents;
  summaryHits.textContent = totalHits;
  summaryMisses.textContent = totalMisses;
  summaryFA.textContent = totalFA;
  summaryHitRate.textContent = hitRate + '%';
  summaryRT.textContent = avgRT;

  summaryOverlay.classList.remove('hidden');
}

/* ── Input Listeners ── */

startBtn.addEventListener('click', toggleStart);

reportBtn.addEventListener('click', reportAnomaly);

endBtn.addEventListener('click', endSession);

closeSummaryBtn.addEventListener('click', () => {
  summaryOverlay.classList.add('hidden');
  startBtn.disabled = false;
  renderClock();
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (summaryOverlay.classList.contains('hidden')) {
      reportAnomaly();
    }
  }
});

/* ── Boot ── */

renderClock();
