/**
 * IdeaSynth - AI Project Idea Generator
 * Core Frontend & Synthesis Script Logic
 */

// 1. PROCEDURAL BLUEPRINT DICTIONARIES
const SYNTH_VERBS = ["Build", "Create", "Design", "Implement", "Develop"];

const SYNTH_SUBJECTS = {
  Healthcare: [
    { title: "Telehealth Patient Dashboard", details: "monitors patient vital arrays, schedules practitioner consult grids, and logs blood pressure trends." },
    { title: "Symptom Diagnostic Grid", details: "logs patient symptom timelines, flags high-risk triggers, and suggests care categories." },
    { title: "Medication Compliance Tracker", details: "sends alarm reminders, logs dosage compliance records, and links prescription PDFs." },
    { title: "Clinical Shift Scheduler", details: "allocates shift rosters dynamically, monitors practitioner load limits, and tracks availability swaps." },
    { title: "Fitness Telemetry Hub", details: "aggregates active heart rates, counts daily calories, and tracks sleep progression dials." }
  ],
  Finance: [
    { title: "Micro-Investment Simulator", details: "rounds up daily transactions, models stock buy portfolios, and tracks compound interest graphs." },
    { title: "Cryptocurrency Balance Board", details: "tracks wallet tokens, visualizes price changes, and models custom buy/sell threshold alarms." },
    { title: "Shared Expenses Splitter", details: "divides bills among group members, logs payment settlements, and exports ledger reports." },
    { title: "Fintech Budget Forecast Tool", details: "categorizes monthly expenses, maps income flows, and runs projection models." },
    { title: "Personal Equity Tracker", details: "structures asset allocations, logs liabilities schedules, and displays net worth charts." }
  ],
  Gaming: [
    { title: "Quest Checklist Logger", details: "tracks RPG quest chains, maps reward experience points (XP), and charts achievements progress." },
    { title: "Lobby Player Matchmaker", details: "sorts player ranking statistics, matches competitive ratings, and designs tournament grids." },
    { title: "Inventory Loot Simulator", details: "manages item weight limits, rolls drops chances, and lists equipment stat modifiers." },
    { title: "Retro Trivia Game Arena", details: "runs quiz matches against timer limits, tracks scoreboard lists, and counts multiplier scores." },
    { title: "Card Deck Strategist", details: "structures custom playing card decks, runs combat simulations, and analyzes card synergies." }
  ],
  Social: [
    { title: "Developer Hangout Board", details: "shares coding project links, logs comments threads, and tags coding category matches." },
    { title: "Event Map Discoverer", details: "lists local community gatherings, maps event coordinate tags, and handles attendance confirmations." },
    { title: "Micro-blogging Feed Portal", details: "shares text snippets, filters trending hashtag indexes, and handles user bookmark panels." },
    { title: "Shared Book Club Lounge", details: "tracks reading logs, schedules discussions notes, and rates book reviews." },
    { title: "Collaborative Study Mesh", details: "creates group study rooms, shares revision checklists, and hosts shared pomodoro timers." }
  ],
  Productivity: [
    { title: "Markdown Spec Workspace", details: "edits raw text blocks, renders live HTML previews, and compiles PDF checklists." },
    { title: "Local Kanban Task Board", details: "drags tasks across columns, tracks milestones schedules, and alerts on bottleneck tasks." },
    { title: "API Endpoint Mock Studio", details: "defines request schemas, generates mock JSON outputs, and tests headers queries." },
    { title: "File Archive Converter", details: "compresses text strings, parses JSON models, and exports raw data blobs." },
    { title: "Coding snippet Library", details: "saves reusable code scripts, tags language keywords, and handles copy-to-clipboard actions." }
  ]
};

// Features arrays grouped by difficulty and stacks
const FEATURE_PRESETS = {
  Beginner: [
    "Clean forms inputs with responsive error validations.",
    "LocalStorage state to persist configurations on reload.",
    "Search input filters to query items in real-time.",
    "Interactive dashboard visualizers mapping basic lists."
  ],
  Intermediate: [
    "External third-party API integration (simulated via mocks data).",
    "Multi-category filtering and advanced tags sorting.",
    "Checklists milestones tracker with visual progress bar dials.",
    "Exportable summaries datasets in local configurations."
  ],
  Advanced: [
    "Safe script execution wrappers evaluating input telemetry.",
    "Complex relational indexings matching similar category nodes.",
    "Graph metrics visualizer displaying growth curves.",
    "Structured data builders compiling JSON file outputs."
  ]
};

// Technology stack arrays
const TECH_PRESETS = {
  Frontend: ["HTML5", "CSS3 grids", "Vanilla ES6", "FontAwesome icons", "Google Web Fonts"],
  Fullstack: ["Node.js structures", "REST endpoints models", "SQL local mock databases", "LocalStorage sync"],
  "AI/ML": ["Heuristic text parsers", "Regex logic analyzers", "Classification algorithms", "Mock predictors"],
  Blockchain: ["Web3 wallet connectors", "Ledger transactions records", "Cryptography hashes", "Smart contract states"]
};

