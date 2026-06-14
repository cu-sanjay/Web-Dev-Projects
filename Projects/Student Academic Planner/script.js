document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let state = JSON.parse(localStorage.getItem('academicState')) || {
        subjects: [],
        assignments: [],
        exams: [],
        goals: []
    };

    const isDarkMode = localStorage.getItem('academicTheme') === 'dark';

    // --- DOM Elements ---
    const themeToggle = document.getElementById('themeToggle');
    const currentDateEl = document.getElementById('currentDate');
    
    // Lists
    const subjectList = document.getElementById('subjectList');
    const assignmentList = document.getElementById('assignmentList');
    const examList = document.getElementById('examList');
    const goalList = document.getElementById('goalList');
    
    // Timer
    const timerDisplay = document.getElementById('timerDisplay');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    
    // Insights
    const assignmentProgressFill = document.getElementById('assignmentProgressFill');
    const assignmentProgressText = document.getElementById('assignmentProgressText');
    const examProgressFill = document.getElementById('examProgressFill');
    const examProgressText = document.getElementById('examProgressText');

    // Timer State
    let timerInterval = null;
    let timerSeconds = 25 * 60;
    let isTimerRunning = false;

    // --- Initialization ---
    const init = () => {
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        if (isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
        }

        renderAll();
    };

    const saveState = () => {
        localStorage.setItem('academicState', JSON.stringify(state));
        updateInsights();
    };

    // --- Render Functions ---
    const renderList = (items, container, type, hasDate = false) => {
        container.innerHTML = '';
        if(items.length === 0) {
            container.innerHTML = `<li style="color: var(--text-muted); justify-content: center;">No items added.</li>`;
            return;
        }

        items.forEach((item) => {
            const li = document.createElement('li');
            
            let dateHtml = '';
            if (hasDate && item.date) {
                dateHtml = `<span class="date-badge">${item.date}</span>`;
            }

            // For subjects, we don't need checkboxes
            if (type === 'subjects') {
                li.innerHTML = `
                    <div class="item-label">
                        <span>${item.title}</span>
                    </div>
                    <button class="delete-btn" onclick="deleteItem('${type}', '${item.id}')">×</button>
                `;
            } else {
                li.innerHTML = `
                    <label class="item-label">
                        <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleItem('${type}', '${item.id}')">
                        <span class="${item.completed ? 'completed' : ''}">${item.title} ${dateHtml}</span>
                    </label>
                    <button class="delete-btn" onclick="deleteItem('${type}', '${item.id}')">×</button>
                `;
            }
            container.appendChild(li);
        });
    };

    const updateInsights = () => {
        // Assignments Progress
        const totalAssignments = state.assignments.length;
        const completedAssignments = state.assignments.filter(a => a.completed).length;
        const assignmentPercentage = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
        
        assignmentProgressFill.style.width = `${assignmentPercentage}%`;
        assignmentProgressText.textContent = `${assignmentPercentage}% (${completedAssignments}/${totalAssignments})`;

        // Exams Progress (how many exams have been reviewed/completed)
        const totalExams = state.exams.length;
        const completedExams = state.exams.filter(e => e.completed).length;
        const examPercentage = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0;

        examProgressFill.style.width = `${examPercentage}%`;
        examProgressText.textContent = `${examPercentage}% prepared`;
    };

    const renderAll = () => {
        renderList(state.subjects, subjectList, 'subjects', false);
        renderList(state.assignments, assignmentList, 'assignments', true);
        renderList(state.exams, examList, 'exams', true);
        renderList(state.goals, goalList, 'goals', false);
        updateInsights();
    };

    // --- Global Actions ---
    window.toggleItem = (type, id) => {
        const item = state[type].find(i => i.id === id);
        if(item) {
            item.completed = !item.completed;
            saveState();
            renderAll();
        }
    };

    window.deleteItem = (type, id) => {
        state[type] = state[type].filter(i => i.id !== id);
        saveState();
        renderAll();
    };

    // --- Add Listeners ---
    const handleAdd = (type, askDate = false) => {
        const title = prompt(`Enter new ${type.slice(0, -1)} name:`);
        if(!title || !title.trim()) return;

        let date = null;
        if (askDate) {
            date = prompt(`Enter date/deadline for ${title} (e.g., Oct 15):`);
        }

        state[type].push({
            id: Date.now().toString(),
            title: title.trim(),
            date: date ? date.trim() : null,
            completed: false
        });
        saveState();
        renderAll();
    };

    document.getElementById('addSubjectBtn').addEventListener('click', () => handleAdd('subjects', false));
    document.getElementById('addAssignmentBtn').addEventListener('click', () => handleAdd('assignments', true));
    document.getElementById('addExamBtn').addEventListener('click', () => handleAdd('exams', true));
    document.getElementById('addGoalBtn').addEventListener('click', () => handleAdd('goals', false));

    // --- Theme Toggle ---
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('academicTheme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('academicTheme', 'dark');
        }
    });

    // --- Timer Logic ---
    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const updateTimerDisplay = () => {
        timerDisplay.textContent = formatTime(timerSeconds);
    };

    startTimerBtn.addEventListener('click', () => {
        if (isTimerRunning) {
            // Pause
            clearInterval(timerInterval);
            startTimerBtn.textContent = 'Start';
            isTimerRunning = false;
        } else {
            // Start
            if (timerSeconds === 0) timerSeconds = 25 * 60; // reset if finished
            timerInterval = setInterval(() => {
                if (timerSeconds > 0) {
                    timerSeconds--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    startTimerBtn.textContent = 'Start';
                    isTimerRunning = false;
                    alert('Pomodoro session complete! Take a break.');
                }
            }, 1000);
            startTimerBtn.textContent = 'Pause';
            isTimerRunning = true;
        }
    });

    resetTimerBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerSeconds = 25 * 60;
        updateTimerDisplay();
        startTimerBtn.textContent = 'Start';
        isTimerRunning = false;
    });

    // Run Initialization
    init();
});
