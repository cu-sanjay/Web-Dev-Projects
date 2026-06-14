// Application State
let processes = [];
let originalProcessesBackup = []; // To reset simulation cleanly
let clock = 0;
let isPlaying = false;
let simIntervalId = null;
let tickSpeed = 800; // ms per tick

// Scheduling Engine State
let activeProcess = null;
let readyQueue = [];
let blockedQueue = [];
let completedQueue = [];
let ganttTimeline = []; // Array of { tick, pid, type, color }
let contextSwitchCost = 1;
let csRemaining = 0;
let csNextProcess = null;
let cpuRunningTicks = 0;
let currentQuantumUsed = 0; // For Round Robin
let mlfqQueues = []; // Array of arrays for MLFQ
let mlfqQueuesCount = 3;
let mlfqQuanta = [2, 4, 8, 16]; // Quanta for Q0, Q1, Q2, Q3

// Process Colors Generator
const processColors = [
    'var(--p-color-1)',
    'var(--p-color-2)',
    'var(--p-color-3)',
    'var(--p-color-4)',
    'var(--p-color-5)',
    'var(--p-color-6)',
    'var(--p-color-7)',
    'var(--p-color-8)'
];

// Presets Definition
const PRESETS = {
    simple: [
        { pid: 'P1', arrivalTime: 0, burstTime: 4, priority: 3, ioStart: 0, ioDuration: 0 },
        { pid: 'P2', arrivalTime: 1, burstTime: 5, priority: 2, ioStart: 2, ioDuration: 3 },
        { pid: 'P3', arrivalTime: 3, burstTime: 3, priority: 1, ioStart: 0, ioDuration: 0 },
        { pid: 'P4', arrivalTime: 5, burstTime: 2, priority: 4, ioStart: 0, ioDuration: 0 }
    ],
    starvation: [
        { pid: 'P1', arrivalTime: 0, burstTime: 10, priority: 5, ioStart: 0, ioDuration: 0 },
        { pid: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, ioStart: 0, ioDuration: 0 },
        { pid: 'P3', arrivalTime: 2, burstTime: 4, priority: 1, ioStart: 0, ioDuration: 0 },
        { pid: 'P4', arrivalTime: 4, burstTime: 2, priority: 2, ioStart: 0, ioDuration: 0 }
    ],
    overhead: [
        { pid: 'P1', arrivalTime: 0, burstTime: 6, priority: 1, ioStart: 0, ioDuration: 0 },
        { pid: 'P2', arrivalTime: 1, burstTime: 4, priority: 1, ioStart: 0, ioDuration: 0 },
        { pid: 'P3', arrivalTime: 2, burstTime: 5, priority: 1, ioStart: 0, ioDuration: 0 }
    ],
    'io-interrupt': [
        { pid: 'P1', arrivalTime: 0, burstTime: 6, priority: 2, ioStart: 2, ioDuration: 4 },
        { pid: 'P2', arrivalTime: 2, burstTime: 4, priority: 1, ioStart: 1, ioDuration: 3 },
        { pid: 'P3', arrivalTime: 4, burstTime: 5, priority: 3, ioStart: 0, ioDuration: 0 }
    ],
    'mlfq-demo': [
        { pid: 'P1', arrivalTime: 0, burstTime: 12, priority: 1, ioStart: 0, ioDuration: 0 },
        { pid: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, ioStart: 0, ioDuration: 0 },
        { pid: 'P3', arrivalTime: 2, burstTime: 8, priority: 1, ioStart: 2, ioDuration: 3 }
    ]
};

// DOM Elements
const presetSelect = document.getElementById('presetSelect');
const algorithmSelect = document.getElementById('algorithmSelect');
const timeQuantumInput = document.getElementById('timeQuantum');
const quantumGroup = document.getElementById('quantumGroup');
const contextSwitchCostInput = document.getElementById('contextSwitchCost');
const contextSwitchGroup = document.getElementById('contextSwitchGroup');
const ageingToggle = document.getElementById('ageingToggle');
const ageingGroup = document.getElementById('ageingGroup');
const ageingThresholdInput = document.getElementById('ageingThreshold');
const ageingThresholdGroup = document.getElementById('ageingThresholdGroup');

// MLFQ DOM Inputs
const mlfqParams = document.getElementById('mlfqParams');
const mlfqQueuesCountSelect = document.getElementById('mlfqQueuesCount');
const mlfqQ0Input = document.getElementById('mlfqQ0');
const mlfqQ1Input = document.getElementById('mlfqQ1');
const mlfqQ2Input = document.getElementById('mlfqQ2');
const mlfqQ3Input = document.getElementById('mlfqQ3');
const mlfqQueuesSection = document.getElementById('mlfqQueuesSection');
const mlfqLevelsContainer = document.getElementById('mlfqLevelsContainer');

// Process Add inputs
const pArrivalInput = document.getElementById('pArrival');
const pBurstInput = document.getElementById('pBurst');
const pPriorityInput = document.getElementById('pPriority');
const pIoStartInput = document.getElementById('pIoStart');
const pIoDurationInput = document.getElementById('pIoDuration');
const addProcessBtn = document.getElementById('addProcessBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const formPriorityGroup = document.getElementById('formPriorityGroup');

// Control buttons
const playBtn = document.getElementById('playBtn');
const stepBtn = document.getElementById('stepBtn');
const resetSimBtn = document.getElementById('resetSimBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const randomizeBtn = document.getElementById('randomizeBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const clockTickSpan = document.getElementById('clockTick');

// Dashboards
const avgWaitingTimeSpan = document.getElementById('avgWaitingTime');
const avgTurnaroundTimeSpan = document.getElementById('avgTurnaroundTime');
const avgResponseTimeSpan = document.getElementById('avgResponseTime');
const cpuUtilizationSpan = document.getElementById('cpuUtilization');

// Lists & containers
const readyQueueList = document.getElementById('readyQueueList');
const readyCountSpan = document.getElementById('readyCount');
const cpuStatusSpan = document.getElementById('cpuStatus');
const cpuCore = document.getElementById('cpuCore');
const triggerIoBtn = document.getElementById('triggerIoBtn');
const blockedQueueList = document.getElementById('blockedQueueList');
const blockedCountSpan = document.getElementById('blockedCount');
const ganttTrack = document.getElementById('ganttTrack');
const ganttRuler = document.getElementById('ganttRuler');
const metricsTableBody = document.getElementById('metricsTableBody');
const logsConsole = document.getElementById('logsConsole');
const clearLogsBtn = document.getElementById('clearLogsBtn');

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadPreset('simple'); // Default startup configuration
    renderUI();
});

