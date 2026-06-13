document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let state = JSON.parse(localStorage.getItem('wellnessState')) || {
        routines: [],
        habits: [],
        goals: [],
        waterIntake: 0,
        waterGoal: 8,
        sleepHours: 0,
        exercise: null,
        lastUpdated: new Date().toDateString()
    };

    const isDarkMode = localStorage.getItem('wellnessTheme') === 'dark';

    // --- DOM Elements ---
    const themeToggle = document.getElementById('themeToggle');
    const currentDateEl = document.getElementById('currentDate');
    
    // Lists
    const routineList = document.getElementById('routineList');
    const habitList = document.getElementById('habitList');
    const goalList = document.getElementById('goalList');
    
    // Trackers
    const waterProgress = document.getElementById('waterProgress');
    const waterValue = document.getElementById('waterValue');
    const sleepHoursInput = document.getElementById('sleepHours');
    const sleepStatus = document.getElementById('sleepStatus');
    const exerciseType = document.getElementById('exerciseType');
    const exerciseDuration = document.getElementById('exerciseDuration');
    const exerciseStatus = document.getElementById('exerciseStatus');
    
    // Insights
    const wellnessScoreFill = document.getElementById('wellnessScoreFill');
    const wellnessScoreText = document.getElementById('wellnessScoreText');
    const habitCompletionText = document.getElementById('habitCompletionText');
    const routineCompletionText = document.getElementById('routineCompletionText');

    // --- Initialization ---
    const init = () => {
        // Reset daily trackers if it's a new day
        const today = new Date().toDateString();
        if (state.lastUpdated !== today) {
            state.routines.forEach(r => r.completed = false);
            state.habits.forEach(h => h.completed = false);
            state.waterIntake = 0;
            state.sleepHours = 0;
            state.exercise = null;
            state.lastUpdated = today;
            saveState();
        }

        currentDateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        if (isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
        }

        renderAll();
    };

    const saveState = () => {
        localStorage.setItem('wellnessState', JSON.stringify(state));
        updateInsights();
    };

    // --- Render Functions ---
    const renderList = (items, container, type) => {
        container.innerHTML = '';
        if(items.length === 0) {
            container.innerHTML = `<li class="task-item" style="color: var(--text-muted); justify-content: center;">No items added yet.</li>`;
            return;
        }

        items.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <label class="task-label">
                    <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleItem('${type}', '${item.id}')">
                    <span class="${item.completed ? 'completed' : ''}">${item.title}</span>
                </label>
                <button class="delete-btn" onclick="deleteItem('${type}', '${item.id}')">×</button>
            `;
            container.appendChild(li);
        });
    };

    const renderWater = () => {
        waterValue.textContent = `${state.waterIntake} / ${state.waterGoal}`;
        const degree = Math.min((state.waterIntake / state.waterGoal) * 360, 360);
        waterProgress.style.background = `conic-gradient(var(--water-color) ${degree}deg, var(--border-color) ${degree}deg)`;
    };

    const renderSleepAndExercise = () => {
        sleepHoursInput.value = state.sleepHours;
        sleepStatus.textContent = state.sleepHours > 0 ? `Recorded: ${state.sleepHours} hours` : 'Record your sleep.';
        
        if (state.exercise) {
            exerciseStatus.textContent = `Logged: ${state.exercise.duration} mins of ${state.exercise.type}`;
            exerciseType.value = '';
            exerciseDuration.value = '';
        } else {
            exerciseStatus.textContent = 'No exercise logged today.';
        }
    };

    const updateInsights = () => {
        const totalRoutines = state.routines.length;
        const completedRoutines = state.routines.filter(r => r.completed).length;
        
        const totalHabits = state.habits.length;
        const completedHabits = state.habits.filter(h => h.completed).length;

        routineCompletionText.textContent = `${completedRoutines} / ${totalRoutines}`;
        habitCompletionText.textContent = `${completedHabits} / ${totalHabits}`;

        // Calculate a simple wellness score (0-100)
        let score = 0;
        let maxScore = 0;

        // Routines & Habits weight: 50%
        if (totalRoutines + totalHabits > 0) {
            maxScore += 50;
            score += ((completedRoutines + completedHabits) / (totalRoutines + totalHabits)) * 50;
        }

        // Water weight: 20%
        maxScore += 20;
        score += Math.min((state.waterIntake / state.waterGoal), 1) * 20;

        // Sleep weight: 15% (optimal 7-9 hours)
        maxScore += 15;
        if(state.sleepHours >= 7 && state.sleepHours <= 9) score += 15;
        else if(state.sleepHours > 0) score += 7.5;

        // Exercise weight: 15%
        maxScore += 15;
        if(state.exercise) score += 15;

        const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        
        wellnessScoreFill.style.width = `${finalScore}%`;
        wellnessScoreText.textContent = `${finalScore}%`;
    };

    const renderAll = () => {
        renderList(state.routines, routineList, 'routines');
        renderList(state.habits, habitList, 'habits');
        renderList(state.goals, goalList, 'goals');
        renderWater();
        renderSleepAndExercise();
        updateInsights();
    };

    // --- Global Actions (Window level for inline handlers) ---
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

    // --- Event Listeners ---
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('wellnessTheme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('wellnessTheme', 'dark');
        }
    });

    const handleAdd = (type) => {
        const title = prompt(`Enter new ${type.slice(0, -1)}:`);
        if(title && title.trim()) {
            state[type].push({
                id: Date.now().toString(),
                title: title.trim(),
                completed: false
            });
            saveState();
            renderAll();
        }
    };

    document.getElementById('addRoutineBtn').addEventListener('click', () => handleAdd('routines'));
    document.getElementById('addHabitBtn').addEventListener('click', () => handleAdd('habits'));
    document.getElementById('addGoalBtn').addEventListener('click', () => handleAdd('goals'));

    document.getElementById('addWaterBtn').addEventListener('click', () => {
        state.waterIntake++;
        saveState();
        renderWater();
    });

    document.getElementById('removeWaterBtn').addEventListener('click', () => {
        if(state.waterIntake > 0) {
            state.waterIntake--;
            saveState();
            renderWater();
        }
    });

    document.getElementById('saveSleepBtn').addEventListener('click', () => {
        const hours = parseFloat(sleepHoursInput.value);
        if(hours >= 0) {
            state.sleepHours = hours;
            saveState();
            renderSleepAndExercise();
        }
    });

    document.getElementById('saveExerciseBtn').addEventListener('click', () => {
        const type = exerciseType.value.trim();
        const duration = parseInt(exerciseDuration.value);
        if(type && duration > 0) {
            state.exercise = { type, duration };
            saveState();
            renderSleepAndExercise();
        }
    });

    // Run Initialization
    init();
});
