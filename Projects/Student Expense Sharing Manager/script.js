const memberInput = document.getElementById('member-input');
const addMemberBtn = document.getElementById('add-member-btn');
const membersList = document.getElementById('members-list');

const expenseForm = document.getElementById('expense-form');
const expenseDesc = document.getElementById('expense-desc');
const expenseAmount = document.getElementById('expense-amount');
const expensePayer = document.getElementById('expense-payer');
const submitExpenseBtn = document.getElementById('submit-expense-btn');

const balancesList = document.getElementById('balances-list');
const historyList = document.getElementById('history-list');

let members = [];
let expenses = [];
// balances[name] = amount (positive means they are owed money, negative means they owe money)
let balances = {};

addMemberBtn.addEventListener('click', () => {
  const name = memberInput.value.trim();
  if (name && !members.includes(name)) {
    members.push(name);
    balances[name] = 0;
    updateUI();
    memberInput.value = '';
  }
});

memberInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addMemberBtn.click();
  }
});

window.removeMember = function(name) {
  // Only allow removal if balance is 0 to prevent accounting errors
  if (balances[name] !== 0) {
    alert(`Cannot remove ${name} because their balance is not $0.00.`);
    return;
  }
  
  members = members.filter(m => m !== name);
  delete balances[name];
  updateUI();
}

expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (members.length < 2) return;
  
  const desc = expenseDesc.value.trim();
  const amount = parseFloat(expenseAmount.value);
  const payer = expensePayer.value;
  
  if (!desc || isNaN(amount) || !payer) return;
  
  // Split calculation
  const splitAmount = amount / members.length;
  
  // Update balances
  members.forEach(member => {
    if (member === payer) {
      // Payer gets back what everyone else owes them
      balances[member] += (amount - splitAmount);
    } else {
      // Others owe their split
      balances[member] -= splitAmount;
    }
  });
  
  // Log history
  expenses.unshift({
    id: Date.now(),
    desc,
    amount,
    payer,
    date: new Date().toLocaleDateString()
  });
  
  expenseForm.reset();
  updateUI();
});

function updateUI() {
  renderMembers();
  updatePayerDropdown();
  renderBalances();
  renderHistory();
  
  submitExpenseBtn.disabled = members.length < 2;
  if(members.length < 2) {
    submitExpenseBtn.textContent = "Need at least 2 members";
  } else {
    submitExpenseBtn.textContent = "Split Bill Evenly";
  }
}

function renderMembers() {
  membersList.innerHTML = '';
  members.forEach(member => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `
      ${member}
      <button class="chip-del" onclick="removeMember('${member}')">&times;</button>
    `;
    membersList.appendChild(chip);
  });
}

function updatePayerDropdown() {
  const currentVal = expensePayer.value;
  expensePayer.innerHTML = '<option value="" disabled selected>Select payer</option>';
  
  members.forEach(member => {
    const opt = document.createElement('option');
    opt.value = member;
    opt.textContent = member;
    expensePayer.appendChild(opt);
  });
  
  if (members.includes(currentVal)) {
    expensePayer.value = currentVal;
  }
}

function renderBalances() {
  if (members.length === 0) {
    balancesList.innerHTML = '<div class="empty-state">Add members and expenses to see balances.</div>';
    return;
  }
  
  balancesList.innerHTML = '';
  
  // Sort balances so people who are owed money are at the top
  const sortedMembers = [...members].sort((a, b) => balances[b] - balances[a]);
  
  sortedMembers.forEach(member => {
    const bal = balances[member];
    let classColor = 'b-neutral';
    let text = 'Settled up';
    
    if (bal > 0.01) {
      classColor = 'b-positive';
      text = `gets back $${bal.toFixed(2)}`;
    } else if (bal < -0.01) {
      classColor = 'b-negative';
      text = `owes $${Math.abs(bal).toFixed(2)}`;
    }
    
    const div = document.createElement('div');
    div.className = 'balance-item';
    div.innerHTML = `
      <span class="b-name">${member}</span>
      <span class="b-amount ${classColor}">${text}</span>
    `;
    balancesList.appendChild(div);
  });
}

function renderHistory() {
  if (expenses.length === 0) {
    historyList.innerHTML = '<div class="empty-state">No expenses logged yet.</div>';
    return;
  }
  
  historyList.innerHTML = '';
  
  expenses.forEach(exp => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="h-desc">${exp.desc} - $${exp.amount.toFixed(2)}</div>
      <div class="h-meta">Paid by <strong>${exp.payer}</strong> on ${exp.date}</div>
    `;
    historyList.appendChild(div);
  });
}

// Initial render
updateUI();
