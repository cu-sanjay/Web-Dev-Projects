const input      = document.getElementById('city-input');
const searchBtn  = document.getElementById('search-btn');
const locateBtn  = document.getElementById('locate-btn');
const errorEl    = document.getElementById('error');
const resultEl   = document.getElementById('result');
const unitToggle = document.getElementById('unit-toggle');
const historyEl  = document.getElementById('history');
const forecastEl = document.getElementById('forecast');
const canvas     = document.getElementById('bg-canvas');
const ctx        = canvas.getContext('2d');

// ── WMO code map → [emoji, label, skyTheme, particleType]
const WMO = {
  0:  ['☀️',  'Clear sky',            'clear',  'sun'],
  1:  ['🌤️', 'Mainly clear',         'clear',  'sun'],
  2:  ['⛅',  'Partly cloudy',        'cloudy', 'cloud'],
  3:  ['☁️',  'Overcast',             'cloudy', 'cloud'],
  45: ['🌫️', 'Foggy',                'foggy',  'fog'],
  48: ['🌫️', 'Icy fog',              'foggy',  'fog'],
  51: ['🌦️', 'Light drizzle',        'rainy',  'rain'],
  53: ['🌦️', 'Moderate drizzle',     'rainy',  'rain'],
  55: ['🌧️', 'Dense drizzle',        'rainy',  'rain'],
  61: ['🌧️', 'Slight rain',          'rainy',  'rain'],
  63: ['🌧️', 'Moderate rain',        'rainy',  'rain'],
  65: ['🌧️', 'Heavy rain',           'rainy',  'rain'],
  71: ['🌨️', 'Slight snow',          'snowy',  'snow'],
  73: ['🌨️', 'Moderate snow',        'snowy',  'snow'],
  75: ['❄️',  'Heavy snow',           'snowy',  'snow'],
  80: ['🌦️', 'Rain showers',         'rainy',  'rain'],
  81: ['🌧️', 'Moderate showers',     'rainy',  'rain'],
  82: ['⛈️',  'Violent showers',      'stormy', 'storm'],
  95: ['⛈️',  'Thunderstorm',         'stormy', 'storm'],
  96: ['⛈️',  'Thunderstorm w/ hail', 'stormy', 'storm'],
  99: ['⛈️',  'Thunderstorm w/ hail', 'stormy', 'storm'],
};

// ── State
let tempC     = null;
let feelsC    = null;
let isCelsius = true;
let particles = [];
let animId    = null;
let pType     = null;
let forecastData = [];   // { dayLabel, icon, hi, lo }[]

// ── Unit toggle
unitToggle.addEventListener('click', () => {
  if (tempC === null) return;
  isCelsius = !isCelsius;
  updateTemps();
  renderForecast();
  unitToggle.textContent = isCelsius ? '°F' : '°C';
});

function toF(c) { return Math.round(c * 9 / 5 + 32); }

function updateTemps() {
  const t = isCelsius ? `${Math.round(tempC)}°C` : `${toF(tempC)}°F`;
  const f = isCelsius ? `${Math.round(feelsC)}°C` : `${toF(feelsC)}°F`;
  document.getElementById('temp').textContent = t;
  document.getElementById('feels-like').textContent = `Feels like ${f}`;
}

// ── Search history (localStorage, max 5)
function loadHistory() { return JSON.parse(localStorage.getItem('wf-history') || '[]'); }

function saveHistory(city) {
  let h = loadHistory().filter(c => c.toLowerCase() !== city.toLowerCase());
  h.unshift(city);
  localStorage.setItem('wf-history', JSON.stringify(h.slice(0, 5)));
  renderHistory();
}

function renderHistory() {
  const h = loadHistory();
  historyEl.innerHTML = '';
  h.forEach(city => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = city;
    chip.addEventListener('click', () => { input.value = city; fetchWeather(); });
    historyEl.appendChild(chip);
  });
}

