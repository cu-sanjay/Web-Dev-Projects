/**
 * InterPrep - AI Interview Preparation Dashboard
 * Frontend Engine
 */

// 1. Core Question Banks Database
const QUESTION_DATABASE = {
  frontend: {
    junior: [
      { id: "fe_j1", text: "Explain the difference between let, const, and var in JavaScript.", keywords: ["scope", "hoisting", "reassignment", "block", "var"] },
      { id: "fe_j2", text: "What is semantic HTML and why is it important for accessibility?", keywords: ["seo", "accessibility", "screen reader", "tags", "structure"] },
      { id: "fe_j3", text: "How do you make a website responsive? Describe the layout models you would use.", keywords: ["flexbox", "grid", "media query", "viewport", "mobile"] }
    ],
    mid: [
      { id: "fe_m1", text: "How does the JavaScript event loop work? Explain the difference between microtasks and macrotasks.", keywords: ["call stack", "queue", "promise", "settimeout", "blocking", "asynchronous"] },
      { id: "fe_m2", text: "What strategies do you use to optimize performance in a React application?", keywords: ["memo", "lazy load", "render", "bundle", "virtualization", "reconciliation"] },
      { id: "fe_m3", text: "Describe the differences between localStorage, sessionStorage, and cookies.", keywords: ["storage size", "expiration", "http request", "browser", "persistence"] }
    ],
    senior: [
      { id: "fe_s1", text: "How do you design a global state management architecture for a highly complex web application?", keywords: ["redux", "context", "zustand", "scalability", "prop drilling", "actions", "store"] },
      { id: "fe_s2", text: "Explain the concept of Micro-frontends. When would you recommend them and what are the drawbacks?", keywords: ["decouple", "deployment", "monolith", "iframe", "module federation", "latency"] },
      { id: "fe_s3", text: "How do you approach optimizing Core Web Vitals, specifically LCP, INP, and CLS?", keywords: ["largest contentful paint", "cumulative layout shift", "interaction to next paint", "lazy loading", "fonts", "render-blocking"] }
    ]
  },
  backend: {
    junior: [
      { id: "be_j1", text: "What is the difference between a GET and a POST HTTP request?", keywords: ["body", "parameters", "url", "idempotent", "safe"] },
      { id: "be_j2", text: "What is an index in a database and how does it speed up queries?", keywords: ["b-tree", "lookup", "binary search", "writes", "scan"] },
      { id: "be_j3", text: "What is the purpose of middleware in a Node.js framework like Express?", keywords: ["request", "response", "next", "pipeline", "authentication"] }
    ],
    mid: [
      { id: "be_m1", text: "Explain SQL joins. What is the difference between an INNER JOIN, LEFT JOIN, and RIGHT JOIN?", keywords: ["intersection", "null", "rows", "matching", "keys"] },
      { id: "be_m2", text: "How do you secure a REST API from threats like SQL injection or brute force attacks?", keywords: ["validation", "prepared statement", "rate limiting", "jwt", "hashing", "cors"] },
      { id: "be_m3", text: "What is the difference between SQL and NoSQL databases? When would you choose one over the other?", keywords: ["schema", "scaling", "relational", "document", "acid", "joins"] }
    ],
    senior: [
      { id: "be_s1", text: "Describe your approach to designing a high-throughput microservice architecture. How do services communicate?", keywords: ["grpc", "message broker", "rabbitmq", "kafka", "latency", "circuit breaker", "idempotency"] },
      { id: "be_s2", text: "Explain database replication, sharding, and caching. When do you apply each to scale backend capacity?", keywords: ["redis", "read replica", "partitioning", "consistency", "cap theorem", "load"] },
      { id: "be_s3", text: "How do you implement secure authorization and single sign-on (SSO) in enterprise web systems?", keywords: ["oauth", "saml", "tokens", "identity provider", "scopes", "jwt"] }
    ]
  },
  devops: {
    junior: [
      { id: "do_j1", text: "What is Docker and what is the difference between a Docker image and a container?", keywords: ["isolated", "runtime", "blueprint", "virtual machine", "layer"] },
      { id: "do_j2", text: "What is Git and how does a merge request differ from a rebase?", keywords: ["branch", "commit history", "conflict", "linear", "version control"] },
      { id: "do_j3", text: "What is CI/CD and why is it important for development teams?", keywords: ["automation", "pipeline", "integration", "deployment", "testing"] }
    ],
    mid: [
      { id: "do_m1", text: "Explain the difference between horizontal and vertical scaling in cloud environments.", keywords: ["instances", "ram", "cpu", "load balancer", "autoscaling"] },
      { id: "do_m2", text: "How do Docker volumes work and why do we need them?", keywords: ["persistence", "host directory", "container destruction", "mount"] },
      { id: "do_m3", text: "What is Infrastructure as Code (IaC) and what are its main advantages?", keywords: ["terraform", "automation", "versioning", "state file", "declarative"] }
    ],
    senior: [
      { id: "do_s1", text: "Describe how you would architect a zero-downtime deployment pipeline for a high-traffic system.", keywords: ["blue-green", "canary", "rollback", "kubernetes", "dns route", "health check"] },
      { id: "do_s2", text: "How do you secure a Kubernetes cluster? Detail key network policies and RBAC practices.", keywords: ["role-based access control", "namespaces", "tls", "secrets", "ingress", "pod security"] },
      { id: "do_s3", text: "Describe your strategy for setting up centralized logging and metrics monitoring across a distributed cloud grid.", keywords: ["prometheus", "grafana", "elk", "alerts", "telemetry", "tracing", "jaeger"] }
    ]
  },
  product: {
    junior: [
      { id: "pm_j1", text: "What is a Minimum Viable Product (MVP) and how do you decide what features go into it?", keywords: ["feedback", "user testing", "core value", "iteration", "prioritization"] },
      { id: "pm_j2", text: "What is a product roadmap and who are the key stakeholders you share it with?", keywords: ["timeline", "milestones", "developers", "executives", "alignment"] },
      { id: "pm_j3", text: "Explain the difference between Agile and Waterfall methodologies.", keywords: ["incremental", "linear", "sprints", "flexibility", "phases"] }
    ],
    mid: [
      { id: "pm_m1", text: "How do you prioritize a product backlog? What frameworks do you use?", keywords: ["rice score", "moscow", "effort", "reach", "impact", "roi"] },
      { id: "pm_m2", text: "How do you measure the success of a newly launched feature? What metrics do you track?", keywords: ["conversion", "retention", "nps", "dau", "churn", "analytics"] },
      { id: "pm_m3", text: "How do you handle a situation where engineering tells you a committed roadmap feature will be delayed?", keywords: ["communication", "stakeholders", "scope reduction", "alternative", "transparency"] }
    ],
    senior: [
      { id: "pm_s1", text: "How do you define product strategy for a brand new market segment where no customer base exists?", keywords: ["market fit", "persona", "competitive analysis", "tam", "discovery", "experiments"] },
      { id: "pm_s2", text: "Describe how you evaluate pricing strategies and models for a B2B SaaS platform.", keywords: ["seats", "usage-based", "tiers", "cac", "ltv", "margins", "revenue model"] },
      { id: "pm_s3", text: "How do you guide a cross-functional squad through pivot decisions when current metrics fail goals?", keywords: ["hypothesis", "data-driven", "sunk cost", "vision", "post-mortem", "customer input"] }
    ]
  }
};

