// Centralized State Engine
const AppState = {
  urls: [],
  activePanel: 'dashboard',
  theme: 'dark',
  
  // Active redirect simulation state
  activeRedirect: {
    urlId: null,
    secondsLeft: 3,
    timerId: null
  }
};

// Initial Sample Links
const DefaultUrls = [
  { id: 'url_1', originalUrl: 'https://github.com/MistryVishwa/Web-Dev-Projects', shortCode: 'nsoc26', shortUrl: 'shrt.lnk/nsoc26', clicks: 24, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'url_2', originalUrl: 'https://www.google.com/search?q=gemini+antigravity', shortCode: 'antigrav', shortUrl: 'shrt.lnk/antigrav', clicks: 15, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'url_3', originalUrl: 'https://developer.mozilla.org/en-US/docs/Web/API', shortCode: 'web-api', shortUrl: 'shrt.lnk/web-api', clicks: 8, timestamp: new Date().toISOString() }
];

// Web Audio API tick chime
const AudioTick = {
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
      osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  },
  chime() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {}
  }
};

// Application Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupUI();
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 1000);
  renderAll();
});

// Load and Save states
function loadData() {
  const saved = localStorage.getItem("url_shortener_sim_data");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      AppState.urls = parsed.urls || [];
      AppState.theme = parsed.theme || 'dark';
    } catch (e) {
      console.error("Failed to load shortener links database", e);
    }
  } else {
    // Bootstrap sample cards
    AppState.urls = [...DefaultUrls];
    saveData();
  }
  
  // Set theme class
  document.body.className = AppState.theme === 'light' ? 'light-theme' : 'dark-theme';
}

function saveData() {
  const data = {
    urls: AppState.urls,
    theme: AppState.theme
  };
  localStorage.setItem("url_shortener_sim_data", JSON.stringify(data));
}

// Update topbar clock display
function updateTimeDisplay() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const displayEl = document.getElementById("clock-display");
  if (displayEl) displayEl.textContent = timeStr;
}

// Bind UI listeners
function setupUI() {
  // Navigation Tabs Routing
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = btn.getAttribute("data-panel");
      switchPanel(panel);
    });
  });

  // Theme Toggler
  document.getElementById("btn-theme-toggle").addEventListener("click", toggleTheme);

  // Keyboard Shortcuts Bindings
  window.addEventListener("keydown", handleKeyboardShortcuts);

  // JSON Import & Export Backup triggering
  document.getElementById("btn-export-json").addEventListener("click", exportBackupJSON);
  document.getElementById("btn-import-json").addEventListener("click", () => {
    document.getElementById("backup-file-input").click();
  });
  document.getElementById("backup-file-input").addEventListener("change", importBackupJSON);

  // Dashboard Quick Shortener Form submit
  document.getElementById("dash-shorten-form").addEventListener("submit", handleDashShortenSubmit);
  document.getElementById("dash-url-input").addEventListener("input", () => {
    document.getElementById("dash-url-warning").textContent = "";
  });

  // Main Shortener Page Form submit
  document.getElementById("shorten-form-main").addEventListener("submit", handleMainShortenSubmit);
  document.getElementById("main-url-input").addEventListener("input", () => {
    document.getElementById("main-url-warning").textContent = "";
  });
  document.getElementById("main-custom-input").addEventListener("input", () => {
    document.getElementById("main-custom-warning").textContent = "";
  });

  // Clipboard copy and Redirect play buttons hooks (dashboard & main)
  document.getElementById("btn-dash-copy").addEventListener("click", () => copyGeneratedLink("dash-output-link"));
  document.getElementById("btn-dash-test-redirect").addEventListener("click", () => testRedirectLink("dash-output-link"));
  document.getElementById("btn-main-copy").addEventListener("click", () => copyGeneratedLink("main-output-link"));
  document.getElementById("btn-main-test-redirect").addEventListener("click", () => testRedirectLink("main-output-link"));

  // Registry searches and clear-all actions
  document.getElementById("history-search-input").addEventListener("input", renderHistoryTable);
  document.getElementById("btn-clear-all-history").addEventListener("click", handleClearAllHistory);

  // Modal close buttons
  document.getElementById("btn-close-redirect-modal").addEventListener("click", abortRedirectSimulation);

  // Quick navigation card shortcuts
  document.getElementById("dash-btn-go-shorten").addEventListener("click", () => switchPanel("shorten"));
  document.getElementById("dash-btn-go-history").addEventListener("click", () => switchPanel("history"));
}

