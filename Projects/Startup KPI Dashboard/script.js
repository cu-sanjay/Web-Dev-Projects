// Startup KPI Dashboard - Interaction Logic

// Predefined Scenario Snapshot Templates
const DEFAULT_SCENARIOS = [
  {
    id: "sc-baseline",
    name: "SaaS Baseline Plan",
    mrr: 50000,
    newMrr: 8000,
    arpa: 100,
    cac: 600,
    churn: 5
  },
  {
    id: "sc-product-led",
    name: "Low-Touch / Product-Led",
    mrr: 120000,
    newMrr: 15000,
    arpa: 30,
    cac: 90,
    churn: 3
  },
  {
    id: "sc-enterprise",
    name: "Enterprise High-Touch",
    mrr: 25000,
    newMrr: 10000,
    arpa: 2000,
    cac: 12000,
    churn: 1
  }
];

// Month names list
const MONTHS = ["Baseline", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", "Month 7", "Month 8", "Month 9", "Month 10", "Month 11", "Month 12"];

// App State
let scenarios = [];
let activeScenarioId = "sc-baseline";
let monthlyProjections = [];

// DOM Elements
const txtMrr = document.getElementById("txt-mrr");
const txtNewMrr = document.getElementById("txt-new-mrr");
const txtArpa = document.getElementById("txt-arpa");
const txtCac = document.getElementById("txt-cac");
const sliderChurn = document.getElementById("slider-churn");
const lblChurnVal = document.getElementById("lbl-churn-val");

const lblHeaderArr = document.getElementById("lbl-header-arr");
const lblPostMoney = document.getElementById("lbl-post-money");
const lblTotalShares = document.getElementById("lbl-total-shares");
const lblEsopPct = document.getElementById("lbl-esop-pct");
const lblDilution = document.getElementById("lbl-dilution");

const svgElement = document.getElementById("growth-chart-svg");
const chartContainer = document.getElementById("chart-container");
const forecastTableBody = document.getElementById("forecast-table-body");

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

// Load saved snapshots
function loadScenarios() {
  const stored = localStorage.getItem("kpisync_scenarios");
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
  localStorage.setItem("kpisync_scenarios", JSON.stringify(scenarios));
  if (shouldUpdate) {
    renderScenarioList();
  }
}

// Event Listeners setup
function setupEventListeners() {
  const inputs = [txtMrr, txtNewMrr, txtArpa, txtCac];
  
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      activeScenarioId = null;
      updateActiveScenarioHighlight();
      calculateAndRender();
    });
  });

  sliderChurn.addEventListener("input", () => {
    lblChurnVal.textContent = `${sliderChurn.value}%`;
    activeScenarioId = null;
    updateActiveScenarioHighlight();
    calculateAndRender();
  });

  btnSaveScenario.addEventListener("click", saveCurrentScenario);
  btnResetWorkspace.addEventListener("click", resetWorkspace);
  window.addEventListener("resize", renderChart);
}

