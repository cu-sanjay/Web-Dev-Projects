/**
 * Markdown Studio - Core Application Logic
 * Implements states, regex markdown parser, canvas analytics, CRUD, and backup portability.
 */

// ==========================================================================
// 1. Initial State & Sample Data
// ==========================================================================

const SAMPLE_NOTES = [
  {
    id: "1",
    title: "Welcome to Markdown Studio 🚀",
    content: `# Welcome to Markdown Studio!

Markdown Studio is a real-time split-pane Markdown editor and organizer built entirely client-side.

## 🚀 Key Features

1. **Split-pane View**: Write in the editor panel and watch formatting updates in real-time.
2. **Organize**: Tag your notes and assign them to categories.
3. **Data Security**: Keep your data safe offline using local storage, or export full JSON backups.
4. **Productivity Analytics**: View total word distribution counts and categories inside the analytics panel.

---

## 📝 Markdown Elements Cheat-Sheet

Here is a quick overview of elements you can write:

### 1. Formatting
You can make text **bold**, *italic*, or even \`inline code\`.

### 2. Blockquotes
> "Logic will get you from A to B. Imagination will take you everywhere." — Albert Einstein

### 3. Lists
- Unordered list item 1
- Unordered list item 2

1. Ordered list item 1
2. Ordered list item 2

### 4. Simple Tables

| Feature | Support | Performance |
| :--- | :---: | :---: |
| Split View | Yes | Fast |
| Analytics | Yes | Real-time |
| Local Save | Yes | Offline |

### 5. Links & Images
You can embed links like [Antigravity GitHub](https://github.com) or images.
`,
    category: "Welcome",
    tags: ["guide", "markdown", "tutorial"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Quick Ideas & Thoughts 💡",
    content: `# Ideas Scratchpad

- Design a glassmorphic dashboard interface for the productivity tools.
- Implement an offline-first state machine for notes categorization.
- Optimize the HTML parsing code blocks.
`,
    category: "Ideas",
    tags: ["scratchpad", "design"],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  }
];

let notes = [];
let activeNoteId = null;
let activeCategory = "all";
let activeTag = null;
let searchQuery = "";
let autoSaveTimeout = null;

// ==========================================================================
// 2. Custom Safe Markdown Parser Engine
// ==========================================================================

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseMarkdown(markdownText) {
  if (!markdownText) return "";

  // 1. Split into lines
  const lines = markdownText.split("\n");
  let htmlResult = [];
  let inList = false;
  let listType = null; // 'ul' or 'ol'
  let inCodeBlock = false;
  let codeBlockLines = [];
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // --- Code Blocks Handling ---
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // Close code block
        const codeContent = escapeHtml(codeBlockLines.join("\n"));
        htmlResult.push(`<pre><code>${codeContent}</code></pre>`);
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // --- Table Handling ---
    const isTableRow = line.trim().startsWith("|") && line.trim().endsWith("|");
    if (isTableRow) {
      const cells = line.split("|")
        .map(c => c.trim())
        .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      // Check if it's separator row (e.g., | :--- | --- |)
      const isSeparator = cells.every(cell => /^:?-+:?$/.test(cell));

      if (isSeparator) {
        // Just skip separator definition lines
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      if (inTable) {
        // Output complete table structure
        let tableHtml = "<table><thead><tr>";
        tableHeaders.forEach(th => {
          tableHtml += `<th>${parseInlineMarkdown(th)}</th>`;
        });
        tableHtml += "</tr></thead><tbody>";
        tableRows.forEach(row => {
          tableHtml += "<tr>";
          row.forEach(td => {
            tableHtml += `<td>${parseInlineMarkdown(td)}</td>`;
          });
          tableHtml += "</tr>";
        });
        tableHtml += "</tbody></table>";
        htmlResult.push(tableHtml);

        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    }

    // --- Lists Handling ---
    const ulMatch = line.match(/^[\*\-\+]\s+(.*)/);
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);

    if (ulMatch) {
      if (!inList || listType !== "ul") {
        if (inList) htmlResult.push(`</${listType}>`);
        htmlResult.push("<ul>");
        inList = true;
        listType = "ul";
      }
      htmlResult.push(`<li>${parseInlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    if (olMatch) {
      if (!inList || listType !== "ol") {
        if (inList) htmlResult.push(`</${listType}>`);
        htmlResult.push("<ol>");
        inList = true;
        listType = "ol";
      }
      htmlResult.push(`<li>${parseInlineMarkdown(olMatch[2])}</li>`);
      continue;
    }

    if (inList && !ulMatch && !olMatch && line.trim() !== "") {
      // Allow multi-line lists or close them
      if (line.startsWith("    ") || line.startsWith("\t")) {
        htmlResult.push(`<br>${parseInlineMarkdown(line.trim())}`);
        continue;
      }
    }

    if (inList && line.trim() === "") {
      htmlResult.push(`</${listType}>`);
      inList = false;
      listType = null;
      continue;
    }

    // --- Headers Handling ---
    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      htmlResult.push(`<h${level}>${parseInlineMarkdown(headerMatch[2])}</h${level}>`);
      continue;
    }

    // --- Horizontal Rule ---
    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      htmlResult.push("<hr>");
      continue;
    }

    // --- Blockquote Handling ---
    if (line.trim().startsWith(">")) {
      const quoteText = line.trim().substring(1).trim();
      htmlResult.push(`<blockquote>${parseInlineMarkdown(quoteText)}</blockquote>`);
      continue;
    }

    // --- Plain Paragraphs ---
    if (line.trim() !== "") {
      htmlResult.push(`<p>${parseInlineMarkdown(line)}</p>`);
    } else {
      htmlResult.push("<br>");
    }
  }

  // Final cleanup for open tags
  if (inCodeBlock) {
    const codeContent = escapeHtml(codeBlockLines.join("\n"));
    htmlResult.push(`<pre><code>${codeContent}</code></pre>`);
  }
  if (inTable) {
    let tableHtml = "<table><thead><tr>";
    tableHeaders.forEach(th => {
      tableHtml += `<th>${parseInlineMarkdown(th)}</th>`;
    });
    tableHtml += "</tr></thead><tbody>";
    tableRows.forEach(row => {
      tableHtml += "<tr>";
      row.forEach(td => {
        tableHtml += `<td>${parseInlineMarkdown(td)}</td>`;
      });
      tableHtml += "</tr>";
    });
    tableHtml += "</tbody></table>";
    htmlResult.push(tableHtml);
  }
  if (inList) {
    htmlResult.push(`</${listType}>`);
  }

  return htmlResult.join("\n");
}

function parseInlineMarkdown(text) {
  let safeText = escapeHtml(text);

  // Images: ![alt](url)
  safeText = safeText.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="preview-img">');

  // Links: [text](url)
  safeText = safeText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Bold: **text** or __text__
  safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  safeText = safeText.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic: *text* or _text_
  safeText = safeText.replace(/\*(.*?)\*/g, "<em>$1</em>");
  safeText = safeText.replace(/_(.*?)_/g, "<em>$1</em>");

  // Inline Code: `code`
  safeText = safeText.replace(/`(.*?)`/g, "<code>$1</code>");

  return safeText;
}

// ==========================================================================
// 3. System Toast Notifications
// ==========================================================================

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ==========================================================================
// 4. Notes Store & Database CRUD Handlers
// ==========================================================================

function loadNotes() {
  const stored = localStorage.getItem("markdown_notes_data");
  if (stored) {
    try {
      notes = JSON.parse(stored);
    } catch (e) {
      notes = SAMPLE_NOTES;
    }
  } else {
    notes = SAMPLE_NOTES;
    saveToStorage();
  }

  if (notes.length > 0) {
    activeNoteId = notes[0].id;
  }
}

function saveToStorage() {
  localStorage.setItem("markdown_notes_data", JSON.stringify(notes));
}

function selectNote(id) {
  activeNoteId = id;
  const note = notes.find(n => n.id === id);
  if (!note) return;

  document.getElementById("note-title-input").value = note.title;
  document.getElementById("note-category-input").value = note.category;
  document.getElementById("note-tags-input").value = note.tags.join(", ");
  document.getElementById("markdown-editor-textarea").value = note.content;

  updateLivePreview();
  renderNotesList();
  renderTagsAndCategories();
  updateWordCounters();
}

function createNewNote() {
  const newNote = {
    id: Date.now().toString(),
    title: "New Note Sheet",
    content: "# New Note Sheet\n\nStart writing notes...",
    category: "General",
    tags: ["draft"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  notes.unshift(newNote);
  saveToStorage();
  selectNote(newNote.id);
  showToast("Note sheet created successfully");
}

function deleteNote(id, event) {
  if (event) event.stopPropagation();

  if (!confirm("Are you sure you want to delete this note?")) return;

  notes = notes.filter(n => n.id !== id);
  saveToStorage();

  if (activeNoteId === id) {
    if (notes.length > 0) {
      selectNote(notes[0].id);
    } else {
      activeNoteId = null;
      document.getElementById("note-title-input").value = "";
      document.getElementById("note-category-input").value = "";
      document.getElementById("note-tags-input").value = "";
      document.getElementById("markdown-editor-textarea").value = "";
      document.getElementById("html-preview-render-area").innerHTML = "";
      updateWordCounters();
    }
  }
  renderNotesList();
  renderTagsAndCategories();
  showToast("Note deleted", "warning");
}

function saveNote() {
  if (!activeNoteId) return;

  const note = notes.find(n => n.id === activeNoteId);
  if (!note) return;

  const titleInput = document.getElementById("note-title-input").value.trim();
  const categoryInput = document.getElementById("note-category-input").value.trim();
  const tagsInput = document.getElementById("note-tags-input").value.trim();
  const contentInput = document.getElementById("markdown-editor-textarea").value;

  note.title = titleInput || "Untitled Note";
  note.category = categoryInput || "General";
  note.tags = tagsInput ? tagsInput.split(",").map(t => t.trim()).filter(Boolean) : [];
  note.content = contentInput;
  note.updatedAt = new Date().toISOString();

  saveToStorage();
  renderNotesList();
  renderTagsAndCategories();
  
  const statusEl = document.getElementById("save-status-text");
  statusEl.textContent = "Changes saved";
  statusEl.parentElement.classList.add("saved-success");
  setTimeout(() => {
    statusEl.parentElement.classList.remove("saved-success");
    statusEl.textContent = "Autosaved";
  }, 2000);
}

// Trigger auto saving debounce
function triggerAutoSave() {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  const statusEl = document.getElementById("save-status-text");
  statusEl.textContent = "Saving draft...";

  autoSaveTimeout = setTimeout(() => {
    saveNote();
  }, 1000);
}

// ==========================================================================
// 5. DOM Rendering Helper Functions
// ==========================================================================

function updateLivePreview() {
  const content = document.getElementById("markdown-editor-textarea").value;
  const previewArea = document.getElementById("html-preview-render-area");
  previewArea.innerHTML = parseMarkdown(content);
}

function updateWordCounters() {
  const content = document.getElementById("markdown-editor-textarea").value;
  const words = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = content ? content.length : 0;
  const readTime = Math.ceil(words / 200); // approx. 200 wpm

  document.getElementById("word-count-val").textContent = words;
  document.getElementById("char-count-val").textContent = chars;
  document.getElementById("read-time-val").textContent = `~${readTime} min`;
}

function renderNotesList() {
  const listUl = document.getElementById("notes-list-ul");
  listUl.innerHTML = "";

  // Filter notes based on active category, active tag, and search queries
  let filtered = notes;

  if (activeCategory !== "all") {
    filtered = filtered.filter(n => n.category.toLowerCase() === activeCategory.toLowerCase());
  }

  if (activeTag) {
    filtered = filtered.filter(n => n.tags.includes(activeTag));
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  document.getElementById("notes-counter-badge").textContent = filtered.length;

  filtered.forEach(note => {
    const li = document.createElement("li");
    li.className = `note-item ${note.id === activeNoteId ? "active-note" : ""}`;
    li.onclick = () => selectNote(note.id);

    const timeString = new Date(note.updatedAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    });

    const snippet = note.content ? note.content.replace(/[#*`_>\-]/g, "").substring(0, 50) : "Empty note content";

    li.innerHTML = `
      <div class="note-item-header">
        <span class="note-item-title">${note.title}</span>
        <button class="delete-note-btn" title="Delete Note" aria-label="Delete Note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
      <div class="note-item-snippet">${snippet}...</div>
      <div class="note-item-meta">
        <span>${timeString}</span>
        <span class="note-item-tag">${note.category}</span>
      </div>
    `;

    // Make delete button functional
    const delBtn = li.querySelector(".delete-note-btn");
    delBtn.onclick = (e) => deleteNote(note.id, e);

    listUl.appendChild(li);
  });
}

