(function () {
  var APPID = 'YOUR_API_KEY';
  var BASE = 'https://api.openweathermap.org/data/2.5';
  var STORAGE_KEY = 'weather_history';

  /* ---- Mock data ---- */
  var MOCK = {
    current: {
      name: 'London',
      dt: 1717800000,
      weather: [{ main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
      main: { temp: 18.5, humidity: 65, pressure: 1015 },
      wind: { speed: 4.2 },
    },
    forecast: {
      list: (function () {
        var arr = [];
        for (var i = 0; i < 5; i++) {
          var t = Date.now() / 1000 + i * 86400;
          arr.push({
            dt: t,
            temp: { min: 14 + i, max: 20 + i },
            weather: [{ main: 'Clouds', description: 'light clouds', icon: '02d' }],
          });
        }
        return arr;
      })(),
    },
  };

  var ICON_MAP = {
    '01d': '\u2600\uFE0F', '01n': '\uD83C\uDF19',
    '02d': '\u26C5', '02n': '\uD83C\uDF24\uFE0F',
    '03d': '\u2601\uFE0F', '03n': '\u2601\uFE0F',
    '04d': '\u2601\uFE0F', '04n': '\u2601\uFE0F',
    '09d': '\uD83C\uDF27\uFE0F', '09n': '\uD83C\uDF27\uFE0F',
    '10d': '\uD83C\uDF26\uFE0F', '10n': '\uD83C\uDF26\uFE0F',
    '11d': '\u26C8\uFE0F', '11n': '\u26C8\uFE0F',
    '13d': '\u2744\uFE0F', '13n': '\u2744\uFE0F',
    '50d': '\uD83C\uDF2B\uFE0F', '50n': '\uD83C\uDF2B\uFE0F',
  };

  var WEATHER_THEMES = {
    Clear: { grad: ['#0f172a', '#1e293b'], accent: '#f59e0b' },
    Clouds: { grad: ['#0f172a', '#1e293b'], accent: '#64748b' },
    Rain: { grad: ['#0c1220', '#1a2744'], accent: '#3b82f6' },
    Drizzle: { grad: ['#0c1220', '#1a2744'], accent: '#60a5fa' },
    Thunderstorm: { grad: ['#0a0a1a', '#1a1a3a'], accent: '#8b5cf6' },
    Snow: { grad: ['#1a1a2e', '#2a2a4e'], accent: '#e2e8f0' },
    Mist: { grad: ['#0f111a', '#1a1c2e'], accent: '#94a3b8' },
  };

  /* ---- Elements ---- */
  var cityInput = document.getElementById('cityInput');
  var searchBtn = document.getElementById('searchBtn');
  var searchFeedback = document.getElementById('searchFeedback');
  var geoBtn = document.getElementById('geoBtn');
  var historyList = document.getElementById('historyList');
  var curCity = document.getElementById('curCity');
  var curDate = document.getElementById('curDate');
  var curDesc = document.getElementById('curDesc');
  var curTemp = document.getElementById('curTemp');
  var curIcon = document.getElementById('curIcon');
  var curHumidity = document.getElementById('curHumidity');
  var curWind = document.getElementById('curWind');
  var curPressure = document.getElementById('curPressure');
  var forecastGrid = document.getElementById('forecast-grid');
  var spinner = document.getElementById('spinner');

  /* ---- History ---- */
  function loadHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function saveHistory(cities) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cities)); } catch (e) {}
  }

  function addHistory(city) {
    var h = loadHistory();
    h = h.filter(function (c) { return c.toLowerCase() !== city.toLowerCase(); });
    h.unshift(city);
    if (h.length > 8) h = h.slice(0, 8);
    saveHistory(h);
    renderHistory();
  }

  function renderHistory() {
    var h = loadHistory();
    historyList.innerHTML = '';
    h.forEach(function (city) {
      var btn = document.createElement('button');
      btn.className = 'history-chip';
      btn.textContent = city;
      btn.addEventListener('click', function () { fetchWeather(city); });
      historyList.appendChild(btn);
    });
  }

  /* ---- Theme ---- */
  function applyTheme(condition) {
    var theme = WEATHER_THEMES[condition] || WEATHER_THEMES.Clear;
    document.body.style.background = 'linear-gradient(135deg, ' + theme.grad[0] + ', ' + theme.grad[1] + ')';
    document.documentElement.style.setProperty('--accent', theme.accent);
  }

  /* ---- API ---- */
  function showSpinner() { spinner.classList.remove('hidden'); }
  function hideSpinner() { spinner.classList.add('hidden'); }

  function setError(msg) { searchFeedback.textContent = msg; }

  function getIcon(code) { return ICON_MAP[code] || '\u2601\uFE0F'; }

  async function fetchWeather(city) {
    showSpinner();
    setError('');

    var currentData, forecastData;

    try {
      if (APPID === 'YOUR_API_KEY') throw new Error('no key');
      var curUrl = BASE + '/weather?q=' + encodeURIComponent(city) + '&units=metric&appid=' + APPID;
      var fcUrl = BASE + '/forecast?q=' + encodeURIComponent(city) + '&units=metric&appid=' + APPID;

      var [curRes, fcRes] = await Promise.all([
        fetch(curUrl),
        fetch(fcUrl),
      ]);

      if (!curRes.ok || !fcRes.ok) throw new Error('API error');
      currentData = await curRes.json();
      forecastData = await fcRes.json();
    } catch (e) {
      /* fallback to mock */
      currentData = JSON.parse(JSON.stringify(MOCK.current));
      currentData.name = city || 'Unknown';
      forecastData = JSON.parse(JSON.stringify(MOCK.forecast));
    }

    hideSpinner();
    renderCurrent(currentData);
    renderForecast(forecastData);
    addHistory(currentData.name);
    applyTheme(currentData.weather[0].main);
  }

  async function fetchWeatherByCoords(lat, lon) {
    showSpinner();
    setError('');

    try {
      if (APPID === 'YOUR_API_KEY') throw new Error('no key');
      var curUrl = BASE + '/weather?lat=' + lat + '&lon=' + lon + '&units=metric&appid=' + APPID;
      var fcUrl = BASE + '/forecast?lat=' + lat + '&lon=' + lon + '&units=metric&appid=' + APPID;

      var [curRes, fcRes] = await Promise.all([
        fetch(curUrl),
        fetch(fcUrl),
      ]);

      if (!curRes.ok || !fcRes.ok) throw new Error('API error');
      var currentData = await curRes.json();
      var forecastData = await fcRes.json();
      hideSpinner();
      renderCurrent(currentData);
      renderForecast(forecastData);
      addHistory(currentData.name);
      applyTheme(currentData.weather[0].main);
    } catch (e) {
      hideSpinner();
      setError('Could not fetch for coordinates. Using mock.');
      var mock = JSON.parse(JSON.stringify(MOCK.current));
      mock.name = 'Current Location';
      renderCurrent(mock);
      renderForecast(JSON.parse(JSON.stringify(MOCK.forecast)));
      addHistory('Current Location');
      applyTheme(mock.weather[0].main);
    }
  }

  function renderCurrent(d) {
    var w = d.weather[0];
    curCity.textContent = d.name;
    curDate.textContent = new Date(d.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    curDesc.textContent = w.description;
    curTemp.textContent = Math.round(d.main.temp) + '\u00B0C';
    curIcon.textContent = getIcon(w.icon);
    curHumidity.textContent = d.main.humidity + '%';
    curWind.textContent = d.wind.speed + ' m/s';
    curPressure.textContent = d.main.pressure + ' hPa';
  }

  function renderForecast(d) {
    forecastGrid.innerHTML = '';
    var list = d.list || [];

    var seen = {};
    var days = [];

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item.dt_txt && !item.dt_txt.includes('12:00')) continue;
      var date = new Date(item.dt * 1000);
      var key = date.toLocaleDateString('en-CA');
      if (seen[key]) continue;
      seen[key] = true;
      days.push(item);
      if (days.length >= 5) break;
    }

    if (days.length === 0) {
      for (var j = 0; j < list.length && j < 5; j++) {
        days.push(list[j]);
      }
    }

    days.forEach(function (day) {
      var date = new Date(day.dt * 1000);
      var dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      var w = day.weather[0];
      var temp = day.main ? day.main.temp : (day.temp.max + day.temp.min) / 2;

      var card = document.createElement('div');
      card.className = 'forecast-card';
      card.innerHTML =
        '<div class="fc-day">' + dayName + '</div>' +
        '<div class="fc-icon">' + getIcon(w.icon) + '</div>' +
        '<div class="fc-temp">' + Math.round(temp) + '\u00B0 <span>' + Math.round((day.temp && day.temp.min) || (temp - 3)) + '\u00B0</span></div>' +
        '<div class="fc-desc">' + w.description + '</div>';
      forecastGrid.appendChild(card);
    });
  }

  /* ---- Search ---- */
  function handleSearch() {
    var val = cityInput.value.trim();
    if (!val) {
      setError('Enter a city name');
      cityInput.focus();
      return;
    }
    fetchWeather(val);
  }

  searchBtn.addEventListener('click', handleSearch);

  cityInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSearch();
  });

  /* ---- Geolocation ---- */
  geoBtn.addEventListener('click', function () {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (pos) { fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude); },
      function () { setError('Location access denied. Type a city instead.'); }
    );
  });

  /* ---- Bootstrap load from history ---- */
  renderHistory();
  var h = loadHistory();
  if (h.length > 0) { fetchWeather(h[0]); } else { fetchWeather(''); }
})();
