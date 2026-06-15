// --- Mock Data ---
const communityResources = [
  { id: 1, title: "Power Drill (DeWalt 20V)", owner: "Alex J.", type: "Tools", status: "Available", icon: "ph-wrench" },
  { id: 2, title: "Camping Tent (4-Person)", owner: "Sarah M.", type: "Outdoors", status: "Available", icon: "ph-tent" },
  { id: 3, title: "Projector (1080p)", owner: "David C.", type: "Tech", status: "Borrowed", icon: "ph-projector-screen" },
  { id: 4, title: "Lawn Mower (Electric)", owner: "Emma W.", type: "Tools", status: "Available", icon: "ph-plant" },
  { id: 5, title: "DSLR Camera (Canon)", owner: "Michael B.", type: "Tech", status: "Available", icon: "ph-camera" },
  { id: 6, title: "The Pragmatic Programmer", owner: "Lisa T.", type: "Books", status: "Borrowed", icon: "ph-book-open" }
];

const lendingItems = [
  { title: "Ladder (12ft Aluminum)", status: "Borrowed by Alex J.", date: "Due in 2 days" },
  { title: "Circular Saw", status: "Available", date: "Last used 1 week ago" }
];

const borrowedItems = [
  { title: "Pressure Washer", owner: "from Chris P.", date: "Due tomorrow" }
];

const contributors = [
  { name: "Sarah Jenkins", avatar: "Sarah+Jenkins", stats: "42 Items Lent" },
  { name: "David Chen", avatar: "David+Chen", stats: "28 Items Lent" },
  { name: "Emma Wilson", avatar: "Emma+Wilson", stats: "15 Items Lent" },
  { name: "Michael Chang", avatar: "Michael+Chang", stats: "10 Items Lent" }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.view');

  // Navigation Logic
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');

      // Update Nav
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Update Views
      views.forEach(v => {
        v.classList.add('hidden');
        if(v.id === target) v.classList.remove('hidden');
      });
    });
  });

  // Render Functions
  function renderExplore() {
    const grid = document.getElementById('resource-grid');
    if(!grid) return;

    grid.innerHTML = communityResources.map(item => `
      <div class="item-card glass-panel">
        <div class="flex-between">
          <div class="item-icon-box"><i class="ph ${item.icon}"></i></div>
          <span class="status-badge ${item.status === 'Available' ? 'status-available' : 'status-borrowed'}">${item.status}</span>
        </div>
        <div class="mt-3">
          <h3 class="item-title">${item.title}</h3>
          <div class="item-owner mt-1">
            <img src="https://ui-avatars.com/api/?name=${item.owner.replace(' ', '+')}&background=random&color=fff" alt="${item.owner}">
            <span>${item.owner}</span>
          </div>
        </div>
        <div class="mt-3 flex-between">
          <span class="badge" style="background: rgba(255,255,255,0.1); border:none; color: var(--text-muted);">${item.type}</span>
          <button class="primary-btn" style="padding: 0.4rem 1rem; font-size: 0.85rem;" ${item.status !== 'Available' ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>Request</button>
        </div>
      </div>
    `).join('');
  }

  function renderInventory() {
    const lendList = document.getElementById('lending-list');
    const borrowList = document.getElementById('borrowing-list');

    if(lendList) {
      lendList.innerHTML = lendingItems.map(item => `
        <div class="list-item">
          <div class="list-info">
            <h4>${item.title}</h4>
            <p>${item.status} • ${item.date}</p>
          </div>
          <button class="glass-btn icon-btn"><i class="ph ph-dots-three-vertical"></i></button>
        </div>
      `).join('');
    }

    if(borrowList) {
      borrowList.innerHTML = borrowedItems.map(item => `
        <div class="list-item">
          <div class="list-info">
            <h4>${item.title}</h4>
            <p>${item.owner} • ${item.date}</p>
          </div>
          <button class="primary-btn" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Return Item</button>
        </div>
      `).join('');
    }
  }

  function renderCommunity() {
    const grid = document.getElementById('contributors-grid');
    if(!grid) return;

    grid.innerHTML = contributors.map(c => `
      <div class="contributor-card glass-panel">
        <img src="https://ui-avatars.com/api/?name=${c.avatar}&background=random&color=fff" class="contributor-avatar">
        <div class="contributor-name">${c.name}</div>
        <div class="contributor-stats">${c.stats}</div>
        <button class="glass-btn mt-3 w-full" style="padding: 0.5rem; border-radius: 8px; color: white;">View Profile</button>
      </div>
    `).join('');
  }

  // Init
  renderExplore();
  renderInventory();
  renderCommunity();
});
