/**
 * app.js — Main application entry point & event handlers routing
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize demo data if fresh install
  BookData.initializeDemoData();

  // 2. Initialize UI layout and render lists
  UI.init();

  // 3. Register Event Listeners
  registerSidebarEvents();
  registerTopBarEvents();
  registerBookModalEvents();
  registerDetailModalEvents();
  registerCollectionModalEvents();
  registerDeleteModalEvents();
});

/* ============================================================
   SIDEBAR EVENTS
   ============================================================ */
function registerSidebarEvents() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const closeBtn = document.getElementById('sidebarCloseBtn');

  // Hamburger Toggle (Mobile)
  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
  });

  // Mobile sidebar close button
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  });

  // Click on background overlay
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  });

  // Static Shelf Links
  const shelfNav = document.getElementById('staticShelfNav');
  shelfNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.shelf-btn');
    if (!btn) return;
    const shelf = btn.getAttribute('data-shelf');
    UI.setFilter('shelf', shelf);
  });

  // Add Custom Collection Click
  document.getElementById('addCollectionBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    UI.openCollectionModal();
  });
}

/* ============================================================
   TOP BAR EVENTS
   ============================================================ */
function registerTopBarEvents() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClearBtn');

  // Search input typing
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    if (query.trim() !== '') {
      searchClear.classList.add('visible');
    } else {
      searchClear.classList.remove('visible');
    }
    UI.setSearchQuery(query);
  });

  // Search clear click
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    UI.setSearchQuery('');
    searchInput.focus();
  });

  // View Layout Toggles
  document.getElementById('gridViewBtn').addEventListener('click', () => {
    UI.setViewMode('grid');
  });

  document.getElementById('listViewBtn').addEventListener('click', () => {
    UI.setViewMode('list');
  });

  // Sort Selector dropdown
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    UI.setSortMode(e.target.value);
  });

  // Add Book button
  document.getElementById('addBookBtn').addEventListener('click', () => {
    UI.openBookModal();
  });

  // Add Book button in Empty state
  document.getElementById('emptyAddBtn').addEventListener('click', () => {
    UI.openBookModal();
  });
}

/* ============================================================
   ADD / EDIT BOOK FORM EVENTS
   ============================================================ */
function registerBookModalEvents() {
  // Close buttons
  document.getElementById('modalCloseBtn').addEventListener('click', UI.closeBookModal);
  document.getElementById('cancelBookBtn').addEventListener('click', UI.closeBookModal);

  // Close when clicking overlay (outside modal)
  document.getElementById('bookModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('bookModalOverlay')) {
      UI.closeBookModal();
    }
  });

  // Star Rating input selection
  const starContainer = document.getElementById('starRatingInput');
  starContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.star-btn');
    if (!btn) return;
    const val = parseInt(btn.getAttribute('data-value'));
    UI.setFormRating(val);
  });

  // Save Book button submit
  document.getElementById('saveBookBtn').addEventListener('click', (e) => {
    e.preventDefault();
    UI.handleSaveBook();
  });
}

/* ============================================================
   BOOK DETAIL MODAL EVENTS
   ============================================================ */
function registerDetailModalEvents() {
  // Close elements
  document.getElementById('detailCloseBtn').addEventListener('click', UI.closeDetailModal);
  document.getElementById('detailModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('detailModalOverlay')) {
      UI.closeDetailModal();
    }
  });

  // Real-time progress percentage updates
  const currentPageInput = document.getElementById('detailCurrentPage');
  const totalPagesInput = document.getElementById('detailTotalPages');

  currentPageInput.addEventListener('input', UI.updateDetailProgressBar);
  totalPagesInput.addEventListener('input', UI.updateDetailProgressBar);

  // Save Detail changes
  document.getElementById('saveDetailBtn').addEventListener('click', UI.handleSaveDetailChanges);
  document.getElementById('updateProgressBtn').addEventListener('click', UI.handleSaveDetailChanges);

  // Edit book button click (opens the full form)
  document.getElementById('editBookBtn').addEventListener('click', () => {
    const bookId = document.getElementById('bookId').value;
    UI.closeDetailModal();
    UI.openBookModal(bookId);
  });

  // Delete book click
  document.getElementById('deleteBookBtn').addEventListener('click', () => {
    UI.openDeleteModal();
  });
}

/* ============================================================
   CURATED COLLECTION MODAL EVENTS
   ============================================================ */
function registerCollectionModalEvents() {
  document.getElementById('collectionCloseBtn').addEventListener('click', UI.closeCollectionModal);
  document.getElementById('cancelCollectionBtn').addEventListener('click', UI.closeCollectionModal);
  document.getElementById('collectionModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('collectionModalOverlay')) {
      UI.closeCollectionModal();
    }
  });

  document.getElementById('saveCollectionBtn').addEventListener('click', UI.handleSaveCollection);
}

/* ============================================================
   DELETE CONFIRMATION EVENTS
   ============================================================ */
function registerDeleteModalEvents() {
  document.getElementById('deleteCloseBtn').addEventListener('click', UI.closeDeleteModal);
  document.getElementById('cancelDeleteBtn').addEventListener('click', UI.closeDeleteModal);
  document.getElementById('deleteModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('deleteModalOverlay')) {
      UI.closeDeleteModal();
    }
  });

  document.getElementById('confirmDeleteBtn').addEventListener('click', UI.handleConfirmDelete);
}
