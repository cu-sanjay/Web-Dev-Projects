(function () {
  var STORAGE_KEY = 'energy_monitor_data';

  /* ---- Constants ---- */
  var RATE_PER_KWH = 0.12;
  var CARBON_FACTOR = 0.85;
  var ADVICE_THRESHOLD = 0.20;
  var COLORS = ['#00f0ff','#10b981','#f59e0b','#ef4444','#8b5cf6','#f97316','#ec4899','#14b8a6'];

  var appliances = [];

  /* ---- Elements ---- */
  var telDaily = document.getElementById('telDaily');
  var telBill = document.getElementById('telBill');
  var telCarbon = document.getElementById('telCarbon');
  var telStatus = document.getElementById('telStatus');
  var canvas = document.getElementById('chartCanvas');
  var ctx = canvas.getContext('2d');
  var canvasWrap = document.getElementById('canvasWrap');
  var applianceList = document.getElementById('applianceList');
  var adviceList = document.getElementById('adviceList');
  var adviceEmpty = document.getElementById('adviceEmpty');
  var form = document.getElementById('applianceForm');
  var fName = document.getElementById('fName');
  var fWatts = document.getElementById('fWatts');
  var fHours = document.getElementById('fHours');
  var flushBtn = document.getElementById('flushBtn');
  var sampleBtn = document.getElementById('sampleBtn');

  /* ---- Storage ---- */
  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (Array.isArray(d) && d.length) { appliances = d; return; }
      }
    } catch (e) {}
    appliances = seedData();
    saveData();
  }

  function saveData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appliances)); } catch (e) {}
  }

  function seedData() {
    return [
      { id: 1, name: 'Smart HVAC System', watts: 3500, hoursPerDay: 6, category: 'hvac' },
      { id: 2, name: 'High-Fidelity Developer Rig', watts: 600, hoursPerDay: 10, category: 'electronics' },
      { id: 3, name: 'LED Lighting Matrix', watts: 120, hoursPerDay: 12, category: 'lighting' },
      { id: 4, name: 'Server Array Vault', watts: 800, hoursPerDay: 24, category: 'electronics' },
      { id: 5, name: 'Refrigeration Unit', watts: 450, hoursPerDay: 24, category: 'appliance' },
      { id: 6, name: 'Electric Water Heater', watts: 3000, hoursPerDay: 3, category: 'hvac' },
    ];
  }

  /* ---- Math ---- */
  function calcDailyKwh(w, h) { return (w * h) / 1000; }

  function calcTotals() {
    var totalKwh = 0;
    var detailed = [];
    for (var i = 0; i < appliances.length; i++) {
      var a = appliances[i];
      var kwh = calcDailyKwh(a.watts, a.hoursPerDay);
      totalKwh += kwh;
      detailed.push({ app: a, kwh: kwh });
    }
    var monthlyBill = totalKwh * 30 * RATE_PER_KWH;
    var carbon = totalKwh * CARBON_FACTOR;
    return { totalKwh: totalKwh, monthlyBill: monthlyBill, carbon: carbon, detailed: detailed };
  }

  function getStatus(totalKwh) {
    if (totalKwh < 20) return { label: 'Optimal', cls: 'status-ok' };
    if (totalKwh < 50) return { label: 'Elevated', cls: 'status-warn' };
    return { label: 'High Draw', cls: 'status-high' };
  }

  /* ---- Canvas ---- */
  function drawChart() {
    var rect = canvasWrap.getBoundingClientRect();
    var size = Math.min(rect.width, rect.height, 300);
    var dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    var cx = size / 2, cy = size / 2;
    var outerR = size * 0.40;
    var innerR = outerR * 0.55;

    ctx.clearRect(0, 0, size, size);

    var totals = calcTotals();
    if (totals.totalKwh === 0 || appliances.length === 0) {
      ctx.fillStyle = '#1a1d2e';
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.font = Math.round(size * 0.055) + 'px "SF Mono",Consolas,monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No data', cx, cy);
      return;
    }

    var startAngle = -Math.PI / 2;
    for (var i = 0; i < totals.detailed.length; i++) {
      var d = totals.detailed[i];
      var sliceAngle = (d.kwh / totals.totalKwh) * Math.PI * 2;
      var color = COLORS[i % COLORS.length];

      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#05070c';
      ctx.lineWidth = 1;
      ctx.stroke();

      startAngle += sliceAngle;
    }

    /* center text */
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold ' + Math.round(size * 0.07) + 'px "SF Mono",Consolas,monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(totals.totalKwh.toFixed(1) + ' kWh', cx, cy - size * 0.025);
    ctx.fillStyle = '#64748b';
    ctx.font = Math.round(size * 0.035) + 'px "SF Mono",Consolas,monospace';
    ctx.fillText('Daily Total', cx, cy + size * 0.045);

    /* legend */
    var lx = size * 0.05, ly = size * 0.06;
    ctx.font = Math.round(size * 0.028) + 'px "SF Mono",Consolas,monospace';
    for (var i = 0; i < totals.detailed.length; i++) {
      var d = totals.detailed[i];
      var color = COLORS[i % COLORS.length];
      ctx.fillStyle = color;
      ctx.fillRect(lx, ly, size * 0.025, size * 0.025);
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(trunc(d.app.name, 12) + ' ' + d.kwh.toFixed(1) + 'kWh', lx + size * 0.032, ly + size * 0.025);
      ly += size * 0.04;
    }
  }

  function trunc(str, n) { return str.length > n ? str.slice(0, n) + '…' : str; }

  /* ---- Optimization Advisor ---- */
  function generateAdvice() {
    var totals = calcTotals();
    var adviceListEl = adviceList;
    adviceListEl.innerHTML = '';

    if (appliances.length === 0) { adviceEmpty.style.display = 'flex'; return; }

    var count = 0;
    for (var i = 0; i < totals.detailed.length; i++) {
      var d = totals.detailed[i];
      var pct = totals.totalKwh > 0 ? d.kwh / totals.totalKwh : 0;
      var tips = [];

      if (pct > ADVICE_THRESHOLD) {
        tips.push('accounts for ' + (pct * 100).toFixed(0) + '% of daily usage — consider reducing run time');
        count++;
      }

      if (d.app.watts > 2000 && d.app.hoursPerDay > 4) {
        tips.push('high-wattage load (' + d.app.watts + 'W) — schedule during off-peak hours (11PM–6AM)');
        count++;
      }

      if (d.app.hoursPerDay >= 20 && d.app.watts > 300) {
        tips.push('24/7 vampire draw — install smart outlet for automated power cycling');
        count++;
      }

      if (d.app.category === 'hvac' && d.app.hoursPerDay > 8) {
        tips.push('HVAC extended runtime — adjust thermostat 2°C higher to save ~10% per degree');
        count++;
      }

      if (d.app.category === 'electronics' && d.app.hoursPerDay > 12) {
        tips.push('consider enabling power-saving mode or auto-sleep after 30min idle');
        count++;
      }

      if (tips.length > 0) {
        var card = document.createElement('div');
        card.className = 'advice-card';
        card.innerHTML = '<div class="advice-app">' + esc(d.app.name) + '</div>';
        for (var t = 0; t < tips.length; t++) {
          card.innerHTML += '<div class="advice-text">' + tips[t] + '</div>';
        }
        adviceListEl.appendChild(card);
      }
    }

    if (count === 0) adviceEmpty.style.display = 'flex';
    else adviceEmpty.style.display = 'none';
  }

  /* ---- UI update ---- */
  function updateTele() {
    var totals = calcTotals();
    telDaily.textContent = totals.totalKwh.toFixed(2);
    telBill.textContent = '$' + totals.monthlyBill.toFixed(2);
    telCarbon.textContent = totals.carbon.toFixed(2) + ' kg';
    var st = getStatus(totals.totalKwh);
    telStatus.textContent = st.label;
    telStatus.className = 'tel-value ' + st.cls;
  }

  function renderApplianceList() {
    applianceList.innerHTML = '';
    for (var i = 0; i < appliances.length; i++) {
      var a = appliances[i];
      var kwh = calcDailyKwh(a.watts, a.hoursPerDay);
      var div = document.createElement('div');
      div.className = 'app-item';
      div.innerHTML = '<span class="app-name">' + esc(a.name) + '</span>' +
        '<span class="app-kwh">' + kwh.toFixed(1) + ' kWh</span>' +
        '<button class="app-del" data-id="' + a.id + '">\u00D7</button>';
      applianceList.appendChild(div);
    }

    /* bind delete */
    applianceList.querySelectorAll('.app-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(this.dataset.id);
        appliances = appliances.filter(function (a) { return a.id !== id; });
        saveData();
        refresh();
      });
    });
  }

  function refresh() {
    updateTele();
    renderApplianceList();
    drawChart();
    generateAdvice();
  }

  /* ---- Form ---- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = sanitize(fName.value);
    if (!name) { fName.focus(); return; }

    var watts = parseInt(fWatts.value);
    if (!watts || watts < 1 || watts > 99999) { fWatts.focus(); return; }

    var hours = parseFloat(fHours.value);
    if (!hours || hours < 0.5 || hours > 24) { fHours.focus(); return; }

    var maxId = 0;
    for (var i = 0; i < appliances.length; i++) {
      if (appliances[i].id > maxId) maxId = appliances[i].id;
    }

    appliances.push({ id: maxId + 1, name: name, watts: watts, hoursPerDay: hours, category: inferCategory(name) });

    saveData();
    refresh();

    fName.value = '';
    fWatts.value = '';
    fHours.value = '';
    fName.focus();
  });

  function inferCategory(name) {
    var n = name.toLowerCase();
    if (n.indexOf('hvac') !== -1 || n.indexOf('ac') !== -1 || n.indexOf('heater') !== -1 || n.indexOf('furnace') !== -1) return 'hvac';
    if (n.indexOf('server') !== -1 || n.indexOf('rig') !== -1 || n.indexOf('pc') !== -1 || n.indexOf('computer') !== -1 || n.indexOf('monitor') !== -1) return 'electronics';
    if (n.indexOf('light') !== -1) return 'lighting';
    if (n.indexOf('fridge') !== -1 || n.indexOf('refriger') !== -1) return 'appliance';
    return 'other';
  }

  function sanitize(str) {
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<\/?[^>]+(>|$)/g, '').trim();
  }

  function esc(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  /* ---- Footer ---- */
  flushBtn.addEventListener('click', function () {
    if (!confirm('Flush all appliance data?')) return;
    appliances = [];
    saveData();
    refresh();
  });

  sampleBtn.addEventListener('click', function () {
    appliances = seedData();
    saveData();
    refresh();
  });

  /* ---- Resize canvas ---- */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawChart, 100);
  });

  /* ---- Boot ---- */
  loadData();
  refresh();
})();
