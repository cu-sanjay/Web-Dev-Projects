// Startup Equity Simulator - Interaction Logic

// Default Pre-populated Cap Table configurations
const DEFAULT_SCENARIOS = [
  {
    id: "sc-founders",
    name: "Founder-Heavy Core Plan",
    holders: [
      { id: "h1", name: "Founder A", shares: 4000000, investment: 0 },
      { id: "h2", name: "Founder B", shares: 3000000, investment: 0 },
      { id: "h3", name: "Early Engineer", shares: 500000, investment: 0 },
      { id: "h4", name: "Angel Investor", shares: 1000000, investment: 100000 }
    ],
    rounds: [
      { id: "r1", name: "Seed Round", cash: 500000, valuation: 4000000, esop: 10 }
    ]
  },
  {
    id: "sc-flat",
    name: "VC Financing Path (Series A)",
    holders: [
      { id: "h1", name: "Founder A", shares: 4000000, investment: 0 },
      { id: "h2", name: "Founder B", shares: 3000000, investment: 0 },
      { id: "h3", name: "Early Engineer", shares: 500000, investment: 0 }
    ],
    rounds: [
      { id: "r1", name: "Seed Round", cash: 800000, valuation: 4200000, esop: 10 },
      { id: "r2", name: "Series A Round", cash: 3000000, valuation: 12000000, esop: 15 }
    ]
  },
  {
    id: "sc-bootstrap",
    name: "Bootstrapped / Angel Clean",
    holders: [
      { id: "h1", name: "Founder A", shares: 5000000, investment: 20000 },
      { id: "h2", name: "Founder B", shares: 4000000, investment: 15000 }
    ],
    rounds: []
  }
];

// Shareholder slice colors palette mapping
const SHAREHOLDER_COLORS = [
  "var(--color-holder-1)",
  "var(--color-holder-2)",
  "var(--color-holder-3)",
  "var(--color-holder-4)",
  "var(--color-holder-5)",
  "var(--color-holder-6)",
  "var(--color-holder-7)"
];

// App State
let currentHolders = [];
let currentRounds = [];
let scenarios = [];
let activeScenarioId = "sc-founders";
let exitValuation = 50000000; // $50M default exit

// DOM Elements
const txtHolderName = document.getElementById("txt-holder-name");
const txtHolderShares = document.getElementById("txt-holder-shares");
const txtHolderInvestment = document.getElementById("txt-holder-investment");
const btnAddHolder = document.getElementById("btn-add-holder");

const txtRoundName = document.getElementById("txt-round-name");
const txtRoundCash = document.getElementById("txt-round-cash");
const txtRoundPreVal = document.getElementById("txt-round-pre-val");
const txtRoundEsop = document.getElementById("txt-round-esop");
const btnAddRound = document.getElementById("btn-add-round");
const roundsList = document.getElementById("rounds-list");

const lblHeaderValuation = document.getElementById("lbl-header-valuation");
const lblPostMoney = document.getElementById("lbl-post-money");
const lblTotalShares = document.getElementById("lbl-total-shares");
const lblEsopPct = document.getElementById("lbl-esop-pct");
const lblDilution = document.getElementById("lbl-dilution");

const equityPieSvg = document.getElementById("equity-pie-svg");
const pieLegend = document.getElementById("pie-legend");

const sliderExit = document.getElementById("slider-exit");
const lblExitVal = document.getElementById("lbl-exit-val");

const capTableBody = document.getElementById("cap-table-body");

const txtScenarioName = document.getElementById("txt-scenario-name");
const btnSaveScenario = document.getElementById("btn-save-scenario");
const scenarioList = document.getElementById("scenario-list");
const btnResetWorkspace = document.getElementById("btn-reset-workspace");
const recommendationsFeed = document.getElementById("recommendations-feed");

// CREATE TOOLTIP
const tooltip = document.createElement("div");
tooltip.className = "chart-tooltip";
document.body.appendChild(tooltip);

