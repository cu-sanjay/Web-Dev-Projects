/**
 * ReadFlow - Reading Progress Tracker
 * Core Application Script
 */

// ==========================================================================
// APPLICATION STATE & DATABASE SCHEMAS
// ==========================================================================
let state = {
  books: [],
  sessions: [],
  quotes: [],
  settings: {
    monthlyGoal: 3
  }
};

const STORAGE_KEYS = {
  BOOKS: "readflow_books",
  SESSIONS: "readflow_sessions",
  QUOTES: "readflow_quotes",
  SETTINGS: "readflow_settings",
  THEME: "readflow_theme"
};

// Colors mapping for book custom palette themes
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
const SEED_BOOKS = [
  {
    id: "b-1",
    title: "Atomic Habits",
    author: "James Clear",
    totalPages: 320,
    currentPage: 128,
    status: "reading",
    genre: "Self-Help",
    coverUrl: "",
    theme: "orange",
    rating: 5,
    addedDate: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
    completedDate: null
  },
  {
    id: "b-2",
    title: "Dune",
    author: "Frank Herbert",
    totalPages: 600,
    currentPage: 245,
    status: "reading",
    genre: "Sci-Fi",
    coverUrl: "",
    theme: "blue",
    rating: 4,
    addedDate: new Date(Date.now() - 40 * 86400000).toISOString().split("T")[0],
    completedDate: null
  },
  {
    id: "b-3",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    totalPages: 310,
    currentPage: 310,
    status: "completed",
    genre: "Fantasy",
    coverUrl: "",
    theme: "teal",
    rating: 5,
    addedDate: new Date(Date.now() - 50 * 86400000).toISOString().split("T")[0],
    completedDate: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0]
  },
  {
    id: "b-4",
    title: "Deep Work",
    author: "Cal Newport",
    totalPages: 300,
    currentPage: 0,
    status: "to-read",
    genre: "Productivity",
    coverUrl: "",
    theme: "purple",
    rating: 0,
    addedDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    completedDate: null
  }
];

function getSeedSessions() {
  const formatOffset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0];
  };

  return [
    {
      id: "s-1",
      bookId: "b-1",
      date: formatOffset(5),
      duration: 45, // in minutes
      pagesRead: 32,
      notes: "Learned about the 1st Law of Habit loop: Make it obvious."
    },
    {
      id: "s-2",
      bookId: "b-1",
      date: formatOffset(4),
      duration: 60,
      pagesRead: 45,
      notes: "Interesting breakdown on environmental design adjustments."
    },
    {
      id: "s-3",
      bookId: "b-2",
      date: formatOffset(3),
      duration: 90,
      pagesRead: 55,
      notes: "Arrakis descriptions are dense but highly atmospheric."
    },
    {
      id: "s-4",
      bookId: "b-1",
      date: formatOffset(2),
      duration: 40,
      pagesRead: 30,
      notes: "2nd Law: Make it attractive. Replaced cue links."
    },
    {
      id: "s-5",
      bookId: "b-2",
      date: formatOffset(1),
      duration: 120,
      pagesRead: 80,
      notes: "Fascinating dialogue with the Reverend Mother."
    }
  ];
}

const SEED_QUOTES = [
  {
    id: "q-1",
    bookId: "b-1",
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    page: 24,
    date: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0]
  },
  {
    id: "q-2",
    bookId: "b-2",
    text: "Fear is the mind-killer. Fear is the little-death that brings total obliteration.",
    page: 8,
    date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0]
  },
  {
    id: "q-3",
    bookId: "b-3",
    text: "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell...",
    page: 1,
    date: new Date(Date.now() - 50 * 86400000).toISOString().split("T")[0]
  }
];

// Initialize Storage
function initDatabase() {
  const localBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
  const localSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  const localQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
  const localSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

  if (!localBooks) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(SEED_BOOKS));
    state.books = [...SEED_BOOKS];
  } else {
    state.books = JSON.parse(localBooks);
  }

  if (!localSessions) {
    const seedSessions = getSeedSessions();
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(seedSessions));
    state.sessions = seedSessions;
  } else {
    state.sessions = JSON.parse(localSessions);
  }

  if (!localQuotes) {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(SEED_QUOTES));
    state.quotes = [...SEED_QUOTES];
  } else {
    state.quotes = JSON.parse(localQuotes);
  }

  if (!localSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  } else {
    state.settings = { ...state.settings, ...JSON.parse(localSettings) };
  }
}

function saveStateToStorage() {
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(state.books));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(state.sessions));
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(state.quotes));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
}

// ==========================================================================
// STREAK & ANALYTICS CALCULATIONS
// ==========================================================================
function getBookTitle(bookId) {
  const book = state.books.find(b => b.id === bookId);
  return book ? book.title : "Unknown Book";
}

function getBookThemeColor(bookId) {
  const book = state.books.find(b => b.id === bookId);
  const theme = book ? book.theme : "blue";
  return PALETTE_THEMES[theme] || PALETTE_THEMES.blue;
}

