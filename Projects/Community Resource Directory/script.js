document.addEventListener('DOMContentLoaded', () => {
    // State
    let resources = JSON.parse(localStorage.getItem('communityResources')) || [
        {
            id: '1',
            name: 'City General Hospital',
            category: 'Hospitals',
            address: '100 Health Way, Downtown',
            contact: '555-0100',
            hours: '24/7',
            description: 'Main public hospital offering emergency, trauma, and general healthcare services.'
        },
        {
            id: '2',
            name: 'Community Food Bank',
            category: 'NGOs',
            address: '450 Charity Lane',
            contact: '555-0200',
            hours: 'Mon-Fri 8 AM - 4 PM',
            description: 'Provides free groceries and hot meals to families in need.'
        }
    ];

    let bookmarks = JSON.parse(localStorage.getItem('communityBookmarks')) || [];
    const isDarkMode = localStorage.getItem('communityTheme') === 'dark';

    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const resourcesListEl = document.getElementById('resourcesList');
    const bookmarksListEl = document.getElementById('bookmarksList');
    const resultsCountEl = document.getElementById('resultsCount');
    
    const modal = document.getElementById('resourceModal');
    const addResourceBtn = document.getElementById('addResourceBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const resourceForm = document.getElementById('resourceForm');

    // Init Theme
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    // Save functions
    const saveState = () => {
        localStorage.setItem('communityResources', JSON.stringify(resources));
        localStorage.setItem('communityBookmarks', JSON.stringify(bookmarks));
        renderAll();
    };

    // Modal Logic
    addResourceBtn.addEventListener('click', () => modal.classList.add('active'));
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Form Submit
    resourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newRes = {
            id: Date.now().toString(),
            name: document.getElementById('resName').value.trim(),
            category: document.getElementById('resCategory').value,
            address: document.getElementById('resAddress').value.trim(),
            contact: document.getElementById('resContact').value.trim(),
            hours: document.getElementById('resHours').value.trim(),
            description: document.getElementById('resDesc').value.trim()
        };
        resources.push(newRes);
        saveState();
        modal.classList.remove('active');
        resourceForm.reset();
    });

    // Global Actions
    window.toggleBookmark = (id) => {
        if (bookmarks.includes(id)) {
            bookmarks = bookmarks.filter(bId => bId !== id);
        } else {
            bookmarks.push(id);
        }
        saveState();
    };

    window.deleteResource = (id) => {
        if (confirm('Are you sure you want to remove this resource?')) {
            resources = resources.filter(r => r.id !== id);
            bookmarks = bookmarks.filter(bId => bId !== id);
            saveState();
        }
    };

    // Rendering
    const getFilteredResources = () => {
        const term = searchInput.value.toLowerCase();
        const cat = categoryFilter.value;
        return resources.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(term) || r.description.toLowerCase().includes(term);
            const matchesCat = cat === 'All' || r.category === cat;
            return matchesSearch && matchesCat;
        });
    };

    const renderResources = () => {
        const filtered = getFilteredResources();
        resourcesListEl.innerHTML = '';
        resultsCountEl.textContent = `Resources (${filtered.length})`;

        if (filtered.length === 0) {
            resourcesListEl.innerHTML = '<p style="color:var(--text-secondary); width:100%;">No resources found.</p>';
            return;
        }

        filtered.forEach(res => {
            const isSaved = bookmarks.includes(res.id);
            const card = document.createElement('div');
            card.className = 'res-card';
            card.innerHTML = `
                <div class="res-header">
                    <div class="res-title">${res.name}</div>
                    <button class="bookmark-btn ${isSaved ? 'saved' : ''}" onclick="toggleBookmark('${res.id}')">
                        ${isSaved ? '★' : '☆'}
                    </button>
                </div>
                <div class="res-category">${res.category}</div>
                <div class="res-info">
                    <p>📍 ${res.address}</p>
                    <p>📞 ${res.contact}</p>
                    <p>🕒 ${res.hours}</p>
                </div>
                <div class="res-desc">${res.description}</div>
                <div class="res-actions">
                    <button class="btn-delete" onclick="deleteResource('${res.id}')">Delete</button>
                </div>
            `;
            resourcesListEl.appendChild(card);
        });
    };

    const renderBookmarks = () => {
        bookmarksListEl.innerHTML = '';
        if (bookmarks.length === 0) {
            bookmarksListEl.innerHTML = '<li class="empty-text">No saved resources yet.</li>';
            return;
        }

        bookmarks.forEach(id => {
            const res = resources.find(r => r.id === id);
            if (res) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${res.name}</span>
                    <button class="bookmark-btn saved" onclick="toggleBookmark('${id}')" style="font-size:1rem;">★</button>
                `;
                bookmarksListEl.appendChild(li);
            }
        });
    };

    const renderAll = () => {
        renderResources();
        renderBookmarks();
    };

    // Filter Listeners
    searchInput.addEventListener('input', renderResources);
    categoryFilter.addEventListener('change', renderResources);

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('communityTheme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('communityTheme', 'dark');
        }
    });

    // Initial Load
    renderAll();
});
