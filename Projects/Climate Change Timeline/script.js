'use strict';

/* ─── HISTORICAL DATA MATRIX ─── */
const DATA = (() => {
  const rows = [];
  for (let y = 1850; y <= 2100; y++) {
    const t = (y - 1850) / 250; // 0→1
    // CO2: 280→420→550 (historical) then scenarios to 800 by 2100
    let co2;
    if (y <= 2024) co2 = 280 + 140 * (y - 1850) / 174;
    else if (y <= 2050) co2 = 420 + (y - 2024) * 6;
    else co2 = 550 + (y - 2050) * 7;
    co2 = Math.min(1200, Math.max(280, Math.round(co2)));

    // temp anomaly: 0→1.5 by 2026, then up to 3.5 by 2100
    let temp;
    if (y <= 2026) temp = 1.5 * (y - 1850) / 176;
    else temp = 1.5 + 2.0 * (y - 2026) / 74;
    temp = Math.max(0, Math.min(5, Math.round(temp*100)/100));

    // sea level: 0→120 by 2026, then to 650 by 2100
    let sea;
    if (y <= 2026) sea = 120 * (y - 1850) / 176;
    else sea = 120 + 530 * (y - 2026) / 74;
    sea = Math.max(0, Math.round(sea));

    const events = [];
    if (y === 1858) events.push('Tyndall identifies CO₂ as greenhouse gas');
    if (y === 1896) events.push('Arrhenius predicts CO₂ warming');
    if (y === 1938) events.push('Callendar links CO₂ to warming trend');
    if (y === 1958) events.push('Keeling Curve begins at Mauna Loa');
    if (y === 1979) events.push('First World Climate Conference');
    if (y === 1988) events.push('IPCC established');
    if (y === 1992) events.push('Earth Summit — UNFCCC signed');
    if (y === 1997) events.push('Kyoto Protocol adopted');
    if (y === 2006) events.push('An Inconvenient Truth released');
    if (y === 2015) events.push('Paris Agreement signed');
    if (y === 2019) events.push('Global climate strikes — Greta Thunberg');
    if (y === 2021) events.push('COP26 Glasgow Pact');
    if (y === 2023) events.push('Hottest year on record');
    if (y === 2030) events.push('Projected: 1.5°C threshold potentially crossed');
    if (y === 2040) events.push('Projected: Major ice sheet instability');
    if (y === 2050) events.push('Projected: Net-zero emission targets deadline');
    if (y === 2060) events.push('Projected: Carbon capture scales globally');
    if (y === 2070) events.push('Projected: 2°C warming locked in');
    if (y === 2080) events.push('Projected: Widespread coastal adaptation');
    if (y === 2090) events.push('Projected: Geoengineering deployment');
    if (y === 2100) events.push('Projected endpoint: 3–5°C scenario range');

    rows.push({ year:y, co2, temp, sea, events:events.join(' · ') });
  }
  return rows;
})();

const YEAR_MIN = 1850, YEAR_MAX = 2100;

/* ─── DOM REFS ─── */
const $ = id => document.getElementById(id);
const sliderCO2   = $('sliderCO2');
const sliderDefor = $('sliderDefor');
const sliderFuel  = $('sliderFuel');
const unitCO2     = $('unitCO2');
const unitDefor   = $('unitDefor');
const unitFuel    = $('unitFuel');
const tlSlider    = $('tlSlider');
const tlYear      = $('tlYear');
const canvas      = $('trendCanvas');
const ctx         = canvas.getContext('2d');
const chartHint   = $('chartHint');
const telemHint   = $('telemHint');
const topBadge    = $('topBadge');
const co2Top      = $('co2Top');
const tempTop     = $('tempTop');
const seaTop      = $('seaTop');
const tmYear      = $('tmYear');
const tmTemp      = $('tmTemp');
const tmSea       = $('tmSea');
const tmForcing   = $('tmForcing');
const tmState     = $('tmState');
const summaryText = $('summaryText');
const btnPlay     = $('btnPlay');
const btnHalt     = $('btnHalt');
const btnPurge    = $('btnPurge');

/* ─── STATE ─── */
let currentYear = 1850;
let playing = false;
let rafId = null;
let frameTick = 0;
let co2Override = null; // null = use historical, set via slider

/* ─── RADIATIVE FORCING ─── */
function calcForcing(co2) {
  return 5.35 * Math.log(co2 / 280);
}

/* ─── GET DATA FOR YEAR ─── */
function getData(year) {
  // find nearest (exact match or interpolate)
  const idx = year - YEAR_MIN;
  if (idx < 0) return DATA[0];
  if (idx >= DATA.length) return DATA[DATA.length-1];
  return DATA[idx];
}

