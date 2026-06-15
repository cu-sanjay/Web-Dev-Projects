// Job Application Tracker Pro - Interaction Logic

// Default seed job profiles to start the user with a beautiful, populated dashboard
const SEED_JOBS = [
  {
    id: "seed-google",
    company: "Google",
    role: "Frontend Engineer - Cloud UX",
    status: "Offer",
    dateApplied: "2026-05-15",
    salary: 145000,
    location: "Hybrid",
    url: "https://careers.google.com",
    notes: "Loved the team! Met with Sarah (EM) and Dave (Tech Lead). Base salary offered is $145,000/yr + 15% bonus. Negotiated sign-on bonus.",
    tasks: [
      { id: "g-task-1", text: "Phone recruiter screening", completed: true },
      { id: "g-task-2", text: "Technical coding interview (Algorithms & DOM)", completed: true },
      { id: "g-task-3", text: "Onsite panel review & System design", completed: true },
      { id: "g-task-4", text: "Review written compensation package offer", completed: true }
    ]
  },
  {
    id: "seed-stripe",
    company: "Stripe",
    role: "Senior JavaScript Architect",
    status: "Interviewing",
    dateApplied: "2026-06-01",
    salary: 185000,
    location: "Remote",
    url: "https://stripe.com/jobs",
    notes: "Recruiter screen went great. Next step is system design session scheduled for June 18th. Focus on idempotency, rate limiting, and API design patterns.",
    tasks: [
      { id: "s-task-1", text: "Submit resume & application", completed: true },
      { id: "s-task-2", text: "Portfolio design review", completed: true },
      { id: "s-task-3", text: "Prepare system design architecture session", completed: false },
      { id: "s-task-4", text: "Manager alignment interview", completed: false }
    ]
  },
  {
    id: "seed-netflix",
    company: "Netflix",
    role: "UI Engineer - Core Experience",
    status: "Applied",
    dateApplied: "2026-06-10",
    salary: 190000,
    location: "Onsite",
    url: "https://jobs.netflix.com",
    notes: "Applied on the careers portal. Sent follow-up connection message to hiring manager on LinkedIn. Let's see if they respond within a week.",
    tasks: [
      { id: "n-task-1", text: "Submit application form", completed: true },
      { id: "n-task-2", text: "Follow up via LinkedIn recruiter", completed: false }
    ]
  },
  {
    id: "seed-vercel",
    company: "Vercel",
    role: "Developer Relations Engineer",
    status: "Wishlist",
    dateApplied: "2026-06-12",
    salary: 130000,
    location: "Remote",
    url: "https://vercel.com/careers",
    notes: "Wishlist job. Highly interested in their DevRel open headcount. Will request Jake for a warm referral once my new portfolio is clean.",
    tasks: [
      { id: "v-task-1", text: "Polish portfolio site & blog posts", completed: false },
      { id: "v-task-2", text: "Get referral from Jake", completed: false }
    ]
  }
];

// Kanban lane pipeline sequence
const LANES = ["Wishlist", "Applied", "Interviewing", "Offer", "Rejected"];

// App State
let jobs = [];
let activeJobId = null;

// DOM Elements references
const txtSearch = document.getElementById("txt-search");
const selLocationFilter = document.getElementById("sel-location-filter");

const lblHeaderApplied = document.getElementById("lbl-header-applied");
const lblHeaderInterviews = document.getElementById("lbl-header-interviews");
const lblHeaderOffers = document.getElementById("lbl-header-offers");

const lblOffersValue = document.getElementById("lbl-offers-value");
const lblAvgSalary = document.getElementById("lbl-avg-salary");
const lblInterviewRate = document.getElementById("lbl-interview-rate");

const btnResetWorkspace = document.getElementById("btn-reset-workspace");
const btnAddJob = document.getElementById("btn-add-job");

const colWishlist = document.getElementById("col-wishlist");
const colApplied = document.getElementById("col-applied");
const colInterviewing = document.getElementById("col-interviewing");
const colOffer = document.getElementById("col-offer");
const colRejected = document.getElementById("col-rejected");

