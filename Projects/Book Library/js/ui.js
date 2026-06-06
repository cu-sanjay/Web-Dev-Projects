/**
 * ui.js — Handles all UI rendering, state binding, animations, and modals
 */

const UI = (() => {
  // Global reference to current active shelf or collection filter
  let currentFilter = { type: 'shelf', value: 'all' }; // type: 'shelf' | 'collection'

  // Global search query
  let searchQuery = '';

  // Get active settings from storage
  let viewMode = Storage.getSettings().view || 'grid';
  let sortMode = Storage.getSettings().sort || 'dateAdded-desc';

  // State to hold reference of book being viewed or edited
  let selectedBookId = null;

  /* ============================================================
     INITIALIZATION & RE-RENDERS
     ============================================================ */
  function init() {
    setupThemeAndSettings();
    renderSidebar();
    renderBooks();
    updateMiniStats();
    populateCollectionDropdowns();
  }

  function setupThemeAndSettings() {
    // Apply initial view mode
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    const grid = document.getElementById('booksGrid');

    if (viewMode === 'list') {
      gridBtn.classList.remove('active');
      listBtn.classList.add('active');
      grid.classList.add('list-view');
    } else {
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
      grid.classList.remove('list-view');
    }

    // Apply sort dropdown selection
    document.getElementById('sortSelect').value = sortMode;
  }

  /* ============================================================
     TOAST NOTIFICATIONS
     ============================================================ */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = '💡';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove toast
    setTimeout(() => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3500);
  }

  /* ============================================================
     MINI STATS (Sidebar)
     ============================================================ */
  function updateMiniStats() {
    const books = Storage.getBooks();
    const total = books.length;
    const completed = books.filter(b => b.shelf === 'completed').length;

    let totalPagesRead = 0;
    books.forEach(b => {
      // Add up progress
      if (b.currentPage) {
        totalPagesRead += parseInt(b.currentPage) || 0;
      }
    });

    document.getElementById('totalBooks').textContent = total;
    document.getElementById('totalPages').textContent = totalPagesRead;
    document.getElementById('totalCompleted').textContent = completed;
  }

  /* ============================================================
     SIDEBAR RENDERING & MANAGEMENT
     ============================================================ */
  function renderSidebar() {
    // Update Shelf Counts
    const books = Storage.getBooks();
    document.getElementById('count-all').textContent = books.length;
    document.getElementById('count-currently-reading').textContent = books.filter(b => b.shelf === 'currently-reading').length;
    document.getElementById('count-want-to-read').textContent = books.filter(b => b.shelf === 'want-to-read').length;
    document.getElementById('count-completed').textContent = books.filter(b => b.shelf === 'completed').length;
    document.getElementById('count-on-hold').textContent = books.filter(b => b.shelf === 'on-hold').length;
    document.getElementById('count-dropped').textContent = books.filter(b => b.shelf === 'dropped').length;

    // Render Custom Collections
    const colsNav = document.getElementById('collectionsNav');
    colsNav.innerHTML = '';
    const collections = Storage.getCollections();

    if (collections.length === 0) {
      colsNav.innerHTML = `<p class="sidebar-label" style="text-transform:none;letter-spacing:normal;font-weight:400;margin-top:0.25rem;">No custom collections</p>`;
    } else {
      collections.forEach(col => {
        const count = books.filter(b => b.collectionId === col.id).length;

        const wrapper = document.createElement('div');
        wrapper.className = 'collection-btn-wrapper';

        const btn = document.createElement('button');
        btn.className = `shelf-btn ${currentFilter.type === 'collection' && currentFilter.value === col.id ? 'active' : ''}`;
        btn.setAttribute('data-collection', col.id);
        btn.innerHTML = `
          <span class="shelf-icon">${col.emoji || '📂'}</span> ${col.name}
          <span class="shelf-count">${count}</span>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'collection-delete-btn';
        deleteBtn.title = 'Delete Collection';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete collection "${col.name}"? Books in it won't be deleted.`)) {
            Storage.deleteCollection(col.id);
            if (currentFilter.type === 'collection' && currentFilter.value === col.id) {
              currentFilter = { type: 'shelf', value: 'all' };
            }
            showToast(`Collection "${col.name}" deleted.`, 'info');
            renderSidebar();
            populateCollectionDropdowns();
            renderBooks();
            updateMiniStats();
          }
        });

        btn.addEventListener('click', () => {
          setFilter('collection', col.id);
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(deleteBtn);
        colsNav.appendChild(wrapper);
      });
    }

    // Highlight current shelf selection
    const shelfNav = document.getElementById('staticShelfNav');
    const shelfBtns = shelfNav.querySelectorAll('.shelf-btn');
    shelfBtns.forEach(btn => {
      const shelfValue = btn.getAttribute('data-shelf');
      if (currentFilter.type === 'shelf' && currentFilter.value === shelfValue) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function setFilter(type, value) {
    currentFilter = { type, value };

    // Update titles
    const titleEl = document.getElementById('pageTitle');
    const subEl = document.getElementById('pageSubtitle');

    if (type === 'shelf') {
      if (value === 'all') {
        titleEl.textContent = 'All Books';
        subEl.textContent = 'Your complete library';
      } else {
        titleEl.textContent = formatShelfName(value);
        subEl.textContent = `Shelved under ${formatShelfName(value)}`;
      }
    } else {
      const col = Storage.getCollections().find(c => c.id === value);
      titleEl.textContent = col ? `${col.emoji || '📂'} ${col.name}` : 'Collection';
      subEl.textContent = 'Custom curated shelf';
    }

    renderSidebar();
    renderBooks();

    // On mobile, auto close sidebar when filter changes
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }

  function formatShelfName(shelf) {
    return shelf.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  /* ============================================================
     COLLECTION DROPDOWNS POPULATION
     ============================================================ */
  function populateCollectionDropdowns() {
    const addDropdown = document.getElementById('bookCollection');
    const detailDropdown = document.getElementById('detailCollection');
    const collections = Storage.getCollections();

    const dropdownOptions = `
      <option value="">— None —</option>
      ${collections.map(c => `<option value="${c.id}">${c.emoji || '📂'} ${c.name}</option>`).join('')}
    `;

    addDropdown.innerHTML = dropdownOptions;
    detailDropdown.innerHTML = dropdownOptions;
  }

  /* ============================================================
     BOOKS RENDERING & FILTERS
     ============================================================ */
  function renderBooks() {
    let books = Storage.getBooks();

    // 1. Filter by Shelf or Collection
    if (currentFilter.type === 'shelf') {
      if (currentFilter.value !== 'all') {
        books = books.filter(b => b.shelf === currentFilter.value);
      }
    } else if (currentFilter.type === 'collection') {
      books = books.filter(b => b.collectionId === currentFilter.value);
    }

    // 2. Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      books = books.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.genre && b.genre.toLowerCase().includes(q)) ||
        (b.notes && b.notes.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.includes(q))
      );
    }

    // 3. Sort
    books = sortBooks(books, sortMode);

    // Render Grid/List
    const grid = document.getElementById('booksGrid');
    grid.innerHTML = '';

    const emptyState = document.getElementById('emptyState');
    const noResults = document.getElementById('noResults');

    if (books.length === 0) {
      if (searchQuery.trim() !== '') {
        emptyState.style.display = 'none';
        noResults.style.display = 'flex';
      } else {
        emptyState.style.display = 'flex';
        noResults.style.display = 'none';
      }
      return;
    }

    emptyState.style.display = 'none';
    noResults.style.display = 'none';

    books.forEach((book, index) => {
      const card = createBookCard(book, index);
      grid.appendChild(card);
    });
  }

  function sortBooks(books, method) {
    const [key, direction] = method.split('-');
    const isAsc = direction === 'asc';

    return books.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      // Handle null/undefined values
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      // Special cases
      if (key === 'progress') {
        // Calculate progress percentage
        const pctA = a.totalPages ? (a.currentPage / a.totalPages) : 0;
        const pctB = b.totalPages ? (b.currentPage / b.totalPages) : 0;
        return isAsc ? pctA - pctB : pctB - pctA;
      }

      if (key === 'dateAdded') {
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        return isAsc ? timeA - timeB : timeB - timeA;
      }

      if (typeof valA === 'string') {
        return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        // numbers, ratings, etc.
        return isAsc ? valA - valB : valB - valA;
      }
    });
  }

  function createBookCard(book, index) {
    const card = document.createElement('div');
    card.className = 'book-card';
    // Stagger animation for entry
    card.style.animationDelay = `${index * 0.04}s`;
    card.setAttribute('data-id', book.id);

    // Calculate percentage progress
    const total = parseInt(book.totalPages) || 0;
    const current = parseInt(book.currentPage) || 0;
    const progressPct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

    // Mini star elements
    let ratingStars = '';
    if (book.rating && book.rating > 0) {
      ratingStars = `<span class="stars-mini">${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}</span>`;
    }

    // Pick dynamic typography placeholder emoji based on title/genre
    const iconEmoji = getEmojiForBook(book);

    card.innerHTML = `
      <div class="book-cover" style="background: ${book.color || 'var(--accent)'};">
        <span class="book-cover-emoji">${iconEmoji}</span>
      </div>
      <div class="book-card-body">
        <h3 class="book-card-title">${escapeHTML(book.title)}</h3>
        <p class="book-card-author">${escapeHTML(book.author)}</p>
        <div class="book-card-progress">
          <div class="progress-bar-mini">
            <div class="progress-bar-mini-fill" style="width: ${progressPct}%;"></div>
          </div>
          <span class="progress-pct">${progressPct}%</span>
        </div>
        <div class="book-card-footer">
          <span class="shelf-badge badge-${book.shelf}">${formatShelfName(book.shelf)}</span>
          ${ratingStars}
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      openDetailModal(book.id);
    });

    return card;
  }

  function getEmojiForBook(book) {
    const genre = (book.genre || '').toLowerCase();
    if (genre.includes('sci-fi') || genre.includes('fantasy') || genre.includes('space')) return '🚀';
    if (genre.includes('mystery') || genre.includes('crime') || genre.includes('thriller')) return '🕵️‍♂️';
    if (genre.includes('bio') || genre.includes('memoir') || genre.includes('history')) return '👤';
    if (genre.includes('classic') || genre.includes('philosophy') || genre.includes('history')) return '🏛️';
    if (genre.includes('tech') || genre.includes('coding') || genre.includes('science')) return '💻';
    if (genre.includes('self-help') || genre.includes('mindset') || genre.includes('psych')) return '🧠';
    if (genre.includes('business') || genre.includes('finance') || genre.includes('money')) return '📈';
    if (genre.includes('poetry') || genre.includes('romance') || genre.includes('art')) return '🎨';
    return '📖';
  }

  /* ============================================================
     ADD / EDIT BOOK MODAL
     ============================================================ */
  function openBookModal(bookId = null) {
    const modalOverlay = document.getElementById('bookModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('bookForm');

    form.reset();
    resetFormErrors();
    setFormRating(0);

    if (bookId) {
      modalTitle.textContent = 'Edit Book';
      const book = Storage.getBook(bookId);
      if (book) {
        document.getElementById('bookId').value = book.id;
        document.getElementById('bookTitle').value = book.title;
        document.getElementById('bookAuthor').value = book.author;
        document.getElementById('bookGenre').value = book.genre || '';
        document.getElementById('bookShelf').value = book.shelf;
        document.getElementById('bookTotalPages').value = book.totalPages || '';
        document.getElementById('bookCurrentPage').value = book.currentPage || '';
        document.getElementById('bookISBN').value = book.isbn || '';
        document.getElementById('bookPublishedYear').value = book.publishedYear || '';
        document.getElementById('bookColor').value = book.color || '#6366f1';
        document.getElementById('bookCollection').value = book.collectionId || '';
        document.getElementById('bookNotes').value = book.notes || '';
        setFormRating(book.rating || 0);
      }
    } else {
      modalTitle.textContent = 'Add New Book';
      document.getElementById('bookId').value = '';
      document.getElementById('bookColor').value = getRandomAccentColor();
      // If we are currently filtered by a shelf, select it by default
      if (currentFilter.type === 'shelf' && currentFilter.value !== 'all') {
        document.getElementById('bookShelf').value = currentFilter.value;
      }
      // If filtered by collection, select it by default
      if (currentFilter.type === 'collection') {
        document.getElementById('bookCollection').value = currentFilter.value;
      }
    }

    modalOverlay.classList.add('open');
  }

  function closeBookModal() {
    document.getElementById('bookModalOverlay').classList.remove('open');
  }

  function setFormRating(val) {
    document.getElementById('bookRating').value = val;
    const stars = document.querySelectorAll('#starRatingInput .star-btn');
    stars.forEach(s => {
      const starVal = parseInt(s.getAttribute('data-value'));
      if (starVal <= val) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }

  function getRandomAccentColor() {
    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function resetFormErrors() {
    document.getElementById('titleError').textContent = '';
    document.getElementById('authorError').textContent = '';
  }

  function handleSaveBook() {
    resetFormErrors();
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();

    let hasError = false;
    if (!title) {
      document.getElementById('titleError').textContent = 'Title is required.';
      hasError = true;
    }
    if (!author) {
      document.getElementById('authorError').textContent = 'Author is required.';
      hasError = true;
    }

    if (hasError) return;

    const bookId = document.getElementById('bookId').value || `book-${Date.now()}`;
    const totalPages = parseInt(document.getElementById('bookTotalPages').value) || 0;
    let currentPage = parseInt(document.getElementById('bookCurrentPage').value) || 0;

    if (totalPages > 0 && currentPage > totalPages) {
      currentPage = totalPages;
    }

    const savedBook = {
      id: bookId,
      title,
      author,
      genre: document.getElementById('bookGenre').value.trim(),
      shelf: document.getElementById('bookShelf').value,
      totalPages,
      currentPage,
      rating: parseInt(document.getElementById('bookRating').value) || 0,
      isbn: document.getElementById('bookISBN').value.trim(),
      publishedYear: parseInt(document.getElementById('bookPublishedYear').value) || null,
      color: document.getElementById('bookColor').value,
      collectionId: document.getElementById('bookCollection').value || null,
      notes: document.getElementById('bookNotes').value.trim(),
      dateAdded: document.getElementById('bookId').value ? (Storage.getBook(bookId)?.dateAdded || new Date().toISOString()) : new Date().toISOString()
    };

    // Auto switch shelf if they input full pages read
    if (savedBook.totalPages > 0 && savedBook.currentPage === savedBook.totalPages && savedBook.shelf !== 'completed') {
      savedBook.shelf = 'completed';
    }

    Storage.upsertBook(savedBook);
    closeBookModal();
    showToast(`"${savedBook.title}" successfully saved!`);

    renderSidebar();
    renderBooks();
    updateMiniStats();
  }

  /* ============================================================
     DETAIL MODAL
     ============================================================ */
  function openDetailModal(bookId) {
    selectedBookId = bookId;
    const book = Storage.getBook(bookId);
    if (!book) return;

    const modalOverlay = document.getElementById('detailModalOverlay');
    const headerEl = document.getElementById('detailHeader');
    const coverEl = document.getElementById('detailCover');
    const coverEmojiEl = document.getElementById('detailCoverEmoji');
    const titleEl = document.getElementById('detailTitle');
    const authorEl = document.getElementById('detailAuthor');
    const badgesEl = document.getElementById('detailBadges');
    const starsEl = document.getElementById('detailStars');

    // Setup color theme & cover emoji
    coverEl.style.backgroundColor = book.color || 'var(--accent)';
    coverEmojiEl.textContent = getEmojiForBook(book);

    titleEl.textContent = book.title;
    authorEl.textContent = `by ${book.author}`;

    // Badges (Shelf, Collection, Genre)
    badgesEl.innerHTML = `<span class="shelf-badge badge-${book.shelf}">${formatShelfName(book.shelf)}</span>`;
    if (book.genre) {
      book.genre.split(',').forEach(g => {
        badgesEl.innerHTML += `<span class="badge-genre">${escapeHTML(g.trim())}</span>`;
      });
    }

    // Collection badge if any
    if (book.collectionId) {
      const col = Storage.getCollections().find(c => c.id === book.collectionId);
      if (col) {
        badgesEl.innerHTML += `<span class="shelf-badge badge-currently-reading">${col.emoji || '📂'} ${col.name}</span>`;
      }
    }

    // Rating
    starsEl.textContent = book.rating > 0 ? '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating) : 'Unrated';

    // Reading Progress Inputs
    const currentPageInput = document.getElementById('detailCurrentPage');
    const totalPagesInput = document.getElementById('detailTotalPages');

    currentPageInput.value = book.currentPage || 0;
    totalPagesInput.value = book.totalPages || 0;

    updateDetailProgressBar();

    // Select shelf & collection dropdowns in details
    document.getElementById('detailShelf').value = book.shelf;
    document.getElementById('detailCollection').value = book.collectionId || '';

    // Notes
    document.getElementById('detailNotes').value = book.notes || '';

    // Additional info details
    const infoRow = document.getElementById('detailInfoRow');
    infoRow.innerHTML = '';

    if (book.isbn) {
      infoRow.innerHTML += `
        <div class="info-item">
          <div class="info-item-label">ISBN</div>
          <div class="info-item-value">${escapeHTML(book.isbn)}</div>
        </div>
      `;
    }
    if (book.publishedYear) {
      infoRow.innerHTML += `
        <div class="info-item">
          <div class="info-item-label">Published</div>
          <div class="info-item-value">${book.publishedYear}</div>
        </div>
      `;
    }
    infoRow.innerHTML += `
      <div class="info-item">
        <div class="info-item-label">Added To Library</div>
        <div class="info-item-value">${new Date(book.dateAdded).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
      </div>
    `;

    modalOverlay.classList.add('open');
  }

  function closeDetailModal() {
    document.getElementById('detailModalOverlay').classList.remove('open');
    selectedBookId = null;
  }

  function updateDetailProgressBar() {
    const current = parseInt(document.getElementById('detailCurrentPage').value) || 0;
    const total = parseInt(document.getElementById('detailTotalPages').value) || 0;
    const bar = document.getElementById('detailProgressBar');
    const text = document.getElementById('progressPctDisplay');

    const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
    bar.style.width = `${pct}%`;
    text.textContent = `${pct}%`;
  }

  function handleSaveDetailChanges() {
    if (!selectedBookId) return;
    const book = Storage.getBook(selectedBookId);
    if (!book) return;

    let total = parseInt(document.getElementById('detailTotalPages').value) || 0;
    let current = parseInt(document.getElementById('detailCurrentPage').value) || 0;

    if (total > 0 && current > total) {
      current = total;
    }

    const nextShelf = document.getElementById('detailShelf').value;

    const updated = {
      ...book,
      totalPages: total,
      currentPage: current,
      shelf: (total > 0 && current === total && nextShelf !== 'completed') ? 'completed' : nextShelf,
      collectionId: document.getElementById('detailCollection').value || null,
      notes: document.getElementById('detailNotes').value.trim()
    };

    Storage.upsertBook(updated);
    closeDetailModal();
    showToast(`Changes to "${book.title}" updated!`);

    renderSidebar();
    renderBooks();
    updateMiniStats();
  }

  /* ============================================================
     COLLECTION MODAL
     ============================================================ */
  function openCollectionModal() {
    const modal = document.getElementById('collectionModalOverlay');
    document.getElementById('collectionName').value = '';
    document.getElementById('collectionEmoji').value = '📂';
    document.getElementById('collectionError').textContent = '';
    modal.classList.add('open');
  }

  function closeCollectionModal() {
    document.getElementById('collectionModalOverlay').classList.remove('open');
  }

  function handleSaveCollection() {
    const name = document.getElementById('collectionName').value.trim();
    const emoji = document.getElementById('collectionEmoji').value.trim() || '📂';

    if (!name) {
      document.getElementById('collectionError').textContent = 'Name is required.';
      return;
    }

    const id = `col-${Date.now()}`;
    Storage.upsertCollection({ id, name, emoji });

    closeCollectionModal();
    showToast(`Curated "${name}" collection!`);

    renderSidebar();
    populateCollectionDropdowns();
  }

  /* ============================================================
     DELETE CONFIRMATION
     ============================================================ */
  function openDeleteModal() {
    if (!selectedBookId) return;
    const book = Storage.getBook(selectedBookId);
    if (!book) return;

    document.getElementById('deleteBookTitle').textContent = book.title;
    document.getElementById('deleteModalOverlay').classList.add('open');
  }

  function closeDeleteModal() {
    document.getElementById('deleteModalOverlay').classList.remove('open');
  }

  function handleConfirmDelete() {
    if (!selectedBookId) return;
    const book = Storage.getBook(selectedBookId);

    Storage.deleteBook(selectedBookId);
    closeDeleteModal();
    closeDetailModal();

    showToast(`Removed "${book.title}" from library.`, 'info');

    renderSidebar();
    renderBooks();
    updateMiniStats();
  }

  /* ============================================================
     HELPERS
     ============================================================ */
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  return {
    init,
    showToast,
    setFilter,
    renderBooks,
    openBookModal,
    closeBookModal,
    setFormRating,
    handleSaveBook,
    closeDetailModal,
    updateDetailProgressBar,
    handleSaveDetailChanges,
    openCollectionModal,
    closeCollectionModal,
    handleSaveCollection,
    openDeleteModal,
    closeDeleteModal,
    handleConfirmDelete,
    setViewMode: (mode) => {
      viewMode = mode;
      Storage.saveSetting('view', mode);
      setupThemeAndSettings();
      renderBooks();
    },
    setSortMode: (sort) => {
      sortMode = sort;
      Storage.saveSetting('sort', sort);
      renderBooks();
    },
    setSearchQuery: (q) => {
      searchQuery = q;
      renderBooks();
    }
  };
})();
