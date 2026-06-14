// App State
let processes = [];
let originalBackup = []; // Restore point
let totalResources = [10, 5, 7, 0]; // A, B, C, D
let resourceCount = 3; // 3 (A,B,C) or 4 (A,B,C,D)
const resourceLabels = ['A', 'B', 'C', 'D'];

// Stepper State Machine
let stepModeActive = false;
let stepWork = [];
let stepFinish = [];
let stepSequence = [];
let stepIndex = 0; // Scanning index for step evaluation
let stepRound = 0; // Number of scans through the processes list

// DOM Elements
const presetSelect = document.getElementById('presetSelect');
const resourceCountSelect = document.getElementById('resourceCountSelect');
const capacityInputsContainer = document.getElementById('capacityInputsContainer');
const totalAInput = document.getElementById('totalA');
const totalBInput = document.getElementById('totalB');
const totalCInput = document.getElementById('totalC');
const totalDInput = document.getElementById('totalD');
const totalDGroup = document.getElementById('totalDGroup');

const requestProcessSelect = document.getElementById('requestProcessSelect');
const reqAInput = document.getElementById('reqA');
const reqBInput = document.getElementById('reqB');
const reqCInput = document.getElementById('reqC');
const reqDInput = document.getElementById('reqD');
const reqDGroup = document.getElementById('reqDGroup');
const submitRequestBtn = document.getElementById('submitRequestBtn');

const addAllocA = document.getElementById('addAllocA');
const addAllocB = document.getElementById('addAllocB');
const addAllocC = document.getElementById('addAllocC');
const addAllocD = document.getElementById('addAllocD');
const addAllocDGroup = document.getElementById('addAllocDGroup');

const addMaxA = document.getElementById('addMaxA');
const addMaxB = document.getElementById('addMaxB');
const addMaxC = document.getElementById('addMaxC');
const addMaxD = document.getElementById('addMaxD');
const addMaxDGroup = document.getElementById('addMaxDGroup');
const addProcessBtn = document.getElementById('addProcessBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// Controls
const checkSafetyBtn = document.getElementById('checkSafetyBtn');
const startStepBtn = document.getElementById('startStepBtn');
const resetSimBtn = document.getElementById('resetSimBtn');
const randomizeBtn = document.getElementById('randomizeBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');

const safetyStatus = document.getElementById('safetyStatus');
const safeSequenceDisplay = document.getElementById('safeSequenceDisplay');
const availableVectorDisplay = document.getElementById('availableVectorDisplay');

// Stepper Elements
const stepperSection = document.getElementById('stepperSection');
const nextStepBtn = document.getElementById('nextStepBtn');
const exitStepBtn = document.getElementById('exitStepBtn');
const workVectorBubble = document.getElementById('workVectorBubble');
const finishBubblesContainer = document.getElementById('finishBubblesContainer');

// Table Elements
const matrixTableBody = document.getElementById('matrixTableBody');
const matrixTableSubHeader = document.getElementById('matrixTableSubHeader');
const matrixTable = document.getElementById('matrixTable');

// Vector display elements
const vectorTotalVal = document.getElementById('vectorTotalVal');
const vectorAllocatedVal = document.getElementById('vectorAllocatedVal');
const vectorAvailableVal = document.getElementById('vectorAvailableVal');

// Logs
const logsConsole = document.getElementById('logsConsole');
const clearLogsBtn = document.getElementById('clearLogsBtn');

// Startup Initializations
window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadPreset('safe-3'); // Default preset
});

