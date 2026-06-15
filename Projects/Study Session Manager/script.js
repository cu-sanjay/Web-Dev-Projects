/**
 * FocusFlow - Study Session Manager
 * Core Application Script
 */

// ==========================================================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================================================
let state = {
  decks: [],
  sessions: [],
  flashcards: [],
  settings: {
    weeklyMinutesGoal: 120
  }
};

const STORAGE_KEYS = {
  DECKS: "focusflow_decks",
  SESSIONS: "focusflow_sessions",
  FLASHCARDS: "focusflow_flashcards",
  SETTINGS: "focusflow_settings",
  THEME: "focusflow_theme"
};

const PALETTE_THEMES = {
  blue: "#3b82f6",
  teal: "#0d9488",
  orange: "#ea580c",
  purple: "#8b5cf6",
  rose: "#f43f5e"
};

// ==========================================================================
// MOCK DATABASE SEED DATA
// ==========================================================================
const SEED_DECKS = [
  {
    id: "d-1",
    title: "Data Structures & Algorithms",
    desc: "Trees, sorting, search, graphs",
    theme: "blue",
    tasks: [
      { id: "t-1", text: "Read tree traversals algorithms", completed: true, pomos: 2 },
      { id: "t-2", text: "Implement Dijkstra search in JS", completed: false, pomos: 3 },
      { id: "t-3", text: "Master dynamic programming basics", completed: false, pomos: 4 }
    ]
  },
  {
    id: "d-2",
    title: "Computer Networks",
    desc: "TCP/IP layers, routing, protocols",
    theme: "teal",
    tasks: [
      { id: "t-4", text: "Draw TCP 3-way handshake diagram", completed: false, pomos: 2 },
      { id: "t-5", text: "Review DNS lookup recursion stages", completed: true, pomos: 1 }
    ]
  }
];

function getSeedSessions() {
  const formatOffset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0];
  };

  return [
    { id: "s-1", taskId: "t-1", date: formatOffset(5), duration: 25, rating: 5, notes: "Felt very focused. Completed basic tree models." },
    { id: "s-2", taskId: "t-5", date: formatOffset(4), duration: 25, rating: 4, notes: "Reviewed packet structures." },
    { id: "s-3", taskId: "t-2", date: formatOffset(3), duration: 25, rating: 3, notes: "A bit distracted by phone, but fixed edge cases." },
    { id: "s-4", taskId: "t-1", date: formatOffset(2), duration: 25, rating: 5, notes: "Practiced pre-order traversals." },
    { id: "s-5", taskId: "t-4", date: formatOffset(1), duration: 25, rating: 4, notes: "Fascinating dialogue loops." }
  ];
}

const SEED_FLASHCARDS = [
  { id: "fc-1", deckId: "d-1", question: "What is the time complexity of a Binary Search?", answer: "O(log n) average and worst-case, since the search space is halved in each step.", confidence: "easy", reviewsCount: 3 },
  { id: "fc-2", deckId: "d-1", question: "What is a Hash Collision?", answer: "Occurs when two different keys hash to the same index slot in a hash table.", confidence: "hard", reviewsCount: 2 },
  { id: "fc-3", deckId: "d-1", question: "What is the difference between BFS and DFS?", answer: "BFS uses a Queue to explore neighbor nodes layer by layer, while DFS uses a Stack/Recursion to explore depth paths first.", confidence: "easy", reviewsCount: 5 },
  { id: "fc-4", deckId: "d-2", question: "What is the difference between TCP and UDP?", answer: "TCP is connection-oriented, reliable, and guarantees packet order (slow). UDP is connectionless, unreliable, and fast (streaming).", confidence: "easy", reviewsCount: 4 },
  { id: "fc-5", deckId: "d-2", question: "What is process thrashing?", answer: "Occurs when a virtual memory system spends more time writing pages in and out of disk swaps than executing instructions.", confidence: "redo", reviewsCount: 1 },
  { id: "fc-6", deckId: "d-2", question: "What is DNS?", answer: "Domain Name System. Translates human-readable domain names (e.g. google.com) into IP addresses.", confidence: "easy", reviewsCount: 3 }
];

function initDatabase() {
  const localDecks = localStorage.getItem(STORAGE_KEYS.DECKS);
  const localSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  const localFlashcards = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
  const localSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

  if (!localDecks) {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(SEED_DECKS));
    state.decks = [...SEED_DECKS];
  } else {
    state.decks = JSON.parse(localDecks);
  }

  if (!localSessions) {
    const seedSessions = getSeedSessions();
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(seedSessions));
    state.sessions = seedSessions;
  } else {
    state.sessions = JSON.parse(localSessions);
  }

  if (!localFlashcards) {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(SEED_FLASHCARDS));
    state.flashcards = [...SEED_FLASHCARDS];
  } else {
    state.flashcards = JSON.parse(localFlashcards);
  }

  if (!localSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  } else {
    state.settings = { ...state.settings, ...JSON.parse(localSettings) };
  }
}

function saveStateToStorage() {
  localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(state.decks));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(state.sessions));
  localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(state.flashcards));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
}

// ==========================================================================
// CALCULATOR HELPERS
// ==========================================================================
function getTaskText(taskId) {
  for (let deck of state.decks) {
    const task = deck.tasks.find(t => t.id === taskId);
    if (task) return `${deck.title}: ${task.text}`;
  }
  return "General Study Block";
}

