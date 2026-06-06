const STORAGE_KEY = 'subscriptions_data';

const CATEGORY_COLORS = {
  Entertainment: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', bar: '#8b5cf6', icon: '🎬' },
  Utilities:     { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6', bar: '#3b82f6', icon: '⚡' },
  Software:      { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', bar: '#10b981', icon: '💻' },
  Cloud:         { bg: 'rgba(244,63,94,0.12)',    color: '#f43f5e', bar: '#f43f5e', icon: '☁️' },
};

let subs = loadSubs();
let editingId = null;

const subsList = document.getElementById('subsList');
const monthlyTotal = document.getElementById('monthlyTotal');
const annualTotal = document.getElementById('annualTotal');
const activeCount = document.getElementById('activeCount');
const categoryBars = document.getElementById('categoryBars');
const filterCat = document.getElementById('filterCategory');
const sortBy = document.getElementById('sortBy');
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const form = document.getElementById('form');
const formCancel = document.getElementById('formCancel');
const formName = document.getElementById('formName');
const formCost = document.getElementById('formCost');
const formCycle = document.getElementById('formCycle');
const formCategory = document.getElementById('formCategory');
const formDate = document.getElementById('formDate');

function loadSubs() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSubs() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
  } catch {}
}

function getMonthlyCost(sub) {
  return sub.cycle === 'Monthly' ? sub.cost : sub.cost / 12;
}

function getAnnualCost(sub) {
  return sub.cycle === 'Yearly' ? sub.cost : sub.cost * 12;
}

function daysUntil(dateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / 86400000);
}

function formatCurrency(n) {
  return '$' + n.toFixed(2);
}

function render() {
  const catFilter = filterCat.value;
  const sort = sortBy.value;

  let filtered = [...subs];
  if (catFilter) {
    filtered = filtered.filter((s) => s.category === catFilter);
  }
  filtered.sort((a, b) => {
    if (sort === 'cost') return getAnnualCost(b) - getAnnualCost(a);
    if (sort === 'renewal') return new Date(a.date) - new Date(b.date);
    return a.name.localeCompare(b.name);
  });

  const totalMonthly = subs.reduce((sum, s) => sum + getMonthlyCost(s), 0);
  const totalAnnual = subs.reduce((sum, s) => sum + getAnnualCost(s), 0);

  monthlyTotal.textContent = formatCurrency(totalMonthly);
  annualTotal.textContent = formatCurrency(totalAnnual);
  activeCount.textContent = subs.length;

  renderCategoryBars();
  renderList(filtered);
}

function renderCategoryBars() {
  if (subs.length === 0) {
    categoryBars.innerHTML = '';
    return;
  }
  const total = subs.reduce((sum, s) => sum + getAnnualCost(s), 0);
  const catTotals = {};
  for (const s of subs) {
    const cost = getAnnualCost(s);
    catTotals[s.category] = (catTotals[s.category] || 0) + cost;
  }
  categoryBars.innerHTML = Object.entries(catTotals)
    .map(([cat, cost]) => {
      const pct = (cost / total) * 100;
      const color = CATEGORY_COLORS[cat]?.bar || '#64748b';
      return `<div class="category-bar" style="width:${pct}%;background:${color};flex:${pct}" title="${cat}: ${formatCurrency(cost)}"></div>`;
    })
    .join('');
}

function renderList(items) {
  if (items.length === 0) {
    subsList.innerHTML = '<div class="empty-state">No subscriptions match your filters.</div>';
    return;
  }
  subsList.innerHTML = items
    .map((s) => {
      const cat = CATEGORY_COLORS[s.category] || { bg: '#1e293b', color: '#64748b', icon: '📦' };
      const days = daysUntil(s.date);
      const isSoon = days >= 0 && days <= 7;
      const catTotal = subs
        .filter((x) => x.category === s.category)
        .reduce((sum, x) => sum + getAnnualCost(x), 0);

      return `
        <div class="sub-card${isSoon ? ' renewal-soon' : ''}" data-id="${s.id}">
          <div class="sub-avatar" style="background:${cat.bg};color:${cat.color}">${cat.icon}</div>
          <div class="sub-info">
            <div class="sub-name">${s.name}</div>
            <div class="sub-meta">
              <span>${s.category}</span>
              <span>·</span>
              <span>${s.cycle}</span>
              <span>·</span>
              <span>Renews ${new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              ${days >= 0 ? `<span>·</span><span>${days === 0 ? 'Today' : `${days}d`}</span>` : ''}
            </div>
          </div>
          <div class="sub-cost">${formatCurrency(s.cost)}</div>
          <span class="sub-badge ${isSoon ? 'alert' : 'normal'}">${isSoon ? 'Due soon' : s.cycle}</span>
          <button class="sub-delete" data-id="${s.id}" title="Remove">✕</button>
        </div>`;
    })
    .join('');

  document.querySelectorAll('.sub-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const card = e.currentTarget.closest('.sub-card');
      card.classList.add('removing');
      setTimeout(() => {
        subs = subs.filter((s) => s.id !== id);
        saveSubs();
        render();
      }, 300);
    });
  });
}

function openModal(s) {
  if (s) {
    editingId = s.id;
    formName.value = s.name;
    formCost.value = s.cost;
    formCycle.value = s.cycle;
    formCategory.value = s.category;
    formDate.value = s.date;
    document.querySelector('.modal-header h2').textContent = 'Edit Subscription';
  } else {
    editingId = null;
    form.reset();
    document.querySelector('.modal-header h2').textContent = 'Add Subscription';
  }
  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
}

addBtn.addEventListener('click', () => openModal(null));
modalClose.addEventListener('click', closeModal);
formCancel.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = formName.value.trim();
  const cost = parseFloat(formCost.value);
  const cycle = formCycle.value;
  const category = formCategory.value;
  const date = formDate.value;

  if (!name || isNaN(cost) || cost <= 0 || !date) return;

  if (editingId) {
    const idx = subs.findIndex((s) => s.id === editingId);
    if (idx !== -1) {
      subs[idx] = { ...subs[idx], name, cost, cycle, category, date };
    }
  } else {
    subs.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, cost, cycle, category, date });
  }

  saveSubs();
  render();
  closeModal();
});

filterCat.addEventListener('change', render);
sortBy.addEventListener('change', render);

render();