// Compute daily reading streak
function calculateReadingStreak() {
  if (state.sessions.length === 0) return 0;

  // Extract unique sorted dates (descending)
  const dates = [...new Set(state.sessions.map(s => s.date))]
    .map(dStr => new Date(dStr))
    .sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0,0,0,0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Check if read today or yesterday
  const latestDate = dates[0];
  latestDate.setHours(0,0,0,0);

  if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  let currentCompare = latestDate;

  for (let i = 1; i < dates.length; i++) {
    const nextDate = dates[i];
    nextDate.setHours(0,0,0,0);

    const checkDate = new Date(currentCompare);
    checkDate.setDate(currentCompare.getDate() - 1);

    if (nextDate.getTime() === checkDate.getTime()) {
      streak++;
      currentCompare = nextDate;
    } else if (nextDate.getTime() < checkDate.getTime()) {
      // Streak broken in past logs
      break;
    }
  }

  return streak;
}

function getDashboardAnalytics() {
  const finishedBooksCount = state.books.filter(b => b.status === "completed").length;
  
  // Total pages sum
  const totalPagesRead = state.books.reduce((sum, b) => sum + (parseInt(b.currentPage) || 0), 0);

  // Speed logic
  const totalDurationMin = state.sessions.reduce((sum, s) => sum + (parseFloat(s.duration) || 0), 0);
  const totalPagesLogged = state.sessions.reduce((sum, s) => sum + (parseInt(s.pagesRead) || 0), 0);
  
  let avgSpeed = 0;
  if (totalDurationMin > 0) {
    const totalHours = totalDurationMin / 60;
    avgSpeed = Math.round(totalPagesLogged / totalHours);
  }

  const streak = calculateReadingStreak();

  return {
    finishedBooksCount,
    totalPagesRead,
    avgSpeed,
    streak
  };
}