// MAIN PROJECTIONS ENGINE
function calculateAndRender() {
  // 1. Read input values
  const mrr = Math.max(0, Number(txtMrr.value) || 0);
  const newMrr = Math.max(0, Number(txtNewMrr.value) || 0);
  const arpa = Math.max(1, Number(txtArpa.value) || 1);
  const cac = Math.max(1, Number(txtCac.value) || 1);
  const churn = Math.max(0, Math.min(100, Number(sliderChurn.value) || 0));

  // 2. Compute Unit Economics Metrics
  // Customer Lifetime Value (LTV) = ARPA / Churn
  let ltv = 0;
  let ltvCac = 0;
  
  if (churn > 0) {
    ltv = arpa / (churn / 100);
    ltvCac = ltv / cac;
  } else {
    ltv = Infinity;
    ltvCac = Infinity;
  }

  // CAC Payback Period (mo) = CAC / ARPA
  const payback = cac / arpa;

  // Render Stats Grid
  // LTV:CAC display
  const lblLtvCac = document.getElementById("lbl-ltv-cac");
  const lblLtvCacSub = document.getElementById("lbl-ltv-cac-sub");
  if (ltvCac === Infinity) {
    lblLtvCac.textContent = "∞ (Infinite)";
    lblLtvCac.className = "m-val text-emerald";
    lblLtvCacSub.textContent = "0% Churn economics";
  } else {
    lblLtvCac.textContent = `${ltvCac.toFixed(1)}x`;
    if (ltvCac < 1.5) {
      lblLtvCac.className = "m-val text-rose";
      lblLtvCacSub.textContent = "Danger unit economics";
    } else if (ltvCac < 3.0) {
      lblLtvCac.className = "m-val text-amber";
      lblLtvCacSub.textContent = "Improvement required";
    } else {
      lblLtvCac.className = "m-val text-emerald";
      lblLtvCacSub.textContent = "Healthy unit economics";
    }
  }

  // LTV display
  const lblLtv = document.getElementById("lbl-ltv");
  lblLtv.textContent = ltv === Infinity ? "∞" : formatCurrency(ltv);

  // Payback display
  const lblPayback = document.getElementById("lbl-payback");
  const lblPaybackSub = document.getElementById("lbl-payback-sub");
  lblPayback.textContent = `${payback.toFixed(1)} mo`;
  if (payback <= 12) {
    lblPayback.className = "m-val text-emerald";
    lblPaybackSub.textContent = "Fast payback pace";
  } else if (payback <= 18) {
    lblPayback.className = "m-val text-amber";
    lblPaybackSub.textContent = "Moderate payback pace";
  } else {
    lblPayback.className = "m-val text-rose";
    lblPaybackSub.textContent = "Slow payback pace";
  }

  // ARR display
  const lblArr = document.getElementById("lbl-arr");
  const currentArr = mrr * 12;
  lblArr.textContent = formatCurrency(currentArr);
  lblHeaderArr.textContent = formatCurrency(currentArr);

  // 3. Generate 12-Month Projections
  monthlyProjections = [];
  let currentCustomers = mrr / arpa;
  let currentMrr = mrr;

  // Month 0 (Starting Baseline)
  monthlyProjections.push({
    monthIndex: 0,
    monthName: MONTHS[0],
    startingCustomers: currentCustomers,
    startingMrr: currentMrr,
    newCustomers: 0,
    newMrr: 0,
    churnedCustomers: 0,
    churnedMrr: 0,
    endingCustomers: currentCustomers,
    endingMrr: currentMrr
  });

  for (let m = 1; m <= 12; m++) {
    const startCustomers = currentCustomers;
    const startMrr = currentMrr;

    // SaaS growth accountings
    const newCustomersAdded = newMrr / arpa;
    const churnedCust = startCustomers * (churn / 100);
    
    currentCustomers = startCustomers + newCustomersAdded - churnedCust;
    if (currentCustomers < 0) currentCustomers = 0;

    const churnedRevenue = startMrr * (churn / 100);
    currentMrr = startMrr + newMrr - churnedRevenue;
    if (currentMrr < 0) currentMrr = 0;

    monthlyProjections.push({
      monthIndex: m,
      monthName: MONTHS[m],
      startingCustomers: startCustomers,
      startingMrr: startMrr,
      newCustomers: newCustomersAdded,
      newMrr: newMrr,
      churnedCustomers: churnedCust,
      churnedMrr: churnedRevenue,
      endingCustomers: currentCustomers,
      endingMrr: currentMrr
    });
  }

  // 4. Populate Ledgers Table
  renderForecastTable();

  // 5. Draw Dual-Axis Forecasting chart
  renderChart();

  // 6. Draw scenario lists
  renderScenarioList();

  // 7. Dynamic recommendations
  renderRecommendations(ltvCac, payback, churn, arpa);
}

