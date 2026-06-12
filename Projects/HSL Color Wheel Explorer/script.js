// ============================================================
//  HSL COLOR WHEEL EXPLORER — Core Engine
//  Polar coordinate trigonometry + real-time color conversion
// ============================================================

// ─── HSL TO RGB / HEX ──────────────────────────────────────

function hslToRgb(h, s, l) {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r1, g1, b1;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ];
}

function rgbToHex(r, g, b) {
  const toHex = (x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function hslToHex(h, s, l) {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function hslToCss(h, s, l) {
  return 'hsl(' + Math.round(h) + ', ' + Math.round(s) + '%, ' + Math.round(l) + '%)';
}

// ─── STATE ──────────────────────────────────────────────────

const state = {
  hue: 200,
  saturation: 85,
  lightness: 50,
  isTracking: false,
  isDragging: false,
  inBounds: true,
  lockedSwatches: [],
};

// ─── DOM REFS ───────────────────────────────────────────────

const wheelContainer = document.getElementById('wheel-container');
const wheelField = document.getElementById('wheel-field');
const reticle = document.getElementById('reticle');
const previewDot = document.getElementById('color-preview-dot');
const lightnessSlider = document.getElementById('lightness-slider');
const lightnessDisplay = document.getElementById('lightness-display');
const telemHue = document.getElementById('telem-hue');
const telemSat = document.getElementById('telem-saturation');
const telemHsl = document.getElementById('telem-hsl');
const telemHex = document.getElementById('telem-hex');
const telemRgb = document.getElementById('telem-rgb');
const telemCoords = document.getElementById('telem-coords');
const diagStatus = document.getElementById('diag-status');
const paletteStrip = document.getElementById('palette-strip');
const btnLock = document.getElementById('btn-lock');

// ─── POLAR COORDINATE ENGINE ───────────────────────────────

function getWheelCenter() {
  const rect = wheelContainer.getBoundingClientRect();
  return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2, r: rect.width / 2 };
}

function updateColorFromPoint(clientX, clientY) {
  const { cx, cy, r } = getWheelCenter();
  const dx = clientX - cx;
  const dy = clientY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  state.inBounds = dist <= r + 6;
  if (!state.inBounds) {
    diagStatus.textContent = 'OUT OF FIELD BOUNDS';
    diagStatus.className = 'diag-status warning';
    return;
  }

  diagStatus.textContent = state.isDragging ? 'SAMPLING COORDINATES' : 'IDLE — TRACKING ANCHOR';
  diagStatus.className = 'diag-status idle';

  // Angle -> Hue (atan2 gives -π to π, we want 0-360)
  let angleRad = Math.atan2(dy, dx);
  if (angleRad < 0) angleRad += Math.PI * 2;
  let hueDeg = angleRad * (180 / Math.PI);
  hueDeg = (hueDeg + 90) % 360; // rotate so 0° = top

  // Radius -> Saturation
  const normDist = Math.min(dist / r, 1);
  const saturation = Math.round(normDist * 100);

  state.hue = hueDeg;
  state.saturation = saturation;

  // Update reticle position (percentage within container)
  const px = ((clientX - cx) / (r * 2) + 0.5) * 100;
  const py = ((clientY - cy) / (r * 2) + 0.5) * 100;
  document.documentElement.style.setProperty('--reticle-x', px + '%');
  document.documentElement.style.setProperty('--reticle-y', py + '%');

  updateUI();
}

function updateLightness(val) {
  state.lightness = parseFloat(val);
  lightnessDisplay.textContent = Math.round(val) + '%';
  document.documentElement.style.setProperty('--accent-h', Math.round(state.hue));
  updateUI();
}

// ─── UI UPDATE ──────────────────────────────────────────────

function updateUI() {
  const h = state.hue;
  const s = state.saturation;
  const l = state.lightness;
  const [r, g, b] = hslToRgb(h, s, l);
  const hex = rgbToHex(r, g, b);
  const css = hslToCss(h, s, l);

  // Telemetry
  telemHue.textContent = Math.round(h) + '°';
  telemSat.textContent = Math.round(s) + '%';
  telemHsl.textContent = css;
  telemHex.textContent = hex.toUpperCase();
  telemRgb.textContent = r + ', ' + g + ', ' + b;

  // Coordinates
  const { cx, cy } = getWheelCenter();
  const dx = ((parseFloat(document.documentElement.style.getPropertyValue('--reticle-x')) || 50) / 100 - 0.5) * 2;
  const dy = ((parseFloat(document.documentElement.style.getPropertyValue('--reticle-y')) || 50) / 100 - 0.5) * 2;
  const displayDx = Math.round(dx * (getWheelCenter().r));
  const displayDy = Math.round(-dy * (getWheelCenter().r));
  telemCoords.textContent = '(' + (displayDx >= 0 ? '+' : '') + displayDx + ', ' + (displayDy >= 0 ? '+' : '') + displayDy + ')px';

  // Preview dot
  previewDot.style.backgroundColor = css;

  // Accent color CSS variable
  document.documentElement.style.setProperty('--accent-h', Math.round(h));
}

// ─── EVENT BINDING ─────────────────────────────────────────

function getEventPos(e) {
  if (e.touches) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

// Mouse events
wheelField.addEventListener('mousedown', (e) => {
  state.isDragging = true;
  const pos = getEventPos(e);
  updateColorFromPoint(pos.x, pos.y);
});

document.addEventListener('mousemove', (e) => {
  if (!state.isDragging) {
    // Still track for hover reticle position
    const pos = getEventPos(e);
    const { cx, cy, r } = getWheelCenter();
    const dx = pos.x - cx;
    const dy = pos.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= r + 6) {
      const px = ((pos.x - cx) / (r * 2) + 0.5) * 100;
      const py = ((pos.y - cy) / (r * 2) + 0.5) * 100;
      document.documentElement.style.setProperty('--reticle-x', px + '%');
      document.documentElement.style.setProperty('--reticle-y', py + '%');
    }
    return;
  }
  const pos = getEventPos(e);
  updateColorFromPoint(pos.x, pos.y);
});

document.addEventListener('mouseup', () => {
  if (state.isDragging) {
    state.isDragging = false;
    diagStatus.textContent = 'IDLE — TRACKING ANCHOR';
    diagStatus.className = 'diag-status idle';
  }
});

// Touch events
wheelField.addEventListener('touchstart', (e) => {
  e.preventDefault();
  state.isDragging = true;
  const pos = getEventPos(e);
  updateColorFromPoint(pos.x, pos.y);
}, { passive: false });

wheelField.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!state.isDragging) return;
  const pos = getEventPos(e);
  updateColorFromPoint(pos.x, pos.y);
}, { passive: false });

