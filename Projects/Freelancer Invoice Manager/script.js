/**
 * FlowInvoice - Freelancer Invoice Manager
 * Core Application Script
 */

// ==========================================================================
// APPLICATION STATE & STORAGE INTERFACE
// ==========================================================================
let state = {
  invoices: [],
  clients: [],
  settings: {
    businessName: "PixelForge Studios",
    businessEmail: "hello@pixelforge.io",
    businessAddress: "742 Evergreen Terrace\nSpringfield, OR 97477",
    businessPhone: "+1 (555) 867-5309",
    businessWebsite: "https://pixelforge.io",
    defaultCurrency: "USD",
    defaultTax: 5.0,
    defaultTerms: 14
  }
};

const STORAGE_KEYS = {
  INVOICES: "flowinvoice_invoices",
  CLIENTS: "flowinvoice_clients",
  SETTINGS: "flowinvoice_settings",
  THEME: "flowinvoice_theme"
};

// Currency configurations for formatting helper
const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  INR: "₹",
  JPY: "¥"
};

// ==========================================================================
// INITIAL DATABASE SEED DATA
// ==========================================================================
const SEED_CLIENTS = [
  {
    id: "c-1",
    name: "Stark Industries",
    email: "pepper.potts@stark.com",
    address: "10880 Malibu Point\nMalibu, CA 90265",
    currency: "USD",
    defaultTerms: 30
  },
  {
    id: "c-2",
    name: "Wayne Enterprises",
    email: "lucius.fox@waynecorp.com",
    address: "1007 Mountain Drive\nGotham City, NJ 07001",
    currency: "USD",
    defaultTerms: 15
  },
  {
    id: "c-3",
    name: "Acme Corporation",
    email: "billing@acme.com",
    address: "Desert Route 66\nFlagstaff, AZ 86001",
    currency: "USD",
    defaultTerms: 7
  },
  {
    id: "c-4",
    name: "Cyberdyne Systems",
    email: "miles.dyson@cyberdyne.co",
    address: "18111 Nordhoff Street\nNorthridge, CA 91330",
    currency: "EUR",
    defaultTerms: 30
  }
];

function getSeedInvoices() {
  const today = new Date();
  
  // Format helpers
  const dateOffset = (days) => {
    const d = new Date();
    d.setDate(today.getDate() - days);
    return d.toISOString().split("T")[0];
  };

  return [
    {
      id: "INV-2026-001",
      clientId: "c-1",
      issueDate: dateOffset(65),
      dueDate: dateOffset(35),
      terms: 30,
      status: "paid",
      discount: 10,
      discountType: "percent",
      taxRate: 5,
      notes: "Thanks for hiring us to build the Arc Reactor visualization dashboard!",
      items: [
        { desc: "Frontend Web Interface development", type: "hours", rate: 120, qty: 40, tax: 0 },
        { desc: "Consulting & UI Wireframing", type: "flat", rate: 1500, qty: 1, tax: 0 }
      ],
      payments: [
        { date: dateOffset(40), amount: 5985.0, method: "bank-transfer" }
      ],
      total: 5985.0
    },
    {
      id: "INV-2026-002",
      clientId: "c-2",
      issueDate: dateOffset(45),
      dueDate: dateOffset(30),
      terms: 15,
      status: "paid",
      discount: 250,
      discountType: "fixed",
      taxRate: 8.5,
      notes: "Satellite navigation tracking software integration project.",
      items: [
        { desc: "Algorithm refinement & sensor API parsing", type: "hours", rate: 150, qty: 60, tax: 0 },
        { desc: "Server deployment infrastructure", type: "flat", rate: 3000, qty: 1, tax: 0 }
      ],
      payments: [
        { date: dateOffset(28), amount: 12747.5, method: "bank-transfer" }
      ],
      total: 12747.5
    },
    {
      id: "INV-2026-003",
      clientId: "c-3",
      issueDate: dateOffset(12),
      dueDate: dateOffset(5),
      terms: 7,
      status: "overdue",
      discount: 0,
      discountType: "fixed",
      taxRate: 5,
      notes: "Road Runner tracking maps upgrade package.",
      items: [
        { desc: "Custom SVG Maps drawing & testing", type: "hours", rate: 90, qty: 25, tax: 0 },
        { desc: "Rocket propulsion sound effects widget", type: "flat", rate: 600, qty: 1, tax: 0 }
      ],
      payments: [],
      total: 2992.5
    },
    {
      id: "INV-2026-004",
      clientId: "c-4",
      issueDate: dateOffset(20),
      dueDate: dateOffset(-10),
      terms: 30,
      status: "sent",
      discount: 0,
      discountType: "fixed",
      taxRate: 19,
      notes: "Neural network simulation graphics layout.",
      items: [
        { desc: "ThreeJS scene layout & shaders optimization", type: "hours", rate: 110, qty: 50, tax: 0 }
      ],
      payments: [
        { date: dateOffset(5), amount: 2000.0, method: "paypal" }
      ],
      total: 6545.0
    },
    {
      id: "INV-2026-005",
      clientId: "c-1",
      issueDate: dateOffset(2),
      dueDate: dateOffset(-28),
      terms: 30,
      status: "draft",
      discount: 5,
      discountType: "percent",
      taxRate: 5,
      notes: "Armor telemetry visualization module (Draft phase).",
      items: [
        { desc: "Initial blueprint assets design", type: "flat", rate: 1200, qty: 1, tax: 0 }
      ],
      payments: [],
      total: 1197.0
    }
  ];
}

// Initialize LocalStorage Data
function initDatabase() {
  const localInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
  const localClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  const localSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

  if (!localClients || JSON.parse(localClients).length === 0) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(SEED_CLIENTS));
    state.clients = [...SEED_CLIENTS];
  } else {
    state.clients = JSON.parse(localClients);
  }

  if (!localInvoices || JSON.parse(localInvoices).length === 0) {
    const seedInvoices = getSeedInvoices();
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(seedInvoices));
    state.invoices = seedInvoices;
  } else {
    state.invoices = JSON.parse(localInvoices);
  }

  if (!localSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  } else {
    state.settings = { ...state.settings, ...JSON.parse(localSettings) };
  }
}

function saveStateToStorage() {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(state.invoices));
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(state.clients));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
}

// ==========================================================================
// UTILITY FUNCTIONS & HELPERS
// ==========================================================================
function formatCurrency(amount, currencyCode = null) {
  const code = currencyCode || state.settings.defaultCurrency;
  const symbol = CURRENCY_SYMBOLS[code] || "$";
  return `${symbol}${parseFloat(amount).toFixed(2)}`;
}

function getClientCurrency(clientId) {
  const client = state.clients.find(c => c.id === clientId);
  return client ? client.currency : state.settings.defaultCurrency;
}

function getClientName(clientId) {
  const client = state.clients.find(c => c.id === clientId);
  return client ? client.name : "Unknown Client";
}

