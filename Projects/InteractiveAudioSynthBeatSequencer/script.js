// script.js - Interactive Synthesizer & Step Sequencer Core

// --- STATE MANAGEMENT ---
const STATE = {
  // Audio Nodes
  audioCtx: null,
  masterFilter: null,
  analyser: null,
  
  // Sequencer Variables
  isPlaying: false,
  bpm: 120,
  currentStep: 0,
  schedulerTimer: null,
  nextStepTime: 0.0,
  lookaheadMs: 25.0,
  scheduleAheadTimeSec: 0.1,
  
  // Grid Data (8 channels x 16 steps)
  // Channels: 0: Kick, 1: Snare, 2: Hihat, 3: Clap, 4: Pitch C4 (261.63Hz), 5: Pitch E4 (329.63Hz), 6: Pitch G4 (392.00Hz), 7: Pitch B4 (493.88Hz)
  grid: Array(8).fill(null).map(() => Array(16).fill(false)),
  
  // Instrument Volumes (%)
  volumes: {
    kick: 0.8,
    snare: 0.7,
    hihat: 0.6,
    clap: 0.5,
    synth: 0.8
  },
  
  // Synth ADSR & DSP Cutoff
  synth: {
    waveform: "sawtooth",
    attack: 0.05,
    decay: 0.1,
    sustain: 0.5,
    release: 0.3,
    cutoff: 1200,
    q: 2
  },

  // UI
  theme: "dark",
  visualMode: "wave"
};

// Instrument Rows Data
const INSTRUMENTS = [
  { name: "Kick 🥁", type: "drum", id: "kick", colorClass: "active-kick" },
  { name: "Snare 🥁", type: "drum", id: "snare", colorClass: "active-snare" },
  { name: "Hi-Hat 🥁", type: "drum", id: "hihat", colorClass: "active-hihat" },
  { name: "Clap 🥁", type: "drum", id: "clap", colorClass: "active-clap" },
  { name: "Synth B4 🎹", type: "synth", note: "B4", freq: 493.88, colorClass: "active-synth" },
  { name: "Synth G4 🎹", type: "synth", note: "G4", freq: 392.00, colorClass: "active-synth" },
  { name: "Synth E4 🎹", type: "synth", note: "E4", freq: 329.63, colorClass: "active-synth" },
  { name: "Synth C4 🎹", type: "synth", note: "C4", freq: 261.63, colorClass: "active-synth" }
];

// Piano manual keys config
const PIANO_KEYS = [
  { note: "C4", key: "A", freq: 261.63, type: "white" },
  { note: "C#4", key: "W", freq: 277.18, type: "black" },
  { note: "D4", key: "S", freq: 293.66, type: "white" },
  { note: "D#4", key: "E", freq: 311.13, type: "black" },
  { note: "E4", key: "D", freq: 329.63, type: "white" },
  { note: "F4", key: "F", freq: 349.23, type: "white" },
  { note: "F#4", key: "T", freq: 369.99, type: "black" },
  { note: "G4", key: "G", freq: 392.00, type: "white" },
  { note: "G#4", key: "Y", freq: 415.30, type: "black" },
  { note: "A4", key: "H", freq: 440.00, type: "white" },
  { note: "A#4", key: "U", freq: 466.16, type: "black" },
  { note: "B4", key: "J", freq: 493.88, type: "white" },
  { note: "C5", key: "K", freq: 523.25, type: "white" }
];

// Preconfigured sequencing patterns
const PRESETS = {
  techno: [
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Hihat
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true], // Clap
    [true, false, true, false, false, false, false, false, true, false, true, false, false, false, false, false], // B4
    [false, false, false, true, false, false, true, false, false, false, false, true, false, false, true, false], // G4
    [false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false], // E4
    [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false]  // C4
  ],
  retro: [
    [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], // Kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
    [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], // Hihat
    [false, false, false, false, false, false, false, true, false, false, false, false, false, false, true, false], // Clap
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // B4
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // G4
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // E4
    [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true]  // C4
  ],
  chill: [
    [true, false, false, false, false, false, false, true, false, false, true, false, false, false, false, false], // Kick
    [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], // Snare
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Hihat
    [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false], // Clap
    [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // B4
    [false, false, true, false, false, false, false, false, true, false, false, false, false, false, false, false], // G4
    [false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false], // E4
    [false, false, false, false, false, false, false, false, false, false, false, false, true, false, true, false]  // C4
  ]
};

