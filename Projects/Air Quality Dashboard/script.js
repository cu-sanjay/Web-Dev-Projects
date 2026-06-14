(function () {
  'use strict';

  /* ============================================================
     CITY PRESETS
     ============================================================ */
  const CITIES = {
    industrial: {
      name: 'Industrial Complex',
      pm25: 82, pm10: 210, no2: 175, co: 11.5,
      temp: 38, wind: 8
    },
    coastal: {
      name: 'Coastal Metropolis',
      pm25: 42, pm10: 75, no2: 55, co: 4.5,
      temp: 26, wind: 14
    },
    alpine: {
      name: 'Alpine Sanctuary',
      pm25: 8,  pm10: 18, no2: 12, co: 0.8,
      temp: 12, wind: 22
    },
    desert: {
      name: 'Desert Hub',
      pm25: 62, pm10: 175, no2: 28, co: 2.4,
      temp: 44, wind: 30
    }
  };

  /* ============================================================
     AQI BREAKPOINTS
     ============================================================ */
  const BP = {
    pm25:  { bp: [0, 12, 35.4, 55.4, 150.4, 250.4, 500],   idx: [0, 50, 100, 150, 200, 300, 500] },
    pm10:  { bp: [0, 54, 154, 254, 354, 424, 604],          idx: [0, 50, 100, 150, 200, 300, 500] },
    no2:   { bp: [0, 53, 100, 360, 649, 1249, 2049],        idx: [0, 50, 100, 150, 200, 300, 500] },
    co:    { bp: [0, 4.4, 9.4, 12.4, 15.4, 30.4, 50.4],    idx: [0, 50, 100, 150, 200, 300, 500] }
  };

  const AQI_RANGES = [
    { max: 50,   cls: 'good',     label: 'GOOD',         hex: '#00e676' },
    { max: 100,  cls: 'moderate', label: 'MODERATE',     hex: '#ffb800' },
    { max: 150,  cls: 'unhealthy',label: 'UNHEALTHY (SENSITIVE)', hex: '#ff6d00' },
    { max: 200,  cls: 'bad',      label: 'UNHEALTHY',    hex: '#ff1744' },
    { max: 300,  cls: 'severe',   label: 'VERY UNHEALTHY', hex: '#d500f9' },
    { max: 500,  cls: 'critical', label: 'HAZARDOUS',    hex: '#b71c1c' }
  ];

  /* ============================================================
     STATE
     ============================================================ */
  let state = {
    cityId: 'coastal',
    pm25: 42, pm10: 75, no2: 55, co: 4.5,
    temp: 26, wind: 14,
    aqi: 0,
    purifierActive: false,
    trafficSpiked: false,
    purifierProgress: 0, // 0-1 during purification
    baseline: {}  // snapshot of city baseline
  };

  /* ============================================================
     DOM REFS
     ============================================================ */
  const $ = id => document.getElementById(id);
  const $q = sel => document.querySelector(sel);
  const $a = sel => document.querySelectorAll(sel);

  const selectCity = $('selectCity');
  const sliderTemp = $('sliderTemp'), valTemp = $('valTemp');
  const sliderWind = $('sliderWind'), valWind = $('valWind');
  const aqiText = $('aqiText'), aqiLabel = $('aqiLabel'), aqiArc = $('aqiArc');
  const gmPM25 = $('gmPM25'), gmPM10 = $('gmPM10'), gmNO2 = $('gmNO2'), gmCO = $('gmCO');
  const pollBody = $('pollBody');
  const healthBody = $('healthBody');
  const gaugeHint = $('gaugeHint'), pollHint = $('pollHint'), healthHint = $('healthHint');
  const canvas = $('smogCanvas'), ctx = canvas.getContext('2d');
  const toastContainer = $('toastContainer');
  const btnTraffic = $('btnTraffic'), btnPurifier = $('btnPurifier'), btnPurge = $('btnPurge');
  const root = document.documentElement;

  /* ============================================================
     AQI CALCULATION
     ============================================================ */
  function calcSubIndex(value, table) {
    if (value <= table.bp[0]) return table.idx[0];
    if (value >= table.bp[table.bp.length - 1]) return table.idx[table.idx.length - 1];
    for (let i = 1; i < table.bp.length; i++) {
      if (value <= table.bp[i]) {
        const pct = (value - table.bp[i - 1]) / (table.bp[i] - table.bp[i - 1]);
        return Math.round(table.idx[i - 1] + pct * (table.idx[i] - table.idx[i - 1]));
      }
    }
    return 500;
  }

  function calcAQI(pm25, pm10, no2, co) {
    return Math.max(
      calcSubIndex(pm25, BP.pm25),
      calcSubIndex(pm10, BP.pm10),
      calcSubIndex(no2, BP.no2),
      calcSubIndex(co, BP.co)
    );
  }

  /* ============================================================
     AQI THEME
     ============================================================ */
  function getAQIRange(aqi) {
    for (let i = 0; i < AQI_RANGES.length; i++) {
      if (aqi <= AQI_RANGES[i].max) return AQI_RANGES[i];
    }
    return AQI_RANGES[AQI_RANGES.length - 1];
  }

  function applyTheme(aqi) {
    const range = getAQIRange(aqi);
    root.style.setProperty('--aq', range.hex);

    // Update all themed elements
    aqiText.textContent = aqi;
    aqiLabel.textContent = range.label;

    const circumference = 534; // 2 * PI * 85
    const offset = circumference - (aqi / 500) * circumference;
    aqiArc.setAttribute('stroke-dashoffset', offset);

    // Gauge hint
    gaugeHint.textContent = range.label;
    gaugeHint.style.color = range.hex;

    // Top badge
    $('topBadge').textContent = 'AQI ' + aqi + ' · ' + range.label;
    $('topBadge').style.color = range.hex;
    $('topBadge').style.borderColor = range.hex + '33';
  }

  /* ============================================================
     UPDATE ALL UI
     ============================================================ */
  function updateAll() {
    const aqi = calcAQI(state.pm25, state.pm10, state.no2, state.co);
    state.aqi = aqi;
    applyTheme(aqi);

    // Gauge meta readings
    gmPM25.textContent = state.pm25.toFixed(1) + ' µg';
    gmPM10.textContent = state.pm10.toFixed(1) + ' µg';
    gmNO2.textContent = state.no2.toFixed(1) + ' ppb';
    gmCO.textContent = state.co.toFixed(1) + ' ppm';

    // Pollutant breakdown cards
    renderPollutants(aqi);

    // Health panel
    renderHealth(aqi);

    // Particle density update
    updateParticleDensity(aqi);
  }

  /* ============================================================
     POLLUTANT CARDS
     ============================================================ */
  const POLLUTANTS = [
    { key: 'pm25', name: 'PM₂.₅', unit: 'µg/m³', label: 'Fine Particulate' },
    { key: 'pm10', name: 'PM₁₀',  unit: 'µg/m³', label: 'Coarse Particulate' },
    { key: 'no2',  name: 'NO₂',   unit: 'ppb',   label: 'Nitrogen Dioxide' },
    { key: 'co',   name: 'CO',    unit: 'ppm',   label: 'Carbon Monoxide' }
  ];

  function renderPollutants(aqi) {
    pollBody.innerHTML = '';
    const range = getAQIRange(aqi);

    POLLUTANTS.forEach(p => {
      const val = state[p.key];
      const subIdx = calcSubIndex(val, BP[p.key]);
      const pct = Math.min((val / BP[p.key].bp[BP[p.key].bp.length - 1]) * 100, 100);

      const card = document.createElement('div');
      card.className = 'poll-card';
      card.style.borderColor = range.hex + '22';
      card.innerHTML = `
        <div class="pc-top">
          <span class="pc-name">${p.name} · ${p.label}</span>
          <span class="pc-val" style="color:${range.hex}">${val.toFixed(1)}</span>
        </div>
        <div class="pc-bar"><div class="pc-fill" style="width:${pct}%;background:${range.hex}"></div></div>
        <div class="pc-idx">Sub-Index: ${subIdx} · ${range.label}</div>
      `;
      pollBody.appendChild(card);
    });

    pollHint.textContent = 'AQI ' + aqi;
    pollHint.style.color = range.hex;
  }

  /* ============================================================
     HEALTH PANEL
     ============================================================ */
  function renderHealth(aqi) {
    const range = getAQIRange(aqi);

    const advice = getHealthAdvice(aqi);
    const toggles = getToggles(aqi);

    healthBody.innerHTML = `
      <div class="health-level ${range.cls}">
        <div class="hl-label">Lung Threat Level</div>
        <div class="hl-value">${range.label}</div>
      </div>
      <div class="health-advisory ${range.cls}">${advice}</div>
      <div class="health-toggles">${toggles}</div>
      <div class="health-alert ${aqi >= 200 ? 'active' : ''}">
        <div class="ha-icon">⚠️</div>
        <div class="ha-text">${aqi >= 300 ? '[HEALTH WARNING: AIR TOXICITY THRESHOLDS BREACHED. RESPIRATORY FAILURE RISK HIGH. TERMINATE OUTDOOR EXPOSURE]' :
          aqi >= 200 ? '[CRITICAL: PROLONGED EXPOSURE DANGEROUS. ALL NON-ESSENTIAL OUTDOOR ACTIVITIES SUSPENDED]' :
          aqi >= 150 ? '[WARNING: REDUCE PROLONGED OUTDOOR EXERTION. SENSITIVE GROUPS AVOID OUTDOORS]' : ''}</div>
      </div>
    `;

    healthHint.textContent = range.label;
    healthHint.style.color = range.hex;
  }

  function getHealthAdvice(aqi) {
    if (aqi <= 50) return 'Air quality poses little or no risk. Normal outdoor activities recommended. Ventilation optimal.';
    if (aqi <= 100) return 'Acceptable air quality. Unusually sensitive individuals should consider limiting prolonged outdoor exertion.';
    if (aqi <= 150) return 'Members of sensitive groups may experience health effects. General public less likely affected. Reduce outdoor activity duration.';
    if (aqi <= 200) return 'Everyone may begin to experience health effects. Sensitive groups may experience more serious effects. Minimize outdoor activities.';
    if (aqi <= 300) return 'Health alert: everyone may experience more serious health effects. Avoid all outdoor physical activity. Keep windows sealed.';
    return 'Health warnings of emergency conditions. Population at very high risk of respiratory distress. Remain indoors with air filtration active.';
  }

  function getToggles(aqi) {
    const wearMask = aqi > 100;
    const limitOutdoor = aqi > 50;
    const usePurifier = aqi > 100;
    const closeWindows = aqi > 150;

    return `
      <div class="health-tog ${wearMask ? '' : 'active'}">
        <span class="tog-dot ${wearMask ? 'red' : 'green'}"></span>
        Wear Respiratory Mask: ${wearMask ? 'RECOMMENDED' : 'NOT REQUIRED'}
      </div>
      <div class="health-tog ${limitOutdoor ? '' : 'active'}">
        <span class="tog-dot ${limitOutdoor ? (aqi > 150 ? 'red' : 'amber') : 'green'}"></span>
        Limit Outdoor Training: ${limitOutdoor ? 'ADVISED' : 'SAFE'}
      </div>
      <div class="health-tog ${usePurifier ? '' : 'active'}">
        <span class="tog-dot ${usePurifier ? 'red' : 'green'}"></span>
        Air Purifier: ${usePurifier ? 'RECOMMENDED' : 'NOT NEEDED'}
      </div>
      <div class="health-tog ${closeWindows ? '' : 'active'}">
        <span class="tog-dot ${closeWindows ? 'red' : 'green'}"></span>
        Seal Windows: ${closeWindows ? 'MANDATORY' : 'OPEN SAFE'}
      </div>
    `;
  }

  /* ============================================================
     CANVAS PARTICLE SMOG SIMULATOR
     ============================================================ */
  let particles = [];
  const MAX_PARTICLES = 260;
  let targetParticleCount = 60;
  let windOffset = 0;

  function sizeCanvas() {
    const wrap = canvas.parentElement;
    const w = Math.min(wrap.clientWidth - 4, 700);
    const h = Math.max(160, Math.round(w * 0.35));
    canvas.width = w;
    canvas.height = h;
    return { w, h };
  }

  function updateParticleDensity(aqi) {
    if (aqi <= 50) targetParticleCount = 30;
    else if (aqi <= 100) targetParticleCount = 60;
    else if (aqi <= 150) targetParticleCount = 110;
    else if (aqi <= 200) targetParticleCount = 170;
    else if (aqi <= 300) targetParticleCount = 220;
    else targetParticleCount = MAX_PARTICLES;
  }

  function spawnParticle(w, h, aqi) {
    const range = getAQIRange(aqi);
    const baseSize = 1 + Math.random() * 5;
    const sizeMult = aqi > 150 ? 2.5 : aqi > 100 ? 1.8 : 1;
    const alpha = (aqi > 200 ? 0.15 + Math.random() * 0.35 :
                   aqi > 100 ? 0.08 + Math.random() * 0.2 :
                   0.03 + Math.random() * 0.1);

    // Color shifts from light gray to dark brown/black based on AQI
    const gray = Math.round(40 + (1 - Math.min(aqi / 500, 1)) * 160);
    const r = Math.round(gray * (0.7 + Math.random() * 0.3));
    const g = Math.round(gray * (0.6 + Math.random() * 0.3));
    const b = Math.round(gray * (0.5 + Math.random() * 0.3));

    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.1,
      size: baseSize * sizeMult,
      alpha: alpha,
      color: `rgb(${r},${g},${b})`,
      layer: Math.random() // 0-1, affects draw order
    };
  }

  function drawParticles(time) {
    const { w, h } = sizeCanvas();
    const aqi = state.aqi;
    const range = getAQIRange(aqi);
    const windFactor = state.wind / 40;

    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
    bg.addColorStop(0, 'rgba(6,8,18,1)');
    bg.addColorStop(0.5, 'rgba(4,6,14,1)');
    bg.addColorStop(1, 'rgba(2,3,8,1)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Adjust particle count
    while (particles.length < targetParticleCount) {
      particles.push(spawnParticle(w, h, aqi));
    }
    while (particles.length > targetParticleCount) {
      particles.pop();
    }

    // Sort by layer for depth effect
    particles.sort((a, b) => a.layer - b.layer);

    // Update and draw
    windOffset = windFactor * 12;
    particles.forEach(p => {
      p.x += p.vx + windOffset * 0.15 * (0.5 + p.layer * 0.5);
      p.y += p.vy;

      // Wrap around
      if (p.x < -p.size * 2) p.x = w + p.size * 2;
      if (p.x > w + p.size * 2) p.x = -p.size * 2;
      if (p.y < -p.size * 2) p.y = h + p.size * 2;
      if (p.y > h + p.size * 2) p.y = -p.size * 2;

      // Layer-based rendering
      const layerAlpha = p.layer > 0.7 ? p.alpha * 0.6 :
                         p.layer < 0.3 ? p.alpha * 1.3 : p.alpha;

      ctx.globalAlpha = layerAlpha;
      ctx.fillStyle = p.color;

      // Draw smudge
      ctx.beginPath();
      if (p.size > 3) {
        // Larger particles = blurry smudge
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grd.addColorStop(0, `rgba(80,70,60,${layerAlpha * 0.5})`);
        grd.addColorStop(1, `rgba(80,70,60,0)`);
        ctx.fillStyle = grd;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    // AQI color overlay tint
    const tintAlpha = Math.min(aqi / 500, 1) * 0.06;
    ctx.fillStyle = range.hex;
    ctx.globalAlpha = tintAlpha;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    // Wind indicator line
    if (state.wind > 2) {
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(w - 50, h - 10);
      ctx.lineTo(w - 10, h - 10);
      ctx.stroke();

      // Arrow
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.moveTo(w - 10, h - 10);
      ctx.lineTo(w - 15, h - 6);
      ctx.lineTo(w - 15, h - 14);
      ctx.closePath();
      ctx.fill();
    }
  }

  /* ============================================================
     CITY PRESET LOAD
     ============================================================ */
  function loadCity(cityId) {
    const city = CITIES[cityId];
    state.cityId = cityId;
    state.pm25 = city.pm25;
    state.pm10 = city.pm10;
    state.no2 = city.no2;
    state.co = city.co;
    state.temp = city.temp;
    state.wind = city.wind;
    state.trafficSpiked = false;
    state.purifierActive = false;
    state.purifierProgress = 0;

    // Save baseline for purifier/purge
    state.baseline = {
      pm25: city.pm25, pm10: city.pm10,
      no2: city.no2, co: city.co,
      temp: city.temp, wind: city.wind
    };

    sliderTemp.value = city.temp;
    sliderWind.value = city.wind;
    valTemp.textContent = city.temp + '°C';
    valWind.textContent = city.wind + ' km/h';

    updateAll();
    showToast('📍 Loading atmospheric profile: ' + city.name, 2000);
  }

  /* ============================================================
     TRAFFIC SPIKE
     ============================================================ */
  function triggerTraffic() {
    if (state.trafficSpiked) {
      showToast('⚠️ Traffic inflow already at peak levels.', 1500);
      return;
    }
    state.trafficSpiked = true;
    state.pm25 *= 2.2;
    state.pm10 *= 2.0;
    state.no2 *= 2.5;
    state.co *= 1.8;

    // Spike particle count
    targetParticleCount = Math.min(MAX_PARTICLES, targetParticleCount * 2);

    updateAll();
    showToast('🚗 Peak traffic inflow spike triggered. Particulate levels surging.', 3000);
  }

  /* ============================================================
     AIR PURIFIER
     ============================================================ */
  let purifierInterval = null;

  function engagePurifier() {
    if (purifierInterval) {
      showToast('♻️ Purification system already engaged.', 1500);
      return;
    }
    state.purifierActive = true;
    showToast('🌀 Regional air purifier system online. Scrubbing atmospheric particulates...', 3000);

    const startPM25 = state.pm25, startPM10 = state.pm10;
    const startNO2 = state.no2, startCO = state.co;
    const base = state.baseline;
    let progress = 0;
    const steps = 80;

    purifierInterval = setInterval(() => {
      progress++;
      const t = Math.min(progress / steps, 1);
      const ease = 1 - Math.pow(1 - t, 1.5);

      state.pm25 = startPM25 + (base.pm25 * 0.3 - startPM25) * ease;
      state.pm10 = startPM10 + (base.pm10 * 0.3 - startPM10) * ease;
      state.no2 = startNO2 + (base.no2 * 0.3 - startNO2) * ease;
      state.co = startCO + (base.co * 0.3 - startCO) * ease;

      // Clear particles gradually
      const targetCount = Math.round(targetParticleCount * (1 - ease * 0.7));
      while (particles.length > targetCount) particles.pop();

      updateAll();

      if (progress >= steps) {
        clearInterval(purifierInterval);
        purifierInterval = null;
        state.purifierActive = false;
        state.trafficSpiked = false;
        showToast('✅ Air purification cycle complete. Pollutant levels at minimum.', 2500);
      }
    }, 50);
  }

  /* ============================================================
     PURGE
     ============================================================ */
  function purgeAll() {
    if (purifierInterval) {
      clearInterval(purifierInterval);
      purifierInterval = null;
    }
    state.trafficSpiked = false;
    state.purifierActive = false;
    state.purifierProgress = 0;

    // Restore city baseline
    const city = CITIES[state.cityId];
    state.pm25 = city.pm25;
    state.pm10 = city.pm10;
    state.no2 = city.no2;
    state.co = city.co;
    state.temp = city.temp;
    state.wind = city.wind;
    state.baseline = { pm25: city.pm25, pm10: city.pm10, no2: city.no2, co: city.co, temp: city.temp, wind: city.wind };

    sliderTemp.value = city.temp;
    sliderWind.value = city.wind;
    valTemp.textContent = city.temp + '°C';
    valWind.textContent = city.wind + ' km/h';

    particles = [];
    updateAll();
    showToast('♻️ All pollutants purged. Telemetry re-zeroed to city baseline.', 2500);
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
     EVENT BINDING
     ============================================================ */
  selectCity.addEventListener('change', () => loadCity(selectCity.value));

  sliderTemp.addEventListener('input', () => {
    state.temp = parseFloat(sliderTemp.value);
    valTemp.textContent = state.temp + '°C';
    // Temperature affects particle behavior slightly
  });

  sliderWind.addEventListener('input', () => {
    state.wind = parseFloat(sliderWind.value);
    valWind.textContent = state.wind + ' km/h';
  });

  btnTraffic.addEventListener('click', triggerTraffic);
  btnPurifier.addEventListener('click', engagePurifier);
  btnPurge.addEventListener('click', purgeAll);

  /* ============================================================
     ANIMATION LOOP
     ============================================================ */
  let animId, startTime = 0;

  function tick(time) {
    if (!startTime) startTime = time;

    drawParticles(time);
    animId = requestAnimationFrame(tick);
  }

  /* ============================================================
     RESIZE
     ============================================================ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {}, 100);
  });

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    loadCity('coastal');
    tick(0);
  }

  init();

})();
