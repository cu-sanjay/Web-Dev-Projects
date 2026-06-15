(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#radarCanvas');
  const ctx = canvas.getContext('2d');
  const logContainer = $('#logContainer');
  const subsystemContainer = $('#subsystemContainer');
  const tVelocity = $('#tVelocity');
  const tAltitude = $('#tAltitude');
  const tTemp = $('#tTemp');
  const tEscape = $('#tEscape');
  const tBadge = $('#tBadge');
  const telePanel = $('.telemetry-panel');
  const phaseNodes = $$('.phase-node');
  const fuelSlider = $('#fuelSlider'); const fuelVal = $('#fuelVal');
  const thrustSlider = $('#thrustSlider'); const thrustVal = $('#thrustVal');
  const pitchSlider = $('#pitchSlider'); const pitchVal = $('#pitchVal');
  const pingSlider = $('#pingSlider'); const pingVal = $('#pingVal');
  const btnIgnite = $('#btnIgnite');
  const btnInject = $('#btnInject');
  const btnPurge = $('#btnPurge');

  let launched = false;
  let missionTime = 0;
  let fuel = 85, thrust = 3200, pitch = 45, ping = 10;

  /* ─── SUBSYSTEMS ─── */
  let subsystems = [
    { id:'propellant', label:'PROPELLANT TANKS', health:100 },
    { id:'thermal', label:'THERMAL SHIELDS', health:100 },
    { id:'guidance', label:'GUIDANCE COMPUTATIONS', health:100 },
    { id:'life', label:'LIFE SUPPORT', health:100 }
  ];

  /* ─── RADAR TARGETS ─── */
  let targets = [];
  for (let i = 0; i < 12; i++) {
    targets.push({
      angle: Math.random() * Math.PI * 2,
      range: 0.15 + Math.random() * 0.75,
      glow: 0, blinkPhase: Math.random() * Math.PI * 2
    });
  }

  /* ─── PHYSICS ─── */
  function getAltitude() { return launched ? Math.min(420, (missionTime * 0.3) + (thrust / 5000) * 50) : 0; }
  function getVelocity() { return launched ? Math.min(7.8, missionTime * 0.006 + (thrust / 5000) * 2) : 0; }
  function getEscapeVelocity(altKm) {
    const G = 6.674e-11, M = 5.97e24, R = 6371000;
    const r = R + altKm * 1000;
    return Math.sqrt(2 * G * M / r) / 1000;
  }
  function getCoreTemp() { return launched ? 20 + missionTime * 0.8 + (thrust / 5000) * 30 : 22; }

  /* ─── CANVAS ─── */
  let cw = 0, ch = 0;
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 500;
    const h = wrap.clientHeight || 240;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.scale(dpr, dpr); cw = w; ch = h;
  }

  let beamAngle = 0;

  function drawRadar() {
    const w = cw, h = ch;
    ctx.clearRect(0, 0, w, h);
    if (!w || !h) return;

    const cx = w / 2, cy = h / 2;
    const maxR = Math.min(cx, cy) - 10;

    /* bg */
    ctx.fillStyle = 'rgba(0,10,5,0.9)';
    ctx.fillRect(0, 0, w, h);

    /* rings */
    for (let i = 1; i <= 5; i++) {
      const r = maxR * (i / 5);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,229,255,' + (0.03 + i * 0.01) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    /* crosshairs */
    ctx.strokeStyle = 'rgba(0,229,255,0.04)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR); ctx.stroke();

    /* targets */
    beamAngle += 0.012;
    if (beamAngle > Math.PI * 2) beamAngle -= Math.PI * 2;

    targets.forEach(t => {
      const tx = cx + Math.cos(t.angle) * t.range * maxR;
      const ty = cy + Math.sin(t.angle) * t.range * maxR;

      /* beam intersection */
      const diff = t.angle - beamAngle;
      const hit = Math.abs(diff) < 0.15 || Math.abs(diff - Math.PI * 2) < 0.15 || Math.abs(diff + Math.PI * 2) < 0.15;
      if (hit) t.glow = Math.min(1, t.glow + 0.05);
      else t.glow = Math.max(0, t.glow - 0.01);

      const alpha = 0.1 + t.glow * 0.7;
      const r = 2 + t.glow * 2;

      ctx.beginPath();
      ctx.arc(tx, ty, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,229,255,' + alpha + ')';
      ctx.shadowColor = 'rgba(0,229,255,' + (t.glow * 0.5) + ')';
      ctx.shadowBlur = t.glow * 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    /* sweep beam */
    const beamEnd = beamAngle + 0.3;
    const grad = ctx.createConicGradient(beamAngle, cx, cy);
    grad.addColorStop(0, 'rgba(0,229,255,0.15)');
    grad.addColorStop(0.95, 'rgba(0,229,255,0.02)');
    grad.addColorStop(1, 'rgba(0,229,255,0)');

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxR, beamAngle, beamEnd);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    /* beam edge */
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const ex = cx + Math.cos(beamAngle) * maxR;
    const ey = cy + Math.sin(beamAngle) * maxR;
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = 'rgba(0,229,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    /* center dot */
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  /* ─── SUBSYSTEMS ─── */
  function renderSubsystems() {
    subsystemContainer.innerHTML = '';
    subsystems.forEach(s => {
      const ok = s.health >= 50;
      const div = document.createElement('div');
      div.className = 'sub-row';
      div.innerHTML = '<span class="sn">' + s.label + '</span><span class="sv ' + (ok ? 'ok' : 'fail') + '">' + s.health + '%</span>';
      subsystemContainer.appendChild(div);
    });
  }

  /* ─── LOG ─── */
  function log(msg, type) {
    const ts = '[T+' + missionTime.toFixed(0) + 's]';
    const div = document.createElement('div');
    div.className = 'log-entry' + (type ? ' ' + type : '');
    div.innerHTML = '<span class="ts">' + ts + '</span> ' + msg;
    logContainer.appendChild(div);
    const empty = logContainer.querySelector('.log-empty');
    if (empty) empty.remove();
    logContainer.scrollTop = logContainer.scrollHeight;
    while (logContainer.children.length > 50) logContainer.removeChild(logContainer.firstChild);
  }

  /* ─── MISSION LOOP ─── */
  let loopId = null;
  let logTimer = 0;

  function tick() {
    if (launched) {
      missionTime += 0.1;
      logTimer += 0.1;

      /* phase detection */
      const alt = getAltitude();
      if (alt < 10) setPhase('prelaunch');
      else if (alt < 60) setPhase('ascent');
      else if (alt < 200) setPhase('maxq');
      else setPhase('orbit');

      /* auto-log events */
      if (logTimer > 3) {
        const events = [
          { t: 10, msg: 'BOOSTER SEPARATION STABILIZED', type: '' },
          { t: 30, msg: 'MAX-Q CLEARED — STRUCTURAL INTEGRITY NOMINAL', type: '' },
          { t: 60, msg: 'MAIN ENGINE CUTOFF — COAST PHASE INITIATED', type: '' },
          { t: 120, msg: 'ORBITAL INSERTION BURN COMPLETE', type: '' }
        ];
        events.forEach(e => {
          if (Math.abs(missionTime - e.t) < 0.3) {
            log(e.msg, e.type);
            events.splice(events.indexOf(e), 1);
          }
        });
        logTimer = 0;
      }
    }

    drawRadar();
    updateTelemetry();
    loopId = requestAnimationFrame(tick);
  }

  /* ─── PHASE ─── */
  function setPhase(id) {
    phaseNodes.forEach(n => n.classList.toggle('active', n.dataset.phase === id));
  }

  /* ─── TELEMETRY ─── */
  function updateTelemetry() {
    const alt = getAltitude();
    const vel = getVelocity();
    const temp = getCoreTemp();
    const esc = getEscapeVelocity(alt);

    tVelocity.textContent = vel.toFixed(2) + ' km/s';
    tAltitude.textContent = alt.toFixed(1) + ' km';
    tTemp.textContent = temp.toFixed(1) + ' °C';
    tEscape.textContent = esc.toFixed(2) + ' km/s';

    /* safety status */
    const criticalSys = subsystems.filter(s => s.health < 50);
    if (criticalSys.length > 0) {
      tBadge.className = 'tele-badge critical';
      tBadge.textContent = '[ CRITICAL: ' + criticalSys[0].label + ' DEGRADED ]';
      telePanel.classList.add('critical');
    } else if (alt > 100) {
      tBadge.className = 'tele-badge nominal';
      tBadge.textContent = 'NOMINAL — ALL SYSTEMS STABLE';
      telePanel.classList.remove('critical');
    } else if (launched) {
      tBadge.className = 'tele-badge warning';
      tBadge.textContent = 'ASCENT PHASE — MONITORING';
      telePanel.classList.remove('critical');
    } else {
      tBadge.className = 'tele-badge standby';
      tBadge.textContent = 'PRE-LAUNCH STANDBY';
      telePanel.classList.remove('critical');
    }

    renderSubsystems();
  }

  /* ─── IGNITE ─── */
  function ignite() {
    if (launched) return;
    if (fuel < 5) { log('[HOLD] INSUFFICIENT FUEL FOR IGNITION', 'error'); return; }
    launched = true;
    missionTime = 0;
    log('[LAUNCH] MAIN STAGE IGNITION SEQUENCE INITIATED', '');
    log('[LAUNCH] THRUST +' + thrust + ' kN — VEHICLE LIFTOFF', '');
  }

  /* ─── INJECT FAILURE ─── */
  function injectFailure() {
    const failed = subsystems.filter(s => s.health >= 50);
    if (failed.length === 0) return;
    const target = failed[Math.floor(Math.random() * failed.length)];
    target.health = Math.max(0, target.health - (40 + Math.floor(Math.random() * 40)));
    log('[ALERT] SUBSYSTEM FAILURE: ' + target.label + ' AT ' + target.health + '%', 'error');
    if (target.health < 50) {
      log('[CRITICAL: ' + target.label + ' — MARGIN EXCEEDED]', 'error');
    }
    updateTelemetry();
  }

  /* ─── PURGE ─── */
  function purgeAll() {
    launched = false;
    missionTime = 0;
    fuel = 85; thrust = 3200; pitch = 45; ping = 10;
    fuelSlider.value = 85; fuelVal.textContent = '85%';
    thrustSlider.value = 3200; thrustVal.textContent = '3200 kN';
    pitchSlider.value = 45; pitchVal.textContent = '45°';
    pingSlider.value = 10; pingVal.textContent = '10s';
    subsystems.forEach(s => s.health = 100);
    setPhase('prelaunch');
    telePanel.classList.remove('critical');
    logContainer.innerHTML = '<div class="log-empty">STANDBY — AWAITING LAUNCH SEQUENCE</div>';
    log('[FLUSH] Operational matrix purged — all systems nominal', '');
  }

  /* ─── SLIDER EVENTS ─── */
  fuelSlider.addEventListener('input', function() {
    fuel = parseInt(this.value, 10); fuelVal.textContent = fuel + '%';
  });
  thrustSlider.addEventListener('input', function() {
    thrust = parseInt(this.value, 10); thrustVal.textContent = thrust + ' kN';
  });
  pitchSlider.addEventListener('input', function() {
    pitch = parseInt(this.value, 10); pitchVal.textContent = pitch + '°';
  });
  pingSlider.addEventListener('input', function() {
    ping = parseInt(this.value, 10); pingVal.textContent = ping + 's';
  });

  /* ─── PHASE CLICK ─── */
  phaseNodes.forEach(n => n.addEventListener('click', function() {
    // allow manual phase set
    if (!launched) setPhase(this.dataset.phase);
  }));

  /* ─── ADMIN ─── */
  btnIgnite.addEventListener('click', ignite);
  btnInject.addEventListener('click', injectFailure);
  btnPurge.addEventListener('click', purgeAll);

  /* ─── RESIZE ─── */
  let resizeTm;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTm);
    resizeTm = setTimeout(resizeCanvas, 100);
  });

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    log('[SYSTEM] Mission Control Dashboard online', '');
    tick();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
