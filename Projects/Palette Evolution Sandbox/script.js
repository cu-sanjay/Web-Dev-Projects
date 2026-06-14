// ============================================================
//  PALETTE EVOLUTION SANDBOX — Core Engine
//  Genetic cross-over interpolation + lineage routing
// ============================================================

// ─── COLOR UTILITIES ───────────────────────────────────────

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r, g, b) {
  const clip = (x) => Math.max(0, Math.min(255, Math.round(x)));
  return '#' + [clip(r), clip(g), clip(b)].map(c => c.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const mx = Math.max(rn, gn, bn), mn = Math.min(rn, gn, bn);
  let h = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (mx === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
  }
  return [h, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; }
  else if (h < 120) { r1 = x; g1 = c; }
  else if (h < 180) { g1 = c; b1 = x; }
  else if (h < 240) { g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; b1 = c; }
  else { r1 = c; b1 = x; }
  return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
}

// ─── STATE ──────────────────────────────────────────────────

const state = {
  parentA: { hex: '#3B82F6', rgb: [59, 130, 246] },
  parentB: { hex: '#A855F7', rgb: [168, 85, 247] },
  children: [],
  generation: 0,
  iterations: 0,
  mutationRate: 5,
};

// ─── DOM REFS ───────────────────────────────────────────────

const parentAEl = document.getElementById('parent-a');
const parentBEl = document.getElementById('parent-b');
const hexA = document.getElementById('hex-a');
const hexB = document.getElementById('hex-b');
const pickerA = document.getElementById('picker-a');
const pickerB = document.getElementById('picker-b');
const childStrip = document.getElementById('child-strip');
const telemGen = document.getElementById('telem-gen');
const telemHueDist = document.getElementById('telem-hue-dist');
const telemIter = document.getElementById('telem-iter');
const mutateSlider = document.getElementById('mutate-slider');
const mutateDisplay = document.getElementById('mutate-display');
const diagStatus = document.getElementById('diag-status');
const genBadge = document.getElementById('gen-badge');
const btnEvolve = document.getElementById('btn-evolve');
const btnMutate = document.getElementById('btn-mutate');

// ─── SET DIAGNOSTIC ────────────────────────────────────────

function setDiagnostic(msg, cls) {
  diagStatus.textContent = msg;
  diagStatus.className = 'diag-status ' + cls;
}

// ─── UPDATE PARENT DISPLAY ─────────────────────────────────

function updateParentDisplays() {
  parentAEl.style.backgroundColor = state.parentA.hex;
  parentBEl.style.backgroundColor = state.parentB.hex;
  hexA.value = state.parentA.hex.toUpperCase();
  hexB.value = state.parentB.hex.toUpperCase();
  pickerA.value = state.parentA.hex.toLowerCase();
  pickerB.value = state.parentB.hex.toLowerCase();
}

// ─── HUE DISTANCE CALC ─────────────────────────────────────

function calcHueDistance() {
  const [h1] = rgbToHsl(...state.parentA.rgb);
  const [h2] = rgbToHsl(...state.parentB.rgb);
  let diff = Math.abs(h1 - h2);
  if (diff > 180) diff = 360 - diff;
  return Math.round(diff);
}

// ─── UPDATE TELEMETRY ──────────────────────────────────────

function updateTelemetry() {
  telemGen.textContent = 'GEN: ' + String(state.generation).padStart(2, '0');
  telemHueDist.textContent = calcHueDistance() + '°';
  telemIter.textContent = state.iterations;
  genBadge.textContent = 'GEN ' + state.generation;
}

// ─── INTERPOLATION ENGINE ──────────────────────────────────

function interpolateColor(c1, c2, t, mutation) {
  // Interpolate in RGB space
  const r = c1[0] + (c2[0] - c1[0]) * t;
  const g = c1[1] + (c2[1] - c1[1]) * t;
  const b = c1[2] + (c2[2] - c1[2]) * t;

  // Apply mutation: displace each channel by a random offset
  const maxShift = mutation * 2.55; // mutation% of 255
  const mr = (Math.random() - 0.5) * maxShift;
  const mg = (Math.random() - 0.5) * maxShift;
  const mb = (Math.random() - 0.5) * maxShift;

  return [r + mr, g + mg, b + mb];
}

function generateChildren() {
  const pA = state.parentA.rgb;
  const pB = state.parentB.rgb;
  const rate = state.mutationRate;
  const count = 6;

  // Evenly spaced t values from 0.14 to 0.86
  const children = [];
  for (let i = 0; i < count; i++) {
    const t = 0.14 + (i / (count - 1)) * 0.72;
    const rgb = interpolateColor(pA, pB, t, rate);
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    children.push({ hex: hex.toUpperCase(), rgb, index: i });
  }

  state.children = children;
  renderChildren();
}

// ─── RENDER CHILDREN ───────────────────────────────────────

function renderChildren() {
  childStrip.innerHTML = '';
  for (const child of state.children) {
    const el = document.createElement('div');
    el.className = 'child-swatch-card';
    el.style.backgroundColor = child.hex;
    el.innerHTML = `
      <span class="child-hex">${child.hex.toLowerCase()}</span>
      <div class="child-actions">
        <button class="child-action-btn set-a" data-action="set-a" data-hex="${child.hex}">SET A</button>
        <button class="child-action-btn set-b" data-action="set-b" data-hex="${child.hex}">SET B</button>
      </div>
    `;

    el.querySelector('.set-a').addEventListener('click', (e) => {
      e.stopPropagation();
      setParent('A', child.hex);
    });
    el.querySelector('.set-b').addEventListener('click', (e) => {
      e.stopPropagation();
      setParent('B', child.hex);
    });

    childStrip.appendChild(el);
  }
}

// ─── SET PARENT FROM CHILD ─────────────────────────────────

function setParent(which, hex) {
  const rgb = hexToRgb(hex);
  if (which === 'A') {
    state.parentA = { hex: hex.toUpperCase(), rgb };
  } else {
    state.parentB = { hex: hex.toUpperCase(), rgb };
  }
  state.generation++;
  updateParentDisplays();
  updateTelemetry();
  generateChildren();
  setDiagnostic('NEW PARENT PAIR ANCHORED', 'anchored');
}

// ─── EVOLVE ─────────────────────────────────────────────────

function evolve() {
  state.generation++;
  state.iterations++;
  setDiagnostic('GENERATING OFFSPRING SHADES...', 'generating');
  generateChildren();
  updateTelemetry();
  setTimeout(() => {
    setDiagnostic('AWAITING INTERPOLATION VECTOR', 'idle');
  }, 800);
}

// ─── MUTATE RANDOM PARENTAL SEEDS ──────────────────────────

function randomHex() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return { hex: rgbToHex(r, g, b).toUpperCase(), rgb: [r, g, b] };
}

