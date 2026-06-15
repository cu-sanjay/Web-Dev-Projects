// Non-volatile disk vs volatile RAM states
const initialDisk = {
  Alice: 1000,
  Bob: 500
};

let diskData = { ...initialDisk };
let ramData = { ...initialDisk };

// Engine state indicators
let activeTransactions = {}; // txName (e.g. "Tx A") -> Transaction Object
let activeLocks = {}; // resource (e.g. "Alice") -> Lock Object: { type: 'S'/'X', heldBy: [], waiting: [] }
let walLogs = []; // Array of WAL logs: { tx: string, record: string, type: 'start'|'commit'|'abort'|'write' }
let isCrashed = false;
let currentIsolation = "read_committed";

// Presets for concurrency anomalies
const anomalyScenarios = {
  dirty_read: {
    name: "Dirty Read Demo",
    desc: "Tx A writes a value without committing. Tx B reads the uncommitted value. Tx A then aborts, leaving Tx B with a 'dirty' read.",
    steps: [
      { text: "1. Start Tx A & Tx B (Isolation: Read Uncommitted)", action: () => setupDirtyReadScenario() },
      { text: "2. Tx A: Subtract $200 from Alice's balance", action: () => executeTxWrite("Tx A", "Alice", 200, "subtract") },
      { text: "3. Tx B: Read Alice's balance (Shows $800 - Dirty Read!)", action: () => executeTxRead("Tx B", "Alice") },
      { text: "4. Tx A: Abort transaction (Rolls back changes)", action: () => executeTxAbort("Tx A") },
      { text: "5. Tx B: Read Alice's balance again (Shows $1000 - Inconsistent!)", action: () => executeTxRead("Tx B", "Alice") }
    ]
  },
  lost_update: {
    name: "Lost Update Demo",
    desc: "Tx A and Tx B both read Alice's balance. Tx A subtracts $100, Tx B adds $50. Since they read concurrently, Tx A's update is overwritten (lost).",
    steps: [
      { text: "1. Start Tx A & Tx B (Isolation: Read Committed)", action: () => setupLostUpdateScenario() },
      { text: "2. Tx A: Read Alice's balance (Reads $1000)", action: () => executeTxRead("Tx A", "Alice") },
      { text: "3. Tx B: Read Alice's balance (Reads $1000)", action: () => executeTxRead("Tx B", "Alice") },
      { text: "4. Tx A: Subtract $100 from Alice", action: () => executeTxWrite("Tx A", "Alice", 100, "subtract") },
      { text: "5. Tx B: Add $50 to Alice", action: () => executeTxWrite("Tx B", "Alice", 50, "add") },
      { text: "6. Commit both Tx A and Tx B", action: () => { executeTxCommit("Tx A"); executeTxCommit("Tx B"); } }
    ]
  },
  lock_block: {
    name: "Lock Blocking Demo",
    desc: "Under Serializable mode, Tx A writes to Alice (Exclusive Lock). Tx B tries to read Alice but is blocked until Tx A commits.",
    steps: [
      { text: "1. Start Tx A & Tx B (Isolation: Serializable)", action: () => setupLockBlockingScenario() },
      { text: "2. Tx A: Subtract $100 from Alice (Acquires Exclusive Lock)", action: () => executeTxWrite("Tx A", "Alice", 100, "subtract") },
      { text: "3. Tx B: Read Alice (Tx B becomes BLOCKED)", action: () => executeTxRead("Tx B", "Alice") },
      { text: "4. Tx A: Commit transaction (Releases Exclusive Lock)", action: () => executeTxCommit("Tx A") }
    ]
  }
};

let activeScenario = null;
let currentScenarioStep = -1;

