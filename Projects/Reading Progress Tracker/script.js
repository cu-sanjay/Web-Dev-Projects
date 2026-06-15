(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#ringCanvas');
  const ctx = canvas.getContext('2d');
  const inputTitle = $('#inputTitle');
  const inputTotal = $('#inputTotal');
  const inputCurrent = $('#inputCurrent');
  const btnAdd = $('#btnAdd');
  const btnExec = $('#btnExec');
  const btnBump = $('#btnBump');
  const btnFlush = $('#btnFlush');
  const ledgerBody = $('#ledgerBody');
  const ledgerEmpty = $('#ledgerEmpty');
  const ledgerHint = $('#ledgerHint');
  const booksVal = $('#booksVal');
  const pagesVal = $('#pagesVal');
  const streakVal = $('#streakVal');
  const topBadge = $('#topBadge');
  const teleStreak = $('#teleStreak');
  const telePages = $('#telePages');
  const teleRatio = $('#teleRatio');
  const telePacing = $('#telePacing');
  const teleFinished = $('#teleFinished');
  const teleBadge = $('#teleBadge');
  const toastContainer = $('#toastContainer');
  const presetBtns = $$('.preset-btn');

  /* ─── PRESETS ─── */
  const PRESETS = {
    pragmatic: { label: 'Pragmatic Programmer', title: 'The Pragmatic Programmer', total: 350 },
    clrs: { label: 'Intro to Algorithms', title: 'Introduction to Algorithms (CLRS)', total: 1312 },
    gof: { label: 'Design Patterns GoF', title: 'Design Patterns (GoF)', total: 415 }
  };

  /* ─── STATE ─── */
  let books = [];
  let streak = { count: 0, lastDate: '' };
  let nextId = 1;

  const STORAGE_KEY = 'reading-tracker-v1';

  /* ─── STORAGE ─── */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        books = s.books || [];
        streak = s.streak || { count: 0, lastDate: '' };
        nextId = s.nextId || 1;
      }
    } catch (_) {}
  }
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ books, streak, nextId }));
    } catch (_) {}
  }

  /* ─── PRESETS ─── */
  presetBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      presetBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const p = PRESETS[this.dataset.preset];
      if (!p) return;
      inputTitle.value = p.title;
      inputTotal.value = p.total;
      inputCurrent.value = 0;
      showToast('[PRESET] ' + p.label, '#00e5ff');
    });
  });

  /* ─── ADD BOOK ─── */
  btnAdd.addEventListener('click', function() {
    const title = inputTitle.value.trim();
    const total = parseInt(inputTotal.value, 10);
    const current = parseInt(inputCurrent.value, 10);

    if (!title) { showToast('[WARN] Enter a book title', '#ffb800'); return; }
    if (isNaN(total) || total < 1) { showToast('[WARN] Invalid total pages', '#ffb800'); return; }
    if (isNaN(current) || current < 0) { showToast('[WARN] Invalid current page', '#ffb800'); return; }
    if (current > total) {
      showToast('[ERROR] Current page exceeds total', '#ff1744');
      inputCurrent.classList.add('err');
      setTimeout(() => inputCurrent.classList.remove('err'), 400);
      return;
    }

    books.push({
      id: nextId++,
      title,
      total,
      current,
      done: current >= total
    });
    saveState();
    rebuildLedger();
    computeTotals();
    inputTitle.value = '';
    inputCurrent.value = 0;
    showToast('[ADD] ' + title, '#00e676');
  });

  /* ─── REBUILD LEDGER ─── */
  function rebuildLedger() {
    ledgerBody.innerHTML = '';
    if (books.length === 0) {
      ledgerEmpty.style.display = 'block';
      ledgerHint.textContent = '0 entries';
      return;
    }
    ledgerEmpty.style.display = 'none';
    ledgerHint.textContent = books.length + ' entries';

    books.forEach((b, idx) => {
      const pct = b.total > 0 ? Math.min(100, (b.current / b.total) * 100) : 0;
      const done = pct >= 100;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${b.title}</td>
        <td>${b.total}</td>
        <td><input type="number" class="ledger-page-input" value="${b.current}" min="0" max="${b.total}" data-idx="${idx}"></td>
        <td class="ledger-pct ${done ? 'done' : ''}">${pct.toFixed(0)}%</td>
        <td><button class="ledger-del" data-idx="${idx}">&#x2715;</button></td>
      `;
      ledgerBody.appendChild(tr);

      /* inline page update */
      const input = tr.querySelector('.ledger-page-input');
      input.addEventListener('change', function() {
        const val = parseInt(this.value, 10);
        if (isNaN(val) || val < 0 || val > books[idx].total) {
          this.classList.add('err');
          setTimeout(() => this.classList.remove('err'), 400);
          this.value = books[idx].current;
          showToast('[ERROR] Invalid page value', '#ff1744');
          return;
        }
        books[idx].current = val;
        books[idx].done = val >= books[idx].total;
        saveState();
        rebuildLedger();
        computeTotals();
      });
    });

    /* delete */
    $$('.ledger-del').forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = parseInt(this.dataset.idx, 10);
        books.splice(idx, 1);
        saveState();
        rebuildLedger();
        computeTotals();
        showToast('[DELETE] Book removed', '#8892a8');
      });
    });
  }

  /* ─── COMPUTE ─── */
  function computeTotals() {
    let totalPages = 0;
    let readPages = 0;
    let finished = 0;
    books.forEach(b => {
      totalPages += b.total;
      readPages += b.current;
      if (b.current >= b.total) finished++;
    });

    const ratio = totalPages > 0 ? (readPages / totalPages) * 100 : 0;
    const pacing = streak.count > 0 ? Math.round(readPages / Math.max(1, streak.count)) : 0;

    booksVal.textContent = books.length;
    pagesVal.textContent = readPages;
    streakVal.textContent = streak.count;
    topBadge.textContent = books.length > 0 ? books.length + ' books' : 'STANDBY';
    teleStreak.textContent = streak.count + ' days';
    telePages.textContent = readPages;
    teleRatio.textContent = ratio.toFixed(1) + '%';
    telePacing.textContent = pacing + ' pg/d';
    teleFinished.textContent = finished;

    if (finished > 0 && finished === books.length) {
      teleBadge.textContent = '[ALL TEXTS ARCHIVED COMPLETE]';
      teleBadge.style.background = 'rgba(0,230,118,0.1)';
      teleBadge.style.borderColor = 'rgba(0,230,118,0.3)';
      teleBadge.style.color = '#00e676';
    } else if (ratio > 0) {
      teleBadge.textContent = '[READING IN PROGRESS]';
      teleBadge.style.background = 'rgba(0,229,255,0.08)';
      teleBadge.style.borderColor = 'rgba(0,229,255,0.25)';
      teleBadge.style.color = '#00e5ff';
    } else {
      teleBadge.textContent = 'STANDBY';
      teleBadge.style.background = '';
      teleBadge.style.borderColor = '';
      teleBadge.style.color = '';
    }
  }

  /* ─── BUMP ─── */
  btnBump.addEventListener('click', function() {
    if (books.length === 0) {
      showToast('[WARN] No books in library', '#ffb800');
      return;
    }
    /* bump first unfinished book by 10 pages */
    const target = books.find(b => !b.done);
    if (!target) {
      showToast('[INFO] All books finished — add more!', '#00e676');
      return;
    }
    const bump = Math.min(10, target.total - target.current);
    target.current += bump;
    if (target.current >= target.total) target.done = true;

    /* streak */
    const today = new Date().toDateString();
    if (streak.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (streak.lastDate === yesterday || streak.count === 0) {
        streak.count++;
      } else {
        streak.count = 1;
      }
      streak.lastDate = today;
    }

    saveState();
    rebuildLedger();
    computeTotals();
    showToast('[BUMP] +' + bump + ' pages — ' + target.title, '#ffb800');
  });

  /* ─── EXEC ─── */
  btnExec.addEventListener('click', function() {
    computeTotals();
    showToast('[EXEC] Library metrics computed', '#00e5ff');
  });

  /* ─── FLUSH ─── */
  btnFlush.addEventListener('click', function() {
    books = [];
    streak = { count: 0, lastDate: '' };
    nextId = 1;
    localStorage.removeItem(STORAGE_KEY);
    booksVal.textContent = '0';
    pagesVal.textContent = '0';
    streakVal.textContent = '--';
    topBadge.textContent = 'STANDBY';
    teleStreak.textContent = '--';
    telePages.textContent = '0';
    teleRatio.textContent = '--';
    telePacing.textContent = '--';
    teleFinished.textContent = '0';
    teleBadge.textContent = 'STANDBY';
    teleBadge.style.background = '';
    teleBadge.style.borderColor = '';
    teleBadge.style.color = '';
    rebuildLedger();
    resetCanvas();
    showToast('[FLUSH] Bibliographic cache purged', '#8892a8');
  });

  /* ─── CANVAS ─── */
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 300;
    const h = Math.max(180, Math.min(300, w * 0.7));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = w;
    canvas._h = h;
  }

  function resetCanvas() {
    const w = canvas._w;
    const h = canvas._h;
    ctx.clearRect(0, 0, w, h);
    drawEmptyState(w, h);
  }

  function drawEmptyState(w, h) {
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.font = '7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No books loaded', w / 2, h / 2);
  }

  function drawRing() {
    const w = canvas._w;
    const h = canvas._h;
    ctx.clearRect(0, 0, w, h);

    if (books.length === 0) { drawEmptyState(w, h); return; }

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 16;
    const lineW = Math.max(8, r * 0.18);

    const totalPages = books.reduce((s, b) => s + b.total, 0);
    const readPages = books.reduce((s, b) => s + b.current, 0);
    const pct = totalPages > 0 ? readPages / totalPages : 0;

    const allDone = books.length > 0 && books.every(b => b.current >= b.total);
    const color = allDone ? '#00e676' : '#00e5ff';
    const glow = allDone ? 'rgba(0,230,118,0.15)' : 'rgba(0,229,255,0.1)';

    /* bg ring */
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = lineW;
    ctx.stroke();

    /* glow */
    const grad1 = ctx.createRadialGradient(cx, cy, r - lineW, cx, cy, r + lineW);
    grad1.addColorStop(0, 'rgba(255,255,255,0)');
    grad1.addColorStop(0.5, glow);
    grad1.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(cx - r - lineW, cy - r - lineW, (r + lineW) * 2, (r + lineW) * 2);

    /* progress arc */
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * pct;

    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineCap = 'butt';

    /* end dot */
    if (pct > 0) {
      const dotX = cx + Math.cos(endAngle) * r;
      const dotY = cy + Math.sin(endAngle) * r;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    /* center text */
    ctx.fillStyle = color;
    ctx.font = '600 22px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillText((pct * 100).toFixed(0) + '%', cx, cy - 2);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.fillText(readPages + ' / ' + totalPages + ' pgs', cx, cy + 16);

    if (allDone) {
      ctx.fillStyle = '#00e676';
      ctx.font = '600 5px "JetBrains Mono", monospace';
      ctx.fillText('[METRIC METADATA STABILIZED: TEXT ARCHIVED COMPLETED]', cx, cy + 32);
    }

    /* small progress arcs for each book */
    const arcR = r + lineW + 8;
    let startA = -Math.PI / 2;
    books.forEach(b => {
      const bookPct = b.total > 0 ? b.current / b.total : 0;
      const sweep = Math.PI * 2 * (b.total / totalPages);
      const bookEnd = startA + sweep * bookPct;

      ctx.beginPath();
      ctx.arc(cx, cy, arcR, startA, bookEnd);
      ctx.strokeStyle = b.done ? '#00e676' : '#00e5ff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;

      startA += sweep;
    });
  }

  /* ─── ANIMATION ─── */
  let animId = null;
  function loop() {
    drawRing();
    animId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resizeCanvas(); });

  /* ─── TOAST ─── */
  function showToast(msg, color) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    if (color) el.style.borderLeft = '3px solid ' + color;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('leave');
      setTimeout(() => { if (el.parentNode) el.remove(); }, 250);
    }, 3500);
  }

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    loadState();
    if (books.length > 0) {
      rebuildLedger();
      computeTotals();
    } else {
      rebuildLedger();
    }
    loop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
