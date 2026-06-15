// State Variables
let currentProtocol = "2pl";
let scheduleText = "T1:R(A), T2:R(B), T1:W(B), T2:W(A)"; // Preset default
let parsedSchedule = [];
let activeStepIndex = -1;
let autoPlayTimer = null;

// Database Resources
const resources = ["A", "B", "C"];

// Transactions state registry
let transactions = {}; // txName -> Tx State
let nextTxTimestamp = 100; // Counter for birth TS(T)

// Protocol states:
// 2PL Locks
let locks = {}; // resource -> { type: 'S'|'X', heldBy: [], waiting: [] }
// TO timestamps
let resourceTimestamps = {
  A: { read: 0, write: 0 },
  B: { read: 0, write: 0 },
  C: { read: 0, write: 0 }
};
// OCC Workspace states
let occActive = {}; // txName -> OCC details

// Performance Metrics
let abortedTxCount = 0;
let deadlockCount = 0;

// Presets Schedules
const schedulePresets = {
  deadlock: "T1:R(A), T2:R(B), T1:W(B), T2:W(A)",
  to_abort: "T1:R(A), T2:W(A), T2:C, T1:W(A)", // T1 starts first (older), T2 writes & commits, T1 then tries to write (conflict)
  occ_conflict: "T1:R(A), T2:R(A), T2:W(A), T2:C, T1:W(A), T1:C" // T1 read A, T2 writes A & commits, T1 validates overlapping write -> aborts
};

// DOM elements
const protocolSelect = document.getElementById("protocol-select");
const scheduleInput = document.getElementById("schedule-input");
const btnPresetDeadlock = document.getElementById("btn-preset-deadlock");
const btnPresetTOAbort = document.getElementById("btn-preset-to-abort");
const btnPresetOCC = document.getElementById("btn-preset-occ");
const btnRun = document.getElementById("btn-run");
const btnStep = document.getElementById("btn-step");
const btnReset = document.getElementById("btn-reset");

const view2PL = document.getElementById("view-2pl");
const viewTO = document.getElementById("view-to");
const viewOCC = document.getElementById("view-occ");

const locksTableContainer = document.getElementById("locks-table-container");
const resourceTSContainer = document.getElementById("resource-ts-container");
const txTSContainer = document.getElementById("tx-ts-container");
const occPhasesContainer = document.getElementById("occ-phases-container");
const waitForGraph = document.getElementById("wait-for-graph");

const timelineStepsContainer = document.getElementById("timeline-steps-container");
const consoleLogs = document.getElementById("console-logs");
const btnClearConsole = document.getElementById("btn-clear-console");

const metricActive = document.getElementById("metric-active");
const metricBlocked = document.getElementById("metric-blocked");
const metricAborts = document.getElementById("metric-aborts");
const metricDeadlocks = document.getElementById("metric-deadlocks");

const blockedMetricCard = document.getElementById("blocked-metric-card");
const deadlockMetricCard = document.getElementById("deadlock-metric-card");

// Initialize Setup
function init() {
  const savedSchedule = localStorage.getItem("concur_visualizer_schedule");
  const savedProtocol = localStorage.getItem("concur_visualizer_protocol") || "2pl";

  protocolSelect.value = savedProtocol;
  currentProtocol = savedProtocol;
  scheduleInput.value = savedSchedule || schedulePresets.deadlock;

  // Listeners
  protocolSelect.addEventListener("change", handleProtocolChange);
  btnPresetDeadlock.addEventListener("click", () => loadPreset("deadlock"));
  btnPresetTOAbort.addEventListener("click", () => loadPreset("to_abort"));
  btnPresetOCC.addEventListener("click", () => loadPreset("occ_conflict"));
  btnRun.addEventListener("click", handlePlaySchedule);
  btnStep.addEventListener("click", handleStepSchedule);
  btnReset.addEventListener("click", handleResetScheduler);
  btnClearConsole.addEventListener("click", () => consoleLogs.innerHTML = "");

  resetSimulation();
  addConsoleLog("SYSTEM", "Scheduler playground initialized.", "system");
}

