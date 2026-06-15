(function () {
  'use strict';

  /* === SPECIES DATABASE === */
  const speciesDB = [
    { name: 'White Oak', gf: 5.0 },
    { name: 'Red Maple', gf: 4.5 },
    { name: 'Giant Sequoia', gf: 1.5 },
    { name: 'American Beech', gf: 6.0 },
    { name: 'Pin Oak', gf: 3.0 },
    { name: 'Sugar Maple', gf: 5.5 },
    { name: 'Douglas Fir', gf: 2.0 },
    { name: 'Eastern White Pine', gf: 5.0 }
  ];

  /* === DOM REFS === */
  const circInput = document.getElementById('circInput');
  const circUnit = document.getElementById('circUnit');
  const unitBtns = document.querySelectorAll('.toggle-btn');
  const speciesSelect = document.getElementById('speciesSelect');
  const btnGenerate = document.getElementById('btnGenerate');
  const btnReset = document.getElementById('btnReset');
  const ringsCanvas = document.getElementById('ringsCanvas');
  const graphCanvas = document.getElementById('graphCanvas');
  const controlPanel = document.getElementById('controlPanel');
  const inputWrapper = document.getElementById('inputWrapper');
  const inputError = document.getElementById('inputError');
  const inputHint = document.getElementById('inputHint');

  const valDiameter = document.getElementById('valDiameter');
  const valAge = document.getElementById('valAge');
  const valCarbon = document.getElementById('valCarbon');
  const valStage = document.getElementById('valStage');

  const ctxRings = ringsCanvas.getContext('2d');
  const ctxGraph = graphCanvas.getContext('2d');

  let unit = 'in';

  /* === UNIT TOGGLE === */
  unitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      unitBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      unit = btn.dataset.unit;
      circUnit.textContent = unit;
      if (circInput.value.trim()) {
        const val = parseFloat(circInput.value);
        if (!isNaN(val) && val > 0) {
          if (unit === 'cm') {
            circInput.value = (val / 2.54).toFixed(1);
          } else {
            circInput.value = (val * 2.54).toFixed(1);
          }
        }
      }
    });
  });

  /* === CALCULATION ENGINE === */
  function calcDiameter(circumferenceIn) {
    return circumferenceIn / Math.PI;
  }

  function calcAge(diameterIn, growthFactor) {
    return diameterIn * growthFactor;
  }

  function calcCarbon(diameterIn, ageYears) {
    const dbhCm = diameterIn * 2.54;
    const biomass = 0.0574 * Math.pow(dbhCm, 2.3) * Math.pow(ageYears / 100, 0.65);
    const carbonKg = biomass * 0.47;
    return carbonKg;
  }

  function getLifecycleStage(age) {
    if (age <= 0) return '—';
    if (age < 10) return 'Seedling';
    if (age < 30) return 'Sapling';
    if (age < 60) return 'Young Mature';
    if (age < 120) return 'Mature';
    if (age < 200) return 'Old Growth';
    return 'Ancient';
  }

  /* === VALIDATION === */
  let isError = false;

  function clearError() {
    isError = false;
    controlPanel.classList.remove('error', 'shake');
    circInput.classList.remove('error');
    inputError.classList.remove('show');
  }

  function showError() {
    isError = true;
    controlPanel.classList.add('error', 'shake');
    circInput.classList.add('error');
    inputError.classList.add('show');
    setTimeout(() => controlPanel.classList.remove('shake'), 500);
  }

  function validateInput(val) {
    if (val.trim() === '') {
      showError();
      return false;
    }
    const num = parseFloat(val);
    if (isNaN(num)) {
      showError();
      return false;
    }
    if (num <= 0 || num > 1000) {
      showError();
      return false;
    }
    clearError();
    return true;
  }

  circInput.addEventListener('input', () => {
    if (isError) clearError();
  });

  /* === RINGS CANVAS === */
  function drawRings(ctx, width, height, age, diameterIn) {
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, width, height);

    const numRings = Math.max(Math.round(age / 2), 1);
    const ringSpacing = maxRadius / numRings;

    for (let i = numRings; i >= 0; i--) {
      const r = i * ringSpacing;
      const isLight = i % 2 === 0;
      const isHeartwood = i > numRings * 0.7;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);

      if (i === 0) {
        ctx.fillStyle = '#1a0f08';
        ctx.fill();
      } else {
        const darkness = isHeartwood ? 0.15 : 0;
        const lightness = isLight ? 0.25 : 0.1;
        ctx.fillStyle = `rgba(80, 50, 30, ${lightness + darkness})`;
        ctx.fill();
      }

      ctx.strokeStyle = isLight
        ? `rgba(160, 120, 80, ${0.3 + (i / numRings) * 0.3})`
        : `rgba(100, 65, 40, ${0.4 + (i / numRings) * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 0; i <= 3; i++) {
      const r = (maxRadius / 3) * i;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200, 160, 110, ${0.06 * (1 - i / 3)})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(cx - maxRadius - 10, cy);
    ctx.lineTo(cx + maxRadius + 10, cy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy - maxRadius - 10);
    ctx.lineTo(cx, cy + maxRadius + 10);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 255, 136, 0.25)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${age.toFixed(0)} years · ${numRings} ring pairs`, cx, height - 8);
  }

  /* === GRAPH CANVAS === */
  function drawGraph(ctx, width, height, age, diameterIn) {
    ctx.clearRect(0, 0, width, height);

    const pad = { top: 30, right: 20, bottom: 40, left: 50 };
    const graphW = width - pad.left - pad.right;
    const graphH = height - pad.top - pad.bottom;

    const maxAge = 200;
    const maxDiam = Math.max(diameterIn * 1.5, 20);

    /* Grid */
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = pad.left + (graphW / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + graphH);
      ctx.stroke();
    }
    for (let i = 0; i <= 8; i++) {
      const y = pad.top + (graphH / 8) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + graphW, y);
      ctx.stroke();
    }

    /* Axis labels */
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= 10; i++) {
      const year = (maxAge / 10) * i;
      const x = pad.left + (graphW / 10) * i;
      ctx.fillText(`${year}`, x, pad.top + graphH + 10);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const diam = (maxDiam / 4) * i;
      const y = pad.top + graphH - (graphH / 4) * i;
      ctx.fillText(`${diam.toFixed(1)}"`, pad.left - 8, y);
    }

    /* Axis titles */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.font = '7px "JetBrains Mono", monospace';
    ctx.fillText('YEARS', pad.left + graphW / 2, pad.top + graphH + 26);
    ctx.save();
    ctx.translate(12, pad.top + graphH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('DIAMETER (inches)', 0, 0);
    ctx.restore();

    /* Growth curve */
    const points = [];
    const actualAge = Math.min(age, maxAge);
    const maturityPoint = actualAge * 0.4;
    const matureDiam = diameterIn * 0.9;

    for (let t = 0; t <= maxAge; t += 1) {
      let diam;
      if (t <= maturityPoint) {
        diam = (diameterIn / maturityPoint) * t * 0.6;
      } else if (t <= actualAge * 0.8) {
        const progress = (t - maturityPoint) / (actualAge * 0.8 - maturityPoint);
        diam = matureDiam + (diameterIn - matureDiam) * Math.min(progress, 1);
      } else if (t <= actualAge) {
        const plateau = Math.max(0, 1 - (t - actualAge * 0.8) / (actualAge * 0.2));
        diam = diameterIn + (diameterIn * 0.05) * (1 - Math.pow(1 - plateau, 2));
      } else {
        const decay = Math.max(0, 1 - (t - actualAge) / (maxAge - actualAge));
        diam = diameterIn * (0.85 + 0.15 * decay);
      }
      const clamped = Math.min(diam, maxDiam);
      points.push({ t, diam: clamped });
    }

    /* Glow */
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + graphH);
    gradient.addColorStop(0, 'rgba(0, 255, 136, 0.08)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.02)');
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = pad.left + (p.t / maxAge) * graphW;
      const y = pad.top + graphH - (p.diam / maxDiam) * graphH;
      i === 0 ? ctx.moveTo(x, pad.top + graphH) : ctx.lineTo(x, y);
    });
    ctx.lineTo(pad.left + graphW, pad.top + graphH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    /* Line */
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = pad.left + (p.t / maxAge) * graphW;
      const y = pad.top + graphH - (p.diam / maxDiam) * graphH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0, 255, 136, 0.4)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* Actual age marker */
    const markerX = pad.left + (actualAge / maxAge) * graphW;
    ctx.beginPath();
    ctx.moveTo(markerX, pad.top);
    ctx.lineTo(markerX, pad.top + graphH);
    ctx.strokeStyle = 'rgba(255, 184, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 184, 0, 0.4)';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('◀ current', markerX, pad.top - 2);
  }

  /* === RENDER ALL === */
  function render(circumferenceIn) {
    const speciesVal = speciesSelect.value;
    const growthFactor = parseFloat(speciesVal);
    const diameterIn = calcDiameter(circumferenceIn);
    const age = calcAge(diameterIn, growthFactor);
    const carbonKg = calcCarbon(diameterIn, age);
    const stage = getLifecycleStage(age);

    valDiameter.textContent = `${diameterIn.toFixed(2)} ${unit === 'in' ? 'in' : 'cm'}`;
    valAge.textContent = `${age.toFixed(1)} years`;
    valCarbon.textContent = carbonKg > 0 ? `${carbonKg.toFixed(1)} kg` : '—';
    valStage.textContent = stage;

    const dpr = window.devicePixelRatio || 1;
    const rect1 = ringsCanvas.getBoundingClientRect();
    const size = Math.min(rect1.width || 476, 476);
    ringsCanvas.width = size * dpr;
    ringsCanvas.height = size * dpr;
    ringsCanvas.style.width = size + 'px';
    ringsCanvas.style.height = size + 'px';
    ctxRings.scale(dpr, dpr);

    const rect2 = graphCanvas.getBoundingClientRect();
    const size2 = Math.min(rect2.width || 476, 476);
    graphCanvas.width = size2 * dpr;
    graphCanvas.height = size2 * dpr;
    graphCanvas.style.width = size2 + 'px';
    graphCanvas.style.height = size2 + 'px';
    ctxGraph.scale(dpr, dpr);

    drawRings(ctxRings, size, size, age, diameterIn);
    drawGraph(ctxGraph, size2, size2, age, diameterIn);
  }

  /* === ACTION: GENERATE === */
  function handleGenerate() {
    const val = circInput.value;
    if (!validateInput(val)) return;

    const circumferenceIn = unit === 'cm' ? parseFloat(val) / 2.54 : parseFloat(val);
    render(circumferenceIn);
  }

  /* === ACTION: RESET === */
  function handleReset() {
    circInput.value = '';
    clearError();

    valDiameter.textContent = '—';
    valAge.textContent = '—';
    valCarbon.textContent = '—';
    valStage.textContent = '—';

    const dpr = window.devicePixelRatio || 1;
    const size = 476;
    ringsCanvas.width = size * dpr;
    ringsCanvas.height = size * dpr;
    ringsCanvas.style.width = size + 'px';
    ringsCanvas.style.height = size + 'px';
    ctxRings.scale(dpr, dpr);
    ctxRings.clearRect(0, 0, size, size);

    graphCanvas.width = size * dpr;
    graphCanvas.height = size * dpr;
    graphCanvas.style.width = size + 'px';
    graphCanvas.style.height = size + 'px';
    ctxGraph.scale(dpr, dpr);
    ctxGraph.clearRect(0, 0, size, size);

    unitBtns.forEach(b => b.classList.remove('active'));
    unitBtns[0].classList.add('active');
    unit = 'in';
    circUnit.textContent = 'in';
    speciesSelect.selectedIndex = 0;
  }

  /* === EVENT BINDING === */
  btnGenerate.addEventListener('click', handleGenerate);

  btnReset.addEventListener('click', handleReset);

  circInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleGenerate();
  });

  /* === RESIZE HANDLER === */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (circInput.value.trim() && !isError) {
        const val = parseFloat(circInput.value);
        if (!isNaN(val) && val > 0) {
          const circumferenceIn = unit === 'cm' ? val / 2.54 : val;
          render(circumferenceIn);
        }
      }
    }, 300);
  });

  /* === INITIAL DRAW === */
  (function init() {
    const dpr = window.devicePixelRatio || 1;
    const size = 476;
    ringsCanvas.width = size * dpr;
    ringsCanvas.height = size * dpr;
    ringsCanvas.style.width = size + 'px';
    ringsCanvas.style.height = size + 'px';
    ctxRings.scale(dpr, dpr);
    drawRings(ctxRings, size, size, 0, 0);

    graphCanvas.width = size * dpr;
    graphCanvas.height = size * dpr;
    graphCanvas.style.width = size + 'px';
    graphCanvas.style.height = size + 'px';
    ctxGraph.scale(dpr, dpr);
    drawGraph(ctxGraph, size, size, 0, 0);
  })();

})();