// 2. State Variables
let currentSessionQuestions = [];
let currentQuestionIndex = 0;
let sessionResponses = []; // array of { questionId, promptText, answerText, timeSpent, scoreInfo }
let activeView = "simulator";
let timerInterval = null;
let timerSeconds = 0;

// Speech synthesis voice caching
let voiceReaderEnabled = true;
let voiceRecognitionEnabled = false;
let speechSynthInstance = window.speechSynthesis;
let speechRecognitionInstance = null;
let activeUtterance = null;
let sttIsRecording = false;

// Saved storage structures
let sessionLogs = [];
let starStories = [];
let prepStreak = 0;
let lastSessionDate = "";

// 3. STAR Validator Regex Rules
const STAR_VERBS_LIST = /\b(engineered|architected|optimized|refactored|spearheaded|streamlined|constructed|developed|integrated|scaled|built|deployed|implemented|designed|orchestrated|analyzed|processed|modeled|derived|predicted|visualized|launched|published|coded|debugged)\b/i;
const STAR_METRICS_LIST = /\b(\d+(\.\d+)?(%)?(\s?x\b)?|\$\d+k?|\d+\s?hours|\d+x|\d+\s?percent)\b/i;

// 4. DOM Nodes Caching
const navButtons = document.querySelectorAll(".nav-btn");
const viewPanes = document.querySelectorAll(".view-pane");
const viewTitleEl = document.getElementById("view-title");
const viewDescEl = document.getElementById("view-desc");

// Telemetry Labels
const sideSessionsEl = document.getElementById("side-stat-sessions");
const sideScoreEl = document.getElementById("side-stat-score");
const sideStreakEl = document.getElementById("side-stat-streak");

// Simulator setup / views
const simSetupCard = document.getElementById("sim-setup-card");
const simActiveCard = document.getElementById("sim-active-card");
const simScoreCard = document.getElementById("sim-score-card");
const selectRoleEl = document.getElementById("select-role");
const selectLevelEl = document.getElementById("select-level");
const selectLengthEl = document.getElementById("select-length");
const checkTtsEl = document.getElementById("check-tts");
const checkSttEl = document.getElementById("check-stt");
const btnStartSessionEl = document.getElementById("btn-start-session");

