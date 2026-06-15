// --- Mock Data ---
const upcomingSessions = [
  { partner: "Sarah Jenkins", skill: "Advanced React Patterns", role: "Learning", date: "Tomorrow, 2:00 PM", status: "Confirmed" },
  { partner: "David Chen", skill: "Guitar Basics", role: "Teaching", date: "Oct 18, 5:00 PM", status: "Confirmed" },
  { partner: "Elena Rodriguez", skill: "Spanish Conversation", role: "Learning", date: "Oct 20, 10:00 AM", status: "Pending" }
];

const leaderboard = [
  { name: "David Chen", points: 1250, badge: "Master Mentor" },
  { name: "Sarah Jenkins", points: 980, badge: "Expert Guide" },
  { name: "Michael Chang", points: 850, badge: "Community Helper" }
];

const marketSkills = [
  { user: "Sarah Jenkins", type: "Offer", title: "Advanced React & Next.js", cost: 50, category: "Programming" },
  { user: "David Chen", type: "Offer", title: "Beginner Acoustic Guitar", cost: 30, category: "Music" },
  { user: "Elena Rodriguez", type: "Offer", title: "Conversational Spanish", cost: 40, category: "Languages" },
  { user: "Michael Chang", type: "Request", title: "Need help with UI/UX Design", cost: 60, category: "Design" },
  { user: "Emma Wilson", type: "Offer", title: "Python Data Analysis", cost: 45, category: "Programming" },
  { user: "James Smith", type: "Request", title: "Looking for Piano Lessons", cost: 35, category: "Music" }
];

const activeOffers = [
  { title: "Intro to CSS Grid & Flexbox", sessions: 12, rating: 4.9 },
  { title: "JavaScript Debugging Tips", sessions: 5, rating: 4.7 }
];

const pendingRequests = [
  { user: "Alex Johnson", skill: "Intro to CSS Grid", msg: "Hey Vishwa, I'm struggling with layout. Can we chat?" },
  { user: "Sam Smith", skill: "JS Debugging", msg: "I have a weird bug in my app, need your eyes!" }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const navTabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.tab-content');

  // Initialization
  renderDashboard();
  renderMarket();
  renderOfferings();

  // Tab Switching
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      
      // Update Active Classes
      navTabs.forEach(t => t.classList.remove('active'));
      // Find all tabs with this data-tab (for mobile and desktop sync)
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
    let cls = status === 'Confirmed' ? 'success' : 'warning';
    return `<span class="badge ${cls}">${status}</span>`;
  }

  function renderDashboard() {
    // Upcoming
    const tbody = document.getElementById('upcoming-tbody');
    if(tbody) {
      tbody.innerHTML = upcomingSessions.map(s => `
        <tr>
          <td><strong>${s.partner}</strong></td>
          <td>${s.skill}</td>
          <td><span class="badge ${s.role === 'Teaching' ? 'primary' : ''}">${s.role}</span></td>
          <td>${s.date}</td>
          <td>${getStatusBadge(s.status)}</td>
        </tr>
      `).join('');
    }

    // Leaderboard
    const leaderList = document.getElementById('leaderboard-list');
    if(leaderList) {
      leaderList.innerHTML = leaderboard.map((l, index) => `
        <div class="list-item">
          <div class="flex-center" style="gap: 1rem;">
            <div style="font-weight:bold; color:var(--text-muted); width: 20px;">#${index+1}</div>
            <img src="https://ui-avatars.com/api/?name=${l.name.replace(' ', '+')}&background=random&color=fff" style="width: 36px; border-radius: 50%;">
            <div>
              <div style="font-weight: 500;">${l.name}</div>
              <div style="font-size: 0.75rem; color: var(--primary);">${l.badge}</div>
            </div>
          </div>
          <div style="font-weight: 600;">${l.points} pts</div>
        </div>
      `).join('');
    }
  }

  function renderMarket() {
    const grid = document.getElementById('market-grid');
    if(grid) {
      grid.innerHTML = marketSkills.map(s => `
        <div class="skill-card">
          <div class="skill-header">
            <div class="skill-user">
              <img src="https://ui-avatars.com/api/?name=${s.user.replace(' ', '+')}&background=random&color=fff">
              <div>
                <h4>${s.user}</h4>
                <span>${s.type === 'Offer' ? 'is offering to teach' : 'is requesting to learn'}</span>
              </div>
            </div>
            <div class="skill-cost">
              ${s.cost} <i class="ph-fill ph-coin"></i>
            </div>
          </div>
          <div class="skill-title">${s.title}</div>
          <div class="mt-2 flex-between">
            <span class="badge">${s.category}</span>
            <button class="btn outline-btn btn-sm">${s.type === 'Offer' ? 'Request' : 'Offer Help'}</button>
          </div>
        </div>
      `).join('');
    }
  }

  function renderOfferings() {
    // Active Offers
    const offersList = document.getElementById('active-offers-list');
    if(offersList) {
      offersList.innerHTML = activeOffers.map(o => `
        <div class="list-item">
          <div>
            <div style="font-weight: 600; font-size: 1.05rem;">${o.title}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">
              <i class="ph-fill ph-users"></i> ${o.sessions} sessions taught &nbsp;|&nbsp; <i class="ph-fill ph-star text-orange"></i> ${o.rating} rating
            </div>
          </div>
          <button class="btn outline-btn btn-sm">Edit</button>
        </div>
      `).join('');
    }

    // Pending Requests
    const reqTbody = document.getElementById('pending-requests-tbody');
    if(reqTbody) {
      reqTbody.innerHTML = pendingRequests.map(r => `
        <tr>
          <td><strong>${r.user}</strong></td>
          <td><span class="badge primary">${r.skill}</span></td>
          <td><span style="font-size: 0.85rem; color: var(--text-muted);">"${r.msg}"</span></td>
          <td>
            <div class="flex-center" style="gap: 0.5rem; justify-content: flex-start;">
              <button class="btn primary-btn btn-sm">Accept</button>
              <button class="btn outline-btn btn-sm">Decline</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }
});
