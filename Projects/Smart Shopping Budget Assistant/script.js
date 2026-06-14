document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let globalBudget = parseFloat(localStorage.getItem('ssb_budget')) || 0;
    let shoppingItems = JSON.parse(localStorage.getItem('ssb_items')) || [];
    
    // --- DOM Elements ---
    const themeToggle = document.getElementById('themeToggle');
    const colorBtns = document.querySelectorAll('.color-btn');
    
    // Navigation & Views
    const navItems = {
        'dashboard': document.getElementById('navDashboard'),
        'lists': document.getElementById('navLists'),
        'settings': document.getElementById('navSettings')
    };
    const views = {
        'dashboard': document.getElementById('dashboardView'),
        'lists': document.getElementById('listsView'),
        'settings': document.getElementById('settingsView')
    };
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const headerActions = document.getElementById('headerActions');
    
    // Modals
    const itemModal = document.getElementById('itemModal');
    const purchaseModal = document.getElementById('purchaseModal');
    const budgetModal = document.getElementById('budgetModal');

    // Forms
    const itemForm = document.getElementById('itemForm');
    const purchaseForm = document.getElementById('purchaseForm');
    const quickBudgetForm = document.getElementById('quickBudgetForm');
    const globalBudgetForm = document.getElementById('globalBudgetForm');

    // Filters
    const filterCategory = document.getElementById('filterCategory');
    const filterPendingOnly = document.getElementById('filterPendingOnly');

    // --- Initialization ---
    if (localStorage.getItem('ssb_theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }
    const savedColorTheme = localStorage.getItem('ssb_color_theme') || 'ocean';
    document.body.setAttribute('data-color-theme', savedColorTheme);
    colorBtns.forEach(btn => {
        if (btn.dataset.color === savedColorTheme) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Populate initial inputs
    document.getElementById('setGlobalBudgetInput').value = globalBudget || '';
    document.getElementById('quickBudgetInput').value = globalBudget || '';

    // --- Utility Functions ---
    const saveData = () => {
        localStorage.setItem('ssb_budget', globalBudget);
        localStorage.setItem('ssb_items', JSON.stringify(shoppingItems));
        renderDashboard();
        if (!views.lists.classList.contains('hidden')) renderShoppingList();
    };

    const formatCurrency = (amount) => {
        return '$' + parseFloat(amount).toFixed(2);
    };

    // --- Navigation ---
    const switchView = (viewName, title, subtitle, showActions = true) => {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        Object.values(navItems).forEach(n => n.classList.remove('active'));
        
        views[viewName].classList.remove('hidden');
        navItems[viewName].classList.add('active');
        
        pageTitle.textContent = title;
        pageSubtitle.textContent = subtitle;
        headerActions.style.display = showActions ? 'flex' : 'none';
    };

    navItems.dashboard.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('dashboard', 'Dashboard', 'Overview of your budget and spending.');
        renderDashboard();
    });

    navItems.lists.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('lists', 'Shopping List', 'Manage your planned purchases.');
        renderShoppingList();
    });

    navItems.settings.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('settings', 'Settings', 'Configure app preferences.', false);
    });

    // --- Theme Toggles ---
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('ssb_theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('ssb_theme', 'dark');
        }
    });

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            document.body.setAttribute('data-color-theme', color);
            localStorage.setItem('ssb_color_theme', color);
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // --- Modal Management ---
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.add('hidden');
        });
    });

    document.getElementById('setBudgetBtn').addEventListener('click', () => {
        document.getElementById('quickBudgetInput').value = globalBudget || '';
        budgetModal.classList.remove('hidden');
    });

    document.getElementById('addItemBtn').addEventListener('click', () => {
        itemForm.reset();
        document.getElementById('itemId').value = '';
        document.getElementById('itemModalTitle').textContent = 'Add Item';
        itemModal.classList.remove('hidden');
    });

    // --- Form Submissions ---
    quickBudgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        globalBudget = parseFloat(document.getElementById('quickBudgetInput').value) || 0;
        document.getElementById('setGlobalBudgetInput').value = globalBudget;
        budgetModal.classList.add('hidden');
        saveData();
    });

    globalBudgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        globalBudget = parseFloat(document.getElementById('setGlobalBudgetInput').value) || 0;
        document.getElementById('quickBudgetInput').value = globalBudget;
        alert("Budget updated successfully!");
        saveData();
    });

    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idInput = document.getElementById('itemId').value;
        const name = document.getElementById('itemName').value;
        const category = document.getElementById('itemCategory').value;
        const estPrice = parseFloat(document.getElementById('itemEstPrice').value) || 0;
        const qty = parseInt(document.getElementById('itemQty').value) || 1;

        if (idInput) {
            // Edit existing
            const item = shoppingItems.find(i => i.id === idInput);
            if (item) {
                item.name = name;
                item.category = category;
                item.estPrice = estPrice;
                item.qty = qty;
            }
        } else {
            // Add new
            shoppingItems.push({
                id: Date.now().toString(),
                name, category, estPrice, qty,
                purchased: false, actualPrice: 0
            });
        }
        itemModal.classList.add('hidden');
        saveData();
    });

    purchaseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('purchaseItemId').value;
        const actualPrice = parseFloat(document.getElementById('purchaseActualPrice').value) || 0;
        
        const item = shoppingItems.find(i => i.id === id);
        if (item) {
            item.purchased = true;
            item.actualPrice = actualPrice;
        }
        purchaseModal.classList.add('hidden');
        saveData();
    });

    document.getElementById('clearDataBtn').addEventListener('click', () => {
        if (confirm("Are you sure? This will delete all shopping lists and budget settings.")) {
            localStorage.removeItem('ssb_budget');
            localStorage.removeItem('ssb_items');
            globalBudget = 0;
            shoppingItems = [];
            document.getElementById('setGlobalBudgetInput').value = '';
            document.getElementById('quickBudgetInput').value = '';
            saveData();
            navItems.dashboard.click();
        }
    });

    // --- Item Actions (Global) ---
    window.editItem = (id) => {
        const item = shoppingItems.find(i => i.id === id);
        if (item) {
            document.getElementById('itemId').value = item.id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemCategory').value = item.category;
            document.getElementById('itemEstPrice').value = item.estPrice;
            document.getElementById('itemQty').value = item.qty;
            document.getElementById('itemModalTitle').textContent = 'Edit Item';
            itemModal.classList.remove('hidden');
        }
    };

    window.deleteItem = (id) => {
        if (confirm("Delete this item from your list?")) {
            shoppingItems = shoppingItems.filter(i => i.id !== id);
            saveData();
        }
    };

    window.markPurchased = (id) => {
        const item = shoppingItems.find(i => i.id === id);
        if (item) {
            document.getElementById('purchaseItemId').value = item.id;
            document.getElementById('purchaseItemDetails').innerHTML = `Item: <strong>${item.name}</strong><br>Estimated Total: <strong>${formatCurrency(item.estPrice * item.qty)}</strong>`;
            document.getElementById('purchaseActualPrice').value = (item.estPrice * item.qty).toFixed(2);
            purchaseModal.classList.remove('hidden');
        }
    };

    window.unmarkPurchased = (id) => {
        const item = shoppingItems.find(i => i.id === id);
        if (item) {
            item.purchased = false;
            item.actualPrice = 0;
            saveData();
        }
    };

    // Filters
    filterCategory.addEventListener('change', renderShoppingList);
    filterPendingOnly.addEventListener('change', renderShoppingList);

    // --- Render Functions ---
    const renderDashboard = () => {
        let estTotal = 0;
        let actualTotal = 0;

        // Calculate totals
        shoppingItems.forEach(i => {
            estTotal += (i.estPrice * i.qty);
            if (i.purchased) {
                actualTotal += i.actualPrice;
            }
        });

        const remaining = globalBudget - actualTotal;

        // Update Stats
        document.getElementById('statTotalBudget').textContent = formatCurrency(globalBudget);
        document.getElementById('statEstimated').textContent = formatCurrency(estTotal);
        document.getElementById('statActual').textContent = formatCurrency(actualTotal);
        
        const remEl = document.getElementById('statRemaining');
        remEl.textContent = formatCurrency(remaining);
        
        if (remaining < 0) {
            remEl.className = 'amount text-danger';
            document.getElementById('actualBg').className = 'card-icon danger-bg';
        } else {
            remEl.className = 'amount text-success';
            document.getElementById('actualBg').className = 'card-icon warning-bg'; // reset to default
        }

        // Render Alerts
        const alertsList = document.getElementById('alertsList');
        alertsList.innerHTML = '';
        if (globalBudget === 0) {
            alertsList.innerHTML = '<div class="alert-item warning">Please set a Total Budget to enable alerts.</div>';
        } else {
            if (actualTotal > globalBudget) {
                alertsList.innerHTML += `<div class="alert-item danger">⚠️ You have exceeded your budget by ${formatCurrency(actualTotal - globalBudget)}!</div>`;
            } else if (actualTotal > globalBudget * 0.9) {
                alertsList.innerHTML += `<div class="alert-item warning">⚠️ Warning: You have spent over 90% of your budget.</div>`;
            } else if (estTotal > globalBudget) {
                alertsList.innerHTML += `<div class="alert-item warning">📋 Notice: Your estimated shopping list total exceeds your budget.</div>`;
            } else {
                alertsList.innerHTML += `<div class="alert-item success">✅ You are currently within budget limits.</div>`;
            }
        }

        // Category Breakdown
        const breakdownEl = document.getElementById('categoryBreakdown');
        breakdownEl.innerHTML = '';
        
        const catSpent = {};
        shoppingItems.forEach(i => {
            if (i.purchased) {
                catSpent[i.category] = (catSpent[i.category] || 0) + i.actualPrice;
            }
        });

        const categories = Object.keys(catSpent).sort((a,b) => catSpent[b] - catSpent[a]);

        if (categories.length === 0) {
            breakdownEl.innerHTML = '<div class="empty-state-sm text-muted">No purchased items yet.</div>';
        } else {
            categories.forEach(cat => {
                const amount = catSpent[cat];
                const pct = actualTotal > 0 ? (amount / actualTotal) * 100 : 0;
                breakdownEl.innerHTML += `
                    <div class="cat-item">
                        <div class="cat-header">
                            <span>${cat}</span>
                            <span>${formatCurrency(amount)} (${Math.round(pct)}%)</span>
                        </div>
                        <div class="cat-bar-bg">
                            <div class="cat-bar-fill" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            });
        }
    };

    const renderShoppingList = () => {
        const grid = document.getElementById('shoppingListGrid');
        const msg = document.getElementById('noItemsMsg');
        
        const catFilter = filterCategory.value;
        const pendingFilter = filterPendingOnly.checked;

        let filteredItems = shoppingItems.filter(i => {
            if (catFilter !== 'All' && i.category !== catFilter) return false;
            if (pendingFilter && i.purchased) return false;
            return true;
        });

        grid.innerHTML = '';
        if (filteredItems.length === 0) {
            msg.classList.remove('hidden');
        } else {
            msg.classList.add('hidden');
            // Sort: pending first, then by category
            filteredItems.sort((a, b) => {
                if (a.purchased === b.purchased) return a.category.localeCompare(b.category);
                return a.purchased ? 1 : -1;
            });

            filteredItems.forEach(i => {
                const estTotal = i.estPrice * i.qty;
                const isPurchasedClass = i.purchased ? 'purchased' : '';
                
                let actionsHTML = '';
                if (i.purchased) {
                    actionsHTML = `
                        <button class="btn btn-secondary btn-sm flex-1" onclick="unmarkPurchased('${i.id}')">Undo Purchase</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteItem('${i.id}')" title="Delete">✕</button>
                    `;
                } else {
                    actionsHTML = `
                        <button class="btn btn-success btn-sm flex-1" onclick="markPurchased('${i.id}')">✓ Mark Bought</button>
                        <button class="btn btn-secondary btn-sm" onclick="editItem('${i.id}')" title="Edit">✎</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteItem('${i.id}')" title="Delete">✕</button>
                    `;
                }

                grid.innerHTML += `
                    <div class="item-card ${isPurchasedClass}">
                        <div class="item-header">
                            <div>
                                <h4>${i.name}</h4>
                                <span class="item-cat">${i.category}</span>
                            </div>
                        </div>
                        <div class="item-stats">
                            <div class="item-stat-box" style="flex:1">
                                <span class="item-stat-label">Qty</span>
                                <span class="item-stat-val">${i.qty}</span>
                            </div>
                            <div class="item-stat-box" style="flex:1">
                                <span class="item-stat-label">Est. Total</span>
                                <span class="item-stat-val">${formatCurrency(estTotal)}</span>
                            </div>
                            <div class="item-stat-box" style="flex:1">
                                <span class="item-stat-label">Actual</span>
                                <span class="item-stat-val actual">${i.purchased ? formatCurrency(i.actualPrice) : '-'}</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            ${actionsHTML}
                        </div>
                    </div>
                `;
            });
        }
    };

    // Boot Up
    renderDashboard();
});