// ==========================================================================
// DOM ELEMENT CACHE
// ==========================================================================
const DOM = {
  // Tabs & themes
  navButtons: document.querySelectorAll(".nav-btn"),
  sections: document.querySelectorAll(".tab-content"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeToggleText: document.getElementById("themeToggleText"),

  // KPIs
  kpiFinishedBooks: document.getElementById("kpiFinishedBooks"),
  kpiTotalPages: document.getElementById("kpiTotalPages"),
  kpiAvgSpeed: document.getElementById("kpiAvgSpeed"),
  kpiStreak: document.getElementById("kpiStreak"),
  dashboardActiveBooksList: document.getElementById("dashboardActiveBooksList"),
  
  // Goals widget
  goalPeriodHeader: document.getElementById("goalPeriodHeader"),
  goalGaugePath: document.getElementById("goalGaugePath"),
  goalGaugePct: document.getElementById("goalGaugePct"),
  goalGaugeRatio: document.getElementById("goalGaugeRatio"),
  goalMessage: document.getElementById("goalMessage"),
  activityChartContainer: document.getElementById("activityChartContainer"),
  dashboardQuickProgressBtn: document.getElementById("dashboardQuickProgressBtn"),

  // Library tab
  librarySearchInput: document.getElementById("librarySearchInput"),
  filterPills: document.querySelectorAll(".filter-pill"),
  libraryBooksGrid: document.getElementById("libraryBooksGrid"),
  libraryEmptyState: document.getElementById("libraryEmptyState"),
  addNewBookBtn: document.getElementById("addNewBookBtn"),

  // Book Modal
  bookModal: document.getElementById("bookModal"),
  bookModalTitle: document.getElementById("bookModalTitle"),
  closeBookModalBtn: document.getElementById("closeBookModalBtn"),
  bookForm: document.getElementById("bookForm"),
  bookModalIndex: document.getElementById("bookModalIndex"),
  bookTitleInput: document.getElementById("bookTitleInput"),
  bookAuthorInput: document.getElementById("bookAuthorInput"),
  bookPagesInput: document.getElementById("bookPagesInput"),
  bookStatusSelect: document.getElementById("bookStatusSelect"),
  bookGenreInput: document.getElementById("bookGenreInput"),
  bookCoverInput: document.getElementById("bookCoverInput"),
  bookRatingSelect: document.getElementById("bookRatingSelect"),
  cancelBookBtn: document.getElementById("cancelBookBtn"),

  // Page Update modal
  progressModal: document.getElementById("progressModal"),
  closeProgressModalBtn: document.getElementById("closeProgressModalBtn"),
  progressForm: document.getElementById("progressForm"),
  progressBookId: document.getElementById("progressBookId"),
  progressBookTitle: document.getElementById("progressBookTitle"),
  progressPagesTrack: document.getElementById("progressPagesTrack"),
  progressPageInput: document.getElementById("progressPageInput"),
  progressNotesInput: document.getElementById("progressNotesInput"),
  cancelProgressBtn: document.getElementById("cancelProgressBtn"),

  // Timer tab
  timerBookSelect: document.getElementById("timerBookSelect"),
  timerMinutes: document.getElementById("timerMinutes"),
  timerSeconds: document.getElementById("timerSeconds"),
  startTimerBtn: document.getElementById("startTimerBtn"),
  pauseTimerBtn: document.getElementById("pauseTimerBtn"),
  stopTimerBtn: document.getElementById("stopTimerBtn"),
  timerStatusBadge: document.getElementById("timerStatusBadge"),
  sessionsHistoryTableBody: document.getElementById("sessionsHistoryTableBody"),
  sessionsEmptyState: document.getElementById("sessionsEmptyState"),

  // Session End modal
  sessionEndModal: document.getElementById("sessionEndModal"),
  sessionEndForm: document.getElementById("sessionEndForm"),
  sessionEndBookId: document.getElementById("sessionEndBookId"),
  sessionEndDuration: document.getElementById("sessionEndDuration"),
  sessionEndBookTitle: document.getElementById("sessionEndBookTitle"),
  sessionEndDurationFormatted: document.getElementById("sessionEndDurationFormatted"),
  sessionEndPageInput: document.getElementById("sessionEndPageInput"),
  sessionEndNotesInput: document.getElementById("sessionEndNotesInput"),
  sessionEndPagesLimit: document.getElementById("sessionEndPagesLimit"),
  skipSessionLogBtn: document.getElementById("skipSessionLogBtn"),

  // Quotes tab
  quoteSearchInput: document.getElementById("quoteSearchInput"),
  quoteBookFilter: document.getElementById("quoteBookFilter"),
  quotesGrid: document.getElementById("quotesGrid"),
  quotesEmptyState: document.getElementById("quotesEmptyState"),
  addNewQuoteBtn: document.getElementById("addNewQuoteBtn"),

  // Quote Modal
  quoteModal: document.getElementById("quoteModal"),
  closeQuoteModalBtn: document.getElementById("closeQuoteModalBtn"),
  quoteForm: document.getElementById("quoteForm"),
  quoteBookSelect: document.getElementById("quoteBookSelect"),
  quoteTextInput: document.getElementById("quoteTextInput"),
  quotePageInput: document.getElementById("quotePageInput"),
  quoteDateInput: document.getElementById("quoteDateInput"),
  cancelQuoteBtn: document.getElementById("cancelQuoteBtn"),

  // Settings
  goalsConfigForm: document.getElementById("goalsConfigForm"),
  settingsMonthlyGoal: document.getElementById("settingsMonthlyGoal"),
  exportBackupBtn: document.getElementById("exportBackupBtn"),
  importBackupInput: document.getElementById("importBackupInput"),
  resetDatabaseBtn: document.getElementById("resetDatabaseBtn")
};

// ==========================================================================
// ROUTING & THEME MANAGEMENT
// ==========================================================================
function initAppRouting() {
  DOM.navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Prevent tab navigation if timer is active
      if (timerState.active) {
        if (!confirm("Your focus reading timer is running. Navigating to another tab will reset the timer. Continue?")) {
          return;
        }
        resetStopwatchTimer();
      }

      DOM.navButtons.forEach(b => b.classList.remove("active"));
      DOM.sections.forEach(s => s.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");

      // Reload modules
      if (targetId === "dashboard-section") {
        renderDashboard();
      } else if (targetId === "library-section") {
        renderLibraryBooksGrid();
      } else if (targetId === "sessions-section") {
        loadTimerView();
      } else if (targetId === "quotes-section") {
        renderQuotesView();
      }
    });
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
// DASHBOARD RENDERING & CHART VISUALS
// ==========================================================================
function renderDashboard() {
  const analytics = getDashboardAnalytics();

  // Draw counter fields
  DOM.kpiFinishedBooks.textContent = analytics.finishedBooksCount;
  DOM.kpiTotalPages.textContent = analytics.totalPagesRead;
  DOM.kpiAvgSpeed.textContent = `${analytics.avgSpeed} pg/hr`;
  DOM.kpiStreak.textContent = `${analytics.streak} day${analytics.streak !== 1 ? 's' : ''}`;

  renderDashboardActiveBooks();
  renderGoalsProgressGauge();
  renderActivityChart();
}

function renderDashboardActiveBooks() {
  const readingList = state.books.filter(b => b.status === "reading");
  DOM.dashboardActiveBooksList.innerHTML = "";

  if (readingList.length === 0) {
    DOM.dashboardActiveBooksList.innerHTML = `
      <div class="empty-state-container" style="padding: 24px 0;">
        <p>No active books on your shelf. Set a library record to Currently Reading to begin tracking.</p>
      </div>
    `;
    return;
  }

  readingList.forEach(book => {
    const pct = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
    const coverInitials = book.title.split(" ").map(w => w[0]).join("").substring(0,2).toUpperCase();
    const coverBgStyle = book.coverUrl ? `style="background-image: url('${book.coverUrl}');"` : '';
    
    const div = document.createElement("div");
    div.className = "active-book-item";
    div.innerHTML = `
      <div class="active-book-cover" ${coverBgStyle} style="background-color: ${PALETTE_THEMES[book.theme]};">
        ${book.coverUrl ? '' : coverInitials}
      </div>
      <div class="active-book-info">
        <h4 class="active-book-title">${book.title}</h4>
        <p class="active-book-author">by ${book.author}</p>
        <div class="active-book-progress-wrapper">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${PALETTE_THEMES[book.theme]};"></div>
          </div>
          <span class="active-book-progress-text">${pct}%</span>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm log-progress-btn" data-id="${book.id}">Update</button>
    `;
    
    div.querySelector(".log-progress-btn").addEventListener("click", () => {
      openProgressModal(book.id);
    });

    DOM.dashboardActiveBooksList.appendChild(div);
  });
}

function renderGoalsProgressGauge() {
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  DOM.goalPeriodHeader.textContent = currentMonth;

  // Count books completed in this current calendar month
  const thisMonthIndex = new Date().getMonth();
  const thisYearIndex = new Date().getFullYear();

  const completedThisMonth = state.books.filter(b => {
    if (b.status !== "completed" || !b.completedDate) return false;
    const compDate = new Date(b.completedDate);
    return compDate.getMonth() === thisMonthIndex && compDate.getFullYear() === thisYearIndex;
  }).length;

  const target = state.settings.monthlyGoal || 3;
  const pct = Math.min(100, Math.round((completedThisMonth / target) * 100));

  // Circular SVG offset manipulation: Circumference = 2 * pi * r = 2 * 3.14159 * 40 = 251.2
  const offset = 251.2 * (1 - pct / 100);
  DOM.goalGaugePath.style.strokeDashoffset = offset;
  DOM.goalGaugePct.textContent = `${pct}%`;
  DOM.goalGaugeRatio.textContent = `${completedThisMonth} of ${target} book${target !== 1 ? 's' : ''}`;

  if (pct >= 100) {
    DOM.goalMessage.textContent = "Congratulations! You've achieved your reading goal this month!";
  } else {
    const diff = target - completedThisMonth;
    DOM.goalMessage.textContent = `Finish ${diff} more book${diff !== 1 ? 's' : ''} to complete your ${currentMonth} target.`;
  }
}

function renderActivityChart() {
  DOM.activityChartContainer.innerHTML = "";

  // Set up last 7 days keys
  const dayLabels = [];
  const dayDates = []; // Format YYYY-MM-DD
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayLabels.push(d.toLocaleString("default", { weekday: "short" }));
    dayDates.push(d.toISOString().split("T")[0]);
  }

  // Calculate pages logged on those days
  const activityMap = {};
  dayDates.forEach(date => { activityMap[date] = 0; });

  state.sessions.forEach(s => {
    if (activityMap.hasOwnProperty(s.date)) {
      activityMap[s.date] += parseInt(s.pagesRead) || 0;
    }
  });

  const chartData = dayDates.map(d => activityMap[d]);
  const maxVal = Math.max(...chartData, 50); // Floor bounds at 50 pages

  // Coordinates
  const width = 600;
  const height = 200;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 25;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const points = [];
  chartData.forEach((val, index) => {
    const x = padLeft + (index / (chartData.length - 1)) * chartWidth;
    const y = padTop + chartHeight - (val / maxVal) * chartHeight;
    points.push({ x, y, val, label: dayLabels[index] });
  });

  let svgContent = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
  `;

  // Helper horizontal grid lines
  for (let i = 0; i <= 3; i++) {
    const yTrack = padTop + (i / 3) * chartHeight;
    const valTrack = Math.round(maxVal - (i / 3) * maxVal);
    svgContent += `
      <line class="chart-grid-line" x1="${padLeft}" y1="${yTrack}" x2="${width - padRight}" y2="${yTrack}" />
      <text class="chart-text" x="5" y="${yTrack + 3}">${valTrack}</text>
    `;
  }

  let pathStr = "";
  let fillStr = `M ${points[0].x} ${padTop + chartHeight}`;

  points.forEach((pt, index) => {
    const operator = index === 0 ? "M" : "L";
    pathStr += ` ${operator} ${pt.x} ${pt.y}`;
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
        <title>${pt.label}: ${pt.val} pages</title>
      </circle>
      <text class="chart-text" x="${pt.x}" y="${height - 5}" text-anchor="middle">${pt.label}</text>
    `;
  });

  svgContent += `</svg>`;
  DOM.activityChartContainer.innerHTML = svgContent;
}

