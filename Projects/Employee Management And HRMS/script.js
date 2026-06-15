// --- Mock Data ---
const employees = [
  { name: "Sarah Jenkins", role: "Frontend Developer", dept: "Engineering", email: "sarah.j@nexus.com", phone: "+1 (555) 123-4567", avatar: "Sarah+Jenkins", color: "38bdf8" },
  { name: "Marcus Webb", role: "Product Designer", dept: "Design", email: "marcus.w@nexus.com", phone: "+1 (555) 987-6543", avatar: "Marcus+Webb", color: "818cf8" },
  { name: "Elena Gomez", role: "Marketing Lead", dept: "Marketing", email: "elena.g@nexus.com", phone: "+1 (555) 456-7890", avatar: "Elena+Gomez", color: "10b981" },
  { name: "David Chen", role: "Backend Developer", dept: "Engineering", email: "david.c@nexus.com", phone: "+1 (555) 234-5678", avatar: "David+Chen", color: "f59e0b" }
];

const onboarding = [
  { name: "Emily Watson", role: "UX Researcher", dept: "Design", start: "Oct 20, 2026", status: "In Progress" },
  { name: "James Miller", role: "DevOps Engineer", dept: "Engineering", start: "Oct 15, 2026", status: "Completed" }
];

const leaves = [
  { emp: "Marcus Webb", type: "Annual Leave", duration: "Oct 22 - Oct 25 (4 Days)", reason: "Family Vacation", status: "Pending" },
  { emp: "David Chen", type: "Sick Leave", duration: "Oct 18 (1 Day)", reason: "Medical Appointment", status: "Approved" }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const navBtns = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');

  // Initialization
  renderDirectory();
  renderOnboarding();
  renderLeaves();

  // Navigation Switching
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      views.forEach(v => {
        v.classList.add('hidden');
        if (v.id === targetId) {
          v.classList.remove('hidden');
        }
      });
    });
  });

  function getBadge(status) {
    if(status === 'Completed' || status === 'Approved') return `<span class="badge success">${status}</span>`;
    if(status === 'In Progress' || status === 'Pending') return `<span class="badge warning">${status}</span>`;
    return `<span class="badge">${status}</span>`;
  }

  function renderDirectory() {
    const grid = document.getElementById('directory-grid');
    if(!grid) return;

    grid.innerHTML = employees.map(e => `
      <div class="emp-card glass-panel">
        <img src="https://ui-avatars.com/api/?name=${e.avatar}&background=${e.color}&color=fff" class="emp-avatar">
        <div class="emp-name">${e.name}</div>
        <div class="emp-role">${e.role}</div>
        
        <div class="mt-2">
          <div class="emp-contact"><i class="ph-fill ph-envelope-simple"></i> ${e.email}</div>
          <div class="emp-contact"><i class="ph-fill ph-phone"></i> ${e.phone}</div>
        </div>

        <div class="emp-actions">
          <button class="icon-btn"><i class="ph ph-chat-circle-text"></i></button>
          <button class="icon-btn"><i class="ph ph-dots-three"></i></button>
        </div>
      </div>
    `).join('');
  }

  function renderOnboarding() {
    const tbody = document.getElementById('onboarding-tbody');
    if(!tbody) return;

    tbody.innerHTML = onboarding.map(o => `
      <tr>
        <td><strong>${o.name}</strong></td>
        <td>${o.role}</td>
        <td>${o.dept}</td>
        <td>${o.start}</td>
        <td>${getBadge(o.status)}</td>
      </tr>
    `).join('');
  }

  function renderLeaves() {
    const tbody = document.getElementById('leaves-tbody');
    if(!tbody) return;

    tbody.innerHTML = leaves.map(l => `
      <tr>
        <td><strong>${l.emp}</strong></td>
        <td>${l.type}</td>
        <td>${l.duration}</td>
        <td class="text-muted">${l.reason}</td>
        <td>
          ${l.status === 'Pending' 
            ? `<button class="btn primary-btn btn-sm">Approve</button> <button class="btn outline-btn btn-sm">Reject</button>`
            : getBadge(l.status)
          }
        </td>
      </tr>
    `).join('');
  }
});
