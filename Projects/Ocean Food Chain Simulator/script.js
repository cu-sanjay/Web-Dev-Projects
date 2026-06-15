(function () {
  'use strict';

  /* === TIER CONFIG === */
  const TIERS = {
    phytoplankton: { color: '#00e676', size: 3, speed: 0.2, maxPop: 300, reproRate: 0.002, label: 'Phytoplankton' },
    krill:        { color: '#00e5ff', size: 4, speed: 0.7, maxPop: 150, reproRate: 0.003, label: 'Krill' },
    fish:         { color: '#ffb800', size: 6, speed: 1.2, maxPop: 60,  reproRate: 0.002, label: 'Fish' },
    sharks:       { color: '#ff1744', size: 9, speed: 0.9, maxPop: 20,  reproRate: 0.001, label: 'Sharks' }
  };

  const INITIAL = { phytoplankton: 120, krill: 50, fish: 20, sharks: 6 };
  const TIER_ORDER = ['phytoplankton','krill','fish','sharks'];

  /* === STATE === */
  let particles = [];
  let extinctions = { phytoplankton: false, krill: false, fish: false, sharks: false };
  let temp = 18, agility = 1;
  let running = true;
  let cascadeActive = false;
  let totalPop = 0;

  /* === DOM === */
  const $ = id => document.getElementById(id);
  const arenaCanvas = $('arenaCanvas'), ctx = arenaCanvas.getContext('2d');
  const tmPhyto = $('tmPhyto'), tmKrill = $('tmKrill'), tmBiomass = $('tmBiomass'), tmStability = $('tmStability');
  const mgPhyto = $('mgPhyto'), mgKrill = $('mgKrill'), mgFish = $('mgFish'), mgShark = $('mgShark');
  const popBadge = $('popBadge'), stateDot = $('stateDot'), stateLabel = $('stateLabel');
  const btnCascade = $('btnCascade'), btnInvasive = $('btnInvasive'), btnPurge = $('btnPurge');
  const sliderTemp = $('sliderTemp'), valTemp = $('valTemp');
  const sliderAgility = $('sliderAgility'), valAgility = $('valAgility');

  TIER_ORDER.forEach(t => {
    const btn = document.querySelector(`[data-tier="${t}"]`);
    if (btn) {
      btn.addEventListener('click', () => {
        extinctions[t] = !extinctions[t];
        btn.classList.toggle('active');
        if (extinctions[t]) {
          particles = particles.filter(p => p.tier !== t);
        }
      });
    }
  });

  sliderTemp.addEventListener('input', () => {
    temp = parseFloat(sliderTemp.value);
    valTemp.textContent = (temp >= 0 ? '+' : '') + temp.toFixed(1) + '°C';
  });
  sliderAgility.addEventListener('input', () => {
    agility = parseFloat(sliderAgility.value);
    valAgility.textContent = agility.toFixed(1) + '×';
  });

  /* === PARTICLE FACTORY === */
  function createParticle(tier, x, y) {
    const cfg = TIERS[tier];
    return {
      tier, x: x || Math.random() * arenaWidth(),
      y: y || Math.random() * arenaHeight(),
      vx: (Math.random() - 0.5) * cfg.speed,
      vy: (Math.random() - 0.5) * cfg.speed,
      size: cfg.size + Math.random() * 1.5,
      energy: 100,
      age: 0,
      alive: true
    };
  }

  function arenaWidth() { return arenaCanvas.width; }
  function arenaHeight() { return arenaCanvas.height; }

  /* === SEED OCEAN === */
  function seedOcean() {
    particles = [];
    Object.keys(INITIAL).forEach(tier => {
      for (let i = 0; i < INITIAL[tier]; i++) {
        particles.push(createParticle(tier));
      }
    });
    extinctions = { phytoplankton: false, krill: false, fish: false, sharks: false };
    document.querySelectorAll('.ext-btn').forEach(b => b.classList.remove('active'));
  }

  /* === SIMULATION STEP === */
  function step() {
    const w = arenaWidth(), h = arenaHeight();
    const tempFactor = 0.5 + (temp / 35) * 0.5;
    const agilityFactor = agility;

    /* Count per tier */
    const counts = { phytoplankton: 0, krill: 0, fish: 0, sharks: 0 };
    particles.forEach(p => { if (p.alive) counts[p.tier]++; });

    const newParticles = [];

    particles.forEach(p => {
      if (!p.alive) return;
      p.age++;

      /* Temperature affects metabolism */
      const metFactor = tempFactor;
      p.energy -= 0.005 * metFactor;

      const cfg = TIERS[p.tier];

      /* Behaviour per tier */
      if (p.tier === 'phytoplankton') {
        p.vx += (Math.random() - 0.5) * 0.2;
        p.vy += (Math.random() - 0.5) * 0.2;
        p.vx *= 0.98; p.vy *= 0.98;
        if (p.energy < 50 && counts.phytoplankton < cfg.maxPop) {
          p.energy += 0.08 * tempFactor;
        }
        /* Reproduce */
        if (p.energy > 90 && counts.phytoplankton < cfg.maxPop && Math.random() < cfg.reproRate * tempFactor) {
          newParticles.push(createParticle('phytoplankton', p.x + (Math.random() - 0.5) * 10, p.y + (Math.random() - 0.5) * 10));
        }
      }

      if (p.tier === 'krill') {
        if (counts.krill > 0) {
          const target = findNearest(p, 'phytoplankton');
          if (target && !extinctions.phytoplankton) {
            const dx = target.x - p.x, dy = target.y - p.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 15 && d > 0) {
              p.vx += (dx / d) * 0.15 * agilityFactor;
              p.vy += (dy / d) * 0.15 * agilityFactor;
              if (d < 5) {
                target.energy -= 30;
                p.energy += 15;
                if (target.energy <= 0) target.alive = false;
              }
            } else if (d > 0) {
              p.vx += (dx / d) * 0.04 * agilityFactor;
              p.vy += (dy / d) * 0.04 * agilityFactor;
            }
          }
        }
        p.vx *= 0.97; p.vy *= 0.97;
        if (p.energy > 85 && counts.krill < cfg.maxPop && Math.random() < cfg.reproRate * tempFactor) {
          newParticles.push(createParticle('krill', p.x + (Math.random() - 0.5) * 8, p.y + (Math.random() - 0.5) * 8));
        }
        if (p.energy < 20) p.alive = false;
      }

      if (p.tier === 'fish') {
        const target = findNearest(p, 'krill');
        if (target && !extinctions.krill && counts.krill > 0) {
          const dx = target.x - p.x, dy = target.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 30 && d > 0) {
            p.vx += (dx / d) * 0.2 * agilityFactor;
            p.vy += (dy / d) * 0.2 * agilityFactor;
            if (d < 6) {
              target.alive = false;
              p.energy += 25;
            }
          }
        } else {
          /* Scatter */
          p.vx += (Math.random() - 0.5) * 0.1;
          p.vy += (Math.random() - 0.5) * 0.1;
        }
        p.vx *= 0.98; p.vy *= 0.98;
        if (p.energy > 85 && counts.fish < cfg.maxPop && Math.random() < cfg.reproRate) {
          newParticles.push(createParticle('fish', p.x + (Math.random() - 0.5) * 12, p.y + (Math.random() - 0.5) * 12));
        }
        if (p.energy < 15) p.alive = false;
      }

      if (p.tier === 'sharks') {
        const target = findNearest(p, 'fish');
        if (target && !extinctions.fish && counts.fish > 0) {
          const dx = target.x - p.x, dy = target.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 50 && d > 0) {
            p.vx += (dx / d) * 0.15 * agilityFactor;
            p.vy += (dy / d) * 0.15 * agilityFactor;
            if (d < 8) {
              target.alive = false;
              p.energy += 30;
            }
          }
        } else {
          p.vx += (Math.random() - 0.5) * 0.05;
          p.vy += (Math.random() - 0.5) * 0.05;
        }
        p.vx *= 0.99; p.vy *= 0.99;
        if (p.energy > 80 && counts.sharks < cfg.maxPop && Math.random() < cfg.reproRate) {
          newParticles.push(createParticle('sharks', p.x + (Math.random() - 0.5) * 20, p.y + (Math.random() - 0.5) * 20));
        }
        if (p.energy < 10) p.alive = false;
      }

      /* Containment */
      const margin = 20;
      if (p.x < -margin) p.x = w + margin;
      if (p.x > w + margin) p.x = -margin;
      if (p.y < -margin) p.y = h + margin;
      if (p.y > h + margin) p.y = -margin;

      /* Speed limit */
      const cfgS = TIERS[p.tier].speed * 1.5 * agilityFactor;
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > cfgS) { p.vx = (p.vx / spd) * cfgS; p.vy = (p.vy / spd) * cfgS; }

      p.x += p.vx;
      p.y += p.vy;
    });

    /* Add new particles */
    particles = particles.filter(p => p.alive);
    newParticles.forEach(np => {
      if (particles.length < 800) particles.push(np);
    });
  }

  /* === FIND NEAREST PREY === */
  function findNearest(predator, preyTier) {
    let best = null, bestD = Infinity;
    for (const prey of particles) {
      if (!prey.alive || prey.tier !== preyTier) continue;
      if (extinctions[preyTier]) continue;
      const dx = prey.x - predator.x, dy = prey.y - predator.y;
      const d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = prey; }
    }
    return best;
  }

  /* === DRAW === */
  function draw() {
    const can = arenaCanvas;
    const wrap = can.parentElement;
    const w = Math.min(wrap.clientWidth - 4, 900);
    const h = Math.max(380, Math.round(w * 0.6));
    can.width = w; can.height = h;
    can.style.width = w + 'px'; can.style.height = h + 'px';

    ctx.clearRect(0, 0, w, h);

    /* Ocean floor gradient */
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#05060b');
    bg.addColorStop(0.4, '#080d1a');
    bg.addColorStop(1, '#0a0f12');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    /* Subtle grid */
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 0.3;
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * w;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let i = 0; i <= 12; i++) {
      const y = (i / 12) * h;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    /* Draw particles */
    const counts = { phytoplankton: 0, krill: 0, fish: 0, sharks: 0 };
    particles.forEach(p => {
      if (!p.alive) return;
      counts[p.tier]++;
      const cfg = TIERS[p.tier];
      const px = p.x, py = p.y;
      const sz = p.size * (0.8 + 0.4 * (p.energy / 100));

      ctx.shadowColor = cfg.color + '44';
      ctx.shadowBlur = p.tier === 'sharks' ? 12 : 6;
      ctx.globalAlpha = 0.7 + 0.3 * (p.energy / 100);

      if (p.tier === 'phytoplankton') {
        ctx.fillStyle = cfg.color;
        ctx.beginPath();
        ctx.arc(px, py, sz * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cfg.color + '44';
        ctx.beginPath();
        ctx.arc(px, py, sz * 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.tier === 'krill') {
        ctx.fillStyle = cfg.color;
        ctx.beginPath();
        ctx.arc(px, py, sz * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff33';
        ctx.beginPath();
        ctx.arc(px - sz * 0.2, py - sz * 0.2, sz * 0.15, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.tier === 'fish') {
        ctx.fillStyle = cfg.color;
        const angle = Math.atan2(p.vy, p.vx);
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(sz, 0);
        ctx.lineTo(-sz * 0.6, -sz * 0.5);
        ctx.lineTo(-sz * 0.3, 0);
        ctx.lineTo(-sz * 0.6, sz * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (p.tier === 'sharks') {
        ctx.fillStyle = cfg.color;
        const angle = Math.atan2(p.vy, p.vx);
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(sz * 1.2, 0);
        ctx.lineTo(-sz * 0.8, -sz * 0.6);
        ctx.lineTo(-sz * 0.8, sz * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff22';
        ctx.beginPath();
        ctx.arc(sz * 0.3, -sz * 0.2, sz * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });

    /* Cascade overlay */
    if (cascadeActive) {
      ctx.fillStyle = `rgba(255,23,68,${0.06 + 0.02 * Math.sin(Date.now() / 300)})`;
      ctx.fillRect(0, 0, w, h);
    }

    /* Legend */
    const legendY = h - 28;
    const legendItems = [
      { label: 'Phyto', color: '#00e676' },
      { label: 'Krill', color: '#00e5ff' },
      { label: 'Fish', color: '#ffb800' },
      { label: 'Sharks', color: '#ff1744' }
    ];
    let lx = 12;
    legendItems.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.shadowColor = item.color + '44';
      ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(lx, legendY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#4a5268';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(item.label, lx + 6, legendY);
      lx += ctx.measureText(item.label).width + 18;
    });
  }

  /* === TELEMETRY === */
  function updateTelemetry() {
    const counts = { phytoplankton: 0, krill: 0, fish: 0, sharks: 0 };
    particles.forEach(p => { if (p.alive) counts[p.tier]++; });
    totalPop = counts.phytoplankton + counts.krill + counts.fish + counts.sharks;

    tmPhyto.textContent = counts.phytoplankton;
    tmKrill.textContent = counts.krill;

    /* Biomass balance: ratio of predators to prey */
    const prey = counts.phytoplankton + counts.krill * 2;
    const predators = counts.fish * 3 + counts.sharks * 5;
    const biomassRatio = prey > 0 ? (predators / prey) * 100 : 0;
    tmBiomass.textContent = biomassRatio.toFixed(1) + '%';
    tmBiomass.style.color = biomassRatio > 60 ? '#ffb800' : biomassRatio > 30 ? '#00e5ff' : '#00e676';

    /* Stability rating */
    let stability, stabClass;
    const extinctCount = Object.values(extinctions).filter(Boolean).length;

    if (cascadeActive) {
      stability = 'CASCADE CRITICAL'; stabClass = 'cascade';
    } else if (extinctCount >= 2 || counts.sharks === 0 && counts.fish === 0 && counts.krill === 0) {
      stability = 'TROPHIC COLLAPSE'; stabClass = 'collapse';
    } else if (extinctCount > 0 || counts.phytoplankton < 20 || counts.krill < 10) {
      stability = 'TROPHIC CASCADE RISK'; stabClass = 'cascade';
    } else if (biomassRatio > 50) {
      stability = 'UNBALANCED'; stabClass = 'warning';
    } else if (biomassRatio > 20) {
      stability = 'STABLE'; stabClass = 'pristine';
    } else {
      stability = 'PRISTINE'; stabClass = 'pristine';
    }

    tmStability.textContent = stability;
    tmStability.className = 'tm-val stability ' + stabClass;
    popBadge.textContent = totalPop + ' organisms';

    /* Mini gauges */
    const maxPop = { phytoplankton: 300, krill: 150, fish: 60, sharks: 20 };
    mgPhyto.style.width = Math.min((counts.phytoplankton / maxPop.phytoplankton) * 100, 100) + '%';
    mgKrill.style.width = Math.min((counts.krill / maxPop.krill) * 100, 100) + '%';
    mgFish.style.width = Math.min((counts.fish / maxPop.fish) * 100, 100) + '%';
    mgShark.style.width = Math.min((counts.sharks / maxPop.sharks) * 100, 100) + '%';
  }

  /* === SET STATE === */
  function setUIState(mode) {
    stateDot.className = 'state-dot';
    if (mode === 'running') { stateDot.classList.add('running'); stateLabel.textContent = 'RUNNING'; }
    else if (mode === 'cascade') { stateDot.classList.add('cascade'); stateLabel.textContent = 'CASCADE'; }
    else if (mode === 'invasive') { stateDot.classList.add('invasive'); stateLabel.textContent = 'INVASIVE'; }
    else { stateLabel.textContent = 'STANDBY'; }
  }

  /* === ACTIONS === */
  btnCascade.addEventListener('click', () => {
    cascadeActive = !cascadeActive;
    if (cascadeActive) {
      extinctions.sharks = true;
      particles = particles.filter(p => p.tier !== 'sharks');
      document.querySelector('[data-tier="sharks"]').classList.add('active');
      setUIState('cascade');
      btnCascade.textContent = 'Stop Cascade';
      btnCascade.style.borderColor = 'rgba(255,23,68,0.4)';
    } else {
      setUIState('running');
      btnCascade.textContent = 'Induce Extinction Cascade Event';
      btnCascade.style.borderColor = '';
    }
  });

  btnInvasive.addEventListener('click', () => {
    /* Add 15 aggressive fish */
    for (let i = 0; i < 15; i++) {
      const p = createParticle('fish');
      p.energy = 100;
      p.size = TIERS.fish.size * 1.4;
      particles.push(p);
    }
    /* Add 3 large sharks */
    for (let i = 0; i < 3; i++) {
      const p = createParticle('sharks');
      p.energy = 100;
      p.size = TIERS.sharks.size * 1.5;
      particles.push(p);
    }
    setUIState('invasive');
    setTimeout(() => { if (!cascadeActive) setUIState('running'); }, 3000);
  });

  btnPurge.addEventListener('click', () => {
    cascadeActive = false;
    btnCascade.textContent = 'Induce Extinction Cascade Event';
    btnCascade.style.borderColor = '';
    seedOcean();
    setUIState('running');
  });

  /* === MAIN LOOP === */
  let animId;
  function tick() {
    if (running) {
      step();
    }
    draw();
    updateTelemetry();
    animId = requestAnimationFrame(tick);
  }

  /* === RESIZE === */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {}, 150);
  });

  /* === INIT === */
  seedOcean();
  setUIState('running');
  tick();

})();
