/**
 * ScholarFlow - Research Progress Dashboard
 * Core Application Script
 */

// ==========================================================================
// APPLICATION STATE & STORAGE INTERFACE
// ==========================================================================
let state = {
  projects: [],
  papers: [],
  journals: [],
  settings: {
    literatureGoal: 8
  }
};

const STORAGE_KEYS = {
  PROJECTS: "scholarflow_projects",
  PAPERS: "scholarflow_papers",
  JOURNALS: "scholarflow_journals",
  SETTINGS: "scholarflow_settings",
  THEME: "scholarflow_theme"
};

const PALETTE_THEMES = {
  blue: "#3b82f6",
  teal: "#0d9488",
  orange: "#ea580c",
  purple: "#8b5cf6",
  rose: "#f43f5e"
};

// ==========================================================================
// INITIAL DATABASE SEED DATA
// ==========================================================================
const SEED_PROJECTS = [
  {
    id: "p-1",
    title: "Quantum Shaders Raytracing",
    field: "Computer Science",
    journal: "IEEE Transactions on Visualization",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    status: "active",
    theme: "blue",
    desc: "Determining real-time raytracing coefficients under shifting GPU clock frequencies, testing shading algorithms.",
    variables: {
      ind: "Ray bounce count (1-10)",
      dep: "Frame latency (ms)"
    },
    hypotheses: [
      { id: "h-1", text: "Increasing ray bounces causes frame render latency to increase exponentially.", checked: false },
      { id: "h-2", text: "Normalizing shading vectors improves shader performance by 15%.", checked: true }
    ],
    tasks: [
      { id: "t-1", text: "Conduct literature review on Vulkan raytracing", priority: "low", status: "done" },
      { id: "t-2", text: "Write Vulkan benchmark test framework code", priority: "high", status: "doing" },
      { id: "t-3", text: "Design shaders test matrix simulation", priority: "medium", status: "todo" },
      { id: "t-4", text: "Gather GPU telemetries during ray bounces sweep", priority: "high", status: "todo" }
    ]
  },
  {
    id: "p-2",
    title: "Hybrid ML Climate Prediction",
    field: "Environmental Science",
    journal: "Nature Climate Change",
    startDate: "2026-05-15",
    endDate: "2027-05-15",
    status: "planning",
    theme: "teal",
    desc: "Combining regional climate modeling arrays with convolutional networks to forecast high-resolution localized temperature spikes.",
    variables: {
      ind: "Grid cell size (km)",
      dep: "Mean Squared Error (MSE)"
    },
    hypotheses: [
      { id: "h-3", text: "Hybrid networks resolve localized grids with 20% lower mean squared error.", checked: false }
    ],
    tasks: [
      { id: "t-5", text: "Gather datasets from NOAA climate indices API", priority: "high", status: "todo" },
      { id: "t-6", text: "Verify regression layers in CNN algorithm", priority: "medium", status: "todo" }
    ]
  }
];

const SEED_PAPERS = [
  {
    id: "lit-1",
    title: "Attention Is All You Need",
    authors: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., Polosukhin, I.",
    year: 2017,
    journal: "Advances in Neural Information Systems",
    volume: "30",
    pages: "5998-6008",
    status: "cited",
    url: "https://arxiv.org/abs/1706.03762",
    notes: "Introduced the Transformer architecture, replacing recurrent models with self-attention networks. Foundational citation for climate regression layers."
  },
  {
    id: "lit-2",
    title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
    authors: "Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., Zhai, X., Unterthiner, T., Dehghani, M., Minderer, M., Heigold, G., Gelly, S., Uszkoreit, J., Houlsby, N.",
    year: 2021,
    journal: "ICLR Proceedings",
    volume: "Vol. 9",
    pages: "1-12",
    status: "reading",
    url: "https://openreview.net/forum?id=YicbFdNTTy",
    notes: "Demonstrated that pure transformers applied directly to image patches can perform well on image classification. Analyzing applicability to NOAA arrays."
  },
  {
    id: "lit-3",
    title: "Quantum Computation and Quantum Information",
    authors: "Nielsen, M. A., Chuang, I. L.",
    year: 2010,
    journal: "Cambridge University Press",
    volume: "10th Anniversary Ed.",
    pages: "1-676",
    status: "unread",
    url: "https://doi.org/10.1017/CBO9780511976667",
    notes: "Foundational reference for quantum systems, qubits, gates, and computing operations."
  }
];

const SEED_JOURNALS = [
  {
    id: "j-1",
    title: "Vulkan Shader compilation setup complete",
    date: "2026-06-05",
    projectId: "p-1",
    tags: "code, compile",
    content: "Configured Vulkan SDK. Managed to compile simple fragment shader. Performance indicators look normal. Ready for raytrace integration."
  },
  {
    id: "j-2",
    title: "Simulation Run #1 results",
    date: "2026-06-10",
    projectId: "p-1",
    tags: "experiment, simulation",
    content: "Ran test frame sweeps with ray bounce settings from 1 to 5. Noticed rendering latencies of 12ms to 45ms. Plotted results against hypotheses. Logged variables look stable."
  },
  {
    id: "j-3",
    title: "NOAA array data parse scripts",
    date: "2026-06-12",
    projectId: "p-2",
    tags: "data, python",
    content: "Wrote python helper scripts to clean coordinates in NetCDF temperature models. Need to align coordinate tags next."
  },
  {
    id: "j-4",
    title: "Initial literature review notes",
    date: "2026-06-14",
    projectId: "p-1",
    tags: "literature, review",
    content: "Finished reading foundations of raytracing shading models. Documented notes in lit vault. Replaced cue links."
  }
];

function initDatabase() {
  const localProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  const localPapers = localStorage.getItem(STORAGE_KEYS.PAPERS);
  const localJournals = localStorage.getItem(STORAGE_KEYS.JOURNALS);
  const localSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

  if (!localProjects) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
    state.projects = [...SEED_PROJECTS];
  } else {
    state.projects = JSON.parse(localProjects);
  }

  if (!localPapers) {
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(SEED_PAPERS));
    state.papers = [...SEED_PAPERS];
  } else {
    state.papers = JSON.parse(localPapers);
  }

  if (!localJournals) {
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(SEED_JOURNALS));
    state.journals = SEED_JOURNALS;
  } else {
    state.journals = JSON.parse(localJournals);
  }

  if (!localSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  } else {
    state.settings = { ...state.settings, ...JSON.parse(localSettings) };
  }
}

function saveStateToStorage() {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(state.projects));
  localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(state.papers));
  localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(state.journals));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
}

// ==========================================================================
// UTILITY HELPERS
// ==========================================================================
function getProjectTitle(projectId) {
  const proj = state.projects.find(p => p.id === projectId);
  return proj ? proj.title : "Unassigned";
}

