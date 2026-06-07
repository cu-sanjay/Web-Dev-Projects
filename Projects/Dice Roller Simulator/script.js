// Select DOM Elements
const diceTray = document.getElementById('diceTray');
const trayViewport = document.getElementById('trayViewport');
const trayInstructions = document.getElementById('trayInstructions');
const themeSelector = document.getElementById('themeSelector');
const forceSlider = document.getElementById('forceSlider');
const forceValue = document.getElementById('forceValue');
const soundToggle = document.getElementById('soundToggle');

const qtyVal = document.getElementById('qtyVal');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const typeButtons = document.querySelectorAll('.type-btn');

const rollBtn = document.getElementById('rollBtn');
const clearBtn = document.getElementById('clearBtn');

const totalSumEl = document.getElementById('totalSum');
const sessionAverageEl = document.getElementById('sessionAverage');
const frequencyChart = document.getElementById('frequencyChart');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Simulator State
let diceType = 'D6';
let diceQuantity = 2;
let throwForce = 'Medium';
let rollHistory = [];
let frequencyCounts = {};

// Initialize Frequency mapping
function resetFrequencies() {
  frequencyCounts = {};
  const maxVal = getDiceMaxVal(diceType);
  for (let i = 1; i <= maxVal; i++) {
    frequencyCounts[i] = 0;
  }
}

function getDiceMaxVal(type) {
  return parseInt(type.substring(1)) || 6;
}

// Dynamic Audio Synthesis Engine using Web Audio API
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTumbleSound() {
  if (!soundToggle.checked) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.35);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start(now);
  } catch (e) {
    console.warn('Audio synth failed:', e);
  }
}

function playImpactSound() {
  if (!soundToggle.checked) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.07);
    
    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.005, now + 0.07);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.07);
  } catch (e) {
    console.warn('Audio synth failed:', e);
  }
}

// 3D D6 Matrix Rotation Calculations
function getD6Rotations(val) {
  const baseRotations = {
    1: { x: 0, y: 0 },
    2: { x: -90, y: 0 },
    3: { x: 0, y: -90 },
    4: { x: 0, y: 90 },
    5: { x: 90, y: 0 },
    6: { x: 0, y: 180 }
  };
  const base = baseRotations[val] || { x: 0, y: 0 };
  const spins = getSpinMultiples();
  return `rotateX(${base.x + spins.x}deg) rotateY(${base.y + spins.y}deg) rotateZ(${spins.z}deg)`;
}

function getSpinMultiples() {
  let multiplier = 2;
  if (throwForce === 'Low') multiplier = 1;
  if (throwForce === 'High') multiplier = 4;
  
  const xSpins = 360 * (Math.floor(Math.random() * 3) + multiplier);
  const ySpins = 360 * (Math.floor(Math.random() * 3) + multiplier);
  const zSpins = 360 * (Math.floor(Math.random() * 3) + multiplier);
  return { x: xSpins, y: ySpins, z: zSpins };
}

// SVG Polyhedral RPG dice rendering
function getPolyhedralSVG(type, rollVal) {
  let shapePath = '';
  switch (type) {
    case 'D4':
      shapePath = '<polygon points="50,8 92,82 8,82" />';
      break;
    case 'D8':
      shapePath = '<polygon points="50,6 88,50 50,94 12,50" /><line x1="12" y1="50" x2="88" y2="50" /><line x1="50" y1="6" x2="50" y2="94" />';
      break;
    case 'D10':
      shapePath = '<polygon points="50,6 84,36 50,94 16,36" /><line x1="50" y1="6" x2="50" y2="94" /><line x1="16" y1="36" x2="84" y2="36" />';
      break;
    case 'D12':
      shapePath = '<polygon points="50,6 90,36 75,84 25,84 10,36" />';
      break;
    case 'D20':
      shapePath = '<polygon points="50,6 88,28 88,72 50,94 12,72 12,28" /><line x1="12" y1="28" x2="88" y2="28" /><line x1="12" y1="72" x2="88" y2="72" /><line x1="50" y1="6" x2="50" y2="94" />';
      break;
  }
  return `
    <svg class="poly-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${shapePath}
    </svg>
    <span class="poly-text">${rollVal}</span>
  `;
}

