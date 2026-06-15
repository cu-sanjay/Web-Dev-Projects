(function () {
  'use strict';

  /* === CONSTANTS === */
  const FISH_COUNT = 30;
  const PLANT_COUNT = 18;
  const DO_PRISTINE = 9.5;
  const DO_DEATH_THRESHOLD = 4.0;

  /* === DOM REFS === */
  const canvas = document.getElementById('riverCanvas');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('canvasWrap');
  const statusBadge = document.getElementById('statusBadge');
  const pollutantSelect = document.getElementById('pollutantSelect');
  const sliderDump = document.getElementById('sliderDump');
  const sliderFlow = document.getElementById('sliderFlow');
  const valDump = document.getElementById('valDump');
  const valFlow = document.getElementById('valFlow');
  const valDO = document.getElementById('valDO');
  const valTox = document.getElementById('valTox');
  const valBiomass = document.getElementById('valBiomass');
  const valHealth = document.getElementById('valHealth');
  const btnSpill = document.getElementById('btnSpill');
  const btnClean = document.getElementById('btnClean');
  const btnPurge = document.getElementById('btnPurge');

  let W, H;

  function resize() {
    const r = wrap.getBoundingClientRect();
    const w = Math.min(r.width - 12, 900);
    const h = w * 9 / 16;
    canvas.width = w; canvas.height = h;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    W = w; H = h;
  }

  /* === STATE === */
  let fish = [];
  let plants = [];
  let pollutants = [];
  let doLevel = DO_PRISTINE;
  let toxicity = 0;
  let bod = 0;
  let totalFish = FISH_COUNT;
  let dumping = false;
  let cleanup = false;

  /* === FISH === */
  function spawnFish(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: 30 + Math.random() * (W - 60),
        y: H * 0.25 + Math.random() * H * 0.45,
        vx: 0.5 + Math.random() * 1.0,
        vy: (Math.random() - 0.5) * 0.4,
        alive: true,
        size: 4 + Math.random() * 3,
        flip: Math.random() > 0.5 ? 1 : -1,
        wobble: Math.random() * Math.PI * 2
      });
    }
    return arr;
  }

  /* === PLANTS === */
  function spawnPlants() {
    const arr = [];
    for (let i = 0; i < PLANT_COUNT; i++) {
      arr.push({
        x: 15 + (i / PLANT_COUNT) * (W - 30),
        health: 1.0,
        sway: Math.random() * Math.PI * 2,
        height: 18 + Math.random() * 22
      });
    }
    return arr;
  }

  /* === RESET STATE === */
  function resetState() {
    fish = spawnFish(FISH_COUNT);
    plants = spawnPlants();
    pollutants = [];
    doLevel = DO_PRISTINE;
    toxicity = 0;
    bod = 0;
    totalFish = FISH_COUNT;
    dumping = false;
    cleanup = false;
    statusBadge.textContent = 'PRISTINE';
    statusBadge.style.color = '#00e5ff';
    statusBadge.style.borderColor = 'rgba(0,229,255,0.15)';
    statusBadge.style.background = 'rgba(0,229,255,0.08)';
  }

  /* === POLLUTION COLORS === */
  function pollColor(type) {
    switch (type) {
      case 'sewage': return { r: 255, g: 184, b: 0 };
      case 'industrial': return { r: 255, g: 45, b: 120 };
      case 'plastic': return { r: 124, g: 77, b: 255 };
      default: return { r: 200, g: 200, b: 200 };
    }
  }

  /* === DEPLOY SPILL === */
  function deploySpill() {
    const type = pollutantSelect.value;
    const rate = sliderDump.value / 100;
    const count = Math.floor(6 + rate * 14);
    for (let i = 0; i < count; i++) {
      pollutants.push({
        x: -10 - Math.random() * 40,
        y: H * 0.15 + Math.random() * H * 0.7,
        type: type,
        conc: 0.3 + Math.random() * 0.7,
        size: 4 + Math.random() * 8,
        spread: 1
      });
    }
    dumping = true;
  }

  /* === CLEANUP === */
  function activateCleanup() {
    cleanup = true;
    setTimeout(() => { cleanup = false; }, 3000);
  }

  /* === BIOCHEMICAL UPDATE === */
  function updateChemistry(dt) {
    const dumpRate = sliderDump.value / 100;
    const type = pollutantSelect.value;

    if (dumping && pollutants.length > 0) {
      if (type === 'sewage') {
        bod += 0.08 * dumpRate * dt;
      } else if (type === 'industrial') {
        toxicity += 0.06 * dumpRate * dt;
      } else if (type === 'plastic') {
        toxicity += 0.03 * dumpRate * dt;
        bod += 0.02 * dumpRate * dt;
      }
    }

    if (cleanup) {
      bod *= 0.92;
      toxicity *= 0.9;
    }

    doLevel = DO_PRISTINE - bod * 0.8;
    doLevel = Math.max(0.5, Math.min(DO_PRISTINE, doLevel));

    toxicity = Math.max(0, Math.min(100, toxicity));
    bod = Math.max(0, bod);

    if (pollutants.length === 0 && dumping) {
      bod *= 0.97;
      toxicity *= 0.96;
      doLevel += (DO_PRISTINE - doLevel) * 0.01;
    }
  }

  /* === UPDATE FISH === */
  function updateFish(dt) {
    const flow = sliderFlow.value / 10;
    for (const f of fish) {
      if (!f.alive) continue;

      f.wobble += dt * 0.03;
      f.vy += Math.sin(f.wobble + f.y * 0.01) * 0.002;

      const targetVx = 0.8 + flow * 0.4 + (1 - doLevel / DO_PRISTINE) * 0.3;
      f.vx += (targetVx - f.vx) * 0.01;
      f.vy *= 0.98;

      f.x += f.vx * dt;
      f.y += f.vy * dt;

      if (f.y < H * 0.12) { f.y = H * 0.12; f.vy *= -0.5; }
      if (f.y > H * 0.75) { f.y = H * 0.75; f.vy *= -0.5; }
      if (f.x > W + 20) { f.x = -20; }

      /* Separation */
      for (const other of fish) {
        if (other === f || !other.alive) continue;
        const dx = f.x - other.x;
        const dy = f.y - other.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 18 && dist > 0) {
          f.vx += dx / dist * 0.01;
          f.vy += dy / dist * 0.01;
        }
      }

      /* Death check */
      const healthFactor = f.size / 7;
      if (doLevel < DO_DEATH_THRESHOLD || toxicity > 80) {
        const deathChance = (DO_DEATH_THRESHOLD - Math.min(doLevel, DO_DEATH_THRESHOLD)) / DO_DEATH_THRESHOLD * 0.02 + (Math.max(0, toxicity - 80) / 20) * 0.015;
        if (Math.random() < deathChance * dt) {
          f.alive = false;
        }
      }
    }
  }

  /* === UPDATE PLANTS === */
  function updatePlants(dt) {
    for (const p of plants) {
      p.sway += dt * 0.02;
      if (toxicity > 50) {
        p.health -= 0.0003 * (toxicity - 50) * dt;
      } else if (cleanup || pollutants.length === 0) {
        p.health += 0.0002 * dt;
      }
      p.health = Math.max(0.1, Math.min(1, p.health));
    }
  }

  /* === UPDATE POLLUTANTS === */
  function updatePollutants(dt) {
    const flow = sliderFlow.value / 10;
    for (const p of pollutants) {
      p.x += (0.5 + flow * 0.6) * dt;
      p.spread += 0.002 * dt;
      p.size *= 1.001;
      p.conc *= 0.998;
    }
    if (cleanup) {
      for (const p of pollutants) {
        p.conc *= 0.92;
      }
    }
    pollutants = pollutants.filter(p => p.x < W + 60 && p.conc > 0.01);
  }

  /* === DRAW === */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Riverbed */
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a1628');
    grad.addColorStop(0.3, '#0d2840');
    grad.addColorStop(0.5, '#0a1e30');
    grad.addColorStop(0.7, '#0d2840');
    grad.addColorStop(1, '#0a1628');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    /* Water surface shimmer */
    ctx.fillStyle = 'rgba(0, 229, 255, 0.02)';
    for (let i = 0; i < 30; i++) {
      const sx = (i * 37 + performance.now() * 0.01) % (W + 40) - 20;
      const sy = H * 0.08 + Math.sin(i * 1.5 + performance.now() * 0.002) * H * 0.02;
      ctx.fillRect(sx, sy, 20, 1.5);
    }

    /* Pollution plumes */
    for (const p of pollutants) {
      const c = pollColor(p.type);
      const alpha = p.conc * 0.35;
      const grad2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * p.spread);
      grad2.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${alpha * 0.5})`);
      grad2.addColorStop(0.5, `rgba(${c.r},${c.g},${c.b},${alpha * 0.2})`);
      grad2.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.spread, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Plants */
    for (const p of plants) {
      const swayAmt = Math.sin(p.sway) * 2;
      const green = Math.floor(180 + 75 * p.health);
      const red = Math.floor(50 + 180 * (1 - p.health));
      ctx.strokeStyle = `rgba(${red},${green},60,0.7)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, H - 8);
      const tipX = p.x + swayAmt;
      const tipY = H - 8 - p.height * p.health;
      ctx.quadraticCurveTo(p.x + swayAmt * 0.5, H - 8 - p.height * 0.5, tipX, tipY);
      ctx.stroke();

      /* Leaves */
      ctx.fillStyle = `rgba(${red},${green + 30},60,0.5)`;
      ctx.beginPath();
      ctx.ellipse(p.x + swayAmt * 0.7, H - 8 - p.height * 0.7 * p.health, 3, 5, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Fish */
    for (const f of fish) {
      if (!f.alive) continue;
      const isSick = doLevel < DO_DEATH_THRESHOLD || toxicity > 80;

      ctx.save();
      ctx.translate(f.x, f.y);
      const angle = Math.atan2(f.vy, f.vx);
      ctx.rotate(angle);
      ctx.scale(f.flip, 1);

      /* Body */
      const gray = isSick ? 100 : 180;
      ctx.fillStyle = `rgba(${gray},${gray + 30},${gray + 60},0.85)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, f.size, f.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      /* Tail */
      ctx.fillStyle = `rgba(${gray - 20},${gray},${gray + 40},0.7)`;
      ctx.beginPath();
      ctx.moveTo(-f.size * 0.7, 0);
      ctx.lineTo(-f.size * 1.4, -f.size * 0.45);
      ctx.lineTo(-f.size * 1.4, f.size * 0.45);
      ctx.closePath();
      ctx.fill();

      /* Eye */
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(f.size * 0.35, -f.size * 0.1, f.size * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(f.size * 0.38, -f.size * 0.1, f.size * 0.08, 0, Math.PI * 2);
      ctx.fill();

      if (isSick) {
        ctx.strokeStyle = 'rgba(255,0,0,0.4)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, f.size * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    /* Surface line */
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.08);
    for (let x = 0; x <= W; x += 5) {
      ctx.lineTo(x, H * 0.08 + Math.sin(x * 0.02 + performance.now() * 0.003) * 2);
    }
    ctx.stroke();
  }

  /* === TELEMETRY === */
  function updateTelemetry() {
    valDO.textContent = doLevel.toFixed(1) + ' mg/L';
    valDO.style.color = doLevel < DO_DEATH_THRESHOLD ? '#ff4500' : '#00e5ff';

    valTox.textContent = toxicity.toFixed(1) + '%';
    valTox.style.color = toxicity > 60 ? '#ff2d78' : '#ffb800';

    const alive = fish.filter(f => f.alive).length;
    const pct = totalFish > 0 ? (alive / totalFish) * 100 : 0;
    valBiomass.textContent = pct.toFixed(1) + '%';
    valBiomass.style.color = pct < 40 ? '#ff4500' : pct < 70 ? '#ffb800' : '#00e5ff';

    let health;
    let hColor;
    if (doLevel > 8.0 && toxicity < 10 && pct > 85) {
      health = 'PRISTINE'; hColor = '#00e5ff';
    } else if (doLevel > 6.5 && toxicity < 30 && pct > 60) {
      health = 'GOOD'; hColor = '#00e676';
    } else if (doLevel > 4.5 && toxicity < 55 && pct > 35) {
      health = 'DEGRADED'; hColor = '#ffb800';
    } else if (doLevel > 3.0 || toxicity < 75) {
      health = 'CRITICAL'; hColor = '#ff4500';
    } else {
      health = 'HYPOXIA'; hColor = '#ff2d78';
    }
    valHealth.textContent = health;
    valHealth.style.color = hColor;
    valHealth.style.textShadow = `0 0 8px ${hColor}44`;

    statusBadge.textContent = health;
    statusBadge.style.color = hColor;
    statusBadge.style.borderColor = hColor + '44';
    statusBadge.style.background = hColor + '15';
  }

  /* === MAIN LOOP === */
  let lastTime = 0;

  function loop(time) {
    const dt = lastTime ? Math.min((time - lastTime) / 16, 3) : 1;
    lastTime = time;

    if (dumping) {
      const dumpRate = sliderDump.value / 100;
      if (Math.random() < 0.04 * dumpRate) {
        deploySpill();
      }
    }

    updateChemistry(dt);
    updateFish(dt);
    updatePlants(dt);
    updatePollutants(dt);
    draw();
    updateTelemetry();

    requestAnimationFrame(loop);
  }

  /* === BUTTONS === */
  btnSpill.addEventListener('click', deploySpill);
  btnClean.addEventListener('click', activateCleanup);
  btnPurge.addEventListener('click', resetState);

  /* === SLIDERS === */
  sliderDump.addEventListener('input', () => { valDump.textContent = sliderDump.value + '%'; });
  sliderFlow.addEventListener('input', () => { valFlow.textContent = sliderFlow.value + 'x'; });

  /* === INIT === */
  resize();
  window.addEventListener('resize', resize);
  resetState();
  requestAnimationFrame(loop);

})();