function renderTagsAndCategories() {
  const catList = document.getElementById("categories-filter-list");
  const datalist = document.getElementById("categories-datalist");
  const tagsContainer = document.getElementById("tags-cloud-container");

  // Compile categories & tags counts
  const categoriesMap = {};
  const tagsMap = {};

  notes.forEach(note => {
    if (note.category) {
      categoriesMap[note.category] = (categoriesMap[note.category] || 0) + 1;
    }
    note.tags.forEach(tag => {
      tagsMap[tag] = (tagsMap[tag] || 0) + 1;
    });
  });

  // Render Category Filters
  catList.innerHTML = `
    <li class="${activeCategory === "all" ? "active-filter" : ""}" data-category="all">All Categories</li>
  `;
  datalist.innerHTML = "";

  Object.keys(categoriesMap).forEach(cat => {
    const li = document.createElement("li");
    li.className = activeCategory.toLowerCase() === cat.toLowerCase() ? "active-filter" : "";
    li.textContent = cat;
    li.onclick = () => {
      activeCategory = cat;
      activeTag = null; // reset tag filter
      renderNotesList();
      renderTagsAndCategories();
    };
    catList.appendChild(li);

    // populate auto-complete list
    const opt = document.createElement("option");
    opt.value = cat;
    datalist.appendChild(opt);
  });

  // Add click to "All Categories"
  catList.querySelector('[data-category="all"]').onclick = () => {
    activeCategory = "all";
    activeTag = null;
    renderNotesList();
    renderTagsAndCategories();
  };

  // Render Tag Cloud
  tagsContainer.innerHTML = "";
  Object.keys(tagsMap).forEach(tag => {
    const span = document.createElement("span");
    span.className = `tag-badge ${activeTag === tag ? "active-tag" : ""}`;
    span.textContent = `${tag} (${tagsMap[tag]})`;
    span.onclick = () => {
      if (activeTag === tag) {
        activeTag = null; // toggle off
      } else {
        activeTag = tag;
        activeCategory = "all"; // clear category filter
      }
      renderNotesList();
      renderTagsAndCategories();
    };
    tagsContainer.appendChild(span);
  });
}

