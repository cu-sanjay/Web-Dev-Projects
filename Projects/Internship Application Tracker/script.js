/**
 * InternTrack - Internship Application Tracker
 * Core Frontend & Diagnostics Script Logic
 */

// 1. SEED APPLICATION DATA
const SEED_APPLICATIONS = [
  {
    id: "app_1",
    company: "Google",
    role: "Software Engineering Intern",
    status: "Interviewing",
    dateApplied: "2026-06-01",
    stipend: 9500,
    sourceUrl: "https://careers.google.com",
    notes: "HR screen completed on June 5. Technical round 1 scheduled for next week. Focus areas: Graphs and dynamic programming algorithms.",
    tasks: [
      { text: "Prepare resume pitch", checked: true },
      { text: "Practice Leetcode Medium structures", checked: true },
      { text: "Review Google Leadership Principles", checked: false }
    ]
  },
  {
    id: "app_2",
    company: "Stripe",
    role: "Frontend Engineering Intern",
    status: "Offered",
    dateApplied: "2026-05-15",
    stipend: 11000,
    sourceUrl: "https://stripe.com/jobs",
    notes: "Offer letter received on June 10! Stipend is $11,000/mo. Response required by June 25.",
    tasks: [
      { text: "Review benefits documentation", checked: true },
      { text: "Confirm start date parameters", checked: true }
    ]
  },
  {
    id: "app_3",
    company: "Meta",
    role: "Product Management Intern",
    status: "Applied",
    dateApplied: "2026-06-10",
    stipend: 8500,
    sourceUrl: "https://meta.com/careers",
    notes: "Applied via internal referral. Resume status currently marked as 'Under Review'.",
    tasks: [
      { text: "Follow up with referrer", checked: true },
      { text: "Prepare product case frameworks", checked: false }
    ]
  }
];

// 2. STATE LOGS & LOCAL STORAGE PERSISTENCE
let applications = [];
let searchQuery = "";
let activeAppId = null;

// 3. DOM ELEMENT CACHE
const lblHeaderTotalEl = document.getElementById("lbl-header-total");
const lblHeaderInterviewsEl = document.getElementById("lbl-header-interviews");
const lblHeaderOffersEl = document.getElementById("lbl-header-offers");

const txtSearchEl = document.getElementById("txt-search");

const lblFunnelBookmarkedEl = document.getElementById("lbl-funnel-bookmarked");
const barFunnelBookmarkedEl = document.getElementById("bar-funnel-bookmarked");
const lblFunnelAppliedEl = document.getElementById("lbl-funnel-applied");
const barFunnelAppliedEl = document.getElementById("bar-funnel-applied");
const lblFunnelInterviewingEl = document.getElementById("lbl-funnel-interviewing");
const barFunnelInterviewingEl = document.getElementById("bar-funnel-interviewing");
const lblFunnelOfferedEl = document.getElementById("lbl-funnel-offered");
const barFunnelOfferedEl = document.getElementById("bar-funnel-offered");
const lblFunnelRejectedEl = document.getElementById("lbl-funnel-rejected");
const barFunnelRejectedEl = document.getElementById("bar-funnel-rejected");

const lblInterviewRateEl = document.getElementById("lbl-interview-rate");
const lblAvgStipendEl = document.getElementById("lbl-avg-stipend");
const btnResetWorkspaceEl = document.getElementById("btn-reset-workspace");

const applicationsCountEl = document.getElementById("applications-count");
const btnAddApplicationEl = document.getElementById("btn-add-application");
const applicationsListEl = document.getElementById("applications-list");

const inspectorEmptyEl = document.getElementById("inspector-empty");
const inspectorActiveEl = document.getElementById("inspector-active");

const appCompanyEl = document.getElementById("app-company");
const appRoleEl = document.getElementById("app-role");
const appDateEl = document.getElementById("app-date");
const selStatusEl = document.getElementById("sel-status");
const appStipendEl = document.getElementById("app-stipend");
const appUrlEl = document.getElementById("app-url");
const tasksChecklistEl = document.getElementById("tasks-checklist");
const txtNewTaskEl = document.getElementById("txt-new-task");
const btnAddTaskEl = document.getElementById("btn-add-task");
const appNotesEl = document.getElementById("app-notes");

const btnSaveAppEl = document.getElementById("btn-save-app");
const btnDeleteAppEl = document.getElementById("btn-delete-app");

// 4. MAIN INITIALIZER
window.addEventListener("DOMContentLoaded", () => {
  loadWorkspaceData();
  setupEventListeners();
  renderHistoryAnalytics();
  renderApplicationsList();
});

// 5. LOCAL STORAGE SYNCS
function loadWorkspaceData() {
  const storedApps = localStorage.getItem("interntrack_apps");
  if (storedApps) {
    try { applications = JSON.parse(storedApps); } catch (e) { applications = [...SEED_APPLICATIONS]; }
  } else {
    applications = [...SEED_APPLICATIONS];
  }
}

function saveWorkspaceData() {
  localStorage.setItem("interntrack_apps", JSON.stringify(applications));
}

