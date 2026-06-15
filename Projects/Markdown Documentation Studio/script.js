/**
 * Markdown Documentation Studio Script
 */

const STORAGE_PREFIX = "docu_studio_";

// --- TEMPLATE DEFAULT CODES ---
const TEMPLATES = {
  api: `# API Reference Documentation

Welcome to the core service API documentation portal. All API endpoints require secure tokens authentication.

## Authentication
To access endpoints, pass the authorization JWT token inside the request header:
\`Authorization: Bearer <your_jwt_token>\`

---

## User Accounts API

### Get User Profile
\`GET /api/v1/users/:id\`

Retrieve core parameters of a registered user record.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| id | string | Yes | Unique user ID string |
| details | boolean | No | Fetch nested metadata logs |

#### Response payload (200 OK)
\`\`\`json
{
  "id": "usr_7812",
  "username": "sujal_architect",
  "role": "Administrator",
  "status": "active"
}
\`\`\`

---

## Development Milestones
Track implementation progress below:
- [x] Secure JWT endpoint auth verification
- [x] Refactor database tables joins query
- [ ] Implement Redis caches key-value layer
- [ ] Add rate limiter constraints gateway`,

  guide: `# Software Installation Guide

Follow this guide step-by-step to compile and deploy the application service locally.

## System Prerequisites
Ensure you have the following frameworks installed:
- **Node.js**: v18.10.0 or higher
- **Git CLI**: For repository checkouts
- **PostgreSQL**: Local database instance

---

## Setup Steps

### 1. Clone Codebase
Run git clone to copy files workspace:
\`\`\`bash
git clone https://github.com/SujalKamate/Web-Dev-Projects.git
\`\`\`

### 2. Configure Environment
Create a \`.env\` file in the root workspace folder:
\`\`\`env
PORT=8080
DB_HOST=127.0.0.1
DB_USER=postgres
DB_PASSWORD=secret
\`\`\`

### 3. Bootstrap Dependencies
Install required packages using npm:
\`\`\`bash
npm install
\`\`\`

### 4. Start Server
Run the local dev engine:
\`\`\`bash
npm run dev
\`\`\`

---

## Post-Install Checklist
- [x] Verify local port connection on :8080
- [ ] Complete database migrations queries
- [ ] Run automated build validation checks`,

  changelog: `# Software Release Notes

Details on recent features, optimizations, and bug fixes in this release.

## Version 2.5.0 (June 2026)
This release focuses on improving compiler dashboard layout panels and live sandboxes.

### Added Features
- Live vector compiler diagram builders
- Custom console output redirect trackers
- Drag-and-drop workspace snap rules

### Resolved Issues
- Fixed line-number gutter sync margins inside textareas
- Resolved local storage state synchronization delay
- Fixed mobile layout viewport overflow bugs

---

## Pre-Release Checkoff
- [x] Code reviews completed
- [x] Staging build verification passed
- [ ] Push tags to origin repository
- [ ] Update staging server instances`
};

// --- INITIAL STATE ---
let currentTemplate = "api";
let currentTheme = "github";
let docMarkdown = "";

// --- DOM ELEMENTS ---
const elements = {
  templateSelect: document.getElementById("template-select"),
  themeSelect: document.getElementById("theme-select"),
  btnExportMd: document.getElementById("btn-export-md"),
  btnExportPdf: document.getElementById("btn-export-pdf"),
  
  tocList: document.getElementById("toc-list"),
  statWords: document.getElementById("stat-words"),
  statChars: document.getElementById("stat-chars"),
  statReadTime: document.getElementById("stat-read-time"),
  
  markdownTextarea: document.getElementById("markdown-textarea"),
  editorLineNumbers: document.getElementById("editor-line-numbers"),
  previewArea: document.getElementById("preview-area"),
  indicatorSaved: document.getElementById("indicator-saved"),
  
  btnResetAppStorage: document.getElementById("btn-reset-app-storage")
};

// --- INITIALIZATION ---
function init() {
  loadFromLocalStorage();
  setupEventListeners();

  if (!docMarkdown) {
    loadSelectedTemplate();
  } else {
    elements.markdownTextarea.value = docMarkdown;
  }

  // Set selectors status
  elements.templateSelect.value = currentTemplate;
  elements.themeSelect.value = currentTheme;
  elements.previewArea.className = `preview-area ${currentTheme}-theme`;

  updateLineNumbers();
  compileMarkdown();
}

