/* --- Premium Expense Tracker JavaScript Logic --- */

document.addEventListener('DOMContentLoaded', () => {
  // --- Category Color Profiles ---
  const CATEGORY_COLORS = {
    Food: '#d4af37',
    Travel: '#c5a059',
    Shopping: '#f3e5ab',
    Bills: '#aa7c11',
    Entertainment: '#ffd700',
    Other: '#8a795d'
  };

  const CATEGORY_ICONS = {
    Food: '🍔',
    Travel: '✈️',
    Shopping: '🛍️',
    Bills: '🧾',
    Entertainment: '🎬',
    Other: '📦'
  };

  // --- App State ---
  let transactions = [];
  let editingId = null;

  // --- Element Selection ---
  const netBalanceEl = document.getElementById('netBalance');
  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpensesEl = document.getElementById('totalExpenses');
  const transactionForm = document.getElementById('transactionForm');
  const transactionIdInput = document.getElementById('transactionId');
  const titleInput = document.getElementById('transTitle');
  const amountInput = document.getElementById('transAmount');
  const categorySelect = document.getElementById('transCategory');
  const dateInput = document.getElementById('transDate');
  const formTitleEl = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  
  const filterCategory = document.getElementById('filterCategory');
  const sortBy = document.getElementById('sortBy');
  const transactionsList = document.getElementById('transactionsList');
  const noTransactionsEl = document.getElementById('noTransactions');
  
  const barChart = document.getElementById('barChart');
  const donutChart = document.getElementById('donutChart');
  const chartLegend = document.getElementById('chartLegend');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const moonIcon = document.getElementById('moonIcon');
  const sunIcon = document.getElementById('sunIcon');

  // --- Initialization ---
  const init = () => {
    // Set default date input value to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Load from LocalStorage
    const stored = localStorage.getItem('aura_transactions');
    if (stored) {
      try {
        transactions = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse transactions database.', e);
      }
    } else {
      // Seed default transactions for a premium demo experience
      transactions = [
        { id: '1', title: 'Salary Credit', amount: 5000, category: 'Other', date: '2026-05-30', type: 'income' },
        { id: '2', title: 'Whole Foods Market', amount: 184.50, category: 'Food', date: '2026-06-01', type: 'expense' },
        { id: '3', title: 'Electric Bill', amount: 95.00, category: 'Bills', date: '2026-06-02', type: 'expense' },
        { id: '4', title: 'Gas Station Fuel', amount: 45.00, category: 'Travel', date: '2026-06-03', type: 'expense' },
        { id: '5', title: 'Movie Night & Snacks', amount: 32.80, category: 'Entertainment', date: '2026-06-03', type: 'expense' }
      ];
      saveToStorage();
    }

    renderDashboard();
  };

  const saveToStorage = () => {
    localStorage.setItem('aura_transactions', JSON.stringify(transactions));
  };

  // --- Workspace Theme Switcher ---
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      moonIcon.classList.add('hidden');
      sunIcon.classList.remove('hidden');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
    // Re-render charts to adjust text fills if any color changes
    renderCharts();
  });

  // --- Logic Rendering Routines ---

  const renderDashboard = () => {
    calculateBalances();
    renderTransactionsList();
    renderCharts();
  };

  // Balance calculations
  const calculateBalances = () => {
    let income = 0;
    let expenses = 0;

    transactions.forEach(t => {
      const amt = parseFloat(t.amount);
      if (t.type === 'income') {
        income += amt;
      } else {
        expenses += amt;
      }
    });

    const net = income - expenses;

    netBalanceEl.textContent = formatCurrency(net);
    totalIncomeEl.textContent = formatCurrency(income);
    totalExpensesEl.textContent = formatCurrency(expenses);

    // Color code balance state if negative
    if (net < 0) {
      netBalanceEl.style.color = 'var(--expense-color)';
    } else {
      netBalanceEl.style.color = 'var(--accent-gold)';
    }
  };

  const formatCurrency = (num) => {
    return (num < 0 ? '-' : '') + '$' + Math.abs(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  // Render lists and filter logic
  const renderTransactionsList = () => {
    transactionsList.innerHTML = '';

    const selectedCategory = filterCategory.value;
    const activeSort = sortBy.value;

    let filtered = transactions.filter(t => {
      if (selectedCategory === 'all') return true;
      return t.category === selectedCategory;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (activeSort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (activeSort === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (activeSort === 'amount-desc') return b.amount - a.amount;
      if (activeSort === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    if (filtered.length === 0) {
      noTransactionsEl.classList.remove('hidden');
    } else {
      noTransactionsEl.classList.add('hidden');
    }

    filtered.forEach(t => {
      const li = document.createElement('li');
      li.className = 'transaction-item';

      li.innerHTML = `
        <div class="trans-item-left">
          <div class="trans-icon-wrapper" title="${t.category}">
            ${CATEGORY_ICONS[t.category] || '💰'}
          </div>
          <div class="trans-details">
            <span class="trans-item-title">${t.title}</span>
            <span class="trans-item-sub">
              <span class="trans-item-category">${t.category}</span>
              &bull;
              <span>${formatDate(t.date)}</span>
            </span>
          </div>
        </div>
        <div class="trans-item-right">
          <span class="trans-item-amount amount-${t.type}">${t.amount.toFixed(2)}</span>
          <div class="trans-item-actions">
            <button type="button" class="icon-action-btn btn-edit" title="Edit Entry">
              <svg class="icon-action" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button type="button" class="icon-action-btn btn-delete" title="Delete Entry">
              <svg class="icon-action" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </div>
      `;

      // Event listener for edit
      li.querySelector('.btn-edit').addEventListener('click', () => startEdit(t));
      // Event listener for delete
      li.querySelector('.btn-delete').addEventListener('click', () => deleteTransaction(t.id));

      transactionsList.appendChild(li);
    });
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // --- Form Handling ---
  transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = transactionIdInput.value;
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    const date = dateInput.value;
    const type = document.querySelector('input[name="transType"]:checked').value;

    if (editingId) {
      // Edit mode
      const idx = transactions.findIndex(t => t.id === editingId);
      if (idx !== -1) {
        transactions[idx] = { id: editingId, title, amount, category, date, type };
      }
      resetForm();
    } else {
      // Add mode
      const newTrans = {
        id: Date.now().toString(),
        title,
        amount,
        category,
        date,
        type
      };
      transactions.push(newTrans);
    }

    saveToStorage();
    renderDashboard();

    // Reset inputs
    titleInput.value = '';
    amountInput.value = '';
    dateInput.value = new Date().toISOString().split('T')[0];
  });

  const startEdit = (t) => {
    editingId = t.id;
    transactionIdInput.value = t.id;
    titleInput.value = t.title;
    amountInput.value = t.amount;
    categorySelect.value = t.category;
    dateInput.value = t.date;

    const typeRadio = document.querySelector(`input[name="transType"][value="${t.type}"]`);
    if (typeRadio) typeRadio.checked = true;

    formTitleEl.textContent = 'Edit Entry';
    submitBtn.textContent = 'Save Changes';
    cancelEditBtn.classList.remove('hidden');

    document.querySelector('.dashboard-sidebar').scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    editingId = null;
    transactionIdInput.value = '';
    formTitleEl.textContent = 'Add Transaction';
    submitBtn.textContent = 'Add Entry';
    cancelEditBtn.classList.add('hidden');
    transactionForm.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
  };

  cancelEditBtn.addEventListener('click', resetForm);

  const deleteTransaction = (id) => {
    if (confirm('Delete this transaction?')) {
      transactions = transactions.filter(t => t.id !== id);
      if (editingId === id) resetForm();
      saveToStorage();
      renderDashboard();
    }
  };

  // --- SVG Charts Builders ---

  const renderCharts = () => {
    renderBarChart();
    renderDonutChart();
  };

  // Monthly Comparison Bar Chart compiler
  const renderBarChart = () => {
    barChart.innerHTML = '';

    // Group expenses by month
    const monthlyData = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + t.amount;
    });

    // Get sorted list of last 6 months that have data (or populate default)
    let monthsKeys = Object.keys(monthlyData).sort();
    if (monthsKeys.length === 0) {
      const currentMonth = new Date().toISOString().substring(0, 7);
      monthsKeys = [currentMonth];
      monthlyData[currentMonth] = 0;
    }

    // Cap to last 5 months for display widths
    if (monthsKeys.length > 5) {
      monthsKeys = monthsKeys.slice(-5);
    }

    const maxVal = Math.max(...monthsKeys.map(k => monthlyData[k]), 100);
    const chartHeight = 130;
    const startY = 140;
    const barWidth = 32;
    const gap = 24;
    const startX = 40;

    // Define gold gradients
    barChart.innerHTML = `
      <defs>
        <linearGradient id="barGoldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d4af37"/>
          <stop offset="100%" stop-color="#aa7c11"/>
        </linearGradient>
      </defs>
      <!-- Grid lines -->
      <line class="chart-axis-line" x1="30" y1="${startY}" x2="310" y2="${startY}" />
      <line class="chart-axis-line" x1="30" y1="20" x2="30" y2="${startY}" />
    `;

    // Horizontal helper grid lines
    for (let i = 1; i <= 3; i++) {
      const y = startY - (chartHeight / 3) * i;
      barChart.innerHTML += `
        <line class="chart-grid-line" x1="30" y1="${y}" x2="310" y2="${y}" />
        <text class="chart-label-text" x="25" y="${y + 3}" text-anchor="end">$${Math.round((maxVal / 3) * i)}</text>
      `;
    }

    monthsKeys.forEach((month, idx) => {
      const val = monthlyData[month];
      const barHeight = (val / maxVal) * chartHeight;
      const x = startX + idx * (barWidth + gap);
      const y = startY - barHeight;

      // Draw Rect
      barChart.innerHTML += `
        <rect class="bar-rect" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="url(#barGoldGrad)"/>
        <!-- Label Month -->
        <text class="chart-label-text" x="${x + barWidth / 2}" y="${startY + 15}" text-anchor="middle">${formatMonthLabel(month)}</text>
        <!-- Bar Value Tooltip -->
        <text class="chart-label-text" x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-weight="bold" fill="var(--text-title)">$${val.toFixed(0)}</text>
      `;
    });
  };

  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} '${year.substring(2)}`;
  };

  // Category Donut Chart compiler
  const renderDonutChart = () => {
    donutChart.innerHTML = '';
    chartLegend.innerHTML = '';

    // Aggregate category totals
    const catTotals = {};
    let totalExpenseSum = 0;

    transactions.filter(t => t.type === 'expense').forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      totalExpenseSum += t.amount;
    });

    const activeCategories = Object.keys(catTotals);

    if (totalExpenseSum === 0) {
      donutChart.innerHTML = `
        <circle cx="90" cy="90" r="50" fill="none" stroke="var(--border-color)" stroke-width="14" />
        <text x="90" y="94" font-size="8" text-anchor="middle" fill="var(--text-muted)">NO SPENDING</text>
      `;
      return;
    }

    let cumulativePercent = 0;
    const r = 50;
    const cx = 90;
    const cy = 90;

    activeCategories.forEach(cat => {
      const sum = catTotals[cat];
      const pct = sum / totalExpenseSum;
      const angle = pct * 360;

      // Draw SVG Circle Stroke offset mapping
      const circumference = 2 * Math.PI * r;
      const strokeDashArray = `${(pct * circumference).toFixed(1)} ${circumference.toFixed(1)}`;
      const strokeDashOffset = `${(-cumulativePercent * circumference).toFixed(1)}`;

      donutChart.innerHTML += `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" 
                stroke="${CATEGORY_COLORS[cat] || '#8a795d'}" 
                stroke-width="14" 
                stroke-dasharray="${strokeDashArray}" 
                stroke-dashoffset="${strokeDashOffset}"
                transform="rotate(-90 ${cx} ${cy})" />
      `;

      cumulativePercent += pct;

      // Populate Legend list item
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.innerHTML = `
        <span class="legend-dot" style="background-color: ${CATEGORY_COLORS[cat]}"></span>
        <span>${cat} (${(pct * 100).toFixed(0)}%)</span>
      `;
      chartLegend.appendChild(legendItem);
    });

    // Draw inner hole overlay
    donutChart.innerHTML += `
      <circle cx="${cx}" cy="${cy}" r="38" fill="var(--bg-card)" />
      <text x="${cx}" y="${cy - 2}" font-size="7" font-weight="bold" text-anchor="middle" fill="var(--text-muted)">TOTAL SPENT</text>
      <text x="${cx}" y="${cy + 10}" font-size="11" font-weight="800" text-anchor="middle" fill="var(--accent-gold)">$${totalExpenseSum.toFixed(0)}</text>
    `;
  };

  // --- Dynamic Filtering listeners ---
  filterCategory.addEventListener('change', renderTransactionsList);
  sortBy.addEventListener('change', renderTransactionsList);

  init();
});
