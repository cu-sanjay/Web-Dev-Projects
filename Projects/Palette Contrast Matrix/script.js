const state = {
  colors: ['#1e293b', '#3b82f6', '#f8fafc', '#ef4444'],
  passedCount: 0,
  status: 'AWAITING MATRIX INTERSECTION',
  selectedIndex: null
};

const COLOR_LABELS = ['FG 01', 'FG 02', 'FG 03', 'FG 04'];

function hexToLinearRGB(hex) {
  const raw = hex.replace('#', '');
  const r = parseInt(raw.substring(0, 2), 16) / 255;
  const g = parseInt(raw.substring(2, 4), 16) / 255;
  const b = parseInt(raw.substring(4, 6), 16) / 255;
  const toLinear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return { r: toLinear(r), g: toLinear(g), b: toLinear(b) };
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToLinearRGB(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hexA, hexB) {
  const L1 = relativeLuminance(hexA);
  const L2 = relativeLuminance(hexB);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWCAGGrade(ratio) {
  if (ratio >= 7) return { grade: 'AAA', label: 'AAA', pass: true };
  if (ratio >= 4.5) return { grade: 'AA', label: 'AA', pass: true };
  if (ratio >= 3) return { grade: 'AA Lg', label: 'AA-L', pass: true };
  return { grade: 'FAIL', label: 'FAIL', pass: false };
}

function getBadgeClass(pass, grade) {
  if (!pass) return 'badge-fail';
  if (grade === 'AAA') return 'badge-aaa';
  if (grade === 'AA' || grade === 'AA Lg') return 'badge-aa';
  return 'badge-pass';
}

function getStatusFor(passCount) {
  if (passCount === 0) return 'AWAITING MATRIX INTERSECTION';
  if (passCount <= 4) return 'CRITICAL CONTRAST GAPS DETECTED';
  if (passCount <= 8) return 'PARTIAL COMPLIANCE — REVIEW NEEDED';
  if (passCount <= 12) return 'ACCELERATING CHROMATIC CHANNELS...';
  if (passCount < 16) return 'HIGH COMPLIANCE RATE';
  return 'ALL PAIRS PASS AA THRESHOLD';
}

function generateRandomHex() {
  const chars = '0123456789abcdef';
  let hex = '#';
  for (let i = 0; i < 6; i++) hex += chars[Math.floor(Math.random() * 16)];
  return hex;
}

function renderMatrix() {
  const grid = document.getElementById('matrix-grid');
  const anchor = grid.querySelector('.matrix-anchor');
  grid.innerHTML = '';
  grid.appendChild(anchor);

  let passCount = 0;

  for (let col = 0; col < 4; col++) {
    const header = document.createElement('div');
    header.className = 'matrix-header-bg';
    header.style.background = state.colors[col];
    header.style.color = contrastRatio(state.colors[col], '#f8fafc') >= 4.5 ? '#f8fafc' : '#070a13';
    header.innerHTML = `
      <span class="swatch-label">BG 0${col + 1}</span>
      <span class="swatch-hex">${state.colors[col].toUpperCase()}</span>
    `;
    grid.appendChild(header);
  }

  for (let row = 0; row < 4; row++) {
    const label = document.createElement('div');
    label.className = 'matrix-row-label';
    label.style.background = state.colors[row];
    label.style.color = contrastRatio(state.colors[row], '#f8fafc') >= 4.5 ? '#f8fafc' : '#070a13';
    label.innerHTML = `
      <span class="swatch-label">${COLOR_LABELS[row]}</span>
      <span class="swatch-hex">${state.colors[row].toUpperCase()}</span>
    `;
    grid.appendChild(label);

    for (let col = 0; col < 4; col++) {
      const bg = state.colors[col];
      const fg = state.colors[row];
      const ratio = contrastRatio(fg, bg);
      const rounded = Math.round(ratio * 100) / 100;
      const { grade, label: gradeLabel, pass } = getWCAGGrade(ratio);
      const cell = document.createElement('div');
      cell.className = 'matrix-cell-card';
      cell.style.background = bg;
      cell.style.color = fg;

      const previewText = 'Aa';
      const textColor = contrastRatio(fg, bg) >= 3 ? fg : (contrastRatio(bg, '#f8fafc') >= 4.5 ? '#f8fafc' : '#070a13');
      cell.style.color = textColor;

      cell.innerHTML = `
        <span class="cell-preview" style="color:${fg}">${previewText}</span>
        <span class="cell-ratio" style="color:${fg}">${rounded.toFixed(2)}</span>
        <span class="cell-badge ${getBadgeClass(pass, grade)}" style="color:${fg}; border-color:${fg}40">${gradeLabel}</span>
      `;

      cell.style.setProperty('--cell-bg', bg);

      grid.appendChild(cell);

      if (pass) passCount++;
    }
  }

  state.passedCount = passCount;

  document.getElementById('accessible-pairs').textContent =
    `${String(passCount).padStart(2, '0')} / 16 PASSED`;

  const status = getStatusFor(passCount);
  state.status = status;
  document.getElementById('diag-text').textContent = status;
}

function syncFromPicker(index, value) {
  state.colors[index] = value.toLowerCase();
  const module = document.querySelectorAll('.seed-module')[index];
  const hexInput = module.querySelector('.seed-hex');
  const picker = module.querySelector('.seed-picker');
  picker.value = value;
  hexInput.value = value.toUpperCase();
  renderMatrix();
}

function syncFromHexInput(index, value) {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    state.colors[index] = value.toLowerCase();
    const module = document.querySelectorAll('.seed-module')[index];
    const picker = module.querySelector('.seed-picker');
    picker.value = value.toLowerCase();
    renderMatrix();
  }
}

function mutateAll() {
  state.status = 'RECALCULATING CHROMATIC CHANNELS...';
  document.getElementById('diag-text').textContent = state.status;

  for (let i = 0; i < 4; i++) {
    const hex = generateRandomHex();
    state.colors[i] = hex;
    const module = document.querySelectorAll('.seed-module')[i];
    module.querySelector('.seed-picker').value = hex;
    module.querySelector('.seed-hex').value = hex.toUpperCase();
  }

  setTimeout(() => {
    renderMatrix();
    state.status = 'DATA-TO-TABLE ARRAY STEADY';
    document.getElementById('diag-text').textContent = state.status;
  }, 120);
}

function init() {
  document.querySelectorAll('.seed-module').forEach((module) => {
    const idx = parseInt(module.dataset.index);
    const picker = module.querySelector('.seed-picker');
    const hexInput = module.querySelector('.seed-hex');

    picker.addEventListener('input', () => {
      syncFromPicker(idx, picker.value);
    });

    hexInput.addEventListener('input', () => {
      const raw = hexInput.value;
      if (/^#[0-9a-fA-F]{0,6}$/.test(raw)) {
        hexInput.value = raw.toUpperCase();
      }
    });

    hexInput.addEventListener('blur', () => {
      syncFromHexInput(idx, hexInput.value);
    });

    hexInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        syncFromHexInput(idx, hexInput.value);
      }
    });
  });

  document.getElementById('mutate-btn').addEventListener('click', mutateAll);

  renderMatrix();
  state.status = 'DATA-TO-TABLE ARRAY STEADY';
  document.getElementById('diag-text').textContent = state.status;
}

document.addEventListener('DOMContentLoaded', init);
