// --- Mock Data ---
const tourPackages = [
  { title: "Bali Paradise Explorer", location: "Bali, Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400", price: "$1,299" },
  { title: "Swiss Alps Adventure", location: "Zermatt, Switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=400", price: "$2,450" },
  { title: "Tokyo City Highlights", location: "Tokyo, Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400", price: "$1,850" },
  { title: "Santorini Getaway", location: "Santorini, Greece", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=400", price: "$1,600" }
];

const customerBookings = [
  { dest: "Swiss Alps Adventure", dates: "Dec 10 - Dec 18", guests: 2, status: "Confirmed" },
  { dest: "Tokyo City Highlights", dates: "Oct 05 - Oct 12", guests: 1, status: "Completed" }
];

const adminBookings = [
  { name: "John Doe", pkg: "Bali Paradise Explorer", date: "Oct 22, 2026", amount: "$1,299", status: "Pending" },
  { name: "Sarah Smith", pkg: "Santorini Getaway", date: "Oct 20, 2026", amount: "$3,200", status: "Confirmed" },
  { name: "Mike Johnson", pkg: "Swiss Alps Adventure", date: "Oct 19, 2026", amount: "$2,450", status: "Confirmed" }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const navTabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.tab-content');
  const roleSelect = document.getElementById('role-select');
  const adminTabBtn = document.getElementById('admin-tab-btn');
  const mobileAdminTabBtn = document.getElementById('mobile-admin-tab-btn');

  // Initialization
  renderTours();
  renderBookings();

  // Role Switching Logic
  roleSelect.addEventListener('change', (e) => {
    const role = e.target.value;
    
    if (role === 'admin') {
      adminTabBtn.style.display = 'block';
      if(mobileAdminTabBtn) mobileAdminTabBtn.style.display = 'block';
      // Switch to admin view automatically
      document.querySelector('[data-tab="admin"]').click();
    } else {
      adminTabBtn.style.display = 'none';
      if(mobileAdminTabBtn) mobileAdminTabBtn.style.display = 'none';
      // Switch back to explore
      document.querySelector('[data-tab="explore"]').click();
    }
  });

  // Tab Switching
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      
      // Update Active Classes
      navTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll(`[data-tab="${targetId}"]`).forEach(t => t.classList.add('active'));

      // Switch Content
      views.forEach(v => {
        v.classList.add('hidden');
        if (v.id === targetId) {
          v.classList.remove('hidden');
        }
      });
    });
  });

  function getStatusBadge(status) {
    let cls = '';
    if (status === 'Confirmed' || status === 'Completed') cls = 'success';
    if (status === 'Pending') cls = 'warning';
    return `<span class="badge ${cls}">${status}</span>`;
  }

  function renderTours() {
    const grid = document.getElementById('tour-grid');
    if(grid) {
      grid.innerHTML = tourPackages.map(t => `
        <div class="tour-card">
          <img src="${t.image}" alt="${t.title}" class="tour-img">
          <div class="tour-content">
            <h3 class="tour-title">${t.title}</h3>
            <div class="tour-location"><i class="ph-fill ph-map-pin"></i> ${t.location}</div>
            <div class="tour-footer">
              <span class="tour-price">${t.price}</span>
              <button class="btn outline-btn btn-sm">View Details</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  function renderBookings() {
    // Customer
    const tbody = document.getElementById('upcoming-bookings-tbody');
    if(tbody) {
      tbody.innerHTML = customerBookings.map(b => `
        <tr>
          <td><strong>${b.dest}</strong></td>
          <td>${b.dates}</td>
          <td><i class="ph-fill ph-users"></i> ${b.guests}</td>
          <td>${getStatusBadge(b.status)}</td>
          <td><button class="btn outline-btn btn-sm">Manage</button></td>
        </tr>
      `).join('');
    }

    // Admin
    const adminTbody = document.getElementById('admin-bookings-tbody');
    if(adminTbody) {
      adminTbody.innerHTML = adminBookings.map(b => `
        <tr>
          <td><strong>${b.name}</strong></td>
          <td>${b.pkg}</td>
          <td>${b.date}</td>
          <td><strong>${b.amount}</strong></td>
          <td>${getStatusBadge(b.status)}</td>
        </tr>
      `).join('');
    }
  }
});