const inspectorEmpty = document.getElementById("inspector-empty");
const inspectorActive = document.getElementById("inspector-active");

// Form controls references
const jobCompany = document.getElementById("job-company");
const jobRole = document.getElementById("job-role");
const jobDate = document.getElementById("job-date");
const selStatus = document.getElementById("sel-status");
const jobSalary = document.getElementById("job-salary");
const selLocation = document.getElementById("sel-location");
const jobUrl = document.getElementById("job-url");
const jobNotes = document.getElementById("job-notes");

const tasksChecklist = document.getElementById("tasks-checklist");
const txtNewTask = document.getElementById("txt-new-task");
const btnAddTask = document.getElementById("btn-add-task");

const btnSaveJob = document.getElementById("btn-save-job");
const btnDeleteJob = document.getElementById("btn-delete-job");

// INITIALIZATION
window.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  calculateAnalytics();
  renderKanban();
});

// Load from localStorage or seeds
function loadData() {
  const storedJobs = localStorage.getItem("jobtrack_pro_jobs");
  if (storedJobs) {
    try {
      jobs = JSON.parse(storedJobs);
    } catch (e) {
      console.error("Error parsing jobs from local storage, resetting to defaults", e);
      jobs = [...SEED_JOBS];
    }
  } else {
    jobs = [...SEED_JOBS];
    saveToStorage(false); // don't trigger immediate render during init
  }
}

// Save back to storage and recompute
function saveToStorage(shouldRender = true) {
  localStorage.setItem("jobtrack_pro_jobs", JSON.stringify(jobs));
  if (shouldRender) {
    calculateAnalytics();
    renderKanban();
    if (activeJobId) {
      // Keep inspector updated
      const activeJob = jobs.find(j => j.id === activeJobId);
      if (activeJob) {
        renderTasksChecklist(activeJob);
      }
    }
  }
}

// Global Event Listeners
function setupEventListeners() {
  // Search & Filter
  txtSearch.addEventListener("input", renderKanban);
  selLocationFilter.addEventListener("change", renderKanban);

  // Buttons
  btnAddJob.addEventListener("click", addNewJobSpec);
  btnResetWorkspace.addEventListener("click", resetWorkspace);
  
  // Inspector Actions
  btnSaveJob.addEventListener("click", saveActiveJobChanges);
  btnDeleteJob.addEventListener("click", deleteActiveJob);
  btnAddTask.addEventListener("click", handleAddTaskSubmit);
  txtNewTask.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleAddTaskSubmit();
    }
  });

  // Track status changing from the dropdown to automatically update visual lanes in real time
  selStatus.addEventListener("change", () => {
    if (activeJobId) {
      const job = jobs.find(j => j.id === activeJobId);
      if (job) {
        job.status = selStatus.value;
        saveToStorage();
      }
    }
  });
}