// DOM Elements
const selectIsolation = document.getElementById("isolation-level-select");
const btnCrash = document.getElementById("btn-crash");
const btnRecover = document.getElementById("btn-recover");
const btnStartTxA = document.getElementById("btn-start-txa");
const btnStartTxB = document.getElementById("btn-start-txb");
const controllersContainer = document.getElementById("transactions-controllers-container");
const emptyTxMessage = document.getElementById("empty-tx-message");
const ramTableContainer = document.getElementById("ram-table-container");
const diskTableContainer = document.getElementById("disk-table-container");
const locksTableContainer = document.getElementById("locks-table-container");
const walLogContainer = document.getElementById("wal-log-container");
const consoleLogs = document.getElementById("console-logs");
const btnClearConsole = document.getElementById("btn-clear-console");

const metricActive = document.getElementById("metric-active");
const metricLocks = document.getElementById("metric-locks");
const metricWal = document.getElementById("metric-wal");
const metricStatus = document.getElementById("metric-status");
const engineStatusCard = document.getElementById("engine-status-card");
const lockMetricCard = document.getElementById("lock-metric-card");

const scenarioDetailsDisplay = document.getElementById("scenario-details-display");
const scenarioName = document.getElementById("scenario-name");
const scenarioDesc = document.getElementById("scenario-desc");
const scenarioStepsList = document.getElementById("scenario-steps-list");

// Init
function init() {
  selectIsolation.addEventListener("change", (e) => {
    currentIsolation = e.target.value;
    addConsoleLog("SYSTEM", `Isolation level changed to: ${currentIsolation.toUpperCase()}`, "system");
  });

  btnCrash.addEventListener("click", handleCrash);
  btnRecover.addEventListener("click", handleRecovery);
  btnStartTxA.addEventListener("click", () => handleStartTx("Tx A"));
  btnStartTxB.addEventListener("click", () => handleStartTx("Tx B"));
  btnClearConsole.addEventListener("click", () => consoleLogs.innerHTML = "");

  // Anomaly guides setup
  document.querySelectorAll(".scenario-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      loadScenario(btn.dataset.scenario);
    });
  });

  updateUI();
  addConsoleLog("RECOVERY", "Storage Manager online. Volatile buffer active.", "system");
}

// WAL logger helper
function writeWAL(tx, record, type) {
  walLogs.push({ tx, record, type });
  metricWal.textContent = walLogs.length;
  renderWAL();
}

function renderWAL() {
  walLogContainer.innerHTML = "";
  walLogs.forEach(log => {
    const el = document.createElement("div");
    el.className = `wal-log-entry ${log.type}`;
    el.textContent = log.record;
    walLogContainer.appendChild(el);
  });
  walLogContainer.scrollTop = walLogContainer.scrollHeight;
}

// Transaction states constructor
class Transaction {
  constructor(name) {
    this.name = name;
    this.status = "active"; // active, committed, aborted, blocked
    this.history = []; // rollback logs: { resource, oldVal, newVal }
    this.repeatableReads = {}; // Cache local reads to guarantee Repeatable Read
    this.blockedOperation = null; // Stored callback operation if blocked
  }
}

// Start Transaction action
function handleStartTx(txName) {
  if (isCrashed) return;
  if (activeTransactions[txName]) {
    alert(`${txName} is already active.`);
    return;
  }

  activeTransactions[txName] = new Transaction(txName);
  writeWAL(txName, `<${txName}, START>`, "start");
  addConsoleLog("SYSTEM", `Transaction ${txName} started.`, "system");
  
  updateUI();
}