function getDashboardKPIs() {
  const activeProjects = state.projects.filter(p => p.status === "active" || p.status === "writing").length;
  const totalPapers = state.papers.length;
  
  // Total hypotheses validated (checked)
  let hypotheses = 0;
  state.projects.forEach(p => {
    hypotheses += p.hypotheses.filter(h => h.checked).length;
  });

  const journalLogs = state.journals.length;

  return {
    activeProjects,
    totalPapers,
    hypotheses,
    journalLogs
  };
}

// ==========================================================================
// CITATION GENERATION CALCULATORS
// ==========================================================================
function generateCitation(paper, format) {
  if (!paper) return "";

  const authors = paper.authors.trim();
  const title = paper.title.trim();
  const journal = paper.journal.trim();
  const year = paper.year;
  const volume = paper.volume ? paper.volume.trim() : "";
  const pages = paper.pages ? paper.pages.trim() : "";
  const url = paper.url ? paper.url.trim() : "";

  // Helper: extract first author last name for BibTeX citation key
  let citeKey = "authorYear";
  if (authors) {
    const firstAuthor = authors.split(",")[0].trim();
    citeKey = `${firstAuthor.toLowerCase().replace(/[^a-z0-9]/g, "")}${year}`;
  }

  switch (format) {
    case "apa":
      return `${authors} (${year}). ${title}. *${journal}*${volume ? `, ${volume}` : ""}${pages ? `, ${pages}` : ""}.${url ? ` Retrieved from ${url}` : ""}`;
    
    case "ieee":
      return `[1] ${authors}, "${title}," *${journal}*${volume ? `, ${volume}` : ""}${pages ? `, pp. ${pages}` : ""}, ${year}.${url ? ` Available: ${url}` : ""}`;
    
    case "harvard":
      return `${authors} ${year}, '${title}', *${journal}*${volume ? `, vol. ${volume}` : ""}${pages ? `, pp. ${pages}` : ""}.${url ? ` Available from: &lt;${url}&gt;.` : ""}`;
    
    case "bibtex":
      // Preformat clean BibTeX fields
      let bibAuthors = authors.replace(/\./g, "").replace(/,/g, " and");
      return `@article{${citeKey},
  author    = {${bibAuthors}},
  title     = {${title}},
  journal   = {${journal}},
  year      = {${year}}${volume ? `,\n  volume    = {${volume}}` : ""}${pages ? `,\n  pages     = {${pages}}` : ""}${url ? `,\n  url       = {${url}}` : ""}
}`;
    default:
      return "";
  }
}

