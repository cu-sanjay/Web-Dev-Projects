(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#emissionsCanvas');
  const ctx = canvas.getContext('2d');
  const distSlider = $('#distSlider');
  const distVal = $('#distVal');
  const passSlider = $('#passSlider');
  const passVal = $('#passVal');
  const fuelSlider = $('#fuelSlider');
  const fuelVal = $('#fuelVal');
  const seqContent = $('#seqContent');
  const tDist = $('#tDist');
  const tCarbon = $('#tCarbon');
  const tTrees = $('#tTrees');
  const tSubsidy = $('#tSubsidy');
  const tBadge = $('#tBadge');
  const btnCompute = $('#btnCompute');
  const btnSubsidy = $('#btnSubsidy');
  const btnFlush = $('#btnFlush');
  const presetBtns = $$('.preset-btn');

  let subsidyActive = false;

  const MODES = [
    { id:'cycle', label:'CYCLING', ef:0, color:'#00e676' },
    { id:'bus', label:'ELECTRIC BUS', ef:45, color:'#ffc800' },
    { id:'rail', label:'URBAN TRANSIT RAIL', ef:28, color:'#ff8800' },
    { id:'sedan', label:'GAS SEDAN CAR', ef:171, color:'#ff1744' }
  ];

  /* ─── CANVAS ─── */
  let cw = 0, ch = 0;

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 500;
    const h = wrap.clientHeight || 220;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    cw = w;
    ch = h;
  }

  /* ─── COMPUTE ─── */
  function computeEmissions() {
    const d = parseFloat(distSlider.value);
    const p = parseInt(passSlider.value, 10);
    const fuel = parseFloat(fuelSlider.value);
    const mult = subsidyActive ? 0.8 : 1;

    return MODES.map(m => {
      const raw = (d * m.ef * mult) / (p * 1000);
      return { ...m, kg: raw, gPerPax: (m.ef * mult) / p };
    });
  }

  /* ─── DRAW ─── */
  function drawChart(results) {
    const w = cw, h = ch;
    ctx.clearRect(0, 0, w, h);
    if (!w || !h) return;

    const pad = { t: 10, b: 24, l: 130, r: 20 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;
    const barH = Math.min(chartH / results.length * 0.6, 24);
    const gap = chartH / results.length;

    const maxKg = Math.max(0.1, ...results.map(r => r.kg));

    results.forEach((r, i) => {
      const frac = r.kg / maxKg;
      const bx = pad.l;
      const by = pad.t + gap * i + (gap - barH) / 2;
      const bw = Math.max(2, frac * chartW);

      /* bar */
      let barColor = r.color;
      if (r.kg === 0) barColor = '#00e676';
      else if (r.kg > 15) barColor = '#ff1744';

      ctx.fillStyle = barColor;
      ctx.globalAlpha = r.kg > 15 ? (0.6 + 0.4 * Math.sin(performance.now() / 200)) : 0.5;
      ctx.fillRect(bx, by, bw, barH);
      ctx.globalAlpha = 1;

      /* zero-emission glow */
      if (r.kg === 0) {
        ctx.shadowColor = '#00e676';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = '#00e676';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, barH);
        ctx.shadowBlur = 0;
      }

      /* label */
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = 'clamp(5px,0.55vmin,7px) "JetBrains Mono",monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(r.label, pad.l - 8, by + barH / 2);

      /* value */
      ctx.fillStyle = r.kg > 15 ? '#ff1744' : 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const valText = r.kg < 0.01 ? '0 kg' : r.kg.toFixed(2) + ' kg';
      ctx.fillText(valText, bx + bw + 6, by + barH / 2);
    });
  }

  /* ─── SEQUESTRATION ─── */
  function renderSequestration(results) {
    const totalCO2 = results.reduce((s, r) => s + r.kg, 0);
    const treeDays = totalCO2 > 0 ? (totalCO2 / 22 * 365) : 0;

    if (totalCO2 === 0) {
      seqContent.innerHTML = '<div class="seq-line">[ZERO EMISSION ROUTE] <span class="sq-highlight">No sequestration required.</span></div>';
      return;
    }

    const treesNeeded = totalCO2 / 22;
    const yearlyOffset = treesNeeded;
    const monthsToOffset = treeDays / 30;

    let html = '';
    html += '<div class="seq-line">Total emissions: <span class="sq-highlight">' + totalCO2.toFixed(2) + ' kg CO₂</span></div>';
    html += '<div class="seq-line">Trees needed to offset: <span class="sq-highlight">' + treesNeeded.toFixed(1) + '</span> (@ 22 kg/tree/yr)</div>';
    html += '<div class="seq-line">Tree-days to full sequestration: <span class="sq-highlight">' + treeDays.toFixed(0) + '</span></div>';
    html += '<div class="seq-line">Equivalent months: <span class="sq-highlight">' + monthsToOffset.toFixed(1) + '</span></div>';
    seqContent.innerHTML = html;
  }

  /* ─── TELEMETRY ─── */
  function updateTelemetry(results) {
    const d = parseFloat(distSlider.value);
    const p = parseInt(passSlider.value, 10);
    const totalCO2 = results.reduce((s, r) => s + r.kg, 0);
    const treeDays = totalCO2 > 0 ? (totalCO2 / 22 * 365) : 0;

    tDist.textContent = d + ' km × ' + p + ' pax';
    tCarbon.textContent = totalCO2.toFixed(2) + ' kg';
    tTrees.textContent = treeDays.toFixed(0);
    tSubsidy.textContent = subsidyActive ? 'ACTIVE (-20%)' : 'OFF';
    tSubsidy.style.color = subsidyActive ? '#00e676' : 'rgba(255,255,255,0.3)';

    /* eco badge */
    const cycleResult = results.find(r => r.id === 'cycle');
    const sedanResult = results.find(r => r.id === 'sedan');
    if (cycleResult && cycleResult.kg === 0 && results.every(r => r.kg < 1)) {
      tBadge.className = 'tele-badge optimal';
      tBadge.textContent = 'EMISSION_FREE OPTIMAL';
    } else if (sedanResult && sedanResult.kg > 15) {
      tBadge.className = 'tele-badge critical';
      tBadge.textContent = 'CRITICAL CARBON DEGRADATION TRACKED';
    } else if (totalCO2 > 5) {
      tBadge.className = 'tele-badge moderate';
      tBadge.textContent = 'MODERATE FOOTPRINT — IMPROVEMENT AVAILABLE';
    } else {
      tBadge.className = 'tele-badge optimal';
      tBadge.textContent = 'LOW IMPACT TRANSIT SCORE';
    }
  }

  /* ─── COMPUTE ALL ─── */
  function computeAll() {
    const results = computeEmissions();
    drawChart(results);
    renderSequestration(results);
    updateTelemetry(results);
  }

  /* ─── PRESETS ─── */
  presetBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      presetBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const d = parseInt(this.dataset.d, 10);
      const p = parseInt(this.dataset.p, 10);
      distSlider.value = d;
      distVal.textContent = d + ' km';
      passSlider.value = p;
      passVal.textContent = p;
      computeAll();
    });
  });

  /* ─── SUBSIDY ─── */
  btnSubsidy.addEventListener('click', function() {
    subsidyActive = !subsidyActive;
    computeAll();
  });

  /* ─── COMPUTE ─── */
  btnCompute.addEventListener('click', computeAll);

  /* ─── FLUSH ─── */
  btnFlush.addEventListener('click', function() {
    distSlider.value = 25; distVal.textContent = '25 km';
    passSlider.value = 1; passVal.textContent = '1';
    fuelSlider.value = 1.5; fuelVal.textContent = '$1.50';
    subsidyActive = false;
    presetBtns.forEach(b => b.classList.remove('active'));
    seqContent.innerHTML = '<div class="seq-empty">ADJUST PARAMETERS TO COMPUTE</div>';
    tDist.textContent = '--';
    tCarbon.textContent = '--';
    tTrees.textContent = '--';
    tSubsidy.textContent = 'OFF';
    tSubsidy.style.color = 'rgba(255,255,255,0.3)';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
    ctx.clearRect(0, 0, cw, ch);
    const w = cw, h = ch;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.font = 'clamp(7px,0.8vmin,10px) "JetBrains Mono",monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADJUST PARAMETERS TO COMPUTE', w / 2, h / 2);
  });

  /* ─── SLIDER EVENTS ─── */
  distSlider.addEventListener('input', function() {
    distVal.textContent = this.value + ' km';
    presetBtns.forEach(b => b.classList.remove('active'));
  });
  passSlider.addEventListener('input', function() {
    passVal.textContent = this.value;
    presetBtns.forEach(b => b.classList.remove('active'));
  });
  fuelSlider.addEventListener('input', function() {
    fuelVal.textContent = '$' + parseFloat(this.value).toFixed(2);
    presetBtns.forEach(b => b.classList.remove('active'));
  });

  /* ─── RESIZE ─── */
  let resizeTm;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTm);
    resizeTm = setTimeout(() => { resizeCanvas(); computeAll(); }, 100);
  });

  /* ─── ANIMATION LOOP ─── */
  let animFrame = 0;
  function animLoop() {
    animFrame++;
    /* only redraw chart periodically for the crimson pulse effect */
    const results = computeEmissions();
    const hasCritical = results.some(r => r.kg > 15);
    if (hasCritical && animFrame % 3 === 0) {
      drawChart(results);
    }
    requestAnimationFrame(animLoop);
  }

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    computeAll();
    animLoop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
