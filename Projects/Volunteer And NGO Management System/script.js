// --- Role Data & Menus ---
const sidebars = {
  volunteer: [
    { icon: 'ph-squares-four', label: 'Dashboard', active: true },
    { icon: 'ph-calendar-check', label: 'Find Events', active: false },
    { icon: 'ph-clock-counter-clockwise', label: 'History & Logs', active: false },
    { icon: 'ph-medal', label: 'Badges & Rewards', active: false }
  ],
  ngo: [
    { icon: 'ph-squares-four', label: 'NGO Overview', active: true },
    { icon: 'ph-megaphone', label: 'Campaigns', active: false },
    { icon: 'ph-users', label: 'Volunteers', active: false },
    { icon: 'ph-chart-bar', label: 'Impact Reports', active: false }
  ]
};

// --- Mock Data ---
const volShifts = [
  { name: "Beach Cleanup Drive", org: "Ocean Savers", date: "Oct 20, 09:00 AM", status: "Confirmed" },
  { name: "Food Bank Sorting", org: "City Relief", date: "Oct 22, 02:00 PM", status: "Pending" },
  { name: "Tree Plantation", org: "Green Earth", date: "Oct 25, 08:00 AM", status: "Confirmed" }
];

const ngoApps = [
  { name: "Sarah Jenkins", campaign: "Winter Coat Drive", date: "Oct 15, 2026", status: "Pending" },
  { name: "David Chen", campaign: "Winter Coat Drive", date: "Oct 14, 2026", status: "Approved" },
  { name: "Maria Garcia", campaign: "Food Bank Sorting", date: "Oct 12, 2026", status: "Approved" },
  { name: "James Wilson", campaign: "Beach Cleanup", date: "Oct 10, 2026", status: "Rejected" }
];

const suggestedCauses = [
  { icon: 'ph-tree', title: 'Environmental Protection', desc: 'Help restore local parks and beaches.' },
  { icon: 'ph-bowl-food', title: 'Food Security', desc: 'Assist in local soup kitchens and pantries.' },
  { icon: 'ph-student', title: 'Education Mentorship', desc: 'Tutor students in your community.' }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const roleBtns = document.querySelectorAll('.role-btn');
  const views = document.querySelectorAll('.role-view');
  const sidebarMenu = document.getElementById('sidebar-menu');
  const avatar = document.getElementById('user-avatar');

  // Initialize
  renderSidebar('volunteer');
  renderTables();

  // Role Switcher Logic
  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update Buttons
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const role = btn.getAttribute('data-role');
      
      // Update Avatar
      if(role === 'volunteer') avatar.src = "https://ui-avatars.com/api/?name=Vishwa+Mistry&background=14b8a6&color=fff";
      if(role === 'ngo') avatar.src = "https://ui-avatars.com/api/?name=NGO+Admin&background=3b82f6&color=fff";

      // Switch Views
      views.forEach(v => {
        v.classList.add('hidden');
        if (v.id === `${role}-view`) {
          v.classList.remove('hidden');
        }
      });

      // Update Sidebar
      renderSidebar(role);
    });
  });

  function renderSidebar(role) {
    const items = sidebars[role];
    sidebarMenu.innerHTML = items.map(item => `
      <li class="${item.active ? 'active' : ''}">
        <i class="ph ${item.icon}"></i> ${item.label}
      </li>
    `).join('');
  }

  function getStatusBadge(status) {
    let cls = '';
    if (['Approved', 'Confirmed'].includes(status)) cls = 'success';
    if (['Pending'].includes(status)) cls = 'warning';
    return `<span class="badge ${cls}">${status}</span>`;
  }

  function renderTables() {
    // Volunteer Shifts
    const volTbody = document.getElementById('vol-shifts-tbody');
    if(volTbody) {
      volTbody.innerHTML = volShifts.map(s => `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td>${s.org}</td>
          <td>${s.date}</td>
          <td>${getStatusBadge(s.status)}</td>
        </tr>
      `).join('');
    }

    // Causes List
    const causesList = document.getElementById('vol-causes-list');
    if(causesList) {
      causesList.innerHTML = suggestedCauses.map(c => `
        <div class="cause-item">
          <div class="cause-icon"><i class="ph ${c.icon}"></i></div>
          <div class="cause-info">
            <h4>${c.title}</h4>
            <p>${c.desc}</p>
          </div>
        </div>
      `).join('');
    }

    // NGO Applications
    const ngoTbody = document.getElementById('ngo-apps-tbody');
    if(ngoTbody) {
      ngoTbody.innerHTML = ngoApps.map(a => `
        <tr>
          <td><strong>${a.name}</strong></td>
          <td>${a.campaign}</td>
          <td>${a.date}</td>
          <td>${getStatusBadge(a.status)}</td>
          <td><button class="btn outline-btn btn-sm">Review</button></td>
        </tr>
      `).join('');
    }
  }
});