// Read Account balance
function executeTxRead(txName, resource) {
  const tx = activeTransactions[txName];
  if (!tx || tx.status !== "active") return;

  // Concurrency Isolation Lock policies
  let canRead = true;
  
  if (currentIsolation === "serializable") {
    // Requires Shared Lock (S)
    canRead = acquireLock(txName, resource, "S");
  }

  if (!canRead) {
    // Transaction is blocked, queue the read operation
    tx.status = "blocked";
    tx.blockedOperation = {
      type: "read",
      resource: resource,
      execute: () => executeTxRead(txName, resource)
    };
    addConsoleLog("LOCK MANAGER", `${txName} blocked requesting Shared Lock (S) on ${resource}.`, "lock");
    updateUI();
    return;
  }

  // Read local balance
  let val = ramData[resource];

  // Repeatable Read Cache check
  if (currentIsolation === "repeatable_read" || currentIsolation === "serializable") {
    if (tx.repeatableReads[resource] !== undefined) {
      val = tx.repeatableReads[resource];
    } else {
      tx.repeatableReads[resource] = val;
    }
  }

  // Read Committed check (reads disk if RAM is uncommitted, to avoid dirty read)
  if (currentIsolation === "read_committed") {
    // Find if another transaction has uncommitted updates on this resource
    const hasUncommittedWrite = Object.values(activeTransactions).some(t => 
      t.status === "active" && t.history.some(h => h.resource === resource)
    );
    if (hasUncommittedWrite) {
      val = diskData[resource]; // Read from Disk directly (committed value)
    }
  }

  // Flash Cell UI blue for read operation
  flashCell(resource, "ram", "flash-read");
  
  addConsoleLog(txName, `READ ${resource} balance: $${val}`, "system");
}

// Write Account balance update
function executeTxWrite(txName, resource, amount, opType) {
  const tx = activeTransactions[txName];
  if (!tx || tx.status !== "active") return;

  // Concurrency write requires Exclusive Lock (X)
  const canWrite = acquireLock(txName, resource, "X");

  if (!canWrite) {
    tx.status = "blocked";
    tx.blockedOperation = {
      type: "write",
      resource: resource,
      amount: amount,
      opType: opType,
      execute: () => executeTxWrite(txName, resource, amount, opType)
    };
    addConsoleLog("LOCK MANAGER", `${txName} blocked requesting Exclusive Lock (X) on ${resource}.`, "lock");
    updateUI();
    return;
  }

  // Modify volatile RAM buffer
  const oldVal = ramData[resource];
  const newVal = opType === "add" ? oldVal + amount : oldVal - amount;
  
  ramData[resource] = newVal;

  // Add rollback history
  tx.history.push({ resource, oldVal, newVal });

  // Log in Write-Ahead Log
  writeWAL(txName, `<${txName}, ${resource}, balance, ${oldVal}, ${newVal}>`, "write");
  
  flashCell(resource, "ram", "flash-write");

  addConsoleLog(txName, `UPDATE ${resource} balance: $${oldVal} &rarr; $${newVal}`, "system");
  updateUI();
}

// Commit Transaction details
function executeTxCommit(txName) {
  const tx = activeTransactions[txName];
  if (!tx || (tx.status !== "active" && tx.status !== "blocked")) return;

  // Persist local RAM values to Disk Storage
  tx.history.forEach(change => {
    diskData[change.resource] = ramData[change.resource];
    addConsoleLog("STORAGE", `Flushed ${change.resource} balance $${ramData[change.resource]} to DISK.`, "system");
  });

  tx.status = "committed";
  writeWAL(txName, `<${txName}, COMMIT>`, "commit");
  addConsoleLog(txName, "Transaction COMMITTED.", "system");

  // Release locks
  releaseAllLocks(txName);

  // Check queues
  processBlockedTransactions();
  updateUI();
}

// Abort / Rollback transaction
function executeTxAbort(txName) {
  const tx = activeTransactions[txName];
  if (!tx || (tx.status !== "active" && tx.status !== "blocked")) return;

  // Reverse RAM modifications in reverse order
  for (let i = tx.history.length - 1; i >= 0; i--) {
    const change = tx.history[i];
    ramData[change.resource] = change.oldVal;
    addConsoleLog("ROLLBACK", `Restored RAM ${change.resource} balance to $${change.oldVal}`, "undo");
  }

  tx.status = "aborted";
  writeWAL(txName, `<${txName}, ABORT>`, "abort");
  addConsoleLog(txName, "Transaction ABORTED (Rolled back).", "error");

  // Release locks
  releaseAllLocks(txName);

  processBlockedTransactions();
  updateUI();
}

