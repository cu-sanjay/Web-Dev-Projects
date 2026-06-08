// State Management Engine
const AppState = {
  tasks: [],
  goals: [],
  notes: [],
  focusHistory: [],
  habits: [],
  journalEntries: [],
  activeNoteId: null,
  theme: 'dark',
  timer: {
    duration: 25 * 60, // in seconds
    timeLeft: 25 * 60,
    isRunning: false,
    intervalId: null,
    mode: 'work', // 'work', 'short-break', 'long-break'
    soundEnabled: true,
    customWork: 25,
    customShort: 5,
    customLong: 15
  },
  achievements: [
    { id: 'first-task', name: 'Starting Line', desc: 'Complete your first task', unlocked: false, badge: '🎯' },
    { id: 'three-tasks', name: 'Task Slayer', desc: 'Complete 3 tasks in total', unlocked: false, badge: '⚔️' },
    { id: 'first-session', name: 'Deep Work', desc: 'Complete 1 Pomodoro session', unlocked: false, badge: '⏱️' },
    { id: 'three-sessions', name: 'Hyper Focus', desc: 'Complete 3 focus sessions', unlocked: false, badge: '🔥' },
    { id: 'first-goal', name: 'Achiever', desc: 'Reach 100% completion on a goal', unlocked: false, badge: '🏆' },
    { id: 'habit-streak', name: 'Streak Builder', desc: 'Log a completed day on any habit', unlocked: false, badge: '⚡' },
    { id: 'journal-entry', name: 'Self Reflector', desc: 'Log your first journal entry', unlocked: false, badge: '✍️' },
    { id: 'all-clear', name: 'Command Commander', desc: 'Unlock all other achievements', unlocked: false, badge: '👑' }
  ]
};

// Quotes Database
const Quotes = [
  "Focus on being productive instead of busy.",
  "Your mind is for having ideas, not holding them.",
  "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
  "Action is the foundational key to all success.",
  "Done is better than perfect.",
  "Small daily improvements over time lead to stunning results.",
  "Believe you can and you're halfway there.",
  "It always seems impossible until it's done.",
  "The best way to predict the future is to create it."
];

// Audio Synthesis using Web Audio API (cross-browser compatible)
const AudioSynth = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playTick() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context block safety
    }
  },
  playChime() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.3); // G5
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch (e) {
      // Audio safety
    }
  }
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupUI();
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 1000);
  randomizeQuote();
  renderAll();
});

// Load / Save States
function loadData() {
  const saved = localStorage.getItem("productivity_cmd_center_data");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      AppState.tasks = parsed.tasks || [];
      AppState.goals = parsed.goals || [];
      AppState.notes = parsed.notes || [];
      AppState.focusHistory = parsed.focusHistory || [];
      AppState.habits = parsed.habits || [];
      AppState.journalEntries = parsed.journalEntries || [];
      AppState.theme = parsed.theme || 'dark';
      AppState.timer.customWork = parsed.customWork || 25;
      AppState.timer.customShort = parsed.customShort || 5;
      AppState.timer.customLong = parsed.customLong || 15;
      
      // Load achievements state
      if (parsed.achievements) {
        AppState.achievements.forEach(ach => {
          const matching = parsed.achievements.find(a => a.id === ach.id);
          if (matching) ach.unlocked = matching.unlocked;
        });
      }
    } catch (e) {
      console.error("Failed to load workspace data", e);
    }
  }
  
  // Set theme class on body
  document.body.className = AppState.theme === 'light' ? 'light-theme' : 'dark-theme';
}

function saveData() {
  const data = {
    tasks: AppState.tasks,
    goals: AppState.goals,
    notes: AppState.notes,
    focusHistory: AppState.focusHistory,
    habits: AppState.habits,
    journalEntries: AppState.journalEntries,
    theme: AppState.theme,
    customWork: AppState.timer.customWork,
    customShort: AppState.timer.customShort,
    customLong: AppState.timer.customLong,
    achievements: AppState.achievements
  };
  localStorage.setItem("productivity_cmd_center_data", JSON.stringify(data));
}

// UI Interaction Bindings
function setupUI() {
  // Sidebar Panel Swaps
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetPanel = btn.getAttribute("data-panel");
      switchPanel(targetPanel);
    });
  });

  // Theme Toggler
  document.getElementById("btn-theme-toggle").addEventListener("click", toggleTheme);

  // Quote Picker click
  document.getElementById("quote-container").addEventListener("click", randomizeQuote);

  // Setup Tasks Event Listeners
  document.getElementById("btn-add-task-modal").addEventListener("click", () => showTaskModal());
  document.getElementById("btn-close-task-modal").addEventListener("click", hideTaskModal);
  document.getElementById("task-modal-form").addEventListener("submit", handleTaskFormSubmit);
  document.getElementById("task-search-input").addEventListener("input", renderTasksList);
  document.getElementById("task-filter-priority").addEventListener("change", renderTasksList);

  // Goals Form Submit
  document.getElementById("goal-creator-form").addEventListener("submit", handleGoalFormSubmit);
  document.querySelectorAll(".goal-filter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".goal-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderGoals();
    });
  });

  // Notes event listeners
  document.getElementById("btn-new-note").addEventListener("click", handleCreateNewNote);
  document.getElementById("note-title-input").addEventListener("input", handleNoteEdit);
  document.getElementById("note-content-input").addEventListener("input", handleNoteEdit);
  document.getElementById("note-category-input").addEventListener("change", handleNoteEdit);
  document.getElementById("btn-delete-note").addEventListener("click", handleDeleteNote);
  document.getElementById("notes-search").addEventListener("input", renderNotesSidebar);

  // Timer Focus event listeners
  document.getElementById("btn-timer-toggle").addEventListener("click", toggleTimer);
  document.getElementById("btn-dash-timer-toggle").addEventListener("click", toggleTimer);
  document.getElementById("btn-timer-reset").addEventListener("click", resetTimer);
  document.getElementById("btn-dash-timer-reset").addEventListener("click", resetTimer);
  document.getElementById("btn-timer-sound").addEventListener("click", toggleTimerSound);

  document.querySelectorAll(".timer-mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".timer-mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const duration = parseInt(btn.getAttribute("data-duration"));
      const mode = btn.getAttribute("data-mode");
      setTimerMode(mode, duration);
    });
  });

  document.getElementById("btn-apply-settings").addEventListener("click", () => {
    AppState.timer.customWork = parseInt(document.getElementById("custom-work-time").value) || 25;
    AppState.timer.customShort = parseInt(document.getElementById("custom-short-time").value) || 5;
    AppState.timer.customLong = parseInt(document.getElementById("custom-long-time").value) || 15;
    saveData();
    
    // Apply if active
    const activeModeBtn = document.querySelector(".timer-mode-btn.active");
    if (activeModeBtn) {
      const mode = activeModeBtn.getAttribute("data-mode");
      if (mode === 'work') setTimerMode('work', AppState.timer.customWork);
      else if (mode === 'short-break') setTimerMode('short-break', AppState.timer.customShort);
      else if (mode === 'long-break') setTimerMode('long-break', AppState.timer.customLong);
    }
  });

  // Habits Tracker Add Habit
  document.getElementById("btn-add-habit").addEventListener("click", handleAddHabitPrompt);
  
  // Journal Save Form
  document.getElementById("btn-save-journal").addEventListener("click", handleSaveJournal);

  // Dashboard Nav Links Shortcuts
  document.getElementById("dash-timer-go-btn").addEventListener("click", () => switchPanel("focus"));
  document.getElementById("dash-habits-go-btn").addEventListener("click", () => switchPanel("habits"));
  document.getElementById("dash-tasks-go-btn").addEventListener("click", () => switchPanel("tasks"));

  // Keyboard Shortcuts Registration
  window.addEventListener("keydown", handleKeyboardShortcuts);

  // Export File Data
  document.getElementById("btn-export-data").addEventListener("click", exportDataJSON);

  // Import File trigger
  document.getElementById("btn-import-trigger").addEventListener("click", () => {
    document.getElementById("import-file-input").click();
  });
  document.getElementById("import-file-input").addEventListener("change", importDataJSON);

  // Drag and Drop support
  setupDragAndDrop();
}

