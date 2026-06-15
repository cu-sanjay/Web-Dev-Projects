(function () {
  'use strict';

  /* === CONSTANTS === */
  const DAYS_IN_YEAR = 365;
  const TWO_PI = Math.PI * 2;
  const SEMI_MAJOR = 170;
  const ECCENTRICITY = 0.38;
  const SEMI_MINOR = SEMI_MAJOR * Math.sqrt(1 - ECCENTRICITY * ECCENTRICITY);
  const FOCUS_OFFSET = SEMI_MAJOR * ECCENTRICITY;
  const AU_IN_PX = SEMI_MAJOR;
  const EARTH_RADIUS = 8;

  /* === STATE === */
  let state = {
    day: 1,
    obliquity: 23.5,
    speed: 3,
    running: true,
    solsticeLock: false,
    solsticeDay: null
  };

  let lastDay = 1;
  let animId = null;

  /* === DOM REFS === */
  const $ = id => document.getElementById(id);
  const sliderDay = $('sliderDay'), numDay = $('numDay'), valDay = $('valDay');
  const sliderTilt = $('sliderTilt'), numTilt = $('numTilt'), valTilt = $('valTilt');
  const sliderSpeed = $('sliderSpeed'), numSpeed = $('numSpeed'), valSpeed = $('valSpeed');
  const orbitCanvas = $('orbitCanvas'), intensityCanvas = $('intensityCanvas');
  const ctxOrbit = orbitCanvas.getContext('2d');
  const ctxIntensity = intensityCanvas.getContext('2d');
  const tmDay = $('tmDay'), tmPhase = $('tmPhase'), tmNorth = $('tmNorth');
  const tmSouth = $('tmSouth'), tmDist = $('tmDist'), tmObliquity = $('tmObliquity');
  const stateDot = $('stateDot'), stateLabel = $('stateLabel');
  const btnToggle = $('btnToggle'), toggleLabel = $('toggleLabel'), toggleIcon = $('toggleIcon');
  const btnSolstice = $('btnSolstice'), btnReset = $('btnReset');

  /* === BIND SLIDER ↔ NUMBER === */
  function bindPair(slider, num, display, fmtFn) {
    const sync = (fromSlider) => {
      const v = fromSlider ? parseFloat(slider.value) : parseFloat(num.value);
      const min = parseFloat(slider.min), max = parseFloat(slider.max);
      const clamped = Math.max(min, Math.min(max, isNaN(v) ? min : v));
      slider.value = clamped;
      num.value = clamped;
      if (display) display.textContent = fmtFn ? fmtFn(clamped) : clamped;
      return clamped;
    };
    slider.addEventListener('input', () => sync(true));
    num.addEventListener('change', () => sync(false));
    num.addEventListener('input', () => {
      const v = parseFloat(num.value);
      if (!isNaN(v) && v >= parseFloat(slider.min) && v <= parseFloat(slider.max)) sync(false);
    });
    return sync;
  }

  const syncDay   = bindPair(sliderDay, numDay, valDay, v => `Day ${Math.round(v)}`);
  const syncTilt  = bindPair(sliderTilt, numTilt, valTilt, v => `${parseFloat(v).toFixed(1)}°`);
  const syncSpeed = bindPair(sliderSpeed, numSpeed, valSpeed, v => `${Math.round(v)}×`);

  /* === HELPER: CLAMP === */
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* === ORBITAL COMPUTATION === */
  function computeOrbit(day, obliquityDeg) {
    const theta = ((day - 1) / DAYS_IN_YEAR) * TWO_PI;
    const obliquityRad = obliquityDeg * Math.PI / 180;

    const ex = SEMI_MAJOR * Math.cos(theta);
    const ey = SEMI_MINOR * Math.sin(theta);

    const sx = FOCUS_OFFSET;
    const sy = 0;

    let dx = sx - ex;
    let dy = sy - ey;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const sunDir = { x: dx / dist, y: dy / dist };

    const tiltX = Math.sin(obliquityRad);
    const tiltY = Math.cos(obliquityRad);

    const align = clamp(sunDir.x * tiltX + sunDir.y * tiltY, -1, 1);

    const northPct = ((align + 1) / 2) * 100;
    const southPct = 100 - northPct;

    const distAU = dist / AU_IN_PX;

    return { theta, ex, ey, sx, sy, sunDir, tiltX, tiltY, align, northPct, southPct, distAU, obliquityDeg, obliquityRad };
  }

  /* === ORBITAL PHASE === */
  function getPhase(northPct, southPct) {
    const diff = Math.abs(northPct - southPct);
    if (diff < 2) return { label: 'Equinox', cls: 'equinox', icon: '⚖' };
    if (northPct > southPct) {
      if (northPct > 85) return { label: 'Summer Solstice', cls: 'summer', icon: '☀' };
      return { label: 'Northern Summer', cls: 'summer', icon: '↑' };
    } else {
      if (southPct > 85) return { label: 'Winter Solstice', cls: 'winter', icon: '❄' };
      return { label: 'Southern Summer', cls: 'winter', icon: '↓' };
    }
  }

  /* === SIZE CANVAS === */
  function sizeCanvas(cvs, minH) {
    const wrap = cvs.parentElement;
    const w = Math.min(wrap.clientWidth - 6, 800);
    const h = Math.max(minH, Math.round(w * (cvs === orbitCanvas ? 0.72 : 0.48)));
    cvs.width = w; cvs.height = h;
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px';
    return { w, h };
  }

  /* === DRAW ORBIT === */
  function drawOrbit(data) {
    const { w, h } = sizeCanvas(orbitCanvas, 320);
    const ctx = ctxOrbit;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) / 420;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    /* Starfield */
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const seed = 42;
    for (let i = 0; i < 120; i++) {
      const sx = ((i * 137.5 + seed) % 2000) / 2000 * 600 - 300;
      const sy = ((i * 97.3 + seed) % 2000) / 2000 * 600 - 300;
      const sr = 0.3 + (i % 3) * 0.3;
      ctx.globalAlpha = 0.15 + (i % 5) * 0.05;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TWO_PI); ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* Orbit path */
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.ellipse(0, 0, SEMI_MAJOR, SEMI_MINOR, 0, 0, TWO_PI);
    ctx.stroke();
    ctx.setLineDash([]);

    /* Quadrant sectors (season labels) */
    const sectors = ['Spring', 'Summer', 'Autumn', 'Winter'];
    const secColors = ['rgba(0,230,118,0.04)', 'rgba(255,109,0,0.04)', 'rgba(253,216,53,0.04)', 'rgba(0,229,255,0.04)'];
    for (let i = 0; i < 4; i++) {
      const a1 = (i / 4) * TWO_PI, a2 = ((i + 1) / 4) * TWO_PI;
      ctx.fillStyle = secColors[i];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, SEMI_MAJOR * 0.6, a1 - Math.PI / 2, a2 - Math.PI / 2);
      ctx.closePath();
      ctx.fill();

      const la = (a1 + a2) / 2 - Math.PI / 2;
      const lr = SEMI_MAJOR * 0.75;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sectors[i], Math.cos(la) * lr, Math.sin(la) * lr);
    }

    /* Sun glow */
    const sunGrad = ctx.createRadialGradient(data.sx, data.sy, 0, data.sx, data.sy, 50);
    sunGrad.addColorStop(0, 'rgba(253,216,53,0.9)');
    sunGrad.addColorStop(0.3, 'rgba(253,216,53,0.3)');
    sunGrad.addColorStop(0.7, 'rgba(253,216,53,0.08)');
    sunGrad.addColorStop(1, 'rgba(253,216,53,0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath(); ctx.arc(data.sx, data.sy, 50, 0, TWO_PI); ctx.fill();

    /* Sun body */
    ctx.fillStyle = '#fdd835';
    ctx.shadowColor = 'rgba(253,216,53,0.6)';
    ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(data.sx, data.sy, 14, 0, TWO_PI); ctx.fill();
    ctx.shadowBlur = 0;

    /* Sun rays */
    ctx.strokeStyle = 'rgba(253,216,53,0.12)';
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TWO_PI;
      ctx.beginPath();
      ctx.moveTo(data.sx + Math.cos(a) * 18, data.sy + Math.sin(a) * 18);
      ctx.lineTo(data.sx + Math.cos(a) * 28, data.sy + Math.sin(a) * 28);
      ctx.stroke();
    }

    /* Solar radiation ray to Earth */
    ctx.strokeStyle = 'rgba(253,216,53,0.08)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.moveTo(data.sx, data.sy);
    ctx.lineTo(data.ex, data.ey);
    ctx.stroke();
    ctx.setLineDash([]);

    /* Earth glow */
    const earthGrad = ctx.createRadialGradient(data.ex, data.ey, 0, data.ex, data.ey, 30);
    earthGrad.addColorStop(0, 'rgba(0,229,255,0.2)');
    earthGrad.addColorStop(1, 'rgba(0,229,255,0)');
    ctx.fillStyle = earthGrad;
    ctx.beginPath(); ctx.arc(data.ex, data.ey, 30, 0, TWO_PI); ctx.fill();

    /* Earth body */
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = 'rgba(0,229,255,0.4)';
    ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(data.ex, data.ey, EARTH_RADIUS, 0, TWO_PI); ctx.fill();
    ctx.shadowBlur = 0;

    /* Tilt axis line (FIXED direction throughout orbit) */
    const tiltLen = EARTH_RADIUS * 3.8;
    const nx = data.tiltX, ny = -data.tiltY;
    const tx1 = data.ex + nx * tiltLen;
    const ty1 = data.ey + ny * tiltLen;
    const tx2 = data.ex - nx * tiltLen;
    const ty2 = data.ey - ny * tiltLen;

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(tx2, ty2); ctx.lineTo(tx1, ty1); ctx.stroke();
    ctx.setLineDash([]);

    /* Tilt axis arrowheads */
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    [
      [tx1, ty1, nx, ny],
      [tx2, ty2, -nx, -ny]
    ].forEach(([px, py, dx_, dy_]) => {
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - dx_ * 6 - dy_ * 3, py - dy_ * 6 + dx_ * 3);
      ctx.lineTo(px - dx_ * 6 + dy_ * 3, py - dy_ * 6 - dx_ * 3);
      ctx.closePath();
      ctx.fill();
    });

    /* Hemisphere labels */
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const nlx = data.ex + nx * (tiltLen + 14);
    const nly = data.ey + ny * (tiltLen + 14);
    ctx.fillText('N', nlx, nly + 2);
    ctx.fillText('S', data.ex - nx * (tiltLen + 14), data.ey - ny * (tiltLen + 14) + 2);

    /* Illumination indicator on Earth */
    const illAngle = Math.atan2(-data.sunDir.y, data.sunDir.x);
    ctx.strokeStyle = 'rgba(253,216,53,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(data.ex, data.ey, EARTH_RADIUS + 2, illAngle - Math.PI / 2, illAngle + Math.PI / 2);
    ctx.stroke();

    ctx.restore();
  }

  /* === DRAW INTENSITY === */
  function drawIntensity(data) {
    const { w, h } = sizeCanvas(intensityCanvas, 200);
    const ctx = ctxIntensity;
    ctx.clearRect(0, 0, w, h);

    const padL = 120, padR = 10, padT = 32, padB = 20;
    const barW = w - padL - padR;
    const barH = 20;
    const gap = 6;

    const bars = [
      { label: 'Northern Hemisphere', pct: data.northPct, color1: '#ff6d00', color2: '#ffb800' },
      { label: 'Southern Hemisphere', pct: data.southPct, color1: '#00e5ff', color2: '#00bcd4' }
    ];

    bars.forEach((bar, i) => {
      const y = padT + i * (barH + gap + 22);

      ctx.fillStyle = '#4a5268';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(bar.label, padL - 8, y + barH / 2);

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.roundRect(padL, y, barW, barH, 4);
      ctx.fill();

      const fillW = Math.max(clamp((bar.pct / 100) * barW, 2), 2);
      const grad = ctx.createLinearGradient(padL, y, padL + fillW, y);
      grad.addColorStop(0, bar.color1);
      grad.addColorStop(1, bar.color2);
      ctx.fillStyle = grad;
      ctx.shadowColor = bar.color1 + '55';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.roundRect(padL, y, fillW, barH, 4);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = bar.color1;
      ctx.font = '9px "Orbitron", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(bar.pct.toFixed(1) + '%', padL + barW + 6, y + barH / 2);

      /* Sub-label */
      ctx.fillStyle = '#4a5268';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('insolation flux', padL - 8, y + barH + 3);
    });

    /* Equator reference line */
    const eqY = padT + 2 * (barH + gap + 22);
    ctx.strokeStyle = 'rgba(0,230,118,0.12)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, eqY);
    ctx.lineTo(padL + barW, eqY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0,230,118,0.2)';
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('EQUATOR', padL + barW / 2, eqY + 2);

    /* Temperature labels */
    const northTemp = (data.northPct / 100) * 40 - 5;
    const southTemp = (data.southPct / 100) * 40 - 5;
    const tempBars = [
      { label: 'N Temp', val: northTemp, y: eqY + 16, color: northTemp > 20 ? '#ff6d00' : '#ffb800' },
      { label: 'S Temp', val: southTemp, y: eqY + 34, color: southTemp > 20 ? '#ff6d00' : '#00e5ff' }
    ];

    tempBars.forEach(tb => {
      const tw = clamp((tb.val + 5) / 45 * barW, 2, barW);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.roundRect(padL, tb.y, barW, 8, 2);
      ctx.fill();

      ctx.fillStyle = tb.color + '88';
      ctx.shadowColor = tb.color + '33';
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.roundRect(padL, tb.y, tw, 8, 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#4a5268';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(tb.label, padL + barW + 4, tb.y + 4);

      ctx.fillStyle = tb.color;
      ctx.font = '6px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(tb.val.toFixed(1) + '°C', padL + barW + 38, tb.y + 4);
    });
  }

  /* === UPDATE TELEMETRY === */
  function updateTelemetry(data) {
    tmDay.textContent = Math.round(data.day);
    tmNorth.textContent = data.northPct.toFixed(1) + '%';
    tmSouth.textContent = data.southPct.toFixed(1) + '%';
    tmDist.textContent = data.distAU.toFixed(4) + ' AU';
    tmObliquity.textContent = data.obliquityDeg.toFixed(1) + '°';

    if (data.obliquityDeg === 0) {
      tmPhase.textContent = 'NO TILT';
      tmPhase.className = 'tm-value phase-tag';
      return;
    }

    const phase = getPhase(data.northPct, data.southPct);
    tmPhase.textContent = phase.icon + ' ' + phase.label;
    tmPhase.className = 'tm-value phase-tag ' + phase.cls;
  }

  /* === SET STATE === */
  function setUIState(mode) {
    stateDot.className = 'state-dot';
    if (mode === 'running') { stateDot.classList.add('running'); stateLabel.textContent = 'RUNNING'; }
    else if (mode === 'paused') { stateDot.classList.add('paused'); stateLabel.textContent = 'PAUSED'; }
    else if (mode === 'solstice') { stateDot.classList.add('solstice'); stateLabel.textContent = 'SOLSTICE LOCK'; }
    else { stateLabel.textContent = 'STANDBY'; }
  }

  /* === FRAME RENDER === */
  function render() {
    const data = computeOrbit(state.day, state.obliquity);

    drawOrbit(data);
    drawIntensity(data);
    updateTelemetry(data);
  }

  /* === ANIMATION LOOP === */
  function tick() {
    if (state.running) {
      if (state.solsticeLock && state.solsticeDay !== null) {
        state.day = state.solsticeDay;
      } else {
        state.day += state.speed * (1 / 12);
        if (state.day > DAYS_IN_YEAR) state.day -= DAYS_IN_YEAR;
        if (state.day < 1) state.day += DAYS_IN_YEAR;
      }
      sliderDay.value = Math.round(state.day);
      numDay.value = Math.round(state.day);
      valDay.textContent = `Day ${Math.round(state.day)}`;
      render();
    }
    animId = requestAnimationFrame(tick);
  }

  /* === START ANIMATION === */
  function start() {
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(tick);
  }

  /* === TOGGLE RUN/PAUSE === */
  btnToggle.addEventListener('click', () => {
    state.running = !state.running;
    toggleLabel.textContent = state.running ? 'Pause Simulation' : 'Resume Simulation';
    if (state.running) {
      toggleIcon.style.fill = 'currentColor';
      setUIState(state.solsticeLock ? 'solstice' : 'running');
    } else {
      toggleIcon.style.fill = 'none';
      setUIState('paused');
    }
  });

  /* === LOCK SOLSTICE === */
  btnSolstice.addEventListener('click', () => {
    state.solsticeLock = !state.solsticeLock;
    if (state.solsticeLock) {
      const data = computeOrbit(state.day, state.obliquity);
      const phase = getPhase(data.northPct, data.southPct);
      if (phase.label.includes('Solstice')) {
        state.solsticeDay = Math.round(state.day);
      } else {
        const bestOffset = findNearestSolstice(state.day, state.obliquity);
        state.day = bestOffset;
        state.solsticeDay = bestOffset;
        sliderDay.value = Math.round(state.day);
        numDay.value = Math.round(state.day);
        valDay.textContent = `Day ${Math.round(state.day)}`;
      }
      btnSolstice.classList.add('ctrl-amber');
      btnSolstice.style.borderColor = 'rgba(255,109,0,0.4)';
      setUIState('solstice');
    } else {
      btnSolstice.classList.remove('ctrl-amber');
      btnSolstice.style.borderColor = '';
      setUIState(state.running ? 'running' : 'paused');
    }
  });

  function findNearestSolstice(currentDay, obliquity) {
    let maxAlign = -Infinity, bestDay = currentDay;
    for (let d = 1; d <= DAYS_IN_YEAR; d++) {
      const data = computeOrbit(d, obliquity);
      if (Math.abs(data.align) > maxAlign) {
        maxAlign = Math.abs(data.align);
        bestDay = d;
      }
    }
    return bestDay;
  }

  /* === RESET === */
  btnReset.addEventListener('click', () => {
    state.day = 1;
    state.obliquity = 23.5;
    state.speed = 3;
    state.running = true;
    state.solsticeLock = false;
    state.solsticeDay = null;

    sliderDay.value = 1; numDay.value = 1; valDay.textContent = 'Day 1';
    sliderTilt.value = 23.5; numTilt.value = 23.5; valTilt.textContent = '23.5°';
    sliderSpeed.value = 3; numSpeed.value = 3; valSpeed.textContent = '3×';

    toggleLabel.textContent = 'Pause Simulation';
    toggleIcon.style.fill = 'currentColor';
    btnSolstice.classList.remove('ctrl-amber');
    btnSolstice.style.borderColor = '';

    setUIState('running');
    render();
  });

  /* === SLIDER CHANGE TRIGGER RECALC === */
  sliderDay.addEventListener('input', () => {
    state.day = parseFloat(sliderDay.value);
    if (state.solsticeLock) state.solsticeDay = Math.round(state.day);
    render();
  });
  sliderTilt.addEventListener('input', () => {
    state.obliquity = parseFloat(sliderTilt.value);
    if (state.solsticeLock) {
      state.solsticeDay = findNearestSolstice(state.day, state.obliquity);
      state.day = state.solsticeDay;
      sliderDay.value = Math.round(state.day);
      numDay.value = Math.round(state.day);
      valDay.textContent = `Day ${Math.round(state.day)}`;
    }
    render();
  });
  sliderSpeed.addEventListener('input', () => { state.speed = parseFloat(sliderSpeed.value); });

  numDay.addEventListener('change', () => {
    const v = parseInt(numDay.value);
    if (!isNaN(v) && v >= 1 && v <= 365) { state.day = v; if (state.solsticeLock) state.solsticeDay = v; render(); }
  });
  numTilt.addEventListener('change', () => {
    const v = parseFloat(numTilt.value);
    if (!isNaN(v) && v >= 0 && v <= 30) { state.obliquity = v; render(); }
  });

  /* === RESIZE === */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });

  /* === INIT === */
  setUIState('running');
  render();
  start();

})();
