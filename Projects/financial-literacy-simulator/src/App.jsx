import { useState, useEffect } from 'react';
import './index.css';

// --- Default Data & Constants ---
const INITIAL_STATE = {
  isSetupComplete: false,
  month: 1,
  year: 1,
  netWorth: 0,
  cash: 5000,
  income: 4000,
  expenses: {
    housing: 1200,
    food: 600,
    transport: 400,
    utilities: 300,
    entertainment: 300,
    debtPayment: 200,
  },
  investments: {
    stocks: 0,
    crypto: 0,
    realEstate: 0,
  },
  debt: {
    studentLoan: 25000,
    creditCard: 1500,
  },
  eventsLog: [],
  score: 50
};

// --- Helper Formatting ---
const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('fls_theme') || 'dark');
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('fls_save');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  // Side effect for theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fls_theme', theme);
  }, [theme]);

  // Save game state automatically
  useEffect(() => {
    localStorage.setItem('fls_save', JSON.stringify(gameState));
  }, [gameState]);

  // Total Expenses calculation
  const totalExpenses = Object.values(gameState.expenses).reduce((a, b) => a + Number(b), 0);
  const totalDebt = Object.values(gameState.debt).reduce((a, b) => a + Number(b), 0);
  const totalInvestments = Object.values(gameState.investments).reduce((a, b) => a + Number(b), 0);
  const netWorth = gameState.cash + totalInvestments - totalDebt;

  // --- Actions ---
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const startSimulation = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const startingIncome = Number(formData.get('income'));
    setGameState({
      ...INITIAL_STATE,
      isSetupComplete: true,
      income: startingIncome,
      cash: startingIncome * 1.5, // Start with 1.5x monthly income
      eventsLog: [{ month: 1, year: 1, msg: `Simulation started with $${startingIncome}/mo income.` }]
    });
  };

  const advanceMonth = () => {
    setGameState(prev => {
      // 1. Calculate base cash flow
      let newCash = prev.cash + prev.income - totalExpenses;
      
      // 2. Generate random events (20% chance)
      let eventMsg = null;
      let newDebt = { ...prev.debt };
      let newIncome = prev.income;
      
      if (Math.random() < 0.2) {
        const events = [
          { type: 'expense', amount: 800, msg: "Car breakdown! Repair cost $800." },
          { type: 'expense', amount: 1500, msg: "Medical emergency! Paid $1,500 out of pocket." },
          { type: 'income', amount: 500, msg: "Received a $500 bonus at work!" },
          { type: 'market', change: 0.05, msg: "Stock market is up 5%." },
          { type: 'market', change: -0.04, msg: "Stock market dipped by 4%." }
        ];
        const evt = events[Math.floor(Math.random() * events.length)];
        
        if (evt.type === 'expense') {
          newCash -= evt.amount;
          if (newCash < 0) {
            newDebt.creditCard += Math.abs(newCash); // Go into credit card debt
            newCash = 0;
            eventMsg = evt.msg + " You didn't have enough cash, so it went on your credit card.";
          } else {
            eventMsg = evt.msg;
          }
        } else if (evt.type === 'income') {
          newCash += evt.amount;
          eventMsg = evt.msg;
        }
      }

      // 3. Update Investments (Random fluctuation if no explicit market event happened)
      let newInvestments = { ...prev.investments };
      newInvestments.stocks = Math.max(0, newInvestments.stocks * (1 + (Math.random() * 0.06 - 0.02))); // -2% to +4%
      newInvestments.crypto = Math.max(0, newInvestments.crypto * (1 + (Math.random() * 0.2 - 0.1))); // -10% to +10%

      // 4. Update Debt (Interest)
      newDebt.creditCard = newDebt.creditCard > 0 ? newDebt.creditCard * 1.02 : 0; // 2% monthly interest
      newDebt.studentLoan = newDebt.studentLoan > 0 ? newDebt.studentLoan * 1.005 : 0; // 0.5% monthly interest
      
      // Pay down debt from budget
      if (prev.expenses.debtPayment > 0 && newDebt.creditCard > 0) {
         let payment = prev.expenses.debtPayment;
         if (payment > newDebt.creditCard) {
            payment -= newDebt.creditCard;
            newDebt.creditCard = 0;
            newDebt.studentLoan = Math.max(0, newDebt.studentLoan - payment);
         } else {
            newDebt.creditCard -= payment;
         }
      } else if (prev.expenses.debtPayment > 0) {
         newDebt.studentLoan = Math.max(0, newDebt.studentLoan - prev.expenses.debtPayment);
      }

      // 5. Time update
      let nextMonth = prev.month + 1;
      let nextYear = prev.year;
      if (nextMonth > 12) { nextMonth = 1; nextYear++; }

      // 6. Log updating
      const newLog = [...prev.eventsLog];
      if (eventMsg) {
        newLog.unshift({ month: nextMonth, year: nextYear, msg: eventMsg });
      }
      if (newLog.length > 20) newLog.pop(); // Keep log size manageable

      // 7. Update Score
      let newScore = prev.score;
      if (newCash > prev.cash) newScore += 1;
      if (newDebt.creditCard > prev.debt.creditCard) newScore -= 2;
      newScore = Math.min(100, Math.max(0, newScore));

      return {
        ...prev,
        month: nextMonth,
        year: nextYear,
        cash: newCash,
        debt: newDebt,
        investments: newInvestments,
        eventsLog: newLog,
        score: newScore
      };
    });
  };

  const resetSimulation = () => {
    if(window.confirm("Are you sure you want to reset your progress?")) {
      setGameState(INITIAL_STATE);
    }
  };

  // --- Sub-components (Render Functions) ---
  if (!gameState.isSetupComplete) {
    return (
      <div className="app-container" style={{ justifyContent: 'center' }}>
        <button className="btn btn-outline" style={{position:'absolute', top:'20px', right:'20px'}} onClick={toggleTheme}>Toggle Theme</button>
        <div className="setup-screen card">
          <h1>Financial Literacy Simulator</h1>
          <p>Embark on a virtual journey to master budgeting, saving, and investing. See how the decisions you make today affect your wealth tomorrow.</p>
          <form onSubmit={startSimulation} style={{textAlign:'left'}}>
            <div className="form-group">
              <label>Select Starting Monthly Salary</label>
              <select name="income" className="form-control" defaultValue="4000">
                <option value="2500">$2,500 / mo (Entry Level)</option>
                <option value="4000">$4,000 / mo (Professional)</option>
                <option value="7000">$7,000 / mo (Senior)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>Start Simulation</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="header">
        <h1>📊 FinSim <span style={{fontSize:'1rem', color:'var(--text-secondary)'}}>Year {gameState.year}, Month {gameState.month}</span></h1>
        <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
          <div style={{fontWeight:'bold'}}>Health Score: <span style={{color: gameState.score > 70 ? 'var(--accent)' : gameState.score < 40 ? 'var(--danger)' : 'var(--warning)'}}>{gameState.score}/100</span></div>
          <button className="btn" onClick={toggleTheme} style={{background:'var(--bg-card)', color:'var(--text-primary)'}}>🌓</button>
        </div>
      </header>

      {/* Main App Area */}
      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`nav-btn ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>Budget & Cash Flow</button>
          <button className={`nav-btn ${activeTab === 'investments' ? 'active' : ''}`} onClick={() => setActiveTab('investments')}>Investments</button>
          <button className={`nav-btn ${activeTab === 'debt' ? 'active' : ''}`} onClick={() => setActiveTab('debt')}>Debt Management</button>
          <div style={{flex:1}}></div>
          <button className="nav-btn" style={{color: 'var(--danger)'}} onClick={resetSimulation}>Reset Simulation</button>
        </aside>

        {/* Workspace Area */}
        <main className="workspace">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="fade-in">
              <div className="card-title">Financial Overview</div>
              <div className="grid-3 mb-2">
                <div className="card stat-card stat-positive">
                  <div className="stat-label">Net Worth</div>
                  <div className="stat-value">{formatMoney(netWorth)}</div>
                </div>
                <div className="card stat-card">
                  <div className="stat-label">Available Cash</div>
                  <div className="stat-value" style={{color: 'var(--info)'}}>{formatMoney(gameState.cash)}</div>
                </div>
                <div className="card stat-card stat-negative">
                  <div className="stat-label">Total Debt</div>
                  <div className="stat-value">{formatMoney(totalDebt)}</div>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-title">Cash Flow Summary (Monthly)</div>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                    <span>Income:</span>
                    <span style={{color:'var(--accent)'}}>+{formatMoney(gameState.income)}</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                    <span>Expenses:</span>
                    <span style={{color:'var(--danger)'}}>-{formatMoney(totalExpenses)}</span>
                  </div>
                  <hr style={{borderColor:'var(--border)', margin:'1rem 0'}}/>
                  <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold'}}>
                    <span>Net Savings:</span>
                    <span style={{color: (gameState.income - totalExpenses) >= 0 ? 'var(--accent)' : 'var(--danger)'}}>
                      {formatMoney(gameState.income - totalExpenses)}
                    </span>
                  </div>
                  
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-primary" style={{width: '100%', padding:'1rem', fontSize:'1.1rem'}} onClick={advanceMonth}>
                      ⏩ Advance 1 Month
                    </button>
                    <p style={{textAlign:'center', fontSize:'0.85rem', color:'var(--text-secondary)', marginTop:'0.5rem'}}>Click to simulate the next month's finances</p>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Recent Events Log</div>
                  <div style={{maxHeight:'250px', overflowY:'auto'}}>
                    {gameState.eventsLog.length === 0 ? <p className="text-muted">No major events yet.</p> : 
                      gameState.eventsLog.map((log, i) => (
                        <div key={i} style={{padding:'0.75rem', borderBottom:'1px solid var(--border)', fontSize:'0.9rem'}}>
                          <div style={{fontWeight:'bold', color:'var(--text-secondary)', fontSize:'0.8rem'}}>Yr {log.year}, Mo {log.month}</div>
                          <div>{log.msg}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div className="fade-in">
              <div className="card-title">Monthly Budget Planner</div>
              <p style={{marginBottom:'1.5rem', color:'var(--text-secondary)'}}>Adjust your lifestyle choices. Lowering expenses increases your monthly savings rate.</p>
              
              <div className="grid-2">
                <div className="card">
                  <h3 style={{marginBottom:'1rem'}}>Fixed & Variable Expenses</h3>
                  
                  {Object.keys(gameState.expenses).map(key => (
                    <div className="form-group" key={key}>
                      <label style={{textTransform:'capitalize'}}>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                      <input 
                        type="range" 
                        min="0" 
                        max={key === 'housing' ? 3000 : 1500} 
                        step="50"
                        value={gameState.expenses[key]} 
                        onChange={(e) => setGameState(prev => ({
                          ...prev, 
                          expenses: { ...prev.expenses, [key]: Number(e.target.value) }
                        }))}
                        style={{width:'100%', marginBottom:'0.5rem'}}
                      />
                      <div style={{textAlign:'right', fontFamily:'monospace', color:'var(--danger)'}}>{formatMoney(gameState.expenses[key])}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="card stat-card stat-negative">
                    <div className="stat-label">Total Monthly Expenses</div>
                    <div className="stat-value">{formatMoney(totalExpenses)}</div>
                  </div>
                  <div className="card stat-card stat-positive">
                    <div className="stat-label">Leftover for Savings/Investing</div>
                    <div className="stat-value">{formatMoney(gameState.income - totalExpenses)}</div>
                  </div>
                  <div className="card">
                    <h4>Budgeting Tip</h4>
                    <p style={{fontSize:'0.9rem', color:'var(--text-secondary)', marginTop:'0.5rem'}}>
                      Following the 50/30/20 rule? Try to keep Needs (housing, food, utilities) under 50% of your income (${formatMoney(gameState.income * 0.5)}), Wants under 30% (${formatMoney(gameState.income * 0.3)}), and allocate 20% (${formatMoney(gameState.income * 0.2)}) to savings and debt payoff.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Investments Tab */}
          {activeTab === 'investments' && (
            <div className="fade-in">
              <div className="card-title">Investment Portfolio</div>
              <div className="card stat-card stat-positive mb-2">
                <div className="stat-label">Total Invested Value</div>
                <div className="stat-value">{formatMoney(totalInvestments)}</div>
              </div>

              <div className="grid-3">
                {/* Stocks */}
                <div className="card">
                  <h3>Index Funds (Stocks)</h3>
                  <div style={{fontSize:'1.5rem', fontWeight:'bold', margin:'1rem 0', color:'var(--info)'}}>{formatMoney(gameState.investments.stocks)}</div>
                  <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'1rem'}}>Moderate risk. Historical return ~7-10% annually.</p>
                  <button className="btn btn-outline" style={{width:'100%', borderColor:'var(--accent)', color:'var(--accent)'}} onClick={() => {
                    if (gameState.cash >= 500) {
                      setGameState(p => ({ ...p, cash: p.cash - 500, investments: {...p.investments, stocks: p.investments.stocks + 500} }));
                    } else alert("Not enough cash!");
                  }}>Buy $500</button>
                  <button className="btn btn-outline" style={{width:'100%', marginTop:'0.5rem', borderColor:'var(--danger)', color:'var(--danger)'}} onClick={() => {
                    if (gameState.investments.stocks >= 500) {
                      setGameState(p => ({ ...p, cash: p.cash + 500, investments: {...p.investments, stocks: p.investments.stocks - 500} }));
                    }
                  }}>Sell $500</button>
                </div>

                {/* Crypto */}
                <div className="card">
                  <h3>Crypto</h3>
                  <div style={{fontSize:'1.5rem', fontWeight:'bold', margin:'1rem 0', color:'var(--warning)'}}>{formatMoney(gameState.investments.crypto)}</div>
                  <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'1rem'}}>High risk. Highly volatile.</p>
                  <button className="btn btn-outline" style={{width:'100%', borderColor:'var(--accent)', color:'var(--accent)'}} onClick={() => {
                    if (gameState.cash >= 100) {
                      setGameState(p => ({ ...p, cash: p.cash - 100, investments: {...p.investments, crypto: p.investments.crypto + 100} }));
                    } else alert("Not enough cash!");
                  }}>Buy $100</button>
                   <button className="btn btn-outline" style={{width:'100%', marginTop:'0.5rem', borderColor:'var(--danger)', color:'var(--danger)'}} onClick={() => {
                    if (gameState.investments.crypto >= 100) {
                      setGameState(p => ({ ...p, cash: p.cash + 100, investments: {...p.investments, crypto: p.investments.crypto - 100} }));
                    }
                  }}>Sell $100</button>
                </div>

                {/* Real Estate */}
                <div className="card">
                  <h3>Real Estate (REITs)</h3>
                  <div style={{fontSize:'1.5rem', fontWeight:'bold', margin:'1rem 0', color:'var(--accent)'}}>{formatMoney(gameState.investments.realEstate)}</div>
                  <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'1rem'}}>Low risk. Steady slow growth and dividends.</p>
                  <button className="btn btn-outline" style={{width:'100%', borderColor:'var(--accent)', color:'var(--accent)'}} onClick={() => {
                    if (gameState.cash >= 1000) {
                      setGameState(p => ({ ...p, cash: p.cash - 1000, investments: {...p.investments, realEstate: p.investments.realEstate + 1000} }));
                    } else alert("Not enough cash! Need $1000.");
                  }}>Buy $1,000</button>
                   <button className="btn btn-outline" style={{width:'100%', marginTop:'0.5rem', borderColor:'var(--danger)', color:'var(--danger)'}} onClick={() => {
                    if (gameState.investments.realEstate >= 1000) {
                      setGameState(p => ({ ...p, cash: p.cash + 1000, investments: {...p.investments, realEstate: p.investments.realEstate - 1000} }));
                    }
                  }}>Sell $1,000</button>
                </div>
              </div>
            </div>
          )}

          {/* Debt Tab */}
          {activeTab === 'debt' && (
            <div className="fade-in">
              <div className="card-title">Debt Management</div>
              <div className="card stat-card stat-negative mb-2">
                <div className="stat-label">Total Outstanding Debt</div>
                <div className="stat-value">{formatMoney(totalDebt)}</div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <h3>Credit Card Debt</h3>
                  <div style={{fontSize:'2rem', fontWeight:'bold', color:'var(--danger)', margin:'1rem 0'}}>{formatMoney(gameState.debt.creditCard)}</div>
                  <p style={{fontSize:'0.9rem', color:'var(--text-secondary)'}}>Interest Rate: 24% APR (2% per month)</p>
                  <p style={{fontSize:'0.85rem', color:'var(--warning)', marginTop:'1rem'}}>Warning: High interest debt should be paid off immediately to avoid compounding interest traps.</p>
                  
                  <button className="btn btn-outline" style={{marginTop:'1.5rem', width:'100%'}} onClick={() => {
                    if(gameState.cash >= 500 && gameState.debt.creditCard > 0) {
                       const amount = Math.min(500, gameState.debt.creditCard);
                       setGameState(p => ({ ...p, cash: p.cash - amount, debt: {...p.debt, creditCard: p.debt.creditCard - amount} }));
                    } else if (gameState.debt.creditCard === 0) {
                       alert("Credit card is fully paid off!");
                    } else {
                       alert("Not enough cash to make a $500 extra payment.");
                    }
                  }}>Make $500 Extra Payment</button>
                </div>

                <div className="card">
                  <h3>Student Loans</h3>
                  <div style={{fontSize:'2rem', fontWeight:'bold', color:'var(--danger)', margin:'1rem 0'}}>{formatMoney(gameState.debt.studentLoan)}</div>
                  <p style={{fontSize:'0.9rem', color:'var(--text-secondary)'}}>Interest Rate: 6% APR (0.5% per month)</p>
                  <p style={{fontSize:'0.85rem', color:'var(--info)', marginTop:'1rem'}}>Note: Lower interest debt. Continue making regular monthly payments from your budget.</p>

                  <button className="btn btn-outline" style={{marginTop:'1.5rem', width:'100%'}} onClick={() => {
                    if(gameState.cash >= 1000 && gameState.debt.studentLoan > 0) {
                       const amount = Math.min(1000, gameState.debt.studentLoan);
                       setGameState(p => ({ ...p, cash: p.cash - amount, debt: {...p.debt, studentLoan: p.debt.studentLoan - amount} }));
                    } else if (gameState.debt.studentLoan === 0) {
                       alert("Student loan is fully paid off!");
                    } else {
                       alert("Not enough cash to make a $1000 extra payment.");
                    }
                  }}>Make $1,000 Extra Payment</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