function getDaysOverdue(dueDateStr) {
  const due = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  due.setHours(0,0,0,0);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

function getInvoiceTotals(invoice) {
  let subtotal = 0;
  invoice.items.forEach(item => {
    const rate = parseFloat(item.rate) || 0;
    const qty = parseFloat(item.qty) || 0;
    const rowTaxRate = parseFloat(item.tax) || 0;
    const rowSub = rate * qty;
    const rowTax = rowSub * (rowTaxRate / 100);
    subtotal += rowSub + rowTax;
  });

  let discount = 0;
  const rawDiscount = parseFloat(invoice.discount) || 0;
  if (invoice.discountType === "percent") {
    discount = subtotal * (rawDiscount / 100);
  } else {
    discount = rawDiscount;
  }

  const baseAfterDiscount = Math.max(0, subtotal - discount);
  const globalTaxRate = parseFloat(invoice.taxRate) || 0;
  const tax = baseAfterDiscount * (globalTaxRate / 100);
  const grandTotal = baseAfterDiscount + tax;

  const totalPaid = invoice.payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
  const balanceDue = Math.max(0, grandTotal - totalPaid);

  return {
    subtotal,
    discount,
    tax,
    grandTotal,
    totalPaid,
    balanceDue
  };
}

// Calculate dashboard KPIs
function getDashboardMetrics() {
  let totalInvoiced = 0;
  let totalPaid = 0;
  let outstanding = 0;
  let overdue = 0;

  state.invoices.forEach(inv => {
    // Drafts do not impact aggregate business indicators
    if (inv.status === "draft") return;

    const totals = getInvoiceTotals(inv);
    
    // Outstanding & Overdue logic
    totalInvoiced += totals.grandTotal;
    totalPaid += totals.totalPaid;
    
    if (inv.status === "paid") return;

    outstanding += totals.balanceDue;

    const daysOverdue = getDaysOverdue(inv.dueDate);
    if (daysOverdue > 0 || inv.status === "overdue") {
      overdue += totals.balanceDue;
    }
  });

  return {
    totalInvoiced,
    totalPaid,
    outstanding,
    overdue
  };
}

// Check and verify overdue transitions daily
function updateInvoiceStatuses() {
  let changed = false;
  state.invoices.forEach(inv => {
    if (inv.status === "sent") {
      const days = getDaysOverdue(inv.dueDate);
      if (days > 0) {
        inv.status = "overdue";
        changed = true;
      }
    } else if (inv.status === "overdue") {
      const days = getDaysOverdue(inv.dueDate);
      if (days === 0) {
        inv.status = "sent";
        changed = true;
      }
    }
  });
  if (changed) saveStateToStorage();
}

// ==========================================================================
// DOM ELEMENT CACHE
// ==========================================================================
const DOM = {
  // Navigation elements
  navButtons: document.querySelectorAll(".nav-btn"),
  sections: document.querySelectorAll(".tab-content"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeToggleText: document.getElementById("themeToggleText"),

  // Dashboard counters
  statTotalInvoiced: document.getElementById("statTotalInvoiced"),
  statTotalPaid: document.getElementById("statTotalPaid"),
  statOutstanding: document.getElementById("statOutstanding"),
  statOverdue: document.getElementById("statOverdue"),
  actionItemsList: document.getElementById("actionItemsList"),
  alertCountBadge: document.getElementById("alertCountBadge"),
  dashboardChartContainer: document.getElementById("dashboardChartContainer"),
  recentInvoicesTableBody: document.getElementById("recentInvoicesTableBody"),
  viewAllInvoicesBtn: document.getElementById("viewAllInvoicesBtn"),

  // Invoices tab
  invoicesTableBody: document.getElementById("invoicesTableBody"),
  invoicesEmptyState: document.getElementById("invoicesEmptyState"),
  invoiceSearchInput: document.getElementById("invoiceSearchInput"),
  invoiceFilterStatus: document.getElementById("invoiceFilterStatus"),
  invoiceFilterClient: document.getElementById("invoiceFilterClient"),
  invoiceSortOrder: document.getElementById("invoiceSortOrder"),
  btnCreateInvoices: document.querySelectorAll(".btn-create-invoice"),

  // Clients tab
  clientsGrid: document.getElementById("clientsGrid"),
  clientsEmptyState: document.getElementById("clientsEmptyState"),
  addNewClientBtn: document.getElementById("addNewClientBtn"),
  clientModal: document.getElementById("clientModal"),
  clientModalTitle: document.getElementById("clientModalTitle"),
  closeClientModalBtn: document.getElementById("closeClientModalBtn"),
  clientForm: document.getElementById("clientForm"),
  clientModalIndex: document.getElementById("clientModalIndex"),
  clientNameInput: document.getElementById("clientNameInput"),
  clientEmailInput: document.getElementById("clientEmailInput"),
  clientAddressInput: document.getElementById("clientAddressInput"),
  clientCurrencyInput: document.getElementById("clientCurrencyInput"),
  clientTermsInput: document.getElementById("clientTermsInput"),
  cancelClientBtn: document.getElementById("cancelClientBtn"),

  // Settings tab
  businessProfileForm: document.getElementById("businessProfileForm"),
  settingsBizName: document.getElementById("settingsBizName"),
  settingsBizEmail: document.getElementById("settingsBizEmail"),
  settingsBizAddress: document.getElementById("settingsBizAddress"),
  settingsBizPhone: document.getElementById("settingsBizPhone"),
  settingsBizWebsite: document.getElementById("settingsBizWebsite"),
  settingsDefaultCurrency: document.getElementById("settingsDefaultCurrency"),
  settingsDefaultTax: document.getElementById("settingsDefaultTax"),
  settingsDefaultTerms: document.getElementById("settingsDefaultTerms"),
  saveWorkspaceConfigBtn: document.getElementById("saveWorkspaceConfigBtn"),
  exportBackupBtn: document.getElementById("exportBackupBtn"),
  importBackupInput: document.getElementById("importBackupInput"),
  resetDatabaseBtn: document.getElementById("resetDatabaseBtn"),

  // Invoice builder fullscreen overlay
  invoiceBuilderOverlay: document.getElementById("invoiceBuilderOverlay"),
  closeBuilderBtn: document.getElementById("closeBuilderBtn"),
  builderTitle: document.getElementById("builderTitle"),
  builderSubTitle: document.getElementById("builderSubTitle"),
  builderInvoiceStatus: document.getElementById("builderInvoiceStatus"),
  printInvoiceBtn: document.getElementById("printInvoiceBtn"),
  saveInvoiceBtn: document.getElementById("saveInvoiceBtn"),
  builderInvoiceId: document.getElementById("builderInvoiceId"),
  builderClientSelect: document.getElementById("builderClientSelect"),
  builderIssueDate: document.getElementById("builderIssueDate"),
  builderDueDate: document.getElementById("builderDueDate"),
  builderPaymentTerms: document.getElementById("builderPaymentTerms"),
  addNewLineItemBtn: document.getElementById("addNewLineItemBtn"),
  lineItemsList: document.getElementById("lineItemsList"),
  builderDiscount: document.getElementById("builderDiscount"),
  builderDiscountType: document.getElementById("builderDiscountType"),
  builderTaxOption: document.getElementById("builderTaxOption"),
  builderNotes: document.getElementById("builderNotes"),

  // Print Preview Sheet elements
  invoicePrintSheet: document.getElementById("invoicePrintSheet"),
  previewThemeSwatches: document.querySelectorAll(".preview-theme-swatch"),
  sheetCompanyLogo: document.getElementById("sheetCompanyLogo"),
  sheetCompanyName: document.getElementById("sheetCompanyName"),
  sheetCompanyDetails: document.getElementById("sheetCompanyDetails"),
  sheetInvoiceId: document.getElementById("sheetInvoiceId"),
  sheetIssueDate: document.getElementById("sheetIssueDate"),
  sheetDueDate: document.getElementById("sheetDueDate"),
  sheetTerms: document.getElementById("sheetTerms"),
  sheetClientName: document.getElementById("sheetClientName"),
  sheetClientAddress: document.getElementById("sheetClientAddress"),
  sheetClientEmail: document.getElementById("sheetClientEmail"),
  sheetStatusBadge: document.getElementById("sheetStatusBadge"),
  sheetItemsBody: document.getElementById("sheetItemsBody"),
  sheetNotes: document.getElementById("sheetNotes"),
  sheetSubtotal: document.getElementById("sheetSubtotal"),
  sheetDiscountRow: document.getElementById("sheetDiscountRow"),
  sheetDiscount: document.getElementById("sheetDiscount"),
  sheetTax: document.getElementById("sheetTax"),
  sheetGrandTotal: document.getElementById("sheetGrandTotal"),
  sheetPaidRow: document.getElementById("sheetPaidRow"),
  sheetAmountPaid: document.getElementById("sheetAmountPaid"),
  sheetBalanceRow: document.getElementById("sheetBalanceRow"),
  sheetBalance: document.getElementById("sheetBalance"),

  // Payment Log Modal
  paymentModal: document.getElementById("paymentModal"),
  closePaymentModalBtn: document.getElementById("closePaymentModalBtn"),
  paymentForm: document.getElementById("paymentForm"),
  paymentInvoiceId: document.getElementById("paymentInvoiceId"),
  paymentModalBalance: document.getElementById("paymentModalBalance"),
  paymentAmountInput: document.getElementById("paymentAmountInput"),
  paymentDateInput: document.getElementById("paymentDateInput"),
  paymentMethodInput: document.getElementById("paymentMethodInput"),
  cancelPaymentBtn: document.getElementById("cancelPaymentBtn")
};

// Builder editing target track
let activeEditingInvoiceId = null;

// ==========================================================================
// CORE APP ROUTING & THEME HANDLERS
// ==========================================================================
function initAppRouting() {
  DOM.navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      DOM.navButtons.forEach(b => b.classList.remove("active"));
      DOM.sections.forEach(s => s.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");

      // Refresh data on switching to tabs
      if (targetId === "dashboard-section") {
        renderDashboard();
      } else if (targetId === "invoices-section") {
        renderInvoicesList();
      } else if (targetId === "clients-section") {
        renderClientsGrid();
      }
    });
  });
}