// Active interview pane
const valCurrQEl = document.getElementById("val-curr-q");
const valTotalQEl = document.getElementById("val-total-q");
const valTimerEl = document.getElementById("val-timer");
const lblQuestionTextEl = document.getElementById("lbl-question-text");
const txtResponseEl = document.getElementById("txt-response");
const btnSpeakQuestionEl = document.getElementById("btn-speak-question");
const btnMicToggleEl = document.getElementById("btn-mic-toggle");
const micStatusContainerEl = document.getElementById("mic-status-container");
const lblMicStateEl = document.getElementById("lbl-mic-state");
const responseCharCountEl = document.getElementById("response-char-count");
const btnNextQuestionEl = document.getElementById("btn-next-question");
const btnFinishSessionEl = document.getElementById("btn-finish-session");

// Scoring Results
const lblEvalDetailsEl = document.getElementById("lbl-eval-details");
const lblEvalBadgeEl = document.getElementById("lbl-eval-badge");
const evalRadialProgressEl = document.getElementById("eval-radial-progress");
const lblEvalScoreEl = document.getElementById("lbl-eval-score");
const valSubRelevanceEl = document.getElementById("val-sub-relevance");
const fillSubRelevanceEl = document.getElementById("fill-sub-relevance");
const valSubPaceEl = document.getElementById("val-sub-pace");
const fillSubPaceEl = document.getElementById("fill-sub-pace");
const valSubVocabEl = document.getElementById("val-sub-vocab");
const fillSubVocabEl = document.getElementById("fill-sub-vocab");
const evalMissingKeywordsEl = document.getElementById("eval-missing-keywords");
const evalVocabTextEl = document.getElementById("eval-vocab-text");
const btnRestartSimEl = document.getElementById("btn-restart-simulator");

// STAR Builder inputs
const starBuilderForm = document.getElementById("star-builder-form");
const starTitleEl = document.getElementById("star-title");
const starCategoryEl = document.getElementById("star-category");
const starSituationEl = document.getElementById("star-situation");
const starTaskEl = document.getElementById("star-task");
const starActionEl = document.getElementById("star-action");
const starResultEl = document.getElementById("star-result");
const starWordCountEl = document.getElementById("star-word-count");
const savedStarCountEl = document.getElementById("saved-star-count");
const starStoriesGridEl = document.getElementById("star-stories-grid");

// STAR advice rows
const advMetricLength = document.getElementById("adv-metric-length");
const advMetricMetrics = document.getElementById("adv-metric-metrics");
const advMetricVerbs = document.getElementById("adv-metric-verbs");
const starLiveTipEl = document.getElementById("star-live-tip");

// Analytics pane overview
const totAnswersCountEl = document.getElementById("tot-answers-count");
const totFavoriteRoleEl = document.getElementById("tot-favorite-role");
const totAverageTimeEl = document.getElementById("tot-average-time");
const totStreakValEl = document.getElementById("tot-streak-val");
const logsTableBodyEl = document.getElementById("logs-table-body");

// Clear/Reset Buttons
const btnResetDataEl = document.getElementById("btn-reset-data");

// Modal Story View
const storyModalEl = document.getElementById("story-modal");
const modalStoryTitleEl = document.getElementById("modal-story-title");
const modalStoryBodyEl = document.getElementById("modal-story-body");
const btnCloseModalEl = document.getElementById("btn-close-modal");

// Accordions Toggling cache
const accordionItems = document.querySelectorAll(".accordion-item");

// 5. App Initialization
window.addEventListener("DOMContentLoaded", () => {
  initSpeechEngines();
  loadData();
  setupNav();
  setupFormListeners();
  setupSimulationListeners();
  updateSidebarStats();
});

// Load storage
function loadData() {
  const logs = localStorage.getItem("interprep_sessions");
  if (logs) {
    try { sessionLogs = JSON.parse(logs); } catch (e) { sessionLogs = []; }
  }

  const stories = localStorage.getItem("interprep_star_stories");
  if (stories) {
    try { starStories = JSON.parse(stories); } catch (e) { starStories = []; }
  }

  prepStreak = parseInt(localStorage.getItem("interprep_streak")) || 0;
  lastSessionDate = localStorage.getItem("interprep_last_date") || "";

  calculateStreak();
}