// Event Listeners setup
function setupEventListeners() {
    presetSelect.addEventListener('change', (e) => {
        if (e.target.value !== 'default') {
            loadPreset(e.target.value);
        }
    });

    resourceCountSelect.addEventListener('change', (e) => {
        resourceCount = parseInt(e.target.value);
        toggleDVisibility();
        initializeDefaultState();
        addLog(`Changed system to ${resourceCount} Resource Types. State initialized.`, 'system');
    });

    // Handle Total Capacity changes
    [totalAInput, totalBInput, totalCInput, totalDInput].forEach((input, index) => {
        input.addEventListener('change', () => {
            let val = parseInt(input.value);
            if (isNaN(val) || val < 0) val = 0;
            input.value = val;
            totalResources[index] = val;
            addLog(`Total Capacity for ${resourceLabels[index]} changed to ${val}`, 'system');
            updateSystemVectors();
            resetSafetyState();
        });
    });

    // Add process
    addProcessBtn.addEventListener('click', () => {
        const alloc = [
            parseInt(addAllocA.value) || 0,
            parseInt(addAllocB.value) || 0,
            parseInt(addAllocC.value) || 0,
            resourceCount === 4 ? (parseInt(addAllocD.value) || 0) : 0
        ];
        
        const max = [
            parseInt(addMaxA.value) || 0,
            parseInt(addMaxB.value) || 0,
            parseInt(addMaxC.value) || 0,
            resourceCount === 4 ? (parseInt(addMaxD.value) || 0) : 0
        ];

        // Validations
        for (let j = 0; j < resourceCount; j++) {
            if (alloc[j] > max[j]) {
                alert(`Error: Allocation for Resource ${resourceLabels[j]} cannot exceed Maximum Claim.`);
                return;
            }
        }

        const pid = 'P' + processes.length;
        const need = max.map((mVal, j) => mVal - alloc[j]);

        const newP = { pid, allocation: alloc, max, need };
        processes.push(newP);
        originalBackup.push(JSON.parse(JSON.stringify(newP)));
        
        addLog(`Added process ${pid} (Allocated: [${alloc.slice(0, resourceCount)}], Max: [${max.slice(0, resourceCount)}])`, 'system');
        
        updateSystemVectors();
        renderTable();
        populateRequestSelect();
        resetSafetyState();
    });

    clearAllBtn.addEventListener('click', () => {
        processes = [];
        originalBackup = [];
        addLog('Cleared all processes.', 'system');
        updateSystemVectors();
        renderTable();
        populateRequestSelect();
        resetSafetyState();
    });

    // Auto check safety
    checkSafetyBtn.addEventListener('click', () => {
        exitStepVerificationMode();
        runAutoSafetyCheck();
    });

    // Step safety controls
    startStepBtn.addEventListener('click', () => {
        startStepVerificationMode();
    });

    nextStepBtn.addEventListener('click', () => {
        executeNextStep();
    });

    exitStepBtn.addEventListener('click', () => {
        exitStepVerificationMode();
    });

    resetSimBtn.addEventListener('click', () => {
        exitStepVerificationMode();
        // Restore from backup
        processes = JSON.parse(JSON.stringify(originalBackup));
        addLog('Restored original process matrices.', 'system');
        updateSystemVectors();
        renderTable();
        resetSafetyState();
    });

    randomizeBtn.addEventListener('click', () => {
        exitStepVerificationMode();
        generateRandomState();
    });

    exportCsvBtn.addEventListener('click', () => {
        exportToCsv();
    });

    clearLogsBtn.addEventListener('click', () => {
        logsConsole.innerHTML = '';
        addLog('Logs cleared.', 'system');
    });

    // Submit Custom Resource Request
    submitRequestBtn.addEventListener('click', () => {
        evaluateResourceRequest();
    });
}

// Show/Hide D resources input depending on count
function toggleDVisibility() {
    const is4 = resourceCount === 4;
    totalDGroup.style.display = is4 ? 'block' : 'none';
    reqDGroup.style.display = is4 ? 'block' : 'none';
    addAllocDGroup.style.display = is4 ? 'block' : 'none';
    addMaxDGroup.style.display = is4 ? 'block' : 'none';
    
    // Update subheader columns
    let html = `
        <th class="res-col">A</th>
        <th class="res-col">B</th>
        <th class="res-col">C</th>
        <th class="res-col">A</th>
        <th class="res-col">B</th>
        <th class="res-col">C</th>
        <th class="res-col">A</th>
        <th class="res-col">B</th>
        <th class="res-col">C</th>
    `;
    
    if (is4) {
        html = `
            <th class="res-col">A</th>
            <th class="res-col">B</th>
            <th class="res-col">C</th>
            <th class="res-col">D</th>
            <th class="res-col">A</th>
            <th class="res-col">B</th>
            <th class="res-col">C</th>
            <th class="res-col">D</th>
            <th class="res-col">A</th>
            <th class="res-col">B</th>
            <th class="res-col">C</th>
            <th class="res-col">D</th>
        `;
    }
    
    matrixTableSubHeader.innerHTML = html;
    
    // Update super-header columns spans
    const colGroupHdr = matrixTable.querySelectorAll('.header-super th.col-group');
    colGroupHdr.forEach(hdr => {
        hdr.setAttribute('colspan', resourceCount);
    });
}

