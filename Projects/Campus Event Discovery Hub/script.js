const mockEvents = [
  {
    id: 1,
    title: "Intro to Machine Learning Workshop",
    category: "Academic",
    date: "Oct 15, 2026 - 5:00 PM",
    location: "Engineering Center Rm 101",
    attendees: 42,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=400&q=80",
    attending: false
  },
  {
    id: 2,
    title: "Campus Fall Festival",
    category: "Social",
    date: "Oct 18, 2026 - 12:00 PM",
    location: "Main Quad",
    attendees: 350,
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=400&q=80",
    attending: false
  },
  {
    id: 3,
    title: "Intramural Basketball Finals",
    category: "Sports",
    date: "Oct 20, 2026 - 7:00 PM",
    location: "Recreation Center",
    attendees: 120,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80",
    attending: false
  },
  {
    id: 4,
    title: "Student Art Exhibition Opening",
    category: "Arts",
    date: "Oct 22, 2026 - 6:30 PM",
    location: "Fine Arts Gallery",
    attendees: 85,
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&q=80",
    attending: false
  },
  {
    id: 5,
    title: "Resume Review Session",
    category: "Academic",
    date: "Oct 25, 2026 - 3:00 PM",
    location: "Career Center",
    attendees: 28,
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&q=80",
    attending: false
  },
  {
    id: 6,
    title: "Board Game Night",
    category: "Social",
    date: "Oct 26, 2026 - 8:00 PM",
    location: "Student Union Lounge",
    attendees: 15,
    image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?auto=format&fit=crop&w=400&q=80",
    attending: false
  }
];

const eventsGrid = document.getElementById('events-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const resultsCount = document.getElementById('results-count');
const rsvpCountDisplay = document.getElementById('rsvp-count');

let myRsvps = 0;

function renderEvents(events) {
  eventsGrid.innerHTML = '';
  resultsCount.textContent = `Showing ${events.length} event${events.length !== 1 ? 's' : ''}`;
  
  if (events.length === 0) {
    eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light); padding: 2rem;">No events match your criteria.</p>';
    return;
  }

  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-image" style="background-image: url('${event.image}')">
        <span class="card-category">${event.category}</span>
      </div>
      <div class="card-content">
        <h4 class="card-title">${event.title}</h4>
        <div class="card-meta">
          <span>📅 ${event.date}</span>
          <span>📍 ${event.location}</span>
        </div>
        <div class="card-footer">
          <span class="attendees" id="attendees-${event.id}">👥 ${event.attendees} attending</span>
          <button class="btn btn-primary ${event.attending ? 'attending' : ''}" onclick="toggleRSVP(${event.id})">
            ${event.attending ? 'Cancel RSVP' : 'RSVP'}
          </button>
        </div>
      </div>
    `;
    eventsGrid.appendChild(card);
  });
}

window.toggleRSVP = function(id) {
  const event = mockEvents.find(e => e.id === id);
  if (event.attending) {
    event.attendees--;
    event.attending = false;
    myRsvps--;
  } else {
    event.attendees++;
    event.attending = true;
    myRsvps++;
  }
  
  rsvpCountDisplay.textContent = myRsvps;
  applyFilters(); // Re-render to update UI cleanly
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  
  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm) || event.location.toLowerCase().includes(searchTerm);
    const matchesCategory = category === 'all' || event.category === category;
    return matchesSearch && matchesCategory;
  });
  
  renderEvents(filteredEvents);
}

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);

// Initial render
renderEvents(mockEvents);