/* ─── COMPUTE WITH OVERRIDES ─── */
function compute(year) {
  const d = getData(year);
  const co2OverrideVal = parseFloat(sliderCO2.value);
  const deforRate = parseFloat(sliderDefor.value) / 100;
  const fuelSubsidy = parseFloat(sliderFuel.value) / 100;

  let co2 = co2OverrideVal;
  const deforEffect = deforRate * 0.3;
  const fuelEffect = fuelSubsidy * 0.2;
  co2 = Math.round(co2 * (1 + deforEffect + fuelEffect));

  const tempMult = 1 + deforEffect * 0.5 + fuelEffect * 0.3;
  const temp = Math.round(d.temp * tempMult * 100) / 100;

  const seaMult = 1 + tempMult * 0.2;
  const sea = Math.round(d.sea * seaMult);

  const forcing = calcForcing(co2);

  return { year, co2, temp, sea, forcing, events:d.events };
}

/* ─── STATE THEMING ─── */
function applyTheme(temp) {
  const body = document.body;
  body.classList.remove('state-safe','state-warn','state-critical');
  if (temp < 1.0) body.classList.add('state-safe');
  else if (temp < 2.0) body.classList.add('state-warn');
  else body.classList.add('state-critical');
}

function getStateLabel(temp) {
  if (temp < 1.0) return 'PRE-INDUSTRIAL BASELINE';
  if (temp < 1.5) return 'MODERATE WARMING';
  if (temp < 2.0) return 'ACCELERATED WARMING';
  if (temp < 3.0) return 'CRITICAL THRESHOLD';
  return 'CATASTROPHIC SCENARIO';
}

/* ─── UPDATE ALL ─── */
function updateUI(year) {
  const d = compute(year);
  currentYear = year;

  // top bar
  co2Top.textContent = d.co2;
  tempTop.textContent = d.temp.toFixed(2);
  seaTop.textContent = d.sea;

  // year
  tlYear.textContent = year;
  tlSlider.value = year;
  chartHint.textContent = year;
  telemHint.textContent = year;

  // telemetry
  tmYear.textContent = year;
  tmYear.style.color = year > 2026 ? getThemeColor(d.temp) : '#00e5ff';
  tmTemp.textContent = d.temp.toFixed(2) + ' °C';
  tmTemp.style.color = getThemeColor(d.temp);
  tmSea.textContent = d.sea + ' mm';
  tmForcing.textContent = d.forcing.toFixed(2) + ' W/m²';
  const state = getStateLabel(d.temp);
  tmState.textContent = state;
  tmState.style.color = getThemeColor(d.temp);

  // top badge
  topBadge.textContent = state;
  topBadge.style.color = getThemeColor(d.temp);
  topBadge.style.borderColor = getThemeColor(d.temp) + '33';

  // summary
  summaryText.textContent = d.events || 'No recorded events for this year.';

  // theme body
  applyTheme(d.temp);

  // draw canvas
  drawChart(year);

  // slider units
  unitCO2.textContent = sliderCO2.value + ' ppm';
  unitDefor.textContent = sliderDefor.value + '%';
  unitFuel.textContent = sliderFuel.value + '%';
}

function getThemeColor(temp) {
  if (temp < 1.0) return '#00e5ff';
  if (temp < 2.0) return '#ffb800';
  return '#ff1744';
}

