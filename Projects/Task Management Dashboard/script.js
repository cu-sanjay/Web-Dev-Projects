/**
 * Zenith Task Management Engine
 * Robust Production Architecture Lifecycle Core Core
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Core Internal Database State Structure Matrix
    let state = {
        tasks: [],
        currentFilter: 'all', // all | pending | completed
        selectedTaskID: null
    };

    // System Cache LocalStorage Hook Access Key
    const STORAGE_KEY = 'ZENITH_ENGINE_DATA_STORAGE';

    // DOM Target Nodes Cache Layer
    const DOM = {
        taskForm: document.getElementById('task-form'),
        taskTitle: document.getElementById('task-title'),
        taskDesc: document.getElementById('task-desc'),
        taskPriority: document.getElementById('task-priority'),
        taskDate: document.getElementById('task-date'),
        taskListContainer: document.getElementById('task-list-container'),
        filterButtons: document.querySelectorAll('.filter-btn'),
        viewTitle: document.getElementById('current-view-title'),
        feedCount: document.getElementById('feed-count-badge'),
        inspectorPanel: document.getElementById('inspector-panel'),
        logStream: document.getElementById('log-stream'),
        
        // Real-time Metric Counts Counter Displays
        metricTotal: document.getElementById('metric-total'),
        metricPending: document.getElementById('metric-pending'),
        metricCompleted: document.getElementById('metric-completed')
    };

    // Setup Safe Form Target Input Baseline Limiters
    const initDateLimiters = () => {
        const today = new Date().toISOString().split('T')[0];
        DOM.taskDate.min = today;
        DOM.taskDate.value = today;
    };

    // Strict Cross-Site Scripting (XSS) Sanitization Routine
    const sanitizeHTML = (rawString) => {
        if (!rawString) return '';
        const temp = document.createElement('div');
        temp.textContent = rawString;
        return temp.innerHTML;
    };

    // Format ISO Dates to Human Scaled Monospace Formats
    const formatDisplayDate = (dateString) => {
        if (!dateString) return 'No Date';
        const parts = dateString.split('-');
        if(parts.length !== 3) return dateString;
        const [year, month, day] = parts;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
    };

    // Push Action Alerts Directly to Right Logs Pipeline
    const pushSystemLog = (actionMessage) => {
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });

        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-text">${sanitizeHTML(actionMessage)}</span>
        `;

        DOM.logStream.insertBefore(logEntry, DOM.logStream.firstChild);
        
        // Prevent log element leak overflow past 50 elements
        if (DOM.logStream.children.length > 50) {
            DOM.logStream.removeChild(DOM.logStream.lastChild);
        }
    };

    // Commit State Mutation to Storage Pipeline Array
    const commitToStorage = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
        calculateEngineMetrics();
    };

    // Comprehensive Statistical Metric Counter Compilation Engine
    const calculateEngineMetrics = () => {
        const total = state.tasks.length;
        const completed = state.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        // Formatting Strings to Maintain Layout Grid Width Monospace Standard Check
        DOM.metricTotal.textContent = total < 10 ? `0${total}` : total;
        DOM.metricPending.textContent = pending < 10 ? `0${pending}` : pending;
        DOM.metricCompleted.textContent = completed < 10 ? `0${completed}` : completed;
    };

    // Target Selection Rendering Rule for the Dashboard Inspector
    const renderInspector = () => {
        if (!state.selectedTaskID) {
            DOM.inspectorPanel.innerHTML = `
                <div class="empty-inspector-state">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <p>Select or hover over a task workspace card to inspect telemetry metadata metrics.</p>
                </div>
            `;
            return;
        }

        const task = state.tasks.find(t => t.id === state.selectedTaskID);
        if (!task) {
            state.selectedTaskID = null;
            renderInspector();
            return;
        }

        DOM.inspectorPanel.innerHTML = `
            <div class="inspector-content">
                <h3 class="inspector-title">${sanitizeHTML(task.title)}</h3>
                <div class="inspector-meta-row">
                    <div class="inspector-meta-item">
                        <span class="label">System GUID</span>
                        <span class="value">${task.id.substring(2, 10).toUpperCase()}</span>
                    </div>
                    <div class="inspector-meta-item">
                        <span class="label">Priority Rating</span>
                        <span class="value priority-${task.priority}">${task.priority.toUpperCase()}</span>
                    </div>
                    <div class="inspector-meta-item">
                        <span class="label">Target Date</span>
                        <span class="value">${formatDisplayDate(task.date)}</span>
                    </div>
                    <div class="inspector-meta-item">
                        <span class="label">Status State</span>
                        <span class="value" style="color: ${task.completed ? 'var(--priority-low)' : 'var(--priority-medium)'}">
                            ${task.completed ? 'COMPLETED' : 'PENDING EXECUTION'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    };

    // Render Clean Main Filtered Task Arrays out to UI Workspace Stream Grid
    const renderTaskFeed = () => {
        DOM.taskListContainer.innerHTML = '';
        
        let filteredTasks = state.tasks.filter(task => {
            if (state.currentFilter === 'pending') return !task.completed;
            if (state.currentFilter === 'completed') return task.completed;
            return true;
        });

        // Alphabetically and conditionally order metrics by date urgency hierarchy rules
        filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

        DOM.feedCount.textContent = `${filteredTasks.length} ${filteredTasks.length === 1 ? 'item' : 'items'}`;

        if (filteredTasks.length === 0) {
            DOM.taskListContainer.innerHTML = `
                <div class="empty-inspector-state" style="height: 200px; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    <p>No actionable tasks found mapping to this workspace filter profile.</p>
                </div>
            `;
            return;
        }

        filteredTasks.forEach(task => {
            const card = document.createElement('div');
            card.className = `task-card status-${task.completed ? 'completed' : 'active'} ${state.selectedTaskID === task.id ? 'selected-inspect' : ''}`;
            card.dataset.id = task.id;

            card.innerHTML = `
                <div class="task-card-cb-wrapper">
                    <input type="checkbox" class="task-cb" ${task.completed ? 'checked' : ''} aria-label="Toggle Complete State">
                </div>
                <div class="task-card-body">
                    <div class="task-card-title">${sanitizeHTML(task.title)}</div>
                    ${task.description ? `<div class="task-card-desc">${sanitizeHTML(task.description)}</div>` : ''}
                    <div class="task-card-meta">
                        <span class="priority-tag priority-${task.priority}">${task.priority}</span>
                        <span class="task-date-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            ${formatDisplayDate(task.date)}
                        </span>
                    </div>
                </div>
                <button class="delete-btn" aria-label="Delete Target Entry Object">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            `;

            // Card Event Bindings (Selection, Dynamic Inspection Toggles)
            card.addEventListener('click', (e) => {
                if (e.target.closest('.task-cb') || e.target.closest('.delete-btn')) return;
                state.selectedTaskID = task.id;
                document.querySelectorAll('.task-card').forEach(el => el.classList.remove('selected-inspect'));
                card.classList.add('selected-inspect');
                renderInspector();
            });

            // Toggle Checkbox Executions
            const checkbox = card.querySelector('.task-cb');
            checkbox.addEventListener('change', () => {
                task.completed = checkbox.checked;
                commitToStorage();
                
                const logMsg = task.completed ? `Task closed: "${task.title}"` : `Task opened back to active backlog: "${task.title}"`;
                pushSystemLog(logMsg);
                
                // Keep smooth viewport persistence updates active without breaking layout cards
                setTimeout(() => {
                    renderTaskFeed();
                    renderInspector();
                }, 180);
            });

            // Immediate DOM Element Flusher Execution 
            const deleteBtn = card.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                state.tasks = state.tasks.filter(t => t.id !== task.id);
                if (state.selectedTaskID === task.id) state.selectedTaskID = null;
                
                pushSystemLog(`Destroyed database object allocation: "${task.title}"`);
                commitToStorage();
                renderTaskFeed();
                renderInspector();
            });

            DOM.taskListContainer.appendChild(card);
        });
    };

    // Handle Form Processing Commit Matrix Pipeline Requests
    DOM.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = DOM.taskTitle.value.trim();
        const description = DOM.taskDesc.value.trim();
        const priority = DOM.taskPriority.value;
        const date = DOM.taskDate.value;

        if (!title || !date) return;

        const newTask = {
            id: 'ZN_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
            title,
            description,
            priority,
            date,
            completed: false,
            createdTimestamp: new Date().toISOString()
        };

        state.tasks.push(newTask);
        commitToStorage();
        pushSystemLog(`Committed operational instance: "${title}"`);

        // Form fields normalization reset loop
        DOM.taskForm.reset();
        initDateLimiters();
        
        renderTaskFeed();
    });

    // Sidebar View Routing Switches Event Listener
    DOM.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.dataset.filter;
            state.currentFilter = filterValue;

            // Header mapping translation normalization updates
            if (filterValue === 'all') DOM.viewTitle.textContent = "All Tasks Matrix";
            if (filterValue === 'pending') DOM.viewTitle.textContent = "Pending Processing Queue";
            if (filterValue === 'completed') DOM.viewTitle.textContent = "Completed Archival Records";

            renderTaskFeed();
        });
    });

    // Bootstrapping Application Run Checks
    const bootEngine = () => {
        initDateLimiters();
        
        // Populate local cache vectors
        const rawCache = localStorage.getItem(STORAGE_KEY);
        if (rawCache) {
            try {
                state.tasks = JSON.parse(rawCache);
            } catch (err) {
                state.tasks = [];
                pushSystemLog("Error mounting local architecture; storage array wiped.");
            }
        }

        calculateEngineMetrics();
        renderTaskFeed();
        renderInspector();
        pushSystemLog("Zenith UI Workspace engine core operational state initiated safely.");
    };

    bootEngine();
});