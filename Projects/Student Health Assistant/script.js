// Daily Health Tips
const tips = [
  "Stay hydrated! Aim for at least 8 glasses of water a day.",
  "Take a 5-minute break every hour of studying to rest your eyes and stretch.",
  "Sleep is crucial. Try to get 7-9 hours of sleep each night.",
  "Feeling stressed? Try a quick 10-minute mindfulness meditation.",
  "Don't skip breakfast! It jumpstarts your metabolism for the day.",
  "Take the stairs instead of the elevator for a quick cardio boost.",
  "Limit caffeine intake in the late afternoon to improve sleep quality."
];

const tipText = document.getElementById('daily-tip');
const newTipBtn = document.getElementById('new-tip-btn');

function getRandomTip() {
  const randomIndex = Math.floor(Math.random() * tips.length);
  tipText.textContent = `"${tips[randomIndex]}"`;
}

newTipBtn.addEventListener('click', getRandomTip);
getRandomTip(); // Initialize


// Wellness Tracker Form
const trackerForm = document.getElementById('tracker-form');
const summaryBox = document.getElementById('tracker-summary');
const summaryList = document.getElementById('summary-list');

trackerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const water = document.getElementById('water-intake').value;
  const sleep = document.getElementById('sleep-hours').value;
  const exercise = document.getElementById('exercise-mins').value;
  
  summaryList.innerHTML = `
    <li><i class="ph ph-drop text-blue"></i> <strong>${water}</strong> glasses of water</li>
    <li><i class="ph ph-moon text-purple"></i> <strong>${sleep}</strong> hours of sleep</li>
    <li><i class="ph ph-person-simple-run text-green"></i> <strong>${exercise}</strong> mins of exercise</li>
  `;
  
  summaryBox.classList.remove('hidden');
  trackerForm.reset();
});


// Appointment Booking Form
const aptForm = document.getElementById('appointment-form');
const aptList = document.getElementById('appointments-list');
let appointments = [];

aptForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const doc = document.getElementById('doc-select').value;
  const date = document.getElementById('apt-date').value;
  const time = document.getElementById('apt-time').value;
  const reason = document.getElementById('apt-reason').value;
  
  // Format date for display
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  
  appointments.push({ doc, date: formattedDate, time, reason });
  
  renderAppointments();
  aptForm.reset();
});

function renderAppointments() {
  if (appointments.length === 0) {
    aptList.innerHTML = '<div class="empty-state">No upcoming appointments.</div>';
    return;
  }
  
  aptList.innerHTML = '';
  appointments.forEach(apt => {
    const div = document.createElement('div');
    div.className = 'apt-item';
    div.innerHTML = `
      <div class="apt-header">
        <span>${apt.doc}</span>
        <span class="apt-date">${apt.date} • ${apt.time}</span>
      </div>
      <div class="apt-reason">Reason: ${apt.reason}</div>
    `;
    aptList.appendChild(div);
  });
}