function loadFromLocalStorage() {
  try {
    const savedCode = localStorage.getItem(STORAGE_PREFIX + "code");
    const savedTemplate = localStorage.getItem(STORAGE_PREFIX + "template");
    const savedTheme = localStorage.getItem(STORAGE_PREFIX + "theme");
    
    if (savedCode) docMarkdown = savedCode;
    if (savedTemplate) currentTemplate = savedTemplate;
    if (savedTheme) currentTheme = savedTheme;
  } catch (e) {
    console.error("Local storage recovery failed:", e);
  }
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_PREFIX + "code", docMarkdown);
  localStorage.setItem(STORAGE_PREFIX + "template", currentTemplate);
  localStorage.setItem(STORAGE_PREFIX + "theme", currentTheme);
}

function loadSelectedTemplate() {
  const code = TEMPLATES[currentTemplate];
  if (code) {
    docMarkdown = code;
    elements.markdownTextarea.value = code;
    saveToLocalStorage();
    updateLineNumbers();
    compileMarkdown();
  }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Select switches
  elements.templateSelect.addEventListener("change", (e) => {
    currentTemplate = e.target.value;
    loadSelectedTemplate();
    saveToLocalStorage();
  });

  elements.themeSelect.addEventListener("change", (e) => {
    currentTheme = e.target.value;
    elements.previewArea.className = `preview-area ${currentTheme}-theme`;
    saveToLocalStorage();
  });

  // Editor typing compiler loop
  elements.markdownTextarea.addEventListener("input", () => {
    docMarkdown = elements.markdownTextarea.value;
    saveToLocalStorage();
    updateLineNumbers();
    compileMarkdown();
    triggerAutoSavedFeedback();
  });

  elements.markdownTextarea.addEventListener("keydown", handleTabKeys);

  // Toolbar format clicks
  document.querySelectorAll(".toolbar-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.getAttribute("data-tag");
      insertFormatTag(tag);
    });
  });

  // Action clicks
  elements.btnExportMd.addEventListener("click", downloadMDFile);
  elements.btnExportPdf.addEventListener("click", exportPDFDoc);
  elements.btnResetAppStorage.addEventListener("click", wipeStorageReset);

  // Sync scroll of editor and preview (approximate mapping)
  elements.markdownTextarea.addEventListener("scroll", () => {
    const editScrollPct = elements.markdownTextarea.scrollTop / (elements.markdownTextarea.scrollHeight - elements.markdownTextarea.clientHeight);
    elements.previewArea.scrollTop = editScrollPct * (elements.previewArea.scrollHeight - elements.previewArea.clientHeight);
  });
}

function handleTabKeys(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + "  " + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 2;
    updateLineNumbers();
  }
}

function updateLineNumbers() {
  const lines = elements.markdownTextarea.value.split("\n").length;
  elements.editorLineNumbers.innerHTML = "";
  for (let i = 1; i <= Math.max(lines, 1); i++) {
    elements.editorLineNumbers.insertAdjacentHTML("beforeend", `<div>${i}</div>`);
  }
}

function triggerAutoSavedFeedback() {
  elements.indicatorSaved.style.opacity = "1";
  setTimeout(() => {
    elements.indicatorSaved.style.opacity = "0.7";
  }, 1000);
}

// --- TOOLBAR SHORTCUT INJECTOR ---
function insertFormatTag(tag) {
  const txtarea = elements.markdownTextarea;
  const start = txtarea.selectionStart;
  const end = txtarea.selectionEnd;
  const selectedText = txtarea.value.substring(start, end);

  let formatted = "";
  let cursorOffset = 0;

  switch (tag) {
    case "h1":
      formatted = `\n# ${selectedText || "Heading 1"}\n`;
      cursorOffset = 3;
      break;
    case "h2":
      formatted = `\n## ${selectedText || "Heading 2"}\n`;
      cursorOffset = 4;
      break;
    case "bold":
      formatted = `**${selectedText || "bold text"}**`;
      cursorOffset = 2;
      break;
    case "italic":
      formatted = `*${selectedText || "italic text"}*`;
      cursorOffset = 1;
      break;
    case "code":
      formatted = `\n\`\`\`javascript\n${selectedText || "// code block"}\n\`\`\`\n`;
      cursorOffset = 15;
      break;
    case "link":
      formatted = `[${selectedText || "link text"}](https://example.com)`;
      cursorOffset = 1;
      break;
    case "table":
      formatted = `\n| Column 1 | Column 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n`;
      cursorOffset = 1;
      break;
    case "list":
      formatted = `\n- ${selectedText || "list item"}\n`;
      cursorOffset = 3;
      break;
    case "checklist":
      formatted = `\n- [ ] ${selectedText || "task item"}\n`;
      cursorOffset = 7;
      break;
    case "rule":
      formatted = `\n---\n`;
      cursorOffset = 5;
      break;
  }

  txtarea.value = txtarea.value.substring(0, start) + formatted + txtarea.value.substring(end);
  txtarea.focus();
  
  // Set selections range
  const newCursor = start + formatted.length;
  txtarea.setSelectionRange(newCursor, newCursor);

  docMarkdown = txtarea.value;
  saveToLocalStorage();
  updateLineNumbers();
  compileMarkdown();
}