wheelField.addEventListener('touchend', () => {
  state.isDragging = false;
  diagStatus.textContent = 'IDLE — TRACKING ANCHOR';
  diagStatus.className = 'diag-status idle';
});

// ─── LIGHTNESS SLIDER ──────────────────────────────────────

lightnessSlider.addEventListener('input', () => {
  updateLightness(lightnessSlider.value);
});

// ─── LOCK SWATCH ───────────────────────────────────────────

btnLock.addEventListener('click', () => {
  const h = state.hue;
  const s = state.saturation;
  const l = state.lightness;
  const hex = hslToHex(h, s, l);
  const css = hslToCss(h, s, l);

  // Avoid duplicates
  if (state.lockedSwatches.some(sw => sw.hex === hex)) return;

  state.lockedSwatches.push({ hex, css, h, s, l });
  renderPalette();
});

function renderPalette() {
  paletteStrip.innerHTML = '';
  for (const sw of state.lockedSwatches) {
    const el = document.createElement('div');
    el.className = 'palette-swatch';
    el.style.backgroundColor = sw.css;
    el.innerHTML = '<span class="swatch-tip">' + sw.hex + '</span>';
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(sw.hex).catch(() => {});
    });
    paletteStrip.appendChild(el);
  }
}

// ─── INIT ───────────────────────────────────────────────────

function init() {
  // Set initial position to default hue/sat on wheel
  const { cx, cy, r } = getWheelCenter();
  const angleRad = ((state.hue - 90) % 360) * (Math.PI / 180);
  const normR = (state.saturation / 100) * r;
  const px = (Math.cos(angleRad) * normR + r) / (r * 2) * 100;
  const py = (Math.sin(angleRad) * normR + r) / (r * 2) * 100;
  document.documentElement.style.setProperty('--reticle-x', px + '%');
  document.documentElement.style.setProperty('--reticle-y', py + '%');

  updateLightness(state.lightness);
  updateUI();
}

init();
