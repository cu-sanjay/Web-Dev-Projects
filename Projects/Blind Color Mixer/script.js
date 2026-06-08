/* ── DOM Refs ── */

const targetBox = document.getElementById('targetBox');
const mixBox = document.getElementById('mixBox');
const redSlider = document.getElementById('redSlider');
const greenSlider = document.getElementById('greenSlider');
const blueSlider = document.getElementById('blueSlider');
const submitBtn = document.getElementById('submitBtn');
const newBtn = document.getElementById('newBtn');
const continueBtn = document.getElementById('continueBtn');
const accuracyDisplay = document.getElementById('accuracyDisplay');
const roundDisplay = document.getElementById('roundDisplay');
const bestDisplay = document.getElementById('bestDisplay');
const overlay = document.getElementById('overlay');
const resultTitle = document.getElementById('resultTitle');
const accuracyPct = document.getElementById('accuracyPct');
const targetRgb = document.getElementById('targetRgb');
const mixRgb = document.getElementById('mixRgb');
const targetSwatch = document.getElementById('targetSwatch');
const mixSwatch = document.getElementById('mixSwatch');

/* ── State ── */

let target = { r: 0, g: 0, b: 0 };
let roundCount = 0;
let bestAccuracy = 0;
let allSliders = [redSlider, greenSlider, blueSlider];

/* ── Color Helpers ── */

function randomByte() {
  return Math.floor(Math.random() * 256);
}

function randomColor() {
  return { r: randomByte(), g: randomByte(), b: randomByte() };
}

function rgbString(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

/* ── Euclidean Distance & Accuracy ── */

function calcAccuracy(userR, userG, userB) {
  const dr = target.r - userR;
  const dg = target.g - userG;
  const db = target.b - userB;
  const distance = Math.sqrt(dr * dr + dg * dg + db * db);
  const maxDist = Math.sqrt(3 * 255 * 255);
  const raw = 100 * (1 - distance / maxDist);
  return Math.max(0, Math.min(100, raw));
}

/* ── Target & Slider Init ── */

function randomizeTarget() {
  target = randomColor();
  targetBox.style.background = rgbString(target.r, target.g, target.b);
}

function randomizeSliders() {
  redSlider.value = randomByte();
  greenSlider.value = randomByte();
  blueSlider.value = randomByte();
}

function refreshMix() {
  const r = parseInt(redSlider.value, 10);
  const g = parseInt(greenSlider.value, 10);
  const b = parseInt(blueSlider.value, 10);
  mixBox.style.background = rgbString(r, g, b);
}

/* ── New Round ── */

function newRound() {
  randomizeTarget();
  randomizeSliders();
  refreshMix();
  accuracyDisplay.textContent = '\u2014';
  overlay.classList.add('hidden');
}

/* ── Submit ── */

function submitMix() {
  const r = parseInt(redSlider.value, 10);
  const g = parseInt(greenSlider.value, 10);
  const b = parseInt(blueSlider.value, 10);

  const acc = calcAccuracy(r, g, b);
  roundCount++;

  if (acc > bestAccuracy) {
    bestAccuracy = acc;
    saveBest();
  }

  accuracyDisplay.textContent = acc.toFixed(1) + '%';
  roundDisplay.textContent = String(roundCount);
  bestDisplay.textContent = bestAccuracy.toFixed(1) + '%';

  let title;
  if (acc >= 98) title = 'PERFECT MATCH';
  else if (acc >= 90) title = 'EXCELLENT';
  else if (acc >= 75) title = 'CLOSE MATCH';
  else if (acc >= 50) title = 'FAIR';
  else title = 'KEEP PRACTICING';

  resultTitle.textContent = title;
  accuracyPct.textContent = acc.toFixed(1) + '%';

  const targetStr = rgbString(target.r, target.g, target.b);
  const mixStr = rgbString(r, g, b);
  targetRgb.textContent = targetStr;
  mixRgb.textContent = mixStr;
  targetSwatch.style.background = targetStr;
  mixSwatch.style.background = mixStr;

  overlay.classList.remove('hidden');
}

/* ── High Score (localStorage) ── */

function loadBest() {
  try {
    const saved = localStorage.getItem('blindMixerBest');
    if (saved !== null) {
      bestAccuracy = parseFloat(saved) || 0;
    }
  } catch (_) {}
  bestDisplay.textContent = bestAccuracy > 0 ? bestAccuracy.toFixed(1) + '%' : '\u2014';
}

function saveBest() {
  try {
    localStorage.setItem('blindMixerBest', String(bestAccuracy));
  } catch (_) {}
}

/* ── Event Wiring ── */

allSliders.forEach(sl => sl.addEventListener('input', refreshMix));
submitBtn.addEventListener('click', submitMix);
newBtn.addEventListener('click', () => { newRound(); });
continueBtn.addEventListener('click', () => { newRound(); });

/* ── Boot ── */

loadBest();
newRound();
