/* ==========================================================================
   Toast Notification System
   ========================================================================== */

function showToast(message, type) {
  type = type || 'error';
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast toast--' + type;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(function () { el.classList.add('toast--out'); setTimeout(function () { el.remove(); }, 300); }, 4000);
}

function showError(message) {
  showToast(message, 'error');
}

/* ==========================================================================
   IndexedDB Core Logic
   ========================================================================== */

const DB_NAME = 'ImageGalleryDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

/**
 * Initializes and returns a connection to the IndexedDB.
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Retrieves all images from the database.
 */
async function getAllImages() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Adds an image to the database.
 */
async function addImage(imageObj) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(imageObj);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Deletes an image from the database.
 */
async function deleteImageFromDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Toggles the favorite flag on an image.
 */
async function toggleFavoriteInDB(id, isFavorite) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Get current record first
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const record = getRequest.result;
      if (record) {
        record.isFavorite = isFavorite;
        const updateRequest = store.put(record);
        updateRequest.onsuccess = () => resolve(record);
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Record not found'));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/* ==========================================================================
   Canvas Image Generator (Default preloads)
   ========================================================================== */

/**
 * Helper to generate canvas blobs to seed the database if empty.
 */
function createPlaceholderImage(type) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    if (type === 'nature') {
      // Draw Cosmic Nebula
      const grad = ctx.createRadialGradient(400, 300, 50, 400, 300, 500);
      grad.addColorStop(0, '#1e1b4b'); // deep indigo
      grad.addColorStop(1, '#030712'); // black
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      // Celestial glowing nebulae
      const colors = ['rgba(99, 102, 241, 0.15)', 'rgba(168, 85, 247, 0.12)', 'rgba(236, 72, 153, 0.12)'];
      for (let i = 0; i < 4; i++) {
        const cx = 200 + Math.random() * 400;
        const cy = 150 + Math.random() * 300;
        const r = 200 + Math.random() * 200;
        const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
        glow.addColorStop(0, colors[i % colors.length]);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw shiny stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 80; i++) {
        ctx.beginPath();
        const x = Math.random() * 800;
        const y = Math.random() * 600;
        const r = 0.5 + Math.random() * 1.8;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      
    } else if (type === 'architecture') {
      // Draw Architectural Pastel Geometry
      const grad = ctx.createLinearGradient(0, 0, 800, 600);
      grad.addColorStop(0, '#fce7f3'); // soft pink
      grad.addColorStop(1, '#e0e7ff'); // light lavender
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      // Shapes overlaying
      ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.beginPath();
      ctx.moveTo(100, 600);
      ctx.lineTo(400, 150);
      ctx.lineTo(700, 600);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
      ctx.beginPath();
      ctx.moveTo(250, 600);
      ctx.lineTo(550, 220);
      ctx.lineTo(850, 600);
      ctx.closePath();
      ctx.fill();

      // Architectural line grids
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 100 + i * 80);
        ctx.lineTo(800, 100 + i * 80);
        ctx.stroke();
      }

      // Sun circle representation
      const circleGrad = ctx.createLinearGradient(400, 180, 400, 420);
      circleGrad.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
      circleGrad.addColorStop(1, 'rgba(253, 186, 116, 0.35)');
      ctx.fillStyle = circleGrad;
      ctx.beginPath();
      ctx.arc(400, 300, 120, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'tech') {
      // Cyber Grid
      ctx.fillStyle = '#0f172a'; // deep slate
      ctx.fillRect(0, 0, 800, 600);

      // Glowing grid lines
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < 800; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 600);
        ctx.stroke();
      }
      for (let y = 0; y < 600; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      // Tech circles
      ctx.strokeStyle = '#a855f7'; // Purple glow
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(400, 300, 150, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#6366f1'; // Indigo glow
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(400, 300, 80, 0, Math.PI * 2);
      ctx.stroke();

      // Connecting data nodes
      ctx.fillStyle = '#06b6d4'; // Cyan nodes
      const points = [
        { x: 400, y: 150 }, { x: 400, y: 450 }, { x: 250, y: 300 }, { x: 550, y: 300 },
        { x: 300, y: 200 }, { x: 500, y: 400 }
      ];
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.92);
  });
}

