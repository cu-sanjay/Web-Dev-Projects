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

const activity = [
  { type: "Deposit", asset: "Cash Balance", date: "Oct 15, 2026", amount: 250.00 },
  { type: "Auto-Invest", asset: "S&P 500 ETF", date: "Oct 15, 2026", amount: 150.00 },
  { type: "Round-Up", asset: "Tech Stocks", date: "Oct 14, 2026", amount: 1.45 },
  { type: "Round-Up", asset: "Tech Stocks", date: "Oct 13, 2026", amount: 0.80 },
  { type: "Dividend", asset: "Bonds ETF", date: "Oct 01, 2026", amount: 12.50 }
];

const allocations = [
  { id: 'alloc-sp500', name: "S&P 500 ETF", value: 60, color: "var(--green)" },
  { id: 'alloc-tech', name: "Tech Stocks", value: 20, color: "var(--blue)" },
  { id: 'alloc-crypto', name: "Crypto", value: 10, color: "var(--orange)" },
  { id: 'alloc-bonds', name: "Bonds", value: 10, color: "var(--purple)" }
];

const roundups = [
  { purchase: "Starbucks Coffee", cost: 4.55, roundup: 0.45, status: "Invested" },
  { purchase: "Uber Ride", cost: 14.20, roundup: 0.80, status: "Invested" },
  { purchase: "Spotify Subs", cost: 9.99, roundup: 0.01, status: "Invested" },
  { purchase: "Whole Foods", cost: 42.15, roundup: 0.85, status: "Pending" }
];

// --- Rendering Functions ---

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function renderActivity() {
  const tbody = document.getElementById('recent-activity-tbody');
  if(!tbody) return;

  tbody.innerHTML = activity.map(act => `
    <tr>
      <td><span class="badge" style="background: var(--surface); border: 1px solid var(--border); color: var(--text-main);">${act.type}</span></td>
      <td><strong>${act.asset}</strong></td>
      <td>${act.date}</td>
      <td class="amount-pos">+${formatCurrency(act.amount)}</td>
    </tr>
  `).join('');
}

function renderRoundups() {
  const tbody = document.getElementById('roundup-tbody');
  if(!tbody) return;

  tbody.innerHTML = roundups.map(r => `
    <tr>
      <td><strong>${r.purchase}</strong></td>
      <td>${formatCurrency(r.cost)}</td>
      <td class="text-green">+${formatCurrency(r.roundup)}</td>
      <td><span class="badge" style="background: ${r.status === 'Invested' ? 'var(--green-light)' : 'var(--orange-light)'}; color: ${r.status === 'Invested' ? 'var(--green)' : 'var(--orange)'}; border: none;">${r.status}</span></td>
    </tr>
  `).join('');
}

function renderAllocations() {
  const container = document.getElementById('allocation-sliders');
  if(!container) return;

  container.innerHTML = allocations.map(a => `
    <div class="allocation-item">
      <div class="alloc-header">
        <span><span class="dot" style="background: ${a.color}"></span> ${a.name}</span>
        <span id="${a.id}-val">${a.value}%</span>
      </div>
      <input type="range" id="${a.id}" min="0" max="100" value="${a.value}" oninput="updateAllocation('${a.id}')" style="accent-color: ${a.color};">
    </div>
  `).join('');
}

window.updateAllocation = function(id) {
  const slider = document.getElementById(id);
  const valDisplay = document.getElementById(id + '-val');
  if(slider && valDisplay) {
    valDisplay.innerText = slider.value + '%';
  }
  
  // Calc total
  let total = 0;
  allocations.forEach(a => {
    const s = document.getElementById(a.id);
    if(s) total += parseInt(s.value);
  });
  
  const totalDisplay = document.getElementById('total-alloc');
  if(totalDisplay) {
    totalDisplay.innerText = total + '%';
    totalDisplay.style.color = total === 100 ? 'var(--green)' : 'var(--red)';
  }
}

window.calculateForecast = function() {
  const initial = parseFloat(document.getElementById('calc-initial').value);
  const monthly = parseFloat(document.getElementById('calc-monthly').value);
  const rate = parseFloat(document.getElementById('calc-rate').value) / 100;
  const years = parseInt(document.getElementById('calc-years').value);

  if (isNaN(initial) || isNaN(monthly) || isNaN(rate) || isNaN(years)) return;

  const months = years * 12;
  const monthlyRate = rate / 12;

  // Future Value of a Series formula + Compound Interest for Principal
  const futureValueOfPrincipal = initial * Math.pow(1 + monthlyRate, months);
  const futureValueOfContributions = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  const totalValue = futureValueOfPrincipal + futureValueOfContributions;
  const totalContributions = initial + (monthly * months);
  const interestEarned = totalValue - totalContributions;

  document.getElementById('forecast-result').innerText = formatCurrency(totalValue);
  document.getElementById('forecast-breakdown').innerText = `Total Contributions: ${formatCurrency(totalContributions)} | Interest Earned: ${formatCurrency(interestEarned)}`;
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  renderActivity();
  renderRoundups();
  renderAllocations();
});
