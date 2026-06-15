// Team Collaboration Board - Interaction Script

// Predefined default seed team members
const SEED_MEMBERS = [
  { id: "member-alice", name: "Alice Smith", initials: "AS", color: "#e11d48" }, // Rose
  { id: "member-bob", name: "Bob Johnson", initials: "BJ", color: "#2563eb" },   // Blue
  { id: "member-charlie", name: "Charlie Brown", initials: "CB", color: "#16a34a" }, // Green
  { id: "member-diana", name: "Diana Prince", initials: "DP", color: "#d97706" }   // Amber
];

// Predefined default seed task cards
const SEED_TASKS = [
  {
    id: "task-oauth",
    title: "Implement OAuth Login Flow",
    description: "Set up login authorization via Google and Github providers using client-side tokens.",
    priority: "High",
    status: "In Progress",
    date: "2026-06-20",
    assignee: "member-alice",
    subtasks: [
      { id: "sub-oauth-1", text: "Create API developers client keys", completed: true },
      { id: "sub-oauth-2", text: "Integrate login button elements in header", completed: true },
      { id: "sub-oauth-3", text: "Store OAuth access tokens locally in browser", completed: false }
    ]
  },
  {
    id: "task-landing",
    title: "Design Landing Page UI",
    description: "Design a high-fidelity landing page mockup highlighting the value proposition and key widgets.",
    priority: "Medium",
    status: "Done",
    date: "2026-06-15",
    assignee: "member-bob",
    subtasks: [
      { id: "sub-land-1", text: "Review initial wireframes draft", completed: true },
      { id: "sub-land-2", text: "Export Figma design assets", completed: true }
    ]
  },
  {
    id: "task-db",
    title: "Optimize DB Query Indices",
    description: "Analyze latency metrics and add key indexes to tables to resolve performance issues.",
    priority: "High",
    status: "In Review",
    date: "2026-06-18",
    assignee: "member-charlie",
    subtasks: [
      { id: "sub-db-1", text: "Inspect slow query index logs", completed: true },
      { id: "sub-db-2", text: "Write database index migrations", completed: true },
      { id: "sub-db-3", text: "Perform local stress latency checks", completed: false }
    ]
  },
  {
    id: "task-docs",
    title: "Write API Integration Docs",
    description: "Draft complete documentation detailing routes parameters, payloads, and response codes.",
    priority: "Low",
    status: "Backlog",
    date: "2026-06-25",
    assignee: "Unassigned",
    subtasks: [
      { id: "sub-doc-1", text: "Outline main request routes structures", completed: false },
      { id: "sub-doc-2", text: "Insert JSON response payload code snippets", completed: false }
    ]
  }
];

// Kanban columns pipeline order
const LANES = ["Backlog", "In Progress", "In Review", "Done"];

// Avatar colors selection list for newly registered members
const RANDOM_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444"];

// State Variables
let tasks = [];
let members = [];
let activeTaskId = null;

// DOM Elements
const txtSearch = document.getElementById("txt-search");
const selPriorityFilter = document.getElementById("sel-priority-filter");
const selAssigneeFilter = document.getElementById("sel-assignee-filter");

const txtMemberName = document.getElementById("txt-member-name");
const btnAddMember = document.getElementById("btn-add-member");
const membersList = document.getElementById("members-list");

const btnResetWorkspace = document.getElementById("btn-reset-workspace");
const btnAddTask = document.getElementById("btn-add-task");

const colBacklog = document.getElementById("col-backlog");
const colProgress = document.getElementById("col-progress");
const colReview = document.getElementById("col-review");
const colDone = document.getElementById("col-done");

const lblGlobalProgressPct = document.getElementById("lbl-global-progress-pct");
const globalProgressFill = document.getElementById("global-progress-fill");

const inspectorEmpty = document.getElementById("inspector-empty");
const inspectorActive = document.getElementById("inspector-active");

// Form controls details inspector
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const selTaskPriority = document.getElementById("sel-task-priority");
const taskDate = document.getElementById("task-date");
const selTaskAssignee = document.getElementById("sel-task-assignee");
const selTaskStatus = document.getElementById("sel-task-status");