// ==========================================================================
// 6. Formatting Bar Helpers
// ==========================================================================

function insertFormatting(syntaxType) {
  const textarea = document.getElementById("markdown-editor-textarea");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const content = textarea.value;
  const selectedText = content.substring(start, end);

  let replacement = "";

  switch (syntaxType) {
    case "h1":
      replacement = `\n# ${selectedText || "Heading 1"}\n`;
      break;
    case "h2":
      replacement = `\n## ${selectedText || "Heading 2"}\n`;
      break;
    case "h3":
      replacement = `\n### ${selectedText || "Heading 3"}\n`;
      break;
    case "bold":
      replacement = `**${selectedText || "bold text"}**`;
      break;
    case "italic":
      replacement = `*${selectedText || "italic text"}*`;
      break;
    case "code":
      replacement = `\`${selectedText || "code block"}\``;
      break;
    case "blockquote":
      replacement = `\n> ${selectedText || "Blockquote text"}\n`;
      break;
    case "link":
      replacement = `[${selectedText || "link text"}](https://example.com)`;
      break;
    case "ul":
      replacement = `\n- ${selectedText || "List item"}\n`;
      break;
    case "table":
      replacement = `\n| Header 1 | Header 2 |\n| :--- | :--- |\n| Row 1 | Cell 2 |\n`;
      break;
  }

  textarea.value = content.substring(0, start) + replacement + content.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + replacement.length, start + replacement.length);

  updateLivePreview();
  updateWordCounters();
  triggerAutoSave();
}

