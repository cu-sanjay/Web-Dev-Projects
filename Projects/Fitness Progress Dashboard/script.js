// Select DOM Elements
const ringMinutes = document.getElementById('ringMinutes');
const ringCalories = document.getElementById('ringCalories');
const minsText = document.getElementById('minsText');
const calsText = document.getElementById('calsText');

const totalMinutesVal = document.getElementById('totalMinutesVal');
const totalCaloriesVal = document.getElementById('totalCaloriesVal');

const waterContainer = document.getElementById('waterContainer');
const waterText = document.getElementById('waterText');
const waterMinus = document.getElementById('waterMinus');
const waterPlus = document.getElementById('waterPlus');

const workoutForm = document.getElementById('workoutForm');
const calorieForm = document.getElementById('calorieForm');
const weightForm = document.getElementById('weightForm');

const tabButtons = document.querySelectorAll('.tab-btn');
const activityLogs = document.getElementById('activityLogs');
const clearAllLogs = document.getElementById('clearAllLogs');

// Setup form date inputs default to today's date
const todayStr = new Date().toISOString().split('T')[0];
document.getElementById('workoutDate').value = todayStr;
document.getElementById('mealDate').value = todayStr;
document.getElementById('weightDate').value = todayStr;

// State Variables
let fitData = {
  workouts: [],
  calories: [],
  weights: [],
  water: 0
};

let activeChartType = 'workout'; // 'workout', 'calories', 'weight'
let fitnessChart = null;

// Circumference of SVG circle (2 * PI * 34 = ~213.6)
const RING_CIRCUMFERENCE = 213.628;

// Sample Data Generator (Preload on first visit to wow the user)
function loadSampleData() {
  const getPastDateStr = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  fitData = {
    workouts: [
      { id: 'w1', type: 'Cardio', duration: 40, burned: 350, date: getPastDateStr(3) },
      { id: 'w2', type: 'Strength', duration: 50, burned: 320, date: getPastDateStr(2) },
      { id: 'w3', type: 'Yoga', duration: 30, burned: 150, date: getPastDateStr(1) },
      { id: 'w4', type: 'Cardio', duration: 35, burned: 300, date: getPastDateStr(0) }
    ],
    calories: [
      { id: 'c1', meal: 'Oatmeal & Protein Shake', calories: 450, date: getPastDateStr(3) },
      { id: 'c2', meal: 'Chicken & Rice Bowl', calories: 700, date: getPastDateStr(2) },
      { id: 'c3', meal: 'Greek Yogurt & Fruits', calories: 280, date: getPastDateStr(2) },
      { id: 'c4', meal: 'Salmon & Broccoli Dinner', calories: 550, date: getPastDateStr(1) },
      { id: 'c5', meal: 'Eggs & Avocado Toast', calories: 420, date: getPastDateStr(0) }
    ],
    weights: [
      { id: 'wt1', weight: 74.5, date: getPastDateStr(4) },
      { id: 'wt2', weight: 74.1, date: getPastDateStr(2) },
      { id: 'wt3', weight: 73.8, date: getPastDateStr(0) }
    ],
    water: 5
  };
  saveToStorage();
}

// LocalStorage helpers
function loadFromStorage() {
  try {
    const cached = localStorage.getItem('fitforge_data');
    if (cached) {
      fitData = JSON.parse(cached);
    } else {
      loadSampleData();
    }
  } catch (e) {
    loadSampleData();
  }
}

function saveToStorage() {
  localStorage.setItem('fitforge_data', JSON.stringify(fitData));
}

// UI Overview Metrics Renderer
function updateOverview() {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const today = getTodayStr();

  // Aggregate today's workouts
  const todayWorkouts = fitData.workouts.filter(w => w.date === today);
  const totalMins = todayWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const totalBurned = todayWorkouts.reduce((sum, w) => sum + w.burned, 0);

  // Targets
  const minTarget = 30;
  const calTarget = 500;

  // Active Minutes Ring update
  const minPercentage = Math.min((totalMins / minTarget) * 100, 100);
  const minOffset = RING_CIRCUMFERENCE - (minPercentage / 100) * RING_CIRCUMFERENCE;
  ringMinutes.style.strokeDashoffset = minOffset;
  minsText.textContent = `${totalMins}m`;
  totalMinutesVal.textContent = `${totalMins} / ${minTarget} mins`;

  // Active Calories Ring update
  const calPercentage = Math.min((totalBurned / calTarget) * 100, 100);
  const calOffset = RING_CIRCUMFERENCE - (calPercentage / 100) * RING_CIRCUMFERENCE;
  ringCalories.style.strokeDashoffset = calOffset;
  calsText.textContent = `${totalBurned}`;
  totalCaloriesVal.textContent = `${totalBurned} / ${calTarget} kcal`;

  // Render Water Glasses
  renderWater();
}