// 6. DYNAMIC PIPELINE FUNNEL CALCULATORS
function renderHistoryAnalytics() {
  // Counts per status
  const counts = {
    Bookmarked: 0,
    Applied: 0,
    Interviewing: 0,
    Offered: 0,
    Rejected: 0
  };

  applications.forEach(app => {
    if (counts[app.status] !== undefined) {
      counts[app.status]++;
    }
  });

  // Calculate Header states
  lblHeaderTotalEl.textContent = applications.length;
  lblHeaderInterviewsEl.textContent = counts.Interviewing;
  lblHeaderOffersEl.textContent = counts.Offered;

  // Render funnel numbers
  lblFunnelBookmarkedEl.textContent = counts.Bookmarked;
  lblFunnelAppliedEl.textContent = counts.Applied;
  lblFunnelInterviewingEl.textContent = counts.Interviewing;
  lblFunnelOfferedEl.textContent = counts.Offered;
  lblFunnelRejectedEl.textContent = counts.Rejected;

  // Calculate horizontal bars fill lengths
  const maxVal = Math.max(...Object.values(counts));
  
  const setBarWidth = (bar, val) => {
    bar.style.width = maxVal > 0 ? `${(val / maxVal) * 100}%` : "0%";
  };

  setBarWidth(barFunnelBookmarkedEl, counts.Bookmarked);
  setBarWidth(barFunnelAppliedEl, counts.Applied);
  setBarWidth(barFunnelInterviewingEl, counts.Interviewing);
  setBarWidth(barFunnelOfferedEl, counts.Offered);
  setBarWidth(barFunnelRejectedEl, counts.Rejected);

  // Advanced Highlights Analytics
  // Interview Rate = (Interviewing + Offered + Rejected) / (Total - Bookmarked)
  const activeAppliedCount = applications.length - counts.Bookmarked;
  if (activeAppliedCount > 0) {
    const rate = Math.round(((counts.Interviewing + counts.Offered + counts.Rejected) / activeAppliedCount) * 100);
    lblInterviewRateEl.textContent = `${rate}%`;
  } else {
    lblInterviewRateEl.textContent = "0%";
  }

  // Avg Stipend calculation
  const stipendNotes = applications.filter(app => app.stipend > 0);
  if (stipendNotes.length > 0) {
    const avg = Math.round(stipendNotes.reduce((acc, app) => acc + app.stipend, 0) / stipendNotes.length);
    lblAvgStipendEl.textContent = `$${avg.toLocaleString()}/mo`;
  } else {
    lblAvgStipendEl.textContent = "$0/mo";
  }
}

// 7. PIPELINE FEED CARDS RENDERER
function renderApplicationsList() {
  applicationsListEl.innerHTML = "";

  let filtered = [...applications];

  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(app => 
      app.company.toLowerCase().includes(query) ||
      app.role.toLowerCase().includes(query) ||
      app.status.toLowerCase().includes(query)
    );
  }

  applicationsCountEl.textContent = `${filtered.length} Application${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    applicationsListEl.innerHTML = `
      <div class="welcome-placeholder">
        <i class="fa-solid fa-suitcase placeholder-icon"></i>
        <h3>Pipeline Empty</h3>
        <p>No internship applications match your active filters or text query search.</p>
      </div>
    `;
    return;
  }

  // Render cards sorted by applied date
  filtered.sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));

  filtered.forEach(app => {
    const isSelected = activeAppId === app.id;
    const card = document.createElement("div");
    card.className = `internship-card ${isSelected ? 'active' : ''}`;

    let stipendHTML = "";
    if (app.stipend > 0) {
      stipendHTML = `<span class="card-stipend"><i class="fa-solid fa-hand-holding-dollar"></i> $${app.stipend.toLocaleString()}/mo</span>`;
    }

    card.innerHTML = `
      <div class="card-top-row">
        <h4>${app.company}</h4>
        <span class="status-pill ${app.status.toLowerCase()}">${app.status}</span>
      </div>
      <div class="card-role-title">${app.role}</div>
      <div class="card-details-row">
        <span class="card-date"><i class="fa-regular fa-calendar"></i> Applied: ${app.dateApplied || 'N/A'}</span>
        ${stipendHTML}
      </div>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".internship-card").forEach(el => el.classList.remove("active"));
      card.classList.add("active");
      loadActiveApplication(app.id);
    });

    applicationsListEl.appendChild(card);
  });
}

// 8. RELATIONAL INSPECTOR LOADERS
function loadActiveApplication(appId) {
  activeAppId = appId;
  const app = applications.find(a => a.id === appId);
  if (!app) return;

  inspectorEmptyEl.classList.add("hidden");
  inspectorActiveEl.classList.remove("hidden");

  // Populate inputs form fields
  appCompanyEl.value = app.company;
  appRoleEl.value = app.role;
  appDateEl.value = app.dateApplied;
  selStatusEl.value = app.status;
  appStipendEl.value = app.stipend || "";
  appUrlEl.value = app.sourceUrl;
  appNotesEl.value = app.notes;

  // Render checklist subtasks
  renderTasksChecklist(app);
}

