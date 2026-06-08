const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const canvasWrap = document.getElementById('canvasWrap');
const crosshair = document.getElementById('crosshair');
const chH = crosshair.querySelector('.ch-h');
const chV = crosshair.querySelector('.ch-v');
const coords = document.getElementById('coords');
const prSwatch = document.getElementById('prSwatch');
const hexInput = document.getElementById('hexInput');
const rgbInput = document.getElementById('rgbInput');
const hslInput = document.getElementById('hslInput');
const palette = document.getElementById('palette');

let img = null;
let imgLoaded = false;

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return 'hsl(' + Math.round(h * 360) + ', ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%)';
}

function parseHsl(hsl) {
  const m = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
}

function hslToString(h, s, l) {
  return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
}

function generatePalette(r, g, b) {
  const base = rgbToHsl(r, g, b);
  const [h, s, l] = parseHsl(base);
  const offsets = [-30, -15, 0, 15, 30];
  palette.innerHTML = '';
  for (const off of offsets) {
    const nl = Math.max(5, Math.min(95, l + off));
    const swatch = document.createElement('div');
    swatch.className = 'palette-swatch';
    const color = hslToString(h, s, nl);
    swatch.style.background = color;
    swatch.title = color;
    swatch.addEventListener('click', () => {
      navigator.clipboard.writeText(color).catch(() => {});
      showToast('Copied!');
    });
    palette.appendChild(swatch);
  }
}

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._hide);
  t._hide = setTimeout(() => t.classList.remove('show'), 1400);
}

function samplePixel(clientX, clientY) {
  if (!imgLoaded) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = Math.round((clientX - rect.left) * scaleX);
  const my = Math.round((clientY - rect.top) * scaleY);

  if (mx < 0 || mx >= canvas.width || my < 0 || my >= canvas.height) return;

  const px = ctx.getImageData(mx, my, 1, 1).data;
  const [r, g, b, a] = px;

  if (a === 0) return;

  const hex = rgbToHex(r, g, b);
  const rgb = 'rgb(' + r + ', ' + g + ', ' + b + ')';
  const hsl = rgbToHsl(r, g, b);

  prSwatch.style.background = hex;
  hexInput.value = hex;
  rgbInput.value = rgb;
  hslInput.value = hsl;

  coords.textContent = 'Sampled at (' + mx + ', ' + my + ')';

  generatePalette(r, g, b);
}

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const image = new Image();
    image.onload = () => {
      img = image;
      imgLoaded = true;
      const maxW = canvasWrap.clientWidth - 4;
      const scale = Math.min(maxW / image.width, 1);
      canvas.width = Math.floor(image.width * scale);
      canvas.height = Math.floor(image.height * scale);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      coords.textContent = image.width + '×' + image.height + ' — click to sample';
    };
    image.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadImage(fileInput.files[0]);
});

canvas.addEventListener('click', (e) => {
  samplePixel(e.clientX, e.clientY);
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  samplePixel(t.clientX, t.clientY);
}, { passive: false });

canvas.addEventListener('mousemove', (e) => {
  if (!imgLoaded) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  crosshair.style.display = 'block';
  crosshair.style.left = x + 'px';
  crosshair.style.top = y + 'px';
  const xp = (x / rect.width) * 100;
  const yp = (y / rect.height) * 100;
  chH.style.top = yp + '%';
  chV.style.left = xp + '%';
});

canvas.addEventListener('mouseleave', () => {
  crosshair.style.display = 'none';
});

document.querySelectorAll('.cr-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input.value || input.value === '—') return;
    navigator.clipboard.writeText(input.value).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 1200);
    }).catch(() => {});
  });
});