// CALCULATE ANALYTICS
function calculateAnalytics() {
  // Header Counter Indicators
  const appliedCount = jobs.filter(j => j.status === "Applied").length;
  const interviewingCount = jobs.filter(j => j.status === "Interviewing").length;
  const offerCount = jobs.filter(j => j.status === "Offer").length;

  lblHeaderApplied.textContent = appliedCount;
  lblHeaderInterviews.textContent = interviewingCount;
  lblHeaderOffers.textContent = offerCount;

  // Active Offers Value Sum
  const offerVal = jobs
    .filter(j => j.status === "Offer")
    .reduce((sum, j) => sum + (Number(j.salary) || 0), 0);
  lblOffersValue.textContent = formatSalary(offerVal);

  // Average Salary of all jobs that have a salary > 0
  const jobsWithSalary = jobs.filter(j => Number(j.salary) > 0);
  const avgSalary = jobsWithSalary.length > 0
    ? Math.round(jobsWithSalary.reduce((sum, j) => sum + Number(j.salary), 0) / jobsWithSalary.length)
    : 0;
  lblAvgSalary.textContent = formatSalary(avgSalary);

  // Interview Conversion Rate
  // Rate = (Interviewing + Offer) / (All applied jobs i.e. not in Wishlist) * 100
  const totalAppliedFunnel = jobs.filter(j => j.status !== "Wishlist").length;
  const reachedInterview = jobs.filter(j => j.status === "Interviewing" || j.status === "Offer").length;
  const conversionRate = totalAppliedFunnel > 0
    ? Math.round((reachedInterview / totalAppliedFunnel) * 100)
    : 0;
  lblInterviewRate.textContent = `${conversionRate}%`;

  // Update counts in lane headers
  document.getElementById("count-wishlist").textContent = jobs.filter(j => j.status === "Wishlist").length;
  document.getElementById("count-applied").textContent = appliedCount;
  document.getElementById("count-interviewing").textContent = interviewingCount;
  document.getElementById("count-offer").textContent = offerCount;
  document.getElementById("count-rejected").textContent = jobs.filter(j => j.status === "Rejected").length;
}

// Format number to local currency format e.g. $145,000/yr
function formatSalary(amount) {
  if (!amount || amount <= 0) return "$0/yr";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount) + "/yr";
}

// RENDER KANBAN PIPELINE BOARD
function renderKanban() {
  const searchQuery = txtSearch.value.trim().toLowerCase();
  const locationFilter = selLocationFilter.value;

  // Clear lane wrapper structures
  colWishlist.innerHTML = "";
  colApplied.innerHTML = "";
  colInterviewing.innerHTML = "";
  colOffer.innerHTML = "";
  colRejected.innerHTML = "";

  const filteredJobs = jobs.filter(job => {
    // 1. Search Query Match
    const matchesSearch = 
      job.company.toLowerCase().includes(searchQuery) ||
      job.role.toLowerCase().includes(searchQuery) ||
      job.notes.toLowerCase().includes(searchQuery);

    // 2. Location Filter Match
    const matchesLocation = locationFilter === "All" || job.location === locationFilter;

    return matchesSearch && matchesLocation;
  });

  filteredJobs.forEach(job => {
    const card = createJobCard(job);
    
    // Dispatch to matching lane wrapper
    switch (job.status) {
      case "Wishlist":
        colWishlist.appendChild(card);
        break;
      case "Applied":
        colApplied.appendChild(card);
        break;
      case "Interviewing":
        colInterviewing.appendChild(card);
        break;
      case "Offer":
        colOffer.appendChild(card);
        break;
      case "Rejected":
        colRejected.appendChild(card);
        break;
    }
  });

  // Display helpful message if a lane is empty and no jobs exist
  const wrappers = [
    { col: colWishlist, text: "No wishlist specs" },
    { col: colApplied, text: "No applications submitted" },
    { col: colInterviewing, text: "No active interviews" },
    { col: colOffer, text: "No offers received yet" },
    { col: colRejected, text: "No profiles logged here" }
  ];

  wrappers.forEach(w => {
    if (w.col.children.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty-lane-placeholder";
      emptyDiv.style.textAlign = "center";
      emptyDiv.style.padding = "1.5rem 0.5rem";
      emptyDiv.style.color = "var(--text-muted)";
      emptyDiv.style.fontSize = "0.75rem";
      emptyDiv.style.border = "1px dashed rgba(255, 255, 255, 0.02)";
      emptyDiv.style.borderRadius = "var(--border-radius-sm)";
      emptyDiv.textContent = w.text;
      w.col.appendChild(emptyDiv);
    }
  });
}

