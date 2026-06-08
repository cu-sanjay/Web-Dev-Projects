(function () {
  var STORAGE_KEY = 'expense_tracker_data';
  var CATEGORIES = {
    income: ['Salary', 'Freelance', 'Investments', 'Refund', 'Other Income'],
    expense: ['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other']
  };

  var transactions = [];
  var nextId = 1;
  var activeFilter = 'all';

  /* ---- Elements ---- */
  var descInput = document.getElementById('descInput');
  var amountInput = document.getElementById('amountInput');
  var typeSelect = document.getElementById('typeSelect');
  var categorySelect = document.getElementById('categorySelect');
  var addBtn = document.getElementById('addBtn');
  var formError = document.getElementById('formError');
  var ledgerBody = document.getElementById('ledgerBody');
  var emptyState = document.getElementById('emptyState');
  var categoryBreakdown = document.getElementById('categoryBreakdown');
  var categoryEmpty = document.getElementById('categoryEmpty');
  var netBalance = document.getElementById('netBalance');
  var totalIncome = document.getElementById('totalIncome');
  var totalExpense = document.getElementById('totalExpense');
  var filterBtns = document.querySelectorAll('.filter-btn');

  /* ---- Category population ---- */
  function populateCategories() {
    var type = typeSelect.value;
    var cats = CATEGORIES[type] || CATEGORIES.expense;
    categorySelect.innerHTML = '';
    cats.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      categorySelect.appendChild(opt);
    });
  }

  typeSelect.addEventListener('change', populateCategories);
  populateCategories();

  /* ---- Helpers ---- */
  function sanitize(str) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str).replace(/[&<>"']/g, function (ch) { return map[ch]; });
  }

  function generateId() {
    while (transactions.some(function (t) { return t.id === 'txn_' + nextId; })) { nextId++; }
    return 'txn_' + nextId++;
  }

  function fmt(n) {
    return '\u20B9' + parseFloat(n).toFixed(2);
  }

  /* ---- Storage ---- */
  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (Array.isArray(data.transactions)) { transactions = data.transactions; }
        if (data.nextId) { nextId = data.nextId; }
      }
    } catch (e) {}
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions: transactions, nextId: nextId }));
    } catch (e) {}
  }

  /* ---- Math ---- */
  function computeTotals() {
    var income = transactions
      .filter(function (t) { return t.type === 'income'; })
      .reduce(function (sum, t) { return sum + t.amount; }, 0);
    var expense = transactions
      .filter(function (t) { return t.type === 'expense'; })
      .reduce(function (sum, t) { return sum + t.amount; }, 0);
    return { income: income, expense: expense, net: income - expense };
  }

  function getFiltered() {
    if (activeFilter === 'all') return transactions;
    return transactions.filter(function (t) { return t.type === activeFilter; });
  }

  /* ---- Render ---- */
  function render() {
    var totals = computeTotals();
    netBalance.textContent = fmt(totals.net);
    totalIncome.textContent = fmt(totals.income);
    totalExpense.textContent = fmt(totals.expense);

    var filtered = getFiltered();

    /* Ledger */
    if (filtered.length === 0) {
      ledgerBody.innerHTML = '';
      emptyState.style.display = 'flex';
    } else {
      emptyState.style.display = 'none';
      ledgerBody.innerHTML = '';
      filtered.forEach(function (txn) {
        var tr = document.createElement('tr');

        var tdDesc = document.createElement('td');
        tdDesc.textContent = txn.text;

        var tdCat = document.createElement('td');
        var catSpan = document.createElement('span');
        catSpan.className = 'category-tag';
        catSpan.textContent = txn.category;
        tdCat.appendChild(catSpan);

        var tdAmt = document.createElement('td');
        tdAmt.className = 'amount-cell ' + txn.type;
        tdAmt.textContent = (txn.type === 'expense' ? '-' : '+') + fmt(txn.amount);

        var tdDel = document.createElement('td');
        var delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerHTML = '&times;';
        delBtn.setAttribute('aria-label', 'Delete');
        delBtn.addEventListener('click', function () { deleteTransaction(txn.id); });
        tdDel.appendChild(delBtn);

        tr.appendChild(tdDesc);
        tr.appendChild(tdCat);
        tr.appendChild(tdAmt);
        tr.appendChild(tdDel);
        ledgerBody.appendChild(tr);
      });
    }

    /* Category breakdown */
    var expenses = transactions.filter(function (t) { return t.type === 'expense'; });
    if (expenses.length === 0) {
      categoryBreakdown.innerHTML = '';
      categoryEmpty.style.display = 'flex';
      return;
    }
    categoryEmpty.style.display = 'none';

    var totalExp = expenses.reduce(function (s, t) { return s + t.amount; }, 0);
    var groups = {};
    expenses.forEach(function (t) {
      if (!groups[t.category]) groups[t.category] = 0;
      groups[t.category] += t.amount;
    });

    var sorted = Object.keys(groups).sort(function (a, b) { return groups[b] - groups[a]; });

    categoryBreakdown.innerHTML = '';
    sorted.forEach(function (cat) {
      var amt = groups[cat];
      var pct = totalExp > 0 ? (amt / totalExp) * 100 : 0;

      var row = document.createElement('div');
      row.className = 'cat-bar-row';

      var header = document.createElement('div');
      header.className = 'cat-bar-header';
      var label = document.createElement('span');
      label.className = 'cat-bar-label';
      label.textContent = cat;
      var val = document.createElement('span');
      val.className = 'cat-bar-amount';
      val.textContent = fmt(amt);

      header.appendChild(label);
      header.appendChild(val);

      var track = document.createElement('div');
      track.className = 'cat-bar-track';
      var fill = document.createElement('div');
      fill.className = 'cat-bar-fill';
      fill.style.width = pct.toFixed(1) + '%';

      track.appendChild(fill);
      row.appendChild(header);
      row.appendChild(track);
      categoryBreakdown.appendChild(row);
    });
  }

  /* ---- CRUD ---- */
  function addTransaction(text, amount, type, category) {
    var txn = {
      id: generateId(),
      text: text.trim(),
      amount: amount,
      type: type,
      category: category
    };
    transactions.push(txn);
    saveState();
    render();
  }

  function deleteTransaction(id) {
    transactions = transactions.filter(function (t) { return t.id !== id; });
    saveState();
    render();
  }

  /* ---- Validation & Submit ---- */
  function clearError() {
    formError.textContent = '';
    descInput.classList.remove('input-error');
    amountInput.classList.remove('input-error');
  }

  function showError(msg) {
    formError.textContent = msg;
  }

  function handleSubmit() {
    clearError();
    var text = descInput.value;
    var rawAmt = amountInput.value;
    var type = typeSelect.value;
    var category = categorySelect.value;

    if (!text.trim()) {
      descInput.classList.add('input-error');
      showError('Description cannot be empty');
      descInput.focus();
      return;
    }

    var cleaned = rawAmt.replace(/[^0-9.\-]/g, '');
    var amount = parseFloat(cleaned);
    if (isNaN(amount) || amount <= 0) {
      amountInput.classList.add('input-error');
      showError('Enter a valid positive number');
      amountInput.focus();
      return;
    }

    addTransaction(text.trim(), amount, type, category);
    descInput.value = '';
    amountInput.value = '';
    descInput.focus();
  }

  addBtn.addEventListener('click', handleSubmit);

  descInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      amountInput.focus();
    }
  });

  amountInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  });

  amountInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9.]/g, '');
  });

  /* ---- Filter ---- */
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  /* ---- Boot ---- */
  loadState();
  render();
})();
