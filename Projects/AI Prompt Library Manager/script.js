/**
 * PromptForge - AI Prompt Library Manager
 * JavaScript Core
 */

// 1. Library Presets Database
const PRESETS_DATABASE = [
  {
    id: "preset_1",
    title: "Asynchronous JS Code Auditor",
    description: "Scans JS scripts for microtask nesting, memory leaks, and render-blocking routines.",
    category: "coding",
    model: "Claude 3.5 Sonnet",
    body: "You are an expert JS Performance Profiler. Inspect the following [Language] function code:\n\n[CodeSource]\n\nIdentify [MaxFixesCount] performance bottlenecks. Recommend optimizations using modern async/await structures, and comment on the execution cycle."
  },
  {
    id: "preset_2",
    title: "SEO Blog Outline Creator",
    description: "Generates semantic content structures optimized for modern search keywords.",
    category: "writing",
    model: "GPT-4o",
    body: "Write a detailed article outline about [Topic] targeting the keyword [MainKeyword]. Outline must contain H2 and H3 structures. Recommend a word count target and an meta description draft that captures the tone: [ToneStyle]."
  },
  {
    id: "preset_3",
    title: "Product Tagline Generator",
    description: "Creates engaging SaaS and tech product slogans for target audiences.",
    category: "marketing",
    model: "Claude 3.5 Sonnet",
    body: "Act as an experienced tech copywriter. Brainstorm [SloganCount] product slogans for a company named [CompanyName] that built [ProductDescription]. The target audience is: [Audience]. Ensure slogans are concise and punchy."
  },
  {
    id: "preset_4",
    title: "Pandas Dataframe Cleaner",
    description: "Generates cleanup scripts for outliers, missing indices, and column schemas.",
    category: "data",
    model: "Gemini 1.5 Pro",
    body: "Generate a Python script using Pandas to clean a dataframe loaded from [FileName]. The cleaning criteria are:\n\n[CleanupRules]\n\nStructure the code modularly and comment column data assumptions."
  },
  {
    id: "preset_5",
    title: "STAR Story Refiner",
    description: "Structures loose experience bullets into professional STAR templates.",
    category: "general",
    model: "GPT-4o",
    body: "Transform these project experience bullet details: [Bullets] into a structured STAR story (Situation, Task, Action, Result) for a resume. Target role: [TargetRole]. Focus on highlights and impact."
  }
];

// 2. State Management Variables
let promptLibrary = [];
let activeSelectedPrompt = null;
let activeCategoryFilter = "all";
let searchFilterQuery = "";
let copiesCounter = 0;

// 3. DOM Cache
const promptsCardsListEl = document.getElementById("prompts-cards-list");
const lblCatalogCountEl = document.getElementById("lbl-catalog-count");

// Sidebar & Stats
const navButtons = document.querySelectorAll(".category-nav .nav-btn");
const inputSearchEl = document.getElementById("input-search");
const valTotalPromptsEl = document.getElementById("val-total-prompts");
const valTotalCopiesEl = document.getElementById("val-total-copies");
const btnResetDataEl = document.getElementById("btn-reset-data");

// Sandbox Panel
const sandboxEmptyEl = document.getElementById("sandbox-empty");
const sandboxActiveEl = document.getElementById("sandbox-active");
const valActiveNameEl = document.getElementById("val-active-name");
const valActiveModelEl = document.getElementById("val-active-model");
const sandboxVariablesFormEl = document.getElementById("sandbox-variables-form");
const txtCompiledPreviewEl = document.getElementById("txt-compiled-preview");
const btnCopyPromptEl = document.getElementById("btn-copy-prompt");
const btnSimulateRunEl = document.getElementById("btn-simulate-run");
const mockResponseBoxEl = document.getElementById("mock-response-box");
const lblMockAiTextEl = document.getElementById("lbl-mock-ai-text");

// Backup operations
const btnExportBackupEl = document.getElementById("btn-export-backup");
const inputImportBackupEl = document.getElementById("input-import-backup");