// Event Listeners Configuration
function setupEventListeners() {
    // Preset changes
    presetSelect.addEventListener('change', (e) => {
        if (e.target.value !== 'default') {
            loadPreset(e.target.value);
            resetSimulation();
        }
    });

    // Algorithm Change UI logic
    algorithmSelect.addEventListener('change', (e) => {
        const alg = e.target.value;
        // Show/Hide inputs depending on algorithm
        quantumGroup.style.display = (alg === 'rr') ? 'flex' : 'none';
        ageingGroup.style.display = (alg.startsWith('priority')) ? 'flex' : 'none';
        ageingThresholdGroup.style.display = (alg.startsWith('priority') && ageingToggle.checked) ? 'flex' : 'none';
        mlfqParams.style.display = (alg === 'mlfq') ? 'block' : 'none';
        mlfqQueuesSection.style.display = (alg === 'mlfq') ? 'block' : 'none';
        
        // Context switch cost is applicable to all algorithms
        contextSwitchGroup.style.display = 'flex';
        
        // Hide priority field in add process form if FCFS/SJF/RR is active
        const requiresPriority = alg.startsWith('priority');
        formPriorityGroup.style.display = requiresPriority ? 'flex' : 'none';
        
        resetSimulation();
    });

    ageingToggle.addEventListener('change', (e) => {
        ageingThresholdGroup.style.display = e.target.checked ? 'flex' : 'none';
        resetSimulation();
    });

    mlfqQueuesCountSelect.addEventListener('change', (e) => {
        mlfqQueuesCount = parseInt(e.target.value);
        if (mlfqQueuesCount === 4) {
            mlfqQ3Input.style.display = 'block';
        } else {
            mlfqQ3Input.style.display = 'none';
        }
        resetSimulation();
    });

    // Add custom process
    addProcessBtn.addEventListener('click', () => {
        const arrival = parseInt(pArrivalInput.value);
        const burst = parseInt(pBurstInput.value);
        const priority = parseInt(pPriorityInput.value);
        const ioStart = parseInt(pIoStartInput.value) || 0;
        const ioDuration = parseInt(pIoDurationInput.value) || 0;

        if (isNaN(arrival) || arrival < 0) {
            alert('Arrival Time must be a non-negative integer.');
            return;
        }
        if (isNaN(burst) || burst <= 0) {
            alert('Burst Time must be a positive integer.');
            return;
        }
        if (ioStart > 0 && ioStart >= burst) {
            alert('I/O Trigger At must be less than the Burst Time.');
            return;
        }
        if (ioStart > 0 && ioDuration <= 0) {
            alert('I/O Duration must be a positive integer if an I/O Trigger is specified.');
            return;
        }

        const newPid = 'P' + (processes.length + 1);
        const newProcess = {
            pid: newPid,
            arrivalTime: arrival,
            burstTime: burst,
            remainingTime: burst,
            priority: priority,
            ioStart: ioStart,
            ioDuration: ioDuration,
            ioDone: false,
            hasTriggeredIo: false,
            ioRemaining: 0,
            waitingTime: 0,
            turnaroundTime: 0,
            responseTime: -1,
            firstExecutionTime: -1,
            completionTime: 0,
            status: 'Pending',
            originalPriority: priority,
            color: processColors[processes.length % processColors.length],
            mlfqQueueIndex: 0,
            mlfqQueueTimeSpent: 0
        };

        processes.push(newProcess);
        originalProcessesBackup.push(JSON.parse(JSON.stringify(newProcess)));
        addLog(`Added Process ${newPid} (Arrival: ${arrival}, Burst: ${burst}, Priority: ${priority})`, 'ready');
        resetSimulation();
    });

    // Reset All Processes
    resetAllBtn.addEventListener('click', () => {
        pauseSimulation();
        processes = [];
        originalProcessesBackup = [];
        resetSimulation();
        addLog('All processes cleared.', 'system');
    });

    // Play/Pause Simulation
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseSimulation();
        } else {
            playSimulation();
        }
    });

    // Step Forward
    stepBtn.addEventListener('click', () => {
        pauseSimulation();
        simulateTick();
    });

    // Reset Clock/Simulation state
    resetSimBtn.addEventListener('click', () => {
        pauseSimulation();
        resetSimulation();
        addLog('Simulation clock reset.', 'system');
    });

    // Speed Control Slider
    speedSlider.addEventListener('input', (e) => {
        tickSpeed = parseInt(e.target.value);
        speedValue.textContent = tickSpeed + 'ms';
        if (isPlaying) {
            // Restart interval with new speed
            clearInterval(simIntervalId);
            simIntervalId = setInterval(simulateTick, tickSpeed);
        }
    });

    // Randomize
    randomizeBtn.addEventListener('click', () => {
        pauseSimulation();
        generateRandomProcesses();
        resetSimulation();
    });

    // CSV Exporter
    exportCsvBtn.addEventListener('click', () => {
        exportToCsv();
    });

    // Clear Logs
    clearLogsBtn.addEventListener('click', () => {
        logsConsole.innerHTML = '';
        addLog('Logs cleared.', 'system');
    });

    // Interactive I/O trigger
    triggerIoBtn.addEventListener('click', () => {
        if (activeProcess) {
            const ioDur = 3; // Standard interactive delay
            addLog(`Interactive interrupt: Process ${activeProcess.pid} sent to Blocked Queue (duration: ${ioDur} ticks)`, 'blocked');
            
            // Move process to Blocked
            activeProcess.status = 'Blocked';
            activeProcess.ioRemaining = ioDur;
            activeProcess.hasTriggeredIo = true; // Flag interactive I/O to avoid infinite auto I/O if configured
            blockedQueue.push(activeProcess);
            
            // Initiate context switch out
            const prevProcess = activeProcess;
            activeProcess = null;
            currentQuantumUsed = 0;

            const next = getNextScheduledProcess();
            if (next && next.pid !== prevProcess.pid) {
                if (contextSwitchCost > 0) {
                    csRemaining = contextSwitchCost;
                    csNextProcess = next;
                    addLog(`Context Switch initiated. Saving ${prevProcess.pid} state. Loading ${next.pid} state.`, 'system');
                } else {
                    activeProcess = next;
                    activeProcess.status = 'Running';
                    if (activeProcess.firstExecutionTime === -1) {
                        activeProcess.firstExecutionTime = clock;
                        activeProcess.responseTime = clock - activeProcess.arrivalTime;
                    }
                }
            }
            
            renderUI();
        }
    });
}

