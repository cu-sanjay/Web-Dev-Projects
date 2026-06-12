// ============================================================
//  COLOR FREQUENCY AUDIO SYNTHESIZER — Core DSP Engine
//  Web Audio API oscillator + wavelength-to-frequency mapping
// ============================================================

// ─── COLOR RIBBON DATA ─────────────────────────────────────

const RIBBON_COLORS = [
  { hex: '#dc2626', name: 'Red', wl: 700 },
  { hex: '#ea580c', name: 'Orange', wl: 620 },
  { hex: '#d97706', name: 'Amber', wl: 590 },
  { hex: '#ca8a04', name: 'Yellow', wl: 570 },
  { hex: '#65a30d', name: 'Chartreuse', wl: 550 },
  { hex: '#16a34a', name: 'Green', wl: 520 },
  { hex: '#0d9488', name: 'Teal', wl: 490 },
  { hex: '#0284c7', name: 'Cyan', wl: 470 },
  { hex: '#2563eb', name: 'Blue', wl: 450 },
  { hex: '#4f46e5', name: 'Indigo', wl: 430 },
  { hex: '#7c3aed', name: 'Violet', wl: 410 },
  { hex: '#a21caf', name: 'Magenta', wl: 390 },
];

// ─── CONSTANTS ──────────────────────────────────────────────

const WL_MIN = 380;
const WL_MAX = 750;
const FREQ_MIN = 220;  // A3
const FREQ_MAX = 880;  // A5

// ─── STATE ──────────────────────────────────────────────────

const state = {
  audioCtx: null,
  oscillator: null,
  gainNode: null,
  isInitialized: false,
  isPlaying: false,
  waveform: 'sine',
  volume: 0.75,
  harmonics: 1.0,
  activeRibbon: null,
};

// ─── DOM REFS ───────────────────────────────────────────────

const ribbonContainer = document.getElementById('ribbon-container');
const telemWavelength = document.getElementById('telem-wavelength');
const telemPitch = document.getElementById('telem-pitch');
const telemHex = document.getElementById('telem-hex');
const diagStatus = document.getElementById('diag-status');
const noteDisplay = document.getElementById('note-display');
const volumeSlider = document.getElementById('volume-slider');
const volumeDisplay = document.getElementById('volume-display');
const harmonicsSlider = document.getElementById('harmonics-slider');
const harmonicsDisplay = document.getElementById('harmonics-display');

// ─── WAVELENGTH → FREQUENCY ───────────────────────────────

function wavelengthToFreq(wl) {
  return FREQ_MIN + ((wl - WL_MIN) * (FREQ_MAX - FREQ_MIN)) / (WL_MAX - WL_MIN);
}

// ─── RIBBON LABEL ──────────────────────────────────────────

function noteLabelForWavelength(wl) {
  const freq = wavelengthToFreq(wl);
  const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  const A4 = 440;
  const semitones = Math.round(12 * Math.log2(freq / A4));
  const octave = 4 + Math.floor(semitones / 12);
  const noteIdx = ((semitones % 12) + 12) % 12;
  return notes[noteIdx] + octave;
}

// ─── SET DIAGNOSTIC ────────────────────────────────────────

function setDiagnostic(msg, cls) {
  diagStatus.textContent = msg;
  diagStatus.className = 'diag-status ' + cls;
}

// ─── BUILD RIBBONS ─────────────────────────────────────────

function buildRibbons() {
  ribbonContainer.innerHTML = '';
  for (const data of RIBBON_COLORS) {
    const el = document.createElement('div');
    el.className = 'color-ribbon-card';
    el.style.backgroundColor = data.hex;
    el.dataset.hex = data.hex;
    el.dataset.wl = data.wl;
    el.innerHTML = `
      <div class="ribbon-label">${data.name}<br>${data.wl}nm</div>
      <div class="ribbon-indicator"></div>
    `;

    el.addEventListener('mouseenter', () => onRibbonEnter(el, data));
    el.addEventListener('mouseleave', () => onRibbonLeave());
    el.addEventListener('mousedown', () => initAudio());

    ribbonContainer.appendChild(el);
  }
}

// ─── AUDIO INIT ────────────────────────────────────────────

function initAudio() {
  if (state.isInitialized) return;
  try {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    state.gainNode = state.audioCtx.createGain();
    state.gainNode.gain.value = 0;
    state.gainNode.connect(state.audioCtx.destination);
    state.isInitialized = true;
    setDiagnostic('AUDIO CONTEXT READY — HOVER A RIBBON', 'ready');
  } catch (e) {
    setDiagnostic('ERROR: AUDIO CONTEXT FAILED', 'bounds');
  }
}

// ─── OSCILLATOR MANAGER ────────────────────────────────────

