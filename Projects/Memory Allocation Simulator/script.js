// Memory Allocation Simulator App Logic

// Configurations
let partitionMode = "fixed"; // 'fixed' or 'dynamic'
let fitAlgorithm = "first";  // 'first', 'best', 'worst', 'next'
let totalMemoryCapacity = 1000; // KB
let fixedBlockSizes = [150, 300, 100, 200, 250]; // KB

// Simulator State
let partitions = []; // array of { id, start, size, allocated, process: { name, size, duration, timeLeft }, wasted }
let waitingQueue = []; // array of processes: { name, size, duration }
let nextFitPointer = 0; // index of partition for next fit

// Timers
let autoTickInterval = null;

// DOM Elements
const selectMode = document.getElementById('partition-mode');
const selectAlgo = document.getElementById('fit-algorithm');
const inputCapacity = document.getElementById('memory-capacity');
const inputFixedBlocks = document.getElementById('fixed-blocks-input');
const blockBuilderWrapper = document.getElementById('fixed-layout-builder');
const btnReconfigure = document.getElementById('btn-reconfigure');
const selectPreset = document.getElementById('partition-preset');

const memoryLimitTxt = document.getElementById('memory-limit-txt');
const memoryBar = document.getElementById('memory-bar');
const nextFitPointerStatus = document.getElementById('next-fit-pointer-status');
const nextPointerAddr = document.getElementById('next-pointer-addr');
const partitionTableBody = document.querySelector('#partitions-table tbody');

const statUtil = document.getElementById('stat-util');
const statInternal = document.getElementById('stat-internal');
const statExternal = document.getElementById('stat-external');
const memProgressBar = document.getElementById('mem-progress-bar');

const procNameInput = document.getElementById('proc-name');
const procSizeInput = document.getElementById('proc-size');
const procDurationInput = document.getElementById('proc-duration');
const btnAllocate = document.getElementById('btn-allocate');

const waitingQueueWrapper = document.getElementById('waiting-queue');
const queueCountLabel = document.getElementById('queue-count');
const btnClearQueue = document.getElementById('btn-clear-queue');

const logConsole = document.getElementById('log-console');
const btnClearLogs = document.getElementById('btn-clear-logs');

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadPresetScheme("fixed-unequal");
  startAutoTimer();
  logMessage("Memory Allocation Simulator initialized.", "system");
});

function setupEventListeners() {
  selectMode.addEventListener('change', (e) => {
    partitionMode = e.target.value;
    blockBuilderWrapper.classList.toggle('hidden', partitionMode === 'dynamic');
    resetSimulation();
  });

  selectAlgo.addEventListener('change', (e) => {
    fitAlgorithm = e.target.value;
    nextFitPointerStatus.classList.toggle('hidden', fitAlgorithm !== 'next');
    resetSimulation();
  });

  btnReconfigure.addEventListener('click', () => {
    totalMemoryCapacity = Math.max(100, Math.min(4000, parseInt(inputCapacity.value) || 1000));
    inputCapacity.value = totalMemoryCapacity;
    
    if (partitionMode === 'fixed') {
      parseFixedSizes();
    }
    resetSimulation();
  });

  selectPreset.addEventListener('change', (e) => {
    loadPresetScheme(e.target.value);
  });

  btnAllocate.addEventListener('click', handleManualAllocation);

  btnClearQueue.addEventListener('click', () => {
    waitingQueue = [];
    updateQueueUI();
    logMessage("Waiting queue cleared.", "warning");
  });

  btnClearLogs.addEventListener('click', () => {
    logConsole.innerHTML = "";
  });
}

