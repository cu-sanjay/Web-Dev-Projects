// State Management
let resources = JSON.parse(localStorage.getItem('pkh_resources')) || [];
let categories = JSON.parse(localStorage.getItem('pkh_categories')) || ['Technology', 'Education', 'Productivity'];
let currentView = 'all';
let currentCategory = 'all';
let editId = null;

// DOM Elements
const body = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const viewBtns = document.querySelectorAll('.nav-item[data-view]');
const categoryList = document.getElementById('categoryList');
const currentViewTitle = document.getElementById('currentViewTitle');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const addBtn = document.getElementById('addBtn');
const emptyAddBtn = document.getElementById('emptyAddBtn');
const dashboardStats = document.getElementById('dashboardStats');
const resourceGrid = document.getElementById('resourceGrid');
const emptyState = document.getElementById('emptyState');

// Modal Elements
const resourceModal = document.getElementById('resourceModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const resourceForm = document.getElementById('resourceForm');
const modalTitle = document.getElementById('modalTitle');
const resourceTypeRadios = document.getElementsByName('resourceType');
const urlGroup = document.getElementById('urlGroup');
const contentGroup = document.getElementById('contentGroup');
const resourceCategorySelect = document.getElementById('resourceCategory');

const categoryModal = document.getElementById('categoryModal');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const closeCatModalBtn = document.getElementById('closeCatModalBtn');
const cancelCatBtn = document.getElementById('cancelCatBtn');
const categoryForm = document.getElementById('categoryForm');

// Initialization
function init() {
  initTheme();
  renderCategories();
  renderResources();
  updateStats();
  setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
  // Theme Toggle
  themeToggle.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('pkh_theme', isDark ? 'light' : 'dark');
  });

  // Mobile Menu
  mobileMenuBtn.addEventListener('click', () => sidebar.classList.add('open'));
  mobileMenuClose.addEventListener('click', () => sidebar.classList.remove('open'));

  // View Navigation
  viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      currentView = view;
      currentCategory = 'all';
      updateNavSelection(e.currentTarget);
      currentViewTitle.textContent = e.currentTarget.querySelector('span').textContent;
      renderResources();
      if (window.innerWidth <= 768) sidebar.classList.remove('open');
    });
  });

  // Search
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    clearSearch.style.display = val ? 'block' : 'none';
    renderResources(val);
  });

  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.style.display = 'none';
    renderResources();
  });

  // Modals
  addBtn.addEventListener('click', openResourceModal);
  emptyAddBtn.addEventListener('click', openResourceModal);
  closeModalBtn.addEventListener('click', closeResourceModal);
  cancelBtn.addEventListener('click', closeResourceModal);
  
  addCategoryBtn.addEventListener('click', openCategoryModal);
  closeCatModalBtn.addEventListener('click', closeCategoryModal);
  cancelCatBtn.addEventListener('click', closeCategoryModal);

  // Form handling
  resourceForm.addEventListener('submit', handleResourceSubmit);
  categoryForm.addEventListener('submit', handleCategorySubmit);

  // Radio toggle for Note/Bookmark
  resourceTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'bookmark') {
        urlGroup.style.display = 'block';
        contentGroup.style.display = 'none';
        document.getElementById('resourceUrl').required = true;
        document.getElementById('resourceContent').required = false;
      } else {
        urlGroup.style.display = 'none';
        contentGroup.style.display = 'block';
        document.getElementById('resourceUrl').required = false;
        document.getElementById('resourceContent').required = true;
      }
    });
  });

  // Close modals on overlay click
  resourceModal.addEventListener('click', (e) => {
    if (e.target === resourceModal) closeResourceModal();
  });
  categoryModal.addEventListener('click', (e) => {
    if (e.target === categoryModal) closeCategoryModal();
  });
}

// Theme Handling
function initTheme() {
  const savedTheme = localStorage.getItem('pkh_theme');
  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    body.setAttribute('data-theme', 'dark');
  }
}