/**
 * Pre-seeds default canvas art if IndexedDB is empty.
 */
async function seedDefaultImages() {
  try {
    var images = await getAllImages();
  } catch (err) {
    showError('Failed to read database during seeding: ' + (err.message || 'unknown error'));
    return;
  }
  if (images.length === 0) {
    var natureBlob, archBlob, techBlob;
    try {
      natureBlob = await createPlaceholderImage('nature');
      archBlob = await createPlaceholderImage('architecture');
      techBlob = await createPlaceholderImage('tech');
    } catch (err) {
      showError('Failed to generate placeholder images: ' + (err.message || 'unknown error'));
      return;
    }

    var seedEntries = [
      { name: 'Cosmic Nebula.jpg', blob: natureBlob, category: 'Nature', isFavorite: true, offset: 0 },
      { name: 'Pastel Architecture.jpg', blob: archBlob, category: 'Architecture', isFavorite: false, offset: 10000 },
      { name: 'Cybernetic Grid.jpg', blob: techBlob, category: 'Tech', isFavorite: false, offset: 20000 }
    ];

    for (var i = 0; i < seedEntries.length; i++) {
      var entry = seedEntries[i];
      try {
        await addImage({
          name: entry.name,
          blob: entry.blob,
          type: 'image/jpeg',
          size: entry.blob.size,
          width: 800,
          height: 600,
          category: entry.category,
          isFavorite: entry.isFavorite,
          addedAt: new Date().getTime() - entry.offset
        });
      } catch (err) {
        showError('Failed to seed "' + entry.name + '": ' + (err.message || 'database error'));
      }
    }
  }
}

/* ==========================================================================
   Application State & DOM Nodes
   ========================================================================== */

let allImagesList = [];
let filteredImagesList = [];
let objectUrlsCache = new Map(); // Store created Object URLs for garbage collection

const state = {
  searchQuery: '',
  categoryFilter: 'all',
  sortBy: 'date-desc',
  lightboxIndex: null
};

// DOM References
const themeToggle = document.getElementById('themeToggle');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadCategory = document.getElementById('uploadCategory');
const uploadStatus = document.getElementById('uploadStatus');
const progressBar = document.getElementById('progressBar');

const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const sortBySelect = document.getElementById('sortBy');
const categoryTabs = document.getElementById('categoryTabs');
const galleryStats = document.getElementById('galleryStats');

const galleryGrid = document.getElementById('galleryGrid');
const emptyState = document.getElementById('emptyState');

// Lightbox DOM
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCategory = document.getElementById('lightboxCategory');
const lightboxDimensions = document.getElementById('lightboxDimensions');
const lightboxSize = document.getElementById('lightboxSize');
const lightboxDate = document.getElementById('lightboxDate');
const lightboxFav = document.getElementById('lightboxFav');
const lightboxDownload = document.getElementById('lightboxDownload');
const lightboxDelete = document.getElementById('lightboxDelete');

/* ==========================================================================
   Theme Management
   ========================================================================== */

function initTheme() {
  const savedTheme = localStorage.getItem('aura-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem('aura-theme', nextTheme);
});

/* ==========================================================================
   File Size & Date Formatter Utilities
   ========================================================================== */

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/* ==========================================================================
   Image Rendering & UI Grid
   ========================================================================== */

/**
 * Revokes all created Object URLs to release memory
 */
function cleanObjectUrlsCache() {
  objectUrlsCache.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  objectUrlsCache.clear();
}

/**
 * Obtains or creates a cached Object URL for a given Image record ID.
 */
function getObjectURL(image) {
  if (objectUrlsCache.has(image.id)) {
    return objectUrlsCache.get(image.id);
  }
  const url = URL.createObjectURL(image.blob);
  objectUrlsCache.set(image.id, url);
  return url;
}

/**
 * Reads, filters, sorts, and renders the image grid.
 */