// Initialize clean state
function initializeDefaultState() {
    processes = [];
    originalBackup = [];
    resetSafetyState();
}

// Log utility
function addLog(message, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    timeSpan.textContent = `[${timeStr}]`;
    
    entry.appendChild(timeSpan);
    entry.appendChild(document.createTextNode(' ' + message));
    
    logsConsole.appendChild(entry);
    logsConsole.scrollTop = logsConsole.scrollHeight;
}

// Load preconfigured scenarios
function loadPreset(presetName) {
    exitStepVerificationMode();
    
    if (presetName === 'safe-3') {
        resourceCountSelect.value = '3';
        resourceCount = 3;
        toggleDVisibility();
        
        totalResources = [10, 5, 7, 0];
        totalAInput.value = 10;
        totalBInput.value = 5;
        totalCInput.value = 7;
        
        processes = [
            { pid: 'P0', allocation: [0, 1, 0, 0], max: [7, 5, 3, 0], need: [7, 4, 3, 0] },
            { pid: 'P1', allocation: [2, 0, 0, 0], max: [3, 2, 2, 0], need: [1, 2, 2, 0] },
            { pid: 'P2', allocation: [3, 0, 2, 0], max: [9, 0, 2, 0], need: [6, 0, 0, 0] },
            { pid: 'P3', allocation: [2, 1, 1, 0], max: [2, 2, 2, 0], need: [0, 1, 1, 0] },
            { pid: 'P4', allocation: [0, 0, 2, 0], max: [4, 3, 3, 0], need: [4, 3, 1, 0] }
        ];
    } 
    else if (presetName === 'unsafe-3') {
        resourceCountSelect.value = '3';
        resourceCount = 3;
        toggleDVisibility();
        
        totalResources = [10, 5, 7, 0];
        totalAInput.value = 10;
        totalBInput.value = 5;
        totalCInput.value = 7;

        // Everyone allocates but leaves available low, with high claims
        processes = [
            { pid: 'P0', allocation: [0, 1, 0, 0], max: [7, 5, 3, 0], need: [7, 4, 3, 0] },
            { pid: 'P1', allocation: [3, 0, 2, 0], max: [4, 3, 3, 0], need: [1, 3, 1, 0] },
            { pid: 'P2', allocation: [3, 0, 2, 0], max: [9, 0, 2, 0], need: [6, 0, 0, 0] },
            { pid: 'P3', allocation: [2, 1, 1, 0], max: [6, 2, 2, 0], need: [4, 1, 1, 0] },
            { pid: 'P4', allocation: [0, 2, 2, 0], max: [4, 3, 3, 0], need: [4, 1, 1, 0] }
        ];
    }
    else if (presetName === 'safe-4') {
        resourceCountSelect.value = '4';
        resourceCount = 4;
        toggleDVisibility();

        totalResources = [6, 5, 7, 6];
        totalAInput.value = 6;
        totalBInput.value = 5;
        totalCInput.value = 7;
        totalDInput.value = 6;

        processes = [
            { pid: 'P0', allocation: [1, 0, 2, 1], max: [2, 2, 2, 2], need: [1, 2, 0, 1] },
            { pid: 'P1', allocation: [1, 1, 0, 2], max: [2, 3, 3, 2], need: [1, 2, 3, 0] },
            { pid: 'P2', allocation: [1, 2, 2, 0], max: [1, 2, 5, 2], need: [0, 0, 3, 2] },
            { pid: 'P3', allocation: [2, 0, 1, 1], max: [3, 1, 4, 2], need: [1, 1, 3, 1] }
        ];
    }
    else if (presetName === 'complex-request') {
        resourceCountSelect.value = '3';
        resourceCount = 3;
        toggleDVisibility();

        totalResources = [10, 5, 7, 0];
        totalAInput.value = 10;
        totalBInput.value = 5;
        totalCInput.value = 7;

        // Standard configuration for checking request evaluations
        processes = [
            { pid: 'P0', allocation: [3, 0, 2, 0], max: [7, 5, 3, 0], need: [4, 5, 1, 0] },
            { pid: 'P1', allocation: [3, 0, 2, 0], max: [3, 2, 2, 0], need: [0, 2, 0, 0] },
            { pid: 'P2', allocation: [3, 0, 2, 0], max: [9, 0, 2, 0], need: [6, 0, 0, 0] },
            { pid: 'P3', allocation: [0, 1, 1, 0], max: [2, 2, 2, 0], need: [2, 1, 1, 0] }
        ];
    }

    originalBackup = JSON.parse(JSON.stringify(processes));
    addLog(`Loaded preset: "${presetSelect.options[presetSelect.selectedIndex].text}"`, 'system');
    
    updateSystemVectors();
    renderTable();
    populateRequestSelect();
    resetSafetyState();
}

