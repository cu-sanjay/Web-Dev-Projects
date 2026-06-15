/**
 * Code Snippet Manager & Sandbox Core JavaScript
 */

const STORAGE_PREFIX = "snippet_vault_";

// --- DEFAULT SEED DATA ---
const DEFAULT_SNIPPETS = [
  {
    id: "snip-1",
    title: "Neumorphic Soft Button UI",
    description: "Responsive web component showing soft box shadows.",
    language: "html",
    category: "frontend",
    tags: ["css", "neumorphism", "frontend"],
    code: `<div class="container">
  <button class="neumorphic-btn">Explore Vault</button>
</div>

<style>
  body {
    background: #e0e8f0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-family: 'Inter', sans-serif;
  }
  .neumorphic-btn {
    padding: 16px 32px;
    border: none;
    border-radius: 12px;
    background: #e0e8f0;
    color: #4b5563;
    font-weight: 600;
    font-size: 1rem;
    box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .neumorphic-btn:hover {
    color: #1e293b;
    box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff;
  }
  .neumorphic-btn:active {
    box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
  }
</style>`,
    favorite: true,
    updatedAt: "2026-06-15T03:00:00Z"
  },
  {
    id: "snip-2",
    title: "Array Binary Search Algorithm",
    description: "Quick logarithmic search helper for sorted values lists.",
    language: "javascript",
    category: "utilities",
    tags: ["algorithms", "arrays", "search"],
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const list = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const search = 23;
console.log("Sorted Array:", list);
console.log("Searching for target value:", search);

const index = binarySearch(list, search);
console.log("Index location found:", index);
`,
    favorite: false,
    updatedAt: "2026-06-15T02:30:00Z"
  },
  {
    id: "snip-3",
    title: "Fetch JSON Data via URL",
    description: "Simulated Python utility using urllib request.",
    language: "python",
    category: "backend",
    tags: ["python", "api", "json"],
    code: `import json
import urllib.request

url = "https://jsonplaceholder.typicode.com/posts/1"
print(f"Initializing connection to: {url}")

try:
    response = urllib.request.urlopen(url)
    data = json.loads(response.read().decode())
    
    print("\\n--- Query Response Logs ---")
    print(f"Record Title: {data['title']}")
    print(f"Description : {data['body']}")
except Exception as e:
    print(f"Fetch failed: {e}")
`,
    favorite: false,
    updatedAt: "2026-06-15T02:00:00Z"
  },
  {
    id: "snip-4",
    title: "Query Top Subscribed Payments",
    description: "Aggregation join SQL query with limits grouping.",
    language: "sql",
    category: "data",
    tags: ["sql", "queries", "database"],
    code: `SELECT u.id, u.username, s.plan_name, p.amount
FROM users u
INNER JOIN subscriptions s ON u.id = s.user_id
INNER JOIN payments p ON s.id = p.sub_id
WHERE p.amount > 49.00
ORDER BY p.amount DESC
LIMIT 4;`,
    favorite: true,
    updatedAt: "2026-06-15T01:45:00Z"
  }
];

const FILENAMES = {
  html: "index.html",
  javascript: "script.js",
  css: "style.css",
  python: "app.py",
  sql: "query.sql",
  cpp: "main.cpp",
  go: "main.go"
};

// --- STATE MANAGER ---
let snippets = [];
let activeSnippetId = null;

let searchQuery = "";
let filterCategory = "all";
let filterFavorites = false;
let activeTagFilter = "";

// --- DOM ELEMENTS ---
const elements = {
  statTotalCount: document.getElementById("stat-total-count"),
  statStarCount: document.getElementById("stat-star-count"),
  btnNewSnippet: document.getElementById("btn-new-snippet"),
  btnExportLibrary: document.getElementById("btn-export-library"),
  inputImportFile: document.getElementById("input-import-file"),
  
  inputSearch: document.getElementById("input-search"),
  btnFilterFav: document.getElementById("btn-filter-fav"),
  btnClearFilters: document.getElementById("btn-clear-filters"),
  categoriesList: document.getElementById("categories-list"),
  snippetsList: document.getElementById("snippets-list"),
  
  // Editor values
  snippetTitle: document.getElementById("snippet-title"),
  btnToggleFavorite: document.getElementById("btn-toggle-favorite"),
  selectLanguage: document.getElementById("select-language"),
  selectCategory: document.getElementById("select-category"),
  snippetTags: document.getElementById("snippet-tags"),
  snippetDesc: document.getElementById("snippet-desc"),
  tabFilename: document.getElementById("tab-filename"),
  btnCopyCode: document.getElementById("btn-copy-code"),
  btnRunCode: document.getElementById("btn-run-code"),
  
  editorTextarea: document.getElementById("editor-textarea"),
  editorLineNumbers: document.getElementById("editor-line-numbers"),
  
  // Console
  tabBtnPreview: document.getElementById("tab-btn-preview"),
  tabBtnTerminal: document.getElementById("tab-btn-terminal"),
  runnerPanePreview: document.getElementById("runner-pane-preview"),
  runnerPaneTerminal: document.getElementById("runner-pane-terminal"),
  sandboxIframe: document.getElementById("sandbox-iframe"),
  sandboxIdleMsg: document.getElementById("sandbox-idle-msg"),
  terminalStdout: document.getElementById("terminal-stdout"),
  
  // Tag cloud
  tagCloud: document.getElementById("tag-cloud"),
  
  // Operations
  btnSaveSnippet: document.getElementById("btn-save-snippet"),
  btnDeleteSnippet: document.getElementById("btn-delete-snippet"),
  btnClearVault: document.getElementById("btn-clear-vault"),
  btnResetStorage: document.getElementById("btn-reset-storage")
};

// --- INITIALIZATION ---
function init() {
  loadFromLocalStorage();
  setupEventListeners();
  setupIframeConsoleListener();

  if (snippets.length === 0) {
    seedDefaultData();
  }

  refreshList();
  renderTagCloud();
  updateGlobalStats();
  
  if (snippets.length > 0) {
    selectSnippet(snippets[0].id);
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + "snippets");
    if (saved) snippets = JSON.parse(saved);
  } catch (e) {
    console.error("Local storage sync restore failed:", e);
  }
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_PREFIX + "snippets", JSON.stringify(snippets));
  updateGlobalStats();
}

function seedDefaultData() {
  snippets = JSON.parse(JSON.stringify(DEFAULT_SNIPPETS));
  saveToLocalStorage();
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Navigation & Creation
  elements.btnNewSnippet.addEventListener("click", createNewSnippet);
  elements.btnExportLibrary.addEventListener("click", exportLibraryJSON);
  elements.inputImportFile.addEventListener("change", importLibraryJSON);

  // Search Filters
  elements.inputSearch.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    refreshList();
    toggleClearFiltersBtn();
  });

  elements.btnFilterFav.addEventListener("click", () => {
    filterFavorites = !filterFavorites;
    elements.btnFilterFav.classList.toggle("active", filterFavorites);
    refreshList();
    toggleClearFiltersBtn();
  });

  elements.btnClearFilters.addEventListener("click", clearActiveFilters);

  // Category filters Click
  elements.categoriesList.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {
      elements.categoriesList.querySelectorAll("li").forEach(x => x.classList.remove("active"));
      li.classList.add("active");
      filterCategory = li.getAttribute("data-cat");
      refreshList();
    });
  });

  // Editor syncing inputs
  elements.editorTextarea.addEventListener("input", () => {
    updateLineNumbers();
  });

  elements.selectLanguage.addEventListener("change", (e) => {
    const lang = e.target.value;
    elements.tabFilename.textContent = FILENAMES[lang] || "main.js";
  });

  elements.btnToggleFavorite.addEventListener("click", () => {
    if (activeSnippetId) {
      const snip = snippets.find(s => s.id === activeSnippetId);
      if (snip) {
        snip.favorite = !snip.favorite;
        elements.btnToggleFavorite.classList.toggle("active", snip.favorite);
        saveToLocalStorage();
        refreshList();
      }
    }
  });

  // Operations
  elements.btnRunCode.addEventListener("click", executeSnippetSandbox);
  elements.btnCopyCode.addEventListener("click", copyCodeToClipboard);
  elements.btnSaveSnippet.addEventListener("click", saveSnippetFieldsChanges);
  elements.btnDeleteSnippet.addEventListener("click", deleteActiveSnippet);
  elements.btnClearVault.addEventListener("click", clearAllVaultData);
  elements.btnResetStorage.addEventListener("click", wipeStorageResetData);

  // Tabs switches
  elements.tabBtnPreview.addEventListener("click", () => switchRunnerTab("preview"));
  elements.tabBtnTerminal.addEventListener("click", () => switchRunnerTab("terminal"));
}

// Override console messages inside sandboxed scripts
function setupIframeConsoleListener() {
  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "sandbox-console") {
      writeToTerminal(e.data.content, e.data.logType || "stdout");
    }
  });
}

// --- CORE UTILITIES: NEW, SAVE, DELETE ---
function createNewSnippet() {
  const id = `snip-${Date.now()}`;
  const newSnip = {
    id,
    title: "Untitled Snippet",
    description: "Brief summary description.",
    language: "javascript",
    category: "frontend",
    tags: ["new"],
    code: `// Write code here...\nconsole.log("Hello Sandbox!");`,
    favorite: false,
    updatedAt: new Date().toISOString()
  };

  snippets.unshift(newSnip);
  saveToLocalStorage();
  refreshList();
  renderTagCloud();
  selectSnippet(id);
}