// Global Routing Panel Swapping
function switchPanel(panelName) {
  // Toggle nav classes
  document.querySelectorAll(".nav-btn").forEach(btn => {
    if (btn.getAttribute("data-panel") === panelName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Toggle panel visibility
  document.querySelectorAll(".content-panel").forEach(panel => {
    if (panel.id === `panel-${panelName}`) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });

  // Update Page Title headings
  const titleEl = document.getElementById("current-panel-title");
  const subtitleEl = document.getElementById("current-panel-subtitle");
  
  const titles = {
    dashboard: ["Dashboard Overview", "Welcome back! Here is a summary of your workspace."],
    tasks: ["Task Management Board", "Organize, sequence, and execute your current objectives."],
    goals: ["Goal Tracking Milestones", "Set targets, progress metrics, and challenge accomplishments."],
    notes: ["Notes Vault", "Record thoughts, documents, snippets, and project checklists."],
    focus: ["Focus Center & Timer", "Maximize productivity using custom deep work sessions."],
    habits: ["Habits & Reflection Journal", "Log recurring behaviors and daily reflections."],
    achievements: ["Achievements & Milestones", "Unlocked metrics for focus milestones and task consistency."],
    analytics: ["Work Analytics", "Visual performance logs for task categories and time spent."]
  };

  if (titles[panelName]) {
    titleEl.textContent = titles[panelName][0];
    subtitleEl.textContent = titles[panelName][1];
  }

  // Trigger charts re-draw on panel reveal
  if (panelName === 'analytics') {
    setTimeout(renderAnalyticsCharts, 50);
  }
}

// Time & date display calculations
function updateTimeDisplay() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  
  const clockEl = document.getElementById("clock-display");
  const dateEl = document.getElementById("date-display");
  if (clockEl) clockEl.textContent = timeStr;
  if (dateEl) dateEl.textContent = dateStr;
}

// Quotes Picker
function randomizeQuote() {
  const qContainer = document.getElementById("quote-container");
  if (qContainer) {
    const idx = Math.floor(Math.random() * Quotes.length);
    qContainer.querySelector(".quote-text").textContent = `"${Quotes[idx]}"`;
  }
}

// Theme Engine Toggler
function toggleTheme() {
  const themeBtn = document.getElementById("btn-theme-toggle");
  if (AppState.theme === 'dark') {
    AppState.theme = 'light';
    document.body.className = 'light-theme';
    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    AppState.theme = 'dark';
    document.body.className = 'dark-theme';
    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
  saveData();
  
  // Re-draw charts to fit current theme text contrast
  const analyticsPanel = document.getElementById("panel-analytics");
  if (analyticsPanel && analyticsPanel.classList.contains("active")) {
    renderAnalyticsCharts();
  }
}

// Keyboard shortcuts handlers
function handleKeyboardShortcuts(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
    return; // Don't trigger shortcuts during entry typing
  }

  if (e.altKey) {
    switch (e.key.toLowerCase()) {
      case 'd': e.preventDefault(); switchPanel('dashboard'); break;
      case 't': e.preventDefault(); switchPanel('tasks'); break;
      case 'g': e.preventDefault(); switchPanel('goals'); break;
      case 'n': e.preventDefault(); switchPanel('notes'); break;
      case 'f': e.preventDefault(); switchPanel('focus'); break;
      case 'h': e.preventDefault(); switchPanel('habits'); break;
      case 'a': e.preventDefault(); switchPanel('achievements'); break;
      case 'p': e.preventDefault(); toggleTimer(); break;
      case 'l': e.preventDefault(); toggleTheme(); break;
    }
  }
}

// Data Export & Import IO
function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("productivity_cmd_center_data") || "{}");
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "workspace_backup.json");
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
}

function importDataJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (imported) {
        localStorage.setItem("productivity_cmd_center_data", JSON.stringify(imported));
        loadData();
        renderAll();
        alert("Workspace imported successfully!");
      }
    } catch (err) {
      alert("Invalid JSON file uploaded.");
    }
  };
  reader.readAsText(file);
}

// -------------------------------------------------------------------
// TASK MANAGEMENT CORE
// -------------------------------------------------------------------

