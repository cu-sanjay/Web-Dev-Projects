const bgColor = document.getElementById('bg-color');
const bgHex = document.getElementById('bg-hex');
const textColor = document.getElementById('text-color');
const textHex = document.getElementById('text-hex');
const swapBtn = document.getElementById('swap-btn');
const previewBox = document.getElementById('preview-box');
const previewHeading = document.getElementById('preview-heading');
const previewBody = document.getElementById('preview-body');
const badge = document.getElementById('badge');
const ratioDisplay = document.getElementById('ratio-display');
const aaNormal = document.getElementById('aa-normal');
const aaLarge = document.getElementById('aa-large');
const aaaNormal = document.getElementById('aaa-normal');
const aaaLarge = document.getElementById('aaa-large');

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return { r, g, b };
}

function srgbChannel(c) {
  const s = c / 255;
  if (s <= 0.04045) {
    return s / 12.92;
  }
  return Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * srgbChannel(r) +
    0.7152 * srgbChannel(g) +
    0.0722 * srgbChannel(b)
  );
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function formatRatio(ratio) {
  return ratio.toFixed(2) + ':1';
}

function update() {
  const bg = bgColor.value;
  const fg = textColor.value;

  bgHex.value = bg;
  textHex.value = fg;

  previewBox.style.background = bg;
  previewBox.style.color = fg;

  const ratio = contrastRatio(bg, fg);
  ratioDisplay.textContent = formatRatio(ratio);

  if (ratio >= 4.5) {
    badge.textContent = 'PASS';
    badge.className = 'badge pass';
  } else {
    badge.textContent = 'FAIL';
    badge.className = 'badge fail';
  }

  updateDetail(aaNormal, ratio >= 4.5);
  updateDetail(aaLarge, ratio >= 3.0);
  updateDetail(aaaNormal, ratio >= 7.0);
  updateDetail(aaaLarge, ratio >= 3.0);
}

function updateDetail(el, passes) {
  el.textContent = passes ? 'PASS' : 'FAIL';
  el.className = 'detail-status ' + (passes ? 'pass' : 'fail');
}

function syncColorFromHex(input, colorPicker) {
  const val = input.value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    colorPicker.value = val;
    update();
  }
}

bgColor.addEventListener('input', update);
textColor.addEventListener('input', update);

bgHex.addEventListener('input', function () {
  syncColorFromHex(bgHex, bgColor);
});

textHex.addEventListener('input', function () {
  syncColorFromHex(textHex, textColor);
});

swapBtn.addEventListener('click', function () {
  const tmp = bgColor.value;
  bgColor.value = textColor.value;
  textColor.value = tmp;
  update();
});

update();
