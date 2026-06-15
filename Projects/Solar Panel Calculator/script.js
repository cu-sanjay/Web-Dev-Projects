'use strict';

/* ─── PRESETS ─── */
const PRESETS = {
  roof:    { area:50,  eff:20, sun:5,   tariff:0.12, cost:10000,  label:'Residential Roof Grid' },
  farm:    { area:2000,eff:22, sun:5.5, tariff:0.10, cost:45000,  label:'Commercial Solar Farm' },
  cabin:   { area:15,  eff:18, sun:4.5, tariff:0.18, cost:6000,   label:'Off-Grid Cabin Unit' },
  monsoon: { area:80,  eff:16, sun:2.5, tariff:0.14, cost:14000,  label:'Saturated Monsoon Array' }
};

/* ─── DOM REFS ─── */
const $ = id => document.getElementById(id);

const sliderArea   = $('sliderArea');
const sliderEff    = $('sliderEff');
const sliderSun    = $('sliderSun');
const sliderTariff = $('sliderTariff');
const sliderCost   = $('sliderCost');
const inputArea    = $('inputArea');
const inputEff     = $('inputEff');
const inputSun     = $('inputSun');
const inputTariff  = $('inputTariff');
const inputCost    = $('inputCost');

const sumGenVal   = $('sumGenVal');
const sumSaveVal  = $('sumSaveVal');
const sumPayVal   = $('sumPayVal');
const sumCO2Val   = $('sumCO2Val');
const yieldVal    = $('yieldVal');
const savingsVal  = $('savingsVal');
const carbonVal   = $('carbonVal');
const chartHint   = $('chartHint');
const topBadge    = $('topBadge');
const alertBanner = $('alertBanner');

const energyCanvas = $('energyCanvas');
const roiCanvas    = $('roiCanvas');
const ctxE         = energyCanvas.getContext('2d');
const ctxR         = roiCanvas.getContext('2d');

const btnRun     = $('btnRun');
const btnMonsoon = $('btnMonsoon');
const btnFlush   = $('btnFlush');

/* ─── STATE ─── */
let area = 50, eff = 20, sun = 5, tariff = 0.12, cost = 10000;
let computed = null; // { annualYield, annualSavings, paybackYears, carbonAvoided, monthly }

/* ─── BIND SLIDER ⬌ INPUT ─── */
function bindSliderInput(slider, input) {
  slider.addEventListener('input', () => {
    input.value = parseFloat(slider.value);
    input.classList.remove('err');
  });
  input.addEventListener('input', () => {
    const min = parseFloat(input.min), max = parseFloat(input.max);
    let v = parseFloat(input.value);
    if (isNaN(v) || v < min || v > max) {
      input.classList.add('err');
    } else {
      input.classList.remove('err');
      slider.value = v;
    }
  });
  input.addEventListener('change', () => {
    const min = parseFloat(input.min), max = parseFloat(input.max);
    let v = parseFloat(input.value);
    if (isNaN(v) || v < min) { v = min; input.value = min; }
    if (v > max) { v = max; input.value = max; }
    slider.value = v;
    input.classList.remove('err');
  });
}

/* ─── READ PARAMS ─── */
function readParams() {
  const a = parseFloat(inputArea.value);
  const e = parseFloat(inputEff.value);
  const s = parseFloat(inputSun.value);
  const t = parseFloat(inputTariff.value);
  const c = parseFloat(inputCost.value);
  if ([a,e,s,t,c].some(v => isNaN(v) || v <= 0)) return null;
  if (s > 24) return null;
  return { area:a, eff:e, sun:s, tariff:t, cost:c };
}

/* ─── COMPUTATION ENGINE ─── */
function computeSolar(p) {
  // E = A * H * (η/100) * 0.75 * 365
  const annualYield = p.area * p.sun * (p.eff / 100) * 0.75 * 365;
  const annualSavings = annualYield * p.tariff;
  const paybackYears = annualSavings > 0 ? p.cost / annualSavings : Infinity;
  const carbonAvoided = annualYield * 0.000475;

  // monthly distribution with seasonal variation (peak summer, trough winter, hemisphere-neutral)
  const peakMonth = 6; // June
  const months = [];
  for (let m = 0; m < 12; m++) {
    const seasonal = 1 + 0.4 * Math.cos((m - peakMonth) * Math.PI / 6);
    const sunFactor = p.sun / 5; // normalize to baseline
    const monthYield = (annualYield / 12) * seasonal * (0.7 + 0.3 * sunFactor);
    months.push(Math.max(0, monthYield));
  }

  return { annualYield, annualSavings, paybackYears, carbonAvoided, months };
}

