document.addEventListener('DOMContentLoaded', () => {
    // State
    let expenses = JSON.parse(localStorage.getItem('renoExpenses')) || [];
    let totalBudget = parseFloat(localStorage.getItem('renoTotalBudget')) || 50000;
    let projectName = localStorage.getItem('renoProjectName') || 'My Home Renovation';

    // DOM Elements - Sidebar
    const themeToggle = document.getElementById('themeToggle');
    const colorBtns = document.querySelectorAll('.color-btn');
    const projectNameInput = document.getElementById('projectName');
    const totalBudgetInput = document.getElementById('totalBudget');
    const navDashboard = document.getElementById('navDashboard');
    const navExpenses = document.getElementById('navExpenses');

    // DOM Elements - Main
    const dashboardView = document.getElementById('dashboardView');
    const expensesView = document.getElementById('expensesView');
    const displayTotalBudget = document.getElementById('displayTotalBudget');
    const displayTotalSpent = document.getElementById('displayTotalSpent');
    const displayRemaining = document.getElementById('displayRemaining');
    const budgetProgressBar = document.getElementById('budgetProgressBar');
    const budgetProgressText = document.getElementById('budgetProgressText');
    const categoryBreakdown = document.getElementById('categoryBreakdown');
    
    const expenseTableBody = document.getElementById('expenseTableBody');
    const noExpensesMsg = document.getElementById('noExpensesMsg');

    // DOM Elements - Modal
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const expenseModal = document.getElementById('expenseModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const expenseForm = document.getElementById('expenseForm');

    // --- Initialization ---
    // Dark Mode
    if (localStorage.getItem('renoTheme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    // Color Theme
    const savedColorTheme = localStorage.getItem('renoColorTheme') || 'indigo';
    document.body.setAttribute('data-color-theme', savedColorTheme);
    colorBtns.forEach(btn => {
        if (btn.dataset.color === savedColorTheme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    projectNameInput.value = projectName;
    totalBudgetInput.value = totalBudget;
    
    // Set today as default date in form
    document.getElementById('expDate').valueAsDate = new Date();

    // --- Utilities ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const calculateTotals = () => {
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = totalBudget - totalSpent;
        const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        return { totalSpent, remaining, percentUsed };
    };

    const getCategoryBreakdown = () => {
        const breakdown = {};
        expenses.forEach(exp => {
            if (!breakdown[exp.category]) breakdown[exp.category] = 0;
            breakdown[exp.category] += exp.amount;
        });
        return Object.entries(breakdown).sort((a, b) => b[1] - a[1]); // Sort by amount desc
    };

    const saveData = () => {
        localStorage.setItem('renoExpenses', JSON.stringify(expenses));
        localStorage.setItem('renoTotalBudget', totalBudget);
        localStorage.setItem('renoProjectName', projectName);
    };

    // --- Render Functions ---
    const updateDashboard = () => {
        const { totalSpent, remaining, percentUsed } = calculateTotals();

        // Animate numbers for premium feel
        displayTotalBudget.textContent = formatCurrency(totalBudget);
        displayTotalSpent.textContent = formatCurrency(totalSpent);
        displayRemaining.textContent = formatCurrency(remaining);

        // Update Progress Bar
        budgetProgressBar.style.width = `${Math.min(percentUsed, 100)}%`;
        budgetProgressText.textContent = `${percentUsed.toFixed(1)}% Used`;

        if (percentUsed > 100) {
            budgetProgressBar.style.background = 'var(--danger)';
            displayRemaining.classList.replace('text-success', 'text-danger');
        } else if (percentUsed > 80) {
            budgetProgressBar.style.background = 'var(--warning)';
            displayRemaining.classList.replace('text-danger', 'text-success');
        } else {
            budgetProgressBar.style.background = 'linear-gradient(90deg, var(--primary), var(--primary-hover))';
            displayRemaining.classList.replace('text-danger', 'text-success');
        }

        // Update Category List
        const cats = getCategoryBreakdown();
        categoryBreakdown.innerHTML = '';
        if (cats.length === 0) {
            categoryBreakdown.innerHTML = '<div class="text-muted" style="padding: 10px;">No spending data yet.</div>';
        } else {
            cats.forEach(([cat, amount]) => {
                const el = document.createElement('div');
                el.className = 'category-item';
                el.innerHTML = `
                    <span class="cat-name">${cat}</span>
                    <span class="cat-amount">${formatCurrency(amount)}</span>
                `;
                categoryBreakdown.appendChild(el);
            });
        }
    };

    const updateExpenseTable = () => {
        expenseTableBody.innerHTML = '';
        
        if (expenses.length === 0) {
            noExpensesMsg.style.display = 'block';
        } else {
            noExpensesMsg.style.display = 'none';
            // Sort expenses by date descending
            const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            sorted.forEach(exp => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(exp.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td class="fw-bold">${exp.description}</td>
                    <td><span style="background: var(--bg-body); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${exp.category}</span></td>
                    <td class="text-danger fw-bold">-${formatCurrency(exp.amount)}</td>
                    <td>
                        <button class="btn btn-danger delete-btn" data-id="${exp.id}">Delete</button>
                    </td>
                `;
                expenseTableBody.appendChild(tr);
            });

            // Add delete listeners
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    expenses = expenses.filter(x => x.id !== id);
                    saveData();
                    updateAll();
                });
            });
        }
    };

    const updateAll = () => {
        updateDashboard();
        updateExpenseTable();
    };

    // --- Event Listeners ---

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('renoTheme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('renoTheme', 'dark');
        }
    });

    // Color Theme Picker
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            document.body.setAttribute('data-color-theme', color);
            localStorage.setItem('renoColorTheme', color);
            
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Re-render dashboard to update progress bar color gradients if needed
            updateDashboard();
        });
    });

    // Navigation
    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        navDashboard.classList.add('active');
        navExpenses.classList.remove('active');
        dashboardView.classList.remove('hidden');
        expensesView.classList.add('hidden');
    });

    navExpenses.addEventListener('click', (e) => {
        e.preventDefault();
        navExpenses.classList.add('active');
        navDashboard.classList.remove('active');
        expensesView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    });

    // Settings Inputs
    projectNameInput.addEventListener('change', (e) => {
        projectName = e.target.value;
        saveData();
    });

    totalBudgetInput.addEventListener('change', (e) => {
        totalBudget = parseFloat(e.target.value) || 0;
        saveData();
        updateDashboard();
    });

    // Modal
    addExpenseBtn.addEventListener('click', () => {
        expenseModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        expenseModal.classList.add('hidden');
    });

    // Form Submission
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newExpense = {
            id: Date.now().toString(),
            description: document.getElementById('expDesc').value,
            amount: parseFloat(document.getElementById('expAmount').value),
            category: document.getElementById('expCategory').value,
            date: document.getElementById('expDate').value
        };

        expenses.push(newExpense);
        saveData();
        updateAll();
        
        // Reset form and close modal
        expenseForm.reset();
        document.getElementById('expDate').valueAsDate = new Date(); // reset to today
        expenseModal.classList.add('hidden');
        
        // Switch to expenses view automatically
        navExpenses.click();
    });

    // Initial Render
    updateAll();
});