function selectSnippet(id) {
  activeSnippetId = id;
  const snip = snippets.find(s => s.id === id);
  if (!snip) return;

  // Set card active classes
  document.querySelectorAll(".snippet-card").forEach(c => c.classList.remove("active-card"));
  const card = document.getElementById(id);
  if (card) card.classList.add("active-card");

  // Populate editor forms
  elements.snippetTitle.value = snip.title;
  elements.snippetDesc.value = snip.description;
  elements.selectLanguage.value = snip.language;
  elements.selectCategory.value = snip.category;
  elements.snippetTags.value = snip.tags.join(", ");
  elements.editorTextarea.value = snip.code;
  elements.tabFilename.textContent = FILENAMES[snip.language] || "main.js";

  elements.btnToggleFavorite.classList.toggle("active", snip.favorite);

  updateLineNumbers();
  clearSandboxAndTerminal();
}

function saveSnippetFieldsChanges() {
  if (!activeSnippetId) return;
  const snip = snippets.find(s => s.id === activeSnippetId);
  if (!snip) return;

  snip.title = elements.snippetTitle.value.trim() || "Untitled Snippet";
  snip.description = elements.snippetDesc.value.trim();
  snip.language = elements.selectLanguage.value;
  snip.category = elements.selectCategory.value;
  snip.code = elements.editorTextarea.value;
  snip.updatedAt = new Date().toISOString();
  
  // Parse tags
  const tagsStr = elements.snippetTags.value;
  snip.tags = tagsStr.split(",")
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);

  saveToLocalStorage();
  refreshList();
  renderTagCloud();
  alert("Snippet changes saved successfully.");
}

