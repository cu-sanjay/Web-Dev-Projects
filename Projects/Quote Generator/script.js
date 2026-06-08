(function () {
  var STORAGE_KEY = 'quote_gen_bookmarks';

  var FALLBACK = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'motivation' },
    { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein', category: 'wisdom' },
    { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci', category: 'design' },
    { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', category: 'inspiration' },
    { text: 'Code is like humor. When you have to explain it, it\'s bad.', author: 'Cory House', category: 'programming' },
    { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson', category: 'programming' },
    { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb', category: 'wisdom' },
    { text: 'Creativity is intelligence having fun.', author: 'Albert Einstein', category: 'creativity' },
    { text: 'Design is not just what it looks like and feels like. Design is how it works.', author: 'Steve Jobs', category: 'design' },
    { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs', category: 'motivation' },
  ];

  var currentQuote = null;
  var bookmarks = [];

  /* ---- Elements ---- */
  var quoteText = document.getElementById('quoteText');
  var quoteAuthor = document.getElementById('quoteAuthor');
  var quoteCategory = document.getElementById('quoteCategory');
  var newBtn = document.getElementById('newBtn');
  var copyBtn = document.getElementById('copyBtn');
  var bookmarkBtn = document.getElementById('bookmarkBtn');
  var shareBtn = document.getElementById('shareBtn');
  var toast = document.getElementById('toast');
  var bookmarkIcon = document.getElementById('bookmarkIcon');
  var bookmarkCount = document.getElementById('bookmarkCount');
  var sidebar = document.getElementById('sidebar');
  var sidebarList = document.getElementById('sidebarList');
  var sidebarEmpty = document.getElementById('sidebarEmpty');
  var sidebarClose = document.getElementById('sidebarClose');
  var sidebarOverlay = document.getElementById('sidebarOverlay');
  var bookmarksToggle = document.getElementById('bookmarksToggle');

  /* ---- Storage ---- */
  function loadBookmarks() {
    try { var r = localStorage.getItem(STORAGE_KEY); if (r) bookmarks = JSON.parse(r); } catch (e) {}
  }

  function saveBookmarks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks)); } catch (e) {}
    renderBookmarks();
  }

  function isBookmarked(q) {
    return bookmarks.some(function (b) { return b.text === q.text; });
  }

  /* ---- Toast ---- */
  var toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.add('hidden'); }, 1800);
  }

  /* ---- Fetch ---- */
  function fetchQuote() {
    quoteText.style.opacity = '0.4';

    fetch('https://api.quotable.io/random')
      .then(function (res) {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(function (data) {
        setQuote({
          text: data.content,
          author: data.author,
          category: (data.tags && data.tags.length > 0) ? data.tags[0] : 'general',
        });
      })
      .catch(function () {
        var idx = Math.floor(Math.random() * FALLBACK.length);
        setQuote(FALLBACK[idx]);
      });
  }

  function setQuote(q) {
    currentQuote = q;
    quoteText.textContent = q.text;
    quoteAuthor.textContent = '\u2014 ' + q.author;
    quoteCategory.textContent = q.category;
    quoteText.style.opacity = '1';
    updateBookmarkBtn();
  }

  /* ---- Copy ---- */
  function copyQuote() {
    if (!currentQuote) return;
    var txt = '"' + currentQuote.text + '" \u2014 ' + currentQuote.author;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () {
        showToast('Copied! \u2728');
      });
    } else {
      showToast('Copy not supported');
    }
  }

  /* ---- Share ---- */
  function shareQuote() {
    if (!currentQuote) return;
    var txt = encodeURIComponent('"' + currentQuote.text + '" \u2014 ' + currentQuote.author);
    window.open('https://twitter.com/intent/tweet?text=' + txt, '_blank', 'noopener');
  }

  /* ---- Bookmark ---- */
  function toggleBookmark() {
    if (!currentQuote) return;
    var idx = bookmarks.findIndex(function (b) { return b.text === currentQuote.text; });
    if (idx !== -1) {
      bookmarks.splice(idx, 1);
      showToast('Removed bookmark');
    } else {
      bookmarks.push({ text: currentQuote.text, author: currentQuote.author, category: currentQuote.category });
      showToast('Bookmarked! \u2764');
    }
    saveBookmarks();
    updateBookmarkBtn();
  }

  function updateBookmarkBtn() {
    if (!currentQuote) { bookmarkBtn.classList.remove('active'); return; }
    if (isBookmarked(currentQuote)) {
      bookmarkBtn.classList.add('active');
    } else {
      bookmarkBtn.classList.remove('active');
    }
  }

  /* ---- Render bookmarks ---- */
  function renderBookmarks() {
    sidebarList.innerHTML = '';
    bookmarkCount.textContent = bookmarks.length;

    if (bookmarks.length === 0) {
      sidebarEmpty.style.display = 'flex';
      return;
    }
    sidebarEmpty.style.display = 'none';

    bookmarks.forEach(function (b, idx) {
      var item = document.createElement('div');
      item.className = 'sidebar-item';
      item.innerHTML =
        '<div class="sidebar-item-text">' +
          '<div class="sidebar-item-q">' + escHtml(b.text) + '</div>' +
          '<div class="sidebar-item-a">\u2014 ' + escHtml(b.author) + '</div>' +
        '</div>' +
        '<button class="sidebar-item-del" data-idx="' + idx + '">&times;</button>';

      item.querySelector('.sidebar-item-del').addEventListener('click', function () {
        bookmarks.splice(idx, 1);
        saveBookmarks();
        updateBookmarkBtn();
        if (currentQuote) {
          var stillThere = bookmarks.some(function (bb) { return bb.text === currentQuote.text; });
          if (!stillThere) bookmarkBtn.classList.remove('active');
        }
      });

      sidebarList.appendChild(item);
    });
  }

  function escHtml(s) { return String(s).replace(/[&<>"']/g, function (ch) { var m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }; return m[ch]; }); }

  /* ---- Sidebar ---- */
  function openSidebar() { renderBookmarks(); sidebar.classList.remove('hidden'); sidebarOverlay.classList.remove('hidden'); }
  function closeSidebar() { sidebar.classList.add('hidden'); sidebarOverlay.classList.add('hidden'); }

  bookmarksToggle.addEventListener('click', openSidebar);
  sidebarClose.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ---- Event binds ---- */
  newBtn.addEventListener('click', fetchQuote);
  copyBtn.addEventListener('click', copyQuote);
  bookmarkBtn.addEventListener('click', toggleBookmark);
  shareBtn.addEventListener('click', shareQuote);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sidebar.classList.contains('hidden')) closeSidebar();
  });

  /* ---- Boot ---- */
  loadBookmarks();
  renderBookmarks();
  fetchQuote();
})();