// AI refinement options and descriptions
const AI_REFINEMENTS_DICT = {
  realtime_sync: {
    title: "Real-time Collaboration Sync",
    desc: "Injects multi-client simulated sync, allowing peer node sync states and resolving conflicts using CRDT heuristics."
  },
  anomaly_detection: {
    title: "ML Anomaly Indicators",
    desc: "Appends classification heuristics that monitor data logs inputs and trigger warning alerts on outlying spikes."
  },
  nlp_search: {
    title: "NLP Semantic Text Search",
    desc: "Integrates client-side word-stemming filters and query dictionaries to resolve notes queries semantically."
  },
  offline_sync: {
    title: "Offline IndexedDB Sync",
    desc: "Configures transactional database registers locally using IndexedDB, syncing queues when connections resume."
  },
  predictive_analytics: {
    title: "Predictive Growth Statistics",
    desc: "Applies statistical extrapolation formulas mapping historical data trends to project future performance telemetry."
  }
};

// 2. STATE LOGS & LOCAL MEMORY
let totalGenerated = 0;
let bookmarks = [];
let currentIdea = null;
let activeBookmarkId = null;

// 3. DOM ELEMENT CACHE
const selDifficultyEl = document.getElementById("sel-difficulty");
const selStackEl = document.getElementById("sel-stack");
const selDomainEl = document.getElementById("sel-domain");

const lblStatGeneratedEl = document.getElementById("lbl-stat-generated");
const lblStatBookmarkedEl = document.getElementById("lbl-stat-bookmarked");
const bookmarksListEl = document.getElementById("bookmarks-list");
const btnResetWorkspaceEl = document.getElementById("btn-reset-workspace");

const btnGenerateEl = document.getElementById("btn-generate");
const ideaSheetBoxEl = document.getElementById("idea-sheet-box");
const ideaTitleEl = document.getElementById("idea-title");
const ideaDifficultyBadgeEl = document.getElementById("idea-difficulty-badge");
const tagStackEl = document.getElementById("tag-stack");
const tagDomainEl = document.getElementById("tag-domain");
const ideaDescriptionEl = document.getElementById("idea-description");
const ideaFeaturesEl = document.getElementById("idea-features");
const btnBookmarkEl = document.getElementById("btn-bookmark");

const selAiRefinementEl = document.getElementById("sel-ai-refinement");
const btnApplyRefinementEl = document.getElementById("btn-apply-refinement");

const specEmptyEl = document.getElementById("spec-empty");
const specActiveEl = document.getElementById("spec-active");
const specTitleEl = document.getElementById("spec-title");
const specNotesEl = document.getElementById("spec-notes");
const specChecklistEl = document.getElementById("spec-checklist");
const btnDeleteBookmarkEl = document.getElementById("btn-delete-bookmark");
const btnExportJsonEl = document.getElementById("btn-export-json");

// 4. MAIN INITIALIZER
window.addEventListener("DOMContentLoaded", () => {
  loadWorkspaceData();
  setupEventListeners();
  renderBookmarksList();
  updateStatsUI();
  
  // Synthesize default idea on start
  handleSynthesizeIdea();
});

// 5. LOCAL STORAGE SYNCS
function loadWorkspaceData() {
  totalGenerated = parseInt(localStorage.getItem("ideasynth_generated")) || 0;
  
  try {
    bookmarks = JSON.parse(localStorage.getItem("ideasynth_bookmarks")) || [];
  } catch (e) {
    bookmarks = [];
  }
}

function saveWorkspaceData() {
  localStorage.setItem("ideasynth_generated", totalGenerated);
  localStorage.setItem("ideasynth_bookmarks", JSON.stringify(bookmarks));
}

function updateStatsUI() {
  lblStatGeneratedEl.textContent = totalGenerated;
  lblStatBookmarkedEl.textContent = bookmarks.length;
}