function saveData(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Calculate streaks based on date differences
function calculateStreak() {
  if (!lastSessionDate) {
    prepStreak = 0;
    return;
  }
  
  const today = new Date();
  const lastDate = new Date(lastSessionDate);
  
  // Calculate day difference
  const timeDiff = today.getTime() - lastDate.getTime();
  const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  if (dayDiff > 1) {
    // Streak broken
    prepStreak = 0;
    localStorage.setItem("interprep_streak", 0);
  }
}

// 6. Navigation Switching
function setupNav() {
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const targetView = btn.getAttribute("data-view");
      activeView = targetView;

      // Update titles
      if (activeView === "simulator") {
        viewTitleEl.textContent = "Mock Interview Simulator";
        viewDescEl.textContent = "Configure your target role and practice answering questions under stress.";
      } else if (activeView === "star") {
        viewTitleEl.textContent = "STAR Story Builder";
        viewDescEl.textContent = "Design behavioral answers using the structural STAR method guidelines.";
        renderStarStories();
      } else if (activeView === "history") {
        viewTitleEl.textContent = "Analytics & Logs Hub";
        viewDescEl.textContent = "Consolidated feedback statistics based on all practice mock interview sessions.";
        renderHistoryLogs();
      }

      // Toggle views
      viewPanes.forEach(pane => {
        if (pane.id === `view-${targetView}`) {
          pane.classList.remove("hidden");
        } else {
          pane.classList.add("hidden");
        }
      });
      
      // Stop speech synthesis if switching views
      stopSpeech();
    });
  });

  // Modal actions
  btnCloseModalEl.addEventListener("click", () => {
    storyModalEl.classList.add("hidden");
  });
  
  storyModalEl.addEventListener("click", (e) => {
    if (e.target === storyModalEl) storyModalEl.classList.add("hidden");
  });

  // Clear data click
  btnResetDataEl.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all practice attempts and saved STAR stories? This resets the dashboard completely.")) {
      localStorage.clear();
      sessionLogs = [];
      starStories = [];
      prepStreak = 0;
      lastSessionDate = "";
      
      updateSidebarStats();
      if (activeView === "star") renderStarStories();
      if (activeView === "history") renderHistoryLogs();
      
      // Reset simulator views
      simActiveCard.classList.add("hidden");
      simScoreCard.classList.add("hidden");
      simSetupCard.classList.remove("hidden");
      
      alert("All data has been cleared.");
    }
  });
}

// 7. Speech APIs Binding
function initSpeechEngines() {
  const badge = document.getElementById("speech-support-badge");

  // Check SpeechSynthesis
  const ttsSupported = 'speechSynthesis' in window;
  
  // Check SpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const sttSupported = !!SpeechRecognition;

  if (ttsSupported || sttSupported) {
    badge.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> Speech Engines Ready`;
    badge.className = "speech-status-banner";
  } else {
    badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-warning"></i> Voice Engines Unavailable`;
    badge.className = "speech-status-banner no-support";
  }

  // Setup recognition instances if available
  if (sttSupported) {
    speechRecognitionInstance = new SpeechRecognition();
    speechRecognitionInstance.continuous = true;
    speechRecognitionInstance.interimResults = true;
    speechRecognitionInstance.lang = 'en-US';

    speechRecognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      
      if (finalTranscript) {
        txtResponseEl.value += finalTranscript;
        updateResponseCharCounter();
      }
    };

    speechRecognitionInstance.onerror = (e) => {
      console.error("Speech Recognition Error", e);
      if (e.error === "not-allowed") {
        alert("Microphone access blocked. Please adjust browser permissions.");
        disableSttState();
      }
    };

    speechRecognitionInstance.onend = () => {
      if (sttIsRecording) {
        // Restart if it turned off automatically but user wants it active
        speechRecognitionInstance.start();
      }
    };
  } else {
    // Disable checkbox if not supported
    checkSttEl.checked = false;
    checkSttEl.disabled = true;
    checkSttEl.closest(".toggle-row").style.opacity = 0.5;
  }
}

function speakText(text) {
  if (!speechSynthInstance) return;
  stopSpeech();

  activeUtterance = new SpeechSynthesisUtterance(text);
  activeUtterance.rate = 0.95; // slightly slower for clarity
  activeUtterance.pitch = 1.0;
  
  // Choose standard English voice if possible
  const voices = speechSynthInstance.getVoices();
  const enVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
  if (enVoice) activeUtterance.voice = enVoice;

  speechSynthInstance.speak(activeUtterance);
}

function stopSpeech() {
  if (speechSynthInstance && speechSynthInstance.speaking) {
    speechSynthInstance.cancel();
  }
}

