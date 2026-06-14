/**
 * FoundryAI - AI Startup Validation Dashboard
 * Core Frontend & Simulations Logic
 */

// 1. DEFAULT MILESTONE CHECKPOINTS PRESETS
const FOUNDER_CHECKPOINTS = [
  "Define and draft the Core MVP user story",
  "Conduct 10 problem-interview calls with target users",
  "Launch waitlist landing page with clear UVP messaging",
  "Map competitor feature sets and pricing lists",
  "Estimate customer acquisition costs (CAC) and channels",
  "Setup simple analytics to track conversion ratios"
];

// 2. STATE LOGS & LOCAL MEMORY
let evaluations = [];
let activeRunId = null;

// DOM Cache
const lblAvgScoreEl = document.getElementById("lbl-avg-score");
const lblEvaluatedCountEl = document.getElementById("lbl-evaluated-count");
const lblStatsAvgEl = document.getElementById("lbl-stats-avg");
const lblStatsTopEl = document.getElementById("lbl-stats-top");
const historyListEl = document.getElementById("history-list");
const btnResetWorkspaceEl = document.getElementById("btn-reset-workspace");

// Form controls
const pitchTitleEl = document.getElementById("pitch-title");
const pitchDescEl = document.getElementById("pitch-desc");
const pitchAudienceEl = document.getElementById("pitch-audience");
const selPricingEl = document.getElementById("sel-pricing");
const pitchBudgetEl = document.getElementById("pitch-budget");
const pitchTamEl = document.getElementById("pitch-tam");
const pitchCompetitorsEl = document.getElementById("pitch-competitors");
const btnValidateEl = document.getElementById("btn-validate");

// Report panels
const reportEmptyEl = document.getElementById("report-empty");
const reportActiveEl = document.getElementById("report-active");
const lblReportPricingBadgeEl = document.getElementById("lbl-report-pricing-badge");
const lblReportNameEl = document.getElementById("lbl-report-name");
const viabilityIndicatorEl = document.getElementById("viability-indicator");
const lblViabilityScoreEl = document.getElementById("lbl-viability-score");
const swotBulletsEl = document.getElementById("swot-bullets");

// Financials
const rangePriceEl = document.getElementById("range-price");
const lblRangePriceEl = document.getElementById("lbl-range-price");
const rangeUsersEl = document.getElementById("range-users");
const lblRangeUsersEl = document.getElementById("lbl-range-users");
const lblBreakevenEl = document.getElementById("lbl-breakeven");
const revenueChartEl = document.getElementById("revenue-chart");

// Recommendations & checklists
const lblPivotRecommendationsEl = document.getElementById("lbl-pivot-recommendations");
const milestonesChecklistEl = document.getElementById("milestones-checklist");
const btnDeleteRunEl = document.getElementById("btn-delete-run");
const btnBookmarkRunEl = document.getElementById("btn-bookmark-run");

// 3. MAIN INITIALIZER
window.addEventListener("DOMContentLoaded", () => {
  loadWorkspaceData();
  setupEventListeners();
  renderHistoryList();
  updateStatsUI();
});

// 4. LOCAL STORAGE SYNCS
function loadWorkspaceData() {
  try {
    evaluations = JSON.parse(localStorage.getItem("foundry_evaluations")) || [];
  } catch (e) {
    evaluations = [];
  }
}

function saveWorkspaceData() {
  localStorage.setItem("foundry_evaluations", JSON.stringify(evaluations));
}

function updateStatsUI() {
  lblEvaluatedCountEl.textContent = evaluations.length;

  if (evaluations.length === 0) {
    lblAvgScoreEl.textContent = "0%";
    lblStatsAvgEl.textContent = "0%";
    lblStatsTopEl.textContent = "N/A";
    return;
  }

  const sum = evaluations.reduce((acc, e) => acc + e.score, 0);
  const avg = Math.round(sum / evaluations.length);
  lblAvgScoreEl.textContent = `${avg}%`;
  lblStatsAvgEl.textContent = `${avg}%`;

  // Top Rated pitch
  const sorted = [...evaluations].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  lblStatsTopEl.textContent = top.title.substring(0, 10) + (top.title.length > 10 ? '..' : '') + ` (${top.score}%)`;
}