// Load Presets
function loadPreset(presetName) {
    pauseSimulation();
    
    // Set parameters depending on preset selection
    if (presetName === 'starvation') {
        algorithmSelect.value = 'priority';
        ageingToggle.checked = false;
        ageingThresholdGroup.style.display = 'none';
        contextSwitchCostInput.value = 0;
    } else if (presetName === 'overhead') {
        algorithmSelect.value = 'rr';
        timeQuantumInput.value = 2;
        contextSwitchCostInput.value = 2;
    } else if (presetName === 'io-interrupt') {
        algorithmSelect.value = 'srtf';
        contextSwitchCostInput.value = 1;
    } else if (presetName === 'mlfq-demo') {
        algorithmSelect.value = 'mlfq';
        mlfqQueuesCountSelect.value = 3;
        mlfqQ0Input.value = 2;
        mlfqQ1Input.value = 4;
        mlfqQ2Input.value = 8;
        contextSwitchCostInput.value = 1;
    } else {
        algorithmSelect.value = 'fcfs';
        contextSwitchCostInput.value = 1;
    }

    // Trigger algorithm select change logic to update visibility
    algorithmSelect.dispatchEvent(new Event('change'));

    // Load processes list
    const presetList = PRESETS[presetName] || PRESETS.simple;
    processes = [];
    presetList.forEach((p, idx) => {
        processes.push({
            pid: p.pid,
            arrivalTime: p.arrivalTime,
            burstTime: p.burstTime,
            remainingTime: p.burstTime,
            priority: p.priority,
            ioStart: p.ioStart,
            ioDuration: p.ioDuration,
            ioDone: false,
            hasTriggeredIo: false,
            ioRemaining: 0,
            waitingTime: 0,
            turnaroundTime: 0,
            responseTime: -1,
            firstExecutionTime: -1,
            completionTime: 0,
            status: 'Pending',
            originalPriority: p.priority,
            color: processColors[idx % processColors.length],
            mlfqQueueIndex: 0,
            mlfqQueueTimeSpent: 0
        });
    });

    originalProcessesBackup = JSON.parse(JSON.stringify(processes));
    addLog(`Loaded preset "${presetName}".`, 'system');
}

// Generate Random Processes
function generateRandomProcesses() {
    processes = [];
    const count = 4 + Math.floor(Math.random() * 3); // 4 to 6 processes
    const alg = algorithmSelect.value;

    for (let i = 0; i < count; i++) {
        const arrival = Math.floor(Math.random() * 5); // 0 to 4
        const burst = 3 + Math.floor(Math.random() * 8); // 3 to 10
        const priority = 1 + Math.floor(Math.random() * 5); // 1 to 5
        
        // 40% chance of having I/O
        let ioStart = 0;
        let ioDuration = 0;
        if (Math.random() < 0.4 && burst > 3) {
            ioStart = 1 + Math.floor(Math.random() * (burst - 2));
            ioDuration = 2 + Math.floor(Math.random() * 3);
        }

        processes.push({
            pid: 'P' + (i + 1),
            arrivalTime: arrival,
            burstTime: burst,
            remainingTime: burst,
            priority: priority,
            ioStart: ioStart,
            ioDuration: ioDuration,
            ioDone: false,
            hasTriggeredIo: false,
            ioRemaining: 0,
            waitingTime: 0,
            turnaroundTime: 0,
            responseTime: -1,
            firstExecutionTime: -1,
            completionTime: 0,
            status: 'Pending',
            originalPriority: priority,
            color: processColors[i % processColors.length],
            mlfqQueueIndex: 0,
            mlfqQueueTimeSpent: 0
        });
    }

    originalProcessesBackup = JSON.parse(JSON.stringify(processes));
    addLog(`Generated ${count} random processes.`, 'system');
}

// Play simulation
function playSimulation() {
    isPlaying = true;
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    playBtn.className = 'btn btn-warning';
    simIntervalId = setInterval(simulateTick, tickSpeed);
}

// Pause simulation
function pauseSimulation() {
    isPlaying = false;
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
    playBtn.className = 'btn btn-success';
    if (simIntervalId) {
        clearInterval(simIntervalId);
        simIntervalId = null;
    }
}

// Reset state
function resetSimulation() {
    clock = 0;
    activeProcess = null;
    readyQueue = [];
    blockedQueue = [];
    completedQueue = [];
    ganttTimeline = [];
    csRemaining = 0;
    csNextProcess = null;
    cpuRunningTicks = 0;
    currentQuantumUsed = 0;
    
    contextSwitchCost = Math.max(0, parseInt(contextSwitchCostInput.value) || 0);

    // Retrieve original inputs
    processes = JSON.parse(JSON.stringify(originalProcessesBackup));

    // Reset MLFQ queue structure
    initializeMlfqQueues();

    clockTickSpan.textContent = clock;
    renderUI();
}

// Initialize MLFQ Queue Lists
function initializeMlfqQueues() {
    mlfqQueues = [];
    mlfqQuanta = [
        parseInt(mlfqQ0Input.value) || 2,
        parseInt(mlfqQ1Input.value) || 4,
        parseInt(mlfqQ2Input.value) || 8,
        parseInt(mlfqQ3Input.value) || 16
    ];
    for (let i = 0; i < mlfqQueuesCount; i++) {
        mlfqQueues.push([]);
    }
}

