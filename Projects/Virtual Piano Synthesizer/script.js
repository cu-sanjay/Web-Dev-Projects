// Map musical notes to their strict acoustic frequencies (Hz)
const NOTE_FREQUENCIES = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25
};

// Audio Pipeline References
let audioCtx = null;
let analyserNode = null;
const activeNodes = {};
const sustainedNodes = {};

// DOM Element Selectors
const waveTypeSelect = document.getElementById('waveType');
const sustainToggle = document.getElementById('sustainToggle');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

/**
 * Initializes the audio infrastructure and sets up the visualizer loop
 */
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create and configure the analyzer node
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.connect(audioCtx.destination);
    
    // Fire up the continuous canvas painting loop
    drawVisualizer();
  }
}

/**
 * Generates an audio oscillator instance for a given note
 */
function startNote(note) {
  initAudio();
  
  // If note is currently sustaining or ringing, clear it down first
  if (sustainedNodes[note]) {
    clearSustainedNote(note);
  }
  if (activeNodes[note]) {
    stopNoteReference(note);
  }

  const frequency = NOTE_FREQUENCIES[note];
  if (!frequency) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // Pull active instrument timbre setting dynamically
  oscillator.type = waveTypeSelect.value;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  // Smooth attack phase setup
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);

  // Route: Synth -> Analyzer Node -> Speakers
  oscillator.connect(gainNode);
  gainNode.connect(analyserNode);
  oscillator.start();

  activeNodes[note] = { oscillator, gainNode };
  
  const keyElement = document.querySelector(`[data-note="${note}"]`);
  if (keyElement) keyElement.classList.add('active');
}

/**
 * Handles action when a key release gesture is fired
 */
function stopNote(note) {
  if (!activeNodes[note]) return;

  if (sustainToggle.checked) {
    // Transfer ownership of active nodes to the sustain bucket
    sustainedNodes[note] = activeNodes[note];
    delete activeNodes[note];
  } else {
    stopNoteReference(note);
  }
}

/**
 * Helper logic to securely release nodes out of system audio memory
 */
function stopNoteReference(note, fromNodeSet = activeNodes) {
  const nodeSet = fromNodeSet[note];
  if (!nodeSet) return;

  const { oscillator, gainNode } = nodeSet;
  
  try {
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    oscillator.stop(audioCtx.currentTime + 0.32);
  } catch (e) {
    // Fail-safe protection hook
  }

  delete fromNodeSet[note];

  const keyElement = document.querySelector(`[data-note="${note}"]`);
  if (keyElement) keyElement.classList.remove('active');
}

function clearSustainedNote(note) {
  stopNoteReference(note, sustainedNodes);
}

/**
 * Releases all notes currently trapped inside the sustain loop
 */
function releaseAllSustainedNotes() {
  Object.keys(sustainedNodes).forEach((note) => {
    stopNoteReference(note, sustainedNodes);
  });
}

/**
 * Canvas Rendering Loop: Loops and samples real-time audio amplitudes
 */
function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteTimeDomainData(dataArray);

  // Canvas Canvas Clear & Background Redraw
  canvasCtx.fillStyle = '#111116';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  // Configure Neon wave line paths
  canvasCtx.lineWidth = 3;
  canvasCtx.strokeStyle = '#4f46e5'; // Premium clean Indigo shade
  canvasCtx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
}

// --- Interaction Event Listeners ---

// Mouse down and dragging bindings
document.getElementById('keyboard').addEventListener('mousedown', (e) => {
  const targetKey = e.target.closest('.key');
  if (!targetKey) return;
  
  const note = targetKey.getAttribute('data-note');
  startNote(note);

  const handleMouseUp = () => {
    stopNote(note);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  document.addEventListener('mouseup', handleMouseUp);
});

// QWERTY Computer Keyboard mapping events hooks
const pressedKeys = {};

document.addEventListener('keydown', (e) => {
  // Use Spacebar to toggle or hold sustain configurations easily
  if (e.code === 'Space') {
    e.preventDefault();
    sustainToggle.checked = true;
    return;
  }

  if (e.repeat) return;
  const keyChar = e.key.toUpperCase();
  const targetKey = document.querySelector(`[data-key="${keyChar}"]`);
  
  if (targetKey) {
    const note = targetKey.getAttribute('data-note');
    pressedKeys[keyChar] = note;
    startNote(note);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    sustainToggle.checked = false;
    releaseAllSustainedNotes();
    return;
  }

  const keyChar = e.key.toUpperCase();
  const note = pressedKeys[keyChar];
  
  if (note) {
    stopNote(note);
    delete pressedKeys[keyChar];
  }
});