// Switching protocol boards
function handleProtocolChange(e) {
  currentProtocol = e.target.value;
  localStorage.setItem("concur_visualizer_protocol", currentProtocol);
  resetSimulation();
  
  // Toggle Board tabs view
  document.querySelectorAll(".board-view").forEach(el => el.classList.remove("active"));
  document.getElementById(`view-${currentProtocol}`).classList.add("active");
  addConsoleLog("SYSTEM", `Active protocol scheduler swapped to: ${currentProtocol.toUpperCase()}`, "system");
}

function loadPreset(presetKey) {
  scheduleInput.value = schedulePresets[presetKey];
  localStorage.setItem("concur_visualizer_schedule", scheduleInput.value);
  resetSimulation();
  addConsoleLog("SYSTEM", `Preloaded preset schedule: ${presetKey.toUpperCase()}`, "system");
}

// Reset scheduler variables
function handleResetScheduler() {
  resetSimulation();
  abortedTxCount = 0;
  deadlockCount = 0;
  metricAborts.textContent = "0";
  metricDeadlocks.textContent = "0";
  addConsoleLog("SYSTEM", "Simulation resets complete.", "error");
}

function resetSimulation() {
  if (autoPlayTimer) clearInterval(autoPlayTimer);
  activeStepIndex = -1;
  transactions = {};
  nextTxTimestamp = 100;
  locks = {};
  resourceTimestamps = {
    A: { read: 0, write: 0 },
    B: { read: 0, write: 0 },
    C: { read: 0, write: 0 }
  };
  occActive = {};
  
  parseScheduleInput();
  renderTimeline();
  updateUI();
}

// SQL query schedule input parser
function parseScheduleInput() {
  const text = scheduleInput.value.trim();
  parsedSchedule = [];
  
  if (!text) return;

  const steps = text.split(",").map(s => s.trim());
  steps.forEach((step, idx) => {
    // Expected Format: TxName:Op(Resource)  e.g., T1:R(A) or T2:C
    const match = step.match(/^(\w+)\s*:\s*(\w)(?:\s*\(\s*(\w)\s*\))?$/i);
    if (match) {
      parsedSchedule.push({
        id: idx,
        tx: match[1],
        op: match[2].toUpperCase(),
        res: match[3] || null,
        status: "pending",
        text: step
      });
    }
  });
  localStorage.setItem("concur_visualizer_schedule", text);
}