// Populate Frequency Chart DOM
function updateFrequencyChart() {
  frequencyChart.innerHTML = '';
  const maxVal = getDiceMaxVal(diceType);
  const counts = Object.values(frequencyCounts);
  const maxCount = Math.max(...counts, 1);
  
  for (let i = 1; i <= maxVal; i++) {
    const count = frequencyCounts[i] || 0;
    const percent = Math.round((count / maxCount) * 100);
    
    const row = document.createElement('div');
    row.className = 'frequency-row';
    row.innerHTML = `
      <span class="freq-num">${diceType === 'D6' ? '⚀⚁⚂⚃⚄⚅'[i-1] : i}</span>
      <div class="freq-bar-track">
        <div class="freq-bar-fill" style="width: ${percent}%"></div>
      </div>
      <span class="freq-count">${count}</span>
    `;
    frequencyChart.appendChild(row);
  }
}

// Add roll entry to history list
function addHistoryItem(item) {
  if (historyList.querySelector('.empty-history-msg')) {
    historyList.innerHTML = '';
  }
  
  const historyRow = document.createElement('div');
  historyRow.className = 'history-item';
  
  const rollsJoined = item.rolls.join(', ');
  const dateStr = new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  historyRow.innerHTML = `
    <div class="hist-meta">
      <strong>${item.qty}x${item.type}</strong> (${rollsJoined}) <span style="font-size:0.65rem; color:var(--text-muted); margin-left:6px;">${dateStr}</span>
    </div>
    <div class="hist-sum">${item.sum}</div>
  `;
  
  historyList.insertBefore(historyRow, historyList.firstChild);
}

// Calculate session total statistics
function updateStats() {
  if (rollHistory.length === 0) {
    totalSumEl.textContent = '0';
    sessionAverageEl.textContent = '0.0';
    return;
  }
  
  const latestSum = rollHistory[0].sum;
  totalSumEl.textContent = latestSum;
  
  const totalRolledCount = rollHistory.reduce((sum, item) => sum + item.rolls.length, 0);
  const totalRolledSum = rollHistory.reduce((sum, item) => sum + item.rolls.reduce((s, val) => s + val, 0), 0);
  const average = totalRolledSum / totalRolledCount;
  
  sessionAverageEl.textContent = average.toFixed(1);
}

// Clear the dice tray
function clearTray() {
  trayViewport.innerHTML = '';
  trayInstructions.classList.remove('hidden');
}

// Main Roll Trigger Action
function rollDice() {
  trayInstructions.classList.add('hidden');
  trayViewport.innerHTML = '';
  
  const trayWidth = diceTray.clientWidth - 80;
  const trayHeight = diceTray.clientHeight - 80;
  
  const maxVal = getDiceMaxVal(diceType);
  const currentRolls = [];
  let rollSum = 0;
  
  // Audio trigger
  playTumbleSound();
  
  for (let i = 0; i < diceQuantity; i++) {
    const rolledVal = Math.floor(Math.random() * maxVal) + 1;
    currentRolls.push(rolledVal);
    rollSum += rolledVal;
    
    // Add to frequencies
    frequencyCounts[rolledVal] = (frequencyCounts[rolledVal] || 0) + 1;
    
    // Position coordinates
    const leftPos = Math.random() * (trayWidth - 20) + 20;
    const topPos = Math.random() * (trayHeight - 20) + 20;
    const angleRotation = Math.random() * 45 - 22.5; // slight random landing angle for polyhedrals
    
    const dieContainer = document.createElement('div');
    dieContainer.style.left = `${leftPos}px`;
    dieContainer.style.top = `${topPos}px`;
    
    if (diceType === 'D6') {
      dieContainer.className = 'die-d6 rolling-animation';
      dieContainer.innerHTML = `
        <div class="face front"><div class="face-grid"><div class="pip pip-c"></div></div></div>
        <div class="face back"><div class="face-grid"><div class="pip pip-tl"></div><div class="pip pip-br"></div></div></div>
        <div class="face right"><div class="face-grid"><div class="pip pip-tl"></div><div class="pip pip-c"></div><div class="pip pip-br"></div></div></div>
        <div class="face left"><div class="face-grid"><div class="pip pip-tl"></div><div class="pip pip-tr"></div><div class="pip pip-bl"></div><div class="pip pip-br"></div></div></div>
        <div class="face top"><div class="face-grid"><div class="pip pip-tl"></div><div class="pip pip-tr"></div><div class="pip pip-c"></div><div class="pip pip-bl"></div><div class="pip pip-br"></div></div></div>
        <div class="face bottom"><div class="face-grid"><div class="pip pip-tl"></div><div class="pip pip-tr"></div><div class="pip pip-ml"></div><div class="pip pip-mr"></div><div class="pip pip-bl"></div><div class="pip pip-br"></div></div></div>
      `;
      
      const targetTransform = getD6Rotations(rolledVal);
      // Wait for rolling tumbling transition to finish before settling rotation
      setTimeout(() => {
        dieContainer.classList.remove('rolling-animation');
        dieContainer.style.transform = targetTransform;
        playImpactSound();
      }, 700);
    } else {
      dieContainer.className = 'polyhedral-die rolling-animation';
      dieContainer.innerHTML = getPolyhedralSVG(diceType, rolledVal);
      
      setTimeout(() => {
        dieContainer.classList.remove('rolling-animation');
        dieContainer.style.transform = `rotate(${angleRotation}deg)`;
        playImpactSound();
      }, 700);
    }
    
    trayViewport.appendChild(dieContainer);
  }
  
  // Register roll in history log
  const newHistoryRecord = {
    type: diceType,
    qty: diceQuantity,
    rolls: currentRolls,
    sum: rollSum,
    date: Date.now()
  };
  
  rollHistory.unshift(newHistoryRecord);
  
  // Save roll to localStorage cache
  localStorage.setItem('forge_roll_history', JSON.stringify(rollHistory.slice(0, 50)));
  
  // UI updates
  setTimeout(() => {
    addHistoryItem(newHistoryRecord);
    updateStats();
    updateFrequencyChart();
  }, 700);
}