// 5. VALIDATOR HEURISTIC ENGINE
function handleEvaluateStartupPitch() {
  const title = pitchTitleEl.value.trim();
  const desc = pitchDescEl.value.trim();
  const audience = pitchAudienceEl.value.trim();
  const pricing = selPricingEl.value;
  const budget = parseInt(pitchBudgetEl.value) || 1000;
  const tam = parseInt(pitchTamEl.value) || 100;
  const competitors = pitchCompetitorsEl.value.trim();

  if (!title || !desc) {
    alert("Please write a startup name and elevator pitch details first.");
    return;
  }

  // A. viability Score Calculation Heuristics
  let score = 55; // baseline

  // Pitch length checks
  if (desc.length > 80) score += 10;
  if (desc.length > 150) score += 5;

  // Keyword check viability boosts
  const queryLower = (desc + " " + audience).toLowerCase();
  const valuableKeywords = ["scalable", "api", "automated", "efficiency", "platform", "b2b", "mobile", "analytics"];
  valuableKeywords.forEach(kw => {
    if (queryLower.includes(kw)) score += 3;
  });

  // TAM viability check
  if (tam > 500) score += 5;
  else if (tam < 5) score -= 10; // too niche

  // Competitor checks
  const compCount = competitors ? competitors.split(",").length : 0;
  if (compCount === 0) score -= 5; // potential lack of market confirmation
  else if (compCount > 4) score -= 5; // oversaturated market risk
  else score += 5; // healthy competition

  // Bound score (40 - 98%)
  score = Math.min(98, Math.max(40, score));

  // B. SWOT Heuristics synthesizers
  const strengths = [
    `Low-barrier deployment model utilizing a ${pricing} pricing structure.`,
    `Focuses on addressing clear friction pain points within ${audience || 'target niche'}.`
  ];
  if (tam >= 100) strengths.push(`Expansive TAM ($${tam}M) indicating significant scaling headroom.`);

  const weaknesses = [
    `Susceptible to churn in early stages without sticky integrations.`,
    `Initial operations OpEx ($${budget}/mo) requires customer threshold validations early.`
  ];
  if (compCount > 3) weaknesses.push(`Highly saturated competing landscape with ${compCount} direct rivals.`);

  const opportunities = [
    `Expanding into custom white-label options matching B2B enterprise networks.`,
    `Refining telemetry statistics to build proprietary data indexing models.`
  ];

  const threats = [
    `Fast replication risk from incumbents with larger engineering divisions.`,
    `Client acquisition costs (CAC) might scale faster than user pricing budgets.`
  ];

  // C. AI Pivots / Recommendations suggestions
  const recommendations = [];
  if (pricing === "Freemium") {
    recommendations.push("<strong>Freemium Warning</strong>: Convert free tier users to premium tier within 30 days using tiered triggers to sustain the monthly budget.");
  } else if (pricing === "SaaS") {
    recommendations.push("<strong>SaaS Optimization</strong>: Offer an annual billing discount (e.g. 20% off) to secure advance operational cash flows.");
  }
  
  if (budget > 5000) {
    recommendations.push(`<strong>OpEx Management</strong>: Operating costs ($${budget}/mo) are high. Pivot to a leaner MVP infrastructure using serverless APIs.`);
  }

  if (compCount === 0) {
    recommendations.push("<strong>Zero Competitors Nudge</strong>: Zero direct competitors noted. Confirm customer interview timelines to ensure high market demand exists.");
  } else {
    recommendations.push(`<strong>Differentiator Target</strong>: Position against ${competitors.split(",")[0]} by offering a highly custom value proposition.`);
  }

  // Define default sliders
  const defaultPrice = pricing === "SaaS" ? 49 : pricing === "Transaction" ? 15 : 9;
  const defaultUsers = 300;

  // Construct active evaluation profile object
  const tempRun = {
    id: "run_" + Date.now(),
    title: title,
    description: desc,
    audience: audience,
    pricing: pricing,
    budget: budget,
    tam: tam,
    competitors: competitors,
    score: score,
    swot: { S: strengths, W: weaknesses, O: opportunities, T: threats },
    recommendations: recommendations,
    milestones: FOUNDER_CHECKPOINTS.map(m => ({ text: m, checked: false })),
    priceSlider: defaultPrice,
    usersSlider: defaultUsers
  };

  // Temporarily cache in current view
  activeRunId = tempRun.id;
  
  // Render report
  renderReportSheet(tempRun);
}