// 8. STAR Builder story evaluation & saving
function setupFormListeners() {
  // Real time advice checker on typing
  const triggerAdviceCheck = () => {
    const sVal = starSituationEl.value.trim();
    const tVal = starTaskEl.value.trim();
    const aVal = starActionEl.value.trim();
    const rVal = starResultEl.value.trim();

    const totalWords = (sVal + " " + tVal + " " + aVal + " " + rVal).split(/\s+/).filter(Boolean).length;
    starWordCountEl.textContent = totalWords;

    // Check Length
    const lenSuccess = totalWords >= 150 && totalWords <= 400;
    updateAdvIndicator(advMetricLength, lenSuccess);

    // Check Metrics
    const combinedText = sVal + " " + tVal + " " + aVal + " " + rVal;
    const metricSuccess = STAR_METRICS_LIST.test(combinedText);
    updateAdvIndicator(advMetricMetrics, metricSuccess);

    // Check Action Verbs
    const verbSuccess = STAR_VERBS_LIST.test(combinedText);
    updateAdvIndicator(advMetricVerbs, verbSuccess);

    // Provide contextual live advice text
    if (totalWords < 50) {
      starLiveTipEl.textContent = "Keep writing! Share context and goals inside the Situation and Task blocks.";
    } else if (!metricSuccess) {
      starLiveTipEl.textContent = "Tip: Make your Result section stronger by adding a statistic (e.g. 'reduced load time by 30%', 'saved 10 hours weekly').";
    } else if (!verbSuccess) {
      starLiveTipEl.textContent = "Tip: Incorporate strong leadership/action verbs in the Action box (e.g. 'designed', 'orchestrated', 'spearheaded').";
    } else if (!lenSuccess) {
      starLiveTipEl.textContent = "Story metrics look strong! Try to balance text lengths to keep stories concise (under 400 words).";
    } else {
      starLiveTipEl.textContent = "Excellent draft structure! Your story is balanced, contains action verbs, and highlights clear results.";
    }
  };

  [starSituationEl, starTaskEl, starActionEl, starResultEl].forEach(area => {
    area.addEventListener("input", triggerAdviceCheck);
  });

  // STAR builder submission
  starBuilderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = starTitleEl.value.trim();
    const category = starCategoryEl.value;
    const situation = starSituationEl.value.trim();
    const task = starTaskEl.value.trim();
    const action = starActionEl.value.trim();
    const result = starResultEl.value.trim();

    if (!title || !situation || !task || !action || !result) {
      alert("Please populate all required sections of the STAR form.");
      return;
    }

    const newStory = {
      id: "star_" + Date.now(),
      title,
      category,
      situation,
      task,
      action,
      result,
      date: new Date().toLocaleDateString()
    };

    starStories.unshift(newStory);
    saveData("interprep_star_stories", starStories);

    // Reset Form
    starBuilderForm.reset();
    starWordCountEl.textContent = "0";
    triggerAdviceCheck();
    
    // Refresh Grid
    renderStarStories();
    updateSidebarStats();
    alert("STAR story saved successfully!");
  });
}

function updateAdvIndicator(el, success) {
  if (success) {
    el.className = "adv-row text-success";
    el.querySelector("i").className = "fa-solid fa-circle-check";
  } else {
    el.className = "adv-row text-danger";
    el.querySelector("i").className = "fa-solid fa-circle-xmark";
  }
}

