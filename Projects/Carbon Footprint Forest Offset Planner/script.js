(function () {
  'use strict';

  /* === CARBON MULTIPLIER DICTIONARY === */
  const FACTORS = {
    transport: 0.21,      // kg CO₂ per km
    electricity: 0.85,    // kg CO₂ per kWh
    diet: { min: 0.5, max: 4.0 }, // kg CO₂ per day (vegan → heavy meat)
    aviation: 510         // kg CO₂ per trip (avg 2000km × 0.255)
  };
  const TREE_ABSORPTION = 22; // kg CO₂ / tree / year
  const CANOPY_PER_TREE = 20; // sq m

  /* === STATE === */
  let lastResult = null;

  /* === DOM REFS === */
  const refs = {
    sliderTransport: document.getElementById('sliderTransport'),
    numTransport: document.getElementById('numTransport'),
    subTransport: document.getElementById('subTransport'),
    sliderElectricity: document.getElementById('sliderElectricity'),
    numElectricity: document.getElementById('numElectricity'),
    subElectricity: document.getElementById('subElectricity'),
    sliderDiet: document.getElementById('sliderDiet'),
    numDiet: document.getElementById('numDiet'),
    subDiet: document.getElementById('subDiet'),
    sliderAviation: document.getElementById('sliderAviation'),
    numAviation: document.getElementById('numAviation'),
    subAviation: document.getElementById('subAviation'),
    chartCanvas: document.getElementById('chartCanvas'),
    forestCanvas: document.getElementById('forestCanvas'),
    valEmissions: document.getElementById('valEmissions'),
    valTrees: document.getElementById('valTrees'),
    valCanopy: document.getElementById('valCanopy'),
    valBalance: document.getElementById('valBalance'),
    balanceUnit: document.getElementById('balanceUnit'),
    gaugeFill: document.getElementById('gaugeFill'),
    gaugePct: document.getElementById('gaugePct'),
    treeCountBadge: document.getElementById('treeCountBadge'),
    consoleError: document.getElementById('consoleError'),
    stateDot: document.getElementById('stateDot'),
    stateLabel: document.getElementById('stateLabel'),
    btnCompute: document.getElementById('btnCompute'),
    btnPreset: document.getElementById('btnPreset'),
    btnFlush: document.getElementById('btnFlush')
  };

  const ctxChart = refs.chartCanvas.getContext('2d');
  const ctxForest = refs.forestCanvas.getContext('2d');

  const paramGroups = document.querySelectorAll('.param-group');

  /* === BIND SLIDER ↔ NUMBER === */
  function bindSlider(sliderId, numId, subId, label) {
    const slider = document.getElementById(sliderId);
    const num = document.getElementById(numId);
    const sub = document.getElementById(subId);
    if (!slider || !num) return;

    const sync = (fromSlider) => {
      const v = fromSlider ? parseFloat(slider.value) : parseFloat(num.value);
      const clamped = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), isNaN(v) ? 0 : v));
      slider.value = clamped;
      num.value = clamped;
      if (sub) {
        const cat = slider.id.replace('slider','').toLowerCase();
        let suffix = '';
        if (cat === 'transport') suffix = ` · ${clamped} km/day · 0.21 kg CO₂/km`;
        else if (cat === 'electricity') suffix = ` · ${clamped} kWh/day · 0.85 kg CO₂/kWh`;
        else if (cat === 'diet') suffix = ` · ${clamped} · vegan(0) → heavy meat(100)`;
        else if (cat === 'aviation') suffix = ` · ${clamped} trips/yr · 510 kg CO₂/trip`;
        sub.textContent = suffix;
      }
      return clamped;
    };

    slider.addEventListener('input', () => sync(true));
    num.addEventListener('change', () => sync(false));
    num.addEventListener('input', () => {
      const v = parseFloat(num.value);
      if (!isNaN(v) && v >= parseFloat(slider.min) && v <= parseFloat(slider.max)) {
        sync(false);
      }
    });

    return sync;
  }

  bindSlider('sliderTransport','numTransport','subTransport');
  bindSlider('sliderElectricity','numElectricity','subElectricity');
  bindSlider('sliderDiet','numDiet','subDiet');
  bindSlider('sliderAviation','numAviation','subAviation');

  /* === READ INPUTS === */
  function readInputs() {
    return {
      transport: parseFloat(refs.sliderTransport.value) || 0,
      electricity: parseFloat(refs.sliderElectricity.value) || 0,
      diet: parseFloat(refs.sliderDiet.value) || 0,
      aviation: parseFloat(refs.sliderAviation.value) || 0
    };
  }

  /* === VALIDATE === */
  function validate(inputs) {
    let valid = true;
    paramGroups.forEach(g => { g.classList.remove('shake','err');
      g.querySelectorAll('.param-num').forEach(n => n.classList.remove('err'));
    });
    refs.consoleError.classList.remove('show');

    const checks = [
      { key: 'transport', min: 0, max: 300, group: document.querySelector('[data-category="transport"]') },
      { key: 'electricity', min: 0, max: 200, group: document.querySelector('[data-category="electricity"]') },
      { key: 'diet', min: 0, max: 100, group: document.querySelector('[data-category="diet"]') },
      { key: 'aviation', min: 0, max: 200, group: document.querySelector('[data-category="aviation"]') }
    ];

    for (const c of checks) {
      const v = inputs[c.key];
      const inp = c.group ? c.group.querySelector('.param-num') : null;
      if (v < c.min || v > c.max || isNaN(v)) {
        if (c.group) { c.group.classList.add('shake','err'); }
        if (inp) inp.classList.add('err');
        valid = false;
      }
    }

    if (!valid) refs.consoleError.classList.add('show');
    return valid;
  }

  /* === CALCULATIONS === */
  function calculate(inputs) {
    const annualTransport = inputs.transport * 365 * FACTORS.transport;
    const annualElectricity = inputs.electricity * 365 * FACTORS.electricity;

    const dietFactor = FACTORS.diet.min + (inputs.diet / 100) * (FACTORS.diet.max - FACTORS.diet.min);
    const annualDiet = dietFactor * 365;

    const annualAviation = inputs.aviation * FACTORS.aviation;

    const total = annualTransport + annualElectricity + annualDiet + annualAviation;
    const trees = Math.round(total / TREE_ABSORPTION);
    const canopy = trees * CANOPY_PER_TREE;
    const offset = trees * TREE_ABSORPTION;
    const balance = total - offset;

    return {
      breakdown: [
        { label: 'Transport', value: annualTransport, color: '#00e5ff' },
        { label: 'Electricity', value: annualElectricity, color: '#ffb800' },
        { label: 'Diet', value: annualDiet, color: '#ff2d78' },
        { label: 'Aviation', value: annualAviation, color: '#ff1744' }
      ],
      total,
      trees,
      canopy,
      balance,
      offset
    };
  }

  /* === UPDATE STATE === */
  function setState(mode) {
    const dot = refs.stateDot;
    const lbl = refs.stateLabel;
    dot.className = 'state-dot';
    if (mode === 'idle') { dot.classList.add('active'); lbl.textContent = 'IDLE'; }
    else if (mode === 'active') { dot.classList.add('active'); lbl.textContent = 'COMPUTING'; }
    else if (mode === 'warning') { dot.classList.add('warning'); lbl.textContent = 'HIGH IMPACT'; }
    else if (mode === 'critical') { dot.classList.add('critical'); lbl.textContent = 'CRITICAL'; }
    else if (mode === 'flushed') { dot.className = 'state-dot'; lbl.textContent = 'FLUSHED'; }
    else { lbl.textContent = 'STANDBY'; }
  }

  /* === UPDATE TELEMETRY === */
  function updateTelemetry(res) {
    if (!res) {
      refs.valEmissions.textContent = '—';
      refs.valTrees.textContent = '—';
      refs.valCanopy.textContent = '—';
      refs.valBalance.textContent = '—';
      refs.balanceUnit.textContent = '—';
      refs.gaugeFill.style.width = '0%';
      refs.gaugePct.textContent = '0%';
      refs.treeCountBadge.textContent = '0 trees';
      setState('flushed');
      return;
    }

    refs.valEmissions.textContent = res.total.toFixed(1);
    refs.valTrees.textContent = res.trees;
    refs.valCanopy.textContent = res.canopy.toFixed(0);
    refs.treeCountBadge.textContent = `${res.trees} trees`;

    const balEl = refs.valBalance;
    balEl.textContent = (res.balance >= 0 ? '+' : '') + res.balance.toFixed(1);
    balEl.className = 't-value ' + (res.balance <= 0 ? 'positive' : 'negative');
    refs.balanceUnit.textContent = res.balance <= 0 ? 'SURPLUS · carbon neutral' : 'DEFICIT · needs offset';

    const pct = res.total > 0 ? Math.min((res.offset / res.total) * 100, 100) : 0;
    refs.gaugeFill.style.width = pct.toFixed(1) + '%';
    refs.gaugePct.textContent = pct.toFixed(0) + '%';

    if (res.total > 15000) setState('critical');
    else if (res.total > 8000) setState('warning');
    else setState('active');
  }

  /* === DRAW CHART === */
  function drawChart(breakdown, total) {
    const cvs = refs.chartCanvas;
    const wrap = cvs.parentElement;
    const w = Math.min(wrap.clientWidth - 8, 700);
    const h = 150;
    cvs.width = w; cvs.height = h;
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px';

    const ctx = ctxChart;
    ctx.clearRect(0, 0, w, h);

    if (!breakdown || total === 0) return;

    const pad = { t: 18, b: 24, l: 42, r: 10 };
    const gw = w - pad.l - pad.r;
    const gh = h - pad.t - pad.b;
    const gap = 8;
    const barW = Math.min((gw - gap * (breakdown.length - 1)) / breakdown.length, 60);

    const maxVal = Math.max(...breakdown.map(d => d.value), 10);

    for (let i = 0; i < breakdown.length; i++) {
      const d = breakdown[i];
      const barH = (d.value / maxVal) * gh;
      const x = pad.l + i * (barW + gap);
      const y = pad.t + gh - barH;

      ctx.fillStyle = d.color;
      ctx.shadowColor = d.color + '44';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [3,3,0,0]);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#4a5268';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(d.label, x + barW / 2, pad.t + gh + 4);

      ctx.fillStyle = d.color;
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.textBaseline = 'bottom';
      ctx.fillText(d.value.toFixed(0), x + barW / 2, y - 2);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const yy = pad.t + (gh / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(pad.l + gw, yy); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.round((maxVal / 4) * (4 - i)), pad.l - 4, yy);
    }
  }

  /* === DRAW FOREST === */
  function drawForest(count) {
    const cvs = refs.forestCanvas;
    const wrap = cvs.parentElement;
    const w = Math.min(wrap.clientWidth - 8, 700);
    const h = 190;
    cvs.width = w; cvs.height = h;
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px';

    const ctx = ctxForest;
    ctx.clearRect(0, 0, w, h);

    if (!count || count === 0) {
      ctx.fillStyle = '#4a5268';
      ctx.font = '6px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('no trees required · flush workspace', w/2, h/2);
      return;
    }

    const displayCount = Math.min(count, 500);
    const gap = 6;
    const size = Math.max(4, Math.min(12, (w - 20) / Math.max(Math.ceil(Math.sqrt(displayCount)), 5)));
    const cols = Math.max(2, Math.floor((w - 10) / (size + gap * 0.5)));

    let drawn = 0;
    for (let row = 0; row < 100 && drawn < displayCount; row++) {
      for (let col = 0; col < cols && drawn < displayCount; col++) {
        const x = 5 + col * ((w - 10) / cols);
        const y = 8 + row * (size * 1.3);
        if (y + size > h - 8) break;

        const hue = 120 + (drawn % 20) * 2;
        ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.shadowColor = `hsla(${hue}, 80%, 50%, 0.3)`;
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + size / 2, y);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#3e2723';
        ctx.shadowBlur = 0;
        ctx.fillRect(x + size * 0.35, y + size - 2, size * 0.3, 4);

        drawn++;
      }
    }

    if (count > displayCount) {
      ctx.fillStyle = '#4a5268';
      ctx.font = '6px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`+${count - displayCount} more`, w - 6, h - 4);
    }

    ctx.shadowBlur = 0;
  }

  /* === SIZING RESET === */
  function clearCanvases() {
    [refs.chartCanvas, refs.forestCanvas].forEach(c => {
      const wrap = c.parentElement;
      const w = Math.min(wrap.clientWidth - 8, 700);
      const h = c === refs.chartCanvas ? 150 : 190;
      c.width = w; c.height = h;
      c.style.width = w + 'px'; c.style.height = h + 'px';
      c.getContext('2d').clearRect(0, 0, w, h);
    });
  }

  /* === COMPUTE === */
  function compute() {
    const inputs = readInputs();
    if (!validate(inputs)) {
      refs.consoleError.classList.add('show');
      return;
    }
    refs.consoleError.classList.remove('show');

    const res = calculate(inputs);
    lastResult = res;
    drawChart(res.breakdown, res.total);
    drawForest(res.trees);
    updateTelemetry(res);
  }

  /* === PRESET === */
  const highImpactPreset = {
    transport: 85,
    electricity: 38,
    diet: 85,
    aviation: 18
  };

  function loadPreset(preset) {
    refs.sliderTransport.value = preset.transport;
    refs.numTransport.value = preset.transport;
    refs.sliderElectricity.value = preset.electricity;
    refs.numElectricity.value = preset.electricity;
    refs.sliderDiet.value = preset.diet;
    refs.numDiet.value = preset.diet;
    refs.sliderAviation.value = preset.aviation;
    refs.numAviation.value = preset.aviation;

    ['Transport','Electricity','Diet','Aviation'].forEach(cat => {
      const slider = document.getElementById('slider' + cat);
      const sub = document.getElementById('sub' + cat);
      if (slider && sub) {
        const clamped = parseFloat(slider.value);
        if (cat === 'Transport') sub.textContent = ` · ${clamped} km/day · 0.21 kg CO₂/km`;
        else if (cat === 'Electricity') sub.textContent = ` · ${clamped} kWh/day · 0.85 kg CO₂/kWh`;
        else if (cat === 'Diet') sub.textContent = ` · ${clamped} · vegan(0) → heavy meat(100)`;
        else if (cat === 'Aviation') sub.textContent = ` · ${clamped} trips/yr · 510 kg CO₂/trip`;
      }
    });

    compute();
  }

  /* === FLUSH === */
  function flush() {
    const zeros = { transport: 0, electricity: 0, diet: 0, aviation: 0 };
    loadPreset(zeros);
    paramGroups.forEach(g => g.classList.remove('shake','err'));
    refs.consoleError.classList.remove('show');
    lastResult = null;
    clearCanvases();
    updateTelemetry(null);
    setState('flushed');
  }

  /* === EVENT BINDING === */
  refs.btnCompute.addEventListener('click', compute);
  refs.btnPreset.addEventListener('click', () => loadPreset(highImpactPreset));
  refs.btnFlush.addEventListener('click', flush);

  window.addEventListener('resize', () => {
    if (lastResult) {
      drawChart(lastResult.breakdown, lastResult.total);
      drawForest(lastResult.trees);
    } else {
      clearCanvases();
    }
  });

  /* === SELF-INIT === */
  clearCanvases();
  updateTelemetry(null);
  setState('idle');

})();