/* ─── RENDER ALL ─── */
function render() {
  const p = readParams();
  if (!p) {
    alertBanner.style.display = 'block';
    alertBanner.textContent = '⚠ Invalid parameters — check all inputs are positive numeric values within range';
    return;
  }

  computed = computeSolar(p);
  const { annualYield, annualSavings, paybackYears, carbonAvoided } = computed;

  // hide alert
  alertBanner.style.display = 'none';

  // format helpers
  const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });
  const fmt$ = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  const fmtYr = (n) => isFinite(n) ? n.toFixed(1) : '∞';

  // summary cards
  sumGenVal.textContent = fmt(annualYield) + ' kWh';
  sumSaveVal.textContent = fmt$(annualSavings);
  sumPayVal.textContent = fmtYr(paybackYears);
  sumCO2Val.textContent = fmt(carbonAvoided) + ' t';

  // top chips
  yieldVal.textContent = fmt(annualYield) + ' kWh';
  savingsVal.textContent = fmt$(annualSavings);
  carbonVal.textContent = fmt(carbonAvoided) + ' t';

  // status coloring
  const sumCards = ['sumGen','sumSave','sumPay','sumCO2'];
  sumCards.forEach(k => $(k).className = 'sum-card');
  $('sumGen').classList.add('yellow');
  $('sumSave').classList.add('opt');
  $('sumCO2').classList.add('opt');
  if (isFinite(paybackYears) && paybackYears <= 10) $('sumPay').classList.add('opt');
  else if (isFinite(paybackYears) && paybackYears <= 20) $('sumPay').classList.add('warn');
  else $('sumPay').classList.add('crit');

  chartHint.textContent = `☀ ${fmt(annualYield)} kWh/yr`;
  chartHint.style.color = '#ffd600';
  topBadge.textContent = '☀ ACTIVE';
  topBadge.style.color = '#ffd600';
  topBadge.style.borderColor = 'rgba(255,214,0,0.3)';

  // draw canvases
  drawEnergyChart();
  drawROIBars();
  toast('Photovoltaic grid run complete');
}

/* ─── CANVAS: ENERGY TRAJECTORY ─── */
function drawEnergyChart() {
  if (!computed) return;
  const dpr = window.devicePixelRatio || 1;
  const wrap = energyCanvas.parentElement;
  const w = wrap.clientWidth || 300;
  const h = Math.max(160, w * 0.45);
  energyCanvas.style.width = w + 'px';
  energyCanvas.style.height = h + 'px';
  energyCanvas.width = w * dpr;
  energyCanvas.height = h * dpr;
  const c = ctxE;
  c.setTransform(1,0,0,1,0,0);
  c.scale(dpr,dpr);
  c.clearRect(0,0,w,h);

  const pad = { t:16, b:20, l:40, r:16 };
  const gw = w - pad.l - pad.r;
  const gh = h - pad.t - pad.b;

  const months = computed.months;
  const maxVal = Math.max(...months, 1);
  const stepX = gw / (months.length - 1);

  // grid lines
  c.font = '4.5px JetBrains Mono, monospace';
  c.fillStyle = 'rgba(255,255,255,0.06)';
  c.textAlign = 'right';
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const y = pad.t + (gh - (gh * i / gridLines));
    c.beginPath();
    c.moveTo(pad.l, y);
    c.lineTo(pad.l + gw, y);
    c.strokeStyle = 'rgba(255,255,255,0.03)';
    c.lineWidth = 0.5;
    c.stroke();
    c.fillText((maxVal * i / gridLines).toFixed(0), pad.l - 4, y + 1.5);
  }

  // month labels
  const monthLabels = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  c.textAlign = 'center';
  c.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < months.length; i++) {
    const x = pad.l + i * stepX;
    c.fillText(monthLabels[i], x, pad.t + gh + 12);
  }

  // interpolated smooth curve using quadratic bezier
  if (months.length > 1) {
    c.beginPath();
    for (let i = 0; i < months.length; i++) {
      const x = pad.l + i * stepX;
      const y = pad.t + gh - (months[i] / maxVal) * gh;
      if (i === 0) c.moveTo(x, y);
      else {
        const prevX = pad.l + (i-1) * stepX;
        const prevY = pad.t + gh - (months[i-1] / maxVal) * gh;
        const cpx = (prevX + x) / 2;
        c.quadraticCurveTo(cpx, prevY, x, y);
      }
    }
    c.strokeStyle = '#ffd600';
    c.lineWidth = 2.5;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.stroke();
  }

  // fill gradient below curve
  c.beginPath();
  for (let i = 0; i < months.length; i++) {
    const x = pad.l + i * stepX;
    const y = pad.t + gh - (months[i] / maxVal) * gh;
    if (i === 0) c.moveTo(pad.l, pad.t + gh);
    if (i === 0) c.lineTo(x, y);
    else {
      const prevX = pad.l + (i-1) * stepX;
      const prevY = pad.t + gh - (months[i-1] / maxVal) * gh;
      const cpx = (prevX + x) / 2;
      c.quadraticCurveTo(cpx, prevY, x, y);
    }
  }
  c.lineTo(pad.l + gw, pad.t + gh);
  c.closePath();
  const grad = c.createLinearGradient(0, pad.t, 0, pad.t + gh);
  grad.addColorStop(0, 'rgba(255,214,0,0.15)');
  grad.addColorStop(1, 'rgba(255,214,0,0.01)');
  c.fillStyle = grad;
  c.fill();
}