function mutateParents() {
  state.parentA = randomHex();
  state.parentB = randomHex();
  updateParentDisplays();
  updateTelemetry();
  generateChildren();
  setDiagnostic('PARENTAL SEEDS MUTATED', 'anchored');
}

// ─── EVENT BINDING ─────────────────────────────────────────

// Hex inputs
hexA.addEventListener('input', () => {
  const hex = hexA.value.trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(hex) || /^#?[0-9a-fA-F]{3}$/.test(hex)) {
    const fullHex = hex.startsWith('#') ? hex : '#' + hex;
    state.parentA = { hex: fullHex.toUpperCase(), rgb: hexToRgb(fullHex) };
    updateParentDisplays();
    updateTelemetry();
    generateChildren();
  }
});

hexB.addEventListener('input', () => {
  const hex = hexB.value.trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(hex) || /^#?[0-9a-fA-F]{3}$/.test(hex)) {
    const fullHex = hex.startsWith('#') ? hex : '#' + hex;
    state.parentB = { hex: fullHex.toUpperCase(), rgb: hexToRgb(fullHex) };
    updateParentDisplays();
    updateTelemetry();
    generateChildren();
  }
});

// Color pickers
pickerA.addEventListener('input', () => {
  const hex = pickerA.value;
  state.parentA = { hex: hex.toUpperCase(), rgb: hexToRgb(hex) };
  updateParentDisplays();
  updateTelemetry();
  generateChildren();
});

pickerB.addEventListener('input', () => {
  const hex = pickerB.value;
  state.parentB = { hex: hex.toUpperCase(), rgb: hexToRgb(hex) };
  updateParentDisplays();
  updateTelemetry();
  generateChildren();
});

// Mutation slider
mutateSlider.addEventListener('input', () => {
  state.mutationRate = parseFloat(mutateSlider.value);
  mutateDisplay.textContent = state.mutationRate + '%';
});

// Action buttons
btnEvolve.addEventListener('click', evolve);
btnMutate.addEventListener('click', mutateParents);

// ─── INIT ───────────────────────────────────────────────────

function init() {
  updateParentDisplays();
  updateTelemetry();
  generateChildren();
  setDiagnostic('AWAITING INTERPOLATION VECTOR', 'idle');
}

init();