function startOscillator(freq) {
  if (!state.isInitialized) return;
  stopOscillator();

  const ctx = state.audioCtx;
  const osc = ctx.createOscillator();
  osc.type = state.waveform;
  osc.frequency.value = freq * state.harmonics;

  const now = ctx.currentTime;
  state.gainNode.gain.cancelScheduledValues(now);
  state.gainNode.gain.setValueAtTime(0, now);
  state.gainNode.gain.exponentialRampToValueAtTime(state.volume, now + 0.03);

  osc.connect(state.gainNode);
  osc.start(now);

  state.oscillator = osc;
  state.isPlaying = true;
}

function stopOscillator() {
  if (!state.oscillator) return;
  const ctx = state.audioCtx;
  const now = ctx.currentTime;

  state.gainNode.gain.cancelScheduledValues(now);
  state.gainNode.gain.setValueAtTime(state.gainNode.gain.value || 0.001, now);
  state.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  try {
    state.oscillator.stop(now + 0.08);
  } catch (e) {}

  state.oscillator = null;
  state.isPlaying = false;
}

function updateOscillatorFrequency(freq) {
  if (!state.oscillator || !state.isInitialized) return;
  const now = state.audioCtx.currentTime;
  state.oscillator.frequency.setValueAtTime(freq * state.harmonics, now);
}

function updateOscillatorVolume(vol) {
  if (!state.gainNode || !state.isInitialized) return;
  const now = state.audioCtx.currentTime;
  state.gainNode.gain.cancelScheduledValues(now);
  state.gainNode.gain.setValueAtTime(state.gainNode.gain.value || 0.001, now);
  state.gainNode.gain.exponentialRampToValueAtTime(vol, now + 0.03);
}

function updateOscillatorType() {
  if (!state.oscillator || !state.isInitialized) return;
  // Need to restart oscillator with new type
  if (state.isPlaying && state.activeRibbon) {
    const freq = wavelengthToFreq(state.activeRibbon.wl);
    stopOscillator();
    startOscillator(freq);
  }
}

// ─── RIBBON INTERACTIONS ───────────────────────────────────

function onRibbonEnter(el, data) {
  initAudio();
  if (!state.isInitialized) return;

  state.activeRibbon = data;
  const freq = wavelengthToFreq(data.wl);

  // Update active state on ribbons
  document.querySelectorAll('.color-ribbon-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  // Start or update oscillator
  if (!state.isPlaying) {
    startOscillator(freq);
  } else {
    updateOscillatorFrequency(freq);
  }

  // Update telemetry
  telemWavelength.textContent = data.wl + ' nm';
  telemPitch.textContent = freq.toFixed(2) + ' Hz';
  telemHex.textContent = data.hex.toUpperCase();
  noteDisplay.textContent = noteLabelForWavelength(data.wl) + ' · ' + data.name;

  setDiagnostic('SYNTHESIZING REAL-TIME OSCILLATOR...', 'active');
}

function onRibbonLeave() {
  state.activeRibbon = null;
  document.querySelectorAll('.color-ribbon-card').forEach(c => c.classList.remove('active'));

  stopOscillator();

  telemWavelength.textContent = '— nm';
  telemPitch.textContent = '— Hz';
  telemHex.textContent = '—';
  noteDisplay.textContent = '—';

  setDiagnostic('CURSOR OVER FIELD BOUNDS', 'bounds');
}

// ─── WAVEFORM BUTTONS ──────────────────────────────────────

document.querySelectorAll('.wave-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wave-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.waveform = btn.dataset.wave;
    updateOscillatorType();
  });
});

// ─── VOLUME SLIDER ─────────────────────────────────────────

volumeSlider.addEventListener('input', () => {
  state.volume = parseFloat(volumeSlider.value) / 100;
  volumeDisplay.textContent = Math.round(state.volume * 100) + '%';
  if (state.isPlaying) {
    updateOscillatorVolume(state.volume);
  }
});

// ─── HARMONICS SLIDER ──────────────────────────────────────

harmonicsSlider.addEventListener('input', () => {
  state.harmonics = parseFloat(harmonicsSlider.value) / 100;
  harmonicsDisplay.textContent = state.harmonics.toFixed(1) + 'x';
  if (state.isPlaying && state.activeRibbon) {
    const freq = wavelengthToFreq(state.activeRibbon.wl);
    updateOscillatorFrequency(freq);
  }
});

// ─── PAGE LEAVE SAFETY ─────────────────────────────────────

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopOscillator();
    state.activeRibbon = null;
  }
});

// ─── INIT ───────────────────────────────────────────────────

function init() {
  buildRibbons();
  setDiagnostic('AWAITING AUDIO CONTEXT INITIALIZATION', 'idle');
}

init();
