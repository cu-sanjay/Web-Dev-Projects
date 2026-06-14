// State Management
let state = {
  medications: [],
  logs: {},
  streak: 0,
  currentTheme: 'dark',
  activeAlarm: null
};

// DOM Elements
const sections = document.querySelectorAll('.tab-content');
const navButtons = document.querySelectorAll('.nav-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');
const greetingText = document.getElementById('greeting-text');
const currentDateText = document.getElementById('current-date-text');
const headerTimeText = document.getElementById('header-time-text');
const compliancePercentage = document.getElementById('compliance-percentage');
const complianceFraction = document.getElementById('compliance-fraction');
const complianceRing = document.getElementById('compliance-ring');
const streakCount = document.getElementById('streak-count');
const lowStockCount = document.getElementById('low-stock-count');
const lowStockDesc = document.getElementById('low-stock-desc');
const todayTimelineList = document.getElementById('today-timeline-list');
const medicationForm = document.getElementById('medication-form');
const addTimeRowBtn = document.getElementById('add-time-row-btn');
const timesListContainer = document.getElementById('times-list-container');
const inventoryTableBody = document.getElementById('inventory-table-body');
const statsTotalTaken = document.getElementById('stats-total-taken');
const statsTotalSkipped = document.getElementById('stats-total-skipped');
const weeklyComplianceHistory = document.getElementById('weekly-compliance-history');
const nextReminderText = document.getElementById('next-reminder-text');
const nextReminderTime = document.getElementById('next-reminder-time');

// Pill Customizer preview elements
const previewShape = document.getElementById('preview-shape');
const colorDots = document.querySelectorAll('.color-dot');
const pillShapeInputs = document.querySelectorAll('input[name="pill-shape"]');

// Modal Alarm Elements
const alarmModal = document.getElementById('alarm-modal');
const modalPillShape = document.getElementById('modal-pill-shape');
const modalMedDetails = document.getElementById('modal-med-details');
const modalReminderTime = document.getElementById('modal-reminder-time');
const modalMedNotes = document.getElementById('modal-med-notes');
const modalTakenBtn = document.getElementById('modal-taken-btn');
const modalSkipBtn = document.getElementById('modal-skip-btn');

// Sound synthesis using Web Audio API
let audioCtx = null;
let alarmInterval = null;

function playAlarmSound() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  // Create synth beeping pattern
  let time = audioCtx.currentTime;
  let osc = audioCtx.createOscillator();
  let gainNode = audioCtx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, time); // A5 note
  
  gainNode.gain.setValueAtTime(0, time);
  gainNode.gain.linearRampToValueAtTime(0.3, time + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, time + 0.3);
  
  osc.start(time);
  osc.stop(time + 0.4);
}

function startAlarm() {
  playAlarmSound();
  alarmInterval = setInterval(playAlarmSound, 1500);
}

function stopAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  initializeUI();
  updateTime();
  setInterval(updateTime, 1000);
  checkReminders();
  setInterval(checkReminders, 15000); // Check alarms every 15s
  lucide.createIcons();
});

// Load state from local storage
function loadFromLocalStorage() {
  const data = localStorage.getItem('pillsmart_state');
  if (data) {
    try {
      state = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse state", e);
    }
  } else {
    // Seed sample data for first-time use
    state.medications = [
      {
        id: 'sample_1',
        name: 'Lipitor',
        dosage: '10mg',
        pillShape: 'tablet',
        pillColor: 'blue',
        days: [0, 1, 2, 3, 4, 5, 6],
        times: ['08:00'],
        stock: 30,
        lowAlert: 7,
        notes: 'Take in the morning with a glass of water.'
      },
      {
        id: 'sample_2',
        name: 'Multivitamin',
        dosage: '1 tablet',
        pillShape: 'capsule',
        pillColor: 'yellow',
        days: [0, 2, 4, 6],
        times: ['12:30'],
        stock: 5,
        lowAlert: 6,
        notes: 'Keep in pill organizer.'
      }
    ];
    state.logs = {};
    state.streak = 2;
    state.currentTheme = 'dark';
    saveToLocalStorage();
  }
  
  // Set theme early
  document.documentElement.setAttribute('data-theme', state.currentTheme);
}

function saveToLocalStorage() {
  localStorage.setItem('pillsmart_state', JSON.stringify(state));
}