// INITIALIZATION
window.addEventListener("DOMContentLoaded", () => {
  loadScenarios();
  setupEventListeners();
  loadScenarioDetails(activeScenarioId);
});

// Load models from localStorage
function loadScenarios() {
  const stored = localStorage.getItem("captable_pro_scenarios");
  if (stored) {
    try {
      scenarios = JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing scenarios", e);
      scenarios = [...DEFAULT_SCENARIOS];
    }
  } else {
    scenarios = [...DEFAULT_SCENARIOS];
    saveToStorage(false);
  }
}

function saveToStorage(shouldUpdate = true) {
  localStorage.setItem("captable_pro_scenarios", JSON.stringify(scenarios));
  if (shouldUpdate) {
    renderScenarioList();
  }
}

// Event Listeners setup
function setupEventListeners() {
  btnAddHolder.addEventListener("click", handleAddHolderSubmit);
  btnAddRound.addEventListener("click", handleAddRoundSubmit);

  // Exit valuation sliders
  sliderExit.addEventListener("input", () => {
    exitValuation = Number(sliderExit.value);
    lblExitVal.textContent = formatCurrency(exitValuation);
    calculateAndRender();
  });

  btnSaveScenario.addEventListener("click", saveCurrentScenario);
  btnResetWorkspace.addEventListener("click", resetWorkspace);
}

// CALCULATE & RENDER FULL CAP TABLE ENGINE
let calculatedCap = [];

function calculateAndRender() {
  // 1. Core Dilution Calculation Math
  // Start with a clean slate of initial holders
  let totalShares = 0;
  calculatedCap = currentHolders.map((h, index) => {
    totalShares += h.shares;
    return {
      id: h.id,
      name: h.name,
      initialShares: h.shares,
      currentShares: h.shares,
      investment: h.investment,
      color: SHAREHOLDER_COLORS[index % SHAREHOLDER_COLORS.length],
      type: "Holder"
    };
  });

  // Keep track of option pools
  let esopShares = 0;

  // Process financing rounds sequentially
  currentRounds.forEach(round => {
    const cash = round.cash;
    const preVal = round.preVal;
    const postVal = preVal + cash;
    
    // Dilution from investor Cash
    const investorPct = cash / postVal;
    
    // Target ESOP pool percentage
    const targetEsopPct = round.esop / 100;

    // Fully Diluted math:
    // Post-Round total shares = Pre-Round total shares / (1 - investorPct - targetEsopPct)
    // New Investor Shares = Post-Round total shares * investorPct
    // New ESOP Pool total shares = Post-Round total shares * targetEsopPct
    const ratio = 1 - investorPct - targetEsopPct;
    
    if (ratio > 0.05) {
      const postRoundTotalShares = (totalShares + esopShares) / ratio;
      
      // Calculate Investor Shares
      const investorShares = postRoundTotalShares * investorPct;
      
      // Calculate new target ESOP shares (ESOP pool absorbs existing option pool + expands)
      const targetEsopShares = postRoundTotalShares * targetEsopPct;

      // Add the new Investor round as a shareholder
      calculatedCap.push({
        id: "round-investor-" + round.id,
        name: `${round.name} Investor`,
        initialShares: 0,
        currentShares: Math.round(investorShares),
        investment: cash,
        color: "var(--clr-primary)",
        type: "Investor"
      });

      // Update ESOP pool shares size
      esopShares = Math.round(targetEsopShares);
      
      // Update overall shares counter
      totalShares = postRoundTotalShares - esopShares;
    }
  });

  // Calculate post-dilution totals
  const fullyDilutedTotalShares = Math.round(totalShares + esopShares);

  // Map post-dilution percentages
  calculatedCap.forEach(holder => {
    holder.percentage = fullyDilutedTotalShares > 0
      ? (holder.currentShares / fullyDilutedTotalShares) * 100
      : 0;
  });

  // Add ESOP Option Pool as a row in the cap table representation
  if (esopShares > 0) {
    calculatedCap.push({
      id: "esop-pool",
      name: "ESOP Option Pool",
      initialShares: 0,
      currentShares: esopShares,
      investment: 0,
      percentage: (esopShares / fullyDilutedTotalShares) * 100,
      color: "var(--color-esop)",
      type: "ESOP"
    });
  }

  // 2. Render Metrics summary cards
  const latestRound = currentRounds[currentRounds.length - 1];
  const postValBasis = latestRound ? (latestRound.preVal + latestRound.cash) : 0;
  
  lblPostMoney.textContent = postValBasis > 0 ? formatCurrency(postValBasis) : "Initial Stage";
  lblHeaderValuation.textContent = postValBasis > 0 ? formatCurrency(postValBasis) : "Initial Stage";
  
  lblTotalShares.textContent = formatNumber(fullyDilutedTotalShares);

  // Total ESOP percentage
  const totalEsopPct = fullyDilutedTotalShares > 0 ? (esopShares / fullyDilutedTotalShares) * 100 : 0;
  lblEsopPct.textContent = `${totalEsopPct.toFixed(1)}%`;

  // Cumulative dilution of original holders
  const initialTotalShares = currentHolders.reduce((sum, h) => sum + h.shares, 0);
  const postDilutionInitialSharesSum = calculatedCap
    .filter(h => h.id.startsWith("h")) // matches initial holders ids
    .reduce((sum, h) => sum + h.currentShares, 0);

  const initialHoldersPostPct = fullyDilutedTotalShares > 0 
    ? (postDilutionInitialSharesSum / fullyDilutedTotalShares) * 100 
    : 100;
  const cumulativeDilution = 100 - initialHoldersPostPct;
  lblDilution.textContent = `${cumulativeDilution.toFixed(1)}%`;

  // 3. Render Capitalization table lists
  renderCapTable(fullyDilutedTotalShares);

  // 4. Render SVG Pie Chart visuals
  renderPieChart();

  // 5. Render rounds lists
  renderRoundsList();

  // 6. Render recommendations
  renderRecommendations(initialHoldersPostPct, totalEsopPct);
}

