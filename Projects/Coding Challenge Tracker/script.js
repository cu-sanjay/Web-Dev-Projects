/**
 * DevTracker - Coding Challenge Tracker Script
 * Manages stats dashboards, streak math, Canvas visualizations, form logs, and data portability.
 */

// ==========================================================================
// 1. Core States & Mock Sample Records
// ==========================================================================

const SAMPLE_CHALLENGES = [
  {
    id: "1",
    title: "Two Sum",
    platform: "LeetCode",
    difficulty: "Easy",
    category: "Arrays",
    dateSolved: new Date().toISOString().slice(0, 10), // Solved today
    timeSpent: 25,
    link: "https://leetcode.com/problems/two-sum/",
    notes: "Used a HashMap to find the complement in O(N) time and O(N) space."
  },
  {
    id: "2",
    title: "Merge Intervals",
    platform: "LeetCode",
    difficulty: "Medium",
    category: "Sorting",
    dateSolved: new Date().toISOString().slice(0, 10), // Solved today
    timeSpent: 40,
    link: "https://leetcode.com/problems/merge-intervals/",
    notes: "Sort by start interval. Then merge overlapping bounds."
  },
  {
    id: "3",
    title: "Water Connection",
    platform: "Codeforces",
    difficulty: "Hard",
    category: "Graphs",
    dateSolved: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // Solved yesterday
    timeSpent: 65,
    link: "https://codeforces.com/problemset/problem/123/A",
    notes: "Used DFS to trace path components and find minimal capacities."
  },
  {
    id: "4",
    title: "Tree Preorder Traversal",
    platform: "HackerRank",
    difficulty: "Easy",
    category: "Trees",
    dateSolved: new Date(Date.now() - 172800000).toISOString().slice(0, 10), // Solved 2 days ago
    timeSpent: 15,
    link: "https://hackerrank.com/tree-preorder",
    notes: "Trivial recursive traversal."
  }
];

const MILESTONES = [
  { id: "solved-5", name: "Rising Solver", desc: "Solve 5 challenges", condition: (logs) => logs.length >= 5, icon: "🐣" },
  { id: "solved-25", name: "Algorithm Apprentice", desc: "Solve 25 challenges", condition: (logs) => logs.length >= 25, icon: "🚀" },
  { id: "streak-3", name: "Consistency Starter", desc: "Maintain a 3-day streak", condition: (_, streak) => streak >= 3, icon: "🔥" },
  { id: "streak-7", name: "Habit Builder", desc: "Maintain a 7-day streak", condition: (_, streak) => streak >= 7, icon: "🎯" },
  { id: "hard-solver", name: "Titan Solver", desc: "Solve 3 Hard problems", condition: (logs) => logs.filter(l => l.difficulty === "Hard").length >= 3, icon: "👑" },
  { id: "time-100", name: "Dedicated Coder", desc: "Spend 200+ mins studying", condition: (logs) => logs.reduce((sum, l) => sum + (Number(l.timeSpent) || 0), 0) >= 200, icon: "⏱️" }
];

let challenges = [];
let dailyGoalLimit = 2;

// ==========================================================================
// 2. Storage & Persistence
// ==========================================================================

function loadDatabase() {
  const storedLogs = localStorage.getItem("devtracker_challenges");
  const storedGoal = localStorage.getItem("devtracker_daily_goal");

  if (storedLogs) {
    try {
      challenges = JSON.parse(storedLogs);
    } catch (e) {
      challenges = SAMPLE_CHALLENGES;
    }
  } else {
    challenges = SAMPLE_CHALLENGES;
    saveDatabase();
  }

  if (storedGoal) {
    dailyGoalLimit = parseInt(storedGoal, 10) || 2;
  }
  document.getElementById("daily-goal-input").value = dailyGoalLimit;
}

function saveDatabase() {
  localStorage.setItem("devtracker_challenges", JSON.stringify(challenges));
}

// ==========================================================================
// 3. System Toast Alerts
// ==========================================================================

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ==========================================================================
// 4. Mathematical Streak & Progress Calculations
// ==========================================================================