function renderGallery() {
  // 1. Filter
  filteredImagesList = allImagesList.filter(img => {
    // Search filter
    const matchesSearch = img.name.toLowerCase().includes(state.searchQuery.toLowerCase());
    
    // Category filter
    let matchesCategory = false;
    if (state.categoryFilter === 'all') {
      matchesCategory = true;
    } else if (state.categoryFilter === 'favorites') {
      matchesCategory = !!img.isFavorite;
    } else {
      matchesCategory = img.category === state.categoryFilter;
    }

    return matchesSearch && matchesCategory;
  });

  // 2. Sort
  filteredImagesList.sort((a, b) => {
    switch (state.sortBy) {
      case 'date-desc':
        return b.addedAt - a.addedAt;
      case 'date-asc':
        return a.addedAt - b.addedAt;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'size-desc':
        return b.size - a.size;
      case 'size-asc':
        return a.size - b.size;
      default:
        return 0;
    }
  });

  // Update Stats
  if (allImagesList.length === filteredImagesList.length) {
    galleryStats.textContent = `Showing all ${allImagesList.length} images`;
  } else {
    galleryStats.textContent = `Showing ${filteredImagesList.length} of ${allImagesList.length} images`;
  }

  // Clear Grid
  galleryGrid.innerHTML = '';

  if (filteredImagesList.length === 0) {
    emptyState.hidden = false;
    galleryGrid.style.display = 'none';
    return;
  }

  emptyState.hidden = true;
  galleryGrid.style.display = 'grid';

  // Render cards
  filteredImagesList.forEach((image, index) => {
    const cardUrl = getObjectURL(image);

    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${image.name}`);

    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${cardUrl}" alt="${image.name}" loading="lazy">
      </div>
      <div class="card-overlay">
        <div class="card-top-actions">
          <span class="badge">${image.category}</span>
          <button class="btn-card-action btn-card-fav ${image.isFavorite ? 'fav-active' : ''}" 
                  aria-label="${image.isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
                  title="${image.isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
                  data-id="${image.id}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="${image.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <div class="card-bottom-info">
          <h3 class="card-title">${image.name}</h3>
          <div class="card-meta">
            <span>${formatBytes(image.size)}</span>
            <button class="btn-card-action card-trash" 
                    aria-label="Delete image" 
                    title="Delete image"
                    data-id="${image.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Click on Card Opens Lightbox (excluding child buttons)
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-card-action')) return;
      openLightbox(index);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (e.target.closest('.btn-card-action')) return;
        openLightbox(index);
      }
    });

    // Favorite Click Handler
    const favBtn = card.querySelector('.btn-card-fav');
    favBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(favBtn.getAttribute('data-id'));
      const nextState = !image.isFavorite;
      try {
        await toggleFavoriteInDB(id, nextState);
      } catch (err) {
        showError('Failed to update favorite: ' + (err.message || 'database error'));
        return;
      }
      
      // Update local array
      image.isFavorite = nextState;
      
      // Re-render
      renderGallery();
    });

    // Trash Click Handler
    const trashBtn = card.querySelector('.card-trash');
    trashBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete "${image.name}"?`)) {
        const id = parseInt(trashBtn.getAttribute('data-id'));
        try {
          await deleteImageFromDB(id);
        } catch (err) {
          showError('Failed to delete image: ' + (err.message || 'database error'));
          return;
        }
        
        // Remove from list
        allImagesList = allImagesList.filter(img => img.id !== id);
        
        // Revoke Object URL to free memory
        if (objectUrlsCache.has(id)) {
          URL.revokeObjectURL(objectUrlsCache.get(id));
          objectUrlsCache.delete(id);
        }
        
        renderGallery();
      }
    });

    galleryGrid.appendChild(card);
  });
}

/**
 * Loads images from database and starts rendering.
 */
async function loadAndRefreshGallery() {
  cleanObjectUrlsCache();
  try {
    allImagesList = await getAllImages();
  } catch (err) {
    showError('Failed to load images from database: ' + (err.message || 'unknown error'));
    allImagesList = [];
  }
  renderGallery();
}