// RENDER CAP TABLE LEDGERS
function renderCapTable(totalShares) {
  capTableBody.innerHTML = "";

  if (calculatedCap.length === 0) {
    capTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 1.5rem 0.5rem; color: var(--text-muted);">No stakeholders created. Add a name above to begin.</td></tr>`;
    return;
  }

  calculatedCap.forEach(holder => {
    const tr = document.createElement("tr");
    if (holder.type === "ESOP") {
      tr.className = "row-esop";
    }

    // Exit payouts math
    const payout = (exitValuation * holder.percentage) / 100;
    
    // ROI Multiple
    let roiText = "--";
    if (holder.investment > 0) {
      const roi = payout / holder.investment;
      roiText = `${roi.toFixed(1)}x`;
    }

    tr.innerHTML = `
      <td>
        <span class="legend-color" style="background: ${holder.color}; display: inline-block; vertical-align: middle; margin-right: 0.4rem;"></span>
        <strong>${escapeHtml(holder.name)}</strong>
      </td>
      <td>${formatNumber(holder.currentShares)}</td>
      <td>${holder.percentage.toFixed(2)}%</td>
      <td>${holder.investment > 0 ? formatCurrency(holder.investment) : "$0"}</td>
      <td><strong>${formatCurrency(payout)}</strong></td>
      <td class="${roiText !== "--" && (payout / holder.investment) >= 1 ? "text-emerald" : ""}">${roiText}</td>
      <td style="text-align: right;">
        ${holder.type === "Holder" ? `<button class="btn-danger-holder" onclick="deleteShareholder('${holder.id}')" title="Delete Shareholder"><i class="fa-solid fa-user-minus"></i></button>` : ""}
      </td>
    `;
    capTableBody.appendChild(tr);
  });
}