// 6. SYNTHESIZER ENGINE LOGIC
function handleSynthesizeIdea() {
  const diff = selDifficultyEl.value;
  const stack = selStackEl.value;
  const domain = selDomainEl.value;

  // A. Procedural pick values
  const verb = SYNTH_VERBS[Math.floor(Math.random() * SYNTH_VERBS.length)];
  const subjects = SYNTH_SUBJECTS[domain];
  const subjectObj = subjects[Math.floor(Math.random() * subjects.length)];

  // Formulate Title
  const title = `${verb} a ${subjectObj.title}`;
  
  // Formulate Description
  const description = `A custom-tailored ${diff.toLowerCase()} project focused on a ${stack} structure in the ${domain} sector. This system ${subjectObj.details} Engineered to resolve specific domain challenges utilizing premium developer components.`;

  // Formulate Features
  const featuresList = [...FEATURE_PRESETS[diff]];
  
  // Append technology stack features
  const techPreset = TECH_PRESETS[stack];
  featuresList.push(`Built utilizing ${techPreset[0]}, ${techPreset[1]}, and modern ${techPreset[2]} script parameters.`);

  currentIdea = {
    id: "idea_" + Date.now(),
    title: title,
    difficulty: diff,
    stack: stack,
    domain: domain,
    description: description,
    features: featuresList,
    notes: "",
    checklist: featuresList.map(f => ({ text: f, checked: false }))
  };

  totalGenerated++;
  saveWorkspaceData();
  updateStatsUI();

  // Render generator panel
  renderIdeaSheet(currentIdea);
}

function renderIdeaSheet(idea) {
  ideaTitleEl.textContent = idea.title;
  ideaDifficultyBadgeEl.textContent = idea.difficulty;
  
  // Adjust badge colors based on difficulty
  ideaDifficultyBadgeEl.className = "difficulty-badge";
  if (idea.difficulty === "Advanced") ideaDifficultyBadgeEl.classList.add("text-rose");
  else if (idea.difficulty === "Intermediate") ideaDifficultyBadgeEl.classList.add("text-cyan");
  else ideaDifficultyBadgeEl.classList.add("text-success");

  tagStackEl.textContent = idea.stack;
  tagDomainEl.textContent = idea.domain;
  ideaDescriptionEl.textContent = idea.description;

  // Render features
  ideaFeaturesEl.innerHTML = "";
  idea.features.forEach(f => {
    const li = document.createElement("li");
    li.innerHTML = `<i class="fa-solid fa-angle-right"></i> <span>${f}</span>`;
    ideaFeaturesEl.appendChild(li);
  });

  // Toggle bookmark button state
  const isSaved = bookmarks.some(b => b.title === idea.title);
  if (isSaved) {
    btnBookmarkEl.innerHTML = `<i class="fa-solid fa-star text-amber"></i> Bookmarked`;
    btnBookmarkEl.classList.add("btn-success");
  } else {
    btnBookmarkEl.innerHTML = `<i class="fa-regular fa-star"></i> Bookmark`;
    btnBookmarkEl.classList.remove("btn-success");
  }
}

// 7. BOOKMARKS DRAWER CONTROLLER
function handleBookmarkCurrentIdea() {
  if (!currentIdea) return;

  const isSaved = bookmarks.some(b => b.title === currentIdea.title);
  if (isSaved) {
    alert("This project blueprint is already bookmarked inside your sidebar workspace.");
    return;
  }

  // Clone active current idea to bookmarks
  const clone = JSON.parse(JSON.stringify(currentIdea));
  bookmarks.push(clone);
  
  saveWorkspaceData();
  updateStatsUI();
  renderBookmarksList();
  renderIdeaSheet(currentIdea);

  // Auto select newly saved spec
  loadSpecEditor(clone.id);
}

