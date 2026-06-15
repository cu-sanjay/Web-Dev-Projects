(function () {
  'use strict';

  /* === CANVAS SETUP === */
  const ecoCanvas = document.getElementById('ecoCanvas');
  const chartCanvas = document.getElementById('chartCanvas');
  const ctxEco = ecoCanvas.getContext('2d');
  const ctxChart = chartCanvas.getContext('2d');

  let W, H;

  function resizeCanvases() {
    const wrap = ecoCanvas.parentElement;
    const size = Math.min(wrap.clientWidth || 400, 600);
    const dpr = window.devicePixelRatio || 1;
    ecoCanvas.width = size * dpr;
    ecoCanvas.height = size * dpr;
    ecoCanvas.style.width = size + 'px';
    ecoCanvas.style.height = size + 'px';
    ctxEco.scale(dpr, dpr);

    chartCanvas.width = size * dpr;
    chartCanvas.height = size * dpr;
    chartCanvas.style.width = size + 'px';
    chartCanvas.style.height = size + 'px';
    ctxChart.scale(dpr, dpr);

    W = H = size;
  }
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);

  /* === DOM REFS === */
  const sliderSun = document.getElementById('sliderSun');
  const sliderWater = document.getElementById('sliderWater');
  const sliderMut = document.getElementById('sliderMutation');
  const sliderSpeed = document.getElementById('sliderSpeed');
  const valSun = document.getElementById('valSun');
  const valWater = document.getElementById('valWater');
  const valMut = document.getElementById('valMutation');
  const valSpeed = document.getElementById('valSpeed');
  const valFlora = document.getElementById('valFlora');
  const valHerb = document.getElementById('valHerb');
  const valCarn = document.getElementById('valCarn');
  const valStability = document.getElementById('valStability');
  const tickDisplay = document.getElementById('tickDisplay');
  const btnPause = document.getElementById('btnPause');
  const pauseLabel = document.getElementById('pauseLabel');
  const btnVirus = document.getElementById('btnVirus');
  const btnReseed = document.getElementById('btnReseed');

  /* === SLIDER LIVE FEEDBACK === */
  sliderSun.addEventListener('input', () => { valSun.textContent = sliderSun.value + '%'; });
  sliderWater.addEventListener('input', () => { valWater.textContent = sliderWater.value + '%'; });
  sliderMut.addEventListener('input', () => { valMut.textContent = sliderMut.value + '%'; });
  sliderSpeed.addEventListener('input', () => { valSpeed.textContent = sliderSpeed.value + 'x'; });

  /* === ENTITY TYPES === */
  const T = { PLANT: 'PLANT', HERB: 'HERB', CARN: 'CARN' };

  /* === ECOSYSTEM STATE === */
  let entities = [];
  let paused = false;
  let tick = 0;
  let chartHistory = [];
  const MAX_HISTORY = 600;

  /* === SIMULATION PARAMS === */
  let params = {
    sunlight: 0.6,
    water: 0.6,
    mutation: 0.1,
    speed: 5
  };

  function readSliders() {
    params.sunlight = sliderSun.value / 100;
    params.water = sliderWater.value / 100;
    params.mutation = sliderMut.value / 100;
    params.speed = parseInt(sliderSpeed.value);
  }

  /* === AGENT CLASS === */
  class Agent {
    constructor(type, x, y) {
      this.type = type;
      this.x = x;
      this.y = y;
      this.energy = type === T.PLANT ? 100 : 80;
      this.cooldown = 0;
      this.alive = true;
      this.tx = x;
      this.ty = y;
      this.age = 0;
    }
  }

  /* === SEED ECOSYSTEM === */
  function seedEcosystem() {
    entities = [];
    chartHistory = [];
    tick = 0;

    const pad = 20;
    const range = W - pad * 2;

    for (let i = 0; i < 80; i++) {
      const a = new Agent(T.PLANT, pad + Math.random() * range, pad + Math.random() * range);
      a.energy = 60 + Math.random() * 40;
      entities.push(a);
    }
    for (let i = 0; i < 25; i++) {
      const a = new Agent(T.HERB, pad + Math.random() * range, pad + Math.random() * range);
      a.energy = 60 + Math.random() * 40;
      entities.push(a);
    }
    for (let i = 0; i < 8; i++) {
      const a = new Agent(T.CARN, pad + Math.random() * range, pad + Math.random() * range);
      a.energy = 70 + Math.random() * 30;
      entities.push(a);
    }
  }

  /* === DISTANCE === */
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  /* === UPDATE LOGIC === */
  function update() {
    readSliders();
    const sunlight = params.sunlight;
    const water = params.water;
    const mutation = params.mutation;
    const pad = 20;
    const range = W - pad * 2;

    let newAgents = [];

    const plants = entities.filter(e => e.alive && e.type === T.PLANT);
    const herbs = entities.filter(e => e.alive && e.type === T.HERB);
    const carns = entities.filter(e => e.alive && e.type === T.CARN);

    /* PLANTS */
    for (const p of plants) {
      p.age++;
      p.energy += (5 * sunlight + 3 * water) * (0.9 + Math.random() * 0.2);
      if (p.energy > 150) p.energy = 150;

      if (p.energy > 80 && p.cooldown <= 0 && Math.random() < 0.04 * (sunlight + water) / 2) {
        const angle = Math.random() * Math.PI * 2;
        const r = 6 + Math.random() * 10;
        const nx = Math.max(pad, Math.min(W - pad, p.x + Math.cos(angle) * r));
        const ny = Math.max(pad, Math.min(H - pad, p.y + Math.sin(angle) * r));
        const child = new Agent(T.PLANT, nx, ny);
        child.energy = 40;
        entities.push(child);
        p.energy -= 20;
        p.cooldown = 8;
      }
      if (p.cooldown > 0) p.cooldown--;

      if (p.energy <= 0) p.alive = false;
    }

    /* HERBIVORES */
    for (const h of herbs) {
      h.age++;
      h.energy -= 0.15 + (1 - water) * 0.1;

      let nearest = null;
      let nearDist = Infinity;
      for (const p of plants) {
        if (!p.alive) continue;
        const d = dist(h, p);
        if (d < nearDist) { nearDist = d; nearest = p; }
      }

      if (nearest && nearDist < 8) {
        h.energy += 25;
        nearest.alive = false;
        h.tx = h.x + (Math.random() - 0.5) * 20;
        h.ty = h.y + (Math.random() - 0.5) * 20;
      } else if (nearest) {
        h.tx = nearest.x;
        h.ty = nearest.y;
      } else {
        h.tx = pad + Math.random() * range;
        h.ty = pad + Math.random() * range;
      }

      const dx = h.tx - h.x;
      const dy = h.ty - h.y;
      const d = Math.hypot(dx, dy);
      if (d > 2) {
        const speed = 1.2 + (1 - water) * 0.5;
        h.x += (dx / d) * speed;
        h.y += (dy / d) * speed;
      }
      h.x = Math.max(pad, Math.min(W - pad, h.x));
      h.y = Math.max(pad, Math.min(H - pad, h.y));

      if (h.energy > 120 && h.cooldown <= 0 && herbs.length < 60) {
        const child = new Agent(T.HERB, h.x + (Math.random() - 0.5) * 10, h.y + (Math.random() - 0.5) * 10);
        child.energy = 40;
        entities.push(child);
        h.energy -= 30;
        h.cooldown = 15;
        if (Math.random() < mutation) {
          child.energy *= 1.3;
        }
      }
      if (h.cooldown > 0) h.cooldown--;
      if (h.energy <= 0) h.alive = false;
      if (h.energy > 200) h.energy = 200;
    }

    /* CARNIVORES */
    for (const c of carns) {
      c.age++;
      c.energy -= 0.25;

      let nearest = null;
      let nearDist = Infinity;
      for (const h of herbs) {
        if (!h.alive) continue;
        const d = dist(c, h);
        if (d < nearDist) { nearDist = d; nearest = h; }
      }

      if (nearest && nearDist < 7) {
        c.energy += 40;
        nearest.alive = false;
        c.tx = c.x + (Math.random() - 0.5) * 30;
        c.ty = c.y + (Math.random() - 0.5) * 30;
      } else if (nearest) {
        c.tx = nearest.x;
        c.ty = nearest.y;
      } else {
        c.tx = pad + Math.random() * range;
        c.ty = pad + Math.random() * range;
      }

      const dx = c.tx - c.x;
      const dy = c.ty - c.y;
      const d = Math.hypot(dx, dy);
      if (d > 2) {
        const speed = 1.8;
        c.x += (dx / d) * speed;
        c.y += (dy / d) * speed;
      }
      c.x = Math.max(pad, Math.min(W - pad, c.x));
      c.y = Math.max(pad, Math.min(H - pad, c.y));

      if (c.energy > 130 && c.cooldown <= 0 && carns.length < 20) {
        const child = new Agent(T.CARN, c.x + (Math.random() - 0.5) * 10, c.y + (Math.random() - 0.5) * 10);
        child.energy = 50;
        entities.push(child);
        c.energy -= 40;
        c.cooldown = 25;
      }
      if (c.cooldown > 0) c.cooldown--;
      if (c.energy <= 0) c.alive = false;
      if (c.energy > 250) c.energy = 250;
    }

    entities = entities.filter(e => e.alive);

    const pCount = entities.filter(e => e.type === T.PLANT).length;
    const hCount = entities.filter(e => e.type === T.HERB).length;
    const cCount = entities.filter(e => e.type === T.CARN).length;

    if (pCount < 5 && plants.length > 0) {
      for (let i = 0; i < 5; i++) {
        const a = new Agent(T.PLANT, pad + Math.random() * range, pad + Math.random() * range);
        a.energy = 80;
        entities.push(a);
      }
    }

    updateTelemetry();
    logHistory();
  }

  /* === TELEMETRY === */
  function updateTelemetry() {
    const flora = entities.filter(e => e.type === T.PLANT).length;
    const herb = entities.filter(e => e.type === T.HERB).length;
    const carn = entities.filter(e => e.type === T.CARN).length;
    const total = flora + herb + carn;
    const stability = total > 0
      ? (1 - Math.abs(herb - flora) / (total + 1) - Math.abs(carn - herb) / (total + 1)) * 100
      : 0;

    valFlora.textContent = flora;
    valHerb.textContent = herb;
    valCarn.textContent = carn;
    valStability.textContent = Math.max(0, stability).toFixed(1) + '%';
  }

  /* === HISTORY === */
  function logHistory() {
    const flora = entities.filter(e => e.type === T.PLANT).length;
    const herb = entities.filter(e => e.type === T.HERB).length;
    const carn = entities.filter(e => e.type === T.CARN).length;
    chartHistory.push({ flora, herb, carn });
    if (chartHistory.length > MAX_HISTORY) chartHistory.shift();
  }

  /* === DRAW ECOSYSTEM === */
  function drawEcosystem() {
    ctxEco.clearRect(0, 0, W, H);

    ctxEco.fillStyle = 'rgba(255, 255, 255, 0.015)';
    ctxEco.font = '8px "JetBrains Mono", monospace';
    ctxEco.textAlign = 'left';
    ctxEco.textBaseline = 'top';
    ctxEco.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < W; i += 30) {
      ctxEco.fillRect(i, 0, 0.5, H);
      ctxEco.fillRect(0, i, W, 0.5);
    }

    for (const e of entities) {
      if (!e.alive) continue;
      ctxEco.save();
      ctxEco.translate(e.x, e.y);

      if (e.type === T.PLANT) {
        const r = 3 + (e.energy / 150) * 2.5;
        const grad = ctxEco.createRadialGradient(0, 0, 0, 0, 0, r * 2);
        grad.addColorStop(0, 'rgba(0, 255, 136, 0.6)');
        grad.addColorStop(0.4, 'rgba(0, 255, 136, 0.15)');
        grad.addColorStop(1, 'rgba(0, 255, 136, 0)');
        ctxEco.fillStyle = grad;
        ctxEco.beginPath();
        ctxEco.arc(0, 0, r * 2, 0, Math.PI * 2);
        ctxEco.fill();

        ctxEco.fillStyle = '#00ff88';
        ctxEco.shadowColor = 'rgba(0, 255, 136, 0.4)';
        ctxEco.shadowBlur = 6;
        ctxEco.beginPath();
        ctxEco.arc(0, 0, r, 0, Math.PI * 2);
        ctxEco.fill();
        ctxEco.shadowBlur = 0;
      }

      if (e.type === T.HERB) {
        const s = 5;
        ctxEco.fillStyle = '#00d4ff';
        ctxEco.shadowColor = 'rgba(0, 212, 255, 0.4)';
        ctxEco.shadowBlur = 8;
        ctxEco.beginPath();
        ctxEco.moveTo(0, -s);
        ctxEco.lineTo(-s * 0.85, s * 0.6);
        ctxEco.lineTo(s * 0.85, s * 0.6);
        ctxEco.closePath();
        ctxEco.fill();
        ctxEco.shadowBlur = 0;
      }

      if (e.type === T.CARN) {
        const r = 5 + (e.energy / 250) * 2;
        ctxEco.strokeStyle = '#ff2d78';
        ctxEco.shadowColor = 'rgba(255, 45, 120, 0.5)';
        ctxEco.shadowBlur = 10;
        ctxEco.lineWidth = 2;
        ctxEco.beginPath();
        ctxEco.arc(0, 0, r, 0, Math.PI * 2);
        ctxEco.stroke();

        ctxEco.beginPath();
        ctxEco.arc(0, 0, r * 0.5, 0, Math.PI * 2);
        ctxEco.strokeStyle = 'rgba(255, 45, 120, 0.4)';
        ctxEco.lineWidth = 1.5;
        ctxEco.stroke();
        ctxEco.shadowBlur = 0;
      }

      ctxEco.restore();
    }
  }

  /* === DRAW CHART === */
  function drawChart() {
    ctxChart.clearRect(0, 0, W, H);

    const pad = { t: 20, r: 14, b: 30, l: 36 };
    const gw = W - pad.l - pad.r;
    const gh = H - pad.t - pad.b;

    ctxChart.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctxChart.font = '6px "JetBrains Mono", monospace';
    ctxChart.textAlign = 'center';
    ctxChart.textBaseline = 'top';

    for (let i = 0; i <= 5; i++) {
      const x = pad.l + (gw / 5) * i;
      ctxChart.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctxChart.fillRect(x, pad.t, 0.5, gh);
      ctxChart.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctxChart.fillText(Math.round((MAX_HISTORY / 5) * i), x, pad.t + gh + 6);
    }

    const maxPop = Math.max(
      ...chartHistory.flatMap(h => [h.flora, h.herb, h.carn]),
      20
    );

    ctxChart.textAlign = 'right';
    ctxChart.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + gh - (gh / 4) * i;
      ctxChart.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctxChart.fillRect(pad.l, y, gw, 0.5);
      ctxChart.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctxChart.fillText(Math.round((maxPop / 4) * i), pad.l - 4, y);
    }

    function plotLine(key, color) {
      if (chartHistory.length < 2) return;
      ctxChart.beginPath();
      for (let i = 0; i < chartHistory.length; i++) {
        const x = pad.l + (i / MAX_HISTORY) * gw;
        const y = pad.t + gh - (chartHistory[i][key] / maxPop) * gh;
        i === 0 ? ctxChart.moveTo(x, y) : ctxChart.lineTo(x, y);
      }
      ctxChart.strokeStyle = color;
      ctxChart.lineWidth = 2;
      ctxChart.shadowColor = color + '55';
      ctxChart.shadowBlur = 6;
      ctxChart.stroke();
      ctxChart.shadowBlur = 0;
    }

    if (chartHistory.length > 1) {
      const last = chartHistory[chartHistory.length - 1];
      plotLine('flora', '#00ff88');
      plotLine('herb', '#00d4ff');
      plotLine('carn', '#ff2d78');
    }

    ctxChart.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctxChart.font = '6px "JetBrains Mono", monospace';
    ctxChart.textAlign = 'center';
    ctxChart.textBaseline = 'top';
    ctxChart.fillText('TIME (ticks)', pad.l + gw / 2, pad.t + gh + 16);

    ctxChart.save();
    ctxChart.translate(10, pad.t + gh / 2);
    ctxChart.rotate(-Math.PI / 2);
    ctxChart.textAlign = 'center';
    ctxChart.fillText('POPULATION', 0, 0);
    ctxChart.restore();
  }

  /* === VIRUS === */
  function injectVirus() {
    const targets = entities.filter(e => e.alive && (e.type === T.HERB || e.type === T.CARN));
    for (const t of targets) {
      if (Math.random() < 0.6) {
        t.energy /= 2;
      }
    }
  }

  /* === GAME LOOP === */
  let lastTime = 0;
  let accumulator = 0;

  function loop(time) {
    const dt = lastTime ? (time - lastTime) / 1000 : 0;
    lastTime = time;

    if (!paused) {
      accumulator += dt * params.speed;
      while (accumulator >= 0.1) {
        update();
        tick++;
        tickDisplay.textContent = 'TICK ' + tick;
        accumulator -= 0.1;
      }
    }

    drawEcosystem();
    drawChart();

    requestAnimationFrame(loop);
  }

  /* === RESEED === */
  btnReseed.addEventListener('click', () => {
    seedEcosystem();
    updateTelemetry();
    logHistory();
    pauseLabel.textContent = 'Pause';
    paused = false;
  });

  /* === PAUSE === */
  btnPause.addEventListener('click', () => {
    paused = !paused;
    pauseLabel.textContent = paused ? 'Resume' : 'Pause';
  });

  /* === VIRUS === */
  btnVirus.addEventListener('click', injectVirus);

  /* === INIT === */
  seedEcosystem();
  updateTelemetry();
  logHistory();
  requestAnimationFrame(loop);

})();