/* ==========================================================================
   Image Uploading & Dropping
   ========================================================================== */

/**
 * Handles validation and saving of images to IndexedDB.
 */
async function handleFiles(files) {
  if (files.length === 0) return;

  const validImages = Array.from(files).filter(file => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(`"${file.name}" is not an image file.`);
      return false;
    }
    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert(`"${file.name}" exceeds the 10MB file size limit.`);
      return false;
    }
    return true;
  });

  if (validImages.length === 0) return;

  // Show status & progress
  uploadStatus.hidden = false;
  progressBar.style.width = '0%';
  
  const categorySelected = uploadCategory.value;

  for (let i = 0; i < validImages.length; i++) {
    const file = validImages[i];
    
    // Read dimensions using a temporary image object
    const dimensions = await new Promise((resolve) => {
      const imgReader = new Image();
      imgReader.onload = () => {
        resolve({ w: imgReader.naturalWidth, h: imgReader.naturalHeight });
      };
      imgReader.onerror = () => {
        resolve({ w: 0, h: 0 }); // Fallback
      };
      imgReader.src = URL.createObjectURL(file);
    });

    // Create DB object
    const newImageRecord = {
      name: file.name,
      blob: file,
      type: file.type,
      size: file.size,
      width: dimensions.w,
      height: dimensions.h,
      category: categorySelected,
      isFavorite: false,
      addedAt: new Date().getTime()
    };

    try {
      await addImage(newImageRecord);
    } catch (err) {
      showError('Failed to save "' + file.name + '": ' + (err.message || 'database error'));
    }

    var percent = Math.round(((i + 1) / validImages.length) * 100);
    progressBar.style.width = percent + '%';
  }

  // Brief delay to allow progress bar visual feedback
  setTimeout(async () => {
    uploadStatus.hidden = true;
    progressBar.style.width = '0%';
    await loadAndRefreshGallery();
  }, 400);
}

// Drag & Drop Listeners
['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  }, false);
});

dropZone.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}, false);

// File input picker listener
fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

/* ==========================================================================
   Toolbar Search, Sort, Filter Event Listeners
   ========================================================================== */

searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value.trim();
  clearSearch.hidden = state.searchQuery === '';
  renderGallery();
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  state.searchQuery = '';
  clearSearch.hidden = true;
  renderGallery();
});

sortBySelect.addEventListener('change', (e) => {
  state.sortBy = e.target.value;
  renderGallery();
});

categoryTabs.addEventListener('click', (e) => {
  const clickedTab = e.target.closest('.tab-btn');
  if (!clickedTab) return;

  // Toggle classes
  categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });
  clickedTab.classList.add('active');
  clickedTab.setAttribute('aria-selected', 'true');

  state.categoryFilter = clickedTab.getAttribute('data-category');
  renderGallery();
});

/* ==========================================================================
   Lightbox Interactive System
   ========================================================================== */

/**
 * Opens the lightbox and loads metadata.
 */
function openLightbox(index) {
  if (index < 0 || index >= filteredImagesList.length) return;
  
  state.lightboxIndex = index;
  const image = filteredImagesList[index];
  const url = getObjectURL(image);

  // Set Details
  lightboxImage.src = url;
  lightboxImage.alt = image.name;
  lightboxTitle.textContent = image.name;
  lightboxCategory.textContent = image.category;
  lightboxSize.textContent = formatBytes(image.size);
  lightboxDate.textContent = formatDate(image.addedAt);

  if (image.width && image.height) {
    lightboxDimensions.textContent = `${image.width} × ${image.height} px`;
  } else {
    lightboxDimensions.textContent = 'Unknown';
  }

  // Favorite button state
  updateLightboxFavBtn(image.isFavorite);

  // Download link href
  lightboxDownload.href = url;
  lightboxDownload.download = image.name;

  // Show Lightbox overlay
  lightbox.removeAttribute('hidden');
  lightbox.setAttribute('aria-hidden', 'false');
  lightboxClose.focus();

  // Handle nav buttons visibility
  lightboxPrev.hidden = filteredImagesList.length <= 1;
  lightboxNext.hidden = filteredImagesList.length <= 1;
}