function showTaskModal(taskId = null) {
  const modal = document.getElementById("task-modal");
  const form = document.getElementById("task-modal-form");
  const titleEl = document.getElementById("task-modal-title");
  const editIdEl = document.getElementById("task-modal-edit-id");
  
  form.reset();
  modal.classList.add("active");
  
  if (taskId) {
    titleEl.textContent = "Edit Existing Task";
    const task = AppState.tasks.find(t => t.id === taskId);
    if (task) {
      editIdEl.value = task.id;
      document.getElementById("task-title-field").value = task.title;
      document.getElementById("task-desc-field").value = task.description || "";
      document.getElementById("task-priority-field").value = task.priority;
      document.getElementById("task-due-field").value = task.dueDate || "";
      document.getElementById("task-tags-field").value = (task.tags || []).join(", ");
    }
  } else {
    titleEl.textContent = "Create New Task";
    editIdEl.value = "";
  }
}

function hideTaskModal() {
  document.getElementById("task-modal").classList.remove("active");
}

function handleTaskFormSubmit(e) {
  e.preventDefault();
  
  const editId = document.getElementById("task-modal-edit-id").value;
  const title = document.getElementById("task-title-field").value.trim();
  const description = document.getElementById("task-desc-field").value.trim();
  const priority = document.getElementById("task-priority-field").value;
  const dueDate = document.getElementById("task-due-field").value;
  const tagsText = document.getElementById("task-tags-field").value;
  const tags = tagsText ? tagsText.split(",").map(t => t.trim()).filter(t => t.length > 0) : [];
  
  if (editId) {
    // Edit Mode
    const task = AppState.tasks.find(t => t.id === editId);
    if (task) {
      task.title = title;
      task.description = description;
      task.priority = priority;
      task.dueDate = dueDate;
      task.tags = tags;
    }
  } else {
    // Add Mode
    const newTask = {
      id: "task_" + Date.now(),
      title,
      description,
      priority,
      dueDate,
      tags,
      status: "todo",
      createdAt: new Date().toISOString()
    };
    AppState.tasks.push(newTask);
  }
  
  saveData();
  hideTaskModal();
  renderTasksList();
  renderDashboard();
}

function updateTaskStatus(taskId, newStatus) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    
    // Achievement checks
    if (newStatus === 'completed') {
      checkAchievement('first-task');
      const completedTotal = AppState.tasks.filter(t => t.status === 'completed').length;
      if (completedTotal >= 3) {
        checkAchievement('three-tasks');
      }
    }
    
    saveData();
    renderTasksList();
    renderDashboard();
  }
}

function deleteTask(taskId) {
  AppState.tasks = AppState.tasks.filter(t => t.id !== taskId);
  saveData();
  renderTasksList();
  renderDashboard();
}

function renderTasksList() {
  const search = document.getElementById("task-search-input").value.toLowerCase();
  const filterPrio = document.getElementById("task-filter-priority").value;
  
  const containers = {
    todo: document.getElementById("container-todo"),
    "in-progress": document.getElementById("container-in-progress"),
    completed: document.getElementById("container-completed")
  };
  
  // Clear
  Object.values(containers).forEach(c => {
    if (c) c.innerHTML = "";
  });
  
  const filtered = AppState.tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search) || 
                          (t.description && t.description.toLowerCase().includes(search)) ||
                          (t.tags && t.tags.some(tag => tag.toLowerCase().includes(search)));
    const matchesPrio = filterPrio === 'all' || t.priority === filterPrio;
    return matchesSearch && matchesPrio;
  });
  
  const counts = { todo: 0, "in-progress": 0, completed: 0 };
  
  filtered.forEach(task => {
    counts[task.status]++;
    const card = createTaskCardElement(task);
    if (containers[task.status]) {
      containers[task.status].appendChild(card);
    }
  });
  
  // Set badges
  const badgeTodo = document.getElementById("badge-todo-count");
  const badgeProgress = document.getElementById("badge-inprogress-count");
  const badgeComplete = document.getElementById("badge-completed-count");
  
  if (badgeTodo) badgeTodo.textContent = counts.todo;
  if (badgeProgress) badgeProgress.textContent = counts["in-progress"];
  if (badgeComplete) badgeComplete.textContent = counts.completed;
}

function createTaskCardElement(task) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.draggable = true;
  card.setAttribute("data-id", task.id);
  
  const hasDesc = task.description ? `<p class="task-card-description">${task.description}</p>` : '';
  const dueMarkup = task.dueDate ? `<span class="task-card-due"><i class="fa-regular fa-calendar-days"></i> ${task.dueDate}</span>` : '<span></span>';
  
  card.innerHTML = `
    <div class="task-card-header">
      <div class="task-card-title">${task.title}</div>
      <div class="task-card-priority-dot prio-${task.priority}" title="${task.priority} priority"></div>
    </div>
    ${hasDesc}
    <div class="task-card-footer">
      ${dueMarkup}
      <div class="task-card-actions">
        ${task.status !== 'completed' ? `<button class="task-btn-action act-complete" onclick="updateTaskStatus('${task.id}', 'completed')" title="Complete"><i class="fa-regular fa-circle-check"></i></button>` : ''}
        <button class="task-btn-action act-edit" onclick="showTaskModal('${task.id}')" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
        <button class="task-btn-action act-delete" onclick="deleteTask('${task.id}')" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
      </div>
    </div>
  `;
  
  // Attach Drag start
  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    card.classList.add("dragging");
  });
  
  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });
  
  return card;
}

function setupDragAndDrop() {
  document.querySelectorAll(".column-cards-container").forEach(container => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      container.classList.add("drag-over");
    });
    
    container.addEventListener("dragleave", () => {
      container.classList.remove("drag-over");
    });
    
    container.addEventListener("drop", (e) => {
      e.preventDefault();
      container.classList.remove("drag-over");
      const taskId = e.dataTransfer.getData("text/plain");
      
      let newStatus = 'todo';
      if (container.id === 'container-in-progress') newStatus = 'in-progress';
      else if (container.id === 'container-completed') newStatus = 'completed';
      
      updateTaskStatus(taskId, newStatus);
    });
  });
}

// -------------------------------------------------------------------
// GOALS TRACKER SYSTEM
// -------------------------------------------------------------------

function handleGoalFormSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById("goal-title-input").value.trim();
  const timeframe = document.getElementById("goal-timeframe").value;
  const target = parseInt(document.getElementById("goal-target-val").value) || 1;
  const category = document.getElementById("goal-category").value.trim() || "General";
  
  const newGoal = {
    id: "goal_" + Date.now(),
    title,
    timeframe,
    current: 0,
    target,
    category,
    createdAt: new Date().toISOString()
  };
  
  AppState.goals.push(newGoal);
  saveData();
  
  document.getElementById("goal-creator-form").reset();
  renderGoals();
  renderDashboard();
}