function startAutoTimer() {
  if (autoTickInterval) clearInterval(autoTickInterval);
  
  // Timer ticks every 1 second to update process remaining time-left
  autoTickInterval = setInterval(() => {
    let changed = false;

    partitions.forEach(p => {
      if (p.allocated && p.process && p.process.duration > 0) {
        p.process.timeLeft--;
        if (p.process.timeLeft <= 0) {
          // Process timeout deallocate
          logMessage(`[TIMEOUT] Process ${p.process.name} has finished execution and released memory.`, "warning");
          deallocatePartition(p.id, false); // deallocate and attempt queue check
          changed = true;
        }
      }
    });

    if (changed) {
      updateQueueUI();
      renderMemoryMap();
      renderPartitionsTable();
      updateStats();
    } else {
      // Just refresh table labels to show decreasing timeleft
      renderPartitionsTable();
    }
  }, 1000);
}

// Parse fixed comma-separated numbers
function parseFixedSizes() {
  const text = inputFixedBlocks.value;
  const items = text.split(',');
  const list = [];
  let sum = 0;

  items.forEach(item => {
    const val = parseInt(item.trim());
    if (!isNaN(val) && val > 0) {
      list.push(val);
      sum += val;
    }
  });

  if (sum > totalMemoryCapacity) {
    alert(`Total sum of partition sizes (${sum} KB) exceeds overall memory capacity (${totalMemoryCapacity} KB). Adjusting capacity to match.`);
    totalMemoryCapacity = sum;
    inputCapacity.value = totalMemoryCapacity;
  }

  fixedBlockSizes = list;
}

// ----------------------------------------------------
// MEMORY PARTITION ENGINE
// ----------------------------------------------------
function resetSimulation() {
  partitions = [];
  nextFitPointer = 0;
  
  memoryLimitTxt.textContent = totalMemoryCapacity;

  if (partitionMode === "fixed") {
    let startOffset = 0;
    fixedBlockSizes.forEach((size, idx) => {
      partitions.push({
        id: `Block ${idx}`,
        start: startOffset,
        size: size,
        allocated: false,
        process: null,
        wasted: 0
      });
      startOffset += size;
    });

    // Check if there is extra capacity at end
    if (startOffset < totalMemoryCapacity) {
      const leftover = totalMemoryCapacity - startOffset;
      partitions.push({
        id: `Block ${fixedBlockSizes.length}`,
        start: startOffset,
        size: leftover,
        allocated: false,
        process: null,
        wasted: 0
      });
    }
  } else {
    // Dynamic starts with one large block
    partitions.push({
      id: `Hole 0`,
      start: 0,
      size: totalMemoryCapacity,
      allocated: false,
      process: null,
      wasted: 0
    });
  }

  nextFitPointerStatus.classList.toggle('hidden', fitAlgorithm !== 'next');
  updateNextPointerUI();

  // Try loading queue items if any
  processWaitingQueue();

  renderMemoryMap();
  renderPartitionsTable();
  updateStats();
  updateQueueUI();
}

// ----------------------------------------------------
// FIT ALLOCATION SEARCH ALGORITHMS
// ----------------------------------------------------

