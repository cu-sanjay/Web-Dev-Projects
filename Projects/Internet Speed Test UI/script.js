(function () {
  var STORAGE_KEY = 'speedtest_history';
  var running = false;
  var currentSpeed = 0, targetSpeed = 0, phase = 'idle';
  var pingVal = 0, jitterVal = 0, downVal = 0, upVal = 0;
  var history = [];
  var ispNames = ['AS32934', 'AS15169', 'AS8075', 'AS7922'];

  var canvas = document.getElementById('gaugeCanvas');
  var ctx = canvas.getContext('2d');
  var gaugeWrap = document.getElementById('gaugeWrap');
  var telPing = document.getElementById('telPing');
  var telJitter = document.getElementById('telJitter');
  var telIsp = document.getElementById('telIsp');
  var telStatus = document.getElementById('telStatus');
  var gaugeSpeed = document.getElementById('gaugeSpeed');
  var resDown = document.getElementById('resDown');
  var resUp = document.getElementById('resUp');
  var resPing = document.getElementById('resPing');
  var resJitter = document.getElementById('resJitter');
  var historyList = document.getElementById('historyList');
  var historyEmpty = document.getElementById('historyEmpty');
  var startBtn = document.getElementById('startBtn');
  var clearBtn = document.getElementById('clearBtn');

  function loadData() { try { var r = localStorage.getItem(STORAGE_KEY); if (r) { var d = JSON.parse(r); if (Array.isArray(d)) history = d; } } catch(e) {} renderHistory(); }
  function saveData() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch(e) {} }

  function resizeCanvas() {
    var rect = gaugeWrap.getBoundingClientRect();
    var size = rect.width;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);
    drawGauge(0);
  }

  function drawGauge(speed) {
    var size = canvas.width / (window.devicePixelRatio || 1);
    var cx = size / 2, cy = size / 2, radius = size * 0.38, lw = size * 0.045;
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0.75 * Math.PI, 2.25 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();

    var maxS = 500, pct = Math.min(speed / maxS, 1);
    var sa = 0.75 * Math.PI, ea = sa + pct * 1.5 * Math.PI;
    var grad = ctx.createLinearGradient(0, 0, size, 0);
    grad.addColorStop(0, '#00f0ff'); grad.addColorStop(0.5, '#00f0ff'); grad.addColorStop(1, '#ff2a5f');
    ctx.beginPath(); ctx.arc(cx, cy, radius, sa, ea);
    ctx.strokeStyle = grad; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();

    ctx.font = Math.round(size * 0.035) + 'px "SF Mono",Consolas,monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i <= 5; i++) {
      var a = 0.75 * Math.PI + (i / 5) * 1.5 * Math.PI, v = (i / 5) * maxS;
      ctx.fillStyle = v <= speed ? '#00f0ff' : '#475569';
      ctx.fillText(Math.round(v), cx + (radius + lw + size * 0.04) * Math.cos(a), cy + (radius + lw + size * 0.04) * Math.sin(a));
    }

    var na = sa + pct * 1.5 * Math.PI;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(na);
    ctx.beginPath(); ctx.moveTo(0, -radius * 0.15); ctx.lineTo(0, radius * 0.85);
    ctx.strokeStyle = speed > 0 ? '#00f0ff' : '#475569'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
    ctx.restore();

    ctx.beginPath(); ctx.arc(cx, cy, size * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = '#05070c'; ctx.fill();
    ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2; ctx.stroke();
  }

  function gaugeLoop() {
    if (phase === 'idle' || phase === 'done') return;
    var diff = targetSpeed - currentSpeed;
    currentSpeed += diff * 0.08;
    if (Math.abs(diff) < 0.5) currentSpeed = targetSpeed;
    if (phase === 'download' || phase === 'upload') { currentSpeed += (Math.random() - 0.5) * 24; if (currentSpeed < 0) currentSpeed = 0; }
    gaugeSpeed.textContent = Math.round(currentSpeed);
    drawGauge(currentSpeed);
    if (phase !== 'idle' && phase !== 'done') requestAnimationFrame(gaugeLoop);
  }

  function phasePing() {
    return new Promise(function (resolve) {
      phase = 'ping'; telStatus.textContent = 'Pinging'; telStatus.className = 'tel-value status-active';
      var count = 0, total = 15;
      var iv = setInterval(function () {
        count++; pingVal = 8 + Math.random() * 30; jitterVal = Math.random() * 8;
        telPing.textContent = pingVal.toFixed(1) + ' ms'; telJitter.textContent = jitterVal.toFixed(1) + ' ms';
        telIsp.textContent = ispNames[Math.floor(Math.random() * ispNames.length)];
        if (count >= total) { clearInterval(iv); resolve(); }
      }, 100);
    });
  }

  function phaseDownload() {
    return new Promise(function (resolve) {
      phase = 'download'; telStatus.textContent = 'Downloading'; telStatus.className = 'tel-value status-active';
      targetSpeed = 250 + Math.random() * 80; currentSpeed = 0; gaugeLoop();
      var elapsed = 0, dur = 40;
      var iv = setInterval(function () {
        elapsed++; targetSpeed = Math.min((elapsed / dur) * (250 + Math.random() * 100), 320);
        if (elapsed >= dur) { clearInterval(iv); downVal = 80 + Math.random() * 170; targetSpeed = downVal; setTimeout(function () { resolve(); }, 300); }
      }, 100);
    });
  }

  function phaseUpload() {
    return new Promise(function (resolve) {
      phase = 'upload'; telStatus.textContent = 'Uploading'; telStatus.className = 'tel-value status-active';
      targetSpeed = 40 + Math.random() * 30; currentSpeed = downVal * 0.3; gaugeLoop();
      var elapsed = 0, dur = 40;
      var iv = setInterval(function () {
        elapsed++; targetSpeed = Math.min((elapsed / dur) * (50 + Math.random() * 40), 120);
        if (elapsed >= dur) { clearInterval(iv); upVal = 20 + Math.random() * 60; targetSpeed = upVal; setTimeout(function () { resolve(); }, 300); }
      }, 100);
    });
  }

  function runTest() {
    if (running) return; running = true; startBtn.disabled = true; phase = 'ping';
    downVal = 0; upVal = 0; pingVal = 0; jitterVal = 0;
    phasePing().then(phaseDownload).then(phaseUpload).then(function () {
      phase = 'done'; telStatus.textContent = 'Complete'; telStatus.className = 'tel-value status-done';
      running = false; startBtn.disabled = false;
      resDown.textContent = downVal.toFixed(1) + ' Mbps'; resUp.textContent = upVal.toFixed(1) + ' Mbps';
      resPing.textContent = pingVal.toFixed(1) + ' ms'; resJitter.textContent = jitterVal.toFixed(1) + ' ms';
      var now = new Date();
      history.unshift({ date: (now.getMonth() + 1) + '/' + now.getDate(), time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), down: downVal, up: upVal, ping: pingVal });
      if (history.length > 30) history = history.slice(0, 30);
      saveData(); renderHistory();
    });
  }

  function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) { historyEmpty.style.display = 'flex'; return; }
    historyEmpty.style.display = 'none';
    history.forEach(function (h) {
      var div = document.createElement('div'); div.className = 'history-entry';
      div.innerHTML = '<span class="h-date">' + h.date + '</span><span class="h-down">' + h.down.toFixed(1) + '</span><span class="h-up">' + h.up.toFixed(1) + '</span><span class="h-ping">' + h.ping.toFixed(1) + 'ms</span>';
      historyList.appendChild(div);
    });
  }

  function clearHistory() { if (!confirm('Clear all test history?')) return; history = []; saveData(); renderHistory(); }

  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { resizeCanvas(); drawGauge(currentSpeed); }, 100); });

  startBtn.addEventListener('click', runTest);
  clearBtn.addEventListener('click', clearHistory);

  loadData();
  resizeCanvas();
  drawGauge(0);
})();
