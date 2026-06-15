// --- Mock Data ---
const professionals = [
  { id: 1, name: "Marcus Webb", category: "Plumbing", rating: 4.9, reviews: 124, price: "$85/hr", img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=200" },
  { id: 2, name: "Sarah Jenkins", category: "Electrical", rating: 4.8, reviews: 89, price: "$95/hr", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=200" },
  { id: 3, name: "Elena Gomez", category: "House Cleaning", rating: 5.0, reviews: 210, price: "$40/hr", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" },
  { id: 4, name: "David Chen", category: "HVAC Repair", rating: 4.7, reviews: 65, price: "$110/hr", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" }
];

const customerBookings = [
  { service: "Leaky Faucet Repair", pro: "Marcus Webb", date: "Oct 22, 10:00 AM", status: "Upcoming" },
  { service: "Deep House Cleaning", pro: "Elena Gomez", date: "Oct 15, 09:00 AM", status: "Completed" }
];

const providerRequests = [
  { customer: "John Doe", type: "Pipe Installation", loc: "123 Main St", time: "Tomorrow, 2:00 PM", status: "Pending" },
  { customer: "Alice Smith", type: "Water Heater Fix", loc: "456 Oak Ave", time: "Oct 24, 9:00 AM", status: "Accepted" }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const navTabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.tab-content');
  const roleSelect = document.getElementById('role-select');
  const providerTabBtn = document.getElementById('provider-tab-btn');
  const mobileProviderTabBtn = document.getElementById('mobile-provider-tab-btn');

  // Initialization
  renderPros();
  renderBookings();

  // Role Switching Logic
  roleSelect.addEventListener('change', (e) => {
    const role = e.target.value;
    
    if (role === 'provider') {
      providerTabBtn.style.display = 'block';
      if(mobileProviderTabBtn) mobileProviderTabBtn.style.display = 'block';
      document.querySelector('[data-tab="provider"]').click();
      
      // Update Avatar
      document.getElementById('user-avatar').src = "https://ui-avatars.com/api/?name=Service+Provider&background=3b82f6&color=fff";
    } else {
      providerTabBtn.style.display = 'none';
      if(mobileProviderTabBtn) mobileProviderTabBtn.style.display = 'none';
      document.querySelector('[data-tab="discover"]').click();
      
      // Update Avatar
      document.getElementById('user-avatar').src = "https://ui-avatars.com/api/?name=Local+Customer&background=10b981&color=fff";
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
    if (status === 'Completed' || status === 'Accepted') return `<span class="badge success">${status}</span>`;
    if (status === 'Pending') return `<span class="badge warning">${status}</span>`;
    return `<span class="badge primary">${status}</span>`;
  }

  function renderPros() {
    const grid = document.getElementById('pro-grid');
    if(!grid) return;

    grid.innerHTML = professionals.map(p => `
      <div class="pro-card">
        <div class="pro-header">
          <img src="${p.img}" class="pro-avatar">
          <div>
            <div class="pro-name">${p.name}</div>
            <div class="pro-category">${p.category}</div>
          </div>
        </div>
        <div class="pro-rating">
          <i class="ph-fill ph-star"></i> ${p.rating} <span class="text-muted font-normal">(${p.reviews} reviews)</span>
        </div>
        <div class="pro-footer">
          <span class="pro-price">${p.price}</span>
          <button class="btn primary-btn btn-sm">Book Now</button>
        </div>
      </div>
    `).join('');
  }

  function renderBookings() {
    // Customer
    const cTbody = document.getElementById('customer-bookings-tbody');
    if(cTbody) {
      cTbody.innerHTML = customerBookings.map(b => `
        <tr>
          <td><strong>${b.service}</strong></td>
          <td>${b.pro}</td>
          <td>${b.date}</td>
          <td>${getStatusBadge(b.status)}</td>
          <td><button class="btn outline-btn btn-sm">View</button></td>
        </tr>
      `).join('');
    }

    // Provider
    const pTbody = document.getElementById('provider-requests-tbody');
    if(pTbody) {
      pTbody.innerHTML = providerRequests.map(r => `
        <tr>
          <td><strong>${r.customer}</strong></td>
          <td>${r.type}</td>
          <td><i class="ph-fill ph-map-pin text-muted"></i> ${r.loc}</td>
          <td>${r.time}</td>
          <td>
            ${r.status === 'Pending' 
              ? `<button class="btn primary-btn btn-sm">Accept</button>`
              : getStatusBadge(r.status)
            }
          </td>
        </tr>
      `).join('');
    }
  }
});