function deleteActiveSnippet() {
  if (!activeSnippetId) return;
  if (confirm("Delete the currently selected snippet?")) {
    snippets = snippets.filter(s => s.id !== activeSnippetId);
    activeSnippetId = null;
    saveToLocalStorage();
    refreshList();
    renderTagCloud();
    
    if (snippets.length > 0) {
      selectSnippet(snippets[0].id);
    } else {
      clearEditorPane();
    }
  }
}

function clearEditorPane() {
  elements.snippetTitle.value = "";
  elements.snippetDesc.value = "";
  elements.snippetTags.value = "";
  elements.editorTextarea.value = "";
  elements.editorLineNumbers.innerHTML = "<div>1</div>";
  elements.tabFilename.textContent = "main.js";
  elements.btnToggleFavorite.classList.remove("active");
  clearSandboxAndTerminal();
}

// --- RENDER SIDEBAR LIST & FILTER LABELS ---
function refreshList() {
  elements.snippetsList.innerHTML = "";
  
  // Filter matching state queries
  let filtered = snippets;

  if (filterCategory !== "all") {
    filtered = filtered.filter(s => s.category === filterCategory);
  }

  if (filterFavorites) {
    filtered = filtered.filter(s => s.favorite === true);
  }

  if (activeTagFilter) {
    filtered = filtered.filter(s => s.tags.includes(activeTagFilter));
  }

  if (searchQuery) {
    filtered = filtered.filter(s => {
      return s.title.toLowerCase().includes(searchQuery) ||
             s.description.toLowerCase().includes(searchQuery) ||
             s.tags.some(t => t.includes(searchQuery)) ||
             s.code.toLowerCase().includes(searchQuery);
    });
  }

  if (filtered.length === 0) {
    elements.snippetsList.innerHTML = '<div class="empty-list-msg">No matching snippets</div>';
    return;
  }

  filtered.forEach(snip => {
    const cardHTML = `
      <div class="snippet-card ${activeSnippetId === snip.id ? 'active-card' : ''}" id="${snip.id}">
        <div class="snippet-card-header">
          <span class="title">${snip.title}</span>
          ${snip.favorite ? '<i class="fa-solid fa-star star-icon"></i>' : ''}
        </div>
        <div class="snippet-card-meta">
          <span class="lang-badge">${snip.language}</span>
          <span class="date-label">${formatShortDate(snip.updatedAt)}</span>
        </div>
      </div>
    `;
    elements.snippetsList.insertAdjacentHTML("beforeend", cardHTML);

    const el = document.getElementById(snip.id);
    el.addEventListener("click", () => selectSnippet(snip.id));
  });
}

