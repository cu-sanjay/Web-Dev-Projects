// --- Navigation & Tabs ---
const navItems = document.querySelectorAll('.sidebar-nav li');
const tabContents = document.querySelectorAll('.tab-content');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

function switchTab(targetTabId) {
  // Update Nav
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-tab') === targetTabId) {
      item.classList.add('active');
    }
  });

  // Show Content
  tabContents.forEach(tab => {
    tab.classList.add('hidden');
    tab.classList.remove('active');
    if (tab.id === targetTabId) {
      tab.classList.remove('hidden');
      // Add a tiny delay for CSS animation
      setTimeout(() => tab.classList.add('active'), 10);
    }
  });

  // Close Mobile Menu
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('mobile-open');
  }
}

navItems.forEach(item => {
  item.addEventListener('click', () => switchTab(item.getAttribute('data-tab')));
});

mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});

// --- Mock Data ---

const learningPaths = [
  { id: 1, title: "Frontend Master", desc: "Complete guide to modern frontend development with React & ecosystem.", color: "var(--blue)", icon: "ph-layout", courses: 12, hours: 45 },
  { id: 2, title: "Backend with Node.js", desc: "Learn to build scalable APIs and microservices using Express and NestJS.", color: "var(--green)", icon: "ph-database", courses: 8, hours: 30 },
  { id: 3, title: "UI/UX Foundations", desc: "Design principles, Figma mastery, and user research methodologies.", color: "var(--purple)", icon: "ph-bezier-curve", courses: 5, hours: 15 },
  { id: 4, title: "DevOps & Cloud", desc: "Docker, Kubernetes, CI/CD pipelines, and AWS fundamentals.", color: "var(--orange)", icon: "ph-cloud", courses: 10, hours: 50 }
];

const skills = {
  frontend: [
    { name: "React", level: "Advanced", progress: 85 },
    { name: "Vue.js", level: "Beginner", progress: 20 },
    { name: "Next.js", level: "Intermediate", progress: 60 }
  ],
  core: [
    { name: "JavaScript (ES6+)", level: "Advanced", progress: 90 },
    { name: "TypeScript", level: "Intermediate", progress: 55 },
    { name: "HTML/CSS", level: "Expert", progress: 95 }
  ],
  tools: [
    { name: "Git & GitHub", level: "Advanced", progress: 80 },
    { name: "Webpack / Vite", level: "Intermediate", progress: 50 },
    { name: "Figma", level: "Beginner", progress: 30 }
  ]
};

// --- Render Functions ---

function renderLearningPaths() {
  const container = document.getElementById('paths-container');
  if (!container) return;

  container.innerHTML = learningPaths.map(path => `
    <div class="path-card">
      <div class="path-header">
        <div class="path-icon" style="background-color: ${path.color}">
          <i class="ph ${path.icon}"></i>
        </div>
        <div class="path-info">
          <h3>${path.title}</h3>
          <p>${path.courses} Courses</p>
        </div>
      </div>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 1rem;">${path.desc}</p>
      <div class="path-meta">
        <span><i class="ph ph-clock"></i> ${path.hours} hours</span>
        <span><i class="ph ph-chart-bar"></i> All Levels</span>
      </div>
      <button class="btn outline-btn w-100 mt-3" style="width: 100%; justify-content: center;">Start Path</button>
    </div>
  `).join('');
}

function renderSkillsList(categoryId, dataArray) {
  const container = document.getElementById(categoryId);
  if (!container) return;

  container.innerHTML = dataArray.map(skill => {
    let barColor = 'var(--blue)';
    if (skill.progress > 75) barColor = 'var(--green)';
    if (skill.progress < 40) barColor = 'var(--orange)';

    return `
      <div class="skill-item">
        <div class="skill-header">
          <strong>${skill.name}</strong>
          <span class="level-badge">${skill.level}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar" style="width: ${skill.progress}%; background-color: ${barColor};"></div>
        </div>
      </div>
    `;
  }).join('');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  renderLearningPaths();
  renderSkillsList('skills-frontend', skills.frontend);
  renderSkillsList('skills-core', skills.core);
  renderSkillsList('skills-tools', skills.tools);
});