// Generate random safe/unsafe process setups
function generateRandomState() {
    const is4 = Math.random() > 0.5;
    resourceCount = is4 ? 4 : 3;
    resourceCountSelect.value = resourceCount.toString();
    toggleDVisibility();

    // Define random total resources
    totalResources = [
        10 + Math.floor(Math.random() * 6), // 10-15
        5 + Math.floor(Math.random() * 6),  // 5-10
        7 + Math.floor(Math.random() * 6),  // 7-12
        is4 ? (6 + Math.floor(Math.random() * 6)) : 0 // 6-11
    ];

    totalAInput.value = totalResources[0];
    totalBInput.value = totalResources[1];
    totalCInput.value = totalResources[2];
    if (is4) totalDInput.value = totalResources[3];

    const procCount = 3 + Math.floor(Math.random() * 3); // 3 to 5 processes
    processes = [];

    for (let i = 0; i < procCount; i++) {
        const alloc = [];
        const max = [];
        const need = [];

        for (let j = 0; j < resourceCount; j++) {
            const processMaxClaim = 1 + Math.floor(Math.random() * Math.min(6, totalResources[j] - 2));
            const allocationShare = Math.floor(Math.random() * (processMaxClaim + 1));
            
            alloc.push(allocationShare);
            max.push(processMaxClaim);
            need.push(processMaxClaim - allocationShare);
        }
        
        // Pad for index safety if 3 resources
        if (resourceCount === 3) {
            alloc.push(0);
            max.push(0);
            need.push(0);
        }

        processes.push({
            pid: 'P' + i,
            allocation: alloc,
            max,
            need
        });
    }

    // Double check sum allocations to ensure they don't exceed total resources
    for (let j = 0; j < resourceCount; j++) {
        let sumAlloc = processes.reduce((sum, p) => sum + p.allocation[j], 0);
        if (sumAlloc > totalResources[j]) {
            // Scale down allocations to make it valid
            processes.forEach(p => {
                p.allocation[j] = Math.floor(p.allocation[j] / 2);
                p.need[j] = p.max[j] - p.allocation[j];
            });
        }
    }

    originalBackup = JSON.parse(JSON.stringify(processes));
    addLog(`Randomized processes layout generated (${procCount} processes).`, 'system');

    updateSystemVectors();
    renderTable();
    populateRequestSelect();
    resetSafetyState();
}

// Calculate allocated sum and available vectors
let availableResources = [];
let allocatedSum = [];

function updateSystemVectors() {
    allocatedSum = [0, 0, 0, 0];
    availableResources = [0, 0, 0, 0];

    // Total allocated
    processes.forEach(p => {
        for (let j = 0; j < resourceCount; j++) {
            allocatedSum[j] += p.allocation[j];
        }
    });

    // Available
    let hasOverAllocation = false;
    for (let j = 0; j < resourceCount; j++) {
        availableResources[j] = totalResources[j] - allocatedSum[j];
        if (availableResources[j] < 0) {
            hasOverAllocation = true;
        }
    }

    // Draw Vector Details Card values
    const labelSlice = resourceLabels.slice(0, resourceCount);
    
    vectorTotalVal.textContent = labelSlice.map((l, j) => `${l}:${totalResources[j]}`).join(' | ');
    vectorAllocatedVal.textContent = labelSlice.map((l, j) => `${l}:${allocatedSum[j]}`).join(' | ');
    vectorAvailableVal.textContent = labelSlice.map((l, j) => `${l}:${availableResources[j]}`).join(' | ');

    availableVectorDisplay.textContent = labelSlice.map((l, j) => `${l}:${availableResources[j]}`).join(', ');

    const availCard = document.querySelector('.vector-detail-card.highlight');
    if (hasOverAllocation) {
        availCard.classList.add('error-avail');
        addLog('Warning: Sum of Allocated resources exceeds Total System Capacity!', 'unsafe');
    } else {
        availCard.classList.remove('error-avail');
    }
}

// Populate Request selector dropdown list
function populateRequestSelect() {
    requestProcessSelect.innerHTML = '';
    processes.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.pid;
        opt.textContent = p.pid;
        requestProcessSelect.appendChild(opt);
    });
    
    if (processes.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = 'None';
        requestProcessSelect.appendChild(opt);
    }
}

