(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const chartCanvas = $('#chartCanvas');
  const chartCtx = chartCanvas.getContext('2d');
  const particleCanvas = $('#particleCanvas');
  const pCtx = particleCanvas.getContext('2d');

  const slP0 = $('#slP0'); const slBirth = $('#slBirth'); const slDeath = $('#slDeath');
  const slK = $('#slK'); const slYears = $('#slYears');
  const valP0 = $('#valP0'); const valBirth = $('#valBirth'); const valDeath = $('#valDeath');
  const valK = $('#valK'); const valYears = $('#valYears');
  const yearVal = $('#yearVal'); const popVal = $('#popVal'); const strainVal = $('#strainVal');
  const topBadge = $('#topBadge');
  const teleDouble = $('#teleDouble'); const telePeak = $('#telePeak');
  const teleStrain = $('#teleStrain'); const teleFinal = $('#teleFinal');
  const teleBadge = $('#teleBadge'); const chartHint = $('#chartHint'); const crowdHint = $('#crowdHint');
  const btnRun = $('#btnRun'); const btnEvent = $('#btnEvent'); const btnFlush = $('#btnFlush');
  const toastContainer = $('#toastContainer');
  const modelBtns = $$('.model-btn');

  /* ─── STATE ─── */
  let activeModel = 'exponential';
  let popData = [];
  let currentPop = 0;
  let currentYear = 0;
  let running = false;
  let animId = null;
  let particles = [];
  let eventActive = false;

  /* ─── MODEL LOGIC ─── */
  function computeModel(model, P0, r, K, years) {
    const data = [];
    let pop = P0;

    for (let y = 0; y <= years; y++) {
      if (model === 'exponential') {
        pop = P0 * Math.exp(r * y);
      } else if (model === 'logistic') {
        if (K > 0) {
          pop = (K * P0 * Math.exp(r * y)) / (K + P0 * (Math.exp(r * y) - 1));
        } else {
          pop = P0 * Math.exp(r * y);
        }
      } else if (model === 'malthusian') {
        const resourceRatio = K > 0 ? Math.max(0, 1 - pop / K) : 1;
        const effectiveR = r * resourceRatio;
        pop = pop * (1 + effectiveR);
        if (pop < 0.1) pop = 0.1;
      }
      if (pop < 0) pop = 0;
      data.push({ year: y, pop: Math.round(pop * 10) / 10 });
    }
    return data;
  }

  function runSimulation() {
    const P0 = parseFloat(slP0.value);
    const birth = parseFloat(slBirth.value) / 100;
    const death = parseFloat(slDeath.value) / 100;
    const r = birth - death;
    const K = parseFloat(slK.value);
    const years = parseInt(slYears.value, 10);

    popData = computeModel(activeModel, P0, r, K, years);
    currentPop = popData.length > 0 ? popData[0].pop : 0;
    currentYear = 0;
    running = true;
    eventActive = false;

    updateTelemetry();
    topBadge.textContent = activeModel.toUpperCase();
    showToast('[RUN] ' + activeModel + ' simulation — ' + years + ' years', '#00e5ff');
  }

  /* ─── EVENT INJECTION ─── */
  function injectEvent() {
    if (!running || popData.length === 0) {
      showToast('[WARN] No active simulation — run a model first', '#ffb800');
      return;
    }
    const crashYear = Math.min(currentYear + 5, popData.length - 1);
    for (let y = crashYear; y < popData.length; y++) {
      popData[y].pop = popData[y].pop * 0.7;
    }
    eventActive = true;
    showToast('[EVENT] Pandemic impact — population reduced by 30%', '#ff1744');
  }

  /* ─── TELEMETRY ─── */
  function updateTelemetry() {
    if (popData.length === 0) return;
    const last = popData[popData.length - 1];
    const peak = popData.reduce((m, d) => d.pop > m.pop ? d : m, popData[0]);
    const P0 = popData[0].pop;
    const K = parseFloat(slK.value);

    const birth = parseFloat(slBirth.value) / 100;
    const death = parseFloat(slDeath.value) / 100;
    const r = birth - death;
    const doubling = r > 0 ? (70 / (r * 100)).toFixed(1) : 'INF';

    teleDouble.textContent = doubling + ' yr';
    telePeak.textContent = peak.pop.toLocaleString() + ' (yr ' + peak.year + ')';

    const strainPct = K > 0 ? Math.min(100, (last.pop / K) * 100) : 0;
    teleStrain.textContent = strainPct.toFixed(1) + '%';
    teleStrain.style.color = strainPct >= 90 ? '#ff1744' : strainPct >= 70 ? '#ffb800' : '#00e5ff';
    teleStrain.style.textShadow = strainPct >= 90 ? '0 0 8px rgba(255,23,68,0.4)' : strainPct >= 70 ? '0 0 8px rgba(255,184,0,0.3)' : '0 0 8px rgba(0,229,255,0.3)';

    teleFinal.textContent = last.pop.toLocaleString() + ' (yr ' + last.year + ')';

    popVal.textContent = Math.round(currentPop).toLocaleString();

    const strainCss = K > 0 ? Math.min(100, (currentPop / K) * 100) : 0;
    strainVal.textContent = strainCss.toFixed(0);

    /* saturation badge */
    if (strainPct >= 90) {
      teleBadge.textContent = '[CRITICAL STRAIN: CEILING APPROACHING]';
      teleBadge.style.background = 'rgba(255,23,68,0.12)';
      teleBadge.style.borderColor = 'rgba(255,23,68,0.35)';
      teleBadge.style.color = '#ff1744';
      topBadge.style.color = '#ff1744';
      topBadge.style.borderColor = 'rgba(255,23,68,0.35)';
    } else if (strainPct >= 70) {
      teleBadge.textContent = '[WARNING: RESOURCE STRAIN ELEVATED]';
      teleBadge.style.background = 'rgba(255,184,0,0.1)';
      teleBadge.style.borderColor = 'rgba(255,184,0,0.3)';
      teleBadge.style.color = '#ffb800';
      topBadge.style.color = '#ffb800';
      topBadge.style.borderColor = 'rgba(255,184,0,0.3)';
    } else {
      teleBadge.textContent = '[STABLE: RESOURCES NOMINAL]';
      teleBadge.style.background = 'rgba(0,229,255,0.08)';
      teleBadge.style.borderColor = 'rgba(0,229,255,0.25)';
      teleBadge.style.color = '#00e5ff';
      topBadge.style.color = '#00e5ff';
      topBadge.style.borderColor = 'rgba(0,229,255,0.25)';
    }
  }

  /* ─── CHART CANVAS ─── */
  function resizeChart() {
    const wrap = chartCanvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 300;
    const h = Math.max(180, Math.min(320, w * 0.5));
    chartCanvas.style.width = w + 'px';
    chartCanvas.style.height = h + 'px';
    chartCanvas.width = w * dpr;
    chartCanvas.height = h * dpr;
    chartCtx.scale(dpr, dpr);
    chartCanvas._w = w;
    chartCanvas._h = h;
  }

  function drawChart() {
    const w = chartCanvas._w;
    const h = chartCanvas._h;
    chartCtx.clearRect(0, 0, w, h);

    if (popData.length === 0) return;

    const pad = { top: 10, right: 8, bottom: 18, left: 40 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;
    const maxPop = popData.reduce((m, d) => Math.max(m, d.pop), 0);
    const maxYear = popData[popData.length - 1].year;

    /* grid */
    chartCtx.strokeStyle = 'rgba(255,255,255,0.04)';
    chartCtx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i;
      chartCtx.beginPath(); chartCtx.moveTo(pad.left, y); chartCtx.lineTo(pad.left + cw, y); chartCtx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const x = pad.left + (cw / 5) * i;
      chartCtx.beginPath(); chartCtx.moveTo(x, pad.top); chartCtx.lineTo(x, pad.top + ch); chartCtx.stroke();
    }

    /* axes */
    chartCtx.strokeStyle = 'rgba(255,255,255,0.08)';
    chartCtx.lineWidth = 0.5;
    chartCtx.beginPath(); chartCtx.moveTo(pad.left, pad.top); chartCtx.lineTo(pad.left, pad.top + ch); chartCtx.lineTo(pad.left + cw, pad.top + ch); chartCtx.stroke();

    /* axis labels */
    chartCtx.fillStyle = 'rgba(255,255,255,0.12)';
    chartCtx.font = '4.5px "JetBrains Mono", monospace';
    chartCtx.textAlign = 'center'; chartCtx.textBaseline = 'top';
    for (let i = 0; i <= 5; i++) {
      const yr = Math.round((maxYear / 5) * i);
      const x = pad.left + (cw / 5) * i;
      chartCtx.fillText(yr, x, pad.top + ch + 3);
    }
    chartCtx.textAlign = 'right'; chartCtx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round((maxPop / 4) * (4 - i));
      const y = pad.top + (ch / 4) * i;
      chartCtx.fillText(val.toLocaleString(), pad.left - 4, y);
    }

    /* K line */
    const K = parseFloat(slK.value);
    if (K > 0 && K < maxPop * 1.5) {
      const ky = pad.top + ch - (K / maxPop) * ch;
      chartCtx.strokeStyle = 'rgba(255,184,0,0.15)';
      chartCtx.lineWidth = 0.5;
      chartCtx.setLineDash([3, 3]);
      chartCtx.beginPath(); chartCtx.moveTo(pad.left, ky); chartCtx.lineTo(pad.left + cw, ky); chartCtx.stroke();
      chartCtx.setLineDash([]);
      chartCtx.fillStyle = 'rgba(255,184,0,0.2)';
      chartCtx.font = '4.5px "JetBrains Mono", monospace';
      chartCtx.textAlign = 'left'; chartCtx.textBaseline = 'bottom';
      chartCtx.fillText('K=' + K, pad.left + 2, ky - 2);
    }

    /* data line */
    if (popData.length < 2) return;
    const strainPct = K > 0 ? Math.min(100, (popData[popData.length - 1].pop / K) * 100) : 0;
    const lineColor = strainPct >= 90 ? '#ff1744' : strainPct >= 70 ? '#ffb800' : '#00e5ff';

    chartCtx.beginPath();
    for (let i = 0; i < popData.length; i++) {
      const x = pad.left + (popData[i].year / maxYear) * cw;
      const y = pad.top + ch - (popData[i].pop / maxPop) * ch;
      if (i === 0) chartCtx.moveTo(x, y);
      else chartCtx.lineTo(x, y);
    }
    chartCtx.strokeStyle = lineColor;
    chartCtx.lineWidth = 1.5;
    chartCtx.shadowColor = lineColor;
    chartCtx.shadowBlur = 6;
    chartCtx.stroke();
    chartCtx.shadowBlur = 0;

    /* fill under curve */
    chartCtx.beginPath();
    chartCtx.moveTo(pad.left + (popData[0].year / maxYear) * cw, pad.top + ch);
    for (let i = 0; i < popData.length; i++) {
      const x = pad.left + (popData[i].year / maxYear) * cw;
      const y = pad.top + ch - (popData[i].pop / maxPop) * ch;
      chartCtx.lineTo(x, y);
    }
    chartCtx.lineTo(pad.left + (popData[popData.length - 1].year / maxYear) * cw, pad.top + ch);
    chartCtx.closePath();
    const grad = chartCtx.createLinearGradient(0, pad.top, 0, pad.top + ch);
    grad.addColorStop(0, lineColor + '20');
    grad.addColorStop(1, lineColor + '00');
    chartCtx.fillStyle = grad;
    chartCtx.fill();

    /* active cursor */
    const cursorIdx = Math.min(currentYear, popData.length - 1);
    const cx = pad.left + (popData[cursorIdx].year / maxYear) * cw;
    const cy = pad.top + ch - (popData[cursorIdx].pop / maxPop) * ch;

    chartCtx.beginPath();
    chartCtx.arc(cx, cy, 3, 0, Math.PI * 2);
    chartCtx.fillStyle = lineColor;
    chartCtx.shadowColor = lineColor;
    chartCtx.shadowBlur = 10;
    chartCtx.fill();
    chartCtx.shadowBlur = 0;

    /* vertical cursor line */
    chartCtx.beginPath();
    chartCtx.moveTo(cx, pad.top);
    chartCtx.lineTo(cx, pad.top + ch);
    chartCtx.strokeStyle = lineColor + '30';
    chartCtx.lineWidth = 0.5;
    chartCtx.stroke();
  }

  /* ─── PARTICLE CANVAS ─── */
  function resizeParticles() {
    const wrap = particleCanvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 300;
    const h = Math.max(60, Math.min(100, w * 0.15));
    particleCanvas.style.width = w + 'px';
    particleCanvas.style.height = h + 'px';
    particleCanvas.width = w * dpr;
    particleCanvas.height = h * dpr;
    pCtx.scale(dpr, dpr);
    particleCanvas._w = w;
    particleCanvas._h = h;
  }

  function updateParticles() {
    const w = particleCanvas._w;
    const h = particleCanvas._h;
    const K = parseFloat(slK.value);
    const targetCount = K > 0 ? Math.min(200, Math.round((currentPop / K) * 200)) : Math.min(200, Math.round(currentPop / 5));

    while (particles.length < targetCount) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 1.5
      });
    }
    while (particles.length > targetCount) {
      particles.pop();
    }

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    }

    crowdHint.textContent = particles.length + ' agents';
  }

  function drawParticles() {
    const w = particleCanvas._w;
    const h = particleCanvas._h;
    pCtx.clearRect(0, 0, w, h);

    const K = parseFloat(slK.value);
    const strainPct = K > 0 ? Math.min(100, (currentPop / K) * 100) : 0;
    const color = strainPct >= 90 ? '#ff1744' : strainPct >= 70 ? '#ffb800' : '#00e5ff';

    for (const p of particles) {
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fillStyle = color + '55';
      pCtx.fill();
    }

    /* density label */
    pCtx.fillStyle = 'rgba(255,255,255,0.06)';
    pCtx.font = '4px "JetBrains Mono", monospace';
    pCtx.textAlign = 'right';
    pCtx.textBaseline = 'bottom';
    pCtx.fillText(particles.length + ' / 200', w - 4, h - 2);
  }

  /* ─── ANIMATION LOOP ─── */
  function loop() {
    if (running && popData.length > 0) {
      currentYear = Math.min(currentYear + 0.5, popData.length - 1);
      const idx = Math.floor(currentYear);
      currentPop = popData[idx] ? popData[idx].pop : 0;
      yearVal.textContent = popData[idx] ? popData[idx].year : 0;
      popVal.textContent = Math.round(currentPop).toLocaleString();
      updateTelemetry();
      updateParticles();
    }
    drawChart();
    drawParticles();
    animId = requestAnimationFrame(loop);
  }

  /* ─── EVENT BINDINGS ─── */
  [slP0, slBirth, slDeath, slK, slYears].forEach(sl => {
    sl.addEventListener('input', function() {
      const label = this.id.replace('sl', 'val');
      const valEl = document.getElementById(label);
      if (valEl) valEl.textContent = this.value;
    });
  });

  modelBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      modelBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      activeModel = this.dataset.model;
      if (running) runSimulation();
      showToast('[MODEL] ' + this.textContent.trim(), '#00e5ff');
    });
  });

  btnRun.addEventListener('click', runSimulation);
  btnEvent.addEventListener('click', injectEvent);

  btnFlush.addEventListener('click', function() {
    running = false;
    popData = [];
    particles = [];
    currentPop = 0;
    currentYear = 0;
    eventActive = false;
    slP0.value = 100; valP0.textContent = '100';
    slBirth.value = 2.5; valBirth.textContent = '2.5';
    slDeath.value = 1.0; valDeath.textContent = '1.0';
    slK.value = 1000; valK.textContent = '1000';
    slYears.value = 200; valYears.textContent = '200';
    activeModel = 'exponential';
    modelBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.model-btn[data-model="exponential"]').classList.add('active');
    yearVal.textContent = '0';
    popVal.textContent = '--';
    strainVal.textContent = '--';
    topBadge.textContent = 'STANDBY';
    topBadge.style.color = '#00e5ff';
    topBadge.style.borderColor = 'rgba(0,229,255,0.2)';
    teleDouble.textContent = '--';
    telePeak.textContent = '--';
    teleStrain.textContent = '--';
    teleStrain.style.color = '';
    teleStrain.style.textShadow = '';
    teleFinal.textContent = '--';
    teleBadge.textContent = 'STANDBY';
    teleBadge.style.background = '';
    teleBadge.style.borderColor = '';
    teleBadge.style.color = '';
    chartHint.textContent = '--';
    crowdHint.textContent = '0 agents';
    drawChart();
    drawParticles();
    showToast('[FLUSH] Dataset purged — all parameters re-zeroed', '#8892a8');
  });

  window.addEventListener('resize', () => { resizeChart(); resizeParticles(); });

  /* ─── TOAST ─── */
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
    resizeChart();
    resizeParticles();
    runSimulation();
    loop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
