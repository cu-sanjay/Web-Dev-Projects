// Platform State Engine
const AppState = {
  flashcards: [],
  categories: [],
  studyHistory: [], // elements: { date: "YYYY-MM-DD", minutes: number, reviews: number }
  streak: 0,
  lastStudyDate: null,
  activePanel: 'dashboard',
  theme: 'dark',
  studyTimeToday: 0, // in seconds
  
  // Active review states
  reviewDeck: [],
  reviewIndex: 0,
  studyMode: 'classic', // 'classic', 'quiz', 'timed'
  timedIntervalId: null,
  timedSeconds: 10,
  
  // Achievements list
  achievements: [
    { id: 'first-card', name: 'Curious Mind', desc: 'Review your first flashcard', unlocked: false, badge: '💡' },
    { id: 'review-ten', name: 'Scholar', desc: 'Review 10 flashcards in total', unlocked: false, badge: '📖' },
    { id: 'mastery-five', name: 'Mastery Maker', desc: 'Mark 5 flashcards as Mastered', unlocked: false, badge: '⭐' },
    { id: 'streak-three', name: 'Persistent Learner', desc: 'Unlock a study streak of 3+ days', unlocked: false, badge: '🔥' },
    { id: 'quiz-expert', name: 'Perfect Recall', desc: 'Score at least 5 correct answers in Quiz Mode', unlocked: false, badge: '🏆' },
    { id: 'timed-survivor', name: 'Rapid Recall', desc: 'Complete a timed revision card before time runs out', unlocked: false, badge: '⏱️' },
    { id: 'category-creator', name: 'Librarian', desc: 'Create a custom category', unlocked: false, badge: '🏷️' },
    { id: 'all-unlocked', name: 'Omniscient', desc: 'Unlock all other achievements', unlocked: false, badge: '👑' }
  ]
};

// Default Bootstrap Mock Data
const DefaultCategories = [
  { id: 'cat_js', name: 'JavaScript', color: '#6366f1' },
  { id: 'cat_css', name: 'CSS Styles', color: '#06b6d4' },
  { id: 'cat_general', name: 'General Trivia', color: '#10b981' }
];

const DefaultFlashcards = [
  { id: 'card_1', question: 'What is a Closure in JavaScript?', answer: 'A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment).', categoryId: 'cat_js', mastered: false, correctCount: 0, incorrectCount: 0 },
  { id: 'card_2', question: 'What does CSS stand for?', answer: 'Cascading Style Sheets, used to describe the presentation and layout of a document written in HTML.', categoryId: 'cat_css', mastered: false, correctCount: 0, incorrectCount: 0 },
  { id: 'card_3', question: 'What is the speed of light?', answer: 'Approximately 299,792 kilometers per second (or 186,282 miles per second).', categoryId: 'cat_general', mastered: false, correctCount: 0, incorrectCount: 0 },
  { id: 'card_4', question: 'What is the purpose of LocalStorage?', answer: 'It allows developers to save key-value pairs in the web browser with no expiration date.', categoryId: 'cat_js', mastered: false, correctCount: 0, incorrectCount: 0 }
];

// Audio ticks for timed practice (synthesized Web Audio API)
const AudioTicks = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  tick() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  },
  complete() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
      osc.frequency.setValueAtTime(554.37, this.ctx.currentTime + 0.1); // C#5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.2); // E5
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch (e) {}
  }
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupUI();
  setupStudyTimer();
  updateStreak();
  renderAll();
});

// Load and Save states
function loadData() {
  const saved = localStorage.getItem("flashcard_learning_app_data");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      AppState.flashcards = parsed.flashcards || [];
      AppState.categories = parsed.categories || [];
      AppState.studyHistory = parsed.studyHistory || [];
      AppState.streak = parsed.streak || 0;
      AppState.lastStudyDate = parsed.lastStudyDate || null;
      AppState.theme = parsed.theme || 'dark';
      
      if (parsed.achievements) {
        AppState.achievements.forEach(ach => {
          const matching = parsed.achievements.find(a => a.id === ach.id);
          if (matching) ach.unlocked = matching.unlocked;
        });
      }
    } catch (e) {
      console.error("Failed to load flashcard state data", e);
    }
  } else {
    // Bootstrap defaults
    AppState.categories = [...DefaultCategories];
    AppState.flashcards = [...DefaultFlashcards];
    AppState.streak = 1;
    AppState.lastStudyDate = new Date().toISOString().split("T")[0];
    saveData();
  }
  
  // Set theme class
  document.body.className = AppState.theme === 'light' ? 'light-theme' : 'dark-theme';
}

function saveData() {
  const data = {
    flashcards: AppState.flashcards,
    categories: AppState.categories,
    studyHistory: AppState.studyHistory,
    streak: AppState.streak,
    lastStudyDate: AppState.lastStudyDate,
    theme: AppState.theme,
    achievements: AppState.achievements
  };
  localStorage.setItem("flashcard_learning_app_data", JSON.stringify(data));
}

// Track study minutes in background
function setupStudyTimer() {
  setInterval(() => {
    AppState.studyTimeToday++;
    
    // Log minutes to history every minute
    if (AppState.studyTimeToday % 60 === 0) {
      logStudyTime(1);
    }
  }, 1000);
}

