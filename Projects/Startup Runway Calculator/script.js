// Startup Runway Calculator - Interaction Script

// Predefined Scenario Snapshot Templates
const DEFAULT_SCENARIOS = [
  {
    id: "sc-baseline",
    name: "Current Baseline Plan",
    cash: 500000,
    revenue: 25000,
    growth: 5,
    payroll: 40000,
    marketing: 8000,
    saas: 3000,
    rent: 4000,
    misc: 2000
  },
  {
    id: "sc-bootstrap",
    name: "Bootstrapped Slow Burn",
    cash: 250000,
    revenue: 15000,
    growth: 2,
    payroll: 18000,
    marketing: 2000,
    saas: 1500,
    rent: 1500,
    misc: 1000
  },
  {
    id: "sc-aggressive",
    name: "Aggressive Growth Push",
    cash: 800000,
    revenue: 40000,
    growth: 12,
    payroll: 85000,
    marketing: 25000,
    saas: 8000,
    rent: 8000,
    misc: 5000
  }
];

// App State
let scenarios = [];
let activeScenarioId = "sc-baseline";

// Date configuration (Base date is June 2026)
const BASE_YEAR = 2026;
const BASE_MONTH = 5; // 0-indexed (June is 5)
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// DOM Elements
const txtCash = document.getElementById("txt-cash");
const txtRevenue = document.getElementById("txt-revenue");
const sliderGrowth = document.getElementById("slider-growth");
const lblGrowthVal = document.getElementById("lbl-growth-val");

const txtPayroll = document.getElementById("txt-payroll");
const txtMarketing = document.getElementById("txt-marketing");
const txtSaas = document.getElementById("txt-saas");
const txtRent = document.getElementById("txt-rent");
const txtMisc = document.getElementById("txt-misc");

const lblHeaderStatus = document.getElementById("lbl-header-status");
const lblRunway = document.getElementById("lbl-runway");
const lblRunwayUrgency = document.getElementById("lbl-runway-urgency");
const lblNetBurn = document.getElementById("lbl-net-burn");
const lblZeroDate = document.getElementById("lbl-zero-date");
const lblClassification = document.getElementById("lbl-classification");

const forecastTableBody = document.getElementById("forecast-table-body");
const svgElement = document.getElementById("projection-svg");
const chartContainer = document.getElementById("chart-container");

const txtScenarioName = document.getElementById("txt-scenario-name");
const btnSaveScenario = document.getElementById("btn-save-scenario");
const scenarioList = document.getElementById("scenario-list");
const btnResetWorkspace = document.getElementById("btn-reset-workspace");
const recommendationsFeed = document.getElementById("recommendations-feed");

// CREATE TOOLTIP ELEMENT
let tooltip = document.createElement("div");
tooltip.className = "chart-tooltip";
document.body.appendChild(tooltip);

// INITIALIZATION
window.addEventListener("DOMContentLoaded", () => {
  loadScenarios();
  setupEventListeners();
  calculateAndRender();
});

// Load saved snapshots or seeds
function loadScenarios() {
  const stored = localStorage.getItem("runwaysync_scenarios");
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
  localStorage.setItem("runwaysync_scenarios", JSON.stringify(scenarios));
  if (shouldUpdate) {
    renderScenarioList();
  }
}

// Event Listeners setup
function setupEventListeners() {
  const inputs = [txtCash, txtRevenue, txtPayroll, txtMarketing, txtSaas, txtRent, txtMisc];
  
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      activeScenarioId = null; // deselect saved scenario on modifications
      updateActiveScenarioHighlight();
      calculateAndRender();
    });
  });

  sliderGrowth.addEventListener("input", () => {
    lblGrowthVal.textContent = `${sliderGrowth.value}%`;
    activeScenarioId = null;
    updateActiveScenarioHighlight();
    calculateAndRender();
  });

  // Scenario buttons
  btnSaveScenario.addEventListener("click", saveCurrentScenario);
  btnResetWorkspace.addEventListener("click", resetWorkspace);

  // Resize window triggers chart updates
  window.addEventListener("resize", renderChart);
}

// MAIN CALCULATOR ENGINE
let monthlyData = [];

