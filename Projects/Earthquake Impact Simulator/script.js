(function () {
  'use strict';

  /* === CONSTANTS === */
  const P_WAVE_SPEED = 6;    // km/s (scaled)
  const S_WAVE_SPEED = 3.5;  // km/s
  const BUILDING_COUNT = 18;
  const MERCALLI_LEVELS = [
    { maxPGA: 0.0017, label: 'I. Instrumental', cls: 'low' },
    { maxPGA: 0.014,  label: 'II–III. Light',  cls: 'low' },
    { maxPGA: 0.039,  label: 'IV. Moderate',   cls: 'moderate' },
    { maxPGA: 0.092,  label: 'V. Strong',      cls: 'moderate' },
    { maxPGA: 0.18,   label: 'VI. Strong',     cls: 'moderate' },
    { maxPGA: 0.34,   label: 'VII. Very Strong', cls: 'strong' },
    { maxPGA: 0.65,   label: 'VIII. Destructive', cls: 'strong' },
    { maxPGA: 1.24,   label: 'IX. Violent',    cls: 'severe' },
    { maxPGA: 2.5,    label: 'X. Extreme',     cls: 'severe' },
    { maxPGA: 5.0,    label: 'XI–XII. Catastrophic', cls: 'severe' }
  ];

  /* === STATE === */
  let state = {
    magnitude: 5, depth: 30, soilFactor: 1.0,
    epicenterX: 0.5, // normalized
    ruptured: false,
    ruptureTime: 0,
    pRadius: 0, sRadius: 0,
    pga: 0, radius: 0,
    retrofitted: false,
    buildings: [],
    active: false
  };

  /* === BUILDINGS === */
  function initBuildings() {
    state.buildings = [];
    for (let i = 0; i < BUILDING_COUNT; i++) {
      const x = (i + 0.5) / BUILDING_COUNT;
      const h = 40 + Math.random() * 50;
      state.buildings.push({
        x, height: h, width: 12,
        drift: 0, collapse: false,
        baseX: 0
      });
    }
  }

  /* === DOM === */
  const $ = id => document.getElementById(id);
  const seismicCanvas = $('seismicCanvas'), ctx = seismicCanvas.getContext('2d');
  const sliderMag = $('sliderMag'), valMag = $('valMag');
  const sliderDepth = $('sliderDepth'), valDepth = $('valDepth');
  const selectSoil = $('selectSoil');
  const tmPGA = $('tmPGA'), tmRadius = $('tmRadius');
  const tmMercalli = $('tmMercalli'), tmIntegrity = $('tmIntegrity');
  const gmP = $('gmP'), gmS = $('gmS'), gmBuild = $('gmBuild');
  const stateDot = $('stateDot'), stateLabel = $('stateLabel');
  const btnTrigger = $('btnTrigger'), btnRetrofit = $('btnRetrofit'), btnPurge = $('btnPurge');

  /* === BIND CONTROLS === */
  sliderMag.addEventListener('input', () => {
    state.magnitude = parseFloat(sliderMag.value);
    valMag.textContent = state.magnitude.toFixed(1);
  });
  sliderDepth.addEventListener('input', () => {
    state.depth = parseFloat(sliderDepth.value);
    valDepth.textContent = Math.round(state.depth) + ' km';
  });
  selectSoil.addEventListener('change', () => {
    state.soilFactor = parseFloat(selectSoil.value);
  });

  /* === LOGARITHMIC ENERGY === */
  function calcEnergy(mag) {
    return Math.pow(10, 4.8 + 1.5 * mag);
  }

  /* === PGA FROM DISTANCE === */
  function calcPGA(mag, depthKm, soilFactor) {
    const depthAtten = 0.5 * Math.exp(-0.003 * depthKm);
    const magFactor = 1 + 0.3 * Math.pow(mag - 1, 1.5);
    return mag * 0.04 * magFactor * depthAtten * soilFactor;
  }

  /* === MERCALLI === */
  function getMercalli(pga) {
    for (let i = MERCALLI_LEVELS.length - 1; i >= 0; i--) {
      if (pga >= (i > 0 ? MERCALLI_LEVELS[i-1].maxPGA : 0)) {
        return MERCALLI_LEVELS[i];
      }
    }
    return MERCALLI_LEVELS[0];
  }

  /* === SIZE CANVAS === */
  function sizeCanvas() {
    const wrap = seismicCanvas.parentElement;
    const w = Math.min(wrap.clientWidth - 4, 900);
    const h = Math.max(400, Math.round(w * 0.6));
    seismicCanvas.width = w; seismicCanvas.height = h;
    seismicCanvas.style.width = w + 'px'; seismicCanvas.style.height = h + 'px';
    return { w, h };
  }

  /* === DRAW === */
  function drawScene(time) {
    const { w, h } = sizeCanvas();
    ctx.clearRect(0, 0, w, h);

    /* Background */
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#080b16'); bg.addColorStop(0.5, '#05060b'); bg.addColorStop(1, '#0a0f12');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    /* Sky gradient for buildings */
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.25);
    skyGrad.addColorStop(0, 'rgba(255,255,255,0.02)'); skyGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, w, h * 0.25);

    /* Subsurface layers */
    const groundY = h * 0.3;
    const layers = ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.015)', 'rgba(255,255,255,0.01)'];
    layers.forEach((c, i) => {
      ctx.fillStyle = c;
      const ly = groundY + i * 12;
      ctx.fillRect(0, ly, w, 12);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.3;
      ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(w, ly); ctx.stroke();
    });

    /* Epicenter marker */
    const epicX = state.epicenterX * w;
    const epicY = groundY + state.depth * 0.6;

    if (state.ruptured) {
      const dt = (time - state.ruptureTime) / 1000;
      const pSpeed = P_WAVE_SPEED * 3;  // px/s
      const sSpeed = S_WAVE_SPEED * 3;

      state.pRadius = Math.min(dt * pSpeed, w * 1.5);
      state.sRadius = Math.min(dt * sSpeed, w * 1.5);

      /* P-wave ring */
      if (state.pRadius > 0) {
        const alpha = Math.max(0, 0.5 - state.pRadius / (w * 1.5) * 0.5);
        ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(0,229,255,0.3)';
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(epicX, epicY, state.pRadius, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(0,229,255,${alpha * 0.15})`;
        ctx.beginPath(); ctx.arc(epicX, epicY, state.pRadius * 0.8, 0, Math.PI * 2); ctx.fill();
      }

      /* S-wave ring */
      if (state.sRadius > 0) {
        const alpha = Math.max(0, 0.6 - state.sRadius / (w * 1.5) * 0.6);
        ctx.strokeStyle = `rgba(255,109,0,${alpha})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(255,109,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(epicX, epicY, state.sRadius, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255,109,0,${alpha * 0.1})`;
        ctx.beginPath(); ctx.arc(epicX, epicY, state.sRadius * 0.7, 0, Math.PI * 2); ctx.fill();
      }

      /* Fault line highlight */
      ctx.strokeStyle = `rgba(255,23,68,${0.2 + 0.15 * Math.sin(time / 200)})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(epicX - 30, epicY);
      ctx.lineTo(epicX + 30, epicY);
      ctx.stroke();
      ctx.setLineDash([]);

      /* Epicenter glow */
      const glowR = 8 + 4 * Math.sin(time / 150);
      ctx.fillStyle = `rgba(255,23,68,${0.3 + 0.2 * Math.sin(time / 200)})`;
      ctx.shadowColor = 'rgba(255,23,68,0.5)';
      ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(epicX, epicY, glowR, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    /* Epicenter dot */
    ctx.fillStyle = '#ffb800';
    ctx.shadowColor = 'rgba(255,184,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(epicX, epicY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#4a5268';
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('HYPOCENTER', epicX, epicY + 8);

    /* Buildings */
    const buildingsY = h * 0.25;
    const pga = state.pga;

    state.buildings.forEach((b, i) => {
      const bx = b.x * w;
      const bw = b.width;
      const bh = b.height;

      /* Drift from S-wave */
      if (state.ruptured && state.sRadius > 0) {
        const distToEpic = Math.abs(bx - epicX);
        const inSWave = distToEpic < state.sRadius * 1.2;
        if (inSWave && !b.collapse) {
          const intensity = Math.max(0, 1 - distToEpic / (state.sRadius * 1.2));
          const shakeAmp = pga * 40 * intensity;
          b.drift = Math.sin(time / 80 + b.x * 10) * shakeAmp * (state.retrofitted ? 0.25 : 1);
          if (pga > 1.5 && intensity > 0.7 && Math.random() < 0.005) b.collapse = true;
        } else if (!b.collapse) {
          b.drift *= 0.95;
        }
      } else {
        b.drift *= 0.95;
      }

      const isCollapse = b.collapse;
      const dispX = isCollapse ? b.drift * 0.5 : b.drift;

      /* Shadow */
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(bx + dispX - bw/2 + 2, buildingsY - bh + 2, bw, bh);

      /* Building body */
      const health = isCollapse ? 0 : Math.max(0, 1 - Math.abs(b.drift) / 30);
      const r = Math.round(20 + (1 - health) * 235);
      const g = Math.round(200 * health);
      const bb = Math.round(80 * health);
      ctx.fillStyle = `rgb(${r},${g},${bb})`;
      ctx.shadowColor = isCollapse ? 'rgba(255,23,68,0.3)' : `rgba(${r},${g},${bb},0.2)`;
      ctx.shadowBlur = 4;
      ctx.fillRect(bx + dispX - bw/2, buildingsY - bh, bw, bh);
      ctx.shadowBlur = 0;

      /* Windows */
      ctx.fillStyle = isCollapse ? 'rgba(255,23,68,0.1)' : `rgba(0,229,255,${0.06 + 0.06 * Math.sin(time / 1000 + i)})`;
      for (let wy = 0; wy < bh - 8; wy += 10) {
        for (let wx = 0; wx < 2; wx++) {
          ctx.fillRect(bx + dispX - bw/2 + 3 + wx * 5, buildingsY - bh + 5 + wy, 3, 5);
        }
      }

      /* Collapse indicator */
      if (isCollapse) {
        ctx.fillStyle = 'rgba(255,23,68,0.6)';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('✕', bx + dispX, buildingsY - bh / 2);
      }
    });

    /* Ground line */
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, buildingsY); ctx.lineTo(w, buildingsY); ctx.stroke();

    /* Labels */
    ctx.fillStyle = '#4a5268';
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('P-Wave  ⬤', 10, h - 8);
    ctx.fillStyle = '#00e5ff'; ctx.fillText('⬤', 10, h - 8);
    ctx.fillStyle = '#4a5268';
    ctx.fillText('  S-Wave  ⬤', 80, h - 8);
    ctx.fillStyle = '#ff6d00'; ctx.fillText('⬤', 80, h - 8);

    /* Mag label */
    if (state.ruptured) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText('M ' + state.magnitude.toFixed(1) + ' · Depth ' + Math.round(state.depth) + ' km', w - 10, h - 8);
    }
  }

  /* === UPDATE TELEMETRY === */
  function updateTelemetry(time) {
    if (!state.ruptured) return;

    const w = seismicCanvas.width;
    const pga = calcPGA(state.magnitude, state.depth, state.soilFactor);
    state.pga = pga;

    const radiusKm = Math.min(state.pRadius / 3, 200);
    state.radius = radiusKm;

    /* PGA */
    tmPGA.textContent = pga.toFixed(4) + ' g';

    /* Radius */
    tmRadius.textContent = radiusKm.toFixed(1) + ' km';

    /* Mercalli */
    const merc = getMercalli(pga);
    tmMercalli.textContent = merc.label;
    tmMercalli.className = 'tm-val mercalli ' + merc.cls;

    /* Structural integrity */
    const totalB = state.buildings.length;
    const collapsedB = state.buildings.filter(b => b.collapse).length;
    const avgDrift = state.buildings.reduce((s, b) => s + Math.abs(b.drift), 0) / totalB;
    const integrity = Math.max(0, Math.min(100, 100 - (avgDrift * 8 + collapsedB * 20)));
    tmIntegrity.textContent = integrity.toFixed(1) + '%';
    tmIntegrity.style.color = integrity < 40 ? '#ff1744' : integrity < 70 ? '#ffb800' : '#00e676';

    if (integrity < 30) { stateDot.className = 'state-dot collapse'; stateLabel.textContent = 'COLLAPSE'; }
    else if (state.ruptured) { stateDot.className = 'state-dot active'; stateLabel.textContent = 'ACTIVE'; }

    /* Gauges */
    gmP.style.width = Math.min(state.pRadius / (w * 0.5) * 100, 100) + '%';
    gmS.style.width = Math.min(state.sRadius / (w * 0.5) * 100, 100) + '%';
    gmBuild.style.width = integrity.toFixed(0) + '%';
  }

  /* === ANIMATION === */
  let animId, startTime = 0;

  function tick(time) {
    if (!startTime) startTime = time;

    drawScene(time);
    if (state.ruptured) updateTelemetry(time);

    animId = requestAnimationFrame(tick);
  }

  /* === EVENTS === */
  seismicCanvas.addEventListener('click', (e) => {
    const rect = seismicCanvas.getBoundingClientRect();
    state.epicenterX = (e.clientX - rect.left) / rect.width;
    if (state.ruptured) {
      /* Reset wave if already ruptured */
      state.ruptureTime = performance.now();
      state.pRadius = 0; state.sRadius = 0;
    }
  });

  btnTrigger.addEventListener('click', () => {
    state.ruptured = true;
    state.ruptureTime = performance.now();
    state.pRadius = 0; state.sRadius = 0;
    state.buildings.forEach(b => { b.drift = 0; b.collapse = false; });
    state.active = true;
  });

  btnRetrofit.addEventListener('click', () => {
    state.retrofitted = !state.retrofitted;
    btnRetrofit.style.borderColor = state.retrofitted ? 'rgba(0,229,255,0.4)' : '';
    btnRetrofit.style.background = state.retrofitted ? 'rgba(0,229,255,0.08)' : '';
  });

  btnPurge.addEventListener('click', () => {
    state.ruptured = false;
    state.active = false;
    state.pRadius = 0; state.sRadius = 0;
    state.pga = 0; state.radius = 0;
    state.retrofitted = false;
    btnRetrofit.style.borderColor = ''; btnRetrofit.style.background = '';
    state.buildings.forEach(b => { b.drift = 0; b.collapse = false; });
    tmPGA.textContent = '—'; tmRadius.textContent = '—';
    tmMercalli.textContent = '—'; tmMercalli.className = 'tm-val mercalli';
    tmIntegrity.textContent = '—'; tmIntegrity.style.color = '';
    gmP.style.width = '0%'; gmS.style.width = '0%'; gmBuild.style.width = '0%';
    stateDot.className = 'state-dot'; stateLabel.textContent = 'STABILIZED';
  });

  /* === RESIZE === */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {}, 150);
  });

  /* === INIT === */
  initBuildings();
  tick(0);

})();