// Prompt Creator Modal
const creatorModalEl = document.getElementById("creator-modal");
const btnOpenCreatorEl = document.getElementById("btn-open-creator");
const btnCloseCreatorEl = document.getElementById("btn-close-creator");
const btnCancelCreatorEl = document.getElementById("btn-cancel-creator");
const creatorFormEl = document.getElementById("creator-form");
const promptTitleEl = document.getElementById("prompt-title");
const promptDescEl = document.getElementById("prompt-desc");
const promptCategoryEl = document.getElementById("prompt-category");
const promptModelEl = document.getElementById("prompt-model");
const promptBodyEl = document.getElementById("prompt-body");

// 4. Initializer
window.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  renderPromptsCatalog();
});

// 5. Data Caches Sync
function loadData() {
  const stored = localStorage.getItem("promptforge_library");
  if (stored) {
    try {
      promptLibrary = JSON.parse(stored);
    } catch (e) {
      console.error("Error reading library", e);
      promptLibrary = [];
    }
  }

  // Load presets if library is empty
  if (promptLibrary.length === 0) {
    promptLibrary = [...PRESETS_DATABASE];
    saveLibrary();
  }

  copiesCounter = parseInt(localStorage.getItem("promptforge_copies_count")) || 0;
  updateTelemetryUI();
}

function saveLibrary() {
  localStorage.setItem("promptforge_library", JSON.stringify(promptLibrary));
}

function updateTelemetryUI() {
  valTotalPromptsEl.textContent = promptLibrary.length;
  valTotalCopiesEl.textContent = copiesCounter;

  // Update tabs counts
  updateCategoryCounts();
}

function updateCategoryCounts() {
  document.getElementById("cnt-all").textContent = promptLibrary.length;
  document.getElementById("cnt-coding").textContent = promptLibrary.filter(p => p.category === "coding").length;
  document.getElementById("cnt-writing").textContent = promptLibrary.filter(p => p.category === "writing").length;
  document.getElementById("cnt-marketing").textContent = promptLibrary.filter(p => p.category === "marketing").length;
  document.getElementById("cnt-data").textContent = promptLibrary.filter(p => p.category === "data").length;
  document.getElementById("cnt-general").textContent = promptLibrary.filter(p => p.category === "general").length;
}

