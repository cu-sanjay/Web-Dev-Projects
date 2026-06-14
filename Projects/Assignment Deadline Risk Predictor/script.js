const form = document.getElementById('assessment-form');
const assignmentsList = document.getElementById('assignments-list');
const sortBtn = document.getElementById('sort-risk');
const clearBtn = document.getElementById('clear-all');

let assignments = [];

form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('assignment-name').value;
  const days = parseInt(document.getElementById('days-left').value);
  const hours = parseInt(document.getElementById('est-hours').value);
  const complexity = parseInt(document.getElementById('complexity').value);
  
  // Risk calculation logic
  // Hours per day required
  const hoursPerDay = days > 0 ? (hours / days) : hours;
  
  // Base score
  let score = hoursPerDay * complexity;
  
  // Penalty for imminent deadlines
  if (days <= 1) score *= 2;
  else if (days <= 3) score *= 1.5;
  
  let riskLevel = '';
  let riskClass = '';
  let advice = '';
  
  if (score < 3) {
    riskLevel = 'Low';
    riskClass = 'risk-low';
    advice = 'You are in a good spot. Work on this steadily.';
  } else if (score < 8) {
    riskLevel = 'Moderate';
    riskClass = 'risk-moderate';
    advice = 'Pace yourself. Consider starting within the next day or two.';
  } else if (score < 15) {
    riskLevel = 'High';
    riskClass = 'risk-high';
    advice = 'Start immediately! Break the task into smaller chunks to avoid burnout.';
  } else {
    riskLevel = 'Critical';
    riskClass = 'risk-critical';
    advice = 'Extreme risk! Cancel non-essential activities and focus entirely on this.';
  }
  
  const newAssignment = {
    id: Date.now(),
    name,
    days,
    hours,
    complexity,
    score,
    riskLevel,
    riskClass,
    advice
  };
  
  assignments.unshift(newAssignment);
  renderAssignments();
  form.reset();
});

function renderAssignments() {
  if (assignments.length === 0) {
    assignmentsList.innerHTML = '<div class="empty-state">No assignments assessed yet. Fill out the form to get started.</div>';
    return;
  }
  
  assignmentsList.innerHTML = '';
  
  assignments.forEach(task => {
    const el = document.createElement('div');
    el.className = 'assignment-item';
    el.style.borderLeftColor = getComputedStyle(document.documentElement)
      .getPropertyValue(`--risk-${task.riskClass.split('-')[1]}`).trim();
      
    el.innerHTML = `
      <div class="item-header">
        <div class="item-title">${task.name}</div>
        <div class="risk-badge ${task.riskClass}">${task.riskLevel}</div>
      </div>
      <div class="item-stats">
        <span>⏳ ${task.days} Days Left</span>
        <span>⏱️ ${task.hours} Hours Est.</span>
        <span>🧩 Complexity Level ${task.complexity}</span>
      </div>
      <div class="item-advice">
        <strong>Advice:</strong> ${task.advice}
      </div>
    `;
    assignmentsList.appendChild(el);
  });
}

sortBtn.addEventListener('click', () => {
  assignments.sort((a, b) => b.score - a.score);
  renderAssignments();
});

clearBtn.addEventListener('click', () => {
  assignments = [];
  renderAssignments();
});