async function findFittingPartition(procSize, visualHighlight = true) {
  const n = partitions.length;
  let targetIdx = -1;

  if (fitAlgorithm === "first") {
    for (let i = 0; i < n; i++) {
      if (visualHighlight) await highlightSearchStep(i);
      
      if (!partitions[i].allocated && partitions[i].size >= procSize) {
        targetIdx = i;
        logMessage(`[SEARCH] First Fit matched: Block ${partitions[i].id} (size ${partitions[i].size} KB) fits request size ${procSize} KB.`, "success");
        break;
      }
    }
  } 
  
  else if (fitAlgorithm === "best") {
    let minRemainder = Infinity;
    
    for (let i = 0; i < n; i++) {
      if (visualHighlight) await highlightSearchStep(i);

      if (!partitions[i].allocated && partitions[i].size >= procSize) {
        const remainder = partitions[i].size - procSize;
        if (remainder < minRemainder) {
          minRemainder = remainder;
          targetIdx = i;
        }
      }
    }
    if (targetIdx !== -1) {
      logMessage(`[SEARCH] Best Fit matched: Block ${partitions[targetIdx].id} (size ${partitions[targetIdx].size} KB, remainder ${minRemainder} KB) selected.`, "success");
    }
  } 
  
  else if (fitAlgorithm === "worst") {
    let maxRemainder = -1;
    
    for (let i = 0; i < n; i++) {
      if (visualHighlight) await highlightSearchStep(i);

      if (!partitions[i].allocated && partitions[i].size >= procSize) {
        const remainder = partitions[i].size - procSize;
        if (remainder > maxRemainder) {
          maxRemainder = remainder;
          targetIdx = i;
        }
      }
    }
    if (targetIdx !== -1) {
      logMessage(`[SEARCH] Worst Fit matched: Block ${partitions[targetIdx].id} (size ${partitions[targetIdx].size} KB, remainder ${maxRemainder} KB) selected.`, "success");
    }
  } 
  
  else if (fitAlgorithm === "next") {
    // Next Fit sweeps starting from nextFitPointer
    let checkedCount = 0;
    let i = nextFitPointer;

    while (checkedCount < n) {
      if (visualHighlight) await highlightSearchStep(i);

      if (!partitions[i].allocated && partitions[i].size >= procSize) {
        targetIdx = i;
        // Update pointer to next slot
        nextFitPointer = (i + 1) % n;
        updateNextPointerUI();
        logMessage(`[SEARCH] Next Fit matched: Block ${partitions[i].id} (size ${partitions[i].size} KB). Next pointer updated to partition index ${nextFitPointer}.`, "success");
        break;
      }
      i = (i + 1) % n;
      checkedCount++;
    }
  }

  // Clear visual lookup classes
  clearSearchHighlights();
  return targetIdx;
}

// Visual highlights delay simulation
function highlightSearchStep(idx) {
  return new Promise(resolve => {
    const segment = document.getElementById(`segment-${idx}`);
    const row = document.getElementById(`partition-row-${idx}`);
    
    if (segment) segment.classList.add('searching');
    if (row) row.classList.add('active-fit-frag');

    setTimeout(() => {
      if (segment) segment.classList.remove('searching');
      if (row) row.classList.remove('active-fit-frag');
      resolve();
    }, 120); // visual check interval
  });
}

function clearSearchHighlights() {
  const segments = document.querySelectorAll('.mem-segment');
  segments.forEach(s => s.classList.remove('searching'));
}

// ----------------------------------------------------
// PROCESS ALLOCATOR ACTIONS
// ----------------------------------------------------

async function allocateProcess(name, size, duration, triggerQueueCheck = true) {
  logMessage(`[REQUEST] Process ${name} requires ${size} KB. Scanning partitions...`, "info");
  
  const targetIdx = await findFittingPartition(size, triggerQueueCheck);

  if (targetIdx !== -1) {
    const block = partitions[targetIdx];
    
    block.allocated = true;
    block.process = {
      name: name,
      size: size,
      duration: duration,
      timeLeft: duration
    };

    if (partitionMode === "fixed") {
      // Internal fragmentation wastes space inside partition
      block.wasted = block.size - size;
      logMessage(`[ALLOCATED] Process ${name} loaded into ${block.id}. Internal Fragmentation: ${block.wasted} KB.`, "info");
    } else {
      // Dynamic Partitioning - splits block if larger
      block.wasted = 0;
      const leftover = block.size - size;
      if (leftover > 0) {
        // Split block
        block.size = size;
        const newHole = {
          id: `Hole ${Date.now()}`,
          start: block.start + size,
          size: leftover,
          allocated: false,
          process: null,
          wasted: 0
        };
        partitions.splice(targetIdx + 1, 0, newHole);
        logMessage(`[SPLIT] Block split: Process ${name} allocated ${size} KB. Created new Free Hole of size ${leftover} KB.`, "success");
      } else {
        logMessage(`[ALLOCATED] Process ${name} loaded into ${block.id} (Exact Fit).`, "info");
      }
      renameDynamicPartitions();
    }

    renderMemoryMap();
    renderPartitionsTable();
    updateStats();
    return true;
  } else {
    // Allocation failed
    logMessage(`[FAILED] Out of Memory: No free partition can accommodate size ${size} KB.`, "error");
    
    // Add to waiting queue if not already there
    const alreadyQueued = waitingQueue.some(p => p.name === name);
    if (!alreadyQueued) {
      waitingQueue.push({ name, size, duration });
      updateQueueUI();
      logMessage(`[QUEUE] Process ${name} pushed to Waiting queue.`, "warning");
    }
    return false;
  }
}