// Crash database engine
function handleCrash() {
  if (isCrashed) return;

  isCrashed = true;
  document.body.classList.add("shaking");
  setTimeout(() => document.body.classList.remove("shaking"), 500);

  // WIPE volatile RAM
  ramData = { Alice: null, Bob: null };

  // Set metrics Status
  metricStatus.textContent = "CRASHED";
  engineStatusCard.style.borderColor = "var(--color-danger)";
  engineStatusCard.style.boxShadow = "var(--shadow-glow-danger)";

  btnCrash.classList.add("hide");
  btnRecover.classList.remove("hide");
  btnRecover.classList.remove("btn-disabled");
  btnRecover.disabled = false;

  addConsoleLog("SYSTEM", "CRASH DETECTED! Volatile RAM Buffer lost. Disk records preserved.", "error");
  updateUI();
}

// Recovery Manager Undo / Redo engine
function handleRecovery() {
  if (!isCrashed) return;

  metricStatus.textContent = "RECOVERING";
  engineStatusCard.style.borderColor = "var(--color-warn)";
  engineStatusCard.style.boxShadow = "var(--shadow-glow-warn)";
  
  btnRecover.disabled = true;

  addConsoleLog("RECOVERY", "Starting recovery protocol...", "system");

  // Read WAL logs to identify REDO-list and UNDO-list
  // REDO list: transactions with COMMIT records
  // UNDO list: active transactions with START but no COMMIT/ABORT
  const redoList = [];
  const undoList = [];
  const activeAtCrash = new Set();

  walLogs.forEach(log => {
    if (log.type === "start") {
      activeAtCrash.add(log.tx);
    } else if (log.type === "commit") {
      activeAtCrash.delete(log.tx);
      redoList.push(log.tx);
    } else if (log.type === "abort") {
      activeAtCrash.delete(log.tx);
    }
  });

  activeAtCrash.forEach(tx => undoList.push(tx));

  addConsoleLog("RECOVERY", `REDO List (Committed): [${redoList.join(", ") || "None"}]`, "redo");
  addConsoleLog("RECOVERY", `UNDO List (Uncommitted): [${undoList.join(", ") || "None"}]`, "undo");

  // Redo Phase (Replays committed changes forward to Disk)
  addConsoleLog("RECOVERY", "Phase 1: REDO committed transactions...", "system");
  let redoCount = 0;
  walLogs.forEach(log => {
    if (redoList.includes(log.tx) && log.type === "write") {
      // Parse record: T, resource, balance, oldVal, newVal
      const parts = log.record.replace(/[<>]/g, "").split(", ");
      const resource = parts[1];
      const newVal = parseInt(parts[4]);
      
      diskData[resource] = newVal;
      redoCount++;
      addConsoleLog("RECOVERY", `REDO: Set Disk balance of ${resource} to $${newVal} (Tx: ${log.tx})`, "redo");
    }
  });

  // Undo Phase (Reverts uncommitted RAM changes from Disk, if any flushed)
  addConsoleLog("RECOVERY", "Phase 2: UNDO active uncommitted transactions...", "system");
  let undoCount = 0;
  // Read backwards
  for (let i = walLogs.length - 1; i >= 0; i--) {
    const log = walLogs[i];
    if (undoList.includes(log.tx) && log.type === "write") {
      const parts = log.record.replace(/[<>]/g, "").split(", ");
      const resource = parts[1];
      const oldVal = parseInt(parts[3]);
      
      diskData[resource] = oldVal;
      undoCount++;
      addConsoleLog("RECOVERY", `UNDO: Reverted Disk balance of ${resource} to $${oldVal} (Tx: ${log.tx})`, "undo");
    }
  }

  // Synced Disk back to RAM Buffer
  ramData = { ...diskData };

  // Restore states
  isCrashed = false;
  activeTransactions = {};
  activeLocks = {};

  btnCrash.classList.remove("hide");
  btnRecover.classList.add("hide");

  metricStatus.textContent = "ONLINE";
  engineStatusCard.style.borderColor = "var(--color-accent)";
  engineStatusCard.style.boxShadow = "var(--shadow-glow-accent)";

  addConsoleLog("RECOVERY", `Recovery complete. Synced RAM. REDOs: ${redoCount}, UNDOs: ${undoCount}`, "system");
  updateUI();
}