// ==========================================================================
// DOM ELEMENT CACHE
// ==========================================================================
const DOM = {
  // Common router keys
  navButtons: document.querySelectorAll(".nav-btn"),
  sections: document.querySelectorAll(".tab-content"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeToggleText: document.getElementById("themeToggleText"),

  // Dashboard KPI
  kpiActiveProjects: document.getElementById("kpiActiveProjects"),
  kpiTotalPapers: document.getElementById("kpiTotalPapers"),
  kpiHypotheses: document.getElementById("kpiHypotheses"),
  kpiJournalLogs: document.getElementById("kpiJournalLogs"),
  dashboardProjectsList: document.getElementById("dashboardProjectsList"),
  dashboardGoToJournalBtn: document.getElementById("dashboardGoToJournalBtn"),
  dashboardAddPaperBtn: document.getElementById("dashboardAddPaperBtn"),
  recentLogsTableBody: document.getElementById("recentLogsTableBody"),

  // Lit statistics
  litGaugePath: document.getElementById("litGaugePath"),
  litGaugePct: document.getElementById("litGaugePct"),
  litGaugeRatio: document.getElementById("litGaugeRatio"),
  litGaugeMessage: document.getElementById("litGaugeMessage"),

  // Projects Hub
  hubProjectSelect: document.getElementById("hubProjectSelect"),
  editActiveProjectBtn: document.getElementById("editActiveProjectBtn"),
  deleteActiveProjectBtn: document.getElementById("deleteActiveProjectBtn"),
  projectHubWorkspace: document.getElementById("projectHubWorkspace"),
  projectHubEmptyState: document.getElementById("projectHubEmptyState"),
  addNewProjectBtn: document.getElementById("addNewProjectBtn"),

  // Project Sidebar Details
  hubProjectStatusBadge: document.getElementById("hubProjectStatusBadge"),
  hubProjectField: document.getElementById("hubProjectField"),
  hubProjectJournal: document.getElementById("hubProjectJournal"),
  hubProjectDates: document.getElementById("hubProjectDates"),
  hubProjectDesc: document.getElementById("hubProjectDesc"),

  // Hypothesis Panel
  varIndInput: document.getElementById("varIndInput"),
  varDepInput: document.getElementById("varDepInput"),
  saveVariablesBtn: document.getElementById("saveVariablesBtn"),
  addNewHypothesisBtn: document.getElementById("addNewHypothesisBtn"),
  hypothesesChecklist: document.getElementById("hypothesesChecklist"),

  // Kanban board checklist columns
  boardTodo: document.getElementById("boardTodo"),
  boardDoing: document.getElementById("boardDoing"),
  boardDone: document.getElementById("boardDone"),
  countTodo: document.getElementById("countTodo"),
  countDoing: document.getElementById("countDoing"),
  countDone: document.getElementById("countDone"),
  addTaskTriggerBtns: document.querySelectorAll(".add-task-trigger"),

  // Project Modal
  projectModal: document.getElementById("projectModal"),
  projectModalTitle: document.getElementById("projectModalTitle"),
  closeProjectModalBtn: document.getElementById("closeProjectModalBtn"),
  projectForm: document.getElementById("projectForm"),
  projectModalIndex: document.getElementById("projectModalIndex"),
  projectTitleInput: document.getElementById("projectTitleInput"),
  projectFieldInput: document.getElementById("projectFieldInput"),
  projectJournalInput: document.getElementById("projectJournalInput"),
  projectStartDate: document.getElementById("projectStartDate"),
  projectEndDate: document.getElementById("projectEndDate"),
  projectStatusSelect: document.getElementById("projectStatusSelect"),
  projectDescInput: document.getElementById("projectDescInput"),
  cancelProjectBtn: document.getElementById("cancelProjectBtn"),

  // Task Modal
  taskModal: document.getElementById("taskModal"),
  closeTaskModalBtn: document.getElementById("closeTaskModalBtn"),
  taskForm: document.getElementById("taskForm"),
  taskModalStatus: document.getElementById("taskModalStatus"),
  taskTitleInput: document.getElementById("taskTitleInput"),
  taskPrioritySelect: document.getElementById("taskPrioritySelect"),
  cancelTaskBtn: document.getElementById("cancelTaskBtn"),

  // Hypothesis Statement Modal
  hypothesisModal: document.getElementById("hypothesisModal"),
  closeHypothesisModalBtn: document.getElementById("closeHypothesisModalBtn"),
  hypothesisForm: document.getElementById("hypothesisForm"),
  hypothesisTextInput: document.getElementById("hypothesisTextInput"),
  cancelHypothesisBtn: document.getElementById("cancelHypothesisBtn"),

  // Literature Vault
  literatureSearchInput: document.getElementById("literatureSearchInput"),
  literatureStatusFilter: document.getElementById("literatureStatusFilter"),
  literatureTableBody: document.getElementById("literatureTableBody"),
  literatureEmptyState: document.getElementById("literatureEmptyState"),
  addNewPaperBtn: document.getElementById("addNewPaperBtn"),

  // Paper details modal
  paperModal: document.getElementById("paperModal"),
  paperModalTitle: document.getElementById("paperModalTitle"),
  closePaperModalBtn: document.getElementById("closePaperModalBtn"),
  paperForm: document.getElementById("paperForm"),
  paperModalIndex: document.getElementById("paperModalIndex"),
  paperTitleInput: document.getElementById("paperTitleInput"),
  paperAuthorsInput: document.getElementById("paperAuthorsInput"),
  paperJournalInput: document.getElementById("paperJournalInput"),
  paperYearInput: document.getElementById("paperYearInput"),
  paperVolumeInput: document.getElementById("paperVolumeInput"),
  paperPagesInput: document.getElementById("paperPagesInput"),
  paperStatusSelect: document.getElementById("paperStatusSelect"),
  paperUrlInput: document.getElementById("paperUrlInput"),
  cancelPaperBtn: document.getElementById("cancelPaperBtn"),

  // Inspector paper details panels
  selectedPaperStatusBadge: document.getElementById("selectedPaperStatusBadge"),
  selectedPaperTitle: document.getElementById("selectedPaperTitle"),
  selectedPaperAuthors: document.getElementById("selectedPaperAuthors"),
  selectedPaperJournal: document.getElementById("selectedPaperJournal"),
  selectedPaperUrlBox: document.getElementById("selectedPaperUrlBox"),
  selectedPaperUrlLink: document.getElementById("selectedPaperUrlLink"),
  citationTextContainer: document.getElementById("citationTextContainer"),
  copyCitationBtn: document.getElementById("copyCitationBtn"),
  selectedPaperNotes: document.getElementById("selectedPaperNotes"),
  savePaperNotesBtn: document.getElementById("savePaperNotesBtn"),
  citationTabs: document.querySelectorAll(".citation-tab"),

  // Lab Writing Journal
  journalTimelineList: document.getElementById("journalTimelineList"),
  editJournalEntryBtn: document.getElementById("editJournalEntryBtn"),
  deleteJournalEntryBtn: document.getElementById("deleteJournalEntryBtn"),
  journalDetailTitle: document.getElementById("journalDetailTitle"),
  journalDetailDate: document.getElementById("journalDetailDate"),
  journalDetailProject: document.getElementById("journalDetailProject"),
  journalDetailTags: document.getElementById("journalDetailTags"),
  journalDetailContent: document.getElementById("journalDetailContent"),
  addNewJournalBtn: document.getElementById("addNewJournalBtn"),

  // Journal Modal
  journalModal: document.getElementById("journalModal"),
  journalModalTitle: document.getElementById("journalModalTitle"),
  closeJournalModalBtn: document.getElementById("closeJournalModalBtn"),
  journalForm: document.getElementById("journalForm"),
  journalModalIndex: document.getElementById("journalModalIndex"),
  journalTitleInput: document.getElementById("journalTitleInput"),
  journalProjectSelect: document.getElementById("journalProjectSelect"),
  journalDateInput: document.getElementById("journalDateInput"),
  journalTagsInput: document.getElementById("journalTagsInput"),
  journalContentInput: document.getElementById("journalContentInput"),
  cancelJournalBtn: document.getElementById("cancelJournalBtn"),

  // Settings
  goalsConfigForm: document.getElementById("goalsConfigForm"),
  settingsLiteratureGoal: document.getElementById("settingsLiteratureGoal"),
  exportBackupBtn: document.getElementById("exportBackupBtn"),
  importBackupInput: document.getElementById("importBackupInput"),
  resetDatabaseBtn: document.getElementById("resetDatabaseBtn")
};

// ==========================================================================
// ROUTING & NAVIGATION THEMES
// ==========================================================================
function initAppRouting() {
  DOM.navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      DOM.navButtons.forEach(b => b.classList.remove("active"));
      DOM.sections.forEach(s => s.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");

      // Refresh corresponding workspace
      if (targetId === "dashboard-section") {
        renderDashboard();
      } else if (targetId === "projects-section") {
        renderProjectsHub();
      } else if (targetId === "literature-section") {
        renderLiteratureVault();
      } else if (targetId === "journal-section") {
        renderWritingJournal();
      }
    });
  });

  DOM.dashboardGoToJournalBtn.addEventListener("click", () => {
    DOM.navButtons[3].click();
  });
  DOM.dashboardAddPaperBtn.addEventListener("click", () => {
    DOM.navButtons[2].click();
    openPaperModal();
  });
}

function initThemeToggle() {
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
  DOM.themeToggleText.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
}

// ==========================================================================
// DASHBOARD VIEW TAB RENDERING
// ==========================================================================
function renderDashboard() {
  const KPIs = getDashboardKPIs();
  
  DOM.kpiActiveProjects.textContent = KPIs.activeProjects;
  DOM.kpiTotalPapers.textContent = KPIs.totalPapers;
  DOM.kpiHypotheses.textContent = KPIs.hypotheses;
  DOM.kpiJournalLogs.textContent = KPIs.journalLogs;

  renderDashboardProjectsList();
  renderDashboardLiteratureGauge();
  renderDashboardRecentLogs();
}

function renderDashboardProjectsList() {
  DOM.dashboardProjectsList.innerHTML = "";

  if (state.projects.length === 0) {
    DOM.dashboardProjectsList.innerHTML = `
      <div class="empty-state-container" style="padding: 24px 0;">
        <p>No active projects scheduled. Create a project to start benchmarking.</p>
      </div>
    `;
    return;
  }

  state.projects.forEach(p => {
    const doneTasks = p.tasks.filter(t => t.status === "done").length;
    const totalTasks = p.tasks.length;
    const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const projectColor = PALETTE_THEMES[p.theme] || PALETTE_THEMES.blue;

    const div = document.createElement("div");
    div.className = "dashboard-proj-item";
    div.innerHTML = `
      <div class="dashboard-proj-meta">
        <h4>${p.title}</h4>
        <p>Field: ${p.field} | Target: ${p.journal}</p>
      </div>
      <div class="flex-column align-center" style="gap: 4px; min-width: 140px;">
        <div style="display:flex; justify-content:space-between; width:100%; font-size:11.5px; font-weight:600;">
          <span style="text-transform:uppercase; color: ${projectColor}; font-size:11px;">${p.status.replace('-', ' ')}</span>
          <span>${doneTasks}/${totalTasks} Tasks</span>
        </div>
        <div class="progress-bar-bg" style="width: 100%; height: 5px;">
          <div class="progress-bar-fill" style="width: ${taskPct}%; background-color: ${projectColor};"></div>
        </div>
      </div>
    `;
    DOM.dashboardProjectsList.appendChild(div);
  });
}

