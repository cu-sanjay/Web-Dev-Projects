const topicInput = document.getElementById('topic-input');
const addTopicBtn = document.getElementById('add-topic-btn');
const topicsList = document.getElementById('topics-list');
const generateBtn = document.getElementById('generate-btn');
const totalTimeInput = document.getElementById('total-time');
const timeline = document.getElementById('plan-timeline');

let topics = [];

addTopicBtn.addEventListener('click', () => {
  const topic = topicInput.value.trim();
  if (topic) {
    topics.push(topic);
    renderTopics();
    topicInput.value = '';
  }
});

topicInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTopicBtn.click();
  }
});

function renderTopics() {
  topicsList.innerHTML = '';
  topics.forEach((topic, index) => {
    const li = document.createElement('li');
    li.className = 'topic-item';
    li.innerHTML = `
      <span>${topic}</span>
      <button class="delete-btn" onclick="removeTopic(${index})">&times;</button>
    `;
    topicsList.appendChild(li);
  });
  
  generateBtn.disabled = topics.length === 0;
}

window.removeTopic = (index) => {
  topics.splice(index, 1);
  renderTopics();
};

generateBtn.addEventListener('click', () => {
  const totalMinutes = parseInt(totalTimeInput.value);
  if (!totalMinutes || totalMinutes < 30) {
    alert("Please enter a valid study time of at least 30 minutes.");
    return;
  }
  
  generatePlan(totalMinutes);
});

function generatePlan(totalMinutes) {
  timeline.innerHTML = '';
  
  const pomodoroSession = 25;
  const shortBreak = 5;
  const cycleTime = pomodoroSession + shortBreak; // 30 mins
  
  // How many full 30-min blocks can we fit?
  const numBlocks = Math.floor(totalMinutes / cycleTime);
  
  if (numBlocks === 0) {
    timeline.innerHTML = '<div class="empty-state">Not enough time for a full Pomodoro cycle.</div>';
    return;
  }
  
  let currentTopicIndex = 0;
  let startTime = new Date(); // Mock start time as 'now'
  
  for (let i = 0; i < numBlocks; i++) {
    const topic = topics[currentTopicIndex % topics.length];
    
    // Study Block
    const studyBlock = document.createElement('div');
    studyBlock.className = 'block block-study';
    studyBlock.innerHTML = `
      <div class="block-time">${formatTime(startTime)} - ${formatTime(addMinutes(startTime, pomodoroSession))}</div>
      <div class="block-content">📖 Focus: ${topic}</div>
    `;
    timeline.appendChild(studyBlock);
    
    startTime = addMinutes(startTime, pomodoroSession);
    
    // Break Block
    const breakBlock = document.createElement('div');
    breakBlock.className = 'block block-break';
    breakBlock.innerHTML = `
      <div class="block-time">${formatTime(startTime)} - ${formatTime(addMinutes(startTime, shortBreak))}</div>
      <div class="block-content">☕ Short Break (5 min)</div>
    `;
    timeline.appendChild(breakBlock);
    
    startTime = addMinutes(startTime, shortBreak);
    currentTopicIndex++;
  }
  
  // Leftover time handling
  const leftover = totalMinutes % cycleTime;
  if (leftover > 0) {
    const extraBlock = document.createElement('div');
    extraBlock.className = 'block block-study';
    extraBlock.innerHTML = `
      <div class="block-time">${formatTime(startTime)} - ${formatTime(addMinutes(startTime, leftover))}</div>
      <div class="block-content">📖 Final Review / Wrap Up</div>
    `;
    timeline.appendChild(extraBlock);
  }
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