// UI Initialization
function initializeUI() {
  // Set Date display
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateText.textContent = new Date().toLocaleDateString(undefined, options);

  // Setup Nav Buttons
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      switchTab(target);
    });
  });

  // Setup Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);
  updateThemeIcon();

  // Greeting based on time
  const hour = new Date().getHours();
  if (hour < 12) greetingText.textContent = "Good Morning!";
  else if (hour < 18) greetingText.textContent = "Good Afternoon!";
  else greetingText.textContent = "Good Evening!";

  // Setup Form dynamically adding time rows
  addTimeRowBtn.addEventListener('click', () => {
    addTimeInputRow('');
  });

  // Color picker selection inside form
  colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      colorDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      updatePillPreview();
    });
  });

  // Pill shape selection change preview
  pillShapeInputs.forEach(input => {
    input.addEventListener('change', updatePillPreview);
  });

  // Submit Medication form
  medicationForm.addEventListener('submit', handleFormSubmit);

  // Export / Backup handler
  document.getElementById('export-data-btn').addEventListener('click', exportData);
  document.getElementById('import-data-btn-trigger').addEventListener('click', () => {
    document.getElementById('import-data-file').click();
  });
  document.getElementById('import-data-file').addEventListener('change', importData);

  // Modal actions
  modalTakenBtn.addEventListener('click', () => handleModalDose('taken'));
  modalSkipBtn.addEventListener('click', () => handleModalDose('skipped'));

  // Initial stats and list rendering
  renderAll();
}

function switchTab(tabId) {
  sections.forEach(sec => sec.classList.remove('active'));
  navButtons.forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  const activeBtn = Array.from(navButtons).find(btn => btn.getAttribute('data-target') === tabId);
  if (activeBtn) activeBtn.classList.add('active');

  // Specific tab entry handlers
  if (tabId === 'inventory-section') renderInventory();
  if (tabId === 'analytics-section') renderAnalytics();
  if (tabId === 'dashboard-section') renderDashboardTimeline();
}

function toggleTheme() {
  state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.currentTheme);
  saveToLocalStorage();
  updateThemeIcon();
}

function updateThemeIcon() {
  if (state.currentTheme === 'light') {
    themeIcon.setAttribute('data-lucide', 'sun');
  } else {
    themeIcon.setAttribute('data-lucide', 'moon');
  }
  lucide.createIcons();
}

// Clock Header updates
function updateTime() {
  const now = new Date();
  headerTimeText.textContent = now.toLocaleTimeString();
}

// Live Pill Designer Form Preview
function updatePillPreview() {
  const activeColorDot = document.querySelector('.color-dot.active');
  const activeColor = activeColorDot ? activeColorDot.getAttribute('data-color') : 'red';
  
  const activeShapeInput = document.querySelector('input[name="pill-shape"]:checked');
  const activeShape = activeShapeInput ? activeShapeInput.value : 'tablet';

  // Apply CSS color helper classes to shape preview
  previewShape.className = `pill-shape ${activeShape} bg-pill-${activeColor}`;
}

// Dynamic timing input helper
function addTimeInputRow(val) {
  const row = document.createElement('div');
  row.className = 'time-input-row';
  
  const input = document.createElement('input');
  input.type = 'time';
  input.className = 'reminder-time-input';
  input.required = true;
  input.value = val || '08:00';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'icon-btn remove-time-btn';
  removeBtn.innerHTML = '<i data-lucide="trash-2"></i>';
  removeBtn.addEventListener('click', () => {
    row.remove();
    toggleTimeRemoveButtons();
  });

  row.appendChild(input);
  row.appendChild(removeBtn);
  timesListContainer.appendChild(row);
  
  lucide.createIcons();
  toggleTimeRemoveButtons();
}

function toggleTimeRemoveButtons() {
  const rows = timesListContainer.querySelectorAll('.time-input-row');
  rows.forEach(r => {
    const btn = r.querySelector('.remove-time-btn');
    btn.style.display = rows.length > 1 ? 'flex' : 'none';
  });
}

