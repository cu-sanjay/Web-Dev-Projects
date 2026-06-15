/**
 * Open Source Contribution Tracker - script.js
 * High-fidelity logic, custom telemetry charts, activity heatmap, and gamified XP algorithms.
 */

// ==========================================================================
// CONFIGURATION & CONSTANTS
// ==========================================================================

const ARCHIVE_KEY = 'os_tracker_contributions';
const USER_THEME_KEY = 'os_tracker_theme';
const PROFILE_SEED_KEY = 'os_tracker_profile_seed';

// Gamification Badges Registry
const BADGES = [
  { id: 'first_log', title: 'First Blood', description: 'Log your first open source contribution', icon: 'fa-droplet' },
  { id: 'merged_pr', title: 'Code Merged', description: 'Get a Pull Request merged successfully', icon: 'fa-code-pull-request' },
  { id: 'bug_hunter', title: 'Bug Hunter', description: 'Log at least 3 Issues (Open or Closed)', icon: 'fa-bug' },
  { id: 'code_machine', title: 'Code Machine', description: 'Log 5 Pull Requests in total', icon: 'fa-laptop-code' },
  { id: 'reviewer', title: 'Review Guru', description: 'Review code on 3 separate occasions', icon: 'fa-user-shield' },
  { id: 'doc_writer', title: 'Scribe', description: 'Log 2 Documentation contributions', icon: 'fa-book' },
  { id: 'streak_7', title: 'Consistent', description: 'Achieve a 7-day contribution streak', icon: 'fa-calendar-check' },
  { id: 'level_5', title: 'Maintainer Status', description: 'Reach Developer Level 5', icon: 'fa-crown' }
];

// Base XP Constants
const XP_VALUES = {
  PR: { Merged: 100, Open: 50, 'In Progress': 30, Closed: 15 },
  Issue: { Closed: 50, Open: 30, 'In Progress': 40 },
  Commit: 20,
  Review: 40,
  Docs: 60
};

// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS = {
  Easy: 1.0,
  Medium: 1.5,
  Hard: 2.5
};

// ==========================================================================
// APPLICATION STATE
// ==========================================================================

let state = {
  contributions: [],
  filters: {
    search: '',
    type: 'all',
    status: 'all',
    date: null // Selected date string "YYYY-MM-DD" for filtering via heatmap
  },
  sortBy: 'date-desc',
  theme: 'dark-theme',
  profileSeed: 'antigravity'
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadLocalState();
  initTheme();
  initDateDisplay();
  bindEvents();
  renderAll();
});

// Load state from localStorage
function loadLocalState() {
  const saved = localStorage.getItem(ARCHIVE_KEY);
  if (saved) {
    try {
      state.contributions = JSON.parse(saved);
    } catch (e) {
      showToast('Error parsing database. Re-initializing...', 'error');
      state.contributions = [];
    }
  } else {
    // If empty, load sample seed data so the layout is initially stunning
    seedDefaultData(false);
  }

  // Load avatar seed
  const savedSeed = localStorage.getItem(PROFILE_SEED_KEY);
  if (savedSeed) {
    state.profileSeed = savedSeed;
  }
}

// Save state to localStorage
function saveStateToLocal() {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(state.contributions));
}

// Date welcome label
function initDateDisplay() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date-display').textContent = new Date().toLocaleDateString('en-US', options);
}

// ==========================================================================
// GAMIFICATION ALGORITHMS (XP, LEVEL, STREAK)
// ==========================================================================

// Calculate total developer XP
function calculateTotalXP() {
  return state.contributions.reduce((total, c) => {
    let base = 20; // Default fallback
    
    if (c.type === 'PR') {
      base = XP_VALUES.PR[c.status] || XP_VALUES.PR.Open;
    } else if (c.type === 'Issue') {
      base = XP_VALUES.Issue[c.status] || XP_VALUES.Issue.Open;
    } else if (c.type === 'Commit') {
      base = XP_VALUES.Commit;
    } else if (c.type === 'Review') {
      base = XP_VALUES.Review;
    } else if (c.type === 'Docs') {
      base = XP_VALUES.Docs;
    }

    const mult = DIFFICULTY_MULTIPLIERS[c.difficulty] || 1.0;
    return total + Math.floor(base * mult);
  }, 0);
}

// Level formulas
// level 1: 0 - 500
// level 2: 500 - 1200
// level 3: 1200 - 2200
// etc. (Next requirement increases by Level * 500)
function getLevelInfo(totalXP) {
  let level = 1;
  let xpForNext = 500;
  let xpCurrentLevelStart = 0;

  while (totalXP >= xpForNext) {
    level++;
    xpCurrentLevelStart = xpForNext;
    xpForNext += level * 500;
  }

  const progress = totalXP - xpCurrentLevelStart;
  const needed = xpForNext - xpCurrentLevelStart;
  const percent = Math.min(100, Math.max(0, (progress / needed) * 100));

  let rank = 'Novice Contributor';
  if (level >= 8) rank = 'Maintainer Elite';
  else if (level >= 6) rank = 'Core Architect';
  else if (level >= 4) rank = 'Senior Collaborator';
  else if (level >= 2) rank = 'Junior Maintainer';

  return { level, progress, needed, percent, rank };
}

