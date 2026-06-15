// --- Mock Data ---
const publicIssues = [
  { id: 1, title: "Deep Pothole on Elm Street", loc: "Intersection of Elm & 5th", img: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400", upvotes: 42, status: "Reported", time: "2 hours ago" },
  { id: 2, title: "Flickering Streetlight", loc: "1200 Block of Maple Ave", img: "https://images.unsplash.com/photo-1515281239448-2abee61a3762?auto=format&fit=crop&q=80&w=400", upvotes: 18, status: "In Progress", time: "1 day ago" },
  { id: 3, title: "Overgrown Tree Blocking Sign", loc: "Main St & Oak", img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=400", upvotes: 8, status: "Reported", time: "3 days ago" }
];

const adminReports = [
  { ticket: "TKT-1042", type: "Road Damage", loc: "Elm & 5th", upvotes: 42, status: "Open" },
  { ticket: "TKT-1038", type: "Lighting", loc: "Maple Ave", upvotes: 18, status: "In Progress" },
  { ticket: "TKT-1025", type: "Vandalism", loc: "Central Park", upvotes: 5, status: "Resolved" }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const navTabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.tab-content');
  const roleSelect = document.getElementById('role-select');
  const adminTabBtn = document.getElementById('admin-tab-btn');
  const mobileAdminTabBtn = document.getElementById('mobile-admin-tab-btn');

  // Initialization
  renderFeed();
  renderAdminQueue();

  // Role Switching Logic
  roleSelect.addEventListener('change', (e) => {
    const role = e.target.value;
    
    if (role === 'admin') {
      adminTabBtn.style.display = 'block';
      if(mobileAdminTabBtn) mobileAdminTabBtn.style.display = 'block';
      document.querySelector('[data-tab="admin"]').click();
      
      // Update Avatar
      document.getElementById('user-avatar').src = "https://ui-avatars.com/api/?name=City+Admin&background=f59e0b&color=fff";
    } else {
      adminTabBtn.style.display = 'none';
      if(mobileAdminTabBtn) mobileAdminTabBtn.style.display = 'none';
      document.querySelector('[data-tab="feed"]').click();
      
      // Update Avatar
      document.getElementById('user-avatar').src = "https://ui-avatars.com/api/?name=Local+Resident&background=3b82f6&color=fff";
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
    if (status === 'Resolved' || status === 'Fixed') return `<span class="badge success">${status}</span>`;
    if (status === 'In Progress') return `<span class="badge warning">${status}</span>`;
    if (status === 'Reported' || status === 'Open') return `<span class="badge danger">${status}</span>`;
    return `<span class="badge primary">${status}</span>`;
  }

  function renderFeed() {
    const grid = document.getElementById('issue-grid');
    if(!grid) return;

    grid.innerHTML = publicIssues.map(i => `
      <div class="issue-card">
        <img src="${i.img}" class="issue-img">
        <div class="issue-content">
          <div class="flex-between mb-2">
            ${getStatusBadge(i.status)}
            <span class="text-muted" style="font-size:0.8rem;">${i.time}</span>
          </div>
          <div class="issue-title">${i.title}</div>
          <div class="issue-loc"><i class="ph-fill ph-map-pin"></i> ${i.loc}</div>
        </div>
        <div class="issue-footer">
          <button class="upvote-btn" onclick="alert('Upvoted!')"><i class="ph-bold ph-caret-up"></i> ${i.upvotes}</button>
          <button class="btn outline-btn btn-sm">Share</button>
        </div>
      </div>
    `).join('');
  }

  function renderAdminQueue() {
    const tbody = document.getElementById('admin-reports-tbody');
    if(!tbody) return;

    tbody.innerHTML = adminReports.map(r => `
      <tr>
        <td><strong>${r.ticket}</strong></td>
        <td>${r.type}</td>
        <td><i class="ph-fill ph-map-pin text-muted"></i> ${r.loc}</td>
        <td><span class="text-primary font-bold"><i class="ph-bold ph-caret-up"></i> ${r.upvotes}</span></td>
        <td>${getStatusBadge(r.status)}</td>
        <td>
          <button class="btn primary-btn btn-sm">Manage</button>
        </td>
      </tr>
    `).join('');
  }
});
