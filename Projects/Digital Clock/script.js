document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const colonEl = document.getElementById('colon');
  const ampmEl = document.getElementById('ampm-indicator');
  const dateDisplayEl = document.getElementById('date-display');
  const daysGridEl = document.getElementById('days-grid');
  const secondsProgressEl = document.getElementById('seconds-progress');
  const timezoneLabelEl = document.getElementById('timezone-label');
  const secondsWrapperEl = document.getElementById('seconds-wrapper');
  
  // Controls
  const powerToggle = document.getElementById('power-toggle');
  const formatToggle = document.getElementById('format-toggle');
  const secondsToggle = document.getElementById('seconds-toggle');
  const colonToggle = document.getElementById('colon-toggle');
  const timezoneSelect = document.getElementById('timezone-select');
  const themeDots = document.querySelectorAll('.theme-dot');
  const clockCard = document.getElementById('clock-card');
  const statusText = document.getElementById('status-text');

  // Load configuration state from localStorage or default
  const config = {
    power: localStorage.getItem('qc_power') !== 'off',
    format24h: localStorage.getItem('qc_format') === '24h',
    showSeconds: localStorage.getItem('qc_seconds') !== 'off',
    smoothColon: localStorage.getItem('qc_colon') !== 'off',
    timezone: localStorage.getItem('qc_timezone') || 'local',
    theme: localStorage.getItem('qc_theme') || 'cyan'
  };

  // State cache to minimize DOM updates
  const state = {
    hours: null,
    minutes: null,
    seconds: null,
    ampm: null,
    dateText: null,
    activeDay: null,
    timezoneText: null
  };

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  // Initialize UI controls based on config
  function initUI() {
    // Power Toggle styling
    if (config.power) {
      powerToggle.classList.add('active');
    } else {
      powerToggle.classList.remove('active');
      setClockOpacity(false);
    }

    // Settings switches styling
    setSwitchState(formatToggle, config.format24h);
    setSwitchState(secondsToggle, config.showSeconds);
    setSwitchState(colonToggle, config.smoothColon);

    // Dropdown selection
    timezoneSelect.value = config.timezone;

    // Theme preset
    applyTheme(config.theme);
    themeDots.forEach(dot => {
      if (dot.dataset.theme === config.theme) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Seconds display layout
    secondsWrapperEl.style.display = config.showSeconds ? 'inline-flex' : 'none';

    // Colon animation configuration
    if (config.smoothColon) {
      colonEl.classList.remove('no-blink');
    } else {
      colonEl.classList.add('no-blink');
    }
  }

  function setSwitchState(el, isActive) {
    if (isActive) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  }

  function setClockOpacity(isOn) {
    const timeWrapper = document.getElementById('time-display-wrapper');
    const ampmIndicator = document.getElementById('ampm-indicator');
    const secondsProgress = document.getElementById('seconds-progress');
    
    if (isOn) {
      timeWrapper.style.opacity = '1';
      ampmIndicator.style.opacity = '1';
      secondsProgress.style.opacity = '1';
      statusText.textContent = "LIVE SYNCED";
    } else {
      timeWrapper.style.opacity = '0.08';
      ampmIndicator.style.opacity = '0.08';
      secondsProgress.style.opacity = '0.08';
      statusText.textContent = "STANDBY";
    }
  }

  function applyTheme(themeName) {
    document.body.className = '';
    document.body.classList.add(`theme-${themeName}`);
    config.theme = themeName;
    localStorage.setItem('qc_theme', themeName);
  }

  // Bind Switch Event Listeners
  powerToggle.addEventListener('click', () => {
    config.power = !config.power;
    localStorage.setItem('qc_power', config.power ? 'on' : 'off');
    powerToggle.classList.toggle('active');
    setClockOpacity(config.power);
  });

  formatToggle.addEventListener('click', () => {
    if (!config.power) return;
    config.format24h = !config.format24h;
    localStorage.setItem('qc_format', config.format24h ? '24h' : '12h');
    formatToggle.classList.toggle('active');
  });

  secondsToggle.addEventListener('click', () => {
    if (!config.power) return;
    config.showSeconds = !config.showSeconds;
    localStorage.setItem('qc_seconds', config.showSeconds ? 'on' : 'off');
    secondsToggle.classList.toggle('active');
    secondsWrapperEl.style.display = config.showSeconds ? 'inline-flex' : 'none';
  });

  colonToggle.addEventListener('click', () => {
    if (!config.power) return;
    config.smoothColon = !config.smoothColon;
    localStorage.setItem('qc_colon', config.smoothColon ? 'on' : 'off');
    colonToggle.classList.toggle('active');
    
    if (config.smoothColon) {
      colonEl.classList.remove('no-blink');
    } else {
      colonEl.classList.add('no-blink');
    }
  });

  timezoneSelect.addEventListener('change', (e) => {
    if (!config.power) return;
    config.timezone = e.target.value;
    localStorage.setItem('qc_timezone', config.timezone);
  });

  themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      themeDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      applyTheme(dot.dataset.theme);
    });
  });

  // Calculate local/timezone Date properties
  function getZonedDate() {
    const now = new Date();
    if (config.timezone === 'local') {
      return { date: now, label: getLocalTimezoneLabel() };
    }
    
    try {
      // Create formatter options
      const options = {
        timeZone: config.timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      };
      
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(now);
      
      // Map components
      const map = {};
      parts.forEach(p => { map[p.type] = p.value; });
      
      const zoned = new Date(
        parseInt(map.year),
        parseInt(map.month) - 1,
        parseInt(map.day),
        parseInt(map.hour) === 24 ? 0 : parseInt(map.hour),
        parseInt(map.minute),
        parseInt(map.second)
      );

      // Label Generation
      let label = config.timezone.split('/').pop().replace('_', ' ');
      return { date: zoned, label };
    } catch (e) {
      return { date: now, label: "UTC" };
    }
  }

  function getLocalTimezoneLabel() {
    try {
      const offset = new Date().getTimezoneOffset();
      const absOffset = Math.abs(offset);
      const hours = Math.floor(absOffset / 60).toString().padStart(2, '0');
      const mins = (absOffset % 60).toString().padStart(2, '0');
      const sign = offset <= 0 ? '+' : '-';
      return `UTC${sign}${hours}:${mins}`;
    } catch (e) {
      return "LOCAL";
    }
  }

  // Update loop
  function updateClock() {
    if (!config.power) return;

    const { date, label } = getZonedDate();
    
    let h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    
    // Parse formatting config
    let hStr = "";
    let ampm = "";

    if (config.format24h) {
      hStr = h.toString().padStart(2, '0');
      ampm = "24H";
    } else {
      const ampmVal = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      hStr = h.toString().padStart(2, '0');
      ampm = ampmVal;
    }
    
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');
    
    // Perform DOM updates conditionally via the state cache
    if (state.hours !== hStr) {
      hoursEl.textContent = hStr;
      state.hours = hStr;
    }
    if (state.minutes !== mStr) {
      minutesEl.textContent = mStr;
      state.minutes = mStr;
    }
    if (state.seconds !== sStr) {
      secondsEl.textContent = sStr;
      state.seconds = sStr;
    }
    if (state.ampm !== ampm) {
      ampmEl.textContent = ampm;
      state.ampm = ampm;
    }
    if (state.timezoneText !== label) {
      timezoneLabelEl.textContent = label;
      state.timezoneText = label;
    }

    // Dynamic progress bar update
    const progressWidth = (s / 60) * 100;
    secondsProgressEl.style.width = `${progressWidth}%`;

    // Dynamic Calendar update
    const month = monthNames[date.getMonth()];
    const dayOfMonth = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const dateText = `${month} ${dayOfMonth}, ${year}`;
    
    if (state.dateText !== dateText) {
      dateDisplayEl.textContent = dateText;
      state.dateText = dateText;
    }

    // Highlight active day
    const activeDay = date.getDay();
    if (state.activeDay !== activeDay) {
      const dayElements = daysGridEl.querySelectorAll('span');
      dayElements.forEach(el => {
        if (parseInt(el.getAttribute('data-day')) === activeDay) {
          el.classList.add('active-day');
        } else {
          el.classList.remove('active-day');
        }
      });
      state.activeDay = activeDay;
    }
  }

  // Animation Loop
  function tick() {
    updateClock();
    requestAnimationFrame(tick);
  }

  // Initialize and run
  initUI();
  tick();
});