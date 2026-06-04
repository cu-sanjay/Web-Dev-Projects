const STATE = {
  rates: null,
  baseCode: 'USD',
  targetCode: 'INR',
  lastUpdated: null,
  history: [],
};

const CACHE_KEY = 'cc_rates_cache';
const HISTORY_KEY = 'cc_history';
const API_URL = 'https://open.er-api.com/v6/latest/USD';
const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW', 'MXN', 'BRL', 'NZD', 'SEK', 'NOK', 'SGD', 'MYR', 'PHP', 'PKR', 'BDT', 'LKR', 'NGN'];
const FLAG_OFFSET = 0x1F1E5;

function getFlagEmoji(code) {
  if (!code || code.length !== 2) return '';
  const a = code.charCodeAt(0) - 65 + FLAG_OFFSET;
  const b = code.charCodeAt(1) - 65 + FLAG_OFFSET;
  return String.fromCodePoint(a, b);
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) STATE.history = JSON.parse(raw);
  } catch {
    STATE.history = [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(STATE.history.slice(0, 50)));
  } catch {}
}

function addHistory(fromCur, toCur, fromAmt, toAmt, rate) {
  STATE.history.unshift({
    from: fromCur,
    to: toCur,
    fromAmt,
    toAmt,
    rate,
    time: Date.now(),
  });
  if (STATE.history.length > 50) STATE.history = STATE.history.slice(0, 50);
  saveHistory();
  renderHistory();
  document.getElementById('historyCount').textContent = STATE.history.length;
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (STATE.history.length === 0) {
    list.innerHTML = '<div class="history-empty">No conversions yet.</div>';
    return;
  }
  list.innerHTML = STATE.history
    .map((h) => {
      const d = new Date(h.time);
      const t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="history-item">
          <div class="history-item-left">
            <span class="history-item-conversion">${getFlagEmoji(h.from)} ${h.from} ${h.fromAmt} → ${getFlagEmoji(h.to)} ${h.to} ${h.toAmt}</span>
            <span class="history-item-rate">Rate: ${h.rate}</span>
          </div>
          <span class="history-item-time">${t}</span>
        </div>`;
    })
    .join('');
}

function showToast(message, type = 'error') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function formatTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

async function fetchRates() {
  const loader = document.getElementById('loaderOverlay');
  loader.classList.add('active');
  document.getElementById('statusText').textContent = 'Loading...';

  try {
    const res = await fetch(API_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.result !== 'success') throw new Error('API error');
    STATE.rates = data.rates;
    STATE.baseCode = data.base_code || 'USD';
    STATE.lastUpdated = data.time_last_update_utc || data.time_last_update_utc || null;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data.rates, base: data.base_code || 'USD', updated: STATE.lastUpdated }));
    document.getElementById('statusText').textContent = 'Live';
    populateCurrencies();
    convert();
    updateRateInfo();
    loader.classList.remove('active');
    showToast('Rates updated successfully', 'success');
  } catch (err) {
    console.warn('API fetch failed, trying cache:', err.message);
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        STATE.rates = parsed.rates;
        STATE.baseCode = parsed.base || 'USD';
        STATE.lastUpdated = parsed.updated || null;
        document.getElementById('statusText').textContent = 'Cached';
        populateCurrencies();
        convert();
        updateRateInfo();
        loader.classList.remove('active');
        showToast('Using cached rates (offline)', 'warning');
        return;
      } catch {
        showToast('Cached data corrupted', 'error');
      }
    }
    loader.classList.remove('active');
    document.getElementById('statusText').textContent = 'Offline';
    showToast('Failed to fetch rates. Check connection.', 'error');
  }
}

function populateCurrencies() {
  const fromSel = document.getElementById('fromCurrency');
  const toSel = document.getElementById('toCurrency');
  const codes = STATE.rates ? Object.keys(STATE.rates).filter((c) => POPULAR_CURRENCIES.includes(c)).sort() : POPULAR_CURRENCIES;
  const allCodes = STATE.rates ? Object.keys(STATE.rates).sort() : [];
  const merged = [...new Set([...codes, ...allCodes.filter((c) => !codes.includes(c))])];

  const renderOpts = (sel, selected) => {
    sel.innerHTML = merged
      .map((c) => {
        const flag = getFlagEmoji(c);
        const name = STATE.rates ? `${flag} ${c}` : c;
        return `<option value="${c}"${c === selected ? ' selected' : ''}>${name}</option>`;
      })
      .join('');
  };

  renderOpts(fromSel, STATE.baseCode);
  const target = STATE.rates && STATE.rates[STATE.targetCode] ? STATE.targetCode : 'INR';
  renderOpts(toSel, target);
  STATE.targetCode = target;

  fromSel.addEventListener('change', () => {
    STATE.baseCode = fromSel.value;
    convert();
    updateRateInfo();
  });

  toSel.addEventListener('change', () => {
    STATE.targetCode = toSel.value;
    convert();
    updateRateInfo();
  });
}

function convert() {
  const fromAmt = document.getElementById('fromAmount');
  const toAmt = document.getElementById('toAmount');
  const rateEl = document.getElementById('rateValue');
  const inverseEl = document.getElementById('inverseRate');

  const amt = parseFloat(fromAmt.value);
  if (!STATE.rates || isNaN(amt) || amt <= 0) {
    toAmt.value = '';
    rateEl.textContent = '—';
    inverseEl.textContent = '—';
    return;
  }

  const fromRate = STATE.baseCode === 'USD' ? 1 : (STATE.rates[STATE.baseCode] || 1);
  const toRate = STATE.rates[STATE.targetCode];
  if (!toRate) {
    toAmt.value = '';
    rateEl.textContent = 'Rate unavailable';
    inverseEl.textContent = '—';
    return;
  }

  const usdToTarget = toRate;
  const usdToBase = fromRate;
  const conversionRate = usdToTarget / usdToBase;
  const result = amt * conversionRate;

  toAmt.value = result.toFixed(4);
  rateEl.textContent = `1 ${STATE.baseCode} = ${conversionRate.toFixed(4)} ${STATE.targetCode}`;
  inverseEl.textContent = `1 ${STATE.targetCode} = ${(1 / conversionRate).toFixed(4)} ${STATE.baseCode}`;
  document.getElementById('rateTimestamp').textContent = STATE.lastUpdated ? formatTime(STATE.lastUpdated) : '—';
  document.getElementById('historyCount').textContent = STATE.history.length;
}

function updateRateInfo() {
  convert();
}

function sanitizeInput(e) {
  const input = e.target;
  const val = input.value;
  const cleaned = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  if (cleaned !== val) input.value = cleaned;
}

function performSwap() {
  const fromSel = document.getElementById('fromCurrency');
  const toSel = document.getElementById('toCurrency');
  const fromAmt = document.getElementById('fromAmount');
  const toAmt = document.getElementById('toAmount');
  const swapBtn = document.getElementById('swapBtn');

  swapBtn.classList.add('spinning');
  setTimeout(() => swapBtn.classList.remove('spinning'), 500);

  const tempCur = fromSel.value;
  const tempAmt = toAmt.value || '1.00';

  fromSel.value = toSel.value;
  toSel.value = tempCur;
  fromAmt.value = tempAmt || '1.00';
  toAmt.value = '';

  STATE.baseCode = fromSel.value;
  STATE.targetCode = toSel.value;

  const fromAmtVal = parseFloat(fromAmt.value);
  if (!isNaN(fromAmtVal) && fromAmtVal > 0) {
    const fromRate = STATE.baseCode === 'USD' ? 1 : (STATE.rates[STATE.baseCode] || 1);
    const toRateValue = STATE.rates[STATE.targetCode];
    if (toRateValue) {
      const usdToTarget = toRateValue;
      const usdToBase = fromRate;
      const conversionRate = usdToTarget / usdToBase;
      const result = fromAmtVal * conversionRate;
      toAmt.value = result.toFixed(4);
      document.getElementById('rateValue').textContent = `1 ${STATE.baseCode} = ${conversionRate.toFixed(4)} ${STATE.targetCode}`;
      document.getElementById('inverseRate').textContent = `1 ${STATE.targetCode} = ${(1 / conversionRate).toFixed(4)} ${STATE.baseCode}`;
    }
  }
}

function addCurrentToHistory() {
  const fromAmt = document.getElementById('fromAmount').value;
  const toAmt = document.getElementById('toAmount').value;
  const rateEl = document.getElementById('rateValue');
  if (!fromAmt || !toAmt || rateEl.textContent === '—') return;
  const rateText = rateEl.textContent;
  addHistory(STATE.baseCode, STATE.targetCode, fromAmt, toAmt, rateText);
}

document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
  renderHistory();
  document.getElementById('historyCount').textContent = STATE.history.length;
  fetchRates();

  const fromAmt = document.getElementById('fromAmount');
  const toAmt = document.getElementById('toAmount');

  fromAmt.addEventListener('input', (e) => {
    sanitizeInput(e);
    convert();
  });

  toAmt.addEventListener('input', (e) => {
    sanitizeInput(e);
    const val = parseFloat(e.target.value);
    const fromInput = document.getElementById('fromAmount');
    if (!STATE.rates || isNaN(val) || val <= 0) {
      fromInput.value = '';
      return;
    }
    const fromRate = STATE.baseCode === 'USD' ? 1 : (STATE.rates[STATE.baseCode] || 1);
    const toRateValue = STATE.rates[STATE.targetCode];
    if (!toRateValue) return;
    const conversionRate = toRateValue / fromRate;
    const result = val / conversionRate;
    fromInput.value = result.toFixed(4);
    document.getElementById('rateValue').textContent = `1 ${STATE.baseCode} = ${conversionRate.toFixed(4)} ${STATE.targetCode}`;
    document.getElementById('inverseRate').textContent = `1 ${STATE.targetCode} = ${(1 / conversionRate).toFixed(4)} ${STATE.baseCode}`;
  });

  document.getElementById('swapBtn').addEventListener('click', () => {
    performSwap();
    addCurrentToHistory();
  });

  document.getElementById('clearHistory').addEventListener('click', () => {
    STATE.history = [];
    saveHistory();
    renderHistory();
    document.getElementById('historyCount').textContent = '0';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addCurrentToHistory();
    }
  });
});
