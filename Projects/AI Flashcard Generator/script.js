/**
 * FlashAI - AI Flashcard Generator
 * Core Frontend Javascript
 */

// 1. Initial Deck Presets
const PRESETS_DECKS = {
  js_basics: {
    id: "js_basics",
    name: "JavaScript Core Basics",
    cards: [
      {
        id: "js_c1",
        front: "What is a closure in JavaScript?",
        back: "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). It gives an inner function access to the outer function's scope even after the outer function has returned.",
        status: "todo" // todo, mastered, review
      },
      {
        id: "js_c2",
        front: "How does the 'this' keyword behave inside arrow functions?",
        back: "Arrow functions do not have their own 'this' context. Instead, they capture the 'this' value of the enclosing lexical context in which they were defined, making them ideal for callbacks.",
        status: "todo"
      },
      {
        id: "js_c3",
        front: "What is variable hoisting in JS?",
        back: "Hoisting is a JS mechanism where variables and function declarations are moved to the top of their containing scope before code execution. Note that only declarations are hoisted, not initializations.",
        status: "todo"
      }
    ]
  },
  css_layouts: {
    id: "css_layouts",
    name: "CSS Flexbox & Grids Layouts",
    cards: [
      {
        id: "css_c1",
        front: "What is the difference between CSS Flexbox and CSS Grid?",
        back: "CSS Flexbox is a one-dimensional layout model (designed for single rows or columns), while CSS Grid is a two-dimensional layout model (designed to lay out items in both columns and rows simultaneously).",
        status: "todo"
      },
      {
        id: "css_c2",
        front: "Explain the box-sizing: border-box property in CSS.",
        back: "By default, padding and borders are added to width/height coordinates. Applying 'border-box' tells the browser to include padding and border inside the specified width and height boundaries.",
        status: "todo"
      }
    ]
  },
  web_apis: {
    id: "web_apis",
    name: "Web APIs & Asynchronous requests",
    cards: [
      {
        id: "api_c1",
        front: "What does the DOM Fetch API return?",
        back: "The Fetch API returns a Promise that resolves to the Response object representing the response to the request. You must chain it with methods like .json() or .text() to parse the body payload.",
        status: "todo"
      }
    ]
  }
};

// 2. Demo Notes for parser
const DEMO_NOTES = `Syllabus notes for Web Dev Review:
API: Application Programming Interface - a software intermediary that allows two applications to talk to each other.
HTTP GET: request method used to retrieve data from a server, making it safe and idempotent.
HTTP POST: request method used to send data payloads to a server to create/update resources.
DOM: Document Object Model - a programming interface for web documents that models page structure as a nodes tree.
SPA: Single Page Application - web app that loads a single HTML page and dynamically updates that page as the user interacts.`;

// 3. State Management
let decksDatabase = {};
let currentActiveDeckId = "";
let activeDeckCards = []; // array of cards in current session
let currentCardIndex = 0;
let isFlipped = false;
let studyStreak = 0;
let lastStudyDate = "";

// 4. DOM Cache
const deckListNavEl = document.getElementById("deck-list-nav");
const selectTargetDeckEl = document.getElementById("select-target-deck");
const selectCreatorDeckEl = document.getElementById("select-creator-deck");

// Telemetry Stats
const valMasteryEl = document.getElementById("val-mastery");
const masteryIndicatorEl = document.getElementById("mastery-indicator");
const valMasteredCountEl = document.getElementById("val-mastered-count");
const valReviewCountEl = document.getElementById("val-review-count");
const valStreakEl = document.getElementById("val-streak");

// Flashcard Stage
const lblActiveDeckNameEl = document.getElementById("lbl-active-deck-name");
const lblCardCounterEl = document.getElementById("lbl-card-counter");
const valProgressBarEl = document.getElementById("val-progress-bar");
const cardWrapperEl = document.getElementById("card-wrapper");
const lblFrontTextEl = document.getElementById("lbl-front-text");
const lblBackTextEl = document.getElementById("lbl-back-text");
const masteryButtonsBarEl = document.getElementById("mastery-buttons-bar");