// --- INITIAL LOADERS ---
document.addEventListener("DOMContentLoaded", () => {
  initUI();
  initSequencerGrid();
  initPianoKeyboard();
  setupVisualizer();
  
  // Activate Web Audio context on user page interaction
  document.body.addEventListener("click", initAudio, { once: true });
});

// --- AUDIO CONTEXT SETUP & ROUTING ---
function initAudio() {
  if (STATE.audioCtx) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  STATE.audioCtx = new AudioContext();

  // Create Synth Output Chain Routing
  STATE.masterFilter = STATE.audioCtx.createBiquadFilter();
  STATE.masterFilter.type = "lowpass";
  STATE.masterFilter.frequency.value = STATE.synth.cutoff;
  STATE.masterFilter.Q.value = STATE.synth.q;

  STATE.analyser = STATE.audioCtx.createAnalyser();
  STATE.analyser.fftSize = 256;

  // Connection routing
  STATE.masterFilter.connect(STATE.analyser);
  STATE.analyser.connect(STATE.audioCtx.destination);

  // Update status UI banner
  const banner = document.getElementById("audio-status");
  banner.textContent = "🔊 Audio Active (DSP Engaged)";
  banner.className = "audio-status-banner connected";
}

// --- DRUM SYNTHESIS ALGORITHMS ---

// Kick synthesis: Oscillator pitch sweep
function playSynthKick(time, vol) {
  if (!STATE.audioCtx) return;
  const osc = STATE.audioCtx.createOscillator();
  const gain = STATE.audioCtx.createGain();

  osc.connect(gain);
  gain.connect(STATE.analyser); // connect drums directly to visualizer bypassing main low-pass filter

  osc.frequency.setValueAtTime(120, time);
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.12);

  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  osc.start(time);
  osc.stop(time + 0.13);
}

