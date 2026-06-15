// --- Navigation & Sidebar Logic ---
const menuItems = document.querySelectorAll('.sidebar-menu li');
const tabContents = document.querySelectorAll('.tab-content');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    // Update Active State on Nav
    menuItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    // Switch Tabs
    const targetId = item.getAttribute('data-tab');
    tabContents.forEach(tab => {
      tab.classList.add('hidden');
      if (tab.id === targetId) {
        tab.classList.remove('hidden');
      }
    });

    // Close mobile menu if open
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('mobile-open');
    }
  });
});

mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});

// --- Mock Data ---

const scholarships = [
  { id: 1, title: "Global Tech Innovators Scholarship", provider: "Tech Foundation", amount: "$5,000", type: "Merit-Based", deadline: "2026-11-01", isSaved: false },
  { id: 2, title: "Diversity in Engineering Grant", provider: "Engineering Council", amount: "$2,500", type: "Diversity", deadline: "2026-10-25", isSaved: true },
  { id: 3, title: "First-Generation College Student Award", provider: "EduCorp", amount: "$10,000", type: "Need-Based", deadline: "2026-12-15", isSaved: false },
  { id: 4, title: "Women in Computer Science Fund", provider: "Women in Tech org", amount: "$3,000", type: "Diversity", deadline: "2026-11-20", isSaved: false },
  { id: 5, title: "Academic Excellence Scholarship", provider: "State University", amount: "Full Tuition", type: "Merit-Based", deadline: "2027-01-10", isSaved: true }
];

const applications = [
  { name: "National STEM Excellence Award", type: "Merit-Based", amount: "$5,000", deadline: "Oct 15, 2026", status: "Draft" },
  { name: "First-Gen Scholars Grant", type: "Need-Based", amount: "$2,000", deadline: "Oct 18, 2026", status: "Draft" },
  { name: "Future Leaders Scholarship", type: "Merit-Based", amount: "$10,000", deadline: "Sep 01, 2026", status: "Pending Review" },
  { name: "Community Service Grant", type: "Need-Based", amount: "$1,500", deadline: "Aug 15, 2026", status: "Approved" }
];

const financialTimeline = [
  { title: "Fall Semester Disbursement", date: "Sep 05, 2026", desc: "Federal Pell Grant and State Scholarship dispersed to university account.", amount: "$4,500" },
  { title: "Spring Semester Award Notice", date: "Nov 20, 2026", desc: "Expected notification for Spring term institutional aid.", amount: "TBD" },
  { title: "Summer Internship Stipend", date: "May 10, 2027", desc: "Pre-approved stipend for corporate summer internship program.", amount: "$3,000" }
];

// --- Rendering Functions ---

function getStatusBadge(status) {
  const s = status.toLowerCase();
  if (s === 'approved') return `<span class="badge status-approved">${status}</span>`;
  if (s === 'pending review') return `<span class="badge status-pending">${status}</span>`;
  if (s === 'draft') return `<span class="badge status-draft">${status}</span>`;
  return `<span class="badge">${status}</span>`;
}

function renderScholarships() {
  const grid = document.getElementById('scholarship-grid');
  if(!grid) return;

  grid.innerHTML = scholarships.map(sc => `
    <div class="scholarship-card">
      <div class="sc-header">
        <span class="sc-amount">${sc.amount}</span>
        <button class="icon-btn" style="width: 32px; height: 32px; border: none; color: ${sc.isSaved ? 'var(--primary)' : 'var(--text-muted)'}; background: transparent;">
          <i class="${sc.isSaved ? 'ph-fill' : 'ph'} ph-bookmark-simple" style="font-size: 1.5rem;"></i>
        </button>
      </div>
      <h3 class="sc-title">${sc.title}</h3>
      <p class="sc-provider"><i class="ph ph-buildings"></i> ${sc.provider}</p>
      
      <div class="sc-meta">
        <span class="badge" style="background: var(--bg-page); border: 1px solid var(--border); color: var(--text-main); font-weight: normal;">${sc.type}</span>
      </div>
      
      <div class="sc-footer">
        <span class="sc-deadline"><i class="ph ph-clock-countdown"></i> Due: ${sc.deadline}</span>
        <button class="btn secondary-btn btn-sm">Apply Now</button>
      </div>
    </div>
  `).join('');
}

function renderApplications() {
  const tbody = document.getElementById('applications-tbody');
  if(!tbody) return;

  tbody.innerHTML = applications.map(app => `
    <tr>
      <td><strong>${app.name}</strong></td>
      <td>${app.type}</td>
      <td style="color: var(--primary); font-weight: 600;">${app.amount}</td>
      <td>${app.deadline}</td>
      <td>${getStatusBadge(app.status)}</td>
      <td>
        <button class="btn outline-btn btn-sm">${app.status === 'Draft' ? 'Edit' : 'View'}</button>
      </td>
    </tr>
  `).join('');
}

function renderTimeline() {
  const container = document.getElementById('funds-timeline');
  if(!container) return;

  container.innerHTML = financialTimeline.map(item => `
    <div class="tl-item">
      <div class="tl-dot"></div>
      <div class="tl-content">
        <h4><span>${item.title}</span> <span style="color: var(--primary);">${item.amount}</span></h4>
        <p style="margin-bottom: 0.5rem; color: var(--primary); font-weight: 500;">${item.date}</p>
        <p>${item.desc}</p>
      </div>
    </div>
  `).join('');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  renderScholarships();
  renderApplications();
  renderTimeline();
});