// Controls
const btnPrevCardEl = document.getElementById("btn-prev-card");
const btnShuffleDeckEl = document.getElementById("btn-shuffle-deck");
const btnNextCardEl = document.getElementById("btn-next-card");
const btnMarkReviewEl = document.getElementById("btn-mark-review");
const btnMarkMasteredEl = document.getElementById("btn-mark-mastered");

// Parser
const btnLoadDemoNotesEl = document.getElementById("btn-load-demo-notes");
const txtNotesInputEl = document.getElementById("txt-notes-input");
const btnParseNotesEl = document.getElementById("btn-parse-notes");

// Creator Modal
const creatorModalEl = document.getElementById("creator-modal");
const btnOpenCreatorEl = document.getElementById("btn-open-creator");
const btnCloseCreatorEl = document.getElementById("btn-close-creator");
const btnCancelCreatorEl = document.getElementById("btn-cancel-creator");
const creatorFormEl = document.getElementById("creator-form");
const txtCardFrontEl = document.getElementById("txt-card-front");
const txtCardBackEl = document.getElementById("txt-card-back");

// Reset buttons
const btnResetStorageEl = document.getElementById("btn-reset-storage");

// 5. Initializer
window.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  renderDecksNavList();
  
  // Auto select first deck on load
  const deckKeys = Object.keys(decksDatabase);
  if (deckKeys.length > 0) {
    selectDeckCategory(deckKeys[0]);
  }
});

// 6. Data syncs
function loadData() {
  const stored = localStorage.getItem("flashai_decks");
  if (stored) {
    try {
      decksDatabase = JSON.parse(stored);
    } catch (e) {
      console.error(e);
      decksDatabase = {};
    }
  }

  if (Object.keys(decksDatabase).length === 0) {
    decksDatabase = { ...PRESETS_DECKS };
    saveDecks();
  }

  studyStreak = parseInt(localStorage.getItem("flashai_streak")) || 0;
  lastStudyDate = localStorage.getItem("flashai_last_date") || "";

  calculateStreak();
  updateTelemetryUI();
}

function saveDecks() {
  localStorage.setItem("flashai_decks", JSON.stringify(decksDatabase));
}

function calculateStreak() {
  if (!lastStudyDate) {
    studyStreak = 0;
    return;
  }

  const today = new Date();
  const lastDate = new Date(lastStudyDate);
  const timeDiff = today.getTime() - lastDate.getTime();
  const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

  if (dayDiff > 1) {
    studyStreak = 0;
    localStorage.setItem("flashai_streak", 0);
  }
}

function updateTelemetryUI() {
  let totalCards = 0;
  let masteredCount = 0;
  let reviewCount = 0;

  Object.values(decksDatabase).forEach(deck => {
    deck.cards.forEach(card => {
      totalCards++;
      if (card.status === "mastered") masteredCount++;
      if (card.status === "review") reviewCount++;
    });
  });

  valMasteredCountEl.textContent = masteredCount;
  valReviewCountEl.textContent = reviewCount;
  valStreakEl.textContent = `${studyStreak} day${studyStreak === 1 ? '' : 's'}`;

  // Mastery percentage: Mastered / Flipped/Graded total
  const gradedTotal = masteredCount + reviewCount;
  const percentage = gradedTotal > 0 ? Math.round((masteredCount / gradedTotal) * 100) : 0;
  
  animateMasteryGauge(percentage);
}

function animateMasteryGauge(target) {
  let val = 0;
  const maxOffset = 276;

  if (window.masteryGaugeInterval) clearInterval(window.masteryGaugeInterval);

  window.masteryGaugeInterval = setInterval(() => {
    if (val < target) val++;
    else if (val > target) val--;
    else clearInterval(window.masteryGaugeInterval);

    valMasteryEl.textContent = `${val}%`;
    const offset = maxOffset - (maxOffset * val) / 100;
    masteryIndicatorEl.style.strokeDashoffset = offset;

    // Color indicators
    if (val >= 80) masteryIndicatorEl.style.stroke = "var(--clr-success)";
    else if (val >= 50) masteryIndicatorEl.style.stroke = "var(--clr-accent)";
    else masteryIndicatorEl.style.stroke = "var(--clr-warning)";
  }, 12);
}