function logStudyTime(minutes) {
  const todayStr = new Date().toISOString().split("T")[0];
  let log = AppState.studyHistory.find(h => h.date === todayStr);
  
  if (log) {
    log.minutes += minutes;
  } else {
    AppState.studyHistory.push({
      date: todayStr,
      minutes: minutes,
      reviews: 0
    });
  }
  saveData();
  renderDashboard();
}

function logStudyReview() {
  const todayStr = new Date().toISOString().split("T")[0];
  let log = AppState.studyHistory.find(h => h.date === todayStr);
  
  if (log) {
    log.reviews++;
  } else {
    AppState.studyHistory.push({
      date: todayStr,
      minutes: 0,
      reviews: 1
    });
  }
  
  // Mark review counts total for achievements
  const totalReviewed = AppState.studyHistory.reduce((sum, h) => sum + h.reviews, 0);
  checkAchievement('first-card');
  if (totalReviewed >= 10) {
    checkAchievement('review-ten');
  }
  
  saveData();
  renderDashboard();
}

// Streaks engine
function updateStreak() {
  const todayStr = new Date().toISOString().split("T")[0];
  if (!AppState.lastStudyDate) {
    AppState.streak = 0;
    return;
  }
  
  if (AppState.lastStudyDate === todayStr) {
    // Already studied today
    return;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  
  if (AppState.lastStudyDate === yesterdayStr) {
    // Increment streak
    AppState.streak++;
    AppState.lastStudyDate = todayStr;
    if (AppState.streak >= 3) {
      checkAchievement('streak-three');
    }
  } else {
    // Reset streak if missed a day
    AppState.streak = 1;
    AppState.lastStudyDate = todayStr;
  }
  saveData();
}

// Bind UI actions
function setupUI() {
  // Sidebar panel buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = btn.getAttribute("data-panel");
      switchPanel(panel);
    });
  });

  // Theme Toggler
  document.getElementById("btn-theme-toggle").addEventListener("click", toggleTheme);

  // Keyboard binds hook
  window.addEventListener("keydown", handleKeyboardShortcuts);

  // Deck IO actions
  document.getElementById("btn-export-deck").addEventListener("click", exportDeckJSON);
  document.getElementById("btn-import-deck").addEventListener("click", () => {
    document.getElementById("deck-file-input").click();
  });
  document.getElementById("deck-file-input").addEventListener("change", importDeckJSON);

  // Interactive 3D flip card triggers
  const flashcardEl = document.getElementById("interactive-flashcard");
  flashcardEl.addEventListener("click", toggleCardFlip);

  // Review panel control actions
  document.getElementById("btn-card-flip").addEventListener("click", toggleCardFlip);
  document.getElementById("btn-card-next").addEventListener("click", handleCardNext);
  document.getElementById("btn-card-prev").addEventListener("click", handleCardPrev);
  document.getElementById("btn-card-mastered").addEventListener("click", toggleCardMastered);
  document.getElementById("btn-shuffle-deck").addEventListener("click", handleShuffleDeck);
  document.getElementById("review-category-filter").addEventListener("change", handleReviewCategoryFilter);

  // Quiz grading triggers
  document.getElementById("btn-quiz-correct").addEventListener("click", () => handleQuizGrade(true));
  document.getElementById("btn-quiz-incorrect").addEventListener("click", () => handleQuizGrade(false));

  // Study Mode tabs switching
  document.getElementById("btn-mode-classic").addEventListener("click", () => switchStudyMode('classic'));
  document.getElementById("btn-mode-quiz").addEventListener("click", () => switchStudyMode('quiz'));
  document.getElementById("btn-mode-timed").addEventListener("click", () => switchStudyMode('timed'));

  // Category creators submits
  document.getElementById("category-form").addEventListener("submit", handleCategoryFormSubmit);

  // Card Builders form submits
  document.getElementById("flashcard-form").addEventListener("submit", handleFlashcardFormSubmit);
  document.getElementById("btn-cancel-builder-edit").addEventListener("click", handleCancelBuilderEdit);
  document.getElementById("registry-search-input").addEventListener("input", renderManageRegistry);
  document.getElementById("registry-category-filter").addEventListener("change", renderManageRegistry);

  // Dashboard shortcuts links
  document.getElementById("dash-btn-go-study").addEventListener("click", () => switchPanel("review"));
  document.getElementById("dash-btn-go-categories").addEventListener("click", () => switchPanel("categories"));
  document.getElementById("btn-start-quiz-qs").addEventListener("click", () => {
    switchPanel("review");
    switchStudyMode("quiz");
  });
  document.getElementById("btn-start-timed-qs").addEventListener("click", () => {
    switchPanel("review");
    switchStudyMode("timed");
  });
}