function calculateAndRender() {
  // 1. Read input values
  const cash = Math.max(0, Number(txtCash.value) || 0);
  const revenue = Math.max(0, Number(txtRevenue.value) || 0);
  const growth = Number(sliderGrowth.value) || 0;

  const payroll = Math.max(0, Number(txtPayroll.value) || 0);
  const marketing = Math.max(0, Number(txtMarketing.value) || 0);
  const saas = Math.max(0, Number(txtSaas.value) || 0);
  const rent = Math.max(0, Number(txtRent.value) || 0);
  const misc = Math.max(0, Number(txtMisc.value) || 0);

  const totalOpEx = payroll + marketing + saas + rent + misc;

  // 2. Perform 24-Month Forecast Projection
  monthlyData = [];
  let currentCash = cash;
  let currentRevenue = revenue;
  let hasDepleted = false;
  let zeroCashMonthIndex = -1;

  for (let m = 0; m <= 24; m++) {
    // Rev growth compounds monthly (Month 0 is baseline starting metrics)
    if (m > 0) {
      currentRevenue = currentRevenue * (1 + growth / 100);
    }
    
    const netBurn = totalOpEx - currentRevenue;
    const startingCash = currentCash;
    
    if (currentCash > 0) {
      currentCash = currentCash - netBurn;
      if (currentCash <= 0) {
        currentCash = 0;
        if (!hasDepleted) {
          hasDepleted = true;
          zeroCashMonthIndex = m;
        }
      }
    } else {
      currentCash = 0;
    }

    monthlyData.push({
      monthIndex: m,
      monthName: getProjectedMonthName(m),
      startingCash: startingCash,
      revenue: currentRevenue,
      opex: totalOpEx,
      netBurn: netBurn,
      endingCash: currentCash
    });
  }

  // 3. Compute Runway length (Granular Months)
  let runwayMonths = 0;
  let isProfitable = false;
  let isAlive = false;

  // Evaluate if startup is already profitable or default alive
  if (revenue >= totalOpEx && growth >= 0) {
    isProfitable = true;
    isAlive = true;
    runwayMonths = Infinity;
  } else {
    // If not immediately profitable, simulate forward up to 120 months to find if growth saves them
    let simCash = cash;
    let simRev = revenue;
    let simDepleted = false;
    let simMonths = 0;

    while (simMonths < 120) {
      simMonths++;
      simRev = simRev * (1 + growth / 100);
      const simBurn = totalOpEx - simRev;

      if (simRev >= totalOpEx) {
        // Profitable crossover reached before cash depletion
        isAlive = true;
        break;
      }

      if (simCash > 0) {
        const prevCash = simCash;
        simCash -= simBurn;
        if (simCash <= 0) {
          simDepleted = true;
          // Calculate fractional month of survival
          runwayMonths = (simMonths - 1) + (prevCash / simBurn);
          break;
        }
      } else {
        simDepleted = true;
        runwayMonths = simMonths - 1;
        break;
      }
    }

    if (!simDepleted && simMonths >= 120) {
      isAlive = true;
      runwayMonths = Infinity;
    }
  }

  // 4. Update metrics dashboard text labels
  // Burn (Month 1 baseline burn)
  const initialBurn = totalOpEx - revenue;
  lblNetBurn.textContent = formatCurrency(initialBurn);
  
  if (initialBurn > 0) {
    lblNetBurn.className = "m-val text-rose";
  } else {
    lblNetBurn.className = "m-val text-emerald";
    lblNetBurn.textContent = "+" + formatCurrency(Math.abs(initialBurn));
  }

  // Runway Remaining label
  if (runwayMonths === Infinity) {
    lblRunway.textContent = "∞ (Infinite)";
    lblRunway.className = "m-val text-emerald";
    lblRunwayUrgency.textContent = "Revenue exceeds expenses";
    lblZeroDate.textContent = "N/A";
    lblZeroDate.className = "m-val text-emerald";
    lblClassification.textContent = "Profitable";
    lblClassification.className = "m-val text-emerald";
    
    lblHeaderStatus.textContent = "DEFAULT ALIVE";
    lblHeaderStatus.className = "status-indicator status-green";
  } else {
    lblRunway.textContent = `${runwayMonths.toFixed(1)} mo`;
    
    // Classify Urgency alerts color
    if (runwayMonths < 6) {
      lblRunway.className = "m-val text-rose";
      lblRunwayUrgency.textContent = "Critical cash runway";
      lblZeroDate.className = "m-val text-rose";
    } else if (runwayMonths <= 12) {
      lblRunway.className = "m-val text-amber";
      lblRunwayUrgency.textContent = "Caution cash runway";
      lblZeroDate.className = "m-val text-amber";
    } else {
      lblRunway.className = "m-val text-emerald";
      lblRunwayUrgency.textContent = "Stable cash runway";
      lblZeroDate.className = "m-val text-emerald";
    }

    // Set zero-cash date text
    const zeroDate = getProjectedDateFromMonths(runwayMonths);
    lblZeroDate.textContent = zeroDate;

    // Set Default Alive vs Dead status
    if (isAlive) {
      lblClassification.textContent = "Default Alive";
      lblClassification.className = "m-val text-emerald";
      lblHeaderStatus.textContent = "DEFAULT ALIVE";
      lblHeaderStatus.className = "status-indicator status-green";
    } else {
      lblClassification.textContent = "Default Dead";
      lblClassification.className = "m-val text-rose";
      lblHeaderStatus.textContent = "DEFAULT DEAD";
      lblHeaderStatus.className = "status-indicator status-red";
    }
  }

  // 5. Populate Monthly ledgers table
  renderForecastTable();

  // 6. Draw dynamic forecast SVG line chart
  renderChart();

  // 7. Render Scenario Vault list
  renderScenarioList();

  // 8. Render Runway recommendations feed
  renderRecommendations(runwayMonths, totalOpEx, payroll, marketing, saas, growth);
}