// 7. Navigation Decks list lists
function setupEventListeners() {
  // Creator show / hide
  btnOpenCreatorEl.addEventListener("click", () => {
    populateCreatorDecksSelect();
    creatorModalEl.classList.remove("hidden");
  });

  const hideCreator = () => {
    creatorModalEl.classList.add("hidden");
    creatorFormEl.reset();
  };

  btnCloseCreatorEl.addEventListener("click", hideCreator);
  btnCancelCreatorEl.addEventListener("click", hideCreator);

  // Manual Card Creation Submit
  creatorFormEl.addEventListener("submit", (e) => {
    e.preventDefault();

    const targetDeckId = selectCreatorDeckEl.value;
    const front = txtCardFrontEl.value.trim();
    const back = txtCardBackEl.value.trim();

    if (!targetDeckId || !front || !back) {
      alert("Please populate all required fields.");
      return;
    }

    const newCard = {
      id: "card_" + Date.now(),
      front,
      back,
      status: "todo"
    };

    decksDatabase[targetDeckId].cards.push(newCard);
    saveDecks();
    hideCreator();
    
    // Refresh UI
    renderDecksNavList();
    updateTelemetryUI();
    if (currentActiveDeckId === targetDeckId) {
      // Re-load deck to include new card
      selectDeckCategory(targetDeckId);
    }

    alert("Card added successfully!");
  });

  // Card Flip Click Event
  cardWrapperEl.addEventListener("click", flipActiveCard);
  cardWrapperEl.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      flipActiveCard();
    }
  });

  // Navigation
  btnPrevCardEl.addEventListener("click", navigatePrevCard);
  btnNextCardEl.addEventListener("click", navigateNextCard);
  btnShuffleDeckEl.addEventListener("click", shuffleActiveDeck);

  // Keyboard navigation shortcuts
  window.addEventListener("keydown", (e) => {
    if (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT") {
      return; // Skip if typing in forms
    }
    
    if (e.key === "ArrowLeft") navigatePrevCard();
    if (e.key === "ArrowRight") navigateNextCard();
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "f") {
      e.preventDefault();
      flipActiveCard();
    }
    if (e.key === "m" || e.key === "1") handleMasteryAction("mastered");
    if (e.key === "r" || e.key === "2") handleMasteryAction("review");
  });

  // Mastery Buttons
  btnMarkMasteredEl.addEventListener("click", () => handleMasteryAction("mastered"));
  btnMarkReviewEl.addEventListener("click", () => handleMasteryAction("review"));

  // New deck directory click
  document.getElementById("btn-new-deck").addEventListener("click", () => {
    const name = prompt("Enter new Deck Name:");
    if (name && name.trim()) {
      const cleanName = name.trim();
      const id = "deck_" + Date.now();
      
      decksDatabase[id] = {
        id,
        name: cleanName,
        cards: []
      };

      saveDecks();
      renderDecksNavList();
      selectDeckCategory(id);
    }
  });

  // Notes Loader Demo Click
  btnLoadDemoNotesEl.addEventListener("click", () => {
    txtNotesInputEl.value = DEMO_NOTES;
  });

  // Notes Parser Generation trigger
  btnParseNotesEl.addEventListener("click", handleParseNotesSubmit);

  // Reset database Click
  btnResetStorageEl.addEventListener("click", () => {
    if (confirm("Reset study records and decks to presets defaults? This wipes custom decks.")) {
      localStorage.clear();
      decksDatabase = { ...PRESETS_DECKS };
      saveDecks();
      studyStreak = 0;
      lastStudyDate = "";
      
      updateTelemetryUI();
      renderDecksNavList();
      selectDeckCategory("js_basics");
    }
  });
}