// RENDER DYNAMIC SVG PIE CHART
function renderPieChart() {
  equityPieSvg.innerHTML = "";
  pieLegend.innerHTML = "";

  const chartData = calculatedCap.filter(h => h.percentage > 0.01);
  if (chartData.length === 0) {
    equityPieSvg.innerHTML = `<circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.02)" stroke="var(--border-color)" stroke-width="1"/>`;
    return;
  }

  let accumulatedAngle = 0;
  chartData.forEach(slice => {
    const percentage = slice.percentage;
    const angle = (percentage / 100) * 360;

    // Pie slice calculations
    const cx = 100;
    const cy = 100;
    const r = 80;

    // Calculate path arc points coordinates
    const startRad = (accumulatedAngle * Math.PI) / 180;
    const endRad = ((accumulatedAngle + angle) * Math.PI) / 180;

    const startX = cx + r * Math.cos(startRad);
    const startY = cy + r * Math.sin(startRad);
    const endX = cx + r * Math.cos(endRad);
    const endY = cy + r * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    // Create Path SVG segment
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // Segment format: Move to center -> Line to start -> Arc to end -> Close path
    const d = `M ${cx} ${cy} L ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    path.setAttribute("d", d);
    path.setAttribute("fill", slice.color);
    path.setAttribute("class", "pie-slice");
    equityPieSvg.appendChild(path);

    // Event tooltips hook
    path.addEventListener("mouseenter", (e) => {
      showTooltip(e, `
        <strong>${slice.name}</strong><br>
        Ownership: ${slice.percentage.toFixed(2)}%<br>
        Shares: ${formatNumber(slice.currentShares)}<br>
        Valuation: ${formatCurrency((exitValuation * slice.percentage)/100)}
      `);
    });
    path.addEventListener("mouseleave", hideTooltip);

    accumulatedAngle += angle;

    // Legend item placement
    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";
    legendItem.innerHTML = `
      <span class="legend-color" style="background: ${slice.color}"></span>
      <span title="${escapeHtml(slice.name)}: ${slice.percentage.toFixed(1)}%">${escapeHtml(slice.name)} (${slice.percentage.toFixed(1)}%)</span>
    `;
    pieLegend.appendChild(legendItem);
  });
}

// Tooltip positioning helper
function showTooltip(e, htmlContent) {
  tooltip.innerHTML = htmlContent;
  tooltip.style.display = "block";
  
  const tooltipW = tooltip.offsetWidth;
  const tooltipH = tooltip.offsetHeight;
  
  let x = e.pageX + 15;
  let y = e.pageY - tooltipH - 10;
  
  if (x + tooltipW > window.innerWidth) {
    x = e.pageX - tooltipW - 15;
  }
  if (y < window.scrollY) {
    y = e.pageY + 20;
  }
  
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function hideTooltip() {
  tooltip.style.display = "none";
}

// RENDER PIPELINE FUNDING ROUNDS LIST
function renderRoundsList() {
  roundsList.innerHTML = "";
  if (currentRounds.length === 0) {
    roundsList.innerHTML = `<li style="font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem 0; text-align: center;">No funding rounds added yet.</li>`;
    return;
  }

  currentRounds.forEach(round => {
    const li = document.createElement("li");
    li.className = "round-item";
    li.innerHTML = `
      <div class="round-info">
        <span class="round-name">${escapeHtml(round.name)}</span>
        <span class="round-stats">Cash: ${formatCurrency(round.cash)} at ${formatCurrency(round.preVal)} Pre</span>
      </div>
      <button class="btn-delete-round" onclick="deleteRound('${round.id}')" title="Delete Round"><i class="fa-solid fa-xmark"></i></button>
    `;
    roundsList.appendChild(li);
  });
}

// ADD NEW SHAREHOLDER ACTIONS
function handleAddHolderSubmit() {
  const name = txtHolderName.value.trim();
  const shares = Math.max(1, Number(txtHolderShares.value) || 0);
  const investment = Math.max(0, Number(txtHolderInvestment.value) || 0);

  if (!name) {
    alert("Please enter a Shareholder Name.");
    return;
  }

  const newHolder = {
    id: "h-" + Date.now(),
    name: name,
    shares: shares,
    investment: investment
  };

  currentHolders.push(newHolder);
  txtHolderName.value = "";
  txtHolderShares.value = 100000;
  txtHolderInvestment.value = 0;

  activeScenarioId = null; // deselect scenario on modifications
  updateActiveScenarioHighlight();
  calculateAndRender();
}

// ADD NEW FUNDRAISING ROUND ACTIONS
function handleAddRoundSubmit() {
  const name = txtRoundName.value.trim();
  const cash = Math.max(0, Number(txtRoundCash.value) || 0);
  const preVal = Math.max(1000, Number(txtRoundPreVal.value) || 0);
  const esop = Math.max(0, Math.min(50, Number(txtRoundEsop.value) || 0));

  if (!name) {
    alert("Please enter a Round Name.");
    return;
  }

  const newRound = {
    id: "r-" + Date.now(),
    name: name,
    cash: cash,
    preVal: preVal,
    esop: esop
  };

  currentRounds.push(newRound);
  txtRoundName.value = "";
  txtRoundCash.value = 500000;
  txtRoundPreVal.value = 5000000;
  txtRoundEsop.value = 10;

  activeScenarioId = null;
  updateActiveScenarioHighlight();
  calculateAndRender();
}

// DELETE SHAREHOLDER
window.deleteShareholder = function(id) {
  if (confirm("Remove this shareholder from initial cap table?")) {
    currentHolders = currentHolders.filter(h => h.id !== id);
    activeScenarioId = null;
    updateActiveScenarioHighlight();
    calculateAndRender();
  }
};

// DELETE FUNDING ROUND
window.deleteRound = function(id) {
  if (confirm("Remove this financing round? This will restore previous dilution calculations.")) {
    currentRounds = currentRounds.filter(r => r.id !== id);
    activeScenarioId = null;
    updateActiveScenarioHighlight();
    calculateAndRender();
  }
};

// RENDER ADVISORY AND EQUITY INTELLIGENCE ALERTS
function renderRecommendations(foundersPct, esopPct) {
  recommendationsFeed.innerHTML = "";

  // 1. Founders Voting Control warnings
  const controlCard = document.createElement("div");
  if (foundersPct < 50) {
    controlCard.className = "advisory-item adv-danger";
    controlCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-scale-unbalanced-flip"></i> Voting Control Diluted</div>
      <p>Founder post-financing aggregate equity has dropped below 50% (${foundersPct.toFixed(1)}%). Consider issuing non-dilutive dual-class stock or setting voting pool alignments to keep board majority.</p>
    `;
  } else {
    controlCard.className = "advisory-item adv-success";
    controlCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-circle-check"></i> Founder Board Control</div>
      <p>Founders maintain aggregate equity of ${foundersPct.toFixed(1)}%. Voting and strategic decision controls remain consolidated.</p>
    `;
  }
  recommendationsFeed.appendChild(controlCard);

  // 2. ESOP Pool sizes alerts
  const esopCard = document.createElement("div");
  if (esopPct > 20) {
    esopCard.className = "advisory-item adv-warning";
    esopCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-users-gear"></i> Large ESOP Allocations</div>
      <p>Your Employee Option Pool represents ${esopPct.toFixed(1)}%. ESOP pools normally sit between 10% and 15%. Over-allocated ESOPs dilute founders unnecessarily before actual headcount matches projections.</p>
    `;
  } else if (esopPct < 5 && currentRounds.length > 0) {
    esopCard.className = "advisory-item adv-warning";
    esopCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-users-gear"></i> Thin Employee Pool</div>
      <p>ESOP is currently ${esopPct.toFixed(1)}%. Consider expanding the option pool in your next financing round to attract senior executive talent.</p>
    `;
  } else {
    esopCard.className = "advisory-item adv-info";
    esopCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-circle-info"></i> Balanced ESOP Pool</div>
      <p>ESOP pool is ${esopPct.toFixed(1)}%, aligning with standard startup guidelines (10-15%) for early talent hiring allocations.</p>
    `;
  }
  recommendationsFeed.appendChild(esopCard);

  // 3. ROI Highlights alert card
  const pricedInvestors = calculatedCap.filter(h => h.investment > 0);
  if (pricedInvestors.length > 0) {
    // Find best returns multiplier
    let bestHolder = null;
    let maxRoi = 0;
    
    pricedInvestors.forEach(h => {
      const payout = (exitValuation * h.percentage) / 100;
      const roi = payout / h.investment;
      if (roi > maxRoi) {
        maxRoi = roi;
        bestHolder = h;
      }
    });

    if (bestHolder && maxRoi >= 1) {
      const roiCard = document.createElement("div");
      roiCard.className = "advisory-item adv-success";
      roiCard.innerHTML = `
        <div class="advisory-title"><i class="fa-solid fa-money-bill-trend-up"></i> Return Highlights</div>
        <p>At a $${formatNumberShort(exitValuation)} exit, <strong>${bestHolder.name}</strong> leads returns yielding a <strong>${maxRoi.toFixed(1)}x</strong> multiplier ($${formatNumberShort((exitValuation * bestHolder.percentage)/100)} payout).</p>
      `;
      recommendationsFeed.appendChild(roiCard);
    }
  }
}

// SCENARIO MODELS LOADS / SAVES
function renderScenarioList() {
  scenarioList.innerHTML = "";
  
  if (scenarios.length === 0) {
    scenarioList.innerHTML = `<li style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 0.5rem 0;">No saved cap models.</li>`;
    return;
  }

  scenarios.forEach(sc => {
    const li = document.createElement("li");
    li.className = `scenario-item ${sc.id === activeScenarioId ? "active-scenario" : ""}`;
    li.innerHTML = `
      <span class="scenario-name" title="${escapeHtml(sc.name)}">${escapeHtml(sc.name)}</span>
      <button class="btn-delete-scenario" title="Delete Model"><i class="fa-solid fa-trash-can"></i></button>
    `;

    // Click load scenario details
    li.addEventListener("click", (e) => {
      if (e.target.tagName !== "I" && e.target.tagName !== "BUTTON") {
        loadScenarioDetails(sc.id);
      }
    });

    // Delete scenario snapshot
    li.querySelector(".btn-delete-scenario").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteScenario(sc.id);
    });

    scenarioList.appendChild(li);
  });
}