// Global Panels Navigation
function switchPanel(panelName) {
  // Navigation tabs styling toggler
  document.querySelectorAll(".nav-btn").forEach(btn => {
    if (btn.getAttribute("data-panel") === panelName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Panel pages content toggler
  document.querySelectorAll(".content-panel").forEach(panel => {
    if (panel.id === `panel-${panelName}`) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });

  // Set Top Bar heading title
  const titleEl = document.getElementById("panel-title-text");
  const subtitleEl = document.getElementById("panel-subtitle-text");
  
  const headers = {
    dashboard: ["Study Workspace Overview", "Overall revision stats, daily learning time, and active streaking."],
    review: ["Flashcard Study Deck", "Flip cards to reveal answers and toggle classic, quiz, or timed recall modes."],
    categories: ["Subject Categories", "Create, edit, and color-code categories to filter study decks."],
    manage: ["Manage Flashcards Registry", "Create new card prompts, edit descriptions, or search card text registries."],
    achievements: ["Achievements & Milestones", "Unlock consistency badges based on studied logs and mastered cards."],
    analytics: ["Study Analytics", "Performance feedback diagnostics on card recall accuracy and minutes spent."]
  };
  
  if (headers[panelName]) {
    titleEl.textContent = headers[panelName][0];
    subtitleEl.textContent = headers[panelName][1];
  }
  
  // Set active deck if review page opened
  if (panelName === 'review') {
    initializeReviewDeck();
  } else {
    // Clear timed interval if leaving review page
    clearTimedInterval();
  }
  
  // Trigger Canvas rendering when opening analytics
  if (panelName === 'analytics') {
    setTimeout(renderAnalyticsCharts, 50);
  }
}

// Light / Dark themes toggler
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
  
  // Redraw canvas charts if showing
  const analyticsPanel = document.getElementById("panel-analytics");
  if (analyticsPanel && analyticsPanel.classList.contains("active")) {
    renderAnalyticsCharts();
  }
}

// Keyboard shortcuts handlers
function handleKeyboardShortcuts(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
    return; // Ignore shortcuts inside forms typing
  }
  
  if (e.altKey) {
    switch (e.key.toLowerCase()) {
      case 'd': e.preventDefault(); switchPanel('dashboard'); break;
      case 'r': e.preventDefault(); switchPanel('review'); break;
      case 'f': e.preventDefault(); toggleCardFlip(); break;
      case 'm': e.preventDefault(); toggleCardMastered(); break;
      case 'n': e.preventDefault(); handleCardNext(); break;
      case 'p': e.preventDefault(); handleCardPrev(); break;
      case 'l': e.preventDefault(); toggleTheme(); break;
    }
  } else if (e.key === ' ' && AppState.activePanel === 'review') {
    e.preventDefault();
    toggleCardFlip();
  } else if (e.key === 'ArrowRight' && AppState.activePanel === 'review') {
    e.preventDefault();
    handleCardNext();
  } else if (e.key === 'ArrowLeft' && AppState.activePanel === 'review') {
    e.preventDefault();
    handleCardPrev();
  }
}

// Backup IO deck JSON
function exportDeckJSON() {
  const data = JSON.stringify({
    flashcards: AppState.flashcards,
    categories: AppState.categories
  }, null, 2);
  
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashcard_deck_backup.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importDeckJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (parsed.flashcards && parsed.categories) {
        AppState.flashcards = parsed.flashcards;
        AppState.categories = parsed.categories;
        saveData();
        renderAll();
        alert("Flashcard collection imported successfully!");
      } else {
        alert("Malformed JSON backup structure.");
      }
    } catch (err) {
      alert("Invalid JSON file uploaded.");
    }
  };
  reader.readAsText(file);
}

// -------------------------------------------------------------------
// STUDY DECK INTERACTIVE RECALL
// -------------------------------------------------------------------

function initializeReviewDeck() {
  const catFilter = document.getElementById("review-category-filter").value;
  
  // Filter cards by category
  AppState.reviewDeck = AppState.flashcards.filter(c => {
    return catFilter === 'all' || c.categoryId === catFilter;
  });
  
  AppState.reviewIndex = 0;
  
  // If timed mode, restart card countdown
  if (AppState.studyMode === 'timed') {
    startTimedRevision();
  }
  
  renderReviewCard();
}

function renderReviewCard() {
  const card = AppState.reviewDeck[AppState.reviewIndex];
  const cardEl = document.getElementById("interactive-flashcard");
  
  // Reset card rotation flip class
  cardEl.classList.remove("flipped");
  
  if (!card) {
    document.getElementById("card-front-question").textContent = "No cards available in this section.";
    document.getElementById("card-front-category").textContent = "N/A";
    document.getElementById("card-back-answer").textContent = "Create flashcards under this filter category first.";
    document.getElementById("card-back-category").textContent = "N/A";
    document.getElementById("deck-progress-numbers").textContent = "0 of 0 Cards";
    return;
  }
  
  // Find category name
  const cat = AppState.categories.find(c => c.id === card.categoryId);
  const catName = cat ? cat.name : "Uncategorized";
  const catColor = cat ? cat.color : "var(--color-primary)";
  
  // Write contents
  document.getElementById("card-front-question").textContent = card.question;
  document.getElementById("card-front-category").textContent = catName;
  document.getElementById("card-front-category").style.color = catColor;
  
  document.getElementById("card-back-answer").textContent = card.answer;
  document.getElementById("card-back-category").textContent = catName;
  document.getElementById("card-back-category").style.color = catColor;
  
  // Set progress text
  document.getElementById("deck-progress-numbers").textContent = `${AppState.reviewIndex + 1} of ${AppState.reviewDeck.length} Cards`;
  
  // Set mastered button state
  const masteredBtn = document.getElementById("btn-card-mastered");
  if (card.mastered) {
    masteredBtn.classList.add("mastered-active");
    masteredBtn.innerHTML = '<i class="fa-solid fa-star"></i>';
  } else {
    masteredBtn.classList.remove("mastered-active");
    masteredBtn.innerHTML = '<i class="fa-regular fa-star"></i>';
  }
}