function incrementGoal(goalId) {
  const goal = AppState.goals.find(g => g.id === goalId);
  if (goal) {
    if (goal.current < goal.target) {
      goal.current++;
      
      // Achievement checks
      if (goal.current === goal.target) {
        checkAchievement('first-goal');
      }
      
      saveData();
      renderGoals();
      renderDashboard();
    }
  }
}

function deleteGoal(goalId) {
  AppState.goals = AppState.goals.filter(g => g.id !== goalId);
  saveData();
  renderGoals();
  renderDashboard();
}

function renderGoals() {
  const container = document.getElementById("goals-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Filter
  const activeFilterBtn = document.querySelector(".goal-filter-btn.active");
  const timeframeFilter = activeFilterBtn ? activeFilterBtn.getAttribute("data-timeframe") : 'all';
  
  const filtered = AppState.goals.filter(g => {
    return timeframeFilter === 'all' || g.timeframe === timeframeFilter;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = `<p class="empty-message-inline">No goals configured for this view. Create one on the left!</p>`;
    return;
  }
  
  filtered.forEach(goal => {
    const card = document.createElement("div");
    card.className = "goal-card glass-card";
    
    const progressPct = Math.round((goal.current / goal.target) * 100);
    
    card.innerHTML = `
      <div class="goal-card-details">
        <div class="goal-title-row">
          <span class="goal-title">${goal.title}</span>
          <span class="goal-timeframe-tag">${goal.timeframe}</span>
        </div>
        <div class="goal-progress-bar-wrapper">
          <div class="goal-progress-fill" style="width: ${progressPct}%;"></div>
        </div>
        <div class="goal-completion-status">${goal.current} of ${goal.target} steps completed (${progressPct}%)</div>
      </div>
      <div class="goal-actions">
        ${goal.current < goal.target ? `<button class="btn-goal-step" onclick="incrementGoal('${goal.id}')" title="Increment step"><i class="fa-solid fa-plus"></i></button>` : `<span class="badge-success-glow"><i class="fa-solid fa-circle-check" style="color: var(--color-success);"></i></span>`}
        <button class="btn-goal-step" style="color: var(--color-danger);" onclick="deleteGoal('${goal.id}')" title="Delete Goal"><i class="fa-regular fa-trash-can"></i></button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// -------------------------------------------------------------------
// NOTES VAULT SYSTEM
// -------------------------------------------------------------------

function handleCreateNewNote() {
  const newNote = {
    id: "note_" + Date.now(),
    title: "Untitled Note",
    content: "",
    category: "General",
    updatedAt: new Date().toISOString()
  };
  
  AppState.notes.unshift(newNote);
  AppState.activeNoteId = newNote.id;
  
  saveData();
  renderNotesSidebar();
  openNoteEditor(newNote.id);
}

function handleNoteEdit() {
  if (!AppState.activeNoteId) return;
  
  const title = document.getElementById("note-title-input").value;
  const content = document.getElementById("note-content-input").value;
  const category = document.getElementById("note-category-input").value;
  
  const note = AppState.notes.find(n => n.id === AppState.activeNoteId);
  if (note) {
    note.title = title || "Untitled Note";
    note.content = content;
    note.category = category;
    note.updatedAt = new Date().toISOString();
    
    // Indicator flash
    const statusEl = document.getElementById("note-save-status");
    statusEl.textContent = "Saving...";
    
    // Update char counter
    const charCountEl = document.getElementById("note-char-counter");
    if (charCountEl) charCountEl.textContent = `${content.length} characters`;
    
    saveData();
    
    // Wait briefly and update sidebar item dynamically without losing focus
    clearTimeout(note.saveTimeout);
    note.saveTimeout = setTimeout(() => {
      renderNotesSidebar();
      statusEl.textContent = "Saved";
    }, 500);
  }
}

function handleDeleteNote() {
  if (!AppState.activeNoteId) return;
  
  AppState.notes = AppState.notes.filter(n => n.id !== AppState.activeNoteId);
  AppState.activeNoteId = null;
  
  saveData();
  renderNotesSidebar();
  
  // Close editor view
  document.getElementById("notes-editor-active-state").style.display = "none";
  document.getElementById("notes-editor-empty-state").style.display = "flex";
}

function renderNotesSidebar() {
  const search = document.getElementById("notes-search").value.toLowerCase();
  const listContainer = document.getElementById("notes-list-container");
  if (!listContainer) return;
  
  listContainer.innerHTML = "";
  
  const filtered = AppState.notes.filter(n => {
    return n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search);
  });
  
  filtered.forEach(note => {
    const card = document.createElement("div");
    card.className = `note-item-card ${note.id === AppState.activeNoteId ? 'active' : ''}`;
    
    const date = new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
    const snippet = note.content || 'Empty note content';
    
    card.innerHTML = `
      <div class="note-item-title">${note.title}</div>
      <div class="note-item-snippet">${snippet}</div>
      <div class="note-item-footer">
        <span class="note-item-tag">${note.category}</span>
        <span>${date}</span>
      </div>
    `;
    
    card.addEventListener("click", () => openNoteEditor(note.id));
    listContainer.appendChild(card);
  });
}

function openNoteEditor(noteId) {
  AppState.activeNoteId = noteId;
  const note = AppState.notes.find(n => n.id === noteId);
  if (!note) return;
  
  // Re-draw sidebar to update active class
  renderNotesSidebar();
  
  // Show editor
  document.getElementById("notes-editor-empty-state").style.display = "none";
  document.getElementById("notes-editor-active-state").style.display = "flex";
  
  // Load values
  document.getElementById("note-title-input").value = note.title;
  document.getElementById("note-content-input").value = note.content;
  document.getElementById("note-category-input").value = note.category;
  document.getElementById("note-save-status").textContent = "Saved";
  
  const charCountEl = document.getElementById("note-char-counter");
  if (charCountEl) charCountEl.textContent = `${note.content.length} characters`;
}

// -------------------------------------------------------------------
// FOCUS CENTER TIMER (POMODORO)
// -------------------------------------------------------------------

function setTimerMode(mode, minutes) {
  // Pause current
  pauseTimer();
  
  AppState.timer.mode = mode;
  AppState.timer.duration = minutes * 60;
  AppState.timer.timeLeft = minutes * 60;
  
  updateTimerUI();
}

function toggleTimer() {
  if (AppState.timer.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (AppState.timer.isRunning) return;
  
  AppState.timer.isRunning = true;
  
  // Toggle Play icon to Pause icon on controls
  document.getElementById("btn-timer-toggle").innerHTML = '<i class="fa-solid fa-pause"></i>';
  document.getElementById("btn-dash-timer-toggle").innerHTML = '<i class="fa-solid fa-pause"></i>';
  document.getElementById("btn-dash-timer-toggle").className = "btn-action-secondary";
  
  AppState.timer.intervalId = setInterval(() => {
    AppState.timer.timeLeft--;
    
    // Play sound ticking
    if (AppState.timer.soundEnabled) {
      AudioSynth.playTick();
    }
    
    updateTimerUI();
    
    if (AppState.timer.timeLeft <= 0) {
      handleTimerCompletion();
    }
  }, 1000);
}

function pauseTimer() {
  if (!AppState.timer.isRunning) return;
  
  AppState.timer.isRunning = false;
  clearInterval(AppState.timer.intervalId);
  AppState.timer.intervalId = null;
  
  document.getElementById("btn-timer-toggle").innerHTML = '<i class="fa-solid fa-play"></i>';
  document.getElementById("btn-dash-timer-toggle").innerHTML = '<i class="fa-solid fa-play"></i>';
  document.getElementById("btn-dash-timer-toggle").className = "btn-action-primary";
}

function resetTimer() {
  pauseTimer();
  AppState.timer.timeLeft = AppState.timer.duration;
  updateTimerUI();
}

function toggleTimerSound() {
  AppState.timer.soundEnabled = !AppState.timer.soundEnabled;
  const soundBtn = document.getElementById("btn-timer-sound");
  if (AppState.timer.soundEnabled) {
    soundBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    soundBtn.style.color = 'var(--color-primary)';
  } else {
    soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    soundBtn.style.color = 'var(--color-text-muted)';
  }
}

function handleTimerCompletion() {
  pauseTimer();
  AudioSynth.playChime();
  
  // Log session
  if (AppState.timer.mode === 'work') {
    const sessionMin = Math.round(AppState.timer.duration / 60);
    const sessionLog = {
      id: "focus_" + Date.now(),
      type: "Work Focus",
      minutes: sessionMin,
      timestamp: new Date().toISOString()
    };
    AppState.focusHistory.unshift(sessionLog);
    
    // Achievement checks
    checkAchievement('first-session');
    if (AppState.focusHistory.length >= 3) {
      checkAchievement('three-sessions');
    }
  }
  
  saveData();
  renderFocusHistory();
  renderDashboard();
  
  alert(`Focus session mode "${AppState.timer.mode.toUpperCase()}" finished! Time for your next break/work cycle.`);
  
  // Auto swap modes
  if (AppState.timer.mode === 'work') {
    document.getElementById("mode-short").click();
  } else {
    document.getElementById("mode-work").click();
  }
}

function updateTimerUI() {
  const min = Math.floor(AppState.timer.timeLeft / 60);
  const sec = AppState.timer.timeLeft % 60;
  const formatTime = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  
  // Update texts
  document.getElementById("main-timer-numbers").textContent = formatTime;
  document.getElementById("dash-timer-display").textContent = formatTime;
  
  const statusTexts = {
    work: "Focus Session",
    "short-break": "Short Break",
    "long-break": "Long Break"
  };
  
  const statusLabel = statusTexts[AppState.timer.mode] || "Productive";
  document.getElementById("main-timer-sub").textContent = statusLabel;
  document.getElementById("dash-timer-status-text").textContent = statusLabel;
  
  // Progress Ring logic
  const mainBar = document.getElementById("main-timer-bar");
  const dashRing = document.getElementById("dash-timer-ring");
  
  // Circle circumferences
  // Main: 2 * PI * r = 2 * PI * 120 = 753.98
  // Mini: 2 * PI * 34 = 213.62
  const mainCirc = 753.98;
  const miniCirc = 213.62;
  
  const offsetRatio = AppState.timer.timeLeft / AppState.timer.duration;
  
  if (mainBar) mainBar.style.strokeDashoffset = mainCirc * (1 - offsetRatio);
  if (dashRing) dashRing.style.strokeDashoffset = miniCirc * (1 - offsetRatio);
}

function renderFocusHistory() {
  const container = document.getElementById("focus-history-container");
  const countEl = document.getElementById("stats-total-sessions");
  const timeEl = document.getElementById("stats-total-minutes");
  
  if (!container) return;
  
  container.innerHTML = "";
  
  let totalMin = 0;
  AppState.focusHistory.forEach(h => totalMin += h.minutes);
  
  if (countEl) countEl.textContent = AppState.focusHistory.length;
  if (timeEl) {
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    timeEl.textContent = `${hours}h ${mins}m`;
  }
  
  if (AppState.focusHistory.length === 0) {
    container.innerHTML = `<p class="empty-message-inline">No focus sessions completed today yet.</p>`;
    return;
  }
  
  AppState.focusHistory.forEach(log => {
    const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const item = document.createElement("div");
    item.className = "focus-log-card";
    item.innerHTML = `
      <span><strong>${log.type}</strong> (${log.minutes}m)</span>
      <span class="focus-log-time">${timeStr}</span>
    `;
    container.appendChild(item);
  });
}

// -------------------------------------------------------------------
// HABITS TRACKER CORE
// -------------------------------------------------------------------

function handleAddHabitPrompt() {
  const name = prompt("Enter the name of your new habit:");
  if (!name || name.trim().length === 0) return;
  
  const newHabit = {
    id: "habit_" + Date.now(),
    name: name.trim(),
    history: [], // contains formatted date strings "YYYY-MM-DD" of completions
    createdAt: new Date().toISOString()
  };
  
  AppState.habits.push(newHabit);
  saveData();
  renderHabitsList();
  renderDashboard();
}

function toggleHabitDay(habitId, dateStr) {
  const habit = AppState.habits.find(h => h.id === habitId);
  if (habit) {
    const idx = habit.history.indexOf(dateStr);
    if (idx > -1) {
      habit.history.splice(idx, 1);
    } else {
      habit.history.push(dateStr);
      checkAchievement('habit-streak');
    }
    
    saveData();
    renderHabitsList();
    renderDashboard();
  }
}

function deleteHabit(habitId) {
  if (confirm("Delete this habit tracking record?")) {
    AppState.habits = AppState.habits.filter(h => h.id !== habitId);
    saveData();
    renderHabitsList();
    renderDashboard();
  }
}

function renderHabitsList() {
  const container = document.getElementById("habits-list-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  if (AppState.habits.length === 0) {
    container.innerHTML = `<p class="empty-message-inline">No habits logged. Click the add button to log one!</p>`;
    return;
  }
  
  // Get last 5 days
  const dayLabels = [];
  const dayDates = [];
  
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayDates.push(d.toISOString().split("T")[0]);
    dayLabels.push(d.toLocaleDateString([], { weekday: 'narrow' }));
  }
  
  AppState.habits.forEach(habit => {
    const card = document.createElement("div");
    card.className = "habit-card";
    
    // Streaks calculation (consecutive dates)
    const sortedCompletions = [...habit.history].sort((a,b) => new Date(b) - new Date(a));
    let streak = 0;
    
    if (sortedCompletions.length > 0) {
      let current = new Date();
      // If today isn't logged, check yesterday
      const todayStr = current.toISOString().split("T")[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      if (sortedCompletions.includes(todayStr) || sortedCompletions.includes(yesterdayStr)) {
        // Compute back
        let checkDate = sortedCompletions.includes(todayStr) ? new Date() : yesterday;
        while (true) {
          const checkStr = checkDate.toISOString().split("T")[0];
          if (sortedCompletions.includes(checkStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }
    
    // Render 5 columns of dots
    let dotsMarkup = "";
    for (let idx = 0; idx < 5; idx++) {
      const label = dayLabels[idx];
      const dateVal = dayDates[idx];
      const isCompleted = habit.history.includes(dateVal);
      
      dotsMarkup += `<button class="habit-day-dot ${isCompleted ? 'completed' : ''}" 
        onclick="toggleHabitDay('${habit.id}', '${dateVal}')" 
        title="${dateVal}">${label}</button>`;
    }
    
    card.innerHTML = `
      <div class="habit-info">
        <span class="habit-title">${habit.name}</span>
        <span class="habit-streak"><i class="fa-solid fa-fire"></i> ${streak} Days Streak</span>
      </div>
      <div class="habit-grid-days">
        ${dotsMarkup}
      </div>
      <div class="habit-actions">
        <button class="btn-goal-step" style="color: var(--color-danger);" onclick="deleteHabit('${habit.id}')" title="Delete Habit"><i class="fa-regular fa-trash-can"></i></button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// -------------------------------------------------------------------
// REFLECTION JOURNAL CORE
// -------------------------------------------------------------------

function handleSaveJournal() {
  const mood = document.getElementById("journal-mood-select").value;
  const text = document.getElementById("journal-entry-text").value.trim();
  
  if (text.length === 0) {
    alert("Please write down your thoughts before saving.");
    return;
  }
  
  const newEntry = {
    id: "journal_" + Date.now(),
    mood,
    text,
    timestamp: new Date().toISOString()
  };
  
  AppState.journalEntries.unshift(newEntry);
  checkAchievement('journal-entry');
  
  saveData();
  document.getElementById("journal-entry-text").value = "";
  renderJournalHistory();
}

function renderJournalHistory() {
  const container = document.getElementById("journal-history-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  if (AppState.journalEntries.length === 0) {
    container.innerHTML = `<p class="empty-message-inline">No journal entries written yet.</p>`;
    return;
  }
  
  AppState.journalEntries.forEach(entry => {
    const dateStr = new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const card = document.createElement("div");
    card.className = "journal-entry-card";
    
    card.innerHTML = `
      <div class="journal-entry-meta">
        <span class="journal-entry-mood">${entry.mood}</span>
        <span>${dateStr}</span>
      </div>
      <p class="journal-entry-text">${entry.text}</p>
    `;
    
    container.appendChild(card);
  });
}

// -------------------------------------------------------------------
// ACHIEVEMENTS ENGINE
// -------------------------------------------------------------------

function checkAchievement(achId) {
  const ach = AppState.achievements.find(a => a.id === achId);
  if (ach && !ach.unlocked) {
    ach.unlocked = true;
    saveData();
    renderAchievements();
    
    // Check crown achievement (if all other 7 are unlocked)
    if (achId !== 'all-clear') {
      const otherUnlocks = AppState.achievements.filter(a => a.id !== 'all-clear' && a.unlocked).length;
      if (otherUnlocks === 7) {
        checkAchievement('all-clear');
      }
    }
  }
}

function renderAchievements() {
  const container = document.getElementById("achievements-grid-container");
  const unlockedRatio = document.getElementById("achievements-unlocked-ratio");
  const gaugeBar = document.getElementById("achievements-gauge-bar");
  
  if (!container) return;
  
  container.innerHTML = "";
  
  const unlockedTotal = AppState.achievements.filter(a => a.unlocked).length;
  const ratioText = `${unlockedTotal} / ${AppState.achievements.length} Unlocked`;
  const pct = Math.round((unlockedTotal / AppState.achievements.length) * 100);
  
  if (unlockedRatio) unlockedRatio.textContent = ratioText;
  if (gaugeBar) gaugeBar.style.width = `${pct}%`;
  
  AppState.achievements.forEach(ach => {
    const card = document.createElement("div");
    card.className = `achievement-card ${ach.unlocked ? 'unlocked' : ''}`;
    
    card.innerHTML = `
      <div class="achievement-badge">${ach.badge}</div>
      <div class="achievement-details">
        <div class="achievement-name">${ach.name}</div>
        <div class="achievement-desc">${ach.desc}</div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// -------------------------------------------------------------------
// CENTRALIZED DASHBOARD UPDATE
// -------------------------------------------------------------------

function renderDashboard() {
  // Stats Counters
  // 1. TasksCompleted
  const totalTasks = AppState.tasks.length;
  const completedTasks = AppState.tasks.filter(t => t.status === 'completed').length;
  document.getElementById("dash-tasks-count").textContent = `${completedTasks} / ${totalTasks}`;
  const taskPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  document.getElementById("dash-tasks-progress").style.width = `${taskPct}%`;
  
  // 2. Goal tracker percentages success
  const totalGoals = AppState.goals.length;
  let goalPct = 0;
  if (totalGoals > 0) {
    let success = 0;
    AppState.goals.forEach(g => {
      success += (g.current / g.target);
    });
    goalPct = Math.round((success / totalGoals) * 100);
  }
  document.getElementById("dash-goals-count").textContent = `${goalPct}%`;
  document.getElementById("dash-goals-progress").style.width = `${goalPct}%`;
  
  // 3. Focus total minutes
  let totalMin = 0;
  AppState.focusHistory.forEach(h => totalMin += h.minutes);
  document.getElementById("dash-focus-count").textContent = `${totalMin}m`;
  const focusProgress = Math.min((totalMin / 120) * 100, 100); // 120m daily target
  document.getElementById("dash-focus-progress").style.width = `${focusProgress}%`;
  
  // 4. Max Habits Streaks
  let maxStreak = 0;
  AppState.habits.forEach(habit => {
    // calculate streak
    const sorted = [...habit.history].sort((a,b) => new Date(b) - new Date(a));
    let localStreak = 0;
    if (sorted.length > 0) {
      let current = new Date();
      const todayStr = current.toISOString().split("T")[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      if (sorted.includes(todayStr) || sorted.includes(yesterdayStr)) {
        let checkDate = sorted.includes(todayStr) ? new Date() : yesterday;
        while (true) {
          const checkStr = checkDate.toISOString().split("T")[0];
          if (sorted.includes(checkStr)) {
            localStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }
    if (localStreak > maxStreak) maxStreak = localStreak;
  });
  document.getElementById("dash-habits-count").textContent = `${maxStreak} Days`;
  const habitsProgress = Math.min((maxStreak / 7) * 100, 100); // 7 days target
  document.getElementById("dash-habits-progress").style.width = `${habitsProgress}%`;
  
  // Today's Habits widget
  const habitWidgetContainer = document.getElementById("dash-quick-habits-container");
  if (habitWidgetContainer) {
    habitWidgetContainer.innerHTML = "";
    if (AppState.habits.length === 0) {
      habitWidgetContainer.innerHTML = `<p class="empty-message-inline">No habits logged yet.</p>`;
    } else {
      AppState.habits.slice(0, 3).forEach(habit => {
        const todayStr = new Date().toISOString().split("T")[0];
        const doneToday = habit.history.includes(todayStr);
        
        const row = document.createElement("div");
        row.className = "quick-habit-row";
        row.innerHTML = `
          <span>${habit.name}</span>
          <button class="todo-check-btn ${doneToday ? 'completed' : ''}" 
            onclick="toggleHabitDay('${habit.id}', '${todayStr}')">
            ${doneToday ? '<i class="fa-solid fa-check"></i>' : ''}
          </button>
        `;
        habitWidgetContainer.appendChild(row);
      });
    }
  }
  
  // Priority Tasks widget (High Priority Todo)
  const priorityContainer = document.getElementById("dash-priority-tasks-container");
  if (priorityContainer) {
    priorityContainer.innerHTML = "";
    const pendingHigh = AppState.tasks.filter(t => t.status !== 'completed' && t.priority === 'high');
    
    if (pendingHigh.length === 0) {
      priorityContainer.innerHTML = `<p class="empty-message-inline">No urgent tasks pending.</p>`;
    } else {
      pendingHigh.slice(0, 4).forEach(task => {
        const row = document.createElement("div");
        row.className = "quick-habit-row";
        row.innerHTML = `
          <span>${task.title}</span>
          <button class="btn-action-primary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="updateTaskStatus('${task.id}', 'completed')"><i class="fa-solid fa-check"></i></button>
        `;
        priorityContainer.appendChild(row);
      });
    }
  }
}

// -------------------------------------------------------------------
// INTERACTIVE NATIVE CANVAS CHARTS ENGINE
// -------------------------------------------------------------------

function renderAnalyticsCharts() {
  // Draw Chart 1: Productivity Score Line Chart
  drawProductivityTrendsChart();
  
  // Draw Chart 2: Task Priority Distribution Bar Chart
  drawTaskPriorityChart();
  
  // Draw Chart 3: Goals Horizontal Progress Indicators
  drawGoalsProgressionChart();
  
  // Draw Chart 4: Notes Category Pie Chart
  drawNotesCategoryChart();
}

function getThemeColors() {
  const isLight = document.body.classList.contains("light-theme");
  return {
    text: isLight ? '#475569' : '#94a3b8',
    grid: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
    primary: isLight ? '#4f46e5' : '#6366f1',
    secondary: isLight ? '#0891b2' : '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };
}

function drawProductivityTrendsChart() {
  const canvas = document.getElementById("chart-productivity-trends");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = getThemeColors();
  
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Generate last 7 days keys
  const data = [];
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    labels.push(d.toLocaleDateString([], { weekday: 'short' }));
    
    // Calculate focus score on this date
    let mins = 0;
    AppState.focusHistory.forEach(h => {
      const hDate = h.timestamp.split("T")[0];
      if (hDate === dateStr) mins += h.minutes;
    });
    data.push(mins);
  }
  
  const maxVal = Math.max(...data, 60); // min scale is 60m
  
  // Draw Graph Grid
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  ctx.font = "11px Inter, sans-serif";
  ctx.fillStyle = colors.text;
  
  const paddingLeft = 40;
  const paddingBottom = 30;
  const chartWidth = canvas.width - paddingLeft - 20;
  const chartHeight = canvas.height - paddingBottom - 20;
  
  // Y-axis grid
  for (let i = 0; i <= 4; i++) {
    const y = 20 + (chartHeight / 4) * i;
    const value = Math.round(maxVal - (maxVal / 4) * i);
    ctx.fillText(value + "m", 10, y + 4);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
  }
  
  // X-axis text Labels
  const stepX = chartWidth / 6;
  labels.forEach((lbl, idx) => {
    const x = paddingLeft + stepX * idx;
    ctx.fillText(lbl, x - 10, canvas.height - 10);
  });
  
  // Draw Data Line with Gradient Area
  const points = data.map((val, idx) => {
    return {
      x: paddingLeft + stepX * idx,
      y: 20 + chartHeight * (1 - val / maxVal)
    };
  });
  
  // Fill gradient area below line
  const areaGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  areaGrad.addColorStop(0, colors.primary + "33"); // 20% opacity
  areaGrad.addColorStop(1, colors.primary + "00");
  
  ctx.fillStyle = areaGrad;
  ctx.beginPath();
  ctx.moveTo(points[0].x, canvas.height - paddingBottom);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, canvas.height - paddingBottom);
  ctx.closePath();
  ctx.fill();
  
  // Draw Stroke Line
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
  
  // Draw Points circles
  ctx.fillStyle = colors.secondary;
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function drawTaskPriorityChart() {
  const canvas = document.getElementById("chart-task-priority");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = getThemeColors();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Priorities counts
  const prios = { high: 0, medium: 0, low: 0 };
  AppState.tasks.forEach(t => {
    if (prios.hasOwnProperty(t.priority)) prios[t.priority]++;
  });
  
  const labels = ["High", "Medium", "Low"];
  const vals = [prios.high, prios.medium, prios.low];
  const itemColors = [colors.danger, colors.warning, colors.success];
  
  const maxVal = Math.max(...vals, 5); // minimum scale is 5
  
  const paddingLeft = 40;
  const paddingBottom = 30;
  const chartWidth = canvas.width - paddingLeft - 20;
  const chartHeight = canvas.height - paddingBottom - 20;
  
  // Draw Y grid
  ctx.strokeStyle = colors.grid;
  ctx.font = "11px Inter, sans-serif";
  ctx.fillStyle = colors.text;
  for (let i = 0; i <= 4; i++) {
    const y = 20 + (chartHeight / 4) * i;
    const value = Math.round(maxVal - (maxVal / 4) * i);
    ctx.fillText(value, 15, y + 4);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
  }
  
  // Draw Bars
  const barWidth = 50;
  const gap = (chartWidth - barWidth * 3) / 4;
  
  labels.forEach((lbl, idx) => {
    const val = vals[idx];
    const x = paddingLeft + gap + (barWidth + gap) * idx;
    const y = 20 + chartHeight * (1 - val / maxVal);
    const h = chartHeight * (val / maxVal);
    
    // Draw Bar with border radius representation
    ctx.fillStyle = itemColors[idx];
    ctx.fillRect(x, y, barWidth, h);
    
    // Draw Label text
    ctx.fillStyle = colors.text;
    ctx.fillText(lbl, x + 8, canvas.height - 10);
  });
}

function drawGoalsProgressionChart() {
  const canvas = document.getElementById("chart-goals-progression");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = getThemeColors();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Timeframe counts
  const success = { daily: { completed: 0, total: 0 }, weekly: { completed: 0, total: 0 }, monthly: { completed: 0, total: 0 } };
  AppState.goals.forEach(g => {
    if (success.hasOwnProperty(g.timeframe)) {
      success[g.timeframe].total++;
      if (g.current === g.target) success[g.timeframe].completed++;
    }
  });
  
  const labels = ["Daily Goals", "Weekly Goals", "Monthly Goals"];
  const ratios = ['daily', 'weekly', 'monthly'].map(key => {
    const obj = success[key];
    return obj.total > 0 ? obj.completed / obj.total : 0;
  });
  
  ctx.font = "12px Inter, sans-serif";
  ctx.fillStyle = colors.text;
  
  const startX = 110;
  const startY = 40;
  const barMaxWidth = canvas.width - startX - 50;
  const stepY = 60;
  
  labels.forEach((lbl, idx) => {
    const ratio = ratios[idx];
    const y = startY + stepY * idx;
    
    // Draw label
    ctx.fillStyle = colors.text;
    ctx.fillText(lbl, 15, y + 14);
    
    // Draw background gauge
    ctx.fillStyle = colors.grid;
    ctx.fillRect(startX, y, barMaxWidth, 20);
    
    // Draw progress fill
    const fillWidth = barMaxWidth * ratio;
    const grad = ctx.createLinearGradient(startX, y, startX + fillWidth, y);
    grad.addColorStop(0, colors.primary);
    grad.addColorStop(1, colors.secondary);
    ctx.fillStyle = grad;
    ctx.fillRect(startX, y, fillWidth, 20);
    
    // Text percentage
    ctx.fillStyle = colors.text;
    ctx.fillText(Math.round(ratio * 100) + "%", startX + barMaxWidth + 10, y + 14);
  });
}

function drawNotesCategoryChart() {
  const canvas = document.getElementById("chart-notes-categories");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = getThemeColors();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Categories values mapping
  const cats = { General: 0, Work: 0, Personal: 0, Idea: 0 };
  AppState.notes.forEach(n => {
    if (cats.hasOwnProperty(n.category)) cats[n.category]++;
  });
  
  const labels = Object.keys(cats);
  const vals = Object.values(cats);
  const totalNotes = vals.reduce((a, b) => a + b, 0);
  
  if (totalNotes === 0) {
    ctx.fillStyle = colors.text;
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText("Create notes under various tags to see analysis charts.", 60, canvas.height / 2);
    return;
  }
  
  const slicesColors = [colors.primary, colors.secondary, colors.success, colors.warning];
  
  const centerX = canvas.width / 2.7;
  const centerY = canvas.height / 2;
  const radius = 80;
  
  let startAngle = 0;
  
  labels.forEach((lbl, idx) => {
    const val = vals[idx];
    if (val === 0) return;
    
    const sliceAngle = (2 * Math.PI * val) / totalNotes;
    
    // Draw Pie Arc
    ctx.fillStyle = slicesColors[idx];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();
    
    // Draw Legend indicators
    const legendX = canvas.width - 130;
    const legendY = 40 + idx * 30;
    
    ctx.fillRect(legendX, legendY, 12, 12);
    ctx.fillStyle = colors.text;
    ctx.font = "11px Inter, sans-serif";
    
    const pct = Math.round((val / totalNotes) * 100);
    ctx.fillText(`${lbl} (${pct}%)`, legendX + 20, legendY + 10);
    
    startAngle += sliceAngle;
  });
}

// -------------------------------------------------------------------
// RENDER BOOTSTRAP ALL
// -------------------------------------------------------------------

function renderAll() {
  renderTasksList();
  renderGoals();
  renderNotesSidebar();
  renderFocusHistory();
  renderHabitsList();
  renderJournalHistory();
  renderAchievements();
  renderDashboard();
  updateTimerUI();
}
