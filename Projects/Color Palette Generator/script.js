/* ─────────────────────────────────────────────────────────────
   Color Palette Generator — script.js
   Generates harmonious color palettes using color theory.
───────────────────────────────────────────────────────────── */

'use strict';

// ─── Color math helpers ──────────────────────────────────────

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

// Perceived luminance to decide text color (white or dark)
function getLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function textOnBg(hex) {
  return getLuminance(hex) > 0.35 ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)';
}

// Approx color name from hue
function colorName(hex) {
  const [h, s, l] = hexToHsl(hex);
  if (s < 8) return l > 70 ? 'White' : l < 30 ? 'Black' : 'Gray';
  if (l < 18) return 'Very Dark';
  if (l > 88) return 'Very Light';
  const hues = [
    [15,  'Red'],        [30,  'Red-Orange'],
    [45,  'Orange'],     [60,  'Yellow-Orange'],
    [75,  'Yellow'],     [105, 'Yellow-Green'],
    [150, 'Green'],      [180, 'Teal'],
    [210, 'Cyan'],       [240, 'Sky Blue'],
    [255, 'Blue'],       [270, 'Blue-Violet'],
    [285, 'Violet'],     [300, 'Purple'],
    [315, 'Magenta'],    [330, 'Pink'],
    [345, 'Rose'],       [360, 'Red'],
  ];
  for (const [max, name] of hues) if (h < max) return name;
  return 'Red';
}

// ─── Palette generators ──────────────────────────────────────

function rand(min, max) { return min + Math.random() * (max - min); }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

function generateScheme(scheme, count) {
  const baseH = rand(0, 360);
  const baseS = rand(55, 85);
  const baseL = rand(38, 58);

  const angles = {
    analogous:           () => Array.from({ length: count }, (_, i) => (baseH + (i - Math.floor(count / 2)) * 30) % 360),
    complementary:       () => [baseH, (baseH + 180) % 360, ...Array.from({ length: count - 2 }, (_, i) => (baseH + 15 + i * 30) % 360)],
    triadic:             () => [baseH, (baseH + 120) % 360, (baseH + 240) % 360, ...Array.from({ length: count - 3 }, (_, i) => (baseH + 10 + i * 20) % 360)],
    'split-complementary': () => [baseH, (baseH + 150) % 360, (baseH + 210) % 360, ...Array.from({ length: count - 3 }, (_, i) => (baseH + 5 + i * 15) % 360)],
    tetradic:            () => [baseH, (baseH + 90) % 360, (baseH + 180) % 360, (baseH + 270) % 360, ...Array.from({ length: count - 4 }, (_, i) => (baseH + 20 + i * 30) % 360)],
    monochromatic:       () => Array.from({ length: count }, (_, i) => baseH),
    random:              () => Array.from({ length: count }, () => rand(0, 360)),
  };

  const hues = (angles[scheme] || angles.random)().slice(0, count);

  return hues.map((h, i) => {
    const isMono = scheme === 'monochromatic';
    const s = isMono ? baseS + rand(-5, 5) : baseS + rand(-12, 12);
    const l = isMono
      ? 20 + (i / (count - 1 || 1)) * 60
      : baseL + rand(-15, 15);
    return hslToHex(h, s, l);
  });
}

// ─── App state ───────────────────────────────────────────────

const state = {
  colors: [],
  locked: [],
  scheme: 'analogous',
  count: 5,
};

// ─── DOM refs ────────────────────────────────────────────────

const paletteEl    = document.getElementById('palette');
const generateBtn  = document.getElementById('generate-btn');
const schemeSelect = document.getElementById('scheme-select');
const countSelect  = document.getElementById('count-select');
const exportBtn    = document.getElementById('export-btn');
const exportModal  = document.getElementById('export-modal');
const modalClose   = document.getElementById('modal-close');
const exportCode   = document.getElementById('export-code');
const copyExportBtn = document.getElementById('copy-export-btn');
const toastEl      = document.getElementById('toast');
let toastTimer;

// ─── Toast ───────────────────────────────────────────────────

function toast(msg) {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
}

// ─── Copy to clipboard ───────────────────────────────────────

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
}

// ─── Render palette ──────────────────────────────────────────