// Lock Manager acquire locking
function acquireLock(txName, resource, lockType) {
  if (!activeLocks[resource]) {
    activeLocks[resource] = { type: lockType, heldBy: [txName], waiting: [] };
    addConsoleLog("LOCK MANAGER", `Granted ${lockType}-Lock on ${resource} to ${txName}.`, "lock");
    return true;
  }

  const lock = activeLocks[resource];

  // If already held by requesting transaction
  if (lock.heldBy.includes(txName)) {
    // If upgrade S -> X
    if (lockType === "X" && lock.type === "S") {
      if (lock.heldBy.length === 1) {
        lock.type = "X";
        addConsoleLog("LOCK MANAGER", `Upgraded lock to Exclusive (X) on ${resource} for ${txName}.`, "lock");
        return true;
      } else {
        // upgrade blocked because other transactions hold S lock
        if (!lock.waiting.includes(txName)) lock.waiting.push(txName);
        return false;
      }
    }
    return true;
  }

  // Conflicting rules
  if (lock.type === "X" || lockType === "X") {
    // Exclusive lock request or resource is exclusively locked -> queue/block
    if (!lock.waiting.includes(txName)) lock.waiting.push(txName);
    return false;
  }

  // Shared locks can share with other shared locks
  lock.heldBy.push(txName);
  addConsoleLog("LOCK MANAGER", `Shared S-Lock on ${resource} shared with ${txName}.`, "lock");
  return true;
}

// Release locks held by a transaction
function releaseAllLocks(txName) {
  for (let resource in activeLocks) {
    const lock = activeLocks[resource];
    lock.heldBy = lock.heldBy.filter(name => name !== txName);
    
    if (lock.heldBy.length === 0) {
      delete activeLocks[resource];
      addConsoleLog("LOCK MANAGER", `Released all locks on ${resource}.`, "lock");
    }
  }
}

// Run pending blocked updates in queue
function processBlockedTransactions() {
  for (let resource in activeLocks) {
    const lock = activeLocks[resource];
    if (lock.heldBy.length === 0 && lock.waiting.length > 0) {
      const nextTxName = lock.waiting.shift();
      const tx = activeTransactions[nextTxName];
      if (tx && tx.status === "blocked") {
        tx.status = "active";
        
        // Delete lock so acquireLock succeeds
        delete activeLocks[resource];
        
        addConsoleLog("LOCK MANAGER", `Resuming queued operation for ${nextTxName}.`, "lock");
        tx.blockedOperation.execute();
      }
    }
  }

  // Scan remaining blocked tx to see if they can execute
  Object.keys(activeTransactions).forEach(txName => {
    const tx = activeTransactions[txName];
    if (tx.status === "blocked" && tx.blockedOperation) {
      const targetResource = tx.blockedOperation.resource;
      const targetLockType = tx.blockedOperation.type === "read" ? "S" : "X";
      
      const canGrant = acquireLock(txName, targetResource, targetLockType);
      if (canGrant) {
        tx.status = "active";
        addConsoleLog("LOCK MANAGER", `Resuming queued operation for ${txName}.`, "lock");
        tx.blockedOperation.execute();
      }
    }
  });
}

// Cells visual flashing
function flashCell(resource, sourceTable, cssClass) {
  const cellId = `${sourceTable}-val-${resource}`;
  const cell = document.getElementById(cellId);
  if (cell) {
    cell.className = cssClass;
    setTimeout(() => {
      cell.className = "";
    }, 400);
  }
}

