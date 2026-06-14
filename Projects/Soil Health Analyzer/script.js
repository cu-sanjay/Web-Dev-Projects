(function () {
  'use strict';

  /* ============================================================
     SOIL PRESETS
     ============================================================ */
  const PRESETS = {
    loam:  { ph: 6.5, moisture: 45, n: 40, p: 30, k: 35 },
    clay:  { ph: 5.2, moisture: 55, n: 25, p: 15, k: 20 },
    sandy: { ph: 8.0, moisture: 12, n: 10, p: 8,  k: 12 }
  };

  const SATURATED = { ph: 6.8, moisture: 85, n: 70, p: 55, k: 80 };

  /* ============================================================
     CROP REQUIREMENTS
     ============================================================ */
  const CROPS = [
    {
      name: 'Rice', icon: '🌾',
      phMin: 5.5, phMax: 7.0, moistureMin: 60, moistureMax: 80,
      nMin: 40, nMax: 60, pMin: 20, pMax: 35, kMin: 25, kMax: 40
    },
    {
      name: 'Wheat', icon: '🌿',
      phMin: 6.0, phMax: 7.5, moistureMin: 40, moistureMax: 60,
      nMin: 50, nMax: 70, pMin: 25, pMax: 40, kMin: 30, kMax: 45
    },
    {
      name: 'Potatoes', icon: '🥔',
      phMin: 5.0, phMax: 6.5, moistureMin: 50, moistureMax: 70,
      nMin: 30, nMax: 50, pMin: 30, pMax: 50, kMin: 40, kMax: 60
    },
    {
      name: 'Tomatoes', icon: '🍅',
      phMin: 6.0, phMax: 7.0, moistureMin: 50, moistureMax: 70,
      nMin: 40, nMax: 60, pMin: 30, pMax: 45, kMin: 45, kMax: 65
    }
  ];

  /* ============================================================
     STATE
     ============================================================ */
  let state = {
    ph: 7.0, moisture: 35, n: 30, p: 25, k: 30
  };

  const EARTH = '🌍';

  /* ============================================================
     DOM REFS
     ============================================================ */
  const $ = id => document.getElementById(id);

  const slPh = $('slPh'), slMoisture = $('slMoisture'), slN = $('slN'), slP = $('slP'), slK = $('slK');
  const valPh = $('valPh'), valMoisture = $('valMoisture'), valN = $('valN'), valP = $('valP'), valK = $('valK');
  const zonePh = $('zonePh'), zoneMoisture = $('zoneMoisture');
  const scoreVal = $('scoreVal'), gradeVal = $('gradeVal'), statusVal = $('statusVal');
  const chipScore = $('chipScore'), chipGrade = $('chipGrade'), chipStatus = $('chipStatus');
  const cropGrid = $('cropGrid'), telemetryBody = $('telemetryBody');
  const canvas = $('npkCanvas'), ctx = canvas.getContext('2d');
  const vizHint = $('vizHint'), alertBanner = $('alertBanner');
  const toastContainer = $('toastContainer');
  const btnExecute = $('btnExecute'), btnSaturated = $('btnSaturated');
  const btnFlush = $('btnFlush'), btnFlushFooter = $('btnFlushFooter');
  const inputBody = $('inputBody');

  /* ============================================================
     PH CLASSIFICATION
     ============================================================ */
  function classifyPH(ph) {
    if (ph < 5.0) return { label: 'Strongly Acidic', color: '#ff1744' };
    if (ph < 5.5) return { label: 'Moderately Acidic', color: '#ff6d00' };
    if (ph < 6.0) return { label: 'Slightly Acidic', color: '#ffb800' };
    if (ph <= 7.5) return { label: 'Optimal Near-Neutral', color: '#00e676' };
    if (ph <= 8.5) return { label: 'Moderately Alkaline', color: '#ffb800' };
    return { label: 'Alkaline Alum Hazard', color: '#ff1744' };
  }

  function classifyMoisture(m) {
    if (m < 15) return { label: 'Arid / Drought', color: '#ff1744' };
    if (m < 30) return { label: 'Dry', color: '#ff6d00' };
    if (m < 55) return { label: 'Moderate', color: '#ffb800' };
    if (m < 75) return { label: 'Moist', color: '#00e676' };
    return { label: 'Saturated / Waterlogged', color: '#00e5ff' };
  }

  /* ============================================================
     SCORING ENGINE
     ============================================================ */
  function calcSoilScore(ph, moisture, n, p, k) {
    // pH score: distance from ideal 6.5, scaled
    const phDev = Math.abs(ph - 6.5);
    let phScore = 0;
    if (phDev <= 0.5) phScore = 25;
    else if (phDev <= 1.0) phScore = 20;
    else if (phDev <= 1.5) phScore = 15;
    else if (phDev <= 2.0) phScore = 10;
    else if (phDev <= 3.0) phScore = 5;
    else phScore = 0;

    // Moisture score: ideal 40-60%
    let mScore = 0;
    if (moisture >= 40 && moisture <= 60) mScore = 25;
    else if (moisture >= 30 && moisture < 40) mScore = 18;
    else if (moisture > 60 && moisture <= 75) mScore = 18;
    else if (moisture >= 20 && moisture < 30) mScore = 12;
    else if (moisture > 75 && moisture <= 85) mScore = 10;
    else mScore = 4;

    // NPK scores: ideal ranges
    const nScore = scoreNPK(n, 40, 60, 'n');
    const pScore = scoreNPK(p, 25, 40, 'p');
    const kScore = scoreNPK(k, 35, 55, 'k');

    const total = phScore + mScore + nScore + pScore + kScore;
    const pct = Math.round((total / 100) * 100);

    // Organic matter grade
    let grade, gradeColor;
    if (pct >= 80) { grade = 'A — Rich Loam'; gradeColor = '#00e676'; }
    else if (pct >= 65) { grade = 'B — Fertile'; gradeColor = '#00e676'; }
    else if (pct >= 50) { grade = 'C — Moderate'; gradeColor = '#ffb800'; }
    else if (pct >= 35) { grade = 'D — Degraded'; gradeColor = '#ff6d00'; }
    else { grade = 'F — Barren'; gradeColor = '#ff1744'; }

    // Chemical stress
    let stress, stressColor;
    if (pct >= 75) { stress = 'None — Stable'; stressColor = '#00e676'; }
    else if (pct >= 55) { stress = 'Low — Monitor'; stressColor = '#ffb800'; }
    else if (pct >= 35) { stress = 'Moderate — Amend'; stressColor = '#ff6d00'; }
    else { stress = 'Severe — Immediate Remediation Required'; stressColor = '#ff1744'; }

    // Compatibility verdict
    let verdict, verdictColor;
    const best = findBestCrop(ph, moisture, n, p, k);
    if (best.pct >= 75) { verdict = best.name + ' — HIGHLY COMPATIBLE'; verdictColor = '#00e676'; }
    else if (best.pct >= 50) { verdict = best.name + ' — MARGINAL FIT'; verdictColor = '#ffb800'; }
    else { verdict = 'No Crop Suitability — AMEND SOIL'; verdictColor = '#ff1744'; }

    return {
      score: pct, scoreColor: pct >= 50 ? '#00e676' : pct >= 35 ? '#ffb800' : '#ff1744',
      grade, gradeColor, stress, stressColor, verdict, verdictColor
    };
  }

  function scoreNPK(val, idealMin, idealMax, key) {
    if (val >= idealMin && val <= idealMax) return 20;
    const idealMid = (idealMin + idealMax) / 2;
    const maxDev = idealMin; // treat 2× ideal as zero
    const dev = Math.abs(val - idealMid);
    if (dev <= idealMid * 0.3) return 15;
    if (dev <= idealMid * 0.5) return 10;
    if (dev <= idealMid * 0.7) return 5;
    return Math.max(0, 20 - (dev / maxDev) * 20);
  }

  /* ============================================================
     CROP COMPATIBILITY
     ============================================================ */
  function calcCropCompat(crop, ph, moisture, n, p, k) {
    let total = 0, count = 5;
    total += calcParamFit(ph, crop.phMin, crop.phMax);
    total += calcParamFit(moisture, crop.moistureMin, crop.moistureMax);
    total += calcParamFit(n, crop.nMin, crop.nMax);
    total += calcParamFit(p, crop.pMin, crop.pMax);
    total += calcParamFit(k, crop.kMin, crop.kMax);
    return Math.round((total / count) * 100);
  }

  function calcParamFit(val, min, max) {
    if (val >= min && val <= max) return 100;
    const mid = (min + max) / 2;
    const range = max - min;
    const dev = Math.abs(val - mid);
    if (dev <= range) return 100 - (dev / range) * 40;
    if (dev <= range * 2) return 60 - ((dev - range) / range) * 40;
    return Math.max(0, 20 - ((dev - range * 2) / range) * 20);
  }

  function findBestCrop(ph, moisture, n, p, k) {
    let best = { name: '', pct: 0 };
    CROPS.forEach(c => {
      const pct = calcCropCompat(c, ph, moisture, n, p, k);
      if (pct > best.pct) best = { name: c.name, pct };
    });
    return best;
  }

  /* ============================================================
     CANVAS NPK BAR CHART
     ============================================================ */
  function sizeCanvas() {
    const wrap = canvas.parentElement;
    const w = Math.min(wrap.clientWidth - 4, 700);
    const h = Math.max(180, Math.round(w * 0.3));
    canvas.width = w; canvas.height = h;
    return { w, h };
  }

  function drawNPKBars(n, p, k) {
    const { w, h } = sizeCanvas();
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#080b16';
    ctx.fillRect(0, 0, w, h);

    const bars = [
      { label: 'N (mg/kg)', val: n, max: 120, color: '#ff6d00', ideal: [40, 60] },
      { label: 'P (mg/kg)', val: p, max: 100, color: '#00e5ff', ideal: [25, 40] },
      { label: 'K (mg/kg)', val: k, max: 150, color: '#ffb800', ideal: [35, 55] }
    ];

    const padL = 50, padR = 30, padT = 20, padB = 25;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    const barW = chartW / bars.length * 0.55;
    const gap = chartW / bars.length;

    // Y-axis
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let v = 0; v <= 100; v += 25) {
      const y = padT + chartH - (v / 100) * chartH;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = '#4a5268';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(v + '%', padL - 5, y);
    }

    bars.forEach((bar, i) => {
      const x = padL + gap * i + (gap - barW) / 2;
      const pct = Math.min(bar.val / bar.max, 1);
      const barH = pct * chartH;
      const y = padT + chartH - barH;

      // Ideal zone highlight
      const idealLow = (bar.ideal[0] / bar.max) * chartH;
      const idealHigh = (bar.ideal[1] / bar.max) * chartH;
      ctx.fillStyle = 'rgba(0,230,118,0.06)';
      ctx.fillRect(x, padT + chartH - idealHigh, barW, idealHigh - idealLow);
      ctx.strokeStyle = 'rgba(0,230,118,0.15)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(x, padT + chartH - idealHigh);
      ctx.lineTo(x + barW, padT + chartH - idealHigh);
      ctx.moveTo(x, padT + chartH - idealLow);
      ctx.lineTo(x + barW, padT + chartH - idealLow);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bar
      const grad = ctx.createLinearGradient(0, padT + chartH, 0, y);
      grad.addColorStop(0, bar.color + '60');
      grad.addColorStop(1, bar.color);
      ctx.fillStyle = grad;
      ctx.shadowColor = bar.color + '40';
      ctx.shadowBlur = 6;
      ctx.fillRect(x, y, barW, barH);
      ctx.shadowBlur = 0;

      // Value on top
      ctx.fillStyle = bar.color;
      ctx.font = '6px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(bar.val.toFixed(0), x + barW / 2, y - 3);

      // Label below
      ctx.fillStyle = '#4a5268';
      ctx.textBaseline = 'top';
      ctx.fillText(bar.label, x + barW / 2, padT + chartH + 4);
    });

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('NPK Macronutrient Profile — Target zones (dashed)', 10, 4);
  }

  /* ============================================================
     UPDATE UI
     ============================================================ */
  function updateAll() {
    const { ph, moisture, n, p, k } = state;

    // Update displays
    valPh.textContent = ph.toFixed(1);
    valMoisture.textContent = moisture;
    valN.textContent = n;
    valP.textContent = p;
    valK.textContent = k;

    // Zone labels
    const phClass = classifyPH(ph);
    zonePh.textContent = phClass.label;
    zonePh.style.color = phClass.color;
    slPh.style.background = `linear-gradient(to right, #ff1744 0%, ${phClass.color} 50%, #ff1744 100%)`;
    slPh.style.opacity = '0.5';

    const mClass = classifyMoisture(moisture);
    zoneMoisture.textContent = mClass.label;
    zoneMoisture.style.color = mClass.color;

    // Score
    const result = calcSoilScore(ph, moisture, n, p, k);
    scoreVal.textContent = result.score + '%';
    scoreVal.style.color = result.scoreColor;
    chipScore.style.borderColor = result.scoreColor + '33';

    gradeVal.textContent = result.grade;
    gradeVal.style.color = result.gradeColor;
    chipGrade.style.borderColor = result.gradeColor + '33';

    statusVal.textContent = result.stress;
    statusVal.style.color = result.stressColor;
    chipStatus.style.borderColor = result.stressColor + '33';
    chipStatus.style.color = result.stressColor;

    // Canvas
    drawNPKBars(n, p, k);
    vizHint.textContent = 'NPK · ' + result.score + '%';

    // Crop cards
    renderCrops(ph, moisture, n, p, k);

    // Telemetry
    renderTelemetry(result);

    // Top bar badge
    $('topBadge').textContent = 'SOIL ' + result.score + '% · ' + result.grade.charAt(0);
    $('topBadge').style.color = result.gradeColor;
    $('topBadge').style.borderColor = result.gradeColor + '33';
  }

  /* ============================================================
     CROP CARDS
     ============================================================ */
  function renderCrops(ph, moisture, n, p, k) {
    cropGrid.innerHTML = '';
    CROPS.forEach(crop => {
      const pct = calcCropCompat(crop, ph, moisture, n, p, k);
      const cls = pct >= 70 ? 'compatible' : pct >= 45 ? 'marginal' : 'poor';
      const color = pct >= 70 ? '#00e676' : pct >= 45 ? '#ffb800' : '#ff1744';
      const status = pct >= 75 ? 'OPTIMAL' : pct >= 50 ? 'MARGINAL' : 'POOR FIT';

      const card = document.createElement('div');
      card.className = 'crop-card ' + cls;
      card.innerHTML = `
        <div class="cc-top">
          <span class="cc-name">${crop.icon} ${crop.name}</span>
          <span class="cc-pct" style="color:${color}">${pct}%</span>
        </div>
        <div class="cc-bar"><div class="cc-fill" style="width:${pct}%;background:${color}"></div></div>
        <div class="cc-status">${status}</div>
      `;
      cropGrid.appendChild(card);
    });
  }

  /* ============================================================
     TELEMETRY
     ============================================================ */
  function renderTelemetry(r) {
    telemetryBody.innerHTML = `
      <div class="tm-card" style="border-color:${r.scoreColor}33">
        <div class="tm-label">Calculated Overall Soil Health Score</div>
        <div class="tm-value" style="color:${r.scoreColor}">${r.score}%</div>
        <div class="tm-sub">${r.score >= 50 ? 'PASS' : 'FAIL'} — ${r.score >= 80 ? 'Excellent growing conditions' : r.score >= 50 ? 'Adequate for select crops' : 'Requires amendment'}</div>
      </div>
      <div class="tm-card grade" style="border-color:${r.gradeColor}33">
        <div class="tm-label">Organic Matter Quality Grade</div>
        <div class="tm-value" style="color:${r.gradeColor}">${r.grade}</div>
      </div>
      <div class="tm-card" style="border-color:${r.stressColor}33">
        <div class="tm-label">Active Chemical Stress Category</div>
        <div class="tm-value" style="color:${r.stressColor};font-size:13px">${r.stress}</div>
      </div>
      <div class="tm-card" style="border-color:${r.verdictColor}33">
        <div class="tm-label">Crop Compatibility Verdict</div>
        <div class="tm-value" style="color:${r.verdictColor};font-size:12px">${r.verdict}</div>
      </div>
    `;
  }

  /* ============================================================
     LOAD PRESET
     ============================================================ */
  function loadPreset(key) {
    const p = PRESETS[key];
    if (!p) return;
    state.ph = p.ph; state.moisture = p.moisture;
    state.n = p.n; state.p = p.p; state.k = p.k;
    syncSliders();
    updateAll();
    showToast('🌱 Loaded profile: ' + key.charAt(0).toUpperCase() + key.slice(1), 2000);
  }

  function loadSaturated() {
    const s = SATURATED;
    state.ph = s.ph; state.moisture = s.moisture;
    state.n = s.n; state.p = s.p; state.k = s.k;
    syncSliders();
    updateAll();
    showToast('💧 Saturated soil matrix loaded. High moisture content.', 2500);
  }

  function syncSliders() {
    slPh.value = state.ph;
    slMoisture.value = state.moisture;
    slN.value = state.n;
    slP.value = state.p;
    slK.value = state.k;
  }

  /* ============================================================
     FLUSH / EXECUTE
     ============================================================ */
  function flushCache() {
    state.ph = 7.0; state.moisture = 35;
    state.n = 30; state.p = 25; state.k = 30;
    syncSliders();
    updateAll();
    showToast('♻️ Analytical cache flushed. Parameters returned to standby baseline.', 2500);
  }

  function executeRun() {
    updateAll();
    showToast('🔬 Biochemical matrix analysis complete. Results updated.', 2000);
  }

  /* ============================================================
     VALIDATION
     ============================================================ */
  function validateInputs() {
    const inputs = [slPh, slMoisture, slN, slP, slK];
    let valid = true;
    inputs.forEach(sl => {
      const val = parseFloat(sl.value);
      if (isNaN(val) || sl.value.trim() === '') {
        sl.style.borderColor = '#ff1744';
        valid = false;
      } else {
        sl.style.borderColor = '';
      }
    });
    if (!valid) {
      alertBanner.classList.remove('hidden');
      alertBanner.textContent = '⚠️ INVALID INPUT DETECTED: All parameters must be numeric values within range. Adjust and retry.';
      inputBody.classList.add('shake');
      setTimeout(() => inputBody.classList.remove('shake'), 350);
    } else {
      alertBanner.classList.add('hidden');
    }
    return valid;
  }

  /* ============================================================
     TOAST
     ============================================================ */
  function showToast(msg, duration) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('leave');
      setTimeout(() => el.remove(), 250);
    }, duration || 2500);
  }

  /* ============================================================
     EVENT BINDING
     ============================================================ */
  // Slider inputs
  slPh.addEventListener('input', () => { state.ph = parseFloat(slPh.value); updateAll(); });
  slMoisture.addEventListener('input', () => { state.moisture = parseInt(slMoisture.value); updateAll(); });
  slN.addEventListener('input', () => { state.n = parseInt(slN.value); updateAll(); });
  slP.addEventListener('input', () => { state.p = parseInt(slP.value); updateAll(); });
  slK.addEventListener('input', () => { state.k = parseInt(slK.value); updateAll(); });

  // Text input validation (prevent non-numeric)
  [slPh, slMoisture, slN, slP, slK].forEach(sl => {
    sl.addEventListener('keydown', (e) => {
      if (e.key.match(/[a-zA-Z]/)) {
        e.preventDefault();
        sl.style.borderColor = '#ff1744';
        setTimeout(() => sl.style.borderColor = '', 500);
      }
    });
  });

  // Preset buttons
  document.querySelectorAll('.preset-btn[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => loadPreset(btn.dataset.preset));
  });

  btnExecute.addEventListener('click', () => { if (validateInputs()) executeRun(); });
  btnSaturated.addEventListener('click', () => { if (validateInputs()) loadSaturated(); });
  btnFlush.addEventListener('click', flushCache);
  btnFlushFooter.addEventListener('click', flushCache);

  /* ============================================================
     RESIZE
     ============================================================ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => drawNPKBars(state.n, state.p, state.k), 100);
  });

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    // Set sliders to default state values
    syncSliders();
    updateAll();
    showToast(EARTH + ' Soil Health Analyzer initialized. Adjust parameters to begin.', 3000);
  }

  init();

})();
