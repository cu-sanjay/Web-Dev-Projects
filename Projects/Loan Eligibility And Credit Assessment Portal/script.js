// --- Mock Data ---
const applicantApps = [
  { id: "APP-8902", type: "Personal Loan", amount: "$15,000", date: "Oct 22, 2026", status: "Under Review" },
  { id: "APP-8114", type: "Auto Loan", amount: "$25,000", date: "Sep 15, 2026", status: "Approved" }
];

const officerQueue = [
  { id: "APP-8902", applicant: "Sarah Jenkins", score: 742, type: "Personal", amount: "$15,000", status: "Pending Review" },
  { id: "APP-8905", applicant: "Marcus Webb", score: 610, type: "Business", amount: "$50,000", status: "High Risk" },
  { id: "APP-8890", applicant: "David Chen", score: 780, type: "Auto", amount: "$30,000", status: "Pre-Approved" }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const navTabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.tab-content');
  const roleSelect = document.getElementById('role-select');
  const officerTabBtn = document.getElementById('officer-tab-btn');
  const mobileOfficerTabBtn = document.getElementById('mobile-officer-tab-btn');

  // Initialization
  renderApplicantApps();
  renderOfficerQueue();

  // Role Switching Logic
  roleSelect.addEventListener('change', (e) => {
    const role = e.target.value;
    
    if (role === 'officer') {
      officerTabBtn.style.display = 'block';
      if(mobileOfficerTabBtn) mobileOfficerTabBtn.style.display = 'block';
      document.querySelector('[data-tab="officer"]').click();
      
      // Update Avatar
      document.getElementById('user-avatar').src = "https://ui-avatars.com/api/?name=Loan+Officer&background=f59e0b&color=fff";
    } else {
      officerTabBtn.style.display = 'none';
      if(mobileOfficerTabBtn) mobileOfficerTabBtn.style.display = 'none';
      document.querySelector('[data-tab="dashboard"]').click();
      
      // Update Avatar
      document.getElementById('user-avatar').src = "https://ui-avatars.com/api/?name=Loan+Applicant&background=6366f1&color=fff";
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
    if (status === 'Approved' || status === 'Pre-Approved') return `<span class="badge success">${status}</span>`;
    if (status === 'High Risk' || status === 'Rejected') return `<span class="badge danger">${status}</span>`;
    if (status === 'Under Review' || status === 'Pending Review') return `<span class="badge warning">${status}</span>`;
    return `<span class="badge primary">${status}</span>`;
  }

  function getScoreColor(score) {
    if(score >= 750) return 'text-green font-bold';
    if(score >= 650) return 'text-primary font-bold';
    return 'text-red font-bold';
  }

  function renderApplicantApps() {
    const tbody = document.getElementById('applicant-apps-tbody');
    if(!tbody) return;

    tbody.innerHTML = applicantApps.map(a => `
      <tr>
        <td><strong>${a.id}</strong></td>
        <td>${a.type}</td>
        <td><strong>${a.amount}</strong></td>
        <td>${a.date}</td>
        <td>${getStatusBadge(a.status)}</td>
      </tr>
    `).join('');
  }

  function renderOfficerQueue() {
    const tbody = document.getElementById('officer-queue-tbody');
    if(!tbody) return;

    tbody.innerHTML = officerQueue.map(q => `
      <tr>
        <td><strong>${q.id}</strong></td>
        <td>${q.applicant}</td>
        <td class="${getScoreColor(q.score)}">${q.score}</td>
        <td>${q.type}</td>
        <td><strong>${q.amount}</strong></td>
        <td>${getStatusBadge(q.status)}</td>
        <td>
          <button class="btn primary-btn btn-sm">Assess</button>
        </td>
      </tr>
    `).join('');
  }
});
