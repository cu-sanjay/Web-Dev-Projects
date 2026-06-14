(function () {
  'use strict';

  /* ============================================================
     DISASTER PROFILES
     ============================================================ */
  const DISASTERS = {
    earthquake: {
      name: 'Seismic Earthquake Fault',
      weights: { rations: 20, sandbags: 15, shutters: 10, valves: 30, horns: 25 },
      totalWeight: 100,
      dilemmas: [
        { scenario: 'A 6.2 magnitude tremor just struck. You are indoors. Do you:', a: 'Stand in a doorway frame', b: 'Drop, cover, and hold under a sturdy table', correct: 1 },
        { scenario: 'You smell gas after the shaking subsides. Do you:', a: 'Light a match to check for leaks', b: 'Shut off the gas main valve and evacuate', correct: 1 },
        { scenario: 'Aftershocks are expected within the hour. Do you:', a: 'Return inside to secure valuables', b: 'Stay in the open evacuation zone', correct: 1 }
      ]
    },
    flood: {
      name: 'Flash Hydro-Flood',
      weights: { rations: 25, sandbags: 35, shutters: 10, valves: 10, horns: 20 },
      totalWeight: 100,
      dilemmas: [
        { scenario: 'Water is rising rapidly near your home. Do you:', a: 'Attempt to drive through flooded streets', b: 'Move to higher ground immediately', correct: 1 },
        { scenario: 'You have sandbags and rising water. Do you:', a: 'Stack them around doorways and vents', b: 'Place them randomly in the yard', correct: 0 },
        { scenario: 'Floodwaters have entered your ground floor. Do you:', a: 'Stay on the ground floor to pump water', b: 'Move to the upper floor with supplies', correct: 1 }
      ]
    },
    cyclone: {
      name: 'Category-5 Cyclone Vortex',
      weights: { rations: 20, sandbags: 25, shutters: 30, valves: 10, horns: 15 },
      totalWeight: 100,
      dilemmas: [
        { scenario: 'A cyclone warning is issued 12 hours out. Do you:', a: 'Board up windows and secure loose objects', b: 'Wait and see if the path changes', correct: 0 },
        { scenario: 'The eye of the cyclone is passing overhead. Do you:', a: 'Step outside during the calm', b: 'Stay sheltered — the eyewall will return', correct: 1 },
        { scenario: 'Power lines are down after landfall. Do you:', a: 'Use a generator indoors to stay cool', b: 'Keep generator outside, ventilated, and report lines', correct: 1 }
      ]
    }
  };

  const STORAGE_KEY = 'disasterTrainer';

  /* ============================================================
     STATE
     ============================================================ */
  let state = {
    crisis: 'earthquake',
    resources: {},  // { key: true/false }
    running: false,
    structIntegrity: 100,
    evacuated: 0,
    prepScore: 0,
    dilemmaIdx: 0,
    dilemmaAnswered: false,
    crisisTime: 0,
    completedCrises: JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  };

  /* ============================================================
     DOM REFS
     ============================================================ */
  const $ = id => document.getElementById(id);
  const canvas = $('crisisCanvas'), ctx = canvas.getContext('2d');
  const prepVal = $('prepVal'), structVal = $('structVal'), evacVal = $('evacVal');
  const chipPrep = $('chipPrep'), chipStruct = $('chipStruct'), chipEvac = $('chipEvac');
  const prepScore = $('prepScore'), statusBody = $('statusBody');
  const vizHint = $('vizHint'), ribbonHint = $('ribbonHint'), topBadge = $('topBadge');
  const dilemmaIdle = $('dilemmaIdle'), dilemmaCard = $('dilemmaCard');
  const dlScenario = $('dlScenario'), dlChoices = $('dlChoices'), dlFeedback = $('dlFeedback');
  const toastContainer = $('toastContainer');
  const btnEvaluate = $('btnEvaluate'), btnAid = $('btnAid'), btnPurge = $('btnPurge');

  // Resource checkboxes + pts displays
  const RES_KEYS = ['rations', 'sandbags', 'shutters', 'valves', 'horns'];
  const chk = {}, pts = {};
  RES_KEYS.forEach(k => { chk[k] = $(`chk${k[0].toUpperCase()}${k.slice(1)}`); pts[k] = $(`pts${k[0].toUpperCase()}${k.slice(1)}`); });

  /* ============================================================
     PREPAREDNESS INDEX
     Sp = Σ wi × Ii
     ============================================================ */
  function calcPreparedness() {
    const profile = DISASTERS[state.crisis];
    let total = 0;
    RES_KEYS.forEach(k => {
      if (chk[k].checked) total += profile.weights[k];
    });
    const pct = Math.round((total / profile.totalWeight) * 100);
    state.prepScore = pct;

    // Show per-item points
    RES_KEYS.forEach(k => {
      pts[k].textContent = '+' + profile.weights[k];
      pts[k].className = 'res-pts' + (chk[k].checked ? ' active' : '');
    });

    return pct;
  }

  /* ============================================================
     CANVAS
     ============================================================ */
  function sizeCanvas() {
    const wrap = canvas.parentElement;
    const w = Math.min(wrap.clientWidth - 4, 700);
    const h = Math.max(200, Math.round(w * 0.35));
    canvas.width = w; canvas.height = h;
    return { w, h };
  }

  let debris = [];

  function drawCrisis(time) {
    const { w, h } = sizeCanvas();
    ctx.clearRect(0, 0, w, h);

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#060812'); bg.addColorStop(0.5, '#080b16'); bg.addColorStop(1, '#0a0f12');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    const crisis = state.crisis;
    const running = state.running;
    const intensity = running ? Math.min(1, state.crisisTime / 5000) : 0;
    const structPct = state.structIntegrity / 100;

    // Ground line
    const groundY = h * 0.72;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();

    if (crisis === 'earthquake') {
      drawEarthquake(w, h, time, intensity, structPct, groundY);
    } else if (crisis === 'flood') {
      drawFlood(w, h, time, intensity, structPct, groundY);
    } else if (crisis === 'cyclone') {
      drawCyclone(w, h, time, intensity, structPct, groundY);
    }

    // Status overlay
    if (running) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillText('T+' + (state.crisisTime / 1000).toFixed(1) + 's', w - 8, 4);
    }
  }

  /* ============================================================
     EARTHQUAKE CANVAS
     ============================================================ */
  function drawEarthquake(w, h, time, intensity, structPct, gy) {
    const shakeX = Math.sin(time / 30) * intensity * (1 + (1 - structPct) * 2) * 12;
    const shakeY = Math.sin(time / 50) * intensity * 3;

    // Building grid
    ctx.save();
    ctx.translate(shakeX, shakeY);

    const bldgX = w * 0.3, bldgW = w * 0.4, bldgH = h * 0.4;
    const bldgY = gy - bldgH;

    // Building body
    const healthColor = structPct > 0.5 ? '#1a2c36' : `rgb(${Math.round(50 + (1 - structPct) * 200)},30,30)`;
    ctx.fillStyle = healthColor;
    ctx.shadowColor = structPct < 0.5 ? 'rgba(255,23,68,0.3)' : 'transparent';
    ctx.shadowBlur = structPct < 0.5 ? 10 : 0;
    ctx.fillRect(bldgX, bldgY, bldgW, bldgH);
    ctx.shadowBlur = 0;

    // Windows (cracked based on struct)
    ctx.fillStyle = `rgba(0,229,255,${0.06 * (1 - intensity * 0.5)})`;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const wx = bldgX + 8 + col * (bldgW - 16) / 4;
        const wy = bldgY + 10 + row * (bldgH - 20) / 4;
        const ww = (bldgW - 16) / 4 - 4;
        const wh = (bldgH - 20) / 4 - 4;
        if (structPct < 0.7 && Math.random() < (1 - structPct) * 0.3) {
          ctx.fillStyle = `rgba(255,23,68,${0.1 + 0.2 * (1 - structPct)})`;
        }
        ctx.fillRect(wx, wy, ww, wh);
      }
    }
    ctx.restore();

    // Debris particles
    if (intensity > 0.3) {
      const debrisCount = Math.floor(intensity * structPct * 30);
      while (debris.length < debrisCount) {
        debris.push({
          x: Math.random() * w, y: gy + Math.random() * 10,
          vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2 - 1,
          size: 2 + Math.random() * 4, life: 1
        });
      }
      while (debris.length > debrisCount) debris.pop();

      debris.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.05;
        d.life -= 0.003;
        if (d.y > gy || d.life <= 0) { d.x = Math.random() * w; d.y = gy - Math.random() * 20; d.life = 1; d.vy = -Math.random() * 2 - 1; }
        ctx.fillStyle = `rgba(180,160,140,${d.life * 0.5})`;
        ctx.fillRect(d.x, d.y, d.size, d.size);
      });
    }
  }

  /* ============================================================
     FLOOD CANVAS
     ============================================================ */
  function drawFlood(w, h, time, intensity, structPct, gy) {
    // Buildings on stilts
    for (let i = 0; i < 4; i++) {
      const bx = 0.1 * w + i * 0.25 * w;
      const bh = h * 0.25;
      const by = gy - bh;
      ctx.fillStyle = '#1a2c36';
      ctx.fillRect(bx, by, w * 0.1, bh);
    }

    // Rising water
    const waterLevel = gy - (gy - h * 0.15) * intensity;
    if (waterLevel < gy) {
      const waterGrad = ctx.createLinearGradient(0, waterLevel, 0, h);
      waterGrad.addColorStop(0, `rgba(0,30,60,${0.5 + 0.3 * intensity})`);
      waterGrad.addColorStop(0.5, `rgba(0,20,50,${0.7 + 0.3 * intensity})`);
      waterGrad.addColorStop(1, `rgba(0,10,30,${0.9})`);
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, waterLevel, w, h - waterLevel);

      // Wave line
      ctx.strokeStyle = `rgba(0,229,255,${0.1 + 0.1 * intensity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const wy = waterLevel + Math.sin(x / 30 + time / 800) * 3 * intensity;
        x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
      }
      ctx.stroke();

      // Floating debris
      const count = Math.floor(intensity * 15);
      for (let i = 0; i < count; i++) {
        const dx = (i * 73 + time * 0.02) % w;
        const dy = waterLevel + 10 + (i * 17) % (h - waterLevel - 20);
        ctx.fillStyle = 'rgba(100,80,60,0.3)';
        const dw = 3 + (i % 4);
        ctx.fillRect(dx, dy, dw, 2);
      }
    }

    // Watermark labels
    if (intensity > 0.3) {
      ctx.fillStyle = 'rgba(0,229,255,0.08)';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      const markH = Math.round(intensity * 500);
      ctx.fillText('⏎ ' + markH + 'cm', 8, gy - 4);
    }
  }

  /* ============================================================
     CYCLONE CANVAS
     ============================================================ */
  function drawCyclone(w, h, time, intensity, structPct, gy) {
    const cx = w / 2, cy = h / 2.5;

    // Spiral wind trails
    for (let ring = 0; ring < 8; ring++) {
      const r = 15 + ring * (12 + 8 * intensity);
      const alpha = 0.03 + 0.04 * intensity * (1 - ring / 8);
      ctx.strokeStyle = `rgba(200,200,220,${alpha})`;
      ctx.lineWidth = 1 + ring * 0.3 * intensity;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 6; a += 0.05) {
        const rr = r + a * 2 * intensity;
        const x = cx + Math.cos(a + time / 1000 + ring) * rr;
        const y = cy + Math.sin(a * 1.3 + time / 1000 + ring) * rr * 0.5;
        a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Eye
    ctx.fillStyle = `rgba(0,229,255,${0.05 + 0.05 * intensity})`;
    ctx.beginPath(); ctx.arc(cx, cy, 8 * (1 + intensity), 0, Math.PI * 2); ctx.fill();

    // Flying debris
    const debrisCount = Math.floor(intensity * 40);
    while (debris.length < debrisCount) {
      const angle = Math.random() * Math.PI * 2;
      const rad = 20 + Math.random() * 80 * intensity;
      debris.push({
        angle, rad,
        size: 2 + Math.random() * 5,
        speed: 0.002 + Math.random() * 0.003,
        rot: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2
      });
    }
    while (debris.length > debrisCount) debris.pop();

    debris.forEach(d => {
      d.angle += d.speed * intensity;
      d.rot += 0.03;
      const r = d.rad * (1 + 0.2 * Math.sin(time / 2000 + d.phase));
      const dx = cx + Math.cos(d.angle) * r;
      const dy = cy + Math.sin(d.angle * 0.7) * r * 0.4;
      ctx.fillStyle = `rgba(160,140,120,${0.2 + 0.3 * intensity})`;
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(d.rot);
      ctx.fillRect(-d.size / 2, -d.size / 4, d.size, d.size / 2);
      ctx.restore();
    });
  }

  /* ============================================================
     DILEMMA SYSTEM
     ============================================================ */
  function loadDilemma() {
    const profile = DISASTERS[state.crisis];
    if (state.dilemmaIdx >= profile.dilemmas.length) {
      dilemmaCard.classList.add('hidden');
      dilemmaIdle.classList.remove('hidden');
      return;
    }
    const d = profile.dilemmas[state.dilemmaIdx];
    dilemmaIdle.classList.add('hidden');
    dilemmaCard.classList.remove('hidden');
    dlFeedback.classList.add('hidden');

    dlScenario.textContent = d.scenario;
    dlChoices.innerHTML = '';
    const labels = ['A', 'B'];
    [d.a, d.b].forEach((txt, i) => {
      const el = document.createElement('button');
      el.className = 'dl-choice';
      el.textContent = labels[i] + '. ' + txt;
      el.dataset.idx = i;
      el.addEventListener('click', () => answerDilemma(i));
      dlChoices.appendChild(el);
    });
  }

  function answerDilemma(idx) {
    if (state.dilemmaAnswered) return;
    const profile = DISASTERS[state.crisis];
    const d = profile.dilemmas[state.dilemmaIdx];
    const correct = idx === d.correct;

    state.dilemmaAnswered = true;

    // Mark choices
    const choices = dlChoices.querySelectorAll('.dl-choice');
    choices.forEach((el, i) => {
      el.classList.add('disabled');
      if (i === d.correct) el.classList.add('correct');
      if (i === idx && !correct) el.classList.add('wrong');
      if (i === idx && correct) el.classList.add('selected');
    });

    // Feedback
    dlFeedback.className = 'dl-feedback ' + (correct ? 'correct' : 'wrong');
    dlFeedback.textContent = correct ? '✓ Correct decision.' : '✗ Review best practices for this scenario.';
    dlFeedback.classList.remove('hidden');

    // Evacuation count bonus
    if (correct) state.evacuated += Math.floor(Math.random() * 50 + 20);
    else state.evacuated += Math.floor(Math.random() * 10 + 5);

    // Auto-advance
    setTimeout(() => {
      state.dilemmaIdx++;
      state.dilemmaAnswered = false;
      loadDilemma();
      updateStatus();
    }, 2000);
  }

  /* ============================================================
     STATUS UPDATE
     ============================================================ */
  function updateStatus() {
    const prep = calcPreparedness();
    const spp = state.running ? prep : 0;

    // Structural integrity drain
    if (state.running) {
      const drain = (100 - spp) * 0.002 * (1 + (state.crisisTime / 10000));
      state.structIntegrity = Math.max(0, state.structIntegrity - drain);
      state.crisisTime += 50;
    }

    const struct = Math.round(state.structIntegrity);
    const evac = state.evacuated;
    const threat = getThreatLevel(struct, prep);

    prepVal.textContent = prep + '%';
    prepVal.style.color = prep >= 70 ? '#00e676' : prep >= 40 ? '#ffb800' : '#ff1744';
    chipPrep.style.borderColor = prep >= 70 ? 'rgba(0,230,118,0.3)' : prep >= 40 ? 'rgba(255,184,0,0.3)' : 'rgba(255,23,68,0.3)';

    structVal.textContent = struct + '%';
    structVal.style.color = struct > 60 ? '#00e676' : struct > 30 ? '#ffb800' : '#ff1744';
    chipStruct.style.borderColor = struct > 60 ? 'rgba(0,230,118,0.3)' : struct > 30 ? 'rgba(255,184,0,0.3)' : 'rgba(255,23,68,0.3)';

    evacVal.textContent = evac;
    chipEvac.style.borderColor = evac > 100 ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.05)';

    prepScore.textContent = prep + '%';
    prepScore.style.color = prep >= 70 ? '#00e676' : prep >= 40 ? '#ffb800' : '#ff1744';

    // Badges
    topBadge.textContent = threat.label;
    topBadge.style.color = threat.color;
    topBadge.style.borderColor = threat.color + '33';

    ribbonHint.textContent = threat.label;
    ribbonHint.style.color = threat.color;

    vizHint.textContent = state.running ? 'T+' + (state.crisisTime / 1000).toFixed(1) + 's' : 'READY';
    vizHint.style.color = threat.color;

    // Status cards
    statusBody.innerHTML = `
      <div class="st-card" style="border-color:${threat.color}33">
        <div class="st-lbl">Preparedness Index</div>
        <div class="st-val" style="color:${prep >= 70 ? '#00e676' : prep >= 40 ? '#ffb800' : '#ff1744'}">${prep}%</div>
      </div>
      <div class="st-card" style="border-color:${threat.color}33">
        <div class="st-lbl">Structural Integrity</div>
        <div class="st-val" style="color:${struct > 60 ? '#00e676' : struct > 30 ? '#ffb800' : '#ff1744'}">${struct}%</div>
        <div class="st-sub">${struct > 60 ? 'STABLE' : struct > 30 ? 'DEGRADING' : 'CRITICAL'}</div>
      </div>
      <div class="st-card" style="border-color:${threat.color}33">
        <div class="st-lbl">Evacuated Population</div>
        <div class="st-val" style="color:#00e5ff">${evac}</div>
        <div class="st-sub">${evac > 150 ? 'TARGET MET' : 'IN PROGRESS'}</div>
      </div>
      <div class="st-card urgency" style="border-color:${threat.color}33">
        <div class="st-lbl">Threat Urgency</div>
        <div class="st-val" style="color:${threat.color};font-size:11px">${threat.label}</div>
      </div>
    `;

    // Collapse check
    if (struct <= 0 && state.running) {
      state.running = false;
      const completed = state.completedCrises[state.crisis] || [];
      if (!completed.includes(prep)) {
        completed.push(prep);
        state.completedCrises[state.crisis] = completed;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.completedCrises));
      }
      showToast('💀 CATASTROPHIC COLLAPSE — Structural integrity reached 0%. Simulation halted. Survival report archived.', 5000);
    }
  }

  function getThreatLevel(struct, prep) {
    if (struct <= 0) return { label: '⚠ CATASTROPHIC COLLAPSE', color: '#ff1744' };
    if (struct < 30) return { label: '⚠ CRITICAL DAMAGE', color: '#ff1744' };
    if (struct < 60) return { label: '⏳ STRUCTURAL DISTRESS', color: '#ff6d00' };
    if (state.running) return { label: '🔄 CRISIS EVALUATING', color: '#ffb800' };
    return { label: '✅ STANDBY — READY', color: '#00e676' };
  }

  /* ============================================================
     ACTIONS
     ============================================================ */
  function commenceEvaluation() {
    if (state.running) { showToast('⚠️ Evaluation already in progress.', 1500); return; }
    const prep = calcPreparedness();
    if (prep < 30) { showToast('⚠️ Preparedness too low. Deploy more resources before evaluation.', 2000); return; }

    state.running = true;
    state.structIntegrity = 100;
    state.evacuated = 0;
    state.crisisTime = 0;
    state.dilemmaIdx = 0;
    state.dilemmaAnswered = false;
    debris = [];

    loadDilemma();
    showToast('🔴 Crisis evaluation commenced. Monitoring structural integrity.', 2500);
  }

  function deployAid() {
    if (!state.running) { showToast('⚠️ No active crisis to deploy aid. Start evaluation first.', 1500); return; }
    // Boost structural integrity
    state.structIntegrity = Math.min(100, state.structIntegrity + 20);
    state.evacuated += Math.floor(Math.random() * 30 + 10);
    showToast('🚑 Emergency aid deployed. Structural integrity boosted +20%.', 2500);
  }

  function purgeAll() {
    state.running = false;
    state.crisis = 'earthquake';
    state.structIntegrity = 100;
    state.evacuated = 0;
    state.prepScore = 0;
    state.crisisTime = 0;
    state.dilemmaIdx = 0;
    state.dilemmaAnswered = false;
    debris = [];

    // Uncheck all
    RES_KEYS.forEach(k => { chk[k].checked = false; });

    // Reset crisis button active states
    document.querySelectorAll('.crisis-btn').forEach(b => b.classList.toggle('active', b.dataset.crisis === 'earthquake'));

    dilemmaCard.classList.add('hidden');
    dilemmaIdle.classList.remove('hidden');

    updateStatus();
    showToast('♻️ Workspace purged. All arrays cleared. Baseline restored.', 2500);
  }

  /* ============================================================
     CRISIS SWITCH
     ============================================================ */
  function switchCrisis(id) {
    if (state.running) { showToast('⚠️ Cannot switch crisis during active evaluation. Purge first.', 2000); return; }
    state.crisis = id;
    state.dilemmaIdx = 0;
    state.dilemmaAnswered = false;
    debris = [];

    document.querySelectorAll('.crisis-btn').forEach(b => b.classList.toggle('active', b.dataset.crisis === id));
    dilemmaCard.classList.add('hidden');
    dilemmaIdle.classList.remove('hidden');

    calcPreparedness();
    updateStatus();
    showToast('🔄 Switched to ' + DISASTERS[id].name, 2000);
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
  let animId;

  function tick(time) {
    drawCrisis(time);
    if (state.running) updateStatus();
    animId = requestAnimationFrame(tick);
  }

  /* ============================================================
     EVENT BINDING
     ============================================================ */
  RES_KEYS.forEach(k => {
    chk[k].addEventListener('change', () => {
      calcPreparedness();
      updateStatus();
    });
  });

  document.querySelectorAll('.crisis-btn').forEach(b => {
    b.addEventListener('click', () => switchCrisis(b.dataset.crisis));
  });

  btnEvaluate.addEventListener('click', commenceEvaluation);
  btnAid.addEventListener('click', deployAid);
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
    calcPreparedness();
    updateStatus();
    showToast('🛡️ Disaster Preparedness Trainer initialized. Select crisis mode and deploy resources.', 3500);
    tick(0);
  }

  init();

})();