function render() {
  // Adjust locked array length
  while (state.locked.length < state.count) state.locked.push(false);
  state.locked.length = state.count;

  paletteEl.innerHTML = '';

  state.colors.forEach((hex, idx) => {
    const fg = textOnBg(hex);
    const name = colorName(hex);
    const locked = state.locked[idx];

    const swatch = document.createElement('div');
    swatch.className = 'swatch' + (locked ? ' is-locked' : '');
    swatch.style.background = hex;
    swatch.setAttribute('aria-label', `Color ${idx + 1}: ${hex}`);

    // Lock icon (always present, visible when locked)
    swatch.innerHTML = `
      <svg class="lock-icon" viewBox="0 0 24 24" fill="none"
           stroke="${fg}" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
        ${locked
          ? '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
          : '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'}
      </svg>

      <div class="swatch-info">
        <button class="swatch-hex"
                style="background:${fg === 'rgba(255,255,255,0.85)' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}; color:${fg};"
                data-copy="${hex}"
                aria-label="Copy ${hex}">
          ${hex.toUpperCase()}
        </button>
        <span class="swatch-name" style="color:${fg};">${name}</span>
      </div>

      <div class="swatch-actions">
        <button class="swatch-btn"
                style="background:${fg === 'rgba(255,255,255,0.85)' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};"
                data-action="lock"
                data-idx="${idx}"
                title="${locked ? 'Unlock' : 'Lock'} color"
                aria-label="${locked ? 'Unlock' : 'Lock'} color ${hex}">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
               stroke="${fg}" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
            ${locked
              ? '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
              : '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'}
          </svg>
        </button>
        <button class="swatch-btn"
                style="background:${fg === 'rgba(255,255,255,0.85)' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};"
                data-action="copy"
                data-hex="${hex}"
                title="Copy hex"
                aria-label="Copy ${hex}">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
               stroke="${fg}" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
    `;

    paletteEl.appendChild(swatch);
  });
}

// ─── Generate ────────────────────────────────────────────────

function generate() {
  const newColors = generateScheme(state.scheme, state.count);
  // Keep locked colors in place
  state.colors = newColors.map((c, i) =>
    state.locked[i] ? state.colors[i] : c
  );
  render();
}

// ─── Export helpers ──────────────────────────────────────────

const exportFormats = {
  hex:  colors => colors.map(c => c.toUpperCase()).join('\n'),
  css:  colors => `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`,
  json: colors => JSON.stringify({ palette: colors }, null, 2),
};

let currentTab = 'hex';

function refreshExport() {
  exportCode.textContent = exportFormats[currentTab](state.colors);
}

// ─── Event listeners ─────────────────────────────────────────

// Generate button
generateBtn.addEventListener('click', generate);

// Spacebar shortcut
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    generate();
  }
});

// Controls
schemeSelect.addEventListener('change', e => { state.scheme = e.target.value; generate(); });
countSelect.addEventListener('change', e => { state.count = +e.target.value; generate(); });

// Palette interactions (event delegation)
paletteEl.addEventListener('click', async e => {
  const lockBtn = e.target.closest('[data-action="lock"]');
  const copyBtn = e.target.closest('[data-action="copy"]');
  const hexBtn  = e.target.closest('[data-copy]');

  if (lockBtn) {
    const idx = +lockBtn.dataset.idx;
    state.locked[idx] = !state.locked[idx];
    render();
    return;
  }

  if (copyBtn) {
    const ok = await copyText(copyBtn.dataset.hex);
    if (ok) toast(`Copied ${copyBtn.dataset.hex.toUpperCase()}`);
    return;
  }

  if (hexBtn) {
    const ok = await copyText(hexBtn.dataset.copy);
    if (ok) toast(`Copied ${hexBtn.dataset.copy.toUpperCase()}`);
    return;
  }
});

// Export modal
exportBtn.addEventListener('click', () => {
  currentTab = 'hex';
  document.querySelectorAll('.export-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'hex'));
  refreshExport();
  exportModal.showModal();
});

modalClose.addEventListener('click', () => exportModal.close());
exportModal.addEventListener('click', e => { if (e.target === exportModal) exportModal.close(); });

document.querySelectorAll('.export-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentTab = tab.dataset.tab;
    document.querySelectorAll('.export-tab').forEach(t => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', t === tab);
    });
    refreshExport();
  });
});

copyExportBtn.addEventListener('click', async () => {
  const ok = await copyText(exportCode.textContent);
  if (ok) toast('Copied!');
});

// ─── Init ────────────────────────────────────────────────────

generate();