// Quick Log trigger from Dashboard
function initDashboardQuickProgress() {
  DOM.dashboardQuickProgressBtn.addEventListener("click", () => {
    const readingBooks = state.books.filter(b => b.status === "reading");
    if (readingBooks.length === 0) {
      alert("You have no active 'Currently Reading' books. Register a book and set its status to Reading first.");
      return;
    }
    openProgressModal(readingBooks[0].id);
  });
}

// ==========================================================================
// MY LIBRARY & DIGITAL BOOKSHELF
// ==========================================================================
let activeLibraryFilterStatus = "all";

function renderLibraryBooksGrid() {
  const query = DOM.librarySearchInput.value.toLowerCase().trim();
  DOM.libraryBooksGrid.innerHTML = "";

  let filtered = state.books.filter(b => {
    const title = b.title.toLowerCase();
    const author = b.author.toLowerCase();
    const genre = (b.genre || "").toLowerCase();
    const textMatch = title.includes(query) || author.includes(query) || genre.includes(query);

    const statusMatch = activeLibraryFilterStatus === "all" || b.status === activeLibraryFilterStatus;

    return textMatch && statusMatch;
  });

  if (filtered.length === 0) {
    DOM.libraryEmptyState.classList.remove("hidden");
    return;
  }
  DOM.libraryEmptyState.classList.add("hidden");

  filtered.forEach(book => {
    const pct = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
    const coverInitials = book.title.split(" ").map(w => w[0]).join("").substring(0,2).toUpperCase();
    const coverBgStyle = book.coverUrl ? `style="background-image: url('${book.coverUrl}');"` : '';
    const bookThemeColor = PALETTE_THEMES[book.theme] || PALETTE_THEMES.blue;

    // Build star display elements
    let starsHtml = "";
    if (book.rating > 0) {
      for (let i = 1; i <= 5; i++) {
        starsHtml += i <= book.rating ? "★" : "☆";
      }
    }

    const card = document.createElement("div");
    card.className = "book-card";
    card.setAttribute("style", `--book-theme-color: ${bookThemeColor}`);
    card.innerHTML = `
      <div class="book-card-cover-area">
        <div class="book-cover-img" ${coverBgStyle}>
          ${book.coverUrl ? '' : `
            <span class="book-cover-placeholder-title">${book.title}</span>
            <span class="book-cover-placeholder-author">${book.author}</span>
          `}
        </div>
        <span class="book-status-badge badge-${book.status}">${book.status.replace('-', ' ')}</span>
      </div>
      <div class="book-card-details">
        <span class="book-card-genre">${book.genre || "No Genre"}</span>
        <h3 class="book-card-title" title="${book.title}">${book.title}</h3>
        <p class="book-card-author">by ${book.author}</p>
        
        <div class="book-card-progress">
          <div class="book-card-progress-ratio">
            <span>Progress</span>
            <span>${book.currentPage} / ${book.totalPages} pgs</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${bookThemeColor};"></div>
          </div>
        </div>

        <div class="book-card-footer">
          <span class="book-rating-stars">${starsHtml}</span>
          <div class="book-card-actions">
            <button class="btn btn-secondary btn-sm edit-bk-btn" title="Edit book details">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn-primary btn-sm update-bk-btn">Log Pg</button>
          </div>
        </div>
      </div>
    `;

    // Hook bindings
    card.querySelector(".edit-bk-btn").addEventListener("click", () => {
      const actualIndex = state.books.findIndex(b => b.id === book.id);
      openBookModal(actualIndex);
    });

    card.querySelector(".update-bk-btn").addEventListener("click", () => {
      openProgressModal(book.id);
    });

    DOM.libraryBooksGrid.appendChild(card);
  });
}