// Reset safety UI indicators
function resetSafetyState() {
    safetyStatus.textContent = 'UNCHECKED';
    safetyStatus.className = 'status-indicator pending';
    safeSequenceDisplay.textContent = '-';
    
    // Clear highlights on table
    const rows = matrixTableBody.querySelectorAll('tr');
    rows.forEach(r => {
        r.className = '';
    });
}

// Verify input cells on keyup/change
function onCellChange(pid, matrixType, resIndex, inputEl) {
    let val = parseInt(inputEl.value);
    if (isNaN(val) || val < 0) val = 0;
    inputEl.value = val;

    const p = processes.find(proc => proc.pid === pid);
    if (!p) return;

    if (matrixType === 'alloc') {
        p.allocation[resIndex] = val;
    } else {
        p.max[resIndex] = val;
    }

    // Recalc need
    p.need[resIndex] = p.max[resIndex] - p.allocation[resIndex];

    // Check if cell is invalid: allocation > max
    const needTd = document.getElementById(`need-${pid}-${resIndex}`);
    if (p.allocation[resIndex] > p.max[resIndex]) {
        inputEl.classList.add('invalid-cell');
        if (needTd) {
            needTd.textContent = 'Error';
            needTd.style.color = 'var(--accent-red)';
        }
    } else {
        inputEl.classList.remove('invalid-cell');
        if (needTd) {
            needTd.textContent = `${p.need[resIndex]}`;
            needTd.style.color = 'var(--accent-yellow)';
        }
    }

    // Clear validation markings across row if they got resolved
    let rowInvalid = false;
    for (let j = 0; j < resourceCount; j++) {
        if (p.allocation[j] > p.max[j]) {
            rowInvalid = true;
        }
    }

    updateSystemVectors();
    resetSafetyState();
}

// Render process tables rows
function renderTable() {
    matrixTableBody.innerHTML = '';
    if (processes.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="${2 + (resourceCount * 3)}" style="color: var(--text-muted); padding: 20px;">No processes configured. Click "Add Process" or randomize to populate.</td>`;
        matrixTableBody.appendChild(tr);
        return;
    }

    processes.forEach(p => {
        const tr = document.createElement('tr');
        tr.id = `row-${p.pid}`;
        
        let html = `<td class="process-pid">${p.pid}</td>`;
        
        // Allocation cells inputs
        for (let j = 0; j < resourceCount; j++) {
            const isInvalid = p.allocation[j] > p.max[j] ? 'invalid-cell' : '';
            html += `
                <td>
                    <input type="number" class="cell-input ${isInvalid}" value="${p.allocation[j]}" min="0" onchange="onCellChange('${p.pid}', 'alloc', ${j}, this)">
                </td>
            `;
        }

        // Max cells inputs
        for (let j = 0; j < resourceCount; j++) {
            const isInvalid = p.allocation[j] > p.max[j] ? 'invalid-cell' : '';
            html += `
                <td>
                    <input type="number" class="cell-input ${isInvalid}" value="${p.max[j]}" min="0" onchange="onCellChange('${p.pid}', 'max', ${j}, this)">
                </td>
            `;
        }

        // Need values cells (non-editable)
        for (let j = 0; j < resourceCount; j++) {
            const displayVal = p.allocation[j] > p.max[j] ? 'Error' : p.need[j];
            const color = p.allocation[j] > p.max[j] ? 'var(--accent-red)' : 'var(--accent-yellow)';
            html += `
                <td id="need-${p.pid}-${j}" class="need-val" style="color: ${color}">${displayVal}</td>
            `;
        }

        // Delete action button
        html += `
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteProcess('${p.pid}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;

        tr.innerHTML = html;
        matrixTableBody.appendChild(tr);
    });
}

// Delete process helper
window.deleteProcess = function(pid) {
    exitStepVerificationMode();
    processes = processes.filter(p => p.pid !== pid);
    originalBackup = originalBackup.filter(p => p.pid !== pid);
    
    // Rename pid to match layout order if required
    processes.forEach((p, idx) => {
        p.pid = 'P' + idx;
    });
    originalBackup.forEach((p, idx) => {
        p.pid = 'P' + idx;
    });

    addLog(`Deleted process ${pid}`, 'system');
    updateSystemVectors();
    renderTable();
    populateRequestSelect();
    resetSafetyState();
};

