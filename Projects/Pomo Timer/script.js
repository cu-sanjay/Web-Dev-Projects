const clock = document.getElementById('clock');
const phaseLabel = document.getElementById('phaseLabel');
const progressFill = document.getElementById('progressFill');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const tabs = document.querySelectorAll('.tab');
const focusCountEl = document.getElementById('focusCount');
const totalMinEl = document.getElementById('totalMin');
const todayCountEl = document.getElementById('todayCount');
const settingsToggle = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');
const focusDurationInput = document.getElementById('focusDuration');
const shortDurationInput = document.getElementById('shortDuration');
const longDurationInput = document.getElementById('longDuration');
const applySettings = document.getElementById('applySettings');
const overlay = document.getElementById('overlay');
const dismissBtn = document.getElementById('dismissBtn');
const phaseCompleteTitle = document.getElementById('phaseCompleteTitle');
const moToday = document.getElementById('moToday');
const moTotal = document.getElementById('moTotal');

const CIRC = 2 * Math.PI * 88;

const STORAGE_KEY = 'pomometer_data';

const PHASES = { focus: 'focus', short: 'short', long: 'long' };
const PHASE_LABELS = { focus: 'Focus', short: 'Short Break', long: 'Long Break' };
const COMPLETE_MSGS = { focus: 'Focus Complete!', short: 'Short Break Over', long: 'Long Break Over' };

let phase = PHASES.focus;
let durations = { focus: 25, short: 5, long: 15 };
let focusCount = 0;
let totalMinutes = 0;
let todayDate = '';
let todayCount = 0;

let state = 'idle';
let remaining = 0;
let totalMs = 0;
let targetTs = 0;
let animId = null;
let curTab = 0;

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      focusCount = d.focusCount || 0;
      totalMinutes = d.totalMinutes || 0;
      todayDate = d.todayDate || '';
      todayCount = d.todayCount || 0;
      if (d.durations) durations = d.durations;
      const now = new Date();
      const todayKey = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
      if (todayDate !== todayKey) { todayDate = todayKey; todayCount = 0; saveData(); }
    }
  } catch {}
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ focusCount, totalMinutes, todayDate, todayCount, durations }));
  } catch {}
}

function formatTime(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function getPhaseMs() { return durations[phase] * 60000; }

function updateClock() {
  if (state === 'running') {
    const now = Date.now();
    remaining = Math.max(0, targetTs - now);
    if (remaining <= 0) {
      remaining = 0;
      completePhase();
      return;
    }
  }
  clock.textContent = formatTime(remaining);
  const pct = totalMs > 0 ? 1 - remaining / totalMs : 0;
  progressFill.style.strokeDasharray = CIRC;
  progressFill.style.strokeDashoffset = CIRC * (1 - pct);
}

function setPhase(newPhase) {
  phase = newPhase;
  totalMs = getPhaseMs();
  remaining = totalMs;
  curTab = ['focus', 'short', 'long'].indexOf(phase);
  tabs.forEach((t, i) => t.classList.toggle('active', i === curTab));
  clock.className = 'clock ' + phase;
  clock.textContent = formatTime(remaining);
  phaseLabel.textContent = PHASE_LABELS[phase];
  progressFill.className = 'fill ' + phase;
  const pct = totalMs > 0 ? remaining / totalMs : 1;
  progressFill.style.strokeDasharray = CIRC;
  progressFill.style.strokeDashoffset = CIRC * (1 - pct);
}

function tick() {
  if (state !== 'running') return;
  updateClock();
  animId = requestAnimationFrame(tick);
}

function startTimer() {
  if (state === 'running') return;
  if (remaining <= 0) { remaining = totalMs; }
  state = 'running';
  targetTs = Date.now() + remaining;
  startBtn.textContent = 'Running';
  startBtn.disabled = true;
  animId = requestAnimationFrame(tick);
}

function pauseTimer() {
  if (state !== 'running') return;
  state = 'paused';
  if (animId) cancelAnimationFrame(animId);
  remaining = Math.max(0, targetTs - Date.now());
  startBtn.textContent = 'Resume';
  startBtn.disabled = false;
  updateClock();
}

function resetTimer() {
  if (state === 'idle') return;
  state = 'idle';
  if (animId) cancelAnimationFrame(animId);
  remaining = totalMs;
  startBtn.textContent = 'Start';
  startBtn.disabled = false;
  updateClock();
}

function completePhase() {
  state = 'idle';
  if (animId) cancelAnimationFrame(animId);
  startBtn.textContent = 'Start';
  startBtn.disabled = false;

  if (phase === PHASES.focus) {
    focusCount++;
    totalMinutes += durations.focus;
    todayCount++;
    saveData();
    updateStats();
  }

  const isFocus = phase === PHASES.focus;
  phaseCompleteTitle.textContent = COMPLETE_MSGS[phase];
  moToday.textContent = todayCount;
  moTotal.textContent = totalMinutes;
  overlay.classList.add('active');

  clock.textContent = formatTime(0);
  progressFill.style.strokeDashoffset = CIRC;
}

function updateStats() {
  focusCountEl.textContent = focusCount;
  totalMinEl.textContent = totalMinutes;
  todayCountEl.textContent = todayCount;
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    if (state === 'running') pauseTimer();
    setPhase(tab.dataset.phase);
    resetTimer();
  });
});

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
dismissBtn.addEventListener('click', () => {
  overlay.classList.remove('active');
  if (phase === PHASES.focus) {
    setPhase(PHASES.short);
  } else {
    setPhase(PHASES.focus);
  }
  resetTimer();
});

settingsToggle.addEventListener('click', () => {
  settingsPanel.classList.toggle('open');
  settingsToggle.textContent = settingsPanel.classList.contains('open') ? 'Close' : 'Settings';
});

applySettings.addEventListener('click', () => {
  const f = parseInt(focusDurationInput.value);
  const s = parseInt(shortDurationInput.value);
  const l = parseInt(longDurationInput.value);
  if (f > 0 && f <= 120) durations.focus = f;
  if (s > 0 && s <= 30) durations.short = s;
  if (l > 0 && l <= 60) durations.long = l;
  focusDurationInput.value = durations.focus;
  shortDurationInput.value = durations.short;
  longDurationInput.value = durations.long;
  saveData();
  if (state !== 'running') { totalMs = getPhaseMs(); remaining = totalMs; updateClock(); }
  settingsPanel.classList.remove('open');
  settingsToggle.textContent = 'Settings';
});

loadData();
updateStats();
setPhase(PHASES.focus);
