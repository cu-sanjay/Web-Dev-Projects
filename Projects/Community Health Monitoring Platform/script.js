// --- Navigation & Sidebar Logic ---
const menuItems = document.querySelectorAll('.sidebar-menu li');
const tabContents = document.querySelectorAll('.tab-content');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    // Update Active State
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

const alerts = [
  { title: "High Influenza Rate", desc: "District 4 reporting a 15% WoW increase in flu symptoms.", time: "2 hours ago", type: "High" },
  { title: "Vaccine Shortage", desc: "Central Clinic running low on pediatric boosters.", time: "5 hours ago", type: "Medium" },
  { title: "Water Quality Advisory", desc: "Boil water notice issued for South Zone residents.", time: "1 day ago", type: "Critical" }
];

const outbreaks = [
  { zone: "North Zone / Dist 2", disease: "COVID-19", cases: 145, trend: "up", risk: "High" },
  { zone: "South Zone / Dist 7", disease: "Dengue Fever", cases: 32, trend: "down", risk: "Medium" },
  { zone: "East Zone / Dist 4", disease: "Influenza A", cases: 890, trend: "up", risk: "Critical" },
  { zone: "West Zone / Dist 1", disease: "Measles", cases: 4, trend: "stable", risk: "Low" }
];

const resources = [
  { name: "Central General Hospital", type: "Hospital", beds: "120/150", ventilators: "15/20", staff: "Adequate", icon: "ph-hospital", color: "var(--blue)" },
  { name: "Southside Community Clinic", type: "Clinic", beds: "12/20", ventilators: "0/0", staff: "Shortage", icon: "ph-house-line", color: "var(--green)" },
  { name: "East District Testing Center", type: "Testing Site", beds: "N/A", ventilators: "N/A", staff: "Adequate", icon: "ph-flask", color: "var(--purple)" },
  { name: "North Emergency Hub", type: "Trauma Center", beds: "45/50", ventilators: "8/10", staff: "Critical Need", icon: "ph-ambulance", color: "var(--red)" }
];

const documents = [
  { title: "Weekly Epidemiological Record", desc: "Week 42 Data Summary", date: "Oct 18, 2026", format: "PDF" },
  { title: "Influenza Advisory Guidelines", desc: "Updated protocols for healthcare workers", date: "Oct 15, 2026", format: "DOCX" },
  { title: "District 4 Resource Allocation", desc: "Logistics tracking sheet", date: "Oct 14, 2026", format: "XLSX" },
  { title: "Press Release: Vaccination Drive", desc: "Public awareness campaign materials", date: "Oct 10, 2026", format: "PDF" }
];

// --- Rendering Functions ---

function getRiskBadge(risk) {
  const r = risk.toLowerCase();
  if (r === 'critical') return `<span class="badge status-critical">${risk}</span>`;
  if (r === 'high') return `<span class="badge status-high">${risk}</span>`;
  if (r === 'medium') return `<span class="badge status-medium">${risk}</span>`;
  return `<span class="badge status-low">${risk}</span>`;
}

function getTrendIcon(trend) {
  if (trend === 'up') return `<span class="text-red"><i class="ph ph-trend-up"></i> Rising</span>`;
  if (trend === 'down') return `<span class="text-green"><i class="ph ph-trend-down"></i> Falling</span>`;
  return `<span class="text-muted"><i class="ph ph-minus"></i> Stable</span>`;
}

function renderAlerts() {
  const list = document.getElementById('alert-list');
  if(!list) return;

  list.innerHTML = alerts.map(a => `
    <li class="alert-item">
      <div class="alert-icon ${a.type === 'Critical' ? 'bg-red-light text-red' : a.type === 'High' ? 'bg-orange-light text-orange' : 'bg-blue-light text-blue'}">
        <i class="ph-fill ${a.type === 'Critical' ? 'ph-warning-circle' : 'ph-info'}"></i>
      </div>
      <div class="alert-info">
        <h4>${a.title}</h4>
        <p>${a.desc}</p>
        <div class="alert-meta">
          <span><i class="ph ph-clock"></i> ${a.time}</span>
          <span style="color: ${a.type === 'Critical' ? 'var(--red)' : 'var(--text-muted)'}; font-weight: 500;">Severity: ${a.type}</span>
        </div>
      </div>
    </li>
  `).join('');
}

function renderOutbreaks() {
  const tbody = document.getElementById('outbreaks-tbody');
  if(!tbody) return;

  tbody.innerHTML = outbreaks.map(o => `
    <tr>
      <td><strong>${o.zone}</strong></td>
      <td>${o.disease}</td>
      <td style="font-weight: 600; font-size: 1.05rem;">${o.cases}</td>
      <td>${getTrendIcon(o.trend)}</td>
      <td>${getRiskBadge(o.risk)}</td>
      <td>
        <button class="btn outline-btn btn-sm">Details</button>
      </td>
    </tr>
  `).join('');
}

function renderResources() {
  const grid = document.getElementById('resource-grid');
  if(!grid) return;

  grid.innerHTML = resources.map(r => `
    <div class="res-card">
      <div class="res-header">
        <div class="res-icon" style="background: ${r.color}20; color: ${r.color};"><i class="ph-fill ${r.icon}"></i></div>
        <div>
          <h3 class="res-title">${r.name}</h3>
          <span class="badge" style="background: var(--bg-page); border: 1px solid var(--border); color: var(--text-main); font-weight: normal;">${r.type}</span>
        </div>
      </div>
      <div class="res-body">
        <div class="res-stat"><span>Available Beds</span> <strong>${r.beds}</strong></div>
        <div class="res-stat"><span>Ventilators</span> <strong>${r.ventilators}</strong></div>
        <div class="res-stat">
          <span>Staff Status</span> 
          <strong style="color: ${r.staff.includes('Shortage') || r.staff.includes('Critical') ? 'var(--red)' : 'var(--green)'};">${r.staff}</strong>
        </div>
      </div>
    </div>
  `).join('');
}

function renderDocuments() {
  const list = document.getElementById('document-list');
  if(!list) return;

  list.innerHTML = documents.map(doc => `
    <div class="doc-item">
      <i class="ph-fill ph-file-${doc.format === 'PDF' ? 'pdf' : doc.format === 'XLSX' ? 'xls' : 'doc'} doc-icon" 
         style="color: ${doc.format === 'PDF' ? 'var(--red)' : doc.format === 'XLSX' ? 'var(--green)' : 'var(--blue)'};"></i>
      <div class="doc-info">
        <h4>${doc.title}</h4>
        <p>${doc.desc} • ${doc.date}</p>
      </div>
      <button class="icon-btn" style="border: none; background: transparent; color: var(--primary);"><i class="ph ph-download-simple"></i></button>
    </div>
  `).join('');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  renderAlerts();
  renderOutbreaks();
  renderResources();
  renderDocuments();
});