function renderDashboardLiteratureGauge() {
  const readPapers = state.papers.filter(p => p.status === "cited" || p.status === "reading").length;
  const goal = state.settings.literatureGoal || 8;
  const pct = Math.min(100, Math.round((readPapers / goal) * 100));

  // Circumference = 2 * pi * r = 251.2
  const offset = 251.2 * (1 - pct / 100);
  DOM.litGaugePath.style.strokeDashoffset = offset;
  DOM.litGaugePct.textContent = `${pct}%`;
  DOM.litGaugeRatio.textContent = `${readPapers} of ${goal} papers`;

  if (pct >= 100) {
    DOM.litGaugeMessage.textContent = "Outstanding! Literature goal achieved for this research period!";
  } else {
    const diff = goal - readPapers;
    DOM.litGaugeMessage.textContent = `Review ${diff} more paper${diff !== 1 ? 's' : ''} to reach literature benchmark goals.`;
  }
}

function renderDashboardRecentLogs() {
  // Grab top 4 journal entries
  const sorted = [...state.journals].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
  DOM.recentLogsTableBody.innerHTML = "";

  if (sorted.length === 0) {
    DOM.recentLogsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center" style="color:var(--text-muted); padding:24px 0;">
          No laboratory log sessions recorded. Launch journal to log observations.
        </td>
      </tr>
    `;
    return;
  }

  sorted.forEach(log => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${log.date}</td>
      <td><strong>${getProjectTitle(log.projectId)}</strong></td>
      <td><span class="badge badge-planning" style="font-size:10px;">${log.tags.split(",")[0] || "note"}</span></td>
      <td>${log.content.substring(0, 42)}${log.content.length > 42 ? '...' : ''}</td>
      <td class="text-right">
        <button class="btn btn-secondary btn-sm dashboard-view-log-btn" data-id="${log.id}">Read</button>
      </td>
    `;
    
    tr.querySelector(".dashboard-view-log-btn").addEventListener("click", () => {
      // Switch tab to journal and select log
      DOM.navButtons[3].click();
      selectJournalEntry(log.id);
    });

    DOM.recentLogsTableBody.appendChild(tr);
  });
}

// ==========================================================================
// RESEARCH PROJECTS HUB & KANBAN MANAGER
// ==========================================================================
let activeHubProjectId = null;

function renderProjectsHub() {
  populateHubProjectSelector();

  if (state.projects.length === 0) {
    DOM.projectHubWorkspace.classList.add("hidden");
    DOM.projectHubEmptyState.classList.remove("hidden");
    return;
  }
  DOM.projectHubWorkspace.classList.remove("hidden");
  DOM.projectHubEmptyState.classList.add("hidden");

  // Determine active project to render
  if (activeHubProjectId === null || !state.projects.some(p => p.id === activeHubProjectId)) {
    activeHubProjectId = state.projects[0].id;
  }
  DOM.hubProjectSelect.value = activeHubProjectId;

  const project = state.projects.find(p => p.id === activeHubProjectId);
  if (project) {
    renderProjectScopeDetails(project);
    renderProjectHypothesesChecklist(project);
    renderKanbanTaskBoard(project);
  }
}

function populateHubProjectSelector() {
  const currentSelect = DOM.hubProjectSelect.value;
  DOM.hubProjectSelect.innerHTML = "";
  state.projects.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.title;
    DOM.hubProjectSelect.appendChild(opt);
  });
  if (state.projects.some(p => p.id === currentSelect)) {
    DOM.hubProjectSelect.value = currentSelect;
  }
}

function renderProjectScopeDetails(project) {
  // Status badge style
  let badgeClass = "badge-planning";
  if (project.status === "active") badgeClass = "badge-active";
  else if (project.status === "writing") badgeClass = "badge-writing";
  else if (project.status === "peer-review") badgeClass = "badge-peer-review";
  else if (project.status === "published") badgeClass = "badge-published";

  DOM.hubProjectStatusBadge.textContent = project.status.replace('-', ' ');
  DOM.hubProjectStatusBadge.className = `badge ${badgeClass}`;

  DOM.hubProjectField.textContent = project.field;
  DOM.hubProjectJournal.textContent = project.journal;
  DOM.hubProjectDates.textContent = `${project.startDate} to ${project.endDate}`;
  DOM.hubProjectDesc.textContent = project.desc || "No abstract details logged.";

  // Set project Accent Theme styles onto the workspace board wrapper
  const projectColor = PALETTE_THEMES[project.theme] || PALETTE_THEMES.blue;
  document.getElementById("projectHubWorkspace").style.setProperty("--primary", projectColor);
  document.getElementById("projectHubWorkspace").style.setProperty("--primary-bg", `rgba(${hexToRgb(projectColor)}, 0.12)`);

  // Load Variables
  DOM.varIndInput.value = project.variables ? project.variables.ind : "";
  DOM.varDepInput.value = project.variables ? project.variables.dep : "";
}

// Color conversion helper for inline CSS accent overrides
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const parsedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(parsedHex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "99, 102, 241";
}

function renderProjectHypothesesChecklist(project) {
  DOM.hypothesesChecklist.innerHTML = "";
  
  if (!project.hypotheses || project.hypotheses.length === 0) {
    DOM.hypothesesChecklist.innerHTML = `<p style="font-size:12px; color:var(--text-muted); text-align:center; padding:12px 0;">No hypotheses recorded for this project.</p>`;
    return;
  }

  project.hypotheses.forEach(h => {
    const label = document.createElement("label");
    label.className = `checkbox-item ${h.checked ? 'checked' : ''}`;
    label.innerHTML = `
      <input type="checkbox" ${h.checked ? 'checked' : ''}>
      <span>${h.text}</span>
    `;

    // Bind checks
    label.querySelector("input").addEventListener("change", (e) => {
      h.checked = e.target.checked;
      label.classList.toggle("checked", h.checked);
      saveStateToStorage();
    });

    DOM.hypothesesChecklist.appendChild(label);
  });
}