function initThemeToggle() {
  // Theme load
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
  if (theme === "dark") {
    DOM.themeToggleText.textContent = "Light Mode";
  } else {
    DOM.themeToggleText.textContent = "Dark Mode";
  }
}

// ==========================================================================
// DASHBOARD RENDERING & ANALYTICS CHARTS (Dynamic inline SVG graphics)
// ==========================================================================
function renderDashboard() {
  updateInvoiceStatuses();
  const metrics = getDashboardMetrics();

  // Load KPI panels
  DOM.statTotalInvoiced.textContent = formatCurrency(metrics.totalInvoiced);
  DOM.statTotalPaid.textContent = formatCurrency(metrics.totalPaid);
  DOM.statOutstanding.textContent = formatCurrency(metrics.outstanding);
  DOM.statOverdue.textContent = formatCurrency(metrics.overdue);

  renderDashboardRecentInvoices();
  renderActionItems();
  renderEarningsChart();
}

function renderDashboardRecentInvoices() {
  // Grab top 5 newest invoices (excluding draft invoices)
  const sortedInvoices = [...state.invoices]
    .filter(inv => inv.status !== "draft")
    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
    .slice(0, 5);

  DOM.recentInvoicesTableBody.innerHTML = "";

  if (sortedInvoices.length === 0) {
    DOM.recentInvoicesTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="color: var(--text-muted); padding: 32px 0;">
          No billing history logged. Let's create your first invoice!
        </td>
      </tr>
    `;
    return;
  }

  sortedInvoices.forEach(inv => {
    const currency = getClientCurrency(inv.clientId);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>#${inv.id}</strong></td>
      <td>${getClientName(inv.clientId)}</td>
      <td>${inv.issueDate}</td>
      <td>${inv.dueDate}</td>
      <td><strong>${formatCurrency(inv.total, currency)}</strong></td>
      <td><span class="badge badge-${inv.status}">${inv.status}</span></td>
      <td class="text-right">
        <div class="header-actions" style="justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm edit-inv-btn" data-id="${inv.id}">Edit</button>
          ${inv.status !== 'paid' ? `<button class="btn btn-success btn-sm pay-inv-btn" data-id="${inv.id}">Log Pay</button>` : ''}
        </div>
      </td>
    `;
    DOM.recentInvoicesTableBody.appendChild(row);
  });

  attachTableActionButtonListeners(DOM.recentInvoicesTableBody);
}

function renderActionItems() {
  DOM.actionItemsList.innerHTML = "";
  let alerts = [];

  // 1. Gather Overdue invoices
  state.invoices.forEach(inv => {
    if (inv.status === "overdue") {
      const days = getDaysOverdue(inv.dueDate);
      alerts.push({
        type: "danger",
        title: `Invoice #${inv.id} is overdue`,
        desc: `${getClientName(inv.clientId)} owes ${formatCurrency(getInvoiceTotals(inv).balanceDue, getClientCurrency(inv.clientId))} (due ${days} days ago).`,
        actionText: "Log Payment",
        actionFn: () => openPaymentModal(inv.id)
      });
    } else if (inv.status === "sent") {
      const due = new Date(inv.dueDate);
      const today = new Date();
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 3) {
        alerts.push({
          type: "warning",
          title: `Invoice #${inv.id} is due soon`,
          desc: `${getClientName(inv.clientId)} due in ${diffDays} days (${formatCurrency(inv.total, getClientCurrency(inv.clientId))}).`,
          actionText: "View / Edit",
          actionFn: () => openInvoiceBuilder(inv.id)
        });
      }
    }
  });

  // 2. Gather Draft invoices
  state.invoices.forEach(inv => {
    if (inv.status === "draft") {
      alerts.push({
        type: "warning",
        title: `Draft Invoice #${inv.id}`,
        desc: `You have an un-sent invoice for ${getClientName(inv.clientId)}.`,
        actionText: "Finalize & Send",
        actionFn: () => openInvoiceBuilder(inv.id)
      });
    }
  });

  // 3. No Clients Alert
  if (state.clients.length === 0) {
    alerts.push({
      type: "danger",
      title: "No Clients Found",
      desc: "Please configure your client contact list before creating new invoices.",
      actionText: "Register Client",
      actionFn: () => {
        DOM.navButtons[2].click();
        DOM.addNewClientBtn.click();
      }
    });
  }

  DOM.alertCountBadge.textContent = `${alerts.length} action${alerts.length !== 1 ? 's' : ''}`;
  if (alerts.length === 0) {
    DOM.actionItemsList.innerHTML = `<li class="alert-item empty-state">No immediate action items found. Everything looks stable!</li>`;
    return;
  }

  alerts.forEach(alert => {
    const li = document.createElement("li");
    li.className = `alert-item ${alert.type}`;
    
    // Draw appropriate indicator SVGs
    const dangerIcon = `<svg class="alert-item-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    const warningIcon = `<svg class="alert-item-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    const icon = alert.type === "danger" ? dangerIcon : warningIcon;

    li.innerHTML = `
      ${icon}
      <div class="alert-item-text">
        <span class="alert-item-title">${alert.title}</span>
        <span class="alert-item-desc">${alert.desc}</span>
      </div>
      <button class="btn btn-secondary btn-sm" style="margin-left: auto;">Go</button>
    `;
    li.querySelector("button").addEventListener("click", alert.actionFn);
    DOM.actionItemsList.appendChild(li);
  });
}

