(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#ecoCanvas');
  const ctx = canvas.getContext('2d');
  const checklistBody = $('#checklistBody');
  const todayLabel = $('#todayLabel');
  const tStreak = $('#tStreak');
  const tPlastic = $('#tPlastic');
  const tWater = $('#tWater');
  const tCO2 = $('#tCO2');
  const tPoints = $('#tPoints');
  const tBadge = $('#tBadge');
  const btnCompute = $('#btnCompute');
  const btnStreak = $('#btnStreak');
  const btnPurge = $('#btnPurge');
  const quickBtns = $$('.quick-btn');
  const telePanel = $('.telemetry-panel');

  const STORAGE_KEY = 'eco-habit-tracker-v1';

  /* ─── HABIT DEFINITIONS ─── */
  const HABITS = [
    { id:'recycle', label:'WASTE RECYCLING', pts:15, plastic:0.5, water:0, co2:0, color:'#ffc800' },
    { id:'water', label:'WATER CONSERVATION', pts:10, plastic:0, water:40, co2:0, color:'#00e5ff' },
    { id:'carbon', label:'CARBON MITIGATION', pts:25, plastic:0, water:0, co2:1.2, color:'#00e676' },
    { id:'reuse', label:'REUSABLE CONTAINERS', pts:12, plastic:0.3, water:0, co2:0.1, color:'#b388ff' }
  ];

  const QUICK_MAP = {
    recycle: 'recycle',
    water: 'water',
    carbon: 'carbon',
    reuse: 'reuse'
  };

  /* ─── STATE ─── */
  let logs = [];
  let streak = { count: 0, lastDate: '' };
  let totals = { plastic: 0, water: 0, co2: 0, points: 0 };

  /* ─── CANVAS ─── */
  let cw = 0, ch = 0;

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 400;
    const h = wrap.clientHeight || 220;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    cw = w;
    ch = h;
  }

  /* ─── STORAGE ─── */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        logs = s.logs || [];
        streak = s.streak || { count: 0, lastDate: '' };
      }
    } catch(_) {}
  }
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ logs, streak }));
    } catch(_) {}
  }

  /* ─── COMPUTE TOTALS ─── */
  function computeTotals() {
    totals = { plastic: 0, water: 0, co2: 0, points: 0 };
    logs.forEach(entry => {
      const h = HABITS.find(x => x.id === entry.habitId);
      if (h) {
        totals.plastic += h.plastic;
        totals.water += h.water;
        totals.co2 += h.co2;
        totals.points += h.pts;
      }
    });
    totals.plastic = Math.round(totals.plastic * 100) / 100;
    totals.water = Math.round(totals.water * 100) / 100;
    totals.co2 = Math.round(totals.co2 * 100) / 100;
  }

  /* ─── STREAK ─── */
  function updateStreak() {
    if (logs.length === 0) { streak = { count: 0, lastDate: '' }; return; }
    const dates = [...new Set(logs.map(l => l.date))].sort();
    const today = new Date().toISOString().slice(0, 10);
    if (dates.length === 0) { streak = { count: 0, lastDate: '' }; return; }

    let count = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const prev = new Date(dates[i-1]);
      const cur = new Date(dates[i]);
      const diff = (cur - prev) / 86400000;
      if (diff === 1) count++;
      else if (diff > 1) { count = 1; break; }
    }
    /* only count streak if active today or yesterday */
    const last = new Date(dates[dates.length-1]);
    const now = new Date(today);
    const gap = (now - last) / 86400000;
    if (gap > 1) count = 0;

    streak = { count, lastDate: dates[dates.length-1] };
  }

  /* ─── LOG HABIT ─── */
  function logHabit(habitId) {
    const today = new Date().toISOString().slice(0, 10);
    /* check if already logged today */
    const already = logs.some(l => l.habitId === habitId && l.date === today);
    if (already) return false;
    logs.push({ habitId, date: today, ts: Date.now() });
    computeTotals();
    updateStreak();
    saveState();
    return true;
  }

  /* ─── REMOVE LOG ─── */
  function removeLog(habitId) {
    const today = new Date().toISOString().slice(0, 10);
    const idx = logs.findIndex(l => l.habitId === habitId && l.date === today);
    if (idx === -1) return;
    logs.splice(idx, 1);
    computeTotals();
    updateStreak();
    saveState();
    syncAll();
  }

  /* ─── RENDER CHECKLIST ─── */
  function renderChecklist() {
    const today = new Date().toISOString().slice(0, 10);
    todayLabel.textContent = 'TODAY: ' + today;

    checklistBody.innerHTML = '';
    HABITS.forEach(h => {
      const done = logs.some(l => l.habitId === h.id && l.date === today);
      const div = document.createElement('div');
      div.className = 'check-item' + (done ? ' completed' : '');
      div.innerHTML = `
        <div class="ci-toggle ${done ? 'on' : 'off'}">${done ? '&#x2713;' : ''}</div>
        <span class="ci-name">${h.label}</span>
        <span class="ci-pts">+${h.pts} pts</span>
      `;
      div.addEventListener('click', function() {
        if (done) removeLog(h.id);
        else { logHabit(h.id); syncAll(); }
      });
      checklistBody.appendChild(div);
    });
  }

  /* ─── DRAW CANVAS ─── */
  let animProgress = 1;

  function drawCanvas() {
    const w = cw, h = ch;
    ctx.clearRect(0, 0, w, h);
    if (!w || !h) return;

    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(cx, cy) - 20;
    const ringH = maxR * 0.22;

    const todayLogs = HABITS.map((h, i) => {
      const done = logs.some(l => l.habitId === h.id && l.date === new Date().toISOString().slice(0, 10));
      return { ...h, done, idx: i };
    });

    const doneCount = todayLogs.filter(t => t.done).length;
    const totalDone = HABITS.length;

    todayLogs.forEach((t, i) => {
      const r = maxR - (i * ringH * 1.4) - ringH/2;
      const frac = animProgress * (t.done ? 1 : 0);

      /* bg ring */
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = ringH * 0.6;
      ctx.stroke();

      /* progress arc */
      if (frac > 0) {
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + Math.PI * 2 * frac;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.strokeStyle = t.color;
        ctx.lineWidth = ringH * 0.6;
        ctx.lineCap = 'round';
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineCap = 'butt';
      }

      /* label */
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.font = 'clamp(4px,0.45vmin,6px) "JetBrains Mono",monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.label + (t.done ? ' [DONE]' : ' [PENDING]'), cx, cy + r + ringH * 0.8);
    });

    /* center text */
    if (doneCount === totalDone && totalDone > 0) {
      ctx.fillStyle = '#00e676';
      ctx.font = '600 clamp(7px,0.8vmin,10px) "JetBrains Mono",monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#00e676';
      ctx.shadowBlur = 10;
      ctx.fillText('ALL HABITS COMPLETE', cx, cy);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.font = 'clamp(6px,0.7vmin,9px) "JetBrains Mono",monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(doneCount + '/' + totalDone, cx, cy);
    }
  }

  /* ─── TELEMETRY ─── */
  function renderTelemetry() {
    tStreak.textContent = streak.count + ' days';
    tStreak.style.color = streak.count >= 7 ? '#00e676' : streak.count >= 3 ? '#ffc800' : '#00e5ff';
    tPlastic.textContent = totals.plastic + ' kg';
    tWater.textContent = totals.water + ' L';
    tCO2.textContent = totals.co2 + ' kg';
    tPoints.textContent = totals.points;

    /* integrity badge */
    const pts = totals.points;
    if (pts >= 500) {
      tBadge.className = 'tele-badge master';
      tBadge.textContent = 'MASTER ECOLOGIST — BIOSPHERE STABLE';
      telePanel.classList.add('stabilized');
    } else if (pts >= 200) {
      tBadge.className = 'tele-badge advanced';
      tBadge.textContent = 'ADVANCED ECOLOGICAL INTEGRITY';
      telePanel.classList.remove('stabilized');
    } else if (pts >= 50) {
      tBadge.className = 'tele-badge intermediate';
      tBadge.textContent = 'INTERMEDIATE SYSTEM BALANCE';
      telePanel.classList.remove('stabilized');
    } else if (pts > 0) {
      tBadge.className = 'tele-badge beginner';
      tBadge.textContent = 'BEGINNER ECOLOGICAL FOOTPRINT';
      telePanel.classList.remove('stabilized');
    } else {
      tBadge.className = 'tele-badge standby';
      tBadge.textContent = 'STANDBY';
      telePanel.classList.remove('stabilized');
    }
  }

  /* ─── SYNC ALL ─── */
  function syncAll() {
    renderChecklist();
    drawCanvas();
    renderTelemetry();
  }

  /* ─── QUICK LOG ─── */
  quickBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.dataset.action;
      const habitId = QUICK_MAP[action];
      if (habitId && logHabit(habitId)) {
        syncAll();
      }
    });
  });

  /* ─── COMPUTE ─── */
  btnCompute.addEventListener('click', syncAll);

  /* ─── 7-DAY STREAK ─── */
  btnStreak.addEventListener('click', function() {
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      HABITS.forEach(h => {
        const exists = logs.some(l => l.habitId === h.id && l.date === ds);
        if (!exists) logs.push({ habitId: h.id, date: ds, ts: d.getTime() });
      });
    }
    computeTotals();
    updateStreak();
    saveState();
    syncAll();
  });

  /* ─── PURGE ─── */
  btnPurge.addEventListener('click', function() {
    logs = [];
    streak = { count: 0, lastDate: '' };
    totals = { plastic: 0, water: 0, co2: 0, points: 0 };
    localStorage.removeItem(STORAGE_KEY);
    telePanel.classList.remove('stabilized');
    syncAll();
  });

  /* ─── ANIMATION ─── */
  let animId = null;
  let animTime = 0;

  function loop() {
    animTime += 0.02;
    animProgress = 0.5 + 0.5 * Math.sin(animTime);
    /* only animate the rings when all habits are done */
    const today = new Date().toISOString().slice(0, 10);
    const allDone = HABITS.every(h => logs.some(l => l.habitId === h.id && l.date === today));
    if (allDone) {
      drawCanvas();
    }
    animId = requestAnimationFrame(loop);
  }

  /* ─── RESIZE ─── */
  let resizeTm;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTm);
    resizeTm = setTimeout(() => { resizeCanvas(); drawCanvas(); }, 100);
  });

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    loadState();
    computeTotals();
    updateStreak();
    saveState();
    syncAll();
    loop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