// Add Log Entry to Console
function addLog(message, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = `[Tick ${clock}]`;
    
    entry.appendChild(timeSpan);
    entry.appendChild(document.createTextNode(' ' + message));
    
    logsConsole.appendChild(entry);
    logsConsole.scrollTop = logsConsole.scrollHeight;
}

// Core Scheduling loop - runs 1 clock cycle step
function simulateTick() {
    const alg = algorithmSelect.value;
    
    // 1. Process Arrivals
    processes.forEach(p => {
        if (p.arrivalTime === clock && p.status === 'Pending') {
            p.status = 'Ready';
            if (alg === 'mlfq') {
                p.mlfqQueueIndex = 0;
                p.mlfqQueueTimeSpent = 0;
                mlfqQueues[0].push(p);
                addLog(`Process ${p.pid} arrived. Placed in MLFQ Q0`, 'ready');
            } else {
                readyQueue.push(p);
                addLog(`Process ${p.pid} arrived. Placed in Ready Queue`, 'ready');
            }
        }
    });

    // 2. Handle I/O Blocked Queue updates
    const newlyReadyFromIo = [];
    for (let i = blockedQueue.length - 1; i >= 0; i--) {
        const p = blockedQueue[i];
        p.ioRemaining--;
        if (p.ioRemaining <= 0) {
            p.status = 'Ready';
            p.ioDone = true;
            blockedQueue.splice(i, 1);
            newlyReadyFromIo.push(p);
        }
    }
    
    // Sort newly ready processes by PID to ensure deterministic order, then push to Ready
    newlyReadyFromIo.sort((a, b) => a.pid.localeCompare(b.pid));
    newlyReadyFromIo.forEach(p => {
        if (alg === 'mlfq') {
            // After I/O, return to Q0 (highest priority queue)
            p.mlfqQueueIndex = 0;
            p.mlfqQueueTimeSpent = 0;
            mlfqQueues[0].push(p);
            addLog(`Process ${p.pid} completed I/O burst. Returned to MLFQ Q0`, 'ready');
        } else {
            readyQueue.push(p);
            addLog(`Process ${p.pid} completed I/O burst. Returned to Ready Queue`, 'ready');
        }
    });

    // 3. Priority Ageing (Ready states only)
    if (alg.startsWith('priority') && ageingToggle.checked) {
        const ageLimit = parseInt(ageingThresholdInput.value) || 5;
        processes.forEach(p => {
            if (p.status === 'Ready' && (!activeProcess || p.pid !== activeProcess.pid)) {
                // Increment consecutive waiting time or check total waiting
                p.waitingTime++; // Running increment for metrics
                
                // Age priority if waiting matches threshold
                if (p.waitingTime > 0 && p.waitingTime % ageLimit === 0) {
                    if (p.priority > 1) {
                        p.priority--;
                        addLog(`Starvation ageing: Process ${p.pid} priority increased to ${p.priority}`, 'ageing');
                    }
                }
            }
        });
    }

    // 4. Manage Context Switch overhead
    if (csRemaining > 0) {
        csRemaining--;
        ganttTimeline.push({
            tick: clock,
            pid: 'CS',
            type: 'cs',
            color: 'var(--accent-red)'
        });
        addLog(`CPU performing Context Switch. Ticks remaining: ${csRemaining}`, 'system');

        if (csRemaining === 0) {
            activeProcess = csNextProcess;
            csNextProcess = null;
            if (activeProcess) {
                activeProcess.status = 'Running';
                if (activeProcess.firstExecutionTime === -1) {
                    activeProcess.firstExecutionTime = clock;
                    activeProcess.responseTime = clock - activeProcess.arrivalTime;
                }
                currentQuantumUsed = 0;
                addLog(`Process ${activeProcess.pid} took CPU core.`, 'running');
            }
        }
        
        clock++;
        updateWaitingTimes();
        renderUI();
        checkSimulationEnd();
        return;
    }

    // 5. Check Active Process execution triggers (e.g. automatic I/O burst)
    if (activeProcess) {
        const timeExecuted = activeProcess.burstTime - activeProcess.remainingTime;
        if (activeProcess.ioStart > 0 && timeExecuted === activeProcess.ioStart && !activeProcess.hasTriggeredIo) {
            // Suspend and block active process
            addLog(`Interrupt: Process ${activeProcess.pid} reached I/O start time. Sent to Blocked Queue.`, 'blocked');
            activeProcess.status = 'Blocked';
            activeProcess.ioRemaining = activeProcess.ioDuration;
            activeProcess.hasTriggeredIo = true;
            blockedQueue.push(activeProcess);
            
            const prevProcess = activeProcess;
            activeProcess = null;
            currentQuantumUsed = 0;

            // Immediately switch context if necessary
            const next = getNextScheduledProcess();
            if (next && next.pid !== prevProcess.pid) {
                if (contextSwitchCost > 0) {
                    csRemaining = contextSwitchCost;
                    csNextProcess = next;
                    addLog(`Context Switch initiated.`, 'system');
                } else {
                    activeProcess = next;
                    activeProcess.status = 'Running';
                    if (activeProcess.firstExecutionTime === -1) {
                        activeProcess.firstExecutionTime = clock;
                        activeProcess.responseTime = clock - activeProcess.arrivalTime;
                    }
                }
            }
            
            // Yield tick context
            ganttTimeline.push({
                tick: clock,
                pid: 'IDLE',
                type: 'idle',
                color: 'var(--border-color)'
            });
            clock++;
            updateWaitingTimes();
            renderUI();
            checkSimulationEnd();
            return;
        }
    }

    // 6. Main Scheduler Decisions
    let nextProcess = null;

    if (alg === 'fcfs') {
        if (!activeProcess) {
            nextProcess = getNextScheduledProcess();
        } else {
            nextProcess = activeProcess;
        }
    } 
    else if (alg === 'sjf') {
        if (!activeProcess) {
            nextProcess = getNextScheduledProcess();
        } else {
            nextProcess = activeProcess;
        }
    } 
    else if (alg === 'srtf') {
        // Preemptive SJF
        nextProcess = getNextScheduledProcess();
        if (activeProcess && nextProcess && nextProcess.pid !== activeProcess.pid) {
            addLog(`Preemption: Process ${nextProcess.pid} has shorter remaining burst (${nextProcess.remainingTime}) than active ${activeProcess.pid} (${activeProcess.remainingTime}).`, 'preempt');
            // Put active back in Ready Queue
            activeProcess.status = 'Ready';
            readyQueue.push(activeProcess);
            activeProcess = null;
        } else if (activeProcess) {
            nextProcess = activeProcess;
        }
    } 
    else if (alg === 'priority') {
        if (!activeProcess) {
            nextProcess = getNextScheduledProcess();
        } else {
            nextProcess = activeProcess;
        }
    } 
    else if (alg === 'priority-preemptive') {
        nextProcess = getNextScheduledProcess();
        if (activeProcess && nextProcess && nextProcess.priority < activeProcess.priority) {
            addLog(`Preemption: Process ${nextProcess.pid} has higher priority (${nextProcess.priority}) than active ${activeProcess.pid} (${activeProcess.priority}).`, 'preempt');
            activeProcess.status = 'Ready';
            readyQueue.push(activeProcess);
            activeProcess = null;
        } else if (activeProcess) {
            nextProcess = activeProcess;
        }
    } 
    else if (alg === 'rr') {
        const quantum = parseInt(timeQuantumInput.value) || 2;
        if (!activeProcess) {
            nextProcess = getNextScheduledProcess();
            currentQuantumUsed = 0;
        } else {
            currentQuantumUsed++;
            if (currentQuantumUsed >= quantum && activeProcess.remainingTime > 0) {
                // Quantum expired
                nextProcess = getNextScheduledProcess();
                if (nextProcess && nextProcess.pid !== activeProcess.pid) {
                    addLog(`Quantum expired for ${activeProcess.pid}. Performing preemption.`, 'preempt');
                    activeProcess.status = 'Ready';
                    readyQueue.push(activeProcess);
                    activeProcess = null;
                    currentQuantumUsed = 0;
                } else {
                    // No other process ready, continue executing active
                    nextProcess = activeProcess;
                    currentQuantumUsed = 0;
                    addLog(`Quantum expired for ${activeProcess.pid}, but no other ready processes. Continuing execution.`, 'system');
                }
            } else {
                nextProcess = activeProcess;
            }
        }
    } 
    else if (alg === 'mlfq') {
        // Multi-Level Feedback Queue
        nextProcess = getNextScheduledProcess();
        
        if (activeProcess) {
            // Check if high-priority process arrived in higher queue
            if (nextProcess && nextProcess.mlfqQueueIndex < activeProcess.mlfqQueueIndex) {
                addLog(`Preemption: Process ${nextProcess.pid} in higher queue (Q${nextProcess.mlfqQueueIndex}) preempts active ${activeProcess.pid} (Q${activeProcess.mlfqQueueIndex})`, 'preempt');
                activeProcess.status = 'Ready';
                mlfqQueues[activeProcess.mlfqQueueIndex].push(activeProcess);
                activeProcess = null;
            } else {
                // Check if current quantum in its current queue has expired
                const currentTierQuantum = mlfqQuanta[activeProcess.mlfqQueueIndex];
                activeProcess.mlfqQueueTimeSpent++;
                
                if (activeProcess.mlfqQueueTimeSpent >= currentTierQuantum) {
                    // Demote if possible
                    const currentTier = activeProcess.mlfqQueueIndex;
                    const nextTier = Math.min(mlfqQueuesCount - 1, currentTier + 1);
                    
                    activeProcess.status = 'Ready';
                    activeProcess.mlfqQueueIndex = nextTier;
                    activeProcess.mlfqQueueTimeSpent = 0;
                    
                    if (currentTier !== nextTier) {
                        addLog(`Quantum expired. Demoting ${activeProcess.pid} from Q${currentTier} to Q${nextTier}`, 'preempt');
                    } else {
                        addLog(`Quantum expired for ${activeProcess.pid} at lowest queue level. Re-queued at Q${nextTier}`, 'preempt');
                    }
                    
                    mlfqQueues[nextTier].push(activeProcess);
                    activeProcess = null;
                    nextProcess = getNextScheduledProcess();
                } else {
                    nextProcess = activeProcess;
                }
            }
        }
    }

    // 7. Context switch trigger on dispatching new process
    if (nextProcess && (!activeProcess || nextProcess.pid !== activeProcess.pid)) {
        if (contextSwitchCost > 0) {
            csRemaining = contextSwitchCost;
            csNextProcess = nextProcess;
            
            // Remove from ready queues
            if (alg === 'mlfq') {
                const qIdx = nextProcess.mlfqQueueIndex;
                const idx = mlfqQueues[qIdx].indexOf(nextProcess);
                if (idx > -1) mlfqQueues[qIdx].splice(idx, 1);
            } else {
                const idx = readyQueue.indexOf(nextProcess);
                if (idx > -1) readyQueue.splice(idx, 1);
            }

            addLog(`Context Switch initiated. Dispatching ${nextProcess.pid}.`, 'system');
            
            ganttTimeline.push({
                tick: clock,
                pid: 'CS',
                type: 'cs',
                color: 'var(--accent-red)'
            });
            
            clock++;
            updateWaitingTimes();
            renderUI();
            checkSimulationEnd();
            return;
        } else {
            // Direct allocation (zero cost switch)
            if (alg === 'mlfq') {
                const qIdx = nextProcess.mlfqQueueIndex;
                const idx = mlfqQueues[qIdx].indexOf(nextProcess);
                if (idx > -1) mlfqQueues[qIdx].splice(idx, 1);
            } else {
                const idx = readyQueue.indexOf(nextProcess);
                if (idx > -1) readyQueue.splice(idx, 1);
            }
            activeProcess = nextProcess;
            activeProcess.status = 'Running';
            activeProcess.mlfqQueueTimeSpent = 0;
            if (activeProcess.firstExecutionTime === -1) {
                activeProcess.firstExecutionTime = clock;
                activeProcess.responseTime = clock - activeProcess.arrivalTime;
            }
            currentQuantumUsed = 0;
            addLog(`Process ${activeProcess.pid} scheduled.`, 'running');
        }
    } else if (nextProcess && activeProcess && nextProcess.pid === activeProcess.pid) {
        // Continue executing active process
        // Clean up from queues if it was selected and wasn't running (already cleaned up)
    }

    // 8. Clock execution tick
    if (activeProcess) {
        activeProcess.remainingTime--;
        cpuRunningTicks++;
        
        ganttTimeline.push({
            tick: clock,
            pid: activeProcess.pid,
            type: 'executing',
            color: activeProcess.color
        });

        addLog(`Executing ${activeProcess.pid}. Remaining burst: ${activeProcess.remainingTime}`, 'running');

        // Check if finished
        if (activeProcess.remainingTime === 0) {
            activeProcess.status = 'Completed';
            activeProcess.completionTime = clock + 1; // It finishes AT the end of this tick
            activeProcess.turnaroundTime = activeProcess.completionTime - activeProcess.arrivalTime;
            activeProcess.waitingTime = activeProcess.turnaroundTime - activeProcess.burstTime - (activeProcess.hasTriggeredIo ? activeProcess.ioDuration : 0);
            
            // Ensure waiting time isn't calculated as negative due to I/O overlap adjustments
            if (activeProcess.waitingTime < 0) activeProcess.waitingTime = 0;
            
            completedQueue.push(activeProcess);
            addLog(`Process ${activeProcess.pid} completed execution.`, 'completed');
            
            activeProcess = null;
            currentQuantumUsed = 0;
        }
    } else {
        // IDLE Tick
        ganttTimeline.push({
            tick: clock,
            pid: 'IDLE',
            type: 'idle',
            color: 'var(--border-color)'
        });
        addLog('CPU core is idle.', 'system');
    }

    clock++;
    updateWaitingTimes();
    renderUI();
    checkSimulationEnd();
}