function calculateStreakDays() {
  if (state.sessions.length === 0) return 0;
  
  const dates = [...new Set(state.sessions.map(s => s.date))]
    .map(dStr => new Date(dStr))
    .sort((a,b) => b - a);

  const today = new Date();
  today.setHours(0,0,0,0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const latest = dates[0];
  latest.setHours(0,0,0,0);

  if (latest.getTime() !== today.getTime() && latest.getTime() !== yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  let currentCompare = latest;

  for (let i = 1; i < dates.length; i++) {
    const nextDate = dates[i];
    nextDate.setHours(0,0,0,0);

    const checkDate = new Date(currentCompare);
    checkDate.setDate(currentCompare.getDate() - 1);

    if (nextDate.getTime() === checkDate.getTime()) {
      streak++;
      currentCompare = nextDate;
    } else if (nextDate.getTime() < checkDate.getTime()) {
      break;
    }
  }

  return streak;
}

function getDashboardAnalytics() {
  const totalMinutes = state.sessions.reduce((sum, s) => sum + (parseFloat(s.duration) || 0), 0);
  const totalSessions = state.sessions.length;
  const streak = calculateStreakDays();
  const reviewed = state.flashcards.reduce((sum, fc) => sum + (fc.reviewsCount || 0), 0);

  return {
    totalMinutes,
    totalSessions,
    streak,
    reviewed
  };
}

// ==========================================================================
// DYNAMIC NOISE SYNTHESIS AUDIO LOOP ENGINE (Native Web Audio API)
// ==========================================================================
let audioCtx = null;
let noiseNode = null;
let noiseGainNode = null;

function initAudioContext() {
  if (audioCtx === null) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Generates white noise buffer (random samples between -1 and 1)
function generateWhiteNoiseBuffer() {
  const bufferSize = 2 * audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Generates pink noise (Waterfall sound, Voss McCartney spectral slope approximation)
function generatePinkNoiseBuffer() {
  const bufferSize = 2 * audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    let white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11; // Gain compensation
    b6 = white * 0.115926;
  }
  return buffer;
}

// Generates brown noise (Heavy waves rumble, integrated random walks)
function generateBrownNoiseBuffer() {
  const bufferSize = 2 * audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    let white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; // Gain compensation
  }
  return buffer;
}

function playSyntheticFocusAudio(noiseType) {
  initAudioContext();
  stopSyntheticFocusAudio();

  if (noiseType === "none") return;

  // Build audio buffer node
  let buffer;
  if (noiseType === "white") buffer = generateWhiteNoiseBuffer();
  else if (noiseType === "pink") buffer = generatePinkNoiseBuffer();
  else if (noiseType === "brown") buffer = generateBrownNoiseBuffer();

  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;

  // Build volume GainNode
  noiseGainNode = audioCtx.createGain();
  const volumePercentage = parseInt(DOM.focusAudioVolume.value) || 60;
  noiseGainNode.gain.value = volumePercentage / 100;

  // Connect graph
  noiseNode.connect(noiseGainNode);
  noiseGainNode.connect(audioCtx.destination);

  noiseNode.start();
  DOM.audioStatusBadge.classList.remove("hidden");
}

function stopSyntheticFocusAudio() {
  if (noiseNode) {
    try {
      noiseNode.stop();
    } catch(e) {}
    noiseNode.disconnect();
    noiseNode = null;
  }
  if (noiseGainNode) {
    noiseGainNode.disconnect();
    noiseGainNode = null;
  }
  DOM.audioStatusBadge.classList.add("hidden");
}

function handleVolumeChange() {
  const vol = parseInt(DOM.focusAudioVolume.value) || 60;
  DOM.audioVolumeText.textContent = `${vol}%`;
  if (noiseGainNode) {
    noiseGainNode.gain.setValueAtTime(vol / 100, audioCtx.currentTime);
  }
}

// ==========================================================================
// DOM ELEMENT CACHE & EVENTS BINDING
// ==========================================================================
const DOM = {
  // Navigation
  navButtons: document.querySelectorAll(".nav-btn"),
  sections: document.querySelectorAll(".tab-content"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeToggleText: document.getElementById("themeToggleText"),

  // KPIs
  kpiFocusMinutes: document.getElementById("kpiFocusMinutes"),
  kpiTotalSessions: document.getElementById("kpiTotalSessions"),
  kpiStreak: document.getElementById("kpiStreak"),
  kpiCardsReviewed: document.getElementById("kpiCardsReviewed"),
  dashboardDecksList: document.getElementById("dashboardDecksList"),
  dashboardStartFocusBtn: document.getElementById("dashboardStartFocusBtn"),
  weeklyGoalHeader: document.getElementById("weeklyGoalHeader"),
  goalGaugePath: document.getElementById("goalGaugePath"),
  goalGaugePct: document.getElementById("goalGaugePct"),
  goalGaugeRatio: document.getElementById("goalGaugeRatio"),
  goalMessage: document.getElementById("goalMessage"),
  focusChartContainer: document.getElementById("focusChartContainer"),

  // Timer View
  timerTaskSelect: document.getElementById("timerTaskSelect"),
  timerProgressRing: document.getElementById("timerProgressRing"),
  clockMinutes: document.getElementById("clockMinutes"),
  clockSeconds: document.getElementById("clockSeconds"),
  clockStartBtn: document.getElementById("clockStartBtn"),
  clockPauseBtn: document.getElementById("clockPauseBtn"),
  clockResetBtn: document.getElementById("clockResetBtn"),
  clockModeButtons: document.querySelectorAll(".clock-mode-btn"),
  timerHistoryTableBody: document.getElementById("timerHistoryTableBody"),
  timerHistoryEmptyState: document.getElementById("timerHistoryEmptyState"),

  // Ambient Audio
  audioStatusBadge: document.getElementById("audioStatusBadge"),
  focusAudioSelect: document.getElementById("focusAudioSelect"),
  focusAudioVolume: document.getElementById("focusAudioVolume"),
  audioVolumeText: document.getElementById("audioVolumeText"),

  // Decks view
  decksGridContainer: document.getElementById("decksGridContainer"),
  decksEmptyState: document.getElementById("decksEmptyState"),
  addNewSubjectBtn: document.getElementById("addNewSubjectBtn"),

  // Subject Modal
  subjectModal: document.getElementById("subjectModal"),
  closeSubjectModalBtn: document.getElementById("closeSubjectModalBtn"),
  subjectForm: document.getElementById("subjectForm"),
  subjectTitleInput: document.getElementById("subjectTitleInput"),
  subjectDescInput: document.getElementById("subjectDescInput"),
  cancelSubjectBtn: document.getElementById("cancelSubjectBtn"),

  // Deck task modal
  deckTaskModal: document.getElementById("deckTaskModal"),
  closeDeckTaskModalBtn: document.getElementById("closeDeckTaskModalBtn"),
  deckTaskForm: document.getElementById("deckTaskForm"),
  deckTaskSubjectId: document.getElementById("deckTaskSubjectId"),
  deckTaskTitleInput: document.getElementById("deckTaskTitleInput"),
  deckTaskPomosInput: document.getElementById("deckTaskPomosInput"),
  cancelDeckTaskBtn: document.getElementById("cancelDeckTaskBtn"),

  // Flashcards view
  flashcardDeckSelect: document.getElementById("flashcardDeckSelect"),
  flashcardProgressCounter: document.getElementById("flashcardProgressCounter"),
  flashcardsInteractiveArea: document.getElementById("flashcardsInteractiveArea"),
  flashcardsEmptyState: document.getElementById("flashcardsEmptyState"),
  addNewCardBtn: document.getElementById("addNewCardBtn"),
  flashcardScene: document.getElementById("flashcardScene"),
  flashcardSelectorElement: document.getElementById("flashcardSelectorElement"),
  cardFrontText: document.getElementById("cardFrontText"),
  cardBackText: document.getElementById("cardBackText"),
  cardPrevBtn: document.getElementById("cardPrevBtn"),
  cardFlipBtn: document.getElementById("cardFlipBtn"),
  cardNextBtn: document.getElementById("cardNextBtn"),
  cardConfidenceSelector: document.getElementById("cardConfidenceSelector"),
  confRedoBtn: document.getElementById("confRedoBtn"),
  confHardBtn: document.getElementById("confHardBtn"),
  confEasyBtn: document.getElementById("confEasyBtn"),

  // Flashcard Modal
  flashcardModal: document.getElementById("flashcardModal"),
  closeFlashcardModalBtn: document.getElementById("closeFlashcardModalBtn"),
  flashcardForm: document.getElementById("flashcardForm"),
  flashcardModalDeckSelect: document.getElementById("flashcardModalDeckSelect"),
  flashcardQuestionInput: document.getElementById("flashcardQuestionInput"),
  flashcardAnswerInput: document.getElementById("flashcardAnswerInput"),
  cancelFlashcardBtn: document.getElementById("cancelFlashcardBtn"),

  // Session end log modal
  sessionLogModal: document.getElementById("sessionLogModal"),
  sessionLogForm: document.getElementById("sessionLogForm"),
  logSessionTaskId: document.getElementById("logSessionTaskId"),
  logSessionDuration: document.getElementById("logSessionDuration"),
  logSessionTaskTitle: document.getElementById("logSessionTaskTitle"),
  logSessionDurationFormatted: document.getElementById("logSessionDurationFormatted"),
  logSessionEfficacySelect: document.getElementById("logSessionEfficacySelect"),
  logSessionNotes: document.getElementById("logSessionNotes"),
  skipSessionLogBtn: document.getElementById("skipSessionLogBtn"),

  // Settings
  goalsConfigForm: document.getElementById("goalsConfigForm"),
  settingsWeeklyMinutesGoal: document.getElementById("settingsWeeklyMinutesGoal"),
  exportBackupBtn: document.getElementById("exportBackupBtn"),
  importBackupInput: document.getElementById("importBackupInput"),
  resetDatabaseBtn: document.getElementById("resetDatabaseBtn")
};

// ==========================================================================
// CORE APP NAVIGATION & THEMES
// ==========================================================================
function initAppRouting() {
  DOM.navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      DOM.navButtons.forEach(b => b.classList.remove("active"));
      DOM.sections.forEach(s => s.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");

      // Reload modules
      if (targetId === "dashboard-section") {
        renderDashboard();
      } else if (targetId === "timer-section") {
        renderTimerView();
      } else if (targetId === "decks-section") {
        renderDecksGrid();
      } else if (targetId === "flashcards-section") {
        renderFlashcardsView();
      }
    });
  });

  DOM.dashboardStartFocusBtn.addEventListener("click", () => {
    DOM.navButtons[1].click();
  });
}