function renderKanbanTaskBoard(project) {
  DOM.boardTodo.innerHTML = "";
  DOM.boardDoing.innerHTML = "";
  DOM.boardDone.innerHTML = "";

  const todoTasks = project.tasks.filter(t => t.status === "todo");
  const doingTasks = project.tasks.filter(t => t.status === "doing");
  const doneTasks = project.tasks.filter(t => t.status === "done");

  DOM.countTodo.textContent = todoTasks.length;
  DOM.countDoing.textContent = doingTasks.length;
  DOM.countDone.textContent = doneTasks.length;

  const buildCard = (task) => {
    const card = document.createElement("div");
    card.className = `kanban-task-card priority-${task.priority}`;
    
    // Shift layout buttons based on status
    let arrowButtons = "";
    if (task.status === "todo") {
      arrowButtons = `<button class="move-task-btn" data-dir="doing">Start →</button>`;
    } else if (task.status === "doing") {
      arrowButtons = `
        <button class="move-task-btn" data-dir="todo">← Pause</button>
        <button class="move-task-btn" data-dir="done">Finish →</button>
      `;
    } else if (task.status === "done") {
      arrowButtons = `<button class="move-task-btn" data-dir="doing">← Reopen</button>`;
    }

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <p>${task.text}</p>
        <span class="delete-task-btn" title="Delete card">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </span>
      </div>
      <div class="kanban-card-footer">
        <span style="font-size:10px; font-weight:600; color:var(--text-muted); text-transform:uppercase;">${task.priority} Priority</span>
        <div class="kanban-card-actions">
          ${arrowButtons}
        </div>
      </div>
    `;

    // Movement logs
    card.querySelectorAll(".move-task-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const nextStatus = btn.getAttribute("data-dir");
        task.status = nextStatus;
        saveStateToStorage();
        renderKanbanTaskBoard(project);
      });
    });

    card.querySelector(".delete-task-btn").addEventListener("click", () => {
      if (confirm(`Remove task card: "${task.text}"?`)) {
        project.tasks = project.tasks.filter(t => t.id !== task.id);
        saveStateToStorage();
        renderKanbanTaskBoard(project);
      }
    });

    return card;
  };

  todoTasks.forEach(t => DOM.boardTodo.appendChild(buildCard(t)));
  doingTasks.forEach(t => DOM.boardDoing.appendChild(buildCard(t)));
  doneTasks.forEach(t => DOM.boardDone.appendChild(buildCard(t)));
}

function handleVariablesSave() {
  const project = state.projects.find(p => p.id === activeHubProjectId);
  if (project) {
    project.variables = {
      ind: DOM.varIndInput.value.trim(),
      dep: DOM.varDepInput.value.trim()
    };
    saveStateToStorage();
    alert("Project test variables saved successfully.");
  }
}

// Project Modal Controllers
function openProjectModal(index = null) {
  DOM.projectModal.classList.remove("hidden");
  DOM.projectForm.reset();

  if (index !== null) {
    const proj = state.projects[index];
    DOM.projectModalTitle.textContent = "Edit Project Settings";
    DOM.projectModalIndex.value = index;
    DOM.projectTitleInput.value = proj.title;
    DOM.projectFieldInput.value = proj.field;
    DOM.projectJournalInput.value = proj.journal;
    DOM.projectStartDate.value = proj.startDate;
    DOM.projectEndDate.value = proj.endDate;
    DOM.projectStatusSelect.value = proj.status;
    DOM.projectDescInput.value = proj.desc || "";

    const radio = document.getElementById(`th-${proj.theme}`);
    if (radio) radio.checked = true;
  } else {
    DOM.projectModalTitle.textContent = "Add New Research Project";
    DOM.projectModalIndex.value = "";
    DOM.projectStartDate.value = new Date().toISOString().split("T")[0];
    document.getElementById("th-blue").checked = true;
  }
}

function closeProjectModal() {
  DOM.projectModal.classList.add("hidden");
}

function handleProjectFormSubmit(e) {
  e.preventDefault();

  const idx = DOM.projectModalIndex.value;
  const projectData = {
    title: DOM.projectTitleInput.value.trim(),
    field: DOM.projectFieldInput.value.trim(),
    journal: DOM.projectJournalInput.value.trim(),
    startDate: DOM.projectStartDate.value,
    endDate: DOM.projectEndDate.value,
    status: DOM.projectStatusSelect.value,
    desc: DOM.projectDescInput.value.trim(),
    theme: document.querySelector('input[name="projTheme"]:checked').value
  };

  if (idx !== "") {
    // Update existing project details
    const existing = state.projects[parseInt(idx)];
    projectData.id = existing.id;
    projectData.tasks = existing.tasks || [];
    projectData.hypotheses = existing.hypotheses || [];
    projectData.variables = existing.variables || { ind: "", dep: "" };
    
    state.projects[parseInt(idx)] = projectData;
  } else {
    // Register new project scope
    projectData.id = "p-" + Date.now();
    projectData.tasks = [];
    projectData.hypotheses = [];
    projectData.variables = { ind: "", dep: "" };
    state.projects.push(projectData);
    
    activeHubProjectId = projectData.id; // Shift scope focus automatically
  }

  saveStateToStorage();
  closeProjectModal();
  renderProjectsHub();
}

// Kanban Task Modal
let selectedTaskTargetStatus = "todo";
function openTaskModal(status) {
  DOM.taskModal.classList.remove("hidden");
  DOM.taskForm.reset();
  selectedTaskTargetStatus = status;
}

function closeTaskModal() {
  DOM.taskModal.classList.add("hidden");
}

function handleTaskFormSubmit(e) {
  e.preventDefault();

  const taskText = DOM.taskTitleInput.value.trim();
  const priority = DOM.taskPrioritySelect.value;

  const project = state.projects.find(p => p.id === activeHubProjectId);
  if (project) {
    project.tasks.push({
      id: "t-" + Date.now(),
      text: taskText,
      priority: priority,
      status: selectedTaskTargetStatus
    });
    saveStateToStorage();
    closeTaskModal();
    renderKanbanTaskBoard(project);
  }
}

// Hypotheses modal
function openHypothesisModal() {
  DOM.hypothesisModal.classList.remove("hidden");
  DOM.hypothesisForm.reset();
}

function closeHypothesisModal() {
  DOM.hypothesisModal.classList.add("hidden");
}

function handleHypothesisFormSubmit(e) {
  e.preventDefault();

  const textVal = DOM.hypothesisTextInput.value.trim();
  const project = state.projects.find(p => p.id === activeHubProjectId);
  if (project) {
    if (!project.hypotheses) project.hypotheses = [];
    project.hypotheses.push({
      id: "h-" + Date.now(),
      text: textVal,
      checked: false
    });
    saveStateToStorage();
    closeHypothesisModal();
    renderProjectHypothesesChecklist(project);
  }
}

function initProjectsHubEvents() {
  DOM.hubProjectSelect.addEventListener("change", (e) => {
    activeHubProjectId = e.target.value;
    renderProjectsHub();
  });

  DOM.addNewProjectBtn.addEventListener("click", () => openProjectModal());
  DOM.editActiveProjectBtn.addEventListener("click", () => {
    const index = state.projects.findIndex(p => p.id === activeHubProjectId);
    if (index !== -1) openProjectModal(index);
  });

  DOM.deleteActiveProjectBtn.addEventListener("click", () => {
    const index = state.projects.findIndex(p => p.id === activeHubProjectId);
    if (index !== -1) {
      // Validate referencing log entries
      const references = state.journals.filter(j => j.projectId === activeHubProjectId);
      if (references.length > 0) {
        alert(`Cannot delete project because there are ${references.length} journal logs references linked to its scope.`);
        return;
      }

      if (confirm(`Are you sure you want to permanently delete project '${state.projects[index].title}' and all its tasks?`)) {
        state.projects.splice(index, 1);
        activeHubProjectId = null;
        saveStateToStorage();
        renderProjectsHub();
      }
    }
  });

  DOM.saveVariablesBtn.addEventListener("click", handleVariablesSave);
  DOM.addNewHypothesisBtn.addEventListener("click", openHypothesisModal);

  DOM.closeProjectModalBtn.addEventListener("click", closeProjectModal);
  DOM.cancelProjectBtn.addEventListener("click", closeProjectModal);
  DOM.projectForm.addEventListener("submit", handleProjectFormSubmit);

  // Kanban task button triggers
  DOM.addTaskTriggerBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const colStatus = btn.getAttribute("data-status");
      openTaskModal(colStatus);
    });
  });

  DOM.closeTaskModalBtn.addEventListener("click", closeTaskModal);
  DOM.cancelTaskBtn.addEventListener("click", closeTaskModal);
  DOM.taskForm.addEventListener("submit", handleTaskFormSubmit);

  // Hypothesis modal bindings
  DOM.closeHypothesisModalBtn.addEventListener("click", closeHypothesisModal);
  DOM.cancelHypothesisBtn.addEventListener("click", closeHypothesisModal);
  DOM.hypothesisForm.addEventListener("submit", handleHypothesisFormSubmit);
}

// ==========================================================================
// LITERATURE VAULT & BIBLIOGRAPHY CONTROLLER
// ==========================================================================
let selectedLiteratureId = null;
let activeCitationFormat = "apa";

function renderLiteratureVault() {
  const query = DOM.literatureSearchInput.value.toLowerCase().trim();
  const statusFilter = DOM.literatureStatusFilter.value;

  DOM.literatureTableBody.innerHTML = "";

  let filtered = state.papers.filter(p => {
    const title = p.title.toLowerCase();
    const authors = p.authors.toLowerCase();
    const journal = p.journal.toLowerCase();
    const textMatch = title.includes(query) || authors.includes(query) || journal.includes(query);

    const statusMatch = statusFilter === "all" || p.status === statusFilter;

    return textMatch && statusMatch;
  });

  if (filtered.length === 0) {
    DOM.literatureEmptyState.classList.remove("hidden");
    // Clear inspector if list is empty
    clearReferenceInspector();
    return;
  }
  DOM.literatureEmptyState.classList.add("hidden");

  // Determine active item to select
  if (selectedLiteratureId === null || !state.papers.some(p => p.id === selectedLiteratureId)) {
    selectedLiteratureId = filtered[0].id;
  }

  filtered.forEach(paper => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    if (paper.id === selectedLiteratureId) {
      tr.style.backgroundColor = "var(--bg-tertiary)";
    }

    tr.innerHTML = `
      <td><strong>${paper.title}</strong></td>
      <td>${paper.authors.split(",")[0] || "Unknown"}...</td>
      <td>${paper.year}</td>
      <td><span class="badge badge-planning">${paper.status}</span></td>
      <td class="text-right">
        <div class="header-actions" style="justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm edit-paper-btn" data-id="${paper.id}">Edit</button>
          <button class="btn btn-danger-outline btn-sm delete-paper-btn" data-id="${paper.id}">Delete</button>
        </div>
      </td>
    `;

    // Click row selects paper in details panel
    tr.addEventListener("click", (e) => {
      // Avoid clicking actions buttons triggers selection changes
      if (e.target.closest("button")) return;
      selectedLiteratureId = paper.id;
      renderLiteratureVault();
    });

    tr.querySelector(".edit-paper-btn").addEventListener("click", () => {
      const actualIndex = state.papers.findIndex(p => p.id === paper.id);
      openPaperModal(actualIndex);
    });

    tr.querySelector(".delete-paper-btn").addEventListener("click", () => {
      if (confirm(`Remove paper '${paper.title}' from catalog?`)) {
        state.papers = state.papers.filter(p => p.id !== paper.id);
        if (selectedLiteratureId === paper.id) selectedLiteratureId = null;
        saveStateToStorage();
        renderLiteratureVault();
      }
    });

    DOM.literatureTableBody.appendChild(tr);
  });

  // Render Selected Reference details
  const activePaper = state.papers.find(p => p.id === selectedLiteratureId);
  if (activePaper) {
    renderPaperDetailsInspector(activePaper);
  } else {
    clearReferenceInspector();
  }
}

function clearReferenceInspector() {
  DOM.selectedPaperStatusBadge.textContent = "SELECT A PAPER";
  DOM.selectedPaperStatusBadge.className = "badge";
  DOM.selectedPaperTitle.textContent = "No Paper Selected";
  DOM.selectedPaperAuthors.textContent = "Please select a reference entry from the literature table list to evaluate details.";
  DOM.selectedPaperJournal.textContent = "";
  DOM.selectedPaperUrlBox.classList.add("hidden");
  DOM.citationTextContainer.textContent = "Select a paper to review references.";
  DOM.copyCitationBtn.disabled = true;
  DOM.selectedPaperNotes.value = "";
  DOM.selectedPaperNotes.disabled = true;
  DOM.savePaperNotesBtn.disabled = true;
}

function renderPaperDetailsInspector(paper) {
  // Status Badge
  let badgeClass = "badge-planning";
  if (paper.status === "reading") badgeClass = "badge-active";
  else if (paper.status === "cited") badgeClass = "badge-published";

  DOM.selectedPaperStatusBadge.textContent = paper.status.toUpperCase();
  DOM.selectedPaperStatusBadge.className = `badge ${badgeClass}`;

  DOM.selectedPaperTitle.textContent = paper.title;
  DOM.selectedPaperAuthors.textContent = `Authors: ${paper.authors}`;
  DOM.selectedPaperJournal.textContent = `${paper.journal} (${paper.year})${paper.volume ? `, ${paper.volume}` : ""}${paper.pages ? `, pp. ${paper.pages}` : ""}`;
  
  if (paper.url) {
    DOM.selectedPaperUrlBox.classList.remove("hidden");
    DOM.selectedPaperUrlLink.href = paper.url;
  } else {
    DOM.selectedPaperUrlBox.classList.add("hidden");
  }

  // Load Generated Citations
  updateCitationViewText(paper);
  DOM.copyCitationBtn.disabled = false;

  // Load Reading Notes
  DOM.selectedPaperNotes.value = paper.notes || "";
  DOM.selectedPaperNotes.disabled = false;
  DOM.savePaperNotesBtn.disabled = false;
}

function updateCitationViewText(paper) {
  const citation = generateCitation(paper, activeCitationFormat);
  DOM.citationTextContainer.innerHTML = citation;
}

function handleSavePaperNotes() {
  const paper = state.papers.find(p => p.id === selectedLiteratureId);
  if (paper) {
    paper.notes = DOM.selectedPaperNotes.value.trim();
    saveStateToStorage();
    alert("Reading Notes saved successfully.");
  }
}

function handleCopyCitation() {
  const textVal = DOM.citationTextContainer.innerText;
  
  // Create temporary copy textbox
  const textarea = document.createElement("textarea");
  textarea.value = textVal;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();

  alert(`Citation format (${activeCitationFormat.toUpperCase()}) copied to clipboard!`);
}

// Paper Modal Controllers
function openPaperModal(index = null) {
  DOM.paperModal.classList.remove("hidden");
  DOM.paperForm.reset();

  if (index !== null) {
    const paper = state.papers[index];
    DOM.paperModalTitle.textContent = "Edit Reference Details";
    DOM.paperModalIndex.value = index;
    DOM.paperTitleInput.value = paper.title;
    DOM.paperAuthorsInput.value = paper.authors;
    DOM.paperJournalInput.value = paper.journal;
    DOM.paperYearInput.value = paper.year;
    DOM.paperVolumeInput.value = paper.volume || "";
    DOM.paperPagesInput.value = paper.pages || "";
    DOM.paperStatusSelect.value = paper.status;
    DOM.paperUrlInput.value = paper.url || "";
  } else {
    DOM.paperModalTitle.textContent = "Catalog Paper Reference";
    DOM.paperModalIndex.value = "";
    DOM.paperYearInput.value = new Date().getFullYear();
  }
}

function closePaperModal() {
  DOM.paperModal.classList.add("hidden");
}

function handlePaperFormSubmit(e) {
  e.preventDefault();

  const idx = DOM.paperModalIndex.value;
  const paperData = {
    title: DOM.paperTitleInput.value.trim(),
    authors: DOM.paperAuthorsInput.value.trim(),
    journal: DOM.paperJournalInput.value.trim(),
    year: parseInt(DOM.paperYearInput.value) || new Date().getFullYear(),
    volume: DOM.paperVolumeInput.value.trim(),
    pages: DOM.paperPagesInput.value.trim(),
    status: DOM.paperStatusSelect.value,
    url: DOM.paperUrlInput.value.trim()
  };

  if (idx !== "") {
    const existing = state.papers[parseInt(idx)];
    paperData.id = existing.id;
    paperData.notes = existing.notes || "";
    state.papers[parseInt(idx)] = paperData;
  } else {
    paperData.id = "lit-" + Date.now();
    paperData.notes = "";
    state.papers.push(paperData);
    
    selectedLiteratureId = paperData.id; // Focus on created
  }

  saveStateToStorage();
  closePaperModal();
  renderLiteratureVault();
}

function initLiteratureEvents() {
  DOM.literatureSearchInput.addEventListener("input", renderLiteratureVault);
  DOM.literatureStatusFilter.addEventListener("change", renderLiteratureVault);
  DOM.addNewPaperBtn.addEventListener("click", () => openPaperModal());

  DOM.closePaperModalBtn.addEventListener("click", closePaperModal);
  DOM.cancelPaperBtn.addEventListener("click", closePaperModal);
  DOM.paperForm.addEventListener("submit", handlePaperFormSubmit);

  DOM.savePaperNotesBtn.addEventListener("click", handleSavePaperNotes);
  DOM.copyCitationBtn.addEventListener("click", handleCopyCitation);

  // Hook citation format tabs selectors
  DOM.citationTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      DOM.citationTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeCitationFormat = tab.getAttribute("data-format");
      
      const activePaper = state.papers.find(p => p.id === selectedLiteratureId);
      if (activePaper) {
        updateCitationViewText(activePaper);
      }
    });
  });
}

// ==========================================================================
// LAB JOURNAL WRITING TIMELINE CONTROLLER
// ==========================================================================
let selectedJournalId = null;

function renderWritingJournal() {
  DOM.journalTimelineList.innerHTML = "";

  if (state.journals.length === 0) {
    DOM.journalTimelineList.innerHTML = `<p style="font-size:12px; color:var(--text-muted); text-align:center; padding:16px;">No entries logged in lab writing journal.</p>`;
    clearJournalInspector();
    return;
  }

  // Sort chronological descending (newest first)
  const sorted = [...state.journals].sort((a,b) => new Date(b.date) - new Date(a.date));

  if (selectedJournalId === null || !state.journals.some(j => j.id === selectedJournalId)) {
    selectedJournalId = sorted[0].id;
  }

  sorted.forEach(entry => {
    const div = document.createElement("div");
    div.className = `timeline-item ${entry.id === selectedJournalId ? 'active' : ''}`;
    div.innerHTML = `
      <span class="timeline-date">${entry.date}</span>
      <h4 class="timeline-title">${entry.title}</h4>
      <p class="timeline-project">${getProjectTitle(entry.projectId)}</p>
    `;

    div.addEventListener("click", () => {
      selectedJournalId = entry.id;
      renderWritingJournal();
    });

    DOM.journalTimelineList.appendChild(div);
  });

  const activeEntry = state.journals.find(j => j.id === selectedJournalId);
  if (activeEntry) {
    renderJournalEntryDetails(activeEntry);
  } else {
    clearJournalInspector();
  }
}

function clearJournalInspector() {
  DOM.journalDetailTitle.textContent = "Select a Journal Entry";
  DOM.journalDetailDate.textContent = "Choose an entry from the left timeline menu to read logs.";
  DOM.journalDetailProject.classList.add("hidden");
  DOM.journalDetailTags.innerHTML = "";
  DOM.journalDetailContent.textContent = "Observations details logs will appear here.";
  
  DOM.editJournalEntryBtn.disabled = true;
  DOM.deleteJournalEntryBtn.disabled = true;
}

function renderJournalEntryDetails(entry) {
  DOM.journalDetailTitle.textContent = entry.title;
  DOM.journalDetailDate.textContent = `Logged: ${entry.date}`;
  
  DOM.journalDetailProject.classList.remove("hidden");
  DOM.journalDetailProject.textContent = getProjectTitle(entry.projectId);

  // Render Tags
  DOM.journalDetailTags.innerHTML = "";
  if (entry.tags) {
    entry.tags.split(",").forEach(t => {
      const tag = t.trim();
      if (tag) {
        const span = document.createElement("span");
        span.className = "journal-tag-pill";
        span.textContent = tag;
        DOM.journalDetailTags.appendChild(span);
      }
    });
  }

  DOM.journalDetailContent.textContent = entry.content;

  DOM.editJournalEntryBtn.disabled = false;
  DOM.deleteJournalEntryBtn.disabled = false;
}

function selectJournalEntry(entryId) {
  selectedJournalId = entryId;
  renderWritingJournal();
}

// Journal Modal Controllers
function populateJournalProjectSelector() {
  DOM.journalProjectSelect.innerHTML = "";
  
  if (state.projects.length === 0) {
    DOM.journalProjectSelect.innerHTML = `<option value="">Register a project first</option>`;
    return;
  }

  state.projects.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.title;
    DOM.journalProjectSelect.appendChild(opt);
  });
}

function openJournalModal(index = null) {
  if (state.projects.length === 0) {
    alert("Add at least one active research project scope before creating lab journal notes.");
    return;
  }

  DOM.journalModal.classList.remove("hidden");
  DOM.journalForm.reset();
  populateJournalProjectSelector();

  if (index !== null) {
    const entry = state.journals[index];
    DOM.journalModalTitle.textContent = "Edit Journal Log";
    DOM.journalModalIndex.value = index;
    DOM.journalTitleInput.value = entry.title;
    DOM.journalProjectSelect.value = entry.projectId;
    DOM.journalDateInput.value = entry.date;
    DOM.journalTagsInput.value = entry.tags || "";
    DOM.journalContentInput.value = entry.content;
  } else {
    DOM.journalModalTitle.textContent = "Add Lab Log Entry";
    DOM.journalModalIndex.value = "";
    DOM.journalDateInput.value = new Date().toISOString().split("T")[0];
    if (activeHubProjectId !== null) {
      DOM.journalProjectSelect.value = activeHubProjectId;
    }
  }
}

function closeJournalModal() {
  DOM.journalModal.classList.add("hidden");
}

function handleJournalFormSubmit(e) {
  e.preventDefault();

  const idx = DOM.journalModalIndex.value;
  const logData = {
    title: DOM.journalTitleInput.value.trim(),
    projectId: DOM.journalProjectSelect.value,
    date: DOM.journalDateInput.value,
    tags: DOM.journalTagsInput.value.trim(),
    content: DOM.journalContentInput.value.trim()
  };

  if (idx !== "") {
    const existing = state.journals[parseInt(idx)];
    logData.id = existing.id;
    state.journals[parseInt(idx)] = logData;
  } else {
    logData.id = "j-" + Date.now();
    state.journals.push(logData);
    
    selectedJournalId = logData.id; // Focus on created
  }

  saveStateToStorage();
  closeJournalModal();
  renderWritingJournal();
}

function initJournalEvents() {
  DOM.addNewJournalBtn.addEventListener("click", () => openJournalModal());
  
  DOM.editJournalEntryBtn.addEventListener("click", () => {
    const actualIndex = state.journals.findIndex(j => j.id === selectedJournalId);
    if (actualIndex !== -1) openJournalModal(actualIndex);
  });

  DOM.deleteJournalEntryBtn.addEventListener("click", () => {
    if (confirm("Permanently delete this lab journal entry card?")) {
      state.journals = state.journals.filter(j => j.id !== selectedJournalId);
      selectedJournalId = null;
      saveStateToStorage();
      renderWritingJournal();
    }
  });

  DOM.closeJournalModalBtn.addEventListener("click", closeJournalModal);
  DOM.cancelJournalBtn.addEventListener("click", closeJournalModal);
  DOM.journalForm.addEventListener("submit", handleJournalFormSubmit);
}

// ==========================================================================
// SETTINGS PREFERENCES MANAGER
// ==========================================================================
function loadSettingsTab() {
  DOM.settingsLiteratureGoal.value = state.settings.literatureGoal || 8;
}

function handleSaveSettings(e) {
  e.preventDefault();
  state.settings.literatureGoal = parseInt(DOM.settingsLiteratureGoal.value) || 8;
  saveStateToStorage();
  alert("Workspace goals configurations updated successfully.");
}

function exportDatabaseBackup() {
  const database = {
    version: "1.0",
    projects: state.projects,
    papers: state.papers,
    journals: state.journals,
    settings: state.settings
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(database, null, 2));
  const anchor = document.createElement("a");
  anchor.setAttribute("href", dataStr);
  anchor.setAttribute("download", `scholarflow_backup_${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function importDatabaseBackup(e) {
  const reader = new FileReader();
  const file = e.target.files[0];
  if (!file) return;

  reader.onload = function(event) {
    try {
      const parsed = JSON.parse(event.target.result);
      if (parsed.projects && parsed.papers && parsed.journals && parsed.settings) {
        state.projects = parsed.projects;
        state.papers = parsed.papers;
        state.journals = parsed.journals;
        state.settings = parsed.settings;
        
        saveStateToStorage();
        alert("ScholarFlow Research Database Backup restored successfully.");
        window.location.reload();
      } else {
        alert("Incorrect backup file schema. Needs projects, literature papers, journals, and settings properties.");
      }
    } catch (err) {
      alert("Error parsing backup database file.");
    }
  };

  reader.readAsText(file);
}

function resetDatabaseToSeeds() {
  if (confirm("WARNING: Wiping workspace will reset all custom projects, tasks, citations and diaries back to default dummy seed values. Continue?")) {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.PAPERS);
    localStorage.removeItem(STORAGE_KEYS.JOURNALS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    window.location.reload();
  }
}

function initSettingsEvents() {
  DOM.goalsConfigForm.addEventListener("submit", handleSaveSettings);
  DOM.exportBackupBtn.addEventListener("click", exportDatabaseBackup);
  DOM.importBackupInput.addEventListener("change", importDatabaseBackup);
  DOM.resetDatabaseBtn.addEventListener("click", resetDatabaseToSeeds);
}

// ==========================================================================
// CORE APP ENTRYPOINT INITIALIZER
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initDatabase();
  initThemeToggle();
  initAppRouting();
  initProjectsHubEvents();
  initLiteratureEvents();
  initJournalEvents();
  initSettingsEvents();

  // Load first screen states
  renderDashboard();
  loadSettingsTab();
});