function deallocatePartition(partitionId, triggerQueueCheck = true) {
  const idx = partitions.findIndex(p => p.id === partitionId);
  if (idx === -1) return;

  const block = partitions[idx];
  const procName = block.process ? block.process.name : "";
  
  block.allocated = false;
  block.process = null;
  block.wasted = 0;

  logMessage(`[RELEASED] Process ${procName} deallocated. Block ${block.id} is now free.`, "warning");

  if (partitionMode === "dynamic") {
    coalesceFreeBlocks();
  }

  // Auto satisfy queued items
  if (triggerQueueCheck) {
    processWaitingQueue();
  }

  renderMemoryMap();
  renderPartitionsTable();
  updateStats();
  updateQueueUI();
}

// Merge adjacent free memory slots
function coalesceFreeBlocks() {
  let mergedCount = 0;
  for (let i = 0; i < partitions.length - 1; i++) {
    if (!partitions[i].allocated && !partitions[i+1].allocated) {
      // Merge i and i+1
      partitions[i].size += partitions[i+1].size;
      partitions.splice(i + 1, 1);
      mergedCount++;
      i--; // check again at merged position
    }
  }
  
  if (mergedCount > 0) {
    renameDynamicPartitions();
    logMessage(`[COALESCE] Coalescing complete: Merged contiguous free blocks.`, "success");
  }
}

function renameDynamicPartitions() {
  let holeIdx = 0;
  let procIdx = 0;
  partitions.forEach(p => {
    if (p.allocated) {
      p.id = `Partition ${procIdx++}`;
    } else {
      p.id = `Hole ${holeIdx++}`;
    }
  });
}

// Starving queue allocations sweeps
async function processWaitingQueue() {
  if (waitingQueue.length === 0) return;

  let queueUpdated = false;
  for (let i = 0; i < waitingQueue.length; i++) {
    const proc = waitingQueue[i];
    // Check if fits (without visually slowing down checks)
    const fitIdx = await findFittingPartition(proc.size, false);
    if (fitIdx !== -1) {
      // Allocate it
      waitingQueue.splice(i, 1);
      i--; // align index
      await allocateProcess(proc.name, proc.size, proc.duration, false);
      queueUpdated = true;
    }
  }

  if (queueUpdated) {
    updateQueueUI();
  }
}

// ----------------------------------------------------
// UI DRAW PLOTS
// ----------------------------------------------------

function renderMemoryMap() {
  memoryBar.innerHTML = "";
  
  const n = partitions.length;
  partitions.forEach((block, idx) => {
    const segment = document.createElement("div");
    segment.setAttribute("id", `segment-${idx}`);
    
    let stateClass = block.allocated ? "allocated-block" : "free-block";
    segment.className = `mem-segment ${stateClass}`;

    // Size proportion width percentage
    const widthPct = (block.size / totalMemoryCapacity) * 100;
    segment.style.width = `${widthPct}%`;

    // Internal block elements
    const content = document.createElement("div");
    content.className = "segment-content";

    if (block.allocated && block.process) {
      content.innerHTML = `<strong>${block.process.name}</strong><br>${block.process.size} KB`;
      segment.title = `Partition: ${block.id}\nRange: ${block.start} - ${block.start + block.size} KB\nAllocated to: ${block.process.name}\nSize: ${block.process.size} KB\nWasted Space: ${block.wasted} KB`;
    } else {
      content.innerHTML = `<span class="text-muted">${block.size} KB</span>`;
      segment.title = `Free Block: ${block.id}\nRange: ${block.start} - ${block.start + block.size} KB\nSize: ${block.size} KB`;
    }

    segment.appendChild(content);

    // Render wasted/fragmentation bars inside allocated blocks (Fixed Mode)
    if (partitionMode === 'fixed' && block.allocated && block.wasted > 0) {
      const wastePct = (block.wasted / block.size) * 100;
      const wasteDiv = document.createElement("div");
      wasteDiv.className = "segment-waste-fill";
      wasteDiv.style.setProperty('--waste-pct', `${wastePct}%`);
      wasteDiv.textContent = `${block.wasted}K`;
      segment.appendChild(wasteDiv);
    }

    // Address labels at bottom boundary lines
    const addrStart = document.createElement("span");
    addrStart.className = "segment-address-lbl";
    addrStart.textContent = `${block.start}K`;
    segment.appendChild(addrStart);

    // If final element, draw limit address label
    if (idx === n - 1) {
      const addrEnd = document.createElement("span");
      addrEnd.className = "segment-limit-lbl";
      addrEnd.textContent = `${block.start + block.size}K`;
      segment.appendChild(addrEnd);
    }

    // Display Next Fit pointer visual indicator
    if (fitAlgorithm === 'next' && idx === nextFitPointer) {
      const ptrArrow = document.createElement("span");
      ptrArrow.className = "search-arrow";
      ptrArrow.innerHTML = "&darr;";
      segment.appendChild(ptrArrow);
    }

    memoryBar.appendChild(segment);
  });
}