/* ─── CANVAS: ROI PAYBACK ─── */
function drawROIBars() {
  if (!computed) return;
  const dpr = window.devicePixelRatio || 1;
  const wrap = roiCanvas.parentElement;
  const w = wrap.clientWidth || 300;
  const h = Math.max(60, w * 0.2);
  roiCanvas.style.width = w + 'px';
  roiCanvas.style.height = h + 'px';
  roiCanvas.width = w * dpr;
  roiCanvas.height = h * dpr;
  const c = ctxR;
  c.setTransform(1,0,0,1,0,0);
  c.scale(dpr,dpr);
  c.clearRect(0,0,w,h);

  const pad = { t:10, b:16, l:10, r:10 };
  const gw = w - pad.l - pad.r;
  const bh = 18;
  const y1 = pad.t;
  const y2 = pad.t + bh + 4;

  const { cost, annualSavings, paybackYears } = computed;
  const years = Math.min(30, Math.ceil(paybackYears) + 2);
  const maxVal = Math.max(cost, annualSavings * years);

  // cost bar (full installation)
  const costW = (cost / maxVal) * gw;
  c.fillStyle = '#ff1744';
  c.beginPath();
  c.roundRect(pad.l, y1, Math.max(2, costW), bh, 3);
  c.fill();
  c.font = '5px JetBrains Mono, monospace';
  c.fillStyle = '#8892a8';
  c.textAlign = 'left';
  c.fillText('Installation Cost', pad.l + costW + 4, y1 + 12);

  // annual savings bars stacked
  let cumulative = 0;
  for (let y = 0; y < Math.min(years, 15); y++) {
    const saving = annualSavings;
    cumulative += saving;
    const barW = (saving / maxVal) * gw;
    const x = pad.l;
    const yy = y2;
    const hue = y < paybackYears ? 120 : y < paybackYears + 2 ? 45 : 200;
    c.fillStyle = y < paybackYears ? '#00e676' : y < paybackYears + 2 ? '#ffb800' : '#00e5ff';
    c.beginPath();
    c.roundRect(x, yy, Math.max(2, barW), bh, 2);
    c.fill();
    if (barW > 20) {
      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.font = '4px JetBrains Mono, monospace';
      c.textAlign = 'left';
      c.fillText(`Yr ${y+1}`, x + 3, yy + 11);
    }
    // crossover marker
    if (y === Math.floor(paybackYears)) {
      c.fillStyle = '#ffd600';
      c.font = 'bold 5px JetBrains Mono, monospace';
      c.textAlign = 'left';
      c.fillText('⚡ ROI', x + barW + 4, yy + 11);
    }
  }

  // legend
  c.font = '4.5px JetBrains Mono, monospace';
  c.fillStyle = '#4a5268';
  c.textAlign = 'left';
  c.fillText('Payback: ' + (isFinite(paybackYears) ? paybackYears.toFixed(1) + ' yrs' : 'n/a'), pad.l, pad.t + 62);
}