// Increment waiting times for all processes currently waiting in ready queues
function updateWaitingTimes() {
    const alg = algorithmSelect.value;
    
    if (alg === 'mlfq') {
        mlfqQueues.forEach(queue => {
            queue.forEach(p => {
                p.waitingTime++;
            });
        });
    } else {
        readyQueue.forEach(p => {
            p.waitingTime++;
        });
    }
}

// Retrieve next process based on Algorithm parameters
function getNextScheduledProcess() {
    const alg = algorithmSelect.value;

    if (alg === 'fcfs') {
        if (readyQueue.length === 0) return null;
        // FCFS selects the first process that entered the ready queue
        return readyQueue[0];
    }
    
    if (alg === 'sjf') {
        if (readyQueue.length === 0) return null;
        // Non-preemptive shortest job first
        let shortest = readyQueue[0];
        for (let i = 1; i < readyQueue.length; i++) {
            if (readyQueue[i].burstTime < shortest.burstTime) {
                shortest = readyQueue[i];
            } else if (readyQueue[i].burstTime === shortest.burstTime) {
                // Tie breaker: Arrival Time, then PID
                if (readyQueue[i].arrivalTime < shortest.arrivalTime) {
                    shortest = readyQueue[i];
                } else if (readyQueue[i].arrivalTime === shortest.arrivalTime) {
                    if (readyQueue[i].pid.localeCompare(shortest.pid) < 0) {
                        shortest = readyQueue[i];
                    }
                }
            }
        }
        return shortest;
    }
    
    if (alg === 'srtf') {
        // Gather candidates: All ready processes + active process (if any)
        const candidates = [...readyQueue];
        if (activeProcess) candidates.push(activeProcess);
        
        if (candidates.length === 0) return null;

        let shortest = candidates[0];
        candidates.forEach(c => {
            if (c.remainingTime < shortest.remainingTime) {
                shortest = c;
            } else if (c.remainingTime === shortest.remainingTime) {
                if (c.arrivalTime < shortest.arrivalTime) {
                    shortest = c;
                } else if (c.arrivalTime === shortest.arrivalTime) {
                    if (c.pid.localeCompare(shortest.pid) < 0) {
                        shortest = c;
                    }
                }
            }
        });
        return shortest;
    }
    
    if (alg === 'priority') {
        if (readyQueue.length === 0) return null;
        let highest = readyQueue[0];
        readyQueue.forEach(p => {
            if (p.priority < highest.priority) { // Lower number = Higher priority
                highest = p;
            } else if (p.priority === highest.priority) {
                if (p.arrivalTime < highest.arrivalTime) {
                    highest = p;
                }
            }
        });
        return highest;
    }
    
    if (alg === 'priority-preemptive') {
        const candidates = [...readyQueue];
        if (activeProcess) candidates.push(activeProcess);
        
        if (candidates.length === 0) return null;

        let highest = candidates[0];
        candidates.forEach(c => {
            if (c.priority < highest.priority) {
                highest = c;
            } else if (c.priority === highest.priority) {
                if (c.arrivalTime < highest.arrivalTime) {
                    highest = c;
                }
            }
        });
        return highest;
    }
    
    if (alg === 'rr') {
        if (readyQueue.length === 0) return null;
        return readyQueue[0];
    }
    
    if (alg === 'mlfq') {
        // Scan queues from Q0 down to lowest level
        for (let q = 0; q < mlfqQueuesCount; q++) {
            if (mlfqQueues[q].length > 0) {
                return mlfqQueues[q][0];
            }
        }
        return null;
    }

    return null;
}