// Render saved STAR lists
function renderStarStories() {
  starStoriesGridEl.innerHTML = "";
  savedStarCountEl.textContent = starStories.length;

  if (starStories.length === 0) {
    starStoriesGridEl.innerHTML = `
      <div class="text-muted text-sm text-center py-2" style="grid-column: span 3;">
        <i class="fa-solid fa-folder-open"></i> No saved behavioral stories. Draft one above!
      </div>
    `;
    return;
  }

  starStories.forEach(s => {
    const card = document.createElement("div");
    card.className = "star-card";
    
    // Category mapping
    let categoryBadge = "Frontend";
    if (s.category === "backend") categoryBadge = "Backend";
    if (s.category === "devops") categoryBadge = "DevOps";
    if (s.category === "product") categoryBadge = "Product";

    const previewText = s.situation.substring(0, 80) + "...";

    card.innerHTML = `
      <div class="star-card-header">
        <h4>${s.title}</h4>
        <span class="star-card-badge">${categoryBadge}</span>
      </div>
      <p class="star-card-preview">${previewText}</p>
      <div class="star-card-footer">
        <button class="btn btn-secondary btn-sm btn-view-story" data-id="${s.id}"><i class="fa-solid fa-eye"></i> View</button>
        <button class="btn btn-icon btn-sm btn-delete-story" data-id="${s.id}" aria-label="Delete story"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `;

    // View handler
    card.querySelector(".btn-view-story").addEventListener("click", () => {
      showStoryModal(s);
    });

    // Delete handler
    card.querySelector(".btn-delete-story").addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete the story "${s.title}"?`)) {
        starStories = starStories.filter(story => story.id !== s.id);
        saveData("interprep_star_stories", starStories);
        renderStarStories();
        updateSidebarStats();
      }
    });

    starStoriesGridEl.appendChild(card);
  });
}

function showStoryModal(story) {
  modalStoryTitleEl.textContent = story.title;
  modalStoryBodyEl.innerHTML = `
    <div class="modal-star-section">
      <h5>Situation</h5>
      <p>${story.situation}</p>
    </div>
    <div class="modal-star-section">
      <h5>Task</h5>
      <p>${story.task}</p>
    </div>
    <div class="modal-star-section">
      <h5>Action</h5>
      <p>${story.action}</p>
    </div>
    <div class="modal-star-section">
      <h5>Result</h5>
      <p>${story.result}</p>
    </div>
  `;
  storyModalEl.classList.remove("hidden");
}

// 9. Simulator logic flow
function setupSimulationListeners() {
  btnStartSessionEl.addEventListener("click", startMockSession);
  
  btnSpeakQuestionEl.addEventListener("click", () => {
    if (currentSessionQuestions.length > 0) {
      speakText(currentSessionQuestions[currentQuestionIndex].text);
    }
  });

  txtResponseEl.addEventListener("input", updateResponseCharCounter);

  btnMicToggleEl.addEventListener("click", toggleSttRecording);

  btnNextQuestionEl.addEventListener("click", handleNextQuestion);
  btnFinishSessionEl.addEventListener("click", handleFinishSession);
  btnRestartSimEl.addEventListener("click", () => {
    simScoreCard.classList.add("hidden");
    simSetupCard.classList.remove("hidden");
    stopSpeech();
  });

  // Accordion inside evaluator details
  accordionItems.forEach(item => {
    const trigger = item.querySelector(".accordion-trigger");
    trigger.addEventListener("click", () => {
      const active = item.classList.contains("active");
      accordionItems.forEach(i => i.classList.remove("active"));
      if (!active) item.classList.add("active");
    });
  });
}

function updateResponseCharCounter() {
  const chars = txtResponseEl.value.length;
  responseCharCountEl.textContent = `${chars} characters`;
}

function toggleSttRecording() {
  if (!speechRecognitionInstance) {
    alert("Speech recognition is not supported in this browser. Please type responses manually.");
    return;
  }

  if (sttIsRecording) {
    disableSttState();
  } else {
    enableSttState();
  }
}

function enableSttState() {
  sttIsRecording = true;
  btnMicToggleEl.innerHTML = `<i class="fa-solid fa-microphone-slash"></i> <span>Disable Microphone</span>`;
  btnMicToggleEl.className = "btn btn-danger";
  micStatusContainerEl.classList.remove("hidden");
  lblMicStateEl.textContent = "Listening to microphone... Speak clearly.";
  
  try {
    speechRecognitionInstance.start();
  } catch (e) {
    console.warn("Recognition already started or error", e);
  }
}

function disableSttState() {
  sttIsRecording = false;
  btnMicToggleEl.innerHTML = `<i class="fa-solid fa-microphone"></i> <span>Enable Microphone</span>`;
  btnMicToggleEl.className = "btn btn-secondary";
  micStatusContainerEl.classList.add("hidden");
  
  try {
    speechRecognitionInstance.stop();
  } catch (e) {
    console.warn("Recognition already stopped", e);
  }
}

function startMockSession() {
  const domain = selectRoleEl.value;
  const tier = selectLevelEl.value;
  const count = parseInt(selectLengthEl.value);

  voiceReaderEnabled = checkTtsEl.checked;
  voiceRecognitionEnabled = checkSttEl.checked;

  const list = QUESTION_DATABASE[domain]?.[tier] || [];
  if (list.length === 0) {
    alert("Invalid questions list selection configuration.");
    return;
  }

  // Slice questions matching session length
  currentSessionQuestions = list.slice(0, count);
  currentQuestionIndex = 0;
  sessionResponses = [];
  timerSeconds = 0;

  // Toggle screens
  simSetupCard.classList.add("hidden");
  simScoreCard.classList.add("hidden");
  simActiveCard.classList.remove("hidden");

  // Reset progress buttons
  btnNextQuestionEl.classList.remove("hidden");
  btnFinishSessionEl.classList.add("hidden");

  // Load question
  loadQuestionIndex(0);

  // Start timers
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timerSeconds = 0;
  updateTimerDisplay();
  
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const s = String(timerSeconds % 60).padStart(2, '0');
  valTimerEl.textContent = `${m}:${s}`;
}

function loadQuestionIndex(index) {
  currentQuestionIndex = index;
  valCurrQEl.textContent = index + 1;
  valTotalQEl.textContent = currentSessionQuestions.length;

  const q = currentSessionQuestions[index];
  lblQuestionTextEl.textContent = q.text;
  
  // Clear responses
  txtResponseEl.value = "";
  updateResponseCharCounter();

  // Speech Reader voice speak
  if (voiceReaderEnabled) {
    setTimeout(() => {
      speakText(q.text);
    }, 400);
  }

  // Voice recognition toggle checks
  if (voiceRecognitionEnabled && speechRecognitionInstance) {
    enableSttState();
  } else {
    disableSttState();
  }

  // Switch buttons
  if (index === currentSessionQuestions.length - 1) {
    btnNextQuestionEl.classList.add("hidden");
    btnFinishSessionEl.classList.remove("hidden");
  }
}

function handleNextQuestion() {
  recordActiveResponse();
  loadQuestionIndex(currentQuestionIndex + 1);
  startTimer();
}

function handleFinishSession() {
  recordActiveResponse();
  clearInterval(timerInterval);
  stopSpeech();
  disableSttState();

  // Evaluate responses
  evaluateMockSession();
}

function recordActiveResponse() {
  const q = currentSessionQuestions[currentQuestionIndex];
  const responseText = txtResponseEl.value.trim();

  sessionResponses.push({
    questionId: q.id,
    promptText: q.text,
    answerText: responseText,
    timeSpent: timerSeconds,
    keywords: q.keywords
  });
}

// 10. AI Grading and Performance calculator logic
function evaluateMockSession() {
  // Metrics aggregate accumulators
  let totalScoreSum = 0;
  let totalWordsCount = 0;
  let matchKeywordsCount = 0;
  let totalExpectedKeywords = 0;
  let totalTimeSum = 0;

  const evaluatedQuestions = sessionResponses.map(resp => {
    const textLower = resp.answerText.toLowerCase();
    const wordCount = resp.answerText.split(/\s+/).filter(Boolean).length;
    totalWordsCount += wordCount;
    totalTimeSum += resp.timeSpent;

    // A. Keyword matches: 40 points
    let matches = 0;
    const missing = [];
    resp.keywords.forEach(k => {
      const reg = new RegExp(`\\b${k}\\b`, "i");
      if (reg.test(textLower)) {
        matches++;
      } else {
        missing.push(k);
      }
    });

    totalExpectedKeywords += resp.keywords.length;
    matchKeywordsCount += matches;

    const keywordScore = resp.keywords.length > 0 ? (matches / resp.keywords.length) * 40 : 0;

    // B. Response Depth / word length: 30 points
    // Target ~40-100 words per question
    let depthScore = 0;
    if (wordCount >= 40) depthScore = 30;
    else if (wordCount >= 20) depthScore = 15;
    else if (wordCount >= 5) depthScore = 5;

    // C. Pacing speed / delivery duration: 30 points
    // Speak at 100 - 150 WPM, or text equivalents. Average response should take >15 seconds.
    let speedScore = 0;
    const mins = resp.timeSpent / 60;
    const wpm = mins > 0 ? Math.round(wordCount / mins) : 0;

    if (wpm >= 90 && wpm <= 160) speedScore = 30;
    else if (wpm > 0 && (wpm < 90 || wpm > 160)) speedScore = 15;

    // Sum individual score
    const finalQScore = Math.round(keywordScore + depthScore + speedScore);
    totalScoreSum += finalQScore;

    return {
      ...resp,
      qScore: finalQScore,
      wpm,
      missingKeywords: missing
    };
  });

  const questionCount = sessionResponses.length;
  const averageQualityScore = questionCount > 0 ? Math.round(totalScoreSum / questionCount) : 0;
  const avgWPM = totalTimeSum > 0 ? Math.round(totalWordsCount / (totalTimeSum / 60)) : 0;
  const keywordRatio = totalExpectedKeywords > 0 ? Math.round((matchKeywordsCount / totalExpectedKeywords) * 100) : 0;

  // Render metrics to card UI
  lblEvalDetailsEl.textContent = `${QUESTION_DATABASE[selectRoleEl.value].title} (${selectLevelEl.value.toUpperCase()}) - ${questionCount} Questions`;
  
  // Set quality badge
  if (averageQualityScore >= 80) {
    lblEvalBadgeEl.textContent = "Excellent Quality";
    lblEvalBadgeEl.className = "eval-badge text-success";
  } else if (averageQualityScore >= 55) {
    lblEvalBadgeEl.textContent = "Good Quality";
    lblEvalBadgeEl.className = "eval-badge text-accent";
  } else {
    lblEvalBadgeEl.textContent = "Needs Practice";
    lblEvalBadgeEl.className = "eval-badge text-warning";
  }

  // Draw circular progress bar
  animateOverallScore(averageQualityScore);

  // Set sub stats progress bars
  valSubRelevanceEl.textContent = `${keywordRatio}%`;
  fillSubRelevanceEl.style.width = `${keywordRatio}%`;

  let wpmLabel = "Medium";
  if (avgWPM < 80) wpmLabel = "Slow";
  if (avgWPM > 160) wpmLabel = "Fast";
  valSubPaceEl.textContent = `${avgWPM} WPM (${wpmLabel})`;
  
  // Pace bar target 120 WPM (mapped 0 to 200 WPM to 100%)
  const pacePercent = Math.min((avgWPM / 200) * 100, 100);
  fillSubPaceEl.style.width = `${pacePercent}%`;

  valSubVocabEl.textContent = `${totalWordsCount} words`;
  // Vocab count target 300 words total standard
  const vocabPercent = Math.min((totalWordsCount / 300) * 100, 100);
  fillSubVocabEl.style.width = `${vocabPercent}%`;

  // Aggregate missing keywords tags
  evalMissingKeywordsEl.innerHTML = "";
  const missingAggregate = [];
  evaluatedQuestions.forEach(eq => {
    eq.missingKeywords.forEach(k => {
      if (!missingAggregate.includes(k)) missingAggregate.push(k);
    });
  });

  if (missingAggregate.length > 0) {
    missingAggregate.forEach(k => {
      const span = document.createElement("span");
      span.textContent = k;
      evalMissingKeywordsEl.appendChild(span);
    });
  } else {
    evalMissingKeywordsEl.innerHTML = "<span>Perfect score! All core context keywords covered.</span>";
  }

  // Vocabulary diagnostic advice
  let fillerCount = 0;
  sessionResponses.forEach(r => {
    const matches = r.answerText.match(/\b(um|uh|like|so|basically|actually)\b/gi);
    if (matches) fillerCount += matches.length;
  });

  if (fillerCount > 3) {
    evalVocabTextEl.innerHTML = `<p>We detected <strong>${fillerCount} filler words</strong> (like 'um', 'basically', 'like') in your audio transcripts. Work on speaking with deliberate pauses to raise delivery grades.</p>`;
  } else {
    evalVocabTextEl.innerHTML = `<p>Good delivery! Your answers were direct with minimal filler terms. Maintain this clear speech rate during actual panel reviews.</p>`;
  }

  // Toggle card screens
  simActiveCard.classList.add("hidden");
  simScoreCard.classList.remove("hidden");

  // Save Session Registry Log
  const newLog = {
    id: "attempt_" + Date.now(),
    date: new Date().toLocaleDateString(),
    role: selectRoleEl.value,
    level: selectLevelEl.value,
    questions: questionCount,
    score: averageQualityScore,
    averageTime: Math.round(totalTimeSum / questionCount)
  };

  sessionLogs.unshift(newLog);
  saveData("interprep_sessions", sessionLogs);

  // Update streaks
  const todayStr = new Date().toDateString();
  if (lastSessionDate !== todayStr) {
    // If last date was yesterday, increase streak, else reset to 1
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastSessionDate === yesterday.toDateString()) {
      prepStreak++;
    } else {
      prepStreak = 1;
    }
    
    lastSessionDate = todayStr;
    localStorage.setItem("interprep_streak", prepStreak);
    localStorage.setItem("interprep_last_date", lastSessionDate);
  }

  updateSidebarStats();
}

function animateOverallScore(target) {
  let val = 0;
  const maxOffset = 314;
  
  if (window.evalTimerInterval) clearInterval(window.evalTimerInterval);

  window.evalTimerInterval = setInterval(() => {
    if (val < target) val++;
    else if (val > target) val--;
    else clearInterval(window.evalTimerInterval);

    lblEvalScoreEl.textContent = val;
    const offset = maxOffset - (maxOffset * val) / 100;
    evalRadialProgressEl.style.strokeDashoffset = offset;

    // Gradient styling indicators
    if (val >= 80) evalRadialProgressEl.style.stroke = "var(--clr-success)";
    else if (val >= 55) evalRadialProgressEl.style.stroke = "var(--clr-accent-light)";
    else evalRadialProgressEl.style.stroke = "var(--clr-warning)";
  }, 15);
}

// 11. History Tables & Analytics Compilation
function renderHistoryLogs() {
  logsTableBodyEl.innerHTML = "";
  
  // Calculations
  let answersCount = 0;
  let totalTime = 0;
  
  sessionLogs.forEach(l => {
    answersCount += l.questions;
    totalTime += l.averageTime;
  });

  totAnswersCountEl.textContent = answersCount;
  
  const favRole = findFavoriteRole();
  totFavoriteRoleEl.textContent = favRole ? QUESTION_DATABASE[favRole].title : "-";
  
  const avgDuration = sessionLogs.length > 0 ? Math.round(totalTime / sessionLogs.length) : 0;
  totAverageTimeEl.textContent = `${avgDuration}s`;
  
  totStreakValEl.textContent = `${prepStreak} days`;

  // Render attempts table rows
  if (sessionLogs.length === 0) {
    logsTableBodyEl.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted text-sm py-2">No session attempts recorded yet. Begin a mock session!</td>
      </tr>
    `;
    return;
  }

  sessionLogs.forEach(l => {
    const row = document.createElement("tr");
    
    let domainName = "Frontend Developer";
    if (l.role === "backend") domainName = "Backend Developer";
    if (l.role === "devops") domainName = "DevOps Specialist";
    if (l.role === "product") domainName = "Product Manager";

    // Set score class color
    let scoreClass = "text-accent";
    if (l.score >= 80) scoreClass = "text-success";
    if (l.score < 55) scoreClass = "text-warning";

    row.innerHTML = `
      <td>${l.date}</td>
      <td><strong>${domainName}</strong></td>
      <td class="font-mono">${l.level.toUpperCase()}</td>
      <td>${l.questions} Qs</td>
      <td class="${scoreClass} font-mono"><strong>${l.score}/100</strong></td>
      <td><button class="btn btn-secondary btn-sm btn-delete-log" data-id="${l.id}"><i class="fa-solid fa-trash"></i> Delete</button></td>
    `;

    row.querySelector(".btn-delete-log").addEventListener("click", () => {
      if (confirm("Delete this session record?")) {
        sessionLogs = sessionLogs.filter(log => log.id !== l.id);
        saveData("interprep_sessions", sessionLogs);
        renderHistoryLogs();
        updateSidebarStats();
      }
    });

    logsTableBodyEl.appendChild(row);
  });
}

function findFavoriteRole() {
  if (sessionLogs.length === 0) return "";
  
  const counts = {};
  sessionLogs.forEach(l => {
    counts[l.role] = (counts[l.role] || 0) + 1;
  });

  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

// 12. Update generic sidebar statistics
function updateSidebarStats() {
  sideSessionsEl.textContent = sessionLogs.length;

  let totalScores = 0;
  sessionLogs.forEach(l => totalScores += l.score);
  const avg = sessionLogs.length > 0 ? Math.round(totalScores / sessionLogs.length) : 0;
  
  sideScoreEl.textContent = `${avg}%`;
  sideStreakEl.textContent = `${prepStreak} days`;
}
