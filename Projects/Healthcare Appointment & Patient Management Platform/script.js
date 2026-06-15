// --- DOM Elements ---
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const roleBtns = document.querySelectorAll('.role-btn');
const logoutBtn = document.getElementById('logout-btn');

const patientNav = document.getElementById('patient-nav');
const doctorNav = document.getElementById('doctor-nav');
const viewTitle = document.getElementById('view-title');
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');
const welcomeNames = document.querySelectorAll('.u-name');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');

let currentRole = 'patient'; // default

// --- Auth Logic ---
roleBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    roleBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentRole = e.target.getAttribute('data-role');
  });
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const name = email.split('@')[0] || "User";
  
  // Set session
  localStorage.setItem('hc_session', JSON.stringify({ role: currentRole, name }));
  
  initApp();
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('hc_session');
  appScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
  loginForm.reset();
});

// --- App Initialization ---
function initApp() {
  const session = JSON.parse(localStorage.getItem('hc_session'));
  if (!session) {
    appScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');
    return;
  }

  // Show App, Hide Auth
  authScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');

  // Populate User Info
  const formattedName = session.name.charAt(0).toUpperCase() + session.name.slice(1);
  userNameEl.textContent = formattedName;
  welcomeNames.forEach(el => el.textContent = formattedName);
  
  userAvatarEl.src = `https://ui-avatars.com/api/?name=${formattedName}&background=${session.role === 'doctor' ? '059669' : '0284c7'}&color=fff`;

  // Setup Navigation based on Role
  patientNav.classList.add('hidden');
  doctorNav.classList.add('hidden');
  
  const activeNav = session.role === 'patient' ? patientNav : doctorNav;
  activeNav.classList.remove('hidden');

  // Setup Nav Click Listeners
  const navItems = activeNav.querySelectorAll('li');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Update active class
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      // Update Title
      viewTitle.textContent = item.textContent.trim();
      
      // Show View
      const targetView = item.getAttribute('data-view');
      document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
      document.getElementById(targetView).classList.remove('hidden');
      
      // Close mobile sidebar
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('mobile-open');
      }
    });
  });

  // Trigger default view (Dashboard)
  navItems[0].click();
  
  if (session.role === 'patient') {
    renderPatientAppointments();
  }
}

// --- Mobile Menu ---
mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});

// --- Patient: Appointment Booking ---
const bookForm = document.getElementById('book-form');
const patientAptList = document.getElementById('patient-apt-list');

let patientAppointments = [
  { doc: "Dr. Sarah Smith", dept: "Cardiology", date: "2026-10-16", time: "10:30 AM" }
];

if (bookForm) {
  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dept = bookForm.querySelectorAll('select')[0].value;
    const doc = bookForm.querySelectorAll('select')[1].value;
    const date = bookForm.querySelector('input[type="date"]').value;
    const time = bookForm.querySelector('input[type="time"]').value;
    
    patientAppointments.push({ doc, dept, date, time });
    renderPatientAppointments();
    bookForm.reset();
    
    alert("Appointment successfully booked!");
  });
}

function renderPatientAppointments() {
  if (!patientAptList) return;
  patientAptList.innerHTML = patientAppointments.map(apt => `
    <div class="appointment-card border-blue">
      <div class="apt-date">
        <strong>${new Date(apt.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</strong>
        <span>${apt.time}</span>
      </div>
      <div class="apt-info">
        <h4>${apt.doc}</h4>
        <p>${apt.dept}</p>
      </div>
    </div>
  `).join('');
}

// Boot
if (localStorage.getItem('hc_session')) {
  initApp();
}
