(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#macroCanvas');
  const ctx = canvas.getContext('2d');
  const foodSelect = $('#foodSelect');
  const slServing = $('#slServing');
  const valServing = $('#valServing');
  const btnAdd = $('#btnAdd');
  const btnExec = $('#btnExec');
  const btnSurplus = $('#btnSurplus');
  const btnFlush = $('#btnFlush');
  const ledgerBody = $('#ledgerBody');
  const ledgerEmpty = $('#ledgerEmpty');
  const itemCount = $('#itemCount');
  const kcalVal = $('#kcalVal');
  const proteinVal = $('#proteinVal');
  const carbsVal = $('#carbsVal');
  const fatsVal = $('#fatsVal');
  const topBadge = $('#topBadge');
  const teleKcal = $('#teleKcal');
  const teleProtein = $('#teleProtein');
  const teleCarbs = $('#teleCarbs');
  const teleFats = $('#teleFats');
  const teleRatio = $('#teleRatio');
  const teleBadge = $('#teleBadge');
  const toastContainer = $('#toastContainer');
  const presetBtns = $$('.preset-btn');

  /* ─── FOOD DATABASE (per 100g) ─── */
  const FOODS = {
    chicken: { label: 'Grilled Chicken',    P: 31,  C: 0,   F: 3.6 },
    rice:    { label: 'Brown Rice',          P: 2.6, C: 23,  F: 0.9 },
    avocado: { label: 'Avocado',             P: 2,   C: 8.5, F: 15   },
    eggs:    { label: 'Egg Whites',          P: 10.9,C: 0.7, F: 0.2  },
    oil:     { label: 'Olive Oil',           P: 0,   C: 0,   F: 100  }
  };

  const PRESETS = {
    keto: {
      label: 'Ketogenic Breakfast',
      items: [{ food: 'eggs', g: 150 }, { food: 'avocado', g: 100 }, { food: 'oil', g: 20 }]
    },
    protein: {
      label: 'High-Protein Mass Gainer',
      items: [{ food: 'chicken', g: 250 }, { food: 'rice', g: 200 }, { food: 'eggs', g: 100 }]
    },
    mediterranean: {
      label: 'Balanced Mediterranean',
      items: [{ food: 'chicken', g: 150 }, { food: 'rice', g: 150 }, { food: 'avocado', g: 80 }, { food: 'oil', g: 15 }]
    }
  };

  /* ─── STATE ─── */
  let meal = [];
  let animTime = 0;
  let animId = null;

  /* ─── PRESETS ─── */
  presetBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      presetBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const p = PRESETS[this.dataset.preset];
      if (!p) return;
      meal = p.items.map(i => ({ ...i }));
      rebuildLedger();
      computeTotals();
      showToast('[PRESET] Loaded: ' + p.label, '#ff3366');
    });
  });

  /* ─── ADD ITEM ─── */
  btnAdd.addEventListener('click', function() {
    const food = foodSelect.value;
    const g = parseFloat(slServing.value);
    if (isNaN(g) || g <= 0) {
      showToast('[WARN] Invalid portion size', '#ff1744');
      return;
    }
    meal.push({ food, g });
    rebuildLedger();
    computeTotals();
    showToast('[ADD] ' + FOODS[food].label + ' — ' + g + 'g', '#00e676');
  });

  /* ─── REBUILD LEDGER ─── */
  function rebuildLedger() {
    ledgerBody.innerHTML = '';
    if (meal.length === 0) {
      ledgerEmpty.style.display = 'block';
      itemCount.textContent = '0';
      return;
    }
    ledgerEmpty.style.display = 'none';
    itemCount.textContent = meal.length;

    meal.forEach((entry, idx) => {
      const f = FOODS[entry.food];
      const scale = entry.g / 100;
      const P = f.P * scale;
      const C = f.C * scale;
      const F = f.F * scale;
      const kcal = 4 * P + 4 * C + 9 * F;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${f.label}</td>
        <td>${entry.g}g</td>
        <td class="lbl-p">${P.toFixed(1)}</td>
        <td class="lbl-c">${C.toFixed(1)}</td>
        <td class="lbl-f">${F.toFixed(1)}</td>
        <td class="lbl-kcal">${Math.round(kcal)}</td>
        <td><button class="ledger-del" data-idx="${idx}">&#x2715;</button></td>
      `;
      ledgerBody.appendChild(tr);
    });

    /* delete handlers */
    $$('.ledger-del').forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = parseInt(this.dataset.idx, 10);
        meal.splice(idx, 1);
        rebuildLedger();
        computeTotals();
        showToast('[DELETE] Item removed', '#8892a8');
      });
    });
  }

  /* ─── COMPUTE TOTALS ─── */
  function computeTotals() {
    let totalP = 0, totalC = 0, totalF = 0;
    meal.forEach(entry => {
      const f = FOODS[entry.food];
      const scale = entry.g / 100;
      totalP += f.P * scale;
      totalC += f.C * scale;
      totalF += f.F * scale;
    });

    const kcal = 4 * totalP + 4 * totalC + 9 * totalF;

    /* update header chips */
    kcalVal.textContent = Math.round(kcal);
    proteinVal.textContent = totalP.toFixed(1);
    carbsVal.textContent = totalC.toFixed(1);
    fatsVal.textContent = totalF.toFixed(1);

    /* telemetry */
    teleKcal.textContent = Math.round(kcal) + ' kcal';
    teleProtein.textContent = totalP.toFixed(1) + ' g';
    teleCarbs.textContent = totalC.toFixed(1) + ' g';
    teleFats.textContent = totalF.toFixed(1) + ' g';
    teleRatio.textContent = totalP.toFixed(0) + '/' + totalC.toFixed(0) + '/' + totalF.toFixed(0);

    /* classification */
    const total = totalP + totalC + totalF;
    let badge = '[BALANCED DIETETIC PROFILE]';
    let color = '#00e676';
    let bg = 'rgba(0,230,118,0.08)';
    let bdr = 'rgba(0,230,118,0.25)';

    if (totalP > totalC && totalP > totalF) {
      badge = '[HIGH-PROTEIN ANABOLIC RECOVERY PROFILE]';
      color = '#ff3366'; bg = 'rgba(255,51,102,0.08)'; bdr = 'rgba(255,51,102,0.25)';
    } else if (totalC > totalP && totalC > totalF) {
      badge = '[CARBOHYDRATE GLYCOGEN OVER-SURGE PINPOINTED]';
      color = '#ffb800'; bg = 'rgba(255,184,0,0.08)'; bdr = 'rgba(255,184,0,0.25)';
    } else if (totalF > totalP && totalF > totalC) {
      badge = '[LIPID-DOMINANT KETOGENIC STATE]';
      color = '#3399ff'; bg = 'rgba(51,153,255,0.08)'; bdr = 'rgba(51,153,255,0.25)';
    }

    teleBadge.textContent = badge;
    teleBadge.style.background = bg;
    teleBadge.style.borderColor = bdr;
    teleBadge.style.color = color;

    topBadge.textContent = meal.length > 0 ? Math.round(kcal) + ' kcal' : 'STANDBY';
  }

  /* ─── SURPLUS INJECTION ─── */
  btnSurplus.addEventListener('click', function() {
    if (meal.length === 0) {
      showToast('[WARN] No items in ledger — add food first', '#ffb800');
      return;
    }
    /* add 200g chicken + 100g oil = ~1400 kcal surplus */
    meal.push({ food: 'chicken', g: 200 });
    meal.push({ food: 'oil', g: 30 });
    rebuildLedger();
    computeTotals();
    showToast('[SURPLUS] +200g chicken, +30g oil injected', '#ffb800');
  });

  /* ─── EXEC ─── */
  btnExec.addEventListener('click', function() {
    computeTotals();
    showToast('[EXEC] Metabolic matrix computed', '#00e5ff');
  });

  /* ─── FLUSH ─── */
  btnFlush.addEventListener('click', function() {
    meal = [];
    rebuildLedger();
    kcalVal.textContent = '0';
    proteinVal.textContent = '0';
    carbsVal.textContent = '0';
    fatsVal.textContent = '0';
    topBadge.textContent = 'STANDBY';
    teleKcal.textContent = '0 kcal';
    teleProtein.textContent = '0 g';
    teleCarbs.textContent = '0 g';
    teleFats.textContent = '0 g';
    teleRatio.textContent = '--';
    teleBadge.textContent = 'STANDBY';
    teleBadge.style.background = '';
    teleBadge.style.borderColor = '';
    teleBadge.style.color = '';
    presetBtns.forEach(b => b.classList.remove('active'));
    showToast('[FLUSH] Meal ledger purged — all metrics zeroed', '#8892a8');
  });

  /* ─── CANVAS ─── */
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 300;
    const h = Math.max(100, Math.min(200, w * 0.35));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = w;
    canvas._h = h;
  }

  function drawBars() {
    const w = canvas._w;
    const h = canvas._h;
    ctx.clearRect(0, 0, w, h);

    const totals = getTotals();
    const maxVal = Math.max(1, totals.P, totals.C, totals.F);

    const padL = 36, padR = 10, padT = 10, padB = 16;
    const barW = (w - padL - padR) / 3 - 6;
    const barH = h - padT - padB;

    const bars = [
      { label: 'PROTEIN', val: totals.P, color: '#ff3366', x: padL },
      { label: 'CARBS',   val: totals.C, color: '#ffcc00', x: padL + barW + 6 },
      { label: 'FATS',    val: totals.F, color: '#3399ff', x: padL + (barW + 6) * 2 }
    ];

    /* grid lines */
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (barH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + barW * 3 + 12, y); ctx.stroke();
    }

    /* axis */
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + barH); ctx.lineTo(padL + barW * 3 + 12, padT + barH); ctx.stroke();

    /* axis values */
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = '4.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round((maxVal / 4) * (4 - i));
      const y = padT + (barH / 4) * i;
      ctx.fillText(val, padL - 4, y);
    }

    /* bars */
    bars.forEach(b => {
      const bh = maxVal > 0 ? (b.val / maxVal) * barH : 0;
      const y = padT + barH - bh;

      /* bar fill */
      const grad = ctx.createLinearGradient(0, y, 0, padT + barH);
      grad.addColorStop(0, b.color + 'cc');
      grad.addColorStop(1, b.color + '33');
      ctx.fillStyle = grad;

      ctx.beginPath();
      const r = 2;
      const left = b.x + 2;
      const right = b.x + barW - 2;
      const top = y;
      const bot = padT + barH;
      ctx.moveTo(left + r, top);
      ctx.lineTo(right - r, top);
      ctx.quadraticCurveTo(right, top, right, top + r);
      ctx.lineTo(right, bot);
      ctx.lineTo(left, bot);
      ctx.lineTo(left, top + r);
      ctx.quadraticCurveTo(left, top, left + r, top);
      ctx.closePath();
      ctx.fill();

      /* label */
      ctx.fillStyle = b.color;
      ctx.font = '600 5.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(b.label, b.x + barW / 2, padT + barH + 2);

      /* value on top */
      if (bh > 10) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 6px "JetBrains Mono", monospace';
        ctx.textBaseline = 'bottom';
        ctx.fillText(b.val.toFixed(1) + 'g', b.x + barW / 2, y - 3);
      }
    });
  }

  function getTotals() {
    let P = 0, C = 0, F = 0;
    meal.forEach(entry => {
      const f = FOODS[entry.food];
      const scale = entry.g / 100;
      P += f.P * scale;
      C += f.C * scale;
      F += f.F * scale;
    });
    return { P, C, F };
  }

  /* ─── ANIMATION ─── */
  function loop() {
    animTime++;
    drawBars();
    animId = requestAnimationFrame(loop);
  }

  /* ─── SLIDER SYNC ─── */
  slServing.addEventListener('input', function() {
    valServing.textContent = this.value;
  });

  window.addEventListener('resize', resizeCanvas);

  /* ─── TOAST ─── */
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

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    loop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
