(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#histCanvas');
  const ctx = canvas.getContext('2d');
  const modeBtns = $$('.mode-btn');
  const batchBtns = $$('.batch-btn');
  const biasSlider = $('#biasSlider');
  const biasVal = $('#biasVal');
  const theoreticalDisplay = $('#theoreticalDisplay');
  const ledgerBody = $('#ledgerBody');
  const teleTrials = $('#teleTrials');
  const teleDelta = $('#teleDelta');
  const teleBadge = $('#teleBadge');
  const breakdownContainer = $('#breakdownContainer');
  const btnRun = $('#btnRun');
  const btnMCSweep = $('#btnMCSweep');
  const btnPurge = $('#btnPurge');

  let mode = 'coin';
  let batchSize = 1;
  let bias = 50;
  let running = false;

  /* ─── OUTCOME DEFINITIONS ─── */
  const OUTCOMES = {
    coin: [
      { key: 'HEADS', label: 'HEADS', theoretical: 0.5, count: 0 },
      { key: 'TAILS', label: 'TAILS', theoretical: 0.5, count: 0 }
    ],
    dice: [
      { key: '1', label: '1', theoretical: 1/6, count: 0 },
      { key: '2', label: '2', theoretical: 1/6, count: 0 },
      { key: '3', label: '3', theoretical: 1/6, count: 0 },
      { key: '4', label: '4', theoretical: 1/6, count: 0 },
      { key: '5', label: '5', theoretical: 1/6, count: 0 },
      { key: '6', label: '6', theoretical: 1/6, count: 0 }
    ],
    card: [
      { key: 'HEARTS', label: 'HEARTS', theoretical: 0.25, count: 0 },
      { key: 'DIAMONDS', label: 'DIAMONDS', theoretical: 0.25, count: 0 },
      { key: 'CLUBS', label: 'CLUBS', theoretical: 0.25, count: 0 },
      { key: 'SPADES', label: 'SPADES', theoretical: 0.25, count: 0 }
    ]
  };

  let outcomes = [];
  let totalTrials = 0;

  /* ─── CANVAS ─── */
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 400;
    const h = (wrap.clientHeight || 300) - 28;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = w;
    canvas._h = h;
  }

  /* ─── RNG ─── */
  function rng() { return Math.random(); }

  function runTrial() {
    const biased = bias / 100;
    const r = rng();
    if (mode === 'coin') {
      return r < biased ? 'HEADS' : 'TAILS';
    } else if (mode === 'dice') {
      const idx = Math.floor(r * 6);
      return String(idx + 1);
    } else {
      const idx = Math.floor(r * 4);
      return ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'][idx];
    }
  }

  function getTheoreticalTarget() {
    if (mode === 'coin') return bias / 100;
    return 1 / outcomes.length;
  }

  function getOutcomeIndex(key) {
    return outcomes.findIndex(o => o.key === key);
  }

  /* ─── EXECUTE BATCH ─── */
  function executeBatch(count) {
    for (let i = 0; i < count; i++) {
      const key = runTrial();
      const idx = getOutcomeIndex(key);
      if (idx !== -1) outcomes[idx].count++;
      totalTrials++;
    }
  }

  /* ─── RESET ─── */
  function resetAll() {
    outcomes.forEach(o => o.count = 0);
    totalTrials = 0;
    drawCanvas();
    renderLedger();
    renderTelemetry();
  }

  /* ─── SET MODE ─── */
  function setMode(m) {
    mode = m;
    outcomes = OUTCOMES[m].map(o => ({ ...o, count: 0 }));
    totalTrials = 0;
    updateTheoretical();
    drawCanvas();
    renderLedger();
    renderTelemetry();
  }

  /* ─── UPDATE THEORETICAL DISPLAY ─── */
  function updateTheoretical() {
    if (mode === 'coin') {
      theoreticalDisplay.textContent = (bias / 100 * 100).toFixed(1) + '%';
    } else {
      theoreticalDisplay.textContent = (getTheoreticalTarget() * 100).toFixed(1) + '%';
    }
  }

  /* ─── DRAW CANVAS ─── */
  function drawCanvas() {
    const w = canvas._w, h = canvas._h;
    ctx.clearRect(0, 0, w, h);
    if (!w || !h) return;

    const n = outcomes.length;
    if (n === 0) return;

    const maxFreq = Math.max(1, ...outcomes.map(o => o.count));
    const target = getTheoreticalTarget();
    const maxVal = Math.max(maxFreq, Math.ceil(target * totalTrials * 1.2));

    const pad = { t: 20, b: 30, l: 40, r: 20 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;
    const barW = Math.min(chartW / n * 0.7, 60);
    const gap = chartW / n;
    const baseY = h - pad.b;

    /* grid lines */
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    for (let p = 0; p <= 4; p++) {
      const yy = baseY - chartH * (p / 4);
      ctx.beginPath();
      ctx.moveTo(pad.l, yy);
      ctx.lineTo(w - pad.r, yy);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    /* bars */
    for (let i = 0; i < n; i++) {
      const o = outcomes[i];
      const expPct = totalTrials > 0 ? o.count / totalTrials : 0;
      const barH = totalTrials > 0 ? (o.count / maxVal) * chartH : 0;
      const bx = pad.l + gap * i + (gap - barW) / 2;
      const by = baseY - barH;

      const closeToTarget = totalTrials > 0 && Math.abs(expPct - target) / target < 0.03;
      const color = closeToTarget && totalTrials > 50 ? '#00e676' : '#00e5ff';
      const alpha = closeToTarget && totalTrials > 50 ? 0.9 : 0.7;

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(bx, by, barW, barH);
      ctx.globalAlpha = 1;

      /* count label above bar */
      if (o.count > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '600 clamp(6px,0.7vmin,9px) "JetBrains Mono",monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(o.count, bx + barW / 2, by - 2);
      }

      /* x-axis label */
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = 'clamp(5px,0.6vmin,8px) "JetBrains Mono",monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(o.label, bx + barW / 2, baseY + 4);
    }

    /* theoretical target line */
    if (totalTrials > 0) {
      const targetY = baseY - chartH * (target * totalTrials / maxVal);
      const isConverged = outcomes.every(o => {
        const pct = totalTrials > 0 ? o.count / totalTrials : 0;
        return Math.abs(pct - target) / target < 0.03;
      });

      ctx.strokeStyle = isConverged ? '#00e676' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.shadowColor = isConverged ? '#00e676' : 'transparent';
      ctx.shadowBlur = isConverged ? 8 : 0;
      ctx.beginPath();
      ctx.moveTo(pad.l, targetY);
      ctx.lineTo(w - pad.r, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      ctx.fillStyle = isConverged ? '#00e676' : 'rgba(255,255,255,0.15)';
      ctx.font = 'clamp(5px,0.6vmin,8px) "JetBrains Mono",monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('TARGET ' + (target * totalTrials).toFixed(1), w - pad.r, targetY - 2);
    }

    /* y-axis labels */
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = 'clamp(5px,0.55vmin,7px) "JetBrains Mono",monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let p = 0; p <= 4; p++) {
      const val = Math.round(maxVal * (p / 4));
      const yy = baseY - chartH * (p / 4);
      ctx.fillText(val, pad.l - 4, yy);
    }
  }

  /* ─── RENDER LEDGER ─── */
  function renderLedger() {
    ledgerBody.innerHTML = '';
    if (totalTrials === 0) {
      ledgerBody.innerHTML = '<tr class="ledger-empty"><td colspan="4">STANDBY — NO TRIALS RECORDED</td></tr>';
      return;
    }
    const target = getTheoreticalTarget();
    outcomes.forEach(o => {
      const expPct = totalTrials > 0 ? (o.count / totalTrials * 100) : 0;
      const delta = expPct - (target * 100);
      const tr = document.createElement('tr');
      const closeEnough = Math.abs(delta) < 3 && totalTrials > 10;
      tr.innerHTML = `
        <td>${o.label}</td>
        <td>${o.count}</td>
        <td>${expPct.toFixed(1)}%</td>
        <td style="color:${closeEnough ? '#00e676' : Math.abs(delta) > 10 ? '#ffc800' : 'rgba(255,255,255,0.4)'}">${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%</td>
      `;
      ledgerBody.appendChild(tr);
    });
  }

  /* ─── RENDER TELEMETRY ─── */
  function renderTelemetry() {
    teleTrials.textContent = totalTrials;
    if (totalTrials === 0) {
      teleDelta.textContent = '--';
      teleBadge.className = 'tele-badge standby';
      teleBadge.textContent = 'STANDBY';
      breakdownContainer.innerHTML = '<div class="brk-item" style="justify-content:center;color:rgba(255,255,255,0.08)">NO DATA</div>';
      return;
    }

    const target = getTheoreticalTarget();
    let maxDelta = 0;
    outcomes.forEach(o => {
      const expPct = totalTrials > 0 ? o.count / totalTrials : 0;
      const d = Math.abs(expPct - target) / target * 100;
      if (d > maxDelta) maxDelta = d;
    });
    teleDelta.textContent = maxDelta.toFixed(2) + '%';
    teleDelta.style.color = maxDelta < 3 ? '#00e676' : maxDelta < 10 ? '#ffc800' : '#ff1744';

    /* convergence badge */
    if (totalTrials >= 1000 && maxDelta < 3) {
      teleBadge.className = 'tele-badge converged';
      teleBadge.textContent = '[ CONVERGED — LLN STABLE ]';
    } else if (totalTrials < 10) {
      teleBadge.className = 'tele-badge low';
      teleBadge.textContent = 'INSUFFICIENT SAMPLE';
    } else if (maxDelta < 8) {
      teleBadge.className = 'tele-badge converged';
      teleBadge.textContent = 'APPROACHING CONVERGENCE';
    } else {
      teleBadge.className = 'tele-badge divergent';
      teleBadge.textContent = 'DIVERGENT — INCREASE N';
    }

    /* breakdown */
    let html = '';
    outcomes.forEach(o => {
      const pct = totalTrials > 0 ? (o.count / totalTrials * 100) : 0;
      html += `<div class="brk-item"><span>${o.label}</span><span class="brk-pct">${pct.toFixed(1)}%</span></div>`;
    });
    breakdownContainer.innerHTML = html;
  }

  /* ─── RUN ─── */
  function runBatch() {
    if (running) return;
    executeBatch(batchSize);
    drawCanvas();
    renderLedger();
    renderTelemetry();
  }

  /* ─── MONTE CARLO SWEEP ─── */
  function runMCSweep() {
    if (running) return;
    running = true;
    const targetTotal = totalTrials + 10000;
    const chunk = 500;
    teleBadge.className = 'tele-badge running';
    teleBadge.textContent = '[ SWEEPING 10K TRIALS... ]';

    function step() {
      const remaining = targetTotal - totalTrials;
      const count = Math.min(chunk, remaining);
      executeBatch(count);
      drawCanvas();
      renderLedger();
      renderTelemetry();
      if (totalTrials < targetTotal) {
        requestAnimationFrame(step);
      } else {
        running = false;
        renderTelemetry();
      }
    }
    requestAnimationFrame(step);
  }

  /* ─── UI EVENTS ─── */
  modeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (running) return;
      modeBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      setMode(this.dataset.mode);
    });
  });

  batchBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      batchBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      batchSize = parseInt(this.dataset.batch, 10);
    });
  });

  biasSlider.addEventListener('input', function() {
    bias = parseInt(this.value, 10);
    biasVal.textContent = bias + '%';
    if (mode === 'coin') {
      updateTheoretical();
      drawCanvas();
      renderLedger();
      renderTelemetry();
    }
  });

  btnRun.addEventListener('click', runBatch);
  btnMCSweep.addEventListener('click', runMCSweep);
  btnPurge.addEventListener('click', function() {
    if (running) return;
    resetAll();
  });

  /* ─── WINDOW RESIZE ─── */
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
      drawCanvas();
    }, 100);
  });

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    outcomes = OUTCOMES.coin.map(o => ({ ...o, count: 0 }));
    updateTheoretical();
    drawCanvas();
    renderLedger();
    renderTelemetry();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