// Form Submission handling
function handleFormSubmit(e) {
  e.preventDefault();

  const activeColorDot = document.querySelector('.color-dot.active');
  const color = activeColorDot ? activeColorDot.getAttribute('data-color') : 'red';
  const shape = document.querySelector('input[name="pill-shape"]:checked').value;

  const selectedDays = Array.from(document.querySelectorAll('.days-selector input:checked')).map(i => parseInt(i.value));
  const reminderTimes = Array.from(document.querySelectorAll('.reminder-time-input')).map(i => i.value).sort();

  const stockInput = document.getElementById('med-stock').value;
  const lowInput = document.getElementById('med-low-alert').value;

  const newMed = {
    id: 'med_' + Date.now(),
    name: document.getElementById('med-name').value.trim(),
    dosage: document.getElementById('med-dosage').value.trim(),
    pillShape: shape,
    pillColor: color,
    days: selectedDays.length > 0 ? selectedDays : [0, 1, 2, 3, 4, 5, 6],
    times: reminderTimes,
    stock: stockInput !== '' ? parseInt(stockInput) : null,
    lowAlert: lowInput !== '' ? parseInt(lowInput) : null,
    notes: document.getElementById('med-notes').value.trim()
  };

  state.medications.push(newMed);
  saveToLocalStorage();
  
  // Reset form
  medicationForm.reset();
  timesListContainer.innerHTML = '';
  addTimeInputRow('08:00');
  
  switchTab('dashboard-section');
  renderAll();
}

// Render Dashboard & Scheduler items
function renderAll() {
  renderDashboardTimeline();
  renderNextReminder();
}

function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getTodayDayOfWeek() {
  return new Date().getDay();
}

function renderDashboardTimeline() {
  todayTimelineList.innerHTML = '';
  
  const todayStr = getTodayDateString();
  const dayOfWeek = getTodayDayOfWeek();
  
  // Find medications scheduled for today
  let todayDoses = [];
  
  state.medications.forEach(med => {
    if (med.days.includes(dayOfWeek)) {
      med.times.forEach(time => {
        todayDoses.push({
          med,
          time,
          doseId: `${med.id}_${time}`
        });
      });
    }
  });

  // Sort chronologically by time
  todayDoses.sort((a, b) => a.time.localeCompare(b.time));

  // If no doses scheduled
  if (todayDoses.length === 0) {
    todayTimelineList.innerHTML = `
      <div class="empty-state">
        <i data-lucide="clipboard-list"></i>
        <p>No medications scheduled for today.</p>
        <button class="btn primary-btn" onclick="switchTab('add-med-section')">Add Medication</button>
      </div>
    `;
    lucide.createIcons();
    updateComplianceStats(0, 0);
    return;
  }

  // Ensure dynamic log entries exist for today
  if (!state.logs[todayStr]) {
    state.logs[todayStr] = {};
  }
  
  let takenCount = 0;
  todayDoses.forEach(dose => {
    const logVal = state.logs[todayStr][dose.doseId] || 'pending';
    if (logVal === 'taken') takenCount++;
    
    const item = document.createElement('div');
    item.className = `timeline-item ${logVal}`;
    item.innerHTML = `
      <div class="item-left">
        <div class="item-time-badge">${formatTimeString(dose.time)}</div>
        <div class="item-details">
          <h4>${dose.med.name}</h4>
          <p><i data-lucide="info" style="width: 12px; height: 12px;"></i> ${dose.med.dosage} · ${dose.med.notes || 'No notes'}</p>
        </div>
      </div>
      <div class="item-right">
        <div class="status-pill ${logVal}">${logVal}</div>
        <button class="check-btn ${logVal === 'taken' ? 'active' : ''}" title="Mark Taken" onclick="toggleDoseState('${dose.doseId}', 'taken')">
          <i data-lucide="check"></i>
        </button>
        <button class="skip-btn-small ${logVal === 'skipped' ? 'active' : ''}" title="Mark Skipped" onclick="toggleDoseState('${dose.doseId}', 'skipped')">
          <i data-lucide="x"></i>
        </button>
      </div>
    `;
    todayTimelineList.appendChild(item);
  });

  lucide.createIcons();
  updateComplianceStats(takenCount, todayDoses.length);
  renderStreak();
  renderLowStockAlerts();
}