// Check if all processes are finished
function checkSimulationEnd() {
    const allCompleted = processes.every(p => p.status === 'Completed');
    if (allCompleted && isPlaying) {
        pauseSimulation();
        addLog('All processes completed execution successfully.', 'completed');
        renderUI();
    }
}

// Calculate Telemetry metrics
function calculateMetrics() {
    const completed = processes.filter(p => p.status === 'Completed');
    
    if (completed.length === 0) {
        avgWaitingTimeSpan.textContent = '0.00';
        avgTurnaroundTimeSpan.textContent = '0.00';
        avgResponseTimeSpan.textContent = '0.00';
        cpuUtilizationSpan.textContent = '0%';
        return;
    }

    const totalWaiting = completed.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalTurnaround = completed.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const totalResponse = completed.reduce((sum, p) => sum + (p.responseTime >= 0 ? p.responseTime : 0), 0);

    const avgWaiting = totalWaiting / completed.length;
    const avgTurnaround = totalTurnaround / completed.length;
    const avgResponse = totalResponse / completed.length;

    avgWaitingTimeSpan.textContent = avgWaiting.toFixed(2);
    avgTurnaroundTimeSpan.textContent = avgTurnaround.toFixed(2);
    avgResponseTimeSpan.textContent = avgResponse.toFixed(2);

    if (clock > 0) {
        const util = (cpuRunningTicks / clock) * 100;
        cpuUtilizationSpan.textContent = Math.round(util) + '%';
    } else {
        cpuUtilizationSpan.textContent = '0%';
    }
}