// Automatic safety validator check
function runAutoSafetyCheck() {
    // Basic verification checks
    let isMatrixInvalid = false;
    processes.forEach(p => {
        for (let j = 0; j < resourceCount; j++) {
            if (p.allocation[j] > p.max[j]) isMatrixInvalid = true;
        }
    });

    if (isMatrixInvalid) {
        alert('Cannot execute check: Resolve red warning cells (Allocation > Max Claim) first.');
        return;
    }

    // Check capacity sums
    for (let j = 0; j < resourceCount; j++) {
        if (availableResources[j] < 0) {
            alert('Cannot execute check: Total Allocated resources exceed capacity.');
            return;
        }
    }

    addLog('Executing Safety Verification check...', 'check');
    const result = evaluateSafetyState();
    
    if (result.safe) {
        safetyStatus.textContent = 'SAFE STATE';
        safetyStatus.className = 'status-indicator safe';
        const seqStr = `<${result.sequence.join(', ')}>`;
        safeSequenceDisplay.textContent = seqStr;
        addLog(`System Safety Proof: Success! Found Safe Sequence: ${seqStr}`, 'safe');
        
        // Highlight rows green sequentially
        result.sequence.forEach((pid, index) => {
            setTimeout(() => {
                const row = document.getElementById(`row-${pid}`);
                if (row) row.className = 'completed-row';
            }, index * 200);
        });
    } else {
        safetyStatus.textContent = 'UNSAFE STATE';
        safetyStatus.className = 'status-indicator unsafe';
        safeSequenceDisplay.textContent = 'No safe sequence exists (Potential Deadlock)';
        addLog('System Safety Proof: Failed! Deadlock hazard detected. No safe execution sequence exists.', 'unsafe');
        
        // Highlight unfinished rows red
        processes.forEach(p => {
            const row = document.getElementById(`row-${p.pid}`);
            if (row) row.className = 'active-eval'; // Highlight red evaluation state
        });
    }
}

// Helper core solver for safety state
function evaluateSafetyState() {
    let work = [...availableResources];
    let finish = processes.map(() => false);
    let sequence = [];

    let checkedThisRound = true;
    while (checkedThisRound) {
        checkedThisRound = false;

        for (let i = 0; i < processes.length; i++) {
            const p = processes[i];
            if (!finish[i]) {
                // Check if Need <= Work
                let canRun = true;
                for (let j = 0; j < resourceCount; j++) {
                    if (p.need[j] > work[j]) {
                        canRun = false;
                        break;
                    }
                }

                if (canRun) {
                    // Update Work vector
                    for (let j = 0; j < resourceCount; j++) {
                        work[j] += p.allocation[j];
                    }
                    finish[i] = true;
                    sequence.push(p.pid);
                    checkedThisRound = true;
                }
            }
        }
    }

    const safe = finish.every(f => f === true);
    return { safe, sequence };
}

// Launch Step Mode
function startStepVerificationMode() {
    // Basic verification checks
    let isMatrixInvalid = false;
    processes.forEach(p => {
        for (let j = 0; j < resourceCount; j++) {
            if (p.allocation[j] > p.max[j]) isMatrixInvalid = true;
        }
    });

    if (isMatrixInvalid) {
        alert('Cannot execute step checks: Resolve red warning cells (Allocation > Max Claim) first.');
        return;
    }

    if (processes.length === 0) {
        alert('Add processes first before executing safety checks.');
        return;
    }

    stepModeActive = true;
    stepperSection.style.display = 'block';
    startStepBtn.disabled = true;
    checkSafetyBtn.disabled = true;
    resetSimBtn.disabled = true;

    // Reset simulator table indicators
    resetSafetyState();

    // Init state machine
    stepWork = [...availableResources];
    stepFinish = processes.map(() => false);
    stepSequence = [];
    stepIndex = 0;
    stepRound = 0;

    addLog('Launched Step-by-Step Safety verification mode.', 'check');
    updateStepUI();
}

// Exit Step Mode
function exitStepVerificationMode() {
    stepModeActive = false;
    stepperSection.style.display = 'none';
    startStepBtn.disabled = false;
    checkSafetyBtn.disabled = false;
    resetSimBtn.disabled = false;

    // Clear active indicators
    const rows = matrixTableBody.querySelectorAll('tr');
    rows.forEach(r => {
        r.className = '';
    });
}