function calculateStreaks() {
  if (challenges.length === 0) return { current: 0, longest: 0 };

  // Get unique YYYY-MM-DD sorted strings
  const dates = [...new Set(challenges.map(c => c.dateSolved))].sort().reverse();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Check if coding happened today or yesterday to maintain active streak
  const hasCodedRecently = dates.includes(todayStr) || dates.includes(yesterdayStr);

  if (!hasCodedRecently) {
    currentStreak = 0;
  }

  // Calculate longest and current active streaks
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const d1 = new Date(dates[i - 1]);
      const d2 = new Date(dates[i]);
      const diffTime = Math.abs(d1 - d2);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 1;
      }
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;

  // Active current streak tracing from latest code date
  if (hasCodedRecently) {
    let checkDate = dates.includes(todayStr) ? new Date(todayStr) : new Date(yesterdayStr);
    currentStreak = 0;
    while (true) {
      const checkStr = checkDate.toISOString().slice(0, 10);
      if (dates.includes(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

function updateDashboardMetrics() {
  const streaks = calculateStreaks();
  document.getElementById("current-streak-val").textContent = `${streaks.current} Days`;
  document.getElementById("longest-streak-val").textContent = streaks.longest;

  // Daily goal calculation
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySolved = challenges.filter(c => c.dateSolved === todayStr).length;

  document.getElementById("today-solved-val").textContent = `${todaySolved} / ${dailyGoalLimit}`;
  
  const percentage = Math.min(Math.round((todaySolved / dailyGoalLimit) * 100), 100);
  document.getElementById("today-goal-progress-bar").style.width = `${percentage}%`;

  // Circular progress wheel update
  const circlePath = document.getElementById("goal-circle-path");
  circlePath.setAttribute("stroke-dasharray", `${percentage}, 100`);

  const descEl = document.getElementById("goal-status-desc");
  if (todaySolved >= dailyGoalLimit) {
    descEl.innerHTML = "🎉 Daily target achieved! Keep it up!";
    descEl.style.color = "var(--success)";
  } else {
    const diff = dailyGoalLimit - todaySolved;
    descEl.innerHTML = `Solve <strong>${diff}</strong> more problem${diff > 1 ? "s" : ""} to hit your target goal today!`;
    descEl.style.color = "var(--text-secondary)";
  }

  // Difficulties bars counts
  const easyCount = challenges.filter(c => c.difficulty === "Easy").length;
  const medCount = challenges.filter(c => c.difficulty === "Medium").length;
  const hardCount = challenges.filter(c => c.difficulty === "Hard").length;
  const total = challenges.length || 1;

  document.getElementById("easy-count-badge").textContent = easyCount;
  document.getElementById("med-count-badge").textContent = medCount;
  document.getElementById("hard-count-badge").textContent = hardCount;

  document.getElementById("easy-progress-fill").style.width = `${(easyCount / total) * 100}%`;
  document.getElementById("med-progress-fill").style.width = `${(medCount / total) * 100}%`;
  document.getElementById("hard-progress-fill").style.width = `${(hardCount / total) * 100}%`;

  renderAchievements(streaks.current);
}

function renderAchievements(currentStreak) {
  const grid = document.getElementById("achievements-badges-grid");
  grid.innerHTML = "";

  MILESTONES.forEach(m => {
    const unlocked = m.condition(challenges, currentStreak);
    const card = document.createElement("div");
    card.className = `badge-card ${unlocked ? "unlocked" : ""}`;
    card.innerHTML = `
      <div class="badge-icon">${m.icon}</div>
      <div class="badge-info">
        <span class="badge-name">${m.name}</span>
        <span class="badge-desc">${m.desc}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ==========================================================================
// 5. Dynamic Tables Rendering (Dashboard & History)
// ==========================================================================

function populateRecentChallengesTable() {
  const tbody = document.getElementById("recent-challenges-tbody");
  tbody.innerHTML = "";

  // Sort by date descending
  const sorted = [...challenges].sort((a, b) => new Date(b.dateSolved) - new Date(a.dateSolved)).slice(0, 5);

  if (sorted.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No challenges recorded yet. Click 'Log Challenge' to start!</td></tr>`;
    return;
  }

  sorted.forEach(c => {
    const tr = document.createElement("tr");
    let diffClass = "bg-success";
    if (c.difficulty === "Medium") diffClass = "bg-warning";
    if (c.difficulty === "Hard") diffClass = "bg-danger";

    tr.innerHTML = `
      <td><strong>${c.title}</strong></td>
      <td>${c.platform}</td>
      <td><span class="badge-tag ${diffClass}">${c.difficulty}</span></td>
      <td>${c.dateSolved}</td>
    `;
    tbody.appendChild(tr);
  });
}

function populateRegistryTable() {
  const tbody = document.getElementById("registry-tbody");
  tbody.innerHTML = "";

  // Apply filters
  const searchVal = document.getElementById("registry-search-input").value.toLowerCase();
  const platformFilter = document.getElementById("filter-platform").value;
  const diffFilter = document.getElementById("filter-difficulty").value;
  const topicFilter = document.getElementById("filter-topic").value;
  const sortVal = document.getElementById("sort-order").value;

  let filtered = challenges;

  if (searchVal) {
    filtered = filtered.filter(c => c.title.toLowerCase().includes(searchVal));
  }

  if (platformFilter !== "all") {
    filtered = filtered.filter(c => c.platform === platformFilter);
  }

  if (diffFilter !== "all") {
    filtered = filtered.filter(c => c.difficulty === diffFilter);
  }

  if (topicFilter !== "all") {
    filtered = filtered.filter(c => c.category.toLowerCase() === topicFilter.toLowerCase());
  }

  // Sort records
  filtered.sort((a, b) => {
    if (sortVal === "date-desc") return new Date(b.dateSolved) - new Date(a.dateSolved);
    if (sortVal === "date-asc") return new Date(a.dateSolved) - new Date(b.dateSolved);
    if (sortVal === "title-asc") return a.title.localeCompare(b.title);
    if (sortVal === "time-desc") return (b.timeSpent || 0) - (a.timeSpent || 0);
    return 0;
  });

  const emptyState = document.getElementById("empty-state-logs");
  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  } else {
    emptyState.style.display = "none";
  }

  filtered.forEach(c => {
    const tr = document.createElement("tr");
    let diffClass = "bg-success";
    if (c.difficulty === "Medium") diffClass = "bg-warning";
    if (c.difficulty === "Hard") diffClass = "bg-danger";

    const titleDisplay = c.link ? `<a href="${c.link}" target="_blank" class="link-btn" style="text-align:left;">${c.title}</a>` : c.title;

    tr.innerHTML = `
      <td><strong>${titleDisplay}</strong></td>
      <td>${c.platform}</td>
      <td><span class="badge-tag ${diffClass}">${c.difficulty}</span></td>
      <td>${c.category}</td>
      <td>${c.timeSpent ? c.timeSpent + ' min' : '-'}</td>
      <td>${c.dateSolved}</td>
      <td>
        <button class="row-actions-btn edit-btn" title="Edit Problem" aria-label="Edit Problem">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </button>
        <button class="row-actions-btn delete-btn" title="Delete Problem" aria-label="Delete Problem">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `;

    // Hook buttons
    tr.querySelector(".edit-btn").onclick = () => editChallenge(c.id);
    tr.querySelector(".delete-btn").onclick = () => deleteChallenge(c.id);

    tbody.appendChild(tr);
  });
}

function updateRegistryTopicFilterDropdowns() {
  const select = document.getElementById("filter-topic");
  const datalist = document.getElementById("topics-datalist");
  
  // Extract unique topic categories
  const topics = [...new Set(challenges.map(c => c.category).filter(Boolean))];

  // Update table filter dropdown
  const activeVal = select.value;
  select.innerHTML = `<option value="all">All Topics</option>`;
  topics.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    select.appendChild(opt);
  });
  if (topics.includes(activeVal)) select.value = activeVal;

  // Update input datalist
  datalist.innerHTML = "";
  topics.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    datalist.appendChild(opt);
  });
}