// White noise buffer generator for snare/hi-hat/claps
function createNoiseBuffer() {
  const bufferSize = STATE.audioCtx.sampleRate * 0.5; // 0.5s buffer
  const buffer = STATE.audioCtx.createBuffer(1, bufferSize, STATE.audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Snare synthesis: White noise bandpass filtered
function playSynthSnare(time, vol) {
  if (!STATE.audioCtx) return;
  const noise = STATE.audioCtx.createBufferSource();
  noise.buffer = createNoiseBuffer();

  const filter = STATE.audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1000;

  const gain = STATE.audioCtx.createGain();

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(STATE.analyser);

  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

  noise.start(time);
  noise.stop(time + 0.16);
}

// Hi-Hat synthesis: White noise highpass filtered
function playSynthHihat(time, vol) {
  if (!STATE.audioCtx) return;
  const noise = STATE.audioCtx.createBufferSource();
  noise.buffer = createNoiseBuffer();

  const filter = STATE.audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7500;

  const gain = STATE.audioCtx.createGain();

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(STATE.analyser);

  gain.gain.setValueAtTime(vol * 0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

  noise.start(time);
  noise.stop(time + 0.06);
}

// Clap synthesis: Multiple rapid white noise bursts
function playSynthClap(time, vol) {
  if (!STATE.audioCtx) return;
  
  // Render clap from rapid bursts
  const noise = STATE.audioCtx.createBufferSource();
  noise.buffer = createNoiseBuffer();

  const filter = STATE.audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1500;

  const gain = STATE.audioCtx.createGain();

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(STATE.analyser);

  // Trigger rapid burst gains simulating hand claps
  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.015);
  
  gain.gain.setValueAtTime(vol * 0.8, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.035);

  gain.gain.setValueAtTime(vol * 0.6, time + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

  noise.start(time);
  noise.stop(time + 0.2);
}

// --- SYNTH NOTE INSTRUMENT ENGINE (ADSR) ---
function playSynthNote(freq, time, vol) {
  if (!STATE.audioCtx) return;

  const osc = STATE.audioCtx.createOscillator();
  const gain = STATE.audioCtx.createGain();

  osc.type = STATE.synth.waveform;
  osc.frequency.setValueAtTime(freq, time);

  osc.connect(gain);
  gain.connect(STATE.masterFilter); // routes to filters -> analyser

  // Configure ADSR envelope parameters
  const attackTime = STATE.synth.attack;
  const decayTime = STATE.synth.decay;
  const sustainLevel = STATE.synth.sustain * vol;
  const releaseTime = STATE.synth.release;

  gain.gain.setValueAtTime(0, time);
  // Attack
  gain.gain.linearRampToValueAtTime(vol, time + attackTime);
  // Decay
  gain.gain.exponentialRampToValueAtTime(sustainLevel + 0.001, time + attackTime + decayTime);
  // Sustain/Release trigger
  const noteDuration = 0.2; // locked length of note in sequencer steps
  const stopTime = time + noteDuration;
  
  gain.gain.setValueAtTime(sustainLevel, stopTime);
  gain.gain.exponentialRampToValueAtTime(0.001, stopTime + releaseTime);

  osc.start(time);
  osc.stop(stopTime + releaseTime);
}

// Manual play synth note (without fixed release length)
let activeOscillators = {};

function triggerManualSynthStart(freq, noteName) {
  initAudio();
  if (!STATE.audioCtx) return;

  if (activeOscillators[noteName]) {
    triggerManualSynthStop(noteName);
  }

  const osc = STATE.audioCtx.createOscillator();
  const gain = STATE.audioCtx.createGain();

  osc.type = STATE.synth.waveform;
  osc.frequency.value = freq;

  osc.connect(gain);
  gain.connect(STATE.masterFilter);

  const now = STATE.audioCtx.currentTime;
  const attackTime = STATE.synth.attack;
  const decayTime = STATE.synth.decay;
  const sustainLevel = STATE.synth.sustain * STATE.volumes.synth;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(STATE.volumes.synth, now + attackTime);
  gain.gain.exponentialRampToValueAtTime(sustainLevel + 0.001, now + attackTime + decayTime);

  osc.start(now);

  activeOscillators[noteName] = { osc, gain };
}

function triggerManualSynthStop(noteName) {
  if (!activeOscillators[noteName]) return;

  const { osc, gain } = activeOscillators[noteName];
  delete activeOscillators[noteName];

  if (!STATE.audioCtx) return;
  const now = STATE.audioCtx.currentTime;
  const releaseTime = STATE.synth.release;

  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);

  osc.stop(now + releaseTime);
}

// --- SEQUENCER SCHEDULER ENGINE ---
function scheduler() {
  while (STATE.nextStepTime < STATE.audioCtx.currentTime + STATE.scheduleAheadTimeSec) {
    scheduleStep(STATE.currentStep, STATE.nextStepTime);
    incrementSequencerStep();
  }
}

function scheduleStep(step, time) {
  // Read grid triggers for current step column
  for (let row = 0; row < 8; row++) {
    if (STATE.grid[row][step]) {
      const instr = INSTRUMENTS[row];
      
      if (instr.type === "drum") {
        const vol = STATE.volumes[instr.id];
        if (instr.id === "kick") playSynthKick(time, vol);
        else if (instr.id === "snare") playSynthSnare(time, vol);
        else if (instr.id === "hihat") playSynthHihat(time, vol);
        else if (instr.id === "clap") playSynthClap(time, vol);
      } 
      else if (instr.type === "synth") {
        playSynthNote(instr.freq, time, STATE.volumes.synth);
      }
    }
  }

  // Sync visuals to requestAnimationFrame scheduler sync
  const stepToVisual = step;
  setTimeout(() => {
    if (!STATE.isPlaying) return;
    highlightPlayhead(stepToVisual);
  }, (time - STATE.audioCtx.currentTime) * 1000);
}

function incrementSequencerStep() {
  // calculate time length of sixteenth notes
  const secondsPerBeat = 60.0 / STATE.bpm;
  const stepDuration = secondsPerBeat / 4.0; // 4 sixteenth notes per beat
  
  STATE.nextStepTime += stepDuration;
  STATE.currentStep = (STATE.currentStep + 1) % 16;
}

function startSequencer() {
  initAudio();
  if (STATE.isPlaying) return;

  STATE.isPlaying = true;
  STATE.currentStep = 0;
  STATE.nextStepTime = STATE.audioCtx.currentTime + 0.05;

  STATE.schedulerTimer = setInterval(() => {
    scheduler();
  }, STATE.lookaheadMs);

  document.getElementById("btn-play-sequencer").classList.add("active");
}

function stopSequencer() {
  if (!STATE.isPlaying) return;

  STATE.isPlaying = false;
  clearInterval(STATE.schedulerTimer);
  
  document.getElementById("btn-play-sequencer").classList.remove("active");
  clearPlayheadHighlight();
}

// --- UI CONSTRUCTORS & SETUP ---
function initSequencerGrid() {
  const container = document.getElementById("sequencer-rows");
  container.innerHTML = "";

  // Set up 16 numbers headers
  const stepsHeaders = document.getElementById("steps-headers");
  stepsHeaders.innerHTML = "";
  for (let i = 1; i <= 16; i++) {
    const num = document.createElement("div");
    num.className = "step-header-num";
    num.id = `step-header-${i - 1}`;
    num.textContent = i.toString().padStart(2, '0');
    stepsHeaders.appendChild(num);
  }

  // Draw 8 instrument rows
  INSTRUMENTS.forEach((instr, rowIdx) => {
    const row = document.createElement("div");
    row.className = "grid-row";

    const label = document.createElement("div");
    label.className = "row-label-box";
    label.innerHTML = `${instr.name} <span>${instr.type}</span>`;
    row.appendChild(label);

    const stepsContainer = document.createElement("div");
    stepsContainer.className = "steps-grid";

    // Draw 16 step cell nodes
    for (let stepIdx = 0; stepIdx < 16; stepIdx++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.id = `cell-${rowIdx}-${stepIdx}`;

      cell.addEventListener("click", () => {
        const active = !STATE.grid[rowIdx][stepIdx];
        STATE.grid[rowIdx][stepIdx] = active;
        
        if (active) {
          cell.classList.add(instr.colorClass);
          // Play quick note trigger to preview
          previewInstrument(instr);
        } else {
          cell.classList.remove(instr.colorClass);
        }
      });

      stepsContainer.appendChild(cell);
    }
    
    row.appendChild(stepsContainer);
    container.appendChild(row);
  });
}

function previewInstrument(instr) {
  initAudio();
  if (!STATE.audioCtx) return;
  const now = STATE.audioCtx.currentTime;

  if (instr.type === "drum") {
    const vol = STATE.volumes[instr.id];
    if (instr.id === "kick") playSynthKick(now, vol);
    else if (instr.id === "snare") playSynthSnare(now, vol);
    else if (instr.id === "hihat") playSynthHihat(now, vol);
    else if (instr.id === "clap") playSynthClap(now, vol);
  } else if (instr.type === "synth") {
    playSynthNote(instr.freq, now, STATE.volumes.synth);
  }
}

function initPianoKeyboard() {
  const container = document.getElementById("piano-keyboard-container");
  container.innerHTML = "";

  PIANO_KEYS.forEach(key => {
    const div = document.createElement("div");
    div.className = `piano-key ${key.type === 'black' ? 'black-key' : 'white-key'}`;
    div.id = `pkey-${key.note}`;
    div.innerHTML = `<span class="piano-key-label">${key.note}<br>(${key.key})</span>`;

    // Pointer listeners for touch support
    div.addEventListener("pointerdown", (e) => {
      div.classList.add("active-press");
      triggerManualSynthStart(key.freq, key.note);
      e.preventDefault();
    });

    const releaseKey = () => {
      div.classList.remove("active-press");
      triggerManualSynthStop(key.note);
    };

    div.addEventListener("pointerup", releaseKey);
    div.addEventListener("pointerleave", releaseKey);

    container.appendChild(div);
  });

  // Physical computer keys keybindings mappings
  const keyMap = {};
  PIANO_KEYS.forEach(k => {
    keyMap[k.key.toLowerCase()] = k;
  });

  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    const char = e.key.toLowerCase();
    if (keyMap[char]) {
      const matchKey = keyMap[char];
      const el = document.getElementById(`pkey-${matchKey.note}`);
      if (el) el.classList.add("active-press");
      triggerManualSynthStart(matchKey.freq, matchKey.note);
    }
  });

  window.addEventListener("keyup", (e) => {
    const char = e.key.toLowerCase();
    if (keyMap[char]) {
      const matchKey = keyMap[char];
      const el = document.getElementById(`pkey-${matchKey.note}`);
      if (el) el.classList.remove("active-press");
      triggerManualSynthStop(matchKey.note);
    }
  });
}