// ── 5-day forecast
function renderForecast() {
  forecastEl.innerHTML = '';
  forecastData.forEach(({ dayLabel, icon, hi, lo }) => {
    const hiDisp = isCelsius ? `${Math.round(hi)}°` : `${toF(hi)}°`;
    const loDisp = isCelsius ? `${Math.round(lo)}°` : `${toF(lo)}°`;
    const div = document.createElement('div');
    div.className = 'forecast-day';
    const daySpan = document.createElement('span');
    daySpan.className = 'f-day';
    daySpan.textContent = dayLabel;
    const iconSpan = document.createElement('span');
    iconSpan.className = 'f-icon';
    iconSpan.textContent = icon;
    const hiSpan = document.createElement('span');
    hiSpan.className = 'f-hi';
    hiSpan.textContent = hiDisp;
    const loSpan = document.createElement('span');
    loSpan.className = 'f-lo';
    loSpan.textContent = loDisp;
    div.append(daySpan, iconSpan, hiSpan, loSpan);
    forecastEl.appendChild(div);
  });
}

// ── Canvas resize
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Particle system
function makeParticle(type) {
  const w = canvas.width, h = canvas.height;
  if (type === 'rain' || type === 'storm')
    return { x: Math.random() * w, y: Math.random() * h - h, len: 12 + Math.random() * 10, speed: 8 + Math.random() * 6, opacity: 0.3 + Math.random() * 0.4 };
  if (type === 'snow')
    return { x: Math.random() * w, y: Math.random() * h - h, r: 2 + Math.random() * 3, speed: 1 + Math.random() * 2, drift: (Math.random() - 0.5) * 0.8, opacity: 0.5 + Math.random() * 0.5 };
  if (type === 'sun')
    return { angle: Math.random() * Math.PI * 2, speed: 0.002 + Math.random() * 0.002, len: 80 + Math.random() * 120, opacity: 0.04 + Math.random() * 0.06 };
  if (type === 'cloud' || type === 'fog')
    return { x: Math.random() * w, y: 40 + Math.random() * (h * 0.5), r: 60 + Math.random() * 80, speed: 0.15 + Math.random() * 0.2, opacity: 0.04 + Math.random() * 0.06 };
  return null;
}

function initParticles(type) {
  pType = type;
  const counts = { rain: 120, storm: 160, snow: 90, sun: 16, cloud: 10, fog: 14 };
  particles = Array.from({ length: counts[type] ?? 0 }, () => makeParticle(type));
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width, h = canvas.height;
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    if (pType === 'rain' || pType === 'storm') {
      ctx.strokeStyle = pType === 'storm' ? '#a0c4ff' : '#90cdf4';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 2, p.y + p.len); ctx.stroke();
      p.y += p.speed; p.x -= 1.5;
      if (p.y > h) { p.y = -p.len; p.x = Math.random() * w; }
    } else if (pType === 'snow') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      p.y += p.speed; p.x += p.drift;
      if (p.y > h) { p.y = -p.r; p.x = Math.random() * w; }
    } else if (pType === 'sun') {
      const cx = w * 0.5, cy = h * 0.28;
      ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(p.angle) * p.len, cy + Math.sin(p.angle) * p.len); ctx.stroke();
      p.angle += p.speed;
    } else if (pType === 'cloud' || pType === 'fog') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      p.x += p.speed;
      if (p.x - p.r > w) p.x = -p.r;
    }
    ctx.restore();
  }
}

function animate() { drawParticles(); animId = requestAnimationFrame(animate); }

function startParticles(type) {
  if (animId) cancelAnimationFrame(animId);
  initParticles(type);
  animate();
}

// ── Sky theme
const SKY_CLASSES = ['sky-clear','sky-cloudy','sky-rainy','sky-snowy','sky-stormy','sky-foggy','sky-night'];
function setSky(theme) {
  document.body.classList.remove(...SKY_CLASSES);
  document.body.classList.add(`sky-${theme}`);
}

function formatLocalTime(timezone) {
  return new Intl.DateTimeFormat('en', {
    timeZone: timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: true
  }).format(new Date());
}

function showError(msg) { errorEl.textContent = msg; errorEl.hidden = false; resultEl.hidden = true; }
function clearError()   { errorEl.hidden = true; errorEl.textContent = ''; }

