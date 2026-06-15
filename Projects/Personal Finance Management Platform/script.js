// --- Navigation & Sidebar Logic ---
const menuItems = document.querySelectorAll('.sidebar-menu li');
const tabContents = document.querySelectorAll('.tab-content');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    // Update Active State
    menuItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    // Switch Tabs
    const targetId = item.getAttribute('data-tab');
    tabContents.forEach(tab => {
      tab.classList.add('hidden');
      if (tab.id === targetId) {
        tab.classList.remove('hidden');
      }
    });

    // Close mobile menu if open
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('mobile-open');
    }
  });
});

mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});

// --- Mock Data ---

const transactions = [
  { desc: "TechCorp Salary", category: "Income", type: "Income", date: "Oct 01, 2026", amount: 4200.00 },
  { desc: "Whole Foods Market", category: "Groceries", type: "Expense", date: "Oct 12, 2026", amount: -145.20 },
  { desc: "Netflix Subscription", category: "Entertainment", type: "Expense", date: "Oct 10, 2026", amount: -15.99 },
  { desc: "Shell Station", category: "Transport", type: "Expense", date: "Oct 08, 2026", amount: -45.50 },
  { desc: "Downtown Apartments", category: "Housing", type: "Expense", date: "Oct 01, 2026", amount: -1200.00 }
];

const budgets = [
  { name: "Housing & Rent", limit: 1500, spent: 1200, icon: "ph-house-line", color: "var(--indigo)" },
  { name: "Food & Groceries", limit: 600, spent: 480, icon: "ph-shopping-cart", color: "var(--orange)" },
  { name: "Transportation", limit: 300, spent: 145, icon: "ph-car", color: "var(--red)" },
  { name: "Utilities & Bills", limit: 400, spent: 380, icon: "ph-lightning", color: "var(--green)" }
];

const goals = [
  { name: "Emergency Fund", target: 10000, current: 6500, deadline: "Dec 2026", color: "var(--indigo)" },
  { name: "Japan Vacation", target: 4000, current: 1200, deadline: "Jun 2027", color: "var(--orange)" },
  { name: "New Laptop", target: 2500, current: 2000, deadline: "Nov 2026", color: "var(--blue)" }
];

// --- Rendering Functions ---

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function renderTransactions() {
  const recentTbody = document.getElementById('recent-transactions-tbody');
  const allTbody = document.getElementById('all-transactions-tbody');

  const rowHtml = (tx, showAll = false) => `
    <tr>
      <td><strong>${tx.desc}</strong></td>
      <td><span class="type-badge">${tx.category}</span></td>
      ${showAll ? `<td><span class="badge" style="background: ${tx.type === 'Income' ? 'var(--green-light)' : 'var(--bg-page)'}; color: ${tx.type === 'Income' ? 'var(--green)' : 'var(--text-main)'}; border: none;">${tx.type}</span></td>` : ''}
      <td>${tx.date}</td>
      <td class="${tx.amount > 0 ? 'amount-pos' : 'amount-neg'}">${tx.amount > 0 ? '+' : ''}${formatCurrency(tx.amount)}</td>
      ${showAll ? `<td><button class="btn outline-btn btn-sm">Edit</button></td>` : ''}
    </tr>
  `;

  if(recentTbody) {
    recentTbody.innerHTML = transactions.slice(0, 4).map(tx => rowHtml(tx, false)).join('');
  }
  
  if(allTbody) {
    allTbody.innerHTML = transactions.map(tx => rowHtml(tx, true)).join('');
  }
}

function renderBudgets() {
  const grid = document.getElementById('budget-grid');
  if(!grid) return;

  grid.innerHTML = budgets.map(b => {
    const percent = Math.min((b.spent / b.limit) * 100, 100);
    const isNearLimit = percent >= 85;
    
    return `
      <div class="budget-card">
        <div class="budget-header">
          <h4><div class="budget-icon" style="background: ${b.color}20; color: ${b.color};"><i class="ph-fill ${b.icon}"></i></div> ${b.name}</h4>
          <button class="icon-btn" style="width: 28px; height: 28px; border: none; background: transparent;"><i class="ph ph-dots-three"></i></button>
        </div>
        <div class="budget-amounts">
          <span>${formatCurrency(b.spent)} spent</span>
          <span>${formatCurrency(b.limit)} limit</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percent}%; background: ${isNearLimit ? 'var(--red)' : b.color};"></div>
        </div>
        <div class="budget-msg" style="color: ${isNearLimit ? 'var(--red)' : 'var(--text-muted)'};">
          ${isNearLimit ? '<i class="ph-fill ph-warning-circle"></i> Nearing monthly limit' : `${formatCurrency(b.limit - b.spent)} remaining`}
        </div>
      </div>
    `;
  }).join('');
}

function renderGoals() {
  const list = document.getElementById('goal-list');
  if(!list) return;

  list.innerHTML = goals.map(g => {
    const percent = Math.min((g.current / g.target) * 100, 100);
    
    return `
      <div class="goal-item">
        <div class="goal-header">
          <h4>${g.name}</h4>
          <span class="goal-target">${formatCurrency(g.current)} / ${formatCurrency(g.target)}</span>
        </div>
        <div class="progress-bar" style="height: 12px; border-radius: 6px;">
          <div class="progress-fill" style="width: ${percent}%; background: ${g.color}; border-radius: 6px;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
          <span>${percent.toFixed(1)}% Completed</span>
          <span>Target: ${g.deadline}</span>
        </div>
      </div>
    `;
  }).join('');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  renderTransactions();
  renderBudgets();
  renderGoals();
});