function initThemeToggle() {
  const currentTheme = localStorage.getItem(STORAGE_KEYS.THEME) || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeToggleUI(currentTheme);

  DOM.themeToggleBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = activeTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeToggleUI(newTheme);
  });
}

function updateThemeToggleUI(theme) {
  DOM.themeToggleText.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
}

// ==========================================================================
// DASHBOARD RENDERING
// ==========================================================================
function renderDashboard() {
  const stats = getDashboardAnalytics();

  DOM.kpiFocusMinutes.textContent = stats.totalMinutes;
  DOM.kpiTotalSessions.textContent = stats.totalSessions;
  DOM.kpiStreak.textContent = `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`;
  DOM.kpiCardsReviewed.textContent = stats.reviewed;

  renderDashboardSubjectsProgress();
  renderDashboardGoalGauge(stats.totalMinutes);
  renderDashboardActivityChart();
}

function renderDashboardSubjectsProgress() {
  DOM.dashboardDecksList.innerHTML = "";

  if (state.decks.length === 0) {
    DOM.dashboardDecksList.innerHTML = `
      <div class="empty-state-container" style="padding:24px 0;">
        <p>No study decks available. Set up a curriculum topic to begin tracking.</p>
      </div>
    `;
    return;
  }

  state.decks.forEach(deck => {
    const total = deck.tasks.length;
    const completed = deck.tasks.filter(t => t.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const color = PALETTE_THEMES[deck.theme] || PALETTE_THEMES.blue;

    const div = document.createElement("div");
    div.className = "dashboard-deck-item";
    div.innerHTML = `
      <div class="deck-item-meta">
        <h4>${deck.title}</h4>
        <p>${deck.desc}</p>
      </div>
      <div class="flex-column align-center" style="gap:4px; min-width:140px;">
        <div style="display:flex; justify-content:space-between; width:100%; font-size:11.5px; font-weight:600;">
          <span style="color:${color};">${pct}% Done</span>
          <span>${completed}/${total} Tasks</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${pct}%; background-color:${color};"></div>
        </div>
      </div>
    `;
    DOM.dashboardDecksList.appendChild(div);
  });
}

function renderDashboardGoalGauge(currentMins) {
  const goal = state.settings.weeklyMinutesGoal || 120;
  DOM.weeklyGoalHeader.textContent = `Target: ${goal} mins`;

  const pct = Math.min(100, Math.round((currentMins / goal) * 100));

  // Circumference = 251.2
  const offset = 251.2 * (1 - pct / 100);
  DOM.goalGaugePath.style.strokeDashoffset = offset;
  DOM.goalGaugePct.textContent = `${pct}%`;
  DOM.goalGaugeRatio.textContent = `${currentMins} of ${goal} mins`;

  if (pct >= 100) {
    DOM.goalMessage.textContent = "Weekly focus goal completed! Keep studying!";
  } else {
    const diff = goal - currentMins;
    DOM.goalMessage.textContent = `Study ${diff} more minutes to complete this week's goals!`;
  }
}

function renderDashboardActivityChart() {
  DOM.focusChartContainer.innerHTML = "";

  // Last 7 days
  const labels = [];
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleString("default", { weekday: "short" }));
    dates.push(d.toISOString().split("T")[0]);
  }

  // Calculate minutes logged on these dates
  const dailyFocusMap = {};
  dates.forEach(d => { dailyFocusMap[d] = 0; });
  state.sessions.forEach(s => {
    if (dailyFocusMap.hasOwnProperty(s.date)) {
      dailyFocusMap[s.date] += parseFloat(s.duration) || 0;
    }
  });

  const chartData = dates.map(d => dailyFocusMap[d]);
  const maxVal = Math.max(...chartData, 50); // Scale floor at 50 mins

  // SVG parameters
  const width = 600;
  const height = 180;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 25;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const points = [];
  chartData.forEach((val, idx) => {
    const x = padLeft + (idx / (chartData.length - 1)) * chartWidth;
    const y = padTop + chartHeight - (val / maxVal) * chartHeight;
    points.push({ x, y, val, label: labels[idx] });
  });

  let svgContent = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">`;
  
  // Grid guides
  for (let i = 0; i <= 3; i++) {
    const yTrack = padTop + (i / 3) * chartHeight;
    const valTrack = Math.round(maxVal - (i / 3) * maxVal);
    svgContent += `
      <line class="chart-grid-line" x1="${padLeft}" y1="${yTrack}" x2="${width - padRight}" y2="${yTrack}" />
      <text class="chart-text" x="5" y="${yTrack + 3}">${valTrack}m</text>
    `;
  }

  let pathStr = "";
  let fillStr = `M ${points[0].x} ${padTop + chartHeight}`;

  points.forEach((pt, idx) => {
    const op = idx === 0 ? "M" : "L";
    pathStr += ` ${op} ${pt.x} ${pt.y}`;
    fillStr += ` L ${pt.x} ${pt.y}`;
  });

  fillStr += ` L ${points[points.length - 1].x} ${padTop + chartHeight} Z`;

  svgContent += `
    <path class="chart-fill-path" d="${fillStr}" />
    <path class="chart-line-path" d="${pathStr}" />
  `;

  points.forEach(pt => {
    svgContent += `
      <circle class="chart-node" cx="${pt.x}" cy="${pt.y}" r="5">
        <title>${pt.label}: ${pt.val} mins</title>
      </circle>
      <text class="chart-text" x="${pt.x}" y="${height - 5}" text-anchor="middle">${pt.label}</text>
    `;
  });

  svgContent += `</svg>`;
  DOM.focusChartContainer.innerHTML = svgContent;
}

