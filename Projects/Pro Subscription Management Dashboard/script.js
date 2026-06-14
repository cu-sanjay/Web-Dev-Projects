document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let subscriptions = JSON.parse(localStorage.getItem('sm_subs')) || [];
    
    if (subscriptions.length === 0) {
        subscriptions = [
            { id: '1', name: 'Netflix', cost: 15.49, cycle: 'Monthly', category: 'Streaming Services', date: getFutureDate(5), notes: 'Family Plan' },
            { id: '2', name: 'Spotify', cost: 9.99, cycle: 'Monthly', category: 'Music Platforms', date: getFutureDate(12), notes: '' },
            { id: '3', name: 'Adobe CC', cost: 54.99, cycle: 'Monthly', category: 'Productivity Tools', date: getFutureDate(2), notes: 'Work' },
            { id: '4', name: 'Amazon Prime', cost: 139.00, cycle: 'Yearly', category: 'Streaming Services', date: getFutureDate(45), notes: 'Annual renewal' }
        ];
        saveData();
    }

    // --- DOM Elements ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    const themeToggle = document.getElementById('themeToggle');
    
    const subsGrid = document.getElementById('subsGrid');
    const upcomingList = document.getElementById('upcomingList');
    const categoryBars = document.getElementById('categoryBars');
    const insightsContainer = document.getElementById('insightsContainer');
    
    const searchInput = document.getElementById('searchInput');
    const filterCategory = document.getElementById('filterCategory');
    const sortOption = document.getElementById('sortOption');

    const subModal = document.getElementById('subModal');
    const subForm = document.getElementById('subForm');
    const addBtn = document.getElementById('addBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');

    // --- Initialization ---
    const savedTheme = localStorage.getItem('sm_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    function getFutureDate(daysOut) {
        const d = new Date();
        d.setDate(d.getDate() + daysOut);
        return d.toISOString().split('T')[0];
    }

    function calculateMonthlyCost(cost, cycle) {
        if (cycle === 'Yearly') return cost / 12;
        if (cycle === 'Weekly') return cost * 4.33;
        return cost;
    }

    function calculateAnnualCost(cost, cycle) {
        if (cycle === 'Monthly') return cost * 12;
        if (cycle === 'Weekly') return cost * 52;
        return cost;
    }

    function formatCurrency(num) {
        return '$' + parseFloat(num).toFixed(2);
    }

    function calculateDaysUntil(dateStr) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const target = new Date(dateStr);
        target.setHours(0,0,0,0);
        const diffTime = target - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function saveData() {
        localStorage.setItem('sm_subs', JSON.stringify(subscriptions));
        updateUI();
    }

    // --- Navigation & Theme ---
    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            navItems.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            const targetView = document.getElementById(btn.dataset.view + 'View');
            if(targetView) targetView.classList.add('active');
            document.querySelector('.top-header h1').textContent = btn.textContent.trim();
        });
    });

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('sm_theme', newTheme);
    });

    // --- Modal Management ---
    function openModal(id = null) {
        if (id) {
            const sub = subscriptions.find(s => s.id === id);
            document.getElementById('subId').value = sub.id;
            document.getElementById('subName').value = sub.name;
            document.getElementById('subCost').value = sub.cost;
            document.getElementById('subCycle').value = sub.cycle;
            document.getElementById('subCategory').value = sub.category;
            document.getElementById('subDate').value = sub.date;
            document.getElementById('subNotes').value = sub.notes;
            document.getElementById('modalTitle').textContent = 'Edit Subscription';
        } else {
            subForm.reset();
            document.getElementById('subId').value = '';
            document.getElementById('modalTitle').textContent = 'Add Subscription';
        }
        subModal.classList.remove('hidden');
    }

    function closeModal() {
        subModal.classList.add('hidden');
    }

    addBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    subForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const subData = {
            id: document.getElementById('subId').value || Date.now().toString(),
            name: document.getElementById('subName').value,
            cost: parseFloat(document.getElementById('subCost').value),
            cycle: document.getElementById('subCycle').value,
            category: document.getElementById('subCategory').value,
            date: document.getElementById('subDate').value,
            notes: document.getElementById('subNotes').value
        };

        const existingIdx = subscriptions.findIndex(s => s.id === subData.id);
        if (existingIdx >= 0) {
            subscriptions[existingIdx] = subData;
        } else {
            subscriptions.push(subData);
        }

        closeModal();
        saveData();
    });

    window.editSub = (id) => openModal(id);
    
    window.deleteSub = (id) => {
        if(confirm("Are you sure you want to delete this subscription?")) {
            subscriptions = subscriptions.filter(s => s.id !== id);
            saveData();
        }
    };

    // --- Filters ---
    [searchInput, filterCategory, sortOption].forEach(el => {
        el.addEventListener('input', updateUI);
    });

    function getFilteredSubs() {
        const query = searchInput.value.toLowerCase();
        const cat = filterCategory.value;
        const sort = sortOption.value;

        let filtered = subscriptions.filter(s => {
            const matchQuery = s.name.toLowerCase().includes(query);
            const matchCat = cat === 'All' || s.category === cat;
            return matchQuery && matchCat;
        });

        if (sort === 'cost-desc') filtered.sort((a,b) => calculateMonthlyCost(b.cost, b.cycle) - calculateMonthlyCost(a.cost, a.cycle));
        if (sort === 'cost-asc') filtered.sort((a,b) => calculateMonthlyCost(a.cost, a.cycle) - calculateMonthlyCost(b.cost, b.cycle));
        if (sort === 'date-asc') filtered.sort((a,b) => new Date(a.date) - new Date(b.date));

        return filtered;
    }

    // --- Rendering ---
    function updateUI() {
        renderDashboardStats();
        renderSubscriptions();
        renderAnalytics();
    }

    function renderDashboardStats() {
        let totalMonthly = 0;
        let totalAnnual = 0;
        let renewalsWeek = 0;

        subscriptions.forEach(s => {
            totalMonthly += calculateMonthlyCost(s.cost, s.cycle);
            totalAnnual += calculateAnnualCost(s.cost, s.cycle);
            
            const days = calculateDaysUntil(s.date);
            if(days >= 0 && days <= 7) renewalsWeek++;
        });

        document.getElementById('monthlyCost').textContent = formatCurrency(totalMonthly);
        document.getElementById('annualCost').textContent = formatCurrency(totalAnnual);
        document.getElementById('activeSubs').textContent = subscriptions.length;
        document.getElementById('upcomingRenewals').textContent = renewalsWeek;

        // Upcoming List
        const sortedByDate = [...subscriptions].sort((a,b) => new Date(a.date) - new Date(b.date)).filter(s => calculateDaysUntil(s.date) >= 0);
        
        if (sortedByDate.length === 0) {
            upcomingList.innerHTML = '<p style="color:var(--text-secondary); font-size:14px">No upcoming renewals.</p>';
        } else {
            upcomingList.innerHTML = sortedByDate.slice(0, 4).map(s => {
                const days = calculateDaysUntil(s.date);
                let dayText = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`;
                return `
                <div class="list-item">
                    <div class="item-info">
                        <h4>${s.name}</h4>
                        <p>${s.category}</p>
                    </div>
                    <div class="item-meta">
                        <div class="cost">${formatCurrency(s.cost)} <span style="font-weight:normal; font-size:12px; color:var(--text-secondary)">/${s.cycle.substring(0,2)}</span></div>
                        <div class="date" style="${days <= 3 ? 'color:var(--warning); font-weight:600;' : ''}">${dayText}</div>
                    </div>
                </div>
                `;
            }).join('');
        }

        // Category Breakdown
        const catMap = {};
        subscriptions.forEach(s => {
            if(!catMap[s.category]) catMap[s.category] = 0;
            catMap[s.category] += calculateMonthlyCost(s.cost, s.cycle);
        });

        const catArray = Object.keys(catMap).map(k => ({ name: k, amount: catMap[k] })).sort((a,b) => b.amount - a.amount);
        
        if (catArray.length === 0) {
            categoryBars.innerHTML = '<p style="color:var(--text-secondary); font-size:14px">No data to display.</p>';
        } else {
            const maxVal = Math.max(...catArray.map(c => c.amount));
            categoryBars.innerHTML = catArray.map(c => {
                const pct = (c.amount / maxVal) * 100;
                return `
                <div class="cat-bar-container">
                    <div class="cat-bar-header">
                        <span>${c.name}</span>
                        <span>${formatCurrency(c.amount)}/mo</span>
                    </div>
                    <div class="cat-bar-bg">
                        <div class="cat-bar-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
                `;
            }).join('');
        }
    }

    function renderSubscriptions() {
        const filtered = getFilteredSubs();
        const emptyState = document.getElementById('emptySubs');
        
        if (filtered.length === 0) {
            subsGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            subsGrid.innerHTML = filtered.map(s => {
                const days = calculateDaysUntil(s.date);
                let dayText = days < 0 ? 'Expired' : days === 0 ? 'Renews Today' : `Renews in ${days} days`;
                
                return `
                <div class="sub-card">
                    <div class="sub-card-header">
                        <div>
                            <h3 style="margin-bottom:4px">${s.name}</h3>
                            <span class="sub-badge">${s.category}</span>
                        </div>
                    </div>
                    <div class="sub-card-body">
                        <div class="sub-price">${formatCurrency(s.cost)}</div>
                        <div class="sub-cycle">per ${s.cycle.toLowerCase()}</div>
                    </div>
                    <div class="sub-card-footer">
                        <div class="sub-date" style="${days <= 3 && days >= 0 ? 'color:var(--warning); font-weight:600;' : days < 0 ? 'color:var(--danger); font-weight:600;' : ''}">
                            ${dayText} (${s.date})
                        </div>
                        <div class="sub-actions">
                            <button class="icon-btn" onclick="editSub('${s.id}')" title="Edit">✎</button>
                            <button class="icon-btn delete" onclick="deleteSub('${s.id}')" title="Delete">🗑</button>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }
    }

    function renderAnalytics() {
        if(subscriptions.length === 0){
            insightsContainer.innerHTML = '<p style="color:var(--text-secondary)">Not enough data to generate insights. Add subscriptions first.</p>';
            return;
        }

        let maxSub = subscriptions[0];
        subscriptions.forEach(s => {
            if(calculateMonthlyCost(s.cost, s.cycle) > calculateMonthlyCost(maxSub.cost, maxSub.cycle)) {
                maxSub = s;
            }
        });

        const annTotal = subscriptions.reduce((sum, s) => sum + calculateAnnualCost(s.cost, s.cycle), 0);

        insightsContainer.innerHTML = `
            <div class="insight-item">
                <h4 style="margin-bottom:8px">Highest Expense</h4>
                <p style="color:var(--text-secondary); font-size:14px">Your most expensive subscription is <strong>${maxSub.name}</strong>, costing you <strong>${formatCurrency(calculateMonthlyCost(maxSub.cost, maxSub.cycle))}</strong> per month.</p>
            </div>
            <div class="insight-item">
                <h4 style="margin-bottom:8px">Yearly Projection</h4>
                <p style="color:var(--text-secondary); font-size:14px">If you keep your current subscriptions, you will spend <strong>${formatCurrency(annTotal)}</strong> over the next year.</p>
            </div>
            <div class="insight-item">
                <h4 style="margin-bottom:8px">Optimization Tip</h4>
                <p style="color:var(--text-secondary); font-size:14px">Review your "Streaming Services" subscriptions. Consolidating services can often save 15-20% annually.</p>
            </div>
        `;
    }

    // Initial render
    updateUI();
});