// 6. Navigation Nav & Form Events
function setupEventListeners() {
  // Category tabs click
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategoryFilter = btn.getAttribute("data-category");
      renderPromptsCatalog();
    });
  });

  // Real-time search
  inputSearchEl.addEventListener("input", () => {
    searchFilterQuery = inputSearchEl.value.toLowerCase().trim();
    renderPromptsCatalog();
  });

  // Modal show / hide
  btnOpenCreatorEl.addEventListener("click", () => {
    creatorModalEl.classList.remove("hidden");
  });
  
  const hideCreator = () => {
    creatorModalEl.classList.add("hidden");
    creatorFormEl.reset();
  };
  
  btnCloseCreatorEl.addEventListener("click", hideCreator);
  btnCancelCreatorEl.addEventListener("click", hideCreator);

  // Creator form submission
  creatorFormEl.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = promptTitleEl.value.trim();
    const description = promptDescEl.value.trim();
    const category = promptCategoryEl.value;
    const model = promptModelEl.value;
    const body = promptBodyEl.value.trim();

    if (!title || !description || !body) {
      alert("Please populate all required fields.");
      return;
    }

    const newPrompt = {
      id: "prompt_" + Date.now(),
      title,
      description,
      category,
      model,
      body
    };

    promptLibrary.push(newPrompt);
    saveLibrary();
    updateTelemetryUI();
    hideCreator();
    renderPromptsCatalog();
    
    alert(`Successfully saved prompt: "${title}"!`);
  });

  // Copy compiled prompt
  btnCopyPromptEl.addEventListener("click", () => {
    const text = txtCompiledPreviewEl.value;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      // Show check visual temporarily
      btnCopyPromptEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Copied!`;
      btnCopyPromptEl.className = "btn btn-primary btn-sm";
      
      // Update copies stat
      copiesCounter++;
      localStorage.setItem("promptforge_copies_count", copiesCounter);
      updateTelemetryUI();

      setTimeout(() => {
        btnCopyPromptEl.innerHTML = `<i class="fa-solid fa-copy"></i> Copy Prompt`;
        btnCopyPromptEl.className = "btn btn-secondary btn-sm";
      }, 1500);
    });
  });

  // Test Run simulator
  btnSimulateRunEl.addEventListener("click", simulateMockExecution);

  // Backup Export trigger
  btnExportBackupEl.addEventListener("click", exportLibraryBackup);

  // Backup Import file trigger
  inputImportBackupEl.addEventListener("change", importLibraryBackup);

  // Reset database data
  btnResetDataEl.addEventListener("click", () => {
    if (confirm("Reset prompt database library to factory defaults? This wipes custom templates.")) {
      localStorage.clear();
      promptLibrary = [...PRESETS_DATABASE];
      saveLibrary();
      copiesCounter = 0;
      updateTelemetryUI();
      renderPromptsCatalog();
      
      // Close active playground
      activeSelectedPrompt = null;
      sandboxActiveEl.classList.add("hidden");
      sandboxEmptyEl.classList.remove("hidden");
    }
  });
}

// 7. Render Templates Catalog
function renderPromptsCatalog() {
  promptsCardsListEl.innerHTML = "";

  const filtered = promptLibrary.filter(p => {
    // Category check
    const matchesCategory = activeCategoryFilter === "all" || p.category === activeCategoryFilter;
    if (!matchesCategory) return false;

    // Search check
    const queryMatches = p.title.toLowerCase().includes(searchFilterQuery) || 
                         p.description.toLowerCase().includes(searchFilterQuery) ||
                         p.body.toLowerCase().includes(searchFilterQuery);
    return queryMatches;
  });

  lblCatalogCountEl.textContent = `Showing ${filtered.length} prompt${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    promptsCardsListEl.innerHTML = `
      <div class="placeholder-msg">
        <i class="fa-solid fa-folder-open placeholder-icon"></i>
        <h3>No templates match</h3>
        <p>Please adjust search filters or click 'Add Template' to create new prompt files.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = `prompt-card ${activeSelectedPrompt?.id === p.id ? 'active' : ''}`;
    
    card.innerHTML = `
      <div class="prompt-card-header">
        <h4>${p.title}</h4>
        <span class="category-badge badge-${p.category}">${p.category}</span>
      </div>
      <p class="prompt-card-desc">${p.description}</p>
      <div class="prompt-card-footer">
        <span class="model-recommendation"><i class="fa-solid fa-robot"></i> ${p.model}</span>
        <div class="prompt-actions">
          <button class="btn btn-secondary btn-sm btn-load-prompt"><i class="fa-solid fa-sliders"></i> Playground</button>
          <button class="btn btn-icon btn-sm btn-delete-prompt" aria-label="Delete prompt"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
    `;

    // Click trigger loads playground
    const loadPlayground = () => {
      document.querySelectorAll(".prompt-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      loadSandboxPrompt(p);
    };

    card.querySelector(".btn-load-prompt").addEventListener("click", loadPlayground);
    card.addEventListener("dblclick", loadPlayground);

    // Delete prompt trigger
    card.querySelector(".btn-delete-prompt").addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete the prompt "${p.title}"?`)) {
        promptLibrary = promptLibrary.filter(pr => pr.id !== p.id);
        saveLibrary();
        updateTelemetryUI();
        renderPromptsCatalog();

        // If active was deleted, clear playground
        if (activeSelectedPrompt?.id === p.id) {
          activeSelectedPrompt = null;
          sandboxActiveEl.classList.add("hidden");
          sandboxEmptyEl.classList.remove("hidden");
        }
      }
    });

    promptsCardsListEl.appendChild(card);
  });
}

// 8. Sandbox playground compilers & Variable Parsers
function loadSandboxPrompt(prompt) {
  activeSelectedPrompt = prompt;

  valActiveNameEl.textContent = prompt.title;
  valActiveModelEl.textContent = prompt.model;

  // Extract bracket placeholders
  const vars = extractPlaceholders(prompt.body);
  
  // Render Inputs fields
  sandboxVariablesFormEl.innerHTML = "";
  if (vars.length > 0) {
    vars.forEach(v => {
      const group = document.createElement("div");
      group.className = "var-input-group";
      group.innerHTML = `
        <label for="var-${v}">[${v}]</label>
        <input type="text" id="var-${v}" data-var="${v}" placeholder="Enter value for [${v}]...">
      `;

      group.querySelector("input").addEventListener("input", compileSandboxPrompt);
      sandboxVariablesFormEl.appendChild(group);
    });
  } else {
    sandboxVariablesFormEl.innerHTML = `<p class="text-muted text-xs">No bracketed placeholders detected in this prompt body.</p>`;
  }

  // Compile initially
  compileSandboxPrompt();

  // Hide response log
  mockResponseBoxEl.classList.add("hidden");

  // Show Sandbox card
  sandboxEmptyEl.classList.add("hidden");
  sandboxActiveEl.classList.remove("hidden");
}

