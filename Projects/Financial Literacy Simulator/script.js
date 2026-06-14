// --- State Management ---
const INITIAL_STATE = {
    isSetupComplete: false,
    month: 1,
    year: 1,
    cash: 0,
    income: 0,
    expenses: {
        housing: 1200,
        food: 600,
        transport: 400,
        utilities: 300,
        entertainment: 300,
        debtPayment: 200,
    },
    investments: { stocks: 0, crypto: 0, realEstate: 0 },
    debt: { studentLoan: 25000, creditCard: 1500 },
    eventsLog: [],
    score: 50
};

let state = JSON.parse(localStorage.getItem('fls_save')) || { ...INITIAL_STATE };

// --- DOM Elements ---
const DOM = {
    themeBtns: document.querySelectorAll('.theme-toggle, #themeToggleApp'),
    setupScreen: document.getElementById('setupScreen'),
    appLayout: document.getElementById('appLayout'),
    setupForm: document.getElementById('setupForm'),
    navBtns: document.querySelectorAll('.nav-btn'),
    sections: document.querySelectorAll('.view-section'),
    toast: document.getElementById('toast'),
    advanceBtn: document.getElementById('advanceBtn'),
    resetBtn: document.getElementById('resetBtn'),
    budgetSliders: document.getElementById('budgetSliders')
};

// --- Formatters ---
const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    if (state.isSetupComplete) {
        showApp();
        updateUI();
    } else {
        DOM.setupScreen.classList.remove('hidden');
    }

    setupEventListeners();
});

// --- Core Functions ---
function saveState() {
    localStorage.setItem('fls_save', JSON.stringify(state));
    updateUI();
}

function getCalculations() {
    const totalExp = Object.values(state.expenses).reduce((a, b) => a + Number(b), 0);
    const totalDebt = Object.values(state.debt).reduce((a, b) => a + Number(b), 0);
    const totalInv = Object.values(state.investments).reduce((a, b) => a + Number(b), 0);
    const netWorth = state.cash + totalInv - totalDebt;
    const netSavings = state.income - totalExp;
    return { totalExp, totalDebt, totalInv, netWorth, netSavings };
}

function updateUI() {
    const calc = getCalculations();

    // Header
    document.getElementById('timeDisplay').textContent = `Year ${state.year}, Month ${state.month}`;
    const scoreEl = document.getElementById('healthScoreDisplay');
    scoreEl.textContent = `${state.score}/100`;
    scoreEl.className = state.score > 70 ? 'text-accent' : state.score < 40 ? 'text-danger' : 'text-warning';

    // Dashboard
    document.getElementById('netWorthDisplay').textContent = formatMoney(calc.netWorth);
    document.getElementById('cashDisplay').textContent = formatMoney(state.cash);
    document.getElementById('totalDebtDisplay').textContent = formatMoney(calc.totalDebt);
    
    document.getElementById('dashIncome').textContent = `+${formatMoney(state.income)}`;
    document.getElementById('dashExpenses').textContent = `-${formatMoney(calc.totalExp)}`;
    
    const dashNetEl = document.getElementById('dashNetSavings');
    dashNetEl.textContent = formatMoney(calc.netSavings);
    dashNetEl.className = calc.netSavings >= 0 ? 'text-accent font-bold' : 'text-danger font-bold';

    renderEventsLog();

    // Budget
    document.getElementById('budgetTotalExp').textContent = formatMoney(calc.totalExp);
    document.getElementById('budgetLeftover').textContent = formatMoney(calc.netSavings);
    renderBudgetSliders();

    // Investments
    document.getElementById('totalInvestmentsDisplay').textContent = formatMoney(calc.totalInv);
    document.getElementById('invStocks').textContent = formatMoney(state.investments.stocks);
    document.getElementById('invCrypto').textContent = formatMoney(state.investments.crypto);
    document.getElementById('invRealEstate').textContent = formatMoney(state.investments.realEstate);

    // Debt
    document.getElementById('debtPageTotal').textContent = formatMoney(calc.totalDebt);
    document.getElementById('debtCreditCard').textContent = formatMoney(state.debt.creditCard);
    document.getElementById('debtStudentLoan').textContent = formatMoney(state.debt.studentLoan);
}

