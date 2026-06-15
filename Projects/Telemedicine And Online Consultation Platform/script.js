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

const doctors = [
  { id: 1, name: "Dr. Sarah Jenkins", specialty: "Cardiology", rating: "4.9", reviews: 124, img: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=0ea5e9&color=fff", available: true },
  { id: 2, name: "Dr. Marcus Chen", specialty: "Dermatology", rating: "4.8", reviews: 89, img: "https://ui-avatars.com/api/?name=Marcus+Chen&background=10b981&color=fff", available: false },
  { id: 3, name: "Dr. Emily Roberts", specialty: "Pediatrics", rating: "5.0", reviews: 201, img: "https://ui-avatars.com/api/?name=Emily+Roberts&background=8b5cf6&color=fff", available: true },
  { id: 4, name: "Dr. James Wilson", specialty: "General Practice", rating: "4.7", reviews: 156, img: "https://ui-avatars.com/api/?name=James+Wilson&background=f59e0b&color=fff", available: true },
  { id: 5, name: "Dr. Aisha Patel", specialty: "Neurology", rating: "4.9", reviews: 112, img: "https://ui-avatars.com/api/?name=Aisha+Patel&background=ef4444&color=fff", available: false }
];

const appointments = [
  { doctor: "Dr. Sarah Jenkins", specialty: "Cardiology", date: "Today, 2:30 PM", type: "Video Consult", status: "Confirmed", isRecent: true },
  { doctor: "Dr. Emily Roberts", specialty: "Pediatrics", date: "Oct 22, 10:00 AM", type: "Video Consult", status: "Pending", isRecent: true },
  { doctor: "Dr. James Wilson", specialty: "General Practice", date: "Sep 15, 1:15 PM", type: "In-Person", status: "Completed", isRecent: false },
  { doctor: "Dr. Marcus Chen", specialty: "Dermatology", date: "Aug 02, 11:30 AM", type: "Video Consult", status: "Completed", isRecent: false }
];

const documents = [
  { title: "Complete Blood Count (CBC)", date: "Oct 10, 2026", type: "Lab Result", icon: "ph-file-pdf", color: "var(--red)" },
  { title: "Lisinopril 10mg Prescription", date: "Sep 15, 2026", type: "Prescription", icon: "ph-pill", color: "var(--green)" },
  { title: "Annual Physical Summary", date: "Sep 15, 2026", type: "Visit Summary", icon: "ph-file-text", color: "var(--blue)" },
  { title: "Echocardiogram Report", date: "Jul 20, 2026", type: "Imaging", icon: "ph-image", color: "var(--purple)" }
];

// --- Rendering Functions ---

function getStatusBadge(status) {
  const s = status.toLowerCase();
  if (s === 'confirmed') return `<span class="badge status-confirmed">${status}</span>`;
  if (s === 'pending') return `<span class="badge status-pending">${status}</span>`;
  if (s === 'completed') return `<span class="badge status-completed">${status}</span>`;
  return `<span class="badge">${status}</span>`;
}

function renderDoctors() {
  const grid = document.getElementById('doctor-grid');
  if(!grid) return;

  grid.innerHTML = doctors.map(doc => `
    <div class="doctor-card">
      <img src="${doc.img}" alt="${doc.name}" class="doc-img">
      <h3 class="doc-name">${doc.name}</h3>
      <p class="doc-specialty">${doc.specialty}</p>
      
      <div class="doc-meta">
        <span class="doc-rating"><i class="ph-fill ph-star"></i> ${doc.rating} (${doc.reviews})</span>
      </div>
      
      <div style="width: 100%; display: flex; flex-direction: column; gap: 0.5rem; margin-top: auto;">
        <button class="btn primary-btn" style="width: 100%;" ${!doc.available ? 'disabled style="background: var(--text-muted);"' : ''}>
          ${doc.available ? 'Book Appointment' : 'Not Available'}
        </button>
        <button class="btn outline-btn" style="width: 100%;">View Profile</button>
      </div>
    </div>
  `).join('');
}

function renderAppointments() {
  const recentTbody = document.getElementById('recent-appointments-tbody');
  const allTbody = document.getElementById('all-appointments-tbody');

  const rowHtml = (app, showStatus = false) => `
    <tr>
      <td><strong>${app.doctor}</strong></td>
      <td>${app.specialty}</td>
      <td style="color: var(--primary); font-weight: 500;">${app.date}</td>
      <td><span class="badge" style="background: var(--bg-page); border: 1px solid var(--border); color: var(--text-main); font-weight: normal;"><i class="ph ${app.type.includes('Video') ? 'ph-video-camera' : 'ph-users'}"></i> ${app.type}</span></td>
      ${showStatus ? `<td>${getStatusBadge(app.status)}</td>` : ''}
      <td>
        <button class="btn outline-btn btn-sm">Details</button>
      </td>
    </tr>
  `;

  if(recentTbody) {
    recentTbody.innerHTML = appointments.filter(a => a.isRecent).map(a => rowHtml(a, false)).join('');
  }
  
  if(allTbody) {
    allTbody.innerHTML = appointments.map(a => rowHtml(a, true)).join('');
  }
}

function renderDocuments() {
  const list = document.getElementById('document-list');
  if(!list) return;

  list.innerHTML = documents.map(doc => `
    <div class="doc-item">
      <i class="ph-fill ${doc.icon} doc-icon" style="color: ${doc.color};"></i>
      <div class="doc-info">
        <h4>${doc.title}</h4>
        <p>${doc.type} • ${doc.date}</p>
      </div>
      <button class="icon-btn" style="border: none; background: transparent; color: var(--primary);"><i class="ph ph-download-simple"></i></button>
    </div>
  `).join('');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  renderDoctors();
  renderAppointments();
  renderDocuments();
});