function extractPlaceholders(text) {
  // Scans for anything inside brackets e.g. [Language] or [TargetTopic]
  const regex = /\[(.*?)\]/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const val = match[1].trim();
    if (val && !matches.includes(val)) {
      matches.push(val);
    }
  }
  return matches;
}

function compileSandboxPrompt() {
  if (!activeSelectedPrompt) return;

  let body = activeSelectedPrompt.body;
  const inputFields = sandboxVariablesFormEl.querySelectorAll("input");

  inputFields.forEach(input => {
    const varName = input.getAttribute("data-var");
    const replacement = input.value.trim();

    // Replace all occurrences of [varName] in prompt text
    const escapedVar = varName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\[${escapedVar}\\]`, 'g');
    
    if (replacement) {
      body = body.replace(regex, replacement);
    }
  });

  txtCompiledPreviewEl.value = body;
}

// 9. Simulated AI testing runs
function simulateMockExecution() {
  const compiledPrompt = txtCompiledPreviewEl.value;
  if (!compiledPrompt) return;

  mockResponseBoxEl.classList.remove("hidden");
  lblMockAiTextEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Testing prompt instructions... compiling response...`;

  // Short delay to simulate AI parsing latency
  setTimeout(() => {
    let mockResultText = "";

    // Generate context-based replies depending on categories
    if (activeSelectedPrompt.category === "coding") {
      mockResultText = `<strong>Code Profiler Output:</strong>\n\n1. [OPTIMIZATION SUCCESS] Found query loop iterations. Refactored index calls lowering latency by 45%.\n2. Resolved Event-loop promise leaks by wrapping await pipelines. Core Web Vital INP metrics restored.`;
    } else if (activeSelectedPrompt.category === "writing") {
      mockResultText = `<strong>Content Outline Created:</strong>\n\n- Introduction: Main header hooks.\n- H2 Section: Explaining structural concepts.\n- H3 Focus: Core details checklist metrics.\n- Conclusion & Call-to-Action.`;
    } else if (activeSelectedPrompt.category === "marketing") {
      mockResultText = `<strong>Slogans Generated:</strong>\n\n- "Precision metrics, built in public."\n- "Streamline code integration loops."\n- "SaaS deployment dashboards, optimized."`;
    } else if (activeSelectedPrompt.category === "data") {
      mockResultText = `<strong>Data Cleansing Script Output:</strong>\n\nImported Pandas modules.\nCleaned column rows where values = NULL.\nOutliers dropped (removed top 5% index offsets). Script output compiled to clean_data.csv.`;
    } else {
      mockResultText = `<strong>Structured Narrative Output:</strong>\n\n- Situation: Faced layout constraints during telemetry load tests.\n- Task: Scale data rows views speed by 50%.\n- Action: Code custom indexes and debounced saving.\n- Result: Improved speed metrics by 3x.`;
    }

    lblMockAiTextEl.innerHTML = mockResultText;
  }, 1200);
}

// 10. Backup Portability operations
function exportLibraryBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(promptLibrary, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `promptforge_backup_${Date.now()}.json`);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
}

function importLibraryBackup(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (Array.isArray(parsed)) {
        // Validate items
        const isValid = parsed.every(p => p.title && p.description && p.category && p.model && p.body);
        if (isValid) {
          promptLibrary = parsed;
          saveLibrary();
          updateTelemetryUI();
          renderPromptsCatalog();
          
          // Clear sandbox
          activeSelectedPrompt = null;
          sandboxActiveEl.classList.add("hidden");
          sandboxEmptyEl.classList.remove("hidden");
          
          alert("Prompt library imported successfully from backup!");
        } else {
          alert("Invalid JSON format elements. Please check template file schema.");
        }
      } else {
        alert("JSON must contain an array of prompt templates.");
      }
    } catch (err) {
      console.error(err);
      alert("Error reading file. Ensure it is a valid JSON database.");
    }
  };
  reader.readAsText(file);
}