const subtasksList = document.getElementById("subtasks-list");
const txtNewSubtask = document.getElementById("txt-new-subtask");
const btnAddSubtask = document.getElementById("btn-add-subtask");

const btnDeleteTask = document.getElementById("btn-delete-task");
const btnSaveTask = document.getElementById("btn-save-task");

// INITIALIZATION
window.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  syncWorkspace();
});

// Load from localStorage or defaults
function loadData() {
  const storedMembers = localStorage.getItem("collabboard_members");
  const storedTasks = localStorage.getItem("collabboard_tasks");

  if (storedMembers) {
    try { members = JSON.parse(storedMembers); } catch (e) { members = [...SEED_MEMBERS]; }
  } else {
    members = [...SEED_MEMBERS];
    localStorage.setItem("collabboard_members", JSON.stringify(members));
  }

  if (storedTasks) {
    try { tasks = JSON.parse(storedTasks); } catch (e) { tasks = [...SEED_TASKS]; }
  } else {
    tasks = [...SEED_TASKS];
    localStorage.setItem("collabboard_tasks", JSON.stringify(tasks));
  }
}

function saveToStorage() {
  localStorage.setItem("collabboard_members", JSON.stringify(members));
  localStorage.setItem("collabboard_tasks", JSON.stringify(tasks));
  syncWorkspace();
}

// Global UI State Sync
function syncWorkspace() {
  calculateProgress();
  populateDropdownFilters();
  renderMembers();
  renderBoards();
  
  if (activeTaskId) {
    const task = tasks.find(t => t.id === activeTaskId);
    if (task) {
      renderSubtasks(task);
    }
  }
}

// EVENT LISTENERS
function setupEventListeners() {
  // Filters
  txtSearch.addEventListener("input", renderBoards);
  selPriorityFilter.addEventListener("change", renderBoards);
  selAssigneeFilter.addEventListener("change", renderBoards);

  // Buttons actions
  btnAddMember.addEventListener("click", registerNewMember);
  txtMemberName.addEventListener("keypress", (e) => {
    if (e.key === "Enter") registerNewMember();
  });

  btnAddTask.addEventListener("click", createNewTask);
  btnResetWorkspace.addEventListener("click", resetWorkspace);

  // Inspector actions
  btnSaveTask.addEventListener("click", saveTaskChanges);
  btnDeleteTask.addEventListener("click", deleteTaskCard);
  btnAddSubtask.addEventListener("click", handleAddSubtaskSubmit);
  txtNewSubtask.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleAddSubtaskSubmit();
  });

  // Track status lane modifications dynamically
  selTaskStatus.addEventListener("change", () => {
    if (activeTaskId) {
      const task = tasks.find(t => t.id === activeTaskId);
      if (task) {
        task.status = selTaskStatus.value;
        saveToStorage();
      }
    }
  });
}

// CALCULATE PROJECT COMPLETION STATS
function calculateProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "Done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  lblGlobalProgressPct.textContent = `${pct}% Complete (${done}/${total})`;
  globalProgressFill.style.width = `${pct}%`;

  // Lane count badges updates
  document.getElementById("count-backlog").textContent = tasks.filter(t => t.status === "Backlog").length;
  document.getElementById("count-progress").textContent = tasks.filter(t => t.status === "In Progress").length;
  document.getElementById("count-review").textContent = tasks.filter(t => t.status === "In Review").length;
  document.getElementById("count-done").textContent = done;
}

// POPULATE ASSIGNEE DROPDOWNS
function populateDropdownFilters() {
  // Save current values to restore them
  const prevFilterVal = selAssigneeFilter.value;
  const prevTaskVal = selTaskAssignee.value;

  selAssigneeFilter.innerHTML = `<option value="All">All Members</option>`;
  selTaskAssignee.innerHTML = `<option value="Unassigned">Unassigned</option>`;

  members.forEach(m => {
    const optFilter = document.createElement("option");
    optFilter.value = m.id;
    optFilter.textContent = m.name;
    selAssigneeFilter.appendChild(optFilter);

    const optTask = document.createElement("option");
    optTask.value = m.id;
    optTask.textContent = m.name;
    selTaskAssignee.appendChild(optTask);
  });

  // Restore previous selections if valid
  if ([...selAssigneeFilter.options].some(o => o.value === prevFilterVal)) {
    selAssigneeFilter.value = prevFilterVal;
  }
  if ([...selTaskAssignee.options].some(o => o.value === prevTaskVal)) {
    selTaskAssignee.value = prevTaskVal;
  }
}