// --- DYNAMIC MARKDOWN PARSER ---
function compileMarkdown() {
  const text = elements.markdownTextarea.value;
  const lines = text.split("\n");
  
  let html = "";
  let tocItems = []; // Heading models tracker

  let listType = null; // 'ul', 'ol', 'task', or null
  let tableRows = []; // holding cell arrays
  let inCodeBlock = false;
  let codeLang = "";
  let codeContent = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Code block tags handler
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // Close block
        html += `<pre><code class="lang-${codeLang}">${escapeHTML(codeContent.join("\n"))}</code></pre>`;
        inCodeBlock = false;
        codeContent = [];
      } else {
        inCodeBlock = true;
        codeLang = line.replace("```", "").trim() || "javascript";
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(rawLine);
      continue;
    }

    // 2. Table compile parser
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line.split("|")
        .map(c => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      tableRows.push(cells);
      continue;
    } else {
      if (tableRows.length > 0) {
        html += buildHTMLTable(tableRows);
        tableRows = [];
      }
    }

    // 3. Horizontal lines
    if (line === "---" || line === "***") {
      html += "<hr>";
      continue;
    }

    // 4. Blockquotes
    if (line.startsWith(">")) {
      const content = line.substring(1).trim();
      html += `<blockquote>${parseInlineMarkdown(content)}</blockquote>`;
      continue;
    }

    // 5. Headings
    if (line.startsWith("#")) {
      let level = 0;
      while (line[level] === "#") level++;
      
      if (level >= 1 && level <= 4) {
        const titleText = line.substring(level).trim();
        const slug = titleText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        
        tocItems.push({ level, text: titleText, id: slug });
        html += `<h${level} id="${slug}">${parseInlineMarkdown(titleText)}</h${level}>`;
        continue;
      }
    }

    // 6. Checklists / Lists
    const taskMatch = line.match(/^-\s*\[([ xX])\]\s*(.*)/);
    if (taskMatch) {
      if (listType !== "task") {
        closeList();
        listType = "task";
      }
      const checked = taskMatch[1].toLowerCase() === "x" ? "checked" : "";
      const taskText = taskMatch[2];
      // Store line index inside data tag for two-way checkbox sync clicks
      html += `
        <div class="task-line">
          <input type="checkbox" ${checked} data-source-line="${i}" class="preview-task-checkbox">
          <span>${parseInlineMarkdown(taskText)}</span>
        </div>
      `;
      continue;
    }

    const unorderedMatch = line.match(/^([-\*])\s+(.*)/);
    if (unorderedMatch) {
      if (listType !== "ul") {
        closeList();
        html += "<ul>";
        listType = "ul";
      }
      html += `<li>${parseInlineMarkdown(unorderedMatch[2])}</li>`;
      continue;
    }

    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      if (listType !== "ol") {
        closeList();
        html += "<ol>";
        listType = "ol";
      }
      html += `<li>${parseInlineMarkdown(orderedMatch[2])}</li>`;
      continue;
    }

    // Default: Close any lists and append paragraph if not empty
    closeList();

    if (line.length > 0) {
      html += `<p>${parseInlineMarkdown(rawLine)}</p>`;
    }
  }

  // Final tags cleans
  closeList();
  if (tableRows.length > 0) {
    html += buildHTMLTable(tableRows);
  }

  // Inject HTML to viewport
  elements.previewArea.innerHTML = html;

  // Setup TOC indexer sidebar
  renderTOC(tocItems);
  
  // Setup checkbox hooks
  setupCheckboxClickSync();

  // Update statistics metrics
  updateDocumentStatistics(text);

  function closeList() {
    if (listType === "ul") html += "</ul>";
    if (listType === "ol") html += "</ol>";
    listType = null;
  }
}

