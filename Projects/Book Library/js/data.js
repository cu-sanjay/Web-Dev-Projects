/**
 * data.js — Initial mock data & sample setup
 * Ensures the app has vibrant demo content if loaded for the first time.
 */

const BookData = (() => {
  const DEFAULT_COLLECTIONS = [
    { id: 'col-fav', name: 'Favorites', emoji: '🌟' },
    { id: 'col-sci', name: 'Sci-Fi & Fantasy', emoji: '🚀' },
    { id: 'col-bio', name: 'Biographies', emoji: '👤' },
    { id: 'col-clas', name: 'Classics', emoji: '🏛️' }
  ];

  const DEFAULT_BOOKS = [
    {
      id: 'book-1',
      title: 'Dune',
      author: 'Frank Herbert',
      genre: 'Sci-Fi, Space Opera',
      shelf: 'currently-reading',
      totalPages: 600,
      currentPage: 345,
      rating: 5,
      isbn: '978-0441172719',
      publishedYear: 1965,
      color: '#e28743',
      collectionId: 'col-sci',
      notes: 'An absolute masterpiece of world-building. The ecology of Arrakis is fascinatingly complex. Must watch the film adaptation after completing!',
      dateAdded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
    },
    {
      id: 'book-2',
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      genre: 'Sci-Fi, Adventure',
      shelf: 'completed',
      totalPages: 476,
      currentPage: 476,
      rating: 5,
      isbn: '978-0593135204',
      publishedYear: 2021,
      color: '#1d4ed8',
      collectionId: 'col-sci',
      notes: 'Rocky is one of the best characters in modern science fiction! The science is incredibly detailed but remains highly accessible. Loved the friendship aspect.',
      dateAdded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'book-3',
      title: 'Steve Jobs',
      author: 'Walter Isaacson',
      genre: 'Biography',
      shelf: 'want-to-read',
      totalPages: 656,
      currentPage: 0,
      rating: 0,
      isbn: '978-1451648539',
      publishedYear: 2011,
      color: '#475569',
      collectionId: 'col-bio',
      notes: 'Looking forward to reading about his early life and his philosophy of simple, aesthetic design.',
      dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'book-4',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Classic, Fiction',
      shelf: 'completed',
      totalPages: 180,
      currentPage: 180,
      rating: 4,
      isbn: '978-0743273565',
      publishedYear: 1925,
      color: '#047857',
      collectionId: 'col-clas',
      notes: '"So we beat on, boats against the current, borne back ceaselessly into the past." A beautifully tragic portrait of the Roaring Twenties.',
      dateAdded: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'book-5',
      title: 'Atomic Habits',
      author: 'James Clear',
      genre: 'Self-Help, Psychology',
      shelf: 'currently-reading',
      totalPages: 320,
      currentPage: 120,
      rating: 4,
      isbn: '978-0735211292',
      publishedYear: 2018,
      color: '#db2777',
      collectionId: 'col-fav',
      notes: 'The concept of 1% better every day is so powerful. Tracking my habits daily using the habit loop: cue, craving, response, reward.',
      dateAdded: new Date().toISOString()
    }
  ];

  function initializeDemoData() {
    // Initialize collections if none exist
    if (Storage.getCollections().length === 0) {
      Storage.saveCollections(DEFAULT_COLLECTIONS);
    }
    // Initialize books if none exist
    if (Storage.getBooks().length === 0) {
      Storage.saveBooks(DEFAULT_BOOKS);
    }
  }

  return {
    initializeDemoData
  };
})();