// Monthly Forecast Data Table
function renderForecastTable() {
  forecastTableBody.innerHTML = "";
  monthlyData.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${row.monthName}</strong></td>
      <td>${formatCurrency(row.startingCash)}</td>
      <td>${formatCurrency(row.revenue)}</td>
      <td>${formatCurrency(row.opex)}</td>
      <td class="${row.netBurn > 0 ? "text-rose" : "text-emerald"}">${row.netBurn > 0 ? "-" : "+"}${formatCurrency(Math.abs(row.netBurn))}</td>
      <td><strong>${formatCurrency(row.endingCash)}</strong></td>
    `;
    forecastTableBody.appendChild(tr);
  });
}

// Render dynamic forecasting SVG line chart
function renderChart() {
  svgElement.innerHTML = "";
  
  const w = svgElement.clientWidth || 800;
  const h = 320;
  const paddingLeft = 70;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartW = w - paddingLeft - paddingRight;
  const chartH = h - paddingTop - paddingBottom;

  // Calculate scales Y-max
  const maxCash = Math.max(...monthlyData.map(d => d.startingCash), ...monthlyData.map(d => d.endingCash), 100000);
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 10000);
  const yMax = Math.max(maxCash, maxRevenue * 1.2);

  // Draw Grid Lines (Horizontal and Vertical)
  const gridCountY = 5;
  for (let i = 0; i <= gridCountY; i++) {
    const yVal = yMax * (i / gridCountY);
    const yPos = paddingTop + chartH - (yVal / yMax) * chartH;
    
    // Gridline path
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", paddingLeft);
    line.setAttribute("y1", yPos);
    line.setAttribute("x2", w - paddingRight);
    line.setAttribute("y2", yPos);
    line.setAttribute("class", "grid-line");
    svgElement.appendChild(line);

    // Label Text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", paddingLeft - 10);
    text.setAttribute("y", yPos + 4);
    text.setAttribute("text-anchor", "end");
    text.setAttribute("class", "axis-label");
    text.textContent = formatCurrencyShort(yVal);
    svgElement.appendChild(text);
  }

  // Draw X-axis labels
  const labelInterval = 4;
  monthlyData.forEach((d, i) => {
    const xPos = paddingLeft + (i / 24) * chartW;
    
    // Vertical grid ticks
    if (i % labelInterval === 0 || i === 24) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", xPos);
      line.setAttribute("y1", paddingTop);
      line.setAttribute("x2", xPos);
      line.setAttribute("y2", paddingTop + chartH);
      line.setAttribute("class", "grid-line");
      svgElement.appendChild(line);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", xPos);
      text.setAttribute("y", paddingTop + chartH + 20);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("class", "axis-label");
      text.textContent = d.monthName;
      svgElement.appendChild(text);
    }
  });

  // Axis lines
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", paddingLeft);
  xAxis.setAttribute("y1", paddingTop + chartH);
  xAxis.setAttribute("x2", w - paddingRight);
  xAxis.setAttribute("y2", paddingTop + chartH);
  xAxis.setAttribute("class", "axis-line");
  svgElement.appendChild(xAxis);

  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", paddingLeft);
  yAxis.setAttribute("y1", paddingTop);
  yAxis.setAttribute("x2", paddingLeft);
  yAxis.setAttribute("y2", paddingTop + chartH);
  yAxis.setAttribute("class", "axis-line");
  svgElement.appendChild(yAxis);

  // Draw Revenue Line path
  let revPathPoints = "";
  monthlyData.forEach((d, i) => {
    const x = paddingLeft + (i / 24) * chartW;
    const y = paddingTop + chartH - (d.revenue / yMax) * chartH;
    revPathPoints += `${i === 0 ? "M" : "L"} ${x} ${y}`;
  });

  const revPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  revPath.setAttribute("d", revPathPoints);
  revPath.setAttribute("class", "line-revenue");
  svgElement.appendChild(revPath);

  // Draw Cash Projection Line path
  let cashPathPoints = "";
  let crossoverX = null;
  let crossoverY = null;
  let zeroCashIndex = -1;

  monthlyData.forEach((d, i) => {
    const x = paddingLeft + (i / 24) * chartW;
    const y = paddingTop + chartH - (d.endingCash / yMax) * chartH;
    
    cashPathPoints += `${i === 0 ? "M" : "L"} ${x} ${y}`;

    if (d.endingCash === 0 && zeroCashIndex === -1 && i > 0 && monthlyData[i-1].endingCash > 0) {
      zeroCashIndex = i;
      // Interpolate depletion intersection
      const prevX = paddingLeft + ((i - 1) / 24) * chartW;
      const prevY = paddingTop + chartH - (monthlyData[i-1].endingCash / yMax) * chartH;
      const diffCash = monthlyData[i-1].endingCash;
      const burn = monthlyData[i].netBurn;
      const frac = diffCash / burn;

      crossoverX = prevX + frac * (x - prevX);
      crossoverY = paddingTop + chartH; // Y coordinate is bottom axis
    }
  });

  const cashPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  cashPath.setAttribute("d", cashPathPoints);
  cashPath.setAttribute("class", "line-cash");
  svgElement.appendChild(cashPath);

  // Draw Crossover Dot (Zero cash date indicator)
  if (crossoverX !== null) {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", crossoverX);
    dot.setAttribute("cy", crossoverY);
    dot.setAttribute("class", "chart-dot dot-cash-depletion");
    dot.setAttribute("title", "Cash Depletion Date");
    svgElement.appendChild(dot);

    dot.addEventListener("mouseenter", (e) => {
      showTooltip(e, `<strong>Cash Depletion Intersection</strong><br>Runway ends here.`);
    });
    dot.addEventListener("mouseleave", hideTooltip);
  }

  // Draw Hover Dots/Nodes for Tooltips details
  monthlyData.forEach((d, i) => {
    const x = paddingLeft + (i / 24) * chartW;
    const yCash = paddingTop + chartH - (d.endingCash / yMax) * chartH;

    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", yCash);
    dot.setAttribute("r", 4);
    dot.setAttribute("fill", "#0ea5e9");
    dot.setAttribute("stroke", "#ffffff");
    dot.setAttribute("stroke-width", "1");
    dot.setAttribute("opacity", "0");
    dot.setAttribute("style", "cursor: pointer; pointer-events: all;");
    svgElement.appendChild(dot);

    // Event hooks
    dot.addEventListener("mouseenter", (e) => {
      dot.setAttribute("opacity", "1");
      dot.setAttribute("r", 6);
      showTooltip(e, `
        <strong>${d.monthName} Forecast</strong><br>
        Starting Cash: ${formatCurrency(d.startingCash)}<br>
        Revenue: ${formatCurrency(d.revenue)}<br>
        OpEx: ${formatCurrency(d.opex)}<br>
        Net Burn: ${d.netBurn > 0 ? "" : "+"}${formatCurrency(-d.netBurn)}<br>
        Ending Cash: ${formatCurrency(d.endingCash)}
      `);
    });

    dot.addEventListener("mouseleave", () => {
      dot.setAttribute("opacity", "0");
      dot.setAttribute("r", 4);
      hideTooltip();
    });
  });
}

// Tooltip helpers
function showTooltip(e, htmlContent) {
  tooltip.innerHTML = htmlContent;
  tooltip.style.display = "block";
  
  // Position tooltip relative to screen dimensions
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

// Helper date generator
function getProjectedMonthName(monthsFromNow) {
  const date = new Date(BASE_YEAR, BASE_MONTH + monthsFromNow, 1);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function getProjectedDateFromMonths(months) {
  if (months === Infinity) return "N/A";
  const intMonths = Math.floor(months);
  const frac = months - intMonths;
  
  const date = new Date(BASE_YEAR, BASE_MONTH + intMonths, 1);
  // Interpolate day approximation
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const day = Math.max(1, Math.round(frac * daysInMonth));

  return `${MONTH_NAMES[date.getMonth()]} ${day}, ${date.getFullYear()}`;
}

// CURRENCY FORMATTERS
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatCurrencyShort(amount) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  return `$${amount}`;
}

// RUNWAY RECOMMENDATIONS ALERTS GENERATOR
function renderRecommendations(runway, totalOpEx, payroll, marketing, saas, growth) {
  recommendationsFeed.innerHTML = "";

  // 1. General Urgency Alert
  const alertCard = document.createElement("div");
  if (runway === Infinity) {
    alertCard.className = "advisory-item adv-success";
    alertCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-circle-check"></i> Sustainable Status</div>
      <p>Your startup is Default Alive. Revenue projections surpass operational expenses, creating self-sustainability without immediate external capital.</p>
    `;
  } else if (runway < 6) {
    alertCard.className = "advisory-item adv-danger";
    alertCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-triangle-exclamation"></i> Action Required!</div>
      <p>Critical runway length. Cash depletes in ${runway.toFixed(1)} months. Pause non-essential hiring immediately and seek bridge funding sources.</p>
    `;
  } else if (runway <= 12) {
    alertCard.className = "advisory-item adv-warning";
    alertCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-circle-exclamation"></i> Warning Runway</div>
      <p>Caution cash burn. Runway is ${runway.toFixed(1)} months. Optimize vendor contracts and focus marketing budgets strictly on high-converting channels.</p>
    `;
  } else {
    alertCard.className = "advisory-item adv-success";
    alertCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-circle-check"></i> Stable Health</div>
      <p>Healthy Runway of ${runway.toFixed(1)} months. You have adequate space to focus on product-market fit or launch next equity funding cycles.</p>
    `;
  }
  recommendationsFeed.appendChild(alertCard);

  // 2. OpEx Analysis Advice
  const opexCard = document.createElement("div");
  opexCard.className = "advisory-item";
  opexCard.style.borderLeftColor = "var(--clr-primary)";
  opexCard.style.background = "rgba(14, 165, 233, 0.05)";
  
  const payrollPct = totalOpEx > 0 ? Math.round((payroll / totalOpEx) * 100) : 0;
  const marketingPct = totalOpEx > 0 ? Math.round((marketing / totalOpEx) * 100) : 0;

  if (payrollPct > 65) {
    opexCard.innerHTML = `
      <div class="advisory-title" style="color: #38bdf8;"><i class="fa-solid fa-users"></i> Personnel Expense Heavy</div>
      <p>Payroll represents ${payrollPct}% of your operational cost. Consider structuring new hires on equity-heavy compensation packages to save baseline burn.</p>
    `;
  } else if (marketingPct > 25 && runway < 12) {
    opexCard.innerHTML = `
      <div class="advisory-title" style="color: #38bdf8;"><i class="fa-solid fa-bullhorn"></i> Reduce Acquisition Costs</div>
      <p>Marketing spends eat ${marketingPct}% of cash flow. Scaling down customer acquisition budgets by 30% could extend your runway by ${(runway * 0.15).toFixed(1)} months.</p>
    `;
  } else {
    opexCard.innerHTML = `
      <div class="advisory-title" style="color: #38bdf8;"><i class="fa-solid fa-scale-balanced"></i> Balanced Expenditures</div>
      <p>OpEx is evenly divided: Payroll (${payrollPct}%) and SaaS/Admin overhead. Focus operational focus on customer feedback metrics.</p>
    `;
  }
  recommendationsFeed.appendChild(opexCard);

  // 3. Growth rate advice
  if (growth > 10 && runway < 12) {
    const growthCard = document.createElement("div");
    growthCard.className = "advisory-item adv-warning";
    growthCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-rocket"></i> Over-optimistic Expansion</div>
      <p>Compounding a ${growth}% growth rate is high. If sales growth pulls back to 2%, your runway will drop instantly. Test conservative models.</p>
    `;
    recommendationsFeed.appendChild(growthCard);
  }
}