// Render Hydration Cups UI
function renderWater() {
  waterContainer.innerHTML = '';
  const totalCups = 8;
  const activeCups = fitData.water || 0;

  for (let i = 1; i <= totalCups; i++) {
    const glass = document.createElement('div');
    glass.className = `water-glass ${i <= activeCups ? 'filled' : ''}`;
    waterContainer.appendChild(glass);
  }

  waterText.textContent = `${activeCups} / ${totalCups} cups`;
}

// Format Date string
function formatLogDate(dateString) {
  const options = { month: 'short', day: 'numeric' };
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', options);
}

// Timeline Log List Builder
function renderTimeline() {
  activityLogs.innerHTML = '';
  
  // Combine all items into unified chronological array
  const items = [];
  
  fitData.workouts.forEach(w => {
    items.push({ ...w, logType: 'workout', sortDate: new Date(w.date + 'T00:00:00') });
  });
  
  fitData.calories.forEach(c => {
    items.push({ ...c, logType: 'calorie', sortDate: new Date(c.date + 'T00:00:00') });
  });
  
  fitData.weights.forEach(wt => {
    items.push({ ...wt, logType: 'weight', sortDate: new Date(wt.date + 'T00:00:00') });
  });

  // Sort logs by date descending
  items.sort((a, b) => b.sortDate - a.sortDate);

  if (items.length === 0) {
    activityLogs.innerHTML = '<p class="empty-logs-msg">No logs recorded yet. Start by logging your workouts or calories above.</p>';
    return;
  }

  items.forEach(item => {
    const logRow = document.createElement('div');
    logRow.className = 'timeline-item';

    let icon = '⚡';
    let title = '';
    let meta = '';
    let valString = '';

    if (item.logType === 'workout') {
      icon = item.type === 'Cardio' ? '🏃' : item.type === 'Strength' ? '🏋️' : item.type === 'Yoga' ? '🧘' : '🏀';
      title = `${item.type} Workout`;
      meta = `${item.duration} mins • ${formatLogDate(item.date)}`;
      valString = `-${item.burned} kcal`;
    } else if (item.logType === 'calorie') {
      icon = '🍎';
      title = item.meal;
      meta = `Food Intake • ${formatLogDate(item.date)}`;
      valString = `+${item.calories} kcal`;
    } else if (item.logType === 'weight') {
      icon = '⚖️';
      title = 'Weight Logged';
      meta = `Progress Update • ${formatLogDate(item.date)}`;
      valString = `${item.weight} kg`;
    }

    logRow.innerHTML = `
      <div class="item-left">
        <span class="item-icon">${icon}</span>
        <div class="item-details">
          <span class="item-title">${title}</span>
          <span class="item-meta">${meta}</span>
        </div>
      </div>
      <div class="item-right">
        <span class="item-value" style="color: ${item.logType === 'calorie' ? '#60a5fa' : ''}">${valString}</span>
        <button type="button" class="btn-delete" title="Delete log" onclick="deleteLog('${item.logType}', '${item.id}')">×</button>
      </div>
    `;

    activityLogs.appendChild(logRow);
  });
}

// Global Log Deletion Handler
window.deleteLog = function(type, id) {
  if (type === 'workout') {
    fitData.workouts = fitData.workouts.filter(w => w.id !== id);
  } else if (type === 'calorie') {
    fitData.calories = fitData.calories.filter(c => c.id !== id);
  } else if (type === 'weight') {
    fitData.weights = fitData.weights.filter(wt => wt.id !== id);
  }
  
  saveToStorage();
  updateOverview();
  renderTimeline();
  renderChart();
};