function initLibraryControls() {
  DOM.librarySearchInput.addEventListener("input", renderLibraryBooksGrid);

  DOM.filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      DOM.filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeLibraryFilterStatus = pill.getAttribute("data-status");
      renderLibraryBooksGrid();
    });
  });

  DOM.addNewBookBtn.addEventListener("click", () => openBookModal());
}

// Book Modal Logic
function openBookModal(index = null) {
  DOM.bookModal.classList.remove("hidden");
  DOM.bookForm.reset();

  if (index !== null) {
    const book = state.books[index];
    DOM.bookModalTitle.textContent = "Edit Book";
    DOM.bookModalIndex.value = index;
    DOM.bookTitleInput.value = book.title;
    DOM.bookAuthorInput.value = book.author;
    DOM.bookPagesInput.value = book.totalPages;
    DOM.bookStatusSelect.value = book.status;
    DOM.bookGenreInput.value = book.genre || "";
    DOM.bookCoverInput.value = book.coverUrl || "";
    DOM.bookRatingSelect.value = book.rating || 0;
    
    // Select radio swatch
    const radio = document.getElementById(`th-${book.theme}`);
    if (radio) radio.checked = true;
  } else {
    DOM.bookModalTitle.textContent = "Add Book to Shelf";
    DOM.bookModalIndex.value = "";
    document.getElementById("th-blue").checked = true;
  }
}

function closeBookModal() {
  DOM.bookModal.classList.add("hidden");
}

function handleBookFormSubmit(e) {
  e.preventDefault();
  
  const idx = DOM.bookModalIndex.value;
  const title = DOM.bookTitleInput.value.trim();
  const author = DOM.bookAuthorInput.value.trim();
  const totalPages = parseInt(DOM.bookPagesInput.value) || 100;
  const status = DOM.bookStatusSelect.value;
  const genre = DOM.bookGenreInput.value.trim();
  const coverUrl = DOM.bookCoverInput.value.trim();
  const rating = parseInt(DOM.bookRatingSelect.value) || 0;
  const theme = document.querySelector('input[name="bookTheme"]:checked').value;

  if (idx !== "") {
    // Update existing book
    const existingIndex = parseInt(idx);
    const existing = state.books[existingIndex];
    
    // Cap currentPage at new totalPages
    let currentPage = Math.min(existing.currentPage || 0, totalPages);
    let completedDate = existing.completedDate;
    
    if (status === "completed") {
      currentPage = totalPages;
      if (!completedDate) completedDate = new Date().toISOString().split("T")[0];
    } else {
      if (currentPage === totalPages) currentPage = totalPages - 1; // Demote completed status
      completedDate = null;
    }

    state.books[existingIndex] = {
      ...existing,
      title, author, totalPages, currentPage, status, genre, coverUrl, rating, theme, completedDate
    };
  } else {
    // Register new
    let currentPage = 0;
    let completedDate = null;
    if (status === "completed") {
      currentPage = totalPages;
      completedDate = new Date().toISOString().split("T")[0];
    }

    const newBook = {
      id: "b-" + Date.now(),
      title, author, totalPages, currentPage, status, genre, coverUrl, theme, rating,
      addedDate: new Date().toISOString().split("T")[0],
      completedDate
    };

    state.books.push(newBook);
  }

  saveStateToStorage();
  closeBookModal();
  renderLibraryBooksGrid();
}

function initBookModalEvents() {
  DOM.closeBookModalBtn.addEventListener("click", closeBookModal);
  DOM.cancelBookBtn.addEventListener("click", closeBookModal);
  DOM.bookForm.addEventListener("submit", handleBookFormSubmit);
}