// CREATE CARD COMPONENT
function createJobCard(job) {
  const card = document.createElement("div");
  card.className = "job-card";
  if (job.id === activeJobId) {
    card.classList.add("active-card");
  }

  // Calculate Subtask Checklist percentage
  const totalTasks = job.tasks ? job.tasks.length : 0;
  const completedTasks = job.tasks ? job.tasks.filter(t => t.completed).length : 0;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  card.innerHTML = `
    <div class="card-company">${escapeHtml(job.company)}</div>
    <div class="card-role" title="${escapeHtml(job.role)}">${escapeHtml(job.role)}</div>
    <div class="card-meta">
      <span class="card-salary">${job.salary ? formatSalaryShort(job.salary) : "$--"}</span>
      <span class="card-loc-badge"><i class="fa-solid fa-location-dot"></i> ${job.location}</span>
    </div>
    
    <div class="card-progress-wrapper">
      <div class="card-progress-text">
        <span>Milestones</span>
        <span>${completedTasks}/${totalTasks} (${pct}%)</span>
      </div>
      <div class="card-progress-bar">
        <div class="card-progress-fill" style="width: ${pct}%"></div>
      </div>
    </div>

    <div class="card-quick-actions">
      <button class="card-quick-btn btn-shift-left" title="Move Left"><i class="fa-solid fa-angle-left"></i></button>
      <span style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Move</span>
      <button class="card-quick-btn btn-shift-right" title="Move Right"><i class="fa-solid fa-angle-right"></i></button>
    </div>
  `;

  // Handle Card Click to inspect details
  card.addEventListener("click", () => {
    selectJob(job.id);
  });

  // Shift logic left/right
  const btnLeft = card.querySelector(".btn-shift-left");
  const btnRight = card.querySelector(".btn-shift-right");

  const currentIndex = LANES.indexOf(job.status);
  
  if (currentIndex === 0) {
    btnLeft.classList.add("disabled");
  }
  if (currentIndex === LANES.length - 1) {
    btnRight.classList.add("disabled");
  }

  btnLeft.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent inspecting card on shift click
    shiftJobLane(job.id, -1);
  });

  btnRight.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent inspecting card on shift click
    shiftJobLane(job.id, 1);
  });

  return card;
}

// Format salary to simple K notation e.g. $145K
function formatSalaryShort(salary) {
  const num = Number(salary);
  if (!num || num <= 0) return "$0";
  return num >= 1000 ? `$${Math.round(num / 1000)}k` : `$${num}`;
}

// SHIFT CARD STATUS LANE
function shiftJobLane(jobId, direction) {
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;

  const currentIndex = LANES.indexOf(job.status);
  const newIndex = currentIndex + direction;

  if (newIndex >= 0 && newIndex < LANES.length) {
    job.status = LANES[newIndex];
    saveToStorage();
    
    // Update active inspector dropdown status sync if inspecting this job
    if (activeJobId === jobId) {
      selStatus.value = job.status;
    }
  }
}

// SELECT A JOB TO SHOW IN THE INSPECTOR
function selectJob(jobId) {
  activeJobId = jobId;
  const job = jobs.find(j => j.id === jobId);
  if (!job) {
    deselectJob();
    return;
  }

  // Visual classes highlight updates
  document.querySelectorAll(".job-card").forEach(c => c.classList.remove("active-card"));
  
  // Fill form controls with details
  jobCompany.value = job.company;
  jobRole.value = job.role;
  jobDate.value = job.dateApplied || "";
  selStatus.value = job.status;
  jobSalary.value = job.salary || "";
  selLocation.value = job.location || "Remote";
  jobUrl.value = job.url || "";
  jobNotes.value = job.notes || "";

  // Render subtasks checklist
  renderTasksChecklist(job);

  // Toggle visible containers
  inspectorEmpty.classList.add("hidden");
  inspectorActive.classList.remove("hidden");

  // Rerender cards to update active styling outline
  renderKanban();
}

// DESELECT INSPECTED CARD
function deselectJob() {
  activeJobId = null;
  inspectorActive.classList.add("hidden");
  inspectorEmpty.classList.remove("hidden");
  renderKanban();
}