// ==========================================================================
// 6. CRUD Challenge Methods
// ==========================================================================

function handleChallengeFormSubmit(e) {
  e.preventDefault();

  const titleInput = document.getElementById("form-problem-title").value.trim();
  const platformInput = document.getElementById("form-platform").value;
  const difficultyInput = document.querySelector('input[name="difficulty"]:checked').value;
  const topicInput = document.getElementById("form-topic").value.trim();
  const dateInput = document.getElementById("form-date").value;
  const timeInput = parseInt(document.getElementById("form-time").value, 10) || 0;
  const linkInput = document.getElementById("form-link").value.trim();
  const notesInput = document.getElementById("form-notes").value.trim();
  const editId = document.getElementById("edit-mode-id").value;

  if (editId) {
    // Update Mode
    const c = challenges.find(item => item.id === editId);
    if (c) {
      c.title = titleInput;
      c.platform = platformInput;
      c.difficulty = difficultyInput;
      c.category = topicInput || "Algorithms";
      c.dateSolved = dateInput;
      c.timeSpent = timeInput;
      c.link = linkInput;
      c.notes = notesInput;
      showToast("Challenge log updated successfully!");
    }
  } else {
    // Create Mode
    const newLog = {
      id: Date.now().toString(),
      title: titleInput,
      platform: platformInput,
      difficulty: difficultyInput,
      category: topicInput || "Algorithms",
      dateSolved: dateInput,
      timeSpent: timeInput,
      link: linkInput,
      notes: notesInput
    };
    challenges.unshift(newLog);
    showToast("Challenge logged successfully!");
  }

  saveDatabase();
  resetChallengeForm();
  
  // Route back to dashboard
  navigateToSection("dashboard-section");
  updateDashboardMetrics();
  populateRecentChallengesTable();
  populateRegistryTable();
  updateRegistryTopicFilterDropdowns();
}