// Progress Update modal
function openProgressModal(bookId) {
  DOM.progressModal.classList.remove("hidden");
  DOM.progressForm.reset();

  const book = state.books.find(b => b.id === bookId);
  DOM.progressBookId.value = bookId;
  DOM.progressBookTitle.textContent = book.title;
  DOM.progressPagesTrack.textContent = `Currently on page ${book.currentPage} of ${book.totalPages}`;
  DOM.progressPageInput.value = book.currentPage;
  DOM.progressPageInput.max = book.totalPages;
}

function closeProgressModal() {
  DOM.progressModal.classList.add("hidden");
}

function handleProgressFormSubmit(e) {
  e.preventDefault();

  const bookId = DOM.progressBookId.value;
  const newPage = parseInt(DOM.progressPageInput.value);
  const notes = DOM.progressNotesInput.value.trim();

  const book = state.books.find(b => b.id === bookId);
  if (book) {
    if (newPage < 0 || newPage > book.totalPages) {
      alert(`Invalid page number. Page must be between 0 and ${book.totalPages}.`);
      return;
    }

    // Log pages incremental read
    const pagesRead = Math.max(0, newPage - book.currentPage);

    book.currentPage = newPage;
    if (newPage === book.totalPages) {
      book.status = "completed";
      book.completedDate = new Date().toISOString().split("T")[0];
    } else if (newPage > 0) {
      book.status = "reading";
      book.completedDate = null;
    }

    // If pages were read, automatically append a history log session
    if (pagesRead > 0) {
      state.sessions.push({
        id: "s-" + Date.now(),
        bookId: book.id,
        date: new Date().toISOString().split("T")[0],
        duration: 0, // Manual update has no timer duration associated
        pagesRead,
        notes: notes || "Manual progress milestone check-in."
      });
    }

    saveStateToStorage();
    closeProgressModal();

    // Reload active view tab
    const targetId = document.querySelector(".nav-btn.active").getAttribute("data-target");
    if (targetId === "dashboard-section") renderDashboard();
    else if (targetId === "library-section") renderLibraryBooksGrid();
  }
}

function initProgressModalEvents() {
  DOM.closeProgressModalBtn.addEventListener("click", closeProgressModal);
  DOM.cancelProgressBtn.addEventListener("click", closeProgressModal);
  DOM.progressForm.addEventListener("submit", handleProgressFormSubmit);
}

// ==========================================================================
// STOPWATCH TIMER MODULE
// ==========================================================================
let timerState = {
  active: false,
  paused: false,
  secondsElapsed: 0,
  intervalId: null
};

function loadTimerView() {
  resetStopwatchTimer();
  populateTimerBooksDropdown();
  renderSessionsHistoryTable();
}

function populateTimerBooksDropdown() {
  DOM.timerBookSelect.innerHTML = "";
  const activeReading = state.books.filter(b => b.status === "reading" || b.status === "to-read");
  
  if (activeReading.length === 0) {
    DOM.timerBookSelect.innerHTML = `<option value="">No active reading books</option>`;
    DOM.startTimerBtn.disabled = true;
    return;
  }
  DOM.startTimerBtn.disabled = false;

  activeReading.forEach(book => {
    const opt = document.createElement("option");
    opt.value = book.id;
    opt.textContent = `${book.title} (Page ${book.currentPage} / ${book.totalPages})`;
    DOM.timerBookSelect.appendChild(opt);
  });
}

function startStopwatchTimer() {
  if (timerState.active && !timerState.paused) return;

  timerState.active = true;
  timerState.paused = false;

  DOM.timerBookSelect.disabled = true;
  DOM.timerStatusBadge.textContent = "READING";
  DOM.timerStatusBadge.className = "badge badge-reading";

  DOM.startTimerBtn.classList.add("hidden");
  DOM.pauseTimerBtn.classList.remove("hidden");
  DOM.stopTimerBtn.disabled = false;

  timerState.intervalId = setInterval(() => {
    timerState.secondsElapsed++;
    updateTimerDigits();
  }, 1000);
}

function pauseStopwatchTimer() {
  if (!timerState.active || timerState.paused) return;

  timerState.paused = true;
  clearInterval(timerState.intervalId);

  DOM.timerStatusBadge.textContent = "PAUSED";
  DOM.timerStatusBadge.className = "badge badge-on-hold";

  DOM.pauseTimerBtn.classList.add("hidden");
  DOM.startTimerBtn.classList.remove("hidden");
}

function stopStopwatchTimer() {
  if (!timerState.active) return;
  clearInterval(timerState.intervalId);

  const bookId = DOM.timerBookSelect.value;
  const elapsedSecs = timerState.secondsElapsed;

  // Open Log modal for pages read
  openSessionEndLog(bookId, elapsedSecs);

  // Restore states
  resetStopwatchTimer();
}

function resetStopwatchTimer() {
  clearInterval(timerState.intervalId);
  timerState.active = false;
  timerState.paused = false;
  timerState.secondsElapsed = 0;
  
  DOM.timerBookSelect.disabled = false;
  DOM.timerStatusBadge.textContent = "IDLE";
  DOM.timerStatusBadge.className = "badge badge-to-read";

  DOM.pauseTimerBtn.classList.add("hidden");
  DOM.startTimerBtn.classList.remove("hidden");
  DOM.stopTimerBtn.disabled = true;

  updateTimerDigits();
}