// ================= CHART CONFIGURATIONS (CHART.JS) =================
function renderChart() {
  const ctx = document.getElementById('fitnessChart').getContext('2d');
  
  if (fitnessChart) {
    fitnessChart.destroy();
  }

  // Get labels and datasets depending on tab selection
  let labels = [];
  let datasets = [];
  
  // Sort entries by date to build charts chronologically
  const sortedWorkouts = [...fitData.workouts].sort((a,b) => new Date(a.date) - new Date(b.date));
  const sortedCalories = [...fitData.calories].sort((a,b) => new Date(a.date) - new Date(b.date));
  const sortedWeights = [...fitData.weights].sort((a,b) => new Date(a.date) - new Date(b.date));

  if (activeChartType === 'workout') {
    // Group workout duration by date
    const dateMap = {};
    sortedWorkouts.forEach(w => {
      dateMap[w.date] = (dateMap[w.date] || 0) + w.duration;
    });
    
    labels = Object.keys(dateMap).map(d => formatLogDate(d));
    datasets = [{
      label: 'Workout Duration (mins)',
      data: Object.values(dateMap),
      backgroundColor: '#10b981',
      borderRadius: 6,
      borderWidth: 0
    }];
  } else if (activeChartType === 'calories') {
    // Group intake and burn by date
    const dateMap = {};
    sortedCalories.forEach(c => {
      if (!dateMap[c.date]) dateMap[c.date] = { intake: 0, burned: 0 };
      dateMap[c.date].intake += c.calories;
    });
    sortedWorkouts.forEach(w => {
      if (!dateMap[w.date]) dateMap[w.date] = { intake: 0, burned: 0 };
      dateMap[w.date].burned += w.burned;
    });
    
    // Sort dates
    const sortedDates = Object.keys(dateMap).sort((a,b) => new Date(a) - new Date(b));
    labels = sortedDates.map(d => formatLogDate(d));
    
    datasets = [
      {
        label: 'Consumed (kcal)',
        data: sortedDates.map(d => dateMap[d].intake),
        backgroundColor: '#60a5fa',
        borderRadius: 6
      },
      {
        label: 'Burned (kcal)',
        data: sortedDates.map(d => dateMap[d].burned),
        backgroundColor: '#34d399',
        borderRadius: 6
      }
    ];
  } else if (activeChartType === 'weight') {
    labels = sortedWeights.map(w => formatLogDate(w.date));
    datasets = [{
      label: 'Weight (kg)',
      data: sortedWeights.map(w => w.weight),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.3
    }];
  }

  fitnessChart = new Chart(ctx, {
    type: activeChartType === 'weight' ? 'line' : 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#a1a1aa',
            font: { family: 'Plus Jakarta Sans', weight: 'bold' }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#71717a', font: { family: 'Plus Jakarta Sans' } }
        },
        y: {
          grid: { color: '#27272a' },
          ticks: { color: '#71717a', font: { family: 'Plus Jakarta Sans' } }
        }
      }
    }
  });
}

// Bind Tabs pane buttons
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeChartType = btn.getAttribute('data-chart');
    renderChart();
  });
});

// Bind Water control actions
waterMinus.addEventListener('click', () => {
  if (fitData.water > 0) {
    fitData.water--;
    saveToStorage();
    renderWater();
  }
});

waterPlus.addEventListener('click', () => {
  if (fitData.water < 8) {
    fitData.water++;
    saveToStorage();
    renderWater();
  }
});

// Bind Forms submissions
workoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.getElementById('workoutType').value;
  const duration = parseInt(document.getElementById('workoutDuration').value);
  const burned = parseInt(document.getElementById('workoutBurned').value);
  const date = document.getElementById('workoutDate').value;
  
  const record = {
    id: 'w_' + Date.now(),
    type,
    duration,
    burned,
    date
  };
  
  fitData.workouts.push(record);
  saveToStorage();
  
  workoutForm.reset();
  document.getElementById('workoutDate').value = todayStr;
  
  updateOverview();
  renderTimeline();
  renderChart();
});

calorieForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const meal = document.getElementById('mealName').value;
  const calories = parseInt(document.getElementById('mealCalories').value);
  const date = document.getElementById('mealDate').value;
  
  const record = {
    id: 'c_' + Date.now(),
    meal,
    calories,
    date
  };
  
  fitData.calories.push(record);
  saveToStorage();
  
  calorieForm.reset();
  document.getElementById('mealDate').value = todayStr;
  
  updateOverview();
  renderTimeline();
  renderChart();
});

weightForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const weight = parseFloat(document.getElementById('weightVal').value);
  const date = document.getElementById('weightDate').value;
  
  const record = {
    id: 'wt_' + Date.now(),
    weight,
    date
  };
  
  fitData.weights.push(record);
  saveToStorage();
  
  weightForm.reset();
  document.getElementById('weightDate').value = todayStr;
  
  updateOverview();
  renderTimeline();
  renderChart();
});

// Bind Reset Logs Action button
clearAllLogs.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all logged data?')) {
    localStorage.removeItem('fitforge_data');
    loadSampleData();
    
    updateOverview();
    renderTimeline();
    renderChart();
  }
});

// Start Application routines
loadFromStorage();
updateOverview();
renderTimeline();
renderChart();