function renderEarningsChart() {
  DOM.dashboardChartContainer.innerHTML = "";
  
  // Assemble last 6 months list dynamically
  const monthLabels = [];
  const monthKeys = []; // Format "YYYY-MM"
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mLabel = d.toLocaleString("default", { month: "short" });
    const yearStr = d.getFullYear();
    monthLabels.push(mLabel);
    
    const mNum = String(d.getMonth() + 1).padStart(2, '0');
    monthKeys.push(`${yearStr}-${mNum}`);
  }

  // Aggregate monthly earnings (payments logged in those months)
  const earningsMap = {};
  monthKeys.forEach(k => { earningsMap[k] = 0; });

  state.invoices.forEach(inv => {
    inv.payments.forEach(pay => {
      const payMonth = pay.date.substring(0, 7); // "YYYY-MM"
      if (earningsMap.hasOwnProperty(payMonth)) {
        earningsMap[payMonth] += parseFloat(pay.amount) || 0;
      }
    });
  });

  const chartData = monthKeys.map(k => earningsMap[k]);
  const maxVal = Math.max(...chartData, 1000); // Floor axis bounds at 1000 to prevent zero breaks

  // Construct coordinates inside 100% vector viewport
  const width = 500;
  const height = 180;
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
    points.push({ x, y, val, label: monthLabels[index] });
  });

  // Start building inline SVG markup
  let svgContent = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <!-- Grid lines (Horizontal helper tracks) -->
  `;

  // Draw 4 helper lines
  for (let i = 0; i <= 3; i++) {
    const yTrack = padTop + (i / 3) * chartHeight;
    const valTrack = maxVal - (i / 3) * maxVal;
    svgContent += `
      <line class="chart-grid-line" x1="${padLeft}" y1="${yTrack}" x2="${width - padRight}" y2="${yTrack}" />
      <text class="chart-text" x="5" y="${yTrack + 3}">${formatCurrency(valTrack).split('.')[0]}</text>
    `;
  }

  // Draw Line path and Fill path
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

  // Draw Interactive hover nodes & month labels
  points.forEach(pt => {
    svgContent += `
      <circle class="chart-node" cx="${pt.x}" cy="${pt.y}" r="5">
        <title>${pt.label}: ${formatCurrency(pt.val)}</title>
      </circle>
      <text class="chart-text" x="${pt.x}" y="${height - 5}" text-anchor="middle">${pt.label}</text>
    `;
  });

  svgContent += `</svg>`;
  DOM.dashboardChartContainer.innerHTML = svgContent;
}

function attachTableActionButtonListeners(container) {
  container.querySelectorAll(".edit-inv-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const invId = btn.getAttribute("data-id");
      openInvoiceBuilder(invId);
    });
  });

  container.querySelectorAll(".pay-inv-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const invId = btn.getAttribute("data-id");
      openPaymentModal(invId);
    });
  });
}

// ==========================================================================
// INVOICES LIST & SEARCH FILTER CONTROL
// ==========================================================================
function renderInvoicesList() {
  const query = DOM.invoiceSearchInput.value.toLowerCase();
  const statusFilter = DOM.invoiceFilterStatus.value;
  const clientFilter = DOM.invoiceFilterClient.value;
  const sort = DOM.invoiceSortOrder.value;

  // Render client selectors in filter bar
  populateInvoicesFilterClientDropdown();

  let filtered = state.invoices.filter(inv => {
    const clientName = getClientName(inv.clientId).toLowerCase();
    const invId = inv.id.toLowerCase();
    const textMatch = invId.includes(query) || clientName.includes(query);

    const statusMatch = statusFilter === "all" || inv.status === statusFilter;
    const clientMatch = clientFilter === "all" || inv.clientId === clientFilter;

    return textMatch && statusMatch && clientMatch;
  });

  // Perform Sorting
  filtered.sort((a, b) => {
    if (sort === "date-desc") {
      return new Date(b.issueDate) - new Date(a.issueDate);
    } else if (sort === "date-asc") {
      return new Date(a.issueDate) - new Date(b.issueDate);
    } else if (sort === "amount-desc") {
      return b.total - a.total;
    } else if (sort === "amount-asc") {
      return a.total - b.total;
    }
    return 0;
  });

  // Display results
  DOM.invoicesTableBody.innerHTML = "";
  if (filtered.length === 0) {
    DOM.invoicesEmptyState.classList.remove("hidden");
    return;
  }
  DOM.invoicesEmptyState.classList.add("hidden");

  filtered.forEach(inv => {
    const clientCurrency = getClientCurrency(inv.clientId);
    const totals = getInvoiceTotals(inv);
    const row = document.createElement("tr");
    
    // Status color badge logic
    row.innerHTML = `
      <td><strong>#${inv.id}</strong></td>
      <td>${getClientName(inv.clientId)}</td>
      <td>${inv.issueDate}</td>
      <td>${inv.dueDate}</td>
      <td><strong>${formatCurrency(inv.total, clientCurrency)}</strong></td>
      <td>${formatCurrency(totals.totalPaid, clientCurrency)}</td>
      <td><span class="badge badge-${inv.status}">${inv.status}</span></td>
      <td class="text-right">
        <div class="header-actions" style="justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm edit-inv-btn" data-id="${inv.id}">Edit</button>
          ${inv.status !== 'paid' && inv.status !== 'draft' ? `<button class="btn btn-success btn-sm pay-inv-btn" data-id="${inv.id}">Log Pay</button>` : ''}
          <button class="btn btn-danger-outline btn-sm delete-inv-btn" data-id="${inv.id}">Delete</button>
        </div>
      </td>
    `;
    DOM.invoicesTableBody.appendChild(row);
  });

  // Hook button listeners
  attachTableActionButtonListeners(DOM.invoicesTableBody);
  DOM.invoicesTableBody.querySelectorAll(".delete-inv-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const invId = btn.getAttribute("data-id");
      if (confirm(`Are you sure you want to permanently delete invoice #${invId}?`)) {
        state.invoices = state.invoices.filter(i => i.id !== invId);
        saveStateToStorage();
        renderInvoicesList();
      }
    });
  });
}