function renderBookmarksList() {
  bookmarksListEl.innerHTML = "";

  if (bookmarks.length === 0) {
    bookmarksListEl.innerHTML = `
      <div class="welcome-placeholder small-placeholder">
        <i class="fa-solid fa-folder-open placeholder-icon"></i>
        <p class="text-secondary text-sm">No bookmarked ideas yet.</p>
      </div>
    `;
    return;
  }

  bookmarks.forEach(b => {
    const isSelected = activeBookmarkId === b.id;
    const item = document.createElement("div");
    item.className = `bookmark-item ${isSelected ? 'active' : ''}`;
    
    item.innerHTML = `
      <span class="bookmark-item-title">${b.title}</span>
      <i class="fa-solid fa-star"></i>
    `;

    item.addEventListener("click", () => {
      document.querySelectorAll(".bookmark-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      loadSpecEditor(b.id);
    });

    bookmarksListEl.appendChild(item);
  });
}

// 8. AI REFINEMENT ACCENTS INJECTORS
function handleInjectAIRefinement() {
  if (!currentIdea) return;

  const refinementKey = selAiRefinementEl.value;
  const refObj = AI_REFINEMENTS_DICT[refinementKey];
  
  if (!refObj) return;

  // Verify if already injected
  const hasRefinement = currentIdea.features.some(f => f.includes(refObj.title));
  if (hasRefinement) {
    alert(`This AI enhancement (${refObj.title}) has already been injected into this project blueprint.`);
    return;
  }

  // Inject to currentIdea
  currentIdea.features.push(`[AI Enhancement]: ${refObj.title} - ${refObj.desc}`);
  currentIdea.checklist.push({
    text: `[AI Enhancement]: ${refObj.title} - ${refObj.desc}`,
    checked: false
  });

  // Re-render
  renderIdeaSheet(currentIdea);

  // If already bookmarked, update the bookmarked item as well
  const bIndex = bookmarks.findIndex(b => b.title === currentIdea.title);
  if (bIndex !== -1) {
    bookmarks[bIndex].features = [...currentIdea.features];
    bookmarks[bIndex].checklist = [...currentIdea.checklist];
    saveWorkspaceData();
    
    if (activeBookmarkId === bookmarks[bIndex].id) {
      loadSpecEditor(bookmarks[bIndex].id);
    }
  }

  alert(`AI feature '${refObj.title}' successfully injected!`);
}

// 9. SPECIFICATION ARCHITECT EDITOR
function loadSpecEditor(bookmarkId) {
  activeBookmarkId = bookmarkId;
  const spec = bookmarks.find(b => b.id === bookmarkId);
  if (!spec) return;

  renderBookmarksList();

  specEmptyEl.classList.add("hidden");
  specActiveEl.classList.remove("hidden");

  specTitleEl.value = spec.title;
  specNotesEl.value = spec.notes;

  // Render checklist
  renderChecklistUI(spec);
}

function renderChecklistUI(spec) {
  specChecklistEl.innerHTML = "";

  spec.checklist.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = `checklist-item ${item.checked ? 'checked' : ''}`;
    
    li.innerHTML = `
      <div class="chk-icon"><i class="fa-solid fa-check"></i></div>
      <span class="chk-text">${item.text}</span>
    `;

    li.addEventListener("click", () => {
      item.checked = !item.checked;
      li.className = `checklist-item ${item.checked ? 'checked' : ''}`;
      saveWorkspaceData();
    });

    specChecklistEl.appendChild(li);
  });
}

function handleSaveSpecChanges() {
  const spec = bookmarks.find(b => b.id === activeBookmarkId);
  if (!spec) return;

  spec.title = specTitleEl.value.trim() || "Untitled Project Idea";
  spec.notes = specNotesEl.value;

  saveWorkspaceData();
  renderBookmarksList();
}

function handleDeleteBookmark() {
  if (!activeBookmarkId) return;

  if (confirm("Delete this bookmarked project spec blueprint? This deletes all checklist states and custom notes.")) {
    bookmarks = bookmarks.filter(b => b.id !== activeBookmarkId);
    activeBookmarkId = null;

    saveWorkspaceData();
    updateStatsUI();
    renderBookmarksList();

    specActiveEl.classList.add("hidden");
    specEmptyEl.classList.remove("hidden");
    
    // Refresh generator card bookmark state
    if (currentIdea) {
      renderIdeaSheet(currentIdea);
    }
  }
}

// 10. SPEC ARCHITECT JSON EXPORTER
function handleExportBlueprintJSON() {
  const spec = bookmarks.find(b => b.id === activeBookmarkId);
  if (!spec) return;

  // Structure output object
  const blueprintOutput = {
    title: spec.title,
    difficulty: spec.difficulty,
    stack: spec.stack,
    domain: spec.domain,
    description: spec.description,
    featuresList: spec.features,
    customDevNotes: spec.notes,
    developmentChecklist: spec.checklist,
    synthesizedDate: new Date().toLocaleString(),
    exportedBy: "IdeaSynth Workspace Tool"
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blueprintOutput, null, 2));
  
  // Compile download tag anchor link
  const dlAnchor = document.createElement("a");
  const filename = spec.title.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_blueprint.json";
  
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", filename);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
}

// 11. EVENT LISTENERS SETUP
function setupEventListeners() {
  // Generate click
  btnGenerateEl.addEventListener("click", handleSynthesizeIdea);

  // Bookmark click
  btnBookmarkEl.addEventListener("click", handleBookmarkCurrentIdea);

  // AI Refine click
  btnApplyRefinementEl.addEventListener("click", handleInjectAIRefinement);

  // Spec inputs changes
  specTitleEl.addEventListener("input", handleSaveSpecChanges);
  specNotesEl.addEventListener("input", handleSaveSpecChanges);

  // Spec actions
  btnDeleteBookmarkEl.addEventListener("click", handleDeleteBookmark);
  btnExportJsonEl.addEventListener("click", handleExportBlueprintJSON);

  // Clear workspace variables
  btnResetWorkspaceEl.addEventListener("click", () => {
    if (confirm("Clear all bookmarks history, totals statistics, and custom development notes? This cannot be undone.")) {
      localStorage.clear();
      bookmarks = [];
      totalGenerated = 0;
      activeBookmarkId = null;

      saveWorkspaceData();
      updateStatsUI();
      renderBookmarksList();
      handleSynthesizeIdea();

      specActiveEl.classList.add("hidden");
      specEmptyEl.classList.remove("hidden");
    }
  });
}