/**
 * Updates favorite button in Lightbox detail sidebar.
 */
function updateLightboxFavBtn(isFavorite) {
  if (isFavorite) {
    lightboxFav.classList.add('active');
    lightboxFav.querySelector('span').textContent = 'Favorited';
    lightboxFav.querySelector('svg').setAttribute('fill', 'currentColor');
  } else {
    lightboxFav.classList.remove('active');
    lightboxFav.querySelector('span').textContent = 'Favorite';
    lightboxFav.querySelector('svg').setAttribute('fill', 'none');
  }
}

/**
 * Closes lightbox.
 */
function closeLightbox() {
  lightbox.setAttribute('hidden', '');
  lightbox.setAttribute('aria-hidden', 'true');
  state.lightboxIndex = null;
}

/**
 * Shows previous image.
 */
function showPrevImage() {
  if (state.lightboxIndex === null) return;
  let prevIndex = state.lightboxIndex - 1;
  if (prevIndex < 0) {
    prevIndex = filteredImagesList.length - 1; // Wrap around
  }
  openLightbox(prevIndex);
}

/**
 * Shows next image.
 */
function showNextImage() {
  if (state.lightboxIndex === null) return;
  let nextIndex = state.lightboxIndex + 1;
  if (nextIndex >= filteredImagesList.length) {
    nextIndex = 0; // Wrap around
  }
  openLightbox(nextIndex);
}

// Lightbox Action Listeners
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrevImage);
lightboxNext.addEventListener('click', showNextImage);

// Backdrop Close Click
lightbox.addEventListener('click', (e) => {
  if (e.target.classList.contains('lightbox-backdrop') || e.target.classList.contains('lightbox-main') || e.target.classList.contains('lightbox-image-container')) {
    closeLightbox();
  }
});

// Lightbox Favorite Toggle
lightboxFav.addEventListener('click', async () => {
  if (state.lightboxIndex === null) return;
  const image = filteredImagesList[state.lightboxIndex];
  const nextState = !image.isFavorite;

  try {
    await toggleFavoriteInDB(image.id, nextState);
  } catch (err) {
    showError('Failed to update favorite: ' + (err.message || 'database error'));
    return;
  }
  image.isFavorite = nextState;
  
  updateLightboxFavBtn(nextState);
  renderGallery();
});

// Lightbox Delete
lightboxDelete.addEventListener('click', async () => {
  if (state.lightboxIndex === null) return;
  const image = filteredImagesList[state.lightboxIndex];

  if (confirm(`Are you sure you want to delete "${image.name}"?`)) {
    const id = image.id;
    try {
      await deleteImageFromDB(id);
    } catch (err) {
      showError('Failed to delete image: ' + (err.message || 'database error'));
      return;
    }
    
    // Revoke URL
    if (objectUrlsCache.has(id)) {
      URL.revokeObjectURL(objectUrlsCache.get(id));
      objectUrlsCache.delete(id);
    }

    allImagesList = allImagesList.filter(img => img.id !== id);
    const prevIndex = state.lightboxIndex;
    
    closeLightbox();
    renderGallery();

    // If there are still images, reopen lightbox at adjacent index if possible
    if (filteredImagesList.length > 0) {
      const nextOpenIndex = prevIndex >= filteredImagesList.length ? filteredImagesList.length - 1 : prevIndex;
      openLightbox(nextOpenIndex);
    }
  }
});

// Keyboard Accessibility
document.addEventListener('keydown', (e) => {
  if (state.lightboxIndex === null) return;

  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      showPrevImage();
      break;
    case 'ArrowRight':
      showNextImage();
      break;
    default:
      break;
  }
});

/* ==========================================================================
   Initialization Setup
   ========================================================================== */

async function init() {
  initTheme();
  try {
    await seedDefaultImages();
    await loadAndRefreshGallery();
  } catch (error) {
    console.error('Error during gallery initialization:', error);
  }
}

// Fire init when window loads
window.addEventListener('DOMContentLoaded', init);