function toggleCardFlip() {
  const cardEl = document.getElementById("interactive-flashcard");
  cardEl.classList.toggle("flipped");
  
  // Log a studied event on first flip of the card
  if (cardEl.classList.contains("flipped") && AppState.reviewDeck[AppState.reviewIndex]) {
    logStudyReview();
  }
}

function handleCardNext() {
  if (AppState.reviewDeck.length === 0) return;
  
  AppState.reviewIndex = (AppState.reviewIndex + 1) % AppState.reviewDeck.length;
  
  if (AppState.studyMode === 'timed') {
    startTimedRevision();
  }
  
  renderReviewCard();
}

function handleCardPrev() {
  if (AppState.reviewDeck.length === 0) return;
  
  AppState.reviewIndex = (AppState.reviewIndex - 1 + AppState.reviewDeck.length) % AppState.reviewDeck.length;
  
  if (AppState.studyMode === 'timed') {
    startTimedRevision();
  }
  
  renderReviewCard();
}

function toggleCardMastered() {
  const card = AppState.reviewDeck[AppState.reviewIndex];
  if (card) {
    card.mastered = !card.mastered;
    
    // Check achievements
    const totalMastered = AppState.flashcards.filter(c => c.mastered).length;
    if (totalMastered >= 5) {
      checkAchievement('mastery-five');
    }
    
    saveData();
    renderReviewCard();
    renderDashboard();
  }
}

function handleShuffleDeck() {
  if (AppState.reviewDeck.length === 0) return;
  
  // Fisher-Yates shuffle algorithm
  for (let i = AppState.reviewDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [AppState.reviewDeck[i], AppState.reviewDeck[j]] = [AppState.reviewDeck[j], AppState.reviewDeck[i]];
  }
  
  AppState.reviewIndex = 0;
  renderReviewCard();
}

function handleReviewCategoryFilter() {
  initializeReviewDeck();
}