function formatTimeString(timeStr) {
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

// Compliance Rate Calculations
function updateComplianceStats(taken, total) {
  complianceFraction.textContent = `${taken} / ${total} doses taken`;
  const pct = total > 0 ? Math.round((taken / total) * 100) : 0;
  compliancePercentage.textContent = `${pct}%`;
  
  // Set circular progress ring animation offset
  const circle = complianceRing;
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

// Log checklist toggle taken/skipped/pending
window.toggleDoseState = function(doseId, targetState) {
  const todayStr = getTodayDateString();
  const currentVal = state.logs[todayStr][doseId];
  
  // Split medId
  const medId = doseId.split('_')[0];
  const med = state.medications.find(m => m.id === medId);

  // If toggling off
  if (currentVal === targetState) {
    state.logs[todayStr][doseId] = 'pending';
    // refund inventory
    if (targetState === 'taken' && med && med.stock !== null) {
      med.stock++;
    }
  } else {
    // subtract stock if marking as taken
    if (targetState === 'taken' && currentVal !== 'taken' && med && med.stock !== null && med.stock > 0) {
      med.stock--;
    }
    // refund if switching away from taken
    if (currentVal === 'taken' && targetState !== 'taken' && med && med.stock !== null) {
      med.stock++;
    }
    state.logs[todayStr][doseId] = targetState;
  }
  
  saveToLocalStorage();
  renderAll();
  calculateStreak();
};

// Streak Calculation Logic
function calculateStreak() {
  let streak = 0;
  const dates = Object.keys(state.logs).sort().reverse();
  const todayStr = getTodayDateString();
  
  // Check daily compliance records going backward
  for (let i = 0; i < dates.length; i++) {
    const dateStr = dates[i];
    const log = state.logs[dateStr];
    
    // Check if all scheduled doses for that date are completed
    const dayOfWeek = new Date(dateStr).getDay();
    let scheduledCount = 0;
    let takenCount = 0;

    state.medications.forEach(med => {
      if (med.days.includes(dayOfWeek)) {
        med.times.forEach(t => {
          scheduledCount++;
          if (log[`${med.id}_${t}`] === 'taken') {
            takenCount++;
          }
        });
      }
    });

    if (scheduledCount > 0) {
      if (takenCount === scheduledCount) {
        streak++;
      } else if (dateStr !== todayStr) {
        // Break streak if not today and compliance isn't 100%
        break;
      }
    }
  }
  
  state.streak = streak;
  saveToLocalStorage();
  renderStreak();
}

function renderStreak() {
  streakCount.textContent = `${state.streak} Days`;
}

// Low Stock Alerts widget checks
function renderLowStockAlerts() {
  let lowCount = 0;
  state.medications.forEach(med => {
    if (med.stock !== null && med.lowAlert !== null && med.stock <= med.lowAlert) {
      lowCount++;
    }
  });

  lowStockCount.textContent = `${lowCount} Low`;
  const alertIcon = document.getElementById('alert-card-icon');
  const alertCard = document.getElementById('alert-card-trigger');

  if (lowCount > 0) {
    lowStockDesc.textContent = "Refill stock required";
    alertIcon.style.color = 'var(--danger)';
    alertCard.classList.add('text-danger');
  } else {
    lowStockDesc.textContent = "All stocks stable";
    alertIcon.style.color = 'var(--text-muted)';
    alertCard.classList.remove('text-danger');
  }
}

// Inventory Screen Layouts builder
function renderInventory() {
  inventoryTableBody.innerHTML = '';
  
  if (state.medications.length === 0) {
    inventoryTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted);">No medications found in inventory.</td>
      </tr>
    `;
    return;
  }

  state.medications.forEach(med => {
    const isLow = med.stock !== null && med.lowAlert !== null && med.stock <= med.lowAlert;
    const stockDisplay = med.stock !== null ? med.stock : '--';
    const alertDisplay = med.lowAlert !== null ? med.lowAlert : '--';
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${med.name}</strong><br><span style="font-size: 0.8rem; color: var(--text-muted);">${med.dosage}</span></td>
      <td>
        <div class="pill-render-wrapper">
          <div class="pill-shape ${med.pillShape} bg-pill-${med.pillColor}" style="transform: scale(0.45); transform-origin: center; box-shadow: none;">
            <div class="pill-divider"></div>
          </div>
        </div>
      </td>
      <td class="stock-tag ${isLow ? 'low' : 'ok'}">${stockDisplay}</td>
      <td>${alertDisplay}</td>
      <td><span class="status-pill ${isLow ? 'skipped' : 'taken'}">${isLow ? 'Refill' : 'OK'}</span></td>
      <td>
        <button class="refill-btn-mini" onclick="refillMedStock('${med.id}')">+10 Refill</button>
        <button class="icon-btn" style="display: inline-flex; margin-left: 8px;" onclick="deleteMedication('${med.id}')"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i></button>
      </td>
    `;
    inventoryTableBody.appendChild(row);
  });
  
  lucide.createIcons();
}

window.refillMedStock = function(medId) {
  const med = state.medications.find(m => m.id === medId);
  if (med) {
    if (med.stock === null) med.stock = 0;
    med.stock += 10;
    saveToLocalStorage();
    renderInventory();
    renderLowStockAlerts();
  }
};

window.deleteMedication = function(medId) {
  if (confirm("Are you sure you want to remove this medication from scheduling?")) {
    state.medications = state.medications.filter(m => m.id !== medId);
    saveToLocalStorage();
    renderInventory();
    renderAll();
  }
};

