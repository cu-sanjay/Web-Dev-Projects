(function () {
  'use strict';

  /* === RUNOFF COEFFICIENTS === */
  const RUNOFF = {
    '0.90': 'Corrugated Metal',
    '0.80': 'Concrete Tile',
    '0.75': 'Asphalt Shingle',
    '0.30': 'Green Eco-Roof'
  };

  const TANK_CAPACITY = 10000; // litres
  const DAILY_USE = 150;       // litres per day (avg household)

  /* === STATE === */
  let state = {
    area: 120,
    coefficient: 0.80,
    rainfall: 850,
    yield: 0,
    running: false
  };
  let rainDrops = [];
  let waterLevel = 0; // 0 to 1
  let targetLevel = 0;
  let lastTime = 0;
  let animId = null;
  let hasOverflow = false;

  /* === DOM === */
  const $ = id => document.getElementById(id);
  const inputArea = $('inputArea');
  const selectMaterial = $('selectMaterial');
  const sliderRainfall = $('sliderRainfall'), valRainfall = $('valRainfall');
  const cisternCanvas = $('cisternCanvas'), ctx = cisternCanvas.getContext('2d');
  const tankBadge = $('tankBadge');
  const tmAnnual = $('tmAnnual'), tmMonthly = $('tmMonthly');
  const tmOffset = $('tmOffset'), tmStatus = $('tmStatus');
  const impToilet = $('impToilet'), impShower = $('impShower'), impGarden = $('impGarden');
  const stateDot = $('stateDot'), stateLabel = $('stateLabel');
  const btnRun = $('btnRun'), btnPreset = $('btnPreset'), btnFlush = $('btnFlush');

  /* === INPUT BINDING === */
  inputArea.addEventListener('change', () => {
    const v = parseFloat(inputArea.value);
    if (isNaN(v) || v < 0) {
      inputArea.classList.add('err');
      return;
    }
    inputArea.classList.remove('err');
    state.area = v;
  });

  selectMaterial.addEventListener('change', () => {
    state.coefficient = parseFloat(selectMaterial.value);
  });

  sliderRainfall.addEventListener('input', () => {
    state.rainfall = parseFloat(sliderRainfall.value);
    valRainfall.textContent = Math.round(state.rainfall) + ' mm';
  });

  /* === HYDROLOGY CALC === */
  function calculateYield() {
    if (isNaN(state.area) || state.area <= 0 || isNaN(state.rainfall) || state.rainfall <= 0) {
      return 0;
    }
    /* Y = A × R × Cr */
    const areaM2 = state.area;
    const rainfallM = state.rainfall / 1000; // convert mm to m
    const yieldM3 = areaM2 * rainfallM * state.coefficient;
    const yieldL = yieldM3 * 1000; // 1 m³ = 1000 L
    return Math.round(yieldL);
  }

  /* === RAIN DROPS === */
  function spawnRain(count) {
    const w = cisternCanvas.width;
    for (let i = 0; i < (count || 5); i++) {
      rainDrops.push({
        x: 10 + Math.random() * (w - 20),
        y: -10 - Math.random() * 20,
        speed: 2 + Math.random() * 4,
        size: 1 + Math.random() * 2
      });
    }
  }

  /* === SIZE CANVAS === */
  function sizeCanvas() {
    const wrap = cisternCanvas.parentElement;
    const w = Math.min(wrap.clientWidth - 4, 900);
    const h = Math.max(360, Math.round(w * 0.55));
    cisternCanvas.width = w; cisternCanvas.height = h;
    cisternCanvas.style.width = w + 'px'; cisternCanvas.style.height = h + 'px';
    return { w, h };
  }

  /* === DRAW === */
  function drawCistern(time) {
    const { w, h } = sizeCanvas();
    ctx.clearRect(0, 0, w, h);

    /* Gradient background */
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#080b16');
    bg.addColorStop(0.5, '#05060b');
    bg.addColorStop(1, '#0a0f12');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    /* Roof line */
    const roofY = 30;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, roofY);
    ctx.lineTo(w / 2 - 30, roofY - 12);
    ctx.lineTo(w / 2 + 30, roofY - 12);
    ctx.lineTo(w - 10, roofY);
    ctx.stroke();

    /* Gutter */
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 40, roofY - 4, 80, 8, 2);
    ctx.fill();

    /* Downpipe */
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    const pipeX = w / 2 - 4;
    ctx.fillRect(pipeX, roofY + 4, 8, 90);

    /* Rain drops */
    const newDrops = [];
    rainDrops.forEach(d => {
      d.y += d.speed * (state.running ? 1 : 0.3);
      const pipeTop = roofY + 4;
      const pipeBottom = roofY + 90;

      ctx.fillStyle = `rgba(0,229,255,${0.4 + 0.3 * Math.sin(time / 200 + d.x)})`;
      ctx.shadowColor = 'rgba(0,229,255,0.2)';
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      /* Collect in gutter/pipe */
      if (d.y >= roofY && d.y <= roofY + 6 && d.x > w/2 - 35 && d.x < w/2 + 35) {
        /* Enters pipe */
      }

      if (d.y < h) newDrops.push(d);
    });
    rainDrops = newDrops;

    if (state.running && Math.random() < 0.4) spawnRain(2);

    /* Cistern tank */
    const tankL = 60, tankR = w - 60;
    const tankTop = h - 25 - 160, tankBot = h - 25;
    const tankW = tankR - tankL;
    const tankH = tankBot - tankTop;

    /* Tank body */
    ctx.strokeStyle = 'rgba(0,229,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tankL, tankTop, tankW, tankH, 4);
    ctx.stroke();

    /* Tank fill lines */
    for (let i = 1; i <= 4; i++) {
      const fy = tankTop + (tankH / 5) * i;
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.3;
      ctx.beginPath(); ctx.moveTo(tankL + 2, fy); ctx.lineTo(tankR - 2, fy); ctx.stroke();
      ctx.fillStyle = '#4a5268';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.round((1 - i / 5) * 100) + '%', tankL - 6, fy);
    }

    /* Water fill */
    const fillH = tankH * waterLevel;
    if (fillH > 2) {
      const waterTop = tankBot - fillH;

      /* Water gradient */
      const wg = ctx.createLinearGradient(tankL, waterTop, tankL, tankBot);
      wg.addColorStop(0, 'rgba(0,229,255,0.3)');
      wg.addColorStop(1, 'rgba(0,229,255,0.05)');
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.roundRect(tankL + 2, waterTop, tankW - 4, fillH - 2, [0,0,3,3]);
      ctx.fill();

      /* Sine wave surface */
      if (fillH > 8) {
        ctx.beginPath();
        ctx.moveTo(tankL + 2, waterTop);
        for (let x = 0; x <= tankW - 4; x += 2) {
          const waveY = waterTop + Math.sin((x / tankW) * Math.PI * 4 + time / 600) * 3
                               + Math.sin((x / tankW) * Math.PI * 8 + time / 400) * 1.5;
          ctx.lineTo(tankL + 2 + x, waveY);
        }
        ctx.strokeStyle = 'rgba(0,229,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(0,229,255,0.2)';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        /* Surface glow fill */
        ctx.fillStyle = 'rgba(0,229,255,0.03)';
        ctx.lineTo(tankR - 2, waterTop);
        ctx.closePath();
        ctx.fill();
      }
    }

    /* Tank label */
    ctx.fillStyle = '#4a5268';
    ctx.font = '6px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('STORAGE CISTERN', w / 2, tankBot + 4);

    /* Overflow indicator */
    if (hasOverflow) {
      ctx.fillStyle = `rgba(255,23,68,${0.06 + 0.04 * Math.sin(time / 300)})`;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ff1744';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('⛔ OVERFLOW — EXCESS TO DEVIATION PIPES', w / 2, tankBot - 8);
    }

    /* Pipe flow indicator */
    if (waterLevel > 0.01) {
      ctx.fillStyle = 'rgba(0,229,255,0.08)';
      ctx.fillRect(pipeX + 1, roofY + 4, 6, waterLevel * 90);
    }
  }

  /* === UPDATE TELEMETRY === */
  function updateTelemetry() {
    const yieldL = calculateYield();
    state.yield = yieldL;
    const tankL = TANK_CAPACITY;
    const ratio = Math.min(yieldL / tankL, 1);
    targetLevel = ratio;
    hasOverflow = yieldL > tankL;

    const monthly = Math.round(yieldL / 12);
    const offsetDays = DAILY_USE > 0 ? Math.round(yieldL / DAILY_USE) : 0;

    tmAnnual.textContent = yieldL.toLocaleString() + ' L';
    tmMonthly.textContent = monthly.toLocaleString() + ' L/mo';
    tmOffset.textContent = offsetDays + ' days';
    tankBadge.textContent = Math.round(yieldL).toLocaleString() + ' / ' + tankL.toLocaleString() + ' L';

    if (hasOverflow) {
      tmStatus.textContent = 'OVERFLOW RISK';
      tmStatus.className = 'tm-val status overflow';
      stateDot.className = 'state-dot overflow';
      stateLabel.textContent = 'OVERFLOW';
    } else if (yieldL > 0) {
      tmStatus.textContent = 'OPERATIONAL';
      tmStatus.className = 'tm-val status ok';
      stateDot.className = 'state-dot active';
      stateLabel.textContent = 'ACTIVE';
    } else {
      tmStatus.textContent = 'STANDBY';
      tmStatus.className = 'tm-val status';
      stateDot.className = 'state-dot';
      stateLabel.textContent = 'STANDBY';
    }

    /* Impact offsets */
    const toiletFlushL = 6;
    const showerCycleL = 40;
    const gardenSqM = 10;
    const gardenPerSqm = 20;
    impToilet.textContent = Math.round(yieldL / toiletFlushL).toLocaleString();
    impShower.textContent = Math.round(yieldL / showerCycleL).toLocaleString();
    impGarden.textContent = Math.round(yieldL / (gardenSqM * gardenPerSqm)).toLocaleString() + ' m²';
  }

  /* === ANIMATION LOOP === */
  function tick(time) {
    const dt = lastTime ? (time - lastTime) / 1000 : 0.016;
    lastTime = time;

    /* Smooth water level transition */
    waterLevel += (targetLevel - waterLevel) * Math.min(dt * 2, 0.1);

    drawCistern(time);
    updateTelemetry();
    animId = requestAnimationFrame(tick);
  }

  /* === ACTIONS === */
  btnRun.addEventListener('click', () => {
    /* Validate */
    let valid = true;
    if (isNaN(state.area) || state.area <= 0) {
      inputArea.classList.add('err');
      valid = false;
    } else {
      inputArea.classList.remove('err');
    }
    if (!valid) return;

    state.running = true;
    spawnRain(40);
    calculateYield();
  });

  btnPreset.addEventListener('click', () => {
    /* Commercial facility: large roof, high runoff */
    inputArea.value = 2500;
    state.area = 2500;
    selectMaterial.value = '0.90';
    state.coefficient = 0.90;
    sliderRainfall.value = 1100;
    state.rainfall = 1100;
    valRainfall.textContent = '1100 mm';
    inputArea.classList.remove('err');
    state.running = true;
    spawnRain(60);
    calculateYield();
  });

  btnFlush.addEventListener('click', () => {
    state.running = false;
    state.area = 120;
    state.rainfall = 850;
    state.coefficient = 0.80;
    state.yield = 0;
    rainDrops = [];
    waterLevel = 0;
    targetLevel = 0;
    hasOverflow = false;

    inputArea.value = 120;
    selectMaterial.value = '0.80';
    sliderRainfall.value = 850;
    valRainfall.textContent = '850 mm';
    inputArea.classList.remove('err');

    stateDot.className = 'state-dot';
    stateLabel.textContent = 'FLUSHED';
  });

  /* === RESIZE === */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {}, 150);
  });

  /* === INIT === */
  calculateYield();
  tick(0);

})();
