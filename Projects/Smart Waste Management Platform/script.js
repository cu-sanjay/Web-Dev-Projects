// --- Mock Data ---
const citizenSchedule = [
  { type: "General Trash", date: "Every Tuesday", instructions: "Place bin at curb by 6:00 AM.", status: "Upcoming" },
  { type: "Recycling", date: "Every Friday", instructions: "Break down cardboard boxes.", status: "Upcoming" },
  { type: "Yard Waste", date: "Oct 25 (Monthly)", instructions: "Use biodegradable bags only.", status: "Pending" }
];

const deptBins = [
  { id: "BIN-442", loc: "Central Park Entrance", type: "General Waste", fill: 95 },
  { id: "BIN-108", loc: "Main St & 5th Ave", type: "Recycling", fill: 82 },
  { id: "BIN-559", loc: "Community Center", type: "Compost", fill: 45 },
  { id: "BIN-312", loc: "Downtown Plaza", type: "General Waste", fill: 12 }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const navTabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.tab-content');
  const roleSelect = document.getElementById('role-select');
  const deptTabBtn = document.getElementById('dept-tab-btn');
  const mobileDeptTabBtn = document.getElementById('mobile-dept-tab-btn');

  // Initialization
  renderSchedule();
  renderDeptBins();

  // Role Switching Logic
  roleSelect.addEventListener('change', (e) => {
    const role = e.target.value;
    
    if (role === 'dept') {
      deptTabBtn.style.display = 'block';
      if(mobileDeptTabBtn) mobileDeptTabBtn.style.display = 'block';
      document.querySelector('[data-tab="dept"]').click();
      
      // Update Avatar
      document.getElementById('user-avatar').src = "https://ui-avatars.com/api/?name=City+Worker&background=3b82f6&color=fff";
    } else {
      deptTabBtn.style.display = 'none';
      if(mobileDeptTabBtn) mobileDeptTabBtn.style.display = 'none';
      document.querySelector('[data-tab="schedule"]').click();
      
      // Update Avatar
      document.getElementById('user-avatar').src = "https://ui-avatars.com/api/?name=Local+Citizen&background=10b981&color=fff";
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
    if (status === 'Upcoming') return `<span class="badge success">${status}</span>`;
    return `<span class="badge warning">${status}</span>`;
  }

  function getFillColor(fill) {
    if(fill >= 90) return 'red';
    if(fill >= 70) return 'orange';
    return 'green';
  }

  function renderSchedule() {
    const tbody = document.getElementById('citizen-schedule-tbody');
    if(!tbody) return;

    tbody.innerHTML = citizenSchedule.map(s => `
      <tr>
        <td><strong>${s.type}</strong></td>
        <td>${s.date}</td>
        <td class="text-muted">${s.instructions}</td>
        <td>${getStatusBadge(s.status)}</td>
      </tr>
    `).join('');
  }

  function renderDeptBins() {
    const tbody = document.getElementById('dept-bins-tbody');
    if(!tbody) return;

    tbody.innerHTML = deptBins.map(b => {
      const color = getFillColor(b.fill);
      return `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td><i class="ph-fill ph-map-pin text-muted"></i> ${b.loc}</td>
        <td>${b.type}</td>
        <td>
          <div class="flex-between" style="font-size:0.85rem; font-weight:bold;">
            <span>${b.fill}% Full</span>
            ${b.fill >= 90 ? '<i class="ph-fill ph-warning text-red"></i>' : ''}
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar ${color}" style="width: ${b.fill}%"></div>
          </div>
        </td>
        <td>
          ${b.fill >= 90 
            ? `<button class="btn primary-btn btn-sm" style="background:var(--red);">Dispatch</button>`
            : `<button class="btn outline-btn btn-sm">Monitor</button>`
          }
        </td>
      </tr>
      `;
    }).join('');
  }
});