// Monthly LEDGERS Data Table
function renderForecastTable() {
  forecastTableBody.innerHTML = "";
  // Skip month 0 in display for clean 12-month projections sheet, or display all
  monthlyProjections.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${row.monthName}</strong></td>
      <td>${formatNumber(row.startingCustomers)}</td>
      <td>${formatCurrency(row.startingMrr)}</td>
      <td>+${formatCurrency(row.newMrr)}</td>
      <td class="text-rose">-${formatCurrency(row.churnedMrr)}</td>
      <td><strong>${formatNumber(row.endingCustomers)}</strong></td>
      <td><strong>${formatCurrency(row.endingMrr)}</strong></td>
    `;
    forecastTableBody.appendChild(tr);
  });
}

// Draw Dual Axis SVG chart Visuals (MRR Line + Customers Bars)
function renderChart() {
  svgElement.innerHTML = "";

  const w = svgElement.clientWidth || 800;
  const h = 320;
  const paddingLeft = 70;
  const paddingRight = 70;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartW = w - paddingLeft - paddingRight;
  const chartH = h - paddingTop - paddingBottom;

  // Calculate scales
  // Left Axis: MRR ($)
  const maxMrr = Math.max(...monthlyProjections.map(d => d.endingMrr), 1000);
  const yMaxLeft = maxMrr * 1.1;

  // Right Axis: Customers count
  const maxCust = Math.max(...monthlyProjections.map(d => d.endingCustomers), 10);
  const yMaxRight = maxCust * 1.1;

  // Draw Grid Lines (Left Y axis)
  const gridCountY = 5;
  for (let i = 0; i <= gridCountY; i++) {
    const yValLeft = yMaxLeft * (i / gridCountY);
    const yPos = paddingTop + chartH - (yValLeft / yMaxLeft) * chartH;
    
    // Grid tick lines
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", paddingLeft);
    line.setAttribute("y1", yPos);
    line.setAttribute("x2", w - paddingRight);
    line.setAttribute("y2", yPos);
    line.setAttribute("class", "grid-line");
    svgElement.appendChild(line);

    // Left Y label (MRR)
    const textLeft = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textLeft.setAttribute("x", paddingLeft - 10);
    textLeft.setAttribute("y", yPos + 4);
    textLeft.setAttribute("text-anchor", "end");
    textLeft.setAttribute("class", "axis-label");
    textLeft.textContent = formatCurrencyShort(yValLeft);
    svgElement.appendChild(textLeft);

    // Right Y label (Customers count)
    const yValRight = yMaxRight * (i / gridCountY);
    const textRight = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textRight.setAttribute("x", w - paddingRight + 10);
    textRight.setAttribute("y", yPos + 4);
    textRight.setAttribute("text-anchor", "start");
    textRight.setAttribute("class", "axis-label");
    textRight.textContent = formatNumberShort(yValRight);
    svgElement.appendChild(textRight);
  }

  // Draw X axis ticks
  monthlyProjections.forEach((d, i) => {
    const xPos = paddingLeft + (i / 12) * chartW;

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", xPos);
    text.setAttribute("y", paddingTop + chartH + 20);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("class", "axis-label");
    text.textContent = d.monthName === "Baseline" ? "Base" : `M${d.monthIndex}`;
    svgElement.appendChild(text);
  });

  // Axis lines
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", paddingLeft);
  xAxis.setAttribute("y1", paddingTop + chartH);
  xAxis.setAttribute("x2", w - paddingRight);
  xAxis.setAttribute("y2", paddingTop + chartH);
  xAxis.setAttribute("class", "axis-line");
  svgElement.appendChild(xAxis);

  const yAxisLeft = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxisLeft.setAttribute("x1", paddingLeft);
  yAxisLeft.setAttribute("y1", paddingTop);
  yAxisLeft.setAttribute("x2", paddingLeft);
  yAxisLeft.setAttribute("y2", paddingTop + chartH);
  yAxisLeft.setAttribute("class", "axis-line");
  svgElement.appendChild(yAxisLeft);

  const yAxisRight = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxisRight.setAttribute("x1", w - paddingRight);
  yAxisRight.setAttribute("y1", paddingTop);
  yAxisRight.setAttribute("x2", w - paddingRight);
  yAxisRight.setAttribute("y2", paddingTop + chartH);
  yAxisRight.setAttribute("class", "axis-line");
  svgElement.appendChild(yAxisRight);

  // Draw Customers Bars (Right Y-axis scale)
  const barW = Math.max(5, (chartW / 13) * 0.5);
  monthlyProjections.forEach((d, i) => {
    const x = paddingLeft + (i / 12) * chartW;
    const barHeight = (d.endingCustomers / yMaxRight) * chartH;
    const y = paddingTop + chartH - barHeight;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x - barW / 2);
    rect.setAttribute("y", y);
    rect.setAttribute("width", barW);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("class", "chart-bar");
    svgElement.appendChild(rect);

    // Event tooltips hook
    rect.addEventListener("mouseenter", (e) => {
      showTooltip(e, `
        <strong>${d.monthName} Details</strong><br>
        Ending Customers: ${formatNumber(d.endingCustomers)}<br>
        Ending MRR: ${formatCurrency(d.endingMrr)}
      `);
    });
    rect.addEventListener("mouseleave", hideTooltip);
  });

  // Draw MRR Line (Left Y-axis scale)
  let mrrPathPoints = "";
  monthlyProjections.forEach((d, i) => {
    const x = paddingLeft + (i / 12) * chartW;
    const y = paddingTop + chartH - (d.endingMrr / yMaxLeft) * chartH;
    mrrPathPoints += `${i === 0 ? "M" : "L"} ${x} ${y}`;
  });

  const mrrPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  mrrPath.setAttribute("d", mrrPathPoints);
  mrrPath.setAttribute("class", "line-mrr");
  svgElement.appendChild(mrrPath);

  // Draw Line Dot circles
  monthlyProjections.forEach((d, i) => {
    const x = paddingLeft + (i / 12) * chartW;
    const y = paddingTop + chartH - (d.endingMrr / yMaxLeft) * chartH;

    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", y);
    dot.setAttribute("r", 4);
    dot.setAttribute("fill", "#0ea5e9");
    dot.setAttribute("stroke", "#ffffff");
    dot.setAttribute("stroke-width", "1");
    dot.setAttribute("style", "cursor: pointer;");
    svgElement.appendChild(dot);

    dot.addEventListener("mouseenter", (e) => {
      dot.setAttribute("r", 6);
      showTooltip(e, `
        <strong>${d.monthName} MRR</strong><br>
        Starting: ${formatCurrency(d.startingMrr)}<br>
        New Added: +${formatCurrency(d.newMrr)}<br>
        Churn Loss: -${formatCurrency(d.churnedMrr)}<br>
        Ending MRR: <strong>${formatCurrency(d.endingMrr)}</strong>
      `);
    });

    dot.addEventListener("mouseleave", () => {
      dot.setAttribute("r", 4);
      hideTooltip();
    });
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

// RENDER ADVISORY INTELLIGENCE ALERTS FEED
function renderRecommendations(ltvCac, payback, churn, arpa) {
  recommendationsFeed.innerHTML = "";

  // 1. Churn warnings
  const churnCard = document.createElement("div");
  if (churn > 7) {
    churnCard.className = "advisory-item adv-danger";
    churnCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-user-xmark"></i> High Customer Churn</div>
      <p>Your monthly churn rate is critical at ${churn}%. Churn is a compounding growth killer; at this rate, you cancel out new MRR inputs, leading to high revenue decay rates.</p>
    `;
  } else if (churn <= 3) {
    churnCard.className = "advisory-item adv-success";
    churnCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-circle-check"></i> Great Customer Retention</div>
      <p>Healthy monthly churn of ${churn}%. Keeping churn under 3% indicates solid product-market fit and extends average customer lifespan.</p>
    `;
  } else {
    churnCard.className = "advisory-item adv-info";
    churnCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-arrows-spin"></i> Moderate Customer Retention</div>
      <p>Standard SaaS churn rate of ${churn}%. Aim to reduce contract cancellations by optimizing user onboarding steps.</p>
    `;
  }
  recommendationsFeed.appendChild(churnCard);

  // 2. Unit economics advice LTV:CAC
  const unitCard = document.createElement("div");
  if (ltvCac === Infinity) {
    unitCard.className = "advisory-item adv-success";
    unitCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-shield-halved"></i> Infinite Viability</div>
      <p>With 0% churn, customer lifetime value is infinite. Model conservative churn metrics to find real-world limits.</p>
    `;
  } else if (ltvCac < 1.5) {
    unitCard.className = "advisory-item adv-danger";
    unitCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-scale-unbalanced-flip"></i> Unstable Economics</div>
      <p>Your LTV:CAC is ${ltvCac.toFixed(1)}x. A ratio under 1.5x means customer acquisition costs are too high relative to value. Focus on increasing ARPA or lowering CAC immediately.</p>
    `;
  } else if (ltvCac < 3.0) {
    unitCard.className = "advisory-item adv-warning";
    unitCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-scale-balanced"></i> Improve Margins</div>
      <p>LTV:CAC is ${ltvCac.toFixed(1)}x. Try extending customer retention metrics or testing higher product pricing tiers to increase ARPA.</p>
    `;
  } else {
    unitCard.className = "advisory-item adv-success";
    unitCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-shield-halved"></i> Scale Acquisitions</div>
      <p>Excellent unit economics: LTV:CAC is ${ltvCac.toFixed(1)}x. Your acquisitions are highly profitable. Suggest scaling up marketing expenditures to capture market share.</p>
    `;
  }
  recommendationsFeed.appendChild(unitCard);

  // 3. CAC Payback advice
  const paybackCard = document.createElement("div");
  if (payback > 18) {
    paybackCard.className = "advisory-item adv-danger";
    paybackCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-hourglass-half"></i> Long Payback Period</div>
      <p>CAC payback takes ${payback.toFixed(1)} months. Slow paybacks constrain cash flow, requiring external financing to fund new acquisition channels.</p>
    `;
  } else if (payback <= 12) {
    paybackCard.className = "advisory-item adv-success";
    paybackCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-bolt-lightning"></i> Rapid Payback Pace</div>
      <p>Payback period is only ${payback.toFixed(1)} months. Recovering customer acquisition costs under 12 months is top-quartile SaaS performance.</p>
    `;
  } else {
    paybackCard.className = "advisory-item adv-info";
    paybackCard.innerHTML = `
      <div class="advisory-title"><i class="fa-solid fa-hourglass-end"></i> Standard Payback Pace</div>
      <p>Recovering customer cost takes ${payback.toFixed(1)} months. Maintain operational focus on reducing sales friction.</p>
    `;
  }
  recommendationsFeed.appendChild(paybackCard);
}