// Switch review session study modes
function switchStudyMode(mode) {
  AppState.studyMode = mode;
  
  // Clear timed countdowns
  clearTimedInterval();
  document.getElementById("timed-ticker-box").style.display = "none";
  
  // Highlight buttons
  document.querySelectorAll(".study-mode-tab").forEach(tab => {
    if (tab.getAttribute("data-mode") === mode) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
  
  // Adjust footer actions rows
  const classicBar = document.getElementById("review-actions-classic");
  const quizBar = document.getElementById("review-actions-quiz");
  
  if (mode === 'classic') {
    classicBar.style.display = "flex";
    quizBar.style.display = "none";
  } else if (mode === 'quiz') {
    classicBar.style.display = "none";
    quizBar.style.display = "flex";
  } else if (mode === 'timed') {
    classicBar.style.display = "flex";
    quizBar.style.display = "none";
    document.getElementById("timed-ticker-box").style.display = "flex";
    startTimedRevision();
  }
}

// -------------------------------------------------------------------
// TIMED REVISION COUNTDOWNS
// -------------------------------------------------------------------

function startTimedRevision() {
  clearTimedInterval();
  AppState.timedSeconds = 12; // 12 seconds per flashcard
  document.getElementById("timed-seconds-value").textContent = AppState.timedSeconds;
  
  AppState.timedIntervalId = setInterval(() => {
    AppState.timedSeconds--;
    document.getElementById("timed-seconds-value").textContent = AppState.timedSeconds;
    
    // Play tick tick warning chime at 3s
    if (AppState.timedSeconds <= 3 && AppState.timedSeconds > 0) {
      AudioTicks.tick();
    }
    
    if (AppState.timedSeconds <= 0) {
      // Time runout completion chime
      AudioTicks.complete();
      
      // Auto flip or load next card
      const cardEl = document.getElementById("interactive-flashcard");
      if (!cardEl.classList.contains("flipped")) {
        toggleCardFlip();
      } else {
        handleCardNext();
      }
    }
  }, 1000);
}

function clearTimedInterval() {
  if (AppState.timedIntervalId) {
    clearInterval(AppState.timedIntervalId);
    AppState.timedIntervalId = null;
  }
}

// -------------------------------------------------------------------
// SELF-GRADED QUIZ ACTION
// -------------------------------------------------------------------

function handleQuizGrade(isCorrect) {
  const card = AppState.reviewDeck[AppState.reviewIndex];
  if (!card) return;
  
  if (isCorrect) {
    card.correctCount = (card.correctCount || 0) + 1;
    
    // Check quiz perfect recall badge
    const totalCorrect = AppState.flashcards.reduce((sum, c) => sum + (c.correctCount || 0), 0);
    if (totalCorrect >= 5) {
      checkAchievement('quiz-expert');
    }
  } else {
    card.incorrectCount = (card.incorrectCount || 0) + 1;
  }
  
  // If timed survivor milestone is met
  if (AppState.studyMode === 'timed' && AppState.timedSeconds > 0) {
    checkAchievement('timed-survivor');
  }
  
  saveData();
  
  // Transition to next flashcard
  handleCardNext();
}

// -------------------------------------------------------------------
// CATEGORY BUILDER MANAGEMENT (CRUD)
// -------------------------------------------------------------------

function handleCategoryFormSubmit(e) {
  e.preventDefault();
  
  const editId = document.getElementById("category-edit-id").value;
  const name = document.getElementById("category-name-input").value.trim();
  const color = document.getElementById("category-color-input").value;
  
  if (editId) {
    const cat = AppState.categories.find(c => c.id === editId);
    if (cat) {
      cat.name = name;
      cat.color = color;
    }
  } else {
    const newCat = {
      id: "cat_" + Date.now(),
      name,
      color
    };
    AppState.categories.push(newCat);
    checkAchievement('category-creator');
  }
  
  saveData();
  document.getElementById("category-form").reset();
  document.getElementById("category-edit-id").value = "";
  document.getElementById("category-modal-title").textContent = "Create Category";
  
  renderCategories();
  renderAllSelectDropdowns();
}

function editCategory(catId) {
  const cat = AppState.categories.find(c => c.id === catId);
  if (cat) {
    document.getElementById("category-edit-id").value = cat.id;
    document.getElementById("category-name-input").value = cat.name;
    document.getElementById("category-color-input").value = cat.color;
    document.getElementById("category-modal-title").textContent = "Edit Category";
  }
}

function deleteCategory(catId) {
  if (confirm("Deleting this category will set all associated cards to Uncategorized. Continue?")) {
    AppState.categories = AppState.categories.filter(c => c.id !== catId);
    
    // Reset cards belonging to this category
    AppState.flashcards.forEach(card => {
      if (card.categoryId === catId) {
        card.categoryId = 'cat_general';
      }
    });
    
    saveData();
    renderCategories();
    renderManageRegistry();
    renderAllSelectDropdowns();
  }
}

function renderCategories() {
  const container = document.getElementById("categories-list-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  AppState.categories.forEach(cat => {
    const card = document.createElement("div");
    card.className = "category-badge-card";
    card.style.borderTopColor = cat.color;
    
    // count cards in this category
    const cardCount = AppState.flashcards.filter(c => c.categoryId === cat.id).length;
    
    card.innerHTML = `
      <div class="cat-badge-title" style="color: ${cat.color};">${cat.name}</div>
      <div class="cat-badge-stats">${cardCount} Flashcards inside</div>
      <div class="cat-badge-actions">
        <button class="cat-btn-action btn-edit-cat" onclick="editCategory('${cat.id}')" title="Edit Category"><i class="fa-regular fa-pen-to-square"></i></button>
        ${cat.id !== 'cat_general' ? `<button class="cat-btn-action btn-del-cat" onclick="deleteCategory('${cat.id}')" title="Delete Category"><i class="fa-regular fa-trash-can"></i></button>` : ''}
      </div>
    `;
    
    container.appendChild(card);
  });
}

function renderAllSelectDropdowns() {
  const filterReview = document.getElementById("review-category-filter");
  const filterRegistry = document.getElementById("registry-category-filter");
  const selectBuilder = document.getElementById("card-category-select");
  
  if (!filterReview || !filterRegistry || !selectBuilder) return;
  
  // Clear
  filterReview.innerHTML = '<option value="all">All Categories</option>';
  filterRegistry.innerHTML = '<option value="all">All Categories</option>';
  selectBuilder.innerHTML = '';
  
  AppState.categories.forEach(cat => {
    const opt = `<option value="${cat.id}">${cat.name}</option>`;
    filterReview.insertAdjacentHTML('beforeend', opt);
    filterRegistry.insertAdjacentHTML('beforeend', opt);
    selectBuilder.insertAdjacentHTML('beforeend', opt);
  });
}

// -------------------------------------------------------------------
// FLASHCARDS REGISTRY & BUILDER (CRUD)
// -------------------------------------------------------------------

function handleFlashcardFormSubmit(e) {
  e.preventDefault();
  
  const editId = document.getElementById("flashcard-edit-id").value;
  const question = document.getElementById("card-question-input").value.trim();
  const answer = document.getElementById("card-answer-input").value.trim();
  const categoryId = document.getElementById("card-category-select").value;
  const mastered = document.getElementById("card-mastered-input").checked;
  
  if (editId) {
    const card = AppState.flashcards.find(c => c.id === editId);
    if (card) {
      card.question = question;
      card.answer = answer;
      card.categoryId = categoryId;
      card.mastered = mastered;
    }
  } else {
    const newCard = {
      id: "card_" + Date.now(),
      question,
      answer,
      categoryId,
      mastered,
      correctCount: 0,
      incorrectCount: 0
    };
    AppState.flashcards.push(newCard);
  }
  
  saveData();
  handleCancelBuilderEdit();
  renderManageRegistry();
  renderDashboard();
}

function editFlashcard(cardId) {
  const card = AppState.flashcards.find(c => c.id === cardId);
  if (card) {
    document.getElementById("flashcard-edit-id").value = card.id;
    document.getElementById("card-question-input").value = card.question;
    document.getElementById("card-answer-input").value = card.answer;
    document.getElementById("card-category-select").value = card.categoryId;
    document.getElementById("card-mastered-input").checked = card.mastered;
    
    document.getElementById("builder-title-text").textContent = "Edit Flashcard";
    document.getElementById("btn-cancel-builder-edit").style.display = "inline-flex";
  }
}

function deleteFlashcard(cardId) {
  if (confirm("Delete this flashcard?")) {
    AppState.flashcards = AppState.flashcards.filter(c => c.id !== cardId);
    saveData();
    renderManageRegistry();
    renderDashboard();
  }
}

function handleCancelBuilderEdit() {
  document.getElementById("flashcard-form").reset();
  document.getElementById("flashcard-edit-id").value = "";
  document.getElementById("builder-title-text").textContent = "Create Flashcard";
  document.getElementById("btn-cancel-builder-edit").style.display = "none";
}

function renderManageRegistry() {
  const search = document.getElementById("registry-search-input").value.toLowerCase();
  const catFilter = document.getElementById("registry-category-filter").value;
  const listBody = document.getElementById("registry-cards-list");
  
  if (!listBody) return;
  
  listBody.innerHTML = "";
  
  const filtered = AppState.flashcards.filter(card => {
    const matchesSearch = card.question.toLowerCase().includes(search) || card.answer.toLowerCase().includes(search);
    const matchesCat = catFilter === 'all' || card.categoryId === catFilter;
    return matchesSearch && matchesCat;
  });
  
  if (filtered.length === 0) {
    listBody.innerHTML = `<tr><td colspan="4" class="empty-message-text">No matching cards found.</td></tr>`;
    return;
  }
  
  filtered.forEach(card => {
    const cat = AppState.categories.find(c => c.id === card.categoryId);
    const catName = cat ? cat.name : "Uncategorized";
    const catColor = cat ? cat.color : "var(--color-primary)";
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="font-weight: 500;">${card.question}</td>
      <td><span style="color: ${catColor}; font-weight: 600;">${catName}</span></td>
      <td><span class="${card.mastered ? 'mastery-badge' : 'learning-badge'}">${card.mastered ? 'Mastered' : 'Studying'}</span></td>
      <td>
        <button class="cat-btn-action" onclick="editFlashcard('${card.id}')" title="Edit Card"><i class="fa-regular fa-pen-to-square"></i></button>
        <button class="cat-btn-action" style="color: var(--color-danger);" onclick="deleteFlashcard('${card.id}')" title="Delete Card"><i class="fa-regular fa-trash-can"></i></button>
      </td>
    `;
    
    listBody.appendChild(row);
  });
}

// -------------------------------------------------------------------
// ACHIEVEMENTS TRACKER
// -------------------------------------------------------------------

function checkAchievement(achId) {
  const ach = AppState.achievements.find(a => a.id === achId);
  if (ach && !ach.unlocked) {
    ach.unlocked = true;
    saveData();
    renderAchievements();
    
    // Check all unlocked
    if (achId !== 'all-unlocked') {
      const unlockedCount = AppState.achievements.filter(a => a.id !== 'all-unlocked' && a.unlocked).length;
      if (unlockedCount === 7) {
        checkAchievement('all-unlocked');
      }
    }
  }
}

function renderAchievements() {
  const container = document.getElementById("achievements-list-grid");
  const progressLabel = document.getElementById("achievements-count-label");
  const progressBar = document.getElementById("achievements-progress-bar");
  
  if (!container) return;
  container.innerHTML = "";
  
  const unlockedCount = AppState.achievements.filter(a => a.unlocked).length;
  const pct = Math.round((unlockedCount / AppState.achievements.length) * 100);
  
  if (progressLabel) progressLabel.textContent = `${unlockedCount} / ${AppState.achievements.length} Unlocked`;
  if (progressBar) progressBar.style.width = `${pct}%`;
  
  AppState.achievements.forEach(ach => {
    const card = document.createElement("div");
    card.className = `achievement-card ${ach.unlocked ? 'unlocked' : ''}`;
    
    card.innerHTML = `
      <div class="ach-icon-badge">${ach.badge}</div>
      <div class="ach-details">
        <div class="ach-name">${ach.name}</div>
        <div class="ach-desc">${ach.desc}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

// -------------------------------------------------------------------
// CENTRALIZED DASHBOARD UPDATE
// -------------------------------------------------------------------

function renderDashboard() {
  const total = AppState.flashcards.length;
  const mastered = AppState.flashcards.filter(c => c.mastered).length;
  const masteryPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  
  // Header widgets
  document.getElementById("study-streak-val").textContent = `${AppState.streak} Days`;
  document.getElementById("global-mastery-percent").textContent = `${masteryPct}%`;
  
  // Dashboard counters
  document.getElementById("stats-total-cards").textContent = total;
  document.getElementById("stats-mastered-cards").textContent = mastered;
  
  const todayStr = new Date().toISOString().split("T")[0];
  const history = AppState.studyHistory.find(h => h.date === todayStr);
  const reviewedToday = history ? history.reviews : 0;
  const minutesToday = history ? history.minutes : 0;
  
  document.getElementById("stats-cards-studied").textContent = reviewedToday;
  document.getElementById("stats-study-minutes").textContent = `${minutesToday}m`;
  
  // Dashboard Categories side list
  const catList = document.getElementById("dash-categories-container");
  if (catList) {
    catList.innerHTML = "";
    if (AppState.categories.length === 0) {
      catList.innerHTML = `<p class="empty-message-text">No active categories.</p>`;
    } else {
      AppState.categories.slice(0, 4).forEach(cat => {
        const count = AppState.flashcards.filter(c => c.categoryId === cat.id).length;
        const row = document.createElement("div");
        row.className = "dash-cat-row";
        row.style.borderLeftColor = cat.color;
        row.innerHTML = `
          <span class="dash-cat-name" style="color: ${cat.color};">${cat.name}</span>
          <span class="dash-cat-count">${count} Cards</span>
        `;
        catList.appendChild(row);
      });
    }
  }
}

// -------------------------------------------------------------------
// INTERACTIVE NATIVE CANVAS CHARTS ENGINE
// -------------------------------------------------------------------

function renderAnalyticsCharts() {
  // Chart 1: Donut Mastery Rate
  drawMasteryRateChart();
  
  // Chart 2: Category distribution bar chart
  drawCategoryBarChart();
  
  // Chart 3: Study time trends line graph
  drawStudyTimeLineChart();
  
  // Chart 4: Quiz diagnostic pie chart
  drawQuizAccuracyPieChart();
}

function getThemeColors() {
  const isLight = document.body.classList.contains("light-theme");
  return {
    text: isLight ? '#475569' : '#9ca3af',
    grid: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
    primary: isLight ? '#4f46e5' : '#6366f1',
    secondary: isLight ? '#0891b2' : '#06b6d4',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b'
  };
}

function drawMasteryRateChart() {
  const canvas = document.getElementById("chart-mastery-percentage");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = getThemeColors();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const total = AppState.flashcards.length;
  const mastered = AppState.flashcards.filter(c => c.mastered).length;
  const studying = total - mastered;
  
  if (total === 0) {
    ctx.fillStyle = colors.text;
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText("Create flashcards to visualize mastery charts.", 70, canvas.height / 2);
    return;
  }
  
  // Donut chart angles
  const masteredAngle = (2 * Math.PI * mastered) / total;
  const studyingAngle = (2 * Math.PI * studying) / total;
  
  const centerX = canvas.width / 2.7;
  const centerY = canvas.height / 2;
  const outerRadius = 80;
  const innerRadius = 50;
  
  // Draw Mastered Arc
  ctx.fillStyle = colors.success;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, -Math.PI / 2, -Math.PI / 2 + masteredAngle);
  ctx.lineTo(centerX + innerRadius * Math.cos(-Math.PI / 2 + masteredAngle), centerY + innerRadius * Math.sin(-Math.PI / 2 + masteredAngle));
  ctx.arc(centerX, centerY, innerRadius, -Math.PI / 2 + masteredAngle, -Math.PI / 2, true);
  ctx.closePath();
  ctx.fill();
  
  // Draw Studying Arc
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, -Math.PI / 2 + masteredAngle, -Math.PI / 2 + masteredAngle + studyingAngle);
  ctx.lineTo(centerX + innerRadius * Math.cos(-Math.PI / 2 + masteredAngle + studyingAngle), centerY + innerRadius * Math.sin(-Math.PI / 2 + masteredAngle + studyingAngle));
  ctx.arc(centerX, centerY, innerRadius, -Math.PI / 2 + masteredAngle + studyingAngle, -Math.PI / 2 + masteredAngle, true);
  ctx.closePath();
  ctx.fill();
  
  // Write center percentage
  ctx.fillStyle = colors.text;
  ctx.font = "bold 18px Outfit, sans-serif";
  ctx.textAlign = "center";
  const masteryPct = Math.round((mastered / total) * 100);
  ctx.fillText(`${masteryPct}%`, centerX, centerY + 6);
  
  // Legend
  ctx.textAlign = "left";
  ctx.font = "11px Inter, sans-serif";
  const legendX = canvas.width - 130;
  
  ctx.fillStyle = colors.success;
  ctx.fillRect(legendX, 80, 12, 12);
  ctx.fillStyle = colors.text;
  ctx.fillText(`Mastered (${mastered})`, legendX + 20, 90);
  
  ctx.fillStyle = colors.primary;
  ctx.fillRect(legendX, 115, 12, 12);
  ctx.fillStyle = colors.text;
  ctx.fillText(`Studying (${studying})`, legendX + 20, 125);
}

function drawCategoryBarChart() {
  const canvas = document.getElementById("chart-category-counts");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = getThemeColors();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const labels = [];
  const counts = [];
  const barColors = [];
  
  AppState.categories.forEach(cat => {
    const size = AppState.flashcards.filter(c => c.categoryId === cat.id).length;
    if (size > 0) {
      labels.push(cat.name);
      counts.push(size);
      barColors.push(cat.color);
    }
  });
  
  if (counts.length === 0) {
    ctx.fillStyle = colors.text;
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText("No cards created in any category yet.", 80, canvas.height / 2);
    return;
  }
  
  const maxVal = Math.max(...counts, 5);
  
  const paddingLeft = 40;
  const paddingBottom = 30;
  const chartWidth = canvas.width - paddingLeft - 20;
  const chartHeight = canvas.height - paddingBottom - 20;
  
  // Y-axis grid
  ctx.strokeStyle = colors.grid;
  ctx.fillStyle = colors.text;
  ctx.font = "10px Inter, sans-serif";
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
  const barWidth = 40;
  const gap = (chartWidth - barWidth * counts.length) / (counts.length + 1);
  
  labels.forEach((lbl, idx) => {
    const val = counts[idx];
    const x = paddingLeft + gap + (barWidth + gap) * idx;
    const y = 20 + chartHeight * (1 - val / maxVal);
    const h = chartHeight * (val / maxVal);
    
    ctx.fillStyle = barColors[idx];
    ctx.fillRect(x, y, barWidth, h);
    
    // label text truncated
    ctx.fillStyle = colors.text;
    const cleanLabel = lbl.length > 8 ? lbl.substring(0, 6) + ".." : lbl;
    ctx.fillText(cleanLabel, x - 2, canvas.height - 10);
  });
}

function drawStudyTimeLineChart() {
  const canvas = document.getElementById("chart-study-time-trends");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = getThemeColors();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Last 7 days
  const labels = [];
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    labels.push(d.toLocaleDateString([], { weekday: 'short' }));
    
    const hLog = AppState.studyHistory.find(h => h.date === dateStr);
    data.push(hLog ? hLog.minutes : 0);
  }
  
  const maxVal = Math.max(...data, 10); // min scale is 10 minutes
  
  const paddingLeft = 40;
  const paddingBottom = 30;
  const chartWidth = canvas.width - paddingLeft - 20;
  const chartHeight = canvas.height - paddingBottom - 20;
  
  // Grid Lines
  ctx.strokeStyle = colors.grid;
  ctx.fillStyle = colors.text;
  ctx.font = "10px Inter, sans-serif";
  for (let i = 0; i <= 4; i++) {
    const y = 20 + (chartHeight / 4) * i;
    const value = Math.round(maxVal - (maxVal / 4) * i);
    ctx.fillText(value + "m", 12, y + 4);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
  }
  
  // X labels
  const stepX = chartWidth / 6;
  labels.forEach((lbl, idx) => {
    const x = paddingLeft + stepX * idx;
    ctx.fillText(lbl, x - 8, canvas.height - 10);
  });
  
  // Plot line
  const points = data.map((val, idx) => {
    return {
      x: paddingLeft + stepX * idx,
      y: 20 + chartHeight * (1 - val / maxVal)
    };
  });
  
  // Area fill
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, colors.primary + "22");
  grad.addColorStop(1, colors.primary + "00");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(points[0].x, canvas.height - paddingBottom);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, canvas.height - paddingBottom);
  ctx.closePath();
  ctx.fill();
  
  // Draw stroke
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
}

