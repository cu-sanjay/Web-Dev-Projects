document.addEventListener('DOMContentLoaded', () => {
    // State management
    let issues = JSON.parse(localStorage.getItem('civicIssues')) || [];
    const isDarkMode = localStorage.getItem('civicTheme') === 'dark';

    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const issueForm = document.getElementById('issueForm');
    const issuesListEl = document.getElementById('issuesList');
    const searchInput = document.getElementById('searchIssue');
    const filterStatusSelect = document.getElementById('filterStatus');

    // Stats Elements
    const totalEl = document.getElementById('totalIssues');
    const pendingEl = document.getElementById('pendingIssues');
    const resolvedEl = document.getElementById('resolvedIssues');

    // Init Theme
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    // Save & Render
    const saveIssues = () => {
        localStorage.setItem('civicIssues', JSON.stringify(issues));
        renderDashboard();
    };

    // Format Date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Form Submit Handler
    issueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newIssue = {
            id: Date.now().toString(),
            title: document.getElementById('issueTitle').value.trim(),
            category: document.getElementById('issueCategory').value,
            location: document.getElementById('issueLocation').value.trim(),
            priority: document.getElementById('issuePriority').value,
            description: document.getElementById('issueDescription').value.trim(),
            status: 'Pending',
            date: new Date().toISOString()
        };

        issues.unshift(newIssue); // Add to top
        saveIssues();
        issueForm.reset();
    });

    // Render Issues
    const renderIssuesList = (filteredIssues) => {
        issuesListEl.innerHTML = '';

        if (filteredIssues.length === 0) {
            issuesListEl.innerHTML = `<div class="empty-state">No issues found matching your criteria.</div>`;
            return;
        }

        filteredIssues.forEach(issue => {
            const card = document.createElement('div');
            card.className = 'issue-card';
            
            card.innerHTML = `
                <div class="issue-header">
                    <div class="issue-title">${issue.title}</div>
                    <span class="badge badge-priority-${issue.priority}">${issue.priority}</span>
                </div>
                <div class="issue-meta">
                    <span>📍 ${issue.location}</span>
                    <span>🏷️ ${issue.category}</span>
                    <span>🕒 ${formatDate(issue.date)}</span>
                </div>
                <div class="issue-desc">${issue.description}</div>
                <div class="issue-actions">
                    <select class="status-select" onchange="updateStatus('${issue.id}', this.value)">
                        <option value="Pending" ${issue.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${issue.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${issue.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="Closed" ${issue.status === 'Closed' ? 'selected' : ''}>Closed</option>
                    </select>
                    <button class="btn-delete" onclick="deleteIssue('${issue.id}')">Delete</button>
                </div>
            `;
            issuesListEl.appendChild(card);
        });
    };

    // Global Action Handlers
    window.updateStatus = (id, newStatus) => {
        const issue = issues.find(i => i.id === id);
        if (issue) {
            issue.status = newStatus;
            saveIssues();
        }
    };

    window.deleteIssue = (id) => {
        if (confirm('Are you sure you want to delete this issue record?')) {
            issues = issues.filter(i => i.id !== id);
            saveIssues();
        }
    };

    // Search and Filter logic
    const getFilteredIssues = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = filterStatusSelect.value;

        return issues.filter(issue => {
            const matchesSearch = issue.title.toLowerCase().includes(searchTerm) || 
                                  issue.description.toLowerCase().includes(searchTerm) ||
                                  issue.location.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    };

    // Update Dashboard (Stats & List)
    const renderDashboard = () => {
        // Update Stats
        totalEl.textContent = issues.length;
        pendingEl.textContent = issues.filter(i => i.status === 'Pending').length;
        resolvedEl.textContent = issues.filter(i => i.status === 'Resolved').length;

        // Render List based on filters
        renderIssuesList(getFilteredIssues());
    };

    // Filter Listeners
    searchInput.addEventListener('input', () => renderIssuesList(getFilteredIssues()));
    filterStatusSelect.addEventListener('change', () => renderIssuesList(getFilteredIssues()));

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('civicTheme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('civicTheme', 'dark');
        }
    });

    // Initial Render
    renderDashboard();
});
