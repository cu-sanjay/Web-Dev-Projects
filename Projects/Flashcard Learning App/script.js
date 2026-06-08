(function () {
  var STORAGE_KEY = 'flashcard_deck';

  var SAMPLE = [
    { question: 'What is the time complexity of binary search?', answer: 'O(log n)' },
    { question: 'What does CSS stand for?', answer: 'Cascading Style Sheets' },
    { question: 'What is a Promise in JavaScript?', answer: 'An object representing the eventual completion or failure of an asynchronous operation' },
    { question: 'What is the difference between "let" and "var"?', answer: '"let" has block scope; "var" has function scope' },
  ];

  var cards = [];
  var current = 0;
  var isFlipped = false;

  /* ---- Elements ---- */
  var card3d = document.getElementById('card-3d');
  var cardInner = document.getElementById('card-inner');
  var cardQuestion = document.getElementById('cardQuestion');
  var cardAnswer = document.getElementById('cardAnswer');
  var emptyState = document.getElementById('empty-state');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var flipBtn = document.getElementById('flipBtn');
  var addBtn = document.getElementById('addBtn');
  var resetBtn = document.getElementById('resetBtn');
  var statIndex = document.getElementById('statIndex');
  var statPct = document.getElementById('statPct');
  var statTotal = document.getElementById('statTotal');
  var progressFill = document.getElementById('progress-fill');
  var drawerToggle = document.getElementById('drawerToggle');
  var drawer = document.getElementById('drawer');
  var drawerClose = document.getElementById('drawerClose');
  var drawerList = document.getElementById('drawer-list');
  var modal = document.getElementById('modal');
  var modalClose = document.getElementById('modalClose');
  var modalCancel = document.getElementById('modalCancel');
  var modalSave = document.getElementById('modalSave');
  var qInput = document.getElementById('qInput');
  var aInput = document.getElementById('aInput');

  /* ---- Helpers ---- */
  function sanitize(str) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str).replace(/[&<>"']/g, function (ch) { return map[ch]; });
  }

  function generateId() {
    return 'card_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  }

  /* ---- Storage ---- */
  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (Array.isArray(data)) { cards = data; return; }
      }
    } catch (e) {}
    cards = SAMPLE.map(function (c) { return { id: generateId(), question: c.question, answer: c.answer }; });
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); } catch (e) {}
  }

  /* ---- Render ---- */
  function render() {
    var total = cards.length;

    if (total === 0) {
      emptyState.classList.remove('hidden');
      card3d.classList.add('hidden');
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      flipBtn.disabled = true;
      statIndex.textContent = '0 / 0';
      statPct.textContent = '0%';
      statTotal.textContent = '0 cards';
      progressFill.style.width = '0%';
      renderDrawer();
      return;
    }

    emptyState.classList.add('hidden');
    card3d.classList.remove('hidden');
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    flipBtn.disabled = false;

    if (current < 0) current = 0;
    if (current >= total) current = total - 1;

    isFlipped = false;
    card3d.classList.remove('flipped');

    var card = cards[current];
    cardQuestion.textContent = card.question;
    cardAnswer.textContent = card.answer;

    statIndex.textContent = (current + 1) + ' / ' + total;
    var pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
    statPct.textContent = pct + '%';
    statTotal.textContent = total + ' card' + (total !== 1 ? 's' : '');
    progressFill.style.width = pct + '%';

    renderDrawer();
  }

  function renderDrawer() {
    drawerList.innerHTML = '';
    cards.forEach(function (c, idx) {
      var row = document.createElement('div');
      row.className = 'drawer-row';

      var text = document.createElement('span');
      text.className = 'drawer-q';
      text.textContent = c.question;

      var del = document.createElement('button');
      del.className = 'drawer-del';
      del.innerHTML = '&times;';
      del.addEventListener('click', function () { deleteCard(c.id); });

      row.appendChild(text);
      row.appendChild(del);

      if (idx === current) { row.style.background = 'rgba(0,240,255,0.03)'; }

      drawerList.appendChild(row);
    });
  }

  /* ---- Navigation ---- */
  function goPrev() {
    if (cards.length === 0) return;
    current = (current - 1 + cards.length) % cards.length;
    render();
  }

  function goNext() {
    if (cards.length === 0) return;
    current = (current + 1) % cards.length;
    render();
  }

  function flip() {
    if (cards.length === 0) return;
    isFlipped = !isFlipped;
    card3d.classList.toggle('flipped', isFlipped);
  }

  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);
  flipBtn.addEventListener('click', flip);
  card3d.addEventListener('click', flip);

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (modal.classList.contains('hidden')) {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === ' ' || e.key === 'Space') { e.preventDefault(); flip(); }
    }
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });

  /* ---- CRUD ---- */
  function addCard(question, answer) {
    cards.push({ id: generateId(), question: question, answer: answer });
    current = cards.length - 1;
    saveState();
    render();
  }

  function deleteCard(id) {
    var idx = cards.findIndex(function (c) { return c.id === id; });
    if (idx === -1) return;
    cards.splice(idx, 1);
    if (current >= cards.length && current > 0) current = cards.length - 1;
    saveState();
    render();
  }

  function resetDeck() {
    cards = SAMPLE.map(function (c) { return { id: generateId(), question: c.question, answer: c.answer }; });
    current = 0;
    saveState();
    render();
  }

  /* ---- Modal ---- */
  function openModal() {
    qInput.value = '';
    aInput.value = '';
    modal.classList.remove('hidden');
    setTimeout(function () { qInput.focus(); }, 100);
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  function saveFromModal() {
    var q = qInput.value.trim();
    var a = aInput.value.trim();
    if (!q || !a) {
      if (!q) qInput.focus();
      else aInput.focus();
      return;
    }
    addCard(sanitize(q), sanitize(a));
    closeModal();
  }

  addBtn.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  modalSave.addEventListener('click', saveFromModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  qInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); aInput.focus(); } });
  aInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); saveFromModal(); } });

  /* ---- Drawer toggle ---- */
  drawerToggle.addEventListener('click', function () { drawer.classList.toggle('hidden'); drawerToggle.textContent = drawer.classList.contains('hidden') ? '\u25B2 Deck List' : '\u25BC Deck List'; });
  drawerClose.addEventListener('click', function () { drawer.classList.add('hidden'); drawerToggle.textContent = '\u25B2 Deck List'; });

  /* ---- Reset ---- */
  resetBtn.addEventListener('click', function () { if (confirm('Reset to sample deck?')) resetDeck(); });

  /* ---- Boot ---- */
  loadState();
  render();
})();