function populateInvoicesFilterClientDropdown() {
  const currentSelectVal = DOM.invoiceFilterClient.value;
  DOM.invoiceFilterClient.innerHTML = `<option value="all">All Clients</option>`;
  state.clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    DOM.invoiceFilterClient.appendChild(opt);
  });
  DOM.invoiceFilterClient.value = currentSelectVal;
}

// Hook Toolbar filters
function initInvoiceFilters() {
  DOM.invoiceSearchInput.addEventListener("input", renderInvoicesList);
  DOM.invoiceFilterStatus.addEventListener("change", renderInvoicesList);
  DOM.invoiceFilterClient.addEventListener("change", renderInvoicesList);
  DOM.invoiceSortOrder.addEventListener("change", renderInvoicesList);
  DOM.viewAllInvoicesBtn.addEventListener("click", () => {
    DOM.navButtons[1].click(); // Tab change to Invoices
  });
}

// ==========================================================================
// CLIENTS MANAGEMENT CONTROLS
// ==========================================================================
function renderClientsGrid() {
  DOM.clientsGrid.innerHTML = "";

  if (state.clients.length === 0) {
    DOM.clientsEmptyState.classList.remove("hidden");
    return;
  }
  DOM.clientsEmptyState.classList.add("hidden");

  state.clients.forEach((client, idx) => {
    // Aggregate data on client invoices
    const clientInvoices = state.invoices.filter(i => i.clientId === client.id && i.status !== "draft");
    const totalBilled = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOutstanding = clientInvoices.reduce((sum, inv) => {
      if (inv.status !== "paid") {
        return sum + getInvoiceTotals(inv).balanceDue;
      }
      return sum;
    }, 0);

    const nameInitials = client.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const card = document.createElement("div");
    card.className = "client-card";
    card.innerHTML = `
      <div class="client-card-header">
        <div class="client-avatar">${nameInitials}</div>
        <div class="client-meta">
          <h3>${client.name}</h3>
          <p>${client.email}</p>
        </div>
      </div>
      <div class="client-card-body">
        <div class="client-metric-row">
          <span class="client-metric-label">Currency:</span>
          <span class="client-metric-value">${client.currency}</span>
        </div>
        <div class="client-metric-row">
          <span class="client-metric-label">Default Net Terms:</span>
          <span class="client-metric-value">Net ${client.defaultTerms || 30} days</span>
        </div>
        <div class="client-metric-row">
          <span class="client-metric-label">Total Invoiced:</span>
          <span class="client-metric-value">${formatCurrency(totalBilled, client.currency)}</span>
        </div>
        <div class="client-metric-row">
          <span class="client-metric-label">Balance Outstanding:</span>
          <span class="client-metric-value" style="color: ${totalOutstanding > 0 ? 'var(--color-pending)' : 'inherit'};">
            ${formatCurrency(totalOutstanding, client.currency)}
          </span>
        </div>
      </div>
      <div class="client-card-actions">
        <button class="btn btn-secondary btn-sm edit-client-btn" data-index="${idx}">Edit</button>
        <button class="btn btn-danger-outline btn-sm delete-client-btn" data-index="${idx}">Delete</button>
      </div>
    `;
    DOM.clientsGrid.appendChild(card);
  });

  // Edit / Delete Listeners
  DOM.clientsGrid.querySelectorAll(".edit-client-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-index");
      openClientModal(idx);
    });
  });

  DOM.clientsGrid.querySelectorAll(".delete-client-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-index"));
      const client = state.clients[idx];
      
      // Prevent deleting if they have transaction bills
      const references = state.invoices.filter(inv => inv.clientId === client.id);
      if (references.length > 0) {
        alert(`Cannot delete client '${client.name}' because there are ${references.length} existing invoices linked to their profile.`);
        return;
      }

      if (confirm(`Are you sure you want to delete client '${client.name}'?`)) {
        state.clients.splice(idx, 1);
        saveStateToStorage();
        renderClientsGrid();
      }
    });
  });
}

function openClientModal(index = null) {
  DOM.clientModal.classList.remove("hidden");
  DOM.clientForm.reset();

  if (index !== null) {
    const client = state.clients[index];
    DOM.clientModalTitle.textContent = "Edit Client";
    DOM.clientModalIndex.value = index;
    DOM.clientNameInput.value = client.name;
    DOM.clientEmailInput.value = client.email;
    DOM.clientAddressInput.value = client.address || "";
    DOM.clientCurrencyInput.value = client.currency;
    DOM.clientTermsInput.value = client.defaultTerms || 30;
  } else {
    DOM.clientModalTitle.textContent = "Add Client";
    DOM.clientModalIndex.value = "";
    DOM.clientCurrencyInput.value = state.settings.defaultCurrency;
    DOM.clientTermsInput.value = state.settings.defaultTerms;
  }
}

function closeClientModal() {
  DOM.clientModal.classList.add("hidden");
}

function handleClientFormSubmit(e) {
  e.preventDefault();
  
  const idx = DOM.clientModalIndex.value;
  const clientData = {
    name: DOM.clientNameInput.value.trim(),
    email: DOM.clientEmailInput.value.trim(),
    address: DOM.clientAddressInput.value.trim(),
    currency: DOM.clientCurrencyInput.value,
    defaultTerms: parseInt(DOM.clientTermsInput.value) || 30
  };

  if (idx !== "") {
    // Update existing
    const existing = state.clients[parseInt(idx)];
    clientData.id = existing.id;
    state.clients[parseInt(idx)] = clientData;
  } else {
    // Generate new unique ID
    clientData.id = "c-" + Date.now();
    state.clients.push(clientData);
  }

  saveStateToStorage();
  closeClientModal();
  renderClientsGrid();
}

function initClientModalEvents() {
  DOM.addNewClientBtn.addEventListener("click", () => openClientModal());
  DOM.closeClientModalBtn.addEventListener("click", closeClientModal);
  DOM.cancelClientBtn.addEventListener("click", closeClientModal);
  DOM.clientForm.addEventListener("submit", handleClientFormSubmit);
}