// ── Core render — accepts lat/lon/name/country/timezone directly
async function renderWeather(latitude, longitude, name, country, timezone) {
  const wxRes  = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,windspeed_10m,weathercode,visibility` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto&forecast_days=6`
  );
  const wxData = await wxRes.json();

  const {
    temperature_2m, apparent_temperature,
    relative_humidity_2m, windspeed_10m,
    weathercode, visibility
  } = wxData.current;

  const [icon, condition, skyTheme, particleType] = WMO[weathercode] ?? ['🌡️', 'Unknown', 'night', null];

  const localHour = new Date(
    new Intl.DateTimeFormat('en', { timeZone: timezone, hour: 'numeric', hour12: false }).format(new Date()) + ':00'
  ).getHours();
  const isNight = localHour >= 20 || localHour < 6;
  const finalSky = isNight && skyTheme === 'clear' ? 'night' : skyTheme;

  // build 5-day forecast (skip today = index 0)
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  forecastData = wxData.daily.time.slice(1, 6).map((dateStr, i) => {
    const idx = i + 1;
    const d = new Date(dateStr + 'T12:00:00');
    const [fi] = WMO[wxData.daily.weathercode[idx]] ?? ['🌡️'];
    return { dayLabel: days[d.getDay()], icon: fi, hi: wxData.daily.temperature_2m_max[idx], lo: wxData.daily.temperature_2m_min[idx] };
  });

  tempC   = temperature_2m;
  feelsC  = apparent_temperature;
  isCelsius = true;
  unitToggle.textContent = '°F';

  document.getElementById('city-name').textContent = `${name}, ${country}`;
  document.getElementById('local-time').textContent = formatLocalTime(timezone);
  document.getElementById('condition-icon').textContent = icon;
  document.getElementById('condition-text').textContent = condition;
  document.getElementById('humidity').textContent = `${relative_humidity_2m}%`;
  document.getElementById('wind').textContent = `${Math.round(windspeed_10m)} km/h`;
  document.getElementById('visibility').textContent =
    visibility != null ? `${(visibility / 1000).toFixed(1)} km` : '—';

  updateTemps();
  renderForecast();
  resultEl.hidden = true;
  requestAnimationFrame(() => { resultEl.hidden = false; });
  setSky(finalSky);
  if (particleType) startParticles(isNight && particleType === 'sun' ? 'cloud' : particleType);
  else if (animId) { cancelAnimationFrame(animId); ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

// ── Fetch by city name
async function fetchWeather() {
  const city = input.value.trim();
  if (!city) return;
  clearError();
  searchBtn.disabled = true;
  searchBtn.textContent = '…';
  try {
    const geoRes  = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const geoData = await geoRes.json();
    if (!geoData.results?.length) { showError('City not found. Try a different name.'); return; }
    const { latitude, longitude, name, country, timezone } = geoData.results[0];
    await renderWeather(latitude, longitude, name, country, timezone);
    saveHistory(name);
  } catch {
    showError('Network error. Please check your connection.');
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search';
  }
}

// ── Fetch by geolocation
locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) { showError('Geolocation is not supported by your browser.'); return; }
  clearError();
  locateBtn.textContent = '⏳';
  locateBtn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const { latitude, longitude } = coords;
        const geoRes  = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
        );
        // Open-Meteo geocoding doesn't do reverse lookup — use open-meteo timezone endpoint instead
        const tzRes   = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&current=weathercode&forecast_days=1`
        );
        const tzData  = await tzRes.json();
        const timezone = tzData.timezone;
        // resolve city name via nominatim (no key, usage policy: 1 req/s)
        const nomRes  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const nomData = await nomRes.json();
        const name    = nomData.address?.city || nomData.address?.town || nomData.address?.village || 'Your location';
        const country = nomData.address?.country_code?.toUpperCase() ?? '';
        input.value   = name;
        await renderWeather(latitude, longitude, name, country, timezone);
        saveHistory(name);
      } catch {
        showError('Could not fetch weather for your location.');
      } finally {
        locateBtn.textContent = '📍';
        locateBtn.disabled = false;
      }
    },
    () => {
      showError('Location access denied.');
      locateBtn.textContent = '📍';
      locateBtn.disabled = false;
    }
  );
});

searchBtn.addEventListener('click', fetchWeather);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') fetchWeather(); });

// ── Init
renderHistory();
