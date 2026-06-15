(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#trafficCanvas');
  const ctx = canvas.getContext('2d');
  const modeBtns = $$('.mode-btn');
  const spawnSlider = $('#spawnSlider');
  const spawnVal = $('#spawnVal');
  const speedSlider = $('#speedSlider');
  const speedVal = $('#speedVal');
  const greenSlider = $('#greenSlider');
  const greenVal = $('#greenVal');
  const yellowSlider = $('#yellowSlider');
  const yellowVal = $('#yellowVal');
  const logContainer = $('#logContainer');
  const teleDispatched = $('#teleDispatched');
  const teleActive = $('#teleActive');
  const teleCongestion = $('#teleCongestion');
  const teleDelay = $('#teleDelay');
  const teleLight = $('#teleLight');
  const teleBadge = $('#teleBadge');
  const btnSurge = $('#btnSurge');
  const btnManualSwitch = $('#btnManualSwitch');
  const btnFlush = $('#btnFlush');

  /* ─── PARAMS ─── */
  let mode = 'auto';
  let spawnRate = 6;
  let speedLimit = 3;
  let greenTime = 10;
  let yellowTime = 3;

  /* ─── SIGNAL STATE ─── */
  let signalState = 'NS_GREEN'; /* NS_GREEN, NS_YELLOW, EW_GREEN, EW_YELLOW */
  let signalTimer = 0;
  let lastSignalSwitch = 0;

  /* ─── VEHICLES ─── */
  let vehicles = [];
  let nextId = 1;
  let totalDispatched = 0;
  let totalDelayMs = 0;
  let delaySampleCount = 0;

  /* ─── LANE DEFINITIONS ─── */
  /* Roads: NS (vertical) and EW (horizontal) */
  const LANES = {
    NS_DOWN: { x: -1, dir: 'S', startR: -1, endR: 1, laneX: 0 },
    NS_UP: { x: -1, dir: 'N', startR: 1, endR: -1, laneX: 0 },
    EW_RIGHT: { y: -1, dir: 'E', startC: -1, endC: 1, laneY: 0 },
    EW_LEFT: { y: -1, dir: 'W', startC: 1, endC: -1, laneY: 0 }
  };

  const CAR_W = 14;
  const CAR_H = 8;

  let running = true;
  let frameCount = 0;

  /* ─── CANVAS ─── */
  let cw = 0, ch = 0;

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 400;
    const h = wrap.clientHeight || 340;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    cw = w;
    ch = h;
  }

  /* ─── ROAD GEOMETRY ─── */
  function getRoadParams() {
    const cx = cw / 2;
    const cy = ch / 2;
    const roadW = Math.min(cw, ch) * 0.28;
    const laneW = roadW / 2;
    return { cx, cy, roadW, laneW };
  }

  /* ─── VEHICLE SPAWNING ─── */
  function spawnVehicle() {
    const p = getRoadParams();
    const r = Math.random();
    let car;

    if (r < 0.25) {
      /* NS down: top edge, moving south */
      const x = p.cx - p.laneW/2 - CAR_W/2;
      car = { id: nextId++, x, y: -CAR_H, vx: 0, vy: speedLimit, lane: 'NS', sub: 'down', w: CAR_W, h: CAR_H, stopped: false, spawnTime: performance.now() };
    } else if (r < 0.5) {
      /* NS up: bottom edge, moving north */
      const x = p.cx + p.laneW/2 - CAR_W/2;
      car = { id: nextId++, x, y: ch + CAR_H, vx: 0, vy: -speedLimit, lane: 'NS', sub: 'up', w: CAR_W, h: CAR_H, stopped: false, spawnTime: performance.now() };
    } else if (r < 0.75) {
      /* EW right: left edge, moving east */
      const y = p.cy - p.laneW/2 - CAR_H/2;
      car = { id: nextId++, x: -CAR_W, y, vx: speedLimit, vy: 0, lane: 'EW', sub: 'right', w: CAR_H, h: CAR_W, stopped: false, spawnTime: performance.now() };
    } else {
      /* EW left: right edge, moving west */
      const y = p.cy + p.laneW/2 - CAR_H/2;
      car = { id: nextId++, x: cw + CAR_W, y, vx: -speedLimit, vy: 0, lane: 'EW', sub: 'left', w: CAR_H, h: CAR_W, stopped: false, spawnTime: performance.now() };
    }
    vehicles.push(car);
    totalDispatched++;
  }

  /* ─── SIGNAL STATE MACHINE ─── */
  function advanceSignal() {
    if (mode === 'manual') return;
    const now = performance.now();
    const dt = (now - lastSignalSwitch) / 1000;
    if (dt >= getPhaseDuration()) {
      switch (signalState) {
        case 'NS_GREEN': signalState = 'NS_YELLOW'; break;
        case 'NS_YELLOW': signalState = 'EW_GREEN'; break;
        case 'EW_GREEN': signalState = 'EW_YELLOW'; break;
        case 'EW_YELLOW': signalState = 'NS_GREEN'; break;
      }
      lastSignalSwitch = now;
    }
  }

  function getPhaseDuration() {
    if (signalState === 'NS_YELLOW' || signalState === 'EW_YELLOW') return yellowTime;
    return greenTime;
  }

  function getSignalColor(dir) {
    /* dir: 'NS' or 'EW' */
    if (dir === 'NS') {
      if (signalState === 'NS_GREEN') return 'green';
      if (signalState === 'NS_YELLOW') return 'yellow';
      return 'red';
    }
    if (signalState === 'EW_GREEN') return 'green';
    if (signalState === 'EW_YELLOW') return 'yellow';
    return 'red';
  }

  /* ─── MANUAL SWITCH ─── */
  function manualSwitch() {
    const order = ['NS_GREEN', 'NS_YELLOW', 'EW_GREEN', 'EW_YELLOW'];
    const idx = order.indexOf(signalState);
    signalState = order[(idx + 1) % 4];
    lastSignalSwitch = performance.now();
    logIncident('[MANUAL] Phase switched to ' + signalState, '');
  }

  /* ─── VEHICLE UPDATE ─── */
  function updateVehicles() {
    const p = getRoadParams();
    const stopLineNS = p.cy - p.roadW/2 - 4;
    const stopLineNS_exit = p.cy + p.roadW/2 + 4;
    const stopLineEW = p.cx - p.roadW/2 - 4;
    const stopLineEW_exit = p.cx + p.roadW/2 + 4;

    const nsColor = getSignalColor('NS');
    const ewColor = getSignalColor('EW');

    for (const car of vehicles) {
      let ahead = null;
      let minDist = Infinity;

      /* find car ahead in same lane */
      for (const other of vehicles) {
        if (other.id === car.id) continue;
        if (other.lane !== car.lane || other.sub !== car.sub) continue;
        let dist;
        if (car.vy < 0) dist = other.y - car.y; /* NS up */
        else if (car.vy > 0) dist = car.y - other.y; /* NS down */
        else if (car.vx > 0) dist = car.x - other.x; /* EW right */
        else dist = other.x - car.x; /* EW left */
        if (dist > 0 && dist < minDist) { minDist = dist; ahead = other; }
      }

      const targetSpeed = speedLimit;
      let desiredVx = car.vx > 0 ? targetSpeed : (car.vx < 0 ? -targetSpeed : 0);
      let desiredVy = car.vy > 0 ? targetSpeed : (car.vy < 0 ? -targetSpeed : 0);

      /* check red light at stop line */
      if (car.lane === 'NS') {
        const atStop = (car.vy > 0 && car.y < stopLineNS && car.y + car.h > stopLineNS - 10) ||
                       (car.vy < 0 && car.y > stopLineNS_exit && car.y - car.h < stopLineNS_exit + 10);
        if (atStop && nsColor === 'red') { desiredVy = 0; }
        if (atStop && nsColor === 'yellow' && car.vy > 0 && car.y < stopLineNS) { desiredVy = 0; }
      }
      if (car.lane === 'EW') {
        const atStop = (car.vx > 0 && car.x < stopLineEW && car.x + car.w > stopLineEW - 10) ||
                       (car.vx < 0 && car.x > stopLineEW_exit && car.x - car.w < stopLineEW_exit + 10);
        if (atStop && ewColor === 'red') { desiredVx = 0; }
        if (atStop && ewColor === 'yellow' && car.vx > 0 && car.x < stopLineEW) { desiredVx = 0; }
      }

      /* car following */
      if (ahead && minDist < 30) {
        if (car.vx > 0) desiredVx = Math.min(desiredVx, targetSpeed * 0.3);
        else if (car.vx < 0) desiredVx = Math.max(desiredVx, -targetSpeed * 0.3);
        if (car.vy > 0) desiredVy = Math.min(desiredVy, targetSpeed * 0.3);
        else if (car.vy < 0) desiredVy = Math.max(desiredVy, -targetSpeed * 0.3);
      }

      /* smooth acceleration */
      const accel = 0.15;
      car.vx += (desiredVx - car.vx) * accel;
      car.vy += (desiredVy - car.vy) * accel;

      /* clamp speed */
      if (Math.abs(car.vx) < 0.01) car.vx = 0;
      if (Math.abs(car.vy) < 0.01) car.vy = 0;
      if (car.vx > targetSpeed) car.vx = targetSpeed;
      if (car.vx < -targetSpeed) car.vx = -targetSpeed;
      if (car.vy > targetSpeed) car.vy = targetSpeed;
      if (car.vy < -targetSpeed) car.vy = -targetSpeed;

      car.stopped = (car.vx === 0 && car.vy === 0) || (Math.abs(car.vx) < 0.1 && Math.abs(car.vy) < 0.1);

      /* move */
      car.x += car.vx;
      car.y += car.vy;

      /* delay tracking */
      if (car.stopped && !car._delayStarted) { car._delayStarted = true; car._delayStart = performance.now(); }
      if (!car.stopped && car._delayStarted) {
        totalDelayMs += (performance.now() - car._delayStart);
        delaySampleCount++;
        car._delayStarted = false;
      }
    }

    /* remove off-screen */
    const margin = 60;
    vehicles = vehicles.filter(c =>
      c.x > -margin && c.x < cw + margin &&
      c.y > -margin && c.y < ch + margin
    );
  }

  /* ─── DRAW ─── */
  function draw() {
    const w = cw, h = ch;
    if (w === 0 || h === 0) return;
    ctx.clearRect(0, 0, w, h);

    const p = getRoadParams();
    const { cx, cy, roadW, laneW } = p;

    /* background */
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, w, h);

    /* road surface */
    ctx.fillStyle = 'rgba(30,35,45,0.9)';
    /* vertical road */
    ctx.fillRect(cx - roadW/2, 0, roadW, h);
    /* horizontal road */
    ctx.fillRect(0, cy - roadW/2, w, roadW);

    /* lane dividers */
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    /* NS lane line */
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    /* EW lane line */
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.setLineDash([]);

    /* stop lines */
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    const sl = roadW/2 + 4;
    ctx.beginPath(); ctx.moveTo(cx - sl, cy - roadW/2); ctx.lineTo(cx - sl, cy + roadW/2); ctx.stroke(); /* EW left stop */
    ctx.beginPath(); ctx.moveTo(cx + sl, cy - roadW/2); ctx.lineTo(cx + sl, cy + roadW/2); ctx.stroke(); /* EW right stop */
    ctx.beginPath(); ctx.moveTo(cx - roadW/2, cy - sl); ctx.lineTo(cx + roadW/2, cy - sl); ctx.stroke(); /* NS top stop */
    ctx.beginPath(); ctx.moveTo(cx - roadW/2, cy + sl); ctx.lineTo(cx + roadW/2, cy + sl); ctx.stroke(); /* NS bottom stop */

    /* intersection center box */
    ctx.fillStyle = 'rgba(40,45,55,0.5)';
    ctx.fillRect(cx - roadW/2, cy - roadW/2, roadW, roadW);

    /* traffic signals */
    drawSignal(cx - roadW/2 - 14, cy - roadW/2 - 4, getSignalColor('NS')); /* NS approach top */
    drawSignal(cx - roadW/2 - 14, cy + roadW/2 + 10, getSignalColor('NS')); /* NS approach bottom */
    drawSignal(cx - roadW/2 - 14, cy, getSignalColor('EW')); /* EW approach left */
    drawSignal(cx + roadW/2 + 8, cy, getSignalColor('EW')); /* EW approach right */

    /* draw cars */
    for (const car of vehicles) {
      const colors = ['#00e5ff', '#ffc800', '#00e676', '#ff6d00', '#d500f9', '#ff1744'];
      const colorIdx = (car.id * 7) % colors.length;
      ctx.fillStyle = colors[colorIdx];
      ctx.globalAlpha = car.stopped ? 0.5 : 0.9;
      ctx.shadowColor = colors[colorIdx];
      ctx.shadowBlur = car.stopped ? 0 : 4;
      ctx.fillRect(car.x, car.y, car.w, car.h);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      /* tail light */
      ctx.fillStyle = car.stopped ? '#ff1744' : 'rgba(255,255,255,0.1)';
      ctx.shadowColor = car.stopped ? '#ff1744' : 'transparent';
      ctx.shadowBlur = car.stopped ? 6 : 0;
      if (car.vy > 0) ctx.fillRect(car.x + 2, car.y, 4, 2);
      else if (car.vy < 0) ctx.fillRect(car.x + 2, car.y + car.h - 2, 4, 2);
      else if (car.vx > 0) ctx.fillRect(car.x, car.y + 2, 2, 4);
      else ctx.fillRect(car.x + car.w - 2, car.y + 2, 2, 4);
      ctx.shadowBlur = 0;
    }
  }

  function drawSignal(x, y, color) {
    const r = 6;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x, y - 2, 18, 28);
    const colors = ['#ff1744', '#ffc800', '#00e676'];
    const labels = ['red', 'yellow', 'green'];
    for (let i = 0; i < 3; i++) {
      const cy2 = y + 2 + i * 9;
      ctx.beginPath();
      ctx.arc(x + 9, cy2, r - 2, 0, Math.PI * 2);
      ctx.fillStyle = labels[i] === color ? colors[i] : 'rgba(255,255,255,0.03)';
      ctx.shadowColor = labels[i] === color ? colors[i] : 'transparent';
      ctx.shadowBlur = labels[i] === color ? 8 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  /* ─── INCIDENT LOG ─── */
  function logIncident(msg, type) {
    const ts = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = 'log-entry' + (type === 'critical' ? ' critical' : '');
    div.innerHTML = '<span class="ts">[' + ts + ']</span> ' + msg;
    logContainer.appendChild(div);
    const empty = logContainer.querySelector('.log-empty');
    if (empty) empty.remove();
    logContainer.scrollTop = logContainer.scrollHeight;
    /* keep last 50 */
    while (logContainer.children.length > 50) logContainer.removeChild(logContainer.firstChild);
  }

  /* ─── TELEMETRY ─── */
  function updateTelemetry() {
    const active = vehicles.length;
    const stopped = vehicles.filter(c => c.stopped).length;
    const congestion = active > 0 ? (stopped / active) * 100 : 0;
    const avgDelay = delaySampleCount > 0 ? (totalDelayMs / delaySampleCount).toFixed(1) : '0';

    teleDispatched.textContent = totalDispatched;
    teleActive.textContent = active;
    teleCongestion.textContent = congestion.toFixed(0) + '%';
    teleDelay.textContent = avgDelay + 'ms';

    const nsCol = getSignalColor('NS');
    const ewCol = getSignalColor('EW');
    teleLight.textContent = 'NS:' + nsCol.toUpperCase() + ' EW:' + ewCol.toUpperCase();

    /* badge */
    const panel = teleCongestion.closest('.panel') || document.querySelector('.telemetry-panel');
    if (congestion > 70) {
      teleBadge.className = 'tele-badge critical';
      teleBadge.textContent = '[ GRIDLOCK: CONGESTION CRITICAL ]';
      panel.classList.add('congested');
    } else if (congestion > 35) {
      teleBadge.className = 'tele-badge moderate';
      teleBadge.textContent = 'MODERATE CONGESTION';
      panel.classList.remove('congested');
    } else if (active > 0) {
      teleBadge.className = 'tele-badge flow';
      teleBadge.textContent = 'FLOW STABLE';
      panel.classList.remove('congested');
    } else {
      teleBadge.className = 'tele-badge standby';
      teleBadge.textContent = 'STANDBY';
      panel.classList.remove('congested');
    }
  }

  /* ─── RUSH HOUR SURGE ─── */
  function triggerSurge() {
    for (let i = 0; i < 15; i++) {
      spawnVehicle();
    }
    logIncident('[SURGE] 15 vehicles injected across all lanes', '');
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    vehicles = [];
    totalDispatched = 0;
    totalDelayMs = 0;
    delaySampleCount = 0;
    nextId = 1;
    signalState = 'NS_GREEN';
    lastSignalSwitch = performance.now();
    logContainer.innerHTML = '<div class="log-empty">STANDBY — NO INCIDENTS</div>';
    document.querySelector('.telemetry-panel').classList.remove('congested');
    updateTelemetry();
    logIncident('[FLUSH] All lanes cleared, telemetry re-zeroed', '');
  }

  /* ─── MAIN LOOP ─── */
  function tick() {
    if (!running) { requestAnimationFrame(tick); return; }
    frameCount++;

    /* spawn */
    if (frameCount % Math.max(1, Math.round(20 / spawnRate)) === 0) {
      if (vehicles.length < 80) spawnVehicle();
    }

    /* signal */
    advanceSignal();

    /* vehicles */
    updateVehicles();

    /* draw */
    draw();

    /* telemetry */
    if (frameCount % 10 === 0) updateTelemetry();

    /* congestion alert */
    if (frameCount % 60 === 0) {
      const stopped = vehicles.filter(c => c.stopped).length;
      const active = vehicles.length;
      const pct = active > 0 ? (stopped / active) * 100 : 0;
      if (pct > 70 && active > 5) {
        logIncident('[GRIDLOCK ALERT: CONGESTION CRITICAL. TRAFFIC THROUGHPUT FAILURE]', 'critical');
      }
    }

    requestAnimationFrame(tick);
  }

  /* ─── UI EVENTS ─── */
  modeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      modeBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      mode = this.dataset.mode;
      lastSignalSwitch = performance.now();
      logIncident('[MODE] Switched to ' + mode.toUpperCase(), '');
    });
  });

  spawnSlider.addEventListener('input', function() {
    spawnRate = parseInt(this.value, 10);
    spawnVal.textContent = spawnRate;
  });
  speedSlider.addEventListener('input', function() {
    speedLimit = parseInt(this.value, 10);
    speedVal.textContent = speedLimit;
  });
  greenSlider.addEventListener('input', function() {
    greenTime = parseInt(this.value, 10);
    greenVal.textContent = greenTime;
  });
  yellowSlider.addEventListener('input', function() {
    yellowTime = parseInt(this.value, 10);
    yellowVal.textContent = yellowTime;
  });

  btnSurge.addEventListener('click', triggerSurge);
  btnManualSwitch.addEventListener('click', manualSwitch);
  btnFlush.addEventListener('click', flushAll);

  /* ─── RESIZE ─── */
  let resizeTm;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTm);
    resizeTm = setTimeout(() => resizeCanvas(), 100);
  });

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    lastSignalSwitch = performance.now();
    logIncident('[SYSTEM] Traffic Intersection Controller initialized', '');
    tick();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