// SCENARIO VAULT CONTROLLERS
function renderScenarioList() {
  scenarioList.innerHTML = "";
  
  if (scenarios.length === 0) {
    scenarioList.innerHTML = `<li style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 0.5rem 0;">No plans saved yet.</li>`;
    return;
  }

  scenarios.forEach(sc => {
    const li = document.createElement("li");
    li.className = `scenario-item ${sc.id === activeScenarioId ? "active-scenario" : ""}`;
    
    li.innerHTML = `
      <span class="scenario-name" title="${escapeHtml(sc.name)}">${escapeHtml(sc.name)}</span>
      <button class="btn-delete-scenario" title="Delete Snapshot"><i class="fa-solid fa-trash-can"></i></button>
    `;

    // Click on name to load scenario details
    li.addEventListener("click", (e) => {
      if (e.target.tagName !== "I" && e.target.tagName !== "BUTTON") {
        loadScenarioDetails(sc.id);
      }
    });

    // Delete scenario button
    li.querySelector(".btn-delete-scenario").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteScenario(sc.id);
    });

    scenarioList.appendChild(li);
  });
}

// Load values from active scenario
function loadScenarioDetails(id) {
  const sc = scenarios.find(s => s.id === id);
  if (!sc) return;

  activeScenarioId = id;

  txtCash.value = sc.cash;
  txtRevenue.value = sc.revenue;
  sliderGrowth.value = sc.growth;
  lblGrowthVal.textContent = `${sc.growth}%`;

  txtPayroll.value = sc.payroll;
  txtMarketing.value = sc.marketing;
  txtSaas.value = sc.saas;
  txtRent.value = sc.rent;
  txtMisc.value = sc.misc;

  updateActiveScenarioHighlight();
  calculateAndRender();
}

