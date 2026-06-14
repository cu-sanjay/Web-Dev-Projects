document.addEventListener('DOMContentLoaded', () => {
    // State
    let transactions = JSON.parse(localStorage.getItem('expenseTransactions')) || [];
    let budget = JSON.parse(localStorage.getItem('expenseBudget')) || 0;
    let isDarkMode = localStorage.getItem('theme') === 'dark';

    // DOM Elements
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const remainingBalanceEl = document.getElementById('remainingBalance');
    const transactionForm = document.getElementById('transactionForm');
    const budgetForm = document.getElementById('budgetForm');
    const transactionsList = document.getElementById('transactionsList');
    const filterType = document.getElementById('filterType');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const budgetStatusEl = document.getElementById('budgetStatus');
    const dateInput = document.getElementById('date');

    // Chart instance
    let expenseChart = null;

    // Set today's date as default
    dateInput.valueAsDate = new Date();

    // Initialize Theme
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '☀️ Light Mode';
    }

    // Format Currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Calculate Totals
    const calculateTotals = () => {
        const totals = transactions.reduce((acc, curr) => {
            if (curr.type === 'income') {
                acc.income += curr.amount;
            } else {
                acc.expense += curr.amount;
            }
            return acc;
        }, { income: 0, expense: 0 });

        const balance = totals.income - totals.expense;

        totalIncomeEl.textContent = formatCurrency(totals.income);
        totalExpenseEl.textContent = formatCurrency(totals.expense);
        remainingBalanceEl.textContent = formatCurrency(balance);

        return totals;
    };

    // Update Budget Status
    const updateBudgetStatus = (totals) => {
        if (!budget || budget <= 0) {
            budgetStatusEl.innerHTML = '<p class="progress-text">No budget set.</p>';
            return;
        }

        const percentage = Math.min((totals.expense / budget) * 100, 100);
        let colorClass = 'var(--success-color)';
        
        if (percentage >= 90) {
            colorClass = 'var(--danger-color)';
        } else if (percentage >= 75) {
            colorClass = '#f59e0b'; // warning color
        }

        budgetStatusEl.innerHTML = `
            <div class="progress-text">
                <span>Budget: ${formatCurrency(budget)}</span>
                <span>${percentage.toFixed(1)}% Used</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%; background-color: ${colorClass};"></div>
            </div>
            <div class="progress-text">
                <span>Spent: ${formatCurrency(totals.expense)}</span>
                <span>Remaining: ${formatCurrency(Math.max(budget - totals.expense, 0))}</span>
            </div>
        `;
    };

    // Render Transactions
    const renderTransactions = (filter = 'all') => {
        transactionsList.innerHTML = '';

        const filteredTransactions = transactions.filter(t => {
            if (filter === 'all') return true;
            return t.type === filter;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredTransactions.length === 0) {
            transactionsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No transactions found.</p>';
            return;
        }

        filteredTransactions.forEach(t => {
            const el = document.createElement('div');
            el.className = 'transaction-item';
            
            const isIncome = t.type === 'income';
            const sign = isIncome ? '+' : '-';
            const amountClass = isIncome ? 'amount-income' : 'amount-expense';

            el.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-title">${t.category} ${t.description ? `- ${t.description}` : ''}</span>
                    <span class="transaction-date">${new Date(t.date).toLocaleDateString()}</span>
                </div>
                <div class="transaction-amount-actions">
                    <span class="transaction-amount ${amountClass}">${sign}${formatCurrency(t.amount)}</span>
                    <button class="delete-btn" onclick="deleteTransaction('${t.id}')">×</button>
                </div>
            `;
            transactionsList.appendChild(el);
        });
    };

    // Render Chart
    const renderChart = () => {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        
        const expensesByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
            }, {});

        const labels = Object.keys(expensesByCategory);
        const data = Object.values(expensesByCategory);

        const colors = [
            '#4f46e5', '#10b981', '#f59e0b', '#ef4444', 
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'
        ];

        if (expenseChart) {
            expenseChart.destroy();
        }

        if (data.length === 0) {
            // Placeholder when no data
            expenseChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['No Expenses'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['#e5e7eb']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
            return;
        }

        const textColor = isDarkMode ? '#f9fafb' : '#111827';

        expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: textColor }
                    }
                }
            }
        });
    };

    // Global delete function
    window.deleteTransaction = (id) => {
        transactions = transactions.filter(t => t.id !== id);
        updateUI();
    };

    // Update UI
    const updateUI = () => {
        localStorage.setItem('expenseTransactions', JSON.stringify(transactions));
        localStorage.setItem('expenseBudget', JSON.stringify(budget));
        
        const totals = calculateTotals();
        renderTransactions(filterType.value);
        updateBudgetStatus(totals);
        renderChart();
    };

    // Event Listeners
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        const transaction = {
            id: Date.now().toString(),
            type,
            category,
            amount,
            date,
            description
        };

        transactions.push(transaction);
        transactionForm.reset();
        dateInput.valueAsDate = new Date();
        updateUI();
    });

    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        budget = parseFloat(document.getElementById('budgetAmount').value);
        updateUI();
        budgetForm.reset();
    });

    filterType.addEventListener('change', () => {
        renderTransactions(filterType.value);
    });

    themeToggleBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        
        if (isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerHTML = '☀️ Light Mode';
        } else {
            document.body.removeAttribute('data-theme');
            themeToggleBtn.innerHTML = '🌙 Dark Mode';
        }
        
        renderChart(); // Redraw chart with correct text color
    });

    // Handle type change to update categories dynamically (simplified for this scope)
    document.getElementById('type').addEventListener('change', (e) => {
        const categorySelect = document.getElementById('category');
        if (e.target.value === 'income') {
            categorySelect.innerHTML = `
                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
                <option value="Investments">Investments</option>
                <option value="Gift">Gift</option>
                <option value="Other">Other</option>
            `;
        } else {
            categorySelect.innerHTML = `
                <option value="Food">Food</option>
                <option value="Utilities">Utilities</option>
                <option value="Rent">Rent</option>
                <option value="Transport">Transport</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
            `;
        }
    });

    // Initial render
    updateUI();
});