function renderTasksChecklist(app) {
  tasksChecklistEl.innerHTML = "";

  if (!app.tasks || app.tasks.length === 0) {
    tasksChecklistEl.innerHTML = `<li class="text-muted text-xs font-italic py-1" id="no-tasks-lbl">No sub-tasks listed.</li>`;
  } else {
    app.tasks.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = `tasks-item ${item.checked ? 'checked' : ''}`;
      
      li.innerHTML = `
        <div class="chk-icon"><i class="fa-solid fa-check"></i></div>
        <span class="chk-text">${item.text}</span>
        <button class="btn-del-task-item" title="Delete Task"><i class="fa-solid fa-circle-minus"></i></button>
      `;

      // Toggle checked
      li.addEventListener("click", (e) => {
        // Skip toggle if clicking delete button
        if (e.target.closest(".btn-del-task-item")) return;
        
        item.checked = !item.checked;
        li.className = `tasks-item ${item.checked ? 'checked' : ''}`;
        saveWorkspaceData();
        renderHistoryAnalytics();
      });

      // Delete task item
      li.querySelector(".btn-del-task-item").addEventListener("click", () => {
        app.tasks.splice(index, 1);
        saveWorkspaceData();
        renderTasksChecklist(app);
      });

      tasksChecklistEl.appendChild(li);
    });
  }
}

// 9. EVENT LISTENERS SETUP
function setupEventListeners() {
  
  // Search filter inputs
  txtSearchEl.addEventListener("input", () => {
    searchQuery = txtSearchEl.value;
    renderApplicationsList();
  });

  // Create Application trigger
  btnAddApplicationEl.addEventListener("click", () => {
    const newId = "app_" + Date.now();
    const newApp = {
      id: newId,
      company: "New Company",
      role: "Software Intern",
      status: "Bookmarked",
      dateApplied: new Date().toISOString().split("T")[0],
      stipend: "",
      sourceUrl: "",
      notes: "",
      tasks: [
        { text: "Tailor resume layout", checked: false },
        { text: "Prepare interview questions", checked: false }
      ]
    };

    applications.push(newApp);
    activeAppId = newId;

    saveWorkspaceData();
    renderHistoryAnalytics();
    renderApplicationsList();
    loadActiveApplication(newId);
  });

  // Add subtask
  btnAddTaskEl.addEventListener("click", () => {
    const activeApp = applications.find(a => a.id === activeAppId);
    const text = txtNewTaskEl.value.trim();
    
    if (!activeApp || !text) return;

    if (!activeApp.tasks) activeApp.tasks = [];
    activeApp.tasks.push({ text: text, checked: false });
    txtNewTaskEl.value = "";

    saveWorkspaceData();
    renderTasksChecklist(activeApp);
  });

  txtNewTaskEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      btnAddTaskEl.click();
    }
  });

  // Save changes
  btnSaveAppEl.addEventListener("click", () => {
    const app = applications.find(a => a.id === activeAppId);
    if (!app) return;

    app.company = appCompanyEl.value.trim() || "New Company";
    app.role = appRoleEl.value.trim() || "Software Intern";
    app.dateApplied = appDateEl.value;
    app.status = selStatusEl.value;
    app.stipend = parseInt(appStipendEl.value) || "";
    app.sourceUrl = appUrlEl.value.trim();
    app.notes = appNotesEl.value;

    saveWorkspaceData();
    renderHistoryAnalytics();
    renderApplicationsList();
    loadActiveApplication(activeAppId);

    // Save alert indicator visual feedback
    btnSaveAppEl.innerHTML = `<i class="fa-solid fa-check"></i> Saved`;
    btnSaveAppEl.style.background = "var(--clr-status-offered)";

    setTimeout(() => {
      btnSaveAppEl.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save changes`;
      btnSaveAppEl.style.background = "";
    }, 1200);
  });

  // Delete application profiles
  btnDeleteAppEl.addEventListener("click", () => {
    if (confirm("Delete this internship application profile? This cannot be undone.")) {
      applications = applications.filter(a => a.id !== activeAppId);
      activeAppId = null;

      saveWorkspaceData();
      renderHistoryAnalytics();
      renderApplicationsList();

      inspectorActiveEl.classList.add("hidden");
      inspectorEmptyEl.classList.remove("hidden");
    }
  });

  // Reset workspace databases
  btnResetWorkspaceEl.addEventListener("click", () => {
    if (confirm("Reset all internship applications pipeline data, checklists, and stipend counters?")) {
      localStorage.clear();
      applications = [...SEED_APPLICATIONS];
      activeAppId = null;
      searchQuery = "";
      txtSearchEl.value = "";

      saveWorkspaceData();
      renderHistoryAnalytics();
      renderApplicationsList();

      inspectorActiveEl.classList.add("hidden");
      inspectorEmptyEl.classList.remove("hidden");
    }
  });
}
