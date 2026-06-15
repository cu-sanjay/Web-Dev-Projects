// Navigation Logic
const navItems = document.querySelectorAll('.sidebar-nav li');
const tabContents = document.querySelectorAll('.tab-content');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    // Update active nav
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    // Show correct tab
    const targetTab = item.getAttribute('data-tab');
    tabContents.forEach(tab => {
      tab.classList.remove('active');
      if (tab.id === targetTab) tab.classList.add('active');
    });

    // Close mobile menu
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('mobile-open');
    }
  });
});

// "View All" button on dashboard
document.querySelector('.view-all-btn').addEventListener('click', () => {
  const coursesNav = document.querySelector('.sidebar-nav li[data-tab="courses"]');
  coursesNav.click();
});

mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});

// Mock Data
const activeCourses = [
  { id: 1, name: "Introduction to Computer Science", code: "CS101", progress: 75, color: "#3b82f6", instructor: "Dr. Smith", img: "https://ui-avatars.com/api/?name=Dr.+Smith&background=random" },
  { id: 2, name: "Calculus II", code: "MATH201", progress: 40, color: "#10b981", instructor: "Prof. Johnson", img: "https://ui-avatars.com/api/?name=Prof.+Johnson&background=random" },
  { id: 3, name: "World History", code: "HIST105", progress: 90, color: "#f59e0b", instructor: "Dr. Lee", img: "https://ui-avatars.com/api/?name=Dr.+Lee&background=random" },
  { id: 4, name: "Physics: Mechanics", code: "PHYS110", progress: 15, color: "#ef4444", instructor: "Dr. Brown", img: "https://ui-avatars.com/api/?name=Dr.+Brown&background=random" }
];

const catalogCourses = [
  ...activeCourses,
  { id: 5, name: "Data Structures", code: "CS201", progress: 0, color: "#8b5cf6", instructor: "Dr. Turing", img: "https://ui-avatars.com/api/?name=Dr.+Turing&background=random" },
  { id: 6, name: "Organic Chemistry", code: "CHEM202", progress: 0, color: "#0ea5e9", instructor: "Dr. Curie", img: "https://ui-avatars.com/api/?name=Dr.+Curie&background=random" }
];

const assignments = [
  { id: 1, name: "Binary Tree Implementation", course: "CS101", due: "2026-06-20", status: "pending" },
  { id: 2, name: "Integration Worksheet", course: "MATH201", due: "2026-06-22", status: "pending" },
  { id: 3, name: "Midterm Essay", course: "HIST105", due: "2026-06-18", status: "submitted" },
  { id: 4, name: "Kinematics Lab Report", course: "PHYS110", due: "2026-06-10", status: "graded" }
];

// Render Functions
function renderDashboardCourses() {
  const container = document.getElementById('dashboard-courses');
  container.innerHTML = activeCourses.slice(0, 3).map(course => `
    <div class="course-list-item">
      <div class="course-icon-box" style="background-color: ${course.color};">
        <i class="ph ph-book-open"></i>
      </div>
      <div class="course-info">
        <h4>${course.name}</h4>
        <p>${course.code} • ${course.instructor}</p>
      </div>
      <div class="progress-container">
        <div class="progress-bar-bg">
          <div class="progress-bar" style="width: ${course.progress}%"></div>
        </div>
        <span class="progress-text">${course.progress}%</span>
      </div>
    </div>
  `).join('');
}

function renderDeadlines() {
  const container = document.getElementById('dashboard-deadlines');
  const pending = assignments.filter(a => a.status === 'pending').slice(0, 3);
  
  container.innerHTML = pending.map(task => {
    const d = new Date(task.due);
    const mon = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();
    return `
      <li class="deadline-item">
        <div class="deadline-date">
          <div class="d-mon">${mon}</div>
          <div class="d-day">${day}</div>
        </div>
        <div class="deadline-info">
          <h4>${task.name}</h4>
          <p>${task.course}</p>
        </div>
      </li>
    `;
  }).join('');
}

function renderCourseGrid(containerId, courses, showProgress = true) {
  const container = document.getElementById(containerId);
  container.innerHTML = courses.map(course => `
    <div class="course-card">
      <div class="course-banner" style="background: linear-gradient(135deg, ${course.color}88 0%, ${course.color} 100%);">
        <span class="badge-tag">${course.code}</span>
      </div>
      <div class="course-card-content">
        <h3>${course.name}</h3>
        <p>A comprehensive overview covering the core concepts and applications.</p>
        
        ${showProgress ? `
          <div class="progress-container" style="width: 100%; margin-bottom: 1rem;">
            <div class="progress-bar-bg">
              <div class="progress-bar" style="width: ${course.progress}%; background: ${course.color}"></div>
            </div>
            <span class="progress-text">${course.progress}%</span>
          </div>
        ` : ''}

        <div class="course-meta">
          <div class="instructor">
            <img src="${course.img}" alt="Instructor">
            <span>${course.instructor}</span>
          </div>
          ${!showProgress ? `<button class="btn outline-btn btn-small">Enroll</button>` : `<button class="text-btn" style="color: ${course.color}">Go to class</button>`}
        </div>
      </div>
    </div>
  `).join('');
}

function renderAssignments() {
  const tbody = document.getElementById('assignments-table-body');
  tbody.innerHTML = assignments.map(a => `
    <tr>
      <td><strong>${a.name}</strong></td>
      <td>${a.course}</td>
      <td>${new Date(a.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td><span class="status-badge status-${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
      <td>
        ${a.status === 'pending' ? '<button class="btn primary-btn btn-small">Submit</button>' : '<button class="btn outline-btn btn-small">View</button>'}
      </td>
    </tr>
  `).join('');
}

// Initialize
renderDashboardCourses();
renderDeadlines();
renderCourseGrid('full-course-grid', activeCourses, true);
renderCourseGrid('catalog-grid', catalogCourses, false);
renderAssignments();