function renderPartitionsTable() {
  partitionTableBody.innerHTML = "";
  
  partitions.forEach((block, idx) => {
    const tr = document.createElement('tr');
    tr.setAttribute("id", `partition-row-${idx}`);

    let statusBadge = block.allocated 
      ? `<span class="badge-status allocated">Allocated</span>`
      : `<span class="badge-status free">Free</span>`;

    let procInfo = "--";
    if (block.allocated && block.process) {
      const durationStr = block.process.duration > 0 ? ` [${block.process.timeLeft}s left]` : " [infinite]";
      procInfo = `<strong>${block.process.name}</strong> (${block.process.size} KB)${durationStr}`;
    }

    let actionButton = block.allocated
      ? `<button class="btn btn-small danger-btn" onclick="deallocatePartition('${block.id}')">Release</button>`
      : `--`;

    tr.innerHTML = `
      <td>${block.id}</td>
      <td class="font-mono">${block.start} KB</td>
      <td class="font-mono">${block.start + block.size} KB</td>
      <td class="font-mono">${block.size} KB</td>
      <td>${statusBadge}</td>
      <td>${procInfo}</td>
      <td class="font-mono text-danger">${block.wasted > 0 ? block.wasted + ' KB' : '0 KB'}</td>
      <td>${actionButton}</td>
    `;
    partitionTableBody.appendChild(tr);
  });
}

// ----------------------------------------------------
// STATS AND WAITING QUEUE UI UPDATERS
// ----------------------------------------------------

function updateStats() {
  let allocatedSum = 0;
  let internalSum = 0;
  
  partitions.forEach(p => {
    if (p.allocated) {
      allocatedSum += p.process ? p.process.size : p.size;
      internalSum += p.wasted;
    }
  });

  // Utilization %
  const totalAllocatedPlusFrag = allocatedSum + internalSum;
  const utilPct = totalMemoryCapacity > 0 ? (totalAllocatedPlusFrag / totalMemoryCapacity) * 100 : 0;
  statUtil.textContent = `${utilPct.toFixed(1)}%`;
  memProgressBar.style.width = `${utilPct}%`;

  // Internal Fragmentation
  statInternal.textContent = `${internalSum} KB`;

  // External Fragmentation
  // Sum of free blocks when waiting queue is non-empty, but no block fits the waiting processes
  let externalSum = 0;
  if (waitingQueue.length > 0) {
    partitions.forEach(p => {
      if (!p.allocated) {
        externalSum += p.size;
      }
    });
  }
  statExternal.textContent = `${externalSum} KB`;
}