function renderDecksNavList() {
  deckListNavEl.innerHTML = "";
  selectTargetDeckEl.innerHTML = "";

  const deckKeys = Object.keys(decksDatabase);
  if (deckKeys.length === 0) {
    deckListNavEl.innerHTML = `<p class="text-muted text-xs text-center">No study decks directories. Create one above!</p>`;
    return;
  }

  deckKeys.forEach(key => {
    const deck = decksDatabase[key];
    const count = deck.cards.length;

    // Append sidebar selectors
    const btn = document.createElement("div");
    btn.className = `deck-item ${currentActiveDeckId === key ? 'active' : ''}`;
    btn.innerHTML = `
      <span class="deck-name">${deck.name}</span>
      <span class="deck-card-count">${count} cards</span>
    `;

    btn.addEventListener("click", () => {
      selectDeckCategory(key);
    });

    deckListNavEl.appendChild(btn);

    // Append dropdown targets in notes parser
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = deck.name;
    selectTargetDeckEl.appendChild(opt);
  });
}

function populateCreatorDecksSelect() {
  selectCreatorDeckEl.innerHTML = "";
  Object.values(decksDatabase).forEach(deck => {
    const opt = document.createElement("option");
    opt.value = deck.id;
    opt.textContent = deck.name;
    selectCreatorDeckEl.appendChild(opt);
  });
}

// Select active deck
function selectDeckCategory(deckId) {
  currentActiveDeckId = deckId;
  const deck = decksDatabase[deckId];
  
  if (!deck) return;

  // Set highlights
  document.querySelectorAll(".deck-item").forEach((item, index) => {
    const key = Object.keys(decksDatabase)[index];
    if (key === deckId) item.classList.add("active");
    else item.classList.remove("active");
  });

  lblActiveDeckNameEl.textContent = deck.name;
  
  // Clone cards list to study order
  activeDeckCards = [...deck.cards];
  currentCardIndex = 0;
  
  loadCardIndex(0);
}

// 8. 3D card flipping arena controls
function loadCardIndex(index) {
  isFlipped = false;
  cardWrapperEl.classList.remove("flipped");
  
  // Hide mastery rating bar until flipped
  masteryButtonsBarEl.classList.add("hidden");

  const total = activeDeckCards.length;
  if (total === 0) {
    lblCardCounterEl.textContent = "0 of 0 Cards";
    valProgressBarEl.style.width = "0%";
    lblFrontTextEl.textContent = "This study deck is empty.";
    lblBackTextEl.textContent = "Add individual cards manually or load raw notes text in the AI Note Parser.";
    return;
  }

  currentCardIndex = index;
  lblCardCounterEl.textContent = `${index + 1} of ${total} Card${total === 1 ? '' : 's'}`;
  
  // Update progress bar
  const progressPercent = Math.round(((index + 1) / total) * 100);
  valProgressBarEl.style.width = `${progressPercent}%`;

  const card = activeDeckCards[index];
  lblFrontTextEl.textContent = card.front;
  lblBackTextEl.textContent = card.back;
}

function flipActiveCard() {
  if (activeDeckCards.length === 0) return;

  isFlipped = !isFlipped;
  if (isFlipped) {
    cardWrapperEl.classList.add("flipped");
    masteryButtonsBarEl.classList.remove("hidden"); // Show rating choice buttons
  } else {
    cardWrapperEl.classList.remove("flipped");
    masteryButtonsBarEl.classList.add("hidden");
  }
}

