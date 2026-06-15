(function() {
  'use strict';

  /* ─── DOM REFS ─── */
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#bottleCanvas');
  const ctx = canvas.getContext('2d');
  const inputWeight = $('#inputWeight');
  const inputExercise = $('#inputExercise');
  const inputCustom = $('#inputCustom');
  const btnCalc = $('#btnCalc');
  const btnCustom = $('#btnCustom');
  const btnLog = $('#btnLog');
  const btnRemind = $('#btnRemind');
  const btnPurge = $('#btnPurge');
  const progressVal = $('#progressVal');
  const intakeVal = $('#intakeVal');
  const targetVal = $('#targetVal');
  const bottleHint = $('#bottleHint');
  const topBadge = $('#topBadge');
  const wtBars = $('#wtBars');
  const wtText = $('#wtText');
  const toastContainer = $('#toastContainer');

  /* ─── STATE ─── */
  const STORAGE_KEY = 'hydrate-dash-v1';
  let state = loadState();
  let animId = null;
  let time = 0;
  let bubbles = [];
  let celebrationFlash = 0;
  let bottleBound = {};

  function defaultState() {
    return {
      intake: 0,
      target: 0,
      logs: [],
      reminders: true,
      week: Array(7).fill(false),
      lastDate: ''
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        const def = defaultState();
        for (const k in def) { if (s[k] === undefined) s[k] = def[k]; }
        return s;
      }
    } catch (_) {}
    return defaultState();
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  /* ─── WEEKLY ROLLOVER ─── */
  function rollWeek() {
    const today = new Date().toDateString();
    if (state.lastDate !== today) {
      state.lastDate = today;
      saveState();
    }
  }

  function markDay(didHit) {
    const today = new Date().getDate();
    const dayIdx = new Date().getDay();
    state.week[dayIdx] = didHit;
    saveState();
  }

  function renderWeek() {
    wtBars.innerHTML = '';
    let done = 0;
    for (let i = 0; i < 7; i++) {
      const bar = document.createElement('div');
      bar.className = 'wt-bar' + (state.week[i] ? ' done' : '');
      bar.innerHTML = '<div class="wt-fill"></div>';
      wtBars.appendChild(bar);
      if (state.week[i]) done++;
    }
    wtText.textContent = done + '/7 days at target';
  }

  /* ─── FORMULA ─── */
  function computeTarget(weight, exercise) {
    return Math.round(weight * 35 + (exercise / 30) * 350);
  }

  function validateInputs() {
    let ok = true;
    [inputWeight, inputExercise].forEach(el => {
      el.classList.remove('err');
      const v = parseFloat(el.value);
      if (isNaN(v) || v <= 0 || (el === inputWeight && v > 350)) {
        el.classList.add('err');
        ok = false;
      }
    });
    return ok;
  }

  function calcTarget() {
    if (!validateInputs()) {
      showToast('[ERROR] Invalid biometric parameters', '#ff1744');
      return;
    }
    const w = parseFloat(inputWeight.value);
    const e = parseFloat(inputExercise.value);
    state.target = computeTarget(w, e);
    state.intake = 0;
    state.logs = [];
    bubbles = [];
    celebrationFlash = 0;
    saveState();
    syncUI();
    showToast('[OK] Target calibrated: ' + state.target + ' mL', '#00e5ff');
  }

  /* ─── INTAKE LOG ─── */
  function logIntake(ml) {
    if (!state.target) {
      showToast('[WARN] No target set — calculate biometrics first', '#ffb800');
      return;
    }
    state.intake += ml;
    state.logs.push({ ml, ts: Date.now() });
    spawnBubblesFor(ml);
    saveState();
    syncUI();
    if (state.intake >= state.target) {
      celebrationFlash = 60;
      markDay(true);
      showToast('[METABOLIC OPTIMIZATION GOAL ACHIEVED: CELLULAR SATURATION OPTIMAL]', '#00e676');
      topBadge.textContent = 'SATURATED';
      topBadge.style.color = '#00e676';
      topBadge.style.borderColor = 'rgba(0,230,118,0.35)';
    }
  }

  /* ─── REMINDERS ─── */
  btnRemind.addEventListener('click', function() {
    state.reminders = !state.reminders;
    saveState();
    this.textContent = state.reminders
      ? '● Smart Reminders ACTIVE'
      : '○ Smart Reminders OFF';
    this.style.color = state.reminders ? '#00e676' : '#ff1744';
    this.style.borderColor = state.reminders
      ? 'rgba(0,230,118,0.35)'
      : 'rgba(255,23,68,0.35)';
    showToast('[REMINDERS] ' + (state.reminders ? 'ACTIVE' : 'DISABLED'), state.reminders ? '#00e676' : '#ff1744');
  });

  /* ─── PURGE ─── */
  function purgeAll() {
    state.intake = 0;
    state.target = 0;
    state.logs = [];
    state.week = Array(7).fill(false);
    state.reminders = true;
    state.lastDate = '';
    bubbles = [];
    celebrationFlash = 0;
    inputWeight.value = 70;
    inputExercise.value = 30;
    topBadge.textContent = 'STANDBY';
    topBadge.style.color = '#00e5ff';
    topBadge.style.borderColor = 'rgba(0,229,255,0.2)';
    btnRemind.textContent = 'Toggle Smart Hydro Reminders';
    btnRemind.style.color = '#00e676';
    btnRemind.style.borderColor = 'rgba(0,230,118,0.2)';
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    syncUI();
    showToast('[PURGE] Logging history flushed — vessel re-zeroed', '#8892a8');
  }

  /* ─── UI SYNC ─── */
  function syncUI() {
    const pct = state.target > 0 ? Math.min(100, Math.round((state.intake / state.target) * 100)) : 0;
    progressVal.textContent = pct + '%';
    intakeVal.textContent = state.intake.toLocaleString();
    targetVal.textContent = state.target > 0 ? state.target.toLocaleString() : '--';
    bottleHint.textContent = pct + '%';

    if (pct >= 100) {
      bottleHint.style.color = '#00e676';
    } else if (pct > 0) {
      bottleHint.style.color = '#00e5ff';
    } else {
      bottleHint.style.color = '#4a5268';
    }

    renderWeek();
  }

  /* ─── TOASTS ─── */
  function showToast(msg, color) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    if (color) el.style.borderLeft = '3px solid ' + color;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('leave');
      setTimeout(() => { if (el.parentNode) el.remove(); }, 250);
    }, 3500);
  }

  /* ─── CANVAS SETUP ─── */
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 320;
    const h = Math.max(260, Math.min(480, w * 1.4));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = w;
    canvas._h = h;
  }

  /* ─── BOTTLE GEOMETRY ─── */
  function getBottlePath(w, h) {
    const m = 0.12;
    const padL = w * 0.05, padR = w * 0.95, padT = h * 0.02, padB = h * 0.95;
    const bodyW = padR - padL;
    const bodyH = padB - padT;
    const neckW = bodyW * 0.35;
    const neckH = bodyH * 0.12;
    const shoulderY = padT + neckH;
    const baseY = padB;
    const cx = w / 2;

    return {
      cx, padL, padR, padT, padB,
      bodyW, bodyH, neckW, neckH, shoulderY, baseY,
      leftTopX: cx - neckW / 2,
      leftTopY: padT,
      rightTopX: cx + neckW / 2,
      rightTopY: padT,
      leftBotX: padL,
      leftBotY: baseY,
      rightBotX: padR,
      rightBotY: baseY
    };
  }

  function drawBottle(b) {
    ctx.beginPath();
    ctx.moveTo(b.leftTopX, b.leftTopY);
    ctx.lineTo(b.leftTopX, b.shoulderY);
    ctx.lineTo(b.leftBotX, b.leftBotY);
    ctx.lineTo(b.rightBotX, b.rightBotY);
    ctx.lineTo(b.rightTopX, b.shoulderY);
    ctx.lineTo(b.rightTopX, b.rightTopY);
    ctx.closePath();
    return ctx;
  }

  /* ─── BUBBLES ─── */
  function spawnBubblesFor(ml) {
    const count = Math.min(12, Math.max(3, Math.floor(ml / 80)));
    const bBox = getBottlePath(canvas._w, canvas._h);
    const cy = bBox.baseY;
    for (let i = 0; i < count; i++) {
      bubbles.push({
        x: bBox.cx + (Math.random() - 0.5) * bBox.bodyW * 0.5,
        y: cy - Math.random() * 6,
        r: 1.5 + Math.random() * 3.5,
        vy: -(0.15 + Math.random() * 0.45),
        vx: (Math.random() - 0.5) * 0.2,
        alpha: 0.15 + Math.random() * 0.25
      });
    }
    if (bubbles.length > 200) bubbles.splice(0, bubbles.length - 200);
  }

  function updateBubbles() {
    const bBox = getBottlePath(canvas._w, canvas._h);
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const p = bubbles[i];
      p.y += p.vy;
      p.x += p.vx;
      p.vy *= 0.998;
      if (p.y < bBox.shoulderY + 10 || p.x < bBox.leftBotX + 4 || p.x > bBox.rightBotX - 4) {
        bubbles.splice(i, 1);
      }
    }
    if (state.intake > 0 && Math.random() < 0.04) {
      spawnBubblesFor(20);
    }
  }

  /* ─── CANVAS RENDER ─── */
  function drawBottleShape(bBox, fillPct, time) {
    const w = canvas._w;
    const h = canvas._h;

    /* bottle outline path */
    ctx.save();

    /* clip region for water */
    ctx.beginPath();
    ctx.moveTo(bBox.leftTopX, bBox.leftTopY);
    ctx.lineTo(bBox.leftTopX, bBox.shoulderY);
    ctx.lineTo(bBox.leftBotX, bBox.leftBotY);
    ctx.lineTo(bBox.rightBotX, bBox.rightBotY);
    ctx.lineTo(bBox.rightTopX, bBox.shoulderY);
    ctx.lineTo(bBox.rightTopX, bBox.rightTopY);
    ctx.closePath();

    /* draw glass shell */
    ctx.fillStyle = 'rgba(255,255,255,0.01)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    /* water fill */
    const waterTop = bBox.baseY - (bBox.baseY - bBox.shoulderY) * fillPct;
    const freq = 0.035;
    const amp = Math.min(8, 4 + fillPct * 6);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bBox.leftBotX + 2, bBox.baseY);

    /* left wall up to water surface */
    const leftWallX = bBox.leftBotX + (bBox.leftTopX - bBox.leftBotX) * (1 - fillPct);
    ctx.lineTo(leftWallX, bBox.baseY);
    ctx.lineTo(leftWallX, waterTop);

    /* sine wave across */
    const steps = Math.floor(bBox.bodyW / 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = bBox.leftBotX + t * bBox.bodyW;
      const y = waterTop + Math.sin(x * freq + time * 0.03) * amp
                          + Math.sin(x * freq * 2.3 + time * 0.05) * amp * 0.35;
      ctx.lineTo(x, y);
    }

    /* right wall down */
    const rightWallX = bBox.rightBotX - (bBox.rightBotX - bBox.rightTopX) * (1 - fillPct);
    ctx.lineTo(rightWallX, waterTop);
    ctx.lineTo(rightWallX, bBox.baseY);

    ctx.closePath();

    /* gradient fill */
    const grad = ctx.createLinearGradient(0, waterTop, 0, bBox.baseY);
    const bright = Math.min(1, 0.35 + fillPct * 0.3);
    const r = Math.round(0 * bright);
    const g = Math.round(229 * bright);
    const bl = Math.round(255 * bright);
    grad.addColorStop(0, `rgba(${r},${g},${bl},0.25)`);
    grad.addColorStop(0.3, `rgba(${r},${g},${bl},0.35)`);
    grad.addColorStop(1, `rgba(${r},${g},${bl},0.12)`);
    ctx.fillStyle = grad;
    ctx.fill();

    /* inner shine stripe */
    ctx.beginPath();
    const shX = bBox.leftBotX + bBox.bodyW * 0.2;
    ctx.moveTo(shX, waterTop + 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = bBox.leftBotX + t * bBox.bodyW;
      const y = waterTop + Math.sin(x * freq + time * 0.03) * amp + Math.sin(x * freq * 2.3 + time * 0.05) * amp * 0.35;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();

    /* exterior glass highlight */
    ctx.beginPath();
    ctx.moveTo(bBox.leftTopX, bBox.leftTopY);
    ctx.lineTo(bBox.leftTopX, bBox.shoulderY);
    ctx.lineTo(bBox.leftBotX, bBox.leftBotY);
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    /* glass reflection band */
    ctx.beginPath();
    const rfx = bBox.cx - bBox.neckW * 0.4;
    ctx.moveTo(rfx, bBox.shoulderY);
    ctx.lineTo(rfx + 10, bBox.shoulderY + 6);
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  function drawBubbles() {
    const bBox = getBottlePath(canvas._w, canvas._h);
    for (const p of bubbles) {
      const cx = p.x;
      const cy = p.y;
      const grad = ctx.createRadialGradient(cx - p.r * 0.3, cy - p.r * 0.3, 0, cx, cy, p.r);
      grad.addColorStop(0, `rgba(255,255,255,${p.alpha * 0.6})`);
      grad.addColorStop(0.6, `rgba(0,229,255,${p.alpha * 0.2})`);
      grad.addColorStop(1, `rgba(0,229,255,0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  function drawCelebrationGlow(bBox, flash) {
    if (flash <= 0) return;
    const intensity = Math.sin(flash * 0.3) * 0.5 + 0.5;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bBox.leftTopX, bBox.leftTopY);
    ctx.lineTo(bBox.leftTopX, bBox.shoulderY);
    ctx.lineTo(bBox.leftBotX, bBox.leftBotY);
    ctx.lineTo(bBox.rightBotX, bBox.rightBotY);
    ctx.lineTo(bBox.rightTopX, bBox.shoulderY);
    ctx.lineTo(bBox.rightTopX, bBox.rightTopY);
    ctx.closePath();
    ctx.shadowColor = '#00e676';
    ctx.shadowBlur = 20 * intensity;
    ctx.strokeStyle = `rgba(0,230,118,${0.2 * intensity})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawHUD(w, h, pct, intake, target) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.font = '5.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(intake.toLocaleString() + ' / ' + (target || '--') + ' mL', w - 4, h - 4);
    ctx.restore();
  }

  /* ─── ANIM LOOP ─── */
  function animate() {
    const w = canvas._w;
    const h = canvas._h;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, w, h);

    const fillPct = state.target > 0 ? Math.min(1, state.intake / state.target) : 0;
    const bBox = getBottlePath(w, h);
    bottleBound = bBox;

    time++;

    drawBottleShape(bBox, fillPct, time);
    updateBubbles();
    drawBubbles();
    drawCelebrationGlow(bBox, celebrationFlash);
    drawHUD(w, h, fillPct, state.intake, state.target);

    if (celebrationFlash > 0) celebrationFlash--;

    animId = requestAnimationFrame(animate);
  }

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
    });

    /* pre-spawn idle bubbles */
    for (let i = 0; i < 8; i++) {
      const bBox = getBottlePath(canvas._w, canvas._h);
      bubbles.push({
        x: bBox.cx + (Math.random() - 0.5) * bBox.bodyW * 0.3,
        y: bBox.baseY - Math.random() * bBox.bodyH * 0.4,
        r: 1 + Math.random() * 2.5,
        vy: -(0.1 + Math.random() * 0.2),
        vx: (Math.random() - 0.5) * 0.15,
        alpha: 0.08 + Math.random() * 0.12
      });
    }

    btnCalc.addEventListener('click', calcTarget);

    $$('.log-chip[data-ml]').forEach(el => {
      el.addEventListener('click', function() {
        const ml = parseInt(this.dataset.ml, 10);
        logIntake(ml);
      });
    });

    btnCustom.addEventListener('click', function() {
      const ml = parseInt(inputCustom.value, 10);
      if (isNaN(ml) || ml <= 0 || ml > 2000) {
        inputCustom.classList.add('err');
        setTimeout(() => inputCustom.classList.remove('err'), 400);
        showToast('[WARN] Invalid custom volume (1–2000 mL)', '#ffb800');
        return;
      }
      inputCustom.classList.remove('err');
      logIntake(ml);
    });

    btnPurge.addEventListener('click', purgeAll);

    /* Enter key triggers calculate */
    [inputWeight, inputExercise].forEach(el => {
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') btnCalc.click();
      });
    });

    inputCustom.addEventListener('keydown', e => {
      if (e.key === 'Enter') btnCustom.click();
    });

    if (state.target === 0 && state.logs.length === 0) {
      btnCalc.click();
    } else {
      syncUI();
      rollWeek();
      renderWeek();
    }

    btnRemind.textContent = state.reminders
      ? '● Smart Reminders ACTIVE'
      : '○ Smart Reminders OFF';
    btnRemind.style.color = state.reminders ? '#00e676' : '#ff1744';
    btnRemind.style.borderColor = state.reminders
      ? 'rgba(0,230,118,0.35)'
      : 'rgba(255,23,68,0.35)';

    if (state.intake >= state.target && state.target > 0) {
      topBadge.textContent = 'SATURATED';
      topBadge.style.color = '#00e676';
      topBadge.style.borderColor = 'rgba(0,230,118,0.35)';
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