// Inline tags: Bold, Italic, inline code, links
function parseInlineMarkdown(text) {
  let escaped = escapeHTML(text);

  // Bold
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  // Italic
  escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
  
  // Inline Code
  escaped = escaped.replace(/\`(.*?)\`/g, "<code>$1</code>");

  // Links [label](url)
  escaped = escaped.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images ![alt](url)
  escaped = escaped.replace(/\!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%; border-radius:4px; margin: 10px 0;">');

  return escaped;
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}

function buildHTMLTable(rows) {
  let table = "<table><thead><tr>";
  
  // Headers row
  const headers = rows[0];
  headers.forEach(h => {
    table += `<th>${parseInlineMarkdown(h)}</th>`;
  });
  table += "</tr></thead><tbody>";

  // Skip second row if separator (e.g. contain dash: ---)
  let startIdx = 1;
  if (rows[1] && rows[1].every(cell => cell.includes("---") || cell.includes("-"))) {
    startIdx = 2;
  }

  for (let i = startIdx; i < rows.length; i++) {
    table += "<tr>";
    rows[i].forEach(cell => {
      table += `<td>${parseInlineMarkdown(cell)}</td>`;
    });
    table += "</tr>";
  }

  table += "</tbody></table>";
  return table;
}

// --- TABLE OF CONTENTS INDEXER ---
function renderTOC(items) {
  elements.tocList.innerHTML = "";
  if (items.length === 0) {
    elements.tocList.innerHTML = '<li class="text-muted" style="font-size:0.8rem; font-style:italic;">No headings detected</li>';
    return;
  }

  items.forEach(item => {
    const li = document.createElement("li");
    const link = document.createElement("span");
    link.className = `toc-link toc-indent-${item.level}`;
    link.textContent = item.text;
    
    // Smooth scroll navigation trigger on click
    link.addEventListener("click", () => {
      const headingEl = document.getElementById(item.id);
      if (headingEl) {
        headingEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    li.appendChild(link);
    elements.tocList.appendChild(li);
  });
}

// --- TWO-WAY CHECKLIST CHECKBOX SYNCS ---
function setupCheckboxClickSync() {
  document.querySelectorAll(".preview-task-checkbox").forEach(box => {
    box.addEventListener("change", (e) => {
      const lineIndex = parseInt(box.getAttribute("data-source-line"));
      const isChecked = box.checked;

      const txtarea = elements.markdownTextarea;
      const lines = txtarea.value.split("\n");
      
      const targetLine = lines[lineIndex];
      if (targetLine) {
        // Replace matching prefix
        if (isChecked) {
          lines[lineIndex] = targetLine.replace(/-\s*\[\s*\]/, "- [x]");
        } else {
          lines[lineIndex] = targetLine.replace(/-\s*\[[xX]\]/, "- [ ]");
        }

        // Apply back to editor
        txtarea.value = lines.join("\n");
        docMarkdown = txtarea.value;
        saveToLocalStorage();
        updateLineNumbers();
        compileMarkdown();
        triggerAutoSavedFeedback();
      }
    });
  });
}

// --- DOCUMENT PERFORMANCE STATS ---
function updateDocumentStatistics(text) {
  const chars = text.length;
  elements.statChars.textContent = chars;

  // Words count calculation
  const clean = text.trim();
  const words = clean === "" ? 0 : clean.split(/\s+/).length;
  elements.statWords.textContent = words;

  // Average read speed: 200 words per minute
  const readMins = Math.max(1, Math.round(words / 200));
  elements.statReadTime.textContent = `${readMins} min`;
}

// --- EXPORT OPERATIONS ---
function downloadMDFile() {
  const text = elements.markdownTextarea.value;
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `document-${currentTemplate}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportPDFDoc() {
  // Opens native print dialog. CSS media queries inside style.css 
  // will print the preview layout document clean without sidemargins sidebar
  window.print();
}

function wipeStorageReset() {
  if (confirm("Reset current document edits and restore default template values?")) {
    localStorage.removeItem(STORAGE_PREFIX + "code");
    localStorage.removeItem(STORAGE_PREFIX + "template");
    localStorage.removeItem(STORAGE_PREFIX + "theme");
    
    currentTemplate = "api";
    currentTheme = "github";
    
    elements.templateSelect.value = "api";
    elements.themeSelect.value = "github";
    elements.previewArea.className = "preview-area github-theme";

    init();
  }
}

// Start application
window.addEventListener("DOMContentLoaded", init);