// Router switcher
function switchPanel(panelName) {
  AppState.activePanel = panelName;
  
  // Swap navigation active class
  document.querySelectorAll(".nav-btn").forEach(btn => {
    if (btn.getAttribute("data-panel") === panelName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Swap panels visibility
  document.querySelectorAll(".content-panel").forEach(panel => {
    if (panel.id === `panel-${panelName}`) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });

  // Set page headers
  const titleEl = document.getElementById("panel-title-text");
  const subtitleEl = document.getElementById("panel-subtitle-text");
  
  const headers = {
    dashboard: ["Dashboard Overview", "Click tracking, link totals, and mock redirects."],
    shorten: ["URL Shortener Form", "Validate target URLs and create custom or random short codes."],
    history: ["Shortened Links History", "Registry of all shrunk URLs. Click on short links to test mock redirects."],
    analytics: ["Analytics Panel", "Visual graphics showing domain shares and click metrics."]
  };
  
  if (headers[panelName]) {
    titleEl.textContent = headers[panelName][0];
    subtitleEl.textContent = headers[panelName][1];
  }

  // Trigger graphs render
  if (panelName === 'analytics') {
    setTimeout(renderAnalyticsCharts, 50);
  }
}

// Theme toggler
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
  
  // Redraw charts if analytics active
  if (AppState.activePanel === 'analytics') {
    renderAnalyticsCharts();
  }
}

// Keyboard shortcuts hooks
function handleKeyboardShortcuts(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
    return;
  }
  
  if (e.altKey) {
    switch (e.key.toLowerCase()) {
      case 'd': e.preventDefault(); switchPanel('dashboard'); break;
      case 's': e.preventDefault(); switchPanel('shorten'); break;
      case 'h': e.preventDefault(); switchPanel('history'); break;
      case 'a': e.preventDefault(); switchPanel('analytics'); break;
      case 'l': e.preventDefault(); toggleTheme(); break;
    }
  }
}

// Backup IO
function exportBackupJSON() {
  const data = JSON.stringify({ urls: AppState.urls }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "url_shortener_backup.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importBackupJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (parsed.urls) {
        AppState.urls = parsed.urls;
        saveData();
        renderAll();
        alert("URL history collection imported successfully!");
      } else {
        alert("Invalid file structure.");
      }
    } catch (err) {
      alert("Invalid JSON backup file.");
    }
  };
  reader.readAsText(file);
}

// -------------------------------------------------------------------
// URL VALIDATION & SHORTENER ENGINES
// -------------------------------------------------------------------

// Standard URL format validation regex
const URL_REGEX = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/;

function validateUrl(url) {
  return URL_REGEX.test(url);
}

function generateRandomCode(length) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let hash = "";
  for (let i = 0; i < length; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

function registerShortenedLink(longUrl, customCode, length = 6) {
  let cleanUrl = longUrl.trim();
  
  // Prepend protocol if missing
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = "https://" + cleanUrl;
  }
  
  let code = (customCode || "").trim().toLowerCase();
  
  // Verify custom code duplicates
  if (code) {
    const exists = AppState.urls.some(u => u.shortCode === code);
    if (exists) {
      return { success: false, error: "Custom shortcode already exists." };
    }
  } else {
    // Generate unique random hash
    do {
      code = generateRandomCode(length);
    } while (AppState.urls.some(u => u.shortCode === code));
  }
  
  const newLink = {
    id: "url_" + Date.now(),
    originalUrl: cleanUrl,
    shortCode: code,
    shortUrl: `shrt.lnk/${code}`,
    clicks: 0,
    timestamp: new Date().toISOString()
  };
  
  AppState.urls.unshift(newLink);
  saveData();
  renderAll();
  
  return { success: true, link: newLink };
}

// Dashboard shortener submit handler
function handleDashShortenSubmit(e) {
  e.preventDefault();
  const warningEl = document.getElementById("dash-url-warning");
  const inputEl = document.getElementById("dash-url-input");
  
  const targetUrl = inputEl.value;
  if (!validateUrl(targetUrl)) {
    warningEl.textContent = "Please enter a valid target URL format (e.g. example.com).";
    return;
  }
  
  const result = registerShortenedLink(targetUrl, "");
  if (result.success) {
    // Load output display
    document.getElementById("dash-output-link").textContent = result.link.shortUrl;
    document.getElementById("dash-output-box").style.display = "block";
    inputEl.value = "";
  }
}