// UI Elements re-rendering
function updateUI() {
  // 1. Storage Tables (RAM Buffer vs Disk)
  renderMemoryTable(ramData, "ram", ramTableContainer);
  renderMemoryTable(diskData, "disk", diskTableContainer);

  // 2. Lock Registry Table
  renderLocksTable();

  // 3. Transactions Control Widgets
  renderTransactionControllers();

  // Metrics update
  const activeCount = Object.values(activeTransactions).filter(t => t.status === "active" || t.status === "blocked").length;
  metricActive.textContent = activeCount;
  metricLocks.textContent = Object.keys(activeLocks).length;

  if (Object.keys(activeLocks).length > 0) {
    lockMetricCard.style.borderColor = "var(--color-primary)";
  } else {
    lockMetricCard.style.borderColor = "var(--border-glass)";
  }
}

function renderMemoryTable(data, type, container) {
  container.innerHTML = "";
  const table = document.createElement("table");
  table.className = "db-grid-table";

  let rowsHtml = "";
  for (let key in data) {
    const val = data[key];
    const isWiped = val === null;
    const valText = isWiped ? "WIPED" : `$${val}`;
    
    // Check lock borders in RAM buffer view
    let rowClass = "";
    if (type === "ram" && activeLocks[key]) {
      rowClass = activeLocks[key].type === "X" ? "locked-exclusive" : "locked-shared";
    }

    rowsHtml += `
      <tr class="${rowClass}">
        <td><strong>${key}</strong></td>
        <td id="${type}-val-${key}" class="${isWiped ? 'wiped-value' : ''}">${valText}</td>
      </tr>
    `;
  }

  table.innerHTML = `
    <tr>
      <th>Account</th>
      <th>Balance</th>
    </tr>
    ${rowsHtml}
  `;
  container.appendChild(table);
}

