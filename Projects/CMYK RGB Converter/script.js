const state = {
  c: 0,
  m: 0,
  y: 0,
  k: 0,
  r: 255,
  g: 255,
  b: 255,
  hex: '#FFFFFF',
  rgb: 'rgb(255, 255, 255)',
  status: 'AWAITING TRANSFORMATION MATRIX'
};

const sliderIds = ['cyan', 'magenta', 'yellow', 'key'];
const valIds = ['val-cyan', 'val-magenta', 'val-yellow', 'val-key'];

function cmykToRgb(c, m, y, k) {
  const cf = c / 100;
  const mf = m / 100;
  const yf = y / 100;
  const kf = k / 100;

  const r = Math.round(255 * (1 - cf) * (1 - kf));
  const g = Math.round(255 * (1 - mf) * (1 - kf));
  const b = Math.round(255 * (1 - yf) * (1 - kf));

  return {
    r: Math.max(0, Math.min(255, r)),
    g: Math.max(0, Math.min(255, g)),
    b: Math.max(0, Math.min(255, b))
  };
}

function rgbToHex(r, g, b) {
  const toHex = (v) => v.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function perceivedLightness(r, g, b) {
  return (r * 0.299 + g * 0.587 + b * 0.114);
}

function getStatusFor(k) {
  if (k === 0 && state.c === 0 && state.m === 0 && state.y === 0) return 'AWAITING TRANSFORMATION MATRIX';
  if (k > 50) return 'DEEP ABSORPTION — KEY DOMINANT';
  if (state.c > 70 || state.m > 70 || state.y > 70) return 'SATURATED SUBTRACTIVE CHANNEL';
  if (k > 0) return 'COMPOSITE ABSORPTION ACTIVE';
  return 'COLOR ENVELOPE BALANCED';
}

function updateAll() {
  const c = parseInt(document.getElementById('slider-cyan').value, 10);
  const m = parseInt(document.getElementById('slider-magenta').value, 10);
  const y = parseInt(document.getElementById('slider-yellow').value, 10);
  const k = parseInt(document.getElementById('slider-key').value, 10);

  state.c = c;
  state.m = m;
  state.y = y;
  state.k = k;

  document.getElementById('val-cyan').textContent = `${c}%`;
  document.getElementById('val-magenta').textContent = `${m}%`;
  document.getElementById('val-yellow').textContent = `${y}%`;
  document.getElementById('val-key').textContent = `${k}%`;

  const { r, g, b } = cmykToRgb(c, m, y, k);
  state.r = r;
  state.g = g;
  state.b = b;

  const hex = rgbToHex(r, g, b);
  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  state.hex = hex;
  state.rgb = rgbStr;

  document.getElementById('rgb-string').textContent = rgbStr;
  document.getElementById('hex-string').textContent = hex;

  const swatch = document.getElementById('preview-swatch');
  swatch.style.backgroundColor = rgbStr;

  const sample = document.getElementById('swatch-sample');
  const lightness = perceivedLightness(r, g, b);
  sample.style.color = lightness > 140 ? '#0f172a' : '#f8fafc';
  sample.textContent = 'Aa';

  const status = getStatusFor(k);
  state.status = status;
  document.getElementById('diag-text').textContent = status;
}

function resetAll() {
  const sliders = sliderIds.map(id => document.getElementById(`slider-${id}`));
  sliders.forEach(s => s.value = 0);

  state.status = 'SYNTHESIZING ADDITIVE LIGHT VECTOR...';
  document.getElementById('diag-text').textContent = state.status;

  setTimeout(() => {
    updateAll();
    state.status = 'COLOR ENVELOPE BALANCED';
    document.getElementById('diag-text').textContent = state.status;
  }, 120);
}

function init() {
  sliderIds.forEach((id) => {
    const slider = document.getElementById(`slider-${id}`);
    slider.addEventListener('input', () => {
      state.status = 'SYNTHESIZING ADDITIVE LIGHT VECTOR...';
      document.getElementById('diag-text').textContent = state.status;
      updateAll();
      state.status = 'COLOR ENVELOPE BALANCED';
      document.getElementById('diag-text').textContent = state.status;
    });
  });

  document.getElementById('reset-btn').addEventListener('click', resetAll);

  updateAll();
  state.status = 'COLOR ENVELOPE BALANCED';
  document.getElementById('diag-text').textContent = state.status;
}

document.addEventListener('DOMContentLoaded', init);