// Streak Calculation
function calculateStreaks() {
  if (state.contributions.length === 0) {
    return { current: 0, max: 0 };
  }

  // Extract date strings, filter out duplicates, and sort descending
  const dates = [...new Set(state.contributions.map(c => c.date))].sort((a, b) => new Date(b) - new Date(a));
  
  if (dates.length === 0) return { current: 0, max: 0 };

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  
  // Set time of dates to midnight UTC to avoid timezone issues during arithmetic checks
  const dateObjs = dates.map(d => {
    const parts = d.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if user has contributed today or yesterday to preserve current streak
  let currentStreak = 0;
  let tempStreak = 0;
  let maxStreak = 0;

  // Calculate current streak
  const latestContDate = dateObjs[0];
  const diffFromToday = (today - latestContDate) / MS_PER_DAY;

  if (diffFromToday <= 1) {
    currentStreak = 1;
    for (let i = 0; i < dateObjs.length - 1; i++) {
      const diff = (dateObjs[i] - dateObjs[i + 1]) / MS_PER_DAY;
      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        break; // streak broken
      }
    }
  }

  // Calculate maximum streak (longest consecutive block in entire history)
  // Re-sort ascending to traverse forward
  const sortedAsc = [...dateObjs].sort((a, b) => a - b);
  tempStreak = 1;
  maxStreak = 1;

  for (let i = 0; i < sortedAsc.length - 1; i++) {
    const diff = (sortedAsc[i + 1] - sortedAsc[i]) / MS_PER_DAY;
    if (diff === 1) {
      tempStreak++;
    } else if (diff > 1) {
      maxStreak = Math.max(maxStreak, tempStreak);
      tempStreak = 1;
    }
  }
  maxStreak = Math.max(maxStreak, tempStreak);

  // If no dates logged, make sure defaults are handled
  if (dates.length === 0) {
    currentStreak = 0;
    maxStreak = 0;
  }

  return { current: currentStreak, max: maxStreak };
}

// Check achievement badges
function checkUnlockedBadges(totalContributions, maxStreak, level) {
  const unlocked = [];
  const contributions = state.contributions;

  if (contributions.length > 0) unlocked.push('first_log');
  
  const mergedPRs = contributions.filter(c => c.type === 'PR' && c.status === 'Merged').length;
  if (mergedPRs >= 1) unlocked.push('merged_pr');

  const issuesLogged = contributions.filter(c => c.type === 'Issue').length;
  if (issuesLogged >= 3) unlocked.push('bug_hunter');

  const totalPRs = contributions.filter(c => c.type === 'PR').length;
  if (totalPRs >= 5) unlocked.push('code_machine');

  const reviewsLogged = contributions.filter(c => c.type === 'Review').length;
  if (reviewsLogged >= 3) unlocked.push('reviewer');

  const docsLogged = contributions.filter(c => c.type === 'Docs').length;
  if (docsLogged >= 2) unlocked.push('doc_writer');

  if (maxStreak >= 7) unlocked.push('streak_7');
  if (level >= 5) unlocked.push('level_5');

  return unlocked;
}

// ==========================================================================
// RENDER ENGINE
// ==========================================================================

function renderAll() {
  const totalXP = calculateTotalXP();
  const lvlInfo = getLevelInfo(totalXP);
  const streaks = calculateStreaks();
  const unlockedBadges = checkUnlockedBadges(state.contributions.length, streaks.max, lvlInfo.level);

  // Update profile metrics UI
  document.getElementById('profile-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${state.profileSeed}`;
  document.getElementById('profile-rank').textContent = lvlInfo.rank;
  document.getElementById('level-display').textContent = `Level ${lvlInfo.level}`;
  document.getElementById('xp-numbers').textContent = `${lvlInfo.progress} / ${lvlInfo.needed} XP (Total: ${totalXP})`;
  document.getElementById('xp-progress-bar').style.width = `${lvlInfo.percent}%`;

  document.getElementById('curr-streak').textContent = `${streaks.current} ${streaks.current === 1 ? 'day' : 'days'}`;
  document.getElementById('max-streak').textContent = `${streaks.max} ${streaks.max === 1 ? 'day' : 'days'}`;
  document.getElementById('total-contributions').textContent = state.contributions.length;
  document.getElementById('ledger-count-total').textContent = `${state.contributions.length} Logged`;

  // Render Achievements
  renderBadges(unlockedBadges);

  // Render Heatmap
  renderHeatmap();

  // Render Canvas Charts
  renderCharts();

  // Render Contributions logs ledger
  renderLogsLedger();
}

// Render achievement badges UI
function renderBadges(unlockedList) {
  const container = document.getElementById('badges-grid');
  container.innerHTML = '';

  BADGES.forEach(badge => {
    const isUnlocked = unlockedList.includes(badge.id);
    const div = document.createElement('div');
    div.className = `badge-item ${isUnlocked ? 'unlocked' : 'locked'}`;
    div.setAttribute('aria-label', `${badge.title}: ${badge.description} (${isUnlocked ? 'Unlocked' : 'Locked'})`);
    
    div.innerHTML = `
      <i class="fa-solid ${badge.icon}"></i>
      <span class="tooltip"><strong>${badge.title}</strong><br>${badge.description} (${isUnlocked ? 'Unlocked' : 'Locked'})</span>
    `;
    container.appendChild(div);
  });
}

// Render Heatmap (GitHub-style 53x7 grid)
function renderHeatmap() {
  const grid = document.getElementById('heatmap-cells-grid');
  const monthLabels = document.getElementById('heatmap-months-labels');
  
  grid.innerHTML = '';
  monthLabels.innerHTML = '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Determine starting date (364 days ago, aligned to start of week - Sunday)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  const startDay = startDate.getDay(); // 0 is Sunday
  startDate.setDate(startDate.getDate() - startDay); // Shift to nearest prior Sunday

  // Aggregate contributions by date
  const contributionsCount = {};
  state.contributions.forEach(c => {
    contributionsCount[c.date] = (contributionsCount[c.date] || 0) + 1;
  });

  // Render Months Labels
  let lastMonthName = '';
  const cols = 53;
  
  for (let c = 0; c < cols; c++) {
    const colDate = new Date(startDate);
    colDate.setDate(colDate.getDate() + (c * 7));
    const monthName = colDate.toLocaleString('en-US', { month: 'short' });
    
    const span = document.createElement('span');
    // Display month label if it changes and is not jammed too closely
    if (monthName !== lastMonthName) {
      span.textContent = monthName;
      lastMonthName = monthName;
    }
    monthLabels.appendChild(span);
  }

  // Render 53 weeks x 7 days grid
  // Grid auto-flow: column handles Sunday-Saturday layout automatically
  const totalDays = 53 * 7;
  for (let i = 0; i < totalDays; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(cellDate.getDate() + i);

    const year = cellDate.getFullYear();
    const month = String(cellDate.getMonth() + 1).padStart(2, '0');
    const day = String(cellDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const count = contributionsCount[dateStr] || 0;
    
    // Level class based on count
    let lvl = 0;
    if (count > 0) {
      if (count === 1) lvl = 1;
      else if (count === 2) lvl = 2;
      else if (count <= 4) lvl = 3;
      else lvl = 4;
    }

    const cell = document.createElement('div');
    cell.className = `heatmap-cell level-${lvl}`;
    
    if (state.filters.date === dateStr) {
      cell.classList.add('active-filter');
    }

    // Set tooltip text
    const dateLabel = cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    cell.setAttribute('data-tooltip', `${count} ${count === 1 ? 'contribution' : 'contributions'} on ${dateLabel}`);
    cell.setAttribute('data-date', dateStr);

    cell.addEventListener('click', () => {
      toggleDateFilter(dateStr);
    });

    grid.appendChild(cell);
  }
}

// Toggle date filter from heatmap clicks
function toggleDateFilter(dateStr) {
  const alertBox = document.getElementById('heatmap-filter-alert');
  const filterText = document.getElementById('heatmap-filter-text');

  if (state.filters.date === dateStr) {
    state.filters.date = null;
    alertBox.style.display = 'none';
  } else {
    state.filters.date = dateStr;
    const formatted = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    filterText.textContent = `Filtering Ledger: showing contributions on ${formatted}`;
    alertBox.style.display = 'flex';
  }
  
  renderHeatmap();
  renderLogsLedger();
}

// Render Custom Canvas Charts (Pie Chart for Types & Repo Bar Chart)
function renderCharts() {
  const isDark = document.body.classList.contains('dark-theme');
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#94a3b8' : '#475569';
  const gridLineColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(71, 85, 105, 0.1)';

  // Chart 1: Types Doughnut Chart
  const typeCounts = { PR: 0, Issue: 0, Commit: 0, Review: 0, Docs: 0 };
  state.contributions.forEach(c => {
    if (typeCounts[c.type] !== undefined) typeCounts[c.type]++;
  });

  const typeColors = {
    PR: 'rgb(168, 85, 247)',    // Purple
    Issue: 'rgb(59, 130, 246)', // Blue
    Commit: 'rgb(249, 115, 22)',// Orange
    Review: 'rgb(236, 72, 153)',// Pink
    Docs: 'rgb(20, 184, 166)'   // Teal
  };

  const canvasTypes = document.getElementById('chart-types');
  const ctxTypes = canvasTypes.getContext('2d');
  ctxTypes.clearRect(0, 0, canvasTypes.width, canvasTypes.height);

  const total = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  // Render pie legend list
  const legendTypes = document.getElementById('chart-types-legend');
  legendTypes.innerHTML = '';
  
  Object.keys(typeCounts).forEach(type => {
    const count = typeCounts[type];
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-color-dot" style="background-color: ${typeColors[type]}"></div>
      <span>${type}: <strong>${count}</strong> (${pct}%)</span>
    `;
    legendTypes.appendChild(item);
  });

  if (total === 0) {
    // Empty state for chart
    ctxTypes.beginPath();
    ctxTypes.arc(canvasTypes.width / 2, canvasTypes.height / 2, 60, 0, 2 * Math.PI);
    ctxTypes.strokeStyle = gridLineColor;
    ctxTypes.lineWidth = 10;
    ctxTypes.stroke();
    
    ctxTypes.fillStyle = mutedColor;
    ctxTypes.font = '12px var(--font-body)';
    ctxTypes.textAlign = 'center';
    ctxTypes.fillText('No data logged', canvasTypes.width / 2, canvasTypes.height / 2 + 4);
  } else {
    // Draw doughnut arcs
    let startAngle = -0.5 * Math.PI;
    const centerX = canvasTypes.width / 2;
    const centerY = canvasTypes.height / 2;
    const outerRadius = 65;
    const innerRadius = 45;

    Object.keys(typeCounts).forEach(type => {
      const count = typeCounts[type];
      if (count === 0) return;

      const sliceAngle = (count / total) * 2 * Math.PI;

      // Draw slice
      ctxTypes.beginPath();
      ctxTypes.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctxTypes.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctxTypes.closePath();
      
      ctxTypes.fillStyle = typeColors[type];
      ctxTypes.fill();

      startAngle += sliceAngle;
    });

    // Draw total in the middle
    ctxTypes.fillStyle = textColor;
    ctxTypes.font = 'bold 20px var(--font-display)';
    ctxTypes.textAlign = 'center';
    ctxTypes.fillText(total, centerX, centerY + 2);
    
    ctxTypes.fillStyle = mutedColor;
    ctxTypes.font = '500 10px var(--font-body)';
    ctxTypes.fillText('TOTALS', centerX, centerY + 18);
  }

  // Chart 2: Top Repositories (Vertical Bar Chart on Canvas)
  const repoCounts = {};
  state.contributions.forEach(c => {
    repoCounts[c.repo] = (repoCounts[c.repo] || 0) + 1;
  });

  // Sort repos by contribution count
  const sortedRepos = Object.entries(repoCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4); // Limit to top 4 repos

  const canvasRepos = document.getElementById('chart-repos');
  const ctxRepos = canvasRepos.getContext('2d');
  ctxRepos.clearRect(0, 0, canvasRepos.width, canvasRepos.height);

  const reposListDiv = document.getElementById('chart-repos-list');
  reposListDiv.innerHTML = '';

  if (sortedRepos.length === 0) {
    ctxRepos.fillStyle = mutedColor;
    ctxRepos.font = '12px var(--font-body)';
    ctxRepos.textAlign = 'center';
    ctxRepos.fillText('No repositories tracked', canvasRepos.width / 2, canvasRepos.height / 2);
  } else {
    // Generate HTML-based progress bars for visual beauty, and let canvas display custom telemetry
    const maxVal = sortedRepos[0][1];
    
    sortedRepos.forEach(([repo, count]) => {
      const pct = maxVal > 0 ? (count / maxVal) * 100 : 0;
      const row = document.createElement('div');
      row.className = 'repo-dist-item';
      row.innerHTML = `
        <div class="repo-dist-meta">
          <span class="repo-dist-name" title="${repo}"><i class="fa-solid fa-folder-open text-gradient"></i> ${repo}</span>
          <span>${count} conts</span>
        </div>
        <div class="repo-dist-bar-outer">
          <div class="repo-dist-bar-inner" style="width: ${pct}%"></div>
        </div>
      `;
      reposListDiv.appendChild(row);
    });

    // Draw secondary technical telemetry data into the repository canvas
    ctxRepos.strokeStyle = gridLineColor;
    ctxRepos.lineWidth = 1;
    
    // Draw a grid pattern
    for (let x = 30; x < canvasRepos.width; x += 40) {
      ctxRepos.beginPath();
      ctxRepos.moveTo(x, 10);
      ctxRepos.lineTo(x, canvasRepos.height - 20);
      ctxRepos.stroke();
    }
    
    // Draw baseline
    ctxRepos.strokeStyle = mutedColor;
    ctxRepos.beginPath();
    ctxRepos.moveTo(20, canvasRepos.height - 20);
    ctxRepos.lineTo(canvasRepos.width - 20, canvasRepos.height - 20);
    ctxRepos.stroke();

    // Render micro graphs
    ctxRepos.fillStyle = textColor;
    ctxRepos.font = '600 11px var(--font-mono)';
    ctxRepos.textAlign = 'left';
    ctxRepos.fillText(`Telemetry Status: Dynamic`, 20, 20);
    
    ctxRepos.fillStyle = mutedColor;
    ctxRepos.font = '10px var(--font-mono)';
    ctxRepos.fillText(`Active Repositories: ${Object.keys(repoCounts).length}`, 20, 38);
    ctxRepos.fillText(`Avg Conts / Repo: ${(state.contributions.length / (Object.keys(repoCounts).length || 1)).toFixed(1)}`, 20, 52);
  }
}

// Render ledger logs
function renderLogsLedger() {
  const container = document.getElementById('logs-container');
  container.innerHTML = '';

  const search = state.filters.search.toLowerCase().trim();
  const type = state.filters.type;
  const status = state.filters.status;
  const filterDate = state.filters.date;

  // Filter contributions
  let filtered = state.contributions.filter(c => {
    // Search filter
    const matchesSearch = c.title.toLowerCase().includes(search) || 
                          c.repo.toLowerCase().includes(search) ||
                          (c.learnings && c.learnings.toLowerCase().includes(search));
    
    // Type filter
    const matchesType = type === 'all' || c.type === type;
    
    // Status filter
    const matchesStatus = status === 'all' || c.status === status;

    // Date filter
    const matchesDate = !filterDate || c.date === filterDate;

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Sort contributions
  filtered.sort((a, b) => {
    if (state.sortBy === 'date-desc') {
      return new Date(b.date) - new Date(a.date);
    } else if (state.sortBy === 'date-asc') {
      return new Date(a.date) - new Date(b.date);
    } else if (state.sortBy === 'repo-asc') {
      return a.repo.localeCompare(b.repo);
    } else if (state.sortBy === 'xp-desc') {
      // Compare calculated XP awards
      const xpA = calculateSingleContributionXP(a);
      const xpB = calculateSingleContributionXP(b);
      return xpB - xpA;
    }
    return 0;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-folder-open"></i></div>
        <h3>No matching contributions found</h3>
        <p>Refine your search queries, reset filters, or log a new entry.</p>
      </div>
    `;
    return;
  }

  // Color mappings for UI badges
  const typeIcons = {
    PR: 'fa-code-pull-request',
    Issue: 'fa-bug',
    Commit: 'fa-code',
    Review: 'fa-user-shield',
    Docs: 'fa-book'
  };

  const typeGradients = {
    PR: 'linear-gradient(135deg, hsl(262, 83%, 65%), hsl(290, 80%, 60%))',
    Issue: 'linear-gradient(135deg, hsl(200, 95%, 48%), hsl(210, 80%, 55%))',
    Commit: 'linear-gradient(135deg, hsl(35, 92%, 52%), hsl(20, 90%, 50%))',
    Review: 'linear-gradient(135deg, hsl(315, 85%, 60%), hsl(340, 80%, 55%))',
    Docs: 'linear-gradient(135deg, hsl(160, 80%, 42%), hsl(140, 70%, 45%))'
  };

  filtered.forEach(c => {
    const card = document.createElement('div');
    card.className = 'log-card';
    card.setAttribute('data-id', c.id);

    const xpAwarded = calculateSingleContributionXP(c);

    // Format Date for view
    const dateFormatted = new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Status mapping classes
    let statusClass = 'status-open';
    if (c.status === 'Merged') statusClass = 'status-merged';
    else if (c.status === 'In Progress') statusClass = 'status-progress';
    else if (c.status === 'Closed') statusClass = 'status-closed';

    const diffClass = `difficulty-${c.difficulty.toLowerCase()}`;

    // Link markup
    const linkMarkup = c.link 
      ? `<a href="${c.link}" target="_blank" rel="noopener noreferrer" class="icon-action-btn" title="View Source Link" aria-label="View Source Link">
           <i class="fa-solid fa-arrow-up-right-from-square"></i>
         </a>`
      : '';

    card.innerHTML = `
      <div class="log-card-header" onclick="toggleCardDrawer('${c.id}')">
        <div class="log-card-main">
          <div class="log-card-type-icon" style="background: ${typeGradients[c.type]}; color: #fff;" title="${c.type}">
            <i class="fa-solid ${typeIcons[c.type]}"></i>
          </div>
          <div class="log-card-details">
            <h4 class="log-card-title">${c.title}</h4>
            <div class="log-card-meta">
              <span class="log-card-repo"><i class="fa-solid fa-code-fork"></i> ${c.repo}</span>
              <span class="divider-dot"></span>
              <span>${dateFormatted}</span>
              <span class="divider-dot"></span>
              <span class="badge-status ${statusClass}">${c.status}</span>
              <span class="divider-dot"></span>
              <span class="badge-difficulty ${diffClass}">${c.difficulty}</span>
              <span class="divider-dot"></span>
              <span class="level-badge" style="margin: 0; padding: 2px 8px; font-size: 0.65rem;">+${xpAwarded} XP</span>
            </div>
          </div>
        </div>
        
        <div class="log-card-actions" onclick="event.stopPropagation();">
          ${linkMarkup}
          <button class="icon-action-btn" onclick="editContribution('${c.id}')" title="Edit Contribution">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="icon-action-btn delete-btn-hover" onclick="deleteContribution('${c.id}')" title="Delete Contribution">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="log-card-drawer">
        <div class="drawer-content">
          <div class="notes-label"><i class="fa-regular fa-clipboard"></i> Learnings & Notes</div>
          <p class="notes-body">${c.learnings || 'No additional notes or technical learnings logged for this contribution.'}</p>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function calculateSingleContributionXP(c) {
  let base = 20;
  if (c.type === 'PR') {
    base = XP_VALUES.PR[c.status] || XP_VALUES.PR.Open;
  } else if (c.type === 'Issue') {
    base = XP_VALUES.Issue[c.status] || XP_VALUES.Issue.Open;
  } else if (c.type === 'Commit') {
    base = XP_VALUES.Commit;
  } else if (c.type === 'Review') {
    base = XP_VALUES.Review;
  } else if (c.type === 'Docs') {
    base = XP_VALUES.Docs;
  }

  const mult = DIFFICULTY_MULTIPLIERS[c.difficulty] || 1.0;
  return Math.floor(base * mult);
}

// Toggle expansion drawer of cards
window.toggleCardDrawer = function(id) {
  const cards = document.querySelectorAll('.log-card');
  cards.forEach(card => {
    if (card.getAttribute('data-id') === id) {
      card.classList.toggle('expanded');
    }
  });
};

// ==========================================================================
// ACTIONS & FORM CONTROLS (CRUD)
// ==========================================================================

// Open Log Modal Form
function openContributionModal(editId = null) {
  const modal = document.getElementById('modal-contribution');
  const form = document.getElementById('contribution-form');
  const title = document.getElementById('modal-title');
  
  form.reset();
  document.getElementById('form-edit-id').value = '';
  document.getElementById('form-date').value = new Date().toISOString().split('T')[0];

  if (editId) {
    title.textContent = 'Edit Contribution';
    const c = state.contributions.find(item => item.id === editId);
    if (c) {
      document.getElementById('form-edit-id').value = c.id;
      document.getElementById('form-repo').value = c.repo;
      document.getElementById('form-type').value = c.type;
      document.getElementById('form-title').value = c.title;
      document.getElementById('form-status').value = c.status;
      document.getElementById('form-difficulty').value = c.difficulty;
      document.getElementById('form-date').value = c.date;
      document.getElementById('form-link').value = c.link || '';
      document.getElementById('form-learnings').value = c.learnings || '';
      
      updateStatusDropdownOptions(c.type);
    }
  } else {
    title.textContent = 'Log Contribution';
    updateStatusDropdownOptions('');
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('form-repo').focus();
}

// Close Modal
function closeContributionModal() {
  const modal = document.getElementById('modal-contribution');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

// Update status dropdown items dynamically depending on type selection
function updateStatusDropdownOptions(type) {
  const statusSelect = document.getElementById('form-status');
  const currentVal = statusSelect.value;
  
  statusSelect.innerHTML = '';
  
  if (type === 'Issue') {
    statusSelect.innerHTML = `
      <option value="Open">Open</option>
      <option value="In Progress">In Progress</option>
      <option value="Closed">Closed</option>
    `;
  } else if (type === 'PR') {
    statusSelect.innerHTML = `
      <option value="Open">Open</option>
      <option value="In Progress">In Progress</option>
      <option value="Merged">Merged</option>
      <option value="Closed">Closed</option>
    `;
  } else {
    // Commit, Review, Docs have standard completed status
    statusSelect.innerHTML = `
      <option value="Merged">Completed / Merged</option>
      <option value="In Progress">In Progress</option>
      <option value="Open">Open / Draft</option>
    `;
  }

  // Retain selection if valid
  if (Array.from(statusSelect.options).some(o => o.value === currentVal)) {
    statusSelect.value = currentVal;
  }
}

// Edit Contribution handler (triggered from card actions)
window.editContribution = function(id) {
  openContributionModal(id);
};

// Delete Contribution handler
window.deleteContribution = function(id) {
  if (confirm('Are you sure you want to delete this contribution log? Unearned XP will be deducted.')) {
    state.contributions = state.contributions.filter(c => c.id !== id);
    saveStateToLocal();
    showToast('Contribution removed successfully.', 'success');
    
    // Clear date filter if no contributions left on that date
    if (state.filters.date) {
      const remainingOnDate = state.contributions.some(c => c.date === state.filters.date);
      if (!remainingOnDate) {
        state.filters.date = null;
        document.getElementById('heatmap-filter-alert').style.display = 'none';
      }
    }

    renderAll();
  }
};

// Save Contribution form submit
function handleFormSubmit(e) {
  e.preventDefault();
  
  const editId = document.getElementById('form-edit-id').value;
  const repo = document.getElementById('form-repo').value.trim();
  const type = document.getElementById('form-type').value;
  const title = document.getElementById('form-title').value.trim();
  const status = document.getElementById('form-status').value;
  const difficulty = document.getElementById('form-difficulty').value;
  const date = document.getElementById('form-date').value;
  const link = document.getElementById('form-link').value.trim();
  const learnings = document.getElementById('form-learnings').value.trim();

  // Basic validate
  if (!repo || !type || !title || !status || !difficulty || !date) {
    showToast('Please fill in all required inputs.', 'error');
    return;
  }

  if (editId) {
    // Update existing
    const idx = state.contributions.findIndex(c => c.id === editId);
    if (idx !== -1) {
      state.contributions[idx] = {
        id: editId,
        repo,
        type,
        title,
        status,
        difficulty,
        date,
        link,
        learnings
      };
      showToast('Contribution updated successfully!', 'success');
    }
  } else {
    // Create new
    const newCont = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'c_' + Date.now() + '_' + Math.floor(Math.random()*1000),
      repo,
      type,
      title,
      status,
      difficulty,
      date,
      link,
      learnings
    };
    state.contributions.push(newCont);
    showToast('New contribution logged +XP earned!', 'success');
  }

  saveStateToLocal();
  closeContributionModal();
  renderAll();
}

// Edit Avatar Seed
function changeAvatarSeed() {
  const currentSeed = state.profileSeed;
  const newSeed = prompt('Enter a new avatar seed string:', currentSeed);
  if (newSeed && newSeed.trim() !== '') {
    state.profileSeed = newSeed.trim();
    localStorage.setItem(PROFILE_SEED_KEY, state.profileSeed);
    renderAll();
    showToast('Avatar seed updated!', 'success');
  }
}

// ==========================================================================
// DATA PORTABILITY (EXPORT / IMPORT / SEED)
// ==========================================================================

// Seed Sample database
window.seedDefaultData = function(verbose = true) {
  const today = new Date();
  
  // Create 20 mock contributions distributed over the past year
  const sampleProjects = ['facebook/react', 'nodejs/node', 'microsoft/typescript', 'python/cpython', 'tailwindlabs/tailwindcss', 'cu-sanjay/Web-Dev-Projects'];
  const sampleTitles = {
    PR: [
      'Fix memory leak in compiler engine',
      'Optimize virtual DOM patching algorithm',
      'Add support for structural subtyping in parser',
      'Update async file stream event handler',
      'Refactor tokenization sequence loops'
    ],
    Issue: [
      'Crash observed on recursive template instantiation',
      'Incorrect type inference on union configurations',
      'Network sockets hang under high stress loads',
      'Documentation links broken in contributing layout'
    ],
    Commit: [
      'Clean up redundant import calls in router',
      'Bump node core packages version configurations',
      'Setup visual design tokens for layout templates',
      'Optimize boundary check arithmetic'
    ],
    Review: [
      'Review: Implement multi-threaded thread pools',
      'Review: Add WebAssembly compiler pipeline tests',
      'Review: Support nested media query parser layouts'
    ],
    Docs: [
      'Rewrite international translation guides',
      'Add code sandbox samples to layout guides',
      'Document security policies and encryption structures'
    ]
  };

  const sampleLogs = [];
  const totalSamples = 24;

  // Generate contributions spread across dates
  for (let i = 0; i < totalSamples; i++) {
    const typeArr = ['PR', 'Issue', 'Commit', 'Review', 'Docs'];
    const type = typeArr[Math.floor(Math.random() * typeArr.length)];
    
    const statusOpts = type === 'PR' ? ['Merged', 'Open', 'Closed'] : 
                       type === 'Issue' ? ['Closed', 'Open', 'In Progress'] : ['Merged'];
    const status = statusOpts[Math.floor(Math.random() * statusOpts.length)];
    
    const diffOpts = ['Easy', 'Medium', 'Hard'];
    const difficulty = diffOpts[Math.floor(Math.random() * diffOpts.length)];

    // Calculate dates spread within last 320 days
    const dateOffset = Math.floor(Math.random() * 320);
    const d = new Date(today);
    d.setDate(today.getDate() - dateOffset);
    const dateStr = d.toISOString().split('T')[0];

    const repo = sampleProjects[Math.floor(Math.random() * sampleProjects.length)];
    const titles = sampleTitles[type];
    const title = titles[Math.floor(Math.random() * titles.length)];

    sampleLogs.push({
      id: `seed_${i}_${Date.now()}`,
      repo,
      type,
      title,
      status,
      difficulty,
      date: dateStr,
      link: `https://github.com/${repo}/${type.toLowerCase()}s/${100 + i}`,
      learnings: `Sample automated log data. Investigated structural behaviors, reviewed baseline constraints, verified unit testing scopes, and optimized standard algorithm loops in ${repo}.`
    });
  }

  // Sort by date descending
  sampleLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

  state.contributions = sampleLogs;
  saveStateToLocal();
  
  if (verbose) {
    showToast('Sandbox seeded with 24 contribution instances!', 'success');
  }
  
  renderAll();
};

// Export to JSON file download
function exportDatabase() {
  if (state.contributions.length === 0) {
    showToast('Database empty. Nothing to export.', 'error');
    return;
  }
  
  const dataStr = JSON.stringify(state.contributions, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const tempLink = document.createElement('a');
  tempLink.href = url;
  tempLink.download = `os-contributions-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  URL.revokeObjectURL(url);
  
  showToast('Database exported successfully!', 'success');
}

// Trigger Import Selector
function triggerImportSelection() {
  document.getElementById('import-file-selector').click();
}

// Handle Import file parser
function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (Array.isArray(parsed)) {
        // Simple validation checks on items
        const isValid = parsed.every(item => item.id && item.repo && item.type && item.title && item.status && item.difficulty && item.date);
        
        if (isValid) {
          state.contributions = parsed;
          saveStateToLocal();
          showToast('Database successfully restored!', 'success');
          renderAll();
        } else {
          showToast('Failed to validate backup schema formats.', 'error');
        }
      } else {
        showToast('JSON file root is not an array structure.', 'error');
      }
    } catch (err) {
      showToast('Error parsing JSON backup file.', 'error');
    }
  };
  reader.readAsText(file);
  // Reset input value to allow selecting same file
  e.target.value = '';
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  else if (type === 'error') icon = 'fa-circle-xmark';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);

  // Animate slide-out and remove
  setTimeout(() => {
    toast.style.animation = 'slideInRight var(--transition-fast) reverse forwards';
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 200);
  }, 3000);
}

// ==========================================================================
// THEME & SHORTCUTS BINDINGS
// ==========================================================================

function initTheme() {
  const savedTheme = localStorage.getItem(USER_THEME_KEY);
  if (savedTheme) {
    state.theme = savedTheme;
  } else {
    // Default to dark theme if none saved
    state.theme = 'dark-theme';
  }
  
  document.body.className = state.theme;
  updateThemeButtonUI();
}

function toggleTheme() {
  if (state.theme === 'dark-theme') {
    state.theme = 'light-theme';
  } else {
    state.theme = 'dark-theme';
  }
  
  document.body.className = state.theme;
  localStorage.setItem(USER_THEME_KEY, state.theme);
  updateThemeButtonUI();
  
  // Re-render Canvas elements to adjust labels/gridlines colors
  renderCharts();
  
  showToast(`Theme switched to ${state.theme === 'dark-theme' ? 'Dark' : 'Light'} Mode`, 'info');
}

function updateThemeButtonUI() {
  const themeText = document.getElementById('theme-text');
  const themeIcon = document.querySelector('.theme-icon');
  
  if (state.theme === 'dark-theme') {
    themeText.textContent = 'Light Theme';
    themeIcon.className = 'fa-solid fa-sun theme-icon';
  } else {
    themeText.textContent = 'Dark Theme';
    themeIcon.className = 'fa-solid fa-moon theme-icon';
  }
}

// Event bindings
function bindEvents() {
  // Modal buttons
  document.getElementById('btn-add-contribution').addEventListener('click', () => openContributionModal());
  document.getElementById('btn-close-modal').addEventListener('click', closeContributionModal);
  document.getElementById('btn-cancel-form').addEventListener('click', closeContributionModal);
  document.getElementById('contribution-form').addEventListener('submit', handleFormSubmit);

  // Avatar seed change
  document.getElementById('btn-edit-avatar').addEventListener('click', changeAvatarSeed);

  // Status auto update on type change in modal
  document.getElementById('form-type').addEventListener('change', (e) => {
    updateStatusDropdownOptions(e.target.value);
  });

  // Filter toolbar
  document.getElementById('filter-search').addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    renderLogsLedger();
  });
  document.getElementById('filter-type').addEventListener('change', (e) => {
    state.filters.type = e.target.value;
    renderLogsLedger();
  });
  document.getElementById('filter-status').addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    renderLogsLedger();
  });
  document.getElementById('sort-by').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderLogsLedger();
  });
  document.getElementById('btn-reset-filters').addEventListener('click', () => {
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-status').value = 'all';
    document.getElementById('sort-by').value = 'date-desc';
    
    state.filters.search = '';
    state.filters.type = 'all';
    state.filters.status = 'all';
    state.filters.date = null;
    state.sortBy = 'date-desc';

    document.getElementById('heatmap-filter-alert').style.display = 'none';

    renderHeatmap();
    renderLogsLedger();
    showToast('Filters reset successfully.', 'info');
  });

  // Clear inline date filter from alert box
  document.getElementById('btn-clear-date-filter').addEventListener('click', () => {
    state.filters.date = null;
    document.getElementById('heatmap-filter-alert').style.display = 'none';
    renderHeatmap();
    renderLogsLedger();
  });

  // Database actions
  document.getElementById('btn-toggle-theme').addEventListener('click', toggleTheme);
  document.getElementById('btn-export-db').addEventListener('click', exportDatabase);
  document.getElementById('btn-import-db').addEventListener('click', triggerImportSelection);
  document.getElementById('import-file-selector').addEventListener('change', handleImportFile);
  document.getElementById('btn-seed-data').addEventListener('click', () => seedDefaultData(true));

  // Keyboard Shortcuts (Alt + N, Alt + T, Alt + E, Alt + I, Alt + R)
  window.addEventListener('keydown', (e) => {
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          openContributionModal();
          break;
        case 't':
          e.preventDefault();
          toggleTheme();
          break;
        case 'e':
          e.preventDefault();
          exportDatabase();
          break;
        case 'i':
          e.preventDefault();
          triggerImportSelection();
          break;
        case 'r':
          e.preventDefault();
          seedDefaultData(true);
          break;
      }
    }
  });

  // Close modal when clicking on backdrop shadow
  const modalBackdrop = document.getElementById('modal-contribution');
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeContributionModal();
    }
  });
}