// Main Shortener Form submits
function handleMainShortenSubmit(e) {
  e.preventDefault();
  
  const warningUrl = document.getElementById("main-url-warning");
  const warningCode = document.getElementById("main-custom-warning");
  
  const targetUrl = document.getElementById("main-url-input").value;
  const customSuffix = document.getElementById("main-custom-input").value;
  const hashLength = parseInt(document.getElementById("main-suffix-length").value);
  
  warningUrl.textContent = "";
  warningCode.textContent = "";
  
  if (!validateUrl(targetUrl)) {
    warningUrl.textContent = "Invalid destination URL structure.";
    return;
  }
  
  // Verify custom suffix alphanumeric
  if (customSuffix && !/^[a-zA-Z0-9\-_]+$/.test(customSuffix)) {
    warningCode.textContent = "Suffix codes can only contain letters, numbers, hyphens, and underscores.";
    return;
  }
  
  const result = registerShortenedLink(targetUrl, customSuffix, hashLength);
  if (result.success) {
    document.getElementById("main-output-link").textContent = result.link.shortUrl;
    document.getElementById("main-output-box").style.display = "block";
    
    // reset form inputs
    document.getElementById("main-url-input").value = "";
    document.getElementById("main-custom-input").value = "";
  } else {
    warningCode.textContent = result.error;
  }
}

// Copy links helper
function copyGeneratedLink(elementId) {
  const linkText = document.getElementById(elementId).textContent;
  
  navigator.clipboard.writeText(linkText).then(() => {
    // Trigger toast notification animation
    const toast = document.getElementById("copy-toast");
    toast.classList.add("active");
    setTimeout(() => {
      toast.classList.remove("active");
    }, 2000);
  });
}

// -------------------------------------------------------------------
// REDIRECT SIMULATOR DIALOG SYSTEM
// -------------------------------------------------------------------

function testRedirectLink(elementId) {
  const shortUrl = document.getElementById(elementId).textContent;
  const code = shortUrl.split("/").pop();
  
  const link = AppState.urls.find(u => u.shortCode === code);
  if (link) {
    launchRedirectModal(link);
  }
}

function launchRedirectModal(link) {
  // Populate modal details
  document.getElementById("redirect-from-link").textContent = link.shortUrl;
  document.getElementById("redirect-to-link").textContent = link.originalUrl;
  
  const modal = document.getElementById("redirect-modal");
  modal.classList.add("active");
  
  AppState.activeRedirect.urlId = link.id;
  AppState.activeRedirect.secondsLeft = 3;
  
  document.getElementById("redirect-countdown-sec").textContent = AppState.activeRedirect.secondsLeft;
  document.getElementById("redirect-progress-bar").style.width = "100%";
  
  // Start countdown ticker interval
  AppState.activeRedirect.timerId = setInterval(() => {
    AppState.activeRedirect.secondsLeft--;
    document.getElementById("redirect-countdown-sec").textContent = AppState.activeRedirect.secondsLeft;
    
    // Redo progress bar percent widths
    const pct = (AppState.activeRedirect.secondsLeft / 3) * 100;
    document.getElementById("redirect-progress-bar").style.width = `${pct}%`;
    
    AudioTick.tick();
    
    if (AppState.activeRedirect.secondsLeft <= 0) {
      handleRedirectCompletion(link);
    }
  }, 1000);
}

function handleRedirectCompletion(link) {
  abortRedirectSimulation();
  AudioTick.chime();
  
  // Increment clicks in state
  const target = AppState.urls.find(u => u.id === link.id);
  if (target) {
    target.clicks++;
    saveData();
    renderAll();
  }
  
  alert(`Simulation complete!\nIncremented simulated clicks count. In a real system, you would now be redirected to: ${link.originalUrl}`);
}

function abortRedirectSimulation() {
  const modal = document.getElementById("redirect-modal");
  modal.classList.remove("active");
  
  if (AppState.activeRedirect.timerId) {
    clearInterval(AppState.activeRedirect.timerId);
    AppState.activeRedirect.timerId = null;
  }
  
  AppState.activeRedirect.urlId = null;
}

// -------------------------------------------------------------------
// LINKS HISTORY REGISTRY & CRUD
// -------------------------------------------------------------------