// Render dynamic UI parts
function renderUI() {
    clockTickSpan.textContent = clock;
    calculateMetrics();

    const alg = algorithmSelect.value;

    // Render Queues lists
    renderReadyQueue();
    renderCpuCore();
    renderBlockedQueue();
    
    if (alg === 'mlfq') {
        renderMlfqQueues();
    }

    renderGanttChart();
    renderMetricsTable();
}

function renderReadyQueue() {
    const alg = algorithmSelect.value;
    if (alg === 'mlfq') {
        // Handled in MLFQ visual section instead
        readyCountSpan.textContent = mlfqQueues.reduce((sum, q) => sum + q.length, 0);
        readyQueueList.innerHTML = '<div class="empty-state">Multi-Level Feedback Queues are shown below</div>';
        return;
    }

    readyCountSpan.textContent = readyQueue.length;
    if (readyQueue.length === 0) {
        readyQueueList.innerHTML = '<div class="empty-state">No ready processes</div>';
        return;
    }

    readyQueueList.innerHTML = '';
    readyQueue.forEach(p => {
        const card = document.createElement('div');
        card.className = 'process-card';
        card.style.setProperty('--p-color', p.color);
        
        card.innerHTML = `
            <div class="process-info">
                <div class="pid-tag">
                    <span class="pid-color-dot" style="background-color: ${p.color}"></span>
                    ${p.pid}
                </div>
                <div class="process-subinfo">
                    <span>Arr: <strong>${p.arrivalTime}</strong></span>
                    <span>Burst: <strong>${p.burstTime}</strong></span>
                    ${alg.startsWith('priority') ? `<span>Pri: <strong>${p.priority}</strong></span>` : ''}
                </div>
            </div>
            <div class="process-stats-bubble">
                Rem: ${p.remainingTime}t
            </div>
        `;
        readyQueueList.appendChild(card);
    });
}

function renderCpuCore() {
    if (csRemaining > 0) {
        cpuStatusSpan.textContent = 'SWITCHING';
        cpuStatusSpan.className = 'status-indicator preempt';
        
        cpuCore.innerHTML = `
            <div class="cpu-active-process">
                <div class="cpu-pid" style="color: var(--accent-red)">SWITCHING</div>
                <div class="progress-ring-container">
                    <i class="fa-solid fa-arrows-spin fa-spin" style="font-size: 3rem; color: var(--accent-red); margin-top: 10px;"></i>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary)">Saving Context...</div>
            </div>
        `;
        triggerIoBtn.disabled = true;
        return;
    }

    if (!activeProcess) {
        cpuStatusSpan.textContent = 'IDLE';
        cpuStatusSpan.className = 'status-indicator idle';
        cpuCore.innerHTML = '<div class="empty-state">CPU is currently idle</div>';
        triggerIoBtn.disabled = true;
        return;
    }

    cpuStatusSpan.textContent = 'RUNNING';
    cpuStatusSpan.className = 'status-indicator running';
    triggerIoBtn.disabled = false;

    // Calculate circular progress
    const executed = activeProcess.burstTime - activeProcess.remainingTime;
    const progressPercent = Math.min(100, Math.round((executed / activeProcess.burstTime) * 100));
    
    // Progress Ring configurations (Radius = 40, Circumference = 2 * PI * 40 = 251.2)
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    cpuCore.innerHTML = `
        <div class="cpu-active-process" style="--p-color: ${activeProcess.color}">
            <div class="cpu-pid">${activeProcess.pid}</div>
            <div class="progress-ring-container">
                <svg class="progress-ring" width="100" height="100">
                    <circle class="progress-ring__circle" stroke="${activeProcess.color}" stroke-width="6" fill="transparent" r="${radius}" cx="50" cy="50" style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset};"></circle>
                </svg>
                <div class="progress-text">${progressPercent}%</div>
            </div>
            <div class="cpu-metrics">
                <div class="cpu-metrics-item">
                    Burst
                    <span>${activeProcess.burstTime}t</span>
                </div>
                <div class="cpu-metrics-item">
                    Rem.
                    <span>${activeProcess.remainingTime}t</span>
                </div>
                <div class="cpu-metrics-item">
                    Priority
                    <span>${activeProcess.priority}</span>
                </div>
            </div>
        </div>
    `;
}

function renderBlockedQueue() {
    blockedCountSpan.textContent = blockedQueue.length;
    if (blockedQueue.length === 0) {
        blockedQueueList.innerHTML = '<div class="empty-state">No blocked processes</div>';
        return;
    }

    blockedQueueList.innerHTML = '';
    blockedQueue.forEach(p => {
        const card = document.createElement('div');
        card.className = 'process-card';
        card.style.setProperty('--p-color', p.color);
        
        card.innerHTML = `
            <div class="process-info">
                <div class="pid-tag">
                    <span class="pid-color-dot" style="background-color: ${p.color}"></span>
                    ${p.pid}
                </div>
                <div class="process-subinfo">
                    <span>I/O Remaining: <strong>${p.ioRemaining} ticks</strong></span>
                </div>
            </div>
            <div class="process-stats-bubble" style="color: var(--accent-orange)">
                <i class="fa-solid fa-clock-rotate-left"></i> ${p.ioRemaining}s
            </div>
        `;
        blockedQueueList.appendChild(card);
    });
}

