(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#zoneCanvas');
  const ctx = canvas.getContext('2d');
  const inputAge = $('#inputAge');
  const inputRest = $('#inputRest');
  const sliderIntensity = $('#sliderIntensity');
  const valIntensity = $('#valIntensity');
  const zoneVal = $('#zoneVal');
  const bpmVal = $('#bpmVal');
  const hrrVal = $('#hrrVal');
  const topBadge = $('#topBadge');
  const zoneCards = $('#zoneCards');
  const zonePreview = $('#zonePreview');
  const teleHrmax = $('#teleHrmax');
  const teleHrrest = $('#teleHrrest');
  const teleHrr = $('#teleHrr');
  const teleTarget = $('#teleTarget');
  const teleIntensity = $('#teleIntensity');
  const teleZone = $('#teleZone');
  const teleClass = $('#teleClass');
  const teleBadge = $('#teleBadge');
  const btnCompute = $('#btnCompute');
  const btnStress = $('#btnStress');
  const btnFlush = $('#btnFlush');
  const toastContainer = $('#toastContainer');
  const alertBanner = $('#alertBanner');
  const presetBtns = $$('.preset-btn');

  /* ─── ZONE DEFINITIONS ─── */
  const ZONES = [
    { idx: 1, name: 'Recovery',   min: 50, max: 60, color: '#00e5ff', class: 'Active Recovery' },
    { idx: 2, name: 'Aerobic',    min: 60, max: 70, color: '#00e676', class: 'Endurance Base' },
    { idx: 3, name: 'Tempo',      min: 70, max: 80, color: '#ffb800', class: 'Lactate Threshold' },
    { idx: 4, name: 'Anaerobic',  min: 80, max: 90, color: '#ff6d00', class: 'Power Endurance' },
    { idx: 5, name: 'Vo2 Max',    min: 90, max:100, color: '#ff1744', class: 'Peak Capacity' }
  ];

  /* ─── STATE ─── */
  const CACHE = { hrmax: 0, hrrest: 0, hrr: 0, target: 0, intensity: 0, zoneIdx: -1 };

  /* ─── PRESETS ─── */
  const PRESETS = {
    elite:     { age: 28, rest: 42, intensity: 75, label: 'Elite Marathoner' },
    sedentary: { age: 55, rest: 82, intensity: 55, label: 'Sedentary Recovery' },
    hiit:      { age: 25, rest: 58, intensity: 88, label: 'HIIT Conditioning' }
  };

  presetBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      presetBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const p = PRESETS[this.dataset.preset];
      if (!p) return;
      inputAge.value = p.age;
      inputRest.value = p.rest;
      sliderIntensity.value = p.intensity;
      valIntensity.textContent = p.intensity;
      hideAlert();
      compute();
      showToast('[PRESET] Loaded: ' + p.label, '#00e5ff');
    });
  });

  /* ─── KARVONEN ENGINE ─── */
  function compute() {
    const age = parseInt(inputAge.value, 10);
    const rest = parseInt(inputRest.value, 10);
    const intensity = parseFloat(sliderIntensity.value);

    if (isNaN(age) || isNaN(rest) || age < 1 || age > 100 || rest < 30 || rest > 220) {
      showAlert('Invalid input parameters');
      return;
    }

    const hrmax = 220 - age;
    if (rest >= hrmax) {
      showAlert('Resting vitals exceed maximum structural parameters.');
      [inputAge, inputRest].forEach(el => {
        el.classList.add('err');
        setTimeout(() => el.classList.remove('err'), 600);
      });
      return;
    }

    hideAlert();
    const hrr = hrmax - rest;
    const target = Math.round(hrr * (intensity / 100) + rest);

    let zoneIdx = -1;
    for (let i = ZONES.length - 1; i >= 0; i--) {
      if (intensity >= ZONES[i].min) { zoneIdx = i; break; }
    }
    if (zoneIdx < 0) zoneIdx = 0;

    Object.assign(CACHE, { hrmax, hrrest: rest, hrr, target, intensity, zoneIdx });

    updateUI();
    drawCanvas();
    renderZoneCards();
    showToast('[OK] Metrics computed: Zone ' + ZONES[zoneIdx].name + ' | ' + target + ' bpm', ZONES[zoneIdx].color);
  }

  /* ─── VALIDATION HELPERS ─── */
  function showAlert(msg) {
    alertBanner.textContent = msg;
    alertBanner.classList.add('show');
  }
  function hideAlert() { alertBanner.classList.remove('show'); }

  /* ─── UI UPDATE ─── */
  function updateUI() {
    const z = ZONES[CACHE.zoneIdx];
    zoneVal.textContent = 'Z' + z.idx + ' ' + z.name.toUpperCase();
    bpmVal.textContent = CACHE.target;
    hrrVal.textContent = CACHE.hrr;
    topBadge.textContent = z.name.toUpperCase();
    topBadge.style.color = z.color;
    topBadge.style.borderColor = z.color + '44';

    teleHrmax.textContent = CACHE.hrmax + ' bpm';
    teleHrrest.textContent = CACHE.hrrest + ' bpm';
    teleHrr.textContent = CACHE.hrr + ' bpm';
    teleTarget.textContent = CACHE.target + ' bpm';
    teleTarget.style.color = z.color;
    teleTarget.style.textShadow = '0 0 8px ' + z.color + '66';
    teleIntensity.textContent = CACHE.intensity + '%';
    teleZone.textContent = 'Zone ' + z.idx + ' — ' + z.name;
    teleClass.textContent = z.class;

    teleBadge.textContent = z.name.toUpperCase() + ' ACTIVE';
    teleBadge.style.background = z.color + '22';
    teleBadge.style.borderColor = z.color + '44';
    teleBadge.style.color = z.color;

    sliderIntensity.style.setProperty('--slider-color', z.color);
  }

  function renderZoneCards() {
    zoneCards.innerHTML = '';
    ZONES.forEach((z, i) => {
      const card = document.createElement('div');
      card.className = 'zone-card' + (i === CACHE.zoneIdx ? ' active' : '');
      card.style.color = z.color;
      card.innerHTML = `<div class="zc-name">Z${z.idx} ${z.name}</div><div class="zc-pct">${z.min}-${z.max}%</div><div class="zc-range">${rangeStr(z, CACHE.hrmax, CACHE.hrrest)}</div>`;
      zoneCards.appendChild(card);
    });
  }

  function rangeStr(z, hrmax, hrrest) {
    const lo = Math.round(hrrest + (hrmax - hrrest) * z.min / 100);
    const hi = Math.round(hrrest + (hrmax - hrrest) * z.max / 100);
    return lo + '-' + hi + ' bpm';
  }

  /* ─── CANVAS ─── */
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 300;
    const h = Math.max(90, Math.min(160, w * 0.28));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = w;
    canvas._h = h;
  }

  function drawCanvas() {
    const w = canvas._w;
    const h = canvas._h;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, w, h);

    const pad = 12;
    const cy = h / 2;
    const totalW = w - pad * 2;
    const barH = Math.max(20, h * 0.4);
    const totalPct = 100 - 50;
    const offset = 50;

    /* draw 5 zone segments */
    let x = pad;
    ZONES.forEach((z, i) => {
      const segW = totalW * (z.max - z.min) / totalPct;
      const grad = ctx.createLinearGradient(x, 0, x + segW, 0);
      grad.addColorStop(0, z.color + '99');
      grad.addColorStop(0.5, z.color + 'cc');
      grad.addColorStop(1, z.color + '99');

      ctx.beginPath();
      const r = 4;
      const left = x;
      const right = x + segW;
      const top = cy - barH / 2;
      const bot = cy + barH / 2;

      ctx.moveTo(left + r, top);
      ctx.lineTo(right - r, top);
      ctx.quadraticCurveTo(right, top, right, top + r);
      ctx.lineTo(right, bot - r);
      ctx.quadraticCurveTo(right, bot, right - r, bot);
      ctx.lineTo(left + r, bot);
      ctx.quadraticCurveTo(left, bot, left, bot - r);
      ctx.lineTo(left, top + r);
      ctx.quadraticCurveTo(left, top, left + r, top);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = z.color + '33';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      /* label */
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '5.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('Z' + z.idx, x + segW / 2, cy - barH / 2 - 2);
      ctx.textBaseline = 'top';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.fillStyle = z.color + '88';
      ctx.fillText(z.min + '-' + z.max + '%', x + segW / 2, cy + barH / 2 + 2);

      x += segW;
    });

    /* active cursor */
    const pct = CACHE.intensity - offset;
    const cursorX = pad + totalW * (pct / totalPct);
    const z = ZONES[CACHE.zoneIdx];

    /* glow */
    const glow = ctx.createRadialGradient(cursorX, cy, 0, cursorX, cy, barH * 0.8);
    glow.addColorStop(0, z.color + '44');
    glow.addColorStop(1, z.color + '00');
    ctx.fillStyle = glow;
    ctx.fillRect(cursorX - barH, cy - barH, barH * 2, barH * 2);

    /* cursor dot */
    ctx.beginPath();
    ctx.arc(cursorX, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = z.color;
    ctx.fill();
    ctx.shadowColor = z.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cursorX, cy, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    /* cursor line */
    ctx.beginPath();
    ctx.moveTo(cursorX, cy - barH / 2 - 6);
    ctx.lineTo(cursorX, cy + barH / 2 + 6);
    ctx.strokeStyle = z.color + '66';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* target BPM label */
    ctx.fillStyle = z.color;
    ctx.font = '600 6px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(CACHE.target + ' bpm', cursorX, cy - barH / 2 - 7);

    /* HRmax label right */
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.font = '4.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('HRmax ' + CACHE.hrmax, w - pad, cy - barH / 2 - 2);
  }

  /* ─── STRESS TEST ─── */
  function injectStress() {
    inputAge.value = 22;
    inputRest.value = 72;
    sliderIntensity.value = 92;
    valIntensity.textContent = 92;
    hideAlert();
    compute();
    showToast('[STRESS] Anaerobic test values injected (92% intensity)', '#ff6d00');
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    Object.assign(CACHE, { hrmax: 0, hrrest: 0, hrr: 0, target: 0, intensity: 0, zoneIdx: -1 });
    inputAge.value = 30;
    inputRest.value = 65;
    sliderIntensity.value = 70;
    valIntensity.textContent = 70;
    hideAlert();

    zoneVal.textContent = '--';
    bpmVal.textContent = '--';
    hrrVal.textContent = '--';
    topBadge.textContent = 'STANDBY';
    topBadge.style.color = '#00e5ff';
    topBadge.style.borderColor = 'rgba(0,229,255,0.2)';
    ['teleHrmax','teleHrrest','teleHrr','teleTarget','teleIntensity','teleZone','teleClass'].forEach(id => {
      $(`#${id}`).textContent = '--';
    });
    teleTarget.style.color = '';
    teleTarget.style.textShadow = '';
    teleBadge.textContent = 'STANDBY';
    teleBadge.style.background = '';
    teleBadge.style.borderColor = '';
    teleBadge.style.color = '';

    zoneCards.innerHTML = '';
    const w = canvas._w;
    const h = canvas._h;
    ctx.clearRect(0, 0, w, h);
    presetBtns.forEach(b => b.classList.remove('active'));
    showToast('[FLUSH] Biometric cache cleared — all metrics zeroed', '#8892a8');
  }

  /* ─── EVENT BINDINGS ─── */
  sliderIntensity.addEventListener('input', function() {
    valIntensity.textContent = this.value;
  });

  [inputAge, inputRest].forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') btnCompute.click();
    });
    el.addEventListener('input', function() { this.classList.remove('err'); hideAlert(); });
  });

  btnCompute.addEventListener('click', compute);
  btnStress.addEventListener('click', injectStress);
  btnFlush.addEventListener('click', flushAll);

  window.addEventListener('resize', () => { resizeCanvas(); if (CACHE.hrmax) drawCanvas(); });

  /* ─── TOASTS ─── */
  function showToast(msg, color) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    if (color) el.style.borderLeft = '3px solid ' + color;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('leave');
      setTimeout(() => { if (el.parentNode) el.remove(); }, 250);
    }, 3500);
  }

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    compute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