function highlightPlayhead(activeStep) {
  clearPlayheadHighlight();

  // Highlight active column numbers header
  const header = document.getElementById(`step-header-${activeStep}`);
  if (header) header.classList.add("active");

  // Highlight step cells
  for (let r = 0; r < 8; r++) {
    const cell = document.getElementById(`cell-${r}-${activeStep}`);
    if (cell) cell.classList.add("playing-column");
  }
}

function clearPlayheadHighlight() {
  document.querySelectorAll(".step-header-num").forEach(h => h.classList.remove("active"));
  document.querySelectorAll(".grid-cell").forEach(c => c.classList.remove("playing-column"));
}

// --- UI BINDINGS ---
function initUI() {
  // Playback Control
  document.getElementById("btn-play-sequencer").addEventListener("click", startSequencer);
  document.getElementById("btn-stop-sequencer").addEventListener("click", stopSequencer);
  
  document.getElementById("btn-clear-grid").addEventListener("click", () => {
    STATE.grid = Array(8).fill(null).map(() => Array(16).fill(false));
    initSequencerGrid();
  });

  // BPM speed selector
  const bpmSlider = document.getElementById("tempo-slider");
  bpmSlider.addEventListener("input", (e) => {
    const bpm = parseInt(e.target.value);
    document.getElementById("val-tempo").textContent = bpm;
    STATE.bpm = bpm;
  });

  // Master Synth Configs
  document.getElementById("synth-waveform").addEventListener("change", (e) => {
    STATE.synth.waveform = e.target.value;
  });

  // ADSR Sliders
  const adsr = ["attack", "decay", "sustain", "release"];
  adsr.forEach(param => {
    const el = document.getElementById(`adsr-${param}`);
    el.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      document.getElementById(`val-${param}`).textContent = val;
      STATE.synth[param] = val;
    });
  });

  // Master Filter Slider cutoff and Q
  document.getElementById("filter-cutoff").addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    document.getElementById("val-cutoff").textContent = val;
    STATE.synth.cutoff = val;
    if (STATE.masterFilter) {
      STATE.masterFilter.frequency.setValueAtTime(val, STATE.audioCtx.currentTime);
    }
  });

  document.getElementById("filter-q").addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById("val-q").textContent = val;
    STATE.synth.q = val;
    if (STATE.masterFilter) {
      STATE.masterFilter.Q.setValueAtTime(val, STATE.audioCtx.currentTime);
    }
  });

  // Volume sliders
  const channels = ["kick", "snare", "hihat", "clap"];
  channels.forEach(ch => {
    document.getElementById(`vol-${ch}`).addEventListener("input", (e) => {
      const vol = parseInt(e.target.value);
      document.getElementById(`val-${ch}`).textContent = vol;
      STATE.volumes[ch] = vol / 100.0;
    });
  });

  // Preset configuration loaders
  document.querySelectorAll(".preset-selector-wrapper .btn-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      loadPreset(btn.dataset.preset);
    });
  });

  // Visual mode switcher
  document.getElementById("visualizer-mode").addEventListener("change", (e) => {
    STATE.visualMode = e.target.value;
  });

  // Patterns File Exporters
  document.getElementById("btn-export-pattern").addEventListener("click", exportPatternJson);
  document.getElementById("import-pattern").addEventListener("change", importPatternJson);

  // Theme switcher toggle
  document.getElementById("theme-toggle").addEventListener("click", () => {
    STATE.theme = STATE.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", STATE.theme);
    syncThemeUI();
  });
}