// Analytics Screen Charts builder
function renderAnalytics() {
  let totalTaken = 0;
  let totalSkipped = 0;

  Object.values(state.logs).forEach(log => {
    Object.values(log).forEach(status => {
      if (status === 'taken') totalTaken++;
      if (status === 'skipped') totalSkipped++;
    });
  });

  statsTotalTaken.textContent = totalTaken;
  statsTotalSkipped.textContent = totalSkipped;

  // Build last 7 days visual chart bars
  weeklyComplianceHistory.innerHTML = '';
  const daysOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = daysOfWeekLabels[d.getDay()];
    
    // Find rates
    const log = state.logs[dateStr] || {};
    let scheduled = 0;
    let taken = 0;

    state.medications.forEach(med => {
      if (med.days.includes(d.getDay())) {
        med.times.forEach(t => {
          scheduled++;
          if (log[`${med.id}_${t}`] === 'taken') taken++;
        });
      }
    });

    const pct = scheduled > 0 ? Math.round((taken / scheduled) * 100) : 0;
    
    const col = document.createElement('div');
    col.className = 'weekly-col';
    col.innerHTML = `
      <div style="font-size: 0.75rem; font-weight: bold;">${pct}%</div>
      <div class="weekly-bar-bg" title="${taken}/${scheduled} taken">
        <div class="weekly-bar" style="height: ${pct}%;"></div>
      </div>
      <span>${dayLabel}</span>
    `;
    weeklyComplianceHistory.appendChild(col);
  }
}

// Next Reminder timing calculators
function renderNextReminder() {
  const dayOfWeek = getTodayDayOfWeek();
  const now = new Date();
  const currentTimeStr = now.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"

  let upcoming = [];

  state.medications.forEach(med => {
    if (med.days.includes(dayOfWeek)) {
      med.times.forEach(t => {
        if (t > currentTimeStr) {
          upcoming.push({ med, time: t });
        }
      });
    }
  });

  // Sort upcoming
  upcoming.sort((a, b) => a.time.localeCompare(b.time));

  if (upcoming.length > 0) {
    const next = upcoming[0];
    nextReminderText.textContent = next.med.name;
    nextReminderTime.textContent = formatTimeString(next.time);
  } else {
    nextReminderText.textContent = "No remaining doses today";
    nextReminderTime.textContent = "--:--";
  }
}

// Alarm checks & active alert modals
let lastCheckedMinute = '';

function checkReminders() {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"
  
  if (timeStr === lastCheckedMinute) return; // Prevent double alerts inside the same minute
  lastCheckedMinute = timeStr;

  const dayOfWeek = now.getDay();
  const todayStr = getTodayDateString();

  state.medications.forEach(med => {
    if (med.days.includes(dayOfWeek)) {
      med.times.forEach(time => {
        if (time === timeStr) {
          const doseId = `${med.id}_${time}`;
          const currentLog = state.logs[todayStr]?.[doseId];
          
          if (!currentLog || currentLog === 'pending') {
            triggerAlarmModal(med, time, doseId);
          }
        }
      });
    }
  });
}

function triggerAlarmModal(med, time, doseId) {
  state.activeAlarm = { med, time, doseId };
  
  // Set modal styling elements based on pill
  modalMedDetails.textContent = `${med.name} - ${med.dosage}`;
  modalReminderTime.textContent = `Scheduled at ${formatTimeString(time)}`;
  modalMedNotes.textContent = med.notes || 'No instructions provided.';
  
  modalPillShape.className = `pill-shape ${med.pillShape} bg-pill-${med.pillColor}`;
  
  alarmModal.classList.add('active');
  startAlarm();
}

function handleModalDose(outcome) {
  if (state.activeAlarm) {
    toggleDoseState(state.activeAlarm.doseId, outcome);
    state.activeAlarm = null;
  }
  alarmModal.classList.remove('active');
  stopAlarm();
}

// Backup Schedule Export to JSON file
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `medication_schedule_backup_${getTodayDateString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Restore Schedule Import from JSON file
function importData(e) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedState = JSON.parse(event.target.result);
      if (importedState.medications && Array.isArray(importedState.medications)) {
        state = importedState;
        saveToLocalStorage();
        alert("Schedule successfully restored!");
        window.location.reload();
      } else {
        alert("Invalid file format. Please upload a valid schedule backup file.");
      }
    } catch (err) {
      alert("Error reading file. Verify the backup file validity.");
    }
  };
  fileReader.readAsText(e.target.files[0]);
}
