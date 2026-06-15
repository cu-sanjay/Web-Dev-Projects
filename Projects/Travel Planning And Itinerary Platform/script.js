// --- Mock Data ---
const timelineEvents = [
  { time: "09:00 AM", title: "Arrive at Haneda Airport", type: "Flight", color: "blue", icon: "ph-airplane-landing", desc: "JL002 from San Francisco. Terminal 3." },
  { time: "11:30 AM", title: "Check-in at Shinjuku Prince Hotel", type: "Lodging", color: "purple", icon: "ph-bed", desc: "Confirmation #883920. Early check-in requested." },
  { time: "01:00 PM", title: "Lunch at Ichiran Ramen", type: "Food", color: "orange", icon: "ph-bowl-food", desc: "Famous tonkotsu ramen. Expect a small line." },
  { time: "03:00 PM", title: "Explore Shinjuku Gyoen National Garden", type: "Activity", color: "green", icon: "ph-tree", desc: "Beautiful autumn colors. Entry fee 500 JPY." }
];

const tripExpenses = [
  { category: "Flight", desc: "SFO to HND (Round Trip)", date: "Aug 12, 2026", amount: "$1,200" },
  { category: "Lodging", desc: "Shinjuku Prince Hotel (5 Nights)", date: "Aug 15, 2026", amount: "$850" },
  { category: "Transport", desc: "JR Pass (7 Days)", date: "Sep 01, 2026", amount: "$220" }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const navBtns = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');
  const dayTabs = document.querySelectorAll('.day-tab');

  // Initialization
  renderTimeline();
  renderExpenses();

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

  // Day Tab Switching (Visual Only)
  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if(!container) return;

    container.innerHTML = timelineEvents.map(e => `
      <div class="event-card">
        <div class="event-time">${e.time}</div>
        <div class="event-details">
          <div class="event-title">${e.title}</div>
          <div class="event-type text-${e.color}"><i class="ph-fill ${e.icon}"></i> ${e.type}</div>
          <div class="text-muted" style="font-size: 0.9rem;">${e.desc}</div>
        </div>
        <div>
          <button class="icon-btn"><i class="ph ph-dots-three-vertical"></i></button>
        </div>
      </div>
    `).join('');
  }

  function renderExpenses() {
    const tbody = document.getElementById('expenses-tbody');
    if(!tbody) return;

    tbody.innerHTML = tripExpenses.map(e => `
      <tr>
        <td><strong>${e.category}</strong></td>
        <td>${e.desc}</td>
        <td>${e.date}</td>
        <td><strong>${e.amount}</strong></td>
      </tr>
    `).join('');
  }
});
