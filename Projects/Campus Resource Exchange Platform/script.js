let resources = [
  {
    id: 1,
    title: "Campbell Biology 12th Edition",
    category: "Textbooks",
    condition: "Good",
    type: "Trade",
    date: new Date().toLocaleDateString()
  },
  {
    id: 2,
    title: "TI-84 Plus CE Graphing Calculator",
    category: "Electronics",
    condition: "Like New",
    type: "Lend",
    date: new Date().toLocaleDateString()
  },
  {
    id: 3,
    title: "Organic Chemistry Lab Coat (Size M)",
    category: "Supplies",
    condition: "Fair",
    type: "Giveaway",
    date: new Date().toLocaleDateString()
  },
  {
    id: 4,
    title: "Intro to Psychology Lecture Notes",
    category: "Notes",
    condition: "Good",
    type: "Giveaway",
    date: new Date().toLocaleDateString()
  }
];

const grid = document.getElementById('listings-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

const modal = document.getElementById('post-modal');
const postBtn = document.getElementById('post-btn');
const closeBtn = document.getElementById('close-modal');
const postForm = document.getElementById('post-form');

function renderListings() {
  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  
  grid.innerHTML = '';
  
  const filtered = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm);
    const matchesCat = category === 'all' || res.category === category;
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No resources found matching your criteria.</p>';
    return;
  }

  filtered.forEach(res => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${res.title}</h3>
        <span class="tag">${res.category}</span>
      </div>
      <div class="card-details">
        <p><strong>Condition:</strong> ${res.condition}</p>
        <p><strong>Posted:</strong> ${res.date}</p>
      </div>
      <div class="card-footer">
        <span class="type-badge">${res.type}</span>
        <button class="btn primary" onclick="alert('Contacting owner for ${res.title}...')">Contact</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Event Listeners for Filtering
searchInput.addEventListener('input', renderListings);
categoryFilter.addEventListener('change', renderListings);

// Modal Logic
postBtn.addEventListener('click', () => modal.classList.remove('hidden'));
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden');
});

// Form Submission
postForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const newRes = {
    id: Date.now(),
    title: document.getElementById('item-title').value,
    category: document.getElementById('item-category').value,
    condition: document.getElementById('item-condition').value,
    type: document.getElementById('item-type').value,
    date: new Date().toLocaleDateString()
  };
  
  resources.unshift(newRes);
  renderListings();
  
  postForm.reset();
  modal.classList.add('hidden');
});

// Initial Render
renderListings();