function drawQuizAccuracyPieChart() {
  const canvas = document.getElementById("chart-quiz-accuracy");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = getThemeColors();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Aggregate total quiz corrects vs incorrects
  let corrects = 0;
  let incorrects = 0;
  AppState.flashcards.forEach(c => {
    corrects += c.correctCount || 0;
    incorrects += c.incorrectCount || 0;
  });
  
  const total = corrects + incorrects;
  if (total === 0) {
    ctx.fillStyle = colors.text;
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText("Test your recall in Quiz Mode to build accuracy charts.", 40, canvas.height / 2);
    return;
  }
  
  const correctAngle = (2 * Math.PI * corrects) / total;
  const incorrectAngle = (2 * Math.PI * incorrects) / total;
  
  const centerX = canvas.width / 2.7;
  const centerY = canvas.height / 2;
  const radius = 80;
  
  // Draw correct slice
  ctx.fillStyle = colors.success;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + correctAngle);
  ctx.closePath();
  ctx.fill();
  
  // Draw incorrect slice
  ctx.fillStyle = colors.danger;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, -Math.PI / 2 + correctAngle, -Math.PI / 2 + correctAngle + incorrectAngle);
  ctx.closePath();
  ctx.fill();
  
  // Legend
  const legendX = canvas.width - 130;
  ctx.font = "11px Inter, sans-serif";
  
  ctx.fillStyle = colors.success;
  ctx.fillRect(legendX, 85, 12, 12);
  ctx.fillStyle = colors.text;
  const correctPct = Math.round((corrects / total) * 100);
  ctx.fillText(`Correct (${correctPct}%)`, legendX + 20, 95);
  
  ctx.fillStyle = colors.danger;
  ctx.fillRect(legendX, 120, 12, 12);
  ctx.fillStyle = colors.text;
  const incorrectPct = Math.round((incorrects / total) * 100);
  ctx.fillText(`Incorrect (${incorrectPct}%)`, legendX + 20, 130);
}

// -------------------------------------------------------------------
// BOOTSTRAP RENDER UTILITIES
// -------------------------------------------------------------------

function renderAll() {
  renderCategories();
  renderManageRegistry();
  renderAllSelectDropdowns();
  renderAchievements();
  renderDashboard();
}
