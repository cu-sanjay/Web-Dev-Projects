document.addEventListener('DOMContentLoaded', () => {
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const colonEl = document.getElementById('colon');
  const ampmEl = document.getElementById('ampm');
  const dateDisplayEl = document.getElementById('date-display');
  const daysListEl = document.getElementById('days-list');
  const needleEl = document.getElementById('needle');
  const powerToggle = document.getElementById('power-toggle');
  const clockPanel = document.getElementById('clock-panel');
  const tunerPanel = document.getElementById('tuner-panel');
  
  let isPowerOn = true;

  // Set initial power state styling
  powerToggle.classList.add('on');

  // Toggle power interaction
  powerToggle.addEventListener('click', () => {
    powerToggle.classList.toggle('on');
    isPowerOn = powerToggle.classList.contains('on');
    
    if (isPowerOn) {
      clockPanel.style.opacity = '1';
      tunerPanel.style.opacity = '1';
    } else {
      // Visually shut down the neon glows without breaking layout
      clockPanel.style.opacity = '0.05';
      tunerPanel.style.opacity = '0.05';
      colonEl.classList.remove('blink');
    }
  });

  // State cache to eliminate unnecessary DOM paints
  const state = {
    hours: null,
    minutes: null,
    ampm: null,
    colonBlink: null,
    dateText: null,
    activeDay: null
  };

  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  function updateClock() {
    if (!isPowerOn) return;

    const now = new Date();
    
    let h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();
    
    // Parse the 12-hour format cleanly
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    
    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    
    if (state.hours !== hStr) {
      hoursEl.textContent = hStr;
      state.hours = hStr;
    }
    if (state.minutes !== mStr) {
      minutesEl.textContent = mStr;
      state.minutes = mStr;
    }
    if (state.ampm !== ampm) {
      ampmEl.textContent = ampm;
      state.ampm = ampm;
    }
    
    // Asynchronous colon blinking logic
    const isBlink = (s % 2 === 0);
    if (state.colonBlink !== isBlink) {
      if (isBlink) {
        colonEl.classList.remove('blink');
      } else {
        colonEl.classList.add('blink');
      }
      state.colonBlink = isBlink;
    }

    // Direct string injection for system Date logic (e.g., JUN '26)
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear().toString().slice(-2);
    const dateText = `${month} '${year}`;
    if (state.dateText !== dateText) {
      dateDisplayEl.textContent = dateText;
      state.dateText = dateText;
    }

    // Dynamic daily highlight toggle
    const activeDay = now.getDay();
    if (state.activeDay !== activeDay) {
      const dayElements = daysListEl.querySelectorAll('li');
      dayElements.forEach(el => {
        if (parseInt(el.getAttribute('data-day')) === activeDay) {
          el.classList.add('active-day');
        } else {
          el.classList.remove('active-day');
        }
      });
      state.activeDay = activeDay;
    }

    // Ultra-smooth custom pink needle continuous sweep mapper logic
    // Accurately maps exactly 0-59 seconds to 0%-100% across the track in real-time.
    const totalSeconds = s + (ms / 1000);
    const percentage = (totalSeconds / 60) * 100;
    
    // Using a calc offset (-2px) cleanly aligns half the needle width so it never overflows edges.
    needleEl.style.left = `calc(${percentage}% - 2px)`; 
  }

  // Bind animation loop to browser refresh cycle for buttery visual sync
  function tick() {
    updateClock();
    requestAnimationFrame(tick);
  }
  
  // Ignite Engine
  requestAnimationFrame(tick);
});