// --- Navigation & Sidebar Logic ---
const navItems = document.querySelectorAll('.sidebar-nav li');
const tabPanes = document.querySelectorAll('.tab-pane');
const mobileToggle = document.getElementById('mobile-toggle');
const sidebar = document.getElementById('sidebar');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    // Active State
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    // Tab Switching
    const target = item.getAttribute('data-tab');
    tabPanes.forEach(tab => {
      tab.classList.add('hidden');
      if (tab.id === target) {
        tab.classList.remove('hidden');
      }
    });

    // Close mobile menu if open
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('mobile-open');
    }
  });
});

mobileToggle.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});

// --- Mock Data ---

const recentProjects = [
  { id: "PRJ-001", name: "AI Diagnostic Tool for MRI", status: "Active", updated: "2 hrs ago", phase: "Data Collection" },
  { id: "PRJ-002", name: "CRISPR delivery vectors", status: "Under Review", updated: "1 day ago", phase: "Ethics Approval" },
  { id: "PRJ-003", name: "Climate Model V4", status: "Active", updated: "3 days ago", phase: "Analysis" },
  { id: "PRJ-004", name: "Quantum Encryption Protocol", status: "Completed", updated: "1 week ago", phase: "Publication" }
];

const projectsData = [
  { title: "AI Diagnostic Tool for MRI", dept: "Computer Science", pi: "Dr. Turing", progress: 65, color: "var(--blue)" },
  { title: "CRISPR delivery vectors", dept: "Bioinformatics", pi: "Dr. Chen", progress: 20, color: "var(--green)" },
  { title: "Climate Model V4", dept: "Earth Sciences", pi: "Dr. Patel", progress: 85, color: "var(--orange)" },
  { title: "Quantum Encryption Protocol", dept: "Physics", pi: "Dr. Smith", progress: 100, color: "var(--purple)" },
  { title: "Nano-bot Drug Delivery", dept: "Engineering", pi: "Dr. Johnson", progress: 40, color: "var(--red)" }
];

const publicationsData = [
  { title: "Deep Learning in Radiology: A Systematic Review", authors: "Turing A., Chen Y.", venue: "Nature Medicine", year: 2026, status: "Published" },
  { title: "Efficient Vector Designs for Gene Therapy", authors: "Chen Y., et al.", venue: "Cell", year: 2025, status: "Under Review" },
  { title: "Predictive Ocean Current Modeling", authors: "Patel R.", venue: "Journal of Climate", year: 2026, status: "Pre-print" },
  { title: "Post-Quantum Cryptography Architectures", authors: "Smith J., Turing A.", venue: "IEEE Security", year: 2025, status: "Published" }
];

const grantsData = [
  { title: "National Science Foundation - AI Core", id: "NSF-2026-991", amount: "$850,000", expires: "Dec 31, 2028", status: "Active" },
  { title: "NIH Clinical Trial Grant", id: "NIH-CT-404", amount: "$1,200,000", expires: "Pending Decision", status: "Under Review" },
  { title: "Department of Energy Compute Grant", id: "DOE-HPC-12", amount: "50,000 Node Hours", expires: "Jun 30, 2026", status: "Active" }
];

// --- Render Functions ---

function getStatusBadge(status) {
  const s = status.toLowerCase();
  if (s === 'active' || s === 'published') return `<span class="badge status-active">${status}</span>`;
  if (s === 'under review' || s === 'pre-print') return `<span class="badge status-review">${status}</span>`;
  return `<span class="badge">${status}</span>`;
}

function renderRecentProjects() {
  const tbody = document.getElementById('recent-projects-tbody');
  if(!tbody) return;
  tbody.innerHTML = recentProjects.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${getStatusBadge(p.status)}</td>
      <td class="text-muted">${p.updated}</td>
      <td>${p.phase}</td>
    </tr>
  `).join('');
}

function renderProjectsGrid() {
  const grid = document.getElementById('project-grid');
  if(!grid) return;
  grid.innerHTML = projectsData.map(p => `
    <div class="project-card">
      <div class="project-header flex-between">
        <span class="badge" style="background: ${p.color}22; color: ${p.color}">${p.dept}</span>
        <button class="icon-btn" style="width: 30px; height: 30px;"><i class="ph ph-dots-three"></i></button>
      </div>
      <h3 style="margin: 1rem 0 0.5rem 0;">${p.title}</h3>
      <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.5rem;">PI: ${p.pi}</p>
      
      <div style="width: 100%; background: var(--bg-page); height: 6px; border-radius: 3px; overflow: hidden;">
        <div style="width: ${p.progress}%; background: ${p.color}; height: 100%;"></div>
      </div>
      
      <div class="project-meta">
        <span><i class="ph ph-check-square"></i> ${p.progress}% Complete</span>
      </div>
    </div>
  `).join('');
}

function renderPublications() {
  const tbody = document.getElementById('publications-tbody');
  if(!tbody) return;
  tbody.innerHTML = publicationsData.map(p => `
    <tr>
      <td><strong>${p.title}</strong></td>
      <td>${p.authors}</td>
      <td>${p.venue}</td>
      <td>${p.year}</td>
      <td>${getStatusBadge(p.status)}</td>
    </tr>
  `).join('');
}

function renderGrants() {
  const list = document.getElementById('grant-list');
  if(!list) return;
  list.innerHTML = grantsData.map(g => `
    <div class="grant-item">
      <div class="grant-info">
        <h4>${g.title} <span class="text-muted" style="font-size: 0.8rem; font-weight: normal; margin-left: 0.5rem;">${g.id}</span></h4>
        <p>Expires/Decision: ${g.expires}</p>
      </div>
      <div style="text-align: right;">
        <div class="grant-amount">${g.amount}</div>
        <div style="margin-top: 0.3rem;">${getStatusBadge(g.status)}</div>
      </div>
    </div>
  `).join('');
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  renderRecentProjects();
  renderProjectsGrid();
  renderPublications();
  renderGrants();
});