function advanceMonth() {
    const calc = getCalculations();
    let newCash = state.cash + calc.netSavings;
    let eventMsg = null;

    // 20% chance of random event
    if (Math.random() < 0.2) {
        const events = [
            { type: 'expense', amount: 800, msg: "Car breakdown! Repair cost $800." },
            { type: 'expense', amount: 1500, msg: "Medical emergency! Paid $1,500 out of pocket." },
            { type: 'income', amount: 500, msg: "Received a $500 performance bonus!" },
            { type: 'market', change: 0.05, msg: "Stock market rally! Portfolio grew." },
            { type: 'market', change: -0.04, msg: "Stock market dipped." }
        ];
        const evt = events[Math.floor(Math.random() * events.length)];
        
        if (evt.type === 'expense') {
            newCash -= evt.amount;
            if (newCash < 0) {
                state.debt.creditCard += Math.abs(newCash);
                newCash = 0;
                eventMsg = evt.msg + " Put on credit card.";
            } else {
                eventMsg = evt.msg;
            }
        } else if (evt.type === 'income') {
            newCash += evt.amount;
            eventMsg = evt.msg;
        } else if (evt.type === 'market') {
            state.investments.stocks *= (1 + evt.change);
            eventMsg = evt.msg;
        }
    }

    // Investment Fluctuations
    state.investments.stocks = Math.max(0, state.investments.stocks * (1 + (Math.random() * 0.06 - 0.02)));
    state.investments.crypto = Math.max(0, state.investments.crypto * (1 + (Math.random() * 0.2 - 0.1)));
    
    // Debt Interest
    state.debt.creditCard = state.debt.creditCard > 0 ? state.debt.creditCard * 1.02 : 0;
    state.debt.studentLoan = state.debt.studentLoan > 0 ? state.debt.studentLoan * 1.005 : 0;

    // Debt payments from budget
    if (state.expenses.debtPayment > 0) {
        if (state.debt.creditCard > 0) {
            let p = state.expenses.debtPayment;
            if (p > state.debt.creditCard) {
                p -= state.debt.creditCard;
                state.debt.creditCard = 0;
                state.debt.studentLoan = Math.max(0, state.debt.studentLoan - p);
            } else {
                state.debt.creditCard -= p;
            }
        } else {
            state.debt.studentLoan = Math.max(0, state.debt.studentLoan - state.expenses.debtPayment);
        }
    }

    // Time update
    state.month++;
    if (state.month > 12) { state.month = 1; state.year++; }
    state.cash = newCash;

    // Update Score
    if (state.cash > state.cash - calc.netSavings) state.score += 1;
    if (state.debt.creditCard > 1500) state.score -= 2;
    state.score = Math.min(100, Math.max(0, state.score));

    // Log
    if (eventMsg) {
        state.eventsLog.unshift({ month: state.month, year: state.year, msg: eventMsg });
        if (state.eventsLog.length > 15) state.eventsLog.pop();
    }

    saveState();
    showToast("Advanced 1 Month");
}

// --- Renderers ---
function renderEventsLog() {
    const el = document.getElementById('eventsLog');
    if (state.eventsLog.length === 0) {
        el.innerHTML = '<p class="text-muted text-center mt-4">No events yet.</p>';
        return;
    }
    el.innerHTML = state.eventsLog.map(log => `
        <div class="log-entry">
            <div class="log-date">Yr ${log.year}, Mo ${log.month}</div>
            <div>${log.msg}</div>
        </div>
    `).join('');
}

function renderBudgetSliders() {
    DOM.budgetSliders.innerHTML = Object.keys(state.expenses).map(key => `
        <div class="slider-group">
            <div class="slider-header">
                <span>${key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span>${formatMoney(state.expenses[key])}</span>
            </div>
            <input type="range" min="0" max="${key === 'housing' ? 3000 : 1500}" step="50" 
                   value="${state.expenses[key]}" data-key="${key}" class="budget-input">
        </div>
    `).join('');

    document.querySelectorAll('.budget-input').forEach(input => {
        input.addEventListener('input', (e) => {
            state.expenses[e.target.dataset.key] = Number(e.target.value);
            saveState(); // triggers updateUI
        });
    });
}

// --- Interaction Actions ---
window.buyAsset = (type, amount) => {
    if (state.cash >= amount) {
        state.cash -= amount;
        state.investments[type] += amount;
        saveState();
        showToast(`Bought ${formatMoney(amount)} of ${type}`);
    } else {
        alert("Not enough cash!");
    }
};

window.sellAsset = (type, amount) => {
    if (state.investments[type] >= amount) {
        state.investments[type] -= amount;
        state.cash += amount;
        saveState();
        showToast(`Sold ${formatMoney(amount)} of ${type}`);
    } else {
        alert("Not enough assets to sell!");
    }
};

window.payDebt = (type, amount) => {
    if (state.debt[type] === 0) {
        alert("Debt is already paid off!");
        return;
    }
    if (state.cash >= amount) {
        const actualPay = Math.min(amount, state.debt[type]);
        state.cash -= actualPay;
        state.debt[type] -= actualPay;
        saveState();
        showToast(`Paid ${formatMoney(actualPay)} towards ${type}`);
    } else {
        alert("Not enough cash to make this extra payment.");
    }
};

// --- Event Listeners & Helpers ---
function setupEventListeners() {
    DOM.themeBtns.forEach(btn => btn.addEventListener('click', toggleTheme));
    
    DOM.setupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const income = Number(document.getElementById('startingIncome').value);
        state = { ...INITIAL_STATE, isSetupComplete: true, income: income, cash: income * 1.5 };
        state.eventsLog = [{ month: 1, year: 1, msg: `Simulation started with ${formatMoney(income)}/mo income.` }];
        saveState();
        showApp();
    });

    DOM.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            DOM.sections.forEach(s => s.classList.add('hidden'));
            DOM.sections.forEach(s => s.classList.remove('active'));
            document.getElementById(btn.dataset.target + 'View').classList.remove('hidden');
            document.getElementById(btn.dataset.target + 'View').classList.add('active');
        });
    });

    DOM.advanceBtn.addEventListener('click', advanceMonth);

    DOM.resetBtn.addEventListener('click', () => {
        if(confirm("Are you sure you want to reset all progress?")) {
            localStorage.removeItem('fls_save');
            state = { ...INITIAL_STATE };
            DOM.appLayout.classList.add('hidden');
            DOM.setupScreen.classList.remove('hidden');
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('fls_theme', 'dark');
        }
    });
}

function showApp() {
    DOM.setupScreen.classList.add('hidden');
    DOM.appLayout.classList.remove('hidden');
    updateUI();
}

function initTheme() {
    const savedTheme = localStorage.getItem('fls_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('fls_theme', newTheme);
}

function showToast(msg) {
    DOM.toast.textContent = msg;
    DOM.toast.classList.remove('hidden');
    setTimeout(() => DOM.toast.classList.add('hidden'), 3000);
}
