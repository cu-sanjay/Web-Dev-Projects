(function () {
  var STORAGE_KEY = 'finance_goals';

  var goals = [];
  var COLORS = ['#00f0ff','#10b981','#f59e0b','#ff2a5f','#8b5cf6','#f97316'];

  /* ---- Elements ---- */
  var telSaved = document.getElementById('telSaved');
  var telTarget = document.getElementById('telTarget');
  var telPct = document.getElementById('telPct');
  var telHorizon = document.getElementById('telHorizon');
  var canvas = document.getElementById('ringCanvas');
  var ctx = canvas.getContext('2d');
  var canvasWrap = document.getElementById('canvasWrap');
  var goalList = document.getElementById('goalList');
  var goalEmpty = document.getElementById('goalEmpty');
  var form = document.getElementById('goalForm');
  var fName = document.getElementById('fName');
  var fTarget = document.getElementById('fTarget');
  var fCurrent = document.getElementById('fCurrent');
  var fMonthly = document.getElementById('fMonthly');
  var fDeadline = document.getElementById('fDeadline');
  var flushBtn = document.getElementById('flushBtn');
  var sampleBtn = document.getElementById('sampleBtn');

  /* ---- Storage ---- */
  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { var d = JSON.parse(raw); if (Array.isArray(d) && d.length) { goals = d; return; } }
    } catch (e) {}
    goals = seedData();
    saveData();
  }
  function saveData() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)); } catch (e) {} }

  function seedData() {
    return [
      { id: 1, name: 'Emergency Fund Reserve', targetSum: 30000, currentSaved: 8500, monthlyContribution: 1200, deadlineMonths: 24 },
      { id: 2, name: 'Next-Gen Workstation Build', targetSum: 8000, currentSaved: 3200, monthlyContribution: 600, deadlineMonths: 12 },
      { id: 3, name: 'Real Estate Downpayment', targetSum: 120000, currentSaved: 15000, monthlyContribution: 2500, deadlineMonths: 60 },
      { id: 4, name: 'Tech Venture Seed Capital', targetSum: 50000, currentSaved: 5000, monthlyContribution: 1500, deadlineMonths: 36 },
    ];
  }

  /* ---- Math ---- */
  function calcPct(g) { return g.targetSum > 0 ? (g.currentSaved / g.targetSum) * 100 : 0; }

  function calcOnTrack(g) {
    if (g.deadlineMonths <= 0 || g.monthlyContribution <= 0) return false;
    var remaining = g.targetSum - g.currentSaved;
    if (remaining <= 0) return true;
    var monthsNeeded = remaining / g.monthlyContribution;
    return monthsNeeded <= g.deadlineMonths;
  }

  function calcTotals() {
    var saved = 0, target = 0;
    goals.forEach(function (g) { saved += g.currentSaved; target += g.targetSum; });
    var pct = target > 0 ? (saved / target) * 100 : 0;
    return { saved: saved, target: target, pct: pct };
  }

  /* ---- Canvas ---- */
  function drawRings() {
    var rect = canvasWrap.getBoundingClientRect();
    var size = Math.min(rect.width, rect.height, 260);
    var dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    var cx = size / 2, cy = size / 2;
    ctx.clearRect(0, 0, size, size);

    if (goals.length === 0) {
      ctx.fillStyle = '#1a1d2e';
      ctx.beginPath(); ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.font = Math.round(size * 0.05) + 'px "SF Mono",Consolas,monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('No goals', cx, cy);
      return;
    }

    /* draw concentric rings */
    var ringGap = size * 0.06;
    var availableR = size * 0.42;
    var count = Math.min(goals.length, 5);
    var ringW = (availableR - ringGap * (count - 1)) / count;
    if (ringW < 4) ringW = 4;

    var totals = calcTotals();
    for (var i = 0; i < count; i++) {
      var g = goals[i];
      var r = availableR - i * (ringW + ringGap);
      var pct = calcPct(g) / 100;
      var color = COLORS[i % COLORS.length];

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = ringW;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = ringW;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineCap = 'butt';
    }

    /* center text */
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold ' + Math.round(size * 0.065) + 'px "SF Mono",Consolas,monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('$' + abbr(totals.saved), cx, cy - size * 0.025);
    ctx.fillStyle = '#64748b';
    ctx.font = Math.round(size * 0.035) + 'px "SF Mono",Consolas,monospace';
    ctx.fillText('of $' + abbr(totals.target), cx, cy + size * 0.04);
  }

  function abbr(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return Math.round(n).toString();
  }

  /* ---- Telemetry ---- */
  function updateTele() {
    var t = calcTotals();
    telSaved.textContent = '$' + abbr(t.saved);
    telTarget.textContent = '$' + abbr(t.target);
    telPct.textContent = t.pct.toFixed(1) + '%';

    /* horizon: avg months to target at current pace */
    var totalRemaining = 0, totalMonthly = 0;
    goals.forEach(function (g) {
      var rem = g.targetSum - g.currentSaved;
      if (rem > 0) { totalRemaining += rem; totalMonthly += g.monthlyContribution; }
    });
    if (totalMonthly > 0) {
      var months = totalRemaining / totalMonthly;
      telHorizon.textContent = months < 1 ? '<1 month' : Math.ceil(months) + ' months';
    } else {
      telHorizon.textContent = '—';
    }
  }

  /* ---- Goals list ---- */
  function renderGoals() {
    goalList.innerHTML = '';
    if (goals.length === 0) { goalEmpty.style.display = 'flex'; return; }
    goalEmpty.style.display = 'none';

    goals.forEach(function (g) {
      var pct = calcPct(g);
      var onTrack = calcOnTrack(g);
      var color = pct >= 100 ? '#10b981' : onTrack ? '#00f0ff' : '#f59e0b';

      var div = document.createElement('div');
      div.className = 'goal-card';
      div.id = 'goal-' + g.id;
      div.innerHTML =
        '<div style="display:flex;align-items:center;gap:4px">' +
          '<span class="goal-name">' + esc(g.name) + '</span>' +
          '<button class="goal-del" data-id="' + g.id + '">\u00D7</button>' +
        '</div>' +
        '<div class="goal-stats">$' + abbr(g.currentSaved) + ' / $' + abbr(g.targetSum) + ' \u00B7 ' + pct.toFixed(1) + '% \u00B7 ' + (onTrack ? '\u2705 On track' : '\u26A0 At risk') + '</div>' +
        '<div class="goal-bar"><div class="goal-fill" style="width:' + Math.min(pct, 100) + '%;background:' + color + '"></div></div>' +
        '<div class="goal-topup">' +
          '<input type="number" min="0.01" step="any" placeholder="Amount $" id="topup-' + g.id + '">' +
          '<button class="topup-btn" data-id="' + g.id + '">Top Up</button>' +
        '</div>';
      goalList.appendChild(div);
    });

    /* bind top-up */
    goalList.querySelectorAll('.topup-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(this.dataset.id);
        var input = document.getElementById('topup-' + id);
        topUp(id, input);
      });
    });

    /* bind delete */
    goalList.querySelectorAll('.goal-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(this.dataset.id);
        goals = goals.filter(function (g) { return g.id !== id; });
        saveData();
        refresh();
      });
    });
  }

  /* ---- Top-Up ---- */
  function topUp(id, input) {
    var val = sanitize(input.value);
    var num = parseFloat(val);

    if (isNaN(num) || num <= 0 || val === '') {
      var card = document.getElementById('goal-' + id);
      if (card) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
      input.value = '';
      return;
    }

    for (var i = 0; i < goals.length; i++) {
      if (goals[i].id === id) {
        goals[i].currentSaved += num;
        if (goals[i].currentSaved > goals[i].targetSum) goals[i].currentSaved = goals[i].targetSum;
        break;
      }
    }

    saveData();
    refresh();

    /* flash emerald */
    var card = document.getElementById('goal-' + id);
    if (card) { card.classList.add('topped'); setTimeout(function () { card.classList.remove('topped'); }, 800); }
  }

  function sanitize(str) {
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<\/?[^>]+(>|$)/g, '').trim();
  }

  function esc(str) { var d = document.createElement('div'); d.appendChild(document.createTextNode(str)); return d.innerHTML; }

  /* ---- Refresh ---- */
  function refresh() {
    updateTele();
    renderGoals();
    drawRings();
  }

  /* ---- Form ---- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = sanitize(fName.value);
    if (!name) { fName.focus(); return; }
    var target = parseFloat(fTarget.value);
    if (!target || target < 1) { fTarget.focus(); return; }
    var current = parseFloat(fCurrent.value) || 0;
    var monthly = parseFloat(fMonthly.value);
    if (!monthly || monthly < 1) { fMonthly.focus(); return; }
    var deadline = parseInt(fDeadline.value);
    if (!deadline || deadline < 1) { fDeadline.focus(); return; }

    var maxId = 0;
    goals.forEach(function (g) { if (g.id > maxId) maxId = g.id; });

    goals.push({ id: maxId + 1, name: name, targetSum: target, currentSaved: current, monthlyContribution: monthly, deadlineMonths: deadline });
    saveData();
    refresh();

    fName.value = ''; fTarget.value = ''; fCurrent.value = ''; fMonthly.value = ''; fDeadline.value = '';
    fName.focus();
  });

  /* ---- Footer ---- */
  flushBtn.addEventListener('click', function () {
    if (!confirm('Flush all financial goals?')) return;
    goals = []; saveData(); refresh();
  });

  sampleBtn.addEventListener('click', function () {
    goals = seedData(); saveData(); refresh();
  });

  /* ---- Resize ---- */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawRings, 100);
  });

  /* ---- Boot ---- */
  loadData();
  refresh();
})();