// Mastered / Review Action
function handleMasteryAction(status) {
  if (activeDeckCards.length === 0) return;

  const card = activeDeckCards[currentCardIndex];
  
  // Find card index in master database
  const masterDeck = decksDatabase[currentActiveDeckId];
  if (masterDeck) {
    const masterCard = masterDeck.cards.find(c => c.id === card.id);
    if (masterCard) {
      masterCard.status = status;
      card.status = status; // sync active order
      saveDecks();
    }
  }

  // Update telemetry dashboard
  updateTelemetryUI();

  // Streak update trigger
  const todayStr = new Date().toDateString();
  if (lastStudyDate !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastStudyDate === yesterday.toDateString()) {
      studyStreak++;
    } else {
      studyStreak = 1;
    }

    lastStudyDate = todayStr;
    localStorage.setItem("flashai_streak", studyStreak);
    localStorage.setItem("flashai_last_date", lastStudyDate);
    updateTelemetryUI();
  }

  // Automatically advance to next card after short delay
  setTimeout(() => {
    if (currentCardIndex < activeDeckCards.length - 1) {
      navigateNextCard();
    } else {
      // Loop back or show completion
      alert("Deck study loop completed! You have finished reviewing all cards.");
      loadCardIndex(0);
    }
  }, 300);
}

function navigatePrevCard() {
  if (activeDeckCards.length === 0) return;
  
  let prevIndex = currentCardIndex - 1;
  if (prevIndex < 0) {
    prevIndex = activeDeckCards.length - 1; // Wrap around
  }
  loadCardIndex(prevIndex);
}

function navigateNextCard() {
  if (activeDeckCards.length === 0) return;

  let nextIndex = currentCardIndex + 1;
  if (nextIndex >= activeDeckCards.length) {
    nextIndex = 0; // Wrap around
  }
  loadCardIndex(nextIndex);
}

function shuffleActiveDeck() {
  const total = activeDeckCards.length;
  if (total <= 1) return;

  // Fisher-Yates shuffle algorithm
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [activeDeckCards[i], activeDeckCards[j]] = [activeDeckCards[j], activeDeckCards[i]];
  }

  currentCardIndex = 0;
  loadCardIndex(0);
}

// 9. Raw notes parser generator
function handleParseNotesSubmit() {
  const targetDeckId = selectTargetDeckEl.value;
  const notesText = txtNotesInputEl.value.trim();

  if (!targetDeckId) {
    alert("Please select a target deck category.");
    return;
  }
  if (!notesText) {
    alert("Please load demo notes or paste study summaries to parse.");
    return;
  }

  const lines = notesText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  let cardsCreatedCount = 0;

  lines.forEach(line => {
    let front = "";
    let back = "";

    // Parse delimiters
    if (/^(.*?)\s*[:]\s*(.*)$/.test(line)) {
      const match = line.match(/^(.*?)\s*[:]\s*(.*)$/);
      front = match[1];
      back = match[2];
    } else if (/^(.*?)\s*[-]{2}\s*(.*)$/.test(line)) {
      const match = line.match(/^(.*?)\s*[-]{2}\s*(.*)$/);
      front = match[1];
      back = match[2];
    } else if (/^(.*?)\s*[-]\s*(.*)$/.test(line)) {
      const match = line.match(/^(.*?)\s*[-]\s*(.*)$/);
      front = match[1];
      back = match[2];
    } else if (/^(.*\?)\s*(.*)$/.test(line)) {
      const match = line.match(/^(.*\?)\s*(.*)$/);
      front = match[1];
      back = match[2];
    } else {
      // Fallback: use first 25 chars as front, remainder as back
      if (line.length > 25) {
        front = line.substring(0, 25) + "...";
        back = line;
      } else {
        front = "Key Concept";
        back = line;
      }
    }

    if (front && back && front.length > 1 && back.length > 1) {
      const newCard = {
        id: "card_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        front: front.trim(),
        back: back.trim(),
        status: "todo"
      };

      decksDatabase[targetDeckId].cards.push(newCard);
      cardsCreatedCount++;
    }
  });

  if (cardsCreatedCount > 0) {
    saveDecks();
    txtNotesInputEl.value = "";
    
    // Refresh sidebar counts & metrics
    renderDecksNavList();
    updateTelemetryUI();
    
    // Force re-load target deck category to show new cards
    selectDeckCategory(targetDeckId);
    
    alert(`Successfully generated and saved ${cardsCreatedCount} new Q&A study cards!`);
  } else {
    alert("Could not extract definitions formats from notes. Check lines criteria (e.g. 'Term: Definition' or 'Q? A').");
  }
}