function resetChallengeForm() {
  document.getElementById("challenge-log-form").reset();
  document.getElementById("edit-mode-id").value = "";
  document.getElementById("form-date").value = new Date().toISOString().slice(0, 10);
  document.getElementById("form-heading-title").textContent = "Log Solved Challenge";
  document.getElementById("submit-form-btn").textContent = "Save Problem Log";
  
  // Reset difficulty buttons unchecked fallback
  document.getElementById("diff-easy").checked = true;
}

function editChallenge(id) {
  const c = challenges.find(item => item.id === id);
  if (!c) return;

  document.getElementById("edit-mode-id").value = c.id;
  document.getElementById("form-problem-title").value = c.title;
  document.getElementById("form-platform").value = c.platform;
  
  // Radio checks
  if (c.difficulty === "Easy") document.getElementById("diff-easy").checked = true;
  else if (c.difficulty === "Medium") document.getElementById("diff-medium").checked = true;
  else if (c.difficulty === "Hard") document.getElementById("diff-hard").checked = true;

  document.getElementById("form-topic").value = c.category;
  document.getElementById("form-date").value = c.dateSolved;
  document.getElementById("form-time").value = c.timeSpent || "";
  document.getElementById("form-link").value = c.link || "";
  document.getElementById("form-notes").value = c.notes || "";

  document.getElementById("form-heading-title").textContent = "Modify Problem Log";
  document.getElementById("submit-form-btn").textContent = "Update Problem Log";

  navigateToSection("log-section");
}

function deleteChallenge(id) {
  if (!confirm("Are you sure you want to delete this solved challenge?")) return;

  challenges = challenges.filter(c => c.id !== id);
  saveDatabase();
  showToast("Solved challenge log deleted", "warning");
  
  updateDashboardMetrics();
  populateRecentChallengesTable();
  populateRegistryTable();
  updateRegistryTopicFilterDropdowns();
}

// ==========================================================================
// 7. Stats Analytics Drawing API (Canvas)
// ==========================================================================

