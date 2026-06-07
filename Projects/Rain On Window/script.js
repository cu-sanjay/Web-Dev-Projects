const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");
const intensity = document.getElementById("intensity");
const intensityValue = document.getElementById("intensityValue");
const volume = document.getElementById("volume");
const volumeValue = document.getElementById("volumeValue");
const lightningToggle = document.getElementById("lightningToggle");
const rainSoundToggle = document.getElementById("rainSoundToggle");
const thunderToggle = document.getElementById("thunderToggle");
const stormBurst = document.getElementById("stormBurst");
const lightningFlash = document.getElementById("lightningFlash");
const stormLabel = document.getElementById("stormLabel");
const statusLight = document.getElementById("statusLight");

let width = 0;
let height = 0;
let drops = [];
let streaks = [];
let lastLightning = 0;
let burstUntil = 0;
let audioContext;
let rainNoise;
let rainGain;
let rainFilter;
let masterGain;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  createDrops();
}

function currentIntensity() {
  const base = Number(intensity.value) / 100;
  return Date.now() < burstUntil ? Math.min(1, base + 0.32) : base;
}

function createDrops() {
  const amount = Math.floor(90 + currentIntensity() * 190);
  drops = Array.from({ length: amount }, () => createDrop(true));
  streaks = Array.from({ length: Math.floor(amount * 0.42) }, () => createStreak(true));
}

function createDrop(randomY = false) {
  const size = 1.8 + Math.random() * 5.8;
  return {
    x: Math.random() * width,
    y: randomY ? Math.random() * height : -size * 4,
    size,
    speed: 0.35 + Math.random() * 1.45,
    wobble: Math.random() * Math.PI * 2,
    drift: -0.18 + Math.random() * 0.36,
    tail: 10 + Math.random() * 30
  };
}

function createStreak(randomY = false) {
  return {
    x: Math.random() * width,
    y: randomY ? Math.random() * height : -80,
    length: 70 + Math.random() * 190,
    speed: 5 + Math.random() * 11,
    opacity: 0.08 + Math.random() * 0.2
  };
}

function drawDrop(drop, power) {
  const wobble = Math.sin(drop.wobble) * 0.65;
  ctx.beginPath();
  ctx.moveTo(drop.x + wobble, drop.y - drop.tail * power);
  ctx.quadraticCurveTo(drop.x + drop.size, drop.y, drop.x, drop.y + drop.size * 1.8);
  ctx.quadraticCurveTo(drop.x - drop.size, drop.y, drop.x + wobble, drop.y - drop.tail * power);
  ctx.fillStyle = `rgba(224, 244, 255, ${0.13 + power * 0.28})`;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(drop.x + drop.size * 0.35, drop.y - drop.tail * 0.55);
  ctx.lineTo(drop.x + drop.size * 0.75, drop.y + drop.size * 0.5);
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 + power * 0.36})`;
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

function drawStreak(streak, power) {
  ctx.beginPath();
  ctx.moveTo(streak.x, streak.y);
  ctx.lineTo(streak.x - 16 * power, streak.y + streak.length);
  ctx.strokeStyle = `rgba(185, 226, 255, ${streak.opacity * power})`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function animate() {
  const power = currentIntensity();
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(210, 236, 255, 0.06)");
  gradient.addColorStop(1, "rgba(210, 236, 255, 0.01)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (const streak of streaks) {
    drawStreak(streak, power);
    streak.y += streak.speed * (0.55 + power);
    streak.x -= 0.7 * power;
    if (streak.y > height + streak.length) Object.assign(streak, createStreak());
  }

  for (const drop of drops) {
    drawDrop(drop, power);
    drop.y += drop.speed * (2.5 + power * 4);
    drop.x += drop.drift + Math.sin(drop.wobble) * 0.12;
    drop.wobble += 0.035 + power * 0.03;
    if (drop.y > height + drop.tail || drop.x < -20 || drop.x > width + 20) {
      Object.assign(drop, createDrop());
    }
  }

  maybeLightning(power);
  updateRainVolume(power);
  requestAnimationFrame(animate);
}

function updateLabels() {
  const value = Number(intensity.value);
  intensityValue.textContent = `${value}%`;
  volumeValue.textContent = `${volume.value}%`;

  if (value < 35) stormLabel.textContent = "Soft drizzle";
  else if (value < 72) stormLabel.textContent = "Steady rain";
  else stormLabel.textContent = "Heavy downpour";

  statusLight.style.opacity = `${0.55 + value / 220}`;
}

function ensureAudio() {
  if (audioContext) return;
  audioContext = new AudioContext();
  masterGain = audioContext.createGain();
  masterGain.gain.value = Number(volume.value) / 100;
  masterGain.connect(audioContext.destination);

  const bufferSize = audioContext.sampleRate * 2;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  rainNoise = audioContext.createBufferSource();
  rainNoise.buffer = buffer;
  rainNoise.loop = true;

  rainFilter = audioContext.createBiquadFilter();
  rainFilter.type = "bandpass";
  rainFilter.frequency.value = 920;
  rainFilter.Q.value = 0.85;

  rainGain = audioContext.createGain();
  rainGain.gain.value = 0;

  rainNoise.connect(rainFilter);
  rainFilter.connect(rainGain);
  rainGain.connect(masterGain);
  rainNoise.start();
}

function updateRainVolume(power) {
  if (!rainGain || !masterGain) return;
  const now = audioContext.currentTime;
  const enabled = rainSoundToggle.checked ? 1 : 0;
  rainGain.gain.setTargetAtTime(enabled * (0.04 + power * 0.2), now, 0.12);
  masterGain.gain.setTargetAtTime(Number(volume.value) / 100, now, 0.08);
  rainFilter.frequency.setTargetAtTime(620 + power * 950, now, 0.2);
}

function playThunder(power = currentIntensity()) {
  if (!thunderToggle.checked) return;
  ensureAudio();

  const now = audioContext.currentTime;
  const thunderBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2.4, audioContext.sampleRate);
  const data = thunderBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    const t = i / data.length;
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.8) * (0.8 + power);
  }

  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  source.buffer = thunderBuffer;
  filter.type = "lowpass";
  filter.frequency.value = 105 + power * 95;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.42, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start(now);
  source.stop(now + 2.4);
}

function flashLightning(power = currentIntensity()) {
  lightningFlash.classList.remove("active");
  void lightningFlash.offsetWidth;
  lightningFlash.classList.add("active");
  setTimeout(() => playThunder(power), 320 + Math.random() * 900);
}

function maybeLightning(power) {
  if (!lightningToggle.checked || power < 0.42) return;
  const now = Date.now();
  const gap = 3800 + (1 - power) * 7000;
  if (now - lastLightning > gap && Math.random() < 0.008 * power) {
    lastLightning = now;
    flashLightning(power);
  }
}

function handleAudioToggle() {
  ensureAudio();
  if (audioContext.state === "suspended") audioContext.resume();
}

intensity.addEventListener("input", () => {
  updateLabels();
  createDrops();
});

volume.addEventListener("input", updateLabels);
rainSoundToggle.addEventListener("change", handleAudioToggle);
thunderToggle.addEventListener("change", handleAudioToggle);

stormBurst.addEventListener("click", () => {
  burstUntil = Date.now() + 4500;
  createDrops();
  flashLightning(1);
});

window.addEventListener("resize", resizeCanvas);

updateLabels();
resizeCanvas();
animate();