function renderTagCloud() {
  elements.tagCloud.innerHTML = "";
  
  // Calculate frequencies
  const tagsMap = {};
  snippets.forEach(s => {
    s.tags.forEach(t => {
      tagsMap[t] = (tagsMap[t] || 0) + 1;
    });
  });

  const uniqueTags = Object.keys(tagsMap);
  if (uniqueTags.length === 0) {
    elements.tagCloud.innerHTML = '<span class="text-muted" style="font-size:0.8rem; font-style:italic;">No tags indexed</span>';
    return;
  }

  uniqueTags.forEach(tag => {
    const pill = document.createElement("span");
    pill.className = `tag-pill ${activeTagFilter === tag ? 'active' : ''}`;
    pill.textContent = `${tag} (${tagsMap[tag]})`;
    
    pill.addEventListener("click", () => {
      if (activeTagFilter === tag) {
        activeTagFilter = ""; // Toggle clear
      } else {
        activeTagFilter = tag;
      }
      renderTagCloud();
      refreshList();
      toggleClearFiltersBtn();
    });

    elements.tagCloud.appendChild(pill);
  });
}

function toggleClearFiltersBtn() {
  if (searchQuery || filterFavorites || activeTagFilter) {
    elements.btnClearFilters.classList.remove("hidden");
  } else {
    elements.btnClearFilters.classList.add("hidden");
  }
}

function clearActiveFilters() {
  searchQuery = "";
  filterFavorites = false;
  activeTagFilter = "";

  elements.inputSearch.value = "";
  elements.btnFilterFav.classList.remove("active");
  elements.btnClearFilters.classList.add("hidden");

  // Reset tag pills styling
  document.querySelectorAll(".tag-pill").forEach(p => p.classList.remove("active"));

  refreshList();
  renderTagCloud();
}

function updateGlobalStats() {
  elements.statTotalCount.textContent = snippets.length;
  elements.statStarCount.textContent = snippets.filter(s => s.favorite).length;
}

function updateLineNumbers() {
  const text = elements.editorTextarea.value;
  const lines = text.split("\n").length;
  elements.editorLineNumbers.innerHTML = "";
  for (let i = 1; i <= Math.max(lines, 1); i++) {
    elements.editorLineNumbers.insertAdjacentHTML("beforeend", `<div>${i}</div>`);
  }
}

// --- TAB VIEWS SWITCHERS ---
function switchRunnerTab(tab) {
  if (tab === "preview") {
    elements.tabBtnPreview.classList.add("active");
    elements.tabBtnTerminal.classList.remove("active");
    elements.runnerPanePreview.classList.add("active");
    elements.runnerPaneTerminal.classList.remove("active");
  } else {
    elements.tabBtnTerminal.classList.add("active");
    elements.tabBtnPreview.classList.remove("active");
    elements.runnerPaneTerminal.classList.add("active");
    elements.runnerPanePreview.classList.remove("active");
  }
}

// --- SANDBOX AND CODE EXECUTIONS ---
function clearSandboxAndTerminal() {
  elements.sandboxIframe.srcdoc = "";
  elements.sandboxIframe.classList.add("hidden");
  elements.sandboxIdleMsg.classList.remove("hidden");
  elements.terminalStdout.innerHTML = `
    <div class="terminal-line text-muted">Console output logs screen.</div>
    <div class="terminal-line text-muted">Run Python, SQL, C++, Go snippets to verify results.</div>
    <br>
  `;
}