// Render Functions
function renderCategories() {
  categoryList.innerHTML = '';
  resourceCategorySelect.innerHTML = '';
  
  // 'All Categories' option for nav
  const allBtn = document.createElement('button');
  allBtn.className = `nav-item ${currentView === 'category' && currentCategory === 'all' ? 'active' : ''}`;
  allBtn.innerHTML = `<i class="ph ph-list-dashes"></i><span>All Categories</span>`;
  allBtn.addEventListener('click', () => selectCategory('all', allBtn));
  categoryList.appendChild(allBtn);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

  categories.forEach((cat, index) => {
    const color = colors[index % colors.length];
    
    // Nav item
    const btnContainer = document.createElement('div');
    btnContainer.className = 'category-item';
    
    const btn = document.createElement('button');
    btn.className = `nav-item ${currentView === 'category' && currentCategory === cat ? 'active' : ''}`;
    btn.style.marginBottom = '0';
    btn.innerHTML = `
      <div class="category-item-left">
        <span class="category-color" style="background-color: ${color}"></span>
        <span>${cat}</span>
      </div>
    `;
    btn.addEventListener('click', () => selectCategory(cat, btnContainer.querySelector('.nav-item')));
    
    btnContainer.appendChild(btn);

    // Delete category button (only if no resources use it)
    const inUse = resources.some(r => r.category === cat);
    if (!inUse && categories.length > 1) {
      const delBtn = document.createElement('button');
      delBtn.className = 'delete-cat-btn';
      delBtn.innerHTML = '<i class="ph ph-trash"></i>';
      delBtn.title = 'Delete category';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCategory(cat);
      });
      btnContainer.appendChild(delBtn);
    }
    
    categoryList.appendChild(btnContainer);

    // Select option
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    resourceCategorySelect.appendChild(option);
  });
}

function selectCategory(cat, element) {
  currentView = 'category';
  currentCategory = cat;
  updateNavSelection(element);
  currentViewTitle.textContent = cat === 'all' ? 'All Categories' : cat;
  renderResources();
  if (window.innerWidth <= 768) sidebar.classList.remove('open');
}

function updateNavSelection(activeEl) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (activeEl) activeEl.classList.add('active');
}

function renderResources(searchQuery = '') {
  let filtered = resources;

  // Filter by view
  if (currentView === 'notes') {
    filtered = filtered.filter(r => r.type === 'note');
  } else if (currentView === 'bookmarks') {
    filtered = filtered.filter(r => r.type === 'bookmark');
  } else if (currentView === 'category' && currentCategory !== 'all') {
    filtered = filtered.filter(r => r.category === currentCategory);
  }

  // Filter by search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(q) || 
      (r.content && r.content.toLowerCase().includes(q)) ||
      (r.url && r.url.toLowerCase().includes(q))
    );
  }

  // Sort by newest first
  filtered.sort((a, b) => b.createdAt - a.createdAt);

  // Update UI
  if (currentView === 'all' && currentCategory === 'all' && !searchQuery) {
    dashboardStats.style.display = 'grid';
  } else {
    dashboardStats.style.display = 'none';
  }

  resourceGrid.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
    filtered.forEach(r => {
      const card = createResourceCard(r);
      resourceGrid.appendChild(card);
    });
  }
}