// ==========================================================================
// 7. Interactive Canvas Stats Rendering
// ==========================================================================

function drawCategoryAnalytics() {
  const canvas = document.getElementById("category-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const categoriesMap = {};
  notes.forEach(note => {
    const cat = note.category || "General";
    categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
  });

  const categories = Object.keys(categoriesMap);
  const data = Object.values(categoriesMap);
  if (data.length === 0) {
    ctx.fillStyle = "#888";
    ctx.font = "12px sans-serif";
    ctx.fillText("No data available", 100, 100);
    return;
  }

  const total = data.reduce((a, b) => a + b, 0);
  const colors = ["#3b82f6", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#14b8a6"];

  let startAngle = 0;
  const centerX = 100;
  const centerY = 100;
  const radius = 70;

  // Draw Pie
  data.forEach((val, idx) => {
    const sliceAngle = (val / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fill();

    // Draw Legend
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(190, 20 + idx * 22, 12, 12);
    ctx.fillStyle = document.documentElement.getAttribute("data-theme") === "light" ? "#333" : "#eee";
    ctx.font = "10px Outfit, sans-serif";
    const percent = Math.round((val / total) * 100);
    ctx.fillText(`${categories[idx]} (${percent}%)`, 210, 30 + idx * 22);

    startAngle += sliceAngle;
  });
}

function drawDistributionAnalytics() {
  const canvas = document.getElementById("distribution-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Group notes into word count ranges
  const bins = { "0-50": 0, "51-150": 0, "151-300": 0, "300+": 0 };

  notes.forEach(note => {
    const words = note.content ? note.content.trim().split(/\s+/).filter(Boolean).length : 0;
    if (words <= 50) bins["0-50"]++;
    else if (words <= 150) bins["51-150"]++;
    else if (words <= 300) bins["151-300"]++;
    else bins["300+"]++;
  });

  const keys = Object.keys(bins);
  const values = Object.values(bins);
  const maxVal = Math.max(...values, 1);

  const startX = 40;
  const startY = 160;
  const graphHeight = 130;
  const barWidth = 40;
  const barSpacing = 20;

  // Draw Axes
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, startY - graphHeight);
  ctx.lineTo(startX, startY);
  ctx.lineTo(startX + (barWidth + barSpacing) * keys.length, startY);
  ctx.stroke();

  // Draw Bars
  keys.forEach((key, idx) => {
    const val = values[idx];
    const barHeight = (val / maxVal) * (graphHeight - 20);

    const x = startX + 15 + idx * (barWidth + barSpacing);
    const y = startY - barHeight;

    // Gradient fill for bars
    const grad = ctx.createLinearGradient(x, y, x, startY);
    grad.addColorStop(0, "#ec4899");
    grad.addColorStop(1, "#3b82f6");

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Labels
    ctx.fillStyle = document.documentElement.getAttribute("data-theme") === "light" ? "#333" : "#aaa";
    ctx.font = "9px Inter, sans-serif";
    ctx.fillText(key, x + 5, startY + 14);

    // Values on top of bars
    ctx.fillStyle = document.documentElement.getAttribute("data-theme") === "light" ? "#111" : "#fff";
    ctx.font = "bold 9px Inter, sans-serif";
    ctx.fillText(val, x + 16, y - 5);
  });
}

function updateOverviewStats() {
  const totalNotes = notes.length;
  let totalWords = 0;

  notes.forEach(note => {
    const words = note.content ? note.content.trim().split(/\s+/).filter(Boolean).length : 0;
    totalWords += words;
  });

  const avgWords = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;

  document.getElementById("stat-total-notes").textContent = totalNotes;
  document.getElementById("stat-total-words").textContent = totalWords;
  document.getElementById("stat-avg-words").textContent = avgWords;
}

// ==========================================================================
// 8. Portability JSON Backup & Restore Handlers
// ==========================================================================

function exportBackupDatabase() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `markdown-notes-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Database exported successfully");
}

function importBackupDatabase(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedNotes = JSON.parse(e.target.result);
      if (Array.isArray(importedNotes)) {
        notes = importedNotes;
        saveToStorage();
        if (notes.length > 0) {
          selectNote(notes[0].id);
        } else {
          activeNoteId = null;
        }
        renderNotesList();
        renderTagsAndCategories();
        showToast("Database restored successfully");
        document.getElementById("backup-modal").classList.remove("modal-active");
      } else {
        showToast("Invalid backup structure. Must be a notes array.", "error");
      }
    } catch (err) {
      showToast("Error parsing backup JSON file", "error");
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// 9. View Toggles & Keyboard Shortcuts Routing
// ==========================================================================

function setViewMode(mode) {
  const splitContainer = document.getElementById("workspace-panes-div");
  const btns = document.querySelectorAll(".view-btn");

  btns.forEach(btn => btn.classList.remove("active-view"));

  if (mode === "editor") {
    splitContainer.className = "workspace-panes editor-only-mode";
    document.getElementById("view-editor-btn").classList.add("active-view");
  } else if (mode === "preview") {
    splitContainer.className = "workspace-panes preview-only-mode";
    document.getElementById("view-preview-btn").classList.add("active-view");
  } else {
    splitContainer.className = "workspace-panes split-mode";
    document.getElementById("view-split-btn").classList.add("active-view");
  }
}

function initEventHandlers() {
  // Theme Toggle Action
  const themeBtn = document.getElementById("theme-toggle-btn");
  themeBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("markdown_notes_theme", newTheme);
    showToast(`Switched to ${newTheme} theme`);
    // Redraw graphs in case colors changed
    drawCategoryAnalytics();
    drawDistributionAnalytics();
  });

  // Setup saved theme
  const savedTheme = localStorage.getItem("markdown_notes_theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  // Create Note button
  document.getElementById("create-note-btn").addEventListener("click", createNewNote);

  // Search input
  document.getElementById("note-search-input").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderNotesList();
  });

  // Auto-saving input changes
  document.getElementById("note-title-input").addEventListener("input", triggerAutoSave);
  document.getElementById("note-category-input").addEventListener("input", triggerAutoSave);
  document.getElementById("note-tags-input").addEventListener("input", triggerAutoSave);
  document.getElementById("markdown-editor-textarea").addEventListener("input", () => {
    updateLivePreview();
    updateWordCounters();
    triggerAutoSave();
  });

  // Save Note button explicitly
  document.getElementById("save-note-btn").addEventListener("click", () => {
    saveNote();
    showToast("Workspace draft saved manually");
  });

  // View buttons
  document.getElementById("view-editor-btn").addEventListener("click", () => setViewMode("editor"));
  document.getElementById("view-split-btn").addEventListener("click", () => setViewMode("split"));
  document.getElementById("view-preview-btn").addEventListener("click", () => setViewMode("preview"));

  // Toolbar formatting
  document.querySelectorAll(".toolbar-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const syntax = btn.getAttribute("data-syntax");
      insertFormatting(syntax);
    });
  });

  // Modal Open/Close handling
  const analyticsModal = document.getElementById("analytics-modal");
  const backupModal = document.getElementById("backup-modal");

  document.getElementById("analytics-modal-btn").addEventListener("click", () => {
    updateOverviewStats();
    analyticsModal.classList.add("modal-active");
    // Draw analytics charts
    setTimeout(() => {
      drawCategoryAnalytics();
      drawDistributionAnalytics();
    }, 100);
  });

  document.getElementById("close-analytics-modal").addEventListener("click", () => {
    analyticsModal.classList.remove("modal-active");
  });

  document.getElementById("backup-modal-btn").addEventListener("click", () => {
    backupModal.classList.add("modal-active");
  });

  document.getElementById("close-backup-modal").addEventListener("click", () => {
    backupModal.classList.remove("modal-active");
  });

  // Export/Import database buttons
  document.getElementById("export-db-btn").addEventListener("click", exportBackupDatabase);
  document.getElementById("import-db-file").addEventListener("change", importBackupDatabase);

  // Close modals when clicking overlay
  window.addEventListener("click", (e) => {
    if (e.target === analyticsModal) analyticsModal.classList.remove("modal-active");
    if (e.target === backupModal) backupModal.classList.remove("modal-active");
  });

  // Keyboard shortcuts event binding
  window.addEventListener("keydown", (e) => {
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          createNewNote();
          break;
        case "s":
          e.preventDefault();
          saveNote();
          showToast("Workspace draft saved manually");
          break;
        case "t":
          e.preventDefault();
          themeBtn.click();
          break;
        case "e":
          e.preventDefault();
          setViewMode("editor");
          break;
        case "p":
          e.preventDefault();
          setViewMode("preview");
          break;
        case "v":
          e.preventDefault();
          setViewMode("split");
          break;
      }
    }
  });
}

// Initialize application on load
window.addEventListener("DOMContentLoaded", () => {
  loadNotes();
  initEventHandlers();

  if (notes.length > 0) {
    selectNote(notes[0].id);
  }
});