// ==========================================================================
// DUAL-PANE INVOICE BUILDER & PREVIEW LOGIC
// ==========================================================================
function populateInvoiceBuilderClients() {
  DOM.builderClientSelect.innerHTML = "";
  state.clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.currency})`;
    DOM.builderClientSelect.appendChild(opt);
  });
}

function openInvoiceBuilder(invoiceId = null) {
  DOM.invoiceBuilderOverlay.classList.remove("hidden");
  populateInvoiceBuilderClients();
  DOM.lineItemsList.innerHTML = "";
  
  if (invoiceId !== null) {
    // Edit mode
    const inv = state.invoices.find(i => i.id === invoiceId);
    activeEditingInvoiceId = invoiceId;
    DOM.builderTitle.textContent = `Edit Invoice #${inv.id}`;
    DOM.builderSubTitle.textContent = "Modifying saved transaction records";
    DOM.builderInvoiceId.value = inv.id;
    DOM.builderInvoiceId.disabled = true; // Reference keys should not be edited
    DOM.builderInvoiceStatus.value = inv.status;
    DOM.builderClientSelect.value = inv.clientId;
    DOM.builderIssueDate.value = inv.issueDate;
    DOM.builderDueDate.value = inv.dueDate;
    DOM.builderPaymentTerms.value = inv.terms || 30;
    DOM.builderDiscount.value = inv.discount || 0;
    DOM.builderDiscountType.value = inv.discountType || "fixed";
    DOM.builderTaxOption.value = inv.taxRate || 0;
    DOM.builderNotes.value = inv.notes || "";

    // Load saved line items
    inv.items.forEach(item => addLineItemRow(item));
  } else {
    // Create new mode
    activeEditingInvoiceId = null;
    DOM.builderTitle.textContent = "New Invoice";
    DOM.builderSubTitle.textContent = "Draft details and check formatting";
    
    // Clear disabled flag and auto-generate invoice reference
    DOM.builderInvoiceId.disabled = false;
    DOM.builderInvoiceId.value = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    DOM.builderInvoiceStatus.value = "draft";
    DOM.builderIssueDate.value = new Date().toISOString().split("T")[0];
    DOM.builderPaymentTerms.value = state.settings.defaultTerms;
    DOM.builderDiscount.value = 0;
    DOM.builderDiscountType.value = "fixed";
    DOM.builderTaxOption.value = state.settings.defaultTax;
    DOM.builderNotes.value = "";

    // Set first client value as default trigger
    if (state.clients.length > 0) {
      DOM.builderClientSelect.value = state.clients[0].id;
      triggerClientChangeDefaults();
    }
    
    // Insert single blank line item automatically
    addLineItemRow();
  }

  calculateInvoiceTotalsAndSyncPreview();
}

function triggerClientChangeDefaults() {
  const clientId = DOM.builderClientSelect.value;
  const client = state.clients.find(c => c.id === clientId);
  if (client) {
    DOM.builderPaymentTerms.value = client.defaultTerms || state.settings.defaultTerms;
    recalculateDueDateFromTerms();
  }
}

function recalculateDueDateFromTerms() {
  const issueDateVal = DOM.builderIssueDate.value;
  const termsVal = parseInt(DOM.builderPaymentTerms.value) || 0;
  if (issueDateVal) {
    const issueDate = new Date(issueDateVal);
    issueDate.setDate(issueDate.getDate() + termsVal);
    DOM.builderDueDate.value = issueDate.toISOString().split("T")[0];
  }
}

function addLineItemRow(item = null) {
  const row = document.createElement("div");
  row.className = "line-item-row";
  
  const descVal = item ? item.desc : "";
  const typeVal = item ? item.type : "hours";
  const rateVal = item ? item.rate : 0;
  const qtyVal = item ? item.qty : 1;
  const taxVal = item ? item.tax : 0;
  const rowTotal = (rateVal * qtyVal) * (1 + taxVal / 100);

  row.innerHTML = `
    <div class="col-desc"><input type="text" class="item-desc" required placeholder="Service / Item Description" value="${descVal}"></div>
    <div class="col-type">
      <select class="item-type">
        <option value="hours" ${typeVal === 'hours' ? 'selected' : ''}>Hours</option>
        <option value="flat" ${typeVal === 'flat' ? 'selected' : ''}>Flat Rate</option>
        <option value="qty" ${typeVal === 'qty' ? 'selected' : ''}>Quantity</option>
      </select>
    </div>
    <div class="col-rate"><input type="number" class="item-rate" min="0" step="0.01" required value="${rateVal}"></div>
    <div class="col-qty"><input type="number" class="item-qty" min="0.01" step="0.01" required value="${qtyVal}"></div>
    <div class="col-tax"><input type="number" class="item-tax" min="0" max="100" step="0.1" value="${taxVal}"></div>
    <div class="col-total">${formatCurrency(rowTotal)}</div>
    <div class="col-action">
      <button type="button" class="delete-item-btn" title="Remove line item">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </button>
    </div>
  `;

  // Attach auto calculating listeners on fields
  const recalculateRow = () => {
    const rate = parseFloat(row.querySelector(".item-rate").value) || 0;
    const qty = parseFloat(row.querySelector(".item-qty").value) || 0;
    const taxRate = parseFloat(row.querySelector(".item-tax").value) || 0;
    const clientCurrency = getClientCurrency(DOM.builderClientSelect.value);
    
    const rowSub = rate * qty;
    const total = rowSub + (rowSub * (taxRate / 100));
    row.querySelector(".col-total").textContent = formatCurrency(total, clientCurrency);
    calculateInvoiceTotalsAndSyncPreview();
  };

  row.querySelectorAll("input, select").forEach(input => {
    input.addEventListener("input", recalculateRow);
  });

  row.querySelector(".delete-item-btn").addEventListener("click", () => {
    row.remove();
    calculateInvoiceTotalsAndSyncPreview();
  });

  DOM.lineItemsList.appendChild(row);
}

function calculateInvoiceTotalsAndSyncPreview() {
  const clientId = DOM.builderClientSelect.value;
  const clientCurrency = getClientCurrency(clientId);
  
  // Construct temporary invoice item array
  const tempInvoice = {
    clientId: clientId,
    discount: parseFloat(DOM.builderDiscount.value) || 0,
    discountType: DOM.builderDiscountType.value,
    taxRate: parseFloat(DOM.builderTaxOption.value) || 0,
    payments: [],
    items: []
  };

  const rows = DOM.lineItemsList.querySelectorAll(".line-item-row");
  rows.forEach(r => {
    tempInvoice.items.push({
      desc: r.querySelector(".item-desc").value,
      rate: parseFloat(r.querySelector(".item-rate").value) || 0,
      qty: parseFloat(r.querySelector(".item-qty").value) || 0,
      tax: parseFloat(r.querySelector(".item-tax").value) || 0
    });
  });

  // If editing an existing invoice, restore payment log to make calculations correct
  if (activeEditingInvoiceId !== null) {
    const saved = state.invoices.find(i => i.id === activeEditingInvoiceId);
    if (saved) tempInvoice.payments = saved.payments;
  }

  const totals = getInvoiceTotals(tempInvoice);

  // Sync to UI preview sheet
  syncInvoicePreviewSheet(tempInvoice, totals);
}

