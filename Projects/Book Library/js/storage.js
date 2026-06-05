/**
 * storage.js — localStorage abstraction layer
 * All persistence goes through this module.
 */

const Storage = (() => {
  const KEYS = {
    BOOKS:       'biblioBooks',
    COLLECTIONS: 'biblioCollections',
    SETTINGS:    'biblioSettings',
  };

  /* ---- Books ---- */
  function getBooks() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.BOOKS)) || [];
    } catch { return []; }
  }

  function saveBooks(books) {
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
  }

  function getBook(id) {
    return getBooks().find(b => b.id === id) || null;
  }

  function upsertBook(book) {
    const books = getBooks();
    const idx = books.findIndex(b => b.id === book.id);
    if (idx === -1) {
      books.unshift(book);
    } else {
      books[idx] = { ...books[idx], ...book };
    }
    saveBooks(books);
    return book;
  }

  function deleteBook(id) {
    const books = getBooks().filter(b => b.id !== id);
    saveBooks(books);
  }

  /* ---- Collections ---- */
  function getCollections() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.COLLECTIONS)) || [];
    } catch { return []; }
  }

  function saveCollections(cols) {
    localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(cols));
  }

  function upsertCollection(col) {
    const cols = getCollections();
    const idx = cols.findIndex(c => c.id === col.id);
    if (idx === -1) cols.push(col);
    else cols[idx] = { ...cols[idx], ...col };
    saveCollections(cols);
  }

  function deleteCollection(id) {
    // Remove collection ref from books
    const books = getBooks().map(b => b.collectionId === id ? { ...b, collectionId: null } : b);
    saveBooks(books);
    // Remove collection
    const cols = getCollections().filter(c => c.id !== id);
    saveCollections(cols);
  }

  /* ---- Settings ---- */
  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || { view: 'grid', sort: 'dateAdded-desc' };
    } catch { return { view: 'grid', sort: 'dateAdded-desc' }; }
  }

  function saveSetting(key, value) {
    const s = getSettings();
    s[key] = value;
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(s));
  }

  return {
    getBooks, saveBooks, getBook, upsertBook, deleteBook,
    getCollections, saveCollections, upsertCollection, deleteCollection,
    getSettings, saveSetting,
  };
})();