// RENDER MEMBERS DIRECTORY (LEFT COLUMN)
function renderMembers() {
  membersList.innerHTML = "";
  if (members.length === 0) {
    membersList.innerHTML = `<li style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 0.5rem 0;">No registered members.</li>`;
    return;
  }

  members.forEach(m => {
    const li = document.createElement("li");
    li.className = "member-item";
    li.innerHTML = `
      <div class="member-profile">
        <span class="avatar-badge" style="background-color: ${m.color}">${m.initials}</span>
        <span>${escapeHtml(m.name)}</span>
      </div>
      <button class="btn-delete-member" onclick="removeRegisteredMember('${m.id}')" title="Unregister Member"><i class="fa-solid fa-user-minus"></i></button>
    `;
    membersList.appendChild(li);
  });
}

// RENDER KANBAN PIPELINE BOARD (CENTER)
function renderBoards() {
  const query = txtSearch.value.trim().toLowerCase();
  const priorityFilter = selPriorityFilter.value;
  const assigneeFilter = selAssigneeFilter.value;

  // Clear lane cards wrappers
  colBacklog.innerHTML = "";
  colProgress.innerHTML = "";
  colReview.innerHTML = "";
  colDone.innerHTML = "";

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query);

    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === "All" || task.assignee === assigneeFilter;

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  filteredTasks.forEach(task => {
    const card = createTaskCard(task);
    
    switch (task.status) {
      case "Backlog":
        colBacklog.appendChild(card);
        break;
      case "In Progress":
        colProgress.appendChild(card);
        break;
      case "In Review":
        colReview.appendChild(card);
        break;
      case "Done":
        colDone.appendChild(card);
        break;
    }
  });

  // Fill empty column placeholders
  const columns = [
    { col: colBacklog, text: "Backlog is empty" },
    { col: colProgress, text: "No tasks in progress" },
    { col: colReview, text: "No reviews requested" },
    { col: colDone, text: "No completed task cards" }
  ];

  columns.forEach(w => {
    if (w.col.children.length === 0) {
      const div = document.createElement("div");
      div.className = "empty-lane-placeholder";
      div.style.textAlign = "center";
      div.style.padding = "2rem 0.5rem";
      div.style.color = "var(--text-muted)";
      div.style.fontSize = "0.75rem";
      div.style.border = "1px dashed rgba(255,255,255,0.02)";
      div.style.borderRadius = "var(--radius-sm)";
      div.textContent = w.text;
      w.col.appendChild(div);
    }
  });
}

// CREATE TASK CARD COMPONENT
function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card";
  if (task.id === activeTaskId) {
    card.classList.add("active-card");
  }

  // Subtask progress calculation
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const pct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Retrieve assignee avatar metadata
  let avatarHtml = `<span class="avatar-badge" style="background-color: #374151" title="Unassigned">?</span>`;
  if (task.assignee !== "Unassigned") {
    const member = members.find(m => m.id === task.assignee);
    if (member) {
      avatarHtml = `<span class="avatar-badge" style="background-color: ${member.color}" title="${escapeHtml(member.name)}">${member.initials}</span>`;
    }
  }

  // Priority class
  let prioClass = "prio-low";
  if (task.priority === "Medium") prioClass = "prio-medium";
  if (task.priority === "High") prioClass = "prio-high";

  card.innerHTML = `
    <div class="card-top-row">
      <span class="priority-badge ${prioClass}">${task.priority}</span>
      <span class="card-date"><i class="fa-regular fa-calendar"></i> ${task.date ? formatDateShort(task.date) : "No date"}</span>
    </div>
    <div class="card-title" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</div>
    
    <div class="card-progress-wrapper">
      <div class="card-progress-text">
        <span>Subtasks</span>
        <span>${completedSubtasks}/${totalSubtasks} (${pct}%)</span>
      </div>
      <div class="card-progress-bar">
        <div class="card-progress-fill" style="width: ${pct}%"></div>
      </div>
    </div>

    <div class="card-footer-row">
      ${avatarHtml}
      <div class="card-quick-actions">
        <button class="card-quick-btn btn-shift-left" title="Move Left"><i class="fa-solid fa-angle-left"></i></button>
        <button class="card-quick-btn btn-shift-right" title="Move Right"><i class="fa-solid fa-angle-right"></i></button>
      </div>
    </div>
  `;

  // Click inspect details card
  card.addEventListener("click", () => {
    selectTaskCard(task.id);
  });

  // Arrow shifts
  const btnLeft = card.querySelector(".btn-shift-left");
  const btnRight = card.querySelector(".btn-shift-right");

  const currentIdx = LANES.indexOf(task.status);
  
  if (currentIdx === 0) btnLeft.classList.add("disabled");
  if (currentIdx === LANES.length - 1) btnRight.classList.add("disabled");

  btnLeft.addEventListener("click", (e) => {
    e.stopPropagation();
    shiftTaskColumn(task.id, -1);
  });

  btnRight.addEventListener("click", (e) => {
    e.stopPropagation();
    shiftTaskColumn(task.id, 1);
  });

  return card;
}