// Update Step-by-Step display bubbles
function updateStepUI() {
    const labelSlice = resourceLabels.slice(0, resourceCount);
    
    // Work bubble text
    workVectorBubble.textContent = labelSlice.map((l, j) => `${l}:${stepWork[j]}`).join(', ');

    // Finish bubbles lists
    finishBubblesContainer.innerHTML = '';
    processes.forEach((p, idx) => {
        const bubble = document.createElement('div');
        bubble.className = 'finish-bubble';
        bubble.textContent = p.pid;

        if (stepFinish[idx]) {
            bubble.classList.add('done');
        } else if (stepModeActive && idx === stepIndex) {
            bubble.classList.add('active');
        }
        finishBubblesContainer.appendChild(bubble);
    });

    // Update row highlights on table
    processes.forEach((p, idx) => {
        const row = document.getElementById(`row-${p.pid}`);
        if (row) {
            row.className = '';
            if (stepFinish[idx]) {
                row.classList.add('completed-row');
            } else if (idx === stepIndex && stepModeActive) {
                row.classList.add('active-eval');
            }
        }
    });
}

// Step logic cycle
function executeNextStep() {
    if (!stepModeActive) return;

    // Check if we have completed verification already
    const allDone = stepFinish.every(f => f === true);
    if (allDone) {
        addLog('All processes finished execution! System is SAFE.', 'safe');
        safetyStatus.textContent = 'SAFE STATE';
        safetyStatus.className = 'status-indicator safe';
        safeSequenceDisplay.textContent = `<${stepSequence.join(', ')}>`;
        exitStepVerificationMode();
        return;
    }

    const labelSlice = resourceLabels.slice(0, resourceCount);

    // Look for next satisfying process starting from stepIndex
    let found = false;
    let scanCount = 0;
    
    while (scanCount < processes.length) {
        const idx = (stepIndex + scanCount) % processes.length;
        const p = processes[idx];

        if (!stepFinish[idx]) {
            // Check if Need <= Work
            let canRun = true;
            for (let j = 0; j < resourceCount; j++) {
                if (p.need[j] > stepWork[j]) {
                    canRun = false;
                    break;
                }
            }

            if (canRun) {
                stepIndex = idx;
                found = true;
                break;
            }
        }
        scanCount++;
    }

    if (found) {
        const p = processes[stepIndex];
        const prevWork = [...stepWork];

        // Process satisfies need, run it!
        for (let j = 0; j < resourceCount; j++) {
            stepWork[j] += p.allocation[j];
        }
        stepFinish[stepIndex] = true;
        stepSequence.push(p.pid);

        addLog(`Step check P${stepIndex}: Need [${p.need.slice(0, resourceCount)}] <= Work [${prevWork.slice(0, resourceCount)}] -> TRUE. Process P${stepIndex} executes. Work becomes: [${stepWork.slice(0, resourceCount)}]`, 'process-run');
        
        // Move scanner pointer to next process
        stepIndex = (stepIndex + 1) % processes.length;
        
        updateStepUI();

        // Check if finished right away
        if (stepFinish.every(f => f === true)) {
            addLog(`Completed step proof! Found Safe Sequence: <${stepSequence.join(', ')}>`, 'safe');
            safetyStatus.textContent = 'SAFE STATE';
            safetyStatus.className = 'status-indicator safe';
            safeSequenceDisplay.textContent = `<${stepSequence.join(', ')}>`;
            setTimeout(exitStepVerificationMode, 1000);
        }
    } else {
        // We scanned all processes and none could execute
        addLog('No remaining unfinished process can be satisfied by current Work vector.', 'unsafe');
        
        const deadlockedProcs = processes
            .map((p, idx) => (!stepFinish[idx] ? p.pid : null))
            .filter(pid => pid !== null);

        addLog(`System is in an UNSAFE state (Deadlocked processes: ${deadlockedProcs.join(', ')})`, 'unsafe');
        safetyStatus.textContent = 'UNSAFE STATE';
        safetyStatus.className = 'status-indicator unsafe';
        safeSequenceDisplay.textContent = 'No safe sequence exists (Potential Deadlock)';

        // Color remaining processes bubble failed
        processes.forEach((p, idx) => {
            if (!stepFinish[idx]) {
                const bubbles = finishBubblesContainer.children;
                if (bubbles[idx]) bubbles[idx].className = 'finish-bubble failed';
                
                const row = document.getElementById(`row-${p.pid}`);
                if (row) row.className = 'active-eval'; // Red highlights
            }
        });

        nextStepBtn.disabled = true;
    }
}

