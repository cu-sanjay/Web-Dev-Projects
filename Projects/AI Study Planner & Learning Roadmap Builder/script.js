/**
 * LearnFlow - AI Study Planner & Learning Roadmap Builder
 * Core Logic Engine
 */

// 1. Core Curriculum Database
const CURRICULUM_DATABASE = {
  frontend: {
    title: "Frontend Web Development Roadmap",
    durationMultiplier: 1.0,
    modules: [
      {
        id: "fe_mod1",
        name: "HTML5 & Web Accessibility (a11y)",
        hours: 15,
        desc: "Master layout structuring using modern semantic tags. Understand screen readers, form validation steps, keyboard navigation focus, and basic W3C accessibility check rules.",
        tasks: ["Master HTML5 semantic element tags", "Structure forms with accessible label tags", "Verify page navigation using keyboard Tab key only", "Implement critical ARIA landmarks"],
        resource: { name: "Google Web Fundamentals Accessibility Guide", url: "https://web.dev/learn/accessibility/" }
      },
      {
        id: "fe_mod2",
        name: "CSS Layouts & Responsive Systems",
        hours: 20,
        desc: "Design visual layouts from scratch. Master CSS flex layouts, custom grids, absolute positioning rules, media queries, custom variables, and responsive media scales.",
        tasks: ["Align card components with Flexbox margins", "Create a dashboard grid overlay using CSS Grid", "Write mobile-first media query breakpoints", "Declare custom root styling theme tokens"],
        resource: { name: "CSS-Tricks Complete Guide to CSS Grid", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" }
      },
      {
        id: "fe_mod3",
        name: "JavaScript Core & Async APIs",
        hours: 25,
        desc: "Understand lexical scope contexts, DOM mutations, async request headers, promise structures, Fetch functions, and JSON parse techniques.",
        tasks: ["Write clean closure functions protecting scope", "Handle keyboard and click events on DOM cards", "Fetch resource data grids using async/await", "Format telemetry logs in JSON strings"],
        resource: { name: "Eloquent JavaScript - Online Textbook", url: "https://eloquentjavascript.net" }
      },
      {
        id: "fe_mod4",
        name: "React.js Framework & State Hooks",
        hours: 30,
        desc: "Build highly reusable template interfaces. Master props forwarding, state lifecycle arrays, virtual DOM renders, local caching hooks, and package compiler builds (Vite).",
        tasks: ["Design reusable component cards in JSX", "Manage forms input values with useState hooks", "Fetch external data logs in useEffect setups", "Compile final build folder using Vite scripts"],
        resource: { name: "React Official Quick Start Guide", url: "https://react.dev/learn" }
      }
    ]
  },
  "machine-learning": {
    title: "Machine Learning & Python Roadmap",
    durationMultiplier: 1.2,
    modules: [
      {
        id: "ml_mod1",
        name: "Python Core & Numerical Arrays",
        hours: 20,
        desc: "Acquire data structure syntax routines in Python. Master standard loops, dictionary mapping, list comprehensions, and data frames using Pandas and NumPy.",
        tasks: ["Write helper scripts with files inputs", "Compute averages using NumPy array grids", "Filter column indices using Pandas selectors", "Join dataset lists with columns criteria"],
        resource: { name: "W3Schools Python Reference Library", url: "https://www.w3schools.com/python/" }
      },
      {
        id: "ml_mod2",
        name: "Data Analytics & Visual Charts",
        hours: 20,
        desc: "Evaluate datasets visually to identify patterns. Build coordinate charts, heatmaps, and grids using Matplotlib/Seaborn. Perform dataset row cleanses.",
        tasks: ["Plot value distributions using Matplotlib", "Create dataset correlation heatmaps in Seaborn", "Drop NULL cells and format outlier rows", "Normalize dimensions using feature scaling"],
        resource: { name: "Seaborn Data Visualization Gallery", url: "https://seaborn.pydata.org/examples/index.html" }
      },
      {
        id: "ml_mod3",
        name: "Supervised ML Classifiers",
        hours: 30,
        desc: "Master linear regressions, logistic regressions, decision tree boundaries, and cluster groupings. Understand regression slopes and classification thresholds.",
        tasks: ["Model data using linear regression curves", "Code classifier logic with decision trees", "Evaluate clustering boundaries using Scikit-Learn", "Fit prediction weights on custom test sets"],
        resource: { name: "Scikit-Learn Classifier Getting Started Guide", url: "https://scikit-learn.org/stable/getting_started.html" }
      },
      {
        id: "ml_mod4",
        name: "Evaluation Analytics & Tuning",
        hours: 25,
        desc: "Diagnose prediction models. Implement train-test cross-validation splits, evaluate confusion matrices, check precision/recall balances, and run hyperparameter grids.",
        tasks: ["Split data arrays with train_test_split", "Draw Confusion Matrix grids tracking metrics", "Calculate Precision, Recall, and F1 ratios", "Run GridSearch tuning loop evaluations"],
        resource: { name: "Machine Learning Mastery - Tuning Guides", url: "https://machinelearningmastery.com" }
      }
    ]
  },
  dsa: {
    title: "Data Structures & Algorithms Roadmap",
    durationMultiplier: 1.3,
    modules: [
      {
        id: "ds_mod1",
        name: "Linear Data structures & Complexity",
        hours: 20,
        desc: "Evaluate array and list operational runtimes. Understand stack queues, node references, pointer boundaries, and Big-O notation constraints.",
        tasks: ["Calculate runtime values in Big-O bounds", "Construct custom Linked List node references", "Code FIFO/LIFO pipelines using Stacks & Queues", "Solve arrays indexing problems"],
        resource: { name: "GeeksforGeeks Data Structures Guides", url: "https://www.geeksforgeeks.org/data-structures/" }
      },
      {
        id: "ds_mod2",
        name: "Sorting Algorithms & Searches",
        hours: 20,
        desc: "Implement divide-and-conquer systems. Master QuickSort, MergeSort, double-pointer checks, and binary search operations.",
        tasks: ["Write recursion loops for Binary Search", "Implement QuickSort pivot swaps", "Code MergeSort array subdivisions", "Trace comparisons counts across operations"],
        resource: { name: "Visualgo Algorithm Sorting Animations", url: "https://visualgo.net/en/sorting" }
      },
      {
        id: "ds_mod3",
        name: "Trees, Graphs & Recursion",
        hours: 30,
        desc: "Master hierarchical node traversals. Code Binary Search Tree node insertions, tree traversals, BFS and DFS algorithms.",
        tasks: ["Construct balanced Binary Search Trees", "Perform Inorder, Preorder, Postorder runs", "Implement Graph BFS queue searches", "Traverse complex maps using DFS loops"],
        resource: { name: "Khan Academy Algorithms Curriculum", url: "https://www.khanacademy.org/computing/computer-science/algorithms" }
      },
      {
        id: "ds_mod4",
        name: "Dynamic Programming Foundations",
        hours: 30,
        desc: "Solve overlapping problem sets efficiently. Learn memoization caching, tabulation steps, Knapsack calculations, and matrix-chain optimizations.",
        tasks: ["Optimize recursion trees with Memoization grids", "Solve Fibonacci series using Tabulation", "Implement 0-1 Knapsack limit loops", "Analyze overlapping step costs"],
        resource: { name: "LeetCode Dynamic Programming Practice Set", url: "https://leetcode.com/discuss/study-guide/458695/dynamic-programming-patterns" }
      }
    ]
  },
  devops: {
    title: "DevOps & Cloud Systems Roadmap",
    durationMultiplier: 1.15,
    modules: [
      {
        id: "dv_mod1",
        name: "Linux Commands & Scripting",
        hours: 15,
        desc: "Master system command processes. Learn file navigation, grep pattern search, pipeline redirection, cron configurations, and basic shell script logic.",
        tasks: ["Filter text files using Ripgrep commands", "Redirect process outputs into custom log files", "Schedule bash runs using Cron jobs", "Write simple Bash variable conditional loops"],
        resource: { name: "Linux Command Line Cheat Sheet", url: "https://linuxjourney.com" }
      },
      {
        id: "dv_mod2",
        name: "Container Services (Docker)",
        hours: 20,
        desc: "Isolate software environments. Construct custom Dockerfiles, bind network ports, manage volume mounts, and coordinate multiple containers.",
        tasks: ["Compose custom Dockerfiles with instructions", "Map local directories with Volume Mounts", "Expose ports mapping networks", "Manage multi-container setups in Compose"],
        resource: { name: "Docker Getting Started Guide", url: "https://docs.docker.com/get-started/" }
      },
      {
        id: "dv_mod3",
        name: "CI/CD Integration Pipelines",
        hours: 20,
        desc: "Automate code compilation, test checks, and releases. Master pipeline structures, YAML configs, and runner variables.",
        tasks: ["Author test actions in YAML files", "Configure trigger hooks on push events", "Track credentials using secure repository Secrets", "Integrate deployment checks to staging systems"],
        resource: { name: "GitHub Actions Workflow Guides", url: "https://docs.github.com/en/actions" }
      },
      {
        id: "dv_mod4",
        name: "Cloud Hosting & Orchestration",
        hours: 30,
        desc: "Deploy files at scale. Configure virtual instances, security groups, cloud storage repositories, and container pods (Kubernetes).",
        tasks: ["Spawn virtual machines in AWS console", "Manage objects inside AWS S3 buckets", "Write manifest files for Kubernetes pods", "Deploy containers through ingress routes"],
        resource: { name: "AWS Developer Center Getting Started", url: "https://aws.amazon.com/developer/language/javascript/" }
      }
    ]
  },
  "system-design": {
    title: "Backend System Design Roadmap",
    durationMultiplier: 1.25,
    modules: [
      {
        id: "sd_mod1",
        name: "REST APIs & Authorization Check",
        hours: 20,
        desc: "Structure scalable communication endpoints. Master routing endpoints, request parameters validation, JWT authorization, and CORS headers.",
        tasks: ["Model endpoints with REST guidelines", "Validate incoming JSON schema inputs", "Implement JWT signatures checking sessions", "Configure origins with CORS header rules"],
        resource: { name: "API Blueprint Reference Guides", url: "https://apiblueprint.org" }
      },
      {
        id: "sd_mod2",
        name: "Databases Tuning & Cache Layers",
        hours: 25,
        desc: "Optimize data retrieval latency. Master database indexing structures, read replication configurations, transactions properties, and memory caches (Redis).",
        tasks: ["Create composite indexes speed lookup", "Setup replication nodes data backups", "Write transactional statements ensuring consistency", "Implement memory caching loops using Redis"],
        resource: { name: "Redis Core Developer documentation", url: "https://redis.io/docs/" }
      },
      {
        id: "sd_mod3",
        name: "Distributed Services & Gateways",
        hours: 25,
        desc: "Scale traffic routing. Master load balancer configurations, rate-limiting rules, microservice routing gateways, and service registries.",
        tasks: ["Distribute load patterns using Nginx", "Write sliding-window rate limit counters", "Route system inputs through API Gateways", "Trace request IDs across service boundaries"],
        resource: { name: "Nginx Load Balancing Tutorial", url: "https://docs.nginx.com/nginx/admin-guide/load-balancer/" }
      },
      {
        id: "sd_mod4",
        name: "Async Work & Message Brokers",
        hours: 30,
        desc: "De-couple backend services. Master message queue workers, pub-sub architectures (Kafka/RabbitMQ), system circuit breakers, and monitoring logs.",
        tasks: ["Publish task payloads to RabbitMQ queues", "Consume event data grids with Kafka threads", "Implement fallback loops using Circuit Breakers", "Monitor service availability indicators"],
        resource: { name: "RabbitMQ Developer Tutorials", url: "https://www.rabbitmq.com/getstarted.html" }
      }
    ]
  }
};

// 2. State Variables
let currentActiveTopic = "";
let currentPacingStyle = "balanced";
let currentWeeklyHours = 15;

// Data persistence containers
let activeRoadmapState = {}; // { [moduleId]: { status: 'todo'|'doing'|'done', notes: '', checklist: { [taskIndex]: boolean } } }
let telemetryStats = {
  totalHours: 0,
  streakCount: 0,
  lastUpdateDate: ""
};

let activeSelectedNode = null;
let saveDebounceTimer = null;

// 3. DOM Cache
const selectTopicEl = document.getElementById("select-topic");
const selectPacingEl = document.getElementById("select-pacing");
const rangeHoursEl = document.getElementById("range-hours");
const labelHoursEl = document.getElementById("label-hours");
const btnBuildRoadmapEl = document.getElementById("btn-build-roadmap");

// Telemetry Stats
const valCompletionEl = document.getElementById("val-completion");
const progressIndicatorEl = document.getElementById("progress-indicator");
const valTotalHoursEl = document.getElementById("val-total-hours");
const valStreakEl = document.getElementById("val-streak");
const valActiveNodeEl = document.getElementById("val-active-node");

// Canvas
const roadmapTitleEl = document.getElementById("roadmap-title");
const lblDurationEstEl = document.getElementById("lbl-duration-est");
const roadmapNodesListEl = document.getElementById("roadmap-nodes-list");
const svgConnectorsEl = document.getElementById("svg-connectors");

// Drawer
const drawerPanelEl = document.getElementById("drawer-panel");
const btnCloseDrawerEl = document.getElementById("btn-close-drawer");
const drawerNodeIndexEl = document.getElementById("drawer-node-index");
const drawerNodeNameEl = document.getElementById("drawer-node-name");
const selectNodeStatusEl = document.getElementById("select-node-status");
const numLogHoursEl = document.getElementById("num-log-hours");
const btnLogHoursEl = document.getElementById("btn-log-hours");
const drawerNodeDescEl = document.getElementById("drawer-node-desc");
const drawerChecklistEl = document.getElementById("drawer-checklist");
const drawerNotepadEl = document.getElementById("drawer-notepad");
const notepadSaveIndicatorEl = document.getElementById("notepad-save-indicator");
const drawerResourceContainerEl = document.getElementById("drawer-resource-container");

// Reset buttons
const btnResetStorageEl = document.getElementById("btn-reset-storage");

// 4. Initializer
window.addEventListener("DOMContentLoaded", () => {
  loadTelemetry();
  setupEventListeners();
  updateHoursLabel();
  
  // Auto load last built plan if available
  const lastTopic = localStorage.getItem("learnflow_last_topic");
  if (lastTopic) {
    selectTopicEl.value = lastTopic;
    buildActiveRoadmap();
  }
});

// Window resize updates connection lines
window.addEventListener("resize", () => {
  if (currentActiveTopic) {
    setTimeout(drawConnectorLines, 150);
  }
});

// 5. Data Loaders
function loadTelemetry() {
  const stats = localStorage.getItem("learnflow_telemetry");
  if (stats) {
    try { telemetryStats = JSON.parse(stats); } catch (e) { console.error(e); }
  }
  
  // Calculate streaks check
  if (telemetryStats.lastUpdateDate) {
    const today = new Date();
    const lastDate = new Date(telemetryStats.lastUpdateDate);
    const timeDiff = today.getTime() - lastDate.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    if (dayDiff > 1) {
      telemetryStats.streakCount = 0;
      saveTelemetry();
    }
  }
  
  updateTelemetryUI();
}

function saveTelemetry() {
  localStorage.setItem("learnflow_telemetry", JSON.stringify(telemetryStats));
}

function loadRoadmapState(topicId) {
  const key = `learnflow_state_${topicId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      activeRoadmapState = JSON.parse(stored);
    } catch (e) {
      console.error(e);
      activeRoadmapState = {};
    }
  } else {
    activeRoadmapState = {};
  }
}

function saveRoadmapState() {
  if (!currentActiveTopic) return;
  const key = `learnflow_state_${currentActiveTopic}`;
  localStorage.setItem(key, JSON.stringify(activeRoadmapState));
}

// 6. Navigation and Form binding
function setupEventListeners() {
  rangeHoursEl.addEventListener("input", updateHoursLabel);
  btnBuildRoadmapEl.addEventListener("click", buildActiveRoadmap);

  // Close Drawer
  btnCloseDrawerEl.addEventListener("click", hideDrawer);
  
  // Node state change
  selectNodeStatusEl.addEventListener("change", handleNodeStatusChange);
  
  // Log Hours button
  btnLogHoursEl.addEventListener("click", handleLogHoursInput);
  
  // Notepad updates
  drawerNotepadEl.addEventListener("input", handleNotepadTyping);

  // Close drawer on click outside content
  drawerPanelEl.addEventListener("click", (e) => {
    if (e.target === drawerPanelEl) hideDrawer();
  });

  // Clear data
  btnResetStorageEl.addEventListener("click", () => {
    if (confirm("Clear all roadmap logs, hours records, and notes data? This resets the dashboard.")) {
      localStorage.clear();
      activeRoadmapState = {};
      telemetryStats = { totalHours: 0, streakCount: 0, lastUpdateDate: "" };
      
      updateTelemetryUI();
      hideDrawer();
      
      // Reset DOM nodes
      roadmapNodesListEl.innerHTML = `
        <div class="roadmap-placeholder">
          <i class="fa-solid fa-circle-nodes placeholder-icon"></i>
          <h3>No Roadmap Built Yet</h3>
          <p>Customize your target topic domain and weekly study capacity, then trigger the generator to map custom milestones linked with connection guides.</p>
        </div>
      `;
      svgConnectorsEl.innerHTML = "";
      roadmapTitleEl.textContent = "Learning Pathway Canvas";
      lblDurationEstEl.textContent = "0 Weeks";
      currentActiveTopic = "";
      
      alert("App data reset.");
    }
  });
}

function updateHoursLabel() {
  currentWeeklyHours = parseInt(rangeHoursEl.value);
  labelHoursEl.textContent = `${currentWeeklyHours} hrs`;
}

// 7. Scheduler Math & Builder
function buildActiveRoadmap() {
  const topicId = selectTopicEl.value;
  const pacing = selectPacingEl.value;
  
  currentActiveTopic = topicId;
  currentPacingStyle = pacing;
  
  // Load state
  loadRoadmapState(topicId);
  localStorage.setItem("learnflow_last_topic", topicId);

  const db = CURRICULUM_DATABASE[topicId];
  if (!db) return;

  roadmapTitleEl.textContent = db.title;
  
  // Schedule Math:
  // Determine duration multiplier based on Pacing Selection
  let pacingMultiplier = 1.0;
  if (pacing === "focused") pacingMultiplier = 0.7; // accelerated weeks
  if (pacing === "relaxed") pacingMultiplier = 1.35; // extended weeks

  let startWeek = 1;
  let totalCalculatedWeeks = 0;

  roadmapNodesListEl.innerHTML = "";
  
  const generatedNodeElements = db.modules.map((m, index) => {
    // Basic node state initialize if missing
    if (!activeRoadmapState[m.id]) {
      activeRoadmapState[m.id] = {
        status: "todo",
        notes: "",
        checklist: {}
      };
    }

    const stateObj = activeRoadmapState[m.id];
    
    // Module hours adjusted by curriculum weight and pacing styles
    const moduleHoursTotal = Math.round(m.hours * db.durationMultiplier);
    const weeksNeeded = Math.max(Math.round((moduleHoursTotal / currentWeeklyHours) * pacingMultiplier), 1);
    
    const endWeek = startWeek + weeksNeeded - 1;
    let weekSpanText = `Week ${startWeek}`;
    if (weeksNeeded > 1) {
      weekSpanText = `Weeks ${startWeek}-${endWeek}`;
    }
    
    totalCalculatedWeeks = endWeek;
    startWeek = endWeek + 1;

    // Create node element box
    const box = document.createElement("div");
    box.className = `roadmap-node-box ${stateObj.status}`;
    box.id = `node-${m.id}`;
    box.tabIndex = 0;

    box.innerHTML = `
      <div class="node-meta">
        <span class="node-week">${weekSpanText} &bull; Est: ${moduleHoursTotal} hrs</span>
        <h4 class="node-name">${m.name}</h4>
        <p class="node-summary-p">${m.desc}</p>
      </div>
      <div class="node-status-glow" title="Status: ${stateObj.status.toUpperCase()}"></div>
    `;

    // Click trigger opens drawer details panel
    const openAction = () => {
      showNodeDrawer(m, stateObj, weekSpanText, index + 1);
    };

    box.addEventListener("click", openAction);
    box.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        openAction();
      }
    });

    roadmapNodesListEl.appendChild(box);
    return box;
  });

  lblDurationEstEl.textContent = `${totalCalculatedWeeks} Weeks Total`;

  // Draw lines
  setTimeout(() => {
    drawConnectorLines();
  }, 100);

  // Recalculate metrics
  calculateAnalytics();
}

// 8. Visual Connection paths
function drawConnectorLines() {
  if (!currentActiveTopic) return;
  svgConnectorsEl.innerHTML = "";

  const db = CURRICULUM_DATABASE[currentActiveTopic];
  if (!db) return;

  const width = svgConnectorsEl.clientWidth;
  const height = svgConnectorsEl.clientHeight;
  svgConnectorsEl.setAttribute("viewBox", `0 0 ${width} ${height}`);

  for (let i = 0; i < db.modules.length - 1; i++) {
    const fromId = db.modules[i].id;
    const toId = db.modules[i + 1].id;

    const fromEl = document.getElementById(`node-${fromId}`);
    const toEl = document.getElementById(`node-${toId}`);

    if (!fromEl || !toEl) continue;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const parentRect = svgConnectorsEl.getBoundingClientRect();

    // Calculate source coordinate points relative to parent canvas overlay
    const fromX = fromRect.left + fromRect.width / 2 - parentRect.left;
    const fromY = fromRect.bottom - parentRect.top;

    const toX = toRect.left + toRect.width / 2 - parentRect.left;
    const toY = toRect.top - parentRect.top;

    // Check status to determine color
    const fromStatus = activeRoadmapState[fromId]?.status || "todo";
    const toStatus = activeRoadmapState[toId]?.status || "todo";

    let lineColor = "rgba(255, 255, 255, 0.05)"; // default todo line
    let isDashed = true;

    if (fromStatus === "done") {
      if (toStatus === "doing" || toStatus === "done") {
        lineColor = "#10b981"; // completed path
        isDashed = false;
      } else {
        lineColor = "#06b6d4"; // dynamic path
      }
    } else if (fromStatus === "doing") {
      lineColor = "rgba(6, 182, 212, 0.35)";
    }

    // Draw a Bezier curve for staggering effect
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const controlY = fromY + (toY - fromY) / 2;
    
    // Command string: move to start, draw cubic curve
    const dStr = `M ${fromX} ${fromY} C ${fromX} ${controlY}, ${toX} ${controlY}, ${toX} ${toY}`;
    
    path.setAttribute("d", dStr);
    path.setAttribute("stroke", lineColor);
    path.setAttribute("stroke-width", "3");
    path.setAttribute("fill", "none");
    if (isDashed) {
      path.setAttribute("stroke-dasharray", "6 4");
    }

    svgConnectorsEl.appendChild(path);
  }
}

// 9. Node side drawer details panels
function showNodeDrawer(modData, stateObj, weekText, index) {
  activeSelectedNode = modData;

  drawerNodeIndexEl.textContent = `Node ${index} &bull; ${weekText}`;
  drawerNodeNameEl.textContent = modData.name;
  selectNodeStatusEl.value = stateObj.status;
  drawerNodeDescEl.textContent = modData.desc;
  
  // Set checklist items
  drawerChecklistEl.innerHTML = "";
  modData.tasks.forEach((t, tIndex) => {
    const isChecked = !!stateObj.checklist?.[tIndex];
    const li = document.createElement("li");
    li.className = `chk-item ${isChecked ? 'checked' : ''}`;
    li.setAttribute("role", "checkbox");
    li.setAttribute("aria-checked", isChecked);
    li.tabIndex = 0;

    li.innerHTML = `
      <div class="chk-icon"><i class="fa-solid fa-check"></i></div>
      <span class="chk-text">${t}</span>
    `;

    const checkToggle = () => {
      if (!stateObj.checklist) stateObj.checklist = {};
      stateObj.checklist[tIndex] = !isChecked;
      saveRoadmapState();
      
      // Refresh checklist UI
      showNodeDrawer(modData, stateObj, weekText, index);
      
      // Update stats
      calculateAnalytics();
    };

    li.addEventListener("click", checkToggle);
    li.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        checkToggle();
      }
    });

    drawerChecklistEl.appendChild(li);
  });

  // Set notes content
  drawerNotepadEl.value = stateObj.notes || "";
  notepadSaveIndicatorEl.classList.remove("visible");

  // Reference links
  drawerResourceContainerEl.innerHTML = `
    <a href="${modData.resource.url}" target="_blank" rel="noopener noreferrer" class="resource-box">
      <span><i class="fa-solid fa-graduation-cap"></i> Reference Guide: ${modData.resource.name}</span>
      <i class="fa-solid fa-up-right-from-square"></i>
    </a>
  `;

  // Display drawer panel
  drawerPanelEl.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function hideDrawer() {
  drawerPanelEl.classList.add("hidden");
  document.body.style.overflow = "";
  
  // Clear focus state variables
  activeSelectedNode = null;
  
  // Redraw path lines in case statuses modified
  drawConnectorLines();
}

function handleNodeStatusChange() {
  if (!activeSelectedNode) return;
  
  const status = selectNodeStatusEl.value;
  activeRoadmapState[activeSelectedNode.id].status = status;
  saveRoadmapState();

  // Update box class color
  const nodeBox = document.getElementById(`node-${activeSelectedNode.id}`);
  if (nodeBox) {
    nodeBox.className = `roadmap-node-box ${status}`;
  }

  calculateAnalytics();
}

// 10. Study logs and notepad typing
function handleLogHoursInput() {
  if (!activeSelectedNode) return;

  const val = parseInt(numLogHoursEl.value);
  if (isNaN(val) || val <= 0) {
    alert("Please enter a valid hour count.");
    return;
  }

  // Record Telemetry
  telemetryStats.totalHours += val;

  // Streak logic updates
  const todayStr = new Date().toDateString();
  if (telemetryStats.lastUpdateDate !== todayStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (telemetryStats.lastUpdateDate === yesterday.toDateString()) {
      telemetryStats.streakCount++;
    } else {
      telemetryStats.streakCount = 1;
    }
    
    telemetryStats.lastUpdateDate = todayStr;
  }

  saveTelemetry();
  updateTelemetryUI();

  // Reset log inputs
  numLogHoursEl.value = "2";
  alert(`Added ${val} hours of study logs! Keep up the momentum.`);
}

function handleNotepadTyping() {
  if (!activeSelectedNode) return;

  const notesText = drawerNotepadEl.value;
  activeRoadmapState[activeSelectedNode.id].notes = notesText;
  
  // Trigger debounce saving indicators
  notepadSaveIndicatorEl.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...`;
  notepadSaveIndicatorEl.classList.add("visible");

  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  
  saveDebounceTimer = setTimeout(() => {
    saveRoadmapState();
    notepadSaveIndicatorEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Saved`;
    setTimeout(() => {
      notepadSaveIndicatorEl.classList.remove("visible");
    }, 1500);
  }, 600);
}

// 11. Recalculate completion statistics
function calculateAnalytics() {
  if (!currentActiveTopic) return;

  const db = CURRICULUM_DATABASE[currentActiveTopic];
  if (!db) return;

  // Evaluation formula:
  // Node Status weight: Completed = 15 points, In Progress = 5 points.
  // Checklists item checked weight: total checks / total checklist count * 40 points
  let scoreSum = 0;
  let totalTasks = 0;
  let checkedTasks = 0;
  let firstDoingNodeName = "";

  db.modules.forEach(m => {
    const state = activeRoadmapState[m.id] || { status: 'todo', checklist: {} };
    
    if (state.status === "done") {
      scoreSum += 15;
    } else if (state.status === "doing") {
      scoreSum += 5;
      if (!firstDoingNodeName) firstDoingNodeName = m.name;
    } else {
      if (!firstDoingNodeName) firstDoingNodeName = m.name; // first un-finished focus
    }

    // Checklist item ratios
    m.tasks.forEach((t, tIndex) => {
      totalTasks++;
      if (state.checklist?.[tIndex]) {
        checkedTasks++;
      }
    });
  });

  const nodeCount = db.modules.length;
  // Node max status points = nodeCount * 15 => 4 * 15 = 60
  // Checklist points max = 40
  const checklistRatio = totalTasks > 0 ? (checkedTasks / totalTasks) : 0;
  const checklistPoints = checklistRatio * 40;

  const totalStatusPointsMax = nodeCount * 15;
  const statusPoints = (scoreSum / totalStatusPointsMax) * 60;

  const finalCompletion = Math.min(Math.round(statusPoints + checklistPoints), 100);

  // Update Telemetry gauge UI
  animateProgressGauge(finalCompletion);

  // Update Focus text labels
  if (firstDoingNodeName) {
    valActiveNodeEl.textContent = firstDoingNodeName;
  } else {
    valActiveNodeEl.textContent = "Goal pathway completed! Great job.";
  }
}

function animateProgressGauge(target) {
  let val = 0;
  const maxOffset = 276; // 2 * pi * r; r = 44 => ~276
  
  if (window.gaugeAnimationInterval) clearInterval(window.gaugeAnimationInterval);

  window.gaugeAnimationInterval = setInterval(() => {
    if (val < target) val++;
    else if (val > target) val--;
    else clearInterval(window.gaugeAnimationInterval);

    valCompletionEl.textContent = `${val}%`;
    const offset = maxOffset - (maxOffset * val) / 100;
    progressIndicatorEl.style.strokeDashoffset = offset;

    // Set colors
    if (val >= 80) progressIndicatorEl.style.stroke = "var(--clr-accent)";
    else if (val >= 40) progressIndicatorEl.style.stroke = "var(--clr-cyan)";
    else progressIndicatorEl.style.stroke = "var(--clr-warning)";
  }, 10);
}

function updateTelemetryUI() {
  valTotalHoursEl.textContent = `${telemetryStats.totalHours} hrs`;
  valStreakEl.innerHTML = `<i class="fa-solid fa-fire"></i> ${telemetryStats.streakCount} days`;
}