// Log diagnostic message helper
function addConsoleLog(source, message, type = "system") {
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-source">[${source}]</span> ${message}`;
  consoleLogs.appendChild(entry);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

// Render Timeline columns blocks on the right panel
function renderTimeline() {
  timelineStepsContainer.innerHTML = "";
  if (parsedSchedule.length === 0) {
    timelineStepsContainer.innerHTML = `<div class="placeholder-text">Input operations and step to display steps timeline.</div>`;
    return;
  }

  parsedSchedule.forEach((step, idx) => {
    const card = document.createElement("div");
    card.className = `timeline-step-card ${step.status}`;
    card.id = `timeline-step-item-${idx}`;

    let label = "PENDING";
    if (step.status === "active") label = "ACTIVE";
    else if (step.status === "completed") label = "OK";
    else if (step.status === "blocked") label = "BLOCKED";
    else if (step.status === "aborted") label = "ABORTED";

    card.innerHTML = `
      <span><strong>Step ${idx + 1}:</strong> ${step.tx} performs ${step.op}${step.res ? `(${step.res})` : ''}</span>
      <span class="step-status-tag font-mono">${label}</span>
    `;
    timelineStepsContainer.appendChild(card);
  });
}

// Play scheduler timeline automatically
function handlePlaySchedule() {
  if (activeStepIndex >= parsedSchedule.length - 1) {
    resetSimulation();
  }
  
  if (autoPlayTimer) clearInterval(autoPlayTimer);

  autoPlayTimer = setInterval(() => {
    if (activeStepIndex >= parsedSchedule.length - 1) {
      clearInterval(autoPlayTimer);
      addConsoleLog("SYSTEM", "Schedule timeline completed successfully.", "system");
      return;
    }
    handleStepSchedule();
  }, 1000);
}

// Step scheduling actions
function handleStepSchedule() {
  if (parsedSchedule.length === 0) {
    alert("Please input a valid schedule timeline list first.");
    return;
  }

  if (activeStepIndex >= parsedSchedule.length - 1) {
    addConsoleLog("SYSTEM", "Schedule completed.", "error");
    return;
  }

  activeStepIndex++;
  const step = parsedSchedule[activeStepIndex];
  
  // Set active step card visual
  step.status = "active";
  renderTimeline();
  const activeCard = document.getElementById(`timeline-step-item-${activeStepIndex}`);
  if (activeCard) activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Guarantee Transaction is initialized
  ensureTxExists(step.tx);

  // Execute protocol scheduled checks
  executeProtocolStep(step);
}

// Ensure Transaction struct in active registry
function ensureTxExists(txName) {
  if (!transactions[txName]) {
    transactions[txName] = {
      name: txName,
      ts: nextTxTimestamp,
      status: "active",
      growingPhase: true,
      readSet: [],
      writeSet: [],
      localWorkspace: {}
    };
    addConsoleLog("SCHEDULER", `Transaction ${txName} started. Assigned Timestamp TS(T) = ${nextTxTimestamp}`, "timestamp");
    nextTxTimestamp += 10;
  }
}

// Core Execution Routing
function executeProtocolStep(step) {
  const tx = transactions[step.tx];
  
  // If transaction is already aborted/rolled back, skip its step
  if (tx.status === "aborted") {
    step.status = "aborted";
    addConsoleLog("SCHEDULER", `Step ignored: ${step.tx} is already aborted/rolled back.`, "error");
    renderTimeline();
    updateUI();
    return;
  }

  // Route protocol scheduler logic
  if (currentProtocol === "2pl") {
    execute2PLStep(step);
  } else if (currentProtocol === "to") {
    executeTOStep(step);
  } else if (currentProtocol === "occ") {
    executeOCCStep(step);
  }

  updateUI();
}

// Two-Phase Locking (2PL) Protocol scheduler logic
function execute2PLStep(step) {
  const txName = step.tx;
  const tx = transactions[txName];

  if (step.op === "R" || step.op === "W") {
    const lockType = step.op === "R" ? "S" : "X";
    const canAcquire = request2PLLock(txName, step.res, lockType);

    if (canAcquire) {
      step.status = "completed";
      addConsoleLog(txName, `Executed Read/Write operation on ${step.res}.`, "system");
    } else {
      // Tx is blocked, change state to blocked
      step.status = "blocked";
      tx.status = "blocked";
      addConsoleLog("LOCK MANAGER", `${txName} blocked waiting for lock on ${step.res}. Checking for deadlocks...`, "lock");
      
      // Perform Wait-For Deadlock Graph check
      detectAndResolveDeadlocks(txName);
    }
  } else if (step.op === "C") {
    // Releases all locks in shrinking phase
    releaseAll2PLLocks(txName);
    tx.status = "committed";
    step.status = "completed";
    addConsoleLog(txName, "Transaction committed. Releasing all locks (Shrinking phase).", "system");

    // Process blocked transactions in queue
    processWaitingLocks();
  }
}

// Request lock in 2PL
function request2PLLock(txName, resource, lockType) {
  const tx = transactions[txName];

  // 2PL restriction: cannot acquire new locks in shrinking phase
  if (!tx.growingPhase) {
    addConsoleLog("SCHEDULER", `2PL Violation: ${txName} cannot acquire new lock during Shrinking phase! Aborting.`, "error");
    abortTransaction2PL(txName);
    return false;
  }

  if (!locks[resource]) {
    locks[resource] = { type: lockType, heldBy: [txName], waiting: [] };
    addConsoleLog("LOCK MANAGER", `Granted ${lockType}-Lock on ${resource} to ${txName}.`, "lock");
    return true;
  }

  const lock = locks[resource];

  // If lock is held by requesting transaction
  if (lock.heldBy.includes(txName)) {
    if (lockType === "X" && lock.type === "S") {
      // Upgrade S -> X
      if (lock.heldBy.length === 1) {
        lock.type = "X";
        addConsoleLog("LOCK MANAGER", `Upgraded lock on ${resource} to Exclusive (X) for ${txName}.`, "lock");
        return true;
      } else {
        // Shared lock held by multiple, block upgrade
        if (!lock.waiting.includes(txName)) lock.waiting.push(txName);
        return false;
      }
    }
    return true;
  }

  // Conflicts
  if (lock.type === "X" || lockType === "X") {
    if (!lock.waiting.includes(txName)) lock.waiting.push(txName);
    return false;
  }

  // Shared S lock shareable
  lock.heldBy.push(txName);
  addConsoleLog("LOCK MANAGER", `Shared S-Lock on ${resource} shared with ${txName}.`, "lock");
  return true;
}

// Release locks in 2PL
function releaseAll2PLLocks(txName) {
  const tx = transactions[txName];
  tx.growingPhase = false; // Shrinking phase starts
  
  for (let res in locks) {
    const lock = locks[res];
    lock.heldBy = lock.heldBy.filter(name => name !== txName);
    lock.waiting = lock.waiting.filter(name => name !== txName);
    
    if (lock.heldBy.length === 0) {
      if (lock.waiting.length === 0) {
        delete locks[res];
      } else {
        // Handover to waiting
        const nextTxName = lock.waiting.shift();
        lock.heldBy = [nextTxName];
        addConsoleLog("LOCK MANAGER", `Reassigned lock on ${res} to waiting ${nextTxName}.`, "lock");
      }
    }
  }
}

// Rollback / abort transaction in 2PL
function abortTransaction2PL(txName) {
  const tx = transactions[txName];
  if (tx.status === "aborted") return;

  tx.status = "aborted";
  abortedTxCount++;
  metricAborts.textContent = abortedTxCount;

  addConsoleLog("SCHEDULER", `Aborting/rolling back transaction ${txName}...`, "error");

  // Mark all past and future steps of this transaction as aborted in timeline
  parsedSchedule.forEach(s => {
    if (s.tx === txName) {
      s.status = "aborted";
    }
  });

  // Release locks
  releaseAll2PLLocks(txName);
  processWaitingLocks();
  renderTimeline();
}

// Process blocked locks queue
function processWaitingLocks() {
  let resumed = false;
  for (let res in locks) {
    const lock = locks[res];
    if (lock.heldBy.length === 0 && lock.waiting.length > 0) {
      const nextTxName = lock.waiting.shift();
      const tx = transactions[nextTxName];
      if (tx && tx.status === "blocked") {
        tx.status = "active";
        lock.heldBy = [nextTxName];
        addConsoleLog("LOCK MANAGER", `Unblocked ${nextTxName}. Lock on ${res} granted.`, "lock");
        resumed = true;
      }
    }
  }

  // Scan remaining blocked tx to see if conflict cleared
  Object.keys(transactions).forEach(name => {
    const tx = transactions[name];
    if (tx.status === "blocked") {
      // Find what step blocked it
      const blockedStep = parsedSchedule.find(s => s.tx === name && s.status === "blocked");
      if (blockedStep) {
        const lockType = blockedStep.op === "R" ? "S" : "X";
        const canGrant = request2PLLock(name, blockedStep.res, lockType);
        if (canGrant) {
          tx.status = "active";
          blockedStep.status = "completed";
          addConsoleLog("LOCK MANAGER", `Conflict cleared. Unblocked and completed step for ${name}.`, "lock");
          resumed = true;
        }
      }
    }
  });

  if (resumed) {
    renderTimeline();
  }
}

// DFS cycle detection wait-for graph builder
function detectAndResolveDeadlocks(txName) {
  // 1. Build adjacency list of wait relationships
  // T_wait -> T_held
  const adj = {};
  
  // Initialize nodes
  Object.keys(transactions).forEach(name => {
    if (transactions[name].status !== "aborted") {
      adj[name] = [];
    }
  });

  // Populate edges based on lock queues
  for (let res in locks) {
    const lock = locks[res];
    const holders = lock.heldBy;
    const waiters = lock.waiting;
    
    waiters.forEach(w => {
      holders.forEach(h => {
        if (adj[w] && !adj[w].includes(h) && w !== h) {
          adj[w].push(h);
        }
      });
    });
  }

  // 2. Run DFS cycle detection
  const visited = {};
  const recStack = {};
  let cycle = null;

  function dfs(node, path) {
    visited[node] = true;
    recStack[node] = true;
    path.push(node);

    const neighbors = adj[node] || [];
    for (let neighbor of neighbors) {
      if (!visited[neighbor]) {
        if (dfs(neighbor, path)) return true;
      } else if (recStack[neighbor]) {
        // Cycle detected!
        const cycleStartIndex = path.indexOf(neighbor);
        cycle = path.slice(cycleStartIndex);
        return true;
      }
    }

    path.pop();
    recStack[node] = false;
    return false;
  }

  for (let node in adj) {
    if (!visited[node]) {
      const path = [];
      if (dfs(node, path)) break;
    }
  }

  // Redraw Graph immediately with cycle highlights
  renderWaitForGraphSVG(adj, cycle);

  if (cycle) {
    deadlockCount++;
    metricDeadlocks.textContent = deadlockCount;
    deadlockMetricCard.style.borderColor = "var(--color-danger)";
    deadlockMetricCard.style.boxShadow = "var(--shadow-glow-danger)";

    addConsoleLog("DEADLOCK MANAGER", `DEADLOCK DETECTED! Dependency loop: ${cycle.join(" &rarr; ")} &rarr; ${cycle[0]}`, "error");
    
    // Choose victim: standard rule selects the youngest transaction (highest timestamp)
    let victim = cycle[0];
    cycle.forEach(tx => {
      if (transactions[tx].ts > transactions[victim].ts) {
        victim = tx;
      }
    });

    addConsoleLog("DEADLOCK RESOLUTION", `Selecting younger transaction ${victim} as victim. Rolling back.`, "error");
    
    // Rollback victim
    abortTransaction2PL(victim);
    
    // Redraw graph after resolve
    setTimeout(() => {
      deadlockMetricCard.style.borderColor = "var(--border-glass)";
      deadlockMetricCard.style.boxShadow = "none";
      detectAndResolveDeadlocks(txName); // Recalculate
    }, 1500);
  }
}

// Timestamp Ordering (TO) Protocol logic
function executeTOStep(step) {
  const txName = step.tx;
  const tx = transactions[txName];
  const ts = tx.ts;

  if (step.op === "R") {
    // Read(X) rules
    const tsWrite = resourceTimestamps[step.res].write;
    
    if (ts < tsWrite) {
      // Transaction TS is older than last write. Older TS trying to read newer written value -> rollback/abort older
      addConsoleLog("TIMESTAMP ORDERING", `TO Conflict: TS(${txName}) = ${ts} is older than W-ts(${step.res}) = ${tsWrite}. Read rejected.`, "error");
      abortTransactionTO(txName);
      step.status = "aborted";
    } else {
      // Success
      resourceTimestamps[step.res].read = Math.max(resourceTimestamps[step.res].read, ts);
      step.status = "completed";
      addConsoleLog(txName, `READ ${step.res} successfully. Updated R-ts(${step.res}) = ${resourceTimestamps[step.res].read}`, "system");
    }
  } else if (step.op === "W") {
    // Write(X) rules
    const tsRead = resourceTimestamps[step.res].read;
    const tsWrite = resourceTimestamps[step.res].write;

    if (ts < tsRead) {
      // Transaction TS is older than last read. Younger transaction has already read older value. Write rejected -> rollback
      addConsoleLog("TIMESTAMP ORDERING", `TO Conflict: TS(${txName}) = ${ts} is older than R-ts(${step.res}) = ${tsRead}. Write rejected.`, "error");
      abortTransactionTO(txName);
      step.status = "aborted";
    } else if (ts < tsWrite) {
      // Transaction TS is older than last write. Younger transaction has already overwritten value -> rollback
      addConsoleLog("TIMESTAMP ORDERING", `TO Conflict: TS(${txName}) = ${ts} is older than W-ts(${step.res}) = ${tsWrite}. Write rejected.`, "error");
      abortTransactionTO(txName);
      step.status = "aborted";
    } else {
      // Success
      resourceTimestamps[step.res].write = ts;
      step.status = "completed";
      addConsoleLog(txName, `WRITE ${step.res} successfully. Updated W-ts(${step.res}) = ${ts}`, "system");
    }
  } else if (step.op === "C") {
    tx.status = "committed";
    step.status = "completed";
    addConsoleLog(txName, "Transaction committed successfully.", "system");
  }
}

function abortTransactionTO(txName) {
  const tx = transactions[txName];
  if (tx.status === "aborted") return;

  tx.status = "aborted";
  abortedTxCount++;
  metricAborts.textContent = abortedTxCount;

  addConsoleLog("SCHEDULER", `TO Scheduler rolling back older transaction ${txName}...`, "error");
  
  parsedSchedule.forEach(s => {
    if (s.tx === txName) s.status = "aborted";
  });
  renderTimeline();
}

// Optimistic Concurrency Control (OCC) logic
function executeOCCStep(step) {
  const txName = step.tx;
  const tx = transactions[txName];

  if (step.op === "R" || step.op === "W") {
    // OCC Read Phase: Reads & Writes occur in local workspace
    if (step.op === "R") {
      if (!tx.readSet.includes(step.res)) tx.readSet.push(step.res);
      addConsoleLog(txName, `OCC Read Phase: Read ${step.res} into private workspace.`, "system");
    } else {
      if (!tx.writeSet.includes(step.res)) tx.writeSet.push(step.res);
      tx.localWorkspace[step.res] = true;
      addConsoleLog(txName, `OCC Read Phase: Wrote local ${step.res} updates.`, "system");
    }
    step.status = "completed";
  } else if (step.op === "C") {
    // OCC Validation & Write Phase
    tx.status = "validate";
    addConsoleLog(txName, "OCC Validation Phase: Checking overlap conflicts...", "validate");

    const validated = validateOCC(txName);
    
    if (validated) {
      tx.status = "committed";
      step.status = "completed";
      addConsoleLog(txName, `Validation successful! Flashing changes to database (OCC Write Phase).`, "system");
    } else {
      // Conflict -> abort
      tx.status = "aborted";
      step.status = "aborted";
      abortedTxCount++;
      metricAborts.textContent = abortedTxCount;
      addConsoleLog(txName, `Validation FAILED: overlap conflict detected! Aborting/rolling back.`, "error");
      
      parsedSchedule.forEach(s => {
        if (s.tx === txName) s.status = "aborted";
      });
      renderTimeline();
    }
  }
}

// OCC Validation Phase logic
function validateOCC(txName) {
  const tx = transactions[txName];
  let isValid = true;

  // Validation rule: compare tx's readSet with writeSet of all concurrent committed transactions
  // that committed after tx started.
  // We simulate this by checking if any other committed transaction has writeSets overlapping
  // with txName's readSets, if they overlap we flag conflict
  Object.keys(transactions).forEach(otherName => {
    if (otherName !== txName) {
      const other = transactions[otherName];
      if (other.status === "committed") {
        // Check intersection of tx.readSet and other.writeSet
        const overlap = tx.readSet.filter(x => other.writeSet.includes(x));
        if (overlap.length > 0) {
          addConsoleLog("OCC VALIDATOR", `Conflict: ${txName} read [${overlap.join(", ")}] which was modified by committed ${otherName}.`, "error");
          isValid = false;
        }
      }
    }
  });

  return isValid;
}

// Draw Wait-For Graph using dynamic coordinates in SVG canvas
function renderWaitForGraphSVG(adj, cycle = null) {
  waitForGraph.innerHTML = "";
  
  const nodes = Object.keys(adj);
  const N = nodes.length;
  if (N === 0) return;

  const nodeCoords = {};
  const r = 18; // radius of node circle

  // Circular layout coordinates calculation
  nodes.forEach((node, idx) => {
    const theta = (idx * 2 * Math.PI) / N;
    // Box dimensions 300 x 240
    const cx = 150 + 75 * Math.cos(theta);
    const cy = 120 + 65 * Math.sin(theta);
    nodeCoords[node] = { cx, cy };
  });

  // 1. Draw wait edges
  for (let u in adj) {
    const neighbors = adj[u];
    neighbors.forEach(v => {
      if (nodeCoords[u] && nodeCoords[v]) {
        const x1 = nodeCoords[u].cx;
        const y1 = nodeCoords[u].cy;
        const x2 = nodeCoords[v].cx;
        const y2 = nodeCoords[v].cy;

        // Draw path offset to align with arrow markers
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        
        // Check if edge belongs to deadlock loop
        let isDeadlockEdge = false;
        if (cycle) {
          const uIdx = cycle.indexOf(u);
          const vIdx = cycle.indexOf(v);
          if (uIdx !== -1 && vIdx !== -1 && (vIdx === uIdx + 1 || (uIdx === cycle.length - 1 && vIdx === 0))) {
            isDeadlockEdge = true;
          }
        }

        path.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
        path.setAttribute("class", `edge-path ${isDeadlockEdge ? 'deadlock-edge' : ''}`);
        
        waitForGraph.appendChild(path);
      }
    });
  }

  // 2. Draw nodes circles
  nodes.forEach(node => {
    const { cx, cy } = nodeCoords[node];
    const isVictim = cycle && cycle.includes(node);
    
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", r);
    circle.setAttribute("class", `node-circle ${isVictim ? 'deadlock' : ''} ${transactions[node].status === 'aborted' ? 'aborted' : ''}`);
    waitForGraph.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", cx);
    text.setAttribute("y", cy + 3);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("class", "node-text");
    text.textContent = node;
    waitForGraph.appendChild(text);
  });
}

// UI element rendering updates
function updateUI() {
  // 1. Render Active locks table
  renderLocksTable();

  // 2. Render TO Timestamp lists
  renderResourceTimestamps();
  renderTxTimestamps();

  // 3. Render OCC active workspaces
  renderOCCWorkspaces();

  // Active metrics counts
  const activeCount = Object.values(transactions).filter(t => t.status === "active").length;
  metricActive.textContent = activeCount;
  
  const blockedCount = Object.values(transactions).filter(t => t.status === "blocked").length;
  metricBlocked.textContent = blockedCount;

  if (blockedCount > 0) {
    blockedMetricCard.style.borderColor = "var(--color-warn)";
  } else {
    blockedMetricCard.style.borderColor = "var(--border-glass)";
  }
}

function renderLocksTable() {
  locksTableContainer.innerHTML = "";
  const lockKeys = Object.keys(locks);

  if (lockKeys.length === 0) {
    locksTableContainer.innerHTML = `<div class="empty-mempool-message">No active transaction locks.</div>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "db-grid-table";
  let rowsHtml = "";
  lockKeys.forEach(res => {
    const l = locks[res];
    rowsHtml += `
      <tr>
        <td><strong>${res}</strong></td>
        <td style="color: ${l.type === 'X' ? 'var(--color-danger)' : 'var(--color-primary)'}; font-weight:700;">
          ${l.type}-Lock
        </td>
        <td>${l.heldBy.join(", ")}</td>
        <td>${l.waiting.join(", ") || "-"}</td>
      </tr>
    `;
  });

  table.innerHTML = `
    <tr>
      <th>Resource</th>
      <th>Lock Type</th>
      <th>Held By</th>
      <th>Waiting Queue</th>
    </tr>
    ${rowsHtml}
  `;
  locksTableContainer.appendChild(table);
}

function renderResourceTimestamps() {
  resourceTSContainer.innerHTML = "";
  const table = document.createElement("table");
  table.className = "db-grid-table";

  let rowsHtml = "";
  resources.forEach(res => {
    const ts = resourceTimestamps[res];
    rowsHtml += `
      <tr>
        <td><strong>${res}</strong></td>
        <td>${ts.read}</td>
        <td>${ts.write}</td>
      </tr>
    `;
  });

  table.innerHTML = `
    <tr>
      <th>Resource</th>
      <th>Read TS (R-ts)</th>
      <th>Write TS (W-ts)</th>
    </tr>
    ${rowsHtml}
  `;
  resourceTSContainer.appendChild(table);
}

function renderTxTimestamps() {
  txTSContainer.innerHTML = "";
  const names = Object.keys(transactions);
  
  if (names.length === 0) {
    txTSContainer.innerHTML = `<div class="empty-mempool-message">No active transactions.</div>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "db-grid-table";
  let rowsHtml = "";
  names.forEach(name => {
    const tx = transactions[name];
    rowsHtml += `
      <tr>
        <td><strong>${name}</strong></td>
        <td>${tx.ts}</td>
        <td style="text-transform:uppercase; font-weight:bold;">${tx.status}</td>
      </tr>
    `;
  });

  table.innerHTML = `
    <tr>
      <th>Transaction</th>
      <th>Start TS(T)</th>
      <th>Status</th>
    </tr>
    ${rowsHtml}
  `;
  txTSContainer.appendChild(table);
}

function renderOCCWorkspaces() {
  occPhasesContainer.innerHTML = "";
  const names = Object.keys(transactions);

  if (names.length === 0) {
    occPhasesContainer.innerHTML = `<div class="empty-mempool-message" style="grid-column: span 3;">No active transaction phases.</div>`;
    return;
  }

  names.forEach(name => {
    const tx = transactions[name];
    const card = document.createElement("div");
    
    let phaseClass = "read";
    if (tx.status === "validate") phaseClass = "validate";
    else if (tx.status === "committed") phaseClass = "committed";
    else if (tx.status === "aborted") phaseClass = "aborted";

    card.className = `occ-tx-card ${phaseClass}`;
    
    let phaseLabel = "Read Phase";
    if (tx.status === "validate") phaseLabel = "Validate Phase";
    else if (tx.status === "committed") phaseLabel = "Committed";
    else if (tx.status === "aborted") phaseLabel = "Aborted";

    card.innerHTML = `
      <div class="occ-tx-header">
        <span class="occ-tx-name">${name}</span>
        <span class="occ-phase-badge">${phaseLabel}</span>
      </div>
      <div class="occ-set-box">
        <span class="occ-set-title">Read Set (RS):</span>
        <span class="occ-set-vals">[ ${tx.readSet.join(", ") || "-"} ]</span>
      </div>
      <div class="occ-set-box">
        <span class="occ-set-title">Write Set (WS):</span>
        <span class="occ-set-vals">[ ${tx.writeSet.join(", ") || "-"} ]</span>
      </div>
      <div class="occ-set-box">
        <span class="occ-set-title">Local Cache Workspace:</span>
        <span class="occ-set-vals">${JSON.stringify(tx.localWorkspace)}</span>
      </div>
    `;
    occPhasesContainer.appendChild(card);
  });
}

window.addEventListener("DOMContentLoaded", init);