// SCENARIO VAULT SNAPSHOT LISTS
function renderScenarioList() {
  scenarioList.innerHTML = "";
  
  if (scenarios.length === 0) {
    scenarioList.innerHTML = `<li style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 0.5rem 0;">No saved KPI snapshots.</li>`;
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
  txtMrr.value = sc.mrr;
  txtNewMrr.value = sc.newMrr;
  txtArpa.value = sc.arpa;
  txtCac.value = sc.cac;
  sliderChurn.value = sc.churn;
  lblChurnVal.textContent = `${sc.churn}%`;

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
    mrr: Number(txtMrr.value) || 0,
    newMrr: Number(txtNewMrr.value) || 0,
    arpa: Number(txtArpa.value) || 1,
    cac: Number(txtCac.value) || 1,
    churn: Number(sliderChurn.value) || 0
  };

  scenarios.push(snapshot);
  txtScenarioName.value = "";
  activeScenarioId = id;

  saveToStorage();
  calculateAndRender();
}

function deleteScenario(id) {
  if (confirm("Delete this saved KPI snapshot?")) {
    scenarios = scenarios.filter(s => s.id !== id);
    if (activeScenarioId === id) {
      activeScenarioId = null;
    }
    saveToStorage();
    calculateAndRender();
  }
}

function resetWorkspace() {
  if (confirm("Restore KPI metrics inputs to default baseline plan?")) {
    scenarios = [...DEFAULT_SCENARIOS];
    activeScenarioId = "sc-baseline";
    saveToStorage();
    loadScenarioDetails("sc-baseline");
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

function formatCurrencyShort(amount) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  return `$${amount}`;
}

function formatNumber(num) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);
}

function formatNumberShort(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + "k";
  }
  return num.toFixed(0);
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