// Highlight active scenario in Vault
function updateActiveScenarioHighlight() {
  document.querySelectorAll(".scenario-item").forEach(item => {
    item.classList.remove("active-scenario");
  });
  if (activeScenarioId) {
    renderScenarioList();
  }
}

// Save Current scenario Snapshot
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
    cash: Number(txtCash.value) || 0,
    revenue: Number(txtRevenue.value) || 0,
    growth: Number(sliderGrowth.value) || 0,
    payroll: Number(txtPayroll.value) || 0,
    marketing: Number(txtMarketing.value) || 0,
    saas: Number(txtSaas.value) || 0,
    rent: Number(txtRent.value) || 0,
    misc: Number(txtMisc.value) || 0
  };

  scenarios.push(snapshot);
  txtScenarioName.value = "";
  activeScenarioId = id;
  
  saveToStorage();
  calculateAndRender();
}

// Delete scenario
function deleteScenario(id) {
  if (confirm("Are you sure you want to delete this planning scenario?")) {
    scenarios = scenarios.filter(s => s.id !== id);
    if (activeScenarioId === id) {
      activeScenarioId = null;
    }
    saveToStorage();
    calculateAndRender();
  }
}

// Reset data parameters memory
function resetWorkspace() {
  if (confirm("Are you absolutely sure you want to clear scenarios? This will restore baseline templates.")) {
    scenarios = [...DEFAULT_SCENARIOS];
    activeScenarioId = "sc-baseline";
    saveToStorage();
    loadScenarioDetails("sc-baseline");
  }
}

// Escape HTML utility
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