/* ─── CANVAS CHART ─── */
function drawChart(activeYear) {
  const dpr = window.devicePixelRatio || 1;
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth || 500;
  const h = Math.max(200, w * 0.45);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);

  const pad = { t:14, b:20, l:42, r:12 };
  const gw = w - pad.l - pad.r;
  const gh = h - pad.t - pad.b;

  // collect all data
  const allData = DATA.map(d => {
    const defor = parseFloat(sliderDefor.value)/100;
    const fuel = parseFloat(sliderFuel.value)/100;
    const co2 = Math.round(parseFloat(sliderCO2.value) * (1 + defor*0.3 + fuel*0.2));
    const temp = Math.round(d.temp * (1 + defor*0.5 + fuel*0.3) * 100)/100;
    return { year:d.year, co2, temp };
  });

  const co2Max = Math.max(...allData.map(d => d.co2), 800);
  const tempMax = Math.max(...allData.map(d => d.temp), 5);

  // grid
  ctx.font = '4.5px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.textAlign = 'right';
  const gridLYears = [1850,1900,1950,2000,2050,2100];
  for (const gy of gridLYears) {
    const x = pad.l + ((gy - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * gw;
    ctx.beginPath();
    ctx.moveTo(x, pad.t);
    ctx.lineTo(x, pad.t + gh);
    ctx.strokeStyle = 'rgba(255,255,255,0.015)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.textAlign = 'center';
    ctx.fillText(gy, x, pad.t + gh + 12);
  }

  // y-axis labels for CO2
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,109,0,0.08)';
  const co2Steps = [300,500,700,1000];
  for (const v of co2Steps) {
    const y = pad.t + gh - (v / co2Max) * gh;
    ctx.fillText(v, pad.l-3, y+1.5);
  }

  // CO2 line
  ctx.beginPath();
  for (let i = 0; i < allData.length; i++) {
    const x = pad.l + (i / (allData.length-1)) * gw;
    const y = pad.t + gh - (allData[i].co2 / co2Max) * gh;
    i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }
  ctx.strokeStyle = '#ff6d00';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Temperature line
  ctx.beginPath();
  for (let i = 0; i < allData.length; i++) {
    const x = pad.l + (i / (allData.length-1)) * gw;
    const y = pad.t + gh - (allData[i].temp / tempMax) * gh;
    i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }
  ctx.strokeStyle = '#ff1744';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // active year marker
  const activeFrac = (activeYear - YEAR_MIN) / (YEAR_MAX - YEAR_MIN);
  const ax = pad.l + activeFrac * gw;
  const dActive = compute(activeYear);

  // CO2 marker
  const ayCO2 = pad.t + gh - (dActive.co2 / co2Max) * gh;
  ctx.beginPath();
  ctx.arc(ax, ayCO2, 4, 0, Math.PI*2);
  ctx.fillStyle = '#ff6d00';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ax, ayCO2, 6, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(255,109,0,0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Temp marker
  const ayTmp = pad.t + gh - (dActive.temp / tempMax) * gh;
  ctx.beginPath();
  ctx.arc(ax, ayTmp, 4, 0, Math.PI*2);
  ctx.fillStyle = '#ff1744';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ax, ayTmp, 6, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(255,23,68,0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // vertical cursor line
  ctx.beginPath();
  ctx.moveTo(ax, pad.t);
  ctx.lineTo(ax, pad.t + gh);
  ctx.strokeStyle = `rgba(255,255,255,0.08)`;
  ctx.lineWidth = 1;
  ctx.setLineDash([3,3]);
  ctx.stroke();
  ctx.setLineDash([]);

  // legend
  ctx.font = '5px JetBrains Mono, monospace';
  ctx.fillStyle = '#ff6d00';
  ctx.textAlign = 'left';
  ctx.fillText('─ CO₂ ppm', pad.l+2, pad.t+8);
  ctx.fillStyle = '#ff1744';
  ctx.fillText('─ Temp °C', pad.l+2, pad.t+16);
}

/* ─── PLAYBACK ─── */
function playbackLoop() {
  if (!playing) return;
  frameTick++;

  if (frameTick % 3 === 0) {
    let next = currentYear + 1;
    if (next > YEAR_MAX) {
      stopPlayback();
      toast('Playback complete — end of timeline');
      return;
    }
    updateUI(next);
  }

  rafId = requestAnimationFrame(playbackLoop);
}

function startPlayback() {
  if (playing) return;
  if (currentYear >= YEAR_MAX) {
    toast('Timeline exhausted. Purge and restart.');
    return;
  }
  playing = true;
  frameTick = 0;
  btnPlay.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> PLAYING...';
  btnPlay.style.opacity = '0.6';
  toast('Chronological playback initiated');
  rafId = requestAnimationFrame(playbackLoop);
}

function stopPlayback() {
  playing = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  btnPlay.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><polygon points="5 3 19 12 5 21 5 3"/></svg> Initiate Chronological Historical Playback';
  btnPlay.style.opacity = '1';
  toast('Playback halted');
}

/* ─── ACTIONS ─── */
function purgeReset() {
  stopPlayback();
  currentYear = 1850;
  sliderCO2.value = 350;
  sliderDefor.value = 0;
  sliderFuel.value = 0;
  updateUI(1850);
  chartHint.textContent = '1850';
  topBadge.textContent = 'STANDBY';
  topBadge.style.color = '#4a5268';
  topBadge.style.borderColor = 'rgba(255,255,255,0.1)';
  document.body.className = '';
  toast('Dataset memory purged — re-zeroed to 1850');
}

function jumpToYear(year) {
  stopPlayback();
  updateUI(year);
  document.querySelectorAll('.epoch-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.year) === year);
  });
  toast(`Jumped to ${year}`);
}

/* ─── TOAST ─── */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('leave'); setTimeout(() => el.remove(), 300); }, 2500);
}

/* ─── INIT ─── */
function init() {
  // slider events
  [sliderCO2, sliderDefor, sliderFuel].forEach(sl => {
    sl.addEventListener('input', () => {
      if (!playing) updateUI(currentYear);
    });
  });

  tlSlider.addEventListener('input', () => {
    if (playing) stopPlayback();
    updateUI(parseInt(tlSlider.value));
    document.querySelectorAll('.epoch-btn').forEach(b => b.classList.remove('active'));
  });

  // epoch buttons
  document.querySelectorAll('.epoch-btn').forEach(btn => {
    btn.addEventListener('click', () => jumpToYear(parseInt(btn.dataset.year)));
  });

  // action buttons
  btnPlay.addEventListener('click', () => playing ? stopPlayback() : startPlayback());
  btnHalt.addEventListener('click', stopPlayback);
  btnPurge.addEventListener('click', purgeReset);

  // resize
  window.addEventListener('resize', () => { drawChart(currentYear); });

  // keyboard
  document.addEventListener('keydown', e => {
    if (e.key === ' ') { e.preventDefault(); playing ? stopPlayback() : startPlayback(); }
    if (e.key === 'ArrowRight' && !playing) updateUI(Math.min(YEAR_MAX, currentYear + 10));
    if (e.key === 'ArrowLeft' && !playing) updateUI(Math.max(YEAR_MIN, currentYear - 10));
  });

  // boot
  updateUI(1850);
  toast('Climate Change Timeline ready');
}

document.addEventListener('DOMContentLoaded', init);