// Evaluate resource allocation request
function evaluateResourceRequest() {
    const pid = requestProcessSelect.value;
    if (!pid || pid === 'None') {
        alert('Please add processes first.');
        return;
    }

    const p = processes.find(proc => proc.pid === pid);
    if (!p) return;

    const req = [
        parseInt(reqAInput.value) || 0,
        parseInt(reqBInput.value) || 0,
        parseInt(reqCInput.value) || 0,
        resourceCount === 4 ? (parseInt(reqDInput.value) || 0) : 0
    ];

    addLog(`Evaluating Request Vector [${req.slice(0, resourceCount)}] from Process ${pid}...`, 'check');

    // Check 1: Request <= Need
    for (let j = 0; j < resourceCount; j++) {
        if (req[j] > p.need[j]) {
            addLog(`Error: Process ${pid} requested more than its stated Max Need! Request A:${req[j]} > Need:${p.need[j]}`, 'unsafe');
            alert(`Error: Process ${pid} requested resources exceeding its Need vector for resource ${resourceLabels[j]}. Request rejected.`);
            return;
        }
    }

    // Check 2: Request <= Available
    for (let j = 0; j < resourceCount; j++) {
        if (req[j] > availableResources[j]) {
            addLog(`Resource Check Failed: Request exceeds currently Available vector! Request ${resourceLabels[j]}:${req[j]} > Avail:${availableResources[j]}. Process must wait.`, 'unsafe');
            alert(`Insufficient Resources: Process ${pid} must wait. Requested instances of ${resourceLabels[j]} (${req[j]}) exceed available resources (${availableResources[j]}).`);
            return;
        }
    }

    // Check 3: Pretend to allocate and run Safety check
    // Save state
    const originalAvailable = [...availableResources];
    const originalAllocation = [...p.allocation];
    const originalNeed = [...p.need];

    // Modify vectors
    for (let j = 0; j < resourceCount; j++) {
        availableResources[j] -= req[j];
        p.allocation[j] += req[j];
        p.need[j] -= req[j];
    }

    // Run solver
    const result = evaluateSafetyState();

    if (result.safe) {
        // Grant request permanently!
        addLog(`Allocation Safety dry-run: SAFE. Sequence found: <${result.sequence.join(', ')}>. Granting request permanently!`, 'safe');
        
        // Backup updated state to restore checkpoints
        originalBackup = JSON.parse(JSON.stringify(processes));
        
        // Flash row green briefly
        const row = document.getElementById(`row-${p.pid}`);
        if (row) {
            row.classList.add('flash-success');
            setTimeout(() => row.classList.remove('flash-success'), 1200);
        }

        updateSystemVectors();
        renderTable();
        alert(`Request GRANTED! The request from Process ${pid} was successfully allocated. The system remains in a safe state.`);
    } else {
        // Rollback request!
        for (let j = 0; j < resourceCount; j++) {
            availableResources[j] = originalAvailable[j];
            p.allocation[j] = originalAllocation[j];
            p.need[j] = originalNeed[j];
        }
        
        addLog(`Allocation Safety dry-run: UNSAFE. Granting request would lead to an unsafe state/deadlock. Rolling back changes. Process ${pid} must wait!`, 'unsafe');
        alert(`Request DENIED: Granting this request from Process ${pid} would compromise system safety, leading to a potential deadlock. State rolled back.`);
        
        updateSystemVectors();
        renderTable();
    }
    resetSafetyState();
}

// Export matrices to CSV file
function exportToCsv() {
    if (processes.length === 0) {
        alert('No process matrices configured to export!');
        return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Header
    const labels = resourceLabels.slice(0, resourceCount);
    const allocHdr = labels.map(l => `Alloc_${l}`).join(',');
    const maxHdr = labels.map(l => `Max_${l}`).join(',');
    const needHdr = labels.map(l => `Need_${l}`).join(',');
    
    csvContent += `PID,${allocHdr},${maxHdr},${needHdr}\n`;

    processes.forEach(p => {
        const allocStr = p.allocation.slice(0, resourceCount).join(',');
        const maxStr = p.max.slice(0, resourceCount).join(',');
        const needStr = p.need.slice(0, resourceCount).join(',');
        
        csvContent += `${p.pid},${allocStr},${maxStr},${needStr}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bankers_Algorithm_Report_${resourceCount}res.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
