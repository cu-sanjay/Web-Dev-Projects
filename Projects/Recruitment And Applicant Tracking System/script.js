// --- Mock Data ---
const candidates = [
  { id: 1, name: "Alice Johnson", role: "Frontend Developer", date: "Oct 15", stage: "applied", rating: "unrated", avatar: "Alice+Johnson", color: "ef4444" },
  { id: 2, name: "Robert Chen", role: "Product Manager", date: "Oct 14", stage: "applied", rating: "unrated", avatar: "Robert+Chen", color: "3b82f6" },
  { id: 3, name: "Elena Gomez", role: "UX Designer", date: "Oct 12", stage: "interview", rating: "4.5", avatar: "Elena+Gomez", color: "8b5cf6" },
  { id: 4, name: "Marcus Webb", role: "Frontend Developer", date: "Oct 10", stage: "interview", rating: "4.0", avatar: "Marcus+Webb", color: "10b981" },
  { id: 5, name: "Sarah Smith", role: "Backend Developer", date: "Oct 05", stage: "offered", rating: "5.0", avatar: "Sarah+Smith", color: "f59e0b" }
];

const jobs = [
  { title: "Frontend Developer", dept: "Engineering", type: "Full-time", location: "Remote", applicants: 45, new: 12 },
  { title: "Product Manager", dept: "Product", type: "Full-time", location: "New York, NY", applicants: 28, new: 5 },
  { title: "UX Designer", dept: "Design", type: "Contract", location: "Remote", applicants: 64, new: 18 }
];

const interviews = [
  { candidate: "Elena Gomez", role: "UX Designer", interviewer: "Design Team", date: "Tomorrow, 10:00 AM", status: "Scheduled" },
  { candidate: "Marcus Webb", role: "Frontend Dev", interviewer: "Tech Lead", date: "Oct 20, 2:00 PM", status: "Pending Confirmation" }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const navBtns = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');

  // Initialization
  renderKanban();
  renderJobs();
  renderInterviews();

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

  function renderKanban() {
    const colApplied = document.getElementById('col-applied');
    const colInterview = document.getElementById('col-interview');
    const colOffered = document.getElementById('col-offered');

    if(!colApplied || !colInterview || !colOffered) return;

    const createCard = (c) => `
      <div class="candidate-card">
        <div class="cand-header">
          <img src="https://ui-avatars.com/api/?name=${c.avatar}&background=${c.color}&color=fff">
          <div>
            <div class="cand-name">${c.name}</div>
            <div class="cand-role">${c.role}</div>
          </div>
        </div>
        <div class="cand-footer">
          <span><i class="ph-fill ph-calendar-blank"></i> ${c.date}</span>
          <span>${c.rating !== 'unrated' ? `<i class="ph-fill ph-star text-orange"></i> ${c.rating}` : 'Unrated'}</span>
        </div>
      </div>
    `;

    colApplied.innerHTML = candidates.filter(c => c.stage === 'applied').map(createCard).join('');
    colInterview.innerHTML = candidates.filter(c => c.stage === 'interview').map(createCard).join('');
    colOffered.innerHTML = candidates.filter(c => c.stage === 'offered').map(createCard).join('');
  }

  function renderJobs() {
    const grid = document.getElementById('jobs-grid');
    if(!grid) return;

    grid.innerHTML = jobs.map(j => `
      <div class="job-card">
        <div class="flex-between">
          <div class="job-title">${j.title}</div>
          <button class="icon-btn" style="width:32px; height:32px;"><i class="ph ph-dots-three"></i></button>
        </div>
        <div class="job-dept">${j.dept} • ${j.type}</div>
        <div class="text-muted mb-3" style="font-size: 0.85rem;"><i class="ph-fill ph-map-pin"></i> ${j.location}</div>
        
        <div class="job-stats">
          <div class="job-stat-item">
            <div class="job-stat-val">${j.applicants}</div>
            <div class="job-stat-lbl">Total</div>
          </div>
          <div class="job-stat-item">
            <div class="job-stat-val text-primary">${j.new}</div>
            <div class="job-stat-lbl">New</div>
          </div>
        </div>
        <button class="btn outline-btn w-full" style="width:100%">View Applicants</button>
      </div>
    `).join('');
  }

  function renderInterviews() {
    const tbody = document.getElementById('interviews-tbody');
    if(!tbody) return;

    tbody.innerHTML = interviews.map(i => {
      let badgeCls = i.status === 'Scheduled' ? 'primary' : 'warning';
      return `
        <tr>
          <td><strong>${i.candidate}</strong></td>
          <td>${i.role}</td>
          <td>${i.interviewer}</td>
          <td>${i.date}</td>
          <td><span class="badge ${badgeCls}">${i.status}</span></td>
        </tr>
      `;
    }).join('');
  }
});