function renderLocksTable() {
  locksTableContainer.innerHTML = "";
  
  const lockKeys = Object.keys(activeLocks);
  if (lockKeys.length === 0) {
    locksTableContainer.innerHTML = `<div class="empty-mempool-message">No active transaction locks.</div>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "db-grid-table";
  
  let rowsHtml = "";
  lockKeys.forEach(res => {
    const lock = activeLocks[res];
    rowsHtml += `
      <tr>
        <td><strong>${res}</strong></td>
        <td style="color: ${lock.type === 'X' ? 'var(--color-danger)' : 'var(--color-primary)'}; font-weight:700;">
          ${lock.type}-Lock
        </td>
        <td>${lock.heldBy.join(", ")}</td>
        <td>${lock.waiting.join(", ") || "-"}</td>
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

function renderTransactionControllers() {
  controllersContainer.innerHTML = "";
  const txNames = Object.keys(activeTransactions);

  if (txNames.length === 0) {
    controllersContainer.appendChild(emptyTxMessage);
    return;
  }

  txNames.forEach(name => {
    const tx = activeTransactions[name];
    const card = document.createElement("div");
    card.className = `tx-controller-card ${tx.status}`;
    
    const isCompleted = tx.status === "committed" || tx.status === "aborted";

    card.innerHTML = `
      <div class="tx-card-header">
        <span class="tx-card-name">${name}</span>
        <span class="tx-badge">${tx.status}</span>
      </div>
      <div class="tx-card-form">
        <div class="tx-card-row">
          <label>Resource:</label>
          <select class="tx-res-select" ${isCompleted ? 'disabled' : ''}>
            <option value="Alice">Alice</option>
            <option value="Bob">Bob</option>
          </select>
        </div>
        <div class="tx-card-row">
          <button class="btn btn-secondary btn-sm btn-read" ${isCompleted ? 'disabled' : ''}>Read</button>
          <input type="number" class="tx-amount-input" placeholder="Amount" value="100" style="width:70px;" ${isCompleted ? 'disabled' : ''}>
          <button class="btn btn-transact btn-sm btn-write" ${isCompleted ? 'disabled' : ''}>Write</button>
        </div>
        <div class="tx-card-actions">
          <button class="btn btn-accent btn-sm btn-commit" ${isCompleted ? 'disabled' : ''}>Commit</button>
          <button class="btn btn-secondary btn-sm btn-abort" ${isCompleted ? 'disabled' : ''}>Abort</button>
        </div>
      </div>
    `;

    // Dynamic actions
    const select = card.querySelector(".tx-res-select");
    const input = card.querySelector(".tx-amount-input");
    
    card.querySelector(".btn-read").addEventListener("click", () => {
      executeTxRead(name, select.value);
    });

    card.querySelector(".btn-write").addEventListener("click", () => {
      const amt = parseInt(input.value) || 0;
      executeTxWrite(name, select.value, amt, "subtract");
    });

    card.querySelector(".btn-commit").addEventListener("click", () => {
      executeTxCommit(name);
    });

    card.querySelector(".btn-abort").addEventListener("click", () => {
      executeTxAbort(name);
    });

    controllersContainer.appendChild(card);
  });
}

// Concurrency scenario guide triggers
function loadScenario(scenarioKey) {
  activeScenario = anomalyScenarios[scenarioKey];
  currentScenarioStep = 0;

  scenarioDetailsDisplay.classList.remove("hide");
  scenarioName.textContent = activeScenario.name;
  scenarioDesc.textContent = activeScenario.desc;

  // Build steps list
  scenarioStepsList.innerHTML = "";
  activeScenario.steps.forEach((step, idx) => {
    const el = document.createElement("div");
    el.className = "scenario-step-item";
    el.id = `scenario-step-${idx}`;
    el.textContent = step.text;
    
    el.addEventListener("click", () => {
      if (idx === currentScenarioStep) {
        step.action();
        el.classList.add("completed");
        el.classList.remove("active");
        
        currentScenarioStep++;
        const nextEl = document.getElementById(`scenario-step-${currentScenarioStep}`);
        if (nextEl) nextEl.className = "scenario-step-item active";
        
        addConsoleLog("ANOMALY GUIDE", `Completed step ${idx + 1}: ${step.text}`, "anomaly");
      }
    });

    scenarioStepsList.appendChild(el);
  });

  // Activate first step
  document.getElementById("scenario-step-0").className = "scenario-step-item active";
  addConsoleLog("ANOMALY GUIDE", `Loaded ${activeScenario.name}. Follow the highlighted steps to reproduce.`, "anomaly");
}

// Setups for scenario triggers
function setupDirtyReadScenario() {
  handleResetDB();
  selectIsolation.value = "read_uncommitted";
  currentIsolation = "read_uncommitted";
  handleStartTx("Tx A");
  handleStartTx("Tx B");
}

function setupLostUpdateScenario() {
  handleResetDB();
  selectIsolation.value = "read_committed";
  currentIsolation = "read_committed";
  handleStartTx("Tx A");
  handleStartTx("Tx B");
}

function setupLockBlockingScenario() {
  handleResetDB();
  selectIsolation.value = "serializable";
  currentIsolation = "serializable";
  handleStartTx("Tx A");
  handleStartTx("Tx B");
}

// Clean helper resets
function handleResetDB() {
  diskData = { ...initialDisk };
  ramData = { ...initialDisk };
  activeTransactions = {};
  activeLocks = {};
  walLogs = [];
  isCrashed = false;
  
  btnCrash.classList.remove("hide");
  btnRecover.classList.add("hide");

  metricStatus.textContent = "ONLINE";
  engineStatusCard.style.borderColor = "var(--border-glass)";
  engineStatusCard.style.boxShadow = "none";
  
  metricWal.textContent = "0";
  walLogContainer.innerHTML = "";

  updateUI();
  addConsoleLog("SYSTEM", "Engine state reset to default configurations.", "system");
}

// Diagnostic console logging
function addConsoleLog(source, message, type = "system") {
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-source">[${source}]</span> ${message}`;
  consoleLogs.appendChild(entry);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

window.addEventListener("DOMContentLoaded", init);
