(function () {
  /* ---- Elements ---- */
  var apiStatus = document.getElementById('apiStatus');
  var permStatus = document.getElementById('permStatus');
  var watcherStatus = document.getElementById('watcherStatus');
  var liveDot = document.getElementById('liveDot');
  var tLat = document.getElementById('tLat');
  var tLng = document.getElementById('tLng');
  var tHeading = document.getElementById('tHeading');
  var tSpeed = document.getElementById('tSpeed');
  var tAccuracy = document.getElementById('tAccuracy');
  var tTime = document.getElementById('tTime');
  var logList = document.getElementById('logList');
  var pingBtn = document.getElementById('pingBtn');
  var watchBtn = document.getElementById('watchBtn');
  var stopBtn = document.getElementById('stopBtn');
  var clearBtn = document.getElementById('clearBtn');
  var errorOverlay = document.getElementById('errorOverlay');
  var errorText = document.getElementById('errorText');
  var app = document.getElementById('app');

  var watchId = null;
  var lastPos = null;

  /* ---- Init ---- */
  if (!navigator.geolocation) {
    apiStatus.textContent = 'Unavailable';
    apiStatus.className = 'stat-value status-error';
  } else {
    apiStatus.textContent = 'Ready';
    apiStatus.className = 'stat-value status-active';
  }

  /* ---- Logging ---- */
  function log(msg) {
    var div = document.createElement('div');
    div.className = 'log-entry';
    var t = new Date().toLocaleTimeString();
    div.innerHTML = '<span>[' + t + ']</span> ' + msg;
    logList.appendChild(div);
    logList.scrollTop = logList.scrollHeight;
  }

  /* ---- Error Handler ---- */
  function handleError(err) {
    var msg = '';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        msg = 'Access Denied: Please reset location permission tokens in your browser address bar.';
        permStatus.textContent = 'Denied';
        permStatus.className = 'stat-value status-error';
        break;
      case err.POSITION_UNAVAILABLE:
        msg = 'Hardware Sensor Unreachable or Satellite Signal Blocked.';
        break;
      case err.TIMEOUT:
        msg = 'Network connection timed out while establishing coordinate lock.';
        break;
      default:
        msg = 'Unknown geolocation error (code ' + err.code + ').';
    }

    log('ERROR: ' + msg);
    errorText.textContent = msg;
    errorOverlay.classList.remove('hidden');
    app.classList.remove('shake');
    void app.offsetWidth;
    app.classList.add('shake');

    apiStatus.textContent = 'Error';
    apiStatus.className = 'stat-value status-error';
    liveDot.className = 'dot-error';

    setTimeout(function () { errorOverlay.classList.add('hidden'); }, 3000);
  }

  /* ---- Render Position ---- */
  function renderPosition(pos) {
    var coords = pos.coords;
    tLat.textContent = coords.latitude.toFixed(6);
    tLng.textContent = coords.longitude.toFixed(6);
    tHeading.textContent = coords.heading !== null && coords.heading !== undefined ? coords.heading.toFixed(1) + '\u00B0' : '—';
    tSpeed.textContent = coords.speed !== null && coords.speed !== undefined ? (coords.speed * 3.6).toFixed(1) + ' km/h' : '—';
    tAccuracy.textContent = coords.accuracy !== null ? coords.accuracy.toFixed(0) + ' m' : '—';
    tTime.textContent = new Date(pos.timestamp).toLocaleTimeString();

    permStatus.textContent = 'Granted';
    permStatus.className = 'stat-value status-active';
    apiStatus.textContent = 'Active';
    apiStatus.className = 'stat-value status-active';
    liveDot.className = 'dot-active';

    if (lastPos && coords.speed === null && coords.heading === null) {
      /* compute speed if watch provides consecutive fixes */
      var dt = (pos.timestamp - lastPos.timestamp) / 1000;
      if (dt > 0) {
        var d = distance(lastPos.coords.latitude, lastPos.coords.longitude, coords.latitude, coords.longitude);
        var spd = d / dt;
        tSpeed.textContent = (spd * 3.6).toFixed(1) + ' km/h';
      }
    }
    lastPos = pos;
  }

  function distance(lat1, lon1, lat2, lon2) {
    var R = 6371000;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* ---- Ping ---- */
  function ping() {
    if (!navigator.geolocation) return;
    log('Requesting one-time position...');
    tLat.textContent = '…';
    tLng.textContent = '…';
    tHeading.textContent = '…';
    tSpeed.textContent = '…';
    tAccuracy.textContent = '…';
    tTime.textContent = '…';

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        renderPosition(pos);
        log('Position acquired: ' + pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4));
        apiStatus.textContent = 'Active';
        apiStatus.className = 'stat-value status-active';
      },
      function (err) {
        handleError(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  /* ---- Watch ---- */
  function startWatch() {
    if (!navigator.geolocation) return;
    if (watchId !== null) return;

    log('Starting live tracking stream...');
    tLat.textContent = '…';
    tLng.textContent = '…';
    tHeading.textContent = '…';
    tSpeed.textContent = '…';
    tAccuracy.textContent = '…';
    tTime.textContent = '…';
    lastPos = null;

    watchId = navigator.geolocation.watchPosition(
      function (pos) {
        renderPosition(pos);
      },
      function (err) {
        handleError(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    watcherStatus.textContent = 'Active';
    watcherStatus.className = 'stat-value status-active';
    liveDot.className = 'dot-active';
    watchBtn.disabled = true;
    stopBtn.disabled = false;
    pingBtn.disabled = true;
    log('Watcher ID: ' + watchId);
  }

  function stopWatch() {
    if (watchId === null) return;
    navigator.geolocation.clearWatch(watchId);
    log('Watcher stream terminated (ID: ' + watchId + ')');
    watchId = null;
    watcherStatus.textContent = 'Inactive';
    watcherStatus.className = 'stat-value status-idle';
    liveDot.className = 'dot-idle';
    watchBtn.disabled = false;
    stopBtn.disabled = true;
    pingBtn.disabled = false;
  }

  /* ---- Clear ---- */
  function clearLog() {
    logList.innerHTML = '';
  }

  /* ---- Reset ---- */
  function resetTelemetry() {
    tLat.textContent = '—';
    tLng.textContent = '—';
    tHeading.textContent = '—';
    tSpeed.textContent = '—';
    tAccuracy.textContent = '—';
    tTime.textContent = '—';
    apiStatus.textContent = 'Idle';
    apiStatus.className = 'stat-value status-idle';
    liveDot.className = 'dot-idle';
  }

  /* ---- Bindings ---- */
  pingBtn.addEventListener('click', ping);
  watchBtn.addEventListener('click', startWatch);
  stopBtn.addEventListener('click', function () {
    stopWatch();
    resetTelemetry();
  });
  clearBtn.addEventListener('click', clearLog);

  /* ---- Boot ---- */
  log('Geolocation API initialized.');
})();