function syncInvoicePreviewSheet(tempInvoice, totals) {
  const clientId = tempInvoice.clientId;
  const client = state.clients.find(c => c.id === clientId);
  const clientCurrency = getClientCurrency(clientId);

  // Business profile
  DOM.sheetCompanyName.textContent = state.settings.businessName;
  DOM.sheetCompanyDetails.textContent = `${state.settings.businessAddress}\nPhone: ${state.settings.businessPhone} | Email: ${state.settings.businessEmail}`;
  DOM.sheetCompanyLogo.textContent = state.settings.businessName.split(" ").map(w => w[0]).join("").substring(0,2).toUpperCase();

  // Invoice Meta
  DOM.sheetInvoiceId.textContent = `#${DOM.builderInvoiceId.value}`;
  DOM.sheetIssueDate.textContent = DOM.builderIssueDate.value;
  DOM.sheetDueDate.textContent = DOM.builderDueDate.value;
  DOM.sheetTerms.textContent = `Net ${DOM.builderPaymentTerms.value || 30}`;

  // Client Details
  if (client) {
    DOM.sheetClientName.textContent = client.name;
    DOM.sheetClientAddress.textContent = client.address || "";
    DOM.sheetClientEmail.textContent = client.email;
  } else {
    DOM.sheetClientName.textContent = "Choose Client";
    DOM.sheetClientAddress.textContent = "";
    DOM.sheetClientEmail.textContent = "";
  }

  // Status Watermark Badge
  const activeStatus = DOM.builderInvoiceStatus.value;
  DOM.sheetStatusBadge.textContent = activeStatus.toUpperCase();
  DOM.sheetStatusBadge.className = `sheet-status-badge ${activeStatus}`;

  // Render items rows
  DOM.sheetItemsBody.innerHTML = "";
  tempInvoice.items.forEach((item, index) => {
    const rate = parseFloat(item.rate) || 0;
    const qty = parseFloat(item.qty) || 0;
    const rowSub = rate * qty;
    const rowTax = rowSub * ((parseFloat(item.tax) || 0) / 100);
    const rowTotal = rowSub + rowTax;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-index">${index + 1}</td>
      <td class="col-desc text-left">
        <strong>${item.desc || "Item Description"}</strong>
        ${item.tax > 0 ? `<br><small style="color: var(--text-muted);">Includes ${item.tax}% item tax</small>` : ''}
      </td>
      <td class="col-rate text-right">${formatCurrency(rate, clientCurrency)}</td>
      <td class="col-qty text-right">${qty}</td>
      <td class="col-total text-right">${formatCurrency(rowTotal, clientCurrency)}</td>
    `;
    DOM.sheetItemsBody.appendChild(tr);
  });

  // Calculate notes
  DOM.sheetNotes.textContent = DOM.builderNotes.value || "Thank you for your business!";

  // Financial Subtotals & discounts
  DOM.sheetSubtotal.textContent = formatCurrency(totals.subtotal, clientCurrency);

  if (totals.discount > 0) {
    DOM.sheetDiscountRow.classList.remove("hidden");
    DOM.sheetDiscount.textContent = `-${formatCurrency(totals.discount, clientCurrency)}`;
  } else {
    DOM.sheetDiscountRow.classList.add("hidden");
  }

  DOM.sheetTax.textContent = formatCurrency(totals.tax, clientCurrency);
  DOM.sheetGrandTotal.textContent = formatCurrency(totals.grandTotal, clientCurrency);

  // Paid, outstanding details
  if (totals.totalPaid > 0) {
    DOM.sheetPaidRow.classList.remove("hidden");
    DOM.sheetAmountPaid.textContent = formatCurrency(totals.totalPaid, clientCurrency);

    DOM.sheetBalanceRow.classList.remove("hidden");
    DOM.sheetBalance.textContent = formatCurrency(totals.balanceDue, clientCurrency);
  } else {
    DOM.sheetPaidRow.classList.add("hidden");
    DOM.sheetBalanceRow.classList.add("hidden");
  }
}

function handleSaveInvoice() {
  const invoiceId = DOM.builderInvoiceId.value.trim();
  const clientId = DOM.builderClientSelect.value;
  const issueDate = DOM.builderIssueDate.value;
  const dueDate = DOM.builderDueDate.value;
  const terms = parseInt(DOM.builderPaymentTerms.value) || 0;
  const discount = parseFloat(DOM.builderDiscount.value) || 0;
  const discountType = DOM.builderDiscountType.value;
  const taxRate = parseFloat(DOM.builderTaxOption.value) || 0;
  const notes = DOM.builderNotes.value.trim();
  const status = DOM.builderInvoiceStatus.value;

  if (!invoiceId) {
    alert("Please enter a valid Invoice Reference number.");
    return;
  }
  if (!clientId) {
    alert("Please select a target client profile.");
    return;
  }

  // Double check duplicates for new invoices
  if (activeEditingInvoiceId === null) {
    const exists = state.invoices.some(i => i.id === invoiceId);
    if (exists) {
      alert(`Invoice with reference ID '${invoiceId}' already exists. Please choose a unique reference.`);
      return;
    }
  }

  // Parse items
  const items = [];
  const rows = DOM.lineItemsList.querySelectorAll(".line-item-row");
  let itemsValid = true;

  rows.forEach(r => {
    const desc = r.querySelector(".item-desc").value.trim();
    const type = r.querySelector(".item-type").value;
    const rate = parseFloat(r.querySelector(".item-rate").value);
    const qty = parseFloat(r.querySelector(".item-qty").value);
    const tax = parseFloat(r.querySelector(".item-tax").value) || 0;

    if (!desc || isNaN(rate) || isNaN(qty)) {
      itemsValid = false;
    }

    items.push({ desc, type, rate, qty, tax });
  });

  if (!itemsValid || items.length === 0) {
    alert("Please make sure you have added at least one line item and filled in all descriptions, rates and quantities.");
    return;
  }

  // Structure invoice object
  let targetInvoice;
  if (activeEditingInvoiceId !== null) {
    targetInvoice = state.invoices.find(i => i.id === activeEditingInvoiceId);
  } else {
    targetInvoice = { id: invoiceId, payments: [] };
  }

  targetInvoice.clientId = clientId;
  targetInvoice.issueDate = issueDate;
  targetInvoice.dueDate = dueDate;
  targetInvoice.terms = terms;
  targetInvoice.discount = discount;
  targetInvoice.discountType = discountType;
  targetInvoice.taxRate = taxRate;
  targetInvoice.notes = notes;
  targetInvoice.items = items;
  targetInvoice.status = status;

  // Recalculate full total
  const totals = getInvoiceTotals(targetInvoice);
  targetInvoice.total = totals.grandTotal;

  // Auto transition overdue flag if unpaid
  if (targetInvoice.status === "sent" && getDaysOverdue(dueDate) > 0) {
    targetInvoice.status = "overdue";
  }

  // Save to database
  if (activeEditingInvoiceId === null) {
    state.invoices.push(targetInvoice);
  }

  saveStateToStorage();
  closeInvoiceBuilder();
  
  // Refresh current view
  const activeTab = document.querySelector(".nav-btn.active").getAttribute("data-target");
  if (activeTab === "dashboard-section") renderDashboard();
  else renderInvoicesList();
}

function closeInvoiceBuilder() {
  DOM.invoiceBuilderOverlay.classList.add("hidden");
  activeEditingInvoiceId = null;
}

function initInvoiceBuilderEvents() {
  DOM.btnCreateInvoices.forEach(btn => {
    btn.addEventListener("click", () => openInvoiceBuilder());
  });

  DOM.closeBuilderBtn.addEventListener("click", closeInvoiceBuilder);
  DOM.addNewLineItemBtn.addEventListener("click", () => addLineItemRow());
  DOM.saveInvoiceBtn.addEventListener("click", handleSaveInvoice);
  DOM.printInvoiceBtn.addEventListener("click", () => window.print());

  // Bind change triggers to adjust print previews in real time
  DOM.builderClientSelect.addEventListener("change", () => {
    triggerClientChangeDefaults();
    calculateInvoiceTotalsAndSyncPreview();
  });
  DOM.builderInvoiceId.addEventListener("input", calculateInvoiceTotalsAndSyncPreview);
  DOM.builderIssueDate.addEventListener("input", () => {
    recalculateDueDateFromTerms();
    calculateInvoiceTotalsAndSyncPreview();
  });
  DOM.builderDueDate.addEventListener("input", calculateInvoiceTotalsAndSyncPreview);
  DOM.builderPaymentTerms.addEventListener("input", () => {
    recalculateDueDateFromTerms();
    calculateInvoiceTotalsAndSyncPreview();
  });
  DOM.builderInvoiceStatus.addEventListener("change", calculateInvoiceTotalsAndSyncPreview);
  DOM.builderDiscount.addEventListener("input", calculateInvoiceTotalsAndSyncPreview);
  DOM.builderDiscountType.addEventListener("change", calculateInvoiceTotalsAndSyncPreview);
  DOM.builderTaxOption.addEventListener("input", calculateInvoiceTotalsAndSyncPreview);
  DOM.builderNotes.addEventListener("input", calculateInvoiceTotalsAndSyncPreview);

  // Sheet Theme Colors Change Swatch
  DOM.previewThemeSwatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      DOM.previewThemeSwatches.forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");

      const color = swatch.getAttribute("data-color");
      DOM.invoicePrintSheet.className = `invoice-print-sheet print-theme-${color}`;
    });
  });
}

// ==========================================================================
// PAYMENT LOG MODULE CONTROLS
// ==========================================================================
function openPaymentModal(invoiceId) {
  DOM.paymentModal.classList.remove("hidden");
  DOM.paymentForm.reset();

  const inv = state.invoices.find(i => i.id === invoiceId);
  const totals = getInvoiceTotals(inv);
  const clientCurrency = getClientCurrency(inv.clientId);

  DOM.paymentInvoiceId.value = invoiceId;
  DOM.paymentModalBalance.textContent = formatCurrency(totals.balanceDue, clientCurrency);
  DOM.paymentAmountInput.value = totals.balanceDue.toFixed(2);
  DOM.paymentAmountInput.max = totals.balanceDue.toFixed(2);
  DOM.paymentDateInput.value = new Date().toISOString().split("T")[0];
}

function closePaymentModal() {
  DOM.paymentModal.classList.add("hidden");
}

function handlePaymentSubmit(e) {
  e.preventDefault();

  const invoiceId = DOM.paymentInvoiceId.value;
  const payAmt = parseFloat(DOM.paymentAmountInput.value);
  const payDate = DOM.paymentDateInput.value;
  const payMethod = DOM.paymentMethodInput.value;

  if (isNaN(payAmt) || payAmt <= 0) {
    alert("Please log a valid payment amount.");
    return;
  }

  const inv = state.invoices.find(i => i.id === invoiceId);
  if (inv) {
    inv.payments.push({
      date: payDate,
      amount: payAmt,
      method: payMethod
    });

    const totals = getInvoiceTotals(inv);
    if (totals.balanceDue <= 0.01) {
      inv.status = "paid";
    }

    saveStateToStorage();
    closePaymentModal();

    // Reload active panel
    const activeTab = document.querySelector(".nav-btn.active").getAttribute("data-target");
    if (activeTab === "dashboard-section") renderDashboard();
    else renderInvoicesList();
  }
}

function initPaymentEvents() {
  DOM.closePaymentModalBtn.addEventListener("click", closePaymentModal);
  DOM.cancelPaymentBtn.addEventListener("click", closePaymentModal);
  DOM.paymentForm.addEventListener("submit", handlePaymentSubmit);
}

// ==========================================================================
// SETTINGS & DATABASE BACKUP RESTORE
// ==========================================================================
function loadSettingsTab() {
  DOM.settingsBizName.value = state.settings.businessName;
  DOM.settingsBizEmail.value = state.settings.businessEmail;
  DOM.settingsBizAddress.value = state.settings.businessAddress || "";
  DOM.settingsBizPhone.value = state.settings.businessPhone || "";
  DOM.settingsBizWebsite.value = state.settings.businessWebsite || "";
  DOM.settingsDefaultCurrency.value = state.settings.defaultCurrency;
  DOM.settingsDefaultTax.value = state.settings.defaultTax;
  DOM.settingsDefaultTerms.value = state.settings.defaultTerms;
}

function handleSaveProfile(e) {
  e.preventDefault();
  state.settings.businessName = DOM.settingsBizName.value.trim();
  state.settings.businessEmail = DOM.settingsBizEmail.value.trim();
  state.settings.businessAddress = DOM.settingsBizAddress.value.trim();
  state.settings.businessPhone = DOM.settingsBizPhone.value.trim();
  state.settings.businessWebsite = DOM.settingsBizWebsite.value.trim();
  saveStateToStorage();
  alert("Business Profile saved successfully.");
}

function handleSaveWorkspaceDefaults() {
  state.settings.defaultCurrency = DOM.settingsDefaultCurrency.value;
  state.settings.defaultTax = parseFloat(DOM.settingsDefaultTax.value) || 0;
  state.settings.defaultTerms = parseInt(DOM.settingsDefaultTerms.value) || 30;
  saveStateToStorage();
  alert("Workspace default rules saved successfully.");
}

function exportDatabaseBackup() {
  const database = {
    version: "1.0",
    invoices: state.invoices,
    clients: state.clients,
    settings: state.settings
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(database, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `flowinvoice_backup_${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importDatabaseBackup(e) {
  const fileReader = new FileReader();
  const file = e.target.files[0];
  if (!file) return;

  fileReader.onload = function(event) {
    try {
      const parsed = JSON.parse(event.target.result);
      if (parsed.invoices && parsed.clients && parsed.settings) {
        state.invoices = parsed.invoices;
        state.clients = parsed.clients;
        state.settings = parsed.settings;
        saveStateToStorage();
        alert("FlowInvoice Workspace Database imported successfully!");
        window.location.reload();
      } else {
        alert("Invalid database file format. Must contain invoices, clients, and settings keys.");
      }
    } catch (err) {
      alert("Error parsing workspace backup JSON file.");
    }
  };

  fileReader.readAsText(file);
}

function resetDatabaseToSeed() {
  if (confirm("WARNING: This will permanently overwrite all your custom invoices and client records with default dummy data. Continue?")) {
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    window.location.reload();
  }
}

function initSettingsEvents() {
  DOM.businessProfileForm.addEventListener("submit", handleSaveProfile);
  DOM.saveWorkspaceConfigBtn.addEventListener("click", handleSaveWorkspaceDefaults);
  DOM.exportBackupBtn.addEventListener("click", exportDatabaseBackup);
  DOM.importBackupInput.addEventListener("change", importDatabaseBackup);
  DOM.resetDatabaseBtn.addEventListener("click", resetDatabaseToSeed);
}

// ==========================================================================
// CORE APP ENTRYPOINT INITIALIZER
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initDatabase();
  initThemeToggle();
  initAppRouting();
  initInvoiceFilters();
  initClientModalEvents();
  initInvoiceBuilderEvents();
  initPaymentEvents();
  initSettingsEvents();

  // Load first dashboard content
  renderDashboard();
  loadSettingsTab();
});
