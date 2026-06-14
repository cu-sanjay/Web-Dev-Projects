const INITIAL_CASH = 100000;
const INITIAL_VALUATION = 500000;
const TARGET_VALUATION = 10000000;

const state = {
  month: 1,
  cash: INITIAL_CASH,
  valuation: INITIAL_VALUATION,
  users: 0,
  
  team: {
    engineer: { count: 0, cost: 8000, valueAdd: 20000 },
    marketer: { count: 0, cost: 5000, usersAdd: 500 },
    sales: { count: 0, cost: 6000, revenueAdd: 10000 }
  },

  gameOver: false
};

const UI = {
  month: document.getElementById('stat-month'),
  cash: document.getElementById('stat-cash'),
  burn: document.getElementById('stat-burn'),
  valuation: document.getElementById('stat-valuation'),
  users: document.getElementById('stat-users'),
  growth: document.getElementById('stat-growth'),
  
  counts: {
    engineer: document.getElementById('count-engineers'),
    marketer: document.getElementById('count-marketers'),
    sales: document.getElementById('count-sales')
  },
  
  log: document.getElementById('event-log'),
  modal: document.getElementById('game-over-modal'),
  modalTitle: document.getElementById('modal-title'),
  modalMessage: document.getElementById('modal-message')
};

const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

function logEvent(message) {
  const li = document.createElement('li');
  li.textContent = `Month ${state.month}: ${message}`;
  UI.log.prepend(li);
}

function updateUI() {
  UI.month.textContent = state.month;
  UI.cash.textContent = formatCurrency(state.cash);
  UI.valuation.textContent = formatCurrency(state.valuation);
  UI.users.textContent = formatNumber(state.users);
  
  UI.counts.engineer.textContent = state.team.engineer.count;
  UI.counts.marketer.textContent = state.team.marketer.count;
  UI.counts.sales.textContent = state.team.sales.count;

  // Calculate monthly deltas
  let monthlyBurn = 0;
  Object.values(state.team).forEach(role => {
    monthlyBurn += role.count * role.cost;
  });
  
  let monthlyRev = state.team.sales.count * state.team.sales.revenueAdd;
  let netBurn = monthlyBurn - monthlyRev;
  
  UI.burn.textContent = `Net Cashflow: ${netBurn > 0 ? '-' : '+'}${formatCurrency(Math.abs(netBurn))} /mo`;
  UI.burn.style.color = netBurn > 0 ? 'var(--accent-red)' : 'var(--accent-green)';
  
  let monthlyUsers = state.team.marketer.count * state.team.marketer.usersAdd;
  UI.growth.textContent = `+${formatNumber(monthlyUsers)} /mo`;

  if (state.cash < 0) {
    state.cash = 0;
  }
}

const game = {
  hire: function(role) {
    if (state.gameOver) return;
    if (state.cash >= state.team[role].cost) {
      state.cash -= state.team[role].cost;
      state.team[role].count++;
      logEvent(`Hired a new ${role}!`);
      updateUI();
    } else {
      alert("Not enough cash to hire upfront!");
    }
  },

  raiseCapital: function() {
    if (state.gameOver) return;
    let costVal = state.valuation * 0.20;
    state.valuation -= costVal;
    state.cash += 250000;
    logEvent(`Raised $250k seed capital by giving up 20% equity.`);
    updateUI();
  },

  launchCampaign: function() {
    if (state.gameOver) return;
    if (state.cash >= 20000) {
      state.cash -= 20000;
      state.users += 5000;
      state.valuation += 50000;
      logEvent(`Launched viral campaign! Gained 5,000 users.`);
      updateUI();
    } else {
      alert("Need $20k cash for a viral campaign.");
    }
  },

  releaseFeature: function() {
    if (state.gameOver) return;
    if (state.team.engineer.count >= 2) {
      state.valuation += 100000;
      logEvent(`Released major feature! Valuation increased by $100k.`);
      updateUI();
    } else {
      alert("Need at least 2 Engineers to release a major feature.");
    }
  },

  nextMonth: function() {
    if (state.gameOver) return;
    
    // Process Month
    state.month++;
    
    let expenses = 0;
    let revenue = 0;
    
    expenses += state.team.engineer.count * state.team.engineer.cost;
    expenses += state.team.marketer.count * state.team.marketer.cost;
    expenses += state.team.sales.count * state.team.sales.cost;
    
    revenue += state.team.sales.count * state.team.sales.revenueAdd;
    
    state.cash = state.cash - expenses + revenue;
    
    state.valuation += state.team.engineer.count * state.team.engineer.valueAdd;
    state.users += state.team.marketer.count * state.team.marketer.usersAdd;

    logEvent(`Advanced to next month. Paid salaries and generated revenue.`);

    updateUI();
    this.checkWinLoss();
  },

  checkWinLoss: function() {
    if (state.cash <= 0) {
      this.endGame(false);
    } else if (state.valuation >= TARGET_VALUATION) {
      this.endGame(true);
    }
  },

  endGame: function(won) {
    state.gameOver = true;
    UI.modal.classList.remove('hidden');
    if (won) {
      UI.modalTitle.textContent = "🎉 Unicorn Achieved!";
      UI.modalTitle.style.color = "var(--accent-green)";
      UI.modalMessage.textContent = `You reached a $10M valuation in ${state.month} months. You won!`;
    } else {
      UI.modalTitle.textContent = "💀 Bankrupt!";
      UI.modalTitle.style.color = "var(--accent-red)";
      UI.modalMessage.textContent = `You ran out of cash in month ${state.month}. Better luck next time!`;
    }
  },

  restart: function() {
    state.month = 1;
    state.cash = INITIAL_CASH;
    state.valuation = INITIAL_VALUATION;
    state.users = 0;
    state.team.engineer.count = 0;
    state.team.marketer.count = 0;
    state.team.sales.count = 0;
    state.gameOver = false;
    
    UI.log.innerHTML = "<li>Day 1: Startup founded. Let's get to work!</li>";
    UI.modal.classList.add('hidden');
    updateUI();
  }
};

document.getElementById('restart-btn').addEventListener('click', game.restart);

// Init
updateUI();