function renderReportSheet(run) {
  reportEmptyEl.classList.add("hidden");
  reportActiveEl.classList.remove("hidden");

  lblReportNameEl.textContent = run.title;
  lblReportPricingBadgeEl.textContent = run.pricing;

  // Animate viability indicator dial
  animateViabilityIndicator(run.score);

  // Render SWOT
  renderSWOTMatrix(run.swot);

  // Sliders value mappings
  rangePriceEl.value = run.priceSlider;
  lblRangePriceEl.textContent = `$${run.priceSlider}`;

  rangeUsersEl.value = run.usersSlider;
  lblRangeUsersEl.textContent = run.usersSlider;

  // Render projected charts
  calculateFinancialProjections(run);

  // Recommendations pivots
  lblPivotRecommendationsEl.innerHTML = "";
  run.recommendations.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = `<i class="fa-solid fa-angle-right"></i> <span>${r}</span>`;
    lblPivotRecommendationsEl.appendChild(li);
  });

  // Checkpoints checklists
  renderMilestonesChecklist(run);

  // Synchronize history save bookmark buttons
  const isSaved = evaluations.some(e => e.id === run.id || e.title === run.title);
  if (isSaved) {
    btnBookmarkRunEl.innerHTML = `<i class="fa-solid fa-check"></i> Bookmarked`;
    btnBookmarkRunEl.classList.add("btn-success");
  } else {
    btnBookmarkRunEl.innerHTML = `<i class="fa-solid fa-bookmark"></i> Bookmark Run`;
    btnBookmarkRunEl.classList.remove("btn-success");
  }
}

function animateViabilityIndicator(score) {
  let val = 0;
  const maxOffset = 263.8;

  if (window.viabilityInterval) clearInterval(window.viabilityInterval);

  window.viabilityInterval = setInterval(() => {
    if (val < score) val++;
    else if (val > score) val--;
    else clearInterval(window.viabilityInterval);

    lblViabilityScoreEl.textContent = `${val}%`;
    const offset = maxOffset - (maxOffset * val) / 100;
    viabilityIndicatorEl.style.strokeDashoffset = offset;

    // Dial gauge colors
    if (val >= 75) viabilityIndicatorEl.style.stroke = "var(--clr-accent)"; // emerald
    else if (val >= 50) viabilityIndicatorEl.style.stroke = "var(--clr-secondary)"; // violet
    else viabilityIndicatorEl.style.stroke = "var(--clr-warning)"; // amber
  }, 8);
}

function renderSWOTMatrix(swot) {
  swotBulletsEl.innerHTML = `
    <div class="swot-box s">
      <span class="swot-box-lbl">Strengths</span>
      <p class="swot-txt">${swot.S[0]}</p>
    </div>
    <div class="swot-box w">
      <span class="swot-box-lbl">Weaknesses</span>
      <p class="swot-txt">${swot.W[0]}</p>
    </div>
    <div class="swot-box o">
      <span class="swot-box-lbl">Opportunities</span>
      <p class="swot-txt">${swot.O[0]}</p>
    </div>
    <div class="swot-box t">
      <span class="swot-box-lbl">Threats</span>
      <p class="swot-txt">${swot.T[0]}</p>
    </div>
  `;
}