// ==========================================================================
// POMODORO TIMER COUNTDOWNS CONTROL
// ==========================================================================
let timerEngine = {
  active: false,
  paused: false,
  secondsLeft: 1500, // Default 25m Focus
  totalSeconds: 1500,
  intervalId: null,
  activeMode: "focus" // focus, short-break, long-break
};

const POMO_MODES = {
  "focus": 1500,        // 25 minutes
  "short-break": 300,   // 5 minutes
  "long-break": 900     // 15 minutes
};

function renderTimerView() {
  resetPomodoroTimer();
  populateTimerTasksDropdown();
  renderTimerLogsTable();
}

function populateTimerTasksDropdown() {
  DOM.timerTaskSelect.innerHTML = "";
  
  // Collect all uncompleted tasks
  let taskCount = 0;
  state.decks.forEach(deck => {
    deck.tasks.forEach(task => {
      if (!task.completed) {
        taskCount++;
        const opt = document.createElement("option");
        opt.value = task.id;
        opt.textContent = `${deck.title}: ${task.text} (${task.pomos} pomos)`;
        DOM.timerTaskSelect.appendChild(opt);
      }
    });
  });

  if (taskCount === 0) {
    DOM.timerTaskSelect.innerHTML = `<option value="">General Study Block (No tasks logged)</option>`;
  }
}