function deleteUrlEntry(urlId) {
  AppState.urls = AppState.urls.filter(u => u.id !== urlId);
  saveData();
  renderAll();
}

function handleClearAllHistory() {
  if (confirm("Permanently wipe your shortened URLs history database?")) {
    AppState.urls = [];
    saveData();
    renderAll();
  }
}

function renderHistoryTable() {
  const search = document.getElementById("history-search-input").value.toLowerCase();
  const tableBody = document.getElementById("history-table-body");
  
  if (!tableBody) return;
  tableBody.innerHTML = "";
  
  const filtered = AppState.urls.filter(u => {
    return u.originalUrl.toLowerCase().includes(search) || 
           u.shortCode.toLowerCase().includes(search) || 
           u.shortUrl.toLowerCase().includes(search);
  });
  
  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="empty-message-text">No matching links found.</td></tr>`;
    return;
  }
  
  filtered.forEach(link => {
    const date = new Date(link.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><div class="table-original-url" title="${link.originalUrl}">${link.originalUrl}</div></td>
      <td><span class="table-short-url" onclick="launchRedirectModalById('${link.id}')">${link.shortUrl}</span></td>
      <td>${date}</td>
      <td>${link.clicks}</td>
      <td>
        <button class="btn-icon-control act-copy" onclick="copyDirectLinkText('${link.shortUrl}')" title="Copy"><i class="fa-regular fa-copy"></i></button>
        <button class="btn-icon-control act-delete" onclick="deleteUrlEntry('${link.id}')" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function launchRedirectModalById(urlId) {
  const link = AppState.urls.find(u => u.id === urlId);
  if (link) launchRedirectModal(link);
}

function copyDirectLinkText(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("copy-toast");
    toast.classList.add("active");
    setTimeout(() => {
      toast.classList.remove("active");
    }, 2000);
  });
}

// -------------------------------------------------------------------
// CENTRALIZED DASHBOARD UPDATE
// -------------------------------------------------------------------

function renderDashboard() {
  const total = AppState.urls.length;
  const clicks = AppState.urls.reduce((sum, u) => sum + u.clicks, 0);
  const avg = total > 0 ? (clicks / total).toFixed(1) : "0.0";
  
  // Dashboard counters
  document.getElementById("stats-total-links").textContent = total;
  document.getElementById("stats-total-clicks").textContent = clicks;
  document.getElementById("stats-avg-clicks").textContent = avg;
  
  // Populate Popular Links column lists
  const popContainer = document.getElementById("dash-popular-links-container");
  if (popContainer) {
    popContainer.innerHTML = "";
    
    if (AppState.urls.length === 0) {
      popContainer.innerHTML = `<p class="empty-message-text">No shortened URLs logged yet.</p>`;
    } else {
      // Sort by clicks descending
      const sorted = [...AppState.urls].sort((a,b) => b.clicks - a.clicks).slice(0, 4);
      sorted.forEach(link => {
        const row = document.createElement("div");
        row.className = "pop-link-row";
        row.innerHTML = `
          <div class="pop-link-details">
            <span class="pop-link-short" onclick="launchRedirectModalById('${link.id}')">${link.shortUrl}</span>
            <span class="pop-link-long" title="${link.originalUrl}">${link.originalUrl}</span>
          </div>
          <span class="pop-link-clicks"><i class="fa-solid fa-arrow-pointer"></i> ${link.clicks}</span>
        `;
        popContainer.appendChild(row);
      });
    }
  }
}

// -------------------------------------------------------------------
// INTERACTIVE NATIVE CANVAS CHARTS ENGINE
// -------------------------------------------------------------------

function renderAnalyticsCharts() {
  // Chart 1: Activity Timeline
  drawActivityTimelineChart();
  
  // Chart 2: Links click counts bar chart
  drawLinksClicksChart();
  
  // Chart 3: Domains Pie chart
  drawDomainsPieChart();
}

function getThemeColors() {
  const isLight = document.body.classList.contains("light-theme");
  return {
    text: isLight ? '#475569' : '#94a3b8',
    grid: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
    primary: isLight ? '#4f46e5' : '#6366f1',
    secondary: isLight ? '#0891b2' : '#06b6d4',
    success: '#10b981',
    danger: '#ef4444'
  };
}

function drawActivityTimelineChart() {
  const canvas = document.getElementById("chart-activity-timeline");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = getThemeColors();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Last 7 days
  const labels = [];
  const counts = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    labels.push(d.toLocaleDateString([], { weekday: 'short' }));
    
    const count = AppState.urls.filter(u => {
      return u.timestamp.split("T")[0] === dateStr;
    }).length;
    counts.push(count);
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
  
  // X labels
  const stepX = chartWidth / 6;
  labels.forEach((lbl, idx) => {
    const x = paddingLeft + stepX * idx;
    ctx.fillText(lbl, x - 8, canvas.height - 10);
  });
  
  // Plot line points
  const points = counts.map((val, idx) => {
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
  
  // Stroke path
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
  
  // Circle dots
  ctx.fillStyle = colors.secondary;
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function drawLinksClicksChart() {
  const canvas = document.getElementById("chart-link-clicks");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = getThemeColors();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (AppState.urls.length === 0) {
    ctx.fillStyle = colors.text;
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText("Create links to view click engagement charts.", 70, canvas.height / 2);
    return;
  }
  
  // Take top 5 links
  const topLinks = [...AppState.urls].sort((a,b) => b.clicks - a.clicks).slice(0, 5);
  
  const labels = topLinks.map(l => l.shortCode);
  const clicks = topLinks.map(l => l.clicks);
  
  const maxVal = Math.max(...clicks, 10);
  
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
  const barWidth = 35;
  const gap = (chartWidth - barWidth * clicks.length) / (clicks.length + 1);
  
  labels.forEach((lbl, idx) => {
    const val = clicks[idx];
    const x = paddingLeft + gap + (barWidth + gap) * idx;
    const y = 20 + chartHeight * (1 - val / maxVal);
    const h = chartHeight * (val / maxVal);
    
    // Bar fill with linear gradients
    const barGrad = ctx.createLinearGradient(x, y, x, y + h);
    barGrad.addColorStop(0, colors.secondary);
    barGrad.addColorStop(1, colors.primary);
    
    ctx.fillStyle = barGrad;
    ctx.fillRect(x, y, barWidth, h);
    
    // Label
    ctx.fillStyle = colors.text;
    const cleanLabel = lbl.length > 8 ? lbl.substring(0, 6) + ".." : lbl;
    ctx.fillText(cleanLabel, x - 2, canvas.height - 10);
  });
}

function drawDomainsPieChart() {
  const canvas = document.getElementById("chart-domain-shares");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colors = getThemeColors();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (AppState.urls.length === 0) {
    ctx.fillStyle = colors.text;
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText("No domains categorized yet.", 130, canvas.height / 2);
    return;
  }
  
  // Count domains
  const domainCounts = {};
  AppState.urls.forEach(u => {
    try {
      const hostname = new URL(u.originalUrl).hostname;
      const domain = hostname.replace("www.", "");
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    } catch(e) {
      domainCounts["other"] = (domainCounts["other"] || 0) + 1;
    }
  });
  
  const labels = Object.keys(domainCounts);
  const vals = Object.values(domainCounts);
  const total = vals.reduce((a, b) => a + b, 0);
  
  const slicesColors = [colors.primary, colors.secondary, colors.success, colors.danger, colors.warning];
  
  const centerX = canvas.width / 2.7;
  const centerY = canvas.height / 2;
  const radius = 80;
  
  let startAngle = 0;
  
  labels.forEach((lbl, idx) => {
    const val = vals[idx];
    const sliceAngle = (2 * Math.PI * val) / total;
    
    // Slice Arc
    ctx.fillStyle = slicesColors[idx % slicesColors.length];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();
    
    // Legend rows
    const legendX = canvas.width - 140;
    const legendY = 40 + idx * 30;
    
    ctx.fillRect(legendX, legendY, 12, 12);
    ctx.fillStyle = colors.text;
    ctx.font = "10px Inter, sans-serif";
    
    const pct = Math.round((val / total) * 100);
    const cleanLabel = lbl.length > 12 ? lbl.substring(0, 10) + ".." : lbl;
    ctx.fillText(`${cleanLabel} (${pct}%)`, legendX + 20, legendY + 10);
    
    startAngle += sliceAngle;
  });
}

// -------------------------------------------------------------------
// BOOTSTRAP RENDER UTILITIES
// -------------------------------------------------------------------

function renderAll() {
  renderDashboard();
  renderHistoryTable();
}