// Initialize and Bind Events
function init() {
  // Theme load
  const activeTheme = localStorage.getItem('forge_theme') || 'obsidian';
  document.documentElement.setAttribute('data-theme', activeTheme);
  themeSelector.value = activeTheme;
  
  // History restore
  try {
    const cachedHistory = localStorage.getItem('forge_roll_history');
    if (cachedHistory) {
      rollHistory = JSON.parse(cachedHistory);
      // Load restore stats and timeline UI
      rollHistory.slice().reverse().forEach(item => addHistoryItem(item));
      
      // Calculate frequencies from restored history
      resetFrequencies();
      rollHistory.forEach(item => {
        if (item.type === diceType) {
          item.rolls.forEach(val => {
            if (frequencyCounts[val] !== undefined) {
              frequencyCounts[val]++;
            }
          });
        }
      });
      updateStats();
      updateFrequencyChart();
    } else {
      resetFrequencies();
      updateFrequencyChart();
    }
  } catch (e) {
    rollHistory = [];
    resetFrequencies();
    updateFrequencyChart();
  }
  
  // Qty selectors listeners
  qtyMinus.addEventListener('click', () => {
    if (diceQuantity > 1) {
      diceQuantity--;
      qtyVal.textContent = diceQuantity;
    }
  });
  qtyPlus.addEventListener('click', () => {
    if (diceQuantity < 6) {
      diceQuantity++;
      qtyVal.textContent = diceQuantity;
    }
  });
  
  // Dice type selectors listeners
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      diceType = btn.getAttribute('data-type');
      resetFrequencies();
      updateFrequencyChart();
    });
  });
  
  // Theme switcher dropdown listener
  themeSelector.addEventListener('change', (e) => {
    const selected = e.target.value;
    document.documentElement.setAttribute('data-theme', selected);
    localStorage.setItem('forge_theme', selected);
  });
  
  // Slider strength logic
  forceSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    const forceStrings = { 1: 'Low', 2: 'Medium', 3: 'High' };
    throwForce = forceStrings[val];
    forceValue.textContent = throwForce;
  });
  
  // Action roll triggers
  rollBtn.addEventListener('click', rollDice);
  clearBtn.addEventListener('click', clearTray);
  
  // Clicking tray rolls dice
  diceTray.addEventListener('click', (e) => {
    if (e.target === diceTray || e.target === trayViewport || e.target === trayInstructions) {
      rollDice();
    }
  });
  
  // Bind spacebar key
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement.tagName !== 'BUTTON' && document.activeElement.tagName !== 'SELECT' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      rollDice();
    }
  });
  
  // Reset History logs click listener
  clearHistoryBtn.addEventListener('click', () => {
    rollHistory = [];
    localStorage.removeItem('forge_roll_history');
    historyList.innerHTML = '<p class="empty-history-msg">No rolls registered yet.</p>';
    resetFrequencies();
    updateStats();
    updateFrequencyChart();
  });
}

init();