// Format YYYY-MM-DD to simple text e.g. Jun 20
function formatDateShort(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mIdx = parseInt(parts[1], 10) - 1;
  return `${months[mIdx]} ${parseInt(parts[2], 10)}`;
}

// SHIFT CARD STATUS LEL
function shiftTaskColumn(taskId, direction) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const currentIdx = LANES.indexOf(task.status);
  const newIdx = currentIdx + direction;

  if (newIdx >= 0 && newIdx < LANES.length) {
    task.status = LANES[newIdx];
    saveToStorage();

    // Sync active inspector dropdown status
    if (activeTaskId === taskId) {
      selTaskStatus.value = task.status;
    }
  }
}

// REGISTER NEW TEAM MEMBER
function registerNewMember() {
  const name = txtMemberName.value.trim();
  if (!name) {
    alert("Please enter a Member Name.");
    return;
  }

  // Generate initials
  const nameParts = name.split(" ");
  let initials = nameParts[0].charAt(0);
  if (nameParts.length > 1) {
    initials += nameParts[nameParts.length - 1].charAt(0);
  }
  initials = initials.toUpperCase();

  // Generate random avatar color
  const color = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];

  const id = "member-" + Date.now();
  const newMember = {
    id: id,
    name: name,
    initials: initials,
    color: color
  };

  members.push(newMember);
  txtMemberName.value = "";
  saveToStorage();
}

// DELETE REGISTERED MEMBER (RESTORES ASSIGNMENTS TO UNASSIGNED)
window.removeRegisteredMember = function(id) {
  const member = members.find(m => m.id === id);
  if (!member) return;

  if (confirm(`Are you sure you want to unregister ${member.name}? All tasks assigned to them will reset to Unassigned.`)) {
    // Reset tasks assigned
    tasks.forEach(t => {
      if (t.assignee === id) {
        t.assignee = "Unassigned";
      }
    });

    members = members.filter(m => m.id !== id);
    saveToStorage();
  }
};

// SELECT TASK FOR DETAILS VIEW
function selectTaskCard(taskId) {
  activeTaskId = taskId;
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    deselectTaskCard();
    return;
  }

  // Highlights visual selection borders outline
  document.querySelectorAll(".task-card").forEach(c => c.classList.remove("active-card"));

  // Bind values to inputs
  taskTitle.value = task.title;
  taskDescription.value = task.description;
  selTaskPriority.value = task.priority;
  taskDate.value = task.date || "";
  selTaskAssignee.value = task.assignee;
  selTaskStatus.value = task.status;

  // Render checklist subtasks
  renderSubtasks(task);

  // Toggle visible cards
  inspectorEmpty.classList.add("hidden");
  inspectorActive.classList.remove("hidden");

  // Rerender cards list to show highlight outline
  renderBoards();
}

// DESELECT INSPECTOR ACTIVE
function deselectTaskCard() {
  activeTaskId = null;
  inspectorActive.classList.add("hidden");
  inspectorEmpty.classList.remove("hidden");
  renderBoards();
}

