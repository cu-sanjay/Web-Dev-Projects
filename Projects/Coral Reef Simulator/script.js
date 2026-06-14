(function () {
  'use strict';

  /* ============================================================
     CONSTANTS
     ============================================================ */
  const CORAL_COLORS = [
    { r: 255, g: 80,  b: 140 },  // hot pink
    { r: 200, g: 40,  b: 200 },  // purple
    { r: 255, g: 130, b: 60  },  // orange
    { r: 255, g: 80,  b: 200 },  // magenta
    { r: 255, g: 180, b: 40  }   // golden
  ];
  const BLEACHED = { r: 210, g: 210, b: 200 };
  const DEAD = { r: 50, g: 55, b: 50 };
  const CORAL_COUNT = 28;
  const SAND_Y = 0.72;
  const T_OPT = 27;
  const LAMBDA = 0.15;

  /* ============================================================
     STATE
     ============================================================ */
  let state = {
    temp: 25, ph: 8.1, grazers: 8,
    heatwaveActive: false,
    heatwaveTimer: 0
  };

  /* ============================================================
     ENTITIES
     ============================================================ */
  let corals = [];
  let fish = [];
  let algaeSpots = [];

  /* ============================================================
     DOM REFS
     ============================================================ */
  const $ = id => document.getElementById(id);
  const canvas = $('reefCanvas'), ctx = canvas.getContext('2d');
  const slTemp = $('slTemp'), slPH = $('slPH'), slGrazers = $('slGrazers');
  const valTemp = $('valTemp'), valPH = $('valPH'), valGrazers = $('valGrazers');
  const zoneTemp = $('zoneTemp'), zonePH = $('zonePH'), zoneGrazers = $('zoneGrazers');
  const healthStatus = $('healthStatus'), reefCover = $('reefCover');
  const chipHealth = $('chipHealth'), chipReef = $('chipReef');
  const tmBody = $('tmBody'), arenaHint = $('arenaHint');
  const gmCalc = $('gmCalc'), gmZoox = $('gmZoox'), gmBleach = $('gmBleach');
  const toastContainer = $('toastContainer');
  const btnHeatwave = $('btnHeatwave'), btnLarvae = $('btnLarvae'), btnPurge = $('btnPurge');

  /* ============================================================
     INIT ENTITIES
     ============================================================ */
  function initCorals() {
    corals = [];
    for (let i = 0; i < CORAL_COUNT; i++) {
      const ci = Math.floor(Math.random() * CORAL_COLORS.length);
      corals.push({
        x: 0, w: 10 + Math.random() * 14, h: 14 + Math.random() * 22,
        baseColor: CORAL_COLORS[ci],
        currentColor: { ...CORAL_COLORS[ci] },
        health: 1,        // 1 = healthy, 0 = dead
        bleachTimer: 0,
        dead: false,
        algaeOvergrown: false,
        phase: Math.random() * Math.PI * 2
      });
    }
    // Position along reef floor
    corals.sort((a, b) => a.w - b.w);
    corals.forEach((c, i) => {
      c.x = 0.04 + (i / corals.length) * 0.92;
    });
  }

  function initFish() {
    fish = [];
    const count = state.grazers;
    for (let i = 0; i < count; i++) {
      fish.push({
        x: Math.random(),
        y: 0.2 + Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 0.004,
        vy: (Math.random() - 0.5) * 0.002,
        size: 5 + Math.random() * 4,
        hue: 170 + Math.random() * 40,
        phase: Math.random() * Math.PI * 2,
        targetX: Math.random(),
        targetY: 0.25 + Math.random() * 0.4
      });
    }
  }

  function initAlgae() {
    algaeSpots = [];
    for (let i = 0; i < 60; i++) {
      algaeSpots.push({
        x: Math.random(),
        y: SAND_Y + 0.01 + Math.random() * 0.12,
        size: 2 + Math.random() * 5,
        growth: Math.random(),
        sway: Math.random() * Math.PI * 2
      });
    }
  }

  /* ============================================================
     CANVAS SIZING
     ============================================================ */
  function sizeCanvas() {
    const wrap = canvas.parentElement;
    const w = Math.min(wrap.clientWidth - 4, 800);
    const h = Math.max(320, Math.round(w * 0.45));
    canvas.width = w; canvas.height = h;
    return { w, h };
  }

  /* ============================================================
     BLEACHING MODEL
     Pb = 1 - e^(-λ(T - T_opt))
     ============================================================ */
  function calcBleachProb(temp, ph) {
    let stress = 0;
    if (temp > T_OPT) stress += 1 - Math.exp(-LAMBDA * (temp - T_OPT));
    if (ph < 7.8) stress += (7.8 - ph) * 0.3;
    if (temp > 32) stress += (temp - 32) * 0.1;
    return Math.min(stress, 1);
  }

  function lerpColor(c1, c2, t) {
    t = Math.max(0, Math.min(1, t));
    return {
      r: Math.round(c1.r + (c2.r - c1.r) * t),
      g: Math.round(c1.g + (c2.g - c1.g) * t),
      b: Math.round(c1.b + (c2.b - c1.b) * t)
    };
  }

  /* ============================================================
     UPDATE CORALS
     ============================================================ */
  function updateCorals(dt, time) {
    const stress = calcBleachProb(state.temp, state.ph);
    const recoveryRate = state.temp <= T_OPT && state.ph >= 7.8 ? 0.005 : 0;

    corals.forEach(c => {
      if (c.dead) {
        // Slowly shift to dead color with algae
        c.currentColor = lerpColor(c.currentColor, DEAD, 0.01);
        c.algaeOvergrown = true;
        return;
      }

      c.phase += dt * 0.001;

      if (stress > 0) {
        c.bleachTimer += dt * stress * 0.002;
        if (c.bleachTimer > 1) {
          // Bleached threshold
          c.health = Math.max(0, c.health - dt * stress * 0.0008);
        }
      } else if (c.bleachTimer > 0) {
        c.bleachTimer = Math.max(0, c.bleachTimer - dt * 0.001);
      }

      // Recovery when conditions improve
      if (recoveryRate > 0 && c.health < 1 && c.bleachTimer < 0.5) {
        c.health = Math.min(1, c.health + dt * recoveryRate * 0.005);
      }

      // Death
      if (c.health <= 0) {
        c.dead = true;
        c.algaeOvergrown = true;
        return;
      }

      // Color interpolation
      const healthColor = lerpColor(BLEACHED, c.baseColor, c.health);
      const stressColor = lerpColor(
        { r: 255, g: 240, b: 230 },
        healthColor,
        Math.max(0, 1 - c.bleachTimer * 2)
      );
      c.currentColor = stressColor;
    });
  }

  /* ============================================================
     UPDATE FISH (BOID-STYLE)
     ============================================================ */
  function updateFish(dt, time) {
    const targetCount = state.grazers;
    while (fish.length < targetCount) {
      fish.push({
        x: Math.random(), y: 0.2 + Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.004, vy: (Math.random() - 0.5) * 0.002,
        size: 5 + Math.random() * 4, hue: 170 + Math.random() * 40,
        phase: Math.random() * Math.PI * 2,
        targetX: Math.random(), targetY: 0.25 + Math.random() * 0.4
      });
    }
    while (fish.length > targetCount) fish.pop();

    fish.forEach(f => {
      // Steer toward target
      f.targetX += (Math.random() - 0.5) * 0.02;
      f.targetY += (Math.random() - 0.5) * 0.01;
      f.targetX = Math.max(0.05, Math.min(0.95, f.targetX));
      f.targetY = Math.max(0.15, Math.min(0.65, f.targetY));

      f.vx += (f.targetX - f.x) * 0.0002;
      f.vy += (f.targetY - f.y) * 0.0001;

      // Speed limit
      const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
      if (speed > 0.006) { f.vx = (f.vx / speed) * 0.006; f.vy = (f.vy / speed) * 0.006; }

      // Damping
      f.vx *= 0.995; f.vy *= 0.995;

      f.x += f.vx; f.y += f.vy;
      f.x = Math.max(0.02, Math.min(0.98, f.x));
      f.y = Math.max(0.12, Math.min(0.68, f.y));
      f.phase += dt * 0.002;
    });
  }

  /* ============================================================
     UPDATE ALGAE
     ============================================================ */
  function updateAlgae(dt) {
    const grazeRate = state.grazers / 20;
    const tempFactor = state.temp > 30 ? 1.5 : 1;
    const deadCorals = corals.filter(c => c.dead).length / corals.length;

    algaeSpots.forEach(a => {
      // Growth based on dead corals and temp
      if (deadCorals > 0.1) a.growth = Math.min(1, a.growth + dt * deadCorals * 0.0003 * tempFactor);
      else a.growth = Math.max(0.2, a.growth - dt * 0.0001);

      // Grazing reduces algae
      if (grazeRate > 0) a.growth = Math.max(0.1, a.growth - dt * grazeRate * 0.0002);

      a.sway += dt * 0.001;
    });
  }

  /* ============================================================
     DRAW
     ============================================================ */
  function drawScene(time) {
    const { w, h } = sizeCanvas();
    ctx.clearRect(0, 0, w, h);

    // Background gradient (deep ocean)
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#020812'); bg.addColorStop(0.3, '#040e1a');
    bg.addColorStop(0.6, '#071524'); bg.addColorStop(1, '#0a1a2e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    // Light rays from surface
    for (let i = 0; i < 5; i++) {
      const rx = (i / 5) * w + Math.sin(time / 3000 + i) * 20;
      ctx.fillStyle = `rgba(0,229,255,${0.008 + 0.005 * Math.sin(time / 2000 + i)})`;
      ctx.beginPath();
      ctx.moveTo(rx - 8, 0); ctx.lineTo(rx - 3, h * 0.4);
      ctx.lineTo(rx + 3, h * 0.4); ctx.lineTo(rx + 8, 0);
      ctx.fill();
    }

    const sandY = h * SAND_Y;

    // Sandy floor
    const sand = ctx.createLinearGradient(0, sandY, 0, h);
    sand.addColorStop(0, '#1a2c36'); sand.addColorStop(0.3, '#1e3038');
    sand.addColorStop(1, '#152028');
    ctx.fillStyle = sand; ctx.fillRect(0, sandY, w, h - sandY);

    // Sand texture
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 37 + 13) % w, sy = sandY + 5 + (i * 23) % (h - sandY - 10);
      ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill();
    }

    // Algae (behind corals)
    algaeSpots.forEach(a => {
      const ax = a.x * w;
      const ay = a.y * h;
      const size = a.size * (0.5 + a.growth * 0.5);
      const swayOff = Math.sin(time / 1500 + a.sway) * 3;
      const alpha = 0.15 + a.growth * 0.35;

      ctx.fillStyle = `rgba(60,${120 + a.growth * 60},40,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(ax + swayOff, ay, size * 0.4, size, 0, 0, Math.PI * 2);
      ctx.fill();

      // Second frond
      ctx.fillStyle = `rgba(50,${100 + a.growth * 50},30,${alpha * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(ax + 4 - swayOff, ay - 2, size * 0.25, size * 0.7, 0.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Corals
    corals.forEach(c => {
      let cx = c.x * w;
      const cw = c.w;
      const ch = c.h * (0.7 + 0.3 * Math.sin(time / 800 + c.phase));
      const cy = sandY - ch;
      const { r, g, b } = c.currentColor;

      // Glow
      if (!c.dead && c.health > 0.3) {
        ctx.shadowColor = `rgb(${r},${g},${b})`;
        ctx.shadowBlur = c.health * 12;
      }

      // Draw coral polyp (branched shape)
      const baseAlpha = c.dead ? 0.6 : 1;
      ctx.fillStyle = `rgba(${r},${g},${b},${baseAlpha})`;

      // Main body
      ctx.beginPath();
      ctx.moveTo(cx - cw * 0.4, cy + ch);
      ctx.quadraticCurveTo(cx, cy + ch * 0.5, cx, cy);
      ctx.quadraticCurveTo(cx, cy + ch * 0.5, cx + cw * 0.4, cy + ch);
      ctx.fill();

      // Branches
      const branches = c.dead ? 0 : 2 + Math.floor(c.health * 3);
      for (let bi = 0; bi < branches; bi++) {
        const bx = cx - cw * 0.3 + (bi / branches) * cw * 0.6;
        const by = cy + ch * (0.2 + (bi % 2) * 0.3);
        const bw = cw * 0.12;
        const bh = ch * (0.2 + c.health * 0.2);

        ctx.beginPath();
        ctx.moveTo(bx - bw, by);
        ctx.quadraticCurveTo(bx, by - bh, bx + bw, by);
        ctx.fill();
      }

      // Polyp tips (glowing dots)
      if (!c.dead) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(${Math.min(255, r + 40)},${Math.min(255, g + 40)},${Math.min(255, b + 40)},${0.5 + 0.3 * Math.sin(time / 500 + c.phase)})`;
        for (let ti = 0; ti < 3; ti++) {
          const tx = cx - cw * 0.2 + (ti / 3) * cw * 0.4;
          const ty = cy + 2 + Math.sin(time / 600 + c.phase + ti) * 2;
          ctx.beginPath(); ctx.arc(tx, ty, 1.5, 0, Math.PI * 2); ctx.fill();
        }
      }

      ctx.shadowBlur = 0;

      // Dead indicator (skull icon overlay)
      if (c.dead) {
        ctx.fillStyle = 'rgba(255,23,68,0.3)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✕', cx, cy + ch / 2);
      }
    });

    // Fish
    fish.forEach(f => {
      const fx = f.x * w;
      const fy = f.y * h;
      const fs = f.size;
      const wobble = Math.sin(time / 400 + f.phase) * 1.5;

      // Body (triangle)
      ctx.fillStyle = `hsla(${f.hue}, 70%, 55%, 0.85)`;
      ctx.shadowColor = `hsla(${f.hue}, 70%, 55%, 0.3)`;
      ctx.shadowBlur = 6;

      // Direction based on velocity
      const angle = Math.atan2(f.vy, f.vx);
      ctx.save();
      ctx.translate(fx, fy + wobble);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(fs, 0);
      ctx.lineTo(-fs * 0.6, -fs * 0.5);
      ctx.lineTo(-fs * 0.6, fs * 0.5);
      ctx.closePath();
      ctx.fill();

      // Tail
      ctx.fillStyle = `hsla(${f.hue + 20}, 60%, 45%, 0.7)`;
      ctx.beginPath();
      ctx.moveTo(-fs * 0.5, 0);
      ctx.lineTo(-fs, -fs * 0.3);
      ctx.lineTo(-fs, fs * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      ctx.shadowBlur = 0;
    });

    // Bubble particles
    for (let i = 0; i < 8; i++) {
      const bx = (i * 97 + 53) % w;
      const by = h * 0.3 + (i * 37 + time * 0.02) % (h * 0.35);
      ctx.fillStyle = `rgba(0,229,255,${0.02 + 0.02 * Math.sin(time / 1000 + i)})`;
      ctx.beginPath(); ctx.arc(bx, by, 1 + Math.sin(time / 500 + i) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Surface wave line
    ctx.strokeStyle = 'rgba(0,229,255,0.04)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 5) {
      const wy = 4 + Math.sin(x / 60 + time / 1500) * 3;
      x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }

  /* ============================================================
     TELEMETRY
     ============================================================ */
  function calcTelemetry() {
    const total = corals.length;
    const healthy = corals.filter(c => c.health > 0.5 && !c.dead).length;
    const bleached = corals.filter(c => c.health <= 0.5 && c.health > 0 && !c.dead).length;
    const deadC = corals.filter(c => c.dead).length;

    const calcRate = Math.round((healthy / total) * (1 - Math.max(0, state.temp - T_OPT) * 0.03) * 100);
    const zoox = Math.round((healthy / total) * (1 - Math.max(0, state.temp - T_OPT) * 0.04) * 100);
    const bleachedRatio = Math.round((bleached / total) * 100);
    const deadRatio = Math.round((deadC / total) * 100);

    let status, color;
    if (deadRatio > 40) { status = 'REEF COLLAPSE EXHAUSTION'; color = '#ff1744'; }
    else if (bleachedRatio > 40) { status = 'BLEACHING CASCADE ACTIVE'; color = '#ff6d00'; }
    else if (bleachedRatio > 15 || state.temp > 29) { status = 'THERMAL STRESS FLAGGED'; color = '#ffb800'; }
    else if (calcRate > 80) { status = 'PRISTINE SYMBIOSIS'; color = '#00e676'; }
    else { status = 'STABLE MARGINAL'; color = '#00e5ff'; }

    return { calcRate, zoox, bleachedRatio, deadRatio, status, color, healthy, total };
  }

  function updateTelemetry() {
    const tm = calcTelemetry();

    tmBody.innerHTML = `
      <div class="tm-card" style="border-color:${tm.color}33">
        <div class="tm-lbl">Active Calcification Rate</div>
        <div class="tm-val" style="color:${tm.color}">${tm.calcRate}%</div>
      </div>
      <div class="tm-card" style="border-color:${tm.color}33">
        <div class="tm-lbl">Zooxanthellae Coverage</div>
        <div class="tm-val" style="color:${tm.color}">${tm.zoox}%</div>
      </div>
      <div class="tm-card" style="border-color:${tm.color}33">
        <div class="tm-lbl">Bleached Colony Ratio</div>
        <div class="tm-val" style="color:${tm.color}">${tm.bleachedRatio}%</div>
      </div>
      <div class="tm-card" style="border-color:${tm.color}33">
        <div class="tm-lbl">Overall Reef Health</div>
        <div class="tm-val" style="color:${tm.color};font-size:12px">${tm.status}</div>
        <div class="tm-sub">${tm.healthy}/${tm.total} healthy colonies · ${tm.deadRatio}% dead</div>
      </div>
    `;

    healthStatus.textContent = tm.status;
    healthStatus.style.color = tm.color;
    chipHealth.style.borderColor = tm.color + '33';
    reefCover.textContent = tm.calcRate + '%';
    reefCover.style.color = tm.color;
    chipReef.style.borderColor = tm.color + '33';
    arenaHint.textContent = tm.status;
    arenaHint.style.color = tm.color;

    gmCalc.style.width = tm.calcRate + '%';
    gmZoox.style.width = tm.zoox + '%';
    gmBleach.style.width = tm.bleachedRatio + '%';
  }

  /* ============================================================
     CONTROL HELPERS
     ============================================================ */
  function updateControlLabels() {
    valTemp.textContent = state.temp + '°C';
    valPH.textContent = state.ph.toFixed(2);
    valGrazers.textContent = state.grazers;

    // Temp zone
    if (state.temp <= 27) { zoneTemp.textContent = 'OPTIMAL'; zoneTemp.style.color = '#00e676'; }
    else if (state.temp <= 29) { zoneTemp.textContent = 'WARMING'; zoneTemp.style.color = '#ffb800'; }
    else if (state.temp <= 32) { zoneTemp.textContent = 'THERMAL STRESS'; zoneTemp.style.color = '#ff6d00'; }
    else { zoneTemp.textContent = 'HEATWAVE CRITICAL'; zoneTemp.style.color = '#ff1744'; }

    // pH zone
    if (state.ph >= 8.0) { zonePH.textContent = 'ALKALINE STABLE'; zonePH.style.color = '#00e676'; }
    else if (state.ph >= 7.8) { zonePH.textContent = 'NEUTRAL MARGIN'; zonePH.style.color = '#ffb800'; }
    else { zonePH.textContent = 'ACIDIFICATION RISK'; zonePH.style.color = '#ff1744'; }

    // Grazers
    if (state.grazers <= 4) { zoneGrazers.textContent = 'UNDERGRAZED'; zoneGrazers.style.color = '#ff6d00'; }
    else if (state.grazers <= 12) { zoneGrazers.textContent = 'MODERATE'; zoneGrazers.style.color = '#00e676'; }
    else { zoneGrazers.textContent = 'HIGH DENSITY'; zoneGrazers.style.color = '#00e5ff'; }

    slPH.style.background = state.ph < 7.8 ?
      'linear-gradient(to right,#ff1744,#ffb800)' :
      'linear-gradient(to right,#00e676,#00e5ff)';
    slPH.style.opacity = '0.4';
  }

  /* ============================================================
     ACTIONS
     ============================================================ */
  function triggerHeatwave() {
    if (state.heatwaveActive) {
      showToast('⚠️ Heatwave already in progress.', 1500);
      return;
    }
    state.heatwaveActive = true;
    state.heatwaveTimer = 0;
    showToast('🔥 Marine heatwave event induced. Temperature rising...', 3000);

    // Gradually increase temp
    const interval = setInterval(() => {
      state.temp = Math.min(35, state.temp + 0.3);
      slTemp.value = state.temp;
      updateControlLabels();

      if (state.temp >= 34) {
        clearInterval(interval);
        state.heatwaveActive = false;
        showToast('⚠️ Heatwave peak reached. Coral bleaching cascade active.', 3000);
      }
    }, 200);
  }

  function introduceLarvae() {
    const deadCount = corals.filter(c => c.dead).length;
    if (deadCount === 0) {
      showToast('🌱 No dead colonies to seed. Reef is stable.', 1500);
      return;
    }

    // Convert some dead corals back to bleached (recoverable)
    let seeded = 0;
    corals.forEach(c => {
      if (c.dead && Math.random() < 0.4) {
        c.dead = false;
        c.health = 0.15;
        c.bleachTimer = 1;
        c.algaeOvergrown = false;
        seeded++;
      }
    });
    showToast(`🧬 Coral larvae seeded. ${seeded} colonies undergoing recruitment.`, 3000);
  }

  function purgeAll() {
    state.temp = 25; state.ph = 8.1; state.grazers = 8;
    state.heatwaveActive = false;
    slTemp.value = 25; slPH.value = 8.1; slGrazers.value = 8;
    updateControlLabels();
    initCorals(); initFish(); initAlgae();
    showToast('♻️ Trophic matrices purged. Marine basin re-zeroed to optimal state.', 2500);
  }

  /* ============================================================
     TOAST
     ============================================================ */
  function showToast(msg, duration) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('leave');
      setTimeout(() => el.remove(), 250);
    }, duration || 2500);
  }

  /* ============================================================
     ANIMATION LOOP
     ============================================================ */
  let animId, lastTime = 0;

  function tick(time) {
    if (!lastTime) lastTime = time;
    const dt = time - lastTime;
    lastTime = time;

    updateCorals(dt, time);
    updateFish(dt, time);
    updateAlgae(dt);
    drawScene(time);
    updateTelemetry();

    animId = requestAnimationFrame(tick);
  }

  /* ============================================================
     EVENT BINDING
     ============================================================ */
  slTemp.addEventListener('input', () => {
    state.temp = parseFloat(slTemp.value);
    updateControlLabels();
  });
  slPH.addEventListener('input', () => {
    state.ph = parseFloat(slPH.value);
    updateControlLabels();
  });
  slGrazers.addEventListener('input', () => {
    state.grazers = parseInt(slGrazers.value);
    updateControlLabels();
  });

  btnHeatwave.addEventListener('click', triggerHeatwave);
  btnLarvae.addEventListener('click', introduceLarvae);
  btnPurge.addEventListener('click', purgeAll);

  /* === RESIZE === */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {}, 100);
  });

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    initCorals();
    initFish();
    initAlgae();
    updateControlLabels();
    showToast('🌊 Coral reef ecosystem initialized. Monitoring telemetry online.', 3000);
    tick(0);
  }

  init();

})();