function writeToTerminal(text, type = "stdout") {
  const line = document.createElement("div");
  line.className = `terminal-line ${type === 'error' ? 'text-error' : (type === 'system' ? 'text-accent' : 'text-success')}`;
  line.textContent = text;
  elements.terminalStdout.appendChild(line);
  elements.terminalStdout.scrollTop = elements.terminalStdout.scrollHeight;
}

function executeSnippetSandbox() {
  const lang = elements.selectLanguage.value;
  const code = elements.editorTextarea.value;

  if (lang === "html" || lang === "javascript" || lang === "css") {
    // WEB SANDBOX RUNNER
    elements.sandboxIdleMsg.classList.add("hidden");
    elements.sandboxIframe.classList.remove("hidden");

    let docStr = "";

    if (lang === "html") {
      // Overrides console log inside html
      docStr = injectConsoleRedirect(code);
    } else if (lang === "css") {
      // Simple preview box styles
      docStr = `
        <!DOCTYPE html>
        <html>
        <head><style>${code}</style></head>
        <body>
          <div class="test-element">Styled Render Output Viewport</div>
          <div style="font-size:0.75rem; margin-top:20px; color:#4b5563;">CSS rules loaded successfully.</div>
        </body>
        </html>
      `;
    } else if (lang === "javascript") {
      // Run script in empty page with log listener
      docStr = injectConsoleRedirect(`
        <script>
          try {
            ${code}
          } catch(err) {
            console.error("Uncaught: " + err.message);
          }
        </script>
      `);
    }

    // Load inside iframe
    elements.sandboxIframe.srcdoc = docStr;
    
    // Auto switch to matching preview pane tabs
    if (lang === "javascript") {
      switchRunnerTab("terminal");
      writeToTerminal("Initializing JavaScript sandbox runtime...", "system");
    } else {
      switchRunnerTab("preview");
    }

  } else {
    // BACKEND SIMULATED COMPILERS
    switchRunnerTab("terminal");
    elements.terminalStdout.innerHTML = "";
    writeToTerminal(`Initializing simulated execution compiler runtime: [${lang.toUpperCase()}]`, "system");
    
    setTimeout(() => {
      runSimulatedBackendCode(lang, code);
    }, 500);
  }
}

// Redirect console.log statements inside running scripts to the parent UI console window.
function injectConsoleRedirect(htmlCode) {
  const consoleScript = `
    <script>
      (function() {
        const _log = console.log;
        const _error = console.error;
        const _warn = console.warn;

        console.log = function(...args) {
          _log.apply(console, args);
          window.parent.postMessage({ type: 'sandbox-console', content: args.join(' '), logType: 'stdout' }, '*');
        };

        console.error = function(...args) {
          _error.apply(console, args);
          window.parent.postMessage({ type: 'sandbox-console', content: 'Error: ' + args.join(' '), logType: 'error' }, '*');
        };

        console.warn = function(...args) {
          _warn.apply(console, args);
          window.parent.postMessage({ type: 'sandbox-console', content: 'Warning: ' + args.join(' '), logType: 'warning' }, '*');
        };

        // Catch runtime global errors
        window.onerror = function(msg, url, line) {
          window.parent.postMessage({ type: 'sandbox-console', content: 'Exception: ' + msg + ' at line ' + line, logType: 'error' }, '*');
          return false;
        };
      })();
    </script>
  `;

  // Prepend interceptor scripts to head
  if (htmlCode.includes("<head>")) {
    return htmlCode.replace("<head>", `<head>${consoleScript}`);
  }
  return consoleScript + htmlCode;
}

