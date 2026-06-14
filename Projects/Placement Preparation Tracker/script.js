document.addEventListener('DOMContentLoaded', () => {
    // Initial State
    let state = JSON.parse(localStorage.getItem('placementTrackerState')) || {
        dsa: [],
        aptitude: [],
        core: [],
        resume: [],
        mock: [],
        company: []
    };

    const isDarkMode = localStorage.getItem('placementTheme') === 'dark';

    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const currentDateEl = document.getElementById('currentDate');
    const overallProgress = document.getElementById('overallProgress');
    const overallProgressText = document.getElementById('overallProgressText');

    const lists = {
        dsa: document.getElementById('dsaList'),
        aptitude: document.getElementById('aptitudeList'),
        core: document.getElementById('coreList'),
        resume: document.getElementById('resumeList'),
        mock: document.getElementById('mockList'),
        company: document.getElementById('companyList')
    };

    // Initialization
    const init = () => {
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        if (isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
        }
        
        renderAll();
    };

    const saveState = () => {
        localStorage.setItem('placementTrackerState', JSON.stringify(state));
        updateProgress();
    };

    // Render Function
    const renderList = (category) => {
        const container = lists[category];
        const items = state[category];
        container.innerHTML = '';
        
        if (items.length === 0) {
            container.innerHTML = `<li style="color: var(--text-muted); justify-content: center;">No tasks added yet.</li>`;
            return;
        }

        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <label class="item-label">
                    <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleItem('${category}', '${item.id}')">
                    <span class="${item.completed ? 'completed' : ''}">${item.title}</span>
                </label>
                <button class="delete-btn" onclick="deleteItem('${category}', '${item.id}')">×</button>
            `;
            container.appendChild(li);
        });
    };

    const renderAll = () => {
        Object.keys(lists).forEach(category => renderList(category));
        updateProgress();
    };

    const updateProgress = () => {
        let totalItems = 0;
        let completedItems = 0;

        Object.values(state).forEach(items => {
            totalItems += items.length;
            completedItems += items.filter(i => i.completed).length;
        });

        const percentage = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
        overallProgress.style.width = `${percentage}%`;
        overallProgressText.textContent = `${percentage}% Prepared`;
    };

    // Global Functions (attached to window for inline onclick access)
    window.toggleItem = (category, id) => {
        const item = state[category].find(i => i.id === id);
        if (item) {
            item.completed = !item.completed;
            saveState();
            renderList(category);
        }
    };

    window.deleteItem = (category, id) => {
        state[category] = state[category].filter(i => i.id !== id);
        saveState();
        renderList(category);
    };

    const handleAdd = (category, placeholder) => {
        const title = prompt(`Add to ${placeholder}:`);
        if (!title || !title.trim()) return;

        state[category].push({
            id: Date.now().toString(),
            title: title.trim(),
            completed: false
        });
        saveState();
        renderList(category);
    };

    // Event Listeners
    document.getElementById('addDsaBtn').addEventListener('click', () => handleAdd('dsa', 'DSA Tracker'));
    document.getElementById('addAptitudeBtn').addEventListener('click', () => handleAdd('aptitude', 'Aptitude & Reasoning'));
    document.getElementById('addCoreBtn').addEventListener('click', () => handleAdd('core', 'Core Subjects'));
    document.getElementById('addResumeBtn').addEventListener('click', () => handleAdd('resume', 'Resume & Projects'));
    document.getElementById('addMockBtn').addEventListener('click', () => handleAdd('mock', 'Mock Interviews'));
    document.getElementById('addCompanyBtn').addEventListener('click', () => handleAdd('company', 'Company Specific'));

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('placementTheme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('placementTheme', 'dark');
        }
    });

    init();
});