// SAVE ACTIVE TASK VALUES
function saveTaskChanges() {
  if (!activeTaskId) return;

  const task = tasks.find(t => t.id === activeTaskId);
  if (!task) return;

  // Validate inputs
  if (!taskTitle.value.trim()) {
    alert("Please enter a Task Title.");
    return;
  }

  task.title = taskTitle.value.trim();
  task.description = taskDescription.value.trim();
  task.priority = selTaskPriority.value;
  task.date = taskDate.value;
  task.assignee = selTaskAssignee.value;
  task.status = selTaskStatus.value;

  saveToStorage();
}

// DELETE ACTIVE TASK CARD
function deleteTaskCard() {
  if (!activeTaskId) return;

  const task = tasks.find(t => t.id === activeTaskId);
  if (!task) return;

  if (confirm(`Are you sure you want to delete the task card: "${task.title}"?`)) {
    tasks = tasks.filter(t => t.id !== activeTaskId);
    saveToStorage();
    deselectTaskCard();
  }
}

// CREATE NEW BLANK TASK
function createNewTask() {
  const newTask = {
    id: "task-" + Date.now(),
    title: "New Task Spec",
    description: "",
    priority: "Medium",
    status: "Backlog",
    date: new Date().toISOString().split("T")[0],
    assignee: "Unassigned",
    subtasks: [
      { id: "sub-" + Date.now() + "-1", text: "Task research details", completed: false },
      { id: "sub-" + Date.now() + "-2", text: "Execution drafts", completed: false }
    ]
  };

  tasks.unshift(newTask);
  saveToStorage();
  selectTaskCard(newTask.id);
}

// RENDER CHECKLIST MILSTESTONE SUBTASKS
function renderSubtasks(task) {
  subtasksList.innerHTML = "";

  if (!task.subtasks || task.subtasks.length === 0) {
    subtasksList.innerHTML = `<li style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 0.5rem 0;">No subtasks created yet.</li>`;
    return;
  }

  task.subtasks.forEach(sub => {
    const li = document.createElement("li");
    li.className = `subtask-item ${sub.completed ? "completed" : ""}`;

    li.innerHTML = `
      <div class="subtask-left">
        <input type="checkbox" ${sub.completed ? "checked" : ""}>
        <span class="subtask-text">${escapeHtml(sub.text)}</span>
      </div>
      <button class="btn-delete-subtask" title="Delete Milestone"><i class="fa-solid fa-xmark"></i></button>
    `;

    // Toggle complete checklist
    li.querySelector("input").addEventListener("change", () => {
      sub.completed = !sub.completed;
      saveToStorage();
    });

    li.querySelector(".subtask-left").addEventListener("click", (e) => {
      if (e.target.tagName !== "INPUT") {
        sub.completed = !sub.completed;
        saveToStorage();
      }
    });

    // Delete subtask
    li.querySelector(".btn-delete-subtask").addEventListener("click", (e) => {
      e.stopPropagation();
      task.subtasks = task.subtasks.filter(s => s.id !== sub.id);
      saveToStorage();
    });

    subtasksList.appendChild(li);
  });
}

// ADD NEW CUSTOM CHECKLIST ITEM
function handleAddSubtaskSubmit() {
  if (!activeTaskId) return;

  const task = tasks.find(t => t.id === activeTaskId);
  if (!task) return;

  const text = txtNewSubtask.value.trim();
  if (!text) return;

  if (!task.subtasks) {
    task.subtasks = [];
  }

  const newSub = {
    id: "sub-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    text: text,
    completed: false
  };

  task.subtasks.push(newSub);
  txtNewSubtask.value = "";
  saveToStorage();
}

// RESET WORKSPACE DATA PARAMETERS
function resetWorkspace() {
  if (confirm("Reset Board workspace data? This will restore the default sandbox task cards and members registry.")) {
    members = [...SEED_MEMBERS];
    tasks = [...SEED_TASKS];
    
    localStorage.setItem("collabboard_members", JSON.stringify(members));
    localStorage.setItem("collabboard_tasks", JSON.stringify(tasks));
    
    deselectTaskCard();
    syncWorkspace();
  }
}

// ESCAPE HTML TO PREVENT XSS
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