// 6. REVENUE PROJECT CHARTS ENGINE
function calculateFinancialProjections(run) {
  const price = run.priceSlider;
  const usersMax = run.usersSlider;
  const opex = run.budget;

  // Clear chart
  revenueChartEl.innerHTML = "";

  let breakEvenMonth = -1;
  let cashflows = [];

  // Generate cashflows over 12 months linear scaling
  for (let m = 1; m <= 12; m++) {
    const usersThisMonth = Math.round(usersMax * (m / 12));
    const revenue = usersThisMonth * price;
    const net = revenue - opex;
    cashflows.push(net);

    if (net >= 0 && breakEvenMonth === -1) {
      breakEvenMonth = m;
    }
  }

  // Render break-even timeline
  if (breakEvenMonth !== -1) {
    lblBreakevenEl.textContent = `Month ${breakEvenMonth} (${price * Math.round(usersMax * (breakEvenMonth / 12)) >= opex ? 'Profitable' : 'Deficit'})`;
    lblBreakevenEl.className = "text-emerald font-bold";
  } else {
    lblBreakevenEl.textContent = "Unprofitable within 12 months";
    lblBreakevenEl.className = "text-danger font-bold";
  }

  // Render CSS grid bars columns
  const maxAbsFlow = Math.max(...cashflows.map(v => Math.abs(v)));
  
  cashflows.forEach((net, idx) => {
    const colContainer = document.createElement("div");
    colContainer.className = "chart-bar-container";
    
    // Percentage height calculation
    const hPercent = maxAbsFlow > 0 ? Math.round((Math.abs(net) / maxAbsFlow) * 100) : 0;
    
    const bar = document.createElement("div");
    bar.className = `chart-bar ${net >= 0 ? 'positive' : 'negative'}`;
    bar.style.height = `${Math.max(4, hPercent)}%`;

    colContainer.appendChild(bar);
    colContainer.setAttribute("data-tooltip", `Mo. ${idx + 1}: ${net >= 0 ? '+' : ''}$${net}`);
    
    revenueChartEl.appendChild(colContainer);
  });
}

// 7. CHECKPOINTS CHECKLISTS ENGINE
function renderMilestonesChecklist(run) {
  milestonesChecklistEl.innerHTML = "";

  run.milestones.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = `milestones-item ${item.checked ? 'checked' : ''}`;
    
    li.innerHTML = `
      <div class="chk-icon"><i class="fa-solid fa-check"></i></div>
      <span class="chk-text">${item.text}</span>
    `;

    li.addEventListener("click", () => {
      item.checked = !item.checked;
      li.className = `milestones-item ${item.checked ? 'checked' : ''}`;
      saveWorkspaceData();
    });

    milestonesChecklistEl.appendChild(li);
  });
}

// 8. BOOKMARK & ACTIONS HANDLERS
function handleBookmarkEvaluation() {
  // Grab active run state details
  const currentRun = {
    id: activeRunId,
    title: pitchTitleEl.value.trim(),
    description: pitchDescEl.value.trim(),
    audience: pitchAudienceEl.value.trim(),
    pricing: selPricingEl.value,
    budget: parseInt(pitchBudgetEl.value) || 1000,
    tam: parseInt(pitchTamEl.value) || 100,
    competitors: pitchCompetitorsEl.value.trim(),
    score: parseInt(lblViabilityScoreEl.textContent) || 50,
    swot: {
      S: [document.querySelector(".swot-box.s .swot-txt").textContent],
      W: [document.querySelector(".swot-box.w .swot-txt").textContent],
      O: [document.querySelector(".swot-box.o .swot-txt").textContent],
      T: [document.querySelector(".swot-box.t .swot-txt").textContent]
    },
    recommendations: Array.from(document.querySelectorAll("#lbl-pivot-recommendations li span")).map(el => el.innerHTML),
    milestones: Array.from(document.querySelectorAll("#milestones-checklist li")).map(el => ({
      text: el.querySelector(".chk-text").textContent,
      checked: el.classList.contains("checked")
    })),
    priceSlider: parseInt(rangePriceEl.value) || 29,
    usersSlider: parseInt(rangeUsersEl.value) || 250
  };

  const isSaved = evaluations.some(e => e.title === currentRun.title);
  if (isSaved) {
    alert("An evaluation run with this startup name already exists in bookmarks.");
    return;
  }

  evaluations.push(currentRun);
  saveWorkspaceData();
  updateStatsUI();
  renderHistoryList();
  renderReportSheet(currentRun);
}