function updateQueueUI() {
  waitingQueueWrapper.innerHTML = "";
  queueCountLabel.textContent = `(${waitingQueue.length} process${waitingQueue.length !== 1 ? 'es' : ''})`;

  if (waitingQueue.length === 0) {
    waitingQueueWrapper.innerHTML = `<div class="queue-empty-msg">No processes currently waiting.</div>`;
    return;
  }

  waitingQueue.forEach((proc, idx) => {
    const item = document.createElement("div");
    item.className = "queue-item";

    const info = document.createElement("div");
    info.className = "queue-item-info";
    
    let timerTag = "";
    if (proc.duration > 0) {
      timerTag = `<span class="queue-proc-timer">${proc.duration}s timer</span>`;
    }

    info.innerHTML = `
      <span class="queue-proc-name">${proc.name}</span>
      <span class="queue-proc-size">${proc.size} KB</span>
      ${timerTag}
    `;

    const delBtn = document.createElement("button");
    delBtn.className = "btn-icon-delete";
    delBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    `;
    delBtn.addEventListener('click', () => {
      waitingQueue.splice(idx, 1);
      updateQueueUI();
      updateStats();
      logMessage(`Removed Process ${proc.name} from waiting queue.`, "warning");
    });

    item.appendChild(info);
    item.appendChild(delBtn);
    waitingQueueWrapper.appendChild(item);
  });
}

function updateNextPointerUI() {
  if (fitAlgorithm === 'next' && partitions.length > 0) {
    const ptrBlock = partitions[nextFitPointer];
    nextPointerAddr.textContent = ptrBlock ? `${ptrBlock.start} KB (${ptrBlock.id})` : "0 KB";
  }
}

// ----------------------------------------------------
// EVENT HANDLERS
// ----------------------------------------------------
function handleManualAllocation() {
  const name = procNameInput.value.trim().toUpperCase();
  const size = parseInt(procSizeInput.value) || 0;
  const duration = parseInt(procDurationInput.value) || 0;

  if (!name) {
    alert("Please enter a process name.");
    return;
  }
  if (size <= 0 || size > totalMemoryCapacity) {
    alert(`Please enter a valid process size between 1 and ${totalMemoryCapacity} KB.`);
    return;
  }

  allocateProcess(name, size, duration);

  // Auto increment process label name
  const nextNum = parseInt(name.replace(/[^0-9]/g, '')) + 1;
  if (!isNaN(nextNum)) {
    procNameInput.value = `P${nextNum}`;
  }
}

// ----------------------------------------------------
// PRESET CONFIG TIMELINES
// ----------------------------------------------------
function loadPresetScheme(presetKey) {
  waitingQueue = [];

  if (presetKey === "fixed-equal") {
    selectMode.value = "fixed";
    partitionMode = "fixed";
    totalMemoryCapacity = 1000;
    fixedBlockSizes = [200, 200, 200, 200, 200];
    inputFixedBlocks.value = "200, 200, 200, 200, 200";
    blockBuilderWrapper.classList.remove('hidden');

  } else if (presetKey === "fixed-unequal") {
    selectMode.value = "fixed";
    partitionMode = "fixed";
    totalMemoryCapacity = 1000;
    fixedBlockSizes = [150, 300, 100, 200, 250];
    inputFixedBlocks.value = "150, 300, 100, 200, 250";
    blockBuilderWrapper.classList.remove('hidden');

  } else if (presetKey === "dynamic-single") {
    selectMode.value = "dynamic";
    partitionMode = "dynamic";
    totalMemoryCapacity = 1000;
    blockBuilderWrapper.classList.add('hidden');
  }

  inputCapacity.value = totalMemoryCapacity;
  resetSimulation();
  
  logMessage(`Loaded partition preset: ${presetKey.toUpperCase().replace('-', ' ')}`, "system");
}

// ----------------------------------------------------
// LOGGER HELPERS
// ----------------------------------------------------
function logMessage(text, type = "system") {
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  
  const time = new Date();
  const timeString = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
  
  entry.innerHTML = `<span style="color:#4b5563; font-size: 0.725rem;">[${timeString}]</span> ${text}`;
  logConsole.appendChild(entry);
  
  logConsole.scrollTop = logConsole.scrollHeight;
}