function syncThemeUI() {
  const sun = document.querySelector(".sun-icon");
  const moon = document.querySelector(".moon-icon");
  if (STATE.theme === "dark") {
    sun.classList.remove("hidden");
    moon.classList.add("hidden");
  } else {
    sun.classList.add("hidden");
    moon.classList.remove("hidden");
  }
}

function loadPreset(presetKey) {
  if (!PRESETS[presetKey]) return;
  
  // Clone preset array grid values
  STATE.grid = PRESETS[presetKey].map(row => [...row]);
  
  // Rebuild Grid HTML elements to sync active statuses
  initSequencerGrid();
}

// --- REAL-TIME CANVAS VISUALIZER ---
function setupVisualizer() {
  const canvas = document.getElementById("audio-visualizer");
  const ctx = canvas.getContext("2d");
  
  function draw() {
    requestAnimationFrame(draw);
    
    // Clear canvas background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    ctx.fillStyle = isDark ? "rgba(10, 9, 16, 0.9)" : "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!STATE.analyser) {
      // Draw a simple static visual flat line if audio is inactive
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    const bufferLength = STATE.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    if (STATE.visualMode === "wave") {
      // Time-domain Oscilloscope display drawing
      STATE.analyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 2.5;
      // Draw neon gradients
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#a855f7");
      gradient.addColorStop(0.5, "#06b6d4");
      gradient.addColorStop(1, "#f43f5e");
      
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (canvas.height / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    } 
    else {
      // Frequency Analyzer bar charts display
      STATE.analyser.getByteFrequencyData(dataArray);
      
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsla(${hue}, 85%, 60%, 0.85)`;
        
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    }
  }

  draw();
}

// --- FILE SAVE / IMPORT CONFIG CONTROLLERS ---
function exportPatternJson() {
  const content = JSON.stringify({
    bpm: STATE.bpm,
    synth: STATE.synth,
    grid: STATE.grid
  }, null, 2);

  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `dsp_synth_beat_pattern_${Date.now()}.json`;
  link.click();
}

function importPatternJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      
      if (data.grid && Array.isArray(data.grid)) {
        STATE.grid = data.grid;
        if (data.bpm) {
          STATE.bpm = data.bpm;
          document.getElementById("tempo-slider").value = data.bpm;
          document.getElementById("val-tempo").textContent = data.bpm;
        }
        if (data.synth) {
          STATE.synth = { ...STATE.synth, ...data.synth };
          // Sync synth selectors and values UI
          document.getElementById("synth-waveform").value = STATE.synth.waveform;
          document.getElementById("filter-cutoff").value = STATE.synth.cutoff;
          document.getElementById("val-cutoff").textContent = STATE.synth.cutoff;
          document.getElementById("filter-q").value = STATE.synth.q;
          document.getElementById("val-q").textContent = STATE.synth.q;
          
          ["attack", "decay", "sustain", "release"].forEach(p => {
            document.getElementById(`adsr-${p}`).value = STATE.synth[p];
            document.getElementById(`val-${p}`).textContent = STATE.synth[p];
          });
        }

        initSequencerGrid();
        alert("Pattern configuration loaded successfully!");
      }
    } catch (err) {
      alert("Error loading pattern file. Corrupt formatting.");
    }
  };
  reader.readAsText(file);
  e.target.value = ""; // Clear input selector
}