function drawPlatformRepresentationChart() {
  const canvas = document.getElementById("platform-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const platformsMap = {};
  challenges.forEach(c => {
    platformsMap[c.platform] = (platformsMap[c.platform] || 0) + 1;
  });

  const platforms = Object.keys(platformsMap);
  const data = Object.values(platformsMap);

  if (data.length === 0) {
    ctx.fillStyle = "#888";
    ctx.font = "12px sans-serif";
    ctx.fillText("No analytics data available", 100, 100);
    return;
  }

  const total = data.reduce((a, b) => a + b, 0);
  const colors = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#06b6d4"];

  let startAngle = 0;
  const centerX = 120;
  const centerY = 120;
  const radius = 80;

  data.forEach((val, idx) => {
    const sliceAngle = (val / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fill();

    // Render legend
    const yOffset = 30 + idx * 24;
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(240, yOffset, 12, 12);
    ctx.fillStyle = document.documentElement.getAttribute("data-theme") === "light" ? "#333" : "#eee";
    ctx.font = "11px Inter, sans-serif";
    const percent = Math.round((val / total) * 100);
    ctx.fillText(`${platforms[idx]} (${percent}%)`, 260, yOffset + 10);

    startAngle += sliceAngle;
  });
}

function drawWeeklySolvedVolumeChart() {
  const canvas = document.getElementById("weekly-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Compile solved count over the last 7 days
  const days = [];
  const counts = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    days.push(d.toLocaleDateString(undefined, { weekday: "short" }));
    counts.push(challenges.filter(c => c.dateSolved === dateStr).length);
  }

  const maxVal = Math.max(...counts, 1);

  const startX = 40;
  const startY = 200;
  const graphWidth = 330;
  const graphHeight = 150;
  const barWidth = 30;
  const spacing = (graphWidth - barWidth * days.length) / (days.length - 1);

  // Draw graph lines
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, startY - graphHeight);
  ctx.lineTo(startX, startY);
  ctx.lineTo(startX + graphWidth, startY);
  ctx.stroke();

  // Bars rendering
  days.forEach((day, idx) => {
    const val = counts[idx];
    const barHeight = (val / maxVal) * (graphHeight - 20);

    const x = startX + idx * (barWidth + spacing);
    const y = startY - barHeight;

    // Linear bar gradients
    const grad = ctx.createLinearGradient(x, y, x, startY);
    grad.addColorStop(0, "#3b82f6");
    grad.addColorStop(1, "#8b5cf6");

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Labels
    ctx.fillStyle = document.documentElement.getAttribute("data-theme") === "light" ? "#333" : "#aaa";
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText(day, x + 3, startY + 16);

    // Dynamic counts text rendering on top of columns
    ctx.fillStyle = document.documentElement.getAttribute("data-theme") === "light" ? "#111" : "#fff";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.fillText(val, x + 10, y - 6);
  });
}

function updateAnalyticsSummaryOverview() {
  const totalSolved = challenges.length;
  let totalTime = 0;

  challenges.forEach(c => {
    totalTime += Number(c.timeSpent) || 0;
  });

  const avgTime = totalSolved > 0 ? Math.round(totalTime / totalSolved) : 0;
  const bestStreak = calculateStreaks().longest;

  document.getElementById("analytic-total-solved").textContent = totalSolved;
  document.getElementById("analytic-total-time").textContent = `${totalTime} min`;
  document.getElementById("analytic-avg-time").textContent = `${avgTime} min`;
  document.getElementById("analytic-best-streak").textContent = `${bestStreak} Days`;
}

// ==========================================================================
// 8. Backups Serialization Portability
// ==========================================================================

function exportBackupJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(challenges, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `devtracker-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast("Database backup downloaded successfully!");
}

function importBackupJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const importedData = JSON.parse(event.target.result);
      if (Array.isArray(importedData)) {
        challenges = importedData;
        saveDatabase();
        showToast("Database restored successfully!");
        
        // Refresh dashboard views
        updateDashboardMetrics();
        populateRecentChallengesTable();
        populateRegistryTable();
        updateRegistryTopicFilterDropdowns();
        navigateToSection("dashboard-section");
      } else {
        showToast("Error: Imported file structure is invalid", "error");
      }
    } catch (err) {
      showToast("Error parsing backup JSON file", "error");
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// 9. Navigation Section Routes Toggler
// ==========================================================================

function navigateToSection(targetId) {
  // Hide active views
  document.querySelectorAll(".content-section").forEach(sec => {
    sec.classList.remove("active-section");
  });

  // Show target
  const target = document.getElementById(targetId);
  if (target) {
    target.classList.add("active-section");
  }

  // Update navigation buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-target") === targetId) {
      btn.classList.add("active");
    }
  });

  // Redraw charts if routing to analytics
  if (targetId === "analytics-section") {
    updateAnalyticsSummaryOverview();
    setTimeout(() => {
      drawPlatformRepresentationChart();
      drawWeeklySolvedVolumeChart();
    }, 100);
  }
}

// ==========================================================================
// 10. Event Listeners Initializer
// ==========================================================================

function initAppEventHandlers() {
  // Navigation tabs routing
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      navigateToSection(target);
    });
  });

  // Dashboard shortcuts routing
  document.querySelectorAll(".navigate-to-logs-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      navigateToSection("registry-section");
    });
  });

  // Theme Toggler
  const themeBtn = document.getElementById("theme-toggle-btn");
  themeBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const targetTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", targetTheme);
    localStorage.setItem("devtracker_theme", targetTheme);
    showToast(`Switched to ${targetTheme} mode`);
    
    // Redraw charts on theme change
    drawPlatformRepresentationChart();
    drawWeeklySolvedVolumeChart();
  });

  const savedTheme = localStorage.getItem("devtracker_theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  // Set Goal button
  document.getElementById("update-goal-btn").addEventListener("click", () => {
    const val = parseInt(document.getElementById("daily-goal-input").value, 10);
    if (val > 0 && val <= 10) {
      dailyGoalLimit = val;
      localStorage.setItem("devtracker_daily_goal", val);
      updateDashboardMetrics();
      showToast(`Daily challenge goal target updated to ${val} problems`);
    } else {
      showToast("Please enter a valid goal (1 to 10)", "error");
    }
  });

  // Form submission
  document.getElementById("challenge-log-form").addEventListener("submit", handleChallengeFormSubmit);
  document.getElementById("cancel-form-btn").addEventListener("click", () => {
    resetChallengeForm();
    navigateToSection("dashboard-section");
  });

  // Filters inputs
  document.getElementById("registry-search-input").addEventListener("input", populateRegistryTable);
  document.getElementById("filter-platform").addEventListener("change", populateRegistryTable);
  document.getElementById("filter-difficulty").addEventListener("change", populateRegistryTable);
  document.getElementById("filter-topic").addEventListener("change", populateRegistryTable);
  document.getElementById("sort-order").addEventListener("change", populateRegistryTable);

  // Backup serialization buttons
  document.getElementById("backup-export-btn").addEventListener("click", exportBackupJSON);
  document.getElementById("backup-import-file").addEventListener("change", importBackupJSON);

  // Keyboard Shortcuts navigation routing
  window.addEventListener("keydown", (e) => {
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          resetChallengeForm();
          navigateToSection("log-section");
          break;
        case "g":
          e.preventDefault();
          document.getElementById("daily-goal-input").focus();
          break;
        case "t":
          e.preventDefault();
          themeBtn.click();
          break;
        case "e":
          e.preventDefault();
          exportBackupJSON();
          break;
        case "i":
          e.preventDefault();
          document.getElementById("backup-import-file").click();
          break;
      }
    }
  });
}

// Initialise dashboard on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  loadDatabase();
  initAppEventHandlers();
  
  // Set date field to today
  document.getElementById("form-date").value = new Date().toISOString().slice(0, 10);
  
  updateDashboardMetrics();
  populateRecentChallengesTable();
  populateRegistryTable();
  updateRegistryTopicFilterDropdowns();
});