function setTimerMode(mode) {
  DOM.clockModeButtons.forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
  });
  
  timerEngine.activeMode = mode;
  const secs = POMO_MODES[mode] || 1500;
  timerEngine.secondsLeft = secs;
  timerEngine.totalSeconds = secs;

  // Set colors based on modes
  let ringColor = PALETTE_THEMES.blue;
  if (mode === "short-break") ringColor = PALETTE_THEMES.teal;
  else if (mode === "long-break") ringColor = PALETTE_THEMES.purple;
  document.getElementById("timerProgressRing").style.stroke = ringColor;

  updateClockTimeDigits();
  updateClockProgressRing();
}

function startPomodoroTimer() {
  if (timerEngine.active && !timerEngine.paused) return;

  timerEngine.active = true;
  timerEngine.paused = false;

  DOM.timerTaskSelect.disabled = true;
  DOM.clockStartBtn.classList.add("hidden");
  DOM.clockPauseBtn.classList.remove("hidden");
  DOM.clockResetBtn.disabled = false;

  // Trigger focus audio play if selected
  const activeAudio = DOM.focusAudioSelect.value;
  if (activeAudio !== "none") {
    playSyntheticFocusAudio(activeAudio);
  }

  timerEngine.intervalId = setInterval(() => {
    timerEngine.secondsLeft--;
    updateClockTimeDigits();
    updateClockProgressRing();

    if (timerEngine.secondsLeft <= 0) {
      clearInterval(timerEngine.intervalId);
      handlePomodoroTimerCompletion();
    }
  }, 1000);
}

function pausePomodoroTimer() {
  if (!timerEngine.active || timerEngine.paused) return;

  timerEngine.paused = true;
  clearInterval(timerEngine.intervalId);

  DOM.clockPauseBtn.classList.add("hidden");
  DOM.clockStartBtn.classList.remove("hidden");
  
  // Pause focus audio play
  stopSyntheticFocusAudio();
}

function resetPomodoroTimer() {
  clearInterval(timerEngine.intervalId);
  timerEngine.active = false;
  timerEngine.paused = false;
  
  DOM.timerTaskSelect.disabled = false;
  DOM.clockPauseBtn.classList.add("hidden");
  DOM.clockStartBtn.classList.remove("hidden");
  DOM.clockResetBtn.disabled = true;

  stopSyntheticFocusAudio();
  setTimerMode(timerEngine.activeMode);
}

function updateClockTimeDigits() {
  const mins = Math.floor(timerEngine.secondsLeft / 60);
  const secs = timerEngine.secondsLeft % 60;
  DOM.clockMinutes.textContent = String(mins).padStart(2, "0");
  DOM.clockSeconds.textContent = String(secs).padStart(2, "0");
}

function updateClockProgressRing() {
  const ring = DOM.timerProgressRing;
  // Circumference = 2 * pi * r = 2 * 3.14159 * 90 = 565.48
  const offset = 565.48 * (timerEngine.secondsLeft / timerEngine.totalSeconds);
  ring.style.strokeDashoffset = 565.48 - offset;
}

function handlePomodoroTimerCompletion() {
  const mode = timerEngine.activeMode;
  const taskId = DOM.timerTaskSelect.value;
  const duration = Math.round(timerEngine.totalSeconds / 60);

  resetPomodoroTimer();

  // If focus session complete, open log dialog modal
  if (mode === "focus") {
    openSessionLogModal(taskId, duration);
  } else {
    alert("Break session finished! Time to focus.");
  }
}

// Session completion log modal
function openSessionLogModal(taskId, duration) {
  DOM.sessionLogModal.classList.remove("hidden");
  DOM.sessionLogForm.reset();

  DOM.logSessionTaskId.value = taskId;
  DOM.logSessionDuration.value = duration;
  DOM.logSessionTaskTitle.textContent = taskId ? getTaskText(taskId).split(": ")[1] : "General Focus Block";
  DOM.logSessionDurationFormatted.textContent = `${duration} minutes completed`;
}

function closeSessionLogModal() {
  DOM.sessionLogModal.classList.add("hidden");
}

function handleSessionLogSubmit(e) {
  e.preventDefault();

  const taskId = DOM.logSessionTaskId.value;
  const duration = parseFloat(DOM.logSessionDuration.value) || 25;
  const rating = parseInt(DOM.logSessionEfficacySelect.value) || 4;
  const notes = DOM.logSessionNotes.value.trim();

  state.sessions.push({
    id: "s-" + Date.now(),
    taskId,
    date: new Date().toISOString().split("T")[0],
    duration,
    rating,
    notes: notes || `Completed ${duration}m focused pomodoro study block.`
  });

  saveStateToStorage();
  closeSessionLogModal();
  renderTimerView();
}

