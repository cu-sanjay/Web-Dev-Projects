(function () {
  'use strict';

  /* === SPECIES DATABASE === */
  const SPECIES = {
    monarch: {
      id: 'monarch', name: 'Monarch Butterfly', sci: 'Danaus plexippus',
      color: '#00e676', colorDim: 'rgba(0,230,118,0.3)',
      route: 'Canada → Central Mexico', dist: '~4,800 km', threat: 'VULNERABLE',
      desc: 'Annual multi-generational migration from Southern Canada to the oyamel fir forests of Central Mexico. Navigates using magnetic field and sun compass.',
      icon: 'M8 10l4-3 4 3v6H8v-6z',
      waypoints: [
        { x: 0.35, y: 0.10 }, { x: 0.32, y: 0.18 },
        { x: 0.28, y: 0.26 }, { x: 0.25, y: 0.35 },
        { x: 0.20, y: 0.45 }, { x: 0.17, y: 0.56 }
      ],
      resting: [
        { x: 0.32, y: 0.18, label: 'Great Lakes Basin' },
        { x: 0.25, y: 0.35, label: 'Texas Plains' },
        { x: 0.20, y: 0.45, label: 'Central Plateau' }
      ],
      particleCount: 18
    },
    humpback: {
      id: 'humpback', name: 'Humpback Whale', sci: 'Megaptera novaeangliae',
      color: '#00e5ff', colorDim: 'rgba(0,229,255,0.3)',
      route: 'Alaska → Hawaii', dist: '~5,000 km', threat: 'MODERATE',
      desc: 'Annual migration from feeding grounds in Alaska to breeding waters off Hawaii. Travels ~5,000 km across the open Pacific Ocean.',
      icon: 'M8 10l4-3 4 3v6H8v-6z',
      waypoints: [
        { x: 0.05, y: 0.10 }, { x: 0.07, y: 0.18 },
        { x: 0.09, y: 0.26 }, { x: 0.11, y: 0.34 },
        { x: 0.14, y: 0.42 }, { x: 0.18, y: 0.50 }
      ],
      resting: [
        { x: 0.07, y: 0.18, label: 'BC Continental Shelf' },
        { x: 0.11, y: 0.34, label: 'California Current' }
      ],
      particleCount: 12
    },
    arcticTern: {
      id: 'arcticTern', name: 'Arctic Tern', sci: 'Sterna paradisaea',
      color: '#ff2d78', colorDim: 'rgba(255,45,120,0.3)',
      route: 'Arctic → Antarctic', dist: '~30,000 km', threat: 'NEAR-THREATENED',
      desc: 'The longest migration of any animal. Travels from the Arctic breeding grounds to the Antarctic coast and back — seeing two summers each year.',
      icon: 'M8 10l4-3 4 3v6H8v-6z',
      waypoints: [
        { x: 0.50, y: 0.02 }, { x: 0.52, y: 0.08 },
        { x: 0.55, y: 0.16 }, { x: 0.58, y: 0.26 },
        { x: 0.60, y: 0.38 }, { x: 0.58, y: 0.50 },
        { x: 0.54, y: 0.62 }, { x: 0.50, y: 0.75 },
        { x: 0.48, y: 0.88 }
      ],
      resting: [
        { x: 0.55, y: 0.16, label: 'Iceland' },
        { x: 0.58, y: 0.26, label: 'Mid-Atlantic Ridge' },
        { x: 0.50, y: 0.75, label: 'Southern Ocean' }
      ],
      particleCount: 22
    }
  };

  /* === CONTINENT OUTLINES (normalized 0-1) === */
  const CONTINENTS = [
    { name: 'North America', color: 'rgba(255,255,255,0.04)',
      pts: [[0.04,0.08],[0.18,0.06],[0.28,0.14],[0.30,0.18],[0.26,0.22],[0.22,0.26],[0.18,0.28],[0.14,0.30],[0.08,0.28],[0.04,0.22],[0.02,0.16],[0.04,0.08]] },
    { name: 'South America', color: 'rgba(255,255,255,0.04)',
      pts: [[0.16,0.32],[0.22,0.30],[0.28,0.34],[0.30,0.40],[0.28,0.48],[0.24,0.56],[0.20,0.62],[0.18,0.60],[0.16,0.54],[0.14,0.46],[0.12,0.40],[0.14,0.34],[0.16,0.32]] },
    { name: 'Europe', color: 'rgba(255,255,255,0.04)',
      pts: [[0.44,0.06],[0.48,0.04],[0.54,0.06],[0.56,0.10],[0.54,0.14],[0.50,0.16],[0.46,0.14],[0.44,0.10],[0.44,0.06]] },
    { name: 'Africa', color: 'rgba(255,255,255,0.04)',
      pts: [[0.44,0.18],[0.50,0.16],[0.56,0.18],[0.58,0.24],[0.56,0.32],[0.54,0.40],[0.50,0.46],[0.46,0.44],[0.44,0.38],[0.42,0.30],[0.42,0.24],[0.44,0.18]] },
    { name: 'Asia', color: 'rgba(255,255,255,0.04)',
      pts: [[0.56,0.02],[0.70,0.04],[0.82,0.08],[0.88,0.14],[0.90,0.20],[0.86,0.26],[0.80,0.30],[0.72,0.32],[0.64,0.30],[0.58,0.28],[0.54,0.22],[0.52,0.16],[0.52,0.10],[0.54,0.04],[0.56,0.02]] },
    { name: 'Australia', color: 'rgba(255,255,255,0.04)',
      pts: [[0.78,0.46],[0.84,0.44],[0.90,0.46],[0.92,0.52],[0.88,0.58],[0.82,0.58],[0.78,0.54],[0.76,0.50],[0.78,0.46]] },
    { name: 'Greenland', color: 'rgba(255,255,255,0.04)',
      pts: [[0.28,0.02],[0.36,0.02],[0.40,0.06],[0.42,0.12],[0.38,0.16],[0.32,0.14],[0.28,0.10],[0.26,0.06],[0.28,0.02]] }
  ];

  /* === STATE === */
  let state = {
    species: 'humpback',
    temp: 1.2,
    speed: 1,
    running: false,
    progress: 0,
    hazards: [],
    logEntries: [],
    active: true
  };
  let particles = [];
  let animId = null;
  let logId = 0;

  /* === DOM REFS === */
  const $ = id => document.getElementById(id);
  const selectSpecies = $('selectSpecies');
  const sliderTemp = $('sliderTemp'), valTemp = $('valTemp');
  const sliderSpeed = $('sliderSpeed'), valSpeed = $('valSpeed');
  const mapCanvas = $('mapCanvas'), ctx = mapCanvas.getContext('2d');
  const routeBadge = $('routeBadge');
  const infoBody = $('infoBody'), logScroll = $('logScroll'), logCount = $('logCount');
  const stateDot = $('stateDot'), stateLabel = $('stateLabel');
  const btnInitiate = $('btnInitiate'), btnHazard = $('btnHazard'), btnFlush = $('btnFlush');

  /* === LOGGING === */
  function appendLog(msg, type) {
    const entry = { id: logId++, time: new Date().toISOString().slice(11,19), msg, type: type || 'info' };
    state.logEntries.unshift(entry);
    if (state.logEntries.length > 200) state.logEntries.pop();

    const el = document.createElement('div');
    el.className = 'log-entry ' + (entry.type || 'info');
    el.innerHTML = `<span class="log-time">${entry.time}</span><span class="log-msg">${entry.msg}</span>`;
    logScroll.insertBefore(el, logScroll.firstChild);
    logCount.textContent = state.logEntries.length + ' events';
  }

  function clearLog() {
    state.logEntries = [];
    logScroll.innerHTML = '';
    logCount.textContent = '0 events';
  }

  /* === CATMULL-ROM SPLINE === */
  function catmullRom(t, p0, p1, p2, p3, axis) {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * (
      (2 * p1[axis]) +
      (-p0[axis] + p2[axis]) * t +
      (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t2 +
      (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t3
    );
  }

  function evalSpline(pts, t) {
    const n = pts.length;
    if (n === 0) return { x: 0, y: 0 };
    if (n === 1) return { x: pts[0].x, y: pts[0].y };
    if (t <= 0) return { x: pts[0].x, y: pts[0].y };
    if (t >= 1) return { x: pts[n-1].x, y: pts[n-1].y };

    const segCount = n - 1;
    const segT = t * segCount;
    const i = Math.floor(segT);
    const s = segT - i;
    const pi = Math.max(0, i - 1);
    const pj = i;
    const pk = Math.min(n - 1, i + 1);
    const pl = Math.min(n - 1, i + 2);

    return {
      x: catmullRom(s, pts[pi], pts[pj], pts[pk], pts[pl], 'x'),
      y: catmullRom(s, pts[pi], pts[pj], pts[pk], pts[pl], 'y')
    };
  }

  /* === GET LENGTH OF SPLINE === */
  function splineLength(pts, samples) {
    samples = samples || 100;
    let len = 0;
    let prev = evalSpline(pts, 0);
    for (let i = 1; i <= samples; i++) {
      const p = evalSpline(pts, i / samples);
      len += Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
      prev = p;
    }
    return len;
  }

  /* === PARTICLES === */
  function initParticles(speciesId) {
    const spec = SPECIES[speciesId];
    if (!spec) return;
    particles = [];
    const count = spec.particleCount;
    for (let i = 0; i < count; i++) {
      const offset = i / count;
      particles.push({
        t: offset,
        baseT: offset,
        speed: 0.002 + Math.random() * 0.003,
        driftX: 0, driftY: 0,
        driftActive: false,
        hazardFlash: 0,
        completed: false
      });
    }
  }

  /* === UPDATE PARTICLES === */
  function updateParticles(pts, dt) {
    const speedMult = state.speed;
    const hasHazard = state.hazards.length > 0;
    let anyMoving = false;

    particles.forEach(p => {
      if (p.completed) return;
      p.hazardFlash = Math.max(0, p.hazardFlash - dt * 2);

      let inHazard = false;
      let hazardCenter = null;
      if (hasHazard) {
        const pos = evalSpline(pts, p.t);
        for (const h of state.hazards) {
          const dx = pos.x - h.x, dy = pos.y - h.y;
          if (dx * dx + dy * dy < h.r * h.r) {
            inHazard = true;
            hazardCenter = h;
            break;
          }
        }
      }

      if (inHazard && hazardCenter) {
        const angle = Math.atan2(p.driftY || 0.01, p.driftX || 0.01) + (Math.random() - 0.5) * 0.4;
        const driftMag = 0.003 + Math.random() * 0.005;
        p.driftX = Math.cos(angle) * driftMag;
        p.driftY = Math.sin(angle) * driftMag;
        p.driftActive = true;
        p.hazardFlash = 1;

        if (!p._hazardLogged) {
          const specName = SPECIES[state.species].name;
          appendLog(`[WARNING] ${specName} pod encountering severe crosswind hazard near ${hazardCenter.label || 'unknown zone'}. Migration delay index elevated.`, 'hazard');
          p._hazardLogged = true;
        }

        p.t += (p.speed * 0.3 * dt * speedMult);
        p.t += p.driftX * 0.5;
      } else {
        p.driftX *= 0.95;
        p.driftY *= 0.95;
        p.driftActive = false;
        p._hazardLogged = false;
        p.t += p.speed * dt * speedMult;
      }

      if (p.t >= 1) {
        if (p.baseT > 0.3) {
          p.t = p.baseT - 0.2;
        } else {
          p.t = 0;
        }
        p.completed = false;
      }
      anyMoving = true;
    });
    return anyMoving;
  }

  /* === SIZE CANVAS === */
  function sizeMap() {
    const wrap = mapCanvas.parentElement;
    const w = Math.min(wrap.clientWidth - 4, 900);
    const h = Math.max(380, Math.round(w * 0.58));
    mapCanvas.width = w; mapCanvas.height = h;
    mapCanvas.style.width = w + 'px'; mapCanvas.style.height = h + 'px';
    return { w, h };
  }

  /* === DRAW MAP === */
  function drawMap() {
    const { w, h } = sizeMap();
    ctx.clearRect(0, 0, w, h);

    /* Grid lines */
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.3;
    for (let i = 0; i <= 12; i++) {
      const x = (i / 12) * w;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let i = 0; i <= 8; i++) {
      const y = (i / 8) * h;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    /* Continents */
    CONTINENTS.forEach(cont => {
      ctx.fillStyle = cont.color;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      cont.pts.forEach((pt, i) => {
        const px = pt[0] * w, py = pt[1] * h;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    /* Equator */
    ctx.strokeStyle = 'rgba(0,230,118,0.06)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 6]);
    ctx.beginPath(); ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0,230,118,0.08)';
    ctx.font = '4px "JetBrains Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('EQUATOR', 4, h * 0.5 + 2);

    const spec = SPECIES[state.species];
    if (!spec) return;

    const pts = spec.waypoints;

    /* Route path */
    ctx.strokeStyle = spec.colorDim;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const p = evalSpline(pts, i / 200);
      const px = p.x * w, py = p.y * h;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    /* Waypoint markers */
    pts.forEach((pt, i) => {
      const px = pt.x * w, py = pt.y * h;
      ctx.fillStyle = i === 0 ? spec.color : 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.arc(px, py, i === 0 ? 3 : 1.5, 0, Math.PI * 2); ctx.fill();
      if (i === 0) {
        ctx.fillStyle = '#4a5268';
        ctx.font = '5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText('START', px, py - 5);
      }
      if (i === pts.length - 1) {
        ctx.fillStyle = '#4a5268';
        ctx.font = '5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('END', px, py + 5);
      }
    });

    /* Resting zones — radar ping */
    spec.resting.forEach((r, i) => {
      const px = r.x * w, py = r.y * h;
      const phase = (Date.now() / 2000 + i * 1.5) % 1;
      const maxR = 14 + (i * 3);
      const cr = maxR * phase;

      ctx.strokeStyle = spec.colorDim.replace('0.3', String(0.15 - phase * 0.1));
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.arc(px, py, cr, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#4a5268';
      ctx.font = '4px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(r.label, px, py + 5);
    });

    /* Hazard zones */
    state.hazards.forEach((h, idx) => {
      const hx = h.x * w, hy = h.y * h;
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 400 + idx * 2.1);

      ctx.fillStyle = `rgba(255,184,0,${0.04 * pulse})`;
      ctx.beginPath(); ctx.arc(hx, hy, h.r * w, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = `rgba(255,184,0,${0.5 * pulse})`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.arc(hx, hy, h.r * w, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);

      const hPhase = (Date.now() / 800 + idx) % 1;
      const hr = h.r * w * (0.3 + 0.7 * hPhase);
      ctx.strokeStyle = `rgba(255,184,0,${0.15 * (1 - hPhase)})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = 'rgba(255,184,0,0.6)';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('CROSSWIND HAZARD', hx, hy - h.r * w - 3);
    });

    /* Particles */
    particles.forEach(p => {
      if (p.completed) return;
      const pos = evalSpline(pts, p.t);
      const px = pos.x * w, py = pos.y * h;

      const color = p.hazardFlash > 0.1 ? '#ffb800' : spec.color;
      const alpha = p.hazardFlash > 0.1 ? 1 : 0.7 + 0.3 * Math.sin(Date.now() / 300 + p.baseT * 10);
      const size = p.hazardFlash > 0.1 ? 4 : 2 + Math.sin(Date.now() / 500 + p.baseT * 5) * 0.5;

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = color + '66';
      ctx.shadowBlur = p.hazardFlash > 0.1 ? 10 : 5;

      if (spec.id === 'monarch') {
        ctx.beginPath();
        ctx.moveTo(px, py - size);
        ctx.lineTo(px + size * 0.8, py);
        ctx.lineTo(px, py + size);
        ctx.lineTo(px - size * 0.8, py);
        ctx.closePath();
        ctx.fill();
      } else if (spec.id === 'humpback') {
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff33';
        ctx.beginPath();
        ctx.arc(px - size * 0.3, py - size * 0.3, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(px, py - size);
        ctx.lineTo(px + size * 0.6, py + size * 0.3);
        ctx.lineTo(px + size * 0.2, py + size * 0.1);
        ctx.lineTo(px, py + size);
        ctx.lineTo(px - size * 0.2, py + size * 0.1);
        ctx.lineTo(px - size * 0.6, py + size * 0.3);
        ctx.closePath();
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });

    /* Progress bar overlay */
    const progBarY = h - 12;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath(); ctx.roundRect(10, progBarY, w - 20, 6, 3); ctx.fill();

    const prog = state.progress;
    const fillW = (w - 20) * (prog / 100);
    const grad = ctx.createLinearGradient(10, 0, 10 + fillW, 0);
    grad.addColorStop(0, spec.color + '44');
    grad.addColorStop(1, spec.color);
    ctx.fillStyle = grad;
    ctx.shadowColor = spec.color + '44';
    ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.roundRect(10, progBarY, fillW, 6, 3); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#4a5268';
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    ctx.fillText('MIGRATION PROGRESS ' + prog.toFixed(1) + '%', w - 14, progBarY - 2);
  }

  /* === UPDATE UI === */
  function updateSpeciesInfo(spec) {
    routeBadge.textContent = spec.name.toUpperCase();

    document.querySelector('#infoIcon svg').innerHTML = '';
    infoBody.innerHTML = `
      <div class="info-hero">
        <div class="info-icon" style="background:${spec.color}22;border-color:${spec.color}55">
          <svg viewBox="0 0 24 24" fill="none" stroke="${spec.color}" stroke-width="1.5"><path d="${spec.icon}"/></svg>
        </div>
        <div>
          <span class="info-name" style="color:${spec.color}">${spec.name}</span>
          <span class="info-sci"><i>${spec.sci}</i></span>
        </div>
      </div>
      <div class="info-detail">
        <span class="info-detail-label">Migration Route</span>
        <span class="info-detail-val">${spec.route}</span>
      </div>
      <div class="info-detail">
        <span class="info-detail-label">Distance</span>
        <span class="info-detail-val">${spec.dist}</span>
      </div>
      <div class="info-detail">
        <span class="info-detail-label">Threat Level</span>
        <span class="info-detail-val threat">${spec.threat}</span>
      </div>
      <div class="info-detail">
        <span class="info-detail-label">Status</span>
        <span class="info-detail-val" id="migStatus">${state.running ? 'Migrating' : 'Standing By'}</span>
      </div>
      <div class="info-detail info-desc">${spec.desc}</div>
    `;
  }

  /* === FRAME RENDER === */
  function render() {
    drawMap();
  }

  /* === ANIMATION LOOP === */
  let lastTime = 0;

  function tick(time) {
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
    lastTime = time;

    if (state.running && state.active) {
      const spec = SPECIES[state.species];
      updateParticles(spec.waypoints, dt);

      const avgProgress = particles.reduce((s, p) => s + (p.completed ? 1 : p.t), 0) / particles.length * 100;
      state.progress = avgProgress;
    }

    render();
    animId = requestAnimationFrame(tick);
  }

  /* === START/STOP === */
  function startMigration() {
    if (state.running) return;
    const spec = SPECIES[state.species];
    initParticles(state.species);
    state.running = true;
    state.progress = 0;
    appendLog(`[INIT] ${spec.name} migration cycle commenced. Tracking ${particles.length} agents along ${spec.route}.`, 'info');
    setUIState('active');
    const status = document.getElementById('migStatus');
    if (status) status.textContent = 'Migrating';
  }

  function setUIState(mode) {
    stateDot.className = 'state-dot';
    if (mode === 'active') { stateDot.classList.add('active'); stateLabel.textContent = 'TRACKING'; }
    else if (mode === 'hazard') { stateDot.classList.add('hazard'); stateLabel.textContent = 'HAZARD ACTIVE'; }
    else { stateDot.className = 'state-dot flushed'; stateLabel.textContent = 'FLUSHED'; }
  }

  /* === HAZARD === */
  function injectHazard() {
    const spec = SPECIES[state.species];
    const lastWP = spec.waypoints[spec.waypoints.length - 1];
    const midIdx = Math.floor(spec.waypoints.length / 2);
    const midWP = spec.waypoints[midIdx];

    const hx = midWP.x + (lastWP.x - midWP.x) * 0.3 + (Math.random() - 0.5) * 0.08;
    const hy = midWP.y + (lastWP.y - midWP.y) * 0.3 + (Math.random() - 0.5) * 0.08;
    const hr = 0.06 + Math.random() * 0.03;

    state.hazards.push({ x: hx, y: hy, r: hr, time: Date.now(), label: 'Crosswind Cell' });
    appendLog(`[HAZARD] Crosswind weather hazard injected at ${(hx * 100).toFixed(0)}°W, ${(hy * 100).toFixed(0)}°N. Radius: ${(hr * 100).toFixed(0)} km.`, 'warn');
    if (state.hazards.length > 3) state.hazards.shift();
    setUIState('hazard');
    setTimeout(() => {
      if (state.hazards.length === 0) return;
      if (state.running) setUIState('active');
    }, 3000);
  }

  /* === FLUSH === */
  function flushAll() {
    state.running = false;
    state.progress = 0;
    state.hazards = [];
    particles = [];
    lastTime = 0;

    clearLog();
    appendLog('[SYS] Vector traces flushed. All sockets reset to standby state.', 'done');
    setUIState('flushed');

    const status = document.getElementById('migStatus');
    if (status) status.textContent = 'Standing By';
  }

  /* === EVENT BINDING === */
  btnInitiate.addEventListener('click', startMigration);

  btnHazard.addEventListener('click', () => {
    if (!state.running) {
      appendLog('[SYS] Cannot inject hazard — no active migration cycle.', 'warn');
      return;
    }
    injectHazard();
  });

  btnFlush.addEventListener('click', flushAll);

  selectSpecies.addEventListener('change', () => {
    state.species = selectSpecies.value;
    const spec = SPECIES[state.species];
    updateSpeciesInfo(spec);
    if (state.running) {
      initParticles(state.species);
      appendLog(`[INFO] Switched tracking to ${spec.name}. Recalibrating vector matrix.`, 'info');
    } else {
      particles = [];
      render();
    }
  });

  sliderTemp.addEventListener('input', () => {
    state.temp = parseFloat(sliderTemp.value);
    valTemp.textContent = (state.temp >= 0 ? '+' : '') + state.temp.toFixed(1) + '°C';
  });

  sliderSpeed.addEventListener('input', () => {
    state.speed = parseFloat(sliderSpeed.value);
    valSpeed.textContent = state.speed.toFixed(1) + '×';
  });

  /* === RESIZE === */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });

  /* === INIT === */
  function init() {
    const spec = SPECIES[state.species];
    updateSpeciesInfo(spec);
    render();
    appendLog('[SYS] Wildlife Migration Tracker initialized. Standby mode engaged.', 'done');
    appendLog('[INFO] Select species and click "Initiate Migration Cycle Async" to begin tracking.', 'info');
    animId = requestAnimationFrame(tick);
  }

  init();

})();