/* ─── TOAST ─── */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('leave'); setTimeout(() => el.remove(), 300); }, 2500);
}

/* ─── VALIDATE ─── */
function validate() {
  const p = readParams();
  if (!p) {
    if (parseFloat(inputSun.value) > 24) {
      alertBanner.style.display = 'block';
      alertBanner.textContent = '⚠ Sun hours cannot exceed 24 per day';
    } else {
      alertBanner.style.display = 'block';
      alertBanner.textContent = '⚠ Invalid parameters — check all inputs are positive numeric values';
    }
    document.querySelectorAll('.p-input').forEach(el => {
      const v = parseFloat(el.value);
      const min = parseFloat(el.min), max = parseFloat(el.max);
      if (isNaN(v) || v < min || v > max) el.classList.add('err');
    });
    return false;
  }
  return true;
}

/* ─── ACTIONS ─── */
function runCalculation() {
  if (!validate()) { toast('Fix parameter errors before running'); return; }
  render();
}

function loadPreset(key) {
  const p = PRESETS[key];
  if (!p) return;
  sliderArea.value = inputArea.value = p.area;
  sliderEff.value = inputEff.value = p.eff;
  sliderSun.value = inputSun.value = p.sun;
  sliderTariff.value = inputTariff.value = p.tariff;
  sliderCost.value = inputCost.value = p.cost;
  document.querySelectorAll('.p-input').forEach(el => el.classList.remove('err'));
  toast(`Loaded preset: ${p.label}`);
  render();
}

function flushCache() {
  area = 50; eff = 20; sun = 5; tariff = 0.12; cost = 10000;
  sliderArea.value = inputArea.value = 50;
  sliderEff.value = inputEff.value = 20;
  sliderSun.value = inputSun.value = 5;
  sliderTariff.value = inputTariff.value = 0.12;
  sliderCost.value = inputCost.value = 10000;
  computed = null;
  document.querySelectorAll('.p-input').forEach(el => el.classList.remove('err'));
  alertBanner.style.display = 'none';
  chartHint.textContent = 'STANDBY';
  chartHint.style.color = '';
  topBadge.textContent = 'STANDBY';
  topBadge.style.color = '#4a5268';
  topBadge.style.borderColor = 'rgba(255,255,255,0.1)';

  // clear canvases
  [ctxE, ctxR].forEach(c => {
    const dpr = window.devicePixelRatio || 1;
    c.clearRect(0,0,c.canvas.width, c.canvas.height);
  });

  // reset summaries
  ['sumGenVal','sumSaveVal','sumPayVal','sumCO2Val','yieldVal','savingsVal','carbonVal'].forEach(k => $(k).textContent = '--');
  ['sumGen','sumSave','sumPay','sumCO2'].forEach(k => $(k).className = 'sum-card');

  toast('Analytical cache flushed');
}

/* ─── INIT ─── */
function init() {
  // bind sliders
  bindSliderInput(sliderArea, inputArea);
  bindSliderInput(sliderEff, inputEff);
  bindSliderInput(sliderSun, inputSun);
  bindSliderInput(sliderTariff, inputTariff);
  bindSliderInput(sliderCost, inputCost);

  // events
  btnRun.addEventListener('click', runCalculation);
  btnMonsoon.addEventListener('click', () => loadPreset('monsoon'));
  btnFlush.addEventListener('click', flushCache);

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      loadPreset(btn.dataset.preset);
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') runCalculation();
    if (e.key === 'r' || e.key === 'R') runCalculation();
    if (e.key === 'x' || e.key === 'X') flushCache();
  });

  // resize
  window.addEventListener('resize', () => { if (computed) { drawEnergyChart(); drawROIBars(); } });

  toast('Solar Panel Calculator ready');
}

document.addEventListener('DOMContentLoaded', init);