function renderTimerLogsTable() {
  DOM.timerHistoryTableBody.innerHTML = "";
  
  // Sort descending
  const sorted = [...state.sessions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (sorted.length === 0) {
    DOM.timerHistoryEmptyState.classList.remove("hidden");
    return;
  }
  DOM.timerHistoryEmptyState.classList.add("hidden");

  sorted.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.date}</td>
      <td><strong>${getTaskText(s.taskId).split(": ")[1] || s.taskId || "General Focus"}</strong></td>
      <td>${s.duration} mins</td>
      <td class="text-right">
        <button class="btn btn-danger-outline btn-sm delete-log-btn" data-id="${s.id}">Delete</button>
      </td>
    `;
    
    tr.querySelector(".delete-log-btn").addEventListener("click", () => {
      if (confirm("Remove this session log from database?")) {
        state.sessions = state.sessions.filter(item => item.id !== s.id);
        saveStateToStorage();
        renderTimerLogsTable();
      }
    });

    DOM.timerHistoryTableBody.appendChild(tr);
  });
}

function initTimerEvents() {
  // Clock Buttons
  DOM.clockStartBtn.addEventListener("click", startPomodoroTimer);
  DOM.clockPauseBtn.addEventListener("click", pausePomodoroTimer);
  DOM.clockResetBtn.addEventListener("click", resetPomodoroTimer);

  DOM.clockModeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      setTimerMode(mode);
    });
  });

  // Ambient Sounds
  DOM.focusAudioSelect.addEventListener("change", (e) => {
    const mode = e.target.value;
    if (timerEngine.active && !timerEngine.paused) {
      playSyntheticFocusAudio(mode);
    }
  });

  DOM.focusAudioVolume.addEventListener("input", handleVolumeChange);

  // Form Log Completion
  DOM.skipSessionLogBtn.addEventListener("click", () => {
    if (confirm("Discard this focus session history?")) {
      closeSessionLogModal();
      renderTimerView();
    }
  });
  DOM.sessionLogForm.addEventListener("submit", handleSessionLogSubmit);
}

// ==========================================================================
// STUDY DECKS SUBJECT WORKSPACE
// ==========================================================================
function renderDecksGrid() {
  DOM.decksGridContainer.innerHTML = "";

  if (state.decks.length === 0) {
    DOM.decksEmptyState.classList.remove("hidden");
    return;
  }
  DOM.decksEmptyState.classList.add("hidden");

  state.decks.forEach((deck, deckIdx) => {
    const color = PALETTE_THEMES[deck.theme] || PALETTE_THEMES.blue;
    const completedTasks = deck.tasks.filter(t => t.completed).length;
    const totalTasks = deck.tasks.length;
    
    const card = document.createElement("div");
    card.className = "deck-card";
    card.setAttribute("style", `--deck-theme-color:${color}`);
    card.innerHTML = `
      <div class="deck-card-header">
        <div>
          <h3>${deck.title}</h3>
          <p>${deck.desc}</p>
        </div>
        <button class="btn-icon delete-deck-btn" title="Delete subject scope">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>

      <div class="deck-card-tasks-list">
        <!-- Render tasks loops -->
      </div>

      <div class="deck-card-footer">
        <span class="deck-card-stats">${completedTasks}/${totalTasks} Tasks complete</span>
        <div class="deck-card-actions">
          <button class="btn btn-secondary btn-sm add-task-btn">+ Task</button>
        </div>
      </div>
    `;

    // Render task checklists
    const listBody = card.querySelector(".deck-card-tasks-list");
    if (totalTasks === 0) {
      listBody.innerHTML = `<p style="font-size:12px; color:var(--text-muted); text-align:center; padding:12px 0;">No tasks scheduled for this subject.</p>`;
    } else {
      deck.tasks.forEach(t => {
        const row = document.createElement("div");
        row.className = "deck-task-row";
        row.innerHTML = `
          <label class="deck-task-label ${t.completed ? 'checked' : ''}">
            <input type="checkbox" ${t.completed ? 'checked' : ''}>
            <span>${t.text}</span>
          </label>
          <div class="deck-task-meta">
            <span class="pomo-estimate-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${t.pomos} pomo
            </span>
            <span class="delete-deck-task" title="Delete task">✕</span>
          </div>
        `;

        // Check box toggles
        row.querySelector("input").addEventListener("change", (e) => {
          t.completed = e.target.checked;
          saveStateToStorage();
          renderDecksGrid();
        });

        // Delete task click
        row.querySelector(".delete-deck-task").addEventListener("click", () => {
          if (confirm(`Remove task card: "${t.text}"?`)) {
            deck.tasks = deck.tasks.filter(item => item.id !== t.id);
            saveStateToStorage();
            renderDecksGrid();
          }
        });

        listBody.appendChild(row);
      });
    }

    // Decks card actions binding
    card.querySelector(".delete-deck-btn").addEventListener("click", () => {
      // Confirm referencing flashcards or sessions before deletion
      const references = state.flashcards.filter(fc => fc.deckId === deck.id);
      if (references.length > 0) {
        alert(`Cannot delete subject because there are ${references.length} flashcards registered under this deck.`);
        return;
      }

      if (confirm(`Are you sure you want to permanently delete subject deck '${deck.title}'?`)) {
        state.decks.splice(deckIdx, 1);
        saveStateToStorage();
        renderDecksGrid();
      }
    });

    card.querySelector(".add-task-btn").addEventListener("click", () => {
      openDeckTaskModal(deck.id);
    });

    DOM.decksGridContainer.appendChild(card);
  });
}

// Subject modal controllers
function openSubjectModal() {
  DOM.subjectModal.classList.remove("hidden");
  DOM.subjectForm.reset();
  document.getElementById("th-blue").checked = true;
}

function closeSubjectModal() {
  DOM.subjectModal.classList.add("hidden");
}

function handleSubjectFormSubmit(e) {
  e.preventDefault();

  const title = DOM.subjectTitleInput.value.trim();
  const desc = DOM.subjectDescInput.value.trim();
  const theme = document.querySelector('input[name="subjTheme"]:checked').value;

  state.decks.push({
    id: "d-" + Date.now(),
    title,
    desc,
    theme,
    tasks: []
  });

  saveStateToStorage();
  closeSubjectModal();
  renderDecksGrid();
}

// Deck tasks modal controllers
function openDeckTaskModal(subjectId) {
  DOM.deckTaskModal.classList.remove("hidden");
  DOM.deckTaskForm.reset();
  DOM.deckTaskSubjectId.value = subjectId;
}

function closeDeckTaskModal() {
  DOM.deckTaskModal.classList.add("hidden");
}

function handleDeckTaskFormSubmit(e) {
  e.preventDefault();

  const subjectId = DOM.deckTaskSubjectId.value;
  const taskText = DOM.deckTaskTitleInput.value.trim();
  const pomos = parseInt(DOM.deckTaskPomosInput.value) || 2;

  const deck = state.decks.find(d => d.id === subjectId);
  if (deck) {
    deck.tasks.push({
      id: "t-" + Date.now(),
      text: taskText,
      completed: false,
      pomos: pomos
    });

    saveStateToStorage();
    closeDeckTaskModal();
    renderDecksGrid();
  }
}

function initDecksEvents() {
  DOM.addNewSubjectBtn.addEventListener("click", openSubjectModal);
  DOM.closeSubjectModalBtn.addEventListener("click", closeSubjectModal);
  DOM.cancelSubjectBtn.addEventListener("click", closeSubjectModal);
  DOM.subjectForm.addEventListener("submit", handleSubjectFormSubmit);

  DOM.closeDeckTaskModalBtn.addEventListener("click", closeDeckTaskModal);
  DOM.cancelDeckTaskBtn.addEventListener("click", closeDeckTaskModal);
  DOM.deckTaskForm.addEventListener("submit", handleDeckTaskFormSubmit);
}

// ==========================================================================
// ACTIVE RECALL FLASHCARDS WORKSPACE
// ==========================================================================
let activeFlashcardsDeckId = "all";
let currentFlashcardIndex = 0;
let filteredFlashcardsList = [];

function renderFlashcardsView() {
  populateFlashcardsDeckSelectors();

  filteredFlashcardsList = state.flashcards.filter(fc => {
    return activeFlashcardsDeckId === "all" || fc.deckId === activeFlashcardsDeckId;
  });

  currentFlashcardIndex = 0;

  if (filteredFlashcardsList.length === 0) {
    DOM.flashcardsInteractiveArea.classList.add("hidden");
    DOM.flashcardsEmptyState.classList.remove("hidden");
    return;
  }
  DOM.flashcardsInteractiveArea.classList.remove("hidden");
  DOM.flashcardsEmptyState.classList.add("hidden");

  loadActiveFlashcardDetails();
}

function populateFlashcardsDeckSelectors() {
  const currentSelect = DOM.flashcardDeckSelect.value;
  DOM.flashcardDeckSelect.innerHTML = `<option value="all">All Subject Decks</option>`;
  state.decks.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.title;
    DOM.flashcardDeckSelect.appendChild(opt);
  });
  if (state.decks.some(d => d.id === currentSelect)) {
    DOM.flashcardDeckSelect.value = currentSelect;
  }
}

function loadActiveFlashcardDetails() {
  // Reset card 3D flip animation state to front face
  DOM.flashcardSelectorElement.classList.remove("flipped");
  DOM.cardConfidenceSelector.classList.add("hidden");

  const fc = filteredFlashcardsList[currentFlashcardIndex];
  if (fc) {
    DOM.cardFrontText.textContent = fc.question;
    DOM.cardBackText.textContent = fc.answer;
    DOM.flashcardProgressCounter.textContent = `${currentFlashcardIndex + 1} of ${filteredFlashcardsList.length} cards`;

    // Apply subject theme color boundaries onto flashcard border
    const deck = state.decks.find(d => d.id === fc.deckId);
    const color = deck ? PALETTE_THEMES[deck.theme] : PALETTE_THEMES.blue;
    document.getElementById("flashcardSelectorElement").style.setProperty("--primary", color);
  }
}

function handleFlashcardFaceFlip() {
  DOM.flashcardSelectorElement.classList.toggle("flipped");
  
  // Show confidence rating actions when flipped back (answering face)
  const isFlipped = DOM.flashcardSelectorElement.classList.contains("flipped");
  DOM.cardConfidenceSelector.classList.toggle("hidden", !isFlipped);
}

function handleRecallConfidenceRate(level) {
  const fc = filteredFlashcardsList[currentFlashcardIndex];
  if (fc) {
    fc.confidence = level;
    if (!fc.reviewsCount) fc.reviewsCount = 0;
    fc.reviewsCount++;

    saveStateToStorage();

    // Auto navigate to next card after brief visual delay
    setTimeout(() => {
      if (currentFlashcardIndex < filteredFlashcardsList.length - 1) {
        currentFlashcardIndex++;
        loadActiveFlashcardDetails();
      } else {
        alert("Deck completed! Good job reviewing cards.");
        renderFlashcardsView();
      }
    }, 300);
  }
}

// Add flashcards modal controllers
function populateFlashcardModalDecks() {
  DOM.flashcardModalDeckSelect.innerHTML = "";
  state.decks.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.title;
    DOM.flashcardModalDeckSelect.appendChild(opt);
  });
}

function openFlashcardModal() {
  if (state.decks.length === 0) {
    alert("Add at least one curriculum subject deck before creating flashcards.");
    return;
  }

  DOM.flashcardModal.classList.remove("hidden");
  DOM.flashcardForm.reset();
  populateFlashcardModalDecks();
  if (activeFlashcardsDeckId !== "all") {
    DOM.flashcardModalDeckSelect.value = activeFlashcardsDeckId;
  }
}

function closeFlashcardModal() {
  DOM.flashcardModal.classList.add("hidden");
}

function handleFlashcardFormSubmit(e) {
  e.preventDefault();

  const deckId = DOM.flashcardModalDeckSelect.value;
  const question = DOM.flashcardQuestionInput.value.trim();
  const answer = DOM.flashcardAnswerInput.value.trim();

  state.flashcards.push({
    id: "fc-" + Date.now(),
    deckId,
    question,
    answer,
    confidence: "redo",
    reviewsCount: 0
  });

  saveStateToStorage();
  closeFlashcardModal();
  renderFlashcardsView();
}

function initFlashcardEvents() {
  DOM.flashcardDeckSelect.addEventListener("change", (e) => {
    activeFlashcardsDeckId = e.target.value;
    renderFlashcardsView();
  });

  DOM.cardFlipBtn.addEventListener("click", handleFlashcardFaceFlip);
  DOM.flashcardSelectorElement.addEventListener("click", handleFlashcardFaceFlip);

  DOM.cardPrevBtn.addEventListener("click", () => {
    if (currentFlashcardIndex > 0) {
      currentFlashcardIndex--;
      loadActiveFlashcardDetails();
    }
  });

  DOM.cardNextBtn.addEventListener("click", () => {
    if (currentFlashcardIndex < filteredFlashcardsList.length - 1) {
      currentFlashcardIndex++;
      loadActiveFlashcardDetails();
    }
  });

  // Confidence indicators bindings
  DOM.confRedoBtn.addEventListener("click", () => handleRecallConfidenceRate("redo"));
  DOM.confHardBtn.addEventListener("click", () => handleRecallConfidenceRate("hard"));
  DOM.confEasyBtn.addEventListener("click", () => handleRecallConfidenceRate("easy"));

  DOM.addNewCardBtn.addEventListener("click", openFlashcardModal);
  DOM.closeFlashcardModalBtn.addEventListener("click", closeFlashcardModal);
  DOM.cancelFlashcardBtn.addEventListener("click", closeFlashcardModal);
  DOM.flashcardForm.addEventListener("submit", handleFlashcardFormSubmit);
}

// ==========================================================================
// SETTINGS PREFERENCES MANAGER
// ==========================================================================
function loadSettingsTab() {
  DOM.settingsWeeklyMinutesGoal.value = state.settings.weeklyMinutesGoal || 120;
}

function handleSaveSettings(e) {
  e.preventDefault();
  state.settings.weeklyMinutesGoal = parseInt(DOM.settingsWeeklyMinutesGoal.value) || 120;
  saveStateToStorage();
  alert("Weekly study targets saved successfully.");
}

function exportDatabaseBackup() {
  const database = {
    version: "1.0",
    decks: state.decks,
    sessions: state.sessions,
    flashcards: state.flashcards,
    settings: state.settings
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(database, null, 2));
  const anchor = document.createElement("a");
  anchor.setAttribute("href", dataStr);
  anchor.setAttribute("download", `focusflow_backup_${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function importDatabaseBackup(e) {
  const reader = new FileReader();
  const file = e.target.files[0];
  if (!file) return;

  reader.onload = function(event) {
    try {
      const parsed = JSON.parse(event.target.result);
      if (parsed.decks && parsed.sessions && parsed.flashcards && parsed.settings) {
        state.decks = parsed.decks;
        state.sessions = parsed.sessions;
        state.flashcards = parsed.flashcards;
        state.settings = parsed.settings;
        
        saveStateToStorage();
        alert("FocusFlow Curriculum Database Backup restored successfully.");
        window.location.reload();
      } else {
        alert("Incorrect backup file schema. Needs subjects decks, sessions logged, flashcards, and settings keys.");
      }
    } catch (err) {
      alert("Error parsing backup database file.");
    }
  };

  reader.readAsText(file);
}

function resetDatabaseToSeeds() {
  if (confirm("WARNING: Wiping workspace will reset all study subjects, logged sessions, and flashcards back to default dummy seed values. Continue?")) {
    localStorage.removeItem(STORAGE_KEYS.DECKS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.FLASHCARDS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    window.location.reload();
  }
}

function initSettingsEvents() {
  DOM.goalsConfigForm.addEventListener("submit", handleSaveSettings);
  DOM.exportBackupBtn.addEventListener("click", exportDatabaseBackup);
  DOM.importBackupInput.addEventListener("change", importDatabaseBackup);
  DOM.resetDatabaseBtn.addEventListener("click", resetDatabaseToSeeds);
}

// ==========================================================================
// CORE APP ENTRYPOINT INITIALIZER
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initDatabase();
  initThemeToggle();
  initAppRouting();
  initTimerEvents();
  initDecksEvents();
  initFlashcardEvents();
  initSettingsEvents();

  // Load first screen states
  renderDashboard();
  loadSettingsTab();
});