// Backend Simulator compiler rules
function runSimulatedBackendCode(lang, code) {
  writeToTerminal("Process spawned. Compiling codebase...", "system");

  if (lang === "python") {
    // Parse print statements using regex
    const printRegex = /print\s*\(\s*(f?["'])(.*?)\1\s*\)/g;
    let match;
    let printed = false;

    // Check if urllib is present to output response mock
    if (code.includes("urllib.request")) {
      writeToTerminal("Initializing connection to: https://jsonplaceholder.typicode.com/posts/1");
      writeToTerminal("\n--- Query Response Logs ---");
      writeToTerminal("Record Title: sunt aut facere repellat provident occaecati excepturi optio reprehenderit");
      writeToTerminal("Description : quia et suscipit\\nsuscipit recusandae consequuntur expedita et cum\\nreprehenderit molestiae ut ut quas totam");
      writeToTerminal("\nProcess terminated with exit code 0", "system");
      return;
    }

    while ((match = printRegex.exec(code)) !== null) {
      printed = true;
      let text = match[2];
      // Format escaped characters or basic variables placeholders
      text = text.replace(/\\n/g, "\n");
      text = text.replace(/\{.*?\}/g, "(value)");
      writeToTerminal(text);
    }

    if (!printed) {
      writeToTerminal("Process compiled successfully. Output stream was empty.");
    }
    writeToTerminal("\nProcess terminated with exit code 0", "system");

  } else if (lang === "sql") {
    // Draw ASCII tables simulated outputs
    writeToTerminal("Database connection established.");
    writeToTerminal("Executing SQL Statement query...");
    
    setTimeout(() => {
      writeToTerminal("\n+----+------------------+------------------+-------------+");
      writeToTerminal("| ID | USERNAME         | PLAN_NAME        | AMOUNT_PAID |");
      writeToTerminal("+----+------------------+------------------+-------------+");
      writeToTerminal("|  4 | alex_dev         | Pro Annual       |      $99.00 |");
      writeToTerminal("|  9 | sarah_k          | Pro Monthly      |      $59.00 |");
      writeToTerminal("|  2 | sujal_architect  | Enterprise       |     $499.00 |");
      writeToTerminal("| 15 | test_dummy       | Dev Monthly      |      $19.00 |");
      writeToTerminal("+----+------------------+------------------+-------------+");
      writeToTerminal("4 rows returned in query execution (latency: 14ms)");
    }, 400);

  } else if (lang === "cpp") {
    // Simple build simulation logs
    writeToTerminal("Building output executable: 'g++ main.cpp -o main'...");
    setTimeout(() => {
      writeToTerminal("Compilation successful. Running target './main'...");
      writeToTerminal("Standard Output:\n");
      writeToTerminal("Hello from Compiled C++ Studio Simulator!");
      writeToTerminal("\nProcess finished with exit code 0", "system");
    }, 600);

  } else if (lang === "go") {
    writeToTerminal("Compiling Go binary 'go build'...");
    setTimeout(() => {
      writeToTerminal("Standard Output:\n");
      writeToTerminal("Go runtime initiated successfully.");
      writeToTerminal("Server listening on http://localhost:8080");
      writeToTerminal("Signal intercept triggered. Shutdown safe.");
      writeToTerminal("\nProcess finished with exit code 0", "system");
    }, 500);
  }
}

// --- FILE ACTIONS (BACKUP IMPORTS / EXPORTS) ---
function exportLibraryJSON() {
  const text = JSON.stringify(snippets, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `snippets-vault-backup.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importLibraryJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (Array.isArray(parsed)) {
        // Simple merge
        parsed.forEach(p => {
          if (p.id && p.title && p.code) {
            const exists = snippets.some(s => s.id === p.id);
            if (!exists) snippets.unshift(p);
          }
        });
        saveToLocalStorage();
        refreshList();
        renderTagCloud();
        alert("JSON Snippet Library restored successfully.");
      } else {
        alert("Error: File format must contain an array of snippets.");
      }
    } catch(err) {
      alert("Failed to parse JSON backup file: " + err.message);
    }
  };
  reader.readAsText(file);
}

function copyCodeToClipboard() {
  const code = elements.editorTextarea.value;
  navigator.clipboard.writeText(code).then(() => {
    alert("Snippet code copied to clipboard!");
  }).catch(e => {
    console.error("Clipboard copy failed:", e);
  });
}

// --- WORKSPACE CLEANS ---
function clearAllVaultData() {
  if (confirm("Permanently wipe your entire snippet library? This cannot be undone.")) {
    snippets = [];
    activeSnippetId = null;
    saveToLocalStorage();
    refreshList();
    renderTagCloud();
    clearEditorPane();
    alert("Snippet Library wiped.");
  }
}

function wipeStorageResetData() {
  if (confirm("Restore SnippetVault back to clean default templates?")) {
    localStorage.removeItem(STORAGE_PREFIX + "snippets");
    activeSnippetId = null;
    init();
    alert("Workspace restored to default database states.");
  }
}

// --- DATE FORMAT HELPER ---
function formatShortDate(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const options = { month: "short", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

// Launch application
window.addEventListener("DOMContentLoaded", init);