function renderMlfqQueues() {
    mlfqLevelsContainer.innerHTML = '';
    for (let q = 0; q < mlfqQueuesCount; q++) {
        const lane = document.createElement('div');
        lane.className = 'mlfq-level-lane';
        
        const info = document.createElement('div');
        info.className = 'mlfq-level-info';
        
        info.innerHTML = `
            <div class="mlfq-level-title">Queue Q${q}</div>
            <div class="mlfq-level-quanta">Quantum: <strong>${mlfqQuanta[q]}t</strong></div>
        `;
        
        const list = document.createElement('div');
        list.className = 'mlfq-level-list';
        
        const queueProcesses = mlfqQueues[q];
        if (queueProcesses.length === 0) {
            list.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">Empty</span>';
        } else {
            queueProcesses.forEach(p => {
                const miniCard = document.createElement('div');
                miniCard.className = 'process-card';
                miniCard.style.setProperty('--p-color', p.color);
                miniCard.innerHTML = `
                    <div class="pid-tag">
                        <span class="pid-color-dot" style="background-color: ${p.color}"></span>
                        ${p.pid} (R:${p.remainingTime})
                    </div>
                `;
                list.appendChild(miniCard);
            });
        }
        
        lane.appendChild(info);
        lane.appendChild(list);
        mlfqLevelsContainer.appendChild(lane);
    }
}

function renderGanttChart() {
    if (ganttTimeline.length === 0) {
        ganttTrack.innerHTML = '<div class="empty-state">Simulation has not started yet</div>';
        ganttRuler.innerHTML = '';
        return;
    }

    ganttTrack.innerHTML = '';
    ganttRuler.innerHTML = '';

    // Group matching timeline blocks together
    const groupedBlocks = [];
    let currentBlock = null;

    ganttTimeline.forEach((item, index) => {
        if (!currentBlock || currentBlock.pid !== item.pid) {
            if (currentBlock) {
                groupedBlocks.push(currentBlock);
            }
            currentBlock = {
                pid: item.pid,
                type: item.type,
                color: item.color,
                start: index,
                duration: 1
            };
        } else {
            currentBlock.duration++;
        }
    });
    if (currentBlock) {
        groupedBlocks.push(currentBlock);
    }

    // Dynamic rendering of block items
    const minWidthPerTick = 25; // pixels
    
    // Render Gantt Track Blocks
    groupedBlocks.forEach((block, index) => {
        const div = document.createElement('div');
        div.className = `gantt-block ${block.type}-block`;
        
        const width = block.duration * minWidthPerTick;
        div.style.width = width + 'px';
        
        const inner = document.createElement('div');
        inner.className = 'gantt-block-inner';
        if (block.type === 'executing') {
            inner.style.background = `linear-gradient(135deg, ${block.color} 0%, hsla(224, 30%, 15%, 0.8) 150%)`;
            inner.style.borderColor = block.color;
            inner.textContent = block.pid;
        } else if (block.type === 'cs') {
            inner.textContent = 'CS';
        } else {
            inner.textContent = 'IDLE';
        }
        
        div.appendChild(inner);

        // Add timestamps
        const startSpan = document.createElement('span');
        startSpan.className = 'gantt-block-start-label';
        startSpan.textContent = block.start;
        div.appendChild(startSpan);

        if (index === groupedBlocks.length - 1) {
            const endSpan = document.createElement('span');
            endSpan.className = 'gantt-block-end-label';
            endSpan.textContent = block.start + block.duration;
            div.appendChild(endSpan);
        }

        ganttTrack.appendChild(div);
    });

    // Render Ruler Tick numbers
    for (let i = 0; i <= ganttTimeline.length; i++) {
        const tick = document.createElement('div');
        tick.className = 'gantt-ruler-tick';
        tick.style.width = minWidthPerTick + 'px';
        tick.textContent = i;
        ganttRuler.appendChild(tick);
    }
}

function renderMetricsTable() {
    metricsTableBody.innerHTML = '';
    processes.forEach(p => {
        const tr = document.createElement('tr');
        
        let ioInfo = 'None';
        if (p.ioStart > 0) {
            ioInfo = `At ${p.ioStart}t for ${p.ioDuration}t`;
        }

        const rt = p.responseTime >= 0 ? `${p.responseTime}t` : '-';
        const tt = p.status === 'Completed' ? `${p.turnaroundTime}t` : '-';
        const wt = p.status === 'Completed' ? `${p.waitingTime}t` : '-';

        let statusClass = p.status.toLowerCase();

        tr.innerHTML = `
            <td>
                <div class="table-pid">
                    <span class="table-pid-dot" style="background-color: ${p.color}"></span>
                    ${p.pid}
                </div>
            </td>
            <td>${p.arrivalTime}t</td>
            <td>${p.burstTime}t</td>
            <td>${p.originalPriority}</td>
            <td>${ioInfo}</td>
            <td>${p.remainingTime}t</td>
            <td>${rt}</td>
            <td>${tt}</td>
            <td>${wt}</td>
            <td><span class="status-badge ${statusClass}">${p.status}</span></td>
            <td>
                <button class="btn btn-sm btn-danger delete-btn" onclick="deleteProcess('${p.pid}')" ${p.status !== 'Pending' && p.status !== 'Ready' ? 'disabled' : ''}>
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        metricsTableBody.appendChild(tr);
    });
}

// Delete process helper
window.deleteProcess = function(pid) {
    pauseSimulation();
    processes = processes.filter(p => p.pid !== pid);
    originalProcessesBackup = originalProcessesBackup.filter(p => p.pid !== pid);
    
    // Recolor remainders
    processes.forEach((p, idx) => {
        p.color = processColors[idx % processColors.length];
    });
    originalProcessesBackup.forEach((p, idx) => {
        p.color = processColors[idx % processColors.length];
    });

    addLog(`Deleted process ${pid}`, 'system');
    resetSimulation();
};

// Export metrics to CSV format
function exportToCsv() {
    const completed = processes.filter(p => p.status === 'Completed');
    if (completed.length === 0) {
        alert('No completed process data to export. Run the simulation to completion first!');
        return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'PID,Arrival Time,Burst Time,Priority,Response Time,Turnaround Time,Waiting Time,Completion Time\n';

    completed.forEach(p => {
        const row = [
            p.pid,
            p.arrivalTime,
            p.burstTime,
            p.originalPriority,
            p.responseTime,
            p.turnaroundTime,
            p.waitingTime,
            p.completionTime
        ].join(',');
        csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SchedOS_Report_${algorithmSelect.value}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