function loadScenarioDetails(id) {
  const sc = scenarios.find(s => s.id === id);
  if (!sc) return;

  activeScenarioId = id;
  currentHolders = [...sc.holders];
  currentRounds = [...sc.rounds];

  updateActiveScenarioHighlight();
  calculateAndRender();
}

function updateActiveScenarioHighlight() {
  document.querySelectorAll(".scenario-item").forEach(item => {
    item.classList.remove("active-scenario");
  });
  if (activeScenarioId) {
    renderScenarioList();
  }
}

function saveCurrentScenario() {
  const name = txtScenarioName.value.trim();
  if (!name) {
    alert("Please enter a Scenario Name first.");
    return;
  }

  const id = "sc-" + Date.now();
  const snapshot = {
    id: id,
    name: name,
    holders: [...currentHolders],
    rounds: [...currentRounds]
  };

  scenarios.push(snapshot);
  txtScenarioName.value = "";
  activeScenarioId = id;

  saveToStorage();
  calculateAndRender();
}

function deleteScenario(id) {
  if (confirm("Delete this saved cap table model?")) {
    scenarios = scenarios.filter(s => s.id !== id);
    if (activeScenarioId === id) {
      activeScenarioId = null;
    }
    saveToStorage();
    calculateAndRender();
  }
}

function resetWorkspace() {
  if (confirm("Restoring cap table configurations to baseline defaults?")) {
    scenarios = [...DEFAULT_SCENARIOS];
    activeScenarioId = "sc-founders";
    saveToStorage();
    loadScenarioDetails("sc-founders");
  }
}

// HELPERS
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(num);
}

function formatNumberShort(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + "k";
  }
  return num;
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