// SAVE CHANGES IN ACTIVE INSPECTOR PANEL
function saveActiveJobChanges() {
  if (!activeJobId) return;

  const job = jobs.find(j => j.id === activeJobId);
  if (!job) return;

  // Validate basic inputs
  if (!jobCompany.value.trim() || !jobRole.value.trim()) {
    alert("Please fill in both the Company and Role Title fields.");
    return;
  }

  job.company = jobCompany.value.trim();
  job.role = jobRole.value.trim();
  job.dateApplied = jobDate.value;
  job.status = selStatus.value;
  job.salary = jobSalary.value ? Number(jobSalary.value) : null;
  job.location = selLocation.value;
  job.url = jobUrl.value.trim();
  job.notes = jobNotes.value.trim();

  saveToStorage();
}

// DELETE ACTIVE JOB PROFILE
function deleteActiveJob() {
  if (!activeJobId) return;

  const job = jobs.find(j => j.id === activeJobId);
  if (!job) return;

  if (confirm(`Are you sure you want to delete the job profile for ${job.company} - ${job.role}?`)) {
    jobs = jobs.filter(j => j.id !== activeJobId);
    saveToStorage();
    deselectJob();
  }
}

// ADD NEW BLANK JOB PROFILE
function addNewJobSpec() {
  const newJob = {
    id: "job-" + Date.now().toString(),
    company: "New Company Spec",
    role: "Software Engineer",
    status: "Wishlist",
    dateApplied: new Date().toISOString().split("T")[0],
    salary: 100000,
    location: "Remote",
    url: "",
    notes: "",
    tasks: [
      { id: "task-" + Date.now() + "-1", text: "Polish portfolio and profile spec", completed: false },
      { id: "task-" + Date.now() + "-2", text: "Customize resume for role description", completed: false },
      { id: "task-" + Date.now() + "-3", text: "Locate referral opportunities", completed: false }
    ]
  };

  jobs.unshift(newJob);
  saveToStorage();
  selectJob(newJob.id);
}

// RENDER CHECKLIST TASKS
function renderTasksChecklist(job) {
  tasksChecklist.innerHTML = "";

  if (!job.tasks || job.tasks.length === 0) {
    tasksChecklist.innerHTML = `<li style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 0.5rem 0;">No milestones created yet.</li>`;
    return;
  }

  job.tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    
    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" ${task.completed ? "checked" : ""}>
        <span class="task-text">${escapeHtml(task.text)}</span>
      </div>
      <button class="btn-delete-task" title="Delete Milestone"><i class="fa-solid fa-xmark"></i></button>
    `;

    // Toggle complete
    li.querySelector("input").addEventListener("change", () => {
      task.completed = !task.completed;
      saveToStorage();
    });

    li.querySelector(".task-left").addEventListener("click", (e) => {
      // Toggle completed when clicking details span
      if (e.target.tagName !== "INPUT") {
        task.completed = !task.completed;
        saveToStorage();
      }
    });

    // Delete task milestone
    li.querySelector(".btn-delete-task").addEventListener("click", (e) => {
      e.stopPropagation();
      job.tasks = job.tasks.filter(t => t.id !== task.id);
      saveToStorage();
    });

    tasksChecklist.appendChild(li);
  });
}

// ADD NEW CUSTOM TASK
function handleAddTaskSubmit() {
  if (!activeJobId) return;

  const job = jobs.find(j => j.id === activeJobId);
  if (!job) return;

  const taskText = txtNewTask.value.trim();
  if (!taskText) return;

  if (!job.tasks) {
    job.tasks = [];
  }

  const newTask = {
    id: "task-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    text: taskText,
    completed: false
  };

  job.tasks.push(newTask);
  txtNewTask.value = "";
  saveToStorage();
}

// RESET WORKSPACE MEMORY
function resetWorkspace() {
  if (confirm("Are you absolutely sure you want to reset all jobs data? This will restore the default sandbox specs.")) {
    jobs = [...SEED_JOBS];
    saveToStorage();
    deselectJob();
  }
}

// ESCAPE HTML TO PREVENT XSS IN USER GENERATED STRINGS
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