function createResourceCard(resource) {
  const card = document.createElement('div');
  card.className = 'resource-card';
  
  const date = new Date(resource.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const isNote = resource.type === 'note';
  const iconClass = isNote ? 'ph-notebook' : 'ph-bookmarks';
  const typeClass = isNote ? 'note' : 'bookmark';

  let contentHtml = '';
  if (isNote) {
    contentHtml = `<div class="card-content">${escapeHTML(resource.content)}</div>`;
  } else {
    contentHtml = `<a href="${resource.url}" target="_blank" rel="noopener" class="card-url">
      <i class="ph ph-link"></i> ${escapeHTML(resource.url)}
    </a>`;
  }

  card.innerHTML = `
    <div class="card-header">
      <div class="card-type-icon ${typeClass}">
        <i class="ph ${iconClass}"></i>
      </div>
      <div class="card-actions">
        <button class="action-btn edit" onclick="editResource('${resource.id}')" aria-label="Edit">
          <i class="ph ph-pencil-simple"></i>
        </button>
        <button class="action-btn delete" onclick="deleteResource('${resource.id}')" aria-label="Delete">
          <i class="ph ph-trash"></i>
        </button>
      </div>
    </div>
    <h3 class="card-title" title="${escapeHTML(resource.title)}">${escapeHTML(resource.title)}</h3>
    ${contentHtml}
    <div class="card-footer">
      <span class="card-category">
        <i class="ph ph-folder"></i> ${escapeHTML(resource.category)}
      </span>
      <span class="card-date">${date}</span>
    </div>
  `;

  return card;
}

// CRUD Operations
function handleResourceSubmit(e) {
  e.preventDefault();
  
  const type = document.querySelector('input[name="resourceType"]:checked').value;
  const title = document.getElementById('resourceTitle').value.trim();
  const category = document.getElementById('resourceCategory').value;
  const url = document.getElementById('resourceUrl').value.trim();
  const content = document.getElementById('resourceContent').value.trim();

  const resourceData = {
    id: editId || Date.now().toString(),
    type,
    title,
    category,
    createdAt: editId ? resources.find(r => r.id === editId).createdAt : Date.now(),
    updatedAt: Date.now()
  };

  if (type === 'note') {
    resourceData.content = content;
  } else {
    resourceData.url = url;
  }

  if (editId) {
    const idx = resources.findIndex(r => r.id === editId);
    resources[idx] = resourceData;
  } else {
    resources.push(resourceData);
  }

  saveData();
  closeResourceModal();
  renderResources(searchInput.value);
  updateStats();
  renderCategories(); // Update to potentially hide delete buttons
}

function deleteResource(id) {
  if (confirm('Are you sure you want to delete this resource?')) {
    resources = resources.filter(r => r.id !== id);
    saveData();
    renderResources(searchInput.value);
    updateStats();
    renderCategories();
  }
}

function editResource(id) {
  const resource = resources.find(r => r.id === id);
  if (!resource) return;

  editId = id;
  modalTitle.textContent = 'Edit Resource';
  
  document.getElementById('resourceTitle').value = resource.title;
  document.getElementById('resourceCategory').value = resource.category;
  
  // Set type and trigger change event to show correct fields
  const typeRadios = document.getElementsByName('resourceType');
  for (let r of typeRadios) {
    if (r.value === resource.type) {
      r.checked = true;
      r.dispatchEvent(new Event('change'));
    }
  }

  if (resource.type === 'note') {
    document.getElementById('resourceContent').value = resource.content || '';
  } else {
    document.getElementById('resourceUrl').value = resource.url || '';
  }

  resourceModal.classList.add('active');
}

function handleCategorySubmit(e) {
  e.preventDefault();
  const catName = document.getElementById('newCategoryName').value.trim();
  
  if (catName && !categories.includes(catName)) {
    categories.push(catName);
    saveData();
    renderCategories();
    // Select the newly added category in the resource form dropdown
    resourceCategorySelect.value = catName;
    closeCategoryModal();
  } else {
    alert('Category already exists or is invalid.');
  }
}

function deleteCategory(cat) {
  if (confirm(`Delete category "${cat}"?`)) {
    categories = categories.filter(c => c !== cat);
    saveData();
    if (currentCategory === cat) {
      selectCategory('all', viewBtns[0]);
    } else {
      renderCategories();
    }
  }
}

function updateStats() {
  const notesCount = resources.filter(r => r.type === 'note').length;
  const bookmarksCount = resources.filter(r => r.type === 'bookmark').length;
  
  document.getElementById('totalNotesStat').textContent = notesCount;
  document.getElementById('totalBookmarksStat').textContent = bookmarksCount;
  document.getElementById('totalCategoriesStat').textContent = categories.length;
}

function saveData() {
  localStorage.setItem('pkh_resources', JSON.stringify(resources));
  localStorage.setItem('pkh_categories', JSON.stringify(categories));
}

// Modal Helpers
function openResourceModal() {
  editId = null;
  modalTitle.textContent = 'Add New Resource';
  resourceForm.reset();
  
  // Default to Note
  document.querySelector('input[name="resourceType"][value="note"]').checked = true;
  document.querySelector('input[name="resourceType"][value="note"]').dispatchEvent(new Event('change'));
  
  // Default to current category if in category view
  if (currentView === 'category' && currentCategory !== 'all') {
    resourceCategorySelect.value = currentCategory;
  }
  
  resourceModal.classList.add('active');
  document.getElementById('resourceTitle').focus();
}

function closeResourceModal() {
  resourceModal.classList.remove('active');
}

function openCategoryModal() {
  categoryForm.reset();
  categoryModal.classList.add('active');
  document.getElementById('newCategoryName').focus();
}

function closeCategoryModal() {
  categoryModal.classList.remove('active');
}

// Utility
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}

// Boot
init();