function renderHistoryList() {
  historyListEl.innerHTML = "";

  if (evaluations.length === 0) {
    historyListEl.innerHTML = `
      <div class="welcome-placeholder small-placeholder">
        <i class="fa-solid fa-box-open placeholder-icon"></i>
        <p class="text-secondary text-sm">No saved evaluations yet.</p>
      </div>
    `;
    return;
  }

  evaluations.forEach(e => {
    const isSelected = activeRunId === e.id;
    const card = document.createElement("div");
    card.className = `history-item ${isSelected ? 'active' : ''}`;
    card.innerHTML = `
      <span class="history-item-title">${e.title}</span>
      <span class="history-score-badge">${e.score}%</span>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".history-item").forEach(el => el.classList.remove("active"));
      card.classList.add("active");
      loadSavedEvaluation(e.id);
    });

    historyListEl.appendChild(card);
  });
}

function loadSavedEvaluation(runId) {
  activeRunId = runId;
  const run = evaluations.find(e => e.id === runId);
  if (!run) return;

  // Populate inputs form fields
  pitchTitleEl.value = run.title;
  pitchDescEl.value = run.description;
  pitchAudienceEl.value = run.audience;
  selPricingEl.value = run.pricing;
  pitchBudgetEl.value = run.budget;
  pitchTamEl.value = run.tam;
  pitchCompetitorsEl.value = run.competitors;

  // Render report
  renderReportSheet(run);
}

function handleDeleteEvaluationRun() {
  if (!activeRunId) return;

  if (confirm("Delete this startup validation profile run? This clears bookmarks statistics.")) {
    evaluations = evaluations.filter(e => e.id !== activeRunId);
    activeRunId = null;

    saveWorkspaceData();
    updateStatsUI();
    renderHistoryList();

    reportActiveEl.classList.add("hidden");
    reportEmptyEl.classList.remove("hidden");
  }
}

// 9. FINANCIAL SLIDERS VALUE BINDERS
function handleSliderChange() {
  const activeRun = evaluations.find(e => e.id === activeRunId);
  const tempPrice = parseInt(rangePriceEl.value);
  const tempUsers = parseInt(rangeUsersEl.value);

  lblRangePriceEl.textContent = `$${tempPrice}`;
  lblRangeUsersEl.textContent = tempUsers;

  // Construct temp mockup run
  const mockup = {
    priceSlider: tempPrice,
    usersSlider: tempUsers,
    budget: parseInt(pitchBudgetEl.value) || 1000
  };

  // Recompute projected values
  calculateFinancialProjections(mockup);

  // Commit changes to database if active record is saved in history
  if (activeRun) {
    activeRun.priceSlider = tempPrice;
    activeRun.usersSlider = tempUsers;
    saveWorkspaceData();
  }
}

// 10. EVENT LISTENERS SETUP
function setupEventListeners() {
  // Validate pitch click
  btnValidateEl.addEventListener("click", handleEvaluateStartupPitch);

  // Bookmark run click
  btnBookmarkRunEl.addEventListener("click", handleBookmarkEvaluation);

  // Delete run click
  btnDeleteRunEl.addEventListener("click", handleDeleteEvaluationRun);

  // Sliders binding
  rangePriceEl.addEventListener("input", handleSliderChange);
  rangeUsersEl.addEventListener("input", handleSliderChange);

  // Reset workspace parameters
  btnResetWorkspaceEl.addEventListener("click", () => {
    if (confirm("Reset all startup validation history and average evaluation stats? This cannot be undone.")) {
      localStorage.clear();
      evaluations = [];
      activeRunId = null;

      saveWorkspaceData();
      updateStatsUI();
      renderHistoryList();

      reportActiveEl.classList.add("hidden");
      reportEmptyEl.classList.remove("hidden");

      // Reset inputs
      pitchTitleEl.value = "";
      pitchDescEl.value = "";
      pitchAudienceEl.value = "";
      selPricingEl.value = "SaaS";
      pitchBudgetEl.value = "1000";
      pitchTamEl.value = "150";
      pitchCompetitorsEl.value = "";
    }
  });
}