function updateTimerDigits() {
  const mins = Math.floor(timerState.secondsElapsed / 60);
  const secs = timerState.secondsElapsed % 60;
  DOM.timerMinutes.textContent = String(mins).padStart(2, "0");
  DOM.timerSeconds.textContent = String(secs).padStart(2, "0");
}

// Session end log modal
function openSessionEndLog(bookId, elapsedSecs) {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return;

  DOM.sessionEndModal.classList.remove("hidden");
  DOM.sessionEndForm.reset();

  DOM.sessionEndBookId.value = bookId;
  DOM.sessionEndDuration.value = elapsedSecs;
  DOM.sessionEndBookTitle.textContent = book.title;

  const mins = Math.floor(elapsedSecs / 60);
  const secs = elapsedSecs % 60;
  DOM.sessionEndDurationFormatted.textContent = `${mins}m ${secs}s focus read`;
  DOM.sessionEndPagesLimit.textContent = `Limits: Currently on page ${book.currentPage} of ${book.totalPages}`;
  DOM.sessionEndPageInput.value = book.currentPage;
}

function closeSessionEndLog() {
  DOM.sessionEndModal.classList.add("hidden");
}

function handleSessionEndSubmit(e) {
  e.preventDefault();

  const bookId = DOM.sessionEndBookId.value;
  const elapsedSecs = parseInt(DOM.sessionEndDuration.value) || 0;
  const reachedPage = parseInt(DOM.sessionEndPageInput.value);
  const notes = DOM.sessionEndNotesInput.value.trim();

  const book = state.books.find(b => b.id === bookId);
  if (book) {
    if (reachedPage < book.currentPage || reachedPage > book.totalPages) {
      alert(`Invalid page entry. Pages read must align between current page (${book.currentPage}) and total pages (${book.totalPages}).`);
      return;
    }

    const durationMin = Math.max(1, Math.round(elapsedSecs / 60));
    const pagesRead = reachedPage - book.currentPage;

    // Shift page indicators
    book.currentPage = reachedPage;
    if (reachedPage === book.totalPages) {
      book.status = "completed";
      book.completedDate = new Date().toISOString().split("T")[0];
    } else {
      book.status = "reading";
      book.completedDate = null;
    }

    // Save session logs
    state.sessions.push({
      id: "s-" + Date.now(),
      bookId: book.id,
      date: new Date().toISOString().split("T")[0],
      duration: durationMin,
      pagesRead,
      notes: notes || `Completed focused reading session of ${durationMin} mins.`
    });

    saveStateToStorage();
    closeSessionEndLog();
    loadTimerView();
  }
}

function renderSessionsHistoryTable() {
  // Grab newest sessions
  const sorted = [...state.sessions].sort((a,b) => new Date(b.date) - new Date(a.date));
  DOM.sessionsHistoryTableBody.innerHTML = "";

  if (sorted.length === 0) {
    DOM.sessionsEmptyState.classList.remove("hidden");
    return;
  }
  DOM.sessionsEmptyState.classList.add("hidden");

  sorted.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.date}</td>
      <td><strong>${getBookTitle(s.bookId)}</strong></td>
      <td>${s.duration > 0 ? `${s.duration} mins` : 'Manual log'}</td>
      <td>+${s.pagesRead} pages</td>
      <td title="${s.notes}">${s.notes.substring(0, 32)}${s.notes.length > 32 ? '...' : ''}</td>
      <td class="text-right">
        <button class="btn btn-danger-outline btn-sm delete-session-btn" data-id="${s.id}">Delete</button>
      </td>
    `;
    
    tr.querySelector(".delete-session-btn").addEventListener("click", () => {
      if (confirm("Permanently delete this session log record? (This will not modify the book's current page marker)")) {
        state.sessions = state.sessions.filter(item => item.id !== s.id);
        saveStateToStorage();
        renderSessionsHistoryTable();
      }
    });

    DOM.sessionsHistoryTableBody.appendChild(tr);
  });
}

function initTimerEvents() {
  DOM.startTimerBtn.addEventListener("click", startStopwatchTimer);
  DOM.pauseTimerBtn.addEventListener("click", pauseStopwatchTimer);
  DOM.stopTimerBtn.addEventListener("click", stopStopwatchTimer);

  DOM.skipSessionLogBtn.addEventListener("click", () => {
    if (confirm("Discard this focus reading log history?")) {
      closeSessionEndLog();
      loadTimerView();
    }
  });

  DOM.sessionEndForm.addEventListener("submit", handleSessionEndSubmit);
}

// ==========================================================================
// QUOTES & LITERARY PASSAGES VAULT
// ==========================================================================
function renderQuotesView() {
  const query = DOM.quoteSearchInput.value.toLowerCase().trim();
  const bookFilter = DOM.quoteBookFilter.value;

  populateQuotesBookFilters();

  let filtered = state.quotes.filter(q => {
    const text = q.text.toLowerCase();
    const bookTitle = getBookTitle(q.bookId).toLowerCase();
    const textMatch = text.includes(query) || bookTitle.includes(query);

    const bookMatch = bookFilter === "all" || q.bookId === bookFilter;

    return textMatch && bookMatch;
  });

  DOM.quotesGrid.innerHTML = "";
  if (filtered.length === 0) {
    DOM.quotesEmptyState.classList.remove("hidden");
    return;
  }
  DOM.quotesEmptyState.classList.add("hidden");

  filtered.forEach(q => {
    const bookColor = getBookThemeColor(q.bookId);
    
    const card = document.createElement("div");
    card.className = "quote-card";
    card.setAttribute("style", `--book-theme-color: ${bookColor}`);
    card.innerHTML = `
      <button class="btn-icon delete-quote-btn" data-id="${q.id}" title="Delete highlight quote">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
      <p class="quote-card-text">${q.text}</p>
      <div class="quote-card-source">
        <div class="quote-source-meta">
          <h4>${getBookTitle(q.bookId)}</h4>
          <p>Captured: ${q.date}</p>
        </div>
        ${q.page ? `<span class="quote-page-tag">Pg ${q.page}</span>` : ''}
      </div>
    `;
    
    card.querySelector(".delete-quote-btn").addEventListener("click", () => {
      if (confirm("Delete this quote highlight pass permanently?")) {
        state.quotes = state.quotes.filter(item => item.id !== q.id);
        saveStateToStorage();
        renderQuotesView();
      }
    });

    DOM.quotesGrid.appendChild(card);
  });
}

function populateQuotesBookFilters() {
  const currentFilter = DOM.quoteBookFilter.value;
  DOM.quoteBookFilter.innerHTML = `<option value="all">All Books</option>`;
  state.books.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.title;
    DOM.quoteBookFilter.appendChild(opt);
  });
  DOM.quoteBookFilter.value = currentFilter;
}

function populateQuoteModalBooksDropdown() {
  DOM.quoteBookSelect.innerHTML = "";
  state.books.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.title;
    DOM.quoteBookSelect.appendChild(opt);
  });
}

function openQuoteModal() {
  if (state.books.length === 0) {
    alert("Add at least one book to your digital library to start logging quotes.");
    return;
  }
  DOM.quoteModal.classList.remove("hidden");
  DOM.quoteForm.reset();
  populateQuoteModalBooksDropdown();
  DOM.quoteDateInput.value = new Date().toISOString().split("T")[0];
}

function closeQuoteModal() {
  DOM.quoteModal.classList.add("hidden");
}

function handleQuoteSubmit(e) {
  e.preventDefault();

  const bookId = DOM.quoteBookSelect.value;
  const text = DOM.quoteTextInput.value.trim();
  const page = parseInt(DOM.quotePageInput.value) || "";
  const date = DOM.quoteDateInput.value;

  if (!bookId || !text) {
    alert("Please select a book and enter quote details.");
    return;
  }

  state.quotes.push({
    id: "q-" + Date.now(),
    bookId,
    text,
    page,
    date
  });

  saveStateToStorage();
  closeQuoteModal();
  renderQuotesView();
}

function initQuotesViewEvents() {
  DOM.quoteSearchInput.addEventListener("input", renderQuotesView);
  DOM.quoteBookFilter.addEventListener("change", renderQuotesView);
  DOM.addNewQuoteBtn.addEventListener("click", openQuoteModal);
  
  DOM.closeQuoteModalBtn.addEventListener("click", closeQuoteModal);
  DOM.cancelQuoteBtn.addEventListener("click", closeQuoteModal);
  DOM.quoteForm.addEventListener("submit", handleQuoteSubmit);
}

// ==========================================================================
// SETTINGS CONFIGURATION
// ==========================================================================
function loadSettings() {
  DOM.settingsMonthlyGoal.value = state.settings.monthlyGoal || 3;
}

function handleSaveSettings(e) {
  e.preventDefault();
  state.settings.monthlyGoal = parseInt(DOM.settingsMonthlyGoal.value) || 3;
  saveStateToStorage();
  alert("Monthly target config saved successfully.");
}

function exportDatabaseBackup() {
  const database = {
    version: "1.0",
    books: state.books,
    sessions: state.sessions,
    quotes: state.quotes,
    settings: state.settings
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(database, null, 2));
  const anchor = document.createElement("a");
  anchor.setAttribute("href", dataStr);
  anchor.setAttribute("download", `readflow_backup_${new Date().toISOString().split("T")[0]}.json`);
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
      if (parsed.books && parsed.sessions && parsed.quotes && parsed.settings) {
        state.books = parsed.books;
        state.sessions = parsed.sessions;
        state.quotes = parsed.quotes;
        state.settings = parsed.settings;
        
        saveStateToStorage();
        alert("ReadFlow Database Backup loaded successfully.");
        window.location.reload();
      } else {
        alert("Incorrect backup file schema. Needs library database, stopwatches log, and quotes registry.");
      }
    } catch (err) {
      alert("Error parsing backup database file.");
    }
  };

  reader.readAsText(file);
}

function resetDatabaseToSeeds() {
  if (confirm("WARNING: Wiping library data will clear all books progress, logged sessions, and quotes. Continue?")) {
    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.QUOTES);
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
  initDashboardQuickProgress();
  initLibraryControls();
  initBookModalEvents();
  initProgressModalEvents();
  initTimerEvents();
  initQuotesViewEvents();
  initSettingsEvents();

  // Load first screen states
  renderDashboard();
  loadSettings();
});
